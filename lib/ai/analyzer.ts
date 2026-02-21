/**
 * AI Analysis using Claude API with Prompt Caching
 */

import Anthropic from '@anthropic-ai/sdk'
import type { CompanyData } from '../firecrawl/scraper'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface FeatureMatrix {
  features: string[]
  companies: {
    name: string
    hasFeature: boolean[]
  }[]
}

export interface PricingTier {
  company: string
  tiers: {
    name: string
    price: string
    features: string[]
  }[]
}

export interface MessagingAnalysis {
  company: string
  headline: string
  cta: string
  valueProps: string[]
}

export interface ContentStrategy {
  company: string
  topics: string[]
  postingFrequency?: string
  recentTopics: string[]
}

export interface GapAnalysis {
  opportunities: string[]
  unaddressed_needs: string[]
  market_positioning: string
}

export interface CompetitiveAnalysis {
  feature_matrix: FeatureMatrix
  pricing_comparison: PricingTier[]
  messaging_analysis: MessagingAnalysis[]
  content_strategy: ContentStrategy[]
  gap_analysis: GapAnalysis
}

/**
 * System prompt for competitive analysis (will be cached)
 */
const SYSTEM_PROMPT = `You are a competitive intelligence analyst. You analyze scraped website data from companies and generate comprehensive competitive analysis reports.

Your analysis must include:

1. **Feature Matrix**: Identify key features across all companies and create a comparison matrix showing which companies have which features. Focus on product capabilities, not marketing fluff.

2. **Pricing Comparison**: Extract pricing tiers, plans, and costs for each company. Include what features are in each tier.

3. **Messaging Analysis**: Analyze the homepage headline, primary CTA, and key value propositions for each company. What is their positioning strategy?

4. **Content Strategy**: If blog/content is available, identify the main topics they write about, estimated posting frequency, and recent themes.

5. **Gap Analysis**: Identify opportunities in the market that NO competitor is addressing. What needs are unmet? Where is there white space?

**Output Format**: Respond with ONLY valid JSON matching this structure:

\`\`\`json
{
  "feature_matrix": {
    "features": ["Feature 1", "Feature 2", ...],
    "companies": [
      {"name": "Company Name", "hasFeature": [true, false, ...]}
    ]
  },
  "pricing_comparison": [
    {
      "company": "Company Name",
      "tiers": [
        {"name": "Free", "price": "$0", "features": ["Feature 1", "Feature 2"]}
      ]
    }
  ],
  "messaging_analysis": [
    {
      "company": "Company Name",
      "headline": "Main headline text",
      "cta": "Primary call to action",
      "valueProps": ["Value prop 1", "Value prop 2"]
    }
  ],
  "content_strategy": [
    {
      "company": "Company Name",
      "topics": ["Topic 1", "Topic 2"],
      "postingFrequency": "Weekly",
      "recentTopics": ["Recent topic 1"]
    }
  ],
  "gap_analysis": {
    "opportunities": ["Opportunity 1", "Opportunity 2"],
    "unaddressed_needs": ["Need 1", "Need 2"],
    "market_positioning": "Summary of where the market is positioned and where gaps exist"
  }
}
\`\`\`

Be thorough but concise. Focus on actionable insights. If data is missing for a company, still include them with empty/null values.`

/**
 * Analyze competitive landscape
 */
export async function analyzeCompetitors(
  targetCompany: CompanyData,
  competitors: CompanyData[]
): Promise<CompetitiveAnalysis> {
  // Build user prompt with scraped data
  const allCompanies = [targetCompany, ...competitors]

  let userPrompt = `Analyze the following companies and generate a competitive intelligence report.\n\n`

  for (const company of allCompanies) {
    userPrompt += `## ${company.name} (${company.domain})\n\n`

    for (const page of company.pages) {
      userPrompt += `### ${page.url}\n\n`
      userPrompt += `${page.markdown.slice(0, 10000)}\n\n` // Limit each page to 10k chars
      userPrompt += `---\n\n`
    }
  }

  userPrompt += `\nGenerate the competitive analysis as JSON.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }, // Cache this system prompt
        },
      ],
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    // Extract JSON from response
    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // Parse JSON from code block or raw text
    let jsonText = content.text.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '')
    }

    const analysis: CompetitiveAnalysis = JSON.parse(jsonText)

    // Log usage for monitoring
    console.log('Claude API Usage:', {
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      cacheCreationTokens: (message.usage as any).cache_creation_input_tokens,
      cacheReadTokens: (message.usage as any).cache_read_input_tokens,
    })

    return analysis
  } catch (error) {
    console.error('AI Analysis Error:', error)

    // Return empty analysis structure on error
    return {
      feature_matrix: {
        features: [],
        companies: allCompanies.map((c) => ({ name: c.name, hasFeature: [] })),
      },
      pricing_comparison: allCompanies.map((c) => ({
        company: c.name,
        tiers: [],
      })),
      messaging_analysis: allCompanies.map((c) => ({
        company: c.name,
        headline: '',
        cta: '',
        valueProps: [],
      })),
      content_strategy: allCompanies.map((c) => ({
        company: c.name,
        topics: [],
        recentTopics: [],
      })),
      gap_analysis: {
        opportunities: ['Analysis failed - please try again'],
        unaddressed_needs: [],
        market_positioning: 'Error generating analysis',
      },
    }
  }
}

/**
 * Extract competitor names from scraped content using AI
 */
export async function extractCompetitors(
  companyData: CompanyData
): Promise<string[]> {
  const content = companyData.pages.map((p) => p.markdown).join('\n\n')

  // Limit content to 20k characters to save tokens
  const truncated = content.slice(0, 20000)

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Analyze this company's website content and identify 3-5 direct competitors mentioned or implied. Return ONLY a JSON array of competitor company names, nothing else.

Website content:
${truncated}

Response format: ["Competitor 1", "Competitor 2", "Competitor 3"]`,
        },
      ],
    })

    const content_response = message.content[0]
    if (content_response.type !== 'text') {
      return []
    }

    let jsonText = content_response.text.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '')
    }

    const competitors: string[] = JSON.parse(jsonText)

    return competitors.slice(0, 5) // Max 5 competitors
  } catch (error) {
    console.error('Error extracting competitors:', error)
    return []
  }
}
