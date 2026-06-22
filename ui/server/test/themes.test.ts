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
import { clusterItems, discoverDeterministic, createTheme, mergeAndRetire, refreshThemeIdentity } from '../src/news/themes/discover'
import { topicTokens } from '../src/news/text-match'
import { stepThemes } from '../src/news/themes/engine'
import { buildSummary, buildThemesIndex, loadThemes, maybeCompactThemesLedger } from '../src/news/themes/store'
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
  return { event_id: id, headline, found_at: opts.found_at || hoursAgo(0), companies: opts.companies || [], event_types: opts.event_types || [], issuer_linkage: opts.issuer_linkage || 'primary', triage_score: opts.triage_score ?? 70, source_tier: opts.source_tier || 'news', scope: opts.scope, region: opts.region }
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
await check('assignThemes: items join themes by company OR ≥2 topic tokens; off-theme items are unclustered', () => {
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

// ---- merge + retire ----
await check('mergeAndRetire: two themes sharing companies merge; a parked, long-stale theme retires', () => {
  const t1 = createTheme([item('m1', 'Nvidia AI chip demand', { companies: [co('Nvidia', 'NVDA'), co('AMD', 'AMD')] }), item('m2', 'Nvidia AMD GPU race', { companies: [co('Nvidia', 'NVDA'), co('AMD', 'AMD')] }), item('m3', 'Nvidia AMD data center', { companies: [co('Nvidia'), co('AMD')] })], NOW)
  const t2 = createTheme([item('m4', 'AMD Nvidia accelerator war', { companies: [co('AMD', 'AMD'), co('Nvidia', 'NVDA')] }), item('m5', 'Nvidia AMD chips', { companies: [co('Nvidia'), co('AMD')] }), item('m6', 'AMD Nvidia GPU', { companies: [co('AMD'), co('Nvidia')] })], NOW)
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

// Regression (PR #71 Codex finding): a `social` (Reddit) item must NEVER independently drive a theme —
// a theme is a thesis precursor (CLAUDE.md §4/§24). The band/score caps keep social out of the top pick,
// but a non-drop social item still reaches the themes layer, which has no source-tier guard (score.ts
// counts an unrecognised tier at full news-level magnitude), so Reddit-only posts could form and rank a
// theme. Expected: a cluster of social-only items yields NO theme; the SAME cluster on a real source does.
await check('stepThemes: social-only items NEVER form a theme; the same cluster on a real source does (§4/§24)', async () => {
  const mk = (tier: string) => [
    item('z1', 'Acme mass layoffs hit 5000 staff', { companies: [co('Acme', 'ACME')], event_types: ['management'], triage_score: 88, source_tier: tier }),
    item('z2', 'Acme layoffs deepen as restructuring widens', { companies: [co('Acme', 'ACME')], event_types: ['operations'], triage_score: 84, source_tier: tier }),
    item('z3', 'Beta joins Acme in the mass layoffs wave', { companies: [co('Beta', 'BETA'), co('Acme', 'ACME')], event_types: ['management'], triage_score: 80, source_tier: tier }),
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
  assert.equal(real.generation, 'claude')
  assert.ok(real.keywords.includes('hyperscaler'))
  assert.equal(junk.status, 'retired') // is_theme:false → dropped
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
  const t1 = createTheme([item('g1', 'Nvidia AMD AI demand', { companies: [co('Nvidia', 'NVDA'), co('AMD', 'AMD')] }), item('g2', 'Nvidia AMD GPU race', { companies: [co('Nvidia', 'NVDA'), co('AMD', 'AMD')] }), shared], NOW)
  const t2 = createTheme([item('h1', 'AMD Nvidia accelerator war', { companies: [co('AMD', 'AMD'), co('Nvidia', 'NVDA')] }), item('h2', 'Nvidia AMD chips', { companies: [co('Nvidia'), co('AMD')] }), shared], NOW)
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
const themeLine = (id: string, rev: number) => JSON.stringify({ kind: 'theme', ts: hoursAgo(rev), theme: { theme_id: id, name: id, rev } })

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
  assert.equal((after.find((t) => t.theme_id === 'A') as any).rev, 3, 'last mutation per id wins')
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

console.log(`\n${passed} checks passed`)
