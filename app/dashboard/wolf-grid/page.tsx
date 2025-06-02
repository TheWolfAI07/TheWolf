"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useAccount, useBalance, useChainId } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { TrendingUp, Activity, Zap, Target, MessageSquare, CheckSquare } from "lucide-react"
import Navbar from "@/components/navbar"

// Dynamically import GridLayout to avoid SSR issues
const GridLayout = dynamic(() => import("react-grid-layout"), { ssr: false })

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
  const [liveProfit, setLiveProfit] = useState(12345)
  const [cryptoPrices, setCryptoPrices] = useState({
    BTC: 34500,
    ETH: 1800,
    USDT: 5000,
  })

  const { address, isConnected } = useAccount()
  const { open } = useWeb3Modal()
  const chainId = useChainId()
  const { data: nativeBalance } = useBalance({ address })

  // Layout configuration
  const layout = [
    { i: "crypto", x: 0, y: 0, w: 4, h: 4 },
    { i: "tasks", x: 4, y: 0, w: 4, h: 4 },
    { i: "movements", x: 8, y: 0, w: 4, h: 4 },
    { i: "ideas", x: 0, y: 4, w: 6, h: 3 },
    { i: "logs", x: 6, y: 4, w: 6, h: 3 },
    { i: "goals", x: 0, y: 7, w: 12, h: 4 },
  ]

  useEffect(() => {
    setMounted(true)

    // Simulate live profit updates
    const profitInterval = setInterval(() => {
      setLiveProfit((prev) => prev + Math.floor(Math.random() * 100) - 50)
    }, 5000)

    // Simulate crypto price updates
    const priceInterval = setInterval(() => {
      setCryptoPrices((prev) => ({
        BTC: prev.BTC + Math.floor(Math.random() * 200) - 100,
        ETH: prev.ETH + Math.floor(Math.random() * 50) - 25,
        USDT: prev.USDT + Math.floor(Math.random() * 10) - 5,
      }))
    }, 10000)

    return () => {
      clearInterval(profitInterval)
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
      <Navbar />

      <div className="pt-20 p-4">
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={30}
          width={typeof window !== "undefined" ? window.innerWidth - 32 : 1200}
          draggableHandle=".drag-handle"
          isDraggable={true}
          isResizable={true}
        >
          {/* Crypto Snapshot */}
          <div key="crypto" className="bg-dark-gray rounded-md p-3 border border-gray-700">
            <div className="drag-handle text-turquoise font-semibold mb-2 cursor-move flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Crypto Snapshot
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">BTC</span>
                <span className="font-bold text-white">${cryptoPrices.BTC.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">ETH</span>
                <span className="font-bold text-white">${cryptoPrices.ETH.toLocaleString()}</span>
              </div>
              {isConnected && nativeBalance && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">{nativeBalance.symbol}</span>
                  <span className="font-bold text-cyan-400">{Number(nativeBalance.formatted).toFixed(4)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-300">USDT</span>
                <span className="font-bold text-white">${cryptoPrices.USDT.toLocaleString()}</span>
              </div>
              <button className="mt-2 text-turquoise hover:text-pink transition-colors">View All →</button>
            </div>
          </div>

          {/* Active Tasks */}
          <div key="tasks" className="bg-dark-gray rounded-md p-3 border border-gray-700">
            <div className="drag-handle text-turquoise font-semibold mb-2 cursor-move flex items-center">
              <CheckSquare className="w-4 h-4 mr-2" />
              Active Tasks
            </div>
            <ul className="space-y-2 text-gray-300">
              {tasks.map((task) => (
                <li key={task.id} className="flex justify-between items-center">
                  <span className={task.completed ? "line-through text-gray-500" : ""}>{task.title}</span>
                  <input
                    type="checkbox"
                    className="accent-pink"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                </li>
              ))}
            </ul>
          </div>

          {/* Wolf Movements */}
          <div key="movements" className="bg-dark-gray rounded-md p-3 border border-gray-700">
            <div className="drag-handle text-turquoise font-semibold mb-2 cursor-move flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Wolf Movements
            </div>
            <ul className="space-y-2">
              {movements.map((movement) => (
                <li key={movement.id} className="flex justify-between items-center">
                  <span className="text-gray-300">{movement.action}</span>
                  <span className={getStatusColor(movement.status)}>
                    {movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Idea Drop */}
          <div key="ideas" className="bg-dark-gray rounded-md p-3 border border-gray-700">
            <div className="drag-handle text-turquoise font-semibold mb-2 cursor-move flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Quick Idea Drop
            </div>
            <Textarea
              placeholder="Got a wild idea? Drop it here…"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full h-20 p-2 bg-black text-gray-100 rounded border border-gray-700 focus:border-turquoise outline-none resize-none"
            />
            <Button
              onClick={launchIdea}
              className="mt-2 px-3 py-1 bg-turquoise text-black rounded hover:bg-pink transition"
              disabled={!idea.trim()}
            >
              <Zap className="w-4 h-4 mr-1" />
              Launch
            </Button>
          </div>

          {/* Latest Logs */}
          <div key="logs" className="bg-dark-gray rounded-md p-3 border border-gray-700">
            <div className="drag-handle text-turquoise font-semibold mb-2 cursor-move flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Latest Logs
            </div>
            <div className="overflow-hidden">
              <div className="animate-marquee whitespace-nowrap text-aqua">
                {logs.map((log, index) => (
                  <span key={log.id}>
                    [{log.timestamp}] {log.message}
                    {index < logs.length - 1 ? "  " : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Profit Goals Tracker */}
          <div key="goals" className="bg-dark-gray rounded-md p-3 border border-gray-700">
            <div className="drag-handle text-turquoise font-semibold mb-2 cursor-move flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Profit Goals Tracker
            </div>
            <ul className="space-y-2 text-gray-300 mb-4">
              <li className="flex justify-between items-center">
                <span>Hit $50k Q3 Revenue</span>
                <input type="checkbox" className="accent-pink" />
              </li>
              <li className="flex justify-between items-center">
                <span>Launch Referral Loop</span>
                <input type="checkbox" className="accent-pink" />
              </li>
              <li className="flex justify-between items-center">
                <span>Optimize Tax Entity</span>
                <input type="checkbox" className="accent-pink" />
              </li>
            </ul>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={sampleData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="var(--turquoise)"
                    strokeWidth={2}
                    dot={{ fill: "var(--turquoise)", strokeWidth: 2 }}
                  />
                  <CartesianGrid stroke="#555" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2124",
                      borderColor: "#333",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "var(--turquoise)" }}
                    labelStyle={{ color: "#fff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </GridLayout>
      </div>
    </div>
  )
}
