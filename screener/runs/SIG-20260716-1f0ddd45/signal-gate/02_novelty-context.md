# Novelty & Context — SIG-20260716-1f0ddd45

## 1. Step 4 — Ledger Retrieval

Window searched: last 72 hours, widened to 7 days because the underlying storyline (US–Iran conflict, active since 2026-02-28, truce signed June 2026, escalation resumed the week of 2026-07-15) is slow-moving and state-actor-driven, not a single-company news cycle. Issuers searched: Iran, Islamic Revolutionary Guard Corps (IRGC), United States (military/government), Bahrain, Kuwait, Jordan, plus chokepoint/geography terms (Strait of Hormuz, Bab el-Mandeb, Red Sea, seaway, blockade, Middle East).

Command run: `grep -iE "iran|hormuz|irgc|blockade|bab el-mandeb|seaway|red sea|middle east" screener/ledger/events.ndjson` — **0 matches** out of 15 total ledger lines (checked separately with `wc -l`).

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty of any match / no matches — new_event path | — | — | — | — | — |

No prior ledger entry names Iran, the IRGC, the Strait of Hormuz, Bab el-Mandeb, or any of the secondary issuers (US military, Bahrain, Kuwait, Jordan). The 15-line ledger's existing entries cover unrelated stories (RBI rate cut, Gulf LNG force majeure, Intel upgrade, Honeywell spin-off, TCS litigation, Norben Tea AGM, MGM rumor, Jio IPO, Ramelius/Forrestania M&A, Modern Inno profit warning, Ascension/Williamson Health M&A, Carvana). No same-issuer or same-storyline candidate exists to compare against.

## 2. Step 5 — Fact Delta (vs best match: none)

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | n/a — no prior event | not applicable to this story | No prior to compare |
| deal_value | n/a | not applicable | No prior to compare |
| fine_amount | n/a | not applicable | No prior to compare |
| eps | n/a | not applicable | No prior to compare |
| revenue | n/a | not applicable | No prior to compare |
| counterparty | n/a | Iran/IRGC vs US; Bahrain, Kuwait, Jordan named as struck sites | No prior to compare |
| court | n/a | not applicable | No prior to compare |
| regulator | n/a | not applicable | No prior to compare |

**fact_delta** = (0 changed_fields × 0.15) + (0 confirmation × 0.35) + (0 better source × 0.10) = **0.00** (capped at 1.0)

There is no prior ledger record to diff against, so every field is scored "no prior to compare" rather than "unchanged" — this is the ledger-empty case the Step 4 rubric anticipates, not a same-story confirmation.

## 3. Step 6 — Confirmation Upgrade

- Prior official? Not applicable — no prior ledger record exists for this issuer/storyline.
- Current official? No — South China Morning Post is Tier-1/Grade-A press reporting, not an official government or IRGC statement transcript; it is a news account of IRGC and US statements.
- Issuer overlap? Not applicable — no prior record to overlap with.
- Event-or-similarity condition? Not applicable — similarity is 0.00 (no prior).
- **confirmation_upgrade:** false

## 4. Step 7 — Pairwise Classification

- Branch fired (evaluated top-down against the deterministic matrix): the first four branches (`confirmation_upgrade AND fact_delta >= 0.30`, `similarity >= 0.965`, `similarity >= 0.93`, `similarity >= 0.86`, `similarity >= 0.78`) all require a similarity score that only exists relative to a prior match; with similarity 0.00 (no prior record found), the matrix falls through to: `ELSE: new_event`
- **pair_label:** new_event

## 5. Step 8 — Novelty

**novelty** = base(new_event) 0.85 + 0.50 × fact_delta(0.00) + 0.20 if confirmation(false → 0) = 0.85 + 0.00 + 0.00 = **0.85**

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
