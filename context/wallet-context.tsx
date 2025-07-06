"use client"

import { ethers } from "ethers"
import { createContext, useContext, useState, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

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
  walletType: string | null
  connect: (type: string) => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
  const [balance, setBalance] = useState("1.245")
  const [walletType, setWalletType] = useState<string | null>(null)
  const { toast } = useToast()

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
        setWalletType(type)
        setAddress(address)
        
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

  //   // Simulate wallet connection

  //   setIsConnected(true)
  //   setWalletType(type)

  //   // Generate a random Ethereum address
  //   const randomAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
  //   setAddress(randomAddress)

  //   // Set a random balance
  //   const randomBalance = (Math.random() * 5).toFixed(3)
  //   setBalance(randomBalance)

  //   toast({
  //     title: "Wallet Connected",
  //     description: `Successfully connected to ${type} wallet`,
  //   })
  // }

  const disconnect = () => {
    setIsConnected(false)
    setWalletType(null)
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
        connect,
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