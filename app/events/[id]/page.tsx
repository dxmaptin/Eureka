"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/context/wallet-context"
import { ConnectWalletModal } from "@/components/connect-wallet-modal"
import { useToast } from "@/components/ui/use-toast"
import { CalendarDays, Clock, MapPin, Ticket, Users, ChevronRight, Info, Share2 } from "lucide-react"

export default function EventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isConnected } = useWallet()
  const { toast } = useToast()
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [quantity, setQuantity] = useState(1)

  // Find event by ID (in a real app, this would be fetched from an API)
  const event = events.find((e) => e.id === params.id)

  if (!event) {
    return <div className="container mx-auto px-4 py-8 text-center">Event not found</div>
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity)
    }
  }

  const handlePurchase = () => {
    if (!isConnected) {
      setShowConnectModal(true)
      return
    }

    router.push(`/events/${params.id}/purchase?quantity=${quantity}`)
  }

  const handleShare = () => {
    // In a real app, this would use the Web Share API
    toast({
      title: "Share Event",
      description: "Sharing functionality would be implemented here",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details - Left Column */}
          <div className="lg:col-span-2">
            <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden mb-6">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {event.category}
                </span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{event.name}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center text-slate-300">
                <CalendarDays className="h-5 w-5 mr-2 text-purple-500" />
                <div>
                  <div className="text-sm text-slate-400">Date</div>
                  <div>{event.date}</div>
                </div>
              </div>

              <div className="flex items-center text-slate-300">
                <Clock className="h-5 w-5 mr-2 text-purple-500" />
                <div>
                  <div className="text-sm text-slate-400">Time</div>
                  <div>{event.time}</div>
                </div>
              </div>

              <div className="flex items-center text-slate-300">
                <MapPin className="h-5 w-5 mr-2 text-purple-500" />
                <div>
                  <div className="text-sm text-slate-400">Location</div>
                  <div>{event.location}</div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-3">About This Event</h2>
              <p className="text-slate-300">
                Join us for an unforgettable experience at {event.name}. This event brings together enthusiasts,
                professionals, and curious minds for a day of learning, networking, and fun. Each ticket is minted as a
                unique NFT on the blockchain, providing you with a collectible digital asset that serves as your entry
                pass.
              </p>
              <div className="mt-4 space-y-2 text-slate-300">
                <p>• Exclusive access to all sessions and workshops</p>
                <p>• Networking opportunities with industry leaders</p>
                <p>• Commemorative NFT ticket that can be traded or kept as a collectible</p>
                <p>• Special discounts on future events</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-3">Ticket Information</h2>
              <div className="flex items-center text-slate-300 mb-2">
                <Ticket className="h-5 w-5 mr-2 text-purple-500" />
                <span>Each ticket is minted as an NFT on the Ethereum blockchain</span>
              </div>
              <div className="flex items-center text-slate-300 mb-2">
                <Users className="h-5 w-5 mr-2 text-purple-500" />
                <span>Tickets are transferable and can be resold on NFT marketplaces</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Info className="h-5 w-5 mr-2 text-purple-500" />
                <span>QR code for entry will be generated upon purchase</span>
              </div>
            </div>
          </div>

          {/* Purchase Card - Right Column */}
          <div>
            <Card className="bg-slate-800 border-slate-700 sticky top-20">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-white mb-2">{event.price} ETH</div>
                <div className="text-sm text-slate-400 mb-4">per ticket</div>

                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>
                    Tickets sold: {event.soldTickets}/{event.totalTickets}
                  </span>
                  <span>{Math.round((event.soldTickets / event.totalTickets) * 100)}%</span>
                </div>
                <Progress value={(event.soldTickets / event.totalTickets) * 100} className="h-2 mb-6 bg-slate-700" />

                <div className="mb-6">
                  <div className="text-sm font-medium text-slate-300 mb-2">Select Quantity</div>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="border-slate-600"
                    >
                      -
                    </Button>
                    <div className="w-12 text-center text-white">{quantity}</div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= 10}
                      className="border-slate-600"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-slate-300 mb-2">
                    <span>Subtotal</span>
                    <span>{(event.price * quantity).toFixed(2)} ETH</span>
                  </div>
                  <div className="flex justify-between text-slate-300 mb-2">
                    <span>Gas fee (est.)</span>
                    <span>0.002 ETH</span>
                  </div>
                  <Separator className="my-2 bg-slate-700" />
                  <div className="flex justify-between text-white font-semibold">
                    <span>Total</span>
                    <span>{(event.price * quantity + 0.002).toFixed(3)} ETH</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  onClick={handlePurchase}
                >
                  {isConnected ? "Purchase Tickets" : "Connect Wallet to Purchase"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>

                <Button variant="outline" className="w-full mt-2 border-slate-600" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Event
                </Button>

                <div className="mt-4 text-xs text-slate-400 text-center">
                  By purchasing tickets, you agree to our Terms of Service and Privacy Policy.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConnectWalletModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />
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
