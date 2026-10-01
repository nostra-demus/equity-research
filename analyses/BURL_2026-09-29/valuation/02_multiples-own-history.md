# Multiples — Own History — BURL

Burlington Stores, Inc. is a U.S. GAAP operating retailer and reports in USD. Fiscal periods are 52/53-week years ending near January 31. The $254.69 NYSE close (September 28, 2026), $17.210bn enterprise value (EV, the value of equity plus financial debt less cash), $1.216bn strict net debt and 63.896m diluted-share proxy below are inherited verbatim from `01_price-and-capital-structure`. The canonical EV excludes the separately disclosed $3.993bn operating-lease liability; this matters when comparing it with Capital IQ's vendor EV series. [valuation/01 Price & Capital Structure, Anchor Summary; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, pp.5, 10–13]

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E | LTM diluted GAAP EPS | $11.13 / share | 22.88x | `$254.69 ÷ $11.13`; [valuation/01 Price & Capital Structure, Anchor Summary; data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data, subject row, 2026-09-28] |
| EV / EBITDA | LTM; Capital IQ standard EBITDA, not a GAAP subtotal | $1,360.7m | 12.65x | `$17,210.3m ÷ $1,360.7m`; [valuation/01 Price & Capital Structure, Anchor Summary; data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Income Statement, LTM to 2026-08-01; ciq_facts.json, LTM EBITDA] |
| EV / EBIT | LTM; Capital IQ operating-income calculation | $951.6m | 18.09x | `$17,210.3m ÷ $951.6m`; [valuation/01 Price & Capital Structure, Anchor Summary; data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data, subject row, 2026-09-28] |
| EV / Sales | LTM reported net sales | $12,198.6m | 1.41x | `$17,210.3m ÷ $12,198.6m`; [valuation/01 Price & Capital Structure, Anchor Summary; data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Income Statement, LTM to 2026-08-01] |
| P / Book | Latest book value per diluted-share proxy | $31.34 / share | 8.13x | `$254.69 ÷ $31.34`; [valuation/01 Price & Capital Structure, §6] |
| P / FCF / FCF yield | LTM normalised operating FCF | $357.0m | 44.80x / 2.23% | `$15,994.5m ÷ $357.0m`; normalised FCF = reported $412.5m less the $55.5m tariff-refund benefit. [earnings/06 Earnings Quality, §1; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, p.20] |
| Dividend yield | Trailing and forward | $0 declared | 0.0% | Burlington has not declared, and does not expect to declare in the near term, a common-stock dividend. [data/BURL/Burlington_Stores_Inc_-_Form_10-K(Mar-19-2026).doc, Item 5—Dividends] |

The LTM FCF yield uses the conservative, normalised cash figure. Reported LTM FCF would instead give a 2.58% yield (`$412.5m ÷ $15,994.5m`), but the $55.5m refund is not a recurring operating input. [earnings/06 Earnings Quality, §§1 and 10; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, p.20]

**Capital IQ reconciliation.** The source-bound sidecar reports its latest historical `TEV/LTM EBITDA` close as **8.5x** at September 18, 2026 and its `P/LTM EPS` close as **21.3x**; those are the authoritative vendor reads and are not overwritten here. But the canonical strict-debt EV produces 12.65x on the same vendor LTM EBITDA. Separately, the CIQ comparable-company sheet gives a lease-inclusive TEV of $21.201bn and LTM EBITDA of $1.361bn, whose visible arithmetic is 15.58x, while its Trading Multiples sheet prints 9.0x. The 8.5x/9.0x figures therefore cannot be reconciled to either disclosed EV bridge from the frozen workbook. This is an unresolved vendor-definition or extraction-basis gap, not a reason to substitute a preferred number silently. [ciq_facts.json, `ev_ebitda_current_x`; data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet, latest Close; data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data and Trading Multiples, subject row, 2026-09-28]

## 2. Historical Multiple Bands (3–5 years)

The bands use the 16 quarterly `Close` observations from September 30, 2022 through June 30, 2026. The September 18, 2026 CIQ observation is shown separately as the vendor-current comparison and is excluded from the historical statistics. Percentile of range is `(current − historical minimum) ÷ (historical maximum − historical minimum)`, capped at 0%/100% if outside the range.

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| P / E | 28.51x | 40.95x | 39.40x | 81.01x | 22.88x anchor / 21.31x CIQ | Below range / 0% |
| EV / EBITDA | 8.27x | 10.83x | 11.12x | 13.23x | 12.65x canonical / 8.54x CIQ | 88% / 6% — not comparable |
| EV / EBIT | 25.18x | 31.56x | 30.80x | 47.16x | 18.09x canonical / 21.12x CIQ | Below range / 0% |
| EV / Sales | 1.27x | 1.72x | 1.76x | 1.98x | 1.41x canonical / 1.50x CIQ | 20% / 33% |

[data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet, `Close` rows for the 16 historical quarter-end columns and September 18, 2026 latest column; ciq_facts.json, `range_position`, `ev_ebitda_percentile`, `pe_ltm_current_x`]

The anchor-current figures use the strict-debt EV and September 28 price required by `01`; the CIQ-current figures use the vendor series' September 18 close. The 10-day price-date difference explains part of the P/E and EV/Sales gap, but it does not explain the EV/EBITDA identity failure described in §1. Historical `Multiples` is also labelled “Dilution: Basic,” whereas the anchor P/E uses diluted LTM EPS; this is a stated basis limitation on the P/E reversion read. [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet, header; valuation/01 Price & Capital Structure, §§1, 4 and 7]

## 3. Re-Rating / De-Rating Read

On the least-disputed equity-side measure, the anchor P/E of 22.88x is **44.1% below** its own 40.95x mean and **41.9% below** its 39.40x median: `(22.88 ÷ 40.95) − 1` and `(22.88 ÷ 39.40) − 1`. It is below the lowest one of the 16 historical closes, 28.51x. EV/Sales is also lower: 1.41x is **18.1% below** its 1.72x mean and **19.9% below** its 1.76x median. [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet, `Close` rows; valuation/01 Price & Capital Structure, Anchor Summary; earnings/01 Historical Financials, §2]

This is a de-rating versus BURL's own recorded P/E and EV/Sales history, not proof that the market is wrong. *Inference, not from filings:* the lower multiple is consistent with a mixed-quality, discretionary retail model: business quality is scored 42/100, current reported Q2 gross margin included a $55.5m tariff refund that management plans to reinvest, and the store/supply-chain build consumes substantial capital. The evidence does not establish that the old P/E premium remains warranted. [business-model/07 Business Quality, §§1–4; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, p.20; data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Outlook]

EV/EBIT also sits below its recorded range, but it is not independent confirmation. EV/EBITDA cannot be used in this read because its 8.54x vendor series close conflicts materially with both the canonical 12.65x calculation and the CIQ comparable-sheet arithmetic in §1. [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet, `Close` rows; data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data and Trading Multiples, 2026-09-28]

## 4. Implied Value from Reversion

The required own-history base point is a **mechanical sensitivity, not an admissible fair-value input**: **$438.53 per share**, the 39.40x historical-median P/E applied to current $11.13 diluted LTM EPS. It is named because P/E has no EV bridge, but it still carries the basic-versus-diluted-history limitation. `07_scenario-and-fair-value` should not weight it as a clean base case unless it first resolves the vendor-basis conflicts and concludes that the historic P/E is warranted by current business quality. [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet, `Close` P/E rows; valuation/01 Price & Capital Structure, Anchor Summary; earnings/01 Historical Financials, §2]

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| P / E | 40.95x / 39.40x | Equity $29.120bn / $28.020bn | $455.74 / **$438.53** | +78.9% / +72.2% |
| EV / Sales | 1.72x / 1.76x | EV $21.017bn / $21.473bn; equity $19.801bn / $20.257bn | $309.89 / $317.03 | +21.7% / +24.5% |

P/E arithmetic is `multiple × $11.13 EPS`; implied equity is then price × 63.896m diluted shares. EV/Sales arithmetic is `multiple × $12,198.6m LTM sales`; implied equity is EV less $1.216bn **strict** net debt, divided by 63.896m diluted shares. The median points across the two mechanically usable multiples span **$317.03–$438.53**, a $121.50 or 38.3%-of-low dispersion, rather than a corroborated range. [valuation/01 Price & Capital Structure, Anchor Summary; earnings/01 Historical Financials, §2; data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet]

EV/EBITDA and EV/EBIT are deliberately excluded from the reversion table. Applying their vendor historical bands to strict-debt EV would silently mix the strict anchor with a vendor TEV basis; for EV/EBITDA, the reported current vendor multiple additionally fails the basic numerator/denominator identity. The reversion also assumes that the multiple was not structurally changed by quality, cyclicality, capital needs, or the current tariff-refund effect. Available business-model and earnings evidence does not prove that assumption. [valuation/01 Price & Capital Structure, §§4–5; business-model/07 Business Quality, §4; earnings/06 Earnings Quality, §10]

## 5. Sector Cycle Reality Test

**Not assessable — no sector-level multiple history.** The frozen pool has BURL's own multiple series and a one-date peer snapshot, but no dated retail-sector P/E or EV/EBITDA series. As a limited price-only context, the SPDR S&P Retail ETF (XRT) rose from $56.59 on September 30, 2022 to $82.70 on September 28, 2026, or 46.1%; that return cannot distinguish earnings growth from a sector-multiple expansion and is therefore not evidence that BURL's own band is cycle-elevated or cycle-depressed. No `RF-VAL-001` or `RF-VAL-002` tag is warranted. [Web: FinanceCharts, XRT weekly close 2022-09-30 (indicative, unverified); Web: Stock Analysis, XRT close 2026-09-28 (indicative, unverified)]

## 6. Own-History Read

P/E and EV/Sales both place BURL below their recorded four-year ranges, but they produce materially different mechanical median values: $438.53 and $317.03 per share. The single biggest caveat is the unresolved Capital IQ enterprise-value basis: its historical EV/EBITDA close is 8.54x while the strict anchor yields 12.65x and its own comparable sheet does not reproduce either figure. Reversion to the historic P/E mean is not a clean base case until that data issue, the basic-versus-diluted P/E basis, the sector-cycle gap, and the case for a continuing historic multiple are resolved. [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet; data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data and Trading Multiples, 2026-09-28; valuation/01 Price & Capital Structure, Anchor Summary]
