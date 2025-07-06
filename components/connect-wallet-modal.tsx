"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/context/wallet-context"
import { Loader2 } from "lucide-react"

interface ConnectWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { connect } = useWallet()
  const [isConnecting, setIsConnecting] = useState(false)
  const [activeTab, setActiveTab] = useState("crypto")

  const handleConnect = async (walletType: string) => {
    setIsConnecting(true)

    try {
      await connect(walletType)
      setIsConnecting(false)
      onClose()
    } catch (error) {
      console.error("Connection failed:", error)
      setIsConnecting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Connect Your Wallet</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="crypto" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="crypto">Crypto Wallet</TabsTrigger>
            <TabsTrigger value="fiat">Credit Card</TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="mt-4 space-y-4">
            <Button
              variant="outline"
              className="w-full justify-between h-14 px-4"
              onClick={() => handleConnect("metamask")}
              disabled={isConnecting}
            >
              <span className="flex items-center">
                <img src="/placeholder.svg?height=32&width=32" alt="MetaMask" className="h-8 w-8 mr-2" />
                MetaMask
              </span>
              {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between h-14 px-4"
              onClick={() => handleConnect("coinbase")}
              disabled={isConnecting}
            >
              <span className="flex items-center">
                <img src="/placeholder.svg?height=32&width=32" alt="Coinbase Wallet" className="h-8 w-8 mr-2" />
                Coinbase Wallet
              </span>
              {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between h-14 px-4"
              onClick={() => handleConnect("walletconnect")}
              disabled={isConnecting}
            >
              <span className="flex items-center">
                <img src="/placeholder.svg?height=32&width=32" alt="WalletConnect" className="h-8 w-8 mr-2" />
                WalletConnect
              </span>
              {isConnecting && <Loader2 className="h-4 w-4 animate-spin" />}
            </Button>
          </TabsContent>

          <TabsContent value="fiat" className="mt-4 space-y-4">
            <div className="space-y-4 border rounded-lg p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full p-2 rounded-md border bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiry Date</label>
                  <input type="text" placeholder="MM/YY" className="w-full p-2 rounded-md border bg-transparent" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">CVC</label>
                  <input type="text" placeholder="123" className="w-full p-2 rounded-md border bg-transparent" />
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                onClick={() => handleConnect("credit")}
                disabled={isConnecting}
              >
                {isConnecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Connect with Credit Card
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
