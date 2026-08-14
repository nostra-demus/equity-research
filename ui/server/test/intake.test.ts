// readIntakePlan() — the SERVER-side authority over every swarm's scoped rerun plan
// (frameworks/INTAKE.md §4).
//
// The safety-critical guarantees this pins:
//  1. A hallucinated module/agent name in the plan file is DROPPED (never handed to the client as a
//     launchable `/research:rerun badmod …` command), and the drop is recorded in `widened`.
//  2. Each surviving command's downstream cascade is RE-EXPANDED from the live DAG (roster.downstreamCascade),
//     so a stale/wrong hand-written `cascade_modules` in the file can never reach the client.
//  3. No run / no plan / malformed plan → null (fail toward the honest staleness floor, INTAKE.md §1).
// Isolated in a temp repo with a fake 2-module research graph + a manifest-declared singleton swarm.
// Run: npx tsx test/intake.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE_REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const REPO = fs.mkdtempSync(path.join(os.tmpdir(), 'intake-'))
process.env.ENGINE_REPO_ROOT = REPO
process.env.ENGINE_PUBLISHED_GIT_REF = 'HEAD'

execFileSync('git', ['-C', REPO, 'init', '-q'])
execFileSync('git', ['-C', REPO, 'config', 'user.email', 'intake-test@example.invalid'])
execFileSync('git', ['-C', REPO, 'config', 'user.name', 'Intake Test'])

function write(rel: string, body: string) {
  const abs = path.join(REPO, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, body)
  // Prompt-authored plan bytes become execution authority only with their exact Git commit. Keep staged
  // transport copies uncommitted: their committed source plan is the authority tested below.
  if (/\/(?:decision_record\.json|final_thesis\.md|corrections\.json)$/.test(rel)) {
    execFileSync('git', ['-C', REPO, 'add', '--', rel])
    execFileSync('git', ['-C', REPO, 'commit', '-q', '-m', `terminal ${path.basename(rel)}`, '--', rel])
  } else if (/\/intake\/\d{4}-\d{2}-\d{2}_intake_plan(?:_v\d+)?\.json$/.test(rel)) {
    let staged = false
    try { staged = JSON.parse(body)?.staged_for_scoped_rerun === true } catch { /* malformed audit fixture */ }
    if (!staged) {
      execFileSync('git', ['-C', REPO, 'add', '--', rel])
      execFileSync('git', ['-C', REPO, 'commit', '-q', '-m', `plan ${path.basename(rel)}`, '--', rel])
    }
  }
}
const canonicalJson = (value: any): string => {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`
  return JSON.stringify(value)
}
const decisionFingerprint = (runRoot: string, decision: any) =>
  `sha256:${createHash('sha256').update(`${runRoot}\n${canonicalJson(decision)}`).digest('hex')}`
const writeDecision = (runRoot: string, decision: any): string => {
  write(`${runRoot}/decision_record.json`, JSON.stringify(decision))
  return decisionFingerprint(runRoot, decision)
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

// A manifest-declared singleton constellation swarm. The reader must derive its root, namespace, roster,
// and DAG from this file/tree; none of these names may live in intake.ts.
write('.claude/agents/commodity/SWARM.md', `---
id: commodity
label: Commodities
unit: commodity
order: 3
layout: constellation
command_ns: commodity
run_root_template: commodity/runs/{COMMODITY}
placeholder: COMMODITY
runs_root: commodity/runs
---
# fixture swarm
`)
write('.claude/agents/commodity/curve/01_curve.md', fm('commodity-curve', 1))
write('.claude/agents/commodity/curve/99_curve-synthesis.md', fm('commodity-curve-synthesis', 99, 'depends_on: []\n'))
write('.claude/agents/commodity/thesis/01_thesis.md', fm('commodity-thesis', 1))
write('.claude/agents/commodity/thesis/99_thesis-synthesis.md', fm('commodity-thesis-synthesis', 99, 'depends_on: [curve]\n'))

const RUN = `analyses/TEST_${YESTERDAY}`
write(`${RUN}/final_thesis.md`, '# thesis\n')
const TEST_DECISION = { ticker: 'TEST', decision: 'Watchlist', confidence_score: 50 }
const TEST_FP = writeDecision(RUN, TEST_DECISION)

// The fixture plan: one VALID entry (alpha/alpha-thing) + one HALLUCINATED entry (badmod/bad-agent);
// the valid command carries a deliberately WRONG cascade_modules the reader must overwrite.
const planFixture = {
  schema_version: '1.1',
  ticker: 'TEST',
  run_root: RUN,
  decision_fingerprint: TEST_FP,
  scan_date: TODAY,
  scanned_at: new Date().toISOString(),
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

const {
  readIntakePlan, latestPlanFileFor, intakePlanSha256, intakeExecutionReceiptId,
  resolveIntakeRunRoot, stagedIntakePlanMatches, stagedIntakeResumeForTarget,
  intakePlanCoversAutomaticPool, intakePoolNewest, intakePoolAuthorityAvailable,
} = await import('../src/intake')
const { listFinishedIntakeOwners, resolveUniqueFinishedIntakeOwner } = await import('../src/intake-owner')

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
assert.ok(!cmd.cascade_modules.includes('master'), 'the research-only master is never exposed as a module cascade')

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
const insufFixture = { ...planFixture, ticker: 'INSUF', run_root: `analyses/INSUF_${YESTERDAY}`, verdict: 'insufficient', new_docs: [{ ...planFixture.new_docs[0], path: 'data/INSUF/external/prov/note.pdf' }], rerun_plan: { materiality_gate: 60, entry_orbs: [], commands: [], note_only: [] } }
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
const staleFixture = {
  ...planFixture, ticker: 'STALE', run_root: `analyses/STALE_${YESTERDAY}`, scan_date: YESTERDAY,
  new_docs: [{ ...planFixture.new_docs[0], path: 'data/STALE/external/prov/note.pdf' }],
  rerun_plan: { ...planFixture.rerun_plan, commands: [{ ...planFixture.rerun_plan.commands[0], triggered_by: ['data/STALE/external/prov/note.pdf'] }] },
}
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

// Sub-second ordering regression: a document and scan can land in the SAME UTC second. Whole-second
// `date` collapsed their order; the canonical millisecond witness must preserve "document came after".
while (Date.now() % 1000 < 25) { /* keep the fixture safely inside one second */ }
write('data/SAMESECOND/doc.txt', 'same-second landing')
const sameSecondDocMs = Math.floor(poolMaxOf('data/SAMESECOND/doc.txt'))
const sameSecondScanMs = sameSecondDocMs - 1
assert.equal(Math.floor(sameSecondDocMs / 1000), Math.floor(sameSecondScanMs / 1000), 'fixture events share one wall-clock second')
const sameSecondRun = `analyses/SAMESECOND_${TODAY}`
write(`${sameSecondRun}/final_thesis.md`, '# thesis\n')
write(`${sameSecondRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('SAMESECOND', sameSecondRun, {
  scan_date: TODAY, scanned_at: new Date(sameSecondScanMs).toISOString(),
}), null, 2))
assert.equal(readIntakePlan('SAMESECOND')!.pool_current, false, 'millisecond witness orders a same-second post-scan document correctly')

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
const consumedFixture = {
  ...planFixture, ticker: 'CONSUMED', run_root: consumedRun, scan_date: TODAY, staged_for_scoped_rerun: true,
  new_docs: [{ ...planFixture.new_docs[0], path: 'data/CONSUMED/external/prov/note.pdf' }],
  rerun_plan: { ...planFixture.rerun_plan, commands: [{ ...planFixture.rerun_plan.commands[0], triggered_by: ['data/CONSUMED/external/prov/note.pdf'] }] },
}
write(`${consumedRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(consumedFixture, null, 2))
const planConsumed = readIntakePlan('CONSUMED')
assert.ok(planConsumed, 'a consumed plan is still SERVED (kept for the audit trail), never nulled')
assert.equal(planConsumed!.consumed, true, 'stamped + root finished → consumed')
assert.equal(planConsumed!.rerun_plan.commands.length, 0, 'a consumed plan reports nothing actionable — its commands already ran')
assert.notEqual(planConsumed!.verdict, 'scoped_rerun', 'a consumed plan must never claim a live scoped rerun')

// ---- 15. the SAME stamp, but the root has not actually finished yet (still in flight / launch never
//          admitted) → NOT consumed: a retry after a failed launch must still find the plan's commands. --
const pendingRun = `analyses/PENDING_${TODAY}`
const pendingFixture = {
  ...planFixture, ticker: 'PENDING', run_root: pendingRun, scan_date: TODAY, staged_for_scoped_rerun: true,
  new_docs: [{ ...planFixture.new_docs[0], path: 'data/PENDING/external/prov/note.pdf' }],
  rerun_plan: { ...planFixture.rerun_plan, commands: [{ ...planFixture.rerun_plan.commands[0], triggered_by: ['data/PENDING/external/prov/note.pdf'] }] },
}
write(`${pendingRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(pendingFixture, null, 2))
const planPending = readIntakePlan('PENDING')
assert.ok(planPending, 'plan still served while the run is in flight (no final deliverables yet)')
assert.equal(planPending!.consumed, false, 'staged but not yet finished → not consumed, commands must survive for a retry')
assert.equal(planPending!.rerun_plan.commands.length, 0, 'a legacy staged plan without a verifiable source fingerprint is audit-only')
assert.equal(planPending!.actionable, false)

// A real stamped copy retains the exact SOURCE run/fingerprint while it lives in the newer staging root.
// The source identity, not the staging root's partial bytes, keeps its retry command actionable.
const stagedSource = `analyses/STAGED_${YESTERDAY}`
const stagedTarget = `analyses/STAGED_${TODAY}`
const stagedSourceFp = writeDecision(stagedSource, { ticker: 'STAGED', decision: 'Watchlist', confidence_score: 41 })
write(`${stagedSource}/final_thesis.md`, '# source thesis\n')
writeDecision(stagedTarget, { ticker: 'STAGED', decision: 'Watchlist', confidence_score: 41 })
const stagedFixture = {
  ...planFixture, ticker: 'STAGED', run_root: stagedSource, decision_fingerprint: stagedSourceFp,
  staged_for_scoped_rerun: true,
  new_docs: [{ ...planFixture.new_docs[0], path: 'data/STAGED/external/prov/note.pdf' }],
  rerun_plan: { ...planFixture.rerun_plan, commands: [{ ...planFixture.rerun_plan.commands[0], triggered_by: ['data/STAGED/external/prov/note.pdf'] }] },
}
const stagedSourceFixture = { ...stagedFixture }
delete (stagedSourceFixture as any).staged_for_scoped_rerun
write(`${stagedSource}/intake/${TODAY}_intake_plan.json`, JSON.stringify(stagedSourceFixture, null, 2))
write(`${stagedTarget}/intake/${TODAY}_intake_plan.json`, JSON.stringify(stagedFixture, null, 2))
const stagedRetry = readIntakePlan('STAGED')
assert.ok(stagedRetry)
assert.equal(stagedRetry!.run_root, stagedTarget)
assert.equal(stagedRetry!.actionable, true, 'the stamped copy validates against its exact source decision')
assert.equal(stagedRetry!.rerun_plan.commands.length, 1, 'an incomplete staged copy keeps its retry command')

// ---- 16. an ORDINARY (un-stamped) plan sitting in the finished run it targets — the common, intended case
//          (INTAKE.md: the plan deliberately lives under the OLDER run it invalidates) — must NEVER be
//          treated as consumed just because that run happens to be finished. -----------------------------
const ordinaryRun = `analyses/ORDINARY_${YESTERDAY}`
write(`${ordinaryRun}/final_thesis.md`, '# thesis\n')
const ordinaryFp = writeDecision(ordinaryRun, {})
const ordinaryFixture = {
  ...planFixture, ticker: 'ORDINARY', run_root: ordinaryRun, decision_fingerprint: ordinaryFp, scan_date: TODAY,
  new_docs: [{ ...planFixture.new_docs[0], path: 'data/ORDINARY/external/prov/note.pdf' }],
  rerun_plan: { ...planFixture.rerun_plan, commands: [{ ...planFixture.rerun_plan.commands[0], triggered_by: ['data/ORDINARY/external/prov/note.pdf'] }] },
}
write(`${ordinaryRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(ordinaryFixture, null, 2))
const planOrdinary = readIntakePlan('ORDINARY')
assert.ok(planOrdinary)
assert.equal(planOrdinary!.consumed, false, 'no stamp → never consumed, even though the run it sits in is finished (the ordinary, intended case)')
assert.equal(planOrdinary!.rerun_plan.commands.length, 1, 'the ordinary, not-yet-executed case must keep executing normally')

// ---- THE STANDING-RUN REGRESSION: a newer DECISION-LESS run folder must not shadow the run the plan
//      was written into. --------------------------------------------------------------------------
// The reported bug. `/research:intake` writes into "the latest FINISHED run root" and is told to skip a
// newer incomplete/failed folder. readIntakePlan resolved the run the opposite way — the lexically newest
// `<TICKER>_*` directory, no completeness check — so an aborted run that left nothing but a couple of
// agent_metrics files won the pick, its (absent) intake/ read as "no plan", and this returned null.
// Downstream that is indistinguishable from "nothing to do": zero orbs lit, the New-data dock hidden, and
// the decision banner offering only the blunt full re-run. In production this silently discarded FOUR
// consecutive paid intake reads of AMZN (23/24/29/31 Jul), each of which had correctly scoped the same
// three orbs off a tier-5 alt-data panel. Writer and reader must agree on which folder IS the run.
const SHADOW_COMPLETE = `analyses/SHADOW_${day(-3)}`
write(`${SHADOW_COMPLETE}/final_thesis.md`, '# thesis\n')
const shadowFp = writeDecision(SHADOW_COMPLETE, { ticker: 'SHADOW', decision: 'Watchlist', confidence_score: 57 }) // this run DECIDED → it is the standing run
write(`${SHADOW_COMPLETE}/intake/${TODAY}_intake_plan.json`, JSON.stringify({
  ...planFixture, ticker: 'SHADOW', run_root: SHADOW_COMPLETE, decision_fingerprint: shadowFp, watermark: `${SHADOW_COMPLETE}/final_thesis.md`,
  new_docs: [{ ...planFixture.new_docs[0], path: 'data/SHADOW/external/prov/note.pdf' }],
  rerun_plan: { ...planFixture.rerun_plan, entry_orbs: [{ module: 'alpha', agent: 'alpha-thing' }], commands: [{ ...planFixture.rerun_plan.commands[0], triggered_by: ['data/SHADOW/external/prov/note.pdf'] }] },
}, null, 2))

// …and a NEWER folder that never decided — exactly the production shape (AMZN_2026-07-20 held two
// agent_metrics files and nothing else): no final_thesis, no decision_record, no intake/.
write(`analyses/SHADOW_${YESTERDAY}/agent_metrics.a9a757f2.json`, '{}')
write(`analyses/SHADOW_${YESTERDAY}/agent_metrics.f924ee34.json`, '{}')

const planShadow = readIntakePlan('SHADOW')
assert.ok(planShadow, 'the plan in the STANDING run is found — a newer decision-less shell must not shadow it')
assert.equal(planShadow!.verdict, 'scoped_rerun', 'and it still reads as a scoped rerun, not a silent note_only')
assert.equal(planShadow!.rerun_plan.commands.length, 1, 'its scoped command survives to the client')
assert.equal(planShadow!.rerun_plan.commands[0].command, '/research:rerun alpha alpha-thing SHADOW')
assert.equal(planShadow!.rerun_plan.entry_orbs.length, 1, 'and the orb that must LIGHT UP is carried')
assert.equal(planShadow!.rerun_plan.entry_orbs[0].agent, 'alpha-thing')

// A ticker whose ONLY run never decided must still resolve — a first, still-running analysis has no
// decision record yet, and its plan must not become unreachable.
write(`analyses/NODECISION_${TODAY}/final_thesis.md`, '# thesis\n')
write(`analyses/NODECISION_${TODAY}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('NODECISION', `analyses/NODECISION_${TODAY}`, { scan_date: TODAY }), null, 2))
assert.ok(readIntakePlan('NODECISION'), 'a ticker with no decided run at all still resolves to its newest folder')

// The STAGING path keeps newest-wins on purpose (the scoped-rerun route copies the plan into the root it
// just staged, #358) — the two resolutions are deliberately different and must not be unified.
write(`analyses/SHADOW_${YESTERDAY}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('SHADOW', `analyses/SHADOW_${YESTERDAY}`, { scan_date: TODAY }), null, 2))
assert.ok(String(latestPlanFileFor('SHADOW')).includes(`SHADOW_${YESTERDAY}`), 'latestPlanFileFor still resolves the NEWEST root (the staged one), unchanged')

// ---- GENERIC SWARM: a singleton run is resolved from SWARM.md, validated against its own nested roster,
//      expanded through its own DAG, and rebuilt in its own command namespace. --------------------------
const commodityRun = 'commodity/runs/GOLD'
const commodityFp = writeDecision(commodityRun, { swarm: 'commodity', commodity: 'GOLD', decision_date: TODAY, action: 'Hold' })
const commodityFixture = {
  ...planFixture,
  ticker: 'GOLD',
  subject: 'GOLD',
  swarm: 'commodity',
  decision_fingerprint: commodityFp,
  run_root: 'analyses/SPOOFED_1900-01-01', // never trusted: the server stamps the resolved root
  watermark: `${commodityRun}/decision_record.json`,
  new_docs: [{
    ...planFixture.new_docs[0],
    path: 'data/GOLD/external/exchange/curve.csv',
    entry_orbs: [
      { module: 'curve', agent: 'commodity-curve', why: 'valid singleton-swarm orb', confidence: 0.9 },
      { module: 'alpha', agent: 'alpha-thing', why: 'valid only in the research roster', confidence: 0.8 },
    ],
  }],
  rerun_plan: {
    materiality_gate: 60,
    entry_orbs: [
      { module: 'curve', agent: 'commodity-curve' },
      { module: 'alpha', agent: 'alpha-thing' },
    ],
    commands: [
      { command: '/research:rerun WRONG', module: 'curve', agent: 'commodity-curve', cascade_modules: ['WRONG'], triggered_by: ['data/GOLD/external/exchange/curve.csv'] },
      { command: '/research:rerun alpha alpha-thing GOLD', module: 'alpha', agent: 'alpha-thing', cascade_modules: [], triggered_by: [] },
    ],
    note_only: [],
  },
}
write(`${commodityRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(commodityFixture, null, 2))
const commodityPlan = readIntakePlan('GOLD', { swarmId: 'commodity' })
assert.ok(commodityPlan, 'the manifest-derived singleton run plan is readable')
assert.equal(commodityPlan!.swarm, 'commodity', 'swarm identity is server-stamped')
assert.equal(commodityPlan!.subject, 'GOLD', 'generic subject identity is server-stamped')
assert.equal(commodityPlan!.ticker, 'GOLD', 'schema-v1 ticker alias stays compatible and is server-stamped')
assert.equal(commodityPlan!.run_root, commodityRun, 'run_root is the contained resolved root, never the file claim')
assert.equal(commodityPlan!.new_docs[0].entry_orbs.length, 1, 'an orb from another swarm roster is rejected')
assert.equal(commodityPlan!.rerun_plan.commands.length, 1, 'a command from another swarm roster is rejected')
assert.equal(commodityPlan!.rerun_plan.commands[0].command, '/commodity:rerun curve commodity-curve GOLD', 'the command namespace comes from SWARM.md and the raw command is ignored')
assert.ok(commodityPlan!.rerun_plan.commands[0].cascade_modules.includes('thesis'), 'the singleton-swarm DAG supplies downstream modules')
assert.ok(!commodityPlan!.rerun_plan.commands[0].cascade_modules.includes('WRONG'), 'a prompt-written singleton cascade is never trusted')
assert.equal(commodityPlan!.consumed, false, 'a singleton decision record predates intake and cannot falsely consume the plan')
assert.ok(String(latestPlanFileFor('GOLD', { swarmId: 'commodity' })).includes(commodityRun), 'latestPlanFileFor resolves the same manifest-owned singleton root')

// A shared pool label is ambiguous even when one finished owner is legacy and cannot provide a modern
// data-needs projection. Never make the invalid/non-bindable owner disappear and route GOLD to commodity.
const legacyResearchGold = `analyses/GOLD_${YESTERDAY}`
write(`${legacyResearchGold}/final_thesis.md`, '# legacy research thesis\n')
assert.deepEqual(
  listFinishedIntakeOwners('GOLD').map(({ swarm, runRoot }) => ({ swarm, runRoot })),
  [
    { swarm: 'commodity', runRoot: commodityRun },
    { swarm: 'research', runRoot: legacyResearchGold },
  ],
  'finished-owner enumeration includes legacy dossiers independently of a Data Needs projection',
)
assert.equal(resolveUniqueFinishedIntakeOwner('GOLD'), null,
  'legacy finished research GOLD + finished commodity GOLD is ambiguous and auto-intake abstains')

// The singleton counterpart of the durable floor regression: a precise scan can prove that no file landed
// AFTER the scan, but an empty plan still cannot claim "all considered" when a pool file is newer than the
// decision itself (the command may have missed it off a Git-bumped decision-record mtime).
const silverRun = 'commodity/runs/SILVER'
write(`${silverRun}/decision_record.json`, JSON.stringify({ decision_date: YESTERDAY, action: 'Hold' }))
write('data/SILVER/post_decision.csv', 'landed after the singleton decision')
const silverScannedAt = new Date(poolMaxOf('data/SILVER/post_decision.csv') + 60_000).toISOString()
write(`${silverRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('SILVER', silverRun, { scan_date: TODAY, scanned_at: silverScannedAt }), null, 2))
const silverPlan = readIntakePlan('SILVER', { swarmId: 'commodity' })
assert.ok(silverPlan, 'the singleton empty plan is served so the cockpit can prompt a re-analysis')
assert.equal(silverPlan!.pool_current, false, 'a pool file dated after singleton decision_date forces the durable floor false')

// No dated folder and no valid decision_date means the floor is unknowable. Even an empty pool + precise
// scanned_at cannot earn an affirmative; fail closed to a recheck.
const undatedRun = 'commodity/runs/UNDATED'
write(`${undatedRun}/decision_record.json`, JSON.stringify({ action: 'Hold' }))
write(`${undatedRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('UNDATED', undatedRun, { scan_date: TODAY, scanned_at: new Date().toISOString() }), null, 2))
assert.equal(readIntakePlan('UNDATED', { swarmId: 'commodity' })!.pool_current, false, 'a singleton with no durable decision vintage cannot claim the pool current')

// A singleton subject can itself contain a date-shaped substring. That is identity text, not run vintage;
// only a manifest date token or a strictly-valid decision_date may satisfy the floor.
const dateLikeSubject = `DATE-LIKE-${TODAY}`
const dateLikeRun = `commodity/runs/${dateLikeSubject}`
write(`${dateLikeRun}/decision_record.json`, JSON.stringify({ decision_date: `${TODAY.slice(0, 4)}-00-10`, action: 'Hold' }))
write(`${dateLikeRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor(dateLikeSubject, dateLikeRun, { scan_date: TODAY, scanned_at: new Date().toISOString() }), null, 2))
assert.equal(readIntakePlan(dateLikeSubject, { swarmId: 'commodity' })!.pool_current, false, 'subject text cannot masquerade as a run date and an impossible decision_date fails closed')

// ---- EXACT RUN ROOT / POINT IN TIME: an explicit historical root wins over standing/newest selection,
//      while traversal, cross-subject, and cross-swarm roots fail closed. -------------------------------
const exactOld = readIntakePlan('SHADOW', { runRoot: SHADOW_COMPLETE })
assert.ok(exactOld, 'an exact contained historical run root is readable')
assert.equal(exactOld!.run_root, SHADOW_COMPLETE, 'the exact root, not the default standing/newest root, is served')
const exactOldPlanFile = latestPlanFileFor('SHADOW', { swarmId: 'research', runRoot: SHADOW_COMPLETE })
assert.ok(String(exactOldPlanFile).includes(SHADOW_COMPLETE), 'scoped staging resolves the plan file from the exact approved call, never a newer shell')
assert.equal(JSON.parse(fs.readFileSync(exactOldPlanFile!, 'utf8')).summary, 'test', 'the exact approved call supplies the plan provenance bytes')
const exactNew = readIntakePlan('SHADOW', { runRoot: `analyses/SHADOW_${YESTERDAY}` })
assert.equal(exactNew, null, 'an exact unfinished root cannot become the authority for a paid selected-call read')
assert.ok(latestPlanFileFor('SHADOW', { runRoot: `analyses/SHADOW_${YESTERDAY}` }), 'the staging helper can still inspect a just-written exact plan')
assert.equal(readIntakePlan('SHADOW', { runRoot: '../outside' }), null, 'path traversal is rejected')
assert.equal(readIntakePlan('SHADOW', { runRoot: RUN }), null, 'a different subject\'s otherwise-valid research root is rejected')
assert.equal(readIntakePlan('GOLD', { swarmId: 'commodity', runRoot: RUN }), null, 'a root in another swarm\'s runs tree is rejected')
assert.equal(latestPlanFileFor('GOLD', { swarmId: 'missing' }), null, 'an unknown swarm fails closed')

// Append-only versions sort numerically, so _v10 is newer than _v9 (the former lexical-max bug).
write(`${commodityRun}/intake/${TODAY}_intake_plan_v9.json`, JSON.stringify(commodityFixture, null, 2))
write(`${commodityRun}/intake/${TODAY}_intake_plan_v10.json`, JSON.stringify(commodityFixture, null, 2))
assert.ok(String(latestPlanFileFor('GOLD', { swarmId: 'commodity' })).endsWith('_v10.json'), 'same-day versions use numeric ordering')

// Research completion is writer-compatible: final_thesis alone is a finished intake baseline. A newer
// thesis-only run must beat an older run that has a decision record, because /research:intake writes into
// that newer finished root too.
const FINAL_OLD = `analyses/FINALONLY_${day(-4)}`
const FINAL_NEW = `analyses/FINALONLY_${day(-2)}`
write(`${FINAL_OLD}/decision_record.json`, '{}')
write(`${FINAL_OLD}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('FINALONLY', FINAL_OLD, { summary: 'old decision root' }), null, 2))
write(`${FINAL_NEW}/final_thesis.md`, '# final thesis only\n')
write(`${FINAL_NEW}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('FINALONLY', FINAL_NEW, { summary: 'new thesis-only root' }), null, 2))
const finalOnly = readIntakePlan('FINALONLY')
assert.ok(finalOnly)
assert.equal(finalOnly!.run_root, FINAL_NEW, 'a newer final_thesis-only research run is the standing intake root')
assert.equal(finalOnly!.summary, 'new thesis-only root')

// Manifest swarms do require their exact object decision record. A stray plan under a merely-created
// singleton folder is not a finished baseline and cannot be served, even through an exact-root selector.
const unfinishedSingleton = 'commodity/runs/NODECISION'
write(`${unfinishedSingleton}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('NODECISION', unfinishedSingleton, {}), null, 2))
assert.equal(readIntakePlan('NODECISION', { swarmId: 'commodity' }), null, 'a singleton plan without its decision record is not readable')
assert.equal(readIntakePlan('NODECISION', { swarmId: 'commodity', runRoot: unfinishedSingleton }), null, 'an exact selector cannot bypass the singleton decision requirement')

// The shared manifest subject contract, not research's 15-character ticker cap, governs non-research
// subjects. This long unit is accepted by normalizeDataSubject and resolves through the manifest template.
const longSubject = 'PHYSICAL-MARKET-SIGNAL-20260813'
const longRun = `commodity/runs/${longSubject}`
write(`${longRun}/decision_record.json`, JSON.stringify({ decision_date: TODAY, action: 'Hold' }))
write(`${longRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor(longSubject, longRun, {}), null, 2))
assert.equal(readIntakePlan(longSubject, { swarmId: 'commodity' })!.subject, longSubject, 'manifest-owned long subjects use the shared normalizer')

// Plan identity is frozen to the server-selected swarm/subject. Any conflicting prompt-written identity
// fails the whole plan closed; it is never silently relabelled as another subject's recommendation.
const identityRun = `analyses/IDENTITY_${TODAY}`
write(`${identityRun}/final_thesis.md`, '# thesis\n')
write(`${identityRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(emptyPlanFor('OTHER', identityRun, {}), null, 2))
assert.equal(readIntakePlan('IDENTITY'), null, 'a mismatched schema-v1 ticker is rejected')
write(`${identityRun}/intake/${TODAY}_intake_plan_v2.json`, JSON.stringify({ ...emptyPlanFor('IDENTITY', identityRun, {}), subject: 'OTHER' }, null, 2))
assert.equal(readIntakePlan('IDENTITY'), null, 'a mismatched explicit subject is rejected')
write(`${identityRun}/intake/${TODAY}_intake_plan_v3.json`, JSON.stringify({ ...emptyPlanFor('IDENTITY', identityRun, {}), swarm: 'commodity' }, null, 2))
assert.equal(readIntakePlan('IDENTITY'), null, 'a mismatched explicit swarm is rejected')

// Every evidence/trigger path is canonical and subject-contained. Cross-subject, traversal, path aliases,
// absolute paths, and nested symlinks fail the plan closed; a canonical absent audit path remains valid.
const pathPlan = (subject: string, runRoot: string, docPath: string, triggerPath = docPath) => ({
  ...planFixture,
  ticker: subject,
  run_root: runRoot,
  new_docs: [{ ...planFixture.new_docs[0], path: docPath, entry_orbs: [{ module: 'alpha', agent: 'alpha-thing', why: 'valid', confidence: 0.8 }] }],
  rerun_plan: {
    materiality_gate: 60,
    entry_orbs: [{ module: 'alpha', agent: 'alpha-thing' }],
    commands: [{ ...planFixture.rerun_plan.commands[0], triggered_by: [triggerPath] }],
    note_only: [],
  },
})
for (const [subject, badDoc, badTrigger] of [
  ['CROSSPATH', 'data/OTHER/doc.pdf', 'data/OTHER/doc.pdf'],
  ['TRAVERSE', 'data/TRAVERSE/../OTHER/doc.pdf', 'data/TRAVERSE/../OTHER/doc.pdf'],
  ['ALIASPATH', 'data/ALIASPATH//doc.pdf', 'data/ALIASPATH//doc.pdf'],
  ['ABSPATH', '/tmp/doc.pdf', '/tmp/doc.pdf'],
  ['BADTRIGGER', 'data/BADTRIGGER/doc.pdf', 'data/OTHER/doc.pdf'],
] as const) {
  const rr = `analyses/${subject}_${TODAY}`
  write(`${rr}/final_thesis.md`, '# thesis\n')
  write(`${rr}/intake/${TODAY}_intake_plan.json`, JSON.stringify(pathPlan(subject, rr, badDoc, badTrigger), null, 2))
  assert.equal(readIntakePlan(subject), null, `${subject}: a non-contained/non-canonical evidence path is rejected`)
}
const linkRun = `analyses/LINKPATH_${TODAY}`
write(`${linkRun}/final_thesis.md`, '# thesis\n')
write('data/OTHER/secret.pdf', 'not LINKPATH evidence')
fs.mkdirSync(path.join(REPO, 'data/LINKPATH'), { recursive: true })
fs.symlinkSync(path.join(REPO, 'data/OTHER/secret.pdf'), path.join(REPO, 'data/LINKPATH/linked.pdf'))
write(`${linkRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(pathPlan('LINKPATH', linkRun, 'data/LINKPATH/linked.pdf'), null, 2))
assert.equal(readIntakePlan('LINKPATH'), null, 'a nested pool symlink cannot redirect evidence to another subject')

const goodPathRun = `analyses/GOODPATH_${TODAY}`
write(`${goodPathRun}/final_thesis.md`, '# thesis\n')
write(`${goodPathRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(pathPlan('GOODPATH', goodPathRun, 'data/GOODPATH/external/provider/doc.pdf'), null, 2))
assert.equal(readIntakePlan('GOODPATH')!.new_docs[0].path, 'data/GOODPATH/external/provider/doc.pdf', 'a canonical subject-contained audit path is retained')

// ---- DURABLE ONE-TIME RECEIPTS ---------------------------------------------------------------
// Two plan orbs, an unchanged resulting decision, and append-only receipts committed with the run.
// The first receipt removes ONLY alpha; a second click can buy beta but cannot buy alpha again. The
// second receipt retires the plan. Altering committed receipt bytes never re-opens either paid command.
const receiptRun = `analyses/RECEIPT_${TODAY}`
const receiptDecision = { ticker: 'RECEIPT', decision: 'Watchlist', confidence_score: 52 }
const receiptSourceFp = writeDecision(receiptRun, receiptDecision)
write(`${receiptRun}/final_thesis.md`, '# receipt thesis\n')
const receiptPlanRaw = {
  ...planFixture,
  swarm: 'research', subject: 'RECEIPT', ticker: 'RECEIPT', run_root: receiptRun,
  decision_fingerprint: receiptSourceFp,
  new_docs: [{ ...planFixture.new_docs[0], path: 'data/RECEIPT/new.pdf', entry_orbs: [
    { module: 'alpha', agent: 'alpha-thing', why: 'alpha input', confidence: 0.9 },
    { module: 'beta', agent: 'beta-thing', why: 'beta input', confidence: 0.9 },
  ] }],
  rerun_plan: {
    materiality_gate: 60,
    entry_orbs: [{ module: 'alpha', agent: 'alpha-thing' }, { module: 'beta', agent: 'beta-thing' }],
    commands: [
      { command: 'ignored', module: 'alpha', agent: 'alpha-thing', cascade_modules: [], triggered_by: ['data/RECEIPT/new.pdf'] },
      { command: 'ignored', module: 'beta', agent: 'beta-thing', cascade_modules: [], triggered_by: ['data/RECEIPT/new.pdf'] },
    ],
    note_only: [],
  },
}
const receiptPlanPath = `${receiptRun}/intake/${TODAY}_intake_plan.json`
write(receiptPlanPath, JSON.stringify(receiptPlanRaw, null, 2))
const receiptPlanHash = intakePlanSha256(receiptPlanRaw)!
assert.equal(readIntakePlan('RECEIPT')!.rerun_plan.commands.length, 2, 'both unconsumed receipt-plan orbs begin actionable')

const commitReceipt = (payload: any, message: string): string => {
  const receiptId = intakeExecutionReceiptId(payload)
  const stamp = payload.completed_at.replace(/[-:.]/g, '')
  const rel = `${payload.run_root}/intake/receipts/${stamp}_${receiptId.slice(7, 19)}.json`
  write(rel, JSON.stringify({ ...payload, receipt_id: receiptId }, null, 2) + '\n')
  execFileSync('git', ['-C', REPO, 'add', '--', rel])
  execFileSync('git', ['-C', REPO, 'commit', '-q', '-m', message])
  return rel
}
const receiptPayload = (module: string, agent: string, completedAt: string) => ({
  schema_version: 'intake-execution-receipt/1' as const,
  swarm: 'research', subject: 'RECEIPT', run_root: receiptRun,
  plan_path: receiptPlanPath, plan_sha256: receiptPlanHash,
  source_decision_fingerprint: receiptSourceFp,
  executed_against_decision_fingerprint: receiptSourceFp,
  executed_orbs: [{ module, agent }],
  completed_at: completedAt,
  // Intentionally identical decision bytes: consumption is proven by the receipt, never by a changed fp.
  result_decision_fingerprint: receiptSourceFp,
  result_decision_id: null,
})
const firstReceipt = commitReceipt(receiptPayload('alpha', 'alpha-thing', `${TODAY}T12:00:00.101Z`), 'first intake receipt')
const afterFirstReceipt = readIntakePlan('RECEIPT')!
assert.equal(afterFirstReceipt.consumed, false, 'one of two proved orbs is partial consumption')
assert.deepEqual(afterFirstReceipt.rerun_plan.commands.map((command) => command.agent), ['beta-thing'], 'the same alpha orb cannot be bought twice; beta remains')
assert.equal(afterFirstReceipt.actionable, true, 'identical resulting decision bytes do not strand the remaining orb')

commitReceipt(receiptPayload('beta', 'beta-thing', `${TODAY}T12:00:00.102Z`), 'second intake receipt')
const afterSecondReceipt = readIntakePlan('RECEIPT')!
assert.equal(afterSecondReceipt.consumed, true, 'all exact plan orbs proved → plan consumed')
assert.equal(afterSecondReceipt.rerun_plan.commands.length, 0)

fs.appendFileSync(path.join(REPO, firstReceipt), ' ')
const afterTamper = readIntakePlan('RECEIPT')!
assert.equal(afterTamper.actionable, false, 'receipt bytes that differ from committed HEAD fail closed')
assert.equal(afterTamper.rerun_plan.commands.length, 0, 'tampering never re-opens a paid command')
assert.ok(afterTamper.widened.some((note) => note.includes('receipt')), 'tampered proof is explicit in the audit trail')

// A receipt chain advances through the exact decision each orb executed against. Only a contiguous chain
// ending at the current decision can prove consumption; reverting to an intermediate decision freezes the
// plan and must not credit the later branch's orb. An unrelated historical plan receipt is ignored only
// after its own structure/self-hash has been validated.
const chainRun = `analyses/CHAIN_${TODAY}`
const chainD0 = { ticker: 'CHAIN', decision: 'Watchlist', confidence_score: 40 }
const chainD1 = { ...chainD0, confidence_score: 41 }
const chainD2 = { ...chainD0, confidence_score: 42 }
const chainFp0 = writeDecision(chainRun, chainD0)
write(`${chainRun}/final_thesis.md`, '# chain thesis\n')
const chainPlanPath = `${chainRun}/intake/${TODAY}_intake_plan.json`
const chainPlanRaw = {
  ...receiptPlanRaw, subject: 'CHAIN', ticker: 'CHAIN', run_root: chainRun,
  decision_fingerprint: chainFp0,
  new_docs: [{ ...receiptPlanRaw.new_docs[0], path: 'data/CHAIN/new.pdf' }],
  rerun_plan: {
    ...receiptPlanRaw.rerun_plan,
    commands: receiptPlanRaw.rerun_plan.commands.map((command) => ({ ...command, triggered_by: ['data/CHAIN/new.pdf'] })),
  },
}
write(chainPlanPath, JSON.stringify(chainPlanRaw, null, 2))
const chainPlanHash = intakePlanSha256(chainPlanRaw)!
commitReceipt({
  schema_version: 'intake-execution-receipt/1' as const,
  swarm: 'research', subject: 'CHAIN', run_root: chainRun,
  plan_path: `${chainRun}/intake/${YESTERDAY}_intake_plan.json`, plan_sha256: `sha256:${'c'.repeat(64)}`,
  source_decision_fingerprint: chainFp0, executed_against_decision_fingerprint: chainFp0,
  executed_orbs: [{ module: 'gamma', agent: 'old-plan-orb' }],
  completed_at: `${TODAY}T11:00:00.100Z`, result_decision_fingerprint: chainFp0, result_decision_id: null,
}, 'unrelated historical plan receipt')
const chainFp1 = writeDecision(chainRun, chainD1)
commitReceipt({
  schema_version: 'intake-execution-receipt/1' as const,
  swarm: 'research', subject: 'CHAIN', run_root: chainRun,
  plan_path: chainPlanPath, plan_sha256: chainPlanHash,
  source_decision_fingerprint: chainFp0, executed_against_decision_fingerprint: chainFp0,
  executed_orbs: [{ module: 'alpha', agent: 'alpha-thing' }],
  completed_at: `${TODAY}T12:00:00.100Z`, result_decision_fingerprint: chainFp1, result_decision_id: null,
}, 'chain receipt one')
assert.deepEqual(readIntakePlan('CHAIN')!.rerun_plan.commands.map((command) => command.agent), ['beta-thing'])
const chainFp2 = writeDecision(chainRun, chainD2)
commitReceipt({
  schema_version: 'intake-execution-receipt/1' as const,
  swarm: 'research', subject: 'CHAIN', run_root: chainRun,
  plan_path: chainPlanPath, plan_sha256: chainPlanHash,
  source_decision_fingerprint: chainFp0, executed_against_decision_fingerprint: chainFp1,
  executed_orbs: [{ module: 'beta', agent: 'beta-thing' }],
  completed_at: `${TODAY}T12:00:00.200Z`, result_decision_fingerprint: chainFp2, result_decision_id: null,
}, 'chain receipt two')
assert.equal(readIntakePlan('CHAIN')!.consumed, true, 'the full D0→D1→D2 receipt chain consumes both orbs')
writeDecision(chainRun, chainD1)
const revertedChain = readIntakePlan('CHAIN')!
assert.equal(revertedChain.consumed, false, 'a D1 reversion does not falsely consume the D1→D2 orb')
assert.equal(revertedChain.actionable, false, 'a reverted branch freezes rather than re-spending an old orb')
assert.equal(revertedChain.rerun_plan.commands.length, 0)
assert.ok(revertedChain.widened.some((note) => note.includes('reverted')))

// Prompt output is not execution authority until its exact bytes are in HEAD. Dirty/uncommitted bytes
// remain visible for audit but expose no paid command; committing those exact bytes restores authority.
const atomicRun = `analyses/ATOMIC_${TODAY}`
const atomicFp = writeDecision(atomicRun, { ticker: 'ATOMIC', decision: 'Watchlist', confidence_score: 50 })
write(`${atomicRun}/final_thesis.md`, '# atomic thesis\n')
const atomicPath = `${atomicRun}/intake/${TODAY}_intake_plan.json`
const atomicRaw = {
  ...receiptPlanRaw, subject: 'ATOMIC', ticker: 'ATOMIC', run_root: atomicRun,
  decision_fingerprint: atomicFp,
  new_docs: [{ ...receiptPlanRaw.new_docs[0], path: 'data/ATOMIC/new.pdf', entry_orbs: [
    { module: 'alpha', agent: 'alpha-thing', why: 'changed', confidence: 0.9 },
  ] }],
  rerun_plan: {
    ...receiptPlanRaw.rerun_plan,
    entry_orbs: [{ module: 'alpha', agent: 'alpha-thing' }],
    commands: [{ ...receiptPlanRaw.rerun_plan.commands[0], triggered_by: ['data/ATOMIC/new.pdf'] }],
  },
}
write(atomicPath, JSON.stringify(atomicRaw, null, 2))
assert.equal(readIntakePlan('ATOMIC')!.actionable, true, 'exact committed plan begins actionable')
fs.writeFileSync(path.join(REPO, atomicPath), JSON.stringify({ ...atomicRaw, summary: 'dirty bytes' }, null, 2))
const dirtyPlan = readIntakePlan('ATOMIC')!
assert.equal(dirtyPlan.actionable, false)
assert.equal(dirtyPlan.rerun_plan.commands.length, 0, 'dirty plan bytes never authorize spend')
execFileSync('git', ['-C', REPO, 'add', '--', atomicPath])
execFileSync('git', ['-C', REPO, 'commit', '-q', '-m', 'commit exact atomic plan'])
assert.equal(readIntakePlan('ATOMIC')!.actionable, true, 'committing the exact bytes restores authority')

// A dangling receipts symlink is an extant unsafe entry, not "no receipts yet". Both the display reader
// and paid launcher consume `actionable`; it must fail closed before spend even though existsSync is false.
const danglingRun = `analyses/DANGLING_${TODAY}`
const danglingFp = writeDecision(danglingRun, { ticker: 'DANGLING', decision: 'Watchlist', confidence_score: 50 })
write(`${danglingRun}/final_thesis.md`, '# dangling thesis\n')
write(`${danglingRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify({
  ...atomicRaw, subject: 'DANGLING', ticker: 'DANGLING', run_root: danglingRun,
  decision_fingerprint: danglingFp,
  new_docs: [{ ...atomicRaw.new_docs[0], path: 'data/DANGLING/new.pdf' }],
  rerun_plan: { ...atomicRaw.rerun_plan, commands: [
    { ...atomicRaw.rerun_plan.commands[0], triggered_by: ['data/DANGLING/new.pdf'] },
  ] },
}, null, 2))
fs.symlinkSync(path.join(REPO, danglingRun, 'missing-receipts'), path.join(REPO, danglingRun, 'intake/receipts'))
const danglingPlan = readIntakePlan('DANGLING')!
assert.equal(danglingPlan.actionable, false, 'dangling receipts symlink freezes the plan before paid work')
assert.equal(danglingPlan.rerun_plan.commands.length, 0)
assert.ok(danglingPlan.widened.some((note) => note.includes('receipt')))

// A well-formed but stale source fingerprint is likewise visible and non-actionable, never rebound to the
// current decision by the HTTP/read layer.
const staleFpRun = `analyses/STALEFP_${TODAY}`
write(`${staleFpRun}/final_thesis.md`, '# stale-fp thesis\n')
writeDecision(staleFpRun, { ticker: 'STALEFP', decision: 'Buy', confidence_score: 61 })
write(`${staleFpRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify({
  ...receiptPlanRaw, subject: 'STALEFP', ticker: 'STALEFP', run_root: staleFpRun,
  decision_fingerprint: `sha256:${'f'.repeat(64)}`,
  new_docs: [{ ...receiptPlanRaw.new_docs[0], path: 'data/STALEFP/new.pdf' }],
  rerun_plan: { ...receiptPlanRaw.rerun_plan, commands: [{ ...receiptPlanRaw.rerun_plan.commands[0], triggered_by: ['data/STALEFP/new.pdf'] }] },
}, null, 2))
const staleFpPlan = readIntakePlan('STALEFP')!
assert.equal(staleFpPlan.actionable, false)
assert.equal(staleFpPlan.rerun_plan.commands.length, 0)
assert.equal(staleFpPlan.decision_fingerprint, `sha256:${'f'.repeat(64)}`, 'reader preserves authored stale identity for audit; it never rebinds')

// The commodity command must create its precise durable witness BEFORE the pool scan and write it on every
// plan. This static pin closes the prompt-only half of the false-fresh regression (there is no compiler for
// slash commands, so the executable contract belongs beside the reader tests).
const commodityPrompt = fs.readFileSync(path.join(SOURCE_REPO, '.claude/commands/commodity/intake.md'), 'utf8')
const captureAt = commodityPrompt.indexOf('SCANNED_AT="$(python3')
const scanAt = commodityPrompt.indexOf("pathlib.Path('data') / commodity")
assert.ok(captureAt >= 0 && scanAt > captureAt, 'commodity intake captures SCANNED_AT before its document scan')
assert.ok(commodityPrompt.includes('isoformat(timespec="milliseconds")'), 'commodity intake uses sub-second canonical UTC, not whole-second date')
assert.ok(commodityPrompt.includes('scanned_at: "<SCANNED_AT>"'), 'commodity intake writes the durable witness even on the empty-plan path')
assert.ok(
  commodityPrompt.includes('decision_date') && commodityPrompt.includes("floor = day.timestamp() if wm >"),
  'commodity intake has the checkout-safe decision-date fallback',
)
const researchPrompt = fs.readFileSync(path.join(SOURCE_REPO, '.claude/commands/research/intake.md'), 'utf8')
assert.ok(researchPrompt.indexOf('SCANNED_AT="$(python3') < researchPrompt.indexOf("pool = pathlib.Path('data') / ticker"), 'research intake captures its high-resolution witness before scanning')
assert.ok(researchPrompt.includes('isoformat(timespec="milliseconds")'), 'research intake has the same sub-second ordering contract')
assert.ok(researchPrompt.includes('if [ "$CURSOR_STATUS" -ne 0 ]'), 'every cursor helper failure stops instead of falling through to a false-fresh watermark')
assert.ok(researchPrompt.includes('Legacy finished calls predate the run cursor'), 'legacy calls conservatively rescan from their run day')

// A syntactically valid model answer cannot omit one scanner-observed file and settle the automatic
// watermark as "nothing changed". The scanner index is independently reproduced by the server, and every
// row must carry a complete classification plus the command implied by a material filing.
const coveredRun = `analyses/COVERED_${TODAY}`
const coveredDecision = { ticker: 'COVERED', decision: 'Watchlist', confidence_score: 50 }
const coveredFp = writeDecision(coveredRun, coveredDecision)
write(`${coveredRun}/final_thesis.md`, '# covered thesis\n')
fs.mkdirSync(path.join(REPO, `${coveredRun}/intake`), { recursive: true })
fs.writeFileSync(path.join(REPO, `${coveredRun}/intake/run_evidence_cursor.json`), JSON.stringify({
  version: 1, ticker: 'COVERED', run_root: coveredRun, started_at: `${TODAY}T00:00:00.000Z`,
}))
write('data/COVERED/quarterly_filing.pdf', 'material filing bytes')
const coveredArrival = Math.floor(Math.max(
  fs.statSync(path.join(REPO, 'data/COVERED/quarterly_filing.pdf')).mtimeMs,
  fs.statSync(path.join(REPO, 'data/COVERED/quarterly_filing.pdf')).ctimeMs,
))
const coveredScannedAt = new Date().toISOString()
const coveredPlan = {
  schema_version: '1.1', swarm: 'research', subject: 'COVERED', ticker: 'COVERED',
  run_root: coveredRun, decision_fingerprint: coveredFp, scan_date: TODAY,
  scanned_at: coveredScannedAt, watermark: `${coveredRun}/final_thesis.md`,
  evidence_files: [{ path: 'data/COVERED/quarterly_filing.pdf', arrival_ms: coveredArrival }],
  new_docs: [{
    path: 'data/COVERED/quarterly_filing.pdf', provider: null, source_type: 'quarterly_filing', tier: 2,
    as_of: TODAY, claims_summary: 'A material filing arrived.', materiality_score: 90,
    impact_direction: 'mixed', entry_orbs: [
      { module: 'alpha', agent: 'alpha-thing', why: 'The filing changes the operating evidence.', confidence: 0.95 },
    ],
  }],
  rerun_plan: {
    materiality_gate: 60, entry_orbs: [{ module: 'alpha', agent: 'alpha-thing' }],
    commands: [{
      command: '/research:rerun alpha alpha-thing COVERED', module: 'alpha', agent: 'alpha-thing',
      cascade_modules: ['alpha', 'beta'], triggered_by: ['data/COVERED/quarterly_filing.pdf'],
    }],
    note_only: [],
  },
  verdict: 'scoped_rerun', summary: 'The filing requires a scoped update.',
}
write(`${coveredRun}/intake/${TODAY}_intake_plan.json`, JSON.stringify(coveredPlan, null, 2))
const coveredRead = readIntakePlan('COVERED', { requireDecision: true })!
assert.equal(coveredRead.coverage_complete, true, 'the exact deterministic evidence index is complete')
assert.equal(intakePlanCoversAutomaticPool(coveredRead, {
  swarm: 'research', subject: 'COVERED', runRoot: coveredRun, decisionFingerprint: coveredFp,
}, intakePoolNewest('COVERED', 'research').newestMs), true, 'complete classified evidence can settle the automatic watermark')

write(`${coveredRun}/intake/${TODAY}_intake_plan_v2.json`, JSON.stringify({
  ...coveredPlan, evidence_files: [], new_docs: [],
  rerun_plan: { materiality_gate: 60, entry_orbs: [], commands: [], note_only: [] },
  verdict: 'note_only', summary: 'Nothing changed.',
}, null, 2))
const omittedEvidence = readIntakePlan('COVERED', { requireDecision: true })!
assert.equal(omittedEvidence.coverage_complete, false, 'omitting one observed filing fails the no-omission proof')
assert.equal(intakePlanCoversAutomaticPool(omittedEvidence, {
  swarm: 'research', subject: 'COVERED', runRoot: coveredRun, decisionFingerprint: coveredFp,
}, intakePoolNewest('COVERED', 'research').newestMs), false, 'an omitted filing never advances the automatic watermark')

write(`${coveredRun}/intake/${TODAY}_intake_plan_v3.json`, JSON.stringify({
  ...coveredPlan,
  rerun_plan: {
    materiality_gate: 101, entry_orbs: [], commands: [],
    note_only: [{ path: 'data/COVERED/quarterly_filing.pdf', reason: 'below a model-raised gate' }],
  },
  verdict: 'note_only', summary: 'Nothing changed under a higher gate.',
}, null, 2))
assert.equal(
  readIntakePlan('COVERED', { requireDecision: true })!.coverage_complete,
  false,
  'the model cannot raise the fixed materiality gate to suppress a material filing rerun',
)

// Automatic intake binds to the same visible, unsuperseded object decision as Calls. A newer partial
// final_thesis shell, or a newer run corrected out of the append-only ledger, must never steal ownership.
const partialOld = `analyses/PARTIAL_${YESTERDAY}`
writeDecision(partialOld, { ticker: 'PARTIAL', decision: 'Watchlist', confidence_score: 50 })
write(`${partialOld}/final_thesis.md`, '# standing call\n')
write(`analyses/PARTIAL_${TODAY}/final_thesis.md`, '# incomplete newer run\n')
assert.equal(
  resolveIntakeRunRoot('PARTIAL', { requireDecision: true }, true)?.runRoot,
  partialOld,
  'a final-thesis-only partial cannot own unattended work',
)

const correctedOld = `analyses/CORRECTED_${YESTERDAY}`
const correctedNew = `analyses/CORRECTED_${TODAY}`
writeDecision(correctedOld, { ticker: 'CORRECTED', decision: 'Watchlist', confidence_score: 50 })
write(`${correctedOld}/final_thesis.md`, '# corrected standing call\n')
writeDecision(correctedNew, { ticker: 'CORRECTED', decision: 'Buy', confidence_score: 70 })
write(`${correctedNew}/final_thesis.md`, '# superseded call\n')
write(`${correctedNew}/corrections.json`, JSON.stringify({
  schema: 'corrections/v1',
  superseded_by: { run_root: correctedOld, reason: 'replaced', date: TODAY },
}, null, 2))
assert.equal(
  resolveIntakeRunRoot('CORRECTED', { requireDecision: true }, true)?.runRoot,
  correctedOld,
  'automatic intake skips a superseded run just like the Calls ledger',
)

// A newer call written/committed only on this machine must not hide the older call that every host can
// see. Simulate the push outage by writing terminal bytes after HEAD without committing them.
const publishedOld = `analyses/PUBLISHSAFE_${YESTERDAY}`
writeDecision(publishedOld, { ticker: 'PUBLISHSAFE', decision: 'Watchlist', confidence_score: 50 })
write(`${publishedOld}/final_thesis.md`, '# shared standing call\n')
const privateNew = `analyses/PUBLISHSAFE_${TODAY}`
fs.mkdirSync(path.join(REPO, privateNew), { recursive: true })
fs.writeFileSync(path.join(REPO, privateNew, 'decision_record.json'), JSON.stringify({ ticker: 'PUBLISHSAFE', decision: 'Buy', confidence_score: 75 }))
fs.writeFileSync(path.join(REPO, privateNew, 'final_thesis.md'), '# local-only call after failed push\n')
assert.equal(
  resolveIntakeRunRoot('PUBLISHSAFE', { requireDecision: true }, true)?.runRoot,
  publishedOld,
  'a local-only newer call cannot replace the published automatic-work owner',
)
fs.writeFileSync(path.join(REPO, publishedOld, 'corrections.json'), JSON.stringify({
  schema: 'corrections/v1',
  superseded_by: { run_root: privateNew, reason: 'local-only correction after failed push', date: TODAY },
}, null, 2))
assert.equal(
  resolveIntakeRunRoot('PUBLISHSAFE', { requireDecision: true }, true)?.runRoot,
  publishedOld,
  'an unpushed local correction cannot hide the published standing call',
)

const resumeSource = `analyses/RESUMEAUTO_${YESTERDAY}`
const resumeTarget = `analyses/RESUMEAUTO_${TODAY}`
const resumeFp = writeDecision(resumeSource, { ticker: 'RESUMEAUTO', decision: 'Watchlist', confidence_score: 50 })
write(`${resumeSource}/final_thesis.md`, '# source call\n')
const resumePlanPath = `${resumeSource}/intake/${TODAY}_intake_plan.json`
const resumeRaw = {
  ...atomicRaw, subject: 'RESUMEAUTO', ticker: 'RESUMEAUTO', run_root: resumeSource,
  decision_fingerprint: resumeFp,
  new_docs: [{ ...atomicRaw.new_docs[0], path: 'data/RESUMEAUTO/new.pdf' }],
  rerun_plan: { ...atomicRaw.rerun_plan, commands: [{ ...atomicRaw.rerun_plan.commands[0], triggered_by: ['data/RESUMEAUTO/new.pdf'] }] },
}
write(resumePlanPath, JSON.stringify(resumeRaw, null, 2))
const resumeHash = intakePlanSha256(resumeRaw)!
write(`${resumeTarget}/intake/${TODAY}_intake_plan.json`, JSON.stringify({ ...resumeRaw, staged_for_scoped_rerun: true }, null, 2))
assert.equal(stagedIntakePlanMatches({
  subject: 'RESUMEAUTO', swarmId: 'research', sourceRunRoot: resumeSource, targetRunRoot: resumeTarget,
  planPath: resumePlanPath, planSha256: resumeHash, sourceDecisionFingerprint: resumeFp,
}), true, 'the exact server-staged partial can resume automatically')
fs.writeFileSync(
  path.join(REPO, resumeTarget, 'intake', `${TODAY}_intake_plan.json`),
  JSON.stringify({ ...resumeRaw, summary: 'changed staged bytes', staged_for_scoped_rerun: true }, null, 2),
)
assert.equal(stagedIntakePlanMatches({
  subject: 'RESUMEAUTO', swarmId: 'research', sourceRunRoot: resumeSource, targetRunRoot: resumeTarget,
  planPath: resumePlanPath, planSha256: resumeHash, sourceDecisionFingerprint: resumeFp,
}), false, 'changed staged bytes cannot authorize an automatic resume')
// Even if a newer source plan arrives, the independently-authorized staged plan remains resumable first.
// The newer job then stays retryable and runs from the next safe dated root.
write(`${resumeSource}/intake/${TODAY}_intake_plan_v2.json`, JSON.stringify({ ...resumeRaw, summary: 'newer B plan' }, null, 2))
assert.equal(stagedIntakeResumeForTarget({
  subject: 'RESUMEAUTO', swarmId: 'research', targetRunRoot: resumeTarget,
}), null, 'tampered staged bytes are never recovered')
write(`${resumeTarget}/intake/${TODAY}_intake_plan.json`, JSON.stringify({ ...resumeRaw, staged_for_scoped_rerun: true }, null, 2))
assert.equal(stagedIntakeResumeForTarget({
  subject: 'RESUMEAUTO', swarmId: 'research', targetRunRoot: resumeTarget,
})?.planSha256, resumeHash, 'staged plan A remains resumable while newer plan B waits')

// The preflight must recurse through the whole evidence pool. A readable subject root with one nested
// provider directory unavailable is not an empty/healthy pool: treating it as such would advance the
// automatic watermark past evidence the intake command could not read.
const nestedPool = path.join(REPO, 'data/NESTEDAUTH/external/provider')
fs.mkdirSync(nestedPool, { recursive: true })
fs.writeFileSync(path.join(nestedPool, 'filing.pdf'), 'new evidence')
fs.chmodSync(nestedPool, 0o000)
try {
  assert.throws(() => fs.readdirSync(nestedPool), 'fixture must make the nested provider unreadable')
  assert.equal(
    intakePoolAuthorityAvailable('NESTEDAUTH', 'research'),
    false,
    'an unreadable nested evidence provider fails the whole company-pool authority closed',
  )
} finally {
  fs.chmodSync(nestedPool, 0o700)
}

console.log('intake.test.ts: all assertions passed')
fs.rmSync(REPO, { recursive: true, force: true })
