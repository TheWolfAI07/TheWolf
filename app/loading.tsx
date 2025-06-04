export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-900/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/20 rounded-full filter blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Premium Loading Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 blur-lg opacity-70 animate-pulse"></div>
          <div className="relative bg-black rounded-full p-8 border border-cyan-500/30 shadow-xl shadow-cyan-500/20">
            <div className="text-7xl animate-bounce">🐺</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full rounded-full border-4 border-cyan-500/30 border-t-cyan-500 animate-spin"></div>
            </div>
          </div>
        </div>

        {/* Premium Text */}
        <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-600 text-transparent bg-clip-text animate-gradient mb-4">
          WOLF PLATFORM
        </h2>

        <div className="flex items-center justify-center mb-6">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-500"></div>
          <p className="px-4 text-cyan-500 text-sm tracking-widest">INITIALIZING</p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-500"></div>
        </div>

        <p className="text-slate-400 mb-8">Preparing Enterprise Systems</p>

        {/* Premium Progress Bar */}
        <div className="relative w-64 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 animate-gradient rounded-full"></div>
        </div>

        {/* Loading Steps */}
        <div className="mt-8 text-xs text-slate-500">
          <div className="flex items-center justify-center space-x-2">
            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
            <span>Establishing Secure Connection</span>
          </div>
        </div>
      </div>
    </div>
  )
}
