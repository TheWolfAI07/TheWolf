"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Plus,
  Filter,
  Search,
  BarChart3,
  PieChart,
  Activity,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface WalletData {
  id: string
  name: string
  network: string
  address: string
  balance: number
  usdValue: number
  change24h: number
  tokens: TokenBalance[]
  connected: boolean
}

interface TokenBalance {
  symbol: string
  name: string
  balance: number
  usdValue: number
  change24h: number
  logo: string
}

interface Transaction {
  id: string
  hash: string
  type: "send" | "receive" | "swap" | "stake"
  asset: string
  amount: number
  usdValue: number
  status: "pending" | "confirmed" | "failed"
  timestamp: string
  from: string
  to: string
  gasUsed?: number
}

interface CryptoPrice {
  symbol: string
  name: string
  price: number
  change: number
  volume: string
  marketCap: string
  logo: string
}

export default function CryptoDashboard() {
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedWallet, setSelectedWallet] = useState<string>("all")
  const [showBalances, setShowBalances] = useState(true)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isConnected, setIsConnected] = useState(false)
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: 43250,
      change: 2.5,
      volume: "28.5B",
      marketCap: "845B",
      logo: "₿",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: 2650,
      change: -1.2,
      volume: "15.2B",
      marketCap: "318B",
      logo: "Ξ",
    },
    {
      symbol: "USDT",
      name: "Tether",
      price: 1.0,
      change: 0.1,
      volume: "45.8B",
      marketCap: "91.2B",
      logo: "₮",
    },
    {
      symbol: "BNB",
      name: "Binance Coin",
      price: 315,
      change: 3.8,
      volume: "2.1B",
      marketCap: "47.2B",
      logo: "🔶",
    },
    {
      symbol: "SOL",
      name: "Solana",
      price: 98,
      change: 5.2,
      volume: "3.8B",
      marketCap: "42.1B",
      logo: "◎",
    },
    {
      symbol: "ADA",
      name: "Cardano",
      price: 0.52,
      change: -2.1,
      volume: "1.2B",
      marketCap: "18.3B",
      logo: "₳",
    },
  ])

  // Mock wallet data
  const mockWallet: WalletData = {
    id: "demo-wallet",
    name: "Demo Wallet",
    network: "Ethereum",
    address: "0x742d35Cc6634C0532925a3b8D4C9db96590e4265",
    balance: 2.5,
    usdValue: 6625,
    change24h: 1.8,
    connected: true,
    tokens: [
      {
        symbol: "ETH",
        name: "Ethereum",
        balance: 2.5,
        usdValue: 6625,
        change24h: -1.2,
        logo: "Ξ",
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        balance: 1500,
        usdValue: 1500,
        change24h: 0.1,
        logo: "💵",
      },
      {
        symbol: "UNI",
        name: "Uniswap",
        balance: 25,
        usdValue: 175,
        change24h: 4.2,
        logo: "🦄",
      },
    ],
  }

  // Mock transactions
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      hash: "0x1234...5678",
      type: "receive",
      asset: "ETH",
      amount: 0.5,
      usdValue: 1325,
      status: "confirmed",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      from: "0xabcd...efgh",
      to: "0x742d...4265",
    },
    {
      id: "2",
      hash: "0x5678...9abc",
      type: "send",
      asset: "USDC",
      amount: 100,
      usdValue: 100,
      status: "confirmed",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      from: "0x742d...4265",
      to: "0xdef0...1234",
    },
    {
      id: "3",
      hash: "0x9abc...def0",
      type: "swap",
      asset: "UNI",
      amount: 10,
      usdValue: 70,
      status: "pending",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      from: "0x742d...4265",
      to: "0x742d...4265",
    },
  ]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
      setTransactions(mockTransactions)
      if (isConnected) {
        setWallets([mockWallet])
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [isConnected])

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptoPrices((prev) =>
        prev.map((coin) => ({
          ...coin,
          price: coin.price + (Math.random() - 0.5) * coin.price * 0.02,
          change: (Math.random() - 0.5) * 10,
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const totalPortfolioValue = wallets.reduce((sum, wallet) => sum + wallet.usdValue, 0)
  const totalChange24h = wallets.reduce((sum, wallet) => sum + (wallet.usdValue * wallet.change24h) / 100, 0)
  const totalChangePercent = totalPortfolioValue > 0 ? (totalChange24h / totalPortfolioValue) * 100 : 0

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleConnectWallet = () => {
    setIsConnected(true)
    setWallets([mockWallet])
  }

  const handleDisconnectWallet = () => {
    setIsConnected(false)
    setWallets([])
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Wallet className="w-6 h-6 text-black" />
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
                <p className="text-sm text-slate-400">Portfolio • Wallets • Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBalances(!showBalances)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                {showBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync
              </Button>
              <Button
                size="sm"
                onClick={() => (isConnected ? handleDisconnectWallet() : handleConnectWallet())}
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isConnected ? "Disconnect" : "Connect Wallet"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Live Crypto Prices */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Live Crypto Prices</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {cryptoPrices.map((coin) => (
              <Card key={coin.symbol} className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{coin.logo}</span>
                      <span className="font-medium text-cyan-400">{coin.symbol}</span>
                    </div>
                    {coin.change >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-white">
                      ${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </div>
                    <div className={`text-sm ${coin.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {coin.change >= 0 ? "+" : ""}
                      {coin.change.toFixed(2)}%
                    </div>
                    <div className="text-xs text-slate-400">Vol: {coin.volume}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Portfolio Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {showBalances ? `$${totalPortfolioValue.toLocaleString()}` : "••••••"}
              </div>
              <div
                className={`flex items-center text-sm ${totalChangePercent >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {totalChangePercent >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                )}
                {totalChangePercent.toFixed(2)}% (24h)
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Connected Wallets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-400">{wallets.filter((w) => w.connected).length}</div>
              <div className="text-sm text-slate-400">of {wallets.length || 1} total</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">24h P&L</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${totalChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                {showBalances ? `${totalChange24h >= 0 ? "+" : ""}$${totalChange24h.toFixed(2)}` : "••••••"}
              </div>
              <div className="text-sm text-slate-400">Unrealized</div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">
                {wallets.reduce((sum, wallet) => sum + wallet.tokens.length, 0)}
              </div>
              <div className="text-sm text-slate-400">Across all wallets</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="wallets" className="space-y-6">
          <TabsList className="bg-black/40 border border-slate-700">
            <TabsTrigger value="wallets" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <Wallet className="w-4 h-4 mr-2" />
              Wallets
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black"
            >
              <Activity className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Wallets Tab */}
          <TabsContent value="wallets" className="space-y-6">
            {!isConnected ? (
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wallet className="w-16 h-16 text-slate-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Wallet Connected</h3>
                  <p className="text-slate-400 text-center mb-6">
                    Connect your wallet to view your portfolio and manage your crypto assets.
                  </p>
                  <Button
                    onClick={handleConnectWallet}
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Connect Demo Wallet
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {wallets.map((wallet) => (
                  <Card
                    key={wallet.id}
                    className="bg-black/40 border-slate-700 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                            <CardTitle className="text-white">{wallet.name}</CardTitle>
                            <CardDescription className="text-slate-400">{wallet.network}</CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant={wallet.connected ? "default" : "secondary"}
                          className={wallet.connected ? "bg-green-500" : "bg-slate-600"}
                        >
                          {wallet.connected ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Wallet Balance */}
                      <div className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-400">Total Balance</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Copy className="w-3 h-3 text-slate-400" />
                          </Button>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {showBalances ? `${wallet.balance.toFixed(4)} ETH` : "••••••"}
                        </div>
                        <div
                          className={`flex items-center text-sm ${wallet.change24h >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {wallet.change24h >= 0 ? (
                            <TrendingUp className="w-4 h-4 mr-1" />
                          ) : (
                            <TrendingDown className="w-4 h-4 mr-1" />
                          )}
                          {wallet.change24h >= 0 ? "+" : ""}
                          {wallet.change24h.toFixed(2)}% (24h)
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                        <span className="text-sm text-slate-400 font-mono">{truncateAddress(wallet.address)}</span>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Copy className="w-3 h-3 text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </Button>
                        </div>
                      </div>

                      {/* Token Holdings */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-slate-300">Holdings</h4>
                        {wallet.tokens.map((token, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{token.logo}</span>
                              <div>
                                <div className="text-sm font-medium text-white">{token.symbol}</div>
                                <div className="text-xs text-slate-400">{token.name}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-white">
                                {showBalances ? token.balance.toFixed(4) : "••••"}
                              </div>
                              <div className="text-xs text-slate-400">
                                {showBalances ? `$${token.usdValue.toLocaleString()}` : "••••"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-black">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Transaction History</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64 bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              tx.type === "receive"
                                ? "bg-green-500/20"
                                : tx.type === "send"
                                  ? "bg-red-500/20"
                                  : tx.type === "swap"
                                    ? "bg-blue-500/20"
                                    : "bg-purple-500/20"
                            }`}
                          >
                            {tx.type === "receive" ? (
                              <ArrowDownRight className="w-5 h-5 text-green-400" />
                            ) : tx.type === "send" ? (
                              <ArrowUpRight className="w-5 h-5 text-red-400" />
                            ) : tx.type === "swap" ? (
                              <RefreshCw className="w-5 h-5 text-blue-400" />
                            ) : (
                              <Activity className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-white capitalize">{tx.type}</span>
                              <span className="text-cyan-400">{tx.asset}</span>
                            </div>
                            <div className="text-sm text-slate-400">{new Date(tx.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="font-medium text-white">
                              {tx.type === "receive" ? "+" : "-"}
                              {tx.amount} {tx.asset}
                            </div>
                            <div className="text-sm text-slate-400">${tx.usdValue.toLocaleString()}</div>
                          </div>
                          <Badge
                            variant={
                              tx.status === "confirmed"
                                ? "default"
                                : tx.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={
                              tx.status === "confirmed"
                                ? "bg-green-500"
                                : tx.status === "pending"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            }
                          >
                            {tx.status}
                          </Badge>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      {isConnected ? "No transactions found." : "Connect your wallet to view transactions."}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Portfolio Allocation */}
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChart className="w-5 h-5 mr-2 text-cyan-400" />
                    Portfolio Allocation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wallets.length > 0 ? (
                      wallets.map((wallet, index) => {
                        const percentage = totalPortfolioValue > 0 ? (wallet.usdValue / totalPortfolioValue) * 100 : 0
                        return (
                          <div key={wallet.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-300">{wallet.name}</span>
                              <span className="text-white">{percentage.toFixed(1)}%</span>
                            </div>
                            <Progress
                              value={percentage}
                              className="h-2"
                              style={{
                                background: "rgb(30 41 59)",
                              }}
                            />
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        Connect your wallet to view portfolio allocation.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-300">Best Performer (24h)</span>
                      <div className="text-right">
                        <div className="text-green-400 font-medium">SOL</div>
                        <div className="text-sm text-slate-400">+5.2%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-300">Network</span>
                      <div className="text-right">
                        <div className="text-cyan-400 font-medium">Ethereum</div>
                        <div className="text-sm text-slate-400">Current chain</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg">
                      <span className="text-slate-300">Wallet Status</span>
                      <div className="text-right">
                        <div className={`font-medium ${isConnected ? "text-green-400" : "text-red-400"}`}>
                          {isConnected ? "Connected" : "Disconnected"}
                        </div>
                        <div className="text-sm text-slate-400">{isConnected ? "Active" : "Inactive"}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Wallet Settings</CardTitle>
                <CardDescription className="text-slate-400">
                  Configure your wallet connections and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Connection Status</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Demo Wallet Connection</div>
                      <div className="text-sm text-slate-400">
                        {isConnected ? "Connected to Ethereum" : "No wallet connected"}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className={`${isConnected ? "border-red-500 text-red-400" : "border-cyan-500 text-cyan-400"}`}
                      onClick={() => (isConnected ? handleDisconnectWallet() : handleConnectWallet())}
                    >
                      {isConnected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">Display Settings</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Show Balances</div>
                      <div className="text-sm text-slate-400">Display wallet balances and amounts</div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-cyan-500 text-cyan-400"
                      onClick={() => setShowBalances(!showBalances)}
                    >
                      {showBalances ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>

                {isConnected && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Connected Wallet</h3>
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg flex items-center justify-center">
                          <Wallet className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <div className="text-white font-medium">Demo Wallet</div>
                          <div className="text-sm text-slate-400">{truncateAddress(mockWallet.address)}</div>
                        </div>
                      </div>
                      <Badge className="bg-green-500">Connected</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
