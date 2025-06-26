"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { BrowserProvider, formatEther } from "ethers"
import { useToast } from "@/components/ui/use-toast"

interface WalletContextType {
  isConnected: boolean
  address: string
  balance: string
  walletType: string | null
  connect: (type: string) => Promise<void>
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
      if (typeof window === "undefined" || !(window as any).ethereum) {
        toast({
          title: "MetaMask Not Found",
          description: "Please install the MetaMask browser extension",
        })
        return
      }

      try {
        const provider = new BrowserProvider((window as any).ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = await provider.getSigner()
        const addr = await signer.getAddress()
        const bal = await provider.getBalance(addr)

        setAddress(addr)
        setBalance(parseFloat(formatEther(bal)).toFixed(3))
        setWalletType("metamask")
        setIsConnected(true)

        toast({
          title: "Wallet Connected",
          description: "Successfully connected to MetaMask",
        })
      } catch (err) {
        console.error(err)
        toast({
          title: "Connection Failed",
          description: "Failed to connect to MetaMask",
        })
      }
      return
    }

    // Fallback simulation for other wallet types
    setIsConnected(true)
    setWalletType(type)
    const randomAddress = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
    setAddress(randomAddress)
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
