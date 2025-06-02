"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Activity, Search, RefreshCw } from "lucide-react"
import Navbar from "@/components/navbar"

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warn" | "error" | "debug"
  message: string
  source: string
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)

    // Simulate loading logs from API
    setTimeout(() => {
      const sampleLogs: LogEntry[] = [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Wallet integration success",
          source: "wallet-connect",
        },
        {
          id: "2",
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          level: "warn",
          message: "API rate limit approaching",
          source: "api-gateway",
        },
        {
          id: "3",
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          level: "error",
          message: "Failed to fetch market data",
          source: "crypto-api",
        },
        {
          id: "4",
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          level: "info",
          message: "User profile updated",
          source: "user-service",
        },
        {
          id: "5",
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          level: "debug",
          message: "Cache refreshed",
          source: "cache-service",
        },
        {
          id: "6",
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          level: "info",
          message: "Scheduled task completed",
          source: "scheduler",
        },
        {
          id: "7",
          timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          level: "warn",
          message: "Memory usage high",
          source: "system-monitor",
        },
      ]

      setLogs(sampleLogs)
      setLoading(false)
    }, 1000)
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-400"
      case "warn":
        return "text-yellow-400"
      case "info":
        return "text-blue-400"
      case "debug":
        return "text-slate-400"
      default:
        return "text-white"
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filter === null || log.level === filter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-turquoise flex items-center">
            <Activity className="mr-2" /> System Logs
          </h1>
          <Button onClick={loadLogs} variant="outline" className="border-cyan-500 text-cyan-400">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card className="bg-black/40 border-slate-700 backdrop-blur-sm mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Badge
                  onClick={() => setFilter(filter === "error" ? null : "error")}
                  className={`cursor-pointer ${filter === "error" ? "bg-red-500" : "bg-slate-700 hover:bg-red-500/30"}`}
                >
                  Errors
                </Badge>
                <Badge
                  onClick={() => setFilter(filter === "warn" ? null : "warn")}
                  className={`cursor-pointer ${filter === "warn" ? "bg-yellow-500" : "bg-slate-700 hover:bg-yellow-500/30"}`}
                >
                  Warnings
                </Badge>
                <Badge
                  onClick={() => setFilter(filter === "info" ? null : "info")}
                  className={`cursor-pointer ${filter === "info" ? "bg-blue-500" : "bg-slate-700 hover:bg-blue-500/30"}`}
                >
                  Info
                </Badge>
                <Badge
                  onClick={() => setFilter(filter === "debug" ? null : "debug")}
                  className={`cursor-pointer ${filter === "debug" ? "bg-slate-500" : "bg-slate-700 hover:bg-slate-500/30"}`}
                >
                  Debug
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>System Activity</span>
              <Badge>{filteredLogs.length} entries</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : filteredLogs.length > 0 ? (
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <Badge
                          className={`mr-2 ${
                            log.level === "error"
                              ? "bg-red-500/20 text-red-400 border-red-500/30"
                              : log.level === "warn"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                : log.level === "info"
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                          }`}
                        >
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-white">{log.message}</span>
                      </div>
                      <div className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <div className="mt-1 text-xs text-slate-500 flex justify-between">
                      <span>Source: {log.source}</span>
                      <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">No logs found matching your criteria</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
