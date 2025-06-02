"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, LogOut, Settings, Loader2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthContext } from "@/components/auth/auth-provider"
import { useAdmin } from "@/hooks/useAdmin"

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
  const { user, signOut, loading, isAuthenticated } = useAuthContext()
  const { isAdmin, adminRole } = useAdmin()

  const handleSignOut = async () => {
    await signOut()
  }

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (email) {
      return email[0].toUpperCase()
    }
    return "U"
  }

  return (
    <nav className="bg-gunmetal fixed top-0 w-full z-20 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link href="/" className="text-turquoise font-bold text-xl">
          Wolf
        </Link>

        {isAuthenticated && (
          <div className="hidden md:flex space-x-6">
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
            {isAdmin && (
              <Link
                href="/admin"
                className={
                  pathname === "/admin"
                    ? "text-turquoise border-b-2 border-pink"
                    : "text-gray-400 hover:text-turquoise transition-colors"
                }
              >
                Admin
              </Link>
            )}
          </div>
        )}

        <div>
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} />
                    <AvatarFallback className="bg-turquoise text-black font-semibold">
                      {getUserInitials(user.full_name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gunmetal border-gray-700 w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.full_name && <p className="font-medium text-turquoise">{user.full_name}</p>}
                    <p className="w-[200px] truncate text-sm text-gray-400">{user.email}</p>
                    {isAdmin && (
                      <p className="text-xs text-pink font-medium">{adminRole?.replace("_", " ").toUpperCase()}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  asChild
                  className="text-gray-300 hover:text-turquoise hover:bg-gray-700 cursor-pointer"
                >
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    asChild
                    className="text-gray-300 hover:text-turquoise hover:bg-gray-700 cursor-pointer"
                  >
                    <Link href="/admin">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-red-400 hover:bg-gray-700 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-gray-500/30 text-gray-300 hover:bg-gray-500/30"
              >
                <Link href="/auth/signin">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-turquoise text-black font-semibold hover:bg-pink transition-colors"
              >
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
