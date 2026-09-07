# Coverage & Covenants — NVT

**Company:** nVent Electric plc (NYSE: NVT) · **Reporting currency: USD, in millions** · **Reporting standard: US GAAP** · **Fiscal year ends 31 December** · **Measurement date: 30 June 2026** (Q2 FY26 Form 10-Q, filed 2026-07-31) · **Ratio period: LTM to 30-Jun-2026**

**Read this before the tables — three things set the basis for everything below.**

1. **Coverage means: how many times over do the profits cover the interest bill.** Covenant headroom means: how far the actual ratio sits from the level at which the lenders could act. Both are computed here from filed numbers, with every formula shown.
2. **Interest is disclosed on a NET basis only.** The Q2 FY26 10-Q reports a single line, "Net interest expense" — $17.4m for Q2 and $34.9m for H1 2026. No gross interest expense and no interest income line is broken out anywhere in the pool. Every coverage ratio below therefore uses **net** interest of **$74.9m** for the LTM (FY2025 $75.0m − H1'25 $35.0m + H1'26 $34.9m). §4 of this report tests how much that could flatter the picture; the answer is: not enough to matter at these levels.
3. **The covenant ratios use the credit agreement's OWN EBITDA definition, not reported or company-adjusted EBITDA.** They are a different number ($1,106.7m) built on a different basis, and they are labelled as such on every line. The reported-EBITDA coverage ratios in §1 and the covenant ratios in §2–§3 are not interchangeable (CLAUDE.md §15, matched basis).

**Post-balance-sheet event carried throughout.** Maverick Power was announced **24 August 2026** — after the 30 June 2026 balance-sheet date — for **$1.75bn cash plus up to $550m of contingent consideration**, to be funded "with a combination of available cash on hand and new debt", with committed bridge financing from Bank of America, expected to close Q4 2026 [`nVent news release "nVent to Acquire Maverick Power", 2026-08-24`]. **The financing mix, tenor and pricing are not disclosed in this data pool.** Every Maverick figure in this report sits in §3A, is labelled pro-forma on every line, and is never presented as reported.

---

## 1. Coverage Ratios

All ratios LTM to 30-Jun-2026. **Interest = net interest expense $74.9m** (the only interest figure the company discloses). **EBITDA basis is labelled in each row.** Every value was produced by an executed Python calculation, not mental arithmetic (command and output shown at the end of this section).

| Ratio | Value | Source |
|---|---:|---|
| **EBITDA / interest** — reported EBITDA $1,074.6m ÷ $74.9m | **14.35x** | `CIQ Financials → Income Statement`, EBITDA LTM Jun-30-2026 (= `ciq_facts.json` `ltm_ebitda_m` 1,074.6) ÷ net interest built from `Q2 FY26 10-Q, Condensed Consolidated Statements of Income` and `CIQ Financials → Income Statement` FY2025 |
| **EBIT / interest** — EBIT $842.7m ÷ $74.9m | **11.25x** | `CIQ Financials → Income Statement`, EBIT (= operating income) LTM Jun-30-2026; matches the vendor's own Ratios row 11.251x |
| **(EBITDA − capex) / interest** — ($1,074.6m − $112.9m) ÷ $74.9m | **12.84x** | capex $112.9m from `CIQ Financials → Cash Flow`, LTM Jun-30-2026 |
| **Fixed-charge coverage** — ($1,074.6m − $112.9m) ÷ ($74.9m interest + $13.8m scheduled amortisation + $32.6m lease payments) = 961.7 ÷ 121.3 | **7.93x** | interest as above; scheduled amortisation = current maturities of long-term debt $13.8m [`Q2 FY26 10-Q, Note 10` and balance sheet]; lease payments **proxied** at $31.1m operating [`CIQ Financials → Income Statement`, "Net Rental Exp." FY2025] + ~$1.5m finance-lease payments [`FY24 10-K, Note 17 (Leases)`, finance-lease maturity schedule $1.4–1.5m per year] |
| *Same four, on company-adjusted EBITDA $1,061.5m* | EBITDA/int **14.17x** | adjusted EBITDA per `01_capital-structure-and-leverage` §7 — *its Q2 FY26 component of $340.1m is computed by that agent from filed tables, not published; carry that caveat* |
| *Same, on normalised / mid-cycle EBITDA $863.6m* | EBITDA/int **11.53x** · EBIT/int **8.43x** · fixed-charge **6.19x** | mid-cycle EBITDA per `01` §7 (three-year average FY2024 675.6 / FY2025 840.5 / LTM 1,074.6). *A labelled normalisation, not a forecast* |

**The EBITDA basis, stated plainly.** The headline row uses **reported** EBITDA — GAAP operating income of $842.7m plus depreciation and amortisation of $231.9m, on **continuing operations** only. It is **not** company-adjusted and it is **not** the covenant number. It is also at a **cyclical peak**: `business-model/07_business-quality` scores cyclicality 30/100 (reverse-mapped, its lowest row) and `earnings/02_revenue-drivers` states Q2 FY26 "is a peak-of-cycle print, not a normalised base". The mid-cycle row is the honest counterweight — coverage of **11.53x** rather than 14.35x on the same interest bill.

**Interest is NET, and here is the size of the possible error.** Rebuilding interest from the disclosed coupons on the 30-Jun-2026 stack gives a run-rate **gross** interest cost of **$69.1m** a year: $500.0m at 4.550% = $22.75m, $300.0m at 2.750% = $8.25m, $500.0m at 5.650% = $28.25m, $200.0m term loan at 4.903% = $9.81m — a weighted-average coupon of **4.604%** on $1,500.0m of principal [`Q2 FY26 10-Q, Note 10`]. The disclosed LTM **net** figure of $74.9m is **$5.8m higher** than that run-rate, which is what you would expect given debt was higher earlier in the twelve months ($1,559.8m at 31-Dec-2025) and given revolver commitment fees and issuance-cost amortisation. In other words the net line is not being flattered by a hidden slug of interest income. To breach the 3.00x minimum-coverage covenant, interest expense would have to reach **$368.9m — 4.9 times the disclosed $74.9m**. The net-versus-gross question cannot change any conclusion here.

**Is the EBITDA cash-backed? Yes, and the cross-module read says so.** `earnings/06_earnings-quality` records CFO at **69–79% of EBITDA for four straight years**, a cash conversion cycle **15.5 days shorter** than FY2023, and explicitly emits no low-cash-conversion flag ("CFO/EBITDA was not below 50% in any of the last three years"). On this report's own arithmetic, continuing-operations CFO for the LTM is $772.8m ($690.6m reported CFO plus the $82.2m outflow through discontinued operations), which is **71.9%** of reported EBITDA. Two caveats that travel with that, both from `earnings/06`: the LTM free cash flow includes roughly **$25.8m of one-off IEEPA tariff refunds**, so the recurring normalised operating FCF is about **$634.1m**, not $659.9m — that recurring cash still covers the net interest bill **8.47 times over**; and the reported-to-adjusted wedge is real but is **87% acquisition intangible amortisation** ($165.2m LTM), which is genuinely non-cash and does not weaken a coverage ratio. **Conclusion: no cash-quality caveat is required on the coverage ratios above.** Working capital is the live tension (it consumed $218.4m in H1 FY26 on revenue up 53%), and it is a liquidity question, which `03_liquidity-runway` owns — not a coverage question.

**One vendor row does not tie, and it is named rather than averaged away (§3).** `CIQ Financials → Ratios` prints EBITDA / interest expense of **14.794x** and (EBITDA − capex) / interest of **13.287x** for the LTM. Those imply an interest denominator of about **$72.6m**, not the $74.9m the same workbook's Income Statement carries, and not the $74.9m the 10-Q's own quarterly lines build to. The vendor's own EBIT / interest row (11.251x) *does* use $74.9m, so the Ratios tab is internally inconsistent. The deterministic sidecar `ciq_facts.json` reports `interest_coverage_x` = **14.3**, which matches this report's 14.35x exactly. **This report uses 14.35x, built from the filing's own quarterly interest lines, and treats the 14.794x row as a vendor artefact.** The difference is 0.45 turns on a 14x ratio and changes nothing.

**Executed calculation (fix F09).**

```
$ python3  # inputs: EBITDA_rep=1074.6, EBIT=842.7, capex=112.9,
           # int_net = 75.0 - 35.0 + 34.9 = 74.9
LTM net interest expense = 74.9
EBITDA/int         = 14.35x
EBIT/int           = 11.25x
(EBITDA-capex)/int = 12.84x
EBITDA/int adj     = 14.17x
EBITDA/int mid-cycle = 11.53x
EBIT/int mid-cycle   = 8.43x
Fixed-charge coverage = (1074.6-112.9)/(74.9+13.8+32.6) = 7.93x
Fixed-charge coverage, mid-cycle EBITDA = 6.19x
run-rate gross interest on the 30-Jun-2026 stack = 69.06 (wtd-avg coupon 4.604%)
interest that would breach the 3.00x floor = 368.9 (4.9x the disclosed 74.9)
cont-ops CFO LTM 772.8 -> CFO/EBITDA 71.9%
normalised op FCF 634.1 / net interest = 8.47x
```

---

## 2. Covenant Inventory

**The covenants are fully disclosed — the partial-data rule does not apply and no score cap binds.** The Q2 FY26 10-Q sets out both maintenance covenants, both thresholds, the acquisition election, and the covenant-EBITDA definition including the cash-netting cap. Verbatim: *"we may not permit (i) the ratio of our consolidated debt (net of our consolidated unrestricted cash in excess of $5.0 million but not to exceed $250.0 million) to our consolidated net income (excluding, among other things, non-cash gains and losses) before interest, taxes, depreciation, amortization and non-cash share-based compensation expense ("EBITDA") on the last day of any period of four consecutive fiscal quarters (each a "testing period") to exceed 3.75 to 1.00 (or, at nVent Finance's election and subject to certain conditions, 4.25 to 1.00 for four testing periods in connection with certain material acquisitions) and (ii) the ratio of our EBITDA to our consolidated interest expense for the same period to be less than 3.00 to 1.00"* [`Q2 FY26 10-Q, Note 10 (Debt)`, Senior credit facilities]. The company states it *"was in compliance with all financial covenants"* at 30 June 2026 and that *"there is no material uncertainty about our ongoing ability to meet those covenants"* [same note].

**Where they live and what they bind.** Both sit in the **Senior Credit Facilities** — the June 2025 amended and restated credit agreement providing a five-year $275.0m senior unsecured term loan (drawn balance $200.0m) and a five-year $600.0m senior unsecured revolving credit facility, entered into by nVent Electric plc, nVent Finance S.à r.l. and Hoffman Schroff Holdings, Inc. The 10-Q states these are *"the most restrictive"* financial covenants in the debt agreements — so the Senior Credit Facilities, not the Notes, set the binding constraint for the whole $1,492.4m stack.

| Covenant | Threshold | Current Actual (30-Jun-2026) | Headroom | Source |
|---|---|---:|---:|---|
| **Max net leverage** — covenant net debt / covenant EBITDA (MAX / ceiling) | **3.75x**; electively **4.25x** for four testing periods in connection with certain material acquisitions | **1.13x** ($1,250.0m ÷ $1,106.7m, principal basis) | **+69.9%** vs 3.75x · **+73.4%** vs the 4.25x election | `Q2 FY26 10-Q, Note 10` |
| **Min interest coverage** — covenant EBITDA / consolidated interest expense (MIN / floor) | **3.00x** | **14.78x** ($1,106.7m ÷ $74.9m) | **+392.5%** | `Q2 FY26 10-Q, Note 10` |
| **Min liquidity / net worth** | **None disclosed** — no minimum-liquidity, minimum-net-worth or current-ratio maintenance covenant appears anywhere in the debt note | n/a | n/a — no such covenant exists to have headroom against | `Q2 FY26 10-Q, Note 10`; `FY24 10-K, Note 10 (Debt)` |
| **Springing covenant (e.g. revolver-utilisation trigger)** | **None disclosed.** Both covenants are tested *"on the last day of any period of four consecutive fiscal quarters"* with no utilisation condition — they are **always active**, including today with the revolver undrawn. There is no springing structure to switch on or off | always on | **Status: ACTIVE** (both covenants) | `Q2 FY26 10-Q, Note 10` |
| **Equity cure rights (Y/N, limits)** | **Not disclosed in the data pool.** The 10-Q summarises the covenants but not the cure mechanics, and the credit agreement itself is not in the pool. Per MODULE_RULES ("cure rights must be captured"), this is recorded as an unknown, and the conservative default (§4) applies: **assume no cure right is available** until the credit agreement proves otherwise | unknown | not assessable | `Q2 FY26 10-Q, Note 10` (absence) |
| **Other — negative covenants** | Restrictions on the ability to **create liens, merge or consolidate with another person, make acquisitions, and incur subsidiary debt** (Senior Credit Facilities); the Notes' indentures separately restrict **merger/consolidation, liens and sale-and-leaseback** | not ratio-tested | n/a — incurrence-style restrictions, no headroom metric | `Q2 FY26 10-Q, Note 10` |
| **Other — rating-linked pricing step** | The applicable margin on the Senior Credit Facilities is set, at nVent Finance's election, off **nVent's net leverage ratio or its public debt rating**. This is a **pricing** step, not a default trigger — a downgrade raises the cost, it does not accelerate the debt | n/a | n/a | `Q2 FY26 10-Q, Note 10`. **No rating-agency report is in this pool**, so no rating is asserted here |
| **Other — change-of-control put / cross-default** | **Not disclosed in the data pool.** The only "change of control" language anywhere in the pool sits in equity-award agreements [`FY24 10-K` exhibits], not in the debt terms | unknown | not assessable | `Q2 FY26 10-Q, Note 10` (absence) |

**Direction-aware headroom, shown so the sign can be checked (MODULE_RULES §11).** Max net leverage is a **ceiling**, so headroom = (threshold − actual) ÷ threshold = (3.75 − 1.129) ÷ 3.75 = **+69.9%**. Min interest coverage is a **floor**, so headroom = (actual − threshold) ÷ threshold = (14.78 − 3.00) ÷ 3.00 = **+392.5%**. Applying the ceiling formula to the floor covenant would have printed −80% and falsely flagged the safest covenant as the tightest.

### Covenant EBITDA Definition & Quality (required — headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| **Covenant EBITDA definition summary** | Consolidated net income, **excluding non-cash gains and losses**, before **interest, taxes, depreciation, amortization and non-cash share-based compensation expense**. That is the complete definition as filed — nothing else | `Q2 FY26 10-Q, Note 10` |
| **Addbacks permitted (types)** | **Exactly one addback beyond the standard EBITDA build: non-cash share-based compensation.** Plus the exclusion of non-cash gains and losses. That is all. There is **no** addback for restructuring charges, **no** addback for acquisition transaction and integration costs, **no** "run-rate synergies" or "pro-forma cost savings" addback, and **no** general "other adjustments" basket. This is a notably narrow definition by leveraged-credit standards | `Q2 FY26 10-Q, Note 10` |
| **Addback caps / limits** | No cap is needed on the EBITDA side because only one addback exists. The cap that does bite is on the **other** side of the leverage ratio: cash netting is limited to **unrestricted cash in excess of $5.0m but not exceeding $250.0m**. With $256.0m of cash on hand, the netting allowed is min($256.0m − $5.0m, $250.0m) = **$250.0m**, so **$6.0m of the cash gets no credit** at all | `Q2 FY26 10-Q, Note 10`; cash from `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` |
| **Is covenant EBITDA materially above reported EBITDA?** | **No — it is 3.0% above.** Covenant EBITDA of **$1,106.7m** versus reported EBITDA of **$1,074.6m**, a gap of **$32.1m**, and the whole gap is explained by two named items: **+$40.5m** of non-cash share-based compensation (the one permitted addback) less **$8.4m** of restructuring charges ($7.8m) and other non-operating expense ($0.6m) that sit below operating income and are **not** added back. Build: earnings from continuing operations $591.0m + net interest $74.9m + tax $168.4m + D&A $231.9m + non-cash share-based comp $40.5m = **$1,106.7m** | `CIQ Financials → Income Statement` (earnings from continuing operations 591.0, tax 168.4, restructuring 7.8, other non-operating 0.6, stock-based comp 40.5) and `→ Cash Flow` (D&A total 231.9), LTM Jun-30-2026; net interest built from `Q2 FY26 10-Q` |

**Headroom quality: HIGH, and here is why that word is earned rather than asserted.** The usual reason covenant headroom is fake — the "addback illusion" — is a definition that lets a borrower add back restructuring costs, deal costs, and unrealised future synergies until covenant EBITDA is 30–50% above the audited number. **That is the opposite of what is happening here.** nVent's covenant EBITDA sits only **3.0%** above reported EBITDA, and it is *below* what the company's own adjusted-EBITDA presentation would support: the company excludes restructuring ($7.8m LTM), acquisition transaction and integration costs, intangible amortisation and the $25.8m IEEPA tariff reimbursement from its adjusted figures [`Q2 FY26 10-Q, Note 13 (Segment Information)` reconciliation], and **the covenant permits none of those exclusions except the amortisation that any EBITDA build removes.** The headroom below is therefore measured against a near-GAAP denominator. Two secondary points, both recorded rather than swept up: (a) **discontinued operations** contributed $7.3m of earnings in the LTM, and a strictly literal reading of "consolidated net income" would include them, lifting covenant EBITDA to $1,114.0m and headroom by 0.1 percentage points — this report uses the **more conservative continuing-operations build of $1,106.7m**; (b) the "excluding non-cash gains and losses" carve-out is immaterial in this period — no mark-to-market gain or loss line appears in the LTM segment reconciliations, so nothing is being stripped out.

**One definitional unknown, stated rather than assumed away.** The 10-Q says "consolidated **debt**" without defining whether that means the GAAP carrying amount ($1,492.4m, net of $7.6m of issuance costs), the principal outstanding ($1,500.0m), or principal plus finance-lease obligations (~$1,517.8m using the latest separately disclosed finance-lease figure of $17.8m at 31-Dec-2025 [`CIQ Financials → Capital Structure Details`]). All three are computed in §3 below. The spread across them is **0.02 turns of leverage and 0.6 percentage points of headroom** — it does not change any conclusion. The headline uses the **principal basis ($1,500.0m)**, the more conservative of the two filing-supported readings.

---

## 3. Headroom & Breach Proximity

All covenant figures on the **credit agreement's own definitions**: covenant net debt = debt − $250.0m of permitted cash netting; covenant EBITDA = $1,106.7m LTM.

| Metric | Value |
|---|---:|
| **Tightest covenant** | **Max net leverage 3.75x** (the ceiling in the Senior Credit Facilities) |
| **Headroom on tightest covenant (%)** | **+69.9%** — actual 1.13x against a 3.75x ceiling. On the 4.25x acquisition election: **+73.4%** |
| **EBITDA decline that would breach it (approx.)** | **−69.9%** — covenant EBITDA would have to fall from $1,106.7m to **$333.3m** ($1,250.0m ÷ 3.75) with debt and cash held flat |
| **Debt increase that would breach it (approx.)** | **+$2,900.1m** — gross debt would have to rise from $1,500.0m of principal to **$4,400.1m** (3.75 × $1,106.7m + $250.0m of netting), an increase of **193%**, with EBITDA held flat |

**The second covenant, for completeness.** The 3.00x minimum interest-coverage floor breaks at covenant EBITDA of $224.7m (3.00 × $74.9m) — a **−79.7%** fall, nearly ten percentage points further away than the leverage covenant. **The leverage covenant is the one that binds first**, and by a clear margin. Its headroom of +69.9% is the number the stress test in `06` should use.

**Three sensitivities on the tightest covenant, so the +69.9% is not read as a single fragile point estimate.**

| Basis | Covenant net debt | Covenant EBITDA | Net leverage | Headroom vs 3.75x |
|---|---:|---:|---:|---:|
| Debt at GAAP **carrying** amount | 1,242.4 | 1,106.7 | **1.12x** | **+70.1%** |
| Debt at **principal** (headline) | 1,250.0 | 1,106.7 | **1.13x** | **+69.9%** |
| Debt at principal **+ finance leases** (~$17.8m at 31-Dec-2025) | 1,267.8 | 1,106.7 | **1.15x** | **+69.5%** |
| Principal, on **normalised / mid-cycle** covenant EBITDA ($889.4m — the $1,106.7m scaled by 863.6/1,074.6) | 1,250.0 | 889.4 | **1.41x** | **+62.5%** |

The mid-cycle row is the one that matters for a cyclical name: on a normalised earnings base the same balance sheet still sits **62.5%** clear of the ceiling. The peak-EBITDA figure of +69.9% is the *floor* on leverage and the *ceiling* on headroom, not the central estimate (MODULE_RULES Calculation Standard 4).

**The cash-netting cap is a small, real drag worth naming.** Because netting stops at $250.0m, $6.0m of today's $256.0m cash balance earns no covenant credit — and every dollar of cash the company builds above $255.0m from here is worth **nothing** to the leverage covenant. That is a live consideration for a company generating roughly $634.1m of recurring operating FCF a year: cash accumulation stops helping the covenant almost immediately, only debt repayment does. Note also that the covenant's own cap ($250.0m) happens to sit close to this module's conservative "usable cash" figure of $176.4m (the $256.0m less $79.6m the company says it cannot readily repatriate [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`]) — the covenant nets **unrestricted** cash, and repatriation-limited cash is not restricted cash in the accounting sense, so the full $250.0m netting stands. That is a definitional point, not a judgement that the cash is freely available.

### 3A. Pro-forma for Maverick Power — **LABELLED PRO-FORMA, NOT A REPORTED FIGURE**

Every number in this sub-section rests on an assumption the pool does not contain. **The financing mix, tenor and pricing of the $1.75bn cash consideration are not disclosed** [`nVent news release, 2026-08-24`]. *Inference, not from filings.*

The purchase price is a fact from the release; the leverage and coverage that follow are arithmetic on top of an assumption. Maverick's implied EBITDA is taken from `01` at **~$152.2m** ($1,750.0m ÷ the release's own "approximately 11.5 times anticipated 2026 adjusted EBITDA"). Two basis warnings travel with every line: the denominator adds nVent's **trailing** twelve-month covenant EBITDA to Maverick's **anticipated full-year 2026** EBITDA (a mixed basis, §15), and holding nVent's LTM EBITDA static is a **bound, not a forecast**.

| Pro-forma line (all *Inference, not from filings*) | Value | Build |
|---|---:|---|
| PF covenant EBITDA | **1,258.9** | 1,106.7 + 152.2. Maverick's EBITDA is a **company-adjusted** figure implied from a purchase multiple, so it is *not* on the covenant's narrow definition — this line is the least reliable input in the table and probably flatters the ratio |
| PF covenant net debt — **all-debt-funded bound** | **3,000.0** | (1,500.0 + 1,750.0) − 250.0 netting |
| PF covenant net debt — if the $176.4m of freely usable cash is spent first | **2,999.0** | (1,500.0 + 1,573.6) − netting of 74.6 (cash falls to $79.6m, so the $250.0m cap no longer binds). **Within $1.0m of the all-debt bound — the funding mix is very nearly irrelevant to the covenant** |
| **PF net leverage (covenant basis)** | **~2.38x** | 3,000.0 ÷ 1,258.9 |
| **PF headroom vs the 3.75x ceiling** | **+36.5%** | (3.75 − 2.383) ÷ 3.75 |
| PF headroom vs the **4.25x acquisition election** | **+43.9%** | the election is available precisely for this situation — "four testing periods in connection with certain material acquisitions" — and on these numbers nVent does not need it |
| PF net leverage if the full $550m earnout is later paid | **~2.82x** | (3,000.0 + 550.0) ÷ 1,258.9 → headroom **+24.8%** |
| PF net leverage on **normalised / mid-cycle** covenant EBITDA ($1,041.6m) | **~2.88x** | 3,000.0 ÷ (889.4 + 152.2) → headroom **+23.2%** |
| PF net leverage on **FY2026 consensus** EBITDA ($1,225.0m + 152.2) | **~2.18x** | forward denominator [`CIQ Estimates → Consensus`, FY2026] → headroom **+41.9%** |
| **PF interest coverage** at an assumed 5.0% / 5.5% / 6.0% on $1,750m of new debt | **7.75x / 7.36x / 7.00x** | interest of 162.4 / 171.2 / 179.9 → headroom vs the 3.00x floor of **+158.4% / +145.2% / +133.3%**. *The coupon is a labelled assumption — the pool discloses no pricing. The range brackets nVent's own 5.650% 2033 coupon* |
| **PF EBITDA fall that would breach the 3.75x ceiling** | **−36.5%** | PF covenant EBITDA would have to drop from $1,258.9m to $800.0m ($3,000.0m ÷ 3.75) |

**What the deal does to the tightest covenant, in one line.** Headroom on the binding covenant goes from **+69.9% to roughly +36.5%** — it roughly halves — and the EBITDA fall required to breach goes from **−69.9% to −36.5%**. On a normalised mid-cycle base with the earnout paid, headroom compresses toward the low-20s percent. That is still not a tight covenant, but it is a materially different balance sheet, and it is the single largest change to this module's covenant read. `06_downside-stress-test` should run both the reported and the pro-forma covenant bases.

---

## 4. Coverage / Covenant Read

Earnings carry the interest bill many times over on any basis tested: reported EBITDA of $1,074.6m covers net interest of $74.9m **14.35 times**, EBIT covers it **11.25 times**, EBITDA less capex covers it **12.84 times**, and fixed-charge coverage — profits after capex against interest plus scheduled debt repayment plus lease payments — is **7.93x**; on a normalised mid-cycle earnings base those become 11.53x, 8.43x and 6.19x, and the EBITDA is genuinely cash-backed (continuing-operations CFO at 71.9% of EBITDA, recurring operating FCF of ~$634.1m covering net interest 8.47 times), so no cash-quality caveat is needed [`Q2 FY26 10-Q`; `CIQ Financials → Income Statement / Cash Flow`, LTM Jun-30-2026; `earnings/06_earnings-quality`].

The tightest covenant is the **maximum net leverage ratio of 3.75x** in the Senior Credit Facilities, and on the credit agreement's own definitions nVent sits at **1.13x** — **+69.9% headroom** — against a minimum interest-coverage covenant at **14.78x versus a 3.00x floor (+392.5%)**; that headroom is high-quality rather than manufactured, because the covenant EBITDA definition permits exactly one addback (non-cash share-based compensation) and no restructuring, deal-cost or synergy addbacks at all, so covenant EBITDA of $1,106.7m is only **3.0% above** reported EBITDA [`Q2 FY26 10-Q, Note 10`].

Breaking that covenant from today's reported position would take a **69.9% fall in covenant EBITDA** (to $333.3m) or **$2.9bn of additional debt** with earnings flat — but the Maverick Power acquisition is the move that actually matters: on a pro-forma basis (financing terms **not disclosed in the pool**, so this is labelled inference throughout) headroom roughly halves to **~+36.5%** at ~2.38x, the required EBITDA fall drops to **−36.5%**, and it compresses to roughly **+23%** on a normalised mid-cycle earnings base with the full $550m earnout paid — still well inside the covenant, and inside the 4.25x acquisition election the agreement already provides, but no longer the same order of cushion.

**Two disclosure gaps to carry, neither a cap.** **Equity cure rights are not disclosed** — the 10-Q summarises the covenants but not the cure mechanics, and the credit agreement itself is not in the pool, so the conservative default applies and this report assumes **no cure right is available**. **Change-of-control puts and cross-default terms on the Notes are likewise not disclosed in the data pool.** Neither absence changes the headroom arithmetic, because headroom is measured off disclosed thresholds and disclosed actuals; both would change the *consequence* of a breach, which is why they are named here rather than left out.

**Scope note.** This report produces coverage levels and covenant headroom only. Whether the company survives a 30–60% earnings decline belongs to `06_downside-stress-test`, which should take the +69.9% reported and ~+36.5% pro-forma headroom figures and the covenant EBITDA base of $1,106.7m from here; the solvency verdict belongs to `99_balance-sheet-survival-synthesis`.
