// Cycle guard (news/scheduler.ts): a slow/timed-out ingest cycle must be ABORTED and AWAITED to
// settlement — never abandoned — so a second cycle can't start while the first is still in-flight (which
// double-fetched every source and stomped module-level backoff state). No network/server.
// Run: npx tsx test/cycle-guard.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { runAbortableCycle, withCycleSignal } from '../src/news/scheduler'

let passed = 0
async function check(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

await check('runAbortableCycle: returns ONLY after the underlying run settles — never abandons it (the no-overlap guarantee)', async () => {
  // The old Promise.race resolved at the timeout while the run kept going → the caller released `running`
  // and the next tick started a 2nd concurrent cycle. The new guard must not resolve until the run is done.
  let settled = false
  let resolvedAt = 0
  const start = Date.now()
  const run = async (_signal: AbortSignal) => { await delay(60); settled = true; return 'done' } // outlives the 10ms guard
  const res = await runAbortableCycle(run, 10)
  resolvedAt = Date.now() - start
  assert.equal(res, 'done')
  assert.equal(settled, true, 'guard must hold until the run SETTLES — a 2nd cycle cannot start meanwhile')
  assert.ok(resolvedAt >= 55, `must wait for the ~60ms run, not return at the 10ms timeout (waited ${resolvedAt}ms)`)
})

await check('runAbortableCycle: aborts the run signal when the guard fires (cancels in-flight work)', async () => {
  let aborted = false
  const run = async (signal: AbortSignal) => { signal.addEventListener('abort', () => { aborted = true }); await delay(60); return 'x' }
  await runAbortableCycle(run, 10)
  assert.equal(aborted, true, 'an over-running cycle has its signal aborted so its fetches actually stop')
})

await check('runAbortableCycle: a run that finishes before the guard is left untouched (no spurious abort)', async () => {
  let aborted = false
  const run = async (signal: AbortSignal) => { signal.addEventListener('abort', () => { aborted = true }); return 'fast' }
  const res = await runAbortableCycle(run, 10_000)
  await delay(5)
  assert.equal(res, 'fast')
  assert.equal(aborted, false, 'a normal fast cycle is never aborted and leaks no timer (guard is cleared)')
})

await check('runAbortableCycle: a throwing run rejects AND clears the guard timer', async () => {
  await assert.rejects(runAbortableCycle(async () => { throw new Error('boom') }, 10_000), /boom/)
})

await check('withCycleSignal: aborting the cycle signal cancels the fetch (merged with the per-request signal)', async () => {
  let seen: AbortSignal | undefined
  const fakeFetch = (async (_url: any, init: any) => { seen = init.signal; return new Promise(() => {}) }) as unknown as typeof fetch
  const cycle = new AbortController()
  const wrapped = withCycleSignal(fakeFetch, cycle.signal)
  const req = new AbortController()
  void wrapped('https://x.test' as any, { signal: req.signal }).catch(() => {})
  await delay(1)
  assert.ok(seen && seen.aborted === false, 'fetch starts with a live (un-aborted) signal')
  cycle.abort()
  assert.equal(seen!.aborted, true, 'aborting the CYCLE signal aborts the merged fetch signal')
})

await check('withCycleSignal: a per-request abort still cancels the fetch (the request timeout is preserved)', async () => {
  let seen: AbortSignal | undefined
  const fakeFetch = (async (_url: any, init: any) => { seen = init.signal; return new Promise(() => {}) }) as unknown as typeof fetch
  const cycle = new AbortController()
  const req = new AbortController()
  void withCycleSignal(fakeFetch, cycle.signal)('https://x.test' as any, { signal: req.signal }).catch(() => {})
  await delay(1)
  req.abort()
  assert.equal(seen!.aborted, true, 'the adapter’s own per-request signal still aborts the merged signal')
})

console.log(`\n${passed} checks passed`)
