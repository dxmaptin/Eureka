import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Clock, MapPin, Ticket } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            NFT Ticket Marketplace
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Purchase tickets as NFTs for your favorite events. Secure, transferable, and always authentic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link href={`/events/${event.id}`} key={event.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-slate-800 border-slate-700">
                <div className="relative h-48 w-full">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${event.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-70" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-center">
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {event.category}
                      </span>
                      <span className="bg-slate-900 bg-opacity-80 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {event.price} ETH
                      </span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-bold text-white mb-2">{event.name}</h2>
                  <div className="flex items-center text-slate-400 text-sm mb-2">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    <span>{event.date}</span>
                    <Clock className="h-4 w-4 ml-3 mr-1" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-slate-400 text-sm mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{event.location}</span>
                  </div>
                  <div className="mb-1 flex justify-between text-xs text-slate-400">
                    <span>
                      Tickets sold: {event.soldTickets}/{event.totalTickets}
                    </span>
                    <span>{Math.round((event.soldTickets / event.totalTickets) * 100)}%</span>
                  </div>
                  <Progress value={(event.soldTickets / event.totalTickets) * 100} className="h-2 bg-slate-700" />
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center text-slate-300">
                      <Ticket className="h-4 w-4 mr-1" />
                      <span className="text-sm">{event.totalTickets - event.soldTickets} available</span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                    >
                      View Event
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
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
