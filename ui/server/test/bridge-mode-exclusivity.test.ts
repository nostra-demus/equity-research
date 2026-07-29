// BRIDGE_MODE is authoritative and the two routing paths never run together (config.ts contract). This is
// the truth table for shouldAutoBridge across (BRIDGE_MODE × legacy SCREENER_RESEARCH_BRIDGE). BRIDGE_MODE is
// a LOAD-TIME const, so each cell runs in a FRESH tsx subprocess with its own env — a single in-process test
// could only ever observe one mode. The item is material + high-score, so ONLY the mode/flag gate decides.
// Expected values are pinned to config.ts's stated contract, NOT to current behaviour. Run: npx tsx test/bridge-mode-exclusivity.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const tsx = path.join(here, '..', 'node_modules', '.bin', process.platform === 'win32' ? 'tsx.cmd' : 'tsx')
const srcRB = path.resolve(here, '..', 'src', 'research-bridge')

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-mode-'))
process.on('exit', () => { try { fs.rmSync(tmp, { recursive: true, force: true }) } catch { /* best-effort */ } })
const probe = path.join(tmp, 'probe.ts')
fs.writeFileSync(probe, [
  `import { shouldAutoBridge } from ${JSON.stringify(srcRB)}`,
  `const it = { caution: false, source_tier: 'wire', relevance: 'material', triage_score: 80 } as any`,
  `console.log(shouldAutoBridge(it) ? 'ROUTE' : 'SKIP')`,
  '',
].join('\n'))

function probeCell(mode: string | undefined, legacy: string | undefined): 'ROUTE' | 'SKIP' {
  const env: Record<string, string> = { ...process.env as any, ENGINE_ACTIVITY_LOG_DISABLED: '1' }
  delete env.BRIDGE_MODE; delete env.SCREENER_RESEARCH_BRIDGE
  if (mode !== undefined) env.BRIDGE_MODE = mode
  if (legacy !== undefined) env.SCREENER_RESEARCH_BRIDGE = legacy
  const r = spawnSync(tsx, [probe], { encoding: 'utf8', env })
  assert.equal(r.status, 0, `probe failed (mode=${mode} legacy=${legacy}): ${r.stderr || r.error}`)
  const out = r.stdout.trim().split('\n').pop()
  assert.ok(out === 'ROUTE' || out === 'SKIP', `probe emitted '${out}'`)
  return out as 'ROUTE' | 'SKIP'
}

let passed = 0
function check(name: string, expected: 'ROUTE' | 'SKIP', got: 'ROUTE' | 'SKIP'): void {
  try { assert.equal(got, expected); passed++; console.log(`  ok  ${name} → ${got}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.message || e}`); process.exitCode = 1 }
}

// mode='batch' → the 12-hourly sweep owns routing; the per-item path is OFF even with the legacy flag set
check("batch + legacy=1 → SKIP (batch disables stream; no double-route)", 'SKIP', probeCell('batch', '1'))
check("batch + legacy unset → SKIP", 'SKIP', probeCell('batch', undefined))
// mode='stream' → the per-item path is ON from the mode alone (no longer silently inert)
check("stream + legacy unset → ROUTE (mode enables the stream path)", 'ROUTE', probeCell('stream', undefined))
check("stream + legacy=1 → ROUTE", 'ROUTE', probeCell('stream', '1'))
// mode EXPLICITLY 'off' → a hard kill switch: disables the legacy flag too (Codex #359 r3674305117)
check("explicit off + legacy=1 → SKIP (explicit kill switch beats legacy back-compat)", 'SKIP', probeCell('off', '1'))
check("explicit off + legacy unset → SKIP", 'SKIP', probeCell('off', undefined))
// mode UNSET → back-compat: governed by the legacy flag alone
check("unset mode + legacy=1 → ROUTE (legacy back-compat)", 'ROUTE', probeCell(undefined, '1'))
check("unset mode + legacy unset → SKIP (ships off)", 'SKIP', probeCell(undefined, undefined))

console.log(`\n${passed} bridge-mode-exclusivity checks passed`)
