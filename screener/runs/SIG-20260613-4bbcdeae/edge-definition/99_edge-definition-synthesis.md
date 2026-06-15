# Edge Definition Synthesis — SIG-20260613-4bbcdeae

## Abstract

The variant is that Intel's Q1 2026 gross margin of 41% — the empirical anchor for BofA's $6.24/share 2030 EPS target and the $135 price target — embedded ~650 basis points of non-recurring legacy inventory liquidation that Intel's own CFO flagged on the earnings call and that the Q2 guide-down to 39% confirms. If the clean gross margin baseline is ~34.5–37%, consensus 2030 EPS power compresses 20–28% below BofA's destination. The strongest evidence is a primary disclosure (Intel Q1 2026 8-K, SEC EDGAR, 2026-04-23) and a dated, confirmed earnings trigger (Q2 2026 print, 2026-07-23). The weakest link is the sell-side coverage gap: paywalled BofA and Citi notes mean we cannot confirm with certainty that the models failed to back out the inventory item. Edge score: 64 — provisional. Next step: surface candidates in the server CPU semiconductor and semiconductor capital equipment industries.

---

## 1. Sub-Scores (§12-calibrated)

### variant_perception_quality — 48/100

The variant has the right form — a numeric departure of 20–28% below the BofA $6.24 EPS destination ($4.50–$5.00 in our view), a specific mechanism documented in a primary source (Intel Q1 2026 8-K and earnings call transcript, SEC EDGAR, 2026-04-23: "previously-reserved inventory" driven 650bps above guidance; CFO said "we are not sure we will have the Q1 inventory benefit in the second quarter"), and a second mechanism (hyperscaler pre-build pulling forward Q1 DC+AI revenue, evidenced by SemiAnalysis and KeyBanc, 2026). The arithmetic is shown step by step: clean Q1 gross margin ≈ 34.5% (41% minus 650bps); 2026 blended gross margin closer to 37–38% than Citi's revised 42%; at 300–500bps lower blended gross margin on BofA's $86.1B 2030 product revenue base, EPS compresses by ~$0.54/share, shaving ~$13.50 off the $135 price target. This keeps the score above the ≤30 "no proven variant" floor. However, the sell-side coverage gap is only moderately confirmed: six web searches run on 2026-06-14 found no article or analyst summary that explicitly backs out the non-recurring Q1 inventory component from BofA's or Citi's gross margin path, but the primary BofA and Citi research notes are paywalled and may contain the adjustment. The variant self-rates as "weak" precisely because of this gap-confirmation limit. A strong variant score requires the gap to be evidenced conclusively — here it is partially evidenced. The departure is real and the mechanism is specific, but the claim that the consensus has not modelled this is moderate-confidence, not confirmed. Score: 48 (mixed — numeric departure shown, mechanism documented in primary source, gap not fully confirmed).

### mispricing_reason_strength — 72/100

The primary category is timing, and the fit is strong. Three independently verifiable facts establish it. First: Intel management disclosed the 650bps non-recurring inventory benefit on 2026-04-23 in its Q1 8-K and earnings call transcript (verifiable via SEC EDGAR; the CFO's quoted language about the benefit not repeating in Q2 is in the primary source). Second: Citi revised its full-year 2026 non-GAAP gross margin estimate from 37% to 42% after the Q1 print (sourced via 24/7 Wall St., 2026-05-18); Intel's own Q2 guidance of 39% (same 8-K, Exhibit 99.1) is arithmetically inconsistent with a 42% full-year estimate unless H2 2026 gross margin reaches 43–45% — a level management never guided to; this inconsistency is visible by comparing two public numbers. Third: BofA issued its $135 / $6.24 EPS upgrade note 49 days after the primary disclosure (2026-06-11), with no reference in available public summaries to an inventory adjustment — the 49-day gap between disclosure and model publication is itself evidence that model-update cadence is the binding constraint. The 13-week timing window (April 23 disclosure → July 23 Q2 print that forces reconciliation) is bounded and known. Secondary categories (behavioral — recency bias after a decade of Intel underperformance; complexity — four-step cross-document work chain to propagate the correction) are well-supported and additive. The primary category is well-fitted, all three facts have clear verification paths from primary or credible secondary sources, and the timing mechanism is structural (quarterly model-lag is a standard market microstructure feature). Score: 72 (strong — timing primary category, 3/3 facts verifiable, structural mechanism).

### convergence_trigger_clarity — 78/100

The primary trigger is Intel's mandatory Q2 2026 earnings 8-K (SEC EDGAR), confirmed for 2026-07-23 by Barchart.com, Benzinga, Unusual Whales, and Investing.com (all retrieved 2026-06-14). The date is certain and the event is non-deferrable; 2026-07-23 is 39 days from the signal date, inside the M0.4 "weeks-to-3-months" horizon. The four-step causal mechanism runs from specific named inputs to a price range: (1) Q2 8-K shows non-GAAP gross margin at the guided 39% (not 40%+) and DC+AI revenue below $5.1B, confirming both mechanisms documented in M0.6.3; (2) within 24–48 hours, Citi (named, with its specific 42% estimate on record) and the sell-side update gross margin paths toward 37–38% and trim 2030 EPS estimates below $6.24; (3) growth-oriented funds that entered on the BofA upgrade day (+6.5% on 2026-06-11) reduce or exit positions, and options market-makers reprice IV; (4) price converges to the $112–$125 range implied by the variant's $4.50–$5.00 EPS at BofA's own 25x multiple. Secondary triggers (hyperscaler Q2 earnings commentary, pre-announcement 8-K, sell-side estimate cuts before Q2 print) are dated and carry stated probabilities. The small deduction from a perfect score reflects that steps 3 and 4 depend on the Q2 gross margin printing at or below 39% — a guided outcome, not yet confirmed — and that the magnitude of price convergence requires a sell-side update cycle to complete (48–72 hours), not instant arbitrage. Score: 78 (strong — scheduled date confirmed from a real calendar, inside horizon, four-step mechanism with named actors; residual uncertainty on the direction of the Q2 outcome itself).

---

## 2. The Blend (visible math)

blended_calculation: 0.40 × 48 + 0.30 × 72 + 0.30 × 78 = 19.2 + 21.6 + 23.4 = **64.2 → final_score 64**

- justification_sentence_1: The convergence trigger (78) and mispricing strength (72) are both solidly in the strong range because the Q2 earnings date is confirmed and the timing-lag mechanism is backed by three verifiable facts, giving this thesis a clear and dated resolution event within the horizon.
- justification_sentence_2: The variant perception score (48) is the binding constraint — the numeric departure is real and mechanically shown, but the sell-side gap can only be partially confirmed without access to the paywalled BofA and Citi primary notes, keeping the overall edge below the full_machine threshold.

---

## 3. Routing

- **routing_outcome:** provisional
- **routing_logic:** Final score 64 falls in the 60–80 band → provisional.
- **routing_reason:** The thesis has a dated, confirmed catalyst (Intel Q2 2026 earnings, 2026-07-23) and a timing-driven mispricing grounded in three verifiable facts, but the variant perception scores in the mixed band because the sell-side coverage gap — whether BofA and Citi explicitly failed to back out the non-recurring Q1 gross margin item — cannot be confirmed from publicly accessible sources alone; provisional routing reflects a real but unconfirmed edge that merits candidate surfacing without committing the full research machine.

---

## 4. Record State

- locked: true · version: 1 · phase1_completed_at: 2026-06-14T00:00:00Z · falsifiers locked at: 2026-06-14T00:00:00Z
- next_module: candidate-surfacing

## Machine Output

Wrote: `screener/runs/SIG-20260613-4bbcdeae/thesis_record.json` (complete, LOCKED, validates against frameworks/screener/thesis_record.schema.json)
Filed: `screener/ledger/theses/THS-SIG-20260613-4bbcdeae-v1.json`; events ledger status line appended; board index refreshed.

## Routing

Routing: provisional
Edge score: 64
Next module: candidate-surfacing
