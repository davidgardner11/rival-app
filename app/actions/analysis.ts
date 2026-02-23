/**
 * Analysis Server Actions
 * Core workflow: Scrape → Extract Competitors → Scrape Competitors → AI Analysis → Store
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { scrapeCompany, extractDomain, normalizeUrl } from '@/lib/firecrawl/scraper'
import { analyzeCompetitors, extractCompetitors } from '@/lib/ai/analyzer'
import type { CompanyData } from '@/lib/firecrawl/scraper'

export interface AnalysisStatus {
  id: string
  status: 'processing' | 'completed' | 'failed'
  progress?: string
  error?: string
}

/**
 * Create a new competitive analysis
 */
export async function createAnalysis(url: string): Promise<AnalysisStatus> {
  const supabase = await createClient()

  // 1. Validate user authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // 2. Validate and normalize URL
  const normalized = normalizeUrl(url)
  const domain = extractDomain(url)

  // 3. Create analysis record
  const { data: analysis, error: insertError } = await supabase
    .from('analyses')
    .insert({
      user_id: user.id,
      status: 'processing',
    })
    .select()
    .single()

  if (insertError || !analysis) {
    console.error('Error creating analysis:', insertError)
    throw new Error('Failed to create analysis')
  }

  // 4. Start background processing (don't await - let it run async)
  processAnalysis(analysis.id, normalized, domain).catch((error) => {
    console.error('Error in background processing:', error)
  })

  revalidatePath('/dashboard')

  return {
    id: analysis.id,
    status: 'processing',
  }
}

/**
 * Background processing function
 */
async function processAnalysis(
  analysisId: string,
  url: string,
  domain: string
): Promise<void> {
  const supabase = await createClient()

  try {
    // Progress tracking helper
    const updateProgress = async (progress: string) => {
      console.log(`[${analysisId}] ${progress}`)
      // Update progress in database for polling
      await supabase
        .from('analyses')
        .update({ progress_message: progress })
        .eq('id', analysisId)
    }

    // Step 1: Scrape target company
    updateProgress(`Scraping target company: ${domain}`)

    const targetCompany = await scrapeCompany(url, (msg) => updateProgress(msg))

    if (!targetCompany.pages.length) {
      throw new Error('Failed to scrape target company')
    }

    // Step 2: Store target company in database
    const { data: companyRecord } = await supabase
      .from('companies')
      .upsert(
        {
          url: targetCompany.url,
          name: targetCompany.name,
          domain: targetCompany.domain,
          scraped_data: { pages: targetCompany.pages },
          last_scraped_at: new Date().toISOString(),
        },
        { onConflict: 'domain' }
      )
      .select()
      .single()

    if (!companyRecord) {
      throw new Error('Failed to store target company')
    }

    // Step 3: Extract competitors using AI
    updateProgress('Identifying competitors...')

    const competitorNames = await extractCompetitors(targetCompany)

    if (!competitorNames.length) {
      throw new Error('No competitors found')
    }

    updateProgress(`Found ${competitorNames.length} competitors`)

    // Step 4: Scrape competitors
    const competitors: CompanyData[] = []
    const competitorIds: string[] = []

    for (const competitorName of competitorNames) {
      try {
        // Construct competitor URL (simple approach - add .com)
        // In production, you'd want better URL resolution
        const competitorUrl = `https://${competitorName.toLowerCase().replace(/\s+/g, '')}.com`

        updateProgress(`Scraping competitor: ${competitorName}`)

        const competitorData = await scrapeCompany(competitorUrl, (msg) =>
          updateProgress(msg)
        )

        if (competitorData.pages.length > 0) {
          competitors.push(competitorData)

          // Store competitor in database
          const { data: competitorRecord } = await supabase
            .from('companies')
            .upsert(
              {
                url: competitorData.url,
                name: competitorData.name,
                domain: competitorData.domain,
                scraped_data: { pages: competitorData.pages },
                last_scraped_at: new Date().toISOString(),
              },
              { onConflict: 'domain' }
            )
            .select()
            .single()

          if (competitorRecord) {
            competitorIds.push(competitorRecord.id)
          }
        }
      } catch (error) {
        console.error(`Error scraping competitor ${competitorName}:`, error)
        // Continue with other competitors
      }
    }

    if (!competitors.length) {
      throw new Error('Failed to scrape any competitors')
    }

    // Step 5: Run AI analysis
    updateProgress('Analyzing competitive landscape...')

    const analysisResult = await analyzeCompetitors(targetCompany, competitors)

    // Step 6: Update analysis record with results
    const { error: updateError } = await supabase
      .from('analyses')
      .update({
        target_company_id: companyRecord.id,
        competitor_company_ids: competitorIds,
        feature_matrix: analysisResult.feature_matrix,
        pricing_comparison: analysisResult.pricing_comparison,
        messaging_analysis: analysisResult.messaging_analysis,
        content_strategy: analysisResult.content_strategy,
        gap_analysis: analysisResult.gap_analysis,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', analysisId)

    if (updateError) {
      throw updateError
    }

    updateProgress('Analysis complete!')

    // Note: revalidatePath cannot be called in async background functions in Next.js 15
    // Users will need to manually refresh or we'll implement polling/SSE for updates
  } catch (error) {
    console.error('Processing error:', error)

    // Update analysis with error status
    await supabase
      .from('analyses')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', analysisId)

    // Note: revalidatePath cannot be called in async background functions in Next.js 15
  }
}

/**
 * Get a single analysis by ID
 */
export async function getAnalysis(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: analysis, error } = await supabase
    .from('analyses')
    .select(
      `
      *,
      target_company:companies!target_company_id(*)
    `
    )
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching analysis:', error)
    return null
  }

  return analysis
}

/**
 * List all analyses for current user
 */
export async function listAnalyses() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: analyses, error } = await supabase
    .from('analyses')
    .select(
      `
      *,
      target_company:companies!target_company_id(*)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching analyses:', error)
    return []
  }

  return analyses || []
}

/**
 * Delete an analysis
 */
export async function deleteAnalysis(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting analysis:', error)
    throw new Error('Failed to delete analysis')
  }

  revalidatePath('/dashboard')

  return { success: true }
}
