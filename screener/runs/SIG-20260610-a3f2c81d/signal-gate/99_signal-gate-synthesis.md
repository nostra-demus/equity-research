# Signal Gate Synthesis — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## Abstract

An off-cycle 50 bps repo-rate cut by the RBI is a genuinely new, grade-A-sourced macro event with no prior footprint in the ledger. It scores 84/100 on materiality: an official policy action that mechanically reprices funding costs across every rate-sensitive sector, with full novelty and zero repetition penalties. The signal promotes to Phase 1 to be turned into a structured thesis.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | grade A, Reuters + RBI release |
| Relevance | material (0.96) |
| Event types | macro_sector, regulatory |
| Linkage | macro_only |
| Similarity / pair | none → new_event |
| Fact delta | 0.00 |
| Confirmation upgrade | false |
| Novelty | 0.85 |

## 2. Step 9 — Canonical Handling

- Best prior match: none
- **action:** keep_separate (first record of this event)

## 3. Step 10 — Materiality

Base 60 (material macro-policy event, official authority, economy-wide scope) + novelty 24 (0.85 × 28 scaling) − penalties 0 (new_event) + overrides 0 = **84/100**

## 4. Decision

PROMOTE. An off-cycle policy move with mechanical transmission into lender economics clears the ≥70 band comfortably; Phase 1 should quantify the world changes and map the blast radius.

## Machine Output

Wrote: `screener/runs/SIG-20260610-a3f2c81d/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260610-a3f2c81d to screener/ledger/events.ndjson; board index refreshed.

## Routing

Routing: PROMOTE
Materiality: 84
Next module: thesis-structure
