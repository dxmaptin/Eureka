import { Magic } from 'magic-sdk'
import { OAuthExtension } from '@magic-ext/oauth'

// Initialize Magic with your actual keys
const createMagicInstance = () => {
  if (typeof window === 'undefined') return null
  
  const publishableKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY
  if (!publishableKey) {
    console.warn('Magic publishable key not found')
    return null
  }

  return new Magic(publishableKey, {
    network: 'sepolia', // ethereum-sepolia as per your config
    extensions: [new OAuthExtension()]
  })
}

export const magic = createMagicInstance()

// Types for Magic user
export interface MagicUser {
  issuer: string
  email?: string
  phoneNumber?: string
  publicAddress?: string
  oauthProvider?: string
}

// Test/demo data - kept for fallback
export const demoUsers: MagicUser[] = [
  {
    issuer: 'did:ethr:0x1234567890123456789012345678901234567890',
    email: 'demo@example.com',
    publicAddress: '0x1234567890123456789012345678901234567890'
  }
]

export const getDemoUser = (email: string): MagicUser | null => {
  return demoUsers.find(user => user.email === email) || null
}

export const addDemoUser = (user: MagicUser): void => {
  demoUsers.push(user)
}