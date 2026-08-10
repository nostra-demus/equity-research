// Pure-matcher tests for the Data Library filters. Run: npx tsx src/components/datalibrary/dlFilters.test.ts
// Fixture ids are NEUTRAL (no real swarm/connector names — the datalibrary-purity guard scans this tree).
import assert from 'node:assert/strict'
import type { PipelineEntry, RecommendedNeed } from '../../lib/types'
import { dlFiltersActive, emptyDlFilters, matchesDlPipeline, matchesDlRecommended } from './DataLibraryFilters'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const mkPipeline = (over: Partial<PipelineEntry> = {}): PipelineEntry => ({
  id: 'acme-panel', series: 'Acme weekly panel', provider: 'Acme', acquisition: 'official_api',
  sourceType: 'paid_api', tier: 5, hostAllowlist: ['x.test'], cadence: 'weekly', releaseWindowDays: 10,
  entry: 'fetch.py', verify: 'fetch.py --verify', outputPath: 'data/<SUBJECT>/external/acme/a_<as_of>.json',
  subjects: ['AAA', 'BBB'], satisfies: [], helps: [],
  statuses: [
    { subject: 'AAA', status: 'fresh', health: 'ok', failStreak: 0 },
    { subject: 'BBB', status: 'stale', health: 'ok', failStreak: 0 },
  ],
  verdict: 'attention', verdictNote: 'BBB is past its freshness window', repair: { status: 'none', prUrl: null },
  ...over,
})
const mkRecommended = (over: Partial<RecommendedNeed> = {}): RecommendedNeed => ({
  key: 'alpha/AAA/some-need', swarm: 'alpha', subject: 'AAA', need_id: 'some-need',
  series: 'A missing series', why_it_caps: 'caps the read',
  suggested_source: { name: 'Big Provider', acquisition: 'official_api' },
  tier: 5, cadence: 'daily', entry_modules: ['moda'],
  ...over,
})

check('empty filters match both kinds and read inactive', () => {
  const f = emptyDlFilters()
  assert.equal(dlFiltersActive(f), false)
  assert.equal(matchesDlPipeline(mkPipeline(), f), true)
  assert.equal(matchesDlRecommended(mkRecommended(), f), true)
})

check('dlFiltersActive flips per axis', () => {
  for (const patch of [{ kind: 'wired' }, { verdict: 'live' }, { subject: 'AAA' }, { status: 'fresh' }, { cadence: 'weekly' }, { tier: '5' }, { text: 'x' }]) {
    assert.equal(dlFiltersActive({ ...emptyDlFilters(), ...patch }), true, JSON.stringify(patch))
  }
  assert.equal(dlFiltersActive({ ...emptyDlFilters(), text: '   ' }), false, 'whitespace text is inactive')
})

check("verdict: 'live' keeps only live feeds; 'problem' keeps attention AND broken", () => {
  const live = mkPipeline({ verdict: 'live' })
  const attention = mkPipeline({ verdict: 'attention' })
  const broken = mkPipeline({ verdict: 'broken' })
  const unknown = mkPipeline({ verdict: 'unknown' })
  assert.equal(matchesDlPipeline(live, { ...emptyDlFilters(), verdict: 'live' }), true)
  assert.equal(matchesDlPipeline(attention, { ...emptyDlFilters(), verdict: 'live' }), false)
  assert.equal(matchesDlPipeline(attention, { ...emptyDlFilters(), verdict: 'problem' }), true)
  assert.equal(matchesDlPipeline(broken, { ...emptyDlFilters(), verdict: 'problem' }), true)
  assert.equal(matchesDlPipeline(live, { ...emptyDlFilters(), verdict: 'problem' }), false)
  assert.equal(matchesDlPipeline(unknown, { ...emptyDlFilters(), verdict: 'problem' }), false, 'an unreadable pool is not a broken feed')
})

check('a set verdict filter always excludes recommended (an unwired need has no feed health)', () => {
  assert.equal(matchesDlRecommended(mkRecommended(), { ...emptyDlFilters(), verdict: 'live' }), false)
  assert.equal(matchesDlRecommended(mkRecommended(), { ...emptyDlFilters(), verdict: 'problem' }), false)
})

check('a server-recommended row stays visible even with stale built_by; connector_exists also stays open', () => {
  const f = emptyDlFilters()
  assert.equal(matchesDlRecommended(mkRecommended({ built_by: 'fixture-live-feed', connector_exists: 'fixture-live-feed' }), f), true)
  assert.equal(matchesDlRecommended(mkRecommended({ connector_exists: 'fixture-unhealthy-feed' }), f), true)
})

check("kind: 'wired' excludes recommended, 'recommended' excludes wired, '' passes both", () => {
  assert.equal(matchesDlPipeline(mkPipeline(), { ...emptyDlFilters(), kind: 'recommended' }), false)
  assert.equal(matchesDlRecommended(mkRecommended(), { ...emptyDlFilters(), kind: 'wired' }), false)
  assert.equal(matchesDlPipeline(mkPipeline(), { ...emptyDlFilters(), kind: 'wired' }), true)
  assert.equal(matchesDlRecommended(mkRecommended(), { ...emptyDlFilters(), kind: 'recommended' }), true)
})

check('subject: membership on wired (multi-subject), exact on recommended', () => {
  assert.equal(matchesDlPipeline(mkPipeline(), { ...emptyDlFilters(), subject: 'BBB' }), true)
  assert.equal(matchesDlPipeline(mkPipeline(), { ...emptyDlFilters(), subject: 'CCC' }), false)
  assert.equal(matchesDlRecommended(mkRecommended(), { ...emptyDlFilters(), subject: 'AAA' }), true)
  assert.equal(matchesDlRecommended(mkRecommended(), { ...emptyDlFilters(), subject: 'BBB' }), false)
})

check('status: any-subject match on wired; a set status filter always excludes recommended', () => {
  assert.equal(matchesDlPipeline(mkPipeline(), { ...emptyDlFilters(), status: 'stale' }), true)
  assert.equal(matchesDlPipeline(mkPipeline(), { ...emptyDlFilters(), status: 'missing' }), false)
  assert.equal(matchesDlRecommended(mkRecommended(), { ...emptyDlFilters(), status: 'fresh' }), false)
  assert.equal(matchesDlRecommended(mkRecommended(), { ...emptyDlFilters(), status: 'missing' }), false)
})

check('cadence + tier exact on both (tier compared as String)', () => {
  assert.equal(matchesDlPipeline(mkPipeline(), { ...emptyDlFilters(), cadence: 'weekly' }), true)
  assert.equal(matchesDlPipeline(mkPipeline(), { ...emptyDlFilters(), cadence: 'daily' }), false)
  assert.equal(matchesDlPipeline(mkPipeline(), { ...emptyDlFilters(), tier: '5' }), true)
  assert.equal(matchesDlPipeline(mkPipeline(), { ...emptyDlFilters(), tier: '9' }), false)
  assert.equal(matchesDlRecommended(mkRecommended(), { ...emptyDlFilters(), cadence: 'daily' }), true)
  assert.equal(matchesDlRecommended(mkRecommended(), { ...emptyDlFilters(), tier: '5' }), true)
})

check('text: provider on wired, suggested-source name on recommended, case-insensitive', () => {
  assert.equal(matchesDlPipeline(mkPipeline(), { ...emptyDlFilters(), text: 'ACME' }), true)
  assert.equal(matchesDlPipeline(mkPipeline(), { ...emptyDlFilters(), text: 'nope' }), false)
  assert.equal(matchesDlRecommended(mkRecommended(), { ...emptyDlFilters(), text: 'big prov' }), true)
  assert.equal(matchesDlRecommended(mkRecommended(), { ...emptyDlFilters(), text: 'nope' }), false)
})

check('combined filters AND together', () => {
  const f = { ...emptyDlFilters(), kind: 'wired', subject: 'AAA', cadence: 'weekly', tier: '5', text: 'acme' }
  assert.equal(matchesDlPipeline(mkPipeline(), f), true)
  assert.equal(matchesDlPipeline(mkPipeline({ cadence: 'daily' }), f), false)
})

console.log(`\ndlFilters.test.ts: ${passed} passed`)
