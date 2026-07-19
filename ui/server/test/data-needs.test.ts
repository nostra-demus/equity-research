// data-needs.ts (readDataNeeds) — the strict-write / tolerant-labelled-read split. Structural defects
// (tier / cadence / need_id / missing series or source name) still DROP; an off-enum
// suggested_source.acquisition alone is KEPT with the closed sentinel 'unrecognized' + a widened audit
// note — dropping the whole card silenced the demand signal the dock exists to surface (the committed
// ALUMINIUM record's two needs are the real-repo regression). Enum fixtures run in a SUBPROCESS against
// a tmpdir repo (REPO_ROOT freezes at config import — wire-manifest.test.ts constraint).
// Run: npx tsx test/data-needs.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readDataNeeds } from '../src/data-needs'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const here = path.dirname(fileURLToPath(import.meta.url))
const tmpdirs: string[] = []
const tmp = (prefix: string) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), prefix)); tmpdirs.push(d); return d }

// ---- the REAL repo record (the regression that motivated the fix) ----
check("real repo: ALUMINIUM's two needs surface, each kept with acquisition 'unrecognized'", () => {
  const read = readDataNeeds('commodity', 'ALUMINIUM')
  assert.ok(read, 'no ALUMINIUM decision_record read')
  const ids = read!.needs.map((n) => n.need_id).sort()
  assert.deepEqual(ids, ['lme-cotr-fund-positioning', 'shfe-exchange-stock-current'])
  for (const n of read!.needs) assert.equal(n.suggested_source.acquisition, 'unrecognized')
  const kept = read!.widened.filter((w) => w.includes('kept, labelled unrecognized'))
  assert.equal(kept.length, 2, `expected 2 keep-and-label notes, got: ${JSON.stringify(read!.widened)}`)
})

// ---- enum semantics against a tmpdir fixture swarm ----
check('fixture: valid passes untouched; off-enum acquisition kept+labelled; tier/cadence/need_id defects still drop', () => {
  const repo = tmp('dataneeds-')
  const swarmDir = path.join(repo, '.claude', 'agents', 'fixswarm')
  fs.mkdirSync(path.join(swarmDir, 'moda'), { recursive: true })
  fs.writeFileSync(path.join(swarmDir, 'SWARM.md'),
    '---\nid: fixswarm\nrun_root_template: fixswarm/runs/{X}\nplaceholder: X\n---\n\nfixture swarm\n')
  fs.writeFileSync(path.join(swarmDir, 'moda', '99_moda-synthesis.md'),
    '---\nname: fixswarm-moda-synthesis\nlayer: 99\n---\n\nfixture module synthesis\n')
  const runDir = path.join(repo, 'fixswarm', 'runs', 'AAA')
  fs.mkdirSync(runDir, { recursive: true })
  const base = {
    series: 'a series', why_it_caps: 'caps', filing_required: false, entry_modules: ['moda'],
    suggested_source: { name: 'Body', acquisition: 'official_api' }, tier: 5, cadence: 'weekly',
  }
  fs.writeFileSync(path.join(runDir, 'decision_record.json'), JSON.stringify({
    data_needs: [
      { ...base, need_id: 'valid-need' },
      { ...base, need_id: 'offenum-acq', suggested_source: { name: 'Body', acquisition: 'vendor_or_paid_feed' } },
      { ...base, need_id: 'bad-tier', tier: 3 },
      { ...base, need_id: 'bad-cadence', cadence: 'sometimes' },
      { ...base, need_id: 'BAD ID!' },
    ],
  }))
  const probe = path.join(repo, 'probe.ts')
  const src = path.resolve(here, '..', 'src', 'data-needs')
  fs.writeFileSync(probe, [
    `import { readDataNeeds } from ${JSON.stringify(src)}`,
    `console.log(JSON.stringify(readDataNeeds('fixswarm', 'AAA')))`,
    '',
  ].join('\n'))
  const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
  const r = spawnSync(tsx, [probe], {
    encoding: 'utf8',
    env: { ...process.env, ENGINE_REPO_ROOT: repo, ENGINE_ACTIVITY_LOG_DISABLED: '1' },
  })
  assert.equal(r.status, 0, `probe subprocess failed: ${r.stderr || r.error}`)
  const lines = r.stdout.trim().split('\n')
  const read = JSON.parse(lines[lines.length - 1])
  assert.ok(read, 'fixture record not read')

  const by = (id: string) => read.needs.find((n: any) => n.need_id === id)
  assert.equal(by('valid-need')?.suggested_source.acquisition, 'official_api', 'a valid enum passes untouched')
  assert.equal(by('offenum-acq')?.suggested_source.acquisition, 'unrecognized', 'off-enum acquisition kept + sentinel')
  assert.ok(read.widened.some((w: string) => w.includes("acquisition 'vendor_or_paid_feed'") && w.includes('kept')),
    `widened must audit the raw value: ${JSON.stringify(read.widened)}`)
  assert.equal(by('bad-tier'), undefined, 'off-enum tier still drops')
  assert.equal(by('bad-cadence'), undefined, 'off-enum cadence still drops')
  assert.ok(!read.needs.some((n: any) => n.need_id === 'BAD ID!'), 'bad need_id still drops')
  assert.equal(read.needs.length, 2)
})

for (const d of tmpdirs) fs.rmSync(d, { recursive: true, force: true })
console.log(`\ndata-needs.test.ts: ${passed} passed`)
