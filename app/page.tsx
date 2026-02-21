/**
 * Landing Page
 */

import Link from 'next/link'
import { getUser } from './(auth)/actions'

export default async function HomePage() {
  const user = await getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">Rival</h1>
        <div>
          {user ? (
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-6 py-2 text-white hover:text-blue-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Competitive Intelligence
            <br />
            <span className="text-blue-400">in Under 3 Minutes</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Paste any company URL. Get a complete competitive teardown with feature comparisons,
            pricing analysis, messaging insights, and gap opportunities.
          </p>
          <Link
            href={user ? '/dashboard/new' : '/signup'}
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-colors shadow-xl hover:shadow-2xl"
          >
            Analyze Your First Competitor
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">Automated Scraping</h3>
            <p className="text-gray-400">
              Automatically scrapes target company plus 3-5 competitors. No manual research needed.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-400">
              Claude analyzes features, pricing, messaging, and identifies strategic opportunities.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Visual Dashboard</h3>
            <p className="text-gray-400">
              Beautiful comparison matrices, pricing tables, and gap analysis in one view.
            </p>
          </div>
        </div>

        {/* What You Get */}
        <div className="mt-20 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-white mb-6">What You Get</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-1">✓</div>
              <div>
                <p className="text-white font-semibold">Feature Comparison Matrix</p>
                <p className="text-gray-400 text-sm">Side-by-side feature analysis across all competitors</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-1">✓</div>
              <div>
                <p className="text-white font-semibold">Pricing Comparison Table</p>
                <p className="text-gray-400 text-sm">Compare pricing tiers, plans, and value propositions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-1">✓</div>
              <div>
                <p className="text-white font-semibold">Messaging Analysis</p>
                <p className="text-gray-400 text-sm">Headlines, CTAs, and positioning strategy breakdown</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-1">✓</div>
              <div>
                <p className="text-white font-semibold">Content Strategy</p>
                <p className="text-gray-400 text-sm">Blog topics, posting frequency, content themes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-1">✓</div>
              <div>
                <p className="text-white font-semibold">Gap Analysis</p>
                <p className="text-gray-400 text-sm">Identify opportunities nobody is addressing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-green-400 mt-1">✓</div>
              <div>
                <p className="text-white font-semibold">Analysis History</p>
                <p className="text-gray-400 text-sm">Save and revisit past competitive analyses</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            What would normally cost $10,000 from a consultant
          </p>
          <Link
            href={user ? '/dashboard/new' : '/signup'}
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-colors"
          >
            Start Free Analysis
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/10 text-center text-gray-400 text-sm">
        <p>Built with Next.js, Supabase, Firecrawl, and Claude AI</p>
      </footer>
    </div>
  )
}
