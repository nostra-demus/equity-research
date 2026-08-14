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
import type { Theme, ThemeCompany, ThemeCompilerAttempt, ThemeMember, ThemesIndex, ThemeSummary, ThemeTier } from './types'
import { buildSummary } from './store'
import { compareThemeSummaries, companiesForMembers, firstSeenForMembers, uniqueThemeMembers } from './qualification'
import { buildThemeCompilerHealth, buildThemeFormationQueue, compilerDebtForThemes } from './formation'

/** The geography to slice by — a country (leaf) OR a continent (branch). Country wins when both are set. */
export interface ThemeGeo {
  country?: string // ISO alpha-2 (the leaf of the drill-down)
  geoRegion?: string // continent group (the branch)
}

// Array-safe: themes come from loadThemes(), which parses raw ledger lines with no schema normalisation,
// so `companies` / `related_themes` can be missing or a corrupt non-array truthy value. Guard so the
// geo-sliced index never throws on `.slice` (mirrors store.ts top()).
// Coerce an untrusted ledger array field to a real array (missing, or `{}` / `true` from a corrupt row).
const arr = <T>(v: T[] | null | undefined): T[] => (Array.isArray(v) ? v : [])

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

/** Explicit listing-country matcher retained for callers that really ask about a listing venue. It must
 *  not be applied to the Themes `Where` slice: that scope describes what the evidence is ABOUT, and a
 *  country catalyst can legitimately point to a listed beneficiary elsewhere. */
export function companyMatchesGeo(c: ThemeCompany, geo: ThemeGeo): boolean {
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
  compilerAttempt?: ThemeCompilerAttempt | null,
): ThemesIndex {
  const nowD = now()
  const nowMs = nowD.getTime()
  const out: ThemeSummary[] = []
  const counts = { hot: 0, active: 0, cooling: 0, parked: 0, retired: 0, total: 0 }
  let history_days = 0

  for (const t of themes) {
    if (t.status !== 'live') continue
    const geoObservations = arr(t.members).filter((m) => memberMatchesGeo(m, geo))
    const geoMembers = uniqueThemeMembers(geoObservations)
    if (!geoMembers.length) continue // this theme isn't about the requested geography → drop it

    // Rebuild from the sliced members first. Filtering the global company aggregate leaked unrelated
    // mentions, counts, sides and last-seen values into a country view.
    const geoCompanies = companiesForMembers(t, geoMembers)
    // Re-score from the geo slice. Sectors carry no country, so they can't be attributed to a geography —
    // breadth reads off the geo companies only (conservative, and consistent across every theme).
    const sliceFirstSeen = firstSeenForMembers(geoMembers, t.first_seen)
    const scored = scoreTheme({ members: geoMembers, companies: geoCompanies, sectors: [], first_seen: sliceFirstSeen }, nowD, cfg)

    // rebuild the daily ring from the geo members (real depth — only as far back as the ring reaches)
    const holder: { flow_daily?: number[]; flow_daily_day?: string; members: { found_at: string }[] } = { members: geoMembers }
    ensureDaily(holder, nowMs, DAILY_WINDOWS)
    const flow_daily = holder.flow_daily || []
    const slicedTheme: Theme = {
      ...t,
      // Keep the complete audit ring for family-state resolution; the explicit company projection below
      // marks this as a scoped read, while scores/flow remain computed only from geoMembers above.
      members: t.members,
      companies: geoCompanies,
      sectors: [],
      scores: scored.scores,
      tier: scored.tier,
      fresh_flow: scored.fresh_flow,
      flow_series: scored.flow_series,
      flow_daily,
      first_seen: t.first_seen,
      last_flow: geoObservations.reduce((mx, m) => (m.found_at > mx ? m.found_at : mx), ''),
    }
    const summary = buildSummary(slicedTheme, nowD, geoCompanies, geoObservations)
    if (summary.narrative && summary.assessment.status !== 'context') {
      // Counts and advertised history are evidence products, not raw slice traffic. buildSummary has
      // already narrowed flow_daily/tier to explicit support+challenge; heat_flow_daily retains the raw
      // scoped accumulator separately for diagnostics.
      const firstNonZero = summary.flow_daily.findIndex((value) => value > 0)
      if (firstNonZero >= 0) history_days = Math.max(history_days, summary.flow_daily.length - firstNonZero)
      out.push(summary)
      counts.total++
      counts[summary.tier as ThemeTier]++
    }
  }

  // Same evidence-first admission order as the global index; sliced heat only breaks later ties.
  out.sort(compareThemeSummaries)
  const projectMembers = (theme: Theme) => arr(theme.members).filter((member) => memberMatchesGeo(member, geo))
  const formation_queue = buildThemeFormationQueue(themes, nowD, projectMembers)
  return {
    generated_at: nowD.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    themes: out,
    formation_queue,
    compiler_health: buildThemeCompilerHealth(formation_queue, nowD, compilerAttempt, compilerDebtForThemes(themes, projectMembers)),
    counts,
    history_days,
  }
}
