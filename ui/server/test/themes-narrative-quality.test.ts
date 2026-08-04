// Theme candidate quality: an issuer name is not a narrative, and publisher copies are one story.
// Run: npx tsx test/themes-narrative-quality.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { assignThemes } from '../src/news/themes/assign'
import { clusterItems, createTheme, discoverDeterministic } from '../src/news/themes/discover'
import { scoreTheme } from '../src/news/themes/score'
import { themeNarrativeTokens } from '../src/news/text-match'
import type { ThemeItemView } from '../src/news/themes/types'
import { attachValidNarrative } from './themes-fixtures'

const NOW = new Date('2026-08-04T06:00:00Z')
const co = (name: string, ticker: string | null = null) => ({ name, ticker, listing_country: 'US' })
const item = (event_id: string, headline: string, extra: Partial<ThemeItemView> = {}): ThemeItemView => ({
  event_id,
  headline,
  found_at: NOW.toISOString(),
  companies: extra.companies || [],
  event_types: extra.event_types || ['operations'],
  issuer_linkage: extra.issuer_linkage || 'primary',
  triage_score: extra.triage_score ?? 80,
  source_tier: extra.source_tier || 'news',
  dedup_group: extra.dedup_group,
})

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

check('narrative tokens remove the issuer name and routine paperwork contributes no narrative', () => {
  const company = [co('Wells Fargo', 'WFC')]
  const narrative = themeNarrativeTokens('Wells Fargo expands mortgage lending program', company, 'news')
  assert.ok(narrative.has('mortgage') && narrative.has('lending'))
  assert.ok(!narrative.has('wells') && !narrative.has('fargo') && !narrative.has('wellsfargo') && !narrative.has('wfc'))
  const filing = themeNarrativeTokens('Wells Fargo board meeting intimation', company, 'primary_filing')
  assert.equal(filing.size, 0)
})

check('shared company alone does not connect unrelated stories', () => {
  const company = [co('Nvidia', 'NVDA')]
  const clusters = clusterItems([
    item('a', 'Nvidia raises its quarterly dividend', { companies: company, event_types: ['capital_actions'] }),
    item('b', 'Nvidia leases a new office in Paris', { companies: company, event_types: ['operations'] }),
    item('c', 'Nvidia faces an employee lawsuit', { companies: company, event_types: ['legal'] }),
  ])
  assert.deepEqual(clusters.map((c) => c.length), [1, 1, 1])
})

check('a same-company follow-up still joins when the narrative itself recurs', () => {
  const theme = createTheme([
    item('s1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')] }),
    item('s2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')] }),
    item('s3', 'Microsoft expands AI data center power capacity', { companies: [co('Microsoft', 'MSFT')] }),
  ], NOW, 'groq')
  attachValidNarrative(theme)
  const unrelated = assignThemes([
    item('u1', 'Nvidia raises its quarterly dividend', { companies: [co('Nvidia', 'NVDA')], event_types: ['capital_actions'] }),
  ], [theme], undefined, NOW)
  assert.equal(unrelated.assignments.size, 0)
  const related = assignThemes([
    item('r1', 'Nvidia adds AI data center capacity', { companies: [co('Nvidia', 'NVDA')] }),
  ], [theme], undefined, NOW)
  assert.deepEqual(related.assignments.get('r1'), [theme.theme_id])
})

check('publisher copies count once in discovery and assignment', () => {
  const raw = [
    item('d1', 'Nvidia and Vertiv expand AI data center power capacity', { companies: [co('Nvidia', 'NVDA'), co('Vertiv', 'VRT')], dedup_group: 'story-1' }),
    item('d2', 'Nvidia and Vertiv expand AI data center power capacity', { companies: [co('Nvidia', 'NVDA'), co('Vertiv', 'VRT')], dedup_group: 'story-1' }),
    item('d3', 'Microsoft expands AI data center power capacity', { companies: [co('Microsoft', 'MSFT')], dedup_group: 'story-2' }),
  ]
  assert.equal(discoverDeterministic(raw, [], NOW).created.length, 0, 'two underlying stories do not clear the three-story theme bar')

  const theme = createTheme([
    item('s1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')] }),
    item('s2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')] }),
    item('s3', 'Microsoft expands AI data center power capacity', { companies: [co('Microsoft', 'MSFT')] }),
  ], NOW, 'groq')
  attachValidNarrative(theme)
  const before = theme.member_count_total
  const first = assignThemes([raw[0]], [theme], undefined, NOW)
  assert.equal(first.assignments.get('d1')?.length, 1)
  const second = assignThemes([raw[1]], [theme], undefined, NOW)
  assert.equal(second.assignments.get('d2')?.length, 1)
  assert.equal(theme.member_count_total, before + 1, 'the second publisher copy does not inflate the theme')
})

check('publisher copies count once in heat, persistence, and hourly flow', () => {
  const single = createTheme([
    item('e1', 'Nvidia and Vertiv expand AI data center power capacity', { companies: [co('Nvidia', 'NVDA'), co('Vertiv', 'VRT')], dedup_group: 'story-1' }),
  ], NOW, 'groq')
  const duplicated = createTheme([
    item('e1', 'Nvidia and Vertiv expand AI data center power capacity', { companies: [co('Nvidia', 'NVDA'), co('Vertiv', 'VRT')], dedup_group: 'story-1' }),
  ], NOW, 'groq')
  duplicated.members.push({ ...duplicated.members[0], event_id: 'e2' }) // simulate a legacy pre-dedup ledger row
  const a = scoreTheme(single, NOW)
  const b = scoreTheme(duplicated, NOW)
  assert.deepEqual(b, a)
  assert.equal(b.flow_series.reduce((sum, n) => sum + n, 0), 1)
})

check('a contractless legacy cluster cannot absorb even an exact lexical follow-up', () => {
  const legacy = createTheme([
    item('legacy-1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')] }),
    item('legacy-2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')] }),
    item('legacy-3', 'Microsoft expands AI data center power capacity', { companies: [co('Microsoft', 'MSFT')] }),
  ], NOW, 'deterministic')
  const before = legacy.members.length
  const followUp = item('legacy-4', 'Arista expands AI data center network capacity', { companies: [co('Arista Networks', 'ANET')] })
  const result = assignThemes([followUp], [legacy], undefined, NOW)
  assert.equal(result.assignments.size, 0)
  assert.equal(result.touched.size, 0)
  assert.equal(legacy.members.length, before)
  assert.deepEqual(result.unclustered.map((row) => row.event_id), ['legacy-4'])
})

check('a SpaceX-to-AI bridge cannot fuse Rocket Lab, Perpetual, Meta, Anthropic and AI cores', () => {
  const rows = [
    item('rocket-1', 'Rocket Lab increases orbital launch cadence', { companies: [co('Rocket Lab', 'RKLB')] }),
    item('spacex-1', 'SpaceX raises orbital launch cadence', { companies: [co('SpaceX')] }),
    item('perpetual-1', 'Perpetual shares soar as asset manager valuation jumps', { companies: [co('Perpetual', 'PPT.AX')] }),
    item('perpetual-2', 'Perpetual stock soars as asset manager valuation rises', { companies: [co('Perpetual', 'PPT.AX')] }),
    item('perpetual-3', 'Perpetual soars again as asset manager valuation expands', { companies: [co('Perpetual', 'PPT.AX')] }),
    item('bridge', 'SpaceX links orbital launch cadence to an AI data center plan', { companies: [co('SpaceX')] }),
    item('meta-1', 'Meta faces youth addiction lawsuit in California', { companies: [co('Meta Platforms', 'META')] }),
    item('meta-2', 'Meta hit by youth addiction lawsuit in New Mexico', { companies: [co('Meta Platforms', 'META')] }),
    item('anthropic-hack', 'Anthropic reports hackers abused Claude in cyber attacks', { companies: [co('Anthropic')] }),
    item('anthropic-finance', 'Anthropic raises a financing round at a higher valuation', { companies: [co('Anthropic')] }),
    item('ai-1', 'Nvidia expands AI data center chip capacity', { companies: [co('Nvidia', 'NVDA')] }),
    item('ai-2', 'Vertiv expands AI data center cooling capacity', { companies: [co('Vertiv', 'VRT')] }),
    item('ai-3', 'Microsoft expands AI data center power capacity', { companies: [co('Microsoft', 'MSFT')] }),
  ]
  const groups = clusterItems(rows).map((indexes) => indexes.map((index) => rows[index].event_id).sort())
  const groupOf = (eventId: string) => groups.find((group) => group.includes(eventId)) || []

  assert.deepEqual(groupOf('rocket-1'), ['rocket-1', 'spacex-1'])
  assert.deepEqual(groupOf('perpetual-1'), ['perpetual-1', 'perpetual-2', 'perpetual-3'])
  assert.deepEqual(groupOf('meta-1'), ['meta-1', 'meta-2'])
  assert.deepEqual(groupOf('anthropic-hack'), ['anthropic-hack'])
  assert.deepEqual(groupOf('anthropic-finance'), ['anthropic-finance'])
  assert.deepEqual(groupOf('bridge'), ['ai-1', 'ai-2', 'ai-3', 'bridge'])
  assert.ok(!groupOf('bridge').includes('rocket-1'), 'one bridge row cannot transitively fuse two dense cores')
})

console.log(`\nthemes-narrative-quality: ${passed} checks passed`)
