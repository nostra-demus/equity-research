# Earnings Quality — NU

**Reporting basis.** Nu Holdings Ltd. (NYSE:NU, Class A ordinary shares, USD) reports under **IFRS Accounting Standards** in **US dollars**, fiscal year ending **31 December**. It is a US foreign private issuer: the audited annual filing is a **Form 20-F** and the quarterly disclosure is an **unaudited interim condensed consolidated financial statement**. There is no 10-K or 10-Q and their absence is not a data gap (CLAUDE.md §27). All figures are **US$ millions, reported (IFRS)** unless a cell says otherwise. Vendor figures are labelled "Capital IQ (CIQ), data as of Aug-2026". "TTM" = the twelve months to Jun-30-2026 (Q3'25+Q4'25+Q1'26+Q2'26), built from the filings and the vendor's quarterly actuals as `01_historical-financials` did.

**Two definitional facts that govern this whole report.**

1. **NU is a deposit-funded lender, so the standard template does not apply and is not forced.** There is **no EBITDA line** in a bank income statement (`ciq_facts.json` `ltm_ebitda_m` = unknown, "Income Statement sheet has no 'EBITDA' row"), and the IFRS statement of financial position is unclassified, so there is **no working capital** in the industrial sense — no inventory, no trade payables, no sales-driven trade receivables. DSO / DIO / DPO and CFO/EBITDA are therefore marked N/A **with the reason**, and lender-equivalent measures are substituted and labelled in Sections 2 and 3. Nothing here is manufactured to fill a template row.
2. **There are two operating-cash-flow numbers and both are correct on their own basis.** The **company-reported** figure (deposits classified inside operating, as IAS 7 permits for a bank) is **TTM −US$1,381.6m**. The **Capital IQ** figure (the deposit inflow reclassified out of operating and into financing) is **TTM −US$10,304.8m** (`ciq_facts.json` `ltm_ocf_m`, status present). They reconcile exactly: −10,304.8 + 8,923.2 (deposit inflow) = −1,381.6. Every appearance of either number below carries its basis label. Per CLAUDE.md §4/§5 the **filing's figure is the one this module reads**; the vendor's is shown alongside, never headlined as the company's CFO. Equally, the company's own negative CFO is **not** dismissed as a definitional artefact — on the company's own basis operating cash flow swung from **+US$3,640.0m (H1'25) to −US$1,242.0m (H1'26)** [Q2'26 interim, Statements of Cash Flows], and that swing is real.

**Prior in-house memo.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is verdict-bearing. Its verdict is stripped (CLAUDE.md §24) and **no number in this report comes from it**.

---

## 1. EBITDA → CFO → FCF Bridge (FY2021–FY2025 + TTM)

**US$ millions, IFRS, reported.** Built line-by-line from the filings' own statements of cash flows. Every column reconciles to the filed CFO total — the arithmetic is shown beneath the table.

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | TTM Jun-26 | Trend |
|---|---:|---:|---:|---:|---:|---:|---|
| **EBITDA** | N/A | N/A | N/A | N/A | N/A | N/A | N/A — no EBITDA line exists in a bank income statement [1][2][8] |
| Net income for the period (incl. minorities) | (165.3) | (364.6) | 1,030.5 | 1,972.1 | 2,871.7 | 3,610.0 | Improving |
| + Expected credit loss (non-cash, gross of recoveries) | 503.7 | 1,440.9 | 2,487.6 | 3,469.0 | 4,701.1 | 6,176.7 | Rising |
| − Deferred income tax (non-cash) | (224.7) | (417.6) | (675.7) | (713.4) | (427.3) | (1,378.0) | **Deteriorating** |
| + Share-based compensation (non-cash) | 157.3 | 253.2 | 212.6 | 272.4 | 271.8 | 353.8 | Rising |
| + Depreciation & amortisation | 17.3 | 35.6 | 62.9 | 77.1 | 98.0 | 130.3 | Rising |
| + Other non-cash items (incl. the FY2022 contingent-share-award termination of 355.6) | 5.1 | 413.7 | 159.6 | 242.8 | 357.9 | 422.6 | Stable |
| **= Operating cash before balance-sheet growth (the filing's own subtotal)** | **293.5** | **1,361.2** | **3,277.6** | **5,320.1** | **7,873.1** | **9,315.5** | **Improving** |
| **Working capital change** | N/A | N/A | N/A | N/A | N/A | N/A | N/A — unclassified balance sheet; the lender equivalent is the row below [4] |
| Change in the credit book, deposits and other operating assets/liabilities | (3,720.0) | (1,850.7) | (4,705.4) | (7,391.3) | (11,078.7) | (19,030.3) | **Deteriorating** |
| Interest received (cash) | 563.6 | 1,573.1 | 3,389.3 | 5,820.9 | 8,440.0 | 10,690.1 | Improving |
| **Interest paid** (cash) | (9.1) | (30.9) | (82.9) | (88.1) | (92.3) | (248.9) | Rising |
| **Tax paid** (cash) | (52.3) | (297.1) | (612.4) | (1,262.5) | (1,641.7) | (2,108.1) | **Rising fast** |
| **= CFO — company-reported (IFRS, deposits in operating)** | **(2,924.3)** | **755.6** | **1,266.2** | **2,399.0** | **3,500.5** | **(1,381.6)** | **Inflecting negative** |
| *Memo — CFO on the Capital IQ basis (deposit inflow moved to financing)* | *(6,930.8)* | *(5,522.5)* | *(6,398.6)* | *(3,511.6)* | *(9,360.8)* | *(10,304.8)* | *Negative throughout* |
| *Memo — the deposit inflow that is the sole reconciling item between the two bases* | *4,001.9* | *6,278.1* | *7,664.8* | *5,910.6* | *12,861.3* | *8,923.2* | *Volatile* |
| Maintenance capex | n/d | n/d | n/d | n/d | n/d | n/d | **Not disclosed** |
| Growth capex | n/d | n/d | n/d | n/d | n/d | n/d | **Not disclosed** |
| Total capex (PP&E + intangibles, absolute) | 28.5 (CIQ) | 114.3 (CIQ) | 177.0 | 175.0 | 340.8 | 288.4 | Rising |
| **FCF (CFO − total capex), company basis** | **(2,952.8)** | **641.3** | **1,089.2** | **2,224.0** | **3,159.7** | **(1,670.0)** | **Inflecting negative** |
| *FCF (CFO − total capex), Capital IQ basis* | *(6,959.3)* | *(5,636.8)* | *(6,575.6)* | *(3,686.6)* | *(9,701.6)* | *(10,593.2)* | *Negative throughout* |
| **CFO / EBITDA %** | N/A | N/A | N/A | N/A | N/A | N/A | N/A — EBITDA not disclosed |
| CFO / net income to parent % (substitute for CFO/EBITDA), company basis | n.m. (loss) | n.m. (loss) | 122.9% | 121.6% | 122.0% | **(38.3)%** | Stable, then negative |

**Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow.** Capex = acquisition of property, plant and equipment + acquisition and development of intangible assets, taken as a positive number for the subtraction. Worked, FY2025: 7.2 + 333.6 = 340.8; TTM: 340.8 − 152.9 (H1'25) + 100.5 (H1'26) = 288.4 [2][5]. FY2021 and FY2022 use the Capital IQ cash-flow export because those years' filed investing sections did not extract cleanly, and are labelled CIQ [11]. Capex is 1.5% of TTM revenue of 19,340.0, so the split is not decision-relevant here.

**Reconciliation proof (the bridge ties to the filed total).** FY2025: 7,873.1 − 11,078.7 − 92.3 − 1,641.7 + 8,440.0 = **3,500.5** ✓ [2]. TTM: 9,315.5 − 19,030.3 − 248.9 − 2,108.1 + 10,690.1 = **(1,381.6)** ✓ [2][5]. H1'26 alone: 5,145.7 − 10,389.5 − 185.9 − 1,788.6 + 5,976.3 = **(1,242.0)** ✓ [5]. Nothing in the bridge is an estimate.

### 1a. FCF definition, and the measure this report leads with (CLAUDE.md §15)

**Definition used, and why the conventional one is nearly meaningless here.** `FCF = CFO − total capex` is the doctrine default and is shown above on both bases. For a deposit-funded lender it does not describe the cash the business throws off, because CFO is dominated by two *decisions* rather than by operating surplus: how fast the loan book grows (an investment choice, −19,030.3 of balance-sheet growth in the TTM) and how fast the deposit book grows to fund it (a funding choice, +8,923.2). A lender that stopped growing tomorrow would print a large positive CFO and be a worse business. So the conventional figure is reported, labelled, and **not headlined**.

**Lead measure 1 — cash-backed net income = reported net income to parent LESS the non-cash deferred income-tax credit.** This asks the one question that does have a cash answer: is the reported profit backed by tax the company actually pays?

| US$m | FY2023 | FY2024 | FY2025 | TTM Jun-26 |
|---|---:|---:|---:|---:|
| Net income to parent (reported) | 1,030.6 | 1,972.1 | 2,868.9 | **3,607.1** |
| less deferred income-tax credit (non-cash) [3][6] | (675.7) | (713.4) | (427.3) | **(1,458.6)** |
| **= Cash-backed net income (lead figure)** | **354.9** | **1,258.7** | **2,441.6** | **2,148.5** |
| Cash-backed share of reported profit | 34.4% | 63.8% | 85.1% | **59.6%** |

TTM cash-backed net income of **US$2,148.5m** compares with reported **US$3,607.1m**. Put the other way: **40.4% of the last twelve months' reported profit is a deferred tax credit that consumed no cash and will only be realised if the provisioned credit losses actually crystallise as tax-deductible write-offs against future taxable profit.** On a twelve-month-over-twelve-month basis (rolling year to Jun-30-26 versus the year to Dec-31-25 — overlapping windows, labelled as such), the deferred tax credit rose **+1,031.3** while reported net income rose **+738.2**: the increase in the non-cash tax credit was **larger than the entire increase in reported profit**.

**Lead measure 2 — self-funding of the credit book.** For a lender the second cash question is whether the funding base keeps pace with the assets it funds. `Self-funding = (deposit inflow + payables-to-network inflow) ÷ (credit-card-receivable growth + loan growth)`, all from the operating section of the cash-flow statement [2][5]:

| | FY2022 | FY2023 | FY2024 | FY2025 | TTM Jun-26 | H1'26 alone |
|---|---:|---:|---:|---:|---:|---:|
| Deposits + payables to network (inflow) | 8,499.1 | 10,483.4 | 5,382.1 | 16,993.7 | 13,277.3 | 5,302.6 |
| Credit cards + loans (outflow) | 7,102.9 | 11,455.8 | 12,897.1 | 22,752.8 | 26,858.3 | 14,740.0 |
| **Self-funding ratio** | **119.7%** | **91.5%** | **41.7%** | **74.7%** | **49.4%** | **36.0%** |

This, not any accounting judgment, is the arithmetic reason company-basis CFO went negative: in H1'26 the credit book grew by US$14,740.0m while deposits and network payables supplied only US$5,302.6m of it, versus 84.8% coverage in H1'25. The gap was met from the cash balance (cash and equivalents fell 15,003.6 → 13,551.6) and from borrowing.

**Conventional figures, shown alongside and labelled:** TTM FCF (CFO − capex) is **−US$1,670.0m on the company's IFRS basis** and **−US$10,593.2m on the Capital IQ basis**. Neither is a measure of distributable cash for this business model.

---

## 2. Cash Conversion Assessment

CFO cannot be tracked against EBITDA because NU discloses no EBITDA; the substitute is CFO ÷ net income to parent, stated as such. On the **company's own IFRS basis** that ratio was **122.9% (FY2023), 121.6% (FY2024) and 122.0% (FY2025)** — three consecutive years of operating cash comfortably exceeding reported profit — and then **−38.3% for the TTM to Jun-30-2026**, because the credit book outgrew its funding in H1'26 (Section 1a). On the **Capital IQ basis** (deposits in financing) the ratio is negative in every year shown, which is an arithmetic consequence of that reclassification and not an independent finding.

The trajectory therefore has one year of breakdown, not a pattern. What has *not* broken is the collection of accrued income: cash interest received as a share of effective-interest income accrued on the amortised-cost book rose from **62.5% (FY2023) → 68.9% (FY2024) → 70.2% (FY2025) → 70.9% (TTM)**, and 72.0% in H1'26 alone [2][5][7][12]. Cash tax paid also rose to US$2,108.1m TTM. So the negative CFO is being produced by balance-sheet growth, not by revenue that fails to convert.

**RF-EQ-002 test, performed explicitly and not by default.** The trigger is CFO/EBITDA below 50% in 2 or more of the last 3 years. EBITDA does not exist for this issuer, so the test is run on the disclosed substitute, CFO ÷ net income to parent, on the authoritative (filing) basis: FY2023 122.9%, FY2024 121.6%, FY2025 122.0% — **none of the last three fiscal years is below 50%**, so **the trigger does not fire and `RF-EQ-002` is not emitted**. Named the other way (CLAUDE.md §3): on the Capital IQ basis the trigger *would* fire in all three years, and the TTM figure of −38.3% does breach 50% on the company's own basis. That single TTM breach does not meet the "2 or more of the last 3 years" bar. **Forward test for the next run: if FY2026 also closes below 50% on the company's own basis, the trigger fires and `RF-EQ-002` must be emitted.**

---

## 3. Working Capital Trends

**The template metrics do not exist for this issuer, and are not estimated.** NU has no inventory, so `DIO` and `DPO` (both of which take COGS in the denominator — `DIO = 365 × average inventory ÷ COGS`, `DPO = 365 × average payables ÷ COGS`, never revenue) have no numerator. `DSO = 365 × average receivables ÷ revenue` would be arithmetically computable but economically meaningless: NU's receivables are its **earning assets** (credit-card balances and loans it deliberately originates), not unpaid sales invoices, so a rising "DSO" would signal a bigger loan book, not slow collection. The cash conversion cycle is therefore undefined.

| Metric | FY2024 | FY2025 | Jun-30-2026 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | N/A | N/A | N/A | — | N/A — receivables are the earning asset, not trade credit [4] |
| Inventory days (DIO) | N/A | N/A | N/A | — | N/A — no inventory |
| Payable days (DPO) | N/A | N/A | N/A | — | N/A — no trade payables of this kind |
| Cash conversion cycle | N/A | N/A | N/A | — | N/A — undefined for a bank |

**Lender-equivalent substitute table** (period-end balances throughout; stated so it can be re-derived) [1][2][4][5][7][12][13][14]:

| Metric | Dec-31-2024 | Dec-31-2025 | Jun-30-2026 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Gross credit-card receivables (US$m) | 14,619.3 | 21,751.2 | 25,961.1 | +48.8% then +19.4% in 6m | Growth-driven |
| Gross loans to customers (US$m) | 6,116.5 | 10,915.5 | 13,437.3 | +78.5% then +23.1% in 6m | Growth-driven |
| Gross credit assets ÷ deposits | 71.9% | 77.9% | **86.9%** | **Rising ~1,500bps in 18 months** | **Medium-High** — the funding base is not keeping pace; this is what turned CFO negative |
| Expected-credit-loss allowance ÷ gross credit assets | 15.36% | 15.37% | **16.86%** | Rising +149bps in 6m | **Low (favourable)** — reserve build, not release |
| Gross credit-card receivables overdue (any age) | n/d | 11.0% | **12.5%** | +150bps in 6m | Medium |
| — of which over 90 days | n/d | 6.1% | 6.3% | +20bps | Medium |
| Cash interest received ÷ effective-interest income accrued | 68.9% | 70.2% | 72.0% (H1'26) | **Improving** | Low (favourable) |
| Cash income tax paid ÷ income-tax charge in the P&L | 153.4% | 164.7% | **272.1% (TTM)** | **Deteriorating** | **High** — see Sections 4–6 |
| Deferred tax asset ÷ equity attributable to parent | n/d | 22.2% | **27.5%** | Rising | **High** |

**Against the template's own flag tests, adapted:** a >10% rise in "DSO" is not applicable, but the **gross credit assets ÷ deposits ratio rose 900bps in six months** (77.9% → 86.9%), which is the lender analogue and is flagged. Inventory build is not applicable. There is no evidence of stretching suppliers: total payables-to-network rose 13,633.9 → 15,541.7 (+14.0%) against gross credit assets +20.6%, i.e. slower than the book.

---

## 4. Non-GAAP Adjustments

NU publishes **one** non-IFRS profit measure, **Adjusted Net Income**, reconciled in the 20-F, plus a family of **FX-Neutral** growth measures. It publishes no adjusted EBITDA, no adjusted EBIT and no adjusted EPS. The Q2'26 deck defines Adjusted Net Income in its glossary but headlines IFRS net income [10].

| Adjustment | Amount (FY2025) | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Share-based compensation added back | +359.0 | **Y** — every year: FY2023 212.6, FY2024 272.4, FY2025 271.8 in the cash-flow statement, H1'26 216.8 | **High** | FY2025 20-F, Non-IFRS Financial Measures and Reconciliations [9]; cash-flow SBC lines [2][5] |
| Allocated tax effects on share-based compensation | (125.8) | Y | Low | [9] |
| Hedge of the tax effects on share-based compensation | (29.5) | Y | Low | [9] |
| **Net adjustment to net income to parent** | **+203.7** | **Y** | **Mid** | 2,868.9 + 359.0 − 125.8 − 29.5 = 3,072.6 ✓ [9] |
| FX-Neutral revenue / gross profit / net income growth | Presentational only | Y | Low | FY2025 20-F, FX Neutral Measures; Q2'26 deck [9][10] |
| *Not the company's measure* — Capital IQ "Normalized Diluted EPS" of 0.4922 for FY2025, **below** reported 0.5846 | — | — | Mid (mis-citation risk) | Capital IQ Financials→Income Statement, data as of Aug-2026 [12] |

**Against the template's three flag tests:**
- **Recurs every period → not a one-off:** **triggered.** Share-based compensation is the whole adjustment and it appears in every period on record. It is a real, recurring cost paid in shares.
- **Exceeds 15% of GAAP earnings:** **not triggered.** +203.7 on reported 2,868.9 is **+7.1%**.
- **Stock-based compensation excluded from "adjusted" numbers:** **triggered**, explicitly — the 20-F defines Adjusted Net Income as net income "adjusted for expenses related to share-based compensation, allocated tax effects on share-based compensation and hedge of the tax effects on share-based compensation" [9].

Two notes. First, the add-back in the reconciliation (359.0) is larger than the cash-flow SBC line (271.8) because it also carries corporate and social-security taxes on vested awards [9][14]. Second, the mitigating fact: the reported IFRS figure is the conservative one, it is what the company headlines in its own results presentation, and this module uses it everywhere.

---

## 5. One-Off Items (last 3 years)

| Item | Period | Amount (US$m) | Classification | Evidence |
|---|---|---:|---|---|
| Deferred-tax remeasurement from the Brazilian CSLL rate change (Complementary Law No. 224/2025) | FY2025; H1'26 | +58.5 benefit; +28.4 benefit (Q1'26 +36.6, Q2'26 −8.2) | **Recurring "one-off"** — a genuine law-change gain, but it has now appeared in two consecutive reporting periods as the phased rates are remeasured | FY2025 20-F Note 30(a)(ii); Q2'26 interim Note 30(a)(ii) [3][6] |
| Step-up in "Effect of different tax rates — subsidiaries and parent company" | H1'26 vs H1'25 | +280.8 vs +56.9 (Q2 alone: +113.8 vs +32.4) | **Recurring "one-off" — management-asserted, not audited-as-permanent.** The CFO called the low rate "not a one-off, and not an accounting adjustment… a recurring structural feature of how we operate" | Q2'26 interim Note 30(a) [6]; `Q1 2026 earnings-call transcript, May-14-2026, prepared remarks — Guilherme Marques do Lago, CFO` [15] |
| "Other amounts" tax reconciling item (foreign tax credits, non-taxable sovereign-bond interest, tax incentives, non-taxable interest on tax recoverable) | H1'26 vs H1'25 | +253.6 vs +99.0 | **Recurring, mixed durability** — the sovereign-bond piece scales with the securities book; the credits and incentives do not automatically | Q2'26 interim Note 30(a)(iii) [6] |
| Advance to the Brazilian Credit Guarantee Fund (FGC) under the emergency recapitalisation plan approved Feb-2026 | H1'26 | 185.5 cash out, carried as an asset (US$0 at Dec-31-2025) | **Genuine one-off cash item**, with a stated multi-year contribution commitment ahead | Q2'26 interim Note 17 (Other assets) (iv) [13] |
| First share repurchase in the company's history | H1'26 | 500.4 (financing outflow) | **Genuine one-off** in this data set | Q2'26 interim, Statements of Cash Flows; Note 31 [5] |
| Contingent share award (CSA) termination charge | FY2022 | 355.6 | **Genuine one-off** — not repeated in FY2023, FY2024, FY2025 or H1'26 | FY2022 20-F, Statements of Cash Flows [3] |
| Goodwill or intangible impairment | FY2023–H1'26 | **None** | — | FY2025 annual impairment test found no impairment; no interim indicators at Jun-30-2026 or Jun-30-2025 [12] |
| Restructuring charge | FY2023–H1'26 | **None** — no such line in any income statement or cash-flow statement in the pool | — | [1][2][5] |

**Reconciliation to Section 1a (§15).** The one-off cash item in the period, the FGC advance of 185.5, sits inside "Other assets (544.9)" in the H1'26 operating section [5][13]. Removing it would improve H1'26 CFO from −1,242.0 to −1,056.5 — a 15% improvement to a still-negative number, so it does not change the lead reading and the lead figure is not restated for it. It is itemised here so a reader can undo it.

---

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | **N** (one period, not two) | Company-basis CFO grew *faster* than revenue in both FY2024 (CFO +89.5% vs revenue +43.4%) and FY2025 (+45.9% vs +37.0%). The divergence is confined to the latest twelve months: revenue +50.5% TTM while CFO went from +3,500.5 to −1,381.6. On the Capital IQ basis it would read Y, and that difference is definitional (deposits), so it is named rather than adopted [2][5][11] |
| Receivables growing faster than revenue | **Y** | Gross credit assets (cards + loans) grew +57.5% in FY2025 (20,735.8 → 32,666.7) against revenue +37.0%, and a further +20.6% in H1'26 against +17.7% sequential revenue growth. **Substantively this is loan-book origination, not a revenue-recognition problem** — the receivables are the earning asset — but it is the direct cause of the cash drain and it is recorded as triggered [1][7][12][13][14] |
| Inventory growing faster than COGS | **N** | Not applicable — no inventory on the balance sheet [4] |
| Deferred revenue declining (subscription/contract business) | **N** | Deferred income rose 77.5 → 84.2 over H1'26; immaterial at 0.12% of total liabilities [4] |
| Capitalized costs growing as % of revenue | **N** on the multi-year trend | Internally developed intangible additions as a share of revenue: FY2023 2.06% (165.1), FY2024 1.34% (154.6), FY2025 1.81% (285.7), H1'26 1.72% (180.0) — volatile and *below* FY2025 in the latest period, so no rising trend. **One unexplained item is recorded rather than forced into this row:** Note 19 shows total intangible additions of 211.5 in H1'26 while the cash-flow statement shows only 84.2 of cash paid for intangibles, a gap of 127.3 that the interim notes do not reconcile (the FY2025 equivalents match closely at 331.1 vs 333.6). *Not proven from available data* what the H1'26 gap is [2][5][12][14] |
| Frequent accounting policy changes | **N** | The only standards adopted in 2026 (amendments to IFRS 7/IFRS 9 and Annual Improvements) "had no significant impact"; IFRS 18 applies from Jan-1-2027 and management expects no significant impact beyond disclosure. No restatement of a prior period appears in the filings [5] |
| **Added row (lender-specific, not in the generic template): non-cash deferred tax credit rising as a share of reported profit, and the deferred tax asset outgrowing pre-tax profit** | **Y** | The deferred income-tax credit was 14.9% of net income to parent in FY2025 (427.3 / 2,868.9) and **40.4% in the TTM** (1,458.6 / 3,607.1). The deferred tax asset rose from 2,510.9 (Dec-31-25) to **3,649.1 (Jun-30-26), +45.3% in six months**, against pre-tax profit growth of +30.8% (H1'26 2,190.6 vs H1'25 1,674.4), and now equals **27.5% of equity attributable to the parent**. This row is added because the generic six rows were written for an industrial and have no line capable of capturing the largest accrual in this company's accounts [3][4][5][6] |

Two rows above are triggered Y.

`RF-EQ-001 (rising accruals divergent from cash earnings)`

The tag is emitted on substance, not mechanically: reported profit contains a US$1,458.6m non-cash tax credit, cash tax paid is 2.7 times the accounting tax charge, and the asset that credit creates has grown to more than a quarter of shareholders' equity.

**Two hygiene notes on the source data (§15), neither of which is overridden.** (a) The H1'25 comparative for "Deferred income taxes" carries **opposite signs** in the two places it is disclosed: the cash-flow statement shows (40,329) while Note 30 shows a deferred tax *expense* of 40,329 (current 439,911 + deferred 40,329 = 480,240 total charge). At US$40.3m against a US$3,640.0m CFO it is immaterial; I use the **cash-flow figure inside the cash-flow bridge** and the **Note 30 figure for the tax analysis**, and label each. (b) The cash-flow expected-credit-loss add-back is **gross of recoveries** while the P&L charge is net: H1'26 3,200.2 (P&L) + 465.2 (recoveries) = 3,665.4 (cash flow) ✓ [5][7]. The recoveries reappear inside the receivable-movement lines, so there is no double count.

---

## 7. Reported vs Adjusted Reconciliation

**FY2025, US$ millions except EPS, IFRS.** The company discloses an adjusted figure for **one** metric only.

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | **Not disclosed** | **Not disclosed** | — | — | — | No EBITDA line in a bank income statement; `ciq_facts.json` `ltm_ebitda_m` = unknown [8] |
| EBIT (proxied by income before income taxes) | 3,868.4 | **Not disclosed** | — | — | — | The company publishes no adjusted EBIT or adjusted pre-tax profit [1] |
| Net income to parent | 2,868.9 | 3,072.6 | +203.7 | +7.1% | **Y** (share-based compensation) | FY2025 20-F, Non-IFRS Financial Measures [9] |
| Net income to parent — FY2024 / FY2023 comparatives | 1,972.1 / 1,030.6 | 2,207.5 / 1,196.5 | +235.4 / +165.9 | +11.9% / +16.1% | **Y** (same three items) | [9] |
| EPS (diluted, US$) | 0.5846 | 0.6261 — **derived by me, not disclosed** | +0.0415 | +7.1% | Y | Adjusted net income 3,072.6 ÷ weighted-average diluted shares 4,907.352m. *Inference, not from filings — the inputs are filed, the ratio is mine* [9][12] |

The adjustment shrinks as a share of profit over time (16.1% → 11.9% → 7.1%), which is the direction that reduces concern. The adjustment does **not** touch revenue, credit losses, funding costs or tax, so the pre-tax profit in Sections 1–3 is unadjusted throughout.

---

## 8. Accounting Trap Checklist

*Severity is an **inverted** score — higher means WORSE.*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | **Y** | Adjusted Net Income is defined as net income adjusted for SBC and its tax effects; +359.0 added back in FY2025, and SBC has run 212.6 / 272.4 / 271.8 / 216.8 (H1'26) [9] | 50 |
| Restructuring costs recur every year | **N** | No restructuring line in FY2023, FY2024, FY2025 or H1'26. One historical charge — the FY2022 contingent-share-award termination of 355.6 — has not repeated [2][3][5] | 10 |
| Capitalized costs rising faster than revenue | **N** (with one unexplained item) | Internally developed intangible additions: 2.06% / 1.34% / 1.81% of revenue (FY2023–FY2025) and 1.72% in H1'26 — no rising trend. But Note 19 additions of 211.5 in H1'26 exceed the 84.2 of cash intangible capex by 127.3, unreconciled in the interim [5][12][14] | 30 |
| Receivable factoring / supplier finance disclosed | **N** | No sale, securitisation or factoring of the group's own receivables is disclosed. The only credit-rights-fund ("FIDC") reference is a **senior quota the group holds as an asset**, disclosed in the fair-value sensitivity note, not receivables sold [5] | 15 |
| Inventory write-downs or reserve releases | **N — the opposite** | Total expected-credit-loss allowance rose 5,022.0 → 6,642.3 (+32.3%) in six months against gross credit assets +20.6%; coverage of the gross book rose 15.37% → 16.86% (+149bps); coverage of over-90-day card balances rose 266% → 277%. No release flattered earnings [7][12][13][14] | 10 |
| Revenue recognized before cash collection risk is clear | **Y — structural, and improving** | Effective-interest income accrued on the amortised-cost book was 8,302.8 in H1'26 against 5,976.3 of cash interest received, a 2,326.5 gap capitalised into receivables. But the collection ratio has improved every year: 62.5% (FY2023) → 68.9% → 70.2% → 70.9% (TTM) → 72.0% (H1'26). Gross card receivables overdue rose 11.0% → 12.5% [5][7][12] | 35 |
| Change in useful life / depreciation assumptions | **N** | No change disclosed. The one estimate-based amortisation policy (card issuance costs deferred over the card's estimated useful life, 365.2 at Jun-30-26) is unchanged in wording and grew +11.0% against revenue +51.5% [5][13] | 10 |
| Tax rate unusually low or boosted by one-off | **Y — the central finding** | IFRS effective tax rate: **33.0% (FY2023) → 29.5% (FY2024) → 25.8% (FY2025) → 17.7% (TTM) → 11.8% (H1'26) → 14.2% (Q2'26)**, against a *rising* Brazilian statutory rate (40% → 42.5% in 2026). Contains an explicit one-off rate-change remeasurement of +58.5 (FY2025) and +28.4 (H1'26). Upstream `04` found **96.7% of the 12.6% Q2'26 net-income beat came from this line** while pre-tax landed within 0.5% of the estimate [3][6] | **75** |
| Large fair-value / mark-to-market gains | **N** | Fair-value lines were 363.6 + 3.4 = 367.0 in Q2'26, **6.7% of revenue**, down from 316.3 = 8.6% in Q2'25 — shrinking as a share, not inflating results [7] | 15 |

---

## 9. Earnings Quality Score

**Earnings Quality: 58 / 100** — top of the *41–60: Material concerns* band (higher = better).

**The single most important reason:** the reported profit is increasingly produced below the pre-tax line. Over the last twelve months **40.4% of net income to parent (US$1,458.6m of US$3,607.1m) is a non-cash deferred tax credit**, the effective tax rate has fallen from 33.0% (FY2023) to 17.7% (TTM) and 14.2% in Q2'26 against a statutory rate that *rose* to 42.5%, and cash tax actually paid (US$2,108.1m TTM) is **2.7 times** the tax charged to the income statement (US$774.6m). One line, not the operating business, is carrying the earnings surprise — `04` measured it at 96.7% of the Q2'26 beat — and its repeatability rests on a management assertion ("a recurring structural feature of how we operate") rather than on anything audited as permanent.

**Why not lower.** The pre-tax business itself looks conservatively stated: the credit-loss allowance is building faster than the book (coverage 15.37% → 16.86% in six months) with no reserve release; cash collection of accrued interest has improved every year for four years; there is no restructuring, no impairment, no change of useful life, no accounting-policy change and no restatement; only one non-IFRS measure exists and it is fully reconciled in the 20-F; and five consecutive audited annual filings are in the pool.

**Why not higher.** The 7.1% share-based-compensation add-back recurs every period; company-basis operating cash flow is negative on a twelve-month view; the deferred tax asset has reached 27.5% of parent equity with recovery on the loss-carryforward slice legally capped at 30% of taxable profit per year for the Brazilian entities; delinquency is rising (gross card receivables overdue 11.0% → 12.5% in six months); and a US$127.3m gap between intangible additions and cash intangible capex in H1'26 is unexplained in the disclosure.

**No partial-data cap applies.** The cash flow statement is present at annual and interim level [2][5][11], so the "no cash flow statement → earnings quality max 45" cap does not bind.

---

## 10. The Single Biggest Quality Concern

**The tax line is doing the work that the operating business is not, and it can stop.** Strip the tax effect and NU's pre-tax profit in Q2'26 landed within 0.5% of what the market expected; add it back and the company beat by 12.6%. The reason is a collapse in the effective tax rate — from 33.0% in FY2023 to 14.2% in Q2'26 — at a time when Brazil's statutory rate went *up* from 40% to 42.5%. The audited reconciliation attributes almost the whole gap to permanent items whose intensity tripled in a single half-year: profits taxed at lower rates in other group entities (US$280.8m in H1'26 against US$56.9m a year earlier), interest-on-capital deductions (US$108.8m against US$38.8m) and a bucket of foreign tax credits, non-taxable sovereign-bond interest and tax incentives (US$253.6m against US$99.0m). Management calls this structure "a recurring structural feature", and its own guide is a 15–20% IFRS rate — but it also concedes a "managerial" rate of 30–35% is the more economically meaningful comparison, and the tax rate was not mentioned once on the Q2'26 call. Two independent facts say the cash economics have not improved anything like as much as the accounting rate: cash tax paid rose to US$2,108.1m over the last twelve months (48.1% of pre-tax profit), and the current-tax charge in the P&L was 50.9% of pre-tax profit — it is only the US$1,458.6m deferred credit, generated by booking credit-loss provisions that Brazil does not yet allow as a deduction, that pulls the reported rate down to 17.7%. That credit is self-reversing by construction: it keeps arriving only while the provision build outruns tax-deductible write-offs, which is only true while the loan book grows fast. In H1'25 the reverse happened and the deferred line was a net expense. So the risk that reported earnings overstate economic reality here is not fraud or aggressive revenue recognition — the credit book is provisioned more heavily each quarter and cash collection of interest is improving — it is that roughly 40% of the reported profit is a tax timing benefit tied to a growth rate and a corporate structure, sitting on the balance sheet as a US$3,649.1m deferred tax asset now worth 27.5% of shareholders' equity, whose recovery on part of its base is capped by Brazilian law at 30% of taxable profit a year. A slowdown in loan growth, or a Brazilian tax-law change to the structure, would remove the credit and push the effective rate back toward the 25–33% the company itself reported as recently as FY2023–FY2025 — worth roughly 10 to 15 percentage points of net income with no change whatever in the operating business.

**Flagged for the master synthesizer (major accounting judgment):** (i) the durability of the permanent tax reconciling items and the recoverability of the US$3,649.1m deferred tax asset are the single largest accounting judgments in these accounts; (ii) the company-basis versus Capital IQ operating-cash-flow difference is definitional (deposits) and must never be quoted without its basis label; (iii) `RF-EQ-001` is emitted, `RF-EQ-002` is tested and does not fire on the authoritative basis, with a stated forward test for FY2026.

---

## Citations

All documents live in the frozen extract generation and are cited logically as `data/NU/`.

[1] FY2025 Form 20-F (filed Apr-08-2026), Consolidated Statements of Income — total revenue, gross profit, income before income taxes and net income for FY2025 / FY2024 / FY2023.
[2] FY2025 Form 20-F (filed Apr-08-2026), Consolidated Statements of Cash Flows — full operating, investing and financing reconciliation for FY2025 / FY2024 / FY2023, including expected credit loss, deferred income taxes, share-based compensation, deposits, interest paid/received and income tax paid.
[3] FY2022 Form 20-F (filed Apr-20-2023), Consolidated Statements of Cash Flows — FY2022 / FY2021 / FY2020 operating reconciliation including the contingent share award termination charge of 355,573 and deferred income taxes.
[4] Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026), Unaudited Interim Condensed Consolidated Statements of Financial Position as of Jun-30-2026 and Dec-31-2025 — deferred tax assets, deposits, payables to network, deferred income, intangible assets, equity.
[5] Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026), Unaudited Interim Condensed Consolidated Statements of Cash Flows for the six-month periods ended Jun-30-2026 and Jun-30-2025; and Note 2(b)/(c) on new accounting pronouncements.
[6] Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026), **Note 30 — Income Tax**: income tax reconciliation at the 42.5% (2026) / 40.0% (2025) combined Brazilian rate; current versus deferred split; deferred tax asset roll-forward.
[7] Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026), **Note 6 — Income and Related Expenses** and **Note 7 — Expected Credit Loss**.
[8] `ciq_facts.json` deterministic sidecar for this extract generation — `ltm_ebitda_m` unknown, `ltm_ocf_m` −10,304.8, `net_debt_ebitda_x` unknown.
[9] FY2025 Form 20-F (filed Apr-08-2026), Non-IFRS Financial Measures and Reconciliations — Adjusted Net Income (Loss) definition and reconciliation for FY2025 / FY2024 / FY2023; FX Neutral Measures methodology.
[10] Q2 2026 Earnings Presentation, Aug-13-2026 — ECL allowance QoQ bridge (6,142 → 6,642), NPL 15-90 and 90+ series, definitions of Adjusted Net Income and FX-Neutral measures.
[11] Capital IQ Financials → Cash Flow (bank template, FY2021–LTM Jun-30-2026), data as of Aug-2026 — vendor-basis "Cash from Ops.", "Net Incr. (Decr.) in Deposit Accounts", capital expenditures, purchases of intangibles, cash interest paid and cash taxes paid.
[12] FY2025 Form 20-F (filed Apr-08-2026), Notes 6 (Income and related expenses), 13 (Credit card receivables), 14 (Loans to customers), 19 (Intangible assets and goodwill), 22 (Deposits), 23 (Payables to network), 30 (Income tax); and Capital IQ Financials → Income Statement, data as of Aug-2026, for weighted-average diluted shares and the vendor's Normalized Diluted EPS of 0.4922.
[13] Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026), **Note 13 — Credit Card Receivables**, **Note 14 — Loans to Customers**, **Note 17 — Other Assets** (including the US$185,488 FGC advance).
[14] Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026), **Note 10 — Share-based Payments** and **Note 19 — Intangible Assets and Goodwill**.
[15] `Q1 2026 earnings-call transcript, May-14-2026, prepared remarks — Guilherme Marques do Lago, Chief Financial Officer` (verbatim S&P Global transcript). *Named correction to upstream `04_guidance-consensus`, which attributed this same quote to a different individual: the transcript identifies the speaker of the ETR remarks and the 15–20% modelling guide as Guilherme Marques do Lago, CFO. The quote itself is verified verbatim and unchanged; only the attribution differs.*

**Not used as a source for any number:** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` (verdict-bearing prior in-house memo, verdict stripped per CLAUDE.md §24).
