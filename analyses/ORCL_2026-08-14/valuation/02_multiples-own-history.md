# Multiples — Own History — ORCL

Reporting currency: USD. Reporting standard: US GAAP, fiscal year end May-31 (FY2026 = year ended May-31-2026). Anchor numbers below are copied verbatim from `01_price-and-capital-structure.md`: current price $153.94 (Aug-13-2026, delayed NYSE quote), market cap $443,424.2M (2,880.5M basic shares), enterprise value $584,464.2M (lease-inclusive, canonical), net debt (strict) $136,143M, minority interest $548.0M, preferred equity (carrying value) $4,954.0M. Per-share fair-value figures below use the GAAP diluted weighted-average share count of 2,914M shares, per 01's stated disclosure-clean default.

Business type: single-business operating/software company (not a financial, REIT, or holding company) — the EV-based multiple set (EV/Sales, EV/EBITDA, EV/EBIT) plus P/E, P/FCF and dividend yield is the right method map; P/tangible book is dropped (structurally negative from $65.5bn of goodwill/intangibles — a capital-structure fact, not a valuation signal per 01 §6) and plain P/Book is shown with a data-quality caveat (see §2).

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E | LTM, GAAP diluted EPS | $5.83 | 26.40x | Price $153.94 [01]; EPS [`Financials_Annual.xls`, Income Statement tab, FY2026] |
| P / E | LTM, Non-GAAP diluted EPS | $7.63 | 20.18x | EPS per [`earnings/01_historical-financials.md` §4, Q4 FY26 Earnings Press Release GAAP-to-non-GAAP reconciliation] |
| P / E | NTM / FY2027, consensus Non-GAAP EPS | $8.05 (42-analyst consensus) | 19.03x | [`OracleCorporationNYSEORCLEstimatesReport.xls`, Multiples tab, "Based on Market Price," FY 2027 column] |
| EV / EBITDA | LTM, plain GAAP EBITDA | $30,494M | 19.17x | EV [01]; EBITDA [`Financials_Annual.xls`, Income Statement tab, FY2026] |
| EV / EBITDA | LTM, EBITDAR basis (vendor series — see §2 note) | $33,288M (EBITDA + total rent expense) | 17.56x | [`Financials_Annual.xls`, Income Statement tab, "EBITDAR" row, FY2026]; basis reconciled in 01 §5 |
| EV / EBIT | LTM, CIQ EBIT (excludes restructuring & other charges) | $22,385M | 26.11x | [`Financials_Annual.xls`, Income Statement tab, FY2026] |
| EV / EBIT | LTM, GAAP operating income (includes $1,779M restructuring) | $20,606M | 28.36x | FY26 10-K / Q4 FY26 Earnings Press Release |
| EV / Sales | LTM | $67,357M | 8.68x | EV [01]; Revenue [`Financials_Annual.xls`, Income Statement tab, FY2026] |
| EV / Sales | NTM / FY2027, consensus | $89,336.55M (42-analyst mean) | 6.52x | [`OracleCorporationNYSEORCLEstimatesReport.xls`, Multiples tab, FY 2027 column] |
| P / Book | LTM | BVPS $13.04 | 11.81x | Price $153.94; BVPS [01 §6, `Financials_Annual.xls` Balance Sheet tab, FY2026] |
| P / FCF (FCF yield) | LTM | FCF = CFO $31,977M − capex $55,663M = −$23,686M | **NM** (negative) — FCF yield ≈ −5.3% of market cap | [`earnings/01_historical-financials.md` §1–2]; FCF turned sharply negative on the FY2026 AI-datacenter capex ramp (capex +162% YoY) |
| Dividend yield | LTM, indicated | — | 1.3% | [`Public Company Profile.rtf`, "Dividend Yield %"] |

**Definitions.** EBITDA = GAAP operating income + D&A (company does not disclose a non-GAAP EBITDA — see `earnings/01` §4). FCF = CFO − total capex, no company-specific redefinition (§15 default). P/E uses fully-diluted weighted-average shares (2,914M), consistent with the EPS figures' own denominator. No dividend-per-share time series is available in the pool beyond the current indicated yield — see partial-data note in §2.

## 2. Historical Multiple Bands (Trailing ~5 Years: 2021-09-30 to 2026-08-12, 21 quarterly closes)

Source: `Oracle Corporation NYSE ORCL Financials_Annual.xls`, Multiples tab, "Close" row (quarter-end trading-day close, quarterly frequency) — the same workbook 01 uses for the capital-structure bridge. Band statistics computed directly from the exported time series (min/mean/median/max of quarter-end close values over the trailing 21 quarters).

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| EV / Sales (LTM) | 5.56x | 8.50x | 8.18x | 15.30x | 8.68x | 32.0% |
| EV / EBITDAR (LTM, vendor basis — see note) | 12.69x | 19.55x | 17.85x | 35.56x | 17.56x | 21.5% |
| EV / EBIT (LTM, CIQ basis) | 15.42x | 26.83x | 26.02x | 48.60x | 26.11x | 32.2% |
| P / E (LTM, GAAP diluted) | 18.46x | 33.64x | 31.06x | 65.12x | 26.40x | 17.0% |
| EV / Sales (NTM / FY-fwd) | 4.89x | 7.49x | 6.72x | 12.83x | 6.52x | 20.5% |
| EV / EBITDA (NTM / FY-fwd) | 10.46x | 14.71x | 13.73x | 24.30x | 11.65x | 8.6% |
| EV / EBIT (NTM / FY-fwd) | 11.67x | 17.52x | 16.20x | 30.63x | 16.23x | 24.1% |
| P / E (NTM / FY-fwd) | 11.96x | 21.11x | 19.08x | 39.79x | 19.03x | 25.4% |

**Vendor-basis note (EV/EBITDA row).** The CIQ Multiples workbook's own "TEV/LTM EBITDA" series is computed on an EBITDAR basis (EBITDA + total rent expense, $33,288M for FY2026), not plain GAAP EBITDA ($30,494M) — the same EBITDAR figure that 01 §5 already identified as explaining the vendor's own "Net Debt/EBITDA" discrepancy (167,432/33,288 = 5.03x, matching the vendor's printed ratio exactly). Recomputing today's point on this same basis (584,464.2 / 33,288 = 17.56x) reconciles almost exactly to the vendor's own Aug-12-2026 close of 17.50x (the residual is the one-day price gap already documented in 01). This report labels the row EV/EBITDAR and uses it only for direct comparability with the vendor's own historical series; the plain-EBITDA current multiple (19.17x, Section 1) is not directly comparable to this band without the same rent add-back and is not mixed into it (§15 hygiene).

**P/Book — excluded from the band, data conflict flagged, not resolved.** The same Multiples workbook's "P/BV" series shows "NM" for all six of the most recent quarters (2025-06-30 through 2026-08-12) — implying the vendor's own P/BV calculation treats book value as not meaningful over that window. This directly conflicts with the Balance Sheet tab's own "Book Value/Share" row, which shows book value per share positive and rising every quarter over the same window (from $3.16 at 2024-03-28 to $13.04 at FY2026 year-end) — the same $13.04 figure 01 cites for the current P/B multiple (11.81x, Section 1). This is an unresolved vendor internal inconsistency, not a real business fact (book value is genuinely positive and growing per the audited balance sheet), and the current P/B multiple in Section 1 uses the Balance-Sheet-sourced figure. Because the band itself cannot be reconstructed cleanly from the conflicting series, P/B is dropped from the reversion table in Section 4 rather than published on an unreliable base.

**Dividend yield** — no historical time series is available in the data pool beyond the current 1.3% indicated yield; per the partial-data rule, this single metric's re-rating read is limited to the current level.

Note on the amplitude behind these numbers: Oracle's 52-week trading range was $114.50–$345.72 [`Public Company Profile.rtf`] — a >3x round-trip within the last year, driven by the September-2025 AI-infrastructure/RPO re-rating spike (consistent with the EV/EBITDAR band's max of 35.56x, printed at the 2025-12-31 quarter-end) and the subsequent partial de-rating back toward $150s. The 21-quarter band above is built from quarter-end closes and therefore smooths over — but does not erase — that single-name volatility; a reader relying only on the quarter-end snapshots should not assume the stock traded calmly through this period.

## 3. Re-Rating / De-Rating Read

On the three multiples with a clean, comparable 5-year band — EV/Sales, EV/EBITDAR, EV/EBIT — Oracle sits in the bottom third of its own range (17.0–32.2nd percentile) and close to, or modestly below, its own median: EV/Sales is +6.1% above its own median ($8.18x) but only +2.1% above its own mean; EV/EBITDAR is −1.4% versus its own median (17.85x) and −10.0% versus its own mean (19.55x, a mean pulled up by the September-2025 spike); EV/EBIT sits almost exactly on its own median (+0.3%) and −2.7% below its own mean. On a pure GAAP P/E basis the discount looks much larger (−15.0% to median, −21.5% to mean) — but that reading is not reliable on its own: FY2026 GAAP diluted EPS ($5.83) includes one-time investment gains from the Ampere chip-business and Bloom Energy warrant sales [`earnings/04_guidance-consensus.md` §6], which mechanically lowers today's P/E versus a "clean" historical multiple and overstates any reversion-implied upside on that metric. Forward (NTM/FY2027) multiples sit even lower in their own range (8.6th–25.4th percentile) than the LTM multiples, largely because consensus is pricing very strong FY2027 EPS/EBITDA growth off the FY2026 base — a mechanical effect of the growth outlook, not necessarily an independent forward de-rating. Putting the reliable EV-based read together: the stock has partially, not fully, de-rated from its September-2025 AI-infrastructure peak (EV/EBITDAR max 35.56x) back to roughly its own 5-year median level — it is not trading at a statistically extreme premium or discount to its own recent history on the multiples least distorted by one-off items and definitional noise, but leverage has risen sharply in the same window (net debt +38.7% YoY to $136,143M strict basis, per `01` §5), so an EV-based multiple that looks "in line with history" is being paid on top of a materially larger debt load than the history it is being compared against.

## 4. Implied Value from Reversion

Reversion targets applied to LTM metrics only (NTM figures are shown for context in §2–3 but not carried into per-share implied values, to avoid compounding a consensus estimate with a historical-multiple estimate). Implied equity value = (multiple × metric) − net debt (strict, $136,143M) − minority interest ($548.0M) − preferred equity ($4,954.0M); implied price = implied equity value ÷ 2,914M diluted shares.

| Multiple | Reversion Target (mean / median) | Implied EV ($M) | Implied Price/Share | vs Current Price ($153.94) |
|---|---:|---:|---:|---:|
| EV / Sales (LTM) | Median 8.18x | 550,980 | $140.47 | −8.7% |
| EV / Sales (LTM) | Mean 8.50x | 572,535 | $147.87 | −3.9% |
| EV / EBITDAR (LTM) | Median 17.85x | 594,191 | $155.30 | +0.9% |
| EV / EBITDAR (LTM) | Mean 19.55x | 650,780 | $174.72 | +13.5% |
| EV / EBIT (LTM, CIQ basis) | Median 26.02x | 582,458 | $151.27 | −1.7% |
| EV / EBIT (LTM, CIQ basis) | Mean 26.83x | 600,590 | $157.50 | +2.3% |
| P / E (LTM, GAAP) — caveated | Median 31.06x | n/a (direct: price = mult × EPS) | $181.08 | +17.6% |
| P / E (LTM, GAAP) — caveated | Mean 33.64x | n/a | $196.12 | +27.4% |

**Base case (the point `07` should weight):** the **EV/EBIT (LTM, CIQ basis) median-reversion** value of **$151.27/share (−1.7% vs. current price)** — chosen because it sits closest to its own historical median (32.2nd percentile of range, +0.3% premium to median), because EBIT captures the P&L impact of the depreciation building up from the FY2026 capex ramp (unlike EV/Sales, which is margin-blind), and because it avoids the EBITDAR-basis reconciliation and the GAAP-EPS one-off-gain distortions that complicate the other two rows.

**Dispersion (the exhibit, not the point):** the three EV-based medians cluster from **$140.47 to $155.30** (−8.7% to +0.9% vs. current price); the corresponding means run higher, **$147.87 to $174.72** (−3.9% to +13.5%), pulled up by the September-2025 AI-rally quarters that sit in the historical window. The GAAP P/E reversion values ($181.08–$196.12, +17.6% to +27.4%) are shown for completeness but are flagged unreliable: they apply a "clean" historical multiple to an EPS base inflated by one-time investment gains, which overstates the implied price — this row should not be averaged into the base case or the dispersion range.

**Reversion assumption — explicitly tested.** Reverting to Oracle's own 5-year mean/median multiple assumes the warranted multiple has not structurally changed. There is real evidence against that assumption in both directions: (1) net debt rose 38.7% in a single year (to $136,143M strict basis) to fund an AI-datacenter capex program that took capex from $21,215M to $55,663M and turned FCF sharply negative (−$23,686M) — a genuine capital-structure and cash-generation change that argues the OLD (pre-AI-capex) mean may be too generous a target on an equity basis, even where the EV-based multiple looks unchanged; (2) the same capex program is a bet on a large, and if realized, durable growth step-up (RPO +363% to $638bn per the management-governance module), which argues the multiple SHOULD be higher than its pre-AI-cycle history if the backlog converts to cash as guided. Both forces are real and roughly offsetting in the EV-based read above; this report does not resolve which dominates — that judgment belongs to `04_intrinsic-dcf` and `07_scenario-and-fair-value`, which can test the capex-to-revenue conversion directly.

## 5. Own-History Read

On the multiples least distorted by one-off items and leverage-vs-equity basis differences (EV/Sales, EV/EBITDAR, EV/EBIT), Oracle trades close to its own 5-year median — not at a statistically extreme premium or discount — after a partial de-rating down from the September-2025 AI-infrastructure spike (EV/EBITDAR peaked at 35.56x that quarter versus 17.56x today). Reverting to the own-median EV/EBIT multiple implies roughly $151/share, essentially flat to today's $153.94. The single biggest caveat is that this "in-line with own history" read on EV-based multiples is being earned on top of a much larger debt load than the history it is measured against — net debt rose 38.7% in one year to fund a capex program that turned free cash flow deeply negative — so an unchanged EV multiple does not mean an unchanged equity-holder risk profile; a downstream DCF or reverse-DCF read should test explicitly whether the AI-capex bet converts backlog (RPO +363% YoY) into cash fast enough to justify carrying that debt at the current multiple, rather than assuming the pre-capex-ramp mean is still the right anchor. The management-governance module's §24 Filter 6 (unaligned-owner) test does not trigger for Oracle — founder Larry Ellison holds ~40.2% of the stock and remains an active, engaged Executive Chair/CTO, the opposite of the filter's target profile (government control, listed-subsidiary-of-parent, sprawling conglomerate) [`management-governance/04_ownership-and-insider-behavior.md`, finding 04-008] — so there is no structural-owner reason to discount the reversion-to-own-mean read here; the caveat that matters is capital-structure and cash-conversion risk, not ownership misalignment.
