import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { cycleHasDurableFeedCommit, persistedDeferReasons } from '../src/news/scheduler'
import type { CycleSummary } from '../src/news/types'

function cycle(fields: Partial<CycleSummary> & Record<string, unknown> = {}): CycleSummary {
  return {
    ts: '2026-08-21T12:00:00Z', ok: true, fetched: 0, candidates: 0,
    picked: 0, watched: 0, dropped: 0, inboxed: 0, groq_requests: 0, groq_tokens: 0,
    ...fields,
  }
}

assert.deepEqual(
  persistedDeferReasons(cycle({
    defer_reason: 'feed-cap',
    defer_reasons: ['storage-emergency', 'feed-cap', 'storage-emergency'],
  })),
  ['storage-emergency', 'feed-cap'],
  'the additive cause set stays ordered and deduplicated',
)

assert.deepEqual(
  persistedDeferReasons(cycle({ defer_reason: 'feed-write-failed', defer_reasons: { length: 1 } as any })),
  ['feed-write-failed'],
  'an array-like persisted object cannot reach Array.prototype consumers',
)

assert.deepEqual(
  persistedDeferReasons(cycle({ defer_reason: 'feed-cap', defer_reasons: 'storage-emergency' as any })),
  ['feed-cap'],
  'a persisted string is not treated as the complete reason list',
)

assert.deepEqual(
  persistedDeferReasons(cycle({
    defer_reason: 'unknown-primary' as any,
    defer_reasons: ['feed-cap', null, 'unknown-additive', {}, 'feed-cap'] as any,
  })),
  ['feed-cap'],
  'only allowlisted persisted values leave the server',
)

assert.equal(cycleHasDurableFeedCommit(cycle({ feed_commit_version: 1 })), true)
assert.equal(cycleHasDurableFeedCommit(cycle()), false, 'legacy pick/watch/drop counts do not prove feed durability')

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'scheduler-diagnostics-shape-'))
const state = path.join(root, '.state')
const inbox = path.join(root, 'screener', 'inbox')
fs.mkdirSync(state, { recursive: true })
fs.mkdirSync(inbox, { recursive: true })
const now = new Date()
const date = now.toISOString().slice(0, 10)
const started = new Date(now.getTime() - 30_000).toISOString()
fs.writeFileSync(path.join(state, 'news-deferred.json'), `${JSON.stringify([{
  event_id: 'EVT-waiting', headline: 'Waiting diagnostic fixture', url: 'https://reuters.com/waiting',
}])}\n`)
fs.writeFileSync(path.join(state, 'news-pipeline-flow-gaps.json'), `${JSON.stringify({
  v: 1, starts: [new Date(now.getTime() - 10_000).toISOString()],
})}\n`)
fs.writeFileSync(path.join(inbox, `${date}_firehose.ndjson`), `${JSON.stringify({
  kind: 'cycle_summary', ts: started, completed_at: started, ok: true, fetched: 0, candidates: 1,
  picked: 0, watched: 0, dropped: 0, inboxed: 0, groq_requests: 0, groq_tokens: 0,
  feed_commit_version: 1, defer_reason: 'feed-cap', defer_reasons: { length: 1 },
})}\n`)

const childCode = `import('./src/news/scheduler.ts').then((scheduler) => {
  const result = scheduler.getNewsDiagnostics({ omniRouteHomeDir: ${JSON.stringify(root)} })
  const status = scheduler.getNewsStatus()
  process.stdout.write('RESULT=' + JSON.stringify({
    defer: result.defer,
    lastCycle: result.lastCycle,
    today: result.today,
    statusToday: status.today,
  }) + '\\n')
})`
const childEnv = {
  ...process.env,
  NOSTRA_ENGINE_CONFIG_DIR: path.join(root, 'missing-config'),
  ENGINE_REPO_ROOT: root,
  ENGINE_STATE_DIR: state,
  NEWS_INGEST_ENABLED: '0',
  IDEAS_ENABLED: '0',
  THEMES_ENABLED: '0',
}
for (const key of [
  'GROQ_API_KEY', 'CEREBRAS_API_KEY', 'MISTRAL_API_KEY', 'OPENROUTER_API_KEY', 'NVIDIA_API_KEY', 'GEMINI_API_KEY',
  'NEWS_LOCAL_ENABLED', 'NEWS_CEREBRAS_ENABLED', 'NEWS_MISTRAL_ENABLED', 'NEWS_OPENROUTER_ENABLED',
  'NEWS_NVIDIA_ENABLED', 'NEWS_GEMINI_ENABLED', 'NEWS_ANTHROPIC_FALLBACK_ENABLED', 'NEWS_ANTHROPIC_FALLBACK_API_KEY',
]) delete childEnv[key]

const child = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', childCode], {
  cwd: process.cwd(), env: childEnv, encoding: 'utf8', timeout: 15_000,
})
assert.equal(child.status, 0, child.stderr)
const resultLine = child.stdout.split(/\r?\n/).find((line) => line.startsWith('RESULT='))
assert.ok(resultLine, child.stdout)
const result = JSON.parse(resultLine.slice('RESULT='.length))
assert.deepEqual(result.defer.reasons, ['feed-cap'], 'the endpoint emits a safe scalar fallback')
assert.equal(result.defer.reason, 'feed-cap')
assert.equal(result.lastCycle.durablyCommitted, true)
assert.equal(result.today.durablyCommitted, true)
assert.equal(result.today.incompleteCycles, 1, 'the diagnostics day carries missing-summary debt beyond the rate object')
assert.equal(result.today.totalsLowerBound, true, 'summary-derived daily counters cannot appear complete')
assert.equal(result.today.historyStatus, 'complete', 'the readable current partition is distinguished from its missing-summary debt')
assert.equal(result.today.corruptCycleRows, 0)
assert.deepEqual(result.statusToday, result.today, '/api/news/status carries the same durability and missing-summary proof as diagnostics')
fs.rmSync(root, { recursive: true, force: true })

console.log('scheduler diagnostics shape checks passed')
