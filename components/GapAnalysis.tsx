/**
 * Gap Analysis Component
 * Shows market opportunities and unaddressed needs
 */

import type { GapAnalysis as GapAnalysisType } from '@/lib/ai/analyzer'

interface Props {
  gapAnalysis: GapAnalysisType
}

export default function GapAnalysis({ gapAnalysis }: Props) {
  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/30 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">💡</div>
        <h2 className="text-3xl font-bold text-white">Gap Analysis</h2>
      </div>

      {/* Market Positioning */}
      <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">
          Market Positioning
        </h3>
        <p className="text-gray-300 leading-relaxed">
          {gapAnalysis.market_positioning}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Opportunities */}
        <div className="bg-white/5 rounded-xl p-6 border border-green-500/30">
          <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
            <span>🎯</span>
            Strategic Opportunities
          </h3>
          {gapAnalysis.opportunities.length > 0 ? (
            <ul className="space-y-3">
              {gapAnalysis.opportunities.map((opportunity, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-gray-300"
                >
                  <span className="text-green-400 flex-shrink-0">→</span>
                  <span>{opportunity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No opportunities identified</p>
          )}
        </div>

        {/* Unaddressed Needs */}
        <div className="bg-white/5 rounded-xl p-6 border border-yellow-500/30">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
            <span>⚠️</span>
            Unaddressed Needs
          </h3>
          {gapAnalysis.unaddressed_needs.length > 0 ? (
            <ul className="space-y-3">
              {gapAnalysis.unaddressed_needs.map((need, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-300">
                  <span className="text-yellow-400 flex-shrink-0">→</span>
                  <span>{need}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No unaddressed needs identified</p>
          )}
        </div>
      </div>
    </div>
  )
}
