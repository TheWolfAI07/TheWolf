"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthContext } from "@/components/auth/auth-provider"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"

export default function SignIn() {
  const router = useRouter()
  const { signIn, loading, error } = useAuthContext()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Demo account helper
  const fillDemoCredentials = () => {
    setEmail("demo@wolf.com")
    setPassword("demo123")
    setLocalError(null) // Clear any previous errors
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)
    setIsSubmitting(true)

    // Basic validation
    if (!email || !password) {
      setLocalError("Please fill in all fields")
      setIsSubmitting(false)
      return
    }

    if (!email.includes("@")) {
      setLocalError("Please enter a valid email address")
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters")
      setIsSubmitting(false)
      return
    }

    try {
      console.log("Attempting sign in with email:", email)

      // For demo account, show special message
      if (email === "demo@wolf.com") {
        setLocalError(
          "Attempting to sign in with demo account. If this is your first time, it may take a moment to set up...",
        )
      }

      const result = await signIn(email.trim().toLowerCase(), password)

      if (result.error) {
        console.error("Sign in failed:", result.error)

        // Provide more user-friendly error messages
        if (result.error.includes("Invalid login credentials")) {
          if (email === "demo@wolf.com") {
            setLocalError("Demo account login failed. Please try again or create a new account.")
          } else {
            setLocalError("Invalid email or password. Please check your credentials and try again.")
          }
        } else if (result.error.includes("Email not confirmed")) {
          setLocalError("Please check your email and click the confirmation link before signing in.")
        } else if (result.error.includes("Too many requests")) {
          setLocalError("Too many sign-in attempts. Please wait a few minutes and try again.")
        } else {
          setLocalError(result.error)
        }
      } else {
        console.log("Sign in successful, redirecting...")
        router.push("/dashboard/wolf-grid")
      }
    } catch (err: any) {
      console.error("Unexpected sign in error:", err)
      setLocalError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentError = localError || error

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gunmetal to-slate-800 p-4">
      <Card className="bg-dark-gray/90 backdrop-blur-md border border-gray-700 w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-2xl">W</span>
          </div>
          <CardTitle className="text-3xl text-turquoise font-bold">Welcome Back</CardTitle>
          <p className="text-gray-400">Sign in to your Wolf account</p>
        </CardHeader>
        <CardContent>
          {currentError && (
            <Alert className="mb-4 border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">{currentError}</AlertDescription>
            </Alert>
          )}

          {/* Demo Account Helper */}
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400 mb-3">
              <strong>Demo Account Available:</strong>
              <br />
              Don't have an account? Use our demo credentials to explore the platform.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillDemoCredentials}
                className="text-blue-400 border-blue-500/50 hover:bg-blue-500/10"
              >
                Fill Demo Credentials
              </Button>
              <p className="text-xs text-gray-500">Email: demo@wolf.com | Password: demo123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black text-gray-100 border-gray-700 focus:border-turquoise"
                placeholder="Enter your email"
                disabled={loading || isSubmitting}
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black text-gray-100 border-gray-700 focus:border-turquoise pr-10"
                  placeholder="Enter your password"
                  disabled={loading || isSubmitting}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full bg-turquoise text-black font-semibold hover:bg-pink transition-colors"
            >
              {loading || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="text-turquoise hover:text-pink transition-colors font-medium">
                Sign Up
              </Link>
            </p>
          </div>

          {/* Debug info in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-2 bg-gray-800 rounded text-xs text-gray-400">
              <p>Debug: Email: {email}</p>
              <p>Debug: Password length: {password.length}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
