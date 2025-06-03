"use client"

import { useState, useEffect, useCallback } from "react"
import { AuthService, type AuthUser } from "@/lib/auth"
import { useErrorHandler } from "./useErrorHandler"
import { ErrorType } from "@/lib/error-handler"

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const { loading, setLoading, error, handleError, clearError } = useErrorHandler()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true)
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
        clearError()
      } catch (err: any) {
        handleError(err, { context: "auth-initialization" })
      } finally {
        setLoading(false)
        setInitialized(true)
      }
    }

    initAuth()
  }, [setLoading, handleError, clearError])

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      clearError()

      try {
        const result = await AuthService.signIn(email, password)

        if (result.error) {
          handleError(
            {
              message: result.error,
              type: ErrorType.AUTH,
              code: "AUTH_SIGNIN_ERROR",
            },
            { email },
          )
        } else if (result.user) {
          const currentUser = await AuthService.getCurrentUser()
          setUser(currentUser)
          clearError()
        }

        setLoading(false)
        return result
      } catch (err: any) {
        handleError(err, { context: "sign-in", email })
        return { user: null, session: null, error: err.message || "Sign in failed" }
      }
    },
    [setLoading, handleError, clearError],
  )

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      setLoading(true)
      clearError()

      try {
        const result = await AuthService.signUp(email, password, fullName)

        if (result.error) {
          handleError(
            {
              message: result.error,
              type: ErrorType.AUTH,
              code: "AUTH_SIGNUP_ERROR",
            },
            { email },
          )
        } else {
          clearError()
        }

        setLoading(false)
        return result
      } catch (err: any) {
        handleError(err, { context: "sign-up", email })
        return { user: null, error: err.message || "Sign up failed" }
      }
    },
    [setLoading, handleError, clearError],
  )

  const signOut = useCallback(async () => {
    setLoading(true)
    clearError()

    try {
      const result = await AuthService.signOut()

      if (!result.error) {
        setUser(null)
        clearError()
      } else {
        handleError(
          {
            message: result.error,
            type: ErrorType.AUTH,
            code: "AUTH_SIGNOUT_ERROR",
          },
          { userId: user?.id },
        )
      }

      setLoading(false)
      return result
    } catch (err: any) {
      handleError(err, { context: "sign-out", userId: user?.id })
      return { error: err.message || "Sign out failed" }
    }
  }, [setLoading, handleError, clearError, user])

  const updateProfile = useCallback(
    async (updates: Partial<{ full_name: string; avatar_url: string }>) => {
      if (!user) return { error: "No user logged in" }

      setLoading(true)
      clearError()

      try {
        const result = await AuthService.updateProfile(user.id, updates)

        if (!result.error) {
          // Refresh user data
          const currentUser = await AuthService.getCurrentUser()
          setUser(currentUser)
          clearError()
        } else {
          handleError(
            {
              message: result.error,
              type: ErrorType.AUTH,
              code: "PROFILE_UPDATE_ERROR",
            },
            { userId: user.id, updates },
          )
        }

        setLoading(false)
        return result
      } catch (err: any) {
        handleError(err, { context: "update-profile", userId: user.id, updates })
        return { error: err.message || "Profile update failed" }
      }
    },
    [user, setLoading, handleError, clearError],
  )

  return {
    user,
    loading,
    error: error?.message,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!user,
    initialized,
  }
}
