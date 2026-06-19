# Novelty & Context — SIG-20260619-755ea4d0

## 1. Step 4 — Ledger Retrieval

Window searched: 2026-06-17T11:28Z to 2026-06-19T11:28Z (48-hour primary window; also scanned to 2026-06-12T11:28Z for 7-day slow-story extension).

Issuers searched: MGM Resorts International (NYSE: MGM); secondary scan for IAC/InterActiveCorp and Barry Diller (noted as unverified in upstream entities table).

Grep of `screener/ledger/events.ndjson` for "MGM" returned 0 matches. Total ledger entries inspected: 10 lines across 8 distinct signals. None reference MGM Resorts International, MGM's Osaka IR project, Barry Diller, or any related gaming/casino M&A storyline.

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty / no matches — new_event path | — | — | — | — | 0.00 |

No prior event matches for the primary issuer (MGM Resorts International) or any secondary issuer within the 48-hour window, the 7-day extension, or the full ledger.

## 2. Step 5 — Fact Delta (vs best match: none)

No prior event exists in the ledger. All extraction fields are compared against a null baseline.

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | (none) | Not present in signal | No |
| deal_value | (none) | Unquantified ("all-cash deal at a premium to floor price") | No — no prior to compare |
| fine_amount | (none) | Not present in signal | No |
| eps | (none) | Not present in signal | No |
| revenue | (none) | Not present in signal | No |
| counterparty | (none) | Barry Diller / unverified (no on-list source) | No — no prior to compare |
| court | (none) | Not present in signal | No |
| regulator | (none) | Not present in signal | No |

With no prior event, there are zero changed fields and no confirmation upgrade or source tier comparison is applicable.

**fact_delta** = (0 changed fields × 0.15) + (confirmation 0.00) + (better source 0.00) = **0.00** (capped at 1.0)

## 3. Step 6 — Confirmation Upgrade

- Prior official? — N/A (no prior event in ledger)
- Current official? — No. Source is a human_prompt with no on-list source corroborating the deal claim or insider buying.
- Issuer overlap? — N/A (no prior event)
- Event-or-similarity condition? — N/A

**confirmation_upgrade:** false

All four conditions for a confirmation upgrade require a prior event to compare against. No prior event exists; the condition cannot be satisfied.

## 4. Step 7 — Pairwise Classification

Similarity point estimate: 0.00 (no prior event → band < 0.78 / new).

Walking the deterministic matrix top-down:

- `IF confirmation_upgrade AND fact_delta >= 0.30` — false (no prior, confirmation_upgrade = false). Does not fire.
- `ELSE IF similarity >= 0.965` — false (0.00 < 0.965). Does not fire.
- `ELSE IF similarity >= 0.93` — false (0.00 < 0.93). Does not fire.
- `ELSE IF similarity >= 0.86` — false (0.00 < 0.86). Does not fire.
- `ELSE IF similarity >= 0.78` — false (0.00 < 0.78). Does not fire.
- `ELSE:` — **fires. new_event.**

Branch fired: `ELSE: new_event` (similarity 0.00 < 0.78; no prior ledger event for MGM Resorts International or any related issuer within any search window)

**pair_label:** new_event

## 5. Step 8 — Novelty

Base by pair label (new_event): **0.85**
fact_delta contribution: 0.50 × 0.00 = **0.00**
confirmation_upgrade contribution: 0.20 × 0 = **0.00**

**novelty** = base(new_event) 0.85 + 0.50 × 0.00 + 0.00 = **0.85**

Clamp check: 0.85 is within [0, 1]. No clamp applied.

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
