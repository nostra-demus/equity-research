# Solvency Data Triage — TTWO

**Company:** Take-Two Interactive Software, Inc. (NasdaqGS:TTWO) · **Date:** 2026-11-19 · **Reporting currency:** USD (millions unless stated)

**Evidence binding (MODULE_PIPELINE Step 1.5).** The complete frozen quartet was present, so this agent ran in frozen-evidence mode: `NOSTRA_FROZEN_EVIDENCE_ROOT`, `NOSTRA_FROZEN_POOL_DATA_PATH`, `NOSTRA_FROZEN_POOL_OUT_DIR`, `NOSTRA_FROZEN_POOL_GENERATION` all resolved. `DATA_PATH` = the frozen evidence root only; `GENERATION_ROOT` = `.extract-generations/0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d`. Every manifest `extract` reference carries exactly that prefix (checked: 0 prefix violations across 30 sources and 62 tabs). `extract_pool.py` was NOT run, no live `data/TTWO/` read was attempted, and `analyses/TTWO_2026-11-19/_pool_extracts/` was not opened. `data/TTWO/` below is a citation label only.

**Pool totals from the exact generation manifest:** 30 sources · 19 workbooks · 62 tabs · 73 extracts written · **0 failures**. No source carries `status` of `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer`.

**Numeric-reading check status — UNCHECKED, not verified clean.** All 30 manifest sources carry **no `numeric_reading_check` field at all**. Absence of a warning is therefore not evidence of accurate numeric extraction; the check simply did not run on this generation. No labelled extractor annotation or warning token appears anywhere in `GENERATION_ROOT/corpus.txt` (searched for annotation/warning markers: none found), so there is **no specific flagged amount** to quarantine and nothing to mark "not proven" on reading-warning grounds. The duty this transfers downstream: every material solvency amount (debt principal by instrument, cash, maturities by year, interest expense, CFO/capex, lease liabilities, revolver availability, covenant threshold) must be read directly from the frozen filing extract that reports it — `10K_2025_26_0001628280-26-037434.txt`, `10Q_2Q_0001628280-26-072254.txt`, `10K_2024_25_0001628280-25-026694.txt` — and the Capital IQ workbook tabs must be used as a vendor **read to reconcile against**, never as the authority for a filing's own number (§5). All four filings extracted as native PDF text (no OCR path, 274 / 190 / 50 / 93-page native coverage), so a direct verification read is available inside the frozen capability for every affected amount. This status caps nothing on its own and does not change the sufficiency verdict; it is carried forward as a standing verification obligation for agents 01–06 and 99.

**Entity-scope note.** `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` is in the pool but the manifest `entities` block resolves it to **Alphabet Inc**, not Take-Two. It is a wrong-entity export with zero TTWO solvency content. There is no TTWO Key Developments export, so TTWO material-event / rating-action news flow is absent from the pool (noted as a limitation, not a sufficiency gap for this module).

**"Last Modified" column.** Every file in a frozen evidence snapshot carries the same snapshot copy timestamp (2026-11-20 11:26), which is the freeze time, not a period. Per fix F23 the modified date is therefore recorded as non-informative throughout, and **every period below is parsed from INSIDE the document** ("For the fiscal year ended…", "For the quarterly period ended…", the vendor tab's own `Source:` / `As of` / period-column headers).

---

## 1. File Inventory

73 rows = 11 standalone documents + 62 workbook tabs (each tab from `GENERATION_ROOT/manifest.json` listed as its own row; no workbook left as a single opaque row).

### 1.1 Standalone documents (11)

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| `10K_2025_26_0001628280-26-037434.pdf` | Annual filing (10-K, US GAAP, audited) | **FY ended March 31, 2026** (stated p.1; filed May-22-2026 per CIQ) | n/a (frozen snapshot) | **High** — Note 11 debt (Senior Notes, Credit Agreement, Convertible Notes), borrowing maturities table, lease note, Note 14 Commitments & Contingencies, cash flow statement, receivables facility |
| `10K_2024_25_0001628280-25-026694.pdf` | Annual filing (10-K) **+ credit-agreement and receivables-agreement exhibits in full text** | **FY ended March 31, 2025** | n/a (frozen snapshot) | **High** — carries Exhibit 10.41 (Amendment No. 3 to the 2022 Credit Agreement, dated May 19, 2025) including **Section 6.05 Financial Covenant** with the numeric maximum-Leverage-Ratio schedule, the `Leverage Ratio` / `Consolidated Total Indebtedness` / `Consolidated Adjusted EBITDA` definitions; and Exhibit 10.42 Receivables Purchase Agreement |
| `10Q_2Q_0001628280-26-072254.pdf` | Quarterly filing (10-Q) | **Quarter ended September 30, 2026** (filed Nov-09-2026) | n/a (frozen snapshot) | **High** — most recent balance sheet, debt note, maturities-by-fiscal-year table as of Sep-30-2026, revolver availability, condensed cash flow statement |
| `10Q_1Q_0001628280-26-054870.pdf` | Quarterly filing (10-Q) | **Quarter ended June 30, 2026** | n/a (frozen snapshot) | High — interim debt/liquidity bridge between FY26 year-end and Q2 |
| `TTWO 2Q27 Earnings Release FINAL.pdf` | Earnings release | Q2 FY2027 (quarter ended Sep-30-2026) | n/a (frozen snapshot) | Medium — cash, debt, cash-flow summary; management liquidity commentary |
| `TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf` | Earnings release | Q1 FY2027 (quarter ended Jun-30-2026), dated 2026-08-06 | n/a (frozen snapshot) | Medium |
| `Take-Two_Interactive_2Q FY27 FINAL.pdf` | Investor presentation / deck | Q2 FY2027 | n/a (frozen snapshot) | Low–Medium — management framing only; filing governs (MODULE_RULES source hierarchy) |
| `Take-Two_Interactive_1Q FY27 FINAL.pdf` | Investor presentation / deck | Q1 FY2027 | n/a (frozen snapshot) | Low–Medium |
| `Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf` | Transcript | Q2 FY2027 call, 2026-11-09 | n/a (frozen snapshot) | Medium — management commentary on cash, debt, refi, capital allocation |
| `Take-Two Interactive Software, Inc., Q1 2027 Earnings Call, Aug 07, 2026.rtf` | Transcript | Q1 FY2027 call, 2026-08-07 | n/a (frozen snapshot) | Medium |
| `Take Two Interactive Software Inc NasdaqGS TTWO Public Company Profile.rtf` | Vendor company profile (CIQ) | Quote last updated Nov-18-2026; **LTM as of Sep-30-2026** | n/a (frozen snapshot) | Medium — subsidiary list (Zynga, Gearbox, Platygobian) for HoldCo/OpCo mapping; capitalisation summary |

### 1.2 Workbook tabs (62) — each tab its own row

| Parent workbook · Tab | Rows × Cols | Type | Period / As-of (from inside) | Last Modified | Solvency Relevance |
|---|---|---|---|---|---|
| `TTWO Financials_Quarterly.xls` · Balance-Sheet | 98×43 | Vendor balance sheet (quarterly) | columns to **Sep-30-2026**; `Source: Q2 2027 filed Nov-09-2026` | n/a (frozen snapshot) | **High** |
| `TTWO Financials_Quarterly.xls` · Capital-Structure-Details | 38×10 | Debt-by-instrument export (principal, coupon, floating flag, maturity, seniority, secured, convertible) | as-reported blocks; latest `Source: Q2 2027 filed Nov-09-2026` | n/a (frozen snapshot) | **High** |
| `TTWO Financials_Quarterly.xls` · Capital-Structure-Summary | 74×85 | Capital-structure summary (debt/equity mix by quarter) | to Sep-30-2026 | n/a (frozen snapshot) | **High** |
| `TTWO Financials_Quarterly.xls` · Cash-Flow | 73×43 | Cash flow statement (quarterly + LTM) | to **Sep-30-2026**, LTM column | n/a (frozen snapshot) | **High** |
| `TTWO Financials_Quarterly.xls` · Income-Statement | 116×43 | Income statement incl. EBITDA, interest expense | to Sep-30-2026 / LTM | n/a (frozen snapshot) | **High** |
| `TTWO Financials_Quarterly.xls` · Ratios | 161×43 | Leverage / coverage / liquidity ratios | to Sep-30-2026 | n/a (frozen snapshot) | **High** |
| `TTWO Financials_Quarterly.xls` · Historical-Capitalization | 39×43 | Historical capitalisation (debt, cash, equity, TEV) | to Sep-30-2026 | n/a (frozen snapshot) | High |
| `TTWO Financials_Quarterly.xls` · Key-Stats | 91×13 | Key statistics | to Sep-30-2026 | n/a (frozen snapshot) | Medium |
| `TTWO Financials_Quarterly.xls` · Supplemental | 35×43 | Supplemental items | to Sep-30-2026 | n/a (frozen snapshot) | Medium |
| `TTWO Financials_Quarterly.xls` · Segments | 72×43 | Segment & geographic revenue | to Sep-30-2026 | n/a (frozen snapshot) | Low–Medium |
| `TTWO Financials_Quarterly.xls` · Multiples | 91×42 | Trading multiples | to Nov-2026 closes | n/a (frozen snapshot) | Low (valuation module) |
| `TTWO Financials_Quarterly.xls` · Pension-OPEB | 15×6 | Pension/OPEB grid — **header only, no DB data rows** | n/a | n/a (frozen snapshot) | Low (no defined-benefit plan — see §3) |
| `TTWO Financials_Quarterly.xls` · Industry-Specific | 15×6 | Industry-specific grid (empty) | n/a | n/a (frozen snapshot) | Low |
| `TTWO Financials_Annual.xls` · Balance-Sheet | 97×12 | Vendor balance sheet (annual) | FY2017→**FY Mar-31-2026** | n/a (frozen snapshot) | **High** |
| `TTWO Financials_Annual.xls` · Capital-Structure-Details | 38×10 | Debt-by-instrument export | `Source: A 2026 filed May-22-2026`; FY2026 + FY2025 as-reported blocks | n/a (frozen snapshot) | **High** |
| `TTWO Financials_Annual.xls` · Capital-Structure-Summary | 99×23 | Capital-structure summary | to FY Mar-31-2026 | n/a (frozen snapshot) | **High** |
| `TTWO Financials_Annual.xls` · Cash-Flow | 74×12 | Cash flow statement (annual + LTM) | FY2017→Mar-31-2026 + LTM | n/a (frozen snapshot) | **High** |
| `TTWO Financials_Annual.xls` · Income-Statement | 119×12 | Income statement incl. EBITDA, interest | FY2017→Mar-31-2026 | n/a (frozen snapshot) | **High** |
| `TTWO Financials_Annual.xls` · Ratios | 161×12 | Leverage / coverage / liquidity ratios | FY2017→Mar-31-2026 | n/a (frozen snapshot) | **High** |
| `TTWO Financials_Annual.xls` · Historical-Capitalization | 39×43 | Historical capitalisation | to Mar-31-2026 | n/a (frozen snapshot) | High |
| `TTWO Financials_Annual.xls` · Key-Stats | 91×13 | Key statistics | to Mar-31-2026 | n/a (frozen snapshot) | Medium |
| `TTWO Financials_Annual.xls` · Supplemental | 67×11 | Supplemental items | to Mar-31-2026 | n/a (frozen snapshot) | Medium |
| `TTWO Financials_Annual.xls` · Segments | 76×11 | Segment & geographic revenue | to Mar-31-2026 | n/a (frozen snapshot) | Low–Medium |
| `TTWO Financials_Annual.xls` · Multiples | 90×42 | Trading multiples | to Nov-2026 | n/a (frozen snapshot) | Low |
| `TTWO Financials_Annual.xls` · Pension-OPEB | 21×11 | Pension/OPEB grid — **header only, no DB data rows** | FY2017→FY2026 columns, no values | n/a (frozen snapshot) | Low (no DB plan) |
| `TTWO Financials_Annual.xls` · Industry-Specific | 15×6 | Industry-specific grid (empty) | n/a | n/a (frozen snapshot) | Low |
| `TTWO Credit Health Panel.xls` · Summary | 46×11 | Vendor credit-health scores + **S&P Foreign Currency LT rating indication (BBB)** across 25 industry peers | LTM period ending **2026-09-30**; financials updated 2026-11-10 | n/a (frozen snapshot) | **High** |
| `TTWO Credit Health Panel.xls` · Financials | 40×13 | Credit-panel financial inputs | LTM to Sep-30-2026 | n/a (frozen snapshot) | **High** |
| `TTWO Credit Health Panel.xls` · Solvency-Metrics-Charts | 18×19 | Solvency metric series | to Sep-30-2026 | n/a (frozen snapshot) | **High** |
| `TTWO Credit Health Panel.xls` · Liquidity-Metrics-Charts | 15×19 | Liquidity metric series | to Sep-30-2026 | n/a (frozen snapshot) | **High** |
| `TTWO Credit Health Panel.xls` · Operational-Metrics-Charts | 21×19 | Operational metric series | to Sep-30-2026 | n/a (frozen snapshot) | Medium |
| `TTWO Credit Health Panel.xls` · Disclaimer | 26×1 | Vendor disclaimer | n/a | n/a (frozen snapshot) | Low |
| `Company Comparable Analysis TTWO.xls` · Credit-Health-Panel | 48×10 | Peer credit-health comparison | as-of 2026-11-19 | n/a (frozen snapshot) | Medium |
| `Company Comparable Analysis TTWO.xls` · Financial-Data | 50×17 | Peer financial data; subject price USD 216.61, shares 187.2m | as-of **2026-11-19** | n/a (frozen snapshot) | Medium |
| `Company Comparable Analysis TTWO.xls` · Trading-Multiples | 50×9 | Peer multiples | as-of 2026-11-19 | n/a (frozen snapshot) | Low |
| `Company Comparable Analysis TTWO.xls` · Operating-Statistics | 50×13 | Peer operating statistics | as-of 2026-11-19 | n/a (frozen snapshot) | Low |
| `Company Comparable Analysis TTWO.xls` · Implied-Valuation | 69×9 | Implied valuation | as-of 2026-11-19 | n/a (frozen snapshot) | Low (valuation module) |
| `Company Comparable Analysis TTWO.xls` · Business-Description | 44×3 | Business descriptions | as-of 2026-11-19 | n/a (frozen snapshot) | Low |
| `Company Comparable Analysis TTWO.xls` · Valuation-Chart | 32×2 | Chart data | as-of 2026-11-19 | n/a (frozen snapshot) | Low |
| `Company Comparable Analysis TTWO.xls` · Disclaimer | 26×1 | Vendor disclaimer | n/a | n/a (frozen snapshot) | Low |
| `TTWO EstimatesReport.xls` · Consensus | 604×123 | Consensus estimates (incl. forward EBITDA / EPS) | FY2027+ estimates, as-of Nov-2026 | n/a (frozen snapshot) | Medium — forward EBITDA path for the stress test's reference case |
| `TTWO EstimatesReport.xls` · Guidance | 198×117 | Company guidance history | to Q2 FY27 | n/a (frozen snapshot) | Medium |
| `TTWO EstimatesReport.xls` · Surprise | 311×113 | Estimate-vs-actual surprise history | FY2022→FY2026 | n/a (frozen snapshot) | Low–Medium |
| `TTWO EstimatesReport.xls` · Trends | 303×21 | Estimate trends | to Nov-2026 | n/a (frozen snapshot) | Low |
| `TTWO EstimatesReport.xls` · Revisions | 467×21 | Estimate revision breadth | last month to Nov-2026 | n/a (frozen snapshot) | Low |
| `TTWO EstimatesReport.xls` · Recent-Changes | 265×10 | Recent broker changes | to Nov-2026 | n/a (frozen snapshot) | Low |
| `TTWO EstimatesReport.xls` · Multiples | 34×7 | Forward multiples | as-of Nov-2026 | n/a (frozen snapshot) | Low |
| `TTWO Public Ownership Insider Trading.xls` · Insider-Trading | 5058×11 | Insider transaction history | full history to 2026-10-05 | n/a (frozen snapshot) | Low (governance module) |
| `TTWO Public Ownership History.xls` · History | 1835×6 | Institutional ownership history | to **2026-09-30** | n/a (frozen snapshot) | Low |
| `TTWO Investment Analysis Direct Investments.xls` · Direct-Investments | 173×21 | Company's direct investments / M&A history | full history | n/a (frozen snapshot) | Low–Medium (acquisition-driven leverage context) |
| `TTWO Investment Analysis Co Investors.xls` · Co-Investors | 90×3 | Co-investor list | full history | n/a (frozen snapshot) | Low |
| `TTWO Board Members.xls` · Board-Members | 28×25 | Board roster | current | n/a (frozen snapshot) | Low |
| `TTWO Professionals.xls` · Professionals | 24×24 | Management roster | current | n/a (frozen snapshot) | Low |
| `TTWO Auditors.xls` · Auditors | 75×6 | Auditor history | full history | n/a (frozen snapshot) | Low–Medium (audit continuity) |
| `TTWO Customers.xls` · Customers | 30×8 | Disclosed customers | recently disclosed only | n/a (frozen snapshot) | Low |
| `TTWO Suppliers.xls` · Suppliers | 28×8 | Disclosed suppliers | recently disclosed only | n/a (frozen snapshot) | Low |
| `TTWO Strategic Alliances.xls` · Strategic-Alliances | 22×7 | Alliances | full history | n/a (frozen snapshot) | Low |
| `TTWO Events Calendar.xls` · Events-Calendar | 16×3 | Event calendar | **Timeframe: November 2026** (earnings release/call 2026-11-09) | n/a (frozen snapshot) | Low |
| `Short_Interest_Charting Excel Export Nov-19-2026 2_50 AM.xls` · Chart-1-with-Data | 284×2 | Short-interest series | to **2026-11-19** | n/a (frozen snapshot) | Low |
| `Short_Interest_Charting ….xls` · Attributions | 45×1 | Vendor attributions | n/a | n/a (frozen snapshot) | Low |
| `Take-Two_Interactive_Software_Inc_-_Form_DEF_14A(Jul-27-2026).xls` · No-Data | 4×4 | Proxy export — **empty stub**: extraction `status: ok`, content is literally "This filing has no tabular data to export." **Not** an extraction failure and **not** a Drive pointer stub; it simply carries no proxy content | Proxy dated Jul-27-2026 | n/a (frozen snapshot) | Low (no solvency content; proxy substance absent from pool) |
| `Alphabet Inc NasdaqGS GOOGL Key Developments.xls` · Key-Developments | 520×7 | **Wrong entity** — manifest `entities` resolves to Alphabet Inc, not Take-Two | n/a for TTWO | n/a (frozen snapshot) | **None** — excluded from all TTWO solvency work |

### 1.3 External data

**None.** There is no `external/` folder under the frozen `DATA_PATH`, and no manifest row carries `external: true` or a `provenance` object. No `## 1A. External Data` section is therefore required, and no external document influenced the sufficiency verdict (there were none to influence it).

---

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | `10K_2025_26_0001628280-26-037434.pdf` | FY ended **2026-03-31** (filed 2026-05-22) | ~7.6 from period end (~6.0 from filing) |
| Quarterly filing | `10Q_2Q_0001628280-26-072254.pdf` | Quarter ended **2026-09-30** (filed 2026-11-09) | ~1.6 from period end (~0.3 from filing) |
| Debt / capital-structure export | `TTWO Financials_Quarterly.xls` · Capital-Structure-Details + Capital-Structure-Summary | as-reported, `Source: Q2 2027 filed Nov-09-2026` | ~0.3 |
| Fixed-income / maturities export | `TTWO Financials_Annual.xls` · Capital-Structure-Details (principal × coupon × maturity × seniority × secured × convertible, per instrument) | FY2026 (Mar-31-2026) as-reported block; filings carry the Sep-30-2026 maturity table | ~7.6 (vendor block) / ~1.6 (filing table) |
| Cash flow statement | `10K_2025_26…pdf` (Consolidated Statements of Cash Flows) + `10Q_2Q…pdf` (condensed, six months to Sep-30-2026) + CIQ Annual/Quarterly Cash-Flow tabs (LTM to Sep-30-2026) | FY2026 audited; H1 FY27 unaudited; LTM Sep-30-2026 | ~1.6 (latest) |
| Covenant / credit-agreement disclosure | `10K_2024_25_0001628280-25-026694.pdf`, **Exhibit 10.41 — Amendment No. 3 to the 2022 Credit Agreement, dated 2025-05-19, Section 6.05 Financial Covenant** (full agreement text, with the `Leverage Ratio`, `Consolidated Total Indebtedness` and `Consolidated Adjusted EBITDA` definitions) | Agreement as amended 2025-05-19; covenant measured quarterly | ~18 from the amendment date (the governing agreement; no later amendment appears in the pool) |
| Credit rating report | **No rating-agency rationale in the pool.** Nearest: `TTWO Credit Health Panel.xls` · Summary — CIQ-reported **S&P Foreign Currency LT = BBB** (vendor export, tier-5, not a rating action or outlook) | LTM period ending 2026-09-30; financials updated 2026-11-10 | ~1.6 |

---

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | **Y** | `10Q_2Q_0001628280-26-072254.pdf` (as of 2026-09-30); CIQ Financials_Quarterly · Balance-Sheet (to Sep-30-2026) | Debt, cash, equity base |
| Debt note (amounts by type) | **Y** | FY26 10-K Note 11 — $2,500.0 Senior Notes outstanding at 2026-03-31 plus $29.4 of 2026 Convertible Notes (Zynga) and a $1,000.0 revolver with no borrowings; `10Q_2Q` confirms $2,500.0 Senior Notes at 2026-09-30; CIQ Capital-Structure-Details gives each instrument's principal, coupon, seniority, secured flag, convertible flag | The debt stack and seniority |
| Maturity schedule | **Y** | `10Q_2Q`, "aggregate amount of maturities of our borrowings, as of September 30, 2026" — FY2027 (remaining) 29.4 · FY2028 1,400.0 · FY2029 — · FY2030 300.0 · FY2031 — · Thereafter 800.0 · Total 2,529.4; same table in FY26 10-K as of 2026-03-31; per-instrument maturity dates in CIQ Capital-Structure-Details (nearest 2026-12-15) | The maturity wall and refinancing exposure |
| Cash flow statement | **Y** | FY26 10-K Consolidated Statements of Cash Flows (FY2024–FY2026); `10Q_2Q` condensed statements (six months to 2026-09-30); CIQ Cash-Flow tabs with LTM-to-Sep-30-2026 column | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | **Y** | FY26 10-K and `10Q_2Q`: $1,000.0 **committed** unsecured five-year revolver (Amendment No. 3 raised it from $750.0), maturity extended to 2030-05-19 with two one-year extension options; **available borrowings $997.9 at 2026-09-30** ($997.7 at 2026-03-31), outstanding letters of credit $2.1 ($2.3); no borrowings outstanding; separate **uncommitted** incremental capacity (greater of $250.0 and 35.0% of Consolidated Adjusted EBITDA) — to be excluded from headline liquidity | True liquidity beyond cash |
| Interest expense detail | **Y** | FY26 10-K: interest expense $(151.4) FY2026 vs $(167.3) FY2025; "Interest and other, net" $(93.6) FY2026 / $(100.2) FY2025 / $(112.2) FY2024; per-instrument coupons (3.700%, 4.950%, 5.400%, 4.000%, 5.600%, 0.000% convertible) in the debt note and CIQ Capital-Structure-Details; `10Q_2Q` quarterly interest tables | Coverage ratios |
| Covenant disclosure | **Y** | FY25 10-K Exhibit 10.41 §6.05: the Borrower "will not permit the Leverage Ratio" to exceed a dated schedule — **3.75:1.00 for quarters ending December 31, 2025 and thereafter** (earlier steps 4.75x Jun-2024, 5.75x Sep-2024, 5.50x Dec-2024, 4.25x Mar/Jun-2025, 4.00x Sep-2025), rising to **4.25:1.00 for four quarter-ends following a Qualified Acquisition** then back to 3.75x for at least two quarters; measured quarterly; FY26 10-K confirms "a maximum leverage ratio covenant" still in force plus cross-defaults to material indebtedness and customary negative covenants | Headroom to a breach |
| Lease detail (operating/finance) | **Y** | FY26 10-K lease note: total lease liabilities **$440.3**, future undiscounted payments $548.5 (FY27 92.9 · FY28 86.0 · FY29 84.0 · FY30 74.6 · FY31 64.4 · thereafter 146.6), less imputed interest (108.2); weighted-average remaining term 7.14 years, discount rate 4.74%; one $2.4 facility lease not yet commenced | Debt-like obligations |
| Pension / OPEB funded status | **N (not applicable — not a gap)** | FY26 10-K: US 401(k) retirement savings plan and non-US **defined-contribution** plans only; employer contributions expensed. CIQ Pension-OPEB tabs (annual 21×11, quarterly 15×6) are header-only with no defined-benefit data rows | Off-balance-sheet obligation — none exists here, so no funded-status deficit to add to debt |
| Commitments & contingencies note | **Y** | FY26 10-K **Note 14**: minimum contractual obligations $740.1 total (software development & licensing 175.8 · marketing 206.9 · purchase obligations 357.4; FY27 tranche 323.7); legal proceedings described as routine with amounts accrued and excess losses stated as not material (qualitative — no quantified maximum litigation exposure); **Receivables Purchase Agreement** (FY25 10-K Exhibit 10.42, dated 2025-05-19) with receivables sold without recourse and **no receivables sold in FY2026 or in the six months to 2026-09-30** | Guarantees, LCs, litigation, tax claims |
| Credit ratings | **Y (vendor-sourced only)** | `TTWO Credit Health Panel.xls` · Summary — CIQ-reported S&P Foreign Currency LT **BBB**; CIQ relative credit-health scores (overall/operational/solvency/liquidity all "Bottom" quartile vs 25 interactive-entertainment peers, LTM to 2026-09-30). FY26 10-K confirms revolver pricing is **rating-determined** (0.000–0.625% over base rate / 1.000–1.625% over SOFR "determined by the Company's credit rating") | Refinancing access and cost — note no rating-agency rationale or outlook is in the pool, so 99 must not infer a rating action or trajectory |
| EBITDA base (for stress test) | **Y** | `GENERATION_ROOT/ciq_facts.json`: LTM EBITDA **$724.9m** (CIQ Income Statement, LTM 12 months Sep-30-2026); FY2026 EBITDA 788, with the full own-history series FY2017 149 → FY2021 757 → FY2025 380 → FY2026 788 for a mid-cycle read; forward consensus EBITDA in EstimatesReport · Consensus; `earnings/01_historical-financials.md` available as a cross-check | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | **Y** | Operating company — interactive entertainment publisher (CIQ primary industry "Interactive Home Entertainment"; FY26 10-K business section). **Not** a bank or insurer, so the Business Type Applicability Gate does **not** force an Insufficient verdict. HoldCo/OpCo element present: Zynga Inc. subsidiary debt (see next rows) | Selects the correct framework |
| Revolver terms + availability / borrowing base | **Y** | $1,000.0 committed, unsecured (not borrowing-base), matures 2030-05-19, two one-year extension options; **availability $997.9 at 2026-09-30** stated in the filing; pricing grid 0.000–0.625% over an alternate base rate (6.75% at 2026-03-31) or 1.000–1.625% over SOFR (~3.66% at 2026-03-31) | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | **Y** | FY25 10-K Exhibit 10.41 carries the full `Consolidated Adjusted EBITDA` definition (Consolidated Net Income plus specified addbacks, with deferred-revenue increases added back and decreases subtracted, acquired-entity pro-forma treatment, etc.) and the `Leverage Ratio` definition = Consolidated Total Indebtedness ÷ Consolidated Adjusted EBITDA for the trailing four quarters, where for §6.05 purposes **Consolidated Total Indebtedness is reduced by up to $1,000,000,000** of the specified netting amount | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | **Y** | FY26 10-K: the $29.4 of 2026 Convertible Notes are senior unsecured indebtedness **of Zynga**, "structurally senior to the indebtedness of the Company as to Zynga, its subsidiaries, and their respective assets", with a Take-Two guarantee ranking equally with Take-Two's other senior unsecured obligations; Senior Notes are Take-Two senior unsecured obligations; CIQ Public Company Profile lists the subsidiary set (Zynga, Gearbox, Platygobian) | Structural subordination and upstreaming |
| Hedging / swaps disclosure | **Y** | FY26 10-K: foreign-currency forward contracts (some not designated as hedges; FY2026 loss $5.5 recorded in Interest and other, net), hedging programme described as reducing but not eliminating FX movement; **no interest-rate swaps disclosed**, and CIQ Capital-Structure-Details shows every note as fixed-rate with the only floating-rate instrument being the undrawn revolver (`ciq_facts.json` debt_maturity_wall: "0 floating / 2,970 fixed") | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | **Y** | FY26 10-K: on a Change of Control Triggering Event each Senior Notes holder has a repurchase right; acceleration on 25% holder demand after an event of default, automatic on bankruptcy/insolvency; 2022 Credit Agreement events of default include **cross-defaults to material indebtedness** and material judgment defaults, subject to cure periods; revolver pricing is **rating-linked** | Hidden accelerants to distress |

---

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| `business-model/10_external-dependency.md` | **Y** (34.5 KB) |
| `business-model/11_capital-allocation-governance.md` | **Y** (27.5 KB) |
| `business-model/03_segment-map.md` | **Y** (20.8 KB) |
| `earnings/01_historical-financials.md` | **Y** (29.0 KB) |
| `earnings/06_earnings-quality.md` | **Y** (49.4 KB) |
| `earnings/03_margin-drivers.md` | **Y** (59.7 KB) |

All six declared cross-module inputs exist on the filesystem under `analyses/TTWO_2026-11-19/`. (Valuation is deliberately not an input to this module per MODULE_RULES; `management-governance/` and `competitive-intel/` folders also exist but are not inputs here.)

---

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | `10K_2025_26…pdf` cover page (SEC Form 10-K, Washington D.C.); CIQ Credit Health Panel · Summary lists TTWO country "United States" |
| Exchange | Nasdaq Global Select Market (NasdaqGS:TTWO) | CIQ Public Company Profile; CIQ tab headers "Take-Two Interactive Software, Inc. (NasdaqGS:TTWO)" |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **US SEC** — annual Form 10-K, quarterly Form 10-Q, material events on Form 8-K, proxy on DEF 14A | FY26 10-K cover ("Annual Report Pursuant to Section 13 or 15(d) of the Securities Exchange Act of 1934"); `10Q_2Q` cover ("For the quarterly period ended September 30, 2026"); FY26 10-K exhibit index references 8-K filings dated 4/14/2022, 4/14/2023, 6/12/2024 |
| Reporting standard (US GAAP / IFRS / Ind AS) | **US GAAP** — note the consequence for this module: operating leases are NOT in the debt line (unlike IFRS 16), so `01` must show the gross-debt view both excluding and including the $440.3 operating-lease liability and label which is which | FY26 10-K lease note (operating ROU asset / operating lease liabilities presented separately from borrowings); maturities-of-borrowings table totals 2,529.4 and excludes leases |
| Reporting currency (USD / INR / …) | **USD**, presented in millions ("Principal Due in Millions of the reported currency"; filing tables in $ millions) | FY26 10-K financial statements; `ciq_facts.json` `"currency": "USD"` |
| Document language(s) | **English** for all 30 sources (all four filings, both transcripts, both releases, both decks, all 19 workbooks). No non-English document in the pool, so CLAUDE.md §27's language provisions have nothing to apply to here and no language-based gap or score reduction is recorded | Direct read of each extract in `GENERATION_ROOT` |

Downstream agents therefore use the **US SEC** source map: the 10-K debt note and borrowings-maturity table, the 10-Q for the latest balance sheet and maturities, the credit-agreement exhibit for covenants, Note 14 for commitments and contingencies, and 8-K-equivalent material-event disclosure (none in the pool). State US GAAP and USD on every figure.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | **N** | 02, 06 | None — year-by-year schedule as of 2026-09-30 is in `10Q_2Q`, plus per-instrument maturity dates in CIQ Capital-Structure-Details |
| No covenant disclosure | **N** | 04, 06 | None — the numeric maximum-Leverage-Ratio schedule and the full covenant-EBITDA definition are in the pool (FY25 10-K Exhibit 10.41 §6.05). See the limitation note below: the company does not publish its computed Leverage Ratio or a compliance certificate, so `04` must compute headroom itself from the agreement's own definitions and label that calculation |
| No cash flow statement | **N** | 03, 04, 06 | None — audited FY2026 statement, H1 FY27 condensed statement, and CIQ LTM-to-Sep-30-2026 column all present |
| No undrawn-facility disclosure | **N** | 03 | None — committed $1,000.0 revolver with stated availability $997.9 at 2026-09-30 and $2.1 of outstanding letters of credit |
| No interest-expense detail | **N** | 04 | None — interest expense by year plus per-instrument coupons disclosed |
| No EBITDA base | **N** | 06 | None — LTM EBITDA $724.9m (CIQ, LTM Sep-30-2026) plus a ten-year own-history series and forward consensus |

**No partial-data cap and no score cap binds.** The checked caps that could have applied — maturity schedule, covenant disclosure, cash flow statement, interim data, undrawn facilities, revolver availability, covenant-EBITDA addbacks, HoldCo/OpCo disclosure, EBITDA base, off-balance-sheet exposures — are each satisfied by a named source above.

**Limitations that do NOT trigger a cap but must travel downstream (carry these qualifiers at every layer, §3):**
1. **Numeric-reading check is UNCHECKED on all 30 sources** (no `numeric_reading_check` field anywhere; no corpus warning annotations). Not verified clean. Every material amount must be verified by a direct read of the frozen filing extract that reports it; CIQ workbook figures are a vendor read to reconcile against, never a substitute for the filing's own number (§5). Affected inputs: all debt principals, cash, maturities-by-year, interest expense, CFO/capex, lease liabilities, revolver availability, covenant threshold. Needed source check: read the figure in `10K_2025_26…txt` / `10Q_2Q…txt` / `10K_2024_25…txt` within the frozen capability before publishing it.
2. **Net-debt basis.** `ciq_facts.json` reports net debt **$1,237.8m** against total debt **$2,911.4m** at FQ2 Sep-30-2026 — the source_ref itself warns this is a **CIQ vendor basis that may net short-term/liquid investments** (a broad basis, §15). `01` must designate the **strict** basis (total debt − cash & equivalents) as the module's canonical figure, label any broad figure as broad, and reconcile the ~$1.67bn implied netting. Also note CIQ's $2,911.4m total debt is larger than the filings' $2,529.8m face value of borrowings, consistent with the vendor including the $440.3m operating-lease liability — `01` must state which view it is using.
3. **Covenant compliance is not stated numerically.** Neither 10-K nor 10-Q discloses the computed Leverage Ratio or an explicit "we were in compliance" line, and no compliance certificate is in the pool. The threshold (3.75x, or 4.25x in a post-Qualified-Acquisition window) and the definitions are available, so headroom IS computable — but it will be the engine's own calculation on covenant definitions, not a company-reported figure, and `04` must label it that way and state the $1bn indebtedness-netting allowance it relies on.
4. **Litigation maximum exposure is not quantified** — Note 14 gives accrued-amount language and a "not material" assertion, not a numeric ceiling. `05` records the commitments total ($740.1m) as quantified and the litigation maximum as not disclosed (per MODULE_RULES: "Not disclosed in the data pool"), without inventing a number.
5. **No rating-agency report.** The S&P BBB indication comes from a tier-5 vendor panel (CIQ Credit Health Panel), not a rating action. `99` must note the absence and must not infer an outlook or rating trajectory.
6. **Nearest maturity is imminent.** CIQ Capital-Structure-Details dates the $30m (filings: $29.4m) 2026 Convertible Notes at **2026-12-15**, under a month from this triage date — `02` and `03` should treat it as a current-period item, not a future maturity.
7. **No TTWO material-event (8-K / Key Developments) feed in the pool**, and the DEF 14A export is an empty stub. Rating changes, covenant amendments, or debt issuances after 2026-11-09 would not be visible here.
8. **Vendor maturity-wall fact is dated earlier than the filing.** `ciq_facts.json` debt_maturity_wall (WAM ~3.4y, 0 floating / 2,970 fixed) is computed from the **FY2026 (Mar-31-2026)** as-reported block; the `10Q_2Q` table at 2026-09-30 is the fresher authority for the wall.

---

## 6. Sufficiency Verdict

- **Verdict:** **Sufficient**
- **Reason:** A recent balance sheet (2026-09-30 10-Q), a full debt note with amounts by instrument and a year-by-year maturity schedule, and audited plus interim cash flow statements are all present — and the pool additionally carries the full credit-agreement text with the numeric maximum-leverage covenant, its covenant-EBITDA definition, stated revolver availability, interest-expense detail, lease schedules, and the commitments and contingencies note, so leverage, liquidity, coverage, covenant headroom, and a downside stress test can all be built from primary filings.
- **Sections that can run:** capital structure and leverage · maturity wall and refinancing · liquidity runway · coverage and covenants · off-balance-sheet and contingencies · downside stress test — **all six**, plus the synthesis.
- **Active partial-data caps:** none (verdict is Sufficient; see the eight limitation notes in §5 that travel downstream as qualifiers, not caps).
- **Critical missing items:** none for solvency assessment. The only genuinely absent solvency-adjacent documents are a rating-agency rationale/outlook and a TTWO material-event feed, neither of which is required by the sufficiency rule.
- **Single highest-value missing document:** a **quarterly covenant compliance certificate** showing the company's own computed Leverage Ratio and Consolidated Adjusted EBITDA as defined in the 2022 Credit Agreement — it is the one item that would turn `04`'s headroom from an engine calculation on contract definitions into a company-reported, auditor-adjacent figure. (Second-best: a current S&P/Moody's rating rationale, which also sets the revolver's pricing step.)
