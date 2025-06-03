/**
 * Wolf Platform Logging System
 *
 * Centralized logging with multiple output targets and severity levels
 */

import { config } from "./config"
import { supabase } from "./supabase"

// Log levels
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  CRITICAL = "critical",
}

// Log entry interface
export interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, any>
  timestamp: string
  source: string
}

// Logger configuration
const loggerConfig = {
  minLevel: config.logging.level as LogLevel,
  enableConsole: config.logging.enableConsole,
  enableDatabase: config.logging.enableDatabase,
}

// Log level numeric values for comparison
const logLevelValues: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.CRITICAL]: 4,
}

// Check if a log level should be processed
const shouldLog = (level: LogLevel): boolean => {
  return logLevelValues[level] >= logLevelValues[loggerConfig.minLevel]
}

// Format context object for logging
const formatContext = (context?: Record<string, any>): string => {
  if (!context) return ""
  try {
    return JSON.stringify(context)
  } catch (error) {
    return "[Unserializable context]"
  }
}

// Log to console with appropriate styling
const logToConsole = (entry: LogEntry): void => {
  if (!loggerConfig.enableConsole) return

  const timestamp = new Date(entry.timestamp).toISOString()
  const contextStr = entry.context ? formatContext(entry.context) : ""

  const styles: Record<LogLevel, string[]> = {
    [LogLevel.DEBUG]: ["color: gray"],
    [LogLevel.INFO]: ["color: blue"],
    [LogLevel.WARN]: ["color: orange", "font-weight: bold"],
    [LogLevel.ERROR]: ["color: red", "font-weight: bold"],
    [LogLevel.CRITICAL]: ["color: white", "background-color: red", "font-weight: bold"],
  }

  const style = styles[entry.level] || []

  if (typeof window !== "undefined") {
    // Browser environment
    console[
      entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL
        ? "error"
        : entry.level === LogLevel.WARN
          ? "warn"
          : entry.level === LogLevel.INFO
            ? "info"
            : "log"
    ](
      `%c[${entry.level.toUpperCase()}] [${timestamp}] [${entry.source}]: ${entry.message}`,
      style.join(";"),
      contextStr ? entry.context : "",
    )
  } else {
    // Node.js environment
    console[
      entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL
        ? "error"
        : entry.level === LogLevel.WARN
          ? "warn"
          : entry.level === LogLevel.INFO
            ? "info"
            : "log"
    ](`[${entry.level.toUpperCase()}] [${timestamp}] [${entry.source}]: ${entry.message}`, contextStr)
  }
}

// Log to database
const logToDatabase = async (entry: LogEntry): Promise<void> => {
  if (!loggerConfig.enableDatabase || !supabase) return

  try {
    await supabase.from("wolf_logs").insert([
      {
        level: entry.level,
        message: entry.message,
        context: entry.context || {},
        source: entry.source,
        created_at: entry.timestamp,
      },
    ])
  } catch (error) {
    // Fallback to console if database logging fails
    console.error("Failed to log to database:", error)
  }
}

// Main logging function
const log = async (level: LogLevel, message: string, context?: Record<string, any>, source = "app"): Promise<void> => {
  if (!shouldLog(level)) return

  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    source,
  }

  // Log to enabled targets
  logToConsole(entry)

  if (loggerConfig.enableDatabase) {
    await logToDatabase(entry)
  }
}

// Export logger methods
export const logger = {
  debug: (message: string, context?: Record<string, any>, source?: string) =>
    log(LogLevel.DEBUG, message, context, source),

  info: (message: string, context?: Record<string, any>, source?: string) =>
    log(LogLevel.INFO, message, context, source),

  warn: (message: string, context?: Record<string, any>, source?: string) =>
    log(LogLevel.WARN, message, context, source),

  error: (message: string, context?: Record<string, any>, source?: string) =>
    log(LogLevel.ERROR, message, context, source),

  critical: (message: string, context?: Record<string, any>, source?: string) =>
    log(LogLevel.CRITICAL, message, context, source),
}
