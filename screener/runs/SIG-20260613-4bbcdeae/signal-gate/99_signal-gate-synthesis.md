# Signal Gate Synthesis — SIG-20260613-4bbcdeae

## Abstract

Bank of America analyst Vivek Arya double-upgraded Intel (underperform to buy) on 2026-06-11, lifting the price target 41% ($96 to $135) and citing a structural shift in AI compute demand toward CPUs for "agentic AI" workloads, with the server CPU total addressable market revised from $125B to over $170B by 2030. There is no prior Intel or BofA analyst event in the 48-hour ledger window, so this is a clean new event with novelty 0.85. The materiality score is 72/100. The signal routes PROMOTE to thesis-structure.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | Grade B — The Motley Fool (secondary outlet reporting on a BofA analyst note; underlying primary event is Grade A) |
| Relevance | material (0.82) |
| Event types | guidance_change, macro_sector, product |
| Linkage | primary_issuer (Intel Corporation) |
| Similarity / pair | new_event (similarity 0.00 — no prior Intel/BofA entry in ledger) |
| Fact delta | 0.00 (no prior event to delta against) |
| Confirmation upgrade | false |
| Novelty | 0.85 |

## 2. Step 9 — Canonical Handling

- Best prior match: none — ledger contains zero Intel Corporation or BofA analyst events across the 48-hour window (and the full 3-entry ledger).
- Priority comparison: no competing canonical record exists; the signal is the first entry for this issuer and this event class.
- **action:** keep_separate

## 3. Step 10 — Materiality

Base 55 (material relevance; primary_issuer linkage; guidance_change + macro_sector + product event types; Grade B source — secondary outlet, not an official filing; supported by a same-day 6% stock move indicating market recognition) + novelty 0.85 × 20 = +17 − penalties 0 (new_event, no duplicate, no same_event labels) + overrides 0 (no official filing, enforcement action, or default) = **72/100**

Arithmetic check: 55 + 17 − 0 + 0 = 72. Clamped within 0–100.

## 4. Decision

Materiality 72 clears the PROMOTE threshold (≥70). The single most decision-relevant fact is the two-notch analyst upgrade paired with a market-size revision: BofA moved Intel from underperform to buy while revising the server CPU TAM from $125B to $170B+ by 2030 — an industry-level demand thesis tied to agentic AI that, if correct, would materially expand Intel's addressable market and reframe a previously bearish consensus. The signal proceeds to thesis-structure.

## Machine Output

Wrote: `screener/runs/SIG-20260613-4bbcdeae/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260613-4bbcdeae to screener/ledger/events.ndjson (idempotent — duplicate detected, no duplicate written); board index refreshed.

## Routing

Routing: PROMOTE
Materiality: 72
Next module: thesis-structure
