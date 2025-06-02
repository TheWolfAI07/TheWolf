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
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react"

export default function SignUp() {
  const router = useRouter()
  const { signUp, loading, error } = useAuthContext()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLocalError(null)
    setSuccess(null)
    setIsSubmitting(true)

    // Validation
    if (!email || !password || !confirmPassword || !fullName) {
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

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match")
      setIsSubmitting(false)
      return
    }

    try {
      console.log("Attempting sign up with email:", email)
      const result = await signUp(email.trim().toLowerCase(), password, fullName.trim())

      if (result.error) {
        console.error("Sign up failed:", result.error)

        // Provide more user-friendly error messages
        if (result.error.includes("already registered")) {
          setLocalError("An account with this email already exists. Please sign in instead.")
        } else if (result.error.includes("Password should be")) {
          setLocalError("Password must be at least 6 characters long")
        } else if (result.error.includes("Invalid email")) {
          setLocalError("Please enter a valid email address")
        } else {
          setLocalError(result.error)
        }
      } else {
        setSuccess("Account created successfully! Please check your email for verification.")
        // Clear form
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setFullName("")

        // Redirect to sign in after a delay
        setTimeout(() => {
          router.push("/auth/signin")
        }, 3000)
      }
    } catch (err: any) {
      console.error("Unexpected sign up error:", err)
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
          <CardTitle className="text-3xl text-turquoise font-bold">Join Wolf</CardTitle>
          <p className="text-gray-400">Create your account to get started</p>
        </CardHeader>
        <CardContent>
          {currentError && (
            <Alert className="mb-4 border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">{currentError}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-500/50 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-gray-300">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-black text-gray-100 border-gray-700 focus:border-turquoise"
                placeholder="Enter your full name"
                disabled={loading || isSubmitting}
                autoComplete="name"
              />
            </div>

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
                  placeholder="Create a password (min 6 characters)"
                  disabled={loading || isSubmitting}
                  autoComplete="new-password"
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

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black text-gray-100 border-gray-700 focus:border-turquoise pr-10"
                  placeholder="Confirm your password"
                  disabled={loading || isSubmitting}
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading || isSubmitting}
                >
                  {showConfirmPassword ? (
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
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-turquoise hover:text-pink transition-colors font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
