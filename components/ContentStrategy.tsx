/**
 * Content Strategy Component
 * Shows content topics and posting frequency
 */

import type { ContentStrategy as ContentStrategyType } from '@/lib/ai/analyzer'

interface Props {
  contentData: ContentStrategyType[]
}

export default function ContentStrategy({ contentData }: Props) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">📝</div>
        <h2 className="text-3xl font-bold text-white">Content Strategy</h2>
      </div>

      {contentData.length === 0 ? (
        <p className="text-gray-400 italic">No content data available</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentData.map((company, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-xl p-6 border border-white/10"
            >
              <h3 className="text-xl font-semibold text-white mb-4">
                {company.company}
              </h3>

              {/* Posting Frequency */}
              {company.postingFrequency && (
                <div className="mb-4 inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  {company.postingFrequency}
                </div>
              )}

              {/* Main Topics */}
              {company.topics.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                    Main Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {company.topics.map((topic, topicIndex) => (
                      <span
                        key={topicIndex}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Topics */}
              {company.recentTopics.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase mb-2">
                    Recent Content
                  </h4>
                  <ul className="space-y-2">
                    {company.recentTopics.map((topic, topicIndex) => (
                      <li
                        key={topicIndex}
                        className="text-gray-300 text-sm flex items-start gap-2"
                      >
                        <span className="text-purple-400 mt-1 flex-shrink-0">
                          •
                        </span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {company.topics.length === 0 &&
                company.recentTopics.length === 0 &&
                !company.postingFrequency && (
                  <p className="text-gray-500 italic text-sm">
                    No content data found
                  </p>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
