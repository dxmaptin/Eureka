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
    uint256 public vrfSubscriptionId; // uint256 for VRF v2.5 compatibility
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
    event SubscriptionIdUpdated(uint256 oldSubId, uint256 newSubId);
    event VRFConfigUpdated(bytes32 keyHash, uint32 callbackGasLimit, uint16 requestConfirmations);

    //  Initializer (replaces constructor for upgradeable contracts) 
    function initialize(
        address _myNFTAddress,
        address _vrfCoordinator,
        uint256 _vrfSubscriptionId,
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
        
        // Validate subscription exists using low-level call for uint256 support
        (bool success, bytes memory data) = address(COORDINATOR).staticcall(
            abi.encodeWithSignature("getSubscription(uint256)", _vrfSubscriptionId)
        );
        if (success) {
            (uint96 balance, , address owner, ) = abi.decode(data, (uint96, uint64, address, address[]));
            require(owner != address(0), "Invalid VRF subscription ID");
        } else {
            // Fallback to standard getSubscription if coordinator doesn't support uint256
            revert("VRF coordinator doesn't support large subscription IDs");
        }
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
        
        // Check subscription status before making VRF request (uint256 support)
        (bool success, bytes memory data) = address(COORDINATOR).staticcall(
            abi.encodeWithSignature("getSubscription(uint256)", vrfSubscriptionId)
        );
        require(success, "Failed to get subscription info");
        (uint96 balance, , address owner, address[] memory consumers) = abi.decode(data, (uint96, uint64, address, address[]));
        require(balance > 0, "VRF subscription not funded");
        require(owner != address(0), "VRF subscription does not exist");
        
        // Check if this contract is a consumer (optional but recommended)
        bool isConsumer = false;
        for (uint i = 0; i < consumers.length; i++) {
            if (consumers[i] == address(this)) {
                isConsumer = true;
                break;
            }
        }
        require(isConsumer, "Contract not registered as VRF consumer");
        
        uint256 boxId = _boxId++;
        emit BoxPurchased(msg.sender, boxId);
        
        // Request randomness from Chainlink VRF using low-level call for uint256 support
        (bool vrfSuccess, bytes memory vrfData) = address(COORDINATOR).call(
            abi.encodeWithSignature(
                "requestRandomWords(bytes32,uint256,uint16,uint32,uint32)",
                vrfKeyHash,
                vrfSubscriptionId,
                vrfRequestConfirmations,
                vrfCallbackGasLimit,
                vrfNumWords
            )
        );
        require(vrfSuccess, "VRF request failed");
        uint256 requestId = abi.decode(vrfData, (uint256));
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

    //  VRF Subscription Management 
    function setSubscriptionId(uint256 newSubId) external onlyOwner {
        // Validate new subscription exists using low-level call for uint256 support
        (bool success, bytes memory data) = address(COORDINATOR).staticcall(
            abi.encodeWithSignature("getSubscription(uint256)", newSubId)
        );
        require(success, "Failed to get subscription info");
        (uint96 balance, , address owner, ) = abi.decode(data, (uint96, uint64, address, address[]));
        require(owner != address(0), "Subscription does not exist");
        
        uint256 oldSubId = vrfSubscriptionId;
        vrfSubscriptionId = newSubId;
        emit SubscriptionIdUpdated(oldSubId, newSubId);
    }

    function updateVRFConfig(
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations
    ) external onlyOwner {
        require(_callbackGasLimit >= 20000 && _callbackGasLimit <= 2500000, "Invalid gas limit");
        require(_requestConfirmations >= 3 && _requestConfirmations <= 200, "Invalid confirmations");
        
        vrfKeyHash = _keyHash;
        vrfCallbackGasLimit = _callbackGasLimit;
        vrfRequestConfirmations = _requestConfirmations;
        
        emit VRFConfigUpdated(_keyHash, _callbackGasLimit, _requestConfirmations);
    }

    function getSubscriptionInfo() external view returns (
        uint96 balance,
        uint64 reqCount,
        address owner,
        address[] memory consumers
    ) {
        // Use low-level call for uint256 subscription ID support
        (bool success, bytes memory data) = address(COORDINATOR).staticcall(
            abi.encodeWithSignature("getSubscription(uint256)", vrfSubscriptionId)
        );
        require(success, "Failed to get subscription info");
        return abi.decode(data, (uint96, uint64, address, address[]));
    }

    function isConsumerRegistered() external view returns (bool) {
        (bool success, bytes memory data) = address(COORDINATOR).staticcall(
            abi.encodeWithSignature("getSubscription(uint256)", vrfSubscriptionId)
        );
        if (!success) return false;
        
        (, , , address[] memory consumers) = abi.decode(data, (uint96, uint64, address, address[]));
        for (uint i = 0; i < consumers.length; i++) {
            if (consumers[i] == address(this)) {
                return true;
            }
        }
        return false;
    }

    //  UUPS Authorization 
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    //  Required by Solidity for VRFConsumerBaseV2 
    receive() external payable {}
    fallback() external payable {}
} 