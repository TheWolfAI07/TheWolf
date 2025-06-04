"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { AdminService, type AdminUser, type AdminActivityLog, type SystemSetting } from "@/lib/admin"
import { useAdmin } from "@/hooks/useAdmin"
import { useAuthContext } from "@/components/auth/auth-provider"
import { Users, Shield, TrendingUp, UserPlus, Eye, Trash2, Crown, ShieldCheck, UserCheck, Loader2 } from "lucide-react"
import { Navbar } from "@/components/navbar"

// Helper function to format relative time
function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

export default function AdminPanel() {
  const { user } = useAuthContext()
  const { isAdmin, adminRole, loading: adminLoading } = useAdmin()
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([])
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([])
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    newUsersWeek: 0,
    newUsersMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [newRole, setNewRole] = useState<"admin" | "moderator" | "super_admin">("moderator")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      })
      return
    }

    if (isAdmin) {
      loadData()
    }
  }, [isAdmin, adminLoading, toast])

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersResult, logsResult, settingsResult, analyticsResult] = await Promise.all([
        AdminService.getUsers(1, 50, searchTerm),
        AdminService.getActivityLogs(1, 20),
        AdminService.getSystemSettings(),
        AdminService.getUserAnalytics(),
      ])

      if (usersResult.error) {
        console.error("Users error:", usersResult.error)
        toast({
          title: "Error",
          description: usersResult.error,
          variant: "destructive",
        })
      } else {
        setUsers(usersResult.users || [])
      }

      if (logsResult.error) {
        console.error("Logs error:", logsResult.error)
      } else {
        setActivityLogs(logsResult.logs || [])
      }

      if (settingsResult.error) {
        console.error("Settings error:", settingsResult.error)
      } else {
        setSystemSettings(settingsResult.settings || [])
      }

      if (analyticsResult.error) {
        console.error("Analytics error:", analyticsResult.error)
      } else {
        setAnalytics(analyticsResult)
      }
    } catch (error) {
      console.error("Error loading admin data:", error)
      toast({
        title: "Error",
        description: "Failed to load admin data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGrantRole = async (userId: string, role: "admin" | "moderator" | "super_admin") => {
    if (!user) return

    try {
      const result = await AdminService.grantAdminRole(userId, role, user.id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `${role} role granted successfully`,
        })
        loadData()
        setDialogOpen(false)
      }
    } catch (error) {
      console.error("Error granting role:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRevokeRole = async (userId: string) => {
    if (!user) return

    try {
      const result = await AdminService.revokeAdminRole(userId, user.id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Admin role revoked successfully",
        })
        loadData()
        setDialogOpen(false)
      }
    } catch (error) {
      console.error("Error revoking role:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!user) return

    try {
      const result = await AdminService.deleteUser(userId, user.id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
        loadData()
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSetting = async (key: string, value: any) => {
    if (!user) return

    try {
      const result = await AdminService.updateSystemSetting(key, value, user.id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Setting updated successfully",
        })
        loadData()
      }
    } catch (error) {
      console.error("Error updating setting:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getRoleBadge = (role?: string) => {
    if (!role) return null

    const roleConfig = {
      super_admin: { label: "Super Admin", color: "bg-red-500", icon: Crown },
      admin: { label: "Admin", color: "bg-blue-500", icon: ShieldCheck },
      moderator: { label: "Moderator", color: "bg-green-500", icon: UserCheck },
    }

    const config = roleConfig[role as keyof typeof roleConfig]
    if (!config) return null

    const Icon = config.icon

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  if (adminLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-turquoise mx-auto" />
          <p className="mt-4 text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-500">Access Denied</CardTitle>
            <CardDescription>You don't have permission to access the admin panel.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      <Navbar />
      <div className="container mx-auto p-6 pt-20 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-turquoise">Admin Panel</h1>
            <p className="text-gray-400">Manage users, settings, and monitor system activity</p>
          </div>
          <Badge className="bg-turquoise text-black">
            <Shield className="w-4 h-4 mr-2" />
            {adminRole?.replace("_", " ").toUpperCase()}
          </Badge>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Total Users</CardTitle>
              <Users className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-turquoise">{analytics.totalUsers}</div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">New Today</CardTitle>
              <UserPlus className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{analytics.newUsersToday}</div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{analytics.newUsersWeek}</div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">{analytics.newUsersMonth}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-black/40 border-slate-700">
            <TabsTrigger value="users" className="data-[state=active]:bg-turquoise data-[state=active]:text-black">
              Users
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-turquoise data-[state=active]:text-black">
              Activity Logs
            </TabsTrigger>
            {adminRole === "super_admin" && (
              <TabsTrigger value="settings" className="data-[state=active]:bg-turquoise data-[state=active]:text-black">
                System Settings
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-slate-400">Manage user accounts and permissions</CardDescription>
                <div className="flex gap-4">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm bg-slate-800 border-slate-700 text-white"
                  />
                  <Button onClick={loadData} className="bg-turquoise text-black hover:bg-pink">
                    Search
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-700">
                  <Table>
                    <TableHeader className="bg-slate-800">
                      <TableRow className="hover:bg-slate-800/50">
                        <TableHead className="text-slate-300">User</TableHead>
                        <TableHead className="text-slate-300">Email</TableHead>
                        <TableHead className="text-slate-300">Role</TableHead>
                        <TableHead className="text-slate-300">Joined</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id} className="hover:bg-slate-800/50 border-slate-700">
                            <TableCell className="text-slate-300">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-turquoise rounded-full flex items-center justify-center">
                                  <span className="text-black font-semibold text-sm">
                                    {user.full_name?.[0] || user.email[0].toUpperCase()}
                                  </span>
                                </div>
                                <span>{user.full_name || "No name"}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">{user.email}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell className="text-slate-300">
                              {formatDistanceToNow(new Date(user.created_at))}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog
                                  open={dialogOpen && selectedUser?.id === user.id}
                                  onOpenChange={(open) => {
                                    setDialogOpen(open)
                                    if (open) setSelectedUser(user)
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-slate-900 border-slate-700">
                                    <DialogHeader>
                                      <DialogTitle className="text-white">Manage User: {user.email}</DialogTitle>
                                      <DialogDescription className="text-slate-400">
                                        Grant or revoke admin permissions for this user.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="role" className="text-white">
                                          Admin Role
                                        </Label>
                                        <Select value={newRole} onValueChange={(value: any) => setNewRole(value)}>
                                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="moderator">Moderator</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            {adminRole === "super_admin" && (
                                              <SelectItem value="super_admin">Super Admin</SelectItem>
                                            )}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => user && handleGrantRole(user.id, newRole)}
                                          className="bg-turquoise text-black hover:bg-pink"
                                        >
                                          Grant Role
                                        </Button>
                                        {user.role && (
                                          <Button
                                            variant="outline"
                                            className="border-slate-600 text-slate-300"
                                            onClick={() => user && handleRevokeRole(user.id)}
                                          >
                                            Revoke Role
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                {adminRole === "super_admin" && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-900 border-slate-700">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-400">
                                          Are you sure you want to delete this user? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-slate-800 text-white border-slate-700">
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteUser(user.id)}
                                          className="bg-red-500 hover:bg-red-600"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-slate-400">
                            {searchTerm ? "No users found matching your search." : "No users found."}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Activity Logs</CardTitle>
                <CardDescription className="text-slate-400">Monitor admin actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-700">
                  <Table>
                    <TableHeader className="bg-slate-800">
                      <TableRow className="hover:bg-slate-800/50">
                        <TableHead className="text-slate-300">Admin</TableHead>
                        <TableHead className="text-slate-300">Action</TableHead>
                        <TableHead className="text-slate-300">Target</TableHead>
                        <TableHead className="text-slate-300">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLogs.length > 0 ? (
                        activityLogs.map((log) => (
                          <TableRow key={log.id} className="hover:bg-slate-800/50 border-slate-700">
                            <TableCell className="text-slate-300">{log.admin_email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-slate-600 text-turquoise">
                                {log.action.replace(/_/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {log.target_type && log.target_id && (
                                <span className="text-sm text-slate-400">
                                  {log.target_type}: {log.target_id.slice(0, 8)}...
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {formatDistanceToNow(new Date(log.created_at))}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-slate-400">
                            No activity logs found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {adminRole === "super_admin" && (
            <TabsContent value="settings" className="space-y-4">
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">System Settings</CardTitle>
                  <CardDescription className="text-slate-400">Configure platform-wide settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {systemSettings.length > 0 ? (
                      systemSettings.map((setting) => (
                        <div
                          key={setting.id}
                          className="flex items-center justify-between p-4 border border-slate-700 rounded-lg bg-slate-800/50"
                        >
                          <div>
                            <h4 className="font-medium text-white">{setting.key.replace(/_/g, " ").toUpperCase()}</h4>
                            <p className="text-sm text-slate-400">{setting.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-turquoise">{JSON.stringify(setting.value)}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-600 text-slate-300"
                              onClick={() => {
                                const newValue = prompt(
                                  `Enter new value for ${setting.key}:`,
                                  JSON.stringify(setting.value),
                                )
                                if (newValue !== null) {
                                  try {
                                    const parsedValue = JSON.parse(newValue)
                                    handleUpdateSetting(setting.key, parsedValue)
                                  } catch {
                                    handleUpdateSetting(setting.key, newValue)
                                  }
                                }
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-slate-400">No system settings found.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
