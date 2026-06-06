# Governance Data Triage — BG

**Company:** Bunge Global SA (NYSE: BG)
**Date:** 2026-06-07
**Jurisdiction:** Switzerland (incorporated), NYSE-listed, SEC filer
**Data pool:** `data/BG/`
**Output:** `analyses/BG_2026-06-07/management-governance/00_governance-data-triage.md`

---

## 1. File Inventory

Pool extractor results: 7 workbooks → 7 single-tab extracts; 4 PDFs extracted; 3 text files in-place. Each workbook had exactly one tab — no multi-tab workbook detected in this pool.

| Filename | Type | Period Covered | Last Modified | Governance Relevance |
|---|---|---|---|---|
| `bunge_10k.txt` | Annual filing (Form 10-K, text extract) | FY2025 (year ended Dec 31, 2025) | 2026-05-11 | High |
| `bunge-2025-annual-report.pdf` | Annual report / 10-K (PDF source) | FY2025 | 2026-05-11 | High |
| `bunge_10q.txt` | Quarterly filing (Form 10-Q, text extract) | Q1 2026 (ended Mar 31, 2026) | 2026-05-11 | High |
| `bunge 10q.pdf` | Quarterly filing (Form 10-Q, PDF source) | Q1 2026 | 2026-05-11 | High |
| `q1_call.txt` | Earnings transcript (text extract) | Q1 2026 (April 29, 2026) | 2026-05-11 | Medium |
| `q1-2026-bunge-limited-earnings-conference-call.pdf` | Earnings transcript (PDF source) | Q1 2026 (April 29, 2026) | 2026-05-11 | Medium |
| `q1-2026-earnings-release.pdf` | Earnings press release | Q1 2026 (April 29, 2026) | 2026-05-11 | Medium |
| `Consensus.xlsx` — tab: Consensus (493×117) | Capital IQ consensus estimates | FY2026–FY2027 estimates, as of 2026-05-09 | 2026-05-09 | Low |
| `Guidance.xlsx` — tab: Guidance (165×53) | Capital IQ guidance data | Through FY2026 | 2026-05-09 | Low |
| `Multiples.xlsx` — tab: Multiples (22×7) | Capital IQ valuation multiples | As of 2026-05-09 | 2026-05-09 | Low |
| `Recent Changes.xlsx` — tab: Recent Changes (266×10) | Capital IQ estimate revisions | Through 2026-05-06 | 2026-05-09 | Low |
| `Revisions.xlsx` — tab: Revisions (468×15) | Capital IQ estimate revisions | Through 2026-05-06 | 2026-05-09 | Low |
| `Surprise.xlsx` — tab: Surprise (229×106) | Capital IQ earnings surprise history | Multi-quarter history | 2026-05-09 | Low |
| `Trends.xlsx` — tab: Trends (294×15) | Capital IQ estimate trend data | Through 2026-05-06 | 2026-05-09 | Low |

---

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Proxy / DEF 14A | Not in pool — 10-K notes proxy for 2026 AGM (May 20, 2026) is filed separately and incorporated by reference into Items 10–14; pool does not contain the proxy document | Not available | — |
| Annual filing | `bunge_10k.txt` / `bunge-2025-annual-report.pdf` | FY2025 (auditor report Feb 19, 2026) | ~3.5 months |
| Compensation disclosure | Partial: 10-K references Items 10–14 to the 2026 proxy by reference; 10-K contains executive officer biographies and mentions of Swiss law comp restrictions; no standalone comp disclosure in pool | FY2025 (partial) | ~3.5 months |
| Ownership / insider-transaction data | Partial: 10-K contains shareholder concentration disclosure (Glencore ~17%, CPP ~14%, BCI ~3%, ~34% combined with board-nomination rights) in Risk Factors; no Form 4 data, no full beneficial-ownership table in pool | FY2025 | ~3.5 months |
| Shareholder letter | Present within `bunge_10k.txt` (CEO letter from Greg Heckman, FY2025 annual report front matter) | FY2025 | ~3.5 months |
| Transcript | `q1_call.txt` / `q1-2026-bunge-limited-earnings-conference-call.pdf` | Q1 2026 (April 29, 2026) | ~1 month |
| 8-K (management changes) | Not in pool | Not available | — |

---

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A | N | 10-K references 2026 proxy (May 20, 2026 AGM) incorporated by reference into Part III; proxy PDF is not in pool | Comp, ownership table, board composition, related-party, auditor fees all live in the proxy |
| Compensation disclosure (metrics/weights) | Partial (N-effective) | 10-K executive officer bios present; Swiss law comp restrictions noted; no CD&A / compensation metrics in pool | Incentive alignment requires actual performance metrics, weights, and pay magnitude |
| Beneficial ownership table | Partial (N-effective) | Large-shareholder bloc (Glencore ~17%, CPP ~14%, BCI ~3%) disclosed in 10-K Risk Factors with board-nomination rights; no full beneficial-ownership schedule as would appear in DEF 14A | Needed for skin-in-the-game and control assessment |
| Insider-transaction data (buys/sells) | N | No Form 4 data or equivalent insider-transaction export in pool | Conviction signal — are insiders buying or selling around major events? |
| Board composition / independence | Partial (N-effective) | 10-K describes five board committees and board's oversight role; proxy referenced for director names, independence status, and committee assignments — not in pool | Board quality and independence assessment requires director-level data |
| Related-party disclosure | Y (partial) | FY25 10-K, Note 19 (Related Party Transactions): RPT purchases ≤9% of COGS, RPT sales ≤2% of net sales, receivables ≤4%, payables ≤3%; at-arm's-length representation; FY25 disqualifier-scan confirmed no RPT threshold breach | Value leakage check |
| Control structure (dual-class / blocs) | Y | FY25 10-K Risk Factors: Glencore (~17%) and CPP Investments (~14%) each have shareholder agreements granting two board-nomination seats above 10% ownership; combined ~34% of shares — single share class, no dual-class, but concentrated nomination rights | Minority-shareholder rights risk |
| Prior shareholder letters / guidance | Y | CEO letter (Greg Heckman) in FY2025 annual report text; Q1 2026 transcript includes management commentary; Capital IQ guidance export provides historical guidance data; disqualifier-scan and earnings module have multi-period performance context | Promise-vs-delivery check |
| M&A / buyback / dividend history | Y (multi-year) | 10-K: $2.5B total buybacks since program inception, $551M in FY2025; $459M dividends in FY2025; Viterra acquisition ($10,617M, closed July 2025); IFF soy-protein/lecithin/crush (early 2026); ViOil (2025); multiple divestitures (corn milling, Spanish sub 40%, BP Bunge Bioenergia 50% in 2024) | Capital-allocation scorecard |
| Management tenure / turnover | Y | 10-K executive officer section: CEO Greg Heckman since Jan 2019 (~7 years); CFO John Neppl since May 2019 (~7 years); COO Julio Garros since Dec 2025 (prior roles within BG since 2002); stable core team disclosed | Stability and competence signal |
| Transcripts | Y | Q1 2026 earnings call transcript (April 29, 2026): CEO Greg Heckman and CFO John Neppl prepared remarks plus Q&A; Capital IQ surprise export provides multi-quarter history | Candor and tone |

---

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/11_capital-allocation-governance.md | Y — present, dated 2026-06-01; contains multi-year capital allocation read, Viterra deal analysis, ownership concentration, audit history, share count trajectory |
| business-model/01_disqualifier-scan.md | Y — present, dated 2026-06-01; all 8 disqualifiers clear; two critical audit matters passed forward as monitoring items; Viterra ICFR scope exclusion noted |
| business-model/12_red-flags-sweep.md | Y — present, dated 2026-06-01; five new red flags quantified: Brazil indirect-tax claims ($760M unprovisioned as of Q1 2026, rising 21% in one quarter), Brazil farmer-financing credit book up 75% YoY to $835M, divestiture indemnity tail ($1.6B max potential vs $125M recorded), performance guarantees up 34% to $2,151M, Level 3 fair-value marks in P&L |
| business-model/02_business-identity.md | Y — present, dated 2026-06-01; Swiss-incorporated, NYSE-listed, SEC filer; global oilseed-crush and grain-merchandising processor-trader |
| earnings/06_earnings-quality.md | Y — present, dated 2026-06-01; CFO/PAT and EBITDA bridge computed for FY2023–FY2025; GAAP vs adjusted EPS gap quantified (Q1 2026: $0.35 GAAP vs $1.83 adjusted); Level 3 mark-to-market distortion documented |
| earnings/04_guidance-consensus.md | Y — present, dated 2026-06-01; Capital IQ consensus data as of 2026-05-09; guidance track record (EPS normalized) available across multiple periods; analyst count and target price range documented |

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure | Y — proxy not in pool; 10-K defers Items 10–14 (directors, exec comp, ownership, related-party, auditor fees) to 2026 AGM proxy by reference | 03, 99 | Incentive alignment max 50; Overall usefulness max 70 |
| No ownership / insider-transaction data | Y — no full beneficial-ownership table; no Form 4 / insider transaction data in pool; only large-bloc disclosure in 10-K Risk Factors | 04, 99 | Shareholder friendliness max 60 |
| No board disclosure | Y — board committee names referenced but no director-level names, independence ratios, or committee assignments in pool (proxy absent) | 05, 99 | Board independence/rights not assessable from pool alone |
| No multi-year capital-allocation history | N — multi-year history available: three fiscal years (FY2023–FY2025) of audited cash flows, $2.5B cumulative buybacks, multi-deal M&A history, annual dividend data; capital-allocation agent can run | 02 | No cap needed |
| No transcripts / prior letters | N — Q1 2026 transcript, CEO letter in FY2025 annual report, Capital IQ guidance/surprise exports all available | 01, 06 | No cap needed |

---

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | NYSE: BG listed; SEC filer; Commission File Number 000-56607 [FY25 10-K, cover page] |
| Exchange | New York Stock Exchange (NYSE) | [FY25 10-K, cover page] |
| Filing regime | US SEC — Form 10-K, 10-Q, 8-K, DEF 14A, Form 4 | [FY25 10-K, cover page; SEC filing regime confirmed] |
| Incorporation jurisdiction | Switzerland (Swiss AG, redomesticated from Bermuda Nov 1, 2023) | [FY25 10-K, Item 1; business-model/02_business-identity.md] |
| Sector | Global agribusiness — oilseed processing, grain merchandising, milling | [FY25 10-K, Item 1] |
| Sector-specific governance overlay required? | N for banking/pharma/IT overlays. Note Swiss incorporation: Swiss law prohibits certain executive compensation practices (sign-on bonuses, severance/takeover payments) and requires shareholder approval for corporate actions that a US board could act on unilaterally [FY25 10-K, Item 1A, Risk Factors, line ~1504, ~1611]. This Swiss-law overlay is material for the incentives agent (03) and the board agent (05). | [FY25 10-K, Item 1A] |

Note on filing regime: This is a US SEC filer. DEF 14A (proxy), Form 4 (insider transactions), and Schedule 13D/13G are the expected US-form equivalents. The proxy is filed with the SEC and referenced in the 10-K — it is simply absent from the data pool. The proxy absence is a data-pool gap, not a filing-regime mismatch.

---

## 5B. Source Coverage Matrix

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---|---:|---|---|
| Board composition | 10-K (committee names, oversight structure only; director-level data deferred to proxy) | FY2025 | 2 | Yes (director list, independence pct) | None in pool; proxy would provide |
| Compensation | 10-K (exec officer bios, Swiss law restrictions; CD&A in proxy only) | FY2025 | 2 | Yes (metrics, weights, pay amounts) | None in pool; proxy CD&A would provide |
| Ownership (large shareholders) | FY25 10-K, Risk Factors (Glencore ~17%, CPP ~14%, BCI ~3%) | Dec 31, 2025 | 4 | Partial (only large blocs, no full table) | DEF 14A beneficial-ownership table (not in pool) |
| Insider trades | Not in pool | — | — | Yes | Form 4 filings (not in pool) |
| Related-party transactions | FY25 10-K, Note 19; disqualifier-scan confirms thresholds clear | FY2025 | 5 | No | Covered |
| Auditor report | FY25 10-K, Deloitte unqualified opinion (Feb 19, 2026), two critical audit matters | FY2025 | 5 | No | Covered |
| Secretarial / compliance report | Not applicable (US/Swiss SEC filer; no SEBI-LODR; Swiss audit committee performs oversight role) | — | — | N/A | N/A |
| AGM voting | Not in pool (proxy expected to contain voting results; 2026 AGM May 20, 2026) | — | — | Yes | DEF 14A / SEC 8-K filing post-AGM |
| Capital-allocation history | FY25 10-K cash flow statements, share repurchase disclosure, M&A notes; cross-module 11_capital-allocation-governance.md | FY2023–FY2025 + Q1 2026 | 5 | No | Covered |
| Legal / regulatory cases | FY25 10-K, Item 3 + Note 20; Q1 2026 10-Q, Note 15; red-flags-sweep quantified Brazil indirect-tax claims ($760M unprovisioned) | FY2025 + Q1 2026 | 5 | No | Covered |

---

## 5C. Data Freshness

| Source | Period | As-of Date | Age | Stale? | Impact |
|---|---|---|---|---|---|
| FY25 10-K (audited financials) | FY2025 (year ended Dec 31, 2025) | Auditor report Feb 19, 2026; filed approx. Feb 2026 | ~3.5 months | No | Primary governance and financial source |
| Q1 2026 10-Q | Quarter ended Mar 31, 2026 | Filed approx. May 2026 | ~1 month | No | Most recent balance sheet; ownership/RPT disclosures consistent |
| Q1 2026 earnings call | April 29, 2026 | 2026-04-29 | ~5 weeks | No | Most recent management commentary |
| Capital IQ estimates / multiples | FY2026–FY2027 estimates | 2026-05-09 | ~4 weeks | No | Consensus context only; low governance relevance |
| business-model cross-module outputs | Based on same 10-K and 10-Q pool | 2026-06-01 | 6 days | No | Fully applicable; same source pool |
| Proxy / DEF 14A | 2026 AGM (May 20, 2026) | Not in pool | — | Not stale — absent | High impact: comp, full ownership, board composition unavailable |

Source manifest: CSV export pending (no Write-to-CSV tool in this agent; table above is the canonical manifest for this run).

---

## 6. Sufficiency Verdict

- **Verdict:** Partial

- **Reason:** The FY2025 Form 10-K, Q1 2026 Form 10-Q, and Q1 2026 earnings transcript together with the completed business-model and earnings cross-module outputs give enough material for management track record, capital allocation, and candor assessments, but the DEF 14A (proxy) is absent from the pool, leaving executive compensation detail, the full beneficial-ownership table, board composition at the director level, and AGM voting results unverifiable from pool data.

- **Specialists that can run:**
  - Management track record (01) — can run fully: CEO/CFO biographies, tenure data, Viterra integration record, multi-year financial history, and earnings quality cross-module all available
  - Capital allocation (02) — can run fully: three fiscal years of audited cash flows, $2.5B cumulative buyback history, Viterra deal details, dividend track record, capex split (partial), cross-module capital-allocation-governance available
  - Incentives and compensation (03) — can run with cap: no proxy / CD&A in pool; Swiss law comp restrictions and exec titles available; incentive alignment score capped at max 50
  - Ownership and insider behavior (04) — can run with cap: large-shareholder bloc (Glencore ~17%, CPP ~14%, BCI ~3%) and board-nomination rights available; no Form 4 / insider-transaction data; no full beneficial-ownership table; shareholder friendliness score capped at max 60
  - Board and shareholder rights (05) — can run with cap: committee structure and Swiss-law governance rules available; no director-level names, independence ratios, or individual committee assignments from proxy; board read limited to structural / regulatory facts
  - Candor and disclosure quality (06) — can run fully: Q1 2026 transcript, CEO shareholder letter, Capital IQ guidance/surprise exports, and earnings-quality cross-module all available

- **Hard disqualifier already flagged by business-model/01_disqualifier-scan?** N — all 8 disqualifiers clear; no verdict lock. Two monitoring items passed forward: (a) Grain Merchandising goodwill with only 9% cushion ($593M of $3,141M total goodwill), (b) Viterra operations excluded from FY2025 ICFR scope (33% of assets ex-goodwill).

- **Active partial-data caps:**
  - Incentive alignment: max score 50 (no proxy / CD&A in pool)
  - Overall usefulness: max score 70 (no proxy / CD&A in pool)
  - Shareholder friendliness: max score 60 (no full ownership table, no insider-transaction data)
  - Board independence / rights: read limited to structural / regulatory facts only; director-level independence ratio not assessable from pool

- **Critical missing items:**
  - DEF 14A (2026 proxy for May 20, 2026 AGM): contains CD&A, beneficial-ownership table, director bios and independence status, committee assignments, auditor fee table, and any related-party disclosure that supplements Note 19
  - Form 4 filings for executives and directors: insider-transaction buying/selling history
  - Full beneficial-ownership schedule (Schedule 13D/13G filings from Glencore and CPP Investments would supplement the 10-K Risk Factor disclosure)

- **Single highest-value missing document:** Proxy (DEF 14A) for the 2026 Annual General Meeting (filed with the SEC, referenced in the 10-K as incorporating Items 10–14 by reference; would unlock compensation metrics and weights, director-level board composition, full ownership table, auditor fee ratios, and AGM voting results in one document)
