# Novelty & Context — SIG-20260616-eae0b41e

## 1. Step 4 — Ledger Retrieval

Window searched: last 72 hours back from 2026-06-16T11:23:51Z (i.e., from 2026-06-13T11:23:51Z). Widened issuer scan to 7 days for completeness given the slow-moving / routine nature of AGM filings. Issuers searched: Norben Tea & Exports Limited, NORBTEAEXP, BSE 519528.

Grep result: 0 matches across all 9 ledger entries in `screener/ledger/events.ndjson`. The ledger contains entries for: RBI rate cut (SIG-20260610), Gulf LNG force majeure (SIG-20260612), Intel analyst upgrade (SIG-20260613), Honeywell spin-off (SIG-20260615), TCS litigation charge (SIG-20260616). None share any issuer overlap, ticker, or storyline with Norben Tea & Exports Limited.

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty / no matches — new_event path | | | | | |

## 2. Step 5 — Fact Delta (vs best match: none)

No prior event exists to compare against. All extraction fields are assessed against a null prior.

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | n/a | n/a | No |
| deal_value | n/a | n/a | No |
| fine_amount | n/a | n/a | No |
| eps | n/a | n/a | No |
| revenue | n/a | n/a | No |
| counterparty | n/a | n/a | No |
| court | n/a | n/a | No |
| regulator | n/a | n/a | No |

**fact_delta** = (0 changed fields × 0.15) + (no confirmation 0.00) + (no better source 0.00) = **0.00** (capped at 1.0)

No prior event means no field can be "changed" in the delta sense. The fact_delta is 0.00 by definition on a first-seen event.

## 3. Step 6 — Confirmation Upgrade

- Prior official? No prior event exists.
- Current official? Yes — BSE/NSE Exchange Filing, Grade A source.
- Issuer overlap? Not applicable (no prior).
- Event-or-similarity condition? Not applicable (no prior).
- **confirmation_upgrade:** false

## 4. Step 7 — Pairwise Classification

Similarity point estimate: 0.00 (no ledger match found; issuer, ticker, and URL all absent from ledger).

Matrix evaluation (top-down, per MODULE_RULES.md):

- `IF confirmation_upgrade AND fact_delta >= 0.30` → false (no confirmation_upgrade). Skip.
- `ELSE IF similarity >= 0.965` → false (0.00 < 0.965). Skip.
- `ELSE IF similarity >= 0.93` → false (0.00 < 0.93). Skip.
- `ELSE IF similarity >= 0.86` → false (0.00 < 0.86). Skip.
- `ELSE IF similarity >= 0.78` → false (0.00 < 0.78). Skip.
- `ELSE:` → **new_event**

- Branch fired: `ELSE: new_event`
- **pair_label:** new_event

## 5. Step 8 — Novelty

Base for new_event = 0.85. fact_delta = 0.00. confirmation_upgrade = false (no +0.20).

**novelty** = base(new_event) 0.85 + 0.50 × 0.00 + 0.00 = **0.85**

Clamp check: 0.85 is within [0, 1]. No clamp needed.

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
