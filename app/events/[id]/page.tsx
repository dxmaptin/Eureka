"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useWallet } from "@/context/wallet-context"
import { ConnectWalletModal } from "@/components/connect-wallet-modal"
import { useToast } from "@/components/ui/use-toast"
import { CalendarDays, Clock, MapPin, Ticket, Users, ChevronRight, Info, Share2, Loader2 } from "lucide-react"
import { Price } from "@/components/price"
import type { Event } from "@/lib/supabase"
import { getEventImage } from "@/lib/event-images"
import EventHeader from "@/components/event-header"

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { isConnected } = useWallet()
  const { toast } = useToast()
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { id } = await params
        console.log('🎫 Fetching event:', id)
        const response = await fetch(`/api/events/${id}`)
        const data = await response.json()
        
        if (data.success) {
          setEvent(data.event)
          console.log('✅ Event loaded:', data.event.name)
        } else {
          setError(data.error || 'Event not found')
        }
      } catch (err) {
        console.error('❌ Error fetching event:', err)
        setError('Failed to load event')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvent()
  }, [params])

  // Show loading state
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

  // Show error state  
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Event Not Found</div>
          <div className="text-slate-400 mb-6">{error}</div>
          <Button onClick={() => router.push('/')} variant="outline">
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity)
    }
  }

  const handlePurchase = async () => {
    if (!isConnected) {
      setShowConnectModal(true)
      return
    }

    const { id } = await params
    router.push(`/events/${id}/purchase?quantity=${quantity}`)
  }

  const handleShare = () => {
    // In a real app, this would use the Web Share API
    toast({
      title: "Share Event",
      description: "Sharing functionality would be implemented here",
    })
  }

  const feeUsd = 6
  const feeEth = 0.002

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <EventHeader />
      {/* Invisible navbar spacer */}
      <div className="h-24 w-full"></div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details - Left Column */}
          <div className="lg:col-span-2">
            <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden mb-6">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getEventImage(event)})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {event.category}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white">{event.name}</h1>
              <Button variant="outline" className="border-slate-600" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Event
              </Button>
            </div>

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
            <Card className="bg-slate-800 border-slate-700 sticky top-28">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-white mb-2">
                  <Price usd={event.price_usd} eth={event.price_eth} />
                </div>
                <div className="text-sm text-slate-400 mb-4">per ticket</div>

                <div className="mb-1 flex justify-between text-xs text-slate-400">
                  <span>
                    Tickets sold: {event.sold_tickets}/{event.total_tickets}
                  </span>
                  <span>{Math.round((event.sold_tickets / event.total_tickets) * 100)}%</span>
                </div>
                <Progress value={(event.sold_tickets / event.total_tickets) * 100} className="h-2 mb-6 bg-slate-700" />

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
                    <span>
                      {isConnected
                        ? `$${(event.price_usd * quantity).toFixed(2)} / ${(event.price_eth * quantity).toFixed(3)} ETH`
                        : `$${(event.price_usd * quantity).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300 mb-2">
                    <span>Transaction fee (est.)</span>
                    <span>
                      {isConnected ? `$${feeUsd} / ${feeEth} ETH` : `$${feeUsd}`}
                    </span>
                  </div>
                  <Separator className="my-2 bg-slate-700" />
                  <div className="flex justify-between text-white font-semibold">
                    <span>Total</span>
                    <span>
                      {isConnected
                        ? `$${(event.price_usd * quantity + feeUsd).toFixed(2)} / ${(event.price_eth * quantity + feeEth).toFixed(3)} ETH`
                        : `$${(event.price_usd * quantity + feeUsd).toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  onClick={handlePurchase}
                >
                  {isConnected ? "Purchase Tickets" : "Connect Wallet to Purchase"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                  onClick={async () => {
                    const { id } = await params
                    router.push(`/events/${id}/marketplace`)
                  }}
                >
                  Open Marketplace
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
