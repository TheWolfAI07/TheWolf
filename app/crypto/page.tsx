"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Plus,
  Activity,
  ArrowLeft,
  Search,
  Star,
  Bell,
  MoreHorizontal,
  Check,
  X,
  AlertTriangle,
  Info,
} from "lucide-react"
import Link from "next/link"

// Types
interface CryptoAsset {
  id: string
  symbol: string
  name: string
  price: number
  change1h: number
  change24h: number
  change7d: number
  volume24h: number
  marketCap: number
  circulatingSupply: number
  totalSupply: number
  allTimeHigh: number
  allTimeHighDate: string
  logo: string
  rank: number
  high24h: number
  low24h: number
  priceChange24h: number
  lastUpdated: string
}

interface AssetHolding {
  id: string
  assetId: string
  symbol: string
  name: string
  amount: number
  valueUsd: number
  averageBuyPrice: number
  profitLoss: number
  profitLossPercentage: number
  logo: string
  locked: boolean
  location: "exchange" | "wallet" | "staking" | "lending"
  locationDetails: string
}

interface Portfolio {
  id: string
  name: string
  totalValueUsd: number
  totalProfitLoss: number
  totalProfitLossPercentage: number
  holdings: AssetHolding[]
  lastUpdated: string
}

interface PriceAlert {
  id: string
  assetId: string
  symbol: string
  targetPrice: number
  condition: "above" | "below"
  active: boolean
  createdAt: string
  triggered: boolean
  repeating: boolean
  notificationMethod: "app" | "email" | "both"
}

interface MarketData {
  totalMarketCap: number
  totalVolume24h: number
  btcDominance: number
  ethDominance: number
  totalCryptocurrencies: number
  totalExchanges: number
  fearGreedIndex: number
  fearGreedLabel: string
  lastUpdated: string
}

// Static data
const STATIC_CRYPTO_ASSETS: CryptoAsset[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: 43250.75,
    change1h: 0.3,
    change24h: 2.5,
    change7d: -1.2,
    volume24h: 28500000000,
    marketCap: 845000000000,
    circulatingSupply: 19500000,
    totalSupply: 21000000,
    allTimeHigh: 69000,
    allTimeHighDate: "2021-11-10",
    logo: "₿",
    rank: 1,
    high24h: 44000,
    low24h: 42500,
    priceChange24h: 1050,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: 2650.25,
    change1h: -0.2,
    change24h: -1.2,
    change7d: 3.5,
    volume24h: 15200000000,
    marketCap: 318000000000,
    circulatingSupply: 120000000,
    totalSupply: 120000000,
    allTimeHigh: 4878,
    allTimeHighDate: "2021-11-10",
    logo: "Ξ",
    rank: 2,
    high24h: 2700,
    low24h: 2600,
    priceChange24h: -32,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: 98.5,
    change1h: 0.8,
    change24h: 5.2,
    change7d: 12.4,
    volume24h: 2100000000,
    marketCap: 42000000000,
    circulatingSupply: 426000000,
    totalSupply: 535000000,
    allTimeHigh: 260,
    allTimeHighDate: "2021-11-06",
    logo: "◎",
    rank: 5,
    high24h: 102,
    low24h: 94,
    priceChange24h: 4.9,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    price: 0.48,
    change1h: -0.5,
    change24h: -2.1,
    change7d: -5.3,
    volume24h: 890000000,
    marketCap: 17000000000,
    circulatingSupply: 35400000000,
    totalSupply: 45000000000,
    allTimeHigh: 3.09,
    allTimeHighDate: "2021-09-02",
    logo: "₳",
    rank: 8,
    high24h: 0.51,
    low24h: 0.46,
    priceChange24h: -0.01,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "polkadot",
    symbol: "DOT",
    name: "Polkadot",
    price: 7.2,
    change1h: 0.4,
    change24h: 1.8,
    change7d: -2.5,
    volume24h: 320000000,
    marketCap: 9000000000,
    circulatingSupply: 1250000000,
    totalSupply: 1250000000,
    allTimeHigh: 55,
    allTimeHighDate: "2021-11-04",
    logo: "●",
    rank: 12,
    high24h: 7.5,
    low24h: 7.0,
    priceChange24h: 0.13,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "Binance Coin",
    price: 385.75,
    change1h: 0.2,
    change24h: 1.5,
    change7d: -0.8,
    volume24h: 1800000000,
    marketCap: 59000000000,
    circulatingSupply: 153000000,
    totalSupply: 166800000,
    allTimeHigh: 690,
    allTimeHighDate: "2021-05-10",
    logo: "🔶",
    rank: 3,
    high24h: 390,
    low24h: 380,
    priceChange24h: 5.75,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "ripple",
    symbol: "XRP",
    name: "XRP",
    price: 0.62,
    change1h: 0.1,
    change24h: 3.2,
    change7d: 8.5,
    volume24h: 1500000000,
    marketCap: 33000000000,
    circulatingSupply: 53500000000,
    totalSupply: 100000000000,
    allTimeHigh: 3.4,
    allTimeHighDate: "2018-01-07",
    logo: "◆",
    rank: 6,
    high24h: 0.64,
    low24h: 0.6,
    priceChange24h: 0.02,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    price: 14.85,
    change1h: 0.4,
    change24h: 3.2,
    change7d: 7.5,
    volume24h: 650000000,
    marketCap: 8500000000,
    circulatingSupply: 572000000,
    totalSupply: 1000000000,
    allTimeHigh: 52.7,
    allTimeHighDate: "2021-05-10",
    logo: "🔗",
    rank: 15,
    high24h: 15.2,
    low24h: 14.3,
    priceChange24h: 0.45,
    lastUpdated: new Date().toISOString(),
  },
]

const STATIC_PORTFOLIO: Portfolio = {
  id: "main-portfolio",
  name: "Main Portfolio",
  totalValueUsd: 25750.42,
  totalProfitLoss: 3250.75,
  totalProfitLossPercentage: 14.5,
  holdings: [
    {
      id: "btc-holding",
      assetId: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.5,
      valueUsd: 21625.38,
      averageBuyPrice: 39500,
      profitLoss: 1875.38,
      profitLossPercentage: 9.5,
      logo: "₿",
      locked: false,
      location: "exchange",
      locationDetails: "Binance",
    },
    {
      id: "eth-holding",
      assetId: "ethereum",
      symbol: "ETH",
      name: "Ethereum",
      amount: 1.2,
      valueUsd: 3180.3,
      averageBuyPrice: 2100,
      profitLoss: 660.3,
      profitLossPercentage: 26.2,
      logo: "Ξ",
      locked: false,
      location: "wallet",
      locationDetails: "MetaMask",
    },
    {
      id: "sol-holding",
      assetId: "solana",
      symbol: "SOL",
      name: "Solana",
      amount: 10,
      valueUsd: 985.0,
      averageBuyPrice: 85,
      profitLoss: 135.0,
      profitLossPercentage: 15.9,
      logo: "◎",
      locked: true,
      location: "staking",
      locationDetails: "Solana Validator",
    },
  ],
  lastUpdated: new Date().toISOString(),
}

const STATIC_MARKET_DATA: MarketData = {
  totalMarketCap: 2100000000000,
  totalVolume24h: 89200000000,
  btcDominance: 52.3,
  ethDominance: 18.5,
  totalCryptocurrencies: 10482,
  totalExchanges: 567,
  fearGreedIndex: 72,
  fearGreedLabel: "Greed",
  lastUpdated: new Date().toISOString(),
}

const STATIC_PRICE_ALERTS: PriceAlert[] = [
  {
    id: "alert1",
    assetId: "bitcoin",
    symbol: "BTC",
    targetPrice: 45000,
    condition: "above",
    active: true,
    createdAt: "2023-06-15T08:30:00Z",
    triggered: false,
    repeating: false,
    notificationMethod: "both",
  },
  {
    id: "alert2",
    assetId: "ethereum",
    symbol: "ETH",
    targetPrice: 2500,
    condition: "below",
    active: true,
    createdAt: "2023-06-20T14:45:00Z",
    triggered: false,
    repeating: true,
    notificationMethod: "app",
  },
]

export default function CryptoDashboard() {
  // State
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([])
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([])
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [showBalances, setShowBalances] = useState(true)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h")
  const [watchlist, setWatchlist] = useState<string[]>(["bitcoin", "ethereum", "solana"])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationType, setNotificationType] = useState<"success" | "error" | "warning" | "info">("info")

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)

        // Try to fetch from API first
        try {
          const response = await fetch(
            "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h,24h,7d",
          )

          if (response.ok) {
            const data = await response.json()

            const formattedAssets: CryptoAsset[] = data.map((coin: any) => ({
              id: coin.id,
              symbol: coin.symbol.toUpperCase(),
              name: coin.name,
              price: coin.current_price,
              change1h: coin.price_change_percentage_1h_in_currency || 0,
              change24h: coin.price_change_percentage_24h_in_currency || 0,
              change7d: coin.price_change_percentage_7d_in_currency || 0,
              volume24h: coin.total_volume,
              marketCap: coin.market_cap,
              circulatingSupply: coin.circulating_supply,
              totalSupply: coin.total_supply || coin.circulating_supply,
              allTimeHigh: coin.ath,
              allTimeHighDate: coin.ath_date,
              logo: coin.image,
              rank: coin.market_cap_rank,
              high24h: coin.high_24h,
              low24h: coin.low_24h,
              priceChange24h: coin.price_change_24h,
              lastUpdated: coin.last_updated,
            }))

            setCryptoAssets(formattedAssets)
          } else {
            throw new Error("API response not OK")
          }
        } catch (error) {
          console.warn("Failed to fetch from API, using static data", error)
          setCryptoAssets(STATIC_CRYPTO_ASSETS)
        }

        // Set portfolio data
        setPortfolio(STATIC_PORTFOLIO)

        // Set price alerts
        setPriceAlerts(STATIC_PRICE_ALERTS)

        // Set market data
        setMarketData(STATIC_MARKET_DATA)

        setLastUpdated(new Date())
      } catch (error) {
        console.error("Error initializing data:", error)
        showNotificationWithTimeout("Failed to load data. Using fallback data.", "error")
      } finally {
        setLoading(false)
      }
    }

    initializeData()

    // Setup minute updates
    const interval = setInterval(() => {
      updatePrices()
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Update portfolio values when crypto prices change
  useEffect(() => {
    if (portfolio && cryptoAssets.length > 0) {
      updatePortfolioValues()
    }
  }, [cryptoAssets])

  // Function to update crypto prices
  const updatePrices = async () => {
    try {
      // Try to fetch from API first
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h,24h,7d",
        )

        if (response.ok) {
          const data = await response.json()

          setCryptoAssets((prev) => {
            const updated = [...prev]

            data.forEach((coin: any) => {
              const index = updated.findIndex((c) => c.id === coin.id)
              if (index !== -1) {
                updated[index] = {
                  ...updated[index],
                  price: coin.current_price,
                  change1h: coin.price_change_percentage_1h_in_currency || updated[index].change1h,
                  change24h: coin.price_change_percentage_24h_in_currency || updated[index].change24h,
                  change7d: coin.price_change_percentage_7d_in_currency || updated[index].change7d,
                  volume24h: coin.total_volume,
                  marketCap: coin.market_cap,
                  high24h: coin.high_24h,
                  low24h: coin.low_24h,
                  priceChange24h: coin.price_change_24h,
                  lastUpdated: coin.last_updated,
                }
              }
            })

            return updated
          })
        } else {
          throw new Error("API response not OK")
        }
      } catch (error) {
        console.warn("Failed to update from API, simulating price changes", error)

        // Simulate price changes
        setCryptoAssets((prev) => {
          return prev.map((asset) => {
            const priceChange = (Math.random() * 2 - 1) * 0.005 // -0.5% to +0.5%
            const newPrice = asset.price * (1 + priceChange)

            return {
              ...asset,
              price: newPrice,
              change1h: asset.change1h + (Math.random() * 0.4 - 0.2), // -0.2% to +0.2%
              change24h: asset.change24h + (Math.random() * 0.2 - 0.1), // -0.1% to +0.1%
              high24h: Math.max(asset.high24h, newPrice),
              low24h: Math.min(asset.low24h, newPrice),
              priceChange24h: asset.priceChange24h + (newPrice - asset.price),
              lastUpdated: new Date().toISOString(),
            }
          })
        })
      }

      setLastUpdated(new Date())
      checkPriceAlerts()
    } catch (error) {
      console.error("Error updating prices:", error)
    }
  }

  // Update portfolio values based on current prices
  const updatePortfolioValues = () => {
    if (!portfolio) return

    const updatedHoldings = portfolio.holdings.map((holding) => {
      const asset = cryptoAssets.find((a) => a.id === holding.assetId)
      if (!asset) return holding

      const currentValue = holding.amount * asset.price
      const profitLoss = currentValue - holding.amount * holding.averageBuyPrice
      const profitLossPercentage = (profitLoss / (holding.amount * holding.averageBuyPrice)) * 100

      return {
        ...holding,
        valueUsd: currentValue,
        profitLoss,
        profitLossPercentage,
      }
    })

    const totalValue = updatedHoldings.reduce((sum, h) => sum + h.valueUsd, 0)
    const totalCost = updatedHoldings.reduce((sum, h) => sum + h.amount * h.averageBuyPrice, 0)
    const totalProfitLoss = totalValue - totalCost
    const totalProfitLossPercentage = (totalProfitLoss / totalCost) * 100

    setPortfolio({
      ...portfolio,
      holdings: updatedHoldings,
      totalValueUsd: totalValue,
      totalProfitLoss,
      totalProfitLossPercentage,
      lastUpdated: new Date().toISOString(),
    })
  }

  // Check if any price alerts should be triggered
  const checkPriceAlerts = () => {
    const triggeredAlerts: PriceAlert[] = []

    priceAlerts.forEach((alert) => {
      if (!alert.active || alert.triggered) return

      const asset = cryptoAssets.find((a) => a.id === alert.assetId)
      if (!asset) return

      if (
        (alert.condition === "above" && asset.price >= alert.targetPrice) ||
        (alert.condition === "below" && asset.price <= alert.targetPrice)
      ) {
        triggeredAlerts.push(alert)
      }
    })

    if (triggeredAlerts.length > 0) {
      // Update triggered alerts
      setPriceAlerts((prev) =>
        prev.map((alert) => {
          const triggered = triggeredAlerts.find((a) => a.id === alert.id)
          if (triggered) {
            return { ...alert, triggered: true, active: alert.repeating }
          }
          return alert
        }),
      )

      // Show notification for first triggered alert
      if (triggeredAlerts.length === 1) {
        const alert = triggeredAlerts[0]
        const asset = cryptoAssets.find((a) => a.id === alert.assetId)
        showNotificationWithTimeout(
          `Price Alert: ${asset?.symbol} is now ${alert.condition === "above" ? "above" : "below"} $${alert.targetPrice}`,
          "warning",
        )
      } else {
        showNotificationWithTimeout(`${triggeredAlerts.length} price alerts triggered!`, "warning")
      }
    }
  }

  // Toggle watchlist
  const toggleWatchlist = (assetId: string) => {
    setWatchlist((prev) => (prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]))

    const asset = cryptoAssets.find((a) => a.id === assetId)
    if (asset) {
      showNotificationWithTimeout(
        watchlist.includes(assetId) ? `${asset.symbol} removed from watchlist` : `${asset.symbol} added to watchlist`,
        "info",
      )
    }
  }

  // Show notification with auto-dismiss
  const showNotificationWithTimeout = (message: string, type: "success" | "error" | "warning" | "info") => {
    setNotificationMessage(message)
    setNotificationType(type)
    setShowNotification(true)

    setTimeout(() => {
      setShowNotification(false)
    }, 5000)
  }

  // Format price with appropriate precision
  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`
    } else if (price < 1) {
      return `$${price.toFixed(4)}`
    } else if (price < 100) {
      return `$${price.toFixed(2)}`
    } else {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    }
  }

  // Format large numbers
  const formatLargeNumber = (num: number) => {
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

  // Get change value based on selected timeframe
  const getChangeValue = (asset: CryptoAsset) => {
    switch (selectedTimeframe) {
      case "1h":
        return asset.change1h
      case "24h":
        return asset.change24h
      case "7d":
        return asset.change7d
      default:
        return asset.change24h
    }
  }

  // Filter assets based on search
  const getFilteredAssets = () => {
    let filtered = cryptoAssets

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Activity className="w-6 h-6 text-black" />
          </div>
          <p className="text-cyan-400">Loading crypto dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">W</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cyan-400">Crypto Dashboard</h1>
                <p className="text-sm text-slate-400">Live Tracking • Real Assets • Minute Updates</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-xs text-slate-400 hidden md:block">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={updatePrices}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Notification */}
        {showNotification && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              notificationType === "success"
                ? "bg-green-500/20 border border-green-500/30"
                : notificationType === "error"
                  ? "bg-red-500/20 border border-red-500/30"
                  : notificationType === "warning"
                    ? "bg-yellow-500/20 border border-yellow-500/30"
                    : "bg-blue-500/20 border border-blue-500/30"
            }`}
          >
            {notificationType === "success" && <Check className="w-5 h-5 text-green-400" />}
            {notificationType === "error" && <X className="w-5 h-5 text-red-400" />}
            {notificationType === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
            {notificationType === "info" && <Info className="w-5 h-5 text-blue-400" />}
            <p
              className={`text-sm ${
                notificationType === "success"
                  ? "text-green-400"
                  : notificationType === "error"
                    ? "text-red-400"
                    : notificationType === "warning"
                      ? "text-yellow-400"
                      : "text-blue-400"
              }`}
            >
              {notificationMessage}
            </p>
          </div>
        )}

        {/* Portfolio Overview */}
        {portfolio && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {showBalances ? formatPrice(portfolio.totalValueUsd) : "••••••"}
                </div>
                <div
                  className={`flex items-center text-sm ${portfolio.totalProfitLossPercentage >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {portfolio.totalProfitLossPercentage >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {portfolio.totalProfitLossPercentage.toFixed(2)}% (${portfolio.totalProfitLoss.toFixed(2)})
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-400">{portfolio.holdings.length}</div>
                <div className="text-sm text-slate-400">Assets tracked</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Best Performer</CardTitle>
              </CardHeader>
              <CardContent>
                {portfolio.holdings.length > 0 && (
                  <>
                    <div className="text-3xl font-bold text-green-400">
                      {
                        portfolio.holdings.reduce((best, current) =>
                          current.profitLossPercentage > best.profitLossPercentage ? current : best,
                        ).symbol
                      }
                    </div>
                    <div className="text-sm text-slate-400">
                      +
                      {portfolio.holdings
                        .reduce((best, current) =>
                          current.profitLossPercentage > best.profitLossPercentage ? current : best,
                        )
                        .profitLossPercentage.toFixed(2)}
                      % gain
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Market Status</CardTitle>
              </CardHeader>
              <CardContent>
                {marketData && (
                  <>
                    <div className="text-3xl font-bold text-yellow-400">{marketData.fearGreedLabel}</div>
                    <div className="text-sm text-slate-400">Fear & Greed: {marketData.fearGreedIndex}/100</div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="assets" className="space-y-6">
          <TabsList className="bg-black/40 border border-slate-700">
            <TabsTrigger value="assets" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <Activity className="w-4 h-4 mr-2" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <Wallet className="w-4 h-4 mr-2" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <Star className="w-4 h-4 mr-2" />
              Watchlist
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/40 border-slate-700 text-white"
                />
              </div>
              <div className="flex space-x-2">
                {["1h", "24h", "7d"].map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={selectedTimeframe === timeframe ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={
                      selectedTimeframe === timeframe
                        ? "bg-cyan-500 text-black"
                        : "border-slate-600 text-slate-300 hover:bg-slate-800"
                    }
                  >
                    {timeframe}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {getFilteredAssets().map((asset) => (
                <Card
                  key={asset.id}
                  className="bg-black/40 border-slate-700 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                            {typeof asset.logo === "string" && asset.logo.startsWith("http") ? (
                              <img src={asset.logo || "/placeholder.svg"} alt={asset.symbol} className="w-8 h-8" />
                            ) : (
                              <span className="text-lg">{asset.logo}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-white">{asset.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                #{asset.rank}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400">{asset.symbol}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">{formatPrice(asset.price)}</div>
                          <div className={`text-sm ${getChangeValue(asset) >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {getChangeValue(asset) >= 0 ? "+" : ""}
                            {getChangeValue(asset).toFixed(2)}% ({selectedTimeframe})
                          </div>
                        </div>

                        <div className="text-right text-sm text-slate-400 hidden md:block">
                          <div>Vol: {formatLargeNumber(asset.volume24h)}</div>
                          <div>MCap: {formatLargeNumber(asset.marketCap)}</div>
                        </div>

                        <div className="text-right text-sm text-slate-400 hidden lg:block">
                          <div>H: {formatPrice(asset.high24h)}</div>
                          <div>L: {formatPrice(asset.low24h)}</div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleWatchlist(asset.id)}
                            className={`h-8 w-8 p-0 ${
                              watchlist.includes(asset.id) ? "text-yellow-400" : "text-slate-400"
                            }`}
                          >
                            <Star className="w-4 h-4" fill={watchlist.includes(asset.id) ? "currentColor" : "none"} />
                          </Button>

                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            {portfolio ? (
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Portfolio Holdings</CardTitle>
                  <CardDescription className="text-slate-400">Your current cryptocurrency positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {portfolio.holdings.map((holding, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{holding.logo}</span>
                          <div>
                            <div className="font-medium text-white">{holding.name}</div>
                            <div className="text-sm text-slate-400">{holding.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-white">
                            {showBalances ? `${holding.amount} ${holding.symbol}` : "••••••"}
                          </div>
                          <div className="text-sm text-slate-400">
                            {showBalances ? `$${holding.valueUsd.toLocaleString()}` : "••••••"}
                          </div>
                        </div>
                        <div
                          className={`text-right ${holding.profitLossPercentage >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          <div className="font-medium">
                            {holding.profitLossPercentage >= 0 ? "+" : ""}
                            {holding.profitLossPercentage.toFixed(2)}%
                          </div>
                          <div className="text-sm">P&L</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wallet className="w-16 h-16 text-slate-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Portfolio Data</h3>
                  <p className="text-slate-400 text-center mb-6">Add manual holdings to track your portfolio.</p>
                  <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Holdings
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Watchlist Tab */}
          <TabsContent value="watchlist" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Watchlist</CardTitle>
                <CardDescription className="text-slate-400">Your favorite cryptocurrencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {cryptoAssets
                    .filter((asset) => watchlist.includes(asset.id))
                    .map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{asset.logo}</span>
                          <div>
                            <div className="font-medium text-white">{asset.name}</div>
                            <div className="text-sm text-slate-400">{asset.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-white">{formatPrice(asset.price)}</div>
                          <div className={`text-sm ${asset.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {asset.change24h >= 0 ? "+" : ""}
                            {asset.change24h.toFixed(2)}%
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWatchlist(asset.id)}
                          className="h-8 w-8 p-0 text-yellow-400"
                        >
                          <Star className="w-4 h-4" fill="currentColor" />
                        </Button>
                      </div>
                    ))}
                  {watchlist.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      No assets in watchlist. Add some from the Assets tab.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Price Alerts</CardTitle>
                <CardDescription className="text-slate-400">Get notified when prices hit your targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {priceAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Bell className={`w-5 h-5 ${alert.active ? "text-yellow-400" : "text-slate-600"}`} />
                        <div>
                          <div className="font-medium text-white">{alert.symbol}</div>
                          <div className="text-sm text-slate-400">
                            Alert when {alert.condition} ${alert.targetPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={alert.active ? "bg-green-500" : "bg-slate-600"}>
                          {alert.active ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Alert
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
