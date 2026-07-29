// bridge-batch: the 12-hourly company-news sweep. These tests pin the CONTRACT the plan promised —
// every row of the duplicate matrix (in both directions), per-subject cursor isolation, the capped
// backfill for a newly enabled name, the quiet-window no-write, eligibility gates incl. per-subject
// score floors, exact-symbol matching, and the "analysis only when a FRESH note landed" rule.
// Temp dirs only — never touches the real data/ pool. Run: npx tsx test/bridge-batch.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  accumulatedFor, DEFAULT_BATCH_CONFIG, eligibleFor, enabledSubjects, readBatchConfig, readCursors, sweepOnce,
} from '../src/bridge-batch'
import { bridgeEventToSubject } from '../src/research-bridge'
import type { FeedItem } from '../src/news/types'

// every temp dir this file makes, removed on exit — a test run must not leave /tmp litter behind
const tempDirs: string[] = []
process.on('exit', () => { for (const d of tempDirs) { try { fs.rmSync(d, { recursive: true, force: true }) } catch { /* best-effort */ } } })

let passed = 0
function check(name: string, fn: () => void): void {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.message || e}`); process.exitCode = 1 }
}

const HOUR = 3600_000
const NOW = new Date('2026-07-29T12:00:00Z')
const now = () => NOW
const iso = (msAgo: number) => new Date(NOW.getTime() - msAgo).toISOString().replace(/\.\d{3}Z$/, 'Z')

let seq = 0
function item(over: Partial<FeedItem> & { ticker?: string } = {}): FeedItem {
  const id = `EVT-${String(++seq).padStart(12, '0')}`
  const t = over.ticker ?? 'NHY'
  return {
    kind: 'item', ts: iso(2 * HOUR), event_id: id,
    headline: `${t} something material happened`,
    url: `https://example.com/${id}`, domain: 'example.com', source_name: 'Example', via: 'rss',
    region: 'OTHER' as any, country: 'NO', input_nature: 'news_headline',
    triage_score: 75, band: 'act' as any, triage_reason: 'material',
    relevance: 'material' as any, event_types: ['company'], issuer_linkage: 'direct' as any,
    companies: [{ name: t, ticker: t } as any], size_bucket: 'unknown',
    source_tier: 'wire' as any, caution: false,
    ...(over as any),
  } as FeedItem
}

/** A temp repo with a data pool + a firehose day file the reader can see. */
function makeRepo(subjects: string[], items: FeedItem[]) {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-batch-'))
  tempDirs.push(repo)
  const dataDir = path.join(repo, 'data')
  const stateDir = path.join(repo, '.state')
  for (const s of subjects) fs.mkdirSync(path.join(dataDir, s), { recursive: true })
  fs.mkdirSync(stateDir, { recursive: true })
  // the firehose layout readFeed expects: screener/inbox/<YYYY-MM-DD>_firehose.ndjson
  const byDay = new Map<string, FeedItem[]>()
  for (const it of items) {
    const d = String(it.ts).slice(0, 10)
    byDay.set(d, [...(byDay.get(d) ?? []), it])
  }
  const fhDir = path.join(repo, 'screener', 'inbox')
  fs.mkdirSync(fhDir, { recursive: true })
  for (const [d, its] of byDay) {
    fs.writeFileSync(path.join(fhDir, `${d}_firehose.ndjson`), its.map((i) => JSON.stringify(i)).join('\n') + '\n')
  }
  return { repo, dataDir, stateDir, opts: { repoRoot: repo, dataDir, stateDir, now, lookbackDays: 4 } }
}
const noteFor = (dataDir: string, ticker: string, id: string) => path.join(dataDir, ticker, `screener_event_${id}.md`)

// ---- 1. the happy window: eligible items land as notes, subject reported for analysis ----
check('a window routes eligible items and reports the subject as having FRESH notes', () => {
  // DISTINCT stories — readFeed assigns dedup_group across the served window, so two near-identical
  // headlines would (correctly) cluster into one story; that case is pinned separately below.
  const a = item({ ticker: 'NHY', headline: 'NHY lifts Q3 alumina output guidance' })
  const b = item({ ticker: 'NHY', headline: 'NHY names a new CFO effective October' })
  const { dataDir, opts } = makeRepo(['NHY', 'AMZN'], [a, b])
  const r = sweepOnce(['NHY', 'AMZN'], DEFAULT_BATCH_CONFIG, opts)
  const nhy = r.sweeps.find((s) => s.subject === 'NHY')!
  assert.equal(nhy.written.length, 2, 'two distinct stories → two notes')
  assert.deepEqual(r.subjectsWithFreshNotes, ['NHY'], 'only the subject that gained notes earns an analysis')
  assert.ok(fs.existsSync(noteFor(dataDir, 'NHY', a.event_id)))
  assert.ok(!fs.existsSync(noteFor(dataDir, 'AMZN', a.event_id)), 'an NHY story never lands in AMZN’s pool')
})

// ---- 1b. noise discipline WITHIN one window: two outlets, one story → one note ----
check('two outlets’ copies of the same story in ONE window produce ONE note', () => {
  const h = 'NHY halts a smelter line after a power outage'
  const wire1 = item({ ticker: 'NHY', headline: h, source_name: 'Reuters' })
  const wire2 = item({ ticker: 'NHY', headline: h, source_name: 'Bloomberg' })
  const { dataDir, opts } = makeRepo(['NHY'], [wire1, wire2])
  const r = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
  const s = r.sweeps[0]
  assert.equal(s.written.length, 1, 'the syndicated copy is not a second note')
  assert.equal(s.duplicates, 1)
  assert.equal(fs.readdirSync(path.join(dataDir, 'NHY')).length, 1, 'exactly one file in the pool')
})

// ---- 2. DUPLICATE MATRIX row 1: batch first, then a manual re-send ----
check('batch routed it → a manual send of the SAME event is a no-op (already, no second file)', () => {
  const e = item({ ticker: 'NHY' })
  const { dataDir, stateDir, opts } = makeRepo(['NHY'], [e])
  sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
  const before = fs.readdirSync(path.join(dataDir, 'NHY')).length
  const manual = bridgeEventToSubject({ item: e, ticker: 'NHY', mode: 'manual', user: 'u', userVia: 'local', opts: { dataDir, stateDir, now } })
  assert.equal(manual.already, true, 'the manual send reports it is already in the pool')
  assert.equal(fs.readdirSync(path.join(dataDir, 'NHY')).length, before, 'no second note file')
})

// ---- 3. DUPLICATE MATRIX row 2: manual first, then the batch window ----
check('manual send → the next window skips it AND does not count it as fresh (no second analysis)', () => {
  const e = item({ ticker: 'NHY' })
  const { dataDir, stateDir, opts } = makeRepo(['NHY'], [e])
  bridgeEventToSubject({ item: e, ticker: 'NHY', mode: 'manual', user: 'u', userVia: 'local', opts: { dataDir, stateDir, now } })
  const r = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
  const s = r.sweeps[0]
  assert.deepEqual(s.written, [], 'nothing written')
  assert.equal(s.duplicates, 1, 'counted as a duplicate, not a write')
  assert.deepEqual(r.subjectsWithFreshNotes, [], 'no fresh note → no follow-up analysis is earned')
})

// ---- 4. DUPLICATE MATRIX row 3: a syndicated copy of an already-routed story ----
check('another outlet’s copy of the same story (same dedup_group) is skipped as a cluster duplicate', () => {
  const first = item({ ticker: 'NHY', dedup_group: 'cluster-42' } as any)
  const copy = item({ ticker: 'NHY', dedup_group: 'cluster-42', source_name: 'Other Outlet' } as any)
  const { dataDir, stateDir, opts } = makeRepo(['NHY'], [copy])
  bridgeEventToSubject({ item: first, ticker: 'NHY', mode: 'manual', user: 'u', userVia: 'local', opts: { dataDir, stateDir, now } })
  const r = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
  assert.deepEqual(r.sweeps[0].written, [], 'the syndicated copy does not create a second note')
  assert.equal(r.sweeps[0].duplicates, 1)
  assert.ok(!fs.existsSync(noteFor(dataDir, 'NHY', copy.event_id)), 'the copy’s own event note is never written')
})

// ---- 5. DUPLICATE MATRIX row 4: two engines sweeping the same pool ----
check('a second sweep over the same window writes nothing (idempotent — two engines are safe)', () => {
  const e = item({ ticker: 'NHY' })
  const { stateDir, opts } = makeRepo(['NHY'], [e])
  const first = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
  assert.equal(first.sweeps[0].written.length, 1)
  // a concurrent engine that had NOT advanced its cursor re-considers the same window
  fs.rmSync(path.join(stateDir, 'research-bridge-cursor.json'), { force: true })
  const second = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
  assert.deepEqual(second.sweeps[0].written, [], 'the on-disk note makes the retry a no-op')
  assert.deepEqual(second.subjectsWithFreshNotes, [])
})

// ---- 6. cursor isolation + the capped backfill for a newly enabled name ----
check('cursors are PER SUBJECT: enabling a name later backfills only its capped window', () => {
  const old = item({ ticker: 'AMZN', ts: iso(72 * HOUR) })   // older than the 48h cap
  const recent = item({ ticker: 'AMZN', ts: iso(6 * HOUR) }) // inside it
  const nhy = item({ ticker: 'NHY' })
  const { dataDir, stateDir, opts } = makeRepo(['NHY', 'AMZN'], [old, recent, nhy])
  // wave 1: NHY only
  sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
  const c1 = readCursors(stateDir)
  assert.ok(c1.NHY, 'NHY has a cursor')
  assert.ok(!c1.AMZN, 'AMZN has none — it was not enabled')
  // wave 2: add AMZN
  const r = sweepOnce(['NHY', 'AMZN'], DEFAULT_BATCH_CONFIG, opts)
  const amzn = r.sweeps.find((s) => s.subject === 'AMZN')!
  assert.equal(amzn.backfilled, true, 'a subject with no cursor is reported as backfilled')
  assert.equal(amzn.written.length, 1, 'only the item inside the 48h backfill window')
  assert.ok(fs.existsSync(noteFor(dataDir, 'AMZN', recent.event_id)))
  assert.ok(!fs.existsSync(noteFor(dataDir, 'AMZN', old.event_id)), 'the 72h-old story is NOT dumped in')
  assert.deepEqual(r.sweeps.find((s) => s.subject === 'NHY')!.written, [], 'NHY’s own cursor held — no replay')
})

// ---- 7. quiet window ----
check('a window with nothing eligible writes nothing and earns no analysis (no pool churn)', () => {
  const noise = item({ ticker: 'NHY', relevance: 'relevant_non_material' as any })
  const { dataDir, opts } = makeRepo(['NHY'], [noise])
  const r = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
  assert.deepEqual(r.sweeps[0].written, [])
  assert.deepEqual(r.subjectsWithFreshNotes, [])
  assert.deepEqual(fs.readdirSync(path.join(dataDir, 'NHY')), [], 'the pool is untouched')
})

// ---- 8. eligibility gates, incl. the per-subject floor ----
check('gates: social / caution / non-material / below-floor are all refused; per-subject floor wins', () => {
  const cfg = { ...DEFAULT_BATCH_CONFIG, minScoreBySubject: { TSLA: 70 } }
  assert.equal(eligibleFor(item({ triage_score: 75 }), 'NHY', cfg), true)
  assert.equal(eligibleFor(item({ triage_score: 59 }), 'NHY', cfg), false, 'below the default 60 floor')
  assert.equal(eligibleFor(item({ triage_score: 65 }), 'TSLA', cfg), false, 'below TSLA’s stricter 70 floor')
  assert.equal(eligibleFor(item({ triage_score: 75 }), 'TSLA', cfg), true)
  assert.equal(eligibleFor(item({ source_tier: 'social' as any }), 'NHY', cfg), false)
  assert.equal(eligibleFor(item({ caution: true } as any), 'NHY', cfg), false)
  assert.equal(eligibleFor(item({ relevance: 'relevant_non_material' as any }), 'NHY', cfg), false)
})

// ---- 9. exact-symbol matching (no unattended suffix-stripping) ----
check('exact symbol only: EMAAR.DU never routes into the EMAAR pool unattended', () => {
  const e = item({ ticker: 'EMAAR.DU', companies: [{ name: 'Emaar', ticker: 'EMAAR.DU' } as any] } as any)
  const { dataDir, opts } = makeRepo(['EMAAR'], [e])
  const r = sweepOnce(['EMAAR'], DEFAULT_BATCH_CONFIG, opts)
  assert.deepEqual(r.sweeps[0].written, [], 'a suffixed symbol is not an exact match')
  assert.deepEqual(fs.readdirSync(path.join(dataDir, 'EMAAR')), [])
})

// ---- 10. the enabled set comes from the manifest, and a pool-less name is dropped ----
check('enabledSubjects reads the manifest’s subjects[] and drops names with no pool', () => {
  const { repo, dataDir } = makeRepo(['NHY'], [])
  const mf = path.join(repo, 'connector.json')
  fs.writeFileSync(mf, JSON.stringify({ subjects: ['NHY', 'NOPOOL', '../etc', 'AMZN'] }))
  assert.deepEqual(enabledSubjects(mf, dataDir), ['NHY'], 'only the subject with a real pool survives')
  fs.writeFileSync(mf, '{ broken')
  assert.deepEqual(enabledSubjects(mf, dataDir), [], 'a malformed manifest enables nothing (fail-closed)')
})

// ---- 11. config sidecar: malformed input can never WIDEN routing ----
check('readBatchConfig falls back to the defaults on anything malformed (never wider)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-cfg-'))
  tempDirs.push(dir)
  const fp = path.join(dir, 'bridge_config.json')
  fs.writeFileSync(fp, JSON.stringify({ min_score: 70, backfill_hours: 12, min_score_by_subject: { TSLA: 80, '../x': 1 } }))
  const ok = readBatchConfig(fp)
  assert.equal(ok.minScore, 70); assert.equal(ok.backfillHours, 12)
  assert.deepEqual(ok.minScoreBySubject, { TSLA: 80 }, 'an unsafe subject key is dropped')
  fs.writeFileSync(fp, '{ not json')
  assert.deepEqual(readBatchConfig(fp), DEFAULT_BATCH_CONFIG)
  fs.writeFileSync(fp, JSON.stringify({ min_score: -5, backfill_hours: 99999 }))
  const clamped = readBatchConfig(fp)
  assert.equal(clamped.minScore, DEFAULT_BATCH_CONFIG.minScore, 'out-of-range floor falls back, never to 0')
  assert.equal(clamped.backfillHours, DEFAULT_BATCH_CONFIG.backfillHours)
})

// ---- 12. cursor advances past CONSIDERED items, so the next window is genuinely incremental ----
check('the cursor advances to the newest considered item — the next window sees only newer news', () => {
  const first = item({ ticker: 'NHY', ts: iso(8 * HOUR) })
  const { stateDir, opts } = makeRepo(['NHY'], [first])
  sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
  const c = readCursors(stateDir)
  assert.equal(c.NHY, first.ts, 'cursor is the newest considered item’s timestamp')
  const r2 = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
  assert.equal(r2.sweeps[0].considered, 0, 'the same window is not re-considered')
})

// ---- 13. review round: the reader window must COVER the oldest cursor (outage safety) ----
check('an outage longer than the default window does not drop the gap: lookback follows the cursor', () => {
  // an event from 5 days ago, and a cursor 6 days old (the cockpit was down). With a fixed 2-3 day
  // reader window the event would never be returned and the cursor would advance past it forever.
  const old = item({ ticker: 'NHY', ts: iso(5 * 24 * HOUR) })
  const { dataDir, stateDir, opts } = makeRepo(['NHY'], [old])
  fs.writeFileSync(path.join(stateDir, 'research-bridge-cursor.json'), JSON.stringify({ NHY: iso(6 * 24 * HOUR) }))
  const r = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, { ...opts, lookbackDays: undefined })
  assert.equal(r.sweeps[0].written.length, 1, 'the event inside the outage gap is still routed')
  assert.ok(fs.existsSync(noteFor(dataDir, 'NHY', old.event_id)))
})

// ---- 14. review round: mixed ISO precision must not misorder the cursor ----
check('cursor tracking is numeric: a ms-precision timestamp cannot park the cursor early', () => {
  const withMs = item({ ticker: 'NHY', ts: '2026-07-29T09:00:00.500Z', headline: 'NHY ms-precision story' })
  const bare = item({ ticker: 'NHY', ts: '2026-07-29T09:00:00Z', headline: 'NHY bare-second story' })
  const { stateDir, opts } = makeRepo(['NHY'], [withMs, bare])
  sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
  const c = readCursors(stateDir)
  // lexically ".500Z" < "Z", so a string compare would have parked the cursor on the BARE one and
  // re-considered the ms item forever; numerically the ms item is the newer, and wins.
  assert.equal(Date.parse(c.NHY), Date.parse(withMs.ts), 'the numerically newest item owns the cursor')
})

// ---- 15. review round: the accumulated-notes read (powers the status indicator) ----
check('accumulatedFor counts routed notes on disk and reports the newest', () => {
  const a = item({ ticker: 'NHY', headline: 'NHY lifts Q3 alumina output guidance' })
  const b = item({ ticker: 'NHY', headline: 'NHY names a new CFO effective October' })
  const { dataDir, opts } = makeRepo(['NHY', 'AMZN'], [a, b])
  assert.deepEqual(accumulatedFor(dataDir, 'NHY'), { notes: 0, newestAt: null }, 'empty pool reads zero')
  sweepOnce(['NHY', 'AMZN'], DEFAULT_BATCH_CONFIG, opts)
  const acc = accumulatedFor(dataDir, 'NHY')
  assert.equal(acc.notes, 2)
  assert.ok(acc.newestAt && !Number.isNaN(Date.parse(acc.newestAt)))
  assert.equal(accumulatedFor(dataDir, 'AMZN').notes, 0, 'a subject with no routed news reads zero')
  // an unrelated pool file is never counted as routed news
  fs.writeFileSync(path.join(dataDir, 'NHY', 'annual_report.pdf'), 'x')
  assert.equal(accumulatedFor(dataDir, 'NHY').notes, 2, 'only screener_event_* notes are counted')
  assert.deepEqual(accumulatedFor(dataDir, 'NOSUCH'), { notes: 0, newestAt: null }, 'a missing pool is zero, not a throw')
})

// ---- 16. round-2 review: a failed write HOLDS the cursor so the next window retries ----
check('a note-write failure holds the cursor below it (the note is never lost)', () => {
  const a = item({ ticker: 'NHY', ts: iso(3 * HOUR), headline: 'NHY lifts Q3 alumina output guidance' })
  const { dataDir, stateDir, opts } = makeRepo(['NHY'], [a])
  // Make the pool unwritable so bridgeEventToSubject's tmp-write throws (EACCES). A directory at the note
  // path would NOT do it — the existence check reads that as 'already routed' and returns cleanly.
  const pool = path.join(dataDir, 'NHY')
  fs.chmodSync(pool, 0o500)
  try {
    const r = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
    const s0 = r.sweeps[0]
    assert.equal(s0.retryPending, true, 'the failure is reported, not swallowed')
    assert.deepEqual(s0.written, [], 'nothing was written')
    assert.ok(Date.parse(s0.cursor) < Date.parse(a.ts), 'the cursor is held BELOW the failed item')
    assert.deepEqual(r.subjectsWithFreshNotes, [], 'a failed window earns no analysis')
    const cur = readCursors(stateDir)
    assert.ok(Date.parse(cur.NHY) < Date.parse(a.ts), 'the persisted cursor is held back too')
  } finally {
    fs.chmodSync(pool, 0o700) // restore so the temp-dir cleanup can remove it
  }
  // and the RETRY works: with the pool writable again, the next window routes the held-back item
  const r2 = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
  assert.equal(r2.sweeps[0].written.length, 1, 'the next window picks up exactly the unwritten note')
  assert.ok(fs.existsSync(noteFor(dataDir, 'NHY', a.event_id)))
})

// ---- 17. round-2 review: a re-enabled subject does not resume a stale cursor ----
check('a cursor for a subject no longer covered is dropped (re-enabling backfills)', () => {
  const e = item({ ticker: 'NHY' })
  const { stateDir, opts } = makeRepo(['NHY'], [e])
  fs.writeFileSync(path.join(stateDir, 'research-bridge-cursor.json'), JSON.stringify({ NHY: iso(HOUR), AMZN: iso(30 * 24 * HOUR) }))
  sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts)
  const cur = readCursors(stateDir)
  assert.ok(!('AMZN' in cur), 'the uncovered subject’s stale cursor is gone')
  assert.ok('NHY' in cur)
})

// ---- 18. round-2 review: a malformed per-subject floor is ignored, never lowered ----
check('a malformed subject override cannot LOWER a stricter global floor', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bridge-cfg2-'))
  tempDirs.push(dir)
  const fp = path.join(dir, 'cfg.json')
  fs.writeFileSync(fp, JSON.stringify({ min_score: 80, min_score_by_subject: { NHY: 'oops', AMZN: 90 } }))
  const cfg = readBatchConfig(fp)
  assert.equal(cfg.minScore, 80)
  assert.equal(cfg.minScoreBySubject.AMZN, 90, 'a valid override survives')
  assert.ok(!('NHY' in cfg.minScoreBySubject), 'the malformed one is dropped, not coerced to 60')
  // and the effective floor for NHY is therefore the strict global, not the default
  const low = item({ ticker: 'NHY', triage_score: 65 })
  assert.equal(eligibleFor(low, 'NHY', cfg), false, 'a 65 does not clear the 80 global floor')
})

console.log(`\n${passed} bridge-batch checks passed`)
