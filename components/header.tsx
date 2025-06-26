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
  const { isConnected, address, disconnect } = useWallet()
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300">
      <nav
        className={`rounded-full border border-white/20 bg-white/30 dark:bg-slate-800/50 backdrop-blur-lg backdrop-saturate-150 shadow-lg transition-all duration-300 flex items-center ${
          scrolled ? "px-6 py-2 w-[90%] max-w-3xl" : "px-8 py-3 w-[95%] max-w-4xl"
        }`}
      >
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <Ticket className={`transition-all duration-300 text-purple-500 ${scrolled ? "h-5 w-5" : "h-6 w-6"}`} />
          <span
            className={`font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 transition-all duration-300 ${
              scrolled ? "text-lg" : "text-xl"
            }`}
          >
            NFTickets
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1 flex-1 justify-center">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive("/") ? "text-white bg-slate-800" : "text-slate-300 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            Events
          </Link>
          <Link
            href="/about"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive("/about") ? "text-white bg-slate-800" : "text-slate-300 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            About
          </Link>
          {isConnected && (
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive("/dashboard")
                  ? "text-white bg-slate-800"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              My Tickets
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-slate-300 hover:text-white ml-auto mr-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Wallet Connection */}
        <div className="hidden md:flex items-center">
          {isConnected ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                >
                  <User className="mr-2 h-4 w-4" />
                  {truncateAddress(address)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              size={scrolled ? "sm" : "default"}
            >
              Connect Wallet
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-1/2 -translate-x-1/2 w-[90%] mt-2 rounded-xl bg-slate-900 border border-slate-700 shadow-lg transition-all duration-300 overflow-hidden ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="p-4 space-y-3">
            <Link
              href="/"
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/") ? "text-white bg-slate-800" : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              href="/about"
              className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/about") ? "text-white bg-slate-800" : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            {isConnected && (
              <Link
                href="/dashboard"
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "text-white bg-slate-800"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Tickets
              </Link>
            )}

            {isConnected ? (
              <div className="pt-2 border-t border-slate-800">
                <div className="px-4 py-2 text-sm text-slate-400">Connected as: {truncateAddress(address)}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800/50"
                  onClick={() => {
                    disconnect()
                    setMobileMenuOpen(false)
                  }}
                >
                  Disconnect Wallet
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  setShowConnectModal(true)
                  setMobileMenuOpen(false)
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 mt-2"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </nav>

      <ConnectWalletModal isOpen={showConnectModal} onClose={() => setShowConnectModal(false)} />
    </div>
  )
}
