// Timeouts for the /api/quote client fetch. Kept in a tiny pure module (no import.meta.env) so the
// invariant below is unit-testable — api.ts pulls in import.meta.env and cannot be imported by the tsx
// test runner.
//
// The server's /api/quote budget: ui/server `fetchCnbcRows` makes up to 2 attempts of NEWS_QUOTE_TIMEOUT_MS
// (config default 10_000ms) with a 500ms wait between them, so the worst case is ~2×10s + 0.5s = 20.5s.
// The client MUST outlast that window. A client timeout below it aborts a slow-but-succeeding request,
// and refreshLiveQuote then suppresses the next attempt for 60s (Codex P2) — a self-inflicted outage where
// the quote never lands even though the server would have answered. QUOTE_CLIENT_TIMEOUT_MS is kept above
// the worst case with headroom for the HTTP round trip; an operator who raises NEWS_QUOTE_TIMEOUT_MS beyond
// the default must raise it here too (quoteTimeout.test.ts pins client > server-worst-case).

/** The server's worst-case /api/quote window at the config DEFAULT quote timeout: 2 attempts × 10s + 500ms. */
export const QUOTE_SERVER_WORST_CASE_MS = 2 * 10_000 + 500

/** The client abort budget for /api/quote — deliberately above the server's worst case (see above). */
export const QUOTE_CLIENT_TIMEOUT_MS = 24_000
