// readIntakePlan() — the SERVER-side authority over the scoped rerun plan (frameworks/INTAKE.md §4).
//
// The safety-critical guarantees this pins:
//  1. A hallucinated module/agent name in the plan file is DROPPED (never handed to the client as a
//     launchable `/research:rerun badmod …` command), and the drop is recorded in `widened`.
//  2. Each surviving command's downstream cascade is RE-EXPANDED from the live DAG (roster.downstreamCascade),
//     so a stale/wrong hand-written `cascade_modules` in the file can never reach the client.
//  3. No run / no plan / malformed plan → null (fail toward the honest staleness floor, INTAKE.md §1).
// Isolated in a temp repo with a fake 2-module research graph. Run: npx tsx test/intake.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const REPO = fs.mkdtempSync(path.join(os.tmpdir(), 'intake-'))
process.env.ENGINE_REPO_ROOT = REPO

function write(rel: string, body: string) {
  const abs = path.join(REPO, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, body)
}
const fm = (name: string, layer: number, extra = '') => `---\nname: ${name}\nlayer: ${layer}\n${extra}---\n# ${name}\nbody\n`
const day = (offset: number) => {
  const d = new Date(Date.now() + offset * 86_400_000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const TODAY = day(0)
const YESTERDAY = day(-1)

// A minimal 2-module research graph: `alpha` (specialist + synthesis, no deps), `beta` (depends_on alpha).
// So a rerun of alpha's specialist cascades downstream to beta — the fact the re-expansion must recover.
write('.claude/agents/alpha/01_alpha-thing.md', fm('alpha-thing', 1))
write('.claude/agents/alpha/99_alpha-synthesis.md', fm('alpha-synthesis', 99, 'depends_on: []\n'))
write('.claude/agents/beta/01_beta-thing.md', fm('beta-thing', 1))
write('.claude/agents/beta/99_beta-synthesis.md', fm('beta-synthesis', 99, 'depends_on: [alpha]\n'))

const RUN = `analyses/TEST_${YESTERDAY}`
write(`${RUN}/final_thesis.md`, '# thesis\n')

// The fixture plan: one VALID entry (alpha/alpha-thing) + one HALLUCINATED entry (badmod/bad-agent);
// the valid command carries a deliberately WRONG cascade_modules the reader must overwrite.
const planFixture = {
  schema_version: '1.0',
  ticker: 'TEST',
  run_root: RUN,
  scan_date: TODAY,
  watermark: `${RUN}/final_thesis.md`,
  new_docs: [
    {
      path: 'data/TEST/external/prov/note.pdf',
      provider: 'prov', source_type: 'channel_check', tier: 9, as_of: YESTERDAY,
      claims_summary: 'a claim', materiality_score: 72, impact_direction: 'negative',
      entry_orbs: [
        { module: 'alpha', agent: 'alpha-thing', why: 'valid', confidence: 0.8 },
        { module: 'badmod', agent: 'bad-agent', why: 'hallucinated', confidence: 0.9 },
      ],
    },
  ],
  rerun_plan: {
    materiality_gate: 60,
    entry_orbs: [
      { module: 'alpha', agent: 'alpha-thing' },
      { module: 'badmod', agent: 'bad-agent' },
    ],
    commands: [
      { command: '/research:rerun alpha alpha-thing TEST', module: 'alpha', agent: 'alpha-thing', cascade_modules: ['WRONG'], triggered_by: ['data/TEST/external/prov/note.pdf'] },
      { command: '/research:rerun badmod bad-agent TEST', module: 'badmod', agent: 'bad-agent', cascade_modules: [], triggered_by: [] },
    ],
    note_only: [],
  },
  verdict: 'scoped_rerun',
  summary: 'test',
}
write(`${RUN}/intake/${TODAY}_intake_plan.json`, JSON.stringify(planFixture, null, 2))

const { readIntakePlan } = await import('../src/intake')

// ---- 1. valid ticker with a plan: hallucinated names dropped, cascade re-expanded ----
const plan = readIntakePlan('TEST')
assert.ok(plan, 'a plan should be returned for TEST')

// hallucinated entry_orb dropped, valid one kept
assert.equal(plan!.new_docs.length, 1)
assert.equal(plan!.new_docs[0].entry_orbs.length, 1, 'the bad entry_orb must be dropped')
assert.equal(plan!.new_docs[0].entry_orbs[0].module, 'alpha')
assert.equal(plan!.new_docs[0].entry_orbs[0].agent, 'alpha-thing')

// the drop is recorded (fail-closed audit trail)
assert.ok(plan!.widened.some((w) => w.includes('badmod')), 'widened must note the dropped name')

// hallucinated command dropped; the valid one survives with a REBUILT command string
assert.equal(plan!.rerun_plan.commands.length, 1, 'the bad command must be dropped')
const cmd = plan!.rerun_plan.commands[0]
assert.equal(cmd.module, 'alpha')
assert.equal(cmd.command, '/research:rerun alpha alpha-thing TEST')

// cascade RE-EXPANDED from the live DAG — the wrong ['WRONG'] is overwritten and beta (downstream) appears
assert.ok(cmd.cascade_modules.includes('beta'), 'downstream beta must be recovered from the DAG')
assert.ok(!cmd.cascade_modules.includes('WRONG'), 'the file cascade must not be trusted')

// plan-level entry_orbs also validated; verdict derived from surviving commands
assert.equal(plan!.rerun_plan.entry_orbs.length, 1)
assert.equal(plan!.verdict, 'scoped_rerun')
assert.ok(plan!.analyzed_at.length > 0, 'analyzed_at must be stamped from the file mtime')

// ---- 2. a run with NO intake plan → null (show the honest floor, not a fabricated plan) ----
write(`analyses/NOPLAN_${YESTERDAY}/final_thesis.md`, '# thesis\n')
assert.equal(readIntakePlan('NOPLAN'), null, 'no plan file → null')

// ---- 3. a ticker with no run at all → null ----
assert.equal(readIntakePlan('GHOST'), null, 'no run → null')

// ---- 4. every command dropped → verdict is no longer a scoped rerun ----
const allBad = { ...planFixture, new_docs: [], rerun_plan: { materiality_gate: 60, entry_orbs: [], commands: [
  { command: '/research:rerun badmod bad-agent TEST', module: 'badmod', agent: 'bad-agent', cascade_modules: [], triggered_by: [] },
], note_only: [] } }
write(`${RUN}/intake/${TODAY}_intake_plan_v2.json`, JSON.stringify(allBad, null, 2))
const plan2 = readIntakePlan('TEST')
assert.equal(plan2!.rerun_plan.commands.length, 0, 'all-bad commands dropped')
assert.notEqual(plan2!.verdict, 'scoped_rerun', 'verdict must not claim a scoped rerun when every command was invalid')

// ---- 5. a hallucinated-only command on a MATERIAL doc → verdict is 'insufficient', not a quiet 'note_only' ----
const materialAllBad = {
  ...planFixture,
  new_docs: [{ ...planFixture.new_docs[0], materiality_score: 90, entry_orbs: [{ module: 'badmod', agent: 'bad-agent', why: 'hallucinated', confidence: 0.9 }] }],
  rerun_plan: { materiality_gate: 60, entry_orbs: [], commands: [
    { command: '/research:rerun badmod bad-agent TEST2', module: 'badmod', agent: 'bad-agent', cascade_modules: [], triggered_by: [] },
  ], note_only: [] },
}
write(`${RUN}/intake/${TODAY}_intake_plan_v3.json`, JSON.stringify(materialAllBad, null, 2))
const plan3 = readIntakePlan('TEST')
assert.equal(plan3!.rerun_plan.commands.length, 0, 'the hallucinated command must still be dropped')
assert.equal(plan3!.verdict, 'insufficient', 'a dropped command on a doc that cleared the materiality gate must fail closed, not read as note_only')

// ---- 6. a file-declared 'insufficient' verdict survives even though new_docs is non-empty ----
write(`analyses/INSUF_${YESTERDAY}/final_thesis.md`, '# thesis\n')
const insufFixture = { ...planFixture, ticker: 'INSUF', run_root: `analyses/INSUF_${YESTERDAY}`, verdict: 'insufficient', rerun_plan: { materiality_gate: 60, entry_orbs: [], commands: [], note_only: [] } }
write(`analyses/INSUF_${YESTERDAY}/intake/${TODAY}_intake_plan.json`, JSON.stringify(insufFixture, null, 2))
const planInsuf = readIntakePlan('INSUF')
assert.equal(planInsuf!.verdict, 'insufficient', 'a file-declared insufficient verdict must not be overwritten to note_only just because new_docs is non-empty')

// ---- 7. a plan older than the newest data-pool file → null (expired; fail toward the honest floor) ----
write(`analyses/STALE_${YESTERDAY}/final_thesis.md`, '# thesis\n')
const staleFixture = { ...planFixture, ticker: 'STALE', run_root: `analyses/STALE_${YESTERDAY}` }
const stalePlanPath = path.join(REPO, `analyses/STALE_${YESTERDAY}/intake/${TODAY}_intake_plan.json`)
write(`analyses/STALE_${YESTERDAY}/intake/${TODAY}_intake_plan.json`, JSON.stringify(staleFixture, null, 2))
const yesterdayDate = new Date(Date.now() - 86_400_000)
fs.utimesSync(stalePlanPath, yesterdayDate, yesterdayDate) // simulate a plan written yesterday
write('data/STALE/new_doc_today.txt', 'landed after the plan') // written NOW, real today's mtime
const planStale = readIntakePlan('STALE')
assert.equal(planStale, null, 'a data-pool file newer than the plan must expire it to null, not serve a stale plan')

console.log('intake.test.ts: all assertions passed')
fs.rmSync(REPO, { recursive: true, force: true })
