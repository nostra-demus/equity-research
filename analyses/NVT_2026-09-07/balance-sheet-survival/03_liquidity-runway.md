# Liquidity Runway — NVT

**Company:** nVent Electric plc (NYSE: NVT) · **Reporting currency: USD, in millions** · **Reporting standard: US GAAP** · **Fiscal year ends 31 December** · **Measurement date: 30 June 2026** (Q2 FY26 Form 10-Q, filed 2026-07-31) · **Report date: 2026-09-07**

**Four things to hold on to before the tables.**

1. **Liquidity runway means: how many months the company can keep paying what it owes out of money it already has, plus the cash the business throws off.** It is not the same question as solvency (`01`) or refinancing (`02`).
2. **Revolver availability is disclosed, so the revolver counts.** The filing states outright: *"As of June 30, 2026, the borrowing capacity under the Revolving Credit Facility was $600.0 million"*, with **$0 drawn** and no borrowing base [`Q2 FY26 10-Q, Note 10 (Debt)`]. MODULE_RULES' "exclude the revolver if availability is unknown" rule therefore does **not** bite, and the "revolver availability unknown → runway capped at 60" score cap does **not** apply.
3. **Every liquidity figure below carries its §15 basis label.** nVent holds **no** short-term investments, so the strict and broad bases are identical; "gross liquidity" is used where cash and the facility are added together with no debt netted.
4. **A $1.75bn acquisition sits outside every reported number here.** Maverick Power was announced **24 August 2026** — after the balance-sheet date — for **$1.75bn cash plus up to $550m of contingent consideration**, to be funded "with a combination of available cash on hand and new debt", with committed bridge financing from Bank of America, expected to close **Q4 2026** [`nVent news release "nVent to Acquire Maverick Power", 2026-08-24`]. **The financing mix, tenor and pricing are not disclosed in this data pool.** §3B carries the pro-forma runway; it is labelled pro-forma on every line and is never a reported figure.

---

## 1. Liquidity Sources (committed only)

USD millions at **30 June 2026**.

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | **256.0** | **Partly** | **$79.6m (31.1%) is repatriation-limited** — "held in certain countries in which the ability to repatriate is limited due to local regulations or significant potential tax consequences". Freely usable cash is therefore **$176.4m**. This is not "restricted cash" in the accounting sense (it is not segregated), but it cannot be moved to the Obligor Group cheaply, so it is flagged and shown both ways | `Q2 FY26 10-Q, Condensed Consolidated Balance Sheets` and `MD&A, Liquidity and Capital Resources` |
| Liquid short-term investments | **0.0 — none exist** | n/a | "Total Cash & ST Investments" equals cash and equivalents in every period FY2021–Jun-2026; there is no separate short-term-investment line. So the **strict** and **broad** §15 bases give the same number | `CIQ Financials → Balance Sheet` (tier-5 vendor export); confirmed against the 10-Q balance sheet |
| Revolver / facilities (commitment) | **600.0** | — | Five-year **senior unsecured** revolving credit facility from the June 2025 amended and restated Credit Agreement, maturing **2030-06-30**. **$0 drawn** at 30-Jun-2026 and at 31-Dec-2025 | `Q2 FY26 10-Q, Note 10 (Debt)`; maturity date from `CIQ Financials → Capital Structure Details` |
| **Revolver availability (disclosed)** | **600.0** | **Y** | The filing states the number directly: *"As of June 30, 2026, the borrowing capacity under the Revolving Credit Facility was $600.0 million."* **Not** borrowing-base; no reserves disclosed; no minimum-liquidity covenant exists to subtract (see the three tests below) | `Q2 FY26 10-Q, Note 10` |
| **Total usable liquidity — gross-liquidity basis** | **856.0** | | 256.0 cash + 600.0 committed availability. No debt netted — this is a **gross-liquidity** figure, not net cash (§15) | derived from the rows above |
| *Conservative variant:* total usable liquidity excluding repatriation-limited cash | **776.4** | | 176.4 + 600.0. `01` §7 designates $176.4m as the freely usable cash figure for this agent and for `06` | derived |
| *Excluded — uncommitted:* revolver accordion | **300.0** | **N** | "nVent Finance has the **option to request** to increase the Revolving Credit Facility in an aggregate amount of up to $300.0 million, **subject to customary conditions, including the commitment of the participating lenders**." A request the lenders may decline is not committed liquidity. **Excluded from every figure above** | `Q2 FY26 10-Q, Note 10` |

**Three tests run on whether the $600.0m is genuinely drawable, because a headline commitment is not the same as usable money.**

- **Is drawing it covenant-constrained? No, and by a wide margin.** `04_coverage-and-covenants` puts covenant net leverage at **1.13x** against a **3.75x** ceiling on the credit agreement's own definitions ($1,250.0m covenant net debt ÷ $1,106.7m covenant EBITDA), leaving room for roughly **$2,900m** of extra debt before a breach. Drawing the whole $600.0m takes covenant net debt to $1,850.0m and net leverage to **1.67x** — still **55% clear** of the 3.75x ceiling ((3.75 − 1.67) ÷ 3.75). On the minimum-interest-coverage floor of 3.00x, $600.0m drawn at an assumed 5.5% adds ~$33m of interest, giving $1,106.7m ÷ ~$107.9m = **~10.3x**, versus the 3.00x floor. *The 5.5% draw rate is a labelled assumption — the pool discloses the pricing grid's mechanism but not the current margin. Inference, not from filings.* **Conclusion: the covenants do not constrain the draw.**
- **Is there a minimum-liquidity covenant to subtract? No.** `04` searched the debt notes and found **no** minimum-liquidity, minimum-net-worth or current-ratio maintenance covenant anywhere [`Q2 FY26 10-Q, Note 10`; `FY24 10-K, Note 10`]. Nothing is subtracted.
- **Do the $102.0m of letters of credit and bonds eat into the $600.0m? Not on the disclosed facts — and this report does not double-count them.** `05_off-balance-sheet-and-contingencies` records **$102.0m** of outstanding bonds, letters of credit and bank guarantees at 30-Jun-2026 [`Q2 FY26 10-Q, Note 15`]. **The filing nowhere states that these are issued under the Revolving Credit Facility, and discloses no LC sublimit.** Critically, the *same filing, at the same date*, states borrowing capacity of **$600.0m** — so whatever those instruments are issued under, the disclosed availability is stated after them. Deducting $102.0m again would be double-counting an amount the company has already told us does not reduce capacity. **The instruments are carried instead as a contingent cash draw in §2, which is where they belong.** If a future filing were to reveal an LC sublimit inside the revolver, usable liquidity would fall by up to $102.0m to **$754.0m** (gross-liquidity basis) — sized here so the reader can apply it if the disclosure changes.

---

## 2. Near-Term Uses (next 12 months)

Window: **1 July 2026 to 30 June 2027**. USD millions.

| Use | Amount | Source |
|---|---:|---|
| **Debt maturities (from `02`)** | **13.8** | `02_maturity-wall-and-refinancing` §1a: **0.92%** of the $1,500.0m principal, all scheduled amortisation of the floating Term Loan Facility. `02` notes this is **not** an approximation — it ties exactly to the balance sheet's own "Current maturities of long-term debt and short-term borrowings" of $13.8m [`Q2 FY26 10-Q, Note 10`] |
| **Cash interest** | **74.9** | LTM net interest expense to 30-Jun-2026, built from the filing's own quarterly lines (FY2025 $75.0m − H1'25 $35.0m + H1'26 $34.9m) [`Q2 FY26 10-Q, Condensed Consolidated Statements of Income`; `CIQ Financials → Income Statement` FY2025]. **Interest is disclosed on a net basis only** — no gross interest or interest-income line exists in the pool. The run-rate contractual coupon on the 30-Jun-2026 stack is $69.1m (4.604% weighted-average on $1,500.0m principal), so the net line is not being flattered by hidden interest income [`04` §1] |
| **Maintenance capex** | **~66.7 — a proxy, not a disclosure** | **nVent does not split maintenance from growth capex anywhere in the pool.** Total capex was **$112.9m** LTM [`CIQ Financials → Cash Flow`, LTM Jun-30-2026] and is **guided to ~$130m for FY2026, up 40%**, with management stating "most of this increased investment is for **new capacity** to support growth in data centers, power utilities and supply chain resiliency" [`Q2 FY26 transcript, 2026-07-31, prepared remarks (CFO)`]. Maintenance capex is proxied at **depreciation of ~$66.7m** (total D&A $231.9m less acquisition intangible amortisation of $165.2m) [`CIQ Financials → Cash Flow`; `earnings/06_earnings-quality` for the $165.2m amortisation figure]. *A labelled proxy. Inference, not from filings.* |
| **Committed dividends** | **137.2** | Run-rate on the declared quarterly dividend: the Board declared **$0.21 per ordinary share** on 16 May 2026, and dividends payable on the balance sheet at 30-Jun-2026 were **$34.3m** — × 4 quarters = $137.2m [`Q2 FY26 10-Q, Note 12 (Dividends payable)` and `Condensed Consolidated Balance Sheets`]. LTM dividends actually paid were $132.9m [`CIQ Financials → Cash Flow`]. The dividend is declared quarterly and is legally cancellable, but it has been paid and raised every year in the pool (up 5% year on year per the CFO), so it is treated as committed |
| **Total near-term uses** | **292.6** | 13.8 + 74.9 + 66.7 + 137.2 |
| *Excluded — discretionary, not committed:* share repurchases | 58.0 LTM ($50.4m in H1 2026) | No authorisation amount or minimum commitment is disclosed in the pool. Buybacks are stopped at will, so they are **not** a committed use. Sized here so they are not lost: including them lifts total uses to **$350.6m** [`CIQ Financials → Cash Flow`; `Q2 FY26 10-Q, MD&A, Financing activities`] |
| *Excluded — contingent, not scheduled:* bonds, LCs and bank guarantees | 102.0 face value | Draws only if projects fail to perform. Face value rose 10.7 → 75.7 → 102.0 across Dec-2024, Dec-2025 and Jun-2026, with **$0 booked provision** — growth-linked, per the company's own mechanism ("fluctuates with the value of our projects in process and in our backlog"), not distress-linked [`Q2 FY26 10-Q, Note 15`; `05` §2] |
| *Excluded — outside the window:* Maverick Power earnout | up to 550.0 | Contingent on **2027 and 2028** performance metrics, so it cannot fall due inside the next twelve months [`nVent news release, 2026-08-24`; `05` §3] |
| *Memo — not double-counted:* operating and finance lease payments | ~32.6 a year | Already inside CFO, and therefore already inside the FCF used in §3. Named so a reader does not add them again [`04` §1, fixed-charge build] |

---

## 3. Runway

### 3A. As-reported (30 June 2026 structure)

**Basis chosen: NET-OF-FCF.** Free cash flow is large and positive, so the net-of-FCF basis is the correct one under MODULE_RULES §8. On this basis the annual burn is `(12-month maturities + committed dividends) − FCF`. **Cash interest and capex are NOT re-added** — FCF already carries both (interest paid sits inside CFO; capex is subtracted in full).

**The FCF figure used, and why (§15).** FCF = CFO − total capex. Three versions exist and all three are shown, with the normalised one leading because the reported figure is inflated by a disclosed one-off:

| FCF measure | Value | Build and basis |
|---|---:|---|
| **Normalised operating FCF — LEAD FIGURE** | **634.1** | Continuing-operations CFO $772.8m − capex $112.9m − **$25.8m of one-off IEEPA tariff refunds** [`earnings/06_earnings-quality`; `Q2 FY26 10-Q, Note 13` reconciliation line "IEEPA tariffs" 25.8]. This is the recurring cash the operations throw off |
| FCF, continuing operations as reported | 659.9 | $772.8m − $112.9m. Continuing-ops CFO is $690.6m reported CFO plus the $82.2m outflow through discontinued operations [`CIQ Financials → Cash Flow`, LTM Jun-30-2026; `Q2 FY26 10-Q, Statements of Cash Flows`; `earnings/01_historical-financials` §2] |
| FCF, total company (most conservative) | 577.7 | $690.6m reported CFO − $112.9m capex — includes the discontinued-operations drag [`CIQ Financials → Cash Flow`, LTM Jun-30-2026] |

*All three are **trailing** figures on **peak-cycle** earnings, not forecasts.* `01` §7 records LTM EBITDA of $1,074.6m as a cyclical peak against a normalised $863.6m; `earnings/02_revenue-drivers` calls Q2 FY26 "a peak-of-cycle print, not a normalised base". The cash is real — continuing-ops CFO is **71.9%** of EBITDA and `earnings/06_earnings-quality` records CFO at 69–79% of EBITDA for four straight years with no low-conversion flag — but the level is a peak.

| Metric | Value |
|---|---:|
| Total committed liquidity (gross-liquidity basis) | **856.0** (cash 256.0 + committed revolver availability 600.0) |
| Total committed liquidity, excluding repatriation-limited cash | 776.4 |
| Annual FCF (normalised operating, lead figure) | **634.1** |
| **Basis used** | **NET-OF-FCF** |
| **Annual net cash burn** = (13.8 maturities + 137.2 dividends) − 634.1 | **−483.1 — a SURPLUS, not a burn** |
| Monthly net cash burn | **negative — none** |
| **Liquidity runway (months)** | **No finite runway. FCF more than covers every committed 12-month obligation, with an annual surplus of $483.1m before touching a dollar of the $856.0m of liquidity** |

**Show the arithmetic and the sensitivities, so the surplus is not a single fragile point estimate:**

| Variant | Annual surplus (+) / burn (−) | Formula |
|---|---:|---|
| Normalised operating FCF $634.1m (lead) | **+483.1** | 634.1 − (13.8 + 137.2) |
| Continuing-ops FCF as reported $659.9m | +508.9 | 659.9 − 151.0 |
| Total-company FCF $577.7m (most conservative) | **+426.7** | 577.7 − 151.0 |
| Normalised FCF, **including** discretionary buybacks at the LTM run rate | +425.1 | 634.1 − (13.8 + 137.2 + 58.0) |

On every one of the four, FCF covers the obligations several times over. The committed 12-month debt maturity of $13.8m is **2.2%** of one year's normalised FCF.

**Gross-obligations cross-check — the deliberate no-FCF bound.** This is not the chosen basis (FCF is positive and cash-backed, so using it would overstate fragility), but it answers the question "what if the operations generated nothing at all?" and it is the number `06_downside-stress-test` should start from. Monthly burn = $292.6m ÷ 12 = **$24.4m**.

| Liquidity pool used | Runway (months) = liquidity ÷ $24.4m | Coverage multiple (÷ annual $292.6m) |
|---|---:|---:|
| **Total committed liquidity 856.0** | **35.1 months** | 2.93× |
| Excluding repatriation-limited cash: 776.4 | 31.8 months | 2.65× |
| Cash only, revolver excluded: 256.0 | 10.5 months | 0.87× |
| Freely usable cash only: 176.4 | 7.2 months | 0.60× |

*Units check (MODULE_RULES §8): 2.93× is a coverage **multiple**, not months. 2.93 × 12 = 35.1 months.*

**The split that matters: 30% of that 35.1-month bound is already in hand, 70% is a facility that must still be drawn.** Of the $856.0m, **$256.0m (29.9%)** is cash on the balance sheet — and only **$176.4m (20.6%)** of it can be moved freely. **$600.0m (70.1%)** is undrawn revolver: committed, non-borrowing-base, not covenant-constrained, and not maturing until 2030-06-30, so a closed market cannot pull it — but it is still money that has to be borrowed, not money that is sitting there.

### Seasonality / Peak Liquidity Need (Hard Check)

**Working capital IS seasonal, and the company says so in its own words:** *"We experience seasonal cash flows primarily due to increased demand for Electrical Connections products during the spring and summer months in the Northern Hemisphere"* [`Q2 FY26 10-Q, MD&A, Liquidity and Capital Resources`; same disclosure for the predecessor segment name in `FY24 10-K, Item 1 — Seasonality`].

**The peak build is not disclosed as a peak, but the pool contains enough to size the observed one.** Working-capital increases from the filings' own MD&A:

| Period | Working-capital increase | Cash & equivalents at period end | Source |
|---|---:|---:|---|
| Q1 2026 (three months) | **128.3** | **190.0** — the observed cash trough in this pool | `Q1 FY26 10-Q, MD&A, Operating activities` and balance sheet |
| H1 2026 (six months) | **219.7** | 256.0 | `Q2 FY26 10-Q, MD&A, Operating activities` |
| H1 2025 (six months) | 154.6 | — | `Q2 FY26 10-Q, MD&A, Operating activities` (comparative) |

So the build is **front-loaded into Q1** ($128.3m of the $219.7m first-half build, i.e. 58% of it in the first three months), and cash fell from $237.5m at 31-Dec-2025 to **$190.0m at 31-Mar-2026** before recovering to $256.0m by 30 June. The company attributes the 2026 build to "accounts receivable driven by the overall increase and timing of sales" — it is growth-driven (revenue up 53% in H1), not distress-driven.

**Re-run of the runway using peak seasonal cash usage** (gross-obligations bound; the build is already inside CFO, so it does **not** apply to the net-of-FCF basis — adding it there would double-count):

| Seasonal deduction applied to liquidity | Liquidity after the build | Runway (months) at $24.4m/month |
|---|---:|---:|
| Peak observed **half-year** build, $219.7m | 636.3 | **26.1 months** |
| Peak observed **quarter** build, $128.3m | 727.7 | 29.8 months |
| Peak half-year build, on the conservative liquidity pool of 776.4 | 556.7 | **22.8 months** |

**Statement required by the hard check:** the **peak** working-capital need is **not separately disclosed** — nVent discloses the seasonal pattern qualitatively and the realised half-year and quarterly builds, but never a peak-need figure. The $219.7m half-year build used above is the **largest realised build in the pool**, not a stated peak, so **the runway may still be overstated if a future peak exceeds it.** Note also that the largest build in the pool came in the strongest growth period the company has ever printed, which is the honest way to read it: the seasonal drag scales with growth, and growth is currently at a cycle peak.

### 3B. Pro-forma for Maverick Power — **LABELLED PRO-FORMA, NOT A REPORTED FIGURE**

Every number here rests on assumptions the pool does not contain. **The financing mix, tenor and pricing of the $1.75bn cash consideration are not disclosed** [`nVent news release, 2026-08-24`]. *Inference, not from filings.*

**What the cash portion does to the cash balance — the single most important line in this section.** The release says the purchase will be funded "with a combination of available cash on hand and new debt" but **does not say how much of each**. Two bounds bracket it:

| Funding case | Cash & equivalents after close | Freely usable cash after close | New debt drawn | Total committed liquidity (gross-liquidity basis) |
|---|---:|---:|---:|---:|
| **A — all debt-funded (upper bound on cash)** | **256.0 unchanged** | 176.4 | 1,750.0 | 856.0 (assumes the revolver is not used for the purchase) |
| **B — freely usable cash spent first (lower bound on cash)** | **79.6** | **0.0** | 1,573.6 | **679.6** — and every dollar of the remaining cash is repatriation-limited |

**Case B is the one to hold in mind: it wipes out the entire freely usable cash balance and leaves the company's usable liquidity as the revolver and nothing else.** The $79.6m that remains is precisely the money the company says it cannot readily move. A third case exists and is worse for liquidity — drawing the revolver to help fund the purchase — which would cut the $600.0m of availability dollar for dollar; the pool does not say whether that will happen.

| Pro-forma line (all *Inference, not from filings*) | Case A (all debt) | Case B (cash spent first) |
|---|---:|---:|
| Incremental annual interest on new debt at 5.0% / 5.5% / 6.0% | 87.5 / 96.2 / 105.0 | 78.7 / 86.5 / 94.4 |
| Pro-forma cash interest (74.9 + the above, at 5.5%) | **171.1** | **161.4** |
| Pro-forma normalised FCF (634.1 less after-tax interest at a 22.2% effective rate) | **559.2** | **566.7** |
| **PF annual net burn, NET-OF-FCF basis** = (13.8 + 137.2) − PF FCF | **−408.2 — still a surplus** | **−415.7 — still a surplus** |
| **PF runway, net-of-FCF basis** | **No finite runway; ~$408m annual surplus** | **No finite runway; ~$416m annual surplus** |
| PF total 12-month uses, gross-obligations bound (13.8 + PF interest + 66.7 + 137.2) | 388.9 | 379.1 |
| **PF runway, gross-obligations bound** = liquidity ÷ (uses ÷ 12) | **26.4 months** (856.0 ÷ 32.4) | **21.5 months** (679.6 ÷ 31.6) |

*Effective tax rate of 22.2% is built from the LTM continuing-operations figures: $168.4m tax ÷ ($591.0m earnings + $168.4m tax) [`CIQ Financials → Income Statement`, LTM Jun-30-2026].* **Maverick's own cash generation is deliberately excluded** from every pro-forma line above. `01` §5A implies ~$152.2m of anticipated 2026 adjusted EBITDA from the release's own 11.5x multiple; adding any of it would lengthen the runway. Excluding it makes these figures a **conservative bound**, and that is stated rather than quietly assumed.

**The one scenario where the runway becomes short, and it is a real one.** A bridge facility is designed to be refinanced — but if the Bank of America bridge is drawn at close in Q4 2026 and is **not** termed out into long-dated bonds within twelve months, then up to **$1,750m** enters the 12-month maturity bucket. On Case B at a 5.5% assumed rate:

`annual burn = (1,573.6 bridge + 13.8 amortisation + 137.2 dividends) − 566.7 PF FCF = 1,157.9` → monthly $96.5m → **runway = 679.6 ÷ 96.5 = 7.0 months.**

**That is the pro-forma number that matters, and it turns on one fact the pool does not contain: the tenor of the Maverick financing.** `02` reached the same conclusion from the maturity-wall side. It is not a prediction — bridges are routinely termed out, nVent has proven bond and bank access within the last fifteen months (June 2025 credit-agreement refinancing, February 2026 guarantee upgrade), and the release says the financing is committed. It is a statement of what the reader cannot yet check.

---

## 4. Sources & Uses Bridge

**On the reported 30-June-2026 structure, internal sources cover the next twelve months several times over, and no external access is required.** Committed uses of **$292.6m** (maturities $13.8m + cash interest $74.9m + maintenance-capex proxy $66.7m + dividends $137.2m) sit against normalised operating free cash flow of **$634.1m** — the business alone covers them **2.2 times** and leaves an annual surplus of **$483.1m** without touching the $856.0m of liquidity. Add discretionary buybacks at the LTM run rate of $58.0m and the surplus is still $425.1m. Nothing has to be issued, sold, drawn or waived.

**The split between money in hand and money that must still materialise is roughly 30/70 on liquidity and heavily FCF-dependent on the flow side.** Of the $856.0m of committed liquidity, only **$256.0m (29.9%) is cash already on the balance sheet — and just $176.4m (20.6%) of that can be moved freely**; the other **$600.0m (70.1%)** is an undrawn facility that must be borrowed, albeit a committed, unsecured, non-borrowing-base one that runs to 2030 and is nowhere near a covenant limit. On the flow side the dependence is larger: strip FCF out entirely and the 35.1-month bound falls to **10.5 months on cash alone** and **7.2 months on freely usable cash alone**. The runway is not fragile, but it is a working business's runway, not a cash pile's.

**Pro-forma, the answer changes in degree, not in kind — with one exception.** Maverick consumes up to the entire freely usable cash balance and adds roughly $87–105m a year of interest, which still leaves a ~$408–416m annual FCF surplus and a 21.5–26.4-month gross-obligations bound. **The exception is the bridge**: if it is drawn and not termed out within twelve months, the runway compresses to roughly **7 months** and external access stops being optional. The pool cannot tell us which happens.

---

## 5. Liquidity Read

**On the reported 30-June-2026 balance sheet there is no finite runway to state: free cash flow of $634.1m a year covers all $151.0m of committed 12-month financing obligations (a $13.8m debt maturity plus $137.2m of dividends) with a $483.1m annual surplus, and the $856.0m of committed liquidity — $256.0m of cash plus a fully available, unsecured, non-borrowing-base $600.0m revolver — is untouched.** Ignore the operations entirely and the gross-obligations bound is **35.1 months** (2.93× coverage of $292.6m of annual uses); ignore the revolver too and it is **10.5 months on cash**, or **7.2 months on the $176.4m of cash that can actually be moved.**

**The runway depends far more on cash generation holding up than on money already in hand: 70% of the committed liquidity is a facility that still has to be drawn, and the FCF doing the work is a trailing figure on peak-cycle earnings** — `01` records LTM EBITDA of $1,074.6m against a normalised $863.6m, and the working-capital build that comes with growth consumed $219.7m in H1 2026 alone, front-loaded into a Q1 that took cash down to $190.0m. That cash is genuine (CFO at 71.9% of EBITDA, four straight years at 69–79%, no cash-quality flag from `earnings/06_earnings-quality`), but it is cyclical, and the peak working-capital need is not disclosed, so the runway above may be overstated.

**The single biggest liquidity risk is not on the reported balance sheet at all: it is the tenor of the debt funding the $1.75bn Maverick Power purchase, which this data pool does not disclose.** In the case where nVent spends its freely usable cash first, the deal leaves it with $79.6m of cash that it says it cannot readily repatriate and a revolver as its only usable liquidity; and if the committed Bank of America bridge is drawn at a Q4 2026 close and is not termed out within twelve months, the runway falls from "no finite runway" to roughly **7 months**, at which point refinancing access stops being a convenience and becomes the whole question.

**Scores for the synthesizer (MODULE_RULES bands; higher = better on this score).** **Liquidity runway: 82/100** on the reported structure — committed liquidity of $856.0m with disclosed availability, a $483.1m annual FCF surplus, a 12-month maturity of 0.92% of debt, no minimum-liquidity covenant, and no covenant constraint on drawing the facility; held below the high 80s by three real things: 70% of the liquidity is undrawn facility rather than cash, 31.1% of the cash is repatriation-limited, and the FCF is at a cycle peak. **On the pro-forma Maverick structure the same score is 66/100**, and it would fall materially further if the bridge tenor turned out to be short. **No partial-data cap binds** — the revolver's availability is disclosed (so the "availability unknown → max 60" cap does not apply), the cash flow statement is present (so the "no cash flow → max 50" cap does not apply), and `00_solvency-data-triage` confirms no cap from the MODULE_RULES table is active.

**Scope note.** This report measures the runway only. The debt stack belongs to `01`, the maturity wall and refinancing to `02`, covenant headroom to `04`, contingencies to `05`, the downside stress test to `06`, and the solvency verdict to `99_balance-sheet-survival-synthesis`.
