# Off-Balance-Sheet & Contingencies — NVT

**Company:** nVent Electric plc (NYSE: NVT) · **Reporting currency: USD, in millions** · **Reporting standard: US GAAP** · **Fiscal year ends 31 December** · **Balance-sheet date: 30 June 2026** [`Q2 FY26 10-Q, filed 2026-07-31`]

**Three framing points before the tables.**

1. **What "off-balance-sheet" means under US GAAP here.** nVent keeps operating leases OFF the debt line (IFRS 16 would capitalise them; nVent does not report under IFRS). So the single largest debt-like item in this report — $140.5m of operating-lease liabilities — is *on* the balance sheet but *outside* the $1,492.4m debt stack that `01_capital-structure-and-leverage` designated as canonical. Every row below states which of the two debt bases already contains it.
2. **Two dates are mixed and both are labelled.** The freshest filing is the Q2 FY26 10-Q at 30 June 2026. The FY2025 Form 10-K is **not in this data pool** [`00_solvency-data-triage`, §2], so the FY2025 audited lease, pension and contingency detail is read through the Capital IQ workbook (a tier-5 vendor export) or the FY2024 10-K, and is cited as such — never under an FY2025 filing's name (CLAUDE.md §5).
3. **The biggest contingent number is post-balance-sheet.** The Maverick Power earnout of **up to $550.0m** arises from an agreement signed **24 August 2026**, nearly two months after the balance-sheet date. It is not a liability anywhere yet. It is carried separately, labelled post-balance-sheet on every line, and never summed silently into a 30-June figure.

**No securitization, factoring, receivable-sale, variable-interest-entity or "off-balance sheet arrangements" disclosure exists anywhere in this pool.** A search of the full frozen corpus for `securitiz`, `factoring`, `sale of receivable`, `variable interest entit` and `off-balance sheet` returns **zero** hits [`<GENERATION_ROOT>/corpus.txt`, full-text search, 2026-09-07]. That is a genuine absence, not an extraction failure — recorded as nil, not as unknown.

---

## 1. Off-Balance-Sheet / Debt-Like Obligations

**Reporting currency: USD, millions.** "Recognized" = the amount booked on the balance sheet. "Maximum / gross" = the same obligation before discounting, or the stated cap.

| Item | Recognized Liability | Maximum / Gross Exposure | Already in `01`'s debt? | Source |
|---|---:|---:|---|---|
| **Operating leases** (office, production, distribution, warehouses, sales offices, fleet, equipment) | **140.5** at 30-Jun-2026 (current 33.0 + non-current 107.5); 135.3 at 31-Dec-2025; 113.1 at 31-Dec-2024 | **~171.4** undiscounted at 30-Jun-2026 — *scaled, see note below*. Last **disclosed** undiscounted totals: **165.1** at 31-Dec-2025 (136.1 due in 5 years + 29.0 thereafter) and **145.3** at 31-Dec-2024 (against 113.1 recognized) | **No** to `01`'s canonical filing-basis debt of $1,492.4m (US GAAP keeps operating leases off the debt line). **Yes** to the Capital IQ vendor basis of $1,632.9m, which is exactly $1,492.4m + $140.5m — so anyone quoting the vendor's net debt of $1,376.9m has already counted this row | `Q2 FY26 10-Q, Note 8 (Supplemental Balance Sheet Information)`; `FY24 10-K, Note 17 (Leases)` maturity table; `CIQ Financials → Capital Structure Summary` (31-Dec-2025 undiscounted schedule) |
| **Finance leases** (production facilities and equipment; secured on the leased asset) | **17.8** at 31-Dec-2025 — **a carry-forward, not a 30-Jun-2026 disclosure** (see the resolution below). 18.0 at 31-Dec-2024 | **30.5** undiscounted at 31-Dec-2024 against 18.0 recognized — a ratio of **1.69x**, because the leases run a weighted-average **12 years** at a **6.0%** imputed rate, so $12.5m of the gross figure is imputed interest | **No** — in neither `01`'s $1,492.4m nor the vendor's $1,632.9m at 30-Jun-2026. `01` showed a memo gross-debt figure of ~$1,510.2m including it | `FY24 10-K, Note 17 (Leases)` — maturity table and supplemental balance-sheet table; `CIQ Financials → Capital Structure Summary` (Total Lease Liabilities row) |
| **Pension underfunding** (one domestic-reported defined-benefit plan, essentially unfunded) | **119.7** at 31-Dec-2025 (projected benefit obligation 122.7 − plan assets 3.0). 117.2 at 31-Dec-2024 | **122.7** — the gross projected benefit obligation at 31-Dec-2025. Plan assets of **3.0** cover **2.4%** of it, so the gross and the net are nearly the same number. Near-term cash call is small: company-estimated contributions for the **next year of 6.6** | **No** — not interest-bearing debt and not in either debt basis. Sits in the balance-sheet line "Pension and other post-retirement compensation and benefits" of **133.3** at 30-Jun-2026 | `CIQ Financials → Pension OPEB tab` (FY2025 column — vendor export, the FY2025 10-K is absent from this pool); `FY24 10-K, Note 13 (Benefit Plans)` for the FY2024 figures; `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` for the 133.3 line |
| **OPEB (post-retirement health) underfunding** | **11.1** at 31-Dec-2025 — **wholly unfunded, pay-as-you-go**; 11.4 at 31-Dec-2024 | **11.1** — identical, because there are no plan assets at all. Estimated payments of **1.1** in each of the next five years | **No** — same line as above | `CIQ Financials → Pension OPEB tab` (FY2025); `FY24 10-K, Note 13 (Benefit Plans)` |
| **Securitization / factoring / receivable sales / VIEs** | **Nil — none exist** | **Nil** | n/a | `<GENERATION_ROOT>/corpus.txt` — zero hits across all 15 pool sources for `securitiz`, `factoring`, `sale of receivable`, `variable interest entit`, `off-balance sheet` |
| **Purchase / take-or-pay commitments** (raw materials, all significant terms confirmed) | **Nil** — a commitment, not a booked liability | **66.7 for calendar 2025**; "contractual purchase obligations beyond 2025 are not material". **No 2026 figure exists in this pool** — that disclosure lives in the FY2025 10-K, which is absent. **Flagged as stale, not filled in** | **No** | `FY24 10-K, MD&A, "Material contractual cash requirements"` |
| **Uncertain tax positions** (gross liability for tax positions taken) | **9.4** at 30-Jun-2026; 10.3 at 31-Dec-2025; 11.7 gross at 31-Dec-2024 | **11.7** gross at 31-Dec-2024 (the latest *gross* disclosure), of which **10.0** would hit the effective tax rate if recognized. The company's own stated movement range for the following year was a **decrease of zero to 2.4** | **No** — sits in Other current and Other non-current liabilities | `Q2 FY26 10-Q, Note 11 (Income Taxes)`; `FY24 10-K, MD&A` and `Note on income taxes` |
| *Memo — for orientation only, owned by `01` and `02`:* interest obligations on fixed-rate debt | n/a | 59.3 within one year / 318.2 beyond / **377.5** total, measured at 31-Dec-2024 | Debt service, not a contingency — named here only so it is not double-counted as one | `FY24 10-K, MD&A, "Material contractual cash requirements"` |

### Resolving `01`'s finance-lease flag

`01` flagged $17.8m of finance leases as a 31-Dec-2025 carry-forward that is "not separately disclosed at 30-Jun-2026", and asked this agent to resolve or declare it. **Declared, with the derivation checked and the vendor's silence explained — it is not evidence the leases were repaid.**

The check: Capital IQ's "Total Lease Liabilities" row can be rebuilt from the filings at every date where the filings itemise both lease types.

| Date | CIQ "Total Lease Liabilities" | 10-K / 10-Q operating leases | Implied finance leases | Filed finance-lease figure | Tie? |
|---|---:|---:|---:|---:|---|
| 31-Dec-2024 | 131.1 | 113.1 (22.4 + 90.7) | 18.0 | **18.0** [`FY24 10-K, Note 17`] | **Exact** |
| 31-Dec-2025 | 153.1 | 135.3 (30.3 + 105.0) | **17.8** | not separately filed (FY2025 10-K absent from pool) | derivation validated by the row above |
| 30-Jun-2026 | 140.5 | 140.5 (33.0 + 107.5) | **0.0 implied** | not separately filed | **breaks** |

At 30-Jun-2026 the vendor's lease total equals the 10-Q's operating-lease liabilities **to the cent**. The vendor picked up only what the 10-Q itemised, because the 10-Q's Note 8 lists operating leases and stops. So the zero implied at 30-Jun-2026 is a **disclosure artefact, not a repayment**: nothing in the pool says the finance leases were settled, and their weighted-average remaining term at last disclosure was **12 years** with only ~$1.5m of annual payments [`FY24 10-K, Note 17`]. The conservative reading (MODULE_RULES Core Principle 7) is that roughly **$17.8m of finance-lease liability is still there at 30-Jun-2026**, sitting unlabelled inside Other current liabilities and Other non-current liabilities ($202.1m of the latter, of which $107.5m is the non-current operating lease) [`Q2 FY26 10-Q, Condensed Consolidated Balance Sheets`]. *Carried forward from 31-Dec-2025. Inference, not from filings.* At 1.2% of gross debt it moves no ratio in this module.

### The scaled operating-lease gross figure, and why it is labelled

No undiscounted operating-lease maturity table is filed at 30-Jun-2026 (that table appears only in the annual 10-K). The two dates where both figures exist give a gross-to-recognized ratio of **1.284x** at 31-Dec-2024 (145.3 ÷ 113.1) and **1.220x** at 31-Dec-2025 (165.1 ÷ 135.3). Applying the fresher 1.220x to the recognized $140.5m gives **~$171.4m**. *This is a labelled scaling of a disclosed ratio, not a filed figure. Inference, not from filings.* The gap between $171.4m and $140.5m is imputed interest at a **5.1%** weighted-average discount rate over a **5-year** weighted-average remaining term [`Q2 FY26 10-Q, Note 8`; `FY24 10-K, Note 17`] — it is not extra exposure, it is the same obligation shown before discounting.

---

## 2. Guarantees & Letters of Credit

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| **Bonds, letters of credit and bank guarantees** (single disclosed line — the company does not split it) | **Nil disclosed.** The accounting policy is stated ("We recognize, at the inception of a guarantee, a liability for the fair value of the obligation undertaken in issuing the guarantee") but **no liability amount is given** at 30-Jun-2026. The only guarantee liability ever quantified in this pool was **12.5**, which was **released to income during 2024** | **102.0** outstanding face value at **30-Jun-2026**. Prior dates: 82.6 (31-Mar-2026), 75.7 (31-Dec-2025), 10.7 (31-Dec-2024), 10.5 (31-Dec-2023) | Two purposes, both disclosed: (a) **performance** — instruments "that require payments to our customers for any non-performance", whose face value "fluctuates with the value of our projects in process and in our backlog"; (b) **financial standby letters of credit** "primarily to secure our performance to third parties under self-insurance programs" | `Q2 FY26 10-Q, Note 15 (Commitments and Contingencies)`; `Q1 FY26 10-Q, Note 15`; `FY24 10-K, Note 18 (Commitments and Contingencies)` and `FY24 10-K, MD&A`; release of the 12.5 guarantee liability: `FY24 10-K, MD&A "Other expense (income)"` and `Consolidated Statements of Cash Flows` |
| **Performance / surety bonds** | — included in the 102.0 line above; **not separately disclosed** | — not separately disclosed | Customers, on project non-performance | `Q2 FY26 10-Q, Note 15` |
| **Financial standby letters of credit** | — included in the 102.0 line above; **not separately disclosed** | — not separately disclosed | Third parties, under self-insurance programmes | `Q2 FY26 10-Q, Note 15` |
| **Disposition indemnities** (given to buyers of divested businesses and product lines — pre-closing tax, product liability, warranty, environmental and other obligations; the largest recent disposal is the Thermal Management segment sold for $1.65bn, closed 30-Jan-2025) | **Nil disclosed** | **Not stated and not estimable.** The company's exact words: "the maximum obligation under such indemnifications is not explicitly stated and as a result, the overall amount of these obligations **cannot be reasonably estimated**" | Purchasers of divested businesses / product lines | `Q2 FY26 10-Q, Note 15`; `FY24 10-K, Note 18`; Thermal Management disposal: `FY24 10-K, Item 1 and Note 6` |
| **Product service and warranty policies** | **"Not material"** at both 30-Jun-2026 and 31-Dec-2025 — accrued but not quantified | Not stated | Customers | `Q2 FY26 10-Q, Note 15` |
| **Intra-group note guarantees** (nVent Electric plc and Hoffman Schroff Holdings guarantee nVent Finance's Notes, joint and several, per the February 2026 supplemental indenture) | Consolidated — **no incremental exposure** | **Nil incremental.** These guarantee debt already inside `01`'s $1,492.4m stack; counting them again would double-count | Noteholders | `Q2 FY26 10-Q, Note 10 (Debt)`; already mapped in `01`, §6A |

**The one number in this report that has genuinely spiked.** The bonds / LC / bank-guarantee face value went **10.5 → 10.7 → 75.7 → 82.6 → 102.0** across Dec-2023, Dec-2024, Dec-2025, Mar-2026 and Jun-2026 — a **9.5-fold rise in eighteen months** and **+34.7%** in the six months of 2026 alone. The company gives the mechanism itself: the face value "fluctuates with the value of our projects in process and in our backlog". This is therefore growth-linked, not distress-linked — nVent's Systems Protection segment income more than doubled year on year in Q2 FY26 (248.2 vs 137.1) [`Q2 FY26 10-Q, Note 13 (Segment Information)`], and the announced Maverick deal is explicitly a data-centre power-distribution business with "a strong backlog" [`nVent news release, 2026-08-24`]. But the direction of the exposure is one way, it is un-booked, and if projects fail to perform these instruments are drawn in cash. **Both facts travel together.**

---

## 3. Litigation & Tax Contingencies

Probability language below is quoted from the company, not assigned by this agent. Under CLAUDE.md §10, "remote" maps to 0–10% and "unlikely" to 25–45%.

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) — the company's own words | Source |
|---|---:|---:|---|---|
| **General litigation** — commercial and contractual disputes, product liability, **asbestos**, environmental, safety and health, patent infringement, employment | **Not disclosed.** No aggregate litigation reserve is given anywhere in this pool | **Not stated.** No claimed amount, no named case, no plaintiff, no court | **Active as a class, none named.** "We have been made parties to a number of actions filed or have been given notice of potential claims". The company's probability language is explicit and two-sided: a material impact "**is unlikely**", but "given the inherent uncertainty of litigation, a **remote possibility** exists that a future adverse ruling or unfavorable development could result in future charges that could have a material adverse impact" | `FY24 10-K, Item 3 (Legal Proceedings)`; `FY24 10-K, Note 18`; `FY24 10-K, MD&A "Commitments and Contingencies"` |
| **Environmental clean-ups** — named as defendant, target or **potentially responsible party (PRP)** at a number of sites, current and former, including divested and acquired businesses | **"Not material"** at 31-Dec-2024 — accrued site-by-site "when it is probable that a liability has been incurred and the amount can be reasonably estimated". The amount itself is not disclosed | **Not stated.** The company warns openly that "unknown conditions, new details about existing conditions or changes in environmental requirements may give rise to environmental liabilities that will **exceed the amount of our current reserves** and could have a material adverse effect in the future" | **Active** — clean-ups are ongoing, and PRP status can attach to future sites. Not characterised as remote | `FY24 10-K, Item 3 (Legal Proceedings) — Environmental matters`; `FY24 10-K, Note 18` |
| **Product liability claims** | Not separately disclosed | Not stated | **Active as a class**; no case named | `FY24 10-K, Item 3 (Legal Proceedings) — Product liability claims` |
| **Uncertain tax positions** (unrecognized tax benefits) | **9.4** at 30-Jun-2026 — a booked liability, down from 10.3 at 31-Dec-2025 | **11.7** gross at 31-Dec-2024, of which **10.0** would move the effective tax rate. Penalty and interest liabilities of **2.0** and **1.4** are carried separately | **Live but shrinking and small.** The company expected the balance to "decrease by a range of **zero to 2.4**" over the following year, "primarily as a result of the resolution of non-U.S. tax audits", and does not expect a material change beyond what is recorded | `Q2 FY26 10-Q, Note 11 (Income Taxes)`; `FY24 10-K, MD&A` and income-tax note |
| **Tariff exposure — flagged, not sized as a contingency** | **Nil.** nVent recognised a **$25.8m benefit** in Q2 FY26 from "reimbursements of tariffs previously remitted under the International Emergency Economic Powers Act (IEEPA tariffs)" — an inflow, not a provision | **Not disclosed as a contingency by the company at all.** No reversal risk, no clawback term and no legal status is stated in any pool document | **Status not established from this pool.** `business-model/10_external-dependency` §1A reaches the same conclusion and records the exposure as "status not established". Gross tariff cost is separately guided at about **$100m for 2026** on top of about **$90m in 2025** — an operating cost, which belongs to the earnings module, **not** a contingent liability. **No exposure is invented here** | `Q2 FY26 10-Q, Note 13 (Segment Information)` reconciliation line "IEEPA tariffs" 25.8 and `MD&A, Gross profit`; `business-model/10_external-dependency.md`, §1A |
| **Maverick Power earnout — POST-BALANCE-SHEET, contingent** | **Nil.** The deal was signed 24-Aug-2026, after the 30-Jun-2026 balance-sheet date, and has not closed. Nothing is booked | **550.0 cash maximum** — "potential additional consideration of **up to $550 million in cash** based on achieving certain performance metrics in **2027 and 2028**" | **Live, and management's language points toward payment, not away from it:** "nVent's financial returns on the acquisition are expected to be **significantly better if the potential additional considerations are paid**." Separately, the **firm** $1.75bn cash purchase price is contingent only on closing conditions "including regulatory approval", expected **Q4 2026**, with **committed bridge financing from Bank of America** | `nVent news release "nVent to Acquire Maverick Power", 2026-08-24` |

**The separate $1.75bn is not double-counted here.** The firm cash purchase price is a post-balance-sheet funding commitment, already carried in `01`, §5A as pro-forma net debt of ~$2,986.4m and pro-forma net leverage of ~2.43x. This report sizes only the **contingent** $550m earnout. `01` already showed the earnout's effect (~2.88x if paid in full) — do not add it to that figure a second time.

---

## 4. Contingent Exposure Summary

**Read the basis labels before the ratios.** These aggregates mix (a) recognized liabilities shown before discounting, (b) instrument face values, (c) a stale one-year purchase commitment, and (d) a post-balance-sheet earnout cap on a deal that has not closed. They are **not one homogeneous number**, and the itemised build is printed in full so a reader can rebuild every total (CLAUDE.md §15).

**Build A — recognized liabilities in scope** (booked on the balance sheet, outside `01`'s $1,492.4m debt stack):

| Component | Amount | As of |
|---|---:|---|
| Operating lease liabilities | 140.5 | 30-Jun-2026 |
| Finance lease liabilities | 17.8 | 31-Dec-2025 (carry-forward — see §1) |
| Pension underfunding | 119.7 | 31-Dec-2025 (vendor read) |
| OPEB underfunding | 11.1 | 31-Dec-2025 (vendor read) |
| Uncertain tax positions | 9.4 | 30-Jun-2026 |
| Guarantee liability, warranty accrual, environmental reserve, litigation provision | **0.0 disclosed** — each stated as nil, "not material", or not quantified | — |
| **Total recognized** | **298.5** | **mixed dates: two lines at 30-Jun-2026, three at 31-Dec-2025** |

**Build B — maximum / gross exposure for the same items:**

| Component | Amount | Basis — what kind of number this is |
|---|---:|---|
| Operating leases, undiscounted | 171.4 | scaled from the 31-Dec-2025 disclosed ratio — *inference, labelled in §1* |
| Finance leases, undiscounted | 30.5 | filed maturity table, 31-Dec-2024 |
| Pension gross projected benefit obligation | 122.7 | gross obligation before $3.0m of plan assets, 31-Dec-2025 |
| OPEB gross obligation | 11.1 | wholly unfunded, 31-Dec-2025 |
| Uncertain tax positions, gross | 11.7 | gross unrecognized tax benefits, 31-Dec-2024 |
| Bonds, LCs and bank guarantees | 102.0 | **face value of instruments outstanding**, 30-Jun-2026 |
| Purchase commitments | 66.7 | **one calendar year (2025) only**, stale — no 2026 figure in this pool |
| Maverick Power earnout cap | 550.0 | **post-balance-sheet contingent cap** on a deal not yet closed |
| **Total maximum / gross** | **1,066.1** | **mixed basis — do not quote without this table** |

| Metric | Value |
|---|---:|
| **Total recognized contingent liabilities** | **298.5** (mixed dates as above; the guarantee, warranty, environmental and litigation lines are all $0 booked) |
| **Total maximum / gross exposure** | **1,066.1** (mixed basis as above; **$550.0m of it — 51.6% — is the post-balance-sheet Maverick earnout**) |
| **Max exposure ÷ recognized** | **3.57x** (1,066.1 ÷ 298.5). **Excluding the post-balance-sheet earnout: 1.73x** (516.1 ÷ 298.5) |
| **Max exposure ÷ total equity ($3,986.9m at 30-Jun-2026)** | **26.7%**. **Excluding the earnout: 12.9%** |
| *Memo:* purely contingent items, never recognized (LCs/bonds 102.0 + purchase commitments 66.7 + earnout 550.0) | **718.7 against $0.0 of booked provision** — 18.0% of equity; excluding the earnout, 168.7 (4.2% of equity) |
| *Memo:* max exposure ÷ LTM reported EBITDA ($1,074.6m) | **0.99x** |
| *Memo:* max exposure ÷ `01`'s canonical net debt ($1,236.4m, strict §15 basis) | **0.86x** |

Equity source: `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` (total equity 3,986.9). EBITDA and net-debt anchors taken verbatim from `01`, §7.

**Unquantifiable items excluded from every total above, and named so they are not forgotten:** disposition indemnities (company states the maximum "cannot be reasonably estimated"), general litigation including asbestos and product liability (no claimed amount disclosed), environmental clean-up beyond the "not material" reserve, and product warranty. These are real and they are open-ended; they are simply not addable. Their absence means **$1,066.1m is a floor on the maximum, not the maximum.**

---

## 5. Contingency Read

**The largest live off-balance-sheet exposure is the $550.0m Maverick Power earnout, and management's own language points toward paying it, not avoiding it** — the release says returns will be "significantly better if the potential additional considerations are paid" [`nVent news release, 2026-08-24`]. It is contingent on 2027–2028 performance at a business the company is buying for $1.75bn on ~11.5x its anticipated 2026 EBITDA, so the earnout gets paid precisely in the state of the world where nVent can most afford it — that is a real mitigant, but it is not a guarantee, and a cash earnout paid at the top of a data-centre build cycle would land on a balance sheet already carrying ~2.4x pro-forma net leverage [`01`, §5A]. **The second live item is the $102.0m of performance bonds, letters of credit and bank guarantees, which has risen 9.5-fold in eighteen months (10.7 → 102.0) with $0 of booked provision against it.** That is growth-driven, not distress-driven — the company itself ties the face value to project backlog — but it is un-booked, it moves only one way, and it converts to cash if projects fail to perform.

**If the whole $1,066.1m crystallised at once, it would absorb 26.7% of the $3,986.9m equity base and 0.99x of one year's LTM EBITDA — painful, not fatal, and not a solvency event on its own.** The reason is that more than half of that total is an earnout that only becomes payable if the acquired business hits its numbers, and roughly a third is leases and pensions that are already recognized and that pay out over 5 to 12 years, not at once. The genuinely open-ended exposures — disposition indemnities, asbestos, environmental PRP status — are all described by the company as unlikely-to-remote with immaterial reserves, and no active named case, plaintiff, claimed amount or court appears anywhere in this pool. **Thin disclosure is the honest caveat here rather than a discovered exposure: nVent gives one combined LC/bond/guarantee line with no split, no aggregate litigation reserve, and no quantified indemnity cap, and the FY2025 10-K — where the FY2025 audited contingency, lease and pension notes would sit — is absent from this pool. Undisclosed exposures cannot be ruled out.** That absence is flagged, not filled in.

RF-OBS-001 (contingent-liability spike)

**Why the tag fires, stated plainly so the synthesis can weigh it rather than just count it.** The mechanical test is met on both limbs — max ÷ recognized is **3.57x** (threshold 3x) and max ÷ equity is **26.7%** (threshold 15%) — and the two items driving it are live rather than remote by the company's own language: the earnout is under a signed definitive agreement expected to close in Q4 2026, and the $102.0m of bonds and LCs is outstanding today and grew 34.7% in six months. **What the tag does not mean here:** there is no named litigation, no regulatory action, no tax demand, no related-party guarantee, and no distress signal in any of it. The spike is the arithmetic consequence of a company writing a $1.75bn cheque and posting more performance bonds as its order book grows. `06_downside-stress-test` should carry the $102.0m of LCs and bonds as a potential cash draw and the $550.0m earnout as a 2028–2029 outflow contingent on the acquired business performing; `99` should record the tag with this qualifier attached, not stripped.

---

**Scope note.** This report does not restate the on-balance-sheet debt stack (`01` owns it), does not assess coverage or covenant headroom (`04` owns them), and does not run the stress test (`06` owns it). It sizes what sits outside the headline debt and hands the material items down.
