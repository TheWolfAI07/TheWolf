import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth/auth-provider"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Wolf Platform - Advanced Business Intelligence",
  description:
    "Next-generation business intelligence platform with AI-powered insights, real-time analytics, and comprehensive project management.",
  keywords: ["business intelligence", "analytics", "AI", "dashboard", "project management"],
  authors: [{ name: "Wolf Platform Team" }],
  creator: "Wolf Platform",
  publisher: "Wolf Platform",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wolf-platform.vercel.app",
    title: "Wolf Platform - Advanced Business Intelligence",
    description: "Next-generation business intelligence platform with AI-powered insights",
    siteName: "Wolf Platform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wolf Platform - Advanced Business Intelligence",
    description: "Next-generation business intelligence platform with AI-powered insights",
    creator: "@wolfplatform",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
            <SpeedInsights />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
