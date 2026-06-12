# Novelty & Context — SIG-20260612-dd716589

## 1. Step 4 — Ledger Retrieval

Window searched: 2026-06-09T13:39:48Z to 2026-06-12T13:39:48Z (72-hour window); widened to 7-day scan (2026-06-05 to 2026-06-12) as a secondary check given the slow-moving nature of LNG supply disruption stories. Issuers searched: "Gulf LNG producer" (unnamed), LNG force majeure, compressor failure, Gulf energy producers (all variants). Ledger grep commands run: pattern `lng|LNG|force.majeure|gulf|Gulf|compressor|cargo` → 0 matches; pattern `energy|Energy|commodity|supply|producer` → 0 matches. The ledger contains exactly 2 entries, both for SIG-20260610-a3f2c81d (RBI repo rate cut — unrelated issuer, unrelated event type).

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty / no matches — new_event path | — | — | — | — | 0.00 |

No prior event in the ledger shares any issuer, topic, or storyline with this signal. The 2 ledger entries (both: RBI monetary-policy cut) are macro/regulatory Indian central-bank events with zero overlap to a Gulf LNG supply disruption. The new_event path applies.

## 2. Step 5 — Fact Delta (vs best match: none)

No prior event exists for comparison. All extraction fields are assessed against a null baseline.

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | n/a (no prior) | not present in headline | No |
| deal_value | n/a (no prior) | not present | No |
| fine_amount | n/a (no prior) | not present | No |
| eps | n/a (no prior) | not present | No |
| revenue | n/a (no prior) | not present | No |
| counterparty | n/a (no prior) | not present | No |
| court | n/a (no prior) | not present | No |
| regulator | n/a (no prior) | not present | No |

**fact_delta** = (0 changed fields × 0.15) + (no confirmation upgrade: 0.00) + (no better source: 0.00) = **0.00** (capped at 1.0)

Note: with no prior event in the ledger, there is no delta to compute. fact_delta is 0.00 by definition on the new_event path.

## 3. Step 6 — Confirmation Upgrade

- Prior official? — No prior event exists.
- Current official? — Reuters (Grade A newswire); the underlying event is a corporate force majeure declaration, which is typically an official producer notification but arrives here via a newswire report, not a direct company filing.
- Issuer overlap? — No prior event to overlap with.
- Event-or-similarity condition? — Not applicable.
- **confirmation_upgrade: false** (no prior non-official record to upgrade).

## 4. Step 7 — Pairwise Classification

Evaluating the deterministic matrix top-down:

1. `IF confirmation_upgrade AND fact_delta >= 0.30` — confirmation_upgrade is false. Branch does not fire.
2. `ELSE IF similarity >= 0.965` — similarity is 0.00 (no matching prior event). Branch does not fire.
3. `ELSE IF similarity >= 0.93` — 0.00 < 0.93. Branch does not fire.
4. `ELSE IF similarity >= 0.86` — 0.00 < 0.86. Branch does not fire.
5. `ELSE IF similarity >= 0.78` — 0.00 < 0.78. Branch does not fire.
6. `ELSE: new_event` — **this branch fires.**

- Branch fired: `ELSE: new_event` (similarity 0.00, below the 0.78 floor; no prior issuer match in ledger)
- **pair_label: new_event**

## 5. Step 8 — Novelty

Base by pair label (new_event): **0.85**
fact_delta contribution: 0.50 × 0.00 = **0.00**
confirmation_upgrade contribution: **0.00** (false)

**novelty** = base(new_event) 0.85 + 0.50 × 0.00 + 0.00 = **0.85**

Clamp check: 0.85 is within [0, 1]. No clamping required.

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
