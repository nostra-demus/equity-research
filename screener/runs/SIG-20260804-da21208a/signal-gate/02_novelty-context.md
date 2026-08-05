# Novelty & Context — SIG-20260804-da21208a

## 1. Step 4 — Ledger Retrieval

Window searched: last 48–72 hours relative to the signal's input datetime (2026-08-04T08:52:40Z) — i.e. roughly 2026-08-01 through 2026-08-04; widened to the full 7-day lookback (2026-07-28 through 2026-08-04) and, as a final check, the entire ledger, since the issuer had zero prior hits at any window. Issuers searched: "Grab", "Grab Holdings", plus ride-hailing/delivery peers that could plausibly share a storyline ("Gojek", "GoTo", "Sea Limited", "Uber", "Didi", "ride-hailing").

Commands run and match counts:
- `wc -l screener/ledger/events.ndjson` → 17 lines total (whole ledger, all dates).
- `grep -ic "grab" screener/ledger/events.ndjson` → **0 matches**.
- `grep -iE "grab holdings|gojek|goto|sea limited|uber|didi|ride-hailing|ride hailing" screener/ledger/events.ndjson` → **0 matches**.
- Cross-checked against the intake-gate0 report's own dedup grep (Step 3 of `00_intake-gate0.md`): "grab" case-insensitive across the whole ledger → 0 hits, consistent with the above.
- The most recent ledger entry by date-in-signal-id is `SIG-20260716-070c5069` (2026-07-16) — the entire ledger, not just the 48–72h window, predates this signal by at least 19 days, so there is no possibility of a same-window issuer match being missed by a narrow date filter.

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| — | — | Ledger empty of any Grab / ride-hailing-peer match — new_event path | none | < 0.78 (new) | 0.00 |

## 2. Step 5 — Fact Delta (vs best match: none)

No prior event exists to diff against, so every extraction field is compared to nothing (all "new," not "changed").

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | (no prior record) | FY26 revenue $4.10–$4.15bn (from $4.04–$4.10bn); FY26 adj. EBITDA $720–$740m (from $700–$720m) [Reuters, 2026-08-03] | N/A — no prior to compare |
| deal_value | (no prior record) | Not applicable to this event | N/A |
| fine_amount | (no prior record) | Not applicable | N/A |
| eps | (no prior record) | Not disclosed in source text | N/A |
| revenue | (no prior record) | Q2 2026 revenue $997m (+22% YoY), beat $990.8m estimate [Reuters, 2026-08-03] | N/A |
| counterparty | (no prior record) | None named | N/A |
| court | (no prior record) | Not applicable | N/A |
| regulator | (no prior record) | Not applicable | N/A |

**fact_delta** = (0 changed_fields × 0.15) + (0 confirmation × 0.35) + (0 better-source × 0.10) = **0.00** (capped at 1.0) — no prior record exists to score a delta against; per Step 4, an empty ledger match takes the `new_event` path directly.

## 3. Step 6 — Confirmation Upgrade

- Prior official? — N/A, no prior record exists.
- Current official? — Yes, Reuters (Tier 1 / Grade A).
- Issuer overlap? — N/A, no prior record.
- Event-or-similarity condition? — N/A, no prior record.
- **confirmation_upgrade:** false (the condition requires a prior non-official record to upgrade from; none exists).

## 4. Step 7 — Pairwise Classification

- Branch fired (matrix, evaluated top-down): all similarity-gated branches (`confirmation_upgrade AND fact_delta >= 0.30`, `similarity >= 0.965`, `similarity >= 0.93`, `similarity >= 0.86`, `similarity >= 0.78`) require a similarity value ≥ 0.78 against a prior event. With zero ledger matches, similarity = 0.00, so the matrix falls through to the final line: `ELSE: new_event`.
- **pair_label:** new_event

## 5. Step 8 — Novelty

**novelty** = base(new_event) 0.85 + 0.50 × 0.00 (fact_delta) + 0.00 (no confirmation upgrade) = **0.85**

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
