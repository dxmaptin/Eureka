"use client"

import Link from "next/link"
import { CalendarDays, Clock, MapPin, Twitter, Instagram, Globe, ChevronRight, Ticket } from "lucide-react"
import { venues, events } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

export default function VenuePage({ params }: { params: { id: string } }) {
  const venue = venues.find((v) => v.id === params.id)
  if (!venue) {
    return <div className="container mx-auto px-4 py-8 text-center">Venue not found</div>
  }

  const relatedEvents = events.filter((e) => e.venueId === venue.id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="h-48 w-48 mx-auto rounded-lg overflow-hidden mb-4">
            <img src={venue.image} alt={venue.name} className="object-cover h-full w-full" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{venue.name}</h1>
          <p className="text-slate-300 max-w-2xl mx-auto mb-4">{venue.bio}</p>
          <div className="flex justify-center space-x-4">
            {venue.social.twitter && (
              <Link href={venue.social.twitter} target="_blank" className="text-slate-300 hover:text-white">
                <Twitter className="h-5 w-5" />
              </Link>
            )}
            {venue.social.instagram && (
              <Link href={venue.social.instagram} target="_blank" className="text-slate-300 hover:text-white">
                <Instagram className="h-5 w-5" />
              </Link>
            )}
            {venue.social.website && (
              <Link href={venue.social.website} target="_blank" className="text-slate-300 hover:text-white">
                <Globe className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-3">Upcoming Community Events</h2>
          <ul className="space-y-2">
            {venue.communityEvents.map((ev) => (
              <li key={ev.title}>
                <Link href={ev.link} className="text-purple-400 hover:underline flex items-center" target="_blank">
                  {ev.title}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Events at {venue.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEvents.map((event) => (
              <Link href={`/events/${event.id}`} key={event.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-slate-800 border-slate-700">
                  <div className="relative h-48 w-full">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }} />
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
                    <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
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
                      <Button size="sm" variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
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
    </div>
  )
}
