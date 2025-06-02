// Ensure this file exists and works properly
"use client"

import { useState, useEffect } from "react"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({
    title,
    description,
    variant = "default",
  }: {
    title: string
    description?: string
    variant?: "default" | "destructive" | "success"
  }) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, title, description, variant }
    setToasts((prev) => [...prev, newToast])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)

    return id
  }

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Render toasts in a portal
  useEffect(() => {
    if (toasts.length > 0) {
      const toastContainer = document.getElementById("toast-container")
      if (!toastContainer) {
        const container = document.createElement("div")
        container.id = "toast-container"
        container.className = "fixed top-4 right-4 z-50 flex flex-col gap-2"
        document.body.appendChild(container)

        toasts.forEach((t) => {
          const toast = document.createElement("div")
          toast.className = `p-4 rounded-md shadow-lg ${
            t.variant === "destructive"
              ? "bg-red-500 text-white"
              : t.variant === "success"
                ? "bg-green-500 text-white"
                : "bg-slate-800 text-white"
          }`
          toast.innerHTML = `
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-medium">${t.title}</h3>
                ${t.description ? `<p class="text-sm opacity-90">${t.description}</p>` : ""}
              </div>
              <button class="ml-4 text-sm opacity-70 hover:opacity-100">×</button>
            </div>
          `
          toast.querySelector("button")?.addEventListener("click", () => dismiss(t.id))
          container.appendChild(toast)
        })

        return () => {
          document.body.removeChild(container)
        }
      }
    }
  }, [toasts])

  return { toast, dismiss }
}
