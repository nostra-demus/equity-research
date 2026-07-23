// Live-price decision-bar helpers (lib/format.ts): the pure number-to-string logic behind the
// DecisionBanner's live cells. Extracted from the component so it is testable without importing the store
// (which pulls in import.meta.env). Covers four reviewer findings:
//   - stampDayUTC: a settled-session close date must render its UTC calendar day, not the viewer's local
//     day — a bare UTC-midnight close reads as the PREVIOUS day west of UTC otherwise (Codex P2).
//   - priceQualifier: a stale (failed-refresh) quote must SHOW "not current" on screen even when a
//     re-based "vs entry" move is also available — a cached value must never read as current (Codex P1).
//   - priceProvenance: the tooltip names the actual feed (CNBC) with the indicative/unverified label
//     (CLAUDE.md §5), not a generic "public market-data source" (Codex P1).
//   - preferRunRoot: a run that just finished re-bases the quote against its OWN root, not the store's
//     possibly-stale current root (Codex P1).
// Run: npx tsx src/lib/liveQuoteFormat.test.ts

// Force a timezone WEST of UTC so the stampDayUTC test actually exposes the local-vs-UTC bug. Node reads
// process.env.TZ at Date time, so setting it before the first Date call below is enough.
process.env.TZ = 'America/Los_Angeles'

import assert from 'node:assert/strict'
import { preferRunRoot, priceProvenance, priceQualifier, stampDayUTC } from './format'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// ---- finding 5: stampDayUTC renders the UTC calendar day regardless of the viewer's timezone ----

check('stampDayUTC: a UTC-midnight close renders its UTC day, not the local previous day', () => {
  // In America/Los_Angeles this instant is 21 Jul 17:00 local — the buggy local formatter showed "21 Jul".
  assert.equal(stampDayUTC('2026-07-22T00:00:00.000Z'), '22 Jul 2026')
  // A bare date parses as UTC midnight and must survive the same way.
  assert.equal(stampDayUTC('2026-01-01'), '1 Jan 2026')
})

check('stampDayUTC: empty/unparseable input is the empty string, never a crash', () => {
  assert.equal(stampDayUTC(null), '')
  assert.equal(stampDayUTC(undefined), '')
  assert.equal(stampDayUTC('not a date'), '')
})

// ---- finding 4: priceQualifier surfaces staleness in the VISIBLE slot ----

check('priceQualifier: a fresh quote with a call shows the "vs entry" move', () => {
  assert.equal(priceQualifier({ stale: false }, { move_since_call_pct: 2.7 }), ' +2.7% vs entry')
  assert.equal(priceQualifier({ stale: false }, { move_since_call_pct: -16.1 }), ' -16.1% vs entry')
})

check('priceQualifier: a STALE quote shows "not current" EVEN when a call is present (was suppressed)', () => {
  // The bug: with a call, the "vs entry" branch won and the stale warning lived only in the hover title.
  assert.equal(priceQualifier({ stale: true }, { move_since_call_pct: 2.7 }), ' · not current')
  assert.equal(priceQualifier({ stale: true }, null), ' · not current')
})

check('priceQualifier: a fresh quote with no call has no qualifier', () => {
  assert.equal(priceQualifier({ stale: false }, null), undefined)
})

// ---- finding 3: priceProvenance names the feed with the §5 indicative/unverified label ----

check('priceProvenance: names CNBC and labels the quote indicative + unverified', () => {
  const s = priceProvenance('cnbc')
  assert.match(s, /CNBC/, 'the actual feed is named, not a generic "public market-data source"')
  assert.match(s, /indicative/i)
  assert.match(s, /unverified/i)
  assert.doesNotMatch(s, /public market-data source/, 'the generic phrasing is gone for a known feed')
})

// ---- finding 2: preferRunRoot lets a just-finished run win over the store's stale current root ----

check('preferRunRoot: an explicit run root wins over the store current (the finished-run case)', () => {
  assert.equal(preferRunRoot('analyses/T_2026-07-23', 'analyses/T_2026-07-01'), 'analyses/T_2026-07-23')
})

check('preferRunRoot: falls back to the store current, then to undefined', () => {
  assert.equal(preferRunRoot(undefined, 'analyses/T_2026-07-01'), 'analyses/T_2026-07-01')
  assert.equal(preferRunRoot(null, 'analyses/T_2026-07-01'), 'analyses/T_2026-07-01')
  assert.equal(preferRunRoot(undefined, null), undefined)
  assert.equal(preferRunRoot(undefined, undefined), undefined)
})

console.log(`\nliveQuoteFormat.test.ts: ${passed} passed`)
