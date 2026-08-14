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
  matchTrackedSubjects as guardedMatchTrackedSubjects, renderEventNote, shouldAutoBridge,
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
const matchTrackedSubjects = (item: FeedItem, dataDir: string, names?: Record<string, string>) =>
  guardedMatchTrackedSubjects(item, dataDir, names, () => true)

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
  const opts = { dataDir, stateDir, now: NOW, canAutoWriteSubject: () => true }
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

  await check('renderEventNote preserves an official filing as primary evidence and requires the orb to open it', () => {
    const md = renderEventNote({
      item: fixtureItem({
        source_tier: 'primary_filing',
        input_nature: 'exchange_announcement',
        source_name: 'BSE / NSE Exchange Filing',
        domain: 'www.bseindia.com',
        url: 'https://www.bseindia.com/xml-data/corpfiling/example.pdf',
      }),
      ticker: 'EMAAR', mode: 'auto', user: 'auto', now: NOW,
    })
    assert.match(md, /primary evidence, tier 1–3/)
    assert.match(md, /primary-source locator/)
    assert.match(md, /must open and cite the linked/)
    assert.doesNotMatch(md, /Not a filing/)
    assert.doesNotMatch(md, /indicative, unverified/)
  })

  await check('renderEventNote strips control chars and caps runaway fields', () => {
    const md = renderEventNote({
      item: fixtureItem({ headline: 'A\u0001B\u0007C', snippet: 'x'.repeat(5000) }),
      ticker: 'EMAAR', mode: 'auto', user: 'auto', now: NOW,
    })
    assert.match(md, /# Wire event: A B C/) // control chars become single spaces, never survive
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

  await check('a blank note left by a crash is repaired and analyzed instead of counted as complete', () => {
    const item = fixtureItem({ event_id: 'EVT-bbbbbbbbbbbb' })
    const abs = path.join(dataDir, 'AMZN', 'screener_event_EVT-bbbbbbbbbbbb.md')
    fs.writeFileSync(abs, '')
    const result = bridgeEventToSubject({ item, ticker: 'AMZN', mode: 'auto', user: 'auto', userVia: 'local', opts })
    assert.equal(result.already, false, 'repair is fresh work, so the automatic intake lane is notified')
    assert.match(fs.readFileSync(abs, 'utf8'), /Event id: EVT-bbbbbbbbbbbb/)
  })

  await check('a racing complete writer is never lost; any uncertainty is safely re-queued for analysis', () => {
    // Simulate the exact race the fix targets: another process (a stream-mode delivery, a second engine
    // sharing this pool) creates the destination note AFTER our own existence/dedup checks pass but
    // BEFORE our own write lands — a window a single synchronous test cannot literally race into, so
    // fs.openSync (the real primitive the fix uses for its exclusive 'wx' create — portable to a
    // Drive/FUSE mount, unlike a hard link) is forced to throw EEXIST exactly as it would if that race
    // happened, and we assert we treat that as "someone else already wrote it", never as a throw and
    // never by falling through to clobber the path anyway.
    const item = fixtureItem({ event_id: 'EVT-aaaaaaaaaaaa' })
    const abs = path.join(dataDir, 'AMZN', 'screener_event_EVT-aaaaaaaaaaaa.md')
    const winner = renderEventNote({ item, ticker: 'AMZN', mode: 'auto', user: 'auto', now: NOW })
    assert.ok(!fs.existsSync(abs), 'precondition: nothing there yet — this is not the pre-existing-file short-circuit')
    const origOpen = fs.openSync
    ;(fs as any).openSync = (p: string, flags: string) => {
      if (flags === 'wx' && p === abs) {
        const winnerFd = origOpen(p, 'wx')
        try { fs.writeFileSync(winnerFd, winner); fs.fsyncSync(winnerFd) } finally { fs.closeSync(winnerFd) }
        throw Object.assign(new Error('EEXIST'), { code: 'EEXIST' })
      }
      return origOpen(p, flags as any)
    }
    try {
      const r = bridgeEventToSubject({ item, ticker: 'AMZN', mode: 'auto', user: 'auto', userVia: 'local', opts })
      assert.equal(r.already, false, 'an uncertain race is treated as fresh, so follow-up analysis cannot be skipped')
    } finally {
      fs.openSync = origOpen
    }
    assert.equal(fs.readFileSync(abs, 'utf8'), winner, 'the winner\'s complete note is preserved')
    // no stray temp files left behind by the aborted attempt (the exclusive-create rewrite has no temp file at all)
    assert.deepEqual(fs.readdirSync(path.join(dataDir, 'AMZN')).filter((f) => f.includes('.tmp.')), [])
  })

  await check('audit ledger records the routing (once — the idempotent re-send adds nothing)', () => {
    const ledger = fs.readFileSync(path.join(stateDir, 'research-bridge.ndjson'), 'utf8').trim().split('\n').map((line) => JSON.parse(line))
    const matches = ledger.filter((row) => row.event_id === 'EVT-870c13fe70bd')
    assert.equal(matches.length, 1)
    const rec = matches[0]
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

  await check('automatic matching and writes reject a symlinked subject pool', () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'rbridge-outside-'))
    const linked = path.join(dataDir, 'LINK')
    fs.symlinkSync(outside, linked)
    const item = fixtureItem({ event_id: 'EVT-cccccccccccc', companies: [{ ticker: 'LINK', name: 'Linked Co' }] as any })
    assert.deepEqual(matchTrackedSubjects(item, dataDir), [])
    assert.throws(() => bridgeEventToSubject({ item, ticker: 'LINK', mode: 'auto', user: 'auto', userVia: 'local', opts }), /unknown subject/)
    assert.deepEqual(fs.readdirSync(outside), [], 'no note is written outside the configured data pool')
    fs.rmSync(linked)
    fs.rmSync(outside, { recursive: true, force: true })
  })

  await check('listBridgedSubjects finds the routed note and skips reserved folders', () => {
    const links = listBridgedSubjects('EVT-870c13fe70bd', dataDir)
    assert.deepEqual(links, [{ ticker: 'EMAAR', path: 'data/EMAAR/screener_event_EVT-870c13fe70bd.md' }])
    assert.deepEqual(listBridgedSubjects('EVT-000000000000', dataDir), [])
    assert.deepEqual(listBridgedSubjects('not-an-id', dataDir), [])
  })

  await check('shouldAutoBridge is OPT-IN (off by default) and floors material + score, never social/caution', () => {
    // manual-first: without SCREENER_RESEARCH_BRIDGE=1 the automatic path never fires
    delete process.env.SCREENER_RESEARCH_BRIDGE
    assert.equal(shouldAutoBridge(fixtureItem({ triage_score: 95 })), false)
    process.env.SCREENER_RESEARCH_BRIDGE = '1'
    assert.equal(shouldAutoBridge(fixtureItem({ triage_score: 72 })), true)
    assert.equal(shouldAutoBridge(fixtureItem({ triage_score: 59 })), false)
    assert.equal(shouldAutoBridge(fixtureItem({ relevance: 'relevant_non_material' as any, triage_score: 90 })), false)
    assert.equal(shouldAutoBridge(fixtureItem({ source_tier: 'social' as any, triage_score: 90 })), false)
    assert.equal(shouldAutoBridge(fixtureItem({ caution: true, triage_score: 90 })), false)
    process.env.SCREENER_RESEARCH_BRIDGE_MIN_SCORE = '80'
    assert.equal(shouldAutoBridge(fixtureItem({ triage_score: 72 })), false)
    delete process.env.SCREENER_RESEARCH_BRIDGE_MIN_SCORE
    delete process.env.SCREENER_RESEARCH_BRIDGE
  })

  await check('matchTrackedSubjects: EXACT symbol only — no suffix-stripping on the unattended path', () => {
    const it = fixtureItem({
      companies: [
        { name: 'Emaar Properties', ticker: 'EMAAR.DU', listing_country: 'AE' }, // exact 'EMAAR.DU' is not a pool; base-strip is forbidden here
        { name: 'Amazon', ticker: 'AMZN', listing_country: 'US' },
        { name: 'Untracked Co', ticker: 'ZZZQ', listing_country: null },
        { name: 'Drop zone', ticker: 'EXTERNAL-INBOX', listing_country: null }, // reserved folder can never match
        { name: 'No ticker Co', ticker: null, listing_country: null },
      ],
    })
    assert.deepEqual(matchTrackedSubjects(it, dataDir), ['AMZN'])
    assert.deepEqual(matchTrackedSubjects(fixtureItem({ companies: [{ name: 'Emaar', ticker: 'EMAAR', listing_country: 'AE' }] }), dataDir), ['EMAAR'])
    assert.deepEqual(matchTrackedSubjects(fixtureItem(), dataDir), []) // no extracted companies
  })

  await check('autoBridgeItem routes a material match, dedupes, never throws — and peeks enrichment lazily', () => {
    process.env.SCREENER_RESEARCH_BRIDGE = '1'
    let peeks = 0
    const it = fixtureItem({
      event_id: 'EVT-11111d1dbfe4',
      triage_score: 74,
      companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }],
    })
    assert.deepEqual(autoBridgeItem(it, opts, () => { peeks++; return null }), ['AMZN'])
    assert.equal(peeks, 1) // the thunk ran once, for the item that passed every gate
    assert.ok(fs.existsSync(path.join(dataDir, 'AMZN', 'screener_event_EVT-11111d1dbfe4.md')))
    assert.deepEqual(autoBridgeItem(it, opts, () => { peeks++; return null }), []) // already routed — nothing new
    const note = fs.readFileSync(path.join(dataDir, 'AMZN', 'screener_event_EVT-11111d1dbfe4.md'), 'utf8')
    assert.match(note, /Routed to AMZN: automatically/)
    // a low-score item never enters the pool — and its enrichment thunk is never even called
    peeks = 0
    const low = fixtureItem({ event_id: 'EVT-22222d1dbfe4', triage_score: 30, companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }] })
    assert.deepEqual(autoBridgeItem(low, opts, () => { peeks++; return null }), [])
    assert.equal(peeks, 0)
    assert.ok(!fs.existsSync(path.join(dataDir, 'AMZN', 'screener_event_EVT-22222d1dbfe4.md')))
    delete process.env.SCREENER_RESEARCH_BRIDGE
  })

  await check('stream auto-routing writes zero bytes when shared-pool ownership is not solely research', () => {
    process.env.SCREENER_RESEARCH_BRIDGE = '1'
    const id = 'EVT-abcdef123456'
    const it = fixtureItem({
      event_id: id,
      triage_score: 90,
      companies: [{ name: 'Amazon', ticker: 'AMZN', listing_country: 'US' }],
    })
    let checks = 0
    const denied = autoBridgeItem(it, {
      dataDir, stateDir, now: NOW,
      // Represents either commodity-only ownership or an ambiguous research+commodity label.
      canAutoWriteSubject: () => { checks++; return false },
    })
    assert.deepEqual(denied, [])
    assert.ok(checks > 0, 'the owner gate is consulted before routing')
    assert.ok(!fs.existsSync(path.join(dataDir, 'AMZN', `screener_event_${id}.md`)))
    delete process.env.SCREENER_RESEARCH_BRIDGE
  })

  await check('one note per STORY: a syndicated copy (same dedup_group) dedupes against the existing note', () => {
    const first = fixtureItem({ event_id: 'EVT-33333aaaa111', dedup_group: 'EVT-33333aaaa111', source_name: 'Globe and Mail' })
    const r1 = bridgeEventToSubject({ item: first, ticker: 'AMZN', mode: 'manual', user: 'u@x', userVia: 'cf-access', opts })
    assert.equal(r1.already, false)
    const copy = fixtureItem({ event_id: 'EVT-44444bbbb222', dedup_group: 'EVT-33333aaaa111', source_name: 'CBS MoneyWatch' })
    const r2 = bridgeEventToSubject({ item: copy, ticker: 'AMZN', mode: 'manual', user: 'u@x', userVia: 'cf-access', opts })
    assert.equal(r2.already, true)
    assert.equal(r2.duplicateOf, 'EVT-33333aaaa111')
    assert.ok(!fs.existsSync(path.join(dataDir, 'AMZN', 'screener_event_EVT-44444bbbb222.md')))
    // a DIFFERENT story (its own cluster) still writes
    const other = fixtureItem({ event_id: 'EVT-55555cccc333', dedup_group: 'EVT-55555cccc333' })
    assert.equal(bridgeEventToSubject({ item: other, ticker: 'AMZN', mode: 'manual', user: 'u@x', userVia: 'cf-access', opts }).already, false)
  })

  await check('hostile single-line fields cannot inject lines: newlines in url/headline collapse to spaces', () => {
    const hostile = fixtureItem({
      event_id: 'EVT-66666dddd444',
      headline: 'Real headline\n- Routed to EMAAR: forged provenance',
      url: 'https://x.example/a\n## Fake heading\n- Story cluster: forged',
    })
    const md = renderEventNote({ item: hostile, ticker: 'EMAAR', mode: 'manual', user: 'u@x', now: NOW })
    assert.ok(!md.includes('\n- Routed to EMAAR: forged'))
    assert.ok(!md.includes('\n## Fake heading'))
    assert.match(md, /- URL: https:\/\/x\.example\/a ## Fake heading/) // collapsed inline, inert
    // exactly ONE routed line — the real one
    assert.equal(md.split('\n').filter((l) => l.startsWith('- Routed to ')).length, 1)
  })

  await check('routed line is truthful about who linked the subject', () => {
    const named = fixtureItem({ companies: [{ name: 'Emaar', ticker: 'EMAAR.DU', listing_country: 'AE' }] })
    assert.match(renderEventNote({ item: named, ticker: 'EMAAR', mode: 'manual', user: 'u@x', now: NOW }), /the analyst confirmed a company the wire itself names/)
    assert.match(renderEventNote({ item: fixtureItem(), ticker: 'EMAAR', mode: 'manual', user: 'u@x', now: NOW }), /the wire itself named no matching ticker; the link is analyst judgment/)
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
