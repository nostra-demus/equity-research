// pipelines.ts (readPipelines) — the connector-registry read behind /api/pipelines. Real-repo
// assertions stay GENERIC (no connector id is ever named — the registry is zero-touch, §26); the
// fail-closed validation, tier clamp, SLA freshness boundaries, filename-not-mtime as_of, pool-less
// degradation, and the data_needs recommendations join run in SUBPROCESSES against tmpdir repos,
// because REPO_ROOT/CONNECTORS_DIR/DATA_DIR freeze from ENGINE_REPO_ROOT at config import (same
// constraint wire-manifest.test.ts lives with). Run: npx tsx test/pipelines.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readPipelines } from '../src/pipelines'
import { DATA_DIR } from '../src/config'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const here = path.dirname(fileURLToPath(import.meta.url))
const tmpdirs: string[] = []
const tmp = (prefix: string) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), prefix)); tmpdirs.push(d); return d }
const isoDaysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10)

const ACQ = new Set(['official_api', 'free_key_api', 'paid_api', 'scrape', 'manual'])
const CAD = new Set(['realtime', 'daily', 'weekly', 'monthly', 'event_driven'])

// ---- the REAL repo tree (generic assertions only — never a connector id) ----
const real = readPipelines(true)

check('discovers the committed connector manifests (>= 2) with zero drops', () => {
  assert.ok(real.pipelines.length >= 2, `expected >= 2 pipelines, got ${real.pipelines.length}`)
  const drops = real.widened.filter((w) => w.startsWith('dropped connector manifest'))
  assert.deepEqual(drops, [], `committed manifests must all validate:\n${drops.join('\n')}`)
})

check('every discovered pipeline is structurally valid (slug id, enums, SLA, output shape, clamped tier)', () => {
  for (const p of real.pipelines) {
    assert.match(p.id, /^[a-z0-9][a-z0-9-]*$/)
    assert.ok(ACQ.has(p.acquisition), `${p.id}: acquisition ${p.acquisition}`)
    assert.ok(CAD.has(p.cadence), `${p.id}: cadence ${p.cadence}`)
    assert.ok(p.stalenessSlaDays > 0)
    assert.ok(p.outputPath.startsWith('data/<SUBJECT>/external/'), `${p.id}: ${p.outputPath}`)
    assert.equal(path.posix.basename(p.outputPath).split('<as_of>').length, 2)
    // 5/7/9 are the §4 ceilings themselves (EXTERNAL_DATA.md); 10 is a sidecar declaring a MORE
    // conservative tier than its ceiling requires (allowed — e.g. a web-scrape connector under the
    // external_other ceiling of 9 self-labelling as the even-more-conservative tier-10 "reputable web
    // source, unverified" per CLAUDE.md §4). The clamp only ever pushes a tier DOWN to its ceiling; it
    // never rejects a sidecar being more conservative than required.
    assert.ok([5, 7, 9, 10].includes(p.tier), `${p.id}: served tier ${p.tier} outside the §4 ceilings`)
    assert.ok(p.subjects.length > 0 && p.statuses.length === p.subjects.length)
  }
})

check('real repo: poolAvailable and status honestly reflect whether data/ is actually readable', () => {
  // A bare checkout (CI, or any host without the Drive pool mounted at data/) has NO pool — that is
  // the correct, documented "honest degradation" (pipelines.ts top-of-file comment), not a failure.
  // Assert against the SAME probe readPipelines() uses, so this passes identically in CI (no data/)
  // and on a doer host with the Drive symlink mounted, instead of assuming either state.
  let dataReadable = true
  try { fs.readdirSync(DATA_DIR) } catch { dataReadable = false }
  assert.equal(real.poolAvailable, dataReadable)
  for (const p of real.pipelines) for (const s of p.statuses) {
    assert.equal(s.status === 'unknown', !dataReadable, `${p.id}/${s.subject}: status=${s.status}, dataReadable=${dataReadable}`)
  }
})

check('real repo: any widened entries are keep-and-label audit notes, never drops', () => {
  for (const w of real.widened) assert.ok(w.includes('kept, labelled unrecognized'), w)
})

check('real repo join: the ALUMINIUM COTR need is covered (helps), the SHFE need is recommended', () => {
  const helped = real.pipelines.flatMap((p) => p.helps)
  assert.ok(helped.some((h) => h.need_id === 'lme-cotr-fund-positioning' && h.subject === 'ALUMINIUM'),
    `no pipeline helps lme-cotr-fund-positioning; helps=${JSON.stringify(helped)}`)
  assert.ok(real.recommended.some((r) => r.key === 'commodity/ALUMINIUM/shfe-exchange-stock-current'),
    `recommended=${JSON.stringify(real.recommended.map((r) => r.key))}`)
})

// ---- tmpdir fixtures via subprocess probes ----
function writeConn(repo: string, id: string, over: Record<string, unknown> = {}, dirname?: string) {
  const dir = path.join(repo, '.claude', 'connectors', dirname ?? id)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'connector.json'), JSON.stringify({
    id, series: `series ${id}`, provider: 'prov', acquisition: 'official_api', source_type: 'paid_api',
    tier: 5, host_allowlist: ['x.test'], cadence: 'weekly', staleness_sla_days: 10, entry: 'fetch.py',
    verify: 'fetch.py --verify', output_path: `data/<SUBJECT>/external/${id}/series_<as_of>.json`,
    subjects: ['AAA'], satisfies: [], ...over,
  }))
}

function probeRead(repo: string): any {
  const probe = path.join(repo, 'probe.ts')
  const src = path.resolve(here, '..', 'src', 'pipelines')
  fs.writeFileSync(probe, [
    `import { readPipelines } from ${JSON.stringify(src)}`,
    `console.log(JSON.stringify(readPipelines(true)))`,
    '',
  ].join('\n'))
  const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
  const r = spawnSync(tsx, [probe], {
    encoding: 'utf8',
    env: { ...process.env, ENGINE_REPO_ROOT: repo, ENGINE_ACTIVITY_LOG_DISABLED: '1' },
  })
  assert.equal(r.status, 0, `probe subprocess failed: ${r.stderr || r.error}`)
  const lines = r.stdout.trim().split('\n')
  return JSON.parse(lines[lines.length - 1])
}

check('fixture: malformed + id-mismatch manifests drop with widened notes; the valid sibling still serves', () => {
  const repo = tmp('pipefix-')
  fs.mkdirSync(path.join(repo, 'data', 'AAA'), { recursive: true })
  writeConn(repo, 'good-conn')
  const badDir = path.join(repo, '.claude', 'connectors', 'badjson')
  fs.mkdirSync(badDir, { recursive: true })
  fs.writeFileSync(path.join(badDir, 'connector.json'), '{ not json')
  writeConn(repo, 'other-id', {}, 'mismatch')
  const out = probeRead(repo)
  assert.deepEqual(out.pipelines.map((p: any) => p.id), ['good-conn'])
  assert.ok(out.widened.some((w: string) => w.startsWith('dropped connector manifest badjson')))
  assert.ok(out.widened.some((w: string) => w.startsWith('dropped connector manifest mismatch')))
})

check('fixture: tier clamp — external_other declaring tier 5 serves 9 + tierCorrected', () => {
  const repo = tmp('pipeclamp-')
  fs.mkdirSync(path.join(repo, 'data', 'AAA'), { recursive: true })
  writeConn(repo, 'clamp-conn', { source_type: 'external_other', tier: 5, acquisition: 'scrape' })
  const p = probeRead(repo).pipelines[0]
  assert.equal(p.tier, 9)
  assert.equal(p.tierCorrected, true)
})

check('fixture: SLA boundaries — age==SLA fresh, age==SLA+1 stale, no file missing; as_of from filename not mtime', () => {
  const repo = tmp('pipesla-')
  writeConn(repo, 'fresh-conn')
  writeConn(repo, 'stale-conn')
  writeConn(repo, 'missing-conn')
  const dir = (id: string) => path.join(repo, 'data', 'AAA', 'external', id)
  fs.mkdirSync(dir('fresh-conn'), { recursive: true })
  fs.mkdirSync(dir('stale-conn'), { recursive: true })
  fs.mkdirSync(dir('missing-conn'), { recursive: true })
  fs.writeFileSync(path.join(dir('fresh-conn'), `series_${isoDaysAgo(10)}.json`), '{}')
  const staleFile = path.join(dir('stale-conn'), `series_${isoDaysAgo(11)}.json`)
  fs.writeFileSync(staleFile, '{}')
  fs.utimesSync(staleFile, new Date(), new Date()) // a NOW mtime must not rescue a stale filename date
  const out = probeRead(repo)
  const by = (id: string) => out.pipelines.find((p: any) => p.id === id).statuses[0]
  assert.equal(by('fresh-conn').status, 'fresh')
  assert.equal(by('stale-conn').status, 'stale')
  assert.equal(by('stale-conn').latestAsOf, isoDaysAgo(11))
  assert.equal(by('missing-conn').status, 'missing')
})

check('fixture: absent data/ root → poolAvailable false + status unknown (never a fabricated missing)', () => {
  const repo = tmp('pipenopool-')
  writeConn(repo, 'good-conn')
  const out = probeRead(repo)
  assert.equal(out.poolAvailable, false)
  assert.equal(out.pipelines[0].statuses[0].status, 'unknown')
})

check('fixture: recommendations join — covered need attaches to helps[], uncovered lands in recommended[]', () => {
  const repo = tmp('pipejoin-')
  fs.mkdirSync(path.join(repo, 'data', 'AAA'), { recursive: true })
  writeConn(repo, 'good-conn', { satisfies: ['covered-need'] })
  const swarmDir = path.join(repo, '.claude', 'agents', 'fixswarm')
  fs.mkdirSync(path.join(swarmDir, 'moda'), { recursive: true })
  fs.writeFileSync(path.join(swarmDir, 'SWARM.md'),
    '---\nid: fixswarm\nrun_root_template: fixswarm/runs/{X}\nplaceholder: X\nruns_root: fixswarm/runs\n---\n\nfixture swarm\n')
  fs.writeFileSync(path.join(swarmDir, 'moda', '99_moda-synthesis.md'),
    '---\nname: fixswarm-moda-synthesis\nlayer: 99\n---\n\nfixture module synthesis\n')
  const runDir = path.join(repo, 'fixswarm', 'runs', 'AAA')
  fs.mkdirSync(runDir, { recursive: true })
  const need = (need_id: string) => ({
    need_id, series: `series ${need_id}`, why_it_caps: 'caps the read', filing_required: false,
    entry_modules: ['moda'], suggested_source: { name: 'Fixture Body', acquisition: 'official_api' },
    tier: 5, cadence: 'weekly',
  })
  fs.writeFileSync(path.join(runDir, 'decision_record.json'),
    JSON.stringify({ data_needs: [need('covered-need'), need('uncovered-need')] }))
  const out = probeRead(repo)
  const good = out.pipelines.find((p: any) => p.id === 'good-conn')
  assert.deepEqual(good.helps.map((h: any) => [h.swarm, h.subject, h.need_id]),
    [['fixswarm', 'AAA', 'covered-need']])
  assert.deepEqual(good.helps[0].entry_modules, ['moda'], 'entry_modules must survive the roster filter')
  assert.deepEqual(out.recommended.map((r: any) => r.key), ['fixswarm/AAA/uncovered-need'])
})

for (const d of tmpdirs) fs.rmSync(d, { recursive: true, force: true })
console.log(`\npipelines.test.ts: ${passed} passed`)
