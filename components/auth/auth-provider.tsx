"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { AuthService, type AuthUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName?: string) => Promise<any>
  signOut: () => Promise<any>
  updateProfile: (updates: Partial<{ full_name: string; avatar_url: string }>) => Promise<any>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => ({}),
  updateProfile: async () => ({}),
  isAuthenticated: false,
})

// Export the hook
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const currentUser = await AuthService.getCurrentUser()
          setUser(currentUser)
        } else {
          setUser(null)
        }
      } catch (err: any) {
        console.error("Auth initialization error:", err)
        setError(err.message)
        setUser(null)
      } finally {
        setLoading(false)
        setInitialLoadComplete(true)
      }
    }

    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.email)

      try {
        if (event === "SIGNED_IN" && session?.user) {
          const currentUser = await AuthService.getCurrentUser()
          setUser(currentUser)
          setError(null)
        } else if (event === "SIGNED_OUT" || !session) {
          setUser(null)
          setError(null)
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          const currentUser = await AuthService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (err: any) {
        console.error("Auth state change error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Handle protected routes
  useEffect(() => {
    if (!initialLoadComplete || loading) return

    const protectedRoutes = ["/dashboard", "/crypto", "/console", "/logs", "/ideas", "/goals", "/settings", "/admin"]
    const isProtectedRoute = protectedRoutes.some((route) => pathname?.startsWith(route))
    const authRoutes = ["/auth/signin", "/auth/signup"]
    const isAuthRoute = authRoutes.includes(pathname || "")

    if (isProtectedRoute && !user) {
      router.push("/auth/signin")
    } else if (isAuthRoute && user) {
      router.push("/dashboard")
    }
  }, [user, loading, pathname, router, initialLoadComplete])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    const result = await AuthService.signIn(email, password)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result.user) {
      // Auth state change listener will handle setting the user
      // setLoading(false) will be called by the listener
    }

    return result
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await AuthService.signUp(email, password, fullName)

      if (result.error) {
        setError(result.error)
      } else {
        // Sign up successful - user may need to verify email
        setError(null)
      }

      setLoading(false)
      return result
    } catch (err: any) {
      console.error("Sign up error in provider:", err)
      setError(err.message)
      setLoading(false)
      return { user: null, error: err.message }
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)

    const result = await AuthService.signOut()

    if (!result.error) {
      setUser(null)
      router.push("/")
    } else {
      setError(result.error)
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

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
