# valuation Module Dossier — INDIAMART

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-08-13T19:33:39Z
- Module folder: `valuation`
- Contents: 1 module synthesis + 8 specialist outputs = 9 files

## Table of Contents

- [valuation — module synthesis](#valuation-module-synthesis) — `99_valuation-synthesis.md`
- [valuation / 00_valuation-data-triage.md](#valuation-00-valuation-data-triage-md) — `00_valuation-data-triage.md`
- [valuation / 01_price-and-capital-structure.md](#valuation-01-price-and-capital-structure-md) — `01_price-and-capital-structure.md`
- [valuation / 02_multiples-own-history.md](#valuation-02-multiples-own-history-md) — `02_multiples-own-history.md`
- [valuation / 03_relative-valuation-peers.md](#valuation-03-relative-valuation-peers-md) — `03_relative-valuation-peers.md`
- [valuation / 04_intrinsic-dcf.md](#valuation-04-intrinsic-dcf-md) — `04_intrinsic-dcf.md`
- [valuation / 05_reverse-dcf.md](#valuation-05-reverse-dcf-md) — `05_reverse-dcf.md`
- [valuation / 06_sum-of-the-parts.md](#valuation-06-sum-of-the-parts-md) — `06_sum-of-the-parts.md`
- [valuation / 07_scenario-and-fair-value.md](#valuation-07-scenario-and-fair-value-md) — `07_scenario-and-fair-value.md`


---

## valuation — module synthesis

_Source: `99_valuation-synthesis.md`_

# Valuation Module — INDIAMART (Synthesis)

## Abstract

IndiaMART is fairly valued, not cheap: the triangulated base-case fair value of roughly ₹1,700/share sits about 5% below the current price of ₹1,784.60, leaving no margin of safety today. Bull (₹2,298, +28.8%) and bear (₹1,229, a 31.1% downside-to-bear) bracket that base point, with the intrinsic DCF (weighted 70%) driving the read against a thin, self-flagged low-confidence peer read (30% weight). The reverse-DCF shows the price implies only a 6.0% flat revenue growth rate over eight years — conservative and achievable against the company's own decelerating-but-still-double-digit trend — so the price is not demanding an aggressive story. The biggest downside is the 31% drop to the bear case if customer-acquisition spend resumes while SME demand stays soft; the whole "fairly valued" call also rests heavily on one fragile input, the cost-of-equity beta. Verdict: Fairly valued, watch the beta/WACC assumption and the peer premium closely before adding.

## 1. Valuation Verdict

- **Verdict:** Fairly valued
- **Base-case fair value (point, per share):** ₹1,699 (≈₹1,700; independently-built metric×multiple base and the 70/30 DCF/peers weighted blend converge to within 0.2% — see `07` §2)
- **Current price:** ₹1,784.60 (2026-08-12 close, `pool-verified`, 2 trading days old — no staleness cap)
- **Bull / Base / Bear fair-value levels (points):** Bull ₹2,298 (+28.8% vs price) / Base ₹1,699 (−4.8% vs price) / Bear ₹1,229 (−31.1% downside-to-bear from price)
- **Cross-method dispersion (football field, low–high):** ₹1,233 (peers, `03`) to ₹2,526 (own-history reversion, `02`, illustrative-only) — a 104.9% spread across all five lenses; restricted to the two weighted methods, ₹1,233 (peers) to ₹1,903.5 (DCF) — 54.4% spread
- **Valuation attractiveness /100** *(higher = cheaper)*: **35** — price sits modestly above, not below, the triangulated base case, and the one credible peer cross-section (P/E vs Just Dial/Zarea) finds IndiaMART richly priced, not cheap
- **Margin of safety /100** *(higher = better)*: **20** — margin of safety is negative (−5.0%; price trades slightly above base fair value, no cushion)
- **Valuation confidence /100:** **55** — data completeness is good, but the DCF's own headline number is dominated by a single fragile input (beta: 0.24–0.91 across three vendors, a 4x spread, that alone flips the DCF from +6.7% above price to below it), the sole surviving peer method is self-flagged low-confidence, and the own-history method is excluded outright for a too-short (5-quarter) window
- **Downside risk /100** *(higher = worse)*: **55** — a defensible, evidenced bear case (opex resumption + soft SME demand, both named risks) costs 31.1% from today's price
- **Data quality /100:** **82** — `00` triage returned a "Sufficient" verdict, zero extraction failures, full audited financials/cash flow/consensus/peer data; the caveats are the short (5-quarter) own-history window and a thin, partly-distorted 4-name peer set, not missing data
- **Overall usefulness /100:** **78** — a full triangulation ran (own-history, peers, DCF, reverse-DCF, SOTP), price is pool-verified so every price-relative metric is assessable, and the module explicitly flags its own dominant fragility (beta/WACC) rather than hiding it
- **Dominant valuation method (one line):** Intrinsic DCF (`04`) — the most rigorously built method here (full audited 8-year FCFF build, executed consistency checks, a bounded WACC override), weighted 70% because the two multiples methods are either excluded (`02`, too-short history) or self-flagged low-confidence (`03`, thin/distorted peer set)
- **What's priced in (one line):** ~6.0% flat revenue CAGR over 8 years (FY27–FY34) — below every annual growth rate IndiaMART has posted in 5 years, below its latest (already-decelerated) quarter, and below India's long-run nominal-GDP proxy in every forecast year (`05`)
- **Biggest valuation risk (one line):** the DCF's cost-of-equity beta is genuinely unresolved (0.24 Yahoo / 0.44 median-used / 0.91 TradingView) — at the "conventional beta" WACC of 13.0% the identical DCF produces ₹1,701/share, below today's price, flipping the whole read from "roughly fair" to "modestly rich"

## 1A. Module Disconfirmation

- **Strongest bear point:** at a "conventional beta" WACC (13.0%, the midpoint `business-model/09_moat.md` itself flags as plausible for a comparable small/mid-cap Indian internet name), the identical DCF that underpins 70% of the base case produces ₹1,701/share — below the current ₹1,784.60 price (`04` §6 addendum). Independently, the one credible peer cross-section (P/E vs Just Dial and Zarea, the two names not distorted by the EV/net-cash mechanic) finds IndiaMART priced at an 87.9% premium that its quality edge does not fully earn, implying a peer-based value of only ≈₹1,233 (`03` §4–§6).
- **Strongest bull point:** the reverse-DCF shows the price requires only 6.0% flat revenue growth over 8 years — below every year of the last five, below the latest (already-decelerated) quarter, below India's own long-run nominal-GDP growth proxy in every forecast year, and achievable through ARPU compounding alone even if paying-supplier count mildly shrinks (`05` §2–§3). The bar the market has set is conservative, not aggressive.
- **Single killer risk:** the beta/cost-of-equity input. A 4x vendor dispersion (0.24–0.91) on the same stock, on the same date, single-handedly moves the DCF's answer from "modestly undervalued" to "modestly overvalued" — no growth, margin, or peer assumption in this module moves the number nearly as much (`04` §3, §8; `05` §4).
- **Disconfirming evidence already visible:** IndiaMART's own multiple already sits *below* its entire 5-quarter trailing range on 3 of 5 tracked multiples (EV/EBITDA, EV/EBIT, EV/Sales) — "limited own-history evidence of a floor" (`02` §2, §5); paying-supplier net additions have been negative in 3 of the last 4 quarters (`08_competitive-map.md`, cited in `07` §3, §6); and the moat module's own economic-moat test is "not robust to a more conventional beta assumption" (cited in `04` §3, `07` §5).

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | Sufficient — no active partial-data caps | Pool-verified price, full financials/cash flow, current consensus, and a peer comp set are all present; the only real gaps are a 5-quarter (not 3–5 year) own-history multiple series and a thin, mixed-quality 4-name peer set |
| price-and-capital-structure | Anchor set — price ₹1,784.60, `pool-verified` | 98.7% of the "cash" line is liquid mutual-fund treasury investments, not bank cash — EV/net-debt swings ~₹33.5bn (~45%) between the strict and broad basis; broad basis used as canonical |
| multiples-own-history | De-rated ~31% on EV/EBITDA & EV/EBIT vs a 5-quarter mean, but only ~10% on P/E; own-history table excluded from `07`'s method set | Current level sits below the entire 5-quarter trailing range on 3 of 5 multiples — no "floor" evidence in the observed window; reversion figures are illustrative-only, not a fair-value input |
| relative-valuation-peers | Premium unjustified (relative downside) on the one credible cross-section; low-confidence overall | IndiaMART trades at an 87.9% P/E premium to Just Dial/Zarea that its quality edge does not fully earn; peer-implied value ≈₹1,233/share |
| intrinsic-dcf | Base case ≈₹1,903.5/share (+6.7% vs price), but flips to ₹1,701 (below price) at a "conventional beta" WACC of 13.0% | The single most consequential input is the beta/WACC estimate, not growth or margin — a genuinely 4x vendor dispersion (0.24–0.91) |
| reverse-dcf | Price implies ~6.0% flat 8-year revenue CAGR — conservative, achievable | The market's implied bar sits below every year of the last five years' growth and below India's long-run nominal-GDP proxy in every forecast year |
| sum-of-the-parts | Single-segment collapse — ₹1,825.5/share, circular by construction | No hidden segment value; the only real pickup versus a bare consolidated multiple is the ~₹46/share Simply Vyapar equity-method stake |
| scenario-and-fair-value | Base ₹1,699 (−5.0% margin of safety); Bull ₹2,298; Bear ₹1,229 (31.1% downside-to-bear) | Base case sits modestly *below* today's price even after weighting 70% toward the more favorable DCF read |

## 3. Reconciliation

The full cross-method spread (₹1,233 to ₹2,526, a 104.9% range) is wide, but most of that width is not a genuine disagreement about value — it is two methods (`02` own-history, `06` SOTP) that this module's own specialists flagged as unusable for the base point (illustrative-only on a too-short window; circular-by-construction on a collapsed single segment) and that carry 0% weight for exactly that reason. The real disagreement is narrower but still material: the two methods that DO carry weight, `04` (DCF, ₹1,903.5, 70% weight) and `03` (peers, ₹1,233, 30% weight), disagree by 54.4% — over the 40% Reconciliation Gate threshold. `07` explicitly reconciles this rather than averaging blind: it trusts `04` more because it rests on a full audited 8-year cash-flow build with executed consistency checks and a bounded, justified WACC override, versus `03`'s thin, partly-distorted 4-name peer set (two of four names' EV multiples are flagged not meaningful). Because this disagreement is explicitly reconciled with a stated reason (not silently averaged or left unaddressed), the ">40% unreconciled" score cap does not mechanically apply here — but the underlying fragility it points at (DCF's own beta sensitivity) is real and is reflected in the confidence score above, not waved away.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N — price is `pool-verified`, 2 trading days old | — | Not applied |
| No consensus / forward estimates | N — full consensus (15–18 analysts, NTM through FY2030E) present | — | Not applied |
| No peer data | N — a 4-name peer comp set is present (though thin/mixed-quality, addressed in confidence, not this cap) | — | Not applied |
| Only one valuation method usable | N — four methods produced values, plus a reverse-DCF cross-check | — | Not applied |
| No cash flow AND DCF is only method | N — full audited cash flow statement present; DCF is not the only method | — | Not applied |
| SOTP not possible for multi-segment | N/A — IndiaMART is effectively single-segment (>85% of EBIT from one segment); SOTP collapse is a business-structure fact, not a data gap, per the Segment/SOTP Rule | Not applied |
| Methods disagree >40% unreconciled | N — the 54.4%-disagreeing methods (`03`/`04`) are explicitly reconciled with a stated reason (§3 above), not left unaddressed | Not applied (fragility instead reflected in the confidence score) |
| Terminal value >75% of DCF EV | N — headline exit-multiple method carries TV at 58.0% of EV (Gordon cross-check at 69.5% is retained only as an upper-bound, not the headline) | Not applied |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | Not assessable — the management-governance module does not exist in this run root (`analyses/INDIAMART_2026-08-14/management-governance/` is absent); `02` and `07` both flag this explicitly and defer the check to the master synthesizer | Deferred — no cap applied here, but the master synthesizer must confirm no RF-OWN-004 flag before crediting any part of the current de-rating as a mean-reversion opportunity |

No score caps from the MODULE_RULES.md table are mechanically triggered on this run. This is a standalone valuation run — the §24 Filter 6 unaligned-owner value-trap adjudication could not be checked against management-governance module output and is explicitly deferred (see table row above and Note to Final Synthesizer).

## 5. Fair-Value Summary

The triangulated fair-value levels are Bull ₹2,298, Base ₹1,699, Bear ₹1,229 — a base point that sits modestly (4.8%) below, not above, today's ₹1,784.60 price, driven 70% by the intrinsic DCF (`04`) and 30% by the peer relative read (`03`), after the own-history and SOTP methods were excluded as unusable for a base-case input (too-short window; circular collapse). The current price implies only a 6.0% flat revenue growth rate over the next 8 years — the earnings-module evidence (double-digit growth in every one of the last 5 years, ARPU compounding ~8%/yr) says that bar is conservative and clearly achievable, so the price is not demanding an aggressive growth story to be justified. The margin of safety is negative (−5.0%: no cushion, price already trades slightly above the base case), while the downside to the bear case is 31.1% — these are two separate and genuinely different reads, and the module is right to keep them apart: an investor buying today has essentially no cushion if the base case is exactly right, but a real, evidenced 31% loss if the bear case (opex resumption colliding with soft SME demand) plays out. Whether the current ~31% EV/EBITDA discount to the stock's own (short) trailing history is a value-trap or a genuine opportunity cannot be fully resolved here: `business-model/09_moat.md`'s own verdict is a Narrow, borderline-durable moat (the economic-moat test only clears WACC on a low beta assumption), competitive intensity and cyclicality both score "Mixed" (45/100), and paying-supplier net adds have turned negative in 3 of the last 4 quarters — evidence consistent with at least part of the de-rating being warranted, not a pure mispricing waiting to revert.

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Fairly valued | A confirmed reversal of the 3-of-4-quarter negative net-supplier-adds trend (supports the bull case's multiple expansion); a resolved, lower beta estimate (converging vendors toward the 0.24–0.44 end, which would lift `04`'s base case materially above price); evidence the ~88% P/E premium over Just Dial/Zarea is earned by a wider moat than currently scored | A confirmed shift to the "conventional beta" WACC (13.0%, which alone flips DCF to ₹1,701, below price); customer-acquisition opex resuming to management's own guided ~₹10cr/qtr run-rate while SME demand stays soft (the named compounding-bear scenario); a 3-to-5-year own-history multiple series (currently only 5 quarters exist) revealing the current level as an anomaly rather than a floor | A longer (3–5 year) own-history multiples series; a cleaner, larger same-country peer set (TradeIndia, management's own named "nearest" competitor, is private with no public multiples); a resolved beta estimate (a single audited or vendor-consensus beta rather than a 0.24–0.91 range); confirmation of, or absence of, an RF-OWN-004 unaligned-owner flag from the management-governance module |

## 7. Note To The Final Synthesizer

- **Fair-value levels:** Bull ₹2,298 (+28.8% vs price) / Base ₹1,699 (−4.8% vs price) / Bear ₹1,229 (31.1% downside-to-bear). The dominant method is the intrinsic DCF (`04`, 70% weight), cross-checked (not weighted) by the reverse-DCF (`05`).
- **What the price implies:** ~6.0% flat revenue CAGR over 8 years — below every year of the company's last 5 years of growth, below its latest quarter, and below India's long-run nominal-GDP proxy in every forecast year. Reads as achievable, even conservative, against earnings-module evidence.
- **Margin of safety vs downside-to-bear — two separate numbers, both matter:** margin of safety is **negative**, −5.0% (no cushion; price already sits slightly above the base case). Downside-to-bear is **31.1%** (the loss if the bear case — opex resumption colliding with soft SME demand — plays out). Do not conflate the two.
- **Genuine value or value-trap risk:** unresolved from this module alone. The ~31% de-rating on EV/EBITDA versus a short (5-quarter) own-history window is only partly explained by fundamentals (decelerating growth, margin compression) — `business-model/09_moat.md`'s Narrow, borderline-durable moat verdict and Mixed (45/100) competitive-intensity/cyclicality scores argue against assuming full mean-reversion. **RF-OWN-004 (misaligned controlling owner) could not be checked** — the management-governance module does not exist in this run root — and the master synthesizer must confirm no such flag exists before crediting any part of this discount as a margin of safety rather than a warranted de-rating.
- **Which method to trust / discount:** trust `04` (intrinsic DCF) most — it is the most rigorously built (full audited 8-year cash-flow model, executed consistency checks, bounded WACC override) — but discount its precision: it is dominated by a single unresolved input (beta, 0.24–0.91 across vendors, a 4x spread) that alone flips the answer from above to below price. Discount `03` (peers) for its thin, partly-distorted 4-name comp set (2 of 4 names' EV multiples flagged not meaningful). Do not use `02` (own-history, excluded — 5-quarter window too short) or `06` (SOTP, circular by construction on a collapsed single segment) as base-case inputs.
- **Partial-data caps:** none from the MODULE_RULES table triggered mechanically on this run (price is pool-verified and fresh, full consensus/cash-flow/capital-structure data exists). The one structural limitation is the RF-OWN-004 deferral noted above, and the module's own confidence score (55/100) already reflects the beta/WACC and thin-peer-set fragility without a formal cap.
- **Biggest missing data point (single highest-value next request):** a 3–5 year own-history multiples series for IndiaMART (only 5 quarters exist in this pool) — this would let `02`'s reversion read actually feed the base case instead of sitting excluded as illustrative-only, and would materially sharpen whether the current de-rating is a floor or a new normal.
- **Explicit handoff:** the master synthesizer's "Valuation and Peer Mispricing" section should defer to this synthesis. The bull/base/bear fair-value LEVELS above (₹2,298 / ₹1,699 / ₹1,229) are the inputs for the master's own probability-weighted scenario model — this module assigns no probabilities and computes no expected return; that is the master's job.

## 8. Simple Summary

- Not cheap: the base-case fair value (≈₹1,700/share) sits about 5% *below* today's price (₹1,784.60) — there is no cushion right now.
- Bull ₹2,298 (+28.8%) / Base ₹1,699 (−4.8%) / Bear ₹1,229 (31.1% downside-to-bear) — a wide but honestly-reconciled spread.
- The market is pricing in only ~6% flat revenue growth over 8 years — a conservative, easily-clearable bar given the company's own recent (double-digit) growth.
- The downside sits 31% below today's price if customer-acquisition spending resumes while small-business demand stays soft — a named, evidenced risk, not a hypothetical.
- The intrinsic DCF is the method to trust most here, but its own answer flips from "modestly cheap" to "modestly rich" depending on which of three very different beta estimates (0.24 to 0.91) is used — that single input matters more than growth or margin assumptions.
- Possible value-trap risk: the stock has de-rated ~31% on EV/EBITDA versus its own (short) recent history, but a Narrow, borderline moat and Mixed competitive-intensity scores suggest at least part of that de-rating is deserved, not a pure discount.
- A current, pool-verified price was available (₹1,784.60, 2026-08-12 close) — no price-related score caps applied.
- This module is useful for the master synthesizer: a full triangulation ran, the biggest fragility (beta/WACC) is disclosed rather than hidden, and the one open question (RF-OWN-004 unaligned-owner check) is explicitly flagged for the master to resolve, not silently dropped.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — INDIAMART

## 1. File Inventory

Note on dates: every file in `data/INDIAMART/` shares the same filesystem last-modified date (2026-08-13), which is the Drive-sync date for this pool, not the document's real vintage (CLAUDE.md §27 fix F23). "Period Covered" below is read from inside each document (filing subject line, fiscal-period header, or CIQ export header), not the file timestamp. `_pool_extracts/manifest.json` reports **0 extraction failures** across 38 workbooks (81 tabs) + 47 non-workbook files (128 extract files total) — no source is downgraded to "missing" for extraction failure (fix F03). No `ciq_facts.json` sidecar exists for this run, so headline figures below are this agent's own sourced reads of the CIQ workbooks, cited per §5.

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf | Annual filing — full Integrated Annual Report + AGM Notice | FY ended Mar 31, 2026 (27th AGM notice Jun 29, 2026) | 2026-08-13 (sync) | High |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf | Annual filing (results-announcement version) | FY ended Mar 31, 2026 | 2026-08-13 (sync) | High |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Annual_Report(Apr-30-2026).pdf | Annual filing (preliminary) | FY ended Mar 31, 2026 | 2026-08-13 (sync) | Medium (superseded by final) |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-29-2025).pdf | Annual filing | FY ended Mar 31, 2025 | 2026-08-13 (sync) | High (prior-year comparable) |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf | Quarterly filing | Q1 FY27 (qtr ended Jun 30, 2026) — most recent quarterly filing | 2026-08-13 (sync) | High |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jul-21-2026).pdf | Quarterly filing (exchange intimation, preliminary) | Q1 FY27 (qtr ended Jun 30, 2026) | 2026-08-13 (sync) | Medium (superseded by final) |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jan-20-2026).pdf | Quarterly filing | Q3 FY26 (qtr ended Dec 31, 2025) | 2026-08-13 (sync) | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-20-2026).pdf | Quarterly filing (preliminary) | Q3 FY26 | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Oct-17-2025).pdf | Quarterly filing | Q2 FY26 (qtr ended Sep 30, 2025) | 2026-08-13 (sync) | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Oct-17-2025).pdf | Quarterly filing (preliminary) | Q2 FY26 | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-18-2025).pdf | Quarterly filing | Q1 FY26 (qtr ended Jun 30, 2025) | 2026-08-13 (sync) | Medium |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jul-18-2025).pdf | Quarterly filing (preliminary) | Q1 FY26 | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-21-2025).pdf | Quarterly filing (preliminary) | Near-duplicate of Jan-22-2025 filing | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Jan-22-2025).pdf | Quarterly filing (preliminary) | Q3 FY25 (qtr ended Dec 31, 2024) | 2026-08-13 (sync) | Low (duplicate, superseded) |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Interim_Report(Apr-29-2025).pdf | Quarterly filing (preliminary) | Q4/FY25 (year ended Mar 31, 2025) | 2026-08-13 (sync) | Low (superseded by final Annual Report FY25) |
| 22 Earnings Call transcripts (Q3 FY21 → Q1 FY27, Jan-2021 to Jul-2026) | Transcripts | Quarterly, unbroken ~5.5-year series | 2026-08-13 (sync) | Medium (management tone / guidance color for DCF assumptions) |
| IndiaMART InterMESH Limited - ShareholderAnalyst Call.pdf | Transcript (AGM shareholder/analyst call) | Jun 20, 2024 | 2026-08-13 (sync) | Low |
| **Company Comparable Analysis IndiaMART InterMESH Limited.xls** | Multi-tab workbook — see rows below | As-of 2026-08-13 | 2026-08-13 (sync) | High |
| — tab: Financial Data | Peer financial data export | Current + historical | 2026-08-13 (sync) | High |
| — tab: Trading Multiples | **Peer/comps multiples export** | As-of 2026-08-13 | 2026-08-13 (sync) | High |
| — tab: Operating Statistics | Peer operating stats | As-of 2026-08-13 | 2026-08-13 (sync) | Medium |
| — tab: Business Description | Business description | — | 2026-08-13 (sync) | Low |
| — tab: Implied Valuation | **Peer-multiple implied valuation bridge** | As-of 2026-08-13 | 2026-08-13 (sync) | High |
| — tab: Valuation Chart | Historical valuation chart data | — | 2026-08-13 (sync) | Medium |
| — tab: Credit Health Panel | Peer credit summary | — | 2026-08-13 (sync) | Low |
| — tab: Disclaimer | Boilerplate | — | 2026-08-13 (sync) | None |
| **IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls** | Multi-tab workbook — see rows below | — | 2026-08-13 (sync) | High |
| — tab: Consensus | **Consensus/estimate export** (523×32) | Current, FY27E–FY30E + CY | 2026-08-13 (sync) | High |
| — tab: Recent Changes | Estimate revision history | Trailing periods | 2026-08-13 (sync) | Medium |
| — tab: Multiples | **Forward multiples export (NTM, FY27–FY30E, CY26–CY29E)** | Current fiscal year end Mar-31-2027 | 2026-08-13 (sync) | High |
| — tab: Surprise | Historical beat/miss data | Multi-quarter | 2026-08-13 (sync) | Medium |
| — tab: Trends | Estimate trend history | Multi-quarter | 2026-08-13 (sync) | Medium |
| — tab: Revisions | Analyst-level revision log | Multi-quarter | 2026-08-13 (sync) | Medium |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport (1).xls | Duplicate workbook — tab: Consensus only | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| **IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls** | Multi-tab workbook (13 tabs) — see rows below | — | 2026-08-13 (sync) | High |
| — tab: Key Stats | **Current capitalization, share price, EV bridge, valuation multiples** | Price as of latest close; FY ends Mar-31-2023A→2029E | 2026-08-13 (sync) | High |
| — tab: Income Statement | **Income statement, incl. diluted EPS & diluted share count** | FY2021A–FY2026A + LTM Jun-2026 | 2026-08-13 (sync) | High |
| — tab: Balance Sheet | **Balance sheet** | FY2021A–FY2026A + LTM Jun-2026 | 2026-08-13 (sync) | High |
| — tab: Cash Flow | **Cash flow statement** | FY2022A–FY2026A + LTM Jun-2026 | 2026-08-13 (sync) | High |
| — tab: Multiples | Own-history multiples (trailing) | Multi-year | 2026-08-13 (sync) | High |
| — tab: Historical Capitalization | **Quarterly price/share count/EV history** (6 quarters, Mar-25→Jun-26) | Quarterly | 2026-08-13 (sync) | High |
| — tab: Capital Structure Summary | **Capital structure, net debt/net cash** | FY2025A, FY2026A, Q1 FY27 | 2026-08-13 (sync) | High |
| — tab: Capital Structure Details | Debt instrument detail (lease liabilities only) | FY2025, FY2026 | 2026-08-13 (sync) | Medium |
| — tab: Ratios | Financial ratios incl. dividend per share | Multi-year | 2026-08-13 (sync) | Medium |
| — tab: Supplemental | Supplemental financial data | Multi-year | 2026-08-13 (sync) | Low |
| — tab: Industry Specific | Industry-specific metrics | Multi-year | 2026-08-13 (sync) | Low |
| — tab: Pension OPEB | Pension/OPEB (not applicable — India) | — | 2026-08-13 (sync) | None |
| — tab: Segments | **Segment revenue & EBITDA** | FY2021A–FY2026A | 2026-08-13 (sync) | High |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls | Duplicate workbook — same 13 tabs as Financials (1).xls | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Balance Sheet.xls | Standalone duplicate — tab: Balance Sheet | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Capital Structure Details.xls | Standalone duplicate — tab: Capital Structure Details | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Capital Structure Summary.xls | Standalone duplicate — tab: Capital Structure Summary | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Cash Flow.xls | Standalone duplicate — tab: Cash Flow | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Income Statement (1).xls | Standalone duplicate — tab: Income Statement | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Income Statement.xls | Standalone duplicate — tab: Income Statement | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Key Stats.xls | Standalone duplicate — tab: Key Stats | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Pension OPEB.xls | Standalone duplicate — tab: Pension OPEB | — | 2026-08-13 (sync) | None |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Ratios.xls | Standalone duplicate — tab: Ratios | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Segments.xls | Standalone duplicate — tab: Segments | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials Supplemental.xls | Standalone duplicate — tab: Supplemental | Same as above | 2026-08-13 (sync) | Low (duplicate) |
| IndiaMART InterMESH Limited NSEI INDIAMART Fixed Income Securities Summary.xls | Fixed-income securities summary | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Comparable M A Transactions.xls | M&A comps | Historical deal list | 2026-08-13 (sync) | Medium |
| Transaction Summary M A Private Placements.xls | M&A / private placement transaction log | Historical | 2026-08-13 (sync) | Low |
| Transaction Summary Public Offerings.xls | Public offerings log | Historical | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Credit Health Panel.xls | Multi-tab workbook (5 tabs: Summary, Financials, Operational/Solvency/Liquidity charts, Disclaimer) | Current | 2026-08-13 (sync) | Medium |
| IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls | Multi-tab workbook (3 tabs) — subsidiary/investment structure | Current | 2026-08-13 (sync) | Medium (Busy Infotech / equity-method investees, informs EV bridge) |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Co Investors.xls | Co-investor list | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Direct Investments.xls | Direct investments (equity-method stakes) | Current | 2026-08-13 (sync) | Medium (EV bridge — equity-method investments) |
| IndiaMART InterMESH Limited NSEI INDIAMART Analyst Coverage.rtf | Broker coverage/rating roster | Current | 2026-08-13 (sync) | Medium |
| IndiaMART InterMESH Limited NSEI INDIAMART Long Business Description.rtf | Business description | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Public Company Profile.rtf | Company profile | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Industry Classifications.rtf | Industry classification | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Private Ownership.rtf | Private ownership data | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Public Ownership Summary.rtf | Public/institutional ownership data | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Board Members.xls / Committees.xls / Compensation Summary Compensation.xls / Auditors.xls | Governance data exports | Current | 2026-08-13 (sync) | Low (governance module's remit, not valuation) |
| IndiaMART InterMESH Limited NSEI INDIAMART Competitors.xls / Products.xls / Customers.xls / Suppliers.xls / Strategic Alliances.xls / Corporate Timeline.xls / Key Developments.xls / Events Calendar.xls / Professionals.xls / Transaction Advisors.xls / Offices.rtf / Transcripts.xls (index) | Corporate reference data | Current/historical | 2026-08-13 (sync) | Low |

**Reconciliation vs manifest:** `_pool_extracts/manifest.md` lists 38 workbooks → 81 tabs; every tab above is reconciled 1:1 against that manifest. Several `.xls` files are standalone-duplicate exports of tabs already embedded in the master `Financials (1).xls` / `Financials.xls` workbooks (Balance Sheet, Cash Flow, Income Statement, Key Stats, Ratios, Segments, Supplemental, Capital Structure Summary/Details, Pension OPEB) — flagged as duplicates, not counted twice toward sufficiency. `EstimatesReport (1).xls` is a partial duplicate of `EstimatesReport.xls` (Consensus tab only; the full workbook has 6 tabs).

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | India — NSE: INDIAMART, BSE: 542726 | `FY26 Annual Report (Ind AS), Jun-02-2026`; `Financials.xls, Key Stats tab` header "NSEI:INDIAMART" |
| Filing regime | India — SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015, Reg 30/33/34 | Cross-referenced from `earnings/00_earnings-data-triage.md` §0, itself citing `Q1 FY27 Board-outcome intimation, Jul-21-2026` |
| Reporting standard | Ind AS (Indian Accounting Standards, Companies Act 2013 Sec. 133) | `FY26 Annual Report, Jun-02-2026`, Auditor's Report; CIQ `EstimatesReport.xls, Multiples tab` header states "Acctg. Standard: India GAAP" (CIQ's label for Ind AS) |
| Reporting currency (and scale) | INR; filings state ₹ crore/lakh with absolute figures; CIQ exports in ₹ millions | `Financials (1).xls, Income Statement tab` — "Currency: INR", "In Millions of the reported currency" |
| Fiscal-year end | March 31 | `FY26 Annual Report, Jun-02-2026`: "financial year ended March 31, 2026"; `Financials (1).xls, Key Stats tab`: "12 months Mar-31-2026A" |
| Document language(s) | English (all filings, transcripts, and CIQ exports in this pool are English; no non-English source documents found) | Full pool review |

No US SEC form (10-K/10-Q/8-K) is expected or present for this Indian issuer; the local equivalents (Annual Report, SEBI LODR quarterly results, Reg 30 exchange intimations) are used throughout and are NOT treated as missing data (CLAUDE.md §27). No non-English document exists in this pool, so the §27 "language is not a data gap" rule is not triggered on this run.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, vs run date 2026-08-14) |
|---|---|---|---|
| Annual filing | `IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf` | FY ended Mar 31, 2026 | ~2.4 months |
| Quarterly filing | `IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf` | Q1 FY27, qtr ended Jun 30, 2026 | <1 month |
| Capital structure / balance sheet | `Financials (1).xls`, Balance Sheet + Capital Structure Summary tabs | Q1 FY27 (Jun 30, 2026) — quarterly cadence to Jun-2026 | <1 month |
| Consensus / estimate export | `IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls`, Consensus tab | Current, FY27E–FY30E; revisions current through late Jul 2026 (per earnings module cross-check) | <1 month |
| Multiples export | `IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls`, Multiples tab; `Financials (1).xls`, Key Stats/Multiples tabs | Current fiscal year end Mar-31-2027; price data as of latest close | <1 month |
| Peer / comps export | `Company Comparable Analysis IndiaMART InterMESH Limited.xls`, Trading Multiples + Implied Valuation tabs | As-of 2026-08-13 | 1 day |
| Current price (IBKR / Capital IQ) | `Financials (1).xls`, Key Stats tab — Capital IQ share price | ₹1,784.60 (latest close referenced in the Key Stats capitalization block; comps workbook As-Of Date 2026-08-13) | ~1 day |
| Cash flow statement | `Financials (1).xls`, Cash Flow tab | FY2022A–FY2026A + LTM Jun-2026 | <1 month (LTM) |
| Segment data | `Financials (1).xls`, Segments tab | FY2021A–FY2026A | ~2.4 months (latest annual segment split) |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | `Financials (1).xls, Key Stats tab` — ₹1,784.60; comps workbook As-Of Date 2026-08-13 [Capital IQ Key Stats export, data as of 2026-08-13] | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | `Financials (1).xls, Income Statement tab` — "Weighted Avg. Diluted Shares Out." 60.29m (FY26); Key Stats "Shares Out." 60.13m (latest as-reported) | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Partial — Y (diluted share count reported; no granular options/RSU strike-price schedule found in this pool) | `Financials (1).xls, Income Statement tab` (diluted vs basic EPS/shares reconciled); no treasury-stock-method detail workbook found | Needed for fully diluted per-share fair value; basic-to-diluted gap here is small (~60.13m basic vs ~60.29m diluted, <0.3%), so the limitation is minor |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y | `business-model/99_business-model-synthesis.md` — "India-focused, subscription-funded B2B online marketplace"; single reportable operating segment (Web and Related Services, 92% of FY26 revenue) plus a small consolidated software subsidiary | Determines which valuation methods are valid — this is an Operating company |
| Total debt, cash, minority/preferred | Y | `Financials (1).xls, Capital Structure Summary tab` — Total Debt ₹216.28m (lease liabilities only), Cash & ST Investments ₹33,886.58m, Net Debt −₹33,670.3m (net cash), no minority interest or preferred equity disclosed | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | `Financials (1).xls, Income Statement tab` — FY2021A–FY2026A + LTM Jun-2026 | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | `Financials (1).xls, Cash Flow tab` — FY2022A–FY2026A + LTM Jun-2026 | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | `EstimatesReport.xls, Consensus + Multiples tabs` — NTM, FY2027E–FY2030E, CY2026E–CY2029E, 15–18 analysts covering per earnings-module cross-check | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | `Financials (1).xls, Multiples tab` + `Key Stats tab` — trailing TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E, P/BV back to FY2023A | Own-history re-rating read |
| Peer / comps data | Y | `Company Comparable Analysis ....xls, Trading Multiples + Implied Valuation tabs` — 6-company comp set (Just Dial, Info Edge/Naukri, Eternal/Zomato, Zhejiang NetSun, Zarea, Yangtze River) | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y (revenue & EBITDA; no segment EBIT/EBIT-margin line separately disclosed) | `Financials (1).xls, Segments tab` — Web and Related Services + Accounting Software Services, FY2021A–FY2026A | Sum-of-the-parts (business is effectively single-segment — see §6A) |
| Dividend / buyback data | Y | `Financials (1).xls, Ratios tab` — Dividend per Share history; `Financials (1).xls, Cash Flow tab` — "Repurchase of Common Stock" ₹1,232.6m (FY24), ₹6,161.9m (FY25) | Shareholder-yield read |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/03_segment-map.md | Y (`analyses/INDIAMART_2026-08-13/business-model/03_segment-map.md`) |
| business-model/08_competitive-map.md | Y (`analyses/INDIAMART_2026-08-13/business-model/08_competitive-map.md`) |
| business-model/07_business-quality.md | Y (`analyses/INDIAMART_2026-08-13/business-model/07_business-quality.md`) |
| business-model/09_moat.md | Y (`analyses/INDIAMART_2026-08-13/business-model/09_moat.md`) |
| business-model/10_external-dependency.md | Y (`analyses/INDIAMART_2026-08-13/business-model/10_external-dependency.md`) |
| earnings/01_historical-financials.md | Y (`analyses/INDIAMART_2026-08-13/earnings/01_historical-financials.md`) |
| earnings/04_guidance-consensus.md | Y (`analyses/INDIAMART_2026-08-13/earnings/04_guidance-consensus.md`) |
| earnings/03_margin-drivers.md | Y (`analyses/INDIAMART_2026-08-13/earnings/03_margin-drivers.md`) |
| earnings/07_earnings-sensitivity.md | Y (`analyses/INDIAMART_2026-08-13/earnings/07_earnings-sensitivity.md`) |
| earnings/06_earnings-quality.md | Y (`analyses/INDIAMART_2026-08-13/earnings/06_earnings-quality.md`) |

Both upstream modules returned a "Sufficient" data verdict with zero active partial-data caps (per their `99` syntheses), so this valuation module inherits a fully populated evidence base for warranted-multiple, cyclicality, and moat judgments. Note: the cross-module run is dated 2026-08-13, one day before this valuation run (2026-08-14); no material staleness.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N — pool-verified price present (₹1,784.60, Capital IQ Key Stats, as-of consistent with the comps workbook's 2026-08-13 As-Of Date, 1 day before run date) | 01, 05, 07, 99 | Not applied |
| No consensus / forward estimates | N — full consensus and forward-multiples export present (NTM through FY2030E/CY2029E, 15–18 analysts) | 02, 03, 04, 05 | Not applied |
| No peer data | N — 6-company comp set present (Trading Multiples + Implied Valuation tabs), though 2 of 6 peers show NM/blank multiples and the set spans very different business models (see §6 caveat) | 03, 06 | Not applied |
| No segment-level data | N — segment revenue and EBITDA present FY2021A–FY2026A, though the business is effectively single-segment (92% of FY26 revenue/EBITDA from Web and Related Services) | 06 | SOTP collapses to consolidated read per Segment/SOTP Rule — not a data gap, a business-structure fact |
| No balance sheet / capital structure | N — full balance sheet + capital structure detail present at quarterly cadence through Jun-2026 | 01, 04, 06 | Not applied |
| No cash flow statement | N — full annual + LTM + quarterly cash flow statements present | 04 | Not applied |

No partial-data caps from the MODULE_RULES.md table are triggered on this run.

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Trailing TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E, P/BV available FY2023A→LTM Jun-2026 and forward FY2027E–FY2029E, from `Financials (1).xls, Key Stats/Multiples tabs` |
| Peer relative valuation | Y (with caveat) | None blocking, but comp-set quality is mixed | 6-name comp set (Just Dial, Info Edge/Naukri, Eternal/Zomato, Zhejiang NetSun, Zarea, Yangtze River) spans classifieds, hyperlocal listings, food delivery, and a name with no data (Yangtze River) — `03_relative-valuation-peers` must select/weight comparables carefully rather than using the raw mean/median, and should cross-check against `business-model/08_competitive-map.md`'s named peers |
| Intrinsic DCF (Operating FCFF) | Y | None | Full income statement + cash flow statement (CFO, capex) available FY2022A–FY2026A + LTM; `earnings/01_historical-financials.md` and `earnings/03_margin-drivers.md` supply the margin/growth base |
| Reverse DCF | Y (conditional on `04` running first) | Depends on `04`'s canonical WACC + normalized FCF base per MODULE_RULES §9 | Pool-verified current price is available, so "what's priced in" is computable once `04` runs |
| SOTP | Partial — collapses to single-segment read | Business is >85% EBIT-concentrated in one segment (Web and Related Services) | Per the Segment/SOTP Rule, `06` should state "single-segment — SOTP collapses to the consolidated read" rather than force a spurious breakup of the small loss-making Accounting Software Services subsidiary |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A pool-verified current price, full income statement and cash flow statement, complete capital-structure/net-debt data, current consensus forward estimates, and a peer comps export are all present with zero extraction failures — every input the sufficiency rule requires is available, and at least four of five valuation methods can run.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (FCFF), reverse-DCF (once `04` runs). SOTP is available only in its collapsed single-segment form per the Segment/SOTP Rule — the company is not a genuine multi-segment conglomerate (Web and Related Services is 91.96% of FY26 revenue and >100% of segment profit, per `business-model/03_segment-map.md`).
- **Active partial-data caps:** None.
- **Critical missing items:** None. Minor limitation only: no granular options/RSU treasury-stock-method schedule was found in this pool (the basic-to-diluted share gap is small, ~60.13m vs ~60.29m, so `01_price-and-capital-structure` can default to the disclosed weighted-average diluted share count per the Fully Diluted Equity Rules fallback, with the limitation labelled).



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — INDIAMART

**Jurisdiction / reporting regime:** India (NSE: INDIAMART). Reporting standard Ind AS (India's IFRS-converged standard). Fiscal year ends 31 March. Reporting currency INR (all figures in ₹ millions unless stated; 1 crore = 10 million). Local-equivalent documents used: Annual Report (Ind AS) in place of a 10-K, and quarterly results filed under SEBI LODR Reg. 33 in place of a 10-Q.

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | ₹1,784.60 | Capital IQ Financials export ("Key Stats" / "Historical Capitalization" sheets), close price used for TEV/market-cap calc [`IndiaMART InterMESH Limited NSEI INDIAMART Financials.xls`]; corroborated as "Previous Close" on Capital IQ Public Company Profile snapshot | 2026-08-12 (stated explicitly on the CIQ export: "TEV and Market Cap are calculated using a close price as of Aug-12-2026") |
| Currency | INR | — | — |
| Price basis | Last close (confirmed close, not intraday) | Capital IQ Public Company Profile [`IndiaMART InterMESH Limited NSEI INDIAMART Public Company Profile.rtf`] | Snapshot last updated 2026-08-13 05:18 AM (GMT-5) |

**Price staleness.** Run date 2026-08-14; quote as-of 2026-08-12. Age ≈ 2 calendar days = 2 trading days (Wed 12 Aug → Fri 14 Aug, no weekend in between). This is well inside the 5-trading-day freshness threshold — no refresh attempt or staleness cap needed. This is a genuine, disclosed as-of date (the export states it explicitly), not merely a file-download date, so it does not fall into the "vendor-export freshness unconfirmed" case.

Note: the same Capital IQ profile snapshot also shows a "Last (Delayed)" intraday tick of ₹1,797.90 (delayed ≥20 minutes, captured during the 2026-08-13 trading session). That figure is NOT used here — it is an unconfirmed intraday print, not a close, and mixing it with the EV bridge (which the vendor itself computed off the 2026-08-12 close) would break internal consistency. The anchor price is the confirmed 2026-08-12 close of ₹1,784.60.

**Price-state tag: `pool-verified`.**

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of 2026-06-30, filing date 2026-07-21) | 60,133,558 | Q1 FY27 interim results (SEBI LODR), filed 2026-07-21 [`IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf`]; cross-checked against Capital IQ Balance Sheet / Key Stats sheets (identical) |
| Weighted-average basic shares (LTM to 2026-06-30) | 60,052,232 | Capital IQ Income Statement sheet, LTM column |
| Weighted-average diluted shares (FY26, year ended 2026-03-31) | 60,259,902 | FY26 Annual Report (Ind AS), Note on EPS: "Weighted average number of equity shares in calculating diluted EPS (C)" = 6,02,59,902 [`IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf`] |
| Weighted-average diluted shares (LTM to 2026-06-30) | 60,291,720 | Capital IQ Income Statement sheet, LTM column (consistent with the FY26 filing figure above, rolled forward one quarter) |
| Options/RSUs outstanding | Effectively nil — 0 ESOP options outstanding at 2026-03-31 (versus 13,868 at 2025-03-31); 27,184 shares issued on ESOP exercise during FY26 | FY26 Annual Report (Ind AS), ESOP note [`...Annual_Report(Apr-30-2026).pdf`] |
| Convertibles / potential shares | None disclosed — Capital Structure Details sheet marks the company's only capital-structure item (lease liabilities) "Convertible: No"; no convertible debt or preference shares issued by the company itself (CCPS references in the filings are IndiaMART's own investments INTO other companies as an investor, not instruments it has issued) | Capital IQ Capital Structure Details sheet; FY26 Annual Report |
| **Fully diluted shares (TSM + if-converted)** | ~60,291,720 (LTM weighted-average diluted; treasury-stock-method dilution for ESOPs already applied by the company, per Ind AS) | As above |
| Share count used for market cap | 60,133,558 (basic, period-end, 2026-06-30) | Matches Capital IQ market-cap calculation |
| Share count used for per-share fair value | 60,291,720 (LTM weighted-average diluted) | Best available fully-diluted proxy; no period-end fully-diluted count is separately disclosed |

The gap between basic and diluted is small (~0.26%) and shrinking — the ESOP pool is essentially exhausted (nil options outstanding at FY26-end). Market cap uses the period-end basic count (matching vendor convention and actual shares in issue); per-share fair-value work downstream should use the LTM diluted count to be conservative on dilution, though the difference is immaterial for this company.

## 3. Market Capitalization

`Market cap = share count × current price = 60,133,558 × ₹1,784.60 = ₹107,314.35 million (₹10,731.44 crore)`

Reconciles exactly to the Capital IQ Key Stats sheet figure (₹107,314.347606 million) and to the Public Company Profile snapshot (₹107,314.3 million).

## 4. Enterprise Value Bridge

**Cash-quality finding (material).** Of the ₹33,886.58 million Capital IQ groups as "Cash & Short-Term Investments" (2026-06-30), only ₹368.11 million is actual cash and cash equivalents. The remaining ₹33,434.47 million (98.7% of the line) is "Total current investments" — quoted mutual funds / exchange-traded funds measured at fair value through profit or loss (FVTPL), per the Q1 FY27 interim filing's investments note (e.g., ICICI Prudential Liquid Fund, Axis Liquid Fund, Bajaj Finserv Liquid Fund). These are liquid/short-duration debt-fund holdings used for treasury management of the company's own operating surplus — not investments held by a financial subsidiary, not restricted/margin balances, and not long-tenor instruments. But they are NOT "cash and cash equivalents" under Ind AS 7 (NAV can move with the market) and they carry FVTPL mark-to-market risk. Per the cash-quality rule, both bases are shown below.

| Component | Amount (₹mn) | Source |
|---|---:|---|
| Market capitalization | 107,314.35 | §3 above |
| + Total debt (all lease liabilities — no bank borrowings) | 216.28 | Q1 FY27 interim results, Note 15(a): current lease liabilities ₹105.23mn + non-current ₹111.05mn [`Form_Interim_Report(Jul-21-2026).pdf`]; matches Capital IQ Capital Structure Summary sheet exactly |
| + Minority / non-controlling interest | 0 | Balance sheet carries no NCI line (100%-owned consolidation) [`Form_Interim_Report(Jul-21-2026).pdf`] |
| + Preferred equity | 0 | No preference shares in issue |
| + Operating lease liabilities (off-balance-sheet) | Not added — CIQ's supplemental "Debt Equivalent Oper. Leases" estimate was ₹879.44mn at 2026-03-31 (~1.2% of EV), an imputed/estimated figure, not a filed liability; immaterial, not added |
| + Underfunded pension / other long-term obligations | Not added — "Debt Equiv. of Unfunded Proj. Benefit Obligation" ₹591.08mn at 2026-03-31 (CIQ estimate, ~0.8% of EV); the underlying pension liability (₹314.84mn) is already on the balance sheet within Total Liabilities but not folded into the EV bridge; immaterial, not added |
| − Cash & equivalents (strict) | 368.11 | Q1 FY27 interim results, Note 11 [`Form_Interim_Report(Jul-21-2026).pdf`] |
| − ST investments + current investments (mutual funds, "broad" basis) | 33,886.58 total (368.11 cash + 33,434.47 current investments; CIQ additionally itemizes ₹84.00mn as "Short Term Investments" — the filing's closest analogous line, "Bank balances other than cash and cash equivalents," is ₹87.20mn; a ~₹3.2mn/immaterial classification variance) | Q1 FY27 interim results, investments note (current investments ₹33,434.47mn) [`Form_Interim_Report(Jul-21-2026).pdf`]; Capital IQ Balance Sheet sheet for the ST-investments sub-split |
| − Equity-method investments | Not separately carved out — ₹2,746.89mn of investments in associates (2026-06-30) sit in Long-Term Investments, outside the Cash & ST Investments line; left in as an asset supporting equity value, per standard treatment | Capital IQ Balance Sheet sheet |
| **= Enterprise value — BROAD basis (canonical)** | **73,644.05** | Nets the full treasury book (cash + all current investments) against debt and market cap; matches Capital IQ's own TEV figure exactly, and is the basis peer/multiples work downstream will most likely draw from for cross-comparability |
| **= Enterprise value — STRICT basis (conservative alternative)** | **107,162.52** | Nets only true cash & equivalents (₹368.11mn) against debt and market cap; leaves the ₹33.4bn mutual-fund book on the balance sheet as a non-cash asset |

**Canonical choice and reasoning:** the BROAD basis (₹73,644.05mn) is used as the canonical EV. The mutual-fund holdings are genuinely liquid (quoted liquid/debt schemes, redeemable in days, not equity funds), are IndiaMART's own treasury — not a financial subsidiary's book — and the company is otherwise debt-free (its only "debt" is ₹216.28mn of capitalized lease liabilities). Treating ₹33.4bn of liquid, redeemable treasury as economically equivalent to cash is reasonable here. The STRICT figure is shown alongside because these holdings are technically "current investments," not Ind AS 7 cash equivalents, and carry FVTPL mark-to-market exposure that a pure cash balance does not — downstream agents relying on EV should be aware the two bases differ by ~₹33.5bn (a ~45% swing in EV), driven entirely by this one line.

## 5. Net Debt & Leverage Snapshot

| Metric | Value (₹mn, as of 2026-06-30) | Source |
|---|---:|---|
| Total debt (all lease liabilities) | 216.28 | Q1 FY27 interim results, Note 15(a) |
| Cash & equivalents | 368.11 | Q1 FY27 interim results, Note 11 |
| **Net debt — strict basis** (Total debt − Cash & equivalents only) | **(151.83)** net cash | Computed; matches the earnings module's own strict-basis figure at the same date [`analyses/INDIAMART_2026-08-13/earnings/01_historical-financials.md`] |
| **Net debt — broad basis** (Total debt − Cash, ST investments & current investments) | **(33,670.3)** net cash | Matches Capital IQ Historical Capitalization sheet exactly; matches the earnings module's own broad-basis figure |
| Net debt / EBITDA (CIQ-adjusted, LTM) | Not meaningful — net cash on both bases | Capital IQ Capital Structure Summary sheet ("NM") |
| Total debt / EBITDA (CIQ-adjusted, LTM) | 0.04x | Capital IQ Capital Structure Summary sheet |

IndiaMART carries no bank borrowings of any kind — its entire "debt" line is capitalized lease liabilities under Ind AS 116. This is a capital-structure characteristic, not a leverage or solvency finding (that belongs to the balance-sheet-survival module); noted here only because it explains why the "Total Debt" figure feeding the EV bridge is so small relative to the cash/investment book.

## 6. Per-Share Reference Values

| Metric | Per Share (₹) | Source |
|---|---:|---|
| Book value per share | 369.11 | Q1 FY27 interim results balance sheet (Total Common Equity ₹22,195.98mn ÷ 60.133558mn shares); matches Capital IQ Balance Sheet sheet exactly |
| Tangible book value per share | 291.13 | Same basis, Tangible Book Value ₹17,506.61mn (equity less Goodwill ₹4,542.72mn and Other Intangibles ₹146.65mn) |
| Net cash per share — broad basis | 559.93 | ₹33,670.3mn net cash ÷ 60.133558mn shares |
| Net cash per share — strict basis | 2.52 | ₹151.83mn net cash ÷ 60.133558mn shares |

## 7. Anchor Summary (canonical numbers for downstream agents)

Current price is a confirmed, dated pool close (2026-08-12) — margin of safety, downside-to-bear, and observed up/downside are assessable downstream using it. Capital structure is essentially debt-free; the one material caveat is that the headline "cash" figure is 98.7% liquid mutual-fund investments rather than bank cash — both EV bases are shown above, and downstream agents should state which basis (broad, canonical) they are using whenever they cite EV or net debt.

### Anchor Block (copy-forward)

- Price: ₹1,784.60 (2026-08-12 close, last close basis)
- Price-state: pool-verified — margin of safety, downside-to-bear, observed up/down, and attractiveness are all assessable
- Currency: INR
- Shares (market cap): 60,133,558 (basic, period-end 2026-06-30; Q1 FY27 interim results)
- Shares (per-share fair value): 60,291,720 (LTM weighted-average diluted, treasury-stock-method already applied; ESOP pool effectively exhausted)
- Market cap: ₹107,314.35 million (₹10,731.44 crore)
- Net debt: (₹33,670.3) million net cash — BROAD basis (canonical); (₹151.83) million net cash — STRICT basis
- EV: ₹73,644.05 million (₹7,364.40 crore) — BROAD basis (canonical); ₹107,162.52 million (₹10,716.25 crore) — STRICT basis
- Reporting currency: INR (Ind AS, FY ends 31 March)
- Key caveats: (1) "Cash & ST Investments" is 98.7% liquid mutual-fund holdings (FVTPL, not Ind AS cash equivalents) — EV/net-debt swing ~₹33.5bn (~45%) between bases; (2) fully diluted share count is a weighted-average proxy, not a disclosed period-end fully-diluted figure, though the gap to basic is immaterial (~0.26%) and the ESOP pool is nearly exhausted; (3) operating-lease and pension debt-equivalents (~₹1.5bn combined, CIQ estimates) were not added to the EV bridge — immaterial (~2% of EV) but named for completeness.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — INDIAMART

Reporting currency: **INR** (Ind AS, fiscal year ends 31 March). Figures in ₹ million unless stated; ₹1 crore = ₹10 million. Anchor numbers taken verbatim from `01_price-and-capital-structure.md`: current price ₹1,784.60 (2026-08-12 close, pool-verified), diluted shares (fair-value basis) 60,291,720, market cap ₹107,314.35mn, net debt ₹(33,670.3)mn net cash (**broad basis, canonical**), EV ₹73,644.05mn (**broad basis, canonical**).

**Business type:** Operating company (asset-light B2B online marketplace, per `business-model/02_business-identity.md`). Per the Business-Type Method Map, the primary multiples are EV/EBITDA, EV/EBIT, EV/Sales, P/E and FCF yield; P/Book and P/Tangible Book are shown as secondary reference multiples only (not primary for an asset-light operating business), consistent with the pattern already visible below (P/B moves with the same de-rating but is not the driver read).

**Critical data-availability limitation (read before the tables below).** IndiaMART has traded on NSE/BSE since its 2019 IPO — it is not a recently listed company. But the only own-history multiples series found in this data pool is Capital IQ's **quarterly** `Multiples` tab (`Financials (1).xls`), which covers just **5 quarters** (quarter-ends 2025-06-30 → 2026-06-30) plus the current snapshot (2026-08-12) — about **14 months**, not the requested 3–5 years. No 5-year valuation-chart export, no annual-report monthly-share-price table, and no longer CIQ multiples series were found anywhere in the pool (`Company Comparable Analysis....xls`'s own "Valuation Chart" tab is present but empty of data — headers only, no history). This is a genuine pool gap, not a young-company fact, but it creates the identical false-precision risk the partial-data rule warns against for short-history names. **Per that rule's spirit, this agent treats the 5-quarter band with the same caution as a sub-3-year history: no mean/median reversion figure below is a fair-value input for `07`; all reversion-implied values in §4 are illustrative-only, and §3/§5 give a directional read, not a precision re-rating call.**

---

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| EV / EBITDA | LTM (to Jun-30-2026) | EBITDA ₹5,314.65mn | 15.17x | Capital IQ Key Stats / Multiples export, `Financials (1).xls`, LTM col, as-of 2026-08-12 close |
| EV / EBITDA | NTM (consensus) | — | 12.32x | Capital IQ `EstimatesReport.xls`, Multiples tab, NTM col |
| EV / EBITDA | FY 2027E | EBITDA (consensus) ₹5,828.73mn | 12.63x | `Financials (1).xls`, Key Stats tab, FY27E col |
| EV / EBIT | LTM (to Jun-30-2026) | EBIT ₹5,150.87mn | 16.01x | `Financials (1).xls`, Key Stats / Multiples, LTM col |
| EV / EBIT | FY 2027E | EBIT (consensus) ₹5,521.46mn | 13.34x | `Financials (1).xls`, Key Stats, FY27E col |
| EV / Sales | LTM (to Jun-30-2026) | Revenue ₹16,113.32mn | 4.57x | `Financials (1).xls`, Key Stats / Multiples, LTM col |
| EV / Sales | NTM (consensus) | Revenue (NTM) ₹17,663.93mn | 4.17x | `EstimatesReport.xls`, Multiples tab NTM; Consensus tab Market Summary NTM |
| EV / Sales | FY 2027E | Revenue (consensus) ₹17,201.93mn | 4.28x | `Financials (1).xls`, Key Stats, FY27E col |
| P / E (diluted) | LTM (to Jun-30-2026) | Diluted EPS ₹81.83 | 21.81x | `Financials (1).xls`, Key Stats / Multiples, LTM col |
| P / E (diluted) | NTM (consensus) | — | 18.93x | `EstimatesReport.xls`, Multiples tab, NTM col |
| P / E (diluted) | FY 2027E | EPS (consensus) ₹92.02 | 19.39x | `Financials (1).xls`, Key Stats, FY27E col |
| P / Book | LTM (to Jun-30-2026) | BVPS ₹369.11 | 4.83x | `01_price-and-capital-structure.md` §6 + Key Stats LTM |
| P / Tangible Book | LTM (to Jun-30-2026) | Tangible BVPS ₹291.13 | 6.13x | `01_price-and-capital-structure.md` §6 + Key Stats LTM |
| P / FCF (CFO − capex basis) | LTM (to Jun-30-2026) | FCF/share ₹114.87 (FCF ₹6,925.56mn ÷ 60.29172mn diluted shares) | 15.54x | Own calc, `Financials (1).xls` Cash Flow tab LTM col: CFO ₹6,966.86mn − capex ₹41.30mn |
| FCF yield (CFO − capex basis) | LTM (to Jun-30-2026) | — | 6.44% | Own calc, same source |
| Dividend yield | LTM (trailing) | DPS ≈ ₹60 (FY26 consensus-tracked actual) | 3.4% | Capital IQ Public Company Profile snapshot, last updated 2026-08-13 05:18 AM (GMT-5) |

**Two flagged limitations, stated explicitly rather than resolved silently (CLAUDE.md §15):**
1. **EV/EBITDA and EV/EBIT do not internally tie to the canonical EV.** Dividing the canonical EV (₹73,644.05mn, `01`) by the Key-Financials-reported LTM EBITDA (₹5,314.65mn) gives 13.86x, not the 15.17x Capital IQ itself publishes for "TEV/LTM EBITDA." The same gap exists for EBIT (canonical EV ÷ reported LTM EBIT = 14.30x vs the 16.01x Capital IQ publishes). By contrast, EV/Sales ties exactly (73,644.04 ÷ 16,113.32 = 4.570x = the published multiple). This means Capital IQ's own EBITDA/EBIT multiples are computed against an EBITDA/EBIT base roughly 9–12% smaller than the Key-Financials-table figure quoted above (back-solved: implied EBITDA base ≈ ₹4,854mn, implied EBIT base ≈ ₹4,600mn) — the pool does not disclose why (likely a different adjustment or timing convention within Capital IQ's own multiples engine). The multiple values themselves are reported as-published and are internally consistent across quarters (used for §2's band); the metric-value column is the Key-Financials figure as separately disclosed. Both numbers are cited to where they literally appear; they simply do not cross-multiply to reproduce each other, and that gap is flagged rather than papered over.
2. **P/FCF uses two different FCF definitions.** The 15.54x above uses `FCF = CFO − total capex` (Calculation Standard 6). Capital IQ's own Multiples tab reports a different, higher FCF base: "TEV/LTM Unlevered FCF" = 8.12x and "Market Cap/LTM Levered FCF" = 11.86x (implied LTM FCF ≈ ₹9,051mn — about 31% above the ₹6,926mn CFO-minus-capex figure). Capital IQ's FCF construct is not company-disclosed; per CLAUDE.md §15 the CFO-minus-capex figure is presented as primary above, and the vendor construct is shown here, labelled, not headlined.

---

## 2. Historical Multiple Bands (5 quarters — NOT a 3–5 year band; see limitation above)

Band = quarter-end **Close**-price-based multiples, quarterly frequency, 2025-06-30 → 2026-06-30 (5 data points), from `Financials (1).xls`, Multiples tab. Current = the 2026-08-12 snapshot (same tab, same methodology).

| Multiple | Min (5-qtr) | Mean (5-qtr) | Median (5-qtr) | Max (5-qtr) | Current | Percentile of 5-qtr Range |
|---|---:|---:|---:|---:|---:|---:|
| EV / EBITDA (LTM) | 17.61x | 21.96x | 22.33x | 26.78x | 15.17x | **Below range** (sub-0th pct.) |
| EV / EBIT (LTM) | 18.73x | 23.35x | 23.57x | 28.77x | 16.01x | **Below range** (sub-0th pct.) |
| EV / Sales (LTM) | 5.33x | 7.15x | 7.22x | 9.18x | 4.57x | **Below range** (sub-0th pct.) |
| P / E (LTM, diluted) | 19.77x | 24.25x | 24.20x | 28.37x | 21.81x | ~24th pct. (low end, within range) |
| P / Book (LTM) | 4.77x | 6.03x | 6.24x | 7.13x | 4.83x | ~3rd pct. (near the bottom) |

For reference only (not a formal own-history band, price not multiple): the 52-week price range is ₹1,730.00 – ₹2,685.00 [Capital IQ Public Company Profile snapshot, 2026-08-13]. At ₹1,784.60 the current price sits at the **6th percentile** of that 52-week range — corroborating the multiples read directionally, though this is an unnormalized price range, not a multiple.

**Reading the table:** on three of five multiples (EV/EBITDA, EV/EBIT, EV/Sales) the current level sits **below the entire 5-quarter trailing low**, not merely toward the bottom of a band — the de-rating has not found a floor within this short observation window. P/E and P/Book sit inside the 5-quarter range but near its bottom (24th and 3rd percentile respectively).

This is the anchor `07_scenario-and-fair-value` should use for its own bull/bear multiple selection, but flagged as a **short, single-cycle window** (5 quarters spans one growth-deceleration phase, not a full cycle) — the bull case should not assume reversion to this window's max without independent evidence the deceleration reverses (see `earnings/04_guidance-consensus.md` for the forward growth path), and the bear case should note the current level already sits below this window's min on three of five multiples, i.e. there is limited "own-history" evidence of a floor.

---

## 3. Re-Rating / De-Rating Read

The three most reliable multiples for this business — EV/EBITDA, EV/EBIT, and P/E — all show a discount to their own 5-quarter mean/median, but of very different sizes:

- **EV/EBITDA:** current 15.17x vs 5-quarter mean 21.96x = **−30.9%** discount; vs median 22.33x = **−32.0%** discount.
- **EV/EBIT:** current 16.01x vs mean 23.35x = **−31.4%** discount; vs median 23.57x = **−32.0%** discount.
- **P/E:** current 21.81x vs mean 24.25x = **−10.0%** discount; vs median 24.20x = **−9.9%** discount.

The stock has clearly **de-rated** over the observed window — not merely drifted within a band. The gap between the EV-based de-rating (~31%) and the earnings-based de-rating (~10%) is itself informative: EBITDA and EBIT actually **grew** slightly year-on-year in FY26 (EBITDA +1.27%, EBIT +1.90%, per `Financials (1).xls` Ratios tab), while diluted EPS **fell** −14.0% YoY in FY26 and LTM EPS is down −16.6% YoY (`Financials (1).xls`, Key Stats tab, growth rows) — so the market has re-rated the EV-based multiples down by roughly three times as much as it re-rated the earnings multiple down, even though earnings (not EBITDA) fell more. The plausible driver, consistent with upstream evidence: revenue growth has been decelerating every year (FY25 16.0% → FY26 13.0% → LTM 12.8% → FY27E consensus 9.6%, `Financials (1).xls` Key Stats), and `business-model/07_business-quality.md` scores Competitive intensity (45/100) and Cyclicality (45/100) as "Mixed" — citing management's own FY26 Annual Report risk section naming new B2B marketplaces and direct supplier-buyer disintermediation as live threats, and EBITDA margin compressing −385bps YoY in FY26 (37.03% → 33.18%, per `earnings/01_historical-financials.md`). A market that is discounting a decelerating-growth, margin-compressing story more than it discounts trailing EBITDA/EBIT itself is a coherent, evidence-consistent read — not proof, since the underlying window is short.

---

## 4. Implied Value from Reversion — ILLUSTRATIVE ONLY, NOT A FAIR-VALUE INPUT FOR `07`

**This table is explicitly excluded from `07`'s method set per the short-history partial-data rule.** The 5-quarter window is too short to support a mean/median reversion target as a defensible fair-value point; the figures below illustrate what full reversion to this short window's central tendency would imply, nothing more.

| Multiple | Reversion Target (mean / median) | Implied EV or Equity Value (₹mn) | Implied Price/Share (₹) | vs Current Price (₹1,784.60) |
|---|---:|---:|---:|---:|
| EV / EBITDA | mean 21.96x | EV 116,709 → Equity 150,388 | 2,494 | +39.8% |
| EV / EBITDA | median 22.33x | EV 118,668 → Equity 152,322 | 2,526 | +41.6% |
| EV / EBIT | mean 23.35x | EV 120,283 → Equity 153,933 | 2,553 | +43.1% |
| EV / EBIT | median 23.57x | EV 121,389 → Equity 155,060 | 2,572 | +44.1% |
| EV / Sales | mean 7.15x | EV 115,264 → Equity 148,935 | 2,470 | +38.4% |
| EV / Sales | median 7.22x | EV 116,326 → Equity 149,996 | 2,488 | +39.4% |
| P / E | mean 24.25x | Equity 119,612 | 1,984 | +11.2% |
| P / E | median 24.20x | Equity 119,395 | 1,980 | +11.0% |
| P / Book | mean 6.03x | Equity 134,265 | 2,227 | +24.8% |
| P / Book | median 6.24x | Equity 138,922 | 2,304 | +29.1% |

Formula shown: `Implied EV = reversion multiple × current LTM metric`; `Implied equity = Implied EV − net debt` (net debt is broad-basis net cash of ₹(33,670.3)mn, so equity = EV + 33,670.3); `Implied price = Implied equity ÷ 60.291720mn diluted shares`. P/E and P/Book apply directly to the per-share metric (no EV bridge).

**Base-case illustrative point (named, per the reporting convention — NOT a `07` input):** the median EV/EBITDA reversion, **₹2,526/share (+41.6%)**, using EV/EBITDA as the named "most reliable" multiple for this asset-light operating business (the standard primary multiple under the Business-Type Method Map, and the one least distorted by the modest EBITDA/EBIT vendor-basis gap flagged in §1, since the historical band and current level are both drawn from the *same* internally-consistent CIQ series even if that series does not cross-tie to the separately-disclosed EBITDA figure).

**Cross-method dispersion (separate exhibit, not averaged in):** the reversion-implied price ranges from **₹1,980 (P/E median, +11.0%) to ₹2,572 (EV/EBIT median, +44.1%)** — a roughly 4x spread in implied upside depending on which multiple is used. This dispersion is the real finding: earnings-based reversion implies a modest re-rate; EV-based reversion implies a large one. The gap is explained (not resolved) by §3's finding that EPS fell while EBITDA/EBIT grew — full EV-multiple reversion assumes the EBITDA/EBIT growth is sustained AND rewarded at the old multiple, which is precisely the growth-deceleration/competitive-intensity risk `business-model/07_business-quality.md` flags as live.

**Reversion assumption check:** reverting to the 5-quarter mean/median assumes the warranted multiple has not structurally changed. The evidence is mixed on this: revenue growth deceleration (16.0% → 9.6%E) and the FY26 margin compression (−385bps EBITDA margin) are real, disclosed operating changes over the same window the multiple compressed in — so at least part of the de-rating looks like a warranted response to slower, lower-margin growth, not pure sentiment. A full reversion to the 5-quarter mean is therefore **not** the base case this agent would default to; it is shown as the illustrative point the rules require, with the caveat stated plainly.

---

## 5. Own-History Read

IndiaMART trades at a **30–32% discount to its own 5-quarter mean/median on EV/EBITDA and EV/EBIT**, but only a **~10% discount on P/E** — and on three of five tracked multiples (EV/EBITDA, EV/EBIT, EV/Sales) the current level sits **below the entire 5-quarter trailing range**, not merely near its bottom. Full reversion to the 5-quarter median EV/EBITDA would imply roughly **+42% to ₹2,526/share**; reversion on P/E implies only **+11% to ₹1,980/share** — a four-fold difference in implied upside that is itself the headline finding, not a footnote.

**Biggest caveat, stated twice because it governs everything above:** (1) the pool provides only ~14 months of own-history multiples, not the 3–5 years this read is meant to be built on — none of the reversion figures in §4 are usable as a `07` fair-value input, only as illustration; and (2) even within that short window, revenue growth decelerated (16.0% → 9.6%E) and EBITDA margin compressed (−385bps in FY26) at the same time the multiple compressed — so at least part of the de-rating plausibly reflects a genuinely lower warranted multiple, not a mispricing a mean-reversion trade would capture. `business-model/07_business-quality.md` and `09_moat.md` score competitive intensity and cyclicality as "Mixed" (45/100 each), consistent with a durably lower multiple rather than a temporary dislocation.

The management-governance module (`analyses/INDIAMART_2026-08-14/management-governance/`) does not exist in this run root, so the §24 Filter 6 unaligned-controlling-owner read cannot be applied here — that adjudication is deferred to the master synthesizer, which should confirm no RF-OWN-004 flag exists before treating any part of this discount as a mean-reversion opportunity.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — INDIAMART

**Business type:** Operating company (India-focused, subscription-funded B2B online marketplace) [`analyses/INDIAMART_2026-08-14/valuation/00_valuation-data-triage.md` §6A]. Per the Business-Type Method Map, the primary multiples are EV/EBITDA, EV/EBIT, P/E and FCF yield.

**Anchor used throughout:** price ₹1,784.60 (2026-08-12 close, pool-verified), market cap ₹107,314.35mn, EV ₹73,644.05mn (broad/canonical net-cash basis, net cash ₹33,670.3mn), 60,291,720 fully-diluted (LTM weighted-average) shares [`01_price-and-capital-structure.md` §7]. Company-side forward metrics (FY27E/NTM) are read in IndiaMART's own reporting currency, INR, from Capital IQ's Key Stats tab [`IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls`, Key Stats tab]. Peer figures below are the Capital IQ comps-workbook export, priced in **US Dollar** (the workbook's own currency setting) at Capital IQ's own spot conversion, **as-of 2026-08-13** [`Company Comparable Analysis IndiaMART InterMESH Limited.xls`]. Cross-checking the workbook's own IndiaMART row (market cap $1,125.1mm vs ₹107,314.35mn) implies a CIQ conversion rate of ≈₹95.4/US$ on 2026-08-13 — noted for transparency; multiples themselves are currency-neutral ratios and are used directly without re-conversion, per §15/§27.

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Just Dial Limited | NSEI:JUSTDIAL | India-focused local-search platform with a direct B2B product line (JD Mart); management itself estimates 5–10% buyer/supplier overlap; ~0.8x IndiaMART's LTM revenue scale, comfortably inside a credibility band. Same country, same regulatory/macro environment. | Named by the company itself on multiple earnings calls; carried forward from `business-model/08_competitive-map.md` §2, Competitor A |
| Info Edge (India) Limited | NSEI:NAUKRI | India-based online-classifieds/subscription-lead-generation platform (Naukri.com jobs, 99acres real estate, Jeevansathi matrimony, Shiksha education) — same country, same functional archetype (tiered subscription fees, lead-gen classifieds economics), even though the end-markets are B2C verticals rather than IndiaMART's B2B trade marketplace. | Not named in `business-model/08_competitive-map.md`; added here from the Capital IQ auto-generated comp set on the basis of genuine business-model overlap (subscription-classifieds economics), flagged as **self-selected**, not competitive-map-sourced |
| Zhejiang NetSun Co., Ltd. | SZSE:002095 | China-based B2B trading-platform operator for bulk raw materials (trading markets, corporate e-commerce, supply-chain financing) — a genuine same-business-type (B2B marketplace) international analog, different geography. | Self-selected from the Capital IQ comp set; not named by IndiaMART management |
| Zarea Limited | KASE:ZAL | Pakistan-based B2B e-commerce trading platform connecting buyers and sellers of commodities (cement, steel, agri, chemicals) — closest genuine same-business-model (B2B classifieds/trading) international analog in the set, though tiny and thinly traded. | Self-selected from the Capital IQ comp set; not named by IndiaMART management |

**Excluded from the multiples table (named but not usable):**
- **TradeIndia (Infocom Network Private Limited)** — management's own repeatedly-named "nearest" like-for-like competitor (identical B2B classifieds/lead-gen model) [`08_competitive-map.md` §2, Competitor B], but it is a **private company with no public multiples** — cannot be compared quantitatively; flagged, not guessed.
- **Alibaba.com / 1688.com (Alibaba Group Holding Limited)** — named by management as a strategic benchmark, not a same-market rival, and ~12x IndiaMART's scale on management's own unverified estimate [`08_competitive-map.md` §2, Competitor C]; Alibaba Group does not disclose standalone 1688.com segment multiples, so no comparable figure exists.
- **Eternal Limited (NSEI:ETERNAL, formerly Zomato)** — appears in the Capital IQ auto-generated comp set (grouped as an "Indian internet company") but its business (food delivery, quick commerce/Blinkit, B2B food-ingredient supply) has fundamentally different unit economics (2.6% LTM EBITDA margin, +190.5% revenue growth off a hyper-growth quick-commerce base) from a mature, 33%-margin B2B subscription marketplace. Excluded as **not a comparable business type**, not merely a weak comp.
- **Yangtze River Economy United Development (Group) Co., Ltd.** — a Shanghai logistics/commodity-trade conglomerate subsidiary with no current market-cap, share-price or multiples data in the export (all fields blank/NM, latest filing date 2021-08-30) [`Company Comparable Analysis..., Financial Data tab`]. Excluded — **no usable data**.

**Set provenance.** Only one peer (Just Dial) is competitive-map-sourced; the remaining three (Info Edge, Zhejiang NetSun, Zarea) are **self-selected** from the Capital IQ auto-generated comp export on the basis of genuine business-model overlap, per the partial-data rule for a thin named-peer set. This is a small, heterogeneous four-name set — two India-listed names of very different business mix, and two thinly-traded foreign single-country analogs — and the comp-quality caveats in §2–§5 below should be read as a hard constraint on how much weight this method can carry.

## 2. Peer Multiples & Operating Stats

All figures LTM (Latest Twelve Months) unless marked NTM (Next Twelve Months, Capital IQ consensus). Currency: US Dollar, Capital IQ spot-converted. Data as-of 2026-08-13 [`Company Comparable Analysis IndiaMART InterMESH Limited.xls`, Trading Multiples + Operating Statistics + Financial Data tabs].

| Company | P/E (LTM) | EV/EBITDA (LTM) | EV/EBIT (LTM) | EV/Sales (LTM) | FCF Yield | Rev Growth (LTM YoY) | EBITDA Margin (LTM) | ROIC / ROE | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **INDIAMART** | 21.8 | 15.2 | 16.0 | 4.6 | 6.4%¹ | 12.75% | 33.0% | 13.51% (FY26); 11.23% 5-yr avg [`business-model/09_moat.md` §3] | NM — net cash | 2026-08-13 |
| Just Dial (JUSTDIAL) | 11.6 | **0.2**² | **0.3**² | **0.1**² | N/A³ | 7.27% | 29.6% | ROE ~3.4–10.7% / ROCE ~7.0–13.1% (wide, web-sourced, unverified) [`08_competitive-map.md` §2] | NM — net cash (LTM net debt −$604.7mm) | 2026-08-13 |
| Info Edge (NAUKRI) | 54.3 | 67.6 | 74.9 | 25.1 | N/A³ | 13.86% | 35.5% | Not available in this pool | NM — net cash | 2026-08-13 |
| Zhejiang NetSun (002095) | NM | NM | NM | 6.3 | N/A³ | −18.68% | 0.4% | Not available in this pool | NM — net cash | 2026-08-13 |
| Zarea (ZAL) | 8.7 | 24.4 | 25.9 | 3.5 | N/A³ | 178.41%⁴ | 14.5% | Not available in this pool | NM — net cash | 2026-08-13 |
| **Peer median (all 4, incl. Just Dial's distorted EV lines)** | 11.6 | 24.4 | 25.9 | 4.9 | — | 10.57% | 22.05% | — | — | — |
| **Peer median (EV lines only, Just Dial excluded — see ² below)** | — | 46.0 | 50.4 | 6.3 | — | — | — | — | — | — |

¹ IndiaMART FCF yield computed as FY26 FCF ₹6,872.19mn ÷ market cap ₹107,314.35mn = 6.40% [`earnings/01_historical-financials.md` §1; `01_price-and-capital-structure.md` §3].
² **Just Dial's EV-based multiples are flagged as not meaningful for comparison.** Its Total Enterprise Value is only $8.3mm against a $613mm market cap — TEV is 1.4% of market cap because LTM net debt is −$604.7mm (net cash almost equal to the whole market cap) [`Company Comparable Analysis..., Financial Data tab`]. Just Dial has also been a majority-owned, thin-free-float subsidiary of Reliance Retail Ventures Limited since October 2021 [`08_competitive-map.md` §2, Competitor A] — a structure that can itself suppress the market's pricing of the operating business independent of its underlying economics (CLAUDE.md §24 Filter 6 territory for Just Dial, not IndiaMART). Its P/E (price-based, not EV-based, so not subject to the same cash-netting mechanics) is retained as the more usable data point.
³ No peer FCF figures were extracted into this pool's comps workbook — peer FCF yield is **not available**, not fabricated.
⁴ Zarea's 178% revenue growth is off a very small base ($9.5mm LTM revenue) and is not a reliable growth signal for multiple-setting purposes.

## 3. Premium / Discount to Peer Median

| Multiple | Company | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| P/E (LTM) | 21.8x | 11.6x (all 4) | **+87.9%** premium |
| EV/EBITDA (LTM) | 15.2x | 24.4x (all 4, incl. distorted Just Dial) | **(37.7%)** discount |
| EV/EBITDA (LTM) | 15.2x | 46.0x (Just Dial excluded) | **(67.0%)** discount |
| EV/EBIT (LTM) | 16.0x | 25.9x (all 4) | **(38.2%)** discount |
| EV/EBIT (LTM) | 16.0x | 50.4x (Just Dial excluded) | **(68.3%)** discount |
| EV/Sales (LTM) | 4.6x | 4.9x (all 4) | **(6.1%)** discount |
| EV/Sales (LTM) | 4.6x | 6.3x (Just Dial excluded) | **(27.0%)** discount |
| FCF yield | 6.4% | Not assessable — no peer FCF data | Not assessable |

Formula: `(company multiple − peer median) / peer median`; positive = premium, negative = discount.

**These readings conflict with each other and neither is clean.** The P/E premium (+88%) is the more credible of the two directions because P/E is not distorted by the EV-based net-cash-compression mechanic (Note ² above) — but it is set almost entirely by Just Dial (11.6x) and Zarea (8.7x), two names with their own separate reasons to trade at compressed multiples (an ownership overhang for Just Dial; small-cap/thin-liquidity/emerging-market risk for Zarea), against Info Edge (54.3x) pulling the mean far higher. The EV-based "discounts" (37–68%) are driven almost entirely by Info Edge's EV/EBITDA (67.6x) and EV/EBIT (74.9x), which — per §4 below — likely price in something beyond IndiaMART's core marketplace economics; excluding Just Dial's distorted EV lines (as the more defensible adjustment) makes the apparent discount even larger, which is itself evidence the discount signal is an artifact of Info Edge's mix, not a genuine like-for-like read.

**Is the gap typical or unusual?** **Not assessable.** The comps workbook's own "Valuation Chart" tab — the only place a historical peer-multiple series could sit in this pool — returned no rows (empty sheet) [`Company Comparable Analysis..., Valuation Chart tab`]. No peer-multiple history exists elsewhere in the data pool. This is a distinct gap from the stock's own multiple history (covered by `02_multiples-own-history`, not this agent) — it means the relative-gap-persistence question (is today's premium/discount typical, wider, or narrower than IndiaMART's usual relationship to these names) cannot be answered from available data, and is not invented here.

## 4. Is the Gap Warranted?

The credible signal — IndiaMART's P/E premium over Just Dial and Zarea — is only partly explained by fundamentals: IndiaMART's LTM EBITDA margin (33.0%) beats Just Dial's (29.6%) by ~340 basis points (bps) and its EBIT margin (32.0% vs 25.3%) by ~670 bps, and its revenue growth (12.75% vs Just Dial's 7.27%) is roughly 1.75x faster [Operating Statistics tab, as-of 2026-08-13] — genuine, evidenced quality advantages that argue for *some* premium multiple. But the business-model module's own read caps how much premium that quality gap should buy: IndiaMART's aggregate business-quality score is 55/100 (Mixed), its moat verdict is explicitly **Narrow** (no moat source clears the Strong band; the economic-moat test — 11.23% five-year average ROIC vs an estimated ≈8.75% WACC — is not robust to a more conventional beta assumption for a small/mid-cap Indian internet name, under which ROIC would sit at or below cost of capital) [`business-model/09_moat.md` §2–§5], customer stickiness scores 40/100 (no contractual lock-in; a Q4 FY26 price rise directly turned net paying-supplier additions negative) [`business-model/07_business-quality.md`], and paying-supplier growth has decelerated to +1.4% YoY in FY26 against an 8% five-year CAGR [`08_competitive-map.md` §3]. Applying even a generous +30–50% quality premium to Just Dial's own multiple (§5) does not reach IndiaMART's actual ~88% premium. On the EV-based multiples, the apparent large discount versus Info Edge is not credible as a like-for-like signal: Info Edge's own Capital IQ business description states it "acts as an investment advisor and manager, financial and management consultant, and sponsor of alternative investment funds" [`Company Comparable Analysis..., Business Description tab`] — a diversified multi-vertical classifieds platform with a disclosed investment-fund arm, which plausibly explains part of its outsized EV/EBITDA (67.6x) beyond core operating economics (**Inference, not from filings** — the precise value of that investment-portfolio optionality is not quantified anywhere in this pool). Conclusion: **premium is unjustified (relative downside)** on the one credible cross-section (P/E vs Just Dial/Zarea), but confidence in this specific finding is low — the peer set is thin (4 usable names, only one competitive-map-sourced) and two of the four names carry their own separate distortions (Just Dial's ownership overhang, Info Edge's non-comparable business mix).

## 5. Implied Value from Peer Multiples

**Basis discipline:** the base case uses NTM (forward, FY27E) peer and company multiples/metrics on the same basis; company metrics are IndiaMART's own consensus FY27E figures in INR [`Financials (1).xls`, Key Stats tab: FY27E diluted EPS ₹92.02, FY27E EBITDA ₹5,828.73mn].

| Multiple | Applied Peer Multiple | Basis | Implied EV or Equity | Implied Price/Share | vs Current Price (₹1,784.60) |
|---|---:|---|---:|---:|---:|
| **P/E (NTM) — base case** | **13.4x** = Just Dial NTM P/E (10.29x) × 1.30 quality-premium adjustment (margin + growth edge, §4) — **Inference, not from filings** | NTM P/E on NTM (FY27E) EPS | Equity ≈ ₹80,832mn (13.4 × 92.02 × 60.29172mn shares, cross-check) | **≈ ₹1,233** | **(30.9%)** — current price is ~31% above this implied value; equivalently, current price trades at a ~45% premium to this implied value |
| P/E (NTM) — upper quality-adjustment bound | 15.4x = Just Dial NTM P/E × 1.50 | NTM P/E on NTM EPS | — | ≈ ₹1,417 | (20.6%) |
| P/E (LTM) — Just Dial, unadjusted | 11.6x | LTM P/E on FY26A EPS ₹78.77 | — | ≈ ₹914 | (48.8%) |
| P/E (LTM) — Zarea, unadjusted | 8.7x | LTM P/E on FY26A EPS ₹78.77 | — | ≈ ₹685 | (61.6%) |
| EV/EBITDA (NTM) — Just Dial (flagged not meaningful, §2 Note ²) | 0.22x | NTM EV/EBITDA on FY27E EBITDA | EV ≈ ₹1,282mn; Equity ≈ ₹34,953mn | ≈ ₹580 | (67.5%) — **excluded from base/dispersion, shown for transparency only** |
| EV/EBITDA (NTM) — Info Edge (flagged non-comparable mix, §4) | 53.03x | NTM EV/EBITDA on FY27E EBITDA | EV ≈ ₹309,098mn; Equity ≈ ₹342,768mn | ≈ ₹5,685 | +218.6% — **excluded from base/dispersion, shown for transparency only** |
| EV/EBITDA (LTM) — Zarea (thin, single tiny foreign name) | 24.4x | LTM EV/EBITDA on FY26A EBITDA | EV ≈ ₹127,025mn; Equity ≈ ₹160,695mn | ≈ ₹2,665 | +49.3% — **low-confidence cross-check only, not part of the credible range** |

Equity bridge for all EV-based rows: `Equity = Implied EV − Net Debt (broad/canonical basis, −₹33,670.3mn net cash, per `01` §7)`; per-share divides by 60,291,720 fully-diluted shares [`01_price-and-capital-structure.md` §2, §7].

**Base-case point: ≈ ₹1,233/share**, on NTM P/E (13.4x, Just Dial NTM P/E quality-adjusted +30%) applied to FY27E consensus EPS ₹92.02. This is the single most defensible read in this comp set: P/E is not subject to the EV/net-cash-compression distortion that makes Just Dial's own EV multiples unusable, and Just Dial is the only competitive-map-named, same-country, comparable-scale peer with public multiples.

**Dispersion:** the P/E-based cross-checks span roughly **₹685–₹1,417** (Zarea LTM to the upper quality-adjustment bound) — a genuine, if wide, range. The EV/EBITDA-based reads span **₹580–₹5,685**, but that spread is dominated by comp-quality problems (Just Dial's cash-compressed EV at the low end, Info Edge's non-comparable business-mix premium at the high end) rather than real valuation uncertainty, and are shown for transparency only — they are **not** treated as part of the credible dispersion band feeding `07`.

## 6. Relative Read

On the one credible cross-section — P/E against Just Dial and Zarea, the two peers not distorted by the EV/net-cash mechanic — IndiaMART trades at an 87.9% premium to the peer median (21.8x vs 11.6x), and even after crediting IndiaMART's real margin (+340–670 bps) and growth (12.75% vs 7.27%) edge over Just Dial with a generous +30–50% quality adjustment, the peer-implied price (≈₹1,233–1,417) sits 21–31% below the current ₹1,784.60. The EV/EBITDA-, EV/EBIT- and EV/Sales-based reads point the opposite way (discounts of 6–68% to peer medians), but that signal is not credible: it is driven almost entirely by Info Edge's non-comparable, investment-portfolio-inflated multiple and by Just Dial's cash-compressed EV, not by a genuine like-for-like read on IndiaMART's core marketplace economics. Given the moat module's own verdict — Narrow moat, an economic-moat test that is not robust to a conventional beta assumption, and Mixed (55/100) business quality — there is no strong evidence the observed P/E premium is earned; call it **premium unjustified (relative downside), base-case implied value ≈₹1,233/share, credible P/E-based dispersion ≈₹685–₹1,417**, but flag this finding as **low-confidence**: the peer set is a thin, largely self-selected four-name comp with two of the four names carrying their own separate multiple distortions, and the true "nearest" competitor (TradeIndia, per management) has no public data at all.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — INDIAMART

**Business type:** Operating (India-focused, subscription-funded B2B online marketplace; single reportable segment, Web and Related Services, at 91.96% of FY26 revenue) [`00_valuation-data-triage.md` §6A]. The Business-Type Method Map (`MODULE_RULES.md`) makes an FCFF DCF the correct primary intrinsic method here — this is not a Financial, REIT, Commodity, or Holding-company business, so no method substitution is required.

**Jurisdiction / reporting standard / currency:** India, NSE: INDIAMART / BSE: 542726. Ind AS (Indian Accounting Standards, Companies Act 2013). Reporting currency INR. Fiscal year ends 31 March ("FY26" = year ended 31-Mar-2026). All figures in **₹ million** unless a crore (₹1 crore = ₹10 million) equivalent is given alongside for readability.

**Canonical inputs this DCF hands to `05_reverse-dcf` (per MODULE_RULES Calculation Standard 9):** normalized FCF base methodology (NOPAT-and-driver-built, §1/§4), normalized tax rate 25.17%, WACC 10.0% (used; 8.7% mechanically computed — see §3), and the two terminal methods in §5. `05` must invert this same model, not re-derive its own.

---

## 1. FCF Base & Normalizations

**FCFF identity used (MODULE_RULES Economic Consistency Gate 1):** `FCFF = NOPAT + D&A − Capex − ΔNWC`, built from the income statement and balance sheet rather than `CFO − capex`, because the multi-year forecast requires an explicit revenue/margin path that only the income-statement build supports. The base-year figure is cross-checked against the reported `CFO − capex` figure below (MODULE_RULES's preferred definition when a cash-flow statement exists) as a sanity check, not the forecast anchor.

| Item | Base-Year (FY26) Value | Normalization Applied | Source |
|---|---:|---|---|
| Reported FCF (CFO − total capex) | ₹6,872.19mn (₹687.2cr) | None — headline reported figure | `earnings/01_historical-financials.md` §1; Capital IQ Cash Flow tab |
| EBIT (FY26) | ₹5,015.93mn | None — reported | `earnings/01_historical-financials.md` §1 |
| Normalized tax rate | 25.17% | India's statutory corporate rate, used in place of FY26's reported effective rate (26.74%, itself distorted by a shrinking lower-tax-income benefit and rising unrecognized losses at the loss-making Busy Infotech/Livekeeping subsidiaries) [`business-model/09_moat.md` §3, citing FY26 Annual Report Note 26(c)]. **This is the canonical rate the moat module's own economic-moat NOPAT reconciles to (its §3 test was assessable) — this DCF reconciles to it rather than deriving an independent figure**, per MODULE_RULES workflow step 3. | `business-model/09_moat.md` §3 |
| NOPAT (FY26, constructed) | EBIT × (1 − 0.2517) = **₹3,753.42mn** | Applies the normalized rate above to reported EBIT | Computed (matches moat module's own ₹3,753.4mn cross-check exactly) |
| D&A (FY26) | ₹190.01mn (EBITDA₹5,205.94mn − EBIT₹5,015.93mn) | None | `earnings/01_historical-financials.md` §1 |
| Capex (FY26) | ₹70.00mn (0.45% of revenue) | None — trivial, asset-light | `earnings/01_historical-financials.md` §1 |
| ΔNWC (FY26, actual, operating-cash-flow-statement basis) | −₹2,843.21mn (a cash **source** — NWC became more negative) | None — reported CFO-bridge line | `earnings/06_earnings-quality.md` §1 |
| **FCFF (FY26, constructed) = NOPAT + D&A − Capex − ΔNWC(actual)** | 3,753.42 + 190.01 − 70.00 − (−2,843.21) = **₹6,716.64mn** | Reconciles to reported CFO−capex (₹6,872.19mn) within **~2.3%** (₹155.6mn) — the gap is the normalized-tax-rate vs. actual-cash-tax difference plus small non-cash reconciling items (SBC add-back, share of associate losses). Not a material unexplained gap. | Computed, executed snippet (§4) |

**Material normalization flagged for the forecast (read before §2/§4).** FY26's reported FCF benefited from an **acceleration**, not a steady-state level, of deferred-revenue growth: Unearned Revenue grew +17.1% in FY26, outpacing the +13.02% revenue growth, and `earnings/06_earnings-quality.md` §1 already flags that once this float-growth effect is stripped out, "ex-deferred-revenue-growth" operating FCF grew only **+5.8%** in FY26 versus **+41.5%** in FY25 — i.e., the structural cash-source benefit from the negative-working-capital model is *decelerating*. This DCF's working-capital forecast (§2, §4) normalizes the NWC/revenue ratio to a **flat** (not perpetually widening) level going forward, consistent with that finding — meaning Year-1 forecast FCFF is **lower** than the FY26 base-year actual. This is a deliberate, cited normalization, not an error; it is itemized again in §4.

**No cash-flow-statement or forward-estimate partial-data caps apply** — a full 5-year audited cash flow statement and 15–18-analyst consensus exist in the pool [`00_valuation-data-triage.md` §3, §5]. Confidence is, however, capped by two other factors flagged through this report: (1) an unusually wide dispersion in the sourced beta (§3), and (2) a structurally atypical (negative, asset-light) reinvestment profile that makes the standard financeable-growth cross-check (§4) not directly interpretable (bridge explained, not a data gap).

---

## 2. Forecast Assumptions

**Horizon: 8 explicit years (FY27–FY34)**, chosen because the business is still decelerating from a high-growth base and an 8-year fade gives the margin/growth path room to converge toward a defensible terminal state without an artificially short runway.

| Assumption | FY27 (Yr1) | FY28 (Yr2) | FY29 (Yr3) | FY30 (Yr4) | FY31 (Yr5) | FY32 (Yr6) | FY33 (Yr7) | FY34 (Yr8) | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 9.6% | 8.5% | 7.5% | 7.0% | 6.5% | 6.2% | 6.0% | 5.8% | 5.5% | Yr1 = **Street consensus** (15 analysts, ₹17,201.93mn FY27E, +9.6% YoY) [`earnings/04_guidance-consensus.md` §3]. Yr2–8 and terminal: **analyst assumption, not company-guided** — a continued fade of the observed 30.8%→21.5%→16.0%→13.0%→12.75%(TTM)→11.4%(latest qtr) deceleration trend [`earnings/01_historical-financials.md` §1, §2, §3], converging toward, but staying below, India's long-run nominal-GDP proxy (~10–11%) |
| EBIT margin % | 31.9% | 31.0% | 30.2% | 29.6% | 29.1% | 28.7% | 28.4% | 28.2% | 28.0% | Yr1: roughly flat vs FY26's 31.97%, consistent with consensus FY27 EBITDA margin (~33.9%, "roughly flat" vs FY26's 33.8%) [`earnings/04_guidance-consensus.md` §3]. Yr2–terminal: **analyst assumption**, fading toward a Cyclicality-Gate-benchmarked terminal (see note below) |
| Tax rate % | 25.17% | 25.17% | 25.17% | 25.17% | 25.17% | 25.17% | 25.17% | 25.17% | 25.17% | Normalized statutory rate, canonical anchor shared with `business-model/09_moat.md` §3 (§1 above) |
| Capex (% of revenue) | 0.5% | 0.5% | 0.5% | 0.5% | 0.5% | 0.5% | 0.5% | 0.5% | 0.5% | **Analyst assumption** — modestly above FY26's 0.45% actual, allowing for some tech-capex growth; capex has never exceeded 1.75% of revenue in 5 years and is immaterial to FCF in every year [`earnings/01_historical-financials.md` §1] |
| Δ Working capital (% of revenue, applied to Δrevenue) | −82.3% of Δrev | (same ratio) | (same ratio) | (same ratio) | (same ratio) | (same ratio) | (same ratio) | (same ratio) | (same ratio) | Operating NWC (current assets ex-cash/investments − current liabilities) = **−₹12,916.52mn at FY26** = **−82.3% of FY26 revenue** [`earnings/01_historical-financials.md` fn.4]. Held **flat** as a ratio-to-revenue for the whole forecast (see normalization note in §1) — **analyst assumption**, not a company-disclosed driver |

**Terminal margin — Cyclicality Gate benchmarking (MODULE_RULES Economic Consistency Gate 6).** External-dependency flags two High-dependency rows (Consumer/SME cycle, Geopolitics) for this business [`business-model/10_external-dependency.md` §1], so a single-point margin assumption is not enough — the terminal margin is benchmarked against BOTH anchors:
- **Peer-normal:** Just Dial (the one named peer with disclosed, filing-comparable margins) runs a **25.3% LTM EBIT margin** [`business-model/09_moat.md` §3, Company Comparable Analysis, Operating Statistics tab].
- **Company's own prior-trough:** IndiaMART's own EBIT margin bottomed at **24.44% (FY23) / 24.64% (FY24)** during its FY23 cost build-out [`earnings/01_historical-financials.md` §1].
- **Terminal EBIT margin used: 28.0%** — above both anchors by a modest, evidenced premium (+270bps over peer-normal, +336bps over the company's own trough), justified by the moat module's own (fragile) finding of a +248bps excess return over WACC on the base-case CAPM estimate [`business-model/09_moat.md` §3] — but well below FY26's actual 31.97%, and far below the FY25 "snapback" peak of 35.45% and the FY22 pandemic-era high of 39.27% [`earnings/01_historical-financials.md` §1]. Management itself describes the FY26/Q1 FY27 margin level as "elevated" from a temporary customer-acquisition-spend pullback [`earnings/03_margin-drivers.md` §8], so this DCF does **not** extrapolate the current level forward — it fades toward the peer/trough-anchored range instead.

**Working-capital driver — revenue-linked, not a flat absolute.** IndiaMART is a **negative-working-capital business** (customers prepay annual/multi-year subscriptions, so Unearned Revenue funds operations) — operating NWC was **−₹12,916.52mn at FY26 (−82.3% of revenue)** [`earnings/01_historical-financials.md` fn.4]. The forecast holds this ratio flat and applies it to each year's incremental revenue (`ΔNWC_t = ratio × (Revenue_t − Revenue_{t−1})`), so the cash-source effect scales with revenue growth as required, rather than being a flat rupee figure. This is a deliberate **normalization** relative to history — the ratio itself had been drifting more negative every year (deferred revenue growing faster than revenue) — flagged and cited in §1.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 6.85% | India 10-year G-Sec yield [Web: BusinessToday, 2026-08-05, "10 year G Sec yield climbs to 6.85% in July" — dated, unverified; cross-checked against a live Aug-2026 quote of ~6.78–6.79% (Web: TradingEconomics, 2026-08-12) — same order of magnitude, 6.85% retained as the sourced figure already anchoring the cross-module moat estimate] |
| Equity-risk premium (India) | 7.31% | Damodaran India country equity-risk-premium dataset, July 2026 update [Web, dated, unverified — same figure already used in `business-model/09_moat.md` §3] |
| Beta — **computed input** (mechanical) | 0.26 | Capital IQ Public Company Profile export / 5-year monthly beta, corroborated by Yahoo Finance (0.24, 5Y monthly) [Web: Yahoo Finance, INDIAMART.NS, 2026-08-14] |
| Beta — **used input** (see override below) | 0.44 | Median of three independently-sourced betas: Yahoo Finance 0.24, SimplyWallSt 0.44, TradingView 0.91 [Web, all 2026-08-14, unverified] |
| Cost of equity — computed (β=0.26) | 6.85% + 0.26 × 7.31% = **8.75%** | CAPM |
| Cost of equity — used (β=0.44) | 6.85% + 0.44 × 7.31% = **10.07%** | CAPM |
| Pre-tax cost of debt | 7.5% | **Analyst assumption** — the company carries no bank borrowings (its only "debt" is ₹216.28mn of capitalized lease liabilities) [`valuation/01_price-and-capital-structure.md` §4]; 7.5% is a representative India investment-grade corporate-lease financing rate. Immaterial to the blend given the weight below. |
| Tax rate (for the debt tax shield) | 25.17% | Same normalized rate as §1/§2 |
| Equity / debt weights (market value) | 99.03% equity / 0.97% debt | Total Debt/Capital ≈0.97% at FY26-end [`business-model/09_moat.md` §3, citing Capital IQ Ratios tab] |
| **WACC — computed (mechanical, β=0.26)** | **8.72%** | `0.9903 × 8.75% + 0.0097 × 7.5% × (1−0.2517)` |
| **WACC — used (β=0.44)** | **10.02%** (rounded 10.0%) | `0.9903 × 10.07% + 0.0097 × 7.5% × (1−0.2517)` |

**Formula (pinned, executed):** `WACC = w_e·k_e + w_d·k_d·(1 − t)`. No preferred equity exists, so no `w_p·k_p` term. `k_e = risk-free rate + beta × ERP` (CAPM). `w_e`/`w_d` are market-value weights of equity/debt and sum to 1.00. `t` is the same 25.17% normalized rate used for NOPAT.

**WACC override — shown, justified, bounded (MODULE_RULES override discipline).** The pool/CIQ-sourced beta (0.26) sits at the extreme low end of a genuinely wide 0.24–0.91 dispersion across three independently-sourced vendors (Yahoo 0.24, SimplyWallSt 0.44, TradingView 0.91) — and `business-model/09_moat.md` §3 *itself* already flags this specific beta as "unusually low… not robust," noting that a "more conventional beta" (0.8–1.0) for a comparable small/mid-cap Indian internet name would push cost of equity to 12.7–14.2%. Combined with this business's High-flagged Consumer/SME-cycle and Geopolitics external-dependency rows [`business-model/10_external-dependency.md` §1] and a 66/100 (inverted — high) earnings-volatility score [`earnings/07_earnings-sensitivity.md` §7], a beta of 0.26 is not credible as the sole input. This DCF therefore **uses the median of the three sourced betas (0.44)** rather than the single lowest one. **Override magnitude: 10.02% − 8.72% = 1.30pp — within the ±1.5pp cap.**

**Cross-check against the moat module's inferred cost of capital (Gate 4).** The moat module's own base-case WACC (8.75%, β=0.26) is within 1.27pp of the used WACC here (10.02%) — consistent, no action needed. But the moat module's own flagged **alternative** ("conventional beta," WACC ≈12.7–14.2%) diverges from the used WACC by **2.7–4.2pp — over the 2pp threshold**. Per Gate 4, this is handled by **spanning both in the sensitivity exhibit** rather than silently picking one: §7 shows the standard ±1% grid around the used WACC, and a labelled addendum shows the DCF result at WACC = 13.0% (the midpoint of the moat module's flagged conventional-beta range).

**Sanity bounds (Gate 4, executed check):**
```
after-tax k_d = 7.5% × (1 − 0.2517) = 5.61%
k_e (used)     = 10.07%
WACC (used)    = 10.02%
Check: after-tax k_d (5.61%) ≤ WACC (10.02%) < k_e (10.07%)  → PASSES (WACC sits just under k_e,
  appropriate given the ~99% equity weight — this is a near-all-equity-financed company).
```
India is not a developed-market (USD/EUR/GBP) economy, so the `rf + 1.4×ERP` mega-cap ceiling test does not apply; no separate justification trigger fires there.

**Terminal growth vs WACC:** used WACC (10.02%) − terminal g (5.5%, §5) = **4.52pp**, comfortably positive — no near-zero-denominator risk in the base case (checked again per-cell in §7).

---

## 4. Free Cash Flow Forecast & Discounting

**Discounting convention: mid-year** (cash flows assumed to arrive, on average, mid-period — discount factor `1/(1+WACC)^(t−0.5)` for the explicit years). The terminal value, being a *value* as of the end of Year 8 rather than a flow, is discounted at the **full** Year-8 factor (`1/(1+WACC)^8`) — standard practice combining mid-year flows with an end-of-period terminal stock value.

| Year | Revenue | EBIT | NOPAT | D&A | Capex | ΔNWC (cash effect) | FCFF | Discount Factor (t) | PV of FCFF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY27 (Yr1) | 17,196.7 | 5,485.7 | 4,105.0 | 189.2 | 86.0 | −1,240.0 | 5,448.2 | 0.9534 (t=0.5) | 5,194.1 |
| FY28 (Yr2) | 18,658.4 | 5,784.1 | 4,328.2 | 205.2 | 93.3 | −1,203.3 | 5,643.5 | 0.8665 (t=1.5) | 4,890.2 |
| FY29 (Yr3) | 20,057.8 | 6,057.5 | 4,532.8 | 220.6 | 100.3 | −1,152.0 | 5,805.1 | 0.7876 (t=2.5) | 4,571.9 |
| FY30 (Yr4) | 21,461.8 | 6,352.7 | 4,753.7 | 236.1 | 107.3 | −1,155.8 | 6,038.3 | 0.7158 (t=3.5) | 4,322.4 |
| FY31 (Yr5) | 22,856.9 | 6,651.3 | 4,977.2 | 251.4 | 114.3 | −1,148.4 | 6,262.7 | 0.6506 (t=4.5) | 4,074.6 |
| FY32 (Yr6) | 24,274.0 | 6,966.6 | 5,213.1 | 267.0 | 121.4 | −1,166.6 | 6,525.4 | 0.5913 (t=5.5) | 3,858.7 |
| FY33 (Yr7) | 25,730.4 | 7,307.4 | 5,468.2 | 283.0 | 128.7 | −1,199.0 | 6,821.5 | 0.5375 (t=6.5) | 3,666.3 |
| FY34 (Yr8) | 27,222.8 | 7,676.8 | 5,744.6 | 299.5 | 136.1 | −1,228.5 | 7,136.4 | 0.4885 (t=7.5) | 3,486.2 |

**Sum of PV of explicit FCFs: ₹34,064.4mn**

**Working-capital sign — checked.** IndiaMART is a negative-working-capital business (NWC = −82.3% of revenue). With the ratio held flat, revenue growth pushes NWC further negative every year (ΔNWC is negative in every row above), which under `FCFF = NOPAT + D&A − Capex − ΔNWC` **adds** cash to FCF each year (a negative ΔNWC subtracts a negative number). This matches the sign the growth+held-ratio combination should produce — verified against the sign-check rule, not inverted.

**Financeable-growth cross-check (Gate 2) — bridge quantified, not left hanging.**
```
Reinvestment rate (FY26, actual) = (Capex − D&A + ΔNWC) / NOPAT
                                  = (70.00 − 190.01 + (−2,843.21)) / 3,753.42
                                  = −2,963.22 / 3,753.42 = −78.95%
Implied growth = ROIC (5-yr avg, 11.23%, gross-capital basis per `business-model/09_moat.md` §3) × reinvestment rate
               = 11.23% × (−78.95%) = −8.87%
```
This is **~14.4pp below** the modeled terminal g (5.5%) — far outside the ~1.5pp tolerance. The bridge: this ROIC-reinvestment formula is built for capital-intensive growth (fixed-asset/greenfield reinvestment funding future output) and is **structurally not the right lens for an asset-light, negative-working-capital subscription marketplace** — IndiaMART's growth is financed almost entirely through **P&L operating expense already embedded in the modeled EBIT margin fade** (customer-acquisition spend, customer-support/verification cost, technology spend — all itemized as expensed opex, not capitalized investment, in `earnings/03_margin-drivers.md` §2), not through capex or working-capital consumption. Capex is 0.5% of revenue and NWC is a persistent cash **source**, not a use, so the mechanical formula will always show a deeply negative "reinvestment rate" for this business model regardless of how fast it is actually growing — a structural feature, not an unexplained gap. Per Gate 2's own text, **because the bridge is quantified and explained here**, terminal g is not mechanically forced down to −8.87%. As an additional, independent conservatism check, however, this DCF's **headline base case uses the lower of its two terminal methods** (§5/§6) rather than the richer one — the practical effect of the same conservative-default instinct the Gate is designed to enforce.

**ROIC drift (Gate 3):** a standard ROIC-vs-WACC drift check is not directly meaningful here either — IndiaMART's net-of-cash invested capital is **negative** (cash and treasury investments exceed total debt+equity capital), so ROIC on that basis is undefined [`business-model/09_moat.md` §3]. The terminal EBIT margin (28.0%, §2) is the operative discipline instead: it sits only modestly above the peer/trough-anchored range, not at a level implying large, durable persistence of excess returns — consistent with the moat module's own "narrow, borderline" verdict (§5 below).

**Executed snippet (WACC blend, PV-of-FCFF sum, and the components above) — command and raw output:**
```
$ python3 dcf_indiamart.py
D&A0 190.01 NWC ratio -82.32 %
NOPAT0 3753.42
FCFF0 constructed (NOPAT+D&A-Capex-dNWC_actual) 6716.64
Reported CFO-Capex FY26 6872.19  diff: 155.55  pct: 2.26

Reinvestment rate FY26 (capex - D&A + dNWC)/NOPAT: -78.95 %
Implied growth (ROIC x reinvestment rate): -8.87 %

ke computed (beta 0.26): 8.75 %  WACC computed: 8.72 %
ke used (beta 0.44): 10.07 %  WACC used: 10.02 %
Override delta (pp): 1.3
After-tax kd: 5.61 %

Sum PV of explicit FCFF: 34064.4
```

---

## 5. Terminal Value

Two methods are built and cross-checked, per the report structure's requirement to sanity-check one against the other.

**Method A — Gordon growth:**
`TV = FCFF_{n+1} / (WACC − g) = FCFF_8 × (1 + g) / (WACC − g)`
```
FCFF Yr9 (terminal) = 7,136.4 × 1.055 = 7,528.9
TV (undiscounted) = 7,528.9 / (0.1002 − 0.055) = 7,528.9 / 0.0452 = 166,451.9
Discount factor (Yr8, full-year) = 1/(1.1002)^8 = 0.4657
PV of Terminal Value (Gordon) = 166,451.9 × 0.4657 = 77,520.2
```
`WACC − g` = 4.52pp, comfortably positive — no near-zero-denominator risk in the base case.

**Cross-check — implied exit multiple (required before trusting the Gordon number).** Terminal-year (Yr9) EBITDA = EBIT₉ (₹8,099.1mn) + D&A₉ (₹315.9mn) = **₹8,415.0mn**. The Gordon TV of ₹166,451.9mn implies an exit multiple of **166,451.9 / 8,415.0 = 19.78x EV/EBITDA** — this is **richer than IndiaMART's own current actual trading multiple of ~14.15x** (EV(broad) ₹73,644.05mn / FY26 EBITDA ₹5,205.94mn [`valuation/01_price-and-capital-structure.md` §4]), despite the terminal-year business being *more mature and slower-growing* (5.5% terminal growth vs FY26's 13.0%; 28.0% terminal EBIT margin vs FY26's 31.97%). A slower, lower-margin, maturity-stage version of this business should not command a *richer* multiple than today's still-growing version — this is the exact cross-check divergence the report structure requires flagging, and it is flagged here rather than accepted at face value. The reason it arises mechanically: FCFF/EBITDA conversion is unusually high in this negative-working-capital, near-zero-capex model (~90% in the terminal year), so even a moderate `WACC−g` gap compounds into a rich implied multiple.

**Method B — Exit multiple (used as the base-case anchor, per the reconciliation above):**
`TV = terminal EBITDA × exit multiple`
```
Assumed terminal EV/EBITDA multiple: 12.0x — analyst assumption, set below IndiaMART's own current ~14.15x
  actual multiple to reflect the maturity/deceleration state (5.5% growth, 28.0% margin) modeled for Year 9,
  and consistent with the moat module's own "narrow, borderline" durability read (not a premium/growth multiple).
TV (undiscounted) = 8,415.0 × 12.0 = 100,979.6
PV of Terminal Value (exit-multiple) = 100,979.6 × 0.4657 = 47,026.2
```

**Reconciliation and headline choice.** Because the two methods diverge materially (Gordon implies a terminal multiple richer than today's actual, exit-multiple does not), and per MODULE_RULES Core Principle 6 ("when methods conflict, default to the lower fair value and say why"), **this report uses the exit-multiple method (12.0x) as the base-case terminal value**. The Gordon-growth result is retained and shown throughout as the upper-bound cross-check, not the headline.

| | PV of Terminal Value | Enterprise Value | **TV as % of EV** |
|---|---:|---:|---:|
| **Base case — Exit multiple (12.0x)** | 47,026.2 | 34,064.4 + 47,026.2 = **81,090.6** | **58.0%** |
| Cross-check — Gordon growth (g=5.5%) | 77,520.2 | 34,064.4 + 77,520.2 = **111,584.6** | **69.5%** |

Both are below the 75%-of-EV terminal-dominance flag threshold, though the Gordon cross-check (69.5%) sits close to it — a further reason this report leans on the exit-multiple anchor for the headline.

**Structural-decline / runoff terminal trigger — checked, not triggered.** Per the trigger rule: (a) fires only when `business-model/09_moat.md` returns **"No moat proven"** — this company's verdict is **"Narrow moat"** (a moat *is* evidenced, if fragile), so trigger (a) does not fire verbatim; (b) fires when moat trajectory is **"eroding"** OR `business-model/07_business-quality.md`'s rate-of-change score is **≤~40**. The moat module explicitly states trajectory is **"stable, with a specific near-term erosion warning"** — "stable," not "eroding," is the level call it makes — and the business-quality rate-of-change score is **45** (inside the Mixed band, above the ≤40 threshold) [`business-model/07_business-quality.md` §1]. **Neither trigger fires**, so no separate declining-perpetuity/runoff terminal is built here. The moat module's own named erosion risks (negative net supplier adds in 3 of the last 4 quarters, FY26 margin compression, the unsettled AI-search/agentic-commerce discovery layer) are already reflected in this DCF's conservative terminal-margin choice (28.0%, well below FY26's 31.97% and the FY25 peak of 35.45%) and in the choice of the lower (exit-multiple) terminal method — not ignored, but not escalated to a formal second bear terminal, since the specific trigger language is not met on the current evidence.

---

## 6. DCF Output

| Step | Value (₹mn) |
|---|---:|
| PV of explicit FCFs | 34,064.4 |
| + PV of terminal value (exit-multiple, base case) | 47,026.2 |
| **= Enterprise value (base case)** | **81,090.6** |
| − Net debt (broad basis, canonical per `01`, net **cash** of −33,670.3 as of 30-Jun-2026) | −(−33,670.3) = +33,670.3 |
| − Minority / preferred | 0 (none disclosed) [`valuation/01_price-and-capital-structure.md` §4] |
| **= Equity value (base case)** | **114,760.9** |
| ÷ Diluted shares (LTM weighted-average, per `01`'s canonical fair-value share count) | 60.29172mn |
| **= Intrinsic value per share (base case)** | **≈ ₹1,903.5** |
| vs current price (₹1,784.60, 2026-08-12 close, `01` anchor) | **+6.7%** (base case sits modestly above price) |
| Cross-check — Gordon-growth terminal, same EV→equity bridge | Equity ₹145,254.9mn → **≈ ₹2,409.2/share** (**+35.0%** vs price) — retained as an upper-bound cross-check, flagged in §5 as terminal-multiple-rich, not the headline |

**Executed snippet (EV → equity → per-share bridge, both methods):**
```
Net debt (broad, canonical): -33670.3 INR mn
Base case (12x exit multiple): EV=81092.7 Equity=114763.0 PerShare=Rs.1903.5  (TV%EV 58.0%)
Cross-check (Gordon g=5.5%):    EV=111584.5 Equity=145254.8 PerShare=Rs.2409.2 (TV%EV 69.5%)
```

**WACC-cross-check addendum (Gate 4, spanning the moat module's flagged "conventional beta" alternative, per §3):** at WACC = 13.0% (midpoint of the moat module's own 12.7–14.2% conventional-beta range) with the same 12.0x exit multiple, per-share value falls to **≈ ₹1,701** — **below** the current price of ₹1,784.60. This is the single most consequential sensitivity in this DCF: whether the stock screens modestly cheap or modestly rich on intrinsic cash flows depends almost entirely on which beta estimate is trusted, given how thin (0.24 vs 0.91) the vendor dispersion is for this name.

---

## 7. Sensitivity Grid (per-share intrinsic value)

Grid built on the **base-case method (exit multiple)**, per the report structure's "or exit multiple" alternative to a Gordon-growth grid — this is the method that anchors the headline value in §6. WACC across columns, exit multiple down rows (executed):

| Terminal EV/EBITDA multiple | WACC 9.02% (−1pp) | WACC 10.02% (base) | WACC 11.02% (+1pp) |
|---|---:|---:|---:|
| 13.0x (+1x) | ₹2,052 | ₹1,968 | ₹1,891 |
| **12.0x (base)** | **₹1,982** | **₹1,903** | **₹1,831** |
| 11.0x (−1x) | ₹1,912 | ₹1,838 | ₹1,770 |

**Cross-check grid — Gordon growth (g down rows), same WACC columns, shown for completeness (§5's upper-bound method):**

| Terminal growth (g) | WACC 9.02% (−1pp) | WACC 10.02% (base) | WACC 11.02% (+1pp) |
|---|---:|---:|---:|
| 6.0% (+0.5%) | ₹3,222 | ₹2,576 | ₹2,187 |
| **5.5% (base)** | **₹2,919** | **₹2,409** | **₹2,084** |
| 5.0% (−0.5%) | ₹2,691 | ₹2,276 | ₹1,999 |

No grid cell in either table has `WACC − g ≤ 0` or falls within ~0.5pp of zero — the minimum gap in the Gordon grid is 9.02% − 6.0% = 3.02pp, comfortably positive, so no cell requires an NM flag.

**Dispersion read:** across the base-case (exit-multiple) grid, per-share value ranges **₹1,770–₹2,052** (a ±7–8% band around the ₹1,903 base point). Including the Gordon-growth cross-check widens the full football field to **₹1,701 (moat-alternative-WACC addendum) to ₹3,222 (Gordon growth, low WACC, high g)** — a wide range that reflects genuine, evidenced uncertainty in the beta/WACC input (§3), not a modeling error.

---

## 8. Intrinsic Read

**Base-case intrinsic value: ≈ ₹1,903/share** (exit-multiple terminal method, 12.0x terminal EV/EBITDA, WACC 10.0%), against a current price of ₹1,784.60 — a **+6.7%** premium of intrinsic value to price. The base-case sensitivity grid disperses this point across **₹1,770–₹2,052** (±1x exit multiple, ±1pp WACC); the Gordon-growth cross-check sits materially higher (₹2,409, flagged in §5 as resting on a terminal multiple — 19.8x — richer than the company's own current 14.15x actual multiple despite modeling a slower, lower-margin, more mature business by then, so it is treated as an upper bound, not the headline). The single assumption this value is most sensitive to is **the beta/WACC input, not the growth or margin path**: at WACC = 13.0% (the midpoint of the moat module's own flagged "conventional beta" alternative for this stock), the same DCF produces **≈ ₹1,701/share — below today's price** — meaning the entire "modestly undervalued on cash flows" read flips to "roughly fairly valued to modestly rich" purely on which of two defensible, independently-sourced beta estimates (0.24 vs 0.91, a genuinely fourfold spread across vendors) is trusted for this specific stock.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — INDIAMART

**Business type:** Operating (India-focused, subscription-funded B2B online marketplace; single reportable segment on the >85%-of-EBIT test) [`04_intrinsic-dcf.md` header; `06_sum-of-the-parts.md` §1]. Per the Business-Type Method Map, this is a standard FCFF/enterprise-value (EV) reverse-DCF — not an equity-direct DDM/residual-income model (that map applies only to Financials/REITs).

**Reconciliation to `04`.** This agent inverts `04_intrinsic-dcf.md`'s own model exactly, per MODULE_RULES Calculation Standard 9: same WACC (10.02%, used), same normalized FY26 FCF base build, same terminal method (exit multiple, 12.0x, `04`'s headline base case), same terminal growth assumption (5.5%, used only to step revenue to the Year-9 terminal-EBITDA calculation), same 8-year horizon (FY27–FY34), and the same mid-year discounting convention. Nothing here is re-derived independently.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | ₹1,784.60 (2026-08-12 close, pool-verified) | `01_price-and-capital-structure.md` §1, §7 |
| Enterprise value (EV) — broad basis, canonical | ₹73,644.05mn (₹7,364.40 crore) | `01_price-and-capital-structure.md` §4, §7 — this is the target the reverse-DCF solves against |
| FCF base (FY26, normalized, NOPAT-and-driver-built) | ₹6,716.64mn (reconciles to reported CFO − capex of ₹6,872.19mn within ~2.3%) | `04_intrinsic-dcf.md` §1 (used verbatim) |
| Discount rate (WACC) used | 10.02% (≈10.0%) — CAPM cost of equity 10.07% (rf 6.85% + β 0.44 × ERP 7.31%) blended with after-tax cost of debt 5.61% at 99.03%/0.97% equity/debt weights | `04_intrinsic-dcf.md` §3 (used verbatim; mechanically-computed alternative at β=0.26 was 8.72% — not used, per `04`'s own override discipline) |
| Terminal growth (g, Gordon; used to step Yr9 revenue for the terminal-EBITDA calc) | 5.5% | `04_intrinsic-dcf.md` §5 |
| Terminal method (headline) | Exit multiple, 12.0x terminal EV/EBITDA (below IndiaMART's own current ~14.15x actual multiple) | `04_intrinsic-dcf.md` §5 |
| Forecast horizon | 8 explicit years (FY27–FY34) | `04_intrinsic-dcf.md` §2 |
| Discounting convention | Mid-year for explicit FCFs (t−0.5), full-year for terminal value | `04_intrinsic-dcf.md` §4 |
| EBIT margin path (held fixed as the primary solve's model) | 31.9% (FY27) fading to 28.0% terminal | `04_intrinsic-dcf.md` §2 |
| Tax rate, capex %, NWC ratio (held fixed) | 25.17% tax; 0.5% of revenue capex; NWC = −82.32% of revenue, applied to Δrevenue | `04_intrinsic-dcf.md` §1–§2 |

## 2. Implied Expectations

**What was held fixed:** WACC (10.02%), the 8-year horizon, the terminal method and multiple (12.0x exit EV/EBITDA), the terminal-growth step (5.5%, used only to project Yr9 revenue for the terminal-EBITDA calculation), the normalized FY26 FCF base, the EBIT-margin fade schedule from `04` (31.9%→28.0%), the tax rate (25.17%), capex (0.5% of revenue) and the NWC ratio (−82.32% of revenue). **What was solved for:** a single flat revenue-growth rate applied uniformly across all 8 explicit years, such that the resulting FCFF stream's present value plus the present value of the terminal value equals today's EV (₹73,644.05mn, broad basis, matching `01`'s canonical bridge). Executed via `scipy.optimize.brentq` — command and root shown below.

```
$ python3 reverse_dcf.py
PRIMARY SOLVE: implied flat revenue/FCFF CAGR = 5.995%  (EV check = 73644.05 vs target 73644.05)
Implied FY34 (Yr8) revenue = 24999.6 vs FY26 actual 15690.42
04's own base-case revenue CAGR (declining schedule) = 7.130% -> FY34 revenue 27222.8
At primary solve g=5.995%: PV(FCFF)=30741.2, PV(TV)=42902.9, TV%EV=58.3%
```

Because the model's EBIT margin (and hence FCFF/revenue conversion) is held at `04`'s fixed schedule, the solved growth rate is simultaneously the implied revenue CAGR and the implied FCFF CAGR — they are the same number under this construction.

A secondary solve holds `04`'s own revenue-growth schedule fixed (9.6% fading to 5.5%) and instead solves for the flat EBIT margin (applied uniformly to all 8 years plus the terminal year) that reproduces the same EV target:

```
Implied flat EBIT margin (all years + terminal) to hit EV target,
holding 04's revenue schedule fixed: 25.76%
(for reference: 04's own margin path fades 31.9% -> 28.0%; FY26 actual 31.97%;
peer-normal 25.3%; company prior trough 24.44-24.64%)
```

| What the Price Implies | Solved Value |
|---|---:|
| Implied flat revenue/FCFF CAGR over the 8-year horizon (margins held at `04`'s schedule) | **5.995% (≈6.0%)** |
| Implied years of growth above India's long-run nominal-GDP proxy (~10–11%, per `04`'s own terminal-growth ceiling discussion) | **0 years** — the implied 6.0% CAGR sits below the GDP proxy in every explicit year, so the price does not require even a single year of above-trend growth |
| Implied steady-state EBIT margin (holding `04`'s own revenue-growth schedule fixed instead) | **25.76%** — sits between the peer-normal anchor (Just Dial, 25.3% LTM EBIT margin) and modestly above the company's own FY23/FY24 prior-trough margin (24.44%/24.64%), well below FY26's actual 31.97% |

Both solves point the same direction: the price is built on an assumption set below the company's own recent operating levels, not above them.

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied revenue CAGR = 6.0% (flat, 8yr) | FY22→FY26 revenue CAGR = 20.13% (4yr); annual YoY decelerating 30.78% (FY23) → 21.45% (FY24) → 16.01% (FY25) → 13.02% (FY26); latest TTM +12.75%; latest quarter (Q1 FY27) +11.37% YoY, the softest of the last 8 quarters [`earnings/01_historical-financials.md` §1, §2, §6] | ARPU has grown ~8–9%/yr for 4 straight years [`earnings/07_earnings-sensitivity.md` §2, Row "ARPU / price realization"]; on its own, continued 8%/yr ARPU growth would already clear the implied 6.0% revenue bar even if paying-supplier count is flat to mildly negative (see §4 market-ceiling decomposition below) | **Yes — the bar reads as conservative.** Even the company's own already-decelerated latest quarter (11.37%) sits nearly double the implied 8-year CAGR |
| Implied steady-state EBIT margin (secondary solve) = 25.76% | FY26 actual EBIT margin 31.97%; 5-year range 24.44% (FY23 trough) to 39.27% (FY22 pandemic peak) [`earnings/01_historical-financials.md` §1] | `business-model/09_moat.md` §3 anchors terminal margin between the peer-normal 25.3% (Just Dial) and the company's own 24.44–24.64% prior trough; `04`'s own terminal assumption (28.0%) already sits above both anchors | **Yes.** 25.76% sits inside the peer/trough-anchored range `04` itself validated, and below every margin the company has reported in the last 4 years |

The market's implied expectations read as **conservative, not aggressive**. A flat 6.0% revenue CAGR is below every annual growth rate the company has posted in the last five years, below its most recent (already-slowing) quarterly print, and below India's long-run nominal-GDP growth proxy in every single year of the forecast — meaning the price does not require the deceleration trend (30.78%→...→11.37%) to bottom out anywhere near the current pace; it can continue falling well past it and the price would still be justified. This is consistent with `04`'s own finding that base-case intrinsic value (₹1,903/share, +6.7% vs price) sits modestly above today's price on the identical assumption set [`04_intrinsic-dcf.md` §8].

**Market-ceiling sanity check.** No dollar-denominated total-addressable-market figure exists in the data pool for India's B2B SME lead-generation/marketplace category, so this check uses the best available proxy: paying-supplier count against India's Udyam-registered-enterprise universe (a low-tier, filing-cited proxy, not a revenue-based TAM — CLAUDE.md §4). The implied 6.0% revenue CAGR is decomposed into ARPU growth × paying-supplier growth, holding ARPU at its observed 4-year ~8%/yr trend [`earnings/07_earnings-sensitivity.md` §2]:

```
Implied subscriber (paying-supplier) net-add CAGR needed if ARPU grows at historical ~8%/yr: -1.856%
Implied paying-supplier count at FY34 (Yr8): 189,379 vs current 220,000
vs Udyam-registered enterprise universe (FY26): 79,400,000
  -> implied penetration = 0.239% (current penetration = 0.277%)
```

The market's implied 6.0% growth bar does not require capturing *more* of the addressable Udyam-registered base (79.4mn enterprises, `business-model/10_external-dependency.md` §1) — it is consistent with paying-supplier count actually *shrinking* modestly (to 189,379 from 220,000 today) if ARPU keeps compounding at its historical rate, and with penetration of the addressable base falling, not rising. Since this check can only ever raise the bar on an implied growth read, and here it finds no capture constraint at all, it does not change the "conservative" verdict above — there is no market-ceiling kill signal on this evidence.

## 4. Robustness

| Discount Rate | Implied Revenue/FCF CAGR to Justify Price |
|---|---:|
| WACC −1% (9.02%) | 5.207% |
| WACC (10.02%, used) | 5.995% |
| WACC +1% (11.02%) | 6.782% |
| *Addendum:* WACC = 13.0% (`04`'s flagged "conventional beta" midpoint, §3/§6) | 8.337% — still below India's ~10–11% nominal-GDP proxy and below the company's own FY26/TTM growth |

```
$ python3 reverse_dcf.py
WACC=9.02%  -> implied CAGR = 5.207%
WACC=10.02%  -> implied CAGR = 5.995%
WACC=11.02%  -> implied CAGR = 6.782%
```

| FCF Base | Implied Revenue/FCF CAGR to Justify Price |
|---|---:|
| Low / Base (normalized constructed, ₹6,716.64mn — `04`'s own base) | 5.995% |
| High (literal reported CFO − capex, ₹6,872.19mn, +2.3%) | 5.677% |

```
Low (normalized constructed, =04 base): scale=1.00000 -> implied CAGR = 5.995%
High (literal reported CFO-capex): scale=1.02316 -> implied CAGR = 5.677%
```

**Limitation on the FCF-base band:** `04` derives only a normalized-vs-literal-reported reconciliation for the FY26 base year (a ~2.3% spread), not a separate bear/bull FCF-base scenario — no broader band exists upstream to test against, so this row likely understates the true range of FCF-base uncertainty; it is not invented here per the instruction to reuse only figures `04` already derived.

Terminal value is 58.3% of EV at the primary solve — just under the ~60% threshold that would make a terminal-`g` sensitivity mandatory, but close enough (and `04`'s own Gordon cross-check sits at 69.5% of EV) that it is shown for prudence:

| Terminal g | Implied Revenue/FCF CAGR to Justify Price |
|---|---:|
| g − 0.5% (5.0%) | 6.034% |
| g (5.5%, used) | 5.995% |
| g + 0.5% (6.0%) | 5.957% |

```
terminal g=5.00% -> implied CAGR = 6.034%
terminal g=5.50% -> implied CAGR = 5.995%
terminal g=6.00% -> implied CAGR = 5.957%
```

**Dominant input:** the discount rate (WACC), not the FCF base or terminal `g`. A ±1pp WACC move shifts the implied CAGR by roughly ∓0.8pp (a ~1.6pp swing across the 2pp WACC range tested), while the FCF-base band shifts it by only 0.32pp (5.995%→5.677%) and terminal-`g` ±0.5% moves it by under 0.04pp — negligible, because the headline terminal method here is a fixed exit multiple (12.0x), not a Gordon perpetuity, so `g` only has a second-order effect (stepping Yr9 revenue before applying the fixed multiple). This mirrors `04`'s own §8 finding that the single most consequential input to this stock's valuation is the beta/WACC estimate, not the growth or margin path — the same instability that flips `04`'s intrinsic read from "+6.7% above price" to "below price" at WACC 13.0% also compresses (but, per the addendum row above, does not reverse) the "conservative pricing" read here.

## 5. What's-Priced-In Read

At ₹1,784.60, the market is pricing in roughly **6.0% flat revenue growth (compound annual growth rate — CAGR) over the next 8 years (FY27–FY34)** on `04`'s own margin, tax, capex and working-capital assumptions. That is **conservative**: it is below every annual growth rate IndiaMART has posted in the last five years (30.78% down to 13.02%), below its most recent, already-decelerated quarter (11.37% YoY), below India's own long-run nominal-GDP growth proxy (~10–11%) in every single forecast year, and it does not require capturing any additional share of the addressable Udyam-registered SME base — continued ARPU growth alone at the company's observed 4-year ~8%/yr pace would clear the bar even with a modestly shrinking paying-supplier count. The read is most sensitive to the WACC/beta estimate (`04`'s own flagged instability, β 0.24–0.91 across vendors) rather than to growth or margin, but even at the higher, "conventional-beta" WACC (13.0%) the implied bar (8.3%) stays below trend growth. Because the implied expectations sit below what the company's own recent history and the earnings-module driver evidence suggest is achievable, this reads as a modest source of upside, not downside — consistent with, and reinforcing, `04`'s own base-case intrinsic read of +6.7% above price.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — INDIAMART

**Reporting currency / regime:** INR (Indian Rupee), Ind AS (India's IFRS-converged accounting standard), fiscal year ended 31 March. All figures in ₹ millions unless stated. Segment source: FY26 Integrated Annual Report (Ind AS), Note 32 — Segment information [`IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf`], cross-checked against `Financials (1).xls, Segments tab` (Capital IQ export, FY21A–FY26A). Upstream anchors reused verbatim from `01_price-and-capital-structure.md` (Reconciliation Gate 1): price ₹1,784.60 (2026-08-12 close, pool-verified), diluted shares 60,291,720, net debt (broad basis, canonical) ₹(33,670.3)mn net cash, EV (broad basis, canonical) ₹73,644.05mn.

## Partial-Data Rule Applied: Single-Segment Collapse

IndiaMART reports two segments, but one is overwhelmingly dominant on both tests:
- **Revenue test:** Web and Related Services = 91.96% of FY26 consolidated revenue (₹14,429.38m of ₹15,690.42m).
- **Profit test:** Web and Related Services = 100.53% of FY26 consolidated segment result (₹5,328.56m of ₹5,300.41m total), because the second segment, Accounting Software Services, posted a small operating **loss** (₹(28.15)m) that year.

Both clear the >85%-of-EBIT single-segment threshold. **Effectively single-segment — SOTP collapses to the consolidated read.** Per the partial-data rule, this report does not force a spurious two-segment breakup; it provides the dominant-segment multiple sanity check below. There is no unallocated corporate cost bucket on the income-statement side to drop by assertion — the two reportable segments' results sum to exactly 100% of the consolidated segment result (₹5,328.56m + ₹(28.15)m = ₹5,300.41m) — so the Reconciliation Gate 3 concern (no vanished bucket) is satisfied by construction, stated explicitly in §1 below. The one "Unallocable" item in the segment note is a **balance-sheet asset** line (₹7,629.29m, FY26), not an income-statement drag, and is not part of the EBIT walk.

## 1. Segment Inventory

| Segment | Revenue (₹mn) | Segment Result / EBITDA (₹mn) | Margin | % of Total Segment EBIT | Source |
|---|---:|---:|---:|---:|---|
| Web and Related Services | 14,429.38 | 5,328.56 | 36.9% | 100.5% | FY26 Annual Report (Ind AS), Note 32 |
| Accounting Software Services | 1,261.04 | (28.15) | (2.2)% | (0.5)% | FY26 Annual Report (Ind AS), Note 32 |
| **Total (reportable segments)** | **15,690.42** | **5,300.41** | **33.8%** | **100.0%** | FY26 Annual Report (Ind AS), Note 32 |

**Denominator definition:** "% of Total Segment EBIT" uses total reportable-segment result (₹5,300.41m) as the denominator — this is not net of any separate corporate-cost drag, because none exists at the operating-profit level; the two segments' results sum exactly to the consolidated total (100.5% + (0.5)% = 100.0%). No corporate bucket is netted out and none vanishes. (A small CIQ-export variant of Web and Related Services' FY26 revenue, ₹14,429.94m vs the Annual Report's ₹14,429.38m — a ₹0.56m / 0.004% rounding difference — is noted for completeness; the audited Annual Report figure is used as primary per the source hierarchy.)

Accounting Software Services is run through two wholly-owned subsidiaries, Busy Infotech Private Limited (acquired for ~₹500 crore per management commentary, Q1 FY27 earnings call) and Livekeeping Technologies Private Limited. It carries ₹4,542.72m of goodwill on the balance sheet, and the FY26 statutory auditor (B S R & Co. LLP) flagged goodwill impairment as a Key Audit Matter [FY26 Annual Report, Independent Auditor's Report]. It is small, currently loss-making, and growing fast (Busy Infotech billings ~₹59 crore in Q1 FY27 vs ~₹10 crore a year earlier, per management commentary) — a call option, not a value driver today.

A related entity, **Simply Vyapar Apps Private Limited** (~28.6%–28.7% stake), is accounted for as an equity-method **associate**, not a subsidiary. It is not in either segment above; it appears only as "Share in net loss of associates" (₹(547.72)m in FY26) below the segment-result line [FY26 Annual Report, Note 32]. This matters for the equity bridge in §4 — its value is not embedded in segment EBITDA at all.

## 2. Segment Multiples & Comparables

| Segment | Metric Used | Period Basis | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---|---:|---|---:|---|
| Web and Related Services (proxied by consolidated — the metric already nets the Accounting Software Services drag, per the collapse rule) | Consolidated EBITDA | **NTM** (consensus) | 12.32x TEV/EBITDA | IndiaMART's own current market-implied multiple (self) | 12.32x | `EstimatesReport.xls, Multiples tab` — NTM TEV/EBITDA, Capital IQ consensus (18/18–15/15 analysts) |
| — cross-check, not used for the base valuation | LTM/NTM EBITDA, P/E | LTM / NTM | n/a (directional only) | Just Dial Limited (NSEI:JUSTDIAL) | EV/EBITDA: **unusable** (0.2x LTM / 0.22x NTM — see note); NTM forward P/E: 10.29x | `Company Comparable Analysis....xls, Trading Multiples + Financial Data tabs`, as-of 2026-08-13 |
| Accounting Software Services | Not structurable on a forward basis — excluded | — | — | — | — | No listed pure-play Indian SME-accounting-software comparable exists in this pool (Tally, Zoho are private); the segment's forward metric is a small, currently negative EBITDA with no consensus estimate split out |

**Why the "self" multiple, not a peer multiple, anchors the sanity check.** The credible India peer set is thin and mismatched (per `00_valuation-data-triage.md` §6A and `business-model/08_competitive-map.md`): Info Edge (Naukri, NSEI:NAUKRI) trades at 53.03x NTM TEV/EBITDA but is a much richer, differently-shaped business (recruitment classifieds plus large minority stakes in other listed names); Eternal (Zomato) and the two China/Kazakhstan names have no relevant business-economics overlap (food delivery, unrelated small-caps). **Just Dial is the closest same-country, same-adjacency (local search / B2B lead-generation) comparable, but its EV/EBITDA multiple cannot be used**: its Total Enterprise Value is only $8.3mm against a $613mm market cap, because $604.7mm of net cash swamps the EV almost to zero — 0.2x LTM TEV/EBITDA and 0.22x NTM TEV/Forward EBITDA are artefacts of a cash-heavy balance sheet, not a read on the value of Just Dial's operating business [`Company Comparable Analysis....xls, Financial Data tab`: TEV $8.3mm, LTM EBITDA $38.6mm, Net Debt $(604.7)mm]. Using it would fabricate a segment multiple from a distorted number, which this rule set bans. Just Dial's **P/E** (10.29x NTM forward, unaffected by the cash-swamp because P/E uses market cap, not EV) is shown as directional-only context in §5. Given no usable independent peer multiple exists for the dominant segment, the defensible sanity check is: **does the market's own current multiple already fairly price the dominant segment on its own, with no segment being masked?** — answered in §3–4 below.

## 3. Segment Valuation

| Segment | Metric Value (₹mn, NTM) | Multiple | Segment EV (₹mn) |
|---|---:|---:|---:|
| Web and Related Services (proxied by consolidated NTM EBITDA, which already nets the Accounting Software Services drag) | 5,978.7 [`EstimatesReport.xls, Consensus tab`, "Company Level (INR)", NTM column, EBITDA row] | 12.32x (NTM TEV/EBITDA, market-implied) | 73,657.4 |
| Accounting Software Services | Not structurable on a forward basis — excluded (already netted into the consolidated NTM EBITDA figure above, not separately valued, and not double-counted) | — | — |
| **Gross enterprise value (sum)** | | | **~73,657** |

`5,978.7 × 12.3177358969007 ≈ ₹73,644.06m` (shown to more decimals: the derived figure reconciles to **₹73,644.05m**, the canonical EV in `01` (broad basis), to within ₹0.01m / <0.001%). This is not a coincidence — it is the point of the sanity check: because the dominant segment is ~92% of revenue and >100% of profit, the market's current NTM EV/EBITDA multiple on **consolidated** EBITDA is, in effect, already the market's multiple on the **dominant segment**. There is no gap between "what a standalone breakup would say" and "what the consolidated multiple says," because there is effectively nothing left to break up. This is the collapse confirmed numerically, not just asserted.

**Multiple-driven dispersion (sensitivity, not a probability-weighted scenario — that is `07`'s job):**

| NTM TEV/EBITDA multiple | Gross EV (₹mn) | Equity value (₹mn, after §4 bridge) | Value/share (₹) |
|---:|---:|---:|---:|
| 10.0x (de-rate toward Just Dial's cheaper same-country profile) | 59,787.0 | 96,204.2 | 1,595.6 |
| **12.32x (current market-implied — base)** | **73,644.1** | **110,061.3** | **1,825.5** |
| 15.0x (re-rate case) | 89,680.5 | 126,097.7 | 2,091.2 |

## 4. Equity Bridge

| Step | Value (₹mn) |
|---|---:|
| Gross enterprise value | 73,644.05 |
| − Capitalized unallocated corporate costs | 0 (none exist — reportable segments sum to exactly 100% of consolidated segment result; see §1) |
| − Net debt (broad basis, canonical per `01`) | (33,670.3) — net cash; single line, sign shown negative, no separate add-back |
| − Minority / preferred | 0 (no NCI on the balance sheet; no preference shares in issue — `01`) |
| + Equity-method investments | 2,746.89 (Investments in associates, incl. the ~28.6–28.7% Simply Vyapar Apps stake, carrying/book value at 2026-06-30 — `01` EV bridge note; `Financials (1).xls, Balance Sheet tab`) |
| − Conglomerate / holdco discount | 0 (see note below) |
| **= Equity value** | **110,061.24** |
| ÷ Diluted shares | 60,291,720 |
| **= SOTP value per share** | **₹1,825.48** |
| vs current price | ₹1,784.60 → **+2.3%** |

**Internal consistency check:** Gross EV (₹73,644.05m) minus net debt broad basis (₹(33,670.3)m) = ₹107,314.35m, which matches `01`'s market capitalization figure (₹107,314.35m) exactly. That is expected — the EV and net-debt figures are `01`'s own canonical anchors, not independently re-derived here. The only genuine SOTP-specific addition is the +₹2,746.89m equity-method investment line, which is **not** embedded in segment EBITDA at all (Simply Vyapar's results show up only as a loss below the segment-result line, per §1), so a plain EV/EBITDA read of the consolidated business would silently omit it.

**Net-cash sign discipline:** net debt is shown as a single negative line (net cash), added back once. No separate "+ net cash" line exists.

**Conglomerate / holdco discount — none applied, and why.** IndiaMART is an operating company (Business-Type Method Map: Operating), not a holding company: it runs one dominant, wholly-owned operating business (Web and Related Services) plus a small, wholly-owned bolt-on (Accounting Software Services) that is already embedded in the consolidated NTM EBITDA metric used above — there is no sprawling, unrelated multi-business structure that would justify a diversification/opacity discount under CLAUDE.md §24 Filter 6. The Simply Vyapar stake is added at **book (carrying) value**, not a fair-value mark-up — a conservative choice, and one that already reflects Vyapar's own accumulated losses (₹(547.72)m attributed in FY26 alone), so no further illiquidity haircut is layered on top; a materially different fair value for that stake is not evidenced in this data pool.

## 5. SOTP Read

The dominant-segment sanity check puts breakup value at **₹1,825/share (dispersion ₹1,596–₹2,091 across a 10x–15x NTM EV/EBITDA multiple band)** against a current price of ₹1,784.60 — a gap of about +2.3% at the base multiple, which is not a mispricing signal: it is fully explained by adding the ~₹2.7bn book value of the Simply Vyapar equity-method stake (~2.6% of market cap), a holding that never appears in segment EBITDA and so is invisible to a plain consolidated EV/EBITDA read. Web and Related Services — the core India B2B marketplace — carries effectively all of the value; there is no masked high-value segment being obscured by a low consolidated multiple, because there is no second material segment. If anything runs the other way, it is Accounting Software Services (Busy Infotech + Livekeeping): a currently loss-making bolt-on with auditor-flagged goodwill-impairment risk, already netted into (and slightly dragging down) the consolidated NTM EBITDA this sanity check uses — a small embedded liability-in-waiting, not a hidden asset. The one genuine "not fully priced in the headline multiple" sliver is the Simply Vyapar stake, worth ~₹2.7bn at book (~₹46/share), which this bridge picks up and a bare consolidated-multiple read would miss.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — INDIAMART

**Anchors reused verbatim from `01_price-and-capital-structure.md`:** price ₹1,784.60 (2026-08-12 close, **pool-verified**, price-state tag `pool-verified`, 2 trading days old — no staleness cap applies), diluted shares (fair-value basis) 60,291,720, net debt (broad basis, canonical) ₹(33,670.3)mn net cash, EV (broad basis, canonical) ₹73,644.05mn. All figures ₹ million unless stated; reporting currency INR (Ind AS, FY ends 31 March).

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | ₹2,526 (median EV/EBITDA reversion) — **illustrative-only** | Low | **0%** | `02` itself flags its reversion table as excluded from `07`'s method set: the pool holds only a 5-quarter (~14-month) own-history multiple series, not the 3–5 years this read needs, and marks every reversion figure "ILLUSTRATIVE ONLY, NOT A FAIR-VALUE INPUT FOR `07`." Per the system rule zero-weighting a method its own producer flags illustrative-only on a short history, this carries zero weight in the base point — shown in the football field (§2) for transparency only. |
| Relative / peers (03) | ₹1,233 (NTM P/E, quality-adjusted) | Low (self-flagged) | **30%** | The sole surviving multiples-based value input after `02` is excluded. Kept in the weighted blend (the Method-Weighting Policy's default is multiples-first for an operating company with estimates), but held to a minority share here because `03`'s own producer repeatedly self-rates the finding "low-confidence": the peer set is a thin, largely self-selected 4-name comp, 2 of the 4 names' EV-based multiples are flagged not meaningful/not comparable (Just Dial's cash-swamped EV, Info Edge's non-comparable investment-fund mix), and even the "credible" P/E cross-section is set almost entirely by two small/thin-liquidity names (Just Dial, Zarea). |
| Intrinsic DCF (04) | ₹1,903.5 (exit-multiple base case, 12.0x terminal EV/EBITDA, WACC 10.02%) | Medium | **70%** | Weighted as the primary method here — a deliberate departure from the Method-Weighting Policy's default (which caps DCF+SOTP combined at ≤⅓ when multiples methods are strong) because the sole surviving multiples input (`03`) is itself low-confidence and the sole other multiples input (`02`) is fully excluded. `04` is the most rigorously built method in this set — full audited cash-flow base, executed FCFF-identity and financeable-growth checks, a WACC override that is shown, justified and bounded (±1.5pp cap), and a terminal method chosen conservatively (exit multiple over the richer Gordon result). Its own flagged weakness (beta/WACC fragility — value flips to below price at a "conventional beta" WACC of 13.0%) is carried into confidence, not ignored, and is the reason this is "Medium," not "High," confidence. |
| Reverse-DCF (05) | (implied, not a value) — 6.0% flat revenue CAGR priced in, judged **conservative / achievable** | n/a | n/a | Cross-check only, not a weighted input. Because it inverts `04`'s own model exactly (same WACC, same normalized FCF base, same terminal method), it corroborates `04`'s directional read (fairly-valued-to-modestly-undervalued) rather than providing independent evidence — it is not double-counted into the weight. |
| Sum-of-the-parts (06) | ₹1,825.5 (dominant-segment sanity check, 10.0x–15.0x NTM EV/EBITDA dispersion ₹1,596–₹2,091) — **collapsed / single-segment sanity-check only** | Low (by construction) | **0%** | Per `06`'s own §1, IndiaMART is effectively single-segment (Web and Related Services = 91.96% of revenue, >100% of segment profit) and the "base" multiple applied is the market's own current NTM EV/EBITDA (12.32x) — the resulting ₹73,644m gross EV reconciles to the canonical EV to within 0.01% by construction, not by independent valuation work. Per the system rule zero-weighting a method its own producer marks "collapsed / single-segment sanity-check only," this carries zero weight in the base point — shown for transparency and as a "no hidden segment value" check, which it passes (the only pickup is the ~₹46/share Simply Vyapar equity-method stake, already in the bridge). |

Weights sum to 100% across the two value-producing, business-type-valid methods still carrying a live base-case point (`03`, `04`) after excluding `02` (illustrative-only on short history) and `06` (collapsed sanity-check only) per the system rule. This is **not** the Method-Weighting Policy's default "02+03 majority, 04/06 capped ≤⅓" shape — that default assumes both multiples methods are usable at reasonable quality; here `02` is fully excluded and `03` is self-flagged low-confidence, which is the stated reason (per Policy §1's own escape clause — "no usable forward multiple exists" in credible form) for instead weighting `04` as primary.

## 2. Triangulation & Reconciliation

**Method football field** — the full cross-method spread, one row per method that produced a value, not narrowed:

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| `02` Own-history multiples | ₹2,526 (illustrative point); cross-method dispersion ₹1,980–₹2,572 | Low | 0% | Illustrative-only, short history — see §1 |
| `03` Relative valuation (peers) | ₹1,233 (base); credible P/E-based dispersion ₹685–₹1,417 | Low (self-flagged) | 30% | Sole surviving multiples input — see §1 |
| `04` Intrinsic DCF | ₹1,903.5 (base, exit-multiple); sensitivity grid ₹1,770–₹2,052; Gordon cross-check ₹2,409 (upper bound, flagged terminal-multiple-rich); WACC-13.0% addendum ₹1,701 | Medium | 70% | Most rigorously built method — see §1 |
| `05` Reverse-DCF | n/a — implied 6.0% CAGR, judged conservative/achievable | n/a (cross-check) | n/a | Corroborates `04`, not independently weighted |
| `06` Sum-of-the-parts | ₹1,825.5 (base); dispersion ₹1,596–₹2,091 | Low (circular by construction) | 0% | Collapsed single-segment sanity check — see §1 |

**The full high-to-low spread across all methods that produced a value is ₹1,233 (peers) to ₹2,526 (own-history reversion, illustrative) — a 104.9% spread.** This is the headline finding of this section: the five lenses do not agree even directionally on whether IndiaMART is cheap or rich. Restricted to the two methods that actually carry weight in the base point, the spread is still material: `04`'s ₹1,903.5 sits **54.4% above** `03`'s ₹1,233.

**Reconciling the gap.** The two weighted methods disagree because they are measuring different things with different reliability. `03` (peers) finds a large discount only on EV-based multiples (37–68% below peer median), and that specific signal is explicitly not credible — it is driven almost entirely by Info Edge's non-comparable, investment-fund-inflated EV/EBITDA (67.6x) and Just Dial's cash-swamped EV (TEV is 1.4% of its market cap). The one P/E-based cross-section `03` itself calls "the most defensible read" instead finds IndiaMART **richly priced** relative to peers (+88% P/E premium to Just Dial/Zarea, only partly explained by IndiaMART's real margin/growth edge), producing the ₹1,233 base. `04` (DCF), by contrast, is built on IndiaMART's own audited cash flows and a full assumption set (WACC, terminal margin benchmarked against both peer-normal and the company's own prior-trough margin, terminal value at 58% of EV — below the 75% dominance flag), and finds intrinsic value modestly above price. `04`'s own weak point is disclosed, not hidden: at the "conventional beta" WACC (13.0%) that `business-model/09_moat.md` itself flags as plausible for a comparable small/mid-cap Indian internet name, the identical DCF produces ₹1,701 — below today's price. **This report trusts `04` more for this company** because it rests on more, and more reliable, evidence (a full 8-year audited-cash-flow build with executed consistency checks) than `03`'s thin, distorted 4-name comp set, and because `05`'s reverse-DCF — an independent inversion of the same DCF — corroborates the directional read (the price implies achievable, below-trend growth, not an aggressive bet). But `04`'s own beta/WACC fragility is real, so the 70/30 weighting (not 100/0) keeps `03`'s cautionary signal in the blend rather than discarding it.

**Base-case fair value (weighted point): ≈ ₹1,700/share** (`04` × 70% + `03` × 30% = ₹1,903.5 × 0.70 + ₹1,233 × 0.30 = ₹1,702.3, and the independently-built metric×multiple base case in §3 lands at ₹1,699 — the two approaches converge within 0.2%, used here as a cross-check on the blend rather than a coincidence). **This base point sits modestly *below* today's price (₹1,784.60)** — the headline reconciliation finding: even after leaning 70% toward the more-favorable DCF read, the blended base case does not clear the current price, because `03`'s low-confidence-but-real caution (a peer set that finds IndiaMART priced above what its quality edge over Just Dial/Zarea earns) still pulls the point down from `04`'s standalone +6.7%-above-price read.

## 3. Bull / Base / Bear Fair-Value Levels

Each case is a single derived level (forward FY27E EBITDA × an EV/EBITDA multiple), 12-month horizon (to ~August 2027) unless stated otherwise. Multiples are anchored to `02`'s own 5-quarter LTM EV/EBITDA band (min 17.61x / mean 21.96x / median 22.33x / max 26.78x, current LTM 15.17x) via the current LTM-to-FY27E-forward ratio the company itself trades at (12.63x FY27E ÷ 15.17x LTM ≈ 0.83), translating that band to an approximate forward-multiple-equivalent range of **~14.6x (min) to ~22.2x (max)**, stated as an approximation, not a re-derivation of `02`'s own figures. The **structural-reset / permanent-impairment trigger does not fire** on this evidence: `04_intrinsic-dcf.md` §5 already checked this explicitly — the moat verdict is **Narrow moat**, not "No moat proven," and moat trajectory is **"stable, with a specific near-term erosion warning,"** not "eroding" (`business-model/09_moat.md` §5); `business-model/07_business-quality.md`'s rate-of-change/disruption score is **45**, above the ≤40 disruption threshold. Neither the bare-No-moat nor the eroding-trajectory nor the disruption-flag condition is met, so no separate `bear_structural` case or avoid-ruin floor is built here — the single Bear case below is the cyclical/operating trough.

| Case | Fair Value / Share (point) | Forward Metric (FY27E EBITDA) | Multiple (FY27E EV/EBITDA) | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **₹2,298** | ₹6,557mn (consensus ₹5,828.73mn + ₹728mn combined favorable levers) | 16.0x (expanded — toward, not to, the translated own-history mean of ~18.2x–18.5x) | 12 months | Customer-acquisition opex stays pulled back rather than resuming to the guided ₹10cr/qtr run-rate (+₹228mn EBITDA, Medium confidence, `earnings/07` Rank 2 bull); ARPU keeps compounding at its observed 4-year ~8%/yr pace (+₹382mn, Medium confidence, `earnings/07` Rank 4 bull); Accounting Software Services (Busy Infotech/Livekeeping) sustains its 43% FY26 billing-growth pace with margin improving to +5% (+₹118mn, Low confidence, `earnings/07` Rank 6 bull). Multiple expands toward (not to) the historical band as growth deceleration visibly stabilizes and the 3-quarters-of-negative-net-supplier-adds trend reverses — a specific, evidenced reason (the stock already sits below its own 5-quarter LTM range on 3 of 5 multiples, so full reversion to the mean is not assumed without that reversal being observed first). |
| Base | **₹1,699** (≈ weighted triangulation ₹1,702, §2) | ₹5,828.73mn (Street consensus, 15 analysts) | 11.8x (below current market-implied FY27E multiple of 12.63x, and well below the translated own-history band) | 12 months | Consensus FY27E growth (+9.6% revenue) and margin (~flat vs FY26) play out as forecast, with no resumption of the compounding-bear scenario `earnings/07` §5 flags (opex resumption *and* SME demand weakening happening together) and no bull-case re-rate. The multiple sits modestly below even today's already-compressed forward multiple, reflecting `business-model/09_moat.md`'s Narrow, borderline-durability moat verdict (economic-moat test not robust to a conventional beta) and the unresolved AI-search/agentic-commerce discovery-layer risk it names — i.e., the de-rating is treated as at least partly warranted, not a pure mispricing to revert away. |
| Bear | **₹1,229** | ₹4,041mn (FY27E revenue ≈₹16,004mn, +2% — near-flat SME demand — × 24% EBIT margin, below the company's own FY23/FY24 prior-trough margin of 24.44%/24.64%, + ₹200mn D&A) | 10.0x (compressed below the current 12.63x forward multiple and below the translated own-history band minimum of ~14.6x) | 12 months | Customer-acquisition opex resumes toward management's own guided ~₹10cr/qtr (₹1,600mn/yr) run-rate (−₹1,261mn EBITDA vs FY26, High-confidence company-guided level, `earnings/07` Rank 2 bear) *while* SME demand softens (paying-supplier net adds, already negative in 3 of the last 4 quarters, stay negative) — the specific compounding scenario `earnings/07` §5 names as plausible, not independent draws. EBIT margin compresses to below the company's own last true operating trough (FY23 cost-buildout, 24.44%), reflecting both the opex resumption and the structurally rising, one-directional customer-support/trust-and-verification cost line (`earnings/07` §6). Multiple compresses further below today's level, consistent with `02`'s own finding that the stock already trades below its full 5-quarter range with "limited own-history evidence of a floor." |

**Multiple/metric direction check:** Bull moves both metric (↑) and multiple (↑) versus Base; Bear moves both metric (↓) and multiple (↓) versus Base — symmetric, per the Scenario Construction policy. Bull multiple (16.0x) ≥ Base (11.8x) ≥ Bear multiple (10.0x), and none of the three exceeds the translated own-history band (~14.6x–22.2x) on the high side without an explicit stated reason (Bull stays below the band's mean-equivalent, not at its ceiling).

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | ₹1,784.60 (2026-08-12 close, pool-verified) |
| Base-case fair value (point) | ₹1,699 (≈₹1,700; weighted triangulation ₹1,702) |
| Bear-case fair value | ₹1,229 |
| Implied upside to base case = (base FV − price) / price (%) | **(4.8%)** — negative; price sits modestly above base fair value |
| **Margin of safety** = (base FV − price) / base FV — the cushion (%) | **(5.0%)** — negative; there is currently no cushion, price trades slightly above the base-case point |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* (%) | **31.1%** |

Executed calculation (command + result):
```
$ python3 iv_calc.py
Base FV (rounded): Rs.1699   Bear FV (rounded): Rs.1229   Bull FV (rounded): Rs.2298
Implied upside to base = -4.80%
Margin of safety (base) = -5.04%
Downside to bear = 31.13%
Upside to bull = 28.77%
```

Margin of safety and downside-to-bear are genuinely different reads here and both matter: there is no cushion at the base case (price already sits ~5% above it), while a full slide to the bear-case level (a combined opex-resumption-plus-SME-softening scenario, evidenced in `earnings/07`'s own interaction-effects section) would cost 31.1% from today's price. Both metrics are assessable because `01`'s price is `pool-verified` and not stale.

## 5. Warranted-Multiple Check

The base case's implied FY27E EV/EBITDA (11.8x) is **below** today's own market-implied forward multiple (12.63x, `02` §1) and far below the company's translated own-history mean (~18.2x–18.5x forward-equivalent) — this base case is not asking the market to pay *more* for the same earnings than it does today; if anything it is slightly more conservative than the current tape. Given `business-model/09_moat.md`'s own verdict — Narrow moat, an economic-moat test that passes only on a low-beta CAPM estimate and flips to "at or below cost of capital" under a more conventional beta, proven-weak switching costs (a single price rise directly turned net supplier adds negative), and a Mixed (45/100) rate-of-change score citing an unresolved AI-search/agentic-commerce discovery layer — an 11.8x forward multiple reads as a business earning something close to its own cost of capital, not a durable-compounder multiple. The Bull case's 16.0x multiple is the one genuinely re-rated assumption in this set: it requires the market to reward a reacceleration and moat-stabilization story that has not yet been observed (net supplier adds have been negative in 3 of the last 4 quarters) — flagged, not assumed, as the swing case. No RF-OWN-004 (structurally misaligned controlling owner) flag is available to check: the management-governance module's outputs are not present in this run's cross-module inputs, so that specific value-trap trigger cannot be confirmed or ruled out here and is left to the master synthesizer.

## 6. Fair-Value Read

At today's price of ₹1,784.60, this triangulation puts base-case fair value at **≈₹1,700/share** — modestly *below* price (no margin of safety, −5.0%) — bracketed by a Bull level of **₹2,298** (+28.8% vs price) and a Bear level of **₹1,229** (−31.1% downside-to-bear from price). The read is driven roughly 70/30 by the intrinsic DCF (`04`, ₹1,903.5, the most rigorously evidenced method but flagged for beta/WACC fragility that alone flips its own answer from above to below price) and the peer relative valuation (`03`, ₹1,233, self-flagged low-confidence on a thin, partly-distorted 4-name comp set) — a 54% disagreement between the two weighted methods that this report resolves toward DCF, not by averaging blind. The single biggest swing factor between bull and bear is the same one `04` and `05` both independently flag as dominant: whether management resumes customer-acquisition spend to its own guided run-rate while SME demand stays soft (the specific, evidenced compounding-bear scenario) versus keeps spend disciplined while ARPU and Accounting Software Services growth hold up (the bull case) — not the DCF's terminal growth or the peer multiple choice, both of which move the number by far less.
