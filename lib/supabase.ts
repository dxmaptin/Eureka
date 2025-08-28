import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // We'll use custom auth integration with Magic.link and MetaMask
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Admin client for server-side operations that bypass RLS
// Only available on the server side where SUPABASE_SERVICE_ROLE_KEY is accessible
export const supabaseAdmin = (() => {
  if (typeof window !== 'undefined') {
    // Client side - return null, this should not be used on client
    return null
  }
  
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not set; admin operations will be disabled')
    return null
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
})()

// Database types for TypeScript
export interface User {
  id: string
  wallet_address: string
  email?: string
  phone?: string
  login_method: 'magic_email' | 'magic_phone' | 'magic_social' | 'metamask'
  display_name?: string
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  name: string
  description?: string
  date: string
  time: string
  location: string
  category: string
  price_usd: number
  price_eth: number
  image_url?: string
  total_tickets: number
  sold_tickets: number
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Ticket {
  id: string
  event_id: string
  owner_id: string
  token_id: number
  transaction_hash: string
  purchase_price_usd?: number
  purchase_price_eth?: number
  last_purchase_price_eth?: number
  payment_method: 'crypto' | 'fiat'
  metadata_uri: string
  purchased_at: string
  created_at: string
  // Joined data
  event?: Event
}

export interface PurchaseHistory {
  id: string
  user_id: string
  event_id: string
  ticket_id: string
  payment_method: 'crypto' | 'fiat'
  amount_usd: number
  gas_cost_eth: number
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  // Joined data
  event?: Event
  ticket?: Ticket
}

export interface Listing {
  id: string
  event_id: string
  ticket_id: string
  nft_address: string
  token_id: number
  seller_id: string
  price_eth: number
  status: 'active' | 'sold' | 'cancelled'
  tx_hash?: string
  created_at: string
  updated_at: string
  // Joined data
  ticket?: Ticket
  event?: Event
}
