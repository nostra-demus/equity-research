import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { ensureRunEvidenceCursor } from '../src/run-evidence-cursor'

const root = () => fs.mkdtempSync(path.join(os.tmpdir(), 'run-evidence-'))

test('a fresh full run gets an exact durable start point', () => {
  const repoRoot = root()
  try {
    const now = Date.parse('2026-08-14T10:11:12.345Z')
    const cursor = ensureRunEvidenceCursor({ ticker: 'ACME', runRoot: 'analyses/ACME_2026-08-14', now, repoRoot })
    assert.equal(cursor.started_at, '2026-08-14T10:11:12.345Z')
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(repoRoot, 'analyses/ACME_2026-08-14/intake/run_evidence_cursor.json'), 'utf8')), cursor)
  } finally { fs.rmSync(repoRoot, { recursive: true, force: true }) }
})

test('a partial same-day run without a cursor falls back to the start of the run day', () => {
  const repoRoot = root()
  try {
    const run = path.join(repoRoot, 'analyses/ACME_2026-08-14')
    fs.mkdirSync(path.join(run, 'earnings'), { recursive: true })
    fs.writeFileSync(path.join(run, 'earnings/99_earnings-synthesis.md'), 'partial\n')
    const cursor = ensureRunEvidenceCursor({ ticker: 'ACME', runRoot: 'analyses/ACME_2026-08-14', now: Date.parse('2026-08-14T12:00:00Z'), repoRoot })
    assert.equal(cursor.started_at, new Date(2026, 7, 14).toISOString())
  } finally { fs.rmSync(repoRoot, { recursive: true, force: true }) }
})

test('an existing cursor is immutable and a damaged one fails closed', () => {
  const repoRoot = root()
  try {
    const input = { ticker: 'ACME', runRoot: 'analyses/ACME_2026-08-14', now: Date.parse('2026-08-14T10:00:00Z'), repoRoot }
    const first = ensureRunEvidenceCursor(input)
    const again = ensureRunEvidenceCursor({ ...input, now: input.now + 60_000 })
    assert.deepEqual(again, first)
    const file = path.join(repoRoot, input.runRoot, 'intake/run_evidence_cursor.json')
    fs.writeFileSync(file, '{broken')
    assert.throws(() => ensureRunEvidenceCursor({ ...input, now: input.now + 120_000 }), /cannot be read safely/)
  } finally { fs.rmSync(repoRoot, { recursive: true, force: true }) }
})

test('a linked run root or intake folder cannot steer the cursor outside analyses', () => {
  const repoRoot = root()
  const outside = root()
  try {
    fs.mkdirSync(path.join(repoRoot, 'analyses'), { recursive: true })
    fs.symlinkSync(outside, path.join(repoRoot, 'analyses/ACME_2026-08-14'))
    assert.throws(() => ensureRunEvidenceCursor({
      ticker: 'ACME', runRoot: 'analyses/ACME_2026-08-14', now: Date.parse('2026-08-14T12:00:00Z'), repoRoot,
    }), /linked run root/)
    assert.equal(fs.existsSync(path.join(outside, 'intake/run_evidence_cursor.json')), false)

    fs.rmSync(path.join(repoRoot, 'analyses/ACME_2026-08-14'))
    fs.mkdirSync(path.join(repoRoot, 'analyses/ACME_2026-08-14'))
    fs.symlinkSync(outside, path.join(repoRoot, 'analyses/ACME_2026-08-14/intake'))
    assert.throws(() => ensureRunEvidenceCursor({
      ticker: 'ACME', runRoot: 'analyses/ACME_2026-08-14', now: Date.parse('2026-08-14T12:00:00Z'), repoRoot,
    }), /linked intake directory/)
    assert.equal(fs.existsSync(path.join(outside, 'run_evidence_cursor.json')), false)
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true })
    fs.rmSync(outside, { recursive: true, force: true })
  }
})

test('a linked cursor file cannot redirect the durable write authority', () => {
  const repoRoot = root()
  const outside = path.join(root(), 'cursor.json')
  try {
    const intake = path.join(repoRoot, 'analyses/ACME_2026-08-14/intake')
    fs.mkdirSync(intake, { recursive: true })
    fs.writeFileSync(outside, '{}')
    fs.symlinkSync(outside, path.join(intake, 'run_evidence_cursor.json'))
    assert.throws(() => ensureRunEvidenceCursor({
      ticker: 'ACME', runRoot: 'analyses/ACME_2026-08-14', now: Date.parse('2026-08-14T12:00:00Z'), repoRoot,
    }), /not a real file/)
    assert.equal(fs.readFileSync(outside, 'utf8'), '{}')
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true })
    fs.rmSync(path.dirname(outside), { recursive: true, force: true })
  }
})
