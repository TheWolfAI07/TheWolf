/**
 * Wolf Platform System Configuration
 *
 * Central configuration module for the entire platform
 */

// Environment validation
const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

// Optional but recommended env vars
const recommendedEnvVars = ["SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_APP_URL"]

// Validate environment
export const validateEnvironment = (): { valid: boolean; missing: string[] } => {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName])
  return {
    valid: missing.length === 0,
    missing,
  }
}

// System configuration
export const config = {
  // Core system settings
  system: {
    name: "Wolf Platform",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    debug: process.env.NODE_ENV !== "production",
    launchDate: new Date("2024-01-01"),
  },

  // API endpoints
  api: {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    timeout: 10000, // 30 seconds
    retries: 2,
  },

  // Database settings
  database: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    poolSize: 10,
    timeout: 30000,
  },

  // Authentication settings
  auth: {
    sessionTimeout: 3600, // 24 hours in seconds
    refreshInterval: 3600, // 1 hour in seconds
    passwordMinLength: 8,
    maxLoginAttempts: 5,
  },

  // Feature flags
  features: {
    edgeFunctions: true,
    realtime: true,
    analytics: true,
    notifications: true,
    enableAnalytics: true,
    enableRealtime: true,
    enableAI: true,
  },

  // Security settings
  security: {
    corsEnabled: true,
    allowedOrigins: ["*"], // In production, specify exact domains
    csrfProtection: true,
    rateLimit: {
      enabled: true,
      maxRequests: 100,
      windowMs: 60000, // 1 minute
    },
  },

  // Logging configuration
  logging: {
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
    enableConsole: true,
    enableDatabase: true,
  },

  // Performance settings
  performance: {
    cacheEnabled: true,
    cacheTTL: 300, // 5 minutes
    compressionEnabled: true,
  },
}

// Export environment validation status
export const environmentStatus = validateEnvironment()

// Log configuration issues in non-production environments
if (config.system.debug && !environmentStatus.valid) {
  console.warn("⚠️ Missing required environment variables:", environmentStatus.missing)
}

// Export a typed config getter to access config values safely
export function getConfig<T>(path: string, defaultValue?: T): T {
  const parts = path.split(".")
  let current: any = config

  for (const part of parts) {
    if (current[part] === undefined) {
      if (defaultValue !== undefined) {
        return defaultValue
      }
      throw new Error(`Configuration path "${path}" does not exist`)
    }
    current = current[part]
  }

  return current as T
}
