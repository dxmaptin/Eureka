"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/context/wallet-context"
import { CalendarDays, Clock, MapPin, QrCode, ExternalLink, Share2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function Dashboard() {
  const router = useRouter()
  const { isConnected } = useWallet()
  const [activeTab, setActiveTab] = useState("upcoming")
  const [showQrCode, setShowQrCode] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push("/")
    }
  }, [isConnected, router])

  const handleViewQrCode = (ticket: any) => {
    setSelectedTicket(ticket)
    setShowQrCode(true)
  }

  const upcomingTickets = [
    {
      id: "1",
      eventName: "Blockchain Summit 2023",
      date: "June 15, 2023",
      time: "10:00 AM",
      location: "San Francisco, CA",
      tokenId: "12345",
      image: "/placeholder.svg?height=400&width=600",
      contractAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    },
    {
      id: "2",
      eventName: "NFT Art Exhibition",
      date: "July 22, 2023",
      time: "6:00 PM",
      location: "New York, NY",
      tokenId: "67890",
      image: "/placeholder.svg?height=400&width=600",
      contractAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    },
  ]

  const pastTickets = [
    {
      id: "3",
      eventName: "Web3 Conference 2022",
      date: "November 10, 2022",
      time: "9:00 AM",
      location: "Berlin, Germany",
      tokenId: "54321",
      image: "/placeholder.svg?height=400&width=600",
      contractAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">My NFT Tickets</h1>

        <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} onViewQrCode={handleViewQrCode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">You don't have any upcoming event tickets.</p>
                <Button
                  className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  onClick={() => router.push("/")}
                >
                  Browse Events
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {pastTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastTickets.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} isPast={true} onViewQrCode={handleViewQrCode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">You don't have any past event tickets.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Entry QR Code</DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="text-center py-4">
              <h3 className="font-medium text-lg mb-2">{selectedTicket.eventName}</h3>
              <div className="text-sm text-slate-400 mb-4">
                {selectedTicket.date} at {selectedTicket.time}
              </div>

              <div className="bg-white p-4 rounded-lg mx-auto w-64 h-64 flex items-center justify-center mb-4">
                <QrCode className="h-48 w-48 text-black" />
              </div>

              <div className="text-sm text-slate-400">Token ID: {selectedTicket.tokenId}</div>
              <div className="text-xs text-slate-500 mb-4">Present this QR code at the venue entrance</div>

              <Button variant="outline" className="w-full" onClick={() => setShowQrCode(false)}>
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface TicketCardProps {
  ticket: any
  isPast?: boolean
  onViewQrCode: (ticket: any) => void
}

function TicketCard({ ticket, isPast = false, onViewQrCode }: TicketCardProps) {
  return (
    <Card className={`overflow-hidden bg-slate-800 border-slate-700 ${isPast ? "opacity-70" : ""}`}>
      <div className="relative h-40 w-full">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${ticket.image})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />

        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-slate-800/50 text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewQrCode(ticket)}>View QR Code</DropdownMenuItem>
              <DropdownMenuItem>View on OpenSea</DropdownMenuItem>
              <DropdownMenuItem>Transfer Ticket</DropdownMenuItem>
              <DropdownMenuItem>Share Ticket</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2">{ticket.eventName}</h3>

        <div className="flex items-center text-slate-400 text-sm mb-2">
          <CalendarDays className="h-4 w-4 mr-1 text-purple-500" />
          <span>{ticket.date}</span>
          <Clock className="h-4 w-4 ml-3 mr-1 text-purple-500" />
          <span>{ticket.time}</span>
        </div>

        <div className="flex items-center text-slate-400 text-sm mb-4">
          <MapPin className="h-4 w-4 mr-1 text-purple-500" />
          <span>{ticket.location}</span>
        </div>

        <div className="flex items-center text-xs text-slate-500 mb-4">
          <span>Token ID: {ticket.tokenId}</span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
            onClick={() => onViewQrCode(ticket)}
          >
            <QrCode className="mr-1 h-4 w-4" />
            Entry QR
          </Button>

          <Button variant="outline" size="sm" className="flex-1">
            <ExternalLink className="mr-1 h-4 w-4" />
            OpenSea
          </Button>

          <Button variant="outline" size="icon" size-sm className="h-8 w-8">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
