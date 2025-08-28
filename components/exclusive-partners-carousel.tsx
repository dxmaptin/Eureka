"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { artists, venues } from "@/lib/data"
import { ChevronRight } from "lucide-react"

type PartnerItem = {
  id: string
  name: string
  image: string
  href: string
}

// A lightweight, responsive carousel that preserves the existing card UI.
// Shows 1/2/3 cards per view on base/sm/lg (matching previous grid),
// auto-rotates every 5s, and keeps items fully clickable.
export function ExclusivePartnersCarousel() {
  const items: PartnerItem[] = useMemo(() => {
    const artistItems = artists.map((a) => ({
      id: a.id,
      name: a.name,
      image: a.image,
      href: `/artists/${a.id}`,
    }))
    const venueItems = venues.map((v) => ({
      id: v.id,
      name: v.name,
      image: v.image,
      href: `/venues/${v.id}`,
    }))
    return [...artistItems, ...venueItems]
  }, [])

  // Build a triple list to allow seamless looping transitions
  const loopItems = useMemo(() => [...items, ...items, ...items], [items])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [index, setIndex] = useState(items.length) // start in the middle copy
  const [itemWidth, setItemWidth] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const indexRef = useRef(index)
  useEffect(() => {
    indexRef.current = index
  }, [index])

  const total = items.length
  const visible = 3 // always show 3 on screen
  const step = 1 // advance by one item to continue seamlessly
  const pages = total // dots represent total items

  // Measure container to keep exactly 3 visible
  useEffect(() => {
    const measure = () => {
      const el = containerRef.current
      if (!el) return
      const w = el.clientWidth
      setItemWidth(w / visible)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  // Auto-rotate every 5 seconds by one item
  useEffect(() => {
    if (total <= 1) return
    const id = setInterval(() => {
      next()
    }, 5000)
    return () => clearInterval(id)
  }, [total])

  const next = () => {
    const current = indexRef.current
    const highThreshold = total * 2 - visible
    if (current + step > highThreshold) {
      // Rebase into the middle copy before animating to keep wrap invisible
      setIsTransitioning(false)
      const rebased = current - total
      setIndex(rebased)
      requestAnimationFrame(() => {
        setIsTransitioning(true)
        setIndex(rebased + step)
      })
      return
    }
    setIsTransitioning(true)
    setIndex(current + step)
  }

  // Compute transform
  const offset = index * itemWidth
  const normalizedIndex = ((index % total) + total) % total
  const activePage = normalizedIndex

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Right control */}
      <button
        type="button"
        onClick={next}
        aria-label="Next partners"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-800/70 text-slate-100 hover:bg-slate-800/90 border border-slate-700 backdrop-blur-sm"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Track: use negative margin to emulate gap-6 like previous grid */}
      <div
        ref={trackRef}
        className="flex -mx-3"
        style={{
          transform: `translateX(-${offset}px)`,
          transition: isTransitioning ? "transform 500ms ease-out" : "none",
        }}
      >
        {loopItems.map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            data-partner-item
            className="shrink-0 px-3"
            style={{ width: itemWidth ? `${itemWidth}px` : undefined }}
          >
            <Link href={item.href}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-slate-800 border-slate-700">
                <div className="relative h-40 w-full">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-70" />
                  <div className="absolute bottom-3 left-3 right-3 text-white font-semibold text-lg">
                    {item.name}
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        ))}
      </div>

      {/* Subtle page dots (one per item) */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {Array.from({ length: pages }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i === activePage ? "bg-slate-300" : "bg-slate-500/40"
            }`}
          />)
        )}
      </div>
    </div>
  )
}

export default ExclusivePartnersCarousel
