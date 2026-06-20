// Tunable scoring weights — the store (load / merge / save / reset / validate) and the two scoring paths
// that read it (rankScore at ingest, reRankFromFactors for the live-wire re-rank). Pure functions + an
// isolated tmp state dir, so no key / network is needed. Run: npx tsx test/rank-weights.test.ts
//
// STATE_DIR is resolved at config import time, so we set ENGINE_STATE_DIR to a fresh tmp dir FIRST, then
// DYNAMIC-import the modules (static imports would evaluate config before this line runs).
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const STATE = fs.mkdtempSync(path.join(os.tmpdir(), 'rankw-'))
process.env.ENGINE_STATE_DIR = STATE

const { DEFAULT_RANK_WEIGHTS, getRankWeights, saveRankWeights, resetRankWeights, defaultRankWeights, rankWeightsCustomised } = await import('../src/news/rank-weights')
const { rankScore, reRankFromFactors } = await import('../src/news/rank')

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const NOW = new Date('2026-06-20T12:00:00Z')
// a terse primary filing about one named company, found 8h ago → recency bucket <12h
const SBI = { materiality_pre_score: 85, issuer_linkage: 'primary', companies: [{ name: 'State Bank Of India' }], event_types: ['earnings_revenue_margin'], input_nature: 'exchange_announcement', size_bucket: 'unknown', found_at: '2026-06-20T04:00:00Z' }

// ---- defaults reproduce the prior hardcoded scoring ----

await check('rankScore at defaults: SBI-style filing builds 85 +8 +6 +5 +0 +2 → capped 100', () => {
  const r = rankScore(SBI, NOW, DEFAULT_RANK_WEIGHTS)
  assert.deepEqual(r.rank_factors, { materiality: 85, source_tier: 8, scope: 6, event: 5, size: 0, recency: 2, scope_id: 'single_name', source_tier_id: 'primary_filing' })
  assert.equal(r.rank_score, 100) // 85 + 21 = 106, clamped to 100
})

await check('uncapped item reconciles exactly (no clamp): 40 + 8 + 6 + 5 + 0 + 2 = 61', () => {
  const r = rankScore({ ...SBI, materiality_pre_score: 40 }, NOW, DEFAULT_RANK_WEIGHTS)
  assert.equal(r.rank_score, 61)
})

await check('boost_weight 0 → pure Groq score (no adjustment)', () => {
  const r = rankScore({ ...SBI, materiality_pre_score: 40 }, NOW, { ...DEFAULT_RANK_WEIGHTS, boost_weight: 0 })
  assert.equal(r.rank_score, 40)
})

await check('a bare rumour is pushed DOWN (rumor-only penalty shows through the max)', () => {
  const r = rankScore({ materiality_pre_score: 30, issuer_linkage: 'sector', companies: [], event_types: ['rumor'], input_nature: 'news_headline', headline: 'sources say a deal may be near', size_bucket: 'unknown', found_at: NOW.toISOString() }, NOW, DEFAULT_RANK_WEIGHTS)
  assert.equal(r.rank_factors.event, -3) // rumor penalty, not floored to 0
})

await check('strongest event wins when several are present (max, not sum)', () => {
  const r = rankScore({ ...SBI, event_types: ['operations', 'mna', 'rumor'] }, NOW, DEFAULT_RANK_WEIGHTS)
  assert.equal(r.rank_factors.event, 9) // mna(9) beats operations(2); rumor penalty ignored when a positive exists
})

// ---- tuning a weight changes the score (the whole point of the panel) ----

await check('raising a weight raises the score; lowering lowers it', () => {
  const base = rankScore({ ...SBI, materiality_pre_score: 40 }, NOW, DEFAULT_RANK_WEIGHTS).rank_score // 61
  const up = rankScore({ ...SBI, materiality_pre_score: 40 }, NOW, { ...DEFAULT_RANK_WEIGHTS, source_tier: { ...DEFAULT_RANK_WEIGHTS.source_tier, primary_filing: 20 } }).rank_score
  const down = rankScore({ ...SBI, materiality_pre_score: 40 }, NOW, { ...DEFAULT_RANK_WEIGHTS, scope: { ...DEFAULT_RANK_WEIGHTS.scope, single_name: -10 } }).rank_score
  assert.equal(up, 73) // +12 on the tier
  assert.equal(down, 45) // -16 on the scope
  assert.ok(up > base && down < base)
})

// ---- reRankFromFactors: re-score the wire under new weights, clock-independent ----

await check('reRankFromFactors at defaults reproduces the score and KEEPS the persisted recency', () => {
  const rf = { materiality: 85, source_tier: 8, scope: 6, event: 5, size: 0, recency: 2, scope_id: 'single_name' as const, source_tier_id: 'primary_filing' as const }
  const r = reRankFromFactors(rf, { event_types: ['earnings_revenue_margin'], size_bucket: 'unknown' }, DEFAULT_RANK_WEIGHTS)
  assert.equal(r.rank_factors.recency, 2) // taken from rf, NOT recomputed from a clock
  assert.equal(r.rank_score, 100)
})

await check('reRankFromFactors applies new weights to an existing item', () => {
  const rf = { materiality: 40, source_tier: 8, scope: 6, event: 5, size: 0, recency: 2, scope_id: 'single_name' as const, source_tier_id: 'primary_filing' as const }
  const def = reRankFromFactors(rf, { event_types: ['earnings_revenue_margin'], size_bucket: 'unknown' }, DEFAULT_RANK_WEIGHTS)
  assert.equal(def.rank_score, 61)
  const tuned = reRankFromFactors(rf, { event_types: ['earnings_revenue_margin'], size_bucket: 'unknown' }, { ...DEFAULT_RANK_WEIGHTS, source_tier: { ...DEFAULT_RANK_WEIGHTS.source_tier, primary_filing: 0 } })
  assert.equal(tuned.rank_score, 53) // -8 from zeroing the filing bonus
})

// ---- the store: load / save / reset / validate ----

await check('getRankWeights with no saved file == the shipped defaults', () => {
  resetRankWeights()
  assert.deepEqual(getRankWeights(), defaultRankWeights())
  assert.equal(rankWeightsCustomised(), false)
})

await check('saveRankWeights persists a partial override, merged over the rest', () => {
  resetRankWeights()
  const active = saveRankWeights({ source_tier: { primary_filing: 12 }, boost_weight: 1.5 })
  assert.equal(active.source_tier.primary_filing, 12)
  assert.equal(active.source_tier.news, 0) // untouched key keeps its default
  assert.equal(active.scope.single_name, 6) // untouched group keeps its defaults
  assert.equal(active.boost_weight, 1.5)
  assert.equal(rankWeightsCustomised(), true)
  // it survives a fresh read (written to disk)
  assert.ok(fs.existsSync(path.join(STATE, 'rank-weights.json')))
})

await check('save validates: out-of-range clamped, non-numbers ignored, unknown keys dropped', () => {
  resetRankWeights()
  const active = saveRankWeights({ source_tier: { primary_filing: 999, news: 'x' as any, bogus_tier: 7 as any }, boost_weight: 9 })
  assert.equal(active.source_tier.primary_filing, 50) // clamped to the +/-50 ceiling
  assert.equal(active.source_tier.news, 0) // non-number ignored → keeps default
  assert.ok(!('bogus_tier' in active.source_tier)) // unknown key dropped (shaped by defaults)
  assert.equal(active.boost_weight, 2) // clamped to the 0–2 range
})

await check('resetRankWeights restores defaults and removes the override file', () => {
  saveRankWeights({ boost_weight: 0 })
  assert.ok(fs.existsSync(path.join(STATE, 'rank-weights.json')))
  const d = resetRankWeights()
  assert.deepEqual(d, defaultRankWeights())
  assert.ok(!fs.existsSync(path.join(STATE, 'rank-weights.json')))
  assert.equal(rankWeightsCustomised(), false)
})

await check('every default group is non-empty and numeric (the panel renders from these)', () => {
  const d = DEFAULT_RANK_WEIGHTS
  for (const g of [d.source_tier, d.scope, d.event, d.size, d.recency]) {
    assert.ok(Object.keys(g).length > 0)
    for (const v of Object.values(g)) assert.equal(typeof v, 'number')
  }
  assert.equal(typeof d.boost_weight, 'number')
})

console.log(`\nrank-weights: ${passed} checks passed`)
