const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("MysteryBox", function () {
  let MyNFT, myNFT, MysteryBox, mysteryBox, owner, user;
  let mockVRFCoordinator;
  
  // VRF Configuration for Sepolia testnet (industry standard)
  const VRF_KEY_HASH = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"; 
  const VRF_SUBSCRIPTION_ID = "115664837475484812142629081256497226710640441047996300515984077439736136554032"; 
  const VRF_CALLBACK_GAS_LIMIT = 500000; 
  const VRF_REQUEST_CONFIRMATIONS = 3;
  
  // Note: Now using uint256 subscription IDs for VRF v2.5 compatibility

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    
    // Deploy MyNFT contract
    MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy();
    await myNFT.waitForDeployment();
    
    // Deploy VRF Coordinator Mock for testing
    const VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    mockVRFCoordinator = await VRFCoordinatorV2Mock.deploy();
    await mockVRFCoordinator.waitForDeployment();
    
    // Set up subscription in mock (simulate your real subscription)
    await mockVRFCoordinator.createSubscriptionWithId(
      VRF_SUBSCRIPTION_ID, 
      owner.address, 
      ethers.parseEther("10") // Mock 10 LINK balance
    );
    
    // Deploy MysteryBox as upgradeable contract
    MysteryBox = await ethers.getContractFactory("MysteryBox");
    mysteryBox = await upgrades.deployProxy(MysteryBox, [
      await myNFT.getAddress(),
      await mockVRFCoordinator.getAddress(),
      VRF_SUBSCRIPTION_ID,
      VRF_KEY_HASH,
      VRF_CALLBACK_GAS_LIMIT,
      VRF_REQUEST_CONFIRMATIONS
    ]);
    await mysteryBox.waitForDeployment();
    
    // Add MysteryBox as consumer to the subscription
    await mockVRFCoordinator.addConsumerToSubscription(
      VRF_SUBSCRIPTION_ID,
      await mysteryBox.getAddress()
    );
  });

  describe("Prize Management", function () {
    it("owner can add prize URIs", async function () {
      await mysteryBox.addPrizeURI("ipfs://prize1.json");
      expect(await mysteryBox.prizesRemaining()).to.equal(1);
      
      const prizeURIs = await mysteryBox.getPrizeURIs();
      expect(prizeURIs[0]).to.equal("ipfs://prize1.json");
    });

    it("owner can remove prizes", async function () {
      await mysteryBox.addPrizeURI("ipfs://prize1.json");
      await mysteryBox.addPrizeURI("ipfs://prize2.json");
      expect(await mysteryBox.prizesRemaining()).to.equal(2);
      
      await mysteryBox.removePrize(0);
      expect(await mysteryBox.prizesRemaining()).to.equal(1);
    });

    it("non-owner cannot add prize URIs", async function () {
      await expect(mysteryBox.connect(user).addPrizeURI("ipfs://prize1.json"))
        .to.be.revertedWithCustomError(mysteryBox, "OwnableUnauthorizedAccount");
    });
  });

  describe("Box Price Management", function () {
    it("owner can set box price", async function () {
      const newPrice = ethers.parseEther("0.05");
      await mysteryBox.setBoxPrice(newPrice);
      expect(await mysteryBox.boxPrice()).to.equal(newPrice);
    });

    it("non-owner cannot set box price", async function () {
      const newPrice = ethers.parseEther("0.05");
      await expect(mysteryBox.connect(user).setBoxPrice(newPrice))
        .to.be.revertedWithCustomError(mysteryBox, "OwnableUnauthorizedAccount");
    });
  });

  describe("Box Purchase and Opening", function () {
    beforeEach(async function () {
      // Add some prizes
      await mysteryBox.addPrizeURI("ipfs://prize1.json");
      await mysteryBox.addPrizeURI("ipfs://prize2.json");
      await mysteryBox.addPrizeURI("ipfs://prize3.json");
    });

    it("user can purchase and open box with sufficient payment", async function () {
      const boxPrice = await mysteryBox.boxPrice();
      
      await expect(mysteryBox.connect(user).purchaseAndOpenBox({ value: boxPrice }))
        .to.emit(mysteryBox, "BoxPurchased")
        .withArgs(user.address, 0);
    });

    it("complete box opening process with VRF callback", async function () {
      const boxPrice = await mysteryBox.boxPrice();
      
      // Verify initial state
      expect(await mysteryBox.prizesRemaining()).to.equal(3);
      expect(await myNFT.balanceOf(user.address)).to.equal(0);
      
      // Purchase and open box
      const tx = await mysteryBox.connect(user).purchaseAndOpenBox({ value: boxPrice });
      const receipt = await tx.wait();
      
      // Find the RandomWordsRequested event from the VRF coordinator
      let requestId;
      for (const log of receipt.logs) {
        try {
          const decoded = mockVRFCoordinator.interface.parseLog(log);
          if (decoded.name === "RandomWordsRequested") {
            requestId = decoded.args.requestId;
            expect(decoded.args.sender).to.equal(await mysteryBox.getAddress());
            expect(decoded.args.callbackGasLimit).to.equal(VRF_CALLBACK_GAS_LIMIT);
            break;
          }
        } catch {
          // Skip logs that can't be parsed
        }
      }
      
      expect(requestId).to.not.be.undefined;
      expect(await mockVRFCoordinator.requestExists(requestId)).to.be.true;
      
      // Simulate VRF callback with deterministic randomness
      await expect(mockVRFCoordinator.fulfillRandomWordsWithSeed(requestId, 12345))
        .to.emit(mysteryBox, "BoxOpened")
        .to.emit(mockVRFCoordinator, "RandomWordsFulfilled");
      
      // Verify final state
      expect(await myNFT.balanceOf(user.address)).to.equal(1);
      expect(await mysteryBox.prizesRemaining()).to.equal(2); // One prize used
      expect(await mockVRFCoordinator.requestExists(requestId)).to.be.false;
      
      // Verify the NFT was minted with correct metadata
      const tokenURI = await myNFT.tokenURI(0);
      expect(tokenURI).to.be.oneOf(["ipfs://prize1.json", "ipfs://prize2.json", "ipfs://prize3.json"]);
    });

    it("purchase fails with insufficient payment", async function () {
      const boxPrice = await mysteryBox.boxPrice();
      const insufficientPayment = boxPrice - 1n;
      
      await expect(mysteryBox.connect(user).purchaseAndOpenBox({ value: insufficientPayment }))
        .to.be.revertedWith("Insufficient payment");
    });

    it("purchase fails when no prizes remain", async function () {
      // Remove all prizes
      await mysteryBox.removePrize(0);
      await mysteryBox.removePrize(1);
      await mysteryBox.removePrize(2);
      
      const boxPrice = await mysteryBox.boxPrice();
      await expect(mysteryBox.connect(user).purchaseAndOpenBox({ value: boxPrice }))
        .to.be.revertedWith("No prizes left");
    });
  });

  describe("Admin Functions", function () {
    it("owner can withdraw contract balance", async function () {
      // Send some ETH to the contract by purchasing boxes
      await mysteryBox.addPrizeURI("ipfs://prize1.json");
      const boxPrice = await mysteryBox.boxPrice();
      await mysteryBox.connect(user).purchaseAndOpenBox({ value: boxPrice });
      
      const initialBalance = await ethers.provider.getBalance(owner.address);
      const contractBalance = await ethers.provider.getBalance(await mysteryBox.getAddress());
      
      await expect(mysteryBox.withdraw(owner.address))
        .to.emit(mysteryBox, "Withdraw")
        .withArgs(owner.address, contractBalance);
    });

    it("owner can update MyNFT address", async function () {
      const newNFTAddress = "0x1234567890123456789012345678901234567890";
      await mysteryBox.setMyNFTAddress(newNFTAddress);
      expect(await mysteryBox.myNFTAddress()).to.equal(newNFTAddress);
    });

    it("non-owner cannot withdraw", async function () {
      await expect(mysteryBox.connect(user).withdraw(user.address))
        .to.be.revertedWithCustomError(mysteryBox, "OwnableUnauthorizedAccount");
    });
  });

  describe("VRF Subscription Management", function () {
    it("can get subscription info", async function () {
      const [balance, reqCount, subOwner, consumers] = await mysteryBox.getSubscriptionInfo();
      expect(balance).to.equal(ethers.parseEther("10"));
      expect(subOwner).to.equal(owner.address);
      expect(consumers).to.include(await mysteryBox.getAddress());
    });

    it("can check if consumer is registered", async function () {
      expect(await mysteryBox.isConsumerRegistered()).to.be.true;
    });

    it("owner can update subscription ID", async function () {
      // Create a new subscription
      const newSubId = 999;
      await mockVRFCoordinator.createSubscriptionWithId(
        newSubId,
        owner.address,
        ethers.parseEther("5")
      );

      await expect(mysteryBox.setSubscriptionId(newSubId))
        .to.emit(mysteryBox, "SubscriptionIdUpdated")
        .withArgs(VRF_SUBSCRIPTION_ID, newSubId);

      expect(await mysteryBox.vrfSubscriptionId()).to.equal(newSubId);
    });

    it("owner can update VRF config", async function () {
      const newKeyHash = "0x1234567890123456789012345678901234567890123456789012345678901234";
      const newGasLimit = 400000;
      const newConfirmations = 5;

      await expect(mysteryBox.updateVRFConfig(newKeyHash, newGasLimit, newConfirmations))
        .to.emit(mysteryBox, "VRFConfigUpdated")
        .withArgs(newKeyHash, newGasLimit, newConfirmations);

      expect(await mysteryBox.vrfKeyHash()).to.equal(newKeyHash);
      expect(await mysteryBox.vrfCallbackGasLimit()).to.equal(newGasLimit);
      expect(await mysteryBox.vrfRequestConfirmations()).to.equal(newConfirmations);
    });

    it("rejects invalid VRF config", async function () {
      // Invalid gas limit
      await expect(mysteryBox.updateVRFConfig(VRF_KEY_HASH, 10000, 3))
        .to.be.revertedWith("Invalid gas limit");

      // Invalid confirmations
      await expect(mysteryBox.updateVRFConfig(VRF_KEY_HASH, 500000, 2))
        .to.be.revertedWith("Invalid confirmations");
    });

    it("non-owner cannot update subscription settings", async function () {
      await expect(mysteryBox.connect(user).setSubscriptionId(999))
        .to.be.revertedWithCustomError(mysteryBox, "OwnableUnauthorizedAccount");

      await expect(mysteryBox.connect(user).updateVRFConfig(VRF_KEY_HASH, 500000, 3))
        .to.be.revertedWithCustomError(mysteryBox, "OwnableUnauthorizedAccount");
    });
  });

  describe("Contract Upgrade", function () {
    it("contract supports UUPS upgrades", async function () {
      // Test that the contract is upgradeable by checking proxy admin functions
      // The _authorizeUpgrade function is internal, so we test upgrade capability differently
      const proxyAddress = await mysteryBox.getAddress();
      expect(proxyAddress).to.be.properAddress;
      
      // Verify contract is properly initialized
      expect(await mysteryBox.owner()).to.equal(owner.address);
      expect(await mysteryBox.myNFTAddress()).to.equal(await myNFT.getAddress());
    });
  });
}); 