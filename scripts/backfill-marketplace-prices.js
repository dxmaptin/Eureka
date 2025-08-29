const { ethers } = require('ethers')
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config()

// Loads env from .env.local if present as well (without overriding existing)
try {
  require('dotenv').config({ path: '.env.local' })
} catch {}

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'
  const privateKey = process.env.RELAYER_PRIVATE_KEY
  const marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS
  const myNftAddress = process.env.MYNFT_CONTRACT_ADDRESS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!privateKey) throw new Error('RELAYER_PRIVATE_KEY missing (marketplace owner needed)')
  if (!marketplaceAddress) throw new Error('MARKETPLACE_CONTRACT_ADDRESS missing')
  if (!myNftAddress) throw new Error('MYNFT_CONTRACT_ADDRESS missing')
  if (!supabaseUrl || !supabaseKey) throw new Error('Supabase env missing (URL or KEY)')

  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)
  const MarketplaceAbi = JSON.parse(fs.readFileSync('lib/abis/SimpleRoyaltyMarketplace.json', 'utf8')).abi
  const marketplace = new ethers.Contract(marketplaceAddress, MarketplaceAbi, wallet)

  const supabase = createClient(supabaseUrl, supabaseKey)
  console.log('🔎 Fetching tickets from Supabase…')
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('token_id, purchase_price_eth, event_id')
    .order('token_id', { ascending: true })
  if (error) throw error
  console.log(`Found ${tickets?.length || 0} tickets`)

  let updated = 0, skipped = 0
  for (const t of tickets || []) {
    const tokenId = BigInt(t.token_id)
    const baseExists = await marketplace.lastPricePaidWei(myNftAddress, tokenId)
    if (baseExists && baseExists !== 0n) { skipped++; continue }
    let priceEth = t.purchase_price_eth
    if (!priceEth) {
      // Fallback to event price if ticket price is missing
      const { data: events, error: e2 } = await supabase
        .from('events')
        .select('price_eth')
        .eq('id', t.event_id)
        .limit(1)
      if (!e2 && events && events[0]) {
        priceEth = events[0].price_eth
      }
    }
    if (!priceEth || Number(priceEth) <= 0) { skipped++; continue }
    const priceWei = ethers.parseEther(String(priceEth))
    try {
      const tx = await marketplace.setInitialPrice(myNftAddress, tokenId, priceWei)
      process.stdout.write(`Set base for #${tokenId} -> ${priceEth} ETH (tx ${tx.hash})\n`)
      await tx.wait()
      updated++
    } catch (e) {
      console.warn(`Failed to set base for #${tokenId}:`, e?.message || e)
    }
  }
  console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`)
}

main().catch((e) => { console.error('Backfill error:', e); process.exit(1) })
