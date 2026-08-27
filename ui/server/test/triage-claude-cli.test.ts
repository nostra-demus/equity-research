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
import { CLAUDE_CLI_SHARD_SIZE, claudeCliShardCount, triageBatchClaudeCli, triageBatchClaudeCliSharded, isUsageLimit, isAuthExpiredNote, isPlanQuotaNote, isTerminalApiNote, type ClaudeCliRunner } from '../src/news/triage/claude-cli'
import { UsdBudget, conservativeChatUsdBound } from '../src/news/triage/budget'
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

const shardItems = Array.from({ length: 24 }, (_, index) => ({
  headline: `Company headline-${index} changes guidance materially`,
  source_name: 'Exchange',
  region: 'US',
})) as unknown as NewsItem[]
const completeRows = (count: number, score: number) => Array.from({ length: count }, (_, index) => ({
  i: index,
  relevance: 'material',
  materiality_pre_score: score,
}))

await check('Haiku shard count uses the proven 12-row request unit', () => {
  assert.equal(CLAUDE_CLI_SHARD_SIZE, 12)
  assert.equal(claudeCliShardCount(0), 0)
  assert.equal(claudeCliShardCount(12), 1)
  assert.equal(claudeCliShardCount(13), 2)
  assert.equal(claudeCliShardCount(24), 2)
  assert.equal(claudeCliShardCount(25), 3)
})

await check('a 24-row outer batch runs as two concurrent 12-row Haiku calls and rejoins exact indices', async () => {
  let started = 0
  let active = 0
  let maxActive = 0
  let releaseBoth!: () => void
  const bothStarted = new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('the second Haiku shard never started')), 2_000)
    releaseBoth = () => { clearTimeout(timeout); resolve() }
  })
  const prompts: string[] = []
  const run: ClaudeCliRunner = async (_system, user) => {
    const call = started++
    prompts.push(user)
    active++
    maxActive = Math.max(maxActive, active)
    if (started === 2) releaseBoth()
    await bothStarted
    active--
    return { text: JSON.stringify(completeRows(12, call === 0 ? 71 : 82)), costUsd: 0.04 + call * 0.01, costUsdKnown: true }
  }
  const admitted: Array<[number, number]> = []
  const r = await triageBatchClaudeCliSharded(shardItems, {
    ...opts,
    beforeAdditionalShard: async (shardIndex, itemCount) => { admitted.push([shardIndex, itemCount]); return true },
  }, run)
  assert.equal(r.ok, true)
  assert.equal(r.requests, 2)
  assert.equal(r.byIndex.size, 24)
  assert.equal(r.byIndex.get(0)?.materiality_pre_score, 71)
  assert.equal(r.byIndex.get(12)?.materiality_pre_score, 82)
  assert.equal(r.costUsd, 0.09)
  assert.equal(r.costUsdKnown, true)
  assert.equal(maxActive, 2, 'both proven-size calls overlap instead of consuming two full timeouts serially')
  assert.deepEqual(admitted, [[1, 12]], 'only the second shard needs another limiter admission')
  assert.equal(prompts.length, 2)
  assert.ok(prompts.every((prompt) => prompt.startsWith('Score these 12 headlines:')))
})

await check('one failed Haiku shard invalidates the whole outer batch so no partial score escapes', async () => {
  const run: ClaudeCliRunner = async (_system, user) => user.includes('headline-12')
    ? { text: '', costUsd: 0, costUsdKnown: false, error: 'claude cli: timed out' }
    : { text: JSON.stringify(completeRows(12, 70)), costUsd: 0.04, costUsdKnown: true }
  const r = await triageBatchClaudeCliSharded(shardItems, { ...opts, beforeAdditionalShard: async () => true }, run)
  assert.equal(r.ok, false)
  assert.equal(r.requests, 2)
  assert.equal(r.byIndex.size, 0, 'the automatic fallback must receive the original complete batch')
  assert.equal(r.timedOut, true)
  assert.equal(r.failureKind, 'availability')
  assert.equal(r.costUsdKnown, false)
})

await check('a rejected additional-shard admission starts no unfunded provider call', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => {
    calls++
    return { text: JSON.stringify(completeRows(12, 70)), costUsd: 0.04, costUsdKnown: true }
  }
  const r = await triageBatchClaudeCliSharded(shardItems, { ...opts, beforeAdditionalShard: async () => false }, run)
  assert.equal(r.ok, false)
  assert.equal(calls, 1)
  assert.equal(r.requests, 1)
  assert.equal(r.byIndex.size, 0)
  assert.match(r.note || '', /capacity/)
})

// ---- happy path: the CLI text is parsed, rows coerced, and the reported cost surfaces for the ledger ----
await check('scores every index and surfaces the CLI-reported costUsd (what the $ ledger meters on)', async () => {
  const run: ClaudeCliRunner = async () => ({
    text: JSON.stringify({ items: [
      { i: 0, relevance: 'material', materiality_pre_score: 84, issuer_linkage: 'primary', why: 'guidance cut 20%' },
      { i: 1, relevance: 'irrelevant', materiality_pre_score: 2 },
    ] }),
    costUsd: 0.0061,
    costUsdKnown: true,
  })
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(r.ok, true)
  assert.equal(r.byIndex.size, 2)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 84)
  assert.equal(r.byIndex.get(0)!.issuer_linkage, 'primary')
  assert.equal(r.byIndex.get(1)!.materiality_pre_score, 2)
  assert.equal(r.costUsd, 0.0061)
  assert.equal(r.costUsdKnown, true)
  assert.equal(r.requests, 1)
})

await check('a dispatched reply without an exact total cost stays conservatively unknown', async () => {
  const run: ClaudeCliRunner = async () => ({
    text: '[{"i":0,"materiality_pre_score":61},{"i":1,"materiality_pre_score":0}]',
    costUsd: 0,
    costUsdKnown: false,
  })
  const r = await triageBatchClaudeCli(items, { ...opts, maxAttempts: 1 }, run)
  assert.equal(r.ok, true)
  assert.equal(r.requests, 1)
  assert.equal(r.costUsd, 0)
  assert.equal(r.costUsdKnown, false, 'missing total_cost_usd is not proof of a free call')
})

await check('a valid nonempty reply with reported zero cost keeps the conservative bound', async () => {
  const run: ClaudeCliRunner = async () => ({
    text: '[{"i":0,"materiality_pre_score":61},{"i":1,"materiality_pre_score":0}]',
    costUsd: 0,
    costUsdKnown: true,
  })
  const r = await triageBatchClaudeCli(items, { ...opts, maxAttempts: 1 }, run)
  assert.equal(r.ok, true)
  assert.equal(r.requests, 1)
  assert.equal(r.costUsd, 0)
  assert.equal(r.costUsdKnown, false, 'zero telemetry cannot make a real dispatched completion free')
})

await check('an unknown-cost dispatched attempt cannot retry under the same one-call reservation', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => {
    calls++
    return { text: '', costUsd: 0, costUsdKnown: false, error: 'claude cli: timed out' }
  }
  const r = await triageBatchClaudeCli(items, { ...opts, maxAttempts: 2, budgetUsd: 0.25, budgetRemainingUsd: 0.25 }, run)
  assert.equal(calls, 1, 'a second uncertain call would exceed the single conservative reservation')
  assert.equal(r.ok, false)
  assert.equal(r.requests, 1)
  assert.equal(r.costUsdKnown, false)
  assert.equal(r.timedOut, true)
  assert.equal(r.failureKind, 'availability')
})

// ---- prose-wrapped JSON (the CLI has no JSON mode) still parses ----
await check('parses JSON even when the model wraps it in prose', async () => {
  const run: ClaudeCliRunner = async () => ({ text: 'Sure:\n{"items":[{"i":0,"materiality_pre_score":61},{"i":1,"materiality_pre_score":0}]}\n', costUsd: 0.002, costUsdKnown: true })
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(r.ok, true)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 61)
})

await check('empty, partial, duplicate, and out-of-range coverage is a contract failure, never a partial score', async () => {
  const cases = [
    { label: 'empty', rows: [] },
    { label: 'partial', rows: [{ i: 0, materiality_pre_score: 84 }] },
    { label: 'duplicate', rows: [{ i: 0, materiality_pre_score: 84 }, { i: 0, materiality_pre_score: 0 }] },
    { label: 'out-of-range', rows: [{ i: 0, materiality_pre_score: 84 }, { i: 2, materiality_pre_score: 0 }] },
  ]
  for (const c of cases) {
    const run: ClaudeCliRunner = async () => ({ text: JSON.stringify({ items: c.rows }), costUsd: 0.001, costUsdKnown: true })
    const r = await triageBatchClaudeCli(items, { ...opts, maxAttempts: 1 }, run)
    assert.equal(r.ok, false, `${c.label} coverage cannot be a scored success`)
    assert.equal(r.failureKind, 'contract')
    assert.equal(r.byIndex.size, 0, 'no partial rows escape downstream')
  }
})

// ---- THE load-bearing case: the plan's quota is spent → defer + a note the caller matches for cooldown ----
await check('plan usage limit → ok:false (defer), note matches the caller\'s /usage limit/ cooldown trigger', async () => {
  const run: ClaudeCliRunner = async () => ({ text: '', costUsd: 0, costUsdKnown: true, error: 'claude cli: usage limit reached — plan quota spent' })
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
  const run: ClaudeCliRunner = async () => ({ text: 'I cannot help with that.', costUsd: 0.001, costUsdKnown: true })
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(r.ok, false)
  assert.equal(r.byIndex.size, 0)
  assert.match(r.note || '', /non-JSON/)
})

// ---- RETRY (the last-line-of-defence resilience fix): a transient blip retries in-call instead of
// deferring the whole batch and sidelining the paid tier. Parity with the free adapters' maxAttempts=2. ----
await check('a transient failure (timeout) retries in-call and reports both provider attempts', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => {
    calls++
    if (calls === 1) return { text: '', costUsd: 0, costUsdKnown: true, error: 'claude cli: timed out' }
    return { text: JSON.stringify([{ i: 0, materiality_pre_score: 77 }, { i: 1, materiality_pre_score: 3 }]), costUsd: 0.004, costUsdKnown: true }
  }
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(calls, 2, 'retried once after the transient timeout')
  assert.equal(r.ok, true)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 77)
  assert.equal(r.requests, 2, 'diagnostics count both provider processes, including the retry')
})

await check('a billed non-JSON reply retries with a stricter JSON-only nudge, then parses — cost of BOTH attempts metered', async () => {
  const seen: string[] = []
  const run: ClaudeCliRunner = async (_sys, user) => {
    seen.push(user)
    if (seen.length === 1) return { text: 'Here you go: (thinking...)', costUsd: 0.002, costUsdKnown: true } // billed, unparseable
    return { text: '[{"i":0,"materiality_pre_score":88},{"i":1,"materiality_pre_score":0}]', costUsd: 0.003, costUsdKnown: true }
  }
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(r.ok, true)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 88)
  assert.ok(/only the JSON array/i.test(seen[1]), 'the retry pushed harder toward a bare JSON array')
  assert.ok(Math.abs(r.costUsd - 0.005) < 1e-9, `both attempts metered (got ${r.costUsd})`)
})

await check('plan quota is NOT retried — one call, deferred, so the caller arms the LONG cooldown', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => { calls++; return { text: '', costUsd: 0, costUsdKnown: true, error: 'claude cli: usage limit reached — plan quota spent' } }
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

// ---- finding 3 (Codex, PR #316): a TERMINAL API error (bad/revoked key, no credits — api_error_status,
// not a usage-limit 429) must be classified apart from an ordinary transient blip in BOTH places that read
// the note: runCycle.ts's `/HTTP (400|401|402|403|404|413)/` match (exhaust the day, don't arm the short
// cooldown) and this adapter's own retry loop (don't re-ask an unauthenticated call). Before this fix
// defaultClaudeCliRunner's `handle()` dropped `o.api_error_status` on the floor — the note never carried
// "HTTP nnn" — so a 401 read as an ordinary transient error everywhere downstream. ----
await check('isTerminalApiNote recognises the "HTTP nnn" shape a terminal API failure is now reported as', () => {
  assert.equal(isTerminalApiNote('claude cli: HTTP 401 — invalid api key'), true)
  assert.equal(isTerminalApiNote('claude cli: HTTP 403 — permission denied'), true)
  assert.equal(isTerminalApiNote('claude cli: usage limit reached — plan quota spent'), false, 'a 429 plan-quota note is not a terminal API note')
  assert.equal(isTerminalApiNote('claude cli: timed out'), false)
  assert.equal(isTerminalApiNote('claude cli: no output'), false)
  assert.equal(isTerminalApiNote(''), false)
})

await check('a terminal API note (HTTP 401) is NOT retried — one call, deferred, so the caller exhausts the day instead of a short cooldown', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => { calls++; return { text: '', costUsd: 0, costUsdKnown: true, error: 'claude cli: HTTP 401 — invalid api key' } }
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(calls, 1, 're-asking a revoked/expired key is waste and holds the lock for nothing — stop after one')
  assert.equal(r.ok, false)
  assert.ok(isTerminalApiNote(r.note || ''), 'note is the terminal-API signal runCycle.ts matches to exhaust the day')
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
  const run: ClaudeCliRunner = async () => { calls++; return { text: '', costUsd: 0, costUsdKnown: true } }
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

await check('UsdBudget reserves before provider I/O, so a near-cap call cannot overshoot', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'usdbudget-near-cap-'))
  const at = Date.parse('2026-08-13T12:00:00Z')
  const b = UsdBudget.load(dir, 1, at, 'anthropic-triage-budget.json')
  b.record(0.95)
  assert.equal(b.tryReserve(0.10, at), null, 'the worst-case call does not fit in the final $0.05')
  const saved = JSON.parse(fs.readFileSync(path.join(dir, 'anthropic-triage-budget.json'), 'utf8'))
  assert.equal(saved.usd, 0.95, 'refused admission does not mutate spend')
  assert.equal(saved.calls, 1)
  fs.rmSync(dir, { recursive: true, force: true })
})

await check('UsdBudget keeps an in-flight reservation charged across a crash/restart', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'usdbudget-crash-'))
  const at = Date.parse('2026-08-13T12:00:00Z')
  const owner = UsdBudget.load(dir, 1, at, 'anthropic-triage-budget.json')
  const reservation = owner.tryReserve(0.60, at)
  assert.ok(reservation)
  // Simulate a process dying after admission but before it can reconcile provider usage.
  const restarted = UsdBudget.load(dir, 1, at, 'anthropic-triage-budget.json')
  assert.equal(restarted.usd, 0.60)
  assert.equal(restarted.calls, 1)
  assert.equal(restarted.tryReserve(0.50, at), null, 'uncertain work stays charged after restart')
  const saved = JSON.parse(fs.readFileSync(path.join(dir, 'anthropic-triage-budget.json'), 'utf8'))
  assert.ok(saved.reservations[reservation!.id], 'reservation identity is durable')
  fs.rmSync(dir, { recursive: true, force: true })
})

await check('UsdBudget reconciliation replaces the estimate with exact actual cost exactly once', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'usdbudget-reconcile-'))
  const at = Date.parse('2026-08-13T12:00:00Z')
  const b = UsdBudget.load(dir, 1, at, 'anthropic-triage-budget.json')
  const reservation = b.tryReserve(0.40, at)
  assert.ok(reservation)
  const replay = { ...reservation!, active: true }
  b.reconcile(reservation!, 0.073, 1)
  b.reconcile(replay, 0, 0)
  assert.ok(Math.abs(b.usd - 0.073) < 1e-12)
  assert.equal(b.calls, 1)
  const saved = JSON.parse(fs.readFileSync(path.join(dir, 'anthropic-triage-budget.json'), 'utf8'))
  assert.equal(Object.keys(saved.reservations).length, 0)
  assert.equal(saved.revision, 2)
  fs.rmSync(dir, { recursive: true, force: true })
})

await check('UsdBudget terminal exhaustion stays closed across an in-flight reconciliation', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'usdbudget-exhaust-race-'))
  const at = Date.parse('2026-08-13T12:00:00Z')
  const owner = UsdBudget.load(dir, 1, at, 'anthropic-triage-budget.json')
  const active = owner.tryReserve(0.40, at)
  assert.ok(active)
  UsdBudget.load(dir, 1, at, 'anthropic-triage-budget.json').exhaust()
  owner.reconcile(active!, 0.05, 1)
  const restarted = UsdBudget.load(dir, 1, at, 'anthropic-triage-budget.json')
  assert.equal(restarted.canSpend(0.01), false, 'a late success cannot reopen a terminally exhausted day')
  assert.ok(restarted.usd >= 1)
  fs.rmSync(dir, { recursive: true, force: true })
})

await check('UsdBudget rotates on its configured provider timezone and ignores a late prior-day reconcile', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'usdbudget-tz-'))
  const beforePacificMidnight = Date.parse('2026-08-13T06:59:00Z')
  const afterPacificMidnight = Date.parse('2026-08-13T07:01:00Z')
  const b = UsdBudget.load(dir, 1, beforePacificMidnight, 'anthropic-triage-budget.json', 'America/Los_Angeles')
  const oldReservation = b.tryReserve(0.80, beforePacificMidnight)
  assert.equal(oldReservation?.date, '2026-08-12')
  const newReservation = b.tryReserve(0.80, afterPacificMidnight)
  assert.equal(newReservation?.date, '2026-08-13', 'the new provider-local day gets a fresh ceiling')
  b.reconcile(oldReservation!, 0, 0)
  assert.equal(b.usd, 0.80, 'yesterday completion cannot reopen or overwrite the new day')
  fs.rmSync(dir, { recursive: true, force: true })
})

await check('API dollar reservation prices conservative input and output bounds separately', () => {
  const system = 'system'
  const user = 'two-byte: é'
  const maxOutput = 2_400
  const actual = conservativeChatUsdBound(system, user, maxOutput, 1, 5)
  const expected = ((Buffer.byteLength(system) + Buffer.byteLength(user) + 256) * 1 + maxOutput * 5) / 1_000_000
  assert.ok(Math.abs(actual - expected) < 1e-12)
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

await check('default outer triage batch is 24 while Haiku stays below the observed 36-row timeout', () => {
  assert.equal(NEWS.triageBatch, 24)
  assert.ok(NEWS.triageBatch < 36, '36 rows hit the existing 120s Haiku timeout in the production-contract canary')
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
  const run: ClaudeCliRunner = async () => { calls++; return { text: 'thinking…', costUsd: 0.30, costUsdKnown: true, error: undefined } } // billed, unparseable → transient (would retry)
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
    if (calls === 1) return { text: 'thinking…', costUsd: 0.01, costUsdKnown: true } // billed, unparseable → transient
    return { text: '[{"i":0,"materiality_pre_score":80},{"i":1,"materiality_pre_score":0}]', costUsd: 0.01, costUsdKnown: true }
  }
  const r = await triageBatchClaudeCli(items, { ...opts, budgetRemainingUsd: 5 }, run)
  assert.equal(calls, 2, 'plenty of budget left → the retry proceeds exactly as before the guard')
  assert.equal(r.ok, true)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 80)
})

// ---- Codex P2 follow-up finding on the finding-1 fix (PR #316): the guard must reserve the RETRY's own
// max possible cost (opts.budgetUsd — the --max-budget-usd cap passed to every call), not just compare the
// spend SO FAR to the remaining allowance. $0.15 left, a billed $0.10 first attempt passes `costUsd (0.10)
// >= budgetRemainingUsd (0.15)` (old guard), so a second ~$0.10 attempt could still add a SECOND overshoot.
// Authority: claude-cli.ts's own contract ("the daily ledger is the real bound") — the retry must never be
// STARTED unless its worst case still fits. ----
await check('finding 1 follow-up: a retry is skipped when its OWN max cost (budgetUsd) would blow the remaining allowance, even though spend-so-far has not', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => { calls++; return { text: 'thinking…', costUsd: 0.10, costUsdKnown: true, error: undefined } } // billed, unparseable → transient
  // remaining allowance 0.15; spend-so-far after attempt 1 is 0.10 (< 0.15, old guard would retry) but
  // 0.10 + the 0.10 per-call cap = 0.20 > 0.15 → the retry's own worst case does not fit → skip
  const r = await triageBatchClaudeCli(items, { ...opts, budgetRemainingUsd: 0.15, budgetUsd: 0.10 }, run)
  assert.equal(calls, 1, 'red-on-old: the pre-fix guard (costUsd >= budgetRemainingUsd) would have let attempt 2 run')
  assert.equal(r.ok, false)
  assert.match(r.note || '', /budget/i, 'the note names the budget stop')
})

await check('finding 1 follow-up control: a retry proceeds when its own max cost still fits the remaining allowance', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => {
    calls++
    if (calls === 1) return { text: 'thinking…', costUsd: 0.01, costUsdKnown: true } // billed, unparseable → transient
    return { text: '[{"i":0,"materiality_pre_score":42},{"i":1,"materiality_pre_score":0}]', costUsd: 0.01, costUsdKnown: true }
  }
  // remaining allowance 1.00; spend-so-far 0.01 + the 0.10 per-call cap = 0.11 <= 1.00 → fits, retry proceeds
  const r = await triageBatchClaudeCli(items, { ...opts, budgetRemainingUsd: 1.0, budgetUsd: 0.10 }, run)
  assert.equal(calls, 2, 'the reservation only blocks a retry whose own worst case would not fit')
  assert.equal(r.ok, true)
  assert.equal(r.byIndex.get(0)!.materiality_pre_score, 42)
})

// ---- finding 2 (Codex, PR #316): the retry must stop when the CYCLE is aborted. runAbortableCycle's
// wall-clock guard can fire while an attempt is in flight; the adapter took no signal, so it could spawn
// another billed CLI and hold the shared `running` lock for another timeout after the cycle was told to stop.
// Authority: runCycle's abort guard intent — defer the remainder and STOP, don't hold the lock past abort. ----
await check('finding 2: a pre-aborted signal makes the adapter bill NOTHING and defer (red-on-old: it would spawn once)', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => { calls++; return { text: '[{"i":0,"materiality_pre_score":9},{"i":1,"materiality_pre_score":0}]', costUsd: 0.01, costUsdKnown: true } }
  const ac = new AbortController()
  ac.abort()
  const r = await triageBatchClaudeCli(items, { ...opts, signal: ac.signal }, run)
  assert.equal(calls, 0, 'already aborted → never spawn a billed CLI')
  assert.equal(r.ok, false, 'aborted before any score → defer the batch')
  assert.equal(r.requests, 0, 'a pre-dispatch abort releases the caller reservation')
  assert.equal(r.costUsdKnown, true)
  assert.match(r.note || '', /abort/i, 'the note names the abort')
})

await check('finding 2: an abort DURING attempt 1 stops the retry (one call, not two)', async () => {
  let calls = 0
  const ac = new AbortController()
  const run: ClaudeCliRunner = async () => {
    calls++
    ac.abort() // the wall-clock guard fires while this attempt is in flight
    return { text: 'thinking…', costUsd: 0.01, costUsdKnown: true } // billed, unparseable → would normally retry
  }
  const r = await triageBatchClaudeCli(items, { ...opts, signal: ac.signal }, run)
  assert.equal(calls, 1, 'the second attempt is skipped because the cycle was aborted mid-flight (red-on-old: 2 calls)')
  assert.equal(r.ok, false)
})

// ---- an EXPIRED SIGN-IN is its own failure class: un-retryable in-call, but recoverable across cycles ----
// The exact note the real CLI produces (reproduced against claude 2.1.150 with an expired keychain token).
const AUTH_NOTE = 'claude cli: HTTP 401 — Failed to authenticate. API Error: 401 OAuth access token has expired. Re-authenticate to continue.'

await check('the real expired-token note is classified as an expired sign-in', () => {
  assert.equal(isAuthExpiredNote(AUTH_NOTE), true)
  assert.equal(isAuthExpiredNote('claude cli: HTTP 401 — Unauthorized'), true, 'a bare 401 counts')
  assert.equal(isAuthExpiredNote('claude cli: authentication_failed'), true, 'so does the worded form, with no HTTP code')
})

await check('an expired sign-in is NOT confused with the other failure classes', () => {
  assert.equal(isPlanQuotaNote(AUTH_NOTE), false, "an expired sign-in is not the plan's quota being spent")
  assert.equal(isUsageLimit({ api_error_status: 401, result: 'OAuth access token has expired.' }), false)
  for (const n of ['claude cli: timed out', 'claude cli: no output', 'claude cli: HTTP 500 — upstream', 'claude cli: usage limit reached — plan quota spent']) {
    assert.equal(isAuthExpiredNote(n), false, `must not match: ${n}`)
  }
})

await check('a 401 is STILL terminal in-call, so the adapter stops rather than re-spawning a doomed CLI', () => {
  // The two predicates deliberately overlap on 401: in-call it must stop retrying (nothing changes between
  // two spawns a second apart), while runCycle tests isAuthExpiredNote FIRST for the cross-cycle response.
  assert.equal(isTerminalApiNote(AUTH_NOTE), true, 'keep 401 terminal here — the retry loop depends on it')
})

await check('an expired sign-in defers the batch after ONE call (no wasted second spawn)', async () => {
  let calls = 0
  const run: ClaudeCliRunner = async () => { calls++; return { text: '', costUsd: 0, costUsdKnown: true, error: AUTH_NOTE } }
  const r = await triageBatchClaudeCli(items, opts, run)
  assert.equal(calls, 1, 'a dead sign-in will not fix itself between two spawns — do not retry in-call')
  assert.equal(r.ok, false, 'the batch DEFERS (unscored), never scored zero')
  assert.equal(r.byIndex.size, 0)
  assert.equal(r.costUsd, 0, 'a rejected call bills nothing')
  assert.equal(isAuthExpiredNote(r.note || ''), true, 'the note reaches the caller intact so it can classify')
})

console.log(`\n${passed} checks passed`)
