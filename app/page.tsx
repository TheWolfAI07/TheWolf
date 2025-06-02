"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap, Shield, Globe, Code, Database, Rocket } from "lucide-react"
import Link from "next/link"
import { useAuthContext } from "@/components/auth/auth-provider"

export default function HomePage() {
  const { user, loading } = useAuthContext()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-600/20 text-blue-400 border-blue-600/30">
            🐺 The Wolf Platform
          </Badge>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Next.js Wolf Project
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            A powerful, full-stack Next.js application with authentication, real-time features, crypto dashboard, and
            admin panel. Built for developers who demand excellence.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {!loading && (
              <>
                {user ? (
                  <Link href="/dashboard/wolf-grid">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin">
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <Shield className="h-8 w-8 text-blue-400 mb-2" />
              <CardTitle className="text-white">Secure Authentication</CardTitle>
              <CardDescription className="text-gray-400">
                Built-in user management with Supabase auth, role-based access control, and session management.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <Database className="h-8 w-8 text-green-400 mb-2" />
              <CardTitle className="text-white">Real-time Database</CardTitle>
              <CardDescription className="text-gray-400">
                PostgreSQL with Supabase for real-time data synchronization and powerful querying capabilities.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <Zap className="h-8 w-8 text-yellow-400 mb-2" />
              <CardTitle className="text-white">Crypto Dashboard</CardTitle>
              <CardDescription className="text-gray-400">
                Advanced cryptocurrency tracking with real-time prices, portfolio management, and market analysis.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <Code className="h-8 w-8 text-purple-400 mb-2" />
              <CardTitle className="text-white">Developer Console</CardTitle>
              <CardDescription className="text-gray-400">
                Built-in console for monitoring, debugging, and managing your application with real-time logs.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <Globe className="h-8 w-8 text-cyan-400 mb-2" />
              <CardTitle className="text-white">Admin Panel</CardTitle>
              <CardDescription className="text-gray-400">
                Comprehensive admin interface for user management, system settings, and application monitoring.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <Rocket className="h-8 w-8 text-red-400 mb-2" />
              <CardTitle className="text-white">Production Ready</CardTitle>
              <CardDescription className="text-gray-400">
                Optimized for performance with TypeScript, Tailwind CSS, and modern React patterns.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 text-white">Built with Modern Technologies</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Next.js 15",
              "React 18",
              "TypeScript",
              "Tailwind CSS",
              "Supabase",
              "PostgreSQL",
              "Vercel",
              "shadcn/ui",
            ].map((tech) => (
              <Badge key={tech} variant="secondary" className="bg-gray-700 text-gray-300 px-4 py-2">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
