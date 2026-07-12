// The feedback→scoring auto-apply loop: the orchestrator applies the tuner's guardrailed, backtest-passing
// nudges against the LIVE weights, audits every change with the feedback that drove it, and obeys pins /
// pause / daily-cap; a revert restores the before-values. Plus the free-text reason router (LLM→keyword)
// and the summary's reason clustering. Env is set BEFORE the dynamic imports so config picks up the temp
// state dir + a dummy key (the modules read both at import).
// Run: npx tsx test/rank-weights-autotune.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
process.env.SCREENER_AUTOTUNE_ENABLED = '0' // we call runAutotuneOnce directly; don't arm the timer
process.env.GROQ_API_KEY = 'test-key' // truthy so the router's LLM branch is reachable via an injected fetch
const STATE = fs.mkdtempSync(path.join(os.tmpdir(), 'rwstate-'))
process.env.ENGINE_STATE_DIR = STATE

const { getRankWeights, resetRankWeights } = await import('../src/news/rank-weights')
const audit = await import('../src/news/rank-weights-audit')
const { runAutotuneOnce } = await import('../src/news/rank-weights-autotune')
const { routeReason } = await import('../src/news/triage/reason-router')
const { submitFeedback, appendFeedbackRoute, readAllFeedback, summarizeFeedback } = await import('../src/screener-feedback')

const CHANGES = path.join(STATE, 'rank-weights-changes.jsonl')
const AUTOSTATE = path.join(STATE, 'rank-weights-autotune.json')
const SCOPES = ['single_name', 'multi_name', 'sector', 'macro', 'commodity', 'policy', 'geopolitical', 'generic_media', 'unknown']

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

/** Fresh state each test: default weights, no change history, no pins/pause. */
function reset() {
  resetRankWeights()
  fs.rmSync(CHANGES, { force: true })
  fs.rmSync(AUTOSTATE, { force: true })
}

/** N consistently over-scored macro flags, source_tier spread so no source-tier category clears MIN_PER_CATEGORY. */
function fixture(n = 24): string {
  const tiers = ['primary_filing', 'official_data', 'company', 'news', 'unconfirmed', 'social']
  const lines: string[] = []
  for (let i = 0; i < n; i++) {
    lines.push(JSON.stringify({
      feedback_id: `FDB-20260101-${String(i).padStart(8, '0')}`,
      kind: 'feedback',
      feedback_type: 'score_too_high',
      source: 'Reuters',
      score_breakdown: { materiality: 60, scope: -4, source_tier: 0, event: 0, size: 0, recency: 0, boost_weight: 1, scope_id: 'macro', source_tier_id: tiers[i % tiers.length] },
    }))
  }
  return lines.join('\n') + '\n'
}

const fx = path.join(STATE, 'fx.ndjson')
fs.writeFileSync(fx, fixture())

await check('applies a guardrailed nudge against LIVE weights + audits it with evidence + backtest', async () => {
  reset()
  process.env.FEEDBACK_LEDGER = fx
  const before = getRankWeights().scope.macro // -4 (default)
  const res = await runAutotuneOnce('auto')
  assert.equal(res.applied, true)
  assert.equal(res.status, 'applied')
  assert.equal(getRankWeights().scope.macro, before - 3) // bounded 3-pt step, off the LIVE baseline
  const changes = audit.readChanges()
  assert.equal(changes.length, 1)
  assert.equal(changes[0].kind, 'apply')
  const d = changes[0].deltas.find((x) => x.dimension === 'scope' && x.category === 'macro')
  assert.ok(d && d.before === before && d.after === before - 3)
  assert.ok((changes[0].evidence_feedback_ids || []).length > 0) // clicks back to the driving feedback
  assert.equal(changes[0].backtest?.passes, true)
})

await check('a pinned weight is skipped (all_pinned → no change)', async () => {
  reset()
  process.env.FEEDBACK_LEDGER = fx
  audit.setAutotunePins(['scope:macro'])
  const res = await runAutotuneOnce('auto')
  assert.equal(res.status, 'all_pinned')
  assert.equal(getRankWeights().scope.macro, -4)
  assert.equal(audit.readChanges().length, 0)
})

await check('paused → no run, no change', async () => {
  reset()
  process.env.FEEDBACK_LEDGER = fx
  audit.setAutotunePaused(true)
  const res = await runAutotuneOnce('auto')
  assert.equal(res.status, 'paused')
  assert.equal(audit.readChanges().length, 0)
})

await check('daily cap holds further applies', async () => {
  reset()
  process.env.FEEDBACK_LEDGER = fx
  fs.writeFileSync(AUTOSTATE, JSON.stringify({ paused: false, pins: [], daily: { date: new Date().toISOString().slice(0, 10), count: 8 } }))
  const res = await runAutotuneOnce('auto')
  assert.equal(res.status, 'daily_cap')
  assert.equal(audit.readChanges().length, 0)
})

await check('revert restores the before-values and tombstones the change', async () => {
  reset()
  process.env.FEEDBACK_LEDGER = fx
  const applied = await runAutotuneOnce('auto')
  assert.equal(applied.applied, true)
  const cid = applied.change!.change_id
  assert.equal(getRankWeights().scope.macro, -7)
  const rev = audit.revertChange(cid, 'tester')
  assert.ok(rev && rev.kind === 'revert' && rev.reverts === cid)
  assert.equal(getRankWeights().scope.macro, -4) // restored
  const all = audit.readChanges()
  assert.equal(all.find((c) => c.change_id === cid)?.reverted, true)
  assert.equal(audit.revertChange(cid, 'tester'), null) // idempotent — no double revert
})

await check('below the 20-flag floor → no apply (insufficient_data)', async () => {
  reset()
  const thin = path.join(STATE, 'thin.ndjson')
  fs.writeFileSync(thin, fixture(5))
  process.env.FEEDBACK_LEDGER = thin
  const res = await runAutotuneOnce('auto')
  assert.equal(res.applied, false)
  assert.equal(res.status, 'insufficient_data')
  assert.equal(audit.readChanges().length, 0)
})

await check('reason router: empty → none; LLM failure → keyword; LLM success → llm', async () => {
  assert.deepEqual(await routeReason(''), { scope: null, confidence: 0, via: 'none' })

  const kw = await routeReason('some vague note', (async () => { throw new Error('provider down') }) as any)
  assert.equal(kw.via, 'keyword')
  assert.ok(SCOPES.includes(String(kw.scope)))

  const okFetch = (async () => ({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ scope: 'macro', confidence: 0.9 }) } }] }) })) as any
  const llm = await routeReason('the central bank raised rates', okFetch)
  assert.equal(llm.via, 'llm')
  assert.equal(llm.scope, 'macro')
  assert.equal(llm.confidence, 0.9)
})

await check('router only writes an additive line; summary clusters reasons by routed scope', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fbroot-'))
  const r1 = await submitFeedback({ event_id: 'EVT-aaaaaaaaaaaa', feedback_type: 'irrelevant', feedback_reason: 'not investable' }, 'u', root)
  const r2 = await submitFeedback({ event_id: 'EVT-bbbbbbbbbbbb', feedback_type: 'irrelevant', feedback_reason: 'just noise' }, 'u', root)
  await appendFeedbackRoute(r1.feedback_id, 'generic_media', 0.6, 'keyword', root)
  await appendFeedbackRoute(r2.feedback_id, 'generic_media', 0.6, 'keyword', root)
  const sum = summarizeFeedback(readAllFeedback(root))
  assert.equal(sum.active_total, 2) // route lines are NOT counted as feedback
  const gm = sum.clustered_reasons.find((c) => c.scope === 'generic_media')
  assert.ok(gm && gm.count === 2)
  assert.equal(gm!.sample_reasons.length, 2)
})

console.log(`\n${passed} checks passed`)
