// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC4906.sol";

contract MyNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 private _tokenIdCounter;
    uint256 public mintPrice = 0;

    // Pass msg.sender as the initial owner to Ownable constructor
    constructor() ERC721("MyNFTCollection", "MNC") Ownable(msg.sender) {
    // Set default royalty: 5% to contract owner
      _setDefaultRoyalty(msg.sender, 500); // 500 = 5% (denominator is 10000)
    }

    function mintNFT(address to, string memory tokenURI) public payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return tokenId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return interfaceId == type(IERC4906).interfaceId || // ERC4906 interface ID
               super.supportsInterface(interfaceId);
    }

    function setRoyaltyInfo(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    /**
     * @dev Updates the metadata URI for a token and emits MetadataUpdate event
     * @param tokenId The token ID to update
     * @param newTokenURI The new metadata URI
     */
    function updateTokenURI(uint256 tokenId, string memory newTokenURI) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _setTokenURI(tokenId, newTokenURI);
        emit MetadataUpdate(tokenId);
    }

    /**
     * @dev Batch update metadata for multiple tokens
     * @param fromTokenId Starting token ID  
     * @param toTokenId Ending token ID
     */
    function batchUpdateMetadata(uint256 fromTokenId, uint256 toTokenId) external onlyOwner {
        require(fromTokenId <= toTokenId, "Invalid range");
        emit BatchMetadataUpdate(fromTokenId, toTokenId);
    }
}
