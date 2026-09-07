# Solvency Data Triage — NVT

**Company:** nVent Electric plc (NYSE: NVT) · **Data pool:** data/NVT/ (frozen evidence generation `6db32848…d1e6`) · **Triage date:** 2026-09-07
**Pool integrity:** manifest reports 15 sources, 2 workbooks, 20 tabs, 33 extracts written, **0 failures**. No `external/` folder exists in this pool, so there are no external-research rows and no §1A table.
**Periods below are read from INSIDE each document** (period-end / "as of" / fiscal-year lines), not from file timestamps (fix F23). Every file in the pool was synced on 2026-09-07, so the sync date carries no information.

---

## 1. File Inventory

Every one of the 15 pool files is listed. Both multi-tab workbooks are broken out: each of the 20 tabs is its own row with parent file, sheet name and rows x cols, reconciled against `manifest.json`. No workbook appears as a single opaque row.

### 1.1 Documents (13 non-workbook files)

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| nVent Electric plc, 2025.pdf | Annual filing — SEC Form 10-K, audited | FY ended Dec 31, 2024 (filed 2025) | 2026-09-07 (Drive sync — not informative) | **High** — Note 10 Debt, Note 13 Benefit Plans, Note 17 Leases, Note 18 Commitments & Contingencies, MD&A liquidity |
| nVent Electric plc, Q2 2026.pdf | Quarterly filing — SEC Form 10-Q | Quarterly period ended Jun 30, 2026 | 2026-09-07 (sync) | **High** — most recent balance sheet, Note 10 Debt + maturity table + covenants, Note 15 Contingencies, cash flow statement |
| nVent Electric plc, Q1 2026.pdf | Quarterly filing — SEC Form 10-Q | Quarterly period ended Mar 31, 2026 | 2026-09-07 (sync) | High — prior-quarter debt, covenants, cash flow |
| nVent Electric plc, 2026.pdf | Quarterly filing — SEC Form 10-Q (**duplicate of Q1 2026.pdf**, same period, different extraction render: 151,205 vs 165,957 chars) | Quarterly period ended Mar 31, 2026 | 2026-09-07 (sync) | Medium — duplicate content; do not double-count |
| nVent Electric plc, 2026 rev.pdf | SEC Form **11-K** — employee retirement savings plan annual report (nVent Management Company Retirement Savings and Investment Plan) | Plan FY ended Dec 31, 2025 | 2026-09-07 (sync) | Low — defined-contribution plan; no corporate debt or company pension obligation |
| nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf | Transcript | Q2 2026 results call, Jul 31, 2026 | 2026-09-07 (sync) | Medium — management commentary on cash, capital deployment, acquisition funding |
| nVent Electric plc, Q1 2026 Earnings Call, May 01, 2026.pdf | Transcript | Q1 2026 results call, May 1, 2026 | 2026-09-07 (sync) | Medium — same, one quarter earlier |
| nVent Electric plc, Q1 2026 ppt.pdf | Investor deck — Q1 2026 earnings presentation | Dated May 1, 2026 | 2026-09-07 (sync) | Medium — free-cash-flow and capital-deployment slides |
| 2026-William-Blair-Conference-nVent-NVT-Presentation.pdf | Investor deck — conference presentation | Dated June 3, 2026 | 2026-09-07 (sync) | Low–Medium — strategy/growth framing; thin on balance-sheet detail |
| nVent-to-Acquire-Maverick-Power-2026.pdf | Material-event press release (acquisition announcement) | Dated Aug 24, 2026 | 2026-09-07 (sync) | **High** — $1.75bn cash purchase price plus up to $550m contingent earnout, expected to close Q4 2026, to be funded with "available cash on hand and new debt" (financing terms not yet disclosed) |
| nVent Electric plc NYSE NVT Competitors.rtf | Capital IQ profile export — competitors | Recently disclosed competitors, LTM dates to Jun-30-2026 | 2026-09-07 (sync) | Low |
| nVent Electric plc NYSE NVT Products.rtf | Capital IQ profile export — products | Sourced from 2023/2026 Form 10-K product lists | 2026-09-07 (sync) | Low |
| nVent Electric plc NYSE NVT Strategic Alliances.rtf | Capital IQ profile export — alliances | "No recently disclosed strategic alliances"; prior-period entries only | 2026-09-07 (sync) | Low |

### 1.2 Workbook — nVent Electric plc NYSE NVT Financials.xls (Capital IQ, 13 tabs, status ok)

Workbook-level header: Reported Currency USD, in millions. Capital Structure Details block sourced from "A 2025 filed Feb-17-2026"; latest financial column is LTM 12 months Jun-30-2026.

| Filename (parent · tab) | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| Financials.xls · Key Stats (91x9) | Capital IQ export | FY2022A–FY2025A + LTM Jun-30-2026 | 2026-09-07 (sync) | Medium |
| Financials.xls · Income Statement (108x7) | Capital IQ export | FY2021–FY2025 + LTM Jun-30-2026 | 2026-09-07 (sync) | **High** — EBITDA base for leverage and the stress test; interest expense |
| Financials.xls · Balance Sheet (94x7) | Capital IQ export | FY2021–FY2025 + LTM Jun-30-2026 | 2026-09-07 (sync) | **High** — Cash 256.0, Total Debt 1,632.9, Net Debt 1,376.9, Total Equity 3,986.9 at Jun-30-2026 |
| Financials.xls · Cash Flow (76x7) | Capital IQ export | FY2021–FY2025 + LTM Jun-30-2026 | 2026-09-07 (sync) | **High** — Cash from Ops 690.6, capex 112.9, debt repaid 75.3, dividends 132.9 (LTM Jun-30-2026) |
| Financials.xls · Multiples (91x9) | Capital IQ export | 6 quarterly closes, latest as-of 2026-08-12 | 2026-09-07 (sync) | Low — valuation, not solvency |
| Financials.xls · Historical Capitalization (39x7) | Capital IQ export | FY2021–FY2025 + latest | 2026-09-07 (sync) | **High** — debt/equity mix through time |
| Financials.xls · Capital Structure Summary (99x7) | Capital IQ export | FY2021–FY2025 + LTM Jun-30-2026 | 2026-09-07 (sync) | **High** — debt stack summary |
| Financials.xls · Capital Structure Details (40x10) | Capital IQ export | FY2025 (Dec-31-2025) and FY2024 as-reported blocks | 2026-09-07 (sync) | **High** — instrument-level principal, coupon, floating flag, maturity date, seniority, secured flag |
| Financials.xls · Ratios (161x7) | Capital IQ export | FY2021–FY2025 + LTM Jun-30-2026 | 2026-09-07 (sync) | **High** — coverage, leverage, ROIC series |
| Financials.xls · Supplemental (74x7) | Capital IQ export | FY2021–FY2025 + LTM Jun-30-2026 | 2026-09-07 (sync) | Medium |
| Financials.xls · Industry Specific (15x6) | Capital IQ export | Sparse (20 populated cells) | 2026-09-07 (sync) | Low |
| Financials.xls · Pension OPEB (243x7) | Capital IQ export | FY2020–FY2025 annual | 2026-09-07 (sync) | **High** — defined-benefit obligation, plan assets, funded status |
| Financials.xls · Segments (84x7) | Capital IQ export | FY2021–FY2025, business + geographic | 2026-09-07 (sync) | Medium — asset base / divestment capacity |

### 1.3 Workbook — nVentElectricplcNYSENVTEstimatesReport.xls (Capital IQ Estimates, 7 tabs, status ok)

Workbook-level header: Consolidated, **Accounting Standard: US GAAP**, Reported Currency USD.

| Filename (parent · tab) | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| EstimatesReport.xls · Consensus (462x41) | Capital IQ estimates | Forward FY2026–FY2028 consensus | 2026-09-07 (sync) | Medium — forward EBITDA for the stress-test baseline |
| EstimatesReport.xls · Recent Changes (265x10) | Capital IQ estimates | Recent broker revisions | 2026-09-07 (sync) | Low |
| EstimatesReport.xls · Guidance (179x41) | Capital IQ estimates | Company guidance history, FY2026 current | 2026-09-07 (sync) | Medium — guided FCF / EPS |
| EstimatesReport.xls · Multiples (23x7) | Capital IQ estimates | Forward multiples | 2026-09-07 (sync) | Low |
| EstimatesReport.xls · Surprise (219x35) | Capital IQ estimates | FY2021–FY2025 beat/miss | 2026-09-07 (sync) | Low |
| EstimatesReport.xls · Trends (300x16) | Capital IQ estimates | Estimate trend series | 2026-09-07 (sync) | Low |
| EstimatesReport.xls · Revisions (467x12) | Capital IQ estimates | Last-month revision breadth | 2026-09-07 (sync) | Low |

**Failed extractions:** none. `manifest.json` totals report `"failures": 0`, and every one of the 15 sources carries `status: ok`. No `gdrive-pointer` stubs, no `fail`, no `fallback-text`, no `missing-dependency`. No source is treated as missing on extraction grounds (fix F03).

**Deterministic sidecars read:** `ciq_facts.json` (15 concepts resolved, 0 conflicts, currency USD) and `relationships.json` (empty graph — 0 nodes, 0 edges, no Suppliers/Customers export in the pool; no supply-chain counterparty read is available and none is needed for solvency).

---

## 2. Most Recent Sources

Age measured from the period-end / document date inside the document, to 2026-09-07.

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | nVent Electric plc, 2025.pdf — Form 10-K | FY ended Dec 31, 2024 | ~20 |
| Quarterly filing | nVent Electric plc, Q2 2026.pdf — Form 10-Q | Quarter ended Jun 30, 2026 | ~2 |
| Debt / capital-structure export | Financials.xls · Capital Structure Summary + Balance Sheet | LTM Jun-30-2026 column | ~2 |
| Fixed-income / maturities export | Financials.xls · Capital Structure Details | FY2025 as-reported block (Dec-31-2025), source "A 2025 filed Feb-17-2026" | ~8 |
| Cash flow statement | nVent Electric plc, Q2 2026.pdf — Condensed Consolidated Statements of Cash Flows (six months ended Jun 30, 2026); Financials.xls · Cash Flow (LTM Jun-30-2026) | Jun 30, 2026 | ~2 |
| Covenant / credit-agreement disclosure | nVent Electric plc, Q2 2026.pdf — Note 10 (Debt), Senior Credit Facilities paragraph | Jun 30, 2026 | ~2 |
| Credit rating report | **None in pool** | — | — |
| Material-event disclosure (post-balance-sheet) | nVent-to-Acquire-Maverick-Power-2026.pdf | Aug 24, 2026 | ~0.5 |

**Freshness note.** The pool's audited annual filing is the **FY2024** 10-K; the **FY2025** 10-K (which Capital IQ cites as its own source, "A 2025 filed Feb-17-2026") is **not** in the pool as a document. This does not create a sufficiency gap, because every solvency requirement below is met by the fresher Q2 2026 10-Q (Jun 30, 2026) and, for instrument-level detail, by the Capital IQ Capital Structure Details FY2025 block. It does mean the FY2025 audited lease, pension and contingency notes must be read through Capital IQ or the FY2024 10-K, and downstream agents should cite accordingly rather than attribute a vendor figure to a filing (§5).

---

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | **Y** | Q2 2026 10-Q, Condensed Consolidated Balance Sheets at Jun 30, 2026 (cash $256.0m; total debt $1,492.4m; Financials.xls · Balance Sheet total equity $3,986.9m) | Debt, cash, equity base |
| Debt note (amounts by type) | **Y** | Q2 2026 10-Q, Note 10 (Debt) — term loan $200.0m @4.903%; 2028 notes $500.0m @4.550%; 2031 notes $300.0m @2.750%; 2033 notes $500.0m @5.650%; revolver $0 drawn | The debt stack and seniority (all senior unsecured per Financials.xls · Capital Structure Details) |
| Maturity schedule | **Y** | Q2 2026 10-Q, Note 10 maturity table: Q3–Q4 2026 $6.9m; 2027 $13.8m; 2028 $517.2m; 2029 $20.6m; 2030 $141.5m; 2031 $300.0m; thereafter $500.0m; total $1,500.0m | The maturity wall and refinancing exposure |
| Cash flow statement | **Y** | Q2 2026 10-Q, Statements of Cash Flows (CFO from continuing ops $278.7m, capex $57.6m, six months to Jun 30, 2026); Financials.xls · Cash Flow LTM Jun-30-2026 | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | **Y** | Q2 2026 10-Q, Note 10 — five-year $600.0m senior **unsecured** revolving credit facility, borrowing capacity $600.0m at Jun 30, 2026, $0 drawn; accordion up to a further $300.0m subject to lender commitment | True liquidity beyond cash |
| Interest expense detail | **Y** | Q2 2026 10-Q, Statements of Income — net interest expense $17.4m (Q2) / $34.9m (H1 2026); average interest rate per instrument in Note 10 | Coverage ratios |
| Covenant disclosure | **Y** | Q2 2026 10-Q, Note 10 — max net-debt/EBITDA **3.75x** (electively 4.25x for four testing periods around a material acquisition); min EBITDA/interest **3.00x**; stated in compliance at Jun 30, 2026 | Headroom to a breach |
| Lease detail (operating/finance) | **Y** | Q2 2026 10-Q, Note 8 (Supplemental Balance Sheet) — operating ROU assets $132.8m, current operating lease liabilities $33.0m, non-current $107.5m; FY2024 10-K Note 17 (Leases); Financials.xls · Capital Structure Details finance leases $17.8m | Debt-like obligations |
| Pension / OPEB funded status | **Y** | Financials.xls · Pension OPEB tab (FY2020–FY2025 obligation, assets, cost); FY2024 10-K Note 13 (Benefit Plans) | Off-balance-sheet obligation |
| Commitments & contingencies note | **Y** | Q2 2026 10-Q, Note 15 — bonds, letters of credit and bank guarantees outstanding face value $102.0m at Jun 30, 2026 ($75.7m at Dec 31, 2025); disposition indemnities stated as not reasonably estimable; FY2024 10-K Note 18 | Guarantees, LCs, litigation, tax claims |
| Credit ratings | **N** | No rating-agency report in the pool. Only management's stated "intent to maintain investment grade metrics" (Q2 2026 10-Q, MD&A Liquidity and Capital Resources) and the fact that the credit-facility margin can be priced off a public debt rating (Note 10) | Refinancing access and cost |
| EBITDA base (for stress test) | **Y** | `ciq_facts.json` `ltm_ebitda_m` = 1,074.6 [Financials.xls · Income Statement, LTM 12 months Jun-30-2026]; multi-year series FY2021 485 → FY2025 840 → LTM 1,075 | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | **Y** | **Operating company** — designer and manufacturer of electrical connection and protection products (Q2 2026 10-Q, Note 13 Segment Information: Systems Protection and Electrical Connections). **Also a HoldCo/OpCo structure** — see below | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | **Y** | Q2 2026 10-Q, Note 10 — $600.0m committed, unsecured, matures 2030-06-30 (Financials.xls · Capital Structure Details), **not** borrowing-base; full $600.0m capacity available, $0 drawn; pricing off net leverage ratio or public debt rating | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | **Y** | Q2 2026 10-Q, Note 10 — consolidated debt net of unrestricted cash above $5.0m but **capped at $250.0m** of netting, over consolidated net income before interest, taxes, D&A and non-cash share-based compensation, excluding non-cash gains and losses | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | **Y** | Q2 2026 10-Q, Note 10 — Obligor Group is nVent Electric plc (parent holding company, no independent operations), nVent Finance S.a r.l. (issuer, holding company) and Hoffman Schroff Holdings, Inc.; February 2026 supplemental indenture added full joint-and-several guarantees; filing states no significant restriction on obtaining funds from subsidiaries and no restricted net assets | Structural subordination and upstreaming |
| Hedging / swaps disclosure | **Y** | Q2 2026 10-Q, Note 9 (Derivatives and Financial Instruments) — cross-currency swaps notional $350.5m (vs $362.5m at Dec 31, 2025), liabilities $28.8m / assets $2.6m; foreign-currency contracts disclosed. Floating-rate exposure is the $200.0m term loan; the $1,300.0m of senior notes are fixed | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | **Y (partial)** | **Rating trigger: Y** — credit-facility applicable margin is set off net leverage ratio or public debt rating (Q2 2026 10-Q, Note 10). **Indenture covenants: Y** — restrictions on merger/consolidation, liens and sale-and-leaseback (Note 10). **Change-of-control put on the Notes and cross-default terms: not disclosed in the data pool** — the only "change of control" text in the pool sits in equity-award agreements (FY2024 10-K exhibits), not in the debt terms | Hidden accelerants to distress |

**Business Type Applicability Gate — PASSED.** nVent is an operating manufacturer with ordinary corporate debt, not a bank, insurer or REIT. The debt/EBITDA, coverage and covenant-headroom framework applies. The financial-institution override does **not** trip. The HoldCo/OpCo mapping requirement **does** apply and is satisfied by Note 10, so agents `01` and `99` must build the Obligor Group map rather than flag it as not assessable.

---

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | **Y** |
| business-model/11_capital-allocation-governance.md | **Y** |
| business-model/03_segment-map.md | **Y** |
| earnings/01_historical-financials.md | **Y** |
| earnings/06_earnings-quality.md | **Y** |
| earnings/03_margin-drivers.md | **Y** |

Both upstream modules are complete (business-model: 13 agent files plus synthesis and dossier; earnings: 9 agent files plus synthesis, dossier and `sensitivity_summary.json`). `analyses/NVT_2026-09-07/valuation/` does not exist — that is expected and correct: per MODULE_RULES it is **not** a cross-module input to this module and must not be read.

---

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (issuer incorporated in **Ireland**, principal executive offices in London, United Kingdom) | Q2 2026 10-Q cover page: "Ireland (State or other jurisdiction of incorporation)"; "The Mille, 1000 Great West Road, 8th Floor (East), London, TW8 9DW, United Kingdom" |
| Exchange | New York Stock Exchange, ticker NVT | FY2024 10-K, Item 5: "Our ordinary shares are listed for trading on the New York Stock Exchange and trade under the symbol 'NVT.'" |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **US SEC**, domestic-filer forms (10-K, 10-Q, 11-K), Commission file number 001-38265 | FY2024 10-K and Q2 2026 10-Q cover pages |
| Reporting standard (US GAAP / IFRS / Ind AS) | **US GAAP** | EstimatesReport.xls · Consensus header: "Acctg. Standard: US GAAP"; Q2 2026 10-Q financial statements |
| Reporting currency (USD / INR / …) | **USD**, presented in millions | Financials.xls tab headers "Currency: Reported Currency; In Millions; USD"; `ciq_facts.json` `"currency": "USD"` |
| Document language(s) | **English** — all 15 sources | Every extract in the generation root is English; no translation layer needed and no language-related gap exists (CLAUDE.md §27) |

Downstream agents therefore read **US SEC** documents: the 10-K debt / lease / benefit-plan / contingency notes, the 10-Q Note 10 (Debt) and Note 15 (Commitments and Contingencies), and 8-K-equivalent material-event releases. There is no SEBI-LODR or Ind AS overlay here. **Under US GAAP, operating leases stay off the debt line** — note that Capital IQ's "Total Debt" of $1,632.9m at Jun-30-2026 exceeds the 10-Q's reported total debt of $1,492.4m by exactly $140.5m, which is the sum of current ($33.0m) and non-current ($107.5m) operating lease liabilities. Agent `01` must state which basis it designates as canonical and label it (MODULE_RULES Calculation Standards 2–3, CLAUDE.md §15); it must not present the vendor's $1,632.9m under a filing citation (§5).

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | **N** | 02, 06 | None — full year-by-year schedule to "thereafter" in Q2 2026 10-Q Note 10 |
| No covenant disclosure | **N** | 04, 06 | None — both maintenance covenants, their thresholds, the covenant-EBITDA definition and the $250.0m cash-netting cap are disclosed |
| No cash flow statement | **N** | 03, 04, 06 | None — 10-Q statements of cash flows plus Capital IQ Cash Flow tab (FY2021–FY2025 + LTM Jun-30-2026) |
| No undrawn-facility disclosure | **N** | 03 | None — $600.0m committed revolver, $0 drawn, full capacity stated at Jun 30, 2026 |
| No interest-expense detail | **N** | 04 | None — net interest expense by period plus average interest rate per instrument |
| No EBITDA base | **N** | 06 | None — LTM Jun-30-2026 EBITDA $1,074.6m plus a five-year series and forward consensus |

**No score cap from the MODULE_RULES cap table binds.** Checked against all nine cap rows: maturity schedule present; covenant disclosure present; cash flow statement present; interim data present (so the "only annual data" cap does not apply); EBITDA base present; off-balance-sheet exposures disclosed (Note 15, $102.0m of bonds/LCs/guarantees, plus pension and lease detail); the revolver is committed and not borrowing-base with availability stated; the covenant-EBITDA definition is disclosed so headroom does not rest on assumed addbacks; and the HoldCo debt sits with disclosed upstreaming language ("no significant restrictions on the ability of nVent Electric plc to obtain funds from its subsidiaries by dividend or loan").

**Two data notes that are not caps but that downstream agents must carry:**
1. **No credit-rating report.** MODULE_RULES partial-data row "No credit ratings → 99: note the absence; do not infer a rating." Agent `99` must record the absence. **Do not infer or assert an investment-grade rating** from management's stated intent to "maintain investment grade metrics" — that is management language, not an agency action, and asserting a rating from it would be a §3 unsupported claim.
2. **Maverick Power is a post-balance-sheet leverage event with undisclosed financing.** Announced Aug 24, 2026 (after the Jun 30, 2026 balance-sheet date): $1.75bn cash purchase price plus up to $550m of contingent consideration tied to 2027–2028 performance, expected to close Q4 2026, to be funded "with a combination of available cash on hand and new debt" — the mix, tenor, pricing and any commitment financing are **not disclosed in the pool**. Against $256.0m of cash and $1,492.4m of reported debt at Jun 30, 2026, this is a material change to the capital structure. Agents `01`, `02`, `03` and `06` must run the reported Jun-30-2026 structure as the base case and present any Maverick-inclusive figure separately, clearly labelled as pro-forma with the funding mix stated as an assumption ("Inference, not from filings"). The covenant that matters here is already known: net leverage 3.75x, electively 4.25x for four testing periods in connection with a material acquisition (Q2 2026 10-Q, Note 10).

---

## 6. Sufficiency Verdict

- **Verdict:** **Sufficient**
- **Reason:** A balance sheet two months old (Q2 2026 10-Q at Jun 30, 2026), a full debt note with amounts by instrument and a year-by-year maturity table, and a cash flow statement are all present, so leverage, liquidity, coverage, covenant headroom and a downside stress test can all be built from primary filings.
- **Sections that can run:** capital structure and leverage; maturity wall and refinancing; liquidity runway; coverage and covenants; off-balance-sheet and contingencies; downside stress test. All six run, plus the mandatory HoldCo/OpCo structural-priority map.
- **Active partial-data caps:** none. No cap from the MODULE_RULES score-cap table binds.
- **Critical missing items:** none that block the module. Two lower-order absences to record rather than cap for: (a) no credit-rating-agency report, so refinancing access and cost must be reasoned from coupons, maturity profile and covenant terms, and no rating may be inferred; (b) the FY2025 10-K itself is absent from the pool — the FY2025 audited lease, pension and contingency notes must be read through the Capital IQ Pension OPEB and Capital Structure Details tabs or the FY2024 10-K, cited as the vendor export or the FY2024 filing respectively, never as an FY2025 filing.
- **Single highest-value missing document:** the **Maverick Power financing disclosure** — the 8-K, commitment letter or credit-agreement amendment setting out how the $1.75bn cash purchase price plus up to $550m of contingent consideration will be funded (debt versus cash mix, tenor, pricing, and whether the 4.25x acquisition covenant election is being used). Every forward leverage, coverage and covenant-headroom read in this module turns on it. Second-highest: a rating-agency report (Moody's / S&P / Fitch) to pin refinancing access and the cost of the announced new debt.
