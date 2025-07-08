"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/context/wallet-context"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, CreditCard, Wallet, Check, Loader2, ExternalLink } from "lucide-react"
import { ethers } from "ethers"
import MyNFTAbi from "@/artifacts/contracts/MyNFT.sol/MyNFT.json"

export default function PurchasePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isConnected, address } = useWallet()
  const { toast } = useToast()

  const [quantity, setQuantity] = useState(1)
  const [purchaseStatus, setPurchaseStatus] = useState<"idle" | "processing" | "minting" | "completed">("idle")
  const [transactionHash, setTransactionHash] = useState("")
  const [activeTab, setActiveTab] = useState("crypto")

  // Find event by ID (in a real app, this would be fetched from an API)
  const event = events.find((e) => e.id === params.id)

  useEffect(() => {
    // Get quantity from URL params
    const quantityParam = searchParams.get("quantity")
    if (quantityParam) {
      setQuantity(Number.parseInt(quantityParam))
    }

    // Redirect if not connected
    if (!isConnected) {
      router.push(`/events/${params.id}`)
    }
  }, [isConnected, params.id, router, searchParams])

  if (!event) {
    return <div className="container mx-auto px-4 py-8 text-center">Event not found!</div>
  }

  // Pruchase process
  const CONTRACT_ADDRESS = "0x21e8446F5Cc175AF953eF13bCf230d8349b2D992";
  const METADATA_URI = "https://ipfs.io/ipfs/bafkreigjlju3g3lbfoo5vugyioakk4hdskzssp4f6dpw77b4ibt62gp5ay";

  const handlePurchase = async () => {
    setPurchaseStatus("processing")
    try {
      // Wait for payment simulation (replace with real payment logic if needed)
      await new Promise((res) => setTimeout(res, 1500))
      setPurchaseStatus("minting")

      if (!window.ethereum) throw new Error("No wallet found")
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MyNFTAbi.abi, signer)
      const tx = await contract.mintNFT(address, METADATA_URI)
      setTransactionHash(tx.hash)
      await tx.wait()
      setPurchaseStatus("completed")
      toast({
        title: "Purchase Successful",
        description: "Your NFT ticket has been minted and added to your wallet",
      })
    } catch (err) {
      setPurchaseStatus("idle")
      toast({
        title: "Minting Failed",
        description: err instanceof Error ? err.message : "Transaction failed.",
        variant: "destructive",
      })
    }
  }

  const handleBack = () => {
    router.push(`/events/${params.id}`)
  }

  const handleViewTickets = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
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
                          <div className="text-slate-200">Ethereum Mainnet</div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="fiat" className="mt-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Card Number</label>
                          <input
                            type="text"
                            placeholder="1234 5678 9012 3456"
                            className="w-full p-2 rounded-md border border-slate-600 bg-slate-900 text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="w-full p-2 rounded-md border border-slate-600 bg-slate-900 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">CVC</label>
                            <input
                              type="text"
                              placeholder="123"
                              className="w-full p-2 rounded-md border border-slate-600 bg-slate-900 text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-300">Name on Card</label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            className="w-full p-2 rounded-md border border-slate-600 bg-slate-900 text-white"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                    onClick={handlePurchase}
                  >
                    Complete Purchase
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
                          <a href="#" className="text-purple-400 text-sm flex items-center mt-1 hover:text-purple-300">
                            View on Etherscan
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
                    style={{ backgroundImage: `url(${event.image})` }}
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
                    <span>{(event.price * quantity).toFixed(2)} ETH</span>
                  </div>

                  <div className="flex justify-between text-slate-300 mb-2">
                    <span>Gas fee (est.)</span>
                    <span>0.002 ETH</span>
                  </div>

                  <div className="border-t border-slate-700 pt-2 mt-2">
                    <div className="flex justify-between text-white font-semibold">
                      <span>Total</span>
                      <span>{(event.price * quantity + 0.002).toFixed(3)} ETH</span>
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

const events = [
  {
    id: "1",
    name: "Blockchain Summit 2023",
    date: "June 15, 2023",
    time: "10:00 AM",
    location: "San Francisco, CA",
    category: "Conference",
    price: 0.15,
    image: "/placeholder.svg?height=400&width=600",
    soldTickets: 156,
    totalTickets: 200,
  },
  {
    id: "2",
    name: "NFT Art Exhibition",
    date: "July 22, 2023",
    time: "6:00 PM",
    location: "New York, NY",
    category: "Exhibition",
    price: 0.08,
    image: "/placeholder.svg?height=400&width=600",
    soldTickets: 89,
    totalTickets: 150,
  },
  {
    id: "3",
    name: "Web3 Music Festival",
    date: "August 5, 2023",
    time: "4:00 PM",
    location: "Miami, FL",
    category: "Festival",
    price: 0.25,
    image: "/placeholder.svg?height=400&width=600",
    soldTickets: 412,
    totalTickets: 500,
  },
  {
    id: "4",
    name: "DeFi Developer Conference",
    date: "September 10, 2023",
    time: "9:00 AM",
    location: "Austin, TX",
    category: "Conference",
    price: 0.12,
    image: "/placeholder.svg?height=400&width=600",
    soldTickets: 78,
    totalTickets: 300,
  },
  {
    id: "5",
    name: "Metaverse Concert",
    date: "October 18, 2023",
    time: "8:00 PM",
    location: "Los Angeles, CA",
    category: "Concert",
    price: 0.18,
    image: "/placeholder.svg?height=400&width=600",
    soldTickets: 245,
    totalTickets: 400,
  },
  {
    id: "6",
    name: "Crypto Gaming Tournament",
    date: "November 25, 2023",
    time: "2:00 PM",
    location: "Seattle, WA",
    category: "Gaming",
    price: 0.05,
    image: "/placeholder.svg?height=400&width=600",
    soldTickets: 120,
    totalTickets: 250,
  },
]
