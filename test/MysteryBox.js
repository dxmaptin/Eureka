const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MysteryBox", function () {
  let MyNFT, myNFT, MysteryBox, mysteryBox, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy();
    await myNFT.waitForDeployment();
    MysteryBox = await ethers.getContractFactory("MysteryBox");
    mysteryBox = await MysteryBox.deploy(await myNFT.getAddress());
    await mysteryBox.waitForDeployment();
  });

  it("owner can add prize URIs", async function () {
    await mysteryBox.addPrizeURI("ipfs://prize1.json");
    expect(await mysteryBox.prizeURIs(0)).to.equal("ipfs://prize1.json");
  });

  it("owner can mint a box", async function () {
    await mysteryBox.mintBox(user.address, "ipfs://box.json");
    expect(await mysteryBox.ownerOf(0)).to.equal(user.address);
  });

  it("user can open a box and receive a prize NFT from MyNFT", async function () {
    await mysteryBox.addPrizeURI("ipfs://prize1.json");
    await mysteryBox.mintBox(user.address, "ipfs://box.json");
    await mysteryBox.connect(user).openBox(0);
    // The user should now own a prize NFT from MyNFT (tokenId 0)
    expect(await myNFT.ownerOf(0)).to.equal(user.address);
  });
}); 