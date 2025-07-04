require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com", // or Alchemy URL
      accounts: ["757d30a33ecb2bcb4647f68fbff0e846f5a19fb4a05a5c60b99895d38d801a7b"]
    }
  }
};
