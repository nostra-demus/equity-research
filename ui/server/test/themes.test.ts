// Dynamic themes engine (news/themes/*): deterministic scoring + decay, order tiering (4×25),
// assignment/bucketing, discovery clustering, merge/retire, and the end-to-end step. All in-memory,
// no network, no LLM. Run: npx tsx test/themes.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { scoreTheme, ensureDaily, rollDaily, bumpDaily, DAILY_WINDOWS } from '../src/news/themes/score'
import { companyImpact, orderTierFor } from '../src/news/themes/order'
import { assignThemes } from '../src/news/themes/assign'
import { clusterItems, discoverDeterministic, createTheme, mergeAndRetire, refreshThemeIdentity, coherenceOf, DEFAULT_DISCOVER_CONFIG } from '../src/news/themes/discover'
import { updateTokenDf, buildGenericSet, loadTokenDf, saveTokenDf, DEFAULT_TOKEN_DF_CONFIG, type TokenDfState } from '../src/news/themes/token-df'
import { topicTokens, themeTokens, isRoutineFiling } from '../src/news/text-match'
import { stepThemes, runThemesCycle, DEFAULT_THEMES_CONFIG } from '../src/news/themes/engine'
import { appendThemeMutations, buildSummary, buildThemesIndex, loadThemes, maybeCompactThemesLedger, readThemesIndex, writeThemesIndex } from '../src/news/themes/store'
import { Budget, resetBudgetMemory } from '../src/news/triage/budget'
import type { Theme, ThemeItemView } from '../src/news/themes/types'

let passed = 0
function check(name: string, fn: () => void | Promise<void>): Promise<void> | void {
  const done = () => { passed++; console.log(`  ok  ${name}`) }
  const fail = (e: any) => { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
  try {
    const r = fn()
    if (r instanceof Promise) return r.then(done, fail)
    done()
  } catch (e) { fail(e) }
}

const NOW = new Date('2026-06-13T12:00:00Z')
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString().replace(/\.\d{3}Z$/, 'Z')

function item(id: string, headline: string, opts: Partial<ThemeItemView> = {}): ThemeItemView {
  return {
    event_id: id, dedup_group: opts.dedup_group, headline, headline_en: opts.headline_en,
    found_at: opts.found_at || hoursAgo(0), companies: opts.companies || [], event_types: opts.event_types || [],
    issuer_linkage: opts.issuer_linkage || 'primary', triage_score: opts.triage_score ?? 70,
    source_tier: opts.source_tier || 'news', scope: opts.scope, region: opts.region, country: opts.country,
    commodities: opts.commodities,
  }
}
const co = (name: string, ticker: string | null = null) => ({ name, ticker, listing_country: null })

// ---- scoring + decay ----
await check('scoreTheme: a fresh, broad, sustained theme is HOT; the same theme 48h later decays to parked', () => {
  const members = [0, 1, 2, 3, 4, 5].map((i) => ({ event_id: `e${i}`, found_at: hoursAgo(i * 2), score: 80, tier: 'primary_filing' }))
  const theme = { members, companies: [{}, {}, {}, {}] as any, sectors: [], first_seen: hoursAgo(12) }
  const hot = scoreTheme(theme as any, NOW)
  assert.ok(hot.scores.composite >= 60 && hot.tier !== 'parked', `fresh theme should be lively, got ${hot.scores.composite}/${hot.tier}`)
  // same members, but evaluated 48h later → freshness + persistence collapse
  const later = scoreTheme(theme as any, new Date(NOW.getTime() + 48 * 3_600_000))
  assert.ok(later.scores.composite < hot.scores.composite, 'composite decays over time')
  assert.ok(later.scores.freshness < hot.scores.freshness, 'freshness decays')
})

await check('scoreTheme: a one-name single-burst flash scores LOW on breadth + persistence', () => {
  const members = [{ event_id: 'x', found_at: hoursAgo(0), score: 90, tier: 'news' }]
  const flash = scoreTheme({ members, companies: [{}] as any, sectors: [], first_seen: hoursAgo(0) } as any, NOW)
  assert.ok(flash.scores.breadth < 40, `one company → low breadth, got ${flash.scores.breadth}`)
  assert.ok(flash.tier !== 'hot', 'a flash is not hot')
})

// ---- order tiering (beneficiary-map 4×25) ----
await check('companyImpact: a directly-named, material, fast event → first-order; a weak sector tie → third', () => {
  const direct = companyImpact({ mention_count: 4, avg_score: 85, dominant_linkage: 'primary', dominant_event_type: 'mna' })
  assert.equal(direct.order, 1)
  assert.equal(direct.impact.composite, direct.impact.directness + direct.impact.magnitude + direct.impact.speed + direct.impact.reversibility)
  const ripple = companyImpact({ mention_count: 1, avg_score: 30, dominant_linkage: 'sector', dominant_event_type: 'operations' })
  assert.equal(ripple.order, 3)
  assert.ok(direct.impact.composite > ripple.impact.composite)
  assert.equal(orderTierFor(75), 1)
  assert.equal(orderTierFor(60), 2)
  assert.equal(orderTierFor(59), 3)
})

// ---- assignment / bucketing ----
await check('assignThemes: items join on recurring narrative (a company hit only strengthens it); off-theme items stay unclustered', () => {
  const theme: Theme = createTheme(
    [
      item('s1', 'Nvidia ramps AI data center GPU shipments', { companies: [co('Nvidia', 'NVDA')], event_types: ['product'] }),
      item('s2', 'Nvidia data center revenue jumps on AI demand', { companies: [co('Nvidia', 'NVDA')], event_types: ['earnings_revenue_margin'] }),
    ],
    NOW,
  )
  // company match
  const r = assignThemes([item('n1', 'Nvidia unveils new data center accelerator', { companies: [co('Nvidia', 'NVDA')] })], [theme])
  assert.deepEqual(r.assignments.get('n1'), [theme.theme_id])
  assert.equal(r.unclustered.length, 0)
  // off-theme item → unclustered
  const r2 = assignThemes([item('p1', 'Pfizer wins approval for a new cancer drug', { companies: [co('Pfizer', 'PFE')] })], [theme])
  assert.equal(r2.assignments.size, 0)
  assert.equal(r2.unclustered.length, 1)
  // members + companies grew on the matched theme
  assert.ok(theme.members.some((m) => m.event_id === 'n1'))
  assert.ok(theme.companies.some((c) => c.name_key === 'nvidia'))
})

// ---- discovery clustering ----
await check('clusterItems + discoverDeterministic: a 3-item, 2-company cluster forms a theme; a lone pair does not', () => {
  const pool = [
    item('a1', 'Quantum computing startup raises funds for new qubit chip', { companies: [co('IonQ', 'IONQ')] }),
    item('a2', 'IonQ and Rigetti push quantum computing milestones', { companies: [co('IonQ', 'IONQ'), co('Rigetti', 'RGTI')] }),
    item('a3', 'Rigetti unveils quantum computing roadmap and qubit gains', { companies: [co('Rigetti', 'RGTI')] }),
    item('z1', 'Unrelated tariff news on steel imports', { companies: [] }),
  ]
  const clusters = clusterItems(pool)
  assert.ok(clusters[0].length >= 3, 'the quantum trio clusters together')
  const { created, leftover } = discoverDeterministic(pool, [], NOW)
  assert.equal(created.length, 1, 'one qualifying theme')
  assert.ok(created[0].company_keys.length >= 2, 'theme carries the recurring companies')
  assert.ok(created[0].keywords.includes('quantum'), 'theme keyword anchor')
  assert.ok(leftover.some((i) => i.event_id === 'z1'), 'the unrelated item stays in the pool')
})

await check('discoverDeterministic dedupes the whole pool before the scan cut', () => {
  const pool = [
    item('old-copy', 'Old publisher copy of a solar capacity story', { dedup_group: 'story-solar' }),
    item('other-1', 'Unrelated steel tariff update'),
    item('other-2', 'Unrelated shipping rate update'),
    item('new-copy', 'Newest publisher copy of a solar capacity story', { dedup_group: 'story-solar' }),
  ]
  const { leftover } = discoverDeterministic(pool, [], NOW, { ...DEFAULT_DISCOVER_CONFIG, maxPoolScan: 3, minClusterItems: 99 })
  const copies = leftover.filter((row) => row.dedup_group === 'story-solar')
  assert.deepEqual(copies.map((row) => row.event_id), ['new-copy'], 'an older copy cannot survive in skipped leftovers')
})

await check('discoverDeterministic sorts a newest-first cold pool before scanning its fresh tail', () => {
  const newestFirst = [
    item('fresh-3', 'Rigetti reports quantum computing qubit chip milestones', { companies: [co('Rigetti', 'RGTI')], found_at: hoursAgo(1) }),
    item('fresh-2', 'IonQ and Rigetti advance quantum computing qubit chips', { companies: [co('IonQ', 'IONQ'), co('Rigetti', 'RGTI')], found_at: hoursAgo(2) }),
    item('fresh-1', 'IonQ expands quantum computing qubit chip capacity', { companies: [co('IonQ', 'IONQ')], found_at: hoursAgo(3) }),
    item('old-2', 'Old unrelated shipping rate item', { found_at: hoursAgo(20) }),
    item('old-1', 'Older unrelated steel tariff item', { found_at: hoursAgo(21) }),
  ]
  const { created } = discoverDeterministic(newestFirst, [], NOW, { ...DEFAULT_DISCOVER_CONFIG, maxPoolScan: 3 })
  assert.equal(created.length, 1, 'the scan tail is the three freshest rows, regardless of input ordering')
  assert.deepEqual(new Set(created[0].members.map((m) => m.event_id)), new Set(['fresh-1', 'fresh-2', 'fresh-3']))
})

await check('runThemesCycle normalizes a legacy newest-first pool before its pre-discovery cap', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-pool-order-'))
  const stateDir = path.join(dir, 'state')
  fs.mkdirSync(stateDir, { recursive: true })
  const newestFirst = [
    item('cycle-fresh-3', 'Rigetti reports quantum computing qubit chip milestones', { companies: [co('Rigetti', 'RGTI')], found_at: hoursAgo(1) }),
    item('cycle-fresh-2', 'IonQ and Rigetti advance quantum computing qubit chips', { companies: [co('IonQ', 'IONQ'), co('Rigetti', 'RGTI')], found_at: hoursAgo(2) }),
    item('cycle-fresh-1', 'IonQ expands quantum computing qubit chip capacity', { companies: [co('IonQ', 'IONQ')], found_at: hoursAgo(3) }),
    item('cycle-old-2', 'Old unrelated shipping rate item', { found_at: hoursAgo(20) }),
    item('cycle-old-1', 'Older unrelated steel tariff item', { found_at: hoursAgo(21) }),
  ]
  fs.writeFileSync(path.join(stateDir, 'themes-unclustered.json'), JSON.stringify(newestFirst) + '\n')
  const cfg = {
    ...DEFAULT_THEMES_CONFIG,
    poolCap: 3,
    discover: { ...DEFAULT_THEMES_CONFIG.discover, maxPoolScan: 3 },
  }
  await runThemesCycle({ repoRoot: dir, stateDir, items: [], runDiscovery: true, now: () => NOW, cfg })
  const created = loadThemes(dir)
  assert.equal(created.length, 1, 'the fresh cluster survives the wrapper cap and is discovered')
  assert.deepEqual(new Set(created[0].members.map((m) => m.event_id)), new Set(['cycle-fresh-1', 'cycle-fresh-2', 'cycle-fresh-3']))
  fs.rmSync(dir, { recursive: true, force: true })
})

await check('createTheme carries translation and slice metadata onto every discovered member', () => {
  const t = createTheme([
    item('meta-1', 'Original headline', {
      headline_en: 'English headline', country: 'IN', region: 'ASIA', commodities: ['GOLD', 'SILVER'],
      companies: [co('MetalCo', 'METL')],
    }),
  ], NOW)
  assert.equal(t.members[0].headline_en, 'English headline')
  assert.equal(t.members[0].country, 'IN')
  assert.equal(t.members[0].region, 'ASIA')
  assert.deepEqual(t.members[0].commodities, ['GOLD', 'SILVER'])
})

// ---- merge + retire ----
await check('mergeAndRetire: two themes sharing companies merge; a parked, long-stale theme retires', () => {
  const t1 = createTheme([item('m1', 'Nvidia AMD AI chip demand rises', { companies: [co('Nvidia', 'NVDA'), co('AMD', 'AMD')] }), item('m2', 'Nvidia AMD AI chip demand race', { companies: [co('Nvidia', 'NVDA'), co('AMD', 'AMD')] }), item('m3', 'Nvidia AMD AI chip demand outlook', { companies: [co('Nvidia'), co('AMD')] })], NOW)
  const t2 = createTheme([item('m4', 'AMD Nvidia AI chip demand accelerates', { companies: [co('AMD', 'AMD'), co('Nvidia', 'NVDA')] }), item('m5', 'Nvidia AMD AI chip demand rises', { companies: [co('Nvidia'), co('AMD')] }), item('m6', 'AMD Nvidia AI chip demand outlook', { companies: [co('AMD'), co('Nvidia')] })], NOW)
  // force distinct ids by tweaking one slug so they are two themes that then merge on shared companies
  t2.theme_id = t1.theme_id + '-x'
  const themes = [t1, t2]
  for (const t of themes) t.scores.composite = 50
  const changed = mergeAndRetire(themes, NOW)
  assert.ok([t1, t2].some((t) => t.status === 'merged'), 'one of the duplicate themes merged')
  assert.ok(changed.size >= 2)
  // retire: a parked theme whose last_flow is 100h old
  const stale = createTheme([item('s', 'old thing', { companies: [co('OldCo'), co('Other')], found_at: hoursAgo(100) }), item('s2', 'old thing two', { companies: [co('OldCo'), co('Other')], found_at: hoursAgo(100) }), item('s3', 'old thing three', { companies: [co('OldCo'), co('Other')], found_at: hoursAgo(100) })], NOW)
  stale.tier = 'parked'
  stale.last_flow = hoursAgo(100)
  mergeAndRetire([stale], NOW)
  assert.equal(stale.status, 'retired')
})

await check('mergeAndRetire refuses shared-company themes with disconnected narratives', () => {
  const sharedCompanies = [co('Alpha Holdings', 'ALPH'), co('Beta Holdings', 'BETA'), co('Gamma Holdings', 'GAMM')]
  const capacity = createTheme([
    item('mc1', 'Solar panel capacity expansion accelerates', { companies: sharedCompanies }),
    item('mc2', 'Solar panel capacity expansion continues', { companies: sharedCompanies }),
    item('mc3', 'Solar panel capacity expansion broadens', { companies: sharedCompanies }),
  ], NOW)
  const cyber = createTheme([
    item('md1', 'Cyber breach response investigation begins', { companies: sharedCompanies }),
    item('md2', 'Cyber breach response investigation widens', { companies: sharedCompanies }),
    item('md3', 'Cyber breach response investigation continues', { companies: sharedCompanies }),
  ], NOW)
  cyber.theme_id = `${capacity.theme_id}-cyber`
  mergeAndRetire([capacity, cyber], NOW)
  assert.equal(capacity.status, 'live')
  assert.equal(cyber.status, 'live')
})

// ---- end-to-end step ----
await check('stepThemes: items get assigned, discovery forms a theme, everything is scored', async () => {
  const items = [
    item('e1', 'AI data center buildout drives Nvidia orders', { companies: [co('Nvidia', 'NVDA')], event_types: ['commercial'], triage_score: 85, source_tier: 'company' }),
    item('e2', 'Nvidia data center demand lifts AI chip outlook', { companies: [co('Nvidia', 'NVDA')], event_types: ['guidance_change'], triage_score: 80 }),
    item('e3', 'Vertiv wins AI data center cooling contracts', { companies: [co('Vertiv', 'VRT')], event_types: ['commercial'], triage_score: 75 }),
    item('e4', 'AI data center power demand strains the grid for Vertiv and peers', { companies: [co('Vertiv', 'VRT')], event_types: ['operations'], triage_score: 70 }),
  ]
  const res = await stepThemes({ themes: [], pool: [], items, runDiscovery: true, now: NOW })
  assert.ok(res.themes.length >= 1, 'at least one theme discovered from the AI-data-center cluster')
  const t = res.themes[0]
  assert.ok(t.scores.composite > 0 && ['hot', 'active', 'cooling', 'parked'].includes(t.tier), 'theme is scored + tiered')
  assert.ok(t.companies.length >= 1, 'theme has companies with order tiers')
  assert.ok(t.companies.every((c) => c.order >= 1 && c.order <= 3))
  assert.ok(res.changed.length >= 1, 'changed summaries returned for SSE/persist')
})

await check('stepThemes emits explicit merged invalidations instead of ghost summaries', async () => {
  const mk = (prefix: string) => createTheme([
    item(`${prefix}1`, 'Nvidia AMD AI chip demand capacity expands', { companies: [co('Nvidia', 'NVDA'), co('AMD', 'AMD')] }),
    item(`${prefix}2`, 'AMD Nvidia AI chip demand capacity rises', { companies: [co('AMD', 'AMD'), co('Nvidia', 'NVDA')] }),
    item(`${prefix}3`, 'Nvidia AMD AI chip demand capacity outlook', { companies: [co('Nvidia', 'NVDA'), co('AMD', 'AMD')] }),
  ], NOW, 'claude')
  const keep = mk('keep')
  const drop = mk('drop')
  drop.theme_id = `${drop.theme_id}-other`
  keep.scores.composite = 60
  drop.scores.composite = 50
  const res = await stepThemes({ themes: [keep, drop], pool: [], items: [], runDiscovery: true, now: NOW })
  const removal = res.removed.find((r) => r.reason === 'merged')
  assert.ok(removal, 'the merged-away theme has an explicit invalidation')
  assert.equal(removal!.merged_into, keep.theme_id)
  assert.ok(!res.changed.some((summary) => summary.theme_id === removal!.theme_id), 'a removed theme is never emitted as a live summary')
})

await check('runThemesCycle persists retirement and returns a client invalidation', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-removal-'))
  const stateDir = path.join(dir, 'state')
  const stale = createTheme([
    item('ret-1', 'OldCo PeerCo copper mine output declines', { companies: [co('OldCo', 'OLD'), co('PeerCo', 'PEER')], found_at: hoursAgo(100) }),
    item('ret-2', 'PeerCo OldCo copper mine output falls', { companies: [co('PeerCo', 'PEER'), co('OldCo', 'OLD')], found_at: hoursAgo(100) }),
    item('ret-3', 'OldCo PeerCo copper mine output weakens', { companies: [co('OldCo', 'OLD'), co('PeerCo', 'PEER')], found_at: hoursAgo(100) }),
  ], NOW, 'claude')
  stale.name = 'Copper Mine Output Decline'
  stale.description = 'OldCo and PeerCo are reporting lower copper mine output.'
  stale.tier = 'parked'
  stale.last_flow = hoursAgo(100)
  appendThemeMutations(dir, [stale], () => NOW)
  writeThemesIndex(dir, [stale], () => NOW)

  const res = await runThemesCycle({ repoRoot: dir, stateDir, items: [], runDiscovery: true, now: () => NOW })
  assert.deepEqual(res.removed, [{ theme_id: stale.theme_id, reason: 'retired', merged_into: null, rev: stale.rev + 1 }])
  assert.ok(!res.changed.some((summary) => summary.theme_id === stale.theme_id))
  assert.equal(loadThemes(dir).find((t) => t.theme_id === stale.theme_id)?.status, 'retired', 'the invalidated state is durable')
  assert.equal(readThemesIndex(dir).themes.some((t) => t.theme_id === stale.theme_id), false, 'the rebuilt snapshot drops the ghost')
  fs.rmSync(dir, { recursive: true, force: true })
})

await check('runThemesCycle emits qualification decay once without appending a time-only ledger mutation', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-time-decay-'))
  const stateDir = path.join(dir, 'state')
  const initialNow = new Date('2026-06-13T06:00:00Z')
  const at = (hours: number) => new Date(initialNow.getTime() - hours * 3_600_000).toISOString().replace(/\.\d{3}Z$/, 'Z')
  const theme = createTheme([
    item('td1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')], event_types: ['capex'], found_at: at(1) }),
    item('td2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')], event_types: ['capex'], found_at: at(2) }),
    item('td3', 'Microsoft expands AI data center power capacity', { companies: [co('Microsoft', 'MSFT')], event_types: ['capex'], found_at: at(3) }),
  ], initialNow, 'claude')
  theme.name = 'AI Data-Center Capacity Buildout'
  theme.description = 'Chip, power and cooling suppliers are expanding capacity as demand rises.'
  theme.tier = 'hot'
  assert.equal(buildSummary(theme, initialNow).assessment.status, 'actionable')
  appendThemeMutations(dir, [theme], () => initialNow)
  writeThemesIndex(dir, [theme], () => initialNow)

  const later = new Date(initialNow.getTime() + 7 * 3_600_000)
  const cfg = {
    ...DEFAULT_THEMES_CONFIG,
    score: { ...DEFAULT_THEMES_CONFIG.score, thresholds: { hot: 0, active: 0, cooling: 0 } },
  }
  const first = await runThemesCycle({ repoRoot: dir, stateDir, items: [], runDiscovery: false, now: () => later, cfg })
  assert.equal(first.changed.length, 1)
  assert.equal(first.changed[0].assessment.status, 'context')
  const ledger = path.join(dir, 'screener', 'ledger', 'themes.ndjson')
  assert.equal(fs.readFileSync(ledger, 'utf8').trim().split('\n').length, 1, 'projection-only decay does not duplicate a Theme mutation')

  const unchanged = await runThemesCycle({ repoRoot: dir, stateDir, items: [], runDiscovery: false, now: () => later, cfg })
  assert.deepEqual(unchanged.changed, [], 'the same assessment is not emitted again on every cycle')
  fs.rmSync(dir, { recursive: true, force: true })
})

// Regression (PR #71 Codex finding): a `social` (Reddit) item must NEVER independently drive a theme —
// a theme is a thesis precursor (CLAUDE.md §4/§24). The band/score caps keep social out of the top pick,
// but a non-drop social item still reaches the themes layer, which has no source-tier guard (score.ts
// counts an unrecognised tier at full news-level magnitude), so Reddit-only posts could form and rank a
// theme. Expected: a cluster of social-only items yields NO theme; the SAME cluster on a real source does.
await check('stepThemes: social-only items NEVER form a theme; the same cluster on a real source does (§4/§24)', async () => {
  const mk = (tier: string) => [
    item('z1', 'Acme mass layoffs restructuring hits 5000 staff', { companies: [co('Acme', 'ACME')], event_types: ['management'], triage_score: 88, source_tier: tier }),
    item('z2', 'Acme mass layoffs restructuring deepens', { companies: [co('Acme', 'ACME')], event_types: ['operations'], triage_score: 84, source_tier: tier }),
    item('z3', 'Beta joins Acme mass layoffs restructuring wave', { companies: [co('Beta', 'BETA'), co('Acme', 'ACME')], event_types: ['management'], triage_score: 80, source_tier: tier }),
  ]
  const social = await stepThemes({ themes: [], pool: [], items: mk('social'), runDiscovery: true, now: NOW })
  assert.equal(social.themes.filter((t) => t.status === 'live').length, 0, 'no theme is discovered from social-only items')
  assert.equal(social.assignments.size, 0, 'social items are not even assigned')
  // control: identical cluster from a real (news) source DOES form a theme — proving the filter is
  // social-specific, not a general break of discovery.
  const news = await stepThemes({ themes: [], pool: [], items: mk('news'), runDiscovery: true, now: NOW })
  assert.ok(news.themes.some((t) => t.status === 'live'), 'the same cluster on a real source forms a theme')
})

// ---- the LLM naming/validation pass (mocked fetch, no network) ----
await check('makeThemeNamer (groq path): renames a real theme, retires a non-theme, never throws', async () => {
  const { makeThemeNamer } = await import('../src/news/themes/llm')
  const os = await import('node:os'); const fsm = await import('node:fs'); const pth = await import('node:path')
  const tmp = fsm.mkdtempSync(pth.join(os.tmpdir(), 'thm-'))
  const real = createTheme([item('r1', 'Nvidia AI data center buildout', { companies: [co('Nvidia', 'NVDA')] }), item('r2', 'AI data center power demand surges', { companies: [co('Vertiv', 'VRT')] }), item('r3', 'Hyperscalers expand AI data centers', { companies: [co('Microsoft', 'MSFT')] })], NOW)
  const junk = createTheme([item('j1', 'SmallCo files compliance certificate', { companies: [co('SmallCo')] }), item('j2', 'SmallCo board meeting outcome', { companies: [co('SmallCo')] }), item('j3', 'SmallCo postal ballot', { companies: [co('OtherCo')] })], NOW)
  const content = JSON.stringify({ themes: [
    { i: 0, is_theme: true, name: 'AI Data-Center Buildout', slug: 'ai-data-center-buildout', description: 'Hyperscalers racing to build AI data centers, lifting chips, power and cooling.', keywords: ['ai', 'datacenter', 'hyperscaler'] },
    { i: 1, is_theme: false },
  ] })
  const fetchFn = (async () => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }) })) as unknown as typeof fetch
  const namer = makeThemeNamer({ themesDiscoverModel: 'groq', groqApiKey: 'k', groqBaseUrl: 'https://groq.test', groqModel: 'llama' }, fetchFn, tmp)
  assert.ok(namer, 'a namer is returned when a key is present')
  await namer!([real, junk], NOW)
  assert.equal(real.name, 'AI Data-Center Buildout')
  assert.equal(real.generation, 'groq')
  assert.ok(real.keywords.includes('ai'), 'a proposed keyword recurring in the evidence is accepted')
  assert.ok(!real.keywords.includes('hyperscaler'), 'an unsupported model-written keyword cannot become a future join key')
  assert.equal(junk.status, 'retired') // is_theme:false → dropped
})

await check('makeThemeNamer: a malformed verdict never grants validator-approved generation', async () => {
  const { makeThemeNamer } = await import('../src/news/themes/llm')
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thm-verdict-'))
  const candidate = createTheme([
    item('v1', 'Nvidia AI data center buildout accelerates', { companies: [co('Nvidia', 'NVDA')] }),
    item('v2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')] }),
    item('v3', 'Microsoft expands AI data center capacity', { companies: [co('Microsoft', 'MSFT')] }),
  ], NOW)
  candidate.needs_rename = true
  const content = JSON.stringify({ themes: [{
    i: 0,
    // Missing the required boolean `is_theme`: prose alone must not turn a deterministic cluster into
    // a validator-approved theme or clear a pending rename retry.
    name: 'AI Data-Center Buildout',
    description: 'AI infrastructure capacity is expanding.',
    keywords: ['ai'],
  }] })
  const fetchFn = (async () => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }], usage: { total_tokens: 20 } }) })) as unknown as typeof fetch
  const namer = makeThemeNamer({ themesDiscoverModel: 'groq', groqApiKey: 'k', groqBaseUrl: 'https://groq.test', groqModel: 'llama', groqDailyReqCap: 10, groqDailyTokenCap: 10_000 }, fetchFn, tmp)
  await namer!([candidate], NOW)
  assert.equal(candidate.generation, 'deterministic')
  assert.equal(candidate.needs_rename, true)
  assert.notEqual(candidate.name, 'AI Data-Center Buildout')
})

await check('makeThemeNamer: an incomplete true verdict stays queued for validation', async () => {
  const { makeThemeNamer } = await import('../src/news/themes/llm')
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thm-partial-verdict-'))
  const candidate = createTheme([
    item('pv1', 'Nvidia AI data center buildout accelerates', { companies: [co('Nvidia', 'NVDA')] }),
    item('pv2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')] }),
    item('pv3', 'Microsoft expands AI data center capacity', { companies: [co('Microsoft', 'MSFT')] }),
  ], NOW)
  candidate.needs_validation = true
  const prior = { name: candidate.name, description: candidate.description, slug: candidate.slug }
  const content = JSON.stringify({ themes: [{
    i: 0,
    is_theme: true,
    name: 'AI Data-Center Buildout',
    // Missing the required description: this is not enough to re-ground the narrative or clear retry.
  }] })
  const fetchFn = (async () => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }], usage: { total_tokens: 20 } }) })) as unknown as typeof fetch
  const namer = makeThemeNamer({ themesDiscoverModel: 'groq', groqApiKey: 'k', groqBaseUrl: 'https://groq.test', groqModel: 'llama', groqDailyReqCap: 10, groqDailyTokenCap: 10_000 }, fetchFn, tmp)
  await namer!([candidate], NOW)
  assert.equal(candidate.generation, 'deterministic')
  assert.equal(candidate.needs_validation, true)
  assert.deepEqual({ name: candidate.name, description: candidate.description, slug: candidate.slug }, prior)
})

await check('makeThemeNamer charges its strict bound when a malformed Groq reply has no usage', async () => {
  const { makeThemeNamer, themeNamerTokenBound } = await import('../src/news/themes/llm')
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thm-malformed-'))
  const real = createTheme([
    item('mr1', 'Nvidia AI data center buildout', { companies: [co('Nvidia', 'NVDA')] }),
    item('mr2', 'Vertiv expands AI data center cooling', { companies: [co('Vertiv', 'VRT')] }),
    item('mr3', 'Microsoft expands AI data centers', { companies: [co('Microsoft', 'MSFT')] }),
  ], NOW)
  const malformed = (async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('malformed JSON') } })) as unknown as typeof fetch
  const namer = makeThemeNamer({ themesDiscoverModel: 'groq', groqApiKey: 'k', groqBaseUrl: 'https://groq.test', groqModel: 'llama', groqDailyReqCap: 10, groqDailyTokenCap: 10_000 }, malformed, tmp)
  await namer!([real], NOW)
  const budget = JSON.parse(fs.readFileSync(path.join(tmp, 'groq-budget.json'), 'utf8'))
  assert.equal(budget.requests, 1)
  assert.equal(budget.tokens, themeNamerTokenBound([real]), 'a sent malformed reply is charged at the same safe bound it reserved')
})

await check('makeThemeNamer reserves the full prompt/output bound near the shared token cap', async () => {
  const { makeThemeNamer, themeNamerTokenBound } = await import('../src/news/themes/llm')
  resetBudgetMemory()
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thm-near-cap-'))
  const first = createTheme([
    item('nr1', 'Nvidia expands AI data center capacity', { companies: [co('Nvidia', 'NVDA')] }),
    item('nr2', 'Vertiv expands AI data center cooling', { companies: [co('Vertiv', 'VRT')] }),
    item('nr3', 'Microsoft expands AI data centers', { companies: [co('Microsoft', 'MSFT')] }),
  ], NOW)
  const second = createTheme([
    item('ns1', 'AMD expands AI data center capacity', { companies: [co('AMD', 'AMD')] }),
    item('ns2', 'Arista expands AI data center networking', { companies: [co('Arista', 'ANET')] }),
    item('ns3', 'Dell expands AI server capacity', { companies: [co('Dell', 'DELL')] }),
  ], NOW)
  const bound = themeNamerTokenBound([first])
  const oldEstimate = 1_400
  const actualTokens = oldEstimate + 200
  const tokenCap = 100 + bound
  const seed = Budget.load(tmp, 10, tokenCap, NOW.getTime(), 'groq-budget.json')
  seed.record(0, 100)
  seed.save()
  let fetches = 0
  const fetchFn = (async () => {
    fetches++
    await new Promise<void>((resolve) => setTimeout(resolve, 20))
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify({ themes: [{ i: 0, is_theme: true, name: 'AI Data-Center Buildout', slug: 'ai-data-center-buildout', description: 'AI infrastructure capacity is expanding.', keywords: ['ai'] }] }) } }], usage: { total_tokens: actualTokens } }) }
  }) as unknown as typeof fetch
  const cfg = { themesDiscoverModel: 'groq', groqApiKey: 'k', groqBaseUrl: 'https://groq.test', groqModel: 'm', groqDailyReqCap: 10, groqDailyTokenCap: tokenCap }
  const namerA = makeThemeNamer(cfg, fetchFn, tmp)!
  const namerB = makeThemeNamer(cfg, fetchFn, tmp)!
  await Promise.all([namerA([first], NOW), namerB([second], NOW)])
  assert.equal(fetches, 1, 'the competing namer cannot use the first call\'s reserved token room')
  const saved = JSON.parse(fs.readFileSync(path.join(tmp, 'groq-budget.json'), 'utf8'))
  assert.equal(saved.tokens, 100 + actualTokens)
  assert.ok(actualTokens > oldEstimate)
  assert.ok(saved.tokens <= tokenCap)
})

await check('makeThemeNamer returns undefined when no key / model off (stays deterministic)', async () => {
  const { makeThemeNamer } = await import('../src/news/themes/llm')
  assert.equal(makeThemeNamer({ themesDiscoverModel: 'off' }, fetch, '/tmp'), undefined)
  assert.equal(makeThemeNamer({ themesDiscoverModel: 'claude-haiku' }, fetch, '/tmp'), undefined) // no key
})

// ---- the daily flow ring (long-horizon history for the time-window selector) ----
const DAY_MS = Date.parse('2026-06-13T12:00:00Z')

await check('ensureDaily: seeds the ring from the member ring, newest bucket = today, idempotent', () => {
  const t: any = { members: [{ found_at: '2026-06-13T09:00:00Z' }, { found_at: '2026-06-13T11:00:00Z' }, { found_at: '2026-06-12T10:00:00Z' }] }
  ensureDaily(t, DAY_MS, 5)
  assert.equal(t.flow_daily.length, 5)
  assert.equal(t.flow_daily[4], 2, 'two items today (06-13) in the newest bucket')
  assert.equal(t.flow_daily[3], 1, 'one item yesterday (06-12)')
  assert.equal(t.flow_daily_day, '2026-06-13')
  ensureDaily(t, DAY_MS, 5) // present + correctly sized → untouched
  assert.equal(t.flow_daily[4], 2)
})

await check('bumpDaily: counts a landing at its own day; drops items older than the ring', () => {
  const t: any = {}
  bumpDaily(t, '2026-06-13T08:00:00Z', DAY_MS, 5)
  assert.equal(t.flow_daily[4], 1, 'today += 1')
  bumpDaily(t, '2026-06-12T08:00:00Z', DAY_MS, 5)
  assert.equal(t.flow_daily[3], 1, 'yesterday += 1')
  bumpDaily(t, '2026-06-01T00:00:00Z', DAY_MS, 5) // beyond the 5-day ring
  assert.equal(t.flow_daily.reduce((a: number, b: number) => a + b, 0), 2, 'the out-of-range item is dropped')
})

await check('bumpDaily: as the engine clock advances a day, the anchor rolls forward, preserving older buckets', () => {
  const t: any = {}
  bumpDaily(t, '2026-06-13T08:00:00Z', DAY_MS, 5)
  bumpDaily(t, '2026-06-14T08:00:00Z', Date.parse('2026-06-14T12:00:00Z'), 5) // a real 06-14 cycle (now advanced)
  assert.equal(t.flow_daily_day, '2026-06-14')
  assert.equal(t.flow_daily[4], 1, '06-14 in the newest bucket')
  assert.equal(t.flow_daily[3], 1, '06-13 preserved, shifted left by one')
})

await check('rollDaily: zero-pads quiet days yet KEEPS accumulated history (survives member eviction)', () => {
  const t: any = {}
  bumpDaily(t, '2026-06-13T08:00:00Z', DAY_MS, 5) // history that the member ring will later forget
  rollDaily(t, Date.parse('2026-06-15T12:00:00Z'), 5) // 2 days later, no new flow
  assert.equal(t.flow_daily_day, '2026-06-15')
  assert.equal(t.flow_daily[4], 0, 'today (06-15) is quiet')
  assert.equal(t.flow_daily[3], 0, '06-14 is quiet')
  assert.equal(t.flow_daily[2], 1, 'the 06-13 flow is preserved, shifted by two — NOT lost')
  rollDaily(t, Date.parse('2026-08-01T00:00:00Z'), 5) // far future → ring fully rolls past the history
  assert.equal(t.flow_daily.reduce((a: number, b: number) => a + b, 0), 0, 'history older than the ring ages out')
})

await check('bumpDaily: a FUTURE-dated item is clamped to today — anchor + history_days stay honest', () => {
  const t: any = {}
  bumpDaily(t, '2026-06-13T08:00:00Z', DAY_MS, 5) // today
  bumpDaily(t, '2026-06-20T08:00:00Z', DAY_MS, 5) // a week in the FUTURE relative to DAY_MS (clock-skewed feed)
  assert.equal(t.flow_daily_day, '2026-06-13', 'anchor never rolls past the engine clock')
  assert.equal(t.flow_daily[4], 2, 'the future-dated item counts in TODAY, not a future bucket')
  assert.equal(t.flow_daily.reduce((a: number, b: number) => a + b, 0), 2, 'no history inflation from the future date')
})

await check('mergeAndRetire: the merged theme re-seeds its daily ring from DE-DUPLICATED members (no double-count)', () => {
  const shared = item('shared1', 'Nvidia AMD chip race heats up', { companies: [co('Nvidia', 'NVDA'), co('AMD', 'AMD')] })
  const t1 = createTheme([item('g1', 'Nvidia AMD chip race demand', { companies: [co('Nvidia', 'NVDA'), co('AMD', 'AMD')] }), item('g2', 'Nvidia AMD chip race accelerates', { companies: [co('Nvidia', 'NVDA'), co('AMD', 'AMD')] }), shared], NOW)
  const t2 = createTheme([item('h1', 'AMD Nvidia chip race heats up', { companies: [co('AMD', 'AMD'), co('Nvidia', 'NVDA')] }), item('h2', 'Nvidia AMD chip race demand', { companies: [co('Nvidia'), co('AMD')] }), shared], NOW)
  t2.theme_id = t1.theme_id + '-x' // force two distinct themes that then merge on shared companies
  ensureDaily(t1, NOW.getTime()); ensureDaily(t2, NOW.getTime())
  assert.equal(t1.flow_daily![DAILY_WINDOWS - 1], 3, "each theme starts with 3 'today' members")
  for (const t of [t1, t2]) t.scores.composite = 50
  mergeAndRetire([t1, t2], NOW)
  const survivor = [t1, t2].find((t) => t.status === 'live')!
  // distinct today members across both = g1,g2,h1,h2,shared1 = 5 (shared1 belongs to BOTH but counts once);
  // element-wise ring addition would wrongly give 6.
  assert.equal(survivor.flow_daily![DAILY_WINDOWS - 1], 5, 'merged today bucket = distinct members, shared event counted once')
})

await check('stepThemes + index: themes carry the daily ring; history_days + summary flow_daily are exposed', async () => {
  const items = [
    item('d1', 'AI data center buildout drives Nvidia orders', { companies: [co('Nvidia', 'NVDA')], event_types: ['commercial'], triage_score: 85, source_tier: 'company' }),
    item('d2', 'Nvidia data center demand lifts AI chip outlook', { companies: [co('Nvidia', 'NVDA')], event_types: ['guidance_change'], triage_score: 80 }),
    item('d3', 'Vertiv wins AI data center cooling contracts', { companies: [co('Vertiv', 'VRT')], event_types: ['commercial'], triage_score: 75 }),
    item('d4', 'AI data center power demand strains the grid for Vertiv and peers', { companies: [co('Vertiv', 'VRT')], event_types: ['operations'], triage_score: 70 }),
  ]
  const res = await stepThemes({ themes: [], pool: [], items, runDiscovery: true, now: NOW })
  const t = res.themes[0]
  assert.equal(t.flow_daily?.length, DAILY_WINDOWS, 'the discovered theme is born with a full-length daily ring')
  assert.equal((t.flow_daily as number[])[DAILY_WINDOWS - 1], t.members.length, "today's bucket holds the members that just landed")
  const idx = buildThemesIndex(res.themes, () => NOW)
  assert.ok(idx.history_days >= 1, 'the index reports at least one day of history')
  assert.equal(buildSummary(t).flow_daily.length, DAILY_WINDOWS, 'the compact summary carries flow_daily for the cockpit')
})

check("earnings-calendar boilerplate is NOT a topic token (the Domino's theme-poisoning root cause)", () => {
  const a = topicTokens("Domino's Pizza Announces Second Quarter 2026 Earnings Release Date", [co("Domino's Pizza")])
  const b = topicTokens('Hilton Worldwide Announces Second Quarter 2026 Earnings Release Date', [co('Hilton Worldwide')])
  assert.ok(!a.has('announces') && !a.has('earnings') && !a.has('release') && !a.has('second'), 'the boilerplate words are not topic anchors')
  const shared = [...a].filter((t) => b.has(t))
  assert.deepEqual(shared, [], `two unrelated companies' routine earnings-date headlines share no token now, got: ${shared}`)
  // the stemmer generalizes beyond the literal list: "hosted"/"discussed" are NOT hand-listed (only
  // host/hosts/hosting and discuss/discusses/discussing are), so this only passes via stemming to the
  // stopworded "host"/"discuss" stems
  const c = topicTokens('Acme Corp hosted investors and discussed its outlook', [co('Acme Corp')])
  assert.ok(!c.has('hosted') && !c.has('discussed'), 'an inflected form not in the literal list is still caught via stemming')
})

check('clusterItems: a batch of routine earnings-date announcements from unrelated companies does NOT cluster', () => {
  const pool = [
    item('d1', "Domino's Pizza Announces Second Quarter 2026 Earnings Release Date", { companies: [co("Domino's Pizza")] }),
    item('d2', 'Hilton Worldwide Announces Second Quarter 2026 Earnings Release Date', { companies: [co('Hilton Worldwide')] }),
    item('d3', 'Wingstop Announces Second Quarter 2026 Earnings Release Date', { companies: [co('Wingstop')] }),
  ]
  const clusters = clusterItems(pool)
  assert.equal(clusters.length, 3, 'each unrelated earnings-date notice is its own singleton, not one fake theme')
})

check('clusterItems control: headlines sharing BOTH tokens AND a company still form one cluster (the fix is not over-broad)', () => {
  const pool = [
    item('n1', 'Nvidia ramps AI data center GPU shipments', { companies: [co('Nvidia', 'NVDA')] }),
    item('n2', 'Nvidia data center shipments demand accelerates', { companies: [co('Nvidia', 'NVDA')] }),
  ]
  assert.equal(clusterItems(pool)[0].length, 2, 'same-company items still cluster')
})

check('refreshThemeIdentity heals a poisoned "announces/earnings" theme: drains boilerplate keywords, purges unrelated companies', () => {
  const members = [
    item('hil', 'Hilton Worldwide Announces Second Quarter 2026 Earnings Release Date', { companies: [co('Hilton Worldwide')], event_types: ['capital_actions'] }),
    item('wing', 'Wingstop Announces Second Quarter 2026 Earnings Release Date', { companies: [co('Wingstop')], event_types: ['capital_actions'] }),
    item('ppg', 'PPG Announces Second Quarter 2026 Earnings Release Date', { companies: [co('PPG')], event_types: ['capital_actions'] }),
  ]
  const theme = createTheme(members, NOW)
  // simulate the persisted PRE-FIX poisoned state (each company appeared once — only the boilerplate
  // words ever recurred ≥2 times across this "theme")
  theme.keywords = ['announces', 'earnings', 'results', 'second', 'release', 'date']
  const { retire } = refreshThemeIdentity(theme)
  // there was never a real second topic linking these three unrelated companies — once the boilerplate
  // keywords are gone, nothing recurs ≥2 times and the theme correctly dissolves (this is the realistic
  // outcome for the actual "Domino's · announces" theme, which had no real second topic either)
  assert.equal(retire, true, 'a theme with no real topic left after the boilerplate purge retires entirely')
})

check('SEC form codes + the "Filer" role tag are NOT topic tokens (the theme-poisoning root cause)', () => {
  const toks = topicTokens('424B2 - GOLDMAN SACHS GROUP INC (0000886982) (Filer)', [co('Goldman Sachs Group Inc')])
  assert.ok(!toks.has('424b2'), 'the form code must not anchor a theme')
  assert.ok(!toks.has('filer'), 'the EDGAR role tag must not anchor a theme')
  assert.ok(toks.has('goldman') && toks.has('sachs'), 'the real company words still anchor')
  // two different banks’ routine prospectuses now share NO meaningful token → they cannot cluster
  const a = topicTokens('424B2 - JPMORGAN CHASE & CO (0000019617) (Filer)', [co('JPMorgan Chase & Co')])
  const b = topicTokens('424B2 - CITIGROUP INC (0000831001) (Filer)', [co('Citigroup Inc')])
  const shared = [...a].filter((t) => b.has(t))
  assert.deepEqual(shared, [], `cross-bank prospectuses share no token now, got: ${shared}`)
})

check('refreshThemeIdentity heals a poisoned theme: drains form-code keywords, purges cross-bank noise', () => {
  // a genuine mortgage core (Wells Fargo + Rocket) plus routine cross-bank 424B2 prospectuses that only
  // ever attached through the "424b2"/"filer" magnet — the exact "Mortgage Finance Innovation" shape.
  const members = [
    item('wf1', 'Wells Fargo expands its mortgage lending program', { companies: [co('Wells Fargo', 'WFC')], event_types: ['operations'] }),
    item('wf2', 'Wells Fargo cuts mortgage rates to win share', { companies: [co('Wells Fargo', 'WFC')], event_types: ['operations'] }),
    item('rk1', 'Rocket grows mortgage origination volume', { companies: [co('Rocket', 'RKT')], event_types: ['operations'] }),
    item('rk2', 'Rocket launches a new mortgage product', { companies: [co('Rocket', 'RKT')], event_types: ['product'] }),
    item('jpm', '424B2 - JPMORGAN CHASE & CO (0000019617) (Filer)', { companies: [co('JPMorgan Chase & Co')], event_types: ['capital_actions'], source_tier: 'primary_filing' }),
    item('c', '424B2 - CITIGROUP INC (0000831001) (Filer)', { companies: [co('Citigroup Inc')], event_types: ['capital_actions'], source_tier: 'primary_filing' }),
    item('gs', '424B2 - GOLDMAN SACHS GROUP INC (0000886982) (Filer)', { companies: [co('Goldman Sachs Group Inc')], event_types: ['capital_actions'], source_tier: 'primary_filing' }),
  ]
  const theme = createTheme(members, NOW)
  // simulate the persisted PRE-FIX state: the poisoned keyword set that vacuumed the cross-bank filings in
  theme.keywords = ['mortgage', 'finance', 'innovation', '424b2', 'filer', 'wells', 'fargo']

  const { changed, retire } = refreshThemeIdentity(theme)
  assert.equal(retire, false, 'a genuine two-company core survives')
  assert.equal(changed, true, 'the theme changed (keywords + membership)')
  assert.ok(!theme.keywords.includes('424b2') && !theme.keywords.includes('filer'), 'form-code keywords are drained')
  assert.ok(theme.keywords.includes('mortgage'), 'the real recurring topic is kept')
  const ids = new Set(theme.members.map((m) => m.event_id))
  assert.ok(ids.has('wf1') && ids.has('rk1'), 'the genuine mortgage core is kept')
  assert.ok(!ids.has('jpm') && !ids.has('c') && !ids.has('gs'), 'the cross-bank prospectus noise is purged')
})

check('refreshThemeIdentity recomputes last_flow + flow_daily after a purge (no stale over-report)', () => {
  // genuine mortgage core dated OLD; the cross-bank 424B2 noise that will be purged is the NEWEST flow —
  // so a purge that left the temporal fields untouched would keep claiming recent flow that's gone (§3).
  const members = [
    item('wf1', 'Wells Fargo expands its mortgage lending program', { companies: [co('Wells Fargo', 'WFC')], event_types: ['operations'], found_at: hoursAgo(72) }),
    item('wf2', 'Wells Fargo cuts mortgage rates to win share', { companies: [co('Wells Fargo', 'WFC')], event_types: ['operations'], found_at: hoursAgo(72) }),
    item('rk1', 'Rocket grows mortgage origination volume', { companies: [co('Rocket', 'RKT')], event_types: ['operations'], found_at: hoursAgo(48) }),
    item('rk2', 'Rocket launches a new mortgage product', { companies: [co('Rocket', 'RKT')], event_types: ['product'], found_at: hoursAgo(48) }),
    item('jpm', '424B2 - JPMORGAN CHASE & CO (0000019617) (Filer)', { companies: [co('JPMorgan Chase & Co')], event_types: ['capital_actions'], source_tier: 'primary_filing', found_at: hoursAgo(1) }),
    item('gs', '424B2 - GOLDMAN SACHS GROUP INC (0000886982) (Filer)', { companies: [co('Goldman Sachs Group Inc')], event_types: ['capital_actions'], source_tier: 'primary_filing', found_at: hoursAgo(1) }),
  ]
  const theme = createTheme(members, NOW)
  theme.keywords = ['mortgage', 'finance', 'innovation', '424b2', 'filer', 'wells', 'fargo']
  ensureDaily(theme, NOW.getTime())
  // before: last_flow + today's bucket reflect the 2 newest (about-to-be-purged) prospectus filings
  assert.equal(theme.last_flow, hoursAgo(1), 'before: last_flow is the newest (poison) member')
  assert.equal(theme.flow_daily![theme.flow_daily!.length - 1], 2, 'before: today bucket counts the 2 newest poison members')

  const { retire } = refreshThemeIdentity(theme, undefined, NOW)
  assert.equal(retire, false, 'the genuine two-company core survives')
  const keptIds = new Set(theme.members.map((m) => m.event_id))
  assert.ok(!keptIds.has('jpm') && !keptIds.has('gs'), 'the cross-bank prospectus noise is purged')
  // after: last_flow falls back to the newest KEPT member (Rocket, 48h ago) — not the purged one
  assert.equal(theme.last_flow, hoursAgo(48), 'last_flow recomputed to the newest KEPT member')
  // after: the daily ring is reseeded from kept members only — no leftover poison counts, today is quiet
  assert.equal(theme.flow_daily!.reduce((a: number, b: number) => a + b, 0), theme.members.length, 'ring counts only kept members')
  assert.equal(theme.flow_daily![theme.flow_daily!.length - 1], 0, 'today bucket no longer over-reports the purged flow')
})

check('refreshThemeIdentity is idempotent on a healthy theme (no spurious purge)', () => {
  const members = [
    item('h1', 'Nvidia ramps AI data center GPU shipments', { companies: [co('Nvidia', 'NVDA')], event_types: ['product'] }),
    item('h2', 'Nvidia data center revenue jumps on AI demand', { companies: [co('Nvidia', 'NVDA')], event_types: ['earnings_revenue_margin'] }),
    item('h3', 'AMD chases Nvidia in the AI data center market', { companies: [co('AMD', 'AMD'), co('Nvidia', 'NVDA')], event_types: ['product'] }),
  ]
  const theme = createTheme(members, NOW)
  const before = theme.members.length
  const { retire } = refreshThemeIdentity(theme)
  assert.equal(retire, false)
  assert.equal(theme.members.length, before, 'a healthy theme keeps all its members')
})

// ---- ledger compaction (store.maybeCompactThemesLedger) ----
function writeLedger(repoRoot: string, lines: string[]): string {
  const fp = path.join(repoRoot, 'screener', 'ledger', 'themes.ndjson')
  fs.mkdirSync(path.dirname(fp), { recursive: true })
  fs.writeFileSync(fp, lines.join('\n') + (lines.length ? '\n' : ''))
  return fp
}
const compactIds = { A: 'THM-aaaaaaaa', B: 'THM-bbbbbbbb', C: 'THM-cccccccc' } as const
const themeLine = (id: keyof typeof compactIds, rev: number) => {
  // Persistence accepts only complete Theme mutations. Keep this compaction fixture on that same durable
  // contract so the test proves losslessness without teaching the loader to bless partial forged rows.
  const theme = createTheme([
    item(`${id}-${rev}-1`, `${id} expands AI data center capacity`, { companies: [co(`${id} One`, `${id}1`)] }),
    item(`${id}-${rev}-2`, `${id} expands AI data center cooling capacity`, { companies: [co(`${id} Two`, `${id}2`)] }),
    item(`${id}-${rev}-3`, `${id} expands AI data center power capacity`, { companies: [co(`${id} Three`, `${id}3`)] }),
  ], NOW)
  theme.theme_id = compactIds[id]
  theme.name = id
  theme.rev = rev
  return JSON.stringify({ kind: 'theme', ts: hoursAgo(rev), theme })
}

await check('maybeCompactThemesLedger: over threshold → one line per theme_id, identical loadThemes result (lossless)', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-compact-'))
  // 6 mutation lines across 3 theme_ids; last-per-id wins (A→rev3, B→rev2, C→rev1)
  const fp = writeLedger(root, [
    themeLine('A', 1), themeLine('B', 1), themeLine('A', 2),
    themeLine('C', 1), themeLine('A', 3), themeLine('B', 2),
  ])
  const before = loadThemes(root)
  maybeCompactThemesLedger(root, () => NOW, 1) // threshold 1 byte → force compaction
  const after = loadThemes(root)
  // lossless: same set of themes, same last-state per id
  const norm = (ts: Theme[]) => [...ts].map((t) => JSON.stringify(t)).sort()
  assert.deepEqual(norm(after), norm(before), 'compaction must not change what loadThemes returns')
  assert.equal(after.length, 3, 'three distinct theme_ids survive')
  assert.equal((after.find((t) => t.theme_id === compactIds.A) as any).rev, 3, 'last mutation per id wins')
  // bounded: exactly one physical line per theme_id now
  const lines = fs.readFileSync(fp, 'utf8').split('\n').filter((l) => l.trim())
  assert.equal(lines.length, 3, 'ledger collapses to one line per theme_id')
  fs.rmSync(root, { recursive: true, force: true })
})

await check('maybeCompactThemesLedger: under threshold → no-op (leaves the ledger byte-for-byte)', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-compact-'))
  const fp = writeLedger(root, [themeLine('A', 1), themeLine('A', 2)])
  const raw = fs.readFileSync(fp, 'utf8')
  maybeCompactThemesLedger(root, () => NOW) // default 4MB threshold; tiny file → untouched
  assert.equal(fs.readFileSync(fp, 'utf8'), raw, 'a small ledger is left exactly as-is')
  fs.rmSync(root, { recursive: true, force: true })
})

await check('maybeCompactThemesLedger: already one-line-per-id → no-op even over threshold (no ts churn / re-dirty)', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-compact-'))
  // already compact: exactly one line per theme_id, no superseded cruft to collapse
  const fp = writeLedger(root, [themeLine('A', 3), themeLine('B', 2), themeLine('C', 1)])
  const raw = fs.readFileSync(fp, 'utf8')
  maybeCompactThemesLedger(root, () => NOW, 1) // threshold 1 byte → over threshold, but nothing to collapse
  assert.equal(fs.readFileSync(fp, 'utf8'), raw, 'an already-compact ledger is left byte-for-byte even over threshold')
  fs.rmSync(root, { recursive: true, force: true })
})

// ---- theme-layer vocabulary + routine-filing gate (the "Yes Bank Ltd" / "poll · results · held" fix) ----
// Live-ledger failure shapes (2026-07-02): the "Yes Bank Ltd" theme (457 members) absorbed every SAST
// Reg 29 disclosure via {substantial, acquisition, takeovers}; the top theme was literally named
// "poll · results · held" (1,126 members); "AI M&A" chained 229 unrelated deal completions via
// {completes, acquisition}. These checks pin the three channels shut.

check('themeTokens: calendar + event vocabulary never anchors a theme; real topic anchors survive', () => {
  const t = themeTokens('SpaceX IPO mania builds as annual results season ended in March with a merger completed', [])
  for (const noise of ['annual', 'ended', 'march', 'merger', 'completed']) {
    assert.ok(!t.has(noise), `"${noise}" must not be a theme token`)
  }
  assert.ok(t.has('spacex') && t.has('ipo') && t.has('mania') && t.has('season'), 'real anchors survive — only the listed classes are suppressed')
  const u = themeTokens('Strait of Hormuz closure threatens nuclear talks in Vienna', [])
  assert.ok(u.has('hormuz') && u.has('nuclear') && u.has('vienna'), 'genuine macro anchors survive')
  // fiscal-period tokens
  const f = themeTokens('Acme guidance for FY26 and 1Q26 tops estimates', [co('Acme')])
  assert.ok(!f.has('fy26') && !f.has('1q26'), 'fiscal-period tokens are dropped')
  assert.ok(f.has('guidance') || f.has('estimates') || f.has('tops'), 'the rest of the headline still tokenizes')
})

check('themeTokens: company-derived tokens are IMMUNE to suppression (a company named after a noise word)', () => {
  // normName('Tender Corp') → 'tender', which collides with the event-vocabulary class — the company
  // token must survive anyway, or a hot company could be silently unclusterable.
  const t = themeTokens('Tender Corp wins defense contract', [co('Tender Corp')])
  assert.ok(t.has('tender'), 'the company-derived token survives the noise class')
  // and the generic (Phase-2 DF) set obeys the same immunity
  const g = themeTokens('Tender Corp wins defense contract', [co('Tender Corp')], 'news', new Set(['tender', 'defense']))
  assert.ok(g.has('tender'), 'company token immune to the generic set')
  assert.ok(!g.has('defense'), 'a non-company generic token is suppressed')
})

check('two unrelated SAST Reg 29 disclosures share ZERO theme tokens (the Yes Bank pile-up root cause)', () => {
  const a = themeTokens('Linc Ltd-$: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Niyati Sharma', [co('Linc Ltd')], 'primary_filing')
  const b = themeTokens('Chambal Fertilisers & Chemicals Ltd: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Sidh Enterprises Ltd', [co('Chambal Fertilisers & Chemicals Ltd')], 'primary_filing')
  const shared = [...a].filter((t) => b.has(t))
  assert.deepEqual(shared, [], `two SAST disclosures for different companies share no token, got: ${shared}`)
  assert.ok(a.has('linc'), 'the routine filing still carries its OWN company token (may anchor its company theme)')
})

check('two unrelated HKEX annual-results notices share ZERO theme tokens (the "Digital Media Growth" root cause)', () => {
  const a = themeTokens('RICHLY FIELD (00313): ANNUAL RESULTS FOR THE YEAR ENDED 31 MARCH 2026', [co('Richly Field')], 'primary_filing')
  const b = themeTokens('LK TECH (00558): FINAL RESULTS FOR THE YEAR ENDED 31 MARCH 2026', [co('LK Tech')], 'primary_filing')
  const shared = [...a].filter((t) => b.has(t))
  assert.deepEqual(shared, [], `two results notices share no token, got: ${shared}`)
})

check('isRoutineFiling: paperwork shapes are routine; genuine events and election polls are NOT', () => {
  // positives — high-volume regulatory paperwork
  assert.ok(isRoutineFiling('Linc Ltd-$: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Bimla Devi Jalan'), 'SAST Reg 29')
  assert.ok(isRoutineFiling('LUZHOU BANK (01983): POLL RESULTS OF THE 2025 ANNUAL GENERAL MEETING HELD ON JUNE 30, 2026 AND PAYMENT OF FINAL DIVIDENDS'), 'AGM poll results (with year)')
  assert.ok(isRoutineFiling('KINGSOFT CLOUD (03896): POLL RESULTS OF THE ANNUAL GENERAL MEETING HELD ON JUNE 30, 2026'), 'AGM poll results')
  assert.ok(isRoutineFiling('Nyrstar NV – Results of the annual and extraordinary general shareholders\' meetings held on 30 June 2026'), 'AGM/EGM results, flexible middle')
  assert.ok(isRoutineFiling('RICHLY FIELD (00313): ANNUAL RESULTS FOR THE YEAR ENDED 31 MARCH 2026'), 'HKEX annual-results notice')
  assert.ok(isRoutineFiling('CI FIN TECH GP (08029): RESULTS ANNOUNCEMENT FOR THE YEAR ENDED 31 MARCH 2026'), 'results announcement, no adjective')
  assert.ok(isRoutineFiling('Alfavision Overseas India Ltd: Outcome of Board Meeting'), 'board-meeting outcome')
  assert.ok(isRoutineFiling('SUN KONG HLDGS (08631): 1. DELAY IN PUBLICATION OF ANNUAL RESULTS FOR THE YEAR ENDED 31 MARCH 2026'), 'results-delay notice')
  assert.ok(isRoutineFiling('Offer to Buy – Acquisition Window (Takeover) for PURPLE FINANCE LTD – Live Activities Schedule'), 'BSE acquisition-window schedule')
  assert.ok(isRoutineFiling('424B2 - GOLDMAN SACHS GROUP INC (0000886982) (Filer)', 'primary_filing'), 'routine EDGAR form on the filing tier')
  // negatives — genuine events must never be gated
  assert.ok(!isRoutineFiling('Emirates NBD to buy controlling stake in Yes Bank'), 'a real M&A story is not routine')
  assert.ok(!isRoutineFiling('8-K - ACME CORP (0000123456) (Filer)', 'primary_filing'), 'a non-routine form (8-K) is not gated')
  assert.ok(!isRoutineFiling('SC 13D - ACTIVIST FUND LP (0000999999) (Filer)', 'primary_filing'), 'an activist stake is not routine')
  assert.ok(!isRoutineFiling('424B2 - GOLDMAN SACHS GROUP INC (0000886982) (Filer)', 'news'), 'the EDGAR branch requires the filing tier')
  assert.ok(!isRoutineFiling('Exit poll results show ruling party ahead in state elections'), 'election polls stay macro anchors')
  assert.ok(!isRoutineFiling('KO YO GROUP (00827): UPDATES IN RELATION TO GOING CONCERN AND MITIGATION MEASURES'), 'a going-concern update is never routine')
})

check('assignThemes: routine paperwork does not inflate a narrative, even when it names the same company', () => {
  const yb = createTheme(
    [
      item('y1', 'Emirates NBD to buy controlling stake in Yes Bank', { companies: [co('Yes Bank', 'YESBANK'), co('Emirates NBD')], event_types: ['mna'] }),
      item('y2', 'Yes Bank stake sale to Emirates NBD clears RBI hurdle', { companies: [co('Yes Bank', 'YESBANK'), co('Emirates NBD')], event_types: ['regulatory'] }),
    ],
    NOW,
  )
  // A SAST disclosure ABOUT Yes Bank still has no narrative content. Company overlap alone is not proof
  // of a theme, so it stays outside the evidence cluster.
  const rYb = assignThemes([item('sast-yb', 'Yes Bank Ltd: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Emirates NBD', { companies: [co('Yes Bank', 'YESBANK')], source_tier: 'primary_filing', event_types: ['capital_actions'] })], [yb])
  assert.equal(rYb.assignments.size, 0, 'the on-company SAST filing does not become investment evidence')
  assert.equal(rYb.unclustered.length, 1)
  // an unrelated company's SAST disclosure does NOT join, despite sharing the entire boilerplate text
  const rLinc = assignThemes([item('sast-linc', 'Linc Ltd-$: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Niyati Sharma', { companies: [co('Linc Ltd')], source_tier: 'primary_filing', event_types: ['capital_actions'] })], [yb])
  assert.equal(rLinc.assignments.size, 0, 'the off-company SAST filing is rejected')
  assert.equal(rLinc.unclustered.length, 1)
  // and an unrelated M&A completion PR does not join either ("stake"/"acquisition" no longer chain)
  const rGrab = assignThemes([item('grab', 'Grab completes US$425 million acquisition of US-based Stash Financial', { companies: [co('Grab', 'GRAB')], event_types: ['mna'] })], [yb])
  assert.equal(rGrab.assignments.size, 0, 'an unrelated deal completion is rejected')
})

check('clusterItems: unrelated "completes acquisition" PRs are singletons (the 229-item "AI M&A" blob root cause)', () => {
  const pool = [
    item('g', 'Grab completes US$425 million acquisition of US-based Stash Financial', { companies: [co('Grab', 'GRAB')] }),
    item('m', 'Michelin completes the acquisition of Tex Tech Industries', { companies: [co('Michelin')] }),
    item('w', 'California Water Service Completes Acquisition Of Palm Mutual Water Company', { companies: [co('California Water Service')] }),
  ]
  assert.equal(clusterItems(pool).length, 3, 'each deal completion is its own singleton, not one fake theme')
})

check('refreshThemeIdentity: a Yes-Bank-shaped theme with no real core retires entirely', () => {
  // 1 genuine story + 4 unrelated SAST disclosures — the poisoned live shape. Once the boilerplate
  // channel closes, nothing recurs and the theme correctly dissolves.
  const members = [
    item('y1', 'Emirates NBD to buy controlling stake in Yes Bank', { companies: [co('Yes Bank', 'YESBANK'), co('Emirates NBD')], event_types: ['mna'] }),
    item('s1', 'Linc Ltd-$: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Niyati Sharma', { companies: [co('Linc Ltd')], source_tier: 'primary_filing' }),
    item('s2', 'NINtec Systems Ltd: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Niraj Gemawat', { companies: [co('NINtec Systems Ltd')], source_tier: 'primary_filing' }),
    item('s3', 'Transcorp International Ltd: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Ashok Kumar Agarwal', { companies: [co('Transcorp International Ltd')], source_tier: 'primary_filing' }),
    item('s4', 'Anubhav Plast Ltd: The Exchange has received the disclosure under Regulation 29(1) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Craft Emerging Market Fund PCC', { companies: [co('Anubhav Plast Ltd')], source_tier: 'primary_filing' }),
  ]
  const theme = createTheme(members, NOW)
  theme.keywords = ['substantial', 'acquisition', 'takeovers', 'yes', 'bank'] // the persisted PRE-FIX poisoned identity
  const { retire } = refreshThemeIdentity(theme)
  assert.equal(retire, true, 'no real multi-company core → the theme dissolves')
})

check('refreshThemeIdentity: a Yes Bank theme WITH a real core survives — SAST strangers purged, core kept', () => {
  const members = [
    item('y1', 'Emirates NBD to buy controlling stake in Yes Bank', { companies: [co('Yes Bank', 'YESBANK'), co('Emirates NBD')], event_types: ['mna'] }),
    item('y2', 'Yes Bank controlling stake sale to Emirates NBD clears RBI hurdle', { companies: [co('Yes Bank', 'YESBANK'), co('Emirates NBD')], event_types: ['regulatory'] }),
    item('y3', 'Emirates NBD controlling stake sale reshapes Indian private banking', { companies: [co('Yes Bank', 'YESBANK'), co('Emirates NBD')], event_types: ['mna'] }),
    item('s1', 'Linc Ltd-$: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Niyati Sharma', { companies: [co('Linc Ltd')], source_tier: 'primary_filing' }),
    item('s2', 'Chambal Fertilisers & Chemicals Ltd: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Sidh Enterprises Ltd', { companies: [co('Chambal Fertilisers & Chemicals Ltd')], source_tier: 'primary_filing' }),
  ]
  const theme = createTheme(members, NOW)
  theme.keywords = ['substantial', 'acquisition', 'takeovers', 'yes', 'bank']
  const { changed, retire } = refreshThemeIdentity(theme)
  assert.equal(retire, false, 'the genuine Yes Bank / Emirates NBD core survives')
  assert.equal(changed, true)
  const ids = new Set(theme.members.map((m) => m.event_id))
  assert.ok(ids.has('y1') && ids.has('y2') && ids.has('y3'), 'the real core is kept')
  assert.ok(!ids.has('s1') && !ids.has('s2'), 'the cross-company SAST strangers are purged')
  assert.ok(!theme.keywords.includes('substantial') && !theme.keywords.includes('takeovers'), 'boilerplate keywords drained')
  assert.ok(theme.company_keys.includes('yesbank'), 'the company anchor remains')
})

check('refreshThemeIdentity: a "poll · results · held"-shaped theme (routine notices only) retires', () => {
  const members = [
    item('p1', 'LUZHOU BANK (01983): POLL RESULTS OF THE 2025 ANNUAL GENERAL MEETING HELD ON JUNE 30, 2026 AND PAYMENT OF FINAL DIVIDENDS', { companies: [co('Luzhou Bank')], source_tier: 'primary_filing' }),
    item('p2', 'KINGSOFT CLOUD (03896): POLL RESULTS OF THE ANNUAL GENERAL MEETING HELD ON JUNE 30, 2026', { companies: [co('Kingsoft Cloud')], source_tier: 'primary_filing' }),
    item('p3', 'SUNMI TECH-W (06810): POLL RESULTS OF THE ANNUAL GENERAL MEETING HELD ON JUNE 30, 2026', { companies: [co('Sunmi Tech')], source_tier: 'primary_filing' }),
    item('p4', 'ARTINI HLDG (00789): ANNOUNCEMENT OF FINAL RESULTS FOR THE YEAR ENDED 31 MARCH 2026', { companies: [co('Artini Holding')], source_tier: 'primary_filing' }),
  ]
  const theme = createTheme(members, NOW)
  theme.keywords = ['poll', 'results', 'held', 'annual', 'june'] // the live top theme's actual identity (1,126 members)
  const { retire } = refreshThemeIdentity(theme)
  assert.equal(retire, true, 'a theme made of routine paperwork has no identity left and retires')
})

check('discoverDeterministic guard: a cluster glued by scan-wide words is refused; a distinctive macro wave passes', () => {
  // 12 items all sharing {insolvency, resolution, overhaul} (each a different company, none recurring)
  // → the words are scan-wide (df 12 ≥ bar 10 in a 15-item scan), the cluster has no recurring company,
  // so it must NOT become a theme. This is the "results · ended · march" shape with vocabulary the
  // static lists have never seen.
  const generic = Array.from({ length: 12 }, (_, i) =>
    item(`g${i}`, `Company${i} begins insolvency resolution process overhaul`, { companies: [co(`Company${i} Ltd`)] }))
  // control: a genuine macro wave — 3 shippers sharing {hormuz, strait, tanker}, distinctive in this scan
  const wave = [
    item('w1', 'Frontline reroutes tanker fleet as Hormuz strait risk spikes', { companies: [co('Frontline', 'FRO')] }),
    item('w2', 'Euronav flags Hormuz strait tanker insurance surge', { companies: [co('Euronav')] }),
    item('w3', 'Teekay pauses Hormuz strait tanker transits', { companies: [co('Teekay')] }),
  ]
  const { created, leftover } = discoverDeterministic([...generic, ...wave], [], NOW)
  assert.ok(!created.some((t) => t.keywords.includes('insolvency')), 'the scan-wide cluster is refused')
  assert.ok(generic.every((g) => leftover.some((l) => l.event_id === g.event_id)), 'refused items stay in the pool')
  const waveTheme = created.find((t) => t.keywords.includes('hormuz') || t.keywords.includes('tanker'))
  assert.ok(waveTheme, 'the distinctive macro wave still forms a theme (guard is not over-broad)')
})

check('dedup invariant: topicTokens (shared with story dedup) still carries the theme-noise words', () => {
  // The theme-noise classes live ONLY in themeTokens. If someone later "cleans up" by moving them into
  // STOP_WORDS, story dedup would collapse two DIFFERENT routine filings from the same company into one
  // (both reduce to {company} → jaccard 1.0). This check pins the separation.
  const t = topicTokens('Acme annual results for the year ended 31 March 2026 amid a substantial takeover', [])
  for (const kept of ['annual', 'ended', 'march', 'substantial', 'takeover']) {
    assert.ok(t.has(kept), `topicTokens must still carry "${kept}" — dedup depends on it (see themeTokens)`)
  }
})

// ---- Phase 2: rolling token-DF suppression + rename-on-heal + coherence-lite ----

const DF_CFG = { ...DEFAULT_TOKEN_DF_CONFIG } // windowDays 7, ratio 0.015, persistDays 3, minDocs 150
const dfDayMs = (d: number) => Date.parse('2026-06-01T12:00:00Z') + d * 86_400_000
// a day's item batch: `mark` items carry the marked token; every other word is unique per item
const dfDay = (d: number, count: number, mark: number, tok: string) =>
  Array.from({ length: count }, (_, i) => item(`d${d}i${i}`, `${i < mark ? tok + ' ' : ''}zqx${d}a${i}unique zqx${d}b${i}filler`))

await check('buildGenericSet: persistent high-DF token → generic; one-day burst → not; small days ignored; cold start empty', () => {
  const state: TokenDfState = { v: 1, days: [] }
  // 3 qualifying days (200 docs each) where "sastword" runs at 10% — persistent boilerplate
  for (let d = 0; d < 3; d++) updateTokenDf(state, dfDay(d, 200, 20, 'sastword'), dfDayMs(d), DF_CFG)
  // day 3: a genuine one-day burst — "hormuz" at 10% on a single day
  updateTokenDf(state, dfDay(3, 200, 20, 'hormuz'), dfDayMs(3), DF_CFG)
  // day 4: a sub-minDailyDocs day (100 docs) where "quietword" runs at 50% — must not count
  updateTokenDf(state, dfDay(4, 100, 50, 'quietword'), dfDayMs(4), DF_CFG)
  const generic = buildGenericSet(state, DF_CFG)
  assert.ok(generic.has('sastword'), 'a token over the ratio on ≥3 qualifying days is generic')
  assert.ok(!generic.has('hormuz'), 'a one-day burst stays an anchor (burst-vs-boilerplate)')
  assert.ok(!generic.has('quietword'), 'a day below minDailyDocs neither counts for nor against')
  // protected escape hatch
  const shielded = buildGenericSet(state, { ...DF_CFG, protected: ['sastword'] })
  assert.ok(!shielded.has('sastword'), 'a protected token is never generic')
  // cold start: no history → empty set → degrades to the static classes
  assert.equal(buildGenericSet({ v: 1, days: [] }, DF_CFG).size, 0, 'cold start yields an empty generic set')
})

await check('updateTokenDf: ring rotates + bounds to windowDays; closed days shed their singleton tail; state roundtrips', () => {
  const state: TokenDfState = { v: 1, days: [] }
  for (let d = 0; d < 9; d++) updateTokenDf(state, dfDay(d, 200, 20, 'sastword'), dfDayMs(d), DF_CFG)
  assert.equal(state.days.length, 7, 'ring bounded to windowDays')
  assert.equal(state.days[0].day, '2026-06-03', 'oldest days rolled off')
  const closed = state.days[state.days.length - 2] // any closed (non-newest) day
  assert.ok(!Object.keys(closed.df).some((t) => t.startsWith('zqx')), 'a closed day shed its unique-token tail')
  assert.ok((closed.df['sastword'] || 0) >= 20, 'the recurring token survived pruning')
  // roundtrip through the state file
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-df-'))
  saveTokenDf(tmp, state)
  assert.deepEqual(loadTokenDf(tmp), state, 'save → load is lossless')
  assert.deepEqual(loadTokenDf(fs.mkdtempSync(path.join(os.tmpdir(), 'themes-df-'))), { v: 1, days: [] }, 'missing file → empty state')
  fs.rmSync(tmp, { recursive: true, force: true })
})

await check('generic tokens neither match themes nor become keywords; company tokens stay immune', () => {
  const theme = createTheme(
    [
      item('L1', 'Lithium refinery capacity crunch hits Albemarle', { companies: [co('Albemarle', 'ALB')] }),
      item('L2', 'Albemarle flags lithium refinery bottlenecks', { companies: [co('Albemarle', 'ALB')] }),
    ],
    NOW,
  )
  const probe = item('L3', 'Lithium refinery expansion planned by Ganfeng', { companies: [co('Ganfeng')] })
  // without the generic set: joins on {lithium, refinery}
  assert.equal(assignThemes([probe], [theme]).assignments.size, 1, 'control: joins via 2 shared tokens')
  // with {lithium, refinery} corpus-generic (say a week of lithium-glut wire): token path closed
  theme.members.splice(2) // undo the control join
  const r = assignThemes([item('L4', 'Lithium refinery expansion planned by Ganfeng', { companies: [co('Ganfeng')] })], [theme], undefined, NOW, new Set(['lithium', 'refinery']))
  assert.equal(r.assignments.size, 0, 'generic tokens no longer clear the match bar')
  // and they are excluded from a NEW cluster's keywords
  const t2 = createTheme(
    [
      item('M1', 'Lithium refinery glut deepens for Pilbara', { companies: [co('Pilbara')] }),
      item('M2', 'Pilbara lithium refinery glut worsens', { companies: [co('Pilbara')] }),
    ],
    NOW, 'deterministic', new Set(['lithium', 'refinery']),
  )
  assert.ok(!t2.keywords.includes('lithium') && !t2.keywords.includes('refinery'), 'generic tokens cannot become identity keywords')
  assert.ok(t2.keywords.includes('glut'), 'distinctive tokens still can')
})

await check('refreshThemeIdentity reports identityShift + purgeShare; the engine flags model-named themes for rename', async () => {
  const mkPoisoned = () => {
    const t = createTheme(
      [
        item('y1', 'Emirates NBD to buy controlling stake in Yes Bank', { companies: [co('Yes Bank', 'YESBANK'), co('Emirates NBD')], event_types: ['mna'] }),
        item('y2', 'Yes Bank controlling stake sale to Emirates NBD clears RBI hurdle', { companies: [co('Yes Bank', 'YESBANK'), co('Emirates NBD')], event_types: ['regulatory'] }),
        item('y3', 'Emirates NBD controlling stake sale reshapes Indian private banking', { companies: [co('Yes Bank', 'YESBANK'), co('Emirates NBD')], event_types: ['mna'] }),
        item('s1', 'Linc Ltd-$: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Niyati Sharma', { companies: [co('Linc Ltd')], source_tier: 'primary_filing' }),
        item('s2', 'Chambal Fertilisers & Chemicals Ltd: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Sidh Enterprises Ltd', { companies: [co('Chambal Fertilisers & Chemicals Ltd')], source_tier: 'primary_filing' }),
      ],
      NOW,
    )
    t.keywords = ['substantial', 'acquisition', 'takeovers', 'yes', 'bank']
    // Groq used to be mislabeled as Claude. Pin the corrected provenance path so a healed Groq-named
    // theme cannot silently keep a stale narrative after that provenance fix.
    t.generation = 'groq'
    t.name = 'Yes Bank Ltd'
    return t
  }
  // direct unit: the heal reports how far the identity moved
  const direct = mkPoisoned()
  const r = refreshThemeIdentity(direct)
  assert.ok(r.identityShift > 0.5, `keywords moved far from the poisoned set, got shift ${r.identityShift}`)
  assert.ok(Math.abs(r.purgeShare - 2 / 5) < 1e-9, '2 of 5 members purged')
  // engine flow: heal (1b) flags it; the rename rides the discovery pass's EXISTING namer call
  const theme = mkPoisoned()
  const namerSeen: string[][] = []
  const namer = async (batch: Theme[]) => {
    namerSeen.push(batch.map((t) => t.name))
    const t = batch.find((x) => x.theme_id === theme.theme_id)
    if (t) { t.name = 'Yes Bank stake sale'; t.description = 'Emirates NBD buying control of Yes Bank.'; delete t.needs_rename; t.rev++ }
  }
  const quantumPool = [
    item('q1', 'Quantum computing startup raises money for new qubit chip', { companies: [co('IonQ', 'IONQ')] }),
    item('q2', 'IonQ and Rigetti push quantum computing milestones', { companies: [co('IonQ', 'IONQ'), co('Rigetti', 'RGTI')] }),
    item('q3', 'Rigetti unveils quantum computing roadmap and qubit gains', { companies: [co('Rigetti', 'RGTI')] }),
  ]
  const res = await stepThemes({ themes: [theme], pool: quantumPool, items: [], runDiscovery: true, now: NOW, llmNamer: namer })
  assert.equal(theme.name, 'Yes Bank stake sale', 'the healed theme was re-grounded by the namer')
  assert.ok(!theme.needs_rename, 'the flag cleared after processing')
  assert.ok(res.changed.some((c) => c.theme_id === theme.theme_id), 'the renamed theme is persisted + emitted')
  assert.ok(namerSeen[0].length >= 2, 'the rename rode the same call as the new cluster')
})

await check('renames are capped per pass and unprocessed flags survive for the next pass', async () => {
  const mkClaudeTheme = (tag: string) => {
    const t = createTheme(
      [
        item(`${tag}1`, `${tag}corp expands ${tag}widget factory output`, { companies: [co(`${tag}corp`)] }),
        item(`${tag}2`, `${tag}corp doubles ${tag}widget factory capacity`, { companies: [co(`${tag}corp`)] }),
        item(`${tag}3`, `${tag}other joins ${tag}corp on ${tag}widget factory push`, { companies: [co(`${tag}other`), co(`${tag}corp`)] }),
      ],
      NOW,
    )
    t.generation = 'claude'
    t.needs_rename = true // flagged on a prior pass
    return t
  }
  const flagged = [mkClaudeTheme('alpha'), mkClaudeTheme('beta'), mkClaudeTheme('gamma')]
  let renamesReceived = 0
  const namer = async (batch: Theme[]) => {
    renamesReceived = batch.filter((t) => flagged.some((f) => f.theme_id === t.theme_id)).length
    for (const t of batch) delete t.needs_rename
  }
  const quantumPool = [
    item('qq1', 'Quantum computing startup raises money for new qubit chip', { companies: [co('IonQ', 'IONQ')] }),
    item('qq2', 'IonQ and Rigetti push quantum computing milestones', { companies: [co('IonQ', 'IONQ'), co('Rigetti', 'RGTI')] }),
    item('qq3', 'Rigetti unveils quantum computing roadmap and qubit gains', { companies: [co('Rigetti', 'RGTI')] }),
  ]
  await stepThemes({ themes: flagged, pool: quantumPool, items: [], runDiscovery: true, now: NOW, llmNamer: namer })
  assert.equal(renamesReceived, 2, 'at most renamePerPass (2) flagged themes ride one call')
  assert.equal(flagged.filter((t) => t.needs_rename).length, 1, 'the third stays flagged for the next pass')
})

await check('new deterministic themes retry validation on a later empty discovery pass; legacy rows are not enrolled', async () => {
  const cluster = [
    item('vr1', 'IonQ expands quantum computing qubit chip capacity', { companies: [co('IonQ', 'IONQ')] }),
    item('vr2', 'IonQ and Rigetti advance quantum computing qubit chips', { companies: [co('IonQ', 'IONQ'), co('Rigetti', 'RGTI')] }),
    item('vr3', 'Rigetti reports quantum computing qubit chip milestones', { companies: [co('Rigetti', 'RGTI')] }),
  ]
  let failedCalls = 0
  const first = await stepThemes({
    themes: [], pool: cluster, items: [], runDiscovery: true, now: NOW,
    llmNamer: async () => { failedCalls++; throw new Error('provider unavailable') },
  })
  assert.equal(failedCalls, 1)
  const queued = first.themes[0]
  assert.equal(queued.needs_validation, true, 'the failed validation remains explicitly queued')

  let retryBatch: Theme[] = []
  const second = await stepThemes({
    themes: first.themes, pool: [], items: [], runDiscovery: true, now: NOW,
    llmNamer: async (batch) => {
      retryBatch = batch
      const t = batch.find((candidate) => candidate.theme_id === queued.theme_id)!
      delete t.needs_validation
      t.generation = 'claude'
      t.name = 'Quantum Computing Capacity Buildout'
      t.description = 'IonQ and Rigetti are expanding quantum-computing chip capacity.'
      t.rev++
    },
  })
  assert.ok(retryBatch.some((t) => t.theme_id === queued.theme_id), 'the empty later pass retries the queued theme')
  assert.equal(queued.needs_validation, undefined)
  assert.ok(second.changed.some((summary) => summary.theme_id === queued.theme_id), 'successful validation is persisted and emitted')

  const legacy = createTheme(cluster.map((row, i) => ({ ...row, event_id: `legacy-${i}` })), NOW)
  delete legacy.needs_validation // what a pre-queue ledger row looks like
  let legacyCalls = 0
  await stepThemes({ themes: [legacy], pool: [], items: [], runDiscovery: true, now: NOW, llmNamer: async () => { legacyCalls++ } })
  assert.equal(legacyCalls, 0, 'untouched legacy deterministic themes are not mass-enqueued')

  await stepThemes({
    themes: [legacy], pool: [], runDiscovery: false, now: NOW,
    items: [item('legacy-fresh', 'IonQ advances quantum computing qubit chip capacity', { companies: [co('IonQ', 'IONQ')] })],
  })
  assert.equal(legacy.needs_validation, true, 'fresh evidence assigned into a legacy deterministic row enrolls only that row')
  let touchedRetry = false
  await stepThemes({
    themes: [legacy], pool: [], items: [], runDiscovery: true, now: NOW,
    llmNamer: async (batch) => {
      touchedRetry = batch.some((t) => t.theme_id === legacy.theme_id)
      delete legacy.needs_validation
      legacy.generation = 'claude'
      legacy.rev++
    },
  })
  assert.equal(touchedRetry, true, 'the touched legacy row validates on the next discovery cadence')
})

await check('validation debt leads the bounded namer batch even when 8+ new clusters arrive', async () => {
  const pending = createTheme([
    item('debt-p1', 'IonQ expands quantum qubit production', { companies: [co('IonQ', 'IONQ')] }),
    item('debt-p2', 'Rigetti expands quantum qubit production', { companies: [co('Rigetti', 'RGTI')] }),
    item('debt-p3', 'IonQ and Rigetti accelerate quantum qubit production', { companies: [co('IonQ', 'IONQ'), co('Rigetti', 'RGTI')] }),
  ], NOW)
  const rename = createTheme([
    item('debt-r1', 'Vertiv expands data center cooling capacity', { companies: [co('Vertiv', 'VRT')] }),
    item('debt-r2', 'Eaton expands data center cooling capacity', { companies: [co('Eaton', 'ETN')] }),
    item('debt-r3', 'Vertiv and Eaton accelerate data center cooling capacity', { companies: [co('Vertiv', 'VRT'), co('Eaton', 'ETN')] }),
  ], NOW, 'claude')
  rename.needs_rename = true

  const specs = [
    ['hydrogen', 'electrolyzer'], ['copper', 'smelter'], ['battery', 'recycling'], ['robotic', 'warehouse'],
    ['aviation', 'engine'], ['satellite', 'launch'], ['insurance', 'pricing'], ['semiconductor', 'packaging'],
  ]
  const busyPool = specs.flatMap(([a, b], i) => {
    const one = `Maker${i}A`; const two = `Maker${i}B`
    return [
      item(`busy-${i}-1`, `${one} advances ${a} ${b} rollout`, { companies: [co(one, `M${i}A`)] }),
      item(`busy-${i}-2`, `${two} joins ${a} ${b} buildout`, { companies: [co(two, `M${i}B`)] }),
      item(`busy-${i}-3`, `${one} and ${two} accelerate ${a} ${b} investment`, { companies: [co(one, `M${i}A`), co(two, `M${i}B`)] }),
    ]
  })
  let batch: Theme[] = []
  const result = await stepThemes({
    themes: [pending, rename], pool: busyPool, items: [], runDiscovery: true, now: NOW,
    llmNamer: async (received) => { batch = received },
  })
  const newThemes = result.themes.filter((theme) => theme.theme_id !== pending.theme_id && theme.theme_id !== rename.theme_id)
  assert.ok(newThemes.length >= 8, 'the cycle really created at least eight fresh clusters')
  assert.equal(batch.length, 8, 'the engine enforces the provider batch cap itself')
  assert.deepEqual(batch.slice(0, 2).map((theme) => theme.theme_id), [rename.theme_id, pending.theme_id], 'rename and pending-validation debt cannot be starved by fresh discoveries')
  assert.equal(pending.needs_validation, true, 'an unprocessed/partial fake verdict remains fail-closed and queued')
  assert.equal(rename.needs_rename, true, 'an unprocessed/partial fake verdict remains fail-closed and queued')
})

await check('makeThemeNamer samples headlines STRATIFIED by company (breadth, not the newest wire burst)', async () => {
  const { makeThemeNamer } = await import('../src/news/themes/llm')
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thm-strat-'))
  // members oldest-first: Beta + Gamma first, then 8 newer Acme items — a newest-8 slice would show Acme only
  const members = [
    item('b1', 'Beta Corp pilots grid-scale storage rollout', { companies: [co('Beta Corp')] }),
    item('c1', 'Gamma Inc wins grid-scale storage mandate', { companies: [co('Gamma Inc')] }),
    ...Array.from({ length: 8 }, (_, i) => item(`a${i}`, `Acme grid-scale storage update number ${i} lands`, { companies: [co('Acme', 'ACME')] })),
  ]
  const theme = createTheme(members, NOW)
  let userMsg = ''
  const fetchFn = (async (_url: any, init: any) => {
    const body = JSON.parse(init.body)
    userMsg = body.messages[1].content
    return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: JSON.stringify({ themes: [{ i: 0, is_theme: true, name: 'Grid-Scale Storage Buildout', slug: 'grid-scale-storage', description: 'x', keywords: [] }] }) } }] }) }
  }) as unknown as typeof fetch
  const namer = makeThemeNamer({ themesDiscoverModel: 'groq', groqApiKey: 'k', groqBaseUrl: 'https://groq.test', groqModel: 'm' }, fetchFn, tmp)
  await namer!([theme], NOW)
  assert.ok(userMsg.includes('Beta Corp pilots') && userMsg.includes('Gamma Inc wins'), 'every distinct company reaches the sample')
  fs.rmSync(tmp, { recursive: true, force: true })
})

await check('coherenceOf: low on a polluted theme, 1.0 on a healthy one — and triggers the off-cadence heal', async () => {
  const healthy = createTheme(
    [
      item('n1', 'Nvidia ramps AI data center GPU shipments', { companies: [co('Nvidia', 'NVDA')] }),
      item('n2', 'Nvidia data center revenue jumps on AI demand', { companies: [co('Nvidia', 'NVDA')] }),
      item('n3', 'AMD chases Nvidia in the AI data center market', { companies: [co('AMD', 'AMD'), co('Nvidia', 'NVDA')] }),
    ],
    NOW,
  )
  assert.equal(coherenceOf(healthy), 1, 'every member anchors on the identity')
  const polluted = createTheme(
    [
      item('y1', 'Emirates NBD to buy controlling stake in Yes Bank', { companies: [co('Yes Bank', 'YESBANK'), co('Emirates NBD')] }),
      item('s1', 'Linc Ltd-$: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Niyati Sharma', { companies: [co('Linc Ltd')], source_tier: 'primary_filing' }),
      item('s2', 'NINtec Systems Ltd: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Niraj Gemawat', { companies: [co('NINtec Systems Ltd')], source_tier: 'primary_filing' }),
      item('s3', 'Transcorp International Ltd: The Exchange has received the disclosure under Regulation 29(2) of SEBI (Substantial Acquisition of Shares & Takeovers) Regulations, 2011 for Ashok Kumar Agarwal', { companies: [co('Transcorp International Ltd')], source_tier: 'primary_filing' }),
    ],
    NOW,
  )
  polluted.keywords = ['substantial', 'acquisition', 'takeovers']
  polluted.company_keys = ['yesbank']
  assert.ok(coherenceOf(polluted) < 0.5, `strangers share nothing with the identity, got ${coherenceOf(polluted)}`)
  // a NON-discovery cycle heals it immediately instead of waiting for the cadence
  const res = await stepThemes({ themes: [polluted], pool: [], items: [], runDiscovery: false, now: NOW })
  assert.equal(polluted.status, 'retired', 'the polluted theme (no real multi-company core) is healed away off-cadence')
  assert.ok(res.removed.some((r) => r.theme_id === polluted.theme_id && r.reason === 'retired'), 'the change is persisted + explicitly invalidated')
  // and the healthy theme is untouched by the same path
  const before = healthy.members.length
  await stepThemes({ themes: [healthy], pool: [], items: [], runDiscovery: false, now: NOW })
  assert.equal(healthy.status, 'live')
  assert.equal(healthy.members.length, before, 'no spurious off-cadence purge on a coherent theme')
})

console.log(`\n${passed} checks passed`)
