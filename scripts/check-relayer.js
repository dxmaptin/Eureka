const { ethers } = require('hardhat')

async function main() {
  const relayerAddress = process.env.RELAYER_ADDRESS
  const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY
  
  if (!relayerAddress || !relayerPrivateKey) {
    console.log('❌ Relayer credentials not found in environment')
    console.log('Please add RELAYER_ADDRESS and RELAYER_PRIVATE_KEY to your .env file')
    return
  }
  
  console.log('🔍 Checking relayer status...\n')
  
  // Get provider
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/your-project-id')
  
  // Check balance
  const balance = await provider.getBalance(relayerAddress)
  const balanceEth = ethers.formatEther(balance)
  
  console.log('📊 Relayer Status:')
  console.log('Address:', relayerAddress)
  console.log('Balance:', balanceEth, 'ETH')
  
  if (parseFloat(balanceEth) < 0.01) {
    console.log('\n⚠️  Low Balance Warning:')
    console.log('Relayer needs Sepolia ETH for gas fees')
    console.log('Get free Sepolia ETH from: https://sepoliafaucet.com')
    console.log(`Send to: ${relayerAddress}`)
  } else {
    console.log('\n✅ Relayer has sufficient balance for gas fees')
  }
  
  // Test connection to relayer wallet
  try {
    const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider)
    console.log('\n🔗 Connection Test:')
    console.log('Relayer wallet connected:', relayerWallet.address === relayerAddress ? '✅' : '❌')
    
    // Get current gas price
    const feeData = await provider.getFeeData()
    console.log('Current gas price:', ethers.formatUnits(feeData.gasPrice || 0, 'gwei'), 'gwei')
    
    // Estimate minting cost
    const estimatedGasCost = (feeData.gasPrice || ethers.parseUnits('20', 'gwei')) * 100000n // ~100k gas for minting
    const estimatedCostEth = ethers.formatEther(estimatedGasCost)
    console.log('Estimated cost per mint:', estimatedCostEth, 'ETH')
    
    const maxMints = Math.floor(parseFloat(balanceEth) / parseFloat(estimatedCostEth))
    console.log('Estimated mints possible:', maxMints)
    
  } catch (error) {
    console.log('\n❌ Relayer wallet connection failed:', error.message)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })