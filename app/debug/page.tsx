import PreLaunchFinalDebug from "./pre-launch-final-debug"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gunmetal to-dark-gunmetal p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-6xl animate-wolf-pulse">🐺</div>
            <h1 className="text-4xl font-bold text-wolf-heading metallic-shine">Wolf Platform Debug Center</h1>
          </div>
          <p className="text-xl text-slate-300">Pre-Launch Subscription Platform Verification</p>
        </div>

        <PreLaunchFinalDebug />
      </div>
    </div>
  )
}
