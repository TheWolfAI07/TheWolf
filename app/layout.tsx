import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Wolf Platform - AI-Powered Enterprise Management",
  description:
    "Next-generation AI-powered platform management with real-time analytics and enterprise-grade infrastructure",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-luxury-dark text-white min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
            <Navbar />
            <main className="relative">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
