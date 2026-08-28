// listResumableRuns() — the disk-truth detector behind the manual "Resume run" affordance. It must
// surface an interrupted run (final deliverable missing) at BOTH full and module granularity, while
// excluding a finished run, a superseded prior run, and a currently-live subject. A saved partial remains
// resumable after midnight. Isolated in a temp repo so a fake 2-module research graph + fixture run
// folders drive it without touching the real analyses/. Run: npx tsx test/resumable.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// A throwaway repo root, wired BEFORE importing config (which reads it at module load).
const REPO = fs.mkdtempSync(path.join(os.tmpdir(), 'resumable-'))
process.env.ENGINE_REPO_ROOT = REPO

function write(rel: string, body: string) {
  const abs = path.join(REPO, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, body)
}
const fm = (name: string, layer: number, extra = '') => `---\nname: ${name}\nlayer: ${layer}\n${extra}---\n# ${name}\nbody\n`

// A minimal 2-module research graph: `alpha` (one specialist + its synthesis) and `beta` (synthesis only).
write('.claude/agents/alpha/01_alpha-thing.md', fm('alpha-thing', 1))
write('.claude/agents/alpha/99_alpha-synthesis.md', fm('alpha-synthesis', 99, 'depends_on: []\n'))
write('.claude/agents/beta/99_beta-synthesis.md', fm('beta-synthesis', 99, 'depends_on: []\n'))
write('.claude/agents/commodity/SWARM.md', `---
id: commodity
label: Commodities
unit: commodity
layout: constellation
command_ns: commodity
run_root_template: commodity/runs/{COMMODITY}
placeholder: COMMODITY
runs_root: commodity/runs
decision_artifacts: [decision_record.json]
---
# Commodity
`)
write('.claude/agents/commodity/thesis/99_thesis-synthesis.md', fm('thesis-synthesis', 99, 'depends_on: []\n'))

// Deterministic dated folders around today.
const d = new Date()
const TODAY = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const y = new Date(d.getTime() - 86_400_000)
const YESTERDAY = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`

// ACME (today): beta finished, alpha half-done (a specialist wrote, no synthesis), no final thesis → resumable.
write(`analyses/ACME_${TODAY}/beta/99_beta-synthesis.md`, '# beta synthesis\nVerdict: fine\n')
write(`analyses/ACME_${TODAY}/alpha/01_alpha-thing.md`, '# alpha thing\nVerdict: partial\n')
// DONE (today): a finished run (final_thesis present) → NOT resumable.
write(`analyses/DONE_${TODAY}/final_thesis.md`, '# thesis\n')
write(`analyses/DONE_${TODAY}/alpha/99_alpha-synthesis.md`, '# a\n')
// OLD (yesterday): half-done and still the newest run for OLD → resumable after midnight.
write(`analyses/OLD_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
// SUPERSEDED: yesterday's partial has a newer completed run → the old partial must stay hidden.
write(`analyses/SUPERSEDED_${YESTERDAY}/alpha/01_alpha-thing.md`, '# old partial\n')
write(`analyses/SUPERSEDED_${TODAY}/final_thesis.md`, '# newer complete thesis\n')
// RECENTPARTIAL: an older completed run followed by a newer partial → offer the newer saved work.
write(`analyses/RECENTPARTIAL_${YESTERDAY}/final_thesis.md`, '# old complete thesis\n')
write(`analyses/RECENTPARTIAL_${TODAY}/alpha/01_alpha-thing.md`, '# newest partial\n')
// ABRT (today): half-done, deliberately aborted (.aborted marker from a user Cancel) → STILL manually
// resumable. Cancel = pause: finished work is kept and Resume is the user's explicit choice to continue.
// (The AUTO supervisor stays conservative and never touches .aborted — see research-resume.test.ts.)
write(`analyses/ABRT_${TODAY}/alpha/01_alpha-thing.md`, '# a\n')
write(`analyses/ABRT_${TODAY}/.aborted`, JSON.stringify({ reason: 'cancelled' }))
// DYING (today): half-done + aborted, but its cancelled run's child has NOT exited yet → NOT resumable
// until the child dies. Cancel() flips status out of IN_FLIGHT synchronously but only SIGTERMs the child;
// offering resume before it exits would let a second engine write the SAME folder (the double-write race).
write(`analyses/DYING_${TODAY}/alpha/01_alpha-thing.md`, '# a\n')
write(`analyses/DYING_${TODAY}/.aborted`, JSON.stringify({ reason: 'cancelled' }))
// GOLD: an old standing decision remains, but a newer provider attempt hit quota. The interruption
// marker is the current-epoch truth and must keep the stable root resumable.
write('commodity/runs/GOLD/decision_record.json', '{"action":"Hold","old":true}\n')
write('commodity/runs/GOLD/thesis/01_partial.md', '# retained partial refresh\n')
write('commodity/runs/GOLD/.interrupted', JSON.stringify({ reason: 'out_of_credits', resetsAt: 4102444800 }))

const { listResumableRuns } = await import('../src/resumable')
const { createRun, setActiveSubjectRun } = await import('../src/registry')

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('an interrupted run surfaces a FULL entry — modules-done counted, subject + folder carried', () => {
  const full = listResumableRuns().find((r) => r.subject === 'ACME' && r.kind === 'full')
  assert.ok(full, 'no full entry for the interrupted ACME run')
  assert.equal(full!.swarm, 'research')
  assert.equal(full!.runRoot, `analyses/ACME_${TODAY}`)
  assert.equal(full!.unit, 'module')
  assert.equal(full!.doneCount, 1) // beta finished, alpha not
  assert.equal(full!.totalCount, 2)
})

check('the half-done module surfaces its own MODULE entry (agent-level resume target)', () => {
  const mod = listResumableRuns().find((r) => r.subject === 'ACME' && r.kind === 'module')
  assert.ok(mod, 'no module entry for the half-done alpha module')
  assert.equal(mod!.module, 'alpha')
  assert.equal(mod!.unit, 'agent')
  assert.equal(mod!.doneCount, 1) // the one specialist that wrote
})

check('a FINISHED module (beta) does NOT get a module entry', () => {
  assert.equal(listResumableRuns().some((r) => r.subject === 'ACME' && r.kind === 'module' && r.module === 'beta'), false)
})

check('a finished run (final_thesis present) is excluded', () => {
  assert.equal(listResumableRuns().some((r) => r.subject === 'DONE'), false)
})

check('a prior-day partial remains resumable after midnight', () => {
  const old = listResumableRuns().find((r) => r.subject === 'OLD' && r.kind === 'full')
  assert.ok(old)
  assert.equal(old!.runRoot, `analyses/OLD_${YESTERDAY}`)
})

check('a newer completed run supersedes an older partial for the same company', () => {
  assert.equal(listResumableRuns().some((r) => r.subject === 'SUPERSEDED'), false)
})

check('a newer partial is resumable even when an older completed run exists', () => {
  const latest = listResumableRuns().find((r) => r.subject === 'RECENTPARTIAL' && r.kind === 'full')
  assert.ok(latest)
  assert.equal(latest!.runRoot, `analyses/RECENTPARTIAL_${TODAY}`)
})

check('a stable commodity root with an old decision and a newer quota interruption remains resumable', () => {
  const item = listResumableRuns().find((r) => r.swarm === 'commodity' && r.subject === 'GOLD' && r.kind === 'full')
  assert.ok(item, 'the old decision must not hide the failed refresh epoch')
  assert.equal(item!.reason, 'out_of_credits')
  assert.equal(item!.resetsAt, 4102444800)
  assert.equal(item!.autoResumeDue, false)
})

check('a deliberately-aborted run (.aborted) is STILL offered for manual resume (Cancel = pause)', () => {
  const runs = listResumableRuns()
  assert.equal(runs.some((r) => r.subject === 'ABRT' && r.kind === 'full'), true) // the whole-pipeline resume
  assert.equal(runs.some((r) => r.subject === 'ABRT' && r.kind === 'module' && r.module === 'alpha'), true) // its half-done module
})

check('a cancelled run whose child has NOT yet exited is held out of resume until it dies (double-write race guard)', () => {
  const run = createRun({ kind: 'full', ticker: 'DYING', model: 'sonnet', prompt: '/research:full DYING', user: 'local', userVia: 'local', runRoot: `analyses/DYING_${TODAY}`, willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [] })
  run.status = 'cancelled' // cancel() set this synchronously; the child is only SIGTERM'd, endedAt still unset
  try {
    assert.equal(listResumableRuns().some((r) => r.subject === 'DYING'), false, 'held out while the child is still shutting down')
    run.endedAt = Date.now() // the close handler ran — the child is gone
    assert.equal(listResumableRuns().some((r) => r.subject === 'DYING' && r.kind === 'full'), true, 'offered for manual resume once the child has exited')
  } finally {
    run.status = 'done'
    run.endedAt = Date.now() // leave it finalized so it can't shadow later assertions
  }
})

check('a currently-live subject is excluded (a resume would race admission)', () => {
  const run = createRun({ kind: 'full', ticker: 'ACME', model: 'sonnet', prompt: '/research:full ACME', user: 'local', userVia: 'local', runRoot: `analyses/ACME_${TODAY}`, willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [] })
  run.status = 'running'
  setActiveSubjectRun(run.runId, 'ACME')
  try {
    assert.equal(listResumableRuns().some((r) => r.subject === 'ACME'), false)
  } finally {
    run.status = 'done' // release so it can't leak into other assertions
  }
})

console.log(`\n${passed} checks passed`)
