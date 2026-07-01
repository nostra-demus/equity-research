// Geography-sliced themes index — the same ranked themes, but re-ranked + re-sized by the news flow from
// ONE country or continent. This is what makes the cockpit's "Where" picker narrow the Themes map/board,
// not just the Events list: pick Hong Kong and the basins become the themes Hong Kong news is actually
// driving, ranked by that flow.
//
// It is computed on the fly from each theme's own member ring (only when a geo filter is set — the
// global, un-filtered index keeps its fast pre-built path). Because scoreTheme + the daily ring are pure
// functions of the members, filtering the ring to a geography and re-running them yields a fully
// consistent geo theme — real geo flow_series, real geo scores/tier, real geo counts. Nothing is
// invented (§3): a member with no confident country is simply not counted toward any geography, and the
// depth honestly reflects the ring (so the long "When" windows lock in geo mode, driven by history_days).
//
// A member's country is the SAME key the archive Geography filter uses (news/geography.ts resolveCountry):
// members written since that field was added carry it; older ones are resolved lazily here, so a geo view
// works over the whole ledger without a migration.

import { isCountry, regionOfCountry, resolveCountry } from '../geography'
import type { Region } from '../types'
import { DAILY_WINDOWS, ensureDaily, scoreTheme, type ThemeScoreConfig } from './score'
import type { Theme, ThemeCompany, ThemeMember, ThemesIndex, ThemeSummary, ThemeTier } from './types'

/** The geography to slice by — a country (leaf) OR a continent (branch). Country wins when both are set. */
export interface ThemeGeo {
  country?: string // ISO alpha-2 (the leaf of the drill-down)
  geoRegion?: string // continent group (the branch)
}

const top = <T>(a: T[], n: number): T[] => a.slice(0, n)

/** The ISO alpha-2 country a member is ABOUT — its persisted country when present, else resolved lazily
 *  from the same signals the archive uses (a primary single-company listing, or a country named in the
 *  headline). Returns null when there is no confident signal (→ counts toward no geography). */
export function memberCountry(m: ThemeMember): string | null {
  const stored = (m.country || '').trim().toUpperCase()
  if (isCountry(stored)) return stored
  // legacy members (no stored country) — reuse resolveCountry over what the member carries, passing the
  // member's domain region as the FLOOR so this matches the archive/ingest resolution EXACTLY (runCycle.ts
  // ~432/502, feed.ts hydrate). Without the floor the geo Themes slice and the geo Events list disagree for
  // items whose only geography signal is their source region. Truly-ancient members (no country AND no
  // region, written before both fields existed) can't reproduce the floor and degrade to the gazetteer/
  // company paths — honest under-inclusion, not fabrication; they age out of the 400-item ring.
  const cc = resolveCountry(m.headline, m.headline_en, m.companies, (m.region || null) as Region | null, m.issuer_linkage)
  return cc && isCountry(cc) ? cc.toUpperCase() : null
}

/** Does this member belong to the requested geography? Country match is exact; a continent match rolls the
 *  member's country up via the SAME map the archive filter uses (regionOfCountry). */
export function memberMatchesGeo(m: ThemeMember, geo: ThemeGeo): boolean {
  const cc = memberCountry(m)
  if (!cc) return false
  if (geo.country) return cc === geo.country.toUpperCase()
  if (geo.geoRegion) return regionOfCountry(cc) === geo.geoRegion
  return true
}

/** A theme company counts toward the geography when its listing country matches (the geo-relevant names to
 *  surface as chips + to feed the breadth score). Companies with no known listing country don't count. */
function companyMatchesGeo(c: ThemeCompany, geo: ThemeGeo): boolean {
  const cc = (c.listing_country || '').trim().toUpperCase()
  if (!isCountry(cc)) return false
  if (geo.country) return cc === geo.country.toUpperCase()
  if (geo.geoRegion) return regionOfCountry(cc) === geo.geoRegion
  return true
}

/** True when a geo filter is actually set (an empty geo means "use the global index instead"). */
export function hasThemeGeo(geo: ThemeGeo | null | undefined): boolean {
  return !!(geo && (geo.country || geo.geoRegion))
}

/** Build the geography-sliced index: each live theme re-scored over only its members from `geo`, themes
 *  with zero geo flow dropped, ranked by the geo composite. Shape-identical to buildThemesIndex, so the
 *  cockpit consumes it with no special-casing. `now` injected for tests. */
export function buildGeoThemesIndex(
  themes: Theme[],
  geo: ThemeGeo,
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
    const geoMembers = (t.members || []).filter((m) => memberMatchesGeo(m, geo))
    if (!geoMembers.length) continue // this theme isn't about the requested geography → drop it

    const geoCompanies = (t.companies || []).filter((c) => companyMatchesGeo(c, geo))
    // Re-score from the geo slice. Sectors carry no country, so they can't be attributed to a geography —
    // breadth reads off the geo companies only (conservative, and consistent across every theme).
    const scored = scoreTheme({ members: geoMembers, companies: geoCompanies, sectors: [], first_seen: t.first_seen }, nowD, cfg)

    // rebuild the daily ring from the geo members (real depth — only as far back as the ring reaches)
    const holder: { flow_daily?: number[]; flow_daily_day?: string; members: { found_at: string }[] } = { members: geoMembers }
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
      member_count: geoMembers.length, // honest: recent geo items in the ring (caps at the ring size)
      top_companies: top(geoCompanies, 8).map((c) => ({ name: c.name, ticker: c.ticker, order: c.order, side: c.side })),
      related_themes: top(t.related_themes || [], 5).map((r) => ({ theme_id: r.theme_id, name: r.name, kind: r.kind })),
      last_flow: geoMembers.reduce((mx, m) => (m.found_at > mx ? m.found_at : mx), ''),
      rev: t.rev,
    })
  }

  // rank by the geo composite, then geo volume, then recency — the biggest, most-alive geo theme first
  out.sort((a, b) => b.composite - a.composite || b.member_count - a.member_count || (a.last_flow < b.last_flow ? 1 : -1))
  return { generated_at: nowD.toISOString().replace(/\.\d{3}Z$/, 'Z'), themes: out, counts, history_days }
}
