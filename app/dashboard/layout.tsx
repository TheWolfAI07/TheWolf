import type React from "react"
import { Navbar } from "@/components/navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gunmetal to-slate-800">
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  )
}
