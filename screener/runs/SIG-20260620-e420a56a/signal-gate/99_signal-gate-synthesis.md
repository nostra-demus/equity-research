# Signal Gate Synthesis — SIG-20260620-e420a56a

## Abstract

Jio Platforms Limited filed its Draft Red Herring Prospectus (DRHP) with SEBI on 20 June 2026 for a fresh share issue targeting roughly Rs 37,700 crore — potentially India's largest-ever IPO — with the entire net proceeds earmarked for paying down existing debt (~Rs 27,500 crore). This is the first appearance of this event in the ledger, making it a genuinely new development with a novelty score of 0.85. The materiality score is 90 out of 100. The signal routes PROMOTE and moves directly to thesis-structure.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | Grade B, Outlook Business |
| Relevance | material (0.97) |
| Event types | capital_actions, debt_credit, regulatory, product |
| Linkage | primary_issuer |
| Similarity / pair | 0.00 → new_event |
| Fact delta | 0.00 (no prior event to compare; all fields first appearance) |
| Confirmation upgrade | false |
| Novelty | 0.85 |

## 2. Step 9 — Canonical Handling

- Best prior match: none — zero ledger entries for Jio Platforms or Reliance Industries across a 7-day look-back
- Priority comparison: no competing record exists on any criterion (official, source tier, fact richness, timestamp)
- **action:** keep_separate

## 3. Step 10 — Materiality

Base 72 (major SEBI regulatory capital event, direct primary issuer, India-wide scope, Grade B source moderates from a 75 that Grade A would warrant) + novelty 13 (0.85 × 15, new_event band) − penalties 0 (new_event, no duplicate or repeat penalty) + override 5 (DRHP is an official SEBI regulatory submission, not just press coverage) = **90/100**

## 4. Decision

Jio Platforms' DRHP filing is a first-seen, primary-issuer event that directly changes the company's capital structure — an Rs 37,700 crore equity raise directed entirely at debt repayment is a concrete, verifiable financial event, not a rumor or increment to an existing story. A materiality score of 90 sits well above the 70-point threshold, and the signal routes PROMOTE to thesis-structure.

## Machine Output

Wrote: `screener/runs/SIG-20260620-e420a56a/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260620-e420a56a to screener/ledger/events.ndjson; board index refreshed.

## Routing

Routing: PROMOTE
Materiality: 90
Next module: thesis-structure
