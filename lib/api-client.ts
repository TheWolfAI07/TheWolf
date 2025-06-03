/**
 * Wolf Platform API Client
 *
 * Centralized API client for making requests to internal and external endpoints
 */

import { config } from "./config"
import { logger } from "./logger"

// Request options interface
export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>
  timeout?: number
  retries?: number
  retryDelay?: number
}

// Response interface
export interface ApiResponse<T = any> {
  data: T | null
  error: Error | null
  status: number
  headers: Headers
  success: boolean
}

// Error interface
export class ApiError extends Error {
  status: number
  data?: any

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

// Build URL with query parameters
const buildUrl = (url: string, params?: Record<string, any>): string => {
  if (!params) return url

  const queryParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&")

  return queryParams ? `${url}${url.includes("?") ? "&" : "?"}${queryParams}` : url
}

// Create fetch request with timeout
const fetchWithTimeout = async (url: string, options: RequestInit & { timeout?: number }): Promise<Response> => {
  const { timeout = config.api.timeout, ...fetchOptions } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

// Retry logic for failed requests
const fetchWithRetry = async (
  url: string,
  options: RequestInit & { timeout?: number; retries?: number; retryDelay?: number },
): Promise<Response> => {
  const { retries = config.api.retries, retryDelay = 1000, ...fetchOptions } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetchWithTimeout(url, fetchOptions)
    } catch (error: any) {
      lastError = error

      // Don't retry if we've reached the max retries or if it's an abort error
      if (attempt >= retries || error.name === "AbortError") {
        throw error
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)))
    }
  }

  throw lastError || new Error("Request failed")
}

// Process response - FIXED SYNTAX\
const processResponse = async <T>(response: Response)
: Promise<ApiResponse<T>> =>
{
  const headers = response.headers
  const status = response.status

  let data: T | null = null
  let error: Error | null = null

  if (status >= 200 && status < 300) {
    try {
      const contentType = headers.get("content-type")
      if (contentType?.includes("application/json")) {
        data = await response.json()
      } else if (contentType?.includes("text/")) {
        data = (await response.text()) as unknown as T
      } else {
        data = (await response.blob()) as unknown as T
      }
    } catch (e: any) {
      error = new ApiError(`Failed to parse response: ${e.message}`, status)
    }
  } else {
    let errorData: any

    try {
      errorData = await response.json()
    } catch (e) {
      errorData = { message: response.statusText }
    }

    error = new ApiError(errorData.message || `Request failed with status ${status}`, status, errorData)
  }

  return {
    data,
    error,
    status,
    headers,
    success: status >= 200 && status < 300 && !error,
  }
}

// Main API client
export const apiClient = {
  // GET request
  async get<T = any>(url: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, ...fetchOptions } = options
    const fullUrl = buildUrl(url, params)

    try {
      const response = await fetchWithRetry(fullUrl, {
        ...fetchOptions,
        method: "GET",
      })

      return await processResponse<T>(response)
    } catch (error: any) {
      logger.error(`GET request failed: ${url}`, { error: error.message, params })

      return {
        data: null,
        error: new ApiError(error.message, error.name === "AbortError" ? 408 : 500),
        status: error.name === "AbortError" ? 408 : 500,
        headers: new Headers(),
        success: false,
      }
    }
  },

  // POST request
  async post<T = any>(url: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, ...fetchOptions } = options
    const fullUrl = buildUrl(url, params)

    try {
      const response = await fetchWithRetry(fullUrl, {
        ...fetchOptions,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      return await processResponse<T>(response)
    } catch (error: any) {
      logger.error(`POST request failed: ${url}`, { error: error.message, data, params })

      return {
        data: null,
        error: new ApiError(error.message, error.name === "AbortError" ? 408 : 500),
        status: error.name === "AbortError" ? 408 : 500,
        headers: new Headers(),
        success: false,
      }
    }
  },

  // PUT request
  async put<T = any>(url: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, ...fetchOptions } = options
    const fullUrl = buildUrl(url, params)

    try {
      const response = await fetchWithRetry(fullUrl, {
        ...fetchOptions,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      })

      return await processResponse<T>(response)
    } catch (error: any) {
      logger.error(`PUT request failed: ${url}`, { error: error.message, data, params })

      return {
        data: null,
        error: new ApiError(error.message, error.name === "AbortError" ? 408 : 500),
        status: error.name === "AbortError" ? 408 : 500,
        headers: new Headers(),
        success: false,
      }
    }
  },

  // DELETE request
  async delete<T = any>(url: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, ...fetchOptions } = options
    const fullUrl = buildUrl(url, params)

    try {
      const response = await fetchWithRetry(fullUrl, {
        ...fetchOptions,
        method: "DELETE",
      })

      return await processResponse<T>(response)
    } catch (error: any) {
      logger.error(`DELETE request failed: ${url}`, { error: error.message, params })

      return {
        data: null,
        error: new ApiError(error.message, error.name === "AbortError" ? 408 : 500),
        status: error.name === "AbortError" ? 408 : 500,
        headers: new Headers(),
        success: false,
      }
    }
  },
}
