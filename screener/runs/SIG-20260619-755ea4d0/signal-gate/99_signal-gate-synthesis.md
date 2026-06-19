# Signal Gate Synthesis — SIG-20260619-755ea4d0

## Abstract

A human prompt asserts that Barry Diller and other MGM Resorts International insiders have been buying MGM shares and that Diller proposed an all-cash acquisition at a premium — alongside MGM's known Osaka, Japan integrated-resort project targeting a 2030 opening as a long-term revenue catalyst. The deal and insider-buying claims are unverified rumors: no on-list source was found at the M0.1 check. The Osaka project is real but has been public since 2019–2021 and is not a new development. With novelty at 0.85 (first time this signal has appeared in the ledger) but relevance rated non-material at low confidence (0.30), the signal scores 45 out of 100 and routes to PARK for human review.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | Grade B (human prompt pass; no on-list source found for material claims at M0.1) |
| Relevance | relevant_non_material (0.30) |
| Event types | mna, management, commercial, rumor |
| Linkage | primary_issuer |
| Similarity / pair | 0.00 (no prior ledger match) → new_event |
| Fact delta | 0.00 (no changed fields; no prior event to compare) |
| Confirmation upgrade | false |
| Novelty | 0.85 |

## 2. Step 9 — Canonical Handling

- Best prior match: none — the ledger contains zero entries for MGM Resorts International across the full search window (48h primary, 7-day extension, full ledger scan).
- Priority comparison: no prior event exists, so no priority ordering applies. The signal enters the ledger as a new, independent record.
- **action:** keep_separate

## 3. Step 10 — Materiality

Base 32 (relevant_non_material, confidence 0.30, no on-list source for the M&A and insider-buying claims, one real but long-dated stale commercial catalyst, primary_issuer scope) + novelty 13 (0.85 × 15) − penalties 0 (new_event, no duplicate or overlap penalties) + overrides 0 (no official filing, no enforcement action, no confirmation upgrade) = **45/100**

## 4. Decision

The signal parks because the only item that could justify a PROMOTE — a confirmed all-cash deal proposal by a named insider — has no on-list source backing it, and the remaining real event (MGM's Osaka integrated-resort project) has been publicly known for years. The single most decision-relevant fact is this: if an on-list source confirms that Barry Diller proposed or is pursuing an all-cash acquisition of MGM shares or the company, this signal should be re-submitted immediately as it would score above 70 and warrant full Phase 1 thesis work.

## Machine Output

Wrote: `screener/runs/SIG-20260619-755ea4d0/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260619-755ea4d0 to screener/ledger/events.ndjson; board index refreshed.

## Routing

Routing: PARK
Materiality: 45
Next module: none
