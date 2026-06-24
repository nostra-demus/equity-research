// Regression: the auto-resume scan must NOT resurrect a DELIBERATE `--until` partial run.
//
// Bug (techmuns CHANGES_REQUESTED on PR #80, HIGH): a signal launched with a target module
// (`/screener:signal <sig> <module>` — "run through <module> then stop, continue the rest later")
// stops at a NON-terminal routing with no candidates.json and no .aborted. Its target was never
// persisted to disk (intake.json's schema carries no `until`), so on disk it looked identical to a
// run broken mid-flight. listResumableSignals therefore classified it "resumable" and the cockpit
// auto-relaunched it WITHOUT the target → the full gauntlet ran to completion, locking a thesis and
// surfacing candidates the user explicitly deferred, and spending unbudgeted CLI.
//
// Fix: launch() drops a `.target` marker when a signal is launched with a target module;
// listResumableSignals excludes any run carrying that marker (a deliberate partial is continued by
// hand, never auto-resumed — auto-resume cannot honor the target and would over-run the deferred stop).
//
// EXPECTED VALUES ARE PINNED TO AUTHORITY, not to current code behaviour:
//   • the `--until` run must be EXCLUDED  — techmuns' review + launcher.ts's own "stop at the target,
//     continue the rest later" contract (a deliberate stop is not an interruption);
//   • the terminal-routing run must be EXCLUDED — `watchlist_no_edge` ∈ routing.terminal in
//     .claude/agents/screener/SWARM.md;
//   • .aborted / candidates.json / missing-intake runs are EXCLUDED, a plain non-terminal partial is
//     INCLUDED — the documented listResumableSignals contract.
//
// Crux: the `--until` fixture (A) is byte-for-byte identical on disk to the genuine-interruption
// fixture (B) EXCEPT for the `.target` marker — so this test is RED on the pre-fix code (A leaks in as
// resumable) and GREEN only with the exclusion. Run: npx tsx test/screener-resume-target.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// listResumableSignals reads REPO_ROOT/screener/runs and the screener SWARM manifest + module roster
// (REPO_ROOT/.claude/agents). Point REPO_ROOT at a tmp dir BEFORE screener.ts is imported (config
// resolves ENGINE_REPO_ROOT at module-eval time), and symlink in the REAL .claude tree so the manifest
// (routing.terminal) and module names are the genuine ones, not a hand-rebuilt stub.
const here = path.dirname(fileURLToPath(import.meta.url))
const realRepo = path.resolve(here, '..', '..', '..') // ui/server/test -> repo root
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-resume-'))
process.env.ENGINE_REPO_ROOT = root
fs.symlinkSync(path.join(realRepo, '.claude'), path.join(root, '.claude'), 'dir')

const runsDir = path.join(root, 'screener', 'runs')
fs.mkdirSync(runsDir, { recursive: true })

// Build one SIG run folder. `synthesisRouting` writes signal-gate/99_*-synthesis.md with that Routing
// line (PROMOTE = non-terminal "continue"; watchlist_no_edge = terminal). Optional .target / .aborted /
// candidates.json markers reproduce each disk shape the classifier must tell apart.
function mkRun(sigId: string, opts: { intake?: boolean; synthesisRouting?: string; target?: string; aborted?: boolean; candidates?: boolean }): void {
  const dir = path.join(runsDir, sigId)
  fs.mkdirSync(dir, { recursive: true })
  if (opts.intake !== false) fs.writeFileSync(path.join(dir, 'intake.json'), JSON.stringify({ signal_id: sigId, headline: `${sigId} headline long enough` }) + '\n')
  if (opts.synthesisRouting) {
    const mdir = path.join(dir, 'signal-gate')
    fs.mkdirSync(mdir, { recursive: true })
    fs.writeFileSync(path.join(mdir, '99_signal-gate-synthesis.md'), `# Signal gate synthesis\n\nRouting: ${opts.synthesisRouting}\n`)
  }
  if (opts.target) fs.writeFileSync(path.join(dir, '.target'), JSON.stringify({ module: opts.target, at: new Date().toISOString() }) + '\n')
  if (opts.aborted) fs.writeFileSync(path.join(dir, '.aborted'), JSON.stringify({ at: new Date().toISOString(), reason: 'cancelled' }))
  if (opts.candidates) fs.writeFileSync(path.join(dir, 'candidates.json'), JSON.stringify({ candidates: [] }) + '\n')
}

// SIG ids: valid SIG-YYYYMMDD-<8hex> shapes.
const STAGED = 'SIG-20260612-aaaaaaaa' // --until partial: non-terminal synthesis + .target  → EXCLUDE (the bug)
const INTERRUPTED = 'SIG-20260612-bbbbbbbb' // genuine interruption: non-terminal synthesis, no markers → INCLUDE
const TERMINAL = 'SIG-20260612-cccccccc' // reached a terminal routing → EXCLUDE
const ABORTED = 'SIG-20260612-dddddddd' // user-cancelled (.aborted) → EXCLUDE
const COMPLETED = 'SIG-20260612-eeeeeeee' // ran to the end (candidates.json) → EXCLUDE
const NEVER = 'SIG-20260612-99999999' // folder exists but never launched (no intake.json) → EXCLUDE

mkRun(STAGED, { synthesisRouting: 'PROMOTE', target: 'signal-gate' })
mkRun(INTERRUPTED, { synthesisRouting: 'PROMOTE' })
mkRun(TERMINAL, { synthesisRouting: 'watchlist_no_edge' })
mkRun(ABORTED, { synthesisRouting: 'PROMOTE', aborted: true })
mkRun(COMPLETED, { synthesisRouting: 'PROMOTE', candidates: true })
mkRun(NEVER, { intake: false })

const { listResumableSignals } = await import('../src/screener')

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const resumableIds = (): Set<string> => new Set(listResumableSignals(new Set<string>()).map((r) => r.sigId))

check('a genuinely-interrupted partial run IS resumable (the feature still works)', () => {
  assert.ok(resumableIds().has(INTERRUPTED), `${INTERRUPTED} should be resumable`)
})

check('a deliberate --until partial run (.target marker) is NOT resumable — the bug', () => {
  // RED on pre-fix code: without the .target exclusion this run is disk-identical to INTERRUPTED and
  // leaks in as resumable, then auto-relaunches without the target and over-runs the deferred stop.
  assert.ok(!resumableIds().has(STAGED), `${STAGED} (--until staged) must be excluded from auto-resume`)
})

check('a run that reached a terminal routing (watchlist_no_edge) is NOT resumable', () => {
  assert.ok(!resumableIds().has(TERMINAL), `${TERMINAL} reached a terminal routing — not a breakage`)
})

check('a user-aborted run (.aborted) is NOT resumable', () => {
  assert.ok(!resumableIds().has(ABORTED), `${ABORTED} was cancelled on purpose`)
})

check('a completed run (candidates.json) is NOT resumable', () => {
  assert.ok(!resumableIds().has(COMPLETED), `${COMPLETED} ran to the end`)
})

check('a never-launched folder (no intake.json) is NOT resumable', () => {
  assert.ok(!resumableIds().has(NEVER), `${NEVER} was never launched`)
})

check('exactly the one genuine interruption is surfaced', () => {
  assert.deepEqual([...resumableIds()].sort(), [INTERRUPTED])
})

// best-effort teardown — never leave a tmp sandbox behind (the symlink is removed, not its target)
try { fs.rmSync(root, { recursive: true, force: true }) } catch { /* ignore */ }

console.log(`\n${passed} checks passed`)
