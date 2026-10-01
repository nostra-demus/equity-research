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
