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
assert.equal(plan!.pool_current, true, 'TEST has no data pool → the analysis trivially accounts for it → pool_current true')

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

// Freshness is judged against the plan's OWN durable records (scan_date / scanned_at) and the run-folder
// DATE — never the plan file's mtime (analyses/ mtimes are rewritten forward by a git checkout/rebase).
// NOTE on timestamps: fs.utimesSync sets ctime to NOW, and dataPoolNewest uses max(mtime, ctime), so a
// created file always reads as "now". These tests therefore drive the verdict via (a) the run-folder DATE
// in the fixture name (TODAY vs YESTERDAY → the durable staleness-floor cross-gate) and (b) scanned_at set
// relative to a file's REAL timestamp — not by faking old mtimes.
const emptyRerun = { materiality_gate: 60, entry_orbs: [], commands: [], note_only: [] }
const FUTURE = new Date(Date.now() + 5 * 86_400_000)
const bumpMtimeForward = (rel: string) => fs.utimesSync(path.join(REPO, rel), FUTURE, FUTURE)
const poolMaxOf = (rel: string) => { const st = fs.statSync(path.join(REPO, rel)); return Math.max(st.mtimeMs, st.ctimeMs) }
const emptyPlanFor = (t: string, runRoot: string, extra: Record<string, unknown>) =>
  ({ ...planFixture, ticker: t, run_root: runRoot, new_docs: [], rerun_plan: emptyRerun, verdict: 'note_only', ...extra })

// ---- 7. a SCOPED plan whose scan_date predates a newer pool file → null (expired), off the DURABLE
//         scan_date, immune to a forward-bumped plan mtime. ------------------------------------------
write(`analyses/STALE_${YESTERDAY}/final_thesis.md`, '# thesis\n')
const staleFixture = { ...planFixture, ticker: 'STALE', run_root: `analyses/STALE_${YESTERDAY}`, scan_date: YESTERDAY }
write(`analyses/STALE_${YESTERDAY}/intake/${TODAY}_intake_plan.json`, JSON.stringify(staleFixture, null, 2))
write('data/STALE/new_doc_today.txt', 'landed after the analysis, cross-day') // dated TODAY
bumpMtimeForward(`analyses/STALE_${YESTERDAY}/intake/${TODAY}_intake_plan.json`) // git checkout rewrote it forward
assert.equal(readIntakePlan('STALE'), null, 'a SCOPED plan whose scan_date (yesterday) predates a newer pool file (today) expires to null — proven off scan_date, immune to the forward-bumped plan mtime')

// ---- 8. pool_current TRUE (the affirmative "no new data"): nothing has landed since the run and the
//         analysis has a valid witness → safe to affirm. Tested via an EMPTY pool — with fs.utimesSync
//         forcing ctime to now, a created file can't be made to read as "before the scan", so the empty
//         pool is the deterministic path to the affirmative (production reaches it whenever the newest
//         pool file genuinely predates the analysis). Durable: the plan mtime is bumped forward and the
//         verdict is unchanged. --------------------------------------------------------------------------
write(`analyses/CURRENT_${TODAY}/final_thesis.md`, '# thesis\n')
write(`analyses/CURRENT_${TODAY}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('CURRENT', `analyses/CURRENT_${TODAY}`, { scan_date: TODAY, scanned_at: new Date().toISOString() }), null, 2))
bumpMtimeForward(`analyses/CURRENT_${TODAY}/intake/${TODAY}_intake_plan.json`)
const planCurrent = readIntakePlan('CURRENT')
assert.ok(planCurrent && planCurrent.new_docs.length === 0, 'a current empty plan is served, never nulled')
assert.equal(planCurrent!.pool_current, true, 'empty pool + valid witness + run TODAY → pool_current true (durable; the forward-bumped plan mtime does not matter)')

// ---- 9. pool_current FALSE (STRICT same-day scan_date): a file dated the scan day counts as unread, so a
//         same-day-after landing is never mis-reported as "nothing new". Run is TODAY (floor not stale) so
//         this isolates the strict scan_date path. Served so the cockpit nudges. -----------------------
write(`analyses/SAMEDAY_${TODAY}/final_thesis.md`, '# thesis\n')
write('data/SAMEDAY/doc_today.txt', 'dated today (== scan_date)')
write(`analyses/SAMEDAY_${TODAY}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('SAMEDAY', `analyses/SAMEDAY_${TODAY}`, { scan_date: TODAY }), null, 2)) // no scanned_at → date path
const planSameDay = readIntakePlan('SAMEDAY')
assert.ok(planSameDay, 'an empty plan with a same-day file is SERVED (not nulled) so the client can nudge a re-analysis')
assert.equal(planSameDay!.pool_current, false, 'a pool file dated == scan_date counts as unread (strict <) → pool_current false')

// ---- 10. pool_current FALSE via the DURABLE STALENESS-FLOOR cross-gate (the HIGH re-check finding): the
//          run is YESTERDAY and the pool holds a doc DATED today (after the run), so the floor says the run
//          is stale → the affirmative is withheld even though the plan is empty. This is exactly the case
//          the command's `find -newer final_thesis.md` misses when a git checkout bumped the watermark
//          forward: the dock must never claim "all considered" while the floor flags the run stale. Guard:
//          the SAME empty plan on a TODAY run (#8) affirms, so the YESTERDAY folder here is what flips it. -
write(`analyses/OLDRUN_${YESTERDAY}/final_thesis.md`, '# thesis\n')
write('data/OLDRUN/post_run_doc.txt', 'dated today, after yesterday\'s run')
write(`analyses/OLDRUN_${YESTERDAY}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('OLDRUN', `analyses/OLDRUN_${YESTERDAY}`, { scan_date: TODAY, scanned_at: new Date().toISOString() }), null, 2))
const planOldRun = readIntakePlan('OLDRUN')
assert.ok(planOldRun, 'the empty plan is served, not nulled')
assert.equal(planOldRun!.pool_current, false, 'a pool file dated after the run folder date → the durable floor forces pool_current false; the dock cannot contradict the stale badges')

// ---- 11. pool_current FALSE (precise scanned_at) + the FINDING-1 durability regression. Run is TODAY (so
//          the floor is NOT the reason) — a file whose timestamp is AFTER a 2h-old scanned_at makes it
//          false, EVEN with the plan file mtime bumped 5 days forward. -------------------------------
write(`analyses/AFTER_${TODAY}/final_thesis.md`, '# thesis\n')
write('data/AFTER/late_doc.txt', 'landed now — after the 2h-old scan')
const afterScannedAt = new Date(poolMaxOf('data/AFTER/late_doc.txt') - 2 * 3_600_000).toISOString() // 2h before the file
write(`analyses/AFTER_${TODAY}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('AFTER', `analyses/AFTER_${TODAY}`, { scan_date: TODAY, scanned_at: afterScannedAt }), null, 2))
bumpMtimeForward(`analyses/AFTER_${TODAY}/intake/${TODAY}_intake_plan.json`) // the exact git-materialization bias finding #1 flagged
const planAfter = readIntakePlan('AFTER')
assert.equal(planAfter!.pool_current, false, 'a pool ts after scanned_at → pool_current false, EVEN with the plan mtime bumped 5 days forward (the false-"already considered" bug is closed)')

// ---- 12. a FUTURE scanned_at (prompt/clock-skew bug) is discarded → falls to scan_date, never trusted. --
write(`analyses/FUTURESTAMP_${TODAY}/final_thesis.md`, '# thesis\n')
write('data/FUTURESTAMP/doc_today.txt', 'dated today')
write(`analyses/FUTURESTAMP_${TODAY}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('FUTURESTAMP', `analyses/FUTURESTAMP_${TODAY}`, { scan_date: TODAY, scanned_at: new Date(Date.now() + 3 * 86_400_000).toISOString() }), null, 2))
const planFuture = readIntakePlan('FUTURESTAMP')
assert.equal(planFuture!.scanned_at, undefined, 'a future scanned_at is discarded, not echoed back')
assert.equal(planFuture!.pool_current, false, 'the future stamp is discarded → falls to scan_date (today), and a today-dated file is strict-unread → false')

// ---- 13. no durable witness at all (scanned_at absent AND scan_date invalid) → fail closed: pool_current
//          false, never an affirmative on an unprovable basis. The plan is still served. ---------------
write(`analyses/NOWIT_${TODAY}/final_thesis.md`, '# thesis\n')
write('data/NOWIT/doc.txt', 'a pool file with no analysis witness to prove it was read')
write(`analyses/NOWIT_${TODAY}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('NOWIT', `analyses/NOWIT_${TODAY}`, { scan_date: '' }), null, 2)) // invalid scan_date, no scanned_at
const planNoWit = readIntakePlan('NOWIT')
assert.ok(planNoWit, 'the empty plan is served')
assert.equal(planNoWit!.pool_current, false, 'no scanned_at and an invalid scan_date → fail closed (pool_current false), never affirm without a durable witness')

// ---- 14. `consumed`: a plan copy STAMPED staged_for_scoped_rerun, in a root whose final deliverables have
//          actually landed, is retired — commands emptied, `consumed: true`, so the cockpit never claims
//          already-incorporated data still needs a rerun (Codex #358 r3673980745). ----------------------
const consumedRun = `analyses/CONSUMED_${TODAY}`
write(`${consumedRun}/final_thesis.md`, '# thesis\n')
write(`${consumedRun}/decision_record.json`, '{}')
const consumedFixture = { ...planFixture, ticker: 'CONSUMED', run_root: consumedRun, scan_date: TODAY, staged_for_scoped_rerun: true }
write(`${consumedRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(consumedFixture, null, 2))
const planConsumed = readIntakePlan('CONSUMED')
assert.ok(planConsumed, 'a consumed plan is still SERVED (kept for the audit trail), never nulled')
assert.equal(planConsumed!.consumed, true, 'stamped + root finished → consumed')
assert.equal(planConsumed!.rerun_plan.commands.length, 0, 'a consumed plan reports nothing actionable — its commands already ran')
assert.notEqual(planConsumed!.verdict, 'scoped_rerun', 'a consumed plan must never claim a live scoped rerun')

// ---- 15. the SAME stamp, but the root has not actually finished yet (still in flight / launch never
//          admitted) → NOT consumed: a retry after a failed launch must still find the plan's commands. --
const pendingRun = `analyses/PENDING_${TODAY}`
const pendingFixture = { ...planFixture, ticker: 'PENDING', run_root: pendingRun, scan_date: TODAY, staged_for_scoped_rerun: true }
write(`${pendingRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(pendingFixture, null, 2))
const planPending = readIntakePlan('PENDING')
assert.ok(planPending, 'plan still served while the run is in flight (no final deliverables yet)')
assert.equal(planPending!.consumed, false, 'staged but not yet finished → not consumed, commands must survive for a retry')
assert.equal(planPending!.rerun_plan.commands.length, 1)

// ---- 16. an ORDINARY (un-stamped) plan sitting in the finished run it targets — the common, intended case
//          (INTAKE.md: the plan deliberately lives under the OLDER run it invalidates) — must NEVER be
//          treated as consumed just because that run happens to be finished. -----------------------------
const ordinaryRun = `analyses/ORDINARY_${YESTERDAY}`
write(`${ordinaryRun}/final_thesis.md`, '# thesis\n')
write(`${ordinaryRun}/decision_record.json`, '{}')
const ordinaryFixture = { ...planFixture, ticker: 'ORDINARY', run_root: ordinaryRun, scan_date: TODAY }
write(`${ordinaryRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(ordinaryFixture, null, 2))
const planOrdinary = readIntakePlan('ORDINARY')
assert.ok(planOrdinary)
assert.equal(planOrdinary!.consumed, false, 'no stamp → never consumed, even though the run it sits in is finished (the ordinary, intended case)')
assert.equal(planOrdinary!.rerun_plan.commands.length, 1, 'the ordinary, not-yet-executed case must keep executing normally')

console.log('intake.test.ts: all assertions passed')
fs.rmSync(REPO, { recursive: true, force: true })
