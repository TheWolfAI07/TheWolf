"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Target, TrendingUp, Plus, Calendar, DollarSign, CheckCircle, Clock, Crown, Zap } from "lucide-react"
import { Navbar } from "@/components/navbar"

interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  deadline: string
  category: "crypto" | "business" | "personal" | "financial"
  priority: "low" | "medium" | "high" | "critical"
  history: { date: string; value: number }[]
  description?: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState({
    title: "",
    target: 0,
    current: 0,
    unit: "$",
    deadline: "",
    category: "crypto",
    priority: "medium",
    description: "",
  })
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = () => {
    setLoading(true)

    // Initialize with realistic Wolf Platform goals
    setTimeout(() => {
      const wolfGoals: Goal[] = [
        {
          id: "crypto-portfolio",
          title: "Crypto Portfolio Target",
          target: 100000,
          current: 25000,
          unit: "$",
          deadline: "2024-12-31",
          category: "crypto",
          priority: "high",
          description: "Build a diversified crypto portfolio focusing on BTC, ETH, and high-potential altcoins",
          history: [
            { date: "2024-01-01", value: 5000 },
            { date: "2024-02-01", value: 12000 },
            { date: "2024-03-01", value: 18000 },
            { date: "2024-04-01", value: 25000 },
          ],
        },
        {
          id: "btc-accumulation",
          title: "Bitcoin Accumulation",
          target: 1,
          current: 0.35,
          unit: "BTC",
          deadline: "2024-08-31",
          category: "crypto",
          priority: "critical",
          description: "Accumulate 1 full Bitcoin through DCA strategy during market dips",
          history: [
            { date: "2024-01-01", value: 0.1 },
            { date: "2024-02-01", value: 0.2 },
            { date: "2024-03-01", value: 0.28 },
            { date: "2024-04-01", value: 0.35 },
          ],
        },
        {
          id: "business-revenue",
          title: "Monthly Business Revenue",
          target: 50000,
          current: 15000,
          unit: "$",
          deadline: "2024-06-30",
          category: "business",
          priority: "high",
          description: "Scale Wolf Platform to $50k monthly recurring revenue through early adopters",
          history: [
            { date: "2024-01-01", value: 2000 },
            { date: "2024-02-01", value: 6000 },
            { date: "2024-03-01", value: 10000 },
            { date: "2024-04-01", value: 15000 },
          ],
        },
        {
          id: "emergency-fund",
          title: "Emergency Fund",
          target: 50000,
          current: 18000,
          unit: "$",
          deadline: "2024-09-30",
          category: "financial",
          priority: "medium",
          description: "Build 6-month emergency fund for financial security and peace of mind",
          history: [
            { date: "2024-01-01", value: 8000 },
            { date: "2024-02-01", value: 12000 },
            { date: "2024-03-01", value: 15000 },
            { date: "2024-04-01", value: 18000 },
          ],
        },
        {
          id: "platform-users",
          title: "Wolf Platform Users",
          target: 10000,
          current: 250,
          unit: "users",
          deadline: "2024-12-31",
          category: "business",
          priority: "high",
          description: "Grow Wolf Platform to 10,000 active users through word-of-mouth and value delivery",
          history: [
            { date: "2024-01-01", value: 10 },
            { date: "2024-02-01", value: 50 },
            { date: "2024-03-01", value: 150 },
            { date: "2024-04-01", value: 250 },
          ],
        },
        {
          id: "fitness-goal",
          title: "Fitness Milestone",
          target: 180,
          current: 165,
          unit: "lbs",
          deadline: "2024-07-31",
          category: "personal",
          priority: "medium",
          description: "Reach target weight through consistent training and nutrition",
          history: [
            { date: "2024-01-01", value: 175 },
            { date: "2024-02-01", value: 172 },
            { date: "2024-03-01", value: 168 },
            { date: "2024-04-01", value: 165 },
          ],
        },
      ]

      setGoals(wolfGoals)
      setLoading(false)
    }, 1000)
  }

  const addGoal = () => {
    if (!newGoal.title.trim() || newGoal.target <= 0) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      target: newGoal.target,
      current: newGoal.current,
      unit: newGoal.unit,
      deadline: newGoal.deadline,
      category: newGoal.category as Goal["category"],
      priority: newGoal.priority as Goal["priority"],
      description: newGoal.description,
      history: [{ date: new Date().toISOString().split("T")[0], value: newGoal.current }],
    }

    setGoals([...goals, goal])
    setNewGoal({
      title: "",
      target: 0,
      current: 0,
      unit: "$",
      deadline: "",
      category: "crypto",
      priority: "medium",
      description: "",
    })
  }

  const updateGoalProgress = (id: string, newValue: number) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === id) {
          const updatedGoal = {
            ...goal,
            current: newValue,
            history: [...goal.history, { date: new Date().toISOString().split("T")[0], value: newValue }],
          }
          return updatedGoal
        }
        return goal
      }),
    )
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "crypto":
        return "text-gold"
      case "business":
        return "text-teal"
      case "financial":
        return "text-green-400"
      case "personal":
        return "text-purple-400"
      default:
        return "text-slate-400"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "crypto":
        return <Crown className="w-4 h-4" />
      case "business":
        return <TrendingUp className="w-4 h-4" />
      case "financial":
        return <DollarSign className="w-4 h-4" />
      case "personal":
        return <Target className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 90) return "bg-green-500"
    if (percentage >= 70) return "bg-teal"
    if (percentage >= 50) return "bg-gold"
    if (percentage >= 30) return "bg-orange-500"
    return "bg-red-500"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/20 text-red-300 border-red-400/50"
      case "high":
        return "bg-orange-500/20 text-orange-300 border-orange-400/50"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/50"
      case "low":
        return "bg-green-500/20 text-green-300 border-green-400/50"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-400/50"
    }
  }

  const getDaysRemaining = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const filteredGoals = goals.filter((goal) => {
    return activeCategory === null || goal.category === activeCategory
  })

  return (
    <div className="min-h-screen bg-wolf-gradient">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal to-dark-teal rounded-xl flex items-center justify-center wolf-shadow">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-wolf-heading metallic-shine">Wolf Targets & Goals</h1>
              <p className="text-slate-400">Track your crypto, business, and personal objectives</p>
            </div>
          </div>
          <Badge className="badge-wolf-gold px-4 py-2">
            <Zap className="h-4 w-4 mr-2" />
            {filteredGoals.length} Active Goals
          </Badge>
        </div>

        {/* New Goal Form */}
        <Card className="bg-wolf-card wolf-border wolf-shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-wolf-heading">Create New Wolf Target</CardTitle>
            <CardDescription>Set ambitious goals and track your progress like a silent assassin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input
                placeholder="Goal Title"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-slate-700 border border-r-0 border-slate-600 rounded-l-md text-white">
                  {newGoal.unit}
                </span>
                <Input
                  type="number"
                  placeholder="Target Value"
                  value={newGoal.target || ""}
                  onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-700 text-white rounded-l-none"
                />
              </div>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-slate-700 border border-r-0 border-slate-600 rounded-l-md text-white">
                  {newGoal.unit}
                </span>
                <Input
                  type="number"
                  placeholder="Current Value"
                  value={newGoal.current || ""}
                  onChange={(e) => setNewGoal({ ...newGoal, current: Number(e.target.value) })}
                  className="bg-slate-800 border-slate-700 text-white rounded-l-none"
                />
              </div>
              <Input
                type="date"
                placeholder="Deadline"
                value={newGoal.deadline}
                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <select
                value={newGoal.unit}
                onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-white rounded-md p-2"
              >
                <option value="$">$ (Dollars)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="users">Users</option>
                <option value="%">% (Percent)</option>
                <option value="lbs">lbs (Pounds)</option>
                <option value="kg">kg (Kilograms)</option>
              </select>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-white rounded-md p-2"
              >
                <option value="crypto">Crypto</option>
                <option value="business">Business</option>
                <option value="financial">Financial</option>
                <option value="personal">Personal</option>
              </select>
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-white rounded-md p-2"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Priority</option>
              </select>
            </div>
            <Input
              placeholder="Description (optional)"
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white mt-4"
            />
            <Button onClick={addGoal} className="btn-wolf mt-4" disabled={!newGoal.title.trim() || newGoal.target <= 0}>
              <Plus className="w-4 h-4 mr-2" />
              Add Wolf Target
            </Button>
          </CardContent>
        </Card>

        {/* Goals Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Badge
              onClick={() => setActiveCategory(null)}
              className={`cursor-pointer ${activeCategory === null ? "badge-wolf" : "bg-slate-700 hover:bg-slate-600"}`}
            >
              All
            </Badge>
            <Badge
              onClick={() => setActiveCategory("crypto")}
              className={`cursor-pointer ${activeCategory === "crypto" ? "badge-wolf-gold" : "bg-slate-700 hover:bg-slate-600"}`}
            >
              <Crown className="w-3 h-3 mr-1" />
              Crypto
            </Badge>
            <Badge
              onClick={() => setActiveCategory("business")}
              className={`cursor-pointer ${activeCategory === "business" ? "badge-wolf" : "bg-slate-700 hover:bg-slate-600"}`}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Business
            </Badge>
            <Badge
              onClick={() => setActiveCategory("financial")}
              className={`cursor-pointer ${activeCategory === "financial" ? "bg-green-500/20 text-green-300" : "bg-slate-700 hover:bg-slate-600"}`}
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Financial
            </Badge>
            <Badge
              onClick={() => setActiveCategory("personal")}
              className={`cursor-pointer ${activeCategory === "personal" ? "bg-purple-500/20 text-purple-300" : "bg-slate-700 hover:bg-slate-600"}`}
            >
              <Target className="w-3 h-3 mr-1" />
              Personal
            </Badge>
          </div>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal"></div>
          </div>
        ) : filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGoals.map((goal) => (
              <Card key={goal.id} className="bg-wolf-card wolf-border wolf-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-wolf-heading flex items-center gap-2">
                        <span className={getCategoryColor(goal.category)}>{getCategoryIcon(goal.category)}</span>
                        {goal.title}
                      </CardTitle>
                      {goal.description && <CardDescription className="mt-2">{goal.description}</CardDescription>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                      <Badge className="bg-slate-600 text-slate-300">
                        <Calendar className="w-3 h-3 mr-1" />
                        {goal.deadline}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                      <span className="text-slate-300">{Math.round((goal.current / goal.target) * 100)}%</span>
                    </div>
                    <Progress
                      value={(goal.current / goal.target) * 100}
                      className="h-3"
                      indicatorClassName={getProgressColor(goal.current, goal.target)}
                    />
                  </div>

                  <div className="h-[150px] mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={goal.history.map((h) => ({ date: h.date, value: h.value }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis
                          dataKey="date"
                          stroke="#888"
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                          }
                        />
                        <YAxis stroke="#888" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1f2124", borderColor: "#333", borderRadius: "8px" }}
                          itemStyle={{ color: "#06b6d4" }}
                          labelStyle={{ color: "#fff" }}
                          formatter={(value) => [`${value} ${goal.unit}`, "Progress"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          dot={{ fill: "#06b6d4", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-slate-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {getDaysRemaining(goal.deadline)} days remaining
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-teal text-teal hover:bg-teal/20"
                        onClick={() => updateGoalProgress(goal.id, goal.current + goal.target * 0.1)}
                      >
                        Update Progress
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-wolf-card rounded-lg wolf-border">
            <Target className="mx-auto h-12 w-12 text-slate-500 mb-3" />
            <h3 className="text-xl font-medium text-slate-300 mb-1">No goals found</h3>
            <p className="text-slate-400">Set your first Wolf target to start tracking your progress.</p>
          </div>
        )}
      </div>
    </div>
  )
}
