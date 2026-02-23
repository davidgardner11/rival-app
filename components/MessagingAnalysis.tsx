/**
 * Messaging Analysis Component
 * Shows headline, CTA, and value props for each competitor
 */

import type { MessagingAnalysis as MessagingAnalysisType } from '@/lib/ai/analyzer'

interface Props {
  messagingData: MessagingAnalysisType[]
}

export default function MessagingAnalysis({ messagingData }: Props) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">💬</div>
        <h2 className="text-3xl font-bold text-white">Messaging & Positioning</h2>
      </div>

      {messagingData.length === 0 ? (
        <p className="text-gray-400 italic">No messaging data available</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {messagingData.map((company, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-colors"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                {company.company}
              </h3>

              {/* Headline */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                  Main Headline
                </h4>
                <p className="text-white text-lg font-medium leading-relaxed">
                  {company.headline || (
                    <span className="text-gray-500 italic">Not found</span>
                  )}
                </p>
              </div>

              {/* CTA */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                  Primary CTA
                </h4>
                {company.cta ? (
                  <span className="inline-block px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg font-medium">
                    {company.cta}
                  </span>
                ) : (
                  <span className="text-gray-500 italic">Not found</span>
                )}
              </div>

              {/* Value Props */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                  Value Propositions
                </h4>
                {company.valueProps.length > 0 ? (
                  <ul className="space-y-2">
                    {company.valueProps.map((prop, propIndex) => (
                      <li
                        key={propIndex}
                        className="flex items-center gap-2 text-gray-300"
                      >
                        <span className="text-purple-400 flex-shrink-0">
                          →
                        </span>
                        <span>{prop}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">None identified</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
