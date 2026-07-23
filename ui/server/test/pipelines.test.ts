// pipelines.ts (readPipelines) — the connector-registry read behind /api/pipelines. Real-repo
// assertions stay GENERIC — no connector id, SUBJECT, or need_id is ever named, because those live in
// research DATA the data lane pushes straight to main with no CI, and the registry is zero-touch (§26); the
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
import { listSwarms } from '../src/swarms'
import { swarmSubjects } from '../src/roster'
import { readDataNeeds } from '../src/data-needs'

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

// Independently re-derive the SET of eligible (non-filing) needs the join is obliged to place, from the
// SAME discovery functions readPipelines() joins against (listSwarms → swarmSubjects → readDataNeeds). It
// names no subject / need_id — it enumerates whatever the pool holds — but it lets the check below assert
// the join placed EVERY demanded need somewhere, so the real-repo block can no longer pass by iterating
// zero times over empty helps[]/recommended[]. The skip/continue posture mirrors the reader exactly, so
// the two derivations agree on the same tree with no pinned literal.
function eligibleNeedKeys(): Set<string> {
  const keys = new Set<string>()
  for (const swarm of listSwarms()) {
    let subjects: string[] = []
    try { subjects = swarmSubjects(swarm.id) } catch { continue }
    for (const subject of subjects) {
      let read
      try { read = readDataNeeds(swarm.id, subject) } catch { continue }
      if (!read) continue
      for (const need of read.needs) {
        if (need.filing_required) continue // reader skips statutory-filing needs — no connector satisfies them
        keys.add(`${swarm.id}/${read.subject}/${need.need_id}`)
      }
    }
  }
  return keys
}

check('real repo join: helps/recommended stay consistent with the registry (generic — names no subject or need)', () => {
  // NEVER pin a subject / need_id / connector id here. Those live in research DATA
  // (commodity/runs/**, analyses/**) which the data lane (§25) pushes straight to main with NO CI, and
  // a zero-touch connector ADD (§26) legitimately MOVES a need from recommended[] into helps[]. Pinning
  // them lets a routine data run — or the very extension path §26 mandates — turn the code lane red with
  // no review gate (the #286 failure mode). The join MECHANICS are pinned deterministically by the
  // 'recommendations join' tmpdir fixture below; this check asserts only the invariants that must hold
  // over WHATEVER the pool currently contains.
  const covers = (needId: string, subject: string) =>
    real.pipelines.some((p) => p.satisfies.includes(needId) && p.subjects.includes(subject))
  const helpKeys = new Set<string>()
  for (const p of real.pipelines) {
    for (const h of p.helps) {
      assert.ok(p.satisfies.includes(h.need_id), `${p.id}: helps '${h.need_id}' it does not satisfy`)
      assert.ok(p.subjects.includes(h.subject), `${p.id}: helps subject '${h.subject}' it does not serve`)
      assert.ok(h.swarm && h.series, `${p.id}: help '${h.need_id}' missing swarm/series`)
      assert.ok(Array.isArray(h.entry_modules), `${p.id}: help '${h.need_id}' entry_modules must be a list`)
      helpKeys.add(`${h.swarm}/${h.subject}/${h.need_id}`)
    }
  }
  const recKeys = new Set<string>()
  for (const r of real.recommended) {
    assert.equal(r.key, `${r.swarm}/${r.subject}/${r.need_id}`, 'recommended key must be swarm/subject/need_id')
    assert.ok(!helpKeys.has(r.key), `${r.key} is BOTH covered and recommended — the join must be exclusive`)
    assert.ok(!covers(r.need_id, r.subject), `${r.key} recommended although a discovered connector covers it`)
    recKeys.add(r.key)
  }
  // Completeness + non-vacuity. The two loops above validate only the entries that ARE present, so an
  // empty pool (no runs discovered) passes them WITHOUT exercising the join at all. Guard against that:
  // independently enumerate the eligible needs and require the join to place EACH exactly once across
  // helps[] ∪ recommended[] (exclusivity is already asserted above), with no phantom key demanded by no
  // run. A mutation that drops an eligible need (emits it NOWHERE) now fails 'placed'; one that emits a
  // key no run demands fails 'eligible'. When the tree holds no data_needs the check cannot run against
  // real demand — it then asserts the honest empty precondition (the join placed nothing) and logs the
  // skip, rather than masquerading as a passed join check. The deterministic mechanics stay pinned by the
  // tmpdir 'recommendations join' fixture below, which is the real guarantor.
  const eligible = eligibleNeedKeys()
  const placed = new Set<string>([...helpKeys, ...recKeys])
  if (eligible.size === 0) {
    assert.equal(placed.size, 0, `no run demands a need, yet the join placed: ${[...placed].join(', ')}`)
    console.log('      (real-repo join completeness not exercised — no data_needs in this tree; tmpdir fixture is the guarantor)')
  } else {
    for (const key of eligible) {
      assert.ok(placed.has(key), `eligible need ${key} was emitted in NEITHER helps[] nor recommended[] — the join dropped it`)
    }
    for (const key of placed) {
      assert.ok(eligible.has(key), `${key} is placed in helps[]/recommended[] but no discovered run demands it — phantom join output`)
    }
  }
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

check('fixture: external_other declaring tier 10 (more conservative than its ceiling) is NOT corrected', () => {
  const repo = tmp('pipeclamp10-')
  fs.mkdirSync(path.join(repo, 'data', 'AAA'), { recursive: true })
  writeConn(repo, 'conservative-conn', { source_type: 'external_other', tier: 10, acquisition: 'scrape' })
  const p = probeRead(repo).pipelines[0]
  assert.equal(p.tier, 10)
  assert.equal(p.tierCorrected, undefined)
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
