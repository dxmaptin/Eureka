// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
// Using ConfirmedOwner from VRFConsumerBaseV2Plus instead of OpenZeppelin Ownable
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/interfaces/IERC4906.sol";

// Interface for the main MyNFT contract
interface IMyNFT {
    function mintNFT(address to, string memory tokenURI) external returns (uint256);
}

/**
 * @title MysteryBoxV2
 * @dev Non-upgradeable mystery box following exact Chainlink official pattern
 */
contract MysteryBoxV2 is VRFConsumerBaseV2Plus, Pausable, ReentrancyGuard {
    // Chainlink VRF variables - exact pattern from official repo
    uint256 public vrfSubscriptionId; 
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

    // Rate limiting: last purchase timestamp per address
    mapping(address => uint256) public lastPurchaseTime;
    uint256 public purchaseCooldown;

    // Events - following Chainlink pattern
    event BoxPurchased(address indexed user, uint256 boxId);
    event BoxOpened(address indexed user, uint256 boxId, uint256 prizeTokenId, string prizeURI);
    event RandomnessRequest(uint256 requestId);
    event PrizeAdded(string prizeURI);
    event PrizeRemoved(string prizeURI);
    event BoxPriceUpdated(uint256 newPrice);
    event Withdraw(address indexed to, uint256 amount);

    // Custom errors for gas optimization
    error InvalidQuantity(uint256 quantity);
    error ExactPaymentRequired(uint256 sent, uint256 required);
    error InsufficientPrizes(uint256 requested, uint256 available);
    error PurchaseTooSoon(uint256 timeRemaining);
    error InvalidPrizeIndex(uint256 index);
    error PrizeAlreadyRemoved(uint256 index);
    error InvalidAddress();
    error NotAContract();
    error UnsupportedInterface(string interfaceName);
    error InvalidCooldown(uint256 cooldown);
    error NoBalance();
    error InvalidRequestId();
    error NoPrizesLeft();

    constructor(
        address _myNFTAddress,
        address _vrfCoordinator,
        uint256 _vrfSubscriptionId,
        bytes32 _vrfKeyHash,
        uint32 _vrfCallbackGasLimit,
        uint16 _vrfRequestConfirmations
    ) VRFConsumerBaseV2Plus(_vrfCoordinator) {
        // Set VRF configuration - following Chainlink official pattern
        vrfSubscriptionId = _vrfSubscriptionId;
        vrfKeyHash = _vrfKeyHash;
        vrfCallbackGasLimit = _vrfCallbackGasLimit;
        vrfRequestConfirmations = _vrfRequestConfirmations;
        vrfNumWords = 1;
        
        // Validate and set NFT contract
        _validateNFTContract(_myNFTAddress);
        myNFTAddress = _myNFTAddress;
        myNFT = IMyNFT(_myNFTAddress);
        boxPrice = 0.01 ether;
        purchaseCooldown = 30 seconds;
    }

    // Prize Pool Management
    function addPrizeURI(string memory uri) external onlyOwner {
        prizeURIs.push(uri);
        isPrizeAvailable[prizeURIs.length - 1] = true;
        prizesRemaining++;
        emit PrizeAdded(uri);
    }

    function removePrize(uint256 index) external onlyOwner {
        if (index >= prizeURIs.length) revert InvalidPrizeIndex(index);
        if (!isPrizeAvailable[index]) revert PrizeAlreadyRemoved(index);
        isPrizeAvailable[index] = false;
        prizesRemaining--;
        emit PrizeRemoved(prizeURIs[index]);
    }

    function getPrizeURIs() external view returns (string[] memory) {
        return prizeURIs;
    }

    /**
     * @dev Validates NFT contract supports required interfaces
     */
    function _validateNFTContract(address nftContract) internal view {
        if (nftContract == address(0)) revert InvalidAddress();
        
        uint256 size;
        assembly {
            size := extcodesize(nftContract)
        }
        if (size == 0) revert NotAContract();
        
        if (!IERC165(nftContract).supportsInterface(type(IERC165).interfaceId)) {
            revert UnsupportedInterface("ERC165");
        }
        
        if (!IERC165(nftContract).supportsInterface(type(IERC721).interfaceId)) {
            revert UnsupportedInterface("ERC721");
        }
    }

    // Box Price Management
    function setBoxPrice(uint256 newPrice) external onlyOwner {
        boxPrice = newPrice;
        emit BoxPriceUpdated(newPrice);
    }

    function setPurchaseCooldown(uint256 newCooldown) external onlyOwner {
        if (newCooldown > 1 hours) revert InvalidCooldown(newCooldown);
        purchaseCooldown = newCooldown;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Box Purchase & Opening
    function purchaseAndOpenBox() external payable returns (uint256) {
        uint256[] memory boxIds = purchaseAndOpenBoxes(1);
        return boxIds[0];
    }
    
    function purchaseAndOpenBoxes(uint256 quantity) public payable whenNotPaused nonReentrant returns (uint256[] memory boxIds) {
        if (quantity == 0 || quantity > 10) revert InvalidQuantity(quantity);
        
        uint256 totalCost = boxPrice * quantity;
        if (msg.value != totalCost) revert ExactPaymentRequired(msg.value, totalCost);
        
        if (prizesRemaining < quantity) revert InsufficientPrizes(quantity, prizesRemaining);
        
        // Rate limiting check
        if (block.timestamp < lastPurchaseTime[msg.sender] + purchaseCooldown) {
            revert PurchaseTooSoon((lastPurchaseTime[msg.sender] + purchaseCooldown) - block.timestamp);
        }
        lastPurchaseTime[msg.sender] = block.timestamp;
        
        boxIds = new uint256[](quantity);
        
        // Process each box purchase
        for (uint256 i = 0; i < quantity; i++) {
            uint256 boxId = _boxId++;
            boxIds[i] = boxId;
            emit BoxPurchased(msg.sender, boxId);
            
            // Request randomness following exact Chainlink official pattern
            uint256 requestId = s_vrfCoordinator.requestRandomWords(
                VRFV2PlusClient.RandomWordsRequest({
                    keyHash: vrfKeyHash,
                    subId: vrfSubscriptionId,
                    requestConfirmations: vrfRequestConfirmations,
                    callbackGasLimit: vrfCallbackGasLimit,
                    numWords: vrfNumWords,
                    extraArgs: VRFV2PlusClient._argsToBytes(
                        VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                    )
                })
            );
            
            openRequests[requestId] = OpenRequest({user: msg.sender, boxId: boxId});
            emit RandomnessRequest(requestId);
        }
        
        return boxIds;
    }

    /**
     * @dev Chainlink VRF callback - exact pattern from official repo
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        OpenRequest memory req = openRequests[requestId];
        if (req.user == address(0)) revert InvalidRequestId();
        if (prizesRemaining == 0) revert NoPrizesLeft();
        
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
        
        // Mint the prize NFT
        uint256 prizeTokenId = myNFT.mintNFT(req.user, prizeURI);
        emit BoxOpened(req.user, req.boxId, prizeTokenId, prizeURI);
        delete openRequests[requestId];
    }

    // Admin functions
    function withdraw(address payable to) external onlyOwner {
        uint256 bal = address(this).balance;
        if (bal == 0) revert NoBalance();
        to.transfer(bal);
        emit Withdraw(to, bal);
    }

    function setMyNFTAddress(address _myNFTAddress) external onlyOwner {
        _validateNFTContract(_myNFTAddress);
        myNFTAddress = _myNFTAddress;
        myNFT = IMyNFT(_myNFTAddress);
    }

    // View functions
    function getVRFCoordinator() external view returns (address) {
        return address(s_vrfCoordinator);
    }
    
    function getSubscriptionId() external view returns (uint256) {
        return vrfSubscriptionId;
    }

    function getKeyHash() external view returns (bytes32) {
        return vrfKeyHash;
    }

    receive() external payable {}
}