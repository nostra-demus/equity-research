# Edge Definition Synthesis — SIG-20260610-a3f2c81d

> FIXTURE — hand-crafted golden example; not a live run output.

## Abstract

The variant — funding-mix asymmetry in rate transmission — is numeric (+4–6% EPS for pure-play HFCs vs ~+1% uniform drift), mechanism-rich, and converges on a mandatory results window. It is held back from the top band by partial coverage of its timing leg and a moderate magnitude: variant quality 78, mispricing strength 72, trigger clarity 88, blending to 79. The record locks and routes provisional: surface candidates, monitor the CP-yield kill switch, and let a human decide which expression to hand to the research machine.

## 1. Sub-Scores (§12-calibrated)

### variant_perception_quality — 78/100
Numeric departure with carry-through arithmetic and two named mechanisms; capped below 80 because one house covers the timing leg (the cross-sectional model stays uncovered).

### mispricing_reason_strength — 72/100
Complexity fits; three verifiable facts (uniform day-one moves, undifferentiated revisions, stale model dates), the first two verifiable today.

### convergence_trigger_clarity — 88/100
Scheduled, mandatory results window inside the horizon; four-step actor-named mechanism; monthly partial-convergence pre-trigger.

## 2. The Blend (visible math)

blended_calculation: 0.40 × 78 + 0.30 × 72 + 0.30 × 88 = 31.2 + 21.6 + 26.4 = **79.2 → final_score 79**

- justification_sentence_1: The funding-mix asymmetry is a real, modellable mechanism the day-one uniform re-rating did not price.
- justification_sentence_2: Convergence rests on a mandatory results print inside the horizon, not on sentiment.

## 3. Routing

- **routing_outcome:** provisional
- **routing_logic:** final_score 79 falls in the 60–80 band → provisional.
- **routing_reason:** Edge is real but moderate — partial timing-leg coverage and a +4–6% EPS magnitude rather than a step-change.

## 4. Record State

- locked: true · version: 1 · phase1_completed_at: 2026-06-10T07:05:00Z · falsifiers locked
- next_module: candidate-surfacing

## Machine Output

Wrote: `screener/runs/SIG-20260610-a3f2c81d/thesis_record.json` (complete, LOCKED)
Filed: `screener/ledger/theses/THS-SIG-20260610-a3f2c81d-v1.json`; events ledger status appended; board index refreshed.

## Routing

Routing: provisional
Edge score: 79
Next module: candidate-surfacing
