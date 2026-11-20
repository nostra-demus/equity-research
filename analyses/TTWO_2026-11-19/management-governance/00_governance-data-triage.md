# Governance Data Triage — TTWO

**Evidence binding (MODULE_PIPELINE Step 1.5).** The frozen quartet was present and complete: `NOSTRA_FROZEN_POOL_DATA_PATH=/Users/admin/nostra-prod/data/TTWO`, `NOSTRA_FROZEN_POOL_OUT_DIR=/Users/admin/.nostra-cockpit-ipc/frozen-evidence/chain-0DA2FL/pool`, `NOSTRA_FROZEN_POOL_GENERATION=0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d`, `NOSTRA_FROZEN_EVIDENCE_ROOT=<pool>/.extract-generations/<digest>/raw/TTWO`. All reads resolved through that exact generation. The extractor was NOT run; live `data/TTWO/` and `analyses/TTWO_2026-11-19/_pool_extracts/` were NOT read. `data/TTWO/` below is a citation label only.

**Generation totals (manifest).** 30 source files · 19 workbooks · 62 tabs · 73 extracts written · **0 extraction failures**. `offline_extraction_complete: true`, `vision_mode: false`. All 6 PDFs extracted by the `native` text method with `required_pages: []` — no OCR fallback, no page gaps.

**Numeric reading check — UNCHECKED (must travel forward).** This generation's `manifest.json` carries **no `numeric_reading_check` field on any source or sheet**, and `corpus.txt` carries no labelled extractor reading-warning annotation (0 matches for `NUMERIC_READING` / `READING_WARNING` / `EXTRACTOR_NOTE` / OCR markers; the only annotations present are the 62 × `# SOURCE:` / `# SHEET:` / `# DIMS:` headers). A missing legacy check means **unchecked, not clean** — the absence of a warning is not proof of accuracy. There is therefore no literal warning token, source reference, or LF-line/column span to preserve, and **no specific material amount is currently marked not-proven on reading-warning grounds**. Every downstream agent in this module must carry this same statement forward: numeric reading in this pool is unverified by the extractor's own check, so any figure that becomes load-bearing should be eyeballed against the frozen extract it came from before it anchors a verdict.

---

## 1. File Inventory

Every one of the 30 files is listed. Every workbook is broken out **one row per tab** (62 tab rows), reconciled against `<GENERATION_ROOT>/manifest.json`. No workbook appears as a single opaque row. "Period Covered" is parsed from INSIDE the document (period-end / "as of" / fiscal-year / report-criteria lines), never from the file's modified time — every file in this pool carries the same Drive-sync timestamp (2026-11-20 12:46), which is the sync date and carries no information about the data's vintage.

| Filename | Type | Period Covered (from inside the document) | Last Modified | Governance Relevance |
|---|---|---|---|---|
| 10K_2025_26_0001628280-26-037434.pdf | Annual filing (10-K), 170 pp | FY ended **Mar-31-2026**; signed May 21, 2026 | 2026-11-20 (Drive sync — not informative) | **High** |
| 10K_2024_25_0001628280-25-026694.pdf | Annual filing (10-K), 274 pp | FY ended **Mar-31-2025**; signed May 20, 2025 | 2026-11-20 (sync) | **High** |
| 10Q_2Q_0001628280-26-072254.pdf | Interim filing (10-Q), 72 pp | Quarter ended **Sep-30-2026** | 2026-11-20 (sync) | Medium |
| 10Q_1Q_0001628280-26-054870.pdf | Interim filing (10-Q), 38 pp | Quarter ended **Jun-30-2026** | 2026-11-20 (sync) | Medium |
| TTWO 2Q27 Earnings Release FINAL.pdf | Earnings release, 14 pp | Q2 FY27 (Sep-30-2026), released **Nov-09-2026** | 2026-11-20 (sync) | Medium |
| TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf | Earnings release, 12 pp | Q1 FY27 (Jun-30-2026), released **Aug-06-2026** | 2026-11-20 (sync) | Medium |
| Take-Two_Interactive_2Q FY27 FINAL.pdf | Investor presentation / guidance summary, 16 pp | Q2 FY27 results & guidance, **Nov-2026** | 2026-11-20 (sync) | Medium |
| Take-Two_Interactive_1Q FY27 FINAL.pdf | Investor presentation / guidance summary, 16 pp | Q1 FY27 results & guidance, **Aug-2026** | 2026-11-20 (sync) | Medium |
| Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf | Transcript (OLE2 container read as document) | Earnings call **Nov-09-2026** | 2026-11-20 (sync) | **High** |
| Take-Two Interactive Software, Inc., Q1 2027 Earnings Call, Aug 07, 2026.rtf | Transcript (OLE2 container read as document) | Earnings call **Aug-07-2026** | 2026-11-20 (sync) | **High** |
| Take Two Interactive Software Inc NasdaqGS TTWO Public Company Profile.rtf | CIQ company profile (document, 31,362 chars) | "Year Founded: 1993"; 12,909 employees; S&P rating as of Apr-05-2022 | 2026-11-20 (sync) | **High** |
| **Take-Two_Interactive_Software_Inc_-_Form_DEF_14A(Jul-27-2026).xls** — tab: **No Data** (4×4) | **Proxy export — HOLLOW** | Filename asserts DEF 14A of **Jul-27-2026**; the only cell of content reads *"This filing has no tabular data to export."* | 2026-11-20 (sync) | **High relevance, zero content** |
| Take Two Interactive Software Inc NasdaqGS TTWO Board Members.xls — tab: Board Members (28×25) | Board/governance export | Report criteria: **Current Board Members**, internal + external directors | 2026-11-20 (sync) | **High** |
| Take Two Interactive Software Inc NasdaqGS TTWO Professionals.xls — tab: Professionals (24×24) | KMP/officer export | Report criteria: **Current Professionals**, all | 2026-11-20 (sync) | **High** |
| Take Two Interactive Software Inc NasdaqGS TTWO Public Ownership Insider Trading.xls — tab: Insider Trading (5058×11) | Insider-transaction export | Date: **All History**; latest Form 4 filed **2026-10-05**, earliest trade 2004-10-12 | 2026-11-20 (sync) | **High** |
| Take Two Interactive Software Inc NasdaqGS TTWO Public Ownership History.xls — tab: History (1835×6) | Ownership export | Quarterly holder history; latest column **Sep-30-2026** | 2026-11-20 (sync) | **High** |
| Take Two Interactive Software Inc NasdaqGS TTWO Auditors.xls — tab: Auditors (75×6) | Auditor history export | Time frame **1996–2026**; FY2026 back to FY1996, parent + subsidiary | 2026-11-20 (sync) | **High** |
| Take Two Interactive Software Inc NasdaqGS TTWO Suppliers.xls — tab: Suppliers (28×8) | Counterparty export | "Recently disclosed suppliers only (within the last two years)"; rows cite the **2025 and 2026 Form 10-K** | 2026-11-20 (sync) | **High** (names ZelnickMedia / ZMC Advisors) |
| Take Two Interactive Software Inc NasdaqGS TTWO Customers.xls — tab: Customers (30×8) | Counterparty export | "Recently disclosed customers only (within the last two years)" | 2026-11-20 (sync) | Medium |
| Take Two Interactive Software Inc NasdaqGS TTWO Strategic Alliances.xls — tab: Strategic Alliances (22×7) | Alliance export | "Recently disclosed … within the last two years"; latest source Apr-15-2025 | 2026-11-20 (sync) | Medium |
| Take Two Interactive Software Inc NasdaqGS TTWO Investment Analysis Direct Investments.xls — tab: Direct Investments (173×21) | Group-structure export | Current subsidiaries + merged entities; earliest merger **1998-03-12** (BMG Interactive) | 2026-11-20 (sync) | **High** (lineage) |
| Take Two Interactive Software Inc NasdaqGS TTWO Investment Analysis Co Investors.xls — tab: Co-Investors (90×3) | Co-investor export | 73 co-investors, "All Years", prior investments included | 2026-11-20 (sync) | Medium |
| Take Two Interactive Software Inc NasdaqGS TTWO Events Calendar.xls — tab: Events Calendar (16×3) | Event calendar | Timeframe **November 2026** only | 2026-11-20 (sync) | Low |
| Short_Interest_Charting Excel Export Nov-19-2026 2_50 AM.xls — tab: Chart 1 with Data (284×2) | Short-interest series | Daily series ending **2026-11-18** | 2026-11-20 (sync) | Medium (A15) |
| Short_Interest_Charting Excel Export Nov-19-2026 2_50 AM.xls — tab: Attributions (45×1) | Vendor attribution | n/a | 2026-11-20 (sync) | Low |
| **Alphabet Inc NasdaqGS GOOGL Key Developments.xls — tab: Key Developments (520×7)** | **WRONG COMPANY** — Key Developments for *Alphabet Inc. (NasdaqGS:GOOGL)* | Alphabet events; no TTWO content | 2026-11-20 (sync) | **Not usable for TTWO** |
| Take Two Interactive Software Inc NasdaqGS TTWO Financials_Annual.xls — tab: Key Stats (91×13) | CIQ annual financials | Annual, **Mar-31-2017 → Mar-31-2026** | 2026-11-20 (sync) | **High** (capital allocation) |
| … — tab: Income Statement (119×12) | CIQ annual financials | Mar-31-2017 → Mar-31-2026 | 2026-11-20 (sync) | **High** |
| … — tab: Balance Sheet (97×12) | CIQ annual financials | Mar-31-2017 → Mar-31-2026 | 2026-11-20 (sync) | **High** |
| … — tab: Cash Flow (74×12) | CIQ annual financials | Mar-31-2017 → Mar-31-2026 | 2026-11-20 (sync) | **High** (M&A, buyback, dividend) |
| … — tab: Multiples (90×42) | CIQ annual financials | Annual multiples series | 2026-11-20 (sync) | Low |
| … — tab: Historical Capitalization (39×43) | CIQ annual financials | Annual capitalisation series | 2026-11-20 (sync) | **High** (per-share) |
| … — tab: Capital Structure Summary (99×23) | CIQ annual financials | Annual debt/equity structure | 2026-11-20 (sync) | Medium |
| … — tab: Capital Structure Details (38×10) | CIQ annual financials | Instrument detail | 2026-11-20 (sync) | Medium |
| … — tab: Ratios (161×12) | CIQ annual financials | Annual returns/ratios | 2026-11-20 (sync) | **High** (ROIC trend) |
| … — tab: Supplemental (67×11) | CIQ annual financials | Annual supplemental incl. SBC | 2026-11-20 (sync) | Medium |
| … — tab: Segments (76×11) | CIQ annual financials | Annual segment detail | 2026-11-20 (sync) | Low |
| … — tab: Industry Specific (15×6) | CIQ annual financials | Industry lines | 2026-11-20 (sync) | Low |
| … — tab: Pension OPEB (21×11) | CIQ annual financials | Pension/OPEB lines | 2026-11-20 (sync) | Low |
| Take Two Interactive Software Inc NasdaqGS TTWO Financials_Quarterly.xls — tab: Key Stats (91×13) | CIQ quarterly financials | Quarterly through **Sep-30-2026** | 2026-11-20 (sync) | Medium |
| … — tab: Income Statement (116×43) | CIQ quarterly financials | Quarterly through Sep-30-2026 | 2026-11-20 (sync) | Medium |
| … — tab: Balance Sheet (98×43) | CIQ quarterly financials | Quarterly through Sep-30-2026 | 2026-11-20 (sync) | Medium |
| … — tab: Cash Flow (73×43) | CIQ quarterly financials | Quarterly through Sep-30-2026 | 2026-11-20 (sync) | Medium |
| … — tab: Multiples (91×42) | CIQ quarterly financials | Quarterly multiples | 2026-11-20 (sync) | Low |
| … — tab: Historical Capitalization (39×43) | CIQ quarterly financials | Quarterly capitalisation | 2026-11-20 (sync) | Medium |
| … — tab: Capital Structure Summary (74×85) | CIQ quarterly financials | Quarterly structure | 2026-11-20 (sync) | Medium |
| … — tab: Capital Structure Details (38×10) | CIQ quarterly financials | Instrument detail | 2026-11-20 (sync) | Low |
| … — tab: Ratios (161×43) | CIQ quarterly financials | Quarterly ratios | 2026-11-20 (sync) | Medium |
| … — tab: Supplemental (35×43) | CIQ quarterly financials | Quarterly supplemental | 2026-11-20 (sync) | Low |
| … — tab: Segments (72×43) | CIQ quarterly financials | Quarterly segments | 2026-11-20 (sync) | Low |
| … — tab: Industry Specific (15×6) | CIQ quarterly financials | Industry lines | 2026-11-20 (sync) | Low |
| … — tab: Pension OPEB (15×6) | CIQ quarterly financials | Pension/OPEB lines | 2026-11-20 (sync) | Low |
| Take Two Interactive Software Inc NasdaqGS TTWO Credit Health Panel.xls — tab: Summary (46×11) | CIQ credit panel | Through Sep-30-2026 | 2026-11-20 (sync) | Low |
| … — tab: Financials (40×13) | CIQ credit panel | Through Sep-30-2026 | 2026-11-20 (sync) | Low |
| … — tab: Operational Metrics Charts (21×19) | CIQ credit panel | Chart series | 2026-11-20 (sync) | Low |
| … — tab: Solvency Metrics Charts (18×19) | CIQ credit panel | Chart series | 2026-11-20 (sync) | Low |
| … — tab: Liquidity Metrics Charts (15×19) | CIQ credit panel | Chart series | 2026-11-20 (sync) | Low |
| … — tab: Disclaimer (26×1) | Vendor disclaimer | n/a | 2026-11-20 (sync) | Low |
| Company Comparable Analysis Take Two Interactive Software Inc.xls — tab: Financial Data (50×17) | CIQ peer comp | Peer set, latest available | 2026-11-20 (sync) | Low |
| … — tab: Trading Multiples (50×9) | CIQ peer comp | Peer multiples | 2026-11-20 (sync) | Low |
| … — tab: Operating Statistics (50×13) | CIQ peer comp | Peer operating stats | 2026-11-20 (sync) | Low |
| … — tab: Business Description (44×3) | CIQ peer comp | Peer descriptions | 2026-11-20 (sync) | Low |
| … — tab: Implied Valuation (69×9) | CIQ peer comp | Implied values | 2026-11-20 (sync) | Low |
| … — tab: Valuation Chart (32×2) | CIQ peer comp | Chart series | 2026-11-20 (sync) | Low |
| … — tab: Credit Health Panel (48×10) | CIQ peer comp | Peer credit | 2026-11-20 (sync) | Low |
| … — tab: Disclaimer (26×1) | Vendor disclaimer | n/a | 2026-11-20 (sync) | Low |
| Take-TwoInteractiveSoftware,IncNasdaqGSTTWOEstimatesReport.xls — tab: Consensus (604×123) | CIQ estimates | Consensus; recommendation **Buy (1.21)**, up to 28 estimates/period | 2026-11-20 (sync) | Medium (A15-03) |
| … — tab: Guidance (198×117) | CIQ estimates | **Company guidance history** | 2026-11-20 (sync) | **High** (promise-vs-delivery) |
| … — tab: Surprise (311×113) | CIQ estimates | Beat/miss history | 2026-11-20 (sync) | **High** (candor) |
| … — tab: Revisions (467×21) | CIQ estimates | Estimate revisions | 2026-11-20 (sync) | Medium |
| … — tab: Trends (303×21) | CIQ estimates | Estimate trends | 2026-11-20 (sync) | Medium |
| … — tab: Recent Changes (265×10) | CIQ estimates | Recent broker changes | 2026-11-20 (sync) | Low |
| … — tab: Multiples (34×7) | CIQ estimates | Forward multiples | 2026-11-20 (sync) | Low |

**No `external/` folder exists in this pool.** `<DATA_PATH>/external/` is absent, no manifest row carries `external: true`, and no `.source.json` provenance object appears anywhere in the manifest (0 matches for `external` and `provenance`). There is therefore no `## 1A. External Data` section, and no external document influenced the sufficiency verdict — correctly, since external data is enrichment only and never fills a filing slot.

**No Drive pointer stubs and no extraction failures.** No source carries `gdrive-pointer`, `fail`, `fallback-text`, or `missing-dependency`. The one hollow source (the DEF 14A export) is a *genuinely empty vendor export of a real filing*, not an extraction failure — the extractor read it correctly and it contained nothing. It is treated as **absent content** for every sufficiency and cap purpose below, exactly as a failure would be.

---

## 2. Most Recent Sources

Age measured from the period-end / as-of date inside the document to 2026-11-19.

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Proxy / DEF 14A | **`Take-Two_Interactive_Software_Inc_-_Form_DEF_14A(Jul-27-2026).xls`** — present as a file, **empty of content** ("This filing has no tabular data to export"). The proxy document itself is **not in the pool**. | Filename asserts Jul-27-2026 | **n/a — no readable proxy content at any age** |
| Annual filing | `10K_2025_26_0001628280-26-037434.pdf` | FY ended Mar-31-2026 (signed May 21, 2026) | 7.6 |
| Compensation disclosure | **None.** FY26 10-K Item 11 ("Executive Compensation") is incorporated by reference to the Proxy Statement, which is not in the pool. The only pay-related primary text is the blank-form *Global Restricted Stock Unit Agreement* under the 2017 Stock Incentive Plan, filed as an exhibit to the FY26 10-K — a template with `<<Participant name>>` and `<<Number of awards granted>>` placeholders, carrying no person, no amount, and no performance metric. | — | **n/a** |
| Ownership / insider-transaction data | `…Public Ownership Insider Trading.xls` (tab: Insider Trading, 5,058 rows, all history from 2004) and `…Public Ownership History.xls` (tab: History, 1,835 rows, quarterly) | Latest Form 4 filed 2026-10-05; holder history to Sep-30-2026 | 1.5 / 1.6 |
| Shareholder letter | **None.** No annual shareholder letter or CEO letter in the pool. Closest substitutes: the two earnings releases and the two guidance-summary decks. | — | **n/a** |
| Transcript | `Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf` | Call Nov-09-2026 | 0.3 |
| 8-K (management changes) | **None.** No 8-K is in the pool. The CIQ Key Developments export that would normally carry material-event and management-change history is for **Alphabet Inc. (GOOGL)**, not TTWO. | — | **n/a** |
| Board composition (local-equivalent governance source used instead of the proxy) | `…Board Members.xls` (tab: Board Members) — 10 current directors with role, independence label, tenure, other boards, background | "Current Board Members" as at pool export (~Nov-2026) | ~0 |
| Officer / KMP roster | `…Professionals.xls` (tab: Professionals) — 7 current officers | "Current Professionals" (~Nov-2026) | ~0 |
| Auditor history | `…Auditors.xls` (tab: Auditors) — FY1996–FY2026, parent and subsidiary, with opinion type | FY2026 | 7.6 |
| Multi-year capital-allocation history | `…Financials_Annual.xls` (13 tabs, Cash Flow / Historical Capitalization / Ratios) | Mar-31-2017 → Mar-31-2026 (10 fiscal years) | 7.6 |

---

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A | **N** | The pool's DEF 14A file is a 4×4 empty vendor export ("This filing has no tabular data to export"). FY26 10-K Items 10–14 are all incorporated by reference to that proxy [FY26 10-K, Items 10–14] | Comp, ownership, board, related-party |
| Compensation disclosure (metrics/weights) | **N** | FY26 10-K Item 11 incorporated by reference; only a blank-form RSU agreement template under the 2017 Stock Incentive Plan is in the pool | Incentive alignment |
| Beneficial ownership table | **N** (filing) / **Y** (vendor substitute) | FY26 10-K Item 12 incorporated by reference. Substitute: `…Public Ownership History.xls` (tab: History), 1,835 rows quarterly to Sep-30-2026 — top holders BlackRock 16,249,491 shares, Vanguard Capital Management 12,907,308, State Street 11,715,013, Saudi Electronic Games Holding Co (asset-management arm) 11,414,680 | Skin in the game, control |
| Insider-transaction data (buys/sells) | **Y** | `…Public Ownership Insider Trading.xls` (tab: Insider Trading), 5,058 rows, Form 4 source, 2004 → filed 2026-10-05; includes the Aug-10-2026 Zelnick open-market disposition of 40,000 shares at $250.49–$255.12 ($10,105,592) | Conviction signal |
| Board composition / independence | **Y** (vendor + filing signature page) | `…Board Members.xls`: 1 internal (Executive Chairman & CEO), 9 external — 8 "Independent Director" plus 1 "Lead Independent Director". Corroborated by the FY26 10-K signature page, which the same 10 people signed on May 21, 2026 | Board quality, entrenchment |
| Related-party disclosure | **N** | The FY26 10-K has **no related-party transactions note**; Item 13 is incorporated by reference to the proxy. The ZelnickMedia **Management Agreement dated May 3, 2022** appears only in the FY26 10-K exhibit index (Ex. 10.26, filed with the 8-K of 5/5/2022), with no economics, no fee, and no term in the pool | Value leakage |
| Control structure (dual-class / blocs) | **Y** | FY26 10-K cover: single class, "Common Stock, $0.01 par value", 185,666,663 shares outstanding net of treasury as of May 11, 2026; non-affiliate market value $47,087,317,833. No second class registered under 12(b) or 12(g) | Minority-shareholder rights |
| Prior shareholder letters / guidance | **Y** (guidance only, no letters) | `…EstimatesReport.xls` tabs **Guidance** (198×117) and **Surprise** (311×113); plus the 1Q and 2Q FY27 guidance-summary decks and both earnings releases | Promise-vs-delivery |
| M&A / buyback / dividend history | **Y** | `…Financials_Annual.xls` tab Cash Flow, FY2017–FY2026. Plus FY26 10-K: board authorised repurchase of up to 21.7m shares; **no shares repurchased in FY2024, FY2025 or FY2026**; 11.7m cumulatively repurchased, 10.0m still available. "We have never declared or paid cash dividends… do not expect to declare or pay any cash dividends in the foreseeable future" [FY26 10-K, Dividend Policy] | Capital-allocation scorecard |
| Management tenure / turnover | **Y** | `…Board Members.xls` tenure column (Zelnick 2007–present; Dornemann, Moses, Sheresky 2007–present; Tolson 2014–; Srinivasan 2017–; Viera 2018–; Hernandez 2019–; Gordon and Siminoff 2022–). Officer tenure inferable from first Form 4 dates in the insider file (Goldstein from 2007-06-18, Slatoff from 2008-04-17, Emerson from 2015-02-09). Both 10-K signature pages carry the identical 10 directors + 2 officers — no churn between FY25 and FY26 | Stability and competence |
| Transcripts | **Y** | Q1 FY27 (Aug-07-2026) and Q2 FY27 (Nov-09-2026) earnings calls — 2 only, both in the same fiscal year | Candor and tone |
| Auditor's report + annexures (CARO / KAMs / IFC) | **Y** (US form) | FY26 10-K: E&Y audit report; management concluded "internal control over financial reporting was effective as of March 31, 2026" [FY26 10-K, Item 9A]; Section 404(b) auditor attestation box checked on the cover. CARO/MR-3 are India-only and **Not Applicable** by jurisdiction | Audit quality (08) |
| Auditor-fee disclosure (audit vs non-audit) | **N** | FY26 10-K Item 14 ("Principal Accounting Fees and Services") is incorporated by reference to the proxy, which is not in the pool | Auditor independence (08) |
| Secretarial audit report (India: MR-3) | **Not Applicable** (jurisdiction) | US/SEC registrant — no MR-3 equivalent exists | Compliance assurance (08) |
| Related-party NOTE with counterparties + amounts | **N** | No RPT note in either 10-K. The counterparty names exist (`relationships.json` edges `zelnickmedia-corporation→take-two…:vendor` sourced to the 2025 Form 10-K, and `zmc-advisors-l-p→take-two…:vendor` sourced to the 2026 Form 10-K) but **no amounts** | RPT quantification (09) |
| Contingent-liabilities & commitments note | **Y** | FY26 10-K **Note 14 — Commitments and Contingencies**: total minimum contractual obligations $740.1m (software development & licensing $175.8m, marketing $206.9m, purchase obligations $357.4m), laddered FY2027–thereafter; pension/401(k) employer contributions $55.1m / $51.4m / $43.0m for FY2026/25/24; legal proceedings described as routine and not material | Off-P&L exposure (10) |
| ≥2 consecutive annual financials | **Y** | FY2025 and FY2026 10-Ks (two consecutive audited years), plus CIQ annual series Mar-31-2017 → Mar-31-2026 (10 years) | Beneish/Dechow forensic battery (11) |
| Shareholding-pattern history (quarters, pledge column) | **Y** (quarters) / **Not Applicable** (pledge) | `…Public Ownership History.xls`, quarterly holder history to Sep-30-2026. A promoter-pledge column is an India/SEBI-SAST construct with no US equivalent and no promoter group here | Ownership trend + pledge (04) |
| AGM/EGM voting results (scrutinizer reports) | **N** | Say-on-pay and director-election vote results would arrive in an Item 5.07 8-K or the proxy; neither is in the pool | Minority dissent (05) |
| Exchange announcements history (fines, Reg 30 events) | **N** | No 8-K in the pool, and the Key Developments export is **Alphabet's, not TTWO's** | Compliance hygiene (12) |
| Rating-agency reports / actions | **Partial (Y, thin)** | CIQ Public Company Profile: S&P issuer credit rating **BBB** (local and foreign currency LT), rating date **Apr-05-2022**, outlook Stable. A one-line rating stamp, 55 months old — no rating rationale document | Rating conduct (12) |

---

## 4. Cross-Module Availability

Checked against the actual filesystem at `/private/tmp/nostra-claude-workspace-supMGN/analyses/TTWO_2026-11-19/`.

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/11_capital-allocation-governance.md | **Y** |
| business-model/01_disqualifier-scan.md | **Y** |
| business-model/12_red-flags-sweep.md | **Y** |
| business-model/02_business-identity.md | **Y** |
| earnings/06_earnings-quality.md | **Y** |
| earnings/04_guidance-consensus.md | **Y** |

Also present and usable: the full business-model module (`00`–`12` plus `99_business-model-synthesis.md`), the full earnings module (`00`–`08` plus `99_earnings-synthesis.md`), and the full balance-sheet-survival module (`00`–`06` plus `99_balance-sheet-survival-synthesis.md`) — including `balance-sheet-survival/05_off-balance-sheet-and-contingencies.md` for agent 10 and `balance-sheet-survival/01_capital-structure-and-leverage.md` for agent 11. `NOSTRA_CONTINUATION_RUN_ROOT=analyses/TTWO_2026-11-19`, so agents 10 and 11 must read balance-sheet-survival only from inside that exact root and never from a prior run. `analyses/TTWO_2026-11-19/management-governance/` was empty before this file.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure | **Y** | 03, 99 | Incentive alignment **max 50**; Overall usefulness **max 70**. All of A6-01…A6-09 and A12-02/A12-03 become Not Available with the reason "Item 11 incorporated by reference; proxy absent from pool" |
| No ownership / insider-transaction data | **N** | — | Not applied. Both are present and fresh (holder history to Sep-30-2026; Form 4s to 2026-10-05) |
| No board disclosure | **N** | — | Not applied. 10 directors with independence labels and tenure, corroborated by both 10-K signature pages |
| No multi-year history | **N** | — | Not applied. 10 fiscal years (FY2017–FY2026) of CIQ annual financials plus two 10-Ks |
| No transcripts / prior letters | **N (transcripts) / Y (letters)** | 01, 06 | No numeric cap binds, but state the limit: only **2 transcripts, both within FY2027**, and **no shareholder letter at all**. Promise-vs-delivery must run off the CIQ Guidance and Surprise tabs and the two guidance decks rather than off management's own prose. 06 cannot read tone across a full cycle from two same-year calls |
| No related-party note | **Y** | 09, 99 | RPT quantification **not assessable**; **RPT & leakage risk floor 40**; Confidence Score **max 80**. The absence is itself an **Amber** disclosure finding — and it is sharper than usual here, because the pool independently names two controller-linked vendors with no amounts attached (see the lead below) |
| No contingent-liability note | **N** | — | Not applied. FY26 10-K Note 14 is present with a full laddered table totalling $740.1m |
| No auditor-fee / audit-detail disclosure | **Y** | 08, 99 | **A4-06 and A4-07 Not Available with reason** (Item 14 incorporated by reference, proxy absent); Audit & assurance quality **max 65**; Confidence Score **max 80** |
| Under 2 years of financials | **N** | — | Not applied. Two consecutive audited years plus a 10-year vendor series — the full Beneish/Dechow battery is computable |
| Web/database sweep unavailable this run | **Y** | 07, 12, 99 | This triage ran with every network host denied (sandbox `deniedHosts: ["*"]`), so no corporate registry, court, regulator, insolvency, disqualification, sanctions, trademark, or dated-adverse-media source was reachable. Unless 07 and 12 hold a capability this agent does not, their dossiers and legal sweep are **coverage-limited — graded on filings alone, never presented as swept-and-clean**: People & network integrity **max 65**; Legal & regulatory risk **floor 40** (unknown is not safe); Confidence Score **max 70**. 07 and 12 must each declare their own actual reachability rather than inherit this line |
| No company website (D-1 unreachable), other discovery sources available | **Y** | 07 | `www.take2games.com` is named in the FY26 10-K but was **not fetchable** this run (network denied). Record D-1 unavailable on its own line with a proportionate confidence note. **No discovery cap on this ground alone, and not A17-01 Insufficient Data** — the discovery loop still RUNS on the surviving recipes, and the pool already hands it unusual depth: D-2 founding-year (incorporated Delaware **1993**, matching the claimed founding year), D-3 previous names (merged-entity trail from 1998), D-4 trademark seeds (the brand list below), D-5 address (110 West 44th Street, New York, NY 10036), D-8 past directorships (20 named former directors/KMP) |
| Discovery loop cannot run at all — no company website AND registry, trademark and address sources all unreachable | **Y — for the EXTERNAL legs only** | 07, 99 | Honest statement of the position: **every external discovery source was unreachable this run**, so if 07 shares this network posture it must record A17-01 as **Insufficient Data naming what failed** (no registry, no trademark register, no address lookup, no website), apply People & network integrity **max 60** and Confidence Score **max 75**, and sweep the seed roster anyway — reporting the result as *a statement about the filings, not about the company*. This is the same cap already bound two rows above, so the more restrictive value governs: **People & network integrity max 60, Confidence max 70.** It is **not** an A17-01 *Red*: per A17-01's own carve-out, a loop that could not run because sources were genuinely unreachable is a coverage gap, never the Red condition, which is reserved for a loop that was skippable and was skipped |

### Additional pool-integrity flags this triage is raising on its own

These are not in the standard flag table but they bind real caps, so they are named here rather than buried.

| Finding | Affected Agents | Consequence |
|---|---|---|
| **The Key Developments export in the pool is Alphabet Inc.'s (GOOGL), not TTWO's.** There is no TTWO material-event history in the pool at all, and no 8-K. | 01, 05, 08, 12, 99 | **A9-01/02/03 (regulatory/legal events), A10-03 (AGM voting), A4-15 (gatekeeper exit cluster) and A4-04 (auditor-resignation timing) lose their natural source.** A4-04 is partly rescued by the Auditors export (E&Y continuously FY1996–FY2026 — no resignation to detect). A10-03 cannot be answered at all. 12's "exchange announcements history" row is Not Available. **Do not read the Alphabet file as TTWO data under any circumstance.** |
| **A controller-linked vendor relationship is named but unquantified, and the vendor graph mislabels it `third_party`.** `relationships.json` lists **ZelnickMedia Corporation** (`affiliation: "third_party"`, sourced to the 2025 Form 10-K, Suppliers row 26) and **ZMC Advisors. L.P.** (`affiliation: "third_party"`, sourced to the 2026 Form 10-K, Suppliers row 27) as operating vendors to TTWO. But the pool's own Board Members background text states Strauss Zelnick "is Founder & Managing Partner of ZelnickMedia Corporation" and "is Founder & Managing Partner of ZMC Advisors. L.P." — he is the Executive Chairman & CEO on the other side of both. | 07, 09, 12, 99 | **These two are controller-linked, not arm's-length. 09 must not treat them as outside parties**, notwithstanding the vendor export's `third_party` tag (a tier-5 vendor label, not a filing's determination). The Management Agreement with ZelnickMedia dated May 3, 2022 (FY26 10-K, Ex. 10.26) is the governing instrument and is **not in the pool** — so the fee, the term, and the performance conditions are all unreadable. This is the single highest-value related-party lead in the pool and the clearest reason the missing proxy hurts: it is where that agreement's economics are disclosed. Both `link_strength` values are capped at 25 by the vendor's own "the export names no listing for it" rule and carry explicit `evidence_gaps` that the relationship's size is undisclosed — honour those gaps. |
| **Numeric reading is unchecked across all 73 extracts** (no `numeric_reading_check` in the manifest; no reading annotations in the corpus). | all | No amount is currently not-proven on this ground, but every restating layer carries the unresolved uncertainty forward: a figure that becomes load-bearing should be verified against its frozen extract within this evidence capability before it anchors a verdict. Never guess a corrected number; never alter frozen evidence. |

---

## 5E. Person & Entity Register (feeds 07 — Hard Rule)

This is the **seed** for 07's discovery loop, not the finished roster. The filings and the vendor exports list who the company chose to list; 07 expands from here per the Entity & Network Discovery Protocol.

### 5E.1 Person Register

| # | Name | Identifier (DIN / registry ID, if disclosed) | Role | Category | Source (filing + section) |
|---|---|---|---|---|---|
| 1 | Strauss H. Zelnick, Esq., J.D. | Not disclosed in pool (no CIK/DIN given for the person) | Executive Chairman & CEO; Chairman and Chief Executive Officer (Principal Executive Officer). Also Founder & Managing Partner, ZelnickMedia Corporation and ZMC Advisors. L.P.; Director of Third Way; Independent Director of Starwood Property Trust (from 2009); Director of Blockbuster, LLC (from May 2005); Director of Naylor, LLC; Advisory Board of K Property Group, LLC and Second City Capital Partners. Exec Chairman since Feb 2008, CEO from Jan 1 2011, director from Mar 2007 | Director + KMP (controller-equivalent) | CIQ Board Members (tab: Board Members); CIQ Professionals; FY26 10-K signature page (May 21, 2026) |
| 2 | Lainie Goldstein, CPA | Not disclosed | Chief Financial Officer (Principal Financial and Accounting Officer) | KMP | CIQ Professionals; FY26 10-K signature page; FY26 10-K Ex. 31.2 / 32.2 certifications |
| 3 | Karl Slatoff | Not disclosed | President | KMP | CIQ Professionals |
| 4 | Daniel P. Emerson, J.D. | Not disclosed | Executive VP & Chief Legal Officer | KMP | CIQ Professionals |
| 5 | Matthew K. Breitman | Not disclosed | Senior VP, General Counsel of Americas & **Corporate Secretary** | KMP | CIQ Professionals |
| 6 | Nicole B. Shevins | Not disclosed | Senior VP of Investor Relations & Corporate Communications | KMP | CIQ Professionals |
| 7 | Linda Zabriskie | Not disclosed | VP & Associate General Counsel | KMP | CIQ Professionals |
| 8 | LaVerne Srinivasan | Not disclosed | **Lead Independent Director**, 2017–present | Director | CIQ Board Members; FY26 10-K signature page |
| 9 | Michael Dornemann | Not disclosed | Independent Director, 2007–present | Director | CIQ Board Members; FY26 10-K signature page |
| 10 | Jay J. ("J") Moses | Not disclosed | Independent Director, 2007–present | Director | CIQ Board Members; FY26 10-K signature page |
| 11 | Michael Sheresky | Not disclosed | Independent Director, 2007–present | Director | CIQ Board Members; FY26 10-K signature page |
| 12 | Susan M. Tolson | Not disclosed | Independent Director, 2014–present | Director | CIQ Board Members; FY26 10-K signature page |
| 13 | Paul Ernest Viera | Not disclosed | Independent Director, 2018–present | Director | CIQ Board Members; FY26 10-K signature page |
| 14 | Roland A. Hernandez | Not disclosed | Independent Director, 2019–present | Director | CIQ Board Members; FY26 10-K signature page |
| 15 | William Bingham ("Bing") Gordon | Not disclosed | Independent Director, 2022–present | Director | CIQ Board Members; FY26 10-K signature page |
| 16 | Ellen F. Siminoff | Not disclosed | Independent Director, 2022–present | Director | CIQ Board Members; FY26 10-K signature page |
| 17 | Robert A. Bowman | Not disclosed | Former Independent Director (Form 4 activity 2007-04-16 → 2017-12-01) | **Former** | CIQ Insider Trading (holder name carries the "(Former Independent Director)" role label) |
| 18 | **Brett M. Icahn** | Not disclosed | Former Director (2010-06-16 → 2013-11-06) | **Former** | CIQ Insider Trading |
| 19 | **SungHwan Cho** | Not disclosed | Former Director (2010-06-16 → 2013-11-06) | **Former** | CIQ Insider Trading |
| 20 | James Larry Nelson | Not disclosed | Former Director (2010-06-16 → 2013-11-06) | **Former** | CIQ Insider Trading |
| 21 | Seth D. Krauss, Esq., J.D. | Not disclosed | Former Chief Legal Officer, EVP & General Counsel (2007-04-02 → 2013-06-10) | **Former** | CIQ Insider Trading |
| 22 | Jonathan F. Levy | Not disclosed | Former Independent Director (2006-03-14 → 2010-03-17) | **Former** | CIQ Insider Trading |
| 23 | Grover C. Brown, Esq., J.D. | Not disclosed | Former Independent Director (2006-03-27 → 2010-03-17) | **Former** | CIQ Insider Trading |
| 24 | Manuel N. Sousa | Not disclosed | Former Head of Human Resources and EVP (2009-06-12) | **Former** | CIQ Insider Trading |
| 25 | Gary Dale | Not disclosed | Former Chief Operating Officer (2008-02-01 → 2008-12-29) | **Former** | CIQ Insider Trading |
| 26 | Benjamin Feder | Not disclosed | **Former Chief Executive Officer** (2008-04-17) | **Former** | CIQ Insider Trading |
| 27 | Paul Eibeler | Not disclosed | Former President and Director (2005-06-16 → 2007-03-29) | **Former** | CIQ Insider Trading |
| 28 | Karl H. Winters | Not disclosed | **Former Chief Financial Officer and Principal Accounting Officer** (2004-10-12 → 2007-03-29) | **Former** | CIQ Insider Trading |
| 29 | Oliver R. Grace Jr. | Not disclosed | Former Independent Director (2005-02-01 → 2007-02-21) | **Former** | CIQ Insider Trading |
| 30 | Todd Emmel | Not disclosed | Former Independent Director (2005-02-01 → 2007-02-21) | **Former** | CIQ Insider Trading |
| 31 | Michael J. Malone | Not disclosed | Former Independent Director (2006-01-24) | **Former** | CIQ Insider Trading |
| 32 | Robert Flug | Not disclosed | Former Director (2005-02-01 → 2006-01-19) | **Former** | CIQ Insider Trading |
| 33 | Steven Tisch | Not disclosed | Former Independent Director (2005-02-01 → 2006-01-19) | **Former** | CIQ Insider Trading |
| 34 | Mark Lewis | Not disclosed | Former Independent Director (2005-02-01 → 2006-01-19) | **Former** | CIQ Insider Trading |
| 35 | Gary Lewis | Not disclosed | Former Global Chief Operating Officer (2005-03-11 → 2005-07-13) | **Former** | CIQ Insider Trading |
| 36 | Barbara Kaczynski | Not disclosed | Former Director (2005-03-14) | **Former** | CIQ Insider Trading |
| 37 | **UNNAMED — Chief Operating Officer (current)** | — | No current COO appears in the CIQ Professionals roster, though a Former COO (Gary Dale) and a Former Global COO (Gary Lewis) do. Either the role is vacant/abolished or the roster is incomplete | Gap | CIQ Professionals (absence) |
| 38 | **UNNAMED — Chief Accounting Officer (separate from CFO)** | — | The CFO signs as "Principal Financial **and Accounting** Officer", so the roles are combined; recorded so 07 does not hunt for a person who does not exist | Gap (resolved) | FY26 10-K signature page |
| 39 | **UNNAMED — Audit, Compensation and Nominating committee chairs and members** | — | Committee membership is a proxy disclosure and the proxy is absent. **Not a single committee seat is identifiable from this pool.** 05 cannot answer A2-01 through A2-05 on composition, independence, financial expertise, meeting count, or chair rotation | Gap | FY26 10-K Item 10 (incorporated by reference) |
| 40 | **UNNAMED — Chief Information Security Officer / cyber-risk owner** | — | Not named in the pool; relevant because A2-02 requires cyber in the risk committee charter | Gap | CIQ Professionals (absence) |

Identifier note for 07: this is a US/SEC registrant, so there is **no DIN** and no India-style person identifier. The identity anchors available are the person's SEC **reporting-owner CIK** (derivable from the Form 4s that the insider file cites but does not print) plus role, tenure, and the other-boards list in the Board Members background text. 07 must satisfy **A16-01** with ≥2 corroborating identifiers before attributing any adverse record — the namesake risk is live for the common names on this list (Mark Lewis, Gary Lewis, Michael Dornemann, J Moses).

### 5E.2 Entity Register

Every entity the pool names, all `filing-supplied` unless marked. The group is large: **FY26 10-K Exhibit 21.1 ("Subsidiaries of Take-Two Interactive Software, Inc.") lists roughly 150 entities with their jurisdiction of incorporation.** Listed below are the material and governance-relevant ones plus the full set of brand-bearing clusters; 07 should treat Exhibit 21.1 as the authoritative complete roster and expand from it.

| # | Entity | Registry identifier, if disclosed | Relationship as disclosed | Source (filing + section) |
|---|---|---|---|---|
| 1 | **Take-Two Interactive Software, Inc.** | SEC Commission file **001-34003**; IRS EIN **51-0350842**; filer CIK (from accession prefixes) 0001628280 is the filing agent, not the issuer — 07 should resolve the issuer CIK independently | The listed issuer; Delaware | FY26 10-K cover page |
| 2 | **ZelnickMedia Corporation** | Not disclosed | Vendor to TTWO per the 2025 Form 10-K (`relationships.json` edge `zelnickmedia-corporation→take-two-interactive-software-inc:vendor`, `affiliation: third_party`). **Counterparty to the Management Agreement dated November 17, 2017 (Ex. 10.20) and May 3, 2022 (Ex. 10.26).** Founded and managed by Strauss Zelnick — **controller-linked, NOT arm's-length** | CIQ Suppliers row 26; FY26 10-K exhibit index Ex. 10.20–10.26; CIQ Board Members background |
| 3 | **ZMC Advisors. L.P.** | Not disclosed | Vendor to TTWO per the 2026 Form 10-K (`relationships.json` edge, `affiliation: third_party`, industry "Asset Management and Custody Banks"). Zelnick is Founder & Managing Partner — **controller-linked** | CIQ Suppliers row 27; CIQ Board Members background |
| 4 | Zynga Inc. | Not disclosed | Subsidiary (acquired 2022). Separately audited by E&Y FY2011–FY2021 as "Subsidiary/Investment" | FY26 10-K Ex. 21.1 (via Zynga-lineage entities); CIQ Auditors; CIQ Public Company Profile |
| 5 | The Gearbox Entertainment Company, Inc. | Not disclosed | Subsidiary, Delaware (founded 1999, Frisco TX). Plus Gearbox Development Services / Enterprises / Production Services / Productions / Publishing / Software / Studios / Transmedia Services (all Texas LLCs) and Gearbox Studio Quebec Inc. (Quebec) | FY26 10-K Ex. 21.1; CIQ Public Company Profile |
| 6 | Rockstar Games, Inc. (Delaware) | Not disclosed | Subsidiary. Cluster: Rockstar Dundee Ltd, Rockstar Games UK Ltd, Rockstar London Ltd, Rockstar International Ltd (all UK), Rockstar Games Toronto ULC (BC), Rockstar New England Inc. (DE), Rockstar San Diego Inc. (VA), Rockstar Events Inc. (NY), Rockstar Interactive India LLP, Rockstar Records LLC, Rockstar Games Songs/Sounds/Tunes LLC, Take-Two Australia Development Pty Ltd t/a Rockstar Australia | FY26 10-K Ex. 21.1 |
| 7 | 2K Games, Inc. (Delaware) | Not disclosed | Subsidiary. Cluster: 2K Inc. (NY), 2K Czech s.r.o., 2K Games Dublin Ltd, 2K Games Madrid S.L., 2K Games (Chengdu/Shanghai) Co. Ltd, 2K Marin, 2K Play, 2K Vegas, 2KSports, 2K Studios Montreal, 2K Games Songs/Sounds/Tunes LLC | FY26 10-K Ex. 21.1 |
| 8 | **DMA Design Holdings Limited** (United Kingdom) | Not disclosed | Subsidiary — the original *Grand Theft Auto* developer, the key lineage entity | FY26 10-K Ex. 21.1 |
| 9 | **BMG Interactive** | Not disclosed | **Merged Entity — acquired by Take-Two 1998-03-12.** The transaction that brought the GTA franchise into the group | CIQ Direct Investments (tab: Direct Investments) |
| 10 | SpiderSoft, Ltd. | Not disclosed | Merged Entity, acquired 1998-06-01 (Europe) | CIQ Direct Investments |
| 11 | LDA Distribution, Ltd. | Not disclosed | Merged Entity, acquired 1999-02-04 (Europe, technology distributors) | CIQ Direct Investments |
| 12 | Rockstar Productions GmbH | Not disclosed | Merged Entity, acquired 2001-01-31 (Europe) | CIQ Direct Investments |
| 13 | THQ Inc. — "Evolve" assets | Not disclosed | Merged Entity, acquired 2013-01-23 **out of THQ's bankruptcy**. 07 should test this against A17-03 (predecessor/phoenix): an asset purchase from a failed entity. On the face of it this is a formal, disclosed, third-party insolvency sale with no controller on the other side — a lead to confirm, not a finding | CIQ Direct Investments; CIQ Public Company Profile |
| 14 | Firaxis Games, Inc.; Ghost Story Games, LLC; Cat Daddy Games, L.L.C.; Visual Concepts Entertainment; Hangar 13 UK Ltd; Echtra Games, Inc.; Blue Shift, Inc. | Not disclosed | Development-studio subsidiaries | FY26 10-K Ex. 21.1 |
| 15 | NaturalMotion Ltd / Games Ltd / Software Ltd (UK); Small Giant Games Oy (Finland); Social Point S.L. (Spain); Peak Oyun Yazilim A.Ş., Rollic Games A.Ş., Gram Games Teknoloji A.Ş., Bytetyper A.Ş., Creasaur Teknoloji A.Ş. (Turkey); Popcore GmbH (Germany); Chartboost B.V. / Chartboost Tech S.L.; Storemaven Ltd (Israel); Nordeus Ltd (Ireland) & Nordeus d.o.o Beograd (Serbia); Playdots, LLC; GameClub Inc.; Platygobian S.L.; Dynamixyz SAS | Not disclosed | Zynga-lineage and mobile subsidiaries | FY26 10-K Ex. 21.1; CIQ Public Company Profile |
| 16 | Dhruva Interactive Private Limited (India); Take-Two Interactive India Private Limited (India) | Not disclosed | Indian subsidiaries — the only two entities in the group where an Indian registry (MCA CIN) lookup is available to 07 | FY26 10-K Ex. 21.1 |
| 17 | Holding chain: Take Two Holdings LLC, Take-Two Holdings II LLC, Take-Two Holdings III LLC, Take-Two UK Holdings Ltd, Take-Two Interactive Canada Holdings Inc., Big Dog Holdings LLC, Little Dog Domestic Holdings LLC, Take-Two International B.V., Take Two International GmbH (Switzerland), Take-Two Asia Pte. Ltd. (Singapore) | Not disclosed | Intermediate holding companies — the structure 09/11 should walk for group-structure items (A11) | FY26 10-K Ex. 21.1 |
| 18 | Unusual-name entities worth a second look by 07: **Groundhog 1, LLC; Groundhog 2, LLC; Venues I, LLC; LILW12TH, Inc.; Double Take LLC; Glennco Games, LLC; Techcorp Ltd. (Hong Kong); LVY Technology Limited (Hong Kong); Joytech Ltd. (Hong Kong); RDIP Limited (UK); Rollingmedia Limited (UK); Almost There Entertainment Limited (Ireland); Nanotribe GmbH; Nom Nom Nom d.o.o Beograd; Inventory Management Systems, Inc.; Take-Two Talent, LLC; Take-Two Esports Holdings, LLC; Take-Two Contracting, LLC** | Not disclosed | All disclosed group subsidiaries. Named because opaque-purpose and IP-holding entities (RDIP, the Songs/Sounds/Tunes LLCs) are where brand ownership sits, which feeds A17-04 | FY26 10-K Ex. 21.1 |
| 19 | Arm's-length counterparties from `relationships.json` (tier-5 vendor export, scope = "recently disclosed … within the last two years" only, NOT the full base): Microsoft Corporation, Apple Inc., Sony Group Corporation, Sony Interactive Entertainment Inc., Nintendo Co. Ltd., Google LLC, Meta Platforms Inc., Snap Inc., Valve Corporation, Epic Games Inc., ironSource Ltd., National Basketball Association Inc., Alliance Entertainment Holding Corporation, Remedy Entertainment Oyj, Gaming Realms plc, Bidstack Group Plc, Thunderful Group AB, Punktid Technologies AS, Technicolor Creative Studios, Prima Interactive (Pty) Ltd | Listings given in the graph where they exist | Customers/suppliers/alliances. Genuine outside parties | `relationships.json` nodes/edges; CIQ Customers / Suppliers / Strategic Alliances |
| 20 | PCF Group Spólka Akcyjna (WSE:PCF) | WSE:PCF | Strategic alliance with TTWO itself (entity "Self") | CIQ Strategic Alliances |
| 21 | Butterfingers Limited (Out of Business) | Not disclosed | Listed by the vendor as a strategic alliance of 2K Games, Inc. and Gearbox Software, L.L.C., industry "**Restaurants**", source "Key Development Client Announcements Apr-15-2025". **Flagged as a probable vendor name-match error, not a real relationship** — a defunct restaurant company is not a plausible games-studio alliance. 07 should resolve it on a primary registry before treating it as a network link (A17-10 aggregator-conflict logic), and must not attribute anything adverse to TTWO on this row | CIQ Strategic Alliances |
| 22 | Bunch Live, Inc.; Horizon Blockchain Games Inc.; Scopely, Inc. (Prior); Twitch Interactive, Inc. (Prior) | Not disclosed | Minority/venture investments; 73 named co-investors alongside, including Ubisoft Entertainment SA (ENXTPA:UBI), Greycroft LP, Akatsuki Ventures, Golden Venture Partners, BITKRAFT, 500 Global, Betaworks | CIQ Co-Investors; CIQ Direct Investments |
| 23 | Ernst & Young LLP (parent: Ernst & Young Global Limited) | Not disclosed | Statutory auditor, **continuously FY1996 → FY2026** (30 years), unqualified every year for the parent; also audited Zynga Inc. FY2011–FY2021 | CIQ Auditors; FY26 10-K audit report |
| 24 | JPMorgan Chase Bank, N.A. (Administrative Agent); Wells Fargo Bank, N.A. | Not disclosed | Credit Agreement dated May 23, 2022, Amendment No. 3 dated May 19, 2025 (filed as an FY25 10-K exhibit) | FY25 10-K, Amendment No. 3 exhibit |
| 25 | S&P Global Ratings | n/a | Rating agency — BBB issuer credit rating, Apr-05-2022, Stable | CIQ Public Company Profile |
| 26 | Saudi Electronic Games Holding Co (asset-management arm) | Not disclosed | **Holder of 11,414,680 shares, unchanged across Dec-31-2025, Mar-31-2026, Jun-30-2026 and Sep-30-2026** — a static ~6.1% sovereign-linked bloc. Not a promoter and not disclosed as an affiliate, but a stable strategic holder 04 and 05 should both read | CIQ Public Ownership History (tab: History) |
| 27 | BlackRock, Inc. (NYSE:BLK); Vanguard Capital Management, LLC; State Street Investment Management | Listed where applicable | Largest institutional holders; BlackRock **fell from 19,214,813 (Mar-31-2026) to 16,249,491 (Sep-30-2026)** — a ~15% reduction over two quarters, which 04 should test against A3-07 | CIQ Public Ownership History |

### 5E.3 Company identity & lineage anchors (feeds 07's discovery loop)

| Anchor | Value | Source |
|---|---|---|
| Registry identifier (CIN / company number / CIK) | **SEC Commission file number 001-34003**; **IRS Employer ID 51-0350842**; state of organisation **Delaware**. The Delaware file number is **not in pool** — 07 fetches it from the Delaware Division of Corporations. The issuer's SEC CIK is **not printed in pool** (the `0001628280` in the accession numbers is the filing agent's, not the issuer's) — 07 must resolve it on EDGAR and not assume it | FY26 10-K cover page |
| Incorporation date | **"incorporated in the state of Delaware in 1993"** — year only, no exact date | FY26 10-K, Item 1 (Business), opening sentence |
| Any founding year the company CLAIMS | **1993** (CIQ Public Company Profile, "Year Founded: 1993"). **This matches the incorporation year exactly — no A17-02 lineage lead.** No "since 19xx" claim predating the entity appears anywhere in the pool, so there is no predecessor to reconcile on this ground. Note separately that the group's *franchise* lineage is older than its ownership of it: GTA originated at DMA Design and arrived via the 1998 BMG Interactive acquisition — both the developer entity (DMA Design Holdings Limited) and the acquisition are disclosed, so this is disclosed lineage, not hidden lineage | CIQ Public Company Profile; FY26 10-K Item 1; FY26 10-K Ex. 21.1; CIQ Direct Investments |
| Former names, if disclosed anywhere in the pool | **None disclosed.** The company appears under "Take-Two Interactive Software, Inc." throughout, back to the earliest pool document. The *merged-entity* trail is the nearest thing to a name history: BMG Interactive (1998-03-12), SpiderSoft Ltd (1998-06-01), LDA Distribution Ltd (1999-02-04), Rockstar Productions GmbH (2001-01-31), THQ Inc. "Evolve" (2013-01-23). 07 confirms the registry's previous-names field (D-3) | CIQ Direct Investments; absence across both 10-Ks |
| Company website URL | **www.take2games.com** (stated twice in the FY26 10-K — as the filings portal and as the host of the Code of Business Conduct and Ethics). **Not fetched this run** — network denied; this is the D-1 unavailability recorded in Section 5 | FY26 10-K, Item 1 and Item 10 |
| Principal brand / product names the company trades under | **Grand Theft Auto, Red Dead Redemption, LA Noire, Max Payne, Midnight Club, NBA 2K, Borderlands, Brothers in Arms, Duke Nukem, Homeworld, Civilization (Firaxis), Dots / TwoDots (Playdots), Zynga mobile titles.** Operating labels: **Rockstar Games, 2K, Private Division-era 2K Play, Zynga, Gearbox, Visual Concepts, Firaxis, Ghost Story Games, Cat Daddy, Hangar 13, NaturalMotion, Social Point, Peak, Rollic, Small Giant, Nordeus, Popcore**. For A17-04, note the pool shows IP-holding entities inside the group (2K Games Songs/Sounds/Tunes LLC, Rockstar Games Songs/Sounds/Tunes LLC, Rockstar Records LLC, RDIP Limited) — consistent with in-group ownership, but the trademark registers were **unreachable this run**, so ownership is not confirmed. The FY26 10-K does disclose outbound licensing commitments to "holders of intellectual property rights for use of their trademarks, copyrights, technology" (Note 14) and minimum marketing commitments "primarily reflect our agreements with major sports leagues and players' associations" (i.e. the NBA licence) — inbound licences the company depends on, which 07/09 should size | CIQ Public Company Profile; FY26 10-K Ex. 21.1; FY26 10-K Note 14 |
| Registered-office address | **110 West 44th Street, New York, New York 10036, United States**; telephone (646) 536-2842 — the same number carried by all seven officers in the CIQ Professionals roster, so no officer-level address divergence to chase. D-5 address-cluster lookup **not run** (network denied) | FY26 10-K cover page; CIQ Public Company Profile; CIQ Professionals |

**Claimed founding year vs incorporation date:** both are **1993**. They reconcile, so **no predecessor-entity lead arises on this test**, and nothing is asserted here about a predecessor existing. A17-02 is a candidate **Green** for 07 subject to the registry previous-names check (D-3) actually running.

---

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | **United States** | FY26 10-K cover page; "UNITED STATES SECURITIES AND EXCHANGE COMMISSION" |
| Exchange | **NASDAQ Global Select Market**, ticker **TTWO**; Common Stock $0.01 par | FY26 10-K cover, Securities registered pursuant to Section 12(b) |
| Filing regime | **US SEC — domestic large accelerated filer.** Not a foreign private issuer (files 10-K/10-Q/8-K/DEF 14A, not 20-F/6-K). Section 404(b) auditor attestation applies (box checked). State of organisation Delaware; Commission file 001-34003 | FY26 10-K cover page |
| Sector | **Interactive entertainment / video-game publishing** — CIQ primary industry "Interactive Home Entertainment". GICS Communication Services → Entertainment. 12,909 employees | CIQ Public Company Profile; FY26 10-K Item 1 |
| Sector-specific governance overlay required? | **N** — none of the five registry overlays (banks/NBFCs/insurers, IT services, pharma, infra/real estate, holdcos/conglomerates) applies to a US interactive-entertainment publisher. Do **not** force one. The CFO/PAT and working-capital lenses DO apply (this is not a financial). The company-specific lenses later agents should carry instead, named here so they are not lost for want of an overlay: **(a)** capitalised internal software-development cost and its amortisation/write-off pattern; **(b)** extreme title and franchise concentration — one customer was 22.5% / 24.4% / 21.1% of net revenue in FY2026/25/24 and a second customer was separately material [FY26 10-K]; **(c)** platform-holder dependence (Sony, Microsoft, Apple, Google as both channel and payment processor); **(d)** the serial-acquirer pattern already scored 75 by `business-model/11`, which binds §24 Filter 4; **(e)** recognition and deferral of in-game/recurrent consumer spending | MODULE_RULES Sector-Specific Governance Overlays; FY26 10-K Items 1 and 1A; `business-model/11_capital-allocation-governance.md` |
| Document language(s) | **English only.** All 30 sources are English; all 6 PDFs extracted by the `native` text method, none needed OCR. No non-English document is present, so CLAUDE.md §27's language rule has nothing to apply to here — and nothing in this pool is being recorded as a gap on language grounds | `manifest.json` `pdf_page_coverage.method: native` for all PDFs; direct read |

Accounting standard, currency, fiscal year — these travel with every number this module quotes: **US GAAP**, **USD** (millions in the financial statements), fiscal year ends **March 31**. So "FY2026" means the year ended Mar-31-2026, and "Q2 FY2027" means the quarter ended Sep-30-2026 — a US 10-Q is a **standalone three-month period**, not a cumulative half-year, so no cumulative-basis restatement is needed (CLAUDE.md §27).

## Language is not a data gap (CLAUDE.md §27)

Every document in this pool is in English, so no translation was required and no source was discounted for language. Recorded for completeness: had a home-language filing been present it would have counted as **present at the full source tier its type earns**, with figures transcribed verbatim and labels translated — never marked "missing", "not extractable in English", or "opaque". The only genuine reading gap in this pool is the DEF 14A export whose content is empty, and that is handled above as absent content, not as a language or extraction issue.

## External data (frameworks/EXTERNAL_DATA.md)

**No external data in this pool.** `<DATA_PATH>/external/` does not exist; no manifest row carries `external: true`; no `.source.json` provenance object is present. Nothing to list, nothing to tier, no freshness line to flag — and therefore no external document moved the sufficiency verdict, which is the correct outcome in any case: external data is enrichment and never fills a filing, transcript, or deck slot in the sufficiency rule.

## 5B. Source Coverage Matrix

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---|---:|---|---|
| Board composition | CIQ Board Members export (tab: Board Members, 28×25), cross-checked against the FY26 10-K signature page | Current as at ~Nov-2026; signature page May 21, 2026 | **4** | No (roster) / **Yes (committees)** | None in pool for committee composition — only the proxy carries it. 07's registry and the company's governance webpage would both close it if reachable |
| Compensation | **None.** Blank-form RSU agreement template only (no person, no amount, no metric) | — | **1** | **Yes** | The DEF 14A of Jul-27-2026 — the single highest-value missing document |
| Ownership | CIQ Public Ownership History (1,835 rows, quarterly) | Dec-31-2025 → Sep-30-2026 shown; longer series in file | **4** | No | Proxy beneficial-ownership table would add insider holdings and the 5% holder reconciliation |
| Insider trades | CIQ Public Ownership Insider Trading (5,058 rows, Form 4 sourced) | 2004-10-12 → filed 2026-10-05 | **5** | No | — |
| Related-party transactions | **Names only, no amounts.** `relationships.json` edges for ZelnickMedia Corporation and ZMC Advisors. L.P.; FY26 10-K exhibit index Ex. 10.20–10.26 | FY2025 and FY2026 10-K disclosures (via the vendor graph) | **2** | **Yes (quantification)** | DEF 14A Item 13 section, and the Management Agreement of May 3, 2022 itself (Ex. 10.26, filed with the 8-K of 5/5/2022) |
| Auditor report | FY26 10-K audit report (E&Y, unqualified) + Item 9A ICFR effective + Section 404(b) attestation; CIQ Auditors FY1996–FY2026 with opinion type per year | FY2026 (and FY1996–FY2026 history) | **5** | No | — |
| Secretarial / compliance report | **Not Applicable** — no US equivalent of India's MR-3 | — | **n/a** | n/a (regime) | — |
| AGM voting | **None** | — | **1** | **Yes** | Item 5.07 8-K following the 2026 annual meeting, or the proxy |
| Capital-allocation history | CIQ Financials_Annual (13 tabs: Cash Flow, Historical Capitalization, Ratios, Capital Structure) + FY25 and FY26 10-Ks | Mar-31-2017 → Mar-31-2026 (10 years) | **5** | No | — |
| Legal / regulatory cases | FY26 10-K Note 14 "Legal and Other Proceedings" — described as routine, not material, with amounts accrued but **no case named and no amount given**. Plus the FY26 10-K Item 3 / Item 1A risk narrative | FY2026 | **2** | **Partly** | External court/regulator databases (unreachable this run); and the missing TTWO Key Developments export — the pool has Alphabet's instead |

## 5C. Data Freshness

| Source | Period | As-of Date | Age | Stale? | Impact |
|---|---|---|---|---|---|
| Q2 FY27 earnings call transcript | Q2 FY2027 | 2026-11-09 | 0.3 mo | No | Freshest management voice in the pool; anchors 06's candor read |
| Short-interest series | Daily | 2026-11-18 | 0.0 mo | No | A15-01/02 current |
| CIQ Board Members / Professionals | "Current" | ~2026-11-19 (export) | ~0 mo | No | Board and officer roster current |
| CIQ Public Ownership History | Quarterly | Sep-30-2026 | 1.6 mo | No | A3 ownership-trend read current |
| 10-Q Q2 FY27 | Quarter ended Sep-30-2026 | 2026-09-30 | 1.6 mo | No | Latest audited-adjacent balance sheet |
| CIQ Insider Trading | All history | Filed 2026-10-05 | 1.5 mo | No | A3/A15 insider read current |
| Q1 FY27 transcript / release / deck | Q1 FY2027 | 2026-08-06/07 | 3.4 mo | No | Second of only two transcripts |
| 10-Q Q1 FY27 | Quarter ended Jun-30-2026 | 2026-06-30 | 4.6 mo | No | — |
| **DEF 14A export (hollow)** | Asserted Jul-27-2026 | — | **n/a** | **n/a — no content at any age** | **Blocks A6 (all), A12-02/03, A2 (all composition items), A5 quantification, A4-06/07, A10-03** |
| FY26 10-K + E&Y audit report + Note 14 + Ex. 21.1 | FY ended Mar-31-2026 | 2026-03-31 (signed 2026-05-21) | 7.6 mo | No | Primary annual evidence; one reporting cycle old, which is normal mid-year |
| CIQ Auditors | FY1996–FY2026 | FY2026 | 7.6 mo | No | 30-year auditor continuity record |
| CIQ Financials_Annual | FY2017–FY2026 | Mar-31-2026 | 7.6 mo | No | 10-year capital-allocation base |
| FY25 10-K | FY ended Mar-31-2025 | 2025-03-31 | 19.6 mo | No (it is the prior-year comparative, correctly so) | Second consecutive year for the forensic battery |
| CIQ Strategic Alliances | "within the last two years" | latest source 2025-04-15 | 19.2 mo | **Borderline** | Alliance view is a two-year window only — do not read it as a complete alliance list (honour `scope_notes`) |
| **S&P issuer credit rating BBB / Stable** | Point-in-time | **2022-04-05** | **55.5 mo** | **YES — stale** | 12's rating-conduct read rests on a 4.6-year-old one-line stamp with no rationale document. State the staleness; do not present BBB/Stable as a current agency view |
| **CIQ Key Developments** | — | — | — | **Wrong company (Alphabet/GOOGL)** | No TTWO material-event history at all |

**Source manifest CSV export: pending.** No `Write` tool is available to this agent and the sandbox write-allowlist for this run covers only `analyses/TTWO_2026-11-19/management-governance/`, which this report already occupies; the task instruction further restricts output to this single path ("Do not write any file other than that exact output path"). The tables in Sections 1, 2, 5B and 5C above therefore stand as the source manifest.

---

## 6. Sufficiency Verdict

- **Verdict:** **Partial**
- **Reason:** The filings, a 10-year capital-allocation history, a complete board and officer roster, and fresh ownership and insider-transaction data are all present — but the **proxy statement is absent in substance** (the pool's DEF 14A file is an empty vendor export, and the FY26 10-K incorporates Items 10 through 14 by reference to it), so compensation, committee composition, related-party amounts, audit fees, and AGM voting are all unreadable.
- **Specialists that can run:** **management track record (01)**, **capital allocation (02)**, **ownership and insider behaviour (04)**, **board — roster and tenure only, not committees (05)**, **candor and disclosure (06)**, **people dossiers — filings-only, coverage-limited (07)**, **audit quality — opinion, rotation, ICFR and 30-year continuity, but not fees (08)**, **RPT/group forensics — structure and named counterparties, but not amounts (09)**, **contingent liabilities (10)**, **accounting forensics (11)**, **regulatory/legal — filings-only, coverage-limited (12)**. Only **incentives and compensation (03)** has no primary substrate at all and must return almost entirely Not Available.
- **Hard disqualifier already flagged by `business-model/01_disqualifier-scan`?** **N** — "Any disqualifier triggered: **N**"; "No disqualifier triggered"; "No lock applies." Two items that module flagged still travel forward to this one and must not be lost: its Section 4 near-miss finding that **operating cash flow was negative in two of the last four years (FY2024 −$16.1m, FY2025 −$45.2m, with FY2023 clearing zero by $1.1m)**; and `business-model/11_capital-allocation-governance`'s **acquisition-pattern row scored 75** (inverted — higher is worse), which trips **§24 Filter 4** and binds **Capital allocation max 50 / Governance risk floor 60 / RF-CAP-004** on this module's agent 02 and synthesis 99. Agent 02 does not re-decide that; it deepens it.
- **Active partial-data caps:**
  - **No proxy / compensation disclosure** → Incentive alignment **max 50**; Overall usefulness **max 70** (03, 99). A6-01…A6-09 and A12-02/A12-03 Not Available with reason.
  - **No related-party note** → RPT & leakage risk **floor 40**; Confidence Score **max 80** (09, 99). The absence is itself an **Amber** disclosure finding — and it is not a neutral absence, because the pool independently names ZelnickMedia Corporation and ZMC Advisors. L.P. as vendors to the company while the CEO founds and manages both, with the governing Management Agreement (Ex. 10.26, 2022-05-03) absent from the pool.
  - **No auditor-fee / audit-detail disclosure** → A4-06 and A4-07 **Not Available with reason**; Audit & assurance quality **max 65**; Confidence Score **max 80** (08, 99).
  - **Web/legal-database sweep did not run** (all network hosts denied this run) → People & network integrity **max 65**; Legal & regulatory risk **floor 40**; Confidence Score **max 70** (07, 12, 99). 07 and 12 each declare their own actual reachability; if theirs matches this agent's, the stricter discovery cap below governs.
  - **Discovery loop's external legs all unreachable** → if 07 confirms the same posture, A17-01 is **Insufficient Data naming what failed** (no website, no registry, no trademark register, no address lookup), People & network integrity **max 60**, Confidence Score **max 75**. Taking the most restrictive of the two overlapping caps: **People & network integrity max 60, Confidence Score max 70.** Explicitly **not** an A17-01 Red — the loop was not skippable-and-skipped, its sources were unreachable, which A17-01's own carve-out treats as a coverage gap. The seed roster in 5E is swept anyway and the result reported as a statement about the filings, not about the company.
  - **Serial-acquirer pattern** carried in from `business-model/11` (score 75, §24 Filter 4) → Capital allocation **max 50**; Governance risk **floor 60**; **RF-CAP-004** (02, 99).
  - **No AGM voting results** → **A10-03 Not Available** (05); no numeric cap is specified for this item, so record it as a coverage gap, count it against checklist coverage, and let 99's coverage arithmetic carry it.
  - **No committee disclosure** → **A2-01 through A2-05 Not Available** (05). This is the second-largest hole after compensation, and it comes from the same missing document.
  - **No TTWO material-event history** (the Key Developments export is Alphabet's) → A9-01/02/03 and A4-15 coverage-limited (08, 12).
  - **Numeric reading unchecked** (no `numeric_reading_check` in this generation) → every agent carries the unresolved uncertainty and the source check forward; no specific amount is currently not-proven on this ground.
- **Critical missing items:**
  - The **DEF 14A / definitive proxy statement for the 2026 annual meeting**, due on or before July 29, 2026 per the FY26 10-K's own Item 10 — the pool's file of that name contains nothing. Everything below follows from this one absence.
  - **Executive compensation**: no metrics, no weights, no amounts, no CEO-to-median ratio, no severance or change-of-control terms, no say-on-pay result. The clawback policy is at least shown to **exist** (FY26 10-K exhibit index, Ex. 97.1, "Policy for the Recovery of Erroneously Awarded Compensation", incorporated from the 10-K filed 5/22/2024), and the FY26 10-K cover's 10D-1(b) restatement-recovery box is **unchecked** — so no recovery analysis was triggered. The policy text itself is not in the pool.
  - **Board committee composition** — audit, compensation and nominating membership, independence, financial expertise, meeting counts, chair rotation. Not one committee seat is identifiable.
  - **Related-party amounts** — above all the ZelnickMedia / ZMC Advisors management-agreement economics.
  - **Audit and non-audit fees paid to Ernst & Young** — with a 30-year tenure (FY1996–FY2026), the fee split is exactly the independence test that matters most here, and it is the one that cannot be run.
  - **AGM voting results** for the 2026 annual meeting (director elections, say-on-pay, auditor ratification).
  - **A TTWO Key Developments / 8-K material-event history** — the pool holds Alphabet's by mistake.
  - **A current rating-agency rationale** — the only rating datum is a BBB/Stable stamp dated 2022-04-05, 55 months old.
  - **A shareholder letter, and transcripts beyond FY2027** — two same-year calls cannot show how management speaks across a full cycle, which is the core of the candor test.
- **Single highest-value missing document:** the **DEF 14A (definitive proxy statement) for the 2026 annual meeting of stockholders**. One document would restore compensation metrics and amounts, the beneficial-ownership table, committee composition and independence, the related-party section including the ZelnickMedia arrangement, and the Ernst & Young audit-versus-non-audit fee split — lifting five separate caps at once and moving this pool from Partial to Sufficient.
