import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nft_address, token_id, buyer_id, tx_hash, ticket_id, new_price_eth } = body
    if (!nft_address || token_id === undefined || !buyer_id || !ticket_id || new_price_eth === undefined) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    }
    const ok1 = await DatabaseService.markListingSold(nft_address, Number(token_id), buyer_id, tx_hash)
    const ok2 = await DatabaseService.updateTicketAfterResale(ticket_id, buyer_id, Number(new_price_eth))
    return NextResponse.json({ success: ok1 && ok2 })
  } catch (error) {
    console.error('❌ Error marking listing sold:', error)
    return NextResponse.json({ success: false, error: 'Failed to mark sold' }, { status: 500 })
  }
}

