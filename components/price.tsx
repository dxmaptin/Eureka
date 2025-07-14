"use client"

import { useWallet } from "@/context/wallet-context"
import clsx from "clsx"

export function Price({ usd, eth, className }: { usd: number; eth: number; className?: string }) {
  const { isConnected } = useWallet()
  const usdText = `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatted = isConnected ? `${usdText} / ${eth} ETH` : usdText
  return <span className={clsx(className)}>{formatted}</span>
}
