/**
 * Wolf Platform Supabase Client - OPTIMIZED AND CLEANED
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { config } from "./config"
import { logger } from "./logger"

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || config.database.url
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || config.database.anonKey
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || config.database.serviceKey

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const error = "Missing required Supabase environment variables"
  logger.critical(error, {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
  })
  throw new Error(error)
}

// Universal Supabase client that works everywhere
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
    detectSessionInUrl: typeof window !== "undefined",
  },
  global: {
    headers: {
      "X-Client-Info": `wolf-platform/${config.system.version}`,
    },
  },
})

// Safe client creator - SIMPLIFIED
export const createSafeSupabaseClient = () => {
  return supabase
}

// Server-side client for API routes
export const createServerSupabaseClient = () => {
  if (typeof window !== "undefined") {
    logger.warn("createServerSupabaseClient called on client side - using universal client")
    return supabase
  }

  const apiKey = supabaseServiceKey || supabaseAnonKey

  return createSupabaseClient(supabaseUrl, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": `wolf-platform-server/${config.system.version}`,
      },
    },
  })
}

// Connection health check
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error && !error.message.includes("session")) {
      throw error
    }

    logger.info("Supabase connection healthy")
    return { connected: true, error: null }
  } catch (error: any) {
    logger.error("Supabase connection failed", { error: error.message })
    return { connected: false, error: error.message }
  }
}

// Client-side Supabase client with proper typing
export const createClientSupabaseClient = () => {
  if (typeof window === "undefined") {
    logger.warn("createClientSupabaseClient called on server side - using universal client")
    return supabase
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        "X-Client-Info": `wolf-platform-client/${config.system.version}`,
      },
    },
  })
}

// Safe database operation wrapper with error handling
export const safeDbOperation = async <T,>(
  operation: () => Promise<T>,
  errorMessage = "Database operation failed",
): Promise<{ data: T | null; error: Error | null }> => {
  try {
    const result = await operation()
    return { data: result, error: null }
  } catch (error: any) {
    logger.error(errorMessage, { error: error.message })
    return { data: null, error: new Error(`${errorMessage}: ${error.message}`) }
  }
}

// Test edge functions connectivity
export const testEdgeFunctions = async (): Promise<{ available: boolean; latency: number | null }> => {
  try {
    const startTime = Date.now()
    const { data, error } = await supabase.functions
      .invoke("health-check", {
        body: { timestamp: startTime },
      })
      .catch((err) => ({ data: null, error: err }))

    const endTime = Date.now()
    const latency = endTime - startTime

    if (error) {
      logger.warn("Edge functions test failed", { error: error.message, latency })
      return { available: false, latency: null }
    }

    logger.info("Edge functions test successful", { latency })
    return { available: true, latency }
  } catch (error: any) {
    logger.error("Edge functions test error", { error: error.message })
    return { available: false, latency: null }
  }
}

// Export connection status
export const getConnectionStatus = () => ({
  initialized: true,
  healthy: true,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "missing",
})
