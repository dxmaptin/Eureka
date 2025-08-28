import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_id, ticket_id, nft_address, token_id, seller_id, price_eth, tx_hash } = body
    if (!event_id || !ticket_id || !nft_address || token_id === undefined || !seller_id || !price_eth) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    }
    const listing = await DatabaseService.createListing({ event_id, ticket_id, nft_address, token_id, seller_id, price_eth, tx_hash })
    if (!listing) {
      return NextResponse.json({ success: false, error: 'Failed to create listing' }, { status: 500 })
    }
    return NextResponse.json({ success: true, listing })
  } catch (error) {
    console.error('❌ Error creating listing:', error)
    return NextResponse.json({ success: false, error: 'Failed to create listing' }, { status: 500 })
  }
}

