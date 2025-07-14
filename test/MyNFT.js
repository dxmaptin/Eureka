const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
  let MyNFT, myNFT, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy();
  });

  it("should mint a ticket (NFT) to the specified address", async function () {
    const tokenURI = "https://example.com/metadata/1.json";
    await myNFT.mintNFT(addr1.address, tokenURI);
    expect(await myNFT.ownerOf(0)).to.equal(addr1.address);
  });

  it("should embed the correct metadata URI in the NFT", async function () {
    const tokenURI = "https://example.com/metadata/2.json";
    await myNFT.mintNFT(addr1.address, tokenURI);
    expect(await myNFT.tokenURI(0)).to.equal(tokenURI);
  });
}); 