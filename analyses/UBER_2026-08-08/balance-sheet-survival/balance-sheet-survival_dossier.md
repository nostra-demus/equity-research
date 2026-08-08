# balance-sheet-survival Module Dossier — UBER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `balance-sheet-survival_memo.md`.

- Generated: 2026-08-08T18:43:04Z
- Module folder: `balance-sheet-survival`
- Contents: 1 module synthesis + 7 specialist outputs = 8 files

## Table of Contents

- [balance-sheet-survival — module synthesis](#balance-sheet-survival-module-synthesis) — `99_balance-sheet-survival-synthesis.md`
- [balance-sheet-survival / 00_solvency-data-triage.md](#balance-sheet-survival-00-solvency-data-triage-md) — `00_solvency-data-triage.md`
- [balance-sheet-survival / 01_capital-structure-and-leverage.md](#balance-sheet-survival-01-capital-structure-and-leverage-md) — `01_capital-structure-and-leverage.md`
- [balance-sheet-survival / 02_maturity-wall-and-refinancing.md](#balance-sheet-survival-02-maturity-wall-and-refinancing-md) — `02_maturity-wall-and-refinancing.md`
- [balance-sheet-survival / 03_liquidity-runway.md](#balance-sheet-survival-03-liquidity-runway-md) — `03_liquidity-runway.md`
- [balance-sheet-survival / 04_coverage-and-covenants.md](#balance-sheet-survival-04-coverage-and-covenants-md) — `04_coverage-and-covenants.md`
- [balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md](#balance-sheet-survival-05-off-balance-sheet-and-contingencies-md) — `05_off-balance-sheet-and-contingencies.md`
- [balance-sheet-survival / 06_downside-stress-test.md](#balance-sheet-survival-06-downside-stress-test-md) — `06_downside-stress-test.md`


---

## balance-sheet-survival — module synthesis

_Source: `99_balance-sheet-survival-synthesis.md`_

# Balance-Sheet-Survival Module — UBER (Synthesis)

## Abstract

Uber carries low net leverage of 1.08x (net debt $8,075M / LTM reported EBITDA $7,474M, strict basis), but the trend has reversed since December 2025 — new borrowing plus $6.9bn of trailing buybacks have pushed net debt up from $5,197M — and the picture is about to change materially. The next-24-month maturity wall ($3,324M) is covered 1.6x by cash alone; the real 2028 wall ($3,049M) is refinanceable given a BBB+ rating and demonstrated market access. Liquidity is a standing surplus (committed liquidity $10,391M plus $10.1bn TTM free cash flow against $2,778M of 12-month obligations), and no numeric covenant is disclosed, so headroom is Not assessable — the labeled 4.0x leverage assumption only breaks at a 73% EBITDA decline. The unresolved question is the pending, debt-funded Delivery Hero acquisition, which would roughly triple pro-forma leverage. Verdict: Solid, with a flagged pending-acquisition caveat.

## 1. Solvency Verdict

- **Verdict:** Solid
- **Net leverage (net debt / EBITDA):** 1.08x on the strict basis (net debt $8,075M ÷ LTM reported EBITDA $7,474M, twelve months ended Jun-30-2026) [`01` §5/§7]. Gross debt / EBITDA: 1.73x ($12,945M ÷ $7,474M). Broad-basis net debt (also netting $521M short-term investments): $7,554M (0.92x [Adj. EBITDA, stale] / 1.01x [reported]).
- **Liquidity runway:** No finite runway — annual surplus. Committed liquidity $10,391M (cash $4,870M + short-term investments $521M + fully-available, undrawn $5.0bn revolver) covers the sole 12-month obligation ($2,000M Term Loan, Dec-2026) 5.2x over before FCF is touched; TTM FCF ($10,116M) alone covers it 5.1x over [`03` §3–§4].
- **Maturity wall (% within 24 months):** 25.7% ($3,324M of $12,945M gross debt) — the $2,000M Dec-2026 Term Loan plus the $1,324M May-2028 Exchangeable Notes. The true single-year wall is 2028 ($3,049M, 23.5% of total) [`02` §1–§2].
- **Tightest covenant + headroom:** Not assessable — no numeric maintenance-covenant threshold is disclosed for the Term Loan, Revolver, or any Senior Notes indenture; only qualitative "in compliance with all covenants" language exists [`04` §2]. A labeled, indicative 4.0x max-net-leverage assumption shows +73.0% headroom, but this is not a scored figure.
- **Stress break point (EBITDA decline that breaks it):** On the as-reported balance sheet, nothing breaks at −30%, −40%, or −60% EBITDA (leverage tops out at 2.70x, coverage stays above 7x, liquidity stays a multi-billion-dollar surplus in every column). The labeled 4.0x covenant assumption would first break at a 73.0% EBITDA decline [`06` §2–§3]. Liquidity does not exhaust on an EBITDA decline alone (solve returns h≈300%, i.e., no finite breach) [`06` §3].
- Solvency strength /100: **70** (cap: max 75 — off-balance-sheet exposures undisclosed for a known-litigious/levered name, per `05`)
- Liquidity runway /100: **88**
- Refinancing risk /100 *(higher = worse)*: **30** (low as-reported risk; elevated by the unresolved Delivery Hero bridge conversion)
- Covenant headroom /100 *(or "Not assessable")*: **Not assessable**
- Downside resilience /100 *(or "Not assessable")*: **78**
- Data quality /100: **82**
- Overall usefulness /100: **75** (cap: max 75 — no covenant disclosure)
- Biggest solvency risk (one line): The pending, not-yet-closed Delivery Hero acquisition — funded by a €14.2bn bridge facility signed 2026-07-16 — would roughly double gross debt and lift pro-forma net leverage from 1.08x to ~3.3x on day one, rising toward ~5.5x under a −40% EBITDA haircut, on a covenant package this data pool does not yet disclose [`01` §5; `06` §2a].

## 1A. Module Disconfirmation

- **Strongest bear point:** Net debt rose from $5,197M (Dec-31-2025) to $8,075M (Jun-30-2026) — a reversal of three straight years of deleveraging — driven by a new $2.0bn Term Loan draw and $3.5bn of buybacks in six months, and this precedes a €14.2bn bridge facility that would roughly triple pro-forma leverage to ~3.3x with an undisclosed covenant package [`01` §6; `06` §2a].
- **Strongest bull point:** As-reported, Uber is BBB+ rated (S&P, ranked #1 solvency in its comp set), carries 1.08x net leverage, covers interest 17.9x, and survives a −60% EBITDA haircut with no covenant breach and a multi-billion-dollar liquidity surplus in every stress column, with the next-24-month wall covered 1.6x by cash alone [`03` §5; `04` §1; `06` §2, §4].
- **Single killer risk:** The Delivery Hero bridge converting to permanent debt on unfavorable, undisclosed terms right before or during an EBITDA downturn — Uber has no interest-rate hedge on its existing floating exposure and no disclosed change-of-control/cross-default provisions to gauge how the new financing interacts with the existing debt stack [`02` §3; `00` §3].
- **Disconfirming evidence already visible:** Management has already demonstrated large-scale market access in 2026 (a $3.0bn Term Loan in June, a €14.2bn bridge in July) and states it expects to term out the bridge into permanent facilities and replace the revolver in Q3 2026 — evidence against a disorderly-refinancing scenario, though the resulting terms remain undisclosed [`02` §4; `01` §5].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| solvency-data-triage | Sufficient — full debt note, maturity schedule, and cash flow statements available; only numeric covenant thresholds are missing | Data pool supports the full module except covenant precision; pending Delivery Hero bridge financing is a subsequent event not yet on the balance sheet |
| capital-structure-and-leverage | Net leverage 1.08x (strict), gross 1.73x — low in absolute terms, but net debt has risen from $5,197M to $8,075M since Dec-31-2025 | The recent leverage rise is capital-allocation-driven (buybacks + new borrowing), not an operating decline; pro-forma Delivery Hero financing would roughly double gross debt |
| maturity-wall-and-refinancing | Self-funded / low refi risk — the true wall is 2028 ($3,049M), fully covered by cash alone, well ahead of maturity | The headline 3.64%/3.82% blended coupon understates true refi cost (a quarter of debt is near-zero-coupon convertible paper); real step-up on plain notes is ~60-90bps, not 140bps |
| liquidity-runway | No finite runway — $8.1bn annual FCF surplus after the only 12-month obligation | ~100% of the 12-month runway is already-in-hand liquidity, not dependent on FCF materializing |
| coverage-and-covenants | Coverage very wide (17.9x EBITDA/interest, 6.5x fixed-charge); covenant headroom Not assessable | No numeric maintenance covenant is disclosed anywhere in the pool for any instrument — only qualitative compliance language |
| off-balance-sheet-and-contingencies | Quantified contingent exposure (~$3.66bn max / $1.8bn recognized, ~13.0% of equity) sits below the module's spike threshold | The $1.8bn UK VAT (HMRC) receivable, already paid in cash, is the single largest live exposure and would become an impairment of ~6.4% of equity if the appeal fails |
| downside-stress-test | Survives −30%/−40%/−60% EBITDA declines with no covenant breach and a liquidity surplus throughout | Breaks only at a 73% EBITDA decline on the labeled covenant assumption; pro-forma Delivery Hero leverage (~3.3x day one, ~5.5x at −40%) is the one scenario this report cannot resolve |

## 3. Reconciliation

No material disagreements on direction between specialists. Two basis differences were already reconciled within the module and are restated here for completeness:
- **Net debt scope.** `01` (this module's canonical basis, strict: debt + finance leases − cash) computes $8,075M; `earnings/01_historical-financials.md` computes $9,861M on an operating-lease-inclusive basis. The $1,786M gap is fully explained by scope (operating leases included vs. excluded), not a data error — `01` designates the $8,075M figure canonical for this module [`01` §4].
- **Refinancing cost step-up.** The blended weighted-average coupon (3.82% effective) implies a headline step-up of ~140bps versus current market rates, but a quarter of the debt stack is near-zero-coupon convertible/exchangeable paper priced for its equity-linked feature, not credit risk. Stripping those instruments out, the real step-up on plain Senior Notes is ~60-90bps — `02` treats the lower figure as the operative read [`02` §3].

Both `01` and `business-model/11_capital-allocation-governance.md` independently characterize the pro-forma Delivery Hero gross-debt impact as "roughly double" — this is a cross-module confirmation, not a disagreement.

## 3A. Fragility Map (what breaks first)

| Fragility Driver | Indicator | Current Status | Why It Matters |
|---|---|---|---|
| Maturity concentration | % due within 24m | 25.7% ($3,324M); true single-year wall is 2028 at 23.5% | Wall risk — but fully covered by cash on hand alone today |
| Availability liquidity | usable liquidity vs uses | $10,391M vs $2,778M (12-month gross obligations) — 3.7x covered | Revolver is commitment-based (not borrowing-base) and fully available, so headline liquidity is not overstated |
| Covenant illusion risk | covenant EBITDA vs reported | Undisclosed — no covenant-EBITDA definition or addback list exists in the pool | True headroom quality cannot be judged; labeled +73.0% assumption may not reflect a real threshold |
| Floating-rate sensitivity | floating % net of hedges | 15.4% ($2,000M Term Loan), unhedged — no interest-rate swap/cap disclosed | +200bp shock adds only ~$40M/yr interest — immaterial against $10.1bn TTM FCF, but a live, unhedged position |
| Structural subordination | HoldCo debt vs upstreaming | Not applicable — single public parent is direct obligor on all instruments except the 2029 Senior Notes (subsidiary-guaranteed) | No classic HoldCo/OpCo trapped-cash risk |
| Contingent accelerants | CoC puts / cross-default | Not disclosed for any instrument — only generic risk-factor language | Cannot rule out a hidden accelerant; also unknown for the new Delivery Hero bridge/permanent financing |

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No debt maturity schedule | N | Solvency strength | Not applicable — full maturity schedule disclosed (10-K Note 8, 10-Q Note 5) |
| No covenant disclosure | **Y** | Covenant headroom; Overall usefulness | Covenant headroom = Not assessable; Overall usefulness max 75 |
| No cash flow statement | N | Liquidity runway | Not applicable — full annual and quarterly cash flow statements available |
| Only annual data (no interim) | N | Solvency strength | Not applicable — Q1 and Q2 FY2026 10-Qs are in the pool |
| No EBITDA base (stress not run) | N | Downside resilience | Not applicable — stress test ran fully on a cash-backed EBITDA base |
| Off-balance-sheet exposures undisclosed for known-litigious/levered name | **Y** | Solvency strength | max 75 |
| Revolver exists but availability unknown | N | Liquidity runway | Not applicable — $5.0bn commitment-based revolver, $0 drawn, availability fully disclosed |
| Covenant headroom relies on assumed covenant-EBITDA addbacks | N (headroom already marked Not assessable, not scored numerically) | Covenant headroom | n/a — superseded by the "no covenant disclosure" cap above |
| HoldCo has material debt but upstreaming constraints unclear | N | Solvency strength | Not applicable — no HoldCo/OpCo structure exists |

If multiple caps affect the same score: Solvency strength is capped at 75 by the off-balance-sheet trigger; Overall usefulness is capped at 75 by the no-covenant-disclosure trigger. Both scores above are set at or below their respective caps.

## 5. Survival Summary

Uber is lightly levered in absolute terms (1.08x net debt/EBITDA, strict basis) and well-rated (S&P BBB+, ranked #1 solvency among its comp set), but the leverage trend has reversed over the last two quarters — net debt rose from $5,197M to $8,075M as new borrowing and $6.9bn of trailing buybacks outpaced cash generation, even though operating EBITDA itself grew 42.9% year-on-year. The near-term maturity wall is self-funded, not refinancing-dependent: the only 12-month obligation ($2,000M) is covered nearly three times by cash and short-term investments alone, and the larger 2028 wall ($3,049M) sits far enough out, and the company generates enough free cash flow ($10.1bn TTM), to be refinanceable in ordinary market conditions. The liquidity runway is not a countdown — it is a standing multi-billion-dollar surplus — and no numeric covenant is disclosed close enough to sizeable stress to be a live constraint on the current debt stack: even a 73% EBITDA collapse (a labeled, indicative assumption, not a disclosed threshold) is required to reach the tightest covenant proxy tested. A normal-recession-scale EBITDA decline of 30-40% is comfortably survivable on the as-reported balance sheet with no waiver, asset sale, or equity raise required. The one variable this module cannot resolve is the pending, debt-funded Delivery Hero acquisition: if the €14.2bn bridge converts to permanent financing at scale, pro-forma leverage jumps to roughly 3.3x on day one and toward 5.5x under the same −40% EBITDA haircut that the as-reported structure absorbs easily — a materially different, and currently unquantifiable, survival picture.

## 6. What Would Change The Solvency Verdict?

| Current Verdict | What Would Strengthen It | What Would Weaken It | Data Needed |
|---|---|---|---|
| Solid | A disclosed numeric covenant package confirming wide headroom; Delivery Hero permanent financing closing at a leverage-neutral or leverage-reducing structure (e.g., partial equity funding, asset sales offsetting the bridge); resumed net-debt reduction | The Delivery Hero bridge converting to permanent debt at or near its full €14.2bn size with no offsetting deleveraging; a credit-rating downgrade (which would mechanically raise Revolver pricing); an adverse UK VAT appeal ruling triggering the ~$1.8bn receivable impairment; continued buyback-driven net-debt growth into a downturn | The actual credit agreement / bond indenture covenant package (numeric thresholds, covenant-EBITDA definition); the permanent financing terms and covenant package for the Delivery Hero deal once negotiated; Delivery Hero's own standalone EBITDA and net debt |

## 6A. Survival Playbook (non-speculative levers)

- **Discretionary buyback suspension.** Uber's $20.0bn Share Repurchase Program (July 2025, $15.7bn remaining as of Jun-30-2026) explicitly does not obligate any specific repurchase amount and is "determined at the discretion of... management" — the $6.9bn TTM run-rate could be slowed or stopped without breaching any obligation [`03` §2].
- **No dividend to cut.** Uber pays no dividend in its reported history (2016-LTM), so there is no dividend lever to pull, but also no dividend constraint on cash preservation [`03` §2; `business-model/11`].
- **Capex flexibility.** Total capex is $308M TTM (~0.6% of TTM revenue) — an asset-light marketplace with limited fixed capital intensity gives room to defer discretionary spend if needed [`03` §2].
- **Demonstrated refi/market access.** A $3.0bn Term Loan Credit Agreement (June 2026) and a €14.2bn bridge credit agreement (July 2026) were both executed within the last two months of the reporting period — evidence of current, at-scale market access, not merely a rating opinion [`02` §4].
- **Undrawn $5.0bn revolver as a backstop.** Fully committed, commitment-based (no borrowing-base mechanism), $0 drawn as of Jun-30-2026 [`03` §1].

No evidence of a prior covenant-amendment request or waiver in the data pool — this lever is untested for Uber.

## 7. Note To The Final Synthesizer

- Net leverage is low and the credit rating is investment-grade (BBB+), but the direction has reversed: net debt rose from $5,197M (Dec-31-2025) to $8,075M (Jun-30-2026), strict basis, driven by new borrowing and buybacks, not an operating decline (LTM EBITDA is up 42.9% YoY).
- The maturity wall is self-funded: the only 12-month obligation ($2,000M) is covered nearly 3x by cash alone; the true wall (2028, $3,049M) is refinanceable given demonstrated 2026 market access (a $3.0bn Term Loan, a €14.2bn bridge) and a modest estimated refi step-up of ~60-90bps on plain notes.
- The liquidity runway is a standing surplus, not a countdown: committed liquidity ($10,391M) plus TTM FCF ($10,116M) cover 12-month obligations ($2,778M) 6.9x over combined; the runway depends almost entirely on liquidity already in hand, not on FCF materializing.
- No numeric covenant is disclosed for any instrument (Term Loan, Revolver, or Senior Notes indentures) — only qualitative "in compliance" language. Covenant headroom is Not assessable; a labeled 4.0x max-leverage assumption shows +73.0% headroom but is indicative only.
- The largest live off-balance-sheet / contingent exposure is the $1.8bn UK VAT (HMRC) receivable — cash Uber already paid between 2023-2025 to pursue an appeal it expects to win; if the appeal fails, this becomes an impairment of ~6.4% of equity. The broader quantified contingent-exposure ratio (~$3.66bn max vs. $1.8bn recognized, ~13.0% of equity) sits below this module's mechanical spike threshold — no RF-OBS-001 (contingent-liability spike) tag was fired.
- The stress break point: on the as-reported balance sheet, nothing breaks at −30%, −40%, or −60% EBITDA declines (leverage tops out at 2.70x; the labeled covenant assumption would need a 73% decline to breach; liquidity never exhausts on EBITDA decline alone).
- Uber is not net cash — it carries $8,075M of net debt (strict basis) — so the §24 Filter 3 counter-cyclical-optionality read does not apply here; net leverage is nonetheless low (1.08x) and coverage is wide (17.9x).
- Partial-data cap applied: no numeric covenant disclosure limits covenant headroom to "Not assessable" and caps Overall usefulness at 75; off-balance-sheet exposures undisclosed for a known-litigious name cap Solvency strength at 75.
- Biggest missing data point (single highest-value next data request): the actual credit agreement / bond indenture text (or a rating-agency credit opinion quoting the covenant package), which would supply the numeric covenant threshold and covenant-EBITDA definition this pool discloses only qualitatively.
- **Explicit handoff:** the master synthesizer's "Balance Sheet and Survival Test" section should defer to this synthesis; the stress break points here (73% EBITDA decline to the labeled covenant proxy; no finite liquidity-exhaustion point; pro-forma Delivery Hero leverage of ~3.3x day one / ~5.5x at −40% EBITDA) are the inputs for the master's downside scenario and risk register — the master assigns probabilities, not this module.

## 8. Simple Summary

- Uber carries $12,945M of gross debt and $8,075M of net debt against $7,474M of LTM EBITDA — a net leverage ratio of 1.08x, low but rising over the last two quarters.
- The maturity wall's biggest single year is 2028 ($3,049M, 23.5% of debt); the only debt due in the next 12 months ($2,000M) is covered nearly 3x by cash on hand alone.
- Liquidity is not a countdown — it is a standing $8.1bn/year surplus after covering the only near-term obligation.
- No numeric covenant threshold is disclosed anywhere in the pool, so how close the tightest covenant is to breaking cannot be measured precisely; a labeled indicative assumption shows wide (+73%) headroom.
- The biggest off-balance-sheet exposure is a $1.8bn UK VAT (HMRC) receivable already paid in cash, at risk of write-off if Uber's appeal fails.
- Uber survives a 30-60% drop in earnings with no covenant breach and no cash shortfall on the current balance sheet; it would take a ~73% earnings collapse to threaten the (labeled, not disclosed) covenant level tested.
- An S&P credit rating (BBB+) was available, but the actual bond/loan covenant terms were not — that gap is the single biggest missing input.
- This module is useful for the master synthesizer: it delivers a full debt stack, maturity wall, liquidity runway, and stress test, with the one open question — the pending, debt-funded Delivery Hero acquisition — clearly flagged rather than guessed at.



---

## balance-sheet-survival / 00_solvency-data-triage.md

_Source: `00_solvency-data-triage.md`_

# Solvency Data Triage — UBER

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified (sync date, not authoritative — see note) | Solvency Relevance |
|---|---|---|---|---|
| Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | Annual filing (10-K) | FY2025, period ended Dec-31-2025; filed Feb-13-2026 | Aug 8 2026 | High |
| Uber_Technologies_Inc_-_Form_10-Q(May-06-2026).doc | Quarterly filing (10-Q) | Q1 FY2026, period ended Mar-31-2026; filed May-06-2026 | Aug 8 2026 | High |
| Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Quarterly filing (10-Q) | Q2 FY2026, period ended Jun-30-2026; filed Aug-05-2026 | Aug 8 2026 | High |
| **Uber Technologies Inc NYSE UBER Financials_Annual.xls** (13 tabs, per `_pool_extracts/manifest.md`) | | | Aug 7 2026 | |
| — Key Stats | Vendor workbook tab | Annual series through FY2025 | | Medium |
| — Income Statement | Vendor workbook tab | Annual series through FY2025 | | High (EBITDA/EBIT/interest base) |
| — Balance Sheet | Vendor workbook tab | Annual series through FY2025 | | High |
| — Cash Flow | Vendor workbook tab | Annual series through FY2025 | | High |
| — Multiples | Vendor workbook tab | Annual series through FY2025 | | Low |
| — Historical Capitalization | Vendor workbook tab | Annual series through FY2025 | | Medium |
| — Capital Structure Summary | Vendor workbook tab | Annual series, incl. Net Debt/EBITDA, Total Debt/EBITDA, fixed/floating mix | | High |
| — Capital Structure Details | Vendor workbook tab | FY2025 & FY2024 as-reported instrument list ("Source: A 2025 filed Feb-13-2026") | | High (instrument-level debt stack) |
| — Ratios | Vendor workbook tab | Annual series through FY2025 | | Medium |
| — Supplemental | Vendor workbook tab | Annual series through FY2025 | | Low |
| — Industry Specific | Vendor workbook tab | Annual series (rideshare operating stats) | | Low |
| — Pension OPEB | Vendor workbook tab | "No Data Available" — Uber discloses no defined-benefit pension/OPEB plan | | N/A (immaterial for this company, not a gap) |
| — Segments | Vendor workbook tab | Annual series through FY2025 | | Medium (asset-sale capacity read) |
| **Uber Technologies Inc NYSE UBER Financials_Quarterly.xls** (13 tabs) | | | Aug 7 2026 | |
| — Key Stats | Vendor workbook tab | Quarterly series Q1 FY2018 – Q2 FY2026 (Jun-30-2026) | | Medium |
| — Income Statement | Vendor workbook tab | Quarterly series through Jun-30-2026 | | High |
| — Balance Sheet | Vendor workbook tab | Quarterly series through Jun-30-2026 (most recent balance sheet in the pool) | | High |
| — Cash Flow | Vendor workbook tab | Quarterly series through Jun-30-2026 | | High |
| — Multiples | Vendor workbook tab | Quarterly series through Jun-30-2026 | | Low |
| — Historical Capitalization | Vendor workbook tab | Quarterly series through Jun-30-2026 | | Medium |
| — Capital Structure Summary | Vendor workbook tab | Quarterly series Q1 FY2018 – Q2 FY2026, incl. credit ratios, fixed/floating split, WAM inputs | | High |
| — Capital Structure Details | Vendor workbook tab | FY2025 & FY2024 as-reported instrument list ("Source: Q1 2026 filed May-06-2026" — one quarter stale vs. the pool's own Q2 FY26 10-Q; primary filing used instead, see §3 note) | | High |
| — Ratios | Vendor workbook tab | Quarterly series through Jun-30-2026 | | Medium |
| — Supplemental | Vendor workbook tab | Quarterly series through Jun-30-2026 | | Low |
| — Industry Specific | Vendor workbook tab | Quarterly series | | Low |
| — Pension OPEB | Vendor workbook tab | "No Data Available" | | N/A |
| — Segments | Vendor workbook tab | Quarterly series through Jun-30-2026 | | Medium |
| **Company Comparable Analysis Uber Technologies Inc.xls** (8 tabs) | | | Aug 6 2026 | |
| — Financial Data | Vendor workbook tab | LTM/peer comp set, as-of 2026-08-06 | | Low |
| — Trading Multiples | Vendor workbook tab | As-of 2026-08-06 | | Low |
| — Operating Statistics | Vendor workbook tab | As-of 2026-08-06 | | Low |
| — Business Description | Vendor workbook tab | Static company description | | Low |
| — Implied Valuation | Vendor workbook tab | As-of 2026-08-06 | | Low (valuation, out of scope) |
| — Valuation Chart | Vendor workbook tab | As-of 2026-08-06 | | Low |
| — Credit Health Panel | Vendor workbook tab | As-of 2026-08-06; LTM ending Jun-30-2026; **includes S&P Issuer Credit Rating (Foreign Currency, LT) = BBB+ for UBER** and peer solvency/liquidity 1–4 scores | | High (only rating-agency-sourced credit rating in the pool) |
| — Disclaimer | Vendor workbook tab | Static legal text | | Low |
| **UberTechnologies,IncNYSEUBEREstimatesReport.xls** (7 tabs) | | | Aug 6 2026 | |
| — Consensus | Vendor workbook tab | Current FY end Dec-31-2026; consensus as of report date | | Low (earnings/valuation input, not solvency) |
| — Recent Changes | Vendor workbook tab | " | | Low |
| — Guidance | Vendor workbook tab | " | | Low |
| — Multiples | Vendor workbook tab | " | | Low |
| — Surprise | Vendor workbook tab | " | | Low |
| — Trends | Vendor workbook tab | " | | Low |
| — Revisions | Vendor workbook tab | " | | Low |
| **UberTechnologies,IncNYSEUBEREstimatesReport (1).xls** (7 tabs) | Duplicate export of the file above — identical content, different filename/timestamp; not a second data point | | Aug 8 2026 | Low |
| — Consensus / Recent Changes / Guidance / Multiples / Surprise / Trends / Revisions | Vendor workbook tab (duplicate) | Same as above | | Low |
| **Short Iinterest_12m_Uber.xls** (2 tabs) | | | Aug 8 2026 | |
| — Chart 1 with Data | Vendor workbook tab | Daily short-interest series through 2026-08-07 | | Low (not solvency-relevant) |
| — Attributions | Vendor workbook tab | Static | | Low |
| **Uber Technologies Inc NYSE UBER Events Calendar.xls** (1 tab) | | | Aug 8 2026 | |
| — Events Calendar | Vendor workbook tab | Calendar-year 2026 (earnings dates, conferences) | | Low |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | Company profile export | Point-in-time (current at report pull) | Aug 6 2026 | Low |
| Uber Technologies Inc NYSE UBER Board Members.rtf | Company profile export | Point-in-time | Aug 6 2026 | Low (governance, not solvency) |
| Uber Technologies Inc NYSE UBER Customers.rtf | Company profile export | Point-in-time | Aug 7 2026 | Low |
| Uber Technologies Inc NYSE UBER Key Developments.rtf | Company profile / news-event export | Rolling news log through Aug 2026 (covers Getir close, pending Delivery Hero and Blacklane deals) | Aug 7 2026 | Medium (corroborates M&A/financing events also in the 10-Q) |
| Uber Technologies Inc NYSE UBER Products.rtf | Company profile export | Point-in-time | Aug 6 2026 | Low |
| Uber Technologies Inc NYSE UBER Professionals.rtf | Company profile export | Point-in-time | Aug 6 2026 | Low |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | Company profile export | Point-in-time | Aug 8 2026 | Low |
| Uber Technologies Inc NYSE UBER Suppliers.rtf | Company profile export | Point-in-time | Aug 7 2026 | Low |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | CIQ overview/landscape report | Point-in-time, current as of Aug 2026 | Aug 6 2026 | Low/Medium (company overview; no incremental debt detail beyond the filings) |
| Uber Technologies, Inc., Q1 2026 Earnings Call, May 06, 2026.rtf | Earnings transcript | Q1 FY2026 (period ended Mar-31-2026) | Aug 7 2026 | Medium |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | Earnings transcript | Q2 FY2026 (period ended Jun-30-2026) | Aug 7 2026 | Medium |

**Note on "Last Modified":** all files carry an Aug 6–8 2026 sync timestamp (this data pool was synced/refreshed this week), which is a Drive-sync date, not the document's actual period — the authoritative period for every row above was parsed from inside each document (filing cover page / "as of" / fiscal-period column headers), per CLAUDE.md §27 fix F23.

**Extraction status:** `_pool_extracts/manifest.md` reports 7 workbooks → 51 tabs, 65 total extract files, **0 failures**. No file in `manifest.json` carries `status: fail`, `fallback-text`, or `missing-dependency`. No `ciq_facts.json` sidecar exists for this run — this triage and all downstream agents use their own sourced read of the extracts, per the runtime instructions.

**No `data/UBER/external/` folder exists** — no externally sourced research in this pool. Section 1A is omitted.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, vs 2026-08-08) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Uber FY2025 10-K (Feb-13-2026) | FY2025, period ended Dec-31-2025 | ~8.1 (period-end) / ~6.8 (filing date) |
| Quarterly filing | Uber Q2 FY2026 10-Q (Aug-05-2026) | Period ended Jun-30-2026 | ~1.3 (period-end) / ~0.1 (filing date) |
| Debt / capital-structure export | CIQ Financials_Quarterly.xls → Capital Structure Details tab | FY2025/FY2024 as-reported instrument list, tab refreshed off the Q1 FY26 10-Q (filed May-06-2026) | ~3.2 (one quarter stale vs. the Q2 FY26 10-Q text, which this triage treats as the primary, more current debt-note source per §4) |
| Fixed-income / maturities export | Uber FY2025 10-K, Note 8 (Long-Term Debt and Credit Arrangements) — future-principal-payments table | As of Dec-31-2025 | ~8.1 |
| Cash flow statement | CIQ Financials_Quarterly.xls → Cash Flow tab; Uber Q2 FY2026 10-Q, condensed statement of cash flows | Six months ended Jun-30-2026 | ~1.3 |
| Covenant / credit-agreement disclosure | Uber Q2 FY2026 10-Q, Note 5 (Debt and Credit Arrangements) — qualitative "in compliance with all covenants" language; no numeric thresholds disclosed | As of Jun-30-2026 | ~1.3 |
| Credit rating report | Company Comparable Analysis Uber Technologies Inc.xls → Credit Health Panel tab (S&P Issuer Credit Rating, Foreign Currency LT = BBB+) | As-of 2026-08-06 | ~0.1 |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | CIQ Financials_Quarterly.xls → Balance Sheet (Jun-30-2026 column); cross-checked to Uber Q2 FY2026 10-Q, condensed balance sheet | Debt, cash, equity base |
| Debt note (amounts by type) | Y | Uber Q2 FY2026 10-Q, Note 5 (Debt and Credit Arrangements) — 2028 Convertible Notes, 2028 Exchangeable Senior Notes, 2029–2054 Senior Notes, 2026 Term Loan, Commercial Paper, Revolving Credit Agreement, finance/operating leases, each itemized; corroborated by CIQ Capital Structure Details tab | The debt stack and seniority |
| Maturity schedule | Y | Uber FY2025 10-K, Note 8 — "future principal payments for our long-term debt as of December 31, 2025" table by year; CIQ Capital Structure Details tab (per-instrument maturity dates) | The maturity wall and refinancing exposure |
| Cash flow statement | Y | CIQ Financials_Quarterly.xls / Financials_Annual.xls → Cash Flow tabs; Uber FY2025 10-K and Q2 FY2026 10-Q, condensed consolidated statements of cash flows | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y | Uber Q2 FY2026 10-Q: $5.0bn revolving credit agreement (undrawn — $0 outstanding as of Jun-30-2026, maturing Sep-26-2029); $3.0bn Term Loan Credit Agreement (June 2026) — $2.0bn drawn, $1.0bn remaining commitment; letters of credit outstanding disclosed separately | True liquidity beyond cash |
| Interest expense detail | Y | Uber Q2 FY2026 10-Q, Note 5 — interest expense on convertible notes stated separately; CIQ Income Statement tab carries a consolidated interest-expense line | Coverage ratios |
| Covenant disclosure | **Partial** | Uber FY2025 10-K / Q2 FY2026 10-Q state "customary covenants... certain financial covenants specified in the indentures. We were in compliance with all covenants" for the Senior Notes indentures, the Term Loan Credit Agreement, and the Revolving Credit Agreement — compliance status is disclosed, but no numeric covenant thresholds (e.g., a stated max-leverage ratio) appear anywhere in the pool | Headroom to a breach |
| Lease detail (operating/finance) | Y | Uber FY2025 10-K — operating lease ROU assets/liabilities (current & non-current) and finance leases separately disclosed, with lease cost and weighted-average term/discount rate; CIQ Capital Structure Details tab carries both as separate line items | Debt-like obligations |
| Pension / OPEB funded status | N/A | CIQ Financials_Annual.xls & Financials_Quarterly.xls → Pension/OPEB tabs: "No Data Available" | Uber discloses no defined-benefit pension/OPEB plan — immaterial for this company, not a data gap |
| Commitments & contingencies note | Y | Uber Q2 FY2026 10-Q, Note 11 (Commitments and Contingencies) — letters of credit, non-income tax contingencies (VAT/GST/driver-classification disputes across jurisdictions, incl. UK HMRC pay-to-play appeal), legal proceedings | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Y | Company Comparable Analysis Uber Technologies Inc.xls → Credit Health Panel tab: S&P Issuer Credit Rating (Foreign Currency, LT) = BBB+, as-of 2026-08-06 | Refinancing access and cost |
| EBITDA base (for stress test) | Y | `earnings/01_historical-financials.md` — FY2025 reported EBITDA $6,284M and company-disclosed Adjusted EBITDA $8,730M (reconciled); TTM Jun-30-2026 reported EBITDA $7,474M, cross-checked between CIQ quarterly and annual "LTM" columns. **Flag:** Uber discontinued consolidated non-GAAP "Adjusted EBITDA" disclosure after FY2025 (Q1/Q2 FY2026 filings and transcripts do not use the term) — FY2025's $8,730M is the last disclosed Adjusted EBITDA figure in the pool | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | Uber FY2025 10-K, cover page and Item 1 — operating company (Mobility/Delivery/Freight platform), not a bank, insurer, or REIT; no HoldCo/OpCo structure disclosed (single public parent, with only the 2029 Senior Notes carrying subsidiary guarantees) | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | Y | Uber Q2 FY2026 10-Q — $5.0bn Revolving Credit Agreement, unsecured, not guaranteed by subsidiaries, matures Sep-26-2029, $0 drawn as of Jun-30-2026 (no borrowing-base mechanism disclosed — commitment-based, not asset-based) | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | N | Not disclosed anywhere in the pool — the indentures/credit agreements are referenced only as "certain financial covenants specified in the indentures," with no covenant-EBITDA definition, addback list, or addback cap disclosed | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | N/A | No HoldCo/OpCo structure exists — Uber Technologies, Inc. is the single public filer and primary obligor on essentially all debt; only the 2029 Senior Notes carry limited subsidiary guarantees (no structural subordination pattern found) | Structural subordination and upstreaming — not applicable to this issuer |
| Hedging / swaps disclosure | Partial | Uber FY2025 10-K, Note 3 (Derivative and Hedging Instruments) — FX forward contracts / cash-flow hedges are disclosed in detail; **no interest-rate swap or hedge is disclosed** against the floating-rate exposure on the Term Loan and Revolving Credit Agreement | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | N | Not disclosed in the data pool for the debt instruments specifically — only generic anti-takeover corporate-governance provisions (charter/bylaws) are described; no change-of-control put, cross-default, or rating-trigger pricing step is disclosed for any bond, term loan, or revolver in the pool | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

All six cross-module files exist under `analyses/UBER_2026-08-08/business-model/` and `analyses/UBER_2026-08-08/earnings/` (both modules ran their full agent rosters, including `99_*-synthesis.md`). Per MODULE_RULES.md, valuation is intentionally NOT read as a cross-module input by this module (it runs in parallel / after); a prior-dated valuation run exists at `analyses/UBER_2026-08-06/valuation/` but is out of scope here.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | 10-K cover page; NYSE:UBER throughout Capital IQ exports |
| Exchange | NYSE | 10-K cover page; ticker "NYSE:UBER" on all CIQ exports |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | 10-K, 10-Q forms filed with the SEC |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | FY2025 10-K auditor's report: "in conformity with accounting principles generally accepted in the United States of America" |
| Reporting currency (USD / INR / …) | USD | All financial statements in FY2025 10-K and Q1/Q2 FY2026 10-Qs stated in US dollars; CIQ exports labeled "Reported Currency" = USD |
| Document language(s) | English (all documents in the pool) | 10-K, 10-Qs, transcripts, and all CIQ exports are in English; no non-English filing present in this pool |

No jurisdiction-mapping adjustment is needed — Uber is a standard US SEC filer. Downstream agents should cite the 10-K/10-Q by form name and note, and the CIQ export by tab name, per the module's Evidence Citation Format.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N | 02, 06 | Not applicable — a maturity schedule exists (10-K Note 8; CIQ Capital Structure Details) |
| No covenant disclosure | **Y (partial)** | 04, 06 | Covenant *existence and compliance status* are disclosed, but the numeric threshold and the covenant-EBITDA definition (addbacks/caps) are not — per Score Cap Rules, covenant headroom cannot be computed as a signed % distance to breach; treat quantitative headroom as "Not assessable," report only qualitative compliance status; Overall usefulness max 75; if any covenant-based headroom figure is estimated, it must rely on a labeled assumed covenant-EBITDA definition and Covenant headroom max 60 |
| No cash flow statement | N | 03, 04, 06 | Not applicable — a full cash flow statement (annual and quarterly) is available |
| No undrawn-facility disclosure | N | 03 | Not applicable — the $5.0bn revolver's $0-drawn / $5.0bn-available status and the Term Loan's $1.0bn remaining commitment are both disclosed |
| No interest-expense detail | N | 04 | Not applicable — interest expense is disclosed (consolidated, and separately for the convertible notes) |
| No EBITDA base | N | 06 | Not applicable — EBITDA base is available (see §3), though flag the FY2025→FY2026 Adjusted EBITDA disclosure discontinuity for `06_downside-stress-test` and `04_coverage-and-covenants` to use consistently-defined EBITDA across periods |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent balance sheet (through Jun-30-2026), an itemized debt note by type/seniority/maturity (10-K Note 8, 10-Q Note 5), and full annual and quarterly cash flow statements are all present in the pool, so leverage, liquidity, coverage, and the mandatory stress test can all be built; the only shortfall is the numeric covenant threshold, which caps covenant-headroom precision but does not block the module.
- **Sections that can run:** capital structure (01), maturity wall (02), liquidity runway (03), coverage/covenants (04, qualitative-compliance basis with headroom capped — see §5), off-balance-sheet and contingencies (05), downside stress test (06), and the module synthesis (99).
- **Active partial-data caps:**
  - Covenant headroom = "Not assessable" as a signed % distance to breach (no numeric threshold disclosed for the Senior Notes indentures, the Term Loan Credit Agreement, or the Revolving Credit Agreement) — report only the disclosed qualitative "in compliance with all covenants" status; Overall usefulness max 75; if `04` estimates a headroom figure using a labeled market-typical covenant assumption, Covenant headroom max 60.
- **Critical missing items:**
  - Numeric covenant thresholds (max leverage / min coverage, whichever type the indentures/credit agreements actually specify) — not disclosed anywhere in the pool.
  - Covenant-EBITDA definition and addback caps — not disclosed.
  - Change-of-control put / cross-default / rating-trigger provisions on the debt instruments — not disclosed (only generic anti-takeover charter/bylaw language exists, which is a different topic).
- **Single highest-value missing document:** The credit agreement / bond indenture itself (or a rating-agency credit opinion quoting its covenant package) — this would supply the numeric covenant threshold and covenant-EBITDA definition that the 10-K/10-Q disclose only qualitatively.

**Material item flagged for downstream agents (subsequent event, not yet on the balance sheet):** On 2026-07-16, Uber entered a business combination agreement to acquire Delivery Hero for €41.50/share cash (≈$14.8bn equity value for 100%), funded via existing cash plus a newly executed €14.2bn bridge credit agreement (also dated 2026-07-16); expected close is H2 2027. Uber also closed the ~$465M Getir delivery-business acquisition on 2026-07-01 and has a pending ~$550M Blacklane acquisition (agreement dated 2026-03-28, expected to close in 2026). None of this is reflected in the Jun-30-2026 balance sheet (all disclosed only in Note 15 – Subsequent Event and the MD&A of the Q2 FY2026 10-Q). `01_capital-structure-and-leverage` and `06_downside-stress-test` must treat the €14.2bn bridge facility as a pro-forma/contingent leverage event, not part of the current balance sheet, and state both the "as-reported" and "pro-forma-for-Delivery-Hero-financing" leverage picture.



---

## balance-sheet-survival / 01_capital-structure-and-leverage.md

_Source: `01_capital-structure-and-leverage.md`_

# Capital Structure & Leverage — UBER

Reporting standard: US GAAP. Reporting currency: US dollars (USD, millions unless stated). Fiscal year end: December 31. Uber Technologies, Inc. is a Delaware corporation, NYSE-listed, filing with the US SEC — 10-K/10-Q are its actual primary documents, not jurisdiction placeholders [FY25 10-K, cover page]. Balance-sheet figures below are as of June 30, 2026, the most recent balance sheet in the data pool [Q2 FY26 10-Q, Condensed Consolidated Balance Sheets], unless otherwise stated.

**Subsequent-event flag (not on this balance sheet).** On 2026-07-16 Uber signed a business combination agreement to acquire Delivery Hero SE for €41.50/share cash (implied ~$14.8bn equity value for 100%), and on the same date executed a €14.2 billion bridge credit agreement to help fund it; expected close is H2 2027 [Q2 FY26 10-Q, Note 15 – Subsequent Event and Liquidity and Capital Resources, p.23 region]. Uber also closed the ~$465M Getir delivery-business acquisition on 2026-07-01 and has a pending ~$550M Blacklane acquisition (agreed 2026-03-28) [Q2 FY26 10-Q; CIQ Key Developments export]. None of this is on the June 30, 2026 balance sheet used below. Every leverage figure in this report is therefore an **"as-reported" (pre-Delivery Hero-financing)** figure; §5 and §7 add the pro-forma picture the deal implies.

## 1. Debt Stack

All amounts are carrying values on the June 30, 2026 condensed consolidated balance sheet unless noted. Uber has no HoldCo/OpCo structure — Uber Technologies, Inc. (the public parent) is the direct obligor on every instrument below; only the 2029 Senior Notes carry subsidiary guarantees (see §6A) [Q2 FY26 10-Q, Note 5].

| Instrument | Amount | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| 2026 Term Loan (current portion = short-term debt) | $2,000M drawn ($1.0bn of the $3.0bn commitment undrawn/expired Aug-2-2026) | Uber Technologies, Inc. (parent, sole obligor) | No — unsecured | Senior | None | December 2026 | Floating — Term SOFR + 0.825%; stated 4.46%, effective 4.8% | Q2 FY26 10-Q, Note 5 |
| 2028 Convertible Notes | $1,725M | Uber Technologies, Inc. (parent) | No — unsecured | Senior; indenture has no financial/operating covenants | None | December 2028 | Fixed 0.875%; effective 1.1% | Q2 FY26 10-Q, Note 5 |
| 2028 Exchangeable Senior Notes | $1,324M carrying value (fair-value-elected; ~$1.15bn principal issued May-2025) | Uber Technologies, Inc. (parent) | **Yes** — secured by pledged Aurora Innovation Class A stock | Senior; indenture has no financial/operating covenants | 61% of Uber's Aurora Class A stake pledged (fair value $1,763M at Jun-30-2026 — ~1.33x the notes' carrying value) | May 2028 | 0.00% coupon (fair-value accounted, no regular interest) | Q2 FY26 10-Q, Note 5 |
| 2029 Senior Notes | $1,500M | Uber Technologies, Inc. (parent) **+ guaranteed by certain material domestic restricted subsidiaries** — the only debt with subsidiary guarantees | No — unsecured | Senior | None | August 2029 | Fixed 4.50%; effective 4.7% | Q2 FY26 10-Q, Note 5 |
| 2030 Senior Notes | $1,250M | Uber Technologies, Inc. (parent) | No — unsecured | Senior | None | January 2030 | Fixed 4.30%; effective 4.5% | Q2 FY26 10-Q, Note 5 |
| 2031 Senior Notes | $1,000M | Uber Technologies, Inc. (parent) | No — unsecured | Senior | None | January 2031 | Fixed 4.15%; effective 4.3% | Q2 FY26 10-Q, Note 5 |
| 2034 Senior Notes | $1,500M | Uber Technologies, Inc. (parent) | No — unsecured | Senior | None | September 2034 | Fixed 4.80%; effective 4.9% | Q2 FY26 10-Q, Note 5 |
| 2035 Senior Notes | $1,250M | Uber Technologies, Inc. (parent) | No — unsecured | Senior | None | September 2035 | Fixed 4.80%; effective 5.0% | Q2 FY26 10-Q, Note 5 |
| 2054 Senior Notes | $1,250M | Uber Technologies, Inc. (parent) | No — unsecured | Senior | None | September 2054 | Fixed 5.35%; effective 5.4% | Q2 FY26 10-Q, Note 5 |
| Less: unamortized discount/issuance costs | $(76)M | — | — | — | — | — | — | Q2 FY26 10-Q, Note 5 |
| **Total debt per Note 5 (bonds/notes + term loan; ST $1,997M + LT $10,726M)** | **$12,723M** | | | | | | | Q2 FY26 10-Q, Note 5 |
| Commercial Paper Program (undrawn) | $0 outstanding (capacity up to $2.0bn) | Uber Technologies, Inc. (parent) | No — unsecured; ranks pari passu with other unsecured debt | Senior | None | Up to 397-day maturities | n/a — none outstanding | Q2 FY26 10-Q, Note 5 |
| Revolving Credit Agreement (undrawn) | $0 drawn of $5.0bn committed | Uber Technologies, Inc. (parent); not guaranteed by subsidiaries | No — unsecured | Senior | None | September 26, 2029 | Floating (benchmark-based); n/a while undrawn | Q2 FY26 10-Q, Note 5 |
| Finance leases | Not separately disclosed on the Jun-30-2026 balance sheet (embedded in "accrued and other current liabilities" and "other long-term liabilities" [FY25 10-K, Note 8]). Last disclosed standalone balance: **$216M** as of Dec-31-2025 (CIQ's own Capital Structure Details tab shows $222M for the same date — a small, immaterial classification difference, not investigated further) | Uber Technologies, Inc. (parent) | **Yes** — finance leases are inherently secured by the leased asset | Senior (secured by the specific leased asset) | Underlying leased assets (vehicles/equipment) | ~2030 (weighted-average, per CIQ) | Fixed; ~6.0% (FY2025, CIQ) | FY25 10-K, Note 8; CIQ Financials_Annual.xls → Capital Structure Details, FY2025 tab |
| **Total gross debt (module standard: debt + finance leases, excl. operating leases)** | **≈$12,945M** ($12,723M + ~$222M finance leases, FY2025 balance carried forward — see flag below) | | | | | | | See reconciliation note below |

**Flag — finance-lease balance is stale.** The $12,945M gross-debt figure carries forward the FY2025 finance-lease balance ($216M–$222M) because the Jun-30-2026 10-Q does not break it out as a separate balance-sheet line (US GAAP presentation folds it into other current/non-current liabilities). The gap this creates is small (≤2% of total debt) and does not change the leverage conclusion, but it is an approximation, not a directly reported Jun-30-2026 figure.

**Memo — operating leases (off the debt line under US GAAP; shown for comparability, not included in "gross debt" above).** Operating lease liabilities total **$2,008M** (current $178M + non-current $1,830M), against $1,558M of operating lease right-of-use assets [Q2 FY26 10-Q, Balance Sheet]. If operating leases were folded into gross debt (an IFRS 16–style view), gross debt would be ≈$14,953M. Capital IQ's own standardized "Total Debt" field for Jun-30-2026 ($14,731M) does exactly this (debt $12,723M + operating leases $2,008M = $14,731M) but does not separately add finance leases — see the net-debt reconciliation in §4.

**No numeric covenant thresholds are disclosed** for the Term Loan Credit Agreement, the Senior Notes indentures, or the Revolving Credit Agreement — only "customary" covenant language and a statement of compliance ("We were in compliance with all covenants as of June 30, 2026") [Q2 FY26 10-Q, Note 5]. This caps covenant-headroom precision for `04_coverage-and-covenants`, not for this agent's leverage read.

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Operating leases (US GAAP ASC 842 note) | $2,008M total lease liability (current $178M + non-current $1,830M); $1,558M right-of-use assets | On-balance-sheet under US GAAP (ASC 842) but off the "debt" line — shown separately from gross debt per module convention; weighted-average discount rate ~6.6% as of FY2025 (last disclosed) | Q2 FY26 10-Q, Balance Sheet; CIQ Financials_Annual.xls → Capital Structure Details, FY2025 tab |
| Pension / OPEB underfunding | None | Uber discloses no defined-benefit pension or OPEB plan — this is a "not applicable," not a data gap | CIQ Financials_Annual.xls & Financials_Quarterly.xls → Pension/OPEB tabs, both "No Data Available" |
| Preferred equity | None outstanding | Uber last carried convertible preferred stock pre-IPO (2018-era); no preferred stock line appears on the balance sheet in any period from FY2021 onward | Q2 FY26 10-Q, Balance Sheet (no preferred-stock line item); CIQ Financials_Quarterly.xls → Balance Sheet, "Pref. Stock, Convertible" row = blank for all recent periods |

## 3. Cash & Liquid Assets

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| Cash & cash equivalents | $4,870M | No | Q2 FY26 10-Q, Balance Sheet |
| Short-term investments | $521M | No | Q2 FY26 10-Q, Balance Sheet |
| Restricted cash & cash equivalents (current) | $661M | **Yes — restricted** | Q2 FY26 10-Q, Balance Sheet |
| Restricted cash & cash equivalents (non-current) | $1,646M | **Yes — restricted** | Q2 FY26 10-Q, Balance Sheet |
| Restricted investments (non-current) | $9,486M | **Yes — restricted** | Q2 FY26 10-Q, Balance Sheet |
| Investments — equity stakes (Didi, Grab, Aurora, other; non-current, unrestricted) | $8,759M | Not restricted, but **not cash-like** — these are non-marketable and marketable equity securities in other companies (Didi $1,900M, Grab $2,020M, Aurora $1,763M, other $2,076M), held for strategic/investment purposes, not treasury liquidity | Q2 FY26 10-Q, Note 3 (Investments) |

**Restricted cash and restricted investments total $11,793M** ($661M + $1,646M + $9,486M) — larger than Uber's entire gross debt stack. The filing does not explicitly reconcile this balance to a specific use, but ties contextually to Uber's self-insurance program: total insurance reserves (short-term $3,758M + long-term $9,528M = $13,286M) sit on the balance sheet, and the 10-Q states Uber "has requirements to post collateral for current and future claim settlement obligations with certain of our insurance carriers, which may have a significant impact on our unrestricted cash and cash equivalents available for general business purposes" [Q2 FY26 10-Q, Item 1A Risk Factors region]. **This linkage is inference, not a stated fact in the filing** — the exact restricted-cash-to-insurance-reserve mapping is not disclosed. Either way, the restricted balances are excluded from every net-debt calculation below, and the "Investments" (equity stakes) line is excluded from the liquid/broad net-debt basis because it is not a treasury cash-management asset.

## 4. Gross & Net Debt

| Metric | Value | Source |
|---|---:|---|
| Gross debt (module standard: debt + finance leases) | $12,945M | §1 above |
| − Cash & equivalents | $4,870M | Q2 FY26 10-Q, Balance Sheet |
| **Net debt (strict, §15)** | **$8,075M** | Computed: 12,945 − 4,870 |
| − Liquid short-term investments (additional) | $521M | Q2 FY26 10-Q, Balance Sheet |
| **Net debt (broad, incl. investments)** | **$7,554M** | Computed: 12,945 − (4,870 + 521) |

**Basis reconciliation with the cross-module figure.** `earnings/01_historical-financials.md` reports net debt of $9,861M as of Jun-30-2026, using Capital IQ's standardized "Total Debt" ($14,731M) minus cash only. That $14,731M figure folds operating lease liabilities ($2,008M) into "debt" and does not separately add finance leases. The two figures reconcile exactly once the basis difference is accounted for: $14,731M − $12,945M = $1,786M = $2,008M (operating leases CIQ includes) − $222M (finance leases this module adds that CIQ's field does not). **Neither figure is a misread — they use different, both defensible, gross-debt scopes** (this module follows MODULE_RULES.md Calculation Standard #2: US GAAP keeps operating leases off the debt line by default). This module's $8,075M / $7,554M figures are the ones downstream balance-sheet-survival agents (02–06) should use; the earnings module's $9,861M is on an operating-lease-inclusive basis and should not be mixed with this module's figures without re-stating the basis.

**Trend note.** Net debt (strict, this module's basis) has risen sharply from FY2025's year-end level: FY2025 (Dec-31-2025) net debt was $5,197M on the earnings module's own (op-lease-inclusive, but at that date the gap was smaller) full-year basis [earnings/01_historical-financials.md] — see §6 for the multi-year path and driver.

## 5. Leverage Ratios

| Ratio | On Reported EBITDA | On Adjusted EBITDA | Source |
|---|---:|---:|---|
| Gross debt / EBITDA | 1.73x (LTM reported EBITDA $7,474M, ended Jun-30-2026) | 1.48x (FY2025 Adjusted EBITDA $8,730M — **stale, FY2025 period vs. Jun-30-2026 balance sheet; period mismatch flagged**) | Gross debt $12,945M ÷ EBITDA; EBITDA from `earnings/01_historical-financials.md` and FY25 10-K |
| Net debt (strict) / EBITDA | 1.08x (LTM reported $7,474M) | 0.92x (FY2025 Adjusted $8,730M, stale) | Net debt (strict) $8,075M ÷ EBITDA |
| Net debt (broad) / EBITDA | 1.01x (LTM reported $7,474M) | 0.87x (FY2025 Adjusted $8,730M, stale) | Net debt (broad) $7,554M ÷ EBITDA |
| Debt / capital | 31.4% ($12,945M ÷ ($12,945M + $28,219M total equity)) | (n/a) | Gross debt §1; Total equity, Q2 FY26 10-Q, Balance Sheet |
| Debt / equity | 45.9% ($12,945M ÷ $28,219M total equity) | (n/a) | Same as above |

**EBITDA basis stated plainly.** "Reported EBITDA" here is GAAP-based: LTM (twelve months ended Jun-30-2026) reported EBITDA of $7,474M is Capital IQ's standardized GAAP Income from Operations + D&A, cross-checked against the CIQ annual workbook's own "LTM" column [CIQ Financials_Quarterly.xls → Income Statement; `earnings/01_historical-financials.md`]. "Adjusted EBITDA" is Uber's own non-GAAP measure — its last disclosed value is $8,730M for FY2025 (adds back stock-based compensation $1,826M, legal/regulatory reserve items $564M, and smaller items) [FY25 10-K, Adjusted EBITDA reconciliation table]. **Uber discontinued disclosing consolidated Adjusted EBITDA starting Q1 FY2026** — the term does not appear in either the Q1 or Q2 FY2026 10-Qs or their earnings-call transcripts [Q1/Q2 FY26 10-Qs; Q1/Q2 FY26 earnings calls — confirmed absent by `earnings/01_historical-financials.md`]. This means the Adjusted-EBITDA-based ratios above compare a Jun-30-2026 balance sheet to an FY2025 (stale, ~6-month-old) profitability figure and should be read as directional, not precise; the reported-EBITDA-based ratios (LTM through Jun-30-2026) are the more current and reliable read.

**Cyclicality note.** `business-model/10_external-dependency.md` rates Uber's consumer-cycle exposure "Mid-High" (Delivery, ~one-third of FY2025 revenue, is discretionary spend that could see a "disproportionate effect" from a downturn per the company's own risk factors) but does not classify Uber as a deep cyclical with a proven multi-year trough-to-peak EBITDA range — Uber has never operated through a full macro down-cycle as a profitable company (EBITDA was negative through FY2022 for scale-driven, not macro, reasons). A normalised/mid-cycle EBITDA overlay is therefore not applied here; the consumer-discretionary sensitivity of the Delivery segment is flagged for `06_downside-stress-test` to size explicitly.

**Pro-forma Delivery Hero financing (subsequent event, not in the ratios above).** If the €14.2bn bridge facility converts into permanent debt at anywhere near its full committed size, gross debt would roughly double from the $12,945M base above — `business-model/11_capital-allocation-governance.md` independently reaches the same "roughly double" characterization [business-model/11_capital-allocation-governance.md, Debt level and trajectory row]. The bridge is disclosed in euros with no company-stated USD equivalent, and this data pool contains no dated EUR/USD rate to convert it without fabricating a rate — it is reported here in its original currency, unconverted, per §27. Management states it "expect[s] to incur additional debt in connection with our proposed acquisition of Delivery Hero" [Q2 FY26 10-Q, p.23727 region]. **This is a contingent, subsequent event — expected close is H2 2027 — not a certainty; the leverage ratios above are the as-reported, pre-financing picture, and this paragraph is the pro-forma flag for `02_maturity-wall-and-refinancing` and `06_downside-stress-test` to carry forward.**

## 6. Leverage Trend

| Metric | FY2023 | FY2024 | FY2025 | Latest (Jun-30-2026, this module's basis) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (§15 basis: earnings module uses an operating-lease-inclusive "strict" figure for the annual series; this module's own basis is stated separately below) | $7,022M | $5,543M | $5,197M | $8,075M (this module, debt+finance-leases basis) / $9,861M (earnings module, debt+operating-leases basis) | Reversed — falling FY2023→FY2025, then rising sharply through Jun-30-2026 |
| Net debt / EBITDA | 3.63x | 1.57x | 0.82x | 1.08x (this module, strict basis, on LTM reported EBITDA) | Reversed — falling FY2023→FY2025, then rising |

(FY2023–FY2025 net debt and Net Debt/EBITDA figures above are taken directly from `earnings/01_historical-financials.md`, which computes them on its own strict basis — total debt minus cash and equivalents only, using Capital IQ's period-matched annual figures. This module's Jun-30-2026 figures use this module's own basis, defined in §4; the two bases are reconciled in §4.)

Leverage fell every year from FY2022 ($7,509M net debt, 3.63x-equivalent EBITDA multiple context) through FY2025 ($5,197M, 0.82x) as EBITDA grew faster than debt and Uber's cash generation strengthened (CFO rose from $642M in FY2022 to $10,099M in FY2025) [`earnings/01_historical-financials.md`]. That trend reversed sharply after Dec-31-2025: net debt rose because Uber (a) drew $2.0bn under a new Term Loan Credit Agreement in June 2026, funded mostly for general corporate purposes, while repaying $2.0bn of other maturities [Q2 FY26 10-Q, Note 5; Cash Flow Statement], and (b) spent $3.5bn on share buybacks in the six months ended Jun-30-2026 alone (on top of $6.5bn in FY2025), a pace of capital return that is drawing down net cash faster than operating cash flow is rebuilding it — trailing-twelve-month buybacks of $6,904M against trailing CFO of $10,424M, per `earnings/01_historical-financials.md`. This is a capital-allocation-driven leverage increase (buybacks plus new borrowing, not an operating decline — LTM reported EBITDA is up 42.9% year-on-year), and it precedes the much larger, not-yet-closed Delivery Hero bridge financing described in §5.

## 6A. HoldCo / OpCo & Structural Subordination (if applicable)

| Item | Evidence | Why It Matters |
|---|---|---|
| Where debt sits (HoldCo vs OpCo) | Uber Technologies, Inc. — the single NYSE-listed public parent — is the direct obligor on every debt instrument in §1. There is no separate holding-company/operating-company split; Uber does not disclose a HoldCo/OpCo structure [Q2 FY26 10-Q, Note 5; FY25 10-K, Item 1 corporate structure discussion] | No structural-subordination risk of the classic HoldCo-cannot-reach-OpCo-cash type |
| Upstreaming constraints (dividend blockers, regulatory) | None disclosed. Uber pays no dividend at all (all shareholder returns are via buybacks) [`business-model/11_capital-allocation-governance.md`, Dividend policy & coverage row], so upstreaming is moot for the parent's own debt service — the parent generates its own consolidated cash flow directly | n/a — the parent is both the borrower and the primary cash generator |
| Material restricted / trapped cash | $11,793M of restricted cash and restricted investments (§3) sits on the balance sheet, likely tied to the self-insurance captive's collateral requirements (inference — not explicitly reconciled in the filing) | Net debt calculations above correctly exclude this — using it would materially understate leverage |
| Subsidiary guarantees / non-guaranteed structural subordination | The 2029 Senior Notes uniquely carry guarantees from "certain of our material domestic restricted subsidiaries" [Q2 FY26 10-Q, Note 5]. Every other instrument in §1 (Term Loan, 2028 Convertible, 2028 Exchangeable, 2030/2031/2034/2035/2054 Senior Notes, Revolver, Commercial Paper) is an obligation of the parent only, with **no** subsidiary guarantee disclosed | In principle, non-guaranteed creditors rank behind any liabilities at non-guarantor operating subsidiaries in a subsidiary-level insolvency. The data pool discloses no subsidiary-level balance sheets, so this risk cannot be sized — flagged as a data limitation for `04_coverage-and-covenants` and `05_off-balance-sheet-and-contingencies`, not evidence of high or low actual risk |

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

The following are the numbers every other balance-sheet-survival agent in this module should use verbatim, unless a stated reason requires switching basis:

- **Gross debt (canonical): $12,945M** — $12,723M interest-bearing debt (bonds/notes/term loan, per 10-Q Note 5, Jun-30-2026) + ~$222M finance leases (FY2025 balance, carried forward — flagged as approximate/stale). Memo: an operating-lease-inclusive (IFRS 16–style) view would be ≈$14,953M; Capital IQ's own standardized "Total Debt" is $14,731M (debt + operating leases only, no finance-lease add).
- **Net debt (canonical basis: strict, §15): $8,075M** = gross debt $12,945M − cash & equivalents $4,870M. This is the **designated canonical figure** for downstream agents — chosen because it is the module's default US-GAAP-consistent basis (debt + finance leases, cash & equivalents only), and it is the more conservative (higher) of the two clean bases when short-term investments are excluded from cash. Broad basis (net of $521M short-term investments too): **$7,554M** — shown alongside, not used as the default.
- **Cash & liquid investments (unrestricted): $5,391M** total ($4,870M cash & equivalents + $521M short-term investments). Excludes $11,793M of restricted cash/investments (§3) and $8,759M of illiquid strategic equity stakes (Didi/Grab/Aurora/other).
- **EBITDA base used:** LTM (twelve months ended Jun-30-2026) **reported** EBITDA of **$7,474M** (GAAP-based, Capital IQ-standardized) is the primary basis — most current, not a cycle-adjusted figure (Uber is not classified as a deep cyclical; see §5). FY2025 **Adjusted** EBITDA of $8,730M (company-disclosed, last available — discontinued for FY2026) is shown alongside and flagged stale.
- **Net debt / EBITDA (canonical net debt ÷ both EBITDA bases):** 1.08x on LTM reported EBITDA ($8,075M ÷ $7,474M); 0.92x on FY2025 Adjusted EBITDA ($8,075M ÷ $8,730M, stale/period-mismatched — flagged).
- **Reporting currency: USD.**

**Propagate this caveat downstream:** the $12,945M gross-debt figure includes an approximate, carried-forward finance-lease balance (not separately reported at Jun-30-2026); the Adjusted-EBITDA-based ratios compare a Jun-30-2026 balance sheet to a stale FY2025 profitability figure; and none of the figures above reflect the pending €14.2bn Delivery Hero bridge financing (§5), which is a subsequent, contingent event expected to roughly double gross debt if it converts to permanent financing at scale.

**Net debt / net cash characterization.** Uber is **not** net cash on either basis — it carries net debt of $8,075M (strict) / $7,554M (broad) as of Jun-30-2026. Net leverage (1.08x LTM reported EBITDA) is low in absolute terms and well below the FY2023 peak (3.63x), but the trend within the last two quarters is rising, driven by buybacks and new borrowing rather than an operating decline (§6) — this reversal, and the pending Delivery Hero financing, are the two facts downstream agents should weight most heavily, not the still-modest absolute leverage level.



---

## balance-sheet-survival / 02_maturity-wall-and-refinancing.md

_Source: `02_maturity-wall-and-refinancing.md`_

# Maturity Wall & Refinancing — UBER

Reporting currency: US dollars (USD, millions unless stated). Reporting standard: US GAAP. All figures are carrying values as of June 30, 2026, the most recent balance sheet in the data pool [Q2 FY26 10-Q, Note 5 (Debt and Credit Arrangements)], unless stated otherwise. Gross debt is taken verbatim from `01_capital-structure-and-leverage.md`'s canonical figure of $12,945M (interest-bearing debt $12,723M per Note 5 + ~$222M finance leases carried forward from the FY2025 balance, flagged there as approximate/stale). This agent reads the maturity schedule independently from the underlying debt note and reconciles to that canonical total below.

**Subsequent-event overlay (not in the figures below).** On 2026-07-16 Uber signed a business combination agreement to acquire Delivery Hero SE (~$14.8bn equity value) and executed a €14.2 billion bridge credit agreement to help fund it; expected close is H2 2027 [Q2 FY26 10-Q, Note 15]. None of the maturity, coupon, or refinancing figures below reflect this — they are the as-reported, pre-Delivery-Hero-financing picture. Section 4 and Section 5 carry the caveat forward.

## 1. Maturity Schedule

Buckets below are calendar years, matching the structure of Uber's own debt note (10-K Note 8 uses the same calendar-year format) [FY25 10-K, Note 8]. "Within 12 months" is anchored to the report date (2026-08-08): the only debt due before August 2027 is the December-2026 Term Loan, so this bucket equals calendar 2026. Subsequent rows follow calendar years 2027–2030, with "Thereafter" covering 2031 onward.

| Period | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (2026, remainder) | $2,000M | 15.4% | 2026 Term Loan — $2.0bn drawn, due December 2026 | Q2 FY26 10-Q, Note 5 |
| Year 2 (2027) | $0 | 0.0% | — no scheduled maturities | Q2 FY26 10-Q, Note 5 |
| Year 3 (2028) | $3,049M | 23.5% | 2028 Exchangeable Senior Notes ($1,324M carrying value; ~$1.15bn principal, matures May 2028) + 2028 Convertible Notes ($1,725M, matures December 2028) | Q2 FY26 10-Q, Note 5 |
| Year 4 (2029) | $1,500M | 11.6% | 2029 Senior Notes (matures August 2029) | Q2 FY26 10-Q, Note 5 |
| Year 5 (2030) | $1,250M | 9.7% | 2030 Senior Notes (matures January 2030) | Q2 FY26 10-Q, Note 5 |
| Thereafter (2031+) | $5,000M | 38.6% | 2031 Senior Notes ($1,000M, Jan 2031) + 2034 Senior Notes ($1,500M, Sep 2034) + 2035 Senior Notes ($1,250M, Sep 2035) + 2054 Senior Notes ($1,250M, Sep 2054) | Q2 FY26 10-Q, Note 5 |
| Less: unamortized discount / issuance costs | $(76)M | (0.6%) | Netted across all instruments | Q2 FY26 10-Q, Note 5 |
| Finance leases (approximate — stale) | ~$222M | 1.7% | Not separately disclosed on the Jun-30-2026 balance sheet; FY2025 year-end balance carried forward, weighted-average maturity ~2030 per Capital IQ (not precisely bucketed above — flagged, per `01`) | FY25 10-K, Note 8; CIQ Financials_Annual.xls → Capital Structure Details |
| **Total** | **$12,945M** | **100.0%** | Matches `01`'s canonical gross debt figure exactly | Reconciliation computed |

**2028 is the true wall, not 2026.** The single largest calendar-year maturity is **2028 at $3,049M (23.5% of total gross debt)** — larger than the immediate 2026 Term Loan. It is split across two instruments with early-conversion/exchange optionality (the 2028 Exchangeable Senior Notes, secured by pledged Aurora stock and settleable in cash or Aurora stock at Uber's election up to the ~$1.15bn principal; and the 2028 Convertible Notes, unsecured with no financial covenants). Both could in principle convert/exchange before their stated maturity dates under specified triggers, which would pull this maturity forward rather than push it back [Q2 FY26 10-Q, Note 5].

**Revolver and undrawn Term Loan capacity are not in this table** — they carry no scheduled repayment while undrawn. The $5.0bn Revolving Credit Agreement matures September 2029 and was $0 drawn as of June 30, 2026. The Term Loan Credit Agreement's remaining $1.0bn commitment **expired August 2, 2026** — before this report's date — per the credit agreement's own terms ("permits borrowings through August 2, 2026, after which any undrawn commitments expire") [Q2 FY26 10-Q, Note 5, p.11781 region]. That $1.0bn is no longer available liquidity; only the $2.0bn already drawn under the Term Loan remains outstanding (and is the Within-12-months line above).

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) | ~6.3 years (weighted by carrying value against each instrument's exact/stated maturity month from the June 30, 2026 balance sheet date; heavily skewed by the 2054 Senior Notes — $1,250M (9.7% of debt) that sit 28.25 years out contribute ~43% of the total weighted-year sum) |
| % due within 12 months | 15.4% ($2,000M ÷ $12,945M) |
| % due within 24 months | 25.7% ($3,324M = $2,000M + $1,324M ÷ $12,945M) |
| % due within 36 months | 39.0% ($5,049M = $2,000M + $1,324M + $1,725M ÷ $12,945M) |
| Largest single maturity year (and amount) | **2028 — $3,049M (23.5% of total gross debt)**, split between the 2028 Exchangeable Senior Notes (May 2028) and the 2028 Convertible Notes (December 2028) |

A WAM of ~6.3 years reads comfortably on its own, but that average is doing a lot of work: strip out the long-dated 2034/2035/2054 Senior Notes ($4,000M, 30.9% of the stack) and the remaining $8,945M of debt has a WAM of roughly 2.2 years — the near-term profile is materially tighter than the headline average suggests.

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | ~85.1% ($11,021M = all Senior Notes $7,750M + 2028 Convertible Notes $1,725M + 2028 Exchangeable Senior Notes $1,324M (0.00% coupon, fair-value elected — no floating linkage) + finance leases ~$222M, ÷ $12,945M canonical gross debt) | Q2 FY26 10-Q, Note 5; computed |
| Floating-rate share | ~15.4% ($2,000M — the 2026 Term Loan only, Term SOFR + 0.825%, stated 4.46% / effective 4.8%; the $5.0bn Revolver is also floating-rate but undrawn and contributes $0 today) | Q2 FY26 10-Q, Note 5 |
| Weighted-average coupon (stated rates) | ~3.64% (weighted by carrying value across all nine instruments) | Computed from Q2 FY26 10-Q, Note 5 stated-rate table |
| Weighted-average coupon (effective rates) | ~3.82% (weighted by carrying value; effective rates include discount/issuance-cost amortization) | Computed from Q2 FY26 10-Q, Note 5 effective-rate table |
| Current market refi rate — 5-year tenor benchmark | ~5.2%–5.3% indicative (5-year US Treasury yield 4.33% as of 2026-08-07 + ICE BofA BBB US Corporate Index spread ~90–100bps as of early Aug 2026) | Web-sourced, indicative/unverified — see Sources below |
| Current market refi rate — 10-year tenor benchmark | ~5.5%–5.6% indicative (10-year US Treasury yield 4.65% as of 2026-08-07 + comparable BBB+ spread) | Web-sourced, indicative/unverified |
| Estimated refi cost step-up (headline, blended effective coupon vs. 5Y benchmark) | **+~140bps** (3.82% effective coupon vs. ~5.25% midpoint) | Computed — see caveat below |

**The headline step-up is misleading on its own — read the footnote, not just the number.** Roughly a quarter of Uber's debt ($3,049M — the 2028 Convertible Notes at 0.875% and the 2028 Exchangeable Senior Notes at 0.00%) carries a near-zero coupon because both were priced against equity-linked conversion/exchange features (into Uber stock, or into pledged Aurora stock), not against a plain-vanilla credit spread. Stripping those two instruments out, the weighted coupon on the six **plain, fixed-rate Senior Notes** ($7,750M) is **~4.67%** — against the ~5.25%–5.6% indicative market benchmarks above, the real step-up on those notes when they actually mature (soonest: 2029) is closer to **+60 to +90bps**, not +140bps. The floating-rate 2026 Term Loan (effective 4.8%, priced at Term SOFR + 0.825% ≈ 4.48% at today's 3.65% SOFR) would reprice roughly flat-to-slightly-lower if refinanced today — it was drawn in June 2026, close to current terms.

**Rating-linked pricing exists on the Revolver, not disclosed for the Term Loan or Notes.** The Credit Agreement's margin over Term SOFR/base rate and its commitment fee "fluctuate based upon the ratings of our non-credit enhanced senior unsecured long-term debt" [FY25 10-K, Note 8] — a rating downgrade would mechanically raise the cost of any future revolver draw. No change-of-control put, cross-default provision, or rating-trigger pricing step is disclosed for the Term Loan, the Senior Notes, the Convertible Notes, or the Exchangeable Notes [per `00_solvency-data-triage.md`, confirmed absent from the pool].

**No interest-rate hedge is disclosed against the floating exposure.** Uber's FY2025 10-K details FX forward/cash-flow hedges but discloses no interest-rate swap or cap against the Term Loan or Revolver [`00_solvency-data-triage.md`; FY25 10-K, Note 3]. The full $2,000M floating balance (15.4% of gross debt) is therefore unhedged: a 100bps move in SOFR changes annual cash interest on this position by ~$20M — small in absolute terms against Uber's $10.1bn TTM FCF (§4), but it is a live, unhedged exposure.

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities ($3,324M: the $2,000M Dec-2026 Term Loan + $1,324M May-2028 Exchangeable Notes) | Amount | Evidence |
|---|---:|---|
| Cash on hand | $4,870M cash & equivalents + $521M short-term investments = $5,391M unrestricted | Q2 FY26 10-Q, Balance Sheet |
| Forecast FCF (recent run-rate, labeled) | TTM (twelve months ended Jun-30-2026) FCF of $10,116M (CFO $10,424M − capex), +18.5% YoY — a trailing run-rate, not a company-issued forecast | `earnings/01_historical-financials.md`, cross-checked to CIQ Financials_Quarterly.xls → Cash Flow |
| Revolver availability | $5,000M fully available — $0 drawn of the $5.0bn committed Revolving Credit Agreement as of Jun-30-2026, no borrowing-base mechanism (commitment-based, not asset-based) | Q2 FY26 10-Q, Note 5 |
| Asset-sale proceeds | Unknown / not announced for debt repayment. (The Aurora Class A stake — $1,763M fair value — is already pledged as collateral for the 2028 Exchangeable Notes, not held for sale; the $8,759M of other strategic equity stakes (Didi, Grab, other) carry no announced monetization plan.) | Q2 FY26 10-Q, Note 3; `01_capital-structure-and-leverage.md` §3 |
| New debt issuance | Not committed for these specific maturities. Management has stated it "expect[s] to enter into term loan facilities that will reduce the commitments under the bridge credit agreement in the third quarter of 2026" and "expect[s] to enter into a new revolving facility that will replace [the] existing revolving credit agreement in the third quarter of 2026" — but both are tied to the Delivery Hero financing and revolver refresh, not to the 2026/2028 maturities in this table | Q2 FY26 10-Q, "Liquidity and Material Cash Requirements" section |

Cash and short-term investments alone ($5,391M) cover the entire next-24-month maturity wall ($3,324M) 1.6x over, without touching the fully-available $5.0bn revolver or the $10.1bn TTM FCF. Nothing in this row set is unknown or assumed.

**Read.** The near-term wall (next 12–24 months) is covered by cash on hand alone, without needing FCF, the revolver, or market access — this is a self-funded position for these specific maturities. S&P rates Uber BBB+ (issuer credit rating, foreign currency, long-term, as of 2026-08-06) [Capital IQ Credit Health Panel], and Uber's own Credit Health "Solvency" and "Overall" ranks are 1 (best) against a ten-company comparable set that includes DoorDash, Lyft, Grab, and Hertz [same source] — a rating and relative-health position consistent with continued market access, though this is a comp-set rank, not a numeric solvency score, and should not be read as a guarantee. Recent refi activity (the June 2026 $3.0bn Term Loan, the July 2026 €14.2bn bridge facility) shows demonstrated, current market access at scale. Floating-rate debt is $2,000M (15.4% of gross debt) — every 100bps move in benchmark rates changes annual cash interest on this slice by ~$20M, an amount immaterial next to $10.1bn of TTM FCF. **Conclusion: self-funded / low refi risk for the maturity wall as presented.**

## 5. Refinancing Read

The maturity wall itself is not what will strain Uber over the next two years: $2,000M is due in December 2026 and $1,324M more in May 2028, both fully covered by $5,391M of unrestricted cash and short-term investments before FCF or the revolver are even needed. The real wall — 2028, at $3,049M (23.5% of gross debt) split across two equity-linked instruments — sits far enough out, and the company generates enough cash ($10.1bn TTM FCF), that it reads as refinanceable in most environments rather than exposed. The blended weighted-average coupon (3.64% stated / 3.82% effective) understates the true refinancing cost because a quarter of the stack is near-zero-coupon convertible/exchangeable paper; the honest comparison — plain Senior Notes at ~4.67% against an indicative current market rate of ~5.2%–5.6% — points to a real step-up of roughly +60 to +90bps when those notes mature (soonest 2029), not the flashier +140bps the blended figure implies. **The single biggest refinancing risk is not the schedule in this table — it is the subsequent, not-yet-closed Delivery Hero acquisition**, funded via a new €14.2 billion bridge facility that management plans to term out into permanent debt in Q3 2026: if that converts to permanent financing at scale, it would roughly double gross debt (per `01`'s pro-forma flag) on top of the maturity schedule above, none of which this report's figures capture. Under a "market closure" test (no new unsecured issuance for 12 months) applied strictly to the maturity schedule in this report — the $2,000M Term Loan due December 2026 — Uber clears it comfortably: $5,391M of unrestricted cash and short-term investments alone cover it 2.7x over, with the $5.0bn undrawn revolver and $10.1bn of TTM FCF as further, untouched backstops. This conclusion is scoped to the as-reported debt stack only; it does not extend to a scenario where the Delivery Hero bridge has already converted to permanent debt, which is outside this agent's figures and is flagged for `06_downside-stress-test` to size explicitly.

---

### Sources for web-sourced benchmark rates (indicative, unverified, dated)

- [5-Year Treasury Rate — YCharts / Forbes Advisor](https://www.forbes.com/advisor/investing/treasury-rates/) — 4.33% as of 2026-08-07
- [US 10-Year Treasury Yield — Trading Economics](https://tradingeconomics.com/united-states/government-bond-yield) — 4.65% as of 2026-08-07
- [SOFR Rate Today — sofrrate.com](https://www.sofrrate.com/) — 3.65% as of 2026-08-06
- [ICE BofA BBB US Corporate Index Option-Adjusted Spread — FRED](https://fred.stlouisfed.org/series/BAMLC0A4CBBB) — BBB spread ~100bps, investment-grade ~81bps, early August 2026 (per market commentary referencing this series)



---

## balance-sheet-survival / 03_liquidity-runway.md

_Source: `03_liquidity-runway.md`_

# Liquidity Runway — UBER

Reporting currency: US dollars (USD, millions unless stated). All balance-sheet figures are as of June 30, 2026, the most recent balance sheet in the data pool [Q2 FY26 10-Q, Condensed Consolidated Balance Sheets], consistent with `01_capital-structure-and-leverage.md` and `02_maturity-wall-and-refinancing.md`. Flow figures (FCF, CFO, capex) use the trailing twelve months (TTM) ended June 30, 2026 unless stated otherwise.

**Neither partial-data cap in this module applies.** Committed, undrawn facility availability is disclosed (the $5.0bn Revolving Credit Agreement is commitment-based, not borrowing-base, and was $0 drawn at Jun-30-2026 [Q2 FY26 10-Q, Note 5]), and a full cash flow statement is available (CFO, capex, FCF all sourced from `earnings/01_historical-financials.md`). Liquidity runway is therefore not capped for either missing-facility-detail or missing-cash-flow-statement reasons (MODULE_RULES.md Score Cap Rules).

## 1. Liquidity Sources (committed only)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | $4,870M | Y | Not restricted | Q2 FY26 10-Q, Balance Sheet; `01` §3 |
| Liquid short-term investments | $521M | Y | Not restricted | Q2 FY26 10-Q, Balance Sheet; `01` §3 |
| Revolver / facilities (commitment) | $5,000M committed | Maybe (see next row) | Revolving Credit Agreement, matures Sep-26-2029; commitment-based (no borrowing-base mechanism) | Q2 FY26 10-Q, Note 5 |
| Revolver availability (disclosed) | $5,000M fully available | Y | $0 drawn as of Jun-30-2026; no borrowing base, no reserves subtracted | Q2 FY26 10-Q, Note 5; `02` §4 |
| **Total usable liquidity** | **$10,391M** | | $4,870 + $521 + $5,000 | Computed |

**Excluded from the headline figure (per module rule 4 — committed liquidity only):**
- **Restricted cash & investments: $11,793M** ($661M current restricted cash + $1,646M non-current restricted cash + $9,486M restricted investments) — larger than Uber's entire gross debt stack. Likely tied to collateral requirements under Uber's self-insurance program (inference, not explicitly reconciled in the filing) [Q2 FY26 10-Q, Balance Sheet; `01` §3, §6A]. **Flagged and excluded** — none of it is treated as usable liquidity anywhere in this report.
- **Commercial Paper Program: up to $2.0bn capacity, $0 outstanding** — this is an issuance program, not a bank commitment; no third party is obligated to buy Uber's paper, so it is treated as **uncommitted** and excluded from the headline figure [Q2 FY26 10-Q, Note 5].
- **Term Loan Credit Agreement's remaining $1.0bn undrawn commitment expired August 2, 2026** (before this report's date) and is no longer available under any circumstance [Q2 FY26 10-Q, Note 5; `02` §1]. It is not a current exclusion judgment call — it is simply gone.
- **Strategic equity stakes (Didi $1,900M / Grab $2,020M / Aurora $1,763M / other $2,076M — $8,759M total)** are not treated as liquidity: they are non-marketable/marketable minority equity positions, not treasury cash-management assets, and the Aurora stake is already pledged as collateral for the 2028 Exchangeable Notes [Q2 FY26 10-Q, Note 3; `01` §3].

Reporting currency: USD.

## 2. Near-Term Uses (next 12 months)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from `02`) | $2,000M | `02` §1 — 2026 Term Loan, due December 2026 (the only maturity within 12 months of the 2026-08-08 report date) |
| Cash interest | ~$470M (annualized from H1 FY2026 disclosed interest expense of $235M × 2) | Q2 FY26 10-Q, Income Statement / Interest Expense note. Cross-check: `02` §3's weighted-average **effective** coupon of 3.82% × $12,945M canonical gross debt ≈ $495M — the two independent estimates ($470M filed, $495M computed) bracket a consistent ~$470M–$495M range. **Both are proxies, not a disclosed "cash paid for interest" line** — the 10-Q's GAAP interest expense includes some non-cash amortization of debt discount/issuance costs (on the convertible/exchangeable notes especially), so true cash interest paid is likely modestly below $470M. This is a conservative (slightly high) proxy, used because no supplemental "cash paid for interest" disclosure was found in the pool. |
| Maintenance capex | $308M (TTM capex, ended Jun-30-2026) | `earnings/01_historical-financials.md` §2. Uber does not disclose a maintenance-vs-growth capex split — as an asset-light marketplace, its total capex ($308M TTM against $55.2bn TTM revenue, ~0.6% of revenue) is used in full as the proxy, which is conservative (overstates "maintenance" capex since it includes all growth capex too) |
| Committed dividends / buybacks | $0 | Uber pays no dividend in its reported history (2016–LTM) [`business-model/11_capital-allocation-governance.md`]. The $20.0bn Share Repurchase Program authorized July 2025 (board authorization, $15.7bn remaining as of Jun-30-2026) explicitly "does not obligate [Uber] to repurchase any specific dollar amount or to acquire any specific number of shares" and repurchases are "determined at the discretion of... management" [Q2 FY26 10-Q, MD&A — Share Repurchase Program / Note 7]. **Not a committed obligation** — excluded from this table on that basis, per §4 memo below |
| **Total near-term uses (gross-obligations view)** | **$2,778M** | $2,000 + $470 + $308 + $0 |

**Memo — actual (discretionary) buyback pace, for context only, not counted as a committed use.** Uber repurchased $3.5bn of stock in the six months ended Jun-30-2026 (a ~$7.0bn annualized run-rate) against $6.5bn in full-year FY2025 — trailing-twelve-month buybacks of $6,904M against trailing CFO of $10,424M [`01` §6; `earnings/01_historical-financials.md` §6]. This is real, ongoing cash use, but it is discretionary by the program's own terms and can be slowed or stopped at any time without breaching any obligation — it is not included in the committed-uses total above, consistent with the module's definition of "committed dividends/buybacks."

## 3. Runway

| Metric | Value |
|---|---:|
| Total committed liquidity | $10,391M |
| Annual FCF (TTM ended Jun-30-2026) | $10,116M (CFO $10,424M − capex $308M) [`earnings/01_historical-financials.md` §2] |
| Basis used (net-of-FCF / gross-obligations) | **Net-of-FCF** — FCF is meaningful and positive (TTM $10,116M, +18.5% YoY), so the module's net-of-FCF basis applies |
| Annual net cash burn (net-of-FCF basis) | **−$8,116M (i.e., a surplus, not a burn)** = (12-month debt maturities $2,000M + committed dividends/buybacks $0) − FCF $10,116M. Cash interest and maintenance capex are **not** re-added here — FCF already carries both, per the module formula |
| Monthly net cash burn | Not applicable — annual figure is a surplus, so no monthly burn rate exists on this basis |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **No finite runway — annual surplus of $8,116M.** The only near-term obligation not already inside FCF ($2,000M) is covered by FCF alone 5.1x over ($10,116M ÷ $2,000M), before touching a dollar of the $10,391M in-hand liquidity |

**Formula and basis, shown explicitly.** Net-of-FCF annual burn = (12-month maturities + committed dividends/buybacks) − FCF = ($2,000M + $0) − $10,116M = −$8,116M. A negative "burn" is a surplus: FCF alone, without drawing on cash, short-term investments, or the revolver, more than covers the only obligation due in the next 12 months. Per MODULE_RULES.md Calculation Standard 8, this is stated as an annual surplus rather than a finite runway in months.

**Conservative cross-check (gross-obligations basis, hypothetical zero-FCF stress).** If FCF is deliberately assumed to be zero (operations generate no net cash — a scenario far more severe than anything currently observed), the full 12-month obligations bucket from §2 applies with no FCF subtraction: annual burn = $2,778M ÷ 12 = $231.5M/month. Liquidity runway = $10,391M ÷ $231.5M/month ≈ **44.9 months (~3.7 years)**. This is a deliberately conservative hypothetical, not the primary read — TTM FCF is solidly positive and growing (+18.5% YoY), so the net-of-FCF surplus above is the operative conclusion.

### Seasonality / Peak Liquidity Need (Hard Check)

Working capital is **moderately seasonal but not flagged as a hard seasonality risk**. Revenue share by quarter has held a consistent pattern across FY2023–FY2025: Q1 is the smallest quarter (~23.0% of annual revenue, average) and Q4 the largest (~27.2%), a ~4.2-point spread, consistent with lower Mobility/Delivery demand post-holiday in Q1 and higher demand over the holiday season in Q4 [`earnings/01_historical-financials.md` §5]. This does not cross the module's >30%/<20% hard-flag threshold, and Uber's own Working Capital balance (Total Current Assets − Total Current Liabilities) has stayed positive and did not show a disclosed seasonal cash trough in the annual series ($(205)M FY2021 to $1,673M FY2025, described as "Volatile" but not tied to a specific seasonal low) [`earnings/01_historical-financials.md` §1]. **No peak-quarter cash usage figure is separately disclosed in the pool.** Per the hard-check rule: **peak working-capital need not disclosed — runway may be overstated.** Given the moderate (not extreme) seasonality and the $8.1bn annual FCF surplus computed above, this gap is unlikely to change the surplus conclusion, but it is not independently verified.

## 4. Sources & Uses Bridge

Internal sources cover the next 12 months with room to spare: $10,391M of already-in-hand committed liquidity (cash, short-term investments, and a fully available, commitment-based $5.0bn revolver) covers the full $2,778M gross-obligations bucket (maturities + interest + capex) 3.7x over, without needing a single dollar of the $10,116M TTM FCF. FCF is not required for near-term survival — it is a large ($8.1bn/year) surplus on top of an already-covered position, currently being redirected mostly into discretionary share buybacks ($6.9bn TTM) rather than accumulating as cash. **Roughly 100% of this runway is already-in-hand liquidity; none of it depends on FCF materializing** — the FCF surplus is upside capacity, not a load-bearing assumption for the 12-month obligations shown here. External access (new debt issuance, asset sales) is not required for the maturity schedule in this report; it is only relevant to the separate, not-yet-closed Delivery Hero acquisition financing (§5).

## 5. Liquidity Read

Uber's near-term liquidity position is not in question: the only obligation due in the next 12 months is a $2,000M Term Loan maturing December 2026, and it is covered more than five times over by TTM free cash flow alone ($10,116M) or nearly three times over by cash and short-term investments alone ($5,391M), before the fully available $5,000M revolver is even considered. The runway depends almost entirely on liquidity already in hand, not on FCF holding up — a real strength given that Uber discontinued disclosing consolidated Adjusted EBITDA in FY2026 and its GAAP EPS has been volatile on non-operating items (`earnings/01_historical-financials.md` §6). The single biggest liquidity risk visible in this report is not the 12-month figures above but what sits outside them: the pending, not-yet-closed Delivery Hero acquisition financed via a €14.2bn bridge facility that management plans to term out into permanent debt in Q3 2026 — none of the debt, interest, or maturity figures in this report reflect that financing, and if it converts to permanent debt at scale it would materially change the near-term uses picture this runway is built on [`01` §5; `02` §5].



---

## balance-sheet-survival / 04_coverage-and-covenants.md

_Source: `04_coverage-and-covenants.md`_

# Coverage & Covenants — UBER

Reporting standard: US GAAP. Reporting currency: USD millions unless stated. Uber Technologies, Inc. is a Delaware corporation, NYSE-listed, US SEC filer — 10-K/10-Q are its actual primary documents [FY25 10-K, cover page]. Coverage ratios below use the twelve months ended June 30, 2026 ("TTM"), the latest period in the data pool; the covenant inventory uses the balance sheet as of June 30, 2026, consistent with `01_capital-structure-and-leverage.md`'s canonical figures, which this agent reuses without re-deriving.

## 1. Coverage Ratios

Interest expense is the GAAP income-statement "Interest expense" line — gross (Uber separately discloses "Interest income"; the two are not netted) [Q2 FY26 10-Q, Note 5 discussion + MD&A Results of Operations]. TTM interest expense is built as FY2025 full-year ($440M) − H1 2025 ($235M) + H1 2026 ($213M) = **$418M** [FY25 10-K, Consolidated Statements of Operations (FY2025 interest expense $440M, FY2024 $523M, a 16% decline attributed to refinancing — the 10-K's own MD&A states "Interest expense decreased by $83 million, or 16%"); Q2 FY26 10-Q MD&A, three/six-months interest-expense table: three months ended Jun-30-2026 $(108)M vs Jun-30-2025 $(127)M, six months ended Jun-30-2026 $(213)M vs Jun-30-2025 $(235)M].

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest | 17.9x ($7,474M ÷ $418M) | EBITDA: `earnings/01_historical-financials.md` §2 (LTM reported EBITDA, Jun-30-2026); interest: computed above from Q2 FY26 10-Q + FY25 10-K |
| EBIT / interest | 16.0x ($6,700M ÷ $418M) | EBIT: `earnings/01_historical-financials.md` §2 (LTM reported EBIT) |
| (EBITDA − capex) / interest | 17.1x (($7,474M − $308M) ÷ $418M) | Capex: `earnings/01_historical-financials.md` §2 (LTM capex $308M) |
| Fixed-charge coverage | 6.5x — computed on FY2025 (full-year) basis, see note below | See formula below |

**FY2025 standalone cross-check** (interest, EBITDA and capex all from the same audited fiscal year, avoids any TTM/annual mixing): EBITDA/interest = $6,312M ÷ $440M = **14.3x**; EBIT/interest = $5,565M ÷ $440M = **12.6x**; (EBITDA−capex)/interest = ($6,312M − $336M) ÷ $440M = **13.6x** [FY25 10-K]. The TTM figures above are higher because TTM EBITDA is up 42.9% year-on-year while interest expense keeps falling — both directions genuinely improve coverage, this is not a mixed-basis artifact (§15).

**Fixed-charge coverage formula and inputs** (module standard: `(EBITDA − capex) / (gross interest + scheduled debt amortization + lease payments)`), computed on FY2025 because lease cash-payment detail is disclosed annually, not quarterly, in this data pool:
- Gross interest (FY2025): $440M
- Scheduled debt amortization: **$0**. Uber's Term Loan, Convertible Notes, Exchangeable Notes and all Senior Notes are bullet maturities with no periodic principal amortization disclosed [Q2 FY26 10-Q, Note 5]. This does not mean debt service is zero — it means the module's "scheduled amortization" fixed-charge component is genuinely nil for Uber; the Dec-2026 Term Loan bullet maturity itself is a maturity-wall item for `02_maturity-wall-and-refinancing`, not a recurring fixed charge.
- Lease payments (FY2025 cash paid): operating lease cash payments $303M + finance lease interest (cash, operating activities) $16M + finance lease principal (cash, financing activities) $157M = **$476M** [FY25 10-K, Note 8 (Leases), "Supplemental cash flow information related to leases"]
- Fixed charges = $440M + $0 + $476M = $916M
- Fixed-charge coverage = ($6,312M − $336M) ÷ $916M = **6.5x**

**EBITDA basis and cash-backing.** "EBITDA" throughout this table is GAAP-based reported EBITDA (Income from operations + D&A), the same basis `01_capital-structure-and-leverage.md` designates canonical — not Uber's discontinued non-GAAP "Adjusted EBITDA" (last disclosed FY2025 at $8,730M; Uber stopped reporting a consolidated Adjusted EBITDA figure from Q1 FY2026 onward) [`earnings/01_historical-financials.md` §4]. `earnings/06_earnings-quality.md` §2 finds CFO has exceeded reported EBITDA by 150–200% in every profitable year (FY2023–FY2025: 185.5%, 201.8%, 160.0%) — the EBITDA used for coverage here is not merely cash-backed, it understates the operating cash the business actually throws off, so these coverage ratios are, if anything, conservative rather than inflated by a non-cash EBITDA. `06`'s caveat (a meaningful share of the CFO-over-EBITDA gap is stock-based-compensation add-back and self-insurance-reserve build, not pure receivables/payables efficiency) does not change this conclusion — SBC and insurance-reserve growth reduce reported EBITDA (both sit above the operating-income line, or are non-operating provisions), they do not inflate it.

## 2. Covenant Inventory

**No numeric maintenance-covenant thresholds are disclosed anywhere in the data pool.** The Term Loan Credit Agreement, the Revolving Credit Agreement, and the Senior Notes indentures are each described only as containing "customary" covenants and, for the Senior Notes, "certain financial covenants specified in the indentures" — with no ratio, percentage, or dollar threshold given in the filing text, and a standing statement of compliance: "We were in compliance with all applicable covenants as of June 30, 2026" [Q2 FY26 10-Q, Note 5, Term Loan / Senior Notes / Credit Agreement sections; identical language in Q1 FY26 10-Q and FY25 10-K]. The disclosed covenant language is restrictive/incurrence-type — limits on incurring additional debt, incurring liens (the 2031/2035 Senior Notes indentures specifically restrict liens on "principal property"), and fundamental changes — not a maintenance financial ratio tested each quarter [FY25 10-K, p. re 2031/2035 Senior Notes covenants]. This pattern (incurrence covenants, no disclosed maintenance ratio) is consistent with Uber's investment-grade credit profile: the CIQ Credit Health Panel shows an **S&P Issuer Credit Rating of BBB+** as of 2026-08-06, ranked "1" (best in comp set) on Overall, Operational, and Solvency sub-scores among peers (DoorDash, Grab, Lyft, Avis, Hertz, etc.) [Capital IQ Credit Health Panel export, data as of 2026-08-06]. Investment-grade unsecured issuers typically do not carry quarterly-tested maintenance leverage/coverage covenants the way a leveraged-loan borrower does — but the filings do not say this explicitly, so it is not treated as proof; it is context for why a threshold may genuinely not exist rather than merely being un-disclosed.

Per the module's partial-data rule, a labeled market-typical covenant is applied below to produce an indicative headroom read. **This is an assumption, not a disclosed threshold, and true covenant headroom is marked "Not assessable" for scoring.**

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage (net debt/EBITDA) | **4.0x — labeled assumption**, not disclosed. Chosen as a typical unsecured-RCF/IG-issuer maintenance-leverage level (module partial-data rule example range: 4.0–4.5x for a leveraged borrower; Uber's BBB+ rating argues for the low end or for no covenant at all, so 4.0x is used, not the top of the range) | 1.08x (net debt $8,075M ÷ LTM reported EBITDA $7,474M — canonical figures, `01_capital-structure-and-leverage.md` §7) | **+73.0%** = (4.0 − 1.08) / 4.0 | Threshold: labeled assumption, Inference not from filings. Actual: `01_capital-structure-and-leverage.md` §7 |
| Min interest coverage (EBITDA/interest) | **3.0x — labeled assumption**, not disclosed (module partial-data rule range: 2.0–3.0x) | 17.9x (§1 above) | **+496.0%** = (17.9 − 3.0) / 3.0 | Threshold: labeled assumption, Inference not from filings. Actual: §1 above |
| Min liquidity / net worth | Not disclosed in any instrument reviewed | n/a | Not assessable | Q2 FY26 10-Q, Note 5 — no such covenant referenced |
| Springing covenant trigger (e.g., revolver utilization threshold) | Not disclosed. Revolver ($5.0bn committed) had $0 drawn at Jun-30-2026 [Q2 FY26 10-Q, Note 5] — even if a utilization-based springing covenant existed, it is **not active** at zero drawn balance | n/a | Not applicable (undrawn) | Q2 FY26 10-Q, Note 5 |
| Equity cure rights (Y/N, limits) | Not disclosed in any instrument reviewed | n/a | Not assessable | Q2 FY26 10-Q, Note 5; FY25 10-K — no equity-cure language found |
| Cross-default / change-of-control | Not disclosed with specific triggers in the pool (only generic risk-factor language that a "default under our debt arrangements could require immediate repayment") | n/a | Not assessable | FY25 10-K, Risk Factors (Liquidity and Capital Resources risk discussion) |

**Both labeled-assumption headroom figures are very wide (+73% and +496%) — this is the expected shape for a BBB+-rated issuer with 1.08x net leverage, not evidence the assumption is wrong. The wideness itself is not proof a real covenant would show this much room; it is proof that IF a maintenance covenant exists at anywhere near a typical threshold, Uber is not close to it today.** The true tightness (or absence) of any real covenant cannot be confirmed from this data pool.

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | **Not disclosed.** No instrument in the pool defines a covenant-specific EBITDA (with its own addback list) distinct from the company's GAAP or non-GAAP EBITDA measures | Q2 FY26 10-Q, Note 5; FY25 10-K |
| Addbacks permitted (types) | Not disclosed — no covenant-EBITDA addback schedule exists in the reviewed filing text | n/a |
| Addback caps / limits | Not disclosed | n/a |
| Is covenant EBITDA materially above reported EBITDA? | **Unknown — cannot be judged.** If a real covenant exists and uses a definition resembling Uber's own discontinued non-GAAP "Adjusted EBITDA" ($8,730M FY2025 vs. $6,312M GAAP reported EBITDA — a 38.3% gap dominated by a $1,826M stock-based-compensation addback [`earnings/06_earnings-quality.md` §4, §7]), covenant headroom would look even wider than the reported-EBITDA-based figures above. This agent does NOT substitute Adjusted EBITDA into the headroom calculation above, because no filing ties Adjusted EBITDA (or any other defined figure) to an actual covenant test — doing so would manufacture false precision | `earnings/06_earnings-quality.md` §4, §7 |

**Because the covenant definition is entirely undisclosed, headroom quality here is unknown — this is a labeled instance of the module's "addback illusion" risk, not evidence of clean or dirty headroom.** Per MODULE_RULES.md partial-data rule, covenant headroom is marked **"Not assessable"** for scoring purposes; the indicative figures in §2 are shown for the master synthesizer's context only, not as a scored input.

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | **Not assessable — no disclosed maintenance covenant exists to rank.** Of the two labeled-assumption covenants computed above, the max-net-leverage assumption (+73.0% headroom) is nominally "tighter" than the min-interest-coverage assumption (+496.0% headroom), so if forced to name one, it would be **max net leverage**, purely because leverage headroom is numerically smaller — not because any evidence points to leverage being the operative constraint |
| Headroom on tightest covenant (%) | **+73.0%** (labeled-assumption max net leverage, 4.0x threshold vs. 1.08x actual) — indicative only, not a scored figure |
| EBITDA decline that would breach it (approx.) | LTM reported EBITDA ($7,474M) would need to fall to ≈$2,019M — a **73.0% decline** — to push net debt/EBITDA to the assumed 4.0x threshold, holding net debt at $8,075M constant. (Computed: $8,075M ÷ 4.0x = $2,019M; ($7,474M − $2,019M) ÷ $7,474M = 73.0%.) For context, `earnings/03_margin-drivers` / the module's own stress test (`06`) tests haircuts of −30%/−40%/−60% — none of those alone reach a 73% decline |
| Debt increase that would breach it (approx.) | Net debt would need to rise from $8,075M to ≈$29,896M — a **+$21,821M increase** — to hit the assumed 4.0x threshold, holding EBITDA at $7,474M constant. (Computed: 4.0x × $7,474M = $29,896M; $29,896M − $8,075M = $21,821M.) This is far larger than even the pro-forma Delivery Hero financing impact `01_capital-structure-and-leverage.md` §5 flags (gross debt "roughly doubling" from $12,945M, i.e. a debt increase on the order of $13bn, not $22bn) — so even the pending acquisition financing, sized at 01's own rough estimate, would not on its own trip this assumed threshold |

**Pro-forma flag carried forward from `01`.** None of the ratios or headroom figures above reflect the pending €14.2bn Delivery Hero bridge financing (signed 2026-07-16, expected close H2 2027) — a subsequent event not on the Jun-30-2026 balance sheet [`01_capital-structure-and-leverage.md` §5]. That facility will carry its own covenant package once drawn, which is not yet disclosed in this data pool; `06_downside-stress-test` should treat post-acquisition covenant terms as a distinct unknown, not an extension of the levels computed here.

## 4. Coverage / Covenant Read

Earnings cover fixed charges by a wide margin on every basis computed: EBITDA/interest is 17.9x on a TTM basis (14.3x on the more conservative FY2025 full-year figure), and fixed-charge coverage — which folds in $476M of FY2025 lease payments on top of interest — is still 6.5x. That coverage is real cash, not an accounting artifact: `earnings/06_earnings-quality.md` shows CFO running 150–200% of reported EBITDA in every profitable year, so the EBITDA feeding these ratios is conservative, not inflated. No maintenance covenant threshold is disclosed anywhere in the pool for the Term Loan, the Revolver, or any Senior Notes indenture — only "customary" and "certain financial" covenant language paired with a standing compliance statement — so this agent applies labeled, indicative assumptions (4.0x max net leverage, 3.0x min interest coverage) that show +73.0% and +496.0% headroom respectively; both are marked **Not assessable** for scoring per the module's partial-data rule, because the real thresholds, the covenant-EBITDA definition, and any addback caps are all undisclosed. What would actually move this picture is not organic earnings — a 73% EBITDA collapse or a >$21.8bn increase in net debt would be required to hit even the tighter labeled assumption — but the pending, not-yet-quantified Delivery Hero acquisition financing, whose covenant terms are a genuine unknown for the next module (`06_downside-stress-test`) to carry forward rather than infer from the levels computed here.



---

## balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md

_Source: `05_off-balance-sheet-and-contingencies.md`_

# Off-Balance-Sheet & Contingencies — UBER

Reporting currency: US dollars (USD, millions unless stated). Reporting standard: US GAAP. All balance-sheet figures are as of June 30, 2026 [Q2 FY26 10-Q, Condensed Consolidated Balance Sheets], unless a prior period is stated for trend. Total equity used for ratios below is $28,219M [Q2 FY26 10-Q, Balance Sheet, per `01_capital-structure-and-leverage.md` §5]. This agent's canonical debt figures are inherited from `01_capital-structure-and-leverage.md` and are not re-derived here.

## 1. Off-Balance-Sheet / Debt-Like Obligations

| Item | Recognized Liability | Maximum / Gross Exposure | Already in 01's debt stack? | Source |
|---|---:|---:|---|---|
| Operating leases | $2,008M lease liability (current $178M + non-current $1,830M), against $1,558M right-of-use assets — recognized **on** the balance sheet under US GAAP ASC 842 (not an off-balance-sheet item for Uber; shown here for comparability, per module convention) | Same as recognized — the lease liability is the present value of all contracted future payments; there is no additional undisclosed exposure beyond it | **No** — `01` explicitly excludes operating leases from its canonical "gross debt" figure ($12,945M) and shows this $2,008M only as a memo line | Q2 FY26 10-Q, Balance Sheet; `01_capital-structure-and-leverage.md` §2 |
| Finance leases | ~$222M (FY2025 balance, carried forward — not separately broken out at Jun-30-2026) | Same — the module treats this as debt, not a contingent item | **Yes** — already inside `01`'s canonical gross debt of $12,945M | FY25 10-K, Note 8; `01_capital-structure-and-leverage.md` §1 |
| Pension / OPEB underfunding | None — Uber discloses no defined-benefit pension or OPEB plan | n/a | n/a | CIQ Financials_Annual.xls & Financials_Quarterly.xls, Pension/OPEB tabs — "No Data Available"; `01_capital-structure-and-leverage.md` §2 |
| Securitization / factoring | Freight Holding (majority-owned, consolidated VIE) supplier financing program — a third-party financial institution pays Uber's freight suppliers early at a discount; Uber repays within 30 days | Recorded balance is **"immaterial"** per the company and sits inside accounts payable — no separate quantified figure disclosed | No — not part of `01`'s debt stack; it is a working-capital financing arrangement, not funded debt | Q2 FY26 10-Q, Note 13 (Non-Controlling Interests, Freight Holding Supplier Financing Program) |
| Purchase / non-cancelable commitments | $0 recorded (executory contracts, not yet a liability) | **~$3.5bn** (computed, not a single company-stated total): $2.4bn of non-cancelable commitments disclosed as of Dec-31-2025 (includes a $2.1bn 2022 cloud-computing agreement, term through Nov-2029) **plus** a new $1.1bn five-year cloud/infrastructure agreement signed March 2026 (through March 2031) disclosed in the Q2 FY26 10-Q as an incremental commitment. Separately, a July-2025 agreement to purchase (or have fleet operators purchase) a minimum of 20,000 Lucid vehicles equipped with Nuro Level-4 autonomous-driving systems over a six-year period has **no disclosed dollar amount** — the company states "our cash requirement has not been determined" | No — not part of `01`'s debt stack; these are ordinary-course committed operating spend, not financing obligations | FY25 10-K, "Purchase Commitments" (MD&A) and Note 14; Q2 FY26 10-Q, "Purchase Commitments and Other Contractual Obligations" (MD&A) |

## 2. Guarantees & Letters of Credit

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| Standby letters of credit | $0 recorded (off-balance-sheet unless drawn) | **$2.3bn** outstanding as of Jun-30-2026 (up from $1.9bn at Dec-31-2025); of this, $324M reduces available capacity under the $5.0bn Revolving Credit Agreement (Jun-30-2026: $343M at Dec-31-2025) | Securing obligations related to leases, insurance contracts, and other contractual obligations | Q2 FY26 10-Q, Note 5 (Letters of Credit) |
| Unconsolidated-VIE exposure (incl. Moove, a related party) | $1,491M — carrying amount of assets recognized on the balance sheet for unconsolidated VIEs (Jun-30-2026), including a $442M term loan to Moove Cars Mobility, a related party since 2021 (equity investment + term loan + commercial partnership) | **$1,546M** — company-stated "maximum exposure to loss," which already includes the $1,491M of recognized carrying value plus "immaterial" financial guarantees. Incremental exposure beyond what is already recognized as an asset ≈ **$55M** (computed: $1,546M − $1,491M) | Privately held vehicle-fleet operators, primarily Moove | Q2 FY26 10-Q, Note 12 (Variable Interest Entities) |
| Indemnification provisions | $0 recorded — unquantifiable | **Not determinable.** The company states directly: "It is not possible to determine the maximum potential loss under these indemnification provisions / obligations because of the unique facts and circumstances involved in each particular situation" — this covers standard third-party indemnities, officer/director indemnification agreements, and charter/bylaw indemnification obligations | Third parties in ordinary-course contracts; officers, directors, and certain current/former employees | Q2 FY26 10-Q, Note 11 (Indemnifications) |

## 3. Litigation & Tax Contingencies

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) | Source |
|---|---:|---:|---|---|
| Aggregate legal, regulatory & non-income-tax matters (driver/courier misclassification across the US, Switzerland, France and other jurisdictions; FCRA; background-check; pricing/advertising; unfair competition; IP; employment discrimination; ADA; data/privacy; securities; antitrust claims) | **$1.8bn** recorded as of Jun-30-2026 (down from $2.1bn at Dec-31-2025, up from $1.5bn at Dec-31-2024) — of which $208M (Jun-30-2026) / $215M (Dec-31-2025) relates specifically to non-income-tax matters. Recorded "for all legal, regulatory and non-income tax matters that were probable and reasonably estimable" | Company's own language: "based on our current knowledge, we believe that the ultimate amount or range of reasonably possible loss will not, either individually or in the aggregate, have a material adverse effect on our business, financial position, results of operations, or cash flows" — **no larger figure is disclosed**; the company separately warns that if any matter is resolved "for amounts in excess of management's expectations," results "could be materially adversely affected" | **Active** — California Attorney General driver-misclassification suit (filed 2020, injunction dissolved 2021, case remitted to Superior Court Jan-2024, stay lifted Jul-2024, ongoing); Swiss Social Security rulings (Federal Tribunal 2023/2024, still litigated through 2022 contribution years, Geneva Canton ruling under appeal); URSSAF France reassessment (issued Dec-2024, appealed by Uber Jun-2025, unresolved); New Jersey DOL 2019–2023 audit (preliminary assessment Dec-2024, disputed, in litigation before NJ Office of Administrative Law) | Q2 FY26 10-Q, Note 11; FY25 10-K, Note 14; FY25 10-K, Item 3 Legal Proceedings |
| UK VAT Order 1987 dispute (HMRC) | **$0 new liability recorded.** The disputed amount was already paid in cash during 2023–2025 to allow the appeal to proceed, and is booked as a **receivable in other assets** because the company "believe[s]" it will win the appeal and be repaid with interest | **≈$1.8bn (£1.4bn)** — the total of assessments received as of Jun-30-2026 covering March 2022 to September 2024. This entire amount is at risk of write-off (asset impairment, not a new cash outflow) if the appeal fails. **Additional** future assessments for 2023–2025 are separately expected and — per the company — "would decrease operating cash flow" if payment is required, i.e., a further, not-yet-quantified live cash exposure on top of the $1.8bn already paid | **Active** — appeal pending; company is "waiting to obtain hearing dates from the Tax Tribunal"; HMRC has said it will not enforce further assessments until a related competitor's appeal is decided. A January-2026 UK legislative change also means Uber ceased applying the VAT Order 1987 basis going forward, adding uncertainty on the post-2026 VAT treatment | Q2 FY26 10-Q, Note 11 (Non-Income Tax Matters — United Kingdom) |
| California EDD unemployment-insurance audit (couriers, 2018–2020 Postmates period) | Recorded within accrued liabilities at Dec-31-2025; settlement reached September 2025, approved by the CA Attorney General's office and the CA Unemployment Insurance Appeals Board; **fully paid in January 2026** (amount not separately disclosed) | Same as recorded — resolved, no further exposure | **Dormant / resolved** | FY25 10-K, Note 14 |

## 4. Contingent Exposure Summary

| Metric | Value |
|---|---:|
| Total recognized contingent liabilities | **$1.8bn** (litigation/regulatory/non-income-tax reserve, Jun-30-2026 — the only item the company records as a contingency liability) |
| Total maximum / gross exposure (quantified, genuinely contingent items: litigation ceiling + UK VAT at risk + incremental VIE exposure) | **≈$3.66bn** = $1.8bn (litigation — no disclosed excess over the recorded accrual) + $1.8bn (UK VAT already paid, at risk of write-off) + $0.055bn (VIE incremental, computed) |
| Max exposure ÷ recognized | **~2.0x** ($3.66bn ÷ $1.8bn) |
| Max exposure ÷ total equity ($28,219M) | **~13.0%** ($3.66bn ÷ $28,219M) |
| Memo — broader total if standby LCs ($2.3bn face) and non-cancelable purchase commitments (~$3.5bn) are added | ≈$9.46bn → ~5.3x recognized / ~33.5% of equity. **Excluded from the ratio above** because LCs collateralize obligations Uber already recognizes elsewhere (insurance reserves, lease liabilities — no new loss if drawn) and purchase commitments are near-certain committed operating spend for services to be received, not uncertain loss contingencies. Shown here for transparency, not treated as a "spike." |
| Unquantifiable items excluded from both totals | Indemnification provisions (company states a maximum cannot be determined); the Lucid/Nuro 20,000-vehicle purchase commitment (cash requirement "not yet determined"); any excess litigation loss beyond the $1.8bn accrual (company states none is currently estimable) |

## 5. Contingency Read

The single largest live, quantified exposure is the UK VAT Order 1987 dispute with HMRC — Uber already paid roughly $1.8bn (£1.4bn) in cash between 2023 and 2025 to pursue an appeal it expects to win, and that entire amount sits on the balance sheet as a receivable rather than cash; if the appeal fails, it becomes an impairment of about 6.4% of Uber's $28,219M equity, and the company itself flags that further, not-yet-quantified assessments for the same period are still coming. The $1.8bn aggregate litigation/regulatory reserve is genuinely live (active driver-misclassification suits in California, Switzerland, France, and New Jersey), but the company states — and this module has no evidence to contradict — that it does not expect losses beyond that accrual to be individually or collectively material; no company-disclosed figure exists to size a bigger number, and indemnification exposure is explicitly stated as undeterminable. On the narrow, comparable-item basis (litigation ceiling + UK VAT + VIE), maximum exposure of ~$3.66bn against $1.8bn recognized (~2.0x) and 13.0% of equity sits below the mechanical spike thresholds in this module's rules; it clears the bar only if standby letters of credit and ordinary-course purchase commitments — neither of which represents an uncertain loss the way litigation or a guarantee does — are added in.

**Partial data.** Uber is a structurally litigious name (recurring, multi-jurisdiction driver-classification disputes that have run for years with no end date, plus an active regulator dispute worth $1.8bn), and the company explicitly declines to quantify the maximum for indemnifications and for any litigation loss beyond the recorded accrual. Undisclosed exposure beyond the $1.8bn reserve cannot be ruled out. Per MODULE_RULES.md's score-cap table ("Off-balance-sheet exposures undisclosed for a known-litigious/levered name"), `01`/`06`/`99` should apply a Solvency strength cap of max 75 on this basis.



---

## balance-sheet-survival / 06_downside-stress-test.md

_Source: `06_downside-stress-test.md`_

# Downside Stress Test — UBER

Reporting currency: US dollars (USD, millions unless stated). All figures are as of the June 30, 2026 balance sheet (the latest in the data pool) unless stated otherwise, and follow the canonical basis `01_capital-structure-and-leverage.md` designates for this module: gross debt = interest-bearing debt + finance leases ($12,945M); net debt = the **strict** basis (gross debt − cash & equivalents only) = **$8,075M** [`01` §7]. All stressed figures below were computed with an executed Python script (not by hand); the formulas are shown inline so the reader can reproduce every number.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | $7,474M (LTM reported EBITDA, twelve months ended Jun-30-2026, GAAP Income from operations + D&A) | `01` §5/§7; `earnings/01_historical-financials.md` |
| Net debt (canonical, strict, §15) | $8,075M | `01` §4/§7 |
| Net debt / EBITDA | 1.08x | `01` §5 |
| EBITDA / interest | 17.9x ($7,474M ÷ $418M TTM interest expense) | `04` §1 |
| Tightest covenant + threshold | **No numeric maintenance covenant is disclosed.** `04` applies a labeled-assumption max net leverage covenant of 4.0x (indicative only, "Not assessable" for scoring) — this is the tightest of the two labeled assumptions (max leverage 4.0x vs. min interest coverage 3.0x) and is used below for illustrative breach solves | `04` §2/§3 |
| Next-12m obligations (gross-obligations basis) | $2,778M = $2,000M Term Loan maturity (Dec-2026) + ~$470M cash interest (annualized H1 proxy) + $308M capex + $0 committed dividends/buybacks | `02` §1; `03` §2 |
| Committed liquidity | $10,391M = $4,870M cash + $521M short-term investments + $5,000M fully-available, undrawn Revolver | `03` §1 |
| Floating-rate debt (gross) | $2,000M (15.4% of gross debt) — the 2026 Term Loan only; the $5.0bn Revolver is also floating but undrawn | `02` §3 |
| Hedge coverage (interest rate) | **None disclosed.** No interest-rate swap or cap found against the Term Loan or Revolver | `02` §3 |
| Working-capital seasonality / peak build | Moderate, not extreme: ~4.2-point spread between the smallest quarter (Q1, ~23.0% of annual revenue) and the largest (Q4, ~27.2%); no peak-quarter cash-usage figure is disclosed | `03` §3 |

Reporting currency: USD. EBITDA basis: LTM (twelve months ended Jun-30-2026) **reported/GAAP-basis** EBITDA (Income from operations + D&A), not Uber's discontinued non-GAAP "Adjusted EBITDA" (last disclosed FY2025 at $8,730M, stale and no longer reported from Q1 FY2026 onward) [`01` §5, §7]. This EBITDA is cash-backed, not merely accounting profit: `earnings/06_earnings-quality.md` §1–§2 shows CFO has exceeded reported EBITDA by 150–202% in every profitable year (185.5% FY2023, 201.8% FY2024, 160.0% FY2025), so using reported EBITDA as the stress base is, if anything, conservative relative to the cash the business actually throws off — it is not inflated by the addbacks (stock-based compensation, legal-reserve releases) that make Uber's own discontinued Adjusted EBITDA run 38.9% above the GAAP figure [`earnings/06` §7].

**Subsequent-event flag carried forward.** None of the figures above reflect the pending Delivery Hero acquisition (signed 2026-07-16, ~$14.8bn equity value, funded via a new €14.2bn bridge credit agreement; expected close H2 2027) — it is a subsequent event not on the Jun-30-2026 balance sheet [`01` §5]. §2a below builds the pro-forma overlay this creates.

## 2. Stress Scenarios (as-reported base)

All computed via an executed Python script. Formulas: Net leverage = net debt (held constant at $8,075M) ÷ stressed EBITDA. Coverage = stressed EBITDA ÷ interest (held constant at $418M, except the rate-shock column). Covenant headroom (MAX form, per `04`/MODULE_RULES) = (4.0x − actual leverage) ÷ 4.0x. Stressed FCF(h) = FCF_base ($10,116M TTM) − EBITDA₀ × h × (1 − tax); tax = 21% (labeled assumption, US statutory rate — conservative, since Uber's actual recent cash tax rate has run far lower, ~5–6% of EBITDA per `earnings/06` §1 cash-tax-paid figures, so this assumption understates surviving FCF rather than flatters it). Liquidity gap = next-12m obligations − (committed liquidity + stressed FCF); a negative number is a surplus.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | $7,474M | $5,232M | $4,484M | $2,990M | $4,484M | $4,484M |
| Net debt / EBITDA | 1.08x | 1.54x | 1.80x | 2.70x | 1.80x | 1.80x (unaffected — leverage covenant uses net debt/EBITDA, not interest) |
| EBITDA / interest | 17.9x | 12.5x | 10.7x | 7.2x | 10.7x | 9.8x ($4,484M ÷ $458M — interest up $40M from +200bp on the $2,000M unhedged floating Term Loan) |
| Tightest covenant headroom (labeled 4.0x max leverage, MAX form) | +73.0% | +61.4% | +55.0% | +32.5% | +55.0% | +55.0% |
| Covenant breach? (Y/N) | N | N | N | N | N | N |
| 12-month liquidity gap | −$17,729M (surplus) | −$15,958M (surplus) | −$15,367M (surplus) | −$14,186M (surplus) | −$14,815M (surplus; obligations +$552M for a labeled 1%-of-TTM-revenue WC build) | −$15,327M (surplus; obligations +$40M for the rate shock) |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

**Deep-cyclical calibration — not applied, and why.** `business-model/10_external-dependency.md` rates Uber's consumer-cycle exposure "Mid-High" for the Delivery segment specifically (about one-third of FY2025 revenue) but does **not** classify Uber as a deep cyclical/commodity name with a proven multi-year trough-to-peak EBITDA range: Uber's EBITDA was negative through FY2022 for scale-driven reasons (a young, subscale platform), not a macro trough, so there is no clean historical trough to calibrate a haircut against [`01` §5 cyclicality note; `10_external-dependency` §1, §4]. No history-calibrated scenario is added on that basis — this is a stated absence of usable history, not a finding that Uber is immune to a downturn.

## 2a. Pending-Acquisition (Pro-Forma) Overlay — Delivery Hero

Uber signed a business combination agreement on 2026-07-16 to acquire Delivery Hero SE for ~$14.8bn of equity value (100% cash consideration, €41.50/share), executed a €14.2bn bridge credit agreement the same day to help fund it, and expects to close in H2 2027 [`01` §5]. This is material, debt-funded, and not yet on the balance sheet — per the workflow's pending-acquisition rule, a pro-forma base is built here, on the same strict net-debt basis as the rest of this report.

**Currency conversion.** No dated EUR/USD rate exists in the data pool. A web-sourced rate is used, labeled per §4/§27: **EUR/USD = 1.1552** [Web: open.er-api.com exchange-rate feed, 2026-08-08, indicative/unverified]. €14.2bn × 1.1552 ≈ **$16,404M**.

| Step | Value | Reasoning |
|---|---:|---|
| Current net debt (strict) | $8,075M | `01` §7 |
| + Debt-funded consideration (full bridge facility, USD-converted) | $16,404M | The bridge is disclosed only as "help[ing] fund" the acquisition, with no pool-disclosed breakdown between equity consideration, fees, and any refinancing of Delivery Hero's own debt. The full bridge is added rather than separately adding Delivery Hero's own consolidating net debt on top — adding both would double-count if the bridge already covers target-debt refinancing |
| + Delivery Hero's own consolidating net debt | Not added separately (see above) | Avoids double-counting the funding leg already captured in the bridge |
| **Pro-forma net debt** | **≈$24,479M** | Computed |
| **Pro-forma gross debt** | **≈$29,349M** (≈2.27x current $12,945M — "roughly double," consistent with `01` §5 and `business-model/11` §1's independent "roughly double" characterization) | Computed |

**EBITDA perimeter.** Delivery Hero's own EBITDA is **not disclosed anywhere in this data pool** — it is a German-listed company outside Uber's filings and outside the pool's scope. Per the workflow rule, this is stated plainly rather than fabricated. Pro-forma EBITDA below uses **Uber's own EBITDA only ($7,474M)** — this is a deliberate, conservative floor: the debt perimeter includes financing for the entire target (potentially including its own debt), while the EBITDA perimeter excludes the target's earnings entirely. This overstates pro-forma leverage rather than understates it (Core Principle: assume the more fragile reading when data is thin) — if Delivery Hero's own EBITDA becomes available, true pro-forma leverage would read lower than shown here, not higher.

| Metric | Pro-forma, Uber-only EBITDA (floor/conservative) | Pro-forma, on stale FY2025 Adjusted EBITDA ($8,730M) |
|---|---:|---:|
| Net debt / EBITDA, base (0% haircut) | **3.28x** | 2.80x |
| Net debt / EBITDA, −30% EBITDA | 4.68x | — |
| Net debt / EBITDA, −40% EBITDA | 5.46x | — |
| Net debt / EBITDA, −60% EBITDA | 8.19x | — |

Uber is not classified as a deep cyclical (§2 above), so no separate mid-cycle EBITDA series exists for it; the "stale FY2025 Adjusted EBITDA" column is shown alongside as the only other EBITDA basis this module has anchored, not as a true normalised/mid-cycle read — flagged as such.

**What this means.** Pro-forma leverage of ~3.3x today (Uber-only-EBITDA basis) is already triple the current 1.08x, and a plain −40% EBITDA decline would push it to ~5.5x — above the 4.0x labeled covenant assumption tested in §2, though that assumption applies to *today's* debt instruments, not to whatever covenant package the new bridge/permanent Delivery Hero financing carries (undisclosed) [`04` §3 pro-forma flag]. **Coverage cannot be computed for the pro-forma structure** — the interest rate and terms of the eventual permanent financing that will replace the bridge are not yet disclosed [`02` §5]. This overlay is a magnitude check, not a probability-weighted forecast: the deal has not closed, remains subject to conditions, and is not expected to close until H2 2027.

## 3. Break Points

All haircuts and solves below use the **as-reported** base ($8,075M net debt, $7,474M EBITDA, $418M interest), computed via an executed Python script.

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest labeled covenant breaches (max net leverage, 4.0x, MAX form) | **73.0%** |
| Min interest coverage covenant breaches (3.0x, MIN form, for reference — not the tightest) | 83.2% |
| Net leverage exceeds an illustrative 6.0x refi-market threshold (MAX form) | 82.0% |
| Committed liquidity exhausted within 12 months | **Does not breach on an EBITDA decline alone** — solve returns h ≈ 300% |

**Covenant breach solve (MAX/ceiling form)** — holding net debt constant at $8,075M: `h = 1 − net debt ÷ (T × EBITDA) = 1 − 8,075 ÷ (4.0 × 7,474) = 1 − 8,075 ÷ 29,896 = 0.730` → **73.0% decline**. This matches `04` §3's own independent computation exactly. At that point stressed EBITDA is ≈$2,019M.

**Min-coverage breach solve (MIN/floor form)** — holding interest constant at $418M: `h = 1 − (T × interest) ÷ EBITDA = 1 − (3.0 × 418) ÷ 7,474 = 1 − 1,254 ÷ 7,474 = 0.832` → **83.2% decline**. Interest coverage is the looser of the two labeled covenants — leverage breaks first.

**Refi-threshold solve** — same MAX form with T = 6.0x: `h = 1 − 8,075 ÷ (6.0 × 7,474) = 1 − 8,075 ÷ 44,844 = 0.820` → **82.0% decline**.

**Liquidity exhaustion solve.** Usable liquidity is $10,391M (no minimum-liquidity covenant is disclosed to net against it, and no restricted/trapped cash is included in this figure — `03` §1 already excludes $11,793M of restricted cash/investments). Solving `liquidity + FCF(h) = next-12m obligations` for h: `h = (liquidity + FCF_base − obligations) ÷ (EBITDA₀ × (1 − tax)) = (10,391 + 10,116 − 2,778) ÷ (7,474 × 0.79) = 17,729 ÷ 5,904.5 = 3.00`. **This is h ≥ 1** — the rule for that case applies directly: liquidity does **not** run out on an EBITDA decline alone. The mechanical check confirms it: even at a complete, 100% EBITDA wipeout (h=1.0), stressed FCF under this scaling is still $10,116M − $5,904.5M = **$4,212M**, comfortably above the $2,778M of 12-month obligations, before touching a dollar of the $10,391M in-hand liquidity. This result reflects Uber's FCF running well above its own EBITDA (TTM FCF $10,116M vs. TTM EBITDA $7,474M, per `earnings/06` §1) combined with a small, already-covered 12-month obligations bucket — not a claim that cash flow is literally EBITDA-decline-proof in a real, non-linear stress (working-capital reversals, an accelerated insurance-claims payout, or a stop to buyback discretion could all move the picture in ways a linear EBITDA-to-FCF scaling does not capture — see the caveats below).

## 4. Survival Read

Uber does not break under a 30%, 40%, or even 60% EBITDA decline on the as-reported balance sheet: net leverage only reaches 2.70x at the −60% haircut (versus the labeled 4.0x covenant assumption), interest coverage stays above 7x, and the 12-month liquidity picture stays a multi-billion-dollar surplus in every column of §2 — no covenant breach, no liquidity gap, no need for a waiver, an asset sale, or an equity raise at any of the tested haircuts. The **first thing that would actually break** is the labeled max-leverage covenant assumption, and it takes a **73% EBITDA decline** to reach it — a level far beyond a normal recession and closer to an existential event for the business; the true threshold could sit closer or farther away since no instrument in the pool discloses a real numeric covenant (`04` §2). Under a market-closure test (no new unsecured issuance for 12 months): the only obligation due in that window, the $2,000M Term Loan maturing December 2026, is covered 2.7x over by cash and short-term investments alone ($5,391M) without touching the undrawn $5.0bn Revolver or TTM FCF — nothing breaks. Uber is **not** net cash (it carries $8,075M of net debt, strict basis), but its net leverage of 1.08x is low enough, and its liquidity cushion deep enough, that a normal-recession-scale EBITDA decline (30–40%) is survivable with room to spare on this report's figures alone.

The one genuine unknown this report cannot resolve from the data pool is what happens if the Delivery Hero bridge converts to permanent financing at scale before any downturn hits: §2a shows pro-forma leverage already at ~3.3x on day one (versus 1.08x today) and rising toward ~5.5x under a −40% EBITDA haircut — a materially thinner cushion than the as-reported picture, on a covenant package this pool does not yet disclose. Two smaller latent items sit outside the mechanical EBITDA-decline math entirely: a $1.8bn UK VAT (HMRC) receivable already paid in cash that could be impaired if Uber's appeal fails, and a further, not-yet-quantified live cash exposure the company itself flags for later VAT assessments [`05` §3] — neither is EBITDA-driven, so neither is captured by the haircuts above, but both would land on the same balance sheet this stress test is testing.
