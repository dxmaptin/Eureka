require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com", // or Alchemy URL
      accounts: ["af2feac8b28e1bae4a57ee54d32611c42b14bbbbda18572ed1bf3307848da517"]
    }
  }
};
