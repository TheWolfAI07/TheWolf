"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignIn() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    // Simulate auth - in real app, implement proper authentication
    setTimeout(() => {
      // Set signed in state in localStorage
      localStorage.setItem("wolf-signed-in", "true")
      setIsLoading(false)
      router.push("/dashboard/wolf-grid")
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gunmetal to-slate-800">
      <Card className="bg-dark-gray/90 backdrop-blur-md border border-gray-700 w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-2xl">W</span>
          </div>
          <CardTitle className="text-3xl text-turquoise font-bold">Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black text-gray-100 border-gray-700 focus:border-turquoise"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label className="text-gray-300">Password</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black text-gray-100 border-gray-700 focus:border-turquoise"
                placeholder="Enter your password"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-turquoise text-black font-semibold hover:bg-pink transition-colors"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
