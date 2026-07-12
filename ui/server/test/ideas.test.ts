// The PM-skim idea pass (news/ideas): the free-LLM idea extraction must be coerce-safe (model drift
// degrades to a dropped idea, never a crash), the batched call must honor the same reliability contract as
// triage (never throw, defer on !ok, report truncation), and idea identity must be stable so a re-surfacing
// updates in place. Pure + fetch-stubbed — spends no tokens, launches nothing.
// Run: npx tsx test/ideas.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { buildIdeaUserMessage, coerceIdea, estimateIdeaTokens, surfaceIdeasBatch, type IdeaInputRow } from '../src/news/ideas/surface-ideas'
import { ideaId, readIdeaById, readTopSweepRows, topNHash, writeIdea } from '../src/news/ideas/ideas-store'
import { eventIdFor } from '../src/news/normalize'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) } catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const noSleep = async () => {}
// A fetch stub returning one chat-completion body (or an HTTP error), with header.get support.
function stubFetch(body: any, opts: { ok?: boolean; status?: number; finish?: string } = {}): typeof fetch {
  return (async () => ({
    ok: opts.ok !== false,
    status: opts.status ?? 200,
    headers: { get: () => null },
    async text() { return typeof body === 'string' ? body : JSON.stringify(body) },
    async json() {
      return { choices: [{ finish_reason: opts.finish ?? 'stop', message: { content: typeof body === 'string' ? body : JSON.stringify(body) } }], usage: { total_tokens: 1234 } }
    },
  })) as unknown as typeof fetch
}
const OPTS = { model: 'm', baseUrl: 'http://x', apiKey: 'k' }
const ROWS: IdeaInputRow[] = [
  { event_id: 'EVT-1', headline: 'A closes strait', headline_orig: 'A closes strait', url: 'http://a', source_name: 'Reuters', region: 'GLOBAL', materiality: 100, label: 'critical', event_types: ['macro_sector'], issuer_linkage: 'macro', companies: [], found_at: '2026-07-12T12:00:00Z' },
  { event_id: 'EVT-2', headline: 'B expands refinery', headline_orig: 'B expands refinery', url: 'http://b', source_name: 'BusinessLine', region: 'IN', materiality: 88, label: 'high', event_types: ['capex'], issuer_linkage: 'primary', companies: [{ name: 'B', ticker: 'BBB', listing_country: 'IN' }], found_at: '2026-07-12T11:00:00Z' },
]

// ---- coerceIdea ----
check('coerceIdea drops an idea with no valid source index', () => {
  assert.equal(coerceIdea({ src: [5], ticker: 'AAA' }, 2), null) // 5 out of range
  assert.equal(coerceIdea({ src: [], ticker: 'AAA' }, 2), null)
})
check('coerceIdea drops an idea with no valid ticker (no source = no claim)', () => {
  assert.equal(coerceIdea({ src: [0], ticker: '' }, 2), null)
  assert.equal(coerceIdea({ src: [0], ticker: 'this is not a ticker' }, 2), null)
})
check('coerceIdea clamps conviction and defaults side/priced/type safely', () => {
  const i = coerceIdea({ src: [0, 0, 9], ticker: 'stng', conviction: 250, direction: 'sideways', priced_in: 'maybe', thesis_type: 'nonsense' }, 2)
  assert.ok(i)
  assert.equal(i!.conviction, 100)
  assert.equal(i!.ticker, 'STNG')            // uppercased
  assert.deepEqual(i!.src, [0])              // deduped, out-of-range 9 dropped
  assert.equal(i!.direction, 'long')          // bad enum -> safe default
  assert.equal(i!.priced_in, 'unknown')
  assert.equal(i!.thesis_type, 'company_specific')
})
check('coerceIdea keeps pair_with only for a pair', () => {
  assert.equal(coerceIdea({ src: [0], ticker: 'AAA', direction: 'long', pair_with: 'BBB' }, 2)!.pair_with, null)
  assert.equal(coerceIdea({ src: [0], ticker: 'AAA', direction: 'pair', pair_with: 'bbb' }, 2)!.pair_with, 'BBB')
})
check('coerceIdea negative/NaN conviction floors at 0', () => {
  assert.equal(coerceIdea({ src: [0], ticker: 'AAA', conviction: -5 }, 2)!.conviction, 0)
  assert.equal(coerceIdea({ src: [0], ticker: 'AAA', conviction: 'x' }, 2)!.conviction, 0)
})

// ---- surfaceIdeasBatch (fetch-stubbed; never throws, honors the reliability contract) ----
check('surfaceIdeasBatch parses ideas and drops the invalid ones', async () => {
  const r = await surfaceIdeasBatch(ROWS, OPTS, stubFetch({ ideas: [
    { src: [0], ticker: 'STNG', direction: 'long', conviction: 61 },
    { src: [1], ticker: '', direction: 'long' },        // dropped: no ticker
    { ticker: 'ZZZ' },                                    // dropped: no src
  ] }), noSleep)
  assert.equal(r.ok, true)
  assert.equal(r.ideas.length, 1)
  assert.equal(r.ideas[0].ticker, 'STNG')
})
check('surfaceIdeasBatch: empty rows is a no-op ok (no spend)', async () => {
  const r = await surfaceIdeasBatch([], OPTS, stubFetch({ ideas: [] }), noSleep)
  assert.equal(r.ok, true); assert.equal(r.requests, 0); assert.equal(r.ideas.length, 0)
})
check('surfaceIdeasBatch: missing api key returns ok:false without a call', async () => {
  const r = await surfaceIdeasBatch(ROWS, { ...OPTS, apiKey: '' }, stubFetch({ ideas: [] }), noSleep)
  assert.equal(r.ok, false); assert.equal(r.requests, 0)
})
check('surfaceIdeasBatch: a max_tokens truncation is reported, not half-parsed', async () => {
  const r = await surfaceIdeasBatch(ROWS, OPTS, stubFetch({ ideas: [{ src: [0], ticker: 'AAA' }] }, { finish: 'length' }), noSleep)
  assert.equal(r.ok, false); assert.equal(r.ideas.length, 0); assert.match(r.note || '', /truncated/)
})
check('surfaceIdeasBatch: a terminal HTTP error returns ok:false (deferred, not scored-zero)', async () => {
  const r = await surfaceIdeasBatch(ROWS, OPTS, stubFetch('bad', { ok: false, status: 400 }), noSleep, noSleep)
  assert.equal(r.ok, false); assert.match(r.note || '', /HTTP 400/)
})
check('surfaceIdeasBatch: non-JSON content returns ok:false, never throws', async () => {
  const r = await surfaceIdeasBatch(ROWS, OPTS, stubFetch('not json at all'), noSleep)
  assert.equal(r.ok, false)
})

// ---- identity + helpers ----
check('ideaId is stable and differs by direction', () => {
  assert.equal(ideaId('STNG', 'long'), ideaId('stng', 'long'))      // case-insensitive
  assert.notEqual(ideaId('STNG', 'long'), ideaId('STNG', 'short'))  // direction is part of identity
  assert.match(ideaId('STNG', 'long'), /^IDEA-[a-f0-9]{12}$/)
})
check('topNHash is order-independent and changes with the set', () => {
  assert.equal(topNHash(ROWS), topNHash([...ROWS].reverse()))
  assert.notEqual(topNHash(ROWS), topNHash([ROWS[0]]))
})
check('buildIdeaUserMessage carries the pre-computed materiality + names', () => {
  const msg = buildIdeaUserMessage(ROWS)
  assert.match(msg, /materiality=100/)
  assert.match(msg, /B \(BBB\)/)      // company name+ticker
  assert.match(msg, /severity=critical/)
})
check('estimateIdeaTokens grows with the row count', () => {
  assert.ok(estimateIdeaTokens(12) > estimateIdeaTokens(2))
})

// ---- readTopSweepRows (fs, temp repo) ----
check('readTopSweepRows reads the freshest sweep, sorts by materiality, drops consumed/dismissed', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, '2026-07-10_sweep.json'), JSON.stringify({ rows: [{ headline: 'stale day', url: 'http://s', triage_score: 99 }] }))
  fs.writeFileSync(path.join(inbox, '2026-07-12_sweep.json'), JSON.stringify({ rows: [
    { headline: 'low', url: 'http://l', triage_score: 20, source_name: 'X' },
    { headline: 'top', url: 'http://t', triage_score: 95, source_name: 'X' },
    { headline: 'consumed', url: 'http://c', triage_score: 90, consumed: true },
    { headline: 'no score', url: 'http://n' },
  ] }))
  const rows = readTopSweepRows(dir, 5)
  assert.equal(rows.length, 2)              // consumed + no-score dropped; stale day's file ignored (newest only)
  assert.equal(rows[0].headline, 'top')     // sorted by materiality desc
  assert.equal(rows[1].headline, 'low')
  assert.equal(rows[0].event_id, eventIdFor('top', 'http://t')) // canonical id, matches the wire/ledger join key
  fs.rmSync(dir, { recursive: true, force: true })
})
check('readTopSweepRows keeps the ORIGINAL headline for the SIG byte-match on a non-English row', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-'))
  const inbox = path.join(dir, 'screener', 'inbox')
  fs.mkdirSync(inbox, { recursive: true })
  fs.writeFileSync(path.join(inbox, '2026-07-12_sweep.json'), JSON.stringify({ rows: [
    { headline: 'ソフトバンクが半導体を売却', headline_en: 'SoftBank to sell chip business', url: 'http://jp', triage_score: 80, source_name: 'Nikkei' },
  ] }))
  const [row] = readTopSweepRows(dir, 5)
  assert.equal(row.headline, 'SoftBank to sell chip business')      // display + LLM use the translation
  assert.equal(row.headline_orig, 'ソフトバンクが半導体を売却')       // promote uses the ORIGINAL -> SIG byte-matches the wire launch
  assert.equal(row.event_id, eventIdFor('ソフトバンクが半導体を売却', 'http://jp')) // canonical id over the original
  fs.rmSync(dir, { recursive: true, force: true })
})

// ---- readIdeaById path-traversal barrier (security: the `:id` route param reaches a filesystem path) ----
// Expected behaviour pinned to the security contract, NOT to current code: readIdeaById must ONLY read a
// file named by a strict IDEA-<12 hex> token; any id containing a traversal segment (or any non-token
// shape) must return null and must NOT read a file outside the ideas dir. Red-on-old (pre-guard the
// traversal id read `screener/ledger/evil.json`), green-on-new.
check('readIdeaById reads a well-formed idea by its strict id', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-'))
  const id = ideaId('BBB', 'long')
  writeIdea(dir, { idea_id: id, ticker: 'BBB' } as any)
  const got = readIdeaById(dir, id)
  assert.equal(got?.idea_id, id)
  fs.rmSync(dir, { recursive: true, force: true })
})
check('readIdeaById refuses a path-traversal id and never escapes the ideas dir', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-'))
  // plant a valid-looking snapshot OUTSIDE the ideas dir, exactly where `../evil` would land
  const escape = path.join(dir, 'screener', 'ledger', 'evil.json')
  fs.mkdirSync(path.dirname(escape), { recursive: true })
  fs.writeFileSync(escape, JSON.stringify({ idea_id: 'ESCAPED', ticker: 'X' }))
  assert.equal(readIdeaById(dir, '../evil'), null)                 // traversal → refused (pre-fix returned the ESCAPED file)
  assert.equal(readIdeaById(dir, '../../../../etc/hosts'), null)   // absolute-ish traversal → refused
  assert.equal(readIdeaById(dir, 'IDEA-not12hex'), null)           // wrong shape → refused
  assert.equal(readIdeaById(dir, 'IDEA-AAAAAAAAAAAA'), null)       // uppercase hex not in the [a-f0-9] token → refused
  fs.rmSync(dir, { recursive: true, force: true })
})

// summary
setTimeout(() => console.log(`\n${passed} checks passed`), 50)
