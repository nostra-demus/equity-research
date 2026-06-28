# Novelty & Context — SIG-20260628-2c8cfc21

## 1. Step 4 — Ledger Retrieval

Window searched: 2026-06-25T15:12:09Z to 2026-06-28T15:12:09Z (72-hour window ending at signal input_datetime). Slow-story widening to 7 days also checked (2026-06-21T15:12:09Z). Issuers searched: "Modern Innovative Digital Technology Company Limited", "HKEX: 2322", "Modern Inno DT", "2322".

Grep command executed against `screener/ledger/events.ndjson` (10 entries total): patterns `Modern Inno`, `MODERN INNO`, `2322`, `HKEx`, `Hong Kong`, `profit warning`, `credit loss` — **0 matches**. No prior entries share any primary or secondary issuer, no matching storyline or headline found in any of the 10 ledger records.

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty / no matches — new_event path | — | — | — | — | 0.00 |

Self-check: grep executed, match count = 0 confirmed. The 10-entry ledger spans RBI rate policy, Gulf LNG force majeure, Intel analyst call, Honeywell spin-off, TCS litigation charge, Norben Tea AGM, MGM insider buying, Jio IPO, and Ramelius/Forrestania M&A — none share any issuer or storyline with Modern Innovative Digital Technology (HKEX: 2322).

## 2. Step 5 — Fact Delta (vs best match: none)

No prior event exists in the ledger. All extraction fields are evaluated as first-seen against no prior.

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | n/a | Net loss HK$220M–HK$260M for FY ended 31 March 2026 | — (first appearance) |
| deal_value | n/a | None | — |
| fine_amount | n/a | None | — |
| eps | n/a | Not quantified in filing | — |
| revenue | n/a | Not quantified in filing | — |
| counterparty | n/a | None named | — |
| court | n/a | None | — |
| regulator | n/a | HKEX (Listing Rule 13.09 disclosure obligation) | — (first appearance) |

No prior event to compare against — all fields are new, none are changed fields in the fact-delta sense (the formula requires a prior value to measure a change against).

**fact_delta** = (changed_fields × 0.15) + (confirmation 0.35) + (better source 0.10) = 0 × 0.15 + 0 + 0 = **0.00** (no prior event; no changed fields, no confirmation, no source comparison possible; capped at 1.0)

## 3. Step 6 — Confirmation Upgrade

- Prior official? No prior event exists.
- Current official? Yes — HKEXnews exchange filing, Grade A (official primary filing under HKEX Listing Rule 13.09).
- Issuer overlap? Not applicable — no prior event.
- Event-or-similarity condition? Not applicable.
- **confirmation_upgrade:** false (all four conditions require a prior record; none exists)

## 4. Step 7 — Pairwise Classification

Similarity = 0.00 (no ledger match found; no issuer overlap, no storyline overlap). Walking the matrix top-down:

- `IF confirmation_upgrade AND fact_delta >= 0.30` — false (confirmation_upgrade = false). Skip.
- `ELSE IF similarity >= 0.965` — false (0.00 < 0.965). Skip.
- `ELSE IF similarity >= 0.93` — false (0.00 < 0.93). Skip.
- `ELSE IF similarity >= 0.86` — false (0.00 < 0.86). Skip.
- `ELSE IF similarity >= 0.78` — false (0.00 < 0.78). Skip.
- `ELSE:` — **new_event**

Branch fired: `ELSE: new_event` (the final catch-all branch, triggered because similarity = 0.00, which is below every threshold including 0.78).

- **pair_label:** new_event

## 5. Step 8 — Novelty

Base by pair label: new_event → 0.85
fact_delta: 0.00
confirmation_upgrade: false → +0.00

**novelty** = base(new_event) 0.85 + 0.50 × 0.00 + 0.00 = **0.85**

Arithmetic: 0.85 + 0.00 + 0.00 = 0.85. Clamped to [0, 1] → 0.85.

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
