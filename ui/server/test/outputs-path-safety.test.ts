import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ANALYSES_DIR, REPO_ROOT } from '../src/config'
import { readMarkdown, readRunsMarkdown } from '../src/outputs'

let runDir = ''
let outsideDir = ''

try {
  runDir = fs.mkdtempSync(path.join(ANALYSES_DIR, 'OUTPUTS-SAFETY-'))
  outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), 'outputs-safety-outside-'))
  const report = path.join(runDir, 'report.md')
  fs.writeFileSync(report, '# Contained\n')
  const relReport = path.relative(REPO_ROOT, report)

  assert.equal(readMarkdown(relReport).markdown, '# Contained\n')
  assert.equal(readRunsMarkdown(relReport).markdown, '# Contained\n')

  assert.throws(() => readMarkdown('analyses/../AGENTS.md'), /Invalid output markdown path/)
  assert.throws(() => readRunsMarkdown('commodity/runs/../../AGENTS.md'), /Invalid output markdown path/)
  assert.throws(() => readMarkdown('/etc/passwd.md'), /Invalid output markdown path/)

  const outside = path.join(outsideDir, 'outside.md')
  fs.writeFileSync(outside, '# Secret\n')
  const linked = path.join(runDir, 'linked.md')
  fs.symlinkSync(outside, linked)
  const relLinked = path.relative(REPO_ROOT, linked)

  assert.throws(() => readMarkdown(relLinked), /Path escapes the analyses sandbox/)
  assert.throws(() => readRunsMarkdown(relLinked), /Path escapes the runs sandbox/)
} finally {
  if (runDir) try { fs.rmSync(runDir, { recursive: true, force: true }) } catch {}
  if (outsideDir) try { fs.rmSync(outsideDir, { recursive: true, force: true }) } catch {}
}

console.log('output readers: valid markdown + traversal/symlink containment passed')
