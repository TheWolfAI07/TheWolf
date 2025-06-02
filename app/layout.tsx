import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import WalletProvider from "@/components/wallet-provider"
import { headers } from "next/headers"
import { cookieToInitialState } from "wagmi"
import { config } from "@/lib/wallet-config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "The Wolf - Crypto Dashboard",
  description: "Advanced Trading & Analytics Platform",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initialState = cookieToInitialState(config, (await headers()).get("cookie"))

  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider initialState={initialState}>{children}</WalletProvider>
      </body>
    </html>
  )
}
