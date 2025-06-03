"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Activity, Zap, Target, MessageSquare, CheckSquare, ArrowLeft } from "lucide-react"
import Link from "next/link"

const sampleData = [
  { name: "Jan", uv: 400, profit: 1200 },
  { name: "Feb", uv: 600, profit: 1800 },
  { name: "Mar", uv: 500, profit: 2100 },
  { name: "Apr", uv: 700, profit: 2800 },
  { name: "May", uv: 650, profit: 3200 },
  { name: "Jun", uv: 800, profit: 3800 },
]

interface Task {
  id: string
  title: string
  completed: boolean
}

interface WolfMovement {
  id: string
  action: string
  status: "live" | "pending" | "done"
}

interface LogEntry {
  id: string
  timestamp: string
  message: string
}

export default function WolfGridDashboard() {
  const [mounted, setMounted] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Build Crypto Module", completed: false },
    { id: "2", title: "Deploy Growth Campaign", completed: false },
    { id: "3", title: "Optimize Tax Structure", completed: false },
  ])

  const [movements, setMovements] = useState<WolfMovement[]>([
    { id: "1", action: "Syncing Wallets", status: "live" },
    { id: "2", action: "Analyzing BTC Trends", status: "pending" },
    { id: "3", action: "Deploying UI Updates", status: "done" },
  ])

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", timestamp: "12:04", message: "Wallet integration success" },
    { id: "2", timestamp: "11:59", message: "Deployed growth hack" },
    { id: "3", timestamp: "11:50", message: 'Task "Build Console" started' },
  ])

  const [idea, setIdea] = useState("")
  const [cryptoPrices, setCryptoPrices] = useState({
    BTC: 34500,
    ETH: 1800,
    USDT: 5000,
  })

  useEffect(() => {
    setMounted(true)

    // Simulate crypto price updates
    const priceInterval = setInterval(() => {
      setCryptoPrices((prev) => ({
        BTC: prev.BTC + Math.floor(Math.random() * 200) - 100,
        ETH: prev.ETH + Math.floor(Math.random() * 50) - 25,
        USDT: prev.USDT + Math.floor(Math.random() * 10) - 5,
      }))
    }, 10000)

    return () => {
      clearInterval(priceInterval)
    }
  }, [])

  const toggleTask = (taskId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const launchIdea = () => {
    if (idea.trim()) {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        message: `Idea launched: ${idea.substring(0, 30)}...`,
      }
      setLogs((prev) => [newLog, ...prev.slice(0, 4)])
      setIdea("")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "text-green-400"
      case "pending":
        return "text-yellow-400"
      case "done":
        return "text-pink-400"
      default:
        return "text-gray-400"
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-black font-bold text-lg">W</span>
          </div>
          <p className="text-cyan-400">Loading Wolf Grid...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-bold text-cyan-400">Wolf Grid Dashboard</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/crypto" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Crypto
              </Link>
              <Link href="/console" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Console
              </Link>
              <Link href="/docs" className="text-slate-300 hover:text-cyan-400 transition-colors">
                Docs
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Crypto Snapshot */}
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Crypto Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">BTC</span>
                <span className="font-bold text-white">${cryptoPrices.BTC.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">ETH</span>
                <span className="font-bold text-white">${cryptoPrices.ETH.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">USDT</span>
                <span className="font-bold text-white">${cryptoPrices.USDT.toLocaleString()}</span>
              </div>
              <Link href="/crypto" className="block mt-4">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black">
                  View All →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Active Tasks */}
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center">
                <CheckSquare className="w-5 h-5 mr-2" />
                Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li key={task.id} className="flex justify-between items-center">
                    <span className={task.completed ? "line-through text-slate-500" : "text-slate-300"}>
                      {task.title}
                    </span>
                    <input
                      type="checkbox"
                      className="accent-pink-500"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Wolf Movements */}
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Wolf Movements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {movements.map((movement) => (
                  <li key={movement.id} className="flex justify-between items-center">
                    <span className="text-slate-300">{movement.action}</span>
                    <span className={getStatusColor(movement.status)}>
                      {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Quick Idea Drop */}
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Quick Idea Drop
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Got a wild idea? Drop it here…"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="w-full h-24 bg-slate-900 border-slate-600 text-white resize-none"
              />
              <Button
                onClick={launchIdea}
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                disabled={!idea.trim()}
              >
                <Zap className="w-4 h-4 mr-2" />
                Launch Idea
              </Button>
            </CardContent>
          </Card>

          {/* Latest Logs */}
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Latest Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="text-sm">
                    <span className="text-slate-500">[{log.timestamp}]</span>{" "}
                    <span className="text-slate-300">{log.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profit Goals Tracker */}
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Profit Goals Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ul className="space-y-3 mb-4">
                    <li className="flex justify-between items-center">
                      <span className="text-slate-300">Hit $50k Q3 Revenue</span>
                      <input type="checkbox" className="accent-pink-500" />
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-slate-300">Launch Referral Loop</span>
                      <input type="checkbox" className="accent-pink-500" />
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-slate-300">Optimize Tax Entity</span>
                      <input type="checkbox" className="accent-pink-500" />
                    </li>
                  </ul>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sampleData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#00E5CF"
                        strokeWidth={2}
                        dot={{ fill: "#00E5CF", strokeWidth: 2 }}
                      />
                      <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1F2937",
                          borderColor: "#374151",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#00E5CF" }}
                        labelStyle={{ color: "#fff" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
