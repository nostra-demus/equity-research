# Novelty & Context — SIG-20260711-b55e8917

## 1. Step 4 — Ledger Retrieval

Window searched: 2026-07-09T00:00:00Z to 2026-07-11T15:16:27Z (72-hour window); widened to 2026-07-04T00:00:00Z (7-day window) for issuer-exact slow-story check. Issuers searched: Carvana Co. (primary); Stellantis N.V., Ally Financial Inc., AutoNation Inc. (secondary).

Grep executed against `screener/ledger/events.ndjson` for patterns: `Carvana|CVNA|carvana` → 0 matches. `Stellantis|Ally Financial|AutoNation` → 0 matches. Total ledger records inspected: 14 (all issuers differ).

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty / no matches — new_event path | — | — | — | — | — |

No prior event matches any primary or secondary issuer from this signal within 72 hours or 7 days. New_event path applies.

## 2. Step 5 — Fact Delta (vs best match: none)

No prior event to compare against. All extraction fields are first-seen.

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | — | n/a (no guidance figure cited) | n/a |
| deal_value | — | $171 million (7 Stellantis dealerships acquired) | n/a (first seen) |
| fine_amount | — | n/a | n/a |
| eps | — | n/a | n/a |
| revenue | — | n/a | n/a |
| counterparty | — | Stellantis N.V. (seller); Ally Financial Inc. (financing) | n/a (first seen) |
| court | — | n/a | n/a |
| regulator | — | n/a | n/a |

**fact_delta** = (changed_fields × 0.15) + (confirmation 0.35) + (better source 0.10) = 0 × 0.15 + 0 + 0 = **0.00** (no prior record; delta cannot be computed — treated as 0.00 per new_event convention)

## 3. Step 6 — Confirmation Upgrade

- Prior official? — No prior record exists.
- Current official? — No; source is The Motley Fool (Grade B, Tier 3 opinion piece).
- Issuer overlap? — Not applicable (no prior record).
- Event-or-similarity condition? — Not applicable.
- **confirmation_upgrade:** false

## 4. Step 7 — Pairwise Classification

- Similarity point estimate: 0.00 (no ledger match found for any issuer; falls below the 0.78 threshold).
- Branch fired: `ELSE: new_event` — the final branch of the deterministic matrix: "ELSE: new_event" (similarity < 0.78, no issuer overlap with any ledger record).
- **pair_label:** new_event

## 5. Step 8 — Novelty

**novelty** = base(new_event) 0.85 + 0.50 × 0.00 (fact_delta) + 0.00 (no confirmation upgrade) = **0.85**

Arithmetic check: 0.85 + 0.00 + 0.00 = 0.85. Clamped to [0, 1]: 0.85. Confirmed.

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
