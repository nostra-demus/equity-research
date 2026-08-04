// Evidence-gated first-look admission for themes. Clustering answers only "which headlines look related?";
// this layer answers the stricter portfolio question: "is there a current, corroborated narrative with a
// ticker-linked expression worth checking?" Heat remains visible, but it never substitutes for these gates.

import { cleanTicker } from '../symbology'
import { companyKeys, isRoutineFiling, normName, themeNarrativeTokens } from '../text-match'
import { rebuildThemeCompanies } from './assign'
import { themeStoryKey } from './story-key'
import type {
  Theme,
  ThemeAssessment,
  ThemeAssessmentStatus,
  ThemeCompany,
  ThemeEvidence,
  ThemeMember,
  ThemeSummary,
} from './types'

const HOUR_MS = 3_600_000
const MAX_FUTURE_SKEW_MS = 5 * 60_000
const SUPPORTED_SOURCE_TIERS = new Set(['primary_filing', 'official_data', 'company', 'news'])
const SOURCE_PRIORITY: Record<string, number> = { primary_filing: 4, official_data: 3, company: 2, news: 1 }
const STATUS_ORDER: Record<ThemeAssessmentStatus, number> = { actionable: 0, forming: 1, context: 2 }

// High-volume shareholder-law-firm solicitations are lead-generation adverts, not independent evidence
// that an operating/market narrative is recurring. They often arrive under different headlines and can
// otherwise clear a token-coherence gate after an LLM gives the cluster a polished name.
const LAW_FIRM_SOLICITATION_RES: RegExp[] = [
  /\binvestors?\s+have\s+(?:an?\s+)?opportunity\s+to\s+lead\b.{0,160}\b(?:securities|fraud|lawsuit|class action)\b/i,
  /\b(?:shareholder|investor)\s+alerts?\b/i,
  /\b(?:law firm|law offices|pomerantz|rosen law|levi\s*&\s*korsinsky|kahn swick|bragar eagel|glancy prongay)\b.{0,120}\binvestigat(?:es|ing)\s+(?:potential\s+)?claims?\b/i,
  /\binvestigat(?:es|ing)\s+(?:potential\s+)?claims?\s+on\s+behalf\s+of\s+(?:investors|shareholders)\b/i,
]

const arr = <T>(v: T[] | null | undefined): T[] => (Array.isArray(v) ? v : [])

/** Stable headline form used only for duplicate detection. The displayed evidence stays verbatim. */
export function normalizeEvidenceHeadline(headline: unknown): string {
  return String(headline ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ')
}

const ageHours = (foundAt: string, nowMs: number): number => {
  const ms = Date.parse(foundAt)
  if (!Number.isFinite(ms) || !Number.isFinite(nowMs) || ms > nowMs + MAX_FUTURE_SKEW_MS) return Number.POSITIVE_INFINITY
  return Math.max(0, (nowMs - ms) / HOUR_MS)
}

const supportedSource = (m: ThemeMember): boolean => SUPPORTED_SOURCE_TIERS.has(String(m.tier || '').toLowerCase())
const evidenceHeadline = (m: ThemeMember): string => String((m.headline_en && m.headline_en.trim()) || m.headline || '').trim()

export function isThemeEvidenceNoise(headline: unknown): boolean {
  const h = String(headline || '')
  return LAW_FIRM_SOLICITATION_RES.some((re) => re.test(h))
}

/** One row per actual story family. Used for honest first-look volume before any quality gate. */
export function uniqueThemeMembers(members: ThemeMember[]): ThemeMember[] {
  const candidates = arr(members).slice()
    .sort((a, b) => {
      const ta = Date.parse(a.found_at); const tb = Date.parse(b.found_at)
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0) || (b.score || 0) - (a.score || 0)
    })
  const seenStories = new Set<string>()
  const out: ThemeMember[] = []
  for (const m of candidates) {
    const headline = normalizeEvidenceHeadline(evidenceHeadline(m))
    const story = themeStoryKey(m) || `headline:${headline}`
    if (seenStories.has(story)) continue
    seenStories.add(story)
    out.push(m)
  }
  return out
}

/**
 * One non-routine row per actual story family. Routine paperwork can provide company context in the
 * deep dive, but it cannot corroborate an investable narrative.
 */
export function uniqueThemeEvidenceMembers(members: ThemeMember[]): ThemeMember[] {
  const candidates = arr(members).filter((m) => {
    const headline = evidenceHeadline(m)
    return !isRoutineFiling(headline, m.tier) && !isThemeEvidenceNoise(headline)
  }).slice().sort((a, b) => {
    const quality = (SOURCE_PRIORITY[String(b.tier || '').toLowerCase()] || 0) - (SOURCE_PRIORITY[String(a.tier || '').toLowerCase()] || 0)
    if (quality) return quality
    const ta = Date.parse(a.found_at); const tb = Date.parse(b.found_at)
    return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0) || (b.score || 0) - (a.score || 0)
  })
  const seenStories = new Set<string>()
  const seenHeadlines = new Set<string>()
  return candidates.filter((m) => {
    const headline = normalizeEvidenceHeadline(evidenceHeadline(m))
    const story = themeStoryKey(m) || `headline:${headline}`
    if (seenStories.has(story) || (headline && seenHeadlines.has(headline))) return false
    seenStories.add(story)
    if (headline) seenHeadlines.add(headline)
    return true
  })
}

function narrativeTokensFor(m: ThemeMember): Set<string> {
  // Shared discovery/assignment primitive removes normalized issuer keys/tickers AND the words inside
  // issuer names ("Rocket", "Lab"). An issuer timeline cannot manufacture narrative coherence.
  return themeNarrativeTokens(evidenceHeadline(m), Array.isArray(m.companies) ? m.companies : [], m.tier)
}

function hasSpecificNarrative(theme: Theme, companies: ThemeCompany[]): boolean {
  const name = String(theme.name || '').trim()
  const description = String(theme.description || '').trim()
  if (theme.needs_rename) return false
  if (!name || /^emerging cluster$/i.test(name) || name.includes(' · ')) return false
  // A bare company label is a company feed, not a multi-company investment narrative.
  const nameKey = normName(name)
  if (nameKey && arr(companies).some((c) => c && (c.name_key === nameKey || normName(c.name) === nameKey))) return false
  if (!description || /^recurring news around\b/i.test(description) || normalizeEvidenceHeadline(description) === normalizeEvidenceHeadline(name)) return false
  // Only an explicit validator pass admits a narrative. Raw deterministic clusters remain useful context,
  // but even a coherent-looking auto label cannot enter the valuable lanes without that adjudication.
  return theme.generation === 'groq' || theme.generation === 'claude'
}

function evidenceRow(m: ThemeMember): ThemeEvidence {
  return {
    event_id: String(m.event_id || ''),
    headline: evidenceHeadline(m),
    found_at: String(m.found_at || ''),
    score: Number.isFinite(Number(m.score)) ? Math.max(0, Math.min(100, Number(m.score))) : 0,
    source_tier: String(m.tier || 'unconfirmed'),
  }
}

/** Earliest member timestamp for a slice; fallback is used only when the slice has no valid row. */
export function firstSeenForMembers(members: ThemeMember[], fallback: string): string {
  let first = ''
  for (const m of arr(members)) {
    if (!Number.isFinite(Date.parse(m.found_at))) continue
    if (!first || m.found_at < first) first = m.found_at
  }
  return first || fallback
}

/** Rebuild company placement from ONLY these members. Used by geo/commodity slices to prevent a global
 *  company, side, mention count, or last-seen value leaking into a filtered first-look. */
export function companiesForMembers(theme: Theme, members: ThemeMember[]): ThemeCompany[] {
  const sliced: Theme = { ...theme, members: arr(members), companies: [], sectors: [] }
  rebuildThemeCompanies(sliced)
  return sliced.companies
}

export interface QualifiedTheme {
  assessment: ThemeAssessment
  evidence: ThemeEvidence[]
  /** The exact directional expression whose supporting row is pinned into `evidence`. Internal projection
   *  metadata only: buildSummary uses it to keep the same company visible after the top-company cap. */
  expression_company_key: string | null
}

/** Assess a theme (or a caller-provided slice) using explicit admission gates, never a hidden score. */
export function qualifyTheme(
  theme: Theme,
  now: Date = new Date(),
  members: ThemeMember[] = arr(theme.members),
  companies: ThemeCompany[] = arr(theme.companies),
): QualifiedTheme {
  const nowMs = now.getTime()
  // Invalid timestamps and evidence beyond the same five-minute source-clock allowance used by Ideas are
  // not observations yet. Exclude them from every gate and from displayed proof, not only from recency.
  const unique = uniqueThemeEvidenceMembers(members).filter((m) => Number.isFinite(ageHours(m.found_at, nowMs)))
  const highQuality = unique.filter(supportedSource)

  // Coherence needs ONE shared narrative core. Counting the union of every independently recurring token
  // lets two disconnected two-story narratives report 100% coherence. Instead, rank declared anchor PAIRS
  // by the number of rows in which the pair co-occurs, choose one pair, and support only its rows.
  const declared = new Set(arr(theme.keywords).map((k) => String(k).toLowerCase()).filter(Boolean))
  const tokenSets = new Map<ThemeMember, Set<string>>()
  const pairFrequency = new Map<string, number>()
  for (const m of highQuality) {
    const tokens = new Set([...narrativeTokensFor(m)].filter((token) => declared.has(token)))
    tokenSets.set(m, tokens)
    const ordered = [...tokens].sort()
    for (let i = 0; i < ordered.length; i++) {
      for (let j = i + 1; j < ordered.length; j++) {
        const key = `${ordered[i]}\u0000${ordered[j]}`
        pairFrequency.set(key, (pairFrequency.get(key) || 0) + 1)
      }
    }
  }
  const anchorKey = [...pairFrequency.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0]
  const anchorPair = anchorKey ? anchorKey.split('\u0000') : []
  const supportedMembers = anchorPair.length === 2
    ? highQuality.filter((m) => anchorPair.every((token) => tokenSets.get(m)?.has(token)))
    : []
  // Expose the complete core shared by those rows (the selected pair plus any additional common anchors).
  const recurring = new Set<string>()
  if (supportedMembers.length >= 2) {
    for (const token of tokenSets.get(supportedMembers[0]) || []) {
      if (supportedMembers.every((m) => tokenSets.get(m)?.has(token))) recurring.add(token)
    }
  }
  // Recency is a change metric for the recurring narrative, not generic traffic. Off-theme contamination
  // on an old coherent cluster must not make it look newly alive.
  const recent = supportedMembers.filter((m) => ageHours(m.found_at, nowMs) <= 6)
  const prior = supportedMembers.filter((m) => {
    const age = ageHours(m.found_at, nowMs)
    return age > 6 && age <= 12
  })

  // A surfaced expression must be direct, directional, ticker-linked, and named in a supporting row.
  // cleanTicker proves only syntax (not listing/liquidity); the company-key join proves the placement.
  const directionalTickers = companies.filter((c) => {
    if (c.order !== 1 || c.side === 'mixed' || !cleanTicker(c.ticker)) return false
    return supportedMembers.some((m) => companyKeys(Array.isArray(m.companies) ? m.companies : []).has(c.name_key))
  })
  const expressionCompany = directionalTickers[0]
  const expressionProof = expressionCompany
    ? supportedMembers
      .filter((m) => companyKeys(Array.isArray(m.companies) ? m.companies : []).has(expressionCompany.name_key))
      .sort((a, b) => (Date.parse(b.found_at) || 0) - (Date.parse(a.found_at) || 0) || (b.score || 0) - (a.score || 0))[0]
    : undefined

  const uniqueCount = unique.length
  const supportCount = supportedMembers.length
  const coherencePct = uniqueCount ? Math.round((supportCount / uniqueCount) * 100) : 0
  const metrics = {
    recent_6h_flow: recent.length,
    prior_6h_flow: prior.length,
    unique_evidence_count: uniqueCount,
    high_quality_evidence_count: highQuality.length,
    narrative_support_count: supportCount,
    narrative_coherence_pct: coherencePct,
    recurring_narrative_token_count: recurring.size,
    first_order_directional_ticker_count: directionalTickers.length,
  }

  const narrativeReady = hasSpecificNarrative(theme, companies)
  const recentReady = metrics.recent_6h_flow >= 2
  const evidenceReady = metrics.unique_evidence_count >= 2 && metrics.high_quality_evidence_count >= 2
  const coherent = metrics.recurring_narrative_token_count >= 2 && metrics.narrative_support_count >= 2 && metrics.narrative_coherence_pct >= 60
  const expressionReady = metrics.first_order_directional_ticker_count >= 1

  const reasons: string[] = []
  const blockers: string[] = []
  if (narrativeReady) reasons.push('The theme has a specific narrative, not an automatic cluster label.')
  else if (theme.needs_rename) blockers.push('Needs a fresh validator pass because the current name and description predate a material identity change.')
  else blockers.push('Needs a specific, validated narrative; an automatic company or keyword label is not an investment thesis.')
  if (recentReady) reasons.push(`${metrics.recent_6h_flow} distinct supporting stories landed in the last 6 hours.`)
  else blockers.push(`Needs at least 2 distinct supporting stories in the last 6 hours; has ${metrics.recent_6h_flow}.`)
  if (evidenceReady) reasons.push(`${metrics.high_quality_evidence_count} non-routine evidence rows come from supported source tiers.`)
  else blockers.push(`Needs at least 2 distinct non-routine filing, official, company, or news rows; has ${metrics.high_quality_evidence_count}.`)
  if (coherent) reasons.push(`${metrics.narrative_support_count} of ${metrics.unique_evidence_count} distinct evidence rows repeat at least 2 narrative anchors.`)
  else blockers.push(`Needs a recurring narrative across at least 2 evidence rows (2+ recurring anchors and 60% coherence); has ${metrics.recurring_narrative_token_count} anchors, ${metrics.narrative_support_count} supporting rows, and ${metrics.narrative_coherence_pct}%.`)
  if (expressionReady) reasons.push(`${metrics.first_order_directional_ticker_count} ticker-linked first-order beneficiary or harmed name has source proof.`)
  else blockers.push('Needs at least one ticker-linked first-order beneficiary or harmed name in supporting evidence; listing and liquidity are checked later.')

  const status: ThemeAssessmentStatus = narrativeReady && recentReady && evidenceReady && coherent && expressionReady
    ? 'actionable'
    // "Forming" is part of a current-only first look, not an archive of every model-named cluster. It
    // needs at least one CURRENT row carrying the recurring narrative core. A validated but dormant theme,
    // or fresh off-theme contamination on an old narrative, belongs in collapsed Context until the core
    // itself moves again.
    : narrativeReady && metrics.recent_6h_flow >= 1 ? 'forming' : 'context'

  // Put stories carrying the recurring narrative first; within that proof set show the newest raw rows.
  const byNewest = (a: ThemeMember, b: ThemeMember) => (Date.parse(b.found_at) || 0) - (Date.parse(a.found_at) || 0) || (b.score || 0) - (a.score || 0)
  const supportedProof = supportedMembers.slice().sort(byNewest)
  const otherProof = highQuality.filter((m) => !supportedMembers.includes(m)).sort(byNewest)
  // An actionable theme's evidence is also an input seam for Ideas. Never let a high-quality but
  // off-narrative contaminant inherit the theme's admission or provenance merely because the display has
  // room for a third row. Forming/Context may still show such rows diagnostically in the deep read.
  const evidenceMembers = (status === 'actionable' ? supportedProof : [...supportedProof, ...otherProof]).slice(0, 3)
  // The expression gate is meaningless if the capped evidence rows hide the source that cleared it.
  if (expressionProof && !evidenceMembers.includes(expressionProof)) {
    if (evidenceMembers.length >= 3) evidenceMembers[evidenceMembers.length - 1] = expressionProof
    else evidenceMembers.push(expressionProof)
  }
  return {
    assessment: { status, reasons, blockers, metrics },
    evidence: evidenceMembers.map(evidenceRow),
    expression_company_key: expressionCompany?.name_key || null,
  }
}

/** Explicit first-look ordering: admission class first, then raw evidence facts, then legacy heat. */
export function compareThemeSummaries(a: ThemeSummary, b: ThemeSummary): number {
  const am = a.assessment.metrics; const bm = b.assessment.metrics
  return STATUS_ORDER[a.assessment.status] - STATUS_ORDER[b.assessment.status]
    || (bm.recent_6h_flow - bm.prior_6h_flow) - (am.recent_6h_flow - am.prior_6h_flow)
    || bm.recent_6h_flow - am.recent_6h_flow
    || bm.first_order_directional_ticker_count - am.first_order_directional_ticker_count
    || bm.narrative_support_count - am.narrative_support_count
    || bm.high_quality_evidence_count - am.high_quality_evidence_count
    || b.composite - a.composite
    || (a.last_flow < b.last_flow ? 1 : a.last_flow > b.last_flow ? -1 : 0)
}
