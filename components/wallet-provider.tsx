"use client"

import { createWeb3Modal } from "@web3modal/wagmi/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type State, WagmiProvider } from "wagmi"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"

import { config, projectId } from "@/lib/wallet-config"

// Setup queryClient
const queryClient = new QueryClient()

let modal: any = null

export default function WalletProvider({
  children,
  initialState,
}: {
  children: ReactNode
  initialState?: State
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Only create modal on client side and if projectId exists
    if (typeof window !== "undefined" && projectId && projectId !== "your-project-id" && !modal) {
      try {
        modal = createWeb3Modal({
          wagmiConfig: config,
          projectId,
          enableAnalytics: false, // Disable analytics to prevent errors
          enableOnramp: false, // Disable onramp to prevent errors
          themeMode: "dark",
          themeVariables: {
            "--w3m-color-mix": "#00E5CF",
            "--w3m-color-mix-strength": 20,
            "--w3m-accent": "#00E5CF",
            "--w3m-border-radius-master": "8px",
          },
        })
      } catch (error) {
        console.warn("Failed to initialize Web3Modal:", error)
      }
    }
  }, [])

  if (!isClient) {
    return <div>{children}</div>
  }

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
