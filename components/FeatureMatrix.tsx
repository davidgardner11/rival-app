/**
 * Feature Comparison Matrix Component
 * Shows which features each competitor has
 */

import type { FeatureMatrix as FeatureMatrixType } from '@/lib/ai/analyzer'

interface Props {
  featureMatrix: FeatureMatrixType
}

export default function FeatureMatrix({ featureMatrix }: Props) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">📊</div>
        <h2 className="text-3xl font-bold text-white">Feature Comparison</h2>
      </div>

      {featureMatrix.features.length === 0 ? (
        <p className="text-gray-400 italic">No features identified</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                  Feature
                </th>
                {featureMatrix.companies.map((company, index) => (
                  <th
                    key={index}
                    className="text-center py-4 px-4 text-gray-300 font-semibold"
                  >
                    {company.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureMatrix.features.map((feature, featureIndex) => (
                <tr
                  key={featureIndex}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4 text-white font-medium">
                    {feature}
                  </td>
                  {featureMatrix.companies.map((company, companyIndex) => (
                    <td key={companyIndex} className="text-center py-4 px-4">
                      {company.hasFeature[featureIndex] ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500/20 text-green-400 rounded-full text-sm font-bold">
                          ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500/20 text-red-400 rounded-full text-sm font-bold">
                          ✗
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
