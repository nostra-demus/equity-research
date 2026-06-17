# Novelty & Context — SIG-20260616-8930aad4

## 1. Step 4 — Ledger Retrieval

Window searched: 2026-06-13T06:32Z to 2026-06-16T06:32Z (72-hour window back from intake datetime 2026-06-16T06:32:38Z). Issuers searched: "TCS", "Tata Consultancy Services", "DXC", "DXC Technology" (primary and secondary issuers from 01_relevance-events-entities.md).

Grep executed against `screener/ledger/events.ndjson`: pattern `TCS|Tata Consultancy|DXC|tata.consultancy` (case-insensitive). **Match count: 0.** The ledger contains 5 entries (all 5 read and confirmed); none reference TCS, Tata Consultancy Services, or DXC Technology.

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty / no matches — new_event path | — | — | — | — | 0.00 |

## 2. Step 5 — Fact Delta (vs best match: none)

No prior event exists in the ledger for this issuer. All fields are compared against a null prior.

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | none | none | No |
| deal_value | none | none | No |
| fine_amount | none | $70 million exceptional charge (litigation-settlement equivalent) | No prior to compare |
| eps | none | Q1 FY27 EPS reduced by ~$70M charge | No prior to compare |
| revenue | none | none | No |
| counterparty | none | DXC Technology | No prior to compare |
| court | none | US Supreme Court (rejected TCS appeal) | No prior to compare |
| regulator | none | none | No |

With no prior event in the ledger, there are zero changed fields in the delta sense (no old value exists to compare against). No confirmation upgrade is possible (requires a prior record). No source-tier improvement can be scored (no prior source to beat).

**fact_delta** = (0 changed fields × 0.15) + (confirmation 0.00) + (better source 0.00) = **0.00** (capped at 1.0)

## 3. Step 6 — Confirmation Upgrade

- Prior official? N/A — no prior event in ledger
- Current official? No — NDTV Profit (Grade A press, not an exchange filing or court record)
- Issuer overlap? N/A — no prior to overlap with
- Event-or-similarity condition? N/A

**confirmation_upgrade:** false

## 4. Step 7 — Pairwise Classification

Similarity point estimate: 0.00 (no ledger match found; similarity floor is 0.00).

Walking the deterministic matrix top-down:

- `IF confirmation_upgrade AND fact_delta >= 0.30` — false (no confirmation upgrade). Skip.
- `ELSE IF similarity >= 0.965` — false (0.00 < 0.965). Skip.
- `ELSE IF similarity >= 0.93` — false (0.00 < 0.93). Skip.
- `ELSE IF similarity >= 0.86` — false (0.00 < 0.86). Skip.
- `ELSE IF similarity >= 0.78` — false (0.00 < 0.78). Skip.
- `ELSE: new_event` — **branch fired.**

- Branch fired: `ELSE: new_event`
- **pair_label:** new_event

## 5. Step 8 — Novelty

Base by pair label: new_event = 0.85

novelty = base(new_event) 0.85 + 0.50 × 0.00 (fact_delta) + 0.00 (no confirmation upgrade)
novelty = 0.85 + 0.00 + 0.00 = **0.85**

Clamp check: 0.85 is within [0, 1]. No clamp needed.

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
