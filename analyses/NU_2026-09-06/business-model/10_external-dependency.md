# External Dependency Check — NU

**Direction warning: the score in Section 4 is INVERTED. Higher = WORSE (more dangerous dependence on things management cannot control).**

**Regime (from triage `00`):** Nu Holdings Ltd. is a Cayman-incorporated, NYSE-listed foreign private issuer reporting under **IFRS** in **US dollars**, fiscal year ending 31 December. The annual filing is **Form 20-F** (FY2025, filed 8 Apr 2026); interim statements are the reviewed report for the three and six months ended 30 Jun 2026 (filed 14 Aug 2026). Operations are almost entirely in Brazil, with Mexico and Colombia. Functional currencies of the operating subsidiaries are BRL, MXN and COP; every cross-currency figure below carries its rate and date.

**Why concentration matters before we start.** In FY2025, Brazil produced **US$11,038.3m** of the geographically-attributed revenue of **US$12,083.8m** — **91.3%** — against Mexico US$808.1m and other countries US$237.3m [FY25 20-F, Note 34(b) Segment information]. Note 34(b) is a defined subset (interest income on cards, loans and other receivables, card income, late fees, insurance commission and other fees) and does **not** tie to IFRS total revenue of US$15,774.8m [FY25 20-F, Item 5, Total revenue]; the 20-F does not reconcile the two, so treat 91.3% as the share of the geographically-attributed measure, not of total revenue. Either way, this is a one-country business. And **85.2% of FY2025 total revenue was interest income and gains net of losses on financial instruments** — US$13.4bn of US$15.8bn — with fees at 14.8% [FY25 20-F, Item 5, "We earn revenue from two main sources"]. A single-country consumer lender earning five-sixths of its revenue from interest is, by construction, exposed to that country's rate, currency, credit and policy cycles.

---

## 1. Dependency Table

Direction reminder: this table feeds an **inverted** score. "High" dependency is bad.

| External Variable | Dependency Level | Why It Matters | Evidence |
|---|---|---|---|
| **Interest rates (Brazil Selic / CDI, plus MXN TIIE, COP IBR)** | **High** | Funding reprices with the central bank's rate almost one-for-one, while the biggest asset — credit-card revolving — has its total charges capped by law. Deposits are paid at a set share of the interbank rate: **88% of the interbank rate in Q2'26**, from 91% in Q2'25. Deposits stood at **US$45.3bn**. Brazil's average CDI (the interbank rate) was **14.3% in 2025 vs 10.8% in 2024**; Selic was **15.00%** as of the 20-F date. The pool carries no Selic reading later than 8 Apr 2026 — do not assume the current level. | `Q2'26 earnings deck (13 Aug 2026), "Deposit Franchise" slide, Cost of Deposits · % of Interbank Rate`; `FY25 20-F, Item 5, macroeconomic indicators table`; `FY25 20-F, Item 3.D, "The surge of inflation…"` ("As of the date of this annual report, the Selic rate was 15.00%") |
| **FX (BRL, MXN, COP vs USD)** | **High for reported results; Low for operating cash flows** | Two different things, and they must not be blurred. Operationally the company is matched: "none of the entities in our corporate structure had significant financial exposures in a currency other than their respective functional currencies" [FY25 20-F, Item 11]; the same statement is repeated at 30 Jun 2026 [Q2 FY26 Interim Report, Note 32, FX risk]. But the **translation** of Brazilian earnings and equity into the USD reporting currency is deliberately left mostly unhedged: "We decided not to hedge our foreign exchange exposure originated by our investments in Brazil, Colombia and Mexico." A 17.8% BRL shock moves the Brazilian net investment by **US$1,369.8m**; all subsidiaries together **US$1,509.6m**, on total equity of US$11,321.6m at 31 Dec 2025 — **13.3% of equity**. | `FY25 20-F, Item 11, Foreign Exchange Rate Risk` (shock table); `Q2 FY26 Interim Report (14 Aug 2026), Note 32`; `FY25 20-F, Consolidated statement of financial position` (Total equity 11,321,562 thousand) |
| **Government policy (named Brazilian programmes)** | **High** | One rule change to one product cut that product's new lending by half. When the FGTS rules changed on 1 Nov 2025, "our originations of FGTS loans dropp[ed] by about 50% to 60%", and group credit-portfolio growth for Q4'25 was 11% quarter-on-quarter FX-neutral against **"about 13% to 14%"** without it — roughly **2–3 percentage points of a single quarter's portfolio growth removed by one government decision**. In the other direction, the Desenrola debt-renegotiation programme improved Q2'26 cost of credit by "about 5%". See §1A for the full register. | `Q4 2025 Earnings Call (25 Feb 2026), Guilherme Marques do Lago (CFO)`; `Q2 2026 Earnings Call (13 Aug 2026), Rob Livingston (CFO), prepared remarks and Q&A` |
| **Regulation (BCB / CMN / CNBV / Banxico / SFC / OCC)** | **High** | The price of the flagship product is set by statute, not by the company: Law 14,690/2023 and CMN Res. 5,112/2023 cap total interest and charges on credit-card revolving and installment credit at **no more than the original debt amount**. Prepaid interchange is capped at **0.7%** by BCB Res. 246, which the filing says "impacted our fee and commission income". A naming rule (Joint Res. 17/25) obliges the company to obtain a Brazilian banking licence just to keep calling itself a bank — which is why it agreed to buy Banco Porto Real on 20 Jul 2026. And an industry levy landed with no company decision behind it: **US$186.4m advanced to the FGC on 25 Mar 2026** under an emergency recapitalisation plan following other banks' liquidation. | `FY25 20-F, Item 4.B, Regulatory Overview—Brazil` (Law 14,690/2023; CMN Res. 5,112/2023; BCB Res. 246; Joint Res. 17/25; FGC plan); `Q2 FY26 Interim Report, Note 35(b)` (Banco Porto Real); `Q2 FY26 Interim Report, other assets note (iv)` (US$185,488 thousand FGC advance at 30 Jun 2026) |
| **Consumer credit cycle (Brazil / Mexico / Colombia)** | **High** | Five-sixths of revenue is interest on consumer credit, and provisions are the swing item. Expected credit loss (ECL — the provision the accounting rules make it set aside for loans it expects to go bad) on cards and loans was **US$5,022.0m** at 31 Dec 2025; on a 100% downside macro weighting it would have been **US$5,403.5m**, i.e. **+US$381.5m (+7.6%)**. That single scenario shift is 13.3% of FY2025 net income of US$2,868.9m. Brazil's own inputs moved against the company in 2025: GDP growth 2.3% (from 3.4%), though unemployment improved to 5.1% (from 6.2%). | `FY25 20-F, Note 4 (Critical accounting estimates), Sensitivity analysis`; `FY25 20-F, Item 5, macroeconomic indicators table`; `FY25 20-F, Item 5, Total revenue` |
| **Sovereign / country risk and geopolitics** | **Mid** | Named, but not quantified anywhere in the filing. The 20-F carries a dedicated risk factor that "any further downgrading of Brazil's credit rating could depress the trading price of our Class A ordinary shares", and describes an "uncertain fiscal adjustment plan" with the government having "yet to present a credible fiscal adjustment plan". Tariffs and sanctions appear only inside a generic list of international-operating risks ("potential tariffs, sanctions, fines or other trade restrictions") with no exposure attached. So: real for the share price, not proven as a cash-flow driver. | `FY25 20-F, Item 3.D` ("Any further downgrading of Brazil's credit rating…"; "The current economic environment in Brazil of high interest rates…"; bulleted international-operations risks) |
| **Industrial / business cycle** | **Low** | The company reports as **one segment** and lends to consumers and micro/small businesses; there is no disclosed corporate or industrial loan book whose value would track an industrial cycle. It does serve 6.8 million small businesses, so the exposure is not zero — but it is not sized anywhere in the pool. | `FY25 20-F, Note 34, Segment information` ("The CODM considers the whole Group as a single operating and reportable segment"); `Q2 2026 Earnings Call (13 Aug 2026), David Vélez, prepared remarks` (6.8m small businesses) |

**Rows dropped as not applicable, rather than scored "Low" by default:** *commodity prices*, *freight / logistics rates*, and *weather*. This is a digital bank with no physical goods, no inventory, no transport, and no crop or weather-linked book; the FY2025 20-F discloses no commodity position in either the trading or banking book beyond the definitional mention in Item 11, and capital expenditure was **US$7.2m** for the whole of FY2025 [`CIQ Financials Segments export (NU), Capital Expenditure FY2025` — vendor export]. Brazil's economy is commodity-linked and that reaches the company second-hand through the BRL and through employment, but nothing in the pool sizes that channel, so it is captured inside the FX and consumer-cycle rows rather than invented as its own.

---

## 1A. Named Policy & Subsidy Register — status as of 2026-09-06

Every named programme the analysis above leans on. Status is judged from the most recent document in the pool that speaks to it; where the pool has no primary government source for the current year, that is stated rather than resolved.

| Programme (local name + English) | Status as of 2026-09-06 | Terms in the reference period | Terms NOW (or successor) | Change, quantified | Stated end date? | Source + date |
|---|---|---|---|---|---|---|
| **Lei 14.690/2023 + CMN Res. 5.112/2023** — cap on credit-card revolving and installment charges | **In force (unchanged)** | Effective 3 Jan 2024: total interest and financial charges on revolving/installment card financing may not exceed the original debt amount; includes default interest, fines and other fees | Same. The 20-F states the provisions "have been applied throughout 2024 and 2025" | No change to quantify. The constraint is a hard ceiling on the price of the largest revenue line (85.2% of revenue is interest income) | None stated | `FY25 20-F, Item 4.B, Revolving Credit and Interest Rate Regulations` (filed 8 Apr 2026) |
| **BCB Res. 246** — prepaid card interchange cap | **In force (unchanged)** | Maximum interchange fee of **0.7%** on all prepaid card transactions in Brazil | Same | Filing says it "impacted our fee and commission income"; the amount is **not disclosed** | None stated | `FY25 20-F, Item 4.B, Regulation of Credit Cards and Interchange Fees` |
| **FGTS saque-aniversário** collateralised lending (Lei 13.932/2019, as amended by the FGTS board 7 Oct 2025) | **In force (amended — terms tightened).** This is a **reduction**, not a termination: the programme continues on narrower terms | Workers could pledge future annual FGTS withdrawals as loan collateral, without the caps below | Effective **1 Nov 2025**: 90-day cooling-off after opt-in; **one** concurrent loan transaction per year; pledgeable future withdrawals limited to **five per 12 months** (up to three more per subsequent three-year period); advanceable amounts capped at **R$100–R$500 per withdrawal, maximum aggregate R$2,500** | NU's FGTS originations fell **"by about 50% to 60%"**. Group credit-portfolio growth in Q4'25 was **11% QoQ FX-neutral vs "about 13% to 14%"** absent the change — c. **2–3pp of one quarter's growth**. Partly offset: CFO says the drop "was more than offset by the growth in public consignado" | None stated | `FY25 20-F, Item 4.B, FGTS-Backed Loans`; `Q4 2025 Earnings Call (25 Feb 2026), CFO Q&A` |
| **Desenrola Brasil** — federal debt-renegotiation programme (ratified by Lei 14.690/2023); management calls the current round "Desenrola 2.0" | **Status of the 2026 round not established from a primary source.** Company-stated as active and producing effects in Q2'26 and into Q3'26 | 2023 programme for renegotiating individuals' defaulted debts, by debtor category | Management describes a live 2026 round: "the Desenrola program is an additional tailwind expected to take form in the second and third quarters of this year" (May 2026); in August 2026 it was described as having run in Q2 | Improved Q2'26 cost of credit by **"about 5%"**; ECL impact **"less than US$10 million"**, appearing in Stage 3; **"more than 4/5"** of the effect already recognised in Q2'26, "a little bit more" expected in Q3'26; **1.8m customers** renegotiated. CFO attributes about **one third** of the Q2'26 risk-adjusted-margin beat versus plan to Desenrola, two thirds to the company's own credit performance and balance growth | Not disclosed | `Q1 2026 Earnings Call (14 May 2026)`; `Q2 2026 Earnings Call (13 Aug 2026), prepared remarks and Q&A` — §4 tier-6 transcripts, not a government document. No BCB/Ministry release for the 2026 round exists in this pool |
| **Lei 15.179 (24 Jul 2025)** — private-sector payroll-deduction lending via the Digital Work Card / eSocial | **In force** | Private payroll lending was fragmented and largely offline before the law | Applications through Brazil's Digital Work Card app; repayments capped at **35% of gross salary**; optional FGTS collateral; automatic deduction via eSocial; for the first **120 days** after platform launch, new loan proceeds must repay existing higher-cost debt | Not sized. Management: "on private payroll, we are accelerating month-over-month" (Aug 2026) | None stated | `FY25 20-F, Item 4.B, Private Payroll Deduction Loans`; `Q2 2026 Earnings Call (13 Aug 2026), David Vélez` |
| **Brazilian personal income-tax exemption for lower incomes** | **Company-stated as in effect; terms not established from a primary source, and the company's own two figures disagree** | n/a | Management describes it two different ways in the **same call**: "the income tax exemption for earnings up to **BRL 5,000 per month**" (prepared remarks) and a benefit for "consumers with up to **BRL 7,400 per month** of income" (Q&A). The pool contains no legal text. Both figures are recorded; neither is resolved here | Not quantified. CFO explicitly says it "has not been taken into account in the provisions and credit results" | Not disclosed | `Q1 2026 Earnings Call (14 May 2026), prepared remarks and Q&A` |
| **Joint Res. 17/25 (28 Nov 2025)** — naming rules for BCB-authorised institutions | **In force** | No restriction on using "bank" in the trademark | Corporate names may not suggest activities the entity is not authorised for. The 20-F: "As we do not currently hold a banking license in Brazil, in order to continue using the term 'bank' in our trademark… we will be required to obtain a banking license in Brazil" | Forced a corporate action: on **20 Jul 2026** NU agreed to buy **100% of Banco Porto Real de Investimentos S.A.**, subject to BCB approval. Company states the added licence "does not impose additional capital or liquidity requirements". Purchase price not disclosed in the pool | None stated | `FY25 20-F, Item 3.D and Item 4.B`; `Q2 FY26 Interim Report (14 Aug 2026), Note 35(b)` |
| **Joint Res. 14 (3 Nov 2025)** — activities-based minimum capital | **In force**, phased transition through **31 Dec 2027** | Minimum capital set by institution type | Minimum capital = cost component (R$2m × activity categories, +R$5m for technology-intensive services, up to a R$10m cap) + activities component (R$1m–R$7m by category, plus R$5m/R$8m investment category) × funding-source factor (60%/80%/120%/200%); +R$30m for entities using "bank" | Company states: **"We have not been affected by capital requirements under this rule."** | Transition ends 31 Dec 2027 | `FY25 20-F, Item 4.B, Minimum Capital Methodology`; `FY25 20-F, Item 3.D` |
| **BCB Res. 477/478 (30 May 2025)** — leverage ratio for Type 3 payment institutions | **In force, phasing in** | No mandatory leverage ratio for payment institutions | For S2 entities (NU's conglomerate is S2): consolidated minimum **2% from 1 Jul 2026 → 2.5% from 1 Jan 2027 → 3% from 1 Jan 2028**; individual payment-institution minimums rise 0.75% → 2.25% over the same period | Impact on NU not disclosed | Fully phased 1 Jan 2028 | `FY25 20-F, Item 4.B, Leverage Ratio for Payment Institutions` |
| **FGC emergency recapitalisation plan (FGC board, Feb 2026) + CMN Res. 5.279/26 (22 Jan 2026)** | **In force** | Ordinary FGC membership contributions | Following the liquidation of certain banks by the BCB, member institutions must **advance contributions over a multi-year period**; CMN Res. 5,279/26 broadened the FGC mandate to support transfers of control or assets of distressed members | **US$186.4m advanced on 25 Mar 2026**; **US$185,488 thousand** carried in other assets at 30 Jun 2026 (US$0 at 31 Dec 2025). Total multi-year obligation **not disclosed** | Multi-year; end not disclosed | `FY25 20-F, Item 4.B, FGC Emergency Recapitalization Plan`; `Q2 FY26 Interim Report (14 Aug 2026), other assets note (iv)` |
| **Mexico banking licence** — Sofipo → *Institución de Banca Múltiple* (CNBV) | **Completed and in force** | Operated as a Sofipo under the LACP, with lower capital requirements and lower deposit limits | Banking licence obtained **24 Apr 2025**; CNBV notified the **Operations Authorization on 9 Jul 2026**; **began operating as a bank on 6 Aug 2026** | Unlocks payroll direct deposits, higher deposit insurance and a wider product set (company-stated). No financial quantification disclosed | n/a — completed | `Q2 FY26 Interim Report (14 Aug 2026), Note 35(a)`; `Q2 2026 Earnings Call (13 Aug 2026), David Vélez` |
| **Nubank N.A. — US OCC national bank charter** | **Conditional only; final approval NOT granted** | No US charter | **Conditional approval received 29 Jan 2026.** The charter takes effect only "once the OCC's conditions are satisfied and final approval is granted" | Nothing to quantify; this is an option, not a fact | No date given for final approval | `FY25 20-F, Note 35(a) Subsequent events`; `Q2 FY26 Interim Report (14 Aug 2026), subsequent-events/US expansion note` |
| **BCB Res. 519 / 520 / 521 (10 Nov 2025)** — virtual-asset service provider framework | **In force from 2 Feb 2026** | No comprehensive VASP authorisation regime in Brazil | Authorisation process, three permitted modalities (intermediary / custodian / exchange), client-asset segregation, and FX limits (US$100,000 for VASPs; US$500,000 for certain brokers/banks). Existing VASPs must apply **within 270 days** or cease operations within thirty days | NU's crypto revenue is not disclosed anywhere in the pool, so the exposure cannot be sized. The 20-F elsewhere warns of possible "suspension of our ability to offer crypto-related services in Brazil" if requirements are not met | 270-day application window from 2 Feb 2026 | `FY25 20-F, Item 4.B, Virtual Assets and Virtual Asset Service Providers`; `FY25 20-F, Item 3.D` |
| **Mexico — Banxico payment-interface standardisation** | **Company-stated as issued June 2026; no regulation number in the pool** | n/a | "In June, the Central Bank introduced new rules that every financial institution must implement by the end of the year… consumers will see a standardized interface and follow the same steps regardless of who they are paying" | Not quantified. Management frames it as helping adoption, not as a cost | Implementation deadline: end of 2026 (company-stated) | `Q2 2026 Earnings Call (13 Aug 2026), David Vélez, prepared remarks` — §4 tier-6 transcript; no Banxico circular in this pool |

**No programme in this register has been described using "cliff", "expiry", "ends" or "withdrawn".** Two candidates were checked specifically: the FGTS scheme **continues on tightened terms** (a reduction, with both sets of terms above), and Desenrola is **company-stated as running into Q3'26**. Where a 2026 primary source is absent — Desenrola's current round, the income-tax exemption, and the Banxico June-2026 rules — the row says so, and the dependency is carried at its last established terms.

---

## 2. Sensitivity, As Disclosed

Nu Holdings publishes unusually detailed market-risk sensitivities. All reproduced verbatim; all figures **in US$ thousands** unless stated.

**(a) Interest-rate sensitivity to a 1 basis-point (0.01%) parallel shock — DV01.** Negative = loss of fair value. The BIS standardised scenarios are symmetrical, so an equal move the other way produces an equal gain.

| Curve | Total, 31 Dec 2025 | Total, 30 Jun 2026 |
|---|---|---|
| Brazilian risk-free | (766) | (685) |
| Colombian risk-free | (257) | (415) |
| Turkish risk-free | (147) | (125) |
| Mexican risk-free | (42) | (59) |
| US risk-free | (33) | 2 |

`FY25 20-F, Item 11, Interest Rate Risk, Scenario 1`; `Q2 FY26 Interim Report (14 Aug 2026), Note 32, DV01 table`

**(b) Interest-rate sensitivity to the large standardised shocks, 31 Dec 2025.**

| Shock | Curve | Total sensitivity (US$ thousands) |
|---|---|---|
| **400 bp (4.00%)** | Brazilian risk-free | **(306,267)** |
| 400 bp | Colombian risk-free | (102,615) |
| 400 bp | Turkish risk-free | (58,704) |
| 400 bp | Mexican risk-free | (16,653) |
| **200 bp (2.00%)** | US risk-free | (6,607) |

`FY25 20-F, Item 11, Interest Rate Risk, Scenarios 2 and 3`

**(c) Value at Risk (VaR).**

| Entity | 30 Jun 2026 | 31 Dec 2025 |
|---|---|---|
| Nu Prudential Conglomerate — Brazil | 8 | 13 |
| Nu Holdings (financial assets held directly) | 84 | 576 |
| Nubank Mexico | 25 | 145 |

`Q2 FY26 Interim Report (14 Aug 2026), Note 32, VaR table`

**(d) FX shock on the value of the unhedged net investments, 31 Dec 2025.** The BRL shock of 17.8% is the company's own 90th-percentile of annual returns over a five-year window; other currencies use a standard 10%.

| Subsidiary | Country | Net equity (US$ thousands) | Shock | Change (US$ thousands) |
|---|---|---|---|---|
| FIP | Brazil | 7,695,381 | 17.8% | **1,369,778** |
| Nu México | Mexico | 661,252 | 10% | 66,125 |
| Nu North America | US | 273,244 | 10% | 27,324 |
| Nu Colombia | Colombia | 252,600 | 10% | 25,260 |
| Nu Uruguay Investments | Uruguay | 107,262 | 10% | 10,726 |
| Others (Olivia IP, Nu Tecnologia, Nuplat) | Brazil / Uruguay | 26,282 | 10–17.8% | 3,750 |
| **Total** | | **9,082,370** | | **1,509,598** |

Against total equity of **US$11,321,562 thousand** at 31 Dec 2025, that total shock is **13.3% of equity**. `FY25 20-F, Item 11, Foreign Exchange Rate Risk`; `FY25 20-F, Consolidated statement of financial position`

**(e) Credit-loss sensitivity to the macro scenario weighting, 31 Dec 2025 (US$ thousands).**

| | Weighted average (as booked) | 100% upside | 100% base | 100% downside |
|---|---|---|---|---|
| Credit card and loan ECL | 5,021,996 | 4,708,093 | 4,957,850 | **5,403,461** |

The downside case is **+US$381,465 thousand (+7.6%)** versus the booked figure — 13.3% of FY2025 net income of US$2,868.9m. `FY25 20-F, Note 4, Sensitivity analysis`; `FY25 20-F, Item 5`

**(f) What the currency actually did to reported growth, both ways.** This is the cleanest measurement of FX dependency in the pool, and it cuts in opposite directions in consecutive years:

- **FY2025:** net income attributable to shareholders grew **+45.5% as reported** but **+50.6% FX-neutral** — currency cost about **5 percentage points** of reported growth. Adjusted net income: **+39.2% reported vs +44.1% FX-neutral**. [`FY25 20-F, Item 5, Adjusted Net Income reconciliation table`]
- **Q2 2026:** IFRS total revenue was **US$5,513.2m vs US$3,668.5m** a year earlier, **+50.3% as reported**, while the company's own FX-neutral **gross revenue** growth was **+39%**. The two measures are not identical — the deck's gross revenue for the quarter is c. US$5,316m against IFRS total revenue of US$5,513.2m — so the roughly 11-percentage-point gap is mostly currency but is not a clean like-for-like. The BRL closing rate was **R$5.1617/US$1.00 at 30 Jun 2026**, against an FY2025 average of **R$5.6**. [`Q2 FY26 Interim Report (14 Aug 2026), consolidated statement of income`; `Q2'26 earnings deck (13 Aug 2026), Gross Revenue slide and FX Neutral Measures methodology`; `FY25 20-F, Item 5, macroeconomic indicators table`]

**(g) A rate stress the company does not publish — computed here, and labelled as a bound.** Under **§9**, a stress with zero management response is a bound, not a forecast. Bound: a **300 bp** rise in Brazilian rates, applied to deposits of **US$45.3bn** paid at **88% of the interbank rate**, is `0.03 × 0.88 × 45.3bn ≈ **US$1.20bn** of extra annual interest expense` before any asset repricing. That is an upper bound and almost certainly wrong as a forecast, for a reason the filings support: the asset book is short-dated, so it reprices too. Management: the portfolio has "a particularly short duration, which means that if we ever did see unexpected asset quality movements, we can react fast"; and products have "very short-term duration, which gives us a huge amount of ability to react quickly". The company discloses no measure of how much of a rate move it has historically recovered, so no realised offset can be computed from this pool — the honest answer is that the true figure sits somewhere well below US$1.20bn and cannot be pinned down here. `Inference from disclosed inputs, not a company-disclosed sensitivity.` Inputs: `Q2'26 earnings deck (13 Aug 2026), Deposits and Cost of Deposits slide`; `Q1 2026 Earnings Call (14 May 2026)`; `Q2 2026 Earnings Call (13 Aug 2026), David Vélez`

---

## 3. Classification

**Partly externally driven** — material exposure, with management levers that the filings show actually working.

The case for a harsher verdict is strong and should be stated first. This is a **one-country** business (91.3% of geographically-attributed revenue from Brazil), earning **85.2% of revenue as interest**, funding itself at a contractual **88% of whatever the central bank sets**, selling a flagship product whose **total charges are capped by statute**, in a market where a single rule change halved one product's new lending overnight and a government renegotiation programme moved a quarter's cost of credit by 5%. None of those five facts is within management's control.

What keeps it out of "Mostly externally driven" is that the pool contains measured evidence of the company absorbing and offsetting these shocks, rather than merely narrating them:

- **Substitution after a policy shock.** When FGTS lending was cut by rule, the loss "was more than offset by the growth in public consignado" — a different product, same balance sheet [`Q4 2025 Earnings Call (25 Feb 2026), CFO`].
- **Funding cost managed down while rates were high.** Cost of deposits fell from **91% of the interbank rate in Q2'25 to 88% in Q2'26**, i.e. the spread widened *against* the external rate rather than passively tracking it [`Q2'26 earnings deck (13 Aug 2026)`].
- **Management's own attribution of a good quarter, which it did not have to volunteer.** Of the Q2'26 risk-adjusted-margin beat versus plan, "about 1/3 of that benefit… is coming from Desenrola. But 2/3 are coming from" the company's own credit performance and the ramp of balances written in prior quarters [`Q2 2026 Earnings Call (13 Aug 2026), CFO`]. A roughly 2:1 own-action-to-policy split is the closest thing in this pool to a measured mitigation rate.
- **Share is small enough that growth need not come from the cycle.** "We have 7% market share of that profit pool. So we're still a small player in that big market, and we get to cherry pick our customers" [`Q2 2026 Earnings Call (13 Aug 2026), David Vélez`]. A company taking share from a 7% base can grow while its end market does not.

Set against that, one lever is explicitly declined. On the currency, management states it "decided not to hedge" the translation exposure on its Brazilian, Colombian and Mexican investments [`FY25 20-F, Item 11`]. That is a choice, not a constraint — but for a USD-quoted shareholder the consequence is indistinguishable from an uncontrolled exposure, and it is the single largest number in the whole sensitivity set.

---

## 4. External Dependency Risk Score

# 57 / 100 — **INVERTED: higher = worse**

Band 41–60: *material external exposure, mixed mitigation.* This is consistent with the "Partly externally driven" classification, which spans the lower and middle bands.

How the number is built:

| Driver | Direction | Weight in the score |
|---|---|---|
| One country, 91.3% of geographically-attributed revenue; one reportable segment | Worse | Largest single push upward — nothing diversifies the shock |
| 85.2% of revenue is interest income; funding at 88% of the interbank rate | Worse | Rate cycle passes through the liability side almost mechanically |
| Flagship product's price capped by statute (Law 14,690/2023) | Worse | Removes the main pricing lever on the largest revenue line |
| Policy shocks demonstrated at 2–3pp of a quarter's portfolio growth (FGTS) and 5% of a quarter's cost of credit (Desenrola) | Worse | Measured, not hypothetical |
| Translation FX unhedged by choice: 13.3% of equity on the company's own 17.8% BRL shock | Worse | Explicitly not mitigated |
| Substitution across products after the FGTS change "more than offset" the loss | Better | Proven lever, same quarter |
| Cost of deposits improved 91% → 88% of the interbank rate over five quarters | Better | Spread managed against the external rate |
| Two-thirds of the Q2'26 margin beat attributed to own actions, one-third to policy | Better | Roughly 2:1 own-action-to-policy ratio |
| 7% profit-pool share; short-duration book allows fast repricing | Better | Growth need not come from the cycle |
| Operating FX matched — "no significant unhedged FX exposures" at both 31 Dec 2025 and 30 Jun 2026 | Better | Cash flows are insulated even though reported USD figures are not |

The score is not lower because none of the mitigations touch the two biggest exposures — the currency (declined) and the statutory price cap (impossible). It is not higher because the company has repeatedly demonstrated, with numbers, that it offsets policy shocks within a quarter or two.

---

## 5. The Single Biggest Lever

**The Brazilian real against the US dollar.** A 20% adverse move (BRL depreciating) would cut reported USD revenue from Brazil — US$11,038.3m, 91.3% of the geographically-attributed total — by roughly a sixth, and the company's own table puts a 17.8% BRL shock at **US$1,369.8m** on the Brazilian net investment alone, 12.1% of total equity, on an exposure it has explicitly chosen not to hedge. Nothing else in the disclosures is that large: the 400 bp Brazilian rate shock is US$306.3m of fair value, and the full downside credit scenario is US$381.5m of extra provisions. The distinction matters and should not be lost — the underlying Brazilian business would be untouched in local currency, so this is damage to the reported USD figures and to the value of the NYSE-listed line a dollar investor actually holds, not to the operations.
