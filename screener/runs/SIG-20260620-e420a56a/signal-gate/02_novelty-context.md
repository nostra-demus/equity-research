# Novelty & Context — SIG-20260620-e420a56a

## 1. Step 4 — Ledger Retrieval

Window searched: 2026-06-17T11:31:54Z to 2026-06-20T11:31:54Z (72-hour window). Extended to 7-day look-back (2026-06-13 to 2026-06-20) for any slow-moving Jio / Reliance storyline. Issuers searched: "Jio Platforms Limited", "Reliance Industries Limited", "Meta Platforms", "Google International LLC", "Saudi Arabia Public Investment Fund", "KKR", "Vista Equity Partners", "Mubadala", "General Atlantic".

Ledger grep result: 0 matches for "jio" or "reliance" across all 11 entries in screener/ledger/events.ndjson. 0 matches for any secondary issuer. 0 matches for "drhp", "ipo", or "capital_actions" on any Jio/Reliance entity. Full ledger coverage confirmed (11 entries total; all issuers: RBI, Unnamed Gulf LNG producer, Intel Corporation, Honeywell entities, TCS, Norben Tea & Exports, MGM Resorts).

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty / no matches — new_event path | — | — | — | — | 0.00 |

## 2. Step 5 — Fact Delta (vs best match: none)

No prior event to compare against. All extraction fields are being seen for the first time.

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | — | n/a (no guidance change in this event) | No |
| deal_value | — | ₹37,700 crore (~$4 billion) IPO size; ₹27,500 crore debt repayment earmark | No prior (first appearance) |
| fine_amount | — | n/a | No |
| eps | — | n/a | No |
| revenue | — | n/a | No |
| counterparty | — | SEBI (regulatory filing recipient) | No prior (first appearance) |
| court | — | n/a | No |
| regulator | — | SEBI (DRHP filed 2026-06-20) | No prior (first appearance) |

No prior event exists, so no field has changed from a prior value. Changed field count = 0.

**fact_delta** = (0 changed fields × 0.15) + (confirmation upgrade 0.00) + (better source 0.00) = **0.00** (capped at 1.0)

## 3. Step 6 — Confirmation Upgrade

- Prior official? N/A — no prior event in ledger
- Current official? Yes — DRHP is a formal SEBI filing (regulatory submission); Outlook Business reporting on it is Grade B, but the underlying instrument is an official regulatory document
- Issuer overlap? N/A — no prior event
- Event-or-similarity condition? N/A — no prior event

**confirmation_upgrade:** false (no prior non-official record exists to upgrade)

## 4. Step 7 — Pairwise Classification

All matrix branches evaluated in order:

1. `IF confirmation_upgrade AND fact_delta >= 0.30` — confirmation_upgrade is false → branch does not fire
2. `ELSE IF similarity >= 0.965` — similarity is 0.00 (no prior match) → branch does not fire
3. `ELSE IF similarity >= 0.93` — similarity is 0.00 → branch does not fire
4. `ELSE IF similarity >= 0.86` — similarity is 0.00 → branch does not fire
5. `ELSE IF similarity >= 0.78` — similarity is 0.00 → branch does not fire
6. `ELSE: new_event` — **this branch fires**

- Branch fired: `ELSE: new_event` (similarity 0.00 < 0.78; no prior ledger entry for any Jio/Reliance issuer)
- **pair_label:** new_event

## 5. Step 8 — Novelty

Base by pair label: new_event → 0.85
fact_delta: 0.00
confirmation_upgrade: false → +0.00

**novelty** = base(new_event) 0.85 + 0.50 × 0.00 + 0.00 = **0.85**

Clamp check: 0.85 is within [0, 1]. No clamping needed.

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
