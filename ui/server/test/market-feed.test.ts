// The benchmark price feed. Small surface, one rule that matters: ONE provider answers, never a blend.
// Hermetic — points DATA_DIR at a throwaway directory, so no real feed is touched.
// Run: npx tsx test/market-feed.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'fundbook-feed-'))
// DATA_DIR is REPO_ROOT/data, and REPO_ROOT is what the env overrides — there is no ENGINE_DATA_DIR.
// Getting this wrong does not fail loudly: the test simply passes while writing into, and deleting
// from, the checkout's real data directory.
process.env.ENGINE_REPO_ROOT = TMP

// DATA_DIR is resolved at module load, so the import must follow the env assignment.
const feed = await import('../src/market-feed')

let passed = 0
const fails: string[] = []
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok   ${name}`) }
  catch (e: any) { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.message || e}`) }
}

function provider(name: string, rows: string): void {
  const dir = path.join(feed.MARKET_FEED_DIR, name)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'spy.csv'), `date,symbol,close\n${rows}\n`)
}
function reset(): void {
  fs.rmSync(feed.MARKET_FEED_DIR, { recursive: true, force: true })
}

check('no feed at all is a normal state, not an error', () => {
  reset()
  assert.deepEqual(feed.readCloses('SPY'), [])
  assert.equal(feed.feedPresent(), false)
})

check('one provider reads back oldest first, case-insensitively on the symbol', () => {
  reset()
  provider('stooq', '2026-01-05,spy,500\n2026-01-02,SPY,490\n2026-01-03,other,1')
  const closes = feed.readCloses('spy')
  assert.deepEqual(closes, [{ date: '2026-01-02', close: 490 }, { date: '2026-01-05', close: 500 }])
  assert.equal(feed.feedPresent(), true)
})

check('TWO providers never interleave — the widest span answers alone', () => {
  // The failure this prevents: an adjusted and an unadjusted SPY series merged into one date→close map
  // produce a curve that steps between sources whenever their dates alternate. Every return computed
  // from it is then partly a change of source, and which source wins on a given day is decided by the
  // order the filesystem happened to list the folders.
  reset()
  provider('adjusted', '2026-01-02,SPY,100\n2026-01-03,SPY,101\n2026-01-06,SPY,103')
  provider('raw', '2026-01-03,SPY,400\n2026-01-04,SPY,402')
  const closes = feed.readCloses('SPY')
  assert.deepEqual(closes.map((c) => c.close), [100, 101, 103], 'only the wider provider is used')
  assert.ok(!closes.some((c) => c.close > 300), 'not a single row may come from the other basis')
})

check('the choice is stable, not filesystem order', () => {
  // Same two providers, written in the other order: the answer must not move.
  reset()
  provider('raw', '2026-01-03,SPY,400\n2026-01-04,SPY,402')
  provider('adjusted', '2026-01-02,SPY,100\n2026-01-03,SPY,101\n2026-01-06,SPY,103')
  assert.deepEqual(feed.readCloses('SPY').map((c) => c.close), [100, 101, 103])
})

check('a malformed row or file is skipped, never guessed at', () => {
  reset()
  const dir = path.join(feed.MARKET_FEED_DIR, 'stooq')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'wrong-shape.csv'), 'a,b,c\n1,2,3\n')
  fs.writeFileSync(path.join(dir, 'good.csv'), 'date,symbol,close\n2026-01-02,SPY,490\nnot-a-date,SPY,1\n2026-01-03,SPY,x\n')
  assert.deepEqual(feed.readCloses('SPY'), [{ date: '2026-01-02', close: 490 }])
})

check('readNewestClose reads only the most-recently-written file per provider, not every accumulated snapshot', () => {
  // scripts/fetch_market_feed.py writes a brand-new whole-history CSV every trading day and never prunes
  // old ones, so a provider directory accumulates one file per day forever. The health check
  // (market-feed-health.ts) must not pay for every accumulated file on every /api/health poll — this is
  // the bounded reader PR #706's review asked for ("Keep full feed scans out of the deployment health
  // gate"). Prove it by planting a value ONLY the older snapshot carries: if readNewestClose ever reads
  // that file too, the poisoned value would leak into the answer.
  reset()
  const dir = path.join(feed.MARKET_FEED_DIR, 'fred')
  fs.mkdirSync(dir, { recursive: true })
  const older = path.join(dir, 'sp500_2026-01-05.csv')
  fs.writeFileSync(older, 'date,symbol,close\n2026-01-02,SP500,100\n2026-01-05,SP500,999\n')
  const past = new Date(Date.now() - 3_600_000)
  fs.utimesSync(older, past, past) // force an unambiguous mtime gap vs. the file written just below
  const newer = path.join(dir, 'sp500_2026-01-06.csv')
  fs.writeFileSync(newer, 'date,symbol,close\n2026-01-02,SP500,100\n2026-01-06,SP500,104\n')
  const rows = feed.readNewestClose('SP500')
  assert.deepEqual(rows, [{ date: '2026-01-02', close: 100 }, { date: '2026-01-06', close: 104 }])
  assert.ok(!rows.some((r) => r.close === 999), 'the older, superseded snapshot must never be read at all')
})

check('readNewestClose picks the widest-span provider exactly like readCloses, from one file each', () => {
  reset()
  provider('adjusted', '2026-01-02,SPY,100\n2026-01-03,SPY,101\n2026-01-06,SPY,103')
  provider('raw', '2026-01-03,SPY,400\n2026-01-04,SPY,402')
  const rows = feed.readNewestClose('SPY')
  assert.deepEqual(rows.map((c) => c.close), [100, 101, 103], 'only the wider provider is used, same as readCloses')
})

check('readNewestClose answers [] with no feed, exactly like readCloses', () => {
  reset()
  assert.deepEqual(feed.readNewestClose('SPY'), [])
})

try { fs.rmSync(TMP, { recursive: true, force: true }) } catch { /* best effort */ }
console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
