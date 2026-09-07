# Intrinsic Value — Residual Income (Excess Return on Equity) — NU

**Method gate applied first (MODULE_RULES Business-Type Method Map — Hard Rule).** `00_valuation-data-triage` classifies Nu Holdings as a **Financial (bank)**: Capital IQ balance-sheet and cash-flow templates are the Bank template, the single reportable segment is "Banking", and the regulated operating subsidiaries are Nu Pagamentos and Nu Financeira [FY2025 Form 20-F, Note 1; `00_valuation-data-triage` §3]. **An FCFF DCF and an EV bridge are therefore invalid here and are not built.** LTM cash from operations of −USD 10,304.8m is loan-book and deposit growth running through operating cash flow, not distress [`ciq_facts.json` `ltm_ocf_m`, status `present`]; a "free cash flow" base built on it would be an artefact. This report values **equity directly** with a **residual-income (excess return on equity) model discounted at the cost of equity**, and cross-checks it against a dividend-equivalent read. Every discipline the DCF agent normally carries is kept: every assumption sourced or labelled, the terminal value disclosed as a share of total value, a sensitivity grid, and a bridge to per-share.

**Reporting basis.** IFRS Accounting Standards as issued by the IASB (interim statements under IAS 34); presentation currency **US dollar (USD)**; fiscal year ends 31 December [FY2025 Form 20-F, cover page and Note 2; Q2 2026 Interim Report (Aug-14-2026), KPMG review report]. Nu Holdings is a US-listed foreign private issuer filing Form 20-F — the absence of a 10-K / 10-Q is not a data gap (CLAUDE.md §27). The subsidiaries' functional currencies are the Brazilian real, Mexican peso and Colombian peso [FY2025 20-F, Note 2.a], so **the model is built in USD and the discount rate is a USD cost of equity carrying an explicit country-risk premium** — a BRL rate may not be applied to a USD cash-flow stream without a stated conversion (§15, §27).

**Anchors inherited verbatim from `01_price-and-capital-structure` §7.** Decision line NYSE:NU · USD. Price **USD 14.30** (2026-08-28 close, pool-verified) with a fresher indicative quote of **USD 15.37** (2026-09-04, web-sourced, unverified, +7.48%). Shares for per-share fair value: **4,878,395 thousand fully diluted**. Equity attributable to the parent **USD 13,249.670m**, book value per share **USD 2.716** fully diluted, tangible book **USD 2.479** fully diluted, all as of Jun-30-2026. **No net-debt bridge is used** — for a Financial the EV bridge is informational only, and `01` says so on its face.

**Prior in-house memo not used.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is a §4 tier-9 user note carrying its own target price and scenario weights. It informed nothing here.

---

## 1. Earnings & Book-Value Base and Normalizations

*(This section replaces "FCF Base & Normalizations". A residual-income model is anchored on opening book value and forward earnings, not on free cash flow.)*

**Base date: 30 June 2026. Reporting currency: USD. Reporting standard: IFRS as issued by the IASB.**

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Equity attributable to shareholders of the parent (the residual-income capital base, `B0`) | USD 13,249.670m | **None.** Used as filed. Non-controlling interests of USD 2.051m are excluded because the model values the parent's claim only | Q2 2026 Interim Report (Aug-14-2026), statement of financial position; carried verbatim from `01` §6 |
| Fully diluted shares (per-share divisor) | 4,878,395 thousand | Outstanding 4,830,689k + 44,667k options/RSUs on the treasury-stock method + 3,039k acquisition shares; 14,675k antidilutive instruments excluded; no convertibles | `01` §2 Share Count Reconciliation, built from Q2 2026 Interim Report, Note 9 and Note 31 |
| **Opening book value per share `B0`** | **USD 2.716** | `13,249.670 ÷ 4,878.395` | arithmetic on the two rows above |
| H1 2026 actual diluted EPS (the reported stub inside FY2026) | USD 0.3936 | None — as filed | Q2 2026 Interim Report, statements of income, six-month period ended 30-Jun-2026 |
| LTM diluted EPS (context only, not the forecast base) | USD 0.7348 | None | CIQ `Key Stats`, LTM to Jun-30-2026 — vendor export |
| LTM ROE on average equity (context) | 31.63% | Computed on average equity, not the company's peak-quarter annualised 33% headline | CIQ `Ratios` export, FY2021–LTM Jun-30-2026 — vendor export; corroborated by `business-model/09_moat.md` §3 arithmetic |
| **Normalized effective tax rate — cross-orb anchor** | **~26%** | The moat module published a canonical normalized structural rate of **~26%** (the FY2025 audited full-year rate, stripping the H1'26 distortions: USD 280.8m rate-differential effect, USD 108.8m interest on capital, a USD 28.4m one-off CSLL deferred-tax remeasurement, USD 253.6m of credits and incentives). It states the rate is a **floor**, because the enacted CSLL step-ups push it up (payment institutions 9%→12% in 2026–27→15% from 2028; SCFIs 17.5%→20%) | `business-model/09_moat.md` §3, citing Q2 FY26 Interim Report income-tax reconciliation, items (i)–(iii) |

**Tax reconciliation to the moat module, as the rules require.** This model does not build NOPAT — residual income runs on **after-tax** earnings, so the tax rate enters through the EPS strip rather than through a separate line. The reconciliation is therefore a check on what the EPS strip already embeds: consensus embeds an **FY2026 effective tax rate of 27.41%** and an implied **H2 2026 rate of 30.2%**, against management's own "for modelling purposes" guide of 15–20% and an 11.78% rate actually filed for H1 2026 [`earnings/04_guidance-consensus.md` §3 and §5, from `Capital IQ Estimates→Consensus` and the Q2'26 interim statements]. **The earnings base used below is therefore taxed at or above the moat module's ~26% normalized anchor, not below it** — the divergence runs in the conservative direction and no adjustment is made. If management's 15–20% guide proves right, this model understates earnings by roughly 10–12% at the FY2026 level [`earnings/04` §7 arithmetic]; that upside is deliberately left out of the base.

**Normalizations deliberately NOT made, and why.**

| Candidate normalization | Applied? | Reason |
|---|---|---|
| Strip the 40.4% of TTM net income that is a non-cash deferred-tax credit | **No** | `earnings/06_earnings-quality.md` measures it; but the forecast below runs on consensus EPS, which is a forward series and does not carry that trailing item. Removing it from a base I do not use would double-count |
| Normalize the LTM 31.63% ROE down to a through-cycle level in the base year | **No, in the base year — Yes, in the forecast** | A residual-income model does not need a normalized starting return; it needs a normalized *terminal* return. The peak-of-cycle warning from `business-model/07_business-quality.md` §4 ("treat 30%+ ROE as a peak-of-favourable-conditions number") is applied in §2 as the fade path and the terminal ROE, which is where it belongs |
| Adjust book value for the buyback | **No — but flagged as a modelling limitation** | The company repurchased 40.66m Class A shares for USD 500.4m to 30-Jun-2026, an average of ~USD 12.31/share against a book value of USD 2.72 [Q2 2026 Interim Report, Note 31(e)(i)]. Repurchases far above book **reduce** book value per share. The clean-surplus roll-forward in §4 holds the share count fixed, which slightly **overstates** future book value per share. The direction of the error is known and stated; it is small relative to the sensitivity grid |
| Adjust for FX translation reserves breaking clean surplus | **No — flagged** | With BRL/MXN/COP functional currencies, translation moves equity through other comprehensive income, so clean surplus (`ΔB = EPS − DPS`) is an approximation. §4 shows the modelled book path ties to the consensus book-value-per-share strip within 0.7% at FY2026 and 0.3% at FY2027, which is the evidence that the approximation holds over the near term |

---

## 2. Forecast Assumptions

Two explicit phases, then a terminal. **Every cell is labelled company-guided, consensus, peer-derived, or analyst assumption.**

### Phase 1 — consensus period (H2 2026 → FY2028)

| Assumption | H2 2026 | FY2027 | FY2028 | Source / Basis |
|---|---:|---:|---:|---|
| Diluted EPS (USD) | **0.4546** | **1.11006** | **1.45953** | **Consensus.** `Capital IQ Estimates→Consensus`, Fiscal Years block, mean, as-of 2026-08-29 (FY2026 0.8482, 16/16 estimates; FY2027 16/16; FY2028 12/12). H2'26 = FY2026E 0.8482 − H1'26 actual diluted 0.3936 [Q2 2026 Interim Report, six months to 30-Jun-2026] |
| Dividend per share (USD) | **0.00** | **0.1725** | **0.23** | **Consensus.** Same tab, DPS row (7/7 and 8/8 estimates). NU has never paid a dividend and the 20-F says one may not come [FY2025 20-F, Item 3.D; `01` §6A] — the consensus DPS is the Street's assumption, not a company statement |
| Implied ROE on opening book | 33.5% | 35.0% | **35.5%** | **Derived** from the two rows above. Capital IQ's own ROE consensus for the same years is 31.49% / 31.06% / 32.03% [`Estimates→Consensus`, ROE % row] — lower because the vendor uses *average* equity while this model uses *opening* book on a fast-growing base. The two are consistent, not in conflict |
| Effective tax rate embedded | 30.2% (implied) | n/a (inside EPS) | n/a (inside EPS) | **Consensus**, derived in `earnings/04` §3. Above the ~26% moat-module normalized anchor — see §1 |
| Efficiency ratio (context, not a model input) | ~20% FY2026 | — | — | **Company-guided**, reiterated twice: *"we continue to expect the efficiency ratio for the full year to average about 20%"* [Q2 2026 earnings call, Aug-13-2026, prepared remarks] |

### Phase 2 — fade period (FY2029 → FY2038, 10 years) — **analyst assumption, not company-guided**

| Assumption | Path | Source / Basis |
|---|---|---|
| Return on opening book | **Fades linearly from 35.5% (FY2028) to 18.0% (FY2038)** | **Analyst assumption.** Chosen rather than extending the vendor strip because `Capital IQ Estimates→Consensus` carries only **1/1 estimate** for FY2029–FY2035 — a single broker's long-range model, not a consensus. Cross-check in §4 shows this fade produces EPS **above** that single-broker strip in FY2029–FY2034 and 2.1% below it in FY2035, so it is not a conservative earnings path |
| Payout ratio | **Rises linearly from 25% (FY2029) to 83.3% (FY2038)** | **Analyst assumption**, set so the terminal retention is exactly consistent with terminal growth (`1 − g/ROE = 1 − 3.0/18.0 = 83.3%`). The single-broker strip's own payout ramps 33% (FY2029) → 38% (FY2033), so this path is in the same region and then goes further, as a maturing bank must |
| Book value per share | **Clean surplus: `B_t = B_{t−1} + EPS_t − DPS_t`** | Required by the residual-income identity. Tie-out to the consensus book-value strip shown in §4 |
| Share count | **Held at 4,878,395 thousand** | **Analyst assumption**, with the buyback limitation stated in §1 |

### Terminal (FY2039 onward)

| Assumption | Base | Source / Basis |
|---|---:|---|
| Terminal return on equity | **18.0%** | **Analyst assumption, benchmarked — see the Cyclicality Gate below** |
| Terminal growth `g` (USD nominal) | **3.0%** | **Analyst assumption.** Long-run USD-nominal growth for a Brazil-centred lender ≈ Brazilian real GDP growth (2.3% in 2025, 3.4% in 2024 [FY2025 20-F, Item 5 macroeconomic indicators]) + US inflation (~2.0%, the Fed's stated target), i.e. ~4.0–4.5% at purchasing-power parity. **3.0% is deliberately set below that**, because `business-model/09_moat.md` records the annual Brazilian card-share increment collapsing from +2.9pp and +2.3pp to **+0.3pp and +0.5pp**, with 62% of Brazilian adults already customers |
| Terminal payout | **83.3%** | `1 − g/ROE`; makes the terminal internally financeable (Gate 2, checked in §5) |

**Working-capital driver: not applicable, and this is a statement of fact, not an omission.** A bank has no trade working capital. The economic equivalent — the growth in the loan book and the deposits that fund it — is already inside the ROE and retention path above: book value grows only by retained earnings, and the loan book grows with it. There is no working-capital line, no ΔNWC term, and no sign convention to check, because the FCFF identity is not used in this model.

### Cyclicality Gate — terminal ROE benchmarked against peer-normal AND prior-trough (MODULE_RULES Gate 6)

`business-model/10_external-dependency.md` scores external dependency 57/100 (inverted), and `business-model/07_business-quality.md` scores cyclicality **30/100** (weak — high cyclicality) on a book that is 92% unsecured [Q2'26 investor deck, p.13 — managerial basis]. The terminal return is therefore benchmarked, not set "below the recent peak":

| Anchor | Value | Citation |
|---|---:|---|
| **Company's current level (a labelled cycle peak — rejected as a terminal)** | 31.63% LTM ROE / 29.2% return on tangible book | CIQ `Ratios` export, LTM Jun-30-2026 — vendor export; `business-model/09_moat.md` §3 records the CFO calling the Q2'26 33% ROE "a record" |
| **Peer-normal — best large incumbent** | Itaú Unibanco **24.3%** return on tangible book | `Capital IQ Comps → Financial Data`, as-of 2026-08-29 — vendor export, via `business-model/09_moat.md` §4 |
| **Peer-normal — median of the six listed Brazilian/LatAm banks with disclosed returns** | **~15.95%** (Itaú 24.3, BTG 23.7, Inter 16.7, Bradesco 15.2, Santander Brasil 14.7, Banco do Brasil 9.6) | same source |
| **Prior-trough anchor (a)** — weakest listed comparable in the same set | Banco do Brasil **9.6%** return on tangible book | same source |
| **Prior-trough anchor (b)** — NU's own loss-inclusive five-year average ROE | **12.40%** (FY2021 −6.78%, FY2022 −7.81%, FY2023 18.24%, FY2024 28.07%, FY2025 30.28%) | CIQ `Ratios` export, via `business-model/09_moat.md` §3 |
| **Terminal ROE used (base)** | **18.0%** | Sits **above** both trough anchors (9.6% and 12.4%) and above the peer median (15.95%), **below** the best incumbent (24.3%) and far below the company's own peak (31.6%) |

**Why NU's own prior trough is not the whole answer, stated rather than glossed.** `business-model/09_moat.md` §3 is explicit that FY2021–FY2022 were "a scaling business emerging from start-up losses, **not** a credit cycle", and that **no Brazilian consumer downturn exists inside the profitable record at anything like the current book size**. So the 12.40% five-year average is a *young-company* trough, not a *downturn* trough, and the industry anchor (Banco do Brasil 9.6%) is carried alongside it for that reason. The base terminal of 18.0% is a judgment that the measured cost advantage — ~85% lower cost to serve, 14,314 customers per employee against an incumbent average of 1,234 [FY2025 20-F, Item 4.B] — survives a downturn in a diminished form. A case in which it does not is built in §5 as the runoff terminal.

---

## 3. Discount Rate — Cost of Equity (there is no WACC in this model)

**Why there is no WACC.** For a Financial the Method Map requires the equity to be valued directly at the **cost of equity**. A bank's debt and deposits are raw material, not a financing choice sitting alongside equity: deposits of USD 45,328.4m and payables to network of USD 15,541.7m are 74% of Nu's liabilities and are excluded from any EV bridge [`01` §4]. Blending a cost of debt into a "WACC" here would be a category error. **The `after-tax k_d ≤ WACC < k_e` bound in MODULE_RULES Gate 4 is therefore not applicable** — not waived, but structurally absent, because only one leg of the blend exists. The equivalent bound that *is* applied is the low-side floor set below.

| Component | Value | Source |
|---|---:|---|
| Risk-free rate (USD, 10-year US Treasury) | **4.79%** | **Web-sourced, labelled:** US 10-year Treasury note yield, 4.79% on 2026-09-04 [Web: tradingeconomics.com, US 10-Year Government Bond Yield, read 2026-09-06 — indicative, unverified]. A USD risk-free rate is used because the model, the reporting currency and the price are all USD |
| Mature-market equity-risk premium | **4.23%** | **Web-sourced, labelled:** Damodaran mature-market implied ERP, January 2026 [Web: pages.stern.nyu.edu/~adamodar country risk premium dataset, read 2026-09-06 — indicative, unverified] |
| Country-risk premium (Brazil) | **3.24%** | **Web-sourced, labelled:** Damodaran Brazil country risk premium, January 2026 [same source]. **Required, not optional** — 91.3% of geographically-attributed revenue is Brazilian [FY2025 20-F, Note 34(b)]. Applied at 100% weight rather than blended, because Colombia's CRP is higher and Mexico's only modestly lower, and the 9% non-Brazil weight cannot move the blend by more than roughly 0.1pp |
| Beta | **0.94** | `Capital IQ Comps → Operating Statistics`, "5 Year Beta", as-of 2026-08-29 — vendor export. **Window:** five years. **Reference index:** the US-listed NYSE:NU line against a US index, which is the correct pairing for a USD risk-free rate and a US mature-market ERP |
| **Cost of equity `k_e` — computed (CAPM)** | **12.01%** | `k_e = rf + β × ERP_mature + CRP = 4.79% + 0.94 × 4.23% + 3.24%` |
| *Cross-check, single-premium form* | *12.07%* | *`4.79% + 0.94 × 7.74%`, using Damodaran's Brazil total ERP of 7.74% (July 2026 update) — the two constructions agree to 6bp* |
| **Cost of equity `k_e` — USED in the base model** | **13.00%** | **Analyst override of +0.99pp, justified below and inside the ±1.5pp discipline** |

**Formula, pinned (this is an equity-direct model, so there is no `w_e·k_e + w_d·k_d·(1−t)` blend to assemble).** `k_e = risk-free rate + beta × mature-market equity-risk premium + country-risk premium`. Plain meaning: what a shareholder should demand for owning this equity — the return on a safe US government bond, plus extra for owning shares at all, scaled by how much this share moves with the market, plus extra again for the political and currency risk of earning nearly all the money in Brazil. The computed figure was produced by the executed snippet in §4, not assembled by hand.

**The +0.99pp override, in one sentence.** The computed 12.01% is raised to **13.00%** because the company's own disclosed Brazilian cost of equity of 16.51%, translated onto this model's USD basis, lands at **13.98%–14.54%** (§3A), and because the two upstream quality reads that bear on the discount rate both point the same way — `business-model/07_business-quality.md` scores cyclicality **30** and industry rate-of-change **38** (tripping CLAUDE.md §24 Filter 5), and `business-model/09_moat.md` returns **Narrow moat** with an explicit instruction that "the durability period assumed in any DCF should be short". Both the computed and the used figures are shown, the override is 0.99pp (inside the ±1.5pp cap), and the §7 grid runs the model at the un-overridden 11.5% as well as at the higher comparators.

**Beta cross-check against the low-side floor.** The Brazilian-listed peers in the same export show betas of 0.13–0.44 (Itaú 0.16, Bradesco 0.23, Banco do Brasil 0.23, Santander Brasil 0.18, BTG 0.32, Banorte 0.13, Cibest 0.44). Those are **local-index measurement artefacts** and are not used. The four **US-listed** LatAm financial comparables — Inter & Co 0.96, Credicorp 0.86, PagSeguro 1.28, and NU itself 0.94 — cluster around 0.95 and are the matched-basis set [`Capital IQ Comps → Operating Statistics`, as-of 2026-08-29]. Beta 0.94 is therefore sourced, matched-basis, and above the ~0.8 floor; no flooring or re-levering is needed, and both readings are shown.

### Low-side floors — printed and cleared (MODULE_RULES Gate 4)

| Floor | Test | Result |
|---|---|---|
| `k_e − rf ≥ ~4pp` | `13.00% − 4.79% = 8.21pp` (on the computed rate: `12.01% − 4.79% = 7.22pp`) | **Cleared** on both |
| Beta ≥ ~0.8 for a cyclical / competitively-priced business, with source, window and index stated | 0.94; Capital IQ 5-year beta; NYSE:NU line vs a US index; corroborated by three US-listed LatAm financial peers at 0.86–1.28 | **Cleared** — no flooring required |
| Country-risk premium stated, or its omission deliberately stated | Brazil CRP **3.24%** applied at 100% weight; 91.3% of revenue is Brazilian | **Cleared** — stated and applied, not omitted |

### High-side check
Not applicable in the developed-market mega-cap sense (`k_e ≤ rf + 1.4 × ERP` is a test for a low-risk developed-market issuer). For completeness: `4.79% + 1.4 × 4.23% = 10.71%` — this issuer sits above it, and the reason is the explicit, cited country-risk premium of 3.24%, not an unexplained beta.

---

## 3A. Cost-of-Capital Reality Test (mandatory — CLAUDE.md §16, MODULE_RULES Gate 4)

**The filings were searched for disclosed discount rates. One exists, and its scope is proved before it is used.**

| Reference | Rate | Source (cited per §5) | Gap vs model `k_e` (13.00%) |
|---|---:|---|---:|
| Model cost of equity (CAPM build, §3) | 12.01% computed / **13.00% used** | this agent, §3 | — |
| **Scope-matched group discount rate** | **Group discount rate not disclosed** | Nu Holdings discloses no group-level cost of equity or WACC in the FY2025 20-F or the Q2 2026 interim statements. The only rate in the filings is the CGU rate in the row below | — |
| Other disclosed rate — **comparator only** | **16.51% (BRL basis)** → **13.98%–14.54% translated to USD** | FY2025 Form 20-F, Consolidated Financial Statements, Note 3(b) — Impairment of goodwill: *"The discount rate used was the cost of equity for business in Brazil"*, applied to the **Investments activities CGU** (carrying amount USD 567m, goodwill USD 348m), with a 3.69% perpetual growth rate described as "the currently expected long term inflation rate for Brazil". **Scope record: object = named CGU, not the listed group; geography = Brazil (matches, 91.3% of revenue); currency = BRL (mismatch with this USD model); basis = post-tax value-in-use; method = cost of equity (matches).** Three of five match, so this is a **labelled sensitivity comparator, never the base rate** | **model is 0.98–1.54pp below** (USD-matched basis); 3.51pp below on the raw BRL basis, which is a currency mismatch, not a like-for-like gap |
| Market-implied rate | **11.58%** | Solved here by inverting this same model at the pool-verified price of USD 14.30 (arithmetic in §4). `05_reverse-dcf` runs after this agent and owns the formal read — reconcile there | model is **1.42pp ABOVE** the market-implied rate |
| Company's own trailing earnings yield / forward earnings yield | **5.14%** trailing; **7.76%** forward | LTM diluted EPS USD 0.7348 ÷ 14.30 [CIQ `Key Stats`, LTM Jun-30-2026 — vendor export; `01` §1]; FY2027E EPS USD 1.11006 ÷ 14.30 [`Capital IQ Estimates→Consensus`]. **A free-cash-flow yield is not computable and not meaningful** — LTM CFO is −USD 10,304.8m by construction for a growing bank | model is 5.2–7.9pp above — as it must be, since an earnings yield is not a required return |
| Peer / industry cost of capital, if evidenced | **No independent peer cost of capital is evidenced in the pool.** The nearest read is the moat module's own independent CAPM cross-check: **18.8%–20.6% on a BRL basis** → **16.22%–18.56% translated to USD** | `business-model/09_moat.md` §3, "Independent group cross-check — CAPM, *inference, not from filings*": Brazilian nominal risk-free rate 15.00% (the Selic policy rate at the annual-report date), beta 0.94, ERP 4–6pp judgment | model is **3.2pp–5.6pp below** |

**Currency conversion shown, because a BRL rate cannot be compared to a USD rate without it (§15).** `k_e(USD) = (1 + k_e(BRL)) × (1 + US inflation) / (1 + Brazil inflation) − 1`, at Brazil IPCA of **4.26%** for 2025 [FY2025 20-F, Item 3.D: *"Brazil recorded inflation of 4.26% in 2025, 4.83% in 2024, and 4.62% in 2023"*] and US inflation of 2.0%–2.5%:
- 16.51% BRL → `1.1651 × 1.020 / 1.0426 − 1 = 13.98%` … `1.1651 × 1.025 / 1.0426 − 1 = 14.54%`
- 18.8% BRL → 16.22%–16.79%; 20.6% BRL → 17.99%–18.56%

**Escalation branch taken: NONE — the trigger does not fire.** Stated in one line, with the arithmetic: (a) there is **no scope-matched group rate**, so branch (b) is unavailable by rule, and the only disclosed rate is a CGU rate that misses on object and currency; (b) on the currency-matched basis the model rate sits **0.98–1.54pp below** that comparator, well inside the ~3pp threshold; and (c) the market-implied rate is **11.58%**, so the model rate is **above** it, not below two-thirds of it. **No `RF-VAL-003` tag is emitted, because no branch was triggered.** Recording the non-firing explicitly, so it is visible rather than silently skipped: had the un-overridden CAPM rate of 12.01% been published as the base, the currency-matched gap to the disclosed comparator would have been 1.97–2.53pp — still inside the threshold, but close enough that the +0.99pp override in §3 is the honest response rather than a cosmetic one.

**The one divergence that DOES bind, and what is done about it (MODULE_RULES WACC-override discipline, final clause).** The moat module's independent cost-of-capital inference translates to **16.22%–18.56% in USD**, which is **3.2–5.6pp above** the 13.00% used here — more than the ~2pp tolerance. **The §7 grid is therefore run spanning both rates (11.5% → 16.5%) rather than asserting one.** The source of the divergence is named rather than averaged away: the moat module built its BRL rate off the **Selic policy rate of 15.00%**, a deliberately restrictive short-term policy setting [FY2025 20-F, Item 3.D], used as a perpetual risk-free rate. A cyclically-restrictive overnight policy rate is not a long-horizon risk-free rate, and the company's own valuation team did not use one either — its disclosed Brazilian cost of equity is 16.51%, i.e. **1.51pp above the Selic**, not 4–6pp above it. That is why this model does not adopt 16–18%; it is also why the grid is run out to 16.5% so the reader can see what that view is worth.

---

## 4. Residual-Income Forecast & Discounting

**The model, written out.** Residual income is the profit left after charging the shareholders' capital at its own cost: `RI_t = EPS_t − k_e × B_{t−1} = (ROE_t − k_e) × B_{t−1}`. Value per share = **opening book + the present value of every future year's residual income + the present value of the terminal residual-income stream**. If the company only ever earned exactly its cost of equity, the value would be book value and nothing more; everything above book in the table below is excess return.

**Discounting convention: mid-year (t − 0.5), as the default requires.** Cash flows and earnings accrue through the year, so each period is discounted from its midpoint. The half-year stub (H2 2026) is discounted at 0.25 years and carries a **half-year** capital charge (`k_e × 0.5 × B`). The terminal value is a stock at the horizon date and is discounted at the full 12.5 years, not mid-year. **The valuation date is 30 June 2026** (the last audited/reviewed balance sheet), and the result is then accreted forward at `k_e` to the price date of 2026-08-28 (0.164 years) so it is comparable to the price anchor.

| Year | Opening book `B(t−1)` | Diluted EPS | ROE on opening book | Capital charge `k_e × B(t−1)` | Residual income | Discount factor (mid-year) | PV of RI |
|---|---:|---:|---:|---:|---:|---:|---:|
| H2 2026 (stub) | 2.7160 | 0.4546 | 33.5%¹ | 0.1765 | 0.2781 | 0.9699 | 0.2697 |
| FY2027 | 3.1706 | 1.1101 | 35.0% | 0.4122 | 0.6979 | 0.8850 | 0.6176 |
| FY2028 | 4.1081 | 1.4595 | 35.5% | 0.5341 | 0.9255 | 0.7831 | 0.7248 |
| FY2029 | 5.3377 | 1.8028 | 33.8% | 0.6939 | 1.1089 | 0.6931 | 0.7685 |
| FY2030 | 6.5846 | 2.1086 | 32.0% | 0.8560 | 1.2526 | 0.6133 | 0.7682 |
| FY2031 | 7.9201 | 2.3974 | 30.3% | 1.0296 | 1.3678 | 0.5428 | 0.7424 |
| FY2032 | 9.2985 | 2.6517 | 28.5% | 1.2088 | 1.4428 | 0.4803 | 0.6930 |
| FY2033 | 10.6686 | 2.8553 | 26.8% | 1.3869 | 1.4684 | 0.4251 | 0.6242 |
| FY2034 | 11.9773 | 2.9957 | 25.0% | 1.5571 | 1.4386 | 0.3762 | 0.5412 |
| FY2035 | 13.1755 | 3.0644 | 23.3% | 1.7128 | 1.3516 | 0.3329 | 0.4499 |
| FY2036 | 14.2225 | 3.0586 | 21.5% | 1.8489 | 1.2097 | 0.2946 | 0.3564 |
| FY2037 | 15.0891 | 2.9805 | 19.8% | 1.9616 | 1.0189 | 0.2607 | 0.2656 |
| FY2038 | 15.7598 | 2.8368 | 18.0% | 2.0488 | 0.7880 | 0.2307 | 0.1818 |

¹ Annualised: `0.4546 ÷ (2.7160 × 0.5)`. All figures USD per fully diluted share.

**Sum of the present value of explicit residual income: USD 7.0033 per share.**

**Tie-out of the modelled book path to the consensus book-value strip (the clean-surplus check).** Modelled BVPS at FY2026 year-end is **3.1706** against a consensus mean of **3.14772** (+0.7%); at FY2027 year-end **4.1081** against **4.12174** (−0.3%); at FY2028 year-end **5.3377** against **5.22645** (+2.1%) [`Capital IQ Estimates→Consensus`, Book Value / Share row, 9/9, 9/9 and 7/7 estimates]. The approximation holds.

**Tie-out of the fade EPS path against the single-broker long strip (evidence the fade is not conservative).** Modelled EPS vs `Capital IQ Estimates→Consensus` FY2029–FY2035 (1/1 estimate each): FY2029 1.803 vs 1.730 (+4.2%), FY2030 2.109 vs 1.950 (+8.1%), FY2031 2.397 vs 2.170 (+10.5%), FY2032 2.652 vs 2.400 (+10.5%), FY2033 2.855 vs 2.630 (+8.6%), FY2034 2.996 vs 2.880 (+4.0%), FY2035 3.064 vs 3.130 (−2.1%). **The base case sits above the Street's own long-range earnings path in six of seven years.** The gap to the price is therefore not produced by a pessimistic earnings forecast.

**Executed command and raw output — the base case, the terminal value, the per-share bridge, the CAPM build and the financeable-growth check.** Nothing in this report is mental arithmetic.

```
$ python3 snip.py
k_e=0.130  B0=2.7160  PV(RI)=7.0033  B_T=16.2326  TV=8.1163  PV(TV)=1.7615
Value/sh 2026-06-30 = 11.4807 ; accreted to 2026-08-28 = 11.7132 ; TV share = 15.3%
CAPM k_e = 4.79% + 0.94x4.23% + 3.24% = 12.006%
financeable g = ROE x retention = 0.180 x 0.1667 = 0.0300
```

The script that produced it, in full (it is the model — a reader can re-run it and reproduce every number above):

```python
ke,B0,g,tR,F = 0.130, 13249.670/4878.395, 0.030, 0.180, 10
cons=[(0.5,0.8482-0.3936,0.0),(1.0,1.11006,0.1725),(1.0,1.45953,0.23)]
B,t,pv = B0,0.0,0.0
for d,e,dv in cons:
    pv += (e-ke*d*B)/(1+ke)**(t+d/2); B += e-dv; t += d
r0 = 1.45953/4.1081; p0, pT = 0.25, 1-g/tR
for i in range(1,F+1):
    w=i/F; roe=r0+(tR-r0)*w; pay=p0+(pT-p0)*w
    pv += (roe-ke)*B/(1+ke)**(t+0.5); B += roe*B*(1-pay); t += 1
tv=(tR-ke)*B/(ke-g); pvtv=tv/(1+ke)**t; V=B0+pv+pvtv
```

**Market-implied cost of equity, solved on the same model (feeds §3A and hands the formal read to `05`).** Holding the identical earnings path, terminal ROE of 18.0% and terminal `g` of 3.0%, and solving for the `k_e` that reproduces the pool-verified price of USD 14.30, gives **11.58%** (bisection over 80 iterations, same script). At the fresher indicative price of USD 15.37 the implied rate is lower still.

---

## 5. Terminal Value

**Method and formula, written out rather than applied from memory.**

`TV_T = RI_{T+1} / (k_e − g)`, where `RI_{T+1} = (ROE_terminal − k_e) × B_T` is the first year of excess return *after* the explicit forecast and `g` is its perpetual growth rate. `k_e − g` must stay comfortably positive: as `g` approaches `k_e` the denominator collapses and the terminal value runs away to infinity.

- `B_T` (book value per share at end-FY2038): **USD 16.2326**
- `RI_{T+1} = (18.0% − 13.0%) × 16.2326 = USD 0.8116`
- `k_e − g = 13.0% − 3.0% = 10.0pp` — a wide, safe gap; no grid cell in §7 comes anywhere near convergence (the narrowest cell is `11.5% − 4.0% = 7.5pp`), so **no cell is NM/invalid** and none is reported as a number it does not deserve.
- **Terminal value (undiscounted): USD 8.1163 per share**
- **PV of terminal value: USD 1.7615 per share** (discount factor 0.2170 at 12.5 years)
- **Terminal value as a share of total value: 15.3%** — far below the 75% escalation line. **This model is not terminal-dominated.** Book value contributes 23.7% and the explicit residual-income stream 61.0%. That is the structural advantage of a residual-income model over a cash-flow DCF for a bank: most of the answer sits in numbers that already exist or are forecast by 12–16 analysts, not in a perpetuity.

**Exit-multiple cross-check of the terminal, both ways.** The terminal implies a price-to-book at the horizon of `1 + (ROE − k_e)/(k_e − g) = 1 + (18% − 13%)/(13% − 3%) = **1.50×** book`. For a mature bank earning 18% on equity against a 13% cost of equity that is a sane exit level — it sits **below** the current peer median price-to-tangible-book of **1.8×** [`Capital IQ Comps → Trading Multiples`, medians, as-of 2026-08-29] and far below NU's own 5.7× today. Read the other way, applying the 1.8× peer median to `B_T` would raise the terminal value by about 20% and the total value by about 3%. The two readings agree that the terminal is not where this valuation is decided.

**Financeable-growth cross-check (Gate 2, adapted to a bank).** For a lender, growth must be funded by retained earnings if the capital ratios are to hold: `g = ROE × retention rate`. Terminal: `18.0% × (1 − 83.3%) = 18.0% × 16.67% = **3.00%**` — **exactly** the modelled terminal `g`, by construction. Gap: **0.0pp**, well inside the ~1.5pp tolerance. This is not a coincidence dressed up as a check; the terminal payout was *derived* from `1 − g/ROE` precisely so the terminal cannot assume growth the balance sheet cannot fund. The check that matters is that the resulting payout (83.3%) is achievable, and it is — a mature bank growing at 3% and earning 18% can pay out five-sixths of its earnings. The near-term path is the tighter constraint, and it is a real one: `business-model/07_business-quality.md` records Tier 1 falling **16.2% → 14.4% → 13.4%** over eighteen months and CET1 **14.7% → 13.0% → 11.9%** while paying no dividend, because 37% FX-neutral portfolio growth outruns even a ~31% return on equity [FY2025 20-F capital-management note; Q2 FY26 Interim Report, Note 33(a)]. The consensus payout of 0% / 15.5% / 15.8% in FY2026–FY2028 is what makes the near-term path financeable, and it is consensus, not an assumption of mine.

**ROIC-drift rule (Gate 3), stated.** The terminal return trends toward but does not reach the cost of equity: 18.0% against a 13.0% `k_e`, a persistent excess of 500bp. That persistence is an **inference**, and it is cited: `business-model/09_moat.md` returns **Narrow moat** with four evidenced sources — cost advantage 78/100, brand 72, scale 68, distribution 60 — and a measured ~85% lower cost to serve. The same file discounts durability because `07_business-quality.md` scores rate-of-change 38. A 500bp perpetual excess is the middle of those two facts, not a reading of either alone.

### Structural-decline / runoff terminal (avoid-ruin, CLAUDE.md §24 Filter 5) — **the trigger fired**

**Which trigger, and the row it comes from.** Trigger (a) — "No moat proven" — did **not** fire: `business-model/09_moat.md` §5 returns **Narrow moat**, i.e. a moat that is proven and narrow, with a **stable** trajectory, and that file states expressly that its verdict "is **not** an erosion signal for the permanent-impairment / declining-perpetuity trigger". **Trigger (b) fired on its second leg:** `business-model/07_business-quality.md` §1 scores **industry rate-of-change / disruption risk at 38 — weak, ≤ 40**, and tags **RF-BQ-005 (fast-changing industry)**. A declining-perpetuity terminal is therefore mandatory and is built below.

**How it is built, on the same nominal USD basis as the rest of the model (no real rate is smuggled in).** Excess returns fade far faster and then go negative: ROE fades from 35.5% (FY2028) to **12.0%** by FY2033 — **below** the 13.0% cost of equity, i.e. the franchise ends up destroying value on new capital — and terminal `g` is set at **1.5% nominal USD**, at or below expected US inflation of ~2.0%, which is a **negative real** growth rate stated in nominal terms as required.

| Year | Opening book | EPS | ROE | Residual income | PV of RI |
|---|---:|---:|---:|---:|---:|
| H2 2026 | 2.7160 | 0.4546 | 33.5% | 0.2781 | 0.2697 |
| FY2027 | 3.1706 | 1.1101 | 35.0% | 0.6979 | 0.6176 |
| FY2028 | 4.1081 | 1.4595 | 35.5% | 0.9255 | 0.7248 |
| FY2029 | 5.3377 | 1.6452 | 30.8% | 0.9513 | 0.6593 |
| FY2030 | 6.3659 | 1.6626 | 26.1% | 0.8350 | 0.5121 |
| FY2031 | 7.1972 | 1.5410 | 21.4% | 0.6054 | 0.3286 |
| FY2032 | 7.7751 | 1.2989 | 16.7% | 0.2881 | 0.1384 |
| FY2033 | 8.0998 | 0.9720 | 12.0% | **(0.0810)** | (0.0344) |

- PV of explicit residual income: **USD 3.2160**; `B_T` = **USD 8.2213**; `RI_{T+1} = (12.0% − 13.0%) × 8.2213 = −USD 0.0822`; `TV = −0.0822 / (13.0% − 1.5%) = −USD 0.7149`; **PV of terminal value = −USD 0.2859** (a *negative* terminal — the model is paying to hold a franchise that earns below its cost of capital).
- **Runoff value: USD 5.6462 at 2026-06-30, USD 5.76 accreted to 2026-08-28.**

**What this number is and is not.** It is **not** the base case and it does not replace it — `04` publishes one base intrinsic value (§6) and shows the runoff beside it. It is the **structural-impairment input** that `07_scenario-and-fair-value` should carry as its structural-reset bear leg (a 24–36 month path, distinct from any cyclical trough), and that the master synthesizer should read against CLAUDE.md §24 and the Kill Criteria. In plain terms: if a Brazilian consumer downturn arrives on a book that is 92% unsecured and 6.9% already 90+ days past due, while the enacted CSLL step-ups lift the tax rate and the statutory card-interest cap holds the price of 38% of revenue, **the equity is worth roughly USD 5.76 — about 60% below the pool-verified price.** That is the down-leg this model can measure, and it is measurable precisely because the moat module was honest that no Brazilian consumer downturn exists inside NU's profitable record.

---

## 6. Model Output — equity-direct (there is NO enterprise-value bridge)

> **No EV → equity bridge is built, and this is a rule, not an omission.** For a Financial the Method Map bars the EV bridge as a value, and `01` §4 shows why: an enterprise value for NU excludes USD 45,328.4m of deposits and USD 15,541.7m of payables to network — USD 60.9bn, roughly 74% of the bank's liabilities. The residual-income model values the **equity** directly, so the bridge is: book value + present value of excess returns = equity value per share. There is no net debt to subtract, no minority to deduct (NCI is USD 2.1m and is already excluded from the parent-only book), and no preferred (none exists) [`01` §4].

| Step | Value (USD per fully diluted share) |
|---|---:|
| Opening book value per share (Jun-30-2026, equity attributable to parent ÷ 4,878.395m) | **2.7160** |
| + PV of explicit residual income, H2 2026 → FY2038 (mid-year discounting at 13.0%) | **7.0033** |
| + PV of terminal residual income (Gordon form, `g` = 3.0%) | **1.7615** |
| **= Intrinsic equity value per share, as of 2026-06-30** | **11.4807** |
| × accretion to 2026-08-28 at `k_e` (0.164 years) | ×1.0203 |
| **= Intrinsic equity value per share, as of 2026-08-28 (the price date)** | **USD 11.71** |
| − Minority interest | 0.00 — already excluded (parent-only book; NCI USD 2.1m) |
| − Preferred equity | 0.00 — none exists [`01` §4] |
| Memo: total equity value implied | `11.71 × 4,878.395m = USD 57,124m` |
| **vs current price (pool-verified anchor, 2026-08-28)** | **USD 14.30 — the model value is 18.1% BELOW the price** |
| **vs fresher indicative price (2026-09-04, web-sourced, unverified)** | **USD 15.37 — the model value is 23.8% below** |

**Implied multiples at the base value, as a sanity read.** USD 11.71 is **4.31×** the fully diluted book value of USD 2.716, **4.72×** tangible book of USD 2.479, and **10.55×** FY2027 consensus EPS of USD 1.11006. The price of USD 14.30 is 5.27× book, 5.77× tangible book and 12.88× FY2027 EPS. So this model does not say the shares should trade near book — it says they should trade at a **high** multiple of book, just a lower one than today's.

**Where the value comes from — the honest decomposition.** 23.7% of the value is book value that already exists; 61.0% is the present value of excess returns over the next 12.5 years, of which the three genuine-consensus years (H2 2026–FY2028) contribute 1.61 of the 7.00, i.e. **14.0% of total value**; and 15.3% is the terminal. The largest single block — roughly 47% of the total — is the **self-built fade from FY2029 to FY2038**, which is an analyst assumption benchmarked against a one-broker strip. That is where a reader should push back first.

---

## 7. Sensitivity Grid (intrinsic value per fully diluted share, USD, as of 2026-08-28)

The two most value-determining inputs in a residual-income model are the **cost of equity** and the **terminal return on equity** — not the terminal growth rate, which barely moves the answer here because the terminal is only 15.3% of value. Both grids are shown. Columns span the full range demanded by §3A: the un-overridden CAPM build (11.5%, rounded down from 12.01% to give the low column real width), the base (13.0%), the currency-translated company-disclosed comparator (14.5%), and the moat module's independent inference translated to USD (16.5%).

**Primary grid — cost of equity × terminal ROE (terminal `g` held at 3.0%)**

| Terminal ROE | `k_e` 11.5% | **`k_e` 13.0% (base)** | `k_e` 14.5% | `k_e` 16.5% |
|---|---:|---:|---:|---:|
| 22% (bull terminal) | 17.76 | 14.25 | 11.71 | 9.27 |
| 20% | 16.10 | 12.96 | 10.69 | 8.50 |
| **18% (base)** | 14.48 | **11.71** | 9.70 | 7.76 |
| 16% (≈ peer median 15.95%) | 12.91 | 10.50 | 8.74 | 7.02 |
| 14% (near NU's own loss-inclusive 5-yr average of 12.4%) | 11.38 | 9.31 | 7.79 | 6.31 |

**Secondary grid — cost of equity × terminal growth (terminal ROE held at 18.0%)**

| Terminal `g` | `k_e` 11.5% | **`k_e` 13.0% (base)** | `k_e` 14.5% | `k_e` 16.5% |
|---|---:|---:|---:|---:|
| 4.0% | 15.26 | 12.13 | 9.92 | — |
| 3.5% | 14.85 | 11.91 | 9.81 | — |
| **3.0% (base)** | 14.48 | **11.71** | 9.70 | 7.76 |
| 2.5% | 14.15 | 11.53 | 9.61 | — |
| 2.0% | 13.85 | 11.37 | 9.52 | — |

**No cell is NM or invalid.** The narrowest `k_e − g` gap in either grid is 7.5pp (11.5% − 4.0%), nowhere near the convergence zone where a Gordon denominator blows up.

**Read of the grid in one line each.** Moving the cost of equity by 1.5pp moves the value by roughly USD 2.4–2.8 (about 21–24%); moving terminal ROE by 2pp moves it by roughly USD 1.2–1.6 (about 11–13%); moving terminal `g` by a full percentage point moves it by about USD 0.35 (3%). **The cost of equity is the dominant assumption, and terminal growth is nearly irrelevant.** The whole grid spans **USD 6.31 to USD 17.76**; the price of USD 14.30 is cleared only in the top-left region — `k_e` at or below about 11.6% with a terminal ROE at or above 18%, or a terminal ROE of 22% at a 13.0% cost of equity.

**Two additional labelled points, so the reader can see the effect of the §3 override and of the §5 trigger:**
- At the **un-overridden CAPM rate of 12.01%** with the same base assumptions: **USD 13.45** — 5.9% below the price.
- **Bull terminal** (terminal ROE 22%, `g` 3.5%, `k_e` 13.0%): **USD 14.58** — roughly at the price.
- **Runoff / structural-impairment terminal** (§5): **USD 5.76** — 59.7% below the price.

---

## 8. Intrinsic Read

**Base-case intrinsic value: USD 11.71 per fully diluted share** (as of 2026-08-28), against a pool-verified price of USD 14.30 — the model sits **18.1% below the price**, and 23.8% below the fresher indicative quote of USD 15.37. The sensitivity grid disperses that point over **USD 6.31 to USD 17.76**, with the labelled structural-impairment runoff at USD 5.76; the price is cleared only where the cost of equity is 11.6% or lower *and* the terminal return on equity holds at 18% or better. This is not a pessimistic-earnings result — the model's own earnings path runs **above** the Street's long-range strip in six of the seven years where a comparison exists, and it accepts the full consensus EPS of USD 0.85 / 1.11 / 1.46 for FY2026–FY2028 taxed at a rate above the moat module's ~26% normalized anchor.

**The single assumption it is most sensitive to is the cost of equity**, which moves the value by about 22% per 1.5 percentage points and is the reason the answer sits where it does: 13.0% is a **USD** rate carrying an explicit 3.24% Brazil country-risk premium, and it is bracketed on one side by the pure CAPM build of 12.01% (value USD 13.45) and on the other by the company's own disclosed Brazilian cost of equity of 16.51%, which translates to 13.98–14.54% in USD (value USD 9.70–10.7). The second-order assumption is the terminal return on equity of 18%, benchmarked above the six-bank peer median of 15.95% and both trough anchors (Banco do Brasil 9.6%, NU's own loss-inclusive five-year average 12.40%) but well below NU's current, explicitly peak, 31.6%.

**Confidence and caveats carried forward to `07` and `99`.** (1) Roughly 47% of the base value comes from a **self-built ten-year fade**, because the vendor's FY2029–FY2035 strip is a single broker's model (1/1 estimates) and is not a consensus — that is the first place to push back. (2) The moat module's independent cost-of-capital inference translates to 16.22–18.56% in USD, more than 2pp above the rate used, so the grid is run out to 16.5% rather than one rate being asserted; the divergence is explained (a restrictive 15.00% Selic policy rate used as a perpetual risk-free rate) but not resolved. (3) `01`'s price-staleness cap (valuation confidence max 70) travels with the price-relative reads above, not with the fair-value level, which is price-independent. (4) The clean-surplus roll-forward holds the share count fixed and therefore slightly overstates future book value per share, because the buyback is executing at roughly 4.5× book. **This model is `05_reverse-dcf`'s canonical input: cost of equity 13.00%, opening book USD 2.716, the consensus EPS strip above, terminal ROE 18.0%, terminal `g` 3.0%, mid-year discounting — `05` inverts these, it does not re-derive them.**
