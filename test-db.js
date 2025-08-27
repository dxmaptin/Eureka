import { DatabaseService } from './lib/database'

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  try {
    // Test basic connection
    const isConnected = await DatabaseService.testConnection()
    
    if (!isConnected) {
      console.log('❌ Supabase connection failed')
      return
    }
    
    // Test fetching events
    console.log('📅 Fetching events from database...')
    const events = await DatabaseService.getAllEvents()
    console.log(`✅ Found ${events.length} events in database`)
    
    if (events.length > 0) {
      console.log('🎫 First event:', events[0].name)
    }
    
    // Test user creation (with fake wallet)
    console.log('👤 Testing user creation...')
    const testUser = await DatabaseService.createOrUpdateUser({
      wallet_address: '0x1234567890123456789012345678901234567890',
      email: 'test@example.com',
      login_method: 'magic_email',
      display_name: 'Test User'
    })
    
    if (testUser) {
      console.log('✅ Test user created:', testUser.id)
    }
    
    console.log('🎉 All database tests passed!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  }
}

testSupabaseConnection()