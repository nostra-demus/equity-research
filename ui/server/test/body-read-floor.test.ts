// THE BODY READ'S VERDICT, fed back into the score (news/impact-floor.ts + rank.ts reRankFromFactors +
// news/enrich-heal.ts coldReadCandidates).
//
// The wire ranks on a TITLE-only model read. When the engine later read the whole article it formed its own
// materiality verdict (news_impact.impact_magnitude, the same low/medium/high/critical scale) — and threw it
// away as far as ranking went, so a substantive story behind a weak headline stayed ranked on what its
// headline promised. And a body read only ever happened when a HUMAN opened an item, which they only do for
// what already surfaced — so the under-rated tail was never read at all.
//
// Run: npx tsx test/body-read-floor.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { reRankFromFactors, MATERIALITY_LABEL_FLOOR, type RankFactors } from '../src/news/rank'
import { DEFAULT_RANK_WEIGHTS } from '../src/news/rank-weights'
import { bodyVerdicts, invalidateBodyVerdicts, MIN_CONFIDENCE } from '../src/news/impact-floor'
import { coldReadCandidates, coldExclusionSet } from '../src/news/enrich-heal'
import type { EventEnrichment } from '../src/news/enrich'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'bodyfloor-'))
const writeCache = (dir: string, obj: unknown) => fs.writeFileSync(path.join(dir, 'news-enrich-cache.json'), JSON.stringify(obj))

// a headline-only breakdown: the title read scored 10 and nothing else moved it (the shape of an item whose
// headline told the engine nothing — exactly the case this feature exists for)
const factors = (over: Partial<RankFactors> = {}): RankFactors => ({
  materiality: 10, source_tier: 0, scope: 6, event: 0, size: 2, recency: 2,
  materiality_label_floor: 0, quantified: 0, boost_weight: 1,
  scope_id: 'company', source_tier_id: 'news', event_id: null, size_bucket: 'mega', ...over,
})
const item = { event_types: [] as string[], size_bucket: 'mega' }

// ---- the loop closes: a body verdict floors the score ----
check('a body read of "high" lifts a headline-only score to its floor', () => {
  const before = reRankFromFactors(factors(), item)
  const after = reRankFromFactors(factors(), item, undefined, 'high')
  // asserted against `before` rather than a literal, because the tier/scope/size/recency points come from
  // the ACTIVE weight set (a Scoring-panel edit must not break this test — only the floor is doctrine)
  const lift = MATERIALITY_LABEL_FLOOR.high - factors().materiality
  assert.equal(after.rank_score, before.rank_score + lift, 'the body verdict floors it to the high tier; the other bonuses ride on top unchanged')
  assert.ok(after.rank_score >= MATERIALITY_LABEL_FLOOR.high, 'and it genuinely reaches the tier')
  assert.equal(after.rank_factors.body_label, 'high', 'the verdict travels for the explainer')
})

check('the verdict scale maps to the same floors the headline label uses', () => {
  for (const [label, floor] of Object.entries(MATERIALITY_LABEL_FLOOR)) {
    const r = reRankFromFactors(factors(), item, undefined, label)
    assert.ok(r.rank_score >= floor, `${label} must reach at least ${floor}, got ${r.rank_score}`)
  }
})

// ---- lift only: a body read must never become a new way to bury something (CLAUDE.md §24) ----
check('a body read can never LOWER a score', () => {
  const hot = factors({ materiality: 90, materiality_label_floor: 0 })
  const before = reRankFromFactors(hot, item).rank_score
  for (const label of ['low', 'medium', 'high', 'critical']) {
    assert.equal(reRankFromFactors(hot, item, undefined, label).rank_score >= before, true, `${label} must not lower a 90`)
  }
  assert.equal(reRankFromFactors(hot, item, undefined, 'low').rank_score, before, 'a "low" body verdict leaves it exactly as it was')
})

check('it never DOUBLE-counts against the headline floor already captured at ingest', () => {
  // ingest already floored this to high (70 - 10 = 60 points); a body read agreeing "high" must not add again
  const alreadyFloored = factors({ materiality_label_floor: 60 })
  const a = reRankFromFactors(alreadyFloored, item).rank_score
  const b = reRankFromFactors(alreadyFloored, item, undefined, 'high').rank_score
  assert.equal(a, b, 'the two floors are max()-ed, not summed')
})

// ---- the body floor survives the Scoring panel's Overall-boost tunable (Codex review, PR #350) ----
// Regression: the body floor used to be summed into the SAME adjustment total the panel's Overall boost
// multiplies, so a boost under 1 diluted it and a boost of 0 erased it — silencing the exact evidence a
// body read exists to surface. It must floor at (materiality + the label's lift) regardless of boost.
check('a "high" body verdict still floors the score at boost_weight 0 (the floor must not be silenced)', () => {
  const r = reRankFromFactors(factors(), item, { ...DEFAULT_RANK_WEIGHTS, boost_weight: 0 }, 'high')
  assert.equal(r.rank_score, MATERIALITY_LABEL_FLOOR.high, 'boost=0 zeroes every OTHER adjustment, so the score lands exactly on the floor')
  assert.ok(r.rank_score >= MATERIALITY_LABEL_FLOOR.high, `must still clear the high floor, got ${r.rank_score}`)
})
check('a "high" body verdict still floors the score at boost_weight 0.5 (the floor must not be diluted)', () => {
  const r = reRankFromFactors(factors(), item, { ...DEFAULT_RANK_WEIGHTS, boost_weight: 0.5 }, 'high')
  assert.ok(r.rank_score >= MATERIALITY_LABEL_FLOOR.high, `a half-strength boost must not water down the floor, got ${r.rank_score}`)
})
check('the HEADLINE floor, unlike the body floor, still scales with boost_weight (unchanged ingest behaviour)', () => {
  const headlineFloored = factors({ materiality_label_floor: 60 }) // no body verdict at all
  const r = reRankFromFactors(headlineFloored, item, { ...DEFAULT_RANK_WEIGHTS, boost_weight: 0 })
  assert.equal(r.rank_score, headlineFloored.materiality, 'boost=0 zeroes every tunable adjustment, headline floor included')
})

check('an item with no body read is byte-identical to today', () => {
  const a = JSON.stringify(reRankFromFactors(factors(), item))
  for (const v of [undefined, null, '', 'nonsense']) {
    assert.equal(JSON.stringify(reRankFromFactors(factors(), item, undefined, v as any)), a, `"${v}" must be inert`)
  }
})

// ---- the verdict index ----
check('only firm verdicts are read out of the enrich cache', () => {
  const dir = tmp()
  writeCache(dir, {
    'EVT-firm': { news_impact: { impact_magnitude: 'high', confidence: 90 } },
    'EVT-hedged': { news_impact: { impact_magnitude: 'critical', confidence: MIN_CONFIDENCE - 1 } },
    'EVT-noconf': { news_impact: { impact_magnitude: 'high' } },
    'EVT-junklabel': { news_impact: { impact_magnitude: 'enormous', confidence: 99 } },
    'EVT-nobody': { gist: ['read, but no impact verdict'] },
    // secondary-headline synthesis (GDELT corroboration), not a read of THIS article's own body —
    // CLAUDE.md §3/§5: must not be presented as "the engine read the whole article" (Codex review, PR #350)
    'EVT-corroborated': { news_impact: { impact_magnitude: 'critical', confidence: 95 }, corroborated: { count: 3, domains: ['a.com', 'b.com'] } },
  })
  invalidateBodyVerdicts()
  const m = bodyVerdicts(dir, () => 1)
  assert.deepEqual([...m.keys()], ['EVT-firm'], 'a hedged, unlabelled, junk-labelled, corroborated-only, or unread entry must not move a ranking')
  assert.equal(m.get('EVT-firm')!.label, 'high')
})

check('a missing or corrupt cache degrades to "no verdicts", never an error', () => {
  const dir = tmp()
  invalidateBodyVerdicts()
  assert.equal(bodyVerdicts(dir, () => 1).size, 0, 'no file at all')
  fs.writeFileSync(path.join(dir, 'news-enrich-cache.json'), '{not json')
  invalidateBodyVerdicts()
  assert.equal(bodyVerdicts(dir, () => 1).size, 0, 'corrupt file')
})

check('the index is TTL-cached, and an enrichment write drops it immediately', () => {
  const dir = tmp()
  writeCache(dir, { 'EVT-a': { news_impact: { impact_magnitude: 'high', confidence: 90 } } })
  invalidateBodyVerdicts()
  assert.equal(bodyVerdicts(dir, () => 1_000).size, 1)
  writeCache(dir, { 'EVT-a': { news_impact: { impact_magnitude: 'high', confidence: 90 } }, 'EVT-b': { news_impact: { impact_magnitude: 'critical', confidence: 90 } } })
  assert.equal(bodyVerdicts(dir, () => 1_001).size, 1, 'still the cached copy inside the TTL')
  invalidateBodyVerdicts() // what saveCache calls
  assert.equal(bodyVerdicts(dir, () => 1_002).size, 2, 'a fresh read lands on the very next wire load')
})

// ---- the under-rated tail: which never-read items get a first read ----
const wireItem = (over: any = {}) => ({
  event_id: `EVT-${Math.random().toString(16).slice(2, 10)}`, url: 'https://ex.com/a', headline: 'Something happened',
  source_tier: 'news', event_types: [], companies: [{ name: 'Acme', ticker: 'ACME' }], triage_score: 20,
  size_bucket: 'large', ts: '2026-07-25T10:00:00Z', input_nature: 'news_headline',
  // real wire items always carry the ingest breakdown
  rank_factors: { materiality: 20, source_tier: 0, scope: 6, event: 0, size: 2, recency: 2, materiality_label_floor: 0, quantified: 0, boost_weight: 1, scope_id: 'company', source_tier_id: 'news', event_id: null, size_bucket: 'large' },
  ...over,
})
const pick = (items: any[], enriched: string[] = []) =>
  coldReadCandidates(items, { pickThreshold: 70, minScore: 10, enriched: new Set(enriched) })

check('it targets exactly the "headline told us nothing" case', () => {
  const target = wireItem()
  assert.deepEqual(pick([target]), [target.event_id])
})

check('it declines everything a body read could not help', () => {
  const cases: [string, any][] = [
    ['the headline already named an event', { event_types: ['earnings'] }],
    ['no named issuer', { companies: [] }],
    ['a Reddit post (§4/§24)', { source_tier: 'social' }],
    ['already surfacing above the pick line', { triage_score: 85 }],
    ['below the junk floor', { triage_score: 3 }],
    ['nothing to fetch', { url: '' }],
    ['a filing — the disclosure IS the headline', { input_nature: 'regulatory_filing' }],
    ['no rank_factors — a body read could never move its score', { rank_factors: undefined }],
  ]
  for (const [why, over] of cases) assert.deepEqual(pick([wireItem(over)]), [], `must decline: ${why}`)
})

check('an item already read is never re-read as a cold candidate', () => {
  const it = wireItem()
  assert.deepEqual(pick([it], [it.event_id]), [], 'repair owns already-read entries; discovery must not duplicate the spend')
})

check('it reads the most investable first — source tier, then size, then score', () => {
  const wire = wireItem({ source_tier: 'wire_service', size_bucket: 'mega', triage_score: 20 })
  const small = wireItem({ source_tier: 'news', size_bucket: 'small', triage_score: 20 })
  const midBig = wireItem({ source_tier: 'news', size_bucket: 'mega', triage_score: 15 })
  const got = pick([small, midBig, wire])
  assert.equal(got[0], wire.event_id, 'the better source (§4) leads')
  assert.equal(got[1], midBig.event_id, 'then the bigger company')
  assert.equal(got[2], small.event_id)
})

check('an empty wire is not an error', () => {
  assert.deepEqual(pick([]), [])
  assert.deepEqual(pick([null as any, {} as any]), [])
})

// ---- coldExclusionSet: a cache KEY existing is not the same as "this event is done" (Codex review, PR #350) ----
const enrichEntry = (over: Partial<EventEnrichment> = {}): EventEnrichment =>
  ({ event_id: 'x', ok: true, fetched_at: '2026-07-25T00:00:00Z', prior_coverage: [], related: [], ...over }) as EventEnrichment

check('coldExclusionSet excludes a genuine body verdict — no read could improve it', () => {
  const cache = { 'EVT-a': enrichEntry({ complete: true }) }
  const verdicts = new Map([['EVT-a', { label: 'high' }]])
  assert.deepEqual([...coldExclusionSet(cache, verdicts)], ['EVT-a'])
})

check('coldExclusionSet excludes a still-DEGRADED entry — repair owns it this cycle', () => {
  const cache = { 'EVT-a': enrichEntry({ summary: 'a thin dek' }) } // degraded: no gist/sec/companies/etc.
  assert.deepEqual([...coldExclusionSet(cache, new Map())], ['EVT-a'])
})

check('coldExclusionSet does NOT exclude a COMPLETE entry with no usable verdict — it can still earn a floor', () => {
  // e.g. a legacy line from before news_impact existed, or a brief that happened to omit it
  const cache = { 'EVT-a': enrichEntry({ gist: ['read, but no impact verdict'] }) }
  assert.deepEqual([...coldExclusionSet(cache, new Map())], [], 'must stay eligible for a fresh, potentially verdict-bearing read')
})

// ---- the body read's verdict must be attributed HONESTLY (CLAUDE.md §3/§12) ----
// When the HEADLINE's severity call already set a higher floor than the body read, the displayed floor is
// the headline's — labelling it "the full article reads <low> impact" would attribute the headline's lift to
// a body read that supplied none. body_label is carried only when the body verdict is the floor being shown.
check('a body read WEAKER than the headline floor is not mis-attributed as setting the score', () => {
  // ingest already floored this to HIGH from the headline (70 - 10 = 60 pts); a later body read of "low" is
  // lift-only, so it changes nothing — and must NOT relabel the headline's floor as the body read's.
  const r = reRankFromFactors(factors({ materiality_label_floor: 60 }), item, undefined, 'low')
  assert.equal(r.rank_factors.materiality_label_floor, 60, 'the headline floor stands (lift-only)')
  assert.equal(r.rank_factors.body_label, undefined, 'body_label is NOT stamped — the headline set the floor, not the body read')
})

check('a body read that WINS (or ties) the floor still carries its label for the explainer', () => {
  assert.equal(reRankFromFactors(factors(), item, undefined, 'high').rank_factors.body_label, 'high', 'body high beats a 0 headline floor → attributed')
  assert.equal(reRankFromFactors(factors({ materiality_label_floor: 60 }), item, undefined, 'high').rank_factors.body_label, 'high', 'a tie (body high == headline high) is the body confirming the floor → still attributed')
})

console.log(`\nbody-read-floor.test.ts: ${passed} passed`)
