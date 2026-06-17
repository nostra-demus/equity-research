// Persistence for the themes layer — the same append-only-ledger + rebuilt-index discipline the rest
// of the screener uses. screener/ledger/themes.ndjson is the durable history (one line per theme
// mutation, last-line-per-theme_id wins on load — identical to events.ndjson); screener/board/
// themes_index.json is the compact live index the cockpit reads (the TS layer is its single writer, so
// there's no double-writer race with the python board builder). Never throws — a lost write only costs
// the cockpit a stale theme until next cycle.

import fs from 'node:fs'
import path from 'node:path'
import { readFeed } from '../feed'
import { deriveSourceTier } from '../scope'
import type { FeedItem } from '../types'
import type { Theme, ThemeSummary, ThemesIndex, ThemeMutation, ThemeTier, ThemeDetail, CompaniesByOrder, ThemeItemView } from './types'

const ledgerPath = (repoRoot: string) => path.join(repoRoot, 'screener', 'ledger', 'themes.ndjson')
const indexPath = (repoRoot: string) => path.join(repoRoot, 'screener', 'board', 'themes_index.json')

/** Read the themes ledger; last line per theme_id wins (a corrupt line never breaks the load). */
export function loadThemes(repoRoot: string): Theme[] {
  const byId = new Map<string, Theme>()
  try {
    for (const ln of fs.readFileSync(ledgerPath(repoRoot), 'utf8').split('\n')) {
      const t = ln.trim()
      if (!t) continue
      try {
        const o = JSON.parse(t) as ThemeMutation
        if (o && o.kind === 'theme' && o.theme?.theme_id) byId.set(o.theme.theme_id, o.theme)
      } catch {
        // skip a corrupt line
      }
    }
  } catch {
    // no ledger yet → no themes
  }
  return [...byId.values()]
}

/** Append one mutation line per changed theme. Best-effort. */
export function appendThemeMutations(repoRoot: string, themes: Theme[], now: () => Date = () => new Date()): void {
  if (!themes.length) return
  const fp = ledgerPath(repoRoot)
  try {
    fs.mkdirSync(path.dirname(fp), { recursive: true })
    const ts = now().toISOString().replace(/\.\d{3}Z$/, 'Z')
    const lines = themes.map((theme) => JSON.stringify({ kind: 'theme', ts, theme } satisfies ThemeMutation)).join('\n') + '\n'
    fs.appendFileSync(fp, lines)
  } catch {
    // a missed append only loses the durable record of one mutation; the index still has it
  }
}

const top = <T>(arr: T[], n: number): T[] => arr.slice(0, n)

/** Compact projection: Theme → ThemeSummary (no member arrays) for the index + SSE bus. */
export function buildSummary(t: Theme): ThemeSummary {
  return {
    theme_id: t.theme_id,
    name: t.name,
    description: t.description,
    tier: t.tier,
    composite: t.scores.composite,
    fresh_flow: t.fresh_flow,
    flow_series: t.flow_series,
    flow_daily: t.flow_daily || [],
    member_count: t.member_count_total,
    top_companies: top(t.companies, 8).map((c) => ({ name: c.name, ticker: c.ticker, order: c.order, side: c.side })),
    related_themes: top(t.related_themes, 5).map((r) => ({ theme_id: r.theme_id, name: r.name, kind: r.kind })),
    last_flow: t.last_flow,
    rev: t.rev,
  }
}

/** Build the live themes index, ranked by composite desc. */
export function buildThemesIndex(themes: Theme[], now: () => Date = () => new Date()): ThemesIndex {
  const live = themes.filter((t) => t.status === 'live').sort((a, b) => b.scores.composite - a.scores.composite)
  const counts = { hot: 0, active: 0, cooling: 0, parked: 0, retired: 0, total: 0 }
  for (const t of themes) {
    if (t.status === 'retired') counts.retired++
    else if (t.status === 'live') {
      counts.total++
      counts[t.tier as ThemeTier]++
    }
  }
  // how many days of real daily-flow history exist = the furthest-back non-zero daily bucket across
  // live themes. This is what the UI's window selector honestly reaches: a "last 7d" view is only fully
  // backed once history_days ≥ 7. Grows one real day per day; the firehose is high-volume, so every past
  // accrued day has flow in at least one theme, making this a truthful lower bound on coverage.
  let history_days = 0
  for (const t of live) {
    const fd = t.flow_daily || []
    const firstNonZero = fd.findIndex((v) => v > 0)
    if (firstNonZero >= 0) history_days = Math.max(history_days, fd.length - firstNonZero)
  }
  return { generated_at: now().toISOString().replace(/\.\d{3}Z$/, 'Z'), themes: live.map(buildSummary), counts, history_days }
}

/** Atomically write the live themes index the cockpit reads. */
export function writeThemesIndex(repoRoot: string, themes: Theme[], now: () => Date = () => new Date()): void {
  const fp = indexPath(repoRoot)
  try {
    fs.mkdirSync(path.dirname(fp), { recursive: true })
    const tmp = `${fp}.tmp.${process.pid}`
    // compact (not pretty) — the index is machine-read by the cockpit, and the per-theme flow_series[48] +
    // flow_daily[120] rings make indented JSON ~3× larger for zero benefit.
    fs.writeFileSync(tmp, JSON.stringify(buildThemesIndex(themes, now)) + '\n')
    fs.renameSync(tmp, fp)
  } catch {
    // best-effort; the cockpit keeps the prior index
  }
}

/** Read the index the cockpit/API serves (never throws; empty when absent). */
export function readThemesIndex(repoRoot: string): ThemesIndex {
  try {
    const o = JSON.parse(fs.readFileSync(indexPath(repoRoot), 'utf8'))
    if (o && Array.isArray(o.themes)) return { history_days: 0, ...o }
  } catch {
    // none yet
  }
  return { generated_at: '', themes: [], counts: { hot: 0, active: 0, cooling: 0, parked: 0, retired: 0, total: 0 }, history_days: 0 }
}

/** Recent MATERIAL firehose items as ThemeItemViews — the cold-start / comprehensiveness pool for a
 *  discovery pass, so themes form from the whole recent backlog, not just this cycle's handful. */
export function readRecentThemeItems(repoRoot: string, minScore: number): ThemeItemView[] {
  const out: ThemeItemView[] = []
  try {
    const feed = readFeed(repoRoot, 2)
    for (const it of feed.items as FeedItem[]) {
      if (it.band === 'drop' || (it.triage_score || 0) < minScore) continue
      out.push({
        event_id: it.event_id, headline: it.headline, found_at: it.ts,
        companies: it.companies || [], event_types: it.event_types || [], issuer_linkage: it.issuer_linkage,
        triage_score: it.triage_score, materiality_pre_score: (it as any).materiality_pre_score,
        source_tier: it.source_tier || deriveSourceTier(it), scope: it.scope, region: it.region,
      })
    }
  } catch {
    // none
  }
  return out
}

/** Load one live theme's full record by id (for the deep-dive API). */
export function loadTheme(repoRoot: string, themeId: string): Theme | null {
  return loadThemes(repoRoot).find((t) => t.theme_id === themeId && t.status !== 'retired') || null
}

/** The deep-dive payload: resolve the theme's member event_ids → full FeedItems (newest/best first),
 *  and group its companies by order tier. Members not found in the recent feed fall back to a minimal
 *  row built from the stored member record, so the deep-dive is never empty for a live theme. */
export function buildThemeDetail(repoRoot: string, theme: Theme): ThemeDetail {
  let feedById = new Map<string, FeedItem>()
  try {
    const feed = readFeed(repoRoot, 2)
    feedById = new Map((feed.items as FeedItem[]).map((it) => [it.event_id, it]))
  } catch {
    // none — fall back to minimal member rows below
  }
  const members: FeedItem[] = theme.members
    .map((m) => {
      const f = feedById.get(m.event_id)
      if (f) return f
      // minimal fallback so a member older than the 2-day feed still shows
      return {
        kind: 'item', ts: m.found_at, event_id: m.event_id, headline: m.headline, url: '', domain: '',
        source_name: '', via: 'gdelt', region: 'GLOBAL', input_nature: 'news_headline',
        triage_score: m.score, band: 'watch', triage_reason: '', relevance: 'relevant_non_material',
        event_types: m.event_types || [], issuer_linkage: (m.issuer_linkage as any) || 'sector',
        companies: m.companies || [], size_bucket: 'unknown', source_tier: m.tier as any,
        dedup_status: 'new', inboxed: true,
      } as FeedItem
    })
    .sort((a, b) => (b.triage_score || 0) - (a.triage_score || 0) || (a.ts < b.ts ? 1 : -1))

  const byOrder: CompaniesByOrder = { first: [], second: [], third: [] }
  for (const c of theme.companies) (c.order === 1 ? byOrder.first : c.order === 2 ? byOrder.second : byOrder.third).push(c)

  return {
    theme: buildSummary(theme),
    scores: theme.scores,
    members,
    companies_by_order: byOrder,
    sectors: theme.sectors,
    related_themes: theme.related_themes,
    keywords: theme.keywords,
  }
}
