import { createServerSupabaseClient } from "./supabase"

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: "active" | "inactive" | "cancelled" | "past_due"
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
  user_email?: string
  plan_name?: string
  plan_price?: number
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: "month" | "year"
  features: string[]
  is_active: boolean
  created_at: string
}

export class SubscriptionService {
  // Get all subscriptions with user details
  static async getAllSubscriptions(page = 1, limit = 20) {
    try {
      const supabase = createServerSupabaseClient()

      const { data, error, count } = await supabase
        .from("user_subscriptions")
        .select(`
          *,
          profiles!user_subscriptions_user_id_fkey(email, full_name),
          subscription_plans!user_subscriptions_plan_id_fkey(name, price, currency)
        `)
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      const subscriptions =
        data?.map((sub) => ({
          ...sub,
          user_email: sub.profiles?.email,
          user_name: sub.profiles?.full_name,
          plan_name: sub.subscription_plans?.name,
          plan_price: sub.subscription_plans?.price,
          plan_currency: sub.subscription_plans?.currency,
        })) || []

      return {
        subscriptions,
        total: count || 0,
        error: null,
      }
    } catch (error: any) {
      return {
        subscriptions: [],
        total: 0,
        error: error.message,
      }
    }
  }

  // Get subscription analytics
  static async getSubscriptionAnalytics() {
    try {
      const supabase = createServerSupabaseClient()

      const { data: allSubs } = await supabase
        .from("user_subscriptions")
        .select("status, created_at, subscription_plans(price, currency)")

      const totalSubscriptions = allSubs?.length || 0
      const activeSubscriptions = allSubs?.filter((s) => s.status === "active").length || 0
      const cancelledSubscriptions = allSubs?.filter((s) => s.status === "cancelled").length || 0

      const monthlyRevenue =
        allSubs?.filter((s) => s.status === "active").reduce((sum, s) => sum + (s.subscription_plans?.price || 0), 0) ||
        0

      const newThisMonth =
        allSubs?.filter((s) => {
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return new Date(s.created_at) > monthAgo
        }).length || 0

      return {
        totalSubscriptions,
        activeSubscriptions,
        cancelledSubscriptions,
        monthlyRevenue,
        newThisMonth,
        error: null,
      }
    } catch (error: any) {
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        cancelledSubscriptions: 0,
        monthlyRevenue: 0,
        newThisMonth: 0,
        error: error.message,
      }
    }
  }

  // Get all subscription plans
  static async getSubscriptionPlans() {
    try {
      const supabase = createServerSupabaseClient()

      const { data, error } = await supabase.from("subscription_plans").select("*").order("price", { ascending: true })

      if (error) throw error

      return {
        plans: data || [],
        error: null,
      }
    } catch (error: any) {
      return {
        plans: [],
        error: error.message,
      }
    }
  }

  // Update subscription status
  static async updateSubscriptionStatus(subscriptionId: string, status: string, adminId: string) {
    try {
      const supabase = createServerSupabaseClient()

      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subscriptionId)

      if (error) throw error

      // Log admin activity
      await supabase.from("admin_activity_logs").insert({
        admin_id: adminId,
        action: "update_subscription_status",
        target_type: "subscription",
        target_id: subscriptionId,
        details: { new_status: status },
      })

      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  // Create subscription plan
  static async createSubscriptionPlan(plan: Omit<SubscriptionPlan, "id" | "created_at">, adminId: string) {
    try {
      const supabase = createServerSupabaseClient()

      const { data, error } = await supabase
        .from("subscription_plans")
        .insert({
          ...plan,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Log admin activity
      await supabase.from("admin_activity_logs").insert({
        admin_id: adminId,
        action: "create_subscription_plan",
        target_type: "plan",
        target_id: data.id,
        details: { plan_name: plan.name, price: plan.price },
      })

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }
}
