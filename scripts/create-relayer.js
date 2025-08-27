const { ethers } = require('hardhat')

async function main() {
  console.log('🔑 Creating new relayer wallet...\n')
  
  // Generate a new random wallet
  const relayerWallet = ethers.Wallet.createRandom()
  
  console.log('✅ Relayer Wallet Created:')
  console.log('Address:', relayerWallet.address)
  console.log('Private Key:', relayerWallet.privateKey)
  console.log('Mnemonic:', relayerWallet.mnemonic?.phrase)
  
  console.log('\n📋 Environment Variables to Add:')
  console.log(`RELAYER_PRIVATE_KEY=${relayerWallet.privateKey}`)
  console.log(`RELAYER_ADDRESS=${relayerWallet.address}`)
  
  console.log('\n⚠️  SECURITY NOTES:')
  console.log('1. Save these credentials securely')
  console.log('2. Add Sepolia ETH to this address for gas fees')
  console.log('3. Grant minting permissions to this address')
  console.log('4. Never expose the private key in frontend code')
  
  console.log('\n🔗 Add Sepolia ETH here:')
  console.log(`https://sepoliafaucet.com - Send to: ${relayerWallet.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })