"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function EventHeader() {
  const pathname = usePathname()
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-6 transition-all duration-300">
      <nav className="rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg transition-all duration-300 flex items-center px-8 py-3 w-[95%] max-w-4xl">
        <Link href="/" className="flex items-center space-x-2 mr-6">
          <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 text-2xl">
            Eureka
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-2 flex-1 justify-center">
          <Link
            href="/"
            className={`px-5 py-2 rounded-full text-base font-medium transition-colors ${
              isActive("/") ? "text-white bg-slate-800" : "text-slate-300 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            Events
          </Link>
          <Link
            href="/about"
            className={`px-5 py-2 rounded-full text-base font-medium transition-colors ${
              isActive("/about") ? "text-white bg-slate-800" : "text-slate-300 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            About
          </Link>
          <Link
            href="/dashboard"
            className={`px-5 py-2 rounded-full text-base font-medium transition-colors ${
              isActive("/dashboard") ? "text-white bg-slate-800" : "text-slate-300 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            Tickets
          </Link>
        </div>
      </nav>
    </div>
  )
}
