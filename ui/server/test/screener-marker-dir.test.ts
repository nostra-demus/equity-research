// Regression: the run-folder marker writes (`.target` / `.aborted`) must build their path from a
// SHAPE-VALIDATED SIG id, never from a raw request-derived string.
//
// Why (CodeQL js/path-injection, CWE-22, HIGH on PR #80): launch() and cancel() write best-effort
// markers into a signal's run folder. The folder path is derived from a request-controlled subject id
// (a relaunch's `ticker`, or `sigIdFor(intake)` over the intake body). Routing the raw `runRoot` string
// through the screener sandbox guard (resolveInsideScreener) did NOT clear the alert: the guard's
// realpath + containment check does not propagate as a barrier across its return, so the sink stayed
// tainted. screenerMarkerDir asserts the id against the anchored SIG_ID_RE BEFORE splicing it into the
// run-root template (the barrier the query recognises), then containment-checks the result.
//
// EXPECTED VALUES ARE PINNED TO AUTHORITY, not to current code behaviour:
//   • SIG_ID_RE = /^SIG-[0-9]{8}-[a-f0-9]{8}$/ (sandbox.ts / launcher.ts) — fully anchored, lowercase
//     hex only, no '.' or '/', so a traversal or wrong-shape id can never reach the filesystem;
//   • a VALID id resolves to exactly `<repo>/screener/runs/<id>` — the screener SWARM.md run_root_template
//     `screener/runs/{SIG_ID}` — proving the hardening is behaviour-preserving for the real (always
//     SIG-shaped) signal subject id;
//   • an invalid / traversal id returns null and writes NOTHING (the security property).
//
// This test is RED on the pre-fix code (screenerMarkerDir did not exist / the write took a raw path) and
// GREEN only with the validated rebuild. Run: npx tsx test/screener-marker-dir.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// REPO_ROOT is resolved from ENGINE_REPO_ROOT at config module-eval time, so point it at a tmp sandbox
// BEFORE importing launcher.ts, and symlink in the REAL .claude tree so swarmById('screener') reads the
// genuine SWARM.md run_root_template — not a hand-rebuilt stub.
const here = path.dirname(fileURLToPath(import.meta.url))
const realRepo = path.resolve(here, '..', '..', '..') // ui/server/test -> repo root
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sc-marker-'))
process.env.ENGINE_REPO_ROOT = root
fs.symlinkSync(path.join(realRepo, '.claude'), path.join(root, '.claude'), 'dir')
fs.mkdirSync(path.join(root, 'screener', 'runs'), { recursive: true }) // the store base must exist for the containment realpath

const { screenerMarkerDir } = await import('../src/launcher')

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const VALID = 'SIG-20260101-deadbeef' // matches SIG_ID_RE
const storeBase = fs.realpathSync(path.join(root, 'screener', 'runs'))

check('a valid SIG id resolves to exactly <repo>/screener/runs/<id> (behaviour preserved)', () => {
  const dir = screenerMarkerDir('screener', VALID)
  assert.equal(dir, path.join(storeBase, VALID), 'valid id must resolve to its own run folder under screener/runs')
})

check('the resolved dir is contained inside the screener store', () => {
  const dir = screenerMarkerDir('screener', VALID)
  assert.ok(dir && (dir === storeBase || dir.startsWith(storeBase + path.sep)), 'must stay inside screener/runs')
})

check('a path-traversal id returns null and writes nothing (CWE-22 barrier)', () => {
  const before = fs.readdirSync(storeBase).sort()
  assert.equal(screenerMarkerDir('screener', '../../../../etc/passwd'), null)
  assert.equal(screenerMarkerDir('screener', '..'), null)
  assert.equal(screenerMarkerDir('screener', 'SIG-20260101-deadbeef/../../evil'), null)
  assert.deepEqual(fs.readdirSync(storeBase).sort(), before, 'no folder may be created for a rejected id')
})

check('a wrong-shape id (uppercase hex / empty / non-SIG) returns null', () => {
  assert.equal(screenerMarkerDir('screener', 'SIG-20260101-DEADBEEF'), null, 'SIG_ID_RE is lowercase-hex only')
  assert.equal(screenerMarkerDir('screener', 'SIG-2026011-deadbeef'), null, '7-digit date is not the shape')
  assert.equal(screenerMarkerDir('screener', ''), null)
  assert.equal(screenerMarkerDir('screener', 'not-a-sig'), null)
})

check('an unknown swarm id returns null (no template to build from)', () => {
  assert.equal(screenerMarkerDir('no-such-swarm', VALID), null)
})

// best-effort teardown — never leave a tmp sandbox behind (the symlink is removed, not its target)
try { fs.rmSync(root, { recursive: true, force: true }) } catch { /* ignore */ }

console.log(`\n${passed} checks passed`)
