"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function NftGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false)

  if (unlocked) {
    return <>{children}</>
  }

  return (
    <Card className="bg-slate-800 border-slate-700 text-center">
      <CardContent className="p-6">
        <p className="text-slate-300 mb-4">
          This content is exclusive to holders of a specific NFT.
        </p>
        <Button
          onClick={() => setUnlocked(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
        >
          Verify NFT
        </Button>
      </CardContent>
    </Card>
  )
}
