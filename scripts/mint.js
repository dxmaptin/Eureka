// const { ethers } = require("hardhat");

// async function main() {
//   const contractAddress = "0xbE33544a1Ad0F5Aaf9ba28Fd534D268B964c27C8";
//   const userAddress = "0x0d25c5EFB20adEA2FC2AAA861C19A07BbD94678D";
//   const metadataURI = "https://ipfs.io/ipfs/bafkreigjlju3g3lbfoo5vugyioakk4hdskzssp4f6dpw77b4ibt62gp5ay";

//   // Get the first signer (the deployer or the account from your private key)
//   const [signer] = await ethers.getSigners();

//   // Connect the contract to the signer
//   const MyNFT = await ethers.getContractFactory("MyNFT");
//   const contract = MyNFT.attach(contractAddress).connect(signer);

//   const tx = await contract.mintNFT(userAddress, metadataURI, { value: 0 });
//   await tx.wait();
//   console.log("NFT minted to:", userAddress);
// }

// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });