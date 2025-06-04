import { supabase } from "./supabase"

export interface AdminUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  role?: string
  last_sign_in?: string
}

export interface AdminRole {
  id: string
  user_id: string
  role: "super_admin" | "admin" | "moderator"
  permissions: Record<string, any>
  granted_by: string
  granted_at: string
}

export interface AdminActivityLog {
  id: string
  admin_id: string
  action: string
  target_type?: string
  target_id?: string
  details: Record<string, any>
  created_at: string
  admin_email?: string
}

export interface UserReport {
  id: string
  reported_user_id: string
  reporter_id?: string
  reason: string
  description?: string
  status: "pending" | "investigating" | "resolved" | "dismissed"
  assigned_to?: string
  resolved_at?: string
  created_at: string
  reported_user_email?: string
  reporter_email?: string
}

export interface SystemSetting {
  id: string
  key: string
  value: any
  description?: string
  updated_by?: string
  updated_at: string
}

export class AdminService {
  // Check if user is admin
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      console.log("Checking admin status for user:", userId)

      const { data, error } = await supabase.from("admin_roles").select("role").eq("user_id", userId).single()

      if (error) {
        console.log("No admin role found:", error.message)
        return false
      }

      const isAdminUser = ["super_admin", "admin", "moderator"].includes(data.role)
      console.log("Admin check result:", isAdminUser, "Role:", data.role)
      return isAdminUser
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }

  // Get admin role
  static async getAdminRole(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.from("admin_roles").select("role").eq("user_id", userId).single()

      if (error) return null
      return data.role
    } catch {
      return null
    }
  }

  // Get all users with pagination
  static async getUsers(page = 1, limit = 10, search?: string) {
    try {
      console.log("Fetching users with search:", search)

      let query = supabase
        .from("profiles")
        .select(
          `
          id,
          email,
          full_name,
          avatar_url,
          created_at,
          admin_roles(role)
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false })

      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
      }

      const { data, error, count } = await query.range((page - 1) * limit, page * limit - 1)

      if (error) {
        console.error("Error fetching users:", error)
        throw error
      }

      const users =
        data?.map((user) => ({
          ...user,
          role: user.admin_roles?.[0]?.role,
        })) || []

      console.log("Fetched users:", users.length)

      return {
        users,
        total: count || 0,
        error: null,
      }
    } catch (error: any) {
      console.error("Users fetch error:", error)
      return {
        users: [],
        total: 0,
        error: error.message,
      }
    }
  }

  // Get user analytics
  static async getUserAnalytics() {
    try {
      const today = new Date().toISOString().split("T")[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const [totalResult, todayResult, weekResult, monthResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", monthAgo),
      ])

      return {
        totalUsers: totalResult.count || 0,
        newUsersToday: todayResult.count || 0,
        newUsersWeek: weekResult.count || 0,
        newUsersMonth: monthResult.count || 0,
        error: null,
      }
    } catch (error: any) {
      console.error("Analytics error:", error)
      return {
        totalUsers: 0,
        newUsersToday: 0,
        newUsersWeek: 0,
        newUsersMonth: 0,
        error: error.message,
      }
    }
  }

  // Grant admin role
  static async grantAdminRole(userId: string, role: "super_admin" | "admin" | "moderator", grantedBy: string) {
    try {
      console.log("Granting role:", role, "to user:", userId, "by:", grantedBy)

      const { error } = await supabase.from("admin_roles").upsert({
        user_id: userId,
        role,
        granted_by: grantedBy,
        permissions: role === "super_admin" ? { all: true } : {},
        granted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error granting role:", error)
        throw error
      }

      // Log the action
      await this.logActivity(grantedBy, "grant_admin_role", "user", userId, { role })

      console.log("Role granted successfully")
      return { error: null }
    } catch (error: any) {
      console.error("Grant role error:", error)
      return { error: error.message }
    }
  }

  // Revoke admin role
  static async revokeAdminRole(userId: string, revokedBy: string) {
    try {
      console.log("Revoking admin role for user:", userId)

      const { error } = await supabase.from("admin_roles").delete().eq("user_id", userId)

      if (error) {
        console.error("Error revoking role:", error)
        throw error
      }

      // Log the action
      await this.logActivity(revokedBy, "revoke_admin_role", "user", userId)

      console.log("Role revoked successfully")
      return { error: null }
    } catch (error: any) {
      console.error("Revoke role error:", error)
      return { error: error.message }
    }
  }

  // Delete user
  static async deleteUser(userId: string, deletedBy: string) {
    try {
      console.log("Deleting user:", userId)

      // Log the action first
      await this.logActivity(deletedBy, "delete_user", "user", userId)

      // Delete from auth.users (this will cascade to profiles)
      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (error) {
        console.error("Error deleting user:", error)
        throw error
      }

      console.log("User deleted successfully")
      return { error: null }
    } catch (error: any) {
      console.error("Delete user error:", error)
      return { error: error.message }
    }
  }

  // Get admin activity logs
  static async getActivityLogs(page = 1, limit = 20) {
    try {
      const { data, error, count } = await supabase
        .from("admin_activity_logs")
        .select(
          `
          *,
          profiles!admin_activity_logs_admin_id_fkey(email)
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) {
        console.error("Error fetching activity logs:", error)
        throw error
      }

      const logs =
        data?.map((log) => ({
          ...log,
          admin_email: log.profiles?.email,
        })) || []

      return {
        logs,
        total: count || 0,
        error: null,
      }
    } catch (error: any) {
      console.error("Activity logs error:", error)
      return {
        logs: [],
        total: 0,
        error: error.message,
      }
    }
  }

  // Log admin activity
  static async logActivity(
    adminId: string,
    action: string,
    targetType?: string,
    targetId?: string,
    details: Record<string, any> = {},
  ) {
    try {
      const { error } = await supabase.from("admin_activity_logs").insert({
        admin_id: adminId,
        action,
        target_type: targetType,
        target_id: targetId,
        details,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error logging activity:", error)
        throw error
      }

      return { error: null }
    } catch (error: any) {
      console.error("Log activity error:", error)
      return { error: error.message }
    }
  }

  // Get system settings
  static async getSystemSettings() {
    try {
      const { data, error } = await supabase.from("system_settings").select("*").order("key")

      if (error) {
        console.error("Error fetching system settings:", error)
        throw error
      }

      return {
        settings: data || [],
        error: null,
      }
    } catch (error: any) {
      console.error("System settings error:", error)
      return {
        settings: [],
        error: error.message,
      }
    }
  }

  // Update system setting
  static async updateSystemSetting(key: string, value: any, updatedBy: string) {
    try {
      const { error } = await supabase
        .from("system_settings")
        .update({
          value,
          updated_by: updatedBy,
          updated_at: new Date().toISOString(),
        })
        .eq("key", key)

      if (error) {
        console.error("Error updating system setting:", error)
        throw error
      }

      // Log the action
      await this.logActivity(updatedBy, "update_system_setting", "setting", key, { value })

      return { error: null }
    } catch (error: any) {
      console.error("Update setting error:", error)
      return { error: error.message }
    }
  }

  // Get user reports
  static async getUserReports(page = 1, limit = 10) {
    try {
      const { data, error, count } = await supabase
        .from("user_reports")
        .select(
          `
          *,
          reported_user:profiles!user_reports_reported_user_id_fkey(email),
          reporter:profiles!user_reports_reporter_id_fkey(email)
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) {
        console.error("Error fetching user reports:", error)
        throw error
      }

      const reports =
        data?.map((report) => ({
          ...report,
          reported_user_email: report.reported_user?.email,
          reporter_email: report.reporter?.email,
        })) || []

      return {
        reports,
        total: count || 0,
        error: null,
      }
    } catch (error: any) {
      console.error("User reports error:", error)
      return {
        reports: [],
        total: 0,
        error: error.message,
      }
    }
  }

  // Update report status
  static async updateReportStatus(
    reportId: string,
    status: "pending" | "investigating" | "resolved" | "dismissed",
    assignedTo: string,
  ) {
    try {
      const updateData: any = {
        status,
        assigned_to: assignedTo,
        updated_at: new Date().toISOString(),
      }

      if (status === "resolved") {
        updateData.resolved_at = new Date().toISOString()
      }

      const { error } = await supabase.from("user_reports").update(updateData).eq("id", reportId)

      if (error) {
        console.error("Error updating report status:", error)
        throw error
      }

      // Log the action
      await this.logActivity(assignedTo, "update_report_status", "report", reportId, { status })

      return { error: null }
    } catch (error: any) {
      console.error("Update report status error:", error)
      return { error: error.message }
    }
  }

  // Make user super admin (emergency function)
  static async makeSuperAdmin(userId: string) {
    try {
      console.log("Making user super admin:", userId)

      const { error } = await supabase.from("admin_roles").upsert({
        user_id: userId,
        role: "super_admin",
        granted_by: userId,
        permissions: { all: true },
        granted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error making super admin:", error)
        throw error
      }

      console.log("Super admin role granted successfully")
      return { error: null }
    } catch (error: any) {
      console.error("Make super admin error:", error)
      return { error: error.message }
    }
  }
}
