import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Clock, MapPin, Ticket } from "lucide-react"
import { artists, venues, events } from "@/lib/data"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8 pb-24 pt-28">
        <div className="mb-12 text-center">
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Exclusive partners</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <Link href={`/artists/${artist.id}`} key={artist.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-slate-800 border-slate-700">
                  <div className="relative h-40 w-full">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${artist.image})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-70" />
                    <div className="absolute bottom-3 left-3 right-3 text-white font-semibold text-lg">
                      {artist.name}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
            {venues.map((venue) => (
              <Link href={`/venues/${venue.id}`} key={venue.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-slate-800 border-slate-700">
                  <div className="relative h-40 w-full">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${venue.image})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-70" />
                    <div className="absolute bottom-3 left-3 right-3 text-white font-semibold text-lg">
                      {venue.name}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">View All Events</h2>
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

