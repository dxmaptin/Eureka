"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

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

  const connect = (type: string) => {
    // Simulate wallet connection
    setIsConnected(true)
    setWalletType(type)

    // Generate a random Ethereum address
    const randomAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
    setAddress(randomAddress)

    // Set a random balance
    const randomBalance = (Math.random() * 5).toFixed(3)
    setBalance(randomBalance)

    toast({
      title: "Wallet Connected",
      description: `Successfully connected to ${type} wallet`,
    })
  }

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
