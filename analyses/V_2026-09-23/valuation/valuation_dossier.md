# valuation Module Dossier — V

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-09-24T04:19:28Z
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

# Valuation Module — V (Synthesis)

## Abstract

Visa is fairly valued but leans expensive: the fresh $361.52 indicative close is 9.0% above the $331.56 base value, while the canonical $364.15 pool price is stale. The 12-month bull/base/bear levels are $425.88/$331.56/$283.37, driven mainly by own-history and Mastercard-based multiples, with a discounted-cash-flow model as a 25% cross-check. At a 9.04% WACC, the blended cost of capital, the price implies 19.67% annual cash-flow-after-capex growth for five years; that is a stretch, though a 7.15% rate reconciles the base cash flows. Margin of safety—the discount from price to base value—is negative 9.0% at the fresh quote, and loss to bear is 21.6%. The verdict is fairly valued, with confidence capped at 55 by 51.1% method dispersion.

## 1. Valuation Verdict

- **Verdict:** **Fairly valued** — the fresh indicative price is 9.04% above the $331.56 base fair value; the stale pool price is 9.83% above it. [Valuation 07, §§3–4]
- **Base-case fair value (point, per share):** **$331.56**, 12-month horizon. [Valuation 07, §§2–3]
- **Current price:** **$364.15**, pool-verified close on 2026-08-17 but 26 U.S. trading days stale; freshest context is **$361.52** on 2026-09-23, indicative and web-sourced, not pool-verified. [Valuation 01, §§1, 7]
- **Bull / Base / Bear fair-value levels (points):** **$425.88 / $331.56 / $283.37**, each on a 12-month horizon. [Valuation 07, §3]
- **Cross-method dispersion (football field, the span across independent methods):** **$243.23–$367.62** per share; the 51.14% high-to-low spread is measured relative to the low value. [Valuation 07, §§1–2]
- **Valuation attractiveness /100 (higher = cheaper):** **38** — both price anchors exceed the base value, and the own-history and peer points sit near rather than materially above the market. [Valuation 02, §§4–6; Valuation 03, §§5–7; Valuation 07, §4]
- **Margin of safety /100 (higher = better):** **32** — the cushion is negative 9.04% at the fresh indicative quote and negative 9.83% at the stale pool anchor. [Valuation 07, §4]
- **Valuation confidence /100:** **55** — capped by the 51.14% independent-method spread; the stale-price cap of 60 is less restrictive. [Valuation 07, §§2, 4]
- **Downside risk /100 (higher = worse; inverted):** **64** — loss to the $283.37 bear value is 21.62% from the fresh indicative quote and 22.18% from the stale pool price. [Valuation 07, §§3–4]
- **Data quality /100:** **82** — all core statements, estimates, capital-structure data and method inputs are present, but the pool price is stale, the direct-peer set contains only Mastercard, and the estimate set is dated. [Valuation 00, §§3–6; Valuation 03, §§1–3]
- **Overall usefulness /100:** **78** — the module supplies reproducible levels and a conditional expectations test, but the method gap prevents a tight fair-value conclusion. [Valuation 04, §§6–8; Valuation 05, §§2–5; Valuation 07, §§1–6]
- **Dominant valuation method:** Multiples are primary: own-history and peer methods carry 75% of the base point, led by the 40% own-history weight; the scenario levels are expressed as next-twelve-month enterprise value to EBITDA (EV/EBITDA, enterprise value divided by earnings before interest, tax, depreciation and amortization). [Valuation 07, §§1–3]
- **What's priced in:** Conditional on the 9.04% WACC, $364.15 implies 19.67% annual free-cash-flow growth (cash from operations minus total capital spending) for five years, FY31 revenue of about $101.1bn and a 63.0% EBIT (operating-profit) margin; those expectations are a stretch and not proven. Holding the DCF cash flows fixed instead implies a 7.15% WACC, so the warning is conditional rather than conclusive. [Valuation 05, §§2–5]
- **Biggest valuation risk:** Regulation and client-incentive pressure could cut both the $34.971bn next-twelve-month vendor EBITDA denominator and the 18.338x warranted base multiple at the same time. [Valuation 07, §§3, 5; Earnings Synthesis, §§1A, 5]

## 1A. Module Disconfirmation

- **Strongest bear point:** The intrinsic DCF gives **$243.23**, 33.2% below the stale pool price, while the 9.04% WACC reverse solve requires 19.67% five-year free-cash-flow growth versus 10.4% in FY21–FY25 and a 4.8% latest-twelve-month (LTM) decline. [Valuation 04, §§6–8; Valuation 05, §§2–3]
- **Strongest bull point:** The exact DCF base cash flows reconcile to the current enterprise value at a **7.15%** WACC, while the own-history and peer points of **$355.21** and **$367.62** sit close to the market; this supports the fairly-valued rather than materially-overvalued read. [Valuation 02, §4; Valuation 03, §5; Valuation 05, §2A]
- **Single killer risk:** The correct discount rate remains unresolved, and 74.3% of DCF enterprise value comes from the terminal value; a modest rate or terminal-reinvestment error can move the intrinsic result enough to change the verdict. [Valuation 04, §§3A, 5, 7; Valuation 05, §2A]
- **Disconfirming evidence already visible:** Q3 incentives rose 18% versus 14% net-revenue and 10% processed-transaction growth, while EBIT margin fell 161 basis points; that evidence challenges both the bull EBITDA case and any return to a mean multiple. [Business-Model Synthesis, §1A; Earnings Synthesis, §§1A, 3]

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | **Sufficient.** | Every core valuation input is present; the main limitation is the $364.15 pool price being 26 U.S. trading days stale. [Valuation 00, §§3–6] |
| price-and-capital-structure | **Pool-verified price, but stale.** | The canonical bridge uses $11.499bn strict net debt, $514m preferred equity, 1,898m diluted shares for fair value and $680.449bn enterprise value at the pool price. [Valuation 01, §§2–7] |
| multiples-own-history | **No material own-history reversion case.** | The selected $355.21 own-median EV/revenue value sits 2.5% below the stale pool price; operating multiples are near their five-year centres. [Valuation 02, §§3–6] |
| relative-valuation-peers | **Visa's forward earnings-multiple discount is broadly warranted.** | The adjusted Mastercard NTM P/E gives $367.62, but the direct quantitative sample is one company and sector-multiple history is unavailable. [Valuation 03, §§4–7] |
| intrinsic-dcf | **Low-confidence intrinsic value of $243.23.** | The $201.90–$311.02 sensitivity is driven by WACC and financeable terminal reinvestment; terminal value is 74.3% of enterprise value. [Valuation 04, §§5–8] |
| reverse-dcf | **Demanding growth hurdle, conditional on the discount rate.** | Price implies 19.67% five-year free-cash-flow growth at 9.04% WACC, but the base cash flows also match price at 7.15% WACC. [Valuation 05, §§2–5] |
| sum-of-the-parts | **Collapsed single-segment check; not independent.** | Payment Services is the only reportable segment, and the $352.51 output repeats the Mastercard-based whole-company EBITDA method. [Valuation 06, §§1–5] |
| scenario-and-fair-value | **$425.88 bull / $331.56 base / $283.37 bear.** | The independent-method field spans $243.23–$367.62, or 51.14% relative to the low, forcing the 55 confidence cap. [Valuation 07, §§2–6] |

## 3. Reconciliation

The independent-method field spans **$243.23 to $367.62**, a **$124.39** gap or **51.14%** relative to the low, so the disagreement leads the conclusion and caps confidence at 55. The DCF is the low outlier because it uses a 9.04% WACC, financeable terminal reinvestment and analyst-built FY27–FY31 assumptions; own-history gives $355.21 and the adjusted Mastercard peer read gives $367.62. The lower DCF cannot be discarded because the 9.04% reverse solve requires 19.67% annual free-cash-flow growth, but it cannot dominate because the same base cash flows match the market at a 7.15% WACC. [Valuation 02, §4; Valuation 03, §5; Valuation 04, §§2–8; Valuation 05, §§2–5]

The reconciled base is the mechanical **$331.56** blend: 40% own history, 35% peer and 25% DCF. This obeys the multiples-first rule for an operating business; the $352.51 collapsed SOTP has zero weight because it reuses the peer EBITDA method. The base is then expressed coherently as $34.971bn of next-twelve-month vendor EBITDA at 18.338x, bridged with $11.499bn strict net debt, $514m preferred equity and 1,898m diluted shares. [Valuation 06, §§3–5; Valuation 07, §§1–3]

**Sector Cycle Reality Test roll-up:** Both `02` and `03` say **Not assessable — no sector-level multiple history**. Neither emits `RF-VAL-001` nor `RF-VAL-002`, so the same-direction compounding cap does not fire. Their apparent proximity is still not independent proof: own history records where the market valued Visa, while the peer point rests on one current Mastercard observation, and neither anchor is proven cycle-stable. [Valuation 02, §5; Valuation 03, §§1, 6; Valuation 07, §2]

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N | MoS, downside-to-bear, observed up/down, attractiveness + confidence | No cap; price-state is `pool-verified`. |
| Stale pool-verified price, more than 15 trading days old | Y | Valuation confidence; price-relative reads carry staleness warning | **Max 60**; superseded by the 55 dispersion cap. |
| No consensus / forward estimates | N | Valuation confidence | No cap. |
| No peer data | N | Overall usefulness | No cap; one direct quantitative peer is available. |
| Only one valuation method usable | N | Valuation confidence | No cap; own history, peers and DCF produce independent values. |
| No cash flow AND DCF is only method | N | Valuation confidence | No cap. |
| SOTP not possible for multi-segment | N | Overall usefulness | No cap; Visa is a single-reportable-segment company and SOTP collapses by design. |
| Full high-to-low field of valid value-producing methods exceeds 40% | **Y** | Valuation confidence | **Max 55**. |
| Terminal value >75% of DCF EV | N | Valuation confidence | No cap; forward DCF terminal share is 74.3%. |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | N | Valuation attractiveness | No cap; no controller or value-maximizing parent is identified. [Management-Governance Synthesis, §§1–1A] |
| Sector Cycle Reality Test flags `02` and/or `03` cycle-elevated/depressed, unreconciled | N | Valuation confidence | No flag cap; both tests are Not assessable and the gap is disclosed. |

The most restrictive active limit is the **55** maximum from cross-method dispersion. The absent sector-multiple history carries no automatic cap, but it prevents treating the two multiple anchors as cycle-stable corroboration. [Valuation MODULE_RULES, Score Cap Rules; Valuation 07, §2]

## 5. Fair-Value Summary

The 12-month fair-value levels are **$425.88 bull, $331.56 base and $283.37 bear**, with the base driven mainly by the 40% own-history and 35% peer-multiple weights and checked by a 25% DCF weight. [Valuation 07, §§1–3] At $364.15, the market conditionally requires 19.67% five-year free-cash-flow growth if 9.04% is the right WACC; the earnings and moat evidence call that a stretch, although the 7.15% dual solve leaves a lower-rate explanation open. [Valuation 05, §§2–5; Business-Model Synthesis, §1; Earnings Synthesis, §§1, 5] Margin of safety is **negative 9.04%** at the fresh $361.52 indicative quote and **negative 9.83%** at the stale pool price, while downside to the $283.37 bear is **21.62%** and **22.18%**, respectively. [Valuation 07, §4] This is not an owner-induced value trap because no controlling owner is identified, but the present 19.5x next-twelve-month EBITDA multiple is vulnerable if regulation and incentives make the Street EBITDA path too high. [Valuation 02, §§1, 6; Valuation 07, §5; Management-Governance Synthesis, §1] The multiple methods deserve the larger weight for this operating company, while the DCF is best retained as a downside cross-check rather than treated as a precise target because 74.3% of its enterprise value is terminal and its discount-rate interpretation is unresolved. [Valuation 04, §§3A, 5–8; Valuation 05, §2A]

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Fairly valued — fresh price is 9.04% above the $331.56 base value | A pool-verified price below $331.56 without a cut to the $34.971bn next-twelve-month EBITDA estimate, or evidence that Visa warrants more than 18.338x because incentives and margins improve. | A cut to next-twelve-month EBITDA, continued incentive growth above revenue, or cash-flow evidence that validates the $243.23 DCF and a multiple near the 17.47x historical floor. | **One fresh pool-verified V closing price from Capital IQ or IBKR** to replace the 2026-08-17 anchor and make the price-relative reads current. |

## 7. Note To The Final Synthesizer

- Use **$425.88 bull / $331.56 base / $283.37 bear**, all on a 12-month horizon; the base is 75% multiples-led and 25% DCF. [Valuation 07, §§1–3]
- At the stale $364.15 pool price, 9.04% WACC implies **19.67%** five-year free-cash-flow growth and about **$101.1bn** FY31 revenue at a 63.0% EBIT margin; this is a stretch, not proven. The same base cash flows imply a **7.15%** WACC, so carry both readings. [Valuation 05, §§2–5]
- Margin of safety is **negative 9.04%** at the fresh $361.52 indicative quote and **negative 9.83%** at the stale pool anchor; loss to the **$283.37** bear is **21.62%** and **22.18%**, respectively. [Valuation 07, §4]
- No owner-induced value-trap cap applies: Visa has no identified controller. The 18.338x base multiple is below the 19.5x current and 19.48x adjusted-peer readings because the moat is strong but stable, while regulation and incentives can reduce the economics. [Valuation 07, §5; Business-Model Synthesis, §§1, 3; Management-Governance Synthesis, §1]
- Trust the multiple blend most for this operating company, particularly the reported-revenue own-history anchor; discount the single-peer precision and use the $243.23 DCF as a downside cross-check, not an equally precise central estimate. [Valuation 02, §4; Valuation 03, §§1, 5; Valuation 04, §§6–8]
- Partial-data limit: the price is pool-verified but 26 trading days stale, imposing a 60 confidence maximum and mandatory staleness labels. The wider 51.14% method field is stricter and sets the final confidence maximum at 55. [Valuation 01, §1; Valuation 07, §§2, 4]
- Highest-value next data request: **a fresh pool-verified V closing price from Capital IQ or IBKR**.
- **Explicit handoff:** The master synthesizer's “Valuation and Peer Mispricing” section should defer to this synthesis. These bull/base/bear fair-value **levels** are the inputs to the master's probability-weighted scenario model; the master, not this module, assigns probabilities.

## 8. Simple Summary

- Visa is fairly valued but leans expensive: the fresh indicative price is 9.04% above the $331.56 base value. [Valuation 07, §4]
- The 12-month fair-value levels are **$425.88 bull, $331.56 base and $283.37 bear**. [Valuation 07, §3]
- At 9.04% WACC, the market price needs 19.67% annual free-cash-flow growth for five years; that is a stretch, not proven. [Valuation 05, §§2–5]
- Loss to the bear is **21.62%** from $361.52 and **22.18%** from $364.15; the bear value is **$283.37**. [Valuation 07, §4]
- Multiples matter most; the DCF is a lower-value cross-check because its terminal value and discount rate drive much of the result. [Valuation 04, §§3A, 5–8; Valuation 07, §§1–2]
- No controlling-owner value trap is identified, but regulation and incentives can make the current multiple undeserved. [Valuation 07, §5; Management-Governance Synthesis, §1]
- A current price exists, but the **$364.15** pool close is 26 trading days stale; **$361.52** is fresh context only and unverified. [Valuation 01, §§1, 7]
- The module is useful for the master, but the **51.14%** method spread caps valuation confidence at **55**. [Valuation 07, §2]



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — V

All 23 raw sources and all 44 workbook tabs in the frozen generation were inspected through the immutable manifest. Every manifest source has `status: ok`; there are no extraction failures, Drive-pointer stubs, or external-research documents. The **Last Modified** values below are the immutable snapshot sync time, not a source date and not an input to freshness or age.

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| Company Comparable Analysis Visa Inc.xls — Financial Data (117,766 B; 50×17) | Capital IQ comparable / current-price export | As of 17-Aug-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Company Comparable Analysis Visa Inc.xls — Trading Multiples (117,766 B; 50×9) | Capital IQ peer/comps export | As of 17-Aug-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Company Comparable Analysis Visa Inc.xls — Operating Statistics (117,766 B; 50×13) | Capital IQ operating-statistics export | As of 17-Aug-2026 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Company Comparable Analysis Visa Inc.xls — Business Description (117,766 B; 44×3) | Capital IQ company profile | As of 17-Aug-2026 | 24-Sep-2026 08:36 (snapshot sync) | Low |
| Company Comparable Analysis Visa Inc.xls — Implied Valuation (117,766 B; 69×9) | Capital IQ valuation sensitivity export | As of 17-Aug-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Company Comparable Analysis Visa Inc.xls — Valuation Chart (117,766 B; 32×2) | Capital IQ valuation chart export | As of 17-Aug-2026 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Visa Inc NYSE V Customers.rtf (1,618,533 B) | Capital IQ customer export | Recently disclosed relationships; no report-date field stated in extract | 24-Sep-2026 08:36 (snapshot sync) | Low |
| Visa Inc NYSE V Events Calendar.xls — Events Calendar (34,304 B; 46×3) | Capital IQ events calendar | Calendar year 2026 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Visa Inc NYSE V Financials_Annual.xls — Key Stats (334,858 B; 106×12) | Capital IQ annual financials | FY2017–FY2025 plus LTM through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Annual.xls — Income Statement (334,858 B; 115×11) | Capital IQ annual income statement | FY2017–FY2025 plus LTM through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Annual.xls — Balance Sheet (334,858 B; 94×11) | Capital IQ annual balance sheet | FY2017–FY2025 plus latest 30-Jun-2026 column | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Annual.xls — Cash Flow (334,858 B; 72×11) | Capital IQ annual cash-flow statement | FY2017–FY2025 plus LTM through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Annual.xls — Multiples (334,858 B; 91×41) | Capital IQ own-history multiples | Historical series through latest available column | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Annual.xls — Historical Capitalization (334,858 B; 39×40) | Capital IQ historical market-cap / EV data | Historical series through latest available column | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Annual.xls — Capital Structure Summary (334,858 B; 97×21) | Capital IQ capital structure | FY2017–FY2025 plus latest 30-Jun-2026 column | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Annual.xls — Capital Structure Details (334,858 B; 59×10) | Capital IQ capital structure | Latest reported debt / equity detail through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Annual.xls — Ratios (334,858 B; 161×11) | Capital IQ historical ratios | FY2017–FY2025 plus LTM through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Visa Inc NYSE V Financials_Annual.xls — Supplemental (334,858 B; 73×10) | Capital IQ supplemental financial data | FY2017–FY2025 plus LTM through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Visa Inc NYSE V Financials_Annual.xls — Industry Specific (334,858 B; 15×6) | Capital IQ industry data | Historical through latest available column | 24-Sep-2026 08:36 (snapshot sync) | Low |
| Visa Inc NYSE V Financials_Annual.xls — Pension OPEB (334,858 B; 264×10) | Capital IQ pension / OPEB data | FY2017–FY2025 plus latest available column | 24-Sep-2026 08:36 (snapshot sync) | Low |
| Visa Inc NYSE V Financials_Annual.xls — Segments (334,858 B; 72×10) | Capital IQ segment data | FY2017–FY2025 plus latest available column | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Key Stats (573,962 B; 106×12) | Capital IQ quarterly financials | Quarterly history through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Income Statement (573,962 B; 112×40) | Capital IQ quarterly income statement | Quarterly history through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Balance Sheet (573,962 B; 94×40) | Capital IQ quarterly balance sheet | Quarterly history through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Cash Flow (573,962 B; 72×40) | Capital IQ quarterly cash-flow statement | Quarterly history through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Multiples (573,962 B; 91×41) | Capital IQ quarterly multiples | Quarterly / LTM history through latest available column | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Historical Capitalization (573,962 B; 39×40) | Capital IQ historical market-cap / EV data | Historical series through latest available column | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Capital Structure Summary (573,962 B; 72×79) | Capital IQ capital structure | Quarterly history through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Capital Structure Details (573,962 B; 59×10) | Capital IQ capital structure | Latest reported debt / equity detail through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Financials_Quarterly.xls — Ratios (573,962 B; 161×40) | Capital IQ historical ratios | Quarterly / LTM history through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Visa Inc NYSE V Financials_Quarterly.xls — Supplemental (573,962 B; 40×40) | Capital IQ supplemental financial data | Quarterly history through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Visa Inc NYSE V Financials_Quarterly.xls — Industry Specific (573,962 B; 15×6) | Capital IQ industry data | Quarterly history through latest available column | 24-Sep-2026 08:36 (snapshot sync) | Low |
| Visa Inc NYSE V Financials_Quarterly.xls — Pension OPEB (573,962 B; 175×40) | Capital IQ pension / OPEB data | Quarterly history through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | Low |
| Visa Inc NYSE V Financials_Quarterly.xls — Segments (573,962 B; 67×40) | Capital IQ segment data | Quarterly history through 30-Jun-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa Inc NYSE V Key Developments.rtf (1,068,834 B) | Capital IQ key-developments export | Historical developments; no single reporting period | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Visa Inc NYSE V Public Company Profile.rtf (300,212 B) | Capital IQ company profile | Current profile; no report-date field stated in extract | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Visa Inc NYSE V Public Ownership History.xls — History (709,632 B; 6,120×6) | Capital IQ ownership history | Quarterly holdings through 30-Jun-2026 plus an undated Latest column | 24-Sep-2026 08:36 (snapshot sync) | Low |
| Visa Inc NYSE V Public Ownership Insider Trading.xls — Insider Trading (391,168 B; 2,277×11) | Capital IQ insider-trading export | All history; latest shown filing date 31-Jul-2026 | 24-Sep-2026 08:36 (snapshot sync) | Low |
| Visa Inc NYSE V Public Ownership Summary.rtf (309,959 B) | Capital IQ ownership summary | Current summary; no report-date field stated in extract | 24-Sep-2026 08:36 (snapshot sync) | Low |
| Visa Inc NYSE V Suppliers.rtf (171,420 B) | Capital IQ supplier export | Recently disclosed relationships; no report-date field stated in extract | 24-Sep-2026 08:36 (snapshot sync) | Low |
| Visa Inc., Q1 2026 Earnings Call, Jan 29, 2026.pdf (422,489 B) | Earnings transcript | Fiscal Q1 2026, call dated 29-Jan-2026 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Visa Inc., Q2 2026 Earnings Call, Apr 28, 2026.rtf (315,904 B) | Earnings transcript | Fiscal Q2 2026, call dated 28-Apr-2026 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Visa Inc., Q3 2026 Earnings Call, Jul 28, 2026.rtf (310,784 B) | Earnings transcript | Fiscal Q3 2026, call dated 28-Jul-2026 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Visa-Fiscal-2025-Annual-Report.pdf (11,310,316 B) | Audited annual report | Fiscal year ended 30-Sep-2025 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa-Inc-Q2-2026-Financial-Results-Presentation.pdf (190,442 B) | Investor presentation | Fiscal Q2 2026 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Visa-Inc-Q3-2026-Earnings-Release.pdf (279,646 B) | Official earnings release | Fiscal Q3 ended 30-Jun-2026; released 28-Jul-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa-Inc-Q3-2026-Financial-Results-Presentation.pdf (187,001 B) | Investor presentation | Fiscal Q3 2026 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| VisaIncNYSEVEstimatesReport.xls — Consensus (8,144,053 B; 616×93) | Capital IQ consensus estimates | FY2026 (year end 30-Sep-2026) and forward estimates | 24-Sep-2026 08:36 (snapshot sync) | High |
| VisaIncNYSEVEstimatesReport.xls — Recent Changes (8,144,053 B; 265×10) | Capital IQ estimate changes | FY2026 / forward estimate cycle | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| VisaIncNYSEVEstimatesReport.xls — Guidance (8,144,053 B; 151×44) | Capital IQ guidance compilation | FY2026 / forward guidance | 24-Sep-2026 08:36 (snapshot sync) | High |
| VisaIncNYSEVEstimatesReport.xls — Multiples (8,144,053 B; 34×7) | Capital IQ forecast multiples | FY2026 / forward multiples | 24-Sep-2026 08:36 (snapshot sync) | High |
| VisaIncNYSEVEstimatesReport.xls — Surprise (8,144,053 B; 300×80) | Capital IQ estimate-surprise history | Historical through fiscal Q3 2026 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| VisaIncNYSEVEstimatesReport.xls — Trends (8,144,053 B; 318×24) | Capital IQ estimate trends | FY2026 / forward estimate cycle | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| VisaIncNYSEVEstimatesReport.xls — Revisions (8,144,053 B; 467×24) | Capital IQ estimate revisions | FY2026 / forward estimate cycle | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa_Inc_-_Form_10-K(Nov-06-2025).doc (6,275,737 B) | Audited Form 10-K | Fiscal year ended 30-Sep-2025; filed 6-Nov-2025 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa_Inc_-_Form_10-Q(Jul-29-2026).doc (2,393,181 B) | Form 10-Q | Fiscal Q3 ended 30-Jun-2026; filed 29-Jul-2026 | 24-Sep-2026 08:36 (snapshot sync) | High |
| Visa_Inc_-_Form_DEF_14A(Dec-08-2025).doc (66,008,321 B) | Proxy / DEF 14A | Fiscal 2025 proxy; filed 8-Dec-2025 | 24-Sep-2026 08:36 (snapshot sync) | Medium |
| Visa_Short_Interest_Charting Excel Export Aug-17-2026 8_53 AM.xls — Chart 1 with Data (101,888 B; 283×2) | Capital IQ short-interest chart | 18-Aug-2025 to 17-Aug-2026 | 24-Sep-2026 08:36 (snapshot sync) | Low |
| Visa_Short_Interest_Charting Excel Export Aug-17-2026 8_53 AM.xls — Attributions (101,888 B; 45×1) | Source-attributions tab | Export dated 17-Aug-2026 | 24-Sep-2026 08:36 (snapshot sync) | Low |

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States / NYSE, Class A common stock ticker V | [Visa Q3 FY26 earnings release, 28-Jul-2026, heading] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | [Visa Form 10-Q, Q3 FY26, cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | U.S. GAAP | [Visa Form 10-K, FY25, Independent Registered Public Accounting Firm report] |
| Reporting currency (and scale, e.g. INR crore) | USD; financial statements are in millions except per-share data | [Visa Form 10-Q, Q3 FY26, financial-statement headers] |
| Fiscal-year end | 30 September | [Visa Form 10-K, FY25, cover] |
| Document language(s) | English | [Visa Form 10-Q, Q3 FY26, cover and financial statements] |

The next ordinary interim filing is a standalone US three-month Form 10-Q, not a cumulative half-year filing. The subject is an **Operating** company: Visa describes itself as a payments-technology company and says it is not a financial institution. Its one reportable segment is Payment Services. [Visa Form 10-Q, Q3 FY26, Business / Note 17]

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | Visa_Inc_-_Form_10-K(Nov-06-2025).doc | FY ended 30-Sep-2025 | 11.8 |
| Quarterly filing | Visa_Inc_-_Form_10-Q(Jul-29-2026).doc | Q3 ended 30-Jun-2026 | 2.8 |
| Capital structure / balance sheet | Visa_Inc_-_Form_10-Q(Jul-29-2026).doc | 30-Jun-2026 | 2.8 |
| Consensus / estimate export | VisaIncNYSEVEstimatesReport.xls — Consensus / Guidance / Revisions | FY2026 ending 30-Sep-2026; extract does not state a report as-of date | Not assessable |
| Multiples export | Visa Inc NYSE V Financials_Quarterly.xls — Multiples; VisaIncNYSEVEstimatesReport.xls — Multiples | LTM through 30-Jun-2026 and FY2026 forward | 2.8 / as-of not stated |
| Peer / comps export | Company Comparable Analysis Visa Inc.xls — Trading Multiples | 17-Aug-2026 | 1.2 |
| Current price (IBKR / Capital IQ) | Company Comparable Analysis Visa Inc.xls — Financial Data | $364.15, 17-Aug-2026 | 1.2 (26 U.S. trading days) |
| Cash flow statement | Visa_Inc_-_Form_10-Q(Jul-29-2026).doc; CIQ Quarterly Cash Flow | Nine months / LTM through 30-Jun-2026 | 2.8 |
| Segment data | Visa_Inc_-_Form_10-Q(Jul-29-2026).doc; CIQ Quarterly Segments | Payment Services, Q3 / LTM through 30-Jun-2026 | 2.8 |

The CIQ sidecar confirms the pool read of the current price ($364.15 as of 17-Aug-2026), point-in-time shares outstanding (1,835.6 million as of 17-Aug-2026), debt and net-debt fields, LTM EBITDA and cash flow, own-history multiples, consensus, and peer multiples. It reports no conflicts. The later agents must use a filing for any filing number and reconcile CIQ's net-debt basis to the filing's strict debt-less-cash basis; the sidecar itself warns that its net-debt field may include short-term or liquid investments. [CIQ facts sidecar, `current_price` / `shares_outstanding_m` / `net_debt_m`, source references stated in generation]

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y — pool-verified but stale | $364.15 as of 17-Aug-2026 [CIQ Comps Financial Data, 17-Aug-2026; CIQ facts `current_price`] | Anchor for market cap, EV, multiples, margin of safety; refresh is mandatory before price-relative conclusions. |
| Diluted share count | Y | Q3 diluted weighted-average share disclosure; CIQ point-in-time shares export [Visa Form 10-Q, Q3 FY26, EPS note; CIQ Comps Financial Data, 17-Aug-2026] | Needed for market cap and per-share fair value. |
| Dilution data (options/RSUs/convertibles) | Y | EPS note, employee-stock-plan disclosures, and proxy equity-award disclosures [Visa Form 10-Q, Q3 FY26, EPS / stock-compensation notes; Visa DEF 14A, FY25, Equity compensation] | Needed for fully diluted per-share fair value. |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y — Operating | Visa says it is a payments-technology company, not a financial institution [Visa Form 10-Q, Q3 FY26, Business] | Determines which valuation methods are valid. |
| Total debt, cash, minority/preferred | Y | Q3 balance sheet and debt / preferred-stock disclosures; CIQ balance-sheet export [Visa Form 10-Q, Q3 FY26, financial statements and notes; CIQ Financials Balance Sheet, 30-Jun-2026] | Needed for the enterprise-value bridge. |
| Income statement (LTM or FY) | Y | Q3 filing plus CIQ annual/quarterly income statements; CIQ LTM EBITDA is present [Visa Form 10-Q, Q3 FY26, statements of operations; CIQ facts `ltm_ebitda_m`] | Earnings/EBITDA base for multiples and DCF. |
| Cash flow statement | Y | Q3 filing plus CIQ annual/quarterly cash-flow statements; CIQ LTM OCF and levered FCF are present [Visa Form 10-Q, Q3 FY26, cash-flow statement; CIQ facts `ltm_ocf_m` / `levered_fcf_m`] | FCF base for DCF and FCF yield. |
| Forward estimates (consensus) | Y | CIQ Estimates Consensus, Guidance, Trends, Revisions, and Multiples tabs [VisaIncNYSEVEstimatesReport.xls, FY2026 / forward tabs] | NTM/FY multiples and DCF near-term path. |
| Historical multiple data | Y | CIQ annual and quarterly Multiples / Historical Capitalization tabs; the sidecar derives a 38-quarter EV/EBITDA history [CIQ Financials Multiples, through latest column; CIQ facts `ev_ebitda_percentile`] | Own-history re-rating read. |
| Peer / comps data | Y | CIQ comparable Financial Data and Trading Multiples tabs [Company Comparable Analysis Visa Inc.xls, 17-Aug-2026] | Relative valuation and any segment-comparable check. |
| Segment-level revenue & EBIT | Y — one reportable segment | Payment Services is the one reportable segment; CIQ records it as 100% of FY25 revenue [Visa Form 10-Q, Q3 FY26, Note 17; CIQ facts `segments_revenue`] | Confirms SOTP collapses rather than supplying a meaningful break-up. |
| Dividend / buyback data | Y | Dividend and open-market-repurchase disclosures [Visa Form 10-Q, Q3 FY26, equity / share-repurchase disclosures] | Shareholder-yield read. |

The price's stated 17-Aug-2026 as-of date is 26 U.S. trading days before the run date. It remains pool-verified, but it triggers the module's >15-trading-day freshness rule: valuation confidence is capped at 60 and downstream agents must attempt a refresh before presenting a single unqualified price-relative read. [CIQ Comps Financial Data, 17-Aug-2026; Valuation MODULE_RULES, Score Cap Rules]

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

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N — a pool-verified price exists, although it is stale | 01, 05, 07, 99 | No no-price cap. Separate stale-price cap: valuation confidence max 60 until refreshed. |
| No consensus / forward estimates | N | 02, 03, 04, 05 | None |
| No peer data | N | 03, 06 | None |
| No segment-level data | N — but only one reportable segment exists | 06 | None; SOTP is not a distinct value-producing method. |
| No balance sheet / capital structure | N | 01, 04, 06 | None |
| No cash flow statement | N | 04 | None |

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Annual/quarterly Capital IQ multiples and historical-capitalization tabs are present. |
| Peer relative valuation | Y | None | Dated CIQ comparable set and Trading Multiples tab are present as of 17-Aug-2026. |
| Intrinsic DCF (Operating FCFF) | Y | None | Operating business, filing income statement / balance sheet / cash flow, and forward estimates are all present. |
| Reverse DCF | Y — subject to price refresh | None, but the price anchor is stale | A pool-verified price exists; use an updated pool quote if available before interpreting what is priced in. |
| SOTP | N as a distinct method | No missing input; the issuer has one reportable segment | Payment Services is the only reportable segment, so a breakup collapses to the consolidated valuation. |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The frozen pool contains a usable earnings and cash-flow base, a recent filing-based balance sheet and capital structure, forward CIQ estimates, dated peer and own-history multiple inputs, share/dilution disclosures, and a pool-verified current price.
- **Methods that can run:** Own-history multiples, peer relative valuation, intrinsic operating FCFF DCF, and reverse DCF. SOTP should be recorded as a single-segment collapse, not counted as a fifth independent method.
- **Freshness control:** The only material limitation is the 17-Aug-2026 price anchor: it is 26 U.S. trading days stale as of 23-Sep-2026. `01` must seek a fresher pool/user quote; until then, the stale-price valuation-confidence cap of 60 applies.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — V

Visa Inc. is a U.S. GAAP issuer, reports in USD, and has a September fiscal year-end. Amounts below are USD millions unless stated otherwise. The decision line is Visa Class A common stock on the NYSE.

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---:|---|---|
| **Decision line** (ticker · venue · currency) | V · NYSE · USD | [Visa Q3 FY2026 Form 10-Q, cover; Capital IQ Comps → Financial Data] | 2026-08-17 price export |
| Current price | **$364.15** | [Capital IQ Comps → Financial Data, Visa subject row, `Day Close Price Latest`; `ciq_facts.json` `current_price`] | 2026-08-17 |
| Currency | USD | [Capital IQ Comps → Financial Data, 2026-08-17] | 2026-08-17 |
| Price basis | Day close | [Capital IQ Comps → Financial Data, 2026-08-17] | 2026-08-17 |

The NYSE Class A common share is the primary, liquid decision line. Single listed line — no cross-line issue. Visa also has Class B-1, B-2, B-3 and C common shares, but the admitted documents provide no separate exchange quotation for them; they are not a second tradable decision line. `[Visa Q3 FY2026 Form 10-Q, cover and Note 11 (Stockholders’ Equity)]`

| Listed line | Ticker · venue | Currency | Price | As-of | Premium / (discount) vs decision line, same-currency | Notes for a holder of this line |
|---|---|---|---:|---|---:|---|
| Other listed line | None identified in the admitted pool | — | — | — | — | Single listed decision line |

**Price freshness.** The pool quote is 37 calendar days old at the 2026-09-23 run date, or about 26 U.S. trading days (`37 × 5/7`). I searched the price-bearing pool exports; the latest dated pool quote remains the Capital IQ 2026-08-17 close, so no fresher pool or user quote was available. The pool price remains `pool-verified`, but it exceeds the 15-trading-day threshold: downstream valuation confidence is capped at 60 and any price-relative calculation must show the stale-anchor caveat. `[Capital IQ Comps → Financial Data, 2026-08-17; Valuation MODULE_RULES, Score Cap Rules]`

**Indicative price, web-sourced as of 2026-09-23, not from data pool — unverified:** Visa Investor Relations and StockAnalysis each report a $361.52 NYSE close for 2026-09-23, a 0.00% cross-source difference and $2.63 (0.72%) below the pool anchor. This is a refresh cross-check, not a replacement for the pool anchor. `[Web: Visa Investor Relations, NYSE quote, 2026-09-23 close (indicative, unverified); Web: StockAnalysis, Visa price history, 2026-09-23 close (indicative, unverified)]`

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | 1,784.429m actual common shares: 1,704.113m Class A + 2.180m B-1 + 0.487m B-2 + 60.590m B-3 + 17.059m C | [Visa Q3 FY2026 Form 10-Q, cover, as of 2026-07-21] |
| Diluted weighted-average shares (period) | 1,898m Class A-equivalent shares, three months ended 2026-06-30 | [Visa Q3 FY2026 Form 10-Q, Note 12 (Earnings per Share)] |
| Options / RSUs count (if disclosed) | 0.714m options; 2.629m RSUs; 0.381m maximum performance shares | [Visa Q3 FY2026 Form 10-Q, employee stock-plan disclosure] |
| Convertibles / potential shares (if disclosed) | No convertible debt reported. Preferred stock has separate conversion/recovery terms and remains a separate EV-bridge item. | [Visa Q3 FY2026 Form 10-Q, Notes 8 and 11] |
| **Fully diluted shares (TSM + if-converted)** | **1,898m** reported Q3 diluted weighted-average Class A equivalents | [Visa Q3 FY2026 Form 10-Q, Note 12 (Earnings per Share)] |
| Share count used for market cap | 1,835.606m point-in-time primary-Class-A-equivalent shares | [Capital IQ Comps → Financial Data, Visa subject row, `Shares Outstanding Latest`, 2026-08-17; `ciq_facts.json` `shares_outstanding_m`] |
| Share count used for per-share fair value | 1,898m | [Visa Q3 FY2026 Form 10-Q, Note 12 (Earnings per Share)] |

### Share Count Reconciliation

| Three months ended 2026-06-30 | Class A-equivalent shares (m) | Source |
|---|---:|---|
| Basic weighted-average Class A shares | 1,673 | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| + Class B-1 common stock, as converted | 5 | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| + Class B-2 common stock, as converted | 80 | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| + Class B-3 common stock, as converted | 51 | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| + Class C common stock, as converted | 71 | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| + Participating securities | 15 | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| + Employee-plan common equivalents / rounding | Not material; the filing does not give an exact line-item bridge | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| **= Reported diluted weighted-average shares** | **1,898** | [Visa Q3 FY2026 Form 10-Q, Note 12] |

The market-cap count is a point-in-time vendor count; the 1,898m per-share count is the latest reported diluted weighted average. The 62.394m (3.4%) difference is material enough to keep the bases separate. The filing says employee-plan equivalents were not material to diluted EPS, so I use the reported diluted figure rather than inventing a separate treasury-stock-method calculation from gross awards.

## 3. Market Capitalization

`Market cap = share count × current price`

`$668,435.9m = 1,835.60599m × $364.15`

The calculation ties to Capital IQ's stated $668,435.9m market capitalization; the sidecar confirms the $364.15 price and 1,835.6m rounded share count. `[Capital IQ Comps → Financial Data, Visa subject row, 2026-08-17; `ciq_facts.json` `current_price` and `shares_outstanding_m`]`

For freshness context only, the corroborated $361.52 web close × the same 1,835.60599m shares equals about $663.608bn. It is not a canonical pool market cap. `[Web: Visa Investor Relations and StockAnalysis, 2026-09-23 close (indicative, unverified)]`

## 4. Enterprise Value Bridge

| Component | Amount | Source |
|---|---:|---|
| Market capitalization | $668,435.9 | [Capital IQ Comps → Financial Data, 2026-08-17; calculation above] |
| + Total debt (short + long term) | $23,858 | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 8 (Debt), pp. 4, 17–18] |
| + Minority / non-controlling interest | $0 — no separately reported NCI balance | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, p. 4] |
| + Preferred equity | $514 book value | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 11 (Stockholders’ Equity), pp. 4, 22–23] |
| + Operating lease liabilities (optional adjustment) | $0 added; $913 was the FY2025 recorded liability, not refreshed in Q3 | [Visa FY2025 Form 10-K, Note 9 (Leases), p. 82; Visa Q3 FY2026 Form 10-Q, Note 7] |
| + Underfunded pension / other long-term obligations | $0 added; FY2025 aggregate pension/OPEB position was a $624 funded surplus | [Visa FY2025 Form 10-K, Note 11 (Pension and Other Postretirement Benefits), pp. 85–86] |
| − Cash & equivalents | ($12,359) | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 4, pp. 4, 14] |
| − Equity-method investments | $0 — none separately disclosed for EV treatment | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, p. 4] |
| **= Enterprise value (EV)** | **$680,448.9** | **Calculation** |

The canonical EV uses debt from the filing-based balance-sheet-survival anchor and nets only cash and equivalents: `$668,435.9 + $23,858 + $514 − $12,359 = $680,448.9m`. Operating leases are not added because the latest quantified $913 is from FY2025 and is outside the canonical debt line; pension is not added because the disclosed position is a surplus. `[analyses/V_2026-09-23/balance-sheet-survival/01_capital-structure-and-leverage.md, Leverage Anchor Summary]`

Cash quality is material. The strict bridge nets $12,359m of cash and equivalents only. It excludes $6,409m of restricted cash, litigation escrow and customer collateral, and it does not net $150m of non-current investment securities. The $1,433m current investment-security balance is shown only in the broad bridge below. `[Visa Q3 FY2026 Form 10-Q, Note 4, p. 14; Note 6 (Debt Securities), p. 15]`

Capital IQ's $679,015.9m TEV is a cross-check, not the canonical EV: it uses the same $23,858m debt and $514m preferred equity but nets the additional $1,433m current investment securities. The $1,433m gap reconciles exactly to the broad cash basis. `[Capital IQ Comps → Financial Data, Visa subject row, 2026-08-17; `ciq_facts.json` `total_debt_m` and `net_debt_m`]`

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | $23,858 | [Visa Q3 FY2026 Form 10-Q, pp. 4, 17–18] |
| Cash & equivalents | $12,359 | [Visa Q3 FY2026 Form 10-Q, pp. 4, 14] |
| **Net debt (strict, §15: total debt − cash & equivalents)** | **$11,499 = $23,858 − $12,359** | [Visa Q3 FY2026 Form 10-Q, pp. 4, 14, 17–18; calculation] |
| − Liquid short-term investments (if netted) | ($1,433) current investment securities | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 6, pp. 4, 15] |
| **Net debt (broad, incl. investments — only if used)** | **$10,066 = $23,858 − $12,359 − $1,433** | [`ciq_facts.json` `net_debt_m`, Jun-30-2026 — CIQ vendor basis; reconciled to the Form 10-Q] |
| Net debt / latest EBITDA (GAAP-derived) | 0.41x strict = $11,499 / $28,338 | [Visa Q3 FY2026 Form 10-Q, pp. 4, 17–18; Visa FY2025 Form 10-K, pp. 60, 65; analyses/V_2026-09-23/earnings/01_historical-financials.md, TTM Snapshot; calculation] |

The strict $11,499m number is canonical. It agrees with the balance-sheet-survival report. The source-bound CIQ sidecar's present $10,066m net-debt fact is not a conflicting debt amount; it is the broad basis that adds $1,433m of current investment securities to cash. `[analyses/V_2026-09-23/balance-sheet-survival/01_capital-structure-and-leverage.md, Sections 4 and 7; `ciq_facts.json` `net_debt_m`]`

Visa does not report company-defined EBITDA. The $28,338m denominator is GAAP-derived EBITDA — reported operating income plus depreciation and amortization — for the LTM ended 2026-06-30. Capital IQ's $31,094m special-item-excluding vendor EBITDA gives 0.32x **broad** net debt / EBITDA, but it does not replace the GAAP-derived leverage measure. `[analyses/V_2026-09-23/earnings/01_historical-financials.md, TTM Snapshot; `ciq_facts.json` `ltm_ebitda_m` and `net_debt_ebitda_x`]`

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | $18.53 = $35,178m total equity / 1,898m diluted shares | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, p. 4; Note 12; calculation] |
| Tangible book value per share | ($6.94) = ($35,178m − $20,825m goodwill − $27,532m intangibles) / 1,898m | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, p. 4; calculation] |
| Net debt per share | $6.06 strict = $11,499m / 1,898m | [Visa Q3 FY2026 Form 10-Q, pp. 4, 14, 17–18; calculation] |

These values use total equity and the same 1,898m diluted share basis as downstream per-share fair-value work. They are balance-sheet reference values, not an estimate of intrinsic value. The $514m preferred-stock book value is included in total equity here and is also shown separately in the EV bridge, so downstream agents must keep their equity-bridge basis explicit.

## 6A. Distribution Basis

| Field | Value | Source |
|---|---|---|
| Yield basis | Trailing / annualized run-rate from the latest declared quarterly dividend; not forward-declared | [Visa Q3 FY2026 Form 10-Q, Note 11, pp. 22–23] |
| Amount per share and period it covers | $0.67 per Class A share quarterly; $2.68 annualized run-rate | [Visa Q3 FY2026 Form 10-Q, Note 11, pp. 22–23; calculation] |
| Ex-date and record date of the most recent distribution | Ex-date not stated in the admitted data; record date 2026-08-11; payable 2026-09-01 | [Visa Q3 FY2026 Form 10-Q, Note 11, pp. 22–23] |
| Is the next distribution still available to a buyer today? | N — the stated record date has passed | [Visa Q3 FY2026 Form 10-Q, Note 11, pp. 22–23] |
| Gross or net | Gross; decision line is U.S. Class A common stock, with no ADR fee. Holder-specific tax is not calculated. | [Visa Q3 FY2026 Form 10-Q, Note 11] |
| Yield on the **decision line** at the decision-line price | 0.74% gross trailing annualized = $2.68 / $364.15 | [Visa Q3 FY2026 Form 10-Q, Note 11; Capital IQ Comps → Financial Data, 2026-08-17; calculation] |

The stated $0.67 payment cannot be presented as income a buyer on 2026-09-23 can still receive, because its August 11 record date has passed.

## 7. Anchor Summary (canonical numbers for downstream agents)

- Current price: **$364.15** pool close, as of 2026-08-17; 26 trading days stale at the 2026-09-23 run date. The fresh web cross-check is $361.52 on 2026-09-23, indicative and unverified.
- Share counts used: **1,835.606m** for market cap; **1,898m** Q3 FY2026 diluted weighted-average Class A equivalents for per-share fair value.
- Market cap: **$668,435.9m** at the pool price.
- Enterprise value: **$680,448.9m**, using the strict cash basis.
- Net debt: **$11,499m strict**; broad, investment-inclusive cross-check **$10,066m**.
- Reporting currency: **USD**.

### Anchor Block (copy-forward)

- Decision line: **V · NYSE · USD** — every downstream fair value, margin of safety, and yield is on this line (Single listed line)
- Other listed lines: **None identified**
- Price: **$364.15** (2026-08-17, day close; pool-sourced and 26 trading days stale)
- Price-state: **pool-verified** — the canonical tag `05`/`07`/`99` read
- Currency: **USD**
- Distribution basis: **trailing / annualized run-rate** — $0.67 quarterly ($2.68 annualized); record date 2026-08-11, still available to a buyer today: **N**, gross
- Shares (market cap): **1,835.606m** [Capital IQ Comps → Financial Data, 2026-08-17]
- Shares (per-share fair value): **1,898m** [Visa Q3 FY2026 Form 10-Q, Note 12; diluted weighted-average limitation]
- Market cap: **$668,435.9m**
- Net debt: **$11,499m strict basis** [Visa Q3 FY2026 Form 10-Q, pp. 4, 14, 17–18]; agrees with `balance-sheet-survival/01`'s canonical figure. CIQ's **$10,066m broad basis** additionally nets $1,433m of current investment securities.
- EV: **$680,448.9m strict-cash basis**
- Key caveats: The verified pool anchor is 26 trading days stale, which imposes the valuation-confidence maximum of 60. A corroborated $361.52 web close is context only; it does not change the `pool-verified` tag or replace the canonical price.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — V

Visa Inc. is a U.S. GAAP operating company reporting in USD, with a September fiscal year-end. Amounts below are USD millions except per-share data. The decision line is Visa Class A common stock, ticker V on the NYSE. The anchor is a pool-verified but stale $364.15 close on 17 August 2026; it was 26 U.S. trading days old on the 23 September 2026 run date. The strict-cash enterprise value (EV) is $680,448.9m, and per-share reversion values use 1,898m Q3 FY26 diluted weighted-average Class A equivalents. [01_price-and-capital-structure, §§1, 4 and 7]

## 1. Current Multiples

EV is the value of equity plus debt and preferred equity less cash. EBITDA is earnings before interest, tax, depreciation and amortisation. The LTM EV/EBITDA and EV/EBIT rows below use the Capital IQ vendor series, so they remain comparable with the historical Capital IQ bands; they are not Visa-reported EBITDA or GAAP operating income.

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E | LTM; CIQ EPS excluding extra items | $11.75 / share | 31.0x | [Capital IQ Comps → Financial Data, Visa subject row, 2026-08-17; $364.15 anchor from 01] |
| P / E | NTM consensus | $14.45 / share | 25.2x | [Capital IQ Comps → Financial Data, Visa subject row, 2026-08-17; $364.15 anchor from 01] |
| EV / EBITDA | LTM; CIQ vendor-defined, special-item-excluding basis | $31,094 | 21.9x | [$680,448.9m strict EV from 01; Capital IQ Comps → Financial Data, LTM EBITDA, 2026-08-17; `ciq_facts.json` `ltm_ebitda_m`] |
| EV / EBITDA | NTM consensus | $34,971.48 | 19.5x | [$680,448.9m strict EV from 01; Capital IQ Comps → Financial Data, NTM EBITDA, 2026-08-17] |
| EV / EBIT | LTM; CIQ vendor basis | $29,752 | 22.9x | [$680,448.9m strict EV from 01; Capital IQ Comps → Financial Data, LTM EBIT, 2026-08-17] |
| EV / Sales | LTM reported revenue | $44,488 | 15.3x | [$680,448.9m strict EV from 01; Capital IQ Comps → Financial Data, LTM revenue, 2026-08-17] |
| EV / Sales | NTM consensus | $49,437.52 | 13.8x | [$680,448.9m strict EV from 01; Capital IQ Comps → Financial Data, NTM revenue, 2026-08-17] |
| P / Book | Latest reported book value, including $514m preferred stock | $18.53 / share | 19.7x | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, p.4; 01_price-and-capital-structure, §6] |
| P / FCF | LTM reported FCF = CFO less total capex | $21,013 | 31.8x; 3.14% FCF yield | [earnings/01_historical-financials, TTM Snapshot; $668,435.9m market cap from 01] |
| Dividend yield | Trailing annualised run-rate, gross | $2.68 / share | 0.74% | [Visa Q3 FY2026 Form 10-Q, Note 11, pp.22–23; 01_price-and-capital-structure, §6A] |

The NTM numbers are Capital IQ consensus values, not management guidance, and the estimates workbook has no single snapshot date; its latest dated change was 11 August 2026. [earnings/04_guidance-consensus, §1] Visa's reported LTM GAAP EBIT is $26,996m and GAAP-derived EBITDA is $28,338m, versus the $29,752m and $31,094m CIQ operating series above; a GAAP EV/EBITDA of 24.0x would not be comparable with the CIQ historical band. [earnings/01_historical-financials, TTM Snapshot]

The $0.67 quarterly dividend behind the 0.74% run-rate had an 11 August 2026 record date, already passed at the run date. It is a trailing yield, not income a buyer can still receive. [01_price-and-capital-structure, §6A]

## 2. Historical Multiple Bands (3–5 years)

Bands use the 20 quarterly `Close` observations from 30 September 2021 through 30 June 2026. The 7 August 2026 provider close is excluded from the history. Percentile of range is `(current − min) / (max − min)`; it locates the current strict-anchor multiple inside the observed range, not a statistical percentile. [Capital IQ Financials Annual workbook, Multiples sheet, quarterly close series]

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| P / E | 26.17x | 32.57x | 31.63x | 45.04x | 30.99x | 25.5% |
| EV / EBITDA | 17.47x | 22.34x | 21.91x | 28.47x | 21.88x | 40.1% |
| EV / EBIT | 18.34x | 23.48x | 22.97x | 30.00x | 22.87x | 38.9% |
| EV / Sales | 12.48x | 15.73x | 15.42x | 19.63x | 15.30x | 39.4% |
| P / Book — context only, not a valuation input | 10.46x | 13.97x | 13.10x | 17.93x | 19.65x | >100% |

The source-bound facts sidecar confirms the same workbook's latest provider observation of 21.6x LTM EV/EBITDA and 30.9x LTM P/E, with the former at the 45th percentile of its longer 38-quarter range. The 1.3% difference between 21.6x and the 21.9x above is not a conflict: 21.6x uses the workbook's 7 August 2026 provider close and its $679,015.9m investment-inclusive EV, while 21.9x uses the 17 August anchor and the $680,448.9m strict-cash EV required by `01`. [Capital IQ Financials Annual workbook, Multiples sheet, 2026-08-07 close; `ciq_facts.json` `ev_ebitda_current_x`, `pe_ltm_current_x`, `range_position`; 01_price-and-capital-structure, §§1 and 4]

The historical workbook declares a basic-dilution setting, while the current Comps sheet labels its $11.75 EPS as diluted excluding extra items. The provider current P/E matches the sidecar, but the exact share-basis bridge is not available; P/E reversion is therefore a secondary cross-check, not the selected base case. [Capital IQ Financials Annual workbook, Multiples sheet header; Capital IQ Comps → Financial Data, 2026-08-17; `ciq_facts.json` `pe_ltm_current_x`]

P/book is deliberately excluded from reversion. Tangible book value is negative $6.94 per share because goodwill and intangibles exceed total equity, while the book-value denominator is also reduced by buybacks. Its 19.7x reading is 50.4% above its own mean and 9.6% above the five-year maximum, but it is not evidence that the operating-business multiples are equally elevated. [01_price-and-capital-structure, §6]

The workbook has a historical market-capitalisation / levered-FCF series, but that denominator is after interest and is not the reported LTM `CFO − capex` FCF used in §1. A reversion table built from those two definitions would be mismatched, so no FCF reversion is shown. [Capital IQ Financials Annual workbook, Multiples sheet, `Market Cap/LTM Levered FCF`; earnings/01_historical-financials, TTM Snapshot]

## 3. Re-Rating / De-Rating Read

On the two primary operating multiples, Visa is near the middle of its own five-year range: EV/revenue is 2.8% below its mean and 0.8% below its median, while EV/EBITDA is 2.0% below its mean and 0.1% below its median. P/E is further down the range, at a 4.8% discount to its mean and a 2.0% discount to its median. This is a modest de-rating versus the average, not a large dislocation. [Capital IQ Financials Annual workbook, Multiples sheet, 20 quarterly closes; calculations in §2]

The history does not establish that Visa warrants a higher multiple than its own median. The business-model read supports a stable network advantage but not a confirmed widening one; it records a 66/100 quality score, material regulatory dependence, and FY25 GAAP operating margin of 60.0% after a $2.562bn litigation provision. The last point is why the reported-GAAP and vendor operating series remain separate. [business-model/07_business-quality, §§1–4; business-model/09_moat, §§3 and 5]

## 4. Implied Value from Reversion

For EV multiples, `implied equity = implied EV − $11,499m strict net debt − $514m preferred equity`, and `implied price = implied equity / 1,898m diluted shares`. The strict net-debt basis is the canonical `01` bridge; it is not the $10,066m broad Capital IQ net-debt figure. P/E is already an equity multiple and is applied directly to the $11.75 LTM CIQ EPS. [01_price-and-capital-structure, §§2, 4, 5 and 7]

The EV bands compare at enterprise value. `01` used 1,835.606m point-in-time shares to calculate the current market capitalisation but requires 1,898m diluted weighted-average equivalents for fair value per share. Consequently, the current strict EV itself would equal $352.18 per diluted share, not the $364.15 Class A quote; this 3.4% share-count-basis difference is disclosed rather than hidden in the reversion comparison. [01_price-and-capital-structure, §§2, 3 and 7; calculation]

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| EV / Sales | 15.73x mean | $699,698m EV | $362.32 | (0.5%) |
| EV / Sales | 15.42x median | $686,210m EV | $355.21 | (2.5%) |
| EV / EBITDA | 22.34x mean | $694,705m EV | $359.69 | (1.2%) |
| EV / EBITDA | 21.91x median | $681,154m EV | $352.55 | (3.2%) |
| P / E | 32.57x mean | $382.69 / share equity value | $382.69 | 5.1% |
| P / E | 31.63x median | $371.65 / share equity value | $371.65 | 2.1% |

**Base-case implied value: $355.21 per share**, from the own-median EV/revenue multiple of 15.42x on $44,488m LTM reported revenue. Revenue is the cleanest matched denominator here because it is reported and is not affected by the difference between GAAP and CIQ operating-cost treatment. The median-derived cross-multiple range is $352.55–$371.65 per share; the corresponding mean-derived sensitivity is $359.69–$382.69. This is an own-history input for `07_scenario-and-fair-value`, not a final fair value or rating. [Capital IQ Financials Annual workbook, Multiples sheet; Capital IQ Comps → Financial Data, 2026-08-17; 01_price-and-capital-structure, §7; calculations above]

Reversion assumes that the warranted multiple has not changed. Stable network economics support using the history as a reference, but regulation, client incentives and alternative payment rails mean a return to the upper historical band is not supported by this read. The $364.15 comparison anchor is stale; the $361.52 same-day web cross-check is indicative and does not replace it. [business-model/07_business-quality, §§1 and 4; 01_price-and-capital-structure, §1]

## 5. Sector Cycle Reality Test

**Not assessable — no sector-level multiple history.** There is no financial-services or payments peer-aggregate multiple history in the frozen pool. As a price-return proxy only, the iShares U.S. Financial Services ETF (IYG), which tracks the Dow Jones U.S. Financial Services Index, moved from a $61.16 close on 23 September 2021 to $90.47 on 30 June 2026, a 47.9% increase. This is not a sector-multiple series and cannot distinguish earnings growth from re-rating; it is therefore not evidence that the own-history band is cycle-elevated. It also runs opposite to Visa's modest discount to its own operating-multiple averages, so neither `RF-VAL-001` nor `RF-VAL-002` is triggered. [Web: ChartExchange, IYG historical price, 2021-09-23; Web: FinanceCharts, IYG historical price, 2026-06-30 — indicative, unverified; iShares IYG fund page, index description, accessed 2026-09-23]

## 6. Own-History Read

Visa trades around the centre of its five-year EV/revenue and EV/EBITDA ranges and modestly below its P/E median. The clean own-median EV/revenue calculation gives $355.21 per share, 2.5% below the stale $364.15 anchor; own-history therefore does not support a material reversion case. [Capital IQ Financials Annual workbook, Multiples sheet; calculations in §§2–4]

The biggest caveat is that a historical multiple is an observation, not proof that the same multiple is warranted now. A negative tangible-book base makes P/book a poor operating valuation anchor, while regulatory and litigation risk can justify a lower recurring multiple. No structurally misaligned controlling-owner flag applies: the governance module identifies no controller, state owner or value-maximising parent. [01_price-and-capital-structure, §6; business-model/07_business-quality, §4; management-governance/04_ownership-and-insider-behavior, controlling-owner objective-alignment row]



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — V

Visa Inc. is a U.S. GAAP operating company, reporting in USD with a September fiscal year-end. The decision line is Visa Class A common stock (`V`, NYSE, USD). The pool price is $364.15 at 2026-08-17 and is 26 U.S. trading days stale at the 2026-09-23 run date; price-relative results below carry that limitation. [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data, 2026-08-17; data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, cover; analyses/V_2026-09-23/valuation/01_price-and-capital-structure.md, Price freshness]

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Mastercard Incorporated | MA / NYSE | The closest public direct rival: a global, multi-regional branded card network that authorizes, clears and settles transactions for issuers, acquirers and merchants. | Visa names Mastercard as a global or multi-regional network competitor. [data/V/Visa-Fiscal-2025-Annual-Report.pdf, Competition, p. 17; Mastercard FY2025 Form 10-K, Item 1] |
| American Express Company | AXP / NYSE | A named branded-network rival, but it also carries loans and card-member receivables. Its lender/issuer economics do not match Visa's stand-alone network model. | Visa names American Express as a global or multi-regional network competitor. [data/V/Visa-Fiscal-2025-Annual-Report.pdf, Competition, p. 17; American Express FY2025 Form 10-K, Table 1, p. 42] |

The set comes from `business-model/08_competitive-map.md`, not a self-selected screen. Mastercard is the sole quantitative direct peer: the frozen Capital IQ comparable export contains MA, but not AXP. AXP is public, not private, but no frozen AXP price/multiple row permits a same-date calculation; it is therefore not guessed. No named private peer is used.

Capital IQ's default ten-company set has a much broader business mix (including merchant acquirers, processors and fintech platforms). Its $V 21.7x LTM EV/EBITDA versus a 11.0x median reconciles exactly to the facts sidecar, but is not the primary peer comparison: the set ranges from 7.0x to 52.9x and is not a same-economics payment-network group. [CIQ facts sidecar, `peer_ev_ebitda`, present; data/V/Company Comparable Analysis Visa Inc.xls — Trading Multiples, 2026-08-17]

## 2. Peer Multiples & Operating Stats

All multiple, growth, margin and vendor-net-debt fields below are from the frozen Capital IQ Company Comparable Analysis workbook, data as of 2026-08-17. They are vendor-defined LTM measures, not Visa-reported non-GAAP measures. Net debt/EBITDA is calculated as the workbook's LTM net-debt field divided by its LTM EBITDA field; Visa's $10,066m net debt is the **broad** basis that also nets $1,433m of current investment securities. [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data, Trading Multiples and Operating Statistics, 2026-08-17; CIQ facts sidecar, `net_debt_m` and `net_debt_ebitda_x`, present]

| Company | P/E | EV/EBITDA | EV/EBIT | EV/Sales | FCF Yield | Rev Growth | EBITDA Margin | ROIC | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Visa | 31.0x | 21.7x | 22.8x | 15.3x | 3.1%* | 14.4% | 69.9% | 22.4%† | 0.32x broad | 2026-08-17; LTM through 2026-06-30 |
| Mastercard | 31.3x | 23.0x | 24.4x | 14.6x | Not available | 16.0% | 63.3% | Not available‡ | 0.58x broad | 2026-08-17; latest LTM filing 2026-07-30 |
| **Peer median (n=1)** | **31.3x** | **23.0x** | **24.4x** | **14.6x** | **Not assessable** | **16.0%** | **63.3%** | **Not assessable** | **0.58x broad** | **2026-08-17** |
| **Peer mean (n=1)** | **31.3x** | **23.0x** | **24.4x** | **14.6x** | **Not assessable** | **16.0%** | **63.3%** | **Not assessable** | **0.58x broad** | **2026-08-17** |

\* Visa FCF yield = $21,013m LTM CFO less capex / $668,435.9m market capitalization = 3.14%. Mastercard FCF is not in the admitted comparable export, so a peer yield and a yield discount are not calculated. [data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, p. 10; data/V/Company Comparable Analysis Visa Inc.xls — Financial Data, 2026-08-17; calculation]

† Visa ROIC is the conservative FY2021–FY2025 standardized return-on-capital average, not an LTM figure. ‡ The available Mastercard disclosure gives a 210.5% FY2025 ROE on a small post-repurchase equity base, not a comparable operating ROIC, so it is not substituted. [data/V/Visa-Inc-NYSE-V-Financials_Annual.xls — Ratios, FY2021–FY2025; Mastercard FY2025 Form 10-K, pp. 68, 70; analyses/V_2026-09-23/business-model/09_moat.md, Competitive Economics]

## 3. Premium / Discount to Peer Median

`Premium / (discount) = (Visa multiple − direct-peer median) / direct-peer median`. Positive means Visa carries a price-multiple premium. The forward rows use each company's Capital IQ NTM measure and are the relevant inputs for Section 5. [data/V/Company Comparable Analysis Visa Inc.xls — Trading Multiples, 2026-08-17]

| Multiple | Visa | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| LTM P/E | 31.0x | 31.3x | (1.0%) |
| LTM EV/EBITDA | 21.7x | 23.0x | (5.7%) |
| LTM EV/EBIT | 22.8x | 24.4x | (6.6%) |
| LTM EV/Sales | 15.3x | 14.6x | 4.8% |
| NTM P/E | 25.20x | 26.78x | (5.9%) |
| NTM EV/EBITDA | 19.42x | 20.50x | (5.3%) |
| NTM EV/Sales | 13.73x | 12.96x | 5.9% |
| FCF yield | Not assessable | Not assessable | Not assessable |

The yield reading is intentionally not inferred: a higher yield would mean a lower valuation, but Mastercard's comparable FCF yield is unavailable. [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data, 2026-08-17]

**Is the gap typical or unusual?** Not assessable. The admitted evidence supplies only one direct-peer multiple snapshot; Visa's own 38-quarter history is not a history of the Visa–Mastercard relative gap and cannot replace it. [CIQ facts sidecar, `ev_ebitda_percentile`, present; data/V/Company Comparable Analysis Visa Inc.xls — Trading Multiples, 2026-08-17]

## 4. Is the Gap Warranted?

Visa's 5.3%–5.9% NTM earnings-multiple discount to Mastercard is broadly warranted, not a proven relative-value error. Visa's vendor LTM EBITDA and EBIT margins are 69.9% and 66.9%, above Mastercard's 63.3% and 59.9%, while its broad net debt/EBITDA is lower (0.32x versus 0.58x); those facts support its 5.9% NTM EV/Sales premium. [data/V/Company Comparable Analysis Visa Inc.xls — Operating Statistics and Financial Data, 2026-08-17]

But Visa's LTM revenue growth is 14.4% versus Mastercard's 16.0%, and its vendor NTM long-term EPS-growth field is 13.5% versus 16.6%. [data/V/Company Comparable Analysis Visa Inc.xls — Operating Statistics, 2026-08-17] Visa also faces routing, interchange and domestic-processing rules; the DOJ debit-network case remained active after its motion-to-dismiss defeat, while Visa's moat read is stable rather than confirmed to be widening. [data/V/Visa-Fiscal-2025-Annual-Report.pdf, Government Regulation, pp. 18–22; Legal Matters, Note 20; analyses/V_2026-09-23/business-model/09_moat.md, Moat Verdict]

**Conclusion: discount is warranted.** The better margin and lower leverage do not alone establish that Visa should trade at Mastercard's full earnings multiple when the forward-growth and regulatory differences run the other way.

## 5. Implied Value from Peer Multiples

All applications use a forward peer multiple on a forward Visa metric: NTM revenue $49,437.52m, NTM EBITDA $34,971.48m and NTM EPS $14.45. For EV methods, `implied equity = implied EV − $23,858m debt + $12,359m cash − $514m preferred equity`, then `/ 1,898m` reported Q3 diluted Class-A-equivalent shares. The bridge uses the canonical **strict** cash basis, so it differs from the Capital IQ broad-cash vendor EV by the $1,433m current-investment-security amount. [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data and Trading Multiples, 2026-08-17; data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, pp. 4, 14, 17–18, Note 12; analyses/V_2026-09-23/valuation/01_price-and-capital-structure.md, Anchor Summary]

| Multiple | Applied Peer Multiple | Implied EV or Equity | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| NTM P/E — primary | 25.44x | Equity, direct P/E per-share output | $367.62 | 0.9% |
| NTM EV/EBITDA | 19.48x | EV $681.1bn; equity $669.1bn | $352.51 | (3.2%) |
| NTM EV/Sales | 12.96x | EV $640.7bn; equity $628.7bn | $331.24 | (9.0%) |

The base-case peer point is **$367.62 per share**, from NTM P/E. The cross-multiple dispersion is **$331.24–$367.62 per share**, not an averaged target. The 0.9% comparison uses the stale $364.15 pool close; against the $361.52 same-day indicative web cross-check, the P/E point is 1.7% higher, but that quote is unverified and does not replace the pool anchor. [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data and Trading Multiples, 2026-08-17; Web: Visa Investor Relations and StockAnalysis, 2026-09-23 close (indicative, unverified); analyses/V_2026-09-23/valuation/01_price-and-capital-structure.md, Price freshness]

**Quality-adjustment ledger**

| Multiple adjusted | Peer median | Adjusted to | Gap already in the denominator? | What the extra adjustment pays for | How it was sized |
|---|---:|---:|---|---|---|
| NTM P/E | 26.78x | 25.44x | Yes | Lower vendor long-term EPS growth (13.5% versus 16.6%) and Visa's regulatory risk, not lower margin | 5% judgmental discount. *Inference, not from filings:* it is not an empirical frequency, a margin ratio, or a price-based adjustment. |
| NTM EV/EBITDA | 20.50x | 19.48x | Yes | The same forward-growth and regulatory-risk difference, not Visa's margin | 5% judgmental discount, applied consistently with the P/E row. |
| NTM EV/Sales | 12.96x | 12.96x | No | None. Visa's higher margin could support a premium, but the one-peer evidence does not independently size one. | No adjustment; the unadjusted direct-peer multiple is the conservative output. |

The double-count test is therefore passed: Visa's margin is already in its own EBITDA and EPS denominators, so no earnings-multiple haircut is based on a margin ratio. The revenue-multiple row has no margin in its denominator, but no unsupported premium is added. Any convergence with Visa's own-history multiple work would be a coincidence, not independent corroboration.

## 6. Sector Cycle Reality Test

Not assessable — no sector-level multiple history. The frozen evidence contains the 2026-08-17 direct-peer snapshot but no three-to-five-year Mastercard/direct-peer aggregate multiple series or sector-ETF valuation series. The peer median is therefore not assumed to be a stable anchor. [data/V/Company Comparable Analysis Visa Inc.xls — Trading Multiples, 2026-08-17]

## 7. Relative Read

Against the only clean quantified direct peer, Visa carries a 5.3%–5.9% forward earnings-multiple discount but a 5.9% forward EV/Sales premium. A 5% growth-and-regulatory-risk adjustment produces a $367.62 peer-comparison point, only 0.9% above the stale pool price, with a $331.24–$367.62 cross-multiple range. The direct sample is one company and the sector-cycle test is not assessable, so this is not evidence of material relative upside.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — V

Visa Inc. (NYSE: V) is an operating company, so this is an FCFF (free cash flow to the firm) DCF with an EV-to-equity bridge. Visa reports under U.S. GAAP in USD and has a September fiscal year-end. All dollar amounts below are USD millions except per-share values. The decision line is V on the NYSE in USD. [Visa Q3 FY26 Form 10-Q, cover and pp. 3–4]

## 1. FCF Base & Normalizations

Base period: LTM ended 30 June 2026. The first fully forward year discounted is FY27 because FY26 ends 30 September 2026, only seven days after the valuation date. FY26E is used only as the near-term operating anchor.

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | $44,488 | None; reported LTM | [Capital IQ Financials Quarterly workbook, Income Statement, LTM 30-Jun-2026 — vendor export; `ciq_facts.json` `multi_year_trajectory`] |
| EBIT / operating income | $26,996 | None. This is GAAP operating income, not the higher vendor special-item-excluding EBIT series. | [Visa FY25 Form 10-K, p. 60; Visa Q3 FY26 Form 10-Q, p. 4; LTM build in Earnings 01] |
| D&A | $1,342 | Derived as $28,338 GAAP-derived EBITDA less $26,996 GAAP EBIT. | [Visa FY25 Form 10-K, pp. 60, 65; Visa Q3 FY26 Form 10-Q, pp. 4, 10; Earnings 01, §2] |
| Cash from operations (CFO) | $22,580 | None. The CIQ facts sidecar reports this as present and it matches the LTM cash-flow workbook read. | [CIQ Financials → Cash Flow “Cash from Ops.”, LTM 30-Jun-2026; `ciq_facts.json` `ltm_ocf_m`] |
| Total capex | $1,567 | None; purchases of property, equipment and technology. | [Visa FY25 Form 10-K, p. 65; Visa Q3 FY26 Form 10-Q, p. 10; Earnings 01, §2] |
| Reported FCF | $21,013 | `CFO − total capex = $22,580 − $1,567`. No cash-flow add-back is made: recurring litigation exclusions and operating-balance movements are not proven non-recurring. | [CIQ Financials → Cash Flow, LTM 30-Jun-2026; Visa FY25 Form 10-K, p. 65; Earnings 06, §§1, 4–5] |
| Normalized NOPAT tax rate | 17.6% | Uses the moat module’s canonical normalized rate: FY22–FY24 effective-tax average (17.53%, 17.89%, 17.45%). This strips the FY26 nine-month $351m deferred-tax benefit and $217m tax-position benefit that reduced the reported rate. | [Visa FY25 Form 10-K, p. 60; Visa Q3 FY26 Form 10-Q, Note 15, p. 24; Business Model 09, §3] |
| Implied LTM operating working-capital cash absorption | $1,007 | Residual reconciliation: `$26,996 × (1 − 17.6%) + $1,342 − $1,567 − $21,013 = $1,007`. It includes broad operating-balance movements, not a clean receivables/inventory/payables cycle. | [Visa Q3 FY26 Form 10-Q, p. 10; Earnings 06, §§1–3; calculation] |

The FCFF identity is `NOPAT + D&A − capex − ΔNWC`. It reconciles to the reported LTM `CFO − capex` base above. Visa's nine-month FY26 cash flow included a $3,621m deterioration in operating asset/liability movements, including litigation and settlement payables; I do not call this a permanent cash-flow adjustment. [Visa Q3 FY26 Form 10-Q, p. 10; Earnings 06, §10]

## 2. Forecast Assumptions

FY26E revenue is the direct $45,743.58m FY26 consensus, not a sum of quarterly estimates. The cash flows discounted below start in FY27. Every analyst assumption is labelled; no peer-derived inputs are used.

| Assumption | FY26E anchor (not discounted) | FY27 / Yr1 | FY28 / Yr2 | FY29 / Yr3 | FY30 / Yr4 | FY31 / Yr5 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 14.4% (VC) | 12.0% (AA) | 10.0% (AA) | 8.0% (AA) | 6.0% (AA) | 5.0% (AA) | 3.0% (AA) | FY26E is Capital IQ consensus. FY27–FY31 and terminal are **analyst assumptions, not company-guided**, declining from the 14.4% LTM growth and FY26 consensus as the payments-volume base grows. [Capital IQ Estimates → Consensus, FY2026; Visa Q3 FY26 Form 10-Q, p. 4; Earnings 01, §2] |
| EBIT margin % | 62.0% (AA) | 62.5% (AA) | 63.0% (AA) | 63.0% (AA) | 63.0% (AA) | 63.0% (AA) | 63.0% (AA) | **Analyst assumptions, not company-guided.** They sit below FY24's 65.7% GAAP margin but above FY25's 60.0% and the June LTM's 60.7%; the modest recovery assumes slower operating-expense growth but does not erase regulatory, incentive, litigation, or marketing risk. [Visa FY25 Form 10-K, p. 60; Visa Q3 FY26 Form 10-Q, pp. 4, 34–35; Q3 FY26 presentation, pp. 20–21] |
| Tax rate % | 17.6% (FN) | 17.6% (FN) | 17.6% (FN) | 17.6% (FN) | 17.6% (FN) | 17.6% (FN) | 17.6% (FN) | Canonical normalized rate from Business Model 09; see §1. It is not the FY26 reported nine-month rate. [Visa Q3 FY26 Form 10-Q, Note 15, p. 24; Business Model 09, §3] |
| D&A (% of revenue) | 3.0% (AA) | 3.0% (AA) | 3.0% (AA) | 3.0% (AA) | 3.0% (AA) | 3.0% (AA) | Embedded in terminal reinvestment (AA) | **Analyst assumption, not company-guided,** anchored to LTM GAAP-derived D&A of 3.0% of revenue. [Earnings 01, §2] |
| Capex (% of revenue) | 3.5% (AA) | 3.5% (AA) | 3.5% (AA) | 3.5% (AA) | 3.5% (AA) | 3.5% (AA) | Embedded in terminal reinvestment (AA) | **Analyst assumption, not company-guided,** anchored to FY25 3.7% and LTM 3.5% total capex/revenue. [Visa FY25 Form 10-K, pp. 60, 65; Earnings 01, §§1–2] |
| Δ Working capital (% of revenue) | 2.2% (AA) | 1.5% (AA) | 1.0% (AA) | 0.7% (AA) | 0.5% (AA) | 0.4% (AA) | Terminal reinvestment is 13.39% of NOPAT (AA), not this line | **Analyst assumptions, not company-guided.** Each is a positive cash absorption tied to revenue, not a flat dollar amount. The glide path starts below the inferred 2.26% LTM cash drag but gives no working-capital release; FY25 DSO rose from 26.0 to 28.5 days and the broad cash-flow movements are volatile. [Visa FY25 Form 10-K, p. 59; Visa Q3 FY26 Form 10-Q, p. 10; Earnings 06, §§2–3] |

`VC` = vendor consensus, `FN` = filing-normalized calculation, and `AA` = analyst assumption. The revenue path is deliberately below the 13.5% CIQ long-term growth consensus field after FY27; that field is an estimate-based vendor measure, not a company forecast. Visa's Q3 guidance was only low-double-digit to low-teens GAAP nominal revenue growth for FQ4, while the then-current Street FQ4 revenue bar was 18.9% growth. [Capital IQ Estimates → Consensus, Guidance and Revisions, FY2026 / FQ4 FY2026; Q3 FY26 presentation, pp. 20–21; Earnings 04, §§1–3]

Intrinsic confidence: **Low.** The FCF base is reported, but only FY26 has a direct consensus anchor; the FY27–FY31 operating path and the working-capital glide path are analyst-built. The 74.3% terminal-value share adds further model risk.

## 3. Discount Rate (WACC)

WACC is the blended return required by equity, debt, and preferred capital. The computed 9.04% is used; there is no analyst override. The risk-free rate and ERP are web-sourced and therefore unverified under the source hierarchy.

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 5.11% | U.S. 10-year constant-maturity Treasury on 23-Sep-2026. [Web: U.S. Treasury Daily Treasury Par Yield Curve, 2026-09-23, indicative/unverified] |
| Equity-risk premium | 4.14% | U.S. implied ERP, trailing-12-month adjusted-payout measure, 1-Sep-2026. [Web: Aswath Damodaran, Equity Risk Premiums, 2026-09-01, indicative/unverified] |
| Beta | 1.00 used; 0.76 raw five-year CIQ beta | The raw beta is below 0.8, and CIQ does not disclose the index. Visa has price, client-incentive, consumer-cycle, FX, and regulatory exposure, so I apply the required 1.00 floor rather than rely on the raw local-index measurement. | [Capital IQ Public Company Profile, Beta 5Y, created 17-Aug-2026; Business Model 07, competitive-intensity and regulatory-dependence rows; Business Model 10, §§1, 3] |
| Cost of equity | 9.25% | `5.11% + 1.00 × 4.14%` |
| Pre-tax cost of debt | 3.80% | Conservative proxy for the low end of Visa's February 2026 fixed-note coupons (3.80%–4.70%); commercial paper was 3.77% at 30-Jun-2026. This is not represented as the weighted-average rate on all debt. [Visa Q3 FY26 Form 10-Q, Note 8, pp. 17–18] |
| Tax rate | 17.60% | Same normalized rate as NOPAT. [Business Model 09, §3] |
| Equity / debt / preferred weights | 96.482% / 3.444% / 0.074% | $668,435.9m market cap, $23,858m debt, and $514m preferred book value proxy. [Capital IQ Comps → Financial Data, 17-Aug-2026; Visa Q3 FY26 Form 10-Q, pp. 4, 17–18, 22–23; Valuation 01, §§3–4] |
| Preferred cost | 9.25% | No preferred market yield is disclosed; cost-of-equity proxy, immaterial at 0.074% of capital. **Analyst assumption, not company-guided.** |
| **WACC** | **9.04%** | **Computed below** |

Formula: `WACC = w_e·k_e + w_d·k_d·(1 − t) + w_p·k_p`.

The low-side floors are cleared: `k_e − rf = 4.14 percentage points`; used beta is 1.00, above the 0.8 floor; and no country-risk premium is added deliberately because Visa's USD cash flows are global rather than concentrated in a single emerging/non-reserve-currency market. The raw 0.76 beta is shown rather than hidden. The high-side check also clears: 9.25% cost of equity is below `5.11% + 1.4 × 4.14% = 10.91%`. After-tax debt cost is 3.13%, so `3.13% ≤ 9.04% < 9.25%` holds.

## 3A. Cost-of-Capital Reality Test

| Reference | Rate | Source (cite per §5) | Gap vs model WACC |
|---|---:|---|---:|
| Model WACC (CAPM build, §3) | 9.04% | This agent, §3 | — |
| Scope-matched group discount rate | Group discount rate not disclosed | Visa's filings do not disclose a listed-group WACC, cost of equity, or impairment rate for the group cash flows being valued. | Not assessable |
| Other disclosed rate (comparator only) | 4.11% | FY25 operating-lease weighted-average discount rate. It values lease obligations, not Visa's group operating cash flows; U.S.-dollar, lease-liability, post-tax basis is not disclosed. [Visa FY25 Form 10-K, Note 9, p. 82] | (4.93)pp |
| Market-implied rate | Runs after this agent — reconcile in 05_reverse-dcf | No reverse-DCF output exists yet. | Not assessable |
| Trailing FCF yield / earnings yield | 3.14% / 3.24% | FCF yield is `$21,013 / $668,436`; earnings yield is `1 / 30.9x`. These are equity yields, not direct WACC substitutes. [Visa FY25 Form 10-K, p. 65; Capital IQ Comps → Financial Data, 17-Aug-2026; `ciq_facts.json` `pe_ltm_current_x`; calculation] | (5.90)pp / (5.80)pp |
| Peer / industry cost of capital | Not assessable | No source-bound peer/industry cost-of-capital input was available. | Not assessable |

Escalation branch: not triggered. There is no scope-matched company rate, and the reverse-DCF runs after this report; the model WACC is also 1.24pp above, not below, the 7.8% preliminary moat-module CAPM inference that used the unadjusted 0.76 beta. [Business Model 09, §3]

## 4. Free Cash Flow Forecast & Discounting

Mid-year convention is used: FY27–FY31 cash flows are discounted at `t − 0.5`, because they are earned through each fiscal year. FCF is `NOPAT + D&A − capex − ΔNWC`. D&A, included in the formula but not repeated in the required table columns, is $1,537m, $1,691m, $1,826m, $1,935m, and $2,032m for FY27–FY31 respectively.

| Year | Revenue | EBIT | NOPAT | Capex | ΔWC | FCF | Discount Factor | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FY27 | $51,233 | $32,021 | $26,385 | $1,793 | $768 | $25,360 | 0.957654 | $24,286 |
| FY28 | $56,356 | $35,504 | $29,256 | $1,972 | $564 | $28,410 | 0.878265 | $24,952 |
| FY29 | $60,865 | $38,345 | $31,596 | $2,130 | $426 | $30,866 | 0.805457 | $24,861 |
| FY30 | $64,516 | $40,645 | $33,492 | $2,258 | $323 | $32,847 | 0.738685 | $24,263 |
| FY31 | $67,742 | $42,678 | $35,166 | $2,371 | $271 | $34,557 | 0.677449 | $23,410 |

Each modeled `ΔNWC` is positive, so it is a cash use and correctly reduces FCF. The forecast does not hold a flat absolute working-capital charge: FY27's $768m is 1.5% of revenue and FY31's $271m is 0.4% of revenue. It does not assume a release of cash from the operating-balance movements.

Sum of PV of explicit FCFs: **$121,773m**.

Executed calculation (Python 3.12; all values in USD millions except per-share output):

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -c 'rf,erp,beta,kd,t,e,d,p=.0511,.0414,1.,.038,.176,668435.9,23858.,514.;ke=rf+beta*erp;we,wd,wp=e/(e+d+p),d/(e+d+p),p/(e+d+p);w=we*ke+wd*kd*(1-t)+wp*ke;r=[51232.810,56356.091,60864.578,64516.452,67742.274];m=[.625,.63,.63,.63,.63];n=[a*b*(1-t) for a,b in zip(r,m)];f=[x+a*.03-a*.035-a*b for x,a,b in zip(n,r,[.015,.010,.007,.005,.004])];df=[1/(1+w)**(i-.5) for i in range(1,6)];pv=sum(x*y for x,y in zip(f,df));g,roic=.03,.224;f6=n[-1]*(1+g)*(1-g/roic);tv=f6/(w-g);pvtv=tv*df[-1];ev=pv+pvtv;eq=ev-11499-514;print(f"wacc={w:.4%}; pv_explicit={pv:.3f}; fcff_32={f6:.3f}; tv={tv:.3f}; pv_tv={pvtv:.3f}; ev={ev:.3f}; equity={eq:.3f}; per_share={eq/1898:.3f}")'
```

```text
wacc=9.0393%; pv_explicit=121772.691; fcff_32=31370.285; tv=519436.741; pv_tv=351891.776; ev=473664.468; equity=461651.468; per_share=243.230
```

## 5. Terminal Value

Method: Gordon growth with a financeable-growth adjustment. The standard formula is `TV = FCFF_(n+1) / (WACC − g) = FCFF_n × (1 + g) / (WACC − g)`. Here, the terminal `FCFF_(n+1)` is first made financeable: `FCFF_32 = NOPAT_32 × (1 − g / ROIC)`. At the conservative 22.4% moat-module ROIC, 3.0% terminal growth requires 13.39% reinvestment.

- FY32 NOPAT: `$35,166 × 1.03 = $36,221m`.
- Terminal reinvestment: `$36,221 × (3.0% / 22.4%) = $4,851m`.
- Terminal FCFF: `$36,221 − $4,851 = $31,370m`.
- Terminal value: `$31,370 / (9.0393% − 3.0%) = $519,437m`.
- PV of terminal value: `$351,892m`.
- **Terminal value as % of total EV: 74.3%.** It is just below the 75% terminal-dominance trigger, but still makes the WACC and terminal-reinvestment assumptions the main sources of dispersion.

The financeable-growth check is binding. FY31's explicit net capex plus working-capital investment is only `$2,371 − $2,032 + $271 = $610m`, whereas the terminal steady-state calculation requires $4,851m of reinvestment. The $4,241m gap is not ignored: it is the reason terminal FCFF is $31,370m rather than a mechanical FY31 FCF grown by 3%. This is an inference from the ROIC-and-reinvestment formula, not a filing disclosure. [Business Model 09, §3; calculation]

The Gordon value implies a terminal `EV / EBITDA` of 11.28x (`$519,437 / $46,050`). That is below the 21.6x current CIQ LTM EV/EBITDA read, so the exit-multiple cross-check does not rely on retaining the current multiple in perpetuity. It is a mechanical check only: the admitted evidence does not provide an independent mature-network exit-multiple anchor. [CIQ Financials → Multiples “TEV/LTM EBITDA”, latest; `ciq_facts.json` `ev_ebitda_current_x`; calculation]

Structural-decline / runoff trigger: **not fired.** Business Model 09 finds a strong moat with a stable, not widening, trajectory, and Business Model 07 scores disruption risk at 55/100, above the ≤40 runoff trigger. The base therefore permits excess returns but uses a 3.0% nominal USD terminal growth rate and 22.4% rather than the higher current ROIC read. [Business Model 09, §§3, 5; Business Model 07, industry rate-of-change row]

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFs | $121,773m |
| + PV of terminal value | $351,892m |
| **= Enterprise value** | **$473,664m** |
| − Net debt | ($11,499m) strict basis |
| − Minority / preferred | ($514m) preferred; no separately reported NCI |
| **= Equity value** | **$461,651m** |
| ÷ Diluted shares | 1,898m |
| **= Intrinsic value per share** | **$243.23** |
| vs current price | $364.15 pool close, 17-Aug-2026: **(33.2%)**; price is 26 trading days stale. Fresh $361.52 web context gives **(32.7%)**, but is unverified. |

The bridge uses the canonical strict net debt of `$23,858m debt − $12,359m cash equivalents = $11,499m`, not CIQ's $10,066m broad basis that also nets current investment securities. The per-share denominator is the 1,898m Q3 diluted weighted-average Class-A-equivalent count. [Visa Q3 FY26 Form 10-Q, pp. 4, 14, 17–18, Note 12; Valuation 01, §§2, 5, 7]

## 7. Sensitivity Grid (per-share intrinsic value)

WACC across columns, terminal growth down rows. Every cell retains the financeable terminal reinvestment rate of `g / 22.4%`; no cell has a near-zero `WACC − g` denominator.

| | WACC 8.04% | WACC 9.04% | WACC 10.04% |
|---|---:|---:|---:|
| g 3.5% | $311.02 | $255.71 | $217.27 |
| g 3.0% | $290.92 | $243.23 | $209.06 |
| g 2.5% | $274.39 | $232.61 | $201.90 |

## 8. Intrinsic Read

The base-case intrinsic value is **$243.23 per V share**, with a $201.90–$311.02 sensitivity dispersion; it is 33.2% below the stale $364.15 pool close and 32.7% below the fresh but unverified $361.52 web close. The model is most sensitive to the 9.04% WACC and the terminal reinvestment needed to make even 3.0% perpetual growth financeable, not to the explicit FY27–FY31 revenue path.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — V

## 1. Inputs

Visa Inc. is an operating company reporting in USD under U.S. GAAP. This reverse DCF uses the exact enterprise-value (EV) framework, strict-cash EV bridge, five-year horizon, 3.0% terminal growth, and mid-year discounting convention used in `04_intrinsic-dcf`. The price is pool-verified, so the reverse solve can run, but it is 26 U.S. trading days stale; it remains the canonical anchor and brings the valuation-confidence maximum of 60. [Valuation 01, §§1, 4, 7; Capital IQ Comps → Financial Data, Visa subject row, 2026-08-17; `ciq_facts.json` `current_price`]

| Input | Value | Source |
|---|---:|---|
| Current price | $364.15 per V share, NYSE, day close on 2026-08-17; pool-verified but 26 trading days stale | [Capital IQ Comps → Financial Data, Visa subject row, 2026-08-17; `ciq_facts.json` `current_price`; Valuation 01, §§1, 7] |
| Enterprise value | $680,448.9m, strict-cash basis | [Valuation 01, §§4, 7; Visa Q3 FY26 Form 10-Q, pp. 4, 14, 17–18] |
| FCF base | $21,013m LTM to 2026-06-30: $22,580m CFO − $1,567m total capex; no cash-flow normalization/add-back | [Valuation 04, §1; CIQ Financials → Cash Flow, LTM 2026-06-30; `ciq_facts.json` `ltm_ocf_m`] |
| Discount rate (WACC) used | 9.04%: 5.11% risk-free rate + 1.00 beta × 4.14% ERP, with debt and preferred weights | [Valuation 04, §3] |
| Forecast horizon | Five fiscal years, FY27–FY31; mid-year discounting | [Valuation 04, §4] |
| Terminal inputs held fixed | 3.0% terminal growth and 22.4% ROIC; terminal FCFF is reduced for the reinvestment needed to fund terminal growth | [Valuation 04, §5; Business Model 09, §3] |

The reported and normalized FCF base are the same $21,013m because `04` made no add-back. This matters for the base sensitivity below: a separate low/high normalized-base band does not exist in the forward DCF and is not invented here. [Valuation 04, §1]

## 2. Implied Expectations

The primary solve holds the 9.04% WACC, 3.0% terminal growth, 22.4% terminal ROIC, five-year horizon, mid-year convention, 62.5%/63.0% EBIT-margin path, 17.6% tax rate, 3.0% D&A/revenue, 3.5% capex/revenue, and the FY27–FY31 working-capital path fixed. It solves one uniform addition to each of `04`'s annual revenue-growth rates (12%, 10%, 8%, 6%, 5%). This keeps the same operating DCF mechanics rather than substituting a flat, independently derived FCF model. *Inference, not from filings.* [Valuation 04, §§2, 4–5]

Executed solver (Python 3.12; USD millions; bisection root finding):

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -c 'EV=680448.9;w=.090393;tg=.03;ro=.224;R0=45743.58;gs=[.12,.10,.08,.06,.05];ms=[.625,.63,.63,.63,.63];wc=[.015,.01,.007,.005,.004];tax=.176
def M(d,w=w,tg=tg):
 R=R0;fs=[];ns=[]
 for a,m,q in zip(gs,ms,wc): R*=1+a+d;n=R*m*(1-tax);ns+=[n];fs+=[n+R*.03-R*.035-R*q]
 df=[1/(1+w)**(i-.5) for i in range(1,6)];f6=ns[-1]*(1+tg)*(1-tg/ro);return sum(a*b for a,b in zip(fs,df))+f6/(w-tg)*df[-1],R,fs[-1]
def B(F,l,h):
 for _ in range(200):
  z=(l+h)/2
  if F(l)*F(z)<=0:h=z
  else:l=z
 return (l+h)/2
d=B(lambda x:M(x)[0]-EV,-.2,.5);x=M(d);print(f"growth_delta={d:.6%}; implied_FCF_CAGR={(x[2]/21013)**.2-1:.6%}; FY31_revenue={x[1]:.3f}; FY31_FCF={x[2]:.3f}; EV={x[0]:.3f}")
fs=[25360,28410,30866,32847,34557];f6=31370.285
def E(r):
 df=[1/(1+r)**(i-.5) for i in range(1,6)];return sum(a*b for a,b in zip(fs,df))+f6/(r-tg)*df[-1]
r=B(lambda x:E(x)-EV,.031,.25);print(f"implied_WACC={r:.6%}; ratio_to_model={r/w:.6%}; EV={E(r):.3f}")'
```

Root returned: `growth_delta=9.019646%; implied_FCF_CAGR=19.674024%; FY31_revenue=101114.906; FY31_FCF=51580.736; EV=680448.900`.

| What the Price Implies | Solved Value |
|---|---:|
| Uniform addition to `04`'s FY27–FY31 revenue-growth path | +9.02 percentage points |
| Implied annual revenue growth, FY27 / FY28 / FY29 / FY30 / FY31 | 21.02% / 19.02% / 17.02% / 15.02% / 14.02% |
| Implied revenue CAGR, FY26E anchor to FY31 | 17.2%: $45,744m to $101,115m |
| Implied FCF CAGR over the five forecast years | 19.67%: `(FY31 FCF $51,581m / LTM FCF $21,013m)^(1/5) − 1` |
| Implied years of above-GDP growth | Five years; every solved revenue-growth year is 14.0% or higher before the 3.0% terminal rate |
| Implied steady-state EBIT margin | 63.0%, **held fixed**, not solved |
| Terminal-value share of EV in the price-matched solve | 77.2% |

This is a demanding conditional result, not a forecast: at `04`'s discount rate, the price needs Visa to grow revenue to roughly $101.1bn by FY31 while retaining the DCF's 63.0% EBIT margin. The terminal-value share exceeds 60%, so the terminal-growth re-solve is required and shown in §4. [Valuation 04, §§2, 5]

## 2A. Implied Discount Rate — the dual solve (always run this)

The mirror solve holds `04`'s exact base-case FCFF path ($25,360m, $28,410m, $30,866m, $32,847m, and $34,557m for FY27–FY31), terminal FCFF of $31,370m, 3.0% terminal growth, five-year horizon, and mid-year convention fixed. It solves the discount rate that makes those cash flows equal the same $680,448.9m EV. [Valuation 04, §§4–6]

The same executed command in §2 then runs `E(r)`, which discounts the five stated FCFFs at `t − 0.5` and adds `31,370.285 / (r − 3.0%)` at FY31.

Root returned: `implied_WACC=7.154710%; ratio_to_model=79.151153%; EV=680448.900`.

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied discount rate at `04`'s base-case cash flows | `04` FCFF path, terminal g, five-year horizon, mid-year convention | 7.15% |
| `04`'s model WACC (for comparison) | — | 9.04% |
| Ratio (implied ÷ model) | — | 0.79x |

For `04` §3A, the market-implied rate is **7.15%**, 1.89 percentage points below the 9.04% model WACC; it cuts toward a lower required return if `04`'s base cash-flow path is accepted. The 0.79x ratio does not meet the >1.5x escalation threshold, and `04`'s WACC cleared its stated low-side floors; therefore this result does not support an assertion that the market is pricing an unprecedented cash-flow collapse. It exposes the two valid readings of the valuation equation instead: either cash flows are higher than `04`'s base path, or the appropriate rate is lower than 9.04%. There is no scope-matched company-disclosed group rate in the admitted evidence to choose between them conclusively. [Valuation 04, §§3–3A]

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| FCF CAGR of 19.67% for five forecast years | FCF rose from $14,522m in FY21 to $21,577m in FY25, a 10.4% CAGR on the same CFO-minus-capex definition; latest LTM FCF of $21,013m was down 4.8% year on year. [Capital IQ Financials Annual → Cash Flow, FY21/FY25; Earnings 01, §§1–2] | The largest quantified operating bound is only a one-quarter, non-additive $329m pre-tax effect for a 3% change in payment volume/transactions; it is an inference, not management guidance. [Earnings 07, §§2–4] | **Stretch / not proven** |
| Revenue CAGR of 17.2% to $101,115m in FY31 | Revenue rose from $24,105m in FY21 to $40,000m in FY25, a 13.5% CAGR; LTM revenue was $44,488m, up 14.4%. [Capital IQ Financials Annual → Income Statement, FY21/FY25; Earnings 01, §§1–2] | Capital IQ's FY27–FY31 revenue estimates run from $50,770m to $74,249m. The latter is a one-estimate FY31 field and is not a strong forecast anchor, but it is $26,866m below the reverse-solved FY31 revenue. [Capital IQ Estimates → Consensus, FY27–FY31] | **Stretch / not proven** |
| Maintain 63.0% EBIT margin while growing revenue at 14%–21% | FY24 GAAP EBIT margin was 65.7%, FY25 was 60.0% after a $2,562m litigation provision, and June LTM was 60.7%. [Earnings 01, §§1–2] | Client-incentive intensity rose about 119 bps year on year; Q3 marketing expense was up $228m year on year, and the drivers overlap rather than add cleanly. [Earnings 07, §2] | **Not proven** |
| Sustain above-GDP growth for all five years | Visa has a two-sided network of roughly 12bn credentials and more than 175m merchant locations; its moat read is stable, not confirmed widening. [Business Model 09, §§2, 5] | Payment volume/transactions grew 9%–10% in the Q3 reference period, but management cited unusually elevated June/July retail promotion and days mix. [Earnings 07, §§3–4] | **Stretch** |

The market's implied FCF growth is aggressive **if 9.04% is the right WACC**: 19.67% exceeds the FY21–FY25 reported-FCF CAGR by 9.3 percentage points, while the most recent LTM FCF fell 4.8%. Visa's network and high returns on capital support sustained growth, but the supplied evidence describes the moat as stable rather than widening and does not prove five years of 14%–21% revenue growth at a 63% margin. [Earnings 01, §§1–2, 6; Earnings 07, §§2–4; Business Model 09, §§2–5]

**Market-ceiling sanity check.** Not assessable — the admitted evidence has no credible addressable-market revenue total. Visa's disclosed payment volume and credential/merchant counts are not revenue TAMs, so treating them as a revenue ceiling would be a category error. The check is omitted rather than invented; it could only have made the implied-growth requirement harder. [Business Model 09, §§2, 5]

## 4. Robustness

Each result below was re-solved by the same executed bisection solver rather than calculated by hand. [Executed Python output below; Valuation 04, §§2, 4–5]

```text
WACC-1: delta=4.523040%; FCF_CAGR=15.081039%; FY31_revenue=83144.703; EV=680448.900
WACC:   delta=9.019646%; FCF_CAGR=19.674024%; FY31_revenue=101114.906; EV=680448.900
WACC+1: delta=13.044441%; FCF_CAGR=23.785014%; FY31_revenue=119717.063; EV=680448.900
g-0.5:  delta=10.188321%; FCF_CAGR=20.867734%; FY31_revenue=106259.460; EV=680448.900
g+0.5:  delta=7.732002%; FCF_CAGR=18.358790%; FY31_revenue=95679.368; EV=680448.900
```

| Discount Rate | Implied FCF CAGR to Justify Price |
|---|---:|
| WACC −1%: 8.04% | 15.08% |
| WACC: 9.04% | 19.67% |
| WACC +1%: 10.04% | 23.79% |

| Terminal growth rate | Implied FCF CAGR to Justify Price |
|---|---:|
| 2.5% | 20.87% |
| 3.0% | 19.67% |
| 3.5% | 18.36% |

| FCF-base case | Normalized FCF base used | Implied FCF CAGR | Interpretation |
|---|---:|---:|---|
| Low | Not separately derived; $21,013m | 19.67% | `04` reports no lower normalized base. |
| Base | $21,013m | 19.67% | Reported CFO − capex; no add-back. |
| High | Not separately derived; $21,013m | 19.67% | `04` reports no higher normalized base. |

The FCF-base comparison is **not assessable** because `04` defines only one normalized base; the identical rows are deliberate, not a claim of zero cash-flow uncertainty. A base-band sensitivity would require a sourced normalized alternative and must not be fabricated here. Among the defined re-solves, WACC is the larger driver: a ±1.0-point move changes implied FCF CAGR by 4.11–4.59 percentage points from the base, versus 1.19–1.32 points for terminal growth ±0.5%. [Valuation 04, §§1, 5, 7]

## 5. What's-Priced-In Read

At the stale but pool-verified $364.15 V price, **conditional on `04`'s 9.04% WACC**, the market is pricing roughly 19.67% FCF CAGR across the five forecast years, with FY31 revenue of about $101.1bn and a 63.0% EBIT margin. That is aggressive relative to Visa's 10.4% FY21–FY25 reported-FCF CAGR, latest LTM FCF decline, and the evidence that its moat is stable rather than confirmed widening. [Earnings 01, §§1–2; Business Model 09, §5]

The dual solve prevents a one-sided conclusion: `04`'s exact base cash-flow path also reconciles to today's EV at a 7.15% discount rate rather than 9.04%. The available evidence does not prove which assumption is wrong, so this is a conditional priced-in warning, not a final valuation verdict. [Valuation 04, §§3–6]



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — V

Visa is a U.S. GAAP operating company that reports in USD and has a September fiscal year-end. Amounts are USD millions except per-share figures. This is a **collapsed SOTP**: Visa reports one Payment Services segment, so a breakup would merely restate the consolidated valuation. The direct-peer check below is a sanity check only, not an independent method for `07_scenario-and-fair-value`.

## 1. Segment Inventory

| Segment | Revenue | EBIT (or EBITDA) | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| Payment Services | $40,000 FY25 | $23,994 FY25 consolidated GAAP EBIT; not separately disclosed segment EBIT | 60.0% | 100.0% of consolidated GAAP EBIT (sole reportable segment) | [Visa FY2025 Form 10-K, Consolidated Statements of Operations, p. 60; Note 14, p. 87] |

The denominator is consolidated GAAP EBIT, used as a proxy because Payment Services is the only reportable segment and Visa does not disclose a segment profit-and-loss statement below the consolidated level. The CIQ facts sidecar's `segments_revenue` fact is present and reports Payment Services revenue of $40,000m (100%) for the year ended 2025-09-30, consistent with the filing. [Visa FY2025 Form 10-K, Note 14, p. 87; CIQ Financials→Segments (Revenues, latest annual column), 12 months ended 2025-09-30 — vendor export; `ciq_facts.json`, `segments_revenue`]

**Effectively single-segment — SOTP collapses to the consolidated read.** U.S./international disclosures and service, data-processing, international-transaction and other revenue are geographic or revenue-category views, not separate businesses to value. [Visa FY2025 Form 10-K, Item 1, pp. 5–6; Note 14, pp. 87–88; Visa Q3 FY2026 Form 10-Q, Note 10, p. 19]

## 2. Segment Multiples & Comparables

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| Payment Services | NTM vendor-defined EBITDA: $34,971.48m | 19.475x (shown as 19.48x) | Mastercard (MA) | 20.50x NTM EV/EBITDA | [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data and Trading Multiples, 2026-08-17; Capital IQ vendor export] |

Mastercard is the closest listed comparable because both are global branded payment networks that authorize, clear and settle transactions, with similarly asset-light network economics; American Express has issuer-and-lender economics, so it is not used for an EV/EBITDA check. [Visa FY2025 Form 10-K, Competition, p. 17; analyses/V_2026-09-23/business-model/08_competitive-map.md, Section 2]

The applied 19.475x is Mastercard's 20.50x NTM EV/EBITDA less a 5% judgmental adjustment for Visa's lower vendor long-term EPS-growth field (13.5% versus 16.6%) and regulatory exposure. It is not a margin haircut: Visa's own EBITDA already contains its margin. *Inference, not from filings.* [data/V/Company Comparable Analysis Visa Inc.xls — Operating Statistics and Trading Multiples, 2026-08-17; Visa FY2025 Form 10-K, Government Regulation and Note 20 (Legal Matters)]

The forward metric is a Capital IQ NTM vendor estimate, not Visa-reported EBITDA; Visa does not report EBITDA. The frozen estimate workbook is at least 43 days old at the run date, so this is a dated forward check rather than a fresh consensus read. [Capital IQ Estimates→Recent Changes, 2026-08-10 to 2026-08-11; analyses/V_2026-09-23/earnings/04_guidance-consensus.md, Section 1]

## 3. Segment Valuation

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Payment Services — collapsed single segment, NTM EBITDA | $34,971.48 | 19.475x | $681,069.6 |
| **Gross enterprise value (sum)** |  |  | **$681,069.6** |

`$681,069.6m = $34,971.48m × 19.475x`. This is the dominant-segment multiple sanity check. There is no separate SOTP dispersion range: the only clean, quantified same-economics comparator in the frozen export is Mastercard, so a wider range would require unsupported multiples. [data/V/Company Comparable Analysis Visa Inc.xls — Financial Data and Trading Multiples, 2026-08-17; analyses/V_2026-09-23/business-model/08_competitive-map.md, Sections 1–2]

## 4. Equity Bridge

| Step | Value |
|---|---:|
| Gross enterprise value | $681,069.6 |
| − Capitalized unallocated corporate costs | $0 — no separately reported corporate/unallocated bucket; the single-company NTM EBITDA metric has no such separately added-back cost |
| − Net debt | ($11,499.0) strict basis |
| − Minority / preferred | ($514.0) preferred equity; no separately reported NCI |
| + Equity-method investments | $0 — none separately disclosed for EV treatment |
| − Conglomerate / holdco discount (if any) | $0 — one operating business, not a holding-company structure |
| **= Equity value** | **$669,056.6** |
| ÷ Diluted shares | 1,898.0m |
| **= SOTP value per share** | **$352.51** |
| vs current price | ($11.64), or (3.2%) versus $364.15 pool close on 2026-08-17 |

`$669,056.6m = $681,069.6m − $11,499.0m − $514.0m`; `$352.51 = $669,056.6m ÷ 1,898.0m`. Net debt is deducted once on the strict basis; there is no separate net-cash add-back. The $11,499m strict net-debt figure, $514m preferred-equity figure and 1,898m diluted-share count are the canonical `01` anchors. [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, pp. 4, 14, 17–18; Notes 8, 11 and 12; analyses/V_2026-09-23/valuation/01_price-and-capital-structure.md, Anchor Summary]

No conglomerate discount is warranted because there is no separately valued collection of operating businesses. The $0 corporate-cost line does not make a bucket vanish: Visa reports no corporate/unallocated segment, and the single-company NTM EBITDA metric has no separately identified corporate amount to add back or capitalize. [Visa FY2025 Form 10-K, Note 14, p. 87; Visa Q3 FY2026 Form 10-Q, Note 10, p. 19]

The $364.15 price is pool-verified, but 26 U.S. trading days stale at the run date; the CIQ facts sidecar's present `current_price` fact gives the same $364.15, sourced to Capital IQ's 2026-08-17 subject-row close. The freshest unverified web cross-check was $361.52 on 2026-09-23, which remains $9.01 (2.5%) above the sanity-check value and does not replace the pool anchor. [CIQ Comps→Financial Data `Day Close Price Latest`, 2026-08-17; `ciq_facts.json`, `current_price`; analyses/V_2026-09-23/valuation/01_price-and-capital-structure.md, Sections 1 and 7]

## 5. SOTP Read

Payment Services carries all of Visa's reported-segment value. The collapsed NTM EV/EBITDA check gives $352.51 per share, $11.64 (3.2%) below the stale $364.15 pool price; no high-value or low-value segment is being hidden by a consolidated multiple.

This is not a separate fair-value method to weight beside the consolidated peer EV/EBITDA result: it uses the same whole-company forward EBITDA and the same Mastercard comparator. Its useful finding is the absence of a breakup opportunity, not a distinct valuation conclusion.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — V

Visa Inc. is a U.S. GAAP operating company reporting in USD. All values below apply to Visa Class A common stock (`V`, NYSE, USD) and use the 1,898m Q3 FY2026 diluted Class-A-equivalent shares and $11,499m strict net debt plus $514m preferred equity from the canonical valuation bridge. [Visa Q3 FY2026 Form 10-Q, Note 12 and pp. 4, 14, 17–18; `01_price-and-capital-structure`, Anchor Summary]

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $355.21 | Medium | 40% | The selected own-median EV/revenue value uses reported LTM revenue and a matched historic denominator. It is more reproducible than the P/E reversion, but the sector-cycle stability test is not assessable and historical trading levels are not an independent proof of worth. [Capital IQ Financials → Multiples, through 30-Jun-2026; Capital IQ Comps → Financial Data, 17-Aug-2026; `02_multiples-own-history`, §§2, 4–5] |
| Relative / peers (03) | $367.62 | Low–medium | 35% | NTM P/E uses the closest direct peer, Mastercard, with a stated 5% growth-and-regulatory-risk adjustment. The peer set is only one company and neither peer-relative history nor a sector multiple history is available. [Capital IQ Comps → Financial Data and Trading Multiples, 17-Aug-2026; `03_relative-valuation-peers`, §§1, 5–6] |
| Intrinsic DCF (04) | $243.23 | Low | 25% | It starts from reported CFO less capex, but the FY27–FY31 growth, margin and working-capital path is analyst-built and terminal value is 74.3% of EV. Its 9.04% WACC also has a material, unresolved alternative interpretation: the same cash flows price at a 7.15% implied WACC. [Visa Q3 FY2026 Form 10-Q, p. 10; `04_intrinsic-dcf`, §§1–8; `05_reverse-dcf`, §2A] |
| Reverse-DCF (05) | Price implies 19.67% five-year FCF CAGR at 9.04% WACC; 7.15% implied WACC on the DCF base path | Cross-check | n/a | It tests the hurdle embedded in the price; it is not a fair-value input. The growth read is demanding, but the lower implied discount-rate solve means it does not prove the market is wrong. [`05_reverse-dcf`, §§2–5] |
| Sum-of-the-parts (06) | $352.51 | Not independent | 0% | Zero-weighted. Visa has one Payment Services segment, and this collapsed check reuses the same company-wide NTM EBITDA and Mastercard comparator as the peer EV/EBITDA read. [Visa FY2025 Form 10-K, Note 14, p. 87; `06_sum-of-the-parts`, §§1–5] |

The value-producing method weights sum to 100%. The 75% combined multiples weight satisfies the operating-company multiples-first rule; the DCF is a 25% cross-check, below the one-third ceiling. The SOTP remains visible but is not counted as a second peer observation.

## 2. Triangulation & Reconciliation

### Method Football Field

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Intrinsic DCF (04) | $243.23 | Low | 25% | Reported cash-flow base, but analyst-built outer years, 74.3% terminal-value share and unresolved 9.04% versus 7.15% discount-rate interpretation. [`04_intrinsic-dcf`, §§2–8; `05_reverse-dcf`, §2A] |
| SOTP (06) | $352.51 | Not independent | 0% | Collapsed single-segment sanity check using the same Mastercard-based NTM EBITDA approach as part of the peer work. [`06_sum-of-the-parts`, §§2–5] |
| Own-history multiples (02) | $355.21 | Medium | 40% | Median EV/revenue reversion on reported LTM revenue; sector-multiple history is not assessable. [`02_multiples-own-history`, §§4–5] |
| Relative / peers (03) | $367.62 | Low–medium | 35% | Adjusted Mastercard NTM P/E; direct-peer sample is one and the sector-cycle reference is not assessable. [`03_relative-valuation-peers`, §§1, 5–6] |

**Headline finding — the independent-method field is $243.23 to $367.62 per share, a $124.39 or 51.14% high-to-low spread relative to the low.** This exceeds the 40% threshold, so downstream valuation confidence is capped at 55/100 despite the reconciliation below. The collapsed SOTP is shown for transparency but excluded from that independent-method calculation. The own-history and peer references both state that their Sector Cycle Reality Tests are not assessable; neither carries `RF-VAL-001` or `RF-VAL-002`, but neither multiple reference can be treated as a cycle-stable anchor. [`02_multiples-own-history`, §5; `03_relative-valuation-peers`, §6; Valuation MODULE_RULES, Reconciliation Gate 6 and Score-Cap Rules]

The mechanically weighted base point is **$331.56 per share**: `0.40 × $355.21 + 0.35 × $367.62 + 0.25 × $243.23`. Multiples get the larger weight because Visa is an operating company with usable forward estimates, while the own-history value rests on reported revenue and the peer read uses the closest available direct rival. The $243.23 DCF cannot be ignored: at 9.04% WACC, the reverse model says the observed price requires 19.67% FCF CAGR over five years, which is not proven; at the same time, the 7.15% implied-WACC solve means the DCF's lower value is not a conclusive estimate of intrinsic worth. The base level therefore maps the mechanical blend to an 18.338x NTM vendor EBITDA multiple—above the 17.47x own-history low, but below the current 19.5x NTM and adjusted-peer 19.48x readings—rather than assuming a return to a historical mean. [Capital IQ Comps → Financial Data and Trading Multiples, 17-Aug-2026; `02_multiples-own-history`, §§1–4; `03_relative-valuation-peers`, §5; `04_intrinsic-dcf`, §§6–8; `05_reverse-dcf`, §§2–3]

## 3. Bull / Base / Bear Fair-Value Levels

All three levels use the same EV-to-equity bridge: `(forward vendor EBITDA × EV/EBITDA multiple − $11,499m strict net debt − $514m preferred equity) ÷ 1,898m diluted shares`. “Vendor EBITDA” is Capital IQ's special-item-excluding measure, not Visa-reported EBITDA. The horizon is 12 months from 23 September 2026. [Capital IQ Comps → Financial Data, 17-Aug-2026; Visa Q3 FY2026 Form 10-Q, pp. 4, 14, 17–18 and Note 12; `01_price-and-capital-structure`, Anchor Summary]

| Case | Fair Value / Share (point) | Forward Metric (EPS/EBITDA) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **$425.88** | $36,720m NTM vendor EBITDA: 5% above $34,971m consensus | 22.34x NTM EV/EBITDA | 12 months | *Inference, not from filings:* payment activity and yield/mix remain better than the base while incentives and marketing do not take more of revenue, allowing EBITDA 5% above consensus; the multiple returns only to the 22.34x own-history mean, below the 28.47x observed maximum. Activity, pricing/mix and incentives overlap and are not summed from the one-quarter sensitivity bounds. [Capital IQ Comps → Financial Data, 17-Aug-2026; `02_multiples-own-history`, §2; `07_earnings-sensitivity`, §§2, 5] |
| Base | **$331.56** | $34,971m NTM vendor EBITDA consensus | 18.338x NTM EV/EBITDA | 12 months | Consensus EBITDA is achieved, but the warranted multiple stays near the lower end of the 17.47x–28.47x own-history band because the moat is stable rather than widening and regulatory dependence is the weakest quality factor (40/100). [Capital IQ Comps → Financial Data, 17-Aug-2026; `02_multiples-own-history`, §2; `07_business-quality`, §§1–4; `09_moat`, §5] |
| Bear | **$283.37** | $31,474m NTM vendor EBITDA: 10% below consensus | 17.47x NTM EV/EBITDA | 12 months | *Inference, not from filings:* payment activity, travel-linked cross-border commerce and yield/mix soften while client-incentive intensity stays elevated; the multiple moves to the observed own-history low. The 10% metric reduction is not a sum of the earnings sensitivity rows, which overlap; it is a coherent adverse operating case built from those named drivers. [Capital IQ Comps → Financial Data, 17-Aug-2026; `02_multiples-own-history`, §2; `07_earnings-sensitivity`, §§2, 5–6; `10_external-dependency`, §§1, 3–5] |

No structural-reset case is required. The moat verdict is **Strong moat** with a stable, not confirmed widening, trajectory, and the business-quality rate-of-change row is 55/100, above the ≤40 structural-runoff trigger. [`09_moat`, §5; `07_business-quality`, §1]

Executed calculation (Python 3.12; USD millions except per-share output):

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -c 'shares=1898.;nd=11499.;pref=514.;own=355.21;peer=367.62;dcf=243.23;base=.40*own+.35*peer+.25*dcf;base_mult=(base*shares+nd+pref)/34971.48;cases={"bear":(34971.48*.90,17.47),"base":(34971.48,base_mult),"bull":(34971.48*1.05,22.34)};print(f"weighted_base={base:.2f}; base_EV_EBITDA={base_mult:.4f}x");[print(f"{n}: metric={m:.3f}; multiple={x:.4f}x; EV={m*x:.3f}; equity={m*x-nd-pref:.3f}; per_share={(m*x-nd-pref)/shares:.2f}") for n,(m,x) in cases.items()]'
```

```text
weighted_base=331.56; base_EV_EBITDA=18.3381x
bear: metric=31474.332; multiple=17.4700x; EV=549856.580; equity=537843.580; per_share=283.37
base: metric=34971.480; multiple=18.3381x; EV=641311.033; equity=629298.033; per_share=331.56
bull: metric=36720.054; multiple=22.3400x; EV=820326.006; equity=808313.006; per_share=425.88
```

## 4. Margin of Safety & Downside (two separate metrics)

The pool-verified anchor is stale by 26 U.S. trading days, so price-relative calculations are shown both at the freshest available quote and at the canonical pool price. The $361.52 quote is an indicative, unverified web cross-check; it leads the presentation for freshness but does not replace the $364.15 pool anchor or relax the confidence cap. [Capital IQ Comps → Financial Data, 17-Aug-2026; `ciq_facts.json` `current_price`; Web: Visa Investor Relations and StockAnalysis, NYSE close, 23-Sep-2026, indicative and unverified; `01_price-and-capital-structure`, §§1, 7]

| Metric | Value |
|---|---:|
| Current price — fresh context | $361.52, 23-Sep-2026, indicative web quote; unverified |
| Current price — canonical pool anchor | $364.15, 17-Aug-2026 close; pool-verified but 26 trading days stale |
| Base-case fair value (point) | $331.56 |
| Bear-case fair value | $283.37 |
| Implied upside to base case = `(base FV − price) / price` | **(8.29%)** at $361.52 fresh context; **(8.95%)** at $364.15 stale pool anchor |
| **Margin of safety** = `(base FV − price) / base FV` — the cushion | **(9.04%)** at $361.52 fresh context; **(9.83%)** at $364.15 stale pool anchor |
| **Downside to bear** = `(price − bear FV) / price` — *inverted: higher = worse* | **21.62%** at $361.52 fresh context; **22.18%** at $364.15 stale pool anchor |

The fresh-context metric is a recalculation, not a second price source for scoring. The 51.14% cross-method field is more restrictive than the stale-price rule: downstream valuation confidence remains capped at 55/100. [Valuation MODULE_RULES, Score-Cap Rules]

## 5. Warranted-Multiple Check

The base 18.338x NTM EV/EBITDA multiple is inside Visa's 17.47x–28.47x own-history range and below both the current 19.5x NTM multiple and the 19.48x adjusted Mastercard read. It is defensible only if Visa's strong but stable network advantage continues to earn returns above its cost of capital without regulation, incentives or alternative rails reducing its economics; the evidence does not support paying a mean or peak multiple by default. [`02_multiples-own-history`, §§1–5; `03_relative-valuation-peers`, §§4–5; `09_moat`, §§3–5; `07_business-quality`, §§1–4]

No structurally misaligned controlling-owner flag applies, so this is not an owner-induced value-trap case. The material valuation risk is instead that the market price retains a 19.5x NTM EBITDA multiple while the DCF's 9.04% WACC read requires FCF growth that has not been established from available evidence. [`02_multiples-own-history`, §6; `04_intrinsic-dcf`, §8; `05_reverse-dcf`, §§2–5]

## 6. Fair-Value Read

The 12-month levels are **$283.37 bear, $331.56 base and $425.88 bull per V share**. At the freshest available $361.52 indicative quote, the base level gives a negative 9.04% margin of safety and 21.62% downside to the bear; at the stale, pool-verified $364.15 anchor those figures are negative 9.83% and 22.18%, respectively. The base point is 75% multiples-based and 25% DCF-based, but its confidence is capped because the full independent-method spread is 51.14%. The largest swing factor is whether payment activity and client incentives support the Street EBITDA path at a lower discount rate, or instead validate the DCF's lower cash-flow value and a multiple nearer the historical floor. [`02_multiples-own-history`, §4; `03_relative-valuation-peers`, §5; `04_intrinsic-dcf`, §§6–8; `05_reverse-dcf`, §§2–5; `07_earnings-sensitivity`, §§2–6]
