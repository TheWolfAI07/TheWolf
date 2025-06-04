"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Bug, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface DebugButtonProps {
  className?: string
  variant?: "default" | "subtle" | "floating"
}

export function DebugButton({ className = "", variant = "default" }: DebugButtonProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)
  const [quickStatus, setQuickStatus] = useState<"success" | "error" | "warning" | null>(null)

  const runQuickCheck = async () => {
    setIsChecking(true)
    setQuickStatus(null)

    try {
      // Check if CSS variables are defined
      const rootStyles = getComputedStyle(document.documentElement)
      const tealVar = rootStyles.getPropertyValue("--wolf-teal").trim()
      const goldVar = rootStyles.getPropertyValue("--wolf-gold").trim()

      // Check for Wolf classes
      const hasWolfGradient = document.querySelector(".bg-wolf-gradient") !== null
      const hasWolfCard = document.querySelector(".bg-wolf-card") !== null

      // Check if CryptoAPI is working
      const formatWorks =
        typeof window !== "undefined" && window.CryptoAPI && typeof window.CryptoAPI.formatPrice === "function"

      if (!tealVar || !goldVar || !hasWolfGradient || !hasWolfCard) {
        setQuickStatus("warning")
      } else if (!formatWorks) {
        setQuickStatus("error")
      } else {
        setQuickStatus("success")
      }
    } catch (error) {
      console.error("Debug check error:", error)
      setQuickStatus("error")
    } finally {
      setIsChecking(false)
    }
  }

  const goToDebugPage = () => {
    router.push("/debug")
  }

  if (variant === "floating") {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className={`fixed bottom-4 right-4 rounded-full w-12 h-12 flex items-center justify-center shadow-lg ${
              quickStatus === "success"
                ? "bg-green-500 hover:bg-green-600"
                : quickStatus === "error"
                  ? "bg-red-500 hover:bg-red-600"
                  : quickStatus === "warning"
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-slate-700 hover:bg-slate-800"
            } ${className}`}
            onClick={quickStatus ? undefined : runQuickCheck}
          >
            {isChecking ? (
              <span className="animate-spin">⚙️</span>
            ) : quickStatus === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : quickStatus === "error" ? (
              <XCircle className="h-5 w-5" />
            ) : quickStatus === "warning" ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Bug className="h-5 w-5" />
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Wolf Platform Debug</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              {quickStatus === "success"
                ? "All systems operational. No issues detected."
                : quickStatus === "error"
                  ? "System errors detected. Open debug page for details."
                  : quickStatus === "warning"
                    ? "System warnings detected. Some features may not work correctly."
                    : "Run a quick system check or open the full debug page."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={goToDebugPage} className="bg-teal text-white hover:bg-dark-teal">
              Open Debug Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  if (variant === "subtle") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge
          className={`cursor-pointer ${
            isChecking
              ? "bg-blue-500/20 text-blue-300"
              : quickStatus === "success"
                ? "bg-green-500/20 text-green-300"
                : quickStatus === "error"
                  ? "bg-red-500/20 text-red-300"
                  : quickStatus === "warning"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-slate-500/20 text-slate-300"
          }`}
          onClick={quickStatus ? goToDebugPage : runQuickCheck}
        >
          {isChecking ? (
            <>
              <span className="animate-spin mr-1">⚙️</span>
              Checking...
            </>
          ) : quickStatus === "success" ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              System OK
            </>
          ) : quickStatus === "error" ? (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              System Error
            </>
          ) : quickStatus === "warning" ? (
            <>
              <AlertTriangle className="h-3 w-3 mr-1" />
              System Warning
            </>
          ) : (
            <>
              <Bug className="h-3 w-3 mr-1" />
              Debug
            </>
          )}
        </Badge>
      </div>
    )
  }

  // Default variant
  return (
    <Button
      variant="outline"
      size="sm"
      className={`border-slate-600 ${
        isChecking
          ? "text-blue-400"
          : quickStatus === "success"
            ? "text-green-400"
            : quickStatus === "error"
              ? "text-red-400"
              : quickStatus === "warning"
                ? "text-yellow-400"
                : "text-slate-400"
      } ${className}`}
      onClick={quickStatus ? goToDebugPage : runQuickCheck}
    >
      {isChecking ? (
        <>
          <span className="animate-spin mr-2">⚙️</span>
          Checking...
        </>
      ) : quickStatus === "success" ? (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          System OK
        </>
      ) : quickStatus === "error" ? (
        <>
          <XCircle className="h-4 w-4 mr-2" />
          System Error
        </>
      ) : quickStatus === "warning" ? (
        <>
          <AlertTriangle className="h-4 w-4 mr-2" />
          System Warning
        </>
      ) : (
        <>
          <Bug className="h-4 w-4 mr-2" />
          Debug
        </>
      )}
    </Button>
  )
}
