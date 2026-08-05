# Edge Definition Synthesis — SIG-20260804-da21208a

## Abstract

Grab's 4 August 2026 guidance raise reads to a unanimous 26/26-Buy Street as durable, AI-margin-funded growth. The specialist record instead finds that the marginal dollar of incentive spend funding this quarter's growth cost 13.9% of incremental GMV against Grab's own disclosed 10.9% blended average — a real, numeric mechanism the Street's pre-computed ratio conceals, though the general risk direction is already partly priced (Barclays' target cut, the market's own show-me discount). The mispricing persists because reaching that number means subtracting figures Grab reports in separate sections, not because the inputs are hidden. Q3 2026 earnings (base case 3–4 November) is a scheduled, mandatory disclosure that resolves it. Edge score 67 — provisional band: real, cited evidence, moderate confidence, worth deeper candidate work, not yet the full machine.

## 1. Sub-Scores (§12-calibrated)

### variant_perception_quality — 63/100

The variant clears the "no proven variant" floor by a wide margin: M0.6.3 shows a specific numeric departure (marginal incentive intensity 13.9% vs. the disclosed 10.9% average, a 3.0pp / ~28% relative gap, arithmetic shown line-by-line from Grab's own Q2 2025/2026 figures) and two named mechanisms (rising marginal cost of growth; an 81%-user-count/14%-per-user growth composition consensus has not decomposed). The coverage-gap evidence is genuine — five dated searches plus a direct fetch of Simply Wall St — but it returns a partial result, not a clean miss: the general "incentive-heavy growth could limit margin expansion" risk is already qualitatively flagged (Barclays' 3 August target cut, a 7%-of-GMV threshold in Simply Wall St's own coverage), and the specialist's own verdict self-moderates the variant to "weak-to-moderate" for exactly this reason. That self-moderation — a specific, unmodeled quantitative decomposition layered on a risk the market already partly senses, not one it is blind to — is what holds this in the "strong" band rather than "very strong."

### mispricing_reason_strength — 65/100

The complexity category fits the evidence: none of Grab's disclosures compute an incremental (marginal-dollar) incentive ratio, the release splits GMV/MTU and incentive figures across separate "Mobility"/"Deliveries"/"Financial Services" subsections rather than tying them together, and the single group-level 10.9% ratio itself blends two segments moving at different speeds (Deliveries 11.9%, up from 11.3%; Mobility 8.8%, up from 7.8%) that a reader must break out independently. All three facts are independently verifiable against named documents (the Q2 2026 press release, the Q2 2025 Form 6-K, the segment-highlights sections) and none duplicate a number already on the record elsewhere in M0.6. This is a workflow-based, moderately durable gap — it persists only until one analyst actually performs the subtraction (M0.6.5's own ST-002 puts that at 20% probability before Q3) — which is real evidence but a thinner form of persistence than a mandate constraint or structural flow, capping it mid-"strong" rather than higher.

### convergence_trigger_clarity — 75/100

The trigger is dated from Grab's own real reporting cadence (Q3 2025 announced 3–4 November 2025; Q3 2023 announced 9 November 2023), is a scheduled and mandatory 6-K disclosure — not a discretionary event — and lands inside both the M0.4 horizon and the M0.5 threshold date in the base case. The four-step mechanism names real actors at each stage: Grab's own 6-K disclosure of the marginal incentive/MTU split, the 26 covering analysts (specifically Barclays, already the outlier after its 3 August target cut) rebuilding models on the new split, the existing 11.35%-of-float short cohort and mandate-driven funds repositioning, and the resulting compression of GRAB's 14.6x forward EV/EBITDA toward or away from Uber's 21.22x. The score is held below "very strong" because Grab has not yet issued formal Q3 2026 notice (the date is inferred from cadence, not confirmed) and the cited vendor's wide-end estimate (17 November) sits two days past the M0.5 monitorable_threshold_date, requiring the monitoring window itself to be flagged for a short extension.

## 2. The Blend (visible math)

blended_calculation: 0.40 × 63 + 0.30 × 65 + 0.30 × 75 = 25.2 + 19.5 + 22.5 = **67.2 → final_score 67**

- justification_sentence_1: The blend is carried most by convergence_trigger_clarity (75) and mispricing_reason_strength (65), both anchored in named, dated, independently verifiable evidence, while variant_perception_quality (63) is held back because the specialist's own coverage-gap search found the general incentive-spend risk already partly reflected in Barclays' target cut and the market's own show-me discount.
- justification_sentence_2: At 67, the edge clears the bar for deeper candidate work but not the full machine — this is a real, unmodeled quantitative mechanism layered on a risk the market has partly sensed, not either a market that is completely blind or a mechanism still fully hidden.

## 3. Routing

- **routing_outcome:** provisional
- **routing_logic:** Final score 67 falls in the 60–80 band, which routes to provisional (not full_machine, which requires >80; not watchlist_no_edge, which requires <60).
- **routing_reason:** A genuine numeric variant, a verifiable complexity-based mispricing mechanism, and a well-dated four-step convergence trigger are all present and specifically evidenced, but each leg carries its own moderating flag — the variant builds on a partially market-sensed risk, the mispricing gap is workflow-thin and could close on a single sell-side note, and the trigger's exact date is inferred rather than yet formally confirmed by Grab — which is enough evidence to warrant candidate surfacing without yet justifying full-machine conviction.

## 4. Record State

- locked: true (to be set by orchestrator on JSON application) · version: 1 · phase1_completed_at: 2026-08-05T16:30:00Z (per this synthesis) · falsifiers locked at: 2026-08-05T16:30:00Z
- next_module: candidate-surfacing

## Machine Output

This synthesis specifies the complete M0_6_1 … M0_6_6 blocks (consensus, market-implied dashboard, variant perception, mispricing reason, convergence trigger, and the scoring/routing block above), the `meta` update (status = provisional, phase1_completed_at = 2026-08-05T16:30:00Z, next_module = candidate-surfacing, locked = true), and the `M0_5` lock (locked_after_m0_complete = true) for application to `screener/runs/SIG-20260804-da21208a/thesis_record.json`. Per this run's explicit instructions, this report writes only to its own output path — it does not itself modify `thesis_record.json`, copy to `screener/ledger/theses/`, append the events ledger, or refresh the board index; those mechanical steps are the orchestrator's to apply from the content above.

## Routing

Routing: provisional
Edge score: 67
Next module: candidate-surfacing
