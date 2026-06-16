# Signal Gate Synthesis — SIG-20260616-eae0b41e

## Abstract

Norben Tea & Exports Limited filed a document with the BSE and NSE exchanges on 16 June 2026. The body of the filing could not be retrieved, but all available evidence — the filename, the exchange category, and company data from Screener.in — points to a routine notice for its 36th Annual General Meeting, scheduled for 3 July 2026. The filing sets a shareholder-meeting date; it does not announce anything that would change revenue, earnings, or the financial risk picture for this micro-cap tea company (roughly ₹116 crore market cap, FY2026 sales of ₹8 crore). Materiality scores at 36 out of 100. The signal routes to LOG.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | Grade A — BSE / NSE Exchange Filing (primary exchange disclosure) |
| Relevance | relevant_non_material (0.78 confidence) |
| Event types | management |
| Linkage | primary_issuer |
| Similarity / pair | similarity 0.00, no ledger match → new_event |
| Fact delta | 0.00 (no prior event; all extraction fields null-to-null) |
| Confirmation upgrade | false |
| Novelty | 0.85 |

## 2. Step 9 — Canonical Handling

- Best prior match: none — EVT-74fc26154504 has no counterpart in the ledger across any issuer, ticker, or URL
- Priority comparison: no comparison needed; there is no competing record to rank
- **action:** keep_separate

## 3. Step 10 — Materiality

Base 28 (relevant_non_material, routine AGM notice for a ~₹116 crore micro-cap with no analyst coverage, no material resolution identified) + novelty 8 (0.85 × 10, capped at 10 for non-material events) − penalties 0 (new_event, no prior ledger match) + overrides 0 (exchange filing but not an enforcement, default, or capital-structure action) = **36/100**

## 4. Decision

This signal routes LOG. The one most important fact: the underlying filing is almost certainly a routine AGM notice — the lowest-impact category of mandatory corporate disclosure — for a company too small and illiquid to carry active analyst coverage, and no agenda item has been identified that would change a buy or sell decision.

## Machine Output

Wrote: `screener/runs/SIG-20260616-eae0b41e/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260616-eae0b41e to screener/ledger/events.ndjson; board index refreshed.

## Routing

Routing: LOG
Materiality: 36
Next module: none
