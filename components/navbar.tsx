"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Crown, BarChart3, Settings, Database, Bug, Activity, Shield, Home } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="relative z-10 border-b border-slate-700 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-4">
            <div className="relative">
              <Brain className="h-8 w-8 text-cyan-400" />
              <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Wolf Platform
              </h1>
              <p className="text-xs text-yellow-400">ENTERPRISE EDITION</p>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
              <Activity className="h-3 w-3 mr-1" />
              LIVE
            </Badge>

            <div className="flex items-center space-x-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-300">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-300">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/console">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-300">
                  <Settings className="h-4 w-4 mr-2" />
                  Console
                </Button>
              </Link>
              <Link href="/debug">
                <Button variant="ghost" size="sm" className="text-red-300 hover:text-red-400">
                  <Bug className="h-4 w-4 mr-2" />
                  Debug
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10">
                <Database className="h-4 w-4 mr-2" />
                DB
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export { Navbar }
