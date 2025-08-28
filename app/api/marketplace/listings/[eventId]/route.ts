import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params
    const listings = await DatabaseService.getActiveListingsByEvent(eventId)
    return NextResponse.json({ success: true, listings })
  } catch (error) {
    console.error('❌ Error fetching listings:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch listings' }, { status: 500 })
  }
}
