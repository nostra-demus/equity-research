// Dynamic themes engine (news/themes/*): deterministic scoring + decay, order tiering (4×25),
// assignment/bucketing, discovery clustering, merge/retire, and the end-to-end step. All in-memory,
// no network, no LLM. Run: npx tsx test/themes.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { scoreTheme } from '../src/news/themes/score'
import { companyImpact, orderTierFor } from '../src/news/themes/order'
import { assignThemes } from '../src/news/themes/assign'
import { clusterItems, discoverDeterministic, createTheme, mergeAndRetire } from '../src/news/themes/discover'
import { stepThemes } from '../src/news/themes/engine'
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

console.log(`\n${passed} checks passed`)
