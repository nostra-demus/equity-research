# Model Paper-Portfolio — 2026-07-13

*Illustrative model paper-portfolio for research process-tracking — NOT investment advice, NOT real orders.*

**Book:** 0.0% invested / 100.0% cash · 0 positions · 5 on watch · scope all (5 decisions)

## Positions
(none — model book is 100% cash)

## Watch list (size-in triggers)

- **AMZN** (Watchlist) — not held: basket=Watchlist (not Selected); expected return -16.1% <= 0. Size-in trigger: track at $190-200 for re-entry (>12% margin of safety on base fair value $210). Jul-31-2026 Q2 earnings is the first real test of the D&A billing-lag hypothesis — AWS margin holding/expanding falsifies the bear case; AWS margin <30% with T&I costs growing >25% YoY confirms it. Next review 2026-08-09.

- **BG** (Watchlist) — not held: basket=Watchlist (not Selected); expected return -11.5% <= 0; no exploitable edge (edge_score=32). Size-in trigger: do not buy at the indicative ~$123; re-rate to Starter Position Only on a pool-confirmed price below ~$100, or a clean post-Viterra FY2026 cash-conversion print. 30d review (2026-07-01) has lapsed. Next review 2026-08-30.

- **EMAAR** (Starter Position Only) — not held despite basket=Selected and positive expected return (+118.8%): edge_score=40 sits below the ~50 evidence-backed-edge threshold, and no expectations_gap.json exists in the run folder to confirm is_exploitable. The sizing engine excludes the name even though the module's own suggested action recommends a 1-2% starter position — a plausible-but-unproven edge does not get model capital. Size-in trigger: ~Aug-10-2026 Q2 results beat AED 0.47 EPS bar by >=5% (>=AED 0.494) AND no new RPT disclosure above 5% of net assets AND masterplan capex phasing shows peak-year capex <40% of normalised FCF — together would lift edge_score toward 65+ per the module's own edge_proof. Next review 2026-08-02.

- **HCG** (Avoid) — not held: basket=Rejected (not Selected); expected return -13.4% <= 0; no exploitable edge (edge_score=48). Size-in trigger: do not buy at INR 646.15; re-underwrite only at/below INR 520 (base-case low, where a margin of safety begins) or on two consecutive clean prints showing ROIC rising toward the ~11-12% cost of capital. 30d review (2026-07-01) has lapsed. Next review 2026-08-30.

- **TMCV** (Watchlist) — not held: basket=Watchlist (not Selected); expected return -4.4% <= 0. Size-in trigger: no position now; re-rate when the Iveco acquisition financing structure (equity vs debt split, post-deal net debt/EBITDA ceiling) is confirmed and the TMF Holdings AGM vote outcome (was 2026-06-29) is known. 30d review (2026-07-07) has lapsed. Next review 2026-09-05.

## Concentration / correlation
No positions, so no concentration or correlation exposure exists. Across the watch list, BG (commodity/policy-conditional agribusiness), EMAAR (Dubai real estate, policy-conditional), HCG (Indian healthcare, policy/DPCO-exposed), TMCV (Indian auto + Iveco M&A binary), and AMZN (US tech/cloud capex cycle) sit on five distinct thesis vectors — no correlated-bet haircut applies even hypothetically.

## Notes
Zero names clear long-eligibility this cycle. Four of five carry negative probability-weighted expected return (AMZN -16.1%, BG -11.5%, TMCV -4.4%, HCG -13.4%) and are excluded on that basis alone — the math self-zeroes them before any edge test is needed. The fifth, EMAAR, is the interesting case: basket=Selected, decision=Starter Position Only, and a strongly positive expected return (+118.8%, driven by a SOTP mall-segment dislocation), but its edge_score (40) falls short of the ~50 evidence-backed-edge bar and no expectations_gap.json/pre_mortem.json/verification_report.json exist in analyses/EMAAR_2026-07-03/ to independently confirm the edge or clear the verification/pre-mortem gates. EMAAR's own thesis text calls the dislocation "partially a value trap" given the unaligned Dubai Holding ownership (§24 Filter 6) — consistent with excluding it from model capital despite the module's qualitative Starter-Position recommendation. This is the sizing discipline doing its job: a plausible, cited thesis with a real valuation gap still needs a proven edge before it earns weight. The model book is correctly 100% cash with 5 names on watch; the sizing engine will allocate the moment a Selected name clears positive expected return, an evidence-backed edge, and a clean verification/pre-mortem read together.
