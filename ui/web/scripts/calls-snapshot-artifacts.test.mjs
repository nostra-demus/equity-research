import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { safePublishedMemoDeltaPath } from './calls-snapshot-artifacts.mjs'

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'calls-snapshot-artifacts-'))
try {
  const repo = path.join(temp, 'repo')
  const runRoot = 'analyses/SAFE_2026-08-01'
  const run = path.join(repo, runRoot)
  const reviews = path.join(run, 'reviews')
  fs.mkdirSync(reviews, { recursive: true })

  const valid = `${runRoot}/reviews/2026-09-01_30d_memo_delta.md`
  fs.writeFileSync(path.join(repo, valid), '# Safe memo delta')
  assert.equal(safePublishedMemoDeltaPath(valid, repo, run, runRoot), valid)

  const nonMemo = `${runRoot}/reviews/2026-09-01_30d_notes.md`
  fs.writeFileSync(path.join(repo, nonMemo), 'not a memo delta')
  assert.equal(safePublishedMemoDeltaPath(nonMemo, repo, run, runRoot), null)

  const outside = path.join(temp, 'outside.md')
  fs.writeFileSync(outside, 'must not be published')
  const linked = `${runRoot}/reviews/2026-09-01_90d_memo_delta.md`
  fs.symlinkSync(outside, path.join(repo, linked))
  assert.equal(safePublishedMemoDeltaPath(linked, repo, run, runRoot), null)

  const linkedRunRoot = 'analyses/LINK_2026-08-01'
  const linkedRun = path.join(repo, linkedRunRoot)
  const externalRun = path.join(temp, 'external-run')
  fs.mkdirSync(path.join(externalRun, 'reviews'), { recursive: true })
  fs.symlinkSync(externalRun, linkedRun)
  const linkedRunMemo = `${linkedRunRoot}/reviews/2026-09-01_30d_memo_delta.md`
  fs.writeFileSync(path.join(externalRun, 'reviews', '2026-09-01_30d_memo_delta.md'), 'outside run')
  assert.equal(safePublishedMemoDeltaPath(linkedRunMemo, repo, linkedRun, linkedRunRoot), null)
} finally {
  fs.rmSync(temp, { recursive: true, force: true })
}

console.log('ok  static Calls publishes only regular canonical memo-delta files inside the run')
