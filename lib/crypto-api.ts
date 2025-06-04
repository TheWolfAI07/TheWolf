export interface CryptoPrice {
  id: string
  symbol: string
  name: string
  current_price: number
  price_change_percentage_1h_in_currency?: number
  price_change_percentage_24h: number
  price_change_percentage_7d_in_currency?: number
  market_cap: number
  total_volume: number
  circulating_supply: number
  total_supply: number | null
  ath: number
  ath_date: string
  image: string
  market_cap_rank: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  last_updated: string
  fully_diluted_valuation?: number
  max_supply?: number
}

export interface MarketData {
  total_market_cap: { usd: number }
  total_volume: { usd: number }
  market_cap_percentage: { btc: number; eth: number }
  active_cryptocurrencies: number
  markets: number
  updated_at: number
}

export interface TrendingCoin {
  id: string
  coin_id: number
  name: string
  symbol: string
  market_cap_rank: number
  thumb: string
  small: string
  large: string
  slug: string
  price_btc: number
  score: number
}

export class CryptoAPI {
  private static readonly BASE_URL = "https://api.coingecko.com/api/v3"
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static readonly CACHE_DURATION = 60000 // 1 minute
  private static readonly LONG_CACHE_DURATION = 300000 // 5 minutes for less volatile data
  private static requestQueue = new Map<string, Promise<any>>()

  private static getCacheKey(endpoint: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : ""
    return `${endpoint}${paramString}`
  }

  private static isValidCache(timestamp: number, duration = this.CACHE_DURATION): boolean {
    return Date.now() - timestamp < duration
  }

  private static async fetchWithCache<T>(
    endpoint: string,
    params?: Record<string, any>,
    cacheDuration = this.CACHE_DURATION,
  ): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, params)
    const cached = this.cache.get(cacheKey)

    // Return valid cache
    if (cached && this.isValidCache(cached.timestamp, cacheDuration)) {
      return cached.data
    }

    // Check if request is already in progress
    const existingRequest = this.requestQueue.get(cacheKey)
    if (existingRequest) {
      return existingRequest
    }

    const url = new URL(`${this.BASE_URL}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const requestPromise = this.makeRequest<T>(url.toString(), cacheKey)
    this.requestQueue.set(cacheKey, requestPromise)

    try {
      const data = await requestPromise
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } finally {
      this.requestQueue.delete(cacheKey)
    }
  }

  private static async makeRequest<T>(url: string, cacheKey: string): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "WolfPlatform/1.0",
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after")
          const waitTime = retryAfter ? Number.parseInt(retryAfter) * 1000 : 60000

          // Return cached data if available
          const cached = this.cache.get(cacheKey)
          if (cached) {
            console.warn(`Using cached data for ${url}`)
            return cached.data
          }

          throw new Error(`Rate limited. Please try again in ${Math.ceil(waitTime / 1000)} seconds.`)
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Validate response structure
      if (data === null || data === undefined) {
        throw new Error("Invalid response data")
      }

      return data
    } catch (error: any) {
      clearTimeout(timeoutId)

      if (error.name === "AbortError") {
        throw new Error("Request timeout. Please check your connection.")
      }

      console.error(`API Error for ${url}:`, error)

      // Return cached data if available, even if expired
      const cached = this.cache.get(cacheKey)
      if (cached) {
        console.warn(`Using expired cache for ${url}`)
        return cached.data
      }

      throw error
    }
  }

  static async getTopCryptocurrencies(limit = 100): Promise<CryptoPrice[]> {
    try {
      const data = await this.fetchWithCache<CryptoPrice[]>("/coins/markets", {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: Math.min(limit, 250), // CoinGecko limit
        page: 1,
        sparkline: false,
        price_change_percentage: "1h,24h,7d",
        locale: "en",
      })

      // Validate and filter data
      return (data || []).filter(
        (crypto) =>
          crypto &&
          crypto.id &&
          crypto.symbol &&
          crypto.name &&
          typeof crypto.current_price === "number" &&
          crypto.current_price > 0,
      )
    } catch (error) {
      console.error("Failed to fetch cryptocurrencies:", error)
      return []
    }
  }

  static async getCryptocurrency(id: string): Promise<CryptoPrice | null> {
    if (!id || typeof id !== "string") {
      return null
    }

    try {
      const data = await this.fetchWithCache<CryptoPrice[]>("/coins/markets", {
        vs_currency: "usd",
        ids: id,
        order: "market_cap_desc",
        per_page: 1,
        page: 1,
        sparkline: false,
        price_change_percentage: "1h,24h,7d",
      })

      return data && data.length > 0 ? data[0] : null
    } catch (error) {
      console.error(`Failed to fetch cryptocurrency ${id}:`, error)
      return null
    }
  }

  static async getGlobalMarketData(): Promise<MarketData | null> {
    try {
      const response = await this.fetchWithCache<{ data: MarketData }>("/global", {}, this.LONG_CACHE_DURATION)
      return response?.data || null
    } catch (error) {
      console.error("Failed to fetch global market data:", error)
      return null
    }
  }

  static async searchCryptocurrencies(query: string): Promise<any[]> {
    if (!query || query.trim().length < 2) {
      return []
    }

    try {
      const response = await this.fetchWithCache<{ coins: any[] }>("/search", {
        query: query.trim(),
      })
      return response?.coins || []
    } catch (error) {
      console.error(`Failed to search for ${query}:`, error)
      return []
    }
  }

  static async getCryptocurrencyHistory(id: string, days = 7): Promise<{ prices: [number, number][] }> {
    if (!id || typeof id !== "string") {
      return { prices: [] }
    }

    try {
      const data = await this.fetchWithCache(`/coins/${id}/market_chart`, {
        vs_currency: "usd",
        days: Math.min(days, 365), // Limit to 1 year
        interval: days <= 1 ? "hourly" : "daily",
      })

      return {
        prices: (data?.prices || []).filter(
          (price: any) =>
            Array.isArray(price) && price.length === 2 && typeof price[0] === "number" && typeof price[1] === "number",
        ),
      }
    } catch (error) {
      console.error(`Failed to fetch history for ${id}:`, error)
      return { prices: [] }
    }
  }

  static async getTrendingCryptocurrencies(): Promise<TrendingCoin[]> {
    try {
      const response = await this.fetchWithCache<{ coins: TrendingCoin[] }>("/search/trending")
      return response?.coins || []
    } catch (error) {
      console.error("Failed to fetch trending cryptocurrencies:", error)
      return []
    }
  }

  static formatPrice(price: number | null | undefined): string {
    if (price === null || price === undefined || isNaN(price) || price < 0) {
      return "$0.00"
    }

    if (price < 0.000001) {
      return `$${price.toExponential(2)}`
    } else if (price < 0.01) {
      return `$${price.toFixed(6)}`
    } else if (price < 1) {
      return `$${price.toFixed(4)}`
    } else if (price < 100) {
      return `$${price.toFixed(2)}`
    } else {
      return `$${price.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    }
  }

  static formatLargeNumber(num: number | null | undefined): string {
    if (num === null || num === undefined || isNaN(num) || num < 0) {
      return "$0"
    }

    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(2)}K`
    }
    return `$${num.toFixed(2)}`
  }

  static formatPercentage(percentage: number | null | undefined): string {
    if (percentage === null || percentage === undefined || isNaN(percentage)) {
      return "0.00%"
    }

    const sign = percentage >= 0 ? "+" : ""
    return `${sign}${percentage.toFixed(2)}%`
  }

  static formatSupply(supply: number | null | undefined): string {
    if (supply === null || supply === undefined || isNaN(supply)) {
      return "N/A"
    }

    if (supply >= 1e12) {
      return `${(supply / 1e12).toFixed(2)}T`
    } else if (supply >= 1e9) {
      return `${(supply / 1e9).toFixed(2)}B`
    } else if (supply >= 1e6) {
      return `${(supply / 1e6).toFixed(2)}M`
    } else if (supply >= 1e3) {
      return `${(supply / 1e3).toFixed(2)}K`
    }
    return supply.toLocaleString()
  }

  static clearCache(): void {
    this.cache.clear()
    this.requestQueue.clear()
  }

  static getCacheSize(): number {
    return this.cache.size
  }
}
