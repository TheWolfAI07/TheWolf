import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Wolf Platform</h2>
        <p className="text-gray-600">Initializing system components...</p>
      </div>
    </div>
  )
}
