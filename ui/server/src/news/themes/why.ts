// The per-company "why is it here" explainer for a theme's order tiers. A theme lists its companies as
// Direct (1st-order) / Ripple (2nd-order) / Read-across (3rd-order) — but the placement is a deterministic
// composite score (order.ts), so a reader sees "Micron · 2nd-order" with no idea WHY. This turns the
// signals already on each ThemeCompany + the theme's own member headlines into a plain-English reason and
// the actual evidence (§3: no source = no claim) that put the company in its tier.
//
// Deterministic, free, instant, and always present — no LLM. The reason is a plain reading of the SAME
// signals order.ts scored (directness ≈ linkage, mention_count = centrality, side = direction); the
// evidence is the real member stories that named the company. Both come from data the deep-dive already
// loads, so this adds a reading layer, not a data source.

import { companyKeys } from '../text-match'
import type { CompanyGuess } from '../types'
import type { CompanyEvidence, CompanyWhy, OrderTier, ImpactSide } from './types'

// The minimal member shape the evidence join needs (a ThemeMember or a resolved FeedItem-ish row).
export interface WhyMember {
  event_id: string
  headline: string
  headline_en?: string | null
  score?: number
  companies?: CompanyGuess[] | null
}

// The minimal company shape the reason needs — just the placement signals order.ts already scored.
export interface WhyCompany {
  order: OrderTier
  side: ImpactSide
  mention_count: number
  impact: { directness: number }
}

/** Build a nameKey → evidence[] index in ONE pass over the members (sorted by materiality, deduped by
 *  headline, capped). Reused across every company so the deep-dive join stays O(members), not O(members×companies). */
export function buildWhyIndex(members: WhyMember[], cap = 3): Map<string, CompanyEvidence[]> {
  // per company: one entry per DISTINCT headline, keyed by its normalized form. A wire burst reposts one
  // story across outlets (distinct event_ids, same headline); we keep the HIGHEST-scored copy — the member
  // ring is chronological, so keeping whichever landed first would show an arbitrary (often lower) score and
  // could push the story's strongest copy out of the top-cap.
  const byKey = new Map<string, Map<string, CompanyEvidence>>()
  for (const m of members || []) {
    // prefer the English translation so a non-English theme's evidence still reads (themes render in English)
    const headline = ((m.headline_en && m.headline_en.trim()) || m.headline || '').trim()
    const norm = headline.toLowerCase().replace(/\s+/g, ' ').trim()
    if (!norm) continue // an unheadlined member can't be shown as evidence
    const score = Math.round(m.score || 0)
    // every real company named in this member (countries/agencies/people filtered by companyKeys) — the
    // SAME key rebuildThemeCompanies used for name_key, so the join lands exactly
    const keys = new Set<string>()
    for (const c of m.companies || []) for (const k of companyKeys([c])) keys.add(k)
    for (const k of keys) {
      let slot = byKey.get(k)
      if (!slot) { slot = new Map(); byKey.set(k, slot) }
      const existing = slot.get(norm)
      if (!existing) slot.set(norm, { headline, event_id: m.event_id, score })
      else if (score > existing.score) { existing.score = score; existing.event_id = m.event_id } // keep the strongest copy
    }
  }
  const out = new Map<string, CompanyEvidence[]>()
  for (const [k, slot] of byKey) out.set(k, [...slot.values()].sort((a, b) => b.score - a.score).slice(0, cap))
  return out
}

/** How often the company was named, phrased as a raw count. `mention_count` counts member ITEMS (a wire
 *  burst reposts one story across outlets), so we say "N times" — a raw count that never overstates distinct
 *  stories and so can't contradict the deduped evidence list shown on the same card (§3/§21). */
function timesPhrase(n: number): string {
  if (n <= 0) return "in this theme's news"
  return n === 1 ? 'once' : `${n} times`
}

/** The direction clause — only when the deterministic side is confident (single-subject headlines). A
 *  'mixed' read makes NO claim (§3): direction genuinely isn't clear from the headlines yet. */
function sideClause(side: ImpactSide): string {
  if (side === 'beneficiary') return ' The stories so far point to it as a likely gainer.'
  if (side === 'harmed') return ' The stories so far point to it as likely to be hurt.'
  return ''
}

/**
 * The plain-English reason a company sits in its order tier — a reading of the placement signals, not a
 * new judgment. Directness (0–25) encodes how directly the theme's news points at the company (order.ts:
 * primary linkage ≈22, secondary ≈14, sector/macro ≈5–11), so it names how the theme touches the company;
 * the order tier names how far out it sits.
 */
export function reasonFor(c: WhyCompany): string {
  const times = timesPhrase(c.mention_count)
  const d = c.impact?.directness ?? 0
  if (c.order === 1) {
    // near-always a main subject at this tier (a 1st-order composite needs high directness)
    const link = d >= 19 ? 'as a main subject' : 'as one of the named companies'
    return `Direct (first-order): named ${times} ${link} — the theme lands on it head-on, not through a chain of knock-on effects.` + sideClause(c.side)
  }
  if (c.order === 2) {
    return `Ripple (second-order): named ${times}, but a step removed — it comes up around the theme rather than as the main company, so the news reaches it indirectly.` + sideClause(c.side)
  }
  return `Read-across (third-order): named ${times}, and only through a sector or bigger-picture link — the connection is real but faint, several steps out.` + sideClause(c.side)
}

/** The full "why" for one company: the reason + the member stories that named it (empty evidence is fine —
 *  the reason still stands, and the caller shows a plain fallback line). */
export function buildCompanyWhy(c: WhyCompany, nameKey: string, index: Map<string, CompanyEvidence[]>): CompanyWhy {
  return { reason: reasonFor(c), evidence: index.get(nameKey) || [] }
}
