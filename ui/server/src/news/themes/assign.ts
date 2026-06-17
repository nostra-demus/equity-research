// Per-cycle theme ASSIGNMENT — the cheap, deterministic step that runs every cycle. For each material
// item it scores overlap against every LIVE theme (reusing the exact company-name + topic-token match
// the enrichment "related events" finder uses) and adds the item to every theme it clears the bar for
// (an item can belong to several themes — an Nvidia print is both "AI data-center buildout" and
// "semiconductors"). Items matching no theme become the unclustered pool that discovery clusters next.
// Pure data transforms; no I/O, no LLM (a tiny Groq tie-break is an optional caller concern).

import type { CompanyGuess } from '../types'
import { companyKeys, topicTokens, intersectionSize } from '../text-match'
import { companyImpact } from './order'
import { bumpDaily } from './score'
import type { Theme, ThemeItemView, ThemeMember, ThemeCompany } from './types'

export interface AssignConfig {
  maxThemesPerItem: number // cap multi-membership so one item can't smear across everything
  maxMembers: number // member-ring cap per theme
}
export const DEFAULT_ASSIGN_CONFIG: AssignConfig = { maxThemesPerItem: 3, maxMembers: 400 }

const isCompanyLinkage = (l?: string) => l === 'primary' || l === 'secondary'

/** Overlap score of an item against a theme. Match requires a company hit OR ≥2 shared topic tokens —
 *  the same "actually about the same thing" bar the related-events finder uses. */
export function overlapScore(itemCompanyKeys: Set<string>, itemTokens: Set<string>, itemEventTypes: string[], theme: Theme): { score: number; matched: boolean } {
  const themeCompanyKeys = new Set(theme.company_keys)
  const themeKeywords = new Set(theme.keywords)
  const companyOverlap = intersectionSize(itemCompanyKeys, themeCompanyKeys)
  const tokenOverlap = intersectionSize(itemTokens, themeKeywords)
  const affinity = (itemEventTypes || []).some((t) => theme.event_type_affinity.includes(t)) ? 1 : 0
  const matched = companyOverlap >= 1 || tokenOverlap >= 2
  return { score: 3 * companyOverlap + tokenOverlap + affinity, matched }
}

/** Aggregate a theme's companies + sectors from its member ring and (re)assign order tiers. Members are
 *  the source of truth, so this is idempotent and self-healing — recomputed whenever members change. */
export function rebuildThemeCompanies(theme: Theme): void {
  interface Acc { name: string; ticker: string | null; listing_country: string | null; key: string; count: number; scoreSum: number; linkage: Record<string, number>; events: Record<string, number>; last: string; soloHeadlines: string[] }
  const byKey = new Map<string, Acc>()
  for (const m of theme.members) {
    // real, investable companies named in THIS member (countries/agencies/people already filtered out)
    const realKeys = (m.companies || []).map((c) => companyKeys([c]).values().next().value as string | undefined).filter(Boolean) as string[]
    const solo = new Set(realKeys).size === 1 // single-subject member → its side is safe to read from the headline
    for (const c of m.companies || []) {
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
      for (const ev of m.event_types || []) a.events[ev] = (a.events[ev] || 0) + 1
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
export function assignThemes(items: ThemeItemView[], themes: Theme[], cfg: AssignConfig = DEFAULT_ASSIGN_CONFIG, now: Date = new Date()): AssignResult {
  const live = themes.filter((t) => t.status === 'live')
  const nowMs = now.getTime()
  const assignments = new Map<string, string[]>()
  const unclustered: ThemeItemView[] = []
  const touched = new Set<string>()

  for (const it of items) {
    const itemCompanyKeys = companyKeys(it.companies)
    const itemTokens = topicTokens(it.headline, it.companies)
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
      if (theme.members.some((m) => m.event_id === it.event_id)) {
        joined.push(theme.theme_id) // already a member — still record membership, don't double-count
        continue
      }
      const member: ThemeMember = {
        event_id: it.event_id,
        headline: it.headline,
        found_at: it.found_at,
        score: typeof it.triage_score === 'number' ? it.triage_score : it.materiality_pre_score || 0,
        tier: it.source_tier || 'news',
        companies: (it.companies || []).slice(0, 4) as CompanyGuess[],
        event_types: evs.slice(0, 6),
        issuer_linkage: it.issuer_linkage,
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
