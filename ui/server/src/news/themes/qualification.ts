// Evidence-gated first-look admission for themes. Clustering answers only "which headlines look related?";
// this layer answers the stricter portfolio question: "is there a current, corroborated narrative with a
// ticker-linked expression worth checking?" Heat remains visible, but it never substitutes for these gates.

import { cleanTicker } from '../symbology'
import { companyKeys, isRoutineFiling, normName } from '../text-match'
import { rebuildThemeCompanies } from './assign'
import { themeStoryKey } from './story-key'
import { selectNarrativeCore } from './core'
import { hasExactThemeProvenance, isDisplayableThemeChallenge, isSupportingThemeEvidence, sourcePriority } from './evidence'
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

const evidenceHeadline = (m: ThemeMember): string => String((m.headline_en && m.headline_en.trim()) || m.headline || '').trim()

export function isThemeEvidenceNoise(headline: unknown): boolean {
  const h = String(headline || '')
  return LAW_FIRM_SOLICITATION_RES.some((re) => re.test(h))
}

/** One row per actual story family. Used for honest first-look volume before any quality gate. */
export function uniqueThemeMembers(members: ThemeMember[]): ThemeMember[] {
  const candidates = arr(members).slice()
    .sort((a, b) => {
      const quality = sourcePriority(b.tier) - sourcePriority(a.tier)
      if (quality) return quality
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
    const quality = sourcePriority(b.tier) - sourcePriority(a.tier)
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

function hasSpecificNarrative(theme: Theme, companies: ThemeCompany[]): boolean {
  const name = String(theme.name || '').trim()
  const description = String(theme.description || '').trim()
  if (theme.needs_rename) return false
  if (!name || /^emerging cluster$/i.test(name) || name.includes(' · ')) return false
  // A bare company label is a company feed, not a multi-company investment narrative.
  const nameKey = normName(name)
  if (nameKey && arr(companies).some((c) => c && (c.name_key === nameKey || normName(c.name) === nameKey))) return false
  if (!description || /^recurring news around\b/i.test(description) || normalizeEvidenceHeadline(description) === normalizeEvidenceHeadline(name)) return false
  const narrative = theme.narrative
  if (!narrative || narrative.version !== 1) return false
  if (!narrative.thesis?.trim() || !narrative.why_now?.trim() || !narrative.why_now_event_id?.trim()) return false
  if (!Array.isArray(narrative.mechanism_steps) || narrative.mechanism_steps.length < 2) return false
  if (!Array.isArray(narrative.anchor_terms) || narrative.anchor_terms.length !== 2) return false
  if (!narrative.falsifier?.trim() || !['days', 'weeks', 'months', 'years'].includes(narrative.horizon)) return false
  // Only an explicit validator pass admits a causal contract. Raw deterministic clusters remain internal
  // context; polished prose without the versioned proof object cannot enter the PM surface.
  return theme.generation === 'groq' || theme.generation === 'claude'
}

function evidenceRow(m: ThemeMember, stance: ThemeEvidence['stance']): ThemeEvidence {
  return {
    event_id: String(m.event_id || ''),
    headline: evidenceHeadline(m),
    found_at: String(m.found_at || ''),
    score: Number.isFinite(Number(m.score)) ? Math.max(0, Math.min(100, Number(m.score))) : 0,
    source_tier: String(m.tier || 'unconfirmed'),
    source_name: typeof m.source_name === 'string' && m.source_name.trim() ? m.source_name.trim() : null,
    url: typeof m.url === 'string' && /^https?:\/\//i.test(m.url.trim()) ? m.url.trim() : null,
    stance,
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
  supporting_members: ThemeMember[]
  challenging_members: ThemeMember[]
  off_core_members: ThemeMember[]
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
  const unique = uniqueThemeEvidenceMembers(members)
    .filter((m) => Number.isFinite(ageHours(m.found_at, nowMs)))
    .filter(hasExactThemeProvenance)
  const highQuality = unique.filter(isSupportingThemeEvidence)

  const declaredAnchors = theme.narrative?.anchor_terms || arr(theme.keywords)
  const selected = selectNarrativeCore(highQuality, declaredAnchors)
  const explicitSupports = new Set(
    arr(theme.narrative?.evidence).filter((row) => row?.stance === 'supports').map((row) => row.event_id),
  )
  const explicitChallenges = new Set(
    arr(theme.narrative?.evidence).filter((row) => row?.stance === 'challenges').map((row) => row.event_id),
  )
  // Challenges do not corroborate the thesis. Keep exact-provenance unconfirmed rows visible so a soft
  // adverse signal cannot disappear merely because it has not yet cleared the source hierarchy.
  const challengingMembers = unique.filter((member) => explicitChallenges.has(member.event_id) && isDisplayableThemeChallenge(member))
  const challengeSet = new Set(challengingMembers)
  const supportedMembers = selected.members.filter((member) => !challengeSet.has(member) && (!theme.narrative || explicitSupports.has(member.event_id)))
  const supportSet = new Set(supportedMembers)
  const offCoreMembers = unique.filter((member) => !supportSet.has(member) && !challengeSet.has(member))

  // Recency is activity metadata, not conviction. Durable theses do not stop existing because their proof
  // arrived 7 hours ago; a new supporting/challenging observation updates a separate activity axis.
  const recent = supportedMembers.filter((m) => ageHours(m.found_at, nowMs) <= 6)
  const prior = supportedMembers.filter((m) => {
    const age = ageHours(m.found_at, nowMs)
    return age > 6 && age <= 12
  })

  const supportingById = new Map(supportedMembers.map((member) => [member.event_id, member]))
  const companyByKey = new Map(arr(companies).map((company) => [company.name_key, company]))
  const expressionCandidates = arr(theme.narrative?.expressions).filter((expression) => {
    if (expression.role === 'harmed' && expression.side !== 'harmed') return false
    const company = companyByKey.get(expression.name_key)
    if (!company || !cleanTicker(company.ticker) || !expression.mechanism?.trim()) return false
    return arr(expression.evidence_event_ids).some((eventId) => {
      const member = supportingById.get(eventId)
      return !!member && companyKeys(Array.isArray(member.companies) ? member.companies : []).has(expression.name_key)
    })
  })
  const expressionByName = new Map<string, typeof expressionCandidates[number]>()
  const conflictingExpressionNames = new Set<string>()
  for (const expression of expressionCandidates) {
    const prior = expressionByName.get(expression.name_key)
    if (!prior) expressionByName.set(expression.name_key, expression)
    else if (prior.side !== expression.side || prior.role !== expression.role || prior.mechanism !== expression.mechanism) conflictingExpressionNames.add(expression.name_key)
  }
  const validExpressions = [...expressionByName.values()].filter((expression) => !conflictingExpressionNames.has(expression.name_key)).slice(0, 3)
  const expressionCompany = validExpressions[0] ? companyByKey.get(validExpressions[0].name_key) : undefined
  const expressionProofIds = new Set(validExpressions.flatMap((expression) => expression.evidence_event_ids))

  const uniqueCount = unique.length
  const supportCount = supportedMembers.length
  const coherencePct = uniqueCount ? Math.round((supportCount / uniqueCount) * 100) : 0
  const recent24Support = supportedMembers.filter((m) => ageHours(m.found_at, nowMs) <= 24)
  const recent24Challenge = challengingMembers.filter((m) => ageHours(m.found_at, nowMs) <= 24)
  const metrics = {
    recent_6h_flow: recent.length,
    prior_6h_flow: prior.length,
    unique_evidence_count: uniqueCount,
    high_quality_evidence_count: highQuality.length,
    narrative_support_count: supportCount,
    narrative_coherence_pct: coherencePct,
    recurring_narrative_token_count: selected.anchors.length,
    first_order_directional_ticker_count: validExpressions.length,
    recent_24h_support_count: recent24Support.length,
    recent_24h_challenge_count: recent24Challenge.length,
    off_core_evidence_count: offCoreMembers.length,
  }

  const narrativeReady = hasSpecificNarrative(theme, companies)
  const whyNowReady = !!theme.narrative && supportedMembers.some((member) => member.event_id === theme.narrative!.why_now_event_id)
  const evidenceReady = metrics.narrative_support_count >= 2
  const coherent = metrics.recurring_narrative_token_count >= 2 && metrics.narrative_support_count >= 2 && metrics.narrative_coherence_pct >= 60
  const expressionReady = metrics.first_order_directional_ticker_count >= 1

  const newest = (rows: ThemeMember[]): number => Math.max(0, ...rows.map((row) => Date.parse(row.found_at) || 0))
  // `first_seen` is the immutable lifecycle start. Using the oldest retained support row lets an old theme
  // become "new" again after ring eviction or reclassification replaces its original excerpt.
  const firstAge = ageHours(theme.first_seen, nowMs)
  const activity = recent24Challenge.length && newest(recent24Challenge) >= newest(recent24Support)
    ? 'challenged' as const
    : recent24Support.length && firstAge <= 72
      ? 'new' as const
      : recent24Support.length
        ? 'reinforced' as const
        : 'quiet' as const
  const allGates = narrativeReady && whyNowReady && evidenceReady && coherent && expressionReady && !theme.needs_narrative_update
  const supportTiers = new Set(supportedMembers.map((member) => String(member.tier || '').toLowerCase()))
  const hasPrimaryOrIssuerProof = supportedMembers.some((member) => ['primary_filing', 'official_data', 'company'].includes(String(member.tier || '').toLowerCase()))
  const conviction = allGates && supportCount >= 3 && coherencePct >= 75 && challengingMembers.length === 0 && hasPrimaryOrIssuerProof && supportTiers.size >= 2
    ? 'high' as const
    : allGates
      ? 'medium' as const
      : 'watch' as const

  const reasons: string[] = []
  const blockers: string[] = []
  if (narrativeReady) reasons.push('A validator tied the thesis, why-now, mechanism and falsifier to one evidence core.')
  else if (theme.needs_rename) blockers.push('Needs a fresh validator pass because the current name and description predate a material identity change.')
  else blockers.push('Needs a versioned, evidence-bound investment thesis; a company or keyword cluster is not publishable.')
  if (!whyNowReady) blockers.push('The why-now source is not part of this evidence slice; the thesis is withheld here rather than borrowing another geography or subject\'s trigger.')
  if (theme.needs_narrative_update) blockers.push(`${theme.pending_narrative_event_ids?.length || 1} new matching evidence row${(theme.pending_narrative_event_ids?.length || 1) === 1 ? '' : 's'} still need support/challenge/context classification before this thesis can seed an idea.`)
  if (activity === 'new') reasons.push(`${metrics.recent_24h_support_count} supporting evidence row${metrics.recent_24h_support_count === 1 ? '' : 's'} formed this thesis in the last 24 hours.`)
  else if (activity === 'reinforced') reasons.push(`${metrics.recent_24h_support_count} supporting evidence row${metrics.recent_24h_support_count === 1 ? '' : 's'} reinforced the thesis in the last 24 hours.`)
  else if (activity === 'challenged') reasons.push(`${metrics.recent_24h_challenge_count} recent evidence row${metrics.recent_24h_challenge_count === 1 ? '' : 's'} challenges the thesis.`)
  else reasons.push('No thesis-changing evidence arrived in the last 24 hours; the durable proof remains on watch.')
  if (challengingMembers.length && activity !== 'challenged') reasons.push(`${challengingMembers.length} retained evidence row${challengingMembers.length === 1 ? '' : 's'} still challenges the thesis and caps evidence confidence below High.`)
  if (evidenceReady) reasons.push(`${metrics.narrative_support_count} distinct, supported-source rows carry the same narrative core.`)
  else blockers.push(`Needs at least 2 distinct supported-source rows in the causal core; has ${metrics.narrative_support_count}.`)
  if (coherent) reasons.push(`${metrics.narrative_support_count} of ${metrics.unique_evidence_count} distinct evidence rows repeat at least 2 narrative anchors.`)
  else blockers.push(`Needs a recurring narrative across at least 2 evidence rows (2+ recurring anchors and 60% coherence); has ${metrics.recurring_narrative_token_count} anchors, ${metrics.narrative_support_count} supporting rows, and ${metrics.narrative_coherence_pct}%.`)
  if (expressionReady) reasons.push(`${metrics.first_order_directional_ticker_count} ticker-linked expression has a stated mechanism and exact supporting evidence.`)
  else blockers.push('Needs at least one ticker-linked expression with a causal mechanism and supporting evidence; listing and liquidity are checked later.')

  const status: ThemeAssessmentStatus = allGates
    ? 'actionable'
    : narrativeReady && evidenceReady ? 'forming' : 'context'

  const byNewest = (a: ThemeMember, b: ThemeMember) => (Date.parse(b.found_at) || 0) - (Date.parse(a.found_at) || 0) || (b.score || 0) - (a.score || 0)
  const supportedProof = supportedMembers.slice().sort(byNewest)
  const challengeProof = challengingMembers.slice().sort(byNewest)
  const selectedProof: { member: ThemeMember; stance: ThemeEvidence['stance'] }[] = []
  const seenProof = new Set<string>()
  const addProof = (member: ThemeMember | undefined, stance: ThemeEvidence['stance']) => {
    if (!member || seenProof.has(member.event_id) || selectedProof.length >= 5) return
    seenProof.add(member.event_id)
    selectedProof.push({ member, stance })
  }
  // Why-now and each displayed expression keep their actual source row before recency fills the remainder.
  const pinIds = [theme.narrative?.why_now_event_id, ...expressionProofIds].filter(Boolean)
  for (const eventId of pinIds) addProof(supportingById.get(String(eventId)), 'supports')
  for (const member of challengeProof) addProof(member, 'challenges')
  for (const member of supportedProof) addProof(member, 'supports')
  return {
    assessment: { status, activity, conviction, reasons, blockers, metrics },
    evidence: selectedProof.map((row) => evidenceRow(row.member, row.stance)),
    expression_company_key: expressionCompany?.name_key || null,
    supporting_members: supportedMembers,
    challenging_members: challengingMembers,
    off_core_members: offCoreMembers,
  }
}

/** Explicit first-look ordering: admission class first, then raw evidence facts, then legacy heat. */
export function compareThemeSummaries(a: ThemeSummary, b: ThemeSummary): number {
  const am = a.assessment.metrics; const bm = b.assessment.metrics
  const convictionOrder = { high: 0, medium: 1, watch: 2 } as const
  const activityOrder = { challenged: 0, new: 1, reinforced: 2, quiet: 3 } as const
  return STATUS_ORDER[a.assessment.status] - STATUS_ORDER[b.assessment.status]
    || convictionOrder[a.assessment.conviction] - convictionOrder[b.assessment.conviction]
    || activityOrder[a.assessment.activity] - activityOrder[b.assessment.activity]
    || bm.first_order_directional_ticker_count - am.first_order_directional_ticker_count
    || bm.narrative_support_count - am.narrative_support_count
    || bm.narrative_coherence_pct - am.narrative_coherence_pct
    || bm.high_quality_evidence_count - am.high_quality_evidence_count
    || b.composite - a.composite
    || (a.last_flow < b.last_flow ? 1 : a.last_flow > b.last_flow ? -1 : 0)
}
