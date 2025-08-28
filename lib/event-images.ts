import type { Event } from "@/lib/supabase"

const isPlaceholder = (url?: string | null) => {
  if (!url) return true
  return url.includes("placeholder") || url.trim() === ""
}

export function getEventImage(event: Event): string {
  const force = (process.env.NEXT_PUBLIC_FORCE_MAPPED_IMAGES || '').toLowerCase() === 'true' || process.env.NEXT_PUBLIC_FORCE_MAPPED_IMAGES === '1'
  // Use provided URL unless it's a placeholder or force override is enabled
  if (!force && !isPlaceholder(event.image_url)) return event.image_url as string

  const name = (event.name || "").toLowerCase()
  const cat = (event.category || "").toLowerCase()

  if (name.includes("metaverse") || cat.includes("metaverse")) return "/metaverse.jpg"
  if (name.includes("defi") || cat.includes("defi")) return "/defi.jpeg"
  if (cat.includes("gaming") || name.includes("gaming")) return "/gaming.jpeg"
  if (cat.includes("exhibition") || name.includes("nft")) return "/NFTartexhibition.jpeg"
  if (name.includes("music") || cat.includes("festival")) return "/cypher.png"
  if (cat.includes("conference")) return "/conference.jpeg"

  // Fallbacks
  return "/placeholder.jpg"
}
