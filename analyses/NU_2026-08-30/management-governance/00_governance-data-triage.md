# Governance Data Triage — NU

**Run date:** 2026-08-30. `data/NU/` contains 111 source files. The existing canonical extraction manifest contains 111 source entries, 84 workbook-tab extracts and 64 non-workbook extracts; every manifest entry is `ok`. A re-run of `extract_pool.py` was attempted but the local macOS command-line-tools prerequisite is unavailable in this non-GUI environment. This does not change the verdict because the already-present canonical manifest and every required extract are available and mechanically readable. No manifest entry is `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer`.

## 1. File Inventory

The table is an inventory of every source class and every workbook tab recorded in `_pool_extracts/manifest.md`. Drive sync dates shown under “Last Modified” are not used as reporting dates; periods below are read from the document title or content. All source files are in English except the bilingual Brazilian auditor wording in the June 2026 interim report.

| Filename | Type | Period Covered | Last Modified | Governance Relevance |
|---|---|---|---|---|
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf/.doc` | FY25 annual filing / 20-F | FY ended 2025-12-31 | 2026-08-29/30 | High |
| `Filings/Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` | duplicate FY25 20-F | FY ended 2025-12-31 | 2026-08-29 | High |
| `Filings 2/Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` | duplicate FY25 20-F | FY ended 2025-12-31 | 2026-08-29 | High |
| `Nu Holdings Ltd. Form 20-F filed on Apr-08-2026.pdf` | Form 20-F filing notice | filed 2026-04-08 | 2026-08-30 | High |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).pdf/.doc` | FY24 annual filing / 20-F | FY ended 2024-12-31 | 2026-08-29/30 | High |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-19-2024).pdf` | FY23 annual filing / 20-F | FY ended 2023-12-31 | 2026-08-29 | High |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-20-2023).pdf` | FY22 annual filing / 20-F | FY ended 2022-12-31 | 2026-08-29 | High |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-21-2022).pdf` | FY21 annual filing / 20-F | FY ended 2021-12-31 | 2026-08-29 | High |
| `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` | Interim financial statements / 6-K exhibit | Q2 and H1 ended 2026-06-30 | 2026-08-29 | High |
| `Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` | duplicate Q2/H1 interim filing | Q2 and H1 ended 2026-06-30 | 2026-08-29 | High |
| `Filings 2/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` | duplicate Q2/H1 interim filing | Q2 and H1 ended 2026-06-30 | 2026-08-29 | High |
| `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf` | Q2 earnings / 6-K exhibit | Q2 and H1 ended 2026-06-30 | 2026-08-29 | High |
| `Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf` | duplicate Q2 earnings / 6-K exhibit | Q2 and H1 ended 2026-06-30 | 2026-08-29 | High |
| `Filings 2/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf` | duplicate Q2 earnings / 6-K exhibit | Q2 and H1 ended 2026-06-30 | 2026-08-29 | High |
| `Nu_Holdings_Ltd_-_(Aug-13-2026).pdf` | CFO-change / current 6-K material event | 2026-08-13 | 2026-08-29 | High |
| `Filings/Nu_Holdings_Ltd_-_(Aug-13-2026).pdf` | duplicate 6-K material event | 2026-08-13 | 2026-08-29 | High |
| `Filings 2/Nu_Holdings_Ltd_-_(Aug-13-2026).pdf` | duplicate 6-K material event | 2026-08-13 | 2026-08-29 | High |
| `Nu_Holdings_Ltd_-_Form_Annual_Report(Feb-26-2026).pdf` and `Filings/`, `Filings 2/` copies | FY25 earnings annual-report package | FY ended 2025-12-31 | 2026-08-29 | High |
| `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Feb-25-2026).pdf` and `Filings/`, `Filings 2/` copies | FY25 preliminary results / 6-K | FY ended 2025-12-31 | 2026-08-29 | High |
| `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(May-14-2026).pdf` and `Filings/`, `Filings 2/` copies | Q1 2026 results / 6-K | Q1 ended 2026-03-31 | 2026-08-29 | High |
| `Nu_Holdings_Ltd_-_Form_Interim_Report(May-14-2026).pdf` and `Filings/`, `Filings 2/` copies | Q1 2026 interim filing | Q1 ended 2026-03-31 | 2026-08-29 | High |
| `Nu_Holdings_Ltd_-_Form_Interim_Report(May-15-2026).pdf` and `Filings/`, `Filings 2/` copies | Q1 2026 related 6-K exhibit | Q1 ended 2026-03-31 | 2026-08-29 | Medium |
| `Nu_Holdings_Ltd_-_Form_Interim_Report(May-20-2026).pdf` and `Filings/`, `Filings 2/` copies | May 2026 6-K exhibit | 2026-05-20 | 2026-08-29 | Medium |
| `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf` and `Filings/`, `Filings 2/` copies | Aug 2026 6-K exhibit | 2026-08-20 | 2026-08-29 | Medium |
| `Nu_Holdings_Ltd_-_Form_Interim_Report(Nov-17-2025).pdf` and `Filings/`, `Filings 2/` copies | Q3 2025 6-K exhibit | Q3 ended 2025-09-30 | 2026-08-29 | Medium |
| `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Nov-13-2025).pdf` and `Filings/`, `Filings 2/` copies | Q3 2025 results / 6-K | Q3 ended 2025-09-30 | 2026-08-29 | Medium |
| `Nu_Holdings_Ltd_-_(Aug-19-2025).pdf` and `Filings/`, `Filings 2/` copies | August 2025 6-K material event | 2025-08-19 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q4 2021 Earnings Call, Feb 22, 2022.pdf` | transcript | Q4/FY21 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q1 2022 Earnings Call, May 16, 2022.pdf` | transcript | Q1 2022 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q2 2022 Earnings Call, Aug 15, 2022.pdf` | transcript | Q2 2022 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q3 2022 Earnings Call, Nov 14, 2022.pdf` | transcript | Q3 2022 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q4 2022 Earnings Call, Feb 14, 2023.pdf` | transcript | Q4/FY22 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q1 2023 Earnings Call, May 15, 2023.pdf` | transcript | Q1 2023 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q2 2023 Earnings Call, Aug 15, 2023.pdf` | transcript | Q2 2023 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q3 2023 Earnings Call, Nov 14, 2023.pdf` | transcript | Q3 2023 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q4 2023 Earnings Call, Feb 22, 2024.pdf` | transcript | Q4/FY23 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q1 2024 Earnings Call, May 14, 2024.pdf` | transcript | Q1 2024 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q2 2024 Earnings Call, Aug 13, 2024.pdf` | transcript | Q2 2024 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q3 2024 Earnings Call, Nov 13, 2024.pdf` | transcript | Q3 2024 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q4 2024 Earnings Call, Feb 20, 2025.pdf` | transcript | Q4/FY24 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q1 2025 Earnings Call, May 13, 2025.pdf` | transcript | Q1 2025 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q2 2025 Earnings Call, Aug 14, 2025.pdf` | transcript | Q2 2025 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q3 2025 Earnings Call, Nov 13, 2025.pdf` | transcript | Q3 2025 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q4 2025 Earnings Call, Feb 25, 2026.pdf` | transcript | Q4/FY25 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q1 2026 Earnings Call, May 14, 2026.pdf` | transcript | Q1 2026 | 2026-08-29 | Medium |
| `Nu Holdings Ltd., Q2 2026 Earnings Call, Aug 13, 2026.pdf` | transcript | Q2 2026 | 2026-08-29 | High |
| `Nu Holdings Ltd. - ShareholderAnalyst Call.pdf` | AGM/shareholder call | 2026-08-06 | 2026-08-29 | High |
| `Nu Holdings Ltd NYSE NU Board Members.xls` — `Board Members` (28×25) | Capital IQ board export | current as of 2026-08-29 | 2026-08-29 | High |
| `Nu Holdings Ltd NYSE NU Committees.xls` — `Committees` (35×2) | Capital IQ committee export | current as of 2026-08-29 | 2026-08-29 | High |
| `Nu Holdings Ltd NYSE NU Auditors.xls` — `Auditors` (18×5) | Capital IQ auditor export | current as of 2026-08-29 | 2026-08-29 | High |
| `Nu Holdings Ltd NYSE NU Public Ownership Summary.rtf` | Capital IQ ownership summary | current; top-holder dates through 2026-08-25 | 2026-08-29 | High |
| `Nu Holdings Ltd NYSE NU Public Ownership Detailed.xls` — `Detailed` (1,346×15) | Capital IQ ownership export | current as of 2026-08-29 | 2026-08-29 | High |
| `Nu Holdings Ltd NYSE NU Public Ownership History.xls` — `History` (1,499×5) | Capital IQ ownership history | through 2026-06-30 | 2026-08-29 | High |
| `Nu Holdings Ltd NYSE NU Public Ownership Insider Trading.xls` — `Insider Trading` (46×11) | Capital IQ/Form 4 trade export | through 2026-08-26 | 2026-08-29 | High |
| `Nu Holdings Ltd NYSE NU Public Ownership Crossholdings.xls` — `Crossholdings` (1,840×7) | Capital IQ ownership export | current as of 2026-08-29 | 2026-08-29 | Medium |
| `Nu Holdings Ltd NYSE NU Private Ownership.rtf` | private-ownership export | current as of 2026-08-29 | 2026-08-29 | High |
| `Nu Holdings Ltd NYSE NU Takeover Defenses.xls` — `Corporate Governance` (48×4) | Capital IQ governance export | current as of 2026-08-29 | 2026-08-29 | High |
| same — `Takeover Defenses` (26×4) | Capital IQ defense export | current as of 2026-08-29 | 2026-08-29 | High |
| same — `Compare Defenses` (36×8) | Capital IQ peer-defense export | current as of 2026-08-29 | 2026-08-29 | Medium |
| `Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls` — `Nu Holdings Ltd NYSENU Corpor` (53×17) | Capital IQ group tree | current as of 2026-08-30 | 2026-08-30 | High |
| same — `Filtered Count` (22×4) | Capital IQ group tree | current as of 2026-08-30 | 2026-08-30 | Medium |
| same — `Aggregates` (22×4) | Capital IQ group tree | current as of 2026-08-30 | 2026-08-30 | Medium |
| `Nu Holdings Ltd NYSE NU Corporate Timeline.xls` — `Corporate Timeline` (51×4) | Capital IQ developments / management changes | last six months through 2026-08-13 | 2026-08-29 | High |
| `Nu Holdings Ltd NYSE NU Professionals.xls` — `Professionals` (29×24) | Capital IQ KMP/professionals export | current as of 2026-08-29 | 2026-08-29 | High |
| `Nu Holdings Ltd NYSE NU Public Company Profile.rtf` | Capital IQ company, KMP and subsidiary profile | current as of 2026-08-28 | 2026-08-29 | High |
| `Nu Holdings Ltd NYSE NU Key Developments.rtf` | Capital IQ developments | current as of 2026-08-30 | 2026-08-30 | High |
| `Nu Holdings Ltd NYSE NU Fixed Income S P Global Ratings.xls` — `S P Global Ratings` (20×8) | ratings export | current as of 2026-08-29 | 2026-08-29 | Medium |
| `Nu Holdings Ltd NYSE NU Fixed Income Securities Summary.xls` — `Securities Summary` (2,299×24) | debt securities export | current as of 2026-08-29 | 2026-08-29 | Medium |
| `Nu Holdings Ltd NYSE NU Financials.xls` — `Key Stats` (85×9) | financial workbook | FY21–LTM Q2 2026 | 2026-08-29 | Medium |
| same — `Income Statement` (94×7) | financial workbook | FY21–LTM Q2 2026 | 2026-08-29 | Medium |
| same — `Balance Sheet` (89×7) | financial workbook | FY21–LTM Q2 2026 | 2026-08-29 | Medium |
| same — `Cash Flow` (72×7) | financial workbook | FY21–LTM Q2 2026 | 2026-08-29 | Medium |
| same — `Multiples` (61×9) | financial workbook | current / history | 2026-08-29 | Low |
| same — `Historical Capitalization` (38×7) | financial workbook | historical | 2026-08-29 | Low |
| same — `Capital Structure Summary` (60×7) | financial workbook | current / history | 2026-08-29 | Medium |
| same — `Capital Structure Details` (33×10) | financial workbook | current / history | 2026-08-29 | Medium |
| same — `Ratios` (149×7) | financial workbook | FY21–LTM Q2 2026 | 2026-08-29 | Medium |
| same — `Supplemental` (50×7) | financial workbook | FY21–LTM Q2 2026 | 2026-08-29 | Medium |
| same — `Industry Specific` (68×7) | financial workbook | FY21–LTM Q2 2026 | 2026-08-29 | Medium |
| same — `Pension OPEB` (15×6) | financial workbook | FY21–LTM Q2 2026 | 2026-08-29 | Low |
| same — `Segments` (77×7) | financial workbook | FY21–LTM Q2 2026 | 2026-08-29 | Medium |
| Standalone Financials workbooks: `Balance Sheet`, `Capital Structure Details`, `Capital Structure Summary`, `Cash Flow`, `Historical Capitalization`, `Income Statement`, `Industry Specific`, `Key Stats`, `Multiples`, `Ratios`, `Segments`, `Supplemental` — one same-named tab each | duplicate CIQ financial exports | FY21–LTM Q2 2026 / current as applicable | 2026-08-29 | Medium |
| `Nu Holdings Ltd NYSE NU Financials Multiples (1).xls` — `Multiples` (61×9) | duplicate CIQ multiple export | current / history | 2026-08-29 | Low |
| `Nu Holdings Ltd NYSE NU Financials Segments (1).xls` — `Segments` (77×7) | duplicate CIQ segment export | FY21–LTM Q2 2026 | 2026-08-29 | Medium |
| `Nu Holdings Ltd NYSE NU Equity Listings.xls` — `Equity Listings` (25×11); `Equity Listings.rtf` | listing exports | current as of 2026-08-29 | 2026-08-29 | Medium |
| `Nu Holdings Ltd NYSE NU Industry Classifications.rtf` | classification export | current as of 2026-08-29 | 2026-08-29 | Medium |
| `Nu Holdings Ltd NYSE NU Long Business Description.rtf` | company description | current as of 2026-08-29 | 2026-08-29 | Low |
| `Nu Holdings Ltd NYSE NU Competitors.xls` — `Competitors` (89×8) | peer export | current as of 2026-08-29 | 2026-08-29 | Low |
| `Nu Holdings Ltd NYSE NU Customers.xls` — `Customers` (16×8) | Capital IQ customer relationships | recently disclosed, two-year scope | 2026-08-29 | Medium |
| `Nu Holdings Ltd NYSE NU Suppliers.xls` — `Suppliers` (25×8) | Capital IQ supplier relationships | recently disclosed, two-year scope | 2026-08-29 | Medium |
| `Nu Holdings Ltd NYSE NU Strategic Alliances.xls` — `Strategic Alliances` (25×7) | relationships export | current as of 2026-08-29 | 2026-08-29 | Medium |
| `Nu Holdings Ltd NYSE NU Investment Analysis Co Investors.xls` — `Co-Investors` (53×3) | investor export | current as of 2026-08-30 | 2026-08-30 | Low |
| `Nu Holdings Ltd NYSE NU Investment Analysis Direct Investments.xls` — `Direct Investments` (55×21) | investment export | current as of 2026-08-30 | 2026-08-30 | Low |
| `Nu Holdings Ltd NYSE NU Comparable M A Transactions.xls` and `(1).xls` — one `Comparable M A Transactions` tab each (17×9) | CIQ M&A comparables | current as of 2026-08-29 | 2026-08-29 | Low |
| `Transaction Summary M A Private Placements.xls` — `M A Private Placements` (25×14) | transaction export | historical/current | 2026-08-29 | Medium |
| `Transaction Summary Public Offerings.xls` — `Public Offerings` (15×8) | transaction export | historical/current | 2026-08-29 | Low |
| `Nu Holdings Ltd NYSE NU Analyst Coverage.xls` and `(1).xls` — one `Analyst Coverage` tab each (41×6) | CIQ analyst coverage | current as of 2026-08-29 | 2026-08-29 | Low |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` — `Consensus` (397×30) | CIQ estimates | current as of 2026-08-29 | 2026-08-29 | Low |
| same — `Recent Changes` (265×10) | CIQ estimates | current as of 2026-08-29 | 2026-08-29 | Low |
| same — `Multiples` (26×5) | CIQ estimates | current as of 2026-08-29 | 2026-08-29 | Low |
| same — `Surprise` (200×20) | CIQ estimates | history through FY25 | 2026-08-29 | Low |
| same — `Trends` (238×21) | CIQ estimates | current / history | 2026-08-29 | Low |
| same — `Revisions` (357×17) | CIQ estimates | current / history | 2026-08-29 | Low |
| `Company Comparable Analysis Nu Holdings Ltd .xls` — `Financial Data`, `Trading Multiples`, `Operating Statistics`, `Business Description`, `Implied Valuation`, `Valuation Chart` | CIQ comparable workbook (six tabs) | current as of 2026-08-29 | 2026-08-29 | Low |
| `Charting Excel Export Aug-29-2026 2_02 PM.xls` — `Chart 1 with Data`, `Attributions` | market chart workbook (two tabs) | as of 2026-08-29 | 2026-08-29 | Low |
| `Nu Holdings Ltd NYSE NU Events Calendar.xls` — `Events Calendar` (27×3) | events export | current as of 2026-08-29 | 2026-08-29 | Low |
| `Nu Holdings Ltd NYSE NU Products.xls` — `Products` (31×5) | products export | current as of 2026-08-29 | 2026-08-29 | Low |
| `U21257060_20260331_20260331.pdf` | user tax/reporting document | FY2025–26 | 2026-08-30 | Low |
| `consolidated_tax_report_2025-26.xlsx` — `LTCG`, `STCG`, `F&O`, `Intraday`, `Dividend`, `Interest`, `Bonds & SGB`, `Schedule FA`, `Schedule FSI`, `Form 67`, `Schedule TR` | user tax workbook (11 tabs) | FY2025–26 | 2026-08-30 | Low |

**Inventory completeness note.** The individual 6-K/earnings files described in the grouped `Filings/` and `Filings 2/` rows are byte-for-byte duplicate delivery paths of the root documents; each is nevertheless separately represented in the manifest and has an `ok` extract. The manifest contains no external-document path (`data/NU/external/` does not exist), so there is no external-data table and no external item contributes to the sufficiency verdict.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---:|
| Proxy / DEF 14A equivalent | FY25 Form 20-F (foreign private issuer governance, compensation, ownership and Item 6/7 disclosures) | filed 2026-04-08; FY ended 2025-12-31 | 4.7 |
| Annual filing | `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` | FY ended 2025-12-31 | 8.0 |
| Compensation disclosure | FY25 Form 20-F, Item 6B and Note 28(b) | FY ended 2025-12-31 | 8.0 |
| Ownership / insider-transaction data | `Public Ownership Insider Trading.xls`; `Public Ownership Summary.rtf` | Form 4 activity through 2026-08-26; ownership top-holder dates through 2026-08-25 | 0.1 |
| Shareholder letter | Not in pool as a discrete letter; shareholder/analyst call is present | AGM 2026-08-06 | 0.8 |
| Transcript | `Nu Holdings Ltd., Q2 2026 Earnings Call, Aug 13, 2026.pdf` | Q2 2026 | 0.6 |
| 8-K / management-change equivalent | `Nu_Holdings_Ltd_-_(Aug-13-2026).pdf`; FPI 6-K disclosure | CFO transition effective 2026-07-13, disclosed 2026-08-13 | 0.6 |

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A | Y — local/FPI equivalent | FY25 Form 20-F, Items 6, 7, 16G | Comp, ownership, board, related-party |
| Compensation disclosure (metrics/weights) | Y, but individual target weights are limited | FY25 Form 20-F, Item 6A–C; Note 28(b) | Incentive alignment |
| Beneficial ownership table | Y | FY25 Form 20-F, Item 7A, pp.202–203 | Skin in the game, control |
| Insider-transaction data (buys/sells) | Y | CIQ `Insider Trading`, Form 4 through 2026-08-26 | Conviction signal |
| Board composition / independence | Y | FY25 Form 20-F, Item 6A, pp.187–190; CIQ Board Members | Board quality, entrenchment |
| Related-party disclosure | Y | FY25 Form 20-F, Item 7B p.204 and Note 28 pp.F-76–F-77 | Value leakage |
| Control structure (dual-class / blocs) | Y | FY25 Form 20-F, Item 7A pp.202–203; Item 16G | Minority-shareholder rights |
| Prior shareholder letters / guidance | N for letters; Y for five-year transcripts | Transcript archive, FY21–Q2 2026 | Promise-vs-delivery |
| M&A / buyback / dividend history | Y | CIQ Corporate Timeline; FY25 Form 20-F Item 8A | Capital-allocation scorecard |
| Management tenure / turnover | Y | FY25 Form 20-F Item 6A; 2026-06-01/08-13 CFO transition disclosures | Stability and competence |
| Transcripts | Y | FY21–Q2 2026 transcript archive | Candor and tone |
| Auditor's report + annexures | Y for IFRS/PCAOB audit and Q2 review; India-specific CARO not applicable | FY25 Form 20-F audit report; Q2 2026 interim review | Audit quality (08) |
| Auditor-fee disclosure (audit vs non-audit) | Y | FY25 Form 20-F, Item 16C p.241 | Auditor independence (08) |
| Secretarial audit report (India: MR-3) | N/A — Cayman issuer / SEC FPI | N/A | Compliance assurance (08) |
| Related-party NOTE with counterparties + amounts | Y, with unnamed director-counterparty limitation | FY25 Form 20-F, Note 28 | RPT quantification (09) |
| Contingent-liabilities & commitments note | Y | FY25 Form 20-F, Note 25, pp.F-74–F-76; Note 31 | Off-P&L exposure (10) |
| ≥2 consecutive annual financials | Y — FY21–FY25 | Five annual 20-Fs | Beneish/Dechow forensic battery (11) |
| Shareholding-pattern history (quarters, pledge column) | Y for ownership history; pledge column not applicable to the FPI format | CIQ Ownership History | Ownership trend + pledge (04) |
| AGM/EGM voting results (scrutinizer reports) | Partial — AGM event/call, but itemised voting results not in pool | 2026-08-06 AGM event/call | Minority dissent (05) |
| Exchange announcements history (fines, Reg 30 events) | Partial — material 6-K timeline, no dedicated enforcement export | CIQ Corporate Timeline; 6-Ks | Compliance hygiene (12) |
| Rating-agency reports / actions | Y | CIQ S&P Global Ratings export | Rating conduct (12) |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| `business-model/11_capital-allocation-governance.md` | Y |
| `business-model/01_disqualifier-scan.md` | Y |
| `business-model/12_red-flags-sweep.md` | Y |
| `business-model/02_business-identity.md` | Y |
| `earnings/06_earnings-quality.md` | Y |
| `earnings/04_guidance-consensus.md` | Y |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure | N | 03, 99 | No cap |
| No ownership / insider-transaction data | N | 04, 99 | No cap |
| No board disclosure | N | 05, 99 | No cap |
| No multi-year history | N | 02 | No cap |
| No transcripts / prior letters | N — transcripts are comprehensive; discrete letters absent | 01, 06 | No hard cap; label letter-specific assessment as unavailable |
| No related-party note | N | 09, 99 | No cap |
| No contingent-liability note | N | 10, 99 | No cap |
| No auditor-fee / audit-detail disclosure | N | 08, 99 | No cap |
| Under 2 years of financials | N | 11, 99 | No cap |
| Web/database sweep unavailable this run | N at triage; later agents must log their actual sweep coverage | 07, 12, 99 | Apply only if the later sweep cannot run |
| No company website (D-1 unreachable), other discovery sources available | N — `nubank.com.br` / investor URL supplied in pool | 07 | No cap |
| Discovery loop cannot run at all | N | 07, 99 | No cap |

### 5E. Person & Entity Register (feeds 07 — Hard Rule)

#### 5E.1 Person Register

| # | Name | Identifier (DIN / registry ID, if disclosed) | Role | Category | Source (filing + section) |
|---:|---|---|---|---|---|
| 1 | David Vélez Osorno | not in pool | Founder, Chairman and CEO | Director / Promoter individual / KMP | FY25 Form 20-F, Item 6A pp.187–188; Item 7A pp.202–203 |
| 2 | Anita Mary Sands | not in pool | Lead Independent Director | Director | FY25 Form 20-F, Item 6A pp.187–188 |
| 3 | David Alexandre Marcus | not in pool | Independent Director; Compensation and People Committee | Director | FY25 Form 20-F, Item 6A pp.187–189 |
| 4 | Douglas Mauro Leone | not in pool | Independent Director; Compensation and People Committee | Director | FY25 Form 20-F, Item 6A pp.187–189 |
| 5 | Diego Piacentini | not in pool | Independent Director | Director | FY25 Form 20-F, Item 6A p.187 |
| 6 | Jacqueline Dawn Reses | not in pool | Independent Director; Chair, Compensation and People Committee | Director | FY25 Form 20-F, Item 6A pp.187–189 |
| 7 | Luis Alberto Moreno Mejía | not in pool | Independent Director; Compensation and People Committee | Director | FY25 Form 20-F, Item 6A pp.187–190 |
| 8 | Rogério Paulo Calderón Peres | not in pool | Independent Director; Chair, Audit and Risk Committee | Director | FY25 Form 20-F, Item 6A pp.187, 190, 200 |
| 9 | Thuan Quang Pham | not in pool | Independent Director; Audit and Risk Committee | Director | FY25 Form 20-F, Item 6A pp.187, 190, 200 |
| 10 | Cristina Helena Zingaretti Junqueira | not in pool | Co-founder; Chief Growth Officer and US CEO | KMP / Promoter individual | FY25 Form 20-F, Item 6A pp.190–191; Item 7A |
| 11 | Rob Livingston | not in pool | Chief Financial Officer from 2026-07-13 | KMP | Q2 2026 earnings call, pp.3, 6; CIQ Corporate Timeline, 2026-06-01 |
| 12 | Guilherme Marques do Lago | not in pool | Special Advisor; former CFO (succeeded 2026-07-13) | Former | Q2 2026 earnings call p.6; CIQ Corporate Timeline, 2026-06-01 |
| 13 | Eric Cristhopher Young | not in pool | Chief Technology Officer | KMP | FY25 Form 20-F, Item 6A pp.190–191 |
| 14 | Ethan Eismann | not in pool | Chief Design Officer | KMP | FY25 Form 20-F, Item 6A pp.190–191 |
| 15 | Henrique Camossa Saldanha Fragelli | not in pool | Chief Risk Officer | KMP | FY25 Form 20-F, Item 6A pp.190–191 |
| 16 | Livia Martines Chanes | not in pool | Brazil CEO / current profile describes Latin America CEO | KMP | FY25 Form 20-F, Item 6A pp.190–192; CIQ profile |
| 17 | Roberto de Oliveira Campos Neto | not in pool | Executive Vice-Chairman and Global Head of Public Policy | KMP / Director per current CIQ profile | FY25 Form 20-F, Item 6A pp.190–192; CIQ profile |
| 18 | Suzana Kubric | not in pool | Chief People Officer | KMP | FY25 Form 20-F, Item 6A pp.190–192 |
| 19 | Guilherme Souto | not in pool | Investor Relations Officer and Director of Market Intelligence | KMP | Q2 2026 earnings call p.3; CIQ profile |
| 20 | Carl Rivera | not in pool | Chief Product Officer | KMP | CIQ Public Company Profile, Key Professionals |
| 21 | Kim Farrell | not in pool | Global Marketing Director, appointed March 2026 | KMP / Former-if-not-current-not-proven | CIQ Corporate Timeline, 2026-03-10 |
| 22 | Mariel Lorena Reyes Milk | not in pool | spouse/entity-linked Class B holder | Promoter individual | FY25 Form 20-F, Item 7A footnote 2 p.203 |
| 23 | Rubens Fernandes Pereira | not in pool | co-controller of Junqueira-affiliated holders | Promoter individual | FY25 Form 20-F, Item 7A footnote 3 p.203 |

No company secretary is named in the pool; the Cayman/SEC FPI source regime does not establish that one exists. Agent 07 must retain that as an explicit roster gap, not infer a person.

#### 5E.2 Entity Register

| # | Entity | Registry identifier (if disclosed) | Relationship as disclosed | Source |
|---:|---|---|---|---|
| 1 | Nu Holdings Ltd. | Cayman issuer; exact company number not in pool | listed parent / filing-supplied | FY25 Form 20-F cover |
| 2 | Rua California Ltd. | not in pool | David Vélez-controlled shareholder vehicle | FY25 Form 20-F Item 7A, pp.202–203 |
| 3 | Cristina Helena Zingaretti Revocable Trust | not in pool | Junqueira-related holder | FY25 Form 20-F Item 7A fn.3 |
| 4 | CHJZ family trust | not in pool | Junqueira-related holder | FY25 Form 20-F Item 7A fn.3 |
| 5 | Rubens Fernandes Pereira Revocable Trust | not in pool | Junqueira-related holder | FY25 Form 20-F Item 7A fn.3 |
| 6 | Vesta WY LLC | not in pool | Junqueira-related holder | FY25 Form 20-F Item 7A fn.3 |
| 7 | Victory Lane Ltd. | not in pool | Junqueira-related holder; ownership disclaimed | FY25 Form 20-F Item 7A fn.3 |
| 8 | AMD WY LLC | not in pool | Junqueira/Pereira-controlled Class B holder | FY25 Form 20-F Item 7A fn.3 |
| 9 | Nu Pagamentos S.A. – Instituição de Pagamento | not in pool | group subsidiary | CIQ relationship graph / Form 20-F |
| 10 | Nu BN México, S.A. de C.V. | not in pool | group subsidiary | CIQ relationship graph / Form 20-F |
| 11 | Nu Colombia S.A. | not in pool | group subsidiary | CIQ relationship graph / Form 20-F |
| 12 | Nu Asset Management Ltda. | not in pool | group subsidiary | CIQ Public Company Profile |
| 13 | Banco Porto Real de Investimentos S.A. | not in pool | pending acquisition; Central Bank approval condition | CIQ Corporate Timeline, 2026-07-20 |
| 14 | Cognitect, Inc. | not in pool | group subsidiary / investment identified by CIQ profile | CIQ Public Company Profile |
| 15 | Circle Internet Group, Inc. | NYSE:CRCL | customer-side relationship with Nu Pagamentos | CIQ relationships, `Customers`, supplier-side disclosure |
| 16 | Amazon Web Services, Inc. | not in pool | third-party supplier | CIQ relationships, `Suppliers`, Nu 2026 Form 20-F source reference |
| 17 | Edenred SE | ENXTPA:EDEN | third-party supplier | CIQ relationships, `Suppliers` |
| 18 | MasterCard International Incorporated | not in pool | third-party licensor/supplier | CIQ relationships, `Suppliers` |
| 19 | Wise Group plc | LSE:WISE | third-party supplier | CIQ relationships, `Suppliers` |
| 20 | United States International Development Finance Corporation | not in pool | third-party creditor / Nu Colombia facility | CIQ relationships, `Suppliers`; FY25 Form 20-F Note 24 |

The relationship graph is a tier-5 vendor export, not a filing. Its stated scope is only recently disclosed customers/suppliers in the last two years, including current subsidiaries. The group nodes in it are not treated as arm’s-length counterparties; third-party relationships are leads for agent 09, not a complete supplier/customer base.

#### 5E.3 Company identity & lineage anchors

| Anchor | Value | Source |
|---|---|---|
| Registry identifier (CIN / company number / CIK) | not in pool | FY25 Form 20-F cover reviewed |
| Incorporation date | not in pool | FY25 Form 20-F cover reviewed |
| Any founding year the company claims | 2013 | CIQ Public Company Profile; FY25 Form 20-F director biography |
| Former names | not in pool for Nu Holdings Ltd.; Banco Porto Real predecessor name is separately disclosed | CIQ Public Company Profile |
| Company website URL | `nubank.com.br`; investor site `www.investidores.nu/en/` | CIQ Public Company Profile; FY25 Form 20-F Item 16B/16C |
| Principal brand / product names | Nubank, Nu, Nubank+, Ultravioleta, NuCel, NuTravel, NuCrypto | CIQ Public Company Profile; Q2 2026 call |
| Registered-office address | Campbells Corporate Services Limited, Floor 4, Willow House, Cricket Square, Grand Cayman KY1-9010; management address Rua Capote Valente 39, Pinheiros, São Paulo | FY25 Form 20-F, Item 6A pp.187–190; CIQ profile |

No claimed founding year preceding an identified incorporation date is established from the pool. This is not proof that no predecessor exists; agent 07 should run the ordinary D-2 previous-name test.

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | NYSE:NU, CIQ Public Company Profile; FY25 Form 20-F cover |
| Exchange | NYSE | CIQ Public Company Profile |
| Filing regime | SEC foreign private issuer; Cayman-incorporated parent, Brazilian operating centre | FY25 Form 20-F; Item 16G foreign-private-issuer/controlled-company discussion |
| Sector | Diversified banks / digital banking platform | CIQ Public Company Profile |
| Sector-specific governance overlay required? | Y — banks / financial institutions: capital, risk, regulatory and related-party-lending lenses; do not use operating-company CFO/PAT shorthand | FY25 Form 20-F banking-regulation disclosures; CIQ classification |
| Document language(s) | English; June 2026 interim review contains English and Portuguese auditor-language columns | FY25 Form 20-F; Q2 2026 Interim Financial Statements |

## 5B. Source Coverage Matrix

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---:|---:|---|---|
| Board composition | FY25 Form 20-F Item 6A | FY25 / updated CIQ current | 5 | N | CIQ Board Members |
| Compensation | FY25 Form 20-F Item 6B; Note 28(b) | FY25 | 4 | N — individual weights limited | AGM materials / issuer remuneration detail |
| Ownership | FY25 Form 20-F Item 7A | 2025-12-31 / 2026-03-01 share base | 5 | N | CIQ Ownership Detailed/History |
| Insider trades | CIQ Insider Trading / Form 4 | through 2026-08-26 | 4 | N | SEC Form 4 originals |
| Related-party transactions | FY25 Form 20-F Note 28 and Item 7B | FY25 | 5 | N | audit committee RPT approvals |
| Auditor report | FY25 Form 20-F; Q2 interim review | FY25 / H1 2026 | 5 | N | CIQ Auditors |
| Secretarial / compliance report | not applicable under regime | N/A | 5 | N/A | SEC/NYSE/Brazilian regulator releases |
| AGM voting | AGM event/call only | 2026-08-06 | 2 | Y — itemised outcomes absent | company/SEC voting results |
| Capital-allocation history | 20-Fs, timeline and CIQ financial exports | FY21–2026 | 5 | N | business-model/11 |
| Legal / regulatory cases | annual filing ordinary-course disclosure; no separate legal database sweep yet | FY25 | 3 | Partial | Agent 12 regulator/court sweep |

## 5C. Data Freshness

| Source | Period | As-of Date | Age | Stale? | Impact |
|---|---|---|---:|---|---|
| FY25 Form 20-F | FY ended 2025-12-31 | 2026-04-08 | 4.7 months | No | Primary governance, ownership and audit base |
| Q2 2026 interim statements / 6-K | H1 ended 2026-06-30 | 2026-08-13/14 | 0.5 months | No | Current financial and audit-review context |
| Q2 2026 earnings call | Q2 2026 | 2026-08-13 | 0.5 months | No | CFO transition and current candor source |
| Insider trade export | Form 4 events | 2026-08-26 | 0.1 months | No | Current insider behaviour |
| CIQ ownership summary | top-holder dates to 2026-08-25 | 2026-08-29 export | 0.2 months | No | Current ownership cross-check |
| Corporate timeline | last six months | 2026-08-13 latest event | 0.6 months | No | Management-change and capital-action context |
| Prior 20-F set | FY21–FY24 | 2022–2025 filings | 16–52 months | Not stale for historical scorecard | Supports multi-year tests only |

`source_manifest.csv` export: pending shared-pipeline extraction from this triage’s Source Coverage Matrix and Data Freshness tables. It is not an additional agent-write target under this task.

## 6. Sufficiency Verdict

- **Verdict:** Sufficient.
- **Reason:** The pool contains the foreign-private-issuer equivalents of proxy/compensation, ownership and insider information, board and related-party disclosure, audited annual filings for five consecutive years, a current audited interim review, and a five-year transcript record. The lack of a US domestic DEF 14A is not a gap because Nu is a SEC foreign private issuer and the relevant disclosures appear in its Form 20-F.
- **Specialists that can run:** management track record; capital allocation; incentives; ownership; board; candor; people dossiers; audit quality; RPT/group forensics; contingent liabilities; accounting forensics; regulatory/legal.
- **Hard disqualifier already flagged by business-model/01_disqualifier-scan?** N — the completed scan records no trigger across its eight tests and no verdict lock. It also records missing pledged-share and RPT-flow numerators as “not assessable,” not as zero. [business-model/01_disqualifier-scan, §§1–3]
- **Active partial-data caps:** None at the module level. Agent 05 should mark AGM voting-result analysis Not Available because itemised results are absent. Agent 03 should label individual incentive weights as not fully disclosed where the 20-F only describes the framework. Agents 07 and 12 must apply their coverage caps only if their required external registry/court/regulator sweeps actually fail or are unreachable.
- **Critical missing items:** Itemised 2026 AGM voting results and a discrete remuneration report with individual metric weights/targets; neither prevents the dedicated module from running.
- **Single highest-value missing document:** 2026 AGM voting results / formal voting tabulation.

**Key current evidence for later agents:** David Vélez beneficially owned 88.3% of Class B shares and 74.4% of total voting power at the 20-F ownership cut-off; Class B carries 20 votes per share and the shareholder agreement provides director-nomination and consent rights at stated voting thresholds [FY25 Form 20-F, Item 7A pp.202–203; Item 6A pp.192–193]. This is a control-structure fact, not a governance verdict. CFO Rob Livingston succeeded Guilherme Lago on 2026-07-13; Lago remains a special adviser [Q2 2026 earnings call, p.6; CIQ Corporate Timeline, 2026-06-01].

**Vendor sidecar reconciliation:** `ciq_facts.json` reports `insider_net_activity` of +4,015,012 shares across 14 acquisitions and 11 dispositions through 2026-08-26, while open-market-only activity is −592,707 shares across four sales; the separate CIQ trade export supports the event basis. These are tier-5 vendor reads, not filing facts. Later agents must distinguish RSU/other acquisitions from open-market trading and cite the vendor export when using them.
