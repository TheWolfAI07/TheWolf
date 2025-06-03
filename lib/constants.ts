export const APP_NAME = "Wolf Platform"
export const APP_VERSION = "1.0.0"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://wolf-platform.vercel.app"
export const API_BASE_URL = `${APP_URL}/api`

export const PLATFORM_STATUS = {
  INITIALIZING: "initializing",
  LIVE: "live",
  MAINTENANCE: "maintenance",
  ERROR: "error",
} as const

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  DEVELOPER: "developer",
  MANAGER: "manager",
} as const

export const PROJECT_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const
