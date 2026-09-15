# Valuation Data Triage — AKAM

The immutable frozen generation is complete: all 16 source files have manifest status `ok`, including 38 separately extracted workbook tabs. There are no `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer` source rows, and no `external/` documents. File-system modified dates were deliberately not used because they can reflect sync time rather than the document's own period; periods below come from document content. [Frozen generation manifest, source inventory]

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| `23cab413-4bd3-4055-8415-e3e81559c003.pdf` (244 KB) | Q2 earnings release | Q2 ended Jun. 30, 2026; released Aug. 6, 2026 | Not used — period read inside | High |
| `6b47a3ae-7484-4682-b959-73a68a8842b5.pdf` (340 KB) | Q2 supplemental financial information | Jun. 30, 2026 | Not used — period read inside | High |
| `8201ec17-6108-433f-bfdb-2ac3555bf343.pdf` (212 KB) | Q1 earnings release | Q1 ended Mar. 31, 2026; released May 7, 2026 | Not used — period read inside | Medium |
| `825b8027-5dc8-4664-8e3a-9bb6544bb003.pdf` (122 KB) | Q1 supplemental financial information | Mar. 31, 2026 | Not used — period read inside | Medium |
| `Akamai Technologies Inc NasdaqGS AKAM Financials.xls` (212 KB) | Capital IQ Financials workbook; 13 tabs inventoried below | FY21–FY25, LTM Jun. 30, 2026, and FY26E–FY28E where applicable | Not used — period read inside | High |
| `Akamai Technologies, Inc. Presents at Citi’s 2026 Global TMT Conference, Sep-09-2026 02_35 PM.pdf` (144 KB) | Investor presentation | Sep. 9, 2026 | Not used — period read inside | Medium |
| `Akamai Technologies, Inc. Presents at Goldman Sachs Communacopia + Technology Conference 2026, Sep-09-2026 02_25 PM.pdf` (150 KB) | Investor presentation | Sep. 9, 2026 | Not used — period read inside | Medium |
| `Akamai Technologies, Inc., 2025.pdf` (52.4 MB) | FY25 Form 10-K | Fiscal year ended Dec. 31, 2025 | Not used — period read inside | High |
| `Akamai Technologies, Inc., Q1 2026 Earnings Call, May 07, 2026.pdf` (400 KB) | Earnings-call transcript | May 7, 2026 / Q1 2026 | Not used — period read inside | Medium |
| `Akamai Technologies, Inc., Q1 2026.pdf` (637 KB) | Form 10-Q | Quarter ended Mar. 31, 2026 | Not used — period read inside | High |
| `Akamai Technologies, Inc., Q2 2026 Earnings Call, Aug 06, 2026.pdf` (379 KB) | Earnings-call transcript | Aug. 6, 2026 / Q2 2026 | Not used — period read inside | Medium |
| `Akamai Technologies, Inc., Q2 2026.pdf` (676 KB) | Form 10-Q | Quarter ended Jun. 30, 2026 | Not used — period read inside | High |
| `AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls` (7.5 MB) | Capital IQ Estimates workbook; 7 tabs inventoried below | FY26 is current fiscal year; Q3 release scheduled Nov. 3, 2026 | Not used — period read inside | High |
| `Company Comparable Analysis Akamai Technologies Inc.xls` (155 KB) | Capital IQ Quick Comparable Analysis workbook; 8 tabs inventoried below | As of Sep. 14, 2026 | Not used — period read inside | High |
| `Supplemental Financial Information, 1st Quarter 2026.xlsx` (37 KB) | Supplemental workbook; 5 tabs inventoried below | Mar. 31, 2026 | Not used — period read inside | Medium |
| `Supplemental Financial Information, 2nd Quarter 2026.xlsx` (40 KB) | Supplemental workbook; 5 tabs inventoried below | Jun. 30, 2026 | Not used — period read inside | High |

Workbook-tab inventory — each row below is a distinct manifest tab, not an opaque workbook. [Frozen generation manifest, source inventory]

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| `Financials.xls` — `Key Stats` (91×9) | Capital IQ key financials, current capitalization, estimates | FY22–FY25; LTM Jun. 30, 2026; FY26E–FY28E | Not used — period read inside | High |
| `Financials.xls` — `Income Statement` (120×7) | Capital IQ income statement | FY21–FY25; LTM Jun. 30, 2026 | Not used — period read inside | High |
| `Financials.xls` — `Balance Sheet` (89×7) | Capital IQ balance sheet | FY21–FY25; Jun. 30, 2026 | Not used — period read inside | High |
| `Financials.xls` — `Cash Flow` (72×7) | Capital IQ cash flow | FY21–FY25; LTM Jun. 30, 2026 | Not used — period read inside | High |
| `Financials.xls` — `Multiples` (91×9) | Own trading-multiple history | Mar. 31, 2025–Sep. 11, 2026 | Not used — period read inside | High |
| `Financials.xls` — `Historical Capitalization` (39×7) | Historical price, shares, market cap | Quarterly history through Sep. 2026 | Not used — period read inside | High |
| `Financials.xls` — `Capital Structure Summary` (87×7) | Debt, leases, cash and capitalization | Latest reported / LTM Jun. 30, 2026 | Not used — period read inside | High |
| `Financials.xls` — `Capital Structure Details` (35×10) | Debt maturity and instrument detail | Latest as-reported debt block; maturities through 2033 | Not used — period read inside | High |
| `Financials.xls` — `Ratios` (161×7) | Profitability and return ratios | FY21–FY25; LTM Jun. 30, 2026 | Not used — period read inside | Medium |
| `Financials.xls` — `Supplemental` (64×7) | Supplemental financial data | FY21–FY25; LTM Jun. 30, 2026 | Not used — period read inside | Medium |
| `Financials.xls` — `Industry Specific` (15×6) | Industry data | Latest vendor reported periods | Not used — period read inside | Low |
| `Financials.xls` — `Pension OPEB` (21×7) | Pension/OPEB data | FY21–FY25; LTM Jun. 30, 2026 | Not used — period read inside | Low |
| `Financials.xls` — `Segments` (72×7) | Segment and geographic revenue | FY21–FY25, including FY25 geographic revenue | Not used — period read inside | High |
| `EstimatesReport.xls` — `Consensus` (529×121) | Capital IQ consensus estimates | Current fiscal year ends Dec. 31, 2026; FY26–FY35 estimates | Not used — period read inside | High |
| `EstimatesReport.xls` — `Recent Changes` (265×10) | Estimate changes | Current FY26 and forward estimates | Not used — period read inside | Medium |
| `EstimatesReport.xls` — `Guidance` (142×89) | Company guidance versus estimates | Q3 and FY26 | Not used — period read inside | High |
| `EstimatesReport.xls` — `Multiples` (26×7) | Estimate-based trading multiples | Current / forward FY26 | Not used — period read inside | High |
| `EstimatesReport.xls` — `Surprise` (263×111) | Estimate beat/miss history | Historical through FY25 | Not used — period read inside | Medium |
| `EstimatesReport.xls` — `Trends` (303×21) | Consensus estimate trends | Current FY26 and forward estimates | Not used — period read inside | Medium |
| `EstimatesReport.xls` — `Revisions` (467×21) | Estimate revision breadth | Current FY26 and forward estimates | Not used — period read inside | Medium |
| `Comparable Analysis.xls` — `Financial Data` (50×17) | Peer financial data and subject capitalization | As of Sep. 14, 2026 | Not used — period read inside | High |
| `Comparable Analysis.xls` — `Trading Multiples` (50×9) | Peer and subject trading multiples | As of Sep. 14, 2026 | Not used — period read inside | High |
| `Comparable Analysis.xls` — `Operating Statistics` (50×13) | Peer operating statistics | As of Sep. 14, 2026 | Not used — period read inside | Medium |
| `Comparable Analysis.xls` — `Business Description` (44×3) | Peer business descriptions | As of Sep. 14, 2026 | Not used — period read inside | Medium |
| `Comparable Analysis.xls` — `Implied Valuation` (69×9) | Implied peer valuation | As of Sep. 14, 2026 | Not used — period read inside | High |
| `Comparable Analysis.xls` — `Valuation Chart` (32×2) | Peer valuation chart | As of Sep. 14, 2026 | Not used — period read inside | Medium |
| `Comparable Analysis.xls` — `Credit Health Panel` (48×10) | Peer credit metrics | As of Sep. 14, 2026 | Not used — period read inside | Medium |
| `Comparable Analysis.xls` — `Disclaimer` (26×1) | Vendor terms | As of Sep. 14, 2026 | Not used — period read inside | Low |
| `Supplemental Financial Information, 1st Quarter 2026.xlsx` — `Disclaimer` (33×1) | Supplemental-information disclaimer | Mar. 31, 2026 | Not used — period read inside | Low |
| `Supplemental Financial Information, 1st Quarter 2026.xlsx` — `Supplemental Metrics` (61×8) | GAAP/non-GAAP metrics | Q1 2025–Q1 2026 | Not used — period read inside | High |
| `Supplemental Financial Information, 1st Quarter 2026.xlsx` — `Supplemental Revenue` (46×8) | Revenue by solution/geography | Q1 2025–Q1 2026 | Not used — period read inside | High |
| `Supplemental Financial Information, 1st Quarter 2026.xlsx` — `GAAP to Non-GAAP Reconciliation` (126×8) | Adjustment reconciliation | Q1 2025–Q1 2026 | Not used — period read inside | Medium |
| `Supplemental Financial Information, 1st Quarter 2026.xlsx` — `Non-GAAP Definitions` (63×1) | Non-GAAP definitions | Mar. 31, 2026 | Not used — period read inside | Low |
| `Supplemental Financial Information, 2nd Quarter 2026.xlsx` — `Disclaimer` (9×1) | Supplemental-information disclaimer | Jun. 30, 2026 | Not used — period read inside | Low |
| `Supplemental Financial Information, 2nd Quarter 2026.xlsx` — `Supplemental Metrics` (61×10) | GAAP/non-GAAP metrics | Q1 2025–Q2 2026 | Not used — period read inside | High |
| `Supplemental Financial Information, 2nd Quarter 2026.xlsx` — `Supplemental Revenue` (46×10) | Revenue by solution/geography | Q1 2025–Q2 2026 | Not used — period read inside | High |
| `Supplemental Financial Information, 2nd Quarter 2026.xlsx` — `GAAP to Non-GAAP Reconciliation` (126×10) | Adjustment reconciliation | Q1 2025–Q2 2026 | Not used — period read inside | Medium |
| `Supplemental Financial Information, 2nd Quarter 2026.xlsx` — `Non-GAAP Definitions` (63×1) | Non-GAAP definitions | Jun. 30, 2026 | Not used — period read inside | Low |

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States / Nasdaq Global Select Market; common stock ticker `AKAM` | [Q2 2026 Form 10-Q, cover] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC: Form 10-K annual filing and Form 10-Q quarterly filings | [FY25 Form 10-K, cover]; [Q2 2026 Form 10-Q, cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | [Q2 2026 Form 10-Q, Note 1] |
| Reporting currency (and scale, e.g. INR crore) | USD; filings are generally in thousands except per-share amounts | [Q2 2026 Form 10-Q, financial statements] |
| Fiscal-year end | December 31 | [FY25 Form 10-K, cover] |
| Document language(s) | English | [FY25 Form 10-K, cover]; [Q2 2026 Form 10-Q, cover] |

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | `Akamai Technologies, Inc., 2025.pdf` | FY ended Dec. 31, 2025 [FY25 Form 10-K, cover] | 8.5 |
| Quarterly filing | `Akamai Technologies, Inc., Q2 2026.pdf` | Quarter ended Jun. 30, 2026 [Q2 2026 Form 10-Q, cover] | 2.5 |
| Capital structure / balance sheet | `Akamai Technologies, Inc., Q2 2026.pdf` | Jun. 30, 2026; cross-checked to CIQ Financials balance sheet [Q2 2026 Form 10-Q, balance sheets] | 2.5 |
| Consensus / estimate export | `AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls` — `Consensus` | FY26 current fiscal year; specific snapshot date is not printed inside the export [Capital IQ Estimates Consensus, FY26] | Not dateable |
| Multiples export | `Company Comparable Analysis Akamai Technologies Inc.xls` — `Trading Multiples` | Sep. 14, 2026 [Capital IQ Comps Trading Multiples, data as of 2026-09-14] | 0.0 |
| Peer / comps export | `Company Comparable Analysis Akamai Technologies Inc.xls` — `Financial Data` / `Trading Multiples` | Sep. 14, 2026 [Capital IQ Comps, data as of 2026-09-14] | 0.0 |
| Current price (IBKR / Capital IQ) | `Company Comparable Analysis Akamai Technologies Inc.xls` — `Financial Data` | USD 106.79 as of Sep. 14, 2026 [CIQ Comps→Financial Data “Day Close Price Latest” (subject), 2026-09-14] | 0.0 |
| Cash flow statement | `Akamai Technologies, Inc., Q2 2026.pdf` | Six months ended Jun. 30, 2026; LTM also supplied in CIQ Financials [Q2 2026 Form 10-Q, statements of cash flows] | 2.5 |
| Segment data | `Akamai Technologies, Inc., Q2 2026.pdf` | One reportable segment, quarter / six months ended Jun. 30, 2026 [Q2 2026 Form 10-Q, Note 14] | 2.5 |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | USD 106.79, pool-verified as of Sep. 14, 2026 [CIQ Comps→Financial Data “Day Close Price Latest” (subject), 2026-09-14] | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | Q2 diluted weighted-average shares are disclosed; 143.7m shares outstanding is also pinned by the CIQ sidecar [Q2 2026 Supplemental Metrics, shares used in per-share calculation]; [CIQ Comps→Financial Data “Shares Outstanding Latest” (subject), 2026-09-14] | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y | The Q2 10-Q identifies stock awards, convertible notes and warrants, and describes treasury-stock / if-converted treatment [Q2 2026 Form 10-Q, Note 13] | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y — Operating | One operating and reportable segment; services business [Q2 2026 Form 10-Q, Note 14] | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | Y | Latest balance sheet and debt note are present; CIQ total debt read is USD 9,339.0m, which remains subject to filing-basis reconciliation [Q2 2026 Form 10-Q, balance sheets and Note 7]; [CIQ Financials→Balance Sheet “Total Debt” (46203.0)] | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | FY25 audited statements, Q2 interim statements, and LTM CIQ financials are present [FY25 Form 10-K, financial statements]; [Q2 2026 Form 10-Q, statements of income] | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Q2 cash-flow statement plus LTM cash from operations in CIQ Financials [Q2 2026 Form 10-Q, statements of cash flows]; [CIQ Financials→Cash Flow “Cash from Ops.” (LTM Jun-30-2026)] | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | FY26 consensus and forward years, including revenue, EBITDA and EPS, are present [Capital IQ Estimates Consensus, FY26 and NTM] | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y — limited | Six quarterly close observations run from Mar. 31, 2025 to Sep. 11, 2026; CIQ marks the resulting own-history range low-confidence [CIQ Financials→Multiples, close observations] | Own-history re-rating read |
| Peer / comps data | Y | Ten named peers plus subject and summary statistics are supplied as of Sep. 14, 2026 [Capital IQ Comps Trading Multiples, data as of 2026-09-14] | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y — single reportable segment | The Q2 filing supplies one segment's revenue and cost lines; it also says Akamai does not operate material separate lines of business [Q2 2026 Form 10-Q, Note 14] | Confirms that SOTP collapses to the consolidated read rather than being a missing-data gap |
| Dividend / buyback data | Y | Q2 release discloses USD 410m of repurchases for 3m shares; no dividend claim is needed for the shareholder-yield read [Q2 2026 earnings release, share repurchases] | Shareholder-yield read |

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
| No current price | N | 01, 05, 07, 99 | None — dated pool-verified price is present |
| No consensus / forward estimates | N | 02, 03, 04, 05 | None — consensus is present; the undated-export freshness limitation must remain visible |
| No peer data | N | 03, 06 | None — dated peer set is present |
| No segment-level data | N | 06 | None — one reportable segment means SOTP is not independently applicable |
| No balance sheet / capital structure | N | 01, 04, 06 | None — Q2 balance sheet and debt-note data are present |
| No cash flow statement | N | 04 | None — Q2 cash flow and LTM CIQ cash flow are present |

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y — limited | None | Only six quarterly close observations are available (Mar. 2025–Sep. 2026), so this is not a stable 3–5-year anchor and must carry low confidence. [CIQ Financials→Multiples, close observations] |
| Peer relative valuation | Y | None | Dated Sep. 14 peer financial and trading-multiple sheets cover ten named peers. [Capital IQ Comps Trading Multiples, data as of 2026-09-14] |
| Intrinsic DCF (Operating FCFF) | Y | None | Operating-company method; LTM cash flow, interim financials, guidance and consensus are present. [Q2 2026 Form 10-Q, statements of cash flows]; [Capital IQ Estimates Consensus, FY26 and NTM] |
| Reverse DCF | Y | None | A dated pool price is available; the agent can invert the DCF once its normalized FCFF base and WACC are built. [CIQ Comps→Financial Data “Day Close Price Latest” (subject), 2026-09-14] |
| SOTP | N — not applicable | No material separate reportable segments | Akamai has one operating and reportable segment, so a breakup would be spurious and should collapse to the consolidated read. [Q2 2026 Form 10-Q, Note 14] |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool contains usable FY/LTM income and cash-flow bases, a current balance sheet and debt data, dated pool-verified price and peer multiples, plus forward consensus and guidance; this supports more than two valid methods.
- **Methods that can run:** own-history multiples (limited history), peer relative valuation, intrinsic FCFF DCF, and reverse-DCF.
- **Critical implementation limitation:** The CIQ own-history multiples series has only six quarterly closes, so it may be a cross-check but cannot be treated as a stable 3–5-year reversion anchor. The estimates export also lacks an explicit snapshot date inside the workbook; its content is usable, but downstream agents must carry that freshness qualification.
