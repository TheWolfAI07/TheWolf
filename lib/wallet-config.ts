import { defaultWagmiConfig } from "@web3modal/wagmi/react/config"
import { mainnet, arbitrum, polygon, optimism, base, sepolia } from "wagmi/chains"

// Get projectId from environment variables
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

// Only create config if projectId exists
const metadata = {
  name: "The Wolf - Crypto Dashboard",
  description: "Advanced Trading & Analytics Platform",
  url: typeof window !== "undefined" ? window.location.origin : "https://thewolf.app",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
}

// Create wagmiConfig only if we have a valid projectId
const chains = [mainnet, arbitrum, polygon, optimism, base, sepolia] as const

export const config =
  projectId && projectId !== "your-project-id"
    ? defaultWagmiConfig({
        chains,
        projectId,
        metadata,
        enableWalletConnect: true,
        enableInjected: true,
        enableEIP6963: true,
        enableCoinbase: true,
      })
    : defaultWagmiConfig({
        chains,
        projectId: "dummy-project-id", // Fallback to prevent errors
        metadata,
        enableWalletConnect: false, // Disable WalletConnect if no valid projectId
        enableInjected: true,
        enableEIP6963: true,
        enableCoinbase: true,
      })
