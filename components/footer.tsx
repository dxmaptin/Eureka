import Link from "next/link"
import { Ticket, Twitter, Instagram, Facebook, Github, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Ticket className="h-6 w-6 text-purple-500" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                NFTickets
              </span>
            </Link>
            <p className="text-slate-400 text-sm">
              Revolutionizing event ticketing with blockchain technology. Secure, transparent, and fair ticketing for
              everyone.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-slate-400 hover:text-purple-400 transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-slate-400 hover:text-purple-400 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-purple-400 transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-400 hover:text-purple-400 transition-colors text-sm">
                  My Tickets
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm">
                  Developers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-400 hover:text-purple-400 transition-colors text-sm">
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a
                href="mailto:info@nftickets.com"
                className="flex items-center text-slate-400 hover:text-purple-400 transition-colors text-sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                info@nftickets.com
              </a>
              <p className="text-slate-400 text-sm">
                123 Blockchain Avenue
                <br />
                San Francisco, CA 94103
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} NFTickets. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="text-slate-500 hover:text-purple-400 transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link href="#" className="text-slate-500 hover:text-purple-400 transition-colors text-sm">
              Terms of Service
            </Link>
            <Link href="#" className="text-slate-500 hover:text-purple-400 transition-colors text-sm">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
