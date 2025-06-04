"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, UserPlus, X, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface TeamMembersProps {
  members: any[]
  projectId: number
  isOwner: boolean
  currentUserId: string
}

export function TeamMembers({ members, projectId, isOwner, currentUserId }: TeamMembersProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("member")
  const [removingId, setRemovingId] = useState<number | null>(null)

  const supabase = createClientComponentClient()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Find user by email
      const { data: users, error: userError } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", email)
        .single()

      if (userError) {
        throw new Error("User not found with this email address.")
      }

      // Check if already a member
      const { data: existingMember, error: memberError } = await supabase
        .from("wolf_team_members")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", users.id)
        .single()

      if (existingMember) {
        throw new Error("This user is already a member of the project.")
      }

      // Add team member
      const { error } = await supabase.from("wolf_team_members").insert({
        project_id: projectId,
        user_id: users.id,
        role,
        joined_at: new Date().toISOString(),
      })

      if (error) throw error

      // Log activity
      await supabase.from("wolf_activities").insert({
        user_id: currentUserId,
        action: "added team member",
        entity_id: projectId.toString(),
        entity_type: "project",
        created_at: new Date().toISOString(),
        details: { member_email: email, role },
      })

      toast({
        title: "Team member added",
        description: "The user has been added to the project.",
      })

      // Close dialog and reset form
      setOpen(false)
      setEmail("")
      setRole("member")

      // Reload the page to show updated team members
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: number, userId: string) => {
    setRemovingId(memberId)

    try {
      // Remove team member
      const { error } = await supabase.from("wolf_team_members").delete().eq("id", memberId)

      if (error) throw error

      // Log activity
      await supabase.from("wolf_activities").insert({
        user_id: currentUserId,
        action: "removed team member",
        entity_id: projectId.toString(),
        entity_type: "project",
        created_at: new Date().toISOString(),
        details: { removed_user_id: userId },
      })

      toast({
        title: "Team member removed",
        description: "The user has been removed from the project.",
      })

      // Reload the page to update the UI
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      setRemovingId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>People with access to this project</CardDescription>
        </div>
        {isOwner && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>Invite someone to collaborate on this project.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Team Member
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No team members yet.</p>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={member.profiles?.avatar_url || "/placeholder.svg"}
                      alt={member.profiles?.full_name}
                    />
                    <AvatarFallback>
                      {member.profiles?.full_name?.charAt(0) || member.profiles?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.profiles?.full_name || member.profiles?.email}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="capitalize">{member.role}</span>
                      <span>•</span>
                      <span>Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}</span>
                    </p>
                  </div>
                </div>
                {isOwner && member.user_id !== currentUserId && (
                  <div>
                    {removingId === member.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleRemoveMember(member.id, member.user_id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove from project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
