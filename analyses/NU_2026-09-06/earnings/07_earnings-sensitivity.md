# Earnings Sensitivity — NU

**Reporting basis.** Nu Holdings Ltd. (NYSE:NU, Class A ordinary shares, USD) reports under **IFRS Accounting Standards**, in **US dollars**, fiscal year ending 31 December. It is a US foreign private issuer: the audited annual filing is a **Form 20-F**, the quarterly disclosure an **unaudited interim condensed consolidated financial statement**. There is no 10-K or 10-Q and their absence is not a data gap (CLAUDE.md §27). All figures are **US$ millions, reported (IFRS)** unless a cell says otherwise.

**The base every impact in this report is measured against.** **TTM to Jun-30-2026** = Q3'25 + Q4'25 + Q1'26 + Q2'26. Revenue **US$19,340.0m**; income before income taxes (EBT) **US$4,384.6m**; income-tax charge **US$774.6m**, an effective tax rate of **17.67%** and a retention rate of **0.8233**; net income to parent **US$3,607.1m**; diluted EPS **US$0.7348**, which implies **4,908.7m** diluted shares (3,607.1 ÷ 0.7348) — that implied count is used for every per-share conversion so the numerator and denominator sit on the same period basis (CLAUDE.md §15). `[analyses/NU_2026-09-06/earnings/01_historical-financials.md §2]`

**No EBITDA exists for this issuer**, so every impact below is stated in **net income to parent (US$m) and diluted EPS (US$)**, except where a row's coefficient sits on a different metric and says so. A bank income statement has no EBITDA line and the deterministic sidecar agrees (`ciq_facts.json` `ltm_ebitda_m` = unknown). Nothing is manufactured to fill the template.

**Two basis labels that travel with every appearance of the number (CLAUDE.md §15).**
- **Constant-currency ("FX-neutral") and as-reported growth are never blended.** Where a move is measured on the period-**average** rate (an income-statement flow) it says so; the Jun-30-2026 **spot** rate is a balance-sheet basis and is not applied to a revenue or profit flow.
- **The two operating-cash-flow figures are labelled every time.** Company-basis TTM CFO is **−US$1,381.6m** (deposits inside operating, as IAS 7 permits for a bank); the Capital IQ-basis LTM CFO is **−US$10,304.8m**, which moves the **US$8,923.2m** deposit inflow out of operating into financing. They reconcile exactly: −10,304.8 + 8,923.2 = −1,381.6. Neither is used as a sensitivity base; both appear in §6 and carry their labels there.

**Prior in-house memo.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is in the pool and is verdict-bearing. Its verdict is stripped (CLAUDE.md §24) and **no number in this report comes from it.**

**Upstream status.** All three required inputs are present (`01_historical-financials`, `02_revenue-drivers`, `03_margin-drivers`), plus `04_guidance-consensus`, `06_earnings-quality` and the cross-module `business-model/10_external-dependency.md`. No degraded-confidence note is required.

---

## 1. Variable Selection

Seven variables were selected. Six come straight from the highest-magnitude rows of the upstream driver tables — `02_revenue-drivers` §4 rates **credit portfolio**, **blended yield / NIM**, **customer count**, **ARPAC** and **FX translation** as High, and `03_margin-drivers` §5 rates **credit cost**, **loan mix**, **funding cost**, **operating cost / efficiency ratio** and the **effective tax rate** as High. Customer count and ARPAC are not listed separately because they are the two terms of the same identity the credit-portfolio and yield rows already carry (`02` §2: revenue = customers × ARPAC, and 64.21% of revenue is card plus loan interest), and listing them again would count the same money twice. Loan mix is folded into credit cost and risk-adjusted NIM for the same reason. The seventh, **risk-adjusted NIM**, is added because it is the only forward-looking margin number management will anchor to (`04` §2) and `03` §4 names it the primary margin metric — it is flagged throughout as a **composite** of the credit-cost, funding-cost and portfolio rows and is never added to them.

From `business-model/10_external-dependency.md` §1 I carried across the two variables it rates High and quantifies from the filings — **BRL/USD** and the **Brazilian policy rate (Selic/CDI)** — and used that module's §2 reproduction of the company's own disclosed shock tables as the move basis wherever a disclosed shock exists. That module scores external dependency **57/100 (inverted, higher = worse)** and names BRL/USD its single biggest lever; §4 below adjudicates that against my own arithmetic rather than repeating it.

**The two variables the launching brief required are both in, and both are in the top four.** The **IFRS effective tax rate** is here because `03` §7B measures it at **+300.2bp of net margin, 160% of the entire observed Q2'26 net-margin change**, while every operating component together was **−112.0bp** and **pre-tax margin actually FELL 155bp year on year**; `06` §9 measures **40.4% of TTM net income to parent as a non-cash deferred tax credit**; and `04` §6 measures **96.7% of the 12.6% Q2'26 net-income beat** as the tax line while pre-tax landed within 0.5% of the estimate. **BRL/USD** is here because `02` §6a measures **+16.27pp of the +50.29pp** of Q2'26 reported revenue growth as the average-rate move alone (R$5.6625 → R$5.0496, the real appreciating 12.14%), with upstream `01`'s "roughly a fifth" read carried alongside as the lower bound of an honest **+11.3pp to +16.3pp** range. Neither variable requires anything to change in the Brazilian operating business to move reported dollar earnings — that is what makes them distinctive, and §4 says whether it also makes them the largest.

---

## 2. Sensitivity Table

All impacts are **annual**, applied to the TTM base above, and stated as **change in net income to parent (US$m) / change in diluted EPS (US$)**. Rows whose coefficient sits on a different metric say which metric in the impact cells. The full arithmetic for every cell, with its residual, is printed in §2a.

| Variable | Base Case | Move Basis | Bull Case | Impact (bull) | Bear Case | Impact (bear) | Mitigation assumed | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|---|
| **1. Credit cost** — annualised cost-of-credit rate | **10.5%** (Q2'26); 11.6% Q1'26; 8.9% Q2'25 | Historical observed range, six disclosed quarters | **9.5%** (−100bp) | **+US$530.2m / +US$0.1080** | **11.6%** (+110bp — Q1'26's own level, one quarter ago) | **−US$583.3m / −US$0.1188** | **0% — bound.** Realised offset **not computable from this pool**: NU's disclosed history contains no credit downturn, and the one adverse quarter (Q1'26) was followed by a record quarter, so no absorption rate can be measured | Medium | `Q2'26 Earnings Presentation, Aug-13-2026, slides 15–16`; base derived in `03_margin-drivers` §7a |
| **1b. Credit cost** — same driver, company-disclosed measure | **ECL allowance US$6,642.3m** at Jun-30-2026 | **Company-disclosed** macro-scenario re-weighting | 100% **upside** weighting → allowance US$6,223.6m (−US$418.8m, −6.30%) | **+US$344.8m / +US$0.0702** | 100% **downside** weighting → allowance US$7,147.0m (+US$504.7m, +7.60%) | **−US$415.5m / −US$0.0846** | **0% — bound** (the disclosure is a pure re-weighting with no management response inside it). Same non-computable-offset note as row 1 | **High** (company-disclosed) | `Q2'26 interim condensed consolidated financial statements (filed Aug-14-2026), Note 4(a), Sensitivity analysis, p.15` |
| **2. BRL/USD** — translation into the reporting currency | Average **R$5.0496/US$** (Q2'26); spot **R$5.1617** at Jun-30-2026, already 2.2% weaker than the quarter's own average | Bull = the move actually realised (historical); bear = the **company's own 90th-percentile of annual BRL returns over a five-year window** | BRL **+12.14%** (the Q2'25→Q2'26 average-rate move, repeated) | **+US$394.1m / +US$0.0803** | BRL **−17.8%** (the company's own shock) | **−US$577.9m / −US$0.1177** | **0% on the earnings translation — and that zero is DISCLOSED, not assumed:** *"We decided not to hedge our foreign exchange exposure originated by our investments in Brazil, Colombia and Mexico"*. Partial mitigation exists on the **equity** line only: *"net investment hedge is adopted only for a portion of the investments in Brazilian companies"* | Medium (elasticity inferred; shock size company-disclosed) | `FY2025 Form 20-F (filed Apr-08-2026), Item 11, Foreign Exchange Rate Risk`; `Q2'26 interim statements, Note 32, FX risk, p.42`; `Q2'26 Earnings Presentation, FX Rates, pp.34–35` |
| **2b. BRL/USD** — same driver, effect on **equity**, not earnings | Brazilian net investment (FIP) **US$7,695.4m**; all subsidiaries **US$9,082.4m**; total equity **US$11,321.6m** at Dec-31-2025 | **Company-disclosed** shock table | n/a — the disclosure is one-sided | n/a | BRL −17.8%, other currencies −10% | **Impact metric is equity, not earnings: −US$1,369.8m** on the Brazilian net investment, **−US$1,509.6m** across all subsidiaries = **13.3% of total equity** | **0% — disclosed** (the same declined hedge) | **High** (company-disclosed) | `FY2025 Form 20-F, Item 11, Foreign Exchange Rate Risk table; Consolidated Statement of Financial Position (Total equity 11,321,562)` |
| **3. IFRS effective tax rate** | **17.67%** TTM; **14.17%** Q2'26; **11.78%** H1'26; 25.8% FY2025, 29.5% FY2024, 33.0% FY2023 | Historical observed range **and** the two competing forward numbers: management's **15–20%** modelling guide vs the **30.2%** consensus embeds for H2'26 | **11.8%** (the H1'26 filed rate — the low of the observed series) | **+US$257.4m / +US$0.0524** | **30.2%** (the rate consensus embeds, and inside the FY2023–FY2024 filed range of 29.5–33.0%) | **−US$549.4m / −US$0.1119** | **0% — bound** | Medium | `Q2'26 interim statements, statements of income and Note 30`; `Q1 2026 earnings-call transcript, May-14-2026, prepared remarks`; consensus arithmetic reproduced from `04_guidance-consensus.md` §3 |
| **3b. IFRS effective tax rate — realised-offset case (CLAUDE.md §9)** | as above | Realised offset **45%**, computed from the Q2'26 bridge (arithmetic in §2a) | 11.8% | **+US$141.6m / +US$0.0288** | 30.2% | **−US$302.2m / −US$0.0616** | **45% — realised.** The G&A line *"Includes tax expenses arising from intercompany invoices"* rose from US$22.0m to US$136.9m year on year (+188bp of revenue); at the same post-tax conversion the audited bridge uses, that gives back **136.2bp of the +300.2bp** tax gain. *The causal link between that cost and the tax structure is `03`'s read of Note 8 footnote (i) plus timing — inference, not a statement in the filing* | Medium–Low | `Q2'26 interim statements, Note 8 and footnote (i)`; bridge arithmetic in `03_margin-drivers` §7B and §7a |
| **4. Operating cost / efficiency ratio** | **19.5%** (Q2'26); 17.6% Q1'26; 18.63% H1'26 on the company's ratio-of-sums basis | **Management's own guide** (FY2026 ~20% ⇒ H2 at 21.0–21.5%) against the best quarter actually filed | **17.6%** (−1.9pp, Q1'26 filed) — noting management said flatly that *"the 17.6% reported in Q1 was not a run rate"* | **+US$258.6m / +US$0.0527** | **21.5%** (+2.0pp — the top of what management's own FY guide implies for H2) | **−US$272.2m / −US$0.0554** | **Not applicable in the usual sense — the bear case IS management's own guided path**, so it already contains their plan. One component carries a disclosed cap: the US-expansion drag is *"less than 100 basis points"* of the efficiency ratio in each of 2026 and 2027 ⇒ **≤US$136.1m of net income a year** | Medium–High (guide is management-disclosed) | `Q2'26 Earnings Presentation, slide 22`; `Q1 2026 transcript, May-14-2026, prepared remarks`; `Q2 2026 transcript, Aug-13-2026, prepared remarks` |
| **5. Brazilian policy rate (Selic / CDI)** | **Selic 15.00%** at the FY2025 20-F date (Apr-08-2026); average CDI **14.3%** (2025) vs 10.8% (2024). **The pool holds no reading after Apr-08-2026 — the current level is not proven from available data** | Historical observed range (13.75% Aug-2022 → 10.50% May-2024 → 15.00% Jun-2025) | −300bp | **Net earnings impact: not quantifiable — see the two one-sided channels below** | +200bp | **Net earnings impact: not quantifiable** | see the two channel rows | Low (net effect) | `FY2025 20-F, Item 3.D and Item 5, macroeconomic indicators table` |
| **5a. — fair-value channel (DV01)** | **−US$0.685m per +1bp** on the Brazilian risk-free curve at Jun-30-2026 (−US$0.766m at Dec-31-2025) | **Company-disclosed**, and disclosed at two shock sizes so linearity is testable | −400bp | **Impact metric is fair value of the financial position: +US$274.0m** | +400bp | **−US$274.0m** of fair value | **0% — bound** (a parallel-shift mark-to-market by construction) | **High** (company-disclosed) | `Q2'26 interim statements, Note 32, DV01 table, p.42`; `FY2025 20-F, Item 11, Interest Rate Risk, Scenarios 1–3` |
| **5b. — funding-cost channel** | Deposits **US$45.3bn** priced at **88%** of the local interbank rate (91% a year earlier) | Derived from those two disclosed inputs | −300bp | **Impact metric is annual pre-tax funding cost: −US$1,195.9m of cost** (bound) / **−US$980.6m** at the realised offset | +200bp | **+US$797.3m of cost** (bound) / **+US$653.8m** at the realised offset | **0% — bound**, shown beside an **18.3% realised offset** measured from FY2025 (arithmetic in §2a). **Even the offset case remains a bound on the net effect**, because it excludes asset repricing entirely | Low | `Q2'26 Earnings Presentation, slide 14`; `FY2025 20-F, Item 5, p.176` |
| **6. Risk-adjusted NIM** — **COMPOSITE, never add to rows 1, 5 or 7** | **12.42%** (Q2'26, a record); series 9.3 / 9.9 / 10.8 / 10.5 / 9.48 / 12.42% | Management's own forward anchor for the bull; the level printed **one quarter ago** for the bear | *"the same region as where we are today"* — take **+50bp**. The CFO expressly refused to call 12% a floor: *"I didn't say that it was a floor. I said we'd be in that ballpark"* | **+US$265.1m / +US$0.0540** | **9.48%** (−294bp — Q1'26, one quarter before the record) | **−US$1,558.9m / −US$0.3176** | **0% — bound, and the bound is a strong one:** the only adverse move in the disclosed series (−294bp in Q1'26) reversed in full in a single quarter, so annualising a one-quarter move assumes a persistence the record does not show. The one-quarter version is **−US$389.7m / −US$0.0794** | Medium | `Q2'26 Earnings Presentation, slides 15–16`; `Q2 2026 transcript, Aug-13-2026, Q&A` |
| **7. Credit portfolio size (loan book)** | **US$39.4bn** at Jun-30-2026; +37% YoY FX-neutral; QoQ FX-neutral decelerating +11% → +7% → **+5%** | Inferred from the disclosed income mix (card + loan interest = 64.21% of Q2'26 revenue) | +10% of the book at constant yield | **Impact metric is TTM revenue: +US$1,241.8m (+6.4%)**. **Net income impact: not quantifiable near-term — the sign inverts (see below)** | −10% | **−US$1,241.8m of TTM revenue.** Net income: **not quantifiable near-term** | **0% — bound on the revenue line.** Two disclosed ceilings sit on the bull side, and they are constraints rather than mitigations: deposits are growing **+18% FX-neutral against the book's +37%**, absorbed by a loan-to-deposit ratio that has gone **50% → 54% → 58%**; and capital adequacy fell **16.6% → 15.7%** | Medium (revenue); **not quantifiable** (net income) | `Q2'26 Earnings Presentation, slides 13, 14, 16`; `Q2'26 interim statements, Note 6(a)/(b), p.16 and Note 33(a), p.43` |

**Why row 7's net-income impact is marked "not quantifiable" rather than estimated.** Under IFRS 9 the expected loss is recognised **at origination**, so faster growth depresses near-term profit and lifts it a quarter or two later — the sign of this variable's earnings impact depends on the horizon, and the company says so: *"we recognize expected credit losses at origination. So growth increases the allowance before the associated interest income is earned"* `[Q2 2026 transcript, Aug-13-2026, prepared remarks]`. The two most recent quarters demonstrate it: Q1'26 booked a US$1,718.0m charge (34.58% of revenue) and printed the year's worst margins, and the very next quarter delivered a record risk-adjusted NIM with management attributing the +178bp credit-income step-up to *"our strong loan growth in cards and unsecured lending in Q1"*. A single signed number would be false precision.

**Why row 5's net earnings impact is marked "not quantifiable" rather than estimated.** The two channels run opposite and the company discloses no net measure. Funding cost rises with the rate (row 5b), but the asset book is short-duration and reprices within a quarter or two, and float income — interest on other assets at amortised cost, **13.88% of Q2'26 revenue, +53.5% YoY** — rises with the same rate. **The observed record contradicts the bound outright, and I name that contradiction rather than average it away (CLAUDE.md §3):** NIM **expanded 410bp year on year** to 22.9% while the Selic sat at a decade high of 15.00%, and the cost of deposits **fell** from 91% to 88% of the interbank rate over the same window. A single-signed net earnings sensitivity to the policy rate is not supportable from this pool.

---

## 2a. Arithmetic, Basis and Residual For Every Row (CLAUDE.md §15)

Each block prints its own multiplication, names the basis the coefficient was measured on, and states what is left unexplained. No adjective below is used that its printed arithmetic does not support.

**Shared conversion factors, stated once.**
```
Interest-earning base (the denominator every bp-based coefficient uses) = US$64,402m
  Derived from the deck's own two published ratios, NOT imported:
  annualised NII 3,687 x 4 = 14,748 ; NIM 22.9%  =>  14,748 / 0.229 = 64,402
  Cross-check on the SAME base: cost of credit 1,691 x 4 = 6,764 / 64,402 = 10.50%,
  and 22.9% - 10.5% = 12.4% = the published risk-adjusted NIM. The base reconciles exactly.
  [Q2'26 Earnings Presentation, slides 15-16; derivation carried from 03_margin-drivers §7a]
  => 1bp on that base = US$6.4402m of ANNUAL PRE-TAX income

Retention rate = 1 - 0.17667 (TTM effective tax rate) = 0.82333
  => 1bp of any margin on the interest-earning base = US$5.302m of net income to parent
  BASIS WARNING, stated not hidden: every net-income coefficient below the tax line is
  converted at the TTM ETR of 17.67%. At the 30.2% rate consensus embeds, each of those
  coefficients is 15.2% SMALLER. The tax variable and the operating variables are therefore
  not independent - see §5.

Per-share conversion = US$m / 4,908.7m implied diluted shares  =>  US$100m = US$0.02037/share
```

**Row 1 — credit cost (cost-of-credit rate).**
```
Coefficient: 1bp of cost-of-credit rate = 6.4402 x 0.82333 = US$5.302m of net income
Bull  -100bp: 5.302 x 100 = +US$530.2m  (+14.7% of TTM net income; +US$0.1080/sh)
Bear  +110bp: 5.302 x 110 = -US$583.3m  (-16.2%; -US$0.1188/sh)
BASIS: the deck's own annualised cost-of-credit rate over the deck's own interest-earning
  base - numerator and denominator from the same disclosure, same quarter, consolidated.
BULL SIZING, and why it is NOT the observed low: the observed low is 8.9% (Q2'25), i.e.
  -160bp, which would give +US$848.3m. I do not use it. The mix has moved deliberately
  since - unsecured lending is 26% of the book against 25% a year earlier, growing +45%
  YoY FX-neutral, and management attributes the higher loss to "a mix weighted further
  towards unsecured lending and the deliberate risk expansions we made". A return to the
  pre-mix-shift loss rate is not a realistic bull, so the bull is set at -100bp, roughly the
  Q2'26 QoQ improvement of 115bp NET of the ~52bp Desenrola one-off that will not repeat.
KNOWN REVERSAL ALREADY INSIDE THE BASE: Desenrola contributed ~52.5bp of risk-adjusted NIM
  in Q2'26 (5% of a US$1,691m quarterly cost of credit = US$84.6m, US$338.2m annualised,
  / 64,402 = 52.5bp), and "more than 4/5" is already recognised. 52.5 x 5.302 = US$278.4m
  of net income that does not repeat at the same size. That is 47.7% of the bear case -
  i.e. roughly half the bear case is a tailwind switching off, not a deterioration.
  [Q2 2026 transcript, Aug-13-2026, Q&A]
RESIDUAL: the coefficient explains the interest-margin channel of credit cost only. It does
  NOT capture recoveries, stage migration, or write-off timing, which sit inside the same
  charge and are not disclosed quarterly. That unexplained share cannot be sized from this
  pool - it is a stated limitation on the coefficient, not a quantified residual.
```

**Row 1b — credit cost (company-disclosed ECL scenario).**
```
Disclosed, verbatim: weighted average 6,642,313 ; upside 6,223,554 ; base 6,557,298 ;
  downside 7,147,013 (US$ thousands, Jun-30-2026)
  [Q2'26 interim statements, Note 4(a), Sensitivity analysis, p.15]
Downside: 7,147,013 - 6,642,313 = +504,700 = +7.60% of the booked allowance
  Net income: 504.7 x 0.82333 = -US$415.5m (-11.5%; -US$0.0846/sh)
Upside:   6,642,313 - 6,223,554 =  418,759 = -6.30%
  Net income: 418.8 x 0.82333 = +US$344.8m (+9.6%; +US$0.0702/sh)
BASIS: an allowance STOCK re-measured at a different probability weighting. It is a one-time
  P&L charge in the period of re-weighting, not a run-rate change in the charge - so it is
  NOT additive to Row 1, which measures a rate. Same driver, two measurements.
RESIDUAL, named: the disclosure re-weights the macro scenarios only. It holds the
  probability of default, exposure at default, loss given default, the definition of default
  and the look-back period constant - all of which the company lists as key areas of
  judgment in the SAME note. So this scenario moves ONE of five disclosed judgment inputs.
  The other four are unquantified, and the share of total ECL uncertainty that this +7.60%
  covers is not derivable from the pool.
```

**Row 2 — BRL/USD.**
```
Elasticity used: 0.9 of net income per 1% BRL move against the USD
  Built from: Brazil = 91.08% of the Note-34(b) revenue base [Q2'26 interim, Note 34(b), p.43]
  and margin ratios are near-neutral to FX because the same rate translates numerator and
  denominator [03_margin-drivers §5, FX row]. So net income scales with revenue.
Coefficient: 0.9 x 3,607.1 x 0.01 = US$32.46m of net income per 1% BRL move
Bull +12.14%: 32.46 x 12.14 = +US$394.1m (+10.9%; +US$0.0803/sh)
Bear -17.8% : 32.46 x 17.80 = -US$577.9m (-16.0%; -US$0.1177/sh)
BASIS: the period-AVERAGE rate, which is the correct basis for an income-statement flow
  (CLAUDE.md §27). I refuse to apply the Jun-30-2026 SPOT rate of R$5.1617 to an earnings
  flow: that is the balance-sheet basis, and the company itself uses it only for deposits
  and the interest-earning portfolio. Row 2b, which IS a balance-sheet item, uses the
  company's own shock on net equity instead.
SCOPE CAVEAT, NOT NETTED AWAY: the 0.9 elasticity applies the BRL move to ~90% of earnings,
  whereas ~9% of the Note-34 revenue base is Mexican and Colombian peso, which do not move
  with the BRL. To the extent MXN and COP move less, this coefficient is slightly too large.
  The pool has no Q2'25 MXN average rate, so the error cannot be sized - stated limitation,
  not a quantified residual.
UPSTREAM DISAGREEMENT CARRIED, NOT OVERWRITTEN (CLAUDE.md §3): 01_historical-financials put
  the FX share of Q2'26 revenue growth at "roughly a fifth" (+11.3pp of the +50.3pp, from
  the company's FX-neutral GROSS revenue measure); 02_revenue-drivers computed +16.27pp (a
  third) from the actual average-rate move on IFRS total revenue. The honest range is
  +11.3pp to +16.3pp. My elasticity sits on the higher read, because it is built from the
  measured rate on a matched income-statement basis; the lower read is not discarded, and a
  reader who prefers it should scale this coefficient down by roughly 30%.
```

**Row 2b — BRL/USD on equity.**
```
Disclosed, verbatim [FY2025 20-F, Item 11, Foreign Exchange Rate Risk]:
  FIP (Brazil) net equity 7,695,381 x 17.8% = 1,369,778
  All subsidiaries          9,082,370        = 1,509,598 (BRL at 17.8%, others at a 10% standard shock)
  Total equity at Dec-31-2025 = 11,321,562  =>  1,509,598 / 11,321,562 = 13.3% of equity
The 17.8% is the company's own number and it states its own basis: "calculated using the
  90th percentile of the distribution of annual returns, considering a five-year window."
BASIS SEPARATION, stated because conflating the two is the error this row exists to prevent:
  this is a change in the VALUE OF EQUITY through other comprehensive income, NOT a change
  in earnings. It must never be added to Row 2's earnings impact - and business-model
  10_external-dependency's ranking of BRL as the single biggest lever rests partly on this
  equity figure, which is adjudicated by name in §4.
```

**Row 3 — IFRS effective tax rate, and the realised offset.**
```
Coefficient (an identity on filed figures): 1pp of ETR = EBT x 0.01 = 4,384.6 x 0.01
  = US$43.85m of net income
TTM ETR = 774.6 / 4,384.6 = 17.67%. Check: 4,384.6 - 774.6 = 3,610.0 = net income
  including minorities. Ties.
Bull, ETR 11.80% (H1'26 filed): delta -5.87pp => 43.85 x 5.87 = +US$257.4m (+7.1%; +$0.0524)
Bear, ETR 30.20% (consensus-embedded): delta +12.53pp => 43.85 x 12.53 = -US$549.4m
  (-15.2%; -$0.1119)
Where 30.2% comes from, reproduced not asserted [04_guidance-consensus §3]:
  FY26 consensus EBT 5,384.98 - H1'26 filed 2,190.62 = H2 pre-tax 3,194.36
  FY26 consensus net income 4,160.53 - H1'26 filed 1,932.26 = H2 net income 2,228.27
  H2 tax = 966.09  =>  966.09 / 3,194.36 = 30.2%
  Against management's "15% to 20%" modelling guide and 14.17% actually paid in Q2'26.

REALISED-OFFSET CASE (CLAUDE.md §9), computed not assumed:
  Q2'26 tax gain, post-tax, from the audited bridge          = +300.2bp of net margin
  G&A "Others" (incl. tax on intercompany invoices) worsened = -188bp of revenue, pre-tax
    (US$22.0m -> US$136.9m, 0.60% -> 2.48% of revenue)
  Converted at the same prior-year retention the bridge uses: 188 x 0.724377 = 136.2bp
  Realised offset = 136.2 / 300.2 = 45.4%, taken as 45%
  Bear at 45%: -549.4 x 0.55 = -US$302.2m ;  Bull at 45%: +257.4 x 0.55 = +US$141.6m
  QUALIFIER THAT TRAVELS: the causal link - that the intercompany-invoice tax cost arrived
  WITH the corporate restructuring that cut the tax rate - is 03_margin-drivers' read of
  Note 8 footnote (i) ("Includes tax expenses arising from intercompany invoices") plus the
  timing. The filing does not say the two are the same transaction. Inference, labelled.
  [Q2'26 interim statements, Note 8 and footnote (i); 03_margin-drivers §5 and §7B]

RESIDUAL, AND THE SECOND-ORDER RISK THE COEFFICIENT DOES NOT CARRY: this coefficient prices
  a change in the RATE only. It does not price the balance-sheet consequence. 06_earnings-
  quality measures 40.4% of TTM net income to parent (US$1,458.6m of US$3,607.1m) as a
  non-cash deferred tax credit, sitting as a US$3,649.1m deferred tax asset = 27.5% of
  parent equity, with recovery on the loss-carryforward slice capped by Brazilian law at
  30% of taxable profit a year. A rate reversion that ALSO impaired that asset would cost
  more than -US$549.4m, and the excess is not quantifiable from this pool.
```

**Row 4 — operating cost / efficiency ratio.**
```
Coefficient: net revenues US$4,132m (Q2'26) x 4 = US$16,528m annualised
  1pp = US$165.28m pre-tax x 0.82333 = US$136.09m of net income per +1pp
Bull -1.9pp (19.5% -> 17.6%): 136.09 x 1.9 = +US$258.6m (+7.2%; +$0.0527)
Bear +2.0pp (19.5% -> 21.5%): 136.09 x 2.0 = -US$272.2m (-7.5%; -$0.0554)
BASIS: net revenues, NOT IFRS total revenue - the efficiency ratio's own denominator. The
  two differ materially: net revenues 4,132 against IFRS total revenue 5,513.2 in Q2'26, a
  ratio of 74.9%. Applying an efficiency-ratio move to total revenue would be the exact
  basis error §15 forbids. Annualising one quarter's net revenues also assumes the H2 base
  matches Q2'26's - it does not, since revenue is still growing, so the bear is if anything
  understated.
WHERE THE BEAR COMES FROM - it is management's own guide, not my pessimism
  [04_guidance-consensus §2, arithmetic reproduced]: reported quarterly efficiency ratios
  21.4 / 21.3 / 20.3 / 19.9 / 17.6 / 19.5%; H1'26 on the company's ratio-of-sums basis
  = (648 + 806) / (3,672 + 4,132) = 18.63%. For the full year to average ~20%, H2 must run
  at roughly 21.0-21.5%, a step up of 150-195bp from the 19.5% just printed.
RESIDUAL: the disclosed US-expansion cap ("less than 100 basis points" per year) covers at
  most 100bp of the 200bp bear. The remaining 100bp+ is unattributed by management and
  unexplained here - I do not assign it a cause.
```

**Row 5a / 5b — Brazilian policy rate.**
```
5a DV01, disclosed verbatim [Q2'26 interim, Note 32, p.42; FY2025 20-F, Item 11]:
  Brazilian risk-free curve: (685) at 06/30/2026 ; (766) at 12/31/2025, per +1bp, US$ thousands
  Linearity is testable because the company discloses a SECOND shock size on the same curve:
  400bp x 0.766 = US$306.4m against the disclosed 400bp figure of US$306,267k - a 0.04%
  difference, so a linear scale is sound within the disclosed band.
  At the Jun-30-2026 DV01: 400 x 0.685 = US$274.0m of fair value per 400bp.
  BASIS: fair value of the whole financial position under a parallel shift, holding the
  position constant. It is NOT an earnings number, and much of the banking book is carried
  at amortised cost, so it does not flow to net income one-for-one. Never add it to row 5b.

5b funding cost, derived from two disclosed inputs:
  deposits US$45,300m x 88% of the interbank rate x 0.0001 = US$3.986m of annual pre-tax
  interest expense per +1bp
  Bear +200bp: 3.986 x 200 = +US$797.3m of annual cost (bound)
  Bull -300bp: 3.986 x 300 = -US$1,195.9m of annual cost (bound)
REALISED OFFSET, computed from FY2025 - the one funding shock the filings actually measure:
  funding-cost ratio 24.61% -> 29.03% of revenue = +442bp
  gross margin        45.61% -> 42.00%           = -361bp
  absorbed elsewhere = 442 - 361 = 81bp  =>  realised offset = 81 / 442 = 18.3%
  At 18.3%: +200bp = +US$653.8m of cost ; -300bp = -US$980.6m
  HONEST QUALIFIER ON THAT 18.3%: its composition is almost entirely the credit-cost ratio
  falling (27.52% -> 26.66% of revenue, -86bp) plus transactional +6bp. The filing does not
  attribute that credit-cost improvement to a response to the funding shock, so calling the
  full 18.3% "mitigation" is generous. It is the measured absorption, not a proven action.
  [FY2025 20-F, Item 5, p.176; carried from 03_margin-drivers §3]

RESIDUAL - and it is the finding, not a caveat: even at the 18.3% offset, row 5b explains
  0% of the NET earnings effect of a policy-rate move, because the asset-side channel is
  entirely absent from it. The book is short-duration and reprices within a quarter or two,
  and float income is 13.88% of revenue and moves the same way as funding cost. The
  unexplained share of the net effect is therefore 100%, which is why row 5's net earnings
  impact reads "not quantifiable" rather than carrying a number the arithmetic cannot support.
```

**Row 6 — risk-adjusted NIM (composite).**
```
Coefficient: 1bp = 6.4402 x 0.82333 = US$5.302m of net income (same base as row 1)
Bull  +50bp: +US$265.1m (+7.3%; +$0.0540)
Bear -294bp (12.42% -> 9.48%, the Q1'26 level): 5.302 x 294 = -US$1,558.9m (-43.2%; -$0.3176)
PERSISTENCE WARNING, which is why this number must not be read as a forecast: the -294bp
  move is a QUARTERLY observation annualised. The only adverse move in the whole disclosed
  series (Q1'26) reversed in full the next quarter (+294bp). Applying it to a full year
  assumes four quarters of persistence the two-quarter record does not show. The one-quarter
  version is 5.302 x 294 / 4 = -US$389.7m of net income (-10.8%; -US$0.0794/sh).
DOUBLE-COUNT WARNING: risk-adjusted NIM = NIM less cost of credit. It CONTAINS row 1 and
  part of row 5. The company's own Q1'26 -> Q2'26 walk shows the composition: float income
  +5bp, credit income +178bp, cost of credit +115bp, cost of funding -5bp = +293bp against
  a disclosed total of +294bp (1bp of rounding). Cost of credit is 39% of the gross movement
  in that walk. Never add row 6 to rows 1, 5 or 7.
  [Q2'26 Earnings Presentation, slide 16; reconciliation carried from 03_margin-drivers §7a]
```

**Row 7 — credit portfolio size.**
```
Coefficient: card interest 32.75% + loan interest 31.46% = 64.21% of Q2'26 revenue
  [Q2'26 interim statements, Note 6(a)/(b), p.16]
  1% of the book at constant yield = 0.6421% of revenue = 0.006421 x 19,340.0
  = US$124.18m of TTM revenue
Bull +10%: +US$1,241.8m of TTM revenue (+6.4%) ; Bear -10%: -US$1,241.8m
BASIS, mixed and labelled: the numerator (interest income) is a FLOW translated at average
  rates; the denominator (the US$39.4bn portfolio) is a period-END balance at closing rates,
  gross of provisions, and includes non-interest-earning transactor card balances. This is
  an approximate blended relationship, NOT the company's own interest-earning-portfolio
  yield, which is not disclosed quarterly in this pool.
RESIDUAL / why no net-income number: the IFRS 9 origination effect inverts the sign over one
  to two quarters (see §2). The company's own allowance bridge sizes the mechanism -
  US$342m of the ~US$500m Q2'26 allowance build was portfolio GROWTH, US$170m deliberate
  risk expansion, "all other movements immaterial" - but gives no net profit conversion.
  A signed net-income figure is not supportable, so none is given.
  [Q2 2026 transcript, Aug-13-2026, prepared remarks]
```

---

## 3. Sensitivity Ranking

Ranked by **absolute impact on net income to parent (US$m), the average of |bull| and |bear|**, on the **primary case** — that is, the realised-offset case wherever an offset is computable (CLAUDE.md §9), and the bound where it is not. The bound figure is shown alongside so nothing is hidden. **Rows whose coefficient sits on a different metric are ranked separately at the bottom, because ranking them against a net-income number would be a unit mismatch.**

| Rank | Variable | Absolute Impact, net income (avg of bull + bear) | Bound-basis figure, where it differs | Direction of Current Trend |
|---:|---|---:|---:|---|
| 1 | **Credit cost** (cost-of-credit rate basis) | **US$556.8m** (15.4% of TTM net income) | same — no offset computable | **Favourable, and not a run-rate.** Improved 115bp QoQ but is **160bp worse year on year** (10.5% vs 8.9%); ~52bp of the QoQ gain is Desenrola, four-fifths already booked; 90+ day NPLs rose 35bp to **6.9%**, the highest in the 13-quarter disclosed series |
| 2 | **BRL/USD** (earnings translation) | **US$486.0m** (13.5%) | same — the 0% mitigation is disclosed, not assumed | **A fading tailwind.** The real appreciated 12.14% on the quarterly average, but spot at Jun-30-2026 (R$5.1617) was already **2.2% weaker than the quarter's own average**, and the year-ago base is harder. No BRL reading after Jun-30-2026 is in the pool |
| 3 | **IFRS effective tax rate** | **US$221.9m** (6.2%) at the 45% realised offset | **US$403.4m** (11.2%) at the 0% bound | **A tailwind at its own extreme.** 33.0% → 29.5% → 25.8% → 17.67% TTM → 14.17% in Q2'26, **below management's own 15–20% guide**, against a Brazilian statutory rate that ROSE from 40% to 42.5% |
| 4 | **Credit cost** (company-disclosed ECL scenario basis) | **US$380.2m** (10.5%) | same — bound | Same driver as rank 1, measured as a one-time re-weighting rather than a rate. **Do not add to rank 1** |
| 5 | **Operating cost / efficiency ratio** | **US$265.4m** (7.4%) | not applicable — the bear IS the guided path | **A stated headwind.** Management guides FY26 to ~20% against 18.63% delivered in H1'26, which requires H2 at 21.0–21.5%, i.e. **150–195bp worse than the 19.5% just printed** |
| — | **Risk-adjusted NIM** (COMPOSITE — contains ranks 1 and 4 and part of the rate row; **not additive, shown for completeness**) | **US$912.0m** annualised (25.3%) / **US$327.4m** on one-quarter persistence | same — bound | **At a record, and expressly not called a floor.** 12.42%, the top of the disclosed six-quarter series, after moving −294bp and then +294bp in consecutive quarters |
| — | **Brazilian policy rate** (different metrics) | **Net earnings impact: not quantifiable** | Fair value **±US$274.0m** at ±400bp (disclosed); annual pre-tax funding cost **+US$797.3m** at +200bp (bound) / **+US$653.8m** at the 18.3% realised offset | **Unknown.** Selic 15.00% at the Apr-08-2026 filing date and no later reading in the pool. The direction of the net earnings effect is ambiguous — the observed record (NIM +410bp at a decade-high Selic) runs against the funding-cost bound |
| — | **Credit portfolio size** (different metric) | **Net income: not quantifiable near-term** (the sign inverts under IFRS 9) | TTM revenue **±US$1,241.8m** at ±10% | **Growing but decelerating.** +37% YoY FX-neutral; QoQ FX-neutral +11% → +7% → **+5%**. Deposits growing at half that rate, absorbed by a loan-to-deposit ratio rising 50% → 54% → 58% |

**The launching brief's framing, tested against my own arithmetic and adjudicated by name (CLAUDE.md §3).** The brief carried forward that the effective tax rate and BRL/USD are the two largest earnings sensitivities, ahead of any operating line. My arithmetic **partly disagrees, and I state where.** On absolute impact, **credit cost (US$556.8m) edges BRL/USD (US$486.0m), and both are larger than the tax rate at its realised-offset case (US$221.9m) and at its zero-mitigation bound (US$403.4m).** Three things are nonetheless true and support the brief's underlying point: (i) the three sit inside one band — first to third at the bound is US$556.8m against US$403.4m, roughly 4% of TTM net income apart, which is not a wide separation and should not be treated as one; (ii) **tax and FX are the only two variables on this list that move reported dollar earnings with nothing changing in the Brazilian operating business at all**, which is a different and arguably more important property than raw magnitude; and (iii) on the measure the brief was actually pointing at — what moved the *last* print — tax wins outright, because `03` §7B measures **100% of Q2'26's net-margin expansion as the tax line** while operating components together were **−112bp**, and `04` §6 measures **96.7% of the Q2'26 net-income beat** as tax while pre-tax landed within 0.5% of the estimate. Magnitude and attribution answer two different questions; both answers are printed above.

---

## 4. The Single Highest-Sensitivity Variable

**Credit cost — the expected-credit-loss charge — moves earnings more than anything else, it is external in origin and company-controlled in exposure, and it currently sits at a level that contains a tailwind management has already told the market is switching off.**

The size of the lever is disclosed, not inferred. It sits between a 22.9% NIM and a 12.42% risk-adjusted NIM, so **roughly 46% of the interest margin is consumed by credit losses before a single operating dollar is spent** `[Q2'26 Earnings Presentation, slide 15]`. On the interest-earning base derived above, each basis point of the cost-of-credit rate is **US$5.302m of net income a year**; the rate moved **−263bp and then +115bp** across the last two quarters, a 378bp round trip worth **US$2.0bn of annualised net income** in six months — larger than every other component of the company's own margin walk combined `[Q2'26 Earnings Presentation, slide 16]`. It is also the variable with the best-evidenced move size, because the company publishes a scenario table for it: a re-weighting to a 100% downside macro scenario adds **US$504.7m to the allowance (+7.60%)**, or **−US$415.5m of net income** `[Q2'26 interim statements, Note 4(a), p.15]`.

**Is it company-controlled or external?** Both, and the split matters. The *rate* is set by the Brazilian consumer-credit cycle, which management does not control — GDP growth slowed to 2.3% in 2025 from 3.4%, and one government programme (Desenrola) moved a quarter's cost of credit by about 5% on its own. But the *exposure* is a deliberate choice: unsecured lending is 26% of the book against 25% a year earlier and grew **+45% YoY FX-neutral**, and management attributes the higher loss rate to *"a mix weighted further towards unsecured lending and the deliberate risk expansions we made"*, with the CFO saying of rising 90+ day delinquency that over two years *"the general trend is upwards, and that's being driven by the mix"* `[Q2 2026 transcript, Aug-13-2026, prepared remarks and Q&A]`. A company can stop expanding into unsecured lending; it cannot stop a Brazilian credit cycle.

**What would need to happen for it to swing to the adverse case.** Three observable things, each already partly in motion. First, **the Desenrola tailwind ends** — that alone is ~52bp of risk-adjusted NIM, **US$278.4m of annualised net income, 47.7% of my bear case**, and management has already said *"more than 4/5"* was recognised in Q2'26 with only *"a little bit more impact"* in Q3'26. Second, **the allowance build stops being explained by growth.** In Q2'26, US$342m of the ~US$500m build was portfolio growth and US$170m deliberate risk expansion, with *"all other movements immaterial"* — if the Q3'26 bridge (expected Nov-12-2026) shows growth contributing materially less than that ~68% share, with the balance from stage migration or reserve strengthening, the charge is paying for losses rather than for lending. Third, **the delinquency drift continues**: 90+ day NPLs at 6.9% are the highest in the 13-quarter disclosed series, and gross card receivables overdue at any age rose from 11.0% to 12.5% in six months `[Q2'26 Earnings Presentation, slide 17; 06_earnings-quality §3]`.

**One correction to the cross-module read, flagged rather than merged.** `business-model/10_external-dependency.md` §5 names BRL/USD the single biggest lever, on the grounds that *"nothing else in the disclosures is that large"* — comparing a **US$1,369.8m equity shock** against a **US$306.3m fair-value** rate shock and a **US$381.5m provision** shock. That comparison mixes an equity-value number with two earnings-side numbers, which are different units. Measured consistently on **earnings**, the BRL shock is **US$577.9m of net income** and the credit-cost range is **US$530.2m to US$583.3m** — so on earnings the two are effectively tied, and credit cost edges ahead on the average of bull and bear. On **equity** that module is right and unchallenged: the FX exposure of US$1,509.6m across all subsidiaries, 13.3% of total equity, is the largest single number in the whole disclosed sensitivity set. Both readings are correct on their own basis, and neither is averaged into the other.

---

## 5. Interaction Effects

**These variables do not move independently, and three of the pairings compound rather than offset.**

**(a) BRL, the Brazilian policy rate and credit cost move together, all in the adverse direction.** A depreciating real is normally met by a higher Selic (to defend the currency and contain imported inflation), and a higher policy rate raises both the funding cost — deposits reprice at 88% of the interbank rate within roughly one quarter, with no negotiation — and household debt service, which raises the credit-loss rate. The bear cases of variables 1, 2 and 5 are therefore correlated, not independent: a reader adding the FX bear (−US$577.9m) to the credit-cost bear (−US$583.3m) is not double counting, they are compounding. Against that, `03` §3 records the one lever the filings show working through exactly this channel: the cost of deposits **fell from 91% to 88% of the interbank rate while the Selic sat at a decade high**, so the spread was managed against the external rate rather than passively tracked.

**(b) The tax rate and credit cost are linked in the OPPOSITE direction — a partial natural hedge, and it is worth naming precisely.** The deferred tax credit that produces the low effective rate is generated by booking credit-loss provisions that Brazil does not yet allow as a tax deduction `[06_earnings-quality §10]`. So a credit shock that raises the provision charge simultaneously *raises* the deferred tax credit and *lowers* the effective tax rate, softening the net-income hit. The reverse is the more dangerous case: **a slowdown in loan growth removes the provision build AND the tax credit at the same time**, so the tax bear and the growth bear arrive together. `06` states the mechanism plainly — the credit *"keeps arriving only while the provision build outruns tax-deductible write-offs, which is only true while the loan book grows fast"*, and in H1'25 the reverse happened and the deferred line was a net expense. The size of the hedge is not disclosed and I do not estimate it.

**(c) The tax rate is not independent of any operating coefficient in this report.** Every net-income coefficient below the pre-tax line is converted at the TTM effective tax rate of 17.67%. At the 30.2% rate consensus embeds, **each of those coefficients is 15.2% smaller** — the credit-cost bear falls from −US$583.3m to −US$494.7m, the efficiency-ratio bear from −US$272.2m to −US$230.8m. So the tax variable scales the whole table, which is a second reason it belongs in it beyond its own direct impact.

**(d) Credit portfolio growth, credit cost and risk-adjusted NIM are mechanically linked, and the link inverts the sign over one to two quarters.** IFRS 9 books the expected loss at origination, so growth raises the charge in quarter *t* and the interest income in quarter *t+1*. Q1'26 and Q2'26 are the demonstration: the worst charge in the series was followed immediately by the record margin. Any scenario that moves growth must move credit cost the same way first and risk-adjusted NIM the opposite way second.

**(e) The tax tailwind and the G&A "Others" headwind arrive together** — that is the 45% realised offset computed in §2a, and it is why the tax bear is run at −US$302.2m as the primary case rather than at the −US$549.4m bound.

**One pairing that does NOT compound, stated so it is not assumed to:** BRL and margin. `03` §5 finds FX near-neutral on margin *ratios*, because the same rate translates numerator and denominator. The FX effect is on **levels only** — it does not amplify the credit-cost or efficiency-ratio moves, it scales the dollar size of everything.

---

## 6. Non-Linear Or Asymmetric Risks

Five, each evidenced. They are the reason the volatility score in §7 sits where it does rather than in the band below.

**(a) The deferred tax asset is a step, not a slope, and it sits at 27.5% of parent equity.** The tax variable's coefficient prices a change in the *rate*. It does not price what happens to the **US$3,649.1m deferred tax asset** — up 45.3% in six months against pre-tax profit growth of 30.8% — if the loan book stops growing fast enough to keep generating non-deductible provisions. Recovery on the loss-carryforward slice is capped by Brazilian law at **30% of taxable profit a year**, so the asset cannot be recovered quickly even if profits hold. A rate reversion accompanied by a recoverability question costs more than the −US$549.4m bound, and the excess is not quantifiable from this pool `[06_earnings-quality §6 and §10]`.

**(b) Downside asymmetry in credit cost, because the price lever on the largest product is closed by statute.** Law 14,690/2023 and CMN Res. 5,112/2023 cap total interest and charges on revolving and instalment card financing at no more than the original debt, and the INSS payroll-loan rate is capped with the Selic itself as the index `[FY2025 20-F, Item 4.B]`. Card interest is **32.75% of revenue**. So when the input cost of a lender — the credit charge — rises, the company cannot raise the price of its largest revenue line to recover it. That is a genuine asymmetry: cost can rise faster than price is legally permitted to follow. **Note precisely what this is and is not:** it is a fact about a statutory ceiling, not a measurement of realised pass-through. NU can still recover cost through mix, through where and how it funds itself, and through its other products — and `03` §3 measures it doing exactly that in FY2025, absorbing 18.3% of a funding shock in other cost lines. The two must not be conflated.

**(c) A one-quarter shock and a one-year shock are very different numbers, and the disclosed record shows the shorter one.** The only adverse move in the risk-adjusted-NIM series (−294bp in Q1'26) reversed in full in one quarter. Annualising it gives −US$1,558.9m; taking it as a single quarter gives −US$389.7m. **Both are in §2 and neither is presented alone**, because a bear case built on four quarters of persistence would assert a durability the two-quarter record does not support.

**(d) Two hard ceilings on the growth variable, both threshold effects rather than slopes.** Funding: deposits are growing **+18% YoY FX-neutral against a book growing +37%**, and the gap is absorbed by a loan-to-deposit ratio that has risen **50% → 54% → 58%** on the deck's average basis — a finite runway, not a permanent source. Capital: the Brazilian prudential conglomerate's CAR fell **16.6% → 15.7%**, with regulatory capital of US$5,597.6m against a minimum required of US$3,749.6m, i.e. an excess margin of **US$1,848.0m** that *fell* from US$1,889.6m while risk-weighted assets rose 14.7% `[Q2'26 interim statements, Note 33(a), p.43]`. Growth does not decay smoothly against either constraint; it stops.

**(e) The reported net-margin band understates the volatility underneath it, and that is itself the asymmetry.** Across the last eight quarters reported net margin sat in a **17.16%–19.23% band — a range of only 206bp**. That looks like a stable business. It is not what happened: `03` §7B shows Q2'26's +187bp of net-margin expansion was **+300.2bp of tax against −112.0bp of operating components**, two large opposite swings netting to a narrow number. Stability produced by offsetting shocks is not stability; it is a coincidence that unwinds the moment the two stop cancelling, and the tax leg is the one management's own guide (15–20% against 14.17% delivered) says is nearer its limit.

**Two candidates checked and NOT found.** Classic operating deleverage does not apply — the cost base is 20% of net revenues and the two largest cost lines (funding, credit) are variable with volume, not fixed. And there is no covenant-threshold non-linearity in this pool: the company is in **net cash of US$7,811.0m on a strict, filing-confirmed basis** at Jun-30-2026 (borrowings 4,682.3 + repurchase agreements 1,058.3 − cash 13,551.6), so a debt/EBITDA trigger cannot bind — and EBITDA does not exist for this issuer in any case `[01_historical-financials §2]`. **Cash flow is a separate matter and is recorded with its basis rather than converted into a sensitivity:** company-basis TTM CFO is **−US$1,381.6m** and Capital IQ-basis LTM CFO is **−US$10,304.8m** (which nets the US$8,923.2m deposit inflow); on the company's own basis it swung from +US$3,640.0m (H1'25) to −US$1,242.0m (H1'26), because the credit book grew US$14,740.0m against only US$5,302.6m of deposit and network-payable funding. That is a funding-runway constraint on variable 7, already captured in (d), not an independent sensitivity.

---

## 7. Earnings Volatility Score

# 66 / 100 — **INVERTED: higher = WORSE**

**Band 61–80: high volatility — multiple variables with large impact.**

**The one-line reason:** three separate variables can each move net income by more than 13% in a year on their own disclosed or observed ranges — credit cost (±US$530m–583m), BRL/USD (+US$394m / −US$578m) and the effective tax rate (+US$257m / −US$549m at the bound) — while **40.4% of the last twelve months' reported profit is a non-cash deferred tax credit** and the company's own primary margin metric moved **294 basis points in a single quarter**.

**Why not lower.** The reported net-margin band of 206bp over eight quarters looks calm, but §6(e) shows it was produced by a +300bp tax swing cancelling a −112bp operating swing, not by underlying stability. The single largest sensitivity (credit cost) has no computable realised offset in this pool, because NU's disclosed history contains no credit downturn to measure one from. The policy-rate exposure cannot even be signed. And the two biggest exposures — the currency and the statutory price cap — are the two the company explicitly cannot or will not mitigate: it *"decided not to hedge"* the translation exposure, and Law 14,690/2023 removes the price lever on 32.75% of revenue.

**Why not higher (why not 81+).** The disclosure quality is unusually good for this kind of work: the company publishes a DV01 at two shock sizes across five curves, a full FX shock table with its own stated percentile basis, an ECL macro-scenario sensitivity refreshed at the latest interim date, and a quarter-on-quarter margin walk that reconciles to within one basis point. Most of the coefficients above are therefore company-disclosed or one linear step from a disclosure, not guesses — so the **MODULE_RULES cap requiring Low confidence where only inferred sensitivities exist does not bind**. The book is short-duration and reprices fast, the balance sheet is in net cash of US$7,811.0m (strict basis), and the filings show measured absorption of past shocks (18.3% of the FY2025 funding shock; FGTS lending losses *"more than offset by the growth in public consignado"*). A score above 80 would say earnings are dominated by external variables; here management demonstrably offsets some of them, and the largest single exposure is a choice about mix and hedging rather than a fixed condition.

---

## 8. Citations

All documents live in the frozen extract generation and are cited logically as `data/NU/`.

- **`FY2025 Form 20-F (filed Apr-08-2026), Item 11 — Quantitative and Qualitative Disclosures About Market Risk`** — Interest Rate Risk Scenarios 1–3 (DV01 by curve; 400bp Brazilian shock (306,267); 200bp US shock (6,607)); Foreign Exchange Rate Risk (*"We decided not to hedge our foreign exchange exposure originated by our investments in Brazil, Colombia and Mexico"*; the 17.8% BRL shock and its stated basis — *"calculated using the 90th percentile of the distribution of annual returns, considering a five-year window"*; FIP 7,695,381 → 1,369,778; total 9,082,370 → 1,509,598).
- **`FY2025 Form 20-F, Consolidated Statement of Financial Position`** — total equity 11,321,562 at Dec-31-2025.
- **`FY2025 Form 20-F, Item 5`** — cost of financial and transactional services component table, p.176 (funding cost 24.61% → 29.03% of revenue; credit cost 27.52% → 26.66%; transactional 2.26% → 2.32%); gross margin 45.61% → 42.00%, p.177; macroeconomic indicators table (average CDI 14.3% in 2025 vs 10.8% in 2024; GDP growth 2.3% vs 3.4%).
- **`FY2025 Form 20-F, Item 3.D`** — Selic path (13.75% Aug-2022 → 10.50% May-2024 → 15.00% Jun-2025) and the 15.00% level as of the annual-report date.
- **`FY2025 Form 20-F, Item 4.B`** — Law 14,690/2023 and CMN Res. 5,112/2023 revolving and instalment card charge cap; the INSS payroll-loan rate capped with Selic as its index.
- **`Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026), Note 4(a) — Sensitivity analysis, p.15`** — ECL for credit card receivables and loans at Jun-30-2026: weighted average 6,642,313; upside 6,223,554; base case 6,557,298; downside 7,147,013; and the four listed key areas of judgment.
- **`Q2'26 interim statements, Note 32 — Market risk and IRRBB, p.42`** — DV01 table at 06/30/2026 and 12/31/2025 (Brazilian risk-free (685)/(766); Colombian (415)/(257); Turkish (125)/(147); Mexican (59)/(42); US 2/(33)); VaR table; FX risk (*"net investment hedge is adopted only for a portion of the investments in Brazilian companies"*; no significant unhedged FX exposures at either date).
- **`Q2'26 interim statements, Note 6(a) and 6(b), p.16`** — the ten income lines used for the 64.21% card-plus-loan share and the 13.88% float share.
- **`Q2'26 interim statements, Note 8 and footnote (i)`** — G&A "Others" US$136.9m (Q2'26) vs US$22.0m (Q2'25); footnote (i) *"Includes tax expenses arising from intercompany invoices"*.
- **`Q2'26 interim statements, Statements of Income and Note 30 (Income Tax)`** — Q2'26 tax 175,224 on pre-tax 1,236,313 (14.17%); H1'26 tax 258,099 on pre-tax 2,190,619 (11.78%).
- **`Q2'26 interim statements, Note 33(a), p.43`** — regulatory capital 5,597,604; minimum capital required 3,749,565; excess margin 1,848,040; CAR 15.7% (16.6% at Dec-31-2025); RWA 35,710,139.
- **`Q2'26 Earnings Presentation, Aug-13-2026`** — slide 13 (credit portfolio US$39.4bn, product mix, FX-neutral growth); slide 14 (deposits US$45.3bn, cost of deposits 88% of the interbank rate); slide 15 (NII US$3,687m, NIM 22.9%, risk-adjusted NIM series, cost of credit US$1,691m); slide 16 (risk-adjusted NIM QoQ walk +5 / +178 / +115 / −5 = +294bp; average loan-to-deposit ratio 50 / 54 / 58%); slide 17 (NPL 15–90 and 90+ series); slide 22 (net revenues US$4,132m, opex US$806m, efficiency ratio 19.5%); pp.34–35 (FX-neutral methodology; average R$5.0496 Q2'26 and R$5.6625 Q2'25; spot R$5.1617 at Jun-30-2026).
- **`Q2 2026 earnings-call transcript, Aug-13-2026` (verbatim, S&P Global)** — prepared remarks (IFRS 9 origination mechanism; allowance bridge US$342m growth / US$170m risk expansion; cost-of-deposits commentary; Q2'26 credit income driven by Q1 lending; *"the 17.6% reported in Q1 was not a run rate"*) and Q&A (Desenrola *"about 5%"* of cost of credit and *"more than 4/5"* already recognised; *"I didn't say that it was a floor. I said we'd be in that ballpark"*; NPL *"the general trend is upwards, and that's being driven by the mix"*).
- **`Q1 2026 earnings-call transcript, May-14-2026` (verbatim, S&P Global)** — FY26 efficiency-ratio guide of ~20%; IFRS effective tax rate *"for the remainder of 2026 to converge towards the 15% to 20% range"*; US opex headwind *"less than 100 basis points"* on the consolidated efficiency ratio in each of 2026 and 2027.
- **`Capital IQ Estimates → Consensus, data as of Aug-26-2026`** — FY2026 consensus EBT 5,384.98m and net income 4,160.53m, used only to derive the 30.2% embedded H2'26 tax rate. The vendor's recommendation and target price are analyst verdicts and are stripped (CLAUDE.md §24).
- **`ciq_facts.json`** (deterministic sidecar for this extract generation) — `ltm_ebitda_m` unknown ("Income Statement sheet has no 'EBITDA' row"), `ltm_ocf_m` −10,304.8, `net_debt_ebitda_x` unknown.
- **Upstream earnings module** — `01_historical-financials.md` (TTM base, net debt, the two-basis CFO reconciliation), `02_revenue-drivers.md` (driver table, FX decomposition and its +11.3pp–+16.3pp range, cycle position), `03_margin-drivers.md` (cost stack, margin ladder, both bridges and their reconciliations, the 18.3% FY2025 realised offset, the Desenrola derivation, the interest-earning-base derivation), `04_guidance-consensus.md` (management's four numeric guides; the 30.2% embedded tax-rate arithmetic; the Q2'26 beat attribution), `06_earnings-quality.md` (deferred tax credit, deferred tax asset, cash tax, delinquency series).
- **Cross-module** — `analyses/NU_2026-09-06/business-model/10_external-dependency.md` (external variable identification, the disclosed shock tables it reproduces, the 57/100 inverted dependency score, and the single-biggest-lever read adjudicated in §4).

**Not used as a source for any number:** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` (verdict-bearing prior in-house memo; verdict stripped per CLAUDE.md §24).

---

## 9. Machine-Readable Sensitivity Sidecar (`sensitivity_summary.json`)

The payload below conforms to `frameworks/sensitivity_summary.schema.json` and carries the nine clean per-unit coefficients behind §2 (rows 1, 1b, 2, 3, 4, 5a, 5b, 6, 7). Each coefficient reproduces this report's bull and bear impacts when multiplied by this report's bull and bear deltas — that is the check, and it passes for all nine. **Row 2b (the FX shock on equity) is deliberately omitted**: the company discloses a single shock size, not a per-unit rate, so no coefficient exists and none was invented.

**This run was instructed to write only `07_earnings-sensitivity.md`, so the payload is emitted inline here rather than as a separate file. It should be persisted verbatim to `analyses/NU_2026-09-06/earnings/sensitivity_summary.json` for `scripts/sensitivity_math.py` to scale deterministically.**

```json
{
  "schema_version": "1.0",
  "ticker": "NU",
  "as_of": "2026-09-06",
  "currency": "USD",
  "base_metric": "net_income_to_parent_usd_m",
  "base_value": 3607.1,
  "base_value_source": "analyses/NU_2026-09-06/earnings/01_historical-financials.md §2 TTM snapshot, built from Q2'26 and Q1'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026 and May-14-2026) plus Capital IQ Estimates→Surprise actuals for Q3'25 and Q4'25, data as of Aug-2026; ties to Capital IQ LTM net income 3,607.106",
  "base_period": "TTM to Jun-30-2026 (Q3'25+Q4'25+Q1'26+Q2'26), IFRS, reported",
  "revenue_base": 19340.0,
  "revenue_period": "TTM to Jun-30-2026 (Q3'25+Q4'25+Q1'26+Q2'26), IFRS, reported",
  "sensitivities": [
    {
      "variable": "cost_of_credit_rate",
      "label": "Cost of credit (annualised cost-of-credit rate)",
      "unit": "bp of annualised cost-of-credit rate",
      "base_value": 10.5,
      "coefficient": -5.302,
      "confidence": "medium",
      "basis": "inferred",
      "valid_range": {"low": -100, "high": 110},
      "non_linearity": "Zero-mitigation bound; no realised offset is computable from this pool because NU's disclosed history contains no credit downturn. ~52bp of the current level is the Desenrola policy tailwind, four-fifths already recognised, so ~US$278m of the bear case is a tailwind switching off rather than a deterioration. Do NOT add to ecl_allowance_macro_weighting (same driver, two measurements) or to risk_adjusted_nim (which contains this row). Statutory caps on card charges (Law 14,690/2023) block price recovery on 32.75% of revenue.",
      "source": "Q2'26 Earnings Presentation, Aug-13-2026, slides 15-16 (NIM 22.9%, risk-adjusted NIM 12.42%, cost of credit US$1,691m); interest-earning base US$64,402m derived from the same two disclosed ratios in 03_margin-drivers §7a"
    },
    {
      "variable": "ecl_allowance_macro_weighting",
      "label": "Expected-credit-loss allowance — macro scenario re-weighting",
      "unit": "% change in the ECL allowance",
      "base_value": 6642.3,
      "coefficient": -54.68,
      "confidence": "high",
      "basis": "inferred",
      "valid_range": {"low": -6.30, "high": 7.60},
      "non_linearity": "A linear restatement of a company-disclosed scenario table (100% downside = +7.60%, 100% upside = -6.30%). It is a one-time re-measurement of an allowance STOCK, not a run-rate change in the charge, so it is not additive to cost_of_credit_rate. The disclosure moves only the macro weighting and holds PD, EAD, LGD, the definition of default and the look-back period constant - four of five disclosed judgment inputs are unquantified. Bound; no mitigation assumed.",
      "source": "Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026), Note 4(a) Sensitivity analysis, p.15"
    },
    {
      "variable": "brl_usd_translation",
      "label": "BRL/USD — translation of earnings into the reporting currency",
      "unit": "% appreciation of BRL vs USD on the period-AVERAGE rate (base_value is the Q2'26 average rate, R$/US$)",
      "base_value": 5.0496,
      "coefficient": 32.46,
      "confidence": "medium",
      "basis": "inferred",
      "valid_range": {"low": -17.8, "high": 17.8},
      "non_linearity": "Mitigation is 0% and that zero is DISCLOSED, not assumed - the company states it 'decided not to hedge' the translation exposure on its Brazilian, Colombian and Mexican investments; a partial net-investment hedge exists on the EQUITY line only. Elasticity of 0.9 assumes ~90% of earnings are non-USD and that margin ratios are FX-neutral; ~9% of the Note-34 revenue base is MXN/COP and does not move with the BRL, so the coefficient is slightly too large by an amount the pool cannot size. Applies to the average rate only - the Jun-30-2026 spot rate of R$5.1617 is a balance-sheet basis and must not be used on an earnings flow. Upstream 01 reads the FX share of Q2'26 growth lower (+11.3pp vs +16.3pp); a reader on that read should scale this coefficient down ~30%.",
      "source": "FY2025 Form 20-F (filed Apr-08-2026), Item 11 Foreign Exchange Rate Risk (17.8% shock = the 90th percentile of annual returns over a five-year window; 'We decided not to hedge...'); Q2'26 Earnings Presentation, FX Rates pp.34-35 (R$5.6625 -> R$5.0496); Q2'26 interim statements, Note 34(b) p.43 (Brazil 91.08% of the Note-34 revenue base)"
    },
    {
      "variable": "ifrs_effective_tax_rate",
      "label": "IFRS effective tax rate",
      "unit": "pp of IFRS effective tax rate",
      "base_value": 17.67,
      "coefficient": -43.85,
      "confidence": "medium",
      "basis": "inferred",
      "valid_range": {"low": -5.87, "high": 12.53},
      "non_linearity": "An identity on filed figures (TTM pre-tax profit US$4,384.6m x 1pp). Zero-mitigation BOUND. A realised offset of 45% is computable and is the primary case in the report: the intercompany-invoice tax cost inside G&A 'Others' rose 188bp of revenue (US$22.0m -> US$136.9m), giving back 136.2bp of the +300.2bp tax gain (136.2/300.2 = 45%) - the causal link to the tax restructuring is an inference from Note 8 footnote (i) plus timing, not a statement in the filing. Multiply by 0.55 for the realised-offset case. This coefficient prices the RATE only: it does not price the US$3,649.1m deferred tax asset (27.5% of parent equity, recovery on the loss-carryforward slice capped at 30% of taxable profit a year), so an adverse move that also impairs that asset costs more than the linear scale. The rate also scales every other net-income coefficient here, which are all converted at 17.67%.",
      "source": "Q2'26 interim statements (filed Aug-14-2026), Statements of Income and Note 30 (Q2'26 tax 175,224 on pre-tax 1,236,313 = 14.17%; H1'26 11.78%); Q1 2026 earnings-call transcript, May-14-2026, prepared remarks (15-20% modelling guide); consensus-embedded 30.2% derived in 04_guidance-consensus §3"
    },
    {
      "variable": "efficiency_ratio",
      "label": "Operating cost / efficiency ratio (opex ÷ net revenues; lower is better)",
      "unit": "pp of efficiency ratio",
      "base_value": 19.5,
      "coefficient": -136.09,
      "confidence": "medium",
      "basis": "inferred",
      "valid_range": {"low": -1.9, "high": 2.0},
      "non_linearity": "Measured on NET REVENUES (US$4,132m in Q2'26, annualised x4), the efficiency ratio's own denominator - NOT on IFRS total revenue of US$5,513.2m; applying it to total revenue is a basis error. The bear end of the range IS management's own guided path (FY26 ~20% against 18.63% in H1'26 implies H2 at 21.0-21.5%), so no mitigation is assumed or available. One component is capped by management at 'less than 100 basis points' a year (US expansion) in each of 2026 and 2027. Annualising one quarter's net revenues understates the bear because revenue is still growing.",
      "source": "Q2'26 Earnings Presentation, Aug-13-2026, slide 22 (opex US$806m ÷ net revenues US$4,132m = 19.5%); Q1 2026 and Q2 2026 earnings-call transcripts, prepared remarks (FY26 ~20% guide; '17.6% ... was not a run rate'; US drag <100bp)"
    },
    {
      "variable": "risk_adjusted_nim",
      "label": "Risk-adjusted NIM (interest margin after credit losses) — COMPOSITE",
      "unit": "bp of annualised risk-adjusted NIM",
      "base_value": 12.42,
      "coefficient": 5.302,
      "confidence": "medium",
      "basis": "inferred",
      "valid_range": {"low": -294, "high": 50},
      "non_linearity": "COMPOSITE - risk-adjusted NIM = NIM less cost of credit, so this row CONTAINS cost_of_credit_rate and part of the funding-cost row. Never add them. Persistence warning: the -294bp bear is a QUARTERLY observation annualised, and the only adverse move in the disclosed six-quarter series (Q1'26) reversed in full the very next quarter - the one-quarter impact is -US$389.7m, not -US$1,558.9m. Management's forward anchor is qualitative ('the same region as where we are today') and the CFO expressly refused to call 12% a floor. Zero-mitigation bound.",
      "source": "Q2'26 Earnings Presentation, Aug-13-2026, slides 15-16 (series 9.3/9.9/10.8/10.5/9.48/12.42%; QoQ walk +5/+178/+115/-5 = +294bp); Q2 2026 earnings-call transcript, Aug-13-2026, Q&A"
    },
    {
      "variable": "brazilian_risk_free_curve_dv01",
      "label": "Brazilian risk-free curve — fair-value sensitivity (DV01)",
      "unit": "bp parallel shift in the Brazilian risk-free curve",
      "base_value": null,
      "coefficient": -0.685,
      "impact_metric": "fair_value_of_financial_position_usd_m",
      "confidence": "high",
      "basis": "company-disclosed",
      "valid_range": {"low": -400, "high": 400},
      "non_linearity": "Linearity is testable and holds: the company discloses a second shock size on the same curve, and 400bp x the Dec-31-2025 DV01 of 0.766 = US$306.4m against the disclosed 400bp figure of US$306.267m, a 0.04% difference. This is the fair value of the WHOLE financial position under a parallel shift at a constant position - it is NOT an earnings number and much of the banking book is carried at amortised cost, so it does not flow to net income one-for-one. Never add it to brazilian_interbank_rate_funding_cost.",
      "source": "Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026), Note 32, DV01 table, p.42 (Brazilian risk-free curve (685) at 06/30/2026, (766) at 12/31/2025); FY2025 Form 20-F, Item 11, Interest Rate Risk, Scenarios 1-3"
    },
    {
      "variable": "brazilian_interbank_rate_funding_cost",
      "label": "Brazilian interbank rate (CDI/Selic) — funding-cost channel, GROSS BOUND",
      "unit": "bp of the Brazilian interbank rate (base_value is Selic %, 15.00 at Apr-08-2026)",
      "base_value": 15.00,
      "coefficient": 3.986,
      "impact_metric": "annual_pre_tax_funding_cost_usd_m",
      "confidence": "low",
      "basis": "inferred",
      "valid_range": {"low": -300, "high": 200},
      "non_linearity": "ZERO-MITIGATION GROSS BOUND, NOT a net earnings sensitivity. Derived as deposits US$45.3bn x 88% of the interbank rate. It excludes asset repricing entirely (the book is short-duration and reprices within a quarter or two) and excludes float income (13.88% of revenue, moving the same way), so it explains 0% of the NET earnings effect - the residual is 100%. A realised offset of 18.3% is computable from FY2025 (funding-cost ratio +442bp of revenue against a gross margin fall of only 361bp): multiply by 0.817 for that case, but even that remains a bound. The observed record runs the other way: NIM expanded 410bp YoY while the Selic sat at a decade-high 15.00% and the cost of deposits fell from 91% to 88% of the interbank rate. The pool holds no policy-rate reading after Apr-08-2026.",
      "source": "Q2'26 Earnings Presentation, Aug-13-2026, slide 14 (deposits US$45.3bn; cost of deposits 88% of the interbank rate); FY2025 Form 20-F, Item 5, p.176 (funding-cost ratio 24.61% -> 29.03% of revenue) and Item 3.D (Selic 15.00%)"
    },
    {
      "variable": "credit_portfolio_size",
      "label": "Gross credit portfolio (loan book) size",
      "unit": "% change in the gross credit portfolio",
      "base_value": 39400.0,
      "coefficient": 124.18,
      "impact_metric": "ttm_revenue_usd_m",
      "confidence": "medium",
      "basis": "inferred",
      "valid_range": {"low": -10, "high": 10},
      "non_linearity": "REVENUE ONLY - the net-income impact is NOT quantifiable near-term and its sign inverts, because IFRS 9 books the expected loss at origination: growth raises the charge in quarter t and the interest income in quarter t+1 (Q1'26 booked the worst charge in the series and Q2'26 delivered the record margin). Derived from the disclosed income mix (card interest 32.75% + loan interest 31.46% = 64.21% of Q2'26 revenue) at a constant yield. Mixed basis, labelled: an average-rate income FLOW over a period-END portfolio balance at closing rates, gross of provisions and including non-interest-earning transactor balances. Two disclosed ceilings sit on the upside: deposits growing +18% FX-neutral against the book's +37%, absorbed by a loan-to-deposit ratio that has gone 50% -> 54% -> 58%; and capital adequacy falling 16.6% -> 15.7%.",
      "source": "Q2'26 interim statements (filed Aug-14-2026), Note 6(a) and 6(b), p.16 (income lines) and Note 33(a), p.43 (CAR); Q2'26 Earnings Presentation, Aug-13-2026, slides 13, 14, 16 (portfolio US$39.4bn; deposits US$45.3bn; average loan-to-deposit ratio)"
    }
  ]
}
```
