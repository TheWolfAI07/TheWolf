"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { WalletConnector, type WalletConnection, type TokenData } from "@/lib/wallet-connector"
import { CryptoAPI, type CryptoPrice, type MarketData } from "@/lib/crypto-api"
import {
  Wallet,
  Eye,
  EyeOff,
  Activity,
  ArrowLeft,
  Search,
  RefreshCw,
  ExternalLink,
  Copy,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
} from "lucide-react"
import Link from "next/link"

// Real token addresses on Ethereum mainnet
const POPULAR_TOKENS = {
  ethereum: [
    { address: "0xA0b86a33E6441b8C4505B7C0c5b2C8b5F5F5F5F5", symbol: "USDC", name: "USD Coin" },
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", name: "Tether USD" },
    { address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", symbol: "UNI", name: "Uniswap" },
    { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", symbol: "LINK", name: "Chainlink" },
    { address: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", symbol: "MATIC", name: "Polygon" },
  ],
}

export default function CryptoDashboard() {
  const { toast } = useToast()
  const [walletConnector] = useState(() => WalletConnector.getInstance())

  // State
  const [connection, setConnection] = useState<WalletConnection | null>(null)
  const [cryptoData, setCryptoData] = useState<CryptoPrice[]>([])
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [userTokens, setUserTokens] = useState<TokenData[]>([])
  const [showBalances, setShowBalances] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h")
  const [activeTab, setActiveTab] = useState("market")
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Memoized filtered cryptos
  const filteredCryptos = useMemo(() => {
    if (!searchTerm) return cryptoData

    const term = searchTerm.toLowerCase()
    return cryptoData.filter(
      (crypto) =>
        crypto.name.toLowerCase().includes(term) ||
        crypto.symbol.toLowerCase().includes(term) ||
        crypto.id.toLowerCase().includes(term),
    )
  }, [cryptoData, searchTerm])

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Initialize data
  useEffect(() => {
    loadMarketData()

    // Set up wallet connection listener
    const unsubscribe = walletConnector.onConnectionChange((newConnection) => {
      setConnection(newConnection)
      if (newConnection) {
        loadUserTokens(newConnection)
      } else {
        setUserTokens([])
      }
    })

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (isOnline && !refreshing) {
        loadMarketData(true)
      }
    }, 30000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [walletConnector, isOnline, refreshing])

  const loadMarketData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true)
        }
        setError(null)

        if (!isOnline) {
          throw new Error("No internet connection")
        }

        const [cryptos, market] = await Promise.all([
          CryptoAPI.getTopCryptocurrencies(50),
          CryptoAPI.getGlobalMarketData(),
        ])

        setCryptoData(cryptos || [])
        setMarketData(market)
        setLastUpdated(new Date())

        if (cryptos.length === 0) {
          setError("No cryptocurrency data available. Please try again later.")
        }
      } catch (error: any) {
        console.error("Error loading market data:", error)
        const errorMessage = error.message || "Failed to load market data"
        setError(errorMessage)

        if (!silent) {
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      } finally {
        if (!silent) {
          setLoading(false)
        }
      }
    },
    [isOnline, toast],
  )

  const loadUserTokens = useCallback(
    async (walletConnection: WalletConnection) => {
      try {
        const tokens = POPULAR_TOKENS.ethereum
        const tokenPromises = tokens.map(async (token) => {
          try {
            const tokenData = await walletConnector.getTokenBalance(token.address, walletConnection.address)
            // Only return tokens with non-zero balance
            return Number.parseFloat(tokenData.balanceFormatted) > 0 ? tokenData : null
          } catch (error) {
            console.warn(`Failed to load token ${token.symbol}:`, error)
            return null
          }
        })

        const tokenData = await Promise.all(tokenPromises)
        const validTokens = tokenData.filter((token): token is TokenData => token !== null)

        setUserTokens(validTokens)
      } catch (error: any) {
        console.error("Failed to load user tokens:", error)
        toast({
          title: "Token Loading Error",
          description: "Some tokens could not be loaded",
          variant: "destructive",
        })
      }
    },
    [walletConnector, toast],
  )

  const connectWallet = useCallback(
    async (type: "metamask" | "walletconnect") => {
      try {
        setLoading(true)
        let connection: WalletConnection

        if (type === "metamask") {
          connection = await walletConnector.connectMetaMask()
        } else {
          connection = await walletConnector.connectWalletConnect()
        }

        const displayAddress =
          connection.ensName || `${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`

        toast({
          title: "Wallet Connected",
          description: `Connected to ${displayAddress}`,
        })

        setActiveTab("portfolio")
      } catch (error: any) {
        console.error("Wallet connection error:", error)
        toast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    },
    [walletConnector, toast],
  )

  const disconnectWallet = useCallback(async () => {
    try {
      await walletConnector.disconnect()
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      })
      setActiveTab("market")
    } catch (error: any) {
      console.error("Disconnect error:", error)
    }
  }, [walletConnector, toast])

  const refreshData = useCallback(async () => {
    try {
      setRefreshing(true)
      await loadMarketData()
      if (connection) {
        await loadUserTokens(connection)
      }

      toast({
        title: "Data Refreshed",
        description: "Market data and portfolio updated",
      })
    } catch (error: any) {
      toast({
        title: "Refresh Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }, [loadMarketData, connection, loadUserTokens, toast])

  const copyAddress = useCallback(
    (address: string) => {
      try {
        navigator.clipboard.writeText(address)
        toast({
          title: "Address Copied",
          description: "Wallet address copied to clipboard",
        })
      } catch (error) {
        console.error("Copy failed:", error)
        toast({
          title: "Copy Failed",
          description: "Could not copy address to clipboard",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const switchNetwork = useCallback(
    async (chainId: number) => {
      try {
        await walletConnector.switchNetwork(chainId)
        toast({
          title: "Network Switched",
          description: `Switched to ${getNetworkName(chainId)}`,
        })
      } catch (error: any) {
        console.error("Network switch error:", error)
        toast({
          title: "Network Switch Failed",
          description: error.message,
          variant: "destructive",
        })
      }
    },
    [walletConnector, toast],
  )

  const getChangeValue = useCallback(
    (crypto: CryptoPrice) => {
      switch (selectedTimeframe) {
        case "1h":
          return crypto.price_change_percentage_1h_in_currency || 0
        case "24h":
          return crypto.price_change_percentage_24h || 0
        case "7d":
          return crypto.price_change_percentage_7d_in_currency || 0
        default:
          return crypto.price_change_percentage_24h || 0
      }
    },
    [selectedTimeframe],
  )

  const getTotalPortfolioValue = useCallback(() => {
    if (!connection) return 0

    const ethPrice = cryptoData.find((c) => c.symbol.toLowerCase() === "eth")?.current_price || 0
    const ethValue = Number.parseFloat(connection.balance) * ethPrice
    const tokenValue = userTokens.reduce((sum, token) => sum + (token.valueUSD || 0), 0)

    return ethValue + tokenValue
  }, [connection, cryptoData, userTokens])

  const getNetworkName = useCallback((chainId: number) => {
    switch (chainId) {
      case 1:
        return "Ethereum"
      case 137:
        return "Polygon"
      case 42161:
        return "Arbitrum"
      case 56:
        return "BSC"
      default:
        return `Chain ${chainId}`
    }
  }, [])

  const formatTimeAgo = useCallback((date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }, [])

  if (loading && !cryptoData.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-cyan-400">Loading live crypto data...</p>
          <p className="text-slate-500 text-sm mt-2">Connecting to CoinGecko API...</p>
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
                <span className="text-black font-bold text-sm">₿</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cyan-400">Live Crypto Dashboard</h1>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <span>Real-time prices • Live wallet integration</span>
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Updated {formatTimeAgo(lastUpdated)}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={refreshing || !isOnline}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <Card className="bg-red-950/50 border-red-800 mb-6">
            <CardContent className="flex items-center space-x-3 p-4">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-400 font-medium">Error</p>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMarketData()}
                disabled={!isOnline}
                className="border-red-600 text-red-400 hover:bg-red-950"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Offline Notice */}
        {!isOnline && (
          <Card className="bg-yellow-950/50 border-yellow-800 mb-6">
            <CardContent className="flex items-center space-x-3 p-4">
              <WifiOff className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-medium">Offline</p>
                <p className="text-yellow-300 text-sm">You're currently offline. Data may be outdated.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Overview */}
        {marketData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Total Market Cap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {CryptoAPI.formatLargeNumber(marketData.total_market_cap.usd)}
                </div>
                <div className="text-sm text-slate-400">BTC: {marketData.market_cap_percentage.btc.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">24h Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-400">
                  {CryptoAPI.formatLargeNumber(marketData.total_volume.usd)}
                </div>
                <div className="text-sm text-slate-400">ETH: {marketData.market_cap_percentage.eth.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Active Cryptos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {marketData.active_cryptocurrencies.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">Markets: {marketData.markets.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {connection && showBalances
                    ? CryptoAPI.formatPrice(getTotalPortfolioValue())
                    : connection
                      ? "••••••"
                      : "$0.00"}
                </div>
                <div className="text-sm text-slate-400">
                  {connection ? (
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                      Connected
                    </span>
                  ) : (
                    "Not connected"
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-black/40 border border-slate-700">
            <TabsTrigger value="market" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <TrendingUp className="w-4 h-4 mr-2" />
              Market ({filteredCryptos.length})
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <Wallet className="w-4 h-4 mr-2" />
              Portfolio
              {connection && userTokens.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {userTokens.length + 1}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Market Tab */}
          <TabsContent value="market" className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search cryptocurrencies..."
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
              {filteredCryptos.length > 0 ? (
                filteredCryptos.map((crypto) => (
                  <Card
                    key={crypto.id}
                    className="bg-black/40 border-slate-700 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={crypto.image || "/placeholder.svg"}
                              alt={crypto.name}
                              className="w-10 h-10 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=40&width=40"
                              }}
                            />
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-white">{crypto.name}</h3>
                                <Badge variant="outline" className="text-xs">
                                  #{crypto.market_cap_rank}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-400">{crypto.symbol.toUpperCase()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">
                              {CryptoAPI.formatPrice(crypto.current_price)}
                            </div>
                            <div
                              className={`text-sm flex items-center ${
                                getChangeValue(crypto) >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {getChangeValue(crypto) >= 0 ? (
                                <TrendingUp className="w-3 h-3 mr-1" />
                              ) : (
                                <TrendingDown className="w-3 h-3 mr-1" />
                              )}
                              {CryptoAPI.formatPercentage(getChangeValue(crypto))} ({selectedTimeframe})
                            </div>
                          </div>

                          <div className="text-right text-sm text-slate-400 hidden lg:block">
                            <div>Vol: {CryptoAPI.formatLargeNumber(crypto.total_volume)}</div>
                            <div>MCap: {CryptoAPI.formatLargeNumber(crypto.market_cap)}</div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:bg-slate-800"
                            onClick={() => window.open(`https://www.coingecko.com/en/coins/${crypto.id}`, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="w-16 h-16 text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
                    <p className="text-slate-400 text-center">
                      {searchTerm
                        ? `No cryptocurrencies found for "${searchTerm}"`
                        : "No cryptocurrency data available"}
                    </p>
                    {searchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="mt-4 border-slate-600 text-slate-300"
                      >
                        Clear Search
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            {!connection ? (
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wallet className="w-16 h-16 text-slate-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-slate-400 text-center mb-6 max-w-md">
                    Connect your wallet to view your live portfolio, track token balances, and interact with DeFi
                    protocols
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <Button
                      onClick={() => connectWallet("metamask")}
                      disabled={loading}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Wallet className="w-5 h-5 mr-2" />
                      )}
                      Connect MetaMask
                    </Button>
                    <Button
                      onClick={() => connectWallet("walletconnect")}
                      disabled={loading}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Wallet className="w-5 h-5 mr-2" />
                      )}
                      WalletConnect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Wallet Info */}
                <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">Connected Wallet</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={disconnectWallet}
                        className="border-red-600 text-red-400 hover:bg-red-950"
                      >
                        Disconnect
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-mono">
                            {connection.ensName ||
                              `${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyAddress(connection.address)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-sm text-slate-400">Network: {getNetworkName(connection.chainId)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {showBalances ? `${Number.parseFloat(connection.balance).toFixed(4)} ETH` : "••••••"}
                        </div>
                        <div className="text-sm text-slate-400">
                          {showBalances
                            ? CryptoAPI.formatPrice(
                                Number.parseFloat(connection.balance) *
                                  (cryptoData.find((c) => c.symbol.toLowerCase() === "eth")?.current_price || 0),
                              )
                            : "••••••"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Network Switcher */}
                <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Switch Network</CardTitle>
                    <CardDescription className="text-slate-400">
                      Switch between different blockchain networks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { id: 1, name: "Ethereum", color: "bg-blue-500" },
                        { id: 137, name: "Polygon", color: "bg-purple-500" },
                        { id: 42161, name: "Arbitrum", color: "bg-cyan-500" },
                        { id: 56, name: "BSC", color: "bg-yellow-500" },
                      ].map((network) => (
                        <Button
                          key={network.id}
                          variant={connection.chainId === network.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => switchNetwork(network.id)}
                          className={
                            connection.chainId === network.id
                              ? `${network.color} text-white`
                              : "border-slate-600 text-slate-300 hover:bg-slate-800"
                          }
                        >
                          {network.name}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Token Holdings */}
                <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white">Token Holdings</CardTitle>
                    <CardDescription className="text-slate-400">
                      Your cryptocurrency balances on {getNetworkName(connection.chainId)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* ETH Balance */}
                      <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">ETH</span>
                          </div>
                          <div>
                            <div className="font-medium text-white">Ethereum</div>
                            <div className="text-sm text-slate-400">ETH</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-white">
                            {showBalances ? `${Number.parseFloat(connection.balance).toFixed(4)} ETH` : "••••••"}
                          </div>
                          <div className="text-sm text-slate-400">
                            {showBalances
                              ? CryptoAPI.formatPrice(
                                  Number.parseFloat(connection.balance) *
                                    (cryptoData.find((c) => c.symbol.toLowerCase() === "eth")?.current_price || 0),
                                )
                              : "••••••"}
                          </div>
                        </div>
                      </div>

                      {/* ERC-20 Tokens */}
                      {userTokens.map((token, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold">{token.symbol.slice(0, 2)}</span>
                            </div>
                            <div>
                              <div className="font-medium text-white">{token.name}</div>
                              <div className="text-sm text-slate-400">{token.symbol}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-white">
                              {showBalances
                                ? `${Number.parseFloat(token.balanceFormatted).toFixed(4)} ${token.symbol}`
                                : "••••••"}
                            </div>
                            <div className="text-sm text-slate-400">
                              {showBalances ? CryptoAPI.formatPrice(token.valueUSD) : "••••••"}
                            </div>
                          </div>
                        </div>
                      ))}

                      {userTokens.length === 0 && (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                          <p className="text-slate-400">No ERC-20 tokens found</p>
                          <p className="text-slate-500 text-sm mt-2">
                            Only tokens with non-zero balances are displayed
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
