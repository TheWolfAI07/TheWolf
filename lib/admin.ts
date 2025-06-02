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
      const { data, error } = await supabase.from("admin_roles").select("role").eq("user_id", userId).single()

      if (error) return false
      return ["super_admin", "admin", "moderator"].includes(data.role)
    } catch {
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
      let query = supabase
        .from("profiles")
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          created_at,
          admin_roles(role)
        `)
        .order("created_at", { ascending: false })

      if (search) {
        query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
      }

      const { data, error, count } = await query.range((page - 1) * limit, page * limit - 1).returns<AdminUser[]>()

      if (error) throw error

      return {
        users: data || [],
        total: count || 0,
        error: null,
      }
    } catch (error: any) {
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
      const { data: totalUsers } = await supabase.from("profiles").select("id", { count: "exact" })

      const { data: newUsersToday } = await supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .gte("created_at", new Date().toISOString().split("T")[0])

      const { data: newUsersWeek } = await supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      const { data: newUsersMonth } = await supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      return {
        totalUsers: totalUsers?.length || 0,
        newUsersToday: newUsersToday?.length || 0,
        newUsersWeek: newUsersWeek?.length || 0,
        newUsersMonth: newUsersMonth?.length || 0,
        error: null,
      }
    } catch (error: any) {
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
      const { error } = await supabase.from("admin_roles").upsert({
        user_id: userId,
        role,
        granted_by: grantedBy,
        permissions: {},
      })

      if (error) throw error

      // Log the action
      await this.logActivity(grantedBy, "grant_admin_role", "user", userId, { role })

      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Revoke admin role
  static async revokeAdminRole(userId: string, revokedBy: string) {
    try {
      const { error } = await supabase.from("admin_roles").delete().eq("user_id", userId)

      if (error) throw error

      // Log the action
      await this.logActivity(revokedBy, "revoke_admin_role", "user", userId)

      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Delete user
  static async deleteUser(userId: string, deletedBy: string) {
    try {
      // Log the action first
      await this.logActivity(deletedBy, "delete_user", "user", userId)

      // Delete from auth.users (this will cascade to profiles)
      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Get admin activity logs
  static async getActivityLogs(page = 1, limit = 20) {
    try {
      const { data, error, count } = await supabase
        .from("admin_activity_logs")
        .select(`
          *,
          profiles!admin_activity_logs_admin_id_fkey(email)
        `)
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

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
      })

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Get system settings
  static async getSystemSettings() {
    try {
      const { data, error } = await supabase.from("system_settings").select("*").order("key")

      if (error) throw error

      return {
        settings: data || [],
        error: null,
      }
    } catch (error: any) {
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

      if (error) throw error

      // Log the action
      await this.logActivity(updatedBy, "update_system_setting", "setting", key, { value })

      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Get user reports
  static async getUserReports(page = 1, limit = 10) {
    try {
      const { data, error, count } = await supabase
        .from("user_reports")
        .select(`
          *,
          reported_user:profiles!user_reports_reported_user_id_fkey(email),
          reporter:profiles!user_reports_reporter_id_fkey(email)
        `)
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

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
      const updateData: any = { status, assigned_to: assignedTo }

      if (status === "resolved") {
        updateData.resolved_at = new Date().toISOString()
      }

      const { error } = await supabase.from("user_reports").update(updateData).eq("id", reportId)

      if (error) throw error

      // Log the action
      await this.logActivity(assignedTo, "update_report_status", "report", reportId, { status })

      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }
}
