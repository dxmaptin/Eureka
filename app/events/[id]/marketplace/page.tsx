"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, ShoppingCart, ArrowLeft } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import { useToast } from "@/components/ui/use-toast"
import { ethers } from "ethers"
import type { Event, Listing } from "@/lib/supabase"
import { getEventImage } from "@/lib/event-images"
import { Price } from "@/components/price"
import MarketplaceAbi from "@/lib/abis/SimpleRoyaltyMarketplace.json"
import EventHeader from "@/components/event-header"
import { MARKETPLACE_CONTRACT_ADDRESS, MYNFT_CONTRACT_ADDRESS } from "@/lib/contracts"

export default function EventMarketplacePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { isConnected, address, dbUser } = useWallet()
  const { toast } = useToast()
  const [event, setEvent] = useState<Event | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [buyingTokenId, setBuyingTokenId] = useState<number | null>(null)

  useEffect(() => {
    const init = async () => {
      const { id } = await params
      try {
        const [eventRes, listingsRes] = await Promise.all([
          fetch(`/api/events/${id}`),
          fetch(`/api/marketplace/listings/${id}`)
        ])
        const eventData = await eventRes.json()
        const listingsData = await listingsRes.json()
        if (eventData.success) setEvent(eventData.event)
        if (listingsData.success) setListings(listingsData.listings)
      } catch (e) {
        console.error('Failed to load marketplace data', e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [params])

  const handleBack = async () => {
    const { id } = await params
    router.push(`/events/${id}`)
  }

  const handleBuy = async (l: Listing) => {
    if (!isConnected) {
      toast({ title: 'Connect Wallet', description: 'Please connect your wallet to buy.' })
      return
    }
    if (!MARKETPLACE_CONTRACT_ADDRESS || !MYNFT_CONTRACT_ADDRESS) {
      toast({ title: 'Missing Config', description: 'Marketplace or NFT address not configured.', variant: 'destructive' })
      return
    }
    try {
      setBuyingTokenId(l.token_id)
      // @ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const marketplace = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, (MarketplaceAbi as any).abi, signer)
      const value = ethers.parseEther(String(l.price_eth))
      const tx = await marketplace.buy(MYNFT_CONTRACT_ADDRESS, l.token_id, { value })
      const receipt = await tx.wait()

      // Mark as sold in DB and update ticket owner
      const res = await fetch('/api/marketplace/mark-sold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nft_address: MYNFT_CONTRACT_ADDRESS,
          token_id: l.token_id,
          buyer_id: dbUser?.id,
          ticket_id: l.ticket_id,
          tx_hash: receipt?.hash,
          new_price_eth: l.price_eth
        })
      })
      const data = await res.json()
      if (!data.success) throw new Error('Failed to update listing state')

      toast({ title: 'Purchase complete', description: `Bought ticket #${l.token_id}` })
      // Refresh listings
      setListings(prev => prev.filter(x => x.token_id !== l.token_id))
    } catch (e: any) {
      console.error('Buy failed', e)
      toast({ title: 'Purchase failed', description: e?.message || 'Transaction error', variant: 'destructive' })
    } finally {
      setBuyingTokenId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading marketplace...</span>
        </div>
      </div>
    )
  }

  if (!event) {
    return <div className="container mx-auto px-4 py-8 text-center">Event not found!</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <EventHeader />
      <div className="container mx-auto px-4 py-8 pt-28">
        <Button variant="ghost" className="mb-6 text-slate-300" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Event
        </Button>

        <h1 className="text-3xl font-bold text-white mb-2">Secondary Marketplace</h1>
        <p className="text-slate-400 mb-6">Resell and buy tickets within the official marketplace.</p>

        {!listings.length ? (
          <Card className="bg-slate-800 border-slate-700 text-center p-10">
            <CardContent>
              <div className="text-slate-300">No active listings for this event yet.</div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => (
              <Card key={l.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="relative h-40 w-full">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getEventImage(event)})` }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white font-semibold text-lg">
                    #{l.token_id}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-slate-300 text-sm">Seller</div>
                    <div className="text-slate-200 font-mono text-xs">{l.seller_id.slice(0, 6)}...{l.seller_id.slice(-4)}</div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-slate-300 text-sm">Price</div>
                    <Price eth={l.price_eth} className="text-white" />
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                    onClick={() => handleBuy(l)}
                    disabled={buyingTokenId === l.token_id}
                  >
                    {buyingTokenId === l.token_id ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Buying...</>
                    ) : (
                      <><ShoppingCart className="h-4 w-4 mr-2" /> Buy</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
