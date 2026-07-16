// The version-history reader (src/what-changed.ts) against REAL git, in throwaway repos.
//
// The states this pins apart are the whole point. `git log` on a never-committed path exits 0 with EMPTY
// stdout — identical to a tracked path with no changes. So "nothing changed", "nothing to compare
// against" and "not committed yet" are three DIFFERENT answers that a naive reader collapses into one.
// Exit 0 + empty is the dangerous case, not the error case.
//
// Also pinned: --follow renames (without it the real EMAR->EMAAR run reports 1 version — a false
// negative), the write-then-commit window (the engine writes; commit-run.sh commits moments later), and
// the refusal to fall back past an unreadable revision (that compares the wrong two things while looking
// perfectly correct).
//
// Hermetic. ENGINE_REPO_ROOT points at a throwaway repo — but note the trap this file itself fell into:
// config.ts resolves REPO_ROOT/ANALYSES_DIR ONCE at module load, and a `?v=N` cache-buster on the import
// specifier reloads what-changed.ts WITHOUT reloading its cached `./config` dep. So a per-case repo does
// not work in-process: every case after the first silently reads the FIRST repo. Hence:
//   - one SHARED repo, one distinct run folder per case (covers the history/rename/memo cases), and
//   - a CHILD PROCESS for the cases that genuinely need a different repo ROOT (no .git, zero commits,
//     a nested non-toplevel root), via the self-invocation block below.
// Each case stages its OWN path (`git add -- <path>`), never `-A`, so one case cannot commit another's
// deliberately-dirty or deliberately-untracked fixture.
// Run: npx tsx test/what-changed.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const THIS_FILE = fileURLToPath(import.meta.url)
const TMPS: string[] = []

// ---- child mode: a case that needs its OWN repo root re-invokes this file in a fresh process, because
// REPO_ROOT is fixed at module load. Prints the read as JSON and exits. ----
if (process.env.WC_CHILD_REPO) {
  process.env.ENGINE_REPO_ROOT = process.env.WC_CHILD_REPO
  const { readWhatChanged } = await import('../src/what-changed')
  const r = await readWhatChanged({ runRoot: process.env.WC_CHILD_RUNROOT || '' })
  process.stdout.write(JSON.stringify(r))
  process.exit(0)
}

let pass = 0
let fail = 0
async function check(name: string, fn: () => Promise<void> | void) {
  try {
    await fn()
    pass++
    console.log(`ok  ${name}`)
  } catch (e: any) {
    fail++
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
  }
}

const REC = (over: Record<string, unknown> = {}) =>
  JSON.stringify({ decision: 'Watchlist', confidence_score: 52, red_flags: ['RF-1 something'], ...over }, null, 2)

function initRepo(dir: string) {
  const g = (...a: string[]) => execFileSync('git', ['-C', dir, ...a], { stdio: 'pipe' })
  g('init', '-q', '-b', 'main')
  g('config', 'user.email', 'test@example.com')
  g('config', 'user.name', 'Test')
  g('config', 'commit.gpgsign', 'false')
}
function mkRepo(opts: { init?: boolean } = {}): string {
  const tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'what-changed-')))
  TMPS.push(tmp)
  if (opts.init !== false) initRepo(tmp)
  return tmp
}
const git = (repo: string, ...a: string[]) => execFileSync('git', ['-C', repo, ...a], { stdio: 'pipe' })

/** Run readWhatChanged in a FRESH process bound to `repo` — the only way to vary REPO_ROOT. */
function childRead(repo: string, runRoot: string): any {
  const tsx = path.join(THIS_FILE, '..', '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
  const out = execFileSync(tsx, [THIS_FILE], {
    env: { ...process.env, WC_CHILD_REPO: repo, WC_CHILD_RUNROOT: runRoot },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return JSON.parse(out)
}

// ---- ONE shared repo; every in-process case gets its OWN run folder ----
const REPO = mkRepo()
process.env.ENGINE_REPO_ROOT = REPO
const { readWhatChanged, whatChangedMarkdown } = await import('../src/what-changed')

/** Write a run folder in the shared repo. Returns the runRoot. */
function write(runRoot: string, record: string, memo?: string): string {
  const abs = path.join(REPO, runRoot)
  fs.mkdirSync(abs, { recursive: true })
  fs.writeFileSync(path.join(abs, 'decision_record.json'), record)
  if (memo !== undefined) fs.writeFileSync(path.join(abs, 'memo.md'), memo)
  return runRoot
}
/** Commit ONLY this run folder (never -A: another case's dirty/untracked fixture must stay that way). */
function commit(runRoot: string, subject: string) {
  git(REPO, 'add', '--', runRoot)
  git(REPO, 'commit', '-qm', subject)
}
git(REPO, 'commit', '-q', '--allow-empty', '-m', 'root') // HEAD must exist for the ls-files probe cases

// ---------------------------------------------------------------------------------------------------

await check("two commits, tree == HEAD blob -> 'compared'; prev = versions[1], cur = versions[0]", async () => {
  const R = write('analyses/TWOVER_2026-07-10', REC({ confidence_score: 60 }), '# memo v1')
  commit(R, 'Research run: TWOVER 2026-07-10 — full dossier')
  write(R, REC({ confidence_score: 52 }), '# memo v2')
  commit(R, 'Re-run: TWOVER business-model + downstream')
  const r = await readWhatChanged({ runRoot: R })
  assert.ok(r && r.state === 'compared', `got ${(r as any)?.reason}`)
  assert.equal(r.versionsFound, 2)
  assert.equal(r.cur.uncommitted, undefined)
  assert.match(r.cur.subject, /Re-run/)
  assert.match(r.prev.subject, /full dossier/)
  assert.equal(r.diff.verdict, 'anchors_moved')
  assert.equal(r.memo.state, 'changed')
})

await check('two commits, DIRTY tree -> cur.uncommitted; prev = the newest COMMIT (NOT versions[1])', async () => {
  const R = write('analyses/DIRTY2_2026-07-10', REC({ confidence_score: 70 }))
  commit(R, 'v1')
  write(R, REC({ confidence_score: 60 }))
  commit(R, 'v2')
  const headSha = git(REPO, 'rev-parse', 'HEAD').toString().trim()
  write(R, REC({ confidence_score: 52 })) // the engine wrote; commit-run.sh has not pushed yet
  const r = await readWhatChanged({ runRoot: R })
  assert.ok(r && r.state === 'compared')
  assert.equal(r.cur.uncommitted, true)
  assert.equal(r.cur.shortRev, 'working tree')
  assert.equal(r.prev.rev, headSha, 'prev must be the newest COMMIT — HEAD~1 answers about a version the user is not looking at')
  assert.equal(r.diff.anchors.find((a) => a.field === 'confidence_score')!.prev, 60, 'expected 60 -> 52, not 70 -> 52')
})

await check("one commit, tree == blob -> 'first_version' (never 'nothing changed')", async () => {
  const R = write('analyses/FIRSTV_2026-07-10', REC())
  commit(R, 'first')
  const r = await readWhatChanged({ runRoot: R })
  assert.ok(r && r.state === 'first_version')
  assert.equal(r.reason, 'first_version')
  assert.equal(r.versionsFound, 1)
  assert.match(r.detail, /first recorded version/)
  assert.doesNotMatch(r.detail, /nothing changed/i)
})

await check("one commit, DIRTY tree -> 'compared' against that commit", async () => {
  const R = write('analyses/DIRTY1_2026-07-10', REC({ decision: 'Buy' }))
  commit(R, 'first')
  write(R, REC({ decision: 'Watchlist' }))
  const r = await readWhatChanged({ runRoot: R })
  assert.ok(r && r.state === 'compared')
  assert.equal(r.cur.uncommitted, true)
  assert.equal(r.diff.verdict, 'call_changed')
})

await check("never committed -> 'no_history'/'untracked'   <-- git log exits 0 + EMPTY here", async () => {
  const R = write('analyses/UNTRACKED_2026-07-10', REC()) // deliberately never staged
  const r = await readWhatChanged({ runRoot: R })
  assert.ok(r && r.state === 'no_history')
  assert.equal(r.reason, 'untracked', 'only ls-files --error-unmatch separates this from "unchanged"')
  assert.match(r.detail, /hasn't been committed yet/)
  assert.doesNotMatch(r.detail, /nothing changed/i)
})

await check('RENAME: --follow finds 2 versions, reads prev at its OLD path, reports renamedFrom', async () => {
  const OLD = 'analyses/EMAR_2026-07-03'
  const NEW = 'analyses/EMAAR_2026-07-03'
  write(OLD, REC({ ticker: 'EMAR', confidence_score: 44 }), '# memo')
  commit(OLD, 'Re-run: EMAR master/synthesizer')
  git(REPO, 'mv', OLD, NEW) // stages the delete AND the add
  fs.writeFileSync(path.join(REPO, NEW, 'decision_record.json'), REC({ ticker: 'EMAAR', confidence_score: 51 }))
  git(REPO, 'add', '--', NEW)
  git(REPO, 'commit', '-qm', 'data(analyses): reconcile Emaar runs to the EMAAR symbol')
  const r = await readWhatChanged({ runRoot: NEW })
  assert.ok(r && r.state === 'compared', `got ${(r as any)?.reason}`)
  assert.equal(r.versionsFound, 2, 'without --follow this reports 1 version — a false negative')
  assert.equal(r.prev.pathAtRev, `${OLD}/decision_record.json`, 'prev must be read at ITS OWN path')
  assert.equal(r.renamedFrom, OLD)
  assert.equal(r.diff.anchors.find((a) => a.field === 'confidence_score')!.prev, 44, 'the OLD blob was actually read')
})

await check('BOUNDARY: --follow must NOT cross into a different dated run folder, however similar the record', async () => {
  // `--follow -M` is content-similarity rename detection. Two runs of the same company are very similar,
  // so without the same-date guard the chain jumps the boundary and presents a DIFFERENT data vintage as
  // "this run's previous version" — a silent wrong answer to a question the user never asked.
  const OLDRUN = write('analyses/VINT_2026-07-03', REC({ confidence_score: 33 }))
  commit(OLDRUN, 'Research run: VINT 2026-07-03')
  const NEWRUN = write('analyses/VINT_2026-07-10', REC({ confidence_score: 33 })) // byte-identical: maximal bait
  commit(NEWRUN, 'Research run: VINT 2026-07-10 — a NEW run, not a new version')
  const r = await readWhatChanged({ runRoot: NEWRUN })
  assert.ok(r && r.state === 'first_version', `expected first_version, got ${(r as any).state}/${(r as any).reason}`)
  assert.equal(r.versionsFound, 1, 'the 2026-07-03 run is a different vintage, not this run\'s history')
})

await check('BOUNDARY: a ticker RENAME that keeps the date IS the same run (EMAR -> EMAAR, #240)', async () => {
  const r = await readWhatChanged({ runRoot: 'analyses/EMAAR_2026-07-03' })
  assert.ok(r && r.state === 'compared', 'the same-date guard must not break a legitimate ticker rename')
  assert.equal(r.versionsFound, 2)
})

await check("prior blob is not JSON -> 'prior_unreadable', and the detail NAMES the rev", async () => {
  const R = write('analyses/BADPRIOR_2026-07-10', '{ this is not json')
  commit(R, 'bad')
  const badRev = git(REPO, 'rev-parse', '--short=7', 'HEAD').toString().trim()
  write(R, REC())
  commit(R, 'good')
  const r = await readWhatChanged({ runRoot: R })
  assert.ok(r && r.state === 'no_history')
  assert.equal(r.reason, 'prior_unreadable')
  assert.match(r.detail, new RegExp(badRev), 'the unreadable revision must be named')
})

await check('prior unreadable + an OLDER good version exists -> STILL prior_unreadable, NO fallback', async () => {
  const R = write('analyses/NOFALL_2026-07-10', REC({ confidence_score: 10 }))
  commit(R, 'oldest good')
  write(R, '{ broken')
  commit(R, 'broken middle')
  write(R, REC({ confidence_score: 52 }))
  commit(R, 'newest')
  const r = await readWhatChanged({ runRoot: R })
  assert.equal((r as any).reason, 'prior_unreadable', 'falling back to the oldest good version compares the WRONG two things while looking correct')
})

await check("prior blob empty -> 'prior_unreadable'", async () => {
  const R = write('analyses/EMPTYPR_2026-07-10', '')
  commit(R, 'empty')
  write(R, REC())
  commit(R, 'good')
  assert.equal(((await readWhatChanged({ runRoot: R })) as any).reason, 'prior_unreadable')
})

await check("prior blob is a JSON array -> 'prior_unreadable' (an array is not a decision record)", async () => {
  const R = write('analyses/ARRPRIOR_2026-07-10', '[1,2,3]')
  commit(R, 'array')
  write(R, REC())
  commit(R, 'good')
  assert.equal(((await readWhatChanged({ runRoot: R })) as any).reason, 'prior_unreadable')
})

await check("current record malformed / missing run -> null (not this view's job to report)", async () => {
  const R = write('analyses/BADCUR_2026-07-10', '{ nope')
  commit(R, 'x')
  assert.equal(await readWhatChanged({ runRoot: R }), null)
  assert.equal(await readWhatChanged({ runRoot: 'analyses/GHOST_2026-01-01' }), null)
})

await check('path barriers: traversal + a non-analyses root return null', async () => {
  assert.equal(await readWhatChanged({ runRoot: 'analyses/../etc/passwd' }), null)
  assert.equal(await readWhatChanged({ runRoot: 'screener/runs/SIG-20260612-dd716589' }), null, 'research-only v1 gate')
  assert.equal(await readWhatChanged({ runRoot: '../../etc' }), null)
  assert.equal(await readWhatChanged({ runRoot: 'analyses/EMAAR_2026-07-10/../../..' }), null)
  assert.equal(await readWhatChanged({ runRoot: '' }), null)
})

await check("memo absent in both -> memo.state 'unknown' (a missing witness is NOT 'unchanged')", async () => {
  const R = write('analyses/MEMONONE_2026-07-10', REC({ confidence_score: 60 }))
  commit(R, 'v1')
  write(R, REC({ confidence_score: 52 }))
  commit(R, 'v2')
  assert.equal(((await readWhatChanged({ runRoot: R })) as any).memo.state, 'unknown')
})

await check("memo added in cur only -> memo.state 'added'", async () => {
  const R = write('analyses/MEMOADD_2026-07-10', REC({ confidence_score: 60 }))
  commit(R, 'v1')
  write(R, REC({ confidence_score: 52 }), '# new memo')
  commit(R, 'v2')
  assert.equal(((await readWhatChanged({ runRoot: R })) as any).memo.state, 'added')
})

// ---- repo-ROOT cases: a fresh process each (REPO_ROOT is fixed at module load) ----------------------

await check("no .git at all -> 'no_history'/'no_repo'", async () => {
  const bare = mkRepo({ init: false })
  fs.mkdirSync(path.join(bare, 'analyses/NOGIT_2026-07-10'), { recursive: true })
  fs.writeFileSync(path.join(bare, 'analyses/NOGIT_2026-07-10/decision_record.json'), REC())
  const r = childRead(bare, 'analyses/NOGIT_2026-07-10')
  assert.equal(r.state, 'no_history')
  assert.equal(r.reason, 'no_repo')
})

await check('git init with ZERO commits -> no_repo ("repo exists" is not enough)', async () => {
  const empty = mkRepo()
  fs.mkdirSync(path.join(empty, 'analyses/ZEROC_2026-07-10'), { recursive: true })
  fs.writeFileSync(path.join(empty, 'analyses/ZEROC_2026-07-10/decision_record.json'), REC())
  const r = childRead(empty, 'analyses/ZEROC_2026-07-10')
  assert.equal(r.state, 'no_history')
  assert.equal(r.reason, 'no_repo')
})

await check("'untracked' !== 'no_repo': the ls-files probe is what tells them apart", async () => {
  const a = await readWhatChanged({ runRoot: 'analyses/UNTRACKED_2026-07-10' })
  const bare = mkRepo({ init: false })
  fs.mkdirSync(path.join(bare, 'analyses/NOGIT2_2026-07-10'), { recursive: true })
  fs.writeFileSync(path.join(bare, 'analyses/NOGIT2_2026-07-10/decision_record.json'), REC())
  const b = childRead(bare, 'analyses/NOGIT2_2026-07-10')
  assert.equal((a as any).reason, 'untracked')
  assert.equal(b.reason, 'no_repo')
})

await check('wrong-repo assert: a root INSIDE a parent repo but not its toplevel -> no_repo', async () => {
  const parent = mkRepo()
  const inner = path.join(parent, 'nested')
  fs.mkdirSync(path.join(inner, 'analyses/NESTED_2026-07-10'), { recursive: true })
  fs.writeFileSync(path.join(inner, 'analyses/NESTED_2026-07-10/decision_record.json'), REC())
  git(parent, 'add', '-A')
  git(parent, 'commit', '-qm', 'x')
  const r = childRead(inner, 'analyses/NESTED_2026-07-10')
  assert.equal(r.reason, 'no_repo', '$HOME is itself a repo — an unanchored query there answers exit 0 + empty = a silent "nothing changed" about the WRONG repo')
})

// ---- ACCEPTANCE: the exact question the user asked --------------------------------------------------

await check('ACCEPTANCE: anchors identical + a kill criterion added -> "The call didn\'t move." AND the criterion is NAMED', async () => {
  const base = { decision: 'Watchlist', confidence_score: 52, expected_return_pct: 17.7, kill_criteria: ['a', 'b'] }
  const R = write('analyses/ACCEPT_2026-07-10', JSON.stringify(base))
  commit(R, 'Research run: ACCEPT 2026-07-10 — full dossier')
  write(R, JSON.stringify({ ...base, kill_criteria: ['a', 'b', 'Founder-MD departs abruptly with no succession plan'] }))
  commit(R, 'Re-run: ACCEPT business-model/external-dependency + downstream')
  const r = await readWhatChanged({ runRoot: R })
  assert.ok(r && r.state === 'compared')
  assert.equal(r.diff.verdict, 'call_held')
  assert.equal(r.diff.headline, "The call didn't move.")
  const md = whatChangedMarkdown(r)
  assert.match(md, /Founder-MD departs abruptly/, 'a flat "nothing changed" here would HIDE a new kill criterion (§3/§8)')
  assert.match(md, /Watchlist → Watchlist/)
  assert.match(md, /confidence 52 → 52/)
})

await check('whatChangedMarkdown never says "nothing changed" while belowCount > 0', async () => {
  const R = write('analyses/BELOW_2026-07-10', JSON.stringify({ decision: 'Watchlist', red_flags: ['a'] }))
  commit(R, 'v1')
  write(R, JSON.stringify({ decision: 'Watchlist', red_flags: ['a', 'b'] }))
  commit(R, 'v2')
  const r = await readWhatChanged({ runRoot: R })
  assert.ok((r as any).diff.belowCount > 0)
  assert.doesNotMatch(whatChangedMarkdown(r!), /Nothing changed/i)
})

await check('whatChangedMarkdown says "Versions found", never "complete history", and names the axis', async () => {
  const R = write('analyses/AXIS_2026-07-10', REC({ confidence_score: 60 }))
  commit(R, 'v1')
  write(R, REC({ confidence_score: 52 }))
  commit(R, 'v2')
  const md = whatChangedMarkdown((await readWhatChanged({ runRoot: R }))!)
  assert.match(md, /Versions found: 2/)
  assert.doesNotMatch(md, /complete history(?!\))/i)
  assert.match(md, /not a comparison with a different dated run folder/i, 'the axis must be named every time')
})

await check('a no-comparison block tells the model NOT to infer from the snapshot', async () => {
  const md = whatChangedMarkdown((await readWhatChanged({ runRoot: 'analyses/FIRSTV_2026-07-10' }))!)
  assert.match(md, /no comparison is available/i)
  assert.match(md, /Do not infer what changed by reading the current snapshot/i)
})

console.log(`\n${pass}/${pass + fail} checks passed`)
for (const t of TMPS) { try { fs.rmSync(t, { recursive: true, force: true }) } catch { /* best effort */ } }
process.exitCode = fail ? 1 : 0
