// Non-investable formation diagnostics + durable compiler health. Run:
// npx tsx test/themes-formation.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createThemesIndexReader } from '../src/news/themes/api-index'
import { buildCommodityThemesIndex } from '../src/news/themes/commodity-index'
import { createTheme } from '../src/news/themes/discover'
import { normalizeThemeCompilerAttempt } from '../src/news/themes/formation'
import { buildGeoThemesIndex } from '../src/news/themes/geo-index'
import { appendThemeMutations, buildSummary, buildThemesIndex, loadThemes, readThemesIndex, writeThemesIndex } from '../src/news/themes/store'
import type { Theme, ThemeCompilerAttempt, ThemeItemView } from '../src/news/themes/types'
import { attachValidNarrative } from './themes-fixtures'

const NOW = new Date('2026-08-13T06:00:00Z')
const now = () => NOW
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 3_600_000).toISOString()
const company = { name: 'Grid Systems', ticker: 'GRID', listing_country: 'US' }

function item(id: string, suffix: string, opts: Partial<ThemeItemView> = {}): ThemeItemView {
  return {
    event_id: id,
    dedup_group: opts.dedup_group || `story-${id}`,
    headline: opts.headline || `Grid operators accelerate copper transmission capacity ${suffix}`,
    found_at: opts.found_at || hoursAgo(1),
    companies: opts.companies || [company],
    event_types: opts.event_types || ['capex'],
    issuer_linkage: opts.issuer_linkage || 'sector',
    triage_score: opts.triage_score ?? 82,
    source_tier: opts.source_tier || 'news',
    source_name: opts.source_name === undefined ? `Source ${id}` : opts.source_name,
    url: opts.url === undefined ? `https://example.test/${id}` : opts.url,
    country: opts.country,
    commodities: opts.commodities,
  }
}

function cluster(prefix: string, opts: Partial<ThemeItemView> = {}): Theme {
  return createTheme([
    item(`${prefix}-1`, 'expansion', opts),
    item(`${prefix}-2`, 'investment', opts),
    item(`${prefix}-3`, 'buildout', opts),
  ], NOW, 'deterministic')
}

let passed = 0
function check(name: string, fn: () => void): void {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

check('a sourced current cluster appears only in the explicit non-investable formation queue', () => {
  const theme = cluster('safe')
  const index = buildThemesIndex([theme], now)
  assert.deepEqual(index.themes, [], 'strict thesis index remains unchanged')
  assert.equal(index.formation_queue.total, 1)
  const candidate = index.formation_queue.candidates[0]
  assert.equal(candidate.investable, false)
  assert.equal(candidate.state, 'awaiting_validation')
  assert.equal(candidate.evidence.length, 3)
  assert.ok(candidate.evidence.every((row) => row.source_name && /^https:\/\//.test(row.url || '')))
  assert.equal('narrative' in candidate, false)
  assert.equal('qualified_expressions' in candidate, false)
  assert.equal('conviction' in candidate, false)
  assert.equal(index.compiler_health.queue.awaiting_validation, 1)
})

check('unsafe rows stay hidden while all durable compiler debt remains visible in health', () => {
  const stale = cluster('stale', { found_at: hoursAgo(80) })
  const missingSource = cluster('anonymous', { source_name: '', url: '' })
  const routine = cluster('routine', { headline: 'Company board meeting intimation for quarterly results' })
  const index = buildThemesIndex([stale, missingSource, routine], now)
  assert.equal(index.formation_queue.total, 0)
  assert.equal(index.compiler_health.queue.awaiting_validation, 3)
  assert.equal(index.compiler_health.queue.total, 3)
  assert.equal(index.compiler_health.state, 'ready')
})

check('hostless URL-shaped provenance fails closed in formation output and after ledger reload', () => {
  for (const url of ['https://', 'http://', 'mailto:analyst@example.test']) {
    const unsafe = cluster(`hostless-${url.length}`, { url })
    const direct = buildThemesIndex([unsafe], now)
    assert.equal(direct.formation_queue.total, 0, `${url} is not an exact source locator`)
    assert.equal(direct.compiler_health.queue.awaiting_validation, 1, 'unsafe disclosure never erases durable debt')

    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-hostless-url-'))
    try {
      appendThemeMutations(root, [unsafe], now)
      const loaded = loadThemes(root)[0]
      assert.ok(loaded.members.every((member) => member.url === undefined), 'normalization strips invalid locators')
      assert.equal(buildThemesIndex([loaded], now).formation_queue.total, 0)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  }
})

check('formation queue is bounded and reports the hidden remainder', () => {
  const themes = Array.from({ length: 11 }, (_, i) => cluster(`cap${i}`))
  const queue = buildThemesIndex(themes, now).formation_queue
  assert.equal(queue.total, 11)
  assert.equal(queue.shown, 8)
  assert.equal(queue.hidden, 3)
  assert.equal(queue.candidates.length, 8)
})

check('formation diagnostics order current exact evidence ahead of older compiler debt', () => {
  const older = cluster('older', { found_at: hoursAgo(12) })
  const newest = cluster('newest', { found_at: hoursAgo(1) })
  const queue = buildThemesIndex([older, newest], now).formation_queue
  assert.deepEqual(queue.candidates.map((candidate) => candidate.theme_id), [newest.theme_id, older.theme_id])
})

check('geo formation evidence and debt are recomputed from only the requested country', () => {
  const mixed = createTheme([
    item('geo-us-1', 'expansion', { country: 'US' }),
    item('geo-us-2', 'investment', { country: 'US' }),
    item('geo-in-1', 'India expansion', { country: 'IN' }),
    item('geo-in-2', 'India investment', { country: 'IN' }),
  ], NOW, 'deterministic')
  const india = buildGeoThemesIndex([mixed], { country: 'IN' }, now)
  assert.equal(india.formation_queue.total, 1)
  assert.deepEqual(india.formation_queue.candidates[0].evidence.map((row) => row.event_id).sort(), ['geo-in-1', 'geo-in-2'])
  assert.equal(india.compiler_health.queue.total, 1)
  const absent = buildGeoThemesIndex([mixed], { country: 'HK' }, now)
  assert.equal(absent.formation_queue.total, 0)
  assert.equal(absent.compiler_health.queue.total, 0)
})

check('geo health does not leak narrative-update debt whose pending row is outside the slice', () => {
  const theme = createTheme([
    item('pending-us', 'US correction', { country: 'US' }),
    item('support-us', 'US expansion', { country: 'US' }),
    item('support-in-1', 'India expansion', { country: 'IN' }),
    item('support-in-2', 'India investment', { country: 'IN' }),
  ], NOW, 'claude')
  theme.name = 'Copper Grid Capacity Buildout'
  theme.description = 'Grid operators are accelerating transmission capacity as copper constraints tighten.'
  attachValidNarrative(theme)
  theme.needs_narrative_update = true
  theme.pending_narrative_event_ids = ['pending-us']
  theme.validation_queued_at = hoursAgo(2)
  const us = buildGeoThemesIndex([theme], { country: 'US' }, now)
  assert.equal(us.formation_queue.awaiting_revalidation, 1)
  assert.equal(us.compiler_health.queue.awaiting_revalidation, 1)
  const india = buildGeoThemesIndex([theme], { country: 'IN' }, now)
  assert.equal(india.formation_queue.awaiting_revalidation, 0)
  assert.equal(india.compiler_health.queue.awaiting_revalidation, 0)
})

check('revalidation diagnostics pin exact pending observations as unclassified and preserve geo scope', () => {
  const theme = createTheme([
    item('pending-visible-us', 'US correction', { country: 'US', found_at: hoursAgo(0.25) }),
    item('support-visible-us', 'US expansion', { country: 'US', found_at: hoursAgo(2) }),
    item('support-visible-in', 'India investment', { country: 'IN', found_at: hoursAgo(3) }),
    item('support-visible-us-2', 'US buildout', { country: 'US', found_at: hoursAgo(4) }),
  ], NOW, 'claude')
  attachValidNarrative(theme, { support_event_ids: ['support-visible-us', 'support-visible-in', 'support-visible-us-2'] })
  theme.name = 'Copper Grid Capacity Buildout'
  theme.description = 'Grid operators are accelerating transmission capacity as copper constraints tighten.'
  theme.needs_narrative_update = true
  theme.pending_narrative_event_ids = ['pending-visible-us']
  theme.validation_queued_at = hoursAgo(1)

  const global = buildThemesIndex([theme], now)
  assert.equal(global.themes.length, 1, 'strict themes[] keeps its existing forming contract unchanged')
  assert.equal(global.themes[0].assessment.status, 'forming')
  assert.equal(global.formation_queue.awaiting_revalidation, 1)
  assert.equal(global.formation_queue.candidates[0].evidence[0].event_id, 'pending-visible-us')
  assert.equal(global.formation_queue.candidates[0].evidence[0].stance, 'unclassified')
  assert.ok(global.formation_queue.candidates[0].evidence.slice(1).every((row) => row.stance !== 'unclassified'))

  const us = buildGeoThemesIndex([theme], { country: 'US' }, now)
  assert.equal(us.formation_queue.candidates[0].evidence[0].event_id, 'pending-visible-us')
  assert.equal(us.formation_queue.candidates[0].evidence[0].stance, 'unclassified')
  assert.ok(us.formation_queue.candidates[0].evidence.every((row) => !row.event_id.endsWith('-in')))
  const india = buildGeoThemesIndex([theme], { country: 'IN' }, now)
  assert.equal(india.formation_queue.total, 0, 'an out-of-slice pending observation cannot leak debt or evidence')
  assert.equal(india.compiler_health.queue.total, 0)
})

check('commodity formation evidence and debt are recomputed from only the requested subject', () => {
  const mixed = createTheme([
    item('cmd-gold-1', 'expansion', { commodities: ['GOLD'] }),
    item('cmd-gold-2', 'investment', { commodities: ['GOLD'] }),
    item('cmd-sugar-1', 'expansion', { commodities: ['SUGAR'] }),
    item('cmd-sugar-2', 'investment', { commodities: ['SUGAR'] }),
  ], NOW, 'deterministic')
  const gold = buildCommodityThemesIndex([mixed], { commodity: 'GOLD' }, now)
  assert.equal(gold.formation_queue.total, 1)
  assert.deepEqual(gold.formation_queue.candidates[0].evidence.map((row) => row.event_id).sort(), ['cmd-gold-1', 'cmd-gold-2'])
  assert.equal(gold.compiler_health.queue.total, 1)
  assert.equal(buildCommodityThemesIndex([mixed], { commodity: 'COCOA' }, now).compiler_health.queue.total, 0)
})

check('commodity revalidation exposes only in-slice pending observations as unclassified', () => {
  const theme = createTheme([
    item('pending-gold', 'gold correction', { commodities: ['GOLD'], found_at: hoursAgo(0.5) }),
    item('support-gold', 'gold expansion', { commodities: ['GOLD'], found_at: hoursAgo(2) }),
    item('support-copper', 'copper investment', { commodities: ['COPPER'], found_at: hoursAgo(3) }),
    item('support-gold-2', 'gold buildout', { commodities: ['GOLD'], found_at: hoursAgo(4) }),
  ], NOW, 'claude')
  attachValidNarrative(theme, { support_event_ids: ['support-gold', 'support-copper', 'support-gold-2'] })
  theme.name = 'Metals Grid Capacity Buildout'
  theme.description = 'Grid operators are accelerating metals-linked transmission capacity.'
  theme.needs_narrative_update = true
  theme.pending_narrative_event_ids = ['pending-gold']
  theme.validation_queued_at = hoursAgo(1)
  const gold = buildCommodityThemesIndex([theme], { commodity: 'GOLD' }, now)
  assert.equal(gold.formation_queue.awaiting_revalidation, 1)
  assert.equal(gold.formation_queue.candidates[0].evidence[0].event_id, 'pending-gold')
  assert.equal(gold.formation_queue.candidates[0].evidence[0].stance, 'unclassified')
  assert.ok(gold.formation_queue.candidates[0].evidence.every((row) => row.event_id !== 'support-copper'))
  assert.equal(buildCommodityThemesIndex([theme], { commodity: 'COPPER' }, now).compiler_health.queue.total, 0)
})

check('legacy model-named rows without narrative or queue flags become migration debt after reload', () => {
  for (const generation of ['claude', 'groq'] as const) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), `themes-legacy-${generation}-`))
    try {
      const legacy = cluster(`legacy-${generation}`)
      legacy.generation = generation
      legacy.name = `${generation} legacy grid buildout`
      legacy.description = 'A pre-contract model label that still requires evidence-bound migration.'
      delete legacy.narrative
      delete legacy.needs_validation
      delete legacy.needs_rename
      delete legacy.pending_narrative_event_ids
      const direct = buildThemesIndex([legacy], now)
      assert.equal(direct.formation_queue.awaiting_validation, 1, 'even a pre-normalization row discloses migration debt')
      assert.equal(direct.compiler_health.queue.awaiting_validation, 1)
      appendThemeMutations(root, [legacy], now)

      const loaded = loadThemes(root)[0]
      assert.equal(loaded.generation, generation)
      assert.equal(loaded.needs_rename, true)
      assert.deepEqual(loaded.pending_narrative_event_ids, loaded.members.map((member) => member.event_id))
      const index = buildThemesIndex([loaded], now)
      assert.deepEqual(index.themes, [], 'legacy prose never enters strict themes[]')
      assert.equal(index.formation_queue.awaiting_validation, 1)
      assert.equal(index.formation_queue.candidates[0].state, 'awaiting_validation')
      assert.equal(index.compiler_health.queue.awaiting_validation, 1)

      const us = buildGeoThemesIndex([loaded], { country: 'US' }, now)
      assert.equal(us.formation_queue.awaiting_validation, 0, 'a slice with no exact scoped members stays empty')
      assert.equal(us.compiler_health.queue.total, 0)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  }
})

check('legacy model migration evidence and health remain exact in geo and commodity slices', () => {
  const legacy = createTheme([
    item('legacy-scope-us-gold-1', 'US gold expansion', { country: 'US', commodities: ['GOLD'] }),
    item('legacy-scope-us-gold-2', 'US gold investment', { country: 'US', commodities: ['GOLD'] }),
    item('legacy-scope-in-copper-1', 'India copper expansion', { country: 'IN', commodities: ['COPPER'] }),
    item('legacy-scope-in-copper-2', 'India copper investment', { country: 'IN', commodities: ['COPPER'] }),
  ], NOW, 'claude')
  legacy.name = 'Legacy Metals Grid Buildout'
  legacy.description = 'A pre-contract model label awaiting evidence-bound migration.'
  delete legacy.narrative
  delete legacy.needs_validation
  delete legacy.needs_rename
  delete legacy.pending_narrative_event_ids

  const us = buildGeoThemesIndex([legacy], { country: 'US' }, now)
  assert.equal(us.compiler_health.queue.awaiting_validation, 1)
  assert.deepEqual(us.formation_queue.candidates[0].evidence.map((row) => row.event_id).sort(), [
    'legacy-scope-us-gold-1', 'legacy-scope-us-gold-2',
  ])
  const copper = buildCommodityThemesIndex([legacy], { commodity: 'COPPER' }, now)
  assert.equal(copper.compiler_health.queue.awaiting_validation, 1)
  assert.deepEqual(copper.formation_queue.candidates[0].evidence.map((row) => row.event_id).sort(), [
    'legacy-scope-in-copper-1', 'legacy-scope-in-copper-2',
  ])
  assert.equal(buildGeoThemesIndex([legacy], { country: 'HK' }, now).compiler_health.queue.total, 0)
  assert.equal(buildCommodityThemesIndex([legacy], { commodity: 'SUGAR' }, now).compiler_health.queue.total, 0)
})

check('a blocked compiler result persists across maintenance-only index writes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-formation-health-'))
  try {
    const theme = cluster('blocked')
    const attempt: ThemeCompilerAttempt = {
      attempted_at: hoursAgo(1), state: 'blocked', provider: 'claude', blocker: 'daily_cap',
      message: 'Daily compiler capacity is exhausted.', requested_count: 1, attempted_count: 0,
      validated_count: 0, rejected_count: 0, malformed_count: 0, omitted_count: 0,
    }
    writeThemesIndex(root, [theme], now, attempt)
    writeThemesIndex(root, [theme], now) // maintenance-only projection must not erase the blocker
    const stored = readThemesIndex(root)
    assert.equal(stored.compiler_health.state, 'blocked')
    assert.equal(stored.compiler_health.blocker, 'daily_cap')
    assert.equal(stored.compiler_health.last_attempt?.attempted_at, hoursAgo(1).replace('.000Z', 'Z'))
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

check('malformed compiler attempts fail closed instead of being coerced into healthy observations', () => {
  const valid: ThemeCompilerAttempt = {
    attempted_at: hoursAgo(1), state: 'blocked', provider: 'groq', blocker: 'daily_cap',
    message: 'Groq has no daily compiler capacity.', requested_count: 1, attempted_count: 0,
    validated_count: 0, rejected_count: 0, malformed_count: 0, omitted_count: 0,
  }
  assert.deepEqual(normalizeThemeCompilerAttempt(valid), {
    ...valid, attempted_at: hoursAgo(1).replace('.000Z', 'Z'),
  })
  for (const malformed of [
    { ...valid, blocker: 'corrupt' },
    { ...valid, requested_count: '1' },
    { ...valid, attempted_count: -1 },
    { ...valid, state: 'blocked', blocker: null },
    { ...valid, state: 'succeeded', blocker: null, validated_count: 1 },
    { ...valid, state: 'succeeded', blocker: 'daily_cap', attempted_count: 1, validated_count: 1 },
    { ...valid, state: 'failed', blocker: 'invalid_response', attempted_count: 0, malformed_count: 1 },
  ]) assert.equal(normalizeThemeCompilerAttempt(malformed), null)
})

check('API reprojection carries durable compiler health and scopes formation evidence', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-formation-api-'))
  try {
    const theme = cluster('api', { country: 'US', commodities: ['GOLD'] })
    const attempt: ThemeCompilerAttempt = {
      attempted_at: hoursAgo(1), state: 'blocked', provider: 'groq', blocker: 'cooldown',
      message: 'Compiler provider is cooling down.', requested_count: 1, attempted_count: 0,
      validated_count: 0, rejected_count: 0, malformed_count: 0, omitted_count: 0,
    }
    appendThemeMutations(root, [theme], now)
    writeThemesIndex(root, [theme], now, attempt)
    const read = createThemesIndexReader(root, { now, ttlMs: 60_000 })
    for (const index of [read(), read({ country: 'US' }), read({}, { scoped: true, subject: 'GOLD' })]) {
      assert.equal(index.themes.length, 0)
      assert.equal(index.formation_queue.total, 1)
      assert.equal(index.compiler_health.state, 'blocked')
      assert.equal(index.compiler_health.blocker, 'cooldown')
      assert.equal(index.generated_at, NOW.toISOString().replace('.000Z', 'Z'))
      assert.equal(index.projected_at, NOW.toISOString().replace('.000Z', 'Z'))
    }
    assert.equal(read({ country: 'IN' }).formation_queue.total, 0)
    assert.equal(read({ country: 'IN' }).compiler_health.queue.total, 0)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

check('ledger-backed compiler health survives a failed board-index write', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-formation-index-fail-'))
  try {
    const theme = cluster('durable-health')
    const attempt: ThemeCompilerAttempt = {
      attempted_at: hoursAgo(1), state: 'blocked', provider: 'groq', blocker: 'daily_cap',
      message: 'Groq has no daily compiler capacity.', requested_count: 1, attempted_count: 0,
      validated_count: 0, rejected_count: 0, malformed_count: 0, omitted_count: 0,
    }
    assert.equal(appendThemeMutations(root, [theme], now, attempt), true)
    fs.mkdirSync(path.join(root, 'screener', 'board', 'themes_index.json'), { recursive: true })
    writeThemesIndex(root, [theme], now, attempt) // rename onto a directory fails and is swallowed
    const index = createThemesIndexReader(root, { now, ttlMs: 0 })()
    assert.equal(index.generated_at, NOW.toISOString().replace('.000Z', 'Z'))
    assert.equal(index.compiler_health.state, 'blocked')
    assert.equal(index.compiler_health.provider, 'groq')
    assert.equal(index.compiler_health.blocker, 'daily_cap')
    assert.equal(index.compiler_health.last_attempt?.attempted_at, hoursAgo(1).replace('.000Z', 'Z'))
    assert.equal(index.compiler_health.queue.awaiting_validation, 1)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

check('a malformed persisted formation queue fails closed without dropping validated theme summaries', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-formation-untrusted-'))
  try {
    fs.mkdirSync(path.join(root, 'screener', 'board'), { recursive: true })
    fs.writeFileSync(path.join(root, 'screener', 'board', 'themes_index.json'), JSON.stringify({
      generated_at: NOW.toISOString(), themes: [{ theme_id: 'THM-safe0001' }],
      formation_queue: {
        total: 1, shown: 1, hidden: 0, awaiting_validation: 1, awaiting_revalidation: 0,
        blocked_incomplete_audit: 0, building_evidence: 0,
        candidates: [{ theme_id: 'THM-evil0001', provisional_label: 'Buy this', investable: true, evidence: [] }],
      },
      counts: { hot: 0, active: 0, cooling: 0, parked: 0, retired: 0, total: 1 }, history_days: 0,
    }))
    const stored = readThemesIndex(root)
    assert.deepEqual(stored.themes.map((row) => row.theme_id), ['THM-safe0001'])
    assert.equal(stored.formation_queue.total, 0)
    assert.deepEqual(stored.formation_queue.candidates, [])
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

check('persisted formation timestamps and counts are strict trust-boundary fields', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-formation-counts-'))
  try {
    const theme = cluster('strict')
    writeThemesIndex(root, [theme], now)
    const file = path.join(root, 'screener', 'board', 'themes_index.json')
    const malformedTime = JSON.parse(fs.readFileSync(file, 'utf8'))
    malformedTime.formation_queue.candidates[0].queued_at = 'not-a-date'
    fs.writeFileSync(file, JSON.stringify(malformedTime))
    assert.equal(readThemesIndex(root).formation_queue.total, 0)

    writeThemesIndex(root, [theme], now)
    const malformedCount = JSON.parse(fs.readFileSync(file, 'utf8'))
    malformedCount.formation_queue.awaiting_validation = 1.5
    fs.writeFileSync(file, JSON.stringify(malformedCount))
    assert.equal(readThemesIndex(root).formation_queue.total, 0)

    writeThemesIndex(root, [theme], now)
    const malformedUrl = JSON.parse(fs.readFileSync(file, 'utf8'))
    malformedUrl.formation_queue.candidates[0].evidence[0].url = 'https://'
    fs.writeFileSync(file, JSON.stringify(malformedUrl))
    assert.equal(readThemesIndex(root).formation_queue.total, 0, 'hostless persisted evidence fails closed')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

check('generic LLM provenance qualifies only with an exact validator provider and survives reload', () => {
  const validated = cluster('provider')
  attachValidNarrative(validated)
  validated.generation = 'llm'
  validated.validator_provider = 'overflow-compiler-v1'
  validated.name = 'Copper Grid Capacity Buildout'
  validated.description = 'Grid operators are accelerating transmission capacity as copper constraints tighten.'
  delete validated.needs_validation
  delete validated.pending_narrative_event_ids
  assert.notEqual(buildSummary(validated, NOW).assessment.status, 'context')
  const missingProvider = { ...validated, validator_provider: undefined }
  assert.equal(buildSummary(missingProvider, NOW).assessment.status, 'context')

  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'themes-provider-'))
  try {
    appendThemeMutations(root, [validated], now)
    const loaded = loadThemes(root)[0]
    assert.equal(loaded.generation, 'llm')
    assert.equal(loaded.validator_provider, 'overflow-compiler-v1')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

console.log(`\nthemes-formation.test.ts: ${passed} checks passed`)
