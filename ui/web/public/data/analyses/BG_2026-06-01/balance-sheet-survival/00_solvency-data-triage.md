# Solvency Data Triage — BG

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| bunge_10k.txt | Annual filing (10-K, extracted text) | FY ended Dec 31, 2025 | 2026-05-11 | High |
| bunge-2025-annual-report.pdf | Annual report (PDF, same FY) | FY ended Dec 31, 2025 | 2026-05-11 | High |
| bunge_10q.txt | Quarterly filing (10-Q, extracted text) | Quarter ended Mar 31, 2026 | 2026-05-11 | High |
| bunge 10q.pdf | Quarterly filing (10-Q, PDF) | Quarter ended Mar 31, 2026 | 2026-05-11 | High |
| q1-2026-earnings-release.pdf | Earnings release | Q1 FY2026 | 2026-05-11 | Medium |
| q1-2026-bunge-limited-earnings-conference-call.pdf | Earnings call transcript (PDF) | Q1 FY2026 | 2026-05-11 | Medium |
| q1_call.txt | Earnings call transcript (text) | Q1 FY2026 | 2026-05-11 | Medium |
| Consensus.xlsx | Data-vendor export (consensus estimates) | As of 2026-05-09 | 2026-05-09 | Low |
| Guidance.xlsx | Data-vendor export (guidance) | As of 2026-05-09 | 2026-05-09 | Low |
| Multiples.xlsx | Data-vendor export (valuation multiples) | As of 2026-05-09 | 2026-05-09 | Low |
| Recent Changes.xlsx | Data-vendor export (estimate changes) | As of 2026-05-09 | 2026-05-09 | Low |
| Revisions.xlsx | Data-vendor export (estimate revisions) | As of 2026-05-09 | 2026-05-09 | Low |
| Surprise.xlsx | Data-vendor export (earnings surprise) | As of 2026-05-09 | 2026-05-09 | Low |
| Trends.xlsx | Data-vendor export (estimate trends) | As of 2026-05-09 | 2026-05-09 | Low |

Note: each filing is present in both PDF and extracted-text form (same document, two formats). The Excel exports are consensus/estimate/valuation files — low relevance to solvency. No standalone debt/capital-structure export, no fixed-income/maturities export, and no credit-rating-agency report are in the pool; debt and maturity data come from the filings.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | bunge_10k.txt / bunge-2025-annual-report.pdf | FY ended Dec 31, 2025 | ~5 |
| Quarterly filing | bunge_10q.txt / bunge 10q.pdf | Quarter ended Mar 31, 2026 | ~2 |
| Debt / capital-structure export | None in pool (debt note in 10-K used instead) | — | — |
| Fixed-income / maturities export | None in pool (contractual-obligations table in 10-K used) | — | — |
| Cash flow statement | bunge_10k.txt (FY23-25) / bunge_10q.txt (Q1 FY26) | Through Mar 31, 2026 | ~2 |
| Covenant / credit-agreement disclosure | bunge_10k.txt (MD&A + debt note) | FY ended Dec 31, 2025 | ~5 |
| Credit rating report | None in pool | — | — |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | Q1 FY26 10-Q (Mar 31, 2026 & Dec 31, 2025); FY25 10-K | Debt, cash, equity base |
| Debt note (amounts by type) | Y | FY25 10-K, ST/LT split (Short-term debt $3,883M, current LTD $1,337M, LTD); Note 13 in 10-Q | The debt stack and seniority |
| Maturity schedule | Y | FY25 10-K, Contractual Obligations table (Total / 2026 / 2027-2028 / 2029-2030 / 2031+) | Maturity wall and refinancing exposure |
| Cash flow statement | Y | FY25 10-K (FY23-25, 3 yrs); Q1 FY26 10-Q | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y | FY25 10-K — "$9,065M unused and available committed borrowing capacity"; $3B commercial-paper program ($300M outstanding) | True liquidity beyond cash |
| Interest expense detail | Y | FY25 10-K, interest expense $628M (FY25), $471M (FY24), $516M (FY23) | Coverage ratios |
| Covenant disclosure | Y | FY25 10-K — minimum current ratio, maximum debt-to-capitalization, limits on secured indebtedness; "in compliance as of Dec 31, 2025" | Headroom to a breach |
| Lease detail (operating/finance) | Y | FY25 10-K, operating lease assets $1,686M, Note 25; non-cancelable lease obligations $1,992M | Debt-like obligations |
| Pension / OPEB funded status | Partial | FY25 10-K references U.S. defined-benefit pension settlement; funded-status note to be confirmed by Agent 05 | Off-balance-sheet obligation |
| Commitments & contingencies note | Y | FY25 10-K, Note 20; guarantees, litigation referenced | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Partial | FY25 10-K states objective to "maintain an investment grade credit rating"; no agency report in pool, no specific letter grade | Refinancing access and cost |
| EBITDA base (for stress test) | Y | FY25 10-K — Segment EBIT $2,329M (FY25), $2,159M (FY24), $3,691M (FY23); EBITDA buildable | Required for survival stress test |
| Business type | Y | FY25 10-K — operating agribusiness; not a bank/insurer/REIT | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability | Y | FY25 10-K — committed revolving facilities; $9,065M unused/available; trade-receivables securitization $1.5B (accordion $1B) | Usable liquidity and springing covenants |
| Covenant EBITDA definition | Partial | Covenants are current ratio + debt-to-capitalization (balance-sheet-based, not EBITDA-leverage) | Prevents "fake headroom" |
| HoldCo / OpCo structure | Partial | Bunge Global SA (Switzerland) parent; bankruptcy-remote SPE (BSBV) referenced | Structural subordination and upstreaming |
| Hedging / swaps disclosure | Y | FY25 10-K — interest rate swaps; fixed vs floating; 100bp sensitivity ~$78M on variable-rate debt | Floating-rate exposure net of hedges |
| Change-of-control / rating triggers | Y | FY25 10-K — "debt agreements do not have any credit rating downgrade triggers that would accelerate maturity" | Hidden accelerants to distress |

## 4. Cross-Module Availability

Cross-module inputs are read from the current run directory `analyses/BG_2026-06-01/`. At triage time it was not yet populated. Within this `/research:full` run, business-model and earnings complete before this module's Layer 1, so their outputs become available at the current-run path then.

| Cross-Module Output | Available? (Y/N) at triage |
|---|---|
| business-model/10_external-dependency.md | N at triage (populated before BSS Layer 1 in this run) |
| business-model/11_capital-allocation-governance.md | N at triage (same) |
| business-model/03_segment-map.md | N at triage (same) |
| earnings/01_historical-financials.md | N at triage (same) |
| earnings/06_earnings-quality.md | N at triage (same) |
| earnings/03_margin-drivers.md | N at triage (same) |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N | 02, 06 | Not triggered — contractual-obligations maturity table present |
| No covenant disclosure | N | 04, 06 | Not triggered — covenants disclosed with compliance statement |
| No cash flow statement | N | 03, 04, 06 | Not triggered — 3-yr + Q1 interim cash flow present |
| No undrawn-facility disclosure | N | 03 | Not triggered — $9,065M unused committed capacity stated |
| No interest-expense detail | N | 04 | Not triggered — interest expense disclosed ($628M FY25) |
| No EBITDA base | N | 06 | Not triggered — Segment EBIT and income statement present |

Soft items (not score caps given Bunge's specific covenant package): no credit-rating-agency report in the pool (qualitative IG objective only); specific numeric covenant thresholds and the HoldCo/OpCo upstreaming map need extraction by Agents 01/04 from the credit-agreement disclosure.

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent balance sheet (Q1 FY26 10-Q, Mar 31, 2026), a full debt note with the ST/LT split and a year-by-year maturity table (FY25 10-K), and cash flow statements (3-yr annual + Q1 interim) are present, so leverage, liquidity, coverage, covenant headroom, and a full stress test can all be built.
- **Sections that can run:** capital structure, maturity wall, liquidity ($1,135M cash at YE25 + $9,065M committed undrawn + CP and securitization capacity), coverage/covenants, contingencies (Note 20), and the downside EBITDA stress test (Segment EBIT base, cyclicality from FY23→FY25 EBIT decline).
- **Active partial-data caps:** None.
- **Critical missing items:** None that block the module. Secondary: no credit-rating-agency report; specific numeric covenant thresholds and the HoldCo/OpCo upstreaming map must be pulled from the filing text.
- **Single highest-value missing document:** a credit-rating-agency report (Moody's / S&P / Fitch) — the one solvency input the filings cannot self-supply; informs refinancing access and cost.