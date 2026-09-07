# Valuation Data Triage — NVT

Evidence binding: frozen. `DATA_PATH` = `NOSTRA_FROZEN_EVIDENCE_ROOT` (cited logically as `data/NVT/`); all reads resolved through the bound generation `6db3284…1aecd1e6`. The extractor was not re-run and no live `data/NVT/` or `_pool_extracts/` path was read. Manifest totals: 15 sources, 2 workbooks, 20 tabs, 33 extracts written, **0 failures** — no source is in a `fail` / `fallback-text` / `missing-dependency` state, and there are no Drive pointer stubs.

## 1. File Inventory

"Period Covered" is parsed from INSIDE each document (period-end / "as of" / fiscal-year line), never from a file timestamp. Workbook tabs are listed as their own rows (parent file + sheet + rows×cols).

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| `nVent Electric plc, 2025.pdf` | Annual filing — **Form 10-K, fiscal year ended December 31, 2024** | FY2024 (Dec-31-2024) | not used (frozen pool; sync date is not evidence) | High |
| `nVent Electric plc, Q2 2026.pdf` | Quarterly filing — Form 10-Q | Quarterly period ended June 30, 2026 | not used | High |
| `nVent Electric plc, Q1 2026.pdf` | Quarterly filing — Form 10-Q | Quarterly period ended March 31, 2026 | not used | High |
| `nVent Electric plc, 2026.pdf` | Quarterly filing — Form 10-Q (**duplicate of the Q1 2026 10-Q**; same cover, "On March 31, 2026, 161,720,452 shares … outstanding") | Quarterly period ended March 31, 2026 | not used | Medium (duplicate) |
| `nVent Electric plc, 2026 rev.pdf` | **Form 11-K** — employee retirement-savings plan annual report (NOT the FY2025 10-K) | Plan fiscal year ended December 31, 2025 | not used | Low |
| `nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf` | Transcript | Q2 2026, call dated Jul 31, 2026 | not used | Medium |
| `nVent Electric plc, Q1 2026 Earnings Call, May 01, 2026.pdf` | Transcript | Q1 2026, call dated May 1, 2026 | not used | Medium |
| `nVent Electric plc, Q1 2026 ppt.pdf` | Investor deck (earnings presentation) | Q1 2026, dated May 1, 2026 | not used | Medium |
| `2026-William-Blair-Conference-nVent-NVT-Presentation.pdf` | Investor deck (conference) | Dated June 3, 2026 | not used | Medium |
| `nVent-to-Acquire-Maverick-Power-2026.pdf` | Material-event press release — $1.75bn acquisition + up to $550m earnout, close expected Q4 2026, funded from cash on hand + new debt | Dated **2026-08-24** | not used | **High** (post-dates every vendor export) |
| `nVent Electric plc NYSE NVT Competitors.rtf` | Peer/comps — CIQ named-competitor list with LTM revenue only (no multiples) | LTM dates to Jun-30-2026 | not used | Medium |
| `nVent Electric plc NYSE NVT Products.rtf` | Other — CIQ product list | undated product catalogue | not used | Low |
| `nVent Electric plc NYSE NVT Strategic Alliances.rtf` | Other — CIQ alliances list | undated | not used | Low |
| `nVent Electric plc NYSE NVT Financials.xls` → **Key Stats** (91×9) | Multiples export + **current price / capitalization** — Share Price 171.16, Shares Out. 161.857939m, Market Cap 27,703.6m, TEV 29,080.5m | FY2022A–FY2025A, LTM Jun-30-2026, FY2026E–FY2028E; pricing as of 2026-08-12 | not used | High |
| `…Financials.xls` → **Income Statement** (108×7) | Income statement | FY2021–FY2025 + LTM Jun-30-2026 | not used | High |
| `…Financials.xls` → **Balance Sheet** (94×7) | Capital structure — Cash 256.0, Total Debt 1,632.9, Net Debt 1,376.9, Common Equity 3,986.9 | Dec-31-2023 → **Jun-30-2026** | not used | High |
| `…Financials.xls` → **Cash Flow** (76×7) | Cash flow statement — capex, dividends, buybacks | FY2021–FY2025 + LTM Jun-30-2026 | not used | High |
| `…Financials.xls` → **Multiples** (91×9) | Multiples export — TEV/LTM & NTM EBITDA/EBIT/Revenue, P/E, P/BV (High/Low/Avg/Close) | Quarterly closes 2025-03-31 → **2026-08-12** (7 columns, last = current) | High |
| `…Financials.xls` → **Historical Capitalization** (39×7) | Capital structure history | Pricing as of 2025-05-02 → 2026-07-31 | not used | Medium |
| `…Financials.xls` → **Capital Structure Summary** (99×7) | Debt composition | FY2024, FY2025, 3 months Jun-30-2026 | not used | High |
| `…Financials.xls` → **Capital Structure Details** (40×10) | Debt maturities / fixed-floating | FY2025 (Dec-31-2025) as-reported | not used | Medium |
| `…Financials.xls` → **Ratios** (161×7) | Returns / leverage ratios (ROIC) | FY2021–FY2025 + LTM Jun-30-2026 | not used | Medium |
| `…Financials.xls` → **Supplemental** (74×7) | Supplemental items | FY2020–FY2025 (+LTM) | not used | Low |
| `…Financials.xls` → **Industry Specific** (15×6) | Industry items (sparse, 20 cells) | n/a | not used | Low |
| `…Financials.xls` → **Pension OPEB** (243×7) | Pension / OPEB (discount-rate cross-check) | FY2020–FY2025 (+LTM) | not used | Low |
| `…Financials.xls` → **Segments** (84×7) | Segment data — revenue, operating profit, assets, D&A by segment | FY2020–**FY2025 (Dec-31-2025)**, annual only | not used | High |
| `nVentElectricplcNYSENVTEstimatesReport.xls` → **Consensus** (462×41) | Consensus estimates — Revenue/EBITDA/EPS FY2026E–FY2030E, target price mean 202.13 (15 estimates), Last Close 171.16 | Current FY end Dec-31-2026; FQ3 2026 release Oct-30-2026 | not used | High |
| `…EstimatesReport.xls` → **Guidance** (179×41) | Company guidance vs consensus | FQ3 2018 → FY 2026 | not used | High |
| `…EstimatesReport.xls` → **Multiples** (23×7) | Forward multiples export — NTM and FY2026E–FY2030E TEV/EBITDA, TEV/EBIT, P/E, P/BV | NTM / FY2026E–FY2030E | not used | High |
| `…EstimatesReport.xls` → **Recent Changes** (265×10) | Estimate revisions (dates to **2026-08-07** — dates the export) | to 2026-08-07 | not used | Medium |
| `…EstimatesReport.xls` → **Revisions** (467×12) | Revision breadth | last-month breadth, FY2026 | not used | Medium |
| `…EstimatesReport.xls` → **Surprise** (219×35) | Beat/miss history | FY2021–FY2025 | not used | Medium |
| `…EstimatesReport.xls` → **Trends** (300×16) | Estimate trend | to FY2026 | not used | Medium |

No `external/` directory exists in this pool, so there is no `## 1A. External Data` table and no external document moved any conclusion below.

Two inventory notes that matter downstream:
1. **The FY2025 10-K is not in the pool.** The only 10-K present covers **FY2024**. FY2025 annual figures exist only inside the Capital IQ workbook (a §4 tier-5 vendor export) and inside the FY2025 comparatives of the 2026 10-Qs. Cite them accordingly — never as "FY2025 10-K".
2. **The Maverick Power acquisition (announced 2026-08-24, $1.75bn + up to $550m earnout, target 2026 revenue ~$700m, close expected Q4 2026, funded from cash on hand and new debt) post-dates every vendor export** (estimates as of 2026-08-07, price/multiples as of 2026-08-12) and the Jun-30-2026 balance sheet. Consensus, the EV bridge, and the price anchor are all **pre-deal**.

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States — NYSE, ticker NVT (company incorporated in **Ireland**; principal executive offices London, United Kingdom) | `FY24 10-K, cover page` ("Ireland … Commission file number 001-38265"); `Q2 FY26 10-Q, cover page` |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **US SEC** — Forms 10-K / 10-Q / 11-K | `FY24 10-K, cover`; `Q2 FY26 10-Q, cover`; `FY25 Form 11-K, cover` |
| Reporting standard (US GAAP / IFRS / Ind AS) | **US GAAP** | `Capital IQ Estimates export → Multiples tab` ("Acctg. Standard: US GAAP"); `Q2 FY26 10-Q, condensed consolidated financial statements` |
| Reporting currency (and scale) | **USD**, presented in millions (per-share in dollars) | `Capital IQ Financials export → Income Statement` ("In Millions of the reported currency"); `Q2 FY26 10-Q, income statement` |
| Fiscal-year end | **December 31** (FY2026 ends Dec-31-2026) | `FY24 10-K, cover` ("For the Fiscal Year Ended December 31, 2024"); `Capital IQ Estimates export → Consensus` ("Current Fiscal Year End: Dec-31-2026") |
| Document language(s) | English (all 15 sources) | pool manifest, generation `6db3284…` |

US form names are correct here because this **is** a US SEC filer — no local-equivalent substitution is needed (CLAUDE.md §27).

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | `nVent Electric plc, 2025.pdf` (Form 10-K) | FY ended Dec-31-2024 | ~20.2 |
| Quarterly filing | `nVent Electric plc, Q2 2026.pdf` (Form 10-Q) | Quarter ended Jun-30-2026 | ~2.2 |
| Capital structure / balance sheet | `nVent Electric plc NYSE NVT Financials.xls` → Balance Sheet; and `Q2 2026 10-Q` balance sheet | As of Jun-30-2026 | ~2.2 |
| Consensus / estimate export | `nVentElectricplcNYSENVTEstimatesReport.xls` → Consensus / Trends / Revisions | Export as of ~2026-08-07 (latest revision date) | ~1.0 |
| Multiples export | `…Financials.xls` → Multiples; `…EstimatesReport.xls` → Multiples | Closes to 2026-08-12; NTM/FY2026E–FY2030E | ~0.9 |
| Peer / comps export | `nVent Electric plc NYSE NVT Competitors.rtf` — **names + LTM revenue only, no peer multiples** | LTM dates to Jun-30-2026 | ~2.2 |
| Current price (IBKR / Capital IQ) | `…Financials.xls` → Key Stats, Current Capitalization — **USD 171.16** (Shares Out. 161.857939m; corroborated by Estimates → Consensus "Latest Price/Last Close 170.70/171.16") | Close **2026-08-12** | ~0.9 (26 calendar days ≈ **18–19 trading days**) |
| Cash flow statement | `…Financials.xls` → Cash Flow; and `Q2 2026 10-Q` cash flow statement | FY2021–FY2025 + LTM Jun-30-2026 | ~2.2 |
| Segment data | `…Financials.xls` → Segments; `Q2 2026 10-Q` segment note | Annual to Dec-31-2025 (workbook); quarterly in the 10-Q | ~8.2 (annual) |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | **Y (stale)** | `Capital IQ Financials export → Key Stats, Current Capitalization, close 2026-08-12` — USD 171.16 | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | `Q2 FY26 10-Q, income statement` — weighted-average diluted 164.1m; shares outstanding at Jun-30-2026 = 161,857,939 (`Q2 FY26 10-Q, cover`) | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y | `Q2 FY26 10-Q, EPS note` ("Dilutive impact of stock options, restricted stock units…", plus anti-dilutive options excluded); `Q2 FY26 10-Q, Note 14 (Share-Based Compensation)` | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y — **Operating company** (electrical connection and protection products; two reportable segments) | `FY24 10-K, Item 1`; `Capital IQ Financials export → Segments` | Determines which valuation methods are valid → FCFF DCF + reverse-DCF primary intrinsic; EV/EBITDA, EV/EBIT, P/E, FCF yield primary multiples |
| Total debt, cash, minority/preferred | Y | `Capital IQ Financials export → Balance Sheet` (Jun-30-2026): Cash & ST investments 256.0, Total Debt 1,632.9; `→ Key Stats`: Pref. Equity "–", Total Minority Interest "–" | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | `Capital IQ Financials export → Income Statement` (FY2021–FY2025 + LTM Jun-30-2026); `Q1/Q2 FY26 10-Q` | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | `Capital IQ Financials export → Cash Flow` (capex 112.9 LTM; CFO 690.6 LTM per `ciq_facts.json`); `Q2 FY26 10-Q, cash flow statement` | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | `Capital IQ Estimates export → Consensus` — Revenue/EBITDA/EPS FY2026E–FY2030E, 15 brokers, target price mean 202.13 / median 200.00; `→ Multiples` NTM and FY2026E–FY2030E | NTM/FY multiples and DCF near-term path |
| Historical multiple data | **Y, but short window** | `Capital IQ Financials export → Multiples` — only **7 quarterly close columns** (2025-03-31 → 2026-08-12), i.e. ~1.5 years, not the 3–5 years the own-history method wants | Own-history re-rating read |
| Peer / comps data | **N (names only)** | `nVent Electric plc NYSE NVT Competitors.rtf` gives named peers (ABB, Eaton, Atkore, 3M, Forgent Power Solutions and others) with LTM revenue; **no peer multiples, no comps export** — `ciq_facts.json` `peer_ev_ebitda: missing` ("CIQ 'comps' export not found for NVT") | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y (trailing) | `Capital IQ Financials export → Segments` — FY2025: Systems Protection revenue 2,592.9 / operating profit 537.0; Electrical Connections 1,300.2 / 372.6; unallocated corporate −123.8 and unallocated intangible amortization −147.1 | Sum-of-the-parts |
| Dividend / buyback data | Y | `Capital IQ Financials export → Cash Flow` — LTM common dividends paid 132.9, repurchases 58.0; `Q2 FY26 10-Q` — cash dividends 0.21/share in Q2 2026 | Shareholder-yield read |

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

Also present in this run root and required by the module's Cross-Module Inputs rules: `balance-sheet-survival/01_capital-structure-and-leverage.md` (the **canonical** filing-based gross/net-debt figure `01` must adopt ahead of the CIQ vendor aggregate), the rest of `balance-sheet-survival/` (00, 02–06, 99), the full `management-governance/` module (00–12, 99 — read `04_ownership-and-insider-behavior.md` and `99` for any RF-OWN-004 unaligned-owner flag), and `competitive-intel/`.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | **N** — a pool-verified price exists (USD 171.16, close 2026-08-12), but it is **stale** | 01, 05, 07, 99 | The no-price cap does **not** bind; margin of safety and downside-to-bear remain assessable. The **stale pool-verified price** cap binds instead: as-of is ~18–19 trading days before the run date (>15), so **valuation confidence max 60**, `01` must document a refresh attempt, and the price-relative reads carry a mandatory inline staleness flag |
| No consensus / forward estimates | N | 02, 03, 04, 05 | none |
| No peer data | **Y** — peer *multiples* absent; only a named-competitor list with LTM revenue | 03, 06 | **Overall usefulness max 70**; `03` runs on own history unless peer multiples are web-sourced and labelled unverified; `06` segment multiples must be justified from named comparables or marked low-confidence |
| No segment-level data | N — two reportable segments with revenue, operating profit, assets and D&A | 06 | none, but **no forward (NTM/FY+1) segment estimates exist in the pool**, so `06` must apply the forward-basis hard rule and suppress rather than publish a trailing-earnings breakup as a weighted method |
| No balance sheet / capital structure | N | 01, 04, 06 | none |
| No cash flow statement | N | 04 | none |

Two further caps flagged for the synthesizer, from evidence rather than absence:
- **Short own-history multiple window.** The Multiples tab carries only ~7 quarterly closes (<8 quarters ≈ 2 years). `ciq_facts.json` `range_position` itself reads "LOW-CONFIDENCE (6 closes <8q ≈2y) — floor read unreliable". `02` must state this limitation rather than present a 3–5 year band it does not have.
- **Sector Cycle Reality Test inputs are not in the pool.** No sector index / ETF proxy multiple history and no peer-group historical multiples exist here. Unless web-sourced and labelled, `02` and `03` must state *"Not assessable — no sector-level multiple history"*. That honest absence carries no cap by itself, but `99` must record the gap in its Reconciliation rather than skip it silently.

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | **Y (limited)** | 3–5 year multiple history; sector-cycle reference | Multiples tab has TEV/LTM & NTM EBITDA/EBIT/Revenue, P/E, P/BV (High/Low/Avg/Close) but only 2025-03-31 → 2026-08-12. Current TEV/LTM EBITDA 26.2x vs a 6-close range of 15.4–30.3x (median 23.2x) — a short, upward-trending window, so the band is a weak anchor |
| Peer relative valuation | **Partial** | Peer multiples / comps export | Named peers exist (`Competitors.rtf`, plus `business-model/08_competitive-map.md`) but no peer valuation data in the pool. Either web-source peer multiples (labelled unverified, dated) or run on own history and flag it |
| Intrinsic DCF (Operating FCFF) | **Y** | Risk-free rate, ERP, beta (not in pool — web-sourced and dated) | Full inputs present: CFO and capex (LTM CFO 690.6, capex 112.9), D&A, effective tax rate 22.4% H1-2026 (`Q2 FY26 10-Q, MD&A`), consensus path to FY2030. For the mandatory Cost-of-Capital Reality Test, the pool contains a company-disclosed rate: **"We utilized a 10.0% discount rate for each reporting unit"** in the goodwill impairment test (`FY24 10-K, Critical Accounting Estimates`) — a **reporting-unit** rate, so `04` must run the scope test before treating it as a group anchor; lease incremental borrowing rates and pension discount rates are also disclosed (`FY24 10-K, lease note`; `→ Pension OPEB` tab) |
| Reverse DCF | **Y** | — | A pool-verified price exists, so "what's priced in" is computable; it must invert `04`'s own WACC, horizon, terminal g and normalized FCF base, and the answer must be flagged as being priced **before** the Maverick announcement |
| SOTP | **Y (trailing only, likely suppressed)** | Forward segment metrics; segment comparables' multiples | Two segments with FY2025 revenue, operating profit, assets and D&A, plus named unallocated buckets (corporate −123.8, intangible amortization −147.1) that must not vanish. But with no forward segment estimates and no peer multiples in the pool, the forward-basis hard rule likely forces "not structurable on a forward basis"; any trailing build is a labelled sanity check only, never a weighted method |

## 6. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** The earnings base (income statement and cash flow), the capital structure (Jun-30-2026 balance sheet), consensus estimates to FY2030, segment data and a pool-verified price are all present, so at least four valuation methods can run — but the pool holds **no peer valuation multiples**, the price anchor is **~18–19 trading days stale and pre-dates the announced $1.75bn Maverick Power acquisition**, and the own-history multiple window is only ~1.5 years.
- **Methods that can run:** own-history multiples (short window, low-confidence band), peer relative valuation (only if peer multiples are web-sourced and labelled unverified — otherwise own-history only), intrinsic FCFF DCF, reverse-DCF, and SOTP (trailing basis; forward basis likely not structurable).
- **Active partial-data caps:**
  - No peer data → **overall usefulness max 70**; `03` and `06` must flag the substitution.
  - Stale pool-verified price (close 2026-08-12, ~18–19 trading days before 2026-09-07, >15) → **valuation confidence max 60**; `01` must attempt a refresh, and `07`/`99` must carry an inline staleness flag with the as-of date on every price-relative read.
  - Sector Cycle Reality Test inputs absent → no cap by itself, but `02`/`03` must state "Not assessable — no sector-level multiple history" and `99` must record the gap.
- **Critical missing items:**
  - Peer multiples / Capital IQ comps export (`ciq_facts.json`: `peer_ev_ebitda`, `shares_outstanding_m`, `current_price` all `missing` — "CIQ 'comps' export not found for NVT"). Note the price and share count ARE recoverable from the Financials → Key Stats tab (171.16; 161.857939m) and from the Q2 10-Q cover (161,857,939 shares); the sidecar gap is a parser scope limit, not a data gap. The peer multiples genuinely are absent.
  - **FY2025 10-K.** The only annual filing in the pool is the FY2024 10-K; FY2025 annual figures are available only from the Capital IQ workbook (tier-5 vendor) and the 10-Q comparatives. Do not cite FY2025 numbers to a filing that is not here.
  - A **post-2026-08-24 price and post-deal consensus.** Every vendor input pre-dates the Maverick Power announcement, so the EV bridge, the forward estimates and the reverse-DCF all describe a pre-deal nVent.
  - Own multiple history longer than ~7 quarterly closes.
