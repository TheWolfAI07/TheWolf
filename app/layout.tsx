import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { DebugButton } from "@/components/debug-button"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Wolf Platform",
  description: "Enterprise AI Management Platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <DebugButton variant="floating" />
        </ThemeProvider>
      </body>
    </html>
  )
}
