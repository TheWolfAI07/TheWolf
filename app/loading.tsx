import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gunmetal to-dark-gunmetal flex items-center justify-center">
      <div className="text-center relative">
        <div className="relative mb-6">
          <div className="text-6xl mb-4 animate-pulse">🐺</div>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-dark-teal" />
        </div>
        <h2 className="text-2xl font-bold text-gold mb-2 metallic-shine">Loading Wolf Platform</h2>
        <p className="text-dark-teal">Initializing system components...</p>
        <div className="mt-4 w-48 h-1 bg-gunmetal rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-dark-teal to-gold animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
