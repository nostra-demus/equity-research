// Routed wire-event notes (screener_event_EVT-*.md) in the Data pool:
//   #4 (Codex P2 r3635737327) — sniffText() intentionally skips .md, so the pool NEVER read the note's
//      body and the headline/source display was dead on arrival; the fix reads the note directly. Proven
//      END-TO-END through analyzeTicker() against a temp DATA_DIR (ENGINE_REPO_ROOT override) — nothing
//      under the repo is touched. Red-on-old: sniff='' → parseWireEventNote(null) → no displayName.
//   #5 (Codex P2 r3635737323) — the note dated by the SCANNER-read time, not the article's publication
//      date, overstating pool freshness; the fix prefers the `published` segment. Proven directly on the
//      exported parseWireEventNote(). Red-on-old: it picks the first date (2026-07-23 scan), not 2026-04-15.
// Run: npx tsx test/wire-event-note.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'wire-note-'))
process.env.ENGINE_REPO_ROOT = TMP // so config's DATA_DIR = TMP/data — set BEFORE importing data-status
const { analyzeTicker, parseWireEventNote } = await import('../src/data-status')

let passed = 0
async function check(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// The exact header shape research-bridge.ts renderEventNote writes (scan time · published <date>).
const NOTE = [
  '# Wire event: BigCo posts record quarterly profit',
  '- Source: Reuters',
  '- Wire timestamp (when the scanner read it): 2026-07-23T09:00:00Z · published 2026-04-15',
  '',
  'News event routed from the screener wire.',
].join('\n')

const tickerDir = path.join(TMP, 'data', 'TESTX')
fs.mkdirSync(tickerDir, { recursive: true })
fs.writeFileSync(path.join(tickerDir, 'screener_event_EVT-abc123.md'), NOTE)

async function main() {
  // #5 — date preference, isolated on the pure parser. Expected value pinned to the note format authored
  // by renderEventNote: "<scan time> · published <published>" → the publication date is the evidence date.
  await check('#5 parseWireEventNote dates by the PUBLISHED date, not the scanner-read time', () => {
    const r = parseWireEventNote(NOTE, 'screener_event_EVT-abc123.md')
    assert.ok(r, 'the header parses')
    assert.equal(r?.periodHint, '2026-04-15', 'the published date (2026-04-15) wins over the 2026-07-23 scan time')
  })
  await check('#5 parseWireEventNote falls back to the wire timestamp when no published date is present', () => {
    const noPub = '# Wire event: Fresh news\n- Source: Reuters\n- Wire timestamp (when the scanner read it): 2026-07-20T09:00:00Z\n'
    const r = parseWireEventNote(noPub, 'screener_event_EVT-def456.md')
    assert.equal(r?.periodHint, '2026-07-20', 'no published segment → the wire timestamp is used (fallback intact)')
  })

  // #4 — end-to-end: the pool must actually READ the .md and surface its headline.
  await check('#4 a routed .md wire-event note surfaces its headline + published date in the pool', async () => {
    const status = await analyzeTicker('TESTX')
    const note = status.files.find((f) => f.filename === 'screener_event_EVT-abc123.md')
    assert.ok(note, 'the note file is classified into the pool')
    assert.equal(note?.displayName, 'BigCo posts record quarterly profit', 'displayName = the headline read from the .md body (sniffText skips .md; the fix reads it directly)')
    assert.equal(note?.periodHint, '2026-04-15', 'dated by the published date end-to-end')
  })
}

try {
  await main()
} finally {
  fs.rmSync(TMP, { recursive: true, force: true })
}
console.log(`\nwire-event-note.test.ts: ${passed} passed`)
