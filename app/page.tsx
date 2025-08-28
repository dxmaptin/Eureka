"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Clock, MapPin, Ticket, Loader2, Search as SearchIcon, Bot } from "lucide-react"
import { ExclusivePartnersCarousel } from "@/components/exclusive-partners-carousel"
import { Price } from "@/components/price"
import { getEventImage } from "@/lib/event-images"
import type { Event } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
// profile moved to a top-right sticky bar

export default function Home() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [appliedQuery, setAppliedQuery] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log('📅 Fetching events from API...')
        const response = await fetch('/api/events')
        const data = await response.json()
        
        if (data.success) {
          setEvents(data.events)
          console.log(`✅ Loaded ${data.events.length} events`)
        } else {
          setError(data.error || 'Failed to load events')
        }
      } catch (err) {
        console.error('❌ Error fetching events:', err)
        setError('Failed to load events')
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvents()
  }, [])

  // Shrink sticky search bar on scroll
  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 100)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const filteredEvents = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase()
    const base = q
      ? events.filter((e) => [e.name, e.category, e.location].some((f) => f?.toLowerCase().includes(q)))
      : events

    // Swap order of Metaverse Concert and Web3 Music Festival
    const list = [...base]
    const i = list.findIndex((e) => e.name === 'Metaverse Concert')
    const j = list.findIndex((e) => e.name === 'Web3 Music Festival')
    if (i !== -1 && j !== -1) {
      const tmp = list[i]
      list[i] = list[j]
      list[j] = tmp
    }
    return list
  }, [events, appliedQuery])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Apply search only when user explicitly submits Search
    setAppliedQuery(query)
  }

  const handleAsk = async () => {
    const q = query.trim()
    if (!q) return
    try {
      const res = await fetch('/api/assistant/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Interpretation failed')
      const intent = data.intent as any
      switch (intent.type) {
        case 'buy': {
          if (intent.eventId) {
            const qty = intent.quantity && Number(intent.quantity) > 0 ? `?quantity=${intent.quantity}` : ''
            router.push(`/events/${intent.eventId}/purchase${qty}`)
          } else {
            toast({ title: 'Which event?', description: 'Please specify the event to buy tickets for.' })
          }
          break
        }
        case 'marketplace': {
          if (intent.eventId) router.push(`/events/${intent.eventId}/marketplace`)
          else toast({ title: 'Which event?', description: 'Please specify the event to view second-hand tickets.' })
          break
        }
        case 'navigate': {
          if (intent.href) {
            const h = String(intent.href).trim().toLowerCase()
            let path = '/'
            if (h === '/' || h.includes('event') || h.includes('home')) path = '/'
            if (h.includes('about')) path = '/about'
            if (h.includes('ticket') || h.includes('dashboard')) path = '/dashboard'
            router.push(path)
          }
          break
        }
        case 'search': {
          setAppliedQuery(intent.query || q)
          break
        }
        case 'list_ticket': {
          toast({ title: 'Listing flow', description: 'Opening dashboard to list your ticket.' })
          router.push('/dashboard')
          break
        }
        default: {
          setAppliedQuery(q)
        }
      }
    } catch (err: any) {
      console.error(err)
      toast({ title: 'Could not interpret', description: err?.message || 'Try a simpler phrasing', variant: 'destructive' })
      setAppliedQuery(q)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8 pb-24 pt-8">
        {/* Top spacing and big wordmark (letters only) */}
        <div className="mt-10 md:mt-16 lg:mt-20 mb-6 text-center">
          <span className="text-5xl md:text-6xl lg:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-400 to-cyan-300">
            Eureka
          </span>
        </div>

        <div className="mb-12 flex justify-center sticky top-4 z-40">
          <form onSubmit={onSubmit} className="w-full max-w-3xl">
            <div className={`relative rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-gradient ${compact ? 'shadow-[0_0_18px_rgba(168,85,247,0.18)]' : 'shadow-[0_0_30px_rgba(168,85,247,0.25)]'}`}>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for events, or ask any question"
                  className={`${compact ? 'h-12 text-lg bg-white/70 dark:bg-slate-900/60' : 'h-16 text-xl bg-white/95 dark:bg-slate-900/90'} rounded-full pl-12 pr-40 border-0 focus-visible:ring-2 focus-visible:ring-purple-500`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <button
                    type="submit"
                    aria-label="Search"
                    className={`inline-flex items-center justify-center ${compact ? 'h-10' : 'h-11'} px-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow hover:from-purple-600 hover:to-pink-600`}
                  >
                    <SearchIcon className="h-5 w-5 mr-2" />
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={handleAsk}
                    aria-label="Ask"
                    className={`inline-flex items-center justify-center ${compact ? 'h-10' : 'h-11'} px-5 rounded-full bg-slate-900/90 text-white border border-slate-700 hover:bg-slate-800`}
                  >
                    <Bot className="h-5 w-5 mr-2" />
                    Ask
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Exclusive partners</h2>
          <ExclusivePartnersCarousel />
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">View All Events</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-2 text-slate-300">Loading events...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">Failed to load events</div>
            <div className="text-slate-400 text-sm">{error}</div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400">No events found</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Link href={`/events/${event.id}`} key={event.id}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-slate-800 border-slate-700">
                  <div className="relative h-48 w-full">
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${getEventImage(event)})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-70" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex justify-between items-center">
                        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {event.category}
                        </span>
                      <Price
                        usd={event.price_usd}
                        eth={event.price_eth}
                        className="bg-slate-900 bg-opacity-80 text-white px-3 py-1 rounded-full text-xs font-medium"
                      />
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
                      Tickets sold: {event.sold_tickets}/{event.total_tickets}
                    </span>
                    <span>{Math.round((event.sold_tickets / event.total_tickets) * 100)}%</span>
                  </div>
                  <Progress value={(event.sold_tickets / event.total_tickets) * 100} className="h-2 bg-slate-700" />
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center text-slate-300">
                      <Ticket className="h-4 w-4 mr-1" />
                      <span className="text-sm">{event.total_tickets - event.sold_tickets} available</span>
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
        )}
      </div>
    </div>
  )
}
