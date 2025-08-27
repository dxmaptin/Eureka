"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/context/wallet-context"
import { Wallet, Mail, Phone, Globe, Hash, Loader2 } from "lucide-react"

interface ConnectWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { connect, connectWithEmail, connectWithPhone, connectWithSocial } = useWallet()
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleMetaMaskConnect = async () => {
    setIsLoading(true)
    try {
      await connect("metamask")
      onClose()
    } catch (error) {
      console.error("MetaMask connection failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailConnect = async () => {
    console.log('🎯 Email connect button clicked, email:', email)
    
    if (!email.trim()) {
      console.log('❌ Email is empty')
      return
    }
    
    console.log('📝 Setting loading state and closing modal...')
    setIsLoading(true)
    
    try {
      // Close this modal first to prevent conflicts with Magic's modal
      console.log('🔒 Closing connect modal...')
      onClose()
      
      console.log('📞 Calling connectWithEmail...')
      await connectWithEmail(email)
      
      console.log('✅ Email authentication completed successfully')
    } catch (error) {
      console.error("❌ Email login failed:", error)
      // Reopen modal on error
      // Note: We don't automatically reopen to avoid UI conflicts
    } finally {
      console.log('🔄 Resetting loading state')
      setIsLoading(false)
    }
  }

  const handlePhoneConnect = async () => {
    if (!phone.trim()) return
    
    setIsLoading(true)
    try {
      // Close this modal first to prevent conflicts with Magic's modal
      onClose()
      await connectWithPhone(phone)
    } catch (error) {
      console.error("Phone login failed:", error)
      // Reopen modal on error
      // Note: We don't automatically reopen to avoid UI conflicts
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialConnect = async (provider: string) => {
    setIsLoading(true)
    try {
      await connectWithSocial(provider)
      onClose()
    } catch (error) {
      console.error(`${provider} login failed:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Connect to Eureka</DialogTitle>
          <DialogDescription className="text-slate-300">
            Connect your wallet or sign in with email to purchase tickets
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-700">
            <TabsTrigger value="wallet" className="text-slate-300 data-[state=active]:text-white">
              <Wallet className="w-4 h-4 mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="email" className="text-slate-300 data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="social" className="text-slate-300 data-[state=active]:text-white">
              <Phone className="w-4 h-4 mr-2" />
              Social
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-4">
            <div className="text-sm text-slate-400 text-center">
              Connect with your crypto wallet
            </div>
            <Button
              onClick={handleMetaMaskConnect}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
              {isLoading ? "Connecting..." : "Connect MetaMask"}
            </Button>
            <div className="text-xs text-slate-500 text-center">
              You control your wallet and pay gas fees
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="text-sm text-slate-400 text-center">
              Sign in with your email - no wallet required
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                onKeyDown={(e) => e.key === "Enter" && handleEmailConnect()}
              />
            </div>
            <Button
              onClick={handleEmailConnect}
              disabled={isLoading || !email.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              {isLoading ? "Signing in..." : "Sign in with Email"}
            </Button>

            <Separator className="bg-slate-600" />

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                onKeyDown={(e) => e.key === "Enter" && handlePhoneConnect()}
              />
            </div>
            <Button
              onClick={handlePhoneConnect}
              disabled={isLoading || !phone.trim()}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
              {isLoading ? "Signing in..." : "Sign in with Phone"}
            </Button>

            <div className="text-xs text-slate-500 text-center">
              We manage your wallet and cover gas fees
            </div>
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            <div className="text-sm text-slate-400 text-center">
              Connect with your social accounts
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => handleSocialConnect("google")}
                disabled={isLoading}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                Continue with Google
              </Button>
              <Button
                onClick={() => handleSocialConnect("twitter")}
                disabled={isLoading}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Hash className="mr-2 h-4 w-4" />}
                Continue with Twitter
              </Button>
              <Button
                onClick={() => handleSocialConnect("discord")}
                disabled={isLoading}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <div className="mr-2 h-4 w-4 bg-indigo-500 rounded-sm" />}
                Continue with Discord
              </Button>
            </div>
            <div className="text-xs text-slate-500 text-center">
              Quick signup with your existing accounts
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-xs text-slate-500 text-center pt-2">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  )
}
