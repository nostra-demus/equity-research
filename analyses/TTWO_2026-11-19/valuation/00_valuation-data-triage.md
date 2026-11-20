# Valuation Data Triage — TTWO

**Evidence binding (frozen chain).** This run is bound to a supervisor-verified frozen evidence capability. The complete quartet was present and verified before any read: `NOSTRA_FROZEN_POOL_DATA_PATH`, `NOSTRA_FROZEN_POOL_OUT_DIR`, `NOSTRA_FROZEN_POOL_GENERATION=0af638492ecb0521db2676c79d75e6940c7227bb9f192567527b8a57eb43203d`, `NOSTRA_FROZEN_EVIDENCE_ROOT`. `DATA_PATH` is the frozen evidence root only; `data/TTWO/` is a citation label, not a readable path. Every manifest, corpus, CIQ-facts, relationships, and extract read resolved inside that one generation. The pool extractor was NOT run; the live pool and the original `_pool_extracts/` tree were not read.

**Manifest totals (verbatim):** `{"sources": 30, "workbooks": 19, "tabs": 62, "extracts_written": 73, "failures": 0}`. Zero sources carry `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer` status — no document in this pool is in an extraction-failure state, so no source is counted as missing on extraction grounds (fix F03). `vision_mode: false`, `offline_extraction_complete: true`.

**Numeric reading check — ABSENT from this generation (unchecked, not clean).** This manifest carries NO `numeric_reading_check` object at any source or sheet level (`manifest.json` string count for the token `numeric_reading_check` = 0), and the corpus carries no labelled extractor reading-warning annotations. Per the module's evidence rule, **a missing legacy check means unchecked, not verified** — no warning here is not proof of accuracy. There is therefore no literal warning token, no source/extract reference, and no LF-line/column span to carry forward, and no amount is marked not-proven on that basis. Downstream agents must treat every number lifted from a workbook cell as mechanically unverified by the pattern check, and must verify any value-determining amount against the original source **inside this frozen capability only** — never by guessing a corrected figure and never by altering frozen evidence.

**Period dating method (fix F23).** Every raw file in the frozen capability carries the filesystem timestamp `2026-11-20 12:46` — that is the freeze/sync stamp of the capability, not a document date. The "Last Modified" column below is therefore deliberately NOT used as a recency signal; the "Period Covered" column is parsed from INSIDE each document (fiscal-year / period-end / "As-Of Date:" lines) and is the only recency basis used in this report.

**External data:** no `external/` directory exists in this pool (`raw/TTWO/` contains 30 files, none under `external/`, and no manifest row carries `external: true` or a `provenance` object). No `## 1A. External Data` table is rendered, and no sufficiency judgement here rests on external research.

---

## 1. File Inventory

Every one of the 30 sources is listed, and every one of the 62 workbook tabs is its own row (73 inventory rows = 11 non-workbook extracts + 62 tabs), reconciled against `<GENERATION_ROOT>/manifest.json`. No workbook appears as a single opaque row. Sizes are the raw-file sizes for documents and `rows × cols` for tabs.

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| `10K_2025_26_0001628280-26-037434.pdf` (1.96 MB) | Annual filing (10-K) | FY ended **Mar-31-2026** ("For the fiscal year ended March 31, 2026") | — (freeze stamp only; see note) | **High** |
| `10K_2024_25_0001628280-25-026694.pdf` (2.87 MB) | Annual filing (10-K), prior year | FY ended **Mar-31-2025** | — | **High** |
| `10Q_2Q_0001628280-26-072254.pdf` (1.02 MB) | Quarterly filing (10-Q) | Quarter ended **Sep-30-2026** (Q2 FY27) | — | **High** |
| `10Q_1Q_0001628280-26-054870.pdf` (0.55 MB) | Quarterly filing (10-Q) | Quarter ended **Jun-30-2026** (Q1 FY27) | — | **High** |
| `TTWO 2Q27 Earnings Release FINAL.pdf` (0.30 MB) | Earnings release | Q2 FY27 (Sep-30-2026), released Nov-2026 | — | High |
| `TTWO 1Q27 Earnings Release FINAL 8-6-2026.pdf` (0.25 MB) | Earnings release | Q1 FY27 (Jun-30-2026), released Aug-06-2026 | — | High |
| `Take-Two_Interactive_2Q FY27 FINAL.pdf` (0.87 MB) | Investor deck | Q2 FY27 (Sep-30-2026) | — | Medium |
| `Take-Two_Interactive_1Q FY27 FINAL.pdf` (0.90 MB) | Investor deck | Q1 FY27 (Jun-30-2026) | — | Medium |
| `Take-Two Interactive Software, Inc., Q2 2027 Earnings Call, Nov 09, 2026.rtf` (0.29 MB) | Transcript | Call **Nov-09-2026** (Q2 FY27) | — | High |
| `Take-Two Interactive Software, Inc., Q1 2027 Earnings Call, Aug 07, 2026.rtf` (0.30 MB) | Transcript | Call **Aug-07-2026** (Q1 FY27) | — | Medium |
| `Take Two Interactive Software Inc NasdaqGS TTWO Public Company Profile.rtf` (0.27 MB) | Company profile (CIQ) | Profile, no internal as-of line | — | Low |
| **Financials_Annual.xls** → `Key Stats` (91×13) | Capital-IQ financial export | Annual columns Mar-31-2017 → Mar-31-2026 | — | High |
| **Financials_Annual.xls** → `Income Statement` (119×12) | Income statement | FY2017 → FY2026 (USD m, reported) | — | **High** |
| **Financials_Annual.xls** → `Balance Sheet` (97×12) | Capital structure | FY2017 → FY2026 | — | **High** |
| **Financials_Annual.xls** → `Cash Flow` (74×12) | Cash flow statement | FY2017 → FY2026 | — | **High** |
| **Financials_Annual.xls** → `Multiples` (90×42) | Multiples export | **Quarterly** closes 2017-03-31 → current (40 columns) | — | **High** |
| **Financials_Annual.xls** → `Historical Capitalization` (39×43) | Historical market cap / TEV | Quarterly series to current | — | High |
| **Financials_Annual.xls** → `Capital Structure Summary` (99×23) | Capital structure | FY2017 → FY2026 | — | **High** |
| **Financials_Annual.xls** → `Capital Structure Details` (38×10) | Debt detail by instrument | As-reported block, latest **May-22-2026** | — | **High** |
| **Financials_Annual.xls** → `Ratios` (161×12) | Ratios (incl. ROIC) | FY2017 → FY2026 | — | High |
| **Financials_Annual.xls** → `Supplemental` (67×11) | Supplemental (capex, SBC) | FY2017 → FY2026 | — | High |
| **Financials_Annual.xls** → `Segments` (76×11) | Segment / geographic revenue | Latest annual col **Mar-31-2026** | — | Medium |
| **Financials_Annual.xls** → `Industry Specific` (15×6) | Industry metrics | Sparse (20 cells) | — | Low |
| **Financials_Annual.xls** → `Pension OPEB` (21×11) | Pension / OPEB | FY2017 → FY2026, sparse (65 cells) | — | Low |
| **Financials_Quarterly.xls** → `Key Stats` (91×13) | Capital-IQ financial export | Quarterly to Sep-30-2026 | — | High |
| **Financials_Quarterly.xls** → `Income Statement` (116×43) | Income statement (LTM base) | Jun-30-2016 → **Sep-30-2026** + LTM | — | **High** |
| **Financials_Quarterly.xls** → `Balance Sheet` (98×43) | Capital structure | Jun-30-2016 → **Sep-30-2026** | — | **High** |
| **Financials_Quarterly.xls** → `Cash Flow` (73×43) | Cash flow statement | Jun-30-2016 → **Sep-30-2026** + LTM | — | **High** |
| **Financials_Quarterly.xls** → `Multiples` (91×42) | Multiples export | Quarterly closes 2017-03-31 → current | — | **High** |
| **Financials_Quarterly.xls** → `Historical Capitalization` (39×43) | Historical market cap / TEV | Jun-30-2016 → current | — | High |
| **Financials_Quarterly.xls** → `Capital Structure Summary` (74×85) | Capital structure | Jun-30-2016 → Sep-30-2026 | — | **High** |
| **Financials_Quarterly.xls** → `Capital Structure Details` (38×10) | Debt detail by instrument | Latest as-reported **Nov-09-2026** | — | **High** |
| **Financials_Quarterly.xls** → `Ratios` (161×43) | Ratios | Jun-30-2016 → Sep-30-2026 | — | High |
| **Financials_Quarterly.xls** → `Supplemental` (35×43) | Supplemental (capex) | Jun-30-2016 → Sep-30-2026 | — | High |
| **Financials_Quarterly.xls** → `Segments` (72×43) | Segment / geographic revenue | Quarterly to Sep-30-2026 | — | Medium |
| **Financials_Quarterly.xls** → `Industry Specific` (15×6) | Industry metrics | Sparse (20 cells) | — | Low |
| **Financials_Quarterly.xls** → `Pension OPEB` (15×6) | Pension / OPEB | Sparse (20 cells) | — | Low |
| **EstimatesReport.xls** → `Consensus` (604×123) | Consensus / estimate export | Current FY end **Mar-31-2027**; FQ3-27 release Feb-09-2027; target price + LT growth | — | **High** |
| **EstimatesReport.xls** → `Guidance` (198×117) | Company guidance history | To FY2027 | — | **High** |
| **EstimatesReport.xls** → `Multiples` (34×7) | Forward multiples export | **NTM, FY2027–FY2034, CY2026–CY2033** (US GAAP, dilution: basic) | — | **High** |
| **EstimatesReport.xls** → `Trends` (303×21) | Estimate trends | To FY2027+ | — | High |
| **EstimatesReport.xls** → `Revisions` (467×21) | Estimate revisions breadth | Last-month FY2027 | — | High |
| **EstimatesReport.xls** → `Recent Changes` (265×10) | Broker estimate changes | Recent, to Nov-2026 | — | Medium |
| **EstimatesReport.xls** → `Surprise` (311×113) | Beat/miss history | FY2022 → FY2026 | — | Medium |
| **Company Comparable Analysis.xls** → `Financial Data` (50×17) | Peer comps + **current price** | **As-Of Date: 2026-11-19**; LTM filing date 2026-11-09 | — | **High** |
| **Company Comparable Analysis.xls** → `Trading Multiples` (50×9) | Peer / comps export | As-Of **2026-11-19**; 10 peers + subject, LTM & NTM | — | **High** |
| **Company Comparable Analysis.xls** → `Implied Valuation` (69×9) | Comps-implied valuation | As-Of **2026-11-19**; EV→equity→per-share bridge | — | **High** |
| **Company Comparable Analysis.xls** → `Operating Statistics` (50×13) | Peer operating stats | As-Of 2026-11-19 | — | High |
| **Company Comparable Analysis.xls** → `Business Description` (44×3) | Peer descriptions | As-Of 2026-11-19 | — | Medium |
| **Company Comparable Analysis.xls** → `Credit Health Panel` (48×10) | Peer credit health | As-Of 2026-11-19 | — | Medium |
| **Company Comparable Analysis.xls** → `Valuation Chart` (32×2) | Chart stub (11 cells) | As-Of 2026-11-19 | — | Low |
| **Company Comparable Analysis.xls** → `Disclaimer` (26×1) | Disclaimer | — | — | Low |
| **Credit Health Panel.xls** → `Summary` (46×11) | Credit health | Latest panel | — | Medium |
| **Credit Health Panel.xls** → `Financials` (40×13) | Credit financials | Latest panel | — | Medium |
| **Credit Health Panel.xls** → `Operational Metrics Charts` (21×19) | Chart stub (13 cells) | — | — | Low |
| **Credit Health Panel.xls** → `Solvency Metrics Charts` (18×19) | Chart stub (8 cells) | — | — | Low |
| **Credit Health Panel.xls** → `Liquidity Metrics Charts` (15×19) | Chart stub (6 cells) | — | — | Low |
| **Credit Health Panel.xls** → `Disclaimer` (26×1) | Disclaimer | — | — | Low |
| **Short_Interest_Charting Excel Export Nov-19-2026.xls** → `Chart 1 with Data` (284×2) | Positioning / short interest | Series to **Nov-19-2026** | — | Medium |
| **Short_Interest_Charting ….xls** → `Attributions` (45×1) | Attribution notes | Nov-19-2026 | — | Low |
| **Public Ownership Insider Trading.xls** → `Insider Trading` (5058×11) | Ownership / insider trades | Full history to **Oct-05-2026** | — | Medium |
| **Public Ownership History.xls** → `History` (1835×6) | Institutional ownership | Quarterly to **Sep-30-2026** | — | Medium |
| **Board Members.xls** → `Board Members` (28×25) | Governance | Current roster | — | Low |
| **Professionals.xls** → `Professionals` (24×24) | Management roster | Current | — | Low |
| **Auditors.xls** → `Auditors` (75×6) | Auditor history | Historical | — | Low |
| **Customers.xls** → `Customers` (30×8) | Customer relationships | Recently disclosed, to Sep-2026 | — | Low |
| **Suppliers.xls** → `Suppliers` (28×8) | Supplier relationships | Latest **Sep-30-2026** | — | Low |
| **Strategic Alliances.xls** → `Strategic Alliances` (22×7) | Alliances | Latest **Apr-15-2025** | — | Low |
| **Investment Analysis Direct Investments.xls** → `Direct Investments` (173×21) | Investments / M&A history | From **Jan-08-2008** | — | Low |
| **Investment Analysis Co Investors.xls** → `Co-Investors` (90×3) | Co-investors | Historical | — | Low |
| **Events Calendar.xls** → `Events Calendar` (16×3) | Catalyst calendar | Latest entry **Nov-06-2026** | — | Medium |
| **Take-Two_Interactive_Software_Inc_-_Form_DEF_14A(Jul-27-2026).xls** → `No Data` (4×4, 1 cell) | Proxy export — **empty stub** | Filing dated **Jul-27-2026**; literal content: *"This filing has no tabular data to export."* | — | Low |
| **Alphabet Inc NasdaqGS GOOGL Key Developments.xls** → `Key Developments` (520×7) | **Off-subject file** — entity is `Alphabet Inc`, not TTWO | Events to **Nov-18-2026** | — | **Low / not TTWO** |

**Two inventory notes that are not failures but must be visible:**
1. The **DEF 14A export is a successfully-extracted empty stub** (`status: ok`, 1 populated cell, literal text *"This filing has no tabular data to export."*). It is not an extraction failure and not a Drive pointer stub — the proxy simply carried no tabular data for this CIQ export. The proxy's substance is not needed for valuation (governance read belongs to the management-governance module, which ran and has its own proxy evidence).
2. The **Alphabet / GOOGL Key Developments workbook is mis-filed into this pool** (manifest `entities` resolves it to `Alphabet Inc`). It is listed for completeness and carries no weight in any TTWO valuation input.

---

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | **United States — NasdaqGS, ticker TTWO**; incorporated in Delaware; HQ 110 West 44th Street, New York | FY26 10-K, cover page (Commission file 001-34003; "Delaware"); `Capital IQ Comps → Trading Multiples` header "NasdaqGS:TTWO", as of 2026-11-19 |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **US SEC** — domestic filer: Form 10-K annual, Form 10-Q quarterly, DEF 14A proxy. No local-equivalent substitution needed | FY26 10-K cover ("FORM 10-K … Pursuant to Section 13 or 15(d)"); Q2 FY27 10-Q cover |
| Reporting standard (US GAAP / IFRS / Ind AS) | **US GAAP** | `Capital IQ Estimates → Multiples`, header "Acctg. Standard: US GAAP"; `Capital IQ Estimates → Consensus`, same header line |
| Reporting currency (and scale) | **USD**; CIQ exports in USD millions ("Currency: Reported Currency; Units: S; In Millions; USD"); `ciq_facts.json` `currency: "USD"` | `Financials_Annual → Income Statement` units line; `ciq_facts.json` |
| Fiscal-year end | **31 March.** FY2026 = year ended Mar-31-2026; current fiscal year FY2027 ends **Mar-31-2027**. A "FY27" figure is therefore an Apr-2026→Mar-2027 year, NOT a calendar year — do not read FY and CY columns interchangeably | FY26 10-K cover ("fiscal year ended March 31, 2026"); `Estimates → Multiples` header "Current Fiscal Year End: Mar-31-2027" (which also prints separate FY and CY multiple rows) |
| Document language(s) | **English** for all 30 sources. No non-English document in this pool, so no translation step and no language-related gap arises | All extracts read in English |
| Interim reporting basis (§27) | **Standalone quarter** (US 10-Q). Next interim filing = FQ3 FY27, earnings release dated **Feb-09-2027** per the consensus export. Vendor "next quarter" estimates are already on the standalone basis the company files — no cumulative-stub restatement needed here | Q2 FY27 10-Q ("quarterly period ended September 30, 2026"); `Estimates → Consensus` header "FQ3 2027 Earnings Release Date: Feb-09-2027" |

This is a US / US-GAAP / USD issuer, so the module's US form names (10-K, 10-Q, DEF 14A) are the actual local documents. No US form is marked "missing" on a jurisdiction technicality.

---

## 2. Most Recent Sources

Age in months is measured from the **period-end parsed inside the document** to the run date 2026-11-20.

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | `10K_2025_26_0001628280-26-037434.pdf` | FY ended Mar-31-2026 | ~7.7 |
| Quarterly filing | `10Q_2Q_0001628280-26-072254.pdf` | Quarter ended Sep-30-2026 | ~1.7 |
| Capital structure / balance sheet | `Financials_Quarterly.xls → Balance Sheet` / `Capital Structure Summary` / `Capital Structure Details` (latest as-reported Nov-09-2026); filing source = Q2 FY27 10-Q | Sep-30-2026 | ~1.7 |
| Consensus / estimate export | `EstimatesReport.xls → Consensus` (+ `Guidance`, `Trends`, `Revisions`) | Current FY end Mar-31-2027; FY2027–FY2034 estimates live | ~0 (current) |
| Multiples export | `Financials_Quarterly.xls → Multiples` and `Financials_Annual.xls → Multiples`; forward set in `EstimatesReport.xls → Multiples` | Quarterly closes 2017-03-31 → latest close 2026-11-18 (39 historical + current) | ~0.1 |
| Peer / comps export | `Company Comparable Analysis.xls → Trading Multiples` / `Financial Data` / `Implied Valuation` | As-Of Date 2026-11-19 | ~0.03 (1 day) |
| Current price (IBKR / Capital IQ) | `Company Comparable Analysis.xls → Financial Data`, "Day Close Price Latest" = **USD 216.61** | As-of **2026-11-19** | ~0.03 (1 day) |
| Cash flow statement | `Financials_Quarterly.xls → Cash Flow` (LTM Sep-30-2026); filing source = Q2 FY27 10-Q; annual in `Financials_Annual.xls → Cash Flow` | Sep-30-2026 (LTM) / FY Mar-31-2026 | ~1.7 |
| Segment data | `Financials_Annual.xls → Segments`; FY26 10-K Note 21 | Mar-31-2026 — **one operating and reportable segment**; geography split available (US 59% / International 41%) | ~7.7 |

---

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | **Y** — USD **216.61**, as-of 2026-11-19, **pool-verified and fresh** (1 calendar day before the run date; well inside the 5-trading-day staleness line, so no staleness cap) | `Capital IQ Comps → Financial Data`, "Day Close Price Latest", As-Of 2026-11-19; corroborated by `ciq_facts.json → current_price` = 216.61 | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | **Y** — cover-page count **187,213,488** shares outstanding net of treasury as of Oct-26-2026; CIQ "Shares Outstanding Latest" 187.2m as-of 2026-11-19 (the two tie). Note: diluted = basic in the loss-making trailing periods (basic and diluted loss per share are printed as one line) | Q2 FY27 10-Q, cover page; `Capital IQ Comps → Financial Data`; `ciq_facts.json → shares_outstanding_m` = 187.2 | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | **Y** — RSU issuance/forfeiture and net-share-settlement lines in the equity statement and cash flow; **2026 Convertible Notes** with only **USD 29.4m** principal outstanding at Mar-31-2026, maturing **Dec-15-2026**, no regular interest, no accretion. Caveat: CIQ multiples/estimates tabs are on a **"Dilution: Basic"** basis — a labelled basis difference `01` must reconcile | FY26 10-K, Convertible Notes note; Q2 FY27 10-Q, statements of stockholders' equity and cash flows; `Estimates → Multiples` and `Financials → Multiples` headers ("Dilution: Basic") | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | **Y — OPERATING company** (interactive-entertainment publisher), **single operating and reportable segment**. Not a financial, REIT, commodity or holding company. Per the Business-Type Method Map: FCFF DCF + reverse-DCF as intrinsic, EV/EBITDA, EV/EBIT, P/E, FCF yield as multiples | FY26 10-K: *"We have one operating and reportable segment. See Note 21"*; `ciq_facts.json → segments_revenue`: "Sale of Software Titles 6,656 (100%)" | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | **Y** — total debt 2,911.4m and net debt 1,237.8m on the CIQ vendor basis at Sep-30-2026; cash & ST investments 1,673.6m; **preferred equity and minority interest both nil**. Dated maturity ladder available (2026: 30; 2027: 600; 2028: 800; 2029: 300; 2032: 500; 2034: 300; nearest 2026-12-15; all fixed-rate) | `ciq_facts.json → total_debt_m / net_debt_m / debt_maturity_wall`; `Capital IQ Comps → Implied Valuation` bridge rows; `Financials_Quarterly → Capital Structure Details` | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | **Y** — LTM to Sep-30-2026: revenue 6,409.7m, EBITDA 724.9m, **EBIT −112.5m**, **diluted EPS −1.29**; FY2026 (Mar-31-2026): revenue 6,656m, EBITDA 788m. Annual series FY2017→FY2026 and quarterly series Jun-2016→Sep-2026 both complete | `ciq_facts.json → ltm_ebitda_m / multi_year_trajectory`; `Capital IQ Comps → Financial Data`; `Financials_Annual/Quarterly → Income Statement` | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | **Y** — LTM cash from operations 367.1m; CIQ "Levered Free Cash Flow" 787.6m is an **after-interest vendor definition, NOT the §15 `CFO − capex` FCF** and must be rebuilt, not quoted. Capex available in the Supplemental tabs and in the 10-K/10-Q cash flow statements | `ciq_facts.json → ltm_ocf_m / levered_fcf_m` (whose own source_ref carries that warning); `Financials_Quarterly → Cash Flow`; Q2 FY27 10-Q cash flow statement | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | **Y** — 29 analyst target prices (mean USD 283.93 / median 289.00, high/low 330.00/170.00, s.d. 26.18); recommendation Buy (1.21); NTM EPS 9.61 and NTM EBITDA 2,349.1m; forward multiple grid NTM and FY2027→FY2034 / CY2026→CY2033; revisions breadth FY27 EPS 9↑/2↓ vs revenue 6↑/9↓ last month | `Estimates → Consensus`; `Estimates → Multiples`; `Capital IQ Comps → Implied Valuation`; `ciq_facts.json → consensus_view / eps_revisions / revenue_revisions` | NTM/FY multiples and DCF near-term path |
| Historical multiple data | **Y** — 39 historical quarterly closes plus the current close (2017-03-31 → 2026-11-18) across TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E, P/BV, with Average/High/Low/Close per quarter. Current TEV/LTM EBITDA 52.2x sits at the 74th percentile of a 17.5–94.4x range (median 38.0x) | `Financials_Quarterly → Multiples`; `Financials_Annual → Multiples`; `ciq_facts.json → ev_ebitda_current_x / ev_ebitda_percentile / range_position` | Own-history re-rating read |
| Peer / comps data | **Y** — 10 named peers with LTM and NTM multiples as-of 2026-11-19: Roblox, Electronic Arts, Playtika, Nintendo, PLAYSTUDIOS, 37 Interactive, NEXON, Ubisoft, Konami, tinyBuild. Peer TEV/EBITDA median 13.0x (high 16.7 / low 4.0); NTM TEV/EBITDA median 9.96x; NTM P/E median 21.17x. **Caveat: the Electronic Arts row is entirely blank (all dashes)** — the single closest comparable contributes no multiple | `Capital IQ Comps → Trading Multiples`, As-Of 2026-11-19; `ciq_facts.json → peer_ev_ebitda` | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | **Partial → N for EBIT.** Revenue disaggregation exists (one reportable segment = 100% "Sale of Software Titles"; geography US 3,940m / International 2,716m for FY2026), but there is **no segment-level EBIT** because the company discloses **one** segment. This is a disclosure fact, not an extraction gap | FY26 10-K, Note 21 and Item 1; `Financials_Annual → Segments`; `ciq_facts.json → segments_revenue / geographic` | Sum-of-the-parts |
| Dividend / buyback data | **Y** — **no dividend ever paid** and none expected ("We have never declared or paid cash dividends … We do not expect to declare or pay any cash dividends in the foreseeable future"); a share-repurchase programme exists, with 11.7m shares repurchased under it as of Sep-30-2026 and 10.0m remaining authorised | FY26 10-K, "Dividend Policy"; Q2 FY27 10-Q, repurchase-programme disclosure | Shareholder-yield read |

---

## 4. Cross-Module Availability

All four upstream modules completed in this run root (`analyses/TTWO_2026-11-19/`), checked against the actual filesystem.

| Cross-Module Output | Available? (Y/N) |
|---|---|
| `business-model/03_segment-map.md` | **Y** |
| `business-model/08_competitive-map.md` | **Y** |
| `business-model/07_business-quality.md` | **Y** |
| `business-model/09_moat.md` | **Y** |
| `business-model/10_external-dependency.md` | **Y** |
| `earnings/01_historical-financials.md` | **Y** |
| `earnings/04_guidance-consensus.md` | **Y** |
| `earnings/03_margin-drivers.md` | **Y** |
| `earnings/07_earnings-sensitivity.md` | **Y** |
| `earnings/06_earnings-quality.md` | **Y** |

Also present and directly load-bearing for this module (Cross-Module Inputs section of `MODULE_RULES.md`):

| Additional cross-module output | Available? | What it binds |
|---|---|---|
| `balance-sheet-survival/01_capital-structure-and-leverage.md` | **Y** | **Canonical net debt.** It reports gross borrowings 2,519.8m less cash 1,149.4m = **net debt 1,370.4m on the strict §15 basis**. The CIQ vendor figure is 1,237.8m (and CIQ total debt 2,911.4m includes leases). Per the Anchor-consistency gate, `01_price-and-capital-structure` must adopt the **filing-based 1,370.4m strict** figure as canonical, show the vendor figure beside it, and explain the gap (lease inclusion and investment netting) — not silently substitute either one. |
| `balance-sheet-survival/99_balance-sheet-survival-synthesis.md` | **Y** | Solvency verdict **"Adequate"** — **no distress cap** on the headline (CLAUDE.md §18). |
| `management-governance/04_ownership-and-insider-behavior.md` and `99_management-governance-synthesis.md` | **Y** | **RF-OWN-004 (structurally unaligned controlling owner, §24 Filter 6) = N — NOT fired** (recorded verbatim in the synthesis cap table). The §24 Filter 6 value-trap cap on valuation attractiveness therefore **does not bind**. The governance verdict is nonetheless *"Misaligned or weak stewardship"* with no hard disqualifier — a qualifier the valuation agents must carry, not drop. |

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | **N** — USD 216.61 as-of 2026-11-19 is pool-verified and 1 day old | 01, 05, 07, 99 | **None.** Price-state = `pool-verified`, fresh. Margin of safety and downside-to-bear both unlock; no staleness cap (as-of is inside 5 trading days) |
| No consensus / forward estimates | **N** — 29-estimate consensus, NTM and FY2027–FY2034 grid | 02, 03, 04, 05 | None |
| No peer data | **N** — 10 peers with LTM and NTM multiples as-of 2026-11-19 | 03, 06 | None. (The blank Electronic Arts row is a named weakness inside a present peer set, not an absent peer set — `03` must say so rather than treat the median as unaffected) |
| No segment-level data | **N for the data, Y for the consequence** — revenue and geography are disclosed; segment EBIT does not exist because there is **one** reportable segment | 06 | **SOTP not possible — but as a single-segment structure, not a data gap.** Per the Segment/SOTP rule, `06` returns *"single-segment — SOTP collapses to the consolidated read"*. The Score-Cap row "SOTP not possible **for a multi-segment business** → usefulness max 80" does **NOT** bind, because TTWO is not multi-segment |
| No balance sheet / capital structure | **N** — balance sheet to Sep-30-2026, dated maturity ladder, nil preferred and nil minority | 01, 04, 06 | None |
| No cash flow statement | **N** — annual FY2017→FY2026 and quarterly to Sep-30-2026 plus LTM | 04 | None |

**Additional conditions that are not in the six-row table but WILL shape the module — flagged here so no downstream agent discovers them late:**

- **The trailing earnings base is negative, so trailing earnings multiples are unusable.** LTM EBIT is **−112.5m** and LTM diluted EPS is **−1.29**, which is why the comps export prints TTWO's LTM TEV/EBIT and LTM P/E as "NM" (not meaningful). All earnings-multiple work (`02`, `03`) must run on a **forward (NTM / FY27+)** basis, with the period basis labelled on every figure; a trailing P/E or EV/EBIT for TTWO cannot be computed at all, let alone compared to a peer median. Revenue and EBITDA multiples remain computable on both bases.
- **Sector-level multiple history is not in this pool.** The peer workbook carries only current (2026-11-19) peer multiples — no peer-group or sector-index multiple history 3–5 years back. The company's **own** 10-year multiple history IS present, so `02` can inspect its own window, but neither `02` nor `03` can source the sector's own re-rating over that window from the pool. Per the Score-Cap table this is **no cap by itself** (an honestly-absent check is not a defect), but `02`/`03` must write *"Not assessable — no sector-level multiple history"* rather than assume the anchor is stable, and `99` must record the gap in its Reconciliation so it is visible rather than silently skipped.
- **Numeric reading check absent (see header).** Every workbook-cell figure in this module is mechanically unverified. Any value-determining amount must be checked against the original source inside this frozen capability before it carries a fair-value conclusion.
- **Two basis traps already visible in the pool:** (a) CIQ "Levered Free Cash Flow" 787.6m is after interest and is **not** §15 FCF — `04` must rebuild `CFO − capex` from the filings; (b) CIQ multiples and estimates tabs are on a **"Dilution: Basic"** basis while per-share fair value must use a fully diluted count — `01` states both once and every agent reuses them.

---

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples (`02`) | **Y** | None for revenue/EBITDA. Trailing P/E and EV/EBIT are structurally NM (negative LTM EBIT/EPS) | 39 historical quarterly closes + current, 2017-03-31 → 2026-11-18. Current TEV/LTM EBITDA 52.2x = 74th percentile of 17.5–94.4x (median 38.0x). Must carry the LTM-vs-NTM basis label on any multiple lifted from this band, and must write "Not assessable" on the sector-cycle check |
| Peer relative valuation (`03`) | **Y** | None. Weakness, not a blocker: the Electronic Arts row is blank | 10 peers, As-Of 2026-11-19. Peer TEV/EBITDA median 13.0x vs TTWO 52.2x; NTM TEV/EBITDA median 9.96x vs TTWO 17.79x; NTM P/E median 21.17x vs TTWO 22.54x. The comps workbook's own `Implied Valuation` tab already publishes a peer-implied per-share bridge to reconcile against |
| Intrinsic DCF — Operating FCFF (`04`) | **Y** | None | Income statement, cash flow and balance sheet all present on both annual and quarterly bases; capex in the Supplemental tabs and the filings. §15 FCF must be rebuilt as `CFO − capex` (LTM CFO 367.1m), not taken from the vendor's levered-FCF line. Cost-of-Capital Reality Test is runnable: search the 10-K for a disclosed impairment / lease / pension discount rate and prove scope before using one |
| Reverse DCF (`05`) | **Y** | None — requires `04`'s WACC and normalised FCF base, and a pool-verified price, which exists (216.61) | Must invert `04`'s own model, not re-derive an independent WACC. With LTM EBIT negative and NTM EBITDA 2,349.1m, the "what's priced in" read turns on the forward ramp, and the reverse-DCF is the main defence against a reverse-engineered discount rate |
| SOTP (`06`) | **N** | Segment EBIT does not exist — **one** operating and reportable segment (FY26 10-K Note 21) | Not a data gap and not a guessing opportunity. `06` returns the single-segment note ("SOTP collapses to the consolidated read"); it must not manufacture a breakup from the US/International geography split, which has no segment EBIT behind it |

---

## 6. Sufficiency Verdict

- **Verdict:** **Sufficient**
- **Reason:** A complete earnings and cash-flow base (income statement and cash flow, annual FY2017–FY2026 and quarterly through Sep-30-2026), full capital-structure data (balance sheet, dated maturity ladder, nil preferred and nil minority), forward-looking and relative inputs (a 29-estimate consensus with an NTM/FY2027–FY2034 multiple grid, plus a 10-peer comps export), and a pool-verified current price of USD 216.61 as-of 2026-11-19 are all present, with zero extraction failures across 30 sources and 62 tabs.
- **Methods that can run:** own-history multiples (`02`), peer relative valuation (`03`), intrinsic FCFF DCF (`04`), reverse-DCF (`05`). **Four** of the five methods — comfortably above the two-method triangulation bar. SOTP (`06`) cannot run, because the company discloses one reportable segment.
- **Active partial-data caps:** none of the six partial-data rows fires, so no partial-data cap binds. Three verdict-adjacent caps are explicitly tested and recorded as **not binding**: the no-price cap (price is pool-verified and 1 day old), the price-staleness cap (as-of is inside 5 trading days), and the §24 Filter 6 unaligned-owner cap (RF-OWN-004 = N in `management-governance/99`). The "SOTP not possible" usefulness cap does not bind either, because it is written for a multi-segment business and TTWO is single-segment.
- **Critical missing items:** none that blocks a method. Four conditions must nonetheless travel forward with every downstream read, and the first two are the ones most likely to produce a wrong number: (1) **trailing earnings multiples are structurally unusable** — LTM EBIT −112.5m and LTM diluted EPS −1.29 make LTM P/E and EV/EBIT not meaningful, so the earnings-multiple work must be forward-based with the period basis labelled every time; (2) **the numeric reading check is absent from this generation**, so every workbook-cell figure is mechanically unverified and any value-determining amount needs a source check inside the frozen capability; (3) **no sector-level multiple history exists in the pool**, so the Sector Cycle Reality Test is "Not assessable" for both `02` and `03` and must be recorded as a named gap rather than assumed stable; (4) **the canonical net-debt figure is the filing-based strict 1,370.4m** from `balance-sheet-survival/01`, not the CIQ vendor 1,237.8m — `01` adopts the former, shows the latter beside it, and explains the lease / investment-netting gap.
