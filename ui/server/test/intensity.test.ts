// Time-windowed screener intensity rollup — builds a synthetic firehose in a tmp repo and asserts the
// window math (cycle totals, per-tier item tally, hourly histogram, the 'scan' short-circuit). No
// network, no Drive. Run: npx tsx test/intensity.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// getIntensity reads REPO_ROOT/screener/inbox — point REPO_ROOT at a tmp dir BEFORE config is imported,
// so the dynamic import below binds to it (config resolves ENGINE_REPO_ROOT at module-eval time).
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'intensity-'))
process.env.ENGINE_REPO_ROOT = root
process.env.NEWS_ARCHIVE_DIR = '' // no cloud-archive fallback in the test

const inbox = path.join(root, 'screener', 'inbox')
fs.mkdirSync(inbox, { recursive: true })
const cyc = (ts: string, fetched: number) => JSON.stringify({ kind: 'cycle_summary', ts, fetched })
const item = (ts: string, source_tier: string) => JSON.stringify({ kind: 'item', ts, source_tier })

// now = 2026-06-15T12:00Z; the 'day' window is [06-14T12:00, 06-15T12:00].
fs.writeFileSync(path.join(inbox, '2026-06-15_firehose.ndjson'), [
  cyc('2026-06-15T11:00:00Z', 100),
  cyc('2026-06-15T09:00:00Z', 50),
  item('2026-06-15T11:00:00Z', 'news'),
  item('2026-06-15T11:05:00Z', 'news'),
  item('2026-06-15T10:00:00Z', 'company'),
].join('\n') + '\n')
fs.writeFileSync(path.join(inbox, '2026-06-14_firehose.ndjson'), [
  cyc('2026-06-14T18:00:00Z', 30),  // inside the day window
  cyc('2026-06-14T06:00:00Z', 999), // BEFORE the window start → must be excluded
  item('2026-06-14T18:00:00Z', 'official_data'), // inside
  item('2026-06-14T06:00:00Z', 'news'),          // excluded
].join('\n') + '\n')

const now = new Date('2026-06-15T12:00:00Z')
const { getIntensity } = await import('../src/news/intensity')

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('the day window sums only in-window cycles and tallies tiers from item lines', () => {
  const r = getIntensity('day', now)
  assert.equal(r.window, 'day')
  assert.equal(r.scans, 3)            // 100, 50, 30 — the 999 cycle at 06:00 is out of window
  assert.equal(r.totalFetched, 180)
  assert.equal(r.byTier.news, 2)
  assert.equal(r.byTier.company, 1)
  assert.equal(r.byTier.official_data, 1)
  assert.equal(r.ratePerSec, Math.round((180 / 86400) * 100) / 100)
  assert.ok(r.from && r.to)
})
check('the hourly histogram sums to the window total and stays bounded (≤48 points)', () => {
  const r = getIntensity('day', now)
  assert.ok(r.hourly.length > 0 && r.hourly.length <= 48)
  assert.equal(r.hourly.reduce((a, b) => a + b.fetched, 0), 180)
})
check("'scan' returns only the most-recent cycle", () => {
  const r = getIntensity('scan', now)
  assert.equal(r.window, 'scan')
  assert.equal(r.scans, 1)
  assert.equal(r.totalFetched, 100) // the 11:00 cycle (latest)
  assert.equal(r.from, null)
})
check('a missing firehose → zeroed result, never throws', () => {
  const r = getIntensity('1h', new Date('2020-01-01T00:00:00Z'))
  assert.equal(r.scans, 0)
  assert.equal(r.totalFetched, 0)
  assert.deepEqual(r.byTier, {})
  assert.deepEqual(r.hourly, [])
})

console.log(`\nintensity: ${passed} checks passed`)
