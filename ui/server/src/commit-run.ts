// The ONE door to scripts/commit-run.sh from the server. Every spawn site resolves the helper through
// commitRunScriptFor(), so the test-publication guard below cannot be skipped by a new caller
// (test/test-publication-guard.test.ts bans the script's name as a string literal anywhere else in src/).
//
// Why a guard: on the operator's machine commit-run.sh holds the `main` ruleset's bypass identity. Unit
// tests that reached a DEFAULT committer (no seam installed) therefore committed fixture data on whatever
// branch the author was on and tried to push it — "Run failure note: ZZFINL (stopped at business-model)"
// landed on main twice. A test process may run the helper only against a sandbox repository under the OS
// temp directory; against any real checkout it is refused LOUDLY: the call throws, and because several
// callers are deliberately best-effort and swallow errors, the process is also forced to exit non-zero.
//
// Deliberately dependency-free (no ./config): pure publishers take their repo root as a parameter.
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Exported to every test process by test/run-all.mjs, inherited by whatever a test spawns, and honoured
 *  by scripts/commit-run.sh itself (the backstop for bash/python callers this module never sees). */
export const TEST_RUN_ENV = 'ENGINE_TEST_RUN'
/** Optional ledger file the runner checks after the suite: a refusal that a caller swallowed, or that
 *  happened in a grandchild process, still fails the run. */
export const TEST_RUN_VIOLATIONS_ENV = 'ENGINE_TEST_RUN_VIOLATIONS'

export class TestPublicationGuardError extends Error {
  constructor(message: string) { super(message); this.name = 'TestPublicationGuardError' }
}

/** True under the suite runner (env) AND for a single file run directly — `npx tsx test/x.test.ts` has no
 *  runner to export anything, which is exactly how the fixture commits were first observed. */
export function isTestProcess(): boolean {
  return process.env[TEST_RUN_ENV] === '1' || /\.test\.[cm]?[jt]sx?$/.test(process.argv[1] ?? '')
}

// A test file run directly has no runner to export the variable, so export it here. Whatever this process
// spawns afterwards — the shell and Python helpers that end at commit-run.sh — then meets the helper's own
// refusal too, not just the server-side one below.
if (isTestProcess()) process.env[TEST_RUN_ENV] = '1'

const real = (p: string): string => { try { return fs.realpathSync(p) } catch { return path.resolve(p) } }
const within = (child: string, parent: string): boolean => child === parent || child.startsWith(`${parent}${path.sep}`)

// ui/server/src -> the checkout this code was loaded from. It is never a sandbox, even when the checkout
// itself lives under the OS temp directory (a throwaway clone in /tmp is still wired to the real origin).
const OWN_CHECKOUT = real(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..'))

function isTempSandbox(repoRoot: string): boolean {
  const tmp = real(os.tmpdir())
  const root = real(repoRoot)
  return root !== tmp && within(root, tmp) && !within(root, OWN_CHECKOUT)
}

const violations: string[] = []

/** Throws (and fails the process) when a test would run the data committer against a real checkout. */
export function assertCommitRunAllowed(repoRoot: string): void {
  if (!isTestProcess() || isTempSandbox(repoRoot)) return
  const message = `TEST PUBLICATION GUARD: a test reached the real data committer (scripts/commit-run.sh) for ${real(repoRoot)}. `
    + 'Nothing was committed or pushed. Install the committer test seam, or point the test at a sandbox repository under the OS temp directory.'
  if (violations.length === 0) {
    process.on('exit', () => {
      if (!process.exitCode) process.exitCode = 1
      console.error(`\n${violations.length} test publication guard violation(s) — this process fails:\n${violations.join('\n')}`) // eslint-disable-line no-console
    })
  }
  const stack = new Error(message).stack ?? message
  violations.push(stack)
  console.error(message) // eslint-disable-line no-console
  const ledger = process.env[TEST_RUN_VIOLATIONS_ENV]
  if (ledger) {
    try { fs.appendFileSync(ledger, `server\t${process.argv[1] ?? ''}\t${real(repoRoot)}\n`) } catch { /* the exit code still fails this process */ }
  }
  throw new TestPublicationGuardError(message)
}

/** Resolve the helper for a spawn. The path is only obtainable through the guard. */
export function commitRunScriptFor(repoRoot: string): string {
  assertCommitRunAllowed(repoRoot)
  return path.join(repoRoot, 'scripts', 'commit-run.sh')
}
