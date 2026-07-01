// listResumableRuns() — the disk-truth detector behind the manual "Resume run" affordance. It must
// surface an interrupted run (final deliverable missing) at BOTH full and module granularity, while
// excluding a finished run, a deliberately-aborted run, a prior-day folder (same-day scope), and a
// currently-live subject. Isolated in a temp repo so a fake 2-module research graph + fixture run
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

// today's date, matching resumable.ts's own todayDate()
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
// OLD (yesterday): half-done but out of the same-day scope → NOT resumable.
write(`analyses/OLD_${YESTERDAY}/alpha/01_alpha-thing.md`, '# a\n')
// ABRT (today): half-done but deliberately aborted (.aborted marker) → NOT resumable.
write(`analyses/ABRT_${TODAY}/alpha/01_alpha-thing.md`, '# a\n')
write(`analyses/ABRT_${TODAY}/.aborted`, JSON.stringify({ reason: 'cancelled' }))

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

check('a prior-day folder is excluded (same-day scope)', () => {
  assert.equal(listResumableRuns().some((r) => r.subject === 'OLD'), false)
})

check('a deliberately-aborted run (.aborted) is excluded', () => {
  assert.equal(listResumableRuns().some((r) => r.subject === 'ABRT'), false)
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
