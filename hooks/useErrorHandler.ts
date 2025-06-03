"use client"

import { useState, useCallback } from "react"

interface ErrorState {
  message: string
  code?: string
  type?: string
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleError = useCallback((err: any, context?: Record<string, any>) => {
    const errorMessage = err.message || "An unexpected error occurred"
    const errorCode = err.code || "UNKNOWN_ERROR"
    const errorType = err.type || "UNKNOWN"

    console.error("Error occurred:", {
      message: errorMessage,
      code: errorCode,
      type: errorType,
      context,
      error: err,
    })

    setError({
      message: errorMessage,
      code: errorCode,
      type: errorType,
    })

    setLoading(false)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const withErrorHandling = useCallback(\
    async <T>(fn: () => Promise<T>, context?: Record<string, any>): Promise<T | null> => {
  try {
    setLoading(true)
    clearError()
    const result = await fn()
    setLoading(false)
    return result
  } catch (err: any) {
    handleError(err, context)
    return null
  }
}
,
    [handleError, clearError]
  )

return {
    error,
    loading,
    handleError,
    clearError,
    withErrorHandling,
    setLoading,
  }
}
