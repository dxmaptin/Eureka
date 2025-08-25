"use client"

import { ethers } from "ethers"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import { magic, type MagicUser, getDemoUser, addDemoUser } from "@/lib/magic"

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
  const [address, setAddress] = useState("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
  const [balance, setBalance] = useState("1.245")
  const [walletType, setWalletType] = useState<'metamask' | 'magic' | null>(null)
  const [user, setUser] = useState<MagicUser | null>(null)
  const [loginMethod, setLoginMethod] = useState<'wallet' | 'email' | 'phone' | 'social' | null>(null)
  const { toast } = useToast()

  const isCustodial = walletType === 'magic'

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
                const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/your-project-id')
                const balance = await provider.getBalance(userAddress)
                setBalance(ethers.formatEther(balance))
              } catch (error) {
                console.warn('Could not fetch balance:', error)
                setBalance('0.0')
              }
            }

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
    if (!magic) {
      toast({
        title: "Magic Not Available",
        description: "Please check your Magic configuration.",
        variant: "destructive",
      })
      return
    }

    try {
      // Real Magic.link email authentication with OTP
      await magic.auth.loginWithEmailOTP({ email })
      
      // Get user info after successful login
      const metadata = await magic.user.getInfo()
      const userAddress = metadata.publicAddress || ''
      
      // Set user state
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
      toast({
        title: "Email Login Failed",
        description: "Please check your email for the login link and try again.",
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
      // Real Magic.link SMS authentication with OTP
      await magic.auth.loginWithSMS({ phoneNumber: phone })
      
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
      toast({
        title: "Phone Login Failed",
        description: "Please check your SMS for the OTP and try again.",
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