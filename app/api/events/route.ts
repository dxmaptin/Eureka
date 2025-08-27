import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    console.log('📅 Fetching events from database...')
    
    const events = await DatabaseService.getAllEvents()
    
    console.log(`✅ Found ${events.length} events`)
    
    return NextResponse.json({
      success: true,
      events: events
    })
    
  } catch (error) {
    console.error('❌ Error fetching events:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch events'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📝 Creating new event:', body.name)
    
    const event = await DatabaseService.createEvent(body)
    
    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create event'
      }, { status: 500 })
    }
    
    console.log('✅ Event created:', event.id)
    
    return NextResponse.json({
      success: true,
      event: event
    })
    
  } catch (error) {
    console.error('❌ Error creating event:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create event'
    }, { status: 500 })
  }
}