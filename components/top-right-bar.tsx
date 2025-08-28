"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/context/wallet-context"
import { Ticket, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConnectWalletModal } from "@/components/connect-wallet-modal"

export default function TopRightBar() {
  const { isConnected, address, disconnect, walletType, user, isCustodial } = useWallet()
  const [showConnectModal, setShowConnectModal] = useState(false)

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  const getDisplayName = () => {
    if (walletType === 'magic' && user) {
      if (user.email) return user.email
      if (user.phoneNumber) return user.phoneNumber
      if (user.oauthProvider) return `${user.oauthProvider} user`
    }
    return truncateAddress(address)
  }
  const getAccountType = () => (isCustodial ? "Custodial Account" : "Web3 Wallet")

  return (
    <div className="fixed top-4 right-4 z-50">
      {isConnected ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow"
            >
              <User className="mr-2 h-4 w-4" />
              {getDisplayName()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div>
                <div>My Account</div>
                <div className="text-xs font-normal text-slate-500">{getAccountType()}</div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">My Tickets</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={disconnect}>Disconnect</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          onClick={() => setShowConnectModal(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow"
          size="sm"
        >
          Get Started
        </Button>
      )}

      <ConnectWalletModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />
    </div>
  )
}
