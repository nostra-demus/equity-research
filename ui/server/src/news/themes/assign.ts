// Per-cycle theme ASSIGNMENT — the cheap, deterministic step that runs every cycle. For each material
// item it scores overlap against every LIVE theme (reusing the exact company-name + topic-token match
// the enrichment "related events" finder uses) and adds the item to every theme it clears the bar for
// (an item can belong to several themes — an Nvidia print is both "AI data-center buildout" and
// "semiconductors"). Items matching no theme become the unclustered pool that discovery clusters next.
// Pure data transforms; no I/O, no LLM (a tiny Groq tie-break is an optional caller concern).

import type { CompanyGuess } from '../types'
import { deriveCommodities } from '../commodities'
import { companyKeys, themeNarrativeTokens, intersectionSize, topicTokens } from '../text-match'
import { companyImpact } from './order'
import { bumpDaily } from './score'
import { themeStoryKey } from './story-key'
import type { Theme, ThemeItemView, ThemeMember, ThemeCompany } from './types'

export interface AssignConfig {
  maxThemesPerItem: number // cap multi-membership so one item can't smear across everything
  maxMembers: number // member-ring cap per theme
}
export const DEFAULT_ASSIGN_CONFIG: AssignConfig = { maxThemesPerItem: 3, maxMembers: 400 }

const isCompanyLinkage = (l?: string) => l === 'primary' || l === 'secondary'

function narrativeKeywords(theme: Theme): Set<string> {
  const companyWords = new Set<string>()
  for (const c of theme.companies || []) {
    for (const token of topicTokens(null, [c])) companyWords.add(token)
    for (const token of topicTokens(c.name, [])) companyWords.add(token)
  }
  return new Set((theme.keywords || []).filter((token) => !companyWords.has(token)))
}

/** Overlap score of an item against a theme. A company hit is supporting evidence, never a theme by
 *  itself. Joining requires a recurring narrative: ≥2 shared narrative tokens, or one shared narrative
 *  token when the same company is also named. This prevents every story about a frequent issuer from
 *  collapsing into a single company timeline while still allowing a tightly named follow-up to join. */
export function overlapScore(itemCompanyKeys: Set<string>, itemTokens: Set<string>, itemEventTypes: string[], theme: Theme): { score: number; matched: boolean } {
  const themeCompanyKeys = new Set(theme.company_keys)
  const themeKeywords = narrativeKeywords(theme)
  const companyOverlap = intersectionSize(itemCompanyKeys, themeCompanyKeys)
  const tokenOverlap = intersectionSize(itemTokens, themeKeywords)
  const affinity = (itemEventTypes || []).some((t) => theme.event_type_affinity.includes(t)) ? 1 : 0
  const matched = tokenOverlap >= 2 || (companyOverlap >= 1 && tokenOverlap >= 1)
  return { score: 3 * companyOverlap + tokenOverlap + affinity, matched }
}

/** Aggregate a theme's companies + sectors from its member ring and (re)assign order tiers. Members are
 *  the source of truth, so this is idempotent and self-healing — recomputed whenever members change. */
export function rebuildThemeCompanies(theme: Theme): void {
  interface Acc { name: string; ticker: string | null; listing_country: string | null; key: string; count: number; scoreSum: number; linkage: Record<string, number>; events: Record<string, number>; last: string; soloHeadlines: string[] }
  const byKey = new Map<string, Acc>()
  for (const m of (Array.isArray(theme.members) ? theme.members : [])) {
    // Ledger rows cross a runtime boundary with no schema migration. A legacy/partial member may carry a
    // truthy non-array `companies` value; treating that as no company proof keeps every index fail-soft.
    const memberCompanies = Array.isArray(m.companies) ? m.companies : []
    // real, investable companies named in THIS member (countries/agencies/people already filtered out)
    const realKeys = memberCompanies.map((c) => companyKeys([c]).values().next().value as string | undefined).filter(Boolean) as string[]
    const solo = new Set(realKeys).size === 1 // single-subject member → its side is safe to read from the headline
    for (const c of memberCompanies) {
      const key = companyKeys([c]).values().next().value as string | undefined
      if (!key) continue // not a real company (country/agency/person) → skipped
      let a = byKey.get(key)
      if (!a) {
        a = { name: c.name, ticker: c.ticker ?? null, listing_country: c.listing_country ?? null, key, count: 0, scoreSum: 0, linkage: {}, events: {}, last: m.found_at, soloHeadlines: [] }
        byKey.set(key, a)
      }
      a.count++
      a.scoreSum += m.score || 0
      if (c.ticker && !a.ticker) a.ticker = c.ticker
      if (m.issuer_linkage) a.linkage[m.issuer_linkage] = (a.linkage[m.issuer_linkage] || 0) + 1
      for (const ev of (Array.isArray(m.event_types) ? m.event_types : [])) a.events[ev] = (a.events[ev] || 0) + 1
      if (m.found_at > a.last) a.last = m.found_at
      if (solo && m.headline) a.soloHeadlines.push(m.headline)
    }
  }
  const dominant = (votes: Record<string, number>): string => Object.entries(votes).sort((x, y) => y[1] - x[1])[0]?.[0] || ''
  const companies: ThemeCompany[] = [...byKey.values()].map((a) => {
    const { impact, order, side } = companyImpact({
      mention_count: a.count,
      avg_score: a.count ? a.scoreSum / a.count : 0,
      dominant_linkage: (dominant(a.linkage) as any) || '',
      dominant_event_type: dominant(a.events),
      solo_headlines: a.soloHeadlines,
    })
    return { name: a.name, ticker: a.ticker, listing_country: a.listing_country, name_key: a.key, order, side, impact, mention_count: a.count, last_seen: a.last }
  })
  // most-central first (order tier, then mentions, then composite)
  companies.sort((x, y) => x.order - y.order || y.mention_count - x.mention_count || y.impact.composite - x.impact.composite)
  theme.companies = companies.slice(0, 40)
}

export interface AssignResult {
  assignments: Map<string, string[]> // event_id -> theme_ids it joined
  unclustered: ThemeItemView[] // items that matched no theme
  touched: Set<string> // theme_ids whose members changed this cycle
}

/** Assign a batch of material items to existing themes. Mutates the themes in place (members ring,
 *  companies, last_flow, rev). Returns the per-item theme_ids, the unclustered pool, and which themes
 *  changed (so the caller can rescore + emit only those). */
export function assignThemes(items: ThemeItemView[], themes: Theme[], cfg: AssignConfig = DEFAULT_ASSIGN_CONFIG, now: Date = new Date(), generic?: Set<string>): AssignResult {
  const live = themes.filter((t) => t.status === 'live')
  const nowMs = now.getTime()
  const assignments = new Map<string, string[]>()
  const unclustered: ThemeItemView[] = []
  const touched = new Set<string>()

  for (const it of items) {
    const itemCompanyKeys = companyKeys(it.companies)
    // Narrative-only theme tokens: calendar/event boilerplate, corpus-generic words, and the issuer's
    // own name are suppressed. A routine filing therefore contributes no narrative and cannot inflate a
    // theme merely because it names the same company (see text-match.ts).
    const itemTokens = themeNarrativeTokens(it.headline, it.companies, it.source_tier, generic)
    const evs = it.event_types || []
    const hits: { theme: Theme; score: number }[] = []
    for (const theme of live) {
      const { score, matched } = overlapScore(itemCompanyKeys, itemTokens, evs, theme)
      if (matched) hits.push({ theme, score })
    }
    if (!hits.length) {
      unclustered.push(it)
      continue
    }
    hits.sort((a, b) => b.score - a.score)
    const chosen = hits.slice(0, cfg.maxThemesPerItem)
    const joined: string[] = []
    for (const { theme } of chosen) {
      const storyKey = themeStoryKey(it)
      if (theme.members.some((m) => themeStoryKey(m) === storyKey)) {
        joined.push(theme.theme_id) // already a member — still record membership, don't double-count
        continue
      }
      const member: ThemeMember = {
        event_id: it.event_id,
        dedup_group: it.dedup_group,
        headline: it.headline,
        headline_en: it.headline_en, // carry the translation so a member older than the feed window still renders in English
        found_at: it.found_at,
        score: typeof it.triage_score === 'number' ? it.triage_score : it.materiality_pre_score || 0,
        tier: it.source_tier || 'news',
        companies: (it.companies || []).slice(0, 4) as CompanyGuess[],
        event_types: evs.slice(0, 6),
        issuer_linkage: it.issuer_linkage,
        country: it.country ?? null, // carry the event's country so the themes view can be sliced by geography
        region: it.region, // + the domain-region floor, so the lazy resolver matches the archive exactly
        // carry the canonical commodity tag(s) so the themes view can be sliced per commodity, exactly
        // like country/geo above — derived here (zero-cost) when the item didn't arrive pre-tagged
        ...(() => { const cs = it.commodities ?? deriveCommodities(it); return cs && cs.length ? { commodities: cs } : {} })(),
      }
      theme.members.push(member)
      if (theme.members.length > cfg.maxMembers) theme.members.splice(0, theme.members.length - cfg.maxMembers)
      theme.member_count_total++
      bumpDaily(theme, it.found_at, nowMs) // record this landing in the long-horizon daily ring (survives member eviction)
      if (it.found_at > theme.last_flow) theme.last_flow = it.found_at
      theme.rev++
      touched.add(theme.theme_id)
      joined.push(theme.theme_id)
    }
    assignments.set(it.event_id, joined)
  }

  for (const t of themes) if (touched.has(t.theme_id)) rebuildThemeCompanies(t)
  return { assignments, unclustered, touched }
}
