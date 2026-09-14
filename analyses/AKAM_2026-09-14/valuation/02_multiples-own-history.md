# Multiples — Own History — AKAM

All figures are USD millions except per-share data, percentages, and multiples. Akamai is a US GAAP operating company. This report uses the AKAM common stock listed on the Nasdaq Global Select Market as the decision line. The price is $106.79 at 14 September 2026; the canonical enterprise value (EV, market value plus debt less cash) is $21,428.3m, and the diluted per-share working count is 153.686m. [valuation/01_price-and-capital-structure, §§1, 4, 7]

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E — reported | LTM GAAP diluted EPS | $2.75/share | 38.8x = $106.79 / $2.75 | [Capital IQ Financials → Multiples, `P/LTM EPS` Close latest, 2026-09-11; source-bound `ciq_facts.json`, `pe_ltm_current_x` = 38.8, present; earnings/01_historical-financials, §2] |
| P / E — normalized | FY2026 vendor normalized EPS | $6.69863/share | 15.9x = $106.79 / $6.69863 | [Capital IQ Estimates Report, Guidance worksheet, FY2026 current normalized EPS, 2026-09-07; earnings/04_guidance-consensus, §3] |
| EV / EBITDA — reported | LTM GAAP-derived EBITDA | $1,184.1m | 18.1x = $21,428.3m / $1,184.1m | [valuation/01_price-and-capital-structure, §7; earnings/01_historical-financials, §2] |
| EV / EBITDA — vendor estimate | NTM vendor EBITDA; definition not reconciled to company adjusted EBITDA | $1,868.8m | 11.5x = $21,428.3m / $1,868.8m | [Capital IQ Estimates Report, Multiples worksheet, NTM TEV/EBITDA, data as of 2026-09-14; valuation/06_sum-of-the-parts, §2] |
| EV / EBIT — reported | LTM GAAP operating income | $455.7m | 47.0x = $21,428.3m / $455.7m | [valuation/01_price-and-capital-structure, §7; earnings/01_historical-financials, §2] |
| EV / Sales — reported | LTM revenue | $4,322.8m | 5.0x = $21,428.3m / $4,322.8m | [valuation/01_price-and-capital-structure, §7; earnings/01_historical-financials, §2] |
| EV / Sales — consensus | FY2026 revenue | $4,491.263m | 4.8x = $21,428.3m / $4,491.263m | [Capital IQ Estimates Report, Guidance worksheet, FY2026 current revenue, 2026-09-07; earnings/04_guidance-consensus, §3] |
| P / Book | 2026-06-30 reported equity | $4,748.5m | 3.23x = $15,345.7m / $4,748.5m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; valuation/01_price-and-capital-structure, §§3, 6] |
| P / FCF and FCF yield | LTM operating FCF (cash from operations less all capex) | $629.9m | 24.4x; 4.1% yield = $629.9m / $15,345.7m | [earnings/01_historical-financials, §2; valuation/01_price-and-capital-structure, §7] |
| Dividend yield | No cash dividend | $0.00/share | 0.0% | [FY2025 Form 10-K, Item 5; balance-sheet-survival/99_balance-sheet-survival-synthesis, p.91] |

The Capital IQ historical series reports a direct 13.4x `TEV/LTM EBITDA` close at 11 September, which is the authoritative read of that workbook. It is not interchangeable with the 18.1x above: the latter uses the filing-based $21,428.3m canonical EV and $1,184.1m GAAP-derived EBITDA, while the vendor series uses its own TEV and EBITDA definitions. The sidecar separately reports $1,079.9m LTM vendor EBITDA, so the provider does not supply a bridge sufficient to map its multiple series to the filing-based GAAP metric. This is a definition limitation, not a basis for replacing the canonical EV or EBITDA. [Capital IQ Financials → Multiples, `TEV/LTM EBITDA` Close latest, 2026-09-11; source-bound `ciq_facts.json`, `ev_ebitda_current_x` = 13.4 and `ltm_ebitda_m` = 1,079.9, present; valuation/01_price-and-capital-structure, §§4–5]

## 2. Historical Multiple Bands (3–5 years)

Only six quarterly close observations are available: 31 March 2025 through 30 June 2026, with a current endpoint at 11 September 2026. This is about 1.5 years, not a 3–5-year history. The table is a short-range directional read, not a stable reversion anchor. Each row uses the Capital IQ `Multiples` sheet's internally consistent vendor close series; it must not be mixed with the filing-based EV/GAAP multiples in §1.

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| P / LTM EPS | 24.6x | 30.2x | 26.9x | 40.0x | 38.8x | 83.3% |
| P / NTM normalized EPS | 11.3x | 13.9x | 12.9x | 17.5x | 15.6x | 66.7% |
| TEV / LTM EBITDA | 9.5x | 11.0x | 10.1x | 13.6x | 13.4x | 83.3% |
| TEV / NTM EBITDA | 8.1x | 9.5x | 8.7x | 11.8x | 10.7x | 66.7% |
| TEV / LTM EBIT | 23.2x | 27.5x | 24.5x | 36.3x | 39.0x | 100.0% |
| TEV / LTM revenue | 3.6x | 4.1x | 3.8x | 5.0x | 4.6x | 66.7% |
| P / Book value | 2.4x | 2.8x | 2.6x | 3.5x | 3.2x | 66.7% |
| Market cap / LTM levered FCF | 17.7x | 22.3x | 20.9x | 29.2x | 21.6x | 66.7% |

Calculations use the six historical close values, excluding the 11 September 2026 endpoint: percentile = historical closes at or below the current close / 6. For example, the LTM EBITDA series is 13.4x current versus a 9.5x–13.6x historical range; the source-bound sidecar independently confirms the 13.4x current figure, the 83.3% percentile, and the low-confidence six-close status. [Capital IQ Financials → Multiples, Close rows, 2025-03-31 to 2026-09-11; source-bound `ciq_facts.json`, `ev_ebitda_current_x` = 13.4, `ev_ebitda_percentile` = 0.833, and `range_position`, present]

## 3. Re-Rating / De-Rating Read

On the more comparable equity measures, P/LTM EPS is 38.8x, 28.4% above its six-quarter mean of 30.2x and 44.4% above its 26.9x median: `(38.7810 − 30.2111) / 30.2111` and `(38.7810 − 26.8516) / 26.8516`. P/NTM normalized EPS is 15.6x, 11.9% above its 13.9x mean and 20.5% above its 12.9x median; P/B is 3.23x, 14.4% and 24.4% above its 2.82x mean and 2.60x median. [Capital IQ Financials → Multiples, `P/LTM EPS`, `P/NTM EPS`, and `P/BV` Close rows, 2025-03-31 to 2026-09-11]

The vendor TEV/LTM EBITDA series is also 21.3% above its 11.0x mean and 32.4% above its 10.1x median, but it is a lower-confidence confirmation because its EV and EBITDA definitions do not reconcile to the canonical filing-based calculation in §1. The change cannot be causally proven from the available data. Inference, not from filings: the market is giving some credit to the security/cloud mix — management guides CIS growth of at least 50% and high-single-digit Security growth in FY2026 — while the counter-evidence is lower LTM margins and much higher strict net debt. [Capital IQ Financials → Multiples, `TEV/LTM EBITDA` Close row, 2025-03-31 to 2026-09-11; Q2 2026 earnings call, CFO prepared remarks; earnings/01_historical-financials, §§2, 6; valuation/01_price-and-capital-structure, §5]

## 4. Implied Value from Reversion

No own-history implied EV, equity value, or per-share target is published. A six-observation, 1.5-year history is below the roughly three-year minimum for a mean/median reversion target, and the vendor EV/EBITDA, EV/EBIT, and levered-FCF series do not have a complete bridge to the filing-based strict-EV and GAAP measures. Any price derived from those medians would be illustrative-only and is not a fair-value input for `07_scenario-and-fair-value`.

The required base-case own-history implied value is therefore **Not assessable**. The evidence supports a directional conclusion — current P/E, P/B, and vendor EV multiples are in the upper half of this short sample — but not a point or tight reversion range. A reversion calculation would additionally assume the warranted multiple is unchanged. That assumption is not supported: Q2 gross margin was 55.8%, down 331 basis points year on year, and strict net debt was $6.08bn, up from $3.18bn at FY2025. [Q2 FY2026 Form 10-Q, Statements of Income, p.5; Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; earnings/01_historical-financials, §§1–2]

## 5. Sector Cycle Reality Test

No material same-direction sector move is indicated over the available short window: IGV, an ETF tracking North American software and related digital-media companies, rose from $88.97 in March 2025 to $101.52 in September 2026, or 14.1%, below the roughly 25% materiality guide. This is a sector price proxy rather than sector multiple history, so it cannot prove a stable valuation anchor; it does not trigger a cycle-elevated or cycle-depressed flag. [Web: Digrin, IGV monthly price history, accessed 2026-09-14 (unverified); iShares, IGV fund description and 2026-09-11 closing price]

## 6. Own-History Read

AKAM trades at a premium to its short own-history sample: P/LTM EPS is 28.4% above the sample mean, P/B is 14.4% above, and the vendor TEV/LTM EBITDA series is 21.3% above. This is a directional upper-range read, not evidence for a mean-reversion fair value or a valuation floor.

The biggest caveat is dual: the history is only six quarters, and the vendor EV-based series cannot be made like-for-like with the filing-based strict-EV/GAAP metrics. Falling margins, a strict-net-debt increase from $3.18bn at FY2025 to $6.08bn at Q2 FY2026, and no proven overall economic moat also weaken any presumption that an old median is warranted. [earnings/01_historical-financials, §§1, 6; business-model/99_business-model-synthesis, Verdict and pp.48–50]
