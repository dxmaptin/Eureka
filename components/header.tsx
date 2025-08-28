"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/context/wallet-context"
import { ConnectWalletModal } from "@/components/connect-wallet-modal"
import { Ticket, User, Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { isConnected, address, disconnect, walletType, user, loginMethod, isCustodial } = useWallet()
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getDisplayName = () => {
    if (walletType === 'magic' && user) {
      if (user.email) return user.email
      if (user.phoneNumber) return user.phoneNumber
      if (user.oauthProvider) return `${user.oauthProvider} user`
    }
    return truncateAddress(address)
  }

  const getAccountType = () => {
    if (isCustodial) return "Custodial Account"
    return "Web3 Wallet"
  }

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [scrolled])

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return null
}
