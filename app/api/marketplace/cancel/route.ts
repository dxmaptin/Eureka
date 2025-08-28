import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nft_address, token_id } = body
    if (!nft_address || token_id === undefined) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 })
    }
    const ok = await DatabaseService.cancelListing(nft_address, Number(token_id))
    return NextResponse.json({ success: ok })
  } catch (error) {
    console.error('❌ Error cancelling listing:', error)
    return NextResponse.json({ success: false, error: 'Failed to cancel listing' }, { status: 500 })
  }
}

