/**
 * Pricing Comparison Table Component
 */

import type { PricingTier } from '@/lib/ai/analyzer'

interface Props {
  pricingData: PricingTier[]
}

export default function PricingTable({ pricingData }: Props) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">💰</div>
        <h2 className="text-3xl font-bold text-white">Pricing Comparison</h2>
      </div>

      {pricingData.length === 0 ? (
        <p className="text-gray-400 italic">No pricing data available</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingData.map((company, companyIndex) => (
            <div key={companyIndex} className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">
                {company.company}
              </h3>

              {company.tiers.length === 0 ? (
                <p className="text-gray-400 text-sm italic">
                  No pricing tiers found
                </p>
              ) : (
                <div className="space-y-3">
                  {company.tiers.map((tier, tierIndex) => (
                    <div
                      key={tierIndex}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-blue-500/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">
                          {tier.name}
                        </h4>
                        <span className="text-blue-400 font-bold">
                          {tier.price}
                        </span>
                      </div>
                      {tier.features.length > 0 && (
                        <ul className="mt-3 space-y-1">
                          {tier.features.slice(0, 5).map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className="text-gray-400 text-sm flex items-start gap-2"
                            >
                              <span className="text-green-400 mt-0.5 flex-shrink-0">
                                •
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                          {tier.features.length > 5 && (
                            <li className="text-gray-500 text-xs italic">
                              +{tier.features.length - 5} more features
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
