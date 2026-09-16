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

check('a RATE series keeps a zero the price reader drops', () => {
  // Three-month bills printed 0.00% for months in 2020-21. Read as a price those days vanish and the last
  // rate before them stands as today's — the cash hurdle inside every Sharpe on the screen, months wrong.
  reset()
  const dir = path.join(feed.MARKET_FEED_DIR, 'fred')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'dtb3.csv'), 'date,symbol,close\n2021-01-04,DTB3,0.09\n2021-01-06,DTB3,0.00\n')
  assert.deepEqual(feed.readRates('DTB3'), [{ date: '2021-01-04', close: 0.09 }, { date: '2021-01-06', close: 0 }])
  assert.deepEqual(feed.readCloses('DTB3'), [{ date: '2021-01-04', close: 0.09 }], 'the price reader still drops it')
})

check('a rate series still refuses a malformed row and a bad date', () => {
  reset()
  const dir = path.join(feed.MARKET_FEED_DIR, 'fred')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'dtb3.csv'), 'date,symbol,close\n2026-13-40,DTB3,4.1\n2026-09-15,DTB3,x\n2026-09-16,DTB3,4.2\n')
  assert.deepEqual(feed.readRates('DTB3'), [{ date: '2026-09-16', close: 4.2 }])
})

check('a blank close is not a zero rate — it is a row with no value', () => {
  // `Number('')` is a perfectly finite zero. For a price it was refused anyway; for a rate it would be taken
  // as a real 0.00%, so a half-written or hand-edited row would become the hurdle every ratio is measured
  // against.
  reset()
  const dir = path.join(feed.MARKET_FEED_DIR, 'fred')
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'dtb3.csv'), 'date,symbol,close\n2026-09-15,DTB3,4.11\n2026-09-16,DTB3,\n')
  assert.deepEqual(feed.readRates('DTB3'), [{ date: '2026-09-15', close: 4.11 }])
})

check('the reader says which provider answered, so a figure is not published under the wrong name', () => {
  reset()
  for (const [name, rows] of [['fred', '2026-09-15,DTB3,4.11'], ['operator', '2020-01-02,DTB3,1.5\n2026-09-16,DTB3,4.2']] as const) {
    const dir = path.join(feed.MARKET_FEED_DIR, name)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'dtb3.csv'), `date,symbol,close\n${rows}\n`)
  }
  const series = feed.readRateSeries('DTB3')
  assert.equal(series.provider, 'operator', 'the widest span still wins')
  assert.equal(series.rows.length, 2)
  assert.equal(feed.readRateSeries('NOTHING').provider, null)
})

try { fs.rmSync(TMP, { recursive: true, force: true }) } catch { /* best effort */ }
console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
