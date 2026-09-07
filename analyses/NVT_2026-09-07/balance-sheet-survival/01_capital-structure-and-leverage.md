# Capital Structure & Leverage — NVT

**Company:** nVent Electric plc (NYSE: NVT) · **Reporting currency: USD, in millions** · **Reporting standard: US GAAP** · **Fiscal year ends 31 December** · **Balance-sheet date: 30 June 2026** (Q2 FY26 Form 10-Q, filed 2026-07-31)

**Three things to hold on to before the tables.**

1. **The canonical debt figure in this module is the company's own debt note, not the vendor's.** The 10-Q's Note 10 total debt is **$1,492.4m**. Capital IQ's "Total Debt" of **$1,632.9m** is the same balance sheet with the **$140.5m** of operating-lease liabilities added in. Under US GAAP operating leases sit **off** the debt line, so the filing basis is the one used throughout. Both are shown, each under its own source (CLAUDE.md §5 — never a vendor number under a filing's name).
2. **The EBITDA in every ratio below is at a cyclical peak.** `business-model/07_business-quality` scores cyclicality **30/100** (reverse-mapped: low score = high cyclicality) and `earnings/02_revenue-drivers` states plainly that Q2 FY26 "is a peak-of-cycle print, not a normalised base." So every ratio is shown on the latest (peak) EBITDA **and** on a normalised / mid-cycle EBITDA, each labelled. The peak figure is a floor on leverage, not the central estimate.
3. **A $1.75bn acquisition sits outside every reported number here.** Maverick Power was announced **24 August 2026** — after the 30 June 2026 balance sheet — for **$1.75bn cash plus up to $550m of contingent consideration**, to be funded "with a combination of available cash on hand and new debt," with **committed bridge financing from Bank of America**, expected to close **Q4 2026** [`nVent news release "nVent to Acquire Maverick Power", 2026-08-24`]. The debt/cash mix, tenor and pricing are **not disclosed in this data pool**. Section 5A carries the pro-forma read; it is labelled pro-forma on every line and is never a reported figure.

---

## 1. Debt Stack

All amounts USD millions at **30 June 2026**. Source for every row: `Q2 FY26 10-Q, Note 10 (Debt)` unless stated. Seniority / secured / maturity-date columns cross-read from `CIQ Financials → Capital Structure Details` (FY2025 as-reported block, source "A 2025 filed Feb-17-2026") — a tier-5 vendor export, cited as such.

| Instrument | Amount | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Current maturities of long-term debt and short-term borrowings | 13.8 | Obligor Group (HoldCo) | No | Senior unsecured | None | within 12 months | Amortisation of the floating term loan | `Q2 FY26 10-Q, Note 10`; balance sheet line |
| 4.550% Senior Notes due 2028 ("2028 Notes") | 500.0 | Issued by nVent Finance S.à r.l. (HoldCo); guaranteed by nVent Electric plc and Hoffman Schroff Holdings, Inc. | No | General unsecured senior obligations, ranking equally with all other unsubordinated unsecured debt | None | 2028-04-15 | **Fixed** 4.550% | `Q2 FY26 10-Q, Note 10`; `CIQ Financials → Capital Structure Details` (maturity date) |
| 2.750% Senior Notes due 2031 ("2031 Notes") | 300.0 | nVent Finance S.à r.l. (HoldCo), same guarantees | No | Senior unsecured | None | 2031 | **Fixed** 2.750% | `Q2 FY26 10-Q, Note 10` |
| 5.650% Senior Notes due 2033 ("2033 Notes") | 500.0 | nVent Finance S.à r.l. (HoldCo), same guarantees | No | Senior unsecured | None | 2033 | **Fixed** 5.650% | `Q2 FY26 10-Q, Note 10` |
| Term Loan Facility (amortising) | 200.0 | nVent Finance S.à r.l. / Obligor Group | No | Senior unsecured | None | 2030-06-30 | **Floating** — SOFR / EURIBOR / SONIA + margin; average rate **4.903%** at 30-Jun-2026 | `Q2 FY26 10-Q, Note 10`; `CIQ Financials → Capital Structure Details` |
| Revolving Credit Facility (drawn) | **0.0** (of $600.0m committed capacity; accordion up to a further $300.0m subject to lender commitment) | nVent Finance S.à r.l. / Obligor Group | No | Senior unsecured | None | 2030-06-30 | Floating when drawn; margin set off net leverage ratio **or public debt rating** | `Q2 FY26 10-Q, Note 10` |
| Unamortized debt issuance costs and discounts | (7.6) | — | — | — | — | — | — | `Q2 FY26 10-Q, Note 10` |
| **Total debt (filing basis, Note 10)** | **1,492.4** | of which current 13.8 / long-term 1,478.6 | **None secured** | **All senior unsecured** | **No collateral pledged** | see §6 note | 86.7% fixed / 13.3% floating of the $1,500.0m principal | `Q2 FY26 10-Q, Note 10` and balance sheet |
| *Memo:* finance / capital lease obligations (NOT in the Note 10 total) | **17.8** at 31-Dec-2025 | Operating subsidiaries | **Yes** (the leased asset) | Senior | Leased production facilities and equipment | weighted-average remaining term **12 years** | 6.0% imputed | `CIQ Financials → Capital Structure Details` (FY2025 block); `FY24 10-K, Note 17 (Leases)` — $18.0m at 31-Dec-2024, discount rate 6.0% |
| *Memo:* total principal excluding issuance costs | **1,500.0** | — | — | — | — | — | — | `Q2 FY26 10-Q, Note 10` maturity table |

**Notes on the stack.**

- **Nothing in the corporate debt stack is secured.** Every instrument is senior unsecured and no collateral is pledged; the revolver shares no security package with the notes because there is no security package [`Q2 FY26 10-Q, Note 10`]. The only "secured" debt Capital IQ shows — $140.5m of "Total Secured Debt" at 30-Jun-2026 — is the lease liabilities, secured only by the leased assets themselves [`CIQ Financials → Capital Structure Summary`].
- **Finance leases are not separately disclosed at 30 June 2026.** The 10-Q's supplemental balance-sheet note itemises operating leases but not finance leases, which sit inside "Other current liabilities" ($111.6m) and "Other non-current liabilities" ($34.0m) [`Q2 FY26 10-Q, Note 8`]. The latest separately disclosed figure is **$17.8m at 31-Dec-2025** [`CIQ Financials → Capital Structure Details`], versus $18.0m at 31-Dec-2024 [`FY24 10-K, Note 17`]. Adding it to the filing-basis total gives roughly **$1,510m** of gross debt including finance leases — *approximately $17.8m of that is a 31-Dec-2025 carry-forward, not a 30-Jun-2026 disclosure. Inference, not from filings.* At 1.2% of gross debt it does not move any ratio in this report.
- **Rate mix:** $1,300.0m fixed (**86.7%** of the $1,500.0m principal), $200.0m floating (**13.3%**). Cross-currency swaps of $350.5m notional exist but hedge currency, not interest rate [`Q2 FY26 10-Q, Note 9`]. Refinancing cost and the maturity ladder belong to `02_maturity-wall-and-refinancing`.
- **Change-of-control puts and cross-default terms: Not disclosed in the data pool.** The indenture covenants that *are* disclosed restrict merger/consolidation, liens and sale-and-leaseback [`Q2 FY26 10-Q, Note 10`]. A **rating-linked pricing step does exist** — the credit-facility applicable margin can be set off nVent's public debt rating [`Q2 FY26 10-Q, Note 10`] — but no rating-agency report is in this pool, so no rating is asserted here.

---

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| **Operating leases** | **140.5** (current 33.0 + non-current 107.5) | **US GAAP — kept OFF the debt line.** Recognised as right-of-use assets ($132.8m) with lease liabilities inside "Other current liabilities" and "Other non-current liabilities", not inside Note 10 total debt. Under IFRS 16 these would be capitalised into debt; nVent does not report under IFRS. Capital IQ's lease-inclusive $1,632.9m total debt is exactly $1,492.4m + $140.5m. Weighted-average discount rate 5.1%, remaining term 5 years | `Q2 FY26 10-Q, Note 8 (Supplemental Balance Sheet Information)`; `FY24 10-K, Note 17 (Leases)`; `CIQ Financials → Capital Structure Summary` |
| **Finance leases** | **17.8** at 31-Dec-2025 (18.0 at 31-Dec-2024) | Debt-like and on balance sheet, but excluded from the Note 10 debt total; sits in Other liabilities. Secured on the leased assets. Not separately disclosed at 30-Jun-2026 | `CIQ Financials → Capital Structure Details`; `FY24 10-K, Note 17` |
| **Pension / OPEB underfunding** | **128.6** at 31-Dec-2024 (pension obligation 120.3 less plan assets 3.1 = 117.2 underfunded; post-retirement health plan 11.4 wholly unfunded). Balance-sheet liability "Pension and other post-retirement compensation and benefits" **133.3** at 30-Jun-2026 | Largely **unfunded, pay-as-you-go** — plan assets of $3.1m cover 2.6% of the pension obligation. Not interest-bearing debt, but a real cash claim. FY2025 audited benefit-plan note is not in this pool; the FY2024 10-K is the latest audited read | `FY24 10-K, Note 13 (Benefit Plans)` — obligations and funded status table; `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` |
| **Preferred equity** | **None** | Only ordinary shares, $0.01 par, 400.0m authorised, 161.9m issued at 30-Jun-2026. No preferred class exists, so no prior-ranking equity claim | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` |
| *Memo — contingent, not yet a liability:* Maverick Power earnout | **up to 550.0** | Contingent consideration tied to 2027–2028 performance on a deal not yet closed. Not on the 30-Jun-2026 balance sheet. Sized here so downstream agents carry it; `05_off-balance-sheet-and-contingencies` owns it | `nVent news release, 2026-08-24` |

Guarantees, letters of credit and bank guarantees ($102.0m face value at 30-Jun-2026, `Q2 FY26 10-Q, Note 15`) are named here only so they are not lost; they belong to `05_off-balance-sheet-and-contingencies`.

---

## 3. Cash & Liquid Assets

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | **256.0** | See the trapped-cash row | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` (also $237.5m at 31-Dec-2025) |
| Liquid short-term investments | **0.0 — none** | n/a | `CIQ Financials → Balance Sheet`: "Total Cash & ST Investments" 256.0 = cash and equivalents 256.0, with no separate short-term-investment line in any of the six periods FY2021–Jun-2026 |
| **Restricted / trapped cash (flag)** | **79.6 of the 256.0 (31.1%)** | **Yes — effectively trapped.** The company's own words: "$256.0 million of cash on hand, of which **$79.6 million is held in certain countries in which the ability to repatriate is limited due to local regulations or significant potential tax consequences**." This is up from $53.2m of $131.2m (40.5%) at 31-Dec-2024 | `Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`; `FY24 10-K, MD&A, Liquidity and Capital Resources` |
| Freely usable cash (memo) | **176.4** | 256.0 − 79.6 | derived from the two rows above |
| Committed undrawn revolver (memo — NOT cash; `03_liquidity-runway` owns it) | 600.0 | Committed, not borrowing-base; $0 drawn; full capacity available at 30-Jun-2026 | `Q2 FY26 10-Q, Note 10` |

**Because there are no short-term investments, the strict and broad §15 net-debt bases give the same number.** That is unusual and it is helpful: it removes the most common place a leverage figure gets flattered. The trapped-cash flag is the live issue instead — netting all $256.0m against debt assumes cash that cannot cheaply cross a border is available to repay it. Both versions are shown below.

---

## 4. Gross & Net Debt

USD millions at 30 June 2026.

| Metric | Value | Source |
|---|---:|---|
| **Gross debt (filing basis — Note 10 total debt)** | **1,492.4** | `Q2 FY26 10-Q, Note 10 (Debt)` |
| − Cash & equivalents | (256.0) | `Q2 FY26 10-Q, balance sheet` |
| **Net debt (strict, §15) — CANONICAL** | **1,236.4** | 1,492.4 − 256.0 |
| − Liquid short-term investments | (0.0) — none exist | `CIQ Financials → Balance Sheet` |
| **Net debt (broad, incl. investments)** | **1,236.4 — identical to strict**, because there are no short-term investments to net | same |
| *Memo:* net debt strict, excluding the $79.6m of cash that cannot be readily repatriated | **1,316.0** | 1,492.4 − (256.0 − 79.6) — the conservative read (MODULE_RULES: usable cash must exclude trapped cash) |
| *Memo:* gross debt including finance leases (latest disclosed, 31-Dec-2025) | **~1,510.2** | 1,492.4 + 17.8 — *the lease figure is a 31-Dec-2025 carry-forward. Inference, not from filings* |
| *Memo — vendor basis, cited as the vendor:* Capital IQ total debt 1,632.9, net debt **1,376.9** | 1,376.9 | `CIQ Financials → Balance Sheet`; `ciq_facts.json` `total_debt_m` 1,632.9 / `net_debt_m` 1,376.9. This is the **broad-in-a-different-sense** figure: it adds the $140.5m of operating leases to debt. 1,492.4 + 140.5 − 256.0 = 1,376.9 exactly — reconciled to the cent, not a misread |

**Reconciliation to `ciq_facts.json` (required).** The sidecar reports net debt **$1,376.9m** and net debt / LTM EBITDA **1.28x**. Both are accepted as accurate reads of the workbook and neither is overridden. The entire $140.5m gap to this report's $1,236.4m is operating-lease liabilities, which US GAAP keeps off the debt line — an itemised definitional difference, reconciled above. The `ciq_facts.json` `source_ref` itself instructs the reader to "confirm vs the strict total-debt−cash basis, §15"; that confirmation is the $1,236.4m line.

**Designated canonical figure for every downstream agent in this module: net debt $1,236.4m, strict §15 basis, filing debt note, at 30 June 2026.** Strict is the default and no reason exists to depart from it here (there are no short-term investments, so broad adds nothing). Any agent quoting $1,376.9m must label it "Capital IQ lease-inclusive vendor basis"; any agent quoting $1,316.0m must label it "strict, excluding trapped cash".

---

## 5. Leverage Ratios

**EBITDA figures used, and their basis:**

| EBITDA measure | Value | Basis and cycle position | Source |
|---|---:|---|---|
| **Reported EBITDA, LTM to 30-Jun-2026** | **1,074.6** | Standardised GAAP-derived EBITDA on **continuing operations** (operating income 842.7 + D&A 231.9). **PEAK / latest.** Independently rebuilt from the filings: FY2025 840.5 − H1'25 (286.7 + 92.3 D&A = 379.0) + H1'26 (496.4 + 116.4 D&A = 612.8) = 1,074.3, which ties to the vendor's 1,074.6 within rounding | `ciq_facts.json` `ltm_ebitda_m` = 1,074.6 [`CIQ Financials → Income Statement`, LTM 12 months Jun-30-2026]; rebuild from `Q2 FY26 10-Q` income statement and cash flow statement, and `Q1 FY26 ppt` FY2025 reconciliation |
| **Company adjusted EBITDA, LTM to 30-Jun-2026** | **1,061.5** | Company-defined non-GAAP: adjusted operating income (which excludes restructuring and other, acquisition transaction and integration costs, intangible amortisation, and the $25.8m IEEPA tariff reimbursement) plus depreciation. **PEAK / latest.** Built as Q3'25 230.1 + Q4'25 226.0 + Q1'26 265.3 + Q2'26 340.1. **The Q2'26 component of $340.1m is computed by this agent, not disclosed** — no Q2 FY26 deck is in the pool; it is adjusted operating income of $322.7m (which ties exactly to reportable segment income $357.0m less Enterprise and other $34.3m) plus Q2 depreciation of $17.4m (H1 34.2 − Q1 16.8). *Inference from filed tables, not a company-published figure* | `Q1 FY26 ppt`, GAAP-to-non-GAAP reconciliations (FY2025 quarters and Q1 2026); `Q2 FY26 10-Q, Note 13 (Segment Information)` reconciliation table and Statements of Cash Flows |
| **Normalised / mid-cycle EBITDA** | **863.6** | Three-year average of the company's own reported EBITDA on the current, post-acquisition asset base: (FY2024 675.6 + FY2025 840.5 + LTM Jun-26 1,074.6) ÷ 3. **MID-CYCLE / NORMALISED.** Chosen over a five-year average because FY2021–FY2023 pre-date $2.77bn of acquisitions (ECM, Trachte, Electrical Products Group) and describe a materially smaller company; chosen over holding revenue flat and cutting the margin because `earnings/03_margin-drivers` and `07_business-quality` locate the cyclicality in **volume**, not margin (EBITDA margin has moved only 19.7% → 22.2% across the whole window). *This is a labelled normalisation, not a forecast* | `CIQ Financials → Income Statement`, EBITDA row FY2024 / FY2025 / LTM Jun-30-2026; cyclicality read from `business-model/07_business-quality` §Cyclicality (30/100) and `earnings/02_revenue-drivers` §4a |

**The ratios.** Formulas shown; every number reproducible.

| Ratio | On Reported EBITDA (peak, 1,074.6) | On Adjusted EBITDA (peak, 1,061.5) | Source |
|---|---:|---:|---|
| **Gross debt / EBITDA** | **1.39x** (1,492.4 ÷ 1,074.6) | **1.41x** (1,492.4 ÷ 1,061.5) | `Q2 FY26 10-Q, Note 10` ÷ EBITDA sources above |
| **Net debt / EBITDA — strict §15 basis (canonical)** | **1.15x** (1,236.4 ÷ 1,074.6) | **1.16x** (1,236.4 ÷ 1,061.5) | as above |
| Net debt / EBITDA — strict, excluding trapped cash | 1.22x (1,316.0 ÷ 1,074.6) | 1.24x (1,316.0 ÷ 1,061.5) | conservative variant |
| *Memo:* net debt / EBITDA — Capital IQ lease-inclusive vendor basis | 1.28x (1,376.9 ÷ 1,074.6) | 1.30x (1,376.9 ÷ 1,061.5) | `ciq_facts.json` `net_debt_ebitda_x` 1.28x — matches this report exactly on the vendor's own basis |
| **Debt / capital** | **27.2%** (1,492.4 ÷ (1,492.4 + 3,986.9)) | (n/a) | `Q2 FY26 10-Q, Note 10` and balance sheet total equity 3,986.9. *Memo, vendor lease-inclusive basis:* 29.1% (1,632.9 ÷ 5,619.8) [`CIQ Financials → Capital Structure Summary`, which prints 29.06%] |
| **Debt / equity** | **37.4%** (1,492.4 ÷ 3,986.9) | (n/a) | as above |

**Cyclical overlay — required, because this is a cyclical name.** `business-model/07_business-quality` scores cyclicality **30/100** (reverse-mapped; the lowest of its twelve rows) and quotes the company's own risk factors: "We expect to experience fluctuations in revenues and results of operations due to economic and business cycles." `earnings/02_revenue-drivers` §4a: "Q2 FY26 revenue is a peak-of-cycle print, not a normalised base."

| Ratio | On latest EBITDA — **PEAK** | On normalised / mid-cycle EBITDA (863.6) — **MID-CYCLE** | Delta |
|---|---:|---:|---:|
| Gross debt / EBITDA | 1.39x (reported) | **1.73x** (1,492.4 ÷ 863.6) | +0.34x |
| Net debt / EBITDA (strict, canonical) | 1.15x (reported) | **1.43x** (1,236.4 ÷ 863.6) | +0.28x |

**Read it this way:** the headline 1.15x is the *floor* on leverage, not the central estimate. On the normalised EBITDA the same balance sheet carries **1.43x**. Both numbers are low in absolute terms — the gap between them is 0.28 turns, not two turns — so the cyclical adjustment sharpens the picture without changing its character. Management's own quoted figure is consistent: "We exited the quarter with net leverage of 1.2x, well below our target range of 2 to 2.5x" [`Q2 FY26 transcript, 2026-07-31, prepared remarks (CFO)`]. That 1.2x is a management figure on a call; the filing-derived strict figure is 1.15x on reported EBITDA and 1.16x on adjusted, and the covenant-definition version (which caps cash netting at $250.0m) belongs to `04_coverage-and-covenants`.

### 5A. Pro-forma for Maverick Power — **LABELLED PRO-FORMA, NOT A REPORTED FIGURE**

Every number in this sub-section is pro-forma and rests on an assumption the pool does not contain. Announced 24 August 2026; expected to close Q4 2026, subject to regulatory approval; **$1.75bn cash purchase price plus up to $550m contingent consideration** tied to 2027–2028 performance; funding stated only as "a combination of available cash on hand and new debt," with **committed bridge financing from Bank of America**. Mix, tenor and pricing: **not disclosed in the data pool** [`nVent news release, 2026-08-24`].

**A convenient fact that removes one assumption:** whether the $1.75bn is paid from cash or from new debt changes **gross** debt but not **net** debt — a dollar of cash spent is a dollar of net debt added, exactly as a dollar borrowed is. So the pro-forma net-debt figure below is robust to the funding mix; only the gross-debt line depends on it.

| Pro-forma line (all *Inference, not from filings*) | Value | Build |
|---|---:|---|
| Net debt, strict basis, at 30-Jun-2026 (reported) | 1,236.4 | §4 above |
| + Maverick cash consideration | 1,750.0 | `nVent news release, 2026-08-24` |
| **= Pro-forma net debt (pre-earnout)** | **2,986.4** | additive, mix-independent |
| Pro-forma gross debt, if fully debt-funded (bound) | 3,242.4 | 1,492.4 + 1,750.0, cash unchanged at 256.0 |
| Pro-forma gross debt, if the $176.4m of freely usable cash is spent first | 3,066.0 | 1,492.4 + 1,573.6, cash falls to 79.6 (the trapped balance) |
| Maverick's implied 2026 adjusted EBITDA | **~152.2** | $1,750.0m ÷ 11.5x, from the release's own "approximately 11.5 times anticipated 2026 adjusted EBITDA" (10.5x after the present value of expected tax benefits, i.e. ~$166.7m on that basis) |
| **Pro-forma net debt / EBITDA — reported basis** | **~2.43x** | 2,986.4 ÷ (1,074.6 + 152.2 = 1,226.8) |
| **Pro-forma net debt / EBITDA — company adjusted basis** | **~2.46x** | 2,986.4 ÷ (1,061.5 + 152.2 = 1,213.7) |
| Pro-forma net leverage if the full $550m earnout is later paid | ~2.88x | (2,986.4 + 550.0) ÷ 1,226.8 |
| Pro-forma net leverage on **normalised / mid-cycle** EBITDA | **~2.94x** | 2,986.4 ÷ (863.6 + 152.2 = 1,015.8) |

**Two basis warnings that must travel with these figures (§15).** (a) The denominators add nVent's **trailing twelve-month** EBITDA to Maverick's **anticipated full-year 2026** EBITDA — a trailing figure plus a forward figure. That mismatch flatters nothing in particular but is a mixed basis and must be stated wherever the number is quoted. (b) Holding nVent's LTM EBITDA static while adding a full year of Maverick is a **bound, not a forecast**: FY2026 consensus EBITDA is $1,225.0m [`CIQ Estimates → Consensus`, FY2026], so on a forward denominator the same net debt gives roughly 2.17x. The pro-forma range worth carrying downstream is therefore **~2.2x to ~2.9x** depending on whether the denominator is forward, trailing, or normalised, and on whether the earnout is paid.

For orientation only, not a headroom computation (`04_coverage-and-covenants` owns that): the disclosed maximum net-leverage covenant is **3.75x**, electively **4.25x for four testing periods in connection with certain material acquisitions** [`Q2 FY26 10-Q, Note 10`]. Every pro-forma figure above sits below both.

---

## 6. Leverage Trend

Strict §15 basis throughout; total debt from the company's **own debt note** at each date, cash from the balance sheet, EBITDA from `CIQ Financials → Income Statement` (continuing-operations basis).

| Metric | FY2023 (31-Dec-2023) | FY2024 (31-Dec-2024) | FY2025 (31-Dec-2025) | Latest (30-Jun-2026) | Direction |
|---|---:|---:|---:|---:|---|
| Total debt (filing debt note) | 1,780.7 | 2,155.0 | 1,559.8 | 1,492.4 | Down 30.7% from the FY2024 peak |
| Cash & equivalents | 179.6 | 131.2 | 237.5 | 256.0 | Rising |
| **Net debt (strict, §15)** | **1,601.1** | **2,023.8** | **1,322.3** | **1,236.4** | **Falling — down $787.4m (−38.9%) from the FY2024 peak** |
| Reported EBITDA (continuing ops) | 561.5 | 675.6 | 840.5 | 1,074.6 (LTM) | Rising in every period |
| **Net debt / EBITDA (strict)** | **2.85x** | **3.00x** | **1.57x** | **1.15x** | **Falling — 1.85 turns off the FY2024 peak** |
| Gross debt / EBITDA | 3.17x | 3.19x | 1.86x | 1.39x | Falling |

Sources: FY2023 and FY2024 debt totals `FY24 10-K, Note 10 (Debt)` ($2,155.0m and $1,780.7m); FY2025 debt total `Q2 FY26 10-Q, Note 10` comparative column ($1,559.8m); 30-Jun-2026 `Q2 FY26 10-Q, Note 10`. Cash from the same filings' balance sheets. EBITDA from `CIQ Financials → Income Statement` (FY2022 and FY2023 columns carry a "Reclassified" stamp).

**A matched-basis caveat on the two oldest ratios (§15), stated because it cuts against the flattering direction of the trend.** The FY2023 and FY2024 ratios put **total** debt over **continuing-operations** EBITDA. But part of that debt was funding the Thermal Management segment, which was still owned then and whose earnings are excluded from the continuing-ops EBITDA line. So 2.85x and 3.00x **overstate** the leverage actually carried at the time on a like-for-like basis. The deleveraging from FY2024 to today is real, but it is smaller than the raw 3.00x → 1.15x move suggests, because a chunk of that move is a change in what the denominator counts, not a change in the balance sheet.

**Direction and drivers, in three sentences.** Leverage is **falling, and fast**: strict net debt / EBITDA went 3.00x (FY2024) → 1.57x (FY2025) → 1.15x (LTM Jun-2026), and net debt itself fell $787.4m from the FY2024 peak. Two drivers, in order of size: (1) the **sale of Thermal Management** for $1.65bn, agreed 31-Jul-2024 and closed 30-Jan-2025, which put $1,584.6m of investing inflows from discontinued operations into H1 2025 and funded **$866.3m** of long-term-debt repayment in that half alone [`Q2 FY26 10-Q, Statements of Cash Flows, six months ended June 30, 2025`; `FY24 10-K, Item 1 and Note 6`]; and (2) **EBITDA growth**, which nearly doubled the denominator — reported EBITDA rose from $675.6m (FY2024) to $1,074.6m (LTM Jun-2026), +59.1%, on revenue up from $3,006.1m to $4,834.0m [`CIQ Financials → Income Statement`]. Deleveraging by ordinary repayment has been a distant third: $68.3m of long-term debt repaid in H1 2026 (nearly $70m of the prepayable term loan in Q2 alone, per the CFO), against $118m returned to shareholders in the same half ($50.4m of buybacks, $68.2m of dividends) [`Q2 FY26 10-Q, Statements of Cash Flows`; `Q2 FY26 transcript, 2026-07-31, prepared remarks`].

**The number that disagrees with the falling trend, named (§3).** The denominator doing most of the work is at a cyclical peak, and the acquisition programme has not stopped. `business-model/11_capital-allocation-governance` scores the debt-level-and-trajectory row **30/100 severity** and records $3,017m of acquisition cash over FY2021–FY2025 against $2,091m of cumulative free cash flow — deals consuming more than everything the business generated. Management has said the current level is *below* where it wants to be: 1.2x is "well below our target range of 2 to 2.5x, providing ample flexibility to invest in growth and acquisitions" [`Q2 FY26 transcript, 2026-07-31`]. So the honest read is that leverage has fallen sharply and is stated by management as **intended to rise again**, with Maverick the first instalment (§5A: ~2.4x pro-forma). The trend is down; the trajectory is not.

---

## 6A. HoldCo / OpCo & Structural Subordination

**Applicable.** Every dollar of the corporate debt is issued or guaranteed at holding-company level, and none of it is guaranteed by the operating subsidiaries.

| Item | Evidence | Why It Matters |
|---|---|---|
| **Where the debt sits (HoldCo vs OpCo)** | The **Obligor Group** is three holding companies: **nVent Electric plc** (the listed Irish parent — "a holding company that has no independent assets or operations unrelated to its investments in consolidated subsidiaries"), **nVent Finance S.à r.l.** (the Luxembourg issuer of all three note series — likewise a holding company whose only activity is its investments and "the issuance of the Notes and other external debt"), and **Hoffman Schroff Holdings, Inc.** (a US holding company, 100%-owned indirect subsidiary, also with no independent operations). A **February 2026 supplemental indenture** made nVent Electric plc and Hoffman Schroff Holdings full, unconditional, **joint-and-several guarantors** of nVent Finance's Notes. The Senior Credit Facilities were entered into by the same three entities in June 2025 [`Q2 FY26 10-Q, Note 10`] | **Structural subordination is real and disclosed.** The 10-Q says it plainly: "None of the other subsidiaries of any of the Obligor Group are under any direct obligation to pay or otherwise fund amounts due on the Notes or the guarantees, whether in the form of dividends, distributions, loans or other payments." All the debt sits above the operating companies; all the trade creditors, employees and tax authorities of those operating companies rank ahead of it on those companies' own assets. The February 2026 guarantee upgrade **improves** this — it puts the parent's and the US holding company's balance sheets behind the Notes — but it does not push the claim down to the operating level |
| **Upstreaming constraints (dividend blockers, regulatory)** | Two disclosures, pulling opposite ways, and both must be carried. **Permissive:** "There are **no significant restrictions** on the ability of nVent Electric plc to obtain funds from its subsidiaries by dividend or loan. None of the assets of nVent Electric plc or its subsidiaries represents **restricted net assets** pursuant to the guidelines established by the Securities and Exchange Commission." **Restrictive:** "there may be **statutory and regulatory limitations on the payment of dividends from certain subsidiaries** of the Obligor Group. If such subsidiaries are unable to transfer funds to the Obligor Group and sufficient cash or liquidity is not otherwise available, the Obligor Group may not be able to make principal and interest payments on their outstanding debt" [both `Q2 FY26 10-Q, Note 10`] | **Can the HoldCo service its own debt?** Its only sources are dividends from subsidiaries (nVent Electric plc), interest income from subsidiaries (nVent Finance and Hoffman Schroff), and the group revolver. On the SEC's own restricted-net-assets test the answer is yes with no significant restriction — the strongest single piece of evidence available here, because it is a filing-grade test rather than a management adjective. The residual risk is the company's own hedged sentence about statutory limits in "certain subsidiaries", which is not quantified in the pool. **Not a cap:** the disclosure exists and the SEC restricted-net-assets test is clean, so the MODULE_RULES cap for "HoldCo has material debt but upstreaming constraints unclear" does **not** bind |
| **Material restricted / trapped cash** | **$79.6m of the $256.0m of cash (31.1%) is "held in certain countries in which the ability to repatriate is limited due to local regulations or significant potential tax consequences"** [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`]. Prior year: $53.2m of $131.2m (40.5%) [`FY24 10-K, MD&A`]. Geographic revenue mix at FY2025 was Americas 81%, EMEA 15%, Asia-Pacific 4% [`ciq_facts.json` `geographic`, CIQ Segments] | **Net debt is understated by up to $79.6m if that cash cannot be moved to the Obligor Group.** Netting it against HoldCo debt assumes free movement the filing explicitly qualifies. Strict net debt excluding it is **$1,316.0m** and net leverage **1.22x** rather than 1.15x — a 0.07-turn effect, so it changes the reading in principle but not in magnitude at today's leverage. It matters more in a stressed case, where the freely usable cash is $176.4m, not $256.0m; `03_liquidity-runway` and `06_downside-stress-test` must use the $176.4m figure. Note also the covenant's own answer to this question: it caps cash netting at **$250.0m** regardless [`Q2 FY26 10-Q, Note 10`] |

---

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

**Use these verbatim. Any departure must be labelled with its own basis.**

| Anchor | Value | Basis label — carry this with the number |
|---|---:|---|
| **Reporting currency** | **USD, millions** | US GAAP; fiscal year ends 31 December; balance-sheet date **30 June 2026** |
| **Gross debt** | **1,492.4** | Filing basis — `Q2 FY26 10-Q, Note 10 (Debt)`. Total principal $1,500.0m before $7.6m of issuance costs/discounts. **Excludes** $140.5m of operating leases (US GAAP keeps them off the debt line) and ~$17.8m of finance leases |
| **Net debt — CANONICAL** | **1,236.4** | **Strict §15 basis** (gross debt − cash & equivalents). Broad basis is **identical**, because nVent holds **no** short-term investments. This strict figure is the module's designated canonical net debt |
| Net debt — conservative variant | 1,316.0 | Strict basis **excluding the $79.6m of cash that cannot be readily repatriated**. Use this in `03_liquidity-runway` and `06_downside-stress-test` |
| Net debt — vendor variant (do not headline) | 1,376.9 | **Capital IQ lease-inclusive vendor basis** [`ciq_facts.json`, `CIQ Financials → Balance Sheet`]. Reconciles exactly: 1,492.4 + 140.5 leases − 256.0 |
| **Cash & liquid investments** | **256.0** cash; **0.0** short-term investments; **176.4** freely usable | `Q2 FY26 10-Q` balance sheet and MD&A. $79.6m (31.1%) trapped. The $600.0m undrawn committed revolver is **liquidity, not cash** — `03_liquidity-runway` owns it |
| **EBITDA base — reported** | **1,074.6** | LTM to 30-Jun-2026, continuing operations, GAAP-derived. **Cycle position: PEAK / latest** |
| **EBITDA base — company adjusted** | **1,061.5** | LTM to 30-Jun-2026. **Cycle position: PEAK / latest.** *The Q2 FY26 component ($340.1m) is computed by this agent from the 10-Q's own segment-reconciliation and cash-flow tables, not published by the company — no Q2 deck is in the pool. Carry this caveat* |
| **EBITDA base — normalised / mid-cycle** | **863.6** | Three-year average of reported EBITDA (FY2024 675.6, FY2025 840.5, LTM 1,074.6). **Cycle position: MID-CYCLE / NORMALISED.** *A labelled normalisation, not a forecast* |
| **Net debt / EBITDA — reported** | **1.15x** | 1,236.4 ÷ 1,074.6, strict basis, **peak EBITDA** |
| **Net debt / EBITDA — adjusted** | **1.16x** | 1,236.4 ÷ 1,061.5, strict basis, **peak EBITDA** |
| **Net debt / EBITDA — mid-cycle** | **1.43x** | 1,236.4 ÷ 863.6, strict basis, **normalised EBITDA** |
| **Gross debt / EBITDA** | **1.39x** reported · **1.41x** adjusted · **1.73x** mid-cycle | as built in §5 |
| Debt / capital · Debt / equity | **27.2%** · **37.4%** | Filing debt basis over total equity $3,986.9m |
| Fixed / floating mix | **86.7% fixed** ($1,300.0m notes) / **13.3% floating** ($200.0m term loan) of $1,500.0m principal | `Q2 FY26 10-Q, Note 10`. Cross-currency swaps $350.5m notional hedge currency, not rate [`Note 9`] |
| Security | **100% senior unsecured; no collateral pledged** | `Q2 FY26 10-Q, Note 10`. Only the leases are "secured", and only on the leased assets |
| **Pro-forma for Maverick Power — LABELLED PRO-FORMA, NOT REPORTED** | net debt **~2,986.4**; net leverage **~2.43x** reported / **~2.46x** adjusted / **~2.94x** mid-cycle; **~2.88x** if the full $550m earnout is paid; **~2.17x** on FY2026 consensus EBITDA of $1,225.0m | *Inference, not from filings.* $1.75bn cash consideration added to net debt (mix-independent); denominator adds Maverick's implied ~$152.2m 2026 adjusted EBITDA (from the release's own 11.5x). Financing mix, tenor and pricing **not disclosed in the data pool**; Bank of America committed bridge financing in place; expected close Q4 2026 [`nVent news release, 2026-08-24`] |

**Caveats every downstream agent must propagate.**
1. **Both EBITDA bases are at a cyclical peak.** Any single-year leverage figure quoted without the 1.43x mid-cycle counterpart understates fragility (MODULE_RULES Calculation Standard 4).
2. **The adjusted-EBITDA figure of $1,061.5m contains a $340.1m Q2 FY26 component computed by this agent** from filed tables, because no Q2 FY26 reconciliation deck exists in the pool. It ties to management's stated 1.2x net leverage, which is corroboration but not publication.
3. **Every Maverick figure is pro-forma and rests on an undisclosed financing mix.** Never present it as reported. The purchase price is a fact from the release; the leverage that results is arithmetic on an assumption.
4. **$79.6m of the cash is effectively trapped.** Do not net it silently.
5. **No credit-rating-agency report is in this pool.** Management's stated "intent to maintain investment grade metrics" [`Q2 FY26 10-Q, MD&A`] is management language, not an agency action — do not infer or assert a rating from it.
6. **The FY2025 Form 10-K is absent from this pool.** FY2025 audited lease, pension and contingency detail is read through the Capital IQ export or the FY2024 10-K, and is cited as such — never under an FY2025 filing's name.

**On the level itself (MODULE_RULES Core Principle 8; CLAUDE.md §24, Filter 3).** nVent is **not** net cash — net debt is $1,236.4m — so the net-cash treatment does not apply. What the numbers do show is a balance sheet that has taken 1.85 turns of net leverage off its FY2024 peak, carries no secured debt, has nothing pledged, holds an undrawn $600.0m committed revolver, and runs 86.7% fixed-rate. This report states those levels and their trend; it makes **no solvency verdict** — that is `99_balance-sheet-survival-synthesis`'s job. The maturity ladder belongs to `02`, liquidity to `03`, coverage and covenant headroom to `04`, contingencies to `05`, and the downside stress to `06`.
