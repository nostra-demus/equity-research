# Edge Definition Synthesis — SIG-20260616-8930aad4

## Abstract

The potential edge here is that a US court's finding of "willful and malicious" conduct — not just a financial penalty — may cost TCS future US contracts that consensus has not modelled. Four searches confirmed zero broker coverage of this mechanism, so the gap is real. But the mechanism takes 6 to 18 months to show up in deal-win data, which puts it entirely outside the Q1 FY27 results window (July 9, 2026). On the only thing the thesis horizon actually tests — the reported earnings charge — consensus is right: the market stripped it, the stock rose 1.57% on disclosure day, and no numeric departure survives scrutiny. Edge score: 35 (watchlist_no_edge). The thesis is parked; monitor TCS's US BFSI deal-win data over Q2–Q4 FY27 for signs of the conduct-risk mechanism.

---

## 1. Sub-Scores (§12-calibrated)

### variant_perception_quality — 22/100

M0.6.3 explicitly rates the variant "weak". The coverage gap is genuine — four independent searches on June 16, 2026 returned zero broker notes, zero analyst commentary, and zero investment-research pieces discussing the vendor-qualification risk that flows from the Fifth Circuit's "willful and malicious" finding (Trendlyne, Investing.com, Business Today, Trade Brains, Scanx Trade, Business Standard, IPWatchdog, JD Supra). But the gap applies to a mechanism that operates on a 6 to 18 month lag, making it invisible within the thesis window of July 9, 2026. The only numeric departure on the charge itself — our Rs ~86 implied price impact vs the consensus Rs 55–70 — rests on an inferred FX rate of Rs 83.5/USD and an inferred diluted share count of ~9,430 million, and collapses once confirmed inputs are used. MODULE_RULES requires a numeric departure and a missing mechanism that resolves within the horizon; neither holds here. A score of 22 credits the confirmed search work while respecting the "no proven variant yet scores ≤ 30" calibration rule.

### mispricing_reason_strength — 48/100

The complexity category legitimately fits. The gap requires cross-domain work that spans reading a federal appellate opinion for its precise legal characterization and then tracing how US enterprise procurement teams apply vendor-integrity screens — work that IT equity analysts structurally do not do. All three verifiable facts independently check out: the Fifth Circuit's published "willful and malicious" language (verifiable at ca5.uscourts.gov, docket for the January 14, 2026 ruling); the confirmed absence of equity-research coverage (verifiable by running the same four searches); and the publicly documented FAR Subpart 9.4 and OCC Bulletin 2013-29 vendor-screening frameworks. The gap is structural — it would persist indefinitely absent a scheduled event forcing the market to model it — which is the strongest form of mispricing under §12. The score stops at 48 because the mispricing applies to a mechanism that doesn't converge within the thesis horizon. The analysis is not wrong; it is real but early. A mid-range mixed score is honest here.

### convergence_trigger_clarity — 38/100

The trigger date is precise (July 7–11, 2026), the obligation is legally mandatory under SEBI LODR Regulation 33, and the four-step mechanism names real actors: 43 Trendlyne-tracked analysts who revise EPS within 24–48 hours of the filing, institutional investors rebalancing their Q1 NAV marks, and management guidance on Q2 FY27 constant-currency growth shifting the forward P/E re-rate direction. Timing is proven, so the MODULE_RULES cap for vague timing (≤ 40) does not apply on timing grounds. The cap comes from a different problem: the trigger confirms consensus. M0.6.5 explicitly flags that "convergence here is not a market-moving revelation; it is the market confirming what it already believes." The mechanism that would actually force repricing — contract-win deceleration in US BFSI tied to the conduct finding — has no trigger within the horizon; its earliest observable data point is Q2–Q4 FY27. A score of 38 credits the precise calendar and named actors while reflecting that this trigger does not do the work convergence triggers are supposed to do.

---

## 2. The Blend (visible math)

blended_calculation: 0.40 × 22 + 0.30 × 48 + 0.30 × 38 = 8.80 + 14.40 + 11.40 = **34.60 → final_score 35**

- justification_sentence_1: The thesis clears M0.1–M0.5 cleanly — the $70M charge is legally final, quantified, and falsifiable — but the edge stack fails because the only genuine coverage gap (vendor-qualification risk from the "willful and malicious" court finding) operates on a 6 to 18 month lag that puts it entirely beyond the Q1 FY27 horizon.
- justification_sentence_2: Consensus is correct about the near-term earnings impact, the trigger confirms what the market already believes, and no numeric departure survives scrutiny at current data quality — watchlist_no_edge is the honest result.

---

## 3. Routing

- **routing_outcome:** watchlist_no_edge
- **routing_logic:** final_score 35 < 60 → watchlist_no_edge
- **routing_reason:** The edge score of 35 reflects a real event (the $70M charge) where the market's read is correct: consensus strips the charge and TCS's stock confirmed this by rising 1.57% on disclosure day. The only potential edge — that a court finding of "willful and malicious" conduct may cost TCS future US contracts — is a legitimate medium-to-long horizon idea but one that cannot be resolved within the thesis window and has no proven numeric departure today.

---

## 4. Record State

- locked: true · version: 1 · phase1_completed_at: 2026-06-16T14:00:00Z · falsifiers locked at: 2026-06-16T14:00:00Z
- next_module: null

---

## Machine Output

Wrote: `screener/runs/SIG-20260616-8930aad4/thesis_record.json` (complete, LOCKED, validates against frameworks/screener/thesis_record.schema.json)
Filed: `screener/ledger/theses/THS-SIG-20260616-8930aad4-v1.json`; events ledger status line appended; board index refreshed.

## Routing

Routing: watchlist_no_edge
Edge score: 35
Next module: none
