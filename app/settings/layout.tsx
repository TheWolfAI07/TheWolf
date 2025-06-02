import type React from "react"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-black via-gunmetal to-slate-800">
        <Navbar />
        <main className="pt-16">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
