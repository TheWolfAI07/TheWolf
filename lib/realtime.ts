import { supabase } from "./supabase"

export class RealtimeManager {
  private static instance: RealtimeManager
  private connections: Map<string, any> = new Map()
  private eventSource: EventSource | null = null

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager()
    }
    return RealtimeManager.instance
  }

  // Subscribe to real-time updates
  subscribe(channel: string, callback: (data: any) => void) {
    try {
      const subscription = supabase
        .channel(channel)
        .on("postgres_changes", { event: "*", schema: "public" }, callback)
        .subscribe()

      this.connections.set(channel, subscription)
      console.log(`Subscribed to channel: ${channel}`)

      return subscription
    } catch (error) {
      console.error(`Failed to subscribe to channel ${channel}:`, error)
      return null
    }
  }

  // Unsubscribe from channel
  unsubscribe(channel: string) {
    const subscription = this.connections.get(channel)
    if (subscription) {
      supabase.removeChannel(subscription)
      this.connections.delete(channel)
      console.log(`Unsubscribed from channel: ${channel}`)
    }
  }

  // Connect to Server-Sent Events for real-time updates
  connectSSE(type = "general", callback: (data: any) => void) {
    if (this.eventSource) {
      this.eventSource.close()
    }

    try {
      this.eventSource = new EventSource(`/api/websocket?type=${type}`)

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          callback(data)
        } catch (error) {
          console.error("Failed to parse SSE data:", error)
        }
      }

      this.eventSource.onerror = (error) => {
        console.error("SSE connection error:", error)
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (this.eventSource?.readyState === EventSource.CLOSED) {
            this.connectSSE(type, callback)
          }
        }, 5000)
      }

      this.eventSource.onopen = () => {
        console.log("SSE connection established")
      }

      return this.eventSource
    } catch (error) {
      console.error("Failed to establish SSE connection:", error)
      return null
    }
  }

  // Disconnect SSE
  disconnectSSE() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
      console.log("SSE connection closed")
    }
  }

  // Clean up all connections
  cleanup() {
    this.connections.forEach((subscription, channel) => {
      this.unsubscribe(channel)
    })
    this.disconnectSSE()
  }

  // Get connection status
  getConnectionStatus() {
    return {
      activeChannels: Array.from(this.connections.keys()),
      sseConnected: this.eventSource?.readyState === EventSource.OPEN,
      totalConnections: this.connections.size,
    }
  }
}

// Export singleton instance
export const realtimeManager = RealtimeManager.getInstance()
