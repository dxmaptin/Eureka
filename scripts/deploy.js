const { ethers } = require("hardhat");

async function main() {
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const myNFT = await MyNFT.deploy();
  await myNFT.waitForDeployment(); // Ensures deployment is complete
  const address = await myNFT.getAddress();
  console.log("MyNFT deployed to:", address);
}

async function deployMysteryBox(myNFT) {
  const MysteryBox = await ethers.getContractFactory("MysteryBox");
  const myNFTAddress = await myNFT.getAddress();
  const mysteryBox = await MysteryBox.deploy(myNFTAddress);
  await mysteryBox.waitForDeployment();
  const address = await mysteryBox.getAddress();
  console.log("MysteryBox deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});