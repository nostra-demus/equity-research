// Auto-discovers and runs every `test/*.test.ts` via tsx, sequentially, and fails if ANY file fails.
// Clone of ui/server/test/run-all.mjs — same "no shared append-only single-line lists" reasoning
// (CONTRIBUTING.md): a new pure-logic test file needs zero edits here, just a new file in this folder.
//
// This is the FIRST test runner ui/web has (the web side previously had no test command at all, only
// `tsc --noEmit` + a Vite build) — kept deliberately minimal: no DOM/JSDOM, no React harness, since the
// files it targets (lib/screener-globe-layout.ts, globe-consts.ts, …) are pure, three.js-free geometry/
// logic modules by design (see screener-globe-layout.ts's own header). A DOM-rendering test belongs in
// the Playwright e2e suite (ui/web/e2e/), not here.
import { readdirSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))
const tsx = path.join(dir, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
const files = readdirSync(dir).filter((f) => f.endsWith('.test.ts')).sort()

if (files.length === 0) { console.error('run-all: no *.test.ts files found in', dir); process.exit(1) }

let failed = 0
for (const f of files) {
  process.stdout.write(`\n──── ${f} ────\n`)
  const r = spawnSync(tsx, [path.join(dir, f)], { stdio: 'inherit' })
  if (r.status !== 0) { failed++; console.error(`✗ FAILED: ${f} (exit ${r.status ?? r.signal})`) }
}

console.log(`\n${files.length - failed}/${files.length} test files passed${failed ? ` — ${failed} FAILED` : ''}`)
// Set exitCode and let the process end naturally — process.exit() can truncate the line above when
// stdout is redirected (e.g. CI logs). Mirrors the server's own runner (and its tests).
process.exitCode = failed ? 1 : 0
