// Per-source health for the cockpit's "Sources" panel. Pins the recovery contract: a feed that errored
// once and then fetched fine must NOT keep showing a stale error (the reported bug — one network blip left
// every recovered feed reading "fetch failed" under the Healthy tab). Covers both layers: recordRssHealth
// clearing the error on recovery, and buildSourcesReport gating the surfaced error to the latest fetch.
// Run: npx tsx test/source-health.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { recordRssHealth, buildSourcesReport, type FetchStatus } from '../src/news/source-health'

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

const tmp = (p: string) => fs.mkdtempSync(path.join(os.tmpdir(), p))
const readHealth = (dir: string) => JSON.parse(fs.readFileSync(path.join(dir, 'news-source-health.json'), 'utf8'))
const outcome = (status: FetchStatus, items: number, note?: string) =>
  new Map([['Feed A', { status, items, note }]])

await check('recordRssHealth: a recovered fetch clears the prior error (status ok)', () => {
  const dir = tmp('srch-')
  recordRssHealth(dir, outcome('error', 0, 'fetch failed'), '2026-06-16T13:10:13Z')
  let h = readHealth(dir)['Feed A']
  assert.equal(h.status, 'error')
  assert.equal(h.lastError, 'fetch failed')
  assert.equal(h.lastErrAt, '2026-06-16T13:10:13Z')

  // next cycle: the feed fetches fine again → the error must be gone, not pinned forever
  recordRssHealth(dir, outcome('ok', 3), '2026-06-16T13:15:18Z')
  h = readHealth(dir)['Feed A']
  assert.equal(h.status, 'ok')
  assert.equal(h.lastError, undefined, 'lastError must be cleared on recovery')
  assert.equal(h.lastErrAt, undefined, 'lastErrAt must be cleared on recovery')
  assert.equal(h.lastOkAt, '2026-06-16T13:15:18Z')
  assert.equal(h.lastItemsAt, '2026-06-16T13:15:18Z')
})

await check('recordRssHealth: 304 (unchanged) and 200-empty also count as recovery and clear the error', () => {
  for (const recoveryStatus of ['unchanged', 'empty'] as FetchStatus[]) {
    const dir = tmp('srch-')
    recordRssHealth(dir, outcome('error', 0, 'timeout'), '2026-06-16T13:10:13Z')
    recordRssHealth(dir, outcome(recoveryStatus, 0), '2026-06-16T13:15:18Z')
    const h = readHealth(dir)['Feed A']
    assert.equal(h.status, recoveryStatus)
    assert.equal(h.lastError, undefined, `lastError must clear on ${recoveryStatus}`)
    assert.equal(h.lastErrAt, undefined, `lastErrAt must clear on ${recoveryStatus}`)
  }
})

await check('recordRssHealth: a feed that stays in error keeps its error note', () => {
  const dir = tmp('srch-')
  recordRssHealth(dir, outcome('error', 0, 'HTTP 503'), '2026-06-16T13:10:13Z')
  recordRssHealth(dir, outcome('error', 0, 'HTTP 503'), '2026-06-16T13:15:18Z')
  const h = readHealth(dir)['Feed A']
  assert.equal(h.status, 'error')
  assert.equal(h.lastError, 'HTTP 503')
  assert.equal(h.lastErrAt, '2026-06-16T13:15:18Z')
})

// buildSourcesReport must never surface a stale error on a recovered feed, even if a health file written
// BEFORE the recordRssHealth fix still carries one (the report is recomputed fresh on every request).
await check('buildSourcesReport: stale error hidden on healthy/quiet; current error shown only on failing', () => {
  const repoRoot = tmp('srch-repo-')
  const stateDir = tmp('srch-state-')
  fs.mkdirSync(path.join(repoRoot, 'frameworks', 'screener'), { recursive: true })
  fs.writeFileSync(
    path.join(repoRoot, 'frameworks', 'screener', 'rss_feeds.json'),
    JSON.stringify({
      feeds: [
        { url: 'https://a.example/rss', source_name: 'Recovered Healthy Feed' },
        { url: 'https://b.example/rss', source_name: 'Genuinely Failing Feed' },
        { url: 'https://c.example/rss', source_name: 'Recovered Quiet Feed' },
      ],
    }),
  )
  // simulate the live bug: every feed carries a stale "fetch failed" from one bad cycle (errAt 13:10),
  // but two of them recovered the next cycle (okAt 13:15). Only the middle one is still erroring.
  fs.writeFileSync(
    path.join(stateDir, 'news-source-health.json'),
    JSON.stringify({
      'Recovered Healthy Feed': { status: 'ok', items: 4, at: '2026-06-16T13:15:18Z', lastOkAt: '2026-06-16T13:15:18Z', lastItemsAt: '2026-06-16T13:15:18Z', lastErrAt: '2026-06-16T13:10:13Z', lastError: 'fetch failed' },
      'Genuinely Failing Feed': { status: 'error', items: 0, at: '2026-06-16T13:15:18Z', lastErrAt: '2026-06-16T13:15:18Z', lastError: 'fetch failed' },
      'Recovered Quiet Feed': { status: 'empty', items: 0, at: '2026-06-16T13:15:18Z', lastOkAt: '2026-06-16T13:15:18Z', lastErrAt: '2026-06-16T13:10:13Z', lastError: 'fetch failed' },
    }),
  )

  const report = buildSourcesReport(repoRoot, stateDir, { now: () => new Date('2026-06-16T13:20:00Z') })
  const row = (name: string) => report.sources.find((r) => r.name === name)!

  const healthy = row('Recovered Healthy Feed')
  assert.equal(healthy.health, 'healthy')
  assert.equal(healthy.last_error, null, 'a recovered (healthy) feed must not show a stale error')

  const quiet = row('Recovered Quiet Feed')
  assert.equal(quiet.health, 'quiet')
  assert.equal(quiet.last_error, null, 'a recovered (quiet) feed must not show a stale error')

  const failing = row('Genuinely Failing Feed')
  assert.equal(failing.health, 'failing')
  assert.equal(failing.last_error, 'fetch failed', 'a genuinely failing feed must still show why')

  // exactly one feed is actually broken — the panel must not over-report failures
  assert.equal(report.counts.failing, 1)
})

console.log(`\n${passed} source-health checks passed`)
