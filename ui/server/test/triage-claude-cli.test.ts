// The SUBSCRIPTION last-resort triage tier (news/triage/claude-cli.ts) + its daily $ ledger (UsdBudget).
// This tier is what stops the ingester dropping items on an overload day, so its failure posture is the
// whole point: every failure must DEFER the batch (ok:false), never score it zero — and the plan's own
// "usage limit reached" must be reported in a way the caller can match to arm its cross-cycle cooldown
// (i.e. wait for the plan to reset instead of re-spawning the CLI every cycle). The $ ledger must be
// restart-safe, or a server bounce would silently reset the ceiling and keep drawing on the plan.
// Run: npx tsx test/triage-claude-cli.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { triageBatchClaudeCli, isUsageLimit, isPlanQuotaNote, type ClaudeCliRunner } from '../src/news/triage/claude-cli'
import { UsdBudget } from '../src/news/triage/budget'
import { NEWS } from '../src/config'
import { DEFERRED_CAP } from '../src/news/runCycle'
import type { NewsItem } from '../src/news/types'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const items = [
  { headline: 'Acme cuts FY guidance 20%', source_name: 'NSE', region: 'IN' },
  { headline: 'Local weather stays mild', source_name: 'Blog', region: 'US' },
] as unknown as NewsItem[]

const opts = { model: 'claude-haiku-4-5' }

// ---- happy path: the CLI text is parsed, rows coerced, and the reported cost surfaces for the ledger ----
await check('scores every index and surfaces the CLI-reported costUsd (what the $ ledger meters on)', async () => {
  const run: ClaudeCliRunner = async () => ({
    text: JSON.stringify({ items: [
      { i: 0, relevance: 'material', materiality_pre_score: 84, issuer_linkage: 'primary', why: 'guidance cut 20%' },
      { i: 1, relevance: 'irrelevant', materiality_pre_score: 2 },
    ] }),
    costUsd: 0.0061,
  })
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(r.ok, true)
  assert.equal(r.byIndex.size, 2)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 84)
  assert.equal(r.byIndex.get(0)!.issuer_linkage, 'primary')
  assert.equal(r.byIndex.get(1)!.materiality_pre_score, 2)
  assert.equal(r.costUsd, 0.0061)
  assert.equal(r.requests, 1)
})

// ---- prose-wrapped JSON (the CLI has no JSON mode) still parses ----
await check('parses JSON even when the model wraps it in prose', async () => {
  const run: ClaudeCliRunner = async () => ({ text: 'Sure:\n{"items":[{"i":0,"materiality_pre_score":61}]}\n', costUsd: 0.002 })
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(r.ok, true)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 61)
})

// ---- THE load-bearing case: the plan's quota is spent → defer + a note the caller matches for cooldown ----
await check('plan usage limit → ok:false (defer), note matches the caller\'s /usage limit/ cooldown trigger', async () => {
  const run: ClaudeCliRunner = async () => ({ text: '', costUsd: 0, error: 'claude cli: usage limit reached — plan quota spent' })
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(r.ok, false)
  assert.equal(r.byIndex.size, 0) // nothing scored → caller defers; never scored zero
  assert.ok(/usage limit/i.test(r.note || ''), 'runCycle arms the cross-cycle cooldown off this substring')
})

// ---- isUsageLimit: recognises the plan-exhausted shapes the CLI reports ----
await check('isUsageLimit recognises 429 / usage-limit / rate-limit results, not ordinary errors', () => {
  assert.equal(isUsageLimit({ api_error_status: 429 }), true)
  assert.equal(isUsageLimit({ result: 'Claude usage limit reached — try again after the plan resets' }), true)
  assert.equal(isUsageLimit({ result: 'rate limit exceeded' }), true)
  assert.equal(isUsageLimit({ result: 'some other failure' }), false)
  assert.equal(isUsageLimit({}), false)
})

// ---- a non-JSON reply defers rather than half-scoring ----
await check('non-JSON reply → ok:false (defer), never a partial score', async () => {
  const run: ClaudeCliRunner = async () => ({ text: 'I cannot help with that.', costUsd: 0.001 })
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(r.ok, false)
  assert.equal(r.byIndex.size, 0)
  assert.match(r.note || '', /non-JSON/)
})

// ---- RETRY (the last-line-of-defence resilience fix): a transient blip retries in-call instead of
// deferring the whole batch and sidelining the paid tier. Parity with the free adapters' maxAttempts=2. ----
await check('a transient failure (timeout) retries in-call and succeeds on attempt 2 — one logical batch scored', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => {
    calls++
    if (calls === 1) return { text: '', costUsd: 0, error: 'claude cli: timed out' }
    return { text: JSON.stringify([{ i: 0, materiality_pre_score: 77 }, { i: 1, materiality_pre_score: 3 }]), costUsd: 0.004 }
  }
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(calls, 2, 'retried once after the transient timeout')
  assert.equal(r.ok, true)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 77)
  assert.equal(r.requests, 1, 'still ONE logical batch, not two')
})

await check('a billed non-JSON reply retries with a stricter JSON-only nudge, then parses — cost of BOTH attempts metered', async () => {
  const seen: string[] = []
  const run: ClaudeCliRunner = async (_sys, user) => {
    seen.push(user)
    if (seen.length === 1) return { text: 'Here you go: (thinking...)', costUsd: 0.002 } // billed, unparseable
    return { text: '[{"i":0,"materiality_pre_score":88}]', costUsd: 0.003 }
  }
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(r.ok, true)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 88)
  assert.ok(/only the JSON array/i.test(seen[1]), 'the retry pushed harder toward a bare JSON array')
  assert.ok(Math.abs(r.costUsd - 0.005) < 1e-9, `both attempts metered (got ${r.costUsd})`)
})

await check('plan quota is NOT retried — one call, deferred, so the caller arms the LONG cooldown', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => { calls++; return { text: '', costUsd: 0, error: 'claude cli: usage limit reached — plan quota spent' } }
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(calls, 1, 're-asking a spent plan is waste — stop after one')
  assert.equal(r.ok, false)
  assert.ok(isPlanQuotaNote(r.note || ''), 'note is the plan-quota signal the caller matches')
})

await check('isPlanQuotaNote distinguishes a spent plan from a transient blip', () => {
  assert.equal(isPlanQuotaNote('claude cli: usage limit reached — plan quota spent'), true)
  assert.equal(isPlanQuotaNote('claude cli: timed out'), false)
  assert.equal(isPlanQuotaNote('claude cli: no output'), false)
  assert.equal(isPlanQuotaNote('claude cli: non-JSON content'), false)
  assert.equal(isPlanQuotaNote(''), false)
})

// ---- a runner that throws must not kill the cycle ----
await check('an unexpected throw in the runner degrades to ok:false, never propagates', async () => {
  const run: ClaudeCliRunner = async () => { throw new Error('spawn EACCES') }
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(r.ok, false)
  assert.match(r.note || '', /EACCES/)
})

// ---- empty batch is a no-op, not a spawn ----
await check('empty batch never spawns', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => { calls++; return { text: '', costUsd: 0 } }
  const r = await triageBatchClaudeCli([], opts, run)
  assert.equal(r.ok, true)
  assert.equal(calls, 0)
})

// ---- the $ ledger: spends to the ceiling, then defers; and survives a restart ----
await check('UsdBudget spends to the $ ceiling then refuses — and is restart-safe', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'usdbudget-'))
  const b = UsdBudget.load(dir, 5, Date.now(), 'anthropic-triage-budget.json')
  assert.equal(b.canSpend(), true)
  b.record(3.0)
  assert.equal(b.canSpend(), true) // 3.0 of 5 spent — still room
  b.record(2.0)
  assert.equal(b.canSpend(), false) // ceiling reached → the caller defers the rest of the day
  assert.equal(b.calls, 2)
  b.save()

  // a server bounce must NOT reset the counter (else it would keep drawing on the plan all day)
  const reloaded = UsdBudget.load(dir, 5, Date.now(), 'anthropic-triage-budget.json')
  assert.equal(reloaded.canSpend(), false)
  assert.ok(Math.abs(reloaded.usd - 5.0) < 1e-9, `usd ${reloaded.usd}`)

  // a NEW day starts fresh
  const tomorrow = UsdBudget.load(dir, 5, Date.now() + 86_400_000, 'anthropic-triage-budget.json')
  assert.equal(tomorrow.canSpend(), true)
  assert.equal(tomorrow.usd, 0)
  fs.rmSync(dir, { recursive: true, force: true })
})

// ---- exhaust(): a terminal error parks the tier for the day ----
await check('UsdBudget.exhaust parks the tier for the rest of the day', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'usdbudget2-'))
  const b = UsdBudget.load(dir, 5, Date.now(), 'anthropic-triage-budget.json')
  assert.equal(b.canSpend(), true)
  b.exhaust()
  assert.equal(b.canSpend(), false)
  fs.rmSync(dir, { recursive: true, force: true })
})

// ---- REGRESSION (live incident, 2026-07-16). The CLI's --model takes an ALIAS ('haiku'/'sonnet'/'opus')
// or a FULL name ('claude-haiku-4-5-20251001'). We shipped the Messages-API alias 'claude-haiku-4-5', which
// the CLI could not resolve, so it silently ran its DEFAULT (Sonnet-class) model: 17 live calls billed
// $0.947 (~$0.068/call) instead of Haiku's ~$0.006-0.015 — burning the $5 ceiling ~10x too fast and draining
// ~5x more of the plan window the research runs share. The subscription model MUST stay CLI-resolvable; the
// metered api backend keeps its own Messages-API id. ----
await check('subscription model is a CLI-resolvable alias — never the Messages-API-only id', () => {
  assert.equal(NEWS.anthropicModel, 'haiku')
  assert.notEqual(NEWS.anthropicModel, 'claude-haiku-4-5') // the CLI cannot resolve the bare API alias
  assert.equal(NEWS.anthropicApiModel, 'claude-haiku-4-5') // api backend addresses it by API id — kept apart
})

// ---- REGRESSION: the deferred backlog cap is a LOSS boundary. It sat at 1,000 while real peaks were
// 2,383 (07-07) and 1,244 (07-16), so the tail past it was binned on exactly the overload days it exists
// for. It must clear the observed peaks with headroom, so an exhaustion window only DELAYS items. ----
await check('deferred backlog cap clears the observed real-world peaks (deferring is fine, dropping is not)', () => {
  assert.ok(DEFERRED_CAP >= 2383, `cap ${DEFERRED_CAP} must exceed the 2,383 peak seen on 2026-07-07`)
})

// ---- finding 1 (Codex, PR #316): the in-call RETRY must respect the daily $ ceiling. The caller gates a
// batch once with an est-less canSpend() (one soft-cap overshoot by design), but never re-checks between the
// adapter's own retries — so a billed retry near the ceiling could add a SECOND overshoot past the operator's
// daily governor. Authority for the expected value: claude-cli.ts's own contract ("the daily ledger is the
// real bound") + the retry must not out-spend the remaining allowance. ----
await check('finding 1: a billed transient retry is SKIPPED once the first attempt consumed the remaining daily budget (no second overshoot)', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => { calls++; return { text: 'thinking…', costUsd: 0.30, error: undefined } } // billed, unparseable → transient (would retry)
  // remaining allowance is 0.25; the first (billed 0.30) attempt has already met/passed it → attempt 2 must NOT run
  const r = await triageBatchClaudeCli(items, { ...opts, budgetRemainingUsd: 0.25 }, run)
  assert.equal(calls, 1, 'the retry that would push cumulative spend past the remaining daily allowance is skipped (red-on-old: 2 calls)')
  assert.equal(r.ok, false, 'nothing parsed → defer, never scored zero')
  assert.match(r.note || '', /budget/i, 'the note names the budget stop')
})

await check('finding 1 control: with ample remaining budget the transient retry still runs (the guard only fires near the ceiling)', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => {
    calls++
    if (calls === 1) return { text: 'thinking…', costUsd: 0.01 } // billed, unparseable → transient
    return { text: '[{"i":0,"materiality_pre_score":80}]', costUsd: 0.01 }
  }
  const r = await triageBatchClaudeCli(items, { ...opts, budgetRemainingUsd: 5 }, run)
  assert.equal(calls, 2, 'plenty of budget left → the retry proceeds exactly as before the guard')
  assert.equal(r.ok, true)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 80)
})

// ---- finding 2 (Codex, PR #316): the retry must stop when the CYCLE is aborted. runAbortableCycle's
// wall-clock guard can fire while an attempt is in flight; the adapter took no signal, so it could spawn
// another billed CLI and hold the shared `running` lock for another timeout after the cycle was told to stop.
// Authority: runCycle's abort guard intent — defer the remainder and STOP, don't hold the lock past abort. ----
await check('finding 2: a pre-aborted signal makes the adapter bill NOTHING and defer (red-on-old: it would spawn once)', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => { calls++; return { text: '[{"i":0,"materiality_pre_score":9}]', costUsd: 0.01 } }
  const ac = new AbortController()
  ac.abort()
  const r = await triageBatchClaudeCli(items, { ...opts, signal: ac.signal }, run)
  assert.equal(calls, 0, 'already aborted → never spawn a billed CLI')
  assert.equal(r.ok, false, 'aborted before any score → defer the batch')
  assert.match(r.note || '', /abort/i, 'the note names the abort')
})

await check('finding 2: an abort DURING attempt 1 stops the retry (one call, not two)', async () => {
  let calls = 0
  const ac = new AbortController()
  const run: ClaudeCliRunner = async () => {
    calls++
    ac.abort() // the wall-clock guard fires while this attempt is in flight
    return { text: 'thinking…', costUsd: 0.01 } // billed, unparseable → would normally retry
  }
  const r = await triageBatchClaudeCli(items, { ...opts, signal: ac.signal }, run)
  assert.equal(calls, 1, 'the second attempt is skipped because the cycle was aborted mid-flight (red-on-old: 2 calls)')
  assert.equal(r.ok, false)
})

console.log(`\n${passed} checks passed`)
