const { ethers } = require('hardhat')

async function main() {
  const relayerAddress = process.env.RELAYER_ADDRESS
  
  if (!relayerAddress) {
    console.log('❌ RELAYER_ADDRESS not found in environment')
    return
  }
  
  console.log('💸 Funding relayer wallet for testing...\n')
  
  // Get the deployer account (from hardhat config)
  const [deployer] = await ethers.getSigners()
  console.log('📤 Funding from deployer:', deployer.address)
  
  // Check deployer balance
  const deployerBalance = await deployer.provider.getBalance(deployer.address)
  const deployerBalanceEth = ethers.formatEther(deployerBalance)
  console.log('💰 Deployer balance:', deployerBalanceEth, 'ETH')
  
  if (parseFloat(deployerBalanceEth) < 0.1) {
    console.log('⚠️  Deployer has insufficient balance to fund relayer')
    console.log('Get more Sepolia ETH from: https://sepoliafaucet.com')
    return
  }
  
  // Send 0.05 ETH to relayer
  const fundAmount = ethers.parseEther('0.05')
  console.log('💸 Sending 0.05 ETH to relayer...')
  
  const tx = await deployer.sendTransaction({
    to: relayerAddress,
    value: fundAmount
  })
  
  console.log('📄 Transaction hash:', tx.hash)
  console.log('⏳ Waiting for confirmation...')
  
  await tx.wait()
  
  // Check relayer balance after funding
  const relayerBalance = await deployer.provider.getBalance(relayerAddress)
  const relayerBalanceEth = ethers.formatEther(relayerBalance)
  
  console.log('✅ Relayer funded successfully!')
  console.log('📊 Relayer balance:', relayerBalanceEth, 'ETH')
  
  // Estimate how many mints this can cover
  const feeData = await deployer.provider.getFeeData()
  const estimatedGasCost = (feeData.gasPrice || ethers.parseUnits('10', 'gwei')) * 100000n
  const estimatedCostEth = ethers.formatEther(estimatedGasCost)
  const maxMints = Math.floor(parseFloat(relayerBalanceEth) / parseFloat(estimatedCostEth))
  
  console.log('⛽ Estimated gas cost per mint:', estimatedCostEth, 'ETH')
  console.log('🎫 Estimated tickets can be minted:', maxMints)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })