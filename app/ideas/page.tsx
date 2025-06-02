"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Zap, Trash2 } from "lucide-react"
import Navbar from "@/components/navbar"

interface Idea {
  id: string
  title: string
  description: string
  timestamp: string
  status: "new" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [newIdea, setNewIdea] = useState({ title: "", description: "" })
  const [filter, setFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadIdeas()
  }, [])

  const loadIdeas = () => {
    setLoading(true)

    // Simulate loading ideas from API
    setTimeout(() => {
      const sampleIdeas: Idea[] = [
        {
          id: "1",
          title: "Automated Trading Bot",
          description:
            "Create a bot that can analyze market trends and execute trades automatically based on predefined strategies.",
          timestamp: new Date().toISOString(),
          status: "new",
          priority: "high",
        },
        {
          id: "2",
          title: "Portfolio Diversification Tool",
          description:
            "Build a tool that suggests optimal asset allocation based on risk tolerance and market conditions.",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "in-progress",
          priority: "medium",
        },
        {
          id: "3",
          title: "Tax Optimization Strategy",
          description: "Develop a system to track trades and suggest tax-efficient trading patterns.",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "completed",
          priority: "medium",
        },
        {
          id: "4",
          title: "Market Sentiment Analyzer",
          description:
            "Create a tool that analyzes social media and news to gauge market sentiment for specific assets.",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: "new",
          priority: "low",
        },
      ]

      setIdeas(sampleIdeas)
      setLoading(false)
    }, 1000)
  }

  const addIdea = () => {
    if (!newIdea.title.trim()) return

    const idea: Idea = {
      id: Date.now().toString(),
      title: newIdea.title,
      description: newIdea.description,
      timestamp: new Date().toISOString(),
      status: "new",
      priority: "medium",
    }

    setIdeas([idea, ...ideas])
    setNewIdea({ title: "", description: "" })
  }

  const updateIdeaStatus = (id: string, status: "new" | "in-progress" | "completed") => {
    setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, status } : idea)))
  }

  const updateIdeaPriority = (id: string, priority: "low" | "medium" | "high") => {
    setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, priority } : idea)))
  }

  const deleteIdea = (id: string) => {
    setIdeas(ideas.filter((idea) => idea.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "in-progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const filteredIdeas = ideas.filter((idea) => {
    return filter === null || idea.status === filter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-turquoise flex items-center">
            <Lightbulb className="mr-2" /> Wolf Ideas
          </h1>
        </div>

        {/* New Idea Form */}
        <Card className="bg-black/40 border-slate-700 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="text-white">Drop a New Idea</CardTitle>
            <CardDescription>Capture your brilliant ideas before they escape</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Idea Title"
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Textarea
                placeholder="Describe your idea..."
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
              />
              <Button
                onClick={addIdea}
                className="bg-turquoise text-black hover:bg-pink transition-colors"
                disabled={!newIdea.title.trim()}
              >
                <Zap className="w-4 h-4 mr-2" />
                Launch Idea
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ideas Filter */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Badge
              onClick={() => setFilter(null)}
              className={`cursor-pointer ${filter === null ? "bg-turquoise text-black" : "bg-slate-700"}`}
            >
              All
            </Badge>
            <Badge
              onClick={() => setFilter("new")}
              className={`cursor-pointer ${filter === "new" ? "bg-blue-500" : "bg-slate-700 hover:bg-blue-500/30"}`}
            >
              New
            </Badge>
            <Badge
              onClick={() => setFilter("in-progress")}
              className={`cursor-pointer ${filter === "in-progress" ? "bg-yellow-500" : "bg-slate-700 hover:bg-yellow-500/30"}`}
            >
              In Progress
            </Badge>
            <Badge
              onClick={() => setFilter("completed")}
              className={`cursor-pointer ${filter === "completed" ? "bg-green-500" : "bg-slate-700 hover:bg-green-500/30"}`}
            >
              Completed
            </Badge>
          </div>
          <Badge>{filteredIdeas.length} ideas</Badge>
        </div>

        {/* Ideas List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIdeas.map((idea) => (
              <Card key={idea.id} className="bg-dark-gray border-slate-700">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white">{idea.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                      onClick={() => deleteIdea(idea.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge className={getStatusColor(idea.status)}>
                      {idea.status === "in-progress"
                        ? "In Progress"
                        : idea.status.charAt(0).toUpperCase() + idea.status.slice(1)}
                    </Badge>
                    <Badge className={getPriorityColor(idea.priority)}>
                      {idea.priority.charAt(0).toUpperCase() + idea.priority.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm mb-4">{idea.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-500">{new Date(idea.timestamp).toLocaleDateString()}</div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-blue-500 text-blue-400 hover:bg-blue-500/20"
                        onClick={() => updateIdeaStatus(idea.id, "new")}
                      >
                        New
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-yellow-500 text-yellow-400 hover:bg-yellow-500/20"
                        onClick={() => updateIdeaStatus(idea.id, "in-progress")}
                      >
                        Start
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs border-green-500 text-green-400 hover:bg-green-500/20"
                        onClick={() => updateIdeaStatus(idea.id, "completed")}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-black/40 rounded-lg border border-slate-700">
            <Lightbulb className="mx-auto h-12 w-12 text-slate-500 mb-3" />
            <h3 className="text-xl font-medium text-slate-300 mb-1">No ideas found</h3>
            <p className="text-slate-400">Time to get creative! Add your first idea above.</p>
          </div>
        )}
      </div>
    </div>
  )
}
