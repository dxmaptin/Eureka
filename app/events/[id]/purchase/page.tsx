"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/context/wallet-context"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, CreditCard, Wallet, Check, Loader2, ExternalLink, AlertCircle } from "lucide-react"
import { ethers } from "ethers"
import MyNFTAbi from "@/artifacts/contracts/MyNFT.sol/MyNFT.json"
import { Price } from "@/components/price"
import { CreditCardForm, CreditCardData } from "@/components/credit-card-form"
import type { Event } from "@/lib/supabase"
import EventHeader from "@/components/event-header"

export default function PurchasePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isConnected, address } = useWallet()
  const { toast } = useToast()

  const [quantity, setQuantity] = useState(1)
  const [purchaseStatus, setPurchaseStatus] = useState<"idle" | "processing" | "minting" | "completed" | "failed">("idle")
  const [transactionHash, setTransactionHash] = useState("")
  const [activeTab, setActiveTab] = useState("crypto")
  const [creditCardValid, setCreditCardValid] = useState(false)
  const [creditCardData, setCreditCardData] = useState<CreditCardData>()
  const [errorMessage, setErrorMessage] = useState("")
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  const feeUsd = 6
  const feeEth = 0.002

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { id } = await params
        console.log('🎫 Fetching event for purchase:', id)
        const response = await fetch(`/api/events/${id}`)
        const data = await response.json()
        
        if (data.success) {
          setEvent(data.event)
          console.log('✅ Event loaded for purchase:', data.event.name)
        } else {
          console.error('❌ Event not found:', data.error)
          router.push('/')
        }
      } catch (err) {
        console.error('❌ Error fetching event for purchase:', err)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    
    const initializePage = async () => {
      await fetchEvent()
      
      // Get quantity from URL params
      const quantityParam = searchParams.get("quantity")
      if (quantityParam) {
        setQuantity(Number.parseInt(quantityParam))
      }

      // Redirect if not connected
      if (!isConnected) {
        const { id } = await params
        router.push(`/events/${id}`)
      }
    }
    
    initializePage()
  }, [isConnected, router, searchParams, params])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading event...</span>
        </div>
      </div>
    )
  }

  if (!event) {
    return <div className="container mx-auto px-4 py-8 text-center">Event not found!</div>
  }

  // Purchase process with improved error handling
  const CONTRACT_ADDRESS = "0x593967C50E396e0b3Be8B8f7216e5786f78783cd";
  const METADATA_URI = "https://ipfs.io/ipfs/bafkreigjlju3g3lbfoo5vugyioakk4hdskzssp4f6dpw77b4ibt62gp5ay";

  const handlePurchase = async () => {
    console.log('🎫 Starting purchase process with payment method:', activeTab)
    
    // Validate credit card if using fiat payment
    if (activeTab === "fiat" && !creditCardValid) {
      setErrorMessage("Please fill in all credit card fields correctly")
      toast({
        title: "Invalid Payment Information",
        description: "Please check your credit card details and try again.",
        variant: "destructive",
      })
      return
    }

    setPurchaseStatus("processing")
    setErrorMessage("")
    
    // Set up timeout for the entire process (30 seconds)
    const timeout = setTimeout(() => {
      console.log('⏰ Purchase timeout reached')
      setPurchaseStatus("failed")
      setErrorMessage("Transaction timed out. Please try again.")
      toast({
        title: "Transaction Timeout",
        description: "The transaction took too long to process. Please try again.",
        variant: "destructive",
      })
    }, 30000) // 30 second timeout
    
    setTimeoutId(timeout)

    try {
      // Payment processing simulation
      console.log('💳 Processing payment...')
      if (activeTab === "fiat") {
        console.log('💳 Credit card payment simulation')
        // Simulate credit card processing (longer delay for realism)
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(true)
          }, 2000)
        })
      } else {
        console.log('🔗 Crypto payment preparation')
        // Shorter delay for crypto payments
        await new Promise((res) => setTimeout(res, 1000))
      }
      
      console.log('✅ Payment processed, starting minting...')
      setPurchaseStatus("minting")

      // Use relayer API for both crypto and fiat payments
      console.log('🔗 Using relayer API for minting (gas-free for user)')
      
      const { id } = await params
      const mintResponse = await fetch('/api/mint-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress: address,
          paymentMethod: activeTab,
          eventId: id,
          quantity: quantity
        })
      })
      
      const mintResult = await mintResponse.json()
      
      if (!mintResult.success) {
        throw new Error(mintResult.error || 'Minting failed')
      }
      
      console.log('📄 Transaction hash from relayer:', mintResult.transactionHash)
      console.log('💰 Gas cost covered by relayer:', mintResult.estimatedGasCost, 'ETH')
      
      setTransactionHash(mintResult.transactionHash)
      
      // Clear timeout since we succeeded
      clearTimeout(timeout)
      setTimeoutId(null)
      
      console.log('🎉 Purchase completed successfully!')
      setPurchaseStatus("completed")
      toast({
        title: "Purchase Successful",
        description: "Your NFT ticket has been minted and added to your wallet",
      })
    } catch (err) {
      console.error('❌ Purchase failed:', err)
      
      // Clear timeout
      clearTimeout(timeout)
      setTimeoutId(null)
      
      setPurchaseStatus("failed")
      const errorMsg = err instanceof Error ? err.message : "Transaction failed."
      setErrorMessage(errorMsg)
      
      toast({
        title: "Purchase Failed",
        description: errorMsg,
        variant: "destructive",
      })
    }
  }

  const handleRetry = () => {
    console.log('🔄 Retrying purchase...')
    setPurchaseStatus("idle")
    setErrorMessage("")
    setTransactionHash("")
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
  }

  const handleBack = async () => {
    const { id } = await params
    router.push(`/events/${id}`)
  }

  const handleViewTickets = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <EventHeader />
      <div className="h-24"></div>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6 text-slate-300" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Purchase Form */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Complete Your Purchase</h1>

            {purchaseStatus === "idle" ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Payment Method</h2>

                  <Tabs defaultValue="crypto" value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="crypto">
                        <Wallet className="mr-2 h-4 w-4" />
                        Crypto
                      </TabsTrigger>
                      <TabsTrigger value="fiat">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Credit Card
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="crypto" className="mt-4">
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-900 rounded-lg">
                          <div className="text-sm text-slate-400 mb-1">Connected Wallet</div>
                          <div className="text-slate-200 font-mono">{address}</div>
                        </div>

                        <div className="p-4 bg-slate-900 rounded-lg">
                          <div className="text-sm text-slate-400 mb-1">Network</div>
                          <div className="text-slate-200">Ethereum Sepolia (Testnet)</div>
                          <div className="text-xs text-slate-500 mt-1">Gas fees covered by relayer</div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="fiat" className="mt-4">
                      <CreditCardForm 
                        onValidityChange={setCreditCardValid}
                        onDataChange={setCreditCardData}
                      />
                    </TabsContent>
                  </Tabs>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                    onClick={handlePurchase}
                    disabled={activeTab === "fiat" && !creditCardValid}
                  >
                    {activeTab === "fiat" && !creditCardValid 
                      ? "Please Complete Payment Details" 
                      : "Complete Purchase"
                    }
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    {purchaseStatus === "processing" && (
                      <>
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-500" />
                        <h2 className="text-xl font-semibold text-white mb-2">Processing Payment</h2>
                        <p className="text-slate-400">Please wait while we process your payment...</p>
                      </>
                    )}

                    {purchaseStatus === "minting" && (
                      <>
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-purple-500" />
                        <h2 className="text-xl font-semibold text-white mb-2">Minting NFT Tickets</h2>
                        <p className="text-slate-400">Your tickets are being minted on the blockchain...</p>

                        <div className="mt-4 p-3 bg-slate-900 rounded-lg text-left">
                          <div className="text-sm text-slate-400 mb-1">Transaction Hash</div>
                          <div className="text-slate-200 font-mono text-xs truncate">{transactionHash}</div>
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="text-purple-400 text-sm flex items-center mt-1 hover:text-purple-300"
                          >
                            View on Sepolia Etherscan
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </>
                    )}

                    {purchaseStatus === "completed" && (
                      <>
                        <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                          <Check className="h-6 w-6 text-green-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Purchase Complete!</h2>
                        <p className="text-slate-400 mb-6">
                          Your NFT tickets have been minted and added to your wallet
                        </p>

                        <Button
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                          onClick={handleViewTickets}
                        >
                          View My Tickets
                        </Button>
                      </>
                    )}

                    {purchaseStatus === "failed" && (
                      <>
                        <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="h-6 w-6 text-red-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">Purchase Failed</h2>
                        <p className="text-slate-400 mb-6">
                          {errorMessage || "Something went wrong with your purchase. Please try again."}
                        </p>

                        <div className="space-y-3">
                          <Button
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                            onClick={handleRetry}
                          >
                            Try Again
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full text-slate-300 hover:text-white"
                            onClick={handleBack}
                          >
                            Back to Event
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>

            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="h-16 w-16 rounded-md bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url(${event.image_url})` }}
                  />
                  <div>
                    <h3 className="font-medium text-white">{event.name}</h3>
                    <div className="text-sm text-slate-400">
                      {event.date} at {event.time}
                    </div>
                    <div className="text-sm text-slate-400">{event.location}</div>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4 mt-4">
                  <div className="flex justify-between text-slate-300 mb-2">
                    <span>Tickets ({quantity})</span>
                    <span>
                      {isConnected
                        ? `$${(event.price_usd * quantity).toFixed(2)} / ${(event.price_eth * quantity).toFixed(3)} ETH`
                        : `$${(event.price_usd * quantity).toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-300 mb-2">
                    <span>Transaction fee (est.)</span>
                    <span>{isConnected ? `$${feeUsd} / ${feeEth} ETH` : `$${feeUsd}`}</span>
                  </div>

                  <div className="border-t border-slate-700 pt-2 mt-2">
                    <div className="flex justify-between text-white font-semibold">
                      <span>Total</span>
                      <span>
                        {isConnected
                          ? `$${(event.price_usd * quantity + feeUsd).toFixed(2)} / ${(event.price_eth * quantity + feeEth).toFixed(3)} ETH`
                          : `$${(event.price_usd * quantity + feeUsd).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <h3 className="font-medium text-white mb-3">What You'll Receive</h3>

                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>
                      {quantity} NFT ticket{quantity > 1 ? "s" : ""} for {event.name}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Unique QR code for venue entry</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Ability to transfer or resell your ticket on NFT marketplaces</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Commemorative digital collectible</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
