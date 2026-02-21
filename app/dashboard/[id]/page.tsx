/**
 * Analysis Detail Page
 * Displays competitive intelligence report
 */

import Link from 'next/link'
import { getAnalysis } from '@/app/actions/analysis'
import { notFound } from 'next/navigation'
import FeatureMatrix from '@/components/FeatureMatrix'
import PricingTable from '@/components/PricingTable'
import MessagingAnalysis from '@/components/MessagingAnalysis'
import ContentStrategy from '@/components/ContentStrategy'
import GapAnalysis from '@/components/GapAnalysis'

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const analysis = await getAnalysis(id)

  if (!analysis) {
    notFound()
  }

  const isProcessing = analysis.status === 'processing'
  const isFailed = analysis.status === 'failed'
  const isCompleted = analysis.status === 'completed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="px-6 py-4 border-b border-white/10 sticky top-0 bg-gray-900/80 backdrop-blur-lg z-10">
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
      <main className="px-6 py-12 max-w-7xl mx-auto">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-white">
              {analysis.target_company?.name || 'Competitive Analysis'}
            </h1>
            {isProcessing && (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                Processing
              </span>
            )}
            {isCompleted && (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                ✓ Completed
              </span>
            )}
            {isFailed && (
              <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                ✗ Failed
              </span>
            )}
          </div>
          <p className="text-gray-400">
            {analysis.target_company?.domain} •{' '}
            {new Date(analysis.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 text-center">
            <div className="inline-block w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-2">
              Analysis in Progress
            </h2>
            <p className="text-gray-400 mb-4">
              Scraping websites and analyzing competitive landscape...
            </p>
            <p className="text-gray-500 text-sm">This typically takes 2-3 minutes</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          </div>
        )}

        {/* Failed State */}
        {isFailed && (
          <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl p-12 border border-red-500/50 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Analysis Failed
            </h2>
            <p className="text-gray-400 mb-4">{analysis.error_message}</p>
            <Link
              href="/dashboard/new"
              className="inline-block mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Try Again
            </Link>
          </div>
        )}

        {/* Completed State - Show All Insights */}
        {isCompleted && (
          <div className="space-y-8">
            {/* Gap Analysis - Show First (Most Important) */}
            {analysis.gap_analysis && (
              <GapAnalysis gapAnalysis={analysis.gap_analysis} />
            )}

            {/* Feature Matrix */}
            {analysis.feature_matrix && (
              <FeatureMatrix featureMatrix={analysis.feature_matrix} />
            )}

            {/* Pricing Comparison */}
            {analysis.pricing_comparison && (
              <PricingTable pricingData={analysis.pricing_comparison} />
            )}

            {/* Messaging Analysis */}
            {analysis.messaging_analysis && (
              <MessagingAnalysis messagingData={analysis.messaging_analysis} />
            )}

            {/* Content Strategy */}
            {analysis.content_strategy && (
              <ContentStrategy contentData={analysis.content_strategy} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
