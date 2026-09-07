# Governance Data Triage — NVT

**Evidence binding (MODULE_PIPELINE Step 1.5).** `NOSTRA_FROZEN_EVIDENCE_ROOT` is set and the complete quartet resolved (`NOSTRA_FROZEN_POOL_DATA_PATH` = `/Users/admin/nostra-prod/data/NVT`, `NOSTRA_FROZEN_POOL_OUT_DIR`, `NOSTRA_FROZEN_POOL_GENERATION` = `6db32848…1aecd1e6`, `NOSTRA_FROZEN_EVIDENCE_ROOT`). All reads went through that exact generation's `manifest.json`, `corpus.txt`, `ciq_facts.json`, `relationships.json` and its `extract` references. The extractor was NOT re-run; live `data/NVT/` and `analyses/NVT_2026-09-07/_pool_extracts/` were NOT read. `data/NVT/` below is a citation label only.

**Extraction health.** `manifest.totals`: 15 sources, 2 workbooks, 20 tabs, 33 extracts written, **0 failures**. Every source carries `status: "ok"`. No `fail`, no `fallback-text`, no `missing-dependency`, no `gdrive-pointer`. So nothing in this pool is hollow — what is missing is missing because it was never collected, not because extraction broke.

**Two filename traps that a filename-only inventory would fall into (fix F23).** Periods below are read from INSIDE each document, never from the file's sync date.
1. **`nVent Electric plc, 2026.pdf` is NOT a 2026 annual report.** It is the **Q1 FY2026 Form 10-Q** (quarterly period ended March 31, 2026, signed May 1, 2026 by Gary L. Corona) — the same filing as `nVent Electric plc, Q1 2026.pdf`. The pool holds 15 files but **14 distinct documents**; these two are different PDF renderings of one 10-Q (151,205 vs 165,957 extracted chars).
2. **`nVent Electric plc, 2026 rev.pdf` is NOT a company annual report either.** It is a **Form 11-K** — the annual report of the *nVent Management Company Retirement Savings and Investment Plan* for the plan year ended December 31, 2025. It is an employee-benefit-plan filing, not a company filing.

**The single fact that shapes this whole triage.** The pool's only company annual filing is the **FY2024 Form 10-K** (year ended 2024-12-31, filed 2025-02-18). Its **Items 10, 11, 12, 13 and 14 — directors and corporate governance, executive compensation, security ownership, related-person transactions, and principal accounting fees — are ALL incorporated by reference to the "Proxy Statement for our 2025 annual general meeting", and that proxy is not in the pool.** The governance disclosure this module exists to read was deliberately placed in a document nobody collected.

---

## 1. File Inventory

Every file, and every workbook tab as its own row, reconciled against `GENERATION_ROOT/manifest.json`. "Last Modified" is deliberately left as `n/a (Drive sync date — not used, fix F23)`; the Period column is parsed from inside the document.

| Filename | Type | Period Covered (from inside the document) | Last Modified | Governance Relevance |
|---|---|---|---|---|
| `nVent Electric plc, 2025.pdf` | **Form 10-K**, annual filing (US SEC) + Exhibits 4.7, 21, 23, 31, 32 | FY ended **2024-12-31**; filed **2025-02-18** | n/a (sync date — not used) | **High** — auditor's report + CAM, exec-officer bios, director signature roster, Ex.21 subsidiary list, contingencies Note 18, equity-comp plan table, buyback/dividend history, incorporation date |
| `nVent Electric plc, Q1 2026.pdf` | **Form 10-Q** (US SEC) | Quarterly period ended **2026-03-31**; signed **2026-05-01** | n/a | Medium — CFO signatory (Corona), contingencies, buybacks, EPG acquisition accounting |
| `nVent Electric plc, 2026.pdf` | **Form 10-Q — DUPLICATE of the row above**, same filing, different rendering | Quarterly period ended **2026-03-31**; signed **2026-05-01** | n/a | Low (duplicate — adds no independent evidence) |
| `nVent Electric plc, Q2 2026.pdf` | **Form 10-Q** (US SEC) | Quarterly period ended **2026-06-30**; signed **2026-07-31** | n/a | **High** — most recent filing; CFO Gary L. Corona certifications, Note 15 contingencies, EPG purchase-price allocation completed, buyback authorization balance |
| `nVent Electric plc, 2026 rev.pdf` | **Form 11-K** — employee benefit plan annual report | Plan FY ended **2025-12-31** | n/a | Medium — **plan auditor changed to Crowe LLP "since 2026"**, replacing Deloitte & Touche LLP; signed by Randolph A. Wacker |
| `nVent Electric plc, Q1 2026 Earnings Call, May 01, 2026.pdf` | Earnings-call transcript (S&P Global) | Call date **2026-05-01** (FQ1 2026) | n/a | **High** — candor/tone; first call with the new CFO |
| `nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf` | Earnings-call transcript (S&P Global) | Call date **2026-07-31** (FQ2 2026) | n/a | **High** — candor/tone, guidance language |
| `nVent Electric plc, Q1 2026 ppt.pdf` | Investor presentation (earnings deck) | **2026-05-01** | n/a | Medium — adjusted-measure framing (candor) |
| `2026-William-Blair-Conference-nVent-NVT-Presentation.pdf` | Investor presentation (conference deck) | **2026-06-03** (2026 William Blair Growth Stock Conference) | n/a | Medium — strategy claims to test promise-vs-delivery |
| `nVent-to-Acquire-Maverick-Power-2026.pdf` | Press release (material-event equivalent) | **2026-08-24** | n/a | **High** — $1.75bn acquisition + up to $550m earn-out; capital-allocation evidence |
| `nVent Electric plc NYSE NVT Competitors.rtf` | Capital IQ export (tier 5) | Not dated on the export | n/a | Low |
| `nVent Electric plc NYSE NVT Products.rtf` | Capital IQ export (tier 5) | Not dated on the export | n/a | Low |
| `nVent Electric plc NYSE NVT Strategic Alliances.rtf` | Capital IQ export (tier 5) | Not dated on the export | n/a | Low–Medium — names one counterparty entity (Central Industrial Supply Company Inc) |
| **Workbook: `nVent Electric plc NYSE NVT Financials.xls`** — 13 tabs, each listed below | Capital IQ workbook (tier 5) | FY2022A–FY2025A + LTM Jun-30-2026A (+ estimate columns) | n/a | — |
| ├─ tab `Key Stats` (91×9) | CIQ workbook tab | FY2022A–LTM Jun-30-2026A; FY2026E | n/a | Medium — shares outstanding 161.857939m; **no ownership/float/insider fields** |
| ├─ tab `Income Statement` (108×7) | CIQ workbook tab | FY2022A–LTM Jun-30-2026A | n/a | Medium — multi-year baseline for 11 |
| ├─ tab `Balance Sheet` (94×7) | CIQ workbook tab | FY2022A–LTM Jun-30-2026A | n/a | Medium |
| ├─ tab `Cash Flow` (76×7) | CIQ workbook tab | FY2022A–LTM Jun-30-2026A | n/a | **High** — multi-year buyback/dividend/M&A/capex history for 02 |
| ├─ tab `Multiples` (91×9) | CIQ workbook tab | FY2022A–latest close | n/a | Low |
| ├─ tab `Historical Capitalization` (39×7) | CIQ workbook tab | FY2022A–LTM Jun-30-2026A | n/a | Medium |
| ├─ tab `Capital Structure Summary` (99×7) | CIQ workbook tab | FY2022A–LTM Jun-30-2026A | n/a | Medium — leverage hygiene (A14-01) |
| ├─ tab `Capital Structure Details` (40×10) | CIQ workbook tab | FY2022A–LTM Jun-30-2026A | n/a | Medium — lender/instrument quality (A14-03) |
| ├─ tab `Ratios` (161×7) | CIQ workbook tab | FY2022A–LTM Jun-30-2026A | n/a | **High** — return series for the capital-allocation scorecard |
| ├─ tab `Supplemental` (74×7) | CIQ workbook tab | FY2022A–LTM Jun-30-2026A | n/a | Medium |
| ├─ tab `Industry Specific` (15×6) | CIQ workbook tab | FY2022A–LTM Jun-30-2026A | n/a | Low (sparse — 20 populated cells) |
| ├─ tab `Pension OPEB` (243×7) | CIQ workbook tab | FY2022A–LTM Jun-30-2026A | n/a | Medium — pension mark-to-market is an earnings-quality lever |
| └─ tab `Segments` (84×7) | CIQ workbook tab | FY2022A–LTM Jun-30-2026A | n/a | Medium — segment-income basis used for incentive targets |
| **Workbook: `nVentElectricplcNYSENVTEstimatesReport.xls`** — 7 tabs, each listed below | Capital IQ workbook (tier 5) | Export as-of not printed; internally consistent with a **post-Q2-FY26** export (sheet states "Current Fiscal Year End: Dec-31-2026 \| FQ3 2026 Earnings Release Date: Oct-30-2026") | n/a | — |
| ├─ tab `Consensus` (462×41) | CIQ workbook tab | FY2026E–FY2028E | n/a | Medium |
| ├─ tab `Recent Changes` (265×10) | CIQ workbook tab | rolling to Oct-30-2026 | n/a | Low |
| ├─ tab `Guidance` (179×41) | CIQ workbook tab | company guidance history | n/a | **High** — the promise side of promise-vs-delivery for 01/06 |
| ├─ tab `Multiples` (23×7) | CIQ workbook tab | forward | n/a | Low |
| ├─ tab `Surprise` (219×35) | CIQ workbook tab | multi-quarter actual-vs-consensus | n/a | **High** — the delivery side for 01/06 |
| ├─ tab `Trends` (300×16) | CIQ workbook tab | estimate trend history | n/a | Medium |
| └─ tab `Revisions` (467×12) | CIQ workbook tab | analyst revision history | n/a | Low |

**Sidecars in the bound generation.** `ciq_facts.json` — present, `status: present` on net debt $1,376.9m, total debt $1,632.9m, LTM EBITDA $1,074.6m, net debt/EBITDA 1.28x, LTM CFO $690.6m, levered FCF $468.2m, interest coverage 14.3x, EV/LTM EBITDA 26.2x. Later agents cite these as the authoritative READ of the CIQ workbooks and reconcile to them. `relationships.json` — present but **empty** (0 relationship rows, 0 nodes, 0 edges, 0 named entities): the pool contains no Capital IQ Suppliers/Customers export, so there is no vendor supply-chain graph to read. That is an absence of a tier-5 view, not a finding about the company.

## 1A. External Data

**None.** `manifest.sources` carries no row with `external: true`, and the frozen `raw/NVT/` tree contains no `external/` folder. No provider sidecars, no alt-data, no expert calls, no broker research. Nothing external moved this verdict — there was nothing external to move it.

---

## 2. Most Recent Sources

Ages measured from the period-end / as-of date inside the document to 2026-09-07.

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Proxy / DEF 14A | **NONE IN POOL** — the FY24 10-K incorporates Items 10–14 by reference to the "Proxy Statement for our 2025 annual general meeting", held **2025-05-16**; that document was not collected | — | — |
| Annual filing | `nVent Electric plc, 2025.pdf` (Form 10-K) | FY ended 2024-12-31 (filed 2025-02-18) | **20.2** (18.6 from filing date) |
| Compensation disclosure | **PARTIAL** — only the Item 12 equity-compensation-plan table in `nVent Electric plc, 2025.pdf` (4,108,862 securities issuable at a $30.64 weighted-average exercise price; 10,866,980 remaining under the 2018 Omnibus Incentive Plan). No CD&A, no summary comp table, no metrics or weights | As of 2024-12-31 | 20.2 |
| Ownership / insider-transaction data | **NONE IN POOL** — no beneficial-ownership table, no Schedule 13D/13G, no Form 4, no CIQ ownership export. CIQ `Key Stats` carries only "Shares Out. 161.857939" | — | — |
| Shareholder letter | **NONE IN POOL** | — | — |
| Transcript | `nVent Electric plc, Q2 2026 Earnings Call, Jul 31, 2026.pdf` | Call 2026-07-31 | **1.2** |
| 8-K (management changes) | **NONE IN POOL.** The nearest material-event document is the Maverick Power press release (`nVent-to-Acquire-Maverick-Power-2026.pdf`, 2026-08-24), which is a transaction announcement, not a management-change disclosure | 2026-08-24 | 0.5 |
| Most recent filing of any kind | `nVent Electric plc, Q2 2026.pdf` (Form 10-Q) | Period ended 2026-06-30 (filed 2026-07-31) | **2.2** |

**The gap that matters most for staleness.** As of 2026-09-07 the **FY2025 Form 10-K is absent** and the **2026 proxy is absent**. The pool therefore holds no audited annual disclosure covering FY2025, and no governance disclosure at all after the FY2024 10-K's incorporation-by-reference. Interim coverage is current (Q2 FY26, 2.2 months old); annual and governance coverage is not.

---

## 3. Governance Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Proxy / DEF 14A | **N** | Incorporated by reference to the absent 2025 proxy [FY24 10-K, Items 10–14] | Comp, ownership, board, related-party |
| Compensation disclosure (metrics/weights) | **N** | Item 11 points to the absent proxy. Only fact recoverable: reportable segment income — the measure the CEO uses "for setting incentive compensation targets" — is defined *exclusive of intangible amortization, acquisition related costs, restructuring and impairments* [FY24 10-K, Note 15; Q2 FY26 10-Q, Note 13] | Incentive alignment |
| Beneficial ownership table | **N** | Item 12 points to the absent proxy | Skin in the game, control |
| Insider-transaction data (buys/sells) | **N** | No Form 4, no CIQ insider export. The 10-K only notes that Section 16(a) reports exist and are filed with the SEC | Conviction signal |
| Board composition / independence | **PARTIAL — roster Y, independence N** | Signature page of the FY24 10-K names 9 non-executive directors + the CEO/Chair. Independence, committee membership, tenure, attendance and the skills matrix all sit in the absent proxy [FY24 10-K, Item 10 and Item 13] | Board quality, entrenchment |
| Related-party disclosure | **N** | Item 13 points to the absent proxy. The only RPT-adjacent line in the whole pool is a negative one: "no material sublease arrangements with third parties or lease transactions with related parties" [FY24 10-K, leases note] | Value leakage |
| Control structure (dual-class / blocs) | **Y** | Exhibit 4.7 "Description of Share Capital": one class of ordinary shares ($0.01 nominal), 25,000 euro deferred shares carrying **no voting or dividend rights**, 20,000,000 authorised preferred shares (none stated issued); Irish Companies Act 2014 regime; pre-emption rights opted out with periodic shareholder renewal | Minority-shareholder rights |
| Prior shareholder letters / guidance | **PARTIAL** | No shareholder letters. But the CIQ Estimates `Guidance` tab (179×41) and `Surprise` tab (219×35) give a multi-period guidance-and-delivery record, plus two 2026 transcripts and two investor decks | Promise-vs-delivery |
| M&A / buyback / dividend history | **Y** | FY24 10-K cash-flow commentary FY2022–FY2024 (dividends $126.8m/$116.8m; buybacks $100.0m/$60.8m/$65.9m; equity-statement rows FY22–FY24), ECM Industries ~$1.1bn (2023), Trachte ~$687.5m (2024), Thermal Management sale $1.7bn (closed 2025-01-30), Electrical Products Group ~$979.6m (closed 2025-05-01) [Q2 FY26 10-Q], Maverick Power $1.75bn + up to $550m earn-out (announced 2026-08-24); CIQ `Cash Flow` tab FY2022A–LTM Jun-30-2026A | Capital-allocation scorecard |
| Management tenure / turnover | **Y** | FY24 10-K "Information About Our Executive Officers" (8 officers, ages, roles, since-dates, 5-year histories) + the CFO change traceable across the pool (see 5E.1) | Stability and competence |
| Transcripts | **Y** | Q1 FY26 (2026-05-01) and Q2 FY26 (2026-07-31) | Candor and tone |
| Auditor's report + annexures (CARO / KAMs / IFC) | **Y** | Deloitte & Touche LLP, PCAOB ID 34, "auditor since 2017"; unqualified opinion on the financial statements **and** an attestation report on internal control over financial reporting; one Critical Audit Matter — valuation of the Trachte customer-relationship intangible [FY24 10-K, Report of Independent Registered Public Accounting Firm]. CARO/MR-3 are India-only instruments — genuinely Not Applicable here, not missing | Audit quality (08) |
| Auditor-fee disclosure (audit vs non-audit) | **N** | Item 14 points to the absent proxy; the 10-K names the auditor and PCAOB ID but discloses **no fee figures** | Auditor independence (08) |
| Secretarial audit report (India: MR-3) | **N/A** | Not an instrument of the US/SEC or Irish regime — genuinely not applicable, never scored as missing (§27) | Compliance assurance (08) |
| Related-party NOTE with counterparties + amounts | **N** | No RPT note in the 10-K or either 10-Q; the disclosure lives in the absent proxy | RPT quantification (09) |
| Contingent-liabilities & commitments note | **Y** | FY24 10-K **Note 18 "Commitments and Contingencies"** (and the balance-sheet reference at Note 18); Q2 FY26 10-Q **Note 15 "Commitments and Contingencies"**; Q2 FY26 10-Q Item 1 "Legal Proceedings" | Off-P&L exposure (10) |
| ≥2 consecutive annual financials | **Y** | Audited FY2022, FY2023, FY2024 in the FY24 10-K; CIQ `Income Statement`/`Balance Sheet`/`Cash Flow` tabs extend to FY2025A + LTM Jun-30-2026A (tier-5 vendor, **unaudited in this pool** — the FY2025 10-K is absent) | Beneish/Dechow forensic battery (11) |
| Shareholding-pattern history (quarters, pledge column) | **N** | An India/SEBI instrument with no US equivalent filed by the company; the US equivalents (13D/13G, Form 4) are also absent from the pool. Recorded as absent data, not as a regime mismatch | Ownership trend + pledge (04) |
| AGM/EGM voting results (scrutinizer reports) | **N** | No 8-K Item 5.07 voting results and no proxy. The 10-K does record that the 2024 AGM approved a 20% share-issuance authority and a matching pre-emption opt-out, both expiring 2025-11-17 [Exhibit 4.7] — an outcome, not a vote tally | Minority dissent (05) |
| Exchange announcements history (fines, Reg 30 events) | **N** | Only one standalone announcement is in the pool (the Maverick Power release). No 8-K series | Compliance hygiene (12) |
| Rating-agency reports / actions | **N** | None in pool | Rating conduct (12) |

---

## 4. Cross-Module Availability

Checked against the actual filesystem at `analyses/NVT_2026-09-07/`.

| Cross-Module Output | Available? (Y/N) |
|---|---|
| `business-model/11_capital-allocation-governance.md` | **Y** |
| `business-model/01_disqualifier-scan.md` | **Y** |
| `business-model/12_red-flags-sweep.md` | **Y** |
| `business-model/02_business-identity.md` | **Y** |
| `earnings/06_earnings-quality.md` | **Y** |
| `earnings/04_guidance-consensus.md` | **Y** |

Also present and usable by this module: the full `business-model/` set (00, 03–10, 99, dossier), the full `earnings/` set (00–08, 99, dossier, `sensitivity_summary.json`), plus `balance-sheet-survival/` and `competitive-intel/` folders. Agents 10 and 11 should self-resolve `balance-sheet-survival/05_off-balance-sheet-and-contingencies.md` and `01_capital-structure-and-leverage.md` from this run's root per MODULE_RULES.

**Two upstream findings the specialists must carry forward, with their qualifiers intact (§3):**
- `11_capital-allocation-governance` measured acquisition spend of **$3,017m FY2021–FY2025 against $2,091m of free cash flow**, a whole reporting segment sold to help pay for it, and $4,469.6m of goodwill and intangibles on a $7,146.3m balance sheet — and states it **could not test pay design at all** because no proxy is in the pool, so it scored the related rows at the conservative default. Agent 03 inherits that hole; agent 02 inherits the §24 Filter-4 serial-acquirer question, now with Maverick Power ($1.75bn + up to $550m) added on top.
- `12_red-flags-sweep` scored an earnings-quality flag at **52/100 (inverted — higher is worse)** on judgment-driven non-cash items (a $93.2m Luxembourg deferred-tax benefit taken in 2023 and 99.6% written off in 2024), and a **55/100** flag that the segment-income measure used to set incentive-compensation targets excludes the amortisation the company's own acquisitions create. Both are disclosed items, not integrity findings — that qualifier travels.

---

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No proxy / compensation disclosure | **Y** | 03, 99 | Incentive alignment **max 50**; Overall usefulness **max 70**. A6-01/02/03/05/06/07/08/09 Not Available with reason; A6-04 partially assessable from the Item 12 equity-plan table |
| No ownership / insider-transaction data | **Y** | 04, 99 | Shareholder friendliness **max 60**. A3 items and A15-02/03/04 largely Not Available; A3-04 (one share, one vote) IS answerable from Exhibit 4.7 |
| No board disclosure | **Y (partial — roster present, everything else absent)** | 05, 99 | Board independence/rights read **not assessable** beyond the roster; A1-01/04/06/07/08/11/12/13, A2 (all) Not Available with reason |
| No multi-year history | **N** | 02 | No cap — FY2022–FY2024 audited plus FY2025A/LTM vendor columns and five years of named deals support the scorecard |
| No transcripts / prior letters | **N (transcripts Y; shareholder letters N)** | 01, 06 | No cap. Promise-vs-delivery runs on the CIQ `Guidance` + `Surprise` tabs and two 2026 transcripts. State that no shareholder letter exists, so the letter-based candor test is replaced, not skipped |
| No related-party note | **Y** | 09, 99 | RPT quantification **not assessable**; **RPT & leakage risk floor 40** (unknown is not safe); Confidence **max 80**. The absence is itself an **Amber** disclosure finding for A5 — with the fair qualifier that a US filer routinely places RPT disclosure in the proxy, so this is a **pool-collection gap, not evidence of company opacity** |
| No contingent-liability note | **N** | 10, 99 | No cap — FY24 10-K Note 18 and Q2 FY26 10-Q Note 15 are both present |
| No auditor-fee / audit-detail disclosure | **Y** | 08, 99 | **A4-06 and A4-07 Not Available with reason**; Audit & assurance quality **max 65**; Confidence **max 80**. A4-01/02/05/09/10 remain fully assessable from the auditor's report |
| Under 2 years of financials | **N** | 11, 99 | No cap — three consecutive audited years (FY2022–FY2024) support the full Beneish/Dechow battery. **But agent 11 must state that FY2025 is vendor-sourced and unaudited in this pool**, so the most recent year-over-year pair is not filing-grade |
| Web/database sweep unavailable this run | **N (not established at triage)** | 07, 12, 99 | No cap applied here. Triage cannot prove reachability on 07's and 12's behalf; each declares its own coverage and applies the "coverage-limited" caps itself (People & network integrity max 65; Legal & regulatory risk floor 40; Confidence max 70) **if** its sweep cannot run. Never present an unrun sweep as swept-and-clean |
| No company website (D-1 unreachable), other discovery sources available | **N** | 07 | Not applicable — the website is named in the filings (`http://www.nvent.com`; governance page `https://investors.nvent.com/corporate-governance/`). D-1 has a live starting point |
| Discovery loop cannot run at all — no company website AND registry, trademark and address sources all unreachable | **N** | 07, 99 | Not applicable. Every D-1…D-5 anchor is present in the pool (see 5E.3): website, Irish incorporation date, brand list, principal office, EIN and SEC file number |

---

## 5E. Person & Entity Register (feeds 07 — Hard Rule)

This is the SEED for `07`'s discovery loop, not the finished roster. The filings list who the company chose to list; `07` expands from here per the Entity & Network Discovery Protocol.

### 5E.1 Person Register

| # | Name | Identifier (registry ID, if disclosed) | Role | Category | Source (filing + section) |
|---|---|---|---|---|---|
| 1 | Beth A. Wozniak | Not in pool | **Chief Executive Officer since 2018 and Chair of the Board since 2023**; age 60. Prior: President, Pentair Electrical segment (2017); President, Pentair Flow & Filtration (2015–16); Honeywell ECC (2011–15) and Sensing & Controls (2006–11); Honeywell/AlliedSignal 1990–2006 | Director + KMP (combined CEO/Chair) | FY24 10-K, "Information About Our Executive Officers"; signature page ("Chief Executive Officer and Director"); Q2 FY26 10-Q Exhibit 32.1 (still CEO at 2026-07-31); Maverick PR 2026-08-24 ("nVent Chair and CEO Beth Wozniak") |
| 2 | **Gary L. Corona** (transcripts: "Gary Louis Corona") | Not in pool | **Executive Vice President and Chief Financial Officer** — signs the Q1 FY26 and Q2 FY26 10-Qs and their §302/§906 certifications | KMP (current) | Q1 FY26 10-Q signature page and Exhibits 31.2/32.2, dated 2026-05-01; Q2 FY26 10-Q Exhibits 31.2/32.2, dated 2026-07-31; Q1 FY26 earnings call, 2026-05-01 ("Gary Corona, our Chief Financial Officer") |
| 3 | **Sara E. Zawoyski** | Not in pool | **FORMER** EVP and Chief Financial Officer (2019 – sometime between 2025-02-18 and 2026-05-01), and **Interim President of Enclosures since June 2024**; age 50. Prior: SVP Finance & Treasurer of the Company 2018–19; CFO roles across Pentair 2012–18; PepsiAmericas 2002–10; PricewaterhouseCoopers audit practice 1996–2002 | **Former KMP** | FY24 10-K, "Information About Our Executive Officers" and signature page (signed the 10-K as CFO on 2025-02-18). **Appears nowhere in any 2026 document in the pool.** No departure announcement, no 8-K, no successor announcement is in the pool — the transition is visible only by comparing signature pages |
| 4 | Jon D. Lammers | Not in pool | EVP, General Counsel and Secretary since 2018; age 60. Also acted as attorney-in-fact for the eight non-executive director signatures on the FY24 10-K. Prior: Pentair GC Electrical 2017–18; Foulston Siefkin 2016–17; SVP/GC/Secretary Spirit AeroSystems 2012–16; Cargill 1997–2012 | KMP (Company Secretary equivalent) | FY24 10-K, "Information About Our Executive Officers"; signature page attestation |
| 5 | Randolph A. Wacker | Not in pool | SVP and **Chief Accounting Officer since 2018**, Treasurer since 2019; age 60. Prior: Assistant Corporate Controller of Pentair 2005–17; Larson, Allen, Weishair & Co. 1988–93 | KMP | FY24 10-K, "Information About Our Executive Officers" and signature page; **Form 11-K signature page (plan FY2025)** — confirms he remained in role into 2026 |
| 6 | Lynnette R. Heath | Not in pool | EVP and Chief Human Resources Officer since 2018; age 57 | KMP | FY24 10-K, "Information About Our Executive Officers" |
| 7 | Aravind Padmanabhan | Not in pool | EVP and Chief Technology Officer since 2019; age 56. Prior: Honeywell CTO roles 2013–19 | KMP | FY24 10-K, "Information About Our Executive Officers" |
| 8 | Martha C. Bennett | Not in pool | EVP and Chief Marketing Officer since January 2024; age 52. Prior: 3M 2004–24 | KMP | FY24 10-K, "Information About Our Executive Officers" |
| 9 | Robert J. van der Kolk | Not in pool | President of Electrical & Fastening Solutions since 2018; age 56. Prior: Pentair EFS 2015–17; ERICO 2001–15; Cargill 1993–2001 | KMP | FY24 10-K, "Information About Our Executive Officers" |
| 10 | Sherry A. Aaholm | Not in pool | Director | Director | FY24 10-K signature page (signed by attorney-in-fact, 2025-02-18) |
| 11 | Jerry W. Burris | Not in pool | Director | Director | FY24 10-K signature page |
| 12 | Susan M. Cameron | Not in pool | Director | Director | FY24 10-K signature page |
| 13 | Michael L. Ducker | Not in pool | Director | Director | FY24 10-K signature page |
| 14 | Danita K. Ostling | Not in pool | Director | Director | FY24 10-K signature page |
| 15 | Nicola Palmer | Not in pool | Director | Director | FY24 10-K signature page |
| 16 | Herbert K. Parker | Not in pool | Director | Director | FY24 10-K signature page |
| 17 | Greg Scheu | Not in pool | Director | Director | FY24 10-K signature page |
| 18 | Tom Currier | Not in pool | President and CEO of **Maverick Power** — counterparty principal in the $1.75bn acquisition announced 2026-08-24; becomes an in-scope person if the deal closes | Counterparty principal (not yet a KMP) | `nVent-to-Acquire-Maverick-Power-2026.pdf`, 2026-08-24 |
| 19 | **UNNAMED — President, Enclosures (now Systems Protection)** | — | The role existed and was vacant: Sara Zawoyski is described as "Interim President of Enclosures **since June 2024**", so a predecessor left on or before June 2024. Neither the predecessor nor any permanent successor is named anywhere in the pool | Former / vacant — unnamed | FY24 10-K, "Information About Our Executive Officers" (inference of the vacancy is the filing's own wording, not an assumption) |
| 20 | **UNNAMED — Board committee chairs (Audit and Finance; Compensation and Human Capital; Nominating/Governance)** | — | The FY24 10-K confirms these committees exist (it names the "Audit and Finance Committee of the Board of Directors" and the "Compensation and Human Capital Committee Report"), but **no committee membership or chair is named in the pool** — all of it sits in the absent proxy | Director roles — unnamed | FY24 10-K, Items 11 and 14 (captions of the absent proxy) |
| 21 | **UNNAMED — Lead Independent Director** | — | The CEO also chairs the board (Wozniak, Chair since 2023). Whether a lead independent director exists as the counterweight is **not disclosed anywhere in the pool** — a live A1-02/A1-03 question that 05 must record as Not Available rather than resolve | Director role — unnamed | Absent from FY24 10-K; would sit in the absent proxy's "Corporate Governance Matters" |

**Three leads handed to `07` and `01`, stated as leads, not conclusions:**
1. **A CFO change occurred with no disclosure document in this pool.** Zawoyski signed the FY24 10-K as CFO on 2025-02-18; Corona is CFO by 2026-05-01. The pool contains no 8-K, no press release, and no proxy explaining the transition, the reason, or the timing. `07` should establish the date and stated reason from primary sources (A4-15 gatekeeper-exit cluster, A13-04 team vintage). **Nothing here suggests anything adverse** — a CFO change over a ~14-month window is ordinary; what is missing is the disclosure, and the missing disclosure is a pool gap, not a company failure, until 07 checks whether an 8-K was in fact filed.
2. **Gary L. Corona has no biography anywhere in the pool.** No age, no prior roles, no start date. The FY24 10-K predates him and there is no FY2025 10-K. His entire A16 dossier must be built externally.
3. **The plan auditor changed.** Crowe LLP states it "served as the Plan's auditor since 2026", replacing Deloitte & Touche LLP on the *nVent Management Company Retirement Savings and Investment Plan* [Form 11-K, plan FY2025]. **This is the benefit-plan auditor, NOT the company auditor** — Deloitte & Touche LLP remains nVent's principal accountant, auditor since 2017, PCAOB ID 34. Agent 08 must not read this as an A4-01/A4-04 company-auditor rotation or resignation. It is a lower-tier data point about a subsidiary-sponsored plan.

### 5E.2 Entity Register

All entities below are `filing-supplied`. `relationships.json` is empty, so no entity here came from a vendor graph.

**Named in narrative, transactional, or lineage context:**

| # | Entity | Registry identifier | Relationship as disclosed | Source (filing + section) |
|---|---|---|---|---|
| 1 | **nVent Electric plc** | Ireland; SEC Commission file **001-38265**; IRS EIN **98-1391970** | The listed issuer (NYSE: NVT) | FY24 10-K cover page |
| 2 | **Pentair plc** | Not in pool | **Former parent.** Separated its Water and Electrical businesses on 2018-04-30; distributed one nVent share per Pentair share (record date 2018-04-17); nVent began trading 2018-05-01 | FY24 10-K, "History and Development" |
| 3 | ECM Investors, LLC / ECM Industries, LLC | Not in pool | Acquired 2023 for ~$1.1bn cash; now consolidated subsidiaries | FY24 10-K, "History and Development"; Exhibit 21 |
| 4 | Trachte, LLC | Not in pool | Acquired 2024 for ~$687.5m cash; the customer-relationship intangible is the auditor's sole Critical Audit Matter | FY24 10-K, "History and Development" and Report of Independent Registered Public Accounting Firm |
| 5 | **BCP VI Summit Holdings LP** (assignee of **BCP Acquisitions LLC**), affiliate of funds managed by **Brookfield Asset Management** | Not in pool | **Divestiture counterparty** — bought the Thermal Management business for $1.7bn cash; agreement 2024-07-31, closed 2025-01-30 | FY24 10-K, "History and Development" |
| 6 | **Avail Infrastructure Solutions** — "Electrical Products Group" (enclosures, switchgear, bus systems) | Not in pool | Acquired 2025-05-01 for ~$979.6m cash; purchase-price allocation completed in Q2 2026 | Q2 FY26 10-Q, Note on the Electrical Products Group acquisition |
| 7 | **Maverick Power** | Not in pool | **Pending acquisition** — $1.75bn purchase price plus up to $550m contingent consideration on 2027 and 2028 performance metrics; announced 2026-08-24 | `nVent-to-Acquire-Maverick-Power-2026.pdf` |
| 8 | ERICO Global Company | Not in pool | Acquired by **Pentair** in 2015; became nVent's Electrical & Fastening Solutions business — pre-separation lineage | FY24 10-K, "History and Development"; also Exhibit 21 as a US subsidiary |
| 9 | **Federal-Hoffman Corporation** | Not in pool | The company's stated origin point: "Our roots within Pentair trace back to the acquisition of Federal-Hoffman Corporation in **1988**, which included the nVent HOFFMAN enclosures brand" | FY24 10-K, "History and Development" |
| 10 | **nVent Management Company** | Not in pool | US subsidiary; **sponsor and administrator** of the Retirement Savings and Investment Plan; address 1665 Utica Avenue South, Suite 700, St. Louis Park, Minnesota 55416 | Form 11-K, plan FY2025; Exhibit 21; manifest `entities` |
| 11 | **Deloitte & Touche LLP** | **PCAOB ID 34** | Principal accountant / independent registered public accounting firm, **auditor since 2017**; also the prior-year plan auditor | FY24 10-K, auditor's report and Item 14; Form 11-K |
| 12 | **Crowe LLP** | Not in pool | **Plan** auditor "since 2026" for the Retirement Savings and Investment Plan — not the company auditor | Form 11-K, plan FY2025 |
| 13 | **Tonka Bay Insurance Company** (United States) | Not in pool | Wholly-owned subsidiary — a **captive insurer**. Flagged for `09`/`10`: captives are a standard structure, judged on conduct (reserving, intra-group premium flows), never on existence | FY24 10-K, Exhibit 21 |
| 14 | **Iceotope Group Limited** (Canada) | Not in pool | **Minority holding — 5.2% owned** (the only non-100% holding besides Torgoterm) | FY24 10-K, Exhibit 21 footnote |
| 15 | **Torgoterm AD** (Bulgaria) | Not in pool | **Minority holding — 19% owned** | FY24 10-K, Exhibit 21 footnote |
| 16 | Central Industrial Supply Company Inc | Not in pool | Named counterparty in the Capital IQ Strategic Alliances export (tier-5 vendor, not a filing) | `nVent Electric plc NYSE NVT Strategic Alliances.rtf`; manifest `entities` |
| 17 | Limited Liability Company **nVent Rus** (Russian Federation) | Not in pool | Wholly-owned subsidiary. Flagged for `12`: a Russian-jurisdiction subsidiary raises a sanctions/compliance question the pool does not answer | FY24 10-K, Exhibit 21 |

**Complete Exhibit 21 roster — "nVent Electric plc subsidiaries as of December 31, 2024", 138 entities, all 100% owned unless footnoted.** Every name the pool discloses, by jurisdiction:

- **United States (44):** Bergen Industries, LLC · BESM Holdings, LLC · CIS Global LLC · CIS Holding Corp. · ECM Holdings Inc. · ECM Industries, LLC · ECM Investors, LLC · ECMI Holdings, LLC · Electronic Enclosures, LLC · Enclosures Inc. · ERICO GLOBAL COMPANY · ERICO International Corporation · Everest Blocker Holding, Inc. · FTZ Holdco LLC · GCP CIS Blocker Inc. · GCP CIS Holdings, LLC · Hoffman Enclosures (Mex.), LLC · Hoffman Enclosures Inc. · Hoffman Schroff Holdings, Inc. · ILSCO Extrusions, LLC · ILSCO International, LLC · ILSCO, LLC · King Technology of Missouri, LLC · Lionel Acquisition Co. · nVent EFS Investments 1, LLC · nVent EFS Investments 2, LLC · nVent EFS Investments LP · nVent Holdings, Inc. · nVent International Holdings, Inc. · nVent Management Company · nVent Thermal LLC · Parkline Field Services LLC · Parkline Parent Company, Inc. · Parkline, Inc. · Schroff, Inc. · Surge Suppression, LLC · The Patent Store, LLC · Tonka Bay Insurance Company · Tracer Construction LLC · Tracer Industries Management LLC · Tracer Industries, Inc. · Trachte Acquisition Sub, LLC · Trachte Associates Southeast LLC · Trachte Associates, L.L.P. · Trachte Southeast LLC · Trachte, LLC · Warrior Acquisition Parent, Inc. · Warrior Acquisition, Inc. · Warrior Intermediate Parent, LLC · Warrior Power Structures, Inc.
- **China (8):** Asia Pacific CIS (Wuxi) Co., Ltd. · ECM (Shanghai) Trading Co., Ltd. · ERICO Ltd. · nVent Electrical Products (Shanghai) Co., Ltd. · nVent Electrical Products China Co., Ltd. · nVent Thermal (Shanghai) Co., Ltd. · nVent Thermal (Shanghai) Engineering Co., Ltd. · nVent Thermal (Suzhou) Co., Ltd. · Yabaida Electronics (Shenzhen) Company Limited
- **Canada (7):** ERICO Canada Inc. · Iceotope Group Limited\* (5.2%) · Ilsco Canada Newco ULC · nVent Project Services Canada, Inc. · nVent Services Canada Limited · nVent Thermal Canada Ltd. · PP Canada Inc. · Tracer Industries Canada Limited
- **Germany (6):** Eldon GmbH · nVent Armaturen Holding GmbH · nVent Thermal Germany GmbH · Schroff GmbH · Schroff Holdings Germany GmbH · Steinhauer GmbH
- **Mexico (6):** Hoffman Enclosures Mexico, S. de R.L. de C.V. · Hoffman Schroff de Mexico S.a.r.l. · Hoffman Schroff Manufacturing S. de R.L. de C.V. · Hoffman Schroff Sales S. de R.L. de C.V. · ERICO Mexico, S.A. de C.V. · ILSCO de Mexico, S. de R.L. de C.V.
- **India (5):** CISWW Engineering India Private Limited · nVent Electrical Products India Private Limited · nVent Enclosures India Private Limited · nVent Power & Data Infrastructure India Private Limited · nVent Thermal India Private Limited
- **Switzerland (5):** Hoffman Schroff GmbH · nVent Finance Group GmbH · nVent Services GmbH · nVent Services Holding GmbH · nVent Thermal Europe GmbH
- **Netherlands (5):** Eldon NV · ERICO Europe B.V. · nVent Finance NL B.V. · nVent Holding NL B.V. · nVent Thermal Netherlands B.V.
- **Luxembourg (4):** nVent Finance S.a.r.l. · nVent Global S.a.r.l. · nVent International Holding S.a.r.l. · nVent Luxembourg S.a.r.l.
- **Italy (4):** ERICO Italia S.r.l. · nVent Enclosures Italia Srl · nVent Italy S.r.l. · Texa Industries S.r.l.
- **France (4):** ERICO France Sarl · nVent Holdings S.A. · nVent Thermal France SAS · Schroff SAS
- **United Kingdom (4):** Eldon Electric Limited · nVent International (UK) Ltd. · nVent Solutions (UK) Limited · nVent UK Holdings Limited
- **Sweden (3):** Eldon AB · Eldon Holding AB · nVent Nordic AB
- **Poland (3):** ERICO Poland SP. Z.o.o. · Hoffman Schroff Poland Sp.z.o.o. · nVent Thermal Polska Sp. z.o.o.
- **Norway (2):** Eldon AS · nVent Thermal Norway AS
- **Romania (2):** Eldon SRL · nVent Thermal Romania S.R.L.
- **Singapore (2):** Hoffman Schroff Asia Pte Ltd · Hoffman Schroff PTE Ltd
- **Hong Kong (2):** Alberta Electronic Company Limited · ERICO Limited
- **Brazil (2):** ERICO do Brasil Ltda. · nVent do Brasil Ltda.
- **Belgium (2):** nVent Belgium B.V. · nVent Thermal Belgium NV
- **One each:** Thailand — Asia Pacific CIS (Thailand) Co., Ltd. · Austria — Eldon Austria GmbH · Spain — Eldon Espana, S.A.U. · Australia — ERICO Products Australia Pty. Ltd · Russian Federation — Limited Liability Company nVent Rus · Finland — nVent Finland Oy · Japan — nVent Japan Co., Ltd. · United Arab Emirates — nVent Middle East FZE · Turkey — nVent Teknoloji Sistemleri Ticaret Limited Sirketi · Korea (Republic of) — nVent Thermal Korea Ltd. · Kazakhstan — nVent Thermal KZ LLP · Taiwan — Schroff Co. Ltd. Taiwan · Bulgaria — Torgoterm AD\* (19%)

\* Non-wholly-owned, per the Exhibit 21 footnote.

**Note for `09`/`11`:** roughly 20 entities still carry the "Thermal" name in the Dec-2024 Exhibit 21 even though the Thermal Management business was sold on 2025-01-30. Exhibit 21 is a point-in-time list as of 2024-12-31, so this is expected, not an anomaly — but it means **the pool contains no post-divestiture subsidiary list**, because the FY2025 10-K (which would carry the updated Exhibit 21) is absent. Do not treat the Dec-2024 roster as the current group.

### 5E.3 Company identity & lineage anchors (feeds 07's discovery loop)

| Anchor | Value | Source |
|---|---|---|
| Registry identifier (CIN / company number / CIK) | **Irish company registration number: not in pool.** What the pool does give: SEC Commission file number **001-38265**; IRS Employer Identification No. **98-1391970**; PCAOB ID of the auditor 34 | FY24 10-K cover page; Q1/Q2 FY26 10-Q cover pages |
| Incorporation date | **Incorporated in Ireland on 2017-05-30** | FY24 10-K, "History and Development" (stated twice — narrative and Note 1) |
| Any founding year the company CLAIMS | Two claims, both **disclosed and attributed, neither hidden**: (a) "Our roots within Pentair trace back to the acquisition of **Federal-Hoffman Corporation in 1988**, which included the nVent HOFFMAN enclosures brand"; (b) "brands, some of which have a history spanning **over 100 years**" | FY24 10-K, "History and Development" and segment overview |
| Former names, if disclosed anywhere in the pool | **None disclosed.** No "formerly", "erstwhile" or previous-name statement appears anywhere in the pool. nVent was created as a 2017 Irish incorporation to receive Pentair's Electrical business in the 2018-04-30 separation | FY24 10-K, "History and Development" |
| Company website URL | `http://www.nvent.com`; corporate-governance page `https://investors.nvent.com/corporate-governance/` (where the Code of Business Conduct and Ethics and Item 5.05 waivers are posted) | FY24 10-K, "Available Information" and Item 10 |
| Principal brand / product names the company trades under | **nVent CADDY, nVent ERICO, nVent HOFFMAN, nVent ILSCO, nVent SCHROFF, nVent TRACHTE** — the umbrella brand is "nVent". Enclosures brands specifically: nVent HOFFMAN, nVent SCHROFF, nVent TRACHTE. Segments renamed in Q1 2025: Enclosures → **Systems Protection**; Electrical & Fastening Solutions → **Electrical Connections**. (nVent RAYCHEM and the Thermal brands left with the Thermal Management divestiture) | FY24 10-K, business overview and segment description |
| Registered-office address | **Not in pool for the Irish registered office** — the 10-K gives only the *principal executive offices*: **The Mille, 1000 Great West Road, 8th Floor (East), London, TW8 9DW, United Kingdom** (tel. +44-20-3966-0279). US management office: **Minneapolis, Minnesota**. Plan sponsor address: 1665 Utica Avenue South, Suite 700, St. Louis Park, Minnesota 55416. Exhibit 4.7 refers to "the registered office of nVent" without stating it | FY24 10-K cover page and business overview; Exhibit 4.7; Form 11-K |

**Lineage LEAD (not a finding).** The claimed origin (Federal-Hoffman, **1988**) and the "over 100 years" brand-history claim both predate the entity's incorporation date (**2017-05-30**). Under A17-02 that is a lead, not a flag, **and on the face of the pool it looks like the benign case**: the company states the lineage explicitly, names the parent it inherited it from (Pentair), names the 2015 ERICO acquisition Pentair made, and dates the separation. A truthfully-cited group or parent history is expressly not an A17-02 red condition. `07` runs the D-2 test to confirm or reconcile it; **this triage asserts no predecessor entity exists or is concealed** — that conclusion is `07`'s to make once lineage evidence supports it. The tax-residency split is a second D-2/D-5 input: organised in Ireland, "centrally managed and controlled" in the UK, UK tax resident, US management office in Minneapolis, plus a Luxembourg/Netherlands/Switzerland financing chain visible in Exhibit 21.

---

## 5A. Jurisdiction & Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | **United States** (issuer incorporated in **Ireland**, tax resident in the **United Kingdom**) | FY24 10-K cover page; "History and Development" |
| Exchange | **New York Stock Exchange**, ticker **NVT**; Ordinary Shares, nominal value $0.01; listed since 2018-05-01 | FY24 10-K and Q2 FY26 10-Q cover pages, Securities registered pursuant to Section 12(b) |
| Filing regime | **US SEC — domestic filer** (Form 10-K / 10-Q / 8-K / DEF 14A / Form 4 / 11-K), Commission file 001-38265. **Not** a foreign private issuer: it files 10-K/10-Q, not 20-F/6-K. Corporate-law overlay: **Irish Companies Act 2014** (share capital, pre-emption rights, treasury shares, Irish Takeover Rules) plus **NYSE Listing Standards** | FY24 10-K cover page and Exhibit 4.7 "Description of Share Capital" |
| Reporting standard / currency / fiscal year | **US GAAP**; **USD**, in millions; fiscal year ends **31 December** | FY24 10-K; CIQ Consensus tab header "Acctg. Standard: US GAAP" |
| Sector | **Electrical equipment / electrical connection and protection solutions** — industrial manufacturer. Two segments (from Q1 2025): **Systems Protection** (ex-Enclosures) and **Electrical Connections** (ex-Electrical & Fastening Solutions) | FY24 10-K, business overview; Maverick PR ("a global leader in electrical connection and protection solutions") |
| Sector-specific governance overlay required? | **N — no special overlay.** This is a plain industrial manufacturer: not a bank/NBFC/insurer, not IT services, not pharma, not infra/real estate, not a holding company. **The standard CFO/PAT and working-capital lenses DO apply.** Two structural features to handle inside the ordinary framework, not as overlays: (a) a **captive insurer** (Tonka Bay Insurance Company) that `09`/`10` judge on conduct, not existence; (b) an **acquisition-led** capital-allocation model that routes to §24 Filter 4, already opened by `11` | FY24 10-K, Exhibit 21 and "History and Development" |
| Document language(s) | **English only** — all 15 sources. No translation is required and **no language-based gap is recorded** (CLAUDE.md §27) | `manifest.sources`, all `status: ok`; every extract read |

**Instruction to later agents on regime (Hard Rule).** This is a **US/SEC + Irish-company-law** filer. Do **not** mark India/SEBI instruments — shareholding-pattern filings, promoter pledge/encumbrance disclosures, MR-3 secretarial audit, CARO annexure, SAST/PIT disclosures, scrutinizer reports — as "missing data". They are **genuinely Not Applicable** to this regime. Likewise, "promoter" has no meaning here: nVent is a **widely held professional-management company with no controlling shareholder disclosed in the pool**, so every A3 promoter-holding, promoter-pledge and promoter-group item is answered as *Not Applicable (no promoter/controller under this regime)*, **not** as a red flag and **not** silently Green. Conversely, the genuinely missing US instruments are **DEF 14A, Form 4, Schedule 13D/13G, and the FY2025 10-K** — those are real gaps and are scored as such.

---

## 5B. Source Coverage Matrix

Confidence 1–5, where 5 = a primary audited filing that fully answers the need and 1 = essentially nothing.

| Governance Need | Best Available Source | Period | Confidence 1–5 | Missing? | Replacement Source |
|---|---|---|---|---:|---|
| Board composition | FY24 10-K signature page — names 9 directors + CEO/Chair | 2025-02-18 | **2** | **Yes** — independence, committees, tenure, attendance, skills matrix, lead-ID | The absent 2025/2026 proxy; NYSE-required governance page at `investors.nvent.com/corporate-governance/` (web, would need labelling as unverified) |
| Compensation | FY24 10-K Item 12 equity-plan table only (options/RSUs/PSUs outstanding, $30.64 WAEP, 10,866,980 remaining) + the segment-income definition used to set incentive targets | FY2024 | **2** | **Yes** — all of CD&A, summary comp table, metrics, weights, ratio, clawback, severance | The absent proxy |
| Ownership | CIQ `Key Stats` — shares outstanding only (161.857939m) | LTM Jun-2026 | **1** | **Yes** — entirely | The absent proxy's "Security Ownership" section; Schedule 13G filings |
| Insider trades | **None** | — | **1** | **Yes** — entirely | Form 4 filings |
| Related-party transactions | **None.** Only a negative lease statement ("no… lease transactions with related parties") | FY2024 | **1** | **Yes** | The absent proxy's related-person-transactions policy section |
| Auditor report | FY24 10-K — Deloitte & Touche LLP, unqualified opinion on the financials **and** on internal control over financial reporting; one CAM (Trachte customer-relationship intangible); auditor since 2017; PCAOB ID 34; Exhibit 23 consent | FY2024 | **5** | No | — |
| Auditor fees / independence | **None** — Item 14 defers to the absent proxy | — | **1** | **Yes** | The absent proxy, Proposal 4 |
| Secretarial / compliance report | **Not applicable to this regime.** The closest analogues present: SOX §302 and §906 certifications by CEO and CFO in each 10-Q, and management's ICFR report with auditor attestation in the 10-K | FY2024 / Q2 FY26 | **4** (for what the regime actually requires) | No — N/A, not missing | — |
| AGM voting | **None.** One indirect outcome: the 2024 AGM approved a 20% issuance authority and a matching pre-emption opt-out (both expiring 2025-11-17) | 2024 AGM | **1** | **Yes** — no vote tallies, no dissent levels | 8-K Item 5.07; proxy-advisor reports |
| Capital-allocation history | FY24 10-K cash-flow and equity statements (FY2022–FY2024) + five named deals FY2023–FY2026 + CIQ `Cash Flow`/`Ratios` tabs (FY2022A–LTM Jun-2026A) + `11_capital-allocation-governance` | FY2021–2026 YTD | **4** | No | — |
| Legal / regulatory cases | FY24 10-K Note 18 and Q2 FY26 10-Q Note 15 (Commitments and Contingencies) + Q2 FY26 10-Q Item 1 Legal Proceedings | FY2024 / Q2 FY26 | **3** | Partly — no regulator releases, no enforcement history, no 8-K series | External legal/regulatory databases per `frameworks/GOVERNANCE_DATABASES.md` (agent 12) |

---

## 5C. Data Freshness

| Source | Period | As-of Date | Age | Stale? | Impact |
|---|---|---|---|---|---|
| Form 10-K (FY2024) | FY ended 2024-12-31 | Filed 2025-02-18 | **20.2 months** from period end | **YES** | The only audited annual filing in the pool is nearly two years past its period end. Every governance structure it describes — board, committees, officers — has had a full annual cycle to change, and one change is already visible (the CFO). Agents 05, 08, 09 must date every structural claim to 2024-12-31, not to today |
| **FY2025 Form 10-K** | FY ended 2025-12-31 | **ABSENT** | — | **N/A — missing** | No audited FY2025 figures, no updated Exhibit 21 subsidiary list, no FY2025 auditor's report or CAM, no post-divestiture group structure. Agent 11's most recent year-over-year pair rests on vendor data |
| **2025 / 2026 Proxy Statement** | AGM 2025-05-16 (and the 2026 AGM) | **ABSENT** | — | **N/A — missing** | The single largest gap. Removes compensation, ownership, board independence, related-party and auditor-fee disclosure in one stroke |
| Form 10-Q (Q1 FY26) ×2 renderings | Quarter ended 2026-03-31 | Filed 2026-05-01 | 5.2 months | No | Current |
| Form 10-Q (Q2 FY26) | Quarter ended 2026-06-30 | Filed 2026-07-31 | **2.2 months** | No | Most recent filing; anchors contingencies and buyback capacity |
| Form 11-K (plan) | Plan FY ended 2025-12-31 | Filed 2026 | 8.2 months | No | Plan-auditor change only |
| Q1 FY26 earnings call | FQ1 2026 | 2026-05-01 | 4.2 months | No | Candor baseline; new CFO's first call |
| Q2 FY26 earnings call | FQ2 2026 | 2026-07-31 | **1.2 months** | No | Freshest candor evidence |
| Q1 FY26 earnings deck | — | 2026-05-01 | 4.2 months | No | Adjusted-measure framing |
| William Blair conference deck | — | **2026-06-03** | 3.1 months | No | Strategy claims for promise-vs-delivery |
| Maverick Power press release | — | **2026-08-24** | **0.5 months** | No | **Freshest document in the pool.** A $1.75bn deal announced 14 days before this run and covered by no filing in the pool |
| CIQ Financials workbook (13 tabs) | FY2022A–FY2025A + LTM Jun-30-2026A | Latest actual Jun-2026 | ~2.2 months | No | Tier-5 vendor; FY2025 column is the only FY2025 annual data available and is **unaudited in this pool** |
| CIQ Estimates workbook (7 tabs) | FY2026E–FY2028E | Export as-of not printed; post-Q2-FY26 (next release Oct-30-2026) | ~1–2 months | No | Guidance/surprise history for 01 and 06 |
| CIQ Competitors / Products / Strategic Alliances (RTF) | Undated | **No date on the export** | Unknown | **Cannot be assessed** | Treat as undated tier-5 reference material; do not use for any time-sensitive claim |

**Source manifest CSV export: pending.** The task authorises writing only `00_governance-data-triage.md`, so `source_manifest.csv` was not created; the inventory tables above (§1, §5B, §5C) are the manifest of record for this module.

---

## 6. Sufficiency Verdict

- **Verdict: Partial**

- **Reason:** The filings are present, current at the interim level and clean in extraction (15/15 sources `ok`, 0 failures), and both management track record and multi-year capital allocation are fully assessable — but the FY2024 10-K routes **all five governance items (10–14) to a proxy statement that is not in the pool**, so compensation, beneficial ownership, board independence, related-party transactions and auditor fees have no source at all.

- **Specialists that can run:**
  - **Run substantially unimpaired:** management track record (01) · capital allocation (02) · candor and disclosure quality (06) · audit quality (08, minus the fee items) · contingent liabilities (10) · accounting forensics (11)
  - **Run with the entity-side intact but the person side thin:** people dossiers and network discovery (07) — the seed roster of 21 persons and 155 entities in §5E is unusually complete, every D-1…D-5 anchor is present, and the entity-discovery recipes have full starting material; what is missing is any filing-side biography for the current CFO and any independence/committee data for the 9 directors
  - **Run capped and largely as "Not Available with reason":** incentives and compensation (03) · ownership and insider behavior (04) · board and shareholder rights (05)
  - **Runs on its own external sweep, not on this pool:** regulatory/legal and compliance (12) — the pool contributes only the two contingencies notes and one legal-proceedings item

- **Hard disqualifier already flagged by `business-model/01_disqualifier-scan`?** **No.** That scan's §3 Verdict-Lock Signal records: *"No verdict-lock. The synthesizer is free to score this business on its merits; nothing in this scan overrides other scores."* No Governance-risk floor is inherited, and no verdict cap flows from disqualifier deference. `12_red-flags-sweep` separately carries two disclosed-item flags at 52 and 55 (inverted scale) that this module should read and re-test, not re-adjudicate.

- **Active partial-data caps:**
  - No proxy / compensation disclosure → **Incentive alignment max 50; Overall usefulness max 70** (agents 03, 99)
  - No ownership / insider-transaction data → **Shareholder friendliness max 60** (agents 04, 99)
  - No board disclosure beyond the signature-page roster → **board independence and shareholder-rights read not assessable**; A1 and A2 items answered Not Available with reason (agents 05, 99)
  - No auditor-fee / audit-detail disclosure → **A4-06 and A4-07 Not Available with reason; Audit & assurance quality max 65; Confidence Score max 80** (agents 08, 99)
  - No related-party note → **RPT quantification not assessable; RPT & leakage risk floor 40; Confidence Score max 80** (agents 09, 99). The absence is itself an **Amber** disclosure finding — carried with its qualifier: a US filer routinely locates RPT disclosure in the proxy, so this is a pool-collection gap, not demonstrated company opacity
  - **Watch the checklist-coverage cap.** A large share of A1, A2, A3, A6, A10, A12 and A15 will land as Not Available. If the assembled registry coverage falls below 50%, `99` must additionally apply **Data quality max 60 and Confidence Score max 60** — a checklist mostly made of "Not Available" is not a governance read. `99` counts coverage and applies this; triage flags it as the live risk it is.
  - Agents 07 and 12 declare their own external-sweep coverage and apply the coverage-limited caps themselves. Triage applies none on their behalf and does **not** presume the sweep is unavailable.

- **Critical missing items:**
  - **The Proxy Statement (DEF 14A) for the 2025 AGM (held 2025-05-16), and the 2026 proxy** — carries Items 10, 11, 12, 13 and 14 in full: director nominees and independence, corporate governance matters, committee reports, Compensation Discussion & Analysis, executive compensation tables, security ownership, related-person-transaction policies, insider-trading policy, and audit vs non-audit fees
  - **The FY2025 Form 10-K** — no audited FY2025 financials, no FY2025 auditor's report or CAM, no post-Thermal-divestiture Exhibit 21, and no confirmation of whether FY2024's judgment-driven tax items recurred
  - **Ownership and insider filings** — Schedule 13D/13G (who owns the company) and Form 4 (whether insiders are buying or selling). Zero of both
  - **Any 8-K series** — including whatever disclosed the CFO transition from Sara E. Zawoyski to Gary L. Corona, and 8-K Item 5.07 AGM voting results
  - **Any shareholder letter** — the promise-vs-delivery test must run on guidance and transcripts instead
  - Minor: no rating-agency reports, no proxy-advisor reports, and no dated as-of on the three CIQ RTF exports

- **Single highest-value missing document:** **the DEF 14A proxy statement.** One document restores compensation design and metrics (agent 03, currently capped at 50), beneficial ownership and control (agent 04, capped at 60), board independence, committees, tenure, attendance and voting outcomes (agent 05, currently not assessable), related-party transactions (agent 09, currently a floor-40 unknown), and audit vs non-audit fees (agent 08, A4-06/07). No other single document in any regime would lift five caps at once.
