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

  const probe = path.join(repo, 'probe.ts')
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

console.log(`\n${passed} bridge-scheduler checks passed`)
