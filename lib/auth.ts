import { createClientSupabaseClient, createServerSupabaseClient, safeDbOperation } from "./supabase"

export interface AuthUser {
  id: string
  email: string
  username?: string
  full_name?: string
  avatar_url?: string
  role?: string
  status?: string
  last_sign_in_at?: string
  created_at?: string
}

export class AuthService {
  private static getClient() {
    if (typeof window !== "undefined") {
      return createClientSupabaseClient()
    } else {
      return createServerSupabaseClient()
    }
  }

  // REAL user registration with proper validation
  static async signUp(email: string, password: string, fullName?: string) {
    try {
      if (!email || !email.includes("@")) {
        return { user: null, error: "Valid email address is required" }
      }

      if (!password || password.length < 6) {
        return { user: null, error: "Password must be at least 6 characters long" }
      }

      const supabase = this.getClient()

      console.log(`🔄 Creating new user account: ${email}`)

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName?.trim() || "",
          },
        },
      })

      if (authError) {
        console.error("❌ Auth signup failed:", authError)
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: "Failed to create user account" }
      }

      console.log(`✅ User account created: ${authData.user.id}`)

      // Create user profile
      const { error: profileError } = await safeDbOperation(
        () =>
          supabase.from("profiles").insert([
            {
              id: authData.user!.id,
              email: authData.user!.email!,
              username: email.split("@")[0].toLowerCase(),
              full_name: fullName?.trim() || null,
              role: "user",
              status: "active",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]),
        null,
      )

      if (profileError.error) {
        console.error("⚠️ Profile creation failed:", profileError.error)
        // Don't fail signup if profile creation fails
      } else {
        console.log("✅ User profile created")
      }

      // Log the registration activity
      await this.logActivity(authData.user.id, "user_registered", {
        email: authData.user.email,
        registration_method: "email",
      })

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || "",
          username: email.split("@")[0].toLowerCase(),
          full_name: fullName,
          role: "user",
          status: "active",
        },
        error: null,
      }
    } catch (error: any) {
      console.error("❌ Signup error:", error)
      return { user: null, error: error.message || "Registration failed" }
    }
  }

  // REAL user authentication with activity logging
  static async signIn(email: string, password: string) {
    try {
      if (!email || !email.includes("@")) {
        return { user: null, error: "Valid email address is required" }
      }

      if (!password) {
        return { user: null, error: "Password is required" }
      }

      const supabase = this.getClient()

      console.log(`🔄 Authenticating user: ${email}`)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })

      if (error) {
        console.error("❌ Authentication failed:", error)

        // Log failed login attempt
        await this.logActivity(null, "login_failed", {
          email,
          error: error.message,
          timestamp: new Date().toISOString(),
        })

        return { user: null, error: error.message }
      }

      if (!data.user) {
        return { user: null, error: "Authentication failed" }
      }

      console.log(`✅ User authenticated: ${data.user.id}`)

      // Update last sign in time
      const { error: updateError } = await safeDbOperation(
        () =>
          supabase
            .from("profiles")
            .update({
              last_sign_in_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", data.user!.id),
        null,
      )

      if (updateError.error) {
        console.error("⚠️ Failed to update last sign in:", updateError.error)
      }

      // Get user profile
      const userProfile = await this.getUserProfile(data.user.id)

      // Log successful login
      await this.logActivity(data.user.id, "user_signed_in", {
        email: data.user.email,
        login_method: "email",
      })

      return {
        user: {
          id: data.user.id,
          email: data.user.email || "",
          username: userProfile?.username,
          full_name: userProfile?.full_name || data.user.user_metadata?.full_name,
          avatar_url: userProfile?.avatar_url,
          role: userProfile?.role || "user",
          status: userProfile?.status || "active",
          last_sign_in_at: userProfile?.last_sign_in_at,
          created_at: userProfile?.created_at,
        },
        error: null,
      }
    } catch (error: any) {
      console.error("❌ Signin error:", error)
      return { user: null, error: error.message || "Authentication failed" }
    }
  }

  // REAL user sign out with activity logging
  static async signOut() {
    try {
      const supabase = this.getClient()

      // Get current user before signing out
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("❌ Signout error:", error)
        return { error: error.message }
      }

      // Log signout activity
      if (user) {
        await this.logActivity(user.id, "user_signed_out", {
          email: user.email,
        })
      }

      console.log("✅ User signed out successfully")
      return { error: null }
    } catch (error: any) {
      console.error("❌ Signout error:", error)
      return { error: error.message || "Signout failed" }
    }
  }

  // Get REAL current user data
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const supabase = this.getClient()

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        return null
      }

      // Get user profile from database
      const userProfile = await this.getUserProfile(user.id)

      return {
        id: user.id,
        email: user.email || "",
        username: userProfile?.username,
        full_name: userProfile?.full_name || user.user_metadata?.full_name,
        avatar_url: userProfile?.avatar_url,
        role: userProfile?.role || "user",
        status: userProfile?.status || "active",
        last_sign_in_at: userProfile?.last_sign_in_at,
        created_at: userProfile?.created_at,
      }
    } catch (error: any) {
      console.error("❌ Get current user error:", error)
      return null
    }
  }

  // Get REAL user profile from database
  static async getUserProfile(userId: string) {
    try {
      const supabase = this.getClient()

      const { data, error } = await safeDbOperation(
        () => supabase.from("profiles").select("*").eq("id", userId).single(),
        null,
      )

      if (error.error) {
        console.error("❌ Get user profile error:", error.error)
        return null
      }

      return data.data
    } catch (error: any) {
      console.error("❌ Get user profile error:", error)
      return null
    }
  }

  // Update REAL user profile
  static async updateProfile(
    userId: string,
    updates: Partial<{ full_name: string; avatar_url: string; username: string }>,
  ) {
    try {
      const supabase = this.getClient()

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: updates.full_name,
          avatar_url: updates.avatar_url,
        },
      })

      if (authError) {
        console.error("❌ Auth update error:", authError)
        return { error: authError.message }
      }

      // Update profile in database
      const { error: profileError } = await safeDbOperation(
        () =>
          supabase
            .from("profiles")
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId),
        null,
      )

      if (profileError.error) {
        console.error("❌ Profile update error:", profileError.error)
        return { error: profileError.error }
      }

      // Log profile update activity
      await this.logActivity(userId, "profile_updated", {
        updated_fields: Object.keys(updates),
      })

      console.log("✅ Profile updated successfully")
      return { error: null }
    } catch (error: any) {
      console.error("❌ Update profile error:", error)
      return { error: error.message || "Update failed" }
    }
  }

  // Log REAL user activities
  private static async logActivity(userId: string | null, action: string, details: any = {}) {
    try {
      const supabase = this.getClient()

      const { error } = await safeDbOperation(
        () =>
          supabase.from("wolf_activities").insert([
            {
              user_id: userId,
              action,
              details,
              ip_address: typeof window !== "undefined" ? null : "127.0.0.1", // Would get real IP in production
              user_agent: typeof window !== "undefined" ? navigator.userAgent : null,
              success: true,
              created_at: new Date().toISOString(),
            },
          ]),
        null,
      )

      if (error.error) {
        console.error("⚠️ Failed to log activity:", error.error)
      }
    } catch (error) {
      console.error("⚠️ Activity logging error:", error)
    }
  }

  // REAL password reset
  static async resetPassword(email: string) {
    try {
      const supabase = this.getClient()

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        console.error("❌ Password reset error:", error)
        return { error: error.message }
      }

      console.log("✅ Password reset email sent")
      return { error: null }
    } catch (error: any) {
      console.error("❌ Password reset error:", error)
      return { error: error.message || "Password reset failed" }
    }
  }
}
