import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

interface Params {
  id: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id: eventId } = await params
    
    console.log('🎫 Fetching event:', eventId)
    
    const event = await DatabaseService.getEventById(eventId)
    
    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Event not found'
      }, { status: 404 })
    }
    
    console.log('✅ Event found:', event.name)
    
    return NextResponse.json({
      success: true,
      event: event
    })
    
  } catch (error) {
    console.error('❌ Error fetching event:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch event'
    }, { status: 500 })
  }
}