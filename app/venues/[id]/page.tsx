"use client"

import Link from "next/link"
import { CalendarDays, Clock, MapPin, Twitter, Instagram, Globe, Ticket } from "lucide-react"
import { venues, events } from "@/lib/data"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import CommunityLinks from "@/components/community-links"
import NftGate from "@/components/nft-gate"

export default function VenuePage({ params }: { params: { id: string } }) {
  const venue = venues.find((v) => v.id === params.id)
  if (!venue) {
    return <div className="container mx-auto px-4 py-8 text-center">Venue not found</div>
  }

  const relatedEvents = events.filter((e) => e.venueId === venue.id)

  const themes: Record<string, { bg: string; layout: "hero" | "side" }> = {
    v1: { bg: "from-purple-900 to-purple-700", layout: "hero" },
    v2: { bg: "from-blue-900 to-blue-700", layout: "side" },
  }

  const theme = themes[venue.id] || { bg: "from-slate-900 to-slate-800", layout: "hero" }

  const socialLinks = (
    <div className="flex justify-center space-x-4 mt-4">
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
  )

  return (
    <div className={`min-h-screen bg-gradient-to-b ${theme.bg}`}>
      <div className="container mx-auto px-4 py-8">
        {theme.layout === "hero" ? (
          <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden mb-8">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${venue.image})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{venue.name}</h1>
              <p className="text-slate-300 max-w-2xl">{venue.bio}</p>
              {socialLinks}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-center">
            <div className="rounded-lg overflow-hidden order-last md:order-first">
              <img src={venue.image} alt={venue.name} className="object-cover w-full h-64 md:h-96" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{venue.name}</h1>
              <p className="text-slate-300 mb-4">{venue.bio}</p>
              {socialLinks}
            </div>
          </div>
        )}

        <CommunityLinks items={venue.communityEvents} />

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Events at {venue.name}</h2>
          <NftGate>
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
          </NftGate>
        </div>
      </div>
    </div>
  )
}
