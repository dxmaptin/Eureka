import { Magic } from 'magic-sdk'
import { OAuthExtension } from '@magic-ext/oauth'

// Initialize Magic with your actual keys
const createMagicInstance = () => {
  if (typeof window === 'undefined') {
    console.log('🔍 Magic: Running on server side, skipping initialization')
    return null
  }
  
  const publishableKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY
  console.log('🔍 Magic publishable key present:', !!publishableKey)
  console.log('🔍 Magic publishable key starts with:', publishableKey?.slice(0, 8) + '...')
  
  if (!publishableKey) {
    console.warn('❌ Magic publishable key not found')
    return null
  }

  console.log('✅ Creating Magic instance with network: sepolia')
  console.log('🌐 Current domain:', typeof window !== 'undefined' ? window.location.origin : 'server-side')
  
  try {
    const magicInstance = new Magic(publishableKey, {
      network: {
        rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
        chainId: 11155111,
      },
      extensions: [new OAuthExtension()]
    })
    
    console.log('✅ Magic instance created successfully')
    return magicInstance
  } catch (error) {
    console.error('❌ Failed to create Magic instance:', error)
    
    // Fallback: try with just the network string
    try {
      const fallbackMagicInstance = new Magic(publishableKey, {
        network: 'sepolia',
        extensions: [new OAuthExtension()]
      })
      console.log('✅ Magic instance created with fallback configuration')
      return fallbackMagicInstance
    } catch (fallbackError) {
      console.error('❌ Fallback Magic instance creation also failed:', fallbackError)
      return null
    }
  }
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