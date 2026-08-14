import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { REPO_ROOT } from '../src/config'

const command = fs.readFileSync(path.join(REPO_ROOT, '.claude/commands/research/intake.md'), 'utf8')
const contract = fs.readFileSync(path.join(REPO_ROOT, 'frameworks/INTAKE.md'), 'utf8')

assert.match(command, /staged_for_scoped_rerun[^\n]+is not True/,
  'only a copied, scoped-run plan may become the prior evidence cursor')
assert.match(command, /EVIDENCE_CURSOR/,
  'the intake command must retain an evidence cursor independent of the new thesis mtime')
assert.match(command, /arrival\s*=\s*max\(stat\.st_mtime, stat\.st_ctime\)/,
  'file discovery must compute the same preserved-mtime arrival witness as the server')
assert.match(command, /if arrival > floor:/,
  'file discovery must compare that arrival witness with the durable evidence cursor')
assert.match(contract, /second document landing while any run is in flight remains\s+new/,
  'the cross-layer intake contract must state the no-hidden-document guarantee')

const cursorHelper = /EVIDENCE_CURSOR="\$\(python3[^\n]*<<'PY'\n([\s\S]*?)\nPY\n\)"/.exec(command)?.[1]
assert.ok(cursorHelper, 'the cursor helper is present as one executable Python block')
const compiled = spawnSync('python3', ['-c', `compile(${JSON.stringify(cursorHelper)}, '<cursor-helper>', 'exec')`], { encoding: 'utf8' })
assert.equal(compiled.status, 0, `the cursor helper must compile: ${compiled.stderr}`)
assert.match(command, /if \[ "\$CURSOR_STATUS" -ne 0 \]/,
  'every cursor helper error must stop intake instead of silently using the later thesis time')
assert.match(command, /Legacy finished calls predate the run cursor/,
  'legacy calls conservatively rescan rather than hiding evidence that arrived during their run')

console.log('every full or scoped run retains a durable per-file discovery floor: ok')
