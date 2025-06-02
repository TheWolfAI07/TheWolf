"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Target, TrendingUp, Plus, Calendar, DollarSign, CheckCircle, Clock } from "lucide-react"
import Navbar from "@/components/navbar"

interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  deadline: string
  category: "profit" | "growth" | "development" | "other"
  history: { date: string; value: number }[]
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState({
    title: "",
    target: 0,
    current: 0,
    unit: "$",
    deadline: "",
    category: "profit",
  })
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = () => {
    setLoading(true)

    // Simulate loading goals from API
    setTimeout(() => {
      const sampleGoals: Goal[] = [
        {
          id: "1",
          title: "Q3 Revenue Target",
          target: 50000,
          current: 32500,
          unit: "$",
          deadline: "2024-09-30",
          category: "profit",
          history: [
            { date: "2024-07-01", value: 10000 },
            { date: "2024-07-15", value: 18500 },
            { date: "2024-08-01", value: 25000 },
            { date: "2024-08-15", value: 32500 },
          ],
        },
        {
          id: "2",
          title: "User Growth",
          target: 10000,
          current: 7500,
          unit: "users",
          deadline: "2024-12-31",
          category: "growth",
          history: [
            { date: "2024-06-01", value: 2000 },
            { date: "2024-07-01", value: 4500 },
            { date: "2024-08-01", value: 7500 },
          ],
        },
        {
          id: "3",
          title: "Launch Mobile App",
          target: 100,
          current: 65,
          unit: "%",
          deadline: "2024-10-15",
          category: "development",
          history: [
            { date: "2024-06-15", value: 20 },
            { date: "2024-07-01", value: 35 },
            { date: "2024-07-15", value: 50 },
            { date: "2024-08-01", value: 65 },
          ],
        },
        {
          id: "4",
          title: "Optimize Tax Structure",
          target: 100,
          current: 40,
          unit: "%",
          deadline: "2024-11-30",
          category: "other",
          history: [
            { date: "2024-07-01", value: 10 },
            { date: "2024-07-15", value: 25 },
            { date: "2024-08-01", value: 40 },
          ],
        },
      ]

      setGoals(sampleGoals)
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
      category: newGoal.category as "profit" | "growth" | "development" | "other",
      history: [{ date: new Date().toISOString().split("T")[0], value: newGoal.current }],
    }

    setGoals([...goals, goal])
    setNewGoal({
      title: "",
      target: 0,
      current: 0,
      unit: "$",
      deadline: "",
      category: "profit",
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
      case "profit":
        return "text-green-400"
      case "growth":
        return "text-blue-400"
      case "development":
        return "text-purple-400"
      default:
        return "text-yellow-400"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "profit":
        return <DollarSign className="w-4 h-4" />
      case "growth":
        return <TrendingUp className="w-4 h-4" />
      case "development":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Target className="w-4 h-4" />
    }
  }

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 90) return "bg-green-500"
    if (percentage >= 60) return "bg-blue-500"
    if (percentage >= 30) return "bg-yellow-500"
    return "bg-red-500"
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
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-turquoise flex items-center">
            <Target className="mr-2" /> Profit Goals
          </h1>
        </div>

        {/* New Goal Form */}
        <Card className="bg-black/40 border-slate-700 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white">Set New Goal</CardTitle>
            <CardDescription>Define clear targets to drive your success</CardDescription>
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
                <option value="€">€ (Euros)</option>
                <option value="users">Users</option>
                <option value="%">% (Percent)</option>
              </select>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                className="bg-slate-800 border border-slate-700 text-white rounded-md p-2"
              >
                <option value="profit">Profit</option>
                <option value="growth">Growth</option>
                <option value="development">Development</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Button
              onClick={addGoal}
              className="bg-turquoise text-black hover:bg-pink transition-colors mt-4"
              disabled={!newGoal.title.trim() || newGoal.target <= 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </CardContent>
        </Card>

        {/* Goals Filter */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Badge
              onClick={() => setActiveCategory(null)}
              className={`cursor-pointer ${activeCategory === null ? "bg-turquoise text-black" : "bg-slate-700"}`}
            >
              All
            </Badge>
            <Badge
              onClick={() => setActiveCategory("profit")}
              className={`cursor-pointer ${activeCategory === "profit" ? "bg-green-500" : "bg-slate-700 hover:bg-green-500/30"}`}
            >
              <DollarSign className="w-3 h-3 mr-1" />
              Profit
            </Badge>
            <Badge
              onClick={() => setActiveCategory("growth")}
              className={`cursor-pointer ${activeCategory === "growth" ? "bg-blue-500" : "bg-slate-700 hover:bg-blue-500/30"}`}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Growth
            </Badge>
            <Badge
              onClick={() => setActiveCategory("development")}
              className={`cursor-pointer ${activeCategory === "development" ? "bg-purple-500" : "bg-slate-700 hover:bg-purple-500/30"}`}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Development
            </Badge>
          </div>
          <Badge>{filteredGoals.length} goals</Badge>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGoals.map((goal) => (
              <Card key={goal.id} className="bg-dark-gray border-slate-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white flex items-center">
                      <span className={`mr-2 ${getCategoryColor(goal.category)}`}>
                        {getCategoryIcon(goal.category)}
                      </span>
                      {goal.title}
                    </CardTitle>
                    <Badge className="bg-slate-600">
                      <Calendar className="w-3 h-3 mr-1" />
                      {goal.deadline}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                      <span className="text-slate-300">{Math.round((goal.current / goal.target) * 100)}%</span>
                    </div>
                    <Progress
                      value={(goal.current / goal.target) * 100}
                      className="h-2"
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
                          itemStyle={{ color: "var(--turquoise)" }}
                          labelStyle={{ color: "#fff" }}
                          formatter={(value) => [`${value} ${goal.unit}`, "Progress"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="var(--turquoise)"
                          strokeWidth={2}
                          dot={{ fill: "var(--turquoise)", strokeWidth: 2 }}
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
                        className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20"
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
          <div className="text-center py-12 bg-black/40 rounded-lg border border-slate-700">
            <Target className="mx-auto h-12 w-12 text-slate-500 mb-3" />
            <h3 className="text-xl font-medium text-slate-300 mb-1">No goals found</h3>
            <p className="text-slate-400">Set your first goal to start tracking your progress.</p>
          </div>
        )}
      </div>
    </div>
  )
}
