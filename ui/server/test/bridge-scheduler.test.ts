// bridge-scheduler: the status endpoint's routed-note count cache. DATA_DIR/BRIDGE_DIR/STATE_DIR freeze
// from ENGINE_REPO_ROOT/ENGINE_STATE_DIR at config import (same constraint pipelines.test.ts and
// wire-manifest.test.ts live with), so this runs its assertions in a SUBPROCESS probe against a tmpdir
// repo — never the real data/ pool. Run: npx tsx test/bridge-scheduler.test.ts
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

let passed = 0
function check(name: string, fn: () => void): void {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.message || e}`); process.exitCode = 1 }
}

check('GET /api/bridge/status-style read (getBridgeStatus) caches routed-note counts with a short TTL, and a sweep that writes a note invalidates it', () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-repo-'))
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-state-'))
  const dataDir = path.join(repo, 'data')
  fs.mkdirSync(path.join(dataDir, 'AMZN'), { recursive: true })
  const runDir = path.join(repo, 'analyses', 'AMZN_2026-08-14')
  fs.mkdirSync(runDir, { recursive: true })
  fs.writeFileSync(path.join(runDir, 'final_thesis.md'), '# Finished AMZN thesis')
  const bridgeDir = path.join(repo, '.claude', 'bridge')
  fs.mkdirSync(bridgeDir, { recursive: true })
  fs.writeFileSync(path.join(bridgeDir, 'company-news-bridge.json'), JSON.stringify({ subjects: ['AMZN'] }))

  // One eligible item, dated TODAY (runBridgeSweep does not inject `now` — it always reads the real
  // clock), so the sweep's default backfill window picks it up.
  const today = new Date().toISOString().slice(0, 10)
  const fhDir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(fhDir, { recursive: true })
  const eligible = {
    kind: 'item', ts: new Date().toISOString(), event_id: 'EVT-aaaaaaaaaaaa',
    headline: 'Amazon opens a new fulfillment center', url: 'https://example.com/amzn', domain: 'example.com',
    source_name: 'Example', via: 'rss', region: 'OTHER', country: 'US', input_nature: 'news_headline',
    triage_score: 80, band: 'act', triage_reason: 'material', relevance: 'material', event_types: ['company'],
    issuer_linkage: 'direct', companies: [{ name: 'Amazon', ticker: 'AMZN' }], size_bucket: 'unknown',
    source_tier: 'wire', caution: false,
  }
  fs.writeFileSync(path.join(fhDir, `${today}_firehose.ndjson`), JSON.stringify(eligible) + '\n')

  const probe = path.join(repo, 'probe.mts')
  const src = path.resolve(here, '..', 'src', 'bridge-scheduler')
  fs.writeFileSync(probe, [
    `import { getBridgeStatus, runBridgeSweep } from ${JSON.stringify(src)}`,
    `import fs from 'node:fs'`,
    `import path from 'node:path'`,
    `const dataDir = ${JSON.stringify(dataDir)}`,
    `async function main() {`,
    `  const out: any = {}`,
    `  out.initial = getBridgeStatus().subjects.find((s: any) => s.subject === 'AMZN')?.notes ?? -1`,
    // simulate a MANUAL send landing directly on disk, bypassing the sweep — the cache must not see it yet
    `  fs.writeFileSync(path.join(dataDir, 'AMZN', 'screener_event_EVT-bbbbbbbbbbbb.md'), '# manual note')`,
    `  out.stillCached = getBridgeStatus().subjects.find((s: any) => s.subject === 'AMZN')?.notes ?? -1`,
    // now run a real sweep — it should write the eligible firehose item's note too, and (written > 0)
    // must invalidate the cache so the NEXT status call does a fresh scan picking up BOTH notes
    `  await runBridgeSweep(async () => false)`,
    `  out.afterSweep = getBridgeStatus().subjects.find((s: any) => s.subject === 'AMZN')?.notes ?? -1`,
    `  console.log(JSON.stringify(out))`,
    `}`,
    `void main()`,
    '',
  ].join('\n'))

  const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
  const r = spawnSync(tsx, [probe], {
    encoding: 'utf8',
    env: { ...process.env, ENGINE_REPO_ROOT: repo, ENGINE_STATE_DIR: stateDir, ENGINE_ACTIVITY_LOG_DISABLED: '1' },
  })
  assert.equal(r.status, 0, `probe subprocess failed: ${r.stderr || r.error}`)
  const lines = r.stdout.trim().split('\n')
  const out = JSON.parse(lines[lines.length - 1])

  assert.equal(out.initial, 0, 'empty pool reads zero on the first (cache-establishing) call')
  assert.equal(out.stillCached, 0, 'a note written OUTSIDE a sweep is masked until the TTL cache expires — proves caching is active, not a rescan every call')
  assert.equal(out.afterSweep, 2, 'a sweep that writes a note invalidates the cache — the next call rescans and sees BOTH the manual note and the swept one')
})

check('a follow-up analysis that fails to launch (busy/capacity) is retried on the NEXT sweep, not lost when the note stops being fresh', () => {
  // Codex #359 r3674305113: sweepOnce only reports a subject in subjectsWithFreshNotes for the window that
  // actually wrote its note. If runBridgeSweep's launchAnalysis call for that subject returns false (busy)
  // or throws (capacity/CLI), and the loop just moves on, the NEXT sweep sees that same note as a duplicate
  // (it's already on disk) — so the subject is never in subjectsWithFreshNotes again, and the advisory
  // analysis that was owed is lost forever. It must instead be retried on the next sweep.
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-retry-repo-'))
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-retry-state-'))
  const dataDir = path.join(repo, 'data')
  fs.mkdirSync(path.join(dataDir, 'AMZN'), { recursive: true })
  const runDir = path.join(repo, 'analyses', 'AMZN_2026-08-14')
  fs.mkdirSync(runDir, { recursive: true })
  fs.writeFileSync(path.join(runDir, 'final_thesis.md'), '# Finished AMZN thesis')
  const bridgeDir = path.join(repo, '.claude', 'bridge')
  fs.mkdirSync(bridgeDir, { recursive: true })
  fs.writeFileSync(path.join(bridgeDir, 'company-news-bridge.json'), JSON.stringify({ subjects: ['AMZN'] }))

  const today = new Date().toISOString().slice(0, 10)
  const fhDir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(fhDir, { recursive: true })
  const eligible = {
    kind: 'item', ts: new Date().toISOString(), event_id: 'EVT-cccccccccccc',
    headline: 'Amazon announces a share buyback program', url: 'https://example.com/amzn2', domain: 'example.com',
    source_name: 'Example', via: 'rss', region: 'OTHER', country: 'US', input_nature: 'news_headline',
    triage_score: 80, band: 'act', triage_reason: 'material', relevance: 'material', event_types: ['company'],
    issuer_linkage: 'direct', companies: [{ name: 'Amazon', ticker: 'AMZN' }], size_bucket: 'unknown',
    source_tier: 'wire', caution: false,
  }
  fs.writeFileSync(path.join(fhDir, `${today}_firehose.ndjson`), JSON.stringify(eligible) + '\n')

  const probe = path.join(repo, 'probe2.mts')
  const src = path.resolve(here, '..', 'src', 'bridge-scheduler')
  fs.writeFileSync(probe, [
    `import { runBridgeSweep } from ${JSON.stringify(src)}`,
    `async function main() {`,
    `  const out: any = {}`,
    // sweep 1: the note is fresh, but the launch fails (simulates a busy run) — must NOT be dropped
    `  await runBridgeSweep(async () => { throw new Error('busy') })`,
    // sweep 2: nothing new landed (the note is now a duplicate), but the PRIOR failed launch must retry
    `  let launched2 = 0`,
    `  await runBridgeSweep(async () => { launched2++; return true })`,
    `  out.launched2 = launched2`,
    // sweep 3: already satisfied — must not launch again
    `  let launched3 = 0`,
    `  await runBridgeSweep(async () => { launched3++; return true })`,
    `  out.launched3 = launched3`,
    `  console.log(JSON.stringify(out))`,
    `}`,
    `void main()`,
    '',
  ].join('\n'))

  const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
  const r = spawnSync(tsx, [probe], {
    encoding: 'utf8',
    env: { ...process.env, ENGINE_REPO_ROOT: repo, ENGINE_STATE_DIR: stateDir, ENGINE_ACTIVITY_LOG_DISABLED: '1' },
  })
  assert.equal(r.status, 0, `probe subprocess failed: ${r.stderr || r.error}`)
  const lines = r.stdout.trim().split('\n')
  const out = JSON.parse(lines[lines.length - 1])

  assert.equal(out.launched2, 1, 'the previously-failed launch is retried on the next sweep, even though the note is no longer fresh')
  assert.equal(out.launched3, 0, 'a subject with nothing pending and nothing fresh does not launch again')
})

check('a malformed manifest surfaces as manifestError, not a silent healthy zero-subject sweep', () => {
  // Codex #359, "Surface an unreadable bridge manifest as a configuration error"
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-manifest-repo-'))
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-manifest-state-'))
  const bridgeDir = path.join(repo, '.claude', 'bridge')
  fs.mkdirSync(bridgeDir, { recursive: true })
  fs.mkdirSync(path.join(repo, 'data'), { recursive: true })
  fs.writeFileSync(path.join(bridgeDir, 'company-news-bridge.json'), '{ this is not valid json')

  const probe = path.join(repo, 'probe3.mts')
  const src = path.resolve(here, '..', 'src', 'bridge-scheduler')
  fs.writeFileSync(probe, [
    `import { getBridgeStatus, runBridgeSweep } from ${JSON.stringify(src)}`,
    `async function main() {`,
    `  await runBridgeSweep(async () => true)`,
    `  console.log(JSON.stringify({ manifestError: getBridgeStatus().manifestError }))`,
    `}`,
    `void main()`,
    '',
  ].join('\n'))

  const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
  const r = spawnSync(tsx, [probe], {
    encoding: 'utf8',
    env: { ...process.env, ENGINE_REPO_ROOT: repo, ENGINE_STATE_DIR: stateDir, ENGINE_ACTIVITY_LOG_DISABLED: '1' },
  })
  assert.equal(r.status, 0, `probe subprocess failed: ${r.stderr || r.error}`)
  const lines = r.stdout.trim().split('\n')
  const out = JSON.parse(lines[lines.length - 1])
  assert.ok(out.manifestError, 'a malformed manifest is reported as a real config error, not swallowed into an empty enabled set')
})

check('getBridgeStatus reports running:true when BRIDGE_MODE=stream, even with the batch timer never started', () => {
  // Codex #359, "Report stream mode as active without the legacy flag": running used to mean ONLY "is the
  // batch scheduler's own timer ticking", so a pure stream-mode deployment (per-item routing, no schedule)
  // always reported running:false / the chip said "off" while notes were actively being routed.
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-stream-repo-'))
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-stream-state-'))
  fs.mkdirSync(path.join(repo, 'data'), { recursive: true })

  const probe = path.join(repo, 'probe4.mts')
  const src = path.resolve(here, '..', 'src', 'bridge-scheduler')
  fs.writeFileSync(probe, [
    `import { getBridgeStatus } from ${JSON.stringify(src)}`,
    `console.log(JSON.stringify({ running: getBridgeStatus().running, mode: getBridgeStatus().mode }))`,
    '',
  ].join('\n'))

  const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
  const r = spawnSync(tsx, [probe], {
    encoding: 'utf8',
    env: {
      ...process.env, ENGINE_REPO_ROOT: repo, ENGINE_STATE_DIR: stateDir, ENGINE_ACTIVITY_LOG_DISABLED: '1',
      BRIDGE_MODE: 'stream',
    },
  })
  assert.equal(r.status, 0, `probe subprocess failed: ${r.stderr || r.error}`)
  const lines = r.stdout.trim().split('\n')
  const out = JSON.parse(lines[lines.length - 1])
  assert.equal(out.mode, 'stream')
  assert.equal(out.running, true, 'stream mode alone must report running:true — the batch timer was never even started')
})

console.log(`\n${passed} bridge-scheduler checks passed`)
