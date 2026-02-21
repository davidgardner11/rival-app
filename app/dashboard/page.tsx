/**
 * Dashboard - Analysis History
 */

import Link from 'next/link'
import { listAnalyses } from '../actions/analysis'
import { signOut, getUser } from '../(auth)/actions'

export default async function DashboardPage() {
  const user = await getUser()
  const analyses = await listAnalyses()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            Rival
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-gray-300">{user?.email}</span>
            <form>
              <button
                formAction={signOut}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Analyses</h1>
            <p className="text-gray-400">
              Competitive intelligence reports ready in under 3 minutes
            </p>
          </div>
          <Link
            href="/dashboard/new"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            + New Analysis
          </Link>
        </div>

        {/* Analysis List */}
        {analyses.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              No analyses yet
            </h2>
            <p className="text-gray-400 mb-6">
              Create your first competitive intelligence report
            </p>
            <Link
              href="/dashboard/new"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {analyses.map((analysis) => (
              <Link
                key={analysis.id}
                href={`/dashboard/${analysis.id}`}
                className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-blue-500/50 transition-all hover:bg-white/10 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                      {analysis.target_company?.name ||
                        analysis.target_company?.domain ||
                        'Unnamed Analysis'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {analysis.target_company?.domain}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {analysis.status === 'processing' && (
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        Processing
                      </span>
                    )}
                    {analysis.status === 'completed' && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                        ✓ Completed
                      </span>
                    )}
                    {analysis.status === 'failed' && (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                        ✗ Failed
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-gray-400 text-sm">
                  Created{' '}
                  {new Date(analysis.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>

                {analysis.status === 'completed' && analysis.gap_analysis && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {analysis.gap_analysis.market_positioning}
                    </p>
                  </div>
                )}

                {analysis.error_message && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-red-400 text-sm">{analysis.error_message}</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
