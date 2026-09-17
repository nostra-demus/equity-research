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

/** Run the incident path in a child with a recording stub as `bash`, so neither this revision nor an
 *  unfixed one can reach the real helper. Two more belts for the unguarded case: git discovery is pointed
 *  at nothing and pushing is off, so even a stub bypass could not commit or publish. */
function reachDefaultCommitter(entry: string, ticker: string, guardEnv: Record<string, string>) {
  const bin = fs.mkdtempSync(path.join(tmp, 'bin-'))
  const calls = path.join(bin, 'bash-calls.log')
  fs.writeFileSync(path.join(bin, 'bash'), `#!/bin/sh\nprintf '%s\\n' "$*" >> '${calls}'\necho NOOP=1\n`, { mode: 0o755 })
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
  })

  // The control: outside a test the default committer still spawns the helper with the exact request. It
  // also proves the fixture genuinely reaches the default committer, so the two refusals below cannot pass
  // because the path quietly stopped existing.
  check('outside a test the default failure-note committer still runs the helper (production unchanged)', () => {
    const run = reachDefaultCommitter('reach-real-committer.ts', 'ZZGUARDC', {})
    assert.match(run.stdout, /RUN_STATUS=incomplete/, run.stderr)
    assert.match(run.stdout, /NOTE_WRITTEN=1/)
    assert.equal(run.helperCalls.length, 1, `expected exactly one helper spawn, saw: ${JSON.stringify(run.helperCalls)}`)
    assert.match(run.helperCalls[0], /scripts\/commit-run\.sh Run failure note: ZZGUARDC \(stopped at .*\) -- analyses\/ZZGUARDC_2099-01-01\/RUN_FAILURE\.md$/)
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
    const offenders: string[] = []
    let scanned = 0
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) { walk(full); continue }
        if (!/\.[cm]?tsx?$/.test(entry.name)) continue
        scanned++
        if (full === path.join(serverRoot, 'src', 'commit-run.ts')) continue
        fs.readFileSync(full, 'utf8').split('\n').forEach((line, index) => {
          const trimmed = line.trim()
          if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return
          const code = trimmed.replace(/\s\/\/.*$/, '')
          if (code.includes('commit-run.sh')) offenders.push(`${path.relative(serverRoot, full)}:${index + 1}`)
        })
      }
    }
    walk(path.join(serverRoot, 'src'))
    assert.ok(scanned > 50, `expected to scan the server source tree, scanned ${scanned} files`)
    assert.match(fs.readFileSync(path.join(serverRoot, 'src', 'commit-run.ts'), 'utf8'),
      /assertCommitRunAllowed\(repoRoot\)\n\s*return path\.join\(repoRoot, 'scripts', 'commit-run\.sh'\)/,
      'the door resolves the helper only after the guard')
    assert.deepEqual(offenders, [],
      'name scripts/commit-run.sh only in src/commit-run.ts — resolve it with commitRunScriptFor() so the test guard cannot be skipped')
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
