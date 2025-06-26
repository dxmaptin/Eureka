"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import type { CommunityEvent } from "@/lib/data"

export default function CommunityLinks({ items }: { items: CommunityEvent[] }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Community Links</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((ev) => (
          <Card key={ev.title} className="bg-slate-800 border-slate-700 hover:bg-slate-700">
            <CardContent className="p-4 flex justify-between items-center">
              <Link href={ev.link} target="_blank" className="text-purple-400 hover:underline">
                {ev.title}
              </Link>
              <ChevronRight className="h-4 w-4 text-purple-400" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
