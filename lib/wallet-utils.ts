import { formatUnits } from "viem"
import { readContract, readContracts } from "@wagmi/core"
import { config } from "./wallet-config"

// ERC-20 ABI for token operations
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
] as const

// Common token addresses
export const TOKEN_ADDRESSES = {
  mainnet: {
    USDC: "0xA0b86a33E6441b8C4505B7C0c5b2C8b5F5F5F5F5",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    UNI: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  },
  polygon: {
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  },
  arbitrum: {
    USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    ARB: "0x912CE59144191C1204E64559FE8253a0e49E6548",
  },
} as const

export interface TokenBalance {
  address: string
  symbol: string
  name: string
  balance: string
  decimals: number
  balanceFormatted: string
  usdValue?: number
  change24h?: number
  logo?: string
}

export interface WalletData {
  address: string
  chainId: number
  chainName: string
  nativeBalance: string
  nativeBalanceFormatted: string
  nativeSymbol: string
  tokens: TokenBalance[]
  totalUsdValue: number
}

// Get native token balance
export async function getNativeBalance(address: string, chainId: number): Promise<string> {
  try {
    const balance = await readContract(config, {
      address: address as `0x${string}`,
      abi: [
        {
          constant: true,
          inputs: [{ name: "account", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "", type: "uint256" }],
          type: "function",
        },
      ],
      functionName: "balanceOf",
      args: [address as `0x${string}`],
      chainId,
    })
    return balance.toString()
  } catch (error) {
    console.error("Error fetching native balance:", error)
    return "0"
  }
}

// Get token balances for an address
export async function getTokenBalances(
  address: string,
  chainId: number,
  tokenAddresses: string[],
): Promise<TokenBalance[]> {
  try {
    const contracts = tokenAddresses.flatMap((tokenAddress) => [
      {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
        chainId,
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "symbol",
        chainId,
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "name",
        chainId,
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "decimals",
        chainId,
      },
    ])

    const results = await readContracts(config, { contracts })

    const tokens: TokenBalance[] = []

    for (let i = 0; i < tokenAddresses.length; i++) {
      const balanceResult = results[i * 4]
      const symbolResult = results[i * 4 + 1]
      const nameResult = results[i * 4 + 2]
      const decimalsResult = results[i * 4 + 3]

      if (
        balanceResult.status === "success" &&
        symbolResult.status === "success" &&
        nameResult.status === "success" &&
        decimalsResult.status === "success"
      ) {
        const balance = balanceResult.result as bigint
        const symbol = symbolResult.result as string
        const name = nameResult.result as string
        const decimals = decimalsResult.result as number

        const balanceFormatted = formatUnits(balance, decimals)

        // Only include tokens with non-zero balance
        if (balance > 0n) {
          tokens.push({
            address: tokenAddresses[i],
            symbol,
            name,
            balance: balance.toString(),
            decimals,
            balanceFormatted,
            logo: getTokenLogo(symbol),
          })
        }
      }
    }

    return tokens
  } catch (error) {
    console.error("Error fetching token balances:", error)
    return []
  }
}

// Get token logo (you can replace with actual logo service)
export function getTokenLogo(symbol: string): string {
  const logos: Record<string, string> = {
    ETH: "🔷",
    WETH: "🔷",
    BTC: "₿",
    WBTC: "₿",
    USDC: "💵",
    USDT: "💵",
    UNI: "🦄",
    LINK: "🔗",
    MATIC: "🟣",
    WMATIC: "🟣",
    ARB: "🔵",
    OP: "🔴",
    AVAX: "🔺",
    SOL: "◎",
    ADA: "💙",
    DOT: "⚫",
  }
  return logos[symbol] || "🪙"
}

// Get chain name from chain ID
export function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: "Ethereum",
    137: "Polygon",
    42161: "Arbitrum",
    10: "Optimism",
    8453: "Base",
    43114: "Avalanche",
    56: "BSC",
    250: "Fantom",
    11155111: "Sepolia",
  }
  return chains[chainId] || `Chain ${chainId}`
}

// Get native token symbol from chain ID
export function getNativeSymbol(chainId: number): string {
  const symbols: Record<number, string> = {
    1: "ETH",
    137: "MATIC",
    42161: "ETH",
    10: "ETH",
    8453: "ETH",
    43114: "AVAX",
    56: "BNB",
    250: "FTM",
    11155111: "ETH",
  }
  return symbols[chainId] || "ETH"
}

// Fetch USD prices from CoinGecko (free tier)
export async function fetchTokenPrices(symbols: string[]): Promise<Record<string, number>> {
  try {
    const symbolsParam = symbols.join(",").toLowerCase()
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbolsParam}&vs_currencies=usd&include_24hr_change=true`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch prices")
    }

    const data = await response.json()

    // Map symbols to prices
    const prices: Record<string, number> = {}
    symbols.forEach((symbol) => {
      const coinData = data[symbol.toLowerCase()]
      if (coinData) {
        prices[symbol] = coinData.usd || 0
      }
    })

    return prices
  } catch (error) {
    console.error("Error fetching token prices:", error)
    return {}
  }
}

// Format large numbers
export function formatNumber(num: number, decimals = 2): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + "B"
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + "M"
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + "K"
  }
  return num.toFixed(decimals)
}

// Truncate address
export function truncateAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}
