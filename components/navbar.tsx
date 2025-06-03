"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Wallet } from "lucide-react"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { useAccount } from "wagmi"
import { truncateAddress } from "@/lib/wallet-utils"
import { Badge } from "@/components/ui/badge"

const links = [
  { href: "/dashboard/wolf-grid", label: "Home" },
  { href: "/crypto", label: "Crypto" },
  { href: "/console", label: "Console" },
  { href: "/logs", label: "Logs" },
  { href: "/ideas", label: "Ideas" },
  { href: "/goals", label: "Goals" },
]

export default function Navbar() {
  const pathname = usePathname()
  const { address, isConnected } = useAccount()
  const { open } = useWeb3Modal()

  return (
    <nav className="bg-gunmetal fixed top-0 w-full z-20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="text-turquoise font-bold text-xl">Wolf</div>
        <div className="flex space-x-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href ? "text-turquoise border-b-2 border-pink" : "text-gray-400 hover:text-turquoise"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div>
          {isConnected ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 cursor-pointer" onClick={() => open()}>
              <Wallet className="w-3 h-3 mr-1" />
              {truncateAddress(address || "")}
            </Badge>
          ) : (
            <div
              className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => open()}
            >
              <Wallet className="w-4 h-4 text-gray-300" />
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
