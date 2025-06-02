"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/dashboard/wolf-grid", label: "Home" },
  { href: "/crypto", label: "Crypto" },
  { href: "/console", label: "Console" },
  { href: "/logs", label: "Logs" },
  { href: "/ideas", label: "Ideas" },
  { href: "/goals", label: "Goals" },
]

export function Navbar() {
  const pathname = usePathname()

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
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-600/20 border-gray-500/30 text-gray-300 hover:bg-gray-500/30"
          >
            <User className="w-4 h-4 mr-2" />
            Connect
          </Button>
        </div>
      </div>
    </nav>
  )
}

// Also export as default for compatibility
export default Navbar
