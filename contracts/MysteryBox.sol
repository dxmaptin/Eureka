// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Interface to interact with the main MyNFT contract for minting prize NFTs
interface IMyNFT {
    function mintNFT(address to, string memory tokenURI) external returns (uint256);
}

// MysteryBox contract allows minting and opening of box NFTs that award random prizes from the main NFT collection
contract MysteryBox is ERC721URIStorage, Ownable {
    uint256 private _boxId; // Counter for box token IDs
    string[] public prizeURIs; // List of possible prize metadata URIs
    address public myNFTAddress; // Address of the main MyNFT contract
    IMyNFT public myNFT; // Interface instance for interacting with MyNFT

    mapping(uint256 => bool) public isBox; // Tracks which tokenIds are valid boxes

    // Events for frontend and transparency
    event BoxMinted(address indexed to, uint256 boxId);
    event BoxOpened(address indexed user, uint256 boxId, uint256 prizeTokenId, string prizeURI);

    // Constructor sets the address of the main MyNFT contract
    constructor(address _myNFTAddress) ERC721("MysteryBox", "BOX") Ownable(msg.sender) {
        myNFTAddress = _myNFTAddress;
        myNFT = IMyNFT(_myNFTAddress);
    }

    // Owner can add new prize URIs to the pool
    function addPrizeURI(string memory uri) external onlyOwner {
        prizeURIs.push(uri);
    }

    // Owner mints a new box NFT to a user with a given boxURI (e.g., a mystery box image/metadata)
    function mintBox(address to, string memory boxURI) public onlyOwner returns (uint256) {
        uint256 tokenId = _boxId;
        _boxId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, boxURI);
        isBox[tokenId] = true;
        emit BoxMinted(to, tokenId);
        return tokenId;
    }

    // User opens their box NFT, which is burned and replaced with a random prize NFT from the main collection
    function openBox(uint256 boxId) public {
        require(ownerOf(boxId) == msg.sender, "Not your box");
        require(isBox[boxId], "Not a box");
        require(prizeURIs.length > 0, "No prizes available");
        isBox[boxId] = false;
        _burn(boxId);

        // Pseudo-randomly select a prize from the pool (for demo; use Chainlink VRF for production)
        uint256 prizeIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, boxId, blockhash(block.number - 1)))
        ) % prizeURIs.length;
        string memory prizeURI = prizeURIs[prizeIndex];

        // Mint the prize NFT from the main MyNFT contract to the user
        uint256 prizeTokenId = myNFT.mintNFT(msg.sender, prizeURI);
        emit BoxOpened(msg.sender, boxId, prizeTokenId, prizeURI);
    }

    // Owner can update the address of the main MyNFT contract (for upgrades or migration)
    function setMyNFTAddress(address _myNFTAddress) external onlyOwner {
        myNFTAddress = _myNFTAddress;
        myNFT = IMyNFT(_myNFTAddress);
    }
} 