// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

// Interface for the main MyNFT contract
interface IMyNFT {
    function mintNFT(address to, string memory tokenURI) external returns (uint256);
}

/**
 * @title MysteryBox
 * @dev Industry-level lootbox contract for NFT ticketing, using Chainlink VRF and UUPS upgradability.
 */
contract MysteryBox is UUPSUpgradeable, OwnableUpgradeable {
    // Chainlink VRF variables
    VRFCoordinatorV2Interface public COORDINATOR;
    uint64 public vrfSubscriptionId;
    bytes32 public vrfKeyHash;
    uint32 public vrfCallbackGasLimit;
    uint16 public vrfRequestConfirmations;
    uint32 public vrfNumWords;

    // Prize pool: array of available prize URIs
    string[] private prizeURIs;
    // Mapping to track which prizes are still available
    mapping(uint256 => bool) private isPrizeAvailable;
    // Number of prizes remaining
    uint256 public prizesRemaining;

    // Box price (editable by owner)
    uint256 public boxPrice;

    // MyNFT contract
    address public myNFTAddress;
    IMyNFT public myNFT;

    // Box counter
    uint256 private _boxId;
    // Mapping requestId to opener info
    struct OpenRequest {
        address user;
        uint256 boxId;
    }
    mapping(uint256 => OpenRequest) public openRequests;

    // Events
    event BoxPurchased(address indexed user, uint256 boxId);
    event BoxOpened(address indexed user, uint256 boxId, uint256 prizeTokenId, string prizeURI);
    event PrizeAdded(string prizeURI);
    event PrizeRemoved(string prizeURI);
    event BoxPriceUpdated(uint256 newPrice);
    event Withdraw(address indexed to, uint256 amount);

    //  Initializer (replaces constructor for upgradeable contracts) 
    function initialize(
        address _myNFTAddress,
        address _vrfCoordinator,
        uint64 _vrfSubscriptionId,
        bytes32 _vrfKeyHash,
        uint32 _vrfCallbackGasLimit,
        uint16 _vrfRequestConfirmations
    ) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        vrfSubscriptionId = _vrfSubscriptionId;
        vrfKeyHash = _vrfKeyHash;
        vrfCallbackGasLimit = _vrfCallbackGasLimit;
        vrfRequestConfirmations = _vrfRequestConfirmations;
        vrfNumWords = 1;
        myNFTAddress = _myNFTAddress;
        myNFT = IMyNFT(_myNFTAddress);
        boxPrice = 0.01 ether; // Default price, editable by owner
    }

    // Prize Pool Management (This is owner only) 
    function addPrizeURI(string memory uri) external onlyOwner {
        prizeURIs.push(uri);
        isPrizeAvailable[prizeURIs.length - 1] = true;
        prizesRemaining++;
        emit PrizeAdded(uri);
    }

    function removePrize(uint256 index) external onlyOwner {
        require(index < prizeURIs.length, "Invalid index");
        require(isPrizeAvailable[index], "Already removed");
        isPrizeAvailable[index] = false;
        prizesRemaining--;
        emit PrizeRemoved(prizeURIs[index]);
    }

    function getPrizeURIs() external view returns (string[] memory) {
        return prizeURIs;
    }

    //  Box Price Management (owner only) 
    function setBoxPrice(uint256 newPrice) external onlyOwner {
        boxPrice = newPrice;
        emit BoxPriceUpdated(newPrice);
    }

    //  Box Purchase & Opening 
    function purchaseAndOpenBox() external payable returns (uint256) {
        require(msg.value >= boxPrice, "Insufficient payment");
        require(prizesRemaining > 0, "No prizes left");
        uint256 boxId = _boxId++;
        emit BoxPurchased(msg.sender, boxId);
        // Request randomness from Chainlink VRF
        uint256 requestId = COORDINATOR.requestRandomWords(
            vrfKeyHash,
            vrfSubscriptionId,
            vrfRequestConfirmations,
            vrfCallbackGasLimit,
            vrfNumWords
        );
        openRequests[requestId] = OpenRequest({user: msg.sender, boxId: boxId});
        return boxId;
    }

    // Only allow the VRF coordinator to call fulfillRandomWords
    modifier onlyVRFCoordinator() {
        require(msg.sender == address(COORDINATOR), "Only VRFCoordinator can fulfill");
        _;
    }

    //  Chainlink VRF Callback 
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external onlyVRFCoordinator {
        OpenRequest memory req = openRequests[requestId];
        require(req.user != address(0), "Invalid request");
        require(prizesRemaining > 0, "No prizes left");
        // Find a random available prize
        uint256 availableCount = prizesRemaining;
        uint256 rand = randomWords[0] % availableCount;
        uint256 index = 0;
        uint256 found = 0;
        for (uint256 i = 0; i < prizeURIs.length; i++) {
            if (isPrizeAvailable[i]) {
                if (found == rand) {
                    index = i;
                    break;
                }
                found++;
            }
        }
        // Mark prize as used
        isPrizeAvailable[index] = false;
        prizesRemaining--;
        string memory prizeURI = prizeURIs[index];
        // Mint the prize NFT to the user
        uint256 prizeTokenId = myNFT.mintNFT(req.user, prizeURI);
        emit BoxOpened(req.user, req.boxId, prizeTokenId, prizeURI);
        delete openRequests[requestId];
    }

    //  Emergency & Admin Functions 
    function withdraw(address payable to) external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "No balance");
        to.transfer(bal);
        emit Withdraw(to, bal);
    }

    function setMyNFTAddress(address _myNFTAddress) external onlyOwner {
        myNFTAddress = _myNFTAddress;
        myNFT = IMyNFT(_myNFTAddress);
    }

    //  UUPS Authorization 
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    //  Required by Solidity for VRFConsumerBaseV2 
    receive() external payable {}
    fallback() external payable {}
} 