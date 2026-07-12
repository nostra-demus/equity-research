# Edge Definition Synthesis — SIG-20260711-b55e8917

## Abstract

The variant is that Carvana's EV embeds roughly $53.8 billion of new-car disruption optionality above an 8x EBITDA dealer-group floor, while a Stellantis policy (January 6, 2026) caps Carvana's acquisition pace at one store per rolling 12 months — a structural ceiling that constrains the cap-adjusted new-car business to ~$1.6–$6.2B of EV at generous multiples. No major sell-side firm has published a cap-constrained optionality NPV. The weakest link is an attribution assumption the specialist itself flags: the market may be rationally paying a durable premium for used-car market share, not new-car optionality, which shrinks the proven gap considerably. The blended edge score is 61, placing this in the provisional band. The next step is candidate surfacing, with the July 29 Q2 earnings release as the dated, scheduled trigger that will either confirm or collapse the variant within 17 days.

---

## 1. Sub-Scores (§12-calibrated)

### variant_perception_quality — 52/100

The variant has a real, numeric departure: the market embeds ~$53.8B of EV premium above the dealer-group floor multiple (8x on $2.7B TTM adj. EBITDA = $21.6B floor, vs ~$75.4B actual EV per M0.6.2 Block 3), while the cap-constrained new-car business justifies only $1.6–$6.2B of that premium at generous multiples — a ~33x overprice of the new-car option. The Stellantis January 6, 2026 acquisition cap (one CDJR store per rolling 12 months, documented in DealershipGuy newsletter dated 2026-02-26 and flagged by Northcoast Research/John Healy) is the mechanism, and M0.6.3 confirmed that none of the five major covering analysts (Morgan Stanley, JPMorgan, Baird, RBC, BTIG) has published a cap-adjusted optionality valuation in any note found via four independent web searches on 2026-07-12. Two weaknesses, however, pull this below the strong band. First, the sell-side coverage gap is only partial: BTIG has independently covered the new-car GPU economics and the 75% crossover metric, so mechanism_2 (demand substitution) is not a clean gap. Second, and more fundamentally, M0.6.3 itself labels the variant "weak" because the $53.8B EV premium could be rationally assigned to permanent used-car market dominance rather than new-car optionality — without that attribution being pinned down, the numeric departure is directionally large but causally unproven. A variant with a specific mechanism, a large numeric departure, and a confirmed sell-side gap on mechanism_1, but with an unresolved attribution question at its core, lands in the lower-middle of the mixed band.

### mispricing_reason_strength — 62/100

The primary category is complexity, and all three verifiable facts are independently checkable. Fact 1: the Stellantis one-per-12-month cap is documented in automotive trade press (DealershipGuy, CBT Automotive News, Carscoops) sourced from the January 6, 2026 Stellantis dealer network communication — a skeptic can pull it from the February 2026 trade press archive. Fact 2: Northcoast Research/John Healy flagged the cap publicly as "not coincidental," yet four web searches on 2026-07-12 produced zero published notes from Morgan Stanley, JPMorgan, Baird, RBC, or BTIG that quantify a terminal store count under the cap or derive a cap-adjusted optionality NPV — the absence of the sell-side cross-domain model is itself verifiable. Fact 3: the EV/EBITDA gap (29–32x TTM vs 5–8x for dealer groups) is drawn from Carvana's Q1 2026 8-K (adj. EBITDA $672M, SEC EDGAR, filed April 29 2026) and market EV data as of 2026-07-10. The complexity reason is structural in character — the steps cross two domains (OEM franchise law plus equity model) — which is more durable than a timing or behavioral mispricing. Two factors hold the score below the upper-strong band: first, the mispricing relies on a negative (the absence of a published note) that a single analyst could remedy quickly, making it less durable than a structural institutional constraint; second, the secondary categories (passive-ownership floor, narrative momentum) add coherence but are themselves well-known and not in themselves a coverage gap.

### convergence_trigger_clarity — 72/100

The primary trigger is the Carvana Q2 2026 earnings release (Form 8-K + earnings call), confirmed for July 29, 2026 after market close (Carvana IR / StockTitan, 2026-07-09) — 17 days from today and squarely inside the M0.4 3-month horizon. The trigger is a SEC-mandatory filing with no discretion to skip, which means the timing is as solid as triggers get. The four-step mechanism names real actors at each step: (1) management discloses (or declines to disclose) cap constraints on the earnings call; (2) Morgan Stanley, JPMorgan, Baird, RBC, and BTIG analysts — confirmed to have no published cap-adjusted model — revise or flag the ceiling in their post-earnings notes (July 30 – August 1); (3) long-only funds and short sellers (10.6–14.1% of float per M0.6.2 Block 5) reallocate; (4) the EV/EBITDA multiple compresses toward the cap-constrained blended fair value. The score is 72 rather than higher because the mechanism's force is conditional: management could avoid directly addressing new-car franchise expansion pace on the call, leaving sell-side analysts without the on-record language needed to force model revisions. The magnitude of convergence is also uncertain given the unresolved attribution question (how much of the $53.8B premium is new-car vs. used-car dominance). Neither of these uncertainties affects the trigger date — July 29 is fixed and observable — but they do cap how confidently the four-step chain can be stated to run to completion.

---

## 2. The Blend (visible math)

blended_calculation: 0.40 × 52 + 0.30 × 62 + 0.30 × 72 = **20.80 + 18.60 + 21.60 = 61.00 → final_score 61**

- justification_sentence_1: The edge exists in documented form — the Stellantis acquisition-cap mechanism is real, the numeric departure from priced optionality is large (~$52B), and the primary trigger is a scheduled SEC filing 17 days away — but the variant is weakened by an attribution assumption that cannot yet be proven and a sell-side coverage gap that is only partial.
- justification_sentence_2: A score of 61 puts this in the provisional band: the mechanism is worth pursuing with candidate-surfacing and close monitoring of the July 29 Q2 earnings print, but the full machine is not warranted until the attribution question is answered by management disclosure or a second independent source confirms the cap-adjusted optionality gap.

---

## 3. Routing

- **routing_outcome:** provisional
- **routing_logic:** final_score 61 falls in the 60–80 band → provisional
- **routing_reason:** The Stellantis cap mechanism is documented and the numeric departure is large, but the variant depends on an unproven attribution assumption (how much of the $53.8B EV premium is new-car optionality vs. durable used-car market share), and the sell-side coverage gap is partial. The July 29 Q2 earnings release is a firm, dated trigger that will either strengthen or kill the variant within 17 days — a clear reason to surface candidates and hold at provisional rather than commit the full machine now.

---

## 4. Record State

- locked: true · version: 1 · phase1_completed_at: 2026-07-12T00:00:00Z · falsifiers locked at: 2026-07-12T00:00:00Z
- next_module: candidate-surfacing

---

## Machine Output

Wrote: `screener/runs/SIG-20260711-b55e8917/thesis_record.json` (complete, LOCKED, validates against frameworks/screener/thesis_record.schema.json)
Filed: `screener/ledger/theses/THS-SIG-20260711-b55e8917-v1.json`; events ledger status line appended; board index refreshed.

---

## Routing

Routing: provisional
Edge score: 61
Next module: candidate-surfacing
