import { supabase, supabaseAdmin } from './supabase'
import type { User, Event, Ticket, PurchaseHistory, Listing } from './supabase'

export class DatabaseService {
  // User Management
  static async createOrUpdateUser(userData: {
    wallet_address: string
    email?: string
    phone?: string
    login_method: 'magic_email' | 'magic_phone' | 'magic_social' | 'metamask'
    display_name?: string
  }): Promise<User | null> {
    console.log('📝 Creating or updating user:', userData.wallet_address)
    
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not available')
      return null
    }
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert([{
        wallet_address: userData.wallet_address.toLowerCase(),
        email: userData.email,
        phone: userData.phone,
        login_method: userData.login_method,
        display_name: userData.display_name || userData.email || userData.wallet_address.slice(0, 8) + '...'
      }], { 
        onConflict: 'wallet_address',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating/updating user:', error)
      return null
    }

    console.log('✅ User created/updated:', data.id)
    return data
  }

  static async getUserByWallet(walletAddress: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (error) {
      console.log('👤 User not found for wallet:', walletAddress)
      return null
    }

    return data
  }

  // Event Management
  static async getAllEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })

      if (error) {
        console.error('❌ Error fetching events:', error)
        return []
      }

      return data || []
    } catch (e) {
      console.error('❌ Network error fetching events:', e)
      return []
    }
  }

  static async getEventById(eventId: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('❌ Error fetching event:', error)
      return null
    }

    return data
  }

  static async createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'sold_tickets'>): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating event:', error)
      return null
    }

    return data
  }

  // Ticket Management
  static async createTicket(ticketData: {
    event_id: string
    owner_id: string
    token_id: number
    transaction_hash: string
    purchase_price_usd?: number
    purchase_price_eth?: number
    last_purchase_price_eth?: number
    payment_method: 'crypto' | 'fiat'
    metadata_uri: string
  }): Promise<Ticket | null> {
    console.log('🎫 Creating ticket record:', ticketData)

    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not available')
      return null
    }

    // Some deployments may not have last_purchase_price_eth yet; avoid inserting unknown column
    const { last_purchase_price_eth, ...rest } = ticketData as any
    const insertTicket = { ...rest }
    const { data, error } = await supabaseAdmin
      .from('tickets')
      .insert([insertTicket])
      .select(`
        *,
        event:events(*)
      `)
      .single()

    if (error) {
      console.error('❌ Error creating ticket:', error)
      return null
    }

    console.log('✅ Ticket created:', data.id)
    return data
  }

  static async getUserTickets(userId: string): Promise<Ticket[]> {
    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not available')
      return []
    }

    const { data, error } = await supabaseAdmin
      .from('tickets')
      .select(`
        *,
        event:events(*)
      `)
      .eq('owner_id', userId)
      .order('purchased_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching user tickets:', error)
      return []
    }

    return data || []
  }

  static async getTicketsByEvent(eventId: string): Promise<Ticket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('event_id', eventId)

    if (error) {
      console.error('❌ Error fetching event tickets:', error)
      return []
    }

    return data || []
  }

  // Marketplace Listings
  static async createListing(listing: {
    event_id: string
    ticket_id: string
    nft_address: string
    token_id: number
    seller_id: string
    price_eth: number
    tx_hash?: string
  }): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert([{ ...listing, status: 'active' }])
      .select(`*, event:events(*), ticket:tickets(*)`)
      .single()

    if (error) {
      console.error('❌ Error creating listing:', error)
      return null
    }
    return data
  }

  static async cancelListing(nftAddress: string, tokenId: number): Promise<boolean> {
    const { error } = await supabase
      .from('marketplace_listings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('nft_address', nftAddress)
      .eq('token_id', tokenId)
      .eq('status', 'active')

    if (error) {
      console.error('❌ Error cancelling listing:', error)
      return false
    }
    return true
  }

  static async markListingSold(nftAddress: string, tokenId: number, buyerId: string, txHash?: string): Promise<boolean> {
    const { error } = await supabase
      .from('marketplace_listings')
      .update({ status: 'sold', updated_at: new Date().toISOString(), tx_hash: txHash })
      .eq('nft_address', nftAddress)
      .eq('token_id', tokenId)
      .eq('status', 'active')

    if (error) {
      console.error('❌ Error marking listing sold:', error)
      return false
    }
    return true
  }

  static async getActiveListingsByEvent(eventId: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('marketplace_listings')
      .select(`*, event:events(*), ticket:tickets(*)`)
      .eq('event_id', eventId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching listings:', error)
      return []
    }
    return data || []
  }

  static async transferTicket(ticketId: string, newOwnerId: string): Promise<boolean> {
    const { error } = await supabase
      .from('tickets')
      .update({ owner_id: newOwnerId, updated_at: new Date().toISOString() })
      .eq('id', ticketId)

    if (error) {
      console.error('❌ Error transferring ticket:', error)
      return false
    }

    return true
  }

  static async updateTicketAfterResale(ticketId: string, newOwnerId: string, newPriceEth: number): Promise<boolean> {
    const { error } = await supabase
      .from('tickets')
      .update({ owner_id: newOwnerId, last_purchase_price_eth: newPriceEth, updated_at: new Date().toISOString() })
      .eq('id', ticketId)

    if (error) {
      console.error('❌ Error updating ticket after resale:', error)
      return false
    }
    return true
  }

  // Purchase History
  static async createPurchaseRecord(purchaseData: {
    user_id: string
    event_id: string
    ticket_id?: string
    payment_method: 'crypto' | 'fiat'
    amount_usd: number
    gas_cost_eth?: number
    status?: 'pending' | 'completed' | 'failed'
  }): Promise<PurchaseHistory | null> {
    const { data, error } = await supabase
      .from('purchase_history')
      .insert([{
        ...purchaseData,
        status: purchaseData.status || 'pending'
      }])
      .select(`
        *,
        event:events(*),
        ticket:tickets(*)
      `)
      .single()

    if (error) {
      console.error('❌ Error creating purchase record:', error)
      return null
    }

    return data
  }

  static async updatePurchaseStatus(purchaseId: string, status: 'completed' | 'failed', ticketId?: string): Promise<boolean> {
    const updateData: any = { status }
    if (ticketId) {
      updateData.ticket_id = ticketId
    }

    const { error } = await supabase
      .from('purchase_history')
      .update(updateData)
      .eq('id', purchaseId)

    if (error) {
      console.error('❌ Error updating purchase status:', error)
      return false
    }

    return true
  }

  static async getUserPurchaseHistory(userId: string): Promise<PurchaseHistory[]> {
    const { data, error } = await supabase
      .from('purchase_history')
      .select(`
        *,
        event:events(*),
        ticket:tickets(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching purchase history:', error)
      return []
    }

    return data || []
  }

  // Analytics
  static async getEventStats(eventId: string) {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('payment_method, purchase_price_usd')
      .eq('event_id', eventId)

    if (error) {
      console.error('❌ Error fetching event stats:', error)
      return null
    }

    const totalSales = tickets.reduce((sum, ticket) => sum + (ticket.purchase_price_usd || 0), 0)
    const cryptoSales = tickets.filter(t => t.payment_method === 'crypto').length
    const fiatSales = tickets.filter(t => t.payment_method === 'fiat').length

    return {
      totalTickets: tickets.length,
      totalSales,
      cryptoSales,
      fiatSales
    }
  }

  // Health Check
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('count')
        .limit(1)

      if (error) {
        console.error('❌ Supabase connection test failed:', error)
        return false
      }

      console.log('✅ Supabase connection successful')
      return true
    } catch (error) {
      console.error('❌ Supabase connection error:', error)
      return false
    }
  }
}
