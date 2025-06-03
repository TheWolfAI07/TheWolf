"use client"

import { useState, useEffect } from "react"
import { AdminService } from "@/lib/admin"
import { useAuthContext } from "@/components/auth/auth-provider"

export function useAdmin() {
  const { user } = useAuthContext()
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminRole, setAdminRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        setAdminRole(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [adminStatus, role] = await Promise.all([
          AdminService.isAdmin(user.id),
          AdminService.getAdminRole(user.id),
        ])

        setIsAdmin(adminStatus)
        setAdminRole(role)
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
        setAdminRole(null)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  return {
    isAdmin,
    adminRole,
    loading,
  }
}
