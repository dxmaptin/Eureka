-- Insert sample events data for Eureka Ticketing Platform
-- Run this after creating the schema

INSERT INTO events (id, name, description, date, time, location, category, price_usd, price_eth, image_url, total_tickets, sold_tickets) VALUES
(
  gen_random_uuid(),
  'Blockchain Summit 2024',
  'Join industry leaders and innovators for the biggest blockchain conference of the year. Learn about the latest developments in DeFi, NFTs, and Web3 technologies.',
  '2024-06-15',
  '10:00:00',
  'San Francisco, CA',
  'Conference',
  450.00,
  0.15,
  '/conference.jpeg',
  200,
  156
),
(
  gen_random_uuid(),
  'NFT Art Exhibition',
  'Discover groundbreaking digital art from renowned NFT artists. Experience the intersection of technology and creativity in this immersive exhibition.',
  '2024-07-22',
  '18:00:00',
  'New York, NY',
  'Exhibition',
  240.00,
  0.08,
  '/NFTartexhibition.jpeg',
  150,
  89
),
(
  gen_random_uuid(),
  'Web3 Music Festival',
  'The first decentralized music festival featuring top artists and blockchain-powered experiences. Dance to the future of music entertainment.',
  '2024-08-05',
  '16:00:00',
  'Miami, FL',
  'Festival',
  750.00,
  0.25,
  '/cypher.png',
  500,
  412
),
(
  gen_random_uuid(),
  'DeFi Developer Conference',
  'Deep dive into DeFi protocols, smart contract development, and yield farming strategies. Perfect for developers and DeFi enthusiasts.',
  '2024-09-10',
  '09:00:00',
  'Austin, TX',
  'Conference',
  360.00,
  0.12,
  '/defi.jpeg',
  300,
  78
),
(
  gen_random_uuid(),
  'Metaverse Concert',
  'Experience live music in virtual reality with top-tier artists performing in stunning metaverse venues. The future of live entertainment.',
  '2024-10-18',
  '20:00:00',
  'Los Angeles, CA',
  'Concert',
  540.00,
  0.18,
  '/metaverse.jpg',
  400,
  245
),
(
  gen_random_uuid(),
  'Crypto Gaming Tournament',
  'Compete in blockchain-based games for cryptocurrency prizes. Join the play-to-earn revolution with competitive gaming.',
  '2024-11-25',
  '14:00:00',
  'Seattle, WA',
  'Gaming',
  150.00,
  0.05,
  '/gaming.jpeg',
  250,
  120
);
