// Simple wallet utilities without external dependencies
export interface WalletInfo {
  name: string
  installed: boolean
  icon: string
}

export function getAvailableWallets(): WalletInfo[] {
  if (typeof window === "undefined") {
    return []
  }

  return [
    {
      name: "MetaMask",
      installed: !!(window as any).ethereum?.isMetaMask,
      icon: "🦊",
    },
    {
      name: "WalletConnect",
      installed: true, // Always available as it's a protocol
      icon: "🔗",
    },
  ]
}

export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatBalance(balance: string, decimals = 4): string {
  const num = Number.parseFloat(balance)
  if (isNaN(num)) return "0"
  return num.toFixed(decimals)
}

export function getNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: "Ethereum",
    137: "Polygon",
    42161: "Arbitrum",
    56: "BSC",
  }
  return networks[chainId] || `Chain ${chainId}`
}

export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}
