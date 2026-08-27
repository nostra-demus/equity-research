// Final Themes truth-boundary regressions: quiet clocks, corrupt ledgers, canonical story families and
// merge invalidation. Run: npx tsx test/themes-hardening.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { newsBus, type NewsBusEvent } from '../src/news/bus'
import { runIngestCycle } from '../src/news/runCycle'
import { createTheme, DEFAULT_DISCOVER_CONFIG, mergeAndRetire } from '../src/news/themes/discover'
import { buildSummary, appendThemeMutations, loadTheme, loadThemes, readThemesIndex, writeThemesIndex } from '../src/news/themes/store'
import { uniqueThemeEvidenceMembers, uniqueThemeMembers } from '../src/news/themes/qualification'
import type { ThemeItemView } from '../src/news/themes/types'
import { attachValidNarrative } from './themes-fixtures'

const NOW = new Date('2026-08-04T06:00:00Z')
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString()
const co = (name: string, ticker: string | null) => ({ name, ticker, listing_country: 'US' })
const item = (event_id: string, headline: string, opts: Partial<ThemeItemView> = {}): ThemeItemView => ({
  event_id, dedup_group: opts.dedup_group, headline, found_at: opts.found_at || hoursAgo(1),
  companies: opts.companies || [], event_types: opts.event_types || ['capex'], issuer_linkage: opts.issuer_linkage || 'primary',
  triage_score: opts.triage_score ?? 88, source_tier: opts.source_tier || 'news', country: opts.country,
})
const narrative = (rows: ThemeItemView[]) => {
  const theme = createTheme(rows, NOW, 'claude')
  theme.name = 'AI Data-Center Capacity Buildout'
  theme.description = 'Chip, cooling and power suppliers are expanding capacity for AI data centers.'
  return attachValidNarrative(theme)
}

// dedup_group is the canonical family, while each changed event identity remains a bounded audit
// observation. Family-level conviction still collapses the publisher rewrite to one story.
{
  const base = narrative([
    item('canonical-a', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')] }),
    item('other-b', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')] }),
  ])
  base.members.push({
    ...base.members[0], event_id: 'publisher-copy', dedup_group: 'canonical-a',
    headline: 'AI data-centre capacity expansion announced by Nvidia',
  })
  assert.equal(uniqueThemeMembers(base.members).length, 2)
  assert.equal(uniqueThemeEvidenceMembers(base.members).length, 3)
}

// A valid-JSON partial mutation cannot replace the prior good snapshot or crash index construction.
{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-ledger-boundary-'))
  const theme = narrative([
    item('ledger-a', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')] }),
    item('ledger-b', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')] }),
    item('ledger-c', 'Microsoft expands AI data center power capacity', { companies: [co('Microsoft', 'MSFT')] }),
  ])
  appendThemeMutations(root, [theme], () => NOW)
  const ledger = path.join(root, 'screener', 'ledger', 'themes.ndjson')
  fs.appendFileSync(ledger, JSON.stringify({ kind: 'theme', ts: NOW.toISOString(), theme: { theme_id: theme.theme_id, status: 'live', members: { corrupt: true } } }) + '\n')
  fs.appendFileSync(ledger, JSON.stringify({ kind: 'theme', ts: NOW.toISOString(), theme: { theme_id: 'THM-deadbeef', status: 'live', name: 'Broken', slug: 'broken', description: 'Broken row.', members: {} } }) + '\n')
  const loaded = loadThemes(root)
  assert.equal(loaded.length, 1, 'last valid mutation wins; an irrecoverable replacement/new row is ignored')
  assert.equal(loaded[0].theme_id, theme.theme_id)
  assert.doesNotThrow(() => buildSummary(loaded[0], NOW))

  const merged = { ...loaded[0], status: 'merged' as const, merged_into: 'THM-feedface', rev: loaded[0].rev + 1 }
  appendThemeMutations(root, [merged], () => NOW)
  assert.equal(loadTheme(root, theme.theme_id), null, 'merged tombstones are not live detail/brief resources')
  fs.rmSync(root, { recursive: true, force: true })
}

// Merging two ordered rings must enforce the hard member/debt cap, and a model-approved keeper must lose
// admission until the combined narrative is explicitly re-grounded.
{
  const fresh = narrative([
    item('fresh-a', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')], found_at: hoursAgo(1) }),
    item('fresh-b', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')], found_at: hoursAgo(2) }),
    item('fresh-c', 'Microsoft expands AI data center power capacity', { companies: [co('Microsoft', 'MSFT')], found_at: hoursAgo(3) }),
  ])
  const old = narrative([
    item('old-a', 'AMD expands AI data center chip capacity', { companies: [co('AMD', 'AMD')], found_at: hoursAgo(30) }),
    item('old-b', 'Eaton expands AI data center power capacity', { companies: [co('Eaton', 'ETN')], found_at: hoursAgo(31) }),
    item('old-c', 'Arista expands AI data center network capacity', { companies: [co('Arista', 'ANET')], found_at: hoursAgo(32) }),
  ])
  old.theme_id = 'THM-deadbeef'
  fresh.scores.composite = 80
  old.scores.composite = 20
  mergeAndRetire([fresh, old], NOW, { ...DEFAULT_DISCOVER_CONFIG, maxMembers: 3 })
  assert.deepEqual(fresh.members.map((m) => m.event_id), ['fresh-c', 'fresh-b', 'fresh-a'])
  assert.deepEqual(fresh.pending_narrative_event_ids, [])
  assert.equal(fresh.last_flow, hoursAgo(1))
  assert.equal(fresh.needs_rename, true)
  assert.equal(buildSummary(fresh, NOW).assessment.status, 'context', 'pre-merge validation cannot admit the combined cluster')
}

// A quiet drain still advances activity for an already-open client without expiring durable conviction.
{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-quiet-clock-'))
  const stateDir = path.join(root, 'state')
  const initial = narrative([
    item('quiet-a', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')], found_at: hoursAgo(1) }),
    item('quiet-b', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')], found_at: hoursAgo(2) }),
    item('quiet-c', 'Microsoft expands AI data center power capacity', { companies: [co('Microsoft', 'MSFT')], found_at: hoursAgo(3) }),
  ])
  appendThemeMutations(root, [initial], () => NOW)
  writeThemesIndex(root, [initial], () => NOW)
  assert.equal(readThemesIndex(root).themes[0]?.assessment.status, 'actionable')

  const seen: NewsBusEvent[] = []
  const unsubscribe = newsBus.subscribe((event) => seen.push(event))
  const later = new Date(NOW.getTime() + 25 * 3_600_000)
  await runIngestCycle({
    repoRoot: root, stateDir, skipFetch: true, now: () => later,
    config: { groqApiKey: 'test', themesEnabled: true, themesDiscoverEveryCycles: 99, anthropicFallbackEnabled: false },
    log: () => {},
  })
  unsubscribe()
  assert.equal(readThemesIndex(root).themes[0]?.assessment.status, 'actionable')
  assert.equal(readThemesIndex(root).themes[0]?.activity, 'quiet')
  assert.ok(seen.some((event) => event.type === 'theme-update' && event.theme.theme_id === initial.theme_id && event.theme.activity === 'quiet'))
  fs.rmSync(root, { recursive: true, force: true })
}

console.log('themes hardening: canonical families, ledger boundary, merge invalidation and quiet activity passed')
