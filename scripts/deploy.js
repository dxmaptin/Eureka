const { ethers, network } = require("hardhat");
require('dotenv').config();

async function main() {
  // Load configuration from environment variables
  const myNFTAddress = process.env.MYNFT_CONTRACT_ADDRESS;
  const vrfCoordinatorV2Plus = process.env.VRF_COORDINATOR_V2_PLUS;
  const vrfSubscriptionId = process.env.VRF_SUBSCRIPTION_ID;
  const vrfKeyHash = process.env.VRF_KEY_HASH;
  const vrfCallbackGasLimit = Number(process.env.VRF_CALLBACK_GAS_LIMIT || 200000);
  const vrfRequestConfirmations = Number(process.env.VRF_REQUEST_CONFIRMATIONS || 3);
  
  // Validate required environment variables
  if (!myNFTAddress) {
    throw new Error("Missing MYNFT_CONTRACT_ADDRESS in environment variables");
  }
  if (!vrfCoordinatorV2Plus) {
    throw new Error("Missing VRF_COORDINATOR_V2_PLUS in environment variables");
  }
  if (!vrfSubscriptionId) {
    throw new Error("Missing VRF_SUBSCRIPTION_ID in environment variables");
  }
  if (!vrfKeyHash) {
    throw new Error("Missing VRF_KEY_HASH in environment variables");
  }
  
  console.log("Deploying MysteryBoxV2 following exact Chainlink pattern...");
  console.log("Network:", network.name);
  console.log("MyNFT Address:", myNFTAddress);
  console.log("VRF Coordinator:", vrfCoordinatorV2Plus);
  console.log("VRF Subscription ID:", vrfSubscriptionId);
  console.log("Key Hash:", vrfKeyHash);
  console.log("Callback Gas Limit:", vrfCallbackGasLimit);
  console.log("Request Confirmations:", vrfRequestConfirmations);

  // Deploy contract - exact pattern from Chainlink
  const MysteryBoxV2 = await ethers.getContractFactory("MysteryBoxV2");
  const constructorArguments = [
    myNFTAddress,             // MyNFT contract
    vrfCoordinatorV2Plus,     // VRF Coordinator V2Plus
    vrfSubscriptionId,        // VRF Subscription ID
    vrfKeyHash,               // VRF Key Hash
    vrfCallbackGasLimit,      // Callback gas limit
    vrfRequestConfirmations   // Request confirmations
  ];

  const mysteryBoxV2 = await MysteryBoxV2.deploy(...constructorArguments);
  await mysteryBoxV2.waitForDeployment();
  const contractAddress = await mysteryBoxV2.getAddress();
  
  console.log("MysteryBoxV2 deployed to:", contractAddress);

  // Verify deployment
  console.log("\nVerifying deployment...");
  const deployedVRFCoordinator = await mysteryBoxV2.getVRFCoordinator();
  const deployedSubId = await mysteryBoxV2.getSubscriptionId();
  const deployedKeyHash = await mysteryBoxV2.getKeyHash();
  const deployedOwner = await mysteryBoxV2.owner();
  const boxPrice = await mysteryBoxV2.boxPrice();
  
  console.log("- VRF Coordinator:", deployedVRFCoordinator);
  console.log("- Subscription ID:", deployedSubId.toString());
  console.log("- Key Hash:", deployedKeyHash);
  console.log("- Owner:", deployedOwner);
  console.log("- Box Price:", ethers.formatEther(boxPrice), "ETH");

  console.log("\nIMPORTANT NEXT STEPS:");
  console.log("1. Add this contract as consumer to your VRF subscription:");
  console.log(`   Contract Address: ${contractAddress}`);
  console.log(`   Subscription ID: ${vrfSubscriptionId}`);
  console.log("2. Add prizes using addPrizeURI()");
  console.log("3. Update your frontend to use this new contract address");
  console.log("4. Test the purchase flow - VRF should now work with proper inheritance!");
  
  console.log("\nThis implementation follows Chainlink's exact VRF pattern with proper inheritance");

  return contractAddress;
}

main()
  .then((address) => {
    console.log(`\nDeployment completed successfully at: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });