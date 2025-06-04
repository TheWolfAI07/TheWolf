"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Target,
  Crown,
  Zap,
  Eye,
  Activity,
  Star,
  Shield,
  Rocket,
  Brain,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { CryptoAPI, type CryptoPrice } from "@/lib/crypto-api"
import Link from "next/link"

interface ProfitTip {
  id: string
  title: string
  description: string
  confidence: number
  timeframe: string
  potentialGain: string
  riskLevel: "low" | "medium" | "high"
  category: "technical" | "fundamental" | "market" | "news"
  timestamp: Date
}

interface WolfTarget {
  id: string
  name: string
  type: "crypto" | "business" | "personal" | "financial"
  target: number
  current: number
  unit: string
  deadline: string
  priority: "low" | "medium" | "high" | "critical"
  progress: number
}

export default function HomePage() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [cryptoData, setCryptoData] = useState<CryptoPrice[]>([])
  const [profitTips, setProfitTips] = useState<ProfitTip[]>([])
  const [wolfTargets, setWolfTargets] = useState<WolfTarget[]>([])
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [marketData, setMarketData] = useState<any>(null)
  const [topMovers, setTopMovers] = useState<{ gainers: CryptoPrice[]; losers: CryptoPrice[] }>({
    gainers: [],
    losers: [],
  })

  const tipSliderRef = useRef<NodeJS.Timeout | null>(null)

  // Real-time clock
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(clockInterval)
  }, [])

  // Load real crypto data
  const loadRealCryptoData = async () => {
    try {
      setLoading(true)

      // Get top cryptocurrencies
      const cryptos = await CryptoAPI.getTopCryptocurrencies(50)
      setCryptoData(cryptos)

      // Get global market data
      const market = await CryptoAPI.getGlobalMarketData()
      setMarketData(market)

      // Identify top movers (real data analysis)
      const gainers = cryptos
        .filter((c) => c.price_change_percentage_24h > 0)
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, 5)

      const losers = cryptos
        .filter((c) => c.price_change_percentage_24h < 0)
        .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
        .slice(0, 5)

      setTopMovers({ gainers, losers })

      // Generate real profit tips based on market analysis
      generateRealProfitTips(cryptos, market)
    } catch (error) {
      console.error("Failed to load crypto data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Generate real profit tips based on actual market data
  const generateRealProfitTips = (cryptos: CryptoPrice[], market: any) => {
    const tips: ProfitTip[] = []

    // Analyze real market conditions for legitimate insights
    cryptos.forEach((crypto) => {
      // High volume + positive momentum
      if (crypto.total_volume > 1000000000 && crypto.price_change_percentage_24h > 5) {
        tips.push({
          id: `tip-${crypto.id}-volume`,
          title: `${crypto.name} High Volume Momentum`,
          description: `${crypto.symbol.toUpperCase()} showing strong volume (${CryptoAPI.formatLargeNumber(crypto.total_volume)}) with +${crypto.price_change_percentage_24h.toFixed(2)}% gain. High volume often precedes continued movement.`,
          confidence: Math.min(85, 60 + crypto.price_change_percentage_24h),
          timeframe: "24-48 hours",
          potentialGain: "5-15%",
          riskLevel: "medium",
          category: "technical",
          timestamp: new Date(),
        })
      }

      // Oversold conditions (potential bounce)
      if (crypto.price_change_percentage_7d_in_currency && crypto.price_change_percentage_7d_in_currency < -20) {
        tips.push({
          id: `tip-${crypto.id}-oversold`,
          title: `${crypto.name} Potential Oversold Bounce`,
          description: `${crypto.symbol.toUpperCase()} down ${Math.abs(crypto.price_change_percentage_7d_in_currency).toFixed(1)}% this week. Strong projects often bounce from oversold levels.`,
          confidence: 70,
          timeframe: "3-7 days",
          potentialGain: "10-25%",
          riskLevel: "medium",
          category: "technical",
          timestamp: new Date(),
        })
      }

      // Market cap vs volume ratio analysis
      const volumeToMcapRatio = crypto.total_volume / crypto.market_cap
      if (volumeToMcapRatio > 0.1 && crypto.market_cap_rank <= 100) {
        tips.push({
          id: `tip-${crypto.id}-ratio`,
          title: `${crypto.name} High Activity Ratio`,
          description: `${crypto.symbol.toUpperCase()} trading volume is ${(volumeToMcapRatio * 100).toFixed(1)}% of market cap. High activity in top 100 coins often signals institutional interest.`,
          confidence: 75,
          timeframe: "1-3 days",
          potentialGain: "3-12%",
          riskLevel: "low",
          category: "fundamental",
          timestamp: new Date(),
        })
      }
    })

    // Market-wide insights
    if (market) {
      const btcDominance = market.market_cap_percentage.btc
      if (btcDominance > 50) {
        tips.push({
          id: "tip-btc-dominance",
          title: "Bitcoin Dominance Above 50%",
          description: `BTC dominance at ${btcDominance.toFixed(1)}%. Historically, high BTC dominance periods are followed by altcoin seasons when BTC stabilizes.`,
          confidence: 80,
          timeframe: "2-4 weeks",
          potentialGain: "15-40%",
          riskLevel: "medium",
          category: "market",
          timestamp: new Date(),
        })
      }

      if (market.total_volume.usd > 50000000000) {
        tips.push({
          id: "tip-high-volume",
          title: "Market-Wide High Volume",
          description: `Total crypto volume at ${CryptoAPI.formatLargeNumber(market.total_volume.usd)}. High volume periods often indicate strong market participation and potential for sustained moves.`,
          confidence: 85,
          timeframe: "1-2 weeks",
          potentialGain: "8-20%",
          riskLevel: "low",
          category: "market",
          timestamp: new Date(),
        })
      }
    }

    // Add general strategy tips
    tips.push({
      id: "tip-dca-strategy",
      title: "Dollar Cost Averaging Strategy",
      description:
        "Market volatility creates DCA opportunities. Consistent small purchases during dips historically outperform lump sum investments by 15-25% over 12+ months.",
      confidence: 90,
      timeframe: "6-12 months",
      potentialGain: "15-25%",
      riskLevel: "low",
      category: "fundamental",
      timestamp: new Date(),
    })

    tips.push({
      id: "tip-whale-watching",
      title: "Monitor Large Wallet Movements",
      description:
        "Track wallets holding 1000+ BTC or 10000+ ETH. Large movements often precede market shifts by 24-72 hours. Use on-chain analytics for early signals.",
      confidence: 85,
      timeframe: "1-3 days",
      potentialGain: "5-15%",
      riskLevel: "medium",
      category: "technical",
      timestamp: new Date(),
    })

    setProfitTips(tips.slice(0, 10)) // Keep top 10 most relevant tips
  }

  // Initialize Wolf Targets (example targets users can customize)
  const initializeWolfTargets = () => {
    const targets: WolfTarget[] = [
      {
        id: "crypto-portfolio",
        name: "Crypto Portfolio Value",
        type: "crypto",
        target: 100000,
        current: 25000,
        unit: "$",
        deadline: "2024-12-31",
        priority: "high",
        progress: 25,
      },
      {
        id: "btc-holdings",
        name: "Bitcoin Holdings",
        type: "crypto",
        target: 1,
        current: 0.25,
        unit: "BTC",
        deadline: "2024-06-30",
        priority: "critical",
        progress: 25,
      },
      {
        id: "business-revenue",
        name: "Monthly Business Revenue",
        type: "business",
        target: 50000,
        current: 12000,
        unit: "$",
        deadline: "2024-03-31",
        priority: "high",
        progress: 24,
      },
      {
        id: "emergency-fund",
        name: "Emergency Fund",
        type: "financial",
        target: 25000,
        current: 8500,
        unit: "$",
        deadline: "2024-08-31",
        priority: "medium",
        progress: 34,
      },
    ]
    setWolfTargets(targets)
  }

  // Auto-rotate profit tips
  useEffect(() => {
    if (profitTips.length > 0) {
      tipSliderRef.current = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % profitTips.length)
      }, 8000) // Change every 8 seconds
    }
    return () => {
      if (tipSliderRef.current) clearInterval(tipSliderRef.current)
    }
  }, [profitTips.length])

  // Initialize data
  useEffect(() => {
    loadRealCryptoData()
    initializeWolfTargets()

    // Refresh crypto data every 5 minutes
    const dataInterval = setInterval(loadRealCryptoData, 300000)
    return () => clearInterval(dataInterval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-400"
      case "medium":
        return "text-yellow-400"
      case "high":
        return "text-red-400"
      default:
        return "text-slate-400"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/20 text-red-300 border-red-400/50"
      case "high":
        return "bg-orange-500/20 text-orange-300 border-orange-400/50"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-400/50"
      case "low":
        return "bg-green-500/20 text-green-300 border-green-400/50"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-400/50"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-wolf-gradient">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal border-t-transparent mx-auto mb-6"></div>
            <div className="text-2xl font-bold text-wolf-heading mb-2">Wolf Platform Loading</div>
            <div className="text-slate-400">Fetching real market data...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-wolf-gradient">
      <Navbar />

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-teal to-dark-teal rounded-xl flex items-center justify-center wolf-shadow-lg">
              <Crown className="h-10 w-10 text-gold animate-wolf-pulse" />
            </div>
            <div>
              <h1 className="text-6xl font-bold text-wolf-heading metallic-shine">Wolf Platform</h1>
              <p className="text-xl text-slate-300 mt-2">Silent Assassin • Early Adopter Advantage</p>
            </div>
          </div>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            The ultimate hybrid platform combining real-time crypto intelligence with business & life management tools.
            Built for the silent assassins who see opportunities before the masses.
          </p>
        </div>

        {/* Live Clock & Market Status */}
        <Card className="mb-8 bg-wolf-card wolf-border wolf-shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-teal mb-2">Live Time</h3>
                <div className="text-3xl font-mono text-gold mb-1">{formatTime(currentTime)}</div>
                <div className="text-sm text-slate-400">{formatDate(currentTime)}</div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-teal mb-2">Market Cap</h3>
                <div className="text-3xl font-bold text-gold mb-1">
                  {marketData ? CryptoAPI.formatLargeNumber(marketData.total_market_cap.usd) : "Loading..."}
                </div>
                <div className="text-sm text-slate-400">Total Crypto Market</div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-teal mb-2">24h Volume</h3>
                <div className="text-3xl font-bold text-gold mb-1">
                  {marketData ? CryptoAPI.formatLargeNumber(marketData.total_volume.usd) : "Loading..."}
                </div>
                <div className="text-sm text-slate-400">Global Trading Volume</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Tips Slider */}
        {profitTips.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 wolf-border wolf-shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-wolf-heading">
                <Brain className="h-6 w-6 text-emerald-400 animate-wolf-glow" />
                High-Value Profit Intelligence
                <Badge className="badge-wolf-gold">
                  <Star className="h-4 w-4 mr-1" />
                  Early Adopter Exclusive
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentTipIndex((prev) => (prev - 1 + profitTips.length) % profitTips.length)}
                    className="text-teal hover:bg-teal/20"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex-1">
                    {profitTips[currentTipIndex] && (
                      <div className="bg-slate-800/50 rounded-lg p-6 wolf-border">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-teal mb-2">{profitTips[currentTipIndex].title}</h3>
                            <p className="text-slate-300 leading-relaxed">{profitTips[currentTipIndex].description}</p>
                          </div>
                          <div className="ml-6 text-right">
                            <Badge className="badge-wolf mb-2">
                              {profitTips[currentTipIndex].confidence}% Confidence
                            </Badge>
                            <div className="text-sm text-slate-400">{profitTips[currentTipIndex].timeframe}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Badge className="badge-wolf-gold">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {profitTips[currentTipIndex].potentialGain}
                            </Badge>
                            <Badge className={getRiskColor(profitTips[currentTipIndex].riskLevel)}>
                              Risk: {profitTips[currentTipIndex].riskLevel}
                            </Badge>
                            <Badge className="bg-purple-500/20 text-purple-300">
                              {profitTips[currentTipIndex].category}
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-500">
                            Tip {currentTipIndex + 1} of {profitTips.length}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentTipIndex((prev) => (prev + 1) % profitTips.length)}
                    className="text-teal hover:bg-teal/20"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress indicator */}
                <div className="flex justify-center mt-4 gap-2">
                  {profitTips.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentTipIndex ? "bg-teal" : "bg-slate-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Crypto Movers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 wolf-border wolf-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-300">
                <TrendingUp className="h-5 w-5" />
                Top Gainers (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topMovers.gainers.slice(0, 5).map((crypto) => (
                  <div key={crypto.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={crypto.image || "/placeholder.svg"}
                        alt={crypto.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-semibold text-white">{crypto.name}</div>
                        <div className="text-sm text-slate-400">{crypto.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{CryptoAPI.formatPrice(crypto.current_price)}</div>
                      <div className="text-green-400 font-semibold">
                        +{crypto.price_change_percentage_24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 wolf-border wolf-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-300">
                <TrendingDown className="h-5 w-5" />
                Top Losers (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topMovers.losers.slice(0, 5).map((crypto) => (
                  <div key={crypto.id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={crypto.image || "/placeholder.svg"}
                        alt={crypto.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="font-semibold text-white">{crypto.name}</div>
                        <div className="text-sm text-slate-400">{crypto.symbol.toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">{CryptoAPI.formatPrice(crypto.current_price)}</div>
                      <div className="text-red-400 font-semibold">{crypto.price_change_percentage_24h.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wolf Targets */}
        <Card className="mb-8 bg-wolf-card wolf-border wolf-shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-wolf-heading">
              <Target className="h-6 w-6 text-gold animate-wolf-pulse" />
              Wolf Targets & Goals
              <Badge className="badge-wolf">Personal & Business</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wolfTargets.map((target) => (
                <div key={target.id} className="bg-slate-800/50 rounded-lg p-6 wolf-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-teal mb-1">{target.name}</h3>
                      <Badge className={getPriorityColor(target.priority)}>{target.priority}</Badge>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300">{target.type}</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Progress:</span>
                      <span className="text-gold font-bold">{target.progress}%</span>
                    </div>
                    <Progress value={target.progress} className="h-2" />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">
                        {target.current} / {target.target} {target.unit}
                      </span>
                      <span className="text-slate-400">Due: {target.deadline}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Early Adopter Benefits */}
        <Card className="mb-8 bg-gradient-to-r from-gold/10 to-yellow-500/10 wolf-border wolf-shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl text-wolf-heading">
              <Crown className="h-6 w-6 text-gold animate-wolf-pulse" />
              Early Adopter Advantage
              <Badge className="badge-wolf-gold">
                <Shield className="h-4 w-4 mr-1" />
                Founding Member
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-slate-800/30 rounded-lg wolf-border">
                <Eye className="h-12 w-12 text-teal mx-auto mb-4" />
                <h3 className="text-lg font-bold text-teal mb-2">Exclusive Intelligence</h3>
                <p className="text-slate-400">
                  Access to high-value profit tips and market insights before they become mainstream knowledge.
                </p>
              </div>
              <div className="text-center p-6 bg-slate-800/30 rounded-lg wolf-border">
                <Zap className="h-12 w-12 text-gold mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gold mb-2">Priority Features</h3>
                <p className="text-slate-400">
                  First access to new tools, advanced analytics, and premium features as they're released.
                </p>
              </div>
              <div className="text-center p-6 bg-slate-800/30 rounded-lg wolf-border">
                <Star className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-purple-400 mb-2">Loyalty Rewards</h3>
                <p className="text-slate-400">
                  Grandfathered pricing and exclusive benefits that scale with platform growth and success.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button className="btn-wolf px-8 py-4 text-lg font-semibold">
                <Rocket className="h-5 w-5 mr-2" />
                Enter Wolf Platform
              </Button>
            </Link>
            <Link href="/crypto">
              <Button variant="outline" className="border-teal text-teal hover:bg-teal/20 px-8 py-4 text-lg">
                <Activity className="h-5 w-5 mr-2" />
                Live Crypto Dashboard
              </Button>
            </Link>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            Join the silent assassins who see opportunities before the masses. Built by one person with a vision to
            empower the underdog. Your early support shapes the future of this platform.
          </p>
        </div>
      </div>
    </div>
  )
}
