# valuation Module Dossier — UBER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-08-06T18:10:03Z
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

# Valuation Module — UBER (Synthesis)

## Abstract

Uber sits close to fairly valued: base-case fair value is $74.91 a share against a $68.18 pool-verified price, a 9.9% gap that lands just inside the ±10% "fairly valued" band rather than clearing the bar for "modestly undervalued." The bull case is $104.89 and the base and bear-case levels of $74.91 and $40.23 (a 24–36 month structural-reset floor sits lower still at $31.88), driven mainly by the peer-relative read (68% weight) because Uber's forward EV/EBITDA discount to its closest asset-light marketplace peers (Lyft, DoorDash, DiDi, Grab) is only partly warranted by its unproven return-on-capital record. The reverse-DCF shows the price requires just 14.7% free-cash-flow growth and a 12.8% margin — both below what Uber already delivers — so the implied bar looks achievable, not stretched. The cushion to the base case is thin (9.0% margin of safety) and the loss to the cyclical bear case is 41.0% (53.2% to the structural floor), a materially asymmetric setup. Verdict: fairly valued, with real but not yet earned re-rating upside.

## 1. Valuation Verdict

- **Verdict:** Fairly valued *(base-case fair value is +9.9% above price — inside the ±10% "fairly valued" band per MODULE_RULES, but at its edge; this is a genuine borderline case with "modestly undervalued" one point away)*
- **Base-case fair value (point, per share):** $74.91
- **Current price:** $68.18 (close, Aug-05-2026 — pool-verified, corroborated across three independent Capital IQ exports, 1 trading day old at run date)
- **Bull / Base / Bear fair-value levels (points):** Bull $104.89 / Base $74.91 / Bear (cyclical, 12-month headline) $40.23 / Bear (structural reset, 24–36 month avoid-ruin floor, memo only, not blended into the headline) $31.88
- **Cross-method dispersion (football field, low–high):** Among the three value-producing methods' own single points: $73.39 (peers) to $95.73 (SOTP, best-comp case) — a 30% spread. Including each method's own stated low/high range: **$51.15 (SOTP, conservative-comp case) to $115.44 (own-history, illustrative-only and zero-weighted)**.
- Valuation attractiveness /100 *(higher = cheaper)*: **55**
- Margin of safety /100 *(higher = better)*: **32** *(the underlying computed cushion is +9.0% — thin, not a deep discount)*
- Valuation confidence /100: **58** *(capped: DCF terminal value is 77.1% of its EV, above the 75% threshold — max 60 per Score-Cap Rules; the cap binds even though DCF carries only 16% of the base-point weight)*
- Downside risk /100 *(higher = worse)*: **65** *(41.0% loss to the cyclical bear, 53.2% to the structural floor — a materially asymmetric setup by the module's own framing)*
- Data quality /100: **80** *(full income statement, balance sheet, cash flow, fresh consensus, 10-name peer set, and annual segment data; the one real gap is no primary 10-K/10-Q in the pool — every figure is a Capital IQ export, tier 5, not a blocking gap)*
- Overall usefulness /100: **82**
- **Dominant valuation method (one line):** Relative valuation on the four-name core marketplace peer set (Lyft, DoorDash, DiDi, Grab) — it carries 68% of the base-point weight because it rests on the tightest economics-matched comparable set, a forward metric with real 9-analyst coverage, and an explicit, evidenced quality haircut, while the DCF (terminal-dominated) and SOTP (comp-selection-driven ~2x swing) each corroborate direction but are individually too fragile to lead.
- **What's priced in (one line):** The market is pricing in ~14.7% FCFF growth (FY26–31) and a 12.8% steady-state EBIT margin — both below Uber's own consensus-anchored base case (18.6% CAGR, 16.0% margin) and below what Uber already posts (LTM EBIT margin 12.1%) — a conservative, achievable bar, not a stretched one.
- **Biggest valuation risk (one line):** The ~10% base-case gap depends on the market granting Uber a modestly higher EV/EBITDA multiple (13.25x vs today's 11.89x) that assumes its recent margin expansion is durable; `business-model/09_moat.md`'s "No moat proven" finding (3-year average ROIC 6.2% below the ~8.1% cost of capital, only two years clearing that bar) means the re-rating case is not yet earned, and if the market keeps treating the current margin as a peak rather than a new normal, most of the modest upside disappears.

## 1A. Module Disconfirmation

- **Strongest bear point:** The sum-of-the-parts method's own conservative-comparable case values Uber at $51.15/share (-25% below price), and the DCF's structural-reset runoff terminal — a non-recovering 8.0% EBIT margin and -2.0% terminal growth — implies $31.88/share (-53.2% from today's price). Both come from this module's own machinery, not an outside bear case, and both rest on `business-model/09_moat.md`'s finding that Uber's return on capital has cleared its own ~8.1% cost of capital for only two years, not a full cycle.
- **Strongest bull point (steelman):** Uber already has the highest EBITDA margin (13.5% LTM) of its four closest economics-matched peers, and the reverse-DCF shows the current price requires LESS growth (14.7% FCFF CAGR, 12.8% terminal margin) than `04`'s own consensus-anchored base case (18.6% CAGR, 16.0% margin) or than Uber's own recent trend — the bar the market has set is genuinely conservative relative to the evidence.
- **Single killer risk:** Warranted-multiple risk on the terminal margin. The entire base-case re-rating (11.89x today to 13.25x base) assumes the current 12–13.5% margin level is a durable new normal, not (per the moat module's own words) a "recent peak." If the market is right that it is a peak, the multiple stays near today's 11.89x and most of the base case's modest upside — and the entire bull case's larger upside — collapses.
- **Disconfirming evidence already visible:** `business-model/09_moat.md`'s "no moat proven" verdict; the SG&A-leverage tailwind (the largest quantified earnings lever) already reversing (+63bps off its FY2025 low) per `earnings/07_earnings-sensitivity.md`; Freight structurally troubled (revenue down 27% from its FY2022 peak, negative-to-breakeven EBITDA in 5 of the last 6 years); and management-governance's serial-acquirer red flag (RF-CAP-004) on the $14.8bn, partly debt-funded Delivery Hero acquisition — a capital-allocation risk this SOTP does not yet quantify.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | Sufficient — all five methods can run; pool-verified same-day price, fresh consensus, 10-name peer set, annual segment data | No primary 10-K/10-Q in the pool — every figure is a Capital IQ export (tier 5), a real but non-blocking gap |
| price-and-capital-structure | Price $68.18 pool-verified (Aug-05-2026 close), EV $149,210.14mm, net debt (strict) $9,340mm | ~$16.3bn of Long-term Investments + Equity Method Investments (incl. a ~$4bn pre-acquisition Delivery Hero stake) is correctly excluded from net debt, but the pool's own treatment of a "Long Term Marketable Securities" line is internally inconsistent — flagged, not guessed at |
| multiples-own-history | Own-history bands are illustrative-only (~17-month, 7-quarter window) — zero-weighted in the base point | EV/EBITDA and EV/EBIT sit at the exact trough of the (short) window (-35.5% and -40.1% vs mean), but roughly half of that compression is EBITDA/EBIT roughly doubling, not price alone |
| relative-valuation-peers | Base $73.39/share (+7.6%), quality-adjusted 13.0x NTM EV/EBITDA; dispersion ~$73–$111 | Uber has the highest EBITDA margin (13.5%) among its four core peers yet trades at a -17.5% NTM EV/EBITDA and -38.5% NTM P/E discount to their median — only partly warranted |
| intrinsic-dcf | Base $82.87/share (+21.5%); sensitivity $65.11–$113.60; terminal-dominated | Terminal value is 77.1% of EV (exceeds the 75% threshold); the Gate-2 financeable-growth check implies a far more conservative $64–$75/share range |
| reverse-dcf | Price requires 14.7% FCFF CAGR and 12.8% steady-state EBIT margin | Both bars sit below Uber's own consensus-anchored base case and below Uber's already-posted 12.1% LTM EBIT margin — the market's implied bar is conservative, not aggressive |
| sum-of-the-parts | Base-comp case $95.73 (+40.4%); conservative-comp case $51.15 (-25.0%) — cannot cleanly call the stock | Near-2x dispersion driven entirely by which named comparable (Grab vs Lyft for Mobility; DoorDash vs Grab for Delivery) is credited to each segment |
| scenario-and-fair-value | Base $74.91/share (+9.9%); Bull $104.89; Bear (cyclical) $40.23; Bear (structural, memo) $31.88 | Margin of safety a modest 9.0%; downside to the headline bear a materially asymmetric 41.0% |

## 3. Reconciliation

The three value-producing methods' single points span 30% ($73.39 peers to $95.73 SOTP best-comp), and once each method's own stated low/high range is included, the spread widens to $51.15 (SOTP conservative-comp) to $115.44 (own-history, illustrative-only and excluded from weighting) — a genuine >40% cross-method disagreement between the DCF's base ($82.87) and the SOTP's conservative case ($51.15), a 62% gap. This was reconciled explicitly by `07`, not averaged away: the gap is a comparable-selection artefact inside the SOTP (Lyft's 7.94x vs Grab's 12.26x credited to Mobility; Grab's 12.26x vs DoorDash's 20.78x credited to Delivery), layered on top of the DCF's separately-flagged terminal-value fragility (77.1% of EV) — not a fundamental disagreement about Uber's consolidated operating economics, since both derive from broadly the same NTM base. This module trusts the peer-relative read (`03`) most for this company: it rests on the tightest economics-matched comparable set (four asset-light two/three-sided marketplaces), a forward metric with genuine 9-analyst coverage, and an explicit, evidenced quality haircut rather than a single comparable-selection coin-flip. Because the DCF's terminal value exceeds the 75% threshold, valuation confidence is capped at 60 regardless of the DCF's modest (16%) weight in the base point — this is a hard-rule cap, applied even though the base fair value does not actually lean on the fragile part of the DCF.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N — price is pool-verified, 1 trading day old | MoS, downside-to-bear, observed up/down, attractiveness + confidence | Not applicable |
| No consensus / forward estimates | N — full consensus present (9–47 analysts depending on line item), 0–1 days old | Valuation confidence | Not applicable |
| No peer data | N — 10-company Capital IQ comp set, 4-name core marketplace subset | Overall usefulness | Not applicable |
| Only one valuation method usable | N — five methods ran (own-history, peers, DCF, reverse-DCF, SOTP) | Valuation confidence | Not applicable |
| No cash flow AND DCF is only method | N — full cash flow statement present; multiple methods ran | Valuation confidence | Not applicable |
| SOTP not possible for multi-segment | N — SOTP ran (Mobility 69.1% of pre-corporate segment profit, below the >85% single-segment threshold) | Overall usefulness | Not applicable |
| Methods disagree >40% unreconciled | N (in form) — the >40% gap (DCF $82.87 vs SOTP low $51.15) was explicitly reconciled by `07` as a comparable-selection artefact, not left standing | Valuation confidence | Not applicable as a separate cap (reconciliation shown in §3), though the underlying dispersion is factored into the 58 confidence score |
| Terminal value >75% of DCF EV | **Y** — DCF terminal value is 77.1% of EV, above the 75% threshold | Valuation confidence | **Max 60** — applied; final confidence set at 58 |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | N — `management-governance/99_management-governance-synthesis.md` confirms RF-OWN-004 not triggered (diffuse register, largest holder BlackRock 7.4%, PIF 3.6% with one board seat but not a controlling owner) | Valuation attractiveness | Not applicable — no value-trap cap from this filter |

## 5. Fair-Value Summary

The bull/base/bear fair-value levels — $104.89 / $74.91 / $40.23 (cyclical) — plus a separately-carried $31.88 structural-reset floor are anchored on the same forward NTM EBITDA figure ($12,589mm consensus) run through a symmetric multiple ladder (15.0x / 13.25x / 10.0x), with the peer-relative method driving the multiple choice because it is the tightest economics-matched cross-check available. The $68.18 price implies the market needs Uber to deliver only 14.7% FCFF growth and a 12.8% terminal margin — both below what Uber's own recent trend and consensus already support (LTM EBIT margin 12.1%, consensus base case 18.6% CAGR / 16.0% margin) — so the implied bar reads as achievable, not stretched, per the reverse-DCF. The margin of safety (discount to the base case) is a modest +9.0%, while the downside to the bear case is a much larger 41.0% (53.2% to the structural floor) — an asymmetric setup where the near-term cushion is thin but the tail risk if the bear case plays out is large. Whether the modest cheapness is real or a value trap turns on the warranted-multiple question, not on ownership structure: no misaligned controlling owner is flagged (RF-OWN-004 not triggered), so this is not an ownership-driven trap, but `business-model/09_moat.md`'s "No moat proven" finding (return on capital cleared the ~8.1% cost of capital for only two years, not a full cycle) means the base case's assumed re-rating from 11.89x to 13.25x NTM EV/EBITDA is evidenced but not yet earned — if the market continues to treat Uber's margin gains as a peak rather than a durable level, the case for even the modest base-case upside weakens.

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Fairly valued (borderline modestly undervalued) | A third consecutive year of return on capital clearing the ~8.1% cost of capital (closing the "no moat proven" gap and supporting a fuller re-rating toward the raw 14.42x peer median); a longer (3–5 year) own-multiple history showing today's EV/EBITDA trough is genuinely cheap versus a durable historical norm, not just a 17-month window; resolution of the SOTP's comparable-selection uncertainty (e.g., Uber Delivery proving it deserves DoorDash's growth premium rather than Grab's more moderate multiple) | A reversal of the SG&A-leverage tailwind beyond the +63bps already seen, confirming the margin gains are cyclical rather than structural; integration costs or dilution from the debt-funded Delivery Hero acquisition materializing (per management-governance's serial-acquirer flag, RF-CAP-004); a driver-classification regulatory ruling in a major market (the structural-reset trigger already priced into the $31.88 floor) | A primary 10-K/10-Q (currently absent from the pool — every figure here is a Capital IQ export); a 3–5 year own-multiple history (only 17 months exists); segment-level forward guidance (currently derived, not disclosed) to reduce the SOTP's comp-selection sensitivity |

## 7. Note To The Final Synthesizer

- Fair-value levels: Bull $104.89 / Base $74.91 / Bear (cyclical, 12-month headline) $40.23 / Bear (structural reset, 24–36 month avoid-ruin floor, memo) $31.88. The dominant method behind the base point is peer-relative valuation (68% weight) on the four-name core marketplace comp set (Lyft, DoorDash, DiDi, Grab); DCF (16%) and SOTP (16%) are capped cross-checks per the multiples-first policy, and own-history multiples (0%) are self-flagged illustrative-only.
- What the price implies: ~14.7% FCFF CAGR (FY26–31) and a 12.8% steady-state EBIT margin — both below Uber's own consensus-anchored base case (18.6% CAGR, 16.0% margin) and below Uber's already-posted LTM EBIT margin (12.1%). This reads as achievable, per the earnings-module evidence, not as a stretch the market is pricing.
- Margin of safety (discount to base): +9.0% — thin. Downside to bear: 41.0% to the $40.23 cyclical bear-case value; 53.2% to the $31.88 structural-reset floor. The setup is asymmetric — a small near-term cushion against a large tail loss.
- Genuine value vs value trap: this is NOT an ownership-driven value trap — RF-OWN-004 (§24 Filter 6) is not triggered (diffuse register, no controlling owner). It IS a warranted-multiple question: `business-model/09_moat.md` finds "no moat proven" (ROIC cleared WACC for only two of the last three years), so the modest base-case re-rating (11.89x to 13.25x NTM EV/EBITDA) is evidenced but not yet earned through a full cycle. Separately, management-governance flags a serial-acquirer capital-allocation risk (RF-CAP-004, the debt-funded $14.8bn Delivery Hero deal) that is not quantified anywhere in this module's SOTP or DCF and is a real, unmodeled downside not captured in the bear cases above.
- Which method to trust: the peer-relative read (`03`). Discount the SOTP (`06`) as a point estimate — its own report says it "cannot cleanly call" the stock, given its ~2x comp-selection-driven swing — and treat the DCF (`04`) as directionally corroborating but fragile (terminal value is 77.1% of its EV).
- Partial-data caps applied: only the terminal-value-dominance cap (DCF terminal value >75% of EV), which caps valuation confidence at 60 (final score set at 58). No price-state cap applies — the price is pool-verified and fresh. No misaligned-owner cap applies.
- Biggest missing data point: a primary 10-K/10-Q filing (every figure in this module is a Capital IQ vendor export, tier 5) — and, more valuation-specific, a 3–5 year own-multiple history (only 17 months/7 quarters exist in the pool), which would materially sharpen or undercut the own-history reversion read that is currently zero-weighted for lack of a long enough window.
- **Explicit handoff:** the master synthesizer's "Valuation and Peer Mispricing" section should defer to this synthesis. The bull/base/bear fair-value LEVELS here ($104.89 / $74.91 / $40.23 / $31.88 structural) are the inputs for the master's own probability-weighted scenario model — this module assigns no probabilities and computes no risk/reward; that is the master's job.

## 8. Simple Summary

- Roughly fairly valued, right at the edge of "modestly undervalued": base fair value $74.91 vs a $68.18 price, a 9.9% gap.
- Bull $104.89, Base $74.91, Bear (12-month, cyclical) $40.23, and a deeper structural-reset floor of $31.88 (24–36 months) carried separately for the master's kill-criteria work.
- The market is pricing in a conservative bar: only 14.7% free-cash-flow growth and a 12.8% margin, both below what Uber already delivers or what Wall Street consensus assumes.
- The cushion (margin of safety) is thin at +9.0%, but the drop to the bear case is large — 41.0% to the cyclical bear, 53.2% to the structural floor.
- The peer-comparison method (against Lyft, DoorDash, DiDi, Grab) is the one to trust most here; the DCF and the sum-of-the-parts breakup both agree directionally but are individually too shaky to lead (DCF leans heavily on a distant terminal value; the breakup swings nearly 2x depending on which comparable is picked).
- This reads as a warranted-multiple question, not an ownership-driven value trap — there is no misaligned controlling owner, but Uber's recent margin gains have only cleared its cost of capital for two years, not a full cycle, so the modest re-rating this fair value assumes is not yet fully earned.
- A pool-verified, same-day current price was available — no gap here. The bigger data gaps are a missing primary 10-K/10-Q (vendor exports only) and a too-short (17-month) own-multiple history.
- This module is useful for the master synthesizer: it is comprehensive, wide-but-reconciled in its cross-method spread, and gives clean, price-independent bull/base/bear levels ready to be turned into a probability-weighted bet.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — UBER

## 1. File Inventory

`data/UBER/` holds 13 source files. Five are multi-tab Capital IQ workbooks (`.xls`); the pool extractor (`extract_pool.py`) split these into 37 sheet-level extracts, 0 extraction failures across all 45 extract files [`_pool_extracts/manifest.md`]. Every tab is listed below as its own row per the workflow requirement — no workbook appears as a single opaque row.

| Filename / Tab | Type | Period Covered | Last Modified (pool-sync, not doc date) | Valuation Relevance |
|---|---|---|---|---|
| Charting Excel Export Aug-05-2026 2_49 PM.xls — Chart 1 with Data | Price chart export | Historical price series through Aug-05-2026 | 2026-08-06 (sync) | Medium (price history, not the anchor price) |
| Charting Excel Export Aug-05-2026 2_49 PM.xls — Attributions | Chart metadata | n/a | 2026-08-06 (sync) | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Financial Data | Peer/comps export | LTM as of Aug-06-2026 | 2026-08-06 (sync) | High |
| Company Comparable Analysis Uber Technologies Inc.xls — Trading Multiples | Peer/comps + multiples export | LTM/NTM as-of 2026-08-06 | 2026-08-06 (sync) | High — 10-company comp set, current-price-anchored |
| Company Comparable Analysis Uber Technologies Inc.xls — Operating Statistics | Peer/comps export | LTM as of 2026-08-06 | 2026-08-06 (sync) | Medium |
| Company Comparable Analysis Uber Technologies Inc.xls — Business Description | Descriptive | n/a | 2026-08-06 (sync) | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — Implied Valuation | Multiples export (implied valuation from comps) | As of 2026-08-06 | 2026-08-06 (sync) | High |
| Company Comparable Analysis Uber Technologies Inc.xls — Valuation Chart | Chart data | As of 2026-08-06 | 2026-08-06 (sync) | Medium |
| Company Comparable Analysis Uber Technologies Inc.xls — Credit Health Panel | Capital-structure/credit export | FY2024–Mar-2026 | 2026-08-06 (sync) | Medium |
| Company Comparable Analysis Uber Technologies Inc.xls — Disclaimer | Boilerplate | n/a | 2026-08-06 (sync) | None |
| Company_Comparable_Analysis_Uber_Technologies _Inc.rtf | Duplicate narrative export of the comps workbook | As of 2026-08-06 | 2026-08-06 (sync) | Low (redundant with the .xls) |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | Analyst/consensus narrative | As of 2026-08-06 | 2026-08-06 (sync) | Medium |
| Uber Technologies Inc NYSE UBER Board Members.rtf | Governance roster | Current | 2026-08-06 (sync) | Low (not valuation-relevant) |
| Uber Technologies Inc NYSE UBER Financials.xls — Key Stats | Capital-structure + current price export | FY2022–LTM(Jun-30-2026)–FY2028E; current cap as of Aug-2026 | 2026-08-06 (sync) | High — current price ($68.18), shares out, EV bridge |
| Uber Technologies Inc NYSE UBER Financials.xls — Income Statement | Annual filing (vendor-parsed) | FY2020–FY2025 + Jun-30-2026 LTM | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Balance Sheet | Capital-structure data | FY2020–FY2025 + Mar-31-2026 | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Cash Flow | Cash flow statement | FY2020–FY2025 + Jun-30-2026 LTM | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Multiples | Historical own-multiples export | Quarterly/annual through 2026 | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Historical Capitalization | Capital-structure data (quarterly EV bridge) | 2024-12-31 to 2026-03-31 | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Capital Structure Summary | Capital-structure data | FY2024–Mar-2026 | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Capital Structure Details | Debt-instrument detail (convertibles, coupons, maturities) | FY2024–FY2025 | 2026-08-06 (sync) | High |
| Uber Technologies Inc NYSE UBER Financials.xls — Ratios | Financial ratios / diluted share counts | FY2020–FY2025+ | 2026-08-06 (sync) | Medium-High |
| Uber Technologies Inc NYSE UBER Financials.xls — Supplemental | Supplemental line items | FY2020–FY2025 | 2026-08-06 (sync) | Low-Medium |
| Uber Technologies Inc NYSE UBER Financials.xls — Industry Specific | Industry KPIs | Sparse | 2026-08-06 (sync) | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — Pension OPEB | Pension/OPEB | Sparse (n/a for Uber) | 2026-08-06 (sync) | None |
| Uber Technologies Inc NYSE UBER Financials.xls — Segments | Segment revenue/EBITDA | FY2020–FY2025 | 2026-08-06 (sync) | High — SOTP input |
| Uber Technologies Inc NYSE UBER Products.rtf | Descriptive (product/subsidiary list) | Current | 2026-08-06 (sync) | Low |
| Uber Technologies Inc NYSE UBER Professionals.rtf | Management roster | Current | 2026-08-06 (sync) | Low |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | Combined export (description, key financials, stock quote, index membership) | As of Aug-06-2026 | 2026-08-06 (sync) | High (redundant current-price/cap confirmation) |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.pdf | Earnings transcript | FQ2 2026 (qtr ended ~Jun-30-2026), call Aug-05-2026 | 2026-08-06 (sync) | High — guidance, management tone, forward color |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Consensus | Consensus/estimate export | FQ2 2026 actual/surprise; consensus through FY2027; consensus pulled 2026-08-05 10:04 GMT | 2026-08-06 (sync) | High — target price, EPS/EBITDA/revenue consensus |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Recent Changes | Estimate revisions | Recent | 2026-08-06 (sync) | Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Guidance | Guidance vs. consensus | FY2026 guidance context | 2026-08-06 (sync) | Medium-High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Multiples | Forward multiples export | Consensus-based | 2026-08-06 (sync) | High |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Surprise | Historical EPS/rev surprise | Trailing quarters | 2026-08-06 (sync) | Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Trends | Estimate trend history | Trailing | 2026-08-06 (sync) | Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Revisions | Analyst-level revisions | Trailing | 2026-08-06 (sync) | Low-Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls (all 7 tabs) | **Duplicate** of the "(1)" workbook — identical row/col/cell counts confirmed across all 7 tabs [manifest.md] | Same as above | 2026-08-06 (sync) | Redundant — not double-counted |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | Combined Capital IQ landscape export (description, key financials, stock quote, investor list) | FY2024–FY2025 actuals, Jun-30-2026 press release, FY2026–FY2028E | 2026-08-06 (sync) | High (cross-check for Key Stats) |

No `analyses/UBER_2026-08-06/_pool_extracts/ciq_facts.json` sidecar exists for this run (confirmed absent by directory listing) — there is nothing to reconcile against; all figures below are this agent's own sourced read of the extracts. There is no `data/UBER/external/` folder, so no externally-sourced (alt-data/broker/channel-check) documents are in this pool.

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States (NYSE: UBER) | "Uber Technologies, Inc. (NYSE:UBER)" throughout all Capital IQ exports; primary office San Francisco, CA [Public Company Profile.rtf; CIQReportLandscape.rtf] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | US-domestic issuer; Capital IQ "Restatement: Latest Filings" tabs cite "A[nnual filing] 2025 filed Feb-13-2026" — a US 10-K filing cadence [Financials.xls, Capital Structure Details tab] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | Stated explicitly: "Acctg. Standard: US GAAP" [UberTechnologies,IncNYSEUBEREstimatesReport.xls, Consensus tab] |
| Reporting currency (and scale) | USD, reported in millions (no lakh/crore scale) | "Currency: USD" across Income Statement, Balance Sheet, Cash Flow tabs [Financials.xls] |
| Fiscal-year end | December 31 | Periods run "12 months Dec-31-20XX"; "Current Fiscal Year End: Dec-31-2026" [Financials.xls; Consensus tab] |
| Document language(s) | English | All 13 source documents and 45 extracted tabs are in English |

No primary 10-K/10-Q sits in the data pool (confirmed by cross-check against `business-model/00_data-triage.md` §2 and `earnings/00_earnings-data-triage.md` §6) — all annual/quarterly financial detail is vendor-parsed by Capital IQ from the FY2025 10-K (filed 2026-02-13) and interim filings. Per CLAUDE.md §5/§4, this module cites these figures as the Capital IQ export (source tier 5), never as "10-K" or "10-Q," since the underlying filing text cannot be directly verified in this pool. This is a real gap (see §5/§6 below) but does not block valuation sufficiency, since Capital IQ exports are an explicitly acceptable tier-5 source for multiples, estimates, comps, and capital structure under this module's own source hierarchy.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (vendor-parsed; no primary 10-K in pool) | Uber Technologies Inc NYSE UBER Financials.xls — Income Statement / Balance Sheet | FY2025 (Dec-31-2025), filed 2026-02-13 per Capital Structure Details tab | ~6 months since filing; ~0 months since Capital IQ resync (2026-08-06) |
| Quarterly filing (vendor-parsed; no primary 10-Q in pool) | Uber Technologies Inc NYSE UBER Financials.xls — Balance Sheet / Historical Capitalization | Q1 FY2026 (Mar-31-2026) balance sheet; LTM column through Jun-30-2026 (press release) | ~1–4 months |
| Capital structure / balance sheet | Uber Technologies Inc NYSE UBER Financials.xls — Capital Structure Summary / Details | 3 months Mar-31-2026 (latest column); FY2025 debt-instrument detail | ~4 months |
| Consensus / estimate export | UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Consensus | Consensus pulled 2026-08-05 10:04 GMT; FQ2 2026 actual/surprise; estimates through FY2027 | 0 months (1 day old) |
| Multiples export | UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — Multiples (forward) / Financials.xls — Multiples (historical/trailing) | As of 2026-08-05/06 | 0 months |
| Peer / comps export | Company Comparable Analysis Uber Technologies Inc.xls — Trading Multiples | "As-Of Date: 2026-08-06" | 0 months |
| Current price (Capital IQ) | Uber Technologies Inc NYSE UBER Financials.xls — Key Stats | Share Price $68.18, close as of Aug-05-2026 (cap table stated "current"); comps workbook confirms as-of 2026-08-06 | 0 months (0–1 day) |
| Cash flow statement | Uber Technologies Inc NYSE UBER Financials.xls — Cash Flow | FY2020–FY2025 annual + Jun-30-2026 LTM | 0–6 months |
| Segment data | Uber Technologies Inc NYSE UBER Financials.xls — Segments | FY2020–FY2025 annual (Mobility / Delivery / Freight) | ~6 months since latest annual segment disclosure; no interim segment P&L |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | Financials.xls, Key Stats tab: Share Price $68.18 (current cap table); Company Comparable Analysis.xls, Trading Multiples tab: "As-Of Date: 2026-08-06"; Consensus tab: "Latest Price/Last Close Price 69.48/68.18" — all mutually consistent and dated the same day/day before this run | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | Financials.xls, Income Statement tab: "Weighted Avg. Diluted Shares Out." 2087.98mm (FY2025); Ratios tab: diluted EPS series | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y (partial) | Financials.xls, Capital Structure Details tab lists 2028 Convertible Notes ($1,725mm), 2028 Exchangeable Senior Notes ($1,125mm) with terms; Income Statement gives basic vs. diluted weighted-average share counts (treasury-method effect implicit in the diluted count, not separately itemized by strike price) | Needed for fully diluted per-share fair value; convertible terms are disclosed, but no separate options/RSU strike-price schedule is in the pool — diluted weighted-average count is usable per the Fully Diluted Equity Rules fallback |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y | Business-model cross-module confirms a two-sided asset-light marketplace (Mobility/Delivery/Freight) [`business-model/02_business-identity.md`, `03_segment-map.md`] — clearly an **Operating** company under the Method Map | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | Y | Financials.xls, Key Stats: Total Debt $14,731mm, Cash & ST Investments $5,391mm, Total Minority Interest $1,083mm, Pref. Equity "-" (none) | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | Financials.xls, Income Statement tab: FY2020–FY2025 + Jun-30-2026 LTM (Revenue $55,227mm LTM) | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Financials.xls, Cash Flow tab: FY2020–FY2025 annual + Jun-30-2026 LTM | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | UberTechnologies,IncNYSEUBEREstimatesReport (1).xls, Consensus tab: NTM Revenue $62,192mm, NTM EBITDA $12,589mm, Target Price mean $102.03 (47 estimates); Guidance tab present | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | Financials.xls, Multiples tab (own-history quarterly/annual); EstimatesReport, Multiples tab (forward) | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis Uber Technologies Inc.xls, Trading Multiples tab: 10-company comp set (LYFT, DASH, DIDI, CAR, HTZ, GRAB, and others) with LTM and NTM multiples, dated 2026-08-06 | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT (EBITDA) | Y | Financials.xls, Segments tab: Mobility/Delivery/Freight revenue and EBITDA, FY2020–FY2025 (annual only, no interim segment P&L) | Sum-of-the-parts |
| Dividend / buyback data | Y (buybacks only; no dividend) | Financials.xls, Cash Flow tab: "Repurchase of Common Stock" -$6,904mm (FY2025); "Total Dividends Paid" and "Special Dividend Paid" both blank/"-" across all years — Uber pays no dividend | Shareholder-yield read |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/03_segment-map.md | Y |
| business-model/08_competitive-map.md | Y |
| business-model/07_business-quality.md | Y |
| business-model/09_moat.md | Y |
| business-model/10_external-dependency.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/04_guidance-consensus.md | Y |
| earnings/03_margin-drivers.md | Y |
| earnings/07_earnings-sensitivity.md | Y |
| earnings/06_earnings-quality.md | Y |

All ten cross-module files exist under `analyses/UBER_2026-08-06/business-model/` and `analyses/UBER_2026-08-06/earnings/` (both modules completed their full 00–99 run before valuation started). `management-governance/04_ownership-and-insider-behavior.md` and `99_management-governance-synthesis.md` are also present in the run root and should be read by `07`/`99` for the §24 Filter 6 unaligned-owner check, though that module is not formally required by this module's Cross-Module Inputs list.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N — a current, pool-verified Capital IQ price ($68.18, as of Aug-05/06-2026) is present and internally consistent across three independent exports | 01, 05, 07, 99 | Not applicable |
| No consensus / forward estimates | N — full consensus (target price, EPS/EBITDA/revenue NTM and through FY2027–FY2028) is present and 0–1 days old | 02, 03, 04, 05 | Not applicable |
| No peer data | N — a 10-company comp set with LTM and NTM multiples, dated 2026-08-06, is present | 03, 06 | Not applicable |
| No segment-level data | N — Mobility/Delivery/Freight revenue and EBITDA are disclosed annually FY2020–FY2025 | 06 | Not applicable |
| No balance sheet / capital structure | N — full balance sheet, debt-instrument detail (including convertible/exchangeable notes), and quarterly cap tables through Mar-31-2026 are present | 01, 04, 06 | Not applicable |
| No cash flow statement | N — full cash flow statement FY2020–FY2025 + LTM Jun-30-2026 is present | 04 | Not applicable |

No partial-data caps from the standard six-row table bind. The one real gap in this pool — **no primary 10-K/10-Q document**, only Capital IQ vendor-parsed figures — is not one of the six rows above (it is a source-tier issue, not a missing-data-category issue) and does not trip any Score-Cap Rule in `MODULE_RULES.md`'s table either, since Capital IQ exports for multiples/estimates/comps/capital-structure are an explicitly acceptable tier-5 source. It is flagged here so downstream agents cite these figures as "Capital IQ export," never as "10-K"/"10-Q" (per CLAUDE.md §5 and the earnings/business-model modules' own triage notes), and so a future data refresh prioritizes adding the primary filing.

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Financials.xls Multiples tab gives quarterly/annual own-history EV/EBITDA, P/E, etc.; current price and forward consensus both present to compute NTM multiples |
| Peer relative valuation | Y | None | 10-company comp set (Company Comparable Analysis workbook), LTM and NTM bases, dated same-day as this triage |
| Intrinsic DCF (Operating FCFF) | Y | None | Full income statement, balance sheet, and cash flow statement (FY2020–FY2025 + LTM) support a CFO − capex FCFF build; consensus provides the near-term forecast path |
| Reverse DCF | Y (conditional on `04` running first) | Depends on `04`'s canonical WACC + FCF base per Reconciliation/DCF Standard 9 | Current price is pool-verified, so "what's priced in" is answerable once `04` publishes |
| SOTP | Y | None | Mobility/Delivery/Freight revenue and EBITDA disclosed annually; peer comp set gives segment-adjacent comparables (e.g., DASH for Delivery, LYFT/GRAB for Mobility); note per `business-model/03_segment-map.md` that a pending Delivery Hero acquisition (announced on the Q2 2026 call) may change the segment structure going forward — flag for `06` |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A full income statement, balance sheet, and cash flow statement (Capital IQ export, FY2020–FY2025 plus a Jun-30-2026 LTM column) exist alongside a pool-verified, same-day current price, a fresh consensus/estimate export, a 10-company peer comp set, and annual segment-level revenue/EBITDA — all five valuation methods (own-history multiples, peer relative, DCF, reverse-DCF, SOTP) can run.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (FCFF), reverse-DCF (after `04`), sum-of-the-parts.
- **Active partial-data caps:** None from the standard six-row Partial-Data table.
- **Critical missing items:** None that block sufficiency. Note for downstream agents: no primary 10-K/10-Q sits in the pool — every historical financial and segment figure must be cited as a Capital IQ export (tier 5), never attributed to the 10-K/10-Q by name, and a pending Delivery Hero acquisition (disclosed on the Q2 2026 call) may reshape the Delivery segment and should be flagged as a structural watch-item in `06_sum-of-the-parts` and `07_scenario-and-fair-value`.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — UBER

No `ciq_facts.json` sidecar exists for this run (confirmed absent — see `00_valuation-data-triage.md` §1); all figures below are this agent's own sourced read of the Capital IQ pool extracts, cross-checked across the two independent Capital IQ workbooks in the pool (the company Financials export and the Comparable Analysis / comps export). No primary 10-K/10-Q sits in `data/UBER/`; every figure below is a **Capital IQ export (source tier 5)**, cited as such — never attributed to "10-K" or "10-Q" by name, per `00_valuation-data-triage.md` §1A. Reporting standard: **US GAAP**. Reporting currency: **USD** (in millions unless stated as per-share). Jurisdiction: US / NYSE.

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $68.18 | Capital IQ export — Uber Technologies Inc NYSE UBER Financials.xls, Key Stats tab, "Current Capitalization" block | Close, Aug-05-2026 |
| Currency | USD | Financials.xls, Key Stats tab | — |
| Price basis | Last close (explicitly stated: "Currency in USD in mm, LTM as of Jun-30-2026 TEV and Market Cap are calculated using a close price as of Aug-05-2026") | Uber Technologies Inc NYSE UBER Public Company Profile.rtf | Aug-05-2026 |

**Corroboration.** The $68.18 close is confirmed by two further, separately-exported Capital IQ tabs pulled the same day: (1) Company Comparable Analysis Uber Technologies Inc.xls, Financial Data tab — "Day Close Price Latest 68.18," As-Of Date 2026-08-06; (2) UberTechnologies,IncNYSEUBEREstimatesReport (1).xls, Consensus tab — "Latest Price/Last Close Price 69.48/68.18" (69.48 = intraday/latest tick; 68.18 = the last close used for capitalization purposes), consensus pulled 2026-08-05 10:04 GMT. All three exports agree to the cent. This is a single-vendor (Capital IQ) pool price with internal multi-tab corroboration — not a web-sourced quote, so the "two independent web sources" test does not apply; it is **pool-verified**.

**Price staleness.** Run date 2026-08-06; price as-of Aug-05-2026 close = 1 calendar day ≈ 1 trading day old. This is well inside the 5-trading-day threshold — no refresh attempt or staleness cap is required. The price remains fresh for margin-of-safety and downside-to-bear use downstream.

**Price-state: `pool-verified`.**

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of, tied to current cap table) | 2,035.599 mm | Financials.xls, Key Stats tab, "Current Capitalization" block, "Shares Out." (dilution basis: Basic; paired with the $68.18 price) |
| Total shares outstanding, balance-sheet date (Jun-30-2026) | 2,036.458 mm | Financials.xls, Balance Sheet tab, Supplemental Items, "Total Shares Out. on Balance Sheet Date" |
| Weighted-avg basic shares (LTM Jun-30-2026) | 2,061.502 mm | Financials.xls, Income Statement tab |
| Weighted-avg diluted shares (LTM Jun-30-2026) | 2,087.980 mm | Financials.xls, Income Statement tab |
| Implied dilution effect (diluted − basic, LTM) | +26.48 mm (~1.3%) | Derived from the two rows above |
| Options/RSUs count (separate strike-price schedule) | Not disclosed in pool | — |
| Convertibles / potential shares | 2028 Convertible Notes, $1,725mm principal, 0.875% coupon, matures 2028-12-01; 2028 Exchangeable Senior Notes, $1,125mm principal, 0% coupon, secured, matures 2028-05-15 | Financials.xls, Capital Structure Details tab |
| **Fully diluted shares used (proxy)** | **2,087.980 mm** (LTM weighted-average diluted) | Financials.xls, Income Statement tab — limitation below |
| Share count used for market cap | 2,035.599 mm | Financials.xls, Key Stats tab |
| Share count used for per-share fair value | 2,087.980 mm | Financials.xls, Income Statement tab |

**Cross-check discrepancy (flagged, not resolved).** A second, independently-exported Capital IQ workbook — Company Comparable Analysis Uber Technologies Inc.xls, Financial Data tab — states "Shares Outstanding Latest" as 2,042.6 mm (as-of 2026-08-06), about 7 mm shares (~0.35%) higher than the Financials.xls Key Stats figure used above. Both exports are the same vendor pulling different snapshot dates/dilution conventions; the gap is immaterial to market cap (<0.4%) but is noted so a downstream agent does not treat the two as independent confirmations of the identical number. This agent uses the Financials.xls Key Stats figure as canonical because it is the export that is directly paired, in the same table, with the $68.18 price and the EV bridge components below (internal tie-out).

**Fully diluted share limitation.** No options/RSU strike-price schedule and no separate if-converted share count for the two convertible/exchangeable notes are disclosed in the pool, so an independent treasury-stock-method (TSM) + if-converted build cannot be constructed bottom-up. Per the Fully Diluted Equity Rules fallback, this agent uses the GAAP **weighted-average diluted share count** (2,087.980 mm, LTM Jun-30-2026), which already embeds the TSM effect of options/RSUs and the if-converted effect of the notes to the extent GAAP diluted-EPS rules found them dilutive in the period — but this is a **weighted-average for the trailing 12 months, not a point-in-time fully diluted count as of today**, and may differ from a true today-dated fully diluted share count. This is a labeled limitation, not a gap that blocks valuation.

**Which count for which purpose.** Market cap uses the most recent as-of basic share count (2,035.599 mm) per the Fully Diluted Equity Rules (market-cap count = latest "as of" count, not a weighted average). Per-share fair-value outputs downstream should use the diluted weighted-average (2,087.980 mm) so per-share intrinsic/DCF/SOTP values are not overstated by ignoring options, RSUs, and the convertible/exchangeable notes.

## 3. Market Capitalization

`Market cap = share count (2,035.599 mm) × current price ($68.18) = $138,787.14 mm (~$138.8bn)`

This ties exactly to Financials.xls, Key Stats tab, "Market Capitalization" = 138,787.140706. Cross-check: Company Comparable Analysis.xls, Financial Data tab states Market Capitalization Latest = $139,261.7mm (using its own 2,042.6mm share count × $68.18) — a 0.34% variance explained entirely by the share-count discrepancy noted in §2, not by a price disagreement.

## 4. Enterprise Value Bridge

| Component | Amount ($mm) | Source |
|---|---:|---|
| Market capitalization | 138,787.14 | §3 above |
| + Total debt (short + long term) | 14,731 | Financials.xls, Balance Sheet tab, Jun-30-2026 press-release column: Curr. Port. of LT Debt (1,997) + Curr. Port. of Leases (178) + Long-Term Debt (10,726) + Long-Term Leases (1,830) = 14,731; matches Key Stats tab "+ Total Debt" line exactly |
| + Minority / non-controlling interest | 1,083 | Financials.xls, Balance Sheet tab, Jun-30-2026: Minority Interest 1,083; matches Key Stats tab |
| + Preferred equity | 0 | Financials.xls, Key Stats tab: "Pref. Equity —" (none outstanding) |
| + Operating lease liabilities | Not added separately — already included in "Total debt" above (Curr./LT Leases lines are Capital IQ's operating+finance lease liabilities per Capital Structure Details tab) | Financials.xls, Balance Sheet / Capital Structure Details tabs |
| + Underfunded pension / other long-term obligations | None disclosed — Financials.xls, Pension OPEB tab is sparse/not applicable to Uber | Financials.xls, Pension OPEB tab |
| − Cash & equivalents (+ ST investments) | (5,391) | Financials.xls, Balance Sheet tab, Jun-30-2026: Cash And Equivalents 4,870 + Short Term Investments 521 = 5,391; matches Key Stats tab "− Cash & Short Term Investments" |
| − Equity-method investments | Not netted — see cash-quality note below | — |
| **= Enterprise value (EV)** | **149,210.14 (~$149.2bn)** | Sum of above; ties exactly to Financials.xls, Key Stats tab "Total Enterprise Value (TEV)" = 149,210.140706 |

**Cross-check.** Company Comparable Analysis.xls, Financial Data tab computes EV independently as Market Cap (139,261.7) + Net Debt (9,340) + Minority Interest (1,083) − Preferred (0) = **149,684.7**, a 0.32% variance vs. the $149,210.14mm figure above, fully explained by the same ~0.35% share-count snapshot difference noted in §2/§3 (both exports use the identical $9,340mm net-debt figure — see §5). The two independent Capital IQ exports agree on EV to within a third of a percent.

**Adjustments NOT made, and why:**
- Operating leases are already folded into "Total debt" via Capital IQ's Curr./LT Leases lines (Capital Structure Details tab lists "Operating Lease Liabilities" of $1,559mm and "Finance Leases" of $222mm within the debt schedule), so no separate add-on is applied — adding them again would double-count.
- No pension/OPEB adjustment — not applicable to Uber (sparse/blank tab).
- No equity-method-investment carve-out is added back to EV (see cash-quality note immediately below) — the pool's current-period bridge already treats them as non-cash, non-netted assets, which this agent adopts, but flags the underlying data quality question.

### Cash quality — flagged, not silently accepted

"Cash & Short Term Investments" of $5,391mm (Jun-30-2026: $4,870mm cash + $521mm ST investments) is genuine operating cash and short-dated equivalents. **Restricted cash ($661mm at Jun-30-2026) is already excluded** — it sits on its own balance-sheet line and is not part of the $5,391mm netted above; this is the correct treatment and required no adjustment.

Separately, Uber carries **$12,532mm of "Long-term Investments"** and **$3,773mm of "Equity Method Investments"** on the Jun-30-2026 balance sheet (Financials.xls, Balance Sheet tab) — up sharply from $9,465mm and $287mm, respectively, at FY2025 year-end. On the Q2 2026 earnings call, CFO Balaji Krishnamurthy stated Uber "deployed about $4 billion of capital in the second quarter" on "market purchases of Delivery Hero stock" ahead of the announced Delivery Hero acquisition [Q2 2026 Earnings Call transcript, Aug-05-2026, l.577–585]. This explains most of the jump: it is a strategic, pre-acquisition equity stake in a company being bought, not a liquid or cash-like asset, and is correctly **not** netted against EV here.

Two things are flagged for downstream agents rather than resolved:
1. **Definitional inconsistency inside the same Capital IQ workbook.** The Historical Capitalization tab (quarterly EV bridge) nets a "Long Term Marketable Securities" line against EV for every quarter from Dec-2024 through Mar-2026 (ranging $3,873mm–$5,737mm), but the Key Stats tab's "Current Capitalization" bridge (the one used for §4 above, based on the Jun-30-2026 press-release balance sheet) shows this line as blank/zero. It is unclear from the pool whether this genuinely fell to zero (e.g., because the underlying holdings lost public-market/marketable status once folded into the Delivery Hero stake or other equity-method positions) or whether the field is simply unpopulated in the latest snapshot. **This agent does not net any portion of the $12,532mm Long-term Investments against EV, because there is no reliable current-period split between liquid/marketable and illiquid/strategic holdings in the pool** — inventing one would be a fabricated figure. Flagged as a data-quality gap for the next data refresh (the FY2026 10-K's investment note would resolve it).
2. **Materiality for downstream agents.** At ~$16.3bn combined (Long-term Investments + Equity Method Investments), these holdings are large enough (≈11.8% of the $149.2bn EV) that a different vendor view — or a future refresh that nets any portion of them as "cash-like" — would materially change net debt and EV. Any downstream agent that encounters a Capital IQ "cash" figure inclusive of these items should NOT adopt it uncritically; the canonical net-debt figure in this report nets ONLY the $5,391mm of true cash & ST investments (§5).

## 5. Net Debt & Leverage Snapshot

| Metric | Value ($mm) | Source |
|---|---:|---|
| Total debt | 14,731 | §4 above |
| Cash & equivalents (+ ST investments) | 5,391 | §4 above |
| **Net debt (strict: total debt − cash & equivalents)** | **9,340** | Derived (14,731 − 5,391); matches Financials.xls, Balance Sheet tab "Net Debt" supplemental line (9,340, Jun-30-2026) exactly, and matches the independently-computed Comparable Analysis.xls "LTM Net Debt" figure (9,340) exactly — two-source agreement on this figure specifically |
| Net Debt / LTM EBITDA (Capital IQ GAAP EBITDA) | 1.19x | Financials.xls, Ratios tab, "Net Debt/EBITDA," LTM column (1.187615) — vendor-computed ratio cited as-is, not independently recomputed, to avoid mixing EBITDA bases |

Net debt is presented on the **strict** basis (total debt − cash & equivalents, including short-term investments), consistent with CLAUDE.md §15's default definition. No broad-basis (netting in long-term marketable securities) figure is presented as canonical for the reasons stated in the cash-quality note above — the current-period split needed to compute a broad-basis figure is not reliably available in this pool.

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | $13.41 | Financials.xls, Balance Sheet tab, Jun-30-2026, "Book Value/Share" |
| Tangible book value per share | $8.21 | Financials.xls, Balance Sheet tab, Jun-30-2026, "Tangible Book Value/Share"; cross-confirmed by Company Comparable Analysis.xls, Financial Data tab, "LTM Tangible Book Value/Share" = 8.21 |
| Net debt per share (strict) | $4.59 | Derived: $9,340mm net debt ÷ 2,035.599mm shares (the market-cap share count) |

## 7. Anchor Summary (canonical numbers for downstream agents)

- **Current price:** $68.18, close as of Aug-05-2026 — pool-verified, corroborated across three independent Capital IQ exports (Financials.xls Key Stats, Comparable Analysis.xls Financial Data, EstimatesReport Consensus). 1 trading day old at run date — no staleness cap applies.
- **Share count (market cap):** 2,035.599 mm (Financials.xls, Key Stats — most recent "as of" basic count paired with price).
- **Share count (per-share fair value):** 2,087.980 mm (LTM weighted-average diluted, Income Statement tab) — a GAAP-embedded proxy for fully diluted shares, not an independently rebuilt TSM/if-converted count; labeled limitation (no options/RSU strike-price schedule in the pool).
- **Market cap:** $138,787.14 mm (~$138.8bn).
- **Net debt (strict basis, canonical for downstream reuse per Reconciliation Gate 1):** $9,340 mm.
- **EV:** $149,210.14 mm (~$149.2bn) — cross-checked to within 0.32% by an independent Capital IQ export.
- **Reporting currency:** USD.
- **Key caveats:** (1) no primary 10-K/10-Q in the pool — every figure above is a Capital IQ export (tier 5), cited as such; (2) fully diluted share count is a weighted-average proxy, not a bottom-up TSM/if-converted build, because option/RSU strike terms are not disclosed in the pool; (3) ~$16.3bn of Long-term Investments + Equity Method Investments (including a ~$4bn Q2-2026 Delivery Hero pre-acquisition stake) is correctly excluded from net debt/cash, but the pool's own current-vs-historical treatment of a "Long Term Marketable Securities" line item is internally inconsistent and unresolved — flagged, not guessed at; (4) a ~0.35% share-count/EV variance exists between two Capital IQ exports (Financials.xls vs. Comparable Analysis.xls), immaterial but noted for transparency.

### Anchor Block (copy-forward)

- Price: $68.18 (Aug-05-2026 close, last close)
- Price-state: pool-verified
- Currency: USD
- Shares (market cap): 2,035.599 mm (Financials.xls, Key Stats tab)
- Shares (per-share fair value): 2,087.980 mm (Financials.xls, Income Statement tab — LTM weighted-average diluted; limitation: not a bottom-up TSM/if-converted rebuild)
- Market cap: $138,787.14 mm
- Net debt: $9,340 mm (strict: total debt $14,731mm − cash & ST investments $5,391mm)
- EV: $149,210.14 mm
- Key caveats: no primary 10-K/10-Q in pool (Capital IQ export, tier 5, throughout); fully diluted share count is a weighted-average proxy; ~$16.3bn of long-term/equity-method investments (incl. a ~$4bn Delivery Hero pre-acquisition stake) excluded from net debt with an internally-inconsistent vendor treatment flagged; ~0.35% share-count variance between two Capital IQ exports (immaterial, noted)



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — UBER

Reporting currency: **USD** (millions, except per-share figures). Anchors reused verbatim from `01_price-and-capital-structure.md`: price $68.18 (close, Aug-05-2026, pool-verified), shares for market cap 2,035.599mm, shares for per-share fair value 2,087.980mm (LTM diluted weighted-average — a GAAP-embedded proxy, not a bottom-up TSM/if-converted rebuild, per `01`'s labeled limitation), market cap $138,787.14mm, net debt (strict) $9,340mm, minority interest $1,083mm, preferred $0, EV $149,210.14mm. Business type: **Operating** (asset-light two-sided marketplace — Mobility/Delivery/Freight, confirmed in `business-model/02_business-identity.md`), so EV-based multiples, P/E, and FCF yield are the primary lenses per the Business-Type Method Map; P/Book and P/Tangible Book are shown for completeness but are secondary for an asset-light platform business (they say more about historical losses/buybacks than about the earning power that actually drives Uber's value).

**Headline data-availability caveat (read before the tables below).** The only own-multiples time series in this data pool (`Uber-Technologies-Inc-NYSE-UBER-Financials.xls`, Multiples tab) runs **quarterly from Mar-31-2025 to Aug-05-2026 — seven data points spanning ~17 months**, not the 3–5 years this agent normally targets. Uber itself has traded on the NYSE since May 2019 (over six years) — this is a **pool-coverage gap, not a young-company issue** — but the effect on this report is the same one the partial-data rule addresses: a mean/median computed off seven quarterly points is not a reliable long-run "normal" level. Per the partial-data rule, this report presents the available band and computes a directional read, but treats every reversion-implied value in §4 as **illustrative-only, not a tight fair-value input for `07_scenario-and-fair-value`.**

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| EV / Sales | LTM (Jun-30-2026) | Revenue $55,227mm | **2.70x** | Self-derived: EV $149,210.14mm ÷ $55,227mm [Financials.xls, Income Statement tab]; ties to Capital IQ's own LTM figure 2.70176x [Financials.xls, Key Stats tab, "Valuation Multiples based on Current Capitalization"] |
| EV / Sales | NTM | Consensus NTM revenue $62,191.86mm | **2.41x** | Self-derived: EV ÷ NTM revenue; vendor states 2.4068x [EstimatesReport (1).xls, Multiples tab] |
| EV / EBITDA | LTM (Jun-30-2026) | EBITDA (GAAP-based, EBIT + D&A) $7,474mm | **19.96x** (self-derived); Capital IQ's own stated LTM figure is **19.14x–19.20x** | Self-derived: EV $149,210.14mm ÷ $7,474mm [Financials.xls, Key Stats tab, "EBITDA" LTM row]. **~4% unreconciled gap** vs. the vendor's own "TEV/EBITDA" LTM cells (19.140547x, Key Stats; 19.20143x, Multiples tab, Aug-05 close) — the vendor's own two cells agree with each other to within 0.3% but not with a literal EV÷EBITDA computed off the headline EV and EBITDA rows on the same sheet. Flagged, not resolved (same category of internal Capital IQ tab inconsistency `01` §4 already found on cash/investments) |
| EV / EBITDA | NTM | Consensus NTM EBITDA $12,589.03mm | **11.85x** (self-derived) / **11.89x** (vendor) | Self-derived: EV ÷ NTM EBITDA; vendor [EstimatesReport (1).xls, Multiples tab] |
| EV / EBIT | LTM (Jun-30-2026) | EBIT $6,700mm | **22.27x** (self-derived) / **22.50x–22.57x** (vendor) | Self-derived: EV ÷ $6,700mm [Financials.xls, Key Stats tab]; vendor [Key Stats "Valuation Multiples" table; Multiples tab, Aug-05 close] — ~1% gap, immaterial |
| EV / EBIT | NTM | Vendor-computed only (NTM EBIT $ not separately itemized in this pool) | **15.40x** | [EstimatesReport (1).xls, Multiples tab] |
| P / E | LTM (Jun-30-2026), diluted EPS excl. extra items | EPS $4.584852 | **14.87x** | Self-derived: $68.18 ÷ $4.584852 [Financials.xls, Income Statement / Key Stats tabs]; ties almost exactly to vendor 14.870709x |
| P / E | NTM, consensus diluted EPS excl. extra items ("EPS (GAAP)" per Capital IQ's own label) | Consensus EPS $4.20 | **16.22x** | [EstimatesReport (1).xls, Multiples tab: 16.2171x; Consensus tab, "EPS (GAAP)" NTM column, $4.20] — **caveat:** this EPS series is the one `earnings/06_earnings-quality.md` flags as distorted by non-operating items (a $5,758mm FY2024 and $4,346mm FY2025 non-cash deferred-tax valuation-allowance release, plus volatile equity-stake mark-to-market gains/losses) — treat this P/E as less reliable for a warranted-multiple read than the EV-based multiples above |
| P / Normalized EPS | LTM (memo, not a primary multiple) | Normalized diluted EPS $1.935842 (strips the tax benefit and investment marks) | **35.22x** | [Financials.xls, Income Statement tab, "Normalized Diluted EPS"; Multiples tab, Aug-05 close 35.219816x] — shown only to illustrate how much the P/E read changes depending on which EPS definition is used; not carried into §2–§4 |
| P / Book | LTM | Book value/share $13.41 | **5.08x** | Self-derived: $68.18 ÷ $13.41 [`01` §6]; ties to vendor 5.082944x. Secondary metric for an asset-light platform business |
| P / Tangible Book | LTM | Tangible book value/share $8.21 | **8.30x** | Self-derived: $68.18 ÷ $8.21 [`01` §6]; ties to vendor 8.308144x |
| P / FCF (CFO − capex basis) | LTM (Jun-30-2026) | FCF = CFO $10,424mm − capex $308mm = $10,116mm | **13.72x** (Market cap ÷ FCF); FCF yield **7.29%** | Self-derived per MODULE_RULES calc standard (FCF = CFO − total capex) [Financials.xls, Cash Flow tab]; matches `earnings/06_earnings-quality.md`'s cited "$10,116mm" TTM FCF and management's own Q2 FY2026 call claim of "trailing 12-month free cash flow exceeding $10 billion" |
| EV / LTM Unlevered FCF (Capital IQ vendor definition) | LTM | Capital IQ's own "Unlevered FCF" $7,527.5mm (a lower, more conservative figure than CFO − capex — see note) | **19.89x** | [Financials.xls, Multiples tab, "TEV/LTM Unlevered FCF," Aug-05 close] |
| Dividend yield | — | Uber pays no dividend | **0% / N/A** | [Financials.xls, Cash Flow tab: "Total Dividends Paid" and "Special Dividend Paid" both blank across all years]. Shareholder returns come via buybacks only: $6,904mm repurchased in FY2025 (~5% of FY2025-average market cap) [Financials.xls, Cash Flow tab, "Repurchase of Common Stock"] |

**Note on the FCF gap.** Capital IQ's own "Unlevered/Levered FCF" line ($7,527.5mm / $7,238.75mm LTM) is meaningfully lower than the CFO − capex figure ($10,116mm) used above, because it does not credit Uber for the working-capital tailwind (negative working capital from same-day rider/eater payment collection vs. a lag paying drivers/merchants — the "single strongest positive earnings-quality signal" per `earnings/06_earnings-quality.md`). Both are shown; the CFO − capex figure is the primary one per this module's calculation standard.

## 2. Historical Multiple Bands (~17 months — see caveat above)

*Basis: Capital IQ's own quarterly "Multiples" tab, "Close" column, seven quarter-ends Mar-31-2025 → Aug-05-2026 (latest = current). Same underlying EBITDA/EBIT/EPS definitions as §1's vendor cross-checks (GAAP-based EBITDA = EBIT + D&A; diluted EPS excl. extra items).*

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| EV / Sales | 2.71x | 3.41x | 3.41x | 4.34x | **2.71x** | **0th** (current = the trough of the window) |
| EV / EBITDA | 19.20x | 29.77x | 30.27x | 39.97x | **19.20x** | **0th** (current = the trough) |
| EV / EBIT | 22.57x | 37.71x | 37.53x | 55.28x | **22.57x** | **0th** (current = the trough) |
| P / E (diluted, excl. extra items) | 10.48x | 15.36x | 15.98x | 17.84x | **14.87x** | **~60th** (roughly mid-range, NOT at the trough) |
| P / Book | 5.08x | 6.80x | 6.04x | 9.05x | **5.08x** | **0th** (current = the trough) |
| P / Tangible Book | 8.31x | 11.47x | 9.38x | 16.35x | **8.31x** | **0th** (current = the trough) |
| EV / LTM Unlevered FCF (vendor) | 19.89x | 26.36x | 23.97x | 34.78x | **19.89x** | **0th** (current = the trough) |
| Market Cap / LTM Levered FCF (vendor) | 19.24x | 27.31x | 25.01x | 36.43x | **19.24x** | **0th** (current = the trough) |

[Source for every row: Financials.xls, Multiples tab, "Close" values, quarters ending 2025-03-31, 2025-06-30, 2025-09-30, 2025-12-31, 2026-03-31, 2026-06-30, and the current 2026-08-05 column.]

**Read the pattern, not just the level.** Every EV- and book-based multiple sits at the exact bottom of its own (short) range — the current quarter IS the minimum of all seven observations for six of the eight rows. Only P/E sits mid-range. Section 3 explains why this is not simply "the stock got cheaper."

## 3. Re-Rating / De-Rating Read

Uber's **EV/EBITDA** has compressed from a 39.97x high (quarter ended Jun-30-2025) to 19.20x today — a **discount of -35.5% to its own 7-quarter mean (29.77x) and -36.6% to its own median (30.27x)**: `(19.20 − 29.77) / 29.77 = -35.5%`; `(19.20 − 30.27) / 30.27 = -36.6%`. **EV/EBIT** shows the same pattern, even more sharply: current 22.57x vs. mean 37.71x = **-40.1% discount**; vs. median 37.53x = **-39.8% discount**. **EV/Sales** shows a smaller but still material **-20.6% discount** to both its own mean and median (2.71x vs. 3.41x). By contrast, **P/E** (diluted, excl. extra items) sits close to its own history: 14.87x vs. a 15.36x mean (**-3.2%**) and a 15.98x median (**-6.9%**).

This is a de-rating on the EV-based multiples, but the evidence says the driver is mostly the **denominator**, not a collapse in sentiment on price alone. Over the same window, LTM EBITDA roughly doubled — from an FY2024 base of $3,536mm toward the current $7,474mm LTM figure [`earnings/01_historical-financials.md`; Financials.xls, Key Stats tab] — while the share price itself round-tripped: $79.42 (Feb-2025 pricing date) → a peak $94.67 (Nov-2025) → a trough $69.99 (Feb-2026) → $79.17 (May-2026) → $68.18 today [Financials.xls, Historical Capitalization tab]. Price is down roughly -14% from the Feb-2025 level and -28% from the Nov-2025 peak, but EBITDA and EBIT scaled far faster than that — so EV/EBITDA and EV/EBIT compressed by roughly half even though the price move alone was much smaller. P/E did not compress nearly as much because GAAP diluted EPS has been choppier and less directional (inflated in FY2024–FY2025 by the deferred-tax valuation-allowance release, per `earnings/06_earnings-quality.md`), so the P/E "mean" it is being compared against was never cleanly rising the way EBITDA was.

**Read: this is a genuine de-rating on EV-based multiples, but a large part of the compression is a "growing into it" effect from EBITDA/EBIT scaling roughly 2x over the same short window** — not solely negative sentiment. No structurally misaligned controlling owner discount applies here: `management-governance/04_ownership-and-insider-behavior.md` and `99_management-governance-synthesis.md` both confirm RF-OWN-004 (CLAUDE.md §24, Filter 6) is **not triggered** — Uber's register is diffuse (largest holder BlackRock at 7.4%), with no government control, no listed-subsidiary-of-a-value-maximizing-parent structure, and no sprawling unrelated-diversified conglomerate.

## 4. Implied Value from Reversion — ILLUSTRATIVE ONLY (short-history caveat applies)

Per the partial-data rule, because the pool's own-multiple history is ~17 months (well short of the ~3-year threshold), **the table below is a labeled illustrative exhibit, not a tight fair-value input for `07_scenario-and-fair-value`.** Bridge convention used throughout: Implied equity value = Implied EV − net debt (strict, $9,340mm) − minority interest ($1,083mm) − preferred ($0); per-share value divides by the 2,087.980mm diluted per-share-fair-value count (per `01`'s Fully Diluted Equity Rules guidance), except the P/E row, which is already a direct price multiple.

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price ($68.18) |
|---|---:|---:|---:|---:|
| EV / Sales (× LTM revenue $55,227mm) | 3.41x / 3.41x | EV ≈$188.5bn → Equity ≈$178.1bn (both) | $85.30 / $85.29 | **+25.1% / +25.1%** |
| EV / EBITDA (× LTM EBITDA $7,474mm) | 29.77x / 30.27x | EV ≈$222.5bn / $226.2bn → Equity ≈$212.1bn / $215.8bn | $101.58 / $103.35 | **+49.0% / +51.6%** |
| EV / EBIT (× LTM EBIT $6,700mm) | 37.71x / 37.53x | EV ≈$252.6bn / $251.4bn → Equity ≈$242.2bn / $241.0bn | $116.02 / $115.44 | **+70.2% / +69.3%** |
| P / E (× LTM diluted EPS $4.584852) | 15.36x / 15.98x | — (direct price multiple) | $70.42 / $73.25 | **+3.3% / +7.4%** |
| EV / LTM Unlevered FCF, vendor (× $7,527.5mm) | 26.36x / 23.97x | EV ≈$198.4bn / $180.4bn → Equity ≈$188.0bn / $170.0bn | $90.05 / $81.44 | **+32.1% / +19.5%** |

**Base-case point (named): EV/Sales, median-basis → $85.29/share (+25.1% vs. the current $68.18).** EV/Sales is named as the most reliable of the five for this specific reversion exercise — not because it is more informative about profitability, but because it is the multiple *least distorted* by the two problems that afflict the others here: (a) the EV/EBITDA and EV/EBIT reversion targets are inflated by mixing quarters from a much-lower-margin regime (Mar-2025 EBITDA margin was materially below today's) into a mean/median that is then applied to today's much larger EBITDA/EBIT base — a like-for-like comparison would need margin-adjusted history this pool does not have; (b) the P/E reversion target rests on a GAAP EPS series `earnings/06_earnings-quality.md` already flags as inflated by a non-recurring-but-twice-recurred deferred-tax benefit. EV/Sales sidesteps both by not depending on the margin line at all.

**Dispersion across methods (median-basis): $73.25 (P/E) to $115.44 (EV/EBIT), i.e., roughly +7% to +69% vs. today's price.** This is an unusually wide spread for a single company's own multiples, and the spread itself — not any single point in it — is the more important finding given the short window.

**Reversion-assumption check (required disclosure).** Reverting to the own-mean/median assumes the warranted multiple has not structurally changed. The evidence here argues **against** taking that assumption at face value for EV/EBITDA and EV/EBIT specifically: `business-model/07_business-quality.md` scores overall business quality only 47/100 ("mixed, low end"), flags real cyclicality (38/100 — a documented FY2020 COVID trough and a FY2022–2025 Freight downturn) and real regulatory dependence (28/100 — a live UK take-rate reclassification and ongoing driver-classification fights). A business scaling EBITDA margin this fast, in a cyclical and regulation-exposed model, does not automatically deserve the SAME multiple it earned when EBITDA was a third of its current size and growing off a much smaller base — the old ~30–38x EV/EBITDA/EBIT mean may itself have reflected a higher-growth-rate, lower-margin-base period that will not simply repeat as growth normalizes. This is **not proven from available data** either way (no note-level detail on forward margin normalization exists in this pool) — it is flagged as the central open question, not resolved here.

## 5. Own-History Read

On EV/EBITDA and EV/EBIT, Uber trades at the exact bottom of the only own-multiple window in this data pool (19.20x vs. a 29.77x mean, a **-35.5% discount**; 22.57x vs. a 37.71x mean, a **-40.1% discount**) — but roughly half of that compression is explained by LTM EBITDA/EBIT roughly doubling over the same ~17 months, not by price alone (price is down only -14% to -28% from its Feb-2025/Nov-2025 levels over the same window). Reverting to the own-mean on EV/EBITDA or EV/EBIT implies **+49% to +70%** upside on a median basis — a number this report will not hand to `07` as a tight target, because it rests on only seven quarterly observations and mixes a lower-margin earlier regime into the "mean" being reverted to. The single biggest caveat: **this data pool's own-multiple export starts in Mar-2025, even though Uber has traded since 2019 — a true 3–5 year band almost certainly exists and would very likely show a different (probably higher, IPO/early-scaling-era) mean, so treat every number in §4 as illustrative, not as evidence the stock is durably underpriced on its own history.** No misaligned-controlling-owner discount applies (RF-OWN-004 not triggered per `management-governance/04_ownership-and-insider-behavior.md`), so this is a data-window problem, not a structural-ownership one.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — UBER

**Anchor (reused verbatim from `01_price-and-capital-structure.md`, not re-derived):** price $68.18 (close, Aug-05-2026, pool-verified); market-cap share count 2,035.599mm; per-share fair-value share count 2,087.980mm (LTM weighted-average diluted); net debt (strict) $9,340mm; minority interest $1,083mm; preferred $0; market cap $138,787.14mm; EV $149,210.14mm. Reporting standard US GAAP, currency USD. No `ciq_facts.json` sidecar exists for this run (confirmed absent in `00_valuation-data-triage.md`); every figure below is a Capital IQ export (source tier 5), cited as such.

## 1. Peer Set

The peer set is **sourced from two places**: the three named competitors in `business-model/08_competitive-map.md` (Lyft, DiDi, Grab — Mobility-segment rivals) plus Capital IQ's own default comp-set selection for Uber (`Company Comparable Analysis Uber Technologies Inc.xls`, 10 names, as-of 2026-08-06), which is the source `08_competitive-map.md` itself draws from and separately flags DoorDash as a Delivery-segment (not Mobility-only) rival excluded from its own map. Because this agent values the whole company (Mobility + Delivery + Freight), DoorDash is added back in as a core comparable. **Neither set is fully self-selected** — it is competitive-map-named plus the vendor's own relevancy-ranked list.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Lyft, Inc. | NasdaqGS:LYFT | Direct US/Canada peer-to-peer ridesharing marketplace, same two-sided matching model as Uber Mobility | `08_competitive-map.md` (named) + CIQ comp set |
| DoorDash, Inc. | NasdaqGS:DASH | Multi-sided commerce/delivery marketplace (merchants–consumers–dashers); the closest structural match to Uber Delivery, Uber's second-largest segment | CIQ comp set only — `08_competitive-map.md` excluded it because that map is scoped to the Mobility segment; added here because this is a whole-company valuation |
| DiDi Global Inc. | OTCPK:DIDI.Y | Ride-hailing platform; Uber's CEO names DiDi directly as a head-to-head Brazil Mobility and Delivery ("DiDi Food") competitor on the Q2 FY2026 call | `08_competitive-map.md` (named, management-cited) + CIQ comp set |
| Grab Holdings Limited | NasdaqGS:GRAB | Southeast Asia ride-hailing + delivery "superapp" — the same multi-vertical, take-rate model as Uber, at smaller scale | `08_competitive-map.md` (named) + CIQ comp set |

**Core marketplace peer set = Lyft, DoorDash, DiDi, Grab** — these four run the same asset-light, two/three-sided digital-marketplace economics as Uber and are used for the primary premium/discount and implied-value work below.

**Extended Capital IQ default set (context only, excluded from the primary median):**

| Company | Ticker | Why excluded from the core median |
|---|---|---|
| Avis Budget Group, Inc. | NasdaqGS:CAR | Asset-heavy car-rental fleet owner — carries fleet-financing debt of $28.6bn against $1.5bn LTM EBITDA (18.6x net debt/EBITDA); a fundamentally different balance-sheet and capital-intensity model than Uber's asset-light marketplace [Company Comparable Analysis Uber Technologies Inc.xls, Financial Data & Business Description tabs, as-of 2026-08-06] |
| Hertz Global Holdings, Inc. | NasdaqGS:HTZ | Same asset-heavy car-rental model; net debt/EBITDA of 55.1x reflects fleet-financing leverage structurally incomparable to a marketplace operator [same source] |
| Daiwa Motor Transportation Co., Ltd. | TSE:9082 | Small (LTM revenue $126mm), single-city traditional taxi/real-estate conglomerate in Japan — not a digital marketplace [same source] |
| Taiwan Taxi Co., Ltd. | TPEX:2640 | Small (LTM revenue $99mm) traditional local taxi dispatch operator, not a platform marketplace [same source] |
| Chenqi Technology Limited | SEHK:9680 | Business-model-relevant (ride-hailing + Robotaxi in China) but extremely small (LTM revenue $783mm), early-stage/recently listed, and loss-making at every margin line — too immature for a reliable multiple read [same source] |
| Chariot Transit Inc. | Private, defunct | "Went out of business" per its own Capital IQ business description — a private, non-operating entity with no public multiples. Flagged per the partial-data rule, not guessed at; excluded entirely [Company Comparable Analysis Uber Technologies Inc.xls, Business Description tab] |

These six names remain in the extended CIQ default-comp-set summary statistics shown in §2 for transparency (Capital IQ's own vendor-computed median across all 10 names, including the mismatched ones), but the core 4-name median is the one used for the premium/discount read (§3) and implied value (§5), consistent with the Business-Type Method Map principle that a comparable must match the target's actual economics, not its surface industry label.

## 2. Peer Multiples & Operating Stats

All figures: Capital IQ export, `Company Comparable Analysis Uber Technologies Inc.xls` (Trading Multiples, Operating Statistics, Financial Data tabs), **data as of 2026-08-06**, currency USD, LTM = latest twelve months through each company's own most recent filing date shown. Uber's own multiples cross-checked against `Uber Technologies Inc NYSE UBER Financials.xls`, Multiples/Ratios tabs (close Aug-05-2026) — the two exports tie within rounding (e.g., TEV/LTM EBITDA 19.2x both places).

### LTM (trailing) — core marketplace peers + Uber

| Company | P/E (LTM) | EV/EBITDA (LTM) | EV/EBIT (LTM) | EV/Sales (LTM) | FCF Yield | Rev Growth (LTM YoY) | EBITDA Margin (LTM, GAAP-basis) | ROIC | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **Uber (UBER)** | 14.9x | 19.2x | 22.6x | 2.7x | 7.3%¹ | 16.7% | 13.5% | 10.6% (LTM)² | 1.19x | 2026-08-05/06 |
| Lyft (LYFT) | 2.3x³ | 144.1x⁴ | NM | 0.9x | 18.9%⁵ | 9.4% | -0.1% | Not disclosed | Net cash (n.m.) | 2026-08-06 |
| DoorDash (DASH) | 108.7x | 53.4x | 99.9x | 5.5x | ~1.2%⁶ | 33.6% | 9.5% | Not disclosed | Net cash (n.m.) | 2026-08-06 |
| DiDi Global (DIDI.Y) | NM | NM | NM | 0.3x | Not sourced | 10.0% | -1.6% | Not disclosed | Net cash (n.m.) | 2026-08-06 |
| Grab Holdings (GRAB) | 33.9x | 32.5x | 80.5x | 3.0x | Not sourced | 21.5% | 9.2% | Not disclosed | Net cash (n.m.) | 2026-08-06 |
| **Core peer median (4)** | 71.3x⁷ | 42.9x⁸ | 90.2x⁹ | 1.95x | n/a¹⁰ | 15.7% | 4.55% | n/a | n/a | — |
| **Core peer mean (4)** | 48.3x⁷ | 76.7x⁸ | 90.2x⁹ | 2.43x | n/a | 18.7% | 4.6% | n/a | n/a | — |

¹ Uber FCF yield = LTM FCF $10,116mm [`earnings/01_historical-financials.md`, §2] ÷ market cap $138,787.14mm [`01_price-and-capital-structure.md`, §3] = 7.29% — own calculation, not a CIQ-tabulated figure.
² Uber ROIC = CIQ "Return on Capital %," LTM = 10.59% [Financials.xls, Ratios tab]. `business-model/09_moat.md` flags this as a **recent peak** — the 3-year average (FY2023–FY2025) is 6.16%, below the ~8.1% WACC estimate; see §4 below.
³ Lyft's LTM net income margin (43.8%) is inconsistent with its negative EBITDA/EBIT for the same period and reads as a one-off non-operating item (e.g., a tax credit), not recurring earnings — `08_competitive-map.md` flags this; the 2.3x P/E is **not a clean earnings comparison** and is excluded from the core-peer P/E median.
⁴ Lyft's 144.1x EV/EBITDA is a near-zero-denominator artifact (LTM EBITDA is -$6.7mm, essentially breakeven) — economically not meaningful; included in the range for transparency but flagged.
⁵ Lyft FCF yield: Web-sourced as of 2026-07-16, unverified (financecharts.com) — "18.85%," described as an all-time-high TTM FCF period ($1.1bn). Not a data-pool figure; carries no vendor error-margin disclosure.
⁶ DoorDash FCF yield: derived, not a single sourced figure — FY2025 FCF ≈$1.1bn [Web: macrotrends.net, unverified, FY2025 annual] ÷ current LTM market cap $89,809.2mm [Capital IQ Comparable Analysis, 2026-08-06] ≈ 1.2%. **Basis mismatch flagged**: annual FY2025 FCF against a current-date market cap, not an LTM-to-LTM match — treat as directional only.
⁷ P/E core median/mean exclude Lyft's flagged 2.3x (see note 3); computed on DoorDash (108.7x) and Grab (33.9x) only — median = mean = (108.7+33.9)/2 = 71.3x with just two usable data points. DiDi is NM (loss-making).
⁸ EV/EBITDA core median/mean exclude DiDi (NM, negative EBITDA); Lyft's 144.1x is **included** in the mean (pulling it far above the median) but median is computed on all three usable values (32.5, 53.4, 144.1) = 53.4x — shown as 42.9x here is the median of the two non-distorted names (DoorDash 53.4x, Grab 32.5x) with Lyft's 144.1x excluded as an outlier artifact (note 4); the mean (76.7x) includes Lyft to show the full spread.
⁹ EV/EBIT core median/mean computed on DoorDash (99.9x) and Grab (80.5x) only; Lyft and DiDi are NM (negative EBIT).
¹⁰ FCF yield median not computed — DiDi and Grab data not sourced; only 2 of 4 core peers have any FCF figure, and one of those two carries a basis-mismatch flag (note 6).

**Reliability flag on LTM multiples:** three of the four core peers (Lyft, DiDi, and to a lesser extent Grab/DoorDash) run near-zero or negative LTM EBITDA/EBIT/EPS, which makes trailing P/E, EV/EBITDA, and EV/EBIT multiples for this peer set extreme, NM, or driven by tiny denominators rather than by genuine valuation differences. The **forward (NTM) basis below is materially more reliable** for this specific comp set and is used as the primary lens in §3–§5.

### NTM (forward) — core marketplace peers + Uber (Capital IQ consensus)

| Company | NTM EV/Revenue | NTM EV/EBITDA | NTM P/E | NTM EPS ($) | NTM Revenue ($mm) | NTM EBITDA ($mm) |
|---|---:|---:|---:|---:|---:|---:|
| **Uber (UBER)** | 2.41x | 11.89x | 16.22x | 4.20 | 62,191.9 | 12,589.0 |
| Lyft (LYFT) | 0.77x | 7.94x | 9.76x | 1.69 | 7,537.8 | 734.1 |
| DoorDash (DASH) | 4.50x | 20.78x | 31.61x | 6.56 | 19,513.8 | 4,224.5 |
| DiDi Global (DIDI.Y) | 0.30x | 16.58x | 28.08x | 0.12 | 38,123.8 | 686.0 |
| Grab Holdings (GRAB) | 2.40x | 12.26x | 24.65x | 0.15 | 4,671.7 | 913.1 |
| **Core peer median (4)** | 1.585x | 14.42x | 26.365x | — | — | — |

Source: `Company Comparable Analysis Uber Technologies Inc.xls`, Trading Multiples & Financial Data tabs, as-of 2026-08-06. Uber's own NTM figures cross-checked against `UberTechnologies,IncNYSEUBEREstimatesReport (1).xls`, Multiples tab (NTM TEV/REV 2.407x, TEV/EBITDA 11.89x, P/E 16.22x) — exact match.

### Extended Capital IQ default comp set (10 names, context/cross-check only — includes the mismatched-economics names from §1)

| Metric | High | Low | Mean | Median (all 9 with data) |
|---|---:|---:|---:|---:|
| LTM TEV/Revenue | 5.5x | 0.1x | 2.1x | 2.3x |
| LTM TEV/EBITDA | 144.1x | 9.4x | 44.2x | 32.5x |
| LTM TEV/EBIT | 99.9x | 12.0x | 57.4x | 64.0x |
| LTM P/Diluted EPS | 108.7x | 2.3x | 39.8x | 33.9x |
| LTM P/TangBV | 37.1x | 0.9x | 7.9x | 2.6x |
| NTM TEV/Revenue | 4.5x | 0.3x | 2.18x | 2.32x |
| NTM TEV/EBITDA | 63.83x | 7.94x | 26.85x | 18.68x |
| NTM P/E | 33.45x | 9.76x | 25.51x | 28.08x |

This is Capital IQ's own vendor-computed summary statistic block [Trading Multiples tab, "Summary Statistics" rows], not an eyeballed figure — but it mixes asset-light marketplaces with asset-heavy car-rental (Avis, Hertz) and small traditional-taxi operators (Daiwa, Taiwan Taxi), so it is shown for cross-check only and is **not** the basis for §3–§5 below.

## 3. Premium / Discount to Peer Median

Computed against the **core 4-name marketplace peer median** (§2). Positive = premium (Uber's multiple sits above the median, i.e., the market pays more per unit of that metric); negative = discount.

| Multiple | Basis | Company | Peer Median | Premium / (Discount) |
|---|---|---:|---:|---:|
| EV/Revenue | NTM | 2.41x | 1.585x | **+52.0%** (premium) |
| EV/EBITDA | NTM | 11.89x | 14.42x | **-17.5%** (discount) |
| P/E | NTM | 16.22x | 26.365x | **-38.5%** (discount) |
| EV/Revenue | LTM | 2.7x | 1.95x | +38.5% (premium) |
| EV/EBITDA | LTM (ex-Lyft outlier) | 19.2x | 42.9x | -55.2% (discount, low-reliability — see §2 flag) |
| EV/EBIT | LTM | 22.6x | 90.2x | -74.9% (discount, low-reliability — only 2 usable peer data points) |
| P/E | LTM (ex-Lyft, flagged) | 14.9x | 71.3x | -79.1% (discount, low-reliability — only 2 usable peer data points) |

**Revenue-multiple caveat:** EV/Revenue comparability across this specific peer set is weak — ride-hailing/delivery platforms recognize revenue on different gross-bookings-vs-net-take-rate conventions that this pool does not reconcile line-by-line, so a peer with a much lower take rate mechanically shows a lower EV/Revenue multiple without being "cheaper" in any economic sense. The EV/Revenue premium above is shown for completeness but is **not used** in the implied-value work in §5.

**Is the gap typical or unusual? Not assessable.** No peer-multiple time series exists in this data pool — only the current (2026-08-06) snapshot for each peer. `02_multiples-own-history.md` (Uber's own multiple history) is a separate question from the peer-relative gap history, and answering "is today's gap to peers wider/narrower than normal" requires knowing what each peer's own multiple was at prior points, which this pool does not provide. This is stated as a genuine gap, not assumed away.

## 4. Is the Gap Warranted?

The gap is mixed, not one-directional, and the evidence points toward the EV/EBITDA and P/E discounts being **too deep relative to what the fundamentals argue**, while a smaller, genuine discount is defensible. On the metrics that matter most for a scaled, profitable platform — margin and growth — Uber leads or matches this exact peer set: its LTM EBITDA margin (13.5%, GAAP-basis) is the highest of the four core peers (DoorDash 9.5%, Grab 9.2%, Lyft -0.1%, DiDi -1.6%) [§2], and its LTM revenue growth (16.7%) sits close to the core-peer median (15.7%) despite Uber's far larger base. Against that, `business-model/09_moat.md` finds **no moat proven on an economic basis** — Uber's 3-year average return on capital (6.16%, FY2023–FY2025) sits below its ~8.1% estimated cost of capital, and only the two most recent years clear that line, a pattern the moat agent explicitly labels a "recent peak," not a demonstrated through-cycle advantage. `business-model/07_business-quality.md` scores overall quality only 47/100 (Mixed/Average), with regulatory dependence (28/100) and competitive intensity (32/100) — both cited with the same Brazil/DiDi/Meituan incentive-spend evidence used in `08_competitive-map.md` — as the binding constraints, and flags Uber's AV bet ($10bn spread across six-plus unproven partners) as a Filter 5 fast-changing-industry risk (rate-of-change score 35/100) that caps how much durability credit any current margin lead deserves. Uber is also the only net-debt name among the four core peers (1.19x net debt/EBITDA vs. net cash at Lyft, DoorDash, DiDi, and Grab), a modest but real balance-sheet asymmetry. Netting these: the market's ~-17.5% NTM EV/EBITDA discount and ~-38.5% NTM P/E discount are larger than a fair reading of the quality gap supports, given Uber's margin leadership over this exact set — **the discount is too deep (relative upside)** on both metrics, but only to a modest degree once the moat/quality caveats are priced in (see the quality-adjusted multiples in §5, not the raw peer median).

## 5. Implied Value from Peer Multiples

All implied-value work uses `01`'s canonical net debt ($9,340mm), minority interest ($1,083mm), preferred ($0), and per-share fair-value share count (2,087.980mm, diluted weighted-average) — never CIQ's own Implied Valuation tab share count (2,042.56mm), which is shown only as a labeled cross-check below. Basis is matched throughout: NTM peer multiple × NTM company metric.

**Quality adjustment applied:** given the moat/quality caveats in §4 (no moat proven on a through-cycle ROIC-vs-WACC basis; business quality 47/100; Filter 5 fast-changing-industry flag on AV disintermediation risk; Uber alone carries net debt in this net-cash peer set), a haircut is applied to the raw core-peer median rather than using it unadjusted: **-10% on EV/EBITDA** (smaller haircut — margin and scale evidence are strong and directly comparable) and **-15% on P/E** (larger haircut — only 4 data points feed this median, EPS is the metric most sensitive to non-operating/tax noise even on a forward basis, and Uber carries more financial leverage than any core peer).

| Multiple | Applied Peer Multiple | Implied EV or Equity | Implied Price/Share | vs Current Price ($68.18) |
|---|---:|---:|---:|---:|
| NTM EV/EBITDA, quality-adjusted (13.0x = 14.42x peer median − 10%) | 13.0x | EV $163,657mm → Equity $153,234mm | **$73.39** | **+7.6%** |
| NTM EV/EBITDA, raw peer median (unadjusted) | 14.42x | EV $181,534mm → Equity $171,111mm | $81.95 | +20.2% |
| NTM P/E, quality-adjusted (22.4x = 26.365x peer median − 15%) | 22.4x | Equity value implicit (per-share metric) | $94.08 | +38.0% |
| NTM P/E, raw peer median (unadjusted) | 26.365x | Equity value implicit (per-share metric) | $110.73 | +62.4% |
| NTM EV/Revenue, peer median (context only — excluded, see §3 caveat) | 1.585x | EV $98,574mm → Equity $88,151mm | $42.22 | -38.1% |

**Base-case point: $73.39/share** — the NTM EV/EBITDA read at the quality-adjusted multiple (13.0x), because EV/EBITDA avoids the EPS-level tax/SBC noise flagged in `earnings/01_historical-financials.md` §4 and rests on four usable forward data points rather than two.

**Dispersion across usable methods (EV/EBITDA and P/E, adjusted and unadjusted): roughly $73–$111/share.** The EV/Revenue read ($42/share) is excluded from this dispersion, not because it is inconvenient, but because the take-rate/revenue-recognition mismatch across this peer set (§3) makes that specific comparison unreliable, not merely conservative.

**Cross-check — Capital IQ's own Implied Valuation tab** [`Company-Comparable-Analysis-Uber-Technologies-Inc__Implied-Valuation.txt`], built on the full 10-name extended set (§2) and CIQ's own 2,042.56mm share count, computes a mean-across-all-multiples implied price of $121.17/share and a median of $106.11/share — both well above this agent's core-4-peer, quality-adjusted figures, because the CIQ blend includes the mismatched-economics names' multiples (Avis, Hertz, Daiwa, Taiwan Taxi, Chenqi) and does not apply any quality haircut. This is shown as a labeled reference point, not adopted as a method.

## 6. Relative Read

Uber trades at a genuine discount to its closest same-business-model peers on forward earnings (-38.5% NTM P/E) and forward cash-margin (-17.5% NTM EV/EBITDA) multiples, even though it has the highest EBITDA margin and comparable revenue growth among the four-name core marketplace set (Lyft, DoorDash, DiDi, Grab). That gap is only partly warranted: `business-model/09_moat.md`'s own finding that Uber's return on capital has cleared its cost of capital for only two years (not a full cycle) and `07_business-quality.md`'s 47/100 mixed quality score with an unresolved AV-disintermediation risk (Filter 5) justify some discount, but not the full one priced in today. Applying a quality-adjusted peer multiple (13.0x NTM EV/EBITDA, a 10% haircut to the raw 14.42x peer median) implies a base-case value of **$73.39/share (+7.6% vs. the $68.18 current price)**, with a cross-method dispersion of roughly **$73–$111/share** once the P/E read (quality-adjusted and unadjusted) is included; the EV/Revenue-implied $42/share is excluded as unreliable given cross-company revenue-recognition differences in this peer set. No peer-multiple history exists in the pool, so whether today's gap is wider or narrower than Uber's typical relationship to these four names is **not assessable**.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — UBER

**Reporting standard:** US GAAP. **Currency:** USD millions unless per-share. **Fiscal year end:** December 31. **Source caveat (carried from `01_price-and-capital-structure.md` and the earnings/business-model modules):** no primary 10-K/10-Q sits in `data/UBER/`; every historical figure below is a Capital IQ vendor export (source-hierarchy tier 5), cited as "CIQ export," never as "10-K." The Q2 FY2026 earnings-call transcript (Aug-05-2026) is a primary call record.

**Business-Type Gate.** `00_valuation-data-triage.md` and `business-model/02_business-identity.md`/`03_segment-map.md` classify Uber as a two-sided, take-rate marketplace (Mobility / Delivery / Freight) — an **Operating** company under the Business-Type Method Map. This report proceeds with a standard **FCFF DCF**. Freight (≈10% of FY2025 revenue) is industrial-cycle exposed, but at that weight it does not push the whole company into the Commodity/Cyclical row of the Method Map; its soft-cycle history (negative-to-breakeven EBITDA in 5 of the last 6 years) is folded into the margin path as a bounded drag, not treated as a separate cyclicality-gate exercise.

**Anchors reused verbatim from `01_price-and-capital-structure.md`:** current price $68.18 (Aug-05-2026 close, pool-verified); net debt (strict) $9,340mm; minority interest $1,083mm; preferred $0; diluted shares (per-share fair-value count) 2,087.980mm (LTM weighted-average diluted — labeled limitation, not a bottom-up TSM/if-converted rebuild).

## 1. FCF Base & Normalizations

**Base year: FY2025** (Dec-31-2025, the latest full audited-filing-equivalent year in the pool; a Jun-30-2026 LTM column also exists but FY2025 is used as the clean, non-partial-year DCF anchor).

| Item | Base-Year Value (FY2025) | Normalization Applied | Source |
|---|---:|---|---|
| Reported FCF (CFO − total capex) | $9,763mm | None — `earnings/06_earnings-quality.md` §1 confirms no one-off inflation of this figure; shown here as the clean historical reference point, not the DCF's forward-build base | `earnings/01_historical-financials.md` §1; CIQ export, Cash Flow tab |
| EBIT (GAAP operating income) | $5,565mm | None | CIQ export, Income Statement tab |
| Effective tax rate used for NOPAT | **24%** (normalized) vs. GAAP reported rate "NM" (a net tax *benefit* of −$4,346mm) | Strips out the one-off, non-cash deferred-tax valuation-allowance release ($4,346mm FY2025, $5,758mm FY2024) that inflated GAAP net income/EPS — **this rate reconciles to `business-model/09_moat.md` §3's published canonical normalized rate (24%, "approximating combined US federal + state statutory rates"); no divergence between the moat ROIC test and this DCF's NOPAT tax rate.** | `business-model/09_moat.md` §3; `earnings/06_earnings-quality.md` §4, §8 |
| NOPAT (normalized) | $5,565mm × (1−0.24) = **$4,229mm** | Uses the normalized 24% rate, not the GAAP reported rate | Calc. |
| Stock-based compensation (SBC) | $1,826mm (~3.5% of revenue) | **Not added back** in this DCF's FCFF build — SBC is treated as a real, dilutive economic cost embedded in EBIT, not a non-cash addback the way the cash-flow statement treats it. This is the single largest driver of the gap between the DCF's normalized FCFF base and the reported CFO-based FCF above (see bridge below) and is a deliberately conservative choice for a per-share valuation, consistent with CLAUDE.md §15 hygiene (adjustments shown, not netted silently). | `earnings/06_earnings-quality.md` §4 (SBC add-back to Adj. EBITDA) |
| Working-capital driver used | DSO 25.1 days / DPO 10.7 days (FY2025); DIO not applicable (no inventory) | A trade-AR/AP proxy (`NWC_trade = DSO/365 × Revenue − DPO/365 × COGS`) scaled to forecast revenue/COGS, per the module's revenue-linked working-capital rule. This is **narrower** than the full negative-working-capital dynamic `earnings/06_earnings-quality.md` §2 documents (Uber's Accrued Expenses to drivers/merchants growing faster than revenue funds a broader cash-conversion benefit that Capital IQ's own DPO line — Accounts Payable only — does not capture) — flagged explicitly as a **conservative simplification** that likely understates true forward FCF generation on this dimension. | `earnings/06_earnings-quality.md` §3 |
| D&A (% of revenue) | $719mm (1.38% of revenue) | Held flat forward (~1.35%) — historical trend is stable | CIQ export, Income Statement tab |
| Capex (% of revenue) | $336mm (0.65% of revenue) | Held flat forward (~0.6%) — asset-light, no capex guidance since FY2020 | CIQ export, Cash Flow tab; `earnings/04_guidance-consensus.md` §2 |
| **Normalized FY2025 FCFF (NOPAT + D&A − Capex − ΔNWC_trade)** | **$4,526mm** | Bridges from the $9,763mm reported CFO-based FCF primarily via (a) the SBC non-add-back (−$1,826mm) and (b) the swap from the full disclosed FY2025 working-capital cash *source* of $906mm (per `earnings/06_earnings-quality.md` §1) to this narrower trade-based ΔNWC of only $86mm (a ~$1.0bn swing); the remainder of the ~$5.2bn total gap reflects smaller reconciling items (net interest income embedded in CFO via net income; actual cash taxes paid of $345mm vs. the theoretical 24%-of-EBIT tax charge) that this pool's data cannot decompose to full precision (no note-level detail on "Other Operating Activities"). This is the **DCF's forecast base**, not a restatement of the historical FCF figure. | Calc., this agent |

**FCFF identity used (Economic Consistency Gate 1):** `FCFF = NOPAT + D&A − Capex − ΔNWC` (income-statement/balance-sheet build), used **instead of** `CFO − capex` for the forward forecast because a forward cash-flow statement cannot be projected line-by-line from consensus data, and because treating SBC as a real cost (not adding it back) is the more conservative basis for a fully-diluted per-share value. This is a definitional choice, stated once and used consistently — not mixed with the CFO-based definition anywhere in the forecast.

## 2. Forecast Assumptions

Explicit horizon: **FY2026–FY2031 (6 years)**. Terminal starts FY2032.

| Assumption | FY26 | FY27 | FY28 | FY29 | FY30 | FY31 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 11.2% | 15.8% | 13.8% | 10.4% | 10.4% | 7.9% | 4.0% | **Consensus** (Capital IQ Estimates Report, Consensus tab, Company Level, FY2026–FY2031; estimate coverage 47/52 → 9/9 analysts). **FY2027–FY2028's step-up is flagged**: it likely embeds partial/full-year consolidation of the pending Delivery Hero acquisition (deal announced, not yet closed — `business-model/03_segment-map.md` §3), a real forecast risk if the deal timeline slips. Terminal g = **analyst assumption**, ≈ US long-run nominal GDP proxy (rf 4.6% less a margin), not company-guided |
| EBIT margin % | 13.5% | 14.5% | 15.2% | 15.6% | 15.9% | 16.0% | 16.0% (plateau) | **Analyst assumption**, deliberately **moderated below** the raw consensus-implied Adj. EBITDA trajectory (which would imply EBIT margin near 19% by FY2031 backing out D&A/SBC/other add-backs at a shrinking ratio). The plateau — not continued expansion — reflects `business-model/09_moat.md`'s "No moat proven" verdict and its own explicit caution: "a buyer should not extrapolate the current 9–11% return on capital as the steady-state level." LTM actual EBIT margin = 12.1% |
| Tax rate % | 24% | 24% | 24% | 24% | 24% | 24% | 24% | **Normalized**, reconciled to `business-model/09_moat.md` §3's canonical rate (§1 above) |
| Capex (% of revenue) | 0.6% | 0.6% | 0.6% | 0.6% | 0.6% | 0.6% | 0.6% | **Analyst assumption**, matches the FY2021–FY2025 historical average (all years <1% of revenue); no company capex guidance since FY2020 |
| Δ Working capital (days-based: DSO 25.1d / DPO 10.7d on forecast revenue/COGS) | $295mm use | $465mm use | $469mm use | $404mm use | $445mm use | $370mm use | scales with revenue at g | **Days-of-sales basis from `earnings/06_earnings-quality.md` §3**, held at FY2025 levels (DSO/DPO not projected to drift further, a conservative flat assumption given both have been *improving* historically) |

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.6% | Web: 10-year US Treasury yield, Aug-05/06-2026 (indicative, dated) — matches the rate `business-model/09_moat.md` §3 also used |
| Equity-risk premium | 5.0% | Inference, not from filings — standard long-run US ERP assumption, matching `business-model/09_moat.md` §3's assumption for clean cross-module reconciliation. (Cross-check: Damodaran's contemporaneous implied ERP, Jan-2026 update, ≈4.2–4.3% — Web-sourced, dated — i.e. the 5.0% figure used here is, if anything, conservative/higher, not aggressive.) |
| Beta | 1.15 | Capital IQ 5-Year Beta — Company Comparable Analysis Uber Technologies Inc.xls, Operating Statistics tab, As-Of 2026-08-06 (same source `09_moat.md` cites) |
| Cost of equity (CAPM: `k_e = rf + β×ERP`) | 4.6% + 1.15×5.0% = **10.35%** | Calc. |
| Pre-tax cost of debt | Interest expense (LTM) $462mm ÷ Total debt (LTM) $14,731mm = **3.14%** | `earnings/03_margin-drivers.md` §3 (interest expense); `01_price-and-capital-structure.md` §4 (total debt) |
| After-tax cost of debt | 3.14% × (1−0.24) = **2.39%** | Calc., using the same normalized 24% tax rate as NOPAT |
| Equity / debt weights (**market-value**) | Equity 90.4% ($138,787mm) / Debt 9.6% ($14,731mm) | `01_price-and-capital-structure.md` §3–§4 (market cap and total debt) |
| **WACC** | **`0.904×10.35% + 0.096×2.39%` = 9.59%** | Calc. — see executed snippet below |

**Formula (pinned):** `WACC = w_e·k_e + w_d·k_d·(1−t)`. No preferred equity exists (`01`, §4), so no `w_p·k_p` term. Weights are **market-value** weights (equity at the $138,787mm market cap, debt at the $14,731mm book value used as the market-value proxy for debt, standard practice absent quoted bond prices) and sum to 1.

**Sanity bounds (Economic Consistency Gate 4).** `after-tax k_d (2.39%) ≤ WACC (9.59%) < k_e (10.35%)` — **holds**. Cost of equity check for a US mega-cap: `rf + 1.4×ERP` = 4.6% + 7.0% = 11.6%; the CAPM `k_e` of 10.35% (β=1.15) sits below this ceiling, so no beta-override justification is required.

**Cross-check against `business-model/09_moat.md`'s inferred cost of capital.** The moat module computed **WACC ≈ 8.1%**, using the **same** rf, ERP, and beta but **book-value** capital weights (Debt 30.5% / Equity+Minority 69.5% off the FY2025 balance sheet, versus this report's market-value weights of Debt 9.6% / Equity 90.4% off the current $138.8bn market cap). The 1.49pp gap (9.59% vs. 8.1%) is **under** the 2pp threshold that would require a dual-WACC sensitivity grid per MODULE_RULES Gate 4, but given the closeness of the two figures the §7 sensitivity grid's `WACC−1%` column (8.59%) already sits close to the moat module's 8.1% estimate, so both readings are effectively spanned. No override of the mechanically-computed WACC is applied — the 9.59% figure is used as computed.

**Executed snippet — WACC blend:**
```
python3:
rf=0.046; erp=0.05; beta=1.15; tax=0.24
ke = rf + beta*erp                      # 0.1035
mktcap=138787.14; total_debt=14731.0
we = mktcap/(mktcap+total_debt)         # 0.904044
wd = total_debt/(mktcap+total_debt)     # 0.095956
kd_pretax = 462.0/14731.0               # 0.031362
kd_aftertax = kd_pretax*(1-tax)         # 0.023835
wacc = we*ke + wd*kd_aftertax           # 0.0958557...

Output:
Cost of equity (ke): 0.1035
we, wd: 0.9040439129864393 0.09595608701356073
kd_pretax, kd_aftertax: 0.03136243296449664 0.023835449053017446
WACC: 0.0958557014174351
after-tax kd <= WACC < ke ? True
```

## 4. Free Cash Flow Forecast & Discounting

**Discounting convention: mid-year** (t−0.5) — cash flows are assumed to arrive evenly through each year, not as a single year-end lump sum; this avoids systematically understating value.

| Year | Revenue | EBIT | NOPAT | Capex | ΔNWC | FCFF | Discount Factor (t−0.5) | PV of FCFF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 57,830 | 7,807 | 5,933 | 347 | 295 | 6,072 | 0.9553 (t=0.5) | 5,800 |
| FY2027 | 66,985 | 9,713 | 7,382 | 402 | 465 | 7,420 | 0.8717 (t=1.5) | 6,468 |
| FY2028 | 76,228 | 11,587 | 8,806 | 457 | 469 | 8,909 | 0.7955 (t=2.5) | 7,087 |
| FY2029 | 84,184 | 13,133 | 9,981 | 505 | 404 | 10,209 | 0.7259 (t=3.5) | 7,411 |
| FY2030 | 92,947 | 14,779 | 11,232 | 558 | 445 | 11,484 | 0.6624 (t=4.5) | 7,607 |
| FY2031 | 100,247 | 16,039 | 12,190 | 601 | 370 | 12,571 | 0.6044 (t=5.5) | 7,599 |

D&A (not shown as its own column) is embedded in the FCFF calc: FCFF = NOPAT + D&A − Capex − ΔNWC, with D&A ≈1.35% of revenue each year (FY2026 $781mm → FY2031 $1,353mm).

**Working-capital sign check.** Uber's trade-based NWC (`DSO/365 × Revenue − DPO/365 × COGS`) is small and **positive** at every point (FY2025: $2,639mm), and it **grows** as revenue grows (DSO > DPO in dollar terms once COGS's lower base is applied) — so `ΔNWC` is a **use** of cash every explicit year ($295mm–$469mm), correctly **subtracted** from FCFF. This is not a negative-working-capital business on this narrow AR/AP measure (confirmed: cash-conversion-cycle in `earnings/06_earnings-quality.md` §3 is positive, 14.5 days FY2025, not negative) — no sign-inversion risk applies here, though as noted in §1 the broader accrued-payables dynamic (outside this proxy) likely understates true cash generation, making this a conservative treatment.

**Sum of PV of explicit FCFFs: $41,971mm.**

**Executed snippet — PV of explicit FCFF, terminal value, and EV → equity → per-share bridge:**
```
python3:
fcff = {2026:6072.0,2027:7420.0,2028:8909.0,2029:10209.0,2030:11484.0,2031:12571.0}
wacc = 0.0958557014174351; g = 0.04
for i,y in enumerate(sorted(fcff), start=1):
    t = i - 0.5
    df = 1/((1+wacc)**t)
    print(y, "t=",t, "DF=",round(df,4), "PV=",round(fcff[y]*df,1))
sum_pv_fcff = sum(fcff[y]/((1+wacc)**(i-0.5)) for i,y in enumerate(sorted(fcff),start=1))
tv_undisc = fcff[2031]*(1+g)/(wacc-g)
pv_tv = tv_undisc/((1+wacc)**5.5)
ev = sum_pv_fcff + pv_tv
equity = ev - 9340.0 - 1083.0        # net debt, minority (01's canonical figures)
per_share = equity/2087.980           # diluted share count (01's canonical figure)

Output:
2026 t= 0.5  DF= 0.9553  PV= 5800.4
2027 t= 1.5  DF= 0.8717  PV= 6468.1
2028 t= 2.5  DF= 0.7955  PV= 7086.7
2029 t= 3.5  DF= 0.7259  PV= 7410.5
2030 t= 4.5  DF= 0.6624  PV= 7606.8
2031 t= 5.5  DF= 0.6044  PV= 7598.5
Sum PV of explicit FCFF: 41970.9
TV (undiscounted, end of FY2031): 234064.6
Discount factor for TV (t=5.5): 0.6044
PV of TV: 141479.0
Enterprise value (DCF): 183450.0
TV % of EV: 77.12 %
Equity value: 173027.0
Per-share intrinsic value: 82.87
vs price 68.18 => upside 21.5%
```

## 5. Terminal Value

**Method: Gordon growth.** `TV = FCFF_2032 / (WACC − g) = FCFF_2031 × (1+g) / (WACC − g) = 12,571 × 1.04 / (0.0959 − 0.04) = $234,065mm` (undiscounted, valued as of end-FY2031). `WACC − g = 5.59pp` — comfortably positive, well clear of the near-zero danger zone.

- **Terminal value (undiscounted):** $234,065mm
- **PV of terminal value** (discounted at t=5.5, mid-year-consistent): **$141,479mm**
- **Terminal value as % of total EV: 77.1%** → **exceeds the 75% threshold — flagged terminal-dominated, low-confidence** (Economic Consistency Gate 5). Per the hard rule, a second lens is added below.

**Second lens — exit-multiple cross-check (Gate 5 requirement).** The Gordon TV implies an exit multiple of `TV_undiscounted / FY2031 Adj. EBITDA ($24,743mm consensus) = 9.46x` forward EV/EBITDA on the terminal metric. For context, Uber trades at **11.89x NTM EV/EBITDA today**, and the *current price itself* implies only a **6.05x FY2031 EV/EBITDA multiple** (Capital IQ Estimates Report, Multiples tab, "FY 2031" column, based-on-market-price). This DCF's terminal multiple (9.46x) sits **between** those two anchors — below today's growth multiple (sensible, since growth has decayed to ~4% by then) but **above** what today's price already implies for that same forward year, which is internally consistent with this DCF's base case landing above the current price (§6). The cross-check does not flag the terminal assumption as obviously inflated, but it does show the DCF is pricing a more generous mature-state multiple than the market currently assigns to FY2031.

**Financeable-growth cross-check (Economic Consistency Gate 2) — flagged, not clean.** Terminal-year (FY2031) reinvestment: `Capex − D&A + ΔNWC = 601 − 1,353 + 370 = −$382mm` (net **dis**investment — D&A alone exceeds capex plus the working-capital build). Reinvestment rate = −382/12,190 (NOPAT) = **−3.1%**. Implied growth = ROIC × reinvestment rate ≈ 9.4%(FY2025 ROIC) × −3.1% ≈ **−0.3%**, or ≈ **−0.3%** at the LTM ROIC (10.6%) too — **far below** both the modeled explicit-period growth (7.9–15.8%) and the terminal `g` of 4.0% (a gap far exceeding the ~1.5pp trigger). **This is flagged as a known artifact of applying a capex-based reinvestment formula to an asset-light platform**: Uber's real "growth capital" flows overwhelmingly through opex (SG&A/R&D, expensed not capitalized) and through investing activities *outside* capex — LTM total investing cash outflow was $7,723mm against capex of just $308mm, a >25x gap (`earnings/03_margin-drivers.md` §9), driven by AV equity stakes and the Delivery Hero share purchases. This is a **real, partially-quantified** bridge (the investing-outflow evidence), but it is **not** precise enough to close the −0.3% vs. +4.0% gap to the ~1.5pp tolerance. Per the hard rule, **intrinsic confidence is capped** (already capped by the >75% terminal-dominance flag above) **and a supplementary sensitivity grid at the mechanically-implied "financeable" growth rate is shown** (§7) rather than asserting the 4.0% base case is unconditionally safe.

**"No moat proven" terminal-scaling trigger (CLAUDE.md §24 Filter 5 / avoid-ruin).** `business-model/09_moat.md` §5 returns **"No moat proven"** (3-year average ROIC 6.2% below the ~8.1% WACC it computed; only the two most recent years clear that bar) — an *unproven, not necessarily decaying*, franchise. Per the hard rule, the **base** terminal therefore carries **no perpetual excess-return premium**: the EBIT margin path is **plateaued at 16.0%** from FY2031 onward (not extrapolated further upward, as raw consensus arithmetic would imply — see §2), and terminal `g` (4.0%) sits at a nominal-GDP-proxy level with no moat premium baked in. This is a fade, not a decline — the base case still assumes Uber *holds* its recently-improved (but "early-stage, not yet fully proven," per the moat module) margin level rather than either compounding it further or losing it.

**Structural-decline / runoff terminal (separate trigger — `business-model/07_business-quality.md` rate-of-change score = 35/100, ≤ the ~40 threshold).** Because the rate-of-change/disruption score is this low (management itself frames the AV transition as unresolved, spreading ~$10bn across 6+ unproven partners "so that we're not dependent on one partner"), a **declining-perpetuity / runoff terminal** is built alongside the base, on the SAME nominal basis:

| Runoff assumption | Value | Basis |
|---|---:|---|
| Terminal `g` (nominal) | **−2.0%** | Below current US inflation (~2.5–3%) — a genuine negative real *and* nominal trajectory, reflecting a structural reset (e.g., a major-market driver-reclassification ruling, or AV disintermediation) rather than the base case's steady state |
| Terminal EBIT margin (faded, non-recovering) | 8.0% (vs. base-case plateau of 16.0%; LTM actual 12.1%) | A structural-impairment assumption — cost structure re-regulated / take-rate compressed with no recovery, not a cyclical dip |
| Terminal FCFF (on FY2031 revenue base $100,247mm) | $6,847mm | NOPAT ($100,247×8%×0.76=$6,095mm) + D&A ($1,353mm) − Capex ($601mm) − ΔNWC (≈0, revenue no longer growing) |
| TV (undiscounted) | $57,916mm | `6,847×0.98/(0.0959−(−0.02))` |
| PV of TV | $35,007mm | Discounted at t=5.5, same WACC |
| **Resulting EV / equity / per-share** (keeping the same explicit-period PV of $41,971mm — only the terminal differs) | EV $76,978mm → Equity $66,555mm → **$31.88/share** | Calc. |

**This runoff terminal is explicitly NOT the base case.** It is the structural-reset **bear input** that feeds `07_scenario-and-fair-value`'s structural-reset bear case and the master synthesizer's Kill Criteria (CLAUDE.md §24) — it sits beside the base-case intrinsic value below, it does not replace it.

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFFs | $41,971mm |
| + PV of terminal value (Gordon, g=4.0%) | $141,479mm |
| **= Enterprise value** | **$183,450mm** |
| − Net debt (strict, `01`'s canonical figure) | $9,340mm |
| − Minority interest | $1,083mm |
| − Preferred | $0mm |
| **= Equity value** | **$173,027mm** |
| ÷ Diluted shares (`01`'s per-share fair-value count) | 2,087.980mm |
| **= Intrinsic value per share (base case)** | **$82.87** |
| vs current price ($68.18, Aug-05-2026 close, pool-verified) | +$14.69 (+21.5%) |

*(Memo — structural-reset runoff terminal, not the base: $31.88/share, −53.3% vs. the base case, feeding `07`'s bear input only.)*

## 7. Sensitivity Grid (per-share intrinsic value)

WACC across columns, terminal growth down rows. Base case = WACC 9.59%, g 4.0%.

| | WACC −1% (8.59%) | WACC (9.59%) | WACC +1% (10.59%) |
|---|---:|---:|---:|
| g +0.5% (4.5%) | $113.60 | $89.89 | $73.99 |
| g (4.0%) | $102.50 | **$82.87** | $69.21 |
| g −0.5% (3.5%) | $93.59 | $77.00 | $65.11 |

No cell in this grid has `WACC − g` within ~1–2pp of zero (the tightest gap, top-right corner, is still 6.09pp), so every cell above is a valid, non-NM number.

**Supplementary grid — financeable-growth cross-check (Gate 2 remedy, g = 2.0%):**

| | WACC −1% (8.59%) | WACC (9.59%) | WACC +1% (10.59%) |
|---|---:|---:|---:|
| g = 2.0% | $74.98 | $64.04 | $55.67 |

This is shown because the mechanical Gate-2 check (§5) implies a "financeable" terminal growth rate far below the base case's 4.0% and the bridge for the gap (asset-light, opex/investing-funded growth) is only partially quantified. A reader should treat $64–$75/share (at WACC≈9.6%) as the more conservative anchor if the market ever re-prices Uber's terminal growth down toward what a narrow, capex-based reinvestment rate can literally finance.

## 8. Intrinsic Read

The DCF's base-case intrinsic value is **$82.87/share** — 21.5% above the $68.18 pool-verified price (Aug-05-2026 close) — but the primary sensitivity grid disperses that point across **$65.11–$113.60** (WACC ±1pp, g ±0.5pp), and the terminal value itself makes up 77% of enterprise value, which is the single most fragile part of this number: this is fundamentally a bet on what Uber's margin and growth look like in 2032 and beyond, not on the next six years of consensus-anchored cash flow (whose PV, $41,971mm, is only 23% of the total). The assumption this value is most sensitive to is the combination of **terminal growth and the durability of the current margin plateau** — the Gate-2 financeable-growth check (§5) implies a far more conservative $64–$75/share range if Uber's real reinvestment needs (capital-light but opex/M&A-funded) turn out to demand a lower sustainable growth rate than the 4.0% base case assumes, and `business-model/09_moat.md`'s "No moat proven" / early-stage-widening verdict means the 16% terminal EBIT margin plateau (versus 12.1% LTM) is itself an unproven assumption, not a settled one. The separately-shown structural-reset runoff terminal ($31.88/share) is the tail the rate-of-change score (35/100) makes non-trivial, though it is a bear input for `07`, not part of this base read.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — UBER

**Reporting standard:** US GAAP. **Currency:** USD millions unless per-share. **Source caveat (carried from `01` and `04`):** no primary 10-K/10-Q sits in `data/UBER/`; every historical figure is a Capital IQ vendor export (source-hierarchy tier 5), cited as "CIQ export." This report inverts the SAME model `04_intrinsic-dcf.md` built — it reuses `04`'s discount rate (WACC), normalized free cash flow (FCF, cash a business generates after the spending needed to keep running) base, terminal growth rate, forecast horizon, and discounting convention verbatim, per the Reconciliation Gate 9 hard rule. No values here are independently re-derived.

**Price-state check.** `01_price-and-capital-structure.md` tags the current price ($68.18, Aug-05-2026 close) **pool-verified** — corroborated across three independent Capital IQ exports and 1 trading day old at run date. This clears the partial-data gate: the reverse DCF can run.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $68.18 (Aug-05-2026 close) | `01_price-and-capital-structure.md` §1 — pool-verified |
| Enterprise value (EV, the value of the whole business — equity plus debt, minus cash) | $149,210.14mm | `01_price-and-capital-structure.md` §4 |
| Net debt (strict basis) | $9,340mm | `01_price-and-capital-structure.md` §5 |
| Minority interest | $1,083mm | `01_price-and-capital-structure.md` §4 |
| Diluted shares (per-share fair-value count) | 2,087.980mm | `01_price-and-capital-structure.md` §2 |
| Normalized FY2025 FCFF base (free cash flow to the firm — cash left after tax, reinvestment, and working-capital needs, before paying lenders or shareholders) — **`04`'s canonical figure, reused verbatim** | $4,526mm | `04_intrinsic-dcf.md` §1 (NOPAT + D&A − Capex − ΔNWC; SBC not added back — see `04` for the full bridge) |
| Discount rate (WACC — the blended return the business must clear on its capital, weighting equity and debt by market value) — **`04`'s canonical figure, reused verbatim** | 9.5857% (9.59%) | `04_intrinsic-dcf.md` §3 (CAPM cost of equity 10.35% at β=1.15, after-tax cost of debt 2.39%, market-value weights 90.4% equity / 9.6% debt) |
| Terminal growth rate (g) — **`04`'s canonical figure, reused verbatim** | 4.0% (nominal, ≈ US long-run GDP proxy) | `04_intrinsic-dcf.md` §5 |
| Forecast horizon — **`04`'s canonical horizon, reused verbatim** | 6 years (FY2026–FY2031); terminal starts FY2032 | `04_intrinsic-dcf.md` §2 |
| Discounting convention — **`04`'s canonical convention, reused verbatim** | Mid-year (cash flows assumed to land evenly through the year, discounted at t−0.5, not at year-end) | `04_intrinsic-dcf.md` §4 |
| `04`'s own base-case per-share intrinsic value (for context, not an input to this solve) | $82.87 (+21.5% vs. price) | `04_intrinsic-dcf.md` §6 |
| `04`'s terminal-value share of its EV | 77.1% (exceeds the 75% terminal-dominance threshold — flagged low-confidence in `04`; also exceeds this agent's own 60% threshold for a mandatory terminal-`g` sensitivity, applied in §4 below) | `04_intrinsic-dcf.md` §5 |

## 2. Implied Expectations

**What is held fixed:** the WACC (9.5857%), the terminal growth rate (4.0%), the 6-year explicit horizon, the mid-year discounting convention, and the normalized FY2025 FCFF base ($4,526mm) — all taken verbatim from `04`. **What is solved for:** the uniform annual FCFF growth rate applied to that base over FY2026–FY2031 (compounding into the same Gordon-growth terminal value at g=4.0%) that makes the present value of the cash-flow stream equal today's enterprise value ($149,210.14mm). This is a nonlinear root-find, executed with `scipy.optimize.brentq`, not estimated by hand.

**Executed solver — primary solve:**
```
python3 (scipy.optimize.brentq):
wacc = 0.0958557014174351; term_g = 0.04; base_fcff = 4526.0; target_ev = 149210.14; horizon = 6

def ev_at_g(g):
    pv = sum(base_fcff*(1+g)**t / (1+wacc)**(t-0.5) for t in range(1, horizon+1))
    fcff_n = base_fcff*(1+g)**horizon
    tv = fcff_n*(1+term_g)/(wacc-term_g)
    return pv + tv/(1+wacc)**(horizon-0.5)

g_solution = brentq(lambda g: ev_at_g(g)-target_ev, -0.5, 2.0)
# Output: g_solution = 0.14667862754183858 ; ev_at_g(g_solution) = 149210.14 (ties to target)
```

| What the Price Implies | Solved Value | What was held fixed |
|---|---:|---|
| Implied FCF (FCFF) CAGR over FY2026–FY2031 | **14.7%** | WACC 9.59%, terminal g 4.0%, 6-yr horizon, FCFF base $4,526mm, mid-year convention |
| Implied years of above-GDP-growth (two-stage fade model) | **~4.3 years** at `04`'s own consensus-anchored 18.6% FCFF CAGR, then an immediate step-down to the 4.0% terminal perpetuity | WACC, terminal g, FCFF base as above; explicit growth rate fixed at `04`'s own base-case FCFF CAGR (18.56%, FY2025→FY2031 in `04`'s model) rather than re-derived; solved for N years of that pace |
| Implied steady-state EBIT margin (holding the consensus revenue path fixed) | **12.8%** | WACC, terminal g, tax rate (24%), D&A (1.35% of revenue), capex (0.6% of revenue), ΔNWC schedule, and `04`'s consensus revenue path (FY2026 $57,830mm → FY2031 $100,247mm) all fixed at `04`'s values; the EBIT margin (uniform across FY2026–FY2031, replacing `04`'s ramping 13.5%→16.0% path) is solved for |

**Executed solver — implied steady-state margin:**
```
python3 (scipy.optimize.brentq):
revenue = {2026:57830,2027:66985,2028:76228,2029:84184,2030:92947,2031:100247}  # 04's consensus path, fixed
dnwc = {2026:295,2027:465,2028:469,2029:404,2030:445,2031:370}                  # 04's schedule, fixed
tax=0.24; wacc=0.0958557014174351; term_g=0.04

def ev_at_margin(margin):
    fcff = {}
    for y in revenue:
        nopat = revenue[y]*margin*(1-tax); da = 0.0135*revenue[y]; capex = 0.006*revenue[y]
        fcff[y] = nopat + da - capex - dnwc[y]
    pv = sum(fcff[y]/(1+wacc)**(i-0.5) for i,y in enumerate(sorted(fcff),1))
    tv = fcff[2031]*(1+term_g)/(wacc-term_g)
    return pv + tv/(1+wacc)**5.5

m = brentq(lambda m: ev_at_margin(m)-149210.14, 0.01, 0.5)
# Output: m = 0.12761783908473281 -> 12.76%, EV check ties to 149,210.14
```

The years-of-above-GDP-growth fade model uses a continuous root-find (full years at `04`'s 18.56% consensus FCFF pace, mid-year discounted, then an immediate perpetuity at the 4.0% terminal g); solved N = 4.32 years (`scipy.optimize.brentq` over the interval [3.5, 5.5], with fractional-year interpolation for the stub period).

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCFF CAGR = 14.7% (FY26–31) | Revenue CAGR FY2023–FY2025 = 18.1%; Adj. EBITDA (company-defined non-GAAP measure that adds back stock-based compensation and other items) CAGR FY2023–FY2025 = 46.8% (off a small base, decelerating: +105% FY24 → +42% FY25 → +18.5% LTM); most recent two quarters show revenue growth decelerating to +14.5% then +12.2% YoY [`earnings/01_historical-financials.md` §1, §3] | `04`'s own base case — anchored on Capital IQ consensus (47–52 analysts) — implies an **18.6% FCFF CAGR** over the identical horizon, i.e. the Street's own numbers assume MORE growth than the price requires [`04_intrinsic-dcf.md` §4, §8] | **Yes** — the price bar sits below both recent realized growth and consensus |
| Implied steady-state EBIT margin = 12.8% (on the consensus revenue path) | LTM actual EBIT margin = 12.1%; FY2025 = 10.7%; margin has expanded every year since FY2022 (-5.75% → 10.70%) [`earnings/01_historical-financials.md` §1] | `04`'s own base case plateaus the terminal EBIT margin at **16.0%** — a further ~320bps above what the price requires; `business-model/09_moat.md` flags the current margin level as a "recent peak," not a proven steady state, but even that caution only threatens the 16.0% assumption, not the much lower 12.8% bar priced in here | **Yes, and by a wide margin** — the price needs only ~65bps of further margin gain from the LTM level, not the ~390bps `04`'s base case assumes |
| Implied ~4.3 years of consensus-pace (18.6%) growth before fading to 4.0% | N/A (a modeling construct, not a historical series) | `04`'s explicit forecast holds a growth path consistent with ~18.6% FCFF CAGR for the FULL 6-year horizon; the price only requires ~4.3 of those 6 years at that pace | **Yes** — the price requires less duration of high growth than `04`'s own base case assumes, not more |

Uber's own recent trend argues these are conservative bars, not aggressive ones: revenue growth is decelerating (18.3% FY2025 → 12.2% latest quarter) but Adjusted EBITDA margin has expanded every single quarter for at least two years (15.11% → 19.86%, FQ3'24→FQ2'26) [`earnings/01_historical-financials.md` §3], and the earnings-sensitivity module's own bull/bear ranges (SG&A leverage ±$780mm, bookings-growth proxy ±$581mm, insurance-cost line ±$520mm on an $8,730mm FY2025 Adjusted EBITDA base) [`earnings/07_earnings-sensitivity.md` §2] bracket a swing wide enough to comfortably span the modest FCFF-growth and margin bars solved above. The single caveat: the SG&A-leverage tailwind — the largest quantified lever — has already started reversing in the LTM period (ratio ticked up 63bps off its FY2025 low) [`earnings/07_earnings-sensitivity.md` §3], so "achievable" here does not mean "assured."

**Market-ceiling sanity check.** Converting the 14.7% implied FCFF CAGR to a revenue trajectory (holding `04`'s margin/FCF-conversion ratios fixed, since FCFF, D&A, capex and ΔNWC all scale with revenue in that model, the ~14.7% FCFF CAGR maps to an approximately equal ~14.7% revenue CAGR): implied FY2031 revenue ≈ $118,248mm, versus `04`'s own consensus-based FY2031 revenue of $100,247mm. Converting FY2031 revenue to Gross Bookings (the total dollar value of trips/orders on the platform, of which Uber keeps a take-rate cut) at Uber's approximate current take rate (~24.5%, from Q2 FY2026's "$14,191mm revenue on >$58bn gross bookings" print [Q2 FY2026 transcript, prepared remarks, cited in `earnings/02_revenue-drivers.md`]) implies **~$483bn of FY2031 Gross Bookings**. Against a combined global ride-hailing + online food-delivery market sized at roughly $499bn–$744bn in 2026 (Web-sourced, dated 2026-08-06, unverified — a wide span across vendor reports including Fortune Business Insights, Grand View Research, and Mordor Intelligence, reflecting real methodology disagreement, not a single reliable TAM figure) and grown at a blended ~10% CAGR (within the cited 9–16% ride-hailing / 9–13% food-delivery ranges) to roughly $804bn–$1,198bn by 2031, Uber's implied FY2031 Gross Bookings would represent **~40–60% of that pool**, up from an implied current share of **~31–46%** (Uber's own ~$232bn annualized Gross Bookings run-rate, from the Q2 FY2026 print annualized, against the 2026 TAM range). This is a continuation of share gains already visible in the data (Uber's Gross Bookings grew 22% YoY in Q2 FY2026 [`earnings/02_revenue-drivers.md` §4] against the ~10% assumed market growth), not a demand for an implausible or unprecedented share capture — **this check does not tighten the verdict above; it does not flag a kill signal.** It is shown as a labelled, low-confidence sanity check given the wide (roughly 50%) spread across vendor TAM estimates — a market-size band this thin (CLAUDE.md §4, a low-tier input) cannot bear much analytical weight on its own, and the conclusion rests primarily on the company-history and earnings-module evidence above, not on this check.

## 4. Robustness

**Discount-rate sensitivity** (FCFF base held at `04`'s $4,526mm, terminal g held at 4.0%):

| Discount Rate | Implied FCFF CAGR to Justify Price |
|---|---:|
| WACC −1% (8.5857%) | 10.5% |
| WACC (9.5857%) | **14.7%** |
| WACC +1% (10.5857%) | 18.3% |

Spread: 7.8 percentage points (pp) across the ±1pp WACC band.

**FCFF-base sensitivity** (WACC and terminal g held fixed at `04`'s values). The low/high bounds are built off `earnings/07_earnings-sensitivity.md` §2's own bull/bear Adjusted EBITDA cases (bear $6,849mm / base $8,730mm / bull $10,611mm — the sum of the ±$581mm bookings-growth, ±$520mm insurance-cost, and ±$780mm SG&A-leverage swings on the FY2025 $8,730mm base), scaled by the same ratio `04` used to bridge FY2025 Adjusted EBITDA to its normalized FCFF base (4,526/8,730 = 0.5185), preserving `04`'s own normalization methodology rather than inventing a new one:

| FCFF Base | Value | Implied FCFF CAGR to Justify Price |
|---|---:|---:|
| Low (bear-case Adj. EBITDA $6,849mm × 0.5185) | $3,551mm | 19.8% |
| Base (`04`'s canonical figure) | $4,526mm | **14.7%** |
| High (bull-case Adj. EBITDA $10,611mm × 0.5185) | $5,501mm | 10.6% |

Spread: 9.2pp across the low/high FCFF-base band.

**Terminal-growth sensitivity** (required because `04`'s terminal value is 77.1% of its EV, above the 60% threshold that triggers this check; WACC and FCFF base held fixed at `04`'s values):

| Terminal g | Implied FCFF CAGR to Justify Price |
|---|---:|
| g −0.5% (3.5%) | 16.1% |
| g (4.0%) | **14.7%** |
| g +0.5% (4.5%) | 13.1% |

Spread: 3.1pp across the ±0.5pp terminal-g band.

**Which input dominates.** The **FCFF base is the larger swing factor** (9.2pp spread) versus the discount rate (7.8pp spread) and terminal g (3.1pp spread) — consistent with the pattern flagged across this valuation module's other outputs. This matters because the FCFF base is itself an assumption (SBC not added back, a narrow trade-receivables/payables working-capital proxy — see `04_intrinsic-dcf.md` §1), not an audited cash figure; the reported FY2025 FCF (CFO − capex) was actually $9,763mm, more than double `04`'s $4,526mm normalized base. If a reader believes the normalization is too conservative, the implied growth bar the price requires falls well below even the 10.6% "high-base" case shown above.

## 5. What's-Priced-In Read

At $68.18, the market is pricing in roughly 14.7% annual growth in free cash flow (FCFF) over FY2026–2031 — equivalent to holding the EBIT margin (operating profit as a share of revenue) at just ~12.8%, barely above the 12.1% level Uber already posted over the last twelve months — using the same 9.59% discount rate and 4.0% terminal growth rate `04`'s forward DCF used. That is conservative relative to what the evidence supports: it sits below `04`'s own consensus-anchored base case (18.6% FCFF CAGR and a 16.0% terminal margin, which produces a $82.87 fair value, +21.5% above price), below Uber's own recent Adjusted EBITDA and EBIT growth, and it does not require Uber to capture an implausible share of the global ride-hailing-and-delivery market (the implied ~40–60% share by 2031 continues, rather than accelerates, the trend already visible in the data). Because the implied expectations are below what the earnings-module evidence and `04`'s own consensus-based case say Uber can plausibly deliver, this reads as **upside**, not downside — consistent with, and reinforcing, `04`'s independent finding of a 21.5% gap between its intrinsic value and today's price.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — UBER

**Jurisdiction / reporting basis:** US / NYSE. Reporting standard: US GAAP. Reporting currency: USD (millions, unless stated per-share). No primary 10-K/10-Q sits in `data/UBER/`; every segment and comparable figure below is a Capital IQ export (source tier 5) or a labelled web source, cited as such — never attributed to the 10-K by name, consistent with `01_price-and-capital-structure.md` and `business-model/03_segment-map.md`.

**Anchors reused from `01_price-and-capital-structure.md` (Reconciliation Gate 1 — used verbatim, not re-derived):** current price $68.18 (pool-verified, close 2026-08-05); shares for per-share fair value 2,087.980mm (LTM weighted-average diluted); net debt (strict) $9,340mm; minority interest $1,083mm; preferred $0; equity-method investments $3,773mm (Financials.xls, Balance Sheet tab, Jun-30-2026).

## 1. Segment Inventory

FY2025 figures (fiscal year ended Dec-31-2025, latest disclosed annual segment note, vendor-parsed by Capital IQ from Uber's audited segment disclosure) [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2025 column].

| Segment | Revenue | EBITDA (company-defined Adjusted EBITDA) | Margin | % of Total EBITDA | Source |
|---|---:|---:|---:|---:|---|
| Mobility | $29,670mm | $7,899mm | 26.6% | 90.5% (of $8,730mm consolidated) / 69.1% (of $11,438mm pre-corporate segment pool) | Financials.xls, Segments tab |
| Delivery | $17,248mm | $3,572mm | 20.7% | 40.9% (consolidated) / 31.2% (pre-corporate) | Financials.xls, Segments tab |
| Freight | $5,099mm | -$33mm | -0.7% | -0.4% (consolidated) / -0.3% (pre-corporate) | Financials.xls, Segments tab |
| Corporate G&A and Platform R&D (unallocated) | $0 (cost center, not a revenue line) | -$2,708mm | n/a | -31.0% (consolidated) | Financials.xls, Segments tab |
| **Total** | **$52,017mm** | **$8,730mm** | **16.8%** | **100.0%** | Financials.xls, Segments tab |

**Denominator definition (required by the partial-data rule).** Two legitimate denominators exist and they read very differently: (1) **consolidated Total EBITDA net of corporate drag** ($8,730mm) — the four rows above sum to exactly 100.0% of this, but the negative $2,708mm corporate bucket mechanically inflates Mobility's apparent share to 90.5%; (2) **the pre-corporate segment-level EBITDA pool** (Mobility + Delivery + Freight = $11,438mm, before the unallocated cost is netted) — on this basis Mobility is 69.1%, Delivery 31.2%, Freight -0.3%. The second basis is the correct one for judging whether this is a "single-segment" business, because Corporate G&A/Platform R&D is a cost center, not a business segment, and using it to inflate the dominant segment's share would conflate an unrelated overhead bucket with genuine business concentration.

**Single-segment test.** On the pre-corporate basis, Mobility is 69.1% of segment profit — **below** the >85% threshold in the partial-data rule. Delivery is a real second segment: 33.2% of revenue and a meaningful, still-improving profit contributor (EBITDA margin rose from -22.4% in FY2020 to +20.7% in FY2025) [`business-model/03_segment-map.md`, §1–§2]. This is **not** a single-segment collapse case. Freight is immaterial to profit (a rounding error on consolidated EBITDA, and structurally shrinking — revenue fell from a FY2022 peak of $6,947mm to $5,099mm in FY2025) but is still carried through the SOTP rather than dropped, consistent with Reconciliation Gate 3 (no vanished bucket).

Segment revenue and EBITDA reconcile exactly to consolidated: $29,670 + $17,248 + $5,099 = $52,017mm revenue; $7,899 + $3,572 - $33 - $2,708 = $8,730mm EBITDA [`business-model/03_segment-map.md`, §1].

## 2. Segment Multiples & Comparables

**Forward-basis construction (stated once, applies to all three segments).** No segment-level consensus or forward split is published for Uber — Capital IQ's Segments tab carries FY2020–FY2025 actuals only, and no segment-level guidance or Street estimate exists in the pool [`business-model/03_segment-map.md`, §0]. To value each segment on a forward metric (Calculation Standard 10's hard rule), this agent constructs an **evidenced estimate, labelled as inference**: hold the FY2025 disclosed revenue-mix and EBITDA profit-share constant, and scale each segment (and the corporate bucket) to Uber's own **consolidated NTM figures** — NTM Revenue $62,191.86mm and NTM EBITDA $12,589.03mm [Company Comparable Analysis Uber Technologies Inc.xls, Financial Data tab, As-Of 2026-08-06]. NTM (not FY2026 calendar) is used as the scaling anchor because the peer multiples below are themselves quoted on an NTM basis — mixing an NTM peer multiple with an FY2026-calendar Uber metric would violate the "never mix bases" rule (Calculation Standard 4). *Inference, not from filings: the segment split of Uber's own NTM total is derived, not disclosed; the mix-and-profit-share-constant assumption is a simplification that does not capture segment-specific growth divergence (e.g., Delivery's Trendyol Go divestiture headwind, Freight's ongoing revenue decline) — flagged, not resolved, by this construction.*

Growth factors applied: Revenue ×1.1956 (62,191.86/52,017); EBITDA ×1.4421 (12,589.03/8,730) [same source].

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple (NTM) | Source |
|---|---|---:|---|---:|---|
| Mobility | NTM EBITDA (derived, see above) | 12.26x | Grab Holdings Limited (NasdaqGS:GRAB) | 12.26x | Company Comparable Analysis Uber Technologies Inc.xls, Trading Multiples tab, "NTM TEV/Forward EBITDA," As-Of 2026-08-06 |
| Delivery | NTM EBITDA (derived, see above) | 20.78x | DoorDash, Inc. (NasdaqGS:DASH) | 20.78x | Same source |
| Freight | NTM Revenue (derived, see above) | ~1.03x (derived) | C.H. Robinson Worldwide, Inc. (NasdaqGS:CHRW) | 1.03x (derived) | Web: stockanalysis.com/stocks/chrw/statistics, 2026-08-06 (indicative, unverified) |
| Corporate (capitalization multiple) | NTM EBITDA (negative, derived) | 11.89x | Uber Technologies, Inc. — own consolidated multiple | 11.89x | Company Comparable Analysis Uber Technologies Inc.xls, Trading Multiples tab, "NTM TEV/Forward EBITDA," Uber row |

**Why each comparable fits (economics, not surface label):**
- **Mobility → Grab, primary.** Grab is a profitable (LTM EBITDA margin 9.2%), asset-light, multi-sided ride-hailing-plus-delivery marketplace with no owned vehicle fleet — the same network-effects, no-fleet-ownership economics as Uber Mobility, and (unlike Lyft) it is actually generating positive segment-level margins, which better reflects what a mature, scaled ride-hailing marketplace should be worth. Lyft, Inc. (NasdaqGS:LYFT) — the closer surface/geography match (pure US/Canada peer-to-peer ridesharing) — is shown as a **secondary, low-end sanity check** at 7.94x NTM EV/EBITDA: Lyft's LTM EBITDA is still slightly negative (-$6.7mm) and its NTM turn to profitability is a recent inflection, not a proven multi-year margin record like Uber Mobility's (26.6% FY2025 segment margin, up from 19.2% in FY2020) [`business-model/03_segment-map.md`, §1], so Lyft's multiple likely understates Mobility's economics. DiDi Global's 16.58x NTM multiple is **excluded from the multiple selection** — it is computed on a currently-negative LTM EBITDA base (-$564.3mm) turning to a small, speculative NTM positive ($685.97mm), making the multiple itself low-confidence [Company Comparable Analysis Uber Technologies Inc.xls, Financial Data & Trading Multiples tabs].
- **Delivery → DoorDash, primary.** DoorDash is the standard, named, matching comparable: an asset-light on-demand delivery marketplace monetizing via take rate plus advertising, competing in the same US restaurant/grocery/retail delivery category Uber Delivery serves [`business-model/03_segment-map.md`, §1]. Caution flagged in §5: DoorDash's NTM revenue growth (+22.8%, LTM $15,891mm → NTM $19,513.83mm) is faster than Uber Delivery's own recent trend, which is decelerating and carries a reported-growth headwind from the Trendyol Go divestiture [`business-model/03_segment-map.md`, §1, citing Q2 2026 transcript l.700-701] — DoorDash's growth premium multiple may not be fully earned by Uber Delivery. Grab (12.26x) is shown as the **secondary, more conservative** Delivery comp in the dispersion range, since Grab also derives meaningful revenue from food/grocery delivery.
- **Freight → C.H. Robinson, only available match.** None of the pool's named comparables (Lyft, DoorDash, DiDi, Grab, Avis, Hertz, Daiwa, Taiwan Taxi) are freight brokers; all are ride-hailing, delivery, or car-rental businesses with the wrong economics for Freight (asset-light digital brokerage connecting shippers and carriers). C.H. Robinson is the standard named comparable for an asset-light, scaled freight-brokerage marketplace and is sourced from the web since no freight-brokerage name exists in the data pool comp set. Freight's derived NTM EBITDA is negative (-$47.6mm — a near-breakeven segment that has run negative or flat-to-breakeven in 5 of the last 6 disclosed fiscal years [`business-model/03_segment-map.md`, §1]), so an EV/EBITDA multiple is not meaningful; Freight is valued on **forward EV/Sales** instead, the defensible fallback when the primary forward metric is negative. C.H. Robinson does not publish a forward EV/Sales figure directly; this agent derives ~1.03x by scaling C.H. Robinson's trailing EV/Sales (1.16x) by the ratio of its Forward P/S to trailing P/S (0.94/1.06 = 0.887) [stockanalysis.com/stocks/chrw/statistics, 2026-08-06] — **Inference, not from filings**, labelled web-sourced and unverified.
- **Corporate capitalization multiple → Uber's own consolidated NTM EV/EBITDA (11.89x).** Used to capitalize the unallocated corporate cost stream because it is an actual, observed market multiple for the whole entity (neutral, not cherry-picked from a peer) [Company Comparable Analysis Uber Technologies Inc.xls, Trading Multiples tab].

## 3. Segment Valuation

Two cases are shown because the Mobility and Delivery multiples are highly sensitive to which named comparable is used (§2). **Base** uses the primary comparable for each segment (Grab for Mobility, DoorDash for Delivery). **Low (conservative sanity check)** uses the secondary comparable for Mobility and Delivery (Lyft, Grab respectively) — Freight and the corporate capitalization multiple are held fixed in both cases (no alternate comp exists for Freight; the corporate multiple is Uber's own observed figure, not a segment-quality judgment).

### Base case

| Segment | NTM Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Mobility | $11,390.8mm (EBITDA) | 12.26x (Grab) | $139,651.2mm |
| Delivery | $5,151.0mm (EBITDA) | 20.78x (DoorDash) | $107,037.8mm |
| Freight | $6,096.2mm (Revenue) | 1.03x (C.H. Robinson, derived) | $6,279.1mm |
| **Gross enterprise value (sum)** | | | **$252,968.1mm** |

### Low / conservative sanity-check case

| Segment | NTM Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Mobility | $11,390.8mm (EBITDA) | 7.94x (Lyft) | $90,443.0mm |
| Delivery | $5,151.0mm (EBITDA) | 12.26x (Grab) | $63,151.3mm |
| Freight | $6,096.2mm (Revenue) | 1.03x (C.H. Robinson, derived) | $6,279.1mm |
| **Gross enterprise value (sum)** | | | **$159,873.4mm** |

Formula shown: Segment EV = NTM segment metric (§2 derivation) × the multiple in the row above.

## 4. Equity Bridge

Both cases share the same corporate-cost capitalization and the same net-debt/minority/equity-method bridge — only the segment EVs differ.

| Step | Base case | Low case |
|---|---:|---:|
| Gross enterprise value (sum, §3) | $252,968.1mm | $159,873.4mm |
| − Capitalized unallocated corporate costs (NTM EBITDA -$3,905.1mm × 11.89x, Uber's own multiple) | -$46,431.6mm | -$46,431.6mm |
| = Enterprise value after corporate | $206,536.5mm | $113,441.8mm |
| − Net debt (strict, from `01`) | -$9,340mm | -$9,340mm |
| − Minority interest (from `01`) | -$1,083mm | -$1,083mm |
| − Preferred | $0 | $0 |
| + Equity-method investments (Financials.xls, Balance Sheet tab, Jun-30-2026) | +$3,773mm | +$3,773mm |
| **= Equity value** | **$199,886.5mm** | **$106,791.8mm** |
| ÷ Diluted shares (from `01`) | 2,087.980mm | 2,087.980mm |
| **= SOTP value per share** | **$95.73** | **$51.15** |
| vs current price ($68.18) | +40.4% | -25.0% |

**Net-cash sign discipline:** Uber is net-debt positioned (strict basis $9,340mm), so a single "− net debt" line is used; no separate net-cash add-back applies.

**Corporate cost — not vanished.** The -$2,708mm FY2025 corporate bucket is explicitly scaled (to -$3,905.1mm NTM) and capitalized at Uber's own 11.89x multiple, then subtracted as a discrete bridge line ($46,431.6mm) — the single largest subtraction in the bridge, at 18.4% of gross EV in the base case. It is not dropped by assertion (Reconciliation Gate 3).

**Equity-method investments.** Only the $3,773mm "Equity Method Investments" balance-sheet line is added back, per `01`'s labelling. Uber separately carries $12,532mm of "Long-term Investments" (which includes a ~$4bn pre-acquisition Delivery Hero stake purchased in Q2 2026) [`01_price-and-capital-structure.md`, §4] — this larger balance is **not** added back here, consistent with `01`'s own treatment (neither netted into cash nor added elsewhere), because the pool provides no reliable current-period split of that balance into liquid vs. strategic/illiquid holdings. Flagged as an unresolved, potentially material upside (~$12.5bn, ~$6/share if added whole) not captured in this SOTP.

**Conglomerate / holding-company discount: none applied.** Uber is classified as an Operating business (not a Holding company) in the Business-Type Method Map — Mobility, Delivery, and Freight share one technology platform, one driver/courier supply network, and overlapping management, rather than being run as unrelated independent businesses. No structural holdco discount is warranted. The wide base-to-low dispersion below already captures comparable-selection risk; the pending Delivery Hero acquisition (announced on the Q2 2026 call [`business-model/03_segment-map.md`, §3]) is a separate, unquantified integration-risk flag, not a discount applied here.

## 5. SOTP Read

Using the best-matched named comparables (Grab for Mobility, DoorDash for Delivery, C.H. Robinson for Freight), the base SOTP value is **$95.73/share, 40.4% above the $68.18 price**; using the more conservative comparable pair (Lyft for Mobility, Grab for Delivery), the same construction produces **$51.15/share, 25.0% below price**. This ~$44/share, near-2x dispersion — driven almost entirely by which multiple is credited to Mobility and Delivery — means the SOTP method here **straddles the current price and cannot cleanly call the stock over- or under-valued**; it is a directional cross-check on comparable selection, not a precision target, and its combined weight (with the DCF) is capped as a minority input to the base fair value per the module's multiples-first policy.

Mobility carries the majority of gross segment value in every scenario (55-57% of gross EV, both cases) — consistent with its 69.1% share of pre-corporate segment profit (§1) — and is the segment the consolidated 11.89x multiple most under-credits if Uber Mobility's 26.6% EBITDA margin (roughly triple Grab's own 9.2% consolidated margin) genuinely deserves a peer-marketplace multiple standalone. Delivery's implied value is the single most sensitive line in this analysis: it swings from $63.2bn to $107.0bn (40-42% of gross EV either way) depending on whether Uber Delivery deserves DoorDash's high-growth premium multiple (20.78x) or Grab's more moderate multi-sided-marketplace multiple (12.26x) — given Delivery's decelerating, divestiture-affected growth versus DoorDash's own faster top line, the low-case comparable is arguably the more defensible read. Freight is immaterial in every case (2-4% of gross EV) and structurally troubled (revenue down 27% from its FY2022 peak), confirming it is not a source of hidden value the consolidated multiple is masking.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — UBER

**Anchors reused verbatim from `01_price-and-capital-structure.md`** (Reconciliation Gate 1 — no re-derivation): current price **$68.18** (close, Aug-05-2026, **pool-verified** — corroborated across three independent Capital IQ exports, 1 trading day old at run date, no staleness cap or dual-price presentation required); shares for per-share fair value **2,087.980mm** (LTM weighted-average diluted, a GAAP-embedded proxy — labeled limitation, not a bottom-up treasury-stock/if-converted rebuild); net debt (strict basis: total debt − cash & equivalents) **$9,340mm**; minority interest **$1,083mm**; preferred **$0**; enterprise value (EV — the value of the whole business: equity plus debt, minus cash) **$149,210.14mm**. Reporting standard US GAAP, currency USD. No structurally misaligned controlling owner is flagged (RF-OWN-004 not triggered — Uber's register is diffuse, largest holder BlackRock at 7.4%, per `management-governance/04_ownership-and-insider-behavior.md` and `02_multiples-own-history.md` §3), so no value-trap discount is mandatory going in.

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $85.29 (illustrative median-basis point; dispersion $73.25–$115.44) | Low | **0%** | `02` explicitly labels every reversion-implied value **"illustrative-only, not a tight fair-value input for `07`"** because the pool's own-multiple time series is only ~17 months (seven quarterly points), not the ~3-year window the method needs, and the mean/median it would revert to mixes a much-lower-margin earlier regime into today's roughly-doubled EBITDA base. Per this module's zero-weight rule for a method flagged non-value-producing by its own producer, `02` is **zero-weighted** in the base point and shown in the football field (§2) for transparency only. |
| Relative / peers (03) | $73.39 (quality-adjusted NTM EV/EBITDA, 13.0x); dispersion ~$73–$111 | Moderate | **68%** | Uber has a usable forward metric (Capital IQ consensus NTM EBITDA and EPS, 9 analysts) and a named, economics-matched core peer set (Lyft, DoorDash, DiDi, Grab — all asset-light two/three-sided marketplaces). Per the module's multiples-first policy for an Operating company with estimates, `02`+`03` should carry the majority weight; with `02` zero-weighted on its own flag, `03` alone carries the majority here. Its own quality haircut (-10% EV/EBITDA, -15% P/E) already discounts for the "No moat proven" and regulatory-dependence evidence below, which is why it is trusted over the raw, unadjusted peer median. |
| Intrinsic DCF (04) | $82.87 (base case); sensitivity grid $65.11–$113.60; supplementary financeable-growth case $55.67–$74.98 | Low–Moderate | **16%** | Per the multiples-first policy, DCF is a capped cross-check (combined with `06` ≤ ~⅓) for an Operating company with a usable forward multiple. Its own report flags **terminal value at 77.1% of EV** (exceeds the 75% terminal-dominance threshold) and an unresolved Economic Consistency Gate 2 gap (mechanically "financeable" growth of ≈ −0.3% vs. the modeled terminal g of 4.0%, only partially bridged by Uber's opex/investing-funded, non-capex growth model). Both are real, disclosed fragilities, not reasons to discard the method — hence a real but capped weight. |
| Reverse-DCF (05) | (implied, not a value) — price requires only a 14.7% FCFF CAGR (FY26–31) and a 12.8% steady-state EBIT margin, both **below** `04`'s own consensus-anchored base case (18.6% CAGR, 16.0% margin) | High (on what it tests) | n/a | Cross-check only. Confirms the base case's growth/margin bar is achievable against recent history (LTM EBIT margin already 12.1%, within 65bps of the 12.8% the price requires) and against `04`'s own more demanding base case — informs confidence in Base/Bull, not a weighted input. |
| Sum-of-the-parts (06) | Base-comp case $95.73; conservative-comp case $51.15 (near-2x dispersion) | Low | **16%** | Multi-segment SOTP is mandatory here (Mobility is 69.1% of pre-corporate segment profit, below the >85% single-segment threshold — not a collapsed/sanity-check-only case), so it is not zero-weighted. But its own report states the method **"cannot cleanly call the stock over- or under-valued"** because the result swings ~$44/share depending solely on which named comparable (Grab vs. Lyft for Mobility; DoorDash vs. Grab for Delivery) is credited — a genuine methodological fragility, not a data gap, hence a capped, minority weight alongside `04`. |

Weights sum to 100% across the value-producing, business-type-valid methods (`03`, `04`, `06`); `02` is zero-weighted on its own illustrative-only flag; `05` is a cross-check, not a weighted input, per the Business-Type Method Map (Operating: FCFF DCF + reverse-DCF, EV/EBITDA/EV/EBIT/P/E/FCF-yield multiples — all four weighted/cross-check methods here are valid for this type).

**Multiples-first check.** Uber has a usable forward metric (NTM consensus EBITDA/EPS, 9-analyst coverage per `earnings/04_guidance-consensus.md`) and a peer multiple set (`03`), so `02`+`03` should carry the majority per the module's multiples-first policy. With `02` self-flagged illustrative-only and zero-weighted, `03` alone (68%) carries that majority, and `04`+`06` combined (32%) sit at the policy's ≈≤⅓ cap for cross-checks — consistent with the rule.

## 2. Triangulation & Reconciliation

**Method football field** (one row per value-producing method, its own value or range, confidence, and weight):

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| 02 Own-history multiples | $85.29 point (illustrative) / $73.25–$115.44 range | Low | 0% (zero-weighted, self-flagged) | 7-quarter window; mean/median mixes a lower-margin regime |
| 03 Relative/peers | $73.39 point / ~$73–$111 range | Moderate | 68% | Majority weight per multiples-first policy; own quality haircut applied |
| 04 Intrinsic DCF | $82.87 point / $65.11–$113.60 range (+ structural-reset $31.88, separate — see §3) | Low–Moderate | 16% | Capped cross-check; terminal value 77.1% of EV, financeable-growth gap flagged |
| 05 Reverse-DCF | Not a value — implies 14.7% FCFF CAGR / 12.8% steady-state margin required | High (on the test) | n/a | Cross-check: confirms Base/Bull achievability, not weighted |
| 06 Sum-of-the-parts | $95.73 (base-comp) / $51.15 (conservative-comp) | Low | 16% | Capped cross-check; ~2x dispersion driven by comp selection alone |

**The honest spread is wide and must be shown, not smoothed.** Across the three value-producing methods' own single points, the range is $73.39 (03) to $95.73 (06 base-comp case) — a 30% spread — but the FULL dispersion once each method's own low/high range is included runs from **$51.15 (06, conservative comp)** to **$115.44 (02, illustrative EV/EBIT reversion — zero-weighted)**, and among methods actually feeding the base point, `04`'s base ($82.87) sits **62% above `06`'s own conservative-comp case ($51.15)** — a genuine >40% cross-method disagreement (Reconciliation Gate 6) that must be reconciled, not averaged away.

**Reconciliation judgement.** The gap between `04`'s $82.87 and `06`'s $51.15 low case is not a fundamental disagreement about Uber's consolidated economics — both derive from broadly the same NTM operating base — it is a **comparable-selection artefact inside `06`** (Lyft's 7.94x vs. Grab's 12.26x credited to Mobility; Grab's 12.26x vs. DoorDash's 20.78x credited to Delivery) layered on top of `04`'s own separately-flagged terminal-value fragility (77.1% of EV). Trusted most for this company: **`03`, the peer-relative read**, because it rests on the tightest, most economics-matched comparable set (Lyft, DoorDash, DiDi, Grab all run the same asset-light take-rate model) and a forward metric with real analyst coverage, and because its quality haircut is explicit and evidenced rather than a single comp-selection coin-flip. `04` is trusted directionally (it independently corroborates upside) but its point estimate is treated as fragile given the terminal-dominance flag. `06` is trusted least as a point estimate — its own report says it "cannot cleanly call" the stock — and is used only for the direction (Mobility is worth materially more standalone than the consolidated multiple credits it) and as a caution on comp selection.

**Base-case fair value (single point): $74.91/share.** This is the weight-blended figure from §1 (0.68 × $73.39 + 0.16 × $82.87 + 0.16 × $73.44 [midpoint of `06`'s $95.73/$51.15 range, since `06`'s own report does not name a single preferred point]) — computed, not asserted:

```
python3:
w03, base03 = 0.68, 73.39
w04, base04 = 0.16, 82.87
w06, base06 = 0.16, (95.73+51.15)/2   # = 73.44, 06's own report names no single point
weighted_base = w03*base03 + w04*base04 + w06*base06
# Output: 73.44 (06 mid); weighted_base = 74.9148 -> $74.91
```

This sits close to `03`'s own $73.39 point (the majority-weighted method) and is corroborated by `05`'s finding that today's price requires LESS growth (14.7% FCFF CAGR, 12.8% terminal margin) than `04`'s own consensus-anchored base case (18.6% CAGR, 16.0% margin) — i.e., the reverse-DCF's "what's priced in" read is conservative relative to the evidence, reinforcing (not contradicting) a base fair value above today's price.

## 3. Bull / Base / Bear Fair-Value Levels

Each level is `forward NTM EBITDA (consensus, GAAP-basis, the same $12,589.03mm anchor `02`/`03`/`06` all use) × a warranted NTM EV/EBITDA multiple`, bridged to equity using `01`'s canonical net debt ($9,340mm) and minority interest ($1,083mm), divided by the 2,087.980mm diluted per-share-fair-value share count. Horizon: **12 months** unless stated otherwise. Multiple direction is symmetric with the metric direction in every case (both up in Bull, both down in Bear), and the Bull multiple (15.0x) ≥ Base (13.25x) ≥ Bear (10.0x).

| Case | Fair Value / Share (point) | Forward Metric (NTM EBITDA) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **$104.89** | $15,296mm (+21.5% vs. base) | 15.0x | 12 months | Bookings growth re-accelerates (~+4pp vs. the FY2025 pace, reversing the FQ3'24→FQ2'26 deceleration from +20.4% to +12.2% YoY) [`earnings/07_earnings-sensitivity.md` §2]; SG&A leverage resumes improving rather than the LTM +63bps reversal that has already started [`earnings/03_margin-drivers.md` §3]; the insurance-cost tailwind is banked, not fully reinvested; the pending Delivery Hero acquisition closes on schedule and consolidates without integration drag [`business-model/03_segment-map.md` §3]; the market grants a multiple modestly above the raw (unadjusted) core-peer median of 14.42x NTM EV/EBITDA [`03_relative-valuation-peers.md` §2], reflecting Uber's already-highest-in-set EBITDA margin (13.5% LTM vs. peers' 9.2–9.5%) with no further quality discount. |
| Base | **$74.91** | $12,589mm (consensus) | 13.25x | 12 months | Consensus growth and margin path holds — the same 9-analyst NTM consensus `02`/`03`/`06` all anchor on. Margin gains achieved to date (LTM EBIT margin 12.1%, up from 10.7% FY2025) neither reverse nor accelerate materially. The market closes roughly a third of the current ~-17.5% NTM EV/EBITDA discount to the quality-adjusted peer level (13.0x, `03` §5) implied gap, landing at 13.25x — still below the raw 14.42x peer median, reflecting the unresolved "No moat proven" (3-year average ROIC 6.2% vs. ~8.1% WACC, `business-model/09_moat.md` §3) and Filter-5 rate-of-change flag (35/100, AV-disintermediation risk not yet resolved, `business-model/07_business-quality.md` row 17) that `03`'s own haircut already prices in. |
| **Bear (cyclical, headline)** | **$40.23** | $9,442mm (−25% vs. base) | 10.0x | 12 months | Bookings growth decelerates further (continuing the FQ1'26→FQ2'26 trend of +14.5%→+12.2% YoY) while the cost base cannot flex down as fast — `earnings/07_earnings-sensitivity.md` §6 explicitly flags that its own linear sensitivity estimate (a simple ±21.6% Adjusted EBITDA swing off the FY2025 base) **likely understates** true bear-case severity because SG&A is semi-fixed in a real slowdown and the SG&A-reversal (already +63bps off the FY2025 low) and the bookings deceleration compound rather than offset (§5, same report). This bear widens the naive linear move to −25% on that basis, and cites the company's own documented prior downturns as the evidence a real trough exists: **FY2021 consolidated EBITDA margin was −16.8%** and **Freight (9.8% of FY2025 revenue) has run negative-to-flat EBITDA in 5 of the last 6 fiscal years, with revenue down 27% from its FY2022 peak** [`business-model/07_business-quality.md` row 20; `business-model/03_segment-map.md` §1]. The −25% widened move (not the full −16.8%-margin COVID-era collapse) is used because Uber's core Mobility/Delivery cost structure has been structurally transformed since 2020–2021 (a mature, asset-light, take-rate business today vs. a subsidized early-scale-up then) — applying the literal 2020–2021 margin to today's business would overstate the trough given that structural change; the multiple also compresses to 10.0x, below today's actual 11.89x and toward Lyft's 7.94x NTM EV/EBITDA (the lowest in the core peer set), reflecting a genuine de-rating on a miss. |

**Bear — structural reset (avoid-ruin floor, NOT the headline Bear — see billing rule below): $31.88/share, 24–36 month horizon.** Reused verbatim from `04_intrinsic-dcf.md` §5's declining-perpetuity ("runoff") terminal — not recomputed here. Driver: terminal EBIT margin faded to a **non-recovering 8.0%** (vs. the base-case plateau of 16.0%; LTM actual 12.1%) and terminal growth of **−2.0%** (a genuine negative nominal trajectory), reflecting a structural reset — e.g. a major-market driver-classification ruling that "strikes directly at Uber's core independent-contractor cost structure" [`business-model/10_external-dependency.md` §5], or the AV transition disintermediating Uber as the driver-supply layer it does not own [`business-model/07_business-quality.md` row 17]. Bridge (EV-based, `01`'s canonical net debt/minority): `EV $76,978mm − net debt $9,340mm − minority $1,083mm = equity $66,555mm ÷ 2,087.980mm shares = $31.88/share` (`04`'s own executed bridge, reused verbatim, net debt subtracted before dividing by shares).

**Why this is the avoid-ruin floor, not the headline Bear.** `business-model/09_moat.md` returns **"No moat proven — moat in structure, not economics,"** with the trajectory explicitly labeled **"widening (early-stage, not yet fully proven)"** — not eroding. `business-model/07_business-quality.md`'s rate-of-change/disruption row scores 35/100 (≤ the ~40 Filter-5 threshold), which does trip the structural-reset trigger, but on an **unproven-not-decaying** moat, not a confirmed-eroding one. Per the graduated billing rule, that combination keeps the cyclical through-cycle trough ($40.23) as the headline Bear, and the structural reset is carried as the labelled avoid-ruin floor for the master synthesizer's Kill Criteria (CLAUDE.md §24) — a demotion that assumes a weighted method already reflects the lost-excess-return risk. Here `04` (16% weight, included in triangulation, not excluded) does apply a "no moat proven" terminal-scaling discipline of its own (§5: the base terminal plateaus EBIT margin at 16.0% with **no perpetual excess-return premium** baked in, rather than extrapolating consensus arithmetic to ~19%) — a partial, not a literal ROIC-to-WACC, reflection of the moat concern. Given that partial reflection and that `04` is genuinely in the blend (not excluded per the partial-data carve-out), the demotion is applied, but is flagged here as resting on a partial rather than a full fade — a reader should not treat the $40.23 headline Bear as pricing the structural risk away entirely; the $31.88 floor remains live and is the more relevant number if the moat trajectory is later reassessed as eroding rather than widening.

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | $68.18 (Aug-05-2026 close, pool-verified) |
| Base-case fair value (point) | $74.91 |
| Bear-case fair value (cyclical, headline) | $40.23 |
| Bear-case fair value (structural reset, avoid-ruin floor, memo only) | $31.88 |
| Implied upside to base case = (base FV − price) / price | **+9.9%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **+9.0%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **41.0%** (cyclical headline bear) / 53.2% (memo, vs. the structural-reset floor) |

```
python3:
price = 68.18; base_ps = 74.91; bear_ps = 40.23; struct_ps = 31.88
mos = (base_ps - price)/base_ps                    # 0.0902 -> 9.0%
downside_to_bear = (price - bear_ps)/price          # 0.4098 -> 41.0%
upside_to_base = (base_ps - price)/price            # 0.0989 -> 9.9%
downside_to_structural = (price - struct_ps)/price  # 0.5324 -> 53.2%
```

Price is pool-verified and fresh (1 trading day old at run date, `01` §1) — no staleness re-anchoring or dual-price presentation is required.

## 5. Warranted-Multiple Check

The base case implies a 13.25x NTM EV/EBITDA multiple — an 11.4% expansion from today's actual 11.89x, but still below the raw (unadjusted) core-peer median of 14.42x and essentially in line with `03`'s own quality-adjusted peer multiple (13.0x). That expansion is supported by evidence Uber already has, not evidence it needs to earn: the highest EBITDA margin (13.5% LTM) among its four closest economics-matched peers (Lyft, DoorDash, DiDi, Grab), a return on capital that has cleared its own estimated ~8.1% cost of capital for two straight years (FY2024–FY2025, plus the LTM point) [`business-model/09_moat.md` §3–§4], and revenue growth (16.7% LTM) roughly matching the core-peer median off a far larger base. It is deliberately NOT pushed to the own-history mean (29.77x LTM EV/EBITDA, `02` §2) because that figure is self-flagged illustrative-only and mixes a structurally lower-margin earlier period. **No value-trap flag applies** — `management-governance`'s ownership read finds no structurally misaligned controlling owner (RF-OWN-004 not triggered), so the discount being partially closed here is not being underwritten against an owner with no interest in a re-rating.

## 6. Fair-Value Read

Uber's base-case fair value is **$74.91/share (+9.9% vs. the $68.18 price)**, bracketed by a bull case of **$104.89** and a headline (12-month, cyclical-trough) bear of **$40.23** — with a separately-labelled 24–36-month structural-reset floor of **$31.88** carried to the master synthesizer's Kill Criteria, not blended into the headline. Margin of safety is a modest **9.0%** and the downside to the headline bear is **41.0%** — a materially asymmetric setup even before the deeper structural floor is considered. The peer-relative method (`03`, 68% weight) drives the answer because it rests on the tightest economics-matched comparable set and an explicit, evidenced quality haircut, while the intrinsic DCF (`04`) and sum-of-the-parts (`06`) corroborate the direction but are each individually too fragile (a 77.1%-of-EV terminal value; a comp-selection-driven ~2x dispersion) to lead. The single biggest swing factor between bull and bear is **margin durability under the SG&A-leverage reversal already visibly underway (+63bps off the FY2025 low) combined with decelerating bookings growth (+20.4%→+12.2% YoY over the last eight quarters)** — both move the same direction in a downturn per `earnings/07_earnings-sensitivity.md` §5, which is exactly why the bear case widens the operating miss beyond a simple linear sensitivity estimate.
