"use client"

import { useState, useEffect } from "react"
import { AuthService, type AuthUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        setError("Failed to get user session")
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const result = await AuthService.signIn(email, password)

    if (result.error) {
      setError(result.error)
    } else if (result.user) {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)
    }

    setLoading(false)
    return result
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    setError(null)

    const result = await AuthService.signUp(email, password, fullName)

    if (result.error) {
      setError(result.error)
    }

    setLoading(false)
    return result
  }

  const signOut = async () => {
    setLoading(true)
    const result = await AuthService.signOut()

    if (!result.error) {
      setUser(null)
    }

    setLoading(false)
    return result
  }

  const updateProfile = async (updates: Partial<{ full_name: string; avatar_url: string }>) => {
    if (!user) return { error: "No user logged in" }

    const result = await AuthService.updateProfile(user.id, updates)

    if (!result.error) {
      // Refresh user data
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)
    }

    return result
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  }
}
