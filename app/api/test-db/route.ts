import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(request: NextRequest) {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test basic connection
    const isConnected = await DatabaseService.testConnection()
    
    if (!isConnected) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection failed' 
      })
    }
    
    // Test fetching events
    console.log('📅 Fetching events from database...')
    const events = await DatabaseService.getAllEvents()
    console.log(`✅ Found ${events.length} events in database`)
    
    // Test user creation (with fake wallet)
    console.log('👤 Testing user creation...')
    const testUser = await DatabaseService.createOrUpdateUser({
      wallet_address: '0x1234567890123456789012345678901234567890',
      email: 'test@example.com',
      login_method: 'magic_email',
      display_name: 'Test User'
    })
    
    return NextResponse.json({
      success: true,
      data: {
        connected: isConnected,
        eventsCount: events.length,
        firstEvent: events[0]?.name || 'No events found',
        testUser: testUser?.id || 'User creation failed'
      }
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}