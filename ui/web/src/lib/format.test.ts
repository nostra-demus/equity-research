// fmtMinutes — the one minutes/hours/days ladder shared by the countdown (resetIn) and by plain spans
// such as the news bridge's sweep interval. It exists because the bridge chip rounded straight to hours
// and printed "sweeping every 0h" / "next 0h" for any cadence under half an hour — which is exactly what
// an operator sets (the 15m clamp floor) when they shorten the interval to watch a sweep happen.
// Run: npx tsx src/lib/format.test.ts
import assert from 'node:assert/strict'
import { fmtMinutes, nextSweepLabel, resetIn, resolveConfidence, resolveVerdict, resolveVerdictOriginal, verdictIsCapped } from './format'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('a sub-hour span reads in MINUTES — never the "0h" the bridge chip used to print', () => {
  assert.equal(fmtMinutes(15), '15m')   // BRIDGE_INTERVAL_MIN's clamp floor
  assert.equal(fmtMinutes(29), '29m')   // Math.round(29/60) === 0 — the old bug's worst case
  assert.equal(fmtMinutes(59), '59m')
})

check('a span never rounds away to nothing — the floor is 1m, not 0m', () => {
  assert.equal(fmtMinutes(0), '1m')
  assert.equal(fmtMinutes(0.4), '1m')
})

check('hours once an hour is reached, days past two', () => {
  assert.equal(fmtMinutes(60), '1h')
  assert.equal(fmtMinutes(12 * 60), '12h')     // the bridge's shipped 12h cadence
  assert.equal(fmtMinutes(47 * 60), '47h')
  assert.equal(fmtMinutes(48 * 60), '2d')
  assert.equal(fmtMinutes(7 * 24 * 60), '7d')  // BRIDGE_INTERVAL_MIN's clamp ceiling
})

check('resetIn still measures from a timestamp and keeps its "now" case', () => {
  const now = Date.now()
  assert.equal(resetIn(undefined), null)
  assert.equal(resetIn(0), null)                                  // falsy epoch → no countdown
  assert.equal(resetIn(Math.floor((now - 5_000) / 1000)), 'now')  // already elapsed
  assert.equal(resetIn(Math.floor((now + 20 * 60_000) / 1000)), '20m')
  assert.equal(resetIn(Math.floor((now + 3 * 3_600_000) / 1000)), '3h')
})

check('resetIn and fmtMinutes agree — one ladder, not two', () => {
  // Values deliberately kept off the .5-unit rounding boundaries. resetIn takes epoch SECONDS, so building
  // its argument loses up to 999ms: an exact 90 minutes arrives as 89.99 and rounds to '1h', while
  // fmtMinutes(90) sees 1.5 hours exactly and rounds to '2h'. That is the input's precision, not two
  // different ladders — asserting on a boundary would only make this test flaky.
  for (const mins of [1, 15, 45, 100, 60 * 5, 60 * 50, 60 * 24 * 5]) {
    assert.equal(resetIn(Math.floor((Date.now() + mins * 60_000) / 1000)), fmtMinutes(mins), `${mins}m`)
  }
})

check('nextSweepLabel says "due now" when the schedule has passed — never a false "next 1m"', () => {
  const now = 1_700_000_000_000
  assert.equal(nextSweepLabel(null, now), null)
  assert.equal(nextSweepLabel(undefined, now), null)
  // The regression: a retained snapshot after a failed poll leaves nextSweepAt in the PAST. The old inline
  // code did fmtMinutes(Math.max(0, delta)) — fmtMinutes(0) floors to '1m', so the chip claimed "next 1m"
  // forever. nextSweepLabel must instead report the sweep as overdue.
  assert.equal(nextSweepLabel(now - 60_000, now), 'due now')      // 1 min overdue
  assert.equal(nextSweepLabel(now, now), 'due now')               // exactly due
  assert.equal(nextSweepLabel(now + 12 * 60_000, now), 'next 12m') // short cadence — the sub-hour case
  assert.equal(nextSweepLabel(now + 12 * 3_600_000, now), 'next 12h')
  assert.equal(nextSweepLabel(new Date(now + 3 * 24 * 3_600_000).toISOString(), now), 'next 3d') // ISO input, as the store sends
})

// Guard: the pre-fix inline expression this replaced would return '1m' for an overdue delta. Prove that is
// what we moved away from, so a future refactor that reverts to fmtMinutes-on-a-clamped-delta fails here.
check('the OLD overdue behaviour (fmtMinutes of a clamped delta) was the "1m" bug we removed', () => {
  const overdueMins = -5           // schedule 5 minutes in the past
  assert.equal(fmtMinutes(Math.max(0, overdueMins)), '1m')   // reproduces the old, wrong result
})

// ── the effective call: resolveVerdict / verdictIsCapped / resolveConfidence ───────────────────────
// Every cockpit surface (DecisionBanner, CommandBar, CoreOrb, the store's report title) resolves the call
// through these. They must show the run's OWN red-team cap, not the synthesizer's original — a GOLD
// dossier whose pre_mortem.json read "Does not survive — downgrade" (Trim, 40) kept rendering Hold / 52
// live, because the cap lands in `post_mortem_<verdict field>` and nothing on the client read it.

check('research: post_mortem_decision is the displayed call, and it is flagged as capped', () => {
  const rec = { decision: 'Strong Buy', post_mortem_decision: 'Watchlist', confidence_score: 65, post_review_confidence_score: 49 }
  assert.equal(resolveVerdict(rec), 'Watchlist')
  assert.equal(verdictIsCapped(rec), true)
  assert.equal(resolveVerdictOriginal(rec), 'Strong Buy')
  assert.deepEqual(resolveConfidence(rec), { value: 49, isPostReview: true })
})

check('commodity: the cap is read off the swarm\'s OWN verdict field (Action -> post_mortem_action)', () => {
  const rec = { action: 'Hold', confidence: 52, post_mortem_action: 'Trim', post_review_confidence_score: 40 }
  assert.equal(resolveVerdict(rec, 'Action'), 'Trim')       // SWARM.md capitalizes it
  assert.equal(resolveVerdict(rec, 'action'), 'Trim')       // the record key is lowercase
  assert.equal(verdictIsCapped(rec, 'Action'), true)
  assert.equal(resolveVerdictOriginal(rec, 'Action'), 'Hold')
  assert.deepEqual(resolveConfidence(rec), { value: 40, isPostReview: true })
})

check('an un-red-teamed record shows its own call and raises no CAPPED badge', () => {
  const rec = { action: 'Hold', confidence: 52 }
  assert.equal(resolveVerdict(rec, 'Action'), 'Hold')
  assert.equal(verdictIsCapped(rec, 'Action'), false)
  assert.deepEqual(resolveConfidence(rec), { value: 52, isPostReview: false })
})

// The badge must track the value actually SHOWN. A blank or equal cap displays the original, so flagging
// it would put a CAPPED badge on a call nothing downgraded (the F28b false positive).
check('a blank or unchanged cap displays the original and is NOT flagged', () => {
  assert.equal(resolveVerdict({ action: 'Hold', post_mortem_action: '' }, 'Action'), 'Hold')
  assert.equal(verdictIsCapped({ action: 'Hold', post_mortem_action: '' }, 'Action'), false)
  assert.equal(verdictIsCapped({ action: 'Avoid', post_mortem_action: 'Avoid' }, 'Action'), false)
})

// Deploy-skew rule: a new client against an older engine gets no verdictField. It must fall back to the
// research shape and resolve nothing rather than guessing another swarm's key.
check('no verdictField -> fails closed to the research shape, never guesses `action`', () => {
  const rec = { action: 'Hold', post_mortem_action: 'Trim', confidence: 52 }
  assert.equal(resolveVerdict(rec), null)
  assert.equal(verdictIsCapped(rec), false)
  assert.equal(resolveConfidence(rec).value, 52) // confidence is shape-agnostic, so it still reads
})

check('resolveVerdict is null-safe on an absent/empty record (the pre-decision banner state)', () => {
  assert.equal(resolveVerdict(null, 'Action'), null)
  assert.equal(resolveVerdict(undefined), null)
  assert.equal(verdictIsCapped(null, 'Action'), false)
  assert.deepEqual(resolveConfidence(null), { value: null, isPostReview: false })
})

// Caller-side floor: a `return` or throw above any group would silently skip it (same guard the other
// suites use). Bump deliberately when adding a check — never leave it stale-low.
const EXPECTED_CHECKS = 13
assert.ok(passed >= EXPECTED_CHECKS,
  `only ${passed} checks ran, expected at least ${EXPECTED_CHECKS} — something above here is short-circuiting`)
console.log(`format.test.ts: ${passed} checks passed`)
