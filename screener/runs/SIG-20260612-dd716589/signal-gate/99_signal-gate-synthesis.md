# Signal Gate Synthesis — SIG-20260612-dd716589

## Abstract

A major Gulf LNG producer declared force majeure on June–July 2026 cargo loadings following a compressor train failure, removing contracted supply from the market for at least two months. The event is fully new — nothing matching appears in the 72-hour ledger window — and novelty scores 0.85. The producer is unnamed in the source, so linkage is sector-only rather than company-specific, which pulls the materiality base down from 70 to 60 before the novelty contribution pushes the final score to 81. Routing: PROMOTE to thesis-structure.

## 1. Gauntlet Summary (inherited)

| Step | Result |
|---|---|
| Gate 0 | Grade A, Reuters (primary newswire, first entry on approved-source list) |
| Relevance | material (0.88) |
| Event types | operations, regulatory, macro_sector |
| Linkage | sector_only (producer unnamed in source; article body inaccessible) |
| Similarity / pair | 0.00 — new_event |
| Fact delta | 0.00 (no prior ledger event to compare against) |
| Confirmation upgrade | false |
| Novelty | 0.85 |

## 2. Step 9 — Canonical Handling

- Best prior match: none — the events ledger contains only one prior signal (SIG-20260610-a3f2c81d, RBI repo rate cut), which shares no issuer, topic, or event type with a Gulf LNG supply disruption. Similarity is 0.00.
- Priority comparison: no prior record exists for any Gulf LNG or force-majeure event; the keep_separate action is the only applicable outcome.
- **action: keep_separate**

## 3. Step 10 — Materiality

Base 60 (material relevance + high-severity force majeure — two-month supply withdrawal from a "major" Gulf producer in a tight summer market — pulled back from 70 because issuer_linkage is sector_only; the producer is unnamed, reducing direct investability) + novelty 21 (0.85 × 25, rounded down) − penalties 0 (new_event: no duplicate or same-event deduction applies) + overrides 0 (source is Reuters Grade A, not an official company filing or enforcement/default action; no positive override triggered) = **81/100**

## 4. Decision

Materiality 81 clears the 70-point PROMOTE threshold. The force majeure removes contracted LNG supply for June and July from a self-described "major" Gulf producer — large enough to move global spot assessments and alter procurement decisions at receiving terminals worldwide. The unnamed-issuer gap shapes Phase 1 work: thesis-structure must map world changes and beneficiaries at the industry level (LNG shipping, regas, diversified energy buyers and sellers) rather than at a single company, until or unless the producer identity is confirmed.

## Machine Output

Wrote: `screener/runs/SIG-20260612-dd716589/signal_payload.json` (validates against frameworks/screener/signal_payload.schema.json)
Ledger: appended SIG-20260612-dd716589 to screener/ledger/events.ndjson; board index refreshed.

## Routing

Routing: PROMOTE
Materiality: 81
Next module: thesis-structure
