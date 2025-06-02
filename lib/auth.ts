import { supabase } from "./supabase"
import type { User } from "@supabase/supabase-js"

export interface AuthUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export class AuthService {
  // Sign up new user
  static async signUp(email: string, password: string, fullName?: string) {
    try {
      console.log("Attempting to sign up user:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
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

      // Create profile manually if signup was successful
      if (data.user) {
        await this.createUserProfile(data.user, fullName)
      }

      return { user: data.user, error: null }
    } catch (error: any) {
      console.error("Sign up error:", error)
      return { user: null, error: error.message }
    }
  }

  // Sign in user
  static async signIn(email: string, password: string) {
    try {
      console.log("Attempting to sign in user:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Supabase sign in error:", error)
        throw error
      }

      console.log("Sign in successful:", data.user?.email)

      // Create session record
      if (data.session) {
        await this.createSessionRecord(data.user.id, data.session.access_token)
      }

      return { user: data.user, session: data.session, error: null }
    } catch (error: any) {
      console.error("Sign in error:", error)
      return { user: null, session: null, error: error.message }
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error("Sign out error:", error)
      return { error: error.message }
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      // First check if we have a session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        return null
      }

      if (!session || !session.user) {
        // No session exists, user is not logged in
        return null
      }

      const user = session.user

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Get profile error:", profileError)
        // If profile doesn't exist, create it
        if (profileError.code === "PGRST116") {
          await this.createUserProfile(user)
          return {
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name,
            avatar_url: null,
          }
        }
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

  // Create user profile
  static async createUserProfile(user: User, fullName?: string) {
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).single()

      if (existingProfile) {
        return { error: null }
      }

      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email!,
        full_name: fullName || user.user_metadata?.full_name || null,
      })

      if (error) throw error

      // Create default preferences
      await supabase.from("user_preferences").insert({
        user_id: user.id,
        theme: "dark",
        notifications_enabled: true,
        email_notifications: true,
      })

      return { error: null }
    } catch (error: any) {
      console.error("Create user profile error:", error)
      return { error: error.message }
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<{ full_name: string; avatar_url: string }>) {
    try {
      const { error } = await supabase.from("profiles").update(updates).eq("id", userId)

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error("Update profile error:", error)
      return { error: error.message }
    }
  }

  // Get user preferences
  static async getUserPreferences(userId: string) {
    try {
      const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single()

      if (error) {
        // If preferences don't exist, create them
        if (error.code === "PGRST116") {
          const newPrefs = {
            user_id: userId,
            theme: "dark",
            notifications_enabled: true,
            email_notifications: true,
            push_notifications: false,
            marketing_emails: false,
            security_alerts: true,
            language: "en",
            timezone: "UTC",
          }

          await supabase.from("user_preferences").insert(newPrefs)
          return { preferences: newPrefs, error: null }
        }
        throw error
      }

      return { preferences: data, error: null }
    } catch (error: any) {
      console.error("Get user preferences error:", error)
      return { preferences: null, error: error.message }
    }
  }

  // Update user preferences
  static async updatePreferences(
    userId: string,
    preferences: Partial<{
      theme: string
      notifications_enabled: boolean
      email_notifications: boolean
      push_notifications: boolean
      marketing_emails: boolean
      security_alerts: boolean
      language: string
      timezone: string
    }>,
  ) {
    try {
      // Check if preferences exist
      const { data } = await supabase.from("user_preferences").select("id").eq("user_id", userId)

      if (!data || data.length === 0) {
        // Create preferences if they don't exist
        await supabase.from("user_preferences").insert({
          user_id: userId,
          ...preferences,
        })
      } else {
        // Update existing preferences
        const { error } = await supabase.from("user_preferences").update(preferences).eq("user_id", userId)
        if (error) throw error
      }

      return { error: null }
    } catch (error: any) {
      console.error("Update preferences error:", error)
      return { error: error.message }
    }
  }

  // Create session record
  static async createSessionRecord(userId: string, sessionToken: string) {
    try {
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

      const { error } = await supabase.from("user_sessions").insert({
        user_id: userId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      })

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error("Create session record error:", error)
      return { error: error.message }
    }
  }

  // Clean up expired sessions
  static async cleanupExpiredSessions() {
    try {
      const { error } = await supabase.from("user_sessions").delete().lt("expires_at", new Date().toISOString())

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      console.error("Cleanup expired sessions error:", error)
      return { error: error.message }
    }
  }
}
