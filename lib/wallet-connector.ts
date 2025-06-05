import { ethers } from "ethers"
import EthereumProvider from "@walletconnect/ethereum-provider"

export interface WalletConnection {
  address: string
  provider: ethers.BrowserProvider
  signer: ethers.JsonRpcSigner
  chainId: number
  balance: string
  ensName?: string
}

export interface TokenData {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: string
  balanceFormatted: string
  priceUSD: number
  valueUSD: number
  logo?: string
}

export class WalletConnector {
  private static instance: WalletConnector
  private connection: WalletConnection | null = null
  private listeners: ((connection: WalletConnection | null) => void)[] = []
  private isConnecting = false
  private externalProvider: any = null

  static getInstance(): WalletConnector {
    if (!WalletConnector.instance) {
      WalletConnector.instance = new WalletConnector()
    }
    return WalletConnector.instance
  }

  async connectMetaMask(): Promise<WalletConnection> {
    if (this.isConnecting) {
      throw new Error("Connection already in progress")
    }

    if (typeof window === "undefined") {
      throw new Error("Window not available - running on server")
    }

    if (!window.ethereum) {
      throw new Error("MetaMask not installed. Please install MetaMask extension to continue.")
    }

    try {
      this.isConnecting = true
      this.externalProvider = window.ethereum

      // Check if already connected
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      })

      let requestedAccounts = accounts
      if (!accounts || accounts.length === 0) {
        // Request account access
        requestedAccounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
      }

      if (!requestedAccounts || requestedAccounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask and try again.")
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.ready

      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(address)

      // Try to get ENS name
      let ensName: string | undefined
      try {
        if (Number(network.chainId) === 1) {
          ensName = (await provider.lookupAddress(address)) || undefined
        }
      } catch (error) {
        console.warn("Failed to resolve ENS name:", error)
      }

      this.connection = {
        address,
        provider,
        signer,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        ensName,
      }

      // Set up event listeners
      this.setupEventListeners(this.externalProvider)

      this.notifyListeners()
      return this.connection
    } catch (error: any) {
      console.error("MetaMask connection error:", error)

      // Handle specific error codes
      if (error.code === 4001) {
        throw new Error("Connection rejected by user")
      } else if (error.code === -32002) {
        throw new Error("Connection request already pending. Please check MetaMask.")
      } else if (error.code === -32603) {
        throw new Error("Internal error. Please try again.")
      }

      throw new Error(`Failed to connect MetaMask: ${error.message}`)
    } finally {
      this.isConnecting = false
    }
  }

  private setupEventListeners(providerSource: any = window.ethereum): void {
    if (!providerSource?.on) return

    // Remove existing listeners to prevent duplicates
    this.removeEventListeners()

    // Listen for account changes
    const handleAccountsChanged = (accounts: string[]) => {
      console.log("Accounts changed:", accounts)
      if (accounts.length === 0) {
        this.disconnect()
      } else {
        this.refreshConnection()
      }
    }

    // Listen for chain changes
    const handleChainChanged = (chainId: string) => {
      console.log("Chain changed:", chainId)
      this.refreshConnection()
    }

    // Listen for disconnect
    const handleDisconnect = (error: any) => {
      console.log("Wallet disconnected:", error)
      this.disconnect()
    }

    providerSource.on("accountsChanged", handleAccountsChanged)
    providerSource.on("chainChanged", handleChainChanged)
    providerSource.on("disconnect", handleDisconnect)

    // Store references for cleanup
    this.connection = {
      ...this.connection!,
      _listeners: {
        provider: providerSource,
        accountsChanged: handleAccountsChanged,
        chainChanged: handleChainChanged,
        disconnect: handleDisconnect,
      },
    } as any
  }

  private removeEventListeners(): void {
    if (!this.connection) return

    const listeners = (this.connection as any)._listeners
    if (!listeners) return

    const provider = listeners.provider || window.ethereum
    if (provider?.removeListener) {
      if (listeners.accountsChanged) {
        provider.removeListener("accountsChanged", listeners.accountsChanged)
      }
      if (listeners.chainChanged) {
        provider.removeListener("chainChanged", listeners.chainChanged)
      }
      if (listeners.disconnect) {
        provider.removeListener("disconnect", listeners.disconnect)
      }
    }
  }

  async connectWalletConnect(): Promise<WalletConnection> {
    if (this.isConnecting) {
      throw new Error("Connection already in progress")
    }

    if (typeof window === "undefined") {
      throw new Error("Window not available - running on server")
    }

    const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    if (!projectId) {
      throw new Error("WalletConnect project ID not configured")
    }

    try {
      this.isConnecting = true

      const wcProvider = await EthereumProvider.init({
        projectId,
        chains: [1],
        showQrModal: true,
      })

      await wcProvider.enable()

      this.externalProvider = wcProvider

      const provider = new ethers.BrowserProvider(wcProvider as any)
      await provider.ready

      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(address)

      let ensName: string | undefined
      try {
        if (Number(network.chainId) === 1) {
          ensName = (await provider.lookupAddress(address)) || undefined
        }
      } catch (error) {
        console.warn("Failed to resolve ENS name:", error)
      }

      this.connection = {
        address,
        provider,
        signer,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        ensName,
      }

      this.setupEventListeners(wcProvider)

      this.notifyListeners()
      return this.connection
    } catch (error: any) {
      console.error("WalletConnect connection error:", error)
      if (error.code === 4001) {
        throw new Error("Connection rejected by user")
      }
      throw new Error(`Failed to connect WalletConnect: ${error.message}`)
    } finally {
      this.isConnecting = false
    }
  }

  async disconnect(): Promise<void> {
    if ((this.connection as any)?._listeners?.provider?.disconnect) {
      try {
        await (this.connection as any)._listeners.provider.disconnect()
      } catch (err) {
        console.warn("Wallet disconnect error:", err)
      }
    }
    this.removeEventListeners()
    this.connection = null
    this.externalProvider = null
    this.notifyListeners()
  }

  private async refreshConnection(): Promise<void> {
    if (!this.connection) return

    const providerSource = (this.connection as any)._listeners?.provider || window.ethereum
    if (!providerSource) return

    try {
      const provider = new ethers.BrowserProvider(providerSource as any)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(address)

      // Try to get ENS name
      let ensName: string | undefined
      try {
        if (Number(network.chainId) === 1) {
          ensName = (await provider.lookupAddress(address)) || undefined
        }
      } catch (error) {
        console.warn("Failed to resolve ENS name:", error)
      }

      this.connection = {
        address,
        provider,
        signer,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        ensName,
      }

      this.notifyListeners()
    } catch (error) {
      console.error("Failed to refresh connection:", error)
      this.disconnect()
    }
  }

  getConnection(): WalletConnection | null {
    return this.connection
  }

  isConnected(): boolean {
    return this.connection !== null
  }

  onConnectionChange(callback: (connection: WalletConnection | null) => void): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.connection)
      } catch (error) {
        console.error("Error in connection listener:", error)
      }
    })
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<TokenData> {
    if (!this.connection) {
      throw new Error("No wallet connected")
    }

    // Validate addresses
    if (!ethers.isAddress(tokenAddress)) {
      throw new Error("Invalid token address")
    }
    if (!ethers.isAddress(userAddress)) {
      throw new Error("Invalid user address")
    }

    // ERC-20 ABI for basic token functions
    const tokenABI = [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function name() view returns (string)",
    ]

    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, this.connection.provider)

    try {
      const [balance, decimals, symbol, name] = await Promise.all([
        tokenContract.balanceOf(userAddress),
        tokenContract.decimals(),
        tokenContract.symbol(),
        tokenContract.name(),
      ])

      const balanceFormatted = ethers.formatUnits(balance, decimals)

      // Only fetch price if balance > 0
      let priceUSD = 0
      let valueUSD = 0

      if (balance > 0n) {
        priceUSD = await this.getTokenPrice(symbol)
        valueUSD = Number.parseFloat(balanceFormatted) * priceUSD
      }

      return {
        address: tokenAddress,
        symbol,
        name,
        decimals: Number(decimals),
        balance: balance.toString(),
        balanceFormatted,
        priceUSD,
        valueUSD,
      }
    } catch (error: any) {
      console.error(`Failed to get token balance for ${tokenAddress}:`, error)

      // Return empty token data instead of throwing
      return {
        address: tokenAddress,
        symbol: "UNKNOWN",
        name: "Unknown Token",
        decimals: 18,
        balance: "0",
        balanceFormatted: "0",
        priceUSD: 0,
        valueUSD: 0,
      }
    }
  }

  async getTokenPrice(symbol: string): Promise<number> {
    if (!symbol || symbol === "UNKNOWN") return 0

    try {
      const symbolLower = symbol.toLowerCase()
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbolLower}&vs_currencies=usd`,
        {
          headers: {
            Accept: "application/json",
          },
        },
      )

      if (!response.ok) {
        console.warn(`Failed to fetch price for ${symbol}: ${response.status}`)
        return 0
      }

      const data = await response.json()
      return data[symbolLower]?.usd || 0
    } catch (error) {
      console.warn(`Error fetching price for ${symbol}:`, error)
      return 0
    }
  }

  async switchNetwork(chainId: number): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed")
    }

    const hexChainId = `0x${chainId.toString(16)}`

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added, add it
        await this.addNetwork(chainId)
      } else if (error.code === 4001) {
        throw new Error("Network switch rejected by user")
      } else {
        throw new Error(`Failed to switch network: ${error.message}`)
      }
    }
  }

  private async addNetwork(chainId: number): Promise<void> {
    const networks: Record<number, any> = {
      137: {
        chainId: "0x89",
        chainName: "Polygon Mainnet",
        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
        rpcUrls: ["https://polygon-rpc.com/"],
        blockExplorerUrls: ["https://polygonscan.com/"],
      },
      42161: {
        chainId: "0xa4b1",
        chainName: "Arbitrum One",
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://arb1.arbitrum.io/rpc"],
        blockExplorerUrls: ["https://arbiscan.io/"],
      },
      56: {
        chainId: "0x38",
        chainName: "BNB Smart Chain",
        nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
        rpcUrls: ["https://bsc-dataseed.binance.org/"],
        blockExplorerUrls: ["https://bscscan.com/"],
      },
    }

    const network = networks[chainId]
    if (!network) {
      throw new Error(`Unsupported network: ${chainId}`)
    }

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [network],
      })
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("Network addition rejected by user")
      }
      throw new Error(`Failed to add network: ${error.message}`)
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.connection) {
      throw new Error("No wallet connected")
    }

    try {
      return await this.connection.signer.signMessage(message)
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("Message signing rejected by user")
      }
      throw new Error(`Failed to sign message: ${error.message}`)
    }
  }
}

// Global type declarations
declare global {
  interface Window {
    ethereum?: any
  }
}
