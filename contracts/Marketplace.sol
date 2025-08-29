// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// Note: We intentionally do not rely on ERC-2981 for secondary splits
// because profit-sharing logic is custom for tickets.
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimpleRoyaltyMarketplace
 * @notice Fixed-price marketplace that honors EIP-2981 royalties for ERC-721 NFTs.
 *         Listings are non-custodial: sellers retain their NFT and only approve this
 *         contract to transfer on purchase. Payments are in native ETH.
 */
contract SimpleRoyaltyMarketplace is ReentrancyGuard, Ownable {
    using Address for address payable;

    struct Listing {
        address seller;
        uint256 price; // in wei
    }

    // nft => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    // Last price paid per ticket (basis for profit and cap), in wei
    mapping(address => mapping(uint256 => uint256)) public lastPricePaidWei;

    // Organizer per NFT collection (event organizer wallet)
    mapping(address => address) public organizerOf;

    // Platform treasury to receive platform share (defaults to owner)
    address public platformTreasury;

    // Constants for profit split and price cap
    uint96 public constant ORGANIZER_PROFIT_BPS = 4000; // 40% of profit
    uint96 public constant PLATFORM_PROFIT_BPS = 1000;  // 10% of profit
    uint256 public constant PRICE_CAP_MULTIPLE = 2;     // max 2x last price

    event Listed(address indexed nft, uint256 indexed tokenId, address indexed seller, uint256 price);
    event PriceUpdated(address indexed nft, uint256 indexed tokenId, uint256 price);
    event Cancelled(address indexed nft, uint256 indexed tokenId);
    event Purchased(
        address indexed nft,
        uint256 indexed tokenId,
        address indexed buyer,
        address seller,
        uint256 price,
        uint256 organizerAmount,
        uint256 platformAmount,
        uint256 sellerProceeds
    );

    constructor() Ownable(msg.sender) {
        platformTreasury = msg.sender;
    }

    // Admin: set organizer address for a collection (nft)
    function setOrganizer(address nft, address organizer) external onlyOwner {
        organizerOf[nft] = organizer;
    }

    // Admin: set platform treasury address
    function setPlatformTreasury(address treasury) external onlyOwner {
        platformTreasury = treasury;
    }

    // Admin: record the initial (or reset) base price for a ticket (mint or official sale)
    // Can only set if not previously set to avoid malicious lowering/raising
    function setInitialPrice(address nft, uint256 tokenId, uint256 priceWei) external onlyOwner {
        require(priceWei > 0, "price=0");
        require(lastPricePaidWei[nft][tokenId] == 0, "Already set");
        lastPricePaidWei[nft][tokenId] = priceWei;
    }

    /**
     * @notice Create a fixed-price listing for an ERC-721 token.
     * @param nft The ERC-721 contract address
     * @param tokenId The token ID to list
     * @param price Sale price in wei (must equal msg.value in buy)
     */
    function list(address nft, uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be > 0");
        IERC721 token = IERC721(nft);
        address currentOwner = token.ownerOf(tokenId);
        require(msg.sender == currentOwner, "Only owner");
        require(
            token.getApproved(tokenId) == address(this) || token.isApprovedForAll(currentOwner, address(this)),
            "Marketplace not approved"
        );

        uint256 base = lastPricePaidWei[nft][tokenId];
        require(base > 0, "Base price not set");
        require(price <= base * PRICE_CAP_MULTIPLE, "Over 2x cap");

        listings[nft][tokenId] = Listing({seller: currentOwner, price: price});
        emit Listed(nft, tokenId, currentOwner, price);
    }

    /**
     * @notice Cancel an active listing.
     */
    function cancel(address nft, uint256 tokenId) external nonReentrant {
        Listing memory listing = listings[nft][tokenId];
        require(listing.seller != address(0), "Not listed");
        require(msg.sender == listing.seller, "Only seller");
        delete listings[nft][tokenId];
        emit Cancelled(nft, tokenId);
    }

    /**
     * @notice Update the price of an active listing.
     */
    function updatePrice(address nft, uint256 tokenId, uint256 newPrice) external nonReentrant {
        require(newPrice > 0, "Price must be > 0");
        Listing storage listing = listings[nft][tokenId];
        require(listing.seller != address(0), "Not listed");
        require(msg.sender == listing.seller, "Only seller");
        uint256 base = lastPricePaidWei[nft][tokenId];
        require(base > 0, "Base price not set");
        require(newPrice <= base * PRICE_CAP_MULTIPLE, "Over 2x cap");
        listing.price = newPrice;
        emit PriceUpdated(nft, tokenId, newPrice);
    }

    /**
     * @notice Purchase a listed NFT with ETH. Applies profit split and updates base price.
     */
    function buy(address nft, uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[nft][tokenId];
        require(listing.seller != address(0), "Not listed");
        require(msg.value == listing.price, "Incorrect ETH sent");

        IERC721 token = IERC721(nft);
        address currentOwner = token.ownerOf(tokenId);
        require(currentOwner == listing.seller, "Seller no longer owner");
        require(
            token.getApproved(tokenId) == address(this) || token.isApprovedForAll(currentOwner, address(this)),
            "Marketplace not approved"
        );
        address organizer = organizerOf[nft];
        require(organizer != address(0), "Organizer not set");

        // Prevent reentrancy by clearing listing before external calls
        delete listings[nft][tokenId];
        uint256 base = lastPricePaidWei[nft][tokenId];
        require(base > 0, "Base price not set");
        require(listing.price <= base * PRICE_CAP_MULTIPLE, "Over 2x cap");

        // Compute profit and splits
        uint256 profit = listing.price > base ? listing.price - base : 0;
        uint256 organizerCut = (profit * ORGANIZER_PROFIT_BPS) / 10000;
        uint256 platformCut = (profit * PLATFORM_PROFIT_BPS) / 10000;
        uint256 sellerProceeds = listing.price - organizerCut - platformCut;

        // Transfer the NFT to buyer
        token.safeTransferFrom(currentOwner, msg.sender, tokenId);

        // Payout organizer, platform, then seller
        if (organizerCut > 0) {
            (bool okOrg, ) = payable(organizer).call{value: organizerCut}("");
            require(okOrg, "Organizer payout failed");
        }
        if (platformCut > 0) {
            address treasury = platformTreasury == address(0) ? owner() : platformTreasury;
            (bool okPlat, ) = payable(treasury).call{value: platformCut}("");
            require(okPlat, "Platform payout failed");
        }
        (bool okSeller, ) = payable(currentOwner).call{value: sellerProceeds}("");
        require(okSeller, "Seller payout failed");

        // Update base to the new purchase price
        lastPricePaidWei[nft][tokenId] = listing.price;

        emit Purchased(nft, tokenId, msg.sender, currentOwner, listing.price, organizerCut, platformCut, sellerProceeds);
    }

    // Admin rescue: withdraw ETH accidentally sent to this contract
    function rescueETH(address payable to, uint256 amount) external onlyOwner {
        to.sendValue(amount);
    }
}
