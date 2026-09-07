# Earnings Quality — NVT

**Company:** nVent Electric plc (NYSE: NVT). **Jurisdiction/regime:** US SEC domestic filer (Irish-incorporated). **Reporting standard:** US GAAP. **Currency: USD, in millions except per-share.** **Fiscal year ends 31 December.**

**Evidence binding:** frozen extract generation `6db32848…1aecd1e6`. Live `data/NVT/` was not read; `data/NVT/…` is a citation label only. Upstream `01_historical-financials.md` was read and is the baseline for this report.

**Cash flow data IS available** (FY2022–FY2024 audited statements of cash flows; H1 FY25 and H1 FY26 condensed statements; FY2025 and LTM from the Capital IQ export). The MODULE_RULES "no cash flow statement" cap (earnings quality max 45) therefore does **not** apply.

### Definitions used here (CLAUDE.md §15)

- **EBITDA** = operating income + depreciation and amortisation, **continuing operations**. Plain meaning: operating profit before the non-cash charges for wearing out plant and writing down acquired intangibles. nVent reports no GAAP EBITDA; this line is computed from company-sourced components. The company's own **adjusted EBITDA** is a different, narrower measure and is shown separately.
- **CFO** = net cash provided by operating activities **of continuing operations**, as reported on the face of the cash flow statement. A "memo" line shows total-company CFO including discontinued operations, because in FY2025 the two differ by $183.8m of real cash.
- **FCF** = CFO − total capex (§15 default). nVent defines free cash flow differently — continuing-operations CFO − capex **+ proceeds from the sale of property and equipment** [13] — so both are shown and labelled.
- **Net debt (strict basis, §15)** = total debt from the company's own debt note (revolver + term loans + senior notes, net of issuance costs; **no lease liabilities**) − cash. At 30-Jun-2026: $1,492.4m − $256.0m = **$1,236.4m, strict basis** [9][8]. Capital IQ's $1,376.9m is the same balance sheet on a **broad basis** that folds in $140.5m of lease liabilities [17]. Both labels are used inline wherever a figure appears.
- **Basis points (bps)** = hundredths of a percentage point; 100bps = 1.0 percentage point.
- **DSO / DIO / DPO** = days sales outstanding / days inventory outstanding / days payables outstanding — how many days of sales sit in receivables, how many days of cost sit in inventory, and how many days the company takes to pay suppliers.

**Basis break carried forward from upstream.** Thermal Management was sold (agreed 31-Jul-2024, closed 30-Jan-2025 for $1.65bn) and is shown as discontinued operations for FY2022–FY2024 [4]. FY2021 was never restated and is excluded from every table below. There is **no FY2025 Form 10-K in this pool**: FY2025 cash-flow detail is cited to the Capital IQ export (tier-5 vendor data, as of ~12-Aug-2026) [16], and FY2025 income-statement / non-GAAP lines to the company's own Q1 FY26 deck [12], never under a filing's name.

---

## 1. EBITDA → CFO → FCF Bridge (5 years)

All figures USD m, **continuing operations**, US GAAP.

| Item | FY2022 | FY2023 | FY2024 | FY2025 | LTM Jun-26 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA (operating income + D&A) | 395.4 | 575.9 | 673.1 | 824.6 ᵛ | 1,058.4 | Improving |
| Working capital change | (56.0) | (15.0) | 2.4 | (23.5) ᵛ | (88.7) ᵐ | Deteriorating |
| Cash tax paid (consolidated) | (87.3) | (112.4) | (120.2) | (283.3) ᵛ | Not disclosed | Deteriorating |
| Cash interest paid, net (consolidated) | (49.2) | (103.2) | (134.8) | Not disclosed | Not disclosed | Deteriorating |
| Other operating items + non-cash reconciling items (**residual**) | +70.4 | +76.9 | +80.5 | +131.2 ᵉ | n/a | — |
| **CFO (continuing operations)** | **273.3** | **422.2** | **501.0** | **649.0** ᵈ | **772.8** ᵈ | Improving |
| *Memo: CFO, total company incl. discontinued ops* | *394.6* | *528.1* | *643.1* | *465.2* | *690.6* | Deteriorating |
| Maintenance capex | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | — |
| Growth capex | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Not disclosed | — |
| Total capex | 40.5 | 65.6 | 74.0 | 93.3 ᵛ | 112.9 | Rising |
| **FCF (CFO cont. ops − total capex, §15)** | **232.8** | **356.6** | **427.0** | **555.7** | **659.9** | Improving |
| *Memo: FCF on total-company CFO* | *354.1* | *462.5* | *569.1* | *371.9* | *577.7* | Volatile |
| *Memo: company-defined FCF (adds PP&E sale proceeds)* | *234.8* | *356.7* | *427.5* | *561.0* | *663.6* | Improving |
| **CFO / EBITDA %** | **69.1%** | **73.3%** | **74.4%** | **78.7%** | **73.0%** | Stable–improving |

**Footnote keys.** ᵛ = Capital IQ export, tier-5 vendor data as of ~12-Aug-2026 [16]. ᵈ = continuing-operations CFO derived by removing the itemised discontinued-operations cash flow inside the reported total: FY2025 $465.2m − (−$183.8m) = **$649.0m**; LTM $690.6m − (−$82.2m) = **$772.8m** [16]. ᵐ = mixed basis — FY2025 working capital from the vendor's own component lines, H1 FY25 and H1 FY26 from the filed cash flow statements [8]; labelled because the two are not built the same way. ᵉ = FY2025 residual is not a clean plug: see the basis warning below.

**Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow.** nVent has never split maintenance from growth capex in this pool. The only colour is directional: management guided FY2026 capex to "approximately $130 million, up 40%", and said "most of this increased investment is for new capacity to support growth in data centers, power utilities and supply chain resiliency" [10]. That says the *increment* is growth spend but does not size the maintenance base, so no split is attempted here.

**Two basis warnings on this bridge (§15 matched-basis rule).**
1. **Cash taxes and cash interest paid are consolidated figures; CFO above is continuing-operations only.** The 10-K supplemental disclosure gives one company-wide number [3]. So the residual line absorbs that mismatch as well as the genuine non-cash items (share-based compensation of $23.3m / $21.8m / $27.3m / $37.5m across FY2022–FY2025, deferred taxes of −$11.4m / −$165.9m / +$85.3m in FY2022–FY2024, and pension expense/income of −$58.0m / +$19.9m / +$5.4m) [3][16]. The residual is named, not hidden, and it is not evidence of an unexplained cash gap.
2. **The FY2025 cash-tax line is dominated by the disposal, not by operations.** Cash taxes paid jumped from $120.2m (FY2024) to $283.3m (FY2025), a rise of $163.1m [3][16], and $183.8m of operating cash flowed *out* through discontinued operations that year [16]. Read together, most of the FY2025 tax step-up is the tax on the Thermal Management sale and belongs to the discontinued line, not to continuing operations. Charging the full $283.3m against continuing-operations CFO would be the wrong basis, which is why the FY2025 residual is large (+$131.2m). The vendor also reports the identical $283.3m for the LTM column, which cannot be right for a rolling twelve months that is half FY2026 — that cell is treated as **Not disclosed** rather than used.

### Lead figure: normalised operating FCF (§15)

**LTM normalised operating FCF to 30-Jun-2026: ~$634.1m.** Reported LTM FCF on the §15 definition is **$659.9m**; the company's own definition gives **$663.6m** (it adds $3.7m of property-sale proceeds) [13][16]. The normalisation removes **~$25.8m** of one-off IEEPA tariff reimbursements — a refund of tariffs the company had previously paid over — which the Q2 FY26 10-Q says benefited gross profit in the quarter and which the company itself strips out of its adjusted results [9]. No separate tariff receivable appears on the 30-Jun-2026 balance sheet [9], so the conservative treatment (§4) is that the cash was received inside the period; that is also the direction that flatters reported FCF, so it is the one to normalise against. All three figures are shown so they are never mixed. The §5 one-off table below reconciles to this $25.8m adjustment.

**A second normalisation runs the other way and matters more.** FY2025 continuing-operations FCF of **$555.7m** overstates the cash the group actually generated that year by **$183.8m**, because that much operating cash left through discontinued operations (disposal taxes). On a total-company basis FY2025 FCF was **$371.9m** — below FY2024's $569.1m. Anyone quoting $555.7m as FY2025 cash generation is quoting a continuing-operations figure for a year in which the group's bank balance did not see it.

---

## 2. Cash Conversion Assessment

CFO tracks EBITDA closely and has done for four straight years: **69.1% → 73.3% → 74.4% → 78.7% → 73.0%** on a matched continuing-operations basis (both numerator and denominator continuing ops). Every year sits above the 70% "healthy" line except FY2022 at 69.1%, and the direction is flat-to-up rather than eroding. The one year that looks weak — FY2025 at **56.4%** measured on total-company CFO of $465.2m — is weak for a disclosed, identifiable reason: $183.8m of cash went out through discontinued operations on the Thermal Management disposal [16], not because operating earnings failed to convert. Even on that unflattering total-company basis, no year in the last three is below 50%: FY2023 91.7%, FY2024 95.5%, FY2025 56.4%, LTM 65.2%.

**Adjudicating the number that disagrees (§3).** First-half FY2026 cash conversion looks poor in isolation: company-defined H1 FY26 FCF of $221.1m against H1 adjusted net income of roughly $417.1m (Q1 $179.2m [12] + Q2 $1.45 adjusted EPS × 164.1m diluted shares [10][9]) is **~53%**, against full-year guidance of **90–95% conversion** [10]. That gap does not, on the evidence, signal a break. nVent's cash is structurally second-half weighted: in FY2025, H1 continuing CFO was $154.9m and the full year $649.0m, so **76% of the year's operating cash arrived in H2** [8][16], and working capital released roughly $129.7m in H2 FY25 after consuming $153.2m in H1 [8][16] (mixed basis — vendor full-year components against filed half-year lines). Doing the arithmetic the guidance implies: FY2026 adjusted EPS guidance of $5.00–$5.10 [10] on ~164m diluted shares is roughly $828m of adjusted net income; at 92.5% conversion that is ~$766m of FCF, leaving **~$545m for H2 FY26 against $442.5m actually delivered in H2 FY25 — a required increase of ~23%, on revenue guided up 32–35%** [10]. The required cash growth is *below* the guided revenue growth, so the target is demanding but not out of line with the company's own recent shape. It is a live test, not yet a failure.

*(No RF-EQ-002 tag is emitted: CFO/EBITDA was not below 50% in any of the last three years on either the continuing-operations basis or the total-company basis.)*

---

## 3. Working Capital Trends

**Formulas and basis.** `DSO = 365 × receivables ÷ revenue`; `DIO = 365 × inventory ÷ COGS`; `DPO = 365 × payables ÷ COGS`. DSO uses **revenue**; DIO and DPO use **COGS**, not revenue. **Period-end balances are used consistently, not averages** — averaging would drag the pre-divestiture FY2022 balance sheet (which still contained Thermal Management) into the FY2023 calculation and corrupt it. Receivables, inventory and payables are the **filed** figures from the 10-K and 10-Q balance sheets [2][9], not the Capital IQ balance sheet, whose receivables line is $160–169m higher in each period because it folds contract assets into receivables [17][9].

| Metric | FY2023 | FY2024 | FY2025 | LTM / 30-Jun-26 | Direction | Risk |
|---|---:|---:|---:|---:|---|---|
| Receivable days (DSO) | 64.3 | 57.4 | 65.0 | 73.2 | Rising | See adjudication below |
| Inventory days (DIO) | 82.5 | 73.2 | 71.1 | 62.6 | Falling | Low |
| Payable days (DPO) | 54.9 | 56.9 | 54.0 | 59.4 | Broadly flat | Low |
| Cash conversion cycle (DSO + DIO − DPO) | 91.9 | 73.7 | 82.0 | 76.4 | Down 15.5 days since FY2023 | Low |

Inputs: revenue 2,668.9 / 3,006.1 / 3,893.1 / 4,834.0; COGS 1,593.7 / 1,797.0 / 2,424.0 / 3,046.8; receivables 470.2 / 473.1 / 693.0 / 969.3; inventory 360.2 / 360.3 / 471.9 / 522.4; payables 239.8 / 280.1 / 358.9 / 496.0 [1][2][7][9][16][17]. LTM COGS is built from filings and ties exactly to the vendor LTM column: 2,424.0 − 1,086.9 + 1,709.7 = 3,046.8 [7][16].

**Flag test 1 — DSO rising >10% YoY: triggered on the reported basis, and it does not survive a matched-basis check.**
- Reported: FY2024 57.4 days → FY2025 65.0 days = **+13.2%**, which trips the threshold.
- Why it trips: nVent bought the Electrical Products Group on 1-May-2025 for $979.6m, and the final purchase price allocation put **$97.7m of acquired accounts receivable** on the balance sheet at that date [9]. Those receivables arrive whole; only eight months of the matching revenue lands in the FY2025 denominator. Strip the acquired receivables and FY2025 receivables grew **+25.8%** against revenue growth of **+29.5%** — slower than sales.
- The matched-basis version (§15): DSO measured against **annualised latest-quarter revenue**, which removes the lag between an acquisition's balance sheet and its revenue: **57.4 days (Dec-24) → 59.3 days (Dec-25) → 60.1 days (Jun-26)**. That is +3.3% then +1.3%, both well inside the 10% flag. Working: 365 × 473.1 ÷ (752.2 × 4); 365 × 693.0 ÷ (1,066.7 × 4); 365 × 969.3 ÷ (1,471.3 × 4) [9][12][18].
- **Verdict: not a revenue-recognition concern.** Receivables rose $276.3m in H1 FY26 with no acquisitions in the period [8], and the 10-Q attributes it to "accounts receivable driven by the overall increase and timing of sales" [9] on revenue up 53.1% year on year. **Confidence is capped by one genuine gap:** the Q2 FY25 10-Q is not in this pool, so a 30-Jun-2025 receivables balance — the only true like-for-like comparable for the 30-Jun-2026 figure — cannot be computed. If such a balance showed a real seasonal DSO rise, this verdict would change.

**Flag test 2 — DIO rising >15% YoY: not triggered.** Inventory days fell every year: 82.5 → 73.2 → 71.1 → 62.6. FY2025 inventory rose 31.0%, of which $20.0m was acquired with EPG [9]; excluding that, +25.4% against COGS growth of +34.9%. In H1 FY26 inventory rose only 10.7% while COGS rose 57.3% year on year. There is no channel stuffing or inventory build signature here; if anything the company is running leaner into much higher volume. Raw materials rose fastest (213.5 → 253.5, +18.7%) and finished goods actually fell (227.2 → 222.5) [9] — the opposite shape to a demand stall.

**Flag test 3 — DPO rising sharply: not triggered.** DPO of 59.4 days on the LTM basis is up from 54.0, but on the matched annualised-half-year basis (365 × 496.0 ÷ (1,709.7 × 2)) it is **52.9 days**, slightly *below* FY2025. Payables grew 38.2% over six months against sequential revenue growth of 27.9% [7][9], which is a normal build on a business scaling purchases, not a supplier stretch. No supplier-finance or reverse-factoring programme is disclosed anywhere in the pool.

**The real working capital story is cash absorption from growth, not deterioration in quality.** Working capital consumed **$218.4m** in H1 FY26 versus $153.2m in H1 FY25 [8], and receivables alone were $280.2m of that. That is the cost of growing revenue 53% — and the cash conversion cycle is still 15.5 days *shorter* than in FY2023.

---

## 4. Non-GAAP Adjustments

All adjustments below come from the company's own reconciliations, not from this agent. nVent's stated definition: adjusted operating income excludes intangible amortisation, acquisition-related expenses, restructuring costs, impairments and other unusual non-operating items; adjusted EBITDA = adjusted operating income + depreciation; return on sales = adjusted operating income ÷ net sales [12].

**FY2025 (full year), adjustments to operating income — total +$169.0m = 27.4% of GAAP operating income of $616.8m:**

| Adjustment | Amount | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Intangible amortisation from acquisitions | +147.1 | **Y** — 50.3 / 69.5 / 94.7 / 147.1 in FY2022–FY2025, rising every year; 165.2 LTM | **High** | [12][16] |
| Acquisition transaction & integration costs | +14.4 | **Y** — 0.8 / 12.8 / 13.9 / 14.4 in FY2022–FY2025; 7.5 in H1 FY26 | Mid | [12][5] |
| Restructuring and other | +7.5 | **Y** — 11.2 / 3.9 / 7.5 / 7.5 in FY2022–FY2025; 10.9 in H1 FY26 | Mid | [12][5][9] |
| Pension / OPEB mark-to-market gain (at net income line) | −12.9 | **Y by policy** — the company remeasures every Q4: +61.9 / −13.4 / +0.1 / +12.9 in FY2022–FY2025 | Low | [5][12] |
| Tax on the above (at net income line) | −33.8 | Y | Low | [12] |
| **Stock-based compensation** | **not adjusted out** ($37.5m FY2025 expense stays in adjusted earnings) | — | **None — a positive** | [16][12] |

**H1 FY26, adjustments to operating income — total +$74.8m = 15.1% of GAAP operating income of $496.4m:**

| Adjustment | Amount | Recurring? (Y/N) | Concern Level | Evidence |
|---|---:|---|---|---|
| Intangible amortisation | +82.2 | Y | High | [9] |
| Restructuring and other | +10.9 | Y | Mid | [9] |
| Acquisition transaction & integration costs | +7.5 | Y | Mid | [9] |
| IEEPA tariff reimbursements — **removed as a benefit** | **−25.8** | N (one-off refund) | **Low — conservative** | [9] |

Reconciliation check: 496.4 + 82.2 + 10.9 + 7.5 − 25.8 = **571.2** = reportable segment income 644.9 − Enterprise and other 73.7 [9]. Ties exactly.

**Which adjustments clear the flags in this agent's brief:**
- **Recurs every period, so it is not a "one-off":** intangible amortisation, acquisition costs, restructuring, and the annual pension remeasurement. All four appear in every year on record.
- **Exceeds 15% of GAAP earnings:** yes, decisively. FY2025 adjusted diluted EPS of **$3.35** is **28.8% above** GAAP continuing-operations EPS of **$2.60**, and **$147.1m of the $169.0m operating add-back — 87% of it — is acquisition intangible amortisation** [12].
- **Stock-based compensation excluded:** **no.** SBC of $37.5m (FY2025) and $23.1m (H1 FY26) is expensed inside adjusted earnings [16][8]. That is a genuinely more conservative non-GAAP definition than most US industrials use.
- **A rare mark in the company's favour:** in Q2 FY26 nVent *removed a $25.8m benefit* from its adjusted numbers. Reported GAAP operating income of $300.7m includes the tariff refund; adjusted operating income of $322.7m does not [9]. Adjusted EBITDA in H1 FY26 ($605.4m) is therefore **below** GAAP-derived EBITDA ($612.8m). A company willing to publish an adjusted number lower than its GAAP number is not running the add-backs in one direction only.

---

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification | Evidence |
|---|---|---:|---|---|
| Thermal Management disposal — gain in discontinued operations | Q1 FY25 / FY2025 | $281.7m disc-ops income; $1.64 of Q1 FY25 GAAP diluted EPS; $1,584.5m investing inflow | **Genuine** | [4][12][16] |
| Thermal Management disposal — operating cash **outflow** in discontinued operations | FY2025 | **−$183.8m** (cash taxes paid rose $163.1m to $283.3m the same year) | **Genuine — cash cost, easy to miss** | [16][3] |
| IEEPA tariff reimbursement inside gross profit | Q2 FY26 | +$25.8m pre-tax ≈ +$19.7m after tax ≈ **+$0.12 of GAAP diluted EPS** (9% of the quarter's $1.32) | **Genuine** — and the company excludes it from adjusted | [9] |
| Pension / OPEB mark-to-market remeasurement | Every Q4 | +61.9 (FY22) / −13.4 (FY23) / +0.1 (FY24) / +12.9 (FY25) | **Recurring "one-off"** — it happens by accounting policy every single year | [5][12] |
| Restructuring and other | Every year | 11.2 / 3.9 / 7.5 / 7.5 / 10.9 (FY22 / FY23 / FY24 / FY25 / H1 FY26) | **Recurring "one-off"** | [5][12][9] |
| Acquisition transaction & integration costs | Every year | 0.8 / 12.8 / 13.9 / 14.4 / 7.5 | **Recurring "one-off"** | [5][12][9] |
| Deferred foreign tax benefit turning FY2023 tax into a net credit | FY2023 | Tax line was a **benefit of $84.4m** on pre-tax income of $375.3m, driven by a $174.0m deferred foreign tax benefit | **Genuine but very large** | [1][16] |
| Inventory step-up amortisation (ECM deal accounting) | FY2023 | $17.7m | **Genuine** | [5] |
| Gain on sale of investment | FY2023 | +$10.3m | **Genuine** | [1][5] |
| Impairment of equity investments / release of guarantee liability | FY2024 | −$8.8m / +$12.5m (non-cash) | **Genuine** | [3][5] |

**The FY2023 tax item deserves naming.** Continuing-operations net income of $459.7m that year rests on a tax *credit*. Taxed at FY2025's 22.1% rate, FY2023 pre-tax income of $375.3m would have produced roughly $292m of net income and about **$1.74 of continuing diluted EPS instead of the reported $2.73** [1][12]. Any multi-year EPS growth line that runs through FY2023 is distorted by this, in the flattering direction for FY2023 and the punishing direction for FY2024 (which carried a 43.9% effective rate) [16].

---

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | **N** | FY2023 revenue +16.3% vs continuing CFO +54.5%; FY2024 +12.6% vs +18.7%; FY2025 +29.5% vs +29.5% (dead heat); H1 FY26 revenue +53.1% vs CFO +79.9% [1][7][8][12][16] |
| Receivables growing faster than revenue | **N** | Reported FY2025 receivables +46.5% vs revenue +29.5% would trip it, but $97.7m of that came in with the EPG acquisition's opening balance sheet; excluding it, +25.8% vs +29.5%. Matched-basis DSO on annualised latest-quarter revenue: 57.4 → 59.3 → 60.1 days [2][7][9][12]. Confidence capped — no 30-Jun-2025 balance sheet in this pool |
| Inventory growing faster than COGS | **N** | FY2025 inventory +31.0% (ex-acquired +25.4%) vs COGS +34.9%; H1 FY26 inventory +10.7% vs COGS +57.3% YoY; inventory days 82.5 → 62.6 [2][7][9][16] |
| Deferred revenue declining (contract business) | **Y** | Contract liabilities fell from $176.8m to $159.9m (−9.6%) in the six months to 30-Jun-2026 while revenue rose 53.1%; net contract assets swung from −$16.0m to +$8.6m, a $24.6m move the 10-Q attributes to "the timing of milestone invoicing" [9]. Order backlog moved the other way, to ~$2.5bn [10] |
| Capitalised costs growing as % of revenue | **N** | No capitalised software or development-cost line is disclosed. The closest analogue, contract assets, rose only 4.8% ($160.8m → $168.5m) and *fell* as a share of revenue, from 4.1% of FY2025 revenue to 3.5% of LTM revenue [9] |
| Frequent accounting policy changes | **N** | No policy change in the period. The only presentation changes are a recategorisation of revenue by vertical, which the filing states "had no impact on our consolidated financial results", and the segment renaming to Systems Protection / Electrical Connections [9]. Inventory stays FIFO; depreciation lives unchanged at 5–20 / 5–50 / 3–15 years [5] |

**One row triggered (deferred revenue), and it is the mildest of the six.** The fall in contract liabilities is explained in the filing itself — the December-2025 balance was recognised as revenue during H1 FY26 — and the forward-order measure that actually matters for a project business, backlog, roughly tripled from $749.3m (FY2024) to $2.35bn (FY2025) [17] and stood at about $2.5bn at the Q2 FY26 call [10]. It is logged Y because the factual test is met, not because it reads as manipulation.

*(No RF-EQ-001 tag is emitted: only one of the six rows is triggered, below the two-row threshold.)*

---

## 7. Reported vs Adjusted Reconciliation

**FY2025 (full year, continuing operations, USD m except EPS):**

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | 824.6 (= op. income 616.8 + D&A 207.8) | 846.5 (= adj. op. income 785.8 + depreciation 60.7) | +21.9 | +2.7% | Y (restructuring 7.5 + acquisition costs 14.4) | [12][16] |
| EBIT (operating income) | 616.8 | 785.8 | +169.0 | **+27.4%** | Y — 87% of it is intangible amortisation | [12] |
| Net income (continuing) | 428.5 | 550.8 | +122.3 | **+28.5%** | Y | [12] |
| EPS (diluted, continuing) | 2.60 | 3.35 | +0.75 | **+28.8%** | Y | [12] |

**H1 FY26 (six months to 30-Jun-2026):**

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | 612.8 (= 496.4 + D&A 116.4) | 605.4 (= 571.2 + depreciation 34.2) | **−7.4** | −1.2% | Mixed — the −25.8 IEEPA removal outweighs the +18.4 of add-backs | [7][8][9] |
| EBIT (operating income) | 496.4 | 571.2 | +74.8 | +15.1% | Y | [7][9] |
| Net income (continuing) | 356.2 | ~417.1 (Q1 179.2 + Q2 ~237.9) | +60.9 | +17.1% | Y | [7][12][10] |
| EPS (diluted, continuing) | 2.17 | 2.54 (Q1 1.09 + Q2 1.45) | +0.37 | +17.1% | Y | [7][12][10] |

Note: Q2 FY26 adjusted net income is derived as $1.45 adjusted EPS × 164.1m diluted shares [10][7] — the company's Q2 FY26 reconciliation slide is not in this pool (the latest deck is Q1 FY26). It is labelled derived, not filed.

The gap narrows from 28.8% (FY2025) to 17.1% (H1 FY26) for two reasons that pull in opposite directions: intangible amortisation is still climbing in absolute terms ($82.2m in H1 FY26 vs $64.1m in H1 FY25), but reported earnings grew so much faster that the same-sized add-back is a smaller percentage — and the $25.8m tariff removal cuts the adjustment further.

---

## 8. Accounting Trap Checklist

*Severity is an **inverted** score: higher = WORSE.*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | **N** | SBC of $37.5m (FY2025) and $23.1m (H1 FY26) is expensed inside adjusted operating income; the company's stated adjustment list does not include it [12][16][8] | 5 |
| Restructuring costs recur every year | **Y** | "Restructuring and other" in every year on record: 11.2 / 3.9 / 7.5 / 7.5 / 10.9 (FY22 / FY23 / FY24 / FY25 / H1 FY26). Small in context — FY2025's 7.5 is 1.2% of operating income [5][12][9] | 30 |
| Capitalised costs rising faster than revenue | **N** | No capitalised software/development line disclosed; contract assets +4.8% vs revenue +53%, falling from 4.1% to 3.5% of revenue [9] | 10 |
| Receivable factoring / supplier finance disclosed | **N** | No factoring, securitisation, reverse-factoring or supplier-finance programme appears anywhere in the FY24 10-K or either 10-Q. US GAAP requires supplier-finance programmes to be disclosed, so silence here is reasonable evidence of absence [3][5][8][9] | 5 |
| Inventory write-downs or reserve releases | **N (material)** | Inventory carried at lower of FIFO cost or net realisable value; no write-down disclosed. The one related item is $17.7m of inventory step-up amortisation in FY2023 from the ECM deal — purchase accounting, not a reserve release [5]. Separately, accrued customer rebates *fell* from $91.5m to $78.8m while sales rose 53%, and the allowance for doubtful accounts fell from 1.94% to 1.69% of gross receivables — both small, both worth watching [9][17] | 20 |
| Revenue recognised before cash collection risk is clear | **Partial** | Long-term contracts use cost-to-cost over-time recognition, producing $168.5m of unbilled contract assets (3.5% of LTM revenue). The filing states there were "no material impairment losses recognized on our contract assets" [5][9]. This exposure grows with EPG's switchgear/bus-systems project mix | 25 |
| Change in useful life / depreciation assumptions | **N** | Useful lives unchanged: land improvements 5–20 years, buildings 5–50, machinery 3–15 [5]. Acquired-intangible lives are long but disclosed and consistent with prior deals: EPG customer relationships 16 and 20 years, technologies 8 years, customer backlog ~3 years [9] | 20 |
| Tax rate unusually low or boosted by one-off | **Y (historically, not now)** | FY2023 carried an $84.4m tax *benefit* (a $174.0m deferred foreign tax benefit) on $375.3m of pre-tax income; FY2024 then ran at 43.9%. FY2025 was 22.1% and H1 FY26 22.4% — normal, and the volatility sits in the past [1][7][16] | 30 |
| Large fair-value / mark-to-market gains | **Y** | Pension/OPEB mark-to-market by policy every Q4: +61.9 (FY22, 18.4% of that year's pre-tax income), −13.4 (FY23), +0.1 (FY24), +12.9 (FY25). Non-cash, and excluded from adjusted results in both directions [5][12] | 30 |

---

## 9. Earnings Quality Score

# **74 / 100** — band 61–80: *mostly clean but some working capital or adjustment noise*.

**The single most important reason:** cash backs the earnings — CFO has run at 69–79% of EBITDA for four straight years and the cash conversion cycle has *shortened* by 15.5 days since FY2023 — but a persistent, growing wedge sits between reported and adjusted profit, and 87% of it is acquisition intangible amortisation ($147.1m in FY2025, $165.2m LTM) that is the recurring price of a serial-acquisition growth model, not a one-off.

**What lifts the score toward the top of the band:** stock-based compensation is expensed inside adjusted earnings; the company removed a $25.8m GAAP *benefit* from its own adjusted Q2 numbers, publishing an adjusted EBITDA below its GAAP EBITDA for H1 FY26; inventory days fell from 82.5 to 62.6; no factoring or supplier-finance programme; unchanged depreciation lives and inventory method; the EPG purchase price allocation is final and disclosed line by line; and the one reported red flag (DSO up 13.2% in FY2025) dissolves on a matched-basis check.

**What holds it out of the 81–100 band:** four "one-off" adjustment categories recur every single year; adjusted EPS runs 29% above GAAP; working capital consumed $218.4m in H1 FY26 and the full-year 90–95% cash conversion target needs a large second-half swing; there is no FY2025 Form 10-K in this pool, so a full year of cash-flow detail is vendor-sourced and cash interest paid is unavailable for FY2025 and the LTM; and no 30-Jun-2025 balance sheet exists here, so the cleanest possible receivables test cannot be run.

---

## 10. The Single Biggest Quality Concern

The single biggest risk that reported earnings overstate economic reality is **the acquisition amortisation wedge, not the cash**. nVent spent $1,120.1m (ECM, FY2023), $677.7m (Trachte, FY2024) and $975.7m (Electrical Products Group, FY2025) — $2.77bn in three years [3][16] — and each deal writes a large slug of customer relationships and technology onto the balance sheet ($433.8m for EPG alone, amortised over 8 to 20 years) [9]. The company then excludes the resulting amortisation from adjusted profit, which is standard practice and correctly disclosed, but the effect is that **the headline "adjusted" earnings line systematically leaves out the cost of the very engine driving the growth**: $147.1m in FY2025, $165.2m over the last twelve months, and rising in every year on record. An investor paying for adjusted EPS of $3.35 (FY2025) is paying for a number 28.8% above the $2.60 the audited accounts report. This is a *presentation* risk rather than a *cash* risk — the amortisation is genuinely non-cash and the cash conversion (CFO at 73% of EBITDA over the last twelve months, normalised operating FCF of roughly $634.1m) is real. But it becomes an economic risk the moment the deal flow stops, because the amortisation keeps running for years after the acquisitions that created it, while the revenue those deals bought stops being flattered by "organic-plus-acquired" growth. The Maverick Power acquisition announced 24-Aug-2026 — after every filing in this pool [19] — extends the pattern rather than breaking it.

Two second-order items the master synthesizer should carry, neither large enough to change the verdict: **(1)** FY2025 continuing-operations FCF of $555.7m overstates the group's actual cash generation by $183.8m, which flowed out through discontinued operations as disposal tax — on a total-company basis FY2025 FCF was $371.9m, *below* FY2024's $569.1m; and **(2)** the last twelve months' FCF includes roughly $25.8m of one-off IEEPA tariff refunds, so the recurring figure is ~$634.1m, not $659.9m.

**Accounting judgments flagged for the master synthesizer:** cost-to-cost over-time revenue recognition on long-term contracts, carrying $168.5m of unbilled contract assets and growing with the EPG project mix; the annual Q4 pension mark-to-market, which put $61.9m through FY2022 pre-tax income (18.4% of it); and the FY2023 tax credit that lifted that year's continuing EPS from roughly $1.74 to a reported $2.73, distorting any multi-year EPS growth line drawn through it.

---

## Citations

All documents are in the frozen extract generation `6db32848…1aecd1e6`, cited under the logical label `data/NVT/`.

[1] FY24 10-K (nVent Electric plc, Form 10-K, fiscal year ended 31-Dec-2024), Consolidated Statements of Operations and Comprehensive Income, p.40
[2] FY24 10-K, Consolidated Balance Sheets, p.41
[3] FY24 10-K, Consolidated Statements of Cash Flows and Supplemental cash flow information, p.42
[4] FY24 10-K, Note 6 (Discontinued Operations) and Note 5 (Acquisitions), p.55–56
[5] FY24 10-K, Significant Accounting Policies (revenue recognition, contract balances, inventories, property useful lives), Note 3 (Restructuring), and Note 16 (Segment Information — reconciliation of reportable segment income to income before income taxes)
[6] Q1 FY26 10-Q (quarter ended 31-Mar-2026), Condensed Consolidated Statements of Income, p.3
[7] Q2 FY26 10-Q (quarter and six months ended 30-Jun-2026), Condensed Consolidated Statements of Income and Comprehensive Income, p.3
[8] Q2 FY26 10-Q, Condensed Consolidated Statements of Cash Flows, p.5
[9] Q2 FY26 10-Q — Condensed Consolidated Balance Sheets p.4; Note 2 (Revenue, contract balances); Note 3 (Restructuring); Note 5 (Acquisitions — Electrical Products Group final purchase price allocation); Note 8 (Supplemental Balance Sheet Information); Note 10 (Debt); Note 12 (Segment Information); MD&A "Results of Operations" and "Liquidity and Capital Resources"
[10] Q2 FY26 earnings call transcript (S&P Global Market Intelligence, verbatim), 31-Jul-2026, prepared remarks
[11] Q1 FY26 earnings call transcript (S&P Global Market Intelligence, verbatim), 1-May-2026
[12] Q1 FY26 earnings presentation, 1-May-2026, "Reported to Adjusted 2025 Reconciliation", slide 16
[13] Q1 FY26 earnings presentation, 1-May-2026, "Organic Sales Growth and Free Cash Flow Reconciliation", slide 17
[14] Q1 FY26 earnings presentation, 1-May-2026, "Reported to Adjusted 2026 Reconciliation", slide 15
[15] Q1 FY26 earnings presentation, 1-May-2026, Key Definitions and Notes, slide 2
[16] Capital IQ Financials export → Cash Flow and Income Statement tabs, annual FY2021–FY2025 + LTM 12 months Jun-30-2026; vendor data as of ~12-Aug-2026
[17] Capital IQ Financials export → Balance Sheet tab, same workbook and as-of date
[18] Capital IQ Estimates export → Surprise tab, quarterly actuals FQ3 2024 – FQ2 2026; vendor data as of ~Aug-2026
[19] "nVent to Acquire Maverick Power", announcement dated 24-Aug-2026
[20] `ciq_facts.json` deterministic facts sidecar, frozen generation `6db32848…1aecd1e6` — LTM CFO $690.6m, levered FCF $468.2m (after interest, NOT the §15 CFO−capex measure), net debt $1,376.9m and total debt $1,632.9m on the vendor's lease-inclusive **broad** basis
[21] Upstream `analyses/NVT_2026-09-07/earnings/01_historical-financials.md`

**Reconciliation to `ciq_facts.json` (required).** The sidecar's LTM "Cash from Ops." of **$690.6m** is accepted as an accurate read of the workbook and is the *total-company* figure; this report's $772.8m is the same figure with the itemised −$82.2m discontinued-operations outflow removed, and both are shown in the bridge. The sidecar's "Levered Free Cash Flow" of **$468.2m** is a different measure (after interest) and is deliberately not used as FCF; the §15 measure (CFO − total capex) is $659.9m and the normalised operating figure is ~$634.1m. Net debt of $1,376.9m is the **broad** basis (leases included); the strict, filing-verified figure at 30-Jun-2026 is **$1,236.4m**, and the $140.5m gap is entirely lease liabilities [9][17]. No vendor figure is overridden.

### Calculation provenance

Every ratio, day-count, growth rate and residual in this report was produced by an executed Python snippet, not mental arithmetic. Spot-checks: LTM COGS built from filings, 2,424.0 − 1,086.9 + 1,709.7 = **3,046.8**, ties exactly to the vendor LTM column; LTM D&A 207.8 − 92.3 + 116.4 = **231.9**, ties exactly to the vendor LTM column; H1 FY26 adjusted operating income 496.4 + 82.2 + 10.9 + 7.5 − 25.8 = **571.2** = segment income 644.9 − Enterprise and other 73.7; FY2025 adjusted EBITDA 785.8 + 60.7 = **846.5**, matching the company's own slide.
