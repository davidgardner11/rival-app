/**
 * Create New Analysis Page
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createAnalysis } from '@/app/actions/analysis'

export default function NewAnalysisPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    if (!urlPattern.test(url)) {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)

    try {
      const result = await createAnalysis(url)

      // Redirect to analysis page
      router.push(`/dashboard/${result.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create analysis')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-white">
            Rival
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-20 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            New Competitive Analysis
          </h1>
          <p className="text-xl text-gray-300">
            Paste any company URL to get started
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-200 mb-3"
              >
                Company URL
              </label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
                placeholder="e.g., linear.app, notion.so, slack.com"
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-gray-400 text-sm mt-2">
                We'll automatically scrape this company plus 3-5 competitors
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Starting Analysis...
                </span>
              ) : (
                'Analyze Competitors'
              )}
            </button>
          </form>

          {/* What Happens Next */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">
              What happens next:
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="text-blue-400 mt-1">1.</div>
                <div className="text-gray-300">
                  We scrape your target company's website (pricing, features, content)
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-blue-400 mt-1">2.</div>
                <div className="text-gray-300">
                  AI identifies 3-5 direct competitors
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-blue-400 mt-1">3.</div>
                <div className="text-gray-300">
                  We scrape each competitor's website
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-blue-400 mt-1">4.</div>
                <div className="text-gray-300">
                  Claude analyzes everything and generates your competitive intelligence report
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              ⏱️ Typical analysis takes 2-3 minutes
            </p>
          </div>
        </div>

        {/* Example Companies */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm mb-4">Try these examples:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['linear.app', 'notion.so', 'slack.com', 'airtable.com'].map(
              (example) => (
                <button
                  key={example}
                  onClick={() => setUrl(example)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  {example}
                </button>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
