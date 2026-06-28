# Signal Gate Synthesis — SIG-20260628-2c8cfc21

## Abstract

Modern Innovative Digital Technology Company Limited (HKEX: 2322) filed a profit warning directly on the Hong Kong Stock Exchange on 26 June 2026, disclosing that its net loss for the year ended 31 March 2026 is expected to land between HK$220M and HK$260M — roughly 148 to 193 percent worse than the HK$88.9M loss posted the prior year. The cause is a sharp rise in credit loss provisions on receivables from its trading and money-lending clients, driven by China's property-sector contraction and weak domestic demand. This is the first appearance of this issuer and event in the ledger, giving it a high novelty score of 0.85. Materiality scores at 77, which sends it to the thesis pipeline for further work.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | Grade A, HKEXnews (HK Exchange Filing) — official primary exchange disclosure |
| Relevance | material (0.97) |
| Event types | earnings_revenue_margin, debt_credit, macro_sector |
| Linkage | primary_issuer |
| Similarity / pair | 0.00 → new_event |
| Fact delta | 0.00 (no prior event; all fields are first-seen) |
| Confirmation upgrade | false (no prior record to upgrade) |
| Novelty | 0.85 |

## 2. Step 9 — Canonical Handling

- Best prior match: none — the 10-entry ledger contains no entry for Modern Innovative Digital Technology (HKEX: 2322) or any overlapping issuer, headline, or storyline
- Priority comparison: no competing canonical record exists, so no priority ordering is needed; the signal stands alone
- **action:** keep_separate

## 3. Step 10 — Materiality

Base 55 (material, official exchange filing, primary issuer, company-specific scope, small HK-listed cap with limited investable universe reach) + novelty 17 (0.85 × 20) − penalties 0 (new_event, no duplicate or same_event flags) + override 5 (Grade A official HKEX filing under Listing Rule 13.09) = **77/100**

## 4. Decision

The signal routes to PROMOTE. The single most important fact is the scale of the loss deterioration: a 148–193% worsening in net loss year-on-year, disclosed under a mandatory exchange filing rule, with the specific mechanism (credit loss provisions on China-exposed money-lending receivables) stated in the filing. That is a first-seen, high-quality primary disclosure for a direct issuer with no prior ledger entry, and it clears the 70-point threshold comfortably.

## Machine Output

Wrote: `screener/runs/SIG-20260628-2c8cfc21/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260628-2c8cfc21 to screener/ledger/events.ndjson; board index refreshed.

## Routing

Routing: PROMOTE
Materiality: 77
Next module: thesis-structure
