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

check('a damaged saved news position surfaces as cursorError instead of a false healthy watcher', () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-cursor-repo-'))
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-cursor-state-'))
  fs.mkdirSync(path.join(repo, 'data', 'AMZN'), { recursive: true })
  const bridgeDir = path.join(repo, '.claude', 'bridge')
  fs.mkdirSync(bridgeDir, { recursive: true })
  fs.writeFileSync(path.join(bridgeDir, 'company-news-bridge.json'), JSON.stringify({ subjects: ['AMZN'] }))
  fs.writeFileSync(path.join(stateDir, 'research-bridge-cursor.initialized'), 'research-bridge-cursor-v1\n')
  fs.writeFileSync(path.join(stateDir, 'research-bridge-cursor.json'), '{truncated')

  const probe = path.join(repo, 'cursor-probe.mts')
  const src = path.resolve(here, '..', 'src', 'bridge-scheduler')
  fs.writeFileSync(probe, [
    `import { getBridgeStatus, runBridgeSweep } from ${JSON.stringify(src)}`,
    `async function main() {`,
    `  try { await runBridgeSweep(async () => true) } catch {}`,
    `  console.log(JSON.stringify({ cursorError: getBridgeStatus().cursorError }))`,
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
  const out = JSON.parse(r.stdout.trim().split('\n').at(-1)!)
  assert.match(out.cursorError, /position is damaged/)
})

check('an older-news retention gap survives cursor advancement and restart until explicitly resolved', () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-gap-repo-'))
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-gap-state-'))
  fs.mkdirSync(path.join(repo, 'data', 'AMZN'), { recursive: true })
  const runDir = path.join(repo, 'analyses', 'AMZN_2026-08-14')
  fs.mkdirSync(runDir, { recursive: true })
  fs.writeFileSync(path.join(runDir, 'final_thesis.md'), '# Finished AMZN thesis')
  const bridgeDir = path.join(repo, '.claude', 'bridge')
  fs.mkdirSync(bridgeDir, { recursive: true })
  fs.writeFileSync(path.join(bridgeDir, 'company-news-bridge.json'), JSON.stringify({ subjects: ['AMZN'] }))

  const now = new Date()
  const oldCursor = new Date(now.getTime() - 20 * 24 * 60 * 60_000).toISOString()
  fs.writeFileSync(path.join(stateDir, 'research-bridge-cursor.json'), JSON.stringify({ AMZN: oldCursor }))
  const fhDir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(fhDir, { recursive: true })
  const item = {
    kind: 'item', ts: now.toISOString(), event_id: 'EVT-dddddddddddd',
    headline: 'Amazon files a material company update', url: 'https://example.com/amzn-gap', domain: 'example.com',
    source_name: 'Example', via: 'rss', region: 'OTHER', country: 'US', input_nature: 'news_headline',
    triage_score: 80, band: 'act', triage_reason: 'material', relevance: 'material', event_types: ['company'],
    issuer_linkage: 'direct', companies: [{ name: 'Amazon', ticker: 'AMZN' }], size_bucket: 'unknown',
    source_tier: 'wire', caution: false,
  }
  fs.writeFileSync(path.join(fhDir, `${now.toISOString().slice(0, 10)}_firehose.ndjson`), JSON.stringify(item) + '\n')

  const src = path.resolve(here, '..', 'src', 'bridge-scheduler')
  const firstProbe = path.join(repo, 'gap-first.mts')
  fs.writeFileSync(firstProbe, [
    `import { getBridgeStatus, runBridgeSweep } from ${JSON.stringify(src)}`,
    `async function main() {`,
    `  await runBridgeSweep(async () => true)`,
    `  const first = getBridgeStatus().retentionGaps`,
    // A second clean sweep advances from the new cursor and emits no new retentionGapDays. The known
    // uncovered period must remain active; ordinary cursor progress is not historical coverage.
    `  await runBridgeSweep(async () => true)`,
    `  console.log(JSON.stringify({ first, afterCleanSweep: getBridgeStatus().retentionGaps }))`,
    `}`,
    `void main()`,
    '',
  ].join('\n'))
  const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
  const env = { ...process.env, ENGINE_REPO_ROOT: repo, ENGINE_STATE_DIR: stateDir, ENGINE_ACTIVITY_LOG_DISABLED: '1' }
  const firstRun = spawnSync(tsx, [firstProbe], { encoding: 'utf8', env })
  assert.equal(firstRun.status, 0, `gap probe failed: ${firstRun.stderr || firstRun.error}`)
  const first = JSON.parse(firstRun.stdout.trim().split('\n').at(-1)!)
  assert.equal(first.first.length, 1)
  assert.equal(first.first[0].subject, 'AMZN')
  assert.ok(first.first[0].days > 0)
  assert.deepEqual(first.afterCleanSweep, first.first,
    'a later clean sweep does not erase the older period that was never read')

  const stateFile = path.join(stateDir, 'bridge-retention-gaps.json')
  assert.equal(fs.existsSync(stateFile), true, 'the active gap has a durable state file')
  assert.equal(JSON.parse(fs.readFileSync(stateFile, 'utf8')).records.AMZN.resolved_at, null)

  // A new process proves restart persistence. Only an explicit, auditable truth statement resolves it.
  const secondProbe = path.join(repo, 'gap-second.mts')
  fs.writeFileSync(secondProbe, [
    `import { getBridgeStatus, resolveBridgeRetentionGap } from ${JSON.stringify(src)}`,
    `const before = getBridgeStatus().retentionGaps`,
    `const resolved = resolveBridgeRetentionGap('AMZN', 'acknowledged')`,
    `console.log(JSON.stringify({ before, resolved, after: getBridgeStatus().retentionGaps }))`,
    '',
  ].join('\n'))
  const secondRun = spawnSync(tsx, [secondProbe], { encoding: 'utf8', env })
  assert.equal(secondRun.status, 0, `gap restart probe failed: ${secondRun.stderr || secondRun.error}`)
  const second = JSON.parse(secondRun.stdout.trim().split('\n').at(-1)!)
  assert.equal(second.before.length, 1, 'the active gap survives a process restart')
  assert.equal(second.resolved, true)
  assert.deepEqual(second.after, [])
  const saved = JSON.parse(fs.readFileSync(stateFile, 'utf8')).records.AMZN
  assert.equal(saved.resolution, 'acknowledged', 'resolution remains on disk as an audit record')
  assert.ok(saved.resolved_at)
})

check('a damaged durable older-news gap record is an explicit status error, never green by omission', () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-gap-bad-repo-'))
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-gap-bad-state-'))
  fs.mkdirSync(path.join(repo, 'data'), { recursive: true })
  fs.writeFileSync(path.join(stateDir, 'bridge-retention-gaps.initialized'), 'bridge-retention-gaps-v1\n')
  fs.writeFileSync(path.join(stateDir, 'bridge-retention-gaps.json'), '{truncated')
  const probe = path.join(repo, 'gap-bad.mts')
  const src = path.resolve(here, '..', 'src', 'bridge-scheduler')
  fs.writeFileSync(probe, [
    `import { getBridgeStatus } from ${JSON.stringify(src)}`,
    `console.log(JSON.stringify({ error: getBridgeStatus().retentionGapError }))`,
    '',
  ].join('\n'))
  const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
  const run = spawnSync(tsx, [probe], {
    encoding: 'utf8',
    env: { ...process.env, ENGINE_REPO_ROOT: repo, ENGINE_STATE_DIR: stateDir, ENGINE_ACTIVITY_LOG_DISABLED: '1' },
  })
  assert.equal(run.status, 0, `damaged gap probe failed: ${run.stderr || run.error}`)
  const out = JSON.parse(run.stdout.trim().split('\n').at(-1)!)
  assert.match(out.error, /cannot be read safely/i)
})

check('a gap-ledger commit failure keeps the old cursor and the next process Calls status needs attention', () => {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-gap-fail-repo-'))
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-sched-gap-fail-state-'))
  fs.mkdirSync(path.join(repo, 'data', 'AMZN'), { recursive: true })
  const runDir = path.join(repo, 'analyses', 'AMZN_2026-08-14')
  fs.mkdirSync(runDir, { recursive: true })
  fs.writeFileSync(path.join(runDir, 'final_thesis.md'), '# Finished AMZN thesis')
  const bridgeDir = path.join(repo, '.claude', 'bridge')
  fs.mkdirSync(bridgeDir, { recursive: true })
  fs.writeFileSync(path.join(bridgeDir, 'company-news-bridge.json'), JSON.stringify({ subjects: ['AMZN'] }))
  const now = new Date()
  const oldCursor = new Date(now.getTime() - 20 * 24 * 60 * 60_000).toISOString()
  fs.writeFileSync(path.join(stateDir, 'research-bridge-cursor.json'), JSON.stringify({ AMZN: oldCursor }))
  // Make only the gap journal target unwritable while leaving the cursor file itself writable. The
  // pre-cursor barrier must still refuse to advance the cursor.
  fs.mkdirSync(path.join(stateDir, 'bridge-retention-gaps.pending.json'))
  const fhDir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(fhDir, { recursive: true })
  const item = {
    kind: 'item', ts: now.toISOString(), event_id: 'EVT-eeeeeeeeeeee',
    headline: 'Amazon material filing during gap test', url: 'https://example.com/amzn-gap-fail', domain: 'example.com',
    source_name: 'Example', via: 'rss', region: 'OTHER', country: 'US', input_nature: 'news_headline',
    triage_score: 80, band: 'act', triage_reason: 'material', relevance: 'material', event_types: ['company'],
    issuer_linkage: 'direct', companies: [{ name: 'Amazon', ticker: 'AMZN' }], size_bucket: 'unknown',
    source_tier: 'wire', caution: false,
  }
  fs.writeFileSync(path.join(fhDir, `${now.toISOString().slice(0, 10)}_firehose.ndjson`), JSON.stringify(item) + '\n')
  const src = path.resolve(here, '..', 'src', 'bridge-scheduler')
  const firstProbe = path.join(repo, 'gap-fail-first.mts')
  fs.writeFileSync(firstProbe, [
    `import { getBridgeStatus, runBridgeSweep } from ${JSON.stringify(src)}`,
    `await runBridgeSweep(async () => true)`,
    `const s = getBridgeStatus()`,
    `console.log(JSON.stringify({ cursorError: s.cursorError, gapError: s.retentionGapError }))`,
    '',
  ].join('\n'))
  const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
  const env = {
    ...process.env, ENGINE_REPO_ROOT: repo, ENGINE_STATE_DIR: stateDir, ENGINE_ACTIVITY_LOG_DISABLED: '1',
    BRIDGE_MODE: 'stream',
  }
  const firstRun = spawnSync(tsx, [firstProbe], { encoding: 'utf8', env })
  assert.equal(firstRun.status, 0, `gap failure probe failed: ${firstRun.stderr || firstRun.error}`)
  const first = JSON.parse(firstRun.stdout.trim().split('\n').at(-1)!)
  assert.ok(first.cursorError)
  assert.ok(first.gapError)
  assert.equal(JSON.parse(fs.readFileSync(path.join(stateDir, 'research-bridge-cursor.json'), 'utf8')).AMZN, oldCursor,
    'the cursor remains before the unrecorded gap')

  const secondProbe = path.join(repo, 'gap-fail-second.mts')
  const callsStatus = path.resolve(here, '..', 'src', 'calls-automation-status')
  fs.writeFileSync(secondProbe, [
    `import { getBridgeStatus } from ${JSON.stringify(src)}`,
    `import { combineCallsAutomationStatus } from ${JSON.stringify(callsStatus)}`,
    `const part = { enabled:true, state:'watching' as const, message:'Watching.', last_checked_at:null, next_check_at:null, queued:0, running:0 }`,
    `const newsSource = { enabled:true, running:false, readOnly:false, lastCycleAt:null, schedulerActive:true, schedulerStartedAt:null, sourceLastCycleAt:new Date().toISOString(), sourceLastError:null, intervalMin:15 }`,
    `const status = combineCallsAutomationStatus({ intake:part, updates:part, reviews:part, news:getBridgeStatus(), newsSource })`,
    `console.log(JSON.stringify({ state: status.state, message: status.message }))`,
    '',
  ].join('\n'))
  const secondRun = spawnSync(tsx, [secondProbe], { encoding: 'utf8', env })
  assert.equal(secondRun.status, 0, `gap restart status probe failed: ${secondRun.stderr || secondRun.error}`)
  const second = JSON.parse(secondRun.stdout.trim().split('\n').at(-1)!)
  assert.equal(second.state, 'needs_attention')
  assert.match(second.message, /older-news check needs attention/i)
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
