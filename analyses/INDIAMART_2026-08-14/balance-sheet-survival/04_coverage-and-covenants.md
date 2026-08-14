# Coverage & Covenants — INDIAMART

**Reporting currency: INR (₹ millions), consolidated, Ind AS (Companies Act 2013 Sec. 133). Fiscal year ends 31 March** ("FY26" = year ended 31-Mar-2026). Jurisdiction: India, NSE (INDIAMART) / BSE (542726), SEBI-LODR regime. EBITDA basis: **reported only** — IndiaMART discloses no adjusted/non-GAAP EBITDA (full-text search of the FY26 Annual Report for "adjusted EBITDA"/"non-GAAP" returns no matches) [`earnings/01_historical-financials.md` §4]. Gross debt (per `01_capital-structure-and-leverage.md`): ₹231.02mn (FY26-end) / ₹216.28mn (30-Jun-2026), entirely lease liabilities under Ind AS 116 — **no bank borrowings, bonds, term loans, or revolver exist**.

**Data-quality note (flag, not a silent override):** `00_solvency-data-triage.md` cited FY26 Annual Report Note 22 "Finance costs" as ₹27.09mn (FY26) / ₹37.50mn (FY25). Tracing Note 22 directly in the filing text shows this is the **standalone-entity** (parent-only) figure and, within the consolidated statement, is specifically the "Interest cost of lease liabilities" sub-line only. The **consolidated** Note 22 total — the correct basis for this module, which runs on consolidated figures throughout — is **₹29.81mn (FY26) / ₹74.06mn (FY25)**, comprising lease interest (₹27.09mn / ₹37.50mn) plus interest on deferred acquisition consideration (₹2.72mn / ₹36.56mn) [FY26 Annual Report (Ind AS), Note 22 — Finance costs, Consolidated Statement of Profit and Loss, line 875 and note breakdown]. This consolidated total also ties to within 0.03% of the Capital IQ Income Statement's own "Interest Expense" line (−₹29.8mn FY26, −₹74.1mn FY25) [`Financials (1).xls`, Income Statement tab]. All ratios below use the **consolidated** ₹29.81mn / ₹74.06mn figures; this is a bad-extraction correction to the triage's citation, not a new data gap.

Interest is **gross** (no net-interest presentation used) — consolidated Finance costs per Note 22, cross-checked against the reconciliation-of-lease-liabilities note and the Capital IQ Income Statement export.

Per `earnings/06_earnings-quality.md`, reported EBITDA is **more than fully cash-backed**: "CFO has exceeded EBITDA in every one of the last 5 years (121%–182%)" — so the EBITDA used for coverage below is not an inflated accrual figure; if anything cash generation runs ahead of it. No cash-quality caveat applies to the coverage ratios.

---

## 1. Coverage Ratios

All figures computed via an executed Python snippet (Bash); see the underlying arithmetic and cross-checks below the table.

| Ratio | FY26 (year ended 31-Mar-2026) | LTM (4 qtrs ended 30-Jun-2026) | Source |
|---|---:|---:|---|
| EBITDA / interest | 174.64x (5,205.94 / 29.81) | 212.36x (5,314.65 / 25.02) | Calc.; EBITDA per `01` §5; interest per Note 22 (consolidated) and Capital IQ LTM interest roll-forward (below) |
| EBIT / interest | 168.26x (5,015.93 / 29.81) | 205.86x (5,150.87 / 25.02) | Calc.; EBIT per `earnings/01_historical-financials.md` §1/§2 |
| (EBITDA − capex) / interest | 172.29x ((5,205.94−70.00) / 29.81) | 210.75x ((5,314.65−41.30) / 25.02) | Calc.; capex (abs.) per `earnings/01` §1/§2 |
| Fixed-charge coverage | 21.01x ((5,205.94−70.00) / 244.50) | Not computed — annual-only inputs (short-term/low-value lease expense disclosed annually, not quarterly) | Calc. — see formula below |

**LTM interest cross-check (roll-forward, not the raw CIQ figure taken at face value):** FY26 consolidated Finance costs (₹29.81mn) − Q1 FY26 quarter (₹10.36mn) + Q1 FY27 quarter (₹5.59mn) = **₹25.04mn**, which matches the Capital IQ Income Statement's own LTM "Interest Expense" column (−₹25mn) to within rounding [FY26 Annual Report, Note 22; `IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf`, Note 22 (₹5.59mn incl. deferred-consideration interest now ₹0 — fully extinguished by Q1 FY27); `IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-18-2025).pdf`, Note 22 (₹10.36mn)]. ₹25.02mn is used above (25.04 rounds within the same order; the 2-cent gap is a rounding artefact of the two source figures each carrying 2 decimal places).

**Fixed-charge coverage formula and inputs (FY26 annual):** `(EBITDA − capex) / (gross interest + scheduled debt amortization + lease payments)`.
- Gross interest (consolidated Note 22 total) = ₹29.81mn.
- Scheduled debt amortization = the principal portion of the FY26 cash lease-liability repayment. Total cash "Repayment of lease liabilities (including interest)" = ₹131.85mn [FY26 Annual Report, Note 15(a) reconciliation and Statement of Cash Flows]; of this, ₹27.09mn is the lease-interest component (already counted once, inside gross interest above), leaving **₹104.76mn** of principal amortization.
- Lease payments (additional, not already captured above) = short-term and low-value lease expense **not capitalized** under Ind AS 116 (expensed directly to "Other expenses," inside EBITDA) = ₹109.93mn FY26 [FY26 Annual Report, Note 35 fn.3].
- Total fixed charges = 29.81 + 104.76 + 109.93 = **₹244.50mn**.
- (EBITDA − capex) = 5,205.94 − 70.00 = ₹5,135.94mn.
- Fixed-charge coverage = 5,135.94 / 244.50 = **21.01x**.

**Cross-check against the Capital IQ Credit Health Panel's own printed ratio:** CIQ's "EBITDA/Interest Exp. (x)" line reads 177.78x (Mar-2026) / 215.87x (LTM Jun-2026) — both within ~2% of the figures computed above (174.64x / 212.36x), the residual gap consistent with the ~2.2% EBITDA cross-tab inconsistency already flagged in `earnings/01_historical-financials.md` fn.7, not a new error [`IndiaMART-InterMESH-Limited-NSEI-INDIAMART-Credit-Health-Panel__Financials.txt`, "Solvency" block].

**Read on coverage:** at 174.64x EBITDA/interest (FY26) and 212.36x on the latest LTM, IndiaMART's operating earnings cover its entire interest bill roughly 175–210 times over. This is not a company where coverage is a live risk factor — the number is this large specifically because gross debt is ₹231mn against ₹5.2bn of EBITDA, not because of any unusual accounting treatment.

---

## 2. Covenant Inventory

**No maintenance financial covenants exist because no covenant-bearing debt exists.** A full-text search of the FY26 Annual Report for "covenant" returns zero hits [FY26 Annual Report (Ind AS), full-text search, 2026-08-13]. The company's only interest-bearing obligation is ₹231.02mn / ₹216.28mn of Ind AS 116 lease liabilities (Note 15(a)) — leases carry no financial-maintenance-covenant package of the kind attached to a bank facility or bond indenture. There is no revolver, no term loan, no bond, and no rated debt: "List of all credit ratings obtained by the Company: Not Applicable" [FY26 Annual Report, BRSR section]. `01_capital-structure-and-leverage.md` §1 and §6A independently confirm zero bank borrowings and zero HoldCo-level debt.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage | None — no covenant exists | Gross debt/EBITDA 0.044x (FY26); net cash on both strict and broad basis | Not applicable | Full-text search, FY26 Annual Report; `01` §1/§5 |
| Min interest coverage | None — no covenant exists | 174.64x EBITDA/interest (FY26) | Not applicable | As above; §1 above |
| Min liquidity / net worth | None — no covenant exists | ₹31.2–33.9bn cash + ST investments (`01` §3) | Not applicable | `01` §3 |
| Springing covenant trigger (e.g. revolver utilization) | None — no revolver exists | N/A | Not applicable | `00_solvency-data-triage.md` §3 — "Committed/undrawn facility: N/A (none exists)" |
| Equity cure rights | None disclosed — moot, no covenant-bearing facility | N/A | Not applicable | Same evidence base |
| Other (cross-default / change-of-control / rating triggers) | Not disclosed in the data pool — consistent with the absence of any external loan/bond agreement | N/A | Not applicable | `00` §3, row "Change-of-control / cross-default / rating triggers" |

**On the PARTIAL-DATA RULE's typical-market-covenant proxy:** this agent's own operating instructions call for a labeled hypothetical covenant (e.g. max net leverage 4.0–4.5x, min interest coverage 2.0–3.0x) when no covenant disclosure exists, with indicative headroom computed against it. That fallback is built for the ordinary case of a levered borrower whose credit-agreement terms simply were not in the data pool. It does not fit here: IndiaMART is not an under-disclosed levered borrower — it is a **structurally debt-free** company (gross debt 0.044x EBITDA, ₹231mn of pure lease liabilities, no bank facility of any kind ever drawn — "Total Debt Issued = nil" in every period FY22 through LTM Jun-2026 per the cash-flow statement). Computing "headroom" against a fictional 4.0–4.5x leverage ceiling or a fictional 2.0–3.0x coverage floor for a company running at 0.04x leverage and 175x coverage would manufacture a number with no credit relationship behind it, and risks being read as if a real lender relationship existed — the opposite of calibration. Per CLAUDE.md §23 (prefer the rule that is more conservative and less likely to create false confidence) and `00_solvency-data-triage.md`'s explicit instruction on this point, the indicative-proxy step is **omitted as inapplicable** rather than computed and then discarded. **Covenant headroom is marked "Not assessable" for scoring** — but the underlying reason is a debt-free balance sheet (a positive per CLAUDE.md §24 Filter 3: net cash is a strategic asset), not an unfilled disclosure gap, and the synthesis layer should not apply the same discount it would to a genuinely undisclosed covenant package.

### Covenant EBITDA Definition & Quality (required if headroom is computed)

**Not applicable — headroom is not computed (Section 2 above).** There is no covenant-bearing debt and therefore no lender-defined "covenant EBITDA" concept to describe. IndiaMART's own reported EBITDA (₹5,205.94mn FY26) is a straightforward Ind AS consolidated-statement figure with no addbacks, no adjusted-EBITDA disclosure, and no lender-negotiated definition of any kind [`earnings/01_historical-financials.md` §4]. There is no "addback illusion" risk to flag because there is no addback-permissive covenant package to inflate.

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | N/A — no covenant-bearing debt | — |
| Addbacks permitted (types) | N/A | — |
| Addback caps / limits | N/A | — |
| Is covenant EBITDA materially above reported EBITDA? | N/A (no covenant EBITDA exists; reported EBITDA has no addbacks) | `earnings/01_historical-financials.md` §4 |

---

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | None exists — no maintenance covenant attaches to any of IndiaMART's obligations |
| Headroom on tightest covenant (%) | Not assessable — structural absence of covenant-bearing debt, not a disclosure gap |
| EBITDA decline that would breach it (approx.) | Not applicable — there is no covenant to breach |
| Debt increase that would breach it (approx.) | Not applicable — same reason |

**Illustrative context only (not a real threshold, not scored):** at FY26 EBITDA/interest of 174.64x, EBITDA would need to fall by roughly 99.4% — to about ₹30mn, essentially to zero — before operating earnings alone stopped covering the ₹29.81mn interest bill; well past any plausible operating scenario for this business. On the debt side, gross debt (₹231.02mn) would need to grow roughly 22x, to over ₹5.2bn, before gross debt/EBITDA even reached a moderate 1.0x — a scale of borrowing IndiaMART has never approached in the 5-year window in this pool (FY22 peak gross debt: ₹562.8mn, still entirely leases) [`01_capital-structure-and-leverage.md` §1]. Neither figure represents an actual covenant; they are shown only to size how far the current position sits from where a typical covenant package would normally bind, and should not be read as, or scored as, a real headroom number.

---

## 4. Coverage / Covenant Read

Earnings cover interest with room to spare that isn't really "coverage" in the ordinary distress-analysis sense — EBITDA/interest runs 174.6x for FY26 and 212.4x on the latest LTM, against a ₹29.81mn (FY26) / ₹25.04mn (LTM) interest bill that exists purely because Ind AS 116 capitalises office and equipment leases as debt, not because IndiaMART has ever drawn a bank loan, bond, or revolver. There is no tightest covenant to report and no headroom percentage to compute, because there is no covenant-bearing debt in the corporate structure at all (zero "covenant" hits in the full FY26 Annual Report text, no credit rating, "Total Debt Issued" nil in every period FY22–LTM Jun-2026) — this is a structural fact about a debt-free balance sheet, not a data gap this agent could not fill. Nothing plausible on the coverage or covenant side would trip anything here: it would take IndiaMART borrowing roughly 22x its current gross debt (to over ₹5.2bn) before even a conservative 1.0x leverage ceiling would bind, and an operating collapse of essentially the entire EBITDA base before interest coverage itself became a constraint — neither of which is what determines this company's fate, so any distress scenario for IndiaMART has to come from somewhere other than interest coverage or covenant breach.
