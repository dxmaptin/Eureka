const { ethers, network } = require('hardhat')
require('dotenv').config()

async function main() {
  const myNftAddress = process.env.MYNFT_CONTRACT_ADDRESS
  if (!myNftAddress) {
    throw new Error('Missing MYNFT_CONTRACT_ADDRESS in env')
  }

  const organizerAddress = process.env.MARKETPLACE_ORGANIZER_ADDRESS || process.env.RELAYER_ADDRESS || null
  const platformTreasury = process.env.MARKETPLACE_PLATFORM_TREASURY || null

  console.log('Network:', network.name)
  const [deployer] = await ethers.getSigners()
  console.log('Deployer:', deployer.address)
  console.log('MyNFT:', myNftAddress)

  // Deploy SimpleRoyaltyMarketplace
  const Factory = await ethers.getContractFactory('SimpleRoyaltyMarketplace')
  const marketplace = await Factory.deploy()
  await marketplace.waitForDeployment()
  const marketplaceAddress = await marketplace.getAddress()
  console.log('SimpleRoyaltyMarketplace deployed to:', marketplaceAddress)

  // Optional config: organizer and platform treasury
  if (organizerAddress) {
    const tx = await marketplace.setOrganizer(myNftAddress, organizerAddress)
    await tx.wait()
    console.log('Organizer set for MyNFT ->', organizerAddress)
  } else {
    console.log('Organizer not set (MARKETPLACE_ORGANIZER_ADDRESS not provided)')
  }

  if (platformTreasury) {
    const tx = await marketplace.setPlatformTreasury(platformTreasury)
    await tx.wait()
    console.log('Platform treasury set ->', platformTreasury)
  } else {
    console.log('Platform treasury not set (defaults to owner)')
  }

  // Try wiring MyNFT -> marketplace (requires MyNFT owner)
  try {
    const myNft = await ethers.getContractAt('MyNFT', myNftAddress)
    const owner = await myNft.owner()
    if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.warn('\n⚠️ Deployer is not MyNFT owner; cannot call setMarketplace.')
      console.warn('MyNFT owner:', owner)
    } else {
      const tx = await myNft.setMarketplace(marketplaceAddress)
      await tx.wait()
      console.log('✅ MyNFT.setMarketplace configured to', marketplaceAddress)
    }
  } catch (e) {
    console.warn('Could not set MyNFT.marketplace automatically:', e.message || e)
  }

  console.log('\nNEXT STEPS:')
  console.log('- Update .env with MARKETPLACE_CONTRACT_ADDRESS and NEXT_PUBLIC_MARKETPLACE_CONTRACT_ADDRESS')
  console.log('- Ensure MyNFT.setMarketplace is called by the MyNFT owner if not set above')
  console.log('- (Optional) Provide MARKETPLACE_ORGANIZER_ADDRESS / MARKETPLACE_PLATFORM_TREASURY in env before re-running')

  return marketplaceAddress
}

main()
  .then((addr) => {
    console.log('\nDeployment complete at:', addr)
    process.exit(0)
  })
  .catch((err) => {
    console.error('Deployment failed:', err)
    process.exit(1)
  })

