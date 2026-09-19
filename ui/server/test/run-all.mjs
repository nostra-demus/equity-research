// Auto-discovers and runs every `test/*.test.ts` via tsx, with four isolated workers, and fails if ANY
// file fails. Keeping one process per file preserves the environment/filesystem isolation the suite has
// always relied on; the small fixed pool stops the required PR check from being starved by frequent
// data-only commits to main.
//
// Why this exists: the `test` script used to be a hand-maintained `tsx a && tsx b && ...` list on ONE
// line of package.json. Every contributor appended their new test there, so any two added tests
// collided on that line — a guaranteed, repeating merge conflict. With auto-discovery, adding a test is
// just a new file in this folder: ZERO edits to package.json, so the test list can never conflict.
// (See CONTRIBUTING.md — "no shared append-only single-line lists".)
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { spawn } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const tsx = path.join(dir, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
const files = readdirSync(dir).filter((f) => f.endsWith('.test.ts')).sort()

if (files.length === 0) { console.error('run-all: no *.test.ts files found in', dir); process.exit(1) }

// Test-publication guard. No test may run the real data committer (scripts/commit-run.sh): on the operator's
// machine it holds the `main` ruleset's bypass identity, and unit tests that reached it have published
// fixture data to main. ENGINE_TEST_RUN=1 is honoured by the server's one door to the helper
// (src/commit-run.ts) and by the helper itself, and is inherited by anything a test spawns. Every refusal
// is also appended to this ledger, so a test that swallows the error — or a grandchild whose exit status
// nobody reads — still fails the suite below instead of silently skipping the commit.
const guardDir = mkdtempSync(path.join(os.tmpdir(), 'engine-test-run-'))
const violationLedger = path.join(guardDir, 'violations.tsv')
const env = { ...process.env, ENGINE_TEST_RUN: '1', ENGINE_TEST_RUN_VIOLATIONS: violationLedger }

let failed = 0
let next = 0

async function runWorker() {
  while (next < files.length) {
    const f = files[next++]
    process.stdout.write(`\n──── ${f} ────\n`)
    const result = await new Promise((resolve) => {
      const child = spawn(tsx, [path.join(dir, f)], { stdio: 'inherit', env })
      child.once('error', (error) => resolve({ status: null, signal: error.code || 'spawn_error' }))
      child.once('exit', (status, signal) => resolve({ status, signal }))
    })
    if (result.status !== 0) {
      failed++
      console.error(`✗ FAILED: ${f} (exit ${result.status ?? result.signal})`)
    }
  }
}

await Promise.all(Array.from({ length: Math.min(4, files.length) }, () => runWorker()))

let violations = ''
try { violations = readFileSync(violationLedger, 'utf8').trim() } catch { /* no refusal was recorded */ }
rmSync(guardDir, { recursive: true, force: true })
if (violations) {
  console.error(`\n✗ TEST PUBLICATION GUARD: a test reached the real data committer (nothing was committed or pushed):\n${violations}`)
}

console.log(`\n${files.length - failed}/${files.length} test files passed${failed ? ` — ${failed} FAILED` : ''}`)
// Set exitCode and let the process end naturally — process.exit() can truncate the line above when
// stdout is redirected (e.g. CI logs). Mirrors the codebase's own tests (they set process.exitCode).
process.exitCode = failed || violations ? 1 : 0
