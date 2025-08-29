"use client"

import { ethers } from "ethers"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { magic, type MagicUser, getDemoUser, addDemoUser } from "@/lib/magic"
import { DatabaseService } from "@/lib/database"
import type { User } from "@/lib/supabase"

//For ethereum declaration
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletContextType {
  isConnected: boolean
  address: string
  balance: string
  walletType: 'metamask' | 'magic' | null
  user: MagicUser | null
  dbUser: User | null
  loginMethod: 'wallet' | 'email' | 'phone' | 'social' | null
  isCustodial: boolean
  connect: (type: string) => void
  connectWithEmail: (email: string) => Promise<void>
  connectWithPhone: (phone: string) => Promise<void>
  connectWithSocial: (provider: string) => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState("")
  const [balance, setBalance] = useState("")
  const [walletType, setWalletType] = useState<'metamask' | 'magic' | null>(null)
  const [user, setUser] = useState<MagicUser | null>(null)
  const [dbUser, setDbUser] = useState<User | null>(null)
  const [loginMethod, setLoginMethod] = useState<'wallet' | 'email' | 'phone' | 'social' | null>(null)
  const { toast } = useToast()

  const isCustodial = walletType === 'magic'

  // Helper function to create/update user in database
  const syncUserWithDatabase = async (walletAddress: string, userData: {
    email?: string
    phone?: string
    loginMethod: 'magic_email' | 'magic_phone' | 'magic_social' | 'metamask'
  }) => {
    console.log('🔄 Syncing user with database:', walletAddress, userData)
    
    try {
      const dbUserData = await DatabaseService.createOrUpdateUser({
        wallet_address: walletAddress,
        email: userData.email,
        phone: userData.phone,
        login_method: userData.loginMethod
      })
      
      console.log('📊 Database response:', dbUserData)
      
      if (dbUserData) {
        setDbUser(dbUserData)
        console.log('✅ User synced with database:', dbUserData.id)
        toast({
          title: "Account synced",
          description: "Your wallet is now connected to your account",
          variant: "default"
        })
      } else {
        console.log('❌ No user data returned from database')
        toast({
          title: "Database sync failed",
          description: "Could not sync with user database",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('❌ Error syncing user with database:', error)
      console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
      toast({
        title: "Database error",
        description: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    }
  }

  // Check if user is already logged in with Magic on component mount
  useEffect(() => {
    const checkMagicUser = async () => {
      if (magic && typeof window !== 'undefined') {
        try {
          const isLoggedIn = await magic.user.isLoggedIn()
          if (isLoggedIn) {
            const metadata = await magic.user.getInfo()
            const userAddress = metadata.publicAddress || ''
            
            setUser(metadata as MagicUser)
            setIsConnected(true)
            setWalletType('magic')
            setAddress(userAddress)
            
            // Determine login method based on metadata
            if (metadata.email) {
              setLoginMethod('email')
            } else if (metadata.phoneNumber) {
              setLoginMethod('phone')
            } else {
              setLoginMethod('social') // OAuth login
            }
            
            // Get balance
            if (userAddress) {
              try {
                const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com')
                const balance = await provider.getBalance(userAddress)
                setBalance(ethers.formatEther(balance))
              } catch (error) {
                console.warn('Could not fetch balance:', error)
                setBalance('0.0')
              }
            }

            // Sync DB user now that we have Magic identity
            await syncUserWithDatabase(userAddress, {
              email: metadata.email || undefined,
              phone: (metadata as any).phoneNumber || undefined,
              loginMethod: metadata.email ? 'magic_email' : ((metadata as any).phoneNumber ? 'magic_phone' : 'magic_social')
            })

            // Show success message for OAuth redirects
            if (!metadata.email && !metadata.phoneNumber) {
              toast({
                title: "Social Login Successful",
                description: "Successfully logged in with social account",
              })
            }
          }
        } catch (error) {
          console.warn('Magic user check failed:', error)
        }
      }
    }
    
    checkMagicUser()
  }, [])

  const connectWithEmail = async (email: string) => {
    console.log('🔍 Starting email authentication for:', email)
    
    if (!magic) {
      console.error('❌ Magic instance not available')
      toast({
        title: "Magic Not Available",
        description: "Please check your Magic configuration.",
        variant: "destructive",
      })
      return
    }

    console.log('✅ Magic instance available, starting login...')

    try {
      // Try Magic.link email magic link authentication first
      console.log('📧 Trying magic.auth.loginWithMagicLink...')
      await magic.auth.loginWithMagicLink({ 
        email
      })
      
      console.log('✅ OTP login successful, getting user info...')
      
      // Get user info after successful login
      const metadata = await magic.user.getInfo()
      const userAddress = metadata.publicAddress || ''
      
      console.log('👤 User metadata received:', { 
        email: metadata.email, 
        address: userAddress?.slice(0, 6) + '...' 
      })
      
      // Set user state and sync with database
      const magicUser: MagicUser = {
        issuer: metadata.issuer || '',
        email: metadata.email || email,
        publicAddress: userAddress
      }
      
      setUser(magicUser)
      setAddress(userAddress)
      setIsConnected(true)
      setWalletType('magic')
      setLoginMethod('email')
      
      // Sync with database
      await syncUserWithDatabase(userAddress, {
        email: metadata.email || email,
        loginMethod: 'magic_email'
      })
      
      // Get balance
      if (userAddress) {
        try {
          const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/your-project-id')
          const balance = await provider.getBalance(userAddress)
          setBalance(ethers.formatEther(balance))
        } catch (error) {
          console.warn('Could not fetch balance:', error)
          setBalance('0.0')
        }
      }
      
      toast({
        title: "Email Login Successful",
        description: `Logged in with ${email}`,
      })
    } catch (error) {
      console.error("Error logging in with email:", error)
      
      // Handle specific Magic.link errors
      let errorMessage = "Please check your email for the login link and try again."
      
      if (error instanceof Error) {
        // Handle specific Magic.link error codes
        if (error.message.includes('User denied')) {
          errorMessage = "Login was cancelled. Please try again."
        } else if (error.message.includes('Network')) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (error.message.includes('Rate limit')) {
          errorMessage = "Too many login attempts. Please wait a moment and try again."
        }
      }
      
      toast({
        title: "Email Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const connectWithPhone = async (phone: string) => {
    if (!magic) {
      toast({
        title: "Magic Not Available",
        description: "Please check your Magic configuration.",
        variant: "destructive",
      })
      return
    }

    try {
      // Real Magic.link SMS authentication with OTP - use Magic's built-in UI
      await magic.auth.loginWithSMS({ 
        phoneNumber: phone,
        showUI: true  // This enables Magic's built-in OTP modal
      })
      
      // Get user info after successful login
      const metadata = await magic.user.getInfo()
      const userAddress = metadata.publicAddress || ''
      
      // Set user state
      const magicUser: MagicUser = {
        issuer: metadata.issuer || '',
        phoneNumber: metadata.phoneNumber || phone,
        publicAddress: userAddress
      }
      
      setUser(magicUser)
      setAddress(userAddress)
      setIsConnected(true)
      setWalletType('magic')
      setLoginMethod('phone')

      // Sync with database
      await syncUserWithDatabase(userAddress, {
        phone: metadata.phoneNumber || phone,
        loginMethod: 'magic_phone'
      })

      // Get balance
      if (userAddress) {
        try {
          const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/your-project-id')
          const balance = await provider.getBalance(userAddress)
          setBalance(ethers.formatEther(balance))
        } catch (error) {
          console.warn('Could not fetch balance:', error)
          setBalance('0.0')
        }
      }
      
      toast({
        title: "Phone Login Successful",
        description: `Logged in with ${phone}`,
      })
    } catch (error) {
      console.error("Error logging in with phone:", error)
      
      // Handle specific Magic.link errors
      let errorMessage = "Please check your SMS for the OTP and try again."
      
      if (error instanceof Error) {
        // Handle specific Magic.link error codes
        if (error.message.includes('User denied')) {
          errorMessage = "Login was cancelled. Please try again."
        } else if (error.message.includes('Network')) {
          errorMessage = "Network error. Please check your connection and try again."
        } else if (error.message.includes('Rate limit')) {
          errorMessage = "Too many login attempts. Please wait a moment and try again."
        } else if (error.message.includes('Invalid phone')) {
          errorMessage = "Please enter a valid phone number."
        }
      }
      
      toast({
        title: "Phone Login Failed", 
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const connectWithSocial = async (provider: string) => {
    if (!magic) {
      toast({
        title: "Magic Not Available",
        description: "Please check your Magic configuration.",
        variant: "destructive",
      })
      return
    }

    try {
      // Real Magic.link OAuth authentication with proper redirect URI
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      
      await magic.oauth.loginWithRedirect({
        provider: provider as any, // google, twitter, discord, etc.
        redirectURI: `${currentOrigin}`,  // Redirect back to home page
        scope: ['email', 'profile'] // Request basic profile info
      })
      
      // Note: The rest of the flow happens after redirect
      // This code won't execute until the user returns from OAuth
      
    } catch (error) {
      console.error(`Error logging in with ${provider}:`, error)
      toast({
        title: "Social Login Failed",
        description: "Please make sure social login is configured in your Magic Dashboard.",
        variant: "destructive",
      })
    }
  }

  const connect = async (type: string) => {
    if (type === "metamask") {
      if (typeof window === "undefined" || !window.ethereum) {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to connect your wallet.",
          variant: "destructive",
        })
        return
      }
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        const address = accounts[0]
        setIsConnected(true)
        setWalletType('metamask')
        setLoginMethod('wallet')
        setAddress(address)
        setUser(null) // Clear Magic user
        
        // Sync with database
        await syncUserWithDatabase(address, {
          loginMethod: 'metamask'
        })
        
        // Get Balance of the connected account
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balanceValue = await provider.getBalance(address)
        setBalance(ethers.formatEther(balanceValue))
        toast({
          title: "Wallet Connected",
          description: `Successfully connected to ${type} wallet`,
        })
      } catch (error) {
        console.error("Error connecting to MetaMask:", error)
        toast({
          title: "Error Connecting to MetaMask",
          description: "Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setWalletType(null)
    setUser(null)
    setLoginMethod(null)
    
    // Logout from Magic if connected
    if (walletType === 'magic' && magic) {
      magic.user.logout().catch(console.error)
    }
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        balance,
        walletType,
        user,
        dbUser,
        loginMethod,
        isCustodial,
        connect,
        connectWithEmail,
        connectWithPhone,
        connectWithSocial,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
