// No test may run the real data committer. scripts/commit-run.sh holds the `main` ruleset's bypass identity
// on the operator's machine, and unit tests that reached a DEFAULT committer (no seam installed) committed
// fixture data on the author's branch and pushed it: "Run failure note: ZZFINL (stopped at business-model)"
// is on main twice. This proves the class is closed at the shared door (src/commit-run.ts), that the refusal
// is LOUD rather than a silent skip, and that production behaviour is unchanged.
// Run: npx tsx test/test-publication-guard.test.ts
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { commitRunScriptFor, isTestProcess, TEST_RUN_ENV, TEST_RUN_VIOLATIONS_ENV } from '../src/commit-run'

const here = path.dirname(fileURLToPath(import.meta.url))
const serverRoot = path.join(here, '..')
const repoRoot = path.join(serverRoot, '..', '..')
const tsx = path.join(serverRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
const fixtureDir = path.join(here, 'fixtures', 'publication-guard')

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.message || e}`)
    process.exitCode = 1
  }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'publication-guard-'))

/** 1-based lines of every string or template literal that names the helper. A real parse, not a regex:
 *  comments are excluded by construction and a glob such as watchlist/** can never open a false comment. */
function helperLiteralLines(fileName: string, source: string): number[] {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, false)
  const lines = new Set<number>()
  const visit = (node: ts.Node) => {
    const literal = ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)
    if (literal && node.text.includes('commit-run.sh')) {
      lines.add(file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1)
    }
    ts.forEachChild(node, visit)
  }
  visit(file)
  return [...lines].sort((x, y) => x - y)
}

/** Run the incident path in a child with a recording stub as `bash`, so neither this revision nor an
 *  unfixed one can reach the real helper. Two more belts for the unguarded case: git discovery is pointed
 *  at nothing and pushing is off, so even a stub bypass could not commit or publish. */
function reachDefaultCommitter(entry: string, ticker: string, guardEnv: Record<string, string>) {
  const bin = fs.mkdtempSync(path.join(tmp, 'bin-'))
  const calls = path.join(bin, 'bash-calls.log')
  fs.writeFileSync(path.join(bin, 'bash'), `#!/bin/sh\nprintf '%s\\n' "$*" >> '${calls}'\necho NOOP=1\n`, { mode: 0o755 })
  // Windows resolves `bash` through PATHEXT, never an extensionless file, so give it the same stub there.
  if (process.platform === 'win32') {
    fs.writeFileSync(path.join(bin, 'bash.cmd'), `@echo off\r\necho %* >> "${calls}"\r\necho NOOP=1\r\n`)
  }
  const env: NodeJS.ProcessEnv = { ...process.env }
  delete env[TEST_RUN_ENV]
  delete env[TEST_RUN_VIOLATIONS_ENV]
  delete env.ENGINE_REPO_ROOT
  Object.assign(env, guardEnv, {
    PATH: `${bin}${path.delimiter}${process.env.PATH ?? ''}`,
    GIT_DIR: path.join(bin, 'no-such-git-dir'),
    ENGINE_NO_PUSH: '1',
    GUARD_FIXTURE_TICKER: ticker,
  })
  const result = spawnSync(tsx, [path.join(fixtureDir, entry)], { env, encoding: 'utf8', timeout: 120_000 })
  const helperCalls = (fs.existsSync(calls) ? fs.readFileSync(calls, 'utf8') : '')
    .split('\n').filter((line) => line.includes('commit-run.sh'))
  return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '', helperCalls }
}

try {
  check('the guard is armed for a test file run directly, and for anything under the suite runner', () => {
    assert.equal(isTestProcess(), true, 'this *.test.ts entry point is recognised without any environment')
  })

  check('a sandbox repository under the OS temp directory may still use its own helper', () => {
    const sandbox = fs.mkdtempSync(path.join(tmp, 'sandbox-repo-'))
    assert.equal(commitRunScriptFor(sandbox), path.join(sandbox, 'scripts', 'commit-run.sh'))
    // A sandbox path that does not exist yet must canonicalise like one that does (macOS: os.tmpdir() is
    // /var/folders/… but its real path is /private/var/folders/…).
    const unborn = path.join(os.tmpdir(), `publication-guard-unborn-${process.pid}`, 'repo')
    assert.equal(commitRunScriptFor(unborn), path.join(unborn, 'scripts', 'commit-run.sh'))
  })

  // The control: outside a test the default committer still spawns the helper with the exact request. It
  // also proves the fixture genuinely reaches the default committer, so the two refusals below cannot pass
  // because the path quietly stopped existing.
  check('outside a test the default failure-note committer still runs the helper (production unchanged)', () => {
    const run = reachDefaultCommitter('reach-real-committer.ts', 'ZZGUARDC', {})
    assert.match(run.stdout, /RUN_STATUS=incomplete/, run.stderr)
    assert.match(run.stdout, /NOTE_WRITTEN=1/)
    assert.equal(run.helperCalls.length, 1, `expected exactly one helper spawn, saw: ${JSON.stringify(run.helperCalls)}`)
    assert.match(run.helperCalls[0], /scripts[\\/]commit-run\.sh"? "?Run failure note: ZZGUARDC \(stopped at .*\)"? -- "?analyses\/ZZGUARDC_2099-01-01\/RUN_FAILURE\.md"?\s*$/)
    assert.equal(run.status, 0, run.stderr)
    assert.doesNotMatch(run.stderr, /TEST PUBLICATION GUARD/)
    assert.match(run.stdout, /^CHILD_GUARD_ENV=$/m, 'a production process never exports the guard to its children')
  })

  check('a single test file run directly cannot spawn the real committer, and fails loudly', () => {
    const run = reachDefaultCommitter('direct.test.ts', 'ZZGUARDA', {})
    assert.deepEqual(run.helperCalls, [], 'the helper must never be spawned from a test')
    assert.match(run.stdout, /RUN_STATUS=incomplete/, run.stderr)
    assert.match(run.stdout, /NOTE_WRITTEN=1/, 'the local diagnostic is still written; only the commit is refused')
    assert.match(run.stderr, /TEST PUBLICATION GUARD: a test reached the real data committer/)
    assert.match(run.stderr, /1 test publication guard violation\(s\)/)
    assert.match(run.stdout, /^CHILD_GUARD_ENV=1$/m,
      'shell and Python helpers spawned from a directly-run test inherit the refusal in commit-run.sh too')
    assert.notEqual(run.status, 0, 'best-effort callers swallow the throw, so the process itself must fail')
  })

  check('under the suite runner the refusal also lands in the runner ledger', () => {
    const ledger = path.join(tmp, 'violations.tsv')
    const run = reachDefaultCommitter('reach-real-committer.ts', 'ZZGUARDB', {
      [TEST_RUN_ENV]: '1', [TEST_RUN_VIOLATIONS_ENV]: ledger,
    })
    assert.deepEqual(run.helperCalls, [], 'the helper must never be spawned from a test')
    assert.match(run.stderr, /TEST PUBLICATION GUARD: a test reached the real data committer/)
    assert.notEqual(run.status, 0)
    const recorded = fs.readFileSync(ledger, 'utf8')
    assert.match(recorded, /^server\t.*reach-real-committer\.ts\t/)
  })

  check('every server spawn of the helper goes through the guarded door', () => {
    // The scanner must see through the traps text heuristics fall into. The first is real: a `//` comment
    // in server.ts mentions the glob watchlist/**, and a naive block-comment stripper treated that `/*` as
    // an opening comment and blanked ~1,400 lines — including the watchlist publisher itself.
    assert.deepEqual(helperLiteralLines('trap.ts', [
      '// data paths: analyses/**, watchlist/** are published by the helper commit-run.sh',
      '/* a block comment naming commit-run.sh',
      '   on a starless line: commit-run.sh */',
      'const url = "https://example.test/x" // trailing comment: commit-run.sh',
      "const a = path.join(root, 'scripts', 'commit-run.sh')",
      '/* c */ const b = "scripts/commit-run.sh"',
      'const c = `${root}/scripts/commit-run.sh`',
      'const d = /watchlist\\/\\*\\*/.test(x) ? `commit-run.sh` : null',
    ].join('\n')), [5, 6, 7, 8], 'only string and template literals count; every comment form is ignored')

    const offenders: string[] = []
    let scanned = 0
    const door = path.join(serverRoot, 'src', 'commit-run.ts')
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) { walk(full); continue }
        if (!/\.[cm]?[jt]sx?$/.test(entry.name)) continue
        scanned++
        const lines = helperLiteralLines(full, fs.readFileSync(full, 'utf8'))
        if (full === door) { assert.ok(lines.length > 0, 'the scan found the helper where it must be named'); continue }
        for (const line of lines) offenders.push(`${path.relative(serverRoot, full)}:${line}`)
      }
    }
    walk(path.join(serverRoot, 'src'))
    assert.ok(scanned > 50, `expected to scan the server source tree, scanned ${scanned} files`)
    assert.match(fs.readFileSync(door, 'utf8'),
      /assertCommitRunAllowed\(repoRoot\)\n\s*return path\.join\(repoRoot, 'scripts', 'commit-run\.sh'\)/,
      'the door resolves the helper only after the guard')
    assert.deepEqual(offenders, [],
      'name scripts/commit-run.sh only in src/commit-run.ts — resolve it with commitRunScriptFor() so the test guard cannot be skipped')
  })

  check('a helper that ends at the committer is gated before it writes anything', () => {
    // calibrate-local.sh reaches commit-run.sh on its own, where only the script-level refusal applies — and
    // that is invisible without the suite runner, after calibration files are already written.
    const launcher = fs.readFileSync(path.join(serverRoot, 'src', 'launcher.ts'), 'utf8')
    const body = launcher.slice(launcher.indexOf('let postReviewCalibration'))
    const gate = body.indexOf('assertCommitRunAllowed(REPO_ROOT)')
    const firstSpawn = body.indexOf('execa(')
    assert.ok(gate > 0 && firstSpawn > gate, 'postReviewCalibration refuses before its first spawn')
    assert.match(fs.readFileSync(path.join(serverRoot, 'src', 'config.ts'), 'utf8'), /^import '\.\/commit-run'/m,
      'config arms the guard for child processes of any test that loads server code')
  })

  check('the suite runner exports the guard, and the helper refuses it before any git discovery', () => {
    const runner = fs.readFileSync(path.join(here, 'run-all.mjs'), 'utf8')
    assert.match(runner, /ENGINE_TEST_RUN: '1', ENGINE_TEST_RUN_VIOLATIONS: violationLedger/)
    assert.match(runner, /spawn\(tsx, \[path\.join\(dir, f\)\], \{ stdio: 'inherit', env \}\)/)
    assert.match(runner, /process\.exitCode = failed \|\| violations \? 1 : 0/)
    const helper = fs.readFileSync(path.join(repoRoot, 'scripts', 'commit-run.sh'), 'utf8')
    const guard = helper.indexOf('if [ "${ENGINE_TEST_RUN:-}" = "1" ]; then')
    const firstGit = helper.search(/^[^#\n]*\bgit /m)
    assert.ok(guard > 0, 'commit-run.sh honours ENGINE_TEST_RUN')
    assert.ok(firstGit > guard, 'the refusal precedes the first git command')
    assert.ok(helper.indexOf('NOSTRA_COCKPIT_RUN:-}" = "1"') > guard, 'and precedes supervisor delegation')
  })
} finally {
  fs.rmSync(tmp, { recursive: true, force: true })
  for (const ticker of ['ZZGUARDA', 'ZZGUARDB', 'ZZGUARDC']) {
    fs.rmSync(path.join(repoRoot, 'analyses', `${ticker}_2099-01-01`), { recursive: true, force: true })
  }
}

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
