// The /api/quote client-vs-server timeout invariant (Codex P2). The client abort budget MUST outlast the
// server's worst-case CNBC window, or a slow-but-succeeding fetch aborts client-side and refreshLiveQuote
// then suppresses the next attempt for 60s — the quote never lands even though the server would answer.
// Run: npx tsx src/lib/quoteTimeout.test.ts
import assert from 'node:assert/strict'
import { QUOTE_CLIENT_TIMEOUT_MS, QUOTE_SERVER_WORST_CASE_MS } from './quoteTimeout'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('the server worst case reflects 2 CNBC attempts at the 10s default + one 500ms wait', () => {
  // Pins the documented budget to the ui/server config default (quoteTimeoutMs) and fetchCnbcRows retry.
  assert.equal(QUOTE_SERVER_WORST_CASE_MS, 20_500)
})

check('the client abort budget OUTLASTS the server worst case (the old 8s aborted a succeeding fetch)', () => {
  assert.ok(
    QUOTE_CLIENT_TIMEOUT_MS > QUOTE_SERVER_WORST_CASE_MS,
    `client ${QUOTE_CLIENT_TIMEOUT_MS}ms must exceed server worst case ${QUOTE_SERVER_WORST_CASE_MS}ms`,
  )
})

console.log(`\nquoteTimeout.test.ts: ${passed} passed`)
