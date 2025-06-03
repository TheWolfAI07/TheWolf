/**
 * Wolf Platform Logger
 *
 * Production-grade logging system with multiple levels and outputs
 */

import { config } from "./config"

// Log levels
export type LogLevel = "debug" | "info" | "warn" | "error" | "critical"

// Log entry interface
export interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, any>
  timestamp: string
  source?: string
}

// Logger class
class Logger {
  private logLevel: LogLevel
  private enableConsole: boolean
  private enableDatabase: boolean

  constructor() {
    this.logLevel = (config.logging?.level as LogLevel) || "info"
    this.enableConsole = config.logging?.enableConsole ?? true
    this.enableDatabase = config.logging?.enableDatabase ?? false
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error", "critical"]
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString()
    const emoji = this.getLevelEmoji(level)
    const contextStr = context ? ` ${JSON.stringify(context)}` : ""
    return `${emoji} [${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
  }

  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case "debug":
        return "🔍"
      case "info":
        return "ℹ️"
      case "warn":
        return "⚠️"
      case "error":
        return "❌"
      case "critical":
        return "🚨"
      default:
        return "📝"
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, source?: string): void {
    if (!this.shouldLog(level)) return

    const logEntry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      source,
    }

    // Console logging
    if (this.enableConsole) {
      const formattedMessage = this.formatMessage(level, message, context)

      switch (level) {
        case "debug":
          console.debug(formattedMessage)
          break
        case "info":
          console.info(formattedMessage)
          break
        case "warn":
          console.warn(formattedMessage)
          break
        case "error":
        case "critical":
          console.error(formattedMessage)
          break
        default:
          console.log(formattedMessage)
      }
    }

    // Database logging (if enabled and available)
    if (this.enableDatabase && typeof window === "undefined") {
      this.logToDatabase(logEntry).catch((error) => {
        console.error("Failed to log to database:", error)
      })
    }
  }

  private async logToDatabase(logEntry: LogEntry): Promise<void> {
    try {
      // Only import on server side
      const { createServerSupabaseClient } = await import("./supabase")
      const supabase = createServerSupabaseClient()

      await supabase.from("wolf_logs").insert([
        {
          level: logEntry.level,
          message: logEntry.message,
          context: logEntry.context || {},
          source: logEntry.source || "unknown",
          created_at: logEntry.timestamp,
        },
      ])
    } catch (error) {
      // Silently fail database logging to avoid infinite loops
      console.warn("Database logging failed:", error)
    }
  }

  // Public logging methods
  debug(message: string, context?: Record<string, any>, source?: string): void {
    this.log("debug", message, context, source)
  }

  info(message: string, context?: Record<string, any>, source?: string): void {
    this.log("info", message, context, source)
  }

  warn(message: string, context?: Record<string, any>, source?: string): void {
    this.log("warn", message, context, source)
  }

  error(message: string, context?: Record<string, any>, source?: string): void {
    this.log("error", message, context, source)
  }

  critical(message: string, context?: Record<string, any>, source?: string): void {
    this.log("critical", message, context, source)
  }

  // Utility methods
  setLevel(level: LogLevel): void {
    this.logLevel = level
  }

  getLevel(): LogLevel {
    return this.logLevel
  }

  enableConsoleLogging(enable: boolean): void {
    this.enableConsole = enable
  }

  enableDatabaseLogging(enable: boolean): void {
    this.enableDatabase = enable
  }
}

// Export singleton instance
export const logger = new Logger()

// Export for convenience
export default logger
