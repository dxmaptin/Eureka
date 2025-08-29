import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

interface UserTicketsRequest {
  walletAddress: string
}

export async function POST(request: NextRequest) {
  try {
    const body: UserTicketsRequest = await request.json()
    const { walletAddress } = body
    
    console.log('🎫 Fetching tickets for user:', walletAddress)
    
    // Get user from database
    let user = await DatabaseService.getUserByWallet(walletAddress)
    
    if (!user) {
      // Auto-create a user record if missing so dashboard loads after first mint/login
      user = await DatabaseService.createOrUpdateUser({
        wallet_address: walletAddress,
        login_method: 'metamask'
      })
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }
    }
    
    // Get user's tickets
    const tickets = await DatabaseService.getUserTickets(user.id)
    const purchaseHistory = await DatabaseService.getUserPurchaseHistory(user.id)
    
    console.log(`✅ Found ${tickets.length} tickets for user`)
    
    return NextResponse.json({
      success: true,
      user: user,
      tickets: tickets,
      purchaseHistory: purchaseHistory
    })
    
  } catch (error) {
    console.error('❌ Error fetching user tickets:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch user data'
    }, { status: 500 })
  }
}
