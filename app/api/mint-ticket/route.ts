import { ethers } from 'ethers'
import { NextRequest, NextResponse } from 'next/server'
import MyNFTAbi from '@/artifacts/contracts/MyNFT.sol/MyNFT.json'
import { DatabaseService } from '@/lib/database'
import MarketplaceAbi from '@/lib/abis/SimpleRoyaltyMarketplace.json'
import { MARKETPLACE_CONTRACT_ADDRESS } from '@/lib/contracts'

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY
const RELAYER_ADDRESS = process.env.RELAYER_ADDRESS
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'
const MYNFT_CONTRACT_ADDRESS = process.env.MYNFT_CONTRACT_ADDRESS || '0x791c1B4A7aAfB6Cf1EDcC2404dd58d93080dc2E3'

const METADATA_URI = "https://ipfs.io/ipfs/bafkreigjlju3g3lbfoo5vugyioakk4hdskzssp4f6dpw77b4ibt62gp5ay"

interface MintRequest {
  userAddress: string
  paymentMethod: 'crypto' | 'fiat'
  eventId: string
  quantity?: number
}

interface MintResponse {
  success: boolean
  transactionHash?: string
  error?: string
  estimatedGasCost?: string
  relayerBalance?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<MintResponse>> {
  console.log('🎫 Relayer mint API called')
  
  try {
    // Validate environment variables
    if (!RELAYER_PRIVATE_KEY || !RELAYER_ADDRESS) {
      console.error('❌ Missing relayer credentials')
      return NextResponse.json({
        success: false,
        error: 'Relayer not configured'
      }, { status: 500 })
    }

    // Parse request
    const body: MintRequest = await request.json()
    const { userAddress, paymentMethod, eventId, quantity = 1 } = body
    
    console.log('📋 Mint request:', { userAddress, paymentMethod, eventId, quantity })

    // Validate user address
    if (!userAddress || !ethers.isAddress(userAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user address'
      }, { status: 400 })
    }

    // Set up provider and relayer wallet
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL)
    const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider)
    
    console.log('🔗 Connected to relayer wallet:', relayerWallet.address)

    // Check relayer balance
    const relayerBalance = await provider.getBalance(relayerWallet.address)
    const relayerBalanceEth = ethers.formatEther(relayerBalance)
    
    console.log('💰 Relayer balance:', relayerBalanceEth, 'ETH')
    
    if (parseFloat(relayerBalanceEth) < 0.001) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient relayer balance for gas fees',
        relayerBalance: relayerBalanceEth
      }, { status: 500 })
    }

    // Set up contract
    const contract = new ethers.Contract(MYNFT_CONTRACT_ADDRESS, MyNFTAbi.abi, relayerWallet)
    
    console.log('📝 Contract connected:', MYNFT_CONTRACT_ADDRESS)

    // Estimate gas cost
    let estimatedGas
    try {
      estimatedGas = await contract.mintNFT.estimateGas(userAddress, METADATA_URI, { value: 0 })
      console.log('⛽ Estimated gas:', estimatedGas.toString())
    } catch (gasError) {
      console.error('❌ Gas estimation failed:', gasError)
      return NextResponse.json({
        success: false,
        error: 'Unable to estimate gas cost'
      }, { status: 500 })
    }

    const feeData = await provider.getFeeData()
    const estimatedCost = estimatedGas * (feeData.gasPrice || ethers.parseUnits('10', 'gwei'))
    const estimatedCostEth = ethers.formatEther(estimatedCost)
    
    console.log('💸 Estimated cost:', estimatedCostEth, 'ETH')

    // Execute the minting transaction
    console.log('🚀 Executing mint transaction...')
    
    const tx = await contract.mintNFT(userAddress, METADATA_URI, {
      value: 0, // No payment required since relayer covers gas
      gasLimit: estimatedGas + 10000n, // Add buffer
      gasPrice: feeData.gasPrice
    })
    
    console.log('📄 Transaction sent:', tx.hash)

    // Wait for confirmation
    console.log('⏳ Waiting for confirmation...')
    const receipt = await tx.wait()
    
    console.log('✅ Transaction confirmed in block:', receipt?.blockNumber)

    // Get the minted token ID from the logs
    let tokenId
    if (receipt?.logs) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog({
            topics: log.topics as string[],
            data: log.data
          })
          if (parsedLog?.name === 'Transfer' && parsedLog.args[0] === ethers.ZeroAddress) {
            tokenId = parsedLog.args[2].toString()
            break
          }
        } catch (e) {
          // Skip unparseable logs
        }
      }
    }

    console.log('🎨 NFT minted with token ID:', tokenId)

    // Fetch event for pricing
    const event = await DatabaseService.getEventById(eventId)

    // Create/update user in database
    console.log('👤 Creating/updating user in database...')
    const dbUser = await DatabaseService.createOrUpdateUser({
      wallet_address: userAddress,
      login_method: paymentMethod === 'crypto' ? 'metamask' : 'magic_email' // Simplified assumption
    })

    if (!dbUser) {
      console.error('❌ Failed to create user record, cannot create ticket')
      return NextResponse.json({
        success: false,
        error: 'Failed to create user record'
      }, { status: 500 })
    }

    // Save ticket to database
    console.log('🎫 Saving ticket to database...')
    const ticketData = await DatabaseService.createTicket({
      event_id: eventId,
      owner_id: dbUser.id,
      token_id: parseInt(tokenId || '0'),
      transaction_hash: tx.hash,
      purchase_price_usd: event?.price_usd,
      purchase_price_eth: event?.price_eth,
      last_purchase_price_eth: event?.price_eth,
      payment_method: paymentMethod,
      metadata_uri: METADATA_URI
    })

    if (!ticketData) {
      console.warn('⚠️ Failed to save ticket to database, but NFT was minted')
    } else {
      console.log('✅ Ticket saved to database:', ticketData.id)
    }

    // Record initial base price on marketplace (for 2x cap/profit split)
    if (MARKETPLACE_CONTRACT_ADDRESS && tokenId && event?.price_eth) {
      try {
        const mp = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, (MarketplaceAbi as any).abi, relayerWallet)
        const priceWei = ethers.parseEther(String(event.price_eth))
        // setInitialPrice onlyOwner; ensure relayer can call only if relayer is owner of marketplace
        await mp.setInitialPrice(MYNFT_CONTRACT_ADDRESS, BigInt(tokenId), priceWei)
      } catch (e) {
        console.warn('Could not set initial price on marketplace (check ownership/permissions):', e)
      }
    }

    return NextResponse.json({
      success: true,
      transactionHash: tx.hash,
      tokenId: tokenId,
      estimatedGasCost: estimatedCostEth,
      relayerBalance: relayerBalanceEth,
      ticket: ticketData,
      user: dbUser
    })

  } catch (error) {
    console.error('❌ Mint error:', error)
    
    let errorMessage = 'Unknown error occurred'
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Handle specific error cases
      if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Relayer has insufficient funds for gas fees'
      } else if (errorMessage.includes('user rejected')) {
        errorMessage = 'Transaction was rejected'
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Network connection error'
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 })
  }
}
