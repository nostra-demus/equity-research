# Earnings Data Triage — BG

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| bunge_10k.txt | Annual filing (10-K, text) | FY2025 (Dec-31-2025), post-Viterra | 2026-05-11 | High |
| bunge-2025-annual-report.pdf | Annual report (PDF) | FY2025 | 2026-05-11 | High |
| bunge_10q.txt | Quarterly filing (10-Q, text) | Q1 2026 (qtr ended Mar-31-2026) | 2026-05-11 | High |
| bunge 10q.pdf | Quarterly filing (10-Q, PDF) | Q1 2026 (qtr ended Mar-31-2026) | 2026-05-11 | High |
| q1_call.txt | Earnings transcript (text) | Q1 2026 call, Apr 29 2026 | 2026-05-11 | High |
| q1-2026-bunge-limited-earnings-conference-call.pdf | Earnings transcript (PDF) | Q1 2026 call, Apr 29 2026 | 2026-05-11 | High |
| q1-2026-earnings-release.pdf | Quarterly earnings release / press release | Q1 2026 | 2026-05-11 | High |
| Consensus.xlsx | Consensus/estimate export (Capital IQ) | Forward FQ2 2026+ ; Rev/EBITDA/EPS/NI/CFO/Capex/BV; tgt px 150/116 | 2026-05-09 | High |
| Revisions.xlsx | Estimate-revisions export (Capital IQ) | FQ2 2026–FY2028, EPS normalized, up/down counts | 2026-05-09 | High |
| Recent Changes.xlsx | Estimate-revisions export (Capital IQ) | Broker-level changes, dated, FY2026 | 2026-05-09 | High |
| Surprise.xlsx | Beat/miss history export (Capital IQ) | Actual vs estimate, FQ1 2000–present | 2026-05-09 | High |
| Trends.xlsx | Estimate-trend export (Capital IQ) | FQ2 2026–FY2028, current vs 1/2/3 mo ago | 2026-05-09 | Medium |
| Guidance.xlsx | Guidance-history export (Capital IQ) | Company guidance, FY2003–present | 2026-05-09 | High |
| Multiples.xlsx | Valuation-multiples export (Capital IQ) | NTM/FY2026–FY2028 TEV/REV, TEV/EBITDA, P/E, etc. | 2026-05-09 | Low (valuation, out of earnings scope) |

Note: six source documents exist in both PDF and extracted-text form (10-K, 10-Q, transcript). These are duplicates of the same filings, not distinct periods.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | bunge_10k.txt / bunge-2025-annual-report.pdf | FY2025 (Dec-31-2025) | ~5 (fiscal year-end to today) |
| Quarterly filing | bunge_10q.txt / bunge 10q.pdf | Q1 2026 (Mar-31-2026) | ~2 |
| Earnings transcript | q1_call.txt / q1-2026-...-conference-call.pdf | Q1 2026 call, Apr 29 2026 | ~1 |
| Investor deck | None in pool (call references slides; not provided) | — | — |
| Consensus / estimate export | Consensus.xlsx | Forward from FQ2 2026 | ~1 (data as of 2026-05-09) |
| Cash flow data | bunge_10k.txt (FY2025) + bunge_10q.txt (Q1 2026) | FY2025 / Q1 2026 | ~5 / ~2 |
| Guidance data | Guidance.xlsx + q1-2026-earnings-release.pdf + transcript | FY2026 guidance | ~1 |

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | FY2025 10-K (39 statement hits); Q1 2026 10-Q (13 hits) | Needed for revenue, margin, EPS |
| Balance sheet | Y | FY2025 10-K; Q1 2026 10-Q | Needed for working capital and leverage |
| Cash flow statement | Y | FY2025 10-K; Q1 2026 10-Q (cash-flow sections present) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Q1 2026 10-Q + earnings release + transcript | Needed for trend and setup |
| Last 8 quarters | Partial | 10-Q gives Q1 2026 vs Q1 2025; 10-K gives FY; Surprise.xlsx gives 8+ qtrs of EPS actuals but not full standalone P&L | Needed for seasonality and inflection |
| Consensus estimates | Y | Consensus.xlsx (Rev, EBITDA, EPS, NI, CFO, Capex, BV; forward FQ2 2026+) | Needed for market bar |
| Estimate revisions | Y | Revisions.xlsx + Recent Changes.xlsx + Trends.xlsx | Needed for revision momentum |
| Earnings transcript | Y | q1_call.txt / Q1 2026 call PDF (CEO Heckman, CFO Neppl) | Needed for management tone and driver detail |
| Segment P&L | Y | FY2025 10-K (151 "segment" hits: Agribusiness, Refined & Specialty Oils, Milling, Sugar & Bioenergy, Corporate) | Needed for mix shift |
| Current price | N | No dated price file; Consensus.xlsx carries target px (150/116) and "Today's Spot Rate" FX, but no spot share price screenshot | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | N (not yet under `analyses/BG_2026-06-01/business-model/` at triage time — produced earlier in this run by the orchestrator before earnings Layer 1) |
| 06_value-chain.md | N (same) |
| 10_external-dependency.md | N (same) |

Note: at triage time `analyses/BG_2026-06-01/business-model/` was not yet populated. Within this `/research:full` run, business-model completes before earnings Layer 1, so its outputs become available at the current-run path; earnings agents read them then. The 10-K's own segment disclosure (four named segments) supports an in-module segment read regardless.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N | 04, 05, 99 | None — full Capital IQ estimate suite present |
| No quarterly data | N | 01, 02, 03, 06 | None — Q1 2026 10-Q present |
| No earnings transcript | N | 02, 03, 04 | None — Q1 2026 transcript present |
| No segment-level P&L | N | 02, 03, 99 | None — four-segment disclosure in 10-K |
| No cash flow statement | N | 06, 99 | None — cash flow statements in 10-K and 10-Q |
| No current price | Y | 99 | No score cap defined; 99 must not discuss stock-reaction precision and gives an earnings-only verdict (target px 150/116 exists in Consensus.xlsx but is not a spot price) |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent full-year filing (FY2025 10-K), the latest quarterly filing (Q1 2026 10-Q) plus its transcript, and complete income, balance sheet, and cash flow statements are all present, alongside a full forward-and-historical consensus/estimates suite.
- **Active partial-data caps:** None binding on the core earnings analysis.
- **Critical missing items:**
  - No spot/current share price file — limits only the master-synthesis stock-reaction context (agent 99 runs earnings-only; not an earnings-module score cap).
  - No standalone investor deck (the Q1 2026 call references slides; release + transcript cover the substance).
  - Discrete 8-quarter standalone quarterly P&L is only partially reconstructable from filings (10-Q gives current vs prior-year quarter; full-year from 10-K); EPS actuals for 8+ quarters are in Surprise.xlsx. Seasonality/QoQ work is feasible but agent 01 should note the standalone-quarter limitation.