import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Wolf Platform - Enterprise AI Management",
  description: "Next-generation AI-powered platform management with real-time analytics and enterprise infrastructure",
  openGraph: {
    title: "Wolf Platform - Enterprise AI Management",
    description:
      "Next-generation AI-powered platform management with real-time analytics and enterprise infrastructure",
    type: "website",
    url: "https://jagsthewolfv1.vercel.app",
    siteName: "Wolf Platform",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white min-h-screen antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
