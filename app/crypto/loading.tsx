export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-black font-bold text-lg">₿</span>
        </div>
        <p className="text-cyan-400">Loading crypto dashboard...</p>
      </div>
    </div>
  )
}
