"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWallet } from "@/context/wallet-context"
import { CalendarDays, Clock, MapPin, Ticket, Loader2, ExternalLink, User, QrCode, Tag } from "lucide-react"
import { Price } from "@/components/price"
import Link from "next/link"
import type { Ticket, User as DatabaseUser, PurchaseHistory } from "@/lib/supabase"
import EventHeader from "@/components/event-header"
import { TicketQR } from "@/components/ticket-qr"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import MarketplaceAbi from "@/lib/abis/SimpleRoyaltyMarketplace.json"
import ERC721Abi from "@/lib/abis/ERC721.json"
import { MARKETPLACE_CONTRACT_ADDRESS, MYNFT_CONTRACT_ADDRESS } from "@/lib/contracts"
import { ethers } from "ethers"
import { useToast } from "@/components/ui/use-toast"

interface UserData {
  user: DatabaseUser
  tickets: Ticket[]
  purchaseHistory: PurchaseHistory[]
}

export default function Dashboard() {
  const { isConnected, address, dbUser, walletType } = useWallet()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTicketForQR, setSelectedTicketForQR] = useState<Ticket | null>(null)
  const [listingTicket, setListingTicket] = useState<Ticket | null>(null)
  const [listingPriceEth, setListingPriceEth] = useState<string>("")
  const [listingBusy, setListingBusy] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isConnected || !address) {
        setLoading(false)
        return
      }
      
      try {
        console.log('👤 Fetching user data for:', address)
        
        const response = await fetch('/api/user/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: address
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          setUserData(data)
          console.log(`✅ Loaded ${data.tickets.length} tickets for user`)
        } else {
          setError(data.error || 'Failed to load user data')
        }
      } catch (err) {
        console.error('❌ Error fetching user data:', err)
        setError('Failed to load user data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [isConnected, address])

  // Show login prompt if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8 text-center">
          <CardContent>
            <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h1>
            <p className="text-slate-400 mb-6">
              Please connect your wallet to view your tickets and purchase history.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
                Go to Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading your tickets...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <EventHeader />
      <div className="container mx-auto px-4 py-8 pt-28">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
          <div className="flex items-center text-slate-300 text-sm">
            <div className="flex items-center mr-6">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              {walletType === 'magic' ? 'Custodial Wallet' : 'MetaMask Wallet'}
            </div>
            <div className="font-mono text-xs">
              {address.slice(0, 6)}...{address.slice(-4)}
            </div>
          </div>
        </div>

        {error ? (
          <Card className="bg-slate-800 border-slate-700 text-center p-8">
            <div className="text-red-400 text-xl mb-4">Error Loading Data</div>
            <div className="text-slate-400">{error}</div>
          </Card>
        ) : (
          <Tabs defaultValue="tickets" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="tickets" className="text-slate-300 data-[state=active]:text-white">
                <Ticket className="w-4 h-4 mr-2" />
                My Tickets ({userData?.tickets.length || 0})
              </TabsTrigger>
              <TabsTrigger value="history" className="text-slate-300 data-[state=active]:text-white">
                <Clock className="w-4 h-4 mr-2" />
                Purchase History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="mt-6">
              {!userData?.tickets.length ? (
                <Card className="bg-slate-800 border-slate-700 text-center p-8">
                  <Ticket className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Tickets Yet</h3>
                  <p className="text-slate-400 mb-6">
                    You haven&apos;t purchased any tickets yet. Browse our events and get your first NFT ticket!
                  </p>
                  <Link href="/">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
                      Browse Events
                    </Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userData.tickets.map((ticket) => (
                    <Card key={ticket.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                      <div className="relative h-48 w-full">
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${ticket.event?.image_url})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                        <div className="absolute top-4 right-4">
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Owned
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <div className="text-white font-medium">#{ticket.token_id}</div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {ticket.event?.name}
                        </h3>
                        <div className="flex items-center text-slate-400 text-sm mb-2">
                          <CalendarDays className="h-4 w-4 mr-1" />
                          <span>{ticket.event?.date}</span>
                          <Clock className="h-4 w-4 ml-3 mr-1" />
                          <span>{ticket.event?.time}</span>
                        </div>
                        <div className="flex items-center text-slate-400 text-sm mb-4">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{ticket.event?.location}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xs text-slate-500">Paid via {ticket.payment_method}</div>
                            {ticket.purchase_price_usd && (
                              <Price usd={ticket.purchase_price_usd} eth={ticket.purchase_price_eth} className="text-sm" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* QR Code Button */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 hover:bg-slate-700"
                                >
                                  <QrCode className="h-4 w-4 mr-1" />
                                  QR
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
                                <DialogHeader>
                                  <DialogTitle className="text-white">
                                    Entry QR Code - {ticket.event?.name}
                                  </DialogTitle>
                                  <DialogDescription className="text-slate-400">
                                    Show this QR code at the event entrance. 
                                    QR codes expire every 5 minutes for security.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4">
                                  <TicketQR
                                    ticketId={ticket.id}
                                    eventName={ticket.event?.name || 'Unknown Event'}
                                    tokenId={ticket.token_id}
                                    ownerAddress={address || ''}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                            {/* List for resale */}
                            <Dialog open={listingTicket?.id === ticket.id} onOpenChange={(open) => { if (!open) { setListingTicket(null); setListingBusy(false); } }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-slate-600 hover:bg-slate-700"
                                  onClick={() => {
                                    setListingTicket(ticket)
                                    const base = ticket.last_purchase_price_eth ?? ticket.purchase_price_eth ?? ticket.event?.price_eth ?? 0
                                    setListingPriceEth(String(base))
                                  }}
                                >
                                  <Tag className="h-4 w-4 mr-1" />
                                  List
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
                                <DialogHeader>
                                  <DialogTitle className="text-white">List Ticket #{ticket.token_id}</DialogTitle>
                                  <DialogDescription className="text-slate-400">
                                    Set your resale price. Cap: up to 2x your last purchase price.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3">
                                  <div className="text-sm text-slate-300">Last price: {(ticket.last_purchase_price_eth ?? ticket.purchase_price_eth ?? ticket.event?.price_eth)?.toString()} ETH</div>
                                  <Input
                                    type="number"
                                    step="0.0001"
                                    min={0}
                                    value={listingPriceEth}
                                    onChange={(e) => setListingPriceEth(e.target.value)}
                                    placeholder="Price in ETH"
                                    className="bg-slate-800 border-slate-700 text-white"
                                  />
                                  <Button
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                                    disabled={listingBusy}
                                    onClick={async () => {
                                      console.log('🚀 LISTING BUTTON CLICKED')
                                      console.log('📍 Debug Info:', { address, dbUser: !!dbUser, MARKETPLACE_CONTRACT_ADDRESS, MYNFT_CONTRACT_ADDRESS })
                                      toast({ title: 'Debug', description: 'Button clicked - check console for details', variant: 'default' })
                                      
                                      if (!address) { 
                                        console.log('❌ No wallet address')
                                        toast({ title: 'Not connected', description: 'Connect your wallet first.', variant: 'destructive' })
                                        return 
                                      }
                                      
                                      if (!dbUser) { 
                                        console.log('⚠️ User not synced with database, attempting to proceed anyway')
                                        toast({ title: 'Warning', description: 'User not fully synced - trying anyway...', variant: 'default' })
                                        // Don't return here, allow the transaction to proceed
                                      }
                                      
                                      if (!MARKETPLACE_CONTRACT_ADDRESS || !MYNFT_CONTRACT_ADDRESS) {
                                        console.log('❌ Missing contract addresses:', { MARKETPLACE_CONTRACT_ADDRESS, MYNFT_CONTRACT_ADDRESS })
                                        toast({ title: 'Missing config', description: 'Contract addresses not set.', variant: 'destructive' })
                                        return
                                      }
                                      
                                      const base = Number(ticket.last_purchase_price_eth ?? ticket.purchase_price_eth ?? ticket.event?.price_eth ?? 0)
                                      const priceNum = Number(listingPriceEth || 0)
                                      console.log('💰 Price validation:', { base, priceNum, listingPriceEth })
                                      
                                      if (!priceNum || priceNum <= 0) { 
                                        console.log('❌ Invalid price:', priceNum)
                                        toast({ title: 'Invalid price', description: 'Enter a price in ETH.', variant: 'destructive' })
                                        return 
                                      }
                                      
                                      if (base && priceNum > base * 2) { 
                                        console.log('❌ Over price cap:', { base, priceNum, cap: base * 2 })
                                        toast({ title: 'Over cap', description: `Max allowed: ${(base*2).toFixed(4)} ETH`, variant: 'destructive' })
                                        return 
                                      }
                                      
                                      try {
                                        console.log('✅ Starting blockchain transaction...')
                                        toast({ title: 'Starting transaction', description: 'Preparing blockchain transaction...', variant: 'default' })
                                        setListingBusy(true)
                                        
                                        // Check if we're on the correct network
                                        // @ts-ignore
                                        if (window.ethereum) {
                                          try {
                                            const chainId = await window.ethereum.request({ method: 'eth_chainId' })
                                            console.log('🌐 Current chain ID:', chainId)
                                            
                                            // Sepolia chain ID is 0xaa36a7 (11155111 in decimal)
                                            if (chainId !== '0xaa36a7') {
                                              console.log('🔄 Switching to Sepolia network...')
                                              toast({ title: 'Network switch', description: 'Switching to Sepolia testnet...', variant: 'default' })
                                              
                                              try {
                                                await window.ethereum.request({
                                                  method: 'wallet_switchEthereumChain',
                                                  params: [{ chainId: '0xaa36a7' }],
                                                })
                                              } catch (switchError: any) {
                                                // This error code indicates that the chain has not been added to MetaMask.
                                                if (switchError.code === 4902) {
                                                  console.log('➕ Adding Sepolia network to MetaMask...')
                                                  await window.ethereum.request({
                                                    method: 'wallet_addEthereumChain',
                                                    params: [{
                                                      chainId: '0xaa36a7',
                                                      chainName: 'Sepolia Test Network',
                                                      rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
                                                      nativeCurrency: {
                                                        name: 'ETH',
                                                        symbol: 'ETH',
                                                        decimals: 18,
                                                      },
                                                      blockExplorerUrls: ['https://sepolia.etherscan.io'],
                                                    }],
                                                  })
                                                } else {
                                                  throw switchError
                                                }
                                              }
                                            }
                                          } catch (networkError) {
                                            console.error('❌ Network setup failed:', networkError)
                                            toast({ title: 'Network Error', description: 'Please manually switch to Sepolia testnet in MetaMask', variant: 'destructive' })
                                            setListingBusy(false)
                                            return
                                          }
                                        }
                                        
                                        // @ts-ignore
                                        const provider = new ethers.BrowserProvider(window.ethereum)
                                        const signer = await provider.getSigner()
                                        console.log('🔗 Provider and signer created')
                                        
                                        const erc721 = new ethers.Contract(MYNFT_CONTRACT_ADDRESS, (ERC721Abi as any).abi, signer)
                                        const approved = await erc721.isApprovedForAll(address, MARKETPLACE_CONTRACT_ADDRESS)
                                        console.log('🎫 Approval status:', approved)
                                        
                                        if (!approved) {
                                          console.log('📝 Setting approval...')
                                          toast({ title: 'Approval needed', description: 'Approving marketplace to transfer your NFT...', variant: 'default' })
                                          const txA = await erc721.setApprovalForAll(MARKETPLACE_CONTRACT_ADDRESS, true)
                                          await txA.wait()
                                          console.log('✅ Approval set')
                                        }
                                        
                                        const marketplace = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, (MarketplaceAbi as any).abi, signer)
                                        const priceWei = ethers.parseEther(String(listingPriceEth || '0'))
                                        console.log('🏪 Calling marketplace.list with:', { 
                                          nft: MYNFT_CONTRACT_ADDRESS, 
                                          tokenId: ticket.token_id, 
                                          priceWei: priceWei.toString() 
                                        })
                                        
                                        toast({ title: 'Listing on marketplace', description: 'Creating listing on blockchain...', variant: 'default' })
                                        const tx = await marketplace.list(MYNFT_CONTRACT_ADDRESS, ticket.token_id, priceWei)
                                        console.log('📋 Transaction sent:', tx.hash)
                                        
                                        toast({ title: 'Transaction sent', description: `Waiting for confirmation: ${tx.hash.slice(0, 10)}...`, variant: 'default' })
                                        const receipt = await tx.wait()
                                        console.log('✅ Transaction confirmed:', receipt.hash)
                                        
                                        // Record listing in DB (skip if no dbUser)
                                        console.log('💾 Recording in database...')
                                        if (dbUser) {
                                          const res = await fetch('/api/marketplace/list', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              event_id: ticket.event_id,
                                              ticket_id: ticket.id,
                                              nft_address: MYNFT_CONTRACT_ADDRESS,
                                              token_id: ticket.token_id,
                                              seller_id: dbUser.id,
                                              price_eth: Number(listingPriceEth),
                                              tx_hash: receipt?.hash
                                            })
                                          })
                                          const data = await res.json()
                                          console.log('📊 Database response:', data)
                                          
                                          if (!data.success) {
                                            toast({ title: 'Listed on-chain', description: 'DB record failed, but your listing is live.', variant: 'default' })
                                          } else {
                                            toast({ title: 'Listed successfully!', description: `Ticket #${ticket.token_id} listed at ${priceNum} ETH.` })
                                          }
                                        } else {
                                          console.log('⚠️ Skipping database recording - no dbUser')
                                          toast({ title: 'Listed on-chain only', description: 'Your NFT is listed on the blockchain but not in our database.', variant: 'default' })
                                        }
                                        setListingTicket(null)
                                        setListingBusy(false)
                                        console.log('🎉 Listing completed successfully!')
                                        
                                      } catch (e: any) {
                                        console.error('❌ Listing failed:', e)
                                        console.error('Full error object:', JSON.stringify(e, Object.getOwnPropertyNames(e), 2))
                                        toast({ title: 'Listing failed', description: e?.message || 'Transaction error', variant: 'destructive' })
                                        setListingBusy(false)
                                      }
                                    }}
                                  >
                                    {listingBusy ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Listing...</> : 'Confirm Listing'}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {/* Etherscan Link */}
                            <a
                              href={`https://sepolia.etherscan.io/tx/${ticket.transaction_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300"
                              title="View on Etherscan"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              {!userData?.purchaseHistory.length ? (
                <Card className="bg-slate-800 border-slate-700 text-center p-8">
                  <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Purchase History</h3>
                  <p className="text-slate-400">Your purchase history will appear here.</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {userData.purchaseHistory.map((purchase) => (
                    <Card key={purchase.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-white">{purchase.event?.name}</h4>
                            <div className="text-slate-400 text-sm">
                              {new Date(purchase.created_at).toLocaleDateString()} via {purchase.payment_method}
                            </div>
                          </div>
                          <div className="text-right">
                            <Price usd={purchase.amount_usd} className="text-white" />
                            <div className={`text-sm ${
                              purchase.status === 'completed' ? 'text-green-400' : 
                              purchase.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
