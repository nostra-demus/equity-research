// Auto-discovers src/**/*.test.ts and scripts/**/*.test.mjs, sequentially, and fails if ANY file fails.
//
// The web unit tests are standalone tsx-assert scripts (each `npx tsx src/…/x.test.ts` runs its asserts and
// exits nonzero on failure). They previously ran ONLY by hand — the ui-web CI job did typecheck + build but
// never `npm test` — so a green CI proved nothing about them. This runner (mirroring ui/server's
// test/run-all.mjs) makes `npm test` execute them all, and the CI job runs it, so a safety-gate regression
// (e.g. lib/intake.test.ts) actually fails the build. Adding a test is just a matching test file — no
// edit here and no shared append-only list (CONTRIBUTING.md).
import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'src')
const scriptsDir = path.join(root, 'scripts')
const tsx = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')

function walk(dir, accept) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(p, accept))
    else if (e.isFile() && accept(e.name)) out.push(p)
  }
  return out
}

const files = [
  ...walk(srcDir, (name) => name.endsWith('.test.ts')),
  ...walk(scriptsDir, (name) => name.endsWith('.test.mjs')),
].sort()
if (files.length === 0) { console.error('run-tests: no test files found'); process.exit(1) }

let failed = 0
for (const f of files) {
  const rel = path.relative(root, f)
  process.stdout.write(`\n──── ${rel} ────\n`)
  const runner = f.endsWith('.mjs') ? process.execPath : tsx
  const r = spawnSync(runner, [f], { stdio: 'inherit' })
  if (r.status !== 0) { failed++; console.error(`✗ FAILED: ${rel} (exit ${r.status ?? r.signal})`) }
}

console.log(`\n${files.length - failed}/${files.length} test files passed${failed ? ` — ${failed} FAILED` : ''}`)
process.exitCode = failed ? 1 : 0
