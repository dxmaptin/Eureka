const { ethers, network } = require('hardhat')
require('dotenv').config()

// Usage:
//   DEPLOYER_PRIVATE_KEY=<MyNFT owner key> \
//   MYNFT_CONTRACT_ADDRESS=0x... \
//   MARKETPLACE_CONTRACT_ADDRESS=0x... \
//   npx hardhat run scripts/set-marketplace-on-mynft.js --network sepolia

async function main() {
  const nftAddr = process.env.MYNFT_CONTRACT_ADDRESS
  const mpAddr = process.env.MARKETPLACE_CONTRACT_ADDRESS
  if (!nftAddr || !mpAddr) throw new Error('Missing MYNFT_CONTRACT_ADDRESS or MARKETPLACE_CONTRACT_ADDRESS')

  const [signer] = await ethers.getSigners()
  console.log('Network:', network.name)
  console.log('Signer:', signer.address)
  console.log('MyNFT:', nftAddr)
  console.log('Marketplace:', mpAddr)

  const nft = await ethers.getContractAt('MyNFT', nftAddr)
  const owner = await nft.owner()
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(`Signer is not MyNFT owner. Owner: ${owner}`)
  }
  const tx = await nft.setMarketplace(mpAddr)
  console.log('setMarketplace tx:', tx.hash)
  await tx.wait()
  console.log('✅ MyNFT.marketplace set to', mpAddr)
}

main().catch((e) => { console.error(e); process.exit(1) })

