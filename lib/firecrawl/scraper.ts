/**
 * Firecrawl Web Scraping Utility
 */

export interface ScrapedPage {
  url: string
  title: string
  markdown: string
  error?: string
}

export interface CompanyData {
  url: string
  name: string
  domain: string
  pages: ScrapedPage[]
  competitors?: string[]
}

/**
 * Scrape a single URL using Firecrawl
 */
export async function scrapeUrl(url: string): Promise<ScrapedPage> {
  const apiKey = process.env.FIRECRAWL_API_KEY

  if (!apiKey) {
    throw new Error('FIRECRAWL_API_KEY not set')
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`Firecrawl error for ${url}:`, error)
      return {
        url,
        title: '',
        markdown: '',
        error: `Scraping failed: ${response.status}`,
      }
    }

    const data = await response.json()

    return {
      url,
      title: data.data?.metadata?.title || '',
      markdown: data.data?.markdown || '',
    }
  } catch (error) {
    console.error(`Error scraping ${url}:`, error)
    return {
      url,
      title: '',
      markdown: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url
  }
}

/**
 * Normalize URL (add https if missing)
 */
export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`
  }
  return url
}

/**
 * Discover key pages for a domain (pricing, features, about)
 * Returns array of URLs to scrape
 */
export function discoverPages(baseUrl: string): string[] {
  const domain = normalizeUrl(baseUrl)
  const paths = [
    '', // homepage
    '/pricing',
    '/plans',
    '/features',
    '/product',
    '/about',
  ]

  return paths.map((path) => `${domain}${path}`)
}

/**
 * Scrape company with key pages
 * Includes rate limiting (12s delay between requests to respect 5 RPM limit)
 */
export async function scrapeCompany(
  url: string,
  onProgress?: (message: string) => void
): Promise<CompanyData> {
  const domain = extractDomain(url)
  const normalized = normalizeUrl(url)

  onProgress?.(`Scraping ${domain}...`)

  // Scrape homepage first
  const homepage = await scrapeUrl(normalized)

  // Try pricing and features pages
  const pricingUrl = `${normalized}/pricing`
  const featuresUrl = `${normalized}/features`

  // Rate limiting: 12 second delay between requests (5 RPM = 1 request per 12 seconds)
  await delay(12000)
  onProgress?.(`Scraping ${domain}/pricing...`)
  const pricing = await scrapeUrl(pricingUrl)

  await delay(12000)
  onProgress?.(`Scraping ${domain}/features...`)
  const features = await scrapeUrl(featuresUrl)

  const pages = [homepage, pricing, features].filter((p) => p.markdown.length > 0)

  return {
    url: normalized,
    name: homepage.title || domain,
    domain,
    pages,
  }
}

/**
 * Delay utility for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Extract competitor names from scraped content using regex patterns
 * This is a simple approach - AI analysis will do better
 */
export function extractCompetitorsSimple(markdown: string): string[] {
  // Common patterns in competitive pages
  const competitorPatterns = [
    /vs\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
    /compared?\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
    /alternative\s+to\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/gi,
  ]

  const competitors = new Set<string>()

  for (const pattern of competitorPatterns) {
    const matches = markdown.matchAll(pattern)
    for (const match of matches) {
      if (match[1]) {
        competitors.add(match[1].trim())
      }
    }
  }

  return Array.from(competitors).slice(0, 5) // Max 5 competitors
}
