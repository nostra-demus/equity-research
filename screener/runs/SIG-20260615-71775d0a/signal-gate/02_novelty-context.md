# Novelty & Context — SIG-20260615-71775d0a

## 1. Step 4 — Ledger Retrieval

Window searched: last 72 hours relative to 2026-06-15T17:25:12Z (i.e., 2026-06-12T17:25Z onward); widened scan also checked full 7-day window given the slow-moving nature of spin-off stories. Issuers searched: "Honeywell International Inc.", "Honeywell Aerospace", "Honeywell Technologies", "HON", "HONA".

Ledger grep (pattern `(?i)honeywell`) returned **0 matches**. Secondary grep (pattern `(?i)(HON|aerospace|spin.?off|spinoff)`) also returned **0 matches**. Total entries in `screener/ledger/events.ndjson`: 5 (covering SIG-20260610-a3f2c81d × 2, SIG-20260612-dd716589 × 1, SIG-20260613-4bbcdeae × 2). None involve Honeywell or any related entity.

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty of Honeywell / no matches — new_event path | — | — | — | — | 0.00 |

## 2. Step 5 — Fact Delta (vs best match: none)

No prior event to compare against. All extraction fields are evaluated against a null baseline.

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | — | None stated in this release | No |
| deal_value | — | None (spin-off, no cash consideration) | No |
| fine_amount | — | None | No |
| eps | — | None | No |
| revenue | — | None | No |
| counterparty | — | None (internal corporate separation) | No |
| court | — | None | No |
| regulator | — | None (board action, not regulatory order) | No |

With no prior event, changed_fields = 0; no confirmation upgrade (no prior non-official record to upgrade from); no better-source bonus applicable.

**fact_delta** = (0 changed fields × 0.15) + (no confirmation 0.00) + (no better source 0.00) = **0.00** (capped at 1.0)

## 3. Step 6 — Confirmation Upgrade

- Prior official? — N/A (no prior event)
- Current official? — Yes (company press release via PR Newswire, Grade A)
- Issuer overlap? — N/A (no prior event)
- Event-or-similarity condition? — N/A

**confirmation_upgrade:** false

## 4. Step 7 — Pairwise Classification

No prior event in the ledger means similarity = 0.00, which is below 0.78.

- Branch fired: `ELSE: new_event` — the final branch of the deterministic matrix, triggered because similarity (0.00) is below all four thresholds (0.965, 0.93, 0.86, 0.78).

**pair_label:** new_event

## 5. Step 8 — Novelty

Base for `new_event` = 0.85. Fact delta = 0.00. No confirmation upgrade.

**novelty** = base(new_event) 0.85 + 0.50 × 0.00 + 0.00 (no confirmation upgrade) = **0.85**

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
