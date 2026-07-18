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

/** The commodity slice to apply: `commodity` narrows to ONE canonical subject (e.g. 'GOLD');
 *  otherwise any commodity-tagged member counts. */
export interface ThemeCommodityFilter {
  commodity?: string // canonical subject id (profile heading) — absent = any tagged commodity
  geo?: ThemeGeo | null // optional geography to compose with (memberMatchesGeo)
}

// Array-safe: themes come from loadThemes(), which parses raw ledger lines with no schema normalisation,
// so `companies` / `related_themes` / `members` can be missing or a corrupt non-array truthy value. Guard
// so the commodity-sliced index never throws on `.slice` / `.filter` (mirrors store.ts top()).
const top = <T>(a: T[] | null | undefined, n: number): T[] => (Array.isArray(a) ? a.slice(0, n) : [])
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
    const sliceMembers = arr(t.members).filter((m) => memberMatchesCommodity(m, filter))
    if (!sliceMembers.length) continue // this theme isn't about the requested commodity → drop it

    // Re-score from the slice. Companies/sectors carry no commodity attribution, so breadth reads off
    // the members only (conservative, and consistent across every theme — same posture as the geo
    // slice's sector handling).
    const scored = scoreTheme({ members: sliceMembers, companies: [], sectors: [], first_seen: t.first_seen }, nowD, cfg)

    // rebuild the daily ring from the sliced members (real depth — only as far back as the ring reaches)
    const holder: { flow_daily?: number[]; flow_daily_day?: string; members: { found_at: string }[] } = { members: sliceMembers }
    ensureDaily(holder, nowMs, DAILY_WINDOWS)
    const flow_daily = holder.flow_daily || []
    const firstNonZero = flow_daily.findIndex((v) => v > 0)
    if (firstNonZero >= 0) history_days = Math.max(history_days, flow_daily.length - firstNonZero)

    counts.total++
    counts[scored.tier as ThemeTier]++

    out.push({
      theme_id: t.theme_id,
      name: t.name,
      description: t.description,
      tier: scored.tier,
      composite: scored.scores.composite,
      fresh_flow: scored.fresh_flow,
      flow_series: scored.flow_series,
      flow_daily,
      member_count: sliceMembers.length, // honest: recent sliced items in the ring (caps at the ring size)
      // the theme's own company tiers, unchanged — commodity stories still name producers/users worth seeing
      top_companies: top(t.companies, 8).map((c) => ({ name: c.name, ticker: c.ticker, order: c.order, side: c.side })),
      related_themes: top(t.related_themes, 5).map((r) => ({ theme_id: r.theme_id, name: r.name, kind: r.kind })),
      last_flow: sliceMembers.reduce((mx, m) => (m.found_at > mx ? m.found_at : mx), ''),
      rev: t.rev,
    })
  }

  // rank by the sliced composite, then sliced volume, then recency — the biggest, most-alive theme first
  out.sort((a, b) => b.composite - a.composite || b.member_count - a.member_count || (a.last_flow < b.last_flow ? 1 : -1))
  return { generated_at: nowD.toISOString().replace(/\.\d{3}Z$/, 'Z'), themes: out, counts, history_days }
}
