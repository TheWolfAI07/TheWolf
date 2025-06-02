"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  const router = useRouter()
  const [isSignedIn, setIsSignedIn] = useState(false)

  // Check if user is signed in on component mount
  useEffect(() => {
    const signedIn = localStorage.getItem("wolf-signed-in") === "true"
    setIsSignedIn(signedIn)
  }, [])

  const handleSignIn = () => {
    router.push("/auth/signin")
  }

  const handleSignOut = () => {
    localStorage.removeItem("wolf-signed-in")
    setIsSignedIn(false)
    router.push("/")
  }

  return (
    <nav className="bg-gunmetal fixed top-0 w-full z-20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link href="/" className="text-turquoise font-bold text-xl">
          Wolf
        </Link>

        {isSignedIn && (
          <div className="flex space-x-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname === link.href
                    ? "text-turquoise border-b-2 border-pink"
                    : "text-gray-400 hover:text-turquoise transition-colors"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div>
          {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-turquoise/20 border-turquoise/30 text-turquoise hover:bg-turquoise/30"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gunmetal border-gray-700">
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-turquoise hover:bg-gray-700 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleSignIn}
              variant="outline"
              size="sm"
              className="bg-gray-600/20 border-gray-500/30 text-gray-300 hover:bg-gray-500/30"
            >
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}

// Also export as default for compatibility
export default Navbar
