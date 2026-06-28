# Novelty & Context — SIG-20260628-af776402

## 1. Step 4 — Ledger Retrieval

Window searched: 2026-06-26T12:36Z to 2026-06-28T12:36Z (48-hour primary; widened to 7-day slow-story check: 2026-06-21 to 2026-06-28). Issuers searched: Ramelius Resources (primary), Forrestania (secondary). Ledger grepped for "ramelius", "forrestania", "edna may", "RMS" — 0 matches across all three terms. Ledger contains 14 entries total (confirmed by full read of events.ndjson). Match count: 0.

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty / no matches — new_event path | — | — | — | — | 0.00 |

## 2. Step 5 — Fact Delta (vs best match: none)

No prior event in the ledger. All extraction fields default to "not present" in the prior record.

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | — | none disclosed | No |
| deal_value | — | A$300 million | No (no prior) |
| fine_amount | — | none | No |
| eps | — | none disclosed | No |
| revenue | — | none disclosed | No |
| counterparty | — | Forrestania (buyer) | No (no prior) |
| court | — | none | No |
| regulator | — | none | No |

With no prior event, there is no changed field and no confirmation upgrade applies.

**fact_delta** = (0 changed fields × 0.15) + (confirmation 0.00) + (better source 0.00) = **0.00** (capped at 1.0)

## 3. Step 6 — Confirmation Upgrade

- Prior official? No prior record exists.
- Current official? No — Australian Financial Review is a Grade A newswire, not a company or regulatory filing.
- Issuer overlap? Not applicable — no prior event.
- Event-or-similarity condition? Not applicable.
- **confirmation_upgrade:** false

## 4. Step 7 — Pairwise Classification

- Branch fired: `ELSE: new_event` — similarity is 0.00, which is below 0.78, so the matrix bottom branch fires: `ELSE: new_event`
- **pair_label:** new_event

## 5. Step 8 — Novelty

**novelty** = base(new_event) 0.85 + 0.50 × 0.00 (fact_delta) + 0.00 (no confirmation upgrade) = **0.85**

Arithmetic: 0.85 + 0.00 + 0.00 = 0.85. Clamp [0, 1]: 0.85 (no clamping needed).

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
