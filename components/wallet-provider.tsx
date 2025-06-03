"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"

export default function WalletProvider({
  children,
}: {
  children: ReactNode
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">{children}</div>
  }

  return <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">{children}</div>
}
