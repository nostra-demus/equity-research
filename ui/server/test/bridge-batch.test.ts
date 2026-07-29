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
  // A MALFORMED override value must be DROPPED, never coerced to a hardcoded 60 — coercing it below a
  // stricter global floor (min_score 75) silently WIDENED that name's ingestion (Codex #359 r3673607337).
  // Fail-closed contract: a dropped key inherits the parsed global floor at lookup time, never below it.
  fs.writeFileSync(fp, JSON.stringify({ min_score: 75, min_score_by_subject: { TSLA: 'bad', AMZN: 200, NHY: 90 } }))
  const strict = readBatchConfig(fp)
  assert.equal(strict.minScore, 75)
  assert.deepEqual(strict.minScoreBySubject, { NHY: 90 }, 'only the valid in-range override survives; "bad" and out-of-range 200 are dropped')
  assert.equal(eligibleFor(item({ triage_score: 70 }), 'TSLA', strict), false, 'a dropped TSLA override falls back to the global 75, not a lower 60')
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

// ---- 16. review round: a failed note write FREEZES the cursor — the event is retried, never skipped ----
check('a transient write failure does not advance the cursor past the unpersisted event', () => {
  // three ascending NHY stories; the MIDDLE one's write throws (a transient pool/FUSE failure). The cursor
  // must stop just before it, so the next window re-reads and retries it. Pre-fix, the watermark advanced to
  // the newest CONSIDERED item regardless of write success, so the failed event was skipped forever
  // (Codex #359 r3673607317). Expected value pinned to bridge-batch.ts's own ordering contract:
  // "the cursor advances ... only after its notes are written" / "Losing a window is impossible".
  const t1 = item({ ticker: 'NHY', ts: iso(6 * HOUR), headline: 'NHY story one' })
  const t2 = item({ ticker: 'NHY', ts: iso(4 * HOUR), headline: 'NHY story two (write fails)' })
  const t3 = item({ ticker: 'NHY', ts: iso(2 * HOUR), headline: 'NHY story three' })
  const { stateDir, opts } = makeRepo(['NHY'], [t1, t2, t3])
  const writeNote = (a: { item: FeedItem }) => {
    if (a.item.event_id === t2.event_id) throw new Error('simulated pool write failure')
    return { already: false, path: `/fake/${a.item.event_id}.md` }
  }
  const r = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, { ...opts, writeNote })
  const c = readCursors(stateDir)
  assert.equal(c.NHY, t1.ts, 'cursor frozen at the last item before the failure, NOT advanced to t3')
  assert.ok(Date.parse(c.NHY) < Date.parse(t2.ts), 'cursor is strictly before the unpersisted event')
})

// ---- 17. review round: a cursor-persist failure must NOT erase this cycle's fresh-note report ----
check('writeCursors failure still reports fresh notes so the follow-up analysis is not lost forever', () => {
  // notes all write fine (seam), but the cursor file cannot be persisted (state path sits under a regular
  // file → mkdir ENOTDIR, which even root cannot write through). Pre-fix, sweepOnce threw before returning,
  // so the scheduler launched no analysis and the next sweep saw only duplicates — the advisory analysis was
  // skipped forever with INTAKE_AUTO_ANALYZE=0 (Codex #359 r3673881630).
  const e = item({ ticker: 'NHY' })
  const { repo, opts } = makeRepo(['NHY'], [e])
  const wall = path.join(repo, 'not-a-dir'); fs.writeFileSync(wall, 'x')
  const deadState = path.join(wall, 'state') // any write under here throws ENOTDIR
  const writeNote = (a: { item: FeedItem }) => ({ already: false, path: `/fake/${a.item.event_id}.md` })
  const r = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, { ...opts, stateDir: deadState, writeNote })
  assert.deepEqual(r.subjectsWithFreshNotes, ['NHY'], 'the fresh-note result survives the cursor-persist failure')
  // the failure is surfaced, not silently swallowed — an operator can see the cursor did not advance
  // instead of the sweep quietly reporting as if it were clean (Codex review, PR #359).
  assert.ok(r.cursorWriteError, 'cursorWriteError names the failure')
})

// ---- 18. review round: retention boundary disclosure (not a silent skip) ----
check('a subject whose cursor predates the retention boundary is disclosed via retentionGapDays, not silently truncated with no record', () => {
  const withinWindow = item({ ticker: 'NHY', ts: iso(10 * 24 * HOUR) }) // 10 days ago — inside the 14-day boundary
  const { dataDir, stateDir, opts } = makeRepo(['NHY'], [withinWindow])
  // the cursor is 20 days old — beyond RETENTION_BOUNDARY_DAYS (14)
  fs.writeFileSync(path.join(stateDir, 'research-bridge-cursor.json'), JSON.stringify({ NHY: iso(20 * 24 * HOUR) }))
  const r = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, { ...opts, lookbackDays: undefined })
  const nhy = r.sweeps.find((s) => s.subject === 'NHY')!
  assert.ok(nhy.retentionGapDays && nhy.retentionGapDays > 0, 'the truncated gap is disclosed, not silently absorbed')
  assert.equal(nhy.written.length, 1, 'the item still inside the (clamped) window is still routed')
  assert.ok(fs.existsSync(noteFor(dataDir, 'NHY', withinWindow.event_id)))
})

check('a fully-covered cursor (within the boundary) reports no retention gap', () => {
  const e = item({ ticker: 'NHY', ts: iso(2 * HOUR) })
  const { opts } = makeRepo(['NHY'], [e])
  const r = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, opts) // fresh subject, well inside backfillHours
  assert.equal(r.sweeps[0].retentionGapDays, null)
})

// ---- 19. review round: a disabled → re-enabled subject does not inherit its stale cursor ----
check('disabling a subject then re-enabling it resets its cursor to a bounded backfill, not the whole disabled interval', () => {
  const recentBeforeDisable = item({ ticker: 'AMZN', ts: iso(6 * HOUR) }) // read during wave 1
  const duringDisable = item({ ticker: 'AMZN', ts: iso(-3.5 * 24 * HOUR) }) // NOW + 3.5 days — while "disabled"
  const freshAfterReenable = item({ ticker: 'AMZN', ts: iso(-6 * 24 * HOUR) }) // NOW + 6 days — within 48h of wave 3
  const { dataDir, opts } = makeRepo(['AMZN'], [recentBeforeDisable, duringDisable, freshAfterReenable])

  // wave 1: AMZN enabled, at NOW — picks up the recent item, cursor advances
  const w1 = sweepOnce(['AMZN'], DEFAULT_BATCH_CONFIG, opts)
  assert.equal(w1.sweeps[0].written.length, 1)

  // wave 2: AMZN removed from the enabled set (simulates it being disabled), 3 days later
  sweepOnce([], DEFAULT_BATCH_CONFIG, { ...opts, now: () => new Date(NOW.getTime() + 3 * 24 * HOUR) })

  // wave 3: AMZN re-enabled, 7 days after NOW (well past the boundary, and past `duringDisable`'s date)
  const w3 = sweepOnce(['AMZN'], DEFAULT_BATCH_CONFIG, { ...opts, now: () => new Date(NOW.getTime() + 7 * 24 * HOUR) })
  const amzn = w3.sweeps.find((s) => s.subject === 'AMZN')!
  assert.equal(amzn.backfilled, true, 'the stale cursor was reset — treated as a fresh subject again')
  assert.ok(fs.existsSync(noteFor(dataDir, 'AMZN', freshAfterReenable.event_id)), 'the item inside the bounded backfill lands')
  assert.ok(
    !fs.existsSync(noteFor(dataDir, 'AMZN', duringDisable.event_id)),
    'the item from mid-way through the disabled interval is NOT dumped in — the whole gap is not replayed',
  )
})

// ---- 20. review round: a same-instant write failure must not let an earlier tie advance past it ----
check('two items sharing one timestamp: an earlier success does not advance the cursor past a later failure at the SAME instant', () => {
  // news/runCycle.ts stamps every item from one cycle with the same ts, so ties are routine. Pre-fix, the
  // watermark advanced to T as soon as the FIRST same-T item succeeded — before the SECOND same-T item's
  // write failed — so the cursor persisted at T even though the failed item was never written. The next
  // sweep's `ts <= since` filter then excluded that failed item FOREVER, since its own ts equals the cursor
  // (Codex #359 r3674305109).
  const tiedTs = iso(4 * HOUR)
  const ok = item({ ticker: 'NHY', ts: tiedTs, headline: 'NHY story A (succeeds)' })
  const fails = item({ ticker: 'NHY', ts: tiedTs, headline: 'NHY story B (write fails, SAME instant)' })
  const later = item({ ticker: 'NHY', ts: iso(2 * HOUR), headline: 'NHY story C (later, must not be skipped either)' })
  const { stateDir, opts } = makeRepo(['NHY'], [ok, fails, later])
  const writeNote = (a: { item: FeedItem }) => {
    if (a.item.event_id === fails.event_id) throw new Error('simulated pool write failure')
    return { already: false, path: `/fake/${a.item.event_id}.md` }
  }
  const r = sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, { ...opts, writeNote })
  const c = readCursors(stateDir)
  assert.ok(Date.parse(c.NHY) < Date.parse(tiedTs), 'cursor must stay strictly BEFORE the tied instant, not land ON it')
  // a second sweep must still ATTEMPT the failed item — proving it was not silently excluded by a cursor
  // that had already advanced to sit exactly on its timestamp (the `ts <= since` filter would otherwise
  // drop anything AT that instant, not just before it). Records attempts rather than asserting on real
  // dedup/disk state, since sweep 1's writeNote stub never touched disk in the first place.
  const attempted: string[] = []
  const writeNote2 = (a: { item: FeedItem }) => { attempted.push(a.item.event_id); return { already: false, path: `/fake/${a.item.event_id}.md` } }
  sweepOnce(['NHY'], DEFAULT_BATCH_CONFIG, { ...opts, writeNote: writeNote2 })
  assert.ok(attempted.includes(fails.event_id), 'the previously-failed same-instant item is retried, not silently excluded')
})

console.log(`\n${passed} bridge-batch checks passed`)
