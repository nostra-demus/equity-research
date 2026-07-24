# Multiples — Own History — TSLA

**Reporting currency: USD.** All anchor numbers (price, shares, market cap, EV, net debt) are taken verbatim from `01_price-and-capital-structure.md`: current price **$319.69** (2026-07-23, last close, `pool-verified`); market-cap share count **3,949,547,394**; approximate fully diluted (per-share fair-value) share count **≈4,252.5mm** (inference, no options/RSU strike schedule in pool); market cap **$1,262,630.8mm**; enterprise value **$1,235,847.8mm** (broad cash basis, canonical — netting cash & short-term investments); net debt **$861mm (strict)** / **−$27,444mm net cash (broad)**, both at Jun-30-2026 [`valuation/01_price-and-capital-structure.md`, §7].

Business type: Operating company (EV manufacturer + energy + services). Per the Business-Type Method Map, EV-based multiples (EV/Sales, EV/EBITDA, EV/EBIT), P/E, and FCF yield/P-FCF are the primary reads; P/Book is shown as a supplementary cross-check, not primary, for this asset-light-trending operating business.

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| EV / Sales | LTM | Revenue $103,619mm | **11.9x** | EV $1,235,847.8mm ÷ $103,619mm; ties to Financials_Annual.xls, Multiples tab, "TEV/LTM Total Revenue," Close, 2026-07-23 = 11.927x, and to Company Comparable Analysis Tesla Inc .xls, Trading Multiples tab, "TEV/Total Revenues LTM" = 11.9, As-Of 2026-07-24 |
| EV / Sales | NTM | NTM Revenue $110,859.9mm | **11.2x** | Tesla,IncNasdaqGSTSLAEstimatesReport.xls, Multiples tab, "NTM TEV/REV" = 11.148 |
| EV / EBITDA (GAAP, reported: Op. Income + D&A) | LTM | EBITDA $10,755mm | **114.9x** | EV $1,235,847.8mm ÷ $10,755mm = 114.9x; ties exactly to Financials_Annual.xls, Multiples tab, "TEV/LTM EBITDA," Close, 2026-07-23 = 114.909x. **Reconciliation flag:** Company Comparable Analysis Tesla Inc .xls, Trading Multiples tab shows a conflicting "TEV/EBITDA LTM" of 97.7 for the same company/date — the other three LTM multiples on that identical row (EV/Revenue 11.9, EV/EBIT 288.9, P/TangBV 14.5) all reconcile exactly to the anchor, so this is treated as a vendor inconsistency isolated to that one cell, not used here. Flagged, not silently overridden (CLAUDE.md §5) |
| EV / EBITDA | NTM | NTM EBITDA $17,331.0mm | **71.3x** | EstimatesReport.xls, Multiples tab, "NTM TEV/EBITDA" = 71.308; ties to Company Comparable Trading Multiples "NTM TEV/Forward EBITDA" = 71.31 |
| EV / EBIT | LTM | EBIT $4,278mm | **288.9x** | EV $1,235,847.8mm ÷ $4,278mm = 288.9x; ties to Financials_Annual.xls, Multiples tab, "TEV/LTM EBIT," Close, 2026-07-23 = 288.884x, and Company Comparable Trading Multiples "TEV/EBIT LTM" = 288.9 |
| EV / EBIT | NTM | — | **214.0x** | EstimatesReport.xls, Multiples tab, "NTM TEV/EBIT" = 213.957 |
| P / E (GAAP diluted) | LTM | EPS $1.08 | **296.1x** | $319.69 ÷ $1.08 = 296.0x; ties to Financials_Annual.xls, Multiples tab, "P/LTM EPS," Close, 2026-07-23 = 296.111x, and Company Comparable Trading Multiples "P/Diluted EPS Before Extra LTM" = 296.1 |
| P / E | NTM | NTM EPS $1.91 | **167.6x** | EstimatesReport.xls, Multiples tab, "NTM Forward P/E" = 167.596; Company Comparable Trading Multiples "NTM Forward P/E" = 167.6 |
| P / E | FY2026 (consensus) | FY2026E EPS (implied) | **174.9x** | EstimatesReport.xls, Multiples tab, "FY 2026 Price/Earnings" = 174.907 |
| P / Book (tangible ≈ book — negligible intangibles) | LTM | BVPS $21.99 | **14.5x** | $319.69 ÷ $21.99 = 14.5x; ties to Company Comparable Analysis, Trading Multiples tab, "P/TangBV LTM" = 14.5. **Reconciliation flag:** the Financials_Annual.xls Multiples tab's own quarterly "P/BV" time series shows a Close value of 11.914x for the identical 2026-07-23 date — inconsistent with both the anchor calc and the Company Comparable cross-check. Given `01`'s own finding that CIQ's Historical Capitalization tab carries a stale Jun-30-2026 share count for this company, this looks like the same vendor data-lag issue bleeding into the Multiples tab's final (partial) quarter column. Flagged; 14.5x is used as the reconciled figure |
| P / FCF (FCF = CFO − capex, per company's own definition) | LTM | FCF $5,762mm ($18,685mm CFO − $12,923mm capex) | **219.1x** | Market cap $1,262,630.8mm ÷ $5,762mm; FCF figure from `earnings/01_historical-financials.md` §1 (LTM/TTM table) |
| FCF yield | LTM | — | **0.46%** | $5,762mm ÷ $1,262,630.8mm |
| Dividend yield | — | — | **N/A — no dividend paid** | Tesla has never declared or paid a common dividend; no dividend line item found in Financials_Annual.xls or the Form 10-Q [Form 10-Q, Jul-23-2026; Financials_Annual.xls, Income Statement / Supplemental tabs] |

## 2. Historical Multiple Bands (3–5 years)

Basis: quarterly close-of-quarter multiples, 2021-Q2 through 2026-Q2 (22 quarterly observations) plus the current 2026-07-23 spot value, from Tesla Inc NasdaqGS TSLA Financials_Annual.xls, Multiples tab (quarterly frequency, "Close" row) [data through 2026-07-23]. P/FCF band uses annual fiscal-year-end market cap ÷ annual FCF, FY2021–FY2025 (5 observations), from Financials_Annual.xls Historical Capitalization tab (year-end market cap) and `earnings/01_historical-financials.md` (annual FCF), because no clean quarterly FCF series is available in this pool.

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| EV / Sales (LTM) | 5.01x | 12.15x | 11.50x | 22.61x | 11.93x | 39% |
| EV / EBITDA (LTM) | 22.36x | 78.76x | 65.66x | 138.70x | 114.91x | 80% |
| EV / EBIT (LTM) | 30.23x | 134.68x | 105.94x | 288.88x | 288.88x | 100% |
| P / E (LTM, GAAP diluted) | 37.97x | 117.24x | 85.58x | 296.11x | 296.11x | 100% |
| P / Book (LTM) | 8.94x | 18.98x | 17.26x | 39.22x | 14.5x | 18% |
| P / FCF (annual, FY21–FY25) | 72.49x | 213.51x | 196.01x | 359.54x | 219.13x | 51% |

Note on the EV/EBIT and P/E bands: the EV/EBIT quarterly series has several "NM" (not-meaningful) quarters in 2025Q4–2026Q1 that CIQ excludes from its own average/high/low/close calculation (likely a denominator-timing quirk); the band above uses the 19 valid quarters. The P/E series is NM for all quarters before 2022-Q1 (small/negative-EPS base in Tesla's early scaling years) and is built from the 16 valid quarters since. Both are labeled: fewer usable data points than the EV/Sales, EV/EBITDA, and P/Book bands (22 quarters each).

**Current sits at or above the historical maximum on EV/EBIT and P/E** — this is a genuine ceiling print, not a rounding artifact: on EV/EBIT the current 288.88x quarter is itself the new high of the 5-year window (barely above the prior 2021-Q2 high of 288.06x); on P/E the current 296.11x is likewise the new high (above the prior 2025-Q3 high of 265.12x).

## 3. Re-Rating / De-Rating Read

**EV/Sales — roughly mid-range, not re-rated.** Current 11.9x sits 1.8% below its own 5-year mean (12.15x) and 3.7% above its own median (11.50x) — essentially in line with its own history, the least distorted read available (Section 2 percentile: 39th). **P/Book — trading at a discount to its own history.** Current 14.5x is 23.6% below its own mean (18.98x) and 16.0% below its own median (17.26x); book value has compounded every year (retained earnings) while the multiple applied to it has come down. **EV/EBITDA, EV/EBIT, and P/E all sit at or above their own 5-year ceiling** — EV/EBITDA is 45.9% above its own mean (78.76x) and 75.0% above its own median (65.66x); EV/EBIT is 114.5% above its own mean and 172.6% above its own median; P/E is 152.6% above its own mean and 246.0% above its own median. The most likely reason is NOT that the price has made a new high in isolation — Tesla's price today ($319.69) sits below its own 2025-Q3/Q4 levels (the Historical Capitalization tab shows quarter-end closes of $448.98 and $416.56 in 2025-Q3/Q4) — but that the earnings base collapsed under it: GAAP EBIT margin fell from a 16.8% FY2022 peak to 4.1% LTM, and GAAP diluted EPS fell from a $4.30 FY2023 peak to $1.08 LTM, a 70%+ decline over three years, per `earnings/01_historical-financials.md` §1. A shrunk denominator against a still-large price is arithmetically a "re-rating" on the earnings-based multiples even without the market paying up for the same dollar of earnings — this is a denominator-compression story more than a pure valuation-expansion story, and it means these three multiples are the LEAST reliable own-history anchors for this company right now.

## 4. Implied Value from Reversion

Bridge convention (mirrors `01`'s canonical broad-basis EV bridge): implied market cap = implied EV − total debt ($16,080mm) − minority interest ($661mm) + cash & ST investments ($43,524mm) = implied EV + $26,783mm. Per-share values use the ≈4,252.5mm approximate fully diluted share count (`01`'s per-share fair-value count), except P/E and P/FCF-per-share reversions, which apply the multiple directly to the per-share metric.

| Multiple | Reversion Target (mean / median) | Implied EV or Equity Value | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| EV / Sales | Mean 12.15x | EV $1,258,971mm / Equity $1,285,754mm | $302.4 | −5.4% |
| EV / Sales | Median 11.50x | EV $1,191,619mm / Equity $1,218,402mm | $286.5 | **−10.4%** |
| EV / EBITDA | Mean 78.76x | EV $847,064mm / Equity $873,847mm | $205.5 | −35.7% |
| EV / EBITDA | Median 65.66x | EV $706,173mm / Equity $732,956mm | $172.4 | −46.1% |
| EV / EBIT | Mean 134.68x | EV $576,161mm / Equity $602,944mm | $141.8 | −55.6% |
| EV / EBIT | Median 105.94x | EV $453,211mm / Equity $479,994mm | $112.9 | −64.7% |
| P / E | Mean 117.24x | — (direct per-share) | $126.6 | −60.4% |
| P / E | Median 85.58x | — (direct per-share) | $92.4 | −71.1% |
| P / Book | Mean 18.98x | — (direct per-share) | $417.4 | +30.6% |
| P / Book | Median 17.26x | — (direct per-share) | $379.5 | +18.7% |
| P / FCF | Mean 213.51x | — (direct per-share, FCF/share $1.355) | $289.3 | −9.5% |
| P / FCF | Median 196.01x | — (direct per-share) | $265.6 | −16.9% |

**Base-case point (named): EV/Sales, own-median (11.50x) → implied price ≈ $286.5/share, −10.4% vs the current $319.69.** EV/Sales is named as the most reliable multiple here because it is the least distorted by the LTM margin/earnings collapse documented in Section 3 — it does not require assuming that Tesla's compressed EBIT margin (4.1% LTM vs. 16.8% FY2022 peak) or its GAAP EPS (down 70%+ from its FY2023 peak) reverts to old levels, only that revenue at its own historical sales multiple prices the business.

**Dispersion across the twelve reversion outputs above is enormous: $92.4/share (P/E, median) to $417.4/share (P/Book, mean)** — a >4.5x spread, i.e. this is the finding, not noise to be averaged away (CLAUDE.md §16, module Core Principle 2). The earnings-based multiples (EV/EBITDA, EV/EBIT, P/E) all imply large downside from reversion because they assume Tesla's margin/EPS base normalizes back up toward its own mean/median WITHOUT the multiple itself also normalizing — an internally inconsistent assumption once the denominator issue in Section 3 is taken into account (reverting a distorted multiple to its own mean, on a distorted metric, does not net out cleanly). P/Book implies material upside because the multiple has structurally compressed even as book value grew — a discount that could be resolved either by the multiple re-expanding (upside) or by the market simply not crediting near-term book-value growth (i.e., staying cheap on this basis).

**Reversion assumption check: NOT clearly supported for the earnings-based multiples.** Reverting EV/EBITDA, EV/EBIT, or P/E to their own means/medians implicitly assumes either (a) the multiple itself should shrink toward history while margins stay depressed (the reversion-to-mean-multiple case, which argues for a LOWER price, shown above), or (b) margins recover and the multiple stays high (not modeled here — that is `04_intrinsic-dcf`'s and `earnings/03_margin-drivers`' job, not this agent's). The management-governance module's own read (`99_management-governance-synthesis.md`) found the current management has not delivered per-share value from a doubling of invested capital (EBIT fell 33% and diluted EPS fell 70% since FY2021–FY2025) and has not repurchased shares despite positive FCF every year — this is a caution against assuming a clean, management-driven margin recovery is the mechanism that resolves the earnings-based multiples' current richness. RF-OWN-004 (structurally unaligned controlling owner, §24 Filter 6) was tested and **not triggered** for Tesla [`management-governance/99_management-governance-synthesis.md`], so no structural value-trap discount applies here — but the governance module's "Serious governance concerns" verdict (Governance Score 43/100, capital allocation concerns) is a real caveat on whether reversion to the OLD (2021–2022, high-margin) mean is a management-delivered outcome versus a market-priced hope.

## 5. Own-History Read

Tesla trades at or above the ceiling of its own 5-year range on EV/EBIT (288.9x, 100th percentile) and P/E (296.1x, 100th percentile), roughly mid-range on EV/Sales (39th percentile, −1.8% to its own mean), and at a discount on P/Book (18th percentile, −23.6% to its own mean) — the own-history read is not uniform, and averaging it into one verdict would hide the real story. The most defensible single reversion read — EV/Sales to its own median — implies about $286.5/share, a 10.4% de-rate from today's $319.69; the wider cross-multiple dispersion ($92 to $417/share) shows how sensitive this stock's own-history multiples are to which earnings line is used, because the earnings line itself has collapsed (GAAP EBIT margin 16.8%→4.1%, GAAP diluted EPS $4.30→$1.08 since 2022/2023 peaks) while the price has not fallen nearly as far. The single biggest caveat: the earnings-based multiples "look rich versus own history" mostly because the denominator shrank, not because the market is paying more for a stable dollar of earnings — reverting those specific multiples to their old mean assumes either the multiple compresses further (bearish) or margins recover to old levels first (a call this module does not make; see `earnings/03_margin-drivers` and `04_intrinsic-dcf`), and the management-governance module's own finding of no delivered per-share value creation and zero buybacks despite positive FCF is a reason for caution before assuming that recovery is management-driven.
