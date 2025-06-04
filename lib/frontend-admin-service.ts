import { createServerSupabaseClient } from "./supabase"

export interface FrontendAdmin {
  id: string
  user_id: string
  permissions: string[]
  role: "ui_admin" | "content_manager" | "support_admin"
  granted_by: string
  granted_at: string
  is_active: boolean
  user_email?: string
  user_name?: string
}

export class FrontendAdminService {
  // Get all frontend admins
  static async getFrontendAdmins() {
    try {
      const supabase = createServerSupabaseClient()

      const { data, error } = await supabase
        .from("frontend_admins")
        .select(`
          *,
          profiles!frontend_admins_user_id_fkey(email, full_name),
          granted_by_profile:profiles!frontend_admins_granted_by_fkey(email)
        `)
        .order("granted_at", { ascending: false })

      if (error) throw error

      const admins =
        data?.map((admin) => ({
          ...admin,
          user_email: admin.profiles?.email,
          user_name: admin.profiles?.full_name,
          granted_by_email: admin.granted_by_profile?.email,
        })) || []

      return {
        admins,
        error: null,
      }
    } catch (error: any) {
      return {
        admins: [],
        error: error.message,
      }
    }
  }

  // Grant frontend admin role
  static async grantFrontendAdmin(
    userId: string,
    role: "ui_admin" | "content_manager" | "support_admin",
    permissions: string[],
    grantedBy: string,
  ) {
    try {
      const supabase = createServerSupabaseClient()

      const { data, error } = await supabase
        .from("frontend_admins")
        .insert({
          user_id: userId,
          role,
          permissions,
          granted_by: grantedBy,
          granted_at: new Date().toISOString(),
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      // Log activity
      await supabase.from("admin_activity_logs").insert({
        admin_id: grantedBy,
        action: "grant_frontend_admin",
        target_type: "user",
        target_id: userId,
        details: { role, permissions },
      })

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  // Revoke frontend admin role
  static async revokeFrontendAdmin(adminId: string, revokedBy: string) {
    try {
      const supabase = createServerSupabaseClient()

      const { error } = await supabase.from("frontend_admins").update({ is_active: false }).eq("id", adminId)

      if (error) throw error

      // Log activity
      await supabase.from("admin_activity_logs").insert({
        admin_id: revokedBy,
        action: "revoke_frontend_admin",
        target_type: "frontend_admin",
        target_id: adminId,
        details: {},
      })

      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }
}
