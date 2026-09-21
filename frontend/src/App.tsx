import { useEffect, useState } from 'react'
import { checkBackendHealth, type HealthCheckResult } from './api/client'
import { CheckCircle2, XCircle, RefreshCw, Sparkles, Database, Bot, Globe } from 'lucide-react'


export default function App() {
  const [health, setHealth] = useState<HealthCheckResult | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchStatus = async () => {
    setLoading(true)
    const res = await checkBackendHealth()
    setHealth(res)
    setLoading(false)
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const isConnected = !!health?.data && !health?.error

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#262422] flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="border-b border-[#e8e4dc] bg-white/70 backdrop-blur px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#9e2a2b] text-amber-100 flex items-center justify-center font-serif text-lg font-bold shadow-sm">
              V
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-tight text-[#1c1917]">
                Velvet Invite
              </span>
              <span className="ml-2 text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                Phase 0 Skeleton
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#d6cfc4] bg-white hover:bg-[#f4efe8] text-xs font-medium text-stone-700 transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-700' : ''}`} />
              Refresh Status
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            AI-Powered Wedding Websites for Nigerian Couples
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[#1c1917] mb-3">
            Project Skeleton Initialized
          </h1>
          <p className="text-stone-600 max-w-xl mx-auto text-sm sm:text-base">
            Phase 0 setup complete. The React + Vite frontend is running and polling the FastAPI backend to verify connectivity.
          </p>
        </div>

        {/* Backend Connection Status Card */}
        <div className="bg-white rounded-xl border border-[#e8e4dc] shadow-sm p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f0ece4]">
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
              ) : isConnected ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
              )}
              <div>
                <h2 className="text-base font-semibold text-stone-900">
                  Backend API Connection
                </h2>
                <p className="text-xs text-stone-500 font-mono">
                  http://localhost:8000/health
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
                  }`}
                />
                {isConnected ? 'Backend Connected' : 'Connection Failed'}
              </span>
              {isConnected && (
                <span className="text-xs text-stone-400 font-mono">
                  {health?.latencyMs}ms
                </span>
              )}
            </div>
          </div>

          {/* Subsystem Health Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            {/* FastAPI Core */}
            <div className="p-4 rounded-lg bg-[#faf8f5] border border-[#ece7de]">
              <div className="flex items-center gap-2 text-stone-700 font-medium text-xs mb-1">
                <Globe className="w-4 h-4 text-stone-500" />
                FastAPI Server
              </div>
              <p className="text-sm font-semibold text-stone-900">
                {health?.data?.app || 'Velvet Invite API'}
              </p>
              <p className="text-xs text-stone-500 font-mono mt-0.5">
                Version {health?.data?.version || '0.1.0'}
              </p>
            </div>

            {/* Database */}
            <div className="p-4 rounded-lg bg-[#faf8f5] border border-[#ece7de]">
              <div className="flex items-center gap-2 text-stone-700 font-medium text-xs mb-1">
                <Database className="w-4 h-4 text-stone-500" />
                MongoDB (Atlas)
              </div>
              <p className="text-sm font-semibold text-stone-900 capitalize">
                {health?.data?.database?.status?.replace('_', ' ') || 'Pending Config'}
              </p>
              <p className="text-xs text-stone-500 truncate mt-0.5" title={health?.data?.database?.message || ''}>
                {health?.data?.database?.database ? `DB: ${health.data.database.database}` : 'Awaiting MONGODB_URI in .env'}
              </p>
            </div>

            {/* AI Service */}
            <div className="p-4 rounded-lg bg-[#faf8f5] border border-[#ece7de]">
              <div className="flex items-center gap-2 text-stone-700 font-medium text-xs mb-1">
                <Bot className="w-4 h-4 text-stone-500" />
                AI Builder Service
              </div>
              <p className="text-sm font-semibold text-stone-900 capitalize">
                {health?.data?.ai_service?.provider || 'Anthropic (Claude)'}
              </p>
              <p className="text-xs text-stone-500 truncate mt-0.5">
                {health?.data?.ai_service?.configured ? 'Key Configured' : 'Awaiting API Key in .env'}
              </p>
            </div>
          </div>

          {health?.error && (
            <div className="mt-4 p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700">
              <strong>Error Details:</strong> {health.error}
            </div>
          )}
        </div>

        {/* Phase Roadmap Progress */}
        <div className="bg-amber-50/50 rounded-lg border border-amber-200/60 p-4 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="font-semibold">Next Up: Phase 1 (Auth & Accounts)</span>
            <p className="text-amber-800 text-[11px] mt-0.5">
              User registration, login, JWT session authentication, and protected dashboard routing.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-mono text-[11px] font-medium whitespace-nowrap">
            Phase 0 / 5 Complete
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8e4dc] py-4 text-center text-xs text-stone-500">
        Velvet Invite &copy; 2026 &bull; Architecture: FastAPI + React + Vite + Tailwind + MongoDB
      </footer>
    </div>
  )
}
