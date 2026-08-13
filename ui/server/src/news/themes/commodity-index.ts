// Commodity-sliced themes index — the same ranked themes, but re-ranked + re-sized by the news flow
// about commodities (all of them, or ONE canonical subject like GOLD). This is what lets a wire swarm
// whose manifest declares `wire.event_scope: commodity` show a Themes map of the stories its wire
// actually carries: pick GOLD and the basins become the themes gold news is driving, ranked by that flow.
//
// A direct mirror of geo-index.ts: computed on the fly from each theme's own member ring (only when a
// commodity filter is set — the global index keeps its fast pre-built path). scoreTheme + the daily ring
// are pure functions of the members, so filtering the ring and re-running them yields a fully consistent
// slice — real flow_series, real scores/tier, real counts. Nothing is invented (§3): a member whose
// headline names no canonical commodity is simply not counted, and legacy members (written before
// ThemeMember.commodities existed) are tagged lazily here with the SAME tagger the feed uses
// (news/commodities.ts deriveCommodities), so the slice works over the whole ledger without a migration.
//
// Composes with the geo slice: pass `geo` and a member must match BOTH (the cockpit's WHERE picker and
// the commodity chips are cumulative filters, exactly like the Events list).

import { deriveCommodities } from '../commodities'
import { memberMatchesGeo, type ThemeGeo } from './geo-index'
import { DAILY_WINDOWS, ensureDaily, scoreTheme, type ThemeScoreConfig } from './score'
import type { Theme, ThemeMember, ThemesIndex, ThemeSummary, ThemeTier } from './types'
import { buildSummary } from './store'
import { compareThemeSummaries, companiesForMembers, firstSeenForMembers, uniqueThemeMembers } from './qualification'

/** The commodity slice to apply: `commodity` narrows to ONE canonical subject (e.g. 'GOLD');
 *  otherwise any commodity-tagged member counts. */
export interface ThemeCommodityFilter {
  commodity?: string // canonical subject id (profile heading) — absent = any tagged commodity
  geo?: ThemeGeo | null // optional geography to compose with (memberMatchesGeo)
}

// Array-safe: themes come from loadThemes(), which parses raw ledger lines with no schema normalisation,
// so `companies` / `related_themes` / `members` can be missing or a corrupt non-array truthy value. Guard
// so the commodity-sliced index never throws on `.slice` / `.filter` (mirrors store.ts top()).
const arr = <T>(v: T[] | null | undefined): T[] => (Array.isArray(v) ? v : [])

/** The canonical commodity tag(s) a member carries — its persisted tags when present, else derived
 *  lazily from the member's own headline with the SAME tagger the feed/archive use. Empty array when
 *  the headline names no canonical commodity (→ counts toward no commodity slice). */
export function memberCommodities(m: ThemeMember): string[] {
  if (m.commodities !== undefined) return m.commodities
  return deriveCommodities(m) ?? []
}

/** Does this member belong to the requested commodity slice (and its optional geography)? */
export function memberMatchesCommodity(m: ThemeMember, f: ThemeCommodityFilter): boolean {
  const tags = memberCommodities(m)
  if (!tags.length) return false
  if (f.commodity && !tags.includes(f.commodity)) return false
  if (f.geo && !memberMatchesGeo(m, f.geo)) return false
  return true
}

/** Build the commodity-sliced index: each live theme re-scored over only its commodity members, themes
 *  with zero commodity flow dropped, ranked by the sliced composite. Shape-identical to buildThemesIndex
 *  (and buildGeoThemesIndex), so the cockpit consumes it with no special-casing. `now` injected for tests. */
export function buildCommodityThemesIndex(
  themes: Theme[],
  filter: ThemeCommodityFilter,
  now: () => Date = () => new Date(),
  cfg?: ThemeScoreConfig,
): ThemesIndex {
  const nowD = now()
  const nowMs = nowD.getTime()
  const out: ThemeSummary[] = []
  const counts = { hot: 0, active: 0, cooling: 0, parked: 0, retired: 0, total: 0 }
  let history_days = 0

  for (const t of themes) {
    if (t.status !== 'live') continue
    const sliceObservations = arr(t.members).filter((m) => memberMatchesCommodity(m, filter))
    const sliceMembers = uniqueThemeMembers(sliceObservations)
    if (!sliceMembers.length) continue // this theme isn't about the requested commodity → drop it

    // Rebuild company placement from the sliced proof. The old projection reused the theme's GLOBAL
    // company rows, which could show a name/side/count supported only by another commodity's stories.
    // Geography scopes what the evidence is ABOUT, not where the expression is listed. Preserve a
    // cross-border beneficiary (for example an India catalyst expressed through a US-listed supplier).
    const sliceCompanies = companiesForMembers(t, sliceMembers)
    const sliceFirstSeen = firstSeenForMembers(sliceMembers, t.first_seen)
    const scored = scoreTheme({ members: sliceMembers, companies: sliceCompanies, sectors: [], first_seen: sliceFirstSeen }, nowD, cfg)

    // rebuild the daily ring from the sliced members (real depth — only as far back as the ring reaches)
    const holder: { flow_daily?: number[]; flow_daily_day?: string; members: { found_at: string }[] } = { members: sliceMembers }
    ensureDaily(holder, nowMs, DAILY_WINDOWS)
    const flow_daily = holder.flow_daily || []
    const slicedTheme: Theme = {
      ...t,
      // Keep the complete audit ring for family-state resolution; the explicit company projection below
      // marks this as a scoped read, while scores/flow remain computed only from sliceMembers above.
      members: t.members,
      companies: sliceCompanies,
      sectors: [],
      scores: scored.scores,
      tier: scored.tier,
      fresh_flow: scored.fresh_flow,
      flow_series: scored.flow_series,
      flow_daily,
      first_seen: t.first_seen,
      last_flow: sliceObservations.reduce((mx, m) => (m.found_at > mx ? m.found_at : mx), ''),
    }
    const summary = buildSummary(slicedTheme, nowD, sliceCompanies, sliceObservations)
    if (summary.narrative && summary.assessment.status !== 'context') {
      const firstNonZero = summary.flow_daily.findIndex((value) => value > 0)
      if (firstNonZero >= 0) history_days = Math.max(history_days, summary.flow_daily.length - firstNonZero)
      out.push(summary)
      counts.total++
      counts[summary.tier as ThemeTier]++
    }
  }

  // Same evidence-first admission order as the global index; sliced heat only breaks later ties.
  out.sort(compareThemeSummaries)
  return { generated_at: nowD.toISOString().replace(/\.\d{3}Z$/, 'Z'), themes: out, counts, history_days }
}
