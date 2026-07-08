# Novelty & Context — SIG-20260709-c7ac1278

## 1. Step 4 — Ledger Retrieval

Window searched: 2026-07-07T00:00:00Z to 2026-07-09T00:00:00Z (48-hour default; widened search to full ledger history given the slow-moving M&A storyline — 7-day and all-time windows both searched). Issuers searched: Ascension Health / Ascension Saint Thomas (primary acquirer), Williamson Health (acquisition target), HCA Healthcare (NYSE: HCA) (losing bidder / secondary issuer), UnitedHealth Group / Optum (NYSE: UNH) (losing bidder / secondary issuer).

Grep executed against `screener/ledger/events.ndjson` (12 records total): pattern `Ascension|Williamson Health|HCA Healthcare|UnitedHealth|Optum|HCA|UNH` — **0 matches returned**.

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty / no matches — new_event path | — | — | — | — | 0.00 |

No prior event in the ledger shares any primary or secondary issuer with this signal. All 12 ledger entries cover unrelated issuers (RBI, Gulf LNG producer, Intel, Honeywell, TCS, Norben Tea, MGM, Jio, Ramelius/Forrestania, Modern Inno DT). The new_event path applies.

## 2. Step 5 — Fact Delta (vs best match: none)

No prior event exists to compare against. All extraction fields are first-seen.

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | n/a (no prior) | Not reported | No prior |
| deal_value | n/a (no prior) | ~$1B ($700M purchase price + ~$395M capital commitments) | No prior |
| fine_amount | n/a (no prior) | Not applicable | No prior |
| eps | n/a (no prior) | Not applicable | No prior |
| revenue | n/a (no prior) | Not applicable | No prior |
| counterparty | n/a (no prior) | Williamson Health (target); HCA Healthcare and Optum (losing bidders) | No prior |
| court | n/a (no prior) | Not applicable | No prior |
| regulator | n/a (no prior) | Williamson County Board of Commissioners; federal and state regulators | No prior |

**fact_delta** = (changed_fields × 0.15) + (confirmation 0.35) + (better source 0.10) = 0 + 0 + 0 = **0.00** (no prior event to delta against; capped at 1.0)

## 3. Step 6 — Confirmation Upgrade

- Prior official? **N/A — no prior event exists**
- Current official? The source (Fierce Healthcare, Tier 2 trade press) is non-official; body text cites Healthcare Dive and NewsChannel5 with a 2026-07-06 board vote and 2026-07-08 reporting date
- Issuer overlap? **N/A — no prior event exists**
- Event-or-similarity condition? **N/A — no prior event exists**
- **confirmation_upgrade: false** (no prior event to upgrade from)

## 4. Step 7 — Pairwise Classification

Evaluating the deterministic matrix top-down:

- `IF confirmation_upgrade AND fact_delta >= 0.30` → false (confirmation_upgrade = false)
- `ELSE IF similarity >= 0.965` → false (no prior event; similarity = 0.00)
- `ELSE IF similarity >= 0.93` → false (similarity = 0.00)
- `ELSE IF similarity >= 0.86` → false (similarity = 0.00)
- `ELSE IF similarity >= 0.78` → false (similarity = 0.00)
- `ELSE:` → **new_event**

- Branch fired: `ELSE: new_event` (similarity < 0.78 — no prior ledger event with any issuer overlap)
- **pair_label: new_event**

## 5. Step 8 — Novelty

Base by pair label: new_event = 0.85
fact_delta = 0.00
confirmation_upgrade = false (0.20 bonus does not apply)

**novelty** = base(new_event) 0.85 + 0.50 × 0.00 + 0.00 = **0.85**

Arithmetic check: 0.85 + 0.00 + 0.00 = 0.85. Within [0, 1] — no clamp needed.

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
