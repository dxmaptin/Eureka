const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0xa6ed96110F9cBDBe8616a63Ce7Ed5D2F37752d1C";
  const userAddress = "0x0d25c5EFB20adEA2FC2AAA861C19A07BbD94678D";
  const metadataURI = "https://ipfs.io/ipfs/bafkreicbxcp7iczqkvu3ypiumezttuw5elyisfo4e5carufmpxfln5xhuq";

  // Get the first signer (the deployer or the account from your private key)
  const [signer] = await ethers.getSigners();

  // Connect the contract to the signer
  const MyNFT = await ethers.getContractFactory("MyNFT");
  const contract = MyNFT.attach(contractAddress).connect(signer);

  const tx = await contract.mintNFT(userAddress, metadataURI, { value: 0 });
  await tx.wait();
  console.log("NFT minted to:", userAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});