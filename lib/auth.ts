import { supabase, safeDbOperation } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export class AuthService {
  // Sign up new user with enhanced error handling
  static async signUp(email: string, password: string, fullName?: string) {
    try {
      if (!supabase) {
        throw new Error("Authentication service not available")
      }

      // Validate inputs
      if (!email || !email.includes("@")) {
        return { user: null, error: "Valid email is required" }
      }

      if (!password || password.length < 6) {
        return { user: null, error: "Password must be at least 6 characters" }
      }

      console.log("Attempting to sign up user:", email)

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName || "",
          },
        },
      })

      if (error) {
        console.error("Supabase sign up error:", error)
        throw error
      }

      console.log("Sign up successful:", data.user?.email)
      return { user: data.user, error: null }
    } catch (error: any) {
      console.error("Sign up error:", error)
      return { user: null, error: error?.message || "Sign up failed" }
    }
  }

  // Sign in user with robust error handling
  static async signIn(email: string, password: string) {
    try {
      if (!supabase) {
        throw new Error("Authentication service not available")
      }

      // Validate inputs
      if (!email || !email.includes("@")) {
        return { user: null, session: null, error: "Valid email is required" }
      }

      if (!password || password.length < 1) {
        return { user: null, session: null, error: "Password is required" }
      }

      console.log("Attempting to sign in user:", email)

      // Normalize email
      const normalizedEmail = email.trim().toLowerCase()

      // Special handling for demo account
      const isDemoAccount = normalizedEmail === "demo@wolf.com"

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (error) {
        console.error("Supabase sign in error:", error)

        // Handle demo user creation
        if (error.message.includes("Invalid login credentials") && isDemoAccount) {
          console.log("Demo user doesn't exist, attempting to create...")
          const createResult = await this.createDemoUser()

          if (createResult.success) {
            // Retry sign in
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email: normalizedEmail,
              password,
            })

            if (retryError) {
              console.error("Demo user retry sign in failed:", retryError)
              throw retryError
            }

            console.log("Demo user created and signed in successfully")

            // Ensure profile exists
            if (retryData.user) {
              await this.ensureUserProfile(retryData.user)
            }

            return { user: retryData.user, session: retryData.session, error: null }
          }
        }

        throw error
      }

      console.log("Sign in successful:", data.user?.email)

      // Ensure profile exists after successful sign in
      if (data.user) {
        await this.ensureUserProfile(data.user)
      }

      return { user: data.user, session: data.session, error: null }
    } catch (error: any) {
      console.error("Sign in error:", error)
      return { user: null, session: null, error: error?.message || "Sign in failed" }
    }
  }

  // Sign out user
  static async signOut() {
    try {
      if (!supabase) {
        return { error: "Authentication service not available" }
      }

      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error("Sign out error:", error)
      return { error: error?.message || "Sign out failed" }
    }
  }

  // Get current user with safe error handling
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      if (!supabase) {
        console.warn("Authentication service not available")
        return null
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        return null
      }

      if (!session || !session.user) {
        return null
      }

      const user = session.user

      // Try to get profile data
      const { data: profile, error: profileError } = await safeDbOperation(
        () => supabase.from("profiles").select("*").eq("id", user.id).single(),
        null,
      )

      if (profileError) {
        console.error("Get profile error:", profileError)
      }

      return {
        id: user.id,
        email: user.email!,
        full_name: profile?.full_name || user.user_metadata?.full_name,
        avatar_url: profile?.avatar_url,
      }
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  }

  // Ensure user profile exists with safe database operations
  static async ensureUserProfile(user: User) {
    try {
      if (!supabase) {
        return { error: "Database not available" }
      }

      // Check if profile exists
      const { data: existingProfile, error: checkError } = await safeDbOperation(
        () => supabase.from("profiles").select("id").eq("id", user.id).single(),
        null,
      )

      if (checkError) {
        console.error("Profile check error:", checkError)
      }

      if (existingProfile) {
        return { error: null }
      }

      // Create profile
      const { error } = await safeDbOperation(
        () =>
          supabase.from("profiles").upsert(
            {
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" },
          ),
        null,
      )

      if (error) {
        console.error("Profile creation error:", error)
        return { error }
      }

      return { error: null }
    } catch (error: any) {
      console.error("Ensure user profile error:", error)
      return { error: error?.message || "Profile creation failed" }
    }
  }

  // Create demo user with enhanced error handling
  static async createDemoUser() {
    try {
      if (!supabase) {
        return { success: false, error: "Authentication service not available" }
      }

      console.log("Creating demo user...")

      const { data, error } = await supabase.auth.signUp({
        email: "demo@wolf.com",
        password: "demo123",
        options: {
          data: {
            full_name: "Demo User",
          },
        },
      })

      if (error) {
        if (error.message.includes("already registered")) {
          console.log("Demo user already exists")
          return { success: true, error: null }
        }

        console.error("Demo user creation error:", error)
        return { success: false, error: error.message }
      }

      console.log("Demo user created successfully")
      return { success: true, user: data.user }
    } catch (error: any) {
      console.error("Create demo user error:", error)
      return { success: false, error: error?.message || "Demo user creation failed" }
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      if (!supabase) {
        return { error: "Authentication service not available" }
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error("Reset password error:", error)
      return { error: error?.message || "Password reset failed" }
    }
  }

  // Update password
  static async updatePassword(password: string) {
    try {
      if (!supabase) {
        return { error: "Authentication service not available" }
      }

      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error("Update password error:", error)
      return { error: error?.message || "Password update failed" }
    }
  }

  // Update profile
  static async updateProfile(userId: string, updates: Partial<{ full_name: string; avatar_url: string }>) {
    try {
      if (!supabase) {
        return { error: "Database not available" }
      }

      const { error } = await safeDbOperation(
        () =>
          supabase.from("profiles").upsert(
            {
              id: userId,
              ...updates,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" },
          ),
        null,
      )

      if (error) {
        console.error("Profile update error:", error)
        return { error }
      }

      return { error: null }
    } catch (error: any) {
      console.error("Update profile error:", error)
      return { error: error?.message || "Profile update failed" }
    }
  }
}
