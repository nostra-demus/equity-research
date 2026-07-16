// research-bridge: wire event → data-pool note. Note rendering (tier header, verbatim story, §5 cite
// line), idempotent write, path/ticker barriers, auto-bridge floors + ticker matching, bridged-links
// scan, audit ledger, and the server-authoritative firehose lookup.
// Run: npx tsx test/research-bridge.test.ts   (exit 0 = all pass). Temp dirs only — never touches data/.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  autoBridgeItem, bridgeEventToSubject, eventNoteName, findWireItem, listBridgedSubjects,
  matchTrackedSubjects, renderEventNote, shouldAutoBridge,
} from '../src/research-bridge'
import type { FeedItem } from '../src/news/types'

let passed = 0
function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed++; console.log(`  ok  ${name}`) })
    .catch((e) => { console.error(`FAIL  ${name}\n      ${e?.message || e}`); process.exitCode = 1 })
}

const NOW = () => new Date('2026-07-16T10:00:00Z')

function fixtureItem(over: Partial<FeedItem> = {}): FeedItem {
  return {
    kind: 'item',
    ts: '2026-07-13T12:43:56Z',
    event_id: 'EVT-870c13fe70bd',
    headline: 'Housing Sales in Dubai Declines 16 Pc in Jan-Jun to AED 226 Bn Amid West Asia Conflict',
    url: 'https://www.outlookbusiness.com/news/housing-sales-in-dubai',
    domain: 'www.outlookbusiness.com',
    source_name: 'Outlook Business',
    via: 'rss',
    region: 'OTHER' as any,
    country: 'AE',
    input_nature: 'news_headline',
    triage_score: 60,
    band: 'watch' as any,
    triage_reason: 'sector datapoint',
    relevance: 'material' as any,
    event_types: ['macro_sector'],
    issuer_linkage: 'sector' as any,
    companies: [],
    size_bucket: 'unknown',
    snippet: 'Housing sales in Dubai fell 16% year-on-year to AED 225.7 billion in the first half of 2026.',
    dedup_status: 'new',
    inboxed: true,
    ...over,
  } as FeedItem
}

async function main() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rbridge-data-'))
  const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rbridge-state-'))
  const opts = { dataDir, stateDir, now: NOW }
  fs.mkdirSync(path.join(dataDir, 'EMAAR'))
  fs.mkdirSync(path.join(dataDir, 'AMZN'))
  fs.mkdirSync(path.join(dataDir, 'EXTERNAL-INBOX')) // reserved — must never match or accept a note

  await check('note name is deterministic and validated', () => {
    assert.equal(eventNoteName('EVT-870c13fe70bd'), 'screener_event_EVT-870c13fe70bd.md')
    assert.throws(() => eventNoteName('EVT-../../etc'), /bad event id/)
    assert.throws(() => eventNoteName('nope'), /bad event id/)
  })

  await check('renderEventNote: tier header, provenance, verbatim story, §5 cite line', () => {
    const md = renderEventNote({ item: fixtureItem(), ticker: 'EMAAR', mode: 'manual', user: 'ceekay@muns.io', now: NOW })
    assert.match(md, /§4 tier 10/)
    assert.match(md, /labelled unverified/)
    assert.match(md, /Event id: EVT-870c13fe70bd/)
    assert.match(md, /Outlook Business/)
    assert.match(md, /2026-07-13T12:43:56Z/)
    assert.match(md, /> Housing sales in Dubai fell 16% year-on-year to AED 225\.7 billion/) // verbatim, quoted
    assert.match(md, /Routed to EMAAR: manually .* ceekay@muns\.io/)
    assert.match(md, /Cite as: `Web: Outlook Business, 2026-07-13 \(EVT-870c13fe70bd, indicative, unverified\)`/)
    assert.match(md, /score 60 \(watch band\)/)
  })

  await check('renderEventNote strips control chars and caps runaway fields', () => {
    const md = renderEventNote({
      item: fixtureItem({ headline: 'A\u0001B\u0007C', snippet: 'x'.repeat(5000) }),
      ticker: 'EMAAR', mode: 'auto', user: 'auto', now: NOW,
    })
    assert.match(md, /# Wire event: ABC/)
    assert.ok(!md.includes('\u0001'))
    assert.ok(md.includes('\u2026')) // capped snippet
  })

  await check('bridgeEventToSubject writes the note once, idempotent on re-send', () => {
    const r1 = bridgeEventToSubject({ item: fixtureItem(), ticker: 'EMAAR', mode: 'manual', user: 'u@x', userVia: 'cf-access', opts })
    assert.equal(r1.already, false)
    assert.equal(r1.path, 'data/EMAAR/screener_event_EVT-870c13fe70bd.md')
    const abs = path.join(dataDir, 'EMAAR', 'screener_event_EVT-870c13fe70bd.md')
    assert.ok(fs.existsSync(abs))
    const r2 = bridgeEventToSubject({ item: fixtureItem(), ticker: 'EMAAR', mode: 'manual', user: 'u@x', userVia: 'cf-access', opts })
    assert.equal(r2.already, true)
    // no stray temp files left in the pool
    assert.deepEqual(fs.readdirSync(path.join(dataDir, 'EMAAR')).filter((f) => f.includes('.tmp.')), [])
  })

  await check('audit ledger records the routing (once — the idempotent re-send adds nothing)', () => {
    const ledger = fs.readFileSync(path.join(stateDir, 'research-bridge.ndjson'), 'utf8').trim().split('\n')
    assert.equal(ledger.length, 1)
    const rec = JSON.parse(ledger[0])
    assert.equal(rec.event_id, 'EVT-870c13fe70bd')
    assert.equal(rec.ticker, 'EMAAR')
    assert.equal(rec.mode, 'manual')
    assert.equal(rec.user, 'u@x')
  })

  await check('barriers: traversal ticker, reserved folder, unknown subject all reject', () => {
    assert.throws(() => bridgeEventToSubject({ item: fixtureItem(), ticker: '..', mode: 'manual', user: 'u', userVia: 'local', opts }), /bad subject/)
    assert.throws(() => bridgeEventToSubject({ item: fixtureItem(), ticker: 'EXTERNAL-INBOX', mode: 'manual', user: 'u', userVia: 'local', opts }), /reserved|bad subject/)
    assert.throws(() => bridgeEventToSubject({ item: fixtureItem(), ticker: 'NOPE', mode: 'manual', user: 'u', userVia: 'local', opts }), /unknown subject/)
  })

  await check('listBridgedSubjects finds the routed note and skips reserved folders', () => {
    const links = listBridgedSubjects('EVT-870c13fe70bd', dataDir)
    assert.deepEqual(links, [{ ticker: 'EMAAR', path: 'data/EMAAR/screener_event_EVT-870c13fe70bd.md' }])
    assert.deepEqual(listBridgedSubjects('EVT-000000000000', dataDir), [])
    assert.deepEqual(listBridgedSubjects('not-an-id', dataDir), [])
  })

  await check('shouldAutoBridge floors: material + score ≥ 60, never social/caution, kill switch works', () => {
    assert.equal(shouldAutoBridge(fixtureItem({ triage_score: 72 })), true)
    assert.equal(shouldAutoBridge(fixtureItem({ triage_score: 59 })), false)
    assert.equal(shouldAutoBridge(fixtureItem({ relevance: 'relevant_non_material' as any, triage_score: 90 })), false)
    assert.equal(shouldAutoBridge(fixtureItem({ source_tier: 'social' as any, triage_score: 90 })), false)
    assert.equal(shouldAutoBridge(fixtureItem({ caution: true, triage_score: 90 })), false)
    process.env.SCREENER_RESEARCH_BRIDGE = '0'
    assert.equal(shouldAutoBridge(fixtureItem({ triage_score: 90 })), false)
    delete process.env.SCREENER_RESEARCH_BRIDGE
    process.env.SCREENER_RESEARCH_BRIDGE_MIN_SCORE = '80'
    assert.equal(shouldAutoBridge(fixtureItem({ triage_score: 72 })), false)
    delete process.env.SCREENER_RESEARCH_BRIDGE_MIN_SCORE
  })

  await check('matchTrackedSubjects: exact ticker + pre-suffix base, tracked pools only', () => {
    const it = fixtureItem({
      companies: [
        { name: 'Emaar Properties', ticker: 'EMAAR.DU', listing_country: 'AE' },
        { name: 'Amazon', ticker: 'AMZN', listing_country: 'US' },
        { name: 'Untracked Co', ticker: 'ZZZQ', listing_country: null },
        { name: 'No ticker Co', ticker: null, listing_country: null },
      ],
    })
    assert.deepEqual(matchTrackedSubjects(it, dataDir), ['AMZN', 'EMAAR'])
    assert.deepEqual(matchTrackedSubjects(fixtureItem(), dataDir), []) // no extracted companies
  })

  await check('autoBridgeItem routes a material match, dedupes, and never throws', () => {
    const it = fixtureItem({
      event_id: 'EVT-11111d1dbfe4',
      triage_score: 74,
      companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }],
    })
    assert.deepEqual(autoBridgeItem(it, opts), ['AMZN'])
    assert.ok(fs.existsSync(path.join(dataDir, 'AMZN', 'screener_event_EVT-11111d1dbfe4.md')))
    assert.deepEqual(autoBridgeItem(it, opts), []) // already routed — nothing new
    const note = fs.readFileSync(path.join(dataDir, 'AMZN', 'screener_event_EVT-11111d1dbfe4.md'), 'utf8')
    assert.match(note, /Routed to AMZN: automatically/)
    // a low-score item never enters the pool
    const low = fixtureItem({ event_id: 'EVT-22222d1dbfe4', triage_score: 30, companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] })
    assert.deepEqual(autoBridgeItem(low, opts), [])
    assert.ok(!fs.existsSync(path.join(dataDir, 'AMZN', 'screener_event_EVT-22222d1dbfe4.md')))
  })

  await check('findWireItem: server-authoritative firehose lookup, newest-first, bounded', () => {
    const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rbridge-repo-'))
    const inbox = path.join(repoRoot, 'screener', 'inbox')
    fs.mkdirSync(inbox, { recursive: true })
    const line = JSON.stringify(fixtureItem())
    fs.writeFileSync(path.join(inbox, '2026-07-13_firehose.ndjson'), `${line}\n{"kind":"cycle_summary","ts":"x"}\nnot-json\n`)
    const hit = findWireItem(repoRoot, 'EVT-870c13fe70bd')
    assert.ok(hit)
    assert.equal(hit!.headline, fixtureItem().headline)
    assert.equal(findWireItem(repoRoot, 'EVT-000000000000'), null)
    assert.equal(findWireItem(repoRoot, '../etc/passwd' as any), null)
  })

  console.log(`\nresearch-bridge: ${passed} checks passed${process.exitCode ? ' — WITH FAILURES' : ''}`)
}

void main()
