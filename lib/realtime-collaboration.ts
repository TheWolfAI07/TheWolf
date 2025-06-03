/**
 * Wolf Platform Real-time Collaboration System
 *
 * Advanced real-time collaboration features powered by Supabase Realtime
 */

import { createClient } from "@supabase/supabase-js"
import { logger } from "./logger"
import type { RealtimeChannel } from "@supabase/supabase-js"

// Types for real-time collaboration
export interface CollaborationUser {
  id: string
  name: string
  avatar?: string
  cursor?: { x: number; y: number }
  lastActive: Date
  status: "online" | "away" | "offline"
  currentView?: string
  actions?: CollaborationAction[]
}

export interface CollaborationAction {
  id: string
  userId: string
  type: "edit" | "comment" | "view" | "approve" | "reject"
  resourceId: string
  resourceType: "project" | "task" | "document" | "dashboard"
  timestamp: Date
  metadata?: any
}

export interface CollaborationRoom {
  id: string
  name: string
  type: "project" | "dashboard" | "document" | "meeting"
  users: CollaborationUser[]
  createdAt: Date
  metadata?: any
}

export class RealtimeCollaboration {
  private static instance: RealtimeCollaboration
  private supabase: ReturnType<typeof createClient>
  private channels: Map<string, RealtimeChannel> = new Map()
  private activeUsers: Map<string, CollaborationUser> = new Map()
  private rooms: Map<string, CollaborationRoom> = new Map()
  private presenceInterval: NodeJS.Timeout | null = null
  private userId: string | null = null
  private userName: string | null = null
  private userAvatar: string | null = null

  private constructor() {
    // Initialize Supabase client using environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables for real-time collaboration")
    }

    this.supabase = createClient(supabaseUrl, supabaseKey)
    logger.info("Real-time collaboration system initialized")
  }

  static getInstance(): RealtimeCollaboration {
    if (!RealtimeCollaboration.instance) {
      RealtimeCollaboration.instance = new RealtimeCollaboration()
    }
    return RealtimeCollaboration.instance
  }

  /**
   * Set current user information for collaboration
   */
  setUser(id: string, name: string, avatar?: string): void {
    this.userId = id
    this.userName = name
    this.userAvatar = avatar || null
    logger.debug("Collaboration user set", { id, name })
  }

  /**
   * Join a collaboration room
   */
  async joinRoom(roomId: string, roomType: CollaborationRoom["type"], roomName: string): Promise<CollaborationRoom> {
    if (!this.userId || !this.userName) {
      throw new Error("User must be set before joining a room")
    }

    try {
      logger.info("Joining collaboration room", { roomId, roomType })

      // Create or get room
      let room = this.rooms.get(roomId)

      if (!room) {
        room = {
          id: roomId,
          name: roomName,
          type: roomType,
          users: [],
          createdAt: new Date(),
          metadata: {},
        }
        this.rooms.set(roomId, room)
      }

      // Create channel if it doesn't exist
      if (!this.channels.has(roomId)) {
        const channel = this.supabase.channel(`room:${roomId}`)

        // Set up presence tracking
        channel.on("presence", { event: "sync" }, () => {
          const state = channel.presenceState()
          this.syncRoomUsers(roomId, state)
        })

        // Handle user joins
        channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
          logger.debug("User joined room", { roomId, key, newPresences })
          this.updateRoomUsers(roomId, newPresences, "online")
        })

        // Handle user leaves
        channel.on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          logger.debug("User left room", { roomId, key, leftPresences })
          this.updateRoomUsers(roomId, leftPresences, "offline")
        })

        // Subscribe to broadcast messages
        channel.on("broadcast", { event: "cursor-position" }, (payload) => {
          this.handleCursorUpdate(roomId, payload)
        })

        channel.on("broadcast", { event: "user-action" }, (payload) => {
          this.handleUserAction(roomId, payload)
        })

        // Subscribe to the channel
        channel.subscribe((status) => {
          logger.info("Room subscription status", { roomId, status })

          if (status === "SUBSCRIBED") {
            // Track presence once subscribed
            channel.track({
              user_id: this.userId,
              name: this.userName,
              avatar: this.userAvatar,
              online_at: new Date().toISOString(),
              status: "online",
            })
          }
        })

        this.channels.set(roomId, channel)
      }

      // Add user to room
      const user: CollaborationUser = {
        id: this.userId,
        name: this.userName,
        avatar: this.userAvatar || undefined,
        lastActive: new Date(),
        status: "online",
      }

      this.activeUsers.set(this.userId, user)

      // Update room users
      if (!room.users.find((u) => u.id === this.userId)) {
        room.users.push(user)
      }

      // Start presence heartbeat if not already running
      if (!this.presenceInterval) {
        this.startPresenceHeartbeat()
      }

      return room
    } catch (error: any) {
      logger.error("Failed to join collaboration room", {
        roomId,
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Leave a collaboration room
   */
  leaveRoom(roomId: string): void {
    try {
      logger.info("Leaving collaboration room", { roomId })

      const channel = this.channels.get(roomId)
      if (channel) {
        channel.unsubscribe()
        this.channels.delete(roomId)
      }

      // Update room users
      const room = this.rooms.get(roomId)
      if (room && this.userId) {
        room.users = room.users.filter((u) => u.id !== this.userId)

        // If room is empty, remove it
        if (room.users.length === 0) {
          this.rooms.delete(roomId)
        }
      }
    } catch (error: any) {
      logger.error("Failed to leave collaboration room", {
        roomId,
        error: error.message,
      })
    }
  }

  /**
   * Update cursor position in a room
   */
  updateCursorPosition(roomId: string, x: number, y: number): void {
    if (!this.userId) return

    try {
      const channel = this.channels.get(roomId)
      if (channel) {
        channel.send({
          type: "broadcast",
          event: "cursor-position",
          payload: {
            user_id: this.userId,
            x,
            y,
            timestamp: new Date().toISOString(),
          },
        })

        // Update local user data
        const user = this.activeUsers.get(this.userId)
        if (user) {
          user.cursor = { x, y }
          user.lastActive = new Date()
        }
      }
    } catch (error: any) {
      logger.error("Failed to update cursor position", {
        roomId,
        error: error.message,
      })
    }
  }

  /**
   * Broadcast a user action to the room
   */
  broadcastAction(roomId: string, action: Omit<CollaborationAction, "id" | "userId" | "timestamp">): void {
    if (!this.userId) return

    try {
      const channel = this.channels.get(roomId)
      if (channel) {
        const fullAction: CollaborationAction = {
          id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: this.userId,
          ...action,
          timestamp: new Date(),
        }

        channel.send({
          type: "broadcast",
          event: "user-action",
          payload: fullAction,
        })

        // Update local user data
        const user = this.activeUsers.get(this.userId)
        if (user) {
          user.actions = user.actions || []
          user.actions.push(fullAction)
          user.lastActive = new Date()
        }
      }
    } catch (error: any) {
      logger.error("Failed to broadcast action", {
        roomId,
        action,
        error: error.message,
      })
    }
  }

  /**
   * Get all users in a room
   */
  getRoomUsers(roomId: string): CollaborationUser[] {
    const room = this.rooms.get(roomId)
    return room ? room.users : []
  }

  /**
   * Get all rooms
   */
  getAllRooms(): CollaborationRoom[] {
    return Array.from(this.rooms.values())
  }

  /**
   * Clean up all connections
   */
  cleanup(): void {
    logger.info("Cleaning up real-time collaboration connections")

    // Unsubscribe from all channels
    this.channels.forEach((channel, roomId) => {
      channel.unsubscribe()
    })

    this.channels.clear()
    this.rooms.clear()
    this.activeUsers.clear()

    if (this.presenceInterval) {
      clearInterval(this.presenceInterval)
      this.presenceInterval = null
    }
  }

  /**
   * Private: Start presence heartbeat
   */
  private startPresenceHeartbeat(): void {
    this.presenceInterval = setInterval(() => {
      this.channels.forEach((channel, roomId) => {
        if (this.userId) {
          channel.track({
            user_id: this.userId,
            name: this.userName,
            avatar: this.userAvatar,
            online_at: new Date().toISOString(),
            status: "online",
          })
        }
      })
    }, 30000) // Update presence every 30 seconds
  }

  /**
   * Private: Sync room users from presence state
   */
  private syncRoomUsers(roomId: string, state: any): void {
    const room = this.rooms.get(roomId)
    if (!room) return

    // Convert presence state to users array
    const users: CollaborationUser[] = []

    Object.entries(state).forEach(([key, presences]: [string, any]) => {
      if (Array.isArray(presences) && presences.length > 0) {
        const presence = presences[0]

        users.push({
          id: presence.user_id,
          name: presence.name,
          avatar: presence.avatar,
          lastActive: new Date(presence.online_at),
          status: presence.status || "online",
        })
      }
    })

    room.users = users
  }

  /**
   * Private: Update room users based on presence changes
   */
  private updateRoomUsers(roomId: string, presences: any[], status: CollaborationUser["status"]): void {
    const room = this.rooms.get(roomId)
    if (!room) return

    presences.forEach((presence) => {
      const userId = presence.user_id
      const existingUserIndex = room.users.findIndex((u) => u.id === userId)

      if (existingUserIndex >= 0) {
        // Update existing user
        room.users[existingUserIndex] = {
          ...room.users[existingUserIndex],
          status,
          lastActive: new Date(presence.online_at || Date.now()),
        }
      } else if (status === "online") {
        // Add new user
        room.users.push({
          id: userId,
          name: presence.name || "Unknown User",
          avatar: presence.avatar,
          lastActive: new Date(presence.online_at || Date.now()),
          status,
        })
      }
    })

    // Remove offline users after a while
    if (status === "offline") {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      room.users = room.users.filter((user) => user.status !== "offline" || user.lastActive > fiveMinutesAgo)
    }
  }

  /**
   * Private: Handle cursor position updates
   */
  private handleCursorUpdate(roomId: string, payload: any): void {
    const room = this.rooms.get(roomId)
    if (!room) return

    const { user_id, x, y } = payload
    const userIndex = room.users.findIndex((u) => u.id === user_id)

    if (userIndex >= 0) {
      room.users[userIndex].cursor = { x, y }
      room.users[userIndex].lastActive = new Date()
    }
  }

  /**
   * Private: Handle user actions
   */
  private handleUserAction(roomId: string, action: CollaborationAction): void {
    const room = this.rooms.get(roomId)
    if (!room) return

    const userIndex = room.users.findIndex((u) => u.id === action.userId)

    if (userIndex >= 0) {
      const user = room.users[userIndex]
      user.actions = user.actions || []
      user.actions.push(action)
      user.lastActive = new Date()
    }
  }
}

// Export singleton instance
export const realtimeCollaboration = RealtimeCollaboration.getInstance()
