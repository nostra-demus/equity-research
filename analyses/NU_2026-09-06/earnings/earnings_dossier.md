# earnings Module Dossier — NU

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `earnings_memo.md`.

- Generated: 2026-09-06T17:01:58Z
- Module folder: `earnings`
- Contents: 1 module synthesis + 9 specialist outputs = 10 files

## Table of Contents

- [earnings — module synthesis](#earnings-module-synthesis) — `99_earnings-synthesis.md`
- [earnings / 00_earnings-data-triage.md](#earnings-00-earnings-data-triage-md) — `00_earnings-data-triage.md`
- [earnings / 01_historical-financials.md](#earnings-01-historical-financials-md) — `01_historical-financials.md`
- [earnings / 02_revenue-drivers.md](#earnings-02-revenue-drivers-md) — `02_revenue-drivers.md`
- [earnings / 03_margin-drivers.md](#earnings-03-margin-drivers-md) — `03_margin-drivers.md`
- [earnings / 04_guidance-consensus.md](#earnings-04-guidance-consensus-md) — `04_guidance-consensus.md`
- [earnings / 05_beat-miss-setup.md](#earnings-05-beat-miss-setup-md) — `05_beat-miss-setup.md`
- [earnings / 06_earnings-quality.md](#earnings-06-earnings-quality-md) — `06_earnings-quality.md`
- [earnings / 07_earnings-sensitivity.md](#earnings-07-earnings-sensitivity-md) — `07_earnings-sensitivity.md`
- [earnings / 08_earnings-red-flags.md](#earnings-08-earnings-red-flags-md) — `08_earnings-red-flags.md`


---

## earnings — module synthesis

_Source: `99_earnings-synthesis.md`_

# Earnings Module — NU (Synthesis)

**Evidence binding.** All nine upstream specialist outputs and the machine-readable `sensitivity_summary.json` were read in full. Where this synthesis adjudicates a contested claim it re-read the bound frozen extract generation `.extract-generations/f9081efa…4509f2be` (`manifest.json`, `corpus.txt`, `ciq_facts.json`, per-source extracts) directly. No live `data/NU/` path and no `_pool_extracts/` path was read; `data/NU/` below is a citation label only. `relationships.json` is a tier-5 vendor export and is not cited as a filing.

**Prior in-house memo.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is verdict-bearing. `08_earnings-red-flags` tested all seven analytical agents and found the verdict fully stripped and no number sourced from it. It stays stripped here (CLAUDE.md §24) and **no number in this report comes from it.**

**Jurisdiction and basis.** Nu Holdings Ltd. (NYSE:NU, Class A ordinary shares, USD) is a US-listed foreign private issuer incorporated in the Cayman Islands, reporting under **IFRS Accounting Standards** in **US dollars**, fiscal year ending 31 December. The audited annual filing is a **Form 20-F**; the quarterly disclosure is an **unaudited interim condensed consolidated financial statement**. There is no 10-K or 10-Q and their absence is not a data gap (CLAUDE.md §27). Two documents in the pool are Portuguese-original (the FY2025 audited statements, the Q3'25 results release); they are read and translated and count at full source tier — **no data gap and no conviction cap rests on language anywhere in this module.**

---

## Abstract

Nu Holdings' reported earnings are still climbing — Q2'26 revenue up 50.3% and net income up 66.5% year on year — but the improvement is not operating. All 187 basis points of net-margin expansion was the tax line; pre-tax margin fell 155 basis points. The consensus bar looks beatable only through tax, and management said in the pool that sell-side models mix two accounting frameworks, while the reconciliation report that would settle it is absent — so that cushion cannot be sized. The largest risk is currency: a 17.8% fall in the real costs roughly US$1.0bn of net income once the 26.9% dollar-linked cost base is included. Mixed setup.

---

## 1. Earnings Verdict

- **Verdict: Mixed earnings setup** — reported earnings per share accelerating on a tax line whose size against consensus cannot be verified, over operating drivers that are decelerating from a cyclical margin high.
- **Earnings quality /100: 58** *(from `06` — higher = better; stands, not lifted)*
- **Consensus setup /100 (higher = more beatable): 48** *(`04` read "bar is low"; downgraded here to the mixed band under the §13 critical-flag cap and an explicitly-labelled discretionary haircut — see §4)*
- **Earnings volatility /100 (higher = WORSE — inverted): 71** *(`07` scored 66; revised worse, see §3 item 3)*
- **Next-quarter setup: Balanced** *(`05` read "Favors beat"; downgraded here — see §3 item 1)*
- **Biggest earnings driver (one line):** the **cost-of-credit rate**, 10.5% annualised in Q2'26 against 11.6% in Q1'26 and 8.9% in Q2'25 — it sits between a 22.9% NIM and a 12.42% risk-adjusted NIM, so roughly 46% of the interest margin is consumed by credit losses before a dollar of operating cost, and each basis point is ~US$5.302m of annual net income `[Q2'26 Earnings Presentation, Aug-13-2026, slides 15–16; derivation in 03 §7a and 07 §2a]`.
- **Biggest earnings risk (one line):** **BRL/USD depreciation, which hits margin as well as level** — on the company's own 17.8% shock (its 90th-percentile five-year annual return) the translation loss is ~US$578m of net income, and the ~26.9% of FY2025 costs that are dollar-linked add a further **US$570.1m pre-tax / US$469.4m of net income** on a zero-mitigation bound, for roughly **US$1.05bn, 29% of TTM net income** — against an exposure management states it **decided not to hedge** `[FY2025 Form 20-F (filed Apr-08-2026), Item 3.D and Item 11; arithmetic in §3 item 3]`.
- **Red-flag Severity Verdict, reported verbatim from `08_earnings-red-flags` §5: "Critical concerns."** (40 flags triggered + 4 unclear; 1 Critical, 10 High, 24 Medium, 9 Low.) This verdict is not softened or overridden here; where it conflicts with this section's verdict the conflict is surfaced in §3.

---

## 1A. Module Disconfirmation *(CLAUDE.md §8)*

- **Strongest bear point.** The whole reported-margin improvement sits below the operating lines: Q2'26 net margin rose 187bp of which the tax rate contributed **+300.2bp** while every operating component together was **−112.0bp**, and **pre-tax margin fell 155bp year on year** (23.97% → 22.42%). The bridge reconciles to a 0bp residual, so this is arithmetic, not interpretation `[03 §7B/§7a; Q2'26 interim statements, Statements of Income and Note 30]`.
- **Strongest bull point (the steelman).** Underneath the currency and the tax, the operating engine is real and independently disclosed: constant-currency revenue growth of **+34.02%**, ARPAC **+22% FX-neutral** for a sixth consecutive quarter, customers 123m → 139m, and a credit-loss allowance that is **building not releasing** (coverage 15.37% → 16.86% of gross credit assets in six months) while cash collection of accrued interest improved for a fourth straight year (62.5% → 72.0%) `[02 §6a, §4; 06 §2, §8; Q2'26 interim statements, Note 7]`. Neither the credit book nor the revenue recognition shows the deterioration a tax-flattered print might hide.
- **Single killer risk.** The deferred-tax mechanism is self-reversing and its fuel is running down: the US$1,458.6m non-cash deferred tax credit (40.4% of TTM net income to parent) arrives only while provision build outruns tax-deductible write-offs — which is only true while the loan book grows fast — and sequential FX-neutral portfolio growth has more than halved, +11% → +7% → **+5%** QoQ `[06 §10; Q2'26 Earnings Presentation, slide 13]`. Slower growth removes the credit and the growth at once (`07` §5(b) names the same pairing).
- **Disconfirming evidence already visible.** (i) Management stated in the pool, verbatim, that *"consensus estimates across the sell side reflect the mix of IFRS and managerial frameworks"* — which undercuts the module's own central "the Street taxes NU too high" finding `[Q1 2026 earnings-call transcript, May-14-2026, IR opening remarks]`. (ii) The company's own deck states the managerial tax-equivalency adjustments *"are net-income neutral and do not alter reported income tax expenses under IFRS or cash taxes paid"* — which means a coherently managerial model produces the **same** net income and EPS bar as an IFRS one, so the tax gap is worth **zero** on the line that is actually measured `[Q2'26 Earnings Presentation, Aug-13-2026, Appendix — Non-IFRS Financial Measures and Reconciliations, pp.30, 33]`. (iii) The 20-F says ~26.9% of FY2025 costs are dollar-linked, which refutes `03` §5's "FX near-neutral on margin ratios" premise as a general claim.

---

## 2. Specialist Roll-Up

**Claim-fidelity pass performed before publishing (MODULE_PIPELINE, four failure shapes).** Each row below was checked against its source for a dropped qualifier, a dropped basis, a dropped build, and a hardened verdict. Three rows could not carry the truth in short form and are published long: `01`'s revenue trend (both halves of the annual-vs-quarterly contradiction), `06`'s two operating-cash-flow bases (both labelled every time), and `05`'s setup verdict (all three of its qualifiers kept). No row is compressed into "driven by X" where its source named a residual.

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| `00_earnings-data-triage` | **Sufficient.** No partial-data cap binds on availability. US SEC foreign private issuer, IFRS, USD, FY-end 31 Dec; 161 inventory rows, `manifest.json` `failures: 0` | Consensus post-dates the Aug-13-2026 print (revisions to Aug-26-2026), so no staleness haircut applies. Flagged the two-basis operating cash flow (`ciq_facts.json` `ltm_ocf_m` = −10,304.8) as something `06` must interpret against a lending balance sheet rather than score mechanically. **One §5 statement was wrong and is superseded by `04` — see §3 item 7** |
| `01_historical-financials` | **Revenue decelerating on the multi-year annual view (+182.2% FY2022 → +37.0% FY2025) AND inflecting positive over the last six quarters (+18.7% Q1'25 → +50.3% Q2'26), with roughly a fifth of the recent USD acceleration attributable to currency.** Both halves travel together; neither may be quoted alone | TTM to Jun-30-2026: revenue 19,340.0 (+50.5%), net income to parent 3,607.1 (+56.8%), diluted EPS 0.7348 (+56.3%) — while **company-basis TTM CFO went to −US$1,381.6m**, from H1'25 +3,640.0 to H1'26 −1,242.0. Adjudicated the vendor CFO of −10,304.8 as a definitional restatement (deposits moved to financing) and proved the bridge both ways. Net margin expanding while **gross margin compressed 361bp in FY2025** — the contradicting series named with its figures |
| `02_revenue-drivers` | Single reportable segment (Banking, 100%), consolidated read with a geographic cut on a **Note-34 base covering only 79.5% of IFRS revenue**. Q2'26 at or very near a **cyclical high on profitability, not a normalised run-rate** | Revenue decomposition reconciled: volume +13.00pp, monetisation +24.86pp, FX **+16.27pp**, M&A 0.00pp, **residual −3.84pp (7.6% of the move)**. Constant-currency growth **+34.02%**. Names FX as the single biggest revenue *sensitivity* while explicitly refusing to call it the majority *contributor* (32% of the move), and states the honest FX range as **+11.3pp to +16.3pp** — `01`'s qualifier carried, not overwritten. `RF-EARN-001: revenue decomposition reconciled — explained 54.1pp, residual -3.8pp, total 50.3pp` |
| `03_margin-drivers` | Credit cost is the biggest margin lever, current direction favourable **but not run-rate**; risk-adjusted NIM 12.42% is the primary metric and IFRS gross margin 42.56% its audited anchor — **and neither explains the bottom line, which is being set by tax** | Two bridges, both reconciled: 7A risk-adjusted NIM +294bp QoQ (explained 293, residual 1bp of disclosed rounding); 7B net margin +187.1bp YoY with **tax +300.2bp = 160% of the observed change** and operating components **−112.0bp**, residual 0bp. Desenrola derived at **~52.5bp** of risk-adjusted NIM, four-fifths already booked. Measured a **realised 18.3% absorption** of the FY2025 funding shock rather than assuming zero mitigation. `RF-EARN-002: margin bridge reconciled — explained 187bps, residual 0bps, total 187bps`. **Two of its own conclusions are corrected in §3 (items 3 and 4)** |
| `04_guidance-consensus` | **"Bar is low"** — on a 12.7pp tax gap: consensus embeds ~30.2% for H2'26 against a management IFRS guide of 15–20% and 11.78% filed in H1'26. **Downgraded here — see §3 item 1** | Corrected `00` by name: four numeric forward statements exist (FY26 efficiency ratio ~20%; IFRS ETR 15–20% for the remainder of 2026; US opex drag <100bp in each of 2026/2027; risk-adjusted NIM "in the same region" as 12.42%). Decomposed the Q2'26 beat: **96.7% of the 12.6% net-income beat was the tax rate, residual +3.90m (3.3%)**, while pre-tax landed within 0.5% of the estimate. Restated the bar onto the correct **period** basis (§1A) — but never onto the correct **accounting** basis, which is the module's central defect |
| `05_beat-miss-setup` | **"Setup favors beat — on the reported net-income and EPS line, and only there"**, with three qualifiers that must travel: (i) it is a claim about reported EPS, not quality, and a tax-delivered beat is a low-quality beat; (ii) the **operating bar is fair-to-demanding, not soft**; (iii) the finding rests on a **two-analyst** explicit tax line and could be a modelling convention. **Downgraded to Balanced here — see §3 item 1** | Refined `03` by name: the vendor's EBIT line does not reconcile to the better-covered EBT line, so the FQ3'26 margin demand is **+126bp of pre-tax margin, not +227bp**. Sized the tax cushion at **9–15pp of pre-tax downside** and showed it has already fired — tax absorbed ~76% of the pre-tax damage in each of Q4'25 (−16.63%) and Q1'26 (−24.59%), both of which still printed EPS misses. **Three arithmetic/citation errors corrected in §3 item 2** |
| `06_earnings-quality` | **Earnings quality 58/100** — top of the 41–60 "material concerns" band. No cap binds: the cash flow statement is present at annual and interim level | **40.4% of TTM net income to parent (US$1,458.6m of US$3,607.1m) is a non-cash deferred tax credit**; cash tax paid **US$2,108.1m is 2.7× the P&L charge US$774.6m**; the deferred tax asset is **27.5% of equity attributable to the parent** against a Brazilian statutory rate that *rose* to 42.5%. Lead measure: **cash-backed net income US$2,148.5m TTM**. Both operating-cash-flow bases labelled everywhere (company −1,381.6 / Capital IQ −10,304.8, reconciling via the +8,923.2 deposit inflow). Corrected `04`'s CFO attribution by name. **`RF-EQ-001` emitted; `RF-EQ-002` tested and does NOT fire on the authoritative basis** |
| `07_earnings-sensitivity` | **Earnings volatility 66/100 (inverted, higher = worse)**; ranked by absolute earnings impact, **credit cost first** (avg \|US$556.8m\|, 15.4% of TTM net income), BRL/USD second (US$486.0m), tax third (US$221.9m at a computed 45% realised offset / US$403.4m at the zero-mitigation bound). **Revised to 71 here — see §3 item 3** | Printed the arithmetic, basis and residual for all nine coefficients and refused to sign two of them: the net earnings effect of the Brazilian policy rate ("residual 100%") and the near-term net-income effect of loan-book size (IFRS 9 inverts the sign over one to two quarters). Adjudicated the business-model module's "BRL is the single biggest lever" by name: right on **equity** (US$1,509.6m, 13.3% of total equity), tied with credit cost on **earnings**. Emitted a schema-valid machine-readable sidecar |
| `08_earnings-red-flags` | **"Critical concerns"** — 40 triggered + 4 unclear; 1 Critical, 10 High, 24 Medium, 9 Low. Recommends the module verdict be restated as **"Mixed earnings setup"** | Found the Critical flag: management stated verbatim that *"consensus estimates across the sell side reflect the mix of IFRS and managerial frameworks"*, and the vendor's 31.25% tax line sits dead-centre of management's **managerial** 30–35% guide rather than its IFRS 15–20% guide — so CLAUDE.md §27 was applied to the *period* basis and never to the *accounting* basis. Also surfaced the 26.9% dollar-linked cost base that no earnings agent carried, and caught three arithmetic/citation errors in `05` |

---

## 3. Reconciliation

Eight disagreements are adjudicated by name. None is averaged. Where a later agent's correction is adopted it is tested first; where it is refined, the refinement is shown.

### 1. The tax-basis challenge — `04`/`05` vs `08`. **The "Low bar / favors beat" read is DOWNGRADED, and its sizing is WITHDRAWN.**

**What each side said.** `04` §7 rated the bar **Low** and `05` §8 concluded **Favors beat**, both resting on a 12.7pp gap between an IFRS-labelled vendor tax line (24.80% implied by the FQ3'26 pre-tax/net-income pair; **31.25%** on the explicit 2-analyst line) and management's IFRS guide of 15–20%, against filed rates of 16.97% (Q4'25), 8.68% (Q1'26) and 14.17% (Q2'26). `08` §2.5 found management's verbatim statement that consensus is a *mix* of frameworks, and that 31.25% is the centre of the **managerial** 30–35% guide.

**What I verified directly in the pool.** Four things, all first-hand:

1. The quote is real and is IR's opening framing of the whole call: *"All financial metrics discussed and presented today reflect our managerial P&L framework, which we introduced in our fourth quarter 2025 results… We are aware that consensus estimates across the sell side reflect the mix of IFRS and managerial frameworks, and we encourage everyone to use the reconciliation report as a reference point for aligning models going forward."* `[Q1 2026 earnings-call transcript, May-14-2026, IR opening remarks — Guilherme Souto, Investor Relations Officer]`
2. **The decisive fact neither `04`, `05` nor `08` states.** The company defines what its managerial framework does to tax: *"Conceptually, tax-equivalency adjustments normalize statutory tax effects so that the underlying economic contribution of certain products, services, and activities can be compared on a consistent pre-tax basis. **These adjustments are net-income neutral and do not alter reported income tax expenses under IFRS or cash taxes paid.**"* `[Q2'26 Earnings Presentation, Aug-13-2026, Appendix — Non-IFRS Financial Measures and Reconciliations, p.30; repeated at p.33: "Reclassifications and tax-equivalency adjustments are net-income neutral"]` It follows arithmetically that a model built **consistently** on the managerial framework produces the **same net income and the same EPS** as one built consistently on IFRS. The managerial framework grosses up pre-tax and grosses up tax by the same amount. **So on a coherent managerial model the "tax gap" is worth exactly zero on the bar that is actually measured — net income (7/7 analysts) and diluted EPS (9/9).** That removes `04`'s +9.8% and `05`'s +9.7%-to-+14.1% sizing at the root, independently of whether the vendor's label is right.
3. **But the bar is not on a full managerial gross-up either, so the direction is not dead.** If the FQ3'26 net income consensus of 1,057.35m were taxed at the managerial guide midpoint of 32.5%, the implied managerial pre-tax would be **1,566.4m** — far above the vendor's FQ3'26 EBT of **1,406.02m** and its EBIT of **1,471.20m**. The pre-tax panel is therefore on an IFRS-plausible scale (EBT margin 23.68% against 22.42% delivered in Q2'26), and pairing it with the net-income panel does imply a **24.80%** rate, which is genuinely above the IFRS guide. `[Capital IQ Estimates→Consensus, Fiscal Quarters block, data as of Aug-26-2026, verified line by line in the pool]`
4. **Three independent reasons the 31.25% line cannot carry the weight `04` and `05` put on it.** (a) It is **2 of 2** analysts. (b) It is **not** the rate embedded in the pair: 1,406.02 × (1 − 0.3125) = **966.64m**, which is 90.7m below the 1,057.35m net-income consensus — the explicit line and the pair are mutually inconsistent. (c) The same row's **Q2'26 cell reads 31** against a filed IFRS rate of 14.17%, i.e. it was never updated to actual, so the row is not maintained as an actuals series in the forecast columns. `05` noticed (c); neither `04` nor `05` performed (b).

**Adjudication, and what travels upward.** The direction of the finding survives on evidence; the **size does not, and cannot be measured from this pool (§11: "Not proven from available data")**. Concretely:
- **Withdrawn:** any claim that closing the tax gap is worth +9.7% to +14.1% of net income, and `05` B1's "High (≥60%)" probability. Both assume the gap converts one-for-one into net income, which the company's own net-income-neutrality statement contradicts for the managerial share of the panel, of unknown size.
- **Downgraded and restated:** the honest, basis-invariant version of the bar. Consensus FQ3'26 net income of **1,057.35m is 0.27% BELOW Q2'26's actual 1,060.199m**, against consensus revenue of 5,936.74m that is **+7.68% QoQ** — so the Street is modelling net margin falling **142bp**, from 19.23% to 17.81%. If NU merely holds Q2'26's net margin on consensus revenue, net income is **1,141.6m (+8.0% on the bar)** and diluted EPS is **1,141.6 ÷ 4,904.837m = US$0.2328 (+5.0%)** — a beat, but **below** the +7.5% material-beat threshold `05` itself set (US$0.238). That is a real but modest edge, and it does not need the tax argument at all.
- **Verdict effect:** consensus setup moves from "Low" into the **mixed band (48/100)**; next-quarter setup moves from **Favors beat → Balanced**; the module verdict cannot be "Earnings accelerating" (§9 cap).
- **What would settle it:** the **Managerial P&L reconciliation report** management names by title — the single highest-value missing document in this module — or a broker-level split of which FQ3'26 pre-tax estimates sit on which framework.

### 2. Three arithmetic/citation errors `08` found in `05`. **All three verified against the pool; two confirmed with a refinement, one confirmed outright.**

- **(a) Share count — `08` is right, and the filing gives an exact number rather than a derived one.** `05` §4 used **4,770m** diluted shares, derived as consensus net income 1,057.34911 ÷ consensus EPS 0.22164 = 4,770.57m — a **consensus-implied** count, not a reported one. The filing discloses its own: *"Weighted average outstanding ordinary shares – diluted EPS (in thousands of shares) **4,904,837**"* for the three months and **4,908,841** for the six months `[Q2'26 interim condensed consolidated financial statements (filed Aug-14-2026), Statements of Income and Note 9 (Earnings per Share)]`. `08` approximated 4,903.8m by division; the disclosed figure is **4,904.837m** and is what travels. Consequences, both adopted: **`05`'s T2 beat trigger falls from ≥US$0.243 to ≥US$0.2365** (1,159.97 ÷ 4,904.837), and **`05` B1's claim that a 14.17% tax rate puts EPS at 0.2530, "above the highest single estimate in the 9-analyst panel (0.25)", flips: 1,206.80 ÷ 4,904.837 = US$0.2461, BELOW the panel high.** Per §17, a trigger built on a share count that cannot be measured the same way twice is restated, not kept: **T2 is restated to ≥US$0.2365 on the filing's own 4,904.837m diluted shares.** Net-income beat percentages are unaffected.
- **(b) FQ4'26 net income citation — `08` is right, confirmed by column alignment.** The vendor's quarterly Net Income (GAAP) row reads `… 1,060.199 (FQ2'26A) / 1,057.34911 (FQ3'26E) / **1,159.04083 (FQ4'26E)** / 1,095.43463 (FQ1'27E)`, cross-checked against the revenue row (5,513.208 / 5,936.7375 / 6,318.7645 / 6,455.75225) and the EPS row (0.2162 / 0.22164 / 0.24278 / 0.24013). `05`'s citation block records 1,095.43463 as FQ4'26 — that is the **FQ1'27** column — and builds a "vendor inconsistency" note on it. **The inconsistency does not exist and is not carried.** `05`'s own §9 body text uses the correct 1,159.04. The second half of that footnote is real and is kept: the quarterly revenue panel (10,481.175 + 5,936.74 + 6,318.76 = 22,736.68) falls **171.3m, or 0.75%, short** of the FY2026 revenue consensus of 22,907.99 — different analyst panels.
- **(c) The `05` §4 EBIT-vs-EBT reconciliation itself is correct and is adopted.** Verified: FQ3'26 EBIT 1,471.19775 vs EBT 1,406.02171, a **65.18m** gap; FQ4'26 1,630.21325 vs 1,531.82444, a **98.39m** gap; against **4.663m** for the Q2'26 actual pair (EBIT 1,240.976, EBT 1,236.313 — the share of loss in associates). Different panels, and the widening gap is itself consistent with the framework-mix flag in item 1.

### 3. FX asymmetry — `03`/`07` vs `08`. **`08`'s challenge is upheld in substance and its number is corrected downward. The FX bear roughly doubles; the effect is symmetric, which `08` did not say.**

**Verified verbatim in the pool:** *"Exchange rate volatility could cause our costs to increase relative to our revenue, given that around **26.9% of our costs in the year ended December 31, 2025 were directly or indirectly linked to the U.S. dollar, whereas the majority of our revenue was denominated in reais**."* `[FY2025 Form 20-F (filed Apr-08-2026), Item 3.D — Risk Factors, exchange-rate risk]` A visible instance sits in the debt note: the **margin loan credit facility of US$1,867.9m is indexed to CME Term SOFR plus a spread**, i.e. a dollar-priced funding cost inside a real-earning business `[Q2'26 interim statements, Note 24(a)(ii)]`.

**What this does to `03` §5's premise.** `03` wrote FX is "large on *levels*, near-neutral on *margin ratios* — the same rate translates numerator and denominator". That is correct for the ~73.1% of the cost base that is in local currency and correct that the FX-neutral direction of the disclosed margin components does not flip. **It is wrong as a general premise**, because roughly a quarter of costs do not translate with revenue. `07` row 2 inherited the premise into its **0.9 elasticity**, so the published FX bear prices translation only.

**The corrected arithmetic, with its own residual named.** On FY2025 IFRS figures, total costs = revenue 15,774.8 − income before income taxes 3,868.4 = **11,906.4** (net of other income and share of associates). The extra damage from the cost mismatch has a closed form — costs × dollar-linked share × depreciation:

```
11,906.4 x 0.269 x 0.178 = US$570.1m of extra PRE-TAX loss
                            x 0.82333 (TTM retention) = US$469.4m of net income
Check the long way: revenue 15,774.8 x 0.822 = 12,966.9
                    costs   11,906.4 x (0.269 + 0.731 x 0.822) = 10,357.0
                    bound pre-tax 2,609.9 vs 3,179.8 if fully proportional  => 569.9  OK
```

**`08`'s figure of "~US$680m pre-tax, ~US$560m of net income" is overstated by roughly 19% and is not carried.** It applied a cost base of 12,032.7 (gross of other income) against a revenue base net of it, which does not tie to the filed pre-tax profit (15,774.7 − 12,032.7 = 3,742.0 against the filed 3,868.4). **The figure that travels is US$570.1m pre-tax / US$469.4m of net income.**

**Total corrected FX bear.** `07`'s published translation bear at the company's own 17.8% shock is **−US$577.9m** of net income (3,607.1 × 0.9 × 0.178). Adding the cost mismatch gives **≈ −US$1,047m, or 29.0% of TTM net income to parent**, on a zero-mitigation bound — and the zero is disclosed, not assumed: *"We decided not to hedge our foreign exchange exposure originated by our investments in Brazil, Colombia and Mexico"* `[FY2025 20-F, Item 11]`. **This makes BRL/USD, not credit cost, the largest single earnings sensitivity on the bear side**, and it is why `07`'s volatility score is revised from 66 to **71**. Two qualifiers travel: the 0.9 elasticity is already 10% light for the ~9% of the Note-34 revenue base in MXN/COP, and the 26.9% is an FY2025 cost-structure figure applied to a TTM profit base — a period mismatch that the pool cannot close, so the combined figure is a **bound with a stated basis, not a forecast**.
- **What `08` did not say, and it matters:** **the mechanism is symmetric.** On the same closed form, the BRL's **+12.14%** appreciation in Q2'26 was worth **11,906.4 × 0.269 × 0.1214 = US$388.8m of annual pre-tax** *relative to proportional translation* — i.e. part of the reported margin picture is itself FX-flattered, which strengthens rather than weakens `02` §6b and `03` §8's "Q2'26 is not a normalised run-rate" read. The exposure is a two-sided lever, not a one-directional bear.
- The **machine-readable sidecar inherits the defect**: `sensitivity_summary.json` `brl_usd_translation` coefficient **32.46** prices translation only. It is not rewritten here (this run writes one file), and downstream users must add the cost-mismatch term above.

### 4. The operating bar — `03` §8 (+227bp) vs `05` §4 (+126bp). **`05` governs the size; `03` governs the direction; `03`'s derived gross-margin requirement is withdrawn.**

Verified in the pool. `03` computed a **+227bp** operating-margin demand from the vendor's **EBIT** line (1,471.19775 ÷ 5,936.7375 = 24.78% against 22.51% in Q2'26), a line covered by **4 of 6** analysts. `05` showed that line no longer reconciles to the better-covered **EBT** line (**5 of 6**), and computed **+126bp** on EBT (1,406.02171 ÷ 5,936.7375 = **23.68%** against 1,236.313 ÷ 5,513.208 = **22.42%**). Same direction, roughly half the size. **The EBT figure travels.**

**One further correction, adopted from `08` and verified.** `03` §8 concluded from its +227bp figure that "IFRS gross margin must reach roughly 45.9%–46.3%", a level printed once in the data. **That conclusion must not be carried:** the vendor's own FQ3'26 consensus **gross margin line reads 43.16667%**, only **+60.5bp** above Q2'26's actual 42.562% `[Capital IQ Estimates→Consensus, Fiscal Quarters, Gross Margin % row, verified]`. `03`'s requirement came from combining a thin EBIT estimate with management's guided cost path — a conditional, not the consensus set — and uncorrected it overstates the difficulty of the Q3 bar by roughly 100bp of margin. **What survives from `03` §8 is its direction and its cost arithmetic**: management's FY26 ~20% efficiency-ratio guide against 18.63% in H1'26 implies H2 cost ratios **150–195bp worse** than Q2'26's 19.5%, which `03` converted at the measured 74.9% net-revenue-to-total-revenue ratio to **112–146bp** of total revenue — with both of `03`'s own caveats attached (the panels are thin; the conversion ratio is measured on Q2'26's mix).

### 5. FX contribution to Q2'26 growth — `01` (~a fifth) vs `02` (+16.3pp) vs `05` (+5.57% forward). **All three are right on their own basis; none is a correction of another.**

- `01` §6: "roughly a fifth" ≈ **+11.3pp** of the +50.3pp, derived by comparing the company's FX-neutral **gross revenue** growth (+39%) against **IFRS total revenue** growth — two different top lines.
- `02` §6a: **+16.27pp** (a third), derived from the measured period-**average** rate move R$5.6625 → R$5.0496 (**+12.14%**) applied to IFRS total revenue, with constant-currency growth of **+34.02%**. `02` cross-checked the deck's own series to an implied FX factor of +12.07%, agreeing with the measured rate to 7 basis points.
- `05` §3 M3: **+5.57%** — a *forward* figure on the same average-rate basis, Q3'25's average R$5.4493 against the Jun-30-2026 spot R$5.1617 (5.4493 ÷ 5.1617 − 1 = 5.572%), i.e. what the tailwind becomes if spot merely holds.

**Adjudication: `02`'s +16.27pp governs any claim about IFRS total revenue**, because numerator and denominator sit on one basis (income-statement flow, period-average rate, §15/§27). **`01`'s qualifier travels intact — the honest range is +11.3pp to +16.3pp, between a fifth and a third**, and both `02` and `07` print both ends. `05`'s +5.57% is a different period and is not comparable to either; it is the forward number and is the one that belongs in any Q3'26 statement. The pool holds **no BRL reading after Jun-30-2026**, so the current level is *not proven from available data*.

### 6. Sensitivity ranking — `07` (credit cost first) vs `03`/`04`/`06` (tax-and-FX-led). **Both govern, on different claims — and the ranking now changes on the bear side.**

Attribution and magnitude answer different questions, and `07` §3 says so itself. **`03`/`04`/`06` govern every *attribution* claim about what moved the last print:** 100% of Q2'26's +187bp net-margin expansion was tax (`03` §7B, 0bp residual); 96.7% of the 12.6% net-income beat was tax while pre-tax landed within 0.5% of the estimate (`04` §6, residual +3.90m); 40.4% of TTM net income to parent is a non-cash deferred tax credit (`06` §9). **`07` §3 governs every *forward sensitivity or scenario* claim** — but with two qualifiers, one of which now bites. First, `07` itself warns the top three sit within ~4% of TTM net income of each other (US$556.8m / US$486.0m / US$403.4m at the bound), "which is not a wide separation and should not be treated as one" — so **"credit cost is the single biggest variable" must not be published as a ranked fact.** Second, item 3 above corrects the BRL coefficient: **on the corrected bound BRL/USD (≈ −US$1,047m) exceeds credit cost (−US$583.3m) on the bear side**, so the ranking inverts. What is unchanged: the *forward* framing belongs to `07`, the *attribution* framing to `03`/`04`/`06`, and any statement must say which question it is answering before quoting either number.

### 7. Guidance existence — `00` §5 vs `04` §2. **`04` is the corrected record; `00` §5 is superseded.**

`00` §5 recorded "the company issues no quantitative guidance in this pool". Verified against the pool, that is wrong as written. Four numeric forward statements exist: **FY2026 efficiency ratio ~20%** (given May-14-2026, reiterated Aug-13-2026); **IFRS effective tax rate 15–20% for the remainder of 2026** (given once, "for modeling purposes"); **US expansion opex drag "less than 100 basis points" on the consolidated efficiency ratio in each of 2026 and 2027**; and **risk-adjusted NIM "in the same region as where we are today"**, anchored to 12.42%, with the CFO expressly refusing to call 12% a floor. `00` was right only that there is no revenue or EPS guidance. `06` further corrected `04`'s attribution of the tax guide: the speaker was **Guilherme Lago, CFO** on the May-14-2026 call (the seat changed to Rob Livingston on 13-Jul-2026), not Livingston; the quote itself is verbatim-identical. **`06`'s attribution travels.**

### 8. Cash flow and earnings quality — `06` (58/100) vs `08` (High, not Critical). **`08`'s severity call is adopted; `06`'s score stands and is not lifted.**

Both operating-cash-flow figures travel with their basis labels on every appearance, here and downstream: **company-basis TTM CFO −US$1,381.6m** (deposits inside operating, as IAS 7 permits for a bank) and **Capital IQ-basis LTM CFO −US$10,304.8m** (the deposit inflow moved to financing), reconciling exactly via the **US$8,923.2m** deposit inflow: −10,304.8 + 8,923.2 = −1,381.6. `08` §2.7 checked every downstream use line by line and found the discipline held — no agent headlines the vendor figure as the company's CFO, and no agent dismisses the company's own negative figure as a definitional artefact. Neither is a collection failure: cash interest received rose to **72.0%** of accrued effective-interest income in H1'26, a fourth consecutive annual improvement. `08` judged the deferred-tax concentration a §13 red flag at **High**, not Critical, on verified figures — **DTA 3,649,091 ÷ equity attributable to the parent 13,249,670 = 27.54%**, and Note 30's reconciliation applying the **combined Brazilian rate of 42.5% (2026) against 40.0% (2025)** `[Q2'26 interim statements, Note 30 and Statements of Financial Position]`. The reasons it is not Critical are on the record and are accepted: fully disclosed, correctly applied under IAS 12, audited across five annual filings, allowance building not releasing, no impairment, restatement, policy change or useful-life change anywhere in the pool. **Earnings quality stays at 58/100.**

### 9. Where `08`'s Severity Verdict and this section's verdict interact — surfaced, not resolved away.

`08` returned **"Critical concerns"** and recommended **"Mixed earnings setup"**. This synthesis lands on **Mixed earnings setup**, so there is no conflict on the category. There is a difference of emphasis worth stating for the reader: `08` treats the Critical flag as sitting *under* the module's headline finding and recommends the consensus/beat-miss layer specifically be downgraded rather than the whole module. I agree, and the caps in §4 are applied to exactly that layer — the historical, driver, margin and quality work below it reconciles (both bridges to ≤1bp of residual) and is not discounted. One place I go **further** than `08`: its own FX arithmetic is corrected downward by ~19% (item 3), while its conclusion — that the FX bear is understated by close to a factor of two and the volatility score should be worse — is upheld and acted on.

---

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No consensus / estimate data | **N** — Consensus, Surprise, Trends, Revisions and Recent Changes tabs all present; revisions dated Aug-26-2026, after the Aug-13-2026 print | Consensus setup | max 30 — **does not bind** |
| No cash flow statement | **N** — present in the FY2025 20-F, both interim filings and the Capital IQ Cash Flow tab | Earnings quality | max 45 — **does not bind** |
| No revision history | **N** — full Revisions (357×17) and Recent Changes (265×10) tabs present | Consensus setup | max 60 — **does not bind** |
| No verbatim transcript AND no sell-side proxy | **N** — 19 consecutive verbatim S&P Global transcripts (Q4'21–Q2'26) plus the Aug-06-2026 Shareholder/Analyst call | Earnings clarity | max 70 — **does not bind** |
| Transcript role filled ONLY by a sell-side proxy (no verbatim) | **N** — no proxy is used anywhere in the module | Earnings clarity | max 70 — **does not bind** |
| Only inferred sensitivities | **N** — company-disclosed DV01 at two shock sizes across five curves, an FX shock table with its own stated percentile basis, and an ECL macro-scenario table at the latest interim date | Earnings volatility confidence | must be Low — **does not bind**; confidence is Medium |
| No quarterly data | **N** — Q1'26 and Q2'26 interim filings; quarterly actuals FQ4'21–FQ2'26 | Earnings clarity | max 60 — **does not bind** |
| No segment-level P&L for a multi-segment business | **N** — single reportable segment (Banking, 100% of FY2025 revenue) is a real disclosure, not a gap | Earnings clarity | max 70 — **does not bind** |
| Consensus present but **stale** | **N** — revisions post-date the print | Consensus setup | staleness haircut — **does not bind** |
| **Conflicting sources not reconcilable** | **Y** — the IFRS-versus-managerial consensus conflict **cannot** be reconciled from this pool, because the Managerial P&L reconciliation report management names is absent | **Overall usefulness** | **max 65** |
| **§13 critical red flag (`08` flag #1), not resolved by primary evidence** | **Y** | **Consensus setup; next-quarter setup; module verdict** | **Consensus setup ≤60 (set at 48); next-quarter setup may not read "Favors beat" (set at Balanced); the verdict may not be "Earnings accelerating"** |
| **Discretionary, explicitly-labelled haircut on consensus setup** | **Y** — citing `08` flags #1, #3 (tax line 2/2 analysts) and #6 (cross-panel implied rate). **Deliberately NOT the no-consensus max-30 value**, which would read as "consensus absent" and would be false | Consensus setup | landed at **48**, mixed band |
| **Discretionary revision of earnings volatility (worse)** | **Y** — the corrected FX bound in §3 item 3 roughly doubles the largest bear | Earnings volatility (inverted) | **66 → 71** |

**Most restrictive rule applied where caps overlap:** consensus setup is governed by the §13 critical-flag cap (≤60) rather than by any mechanical MODULE_RULES value, and is set at **48**.

**No language-based cap anywhere.** Two Portuguese-original documents were read and translated at full source tier (CLAUDE.md §27). No upstream agent logged a language barrier, and none is inherited.

---

## 5. Earnings Setup Summary

### Revenue Setup

The current trajectory is not sustainable at its reported rate, and the arithmetic says so without needing a view on the business. Between **+11.3pp and +16.3pp** of Q2'26's +50.3% reported growth was the Brazilian real on the period-average rate, and if the currency merely holds at its Jun-30-2026 spot of R$5.1617 that help falls to **+5.57%** next quarter — so consensus revenue of 5,936.74m (+42.27% reported) needs roughly **+34.8% constant-currency growth against the +34.02% just delivered**, i.e. the underlying rate has to stay flat while the currency help more than halves. Reported and organic tell materially different stories and the gap has a number: **+50.3% reported against ~+34.0% constant currency, a 16.3pp wedge** (11.3pp on `01`'s gross-revenue basis; the range travels). Nothing here is acquisition-driven — M&A contributed **0.00pp**, with Banco Porto Real a post-quarter, licence-only agreement pending Brazilian Central Bank approval. The single factor that would flip revenue direction is the **credit portfolio**, since card plus loan interest is 64.21% of revenue: its FX-neutral sequential growth has already gone **+11% → +7% → +5%**, and two threshold constraints sit above it — deposits growing +18% against a book growing +37%, absorbed by a loan-to-deposit ratio that has run 50% → 54% → **58%** on the deck's average basis, and capital adequacy down from 16.6% to **15.7%**. Those are ceilings, not slopes: growth stops rather than decays when either binds.

### Margin Setup

Current margins are at or very near a cyclical peak of this company's own short record, and the record is short — the disclosed risk-adjusted NIM series runs six quarters and NU was loss-making as recently as FY2022, so "peak" is inferred from the Brazilian consumer-credit and policy-rate cycle rather than from a full company cycle. Three things say peak rather than plateau: risk-adjusted NIM of 12.42% is the top of that series and management expressly refused to call 12% a floor; roughly **52.5bp** of it is the Desenrola policy programme, of which *"more than 4/5"* is already booked; and 90-plus-day non-performing loans at **6.9%** are the highest in the 13-quarter disclosed series, which management attributes to a deliberate mix shift rather than a season. The driver that takes the largest bite if it moves adversely by 10–20% is **credit cost**: at US$5.302m of net income per basis point, a 20% relative rise in the 10.5% cost-of-credit rate is +210bp and roughly **US$1.11bn** of net income — though on the corrected bound in §3 item 3 a BRL shock now exceeds it. On protection, the picture is two-sided and must be stated as such rather than as "no pass-through": on the **liability** side deposits are contractually priced at a percentage of the local interbank rate and the ratio is actively managed — it fell from 91% to **88%** while the Selic sat at a decade high — but on the **asset** side the price lever on the largest revenue line is closed by statute, with Law 14,690/2023 capping total charges on revolving and instalment card balances (32.75% of revenue) and the INSS payroll rate capped with Selic as its index. The realised absorption of the one funding shock the filings actually measure was **18.3%** of a 442bp FY2025 hit — a measurement, not a contract, and `03` labels it as such. On currency there is no protection at all and the zero is disclosed: *"We decided not to hedge our foreign exchange exposure originated by our investments in Brazil, Colombia and Mexico."*

### Quality Check

The largest gap between reported and economic earnings is the **non-cash deferred tax credit**, and it is widening fast: it was 14.9% of net income to parent in FY2025 and **40.4% over the trailing twelve months**, while the asset it creates rose 45.3% in six months against pre-tax profit growth of 30.8% and now stands at **27.5% of parent equity** — with recovery on the loss-carryforward slice legally capped at 30% of Brazilian taxable profit a year. Cash tells the opposite story to the accounting rate: cash tax paid was **2.7×** the P&L charge. The company's only non-IFRS profit measure is Adjusted Net Income, and its entire content is adding back share-based compensation and its tax effects — a **recurring** cost paid in shares, present in every period on record, so the adjustment is not one-time; the mitigating facts are that it is only +7.1% of FY2025 reported profit and shrinking as a share (16.1% → 11.9% → 7.1%), and that every agent used the reported IFRS figure throughout. **To model next year I would start from IFRS reported, not from the adjusted number** — the adjusted figure removes a real cost — **but I would not start from the reported tax rate.** The honest normalisation is either `06`'s cash-backed net income of **US$2,148.5m** TTM, or reported pre-tax profit taxed at an explicitly stated rate inside the guided 15–20% band, with the assumption written down. Taxing forward profit at the 17.67% TTM rate embeds a timing benefit whose fuel is decelerating loan growth.

### Consensus Bar

To beat the bar by a material margin the company has to do something operational, not something fiscal: net margin holding flat at Q2'26's 19.23% on consensus revenue delivers **+8.0% on net income but only +5.0% on EPS (US$0.2328)** — short of the +7.5% material threshold — so a material beat needs either the **+126bp of pre-tax margin expansion** the EBT consensus embeds, or a filed IFRS tax rate near the bottom of the guided range, or both. The bar is most likely set wrong on the **net-income line, in the company's favour**, since the Street models net margin falling 142bp sequentially on +7.68% revenue growth; but the size of that error is **not proven from available data** while the accounting basis of the pre-tax and tax panels is unresolved, and on the **pre-tax and cost lines the bar is fair-to-demanding**, not soft — the Street models operating cost 66bp better than Q2'26 while management guides it 112–146bp worse. A meaningful slice of the current consensus is anchored to a tailwind that is already reversing: the estimates were raised hard (**FQ3'26 revenue +7.3%, FY2026 EPS +4.9% in four weeks**) off a print that was itself flattered by a **12.14%** currency move now worth **5.57%**, and by a Desenrola credit benefit that is four-fifths spent.

---

## 5b. Leverage & Capital Structure

**TRIGGER B fires** on the material-change test (total debt up more than 50% year on year). TRIGGER A does not fire — NU is in **net cash**, and no EBITDA line exists for this issuer, so a net-debt/EBITDA ratio is undefined rather than high. This section is written because Trigger B fires; it is not a distress read, and the **balance-sheet-survival module owns the canonical figure** — this module's net debt is a supporting line.

1. **Current level.** Net **cash** of **US$7,811.0m** at Jun-30-2026 on a **strict** basis, composition confirmed against the filing: (borrowings and financing 4,682.3 + repurchase agreements 1,058.3) − cash and cash equivalents 13,551.6, excluding lease liabilities of 66.4, customer deposits and payables to network `[Q2'26 interim statements, Statements of Financial Position, Note 11 and Note 24]`. The `ciq_facts.json` sidecar's **−9,274.2** is a **broad**-basis figure (it nets liquidity of 15,170.9 and folds derivatives and leases into total debt of 5,896.7); both bases are labelled every time and neither is presented as the other. Net debt / Adjusted EBITDA is **not assessable** — `ciq_facts.json` `ltm_ebitda_m` and `net_debt_ebitda_x` are both `unknown`.
2. **Year-on-year change.** In ratio terms: **not computable** (no EBITDA). In absolute terms, total debt (borrowings + repos) went **US$2,039.0m (Dec-31-2024) → US$5,182.0m (Dec-31-2025), +154.1%**, and borrowings and financing alone **1,730.4 → 4,398.2, +154.2%**, reaching **4,682.3** at Jun-30-2026. Net cash moved **−7,146.7 (FY2024) → −9,821.6 (FY2025) → −7,811.0 (Jun-30-2026)** — the absolute change is 1.37× year on year, below the 2× test, so Trigger B fires on the debt-growth limb only.
3. **Largest driver.** Not an acquisition and not operating losses: the increase is **funding for the credit book**, executed as financial-bill issuance by Nu Financeira plus a margin loan credit facility. The H1'26 roll-forward shows new borrowings of 524,696, principal repayments of 448,806 and a **161,269 exchange-rate effect through OCI** `[Q2'26 interim statements, Note 24(a)]`. The H1'26 reduction in net cash is separately explained by the credit book growing US$14,740.0m against only US$5,302.6m of deposit and network-payable funding, plus the first share repurchase in the company's history (**US$500.4m**, 40,659,600 Class A shares held in treasury at Jun-30-2026).
4. **Basis of the ratio.** Not applicable — **no leverage ratio is published or derivable**, because a bank income statement has no EBITDA line and none is manufactured. The company's own prudential measure is capital adequacy: **CAR 15.7% at Jun-30-2026 against 16.6% at Dec-31-2025**, with regulatory capital 5,597.6 against a minimum required 3,749.6, an excess of **1,848.0** that *fell* from 1,889.6 while risk-weighted assets rose 14.7% `[Q2'26 interim statements, Note 33(a)]`.
5. **Maturity profile — disclosed.** Of US$4,682.3m of borrowings at Jun-30-2026, **US$2,825.3m (60.3%) matures within 12 months** (838.6 up to 3 months + 1,986.7 from 3 to 12 months) and 1,856.9 beyond 12 months. **The 24-month split is not separately disclosed**; the underlying instruments run to Jun-2029 (financial bills) and Jun-2027 (margin loan). Pricing is disclosed as an index, not a fixed rate: financial bills are **indexed to a percentage of CDI or CDI plus a fixed spread** (BRL), and the margin loan to **CME Term SOFR plus a fixed spread** (USD) — the second is a live example of the dollar-linked cost base in §3 item 3 `[Q2'26 interim statements, Note 24(a)(i) and (ii)]`. A weighted-average rate is not stated and is not derived here.
6. **Is leverage constraining capital allocation?** On the evidence, **no**. The company started buying back stock for the first time in its history in H1'26 (US$500.4m) while carrying net cash of US$7,811.0m, which is the opposite of a constrained balance sheet. Whether ratings are on negative watch is **not assessable from this pool** — the only S&P export carries dates of 2023-09-22. The real constraint on this business is **funding and capital, not leverage**: deposits growing +18% against a book at +37%, an average loan-to-deposit ratio at 58%, and CAR down 90bp in six months.

**Cross-reference check (required):** the Section 1 verdict is **Mixed earnings setup**, not "decelerating" or "inflecting — negative", so the mandatory rewrite of the "Biggest earnings risk" line to reference leverage does not apply. It is left as currency, which is the larger exposure by a wide margin on the module's own arithmetic.

---

## 6. Key Numbers

- **Revenue growth:** TTM to Jun-30-2026 **US$19,340.0m, +50.5%**; Q2'26 **+50.3% YoY reported** against **~+34.0% constant currency** — the 16.3pp wedge is currency, with `01`'s lower read of ~+11.3pp travelling as the other end of the range `[01 §2/§3; 02 §6a; Q2'26 interim statements, Statements of Income]`.
- **EBITDA margin: not disclosed and not manufactured** — a bank income statement has no EBITDA line (`ciq_facts.json` `ltm_ebitda_m` = unknown). The disclosed substitutes: **IFRS gross margin 42.56%** (Q2'26, +36bp YoY), **EBT margin 22.42%** (−155bp YoY), **net margin 19.23%** (+187bp YoY, all of it tax) `[03 §7B; Q2'26 interim statements]`.
- **EPS:** TTM diluted **US$0.7348** (+56.3%); Q2'26 diluted **US$0.2162** on **4,904,837 thousand** weighted-average diluted shares — the filing's own figure, not a consensus-derived count `[Q2'26 interim statements, Note 9]`.
- **CFO / EBITDA: N/A** (no EBITDA). Substitute **CFO ÷ net income to parent = −38.3% TTM on the company's IFRS basis**, after 122.9% / 121.6% / 122.0% in FY2023–FY2025. The two cash-flow bases, both labelled: **company −US$1,381.6m** and **Capital IQ −US$10,304.8m**, reconciling via the **+US$8,923.2m** deposit inflow `[06 §1, §2]`.
- **Biggest earnings driver, current level:** cost-of-credit rate **10.5%** annualised (Q2'26), from 11.6% in Q1'26 and 8.9% in Q2'25 — improved 115bp sequentially but **160bp worse year on year**, and ~52.5bp of the sequential gain is the Desenrola one-off `[Q2'26 Earnings Presentation, slides 15–16; 03 §7a]`.
- **Consensus gap (basis-invariant version):** the FQ3'26 net-income bar of **US$1,057.35m is 0.27% below** Q2'26's actual US$1,060.199m on consensus revenue **+7.68% QoQ** — the Street models net margin down 142bp. Holding Q2'26's net margin gives **US$1,141.6m (+8.0%)** and EPS **US$0.2328 (+5.0%)** `[Capital IQ Estimates→Consensus, data as of Aug-26-2026]`.
- **Estimate revision direction:** decisively up — FY2026 EPS **8↑/0↓**, FY2026 net income **11↑/0↓**, FQ3'26 revenue 3↑/0↓ in the last month; not one downward EPS or net-income revision at any horizon. Two lines run the other way and are named: FY2026 book value per share 3↑/4↓, and the FY2026 **effective tax rate was revised UP** (consensus 27.3% → 27.41%) `[04 §5; Capital IQ Estimates→Revisions, through Aug-26-2026]`.
- **Earnings volatility score: 71/100 (inverted, higher = worse)** — revised worse from `07`'s 66 for the corrected FX bound.
- **Earnings quality anchor:** **40.4%** of TTM net income to parent (US$1,458.6m of US$3,607.1m) is a non-cash deferred tax credit; cash-backed net income is **US$2,148.5m** `[06 §1a, §9]`.

---

## 7. What Would Change The Earnings Verdict?

| Current Verdict | What Would Upgrade It | What Would Downgrade It | Data Needed |
|---|---|---|---|
| **Mixed earnings setup** | **To "Earnings accelerating":** the Q3'26 print (expected Nov-12-2026) showing **pre-tax margin expanding** rather than the tax line doing the work — concretely, income before income taxes at or above the **US$1,406.0m** consensus (EBT margin ≥23.68% vs 22.42% in Q2'26), **with** the filed IFRS effective tax rate inside the guided 15–20% band, **and** the allowance bridge still showing portfolio growth at roughly the ~68% share it carried in Q2'26 (US$342m of ~US$500m). Separately, the **Managerial P&L reconciliation report** entering the evidence set and showing the consensus pre-tax panel is on an IFRS basis would lift the consensus-setup cap. **To "Earnings inflecting — positive":** FX-neutral sequential portfolio growth re-accelerating above +7% QoQ from the current +5%, with the deposit base growing at a rate that stops the loan-to-deposit ratio rising | **To "Earnings decelerating":** income before income taxes **≤US$1,232m** (an EBT surprise of −12.4% or worse — the level at which even a 14.17% tax rate only meets the net-income bar; it fired in Q1'26 at −24.59% and did not in Q2'26 at +0.46%); **or** the Q3'26 filed IFRS effective tax rate **≥20.0%**, i.e. above management's own guided ceiling and 989bp below the Q3'25 filed rate of 29.89%, so it tests the guide rather than rubber-stamping a YoY improvement; **or** the Q3'26 efficiency ratio **≥21.0%** against Q3'25's 20.3%. **To "Earnings inflecting — negative":** the credit read flipping from demand to cost — the Q3'26 allowance bridge showing portfolio growth well below its ~68% Q2'26 share with the balance from stage migration or reserve strengthening, **and** 15-to-90-day delinquency failing to improve once the disclosed −37bp seasonal effect is subtracted. **A downgrade trigger in its own right:** the tax guide being withdrawn, widened, or reframed onto the managerial 30–35% basis — which removes the beat mechanism with no change whatever in the operating business. **And:** a BRL depreciation toward the company's own 17.8% shock, which on the corrected bound in §3 item 3 costs ~US$1.05bn of net income, 29% of TTM profit | 1. **The Managerial P&L reconciliation report** — the single highest-value missing item in this module, and the one document that settles whether the consensus tax and pre-tax lines are IFRS or managerial. It is **not a language gap**; it is genuinely absent from the 161-row inventory. 2. A broker-level split of which FQ3'26 pre-tax estimates sit on which framework. 3. Any **BRL reading after Jun-30-2026** and any **Selic/CDI reading after Apr-08-2026** — the two largest external variables are currently unobservable. 4. The **Q3'26 interim filing and allowance bridge** (Nov-12-2026). 5. A **published definition for the 35% loan-to-deposit figure**, which has none anywhere in the pool |

**Constraint honoured.** Consensus setup is not "Unknown" — full consensus, surprise, trend and revision data are present and post-date the print — but the §13 critical-flag cap independently blocks "Earnings accelerating", and the driver evidence is not "extremely strong" in the direction that would override it: pre-tax margin fell 155bp year on year and sequential FX-neutral book growth has more than halved.

**Restated trigger (§17, from §3 item 2).** `05`'s T2 beat trigger is republished as **Q3'26 diluted EPS ≥ US$0.2365** — consensus pre-tax 1,406.02 taxed at the guided 17.5% midpoint = 1,159.97m ÷ the filing's own **4,904.837m** diluted shares. It was ≥US$0.243 on a consensus-implied 4,770m count, which cannot be measured the same way twice. Like-for-like comparable: Q3'25 diluted EPS US$0.1595, so the restated trigger is **+48.3% YoY**. On the last two reported periods, an equivalent "beat consensus EPS by ≥6.7%" test fires on Q2'26 (+13.03%) and does not on Q1'26 (−5.21%) — capable of failing.

---

## 8. Note To The Final Synthesizer

**Red-flag severity verdict, reported verbatim and not softened: `08_earnings-red-flags` returned "Critical concerns" (40 triggered + 4 unclear; 1 critical, 10 high, 20 medium triggered plus 4 unclear medium, 9 low).**

**Forensic tag propagation (CLAUDE.md §13; eval check AQ) — carried as standalone lines for the cross-module roll-up:**

`RF-EQ-001 (rising accruals divergent from cash earnings)` — **FIRED** by `06_earnings-quality` §6 on substance: reported profit contains a US$1,458.6m non-cash deferred tax credit (40.4% of TTM net income to parent), cash tax paid is 2.7× the accounting tax charge, and the deferred tax asset has grown to 27.5% of equity attributable to the parent.

`RF-EQ-002 (cash-conversion breakdown)` — **TESTED AND DID NOT FIRE** on the authoritative (filing) basis: the trigger requires the CFO substitute below 50% in 2 or more of the last 3 fiscal years, and FY2023/FY2024/FY2025 read 122.9% / 121.6% / 122.0%. Named the other way per §3: on the Capital IQ basis it would fire in all three years, and the TTM figure of −38.3% does breach 50% on the company's own basis — one year is not two. **Forward test carried: if FY2026 also closes below 50% on CFO ÷ net income on the company's own basis, the trigger fires.** `08` correctly flagged that this forward test is a weak one (§17) because the status quo already satisfies it — H1'26 is −64% — so it is near-certain to fire and should not be read as new information when it does.

**All 1 Critical and 10 High severity flags, propagated in full as required — none omitted:**

- **[CRITICAL] The consensus accounting basis is unverifiable, and it sits directly under this module's most decision-relevant finding.** Management stated verbatim that sell-side consensus mixes IFRS and managerial frameworks; the company's own deck states the managerial tax-equivalency adjustments are net-income neutral, which means a coherently managerial model produces the *same* EPS bar. The "12.7pp tax gap" may therefore be partly or wholly a measurement artefact. **Direction survives; size does not.** This is the reason the module verdict is Mixed rather than accelerating.
- **[HIGH] The one document that would settle it is absent** — the Managerial P&L reconciliation report management directs analysts to by name. It is a genuine, non-language gap and it is this module's single highest-value next data request.
- **[HIGH] The estimate panels behind the central claim are thin and inconsistent:** FQ3'26 effective tax rate **2/2** analysts, EBIT 4/6, revenue 4/8, against EPS 9/9 and net income 7/7. The number the beat case was measured against rests on two analysts.
- **[HIGH] The entire reported margin improvement is below the operating lines.** Q2'26 net margin +187bp of which tax was +300.2bp and every operating component together −112.0bp; **pre-tax margin FELL 155bp**. Reconciled to a 0bp residual. Any "margins are expanding" read that does not say this is refuted by the module's own arithmetic.
- **[HIGH] ~26.9% of FY2025 costs are dollar-linked while most revenue is in reais** — the company's own risk factor, which refutes the "FX near-neutral on margin ratios" premise as a general claim. Corrected size: **US$570.1m of extra pre-tax / US$469.4m of net income** on a 17.8% BRL depreciation, on top of translation. The effect is **symmetric**, so it also flattered Q2'26.
- **[HIGH] The implied tax rate anchoring the beat case is a cross-panel construction** — 24.8% divided out of a 5/6-analyst pre-tax line and a 7/7-analyst net-income line, possibly on two accounting bases. It is not a measurement of what any analyst assumes (§15 matched basis).
- **[HIGH] The miss case is at least as simple as the beat case and has fired twice in four quarters** — pre-tax missed by −16.63% (Q4'25) and −24.59% (Q1'26), both beyond the ~−12.4% cushion, and both printed EPS misses despite tax absorbing ~76% of the damage. The High-versus-Mid asymmetry `05` published between its beat and miss cases is not supported and is narrowed here.
- **[HIGH] Deferred-tax concentration** — 40.4% of TTM profit non-cash, cash tax 2.7× the P&L charge, DTA at 27.5% of parent equity, against a Brazilian statutory rate that *rose* to 42.5%. `08` judged this High, not Critical, and gave its reasons; the judgment is adopted.
- **[HIGH] `07`'s BRL coefficient inherits the FX-neutral-margin premise** the flag above contradicts, so the published FX bear is understated by close to a factor of two — **and the machine-readable sidecar carries the same defect.**
- **[HIGH] The module's headline finding was about the beatability of consensus, not about the trajectory of earnings**, and the two are easy to conflate. `05`'s three qualifiers are carried word for word in §2 of this synthesis.
- **[HIGH] Reported +50.3% growth and +187bp of margin expansion are substantially currency and tax, not operating acceleration.** Strip both and the operating picture is a decelerating book (+5% QoQ FX-neutral) at a cyclical margin high with delinquency at a 13-quarter high.

**What the scores mean, without restating them:**

- **The dominant trend and its driver.** Reported earnings per share are still compounding fast, but the engine under the last print was the tax line and the currency, not the operations. That is the single most important thing to carry out of this module.
- **Whether earnings are clean and cash-backed.** The *operating* accounts look conservatively stated — the allowance is building not releasing, cash collection of accrued interest has improved four years running, and there is no impairment, restatement, policy change or useful-life change anywhere in the pool. The problem is one line below pre-tax: a large timing benefit that consumed no cash, whose fuel is a loan-growth rate that has more than halved.
- **The consensus bar.** Beatable on the bottom line, but by a smaller and less certain margin than the module first concluded, and demanding on the pre-tax and cost lines. Whoever quotes this bar must say which accounting basis they believe it is on.
- **Next quarter and the one after.** Q3'26 is genuinely balanced. **Q4'26 looks worse and it is visible now:** a benign Q3 efficiency ratio makes Q4 arithmetically harder while the ~20% full-year guide stands, Desenrola is spent after its Q3 tail, and the Q4 currency comparison **cannot be computed** because the pool holds no BRL reading after Jun-30-2026.
- **Top sensitivity and its direction.** Currency, moving from tailwind to headwind, and larger than the module's own sensitivity table published. Do not treat the sensitivity rows as independent draws — the BRL, the Selic and the credit-loss rate move together in the adverse direction, and `07` says so.
- **Caps.** Only two bind, and both are judgment applied to one layer: overall usefulness at 65 for an unreconcilable source conflict, and the §13 critical-flag cap on the consensus and beat/miss layer. **No mechanical MODULE_RULES data cap binds anywhere** — the data is genuinely sufficient. Nothing here is capped for language.
- **Biggest missing data point:** the Managerial P&L reconciliation report. Second: any BRL reading after Jun-30-2026.
- **For thesis-type classification (§14):** this is not a pure company-specific read. Business-model `10_external-dependency` scores external dependency 57/100 (inverted) and classifies NU "partly externally driven"; the two largest earnings levers are a currency and a credit cycle, and the net earnings effect of the Brazilian policy rate **cannot be signed at all** from this pool.
- **A framework gap worth fixing, not just noting:** MODULE_RULES lists only business-model `03`, `06` and `10` as cross-module inputs. No earnings agent read `12_red-flags-sweep`, and the module's largest single miss — the 26.9% dollar-linked cost base — came through that gap.
- **`07`'s machine-readable sidecar.** `sensitivity_summary.json` was persisted by the orchestrator from `07` §9 **verbatim**, **validates clean** against `frameworks/sensitivity_summary.schema.json` (all required top-level and per-item fields present, no unknown keys, nine coefficients), and is **engine-computable** by `scripts/sensitivity_math.py`. Caveat that must travel with it: the `brl_usd_translation` coefficient of 32.46 prices translation only and needs the cost-mismatch term from §3 item 3 added.
- **Probability discipline (§10).** Every probability in this module carries a basis, and the bases are weak by construction: NU's post-IPO record is short and the tax structure that produces the central gap has existed for **three quarters**, so any beat-rate statement is **judgment informed by a three-to-five-observation prior, never a measured frequency**. `05` stated this correctly in its §7 and then let the qualifier fall off the row carrying the probability band; the qualifier is reattached here.
- **The prior in-house memo stays stripped.** `08` verified all seven analytical agents stripped its verdict and sourced no number from it. Nothing in this synthesis reverses that.

---

## 9. Simple Summary

- **Revenue is growing fast but less than it looks.** Up 50.3% in dollars last quarter; about a fifth to a third of that was the Brazilian real getting stronger, and that help more than halves next quarter if the currency just stays where it is.
- **Margins improved only because of tax.** All 187 basis points of the net-margin gain was the tax line. Profit before tax actually got worse — down 155 basis points against a year earlier.
- **Earnings are only partly backed by cash.** Roughly 40% of the last twelve months' profit is a tax credit that consumed no cash, and the company paid 2.7 times more cash tax than it charged to the profit statement.
- **The consensus bar is beatable, but by less than this module first thought.** The company's own documents say its managerial framework leaves net income unchanged, so the "analysts tax NU too high" argument may be worth nothing on the number that is actually measured. The document that would settle it is missing.
- **Next quarter is a coin flip, not a favourite.** Hold last quarter's net margin and NU beats the profit bar by about 8% but the per-share bar by only about 5% — under its own "material beat" line.
- **The variable that matters most is the Brazilian real** — and it hurts margins as well as the dollar totals, because about 27% of costs are priced in dollars. Management says plainly it does not hedge this.
- **Earnings are volatile and slightly more so than the specialist scored.** Three separate variables can each move annual profit by more than 13%, and they tend to move together in the bad direction.
- **Yes, this module is useful to the final synthesizer** — but its consensus and beat/miss layer is capped and should be read as conditional, while its historical, driver, margin and quality work reconciles to within a basis point and can be relied on.



---

## earnings / 00_earnings-data-triage.md

_Source: `00_earnings-data-triage.md`_

# Earnings Data Triage — NU

**Evidence binding.** `NOSTRA_FROZEN_EVIDENCE_ROOT` is set, and the complete frozen quartet was present, so this run read ONLY the bound capability generation `.extract-generations/f9081efa…4509f2be` (manifest, corpus, `ciq_facts.json`, `relationships.json`, and its per-source extracts). The canonical extractor was NOT re-run, and no live `data/NU/` path and no `analyses/NU_2026-09-06/_pool_extracts/` path was read. `data/NU/` below is a citation label only.

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (issuer incorporated in the Cayman Islands; operations overwhelmingly Brazil, then Mexico and Colombia) | `FY2025 Form 20-F (filed Apr-08-2026), Item 1 — "Cayman Islands"`; `Capital IQ Financials→Segments (Geographic), FY2025 — Brazil 91%, Mexico 7%, Other 2%` (via `ciq_facts.json` `geographic`, status `present`) |
| Exchange | NYSE, ticker NU (Class A ordinary shares, USD). A Brazilian BDR programme exists at Banco Bradesco (depositary notices in the pool) — a different tradable line, not the line this module reads | `Capital IQ Equity Listings export, as of Aug-28-2026`; `Bradesco BDR depositary notice, Aug-20-2026` |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **US SEC — foreign private issuer.** Annual on Form 20-F; quarterly results furnished as an earnings release plus unaudited interim condensed consolidated financial statements (the 6-K route). There is no 10-K or 10-Q, and their absence is NOT a data gap (CLAUDE.md §27) | `FY2025 Form 20-F, cover page, filed Apr-08-2026`; `Unaudited interim condensed consolidated financial statements for the three and six months ended Jun-30-2026, filed Aug-14-2026` |
| Reporting standard (US GAAP / IFRS / Ind AS) | **IFRS Accounting Standards** (as issued by the IASB) — not US GAAP. Bank presentation template | `FY2025 Form 20-F — "IFRS Accounting Standards"`; `Capital IQ Estimates→Consensus header — "Acctg. Standard: IFRS"` |
| Reporting currency | **US dollar (USD)**, with the operating business earning mostly Brazilian real — so FX translation sits inside every reported line | `Capital IQ Financials→Income Statement, FY2021–LTM Jun-30-2026 — "Currency: USD"`; `Q2'26 interim financial statements, Jun-30-2026` |
| Fiscal-year end | **31 December** | `Capital IQ Estimates→Consensus — "Current Fiscal Year End: Dec-31-2026"`; `FY2025 Form 20-F — year ended Dec-31-2025` |
| Document language(s) | English (20-F, interim statements, transcripts, Q2'26 and Q4'25 decks, Q1'26 press release) and **Portuguese** (FY2025 audited consolidated statements dated Feb-26-2026, the Q3'25 earnings presentation, and the Bradesco BDR notices). Portuguese documents are fully readable and count at full source tier — language is not a data gap (CLAUDE.md §27) | `Form Annual Report (Feb-26-2026) — "Demonstrações financeiras consolidadas para o exercício findo em 31 de dezembro de 2025 e 2024"`; `Q3'25 Apresentação de Resultados, Nov-13-2025` |

Downstream agents must read and cite the local-equivalent documents: **Form 20-F** for the audited full year, the **unaudited interim condensed consolidated financial statements** for the quarter, the **earnings release / earnings presentation** for the reported-quarter numbers management published, and the **earnings-call transcript** for driver detail. Do not mark 10-K, 10-Q, 8-K, DEF 14A or Form 4 "missing".

## 1. File Inventory

| Filename / Workbook Tab | Type | Period Covered (read from inside the document) | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| `Nu Holdings Ltd NYSE NU Financials Balance Sheet.xls` -> tab **Balance Sheet** (89x7) | Data export (CIQ) - annual balance sheet | FY2021-FY2025 annual + LTM/latest to Jun-30-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials Cash Flow.xls` -> tab **Cash Flow** (72x7) | Data export (CIQ) - annual cash flow statement | FY2021-FY2025 annual + LTM 12m to Jun-30-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials Income Statement.xls` -> tab **Income Statement** (94x7) | Data export (CIQ) - annual income statement, bank template | FY2021-FY2025 annual + LTM 12m to Jun-30-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials Industry Specific.xls` -> tab **Industry Specific** (68x7) | Data export (CIQ) - bank-specific metrics (NIM, asset quality) | FY2020-FY2025 annual | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials Key Stats.xls` -> tab **Key Stats** (80x9) | Data export (CIQ) - key financials incl. share price and market cap | FY2022-FY2025A, LTM to Jun-30-2026A, FY2026E-FY2028E | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials Multiples (1).xls` -> tab **Multiples** (61x9) | Data export (CIQ) - quarterly valuation multiples | Quarters Mar-31-2025 to Jun-30-2026 + current 2026-08-28 | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials Multiples.xls` -> tab **Multiples** (60x9) | Data export (CIQ) - quarterly valuation multiples | Quarters Mar-31-2025 to Jun-30-2026 + current 2026-08-28 | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials Ratios.xls` -> tab **Ratios** (149x7) | Data export (CIQ) - profitability, margin and return ratios | FY2021-FY2025 annual + LTM 12m to Jun-30-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials Segments (1).xls` -> tab **Segments** (77x7) | Data export (CIQ) - business and geographic segment P&L | FY2020-FY2025 annual | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials Segments.xls` -> tab **Segments** (77x7) | Data export (CIQ) - business and geographic segment P&L | FY2020-FY2025 annual | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials Supplemental.xls` -> tab **Supplemental** (50x7) | Data export (CIQ) - supplemental financial items | FY2020-FY2025 annual | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials.xls` -> tab **Balance Sheet** (89x7) | Data export (CIQ) - annual balance sheet | FY2021-FY2025 annual + LTM/latest to Jun-30-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials.xls` -> tab **Cash Flow** (72x7) | Data export (CIQ) - annual cash flow statement | FY2021-FY2025 annual + LTM 12m to Jun-30-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials.xls` -> tab **Income Statement** (94x7) | Data export (CIQ) - annual income statement, bank template | FY2021-FY2025 annual + LTM 12m to Jun-30-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials.xls` -> tab **Industry Specific** (68x7) | Data export (CIQ) - bank-specific metrics (NIM, asset quality) | FY2020-FY2025 annual | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials.xls` -> tab **Key Stats** (85x9) | Data export (CIQ) - key financials incl. share price and market cap | FY2022-FY2025A, LTM to Jun-30-2026A, FY2026E-FY2028E | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials.xls` -> tab **Multiples** (61x9) | Data export (CIQ) - quarterly valuation multiples | Quarters Mar-31-2025 to Jun-30-2026 + current 2026-08-28 | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials.xls` -> tab **Ratios** (149x7) | Data export (CIQ) - profitability, margin and return ratios | FY2021-FY2025 annual + LTM 12m to Jun-30-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials.xls` -> tab **Segments** (77x7) | Data export (CIQ) - business and geographic segment P&L | FY2020-FY2025 annual | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Financials.xls` -> tab **Supplemental** (50x7) | Data export (CIQ) - supplemental financial items | FY2020-FY2025 annual | Frozen pool, sync date only (not a content date) | High |
| `Nu Holdings Ltd NYSE NU Key Developments.rtf` | Data export (CIQ) - key developments newsflow | Items through Aug-13-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_(Aug-13-2026).pdf` - 2 identical copies (`Filings/`, `Filings 2/`) | Investor deck - Q2'26 Earnings Presentation, second copy (identical 108,767-char extract) | Quarter ended Jun-30-2026; dated Aug-13-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).doc` | Annual filing (Form 20-F, FY2025 - MHTML copy) | FY ended Dec-31-2025 (filed Apr-08-2026) | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` - 3 identical copies (`Filings/`, `Filings 2/`) | Annual filing (Form 20-F, FY2025) | FY ended Dec-31-2025 (filed Apr-08-2026) | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).doc` | Annual filing (Form 20-F, FY2024 - MHTML copy) | FY ended Dec-31-2024 (filed Apr-16-2025) | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).pdf` | Annual filing (Form 20-F, FY2024) | FY ended Dec-31-2024 (filed Apr-16-2025) | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-19-2024).pdf` | Annual filing (Form 20-F, FY2023) | FY ended Dec-31-2023 (filed Apr-19-2024) | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-20-2023).pdf` | Annual filing (Form 20-F, FY2022) | FY ended Dec-31-2022 (filed Apr-20-2023) | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_20-F(Apr-21-2022).pdf` | Annual filing (Form 20-F, FY2021) | FY ended Dec-31-2021 (filed Apr-21-2022) | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_Annual_Report(Feb-26-2026).pdf` - 2 identical copies (`Filings/`, `Filings 2/`) | Annual filing - audited consolidated financial statements, Portuguese free translation (KPMG opinion) | FY ended Dec-31-2025 and Dec-31-2024 | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` - 2 identical copies (`Filings/`, `Filings 2/`) | Quarterly filing - unaudited interim condensed consolidated financial statements (income, financial position, equity, cash flows, notes) | Three and six months ended Jun-30-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_Interim_Report(May-14-2026).pdf` - 2 identical copies (`Filings/`, `Filings 2/`) | Quarterly filing - unaudited interim condensed consolidated financial statements | Three months ended Mar-31-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_Interim_Report(May-15-2026).pdf` - 2 identical copies (`Filings/`, `Filings 2/`) | Quarterly filing - identical Q1 2026 interim statements, second copy | Three months ended Mar-31-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf` - 2 identical copies (`Filings/`, `Filings 2/`) | Investor deck - Q2'26 Earnings Presentation | Quarter ended Jun-30-2026; dated Aug-13-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Feb-25-2026).pdf` - 2 identical copies (`Filings/`, `Filings 2/`) | Investor deck - Q4'25 Earnings Presentation | Quarter and FY ended Dec-31-2025; dated Feb-25-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(May-14-2026).pdf` - 2 identical copies (`Filings/`, `Filings 2/`) | Earnings press release - 'Nu Holdings Ltd. Reports First Quarter 2026 Financial Results' | Quarter ended Mar-31-2026; dated May-14-2026 | Frozen pool, sync date only (not a content date) | High |
| `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Nov-13-2025).pdf` - 2 identical copies (`Filings/`, `Filings 2/`) | Investor deck - Q3'25 Earnings Presentation (Portuguese) | Quarter ended Sep-30-2025; dated Nov-13-2025 | Frozen pool, sync date only (not a content date) | High |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` -> tab **Consensus** (397x30) | Consensus / estimate export - mean, median, high/low, std dev, number of estimates, target price, long-term growth | FY2026E-FY2028E and FQ3'26E; FY-end Dec-31-2026; FQ3'26 release Nov-12-2026 | Frozen pool, sync date only (not a content date) | High |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` -> tab **Recent Changes** (265x10) | Consensus / estimate export - broker-level recent estimate changes | Changes through Aug-26-2026 | Frozen pool, sync date only (not a content date) | High |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` -> tab **Revisions** (357x17) | Consensus / estimate export - up/down revision counts (revision momentum) | Revision windows to Aug-2026 | Frozen pool, sync date only (not a content date) | High |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` -> tab **Surprise** (200x20) | Consensus / estimate export - actual vs estimate surprise history, quarterly and annual | FQ4'21 through FQ2'26; FY2021-FY2025 | Frozen pool, sync date only (not a content date) | High |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` -> tab **Trends** (238x21) | Consensus / estimate export - estimate trend over time (1w / 1m / 3m ago) | Trailing windows to Aug-2026; FY2026E-FY2028E | Frozen pool, sync date only (not a content date) | High |
| `Charting Excel Export Aug-29-2026 2_02 PM.xls` -> tab **Attributions** (45x1) | Data export (CIQ) - chart attributions | date in header: Aug-29-2026 | Frozen pool, sync date only (not a content date) | Medium |
| `Charting Excel Export Aug-29-2026 2_02 PM.xls` -> tab **Chart 1 with Data** (284x2) | Data export (CIQ) - daily short interest as % of shares outstanding | dates in header: Aug-29-2026 .. 2026-03-26 | Frozen pool, sync date only (not a content date) | Medium |
| `Company Comparable Analysis Nu Holdings Ltd .xls` -> tab **Business Description** (44x3) | Data export (CIQ) - comparable-company business descriptions | date in header: 2026-08-29 | Frozen pool, sync date only (not a content date) | Medium |
| `Company Comparable Analysis Nu Holdings Ltd .xls` -> tab **Financial Data** (50x17) | Data export (CIQ) - comparable-company financial data | dates in header: 2026-08-29 .. 2026-08-13 | Frozen pool, sync date only (not a content date) | Medium |
| `Company Comparable Analysis Nu Holdings Ltd .xls` -> tab **Implied Valuation** (69x9) | Data export (CIQ) - comparable-company implied valuation | date in header: 2026-08-29 | Frozen pool, sync date only (not a content date) | Medium |
| `Company Comparable Analysis Nu Holdings Ltd .xls` -> tab **Operating Statistics** (50x13) | Data export (CIQ) - comparable-company operating statistics | date in header: 2026-08-29 | Frozen pool, sync date only (not a content date) | Medium |
| `Company Comparable Analysis Nu Holdings Ltd .xls` -> tab **Trading Multiples** (50x9) | Data export (CIQ) - comparable-company trading multiples | date in header: 2026-08-29 | Frozen pool, sync date only (not a content date) | Medium |
| `Company Comparable Analysis Nu Holdings Ltd .xls` -> tab **Valuation Chart** (32x2) | Data export (CIQ) - comparable-company valuation chart data | date in header: 2026-08-29 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Analyst Coverage (1).xls` -> tab **Analyst Coverage** (41x6) | Data export (CIQ) - sell-side analyst coverage list | no date in document header | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Analyst Coverage.xls` -> tab **Analyst Coverage** (41x6) | Data export (CIQ) - sell-side analyst coverage list | no date in document header | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Comparable M A Transactions (1).xls` -> tab **Comparable M A Transactions** (17x9) | Data export (CIQ) - comparable M&A transactions | dates in header: 2025-09-24 .. 2017-11-28 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Comparable M A Transactions.xls` -> tab **Comparable M A Transactions** (17x9) | Data export (CIQ) - comparable M&A transactions | dates in header: 2025-09-24 .. 2017-11-28 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Competitors.xls` -> tab **Competitors** (89x8) | Data export (CIQ) - competitor set | dates in header: 2023-12-31 .. 2026-06-30 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Corporate Timeline.xls` -> tab **Corporate Timeline** (51x4) | Data export (CIQ) - corporate timeline | dates in header: 2026-08-13 .. 2026-06-01 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Equity Listings.rtf` | Data export (CIQ) - equity listings and share classes | As of Aug-28-2026 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Equity Listings.xls` -> tab **Equity Listings** (25x11) | Data export (CIQ) - equity listings and share classes | dates in header: 2026-08-28 .. 2026-08-27 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Events Calendar.xls` -> tab **Events Calendar** (27x3) | Data export (CIQ) - earnings and event calendar | dates in header: Feb-17-2026 .. Nov-12-2026 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Financials Capital Structure Details.xls` -> tab **Capital Structure Details** (29x10) | Data export (CIQ) - debt instrument detail | dates in header: Jun-30-2026 .. 2027-06-01 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Financials Capital Structure Summary.xls` -> tab **Capital Structure Summary** (60x7) | Data export (CIQ) - capital structure summary | dates in header: Dec-31-2024 .. 2026-08-13 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Financials Historical Capitalization.xls` -> tab **Historical Capitalization** (38x7) | Data export (CIQ) - historical capitalization | dates in header: 2025-03-31 .. 2026-08-13 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Financials.xls` -> tab **Capital Structure Details** (33x10) | Data export (CIQ) - debt instrument detail | dates in header: Feb-25-2026 .. 2027-10-01 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Financials.xls` -> tab **Capital Structure Summary** (60x7) | Data export (CIQ) - capital structure summary | dates in header: Dec-31-2024 .. 2026-08-13 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Financials.xls` -> tab **Historical Capitalization** (38x7) | Data export (CIQ) - historical capitalization | dates in header: 2025-03-31 .. 2026-08-13 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Fixed Income S P Global Ratings.xls` -> tab **S P Global Ratings** (20x8) | Data export (CIQ) - S&P credit rating history | dates in header: 2023-09-22 .. 2023-09-22 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Fixed Income Securities Summary.xls` -> tab **Securities Summary** (2299x24) | Data export (CIQ) - outstanding debt securities detail | dates in header: 2026-08-29 .. 2026-09-02 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Long Business Description.rtf` | Data export (CIQ) - long business description | As of Dec-31-2025 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Products.xls` -> tab **Products** (31x5) | Data export (CIQ) - product list | date in header: Dec-11-2018 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd NYSE NU Public Company Profile.rtf` | Data export (CIQ) - public company profile incl. share price | As of Aug-28-2026 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd. - ShareholderAnalyst Call.pdf` | Verbatim transcript - Shareholder/Analyst call (AGM), S&P Global Market Intelligence | Call held Aug-06-2026 | Frozen pool, sync date only (not a content date) | Medium |
| `Nu Holdings Ltd. Form 20-F filed on Apr-08-2026.pdf` | Annual filing - CIQ viewer index/outline page of the FY2025 20-F (6.1k chars, navigation only) | FY ended Dec-31-2025 | Frozen pool, sync date only (not a content date) | Medium |
| `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` | User note - prior in-house decision memo, VERDICT-BEARING (probability-weighted target, trade score); verdict must be stripped (CLAUDE.md 24) | Memo dated Aug-30-2026; reference price is the Aug-28-2026 close | Frozen pool, sync date only (not a content date) | Medium |
| `NuHoldingsLtdNYSENUEstimatesReport.xls` -> tab **Multiples** (26x5) | Consensus / estimate export - multiples on consensus estimates | FY2026E-FY2028E | Frozen pool, sync date only (not a content date) | Medium |
| `consolidated_tax_report_2025-26.xlsx` -> tab **Bonds & SGB** (25x12) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `consolidated_tax_report_2025-26.xlsx` -> tab **Dividend** (68x10) | User note - personal brokerage tax workbook tab; not an NU disclosure | dates in header: 2025-09-10 .. 2025-12-10 | Frozen pool, sync date only (not a content date) | Low |
| `consolidated_tax_report_2025-26.xlsx` -> tab **F&O** (51x10) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `consolidated_tax_report_2025-26.xlsx` -> tab **Form 67** (27x13) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `consolidated_tax_report_2025-26.xlsx` -> tab **Interest** (19x5) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `consolidated_tax_report_2025-26.xlsx` -> tab **Intraday** (46x12) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `consolidated_tax_report_2025-26.xlsx` -> tab **LTCG** (146x18) | User note - personal brokerage tax workbook tab; not an NU disclosure | dates in header: 2025-05-27 .. 2022-08-09 | Frozen pool, sync date only (not a content date) | Low |
| `consolidated_tax_report_2025-26.xlsx` -> tab **Schedule FA** (41x13) | User note - personal brokerage tax workbook tab; not an NU disclosure | dates in header: 2024-04-17 .. 2021-04-01 | Frozen pool, sync date only (not a content date) | Low |
| `consolidated_tax_report_2025-26.xlsx` -> tab **Schedule FSI** (33x10) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `consolidated_tax_report_2025-26.xlsx` -> tab **Schedule TR** (28x8) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `consolidated_tax_report_2025-26.xlsx` -> tab **STCG** (163x20) | User note - personal brokerage tax workbook tab; not an NU disclosure | dates in header: 2025-05-27 .. 2024-07-19 | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **Audit & Reconciliation** (24x8) | User note - personal brokerage tax workbook tab; not an NU disclosure | dates in header: 2025-03-31 .. 2027-02-16 | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **Bonds & SGB** (25x12) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **Dividend** (68x10) | User note - personal brokerage tax workbook tab; not an NU disclosure | dates in header: 2025-09-10 .. 2025-12-10 | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **F&O** (51x10) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **Form 67** (27x13) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **IBKR - Capital Gains Detail** (6x25) | User note - personal brokerage tax workbook tab; not an NU disclosure | dates in header: 2026-02-27 .. 2026-02-28 | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **IBKR - Cash Report** (4x5) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **IBKR - Closing Holdings** (4x17) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **IBKR - Consolidated Events** (37x17) | User note - personal brokerage tax workbook tab; not an NU disclosure | dates in header: 2026-02-27 .. 2026-02-27 | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **IBKR - Income and Taxes** (35x15) | User note - personal brokerage tax workbook tab; not an NU disclosure | dates in header: 2026-02-27 .. 2026-02-28 | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **IBKR - Performance Summary** (4x15) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **IBKR - SBI FX Rates** (5x10) | User note - personal brokerage tax workbook tab; not an NU disclosure | date in header: 2026-02-27 | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **IBKR - Source Totals** (60x7) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **IBKR - Tax Summary** (24x8) | User note - personal brokerage tax workbook tab; not an NU disclosure | dates in header: 2025-03-31 .. 2027-02-16 | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **IBKR - Unmapped Numeric Rows** (1136x8) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **Interest** (19x5) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **Intraday** (46x12) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **LTCG** (146x18) | User note - personal brokerage tax workbook tab; not an NU disclosure | dates in header: 2025-05-27 .. 2022-08-09 | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **README - IBKR Report** (12x2) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **Schedule FA** (41x13) | User note - personal brokerage tax workbook tab; not an NU disclosure | dates in header: 2024-04-17 .. 2021-04-01 | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **Schedule FSI** (33x10) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **Schedule TR** (28x8) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **Source Statement Tables** (1037x27) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **Source Statement Text** (2122x4) | User note - personal brokerage tax workbook tab; not an NU disclosure | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` -> tab **STCG** (163x20) | User note - personal brokerage tax workbook tab; not an NU disclosure | dates in header: 2025-05-27 .. 2024-07-19 | Frozen pool, sync date only (not a content date) | Low |
| `Interactive_Brokers_FY2025-26_CA_Audit_Note.txt` | User note - personal brokerage/tax audit note; not an NU disclosure | Indian tax year FY2025-26 | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Auditors.xls` -> tab **Auditors** (18x5) | Data export (CIQ) - reference, ownership or governance tab | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Board Members.xls` -> tab **Board Members** (28x25) | Data export (CIQ) - reference, ownership or governance tab | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Committees.xls` -> tab **Committees** (35x2) | Data export (CIQ) - reference, ownership or governance tab | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Customers.xls` -> tab **Customers** (16x8) | Data export (CIQ) - reference, ownership or governance tab | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Financials.xls` -> tab **Pension OPEB** (15x6) | Data export (CIQ) - reference, ownership or governance tab | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Industry Classifications.rtf` | Data export (CIQ) - industry classification | Snapshot, no date in document | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Investment Analysis Co Investors.xls` -> tab **Co-Investors** (53x3) | Data export (CIQ) - reference, ownership or governance tab | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Investment Analysis Direct Investments.xls` -> tab **Direct Investments** (55x21) | Data export (CIQ) - reference, ownership or governance tab | dates in header: 2026-07-20 .. Jul-20-2026 | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Private Ownership.rtf` | Data export (CIQ) - private ownership | Snapshot, no date in document | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Professionals.xls` -> tab **Professionals** (29x24) | Data export (CIQ) - reference, ownership or governance tab | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Public Ownership Crossholdings.xls` -> tab **Crossholdings** (1840x7) | Data export (CIQ) - reference, ownership or governance tab | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Public Ownership Detailed.xls` -> tab **Detailed** (1346x15) | Data export (CIQ) - reference, ownership or governance tab | dates in header: 2026-07-23 .. 2026-06-30 | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Public Ownership History.xls` -> tab **History** (1499x5) | Data export (CIQ) - reference, ownership or governance tab | dates in header: Dec-31-2025 .. Jun-30-2026 | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Public Ownership Insider Trading.xls` -> tab **Insider Trading** (46x11) | Data export (CIQ) - reference, ownership or governance tab | dates in header: 2026-08-24 .. 2026-03-26 | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Public Ownership Summary.rtf` | Data export (CIQ) - public ownership summary | Positions Jul-23-2026; price Aug-28-2026 | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Strategic Alliances.xls` -> tab **Strategic Alliances** (25x7) | Data export (CIQ) - reference, ownership or governance tab | date in header: Dec-01-2020 | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Suppliers.xls` -> tab **Suppliers** (25x8) | Data export (CIQ) - reference, ownership or governance tab | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Takeover Defenses.xls` -> tab **Compare Defenses** (36x8) | Data export (CIQ) - reference, ownership or governance tab | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Takeover Defenses.xls` -> tab **Corporate Governance** (48x4) | Data export (CIQ) - reference, ownership or governance tab | dates in header: 2022-04-21 .. 2021-09-13 | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd NYSE NU Takeover Defenses.xls` -> tab **Takeover Defenses** (26x4) | Data export (CIQ) - reference, ownership or governance tab | dates in header: 2022-04-21 .. 2021-09-13 | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls` -> tab **Aggregates** (22x4) | Data export (CIQ) - reference, ownership or governance tab | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls` -> tab **Filtered Count** (22x4) | Data export (CIQ) - reference, ownership or governance tab | no date in document header | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls` -> tab **Nu Holdings Ltd NYSENU Corpor** (53x17) | Data export (CIQ) - reference, ownership or governance tab | date in header: 2026-06-30 | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q1 2022 Earnings Call, May 16, 2022.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q1 2023 Earnings Call, May 15, 2023.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q1 2024 Earnings Call, May 14, 2024.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q1 2025 Earnings Call, May 13, 2025.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q1 2026 Earnings Call, May 14, 2026.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q2 2022 Earnings Call, Aug 15, 2022.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q2 2023 Earnings Call, Aug 15, 2023.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q2 2024 Earnings Call, Aug 13, 2024.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q2 2025 Earnings Call, Aug 14, 2025.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q2 2026 Earnings Call, Aug 13, 2026.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q3 2022 Earnings Call, Nov 14, 2022.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q3 2023 Earnings Call, Nov 14, 2023.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q3 2024 Earnings Call, Nov 13, 2024.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q3 2025 Earnings Call, Nov 13, 2025.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q4 2021 Earnings Call, Feb 22, 2022.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q4 2022 Earnings Call, Feb 14, 2023.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q4 2023 Earnings Call, Feb 22, 2024.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q4 2024 Earnings Call, Feb 20, 2025.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu Holdings Ltd., Q4 2025 Earnings Call, Feb 25, 2026.pdf` | Other - unclassified | Undated | Frozen pool, sync date only (not a content date) | Low |
| `Nu_Holdings_Ltd_-_(Aug-19-2025).pdf` - 2 identical copies (`Filings/`, `Filings 2/`) | Other - Bradesco BDR depositary notice linking to the Q2'25 earnings release (Portuguese link stub, 360 chars) | Notice dated Aug-19-2025; refers to Q2'25 | Frozen pool, sync date only (not a content date) | Low |
| `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf` - 2 identical copies (`Filings/`, `Filings 2/`) | Other - Bradesco BDR depositary notice linking to the Q2'26 earnings release (Portuguese link stub, 341 chars) | Notice dated Aug-20-2026; refers to Q2'26 | Frozen pool, sync date only (not a content date) | Low |
| `Nu_Holdings_Ltd_-_Form_Interim_Report(May-20-2026).pdf` - 2 identical copies (`Filings/`, `Filings 2/`) | Other - Bradesco BDR depositary notice linking to the Q1'26 earnings release (Portuguese link stub, 342 chars) | Notice dated May-20-2026; refers to Q1'26 | Frozen pool, sync date only (not a content date) | Low |
| `Nu_Holdings_Ltd_-_Form_Interim_Report(Nov-17-2025).pdf` - 2 identical copies (`Filings/`, `Filings 2/`) | Other - Bradesco BDR depositary notice, Q3'25 (Portuguese link stub, 340 chars) | Notice dated Nov-17-2025; refers to Q3'25 | Frozen pool, sync date only (not a content date) | Low |
| `Transaction Summary M A Private Placements.xls` -> tab **M A Private Placements** (25x14) | Data export (CIQ) - reference, ownership or governance tab | dates in header: 2026-07-20 .. 2016-12-09 | Frozen pool, sync date only (not a content date) | Low |
| `Transaction Summary Public Offerings.xls` -> tab **Public Offerings** (15x8) | Data export (CIQ) - reference, ownership or governance tab | dates in header: 2021-12-28 .. 2021-12-08 | Frozen pool, sync date only (not a content date) | Low |
| `U21257060_20260331_20260331.pdf` | User note - personal IBKR account statement | As of Mar-31-2026 | Frozen pool, sync date only (not a content date) | Low |
| `99The_Expectant_Father__th_Edition_.torrent` | Other - unrelated non-financial file (torrent); no analytical content | n/a | Frozen pool, sync date only (not a content date) | None |

**161 inventory rows** cover all 176 file/tab entries in `GENERATION_ROOT/manifest.json` (115 sources = 67 documents + 48 workbooks; the 48 workbooks expand to 109 tabs, each listed above as its own row). 15 documents exist as two identical copies (the pool carries both a `Filings/` and a `Filings 2/` folder); each such pair is one row, labelled. Manifest reports `failures: 0` - every source extracted, so nothing in this pool is missing for extraction reasons.

Reading notes on the inventory:

- **No multi-tab workbook is left opaque.** The two workbooks that matter most to this module are multi-tab and are listed tab by tab: `NuHoldingsLtdNYSENUEstimatesReport.xls` (6 tabs — Consensus 397×30, Recent Changes 265×10, Multiples 26×5, Surprise 200×20, Trends 238×21, Revisions 357×17) and `Nu Holdings Ltd NYSE NU Financials.xls` (13 tabs, which duplicate the single-tab Financials exports).
- **Periods come from inside the documents, not from file dates.** Every file in this frozen pool carries the same sync timestamp, so the Last Modified column is deliberately not used as evidence of freshness (fix F23).
- **Extraction failures: none.** `manifest.json` reports `failures: 0`, `status` is `ok` for 113 sources and `in-place` for 2 plain-text files. No source is in `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer` state, so nothing has to be treated as absent for extraction reasons (fix F03).
- **Four small Portuguese PDFs are depositary notices, not filings.** `Form Interim Report (Aug-20-2026 / May-20-2026 / Nov-17-2025)` and `(Aug-19-2025)` are Banco Bradesco BDR notices of roughly 340–360 characters that link to the earnings release. They are pointers with no financial content — but note this is a *content* judgement, not an extraction failure: the extractor captured the whole document. The real Q2'26 and Q1'26 disclosures are present separately and in full.
- **Two files in the pool are not NU evidence at all**: the personal Interactive Brokers tax workbooks / account statement (the user's own tax records) and one unrelated `.torrent` file. They are listed for completeness and carry no earnings weight.
- **One prior in-house memo is verdict-bearing.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` contains a probability-weighted target price, an expected return, and a trade score. Downstream agents must strip that verdict (CLAUDE.md §24) and may use it only as a user-note-tier pointer to underlying evidence — never as a source for a number, and never as a substitute for the filing.

**No external data.** No `external/` subfolder exists in the frozen pool and no manifest row carries `external: true` or a `provenance` block, so there is no `## 1A. External Data` section and no external document moved the verdict.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | `Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` (Portuguese audited statements twin: `Form_Annual_Report(Feb-26-2026).pdf`) | FY ended Dec-31-2025 | 8.2 since period end (filed 5.0 months ago) |
| Quarterly filing | `Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` | Three and six months ended Jun-30-2026 | 2.2 |
| Earnings transcript | `Nu Holdings Ltd., Q2 2026 Earnings Call, Aug 13, 2026.pdf` — **verbatim** (19 consecutive calls, Q4'21 → Q2'26, plus a Shareholder/Analyst call of Aug-06-2026) | Quarter ended Jun-30-2026 | 0.8 |
| Investor deck | `Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf` — Q2'26 Earnings Presentation | Quarter ended Jun-30-2026 | 0.8 |
| Consensus / estimate export | `NuHoldingsLtdNYSENUEstimatesReport.xls` (6 tabs) | Actuals FQ4'21–FQ2'26; estimates FY2026E–FY2028E and FQ3'26E; revisions dated to Aug-26-2026 | 0.3 |
| Cash flow data | `Nu Holdings Ltd NYSE NU Financials Cash Flow.xls` → tab **Cash Flow**, plus the statements of cash flows inside the Q2'26 and Q1'26 interim filings and the FY2025 20-F | FY2021–FY2025 annual and LTM 12m to Jun-30-2026 | 2.2 |
| Guidance data | No formal quantitative guidance document exists in this pool. The word "guidance" appears zero times in the Q2'26 transcript; the Q2'26 presentation carries qualitative outlook language only | Qualitative outlook as of Aug-13-2026 | 0.8 |

Freshness check: the latest reported quarter is Q2 2026 (period ended Jun-30-2026, released Aug-13-2026). The consensus export's revision rows are dated Aug-26-2026 and its multiples run to a 2026-08-28 close — that is **after** the print, so consensus is post-quarter and **not stale**. The stale-consensus haircut does not apply. Next scheduled event: `Earnings Release Date Nov-12-2026` (`Capital IQ Events Calendar export, timeframe 2026`).

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | `FY2025 20-F (filed Apr-08-2026)`; `Q2'26 interim statements of income, six months ended Jun-30-2026`; `Capital IQ Financials→Income Statement, FY2021–LTM Jun-30-2026` | Needed for revenue, margin, EPS |
| Balance sheet | Y | `Q2'26 interim statements of financial position, Jun-30-2026`; `Capital IQ Financials→Balance Sheet` | Needed for working capital and leverage |
| Cash flow statement | Y | `Q2'26 interim statements of cash flows, six months ended Jun-30-2026`; `Capital IQ Financials→Cash Flow, LTM to Jun-30-2026` | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | `Q2'26 interim financial statements (Aug-14-2026)` + `Q2'26 Earnings Presentation (Aug-13-2026)` + `Q2 2026 earnings-call transcript (Aug-13-2026)` | Needed for trend and setup |
| Last 8 quarters | Y | Quarterly actuals FQ4'21–FQ2'26 in `Capital IQ Estimates→Surprise`; per-quarter primary documents: interim statements (Q1'26, Q2'26), earnings releases/presentations (Q3'25, Q4'25, Q1'26, Q2'26) and 19 consecutive transcripts Q4'21–Q2'26 | Needed for seasonality and inflection |
| Consensus estimates | Y | `Capital IQ Estimates→Consensus` (FY2026E–FY2028E, FQ3'26E, target price mean USD 18.78 / median USD 19.00 per `ciq_facts.json` `consensus_view`, status `present`) | Needed for the market bar |
| Estimate revisions | Y | `Capital IQ Estimates→Revisions` (357×17) and `→Recent Changes` (broker changes through Aug-26-2026); `ciq_facts.json` `eps_revisions` = "EPS (GAAP) FY2026: 8↑/0↓ last month" | Needed for revision momentum |
| Earnings transcript | Y — **verbatim**, not a proxy | `Nu Holdings Ltd., Q2 2026 Earnings Call, Aug 13, 2026` (S&P Global), plus 18 earlier calls and the Aug-06-2026 Shareholder/Analyst call | Needed for management tone and driver detail |
| Segment P&L | Y, at the level the company discloses | `Capital IQ Financials→Segments, FY2020–FY2025`: one reportable segment, "Banking", 6,991m = 100% of FY2025 revenue (`ciq_facts.json` `segments_revenue`, status `present`); geographic split Brazil 91% / Mexico 7% / Other 2% | Needed for mix shift |
| Current price | Y | `Capital IQ Financials→Key Stats — Share Price USD 14.88` (export as of Aug-28/29-2026); `Capital IQ Financials→Multiples, quarter column 2026-08-28`; `ciq_facts.json` `pe_ltm_current_x` = 19.5× | Needed only for master-level stock-reaction context |

Two reconciliation items the specialists must carry, neither of which changes the verdict:

1. **Price basis.** The CIQ Key Stats export shows USD 14.88 while the in-house memo of Aug-30-2026 cites a USD 14.30 close for Aug-28-2026. Two different reads of the same date sit in one pool. Use the CIQ export (tier 5, dated) and state the basis; do not silently mix them.
2. **Cash-flow sign.** `ciq_facts.json` `ltm_ocf_m` = **−10,304.8m USD** (`Capital IQ Financials→Cash Flow 'Cash from Ops.', LTM 12 months Jun-30-2026`, status `present`). That is the authoritative READ of that workbook and must be reconciled, not overridden. For a lender that funds a growing loan book, negative reported operating cash flow is a presentation feature, not automatically an earnings-quality failure — `06_earnings-quality` must handle it explicitly rather than treat it as a cash-conversion breakdown by default. `ltm_ebitda_m`, `levered_fcf_m`, `interest_coverage_x` and `ev_ebitda_current_x` are `unknown` in the sidecar (no EBITDA row in a bank template) — do not manufacture them.

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — `analyses/NU_2026-09-06/business-model/03_segment-map.md` |
| 06_value-chain.md | Y — `analyses/NU_2026-09-06/business-model/06_value-chain.md` |
| 10_external-dependency.md | Y — `analyses/NU_2026-09-06/business-model/10_external-dependency.md` |

The whole business-model module has completed (00 through 12 plus `99_business-model-synthesis.md`). `02_revenue-drivers` and `03_margin-drivers` must read `03_segment-map.md` before decomposing, and must reconcile their cycle-position read against `10_external-dependency.md` per the Cycle-Position Rule; where they differ, flag it rather than average it.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — Consensus, Surprise, Trends, Revisions and Recent Changes tabs all present, revisions dated Aug-26-2026 (after the Q2'26 print) | 04, 05, 99 | None. Neither the no-consensus max-30 cap nor a staleness haircut applies |
| No quarterly data | N — Q1'26 and Q2'26 interim statements, quarterly releases/decks back to Q3'25, and quarterly actuals FQ4'21–FQ2'26 | 01, 02, 03, 06 | None |
| No VERBATIM transcript, sell-side proxy present | N — 19 verbatim transcripts are in the pool; no sell-side proxy is needed | 02, 03, 04 | None (this row's cap does not bind) |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | None; the clarity ≤70 no-call cap does not bind |
| No segment-level P&L | N — the company reports a single "Banking" segment (100% of FY2025 revenue), disclosed with a geographic split. Single-segment disclosure is a real disclosure, not a gap; the multi-segment clarity ≤70 cap is not triggered | 02, 03, 99 | None. `02` and `03` must state the single-segment fact and work at consolidated level with the geographic cut, per the Segment-Level Rule |
| No cash flow statement | N — present in the 20-F, both interim filings, and the CIQ Cash Flow tab | 06, 99 | None; the earnings-quality max-45 cap does not bind |
| No current price | N — USD 14.88 (`Capital IQ Key Stats`, as of Aug-28/29-2026) | 99 | None |

Limitations that are NOT caps but must be stated by the owning agent:

- **No formal numeric guidance.** The company issues no quantitative guidance in this pool ("guidance" appears zero times in the Q2'26 transcript). `04_guidance-consensus` must build the outlook from qualitative management commentary in the Q2'26 call and presentation and say plainly that there is no company guidance number to test against consensus. This is a disclosure fact, not a missing document, so it triggers no cap.
- **CIQ financial tabs are annual (`Period Type: Annual`).** Quarterly figures must come from the interim filings, releases and presentations, with the Estimates Surprise/Trends tabs used only as a cross-check labelled "Capital IQ, data as of Aug-2026".
- **One quarter's disclosure is Portuguese-only in this pool** (Q3'25 presentation). Read and translate it; do not record it as missing (CLAUDE.md §27).

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool holds five consecutive audited annual filings (Form 20-F FY2021–FY2025, IFRS, USD), the latest quarterly filing (unaudited interim condensed consolidated statements for the three and six months ended Jun-30-2026), full income statement, balance sheet and cash flow statement at both annual and interim level, 19 consecutive verbatim earnings-call transcripts through Q2 2026, and a post-quarter consensus export with revision history — which satisfies every element of the Sufficient rule with no element resting on a proxy.
- **Active partial-data caps:** None. No cap from `MODULE_RULES.md` binds on data availability.
- **Critical missing items:** None. Two items to handle explicitly rather than as gaps: the company publishes no quantitative guidance (qualitative outlook only), and reported LTM operating cash flow is negative at −10,304.8m USD (`Capital IQ Financials→Cash Flow, LTM to Jun-30-2026`), which `06_earnings-quality` must interpret against a lending balance sheet rather than score mechanically.



---

## earnings / 01_historical-financials.md

_Source: `01_historical-financials.md`_

# Historical Financials — NU

**Reporting basis.** Nu Holdings Ltd. (NYSE:NU) reports under **IFRS Accounting Standards**, in **US dollars**, with a fiscal year ending **31 December**. It is a US-listed foreign private issuer, so the audited annual filing is a **Form 20-F** and the quarterly disclosure is an **unaudited interim condensed consolidated financial statement** furnished to the SEC — there is no 10-K or 10-Q, and their absence is not a data gap (CLAUDE.md §27). All figures below are **US$ millions unless stated**, and all are **reported (IFRS)** unless a cell says otherwise. Where a figure comes from a Capital IQ export rather than a filing it is labelled "CIQ" with its data-as-of date.

**One structural point that governs this whole report.** NU is a **bank/lender**, and it files a bank-style income statement: Total revenue → cost of financial and transactional services (funding cost, transactional expenses, expected credit loss) → **Gross profit** → operating expenses → **Income before income taxes**. There is no EBITDA line, no operating-vs-financing cost split of the kind an industrial has, and the balance sheet is unclassified (no current/non-current split). So three rows of the standard template — **EBITDA, EBITDA margin, and working capital** — do not exist in this company's disclosure and are marked N/A with the reason, not estimated. The `ciq_facts.json` sidecar agrees: `ltm_ebitda_m` is `unknown` ("Income Statement sheet has no 'EBITDA' row") and `net_debt_ebitda_x` is `unknown`. Nothing here is manufactured to fill the template.

**Prior in-house memo.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is in the pool and is verdict-bearing. Its verdict is stripped (CLAUDE.md §24) and **no number in this report comes from it**.

---

## 1. Annual Financial Table (FY2021–FY2025)

**Currency: US$ millions, IFRS, fiscal year ended 31 December.** "Reported", not adjusted. Percentages are computed, not quoted; margin changes are in basis points (bps — one hundredth of a percentage point).

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue (Total revenue) [1][3] | 1,698.0 | 4,792.2 | 8,029.0 | 11,517.0 | 15,774.8 | Decelerating |
| Revenue YoY % | n/a | +182.2% | +67.5% | +43.4% | +37.0% | Decelerating |
| Gross Profit [1][3] | 732.9 | 1,663.0 | 3,491.0 | 5,252.8 | 6,625.0 | Decelerating |
| Gross Margin % | 43.16% | 34.70% | 43.48% | 45.61% | 42.00% | Volatile |
| Gross Margin change (bps) | n/a | −846 | +878 | +213 | −361 | Volatile |
| EBITDA | N/A | N/A | N/A | N/A | N/A | N/A — not disclosed; a bank income statement has no EBITDA line [13] |
| EBITDA Margin % | N/A | N/A | N/A | N/A | N/A | N/A — same reason |
| EBIT-equivalent: Income before income taxes (EBT) [1][3] | (170.2) | (308.9) | 1,539.2 | 2,795.1 | 3,868.4 | Inflecting |
| EBT Margin % | −10.02% | −6.45% | 19.17% | 24.27% | 24.52% | Inflecting |
| EBT Margin change (bps) | n/a | +358 | +2,562 | +510 | +25 | Inflecting |
| Net income to parent shareholders [1][3] | (165.0) | (364.6) | 1,030.6 | 1,972.1 | 2,868.9 | Inflecting |
| Net margin % | −9.72% | −7.61% | 12.84% | 17.12% | 18.19% | Inflecting |
| EPS (diluted, US$) [1][3] | (0.10) | (0.08) | 0.2121 | 0.4034 | 0.5846 | Inflecting |
| EPS YoY % | n/a | n.m. (loss both years) | n.m. (loss to profit) | +90.2% | +44.9% | Decelerating |
| CFO (company-reported, IFRS) [2][3] | (2,924.3) | 755.6 | 1,266.2 | 2,399.1 | 3,500.5 | Inflecting |
| Capex (PP&E + intangibles, absolute value) [2][11] | 28.5 (CIQ) | 114.3 (CIQ) | 177.0 | 175.0 | 340.8 | Accelerating |
| FCF (CFO − capex) | (2,952.8) | 641.3 | 1,089.2 | 2,224.1 | 3,159.7 | Inflecting |
| Working Capital | N/A | N/A | N/A | N/A | N/A | N/A — the IFRS statement of financial position is unclassified (no current/non-current split), so working capital is not a defined quantity for this issuer [5] |
| Net debt (negative = net cash), strict basis [3][4][5][10] | (2,438.4) † | (3,389.5) | (4,576.6) | (7,146.7) | (9,821.6) | Inflecting ‡ |
| Net Debt / EBITDA | N/A | N/A | N/A | N/A | N/A | N/A — company is in net cash and EBITDA is not disclosed [13] |

**Trend-column note.** The Trend word describes the *direction of change*, not the level. Revenue **levels** rose every single year; the **growth rate** fell every year (+182.2% → +37.0%), which is why the row reads Decelerating. The quarterly picture disagrees with the annual one and is adjudicated by name in §6.

**Capex definition and sign.** Capex = acquisition of property, plant and equipment + acquisition and development of intangible assets, taken as a **positive (absolute) number** for the FCF subtraction. FY2025 = 7.2 (PP&E) + 333.6 (intangibles) = 340.8; FY2024 = 5.4 + 169.6 = 175.0; FY2023 = 20.2 + 156.8 = 177.0 [2]. FY2021 and FY2022 use the Capital IQ cash-flow export (6.0 + 22.5; 20.0 + 94.3) because those two years' filed statements did not extract cleanly from this pool — labelled CIQ in the cell [11].

**FCF definition (CLAUDE.md §15).** FCF = CFO − total capex. Worked: FY2025 3,500.5 − 340.8 = **3,159.7**. The company does not publish its own FCF definition, so the doctrine default is used. For a lender this number is not the "cash the business can hand shareholders" — most of the cash movement in the operating line is the loan book and the deposit book growing, not operating surplus. Read it as an arithmetic disclosure, not a distribution capacity.

**Net debt — basis, composition, and the honest caveat (CLAUDE.md §15, WORKFLOW step 7).** For FY2022–FY2025 the figure is built **from the filings' own statement of financial position**: total debt = *Borrowings and financing* + *Repurchase agreements*; cash = *Cash and cash equivalents*. This composition is **confirmed to exclude lease liabilities**, which the company reports as a separate line (US$29.2m at Dec-31-2025, US$66.4m at Jun-30-2026 [5]), and it deliberately excludes **customer deposits** and **payables to network**, which are the funding of the banking business rather than corporate debt — that exclusion is stated so a reader can undo it. On that confirmed-composition basis the label is **strict** unqualified. Worked, FY2025: (4,398.2 + 783.8) − 15,003.6 = **−9,821.6**, i.e. net cash of US$9,821.6m.
- † **FY2021 is the exception and carries the caveat.** The FY2021 borrowings/repo split did not extract from this pool's FY2021/FY2022 20-F, so FY2021 uses the Capital IQ *Total Debt* aggregate (267.3) against the filing's cash (2,705.7): **strict basis (vendor total-debt figure; composition unconfirmed against the filing debt note)**. That vendor aggregate is known to fold in lease and derivative liabilities in later years (see below), so treat FY2021 as indicative only.
- ‡ Net cash built every year to FY2025 and then **partly reversed** in H1 2026 to −7,811.0 (§2), which is why the trend word is Inflecting rather than Accelerating.

**Reconciliation to the `ciq_facts.json` sidecar (required, not overridden).** The sidecar reports `net_debt_m` = **−9,274.2** and `total_debt_m` = **5,896.7** at Jun-30-2026 [13]. My filing-built strict figure for the same date is **−7,811.0** — a gap of 1,463.2. The gap is explained, not disputed, and it runs in two places: (a) the vendor's **total debt** of 5,896.7 is *not* the filing's borrowings line — it decomposes exactly as borrowings 4,682.3 + repurchase agreements 1,058.3 + derivative liabilities 89.7 + lease liabilities 66.4 = 5,896.7 [5][10], so it includes leases and derivatives; and (b) the vendor's net-debt row nets liquidity of 15,170.9 (= 5,896.7 + 9,274.2), which is **more** than the filing's cash and cash equivalents of 13,551.6 — i.e. the sidecar figure sits on a **broad** basis, not a strict one. Both figures say the same thing directionally (large net cash); the difference is definitional. **This module's net debt is a supporting line for the trend and TTM tables, not this module's specialty — the `balance-sheet-survival` module builds the canonical, filing-verified net-debt figure from the debt note, and the two are not guaranteed to match.**

---

## 2. TTM Snapshot

**TTM = the four latest reported quarters: Q3 2025 + Q4 2025 + Q1 2026 + Q2 2026.** Prior TTM = Q3 2024 + Q4 2024 + Q1 2025 + Q2 2025. Every TTM figure below is summed from actual reported quarters — none is estimated or annualised.

| Metric | Latest TTM (to Jun-30-2026) | Prior TTM (to Jun-30-2025) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 19,340.0 | 12,848.6 | +50.5% | Q2'26 and Q1'26 interim statements [5][6]; Q3'25/Q4'25 quarters from CIQ Estimates→Surprise actuals, data as of Aug-2026 [9] |
| EBITDA | Not disclosed | Not disclosed | — | `ciq_facts.json` `ltm_ebitda_m` = unknown — no EBITDA row in a bank template [13] |
| EBIT-equivalent (income before income taxes) | 4,384.6 | 3,165.7 | +38.5% | Sum of quarters [5][6][9]; ties exactly to CIQ LTM "EBT Incl. Unusual Items" 4,384.603 [12] |
| Gross profit (IFRS) | 7,969.0 | Not derivable | n/a | FY2025 6,625.0 − H1'25 2,867.4 + Q1'26 1,864.9 + Q2'26 2,346.5 [1][5][6]. Prior TTM needs H1 2024 statements, which are not in this pool |
| Gross margin % | 41.20% | Not derivable | n/a | 7,969.0 ÷ 19,340.0 |
| EPS diluted (US$) | 0.7348 | 0.4700 | +56.3% | Sum of quarterly diluted EPS [5][6][9]; ties to CIQ LTM diluted EPS excl. extra items 0.734069 [12] |
| Net income to parent | 3,607.1 | 2,300.1 | +56.8% | [5][6][9]; ties to CIQ LTM net income 3,607.106 [12] |
| CFO (company-reported, IFRS) | **(1,381.6)** | Not derivable | n/a | FY2025 3,500.5 − H1'25 3,640.0 + H1'26 (1,242.0) [2][5]. Prior TTM needs H1 2024, absent from this pool |
| Capex | 288.4 | Not derivable | n/a | FY2025 340.8 − H1'25 152.9 + H1'26 100.5 [2][5] |
| FCF (CFO − capex) | **(1,669.9)** | Not derivable | n/a | −1,381.6 − 288.4 |
| Net debt at latest period-end (Jun-30-2026) | **(7,811.0)** = net cash 7,811.0 | (n/a — point in time) | — | (Borrowings and financing 4,682.3 + repurchase agreements 1,058.3) − cash and cash equivalents 13,551.6 [5]. **Strict basis**, composition confirmed against the filing's own statement of financial position and Note 24 — excludes lease liabilities (66.4), customer deposits and payables to network |

*Note: net debt is a point-in-time balance sheet metric, not a TTM flow metric.*

**The cash-flow reconciliation the triage flagged, resolved.** The sidecar reports `ltm_ocf_m` = **−10,304.8** [13], which is the Capital IQ read and is correct **on the vendor's own basis**. It is not the company's reported number and the two reconcile exactly: **CIQ CFO = company CFO − net increase in customer deposits**, because Capital IQ moves the deposit inflow out of operating and into financing. Worked, FY2025: 3,500.5 − 12,861.3 = −9,360.8, which is precisely the CIQ FY2025 figure [11]. Worked, LTM to Jun-30-2026: −10,304.8 + 8,923.2 = −1,381.6, which is precisely the company-basis TTM CFO above. Both reads are internally consistent; I use the **filing's** figure per §4/§5 and show the vendor's alongside. What is *not* a definitional artefact: on the company's own basis, operating cash flow went from **+3,640.0m in H1 2025 to −1,242.0m in H1 2026** [5], turning the TTM company-basis figure negative. That is a real swing in the reported line, driven by credit-card receivables (−8,135.7m in H1'26) and loans to customers (−6,604.2m) growing faster than deposits (+3,408.7m, versus +7,346.8m in H1'25) [5]. Whether that is a quality problem or normal balance-sheet growth for a lender is `06_earnings-quality`'s call, not mine — I record the number and its build.

---

## 3. Latest Quarterly Trend Table (8 quarters)

**US$ millions, IFRS, reported.** Quarters Q1'25, Q2'25, Q1'26 and Q2'26 are taken **directly from the interim filings** [5][6]. Q3'24, Q4'24, Q3'25 and Q4'25 come from the **Capital IQ Estimates→Surprise actuals export (data as of Aug-2026)** [9], because this pool contains no interim filing for those quarters. That vendor series is verified against the filings wherever both exist — e.g. Q2'26 revenue 5,513.208 and diluted EPS 0.2162 match the Aug-14-2026 interim statements to the last digit — so it is a like-for-like extension of the same IFRS series, not a different basis. These are actual quarterly figures, never an annual number divided by four.

| Metric | Q3'24 | Q4'24 | Q1'25 | Q2'25 | Q3'25 | Q4'25 | Q1'26 | Q2'26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue (Total revenue) | 2,943.2 | 2,989.3 | 3,247.7 | 3,668.5 | 4,173.0 | 4,685.9 | 4,968.0 | 5,513.2 | Up every quarter; QoQ +3.3, +1.6, +8.6, +13.0, +13.8, +12.3, +6.0, +11.0% | Accelerating: +37.7, +24.3, +18.7, +28.8, +41.8, +56.8, +53.0, **+50.3%** |
| Gross Profit (IFRS) | n/d | n/d | 1,319.5 | 1,548.0 | n/d | n/d | 1,864.9 | 2,346.5 | Not computable for four quarters (no Q3/Q4 interim filing in this pool) | Q1: +41.3%; Q2: +51.6% |
| Gross Margin % (IFRS) | n/d | n/d | 40.63% | 42.20% | n/d | n/d | 37.54% | 42.56% | Volatile | Q1'26 −309bps YoY; Q2'26 **+36bps** YoY |
| Gross Profit (company-defined, deck basis) | 1,301.7 | 1,317.0 | 1,327.5 | 1,519.3 | 1,811.2 | 1,961.1 | 1,878 | 2,441 | Rising, with a QoQ dip in Q1'26 (−7% FX-neutral) | +43% YoY FX-neutral in Q2'26 |
| EBITDA | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A — not disclosed | N/A |
| EBIT-equivalent (income before income taxes) | 723.8 | 767.5 | 795.1 | 879.4 | 1,116.3 | 1,077.7 | 954.3 | 1,236.3 | Volatile — fell in Q4'25 and again in Q1'26 before recovering | Q2'26 +40.6% |
| Net income to parent | 553.4 | 552.6 | 557.2 | 636.8 | 782.5 | 892.4 | 872.1 | 1,060.2 | Rising, with a QoQ dip in Q1'26 | +82.6, +53.1, +47.1, +30.7, +41.4, +61.5, +56.5, **+66.5%** |
| Net margin % (substitute for EBITDA margin) | 18.80% | 18.49% | 17.16% | 17.36% | 18.75% | 19.04% | 17.55% | 19.23% | Stable in a 17.2–19.2% band | Q2'26 +187bps YoY |
| EPS (diluted, US$) | 0.1132 | 0.1129 | 0.1139 | 0.1300 | 0.1595 | 0.1815 | 0.1776 | 0.2162 | QoQ −0.3, +0.9, +14.1, +22.7, +13.8, −2.1, +21.7% | +81.4, +52.6, +47.0, +30.3, +40.9, +60.8, +55.9, **+66.3%** |

**Two labelling points that matter.**
1. **"n/d" is not "missing data"** — it means the quarter's IFRS gross profit is not separately disclosed in this pool, because NU files interim statements only for the quarters present here (Q1'26, Q2'26 and their prior-year comparatives). I do not interpolate it. Where the company's own **deck-defined** gross profit exists for all eight quarters I show it as a separate, clearly-labelled row [7][8] rather than mixing two definitions inside one row. The two definitions do **not** tie: Q2'26 deck 2,441 versus IFRS 2,346.5 (gap 94.5); Q2'25 deck 1,519.3 versus IFRS 1,548.0 (gap −28.7). The gap is not stable, so the deck series must never be substituted into the IFRS row.
2. **A large slice of the headline USD growth is currency, not volume.** NU reports in USD but earns mostly Brazilian reais. The company's own FX-neutral figures put Q2'26 gross revenue growth at **+39% YoY** and gross profit at **+43% YoY**, against my computed **+50.3%** YoY in reported USD revenue — the average USD/BRL rate moved from R$5.6625 in Q2'25 to R$5.0496 in Q2'26, a roughly 12% real appreciation [7]. Anyone reading the acceleration in the table above as pure business acceleration is reading a currency move as an operating one.

---

## 4. Reported vs Adjusted Metrics

The company **does** disclose one adjusted measure — **Adjusted Net Income** — and reconciles it in the 20-F [14]. It discloses no adjusted EBITDA, no adjusted EBIT, and no adjusted EPS.

| Metric | Reported Value (FY2025) | Adjusted Value (FY2025) | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA | Not disclosed | Not disclosed | — | No EBITDA line exists in a bank income statement; the sidecar records `ltm_ebitda_m` as unknown for the same reason | [13] |
| EBIT (proxied by income before income taxes) | 3,868.4 | Not disclosed | — | Company publishes no adjusted EBIT / adjusted pre-tax profit | [1] |
| EPS (diluted, US$) | 0.5846 | 0.6261 — **derived, not disclosed** | +0.0415 | Derived by me as Adjusted Net Income 3,072.6 ÷ weighted-average diluted shares 4,907.352m. The company does not publish an adjusted EPS. *Inference, not from filings — the inputs are filed, the ratio is mine.* | [1][12][14] |
| Net income to parent | 2,868.9 | 3,072.6 | +203.7 | Share-based compensation +359.0; allocated tax effects on share-based compensation −125.8; hedge of the tax effects on share-based compensation −29.5. Arithmetic: 2,868.9 + 359.0 − 125.8 − 29.5 = 3,072.6 | [14] |
| Net income to parent (FY2024 / FY2023 comparatives) | 1,972.1 / 1,030.6 | 2,207.5 / 1,196.5 | +235.4 / +165.9 | Same three items | [14] |

**Two cautions.** First, the adjustment is essentially **adding back stock compensation**, a real and recurring cost paid in shares — the reported IFRS figure is the conservative one and is what §1–§3 use throughout. Second, Capital IQ publishes its **own** "Normalized Diluted EPS" of 0.4922 for FY2025 [12], which is *lower* than reported EPS and is a vendor construct built on a different set of adjustments than the company's. It is not the company's adjusted number and the two must never be quoted as if they were the same thing.

---

## 5. Quarterly Seasonality Table (FY2023, FY2024, FY2025 — the last three complete fiscal years)

FY2026 has only two reported quarters, so the three complete years used are FY2023–FY2025. **EBITDA margin is not disclosed, so the margin columns use net margin (net income to parent ÷ total revenue)** — the substitution is labelled in the header, not hidden.

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 Net Margin | FY2024 Net Margin | FY2025 Net Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 20.2% | 23.8% | 20.6% | 21.5% | 8.8% | 13.8% | 17.2% |
| Q2 | 23.3% | 24.7% | 23.3% | 23.8% | 12.0% | 17.1% | 17.4% |
| Q3 | 26.6% | 25.6% | 26.5% | 26.2% | 14.2% | 18.8% | 18.8% |
| Q4 | 30.0% | 26.0% | 29.7% | 28.5% | 15.0% | 18.5% | 19.0% |
| Total | 100.0% | 100.0% | 100.0% | 100.0% | | | |

**Flag test (>30% or <20% consistently): no quarter trips it.** Q4 is the largest quarter in all three years (30.0%, 26.0%, 29.7%) and averages 28.5%, but it clears 30% only once, so it does not meet the "consistently >30%" bar. Q1 is the smallest in two of three years and averages 21.5%, but never falls below 20%.

**The more important reading: this pattern is compounding, not seasonality.** A business whose revenue grows roughly 3–13% *every quarter* will mechanically put more of the year's revenue in Q4 than in Q1 even with perfectly flat seasonal demand. The rising within-year share is therefore mostly an arithmetic consequence of growth. The one genuine tell is FY2024, where the spread compressed sharply (23.8% → 26.0%, a range of just 2.2 points versus 9.8 points in FY2023 and 9.1 in FY2025) — that was the year sequential growth slowed to +1.6% and +3.3% in Q4'24 and Q3'24. Seasonality, as a standalone effect, is **not proven from available data**; what the table actually measures is the sequential growth rate.

---

## 6. Key Trend Summary

**Revenue growth: the annual and quarterly series disagree, and both are true.** On an annual basis revenue growth **decelerated** every year — +182.2% (FY2022), +67.5%, +43.4%, +37.0% (FY2025) — while the *level* rose from 1,698.0 to 15,774.8. On a quarterly basis growth **inflected upward**: YoY revenue growth bottomed at +18.7% in Q1'25 and has run +28.8%, +41.8%, +56.8%, +53.0%, +50.3% since. I name the contradiction rather than average it: the annual row is dominated by the enormous early-stage base effect, the quarterly row by the recent re-acceleration — and a material part of that re-acceleration is the Brazilian real, since the company's own FX-neutral figure for Q2'26 gross revenue is **+39%** against my computed **+50.3%** in USD [7]. Direction: **decelerating on the multi-year annual view, inflecting positive on the last six quarters, with roughly a fifth of the recent USD acceleration attributable to currency.**

**Margins: expanding at the bottom line, compressing at the top.** Net margin rose from −9.72% (FY2021) to 18.19% (FY2025), and TTM net margin is 18.65% versus 17.90% a year earlier (+75bps). EBT margin went from −10.02% to 24.52%. But I must adjudicate the series that points the other way, by name (CLAUDE.md §3): **gross margin fell 361bps in FY2025** (45.61% → 42.00%), **Q1'26 gross margin fell 309bps year on year** (40.63% → 37.54%), and **TTM gross margin of 41.20% sits below the FY2024 full-year 45.61%**. The compression is real and sits in the cost of financial and transactional services — expected credit loss grew from 3,169.0 (FY2024) to 4,204.9 (FY2025) [1], faster than revenue. It has not yet overturned the bottom-line expansion because operating costs grew slower than revenue (Q2'26 gross margin was back up +36bps YoY at 42.56%), but a reader told only "margins are expanding" would be reading one metric and ignoring three. Direction: **net margin expanding; gross margin compressing; the two have not yet met.**

**Seasonality: not material as a standalone effect.** Q4 is the biggest quarter (28.5% of revenue on a three-year average) and Q1 the smallest (21.5%), but no quarter consistently breaches the 30%/20% flags, and the within-year gradient is explained by compounding sequential growth rather than by a demand season. Do not build a Q4-uplift assumption off this table.

**Inflection points, with what happened.** Three are visible. (i) **FY2023 — loss to profit**: EBT swung from −308.9 to +1,539.2 and net income from −364.6 to +1,030.6, with gross margin recovering 878bps to 43.48% after the FY2022 trough (34.70%, itself depressed by credit loss expense rising 192% and a US$355.6m contingent-share-award termination charge in G&A [3]). (ii) **Q1'25 — a growth trough at +18.7% YoY revenue**, followed by six quarters of re-acceleration to +50.3%. (iii) **H1 2026 — the reported operating cash line turned negative**: company-basis CFO went from +3,640.0m (H1'25) to −1,242.0m (H1'26), making TTM CFO −1,381.6m even as TTM net income hit a record 3,607.1m [2][5]. Receivables and loans grew faster than deposits in the half. That gap between accounting profit and reported operating cash is the single most important thing in these tables for the modules downstream, and interpreting it belongs to `06_earnings-quality`.

**Balance sheet, one line.** NU is in net cash on a strict, filing-confirmed basis at every year-end from FY2022 (−3,389.5) to FY2025 (−9,821.6), and at −7,811.0 on Jun-30-2026. The H1'26 reduction is partly a US$500.4m share repurchase, the first in the company's history in this data [5].

---

## 7. Citations

All documents live in the frozen extract generation and are cited logically as `data/NU/`.

[1] FY2025 Form 20-F (filed Apr-08-2026), Item 5 Operating and Financial Review and Consolidated Statements of Income — total revenue, gross profit, income before income taxes, net income and per-share data for FY2025 / FY2024 / FY2023.
[2] FY2025 Form 20-F (filed Apr-08-2026), Item 5 Liquidity and Capital Resources and Consolidated Statements of Cash Flows — cash flows generated from operating activities (FY2025 3,500.5 / FY2024 2,399.1 / FY2023 1,266.2); acquisition of property, plant and equipment and acquisition and development of intangible assets.
[3] FY2022 Form 20-F (filed Apr-20-2023), Consolidated Statements of Income, Consolidated Statements of Cash Flows and Note on borrowings and financing — FY2022 / FY2021 revenue, gross profit, loss before income taxes, loss per share, operating cash flow, and the 2022 funding-by-maturity table (borrowings and financing 585,568; repurchase agreements 197,242).
[4] FY2024 Form 20-F (filed Apr-16-2025), Consolidated Statements of Financial Position as of Dec-31-2024 and Dec-31-2023 — borrowings and financing (1,730.4 / 1,136.3), repurchase agreements (308.6 / 210.5), cash and cash equivalents (9,185.7 / 5,923.4).
[5] Unaudited interim condensed consolidated financial statements for the three and six-month periods ended Jun-30-2026 (filed Aug-14-2026) — Statements of Income, Statements of Financial Position (Note 24 Borrowings and financing; Note 11 Cash and cash equivalents; Note 22 Deposits), and Statements of Cash Flows.
[6] Unaudited interim condensed consolidated financial statements for the three-month period ended Mar-31-2026 (filed May-14-2026) — Statements of Income for Q1 2026 and Q1 2025 comparatives.
[7] Q2 2026 Earnings Presentation, Aug-13-2026 — Gross Revenue and Gross Profit by quarter (Q1'25–Q2'26), Net Revenues / Opex / Efficiency Ratio, Net Income and ROE by quarter; FX-Neutral methodology note (R$5.6625 Q2'25 → R$5.0496 Q2'26).
[8] Q4 2025 Earnings Presentation, Feb-25-2026 — Gross Profit, Net Revenues / Opex / Efficiency Ratio, Net Income, ROE and Adjusted Net Income by quarter (Q3'24–Q4'25).
[9] Capital IQ Estimates → Surprise tab, quarterly and annual actuals FQ4 2021–FQ2 2026, data as of Aug-2026 — quarterly total revenue, EBT (GAAP), net income (GAAP) and diluted EPS actuals; used for Q3'24, Q4'24, Q3'25 and Q4'25, verified against the filings for every overlapping quarter.
[10] Capital IQ Financials → Balance Sheet (bank template, annual FY2021–FY2025 plus Jun-30-2026), data as of Aug-2026 — Total Debt component rows used only to decompose and caveat the vendor aggregate, and the FY2021 total-debt figure of 267.3.
[11] Capital IQ Financials → Cash Flow (bank template, FY2021–LTM Jun-30-2026), data as of Aug-2026 — FY2021/FY2022 capital expenditures and purchases of intangibles; net increase in deposit accounts used for the CFO reconciliation.
[12] Capital IQ Financials → Income Statement (bank template, FY2021–LTM Jun-30-2026), data as of Aug-2026 — LTM cross-checks (EBT 4,384.603; net income 3,607.106; diluted EPS excl. extra items 0.734069), weighted-average diluted shares 4,907.352m (FY2025), and the vendor's Normalized Diluted EPS of 0.4922.
[13] `ciq_facts.json` deterministic sidecar for this extract generation — `ltm_ebitda_m` unknown, `net_debt_ebitda_x` unknown, `ltm_ocf_m` −10,304.8, `net_debt_m` −9,274.2, `total_debt_m` 5,896.7.
[14] FY2025 Form 20-F (filed Apr-08-2026), Non-IFRS Financial Measures — Adjusted Net Income (Loss) reconciliation for FY2025 / FY2024 / FY2023 (3,072.6 / 2,207.5 / 1,196.5).

**Not used as a source for any number:** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` (verdict-bearing prior in-house memo, verdict stripped per CLAUDE.md §24).



---

## earnings / 02_revenue-drivers.md

_Source: `02_revenue-drivers.md`_

# Revenue Drivers — NU

**Reporting basis carried from upstream.** Nu Holdings Ltd. (NYSE: NU) is a US-listed **foreign private issuer** incorporated in the Cayman Islands, reporting under **IFRS Accounting Standards**, in **US dollars**, fiscal year ending **31 December**. The audited annual filing is a **Form 20-F**; the quarterly disclosure is an **unaudited interim condensed consolidated financial statement** — there is no 10-K or 10-Q and their absence is not a data gap (CLAUDE.md §27). All figures are US$ unless stated. Amounts taken from the interim filings are in **US$ thousands**; amounts taken from the earnings presentation are in **US$ millions** and are **company-defined, non-IFRS** where labelled.

**Two qualifiers that must travel with every growth number in this report (CLAUDE.md §3).**
1. Upstream `01_historical-financials` found revenue **decelerating on the multi-year annual view** (+182.2% FY2022 → +37.0% FY2025) while **inflecting positive over the last six quarters** (+18.7% YoY in Q1'25 → +50.3% in Q2'26), with **a material part of that recent USD acceleration attributable to Brazilian real appreciation**. Neither half of that finding may be quoted without the other, and no headline growth rate in this report is quoted without its currency component.
2. NU earns almost all of its money in Brazilian reais, Mexican pesos and Colombian pesos and reports in US dollars. **Constant-currency ("FX-neutral") and as-reported growth are kept separate throughout and are never blended.** Every cross-currency figure carries its rate and date (§15/§27).

**Prior in-house memo.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` sits in the pool and carries its own verdict. That verdict is stripped (CLAUDE.md §24) and **no number in this report comes from it.**

---

## 1. Segment Decomposition Status

**Single-segment business (>85% from one segment) — consolidated analysis, with the geographic cut the filing does disclose.**

The business-model module has run and `analyses/NU_2026-09-06/business-model/03_segment-map.md` is available. It records the company's own position, which my own read of the filing confirms: *"The CODM considers the whole Group as a single operating and reportable segment."* The CODM (Chief Operating Decision Maker — the executive whose reviews define what counts as a segment under IFRS 8) is the CEO, and what he reviews is the consolidated income statement. `[FY2025 Form 20-F (filed Apr-08-2026), Note 34 (Segment information), p.F-97]`, restated word-for-word at `[Q2'26 interim condensed consolidated financial statements (filed Aug-14-2026), Note 34, p.43]`. One segment, "Banking", 100% of revenue and 100% of profit. The >85% test is met at 100%.

**Segment-level profit is not disclosed at all** — no country margin, no product margin, no country net income. I do not construct it. Two disaggregations *are* disclosed and I use both, labelled as disaggregations rather than segments:
- **Geography** (Note 34(b)) — but on a **narrower revenue base** than IFRS total revenue. The Note-34 base for Q2'26 is **US$4,380,927k against IFRS total revenue of US$5,513,208k**, i.e. it covers **79.5%** of revenue. The missing **US$1,132,281k** is treasury income (interest on other assets at amortised cost 765,339 + fair-value instruments 363,558 + other fair-value 3,383 = 1,132,280; the 1k difference is rounding in the filing's own columns). `[Q2'26 interim statements, Note 6(a) and Note 34(b), pp.16, 43]` **So roughly a fifth of revenue is nowhere in the geographic split** — the same gap `03_segment-map.md` names.
- **Product / income type** (Note 6), on that same narrower base for the fee lines but with the full interest detail. I use Note 6 for the exact line-item decomposition in §6.

---

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| **Lender (the applicable row)** | Loan book × yield + fees |

**NU's company-specific revenue formula, in one line:**

> **Total revenue = (credit portfolio × blended credit yield) + (deposits and liquid assets × treasury/float yield) + (card purchase volume × interchange take rate) + late fees + other fees — all earned in BRL/MXN/COP and then translated into US dollars at each month's average rate.**

The company states the same thing in a simpler form and uses it as its headline framework: **Revenue = active customers × ARPAC** (ARPAC = average monthly revenue per active customer). `[Q2'26 Earnings Presentation, Aug-13-2026, "Our model powers our earnings-generating formula", slide 6]`

Both forms are used below. The first is the one that carries the yield, mix and funding detail; the second is the one management guides the market with.

**Where the money actually comes from, Q2'26 (US$ thousands, share of IFRS total revenue of 5,513,208):** `[Q2'26 interim statements, Note 6(a) and 6(b), p.16]`

| Line | Q2'26 | Share of revenue |
|---|---:|---:|
| Interest income — credit card | 1,805,581 | 32.75% |
| Interest income — loan | 1,734,365 | 31.46% |
| Interest income — other assets at amortised cost (treasury / float) | 765,339 | 13.88% |
| Interest and gains — financial instruments at fair value | 363,558 | 6.59% |
| Interest income — other receivables | 88,347 | 1.60% |
| Other income at fair value | 3,383 | 0.06% |
| Credit and prepaid card income (interchange — the fee a merchant's bank pays Nu on each card purchase) | 534,970 | 9.70% |
| Late fees | 136,801 | 2.48% |
| Other fee and commission income | 70,455 | 1.28% |
| Insurance commission | 10,409 | 0.19% |
| **Total revenue** | **5,513,208** | **100.00%** |

**Interest on cards and loans alone is 64.21% of revenue.** Interest income of every kind is 86.35%; fees are 13.65%. This is a consumer credit book first and a payments business second, and any read that treats it primarily as an app or a payments platform is looking at the smaller seventh of the revenue.

---

## 3. Market / Share / Price / Mix Split

Importance is scored /100, higher = more important to revenue (not inverted).

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| **End-market demand** (Brazilian consumer credit) | **Softening at the macro level, not yet visible in the book.** Brazil GDP growth 2.3% in 2025, down from 3.4% in 2024; unemployment improved to 5.1% from 6.2%. Management: *"we don't really see any significant or structural deterioration in our numbers"* — a statement about NU's own portfolio, not about the market | `FY2025 Form 20-F, Item 5, macroeconomic indicators table`; `Q2 2026 earnings-call transcript, Aug-13-2026, Q&A — David Vélez` | 55 |
| **Company market share** | **Improving, from a small base.** Management sizes the Brazil consumer + SME gross profit pool at ~US$100bn and puts NU's share at 7%: *"we have 7% market share of that profit pool. So we're still a small player in that big market"*. 139m customers, of which ~118m in Brazil; Mexico at 16.5% of the adult population. CFO: *"growth remained strong relative to the broader market"*. The 7% and US$100bn figures are management estimates, not filed numbers | `Q2 2026 earnings-call transcript, Aug-13-2026, prepared remarks and Q&A`; `Q2'26 Earnings Presentation, Aug-13-2026, slide 7 note 2 (gross profit pool US$100B)` | **85** |
| **Price / realization** | **Improving.** Net interest margin (NIM — interest earned minus funding cost, as a percentage of interest-earning assets) rose from 18.8% in Q2'25 to **22.9%** in Q2'26 (+410bps YoY; +180bps QoQ from 21.1%). My own derived blended yield on the total gross credit portfolio rose from ~34.55% to ~36.97% annualised (+242bps) — see the basis caveat in §6a. Funding got cheaper: cost of deposits fell from 91% to **88% of the interbank rate** | `Q2'26 Earnings Presentation, Aug-13-2026, slides 14 and 15`; `Q2 2026 transcript, prepared remarks` | **90** |
| **Product / customer / geography mix** | **Shifting toward higher-yield unsecured lending.** Unsecured lending grew **+45% YoY FX-neutral** to US$10.3bn versus credit cards +35% to US$26.0bn and secured +30% to US$3.1bn; unsecured share of the portfolio moved 25% → 26% and cards 67% → 66%. Geography mix is moving slowly: Mexico 6.7% of the Note-34 revenue base in FY2025 → **7.2% in H1'26**. CFO attributes NIM expansion partly to *"a mix weighted further towards unsecured lending"* | `Q2'26 Earnings Presentation, slide 13`; `Q2 2026 transcript, prepared remarks`; `FY2025 20-F, Note 34(b), p.F-97`; `Q2'26 interim statements, Note 34(b), p.43` | 70 |
| **FX translation** | **Large tailwind in the reported number, and it is not operating growth.** Average USD/BRL moved from **R$5.6625 (Q2'25) to R$5.0496 (Q2'26)** — the real appreciated **12.14%**. Spot at Jun-30-2026 was **R$5.1617**, i.e. **2.2% weaker than the quarter's own average**, so if spot holds, Q3'26 translates less favourably than Q2'26 did | `Q2'26 Earnings Presentation, Aug-13-2026, Non-IFRS Financial Measures — FX-Neutral methodology and FX rates, pp.34–35` | **88** |
| **M&A / divestitures** | **Zero contribution to Q2'26 revenue.** The only deal in the period is the **Banco Porto Real** share purchase agreement announced Jul-20-2026 — after quarter-end, still subject to Brazilian Central Bank approval, and explicitly a **banking-licence** acquisition to satisfy Joint Resolution No. 17 brand-name rules: *"does not impose additional capital or liquidity requirements"*. No revenue is attributed to it. Nubank N.A. (US) has conditional OCC approval from Jan-29-2026 and **is not yet operating** | `Q2'26 interim statements, Note 35 (Subsequent events), p.44`; `FY2025 Form 20-F, Note 35(a), p.F-98` | 5 |

**The separation this table exists to make, stated plainly:** none of NU's Q2'26 revenue growth is acquisition-driven, but a large slice of it is currency. Reported +50.3% YoY revenue growth is **not** +50.3% of demand. The organic, constant-currency figure is roughly +34% (arithmetic in §6a), and the company's own FX-neutral gross-revenue measure says +39%. Anyone quoting +50.3% as customer demand is reading a currency move as an operating one — the exact error upstream `01` flagged.

---

## 4. Revenue Driver Table (consolidated)

Magnitude test: **High** = a reasonable move in this driver moves total revenue by more than 5%; **Mid** = 2–5%; **Low** = under 2%. The magnitude column shows the arithmetic where it is not obvious.

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **Credit portfolio (loan book size)** | **US$39.4bn** at Jun-30-2026; +37% YoY FX-neutral, +5% QoQ FX-neutral. Cards US$26.0bn (+35%), unsecured US$10.3bn (+45%), secured US$3.1bn (+30%) | **Improving, but decelerating sequentially.** QoQ FX-neutral run: +8% (Q2'25), +9%, +11%, +7%, **+5%** (Q2'26). CFO: *"Sequential growth remained solid while normalizing after a period of exceptionally strong expansion"* | **High** — card + loan interest is 64.21% of revenue, so a 10% move in the book at constant yield ≈ 6.4% of revenue (≈US$354m per quarter at Q2'26 scale) | `Q2'26 Earnings Presentation, slide 13`; `Q2 2026 transcript, prepared remarks` |
| **Blended credit yield / NIM (the price of credit)** | NIM **22.9%** (Q2'25 18.8%); risk-adjusted NIM (NIM after credit losses) **12.4%**, up from 9.5% in Q1'26. Derived blended yield on total gross portfolio ~36.97% annualised vs ~34.55% a year earlier | **Improving.** Driven by the growth put on the books, unsecured mix, and deliberate risk expansions. Cost of deposits 88% of the interbank rate vs 91% a year earlier | **High** — same 64.21% base as above; a 10% relative yield move ≈ 6.4% of revenue | `Q2'26 Earnings Presentation, slides 14–16`; `Q2 2026 transcript, prepared remarks`; my derivation in §6a |
| **Customer count** | **139m** total (Brazil ~118m, Mexico 16m at end-July, Colombia >5m); +13.0% YoY from 123m. Net adds by year at Q2: 65 → 84 → 105 → 123 → 139m, i.e. **+19, +21, +18, +16m** | **Improving in level, decelerating in adds** | **High** — the first term in the company's own revenue formula; a 10% move ≈ 10% of revenue if ARPAC holds | `Q2 2026 transcript, prepared remarks`; `Q2'26 Earnings Presentation, slide 6` |
| **Activity rate** (share of customers who generated revenue in the last 30 days) | **83.5%**, up sequentially; Brazil above 86% for the first time | **Improving, slowly** — 83.0–83.5% band for several quarters | **Mid** — a 1-point move on 139m customers is ~1.4m active customers, ~1.2% of revenue; a 5-point move ~6% | `Q2 2026 transcript, prepared remarks`; `FY2025 Form 20-F, Key Business Metrics — Activity Rate` |
| **ARPAC** (average monthly revenue per active customer) | **US$17.1** in Q2'26, from US$12.5 in Q2'25 — **+36.8% as reported, +22% FX-neutral**. Quarterly path: 11.6, 12.5, 13.8, 15.0, 15.9, 17.1 | **Improving, every quarter for six quarters** | **High** — the second term in the company's formula; ARPAC is what carries yield, mix and fee take together | `Q2'26 Earnings Presentation, Aug-13-2026, slide 28` |
| **FX translation (BRL/USD above all)** | Average R$5.0496 in Q2'26 vs R$5.6625 in Q2'25 (**BRL +12.14%**). Spot R$5.1617 at Jun-30-2026 | **Tailwind now, and already less favourable at quarter-end spot than the quarter average (−2.2%).** The pool contains no BRL reading after Jun-30-2026 — do not assume the current level | **High** — roughly 90% of revenue is non-USD, so a 10% currency move ≈ 9% of revenue (≈US$496m per quarter at Q2'26 scale) | `Q2'26 Earnings Presentation, Non-IFRS Financial Measures — FX rates, pp.34–35`; `FY2025 20-F, Note 34(b)` for the 91% Brazil weight |
| **Product mix (unsecured share)** | Unsecured 26% of the portfolio (25% a year earlier), growing +45% YoY FX-neutral | **Improving revenue yield; raising credit risk at the same time.** 90+ day non-performing loans rose 35bps in the quarter to **6.9%**, the highest in the 13-quarter series the deck shows; CFO attributes it to *"a mix shift"* rather than deterioration | **Mid** — a 1-point mix shift on a US$39.4bn book is ~US$0.4bn moving to a higher-yield product; roughly 0.3–0.5% of revenue per point | `Q2'26 Earnings Presentation, slides 13 and 17`; `Q2 2026 transcript, Q&A — Rob Livingston` |
| **Deposits / funding base** | **US$45.3bn** (Brazil 36.4, Mexico 5.7, Colombia 3.3); +18% YoY FX-neutral, +6% QoQ. Average loan-to-deposit ratio (how much of the deposit base is lent out) rose **50% → 54% → 58%** across Q4'25–Q2'26 | **Improving in level, but growing at half the rate of the loan book (+18% vs +37%).** That gap is being absorbed by the rising loan-to-deposit ratio, which is finite | **Mid–High** — deposits set the ceiling on how fast the loan book can grow, and treasury/float income (interest on other assets at amortised cost) is 13.88% of revenue | `Q2'26 Earnings Presentation, slides 14 and 16`; `Q2 2026 transcript, prepared remarks` |
| **Card purchase volume / interchange** | Credit and prepaid card income **US$534,970k**, +36.3% YoY | **Improving, but slower than interest income** (+36.3% vs +52.2% for total interest income), so its revenue share is falling | **Mid** — 9.70% of revenue; a 10% volume move ≈ 1.0% of revenue | `Q2'26 interim statements, Note 6(b), p.16` |
| **Late fees** | **US$136,801k**, +51.7% YoY | Improving | **Low** — 2.48% of revenue | `Q2'26 interim statements, Note 6(b), p.16` |
| **Brazilian policy rate (Selic / CDI)** | Selic **15.00%** as of the FY2025 20-F date (Apr-2026); average CDI 14.3% in 2025 vs 10.8% in 2024. **The pool holds no Selic or CDI reading later than Apr-08-2026** | **Unknown from available data.** High rates lift the treasury/float line (interest on other assets at amortised cost, +53.5% YoY) and lift funding cost at the same time; a cutting cycle would reverse both | **Mid** — the float line is 13.88% of revenue; a 200bp policy move on that line is roughly 1.5–2% of revenue, before any funding-cost offset | `FY2025 Form 20-F, Item 3.D and Item 5, macroeconomic indicators table`; `Q2'26 interim statements, Note 6(a), p.16` |
| **Revolving-card charge cap (Lei 14.690/2023 + CMN Res. 5.112/2023)** | **In force and unchanged** since Jan-03-2024: total interest and charges on revolving/instalment card financing may not exceed the original debt. The 20-F states the provisions *"have been applied throughout 2024 and 2025"* | **Stable** — a standing ceiling on the price of the largest revenue line, not a new change | **Low today, High if tightened** — it caps price on the 32.75% of revenue that is card interest | `FY2025 Form 20-F, Item 4.B, Revolving Credit and Interest Rate Regulations` |
| **M&A** | Banco Porto Real (licence only, post quarter-end, pending BCB approval); Nubank N.A. not yet operating | **No contribution** | **Low** — zero in the reported period | `Q2'26 interim statements, Note 35, p.44` |

**Drivers deliberately not listed, because they do not apply:** store count / distribution points (there are no branches), commodity price, utilisation / installed capacity, backlog / order book, contract renewals. NU discloses none of these and inventing rows for them would be filler.

**Sector-KPI completeness check (the bank overlay).** The KPIs a lender's revenue read requires are present: NIM, risk-adjusted NIM, loan growth by product, deposit growth, cost of deposits as a share of the interbank rate, loan-to-deposit ratio, NPL 15–90 and 90+, coverage, ROE, ARPAC, activity rate. **Three are absent from this pool and are flagged rather than skipped:** (i) the **interest-earning portfolio (IEP)** balance is defined in the deck's glossary but no quarterly IEP figure was extracted, so the yield I compute in §6a uses the *total gross* portfolio instead and is therefore a blended, not a true earning-asset, yield; (ii) **purchase volume** is defined in the glossary but no quarterly figure appears, so interchange growth cannot be split into volume versus take rate; (iii) **ARPAC by country** is not disclosed, so Mexico's revenue growth cannot be split into customers versus monetisation.

---

## 5. Revenue Drivers By Segment

**There is one reportable segment, so this section is a geographic cut, not a segment P&L.** All figures are on the **Note-34(b) revenue base**, which covers 79.5% of IFRS total revenue and excludes treasury income (§1). Revenue shares are of that narrower base. **Profit by country is not disclosed** — I do not estimate it.

`[Q2'26 interim condensed consolidated financial statements (filed Aug-14-2026), Note 34(b), p.43]`, three-month periods, US$ thousands:

| Geography | Q2'26 | Q2'25 | YoY as reported | Share of Note-34 base Q2'26 | Contribution to the base's +53.53% growth |
|---|---:|---:|---:|---:|---:|
| Brazil | 3,990,286 | 2,621,626 | **+52.20%** | 91.08% | **+47.96pp** |
| Mexico | 314,603 | 175,693 | **+79.06%** | 7.18% | +4.87pp |
| Other countries (incl. Colombia, US) | 76,038 | 56,201 | +35.30% | 1.74% | +0.70pp |
| **Total (Note-34 base)** | **4,380,927** | **2,853,520** | **+53.53%** | 100.00% | **+53.53pp** |

Components sum exactly to the stated total. Note the base's +53.53% is **not** the same as IFRS total revenue growth of +50.29% — the two differ because treasury income (outside this table) grew more slowly than the customer-facing lines.

### Segment: Brazil (91.08% of the Note-34 revenue base)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Customers | ~118m; activity rate above 86% for the first time | Improving | High | `Q2 2026 transcript, prepared remarks` |
| Credit portfolio | Not disclosed by country. Group portfolio US$39.4bn, and Brazil holds 90.2% of the regulatory capital in the three regulated entities (5,597,604 of 6,204,917 at Jun-30-2026) | Improving | High | `Q2'26 interim statements, Note 33, pp.42–43` |
| Deposits | **US$36.4bn**, 80.4% of the group's US$45.3bn | Improving | Mid–High | `Q2 2026 transcript, prepared remarks` |
| FX (BRL) | Average R$5.6625 → R$5.0496 (**+12.14%**) | Tailwind, weaker at quarter-end spot | **High** | `Q2'26 Earnings Presentation, pp.34–35` |
| Constant-currency revenue growth | **~+35.7%** — *derived*: reported +52.20% ÷ 1.1214 (the BRL average-rate move) − 1. *Inference, not from filings*; the company publishes no country-level FX-neutral figure | Improving | High | My arithmetic on `Q2'26 interim statements, Note 34(b)` and the deck's FX rates |
| Regulatory price cap | Card revolving/instalment charge ceiling in force, unchanged | Stable | Low today | `FY2025 20-F, Item 4.B` |

### Segment: Mexico (7.18% of the Note-34 revenue base)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Customers | 16m as of end-July 2026; 16.5% of Mexico's adult population | Improving | High for Mexico, Low for the group | `Q2 2026 transcript, prepared remarks` |
| Revenue | US$314,603k in Q2'26, **+79.06% YoY as reported** | Improving, fastest of the three regions | Low for the group — 7.18% of the base, so even a 20% swing here is ~1.4% of the base | `Q2'26 interim statements, Note 34(b), p.43` |
| Deposits | **US$5.7bn**, and **declining modestly for a second quarter** — deliberate: CFO calls it *"our ongoing deposit optimization strategy"* to lower funding cost | Deliberately shrinking | Mid for Mexico | `Q2 2026 transcript, prepared remarks`; `Q2'26 Earnings Presentation, slide 14` |
| Banking licence | Became a full multiple bank on **Aug-06-2026** after CNBV authorisation on Jul-09-2026 — after quarter-end. CEO says it *"unlocks capabilities we did not have before. Payroll direct deposits strengthen primary [banking relationships]"* | **New driver, not yet in any reported revenue** | Mid for Mexico in FY2027 | `Q2'26 interim statements, Note 35, p.44`; `Q2 2026 transcript, prepared remarks` |
| Monetisation | Management states ARPAC *"in Mexico is $12.3 against $5.6 in Brazil"* **at the same stage of penetration** — a like-for-like cohort comparison, not current group ARPAC. It is a transcript claim with **no supporting country income statement anywhere in the filings** and must not be converted into a profit or revenue share | Claimed improving | Not verifiable | `Q2 2026 transcript, prepared remarks`; limitation also flagged in `business-model/03_segment-map.md` §3 |
| FX (MXN) | The pool gives monthly MXN rates for Mar/Apr/May 2026 (17.78 / 17.46 / 17.31) but **no Q2'25 MXN average**, so Mexico's +79.06% cannot be split into currency and operating growth | **Not available** | — | `Q2'26 Earnings Presentation, FX Rates — Monthly translation, p.35` |

### Other countries (1.74% of the base) — immaterial to group revenue

Colombia has more than 5m customers and US$3.3bn of deposits, and Nubank N.A. in the US is not yet operating. The bucket is 1.74% of the Note-34 revenue base but **13.9% of group non-current assets** — the disclosure narrowed from FY2024 onward when Colombia stopped being named separately. `[Q2'26 interim statements, Note 34(b), p.43; FY2025 20-F, Note 34(b), p.F-97]` No separate driver table is warranted at 1.74% of revenue.

---

## 6. Revenue Growth Decomposition

**Period decomposed: Q2'26 versus Q2'25 (three months), IFRS total revenue, US$ thousands.** Observed: **5,513,208 vs 3,668,470 = +1,844,738 = +50.29%.** `[Q2'26 interim condensed consolidated financial statements, Consolidated Statements of Income, three-month period ended 06/30/2026, p.6]`

### 6.1 Driver decomposition (the required view)

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Volume — customer count (+13.0%: 123m → 139m) | **+13.00** | `Q2'26 Earnings Presentation, slide 6`; `Q2 2026 transcript, prepared remarks` |
| Price / monetisation — ARPAC per active customer, **FX-neutral +22%** | **+24.86** | `Q2'26 Earnings Presentation, slide 28` |
| Mix (product, customer, geography) | **Not separable** — sits inside the ARPAC row; the company publishes no mix bridge for revenue | `Q2'26 Earnings Presentation, slides 13, 28` |
| FX translation — BRL average R$5.6625 → R$5.0496 (**+12.14%**) | **+16.27** | `Q2'26 Earnings Presentation, Non-IFRS Financial Measures — FX rates, pp.34–35` |
| Acquisitions / divestitures | **0.00** | `Q2'26 interim statements, Note 35, p.44` — Banco Porto Real is post-quarter, licence-only, pending BCB approval |
| **Other (residual)** | **−3.84** | Basis mismatch between the ARPAC denominator and the customer count, plus rounding in the published ARPAC levels — see §6a |
| **Total revenue growth** | **+50.29** | `Q2'26 interim statements, Statements of Income, p.6` |

### 6.2 Line-item decomposition (a second, exact view from the filing)

This one needs no modelled ratio at all — every figure is a reported number, and the components tie to the total with **zero residual**. `[Q2'26 interim statements, Note 6(a) and 6(b), p.16]`

| Income line | Q2'26 | Q2'25 | Change | Contribution to the +50.29% (pp) |
|---|---:|---:|---:|---:|
| Interest income — credit card | 1,805,581 | 1,091,598 | +713,983 | **+19.46** |
| Interest income — loan | 1,734,365 | 1,128,020 | +606,345 | **+16.53** |
| Interest income — other assets at amortised cost (float) | 765,339 | 498,610 | +266,729 | +7.27 |
| Credit and prepaid card income (interchange) | 534,970 | 392,568 | +142,402 | +3.88 |
| Interest and gains — instruments at fair value | 363,558 | 296,219 | +67,339 | +1.84 |
| Late fees | 136,801 | 90,193 | +46,608 | +1.27 |
| Other fee and commission income | 70,455 | 48,473 | +21,982 | +0.60 |
| Insurance commission | 10,409 | 8,493 | +1,916 | +0.05 |
| Interest income — other receivables | 88,347 | 94,175 | **−5,828** | **−0.16** |
| Other income at fair value | 3,383 | 20,121 | **−16,738** | **−0.46** |
| **Total revenue** | **5,513,208** | **3,668,470** | **+1,844,738** | **+50.29** |

**Read:** credit-card interest and loan interest together contributed **+35.99pp of the +50.29pp — 71.6% of all the growth.** Float/treasury income added +7.27pp, interchange +3.88pp. Two lines went backwards. This view is exact but it is *not* a driver story: it says which income lines grew, not whether they grew on volume, price or currency. That is what 6.1 and 6a are for.

---

## 6a. Decomposition Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

Every component of §6.1 that was derived from a quoted ratio, with the multiplication printed and the ratio's basis named.

```
Volume — customer count: 123m (Q2'25) → 139m (Q2'26) = +13.02%, taken as +13.00%
  [Q2'26 Earnings Presentation, Aug-13-2026, slide 6; Q2 2026 transcript, Aug-13-2026]
  Contribution = 13.00pp of the 50.29pp observed growth
  → BASIS: a headcount of TOTAL customers at each period end. It is a unit count, so it carries
    no currency. Asserted from disclosure, no ratio applied.

Price / monetisation — ARPAC, FX-neutral +22% YoY
  [Q2'26 Earnings Presentation, Aug-13-2026, slide 28]
  1.1300 (customers) x 0.22 (FX-neutral ARPAC growth) = 0.2486
  = +24.86pp of the 50.29pp observed growth
  → BASIS MISMATCH, STATED NOT HIDDEN: the published ARPAC ratio is measured as total revenue
    divided by the AVERAGE number of INDIVIDUAL ACTIVE customers in the period. The customer row
    above is TOTAL customers at period end, including the ~6.8m small businesses ARPAC excludes.
    The two denominators are not the same population, so multiplying the rows overstates the
    product. I do not net that away into another component — it is the main part of the residual
    below. I also refuse to apply the +22% FX-neutral ARPAC figure to an as-reported base: the
    currency effect is carried in its own row, once.

FX translation — BRL average rate R$5.6625 (Q2'25) -> R$5.0496 (Q2'26)
  [Q2'26 Earnings Presentation, Aug-13-2026, Non-IFRS Financial Measures, pp.34-35]
  5.6625 / 5.0496 = 1.1214, i.e. the real appreciated 12.14% on the period-AVERAGE rate
  Constant-currency revenue growth = 1.5029 / 1.1214 - 1 = +34.02%
  FX contribution = 1.3402 x 0.1214 = 0.1627
  = +16.27pp of the 50.29pp observed growth
  → BASIS: the AVERAGE rate for the quarter, which is the correct basis for an income-statement
    flow (CLAUDE.md §27). I refuse to use the Jun-30-2026 SPOT rate of R$5.1617 here: that is the
    balance-sheet basis and the deck itself uses it only for deposits and the interest-earning
    portfolio. Applying it to a revenue flow would be the same class of error as using a
    period-end rate on a full-year income line.
  → SCOPE CAVEAT, NOT NETTED AWAY: this applies the BRL move to 100% of revenue, whereas roughly
    9% of revenue is Mexican peso and Colombian peso (Note-34 base: Brazil 91.08%, Mexico 7.18%,
    Other 1.74%). To the extent MXN and COP moved less than BRL, this row is slightly too large
    and the residual slightly too negative.

Blended credit yield (used in §3 and §4, not a §6.1 row)
  Card + loan interest: Q2'25 2,219,618k; Q2'26 3,539,946k  [Q2'26 interim statements, Note 6(a)]
  Average total gross portfolio: Q2'25 (24.1 + 27.3)/2 = US$25.7bn; Q2'26 (37.2 + 39.4)/2 = US$38.3bn
    [Q2'26 Earnings Presentation, slide 13]
  Yield = 2,219.6 / 25,700 x 4 = 34.55% ; 3,539.9 / 38,300 x 4 = 36.97%  (+242bps)
  Cross-check: 1.4903 (portfolio) x 1.0700 (yield) = 1.5946 = +59.46% vs the actual card+loan
  interest growth of +59.49%. Residual 0.03pp.
  → MIXED-BASIS WARNING (CLAUDE.md §15): the numerator is a FLOW translated at average rates; the
    denominator is period-END balances translated at closing rates, gross of provisions, and
    includes non-interest-earning transactor card balances. Both bases are labelled here every
    time the figure appears. It is an approximate blended yield, NOT the company's own
    interest-earning-portfolio yield, which is not disclosed quarterly in this pool.

Acquisitions / divestitures: 0.00pp
  → Asserted from disclosure, no ratio applied. Banco Porto Real is a post-quarter-end,
    licence-only agreement pending Brazilian Central Bank approval; Nubank N.A. is not operating.
    [Q2'26 interim statements, Note 35, p.44]
```

**Reconciliation.** Sum of the named components = 13.00 + 24.86 + 16.27 + 0.00 = **+54.13pp**, against the stated Total of **+50.29pp**. The gap is **−3.84pp**, and it is the residual, quantified in the "Other" row rather than rounded away. It is **7.6% of the observed growth** — the decomposition explains the great majority of the move, but not all of it, and the residual runs in a direction that says the customer × ARPAC product is slightly too generous.

**The upstream disagreement, adjudicated by name rather than averaged (CLAUDE.md §3).** Upstream `01_historical-financials` put the currency share at *"roughly a fifth"* of the Q2'26 YoY rate. That figure comes from comparing the company's FX-neutral **gross revenue** growth of **+39%** with IFRS total revenue growth of +50.3%, which gives an FX contribution of about **+11.3pp** (22% of the move). My figure is **+16.27pp** (32% of the move). Both are defensible and the difference is definitional, not a dispute about facts:
- `01`'s read compares a **company-defined, non-IFRS "Gross Revenue"** measure (Q2'25 US$3,772m → Q2'26 US$5,876m on the deck's own series, i.e. +55.78% as reported) against **IFRS total revenue** growth. Those are two different top lines, so the subtraction mixes bases.
- Notably, the deck's own series is internally consistent with my rate arithmetic: 1.5578 ÷ 1.39 = **1.1207**, an implied FX factor of **+12.07%**, against the actual BRL average-rate move of **+12.14%**. Two independent reads of the currency effect agree to within 7 basis points.
- My read applies that measured rate move to the whole IFRS revenue base, which is slightly too wide because ~9% of revenue is MXN/COP.

**So the honest range for the FX contribution is +11.3pp to +16.3pp of the +50.3pp, i.e. between a fifth and a third of the reported growth.** I use +16.27pp in the table because it is built from the actual average exchange rate on a matched (income-statement, average-rate) basis, and because when reads of equal quality disagree the more conservative one governs (§4) — here the conservative read is the one that leaves less growth attributable to the business. Upstream's "roughly a fifth" qualifier travels with this and is not overwritten.

RF-EARN-001: revenue decomposition reconciled — explained 54.1pp, residual -3.8pp, total 50.3pp

---

## 6b. Cycle Position (Cycle-Position Rule)

NU is a consumer lender, which `business-model/10_external-dependency.md` scores **High** on both the interest-rate cycle and the consumer-credit cycle. That output does not put a peak/mid/trough label on the latest quarter; I do, and I flag rather than merge the difference.

**Where Q2'26 sits: at or very near a cyclical high on profitability, and NOT a normalised run-rate.** The evidence:
- **Risk-adjusted NIM 12.4% is a record** and the top of its own six-quarter series (9.3%, 9.9%, 10.8%, 10.5%, 9.5%, **12.4%**). NIM 22.9% is likewise the top of its series (18.6%–22.9%). `[Q2'26 Earnings Presentation, slide 15]`
- **First quarter in the company's history above US$1bn of net income** (US$1,061m), ROE 33%. `[Q2 2026 transcript, prepared remarks; Q2'26 Earnings Presentation, slide 23]`
- Against that, **90+ day non-performing loans at 6.9% are the highest in the 13-quarter series** the deck shows (Q2'23 5.8% → Q2'26 6.9%), so asset quality is not at a cyclical best — profitability and credit quality are pointing in opposite directions. `[Q2'26 Earnings Presentation, slide 17]`

**One-time tailwinds in the latest period, labelled non-run-rate:**
1. **Desenrola, the Brazilian government debt-renegotiation programme.** CFO: *"Desenrola… impacted this number by just about 5%"* of cost of credit, and *"we've already seen more than 4/5 of that hitting us in or benefiting us in Q2"*, with *"a little bit more impact… in Q3"*. About **one third** of the risk-adjusted-NIM beat versus management's own Q1 expectation came from it. This is a **policy tailwind that mostly does not repeat** — and note precisely what it touches: it flatters **cost of credit and therefore gross profit and risk-adjusted NIM, not revenue.** `[Q2 2026 transcript, prepared remarks and Q&A — Rob Livingston]`
2. **BRL appreciation of 12.14% year on year.** A translation tailwind, not demand. Spot at Jun-30-2026 (R$5.1617) was already 2.2% weaker than the quarter's own average, so the same rate held flat gives less help next quarter. `[Q2'26 Earnings Presentation, pp.34–35]`
3. **A high Brazilian policy rate.** Selic 15.00% at the 20-F date and average CDI 14.3% in 2025 versus 10.8% in 2024 support the float/treasury line (13.88% of revenue, +53.5% YoY). A cutting cycle shrinks that line. The pool holds no rate reading after Apr-08-2026 — the current level is unknown, not assumed. `[FY2025 20-F, Item 3.D and Item 5]`

**Stated plainly: the Q2'26 margin and profitability numbers are not a normalised run-rate.** The revenue line itself is less cycle-flattered than the profit line, because the biggest one-off (Desenrola) sits below revenue — but the currency component of revenue is fully a cycle effect. Downstream modules should not treat Q2'26 risk-adjusted NIM of 12.4% or reported revenue growth of +50.3% as a baseline.

One genuine offset, evidence-based: with a claimed 7% share of a US$100bn profit pool, growth need not come from the cycle. *"we're still a small player in that big market, and we get to cherry pick our customers"* `[Q2 2026 transcript, Q&A — David Vélez]`. Both the 7% and the US$100bn are management estimates, not filed figures.

---

## 7. The Single Biggest Revenue Driver

**The Brazilian real against the US dollar.** On the equal-move test this section asks — which driver, moved 10–20%, does most to reported revenue — nothing else is close. Roughly **90% of revenue is earned in non-USD currencies** (Brazil is 91.08% of the Note-34 revenue base, and the treasury income outside that base is also predominantly Brazilian), so revenue's sensitivity to the currency is close to one-for-one: a **10% move ≈ 9.0% of revenue, about US$496m in a quarter at Q2'26 scale; a 20% move ≈ 18%, about US$992m.** `[Q2'26 interim statements, Note 34(b), p.43; Q2'26 Earnings Presentation, pp.34–35]` The next-largest lever is the credit portfolio itself, where card and loan interest is 64.21% of revenue, so a 10% move in the book at constant yield is **6.4% of revenue (~US$354m)** and a 20% move is 12.8% — real, but roughly two-thirds of the currency's leverage on the same size of move.

**Its current direction: a fading tailwind.** The real appreciated **12.14%** on the quarterly average (R$5.6625 → R$5.0496) and that alone contributed **+16.27pp of the +50.29pp** of reported revenue growth. But the spot rate at Jun-30-2026 was **R$5.1617 — 2.2% weaker than the quarter's own average** — so if spot merely holds, Q3'26 translates less favourably than Q2'26 did, and the year-ago comparison base is getting harder. The pool contains no BRL reading after Jun-30-2026, so the *current* level is **not proven from available data**; what is proven is that the tailwind was already smaller at quarter-end than the quarter average implies.

**Two honesty checks this paragraph has to pass.** First, the arithmetic behind the claim: the FX component is derived above and printed, and it is **32% of the observed growth**, so it is not "the bulk" of the move and I do not call it that — it is the single largest *sensitivity*, not the majority *contributor*. Second, no component of the §6.1 decomposition on its own clears half the growth: monetisation (ARPAC) is the largest contributor at **+24.86pp, or 49.4%** — just under half — and it is itself a composite of yield, product mix and fee take rather than one clean driver. The decomposition reconciles to a **−3.84pp residual (7.6% of the move)**, which is small enough to support naming a biggest driver, but the naming is a claim about *sensitivity per unit of move*, not about which line did most of the work in Q2'26. What did most of the work in Q2'26 was, in order, monetisation per customer (+24.86pp), currency (+16.27pp) and customer count (+13.00pp) — and on the exact line-item view, credit-card and loan interest together (+35.99pp, 71.6% of all growth).

---

## 8. Data Limitations

- **Segment-level P&L does not exist.** One reportable segment, no country or product profit disclosure. Geographic revenue is on a base covering 79.5% of IFRS total revenue.
- **Mexico's growth cannot be split into currency and operating growth** — the pool has no Q2'25 MXN average rate.
- **No interest-earning-portfolio and no purchase-volume quarterly figures** were extracted, so the yield in §6a is a blended gross-portfolio yield and interchange growth cannot be split into volume versus take rate.
- **No Brazilian policy-rate reading after Apr-08-2026** in the pool; the current Selic/CDI level is not assumed.
- **No quantitative company guidance** for revenue exists (`04_guidance-consensus` confirms no revenue or EPS guidance was given on the Q2'26 call), so no forward driver level is management-anchored.
- **Verbatim transcripts are available** (19 consecutive calls through Q2 2026), so no transcript-proxy limitation applies and no MODULE_RULES score cap binds on this agent's inputs.
- QoQ analysis is available and used — quarterly data is present, so the no-quarterly-data rule does not apply.

---

## 9. Citations

`[FY2025 Form 20-F (filed Apr-08-2026), Note 34 (Segment information), p.F-97]` — single reportable segment; FY2025 geographic revenue base.
`[FY2025 Form 20-F, Note 35(a), p.F-98]` — Nubank N.A. conditional OCC approval, Jan-29-2026.
`[FY2025 Form 20-F, Item 3.D]` — Selic 15.00% as of the annual-report date; Brazil credit-rating and fiscal risk factors.
`[FY2025 Form 20-F, Item 4.B, Revolving Credit and Interest Rate Regulations]` — Lei 14.690/2023 and CMN Res. 5.112/2023 card-charge cap, applied throughout 2024 and 2025.
`[FY2025 Form 20-F, Item 5, macroeconomic indicators table]` — Brazil GDP growth 2.3% (2025) vs 3.4% (2024); unemployment 5.1% vs 6.2%; average CDI 14.3% vs 10.8%.
`[FY2025 Form 20-F, Key Business Metrics — Activity Rate]` — activity rate 83.4% / 83.0% / 83.1%.
`[Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026), Consolidated Statements of Income, p.6]` — total revenue 5,513,208 (Q2'26) and 3,668,470 (Q2'25); net income to parent 1,060,199.
`[Q2'26 interim statements, Note 6(a) and 6(b), p.16]` — the ten income lines used in §2 and §6.2, three-month columns for 06/30/2026 and 06/30/2025.
`[Q2'26 interim statements, Note 33(a)(b)(c), pp.42–43]` — regulatory capital by entity (Brazil 5,597,604 of 6,204,917).
`[Q2'26 interim statements, Note 34(b), p.43]` — geographic revenue Q2'26/Q2'25 and H1'26/H1'25; non-current assets.
`[Q2'26 interim statements, Note 35 (Subsequent events), p.44]` — Banco Porto Real share purchase agreement (Jul-20-2026, licence acquisition, pending BCB approval); Mexico CNBV authorisation Jul-09-2026, operating as a bank from Aug-06-2026.
`[Q2'26 Earnings Presentation, Aug-13-2026, slide 6]` — customers 65/84/105/123/139m at Q2'22–Q2'26; ARPAC; efficiency ratio; the "customers × ARPAC" formula.
`[Q2'26 Earnings Presentation, slide 13]` — total credit portfolio US$39.4bn, +37% YoY FX-neutral, +5% QoQ; cards US$26.0bn +35%, unsecured US$10.3bn +45%, secured US$3.1bn +30%; portfolio mix by product Q1'25–Q2'26.
`[Q2'26 Earnings Presentation, slide 14]` — deposits US$45.3bn (+18% YoY FX-neutral, +6% QoQ), Brazil 36.4 / Mexico 5.7 / Colombia 3.3; cost of deposits 88% of the interbank rate (91% a year earlier).
`[Q2'26 Earnings Presentation, slide 15]` — NII US$3,687m; NIM 19.2/18.8/18.6/19.5/21.1/22.9%; risk-adjusted NIM 9.3/9.9/10.8/10.5/9.5/12.4%; cost of credit by quarter.
`[Q2'26 Earnings Presentation, slide 16]` — risk-adjusted NIM QoQ walk; average loan-to-deposit ratio 50% / 54% / 58%.
`[Q2'26 Earnings Presentation, slide 17]` — NPL 15–90 and 90+ series, Q2'23–Q2'26.
`[Q2'26 Earnings Presentation, slide 21]` — company-defined Gross Revenue US$3,373/3,772/4,317/4,857/5,316/5,876m (Q1'25–Q2'26), +39% YoY FX-neutral in Q2'26.
`[Q2'26 Earnings Presentation, slide 23]` — net income and ROE by quarter; ROE 33% in Q2'26.
`[Q2'26 Earnings Presentation, slide 28]` — monthly ARPAC US$11.6/12.5/13.8/15.0/15.9/17.1 (Q1'25–Q2'26), +22% YoY FX-neutral; cost to serve.
`[Q2'26 Earnings Presentation, Non-IFRS Financial Measures — FX-Neutral methodology and FX Rates, pp.34–35]` — average USD/BRL R$5.0496 (Q2'26) and R$5.6625 (Q2'25); spot R$5.1617 at Jun-30-2026; monthly MXN and COP rates for Mar–May 2026.
`[Q2 2026 earnings-call transcript, Aug-13-2026 (S&P Global Market Intelligence), prepared remarks]` — 139m customers, ~118m Brazil, >5m Colombia, 16m Mexico at end-July; activity rate 83.5%, Brazil above 86%; portfolio and deposit commentary; NIM +180bps to 22.9%; Desenrola ~5% of cost of credit; NPL commentary; ~US$30bn Brazil mass-market industry gross profit pool.
`[Q2 2026 earnings-call transcript, Aug-13-2026, Q&A]` — 7% share of the profit pool; Desenrola "more than 4/5" already recognised in Q2 and about one third of the risk-adjusted-NIM outperformance; mix-shift explanation of NPL; private-payroll pace.
`[analyses/NU_2026-09-06/business-model/03_segment-map.md]` — cross-module segment structure, the Note-34 revenue-base caveat, and the flag on management's Mexico-versus-Brazil ARPAC claim.
`[analyses/NU_2026-09-06/business-model/10_external-dependency.md]` — interest-rate and consumer-credit-cycle exposure ratings used in §6b.
`[analyses/NU_2026-09-06/earnings/01_historical-financials.md]` — revenue baseline and the FX qualifier adjudicated in §6a.
`[analyses/NU_2026-09-06/earnings/04_guidance-consensus.md]` — confirmation that no revenue guidance exists; FQ3'26 consensus revenue mean US$5,936.74m (`Capital IQ Estimates→Consensus`, data as of Aug-2026).

**Not used as a source for any number:** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` (verdict-bearing prior in-house memo; verdict stripped per CLAUDE.md §24).



---

## earnings / 03_margin-drivers.md

_Source: `03_margin-drivers.md`_

# Margin Drivers — NU

**Reporting basis.** Nu Holdings Ltd. (NYSE:NU, Class A ordinary shares, USD) reports under **IFRS Accounting Standards**, in **US dollars**, fiscal year ending **31 December**. US foreign private issuer: the audited annual filing is a **Form 20-F**, the quarterly disclosure an **unaudited interim condensed consolidated financial statement** — no 10-K, no 10-Q, and their absence is not a data gap (CLAUDE.md §27). All figures are **reported IFRS** unless a cell says otherwise. Figures from the interim filings are in US$ thousands; figures from the 20-F Item 5 tables are in US$ millions; each is labelled.

**Sector overlay applied: Bank / lender — margin analysis uses net interest margin (NIM), risk-adjusted NIM, credit-cost rate and the efficiency (cost-to-income) ratio, not a COGS / freight / labour cost stack.** Matched from `analyses/NU_2026-09-06/business-model/02_business-identity.md` §3a, which itself matched the **Bank / lender** row of `frameworks/SECTOR_OVERLAYS.md`. The audited IFRS gross-margin ladder is retained *alongside* the bank grammar, because for this issuer the filed income statement puts funding cost, transactional cost and expected credit loss **above** gross profit — so IFRS gross margin is already a credit-and-funding-adjusted margin, and it is the auditable anchor for the non-IFRS managerial metrics.

**Prior in-house memo.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is verdict-bearing. Its verdict is stripped (CLAUDE.md §24) and **no number in this report comes from it**.

**Transcript status.** Verbatim S&P Global transcripts are present for 19 consecutive calls through Q2 2026. No sell-side proxy is used and no proxy cap applies.

---

## 1. Segment Decomposition Status

**Single reportable segment — margin cannot be decomposed by segment, and this is a disclosure fact, not a gap.**

Nu reports **one** operating and reportable segment: *"The CODM considers the whole Group as a single operating and reportable segment"* [FY2025 Form 20-F (filed Apr-08-2026), Note 34 (Segment information)]. The same wording appears in the latest interim statements [Q2'26 interim condensed consolidated financial statements (filed Aug-14-2026), Note 34]. Banking is 100% of FY2025 revenue, confirmed by the deterministic sidecar (`ciq_facts.json` `segments_revenue` = "Banking 6,991 (100%) of Total 6,991", status `present`). That clears the >85% single-segment test in `MODULE_RULES.md`, so this report works at **consolidated level**.

Business-model `03_segment-map.md` is available and was read. Three limits it imposes on this module, carried with their qualifiers:

1. **No profit split by geography.** Note 34(b) gives revenue by country (Brazil 90.9%, Mexico 7.2%, Other 1.8% for H1'26) and non-current assets, but **profit share is "Not disclosed" for every country** [FY2025 Form 20-F, Note 34(b); Q2'26 interim statements, Note 34(b)]. There is no country-level cost stack, so there is no country-level margin. I do not guess one.
2. **The geographic base is not total revenue.** Note 34(b)'s revenue base excludes treasury income — US$2,147.9m of US$10,481.2m in H1'26, or **20.5%** of what the group actually earns [Q2'26 interim statements, Notes 6(a) and 34(b)]. Any margin read built on the geographic split would be built on four-fifths of the revenue.
3. **Product lines are an income disaggregation, not a P&L.** Note 6 splits income seven ways (loan interest 40.0% of the Note-34 base in H1'26, card interest 40.3%, interchange 12.3%, late fees 3.1%, other) but attaches no cost to any of them [Q2'26 interim statements, Note 6(b)].

**Consequence:** Section 6 (per-segment driver tables) is not populated with numbers. What I can attribute by product is the company's own managerial gross-profit split — credit 41%, fees 25%, float 34% of Q2'26 gross profit [Q2 2026 earnings-call transcript, Aug-13-2026, prepared remarks] — and that is a **non-IFRS managerial** split on the deck's "gross profit" definition, which does not tie to the IFRS gross profit of US$2,346.5m (deck US$2,441m; gap US$94.5m; the gap is not stable across quarters). The two must not be substituted for one another.

---

## 2. Cost Stack

The generic template rows (raw materials, freight, energy) do not exist for this issuer and are replaced by the matched sector grammar. Two tables: **2a** is the bank KPI grammar the overlay requires; **2b** is the audited IFRS cost stack the KPIs must reconcile to.

### 2a. Bank / lender cost and margin grammar — the primary read

All ratios are the company's own **non-IFRS managerial, annualised, FX-neutral-growth** measures unless marked. They are disclosed quarterly in the earnings deck.

| Bank cost / margin line | Q2'26 | Q1'26 | Q2'25 | Direction | Evidence | Margin risk |
|---|---:|---:|---:|---|---|---|
| **NIM** (interest margin before credit losses) | **22.9%** | 21.1% | 18.8% | Widening — +180bp QoQ, +410bp YoY | [Q2'26 Earnings Presentation, Aug-13-2026, slide 15]; +180bp QoQ confirmed [Q2 2026 transcript, prepared remarks] | Widening is driven by an unsecured-weighted mix, so it carries loss with it |
| **Cost of credit rate** (annualised cost of credit ÷ interest-earning base) | **10.5%** | 11.6% | 8.9% | Improved QoQ, **worse YoY (+160bp)** | Derived as NIM − risk-adjusted NIM from [Q2'26 Earnings Presentation, slide 15]. Basis: the deck's own interest-earning balance-sheet denominator | The single largest swing line in the whole P&L |
| **Risk-adjusted NIM** (interest margin after credit losses) | **12.42%** | 9.48% | 9.9% | +294bp QoQ, +252bp YoY — a record in the disclosed six-quarter series | [Q2'26 Earnings Presentation, slide 16 (QoQ walk); slide 15] | Management calls it sustainable but expressly refused to call 12% a floor |
| **Cost of deposits** (% of local interbank rate) | **88%** | 88% | 91% | Flat QoQ, −3pp YoY | [Q2'26 Earnings Presentation, slide 14]; *"essentially unchanged from last quarter and 3 percentage points lower than a year ago"* [Q2 2026 transcript, prepared remarks] | Near-mechanical pass-through of the policy rate: the *ratio* is managed, the *level* is not |
| **Efficiency ratio** (operating cost ÷ net revenues; lower is better) | **19.5%** | 17.6% | 21.3% | Worse QoQ, better YoY | [Q2'26 Earnings Presentation, slide 22 — opex US$806m ÷ net revenues US$4,132m] | Management's own FY26 guide of ~20% implies H2 must be **worse** than Q2'26 |
| **Cost to serve** (monthly, per active customer) | +14% YoY FX-neutral | — | — | Rising, but slower than revenue per customer (ARPAC +22% YoY FX-neutral) | [Q2'26 Earnings Presentation, slide 28] | The 8-point gap is the operating-leverage claim, and it is disclosed, not asserted |
| **Loan-to-deposit ratio** — **two different figures, both disclosed, do not blend** | **35%** (loans ÷ total deposits, CFO) / **58%** (average; net credit portfolio ÷ funding, deck) | 54% (deck basis) | — | Rising on both bases | 35%: [Q2 2026 transcript, prepared remarks]. 58%: [Q2'26 Earnings Presentation, slide 16, defined at slide 27 as net credit portfolio ÷ (total deposits less compulsory deposits + financial bills)] | Rising LDR is what converts idle float into credit income — it is the mechanism behind the NIM step-up |
| **Capital adequacy (Brazil prudential conglomerate)** | 15.7% CAR at Jun-30-2026 | — | — | Down from 16.6% at FY2025 | [Q2'26 interim statements, Note 33(a)] | Capital, not funding, is the eventual brake on the growth that is driving margin |

### 2b. Audited IFRS cost stack — what the filing actually reports

The filed income statement is: Total revenue → **cost of financial and transactional services provided** (funding cost + transactional expenses + expected credit loss) → **Gross profit** → operating expenses → **Income before income taxes (EBT)**. There is no EBITDA line and none is manufactured (`ciq_facts.json` `ltm_ebitda_m` = `unknown`, "Income Statement sheet has no 'EBITDA' row"). Interest expense sits **above** gross profit for this issuer — it is a cost of revenue, not a financing item below the line.

Percentages are my arithmetic on the filing's own figures, expressed as a share of **total revenue** for the same period.

| Cost line | Q2'26 (US$k) | % of revenue | Q2'25 % | FY2025 % | FY2024 % | Direction | Evidence | Margin risk |
|---|---:|---:|---:|---:|---:|---|---|---|
| Interest and other financial expenses (funding cost) | 1,556,650 | **28.23%** | 28.08% | 29.03% | 24.61% | Roughly flat YoY at quarter level; **up 442bp across FY2025** | [Q2'26 interim statements, statements of income and Note 6(c)]; [FY2025 Form 20-F, Item 5, p.176] | High — the biggest single cost line, and set by the Brazilian policy rate |
| — of which interest on deposits | 1,187,521 | 21.54% | 25.08% | 24.58% | 20.34% | Falling as a share of revenue at quarter level | [Q2'26 interim statements, Note 6(c)]; FY figures [FY2025 Form 20-F, Item 5, p.176] | Volume-led: deposits +45.3% in FY2025 to US$41.9bn |
| Transactional expenses | 127,816 | **2.32%** | 2.13% | 2.32% | 2.26% | Creeping up | [Q2'26 interim statements, Note 6(d)] | Low — but rewards expense doubled in FY2025 (+101.8%) |
| Expected credit loss (credit cost) | 1,482,213 | **26.88%** | 27.59% | 26.66% | 27.52% | Improved YoY at Q2; **Q1'26 spiked to 34.58%** | [Q2'26 interim statements, Note 7]; [Q1'26 interim statements (filed May-14-2026), statements of income] | **Highest** — the line that decides the margin |
| **Total cost of financial and transactional services** | **3,166,679** | **57.44%** | 57.80% | 58.00% | 54.39% | | [Q2'26 interim statements, statements of income] | |
| **= Gross profit / gross margin** | **2,346,529** | **42.56%** | 42.20% | 42.00% | 45.61% | | | |
| Customer support and operations | 226,246 | 4.10% | 4.40% | 4.13% | 5.25% | Improving | [Q2'26 interim statements, Note 8] | Low |
| General and administrative | 599,790 | 10.88% | 9.30% | 9.01% | 10.91% | **Worsened 158bp YoY** | [Q2'26 interim statements, Note 8] | Mid — see the "Others" line below |
| — of which share-based compensation | 134,418 | 2.44% | 2.74% | n/d | n/d | Improving 30bp YoY | [Q2'26 interim statements, Note 8] | Low; a real recurring cost paid in shares |
| — of which depreciation and amortisation | 42,370 | 0.77% | 0.63% | n/d | n/d | **Worsening 14bp YoY** (D&A +83.7% YoY vs revenue +50.3%) | [Q2'26 interim statements, Note 8] | Low today; the trailing edge of the FY2025 intangibles capex |
| — of which "Others", incl. tax on intercompany invoices | 136,893 | 2.48% | 0.60% | n/d | n/d | **Worsened 188bp YoY** — from US$22.0m to US$136.9m | [Q2'26 interim statements, Note 8, footnote (i): *"Includes tax expenses arising from intercompany invoices"*] | Mid — this single line is most of the G&A deterioration and is a by-product of the corporate restructuring that also cut the tax rate |
| Marketing | 103,429 | 1.88% | 1.84% | 1.92% | 2.14% | Flat | [Q2'26 interim statements, Note 8] | Low |
| Other expenses (incl. taxes on financial income US$151,511k) | 201,042 | 3.65% | 3.06% | 3.22% | 3.53% | Worsening 59bp YoY | [Q2'26 interim statements, Note 8] | Low–Mid |
| Other income | (24,954) | (0.45%) | (0.40%) | (0.82%) | (0.49%) | | [Q2'26 interim statements, Note 8] | |
| **Total operating expenses, net** | **1,105,553** | **20.05%** | 18.20% | 17.45% | 21.34% | **Worsened 185bp YoY at quarter level** | [Q2'26 interim statements, statements of income] | High at the EBT line; **zero effect on risk-adjusted NIM**, which sits above opex |
| Interest expense | — | — | — | — | — | Not a separate line below gross profit | For a lender it is inside "interest and other financial expenses" above | — |
| Raw materials / freight / energy / R&D | **Not applicable** | | | | | | A bank has no COGS, no freight and no disclosed R&D line | — |

**Reconciliation to the FY2025 20-F Item 5 table (US$ millions):** funding cost 4,578.7 / transactional 366.2 / ECL 4,204.9 = total 9,149.8 against revenue 15,774.8 → gross profit 6,625.0, gross margin 42.0%. The filing states the same margin change in words: *"Our gross margin … decreased, reaching 42.0% for the year ended December 31, 2025, compared to 45.6%"* [FY2025 Form 20-F, Item 5, p.177].

---

## 3. The Margin Ladder — Bank Version

The generic gross → EBITDA → EBIT walk is replaced, because NU discloses no EBITDA and its interest expense is a cost of revenue. The ladder below is the sector's: **NIM → credit cost → risk-adjusted NIM → operating cost → pre-tax profit → tax → net**. IFRS lines are audited; the NIM lines are the company's managerial measures.

| Margin level | Latest (Q2'26) | Prior year (Q2'25) | Change (bps) | Main reason | Evidence |
|---|---:|---:|---:|---|---|
| NIM (managerial) | 22.9% | 18.8% | **+410** | Mix shifted further to unsecured lending; rising loan-to-deposit ratio converts float into credit income | [Q2'26 Earnings Presentation, slide 15]; [Q2 2026 transcript, prepared remarks] |
| less cost of credit | (10.5%) | (8.9%) | **−160** (worse) | Portfolio grew 37% YoY FX-neutral; IFRS 9 books the loss at origination; deliberate risk expansions | Derived from slide 15; [Q2 2026 transcript, prepared remarks] |
| **Risk-adjusted NIM (managerial)** | **12.42%** | 9.9% | **+252** | Credit income outran the credit cost it created | [Q2'26 Earnings Presentation, slides 15–16] |
| **IFRS gross margin** (audited anchor) | **42.56%** | 42.20% | **+36** | Credit cost ratio fell 71bp; funding cost ratio and transactional cost together gave back 34bp | [Q2'26 interim statements, statements of income] |
| less operating expenses, net | (20.05%) | (18.20%) | **−185** (worse) | Real estate and marketing shifted from Q1 into Q2; international expansion; a US$115m YoY rise in G&A "Others" (intercompany-invoice tax) | [Q2'26 interim statements, Note 8]; [Q2 2026 transcript, prepared remarks] |
| **EBT margin (pre-tax, audited)** | **22.42%** | 23.97% | **−155** | Operating cost growth beat the gross-margin gain | [Q2'26 interim statements, statements of income] |
| Effective tax rate | 14.17% | 27.56% | **−1,339** (better) | Corporate-structure change; IFRS effective tax rate | [Q2'26 interim statements, statements of income, Note 30] |
| **Net margin (audited)** | **19.23%** | 17.36% | **+187** | **Entirely the tax line** — see §7 | [Q2'26 interim statements, statements of income] |

**Pass-through and its lag — stated explicitly, because funding cost is material.** Business-model `06_value-chain.md` and `10_external-dependency.md` both find the liability side repricing near-mechanically: deposits are contractually priced at a percentage of the local interbank rate (Brazil CDI, Mexico TIIE, Colombia IBR), currently **88%** [Q2'26 Earnings Presentation, slide 14]. So a policy-rate move reaches the funding cost **within roughly one quarter**, with no negotiation. Three things sit against a clean read of that:

- **The ratio is a management lever even though the level is not.** Cost of deposits fell from 91% of the interbank rate (Q2'25) to 88% (Q2'26) *while* the Brazilian Selic sat at a decade high — the spread was managed against the external rate, not passively tracked [Q2'26 Earnings Presentation, slide 14; `10_external-dependency.md`].
- **The asset side reprices fast but is capped by statute.** The book is short-duration, so lending yields follow within a quarter or two. But **Law 14,690/2023 caps the total amount that may be charged on revolving and instalment credit-card balances** [FY2025 Form 20-F, Item 4 — regulatory environment], and the INSS payroll-loan rate is capped with **Selic itself as the benchmark index** [FY2025 Form 20-F, Item 4, payroll-loans section]. On the largest revenue product the price lever is legally bounded, so cost cannot always be passed through by raising price.
- **The realised offset is measurable, and it is not zero.** In FY2025 the funding-cost ratio rose 442bp of revenue while gross margin fell only 361bp — the other cost lines absorbed 81bp, or roughly **18%** of the funding shock, before any management response is credited. Do not model a zero-mitigation stress as a base case (CLAUDE.md §9).

---

## 4. Which Margin Level Matters Most?

**Risk-adjusted NIM is the primary margin metric for this company, and IFRS gross margin is its audited anchor. Neither currently explains the bottom line, which is being set by tax — and that must be said in the same breath.**

Why risk-adjusted NIM: NU is a credit-led lender whose revenue and its two largest costs move together. Growing the loan book raises interest income, raises funding cost, and — because IFRS 9 recognises the expected loss at origination — raises the credit charge *before* the interest income arrives [Q2 2026 transcript, prepared remarks: *"we recognize expected credit losses at origination. So growth increases the allowance before the associated interest income is earned"*]. A revenue-growth number, a NIM number, or a credit-cost number read alone will each mislead. Risk-adjusted NIM nets all three against the same interest-earning base, and it is the only forward-looking margin number management will anchor to (*"we see it as being in the same region as where we are today"* — from 12.42% [Q2 2026 transcript, Q&A]). It is also the metric whose disclosed QoQ walk reconciles to the basis point (§7).

Two limits on it, stated rather than buried. First, it is **non-IFRS and managerial** — introduced in the current form in Q4 2025, quoted FX-neutral, and not audited; that is why IFRS gross margin (42.56% in Q2'26) is carried alongside as the auditable anchor. Second, risk-adjusted NIM sits **above operating cost and above tax**, so it is blind to the two things currently moving reported profit most: an operating-cost ratio that worsened 185bp year on year, and an effective tax rate that fell 1,339bp. A reader tracking only risk-adjusted NIM would have seen a record quarter and missed that **pre-tax margin actually fell 155bp year on year**.

---

## 5. Margin Driver Table (consolidated)

Magnitude is measured against the **primary metric, risk-adjusted NIM**, except where the row is marked "(EBT)" — those drivers sit below risk-adjusted NIM and are sized against **EBT margin** instead. High >100bp, Mid 30–100bp, Low <30bp.

| Driver | Impact on margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| **Credit cost (expected credit loss)** | The dominant swing line. Moved risk-adjusted NIM **−263bp in Q1'26 and +115bp in Q2'26**. Sits between a 22.9% NIM and a 12.42% risk-adjusted NIM — a bad-debt cycle removes nearly half the margin without touching revenue | **Tailwind now, structurally the biggest headwind risk** — improving QoQ but 160bp worse YoY on the rate | **High** | [Q2'26 Earnings Presentation, slides 15–16]; [Q2'26 interim statements, Note 7] |
| **Loan mix — unsecured vs secured** | Card 66% / unsecured personal 26% / secured 8% of the credit book. Shifting to unsecured lifts NIM and lifts loss together; management calls it *"a mix weighted further towards unsecured lending and the deliberate risk expansions we made"* | **Tailwind on margin, Headwind on losses** | **High** — credit income contributed +178bp of risk-adjusted NIM in Q2'26 | [Q2'26 Earnings Presentation, slide 13]; [Q2 2026 transcript, prepared remarks] |
| **Funding cost (deposit interest, tied to policy rate)** | Largest single cost line at 28.23% of Q2'26 revenue. Across FY2025 it cost **442bp of revenue** and was the main reason gross margin fell 361bp. Currently near-neutral: cost of funding moved −5bp of risk-adjusted NIM in Q2'26 | **Neutral now** (cost of deposits flat at 88% of interbank QoQ); **Headwind if the policy rate rises again** | **High** | [FY2025 Form 20-F, Item 5, p.176]; [Q2'26 Earnings Presentation, slides 14, 16] |
| **Loan-to-deposit ratio / float conversion** | Deploying idle deposits into loans raises NIM without new funding. LDR rose from 50% (Q4'25) to 58% (Q2'26) on the deck's average basis. Float income itself was −70bp then +5bp | **Tailwind** | **Mid** on float income directly; the LDR effect is embedded in the credit-income line | [Q2'26 Earnings Presentation, slide 16]; [Q2 2026 transcript, prepared remarks] |
| **Desenrola — government debt-renegotiation programme** | **One-time policy tailwind, NOT run-rate.** Reduced Q2'26 cost of credit by *"about 5%"*; management attributes about one-third of the risk-adjusted-NIM beat versus plan to it, and says *"more than 4/5"* has already been recognised | **Tailwind, reversing** | **Mid** — ~52bp of risk-adjusted NIM by the derivation in §7a | [Q2 2026 transcript, Q&A — CFO Rob Livingston] |
| **Operating cost / efficiency ratio (EBT)** | Cost 20.05% of revenue in Q2'26 vs 18.20% a year earlier. **Zero effect on risk-adjusted NIM** — it sits below it | **Headwind** — management's own FY26 ~20% guide requires H2 cost ratios ~150–195bp worse than Q2'26's 19.5% | **High (EBT)** — 185bp of EBT margin YoY | [Q2'26 interim statements, statements of income]; [Q2'26 Earnings Presentation, slide 22]; guidance arithmetic from `04_guidance-consensus.md` §2 |
| **Effective tax rate (EBT→net)** | 14.17% in Q2'26 vs 27.56% a year earlier. Below every margin level, and currently the sole reason the bottom line expanded | **Tailwind** | **High (net margin)** — **+300bp**, i.e. 100% of the net-margin expansion | [Q2'26 interim statements, statements of income and Note 30]; guide of 15–20% [Q1 2026 transcript, May-14-2026, prepared remarks] |
| **US expansion + return-to-office + AI infrastructure spend (EBT)** | Management caps the drag at *"less than 100 basis points on our consolidated efficiency ratio"* in each of 2026 and 2027, inside the ~20% envelope. Q1'26 "core" efficiency ratio (excluding these) was 16.6% against 17.6% reported — a **100bp** measured gap | **Headwind, bounded and self-declared** | **Mid–High (EBT)** | [Q1 2026 transcript, May-14-2026, prepared remarks] |
| **Transactional expenses (rewards, network fees)** | 2.32% of Q2'26 revenue, up 19bp YoY. Rewards expense doubled in FY2025 (+101.8%) | **Headwind** | **Low** | [Q2'26 interim statements, Note 6(d)]; [FY2025 Form 20-F, Item 5, p.176] |
| **G&A "Others" — intercompany-invoice tax (EBT)** | Rose from US$22.0m (Q2'25) to US$136.9m (Q2'26), **188bp of revenue** — most of the 158bp G&A deterioration. It is the operating-cost by-product of the same corporate restructuring that cut the effective tax rate | **Headwind (EBT), partly offsetting the tax tailwind** | **High (EBT)** | [Q2'26 interim statements, Note 8 and footnote (i)] |
| **Depreciation and amortisation step-up (EBT)** | D&A +83.7% YoY against revenue +50.3%, so D&A/revenue rose 14bp to 0.77%. The trailing edge of FY2025 intangibles capex of US$333.6m | **Headwind** | **Low** | [Q2'26 interim statements, Note 8]; [FY2025 Form 20-F, statements of cash flows] |
| **Share-based compensation (EBT)** | 2.44% of Q2'26 revenue vs 2.74% a year earlier | **Tailwind** | **Low** | [Q2'26 interim statements, Note 8] |
| **Statutory price caps** | Law 14,690/2023 caps total charges on revolving and instalment card balances; the INSS payroll-loan rate is capped with Selic as its index. Removes the price lever on the largest revenue product | **Structural constraint, not a quarterly mover** | **Unknown** — no disclosed elasticity | [FY2025 Form 20-F, Item 4 — regulatory environment; payroll-loans section] |
| **FX translation (BRL/USD)** | Large on *levels*, near-neutral on *margin ratios* — the same rate translates numerator and denominator. Reported USD revenue grew 50.3% YoY in Q2'26 against 39% FX-neutral on the managerial gross-revenue measure; but the underlying margin moves hold FX-neutral too (NII +9% FXN, cost of credit −9% FXN) | **Neutral on margin; High on reported levels** | **Low** on margin. *The residual effect — country-mix differences in local rates — is not separately disclosed; inference, not from filings* | [Q2'26 Earnings Presentation, slide 15 and FX-neutral methodology note]; `10_external-dependency.md` §5 |

---

## 6. Margin Drivers By Segment

**Not populated — segment-level P&L is not disclosed.** One reportable segment (Banking, 100% of revenue); Note 34(b) gives revenue and non-current assets by country with **profit share "Not disclosed"** for every country, and its revenue base excludes 20.5% of H1'26 income [Q2'26 interim statements, Note 34(b) and Note 6(a)]. I do not construct a country margin.

Three country-level facts that bear on margin direction, none of which is a margin number:

- **Mexico — deliberate deposit shrinkage to cut funding cost.** Deposits fell again to US$5.7bn, *"reflecting our ongoing deposit optimization strategy. This continues to improve our cost of funding while maintaining ample liquidity"* [Q2 2026 transcript, prepared remarks]. Mexico became a full multiple bank on Aug-6-2026 [Q2'26 interim statements, Note 35 (Subsequent events)]. Directionally a funding-cost tailwind; unquantified at group level.
- **Brazil is the margin.** 90.9% of geographically-attributed H1'26 revenue [Q2'26 interim statements, Note 34(b)]. Group margin is effectively Brazilian margin, so the Brazilian policy rate and Brazilian credit cycle are group drivers, not country drivers.
- **The United States is a cost, capped by management at <100bp of the efficiency ratio per year** [Q1 2026 transcript, prepared remarks]. Nubank N.A. holds conditional OCC approval and is not yet operating [FY2025 Form 20-F, Note 35(a)]. It contributes cost with no offsetting revenue line yet.

---

## 7. Margin Bridge — Latest Period

Two bridges. **7A** is the company's own risk-adjusted NIM walk (the primary metric, quarter on quarter). **7B** is my own bridge on the audited IFRS statements, year on year, walking all the way to net margin — this is the one that adjudicates the divergence upstream `01` flagged. The generic template rows (volume / price / input costs / mix / FX / one-offs) are replaced by the bank grammar; the mapping is stated in each table.

### 7A. Risk-adjusted NIM — Q1'26 → Q2'26 (company-disclosed walk)

| Component | Margin impact (bps) | Maps to generic template row | Evidence |
|---|---:|---|---|
| Float income | **+5** | Mix (asset mix — idle cash into loans) | [Q2'26 Earnings Presentation, slide 16] |
| Credit income | **+178** | Volume / operating leverage | [Q2'26 Earnings Presentation, slide 16]; *"driven by our strong loan growth in cards and unsecured lending in Q1"* [Q2 2026 transcript, prepared remarks] |
| Cost of credit | **+115** | Input costs (credit is a lender's input cost) | [Q2'26 Earnings Presentation, slide 16] |
| — of which Desenrola (one-off policy) | ~+52 (subset of the +115; **not additive**) | One-offs | Derived in §7a from *"about 5%"* on cost of credit [Q2 2026 transcript, Q&A] |
| Cost of funding | **−5** | Input costs (funding) | [Q2'26 Earnings Presentation, slide 16] |
| FX | **Not separately disclosed** — the deck states FX-neutral growth alongside (NII +9% FXN, cost of credit −9% FXN), same signs as reported, so FX does not flip any component | FX | [Q2'26 Earnings Presentation, slide 15] |
| Other | **+1** (rounding in the disclosed walk) | Other | Residual, quantified below |
| **Total** | **+294** (9.48% → 12.42%) | | [Q2'26 Earnings Presentation, slide 16] |

### 7B. IFRS net margin — Q2'26 vs Q2'25 (my bridge on the audited statements)

Every pre-tax component is expressed **after tax at the prior-year retention rate (72.4438%)**, so the components sum to the change in *net* margin rather than pre-tax margin. That conversion is stated because the alternative — mixing pre-tax and post-tax components in one column — is exactly the basis mix §15 forbids.

| Component | Margin impact (bps of net margin) | Maps to generic template row | Evidence |
|---|---:|---|---|
| Funding cost ratio (28.234% vs 28.077% of revenue) | **−11.4** | Input costs | [Q2'26 interim statements, statements of income] |
| Transactional expense ratio (2.318% vs 2.135%) | **−13.3** | Input costs | [Q2'26 interim statements, Note 6(d)] |
| Credit cost ratio (26.884% vs 27.592%) | **+51.3** | Input costs / mix | [Q2'26 interim statements, Note 7] |
| *(subtotal: IFRS gross margin +36.7bp pre-tax)* | *(+26.6 post-tax)* | | |
| Operating expenses, net (20.053% vs 18.198%) | **−134.4** | Volume / operating leverage — negative this quarter | [Q2'26 interim statements, Note 8] |
| Share of loss in associates | **−4.1** | Other | [Q2'26 interim statements, statements of income] |
| *(subtotal: EBT margin −154.6bp pre-tax)* | *(−112.0 post-tax)* | | |
| **Effective tax rate (14.173% vs 27.562%)** | **+300.2** | One-offs / structural | [Q2'26 interim statements, statements of income, Note 30] |
| Non-controlling interests | **−1.2** | Other | [Q2'26 interim statements, statements of income] |
| FX | **0 by construction on the ratio** — every line in this table is a share of the same USD-translated revenue | FX | [Q2'26 interim statements] |
| Other / rounding residual | **0.0** | Other | Computed below |
| **Total margin change (net margin, 17.359% → 19.231%)** | **+187.1** | | [Q2'26 interim statements, statements of income] |

---

## 7a. Bridge Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

Every component in 7A is **asserted from disclosure** — the company publishes the walk and its own basis-point figures; no sensitivity was applied by me. The two derived figures in this module are shown in full below.

**Derivation 1 — the Desenrola one-off, converted into risk-adjusted-NIM basis points.**

```
Desenrola: 5% × Q2'26 cost of credit US$1,691m  [Q2'26 Earnings Presentation slide 15;
           "about 5%" from Q2 2026 transcript, Q&A, CFO]
  = US$84.6m in the quarter → US$338.2m annualised
  Denominator basis, derived from the deck's own two published ratios and NOT imported
  from anywhere else: annualised NII 3,687 × 4 = 14,748; NIM 22.9% ⇒ interest-earning
  base = 14,748 / 0.229 = US$64,402m. Cross-check on the SAME base: annualised cost of
  credit 1,691 × 4 = 6,764 / 64,402 = 10.50%, and 22.9% − 10.5% = 12.4% = the published
  risk-adjusted NIM. The base reconciles exactly, so it is the deck's own denominator.
  = 338.2 / 64,402 = 52.5bps of the 115bps cost-of-credit component
  = 52.5 / 294 = 18% of the total 294bp QoQ expansion
  → basis matches (deck numerator, deck denominator, same quarter, consolidated)
```

That result is **consistent with**, not contradicted by, management's own characterisation: the CFO called Desenrola *"a minority of the impact"* of the 115bp cost-of-credit component — 52.5 of 115 is 46%, a minority [Q2 2026 transcript, Q&A]. It is also consistent with his separate statement that *"about 1/3 of that benefit relative to what we were expecting is coming from Desenrola"*, which is measured against plan, a different denominator, and must not be compared with the 18% figure above.

**Derivation 2 — the tax component of 7B.**

```
Tax rate effect: EBT margin 22.4245% × (retention 0.858269 − 0.724377)
                 [Q2'26 interim statements, statements of income — actual filed
                  tax and pre-tax figures for both quarters, not an assumed rate]
  = 22.4245% × 13.3892pp = +300.2bps of the +187.1bps observed net-margin change
  → basis matches (same statement, same two periods, consolidated, IFRS)
```

Note what this does NOT do: it does not apply management's guided 15–20% tax range, and it does not apply the Street's implied ~30% rate. Both are forecasts about a period that has not been filed. This bridge uses only rates that were actually paid.

**Reconciliation, 7A.** Components +5 +178 +115 −5 = **+293bps**. Stated total = **+294bps** (9.48% → 12.42%). **Explained 293bps, residual 1bps, total 294bps.** The 1bp residual is rounding in the disclosed walk, not an unexplained driver.

**Reconciliation, 7B.** Components −11.4 −13.3 +51.3 −134.4 −4.1 +300.2 −1.2 = **+187.1bps**. Stated total = **+187.1bps** (17.359% → 19.231%). **Explained 187bps, residual 0bps, total 187bps.**

**What the reconciliation licenses, and what it forbids.** Both bridges reconcile to within a rounding basis point, so Section 8 may name a single biggest driver. But it must name the *right* one: in 7B, the tax component alone (+300.2bps) is **160% of the entire observed change**, while every operating component together is **−112.0bps**. Any claim that Q2'26's net-margin expansion was operating-led is refuted by this arithmetic. Equally, 7A shows the operating story is real — but it lives **above** operating cost and tax, and it is one quarter old after a quarter that went the other way (−101bp in Q1'26).

```
RF-EARN-002: margin bridge reconciled — explained 187bps, residual 0bps, total 187bps
```

---

## 8. The Single Biggest Margin Driver

**Credit cost — the expected-credit-loss charge — is the driver that would compress margins most if it moved against the company, and its current direction is favourable but not run-rate.**

The size of the lever is disclosed, not inferred: it sits between a 22.9% NIM and a 12.42% risk-adjusted NIM, so on the company's own numbers roughly **46% of the interest margin is consumed by credit losses** before a single operating dollar is spent [Q2'26 Earnings Presentation, slide 15]. In the last two quarters it moved risk-adjusted NIM by **−263bp and then +115bp** — a 378bp round trip in six months, larger than every other component in the walk combined [Q2'26 Earnings Presentation, slide 16]. At the audited line the same swing is visible: expected credit loss was **34.58% of revenue in Q1'26 and 26.88% in Q2'26** [Q1'26 and Q2'26 interim statements].

Current direction is **improving, with three qualifications that must travel with it**. First, the Q2'26 improvement is partly a one-off: Desenrola cut cost of credit by about 5%, roughly 52bp of risk-adjusted NIM by the arithmetic in §7a, and **more than four-fifths of it has already been taken** [Q2 2026 transcript, Q&A]. Second, on a year-over-year basis the credit-cost *rate* is 160bp **worse**, not better (10.5% vs 8.9%) — the QoQ improvement is a recovery from a bad Q1, not a new low. Third, the delinquency series that feeds the charge is drifting: 90-plus-day non-performing loans rose 35bp to 6.9% in the quarter, and the CFO himself said that over two years *"the general trend is upwards, and that's being driven by the mix"* — a mix decision, not a season [Q2 2026 transcript, Q&A].

**Two other things must be said in the same breath, because a single-driver answer would otherwise mislead.** (a) Credit cost is the biggest driver of the metric management runs the company on, but it was **not** what compressed margin in FY2025. There, credit cost as a share of revenue actually **fell 86bp** and the funding-cost ratio rose **442bp** — FY2025's 361bp gross-margin compression was a rate shock, not a credit event [FY2025 Form 20-F, Item 5, p.176]. Anyone carrying "credit cost is the problem" back to FY2025 has the wrong cost line. (b) Credit cost is not what is currently moving the reported bottom line at all. **100% of Q2'26's net-margin expansion is the tax rate** (§7b), and pre-tax margin actually fell 155bp year on year. The margin driver that decides the print in the next two quarters is credit cost; the driver that decided the last one was tax.

**Cycle position (Cycle-Position Rule).** The latest reported quarter is at or very near the **top of this company's own margin history**, and is **not a normalised run-rate**. Evidence: risk-adjusted NIM of 12.42% is the highest in the six-quarter disclosed series and is called *"a record"*; return on equity of 33% is called a record; net income of US$1.1bn is a first [Q2'26 Earnings Presentation, slides 15–16; Q2 2026 transcript, prepared remarks]. It also carries a one-time policy tailwind (Desenrola, ~52bp of risk-adjusted NIM, four-fifths already booked) and a tax rate of 14.17% that is below management's own guided 15–20% floor. Against a **decade-high Brazilian policy rate** — Selic at 15.00% at the date of the annual filing, from 10.50% in May-2024 and 13.75% in Aug-2022 [FY2025 Form 20-F, Item 3 — risk factors, Brazilian macroeconomic conditions] — the funding-cost side is nearer a cyclical peak than a trough, which is a headwind now and a tailwind if rates fall.

**Young-entity caveat, per the rule.** NU's standalone disclosed margin history spans roughly one interest-rate cycle: the risk-adjusted NIM series in the deck runs only six quarters, and the company was loss-making as recently as FY2022. So "peak" here means peak of its own short record, inferred from the Brazilian consumer-credit and policy-rate cycle rather than from a full company cycle. **Reconciliation to business-model `10_external-dependency.md`:** that output scores external dependency 57/100 (inverted; higher = worse), classifies NU "Partly externally driven", and names credit cost as the single largest swing factor. I agree, and refine it in one place — its framing implies credit is the historic margin mover, whereas the FY2025 cost-line evidence above shows funding cost, not credit, caused the last full-year compression. That is a refinement, not a disagreement, and it is flagged rather than averaged.

**Testing the contradiction upstream `04` handed me, on the cost lines I own.** Consensus FQ3'26 implies an EBIT margin of 24.78% against 22.51% delivered in Q2'26 — **+227bp in one quarter** — while management's own FY26 efficiency-ratio guide of ~20% implies H2 cost ratios roughly **150–195bp worse** than Q2'26's 19.5% [`04_guidance-consensus.md` §3, arithmetic reproduced there]. Converting the efficiency-ratio move onto my basis: net revenues were US$4,132m against IFRS total revenue of US$5,513.2m in Q2'26, a ratio of **74.9%**, so 150–195bp on the efficiency ratio is roughly **112–146bp** on operating cost as a share of total revenue [Q2'26 Earnings Presentation, slide 22; Q2'26 interim statements]. For pre-tax margin to rise 227bp while operating cost worsens by that much, **IFRS gross margin must reach roughly 45.9%–46.3%** (42.56% + 339 to 373bp). NU has printed a gross margin at that level exactly once in the data I hold — the FY2024 full year, 45.61% — and never in a quarter in the filed series. That is a demanding requirement, not an easy one. Two honest caveats: the consensus EBIT line rests on 4 of 6 estimates and the revenue line on 4 of 8, so it is thin; and the conversion ratio of 74.9% is measured on Q2'26's own mix and would shift if the revenue mix moves. Conclusion on the cost lines I own: **the operating bar for Q3'26 is demanding, and the way it gets cleared is credit cost falling again, not operating cost.**

---

## 9. Investment Spend — Both Signs

**Trigger check first.** Physical capex is **not** currently running above its own history: H1'26 capex was US$100.5m against US$152.9m in H1'25, down 34% [Q2'26 interim statements, statements of cash flows]. FY2025 was the spike year — US$340.8m against US$175.0m in FY2024, +95%, almost entirely intangibles (US$333.6m) [FY2025 Form 20-F, statements of cash flows]. The spend that IS running well above its own history is (a) **operating expense**, +20% QoQ in Q2'26, and (b) the **expected-credit-loss charge and allowance build**, which for a lender is the economic equivalent of a capacity investment: it is paid before the revenue it creates arrives. Both signs are scored below.

| Reading | What it would show | Evidence here |
|---|---|---|
| **Spend as a future COST** | D&A step-up, the recognition lag, the cost line it lands in, and what it does to margin as it arrives | **D&A:** US$42.4m in Q2'26, +83.7% YoY against revenue +50.3%, so D&A/revenue rose 14bp to 0.77% — the trailing edge of FY2025's US$333.6m intangibles spend, landing in customer support and G&A [Q2'26 interim statements, Note 8; FY2025 Form 20-F, statements of cash flows]. **Operating cost:** opex US$806m in Q2'26, +20% QoQ, on *"real estate and marketing expenses shifted from the first quarter into the second, alongside our continued investments in international expansion"*; efficiency ratio worsened from 17.6% to 19.5% and management said flatly that *"the 17.6% reported in Q1 was not a run rate"*, roughly two-thirds of it timing [Q2 2026 transcript, prepared remarks]. **US entry:** a self-declared cap of *"less than 100 basis points on our consolidated efficiency ratio"* in each of 2026 and 2027, with a measured 100bp gap already visible in Q1'26 between the 17.6% reported and the 16.6% "core" excluding return-to-office, international expansion and AI infrastructure [Q1 2026 transcript, prepared remarks]. **Credit charge:** expected credit loss of US$1,482.2m in Q2'26 and US$3,200.2m in H1'26 — 26.9% and 30.5% of revenue [Q2'26 interim statements, Note 7] |
| **Spend as a DEMAND signal** | Backlog / bookings / contracted revenue, management's own supply-vs-demand language, whether capacity is sold before it is built | **The allowance build IS the booking.** Under IFRS 9 the loss is recognised at origination: *"we recognize expected credit losses at origination. So growth increases the allowance before the associated interest income is earned"* [Q2 2026 transcript, prepared remarks]. The allowance rose from US$6.1bn to US$6.6bn in Q2'26 and **the largest driver by far was portfolio growth, US$342m**, with intentional risk expansions a further US$170m and *"all other movements … immaterial"* [Q2 2026 transcript, prepared remarks]. So the charge is dominated by loans already written, not by loans going bad. **The lag is measured, not assumed.** Q2'26's +178bp credit-income contribution *"was driven by our strong loan growth in cards and unsecured lending in Q1"* — booking in one quarter, revenue in the next [Q2 2026 transcript, prepared remarks]. **The funding is already raised.** Deposits US$45.3bn, +18% YoY FX-neutral, against a loan-to-deposit ratio of 35% on the CFO's basis / 58% average on the deck's basis — the deposit base is well ahead of the loan book, so lending capacity is funded before it is used [Q2'26 Earnings Presentation, slides 14, 16; Q2 2026 transcript, prepared remarks]. **The book itself:** total credit portfolio US$39.4bn, +37% YoY FX-neutral [Q2'26 Earnings Presentation, slide 13]. **Management's own constraint language is demand-side, not supply-side:** *"we have 7% market share of that profit pool. So we're still a small player in that big market, and we get to cherry pick our customers"* [Q2 2026 transcript, Q&A — David Vélez], and the US entry is framed explicitly as *"a call option"* with additional investment *"contingent on clear evidence of product market fit"* [Q1 2026 transcript, prepared remarks] |

**Current read: the evidence favours the DEMAND reading for the credit charge, and the COST reading for operating expense — they are different spends and must not be scored as one.**

On the credit charge the demand sign is the better-evidenced one, and it has already been tested once: Q1'26 booked a US$1,718.0m charge (34.58% of revenue) and printed the year's worst margins (gross margin 37.54%, risk-adjusted NIM 9.48%); the very next quarter delivered a record risk-adjusted NIM of 12.42% and gross margin of 42.56%, with management attributing the credit-income step-up to the loans written in Q1 [Q1'26 and Q2'26 interim statements; Q2 2026 transcript, prepared remarks]. Reading Q1'26's provision only as a cost would have called a deterioration one quarter before a record. Management's own allowance bridge quantifies which sign dominates: **US$342m of the US$500m build was portfolio growth, US$170m deliberate risk expansion, everything else immaterial** — growth and choice, not decay.

On operating expense the cost sign dominates, on management's own words: 17.6% *"should not be extrapolated"*, the FY26 guide is ~20%, and H2 therefore has to run about 150–195bp worse than Q2'26. That is a stated headwind, not an ambiguity.

**The ONE observable that would flip the credit read from demand to cost:** the allowance build ceasing to be explained by portfolio growth. Concretely — in the Q3'26 disclosure (expected Nov-12-2026), if the allowance bridge shows **portfolio growth contributing materially less than the ~68% share it carried in Q2'26 (US$342m of ~US$500m)**, with the balance coming from stage migration or reserve strengthening rather than new lending, AND the 15-to-90-day delinquency ratio fails to improve once the disclosed seasonal effect (−37bp in Q2'26) is subtracted, then the charge is paying for losses rather than for growth, and the demand reading is dead. A second, cleaner tell on the same print: whether credit income steps up again with the one-quarter lag the company itself describes. If Q2'26's lending growth does not convert into Q3'26 credit income, the mechanism has broken.

---

## 10. Citations

All documents live in the frozen extract generation and are cited logically as `data/NU/`.

- **FY2025 Form 20-F (filed Apr-08-2026)** — Item 5 Operating and Financial Review: consolidated income statement FY2023–FY2025 (p.156); cost of financial and transactional services provided, component table and narrative (pp.175–177); operating-expense table (p.177). Item 4 — regulatory environment (Law 14,690/2023 revolving and instalment card charge cap; INSS payroll-loan cap indexed to Selic; payroll-loan market description). Item 3 — Brazilian macroeconomic risk factors (Selic path: 13.75% Aug-2022 → 10.50% May-2024 → 15.00% Jun-2025, and 15.00% at the date of the annual report). Notes 6, 34, 35(a). Consolidated statements of cash flows (capex).
- **Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026)** — statements of income, three and six-month periods ended Jun-30-2026 and 2025; Note 6(c) interest and other financial expenses; Note 6(d) transactional expenses; Note 7 expected credit loss; Note 8 operating (expenses) income incl. footnote (i); Note 33(a) prudential conglomerate capital; Note 34 segment information and 34(b) geography; Note 35 subsequent events; statements of cash flows.
- **Q1'26 unaudited interim condensed consolidated financial statements (filed May-14-2026)** — statements of income, three months ended Mar-31-2026 and 2025.
- **Q2'26 Earnings Presentation, Aug-13-2026** — slide 13 (credit portfolio and product mix), slide 14 (deposits and cost of deposits as % of interbank rate), slide 15 (NII, cost of credit, NIM, risk-adjusted NIM), slide 16 (risk-adjusted NIM QoQ walk and average LDR), slide 22 (net revenues, opex, efficiency ratio), slide 27 (LDR / funding definitions), slide 28 (ARPAC and cost to serve).
- **Q2 2026 earnings-call transcript, Aug-13-2026** (S&P Global, verbatim) — prepared remarks (deposits and cost of funding; NIM and cost of credit; risk-adjusted NIM bridge; early-delinquency bridge; allowance bridge; gross-profit composition; operating leverage and efficiency ratio) and Q&A (Desenrola sizing and timing; risk-adjusted NIM sustainability; NPL mix vs seasonality; US opex cap).
- **Q1 2026 earnings-call transcript, May-14-2026** (S&P Global, verbatim) — prepared remarks (efficiency ratio 17.6% reported / 16.6% core, one-third structural and two-thirds timing; FY26 ~20% guide; US opex headwind "less than 100 basis points" in each of 2026 and 2027; IFRS effective tax rate 15–20% for the remainder of 2026) and Q&A.
- **`ciq_facts.json`** (deterministic sidecar for this extract generation) — `ltm_ebitda_m` unknown; `segments_revenue` "Banking 6,991 (100%) of Total 6,991", status `present`.
- **Cross-module** — `analyses/NU_2026-09-06/business-model/02_business-identity.md` §3a (matched sector overlay and KPI checklist), `03_segment-map.md` (single reportable segment, geography and product disaggregation, Note-34 base exclusions), `06_value-chain.md` (pricing power), `10_external-dependency.md` (cyclicality, mitigation evidence, single biggest lever). **Upstream earnings** — `00_earnings-data-triage.md`, `01_historical-financials.md`, `04_guidance-consensus.md`.
- **Framework** — `frameworks/SECTOR_OVERLAYS.md`, Bank / lender row.

**Not used as a source for any number:** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` (verdict-bearing prior in-house memo, verdict stripped per CLAUDE.md §24).



---

## earnings / 04_guidance-consensus.md

_Source: `04_guidance-consensus.md`_

# Guidance & Consensus — NU

**Scope note.** NU (Nu Holdings Ltd., NYSE:NU, Class A ordinary shares, USD) is a US foreign private issuer reporting under IFRS with a 31-December fiscal year (`FY2025 Form 20-F, cover page, filed Apr-08-2026`). Every number below is in USD on an IFRS basis. The pool's prior in-house memo (`NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf`) is verdict-bearing; its verdict, target price and expected return are stripped per CLAUDE.md §24 and it is used as a source for nothing here. The Capital IQ consensus export carries a sell-side recommendation and a mean target price; both are analyst verdicts and are deliberately not carried forward.

**One correction to upstream triage, stated by name.** `00_earnings-data-triage.md` §5 records "No formal numeric guidance… the company issues no quantitative guidance in this pool." That is not correct as written, and the difference matters for this agent's whole job. The Q2'26 call does contain no *revenue or EPS* guidance, and the word "guidance" does appear zero times — but management gave **four explicit numeric forward statements** across the Q1'26 and Q2'26 calls, one of them framed literally as "for modeling purposes". They are set out in Section 2, and one of them (the tax rate) turns out to be the single largest gap versus the Street. Triage is right that there is no revenue/EPS guidance to test; it is wrong that there is nothing quantitative.

---

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | **Capital IQ Estimates export** (pool workbook `NuHoldingsLtdNYSENUEstimatesReport.xls`, tabs Consensus / Trends / Revisions / Recent Changes / Surprise). Pool export — not web-sourced, not from memory |
| Data as of date | Latest broker revision dated **Aug-26-2026**; workbook header carries the FQ3'26 release date of Nov-12-2026 (`Capital IQ Estimates→Recent Changes, top row 2026-08-26`; `Capital IQ Estimates→Consensus, header`) |
| Fiscal year basis | Fiscal year ends **Dec-31-2026**, matching the company's own fiscal year (`Capital IQ Estimates→Consensus — "Current Fiscal Year End: Dec-31-2026"`; `FY2025 Form 20-F, year ended Dec-31-2025`) |
| Analyst count | Varies by line. FY2026 EPS (GAAP) **16/16**; FQ3'26 EPS (GAAP) **9/9**; FQ3'26 net income **7/7**; FQ3'26 revenue **4/8**; FQ3'26 EBIT **4/6**; FQ3'26 effective tax rate **2/2** (`Capital IQ Estimates→Consensus, "No. of Estimates" rows`) |
| Currency | **USD**, IFRS, consolidated (`Capital IQ Estimates→Consensus — "Acctg. Standard: IFRS"`, "Consolidation: Consolidated") |
| Calendarization issue? | **N** — vendor fiscal year matches the company's. A separate *reporting-basis* question (standalone quarter vs cumulative) is resolved in Section 1A |

**Staleness check.** The latest reported quarter is Q2 2026, released Aug-13-2026. The consensus revisions run to Aug-26-2026 — after the print. Consensus has absorbed the latest quarter, so the stale-consensus guard does **not** apply and the bar verdict below is not provisional.

**Cross-check to the deterministic facts sidecar.** `ciq_facts.json` reports `eps_revisions` = "EPS (GAAP) FY 2026: 8↑/0↓ last mo" and `revenue_revisions` = "Revenue FY 2026: 5↑/2↓ last mo", both `status: present`. My own read of the Revisions tab returns exactly those counts (Section 5). No gap to flag.

---

## 1A. Reporting-Basis Reconciliation (mandatory — CLAUDE.md §27)

NU is a foreign private issuer, so there is no 10-Q. It publishes an earnings release plus **unaudited interim condensed consolidated financial statements**. The question this section answers: is the vendor's "FQ3 2026" estimate the number the company will actually print?

| Field | Value |
|---|---|
| Next period the company will actually FILE | **Q3 2026** — the three-month period ended Sep-30-2026, filed together with the nine-month period ended Sep-30-2026 |
| Expected filing date + source for that date | **Nov-12-2026** (`Capital IQ Estimates→Consensus, header — "FQ3 2026 Earnings Release Date: Nov-12-2026"`; corroborated by `Capital IQ Events Calendar export, timeframe 2026`) |
| What that filing contains | **Both, side by side.** The last filing is titled "Unaudited Interim Condensed Consolidated Statements of Income — For the three and six-month periods ended June 30, 2026 and 2025", with four columns: three-month 2026, three-month 2025, six-month 2026, six-month 2025 (`Q2'26 interim condensed consolidated financial statements, statements of income, filed Aug-14-2026`). Q3'26 will follow the same shape with three-month and nine-month columns |
| Vendor estimate as pulled (period label + value) | **FQ3 2026 – Sep 2026, standalone quarter:** revenue mean **5,936.74m USD** (4/8 estimates); EPS (GAAP) mean **0.22164 USD** (9/9); net income (GAAP) mean **1,057.35m USD** (7/7) (`Capital IQ Estimates→Consensus, Fiscal Quarters block`) |
| Already-reported stub inside that period (period + actuals + citation) | For the **standalone quarter** bar: **none** — Q3 is a fresh three-month period. For the **nine-month cumulative** column in the same filing: H1 2026 actual revenue **10,481.175m**, diluted EPS **0.3936**, net income to parent **1,932.255m** (`Q2'26 interim condensed consolidated financial statements, statements of income, six-month period ended 06/30/2026`) |
| **Consensus restated onto the filing basis** — arithmetic | **Standalone Q3'26 bar = 5,936.74m revenue / 0.2216 diluted EPS** — no restatement needed (stub = 0). **Nine-month 2026 bar = 10,481.175 + 5,936.74 ≈ 16,417.9m revenue; 0.3936 + 0.22164 ≈ 0.6152 diluted EPS** |
| Basis-restated bar vs the same period a year earlier | Standalone: Q3'25 actual revenue 4,173.0m, EPS 0.1595 → the bar is **+42.3% revenue / +39.0% EPS YoY**. Nine-month: 9M'25 revenue ≈ 6,916.159 (filing, six months to 30-Jun-2025) + 4,173.0 (vendor Q3'25 actual) ≈ 11,089.2m; 9M'25 EPS ≈ 0.2439 + 0.1595 = 0.4034 → the bar is **+48.1% revenue / +52.5% EPS YoY** (mixed-source comparator: filing for H1, vendor for Q3 — labelled, not blended silently) |

**Proof the vendor is on the standalone-quarter basis (not cumulative).** The vendor's FQ2 2026 "Actual" cells read revenue **5,513.208m** and EPS (GAAP) **0.2162**. The filing's **three-month** column reads total revenue **US$5,513,208 thousand** and **diluted** EPS **US$0.2162**; its six-month column reads 10,481,175 and 0.3936 (`Q2'26 interim condensed consolidated financial statements, statements of income`). The vendor matches the three-month column exactly, and matches *diluted* rather than basic EPS (basic was 0.2183). So Capital IQ's quarterly fields are standalone-quarter, diluted-EPS figures, and the FQ3'26 estimate is directly comparable to the headline quarter NU will report.

**Sanity ratio.** Restated nine-month bar ÷ already-reported stub = 16,417.9 ÷ 10,481.2 = **1.57**. Three quarters over two quarters should be roughly 1.5, not roughly 1.0 — the conversion was performed. (For EPS the same check gives 0.6152 ÷ 0.3936 = 1.56.)

Every "bar" figure used below is labelled with its basis: **standalone Q3'26** unless explicitly marked nine-month or full-year.

---

## 2. Management Guidance

NU **does not provide formal revenue, earnings or capex guidance**, and publishes no guidance slide: the Q2'26 earnings presentation contains no outlook page beyond the standard forward-looking-statements legal text (`Q2'26 Earnings Presentation, Aug-13-2026`), and the Q2'26 call contains no revenue or EPS number for any future period. Management said so directly when asked for a growth number: *"I won't necessarily give you a specific number of growth, but we continue to see the conditions to continue growing and taking share"* (`Q2 2026 earnings-call transcript, Aug-13-2026, Q&A — David Vélez`).

What management **did** give is a small set of numeric *modelling* parameters, plus qualitative direction. All of it is call-derived; the calls are verbatim S&P Global transcripts, so no sell-side proxy is used and no proxy cap applies.

| Metric | Period | Guidance | Type | Source |
|---|---|---|---|---|
| Revenue | — | **None given** | — | `Q2 2026 transcript, Aug-13-2026` (no figure); `Q2'26 Earnings Presentation` (no outlook page) |
| EBITDA / EBIT | — | **None given.** NU reports on a bank template and discloses no EBITDA line at all (`ciq_facts.json` `ltm_ebitda_m` = unknown, "Income Statement sheet has no 'EBITDA' row") | — | as above |
| EPS | — | **None given** | — | as above |
| Capex | — | **None given** | — | as above |
| **Efficiency ratio** (operating costs ÷ net revenues — how many cents of cost it takes to earn a dollar of net revenue; lower is better) | **FY2026** | **"approximately 20%"**, reiterated three months later as *"we continue to expect the efficiency ratio for the full year to average about 20%"* | **Point** | `Q1 2026 earnings-call transcript, May-14-2026, prepared remarks`; reiterated `Q2 2026 earnings-call transcript, Aug-13-2026, prepared remarks` |
| **IFRS effective tax rate** (the share of pre-tax profit paid in tax) | **Remainder of 2026** | *"For modeling purposes, we expect our IFRS ETR for the remainder of 2026 to converge towards the **15% to 20% range**"* — **midpoint 17.5%**. Management separately flagged a "managerial ETR" converging toward 30–35%, which it called the more economically meaningful comparison | **Range** (midpoint 17.5%) | `Q1 2026 earnings-call transcript, May-14-2026, prepared remarks — Rob Livingston, CFO` |
| **US expansion cost drag** | **2026 and 2027, each** | *"the maximum OpEx headwind we expect from U.S. investment in each of 2026 and 2027 is **less than 100 basis points** on our consolidated efficiency ratio"* — and stated to sit inside the ~20% efficiency-ratio level | **Range cap** (upper bound) | `Q1 2026 earnings-call transcript, May-14-2026, prepared remarks` |
| **Risk-adjusted net interest margin** (interest margin after credit losses) | **"foreseeable future"** | *"we see it as being in the same region as where we are today. We think that it is sustainable."* Today = **12.42%** (`Q2'26 Earnings Presentation, risk-adjusted NIM walk`). The CFO expressly refused to call 12% a floor: *"I didn't say that it was a floor. I said we'd be in that ballpark."* | **Qualitative, anchored to a reported number** | `Q2 2026 earnings-call transcript, Aug-13-2026, Q&A` |

Two caveats on the guided items, both material:

1. **The tax guide was given once and has not been repeated.** It was stated on May-14-2026 and does not appear anywhere in the Aug-13-2026 call — the words "ETR", "effective tax" and "tax rate" appear zero times in the Q2'26 transcript. It was, however, validated by outcome: Q2'26 income taxes of **175,224** on income before income taxes of **1,236,313** is an actual IFRS rate of **14.2%** — below the low end of the guided 15–20% range (`Q2'26 interim condensed consolidated financial statements, statements of income, three-month period ended 06/30/2026`).
2. **Midpoints, as required.** Efficiency ratio is a point (~20%), so no midpoint arithmetic. The tax range midpoint is (15% + 20%) ÷ 2 = **17.5%**. The US-cost item is a one-sided cap ("less than 100bps"), so its midpoint is not meaningful and it is treated as an upper bound only.

**What the efficiency-ratio guide implies for the part of the year not yet reported** (CLAUDE.md §17 — do the arithmetic). Reported quarterly efficiency ratios: Q1'25 21.4%, Q2'25 21.3%, Q3'25 20.3%, Q4'25 19.9%, **Q1'26 17.6%, Q2'26 19.5%** (`Q2'26 Earnings Presentation, slide 22 "Net Revenues & Opex · Efficiency Ratio %"`, with opex US$648m/US$806m over net revenues US$3,672m/US$4,132m). On the ratio-of-sums basis the company itself defines, H1'26 = (648 + 806) ÷ (3,672 + 4,132) = **18.63%**. On a simple average of the two quarterly ratios it is 18.55%. For the full year to land at ~20% on either basis, **H2'26 has to run at roughly 21.0–21.5%** — a step up of about **150–195 basis points** from the 19.5% just printed. In plain terms: management's own guide says costs should rise faster than net revenues in the second half. Hold that thought for Section 3.

---

## 3. Guidance vs Consensus Table

Gap = Consensus minus Guidance (positive = Street above guidance). Guidance basis = midpoint where a range was given.

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Revenue | Q3'26 / FY26 | **No guidance** | 5,936.74m (Q3'26 standalone); 22,907.99m (FY26) | n/a | Not comparable — no guidance issued |
| EBITDA / EBIT | Q3'26 / FY26 | **No guidance** (no EBITDA disclosed) | EBIT 1,471.20m (Q3'26, 4/6 est.); 5,404.43m (FY26) | n/a | Not comparable — no guidance issued |
| EPS | Q3'26 / FY26 | **No guidance** | 0.22164 (Q3'26 diluted); 0.8482 (FY26) | n/a | Not comparable — no guidance issued |
| **Efficiency ratio** | FY2026 | **~20%** (point) | **No consensus line** — Capital IQ carries no efficiency-ratio estimate for NU, and its components (opex; net interest income + fee income net of transactional cost and revenue-based taxes) are not separately estimated, so it cannot be rebuilt without assumptions | **Not computable** | Not comparable — no consensus estimate exists for the metric management actually guided |
| **IFRS effective tax rate** | **H2 2026** | **15–20%, midpoint 17.5%** | **≈30.2% implied** by the FY26 consensus pair (arithmetic below); the vendor's own explicit quarterly tax line reads **31.25%** for both FQ3'26 and FQ4'26 (2/2 estimates) | **+12.7pp** (30.2% − 17.5%) | **Street far ABOVE guidance** — i.e. the Street assumes NU pays roughly twice the tax rate management guided |

**The tax arithmetic, shown in full.** FY2026 consensus pre-tax profit (EBT, GAAP) = **5,384.98m**; FY2026 consensus net income (GAAP) = **4,160.53m** (`Capital IQ Estimates→Consensus, Fiscal Years block, FY2026`). H1'26 actuals from the filing: pre-tax **2,190.619m**, tax **258.099m** (an 11.78% rate), net income to parent **1,932.255m** (`Q2'26 interim condensed consolidated financial statements, six-month period ended 06/30/2026`). Therefore what consensus embeds for H2'26:

- H2 pre-tax = 5,384.98 − 2,190.62 = **3,194.36m**
- H2 net income = 4,160.53 − 1,932.26 = **2,228.27m**
- H2 tax = 3,194.36 − 2,228.27 = **966.09m** → **implied H2 IFRS effective tax rate = 966.09 ÷ 3,194.36 = 30.2%**

Against a guided 15–20%, an 11.8% rate actually delivered in H1'26, and a 14.2% rate in Q2'26 alone. The same gap shows in the single quarter: consensus FQ3'26 pre-tax 1,406.02m against consensus FQ3'26 net income 1,057.35m implies a **24.8%** rate (1 − 1,057.35 ÷ 1,406.02), and the vendor's explicit tax-rate line says **31.25%**.

**Why this is a like-for-like comparison, and how it could be wrong.** Management drew a distinction between its IFRS ETR (guided 15–20%) and a "managerial ETR" (30–35%), so a reader could reasonably ask whether the Street is simply modelling the managerial basis — in which case there is no gap at all. Three things say it is not: the vendor workbook is labelled "Acctg. Standard: IFRS" throughout; the vendor's own *actual* for FQ1'26 on that same tax line is **8.6843%**, which is the IFRS rate the company reported, not a managerial one; and the vendor's net income line is "Net Income (GAAP)", whose FQ1'26 and FQ2'26 actuals (872.056m, 1,060.199m) are the IFRS numbers in the filing. So the comparison is on the vendor's own stated basis. **This remains the main way this finding could be wrong** — if analysts are deliberately taxing NU at a managerial rate inside an IFRS-labelled field, or if they simply disbelieve that the corporate-structure change is durable, then the gap is a modelling convention rather than a mispriced bar. The tax line is also thin: 2 of 2 estimates.

**A second, smaller tension, named explicitly.** Consensus FQ3'26 EBIT of 1,471.20m on revenue of 5,936.74m is a **24.78%** operating margin, against **22.51%** actually delivered in Q2'26 (EBIT 1,240.976m ÷ revenue 5,513.208m) — the Street is asking for **+227 basis points** of margin expansion in one quarter. Management's own FY efficiency-ratio guide points the other way, implying H2 cost ratios of roughly 21.0–21.5% versus 19.5% in Q2'26. On this line the bar looks demanding, not soft. (Reconciliation note so the EBIT figure is not misread: Capital IQ's "EBIT" actual for FQ2'26 of 1,240.976m equals the filing's income before income taxes of 1,236.313m plus the 4.663m share of loss in associates — it is a pre-tax measure, not an operating-profit-before-interest measure, because NU's interest expense is a cost of revenue for a lender.)

---

## 4. Estimate Revision Momentum Table

Capital IQ publishes trend snapshots at 1 / 2 / 3 / 6 / 9 / 12 months ago, not at 30 / 60 / 90 days. The columns below map the vendor's 3-months-ago → "90 days", 2-months-ago → "60 days", 1-month-ago → "30 days". All figures `Capital IQ Estimates→Trends`, data as of Aug-2026. Revenue in USD millions; EPS (GAAP, diluted) in USD. The vendor rounds its EPS trend cells to two decimals, so small moves are invisible on the EPS rows — the precise current means are given in the note beneath.

| Estimate | 90 Days Ago | 60 Days Ago | 30 Days Ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue — next quarter (FQ3'26) | 5,545.80 | 5,545.47 | 5,531.80 | **5,936.74** | **Rising** — +7.3% in one month |
| EPS — next quarter (FQ3'26) | 0.22 | 0.21 | 0.21 | **0.22** | **Flat to slightly rising** |
| Revenue — current FY (FY2026) | 21,937.49 | 22,347.88 | 22,319.45 | **22,907.99** | **Rising** — +2.6% in one month, +4.4% in three |
| EPS — current FY (FY2026) | 0.83 | 0.82 | 0.81 | **0.85** | **Rising** — +4.9% in one month |
| Revenue — next FY (FY2027) | 26,273.69 | 27,071.85 | 27,254.63 | **27,655.05** | **Rising** — +5.3% in three months |
| EPS — next FY (FY2027) | 1.10 | 1.08 | 1.07 | **1.11** | **Rising** |

Precise current means (`Capital IQ Estimates→Consensus`): FQ3'26 EPS **0.22164**; FY2026 EPS **0.8482**; FY2027 EPS **1.11006**; FQ3'26 revenue **5,936.7375m**; FY2026 revenue **22,907.99m**; FY2027 revenue **27,655.05m**.

The jump is concentrated in the month after the Aug-13-2026 print, which is what one would expect: the FQ3'26 revenue line moved 5,531.80 → 5,936.74 (+7.3%) and FY2026 EPS 0.81 → 0.85 (+4.9%) inside four weeks. This is a bar that has just been raised, not one that has been cut.

---

## 5. Revision Breadth

All from `Capital IQ Estimates→Revisions`, "Last Month" window, data through Aug-26-2026. "Net" = upward minus downward. NU discloses no EBITDA, so the EBITDA row is replaced by EBIT, which is what the vendor actually collects.

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue FY2026 | 5 | 2 | **+3** (of 7 analysts) | Last month |
| EBIT FY2026 (EBITDA not disclosed) | 3 | 2 | **+1** (of 5) | Last month |
| EPS (GAAP) FY2026 | 8 | 0 | **+8** (of 14) | Last month |
| Net income (GAAP) FY2026 | 11 | 0 | **+11** (of 18) | Last month |
| Revenue FQ3'26 | 3 | 0 | **+3** (of 3) | Last month |
| EPS (GAAP) FQ3'26 | 4 | 0 | **+4** (of 7) | Last month |
| Net income (GAAP) FQ3'26 | 4 | 0 | **+4** (of 6) | Last month |
| Revenue FY2027 | 4 | 3 | **+1** (of 9) | Last month |
| EPS (GAAP) FY2027 | 7 | 0 | **+7** (of 14) | Last month |

Not a single downward EPS or net-income revision in the last month at either the FY2026, FY2027 or FQ3'26 level. Three months ago the picture was materially worse (FY2026 EPS 6↑/3↓; FY2026 net income 8↑/6↓), so the breadth turned decisively positive on the Q2'26 print. Two lines are moving the other way and are named rather than buried: **book value per share FY2026 was 3↑/4↓** and **the FY2026 effective tax rate was revised UP** (broker 31.4% → 32.2%, consensus 27.3% → 27.41%, `Capital IQ Estimates→Recent Changes, 2026-08-25 and 2026-08-26`). The Street is raising its earnings numbers while simultaneously assuming NU pays *more* tax — which widens, not narrows, the gap identified in Section 3.

---

## 6. Historical Beat / Miss Pattern

Actual vs the final pre-print consensus estimate, both from `Capital IQ Estimates→Surprise` (quarterly block). Revenue and net income in USD millions; EPS (GAAP, diluted) in USD. Percentages are my own arithmetic on the vendor's actual and estimate cells, not the vendor's rounded surprise column. Q1'26 and Q2'26 actuals are independently confirmed against the primary filings.

| Period | Revenue Beat/Miss | EPS Beat/Miss | Magnitude | Notes |
|---|---|---|---:|---|
| Q3'25 (announced Nov-13-2025) | Beat — 4,173.0 vs 4,038.96 | Beat — 0.1595 vs 0.15359 | Rev **+3.3%**, EPS **+3.8%**, NI **+4.4%** | Broad-based beat |
| Q4'25 (announced Feb-25-2026) | Beat — 4,685.87 vs 4,550.75 | **Miss** — 0.1815 vs 0.18442 | Rev **+3.0%**, EPS **−1.6%**, NI **−4.0%** | Revenue beat, profit missed — costs and provisions |
| Q1'26 (announced May-14-2026) | **Miss** — 4,967.97 vs 5,059.87 | **Miss** — 0.1776 vs 0.18736 | Rev **−1.8%**, EPS **−5.2%**, NI **−6.0%** | Both missed; confirmed against `Q1'26 interim condensed consolidated financial statements, filed May-14-2026` |
| Q2'26 (announced Aug-13-2026) | Beat — 5,513.21 vs 5,479.92 | **Beat** — 0.2162 vs 0.19127 | Rev **+0.6%**, EPS **+13.0%**, NI **+12.6%** | Confirmed against `Q2'26 interim condensed consolidated financial statements` (revenue 5,513,208; diluted EPS 0.2162; net income to parent 1,060,199) |

**What actually produced the Q2'26 beat — the arithmetic, with the residual named (§15).** It was almost entirely tax, not operations:

- Pre-tax: actual 1,236.313 vs final consensus 1,230.683 → **+5.63m, +0.5%**. Essentially on the estimate.
- Net income: actual 1,060.199 vs final consensus 941.273 → **+118.93m, +12.6%**.
- Counterfactual: take the consensus pre-tax estimate of 1,230.683 and tax it at the rate NU actually paid (14.17%) → 1,230.683 × 0.8583 = **1,056.30m**, which is 115.03m above the 941.27m consensus.
- **Explained by the tax rate: 115.03 ÷ 118.93 = 96.7% of the beat. Residual: +3.90m (3.3%)**, being the small pre-tax beat plus rounding. 115.03 + 3.90 = 118.93 ✓.

So of a 12.6% net-income beat, roughly 97% came from analysts modelling too high a tax rate. That is the same modelling gap that is still sitting in the FQ3'26 and FY2026 numbers.

**Base-rate honesty (§10).** Four observations — two EPS beats, two EPS misses — is not a measured frequency. Any statement about "how often NU beats" from this table is judgment informed by a four-observation sample, and is treated as such below.

---

## 7. Bar Assessment

**Bar is low.**

The one line where a management number and a Street number can actually be compared is tax, and the gap is wide and one-directional: consensus embeds a **30.2% IFRS effective tax rate for H2 2026** (derived above from FY26 consensus pre-tax of 5,384.98m and net income of 4,160.53m against filed H1 actuals), and the vendor's explicit quarterly line reads **31.25%**, against management's "for modeling purposes" guide of **15–20%** and an **11.8%** rate actually filed for H1'26 and **14.2%** for Q2'26 alone. Holding the Street's own pre-tax estimate constant and taxing it at the 17.5% guided midpoint instead of the embedded 30.2% adds **3,194.36 × (0.825 − 0.698) ≈ 407m** to H2 net income — FY2026 net income of ~4,568m against consensus 4,161m, about **+9.8%**, with no help at all from revenue, credit costs or expenses. At the 14.2% rate NU actually just delivered, the same arithmetic gives roughly **+12.3%**. This is not a hypothetical mechanism: it is exactly what produced the Q2'26 print, where 96.7% of a 12.6% net-income beat came from the tax line while pre-tax profit landed within 0.5% of the estimate.

**The evidence pointing the other way, adjudicated by name rather than averaged out.** Two things argue the bar is *not* low. First, estimates have just been raised hard: FQ3'26 revenue went 5,531.80 → 5,936.74m (+7.3%) in one month, FY2026 EPS 0.81 → 0.85 (+4.9%), and breadth was 8↑/0↓ on FY2026 EPS and 11↑/0↓ on FY2026 net income — a rising bar, not a cut one. Second, the FQ3'26 EBIT consensus of 1,471.20m on 5,936.74m of revenue implies a **24.78%** margin versus **22.51%** delivered in Q2'26, a **+227bp** step-up that runs directly against management's own guide that the FY26 efficiency ratio averages ~20% when H1 came in at 18.63% — which requires H2 cost ratios of roughly **21.0–21.5%**, about 150–195bp *worse* than Q2'26. Neither overturns the verdict, and here is why: both sit **above** the tax line. The raised revenue estimates and the demanding EBIT margin both affect pre-tax profit, and pre-tax is the line where NU has been landing close to consensus (+0.5% in Q2'26, −0.3% in Q1'26 on the revenue line). The 12.7-percentage-point tax gap sits *below* pre-tax, is roughly twice the size of the margin tension in profit terms, and has already converted into a beat once. The honest shape of the setup is therefore: **the operating bar for Q3'26 is fair-to-demanding, the tax bar is clearly too high, and the tax bar is the bigger number.**

**What would make this call wrong**, stated plainly: if analysts are deliberately taxing NU at its "managerial" 30–35% rate inside a field the vendor labels IFRS — a convention rather than a mistake — the gap disappears. The vendor's own FQ1'26 tax actual of 8.68% (the IFRS figure) argues against that, but it is 2 estimates on that line. The tax guide is also three months old, was not repeated on the Aug-13-2026 call, and depends on a corporate-structure arrangement that a tax-law change in Brazil or elsewhere could reverse; the CFO called it "a recurring structural feature", which is a management claim, not an audited one.

---

**Partial-data caps.** None applied. The consensus came from a pool Capital IQ export (not web, not memory), it post-dates the latest reported quarter, and full revision history is present — so neither the no-consensus cap (max 30), the staleness haircut, nor the no-revision-history cap (max 60) binds. The transcript role is filled by verbatim S&P Global transcripts, so no sell-side-proxy cap applies. The absence of formal revenue/EPS guidance is a disclosure fact about how NU communicates, not a missing document, and carries no cap.

**Section 3A (alt-data cross-check) is omitted.** The frozen pool contains no `external/` folder and no manifest row carrying `external: true`, so there is no licensed alt-data panel to cross-check against. Its absence is not a gap.



---

## earnings / 05_beat-miss-setup.md

_Source: `05_beat-miss-setup.md`_

# Beat / Miss Setup — NU

**Reporting basis.** Nu Holdings Ltd. (NYSE:NU, Class A ordinary shares, USD) is a US-listed **foreign private issuer** reporting under **IFRS Accounting Standards** in **US dollars**, fiscal year ending 31 December. There is no 10-Q; the interim disclosure is an unaudited interim condensed consolidated financial statement furnished to the SEC, and its absence of US form names is not a data gap (CLAUDE.md §27). All figures are US$ unless stated.

**All four required upstream outputs were read** (`01_historical-financials`, `02_revenue-drivers`, `03_margin-drivers`, `04_guidance-consensus`), plus `06_earnings-quality` and `00_earnings-data-triage`. Nothing is missing, so no degraded-confidence note applies.

**The one-line summary of this whole report: the beat/miss engine for NU is the TAX line, not revenue and not costs.** Revenue has landed within ±3.3% of consensus in seven of the last eight quarters. Pre-tax profit is where the operating volatility lives. But the number that converts either of those into a reported EPS beat or miss is the effective tax rate — the share of pre-tax profit paid in tax — and the Street's estimate of it is between 11 and 17 percentage points above what NU has actually filed in each of the last three quarters. Section 2 sizes it.

**Prior in-house memo.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is in the pool and is verdict-bearing. Its verdict is stripped (CLAUDE.md §24) and **no number in this report comes from it**.

---

## 1. Next Reporting Period Context

The next thing NU actually files is **Q3 2026 — the three-month period ended Sep-30-2026, published alongside a nine-month cumulative column, expected Nov-12-2026** (`Capital IQ Estimates→Consensus, header — "FQ3 2026 Earnings Release Date: Nov-12-2026"`). Upstream `04` §1A resolved the reporting-basis question that CLAUDE.md §27 requires, and I carry its finding verbatim with its basis label:

> **Standalone Q3'26 bar = 5,936.74m revenue / 0.2216 diluted EPS** — no restatement needed (stub = 0). **Nine-month 2026 bar = 10,481.175 + 5,936.74 ≈ 16,417.9m revenue; 0.3936 + 0.22164 ≈ 0.6152 diluted EPS** (`04_guidance-consensus.md` §1A).

The restatement question is genuinely live for a foreign private issuer, so I independently re-verified the proof rather than accept it: the vendor's FQ2'26 "Actual" cells read revenue **5,513.208m** and diluted EPS **0.2162**, which match the filing's **three-month** column exactly and match *diluted* rather than basic EPS (basic was 0.2183) (`Capital IQ Estimates→Surprise, quarterly block, FQ2 2026`; `Q2'26 interim condensed consolidated financial statements (filed Aug-14-2026), statements of income, three-month period ended 06/30/2026`). Capital IQ's quarterly fields are therefore **standalone-quarter, diluted-EPS** figures, directly comparable to the headline quarter NU will print. **No standalone-quarter estimate is used anywhere below as the bar for a cumulative print.**

Is Q3 seasonally important? On the evidence, **not as a standalone effect**. `01` §5 measured a three-year average Q3 revenue share of 26.2% against Q2's 23.8%, but concluded the within-year gradient is compounding growth rather than a demand season, and that no quarter breaches the >30% / <20% flags — its exact words are that seasonality "is **not proven from available data**". That qualifier travels (§6 below revisits the one series where it does not fully apply, quarterly net margin).

**Where the bar sits on each line (all standalone Q3'26, `Capital IQ Estimates→Consensus, Fiscal Quarters block, data as of Aug-26-2026`):** revenue **5,936.74m** (4 of 8 analysts, high 6,077.35 / low 5,779.60, std. dev. 138.16); income before income taxes, the vendor's "EBT (GAAP)", **1,406.02m** (5 of 6, high 1,622 / low 1,280, std. dev. 120.34); net income (GAAP) **1,057.35m** (7 of 7, high 1,167 / low 896, std. dev. 78.05); diluted EPS (GAAP) **0.22164** (9 of 9, high 0.25 / low 0.18, std. dev. 0.01891); and an explicit **effective tax rate of 31.25%** (2 of 2).

---

## 2. Beat Scenarios

Likelihood words are mapped to CLAUDE.md §10 numeric bands and each carries its basis: **High** = likely or better (≥60%); **Mid** = toss-up (45–60%); **Low** = unlikely (25–45%).

| Scenario | Driver | What Would Need To Happen | Likelihood | Evidence |
|---|---|---|---|---|
| **B1. The tax gap converts again — the central beat case** | Effective tax rate (`03` §5, the driver it sized at **+300bp, i.e. 100% of Q2'26's net-margin expansion**) | Pre-tax profit lands at or near the 1,406.02m consensus **and** the filed IFRS effective tax rate comes in at the guided 15–20% rather than the ~24.8% the consensus pair embeds. At the guided midpoint of 17.5% that alone is net income of **1,159.97m vs a 1,057.35m bar = +9.71%**, EPS **0.2432 vs 0.2216**. At the 14.17% NU actually filed in Q2'26 it is **1,206.80m, +14.13%**, EPS **0.2530** — above the highest single estimate in the 9-analyst panel (0.25) | **High** (≥60%). Basis: **empirical, n=8, window Q3'24–Q2'26** — applying Q2'26's filed 14.17% rate to each quarter's *realised* pre-tax would have produced a net-income beat in **6 of those 8 quarters**; see the cushion arithmetic in §4. Sample sits at the doctrine's minimum of "roughly eight", so this is a weak measured frequency, not a stable base rate, and the two failures are clustered in the two quarters immediately before Q2'26 | Guide: *"For modeling purposes, we expect our IFRS ETR for the remainder of 2026 to converge towards the **15% to 20% range**"* (`Q1 2026 earnings-call transcript, May-14-2026, prepared remarks — CFO`). Filed rates: **16.97% (Q4'25), 8.68% (Q1'26), 14.17% (Q2'26)** (`Capital IQ Estimates→Consensus, quarterly "Effective Tax Rate %" actuals`; Q2'26 verified to `Q2'26 interim statements, statements of income` — tax 175,224 on pre-tax 1,236,313). Street bar: explicit **31.25%** for FQ3'26 (2/2 estimates), and **24.80%** implied by the FQ3'26 pre-tax/net-income pair (1 − 1,057.35 ÷ 1,406.02) |
| **B2. The credit-cost lag delivers again** | Credit cost / expected credit loss — the driver `03` §8 named as the single biggest margin lever | Q2'26's lending growth converts into Q3'26 credit income on the one-quarter lag management itself describes, while the credit charge stays near Q2'26's 26.88% of revenue rather than reverting toward Q1'26's 34.58%. That would deliver the ~+126bp of pre-tax margin the consensus needs (see §3, M2) without any help from operating cost | **Mid** (45–60%). Basis: **judgment**, informed by one observed instance of the mechanism (Q1'26 booking → Q2'26 credit income, +178bp) plus a residual policy tailwind. One instance is not a base rate | *"we recognize expected credit losses at origination. So growth increases the allowance before the associated interest income is earned"*; the +178bp credit-income step-up *"was driven by our strong loan growth in cards and unsecured lending in Q1"* (`Q2 2026 earnings-call transcript, Aug-13-2026, prepared remarks`). Residual Desenrola tail: *"a little bit more impact… in Q3"* (`Q2 2026 transcript, Q&A`) |
| **B3. The pre-tax margin bar is undemanding on a year-over-year basis** | Pre-tax (EBT) margin | Nothing new has to happen. The Q3'26 consensus EBT margin is **23.68%** (1,406.02 ÷ 5,936.74) against **26.75%** actually delivered in Q3'25 (1,116.289 ÷ 4,173.0) — the Street is asking for pre-tax margin **307 basis points LOWER** than the year-ago quarter. The consensus gross margin of **43.17%** likewise sits **31bp below** Q3'25's actual 43.48% | **Mid** (45–60%). Basis: **judgment**. The like-for-like comparison is arithmetic, but Q3'25 was itself an unusually good quarter (EBT beat consensus by +9.55%), so the year-ago level is not a neutral yardstick | `Capital IQ Estimates→Consensus, Fiscal Quarters, FQ3 2026 (EBT GAAP 1,406.02; Gross Margin % 43.16667)` and `→Surprise, FQ3 2025 actuals (EBT 1,116.289; revenue 4,173.0; gross margin 43.4819)` |
| **B4. Revenue is rarely the problem** | Revenue, per the `02` driver tree | Revenue simply behaves as it has. Over the last eight quarters NU's revenue surprise ran −0.11%, −5.78%, +0.64%, −0.05%, +3.32%, +2.97%, −1.82%, +0.61% — inside ±3.3% in seven of eight, mean −0.03% | **High** (≥60%) that revenue lands within ±2.5% — but note this is a beat scenario only in the weak sense that revenue is unlikely to *cause* a miss. Basis: **empirical, n=8, Q3'24–Q2'26**, again at the minimum sample | `Capital IQ Estimates→Surprise, Company Level, Revenue actual vs estimate, FQ3 2024–FQ2 2026`; Q1'26 and Q2'26 actuals independently verified against the interim filings |

---

## 3. Miss Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood | Evidence |
|---|---|---|---|---|
| **M1. A pre-tax miss bigger than the tax cushion — the central miss case** | Pre-tax profit (the composite of `02`'s revenue drivers and `03`'s cost drivers) | Income before income taxes comes in more than about **9% to 12% below** the 1,406.02m consensus. Below that line, even a 14.17% tax rate cannot lift net income to the 1,057.35m bar (arithmetic in §4). **This is not hypothetical: pre-tax missed by −16.63% in Q4'25 and −24.59% in Q1'26**, both larger than the cushion — and both quarters did print EPS misses (−1.58% and −5.21%) despite the tax line absorbing roughly three-quarters of the damage | **Mid** (45–60%). Basis: **empirical, n=8, Q3'24–Q2'26** — pre-tax surprises ran −1.98%, −5.06%, −1.25%, +1.09%, +9.55%, −16.63%, −24.59%, +0.46%; mean **−4.80%**, and **2 of 8 (25%)** were worse than the −12.4% cushion. Weak measured frequency at the minimum sample; the two breaches are recent and adjacent, which argues the true rate is higher than 25% and is why this sits at Mid rather than Low | `Capital IQ Estimates→Surprise, Company Level, "EBT (GAAP)" actual vs estimate, FQ3 2024–FQ2 2026 (data as of Aug-2026)`. Every actual ties to the filings where both exist (Q1'26 954.306; Q2'26 1,236.313; Q3'25 1,116.289 all match `01_historical-financials` §3) |
| **M2. Operating cost rises as management guided, and the Street has it going the other way** | Operating cost / efficiency ratio (`03` §5, "High (EBT)") | Nothing but management's own guide being honoured. Consensus FQ3'26 implies operating cost plus share of associates at **19.478% of revenue** (gross profit 2,562.36 = 43.16667% × 5,936.74, less EBT 1,406.02, = 1,156.34), versus **20.138%** actually incurred in Q2'26 (opex 20.053% + associates 0.085%). The Street is modelling costs **66bp better**. Management's FY26 efficiency-ratio guide of ~20% implies H2 cost ratios ~150–195bp **worse** than Q2'26's 19.5%, which `03` converted to roughly **112–146bp** worse as a share of total revenue. **The gap between the two is 178–212bp of revenue ≈ US$106–126m of pre-tax profit** at the consensus revenue level | **High** (≥60%) that the direction of the gap is real; **Mid** on its full size, because the conversion ratio (net revenues were 74.9% of total revenue in Q2'26) is measured on Q2'26's mix and moves with mix. Basis: **judgment**, anchored to management's own reiterated guide | *"we continue to expect the efficiency ratio for the full year to average about 20%"* (`Q2 2026 earnings-call transcript, Aug-13-2026, prepared remarks`); H1'26 actual 18.63% on the company's own ratio-of-sums basis (`Q2'26 Earnings Presentation, Aug-13-2026, slide 22`); conversion arithmetic from `03_margin-drivers.md` §8, carried with its two stated caveats |
| **M3. The currency tailwind halves** | FX translation — the driver `02` §7 named as NU's single biggest revenue sensitivity | Nothing. The average USD/BRL rate for the quarter ended **Sep-30-2025 was R$5.4493**; spot at **Jun-30-2026 was R$5.1617**. If Q3'26 merely averages that spot rate, the year-over-year translation tailwind is **+5.57%** (5.4493 ÷ 5.1617 − 1), against **+12.14%** in Q2'26. The consensus asks +42.27% reported revenue growth (5,936.74 vs 4,173.0), which at that translation rate needs **≈+34.8% constant-currency growth** (1.4227 ÷ 1.0557 − 1) — against the **+34.02%** NU actually delivered in Q2'26. In plain terms: the business has to hold its underlying growth rate flat while the currency help more than halves | **High** (≥60%) that the tailwind shrinks; **Mid** that it shrinks enough to cause a revenue miss on its own. Basis: **judgment** on the rate path — the pool contains **no BRL reading after Jun-30-2026**, so the current level is *not proven from available data* and the calculation assumes spot holds. Applying the BRL move to 100% of revenue is slightly too wide (about 9% of revenue is MXN/COP), a scope caveat carried from `02` §6a and not netted away | Q3'25 and Q3'24 quarterly average rates R$5.4493 and R$5.5463, spot R$5.3217 at Sep-30-2025: `Q3'25 results release (Portuguese original), Nov-13-2025, Non-IFRS Financial Measures — FX rates — translated`. Q2'26 rates and Jun-30-2026 spot: `Q2'26 Earnings Presentation, Aug-13-2026, pp.34–35`. Constant-currency method and the +34.02% figure: `02_revenue-drivers.md` §6a |
| **M4. The bar was just raised into the print** | Consensus itself | Nothing. Estimates moved up hard in the four weeks after the Aug-13-2026 result: FQ3'26 revenue **5,531.80 → 5,936.74m (+7.3%)**, FY2026 EPS **0.81 → 0.85 (+4.9%)**, with **8↑/0↓** on FY2026 EPS and **11↑/0↓** on FY2026 net income, and not one downward EPS or net-income revision at any horizon. A bar that has just been lifted is harder to clear than the one that existed before the print | **Mid** (45–60%). Basis: **judgment**. Rising revisions are a fact; whether they overshoot is not measurable from the pool | `Capital IQ Estimates→Trends` and `→Revisions`, "Last Month" window, data through Aug-26-2026, reproduced in `04_guidance-consensus.md` §4–§5 |
| **M5. Q2'26 was a cyclical high, so the comparison base is the best one available** | Credit cost and NIM, per `02` §6b and `03` §8 | Any partial normalisation. Risk-adjusted NIM of 12.42% is the top of its six-quarter series, ROE of 33% is a record, and both sit above a 90-plus-day non-performing loan ratio of **6.9%, the highest in the 13-quarter series the deck shows**. Roughly **52bp** of that risk-adjusted NIM came from Desenrola, the Brazilian government debt-renegotiation programme, of which management says *"more than 4/5"* was already booked in Q2 | **Mid** (45–60%). Basis: **judgment**, with a young-entity caveat carried from `03` §8 — NU's disclosed margin history spans roughly one interest-rate cycle, so "peak" means peak of a short record | `Q2'26 Earnings Presentation, slides 15–17`; `Q2 2026 transcript, prepared remarks and Q&A`; Desenrola sizing derived in `03_margin-drivers.md` §7a |

---

## 4. What Magnitude Matters?

Consensus data is present and post-dates the latest reported quarter, so thresholds can be defined. "Material" is set at roughly one standard deviation of the estimate panel itself, cross-checked against the observed spread of NU's own last eight surprises — both bases are stated so the threshold can be re-derived. All rows are **standalone Q3'26** unless labelled otherwise.

| Metric | Consensus / Bar | Material Beat Threshold | Material Miss Threshold | Why |
|---|---:|---:|---:|---|
| Revenue (US$m) | **5,936.74** (4/8 est.; std. dev. 138.16 = 2.3% of mean) | **≥ 6,085** (+2.5%) | **≤ 5,788** (−2.5%) | ±2.5% is roughly one panel standard deviation and roughly the observed spread: seven of the last eight revenue surprises fell inside ±3.3% |
| EBITDA / EBIT | **Not applicable for EBITDA** — a bank income statement has no EBITDA line (`ciq_facts.json` `ltm_ebitda_m` = unknown). Use **income before income taxes (EBT) = 1,406.02** (5/6 est.; std. dev. 120.34 = 8.6%) | **≥ 1,519** (+8%) | **≤ 1,294** (−8%) | ±8% is one panel standard deviation. Note the vendor also carries an "EBIT" line at 1,471.20 (4/6 est.) that does **not** reconcile to EBT for this quarter: the 65.2m gap far exceeds the ~5m share-of-associates item that reconciled them exactly in Q2'26 (EBIT 1,240.976 = EBT 1,236.313 + 4.663). The two lines are different analyst panels. **I use the better-covered EBT line and refine `03` §8 by name:** its +227bp margin-expansion demand came off the thinner EBIT line; on EBT the demand is **+126bp** of pre-tax margin (23.68% vs 22.42%). Same direction, roughly half the size |
| EPS (diluted, GAAP, US$) | **0.22164** (9/9 est.; std. dev. 0.01891 = 8.5%; high 0.25, low 0.18) | **≥ 0.238** (+7.5%) | **≤ 0.205** (−7.5%) | ±7.5% is just under one panel standard deviation. For calibration: a pure tax beat at the guided 17.5% midpoint on consensus pre-tax gives **0.2432**; at Q2'26's filed 14.17% it gives **0.2530**, above the panel's highest single estimate |
| Net income to parent (US$m) | **1,057.35** (7/7 est.; std. dev. 78.05 = 7.4%) | **≥ 1,136** (+7.5%) | **≤ 978** (−7.5%) | Same basis. Implied diluted share count 1,057.35 ÷ 0.22164 ≈ **4,770m** |
| Guidance | **NU issues no revenue, EPS, EBITDA or capex guidance** (`04` §2). The three testable forward statements are the FY26 **efficiency ratio ~20%**, the **IFRS effective tax rate 15–20%** for the remainder of 2026, and the **US expansion drag "less than 100 basis points"** per year | Tax guide **repeated and delivered** (Q3'26 filed rate inside 15–20%), efficiency ratio **held at or below ~20%** for the full year | Tax guide **withdrawn, widened, or reframed to the "managerial" 30–35% basis**; efficiency ratio guide **raised above ~20%** | Because there is no numeric revenue or EPS guide, the guidance risk here is not a cut to a forecast — it is a change in the two ratios the market is using in place of one. Section 5 develops this |

**The tax cushion, in full — the single most decision-relevant arithmetic in this report.** How far can pre-tax profit fall and still meet the 1,057.35m net-income bar?

```
Net income needed                       = 1,057.35
At the guided midpoint tax rate 17.5%:  pre-tax needed = 1,057.35 / 0.825   = 1,281.6
                                        vs consensus 1,406.02              = -8.85%
At Q2'26's filed rate 14.17%:           pre-tax needed = 1,057.35 / 0.8583  = 1,231.9
                                        vs consensus 1,406.02              = -12.39%
At H1'26's filed rate 11.78%:           pre-tax needed = 1,057.35 / 0.8822  = 1,198.5
                                        vs consensus 1,406.02              = -14.76%
```

So the tax gap buys roughly **9 to 15 percentage points of pre-tax downside** before reported EPS misses. Test that against what actually happened, quarter by quarter (`Capital IQ Estimates→Surprise, EBT (GAAP)`, n=8, Q3'24–Q2'26): pre-tax surprises of −1.98%, −5.06%, −1.25%, +1.09%, +9.55%, **−16.63%**, **−24.59%**, +0.46%. **Six of eight sit inside the −12.4% cushion; two do not, and both are recent.**

**And the cushion is already doing this work — it is not a forecast.** In the two quarters where pre-tax missed badly, the tax line absorbed most of it:

```
Q4'25: consensus implied tax rate = 1 - 929.604/1,292.683 = 28.09%
       actual pre-tax 1,077.695 (-16.63%); at the consensus rate that is 774.97 of net income = -16.6% miss
       actual net income 892.378 = -4.00% miss  ->  tax absorbed ~76% of the pre-tax damage
Q1'26: consensus implied tax rate = 1 - 927.753/1,265.507 = 26.69%
       actual pre-tax 954.306 (-24.59%); at the consensus rate that is 699.6 of net income = -24.6% miss
       actual net income 872.056 = -6.00% miss  ->  tax absorbed ~76% of the pre-tax damage
Q2'26: pre-tax +0.46% (essentially in line); net income +12.64%
       `04` measured 96.7% of that beat as the tax rate, residual +3.90m (3.3%)
```

The pattern is consistent and one-directional: **tax turns a pre-tax miss into a small EPS miss, and a pre-tax in-line into a large EPS beat.**

---

## 5. In-Line Print But Bad Guidance Risk

NU gives no numeric revenue or EPS guidance, so a classic "guide-down" is structurally impossible. The risk takes a different shape and is worse for being harder to see: the market is modelling NU off two management ratios, and either can move on the Nov-12-2026 call without a single reported number changing.

| Risk | Evidence | Why It Matters |
|---|---|---|
| **In-line current quarter but the tax guide is withdrawn or reframed** | The 15–20% guide was given **once**, on May-14-2026, and was **not repeated** on the Aug-13-2026 call — the words "ETR", "effective tax" and "tax rate" appear zero times in that transcript (`04` §2). Management separately flagged a **"managerial ETR" converging toward 30–35%** and called it *"the more economically meaningful comparison"*. The CFO's durability claim — *"a recurring structural feature of how we operate"* — is a management assertion, not an audited conclusion (`Q1 2026 transcript, May-14-2026, prepared remarks`; `06_earnings-quality.md` §5) | This is the real guide-down risk for NU. Reframing the tax rate toward the managerial 30–35% basis would remove the entire beat mechanism in §2 B1 at a stroke, with no change whatever in the operating business. Note also the risk runs *with* the print, not against it: the Street is already at 24.8–31.25%, so a reframing validates the Street rather than surprising it |
| **Beat the current quarter but the cost guide bites in Q4** | With H1'26 at 18.63% and the FY guide at ~20%, H2 has to run 21.0–21.5%. Carrying the consensus revenue path through (net revenues assumed to hold Q2'26's 74.9% share of total revenue, and to grow at the consensus rates of +7.68% then +6.43% QoQ — assumption labelled): if **Q3'26 prints an efficiency ratio at Q2'26's 19.5%, Q4'26 alone must then run at roughly 22.7%** to average ~20% for the year. The highest quarterly efficiency ratio in the disclosed six-quarter series is **21.4%** (Q1'25) (`Q2'26 Earnings Presentation, slide 22`) | A good Q3 makes Q4 arithmetically harder, not easier, so long as the ~20% FY guide stands. The engine that would resolve this benignly is management quietly retiring the guide — which is itself the guidance risk |
| **Beat EPS on one-offs, miss on quality** | `06` scored earnings quality **58/100** and found **40.4% of TTM net income to parent (US$1,458.6m of US$3,607.1m) is a non-cash deferred tax credit**, with cash tax actually paid (US$2,108.1m) **2.7 times** the P&L tax charge (US$774.6m). The deferred tax asset has reached **27.5% of equity attributable to the parent**, and recovery of the loss-carryforward slice is capped by Brazilian law at 30% of taxable profit per year | This is the sharpest tension in the whole setup: the mechanism most likely to produce a Q3'26 beat is the same mechanism `06` identified as the biggest quality concern. A tax-driven beat is a **low-quality** beat. It is self-reversing by construction — the credit keeps arriving only while the provision build outruns tax-deductible write-offs, which is only true while the loan book grows fast, and sequential loan growth has decelerated: +8%, +9%, +11%, +7%, **+5%** QoQ FX-neutral (`Q2'26 Earnings Presentation, slide 13`) |
| **Beat revenue but the balance sheet deteriorates** | Working capital does not exist for this issuer (the IFRS statement of financial position is unclassified), so the lender equivalent is used. Company-basis operating cash flow swung from **+US$3,640.0m (H1'25) to −US$1,242.0m (H1'26)**; self-funding of the credit book fell to **36.0% in H1'26** from 84.8% a year earlier; gross credit assets ÷ deposits rose **77.9% → 86.9%** in six months (`06` §1a and §3, from `Q2'26 interim statements, Statements of Cash Flows` and `Notes 13, 14, 22`) | A revenue and EPS beat driven by a faster-growing loan book widens this gap rather than closing it. `06`'s stated forward test applies: if FY2026 closes below 50% on CFO ÷ net income on the company's own basis, its `RF-EQ-002` trigger fires |

---

## 6. Seasonality Read

Seasonality **helps the setup slightly, but the evidence is thin and its main channel is margin, not revenue**. `01` §5 measured a three-year average Q3 revenue share of 26.2% against Q2's 23.8%, and adjudicated it plainly: the within-year gradient is an arithmetic consequence of a business compounding 3–13% every quarter, not a demand season, and no quarter breaches the >30% / <20% flag tests — so "seasonality, as a standalone effect, is **not proven from available data**". That qualifier travels intact and no Q3-uplift assumption is built off the revenue share. One series in `01`'s own table does escape the compounding explanation, because it is a **ratio** rather than a level: quarterly **net margin was higher in Q3 than in Q2 in each of FY2023 (14.2% vs 12.0%), FY2024 (18.8% vs 17.1%) and FY2025 (18.8% vs 17.4%)**, and the same holds on the efficiency ratio, where Q3'25's 20.3% was better than Q2'25's 21.3% (`01_historical-financials.md` §5; `Q2'26 Earnings Presentation, slide 22`). Three observations is **judgment with a three-observation prior, not a measured frequency** (§10), and two facts cut against leaning on it: Q2'26's net margin of 19.23% is already above every historical Q3 reading in the table, and management's own FY26 efficiency guide points H2 costs the other way. Net read: a mild tailwind, worth naming, not worth weighting.

---

## 7. Historical Pattern

There is a pattern, and it is **not** the one a headline beat rate would show. Over the last eight quarters (Q3'24–Q2'26, `Capital IQ Estimates→Surprise`), net income (GAAP) beat consensus in **five of eight** with a mean surprise of **+3.24%** and a median of +3.72% — but that composite is the product of two opposing series. **Pre-tax profit came in below consensus in five of eight quarters, mean −4.80%**, including −16.63% and −24.59% in Q4'25 and Q1'26. **Revenue was almost always close**, inside ±3.3% seven times out of eight, mean −0.03%. So the durable pattern is: analysts forecast NU's revenue well, forecast its pre-tax profit with a downward bias of roughly five points, and forecast its tax rate badly enough that the tax line reverses the sign of the surprise. `04`'s Q2'26 decomposition is the clean instance — **96.7% of a 12.6% net-income beat came from the tax rate while pre-tax landed within 0.5% of the estimate** — and §4 shows the same line quietly absorbing about 76% of the pre-tax damage in each of the two preceding misses. How much should the synthesizer weight this? **Moderately, and with the sample size attached.** Eight observations sits at the doctrine's minimum for a measured frequency; NU's post-IPO record is short and the tax structure that produces the gap only appeared in Q4'25, so only three quarters of the *relevant* regime exist. `04`'s own base-rate honesty note applies and is carried: any claim about "how often NU beats" is judgment informed by a small sample, never a statistic. One narrower observation, offered with its label: NU has beaten net-income consensus in **all three** of its prior Q3 prints (+23.6%, +11.3%, +4.4%) — **judgment with a three-observation prior**, nothing more.

**Numeric triggers (CLAUDE.md §17).** Each states its like-for-like comparable, the arithmetic for any not-yet-reported stub, and what it would have done on the last two reported periods. A trigger the status quo already satisfies is not adopted.

| # | Trigger | Like-for-like comparable | What it implies for the unreported stub | Last two reported periods |
|---|---|---|---|---|
| **T1** (miss) | Q3'26 filed IFRS effective tax rate **≥ 20.0%** | **Q3'25 filed rate 29.89%** (`Capital IQ Estimates→Consensus, quarterly Effective Tax Rate %, FQ3 2025 actual`). The trigger is 989bp *below* the year-ago quarter, so it tests management's own guided ceiling rather than rubber-stamping a YoY improvement | With H1'26 filed at 11.78% (tax 258.099 on pre-tax 2,190.619), a Q3 at exactly 20.0% on consensus pre-tax gives 9M'26 tax of 258.1 + 281.2 = 539.3 on pre-tax of 3,596.6 = **14.99%** — still inside the guide, so the nine-month column would not yet fail | Q1'26 **8.68%**, Q2'26 **14.17%** — neither fires. Capable of failing; the status quo does not satisfy it |
| **T2** (beat) | Q3'26 diluted EPS **≥ US$0.243** (consensus pre-tax 1,406.02 taxed at the guided 17.5% midpoint = 1,159.97m ÷ ~4,770m shares) | **Q3'25 diluted EPS 0.1595** → the trigger is **+52.4% YoY**, against +66.3% delivered in Q2'26 | Nine-month cumulative would then read 0.3936 + 0.243 = **0.6366** against `04`'s restated nine-month bar of **0.6152** (cumulative six-month actual plus the standalone-quarter estimate) | On the equivalent "beat consensus EPS by ≥9.7%" basis: Q2'26 **+13.03%** (fires), Q1'26 **−5.21%** (does not). One of two — capable of failing |
| **T3** (miss) | Q3'26 income before income taxes **≤ US$1,232m**, i.e. an EBT surprise of **−12.4%** or worse — the level at which even a 14.17% tax rate only meets the net-income bar | **Q3'25 EBT actual 1,116.289m** → the trigger level is still **+10.4% YoY**, so it can fire while profit is growing. That is the point: it tests the bar, not the direction | Nine-month EBT would be 2,190.6 + 1,232 = 3,422.6 against 9M'25 of roughly 2,790.7 (1,674.4 filed H1'25 + 1,116.3 Q3'25) = **+22.6% YoY** — a trigger that fires on a 22.6% nine-month profit increase, which is exactly how demanding the bar is | Q1'26 **−24.59%** (fires), Q2'26 **+0.46%** (does not). One of two — and it has fired inside the last four quarters |
| **T4** (miss) | Q3'26 efficiency ratio **≥ 21.0%** | **Q3'25 efficiency ratio 20.3%** (`Q2'26 Earnings Presentation, slide 22`) → 70bp **worse** than the year-ago quarter, so it tests deterioration | With H1'26 at 18.63%, a Q3 at 21.0% still leaves Q4'26 needing roughly **21.3%** for the FY to average ~20% (assumptions as in §5) | Q1'26 **17.6%**, Q2'26 **19.5%** — neither fires. Capable of failing |
| **T5** (miss) | Q3'26 revenue **≤ US$5,780m** (the low end of the 4-estimate panel) | **Q3'25 revenue 4,173.0m** → the trigger level is still **+38.5% YoY**. At an assumed Q3'26 average BRL of R$5.1617 (the Jun-30-2026 spot), that is roughly **+31.2% constant currency**, versus **+34.0%** delivered in Q2'26 — so it fires if underlying growth decelerates about 2.8pp | Nine-month revenue would be 10,481.2 + 5,780 = **16,261.2m** against `04`'s restated nine-month bar of 16,417.9m, a −0.95% cumulative shortfall | Q1'26 **−1.82%**, Q2'26 **+0.61%** — neither fires. Capable of failing |
| **T6** (credit) | Carried from `03_margin-drivers.md` §9 rather than restated: in the Q3'26 disclosure, the allowance bridge showing portfolio growth contributing materially less than the ~68% share it carried in Q2'26 (US$342m of ~US$500m), with the balance from stage migration or reserve strengthening, **and** the 15-to-90-day delinquency ratio failing to improve once the disclosed seasonal effect (−37bp in Q2'26) is subtracted | `03` sets the comparable at Q2'26's own disclosed bridge | If it fires, `03`'s demand reading of the credit charge is dead and M1 becomes the dominant scenario | `03` records the mechanism as tested once (Q1'26 booking → Q2'26 credit income) and not yet failed |

---

## 8. Setup Verdict

**Setup favors beat** — on the reported net-income and EPS line, and only there.

The single most important factor is **the effective tax rate embedded in consensus**. The Street is carrying 24.80% for Q3'26 on the pre-tax/net-income pair and 31.25% on its own explicit tax line, against a management guide of 15–20% and filed rates of 16.97%, 8.68% and 14.17% in the last three quarters. Holding the Street's own pre-tax estimate constant, closing that gap to the guided midpoint is worth **+9.7% on net income**, and to Q2'26's filed rate **+14.1%** — with no help at all from revenue, credit cost or operating expense. It is not a theory: it produced 96.7% of the Q2'26 beat and absorbed roughly 76% of the pre-tax damage in each of the two quarters before that. Applied to the *realised* pre-tax outcomes of the last eight quarters, a 14.17% rate would have produced a net-income beat in six of them (empirical, n=8, Q3'24–Q2'26, at the doctrine's minimum sample).

**The single biggest risk that flips it is a pre-tax miss larger than the cushion** — worse than about −9% to −12% against the 1,406.02m consensus. That is not a tail: it happened in **two of the last four quarters** (−16.63% and −24.59%), and both of those quarters printed EPS misses despite the tax help. The two forces most likely to produce it are named and sized above: operating cost running as management guided while the Street models it 66bp better (a gap of 178–212bp of revenue, roughly US$106–126m of pre-tax), and a currency tailwind halving from +12.14% to about +5.57% year on year if the real merely holds at its Jun-30-2026 spot.

**Three qualifiers travel with this verdict and must not be dropped.** (i) It is a verdict about the **reported** EPS line, not about earnings quality — `06` scored quality **58/100** precisely because this same tax line is a non-cash deferred credit worth 40.4% of TTM profit, so a beat delivered this way is a low-quality beat. (ii) The **operating** bar is fair-to-demanding, not soft: `04` said it, `03` sized it on the EBIT line, and §4 above refines that sizing downward to +126bp of pre-tax margin on the better-covered EBT line while keeping the direction. (iii) The tax finding rests on a **two-analyst** explicit tax line, and the way it could be wrong is stated plainly — if analysts are deliberately taxing NU at its "managerial" 30–35% basis inside an IFRS-labelled field, the gap is a modelling convention rather than a mispriced bar. Against that, the vendor's own *actuals* on that line are the filed IFRS rates (Q2'25 27.5626% ties exactly to the filing's 27.562%; Q1'26 8.6843%; Q4'25 16.971%), which is strong evidence the field means what it says.

---

## 9. Second-Quarter Look-Ahead

**The setup for Q4 2026 (expected to be filed around Feb-2027) looks less favourable, for three reasons that are all visible now.** First, the tax gap is the same size but the exposure is worse: the FQ4'26 consensus pair (net income 1,159.04 ÷ pre-tax 1,531.82) implies a 24.34% rate and the explicit line reads 31.25% again — but Q4 is when the full-year tax position is trued up, and Q4'25's filed rate of 16.97% shows that quarter can swing hard in either direction. Second, the cost guide bites hardest in Q4: on the arithmetic in §5, a benign Q3 efficiency ratio of 19.5% forces Q4 to roughly **22.7%** for the year to average ~20%, above anything in the disclosed six-quarter series. Third, the two supports behind Q3 are gone — Desenrola is exhausted after its Q3 tail, and Q2'26's lending growth will have converted. **What is genuinely not visible:** the pool contains no BRL reading after Jun-30-2026 and no Q4'25 average rate, so the Q4 currency comparison **cannot be computed from available data** and is not guessed. Nor does the pool contain a Brazilian policy-rate reading after Apr-08-2026, so the direction of the float/treasury line (13.88% of revenue) into Q4 is unknown rather than assumed.

---

## 10. Pre-Mortem

**If this setup fails, the most likely reason is that we were right about the tax rate and wrong about what it was worth — because the line that actually moves is pre-tax profit, and we treated a nine-point cushion as bigger than the history says it is.** Pre-tax has a five-point downward bias against consensus over eight quarters and breached the cushion twice in the last four, so a −15% to −25% pre-tax quarter, driven by the operating cost step-up management itself guided and a currency tailwind halving, would deliver an EPS *miss* even with a 14% tax rate — and the post-mortem would classify it under **bad base rate** (§20), for weighting a mechanism measured over three quarters of a new tax regime against operating volatility measured over eight. The second, quieter failure mode is **stale data**: consensus here is dated Aug-26-2026 and the print is Nov-12-2026, so analysts have eleven weeks to cut their tax assumptions toward what NU has actually been filing. If they do, the gap closes before the print, the beat never arrives, and nothing about our read of the company was wrong at all — only our read of the bar.

---

## Citations

All documents live in the frozen extract generation and are cited logically as `data/NU/`.

- `Q2'26 unaudited interim condensed consolidated financial statements (filed Aug-14-2026), Consolidated Statements of Income, three-month and six-month periods ended 06/30/2026` — revenue 5,513,208; income before income taxes 1,236,313; income taxes 175,224; net income to parent 1,060,199; diluted EPS 0.2162; six-month revenue 10,481,175, diluted EPS 0.3936, pre-tax 2,190,619, tax 258,099.
- `Q3'25 results release (Portuguese original), Nov-13-2025, Medidas financeiras não IFRS e reconciliações — FX rates — translated` — average USD/BRL for the quarter ended Sep-30-2025 **R$5,4493** and for the quarter ended Sep-30-2024 **R$5,5463**; spot R$5,3217 at Sep-30-2025. Numerals transcribed unchanged; labels translated (CLAUDE.md §27).
- `Q2'26 Earnings Presentation, Aug-13-2026` — slide 13 (credit portfolio, product mix, QoQ FX-neutral growth); slides 15–17 (NIM, cost of credit, risk-adjusted NIM, NPL series); slide 22 (net revenues, opex, efficiency ratio by quarter); pp.34–35 (FX-neutral methodology; average USD/BRL R$5.0496 for Q2'26 and R$5.6625 for Q2'25; spot R$5.1617 at Jun-30-2026).
- `Q2 2026 earnings-call transcript, Aug-13-2026 (S&P Global, verbatim), prepared remarks and Q&A` — FY26 efficiency ratio ~20% reiterated; expected credit losses recognised at origination; the +178bp credit-income step-up attributed to Q1 lending; Desenrola sizing and its Q3 tail; risk-adjusted NIM sustainability.
- `Q1 2026 earnings-call transcript, May-14-2026 (S&P Global, verbatim), prepared remarks` — IFRS effective tax rate guide of 15–20% "for modeling purposes"; managerial ETR 30–35%; US expansion drag "less than 100 basis points". *Attribution note: upstream `04` attributes this to Rob Livingston and `06` corrects it to Guilherme Marques do Lago, CFO, citing the transcript speaker label. The quote is identical in both; I carry `06`'s attribution.*
- `Capital IQ Estimates→Consensus, Fiscal Quarters block, data as of Aug-26-2026` — FQ3'26 revenue 5,936.7375 (4/8, high 6,077.35, low 5,779.6, s.d. 138.15988); EBT (GAAP) 1,406.02171 (5/6, high 1,622, low 1,280, s.d. 120.33802); EBIT 1,471.19775 (4/6); net income (GAAP) 1,057.34911 (7/7, high 1,167, low 896, s.d. 78.05066); EPS (GAAP) 0.22164 (9/9, high 0.25, low 0.18, s.d. 0.01891); gross margin 43.16667%; effective tax rate 31.25% (2/2). FQ4'26: revenue 6,318.7645; EBT 1,531.82444; net income 1,095.43463 *(see note)*; EPS 0.24278; effective tax rate 31.25%.
- `Capital IQ Estimates→Consensus, quarterly "Effective Tax Rate %" row, actuals` — FQ2'25 27.5626, FQ3'25 29.8857, FQ4'25 16.971, FQ1'26 8.6843. The FQ2'26 cell on this row carries an estimate (31), not an actual; the filed Q2'26 rate of 14.17% comes from the interim statements.
- `Capital IQ Estimates→Surprise, Company Level and Fiscal Quarters blocks, FQ3 2024–FQ2 2026, data as of Aug-2026` — actual and final-estimate pairs for revenue, EBT (GAAP), net income (GAAP) and EPS (GAAP) used for every surprise percentage in §7 and §4. Overlapping quarters verified against the interim filings.
- `Capital IQ Estimates→Trends` and `→Revisions`, last-month window through Aug-26-2026 — the revision figures quoted in M4.
- `ciq_facts.json` (deterministic sidecar for this extract generation) — `ltm_ebitda_m` unknown ("Income Statement sheet has no 'EBITDA' row"), which is why the §4 EBITDA row is replaced by EBT.
- **Upstream, all read in full:** `00_earnings-data-triage.md`, `01_historical-financials.md` (§3 quarterly series, §5 seasonality), `02_revenue-drivers.md` (§6a constant-currency method and the +34.02% figure, §6b cycle position, §7 the FX sensitivity), `03_margin-drivers.md` (§5 driver table, §7B net-margin bridge, §8 the single biggest margin driver and the cost-line contradiction test, §9 the credit-read flip observable), `04_guidance-consensus.md` (§1A reporting-basis reconciliation carried verbatim, §2 guidance, §3 the tax arithmetic, §6 the surprise table, §7 the bar assessment), `06_earnings-quality.md` (§1a cash-backed net income, §3 lender working-capital substitutes, §9–§10 the quality score and the tax finding).

*Note on one vendor inconsistency, recorded rather than smoothed:* the FQ4'26 net-income mean of 1,095.43 sits **below** the FQ3'26 mean of 1,057.35 by less than it should given a higher FQ4 pre-tax estimate, and the quarterly revenue panel (10,481.175 actual + 5,936.74 + 6,318.76 = 22,736.68) falls 171.3m, or 0.75%, short of the FY2026 revenue consensus of 22,907.99. Both are artefacts of different analyst panels populating the quarterly and annual fields. Neither is material to any threshold above, and neither is used to build a bar.

**Not used as a source for any number:** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` (verdict-bearing prior in-house memo; verdict, target price and expected return stripped per CLAUDE.md §24). The Capital IQ consensus export's sell-side recommendation and mean target price are analyst verdicts and are likewise not carried forward.



---

## earnings / 06_earnings-quality.md

_Source: `06_earnings-quality.md`_

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



---

## earnings / 07_earnings-sensitivity.md

_Source: `07_earnings-sensitivity.md`_

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



---

## earnings / 08_earnings-red-flags.md

_Source: `08_earnings-red-flags.md`_

# Earnings Red Flags — NU

**Upstream status.** All eight upstream earnings outputs were read in full (`00`, `01`, `02`, `03`, `04`, `05`, `06`, `07`) plus the machine-readable `sensitivity_summary.json` payload emitted inline in `07` §9. Nothing is missing, so no degraded-confidence note applies. The business-model module is available and was read (`03_segment-map`, `06_value-chain`, `10_external-dependency`, `12_red-flags-sweep`, `99_business-model-synthesis`).

**Evidence binding.** This scan read only the bound frozen extract generation `.extract-generations/f9081efa…4509f2be` (manifest, `corpus.txt`, `ciq_facts.json`, `relationships.json` and its per-source extracts). No live `data/NU/` path and no `_pool_extracts/` path was read. `data/NU/` below is a citation label only.

**Language.** Every document in this pool is readable. The Q3'25 results release and the FY2025 audited statements are Portuguese-original; they are read and translated, count at full source tier, and are **not** recorded as a data gap (CLAUDE.md §27). No red flag below rests on a language issue.

**Prior in-house memo.** `NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is verdict-bearing. Its verdict is stripped (CLAUDE.md §24) and no number in this report comes from it. I tested whether any upstream agent leaned on it — see §2.10.

---

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| `01_historical-financials` | Quarterly revenue growth inflected up from +18.7% YoY (Q1'25) to +50.3% (Q2'26); net income to parent 8 quarters: 553.4 → 1,060.2 | `[01 output, §3 and §6]`; `Q2'26 interim condensed consolidated financial statements (filed Aug-14-2026), Statements of Income, three-month period ended 06/30/2026` | High |
| `02_revenue-drivers` | Constant-currency revenue growth ~+34.0%; ARPAC +22% FX-neutral, six consecutive quarters of improvement; customers 123m → 139m | `[02 output, §6a and §4]`; `Q2'26 Earnings Presentation, Aug-13-2026, slides 6 and 28` | High |
| `03_margin-drivers` | Risk-adjusted NIM 12.42% in Q2'26, a record in the disclosed six-quarter series; company's own QoQ walk reconciles to 1bp | `[03 output, §7A]`; `Q2'26 Earnings Presentation, Aug-13-2026, slides 15–16` | High |
| `04_guidance-consensus` | "Bar is low": consensus embeds a 30.2% H2'26 IFRS tax rate against a 15–20% management guide and 11.78% filed in H1'26; closing to the guided midpoint is worth ~+9.8% on FY26 net income | `[04 output, §3 and §7]`; `Capital IQ Estimates→Consensus, data as of Aug-26-2026`; `Q1 2026 earnings-call transcript, May-14-2026, prepared remarks` | Medium |
| `04_guidance-consensus` | Revision breadth turned decisively positive on the print: FY2026 EPS 8↑/0↓, net income 11↑/0↓, no downward EPS revision at any horizon | `[04 output, §5]`; `Capital IQ Estimates→Revisions, last-month window through Aug-26-2026` | High |
| `05_beat-miss-setup` | "Setup favors beat" on the reported EPS line; a 14.17% tax rate applied to realised pre-tax would have beaten in 6 of the last 8 quarters | `[05 output, §2 B1 and §8]` | Medium |
| `06_earnings-quality` | The pre-tax business is conservatively stated: allowance coverage rose 15.37% → 16.86% in six months with no release; cash collection of accrued interest improved four years running (62.5% → 72.0%) | `[06 output, §2 and §8]`; `Q2'26 interim statements, Note 7 (Expected Credit Loss)` | High |
| `07_earnings-sensitivity` | Disclosure quality is high for sensitivity work: DV01 at two shock sizes across five curves, a full FX shock table with its stated percentile basis, and an ECL macro-scenario table at the latest interim date | `[07 output, §7]`; `Q2'26 interim statements, Note 4(a) p.15 and Note 32 p.42` | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| `03_margin-drivers` | **100% of Q2'26's +187bp net-margin expansion is the tax line (+300.2bp); every operating component together was −112.0bp; pre-tax margin FELL 155bp YoY** | `[03 output, §7B and §7a]`; `Q2'26 interim statements, Statements of Income and Note 30` | High |
| `04_guidance-consensus` | **96.7% of the 12.6% Q2'26 net-income beat came from the tax rate** while pre-tax landed within 0.5% of the estimate | `[04 output, §6]`; `Capital IQ Estimates→Surprise, FQ2 2026` | High |
| `06_earnings-quality` | **40.4% of TTM net income to parent (US$1,458.6m of US$3,607.1m) is a non-cash deferred tax credit**; cash tax paid US$2,108.1m is 2.7× the P&L charge US$774.6m; the deferred tax asset is 27.5% of parent equity, against a Brazilian statutory rate that ROSE to 42.5% | `[06 output, §1a, §3, §9]`; `Q2'26 interim statements, Note 30 — Income Tax` (DTA 3,649,091; equity attributable to parent 13,249,670; tax rate 42.5% vs 40.0%) | High |
| `06_earnings-quality` | Company-basis TTM CFO is **−US$1,381.6m**; self-funding of the credit book fell to 36.0% in H1'26 from 84.8% a year earlier; gross credit assets ÷ deposits 77.9% → 86.9% in six months | `[06 output, §1a and §3]`; `Q2'26 interim statements, Statements of Cash Flows and Notes 13, 14, 22` | High |
| `02` / `03` | Q2'26 is at or near a cyclical high and is **not a normalised run-rate**: record risk-adjusted NIM and ROE alongside 90+ day NPLs at 6.9%, the highest in the 13-quarter disclosed series | `[02 output, §6b]`; `[03 output, §8]`; `Q2'26 Earnings Presentation, slides 15–17` | High |
| `03` / `04` / `05` | Management's own FY26 efficiency-ratio guide of ~20% against 18.63% in H1'26 requires H2 cost ratios ~150–195bp **worse** than Q2'26's 19.5% | `[04 output, §2]`; `Q2 2026 earnings-call transcript, Aug-13-2026, prepared remarks` | High |
| `05_beat-miss-setup` | Pre-tax profit missed consensus by −16.63% (Q4'25) and −24.59% (Q1'26), both beyond the ~−12.4% tax cushion; both printed EPS misses | `[05 output, §3 M1 and §4]`; `Capital IQ Estimates→Surprise, EBT (GAAP), FQ3 2024–FQ2 2026` | High |
| `05_beat-miss-setup` | The currency tailwind more than halves if spot holds: +12.14% in Q2'26 against +5.57% for Q3'26 (Q3'25 average R$5.4493 ÷ Jun-30-2026 spot R$5.1617) | `[05 output, §3 M3]`; `Q3'25 results release (Portuguese original), Nov-13-2025, FX rates — translated` (verified verbatim: "R$5,4493 para US$1,00") | High |
| `07_earnings-sensitivity` | Credit cost is the largest single earnings sensitivity (avg |US$556.8m|, 15.4% of TTM net income), with **no realised offset computable** because the disclosed history contains no credit downturn | `[07 output, §3 and §4]` | Medium |
| `business-model/12_red-flags-sweep` | Around **26.9% of FY2025 costs are directly or indirectly linked to the US dollar while the majority of revenue is in reais** — an operating currency mismatch the earnings module never carried | `FY2025 Form 20-F (filed Apr-08-2026), Item 3.D — exchange-rate risk factor` (verified verbatim in the pool) | High |
| `business-model/12_red-flags-sweep` | Internally developed intangible additions grew +84.8% in FY2025 against revenue +37.0%, with 19.5% of the year's additions disposed of in the same year | `FY2025 Form 20-F, Notes — Intangible assets and goodwill, changes table` | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| **The Managerial P&L reconciliation report** management directs analysts to ("available in our managerial P&L reconciliation report") | **Nobody.** Not in `00`'s 161-row inventory; not named by `03`, `04` or `05` | **Largest gap in the module.** It is the one document that would settle whether the consensus tax line is IFRS or managerial — the question the whole "bar is low / setup favors beat" verdict rests on |
| No BRL reading after Jun-30-2026; no Selic/CDI reading after Apr-08-2026 | `02` §8, `05` §9, `07` row 5 | The FX bear (M3) and the entire policy-rate row assume spot holds; the current level is not proven from available data |
| No Q2'25 MXN average rate; no quarterly interest-earning-portfolio balance; no quarterly purchase volume | `02` §8 | Mexico's +79.06% cannot be split into currency and operating growth; the blended yield in `02` §6a is not a true earning-asset yield; interchange cannot be split into volume vs take rate |
| No consensus estimate for the efficiency ratio — the one metric management actually guides | `04` §3 | The single testable management guide cannot be compared with the Street at all |
| No interim filings for Q3'24, Q4'24, Q3'25, Q4'25 — those quarters come from the Capital IQ Surprise actuals | `01` §3 | Four of the eight quarters in the trend table are vendor-sourced (verified against filings for every overlapping quarter) |
| No credit downturn anywhere in NU's disclosed history | `07` row 1 | No realised mitigation offset can be measured for the largest sensitivity, so it is published as a zero-mitigation bound only |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| `00` §5 | "The company issues no quantitative guidance in this pool" | `04` §2 | Four numeric forward statements exist: FY26 efficiency ratio ~20%; IFRS ETR 15–20% for the remainder of 2026; US opex drag <100bp on the efficiency ratio in each of 2026/2027; risk-adjusted NIM "in the same region" as 12.42% | **Y** | **`04` is right, `00` is wrong.** Verified in the pool: `Q1 2026 earnings-call transcript, May-14-2026, prepared remarks` carries "we expect our IFRS ETR for the remainder of 2026 to converge towards the 15% to 20% range" and "less than 100 basis points". `00` was right only that no revenue/EPS guidance exists |
| `01` §6 | FX is "roughly a fifth" of the Q2'26 +50.3% (≈+11.3pp), from the deck's FX-neutral **gross revenue** measure (+39%) vs IFRS total revenue | `02` §6a | FX is **+16.27pp** (a third), from the measured average-rate move R$5.6625 → R$5.0496 (+12.14%) applied to IFRS total revenue | **Y — definitional, not factual** | **`02`'s +16.27pp governs any claim about IFRS total revenue**, because numerator and denominator are on one basis (income-statement flow, period-average rate, §15/§27). `01`'s figure subtracts a non-IFRS gross-revenue growth rate from an IFRS one — two different top lines. `01`'s qualifier still travels: the honest range is **+11.3pp to +16.3pp**, and `02` prints both. `05` §3 M3 correctly used a third figure (+5.57% forward) on the same average-rate basis with the Q3'25 comparator |
| `03` §8 | The FQ3'26 operating bar is **+227bp** of margin expansion, implying IFRS gross margin must reach 45.9%–46.3% — a level printed once in the data (FY2024 full year) | `05` §4 | The vendor's EBIT line does not reconcile to the better-covered EBT line — a **65.2m gap** against the ~5m share-of-associates item that reconciled them exactly in Q2'26 — so the demand on EBT is **+126bp**, same direction, roughly half the size | **Y** | **`05` governs the size; `03` governs the direction.** Verified in the pool: FQ3'26 EBIT 1,471.19775 (4/6) vs EBT 1,406.02171 (5/6), while every historical actual pair differs by ~1–5m (Q2'26: EBIT 1,240.976 vs EBT 1,236.313). `03`'s "45.9%–46.3% gross margin" requirement must **not** be carried forward — the vendor's own FQ3'26 consensus gross margin line reads **43.16667%**, only +61bp above Q2'26's 42.56%, and `03`'s figure came from combining a thin EBIT estimate with management's guided cost path, which is a conditional, not the consensus set |
| `07` §3 | Ranked by absolute earnings impact, **credit cost first** (avg US$556.8m, 15.4% of TTM net income), narrowly ahead of BRL/USD (US$486.0m) and the tax rate (US$221.9m at the realised offset / US$403.4m at the bound) | `03` §7B, `04` §6, `06` §9 | **Tax-led**: 100% of Q2'26's net-margin expansion, 96.7% of the Q2'26 beat, 40.4% of TTM net income | **Y — they answer different questions** | **Both govern, on different claims.** `07`'s ranking governs any **forward sensitivity or scenario** claim ("what could move earnings most from here"). `03`/`04`/`06` govern any **attribution** claim ("what moved the last print"). `07` §3 says this itself. Two qualifiers travel: the top three sit within ~4% of TTM net income of each other, which is not a wide separation; and `07`'s BRL coefficient is understated (§2.8 below) |
| `04` §2 citation | Attributes the Q1'26 ETR guide to Rob Livingston, CFO | `06` [15] | Corrects the speaker to Guilherme Marques do Lago, CFO | **Y** | **`06` is right.** The Q1 2026 transcript names "Guilherme Lago, our Chief Financial Officer" on the May-14-2026 call; the CFO seat changed to Livingston on 13 Jul 2026 (`business-model/12_red-flags-sweep` §1). The quote itself is identical in both. `05` carried `06`'s attribution; `04`'s text still carries the wrong one |
| `06` §6 | Capitalised costs growing as a share of revenue: **"N"** — 2.06% / 1.34% / 1.81% of revenue FY2023–FY2025 and 1.72% in H1'26, "no rising trend" | `business-model/12_red-flags-sweep` §2 | Severity **52/100 (inverted)** and the qualifying row for `RF-RFS-001`: additions +84.8% against revenue +37.0%, US$223,167k of cost kept off the FY2025 income statement (5.8% of pre-tax profit, up from 4.2%), and 19.5% of the year's additions disposed of in the same year | **Partly — same data, two measurement bases** | **Unresolved; the synthesis must carry both.** `06` measured intensity (share of revenue), `12` measured growth and the disposal rate. On `06`'s own basis the ratio still rose 47bp YoY (1.34% → 1.81%), so "no rising trend" is a claim about H1'26 only. Neither agent addressed the disposal rate. `06`'s own unexplained **US$127.3m** gap between H1'26 intangible additions (211.5) and cash intangible capex (84.2) sits in the same place |
| `06` §4 (business-model) | Loan-to-deposit ratio 35% — "lends out only 35 cents of every dollar it holds" | `03` §2a, `06` §3 (earnings), `07` §6(d) | 35% (CFO) / **58%** (deck average basis) / **86.9%** gross credit assets ÷ deposits | **N from this pool** | **No basis exists for the 35% figure anywhere in the pool.** `03` §2a handled it correctly ("two different figures, both disclosed, do not blend"). The synthesis must not let 35% stand as the same measure as 58% or 86.9% (§15 matched-basis) |

---

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **The Managerial P&L reconciliation report is absent from the pool** — management directs analysts to it by name, and it is the only document that would resolve whether the consensus tax and pre-tax lines are IFRS or managerial | **Triggered** | **High** | **High** | `Q1 2026 earnings-call transcript, May-14-2026, IR opening remarks`: "The full reconciliation to the most directly comparable IFRS figures is available in our managerial P&L reconciliation report and in the appendix to this presentation." No such document appears in `00`'s 161-row inventory of `manifest.json` | The module's central verdict (`04` "bar is low", `05` "setup favors beat") cannot be verified against the one reconciliation management says exists. This is a genuine, non-language gap |
| **The estimate panels behind the central claim are thin and inconsistent in size** — FQ3'26 revenue 4/8, EBIT 4/6, effective tax rate **2/2**, against EPS 9/9 and net income 7/7 | **Triggered** | **High** | **High** | `Capital IQ Estimates→Consensus, Fiscal Quarters block, data as of Aug-26-2026`, verified line-by-line in the pool | The 31.25% explicit tax rate — the single number the beat case is measured against — rests on **two** analysts. `04` §7 and `05` §8 both name this; it is recorded here as a data flag, not a modelling one |
| **No BRL reading after Jun-30-2026 and no Selic/CDI reading after Apr-08-2026** | **Triggered** | Medium | High | `[02 output, §8]`; `[05 output, §9]`; `[07 output, row 5]`; `Q2'26 Earnings Presentation, Aug-13-2026, pp.34–35` (last rate in the pool is Jun-30-2026 spot R$5.1617) | The FX miss case (M3), the whole policy-rate sensitivity row and the Q4'26 currency comparison are unobservable. All three agents label them rather than assume — correct handling, but the setup is blind on its two largest external variables |
| **No consensus line exists for the efficiency ratio**, the one metric management actually guides | **Triggered** | Medium | High | `[04 output, §3]` — "Capital IQ carries no efficiency-ratio estimate for NU, and its components are not separately estimated" | The only quantitative guide that could be tested against the Street cannot be tested. The guidance-vs-consensus table has one comparable row (tax) and it is the contested one |
| **Three driver-level disclosure gaps**: no Q2'25 MXN average rate; no quarterly interest-earning-portfolio balance; no quarterly purchase volume | **Triggered** | Low | High | `[02 output, §4 sector-KPI check and §8]` | Mexico's +79.06% growth cannot be split into currency and operating; the `02` §6a yield is a blended gross-portfolio yield, not the company's own IEP yield; interchange growth cannot be split into volume vs take rate |
| Stale consensus / consensus predates the print | **Not Triggered** | Low | — | Revisions run to Aug-26-2026, after the Aug-13-2026 print `[00 output, §2; 04 output, §1]` | Neither the no-consensus max-30 cap nor a staleness haircut binds on availability. A separate *time-to-print* concern is raised at §2.5 |
| Extraction failures / unreadable documents | **Not Triggered** | Low | — | `manifest.json` reports `failures: 0`; 113 sources `ok`, 2 `in-place` `[00 output, §1]` | Nothing in this pool is absent for extraction reasons. Portuguese-language sources are read and translated, not counted as gaps (CLAUDE.md §27) |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **One quarter is doing most of the work in the margin story** — Q1'26 printed the year's worst margins (gross margin 37.54%, risk-adjusted NIM 9.48%, ECL 34.58% of revenue) and Q2'26 printed a record (42.56%, 12.42%, 26.88%). The "record" is a recovery from an adjacent bad quarter, not a new plateau | **Triggered** | Medium | High | `Q1'26 interim statements (filed May-14-2026)` and `Q2'26 interim statements (filed Aug-14-2026), Statements of Income`; `[03 output, §8]`; `[07 output, §6(c)]` | Any forward read anchored on Q2'26 alone inherits a −294bp/+294bp round trip in two quarters. `07` handles this correctly by publishing both the annualised and one-quarter versions of the bear; `03` §8 states it plainly |
| Annual trend contradicts quarterly trend (annual decelerating +182.2% → +37.0%; quarterly inflecting +18.7% → +50.3%) | **Not Triggered** | Low | — | `[01 output, §6]` — named and adjudicated by name, not averaged | Handled to standard. Both halves must travel together, and they do downstream |
| Margins expanding at the bottom while compressing at the top (net margin up, gross margin down 361bp in FY2025) | **Not Triggered** | Medium | — | `[01 output, §6]`; `[03 output, §3]` — the contradicting series is named with its figures per CLAUDE.md §3 | Handled to standard; carried into §2.4 where the tax split matters |
| Seasonality ignored or over-read | **Not Triggered** | Low | — | `[01 output, §5]` ("not proven from available data"); `[05 output, §6]` carries the qualifier and labels the Q3 net-margin pattern as "judgment with a three-observation prior" | Handled to standard. No Q3-uplift assumption is built anywhere |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **FX contribution to Q2'26 growth is disputed between two upstream agents** — "roughly a fifth" (`01`) vs +16.27pp, a third (`02`) | **Unclear** | Medium | High | `[01 output, §6]` vs `[02 output, §6a]`; `Q2'26 Earnings Presentation, pp.34–35` (R$5.6625 → R$5.0496 = +12.14%) | Adjudicated in §1: **+16.27pp governs any claim about IFRS total revenue**; `01`'s lower read is a different top line (deck gross revenue). The honest range +11.3pp to +16.3pp travels. The synthesis must not average them or quote either without its basis |
| **Deposit funding is growing at half the rate of the loan book, and the gap is absorbed by a finite lever** — deposits +18% YoY FX-neutral vs the book +37%; average loan-to-deposit ratio 50% → 54% → 58% in three quarters; capital adequacy 16.6% → 15.7% | **Triggered** | Medium | High | `Q2'26 Earnings Presentation, Aug-13-2026, slides 13, 14, 16`; `Q2'26 interim statements, Note 33(a), p.43` (regulatory capital 5,597,604; minimum 3,749,565; excess 1,848,040, down from 1,889,626) | This is a threshold constraint, not a slope: revenue growth stops rather than decays when either lever binds. `07` §6(d) captures it; `02` §4 records it as "Mid–High" |
| **Sequential portfolio growth is decelerating on the company's own FX-neutral basis** — +8%, +9%, +11%, +7%, **+5%** QoQ | **Triggered** | Medium | High | `Q2'26 Earnings Presentation, slide 13`; `[02 output, §4]` | Directly relevant to the tax mechanism: `06` §10 shows the deferred tax credit "keeps arriving only while the provision build outruns tax-deductible write-offs, which is only true while the loan book grows fast" — and the growth rate has more than halved in four quarters |
| **Market-share evidence is management estimate, not filed data** — the 7% share and the US$100bn Brazil profit pool | **Triggered** | Low | High | `Q2 2026 earnings-call transcript, Aug-13-2026, Q&A — David Vélez`; `Q2'26 Earnings Presentation, slide 7 note 2`; labelled as management estimates in `[02 output, §3]` | Correctly labelled upstream. Flagged only so the synthesis does not harden "small player, room to grow" into a filed fact |
| Growth described as organic demand when it is price/FX/acquisition | **Not Triggered** | Medium | — | `[02 output, §3]` states plainly: "Reported +50.3% YoY revenue growth is **not** +50.3% of demand"; M&A contribution is 0.00pp (Banco Porto Real is post-quarter, licence-only, pending BCB approval) | Handled to standard |
| Customer concentration | **Not Triggered** | Low | — | `business-model/05_customer-geography`: no customer at 10%+ of revenue in FY2023–H1'26 | Not a risk for this issuer. Geographic concentration (Brazil 91.08%) is a separate, flagged fact |
| Revenue decomposition does not reconcile | **Not Triggered** | Low | — | `RF-EARN-001: revenue decomposition reconciled — explained 54.1pp, residual -3.8pp, total 50.3pp` `[02 output, §6a]`; residual 7.6% of the move, quantified in the "Other" row | Handled to standard |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **The entire reported margin improvement is below the operating lines** — Q2'26 net margin +187bp of which tax was **+300.2bp** and every operating component together **−112.0bp**; **pre-tax margin FELL 155bp YoY** (23.97% → 22.42%) | **Triggered** | **High** | **High** | `[03 output, §7B and §7a]`, reconciled to 0bp residual; `Q2'26 interim statements, Statements of Income and Note 30` (tax 175,224 on pre-tax 1,236,313 = 14.17%, vs 27.56% in Q2'25) | Any "margins are expanding" or "earnings accelerating" read that does not name this is refuted by the module's own arithmetic. It is the single most important sentence in the whole module and must survive into the synthesis intact |
| **The company's own 20-F says ~26.9% of FY2025 costs are USD-linked while most revenue is in reais — which contradicts the module's "FX is near-neutral on margin ratios" claim, and no earnings agent carried it** | **Triggered** | **High** | **High** | `FY2025 Form 20-F (filed Apr-08-2026), Item 3.D`, verified verbatim: "around 26.9% of our costs in the year ended December 31, 2025 were directly or indirectly linked to the U.S. dollar, whereas the majority of our revenue was denominated in reais". Against `[03 output, §5 FX row]`: "Large on *levels*, near-neutral on *margin ratios* — the same rate translates numerator and denominator". Surfaced by `business-model/12_red-flags-sweep` §2, which no earnings agent read | The FX-neutral-margin premise is false for roughly a quarter of the cost base. A BRL depreciation shrinks USD revenue in full while only ~73% of costs shrink with it, so margin compresses as well as levels falling. Zero-mitigation bound on FY2025 figures: revenue 15,774.7 × 0.822 = 12,966.8; costs 12,032.7 × (0.731 × 0.822 + 0.269) = 10,467.3; pre-tax 2,499.5 against 3,179.8 if fully proportional — an extra **~US$680m pre-tax, ~US$560m of net income** beyond a proportional translation. Consequence for the sensitivity table is at §2.8 |
| **The favourable credit-cost move contains a one-off management has already told the market is switching off** — Desenrola cut Q2'26 cost of credit by "about 5%", ~52bp of risk-adjusted NIM (~US$278m of annualised net income), with "more than 4/5" already recognised | **Triggered** | Medium | High | `Q2 2026 earnings-call transcript, Aug-13-2026, Q&A — CFO`; derivation printed in `[03 output, §7a]`; sized at 47.7% of the credit-cost bear in `[07 output, §2a row 1]` | Roughly half the credit-cost bear case is a tailwind ending rather than a deterioration. Correctly derived upstream; flagged so the synthesis does not read the Q2'26 credit-cost level as run-rate |
| **The size of the FQ3'26 operating bar is contested between `03` and `05`** — +227bp (EBIT basis) vs +126bp (EBT basis), and `03`'s derived "gross margin must reach 45.9%–46.3%" conclusion is still in circulation | **Unclear** | Medium | High | Verified in the pool: FQ3'26 EBIT 1,471.19775 (4/6) vs EBT 1,406.02171 (5/6) — a 65.2m gap against ~1–5m for every historical actual pair; FQ3'26 consensus **gross margin 43.16667%** on the same vendor sheet | Adjudicated in §1: `05`'s +126bp on the better-covered EBT line governs the size; `03`'s direction stands. **`03`'s 45.9%–46.3% gross-margin requirement must not be carried** — the vendor's own consensus gross margin is 43.17%, only +61bp above Q2'26's 42.56%. Uncorrected, `03` overstates the difficulty of the Q3 bar by roughly 100bp of margin |
| Gross margin improving on mix or one-off rather than cost control | **Not Triggered** | Medium | — | `[03 output, §7B]` decomposes Q2'26's +36.7bp gross-margin move into funding −11.4, transactional −13.3, credit +51.3 (post-tax bps), reconciled to 0bp residual | Handled to standard |
| Margin bridge does not reconcile | **Not Triggered** | Low | — | `RF-EARN-002: margin bridge reconciled — explained 187bps, residual 0bps, total 187bps` `[03 output, §7a]`; the 7A walk reconciles to 1bp of disclosed rounding | Handled to standard |
| D&A, interest cost or SG&A deterioration ignored | **Not Triggered** | Medium | — | `[03 output, §2b]` itemises the G&A "Others" intercompany-invoice tax rising from US$22.0m to US$136.9m (+188bp of revenue) and D&A +83.7% vs revenue +50.3% | Handled to standard, and the intercompany-tax line is used as the realised offset in `07` row 3b |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **Management states in the pool that sell-side consensus is a MIX of IFRS and managerial frameworks — and no earnings agent quotes it, while the module's central verdict rests on treating an IFRS-labelled vendor tax line as an IFRS estimate** | **Triggered** | **Critical** | **Medium** | `Q1 2026 earnings-call transcript, May-14-2026, IR opening remarks`, verified verbatim: "We are aware that consensus estimates across the sell side reflect the mix of IFRS and managerial frameworks, and we encourage everyone to use the reconciliation report as a reference point for aligning models going forward." Corroborating: the vendor's explicit FQ3'26 and FQ4'26 tax line reads **31.25%**, dead-centre of management's **managerial** 30–35% guide, not its IFRS 15–20% guide; and `Q2'26 Earnings Presentation, Aug-13-2026, Managerial P&L appendix` states the managerial tax-equivalency adjustments "are net-income neutral", which would raise a modeller's pre-tax and tax together while leaving net income unchanged. Counter-evidence, carried: the vendor's *actuals* on that line ARE the filed IFRS rates (FQ1'26 8.6843%, FQ4'25 16.971%, FQ2'25 27.5626%) `[04 output, §7; 05 output, §8(iii)]` | **This is the most dangerous flag in the module.** `04` and `05` both named "analysts may be taxing NU at the managerial rate inside an IFRS-labelled field" as the way their finding could be wrong, then argued against it on the vendor's labelling and actuals. Management's own words say the mix exists. CLAUDE.md §27 was applied to the *period* basis (standalone vs cumulative, `04` §1A) but never to the *accounting* basis. The direction may survive — the Q2'26 print did beat a published consensus by 13.0% on EPS — but the **sizing** (+9.7% to +14.1% of net income) and the "High (≥60%)" probability on `05` B1 are not supportable while this is open |
| **The implied tax rate that anchors the beat case is built from a cross-panel pair** — 24.8% comes from FQ3'26 EBT (1,406.02, 5/6 analysts) against net income (1,057.35, 7/7 analysts), two different panels on possibly two different accounting bases | **Triggered** | **High** | **High** | `Capital IQ Estimates→Consensus, Fiscal Quarters block`, verified; same construction used for the FY2026 30.2% figure in `[04 output, §3]` and carried into `[05 output, §2 B1, §4]` and `[07 output, row 3]` | A rate derived by dividing one panel's number into another panel's number is not a measurement of what any analyst assumes (§15 matched-basis). Combined with the row above, the "12.7pp tax gap" may be partly or wholly a measurement artefact. Note the artefact could still produce reported beats — but it is not evidence of a mispriced bar |
| **The vendor's EBIT and EBT estimate lines do not reconcile for the forecast quarters** — FQ3'26 gap 65.2m, FQ4'26 gap 98.4m, against ~1–5m for every reported actual | **Triggered** | Medium | High | Verified in the pool: EBIT row 1471.19775 / 1630.21325 vs EBT row 1406.02171 / 1531.82444 for FQ3'26 / FQ4'26; actual pairs Q1'25 796.203/795.073 through Q2'26 1,240.976/1,236.313 | `05` §4 caught this and refined `03` §8 by name — good practice. Recorded here because the widening gap is itself consistent with the basis-mix flag above, and because `03`'s uncorrected conclusion is still in the module |
| **Estimates were raised hard into the print** — FQ3'26 revenue 5,531.80 → 5,936.74m (+7.3%) in one month; FY2026 EPS 0.81 → 0.85 (+4.9%); 8↑/0↓ on FY2026 EPS, 11↑/0↓ on net income | **Triggered** | Medium | High | `Capital IQ Estimates→Trends` and `→Revisions`, last-month window through Aug-26-2026; `[04 output, §4–§5]`; `[05 output, §3 M4]` | A bar just lifted is harder to clear than the one that existed before the print. `04` names this as evidence against its own "bar is low" verdict and explains why it does not overturn it (revisions sit above the tax line) — correct handling, kept on the record |
| **The tax guide was given once, three months ago, and was not repeated** — "ETR", "effective tax" and "tax rate" appear zero times in the Aug-13-2026 transcript | **Triggered** | Medium | Medium | `[04 output, §2 caveat 1]`; `[05 output, §5]`; `Q1 2026 earnings-call transcript, May-14-2026` is the sole source | The entire beat mechanism rests on a single un-reiterated modelling parameter whose durability is a management assertion ("a recurring structural feature of how we operate"), not an audited conclusion |
| **Consensus is dated Aug-26-2026; the print is Nov-12-2026 — eleven weeks in which the tax assumption can be corrected before the print** | **Triggered** | Medium | Medium | `Capital IQ Estimates→Recent Changes, top row 2026-08-26`; `Capital IQ Estimates→Consensus, header — FQ3 2026 Earnings Release Date Nov-12-2026` | This is not the staleness the MODULE_RULES haircut covers (consensus post-dates the print). It is forward decay: `05` §10 names it as the quiet failure mode — the gap closes, the beat never arrives, and nothing about the company read was wrong |
| **`00` §5 records "no quantitative guidance" — factually wrong** | **Triggered** | Low | High | `[00 output, §5]` vs `[04 output, §2]`, verified against `Q1 2026 earnings-call transcript, May-14-2026, prepared remarks` | Corrected upstream by `04` before it did damage. Recorded so the synthesis uses `04`'s four numeric forward statements, not `00`'s null |
| Consensus above guidance midpoint on the operating lines | **Not Triggered** | Medium | — | No revenue, EPS, EBITDA or capex guidance exists to compare `[04 output, §3]` | Not comparable — a disclosure fact about how NU communicates, not a missing document, and it triggers no MODULE_RULES cap |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **The miss case is at least as simple as the beat case, and it has fired twice in the last four quarters** — a pre-tax miss worse than ~−9% to −12% overwhelms the tax cushion; pre-tax printed −16.63% (Q4'25) and −24.59% (Q1'26), and both quarters delivered EPS misses despite the tax line absorbing ~76% of the damage | **Triggered** | **High** | **High** | `[05 output, §3 M1 and §4]`; `Capital IQ Estimates→Surprise, EBT (GAAP), FQ3 2024–FQ2 2026`, verified: −1.98, −5.06, −1.25, +1.09, +9.55, −16.63, −24.59, +0.46%; mean −4.80% | `05` rates its own beat case "High (≥60%)" and its central miss case "Mid (45–60%)". Given the flags above on the beat mechanism's sizing, and a pre-tax series with a five-point downward bias, that asymmetry is not supported by the evidence and should be narrowed |
| **The EPS beat trigger and the beat-case per-share figures use a share count 2.7% below the actual reported one** — `05` uses 4,770m implied by dividing the consensus net income panel by the consensus EPS panel, while the filing's own Q2'26 figures imply 4,903.8m (1,060,199 ÷ 0.2162) and `07` uses 4,908.7m | **Triggered** | Medium | High | `[05 output, §4 and §7 T2]` vs `Q2'26 interim statements, Statements of Income` (net income to parent 1,060,199; diluted EPS 0.2162); `[07 output, base]` | Two consequences. (i) The T2 beat trigger of ≥US$0.243 is set ~2.8% too high: 1,159.97m ÷ 4,903.8m = **0.2365**, not 0.2432. (ii) `05` B1's claim that a 14.17% tax rate gives EPS of 0.2530, "above the highest single estimate in the 9-analyst panel (0.25)", **flips** on the correct count: 1,206.80 ÷ 4,903.8 = **0.2461**, below the panel high. The net-income beat percentages are unaffected |
| **A probability band is presented as a measured frequency over a sample that spans two different tax regimes** — `05` B1 is rated "High (≥60%), Basis: empirical, n=8", but the tax structure producing the gap only appeared in Q4'25, so only 3 of the 8 observations are in the relevant regime | **Triggered** | Medium | High | `[05 output, §2 B1]` vs `[05 output, §7]`, which concedes "only three quarters of the *relevant* regime exist" | CLAUDE.md §9 requires the base rate to match the claim's **period**. A counterfactual applied backwards across a regime change is judgment with a three-observation prior, not an n=8 frequency. `05` states the correct qualifier in §7 but not in the row that carries the probability band — the qualifier fell off between sections (§3) |
| **A vendor column misalignment in `05`'s citation block, presented as a vendor inconsistency** — `05` records FQ4'26 net income as 1,095.43463 and builds a "vendor inconsistency" note on it; 1,095.43463 is the **FQ1'27** column, and FQ4'26 is **1,159.04083** | **Triggered** | Low | High | Verified in the pool by column alignment across four rows: revenue 5,513.208 / 5,936.7375 / 6,318.7645 / 6,455.75225 and EPS 0.2162 / 0.22164 / 0.24278 / 0.24013 for FQ2'26A / FQ3'26E / FQ4'26E / FQ1'27E; net income 1,060.199 / 1,057.34911 / **1,159.04083** / 1,095.43463. Cross-check: 0.24278 × 4,770m ≈ 1,158 | Immaterial to any threshold — and `05` §9 uses the **correct** 1,159.04 in its body ("net income 1,159.04 ÷ pre-tax 1,531.82 implies 24.34%"). But the footnote asserts a vendor defect that does not exist, which is a §20 bad-extraction error the synthesis should not repeat. The second half of that footnote (the 171.3m quarterly-vs-annual revenue panel gap) is real |
| **Two forward triggers are weak tests (§17)** — (i) `06`'s `RF-EQ-002` forward test ("if FY2026 also closes below 50% on CFO ÷ net income") is already satisfied by the status quo: H1'26 is −64% and TTM is −38.3%, so it is near-certain to fire; (ii) `03` §9's credit flip observable uses "materially less than the ~68% share", with no number attached to "materially" | **Triggered** | Low | High | `[06 output, §2]`; `[03 output, §9]`; H1'26 CFO −1,242.0 against H1'26 net income to parent 1,932.255 (`Q2'26 interim statements`) | Neither is capable of doing the discriminating work a §17 trigger is for. The other six triggers (`05` §7 T1–T6) each state their like-for-like comparable, their implied stub arithmetic, and what they would have done on the last two reported periods — those are to standard |
| Beat case requires too many things to go right | **Not Triggered** | Medium | — | `05` B1 requires two conditions (pre-tax near consensus, tax at guide) — a short conjunction, not a stacked one | The conjunction problem here is the opposite: the beat rests on **one** mechanism, which is why §2.5's flags on that mechanism are severe |
| Consensus unavailable, making beat/miss unreliable | **Not Triggered** | Low | — | Full consensus, surprise, trends and revisions tabs present and post-quarter `[00 output, §5]` | No MODULE_RULES cap binds on availability |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **Deferred-tax concentration** — 40.4% of TTM net income to parent (US$1,458.6m of US$3,607.1m) is a non-cash deferred tax credit; cash tax paid US$2,108.1m is **2.7×** the P&L charge US$774.6m; the deferred tax asset is **27.5% of equity attributable to the parent**; and the Brazilian combined statutory rate **rose** to 42.5% | **Triggered** | **High** | **High** | Verified directly in the pool: `Q2'26 interim statements, Note 30 — Income Tax` — deferred tax assets **3,649,091** at 06/30/2026 vs 2,510,967 at 12/31/2025; `Statements of Financial Position` — equity attributable to shareholders of the parent company **13,249,670** (3,649,091 ÷ 13,249,670 = **27.54%**); Note 30 reconciliation "applying the combined Brazilian income tax rate of **42.5%**" (2026) against **40.0%** (2025); recovery of the loss-carryforward slice "limited to 30% of taxable profit per year for the Brazilian entities". Concentration measures from `[06 output, §1a, §3, §9, §10]` | **Judged a §13 red flag at High severity, not Critical.** It is High because: it is the single largest accrual in the accounts; it is the same line that produced 96.7% of the last beat and 100% of the last net-margin expansion; it is self-reversing by construction (it arrives only while the provision build outruns tax-deductible write-offs, i.e. only while the book grows fast — and sequential growth has halved to +5% QoQ FX-neutral); and its durability rests on a management assertion, not an audited conclusion. It is **not** Critical because it is fully disclosed, correctly applied under IAS 12, audited across five annual filings, the credit-loss allowance behind it is building rather than releasing (coverage 15.37% → 16.86%), cash collection of accrued interest has improved four years running, and there is no impairment, restatement, policy change or useful-life change anywhere in the pool. It caps earnings quality (`06` scored 58/100) and must cap any conviction drawn from the reported EPS line |
| **Company-basis operating cash flow is negative on a twelve-month view and the funding gap is widening** — TTM CFO −US$1,381.6m; H1'25 +3,640.0 → H1'26 −1,242.0; self-funding of the credit book 84.8% → **36.0%**; gross credit assets ÷ deposits 77.9% → **86.9%** in six months | **Triggered** | Medium | High | `[06 output, §1a, §2, §3]`; `Q2'26 interim statements, Statements of Cash Flows and Notes 13, 14, 22` | For a growing lender this is balance-sheet growth, not a collection failure — `06` proves that by showing cash interest received rising to 72.0% of accrued interest. But it is a real swing in the reported line and it constrains the growth variable. `RF-EQ-002` correctly does **not** fire on the authoritative basis (FY2023–FY2025 all above 120%) |
| **An unexplained US$127.3m gap in H1'26 intangibles** — Note 19 shows total intangible additions of 211.5 against 84.2 of cash paid for intangibles in the cash-flow statement; the FY2025 equivalents match closely (331.1 vs 333.6) | **Triggered** | Medium | Medium | `[06 output, §6 and §8]`; `Q2'26 interim statements, Note 19 and Statements of Cash Flows` — "Not proven from available data" what the gap is | Recorded rather than forced into a conclusion by `06`, which is correct handling. It sits in the same place as the capitalisation dispute below and should be resolved together |
| **Software capitalisation: `06` marks the flag "N", business-model `12` scores it 52/100 (inverted) and makes it the qualifying row for `RF-RFS-001`** | **Unclear** | Medium | Medium | `[06 output, §6 and §8]`: additions 2.06% / 1.34% / 1.81% of revenue FY2023–FY2025, 1.72% H1'26 — "no rising trend". `business-model/12_red-flags-sweep §2`: additions +84.8% vs revenue +37.0%; US$223,167k of cost kept off FY2025 profit (5.8% of pre-tax, up from 4.2%); **19.5% of the year's additions disposed of in the same year** (16.0% in FY2024). Source for both: `FY2025 Form 20-F, Notes — Intangible assets and goodwill, changes table` | Same data, two measurement bases, opposite conclusions. On `06`'s own intensity basis the ratio still rose 47bp YoY, so "no rising trend" is a statement about H1'26 only. Neither agent addressed the disposal rate, which is the part that bears on earnings quality. The synthesis must carry both readings, not pick one silently |
| **Share-based compensation is excluded from the company's only non-IFRS profit measure, every period** — +359.0 added back in FY2025; SBC 212.6 / 272.4 / 271.8 / 216.8 (H1'26) | **Triggered** | Low | High | `[06 output, §4 and §8]`; `FY2025 Form 20-F, Non-IFRS Financial Measures and Reconciliations` | Mitigated three ways and correctly handled: the adjustment is only +7.1% of reported profit, it is shrinking as a share (16.1% → 11.9% → 7.1%), and every agent uses the reported IFRS figure throughout |
| **Basis-label discipline on the two operating cash-flow figures** — company-basis TTM CFO −US$1,381.6m vs Capital IQ-basis LTM CFO −US$10,304.8m, reconciling via the US$8,923.2m deposit inflow | **Not Triggered — checked line by line** | High if breached | — | Every downstream use carries its label: `[01 output, §2]` (reconciliation proved, both worked); `[06 output, §1 memo rows, §1a, §2]` (both bases in every table, filing basis led); `[07 output, §2 basis labels and §6(e)]` ("Neither is used as a sensitivity base"); `[05 output, §5]` (company basis, labelled). `ciq_facts.json` `ltm_ocf_m` = −10,304.8 is cited as the vendor read, never as the company's CFO | **The §15 matched-basis / §3 basis-dropped test passes.** No agent headlines the vendor figure as the company's operating cash flow, and no agent dismisses the company's own negative figure as a definitional artefact |
| Recurring "one-offs" | **Not Triggered** | Medium | — | `[06 output, §5]` separates genuine one-offs (FGC advance 185.5; first buyback 500.4; FY2022 CSA charge 355.6) from recurring "one-offs" (CSLL rate remeasurement, the tax-rate-differential step-up), each labelled | Handled to standard |
| Fair-value / mark-to-market gains inflating results | **Not Triggered** | Low | — | `[06 output, §8]`: fair-value lines 6.7% of Q2'26 revenue, **down** from 8.6% in Q2'25 | Shrinking as a share, not inflating |
| Receivable factoring / supplier finance | **Not Triggered** | Low | — | `[06 output, §8]`: no sale, securitisation or factoring of the group's own receivables disclosed; the only FIDC reference is a senior quota held as an asset | Checked and clean |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **The BRL earnings coefficient is built on an assumption the 20-F contradicts, so the FX bear case is understated** — `07` uses an elasticity of 0.9 of net income per 1% BRL move, justified by "margin ratios are near-neutral to FX because the same rate translates numerator and denominator", against a filed risk factor saying ~26.9% of costs are USD-linked | **Triggered** | **High** | **High** | `[07 output, §2a row 2]` (elasticity derivation) and `[03 output, §5 FX row]` (the neutrality premise it rests on), against `FY2025 Form 20-F, Item 3.D` verified verbatim; `sensitivity_summary.json` `brl_usd_translation` coefficient 32.46 | The published bear (BRL −17.8% → −US$577.9m of net income) prices translation only. Adding the cost mismatch on FY2025 figures as a zero-mitigation bound gives roughly **another US$560m of net income**, i.e. the bear is understated by close to a factor of two. This changes the sensitivity ranking: BRL/USD, not credit cost, would rank first on the bear. The coefficient in the machine-readable sidecar inherits the same defect |
| **The top three sensitivities sit within ~4% of TTM net income of each other, so the ranking is not decision-grade** — credit cost US$556.8m, BRL/USD US$486.0m, tax US$403.4m at the bound | **Triggered** | Medium | High | `[07 output, §3]`, which says so itself: "the three sit inside one band … which is not a wide separation and should not be treated as one" | The synthesis must not present "credit cost is the single biggest variable" as a ranked fact. With the flag above, the ordering probably changes |
| **The net earnings effect of the Brazilian policy rate cannot be signed at all, and no reading exists after Apr-08-2026** | **Triggered** | Medium | High | `[07 output, row 5, 5a, 5b and §2a]` — the funding-cost bound explains "0% of the NET earnings effect", residual 100%; the observed record runs the other way (NIM +410bp YoY at a decade-high Selic while cost of deposits fell 91% → 88% of the interbank rate) | Honest and correctly refused rather than estimated. But it leaves a High-rated external dependency with no quantified direction, which caps how far any macro-conditional read can go |
| **Multiple bear cases are correlated and compound rather than offset** — a depreciating real, a higher Selic and a rising credit-loss rate travel together | **Triggered** | Medium | Medium | `[07 output, §5(a)]`: "a reader adding the FX bear (−US$577.9m) to the credit-cost bear (−US$583.3m) is not double counting, they are compounding" | The individual rows understate a joint adverse state. `07` names it; the synthesis must not treat the sensitivity table as a set of independent draws |
| **The composite bear is published at an annualised size the record does not support** — risk-adjusted NIM −294bp annualised is −US$1,558.9m, 43.2% of TTM net income, from a single quarterly observation that reversed in full the next quarter | **Triggered** | Low | High | `[07 output, row 6 and §6(c)]`, which publishes the one-quarter version (−US$389.7m) alongside and warns "COMPOSITE — never add to rows 1, 5 or 7" | Correctly double-published and flagged. Low severity because the handling is right; recorded so the annualised figure is never quoted alone |
| **Which sensitivity ranks first is contested** — `07` ranks credit cost first on magnitude; `03`/`04`/`06` build a tax-and-FX-led story on attribution | **Unclear** | Medium | High | `[07 output, §3]` vs `[03 output, §7B]`, `[04 output, §6]`, `[06 output, §9]` | Adjudicated in §1: **`07`'s ranking governs forward sensitivity and scenario claims; `03`/`04`/`06` govern attribution claims about the last print.** Both are printed and neither is averaged. The synthesis must say which question it is answering before it quotes either |
| Only inferred sensitivities exist | **Not Triggered** | Medium | — | `[07 output, §7]`: DV01 disclosed at two shock sizes across five curves, a company FX shock table with its own percentile basis, and an ECL macro-scenario table at the latest interim date | The MODULE_RULES cap requiring Low confidence where only inferred sensitivities exist does **not** bind |
| Covenant or leverage threshold non-linearity | **Not Triggered** | Low | — | `[07 output, §6]`: net cash of US$7,811.0m at Jun-30-2026 on a strict, filing-confirmed basis (borrowings 4,682.3 + repos 1,058.3 − cash 13,551.6); no EBITDA exists for this issuer | Checked and absent |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **Three loan-to-deposit ratios for the same quarter, and the most reassuring one has no published definition** — 35% (CFO on the call), 58% (deck average basis, defined), 86.9% gross credit assets ÷ deposits (`06`) / 88.9% on the vendor basis | **Triggered** | Medium | High | `Q2 2026 earnings-call transcript, Aug-13-2026, prepared remarks` ("loan-to-deposit ratio still at just 35%"); `Q2'26 Earnings Presentation, slide 16 and slide 27` (Avg. LDR 58% with its definition); `[06 output, §3]`; flagged at severity 50 in `business-model/12_red-flags-sweep §2` | `03` §2a handles it correctly ("two different figures, both disclosed, do not blend"). The synthesis must not let 35% stand as the same measure as 58% or 86.9% (§15 matched-basis), and must not quote it as evidence of funding comfort |
| **Two prices for the same date inside the pool, and `00` mischaracterises the conflict** — `00` frames it as CIQ USD 14.88 versus the in-house memo's USD 14.30, but the Capital IQ Estimates workbook itself carries "Latest Price/Last Close Price 14.30/14.30" | **Triggered** | Low | High | `[00 output, §3 reconciliation item 1]`; `Capital IQ Estimates→Consensus, header block`, verified in the pool; `Capital IQ Financials→Key Stats — Share Price USD 14.88, export as of Aug-28/29-2026` | Immaterial to this module (price is used only for master-level context) but the framing matters: the discrepancy is **within** the vendor exports, not between a vendor and the memo, so it cannot be resolved by preferring the vendor. The synthesis should state the basis it uses |
| **`04` attributes the Q1'26 tax guide to the wrong CFO** | **Triggered** | Low | High | `[04 output, §2]` (Rob Livingston) vs `[06 output, citation 15]` (Guilherme Marques do Lago). Verified: `Q1 2026 earnings-call transcript, May-14-2026` names "Guilherme Lago, our Chief Financial Officer"; the CFO seat changed to Livingston on 13 Jul 2026 (`business-model/12_red-flags-sweep §1`) | The quote itself is verbatim-identical and unaffected. `06` corrected it and `05` carried the correction; `04`'s text is uncorrected. Attribution only |
| Vendor CFO figure conflicts with the filing | **Not Triggered** | High if breached | — | Reconciled exactly and shown on both bases everywhere — see §2.7 | Checked and clean |
| Vendor net debt conflicts with the filing | **Not Triggered** | Low | — | `[01 output, §1]`: sidecar −9,274.2 (broad basis, netting liquidity of 15,170.9) vs filing-built −7,811.0 (strict); the gap of 1,463.2 is decomposed line by line and labelled | Handled to standard |
| Deck-defined gross profit conflicts with IFRS gross profit | **Not Triggered** | Medium | — | `[01 output, §3 note 1]`: Q2'26 deck 2,441 vs IFRS 2,346.5 (gap 94.5); Q2'25 deck 1,519.3 vs IFRS 1,548.0 (gap −28.7) — "the gap is not stable, so the deck series must never be substituted into the IFRS row" | Handled to standard, kept in separate labelled rows |
| Management commentary contradicts reported numbers | **Not Triggered** | Medium | — | The one instance found — the CFO's "we don't really see any significant or structural deterioration" against 90+ NPLs at a 13-quarter high of 6.9% — is named with both figures in `[02 output, §3]` and `[03 output, §8]`, along with the CFO's own concession that "the general trend is upwards, and that's being driven by the mix" | Handled to standard |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **The module's headline verdict is a claim about the reported EPS line, not about earnings accelerating — and the two are easy to conflate** | **Triggered** | **High** | **High** | `[05 output, §8]` "Setup favors beat — on the reported net-income and EPS line, and only there", with three qualifiers attached; `[04 output, §7]` "the operating bar for Q3'26 is fair-to-demanding, the tax bar is clearly too high" | The MODULE_RULES verdict categories describe the *trajectory of earnings*, not the *beatability of consensus*. A reader taking "setup favors beat" as "earnings accelerating" would be reading a consensus-modelling gap as an operating inflection. `05`'s qualifiers must survive into the synthesis word for word (§3) |
| **Reported +50.3% revenue growth and +187bp net-margin expansion are substantially currency and tax, not operating acceleration** — ~32% of the growth is the average BRL rate (`02`), and 100% of the margin expansion is tax while pre-tax margin fell 155bp (`03`) | **Triggered** | **High** | **High** | `[02 output, §6a]`; `[03 output, §7B]`; `Q2'26 Earnings Presentation, pp.34–35`; `Q2'26 interim statements, Statements of Income` | This is the specific misreading the module exists to prevent, and every agent flags it. It is recorded here at High severity because it is the shape of the whole setup: strip currency and tax, and the operating picture is a decelerating book (+5% QoQ FX-neutral) at a cyclical margin high with rising delinquency |
| **Q2'26 is at or near a cyclical high on profitability and is expressly not a normalised run-rate** — record risk-adjusted NIM, record ROE, first US$1bn quarter, alongside 90+ day NPLs at 6.9%, the highest in the 13-quarter series | **Triggered** | Medium | High | `[02 output, §6b]`; `[03 output, §8 cycle position]`; `Q2'26 Earnings Presentation, slides 15–17`; `Q2 2026 transcript, prepared remarks` | Correctly labelled by both agents with the young-entity caveat (roughly one rate cycle of standalone history). Flagged so downstream modules do not adopt Q2'26 as a baseline |
| **Business-model `12_red-flags-sweep` was not read by any earnings agent, and three of its findings bear directly on this module** — the 26.9% USD-linked cost base, the software-capitalisation pattern, and the three-way LDR conflict | **Triggered** | Medium | High | Citation blocks of `02`, `03`, `06`, `07` list `business-model/02`, `03`, `06`, `10` — none lists `12_red-flags-sweep`. MODULE_RULES "Cross-Module Inputs" names only `03`, `06` and `10`, so this is a framework gap, not agent negligence | The largest single miss in the module (§2.4, the FX-neutral-margin premise) came through this gap. Worth fixing at the framework level, and worth the synthesis reading `12` directly |
| **The prior in-house memo's verdict leaking into the module** | **Not Triggered — tested** | High if breached | — | All seven agents carry an explicit strip statement and a "Not used as a source for any number" line. I searched every upstream file for memo-derived figures: the only memo-unique number (`USD 14.30`) appears in no agent's analysis, and `00` cites it only to record the conflict — and even that framing is partly wrong (§2.9), since 14.30 is also the Capital IQ Estimates workbook's own price | **CLAUDE.md §24 is satisfied.** No upstream agent leaned on the memo |
| Setup is really a macro / policy bet disguised as a company read | **Not Triggered** | Medium | — | Partly true and already disclosed rather than hidden: `business-model/10_external-dependency` scores 57/100 (inverted) and classifies NU "Partly externally driven"; `07` §4 splits credit cost into external rate and company-chosen exposure | Flagged for the thesis-type classification (CLAUDE.md §14) at master level, but the module does not disguise it |
| Bull case relies on adjectives rather than numbers | **Not Triggered** | Low | — | Every bullish claim in §1 carries a filed or disclosed figure; no banned phrase appears without evidence in the same sentence | Handled to standard |

---

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Guidance / Consensus | Management states consensus is a mix of IFRS and managerial frameworks; no earnings agent quotes it, and the central verdict treats an IFRS-labelled vendor tax line as an IFRS estimate | Triggered | **Critical** | Medium | The "12.7pp tax gap" behind "bar is low" and "setup favors beat" may be a basis artefact; the sizing is unsupportable while it is open |
| 2 | Data Completeness | The Managerial P&L reconciliation report management points analysts to is absent from the pool | Triggered | High | High | The one document that would settle flag 1 is not in the evidence set |
| 3 | Data Completeness | Estimate panels behind the central claim are thin — FQ3'26 tax rate 2/2, EBIT 4/6, revenue 4/8 | Triggered | High | High | The number the beat case is measured against rests on two analysts |
| 4 | Margins | 100% of Q2'26's +187bp net-margin expansion is tax (+300.2bp); operating components together −112.0bp; pre-tax margin FELL 155bp | Triggered | High | High | Refutes any operating-led margin narrative from the module's own reconciled arithmetic |
| 5 | Margins | ~26.9% of FY2025 costs are USD-linked while most revenue is in reais — contradicts the "FX near-neutral on margin ratios" premise; no earnings agent carried it | Triggered | High | High | The FX bear compresses margin as well as levels; roughly another US$560m of net income on a zero-mitigation bound |
| 6 | Guidance / Consensus | The 24.8% / 30.2% implied tax rate is built from a cross-panel pair (EBT 5/6 ÷ net income 7/7), possibly on two accounting bases | Triggered | High | High | A rate derived across panels is not a measurement of what any analyst assumes (§15) |
| 7 | Beat / Miss | The miss case is at least as simple as the beat case and has fired twice in four quarters (pre-tax −16.63%, −24.59%) | Triggered | High | High | The High-vs-Mid asymmetry between `05`'s beat and miss cases is not supported |
| 8 | Earnings Quality | Deferred-tax concentration: 40.4% of TTM profit non-cash, cash tax 2.7× the P&L charge, DTA 27.5% of parent equity, statutory rate rising to 42.5% | Triggered | High | High | A §13 red flag at High severity; caps earnings quality and any conviction from reported EPS |
| 9 | Sensitivity | `07`'s BRL coefficient (0.9 elasticity) rests on the FX-neutral-margin premise flag 5 contradicts | Triggered | High | High | FX bear understated by close to a factor of two; the sensitivity ranking probably changes |
| 10 | Narrative | The headline verdict is about beatability of consensus, not about earnings trajectory — easy to conflate with "earnings accelerating" | Triggered | High | High | `05`'s three qualifiers must survive into the synthesis word for word |
| 11 | Narrative | Reported +50.3% growth and +187bp margin expansion are substantially currency and tax, not operating acceleration | Triggered | High | High | Strip both and the operating picture is a decelerating book at a cyclical margin high with rising delinquency |
| 12 | Data Completeness | No BRL reading after Jun-30-2026; no Selic/CDI reading after Apr-08-2026 | Triggered | Medium | High | The FX miss case and the entire policy-rate row are unobservable |
| 13 | Data Completeness | No consensus line exists for the efficiency ratio — the one metric management guides | Triggered | Medium | High | The single testable guide cannot be compared with the Street |
| 14 | Historical Trend | One quarter is doing most of the work: Q1'26 worst margins, Q2'26 record, a 294bp round trip in six months | Triggered | Medium | High | Any forward read anchored on Q2'26 alone inherits that volatility |
| 15 | Revenue | Deposits +18% FX-neutral against the book +37%; average LDR 50% → 58%; CAR 16.6% → 15.7% | Triggered | Medium | High | Threshold constraints, not slopes — growth stops rather than decays |
| 16 | Revenue | Sequential portfolio growth decelerating +11% → +7% → +5% QoQ FX-neutral | Triggered | Medium | High | Directly undercuts the deferred-tax mechanism, which needs fast book growth |
| 17 | Revenue | FX contribution to Q2'26 growth disputed: "roughly a fifth" (`01`) vs +16.27pp (`02`) | Unclear | Medium | High | `02` governs on IFRS revenue; the +11.3–16.3pp range travels; do not average |
| 18 | Margins | Desenrola one-off ~52bp of risk-adjusted NIM, "more than 4/5" already booked | Triggered | Medium | High | Roughly half the credit-cost bear is a tailwind ending, not a deterioration |
| 19 | Margins | Size of the FQ3'26 operating bar contested: +227bp (`03`, EBIT) vs +126bp (`05`, EBT) | Unclear | Medium | High | `05` governs the size; `03`'s "45.9–46.3% gross margin" must not be carried — consensus gross margin is 43.17% |
| 20 | Guidance / Consensus | Vendor EBIT and EBT estimate lines do not reconcile (65.2m FQ3'26, 98.4m FQ4'26) against ~1–5m for actuals | Triggered | Medium | High | Consistent with the basis-mix flag; `03`'s uncorrected conclusion still circulates |
| 21 | Guidance / Consensus | Estimates raised hard into the print (+7.3% FQ3'26 revenue, +4.9% FY26 EPS in one month; 8↑/0↓, 11↑/0↓) | Triggered | Medium | High | A bar just lifted is harder to clear than the one before the print |
| 22 | Guidance / Consensus | The tax guide was given once, three months ago, and was not repeated on the Aug-13-2026 call | Triggered | Medium | Medium | The whole beat mechanism rests on one un-reiterated, unaudited parameter |
| 23 | Guidance / Consensus | Consensus dated Aug-26-2026 against a Nov-12-2026 print — eleven weeks for the tax assumption to be corrected | Triggered | Medium | Medium | The gap can close before the print with nothing about the company read being wrong |
| 24 | Beat / Miss | Beat trigger and per-share figures use 4,770m shares (consensus-implied) against 4,903.8m implied by the filing | Triggered | Medium | High | T2 is set ~2.8% too high, and `05`'s "above the panel high (0.25)" claim flips to 0.2461 |
| 25 | Beat / Miss | `05` B1's "empirical, n=8" probability spans two tax regimes; only 3 of 8 observations are in the relevant one | Triggered | Medium | High | Judgment with a three-observation prior presented as a measured frequency (§9/§10) |
| 26 | Earnings Quality | Company-basis TTM CFO −US$1,381.6m; self-funding 84.8% → 36.0%; gross credit assets ÷ deposits 77.9% → 86.9% | Triggered | Medium | High | Growth-driven, not a collection failure — but a real swing that constrains the growth variable |
| 27 | Earnings Quality | Unexplained US$127.3m gap between H1'26 intangible additions (211.5) and cash intangible capex (84.2) | Triggered | Medium | Medium | Recorded rather than forced; sits with flag 28 and should be resolved together |
| 28 | Earnings Quality | Software capitalisation: `06` marks "N", business-model `12` scores it 52 and makes it the `RF-RFS-001` qualifying row | Unclear | Medium | Medium | Same data, two bases; neither agent addressed the 19.5% same-year disposal rate |
| 29 | Sensitivity | Top three sensitivities sit within ~4% of TTM net income of each other | Triggered | Medium | High | The ranking is not decision-grade and must not be quoted as a ranked fact |
| 30 | Sensitivity | The net earnings effect of the Brazilian policy rate cannot be signed; no reading after Apr-08-2026 | Triggered | Medium | High | A High-rated external dependency with no quantified direction |
| 31 | Sensitivity | Bear cases are correlated — BRL, Selic and credit cost move together adversely | Triggered | Medium | Medium | Individual rows understate a joint adverse state |
| 32 | Sensitivity | Which sensitivity ranks first is contested: `07` credit cost vs `03`/`04`/`06` tax-and-FX | Unclear | Medium | High | `07` governs forward sensitivity; `03`/`04`/`06` govern attribution — say which question first |
| 33 | Source Conflicts | Three loan-to-deposit ratios for one quarter (35% / 58% / 86.9%), and the most reassuring has no published definition | Triggered | Medium | High | Do not let 35% stand as the same measure as 58% or 86.9% (§15) |
| 34 | Narrative | Q2'26 is at or near a cyclical high and expressly not a normalised run-rate, alongside 90+ NPLs at a 13-quarter high | Triggered | Medium | High | Downstream modules must not adopt Q2'26 as a baseline |
| 35 | Narrative | Business-model `12_red-flags-sweep` was read by no earnings agent; three of its findings bear on this module | Triggered | Medium | High | The largest miss in the module (flag 5) came through this framework gap |
| 36 | Data Completeness | Three driver-level gaps: no Q2'25 MXN rate, no quarterly IEP balance, no quarterly purchase volume | Triggered | Low | High | Mexico's growth cannot be split; the yield is blended, not an earning-asset yield |
| 37 | Revenue | Market-share evidence (7% share, US$100bn profit pool) is management estimate, not filed data | Triggered | Low | High | Correctly labelled; flagged so it does not harden into a filed fact |
| 38 | Guidance / Consensus | `00` §5 records "no quantitative guidance" — factually wrong; four numeric forward statements exist | Triggered | Low | High | Corrected by `04` before it did damage; use `04`'s four statements |
| 39 | Beat / Miss | `05`'s FQ4'26 net income citation uses the FQ1'27 column (1,095.43 vs the correct 1,159.04) and builds a spurious vendor-inconsistency note on it | Triggered | Low | High | Immaterial to thresholds — `05` §9 uses the correct figure — but it is a §20 bad-extraction error not to repeat |
| 40 | Beat / Miss | Two forward triggers are weak tests: `06`'s `RF-EQ-002` FY2026 test is already satisfied by the status quo; `03`'s flip observable has no number on "materially less" | Triggered | Low | High | Neither can do the discriminating work a §17 trigger is for |
| 41 | Earnings Quality | Share-based compensation excluded from the company's only non-IFRS profit measure, every period | Triggered | Low | High | Mitigated: +7.1% of profit, shrinking, and every agent uses reported IFRS |
| 42 | Sensitivity | The composite risk-adjusted NIM bear is published annualised at −US$1,558.9m (43.2% of TTM profit) from one quarterly observation that fully reversed | Triggered | Low | High | Correctly double-published; never quote the annualised figure alone |
| 43 | Source Conflicts | Two prices for Aug-28-2026 inside the vendor exports (14.88 vs 14.30); `00` frames it as vendor-vs-memo | Triggered | Low | High | The conflict is within the vendor data, so it cannot be resolved by preferring the vendor |
| 44 | Source Conflicts | `04` attributes the Q1'26 tax guide to the wrong CFO (Livingston, not Lago) | Triggered | Low | High | Quote is verbatim-identical; `06` corrected it, `04`'s text did not |

---

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | **40** |
| Critical flags | **1** (triggered) |
| High flags | **10** (triggered) |
| Medium flags | **20** (triggered) + 4 unclear = 24 rows at Medium severity |
| Low flags | **9** (triggered) |
| Unclear flags | **4** (all Medium severity: FX contribution size; operating-bar size; software capitalisation; sensitivity ranking) |
| Unavailable checks (data missing) | **5** — Mexico's FX-vs-operating growth split; the current BRL level; the current Selic/CDI level; the Q4'26 currency comparison; a realised mitigation offset for credit cost (no downturn exists in the disclosed history) |

*Severity counts for triggered flags only sum to 40 (1 + 10 + 20 + 9). The four unclear rows are all Medium severity and are counted separately.*

---

## 5. Red-Flag Severity Verdict

**Critical concerns.**

One critical flag is present, and it sits directly under the module's headline finding: management stated on the May-14-2026 call — in the pool, verbatim — that "consensus estimates across the sell side reflect the mix of IFRS and managerial frameworks", while `04` and `05` built "bar is low" and "setup favors beat" on the premise that an IFRS-labelled vendor tax line of 31.25% represents an IFRS assumption. That 31.25% is dead-centre of management's own **managerial** 30–35% guide, the vendor's EBIT and EBT estimate lines have diverged to 65.2m for the same quarter against ~1–5m for every reported actual, and the deck says the managerial tax-equivalency adjustments are "net-income neutral" — three independent tells pointing the same way. The historical, driver, margin and quality work below that verdict is well-evidenced and reconciles; it is the **consensus and beat/miss layer specifically** that should be downgraded, not the whole module.

**The single most dangerous red flag is #1, and what would resolve it is one document:** the Managerial P&L reconciliation report management directs analysts to, which is not in this pool. Failing that, a broker-level breakdown of which analysts' FQ3'26 pre-tax estimates sit on the managerial basis would settle it; short of either, the tax gap must be presented as a possible basis artefact with its size unmeasurable, and `05`'s "High (≥60%)" on the beat case must come down.

---

## 6. What The Synthesis Agent Should Know

- **40 red flags triggered plus 4 unclear:** 1 Critical, 10 High, 24 at Medium (20 triggered + 4 unclear), 9 Low. Five checks are unavailable for data reasons, none of them language-related.
- **The single most dangerous flag is the consensus accounting basis.** Evidence: `Q1 2026 earnings-call transcript, May-14-2026, IR opening remarks` — "consensus estimates across the sell side reflect the mix of IFRS and managerial frameworks"; the vendor's explicit FQ3'26 tax line of 31.25% sitting inside management's managerial 30–35% guide rather than its IFRS 15–20% guide; a 65.2m EBIT-vs-EBT estimate gap against ~1–5m for actuals; and the deck's statement that managerial tax-equivalency adjustments are "net-income neutral". The counter-evidence is real and must travel: the vendor's *actuals* on that line ARE the filed IFRS rates (FQ1'26 8.6843%, FQ4'25 16.971%), and Q2'26 did print a genuine +13.0% EPS beat against a published consensus.
- **Yes, a red flag should change the earnings verdict.** `05`'s "Setup favors beat" and `04`'s "Bar is low" should be restated as **conditional on an accounting basis this pool cannot verify**. On the module's own arithmetic the operating bar is fair-to-demanding (+126bp of pre-tax margin on the better-covered EBT line), the currency tailwind more than halves (+12.14% → +5.57% if spot holds), and pre-tax has a five-point downward bias with two breaches of the tax cushion in four quarters. With the beat mechanism's sizing in doubt, **"Mixed earnings setup" is the honest category** — accelerating reported EPS on a tax line, decelerating operating drivers underneath.
- **Score caps to apply.** (i) MODULE_RULES "Conflicting sources not reconcilable → **Overall usefulness max 65**" binds: the IFRS-vs-managerial consensus conflict cannot be reconciled from this pool because the reconciliation report is absent. (ii) No named consensus cap binds mechanically (consensus is present and post-quarter), so apply an **explicitly-labelled discretionary haircut to the consensus-setup score** — I would put it no higher than the 41–60 mixed band — citing flags 1, 3 and 6, and do NOT borrow the no-consensus max-30 value, which would read as "consensus absent". (iii) `06`'s earnings quality of 58/100 stands and should not be lifted; the deferred-tax concentration (flag 8) independently supports it. (iv) `07`'s earnings volatility of 66/100 (inverted, higher = worse) is arguably **too low** given flag 5 widens the FX bear by roughly a factor of two — consider revising it worse.
- **Contradictions the synthesis must reconcile, with the adjudications already made in §1:** FX share of Q2'26 growth (`02`'s +16.27pp governs IFRS revenue; range +11.3–16.3pp travels); operating-bar size (`05`'s +126bp governs; do **not** carry `03`'s 45.9–46.3% gross-margin requirement, because the vendor's own consensus gross margin is 43.17%); sensitivity ranking (`07` governs forward claims, `03`/`04`/`06` govern attribution); guidance existence (`04` right, `00` wrong); CFO attribution (`06` right, `04` wrong); software capitalisation (unresolved — carry both readings).
- **Two arithmetic corrections the synthesis should apply, not repeat:** the diluted share count is ~4,903.8m from the filing, not the 4,770m the consensus pair implies — which lowers `05`'s T2 trigger from 0.243 to ~0.2365 and flips its claim that a 14.17% tax rate puts EPS above the panel high (0.2461, not 0.2530); and FQ4'26 consensus net income is 1,159.04m, not the 1,095.43m in `05`'s citation block (that is FQ1'27).
- **Missing data that prevented a full scan:** the Managerial P&L reconciliation report; any BRL reading after Jun-30-2026; any Selic/CDI reading after Apr-08-2026; a Q2'25 MXN average rate; a quarterly interest-earning-portfolio balance; a definition for the 35% loan-to-deposit figure; and any credit downturn in NU's disclosed history from which to measure a realised mitigation offset.
- **Read `business-model/12_red-flags-sweep.md` directly.** No earnings agent read it, and three of its findings bear on this module — the 26.9% USD-linked cost base (which contradicts the FX-neutral-margin premise underneath `03` §5 and `07` row 2), the software-capitalisation pattern (which contradicts `06` §6's "N"), and the three-way LDR conflict. MODULE_RULES lists only business-model `03`, `06` and `10` as cross-module inputs; that list is too narrow.
- **The setup is dirtier than the upstream agents suggested — but not in the places they were careless.** The upstream work is unusually disciplined: both driver bridges reconcile to ≤1bp of residual, the two cash-flow bases carry their labels everywhere, the prior memo's verdict is fully stripped by all seven agents, the base-rate and sample-size caveats are mostly stated, and `05` corrected `03` and `06` corrected `04` by name rather than silently. The problems are concentrated in one place: **the consensus layer, where a bar was restated onto the right period basis and never onto the right accounting basis.**

---

## 7. Pre-Mortem — If The Earnings Setup Fails

If this setup fails, the most likely reason is that we measured NU's earnings against a bar that was never on NU's reporting basis. CLAUDE.md §27 was applied carefully to the *period* question — `04` §1A proved the vendor's quarterly fields are standalone-quarter diluted figures and restated the nine-month bar correctly — and then the *accounting-basis* question went unasked, even though management answered it unprompted on the May-14-2026 call: "consensus estimates across the sell side reflect the mix of IFRS and managerial frameworks." Everything downstream inherits that: a 31.25% "IFRS" tax line that is actually the centre of management's managerial 30–35% guide, an implied 24.8% rate divided out of two different analyst panels, an EBIT estimate that has drifted 65.2m away from the EBT estimate it used to track within 5m, and a beat case rated "High (≥60%)" off a counterfactual applied backwards across a tax regime that has existed for three quarters. The post-mortem would classify it under **bad extraction** (§20) rather than bad math or bad base rate, because the arithmetic was performed correctly on a number that meant something other than what its label said — and the document that would have caught it, the Managerial P&L reconciliation report, is the one document management named and this pool does not contain.
