export enum ErrorType {
  AUTH = "AUTH",
  DATABASE = "DATABASE",
  API = "API",
  NETWORK = "NETWORK",
  VALIDATION = "VALIDATION",
  UNKNOWN = "UNKNOWN",
}

export interface WolfError {
  type: ErrorType
  message: string
  code?: string
  context?: Record<string, any>
  originalError?: any
  timestamp: string
}

export function createError(
  type: ErrorType,
  message: string,
  originalError?: any,
  context?: Record<string, any>,
  code?: string,
): WolfError {
  return {
    type,
    message,
    code,
    context,
    originalError,
    timestamp: new Date().toISOString(),
  }
}

export function logError(error: WolfError): void {
  console.error("Wolf Error:", {
    type: error.type,
    message: error.message,
    code: error.code,
    context: error.context,
    timestamp: error.timestamp,
    originalError: error.originalError,
  })
}

export function handleAsyncError(error: any, context?: Record<string, any>): WolfError {
  const errorType = determineErrorType(error)
  const wolfError = createError(errorType, error.message || "Unknown error", error, context)
  logError(wolfError)
  return wolfError
}

// Determine error type from error object
function determineErrorType(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN

  const message = error.message?.toLowerCase() || ""
  const code = error.code?.toLowerCase() || ""

  // Authentication errors
  if (
    message.includes("auth") ||
    message.includes("login") ||
    message.includes("password") ||
    message.includes("unauthorized") ||
    code.includes("auth")
  ) {
    return ErrorType.AUTH
  }

  // Database errors
  if (
    message.includes("database") ||
    message.includes("sql") ||
    message.includes("connection") ||
    message.includes("supabase") ||
    code.includes("db") ||
    code.includes("sql")
  ) {
    return ErrorType.DATABASE
  }

  // Network errors
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("cors") ||
    code.includes("network")
  ) {
    return ErrorType.NETWORK
  }

  // Validation errors
  if (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("required") ||
    code.includes("validation")
  ) {
    return ErrorType.VALIDATION
  }

  // API errors
  if (message.includes("api") || message.includes("endpoint") || message.includes("route") || code.includes("api")) {
    return ErrorType.API
  }

  return ErrorType.UNKNOWN
}

// Safe async wrapper
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  context?: Record<string, any>,
): Promise<{ data: T; error: WolfError | null }> {
  try {
    const result = await operation()
    return { data: result, error: null }
  } catch (error) {
    const wolfError = handleAsyncError(error, context)
    return { data: fallback, error: wolfError }
  }
}

// Error recovery strategies
export class ErrorRecovery {
  static async withRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
    let lastError: any

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
        }
      }
    }

    throw lastError
  }

  static async withFallback<T>(operation: () => Promise<T>, fallback: T, context?: Record<string, any>): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      logError(createError(ErrorType.UNKNOWN, "Operation failed, using fallback", error, context))
      return fallback
    }
  }
}

export function getUserFriendlyMessage(error: WolfError): string {
  switch (error.type) {
    case ErrorType.AUTH:
      return "Authentication failed. Please check your credentials."
    case ErrorType.DATABASE:
      return "Database connection issue. Please try again."
    case ErrorType.API:
      return "Service temporarily unavailable. Please try again."
    case ErrorType.NETWORK:
      return "Network connection issue. Please check your internet."
    case ErrorType.VALIDATION:
      return "Invalid input. Please check your data."
    default:
      return "Something went wrong. Please try again."
  }
}
