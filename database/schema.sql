-- Eureka Ticketing Platform Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT,
  phone TEXT,
  login_method TEXT NOT NULL CHECK (login_method IN ('magic_email', 'magic_phone', 'magic_social', 'metamask')),
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  price_eth DECIMAL(18,8) NOT NULL,
  image_url TEXT,
  total_tickets INTEGER NOT NULL CHECK (total_tickets > 0),
  sold_tickets INTEGER DEFAULT 0 CHECK (sold_tickets >= 0),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure sold tickets doesn't exceed total tickets
  CONSTRAINT check_ticket_count CHECK (sold_tickets <= total_tickets)
);

-- Create tickets table
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_id INTEGER NOT NULL,
  transaction_hash TEXT NOT NULL,
  purchase_price_usd DECIMAL(10,2),
  purchase_price_eth DECIMAL(18,8),
  -- Tracks the most recent purchase price to enforce 2x cap client-side
  last_purchase_price_eth DECIMAL(18,8),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('crypto', 'fiat')),
  metadata_uri TEXT NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique token_id per event (NFT constraint)
  UNIQUE(event_id, token_id)
);

-- Create purchase_history table
CREATE TABLE purchase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('crypto', 'fiat')),
  amount_usd DECIMAL(10,2) NOT NULL,
  gas_cost_eth DECIMAL(18,8) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_tickets_owner_id ON tickets(owner_id);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_transaction_hash ON tickets(transaction_hash);
CREATE INDEX idx_purchase_history_user_id ON purchase_history(user_id);
CREATE INDEX idx_purchase_history_created_at ON purchase_history(created_at);

-- Secondary marketplace listings
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  nft_address TEXT NOT NULL,
  token_id INTEGER NOT NULL,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price_eth DECIMAL(18,8) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','cancelled')),
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(nft_address, token_id)
);

CREATE INDEX idx_marketplace_listings_event ON marketplace_listings(event_id);
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_seller ON marketplace_listings(seller_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update sold_tickets count when tickets are purchased
CREATE OR REPLACE FUNCTION update_sold_tickets()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events 
        SET sold_tickets = sold_tickets + 1 
        WHERE id = NEW.event_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events 
        SET sold_tickets = sold_tickets - 1 
        WHERE id = OLD.event_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' AND OLD.event_id != NEW.event_id THEN
        -- If ticket is transferred to different event (unlikely but possible)
        UPDATE events SET sold_tickets = sold_tickets - 1 WHERE id = OLD.event_id;
        UPDATE events SET sold_tickets = sold_tickets + 1 WHERE id = NEW.event_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Add trigger to automatically update sold_tickets count
CREATE TRIGGER update_sold_tickets_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_sold_tickets();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Users can read all users (for display purposes) but only update their own
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (wallet_address = current_setting('app.current_user_wallet', true));
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (true);

-- Events are publicly readable, only event creators can modify
CREATE POLICY "Events are publicly viewable" ON events FOR SELECT USING (true);
CREATE POLICY "Event creators can modify events" ON events FOR UPDATE USING (created_by::text = current_setting('app.current_user_id', true));
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (true);

-- Tickets are viewable by owner, purchasable by anyone
CREATE POLICY "Users can view own tickets" ON tickets FOR SELECT USING (
  owner_id::text = current_setting('app.current_user_id', true) OR 
  current_setting('app.current_user_role', true) = 'admin'
);
CREATE POLICY "Anyone can purchase tickets" ON tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Ticket owners can update tickets" ON tickets FOR UPDATE USING (owner_id::text = current_setting('app.current_user_id', true));

-- Purchase history viewable by user only
CREATE POLICY "Users can view own purchase history" ON purchase_history FOR SELECT USING (
  user_id::text = current_setting('app.current_user_id', true) OR 
  current_setting('app.current_user_role', true) = 'admin'
);
CREATE POLICY "Anyone can create purchase records" ON purchase_history FOR INSERT WITH CHECK (true);

-- Listings policies: public read, only seller can modify their own listing
CREATE POLICY "Listings are publicly viewable" ON marketplace_listings FOR SELECT USING (true);
CREATE POLICY "Sellers can create listings" ON marketplace_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Sellers can update own listings" ON marketplace_listings FOR UPDATE USING (
  seller_id::text = current_setting('app.current_user_id', true)
);
