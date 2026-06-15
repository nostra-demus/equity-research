# Novelty & Context — SIG-20260613-4bbcdeae

## 1. Step 4 — Ledger Retrieval

Window searched: 2026-06-11T17:39Z to 2026-06-13T17:39Z (48-hour window, primary; widened lookback available to 7 days for slow stories). Issuers searched: "Intel Corporation" (primary), "Bank of America" (secondary).

Ledger grep executed against `screener/ledger/events.ndjson`: searched for "Intel", "INTC", "intel", "semiconductor", "upgrade", "analyst", "Bank of America", "BofA" — 0 matches returned across all 3 ledger entries. The 3 existing entries cover: (1) RBI repo-rate cut, 2026-06-10 [issuers: Reserve Bank of India]; (2) RBI thesis record duplicate entry, 2026-06-10; (3) Gulf LNG force majeure, 2026-06-12 [issuers: Unnamed major Gulf LNG producer]. Neither Intel nor Bank of America appears in the ledger under any field.

| Prior signal_id | Date | Headline | Issuer overlap | Similarity band | Point estimate |
|---|---|---|---|---|---|
| Ledger empty / no matches — new_event path | — | — | — | — | 0.00 |

No prior event matches Intel Corporation or the BofA analyst upgrade storyline. The new_event path applies by default.

## 2. Step 5 — Fact Delta (vs best match: none)

No prior ledger event to compare against. All extraction fields are populated for the first time by this signal.

| Field | Prior value | Current value | Changed? |
|---|---|---|---|
| guidance | — | BofA price target raised from $96 → $135 (+41%); server CPU TAM revised $125B → $170B+ by 2030 | N/A (first appearance) |
| deal_value | — | None | N/A |
| fine_amount | — | None | N/A |
| eps | — | None disclosed in this signal | N/A |
| revenue | — | Intel Q1 2026 data center & AI revenue ~$5.1B (+22% YoY) cited as supporting data | N/A (first appearance) |
| counterparty | — | None | N/A |
| court | — | None | N/A |
| regulator | — | None | N/A |

With no prior event, there are no changed fields to score. Confirmation upgrade does not apply (no prior entry to upgrade from). Source is not better than a prior (no prior exists).

**fact_delta** = (0 changed fields × 0.15) + (no confirmation 0.00) + (no better-source comparison 0.00) = **0.00** (capped at 1.0)

## 3. Step 6 — Confirmation Upgrade

- Prior official? N/A — no prior ledger entry exists.
- Current official? No — current source is The Motley Fool (Grade B secondary); the underlying BofA analyst note is Grade A primary but not directly in the ledger as a prior entry.
- Issuer overlap? N/A.
- Event-or-similarity condition? N/A.
- **confirmation_upgrade:** false

No prior non-official entry exists for this issuer; the confirmation-upgrade condition cannot be satisfied.

## 4. Step 7 — Pairwise Classification

Walking the deterministic matrix top-down:

1. `IF confirmation_upgrade AND fact_delta >= 0.30` → False (confirmation_upgrade = false). Skip.
2. `ELSE IF similarity >= 0.965` → False (similarity = 0.00, no prior entry). Skip.
3. `ELSE IF similarity >= 0.93` → False (similarity = 0.00). Skip.
4. `ELSE IF similarity >= 0.86` → False (similarity = 0.00). Skip.
5. `ELSE IF similarity >= 0.78` → False (similarity = 0.00). Skip.
6. `ELSE:` → **new_event**

- Branch fired: `ELSE: new_event` (the terminal branch of the pairwise matrix; similarity = 0.00, below all thresholds, no prior issuer entry in ledger)
- **pair_label:** new_event

## 5. Step 8 — Novelty

Base by pair label: new_event → 0.85
fact_delta: 0.00
confirmation_upgrade: false → 0.00

**novelty** = base(new_event) 0.85 + 0.50 × 0.00 + 0.00 (no confirmation) = **0.85**

Arithmetic check: 0.85 + 0.00 + 0.00 = 0.85. Within [0, 1] clamp. No adjustment needed.

## 6. Verdict

Verdict: new_event, novelty 0.85, fact_delta 0.00
