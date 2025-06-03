"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  X,
  Home,
  BarChart3,
  Settings,
  User,
  LogOut,
  Terminal,
  Zap,
  Target,
  Lightbulb,
  Activity,
  Bitcoin,
  Crown,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Console", href: "/console", icon: Terminal },
  { name: "Crypto", href: "/crypto", icon: Bitcoin },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Ideas", href: "/ideas", icon: Lightbulb },
  { name: "Logs", href: "/logs", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
    <nav className="bg-luxury-dark border-b border-aqua/20 metallic-shine">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <Zap className="h-8 w-8 text-aqua group-hover:text-luxury-gold transition-colors duration-300" />
                  <Crown className="h-4 w-4 text-luxury-gold absolute -top-1 -right-1" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-aqua to-luxury-gold bg-clip-text text-transparent">
                  Wolf Platform
                </span>
                <Badge className="bg-gold-gradient text-luxury-black text-xs font-semibold">LUXURY</Badge>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-all duration-300 ${
                      isActive(item.href)
                        ? "border-luxury-gold text-aqua shadow-lg"
                        : "border-transparent text-gray-300 hover:border-aqua/50 hover:text-aqua"
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <Badge className="bg-aqua-gradient text-luxury-black text-xs font-semibold px-3 py-1 aqua-glow">
              ● LIVE
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full gold-border">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="@user" />
                    <AvatarFallback className="bg-gunmetal-gradient text-aqua font-bold">WU</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-luxury-dark border-aqua/30" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-aqua">Wolf User</p>
                    <p className="text-xs leading-none text-gray-400">user@wolf.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-aqua/20" />
                <DropdownMenuItem asChild className="hover:bg-gunmetal/50">
                  <Link href="/dashboard" className="flex items-center text-gray-300 hover:text-aqua">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-gunmetal/50">
                  <Link href="/settings" className="flex items-center text-gray-300 hover:text-aqua">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-aqua/20" />
                <DropdownMenuItem className="hover:bg-gunmetal/50 text-gray-300 hover:text-luxury-gold">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-aqua hover:bg-gunmetal/50"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="sm:hidden bg-dark-gunmetal border-t border-aqua/20">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block py-2 pl-3 pr-4 text-base font-medium border-l-4 transition-all duration-300 ${
                    isActive(item.href)
                      ? "border-luxury-gold bg-gunmetal/30 text-aqua"
                      : "border-transparent text-gray-300 hover:border-aqua/50 hover:bg-gunmetal/20 hover:text-aqua"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
