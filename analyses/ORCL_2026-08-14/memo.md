# Oracle Corporation (ORCL) — Colleague Memo

**Company:** Oracle Corporation · **Ticker:** ORCL · **Exchange:** NYSE · **Currency:** USD
**Memo date:** 2026-08-14
**Current price:** $153.94 [Capital IQ pool-verified delayed NYSE quote, 2026-08-13 14:26 CT]

> **Decision: Watchlist** — the price already assumes a 51% FY2027 revenue jump that management has not guided to, the spending program is funded by debt that breaks at an ordinary-sized profit dip, and an unresolved securities-fraud lawsuit naming the founder and both co-CEOs caps the rating on its own.

A condensed read of this run's `final_thesis.md`. Every number comes from that dossier or `decision_record.json`. Finance terms are explained where they first appear, and again in the glossary at the end.

---

## 1. The Decision at a Glance

| Item | Answer |
|---|---|
| Rating | **Watchlist** |
| Suggested action | No new position at $153.94. Do not buy (no cushion against the $133.77 base case). Do not short into the 2026-09-04 earnings print — the setup is balanced, not tilted toward a miss, and short interest is only 1.74% of shares outstanding, so there is no crowd confirming the bear view. Re-underwrite after the FQ1 FY2027 print, the 2026 proxy, and the lawsuit's motion-to-dismiss outcome. |
| Position stance | No position — monitor only, track opportunity cost |
| Time horizon | 12 months, with a flagged 24–36 month structural-reset tail case |
| Expected return | **−27.1%** (probability-weighted across four scenarios) |
| Downside risk | **79.58%** (to the headline structural-reset bear case of $31.44) |
| Risk / reward | **−0.34** — negative; the probability-weighted target ($112.22) sits below today's price |
| Conviction /100 | **51.0** (post-pre-mortem, after a 4-point haircut: 47.0; verdict "survives with haircut") |
| Understanding /100 | 75.2 — the situation is well understood; the caution is a judgment about what is priced in, not a data hole |
| Data sufficiency /100 | **78** — good, with gaps |
| Thesis type (§14) | Company-specific · Sector-cycle · Balance-sheet survival |
| Rating cap | **Watchlist ceiling** — RF-MGT-005 (Critical, unresolved securities class action) under CLAUDE.md §24 Filter 1, with no edge-score bypass. Independently reinforced by a negative margin of safety (−15.08%) and a "Stretched" solvency verdict. |
| §24 Avoid-Big-Risks filters tripped | **Filter 1 (integrity)** — soft-tripped, RF-MGT-005, caps rating at Watchlist. **Filter 5 (fast-changing industry)** — tripped, RF-BQ-005, disruption score 33/100, caps business quality and flags this as a sector/technology-cycle bet. Filters 2, 3-verdict, 4 and 6 did not trip. |

Scores where **higher means worse** (inverted, flagged per §12): downside risk 79.58%, external dependency risk 72/100, earnings volatility 68/100, refinancing risk 58/100, governance risk 58/100, catalyst risk 62/100.

Module verdicts behind it: business-model "Cyclical business — worth deeper work only with a strong timing edge" (48/100 usefulness); earnings "Mixed earnings setup" (78); valuation "Modestly overvalued" (85); balance-sheet-survival "Stretched" (88); management-governance "Misaligned or weak stewardship" (68); catalyst "Dated, evidenced near-term catalysts" (78).

---

## 2. What the Company Does

Oracle sells databases and business software that companies run their day-to-day operations on. Increasingly it also rents out computing capacity — especially GPU capacity for artificial intelligence — that customers use to train and run AI models. That rented-capacity arm is OCI (Oracle Cloud Infrastructure).

The revenue model as a simple formula:

> **Revenue = (software licences + a recurring support fee on the installed base) + (cloud capacity rented × price per unit of capacity, recognised as contracts convert into delivered service)**

Two things matter about the shape of it:

- **One segment is the whole company.** Cloud and Software is 86.9% of FY2026 revenue and 90.7% of segment profit [`business-model/03_segment-map.md`]. There is no meaningful second leg.
- **Inside that segment, the mix is flipping.** OCI grew 77% in FY2026 while software support grew 1% to $19,804M. Segment margin fell over three years from 64.1% to 58.9% [`business-model/03`, `/09_moat.md` §2].

The order book behind the growth is real and audited: RPO — remaining performance obligations, meaning contracts signed but not yet billed or recognised as revenue — rose 363% to $638 billion, from $138 billion [`business-model/02_business-identity.md`]. Management says the constraint is how fast it can physically build data centres, not customer appetite: 98% of AI data-centre capacity is already contracted and GPU utilisation — how much of the installed chip capacity is actually in use — is 97.5% [`earnings/02_revenue-drivers.md`].

The buildout is being paid for with borrowed money. Total debt rose 54% in one year to $167.4bn, and S&P cut Oracle's credit rating to BBB− on 2026-07-09 — one notch above junk [`business-model/11_capital-allocation-governance.md`; `balance-sheet-survival/99`].

---

## 3. The Variant Perception (§7)

**What everyone already knows.** Oracle is growing fast on AI demand: OCI +77% in FY2026, RPO up 363% to $638bn, and Oracle is treated as one of the named AI-capex winners alongside Microsoft and Amazon.

**What is probably priced in.** Continuation of that hyper-growth into a premium multiple. The stock trades near its own five-year multiple range and close to where independently derived own-history ($151.27) and peer ($148.70) multiples land [`valuation/02`, `valuation/03`]. On the surface, the market is not obviously irrational.

**What the engine thinks the market may be missing.** The *specific, quantified size* of what the price requires. A reverse-DCF — running a discounted-cash-flow model backwards to ask what growth the current price already assumes — says $153.94 embeds:

- a **51.3% FY2027 revenue increase**, 18 points above management's own just-issued +33.6% guide;
- a **61.9% terminal EBIT margin** (EBIT = operating profit before interest and tax; terminal = the steady-state level assumed forever after the forecast years) — a level no named peer has ever posted, with the best, Microsoft, at 46.8% [`valuation/05_reverse-dcf.md`].

At the same time, Oracle's own return on capital (ROIC — the profit earned on each $100 of money put into the business) has fallen every year for four straight years, 12.35% in FY2022 to 8.22% in FY2026, now at or below an estimated ~11.2% cost of capital (what that money costs to raise) [`business-model/09_moat.md`]. And the balance sheet's real breaking point — the spending program, not the debt payments — sits inside normal-recession range, at a 2%–20% fall in EBITDA (earnings before interest, tax, depreciation and amortisation — a rough proxy for operating cash profit) [`balance-sheet-survival/06_downside-stress-test.md`].

**What evidence would prove the edge is real.** This is dated and falsifiable. If the FQ1 FY2027 print on **2026-09-04** shows revenue growth materially above the guided 27–29% range *with* gross margin not stepping down further — converging toward the 51.3% pace and 62% terminal margin the price requires — the overvaluation call is wrong and should be dropped. If growth lands within or below guidance and/or margin compresses further as management has already flagged, the call is confirmed.

**Edge score: 45/100** — below the 50-point threshold for an edge-based confidence lift. A real, quantified mismatch, not merely "the stock looks expensive" — but not enough for high conviction. Because the decision is Watchlist (non-committal), the §7 edge gate does not bind the headline anyway.

---

## 4. Why It Could Work — The Bull Case

**1. The switching-cost moat in the legacy business is real and measurable.** Software-support revenue held flat at $19,804M (+1%) even while licence revenue fell 9% [`business-model/09_moat.md` §2]. Customers who stop buying new licences keep paying to keep old systems running — a durable earnings floor under the growth leg if OCI's economics stabilise. *Confirms if:* support revenue holds flat or grows through FY2027 while licence revenue keeps falling.

**2. No re-rating is required for the stock to hold here.** Two independently derived anchors — Oracle's own five-year multiple history ($151.27) and the peer set ($148.70) — sit within about 3% of today's price [`valuation/02`, `valuation/03`]. If the backlog converts on schedule, the stock needs no higher multiple to hold current levels. *Confirms if:* multiples hold at 11.5–11.7x NTM EV/EBITDA (enterprise value to next-twelve-months operating cash profit) over the next two quarters.

**3. The founder owns a lot and still runs things.** Larry Ellison holds 40.21% (~$168.5bn) and remains an engaged Executive Chair/CTO [`management-governance/04_ownership-and-insider-behavior.md`, findings 04-001, 04-008]. §24 Filter 6 (unaligned owner) explicitly does **not** trip. *Confirms if:* his active operating role continues alongside specific, technical disclosure rather than promotional deflection.

**4. Demand looks supply-constrained, not demand-constrained.** 98% of AI data-centre capacity is already contracted; GPU utilisation is 97.5%; cloud/RPO conversion drove 79% of FY2026 growth, organic and demand-led [`earnings/02_revenue-drivers.md`]. If that constraint resolves faster than guided — the FERC "Project Jupiter" order clearing quickly, or a fifth mega-customer signing — the backlog converts to recognised, margin-protected revenue faster than the base case assumes, and the ~$150 multiples anchor (not the DCF's $68.92) is the right yardstick.

**The strongest argument against this memo's own verdict:** Oracle's demand signal may differ in kind from an ordinary late-cycle spending story, because the limit is build speed — power, GPUs, shells — not customer appetite. The evidence that would most move this view: an FQ1 FY2027 print clearing **35%+ year-on-year revenue growth without a further gross-margin step-down**. The earnings module itself flags that combination as the harder one to achieve, which is exactly why it would be so informative.

---

## 5. Why It Could Fail — The Bear Case and the Killer Risk

**1. The price requires a beat management has not guided to.** 51.3% FY2027 revenue growth against a +33.6% guide, and a 61.9% terminal operating margin with no peer precedent (Microsoft, the best, is 46.8%) [`valuation/05_reverse-dcf.md`]. Even the reverse-DCF's own theoretical best case falls $92.3bn short of today's enterprise value. Valuation risk is scored severity 82/100, probability 55/100.

**2. The capital program — not the debt payments — breaks at an ordinary-sized profit dip.** The reassuring numbers apply only to a narrow "maintenance-level" spending assumption. Substitute Oracle's actual guided ~$70bn FY2027 net capex and committed liquidity is exhausted at a **2%–20% EBITDA decline** — inside normal-recession territory, not a tail event. The headline ~20-month cash runway collapses to ~5.8–6.9 months on the same substitution [`balance-sheet-survival/03_liquidity-runway.md`, `/06`]. EBITDA-to-interest coverage looks wide at 6.63x–7.98x, but (EBITDA − capex)/interest is **−5.47x** [`balance-sheet-survival/04`].

**3. Customer concentration is extreme.** Four customers each contracted more than $8bn in FQ4 FY2026 alone (from the named set: AMD, Meta, NVIDIA, OpenAI, TikTok, xAI). A stress case implies ~$6.9bn of EBITDA downside, about 23% of FY2026 EBITDA [`earnings/07_earnings-sensitivity.md`].

**4. Capital allocation has turned value-destructive, and the auditors' numbers say so.** Uses of capital over FY2022–FY2026 equal **233% of cumulative operating cash flow**, funded by $115.8bn of new debt, preferred stock and equity-plan proceeds. FY2026 free-cash-flow coverage of the dividend is **−409.4%** — the dividend is being paid out of borrowings, not cash the business generated. Buybacks are now 1.9% of stock-based compensation expense and the diluted share count is rising again, +5.3% off the FY2023 trough [`management-governance/02_capital-allocation-scorecard.md`]. This is red flag RF-CAP-003, Critical.

**5. Governance is weak on the module's own scoring.** Governance Score 50/100 (Weak band), 34/100 confidence-adjusted. Incentive alignment 37/100; capital allocation 40/100. Nine red flags, two of them Critical. Say-on-pay opposition of 18–22% at each of the last two annual meetings. Two CFO changes in eight months, landing in the same fiscal year debt rose 54%. Every named executive sold stock in the trailing twelve months with zero offsetting open-market buys [`management-governance/01`, `/03`, `/04`, `/05`].

**The single killer risk, in one sentence:** *A pullback, delay, or renegotiation by one of the four named >$8bn AI-infrastructure customers inside the $638bn backlog would hit revenue directly while $167.4bn of debt-funded data-centre capacity built to serve that demand stays on the books — compounding with a ~$70bn FY2027 spending program that a stress test shows exhausts committed liquidity at just a 2%–20% EBITDA decline.*

**Why the downside is not diversified:** earnings risk, valuation risk, balance-sheet risk and sector risk all run off the *same* variable — whether the AI demand cycle holds and named customers keep converting their contracts. One adverse demand shock moves all four at once: it cuts revenue *and* removes the cash needed to fund spending already committed. Only the governance/integrity risk and the Netherlands GDPR case are genuinely independent of it.

---

## 6. Avoid-Big-Risks Check (§24)

**Filter 1 — Crooks and integrity: SOFT-TRIPPED.** RF-MGT-005, Critical. A securities class action filed 2026-02-03 alleges Oracle and named executives overstated the AI-deal growth outlook. It names Ellison, both co-CEOs, two other executives and one director personally, and is pre-motion-to-dismiss — not cleared, not proven [FY26 10-K, Note 15 legal disclosure]. **Cap imposed: rating no better than Watchlist**, with no edge-score bypass, until cleared by primary evidence. Only the *existence and pendency* of the claim are established at Level 5; the underlying allegation itself is genuinely unresolved.

**Filter 5 — Fast-changing industry: TRIPPED.** RF-BQ-005. Industry rate-of-change / disruption score 33/100 against a ≤40 threshold. **Cap imposed:** caps business quality at 65 (non-binding — the actual score, 43, is already lower) and reclassifies the AI-infrastructure buildout as a sector/technology-cycle bet rather than a durable compounder. It also caps catalyst strength at 55 (applied at 52) and carries an explicit instruction: **a clean beat on 2026-09-04 alone must not be read as proof of the multi-year growth path.**

**Filter 3 — High debt / survival test: not a formal trip, but the read is adverse.** Balance-sheet-survival's verdict is **"Stretched"** — solvent on debt service alone, but the capital program depends on open capital-market access while S&P holds Oracle one notch above junk. Net debt (strict basis: total debt minus cash) is $136,143mn against $31,289mn of cash; net debt/EBITDA 4.46x, up from 3.83x two years ago, entirely capex-funded. Solvency strength 38/100, liquidity runway 42/100. Peers sit at 0.8x–1.1x total debt/EBITDA on the same vendor basis. Also flagged: RF-OBS-001, **$260,000mn of data-centre lease commitments not yet on the balance sheet** (15–19 year terms, commencing FY2027–FY2029) — roughly 1.9x Oracle's entire current gross debt stack.

**Filter 2 (turnarounds): did not trip. Filter 4 (serial acquirers): did not trip** — two spaced deals, acquisition-pattern severity 30 against a 70 threshold. **Filter 6 (unaligned owners): did not trip** — the founder's 40.21% stake is a genuine alignment anchor.

No hard disqualifier was triggered by the disqualifier scan.

---

## 7. Valuation and Fair Value (§16)

| Level | Price | vs. $153.94 |
|---|---:|---:|
| Bull | $212.67 | +38.15% |
| Base | $133.77 | −13.10% |
| Bear — cyclical (12 months) | $94.62 | −38.53% |
| Bear — structural reset (24–36 months, headline) | $31.44 | −79.58% |

**Margin of safety: −15.08% — negative.** Margin of safety is the discount of price to fair value, the cushion that protects you if you are wrong. Here there is none: the stock trades *above* the base-case fair value, not below it.

**Method and weighting.** Multiples-First, appropriate for an operating company with usable forward estimates: own-history EV/EBIT plus peer NTM EV/EBITDA, 80% combined weight. A discounted-cash-flow model — valuing the business on the cash it is projected to generate, discounted back to today — carries 20%.

**The methods disagree materially, and that disagreement is the finding — it was not averaged away.** Multiples cluster near $150 ($151.27 own-history, $148.70 peer). The DCF lands at **$68.92**, roughly 120% lower, and is terminal-value dominated (the assumed-forever period is 80.7% of DCF enterprise value). The cross-method spread is 207.7%, and it cost the thesis 7 confidence points. The valuation module weighted the cautious DCF at only 20% — a minority read, not a majority one — and the blended base case still lands 13% below price.

**Why the caution wins anyway:** three independent lenses point the same direction. The DCF, the reverse-DCF (price requires a 51.3% beat and a 62% terminal margin with no peer precedent), and the business-model module's separately confirmed eroding return-on-capital trend all agree. A reasonable investor could still defend the other side depending on how much weight the terminal-value assumption deserves — that is stated, not hidden.

**Peer context, with basis labels.** NTM EV/EBITDA 11.65x vs a 10-name peer median of 15.19x (−23.3%), but that set is skewed up by three hyper-growth outliers (Palantir 63.3x, Snowflake 98.7x, CrowdStrike 116.9x); against the cleaner five-name set of competitors Oracle itself names in its 10-K, the reading flips to roughly in-line, 11.65x vs 11.92x. LTM EBITDA margin 45.3% vs a 30.4% peer median — a genuine positive, +49%. Total debt/EBITDA 5.0x on the vendor's EBITDAR-inclusive basis vs 1.1x for the 10-name set and 0.8x for the named-competitor subset. *(That 5.0x is the vendor's EBITDAR basis, not the module's own plain-GAAP-EBITDA figures of 4.46x net / 5.49x gross used elsewhere — labelled here per §15.)* Return on capital ~8.5%–10.5% vs Microsoft ~21% and SAP ~12–14% (both unverified, web-sourced): Oracle is the weakest of the three on capital returns despite the fastest headline growth.

---

## 8. Catalysts (§17)

Seven of fourteen identified events carry proven dates. The ones that matter:

| Date / window | Catalyst | Bullish trigger | Bearish trigger |
|---|---|---|---|
| 2026-08-25 | Annual General Meeting — say-on-pay vote, tested against the prior two years' 18–22% dissent | Opposition falls below 18% | Opposition holds at or above 18–22% |
| **2026-09-04** | **FQ1 FY2027 earnings — the single most important catalyst.** Guidance is published: revenue +27–29% CC/USD, non-GAAP EPS $1.72–$1.76 | Revenue clears the guide ceiling; gross margin does not step down further than flagged | A named mega-customer pullback, or a larger-than-guided margin step-down |
| 2026-09-16 | Deadline for defendants to respond to the OCI securities class action | Motion to dismiss narrows or removes named defendants | Defendants answer instead of moving to dismiss |
| ~2026-09-28 | 2026 DEF 14A proxy expected filed — the primary source for pay, board and related-party detail, currently a genuine gap | No new related-party dealings; pay design moves toward per-share metrics | Pay design unchanged from the revenue-based CFO metric |
| September 2026 (day undisclosed) | $3.3bn Oracle guarantee of a data-centre lessor's borrowing matures | Lessor refinances independently | Lessor cannot refinance and draws the guarantee |
| Overdue since 2026-06-28 | Netherlands Supreme Court GDPR ruling — the biggest bearish catalyst; a non-binding Advocate General opinion already leans against Oracle, damages unquantified | Court rules for Oracle, or damages judged immaterial | Court adopts the adverse recommendation |
| Apr-2027 / 2027-08-16 | $2,250mn senior notes / $4,645mn term loan mature — part of $17,355mn due within 24 months, against −$23,686mn FY2026 levered free cash flow | Refinanced from cash/revolver without fresh unsecured issuance at stressed spreads | Must issue new debt into a market pricing further-downgrade risk |
| Q1 FY2027–FY2029 | $260,000mn of additional data-centre lease commitments begin converting on-balance-sheet — ~1.9x today's entire gross-debt stack | Leases commence alongside matching backlog-to-revenue conversion | Leases commence but demand does not convert on schedule |

**Read the 2026-09-04 print carefully, not eagerly.** It, the lease-commencement window, and the ~$40bn FY2027 financing plan are all §24 Filter 5-flagged. None of them should be treated as automatically conviction-lifting even on a clean beat, because the outcome hinges on an AI-infrastructure spending race with no knowable winner.

---

## 9. Scenario Model (§10)

| Case | Probability | Return | Price target | What must happen |
|---|---:|---:|---:|---|
| Bull | 15% | +38.15% | $212.67 | Gross margin snaps back toward FY25 levels **AND** all four named >$8bn customers keep converting backlog on schedule **AND** the market pays Oracle's five-year mean multiple again (14.0x vs 11.65x today) — three conditions at once |
| Base | 32% | −13.10% | $133.77 | Consensus NTM EBITDA ($49,996M) is roughly achieved; the market keeps discounting Oracle's leverage and eroding returns — no further de-rating, no re-rating |
| Bear — cyclical (12mo) | 33% | −38.53% | $94.62 | At least one named mega-customer pulls back materially on contracted backlog, and/or the FY27 gross-margin step-down lands harder than guided |
| Bear — structural reset (24–36mo, headline) | 20% | −79.58% | $31.44 | The eroding-moat path does not stabilise: OCI never reaches AWS/Azure-level scale economics, becomes fully commoditised, while the legacy support annuity shrinks faster than OCI can replace it |

Probabilities sum to **100%**. Probability-weighted expected return **−27.10%**; probability-weighted target price **$112.22**, which reconciles exactly: (112.22 − 153.94)/153.94 = −27.10%. Risk/reward, measured against the headline bear: (112.22 − 153.94)/(153.94 − 31.44) = **−0.34**.

**Span check:** the bull case is +38% above today's price — a large, real move, not something the stock covers in a normal week. The set spans properly. **Conjunction check:** the bull needs three things simultaneously; the cyclical bear needs one of several adverse events. That asymmetry is deliberate and evidenced, and it is why the bull carries less weight despite a comparable-size move.

**How sensitive is this?** Move the structural-bear weight from 20% to 10% (redistributed to bull and base) and the expected return goes to roughly −19%. Move it to 30% and it goes to roughly −35%. The *direction* — negative expected return, no cushion, do not buy — holds across that whole range. The *magnitude* is not precise beyond "materially negative."

**Is the expected return worth the risk? No.** A negative expected return and a negative risk/reward mean today's price does not compensate for the risk under these weights. That is the quantitative basis for "no new position" — not a hunch.

---

## 10. What Would Change Our Mind (§8/§19)

Five specific, observable, dated events. Any of these forces a re-underwrite.

1. **FQ1 FY2027 revenue growth (2026-09-04) prints below the guided 27–29% range, or gross margin steps down more than management has already flagged.** Confirms the overvaluation and margin-timing risk; supports the base/bear cases. *(Owner: earnings. Forecast probability that revenue lands within or below the guide: 65%; falsified if growth exceeds 35% year-on-year.)*
2. **Any of the four named >$8bn AI-infrastructure customers pulls back, delays, or renegotiates contracted backlog.** The single named killer risk. *(Owner: earnings / business-model. Monitor: quarterly RPO disclosure and Key Developments filings.)*
3. **Committed liquidity is drawn down faster than the 2%–20% EBITDA-decline break point** — the revolver is drawn, capex is cut, or a covenant-basis dispute emerges. Confirms the "Stretched" read is binding rather than theoretical. *(Owner: balance-sheet-survival. Forecast: net debt/EBITDA stays at or above 4.46x at FQ1 FY2027, 65% probability; falsified below 4.20x.)*
4. **The OCI securities class action survives the motion-to-dismiss stage** (defendants respond by 2026-09-16; a ruling could land as late as ~2026-12-18) **or is amended with stronger factual allegations.** Keeps the Watchlist ceiling in place regardless of how the valuation debate resolves. *(Owner: management-governance.)*
5. **The 2026 DEF 14A (due ~2026-09-28) discloses co-CEO pay still built on revenue/size rather than per-share or return measures, and/or say-on-pay opposition stays at 18–22%.** Confirms weak incentive alignment. *(Owner: management-governance. Forecast probability: 60%.)*

**On the other side — what would raise confidence:** an FQ1 print clearing guidance without a larger-than-guided gross-margin step-down; the 2026 proxy disclosing per-share or return-weighted pay for both co-CEOs; the class action dismissed or settled with no wrongdoing finding; net leverage stabilising or falling; segment-level OCI margin data showing project returns clearing the ~11.2% estimated cost of capital.

**What would force outright exit or rejection:** confirmed loss of a named AI-infrastructure customer's committed capacity; a covenant-basis dispute; or evidence the disclosed FY2026 cybersecurity incidents were more material than currently characterised.

**One practical warning if a position is ever opened:** a stop-loss may not protect you through an earnings gap. Oracle fell 10.8% in a single week on a capex-guidance miss in December 2025, and could plausibly move similarly on 2026-09-04. A stop placed inside that range would not execute at the intended price.

---

## 11. Second-Best Bet

**Microsoft (MSFT)** — a safer way to hold the same AI-infrastructure demand theme. It is named directly as Oracle's closest scaled competitor in both cloud infrastructure and cloud applications, and scores better on every quality measure this run examined: LTM EBIT margin 46.8% vs Oracle's 33.2%; third-party-estimated ROIC ~21% vs Oracle's own-computed ~8.5–10.5%; roughly 21% of global cloud-infrastructure share vs Oracle's ~3% [`business-model/08_competitive-map.md`, `/09_moat.md` §4]. It carries the same demand exposure without Oracle's leverage (4.46x net debt/EBITDA and rising), without an unresolved securities-fraud allegation, and without four counterparties carrying the backlog.

**Caveat:** no dedicated Microsoft research was performed in this run. This is a directional, evidence-anchored comparison drawn from data gathered on Oracle's peer set — not a second thesis. A real MSFT evaluation needs its own run before anything is sized.

---

## 12. What We'd Need to Get More Confident

Biggest gaps, in order:

1. **Segment-level (OCI-specific) capex, invested-capital base, and forward margin guidance** — Oracle discloses only a consolidated capex figure and states it does not track assets by business [FY26 10-K, Note 13].
2. The **2026 DEF 14A proxy** (due ~2026-09-28) — resolves the incentive-alignment, board-disclosure and related-party caps.
3. **Full text of Exhibit 10.14 (the revolving credit agreement)** plus a standalone rating-agency rationale — resolves the covenant-EBITDA-addback quality cap, currently holding covenant headroom at max 60/100.
4. The **verbatim FQ2 FY2026 transcript** — the only quarter with a genuinely bad print has no verbatim record, capping the "tone in bad times" read.
5. Company-disclosed **interest-rate sensitivity** on the $167.4bn debt load, and a quantified capex-to-revenue margin-timing lag.

**The single highest-value next data request:** **segment-level (OCI-specific) capital expenditure, invested-capital base, and forward margin/revenue guidance.** Both the business-model and valuation modules independently named this as their biggest missing input. It is the one disclosure that would let management's "high-20s" steady-state OCI return-on-capital claim be tested against filed evidence, instead of leaving the declining consolidated segment margin as the only audited proxy. If it came back supportive — an OCI margin trending toward AWS's 35–39% segment level and project returns clearing ~11.2% — it would directly weaken both the moat-erosion and overvaluation calls.

---

## 13. Bottom Line

- **What it does:** sells databases and business software, and increasingly rents out AI computing capacity. That AI-plus-software segment is 86.9% of revenue and 90.7% of segment profit — in substance, the whole company.
- **Why it may go up:** demand is real and supply-constrained, not demand-constrained — 98% of AI data-centre capacity is already contracted, GPU utilisation is 97.5%, and the signed-but-unbilled backlog grew 363% in a year to $638 billion.
- **Why it may go down:** the price already assumes a 51.3% FY2027 revenue jump (guide: +33.6%) and a 61.9% terminal operating margin no competitor has ever posted, while debt rose 54% in one year to $167.4bn and S&P cut the rating to BBB−, one notch above junk.
- **The math:** across four scenarios summing to 100%, the expected return is **−27.1%**, with 65% of the probability weight on the two "things go wrong" cases versus 15% on "things go very right." Risk/reward is **−0.34**. There is no cushion: margin of safety is **−15.08%**.
- **What data supports the thesis:** audited FY2026 10-K financials, verbatim Q3/Q4 FY2026 transcripts, Capital IQ exports as of 2026-08-13, and a pool-verified price. Data sufficiency 78/100 — good, with gaps. Five of six modules rate their own data "Sufficient."
- **What data is missing:** the 2026 proxy (due ~late September), the credit agreement's own EBITDA-addback definition, and — most important — an OCI-specific breakdown of spending and profit that would let anyone outside the company check whether the AI bet is earning back its cost of capital.
- **Buy now or wait: wait.** Do not buy — no cushion in the price, and an unresolved securities-fraud allegation caps the rating at Watchlist on its own, regardless of how the valuation debate resolves. Do not short either — the near-term setup is balanced rather than miss-tilted, and short interest is just 1.74% of shares outstanding, so a good print could squeeze hard against a genuine demand story.
- **The one thing to watch next:** the **2026-09-04** FQ1 FY2027 earnings release — specifically whether revenue growth lands near management's 27–29% guide (expected, 65% probability) or jumps toward the 51% the price already assumes (which would flip this thesis).

---

## 14. Plain-English Glossary

Terms in order of first appearance. The numbers behind each sit in the body above.

- **Watchlist** — a formal "not yet, keep tracking" verdict from the allowed decision set; not a buy, not a sell, not a short.
- **Margin of safety** — the discount of price to what the business is worth; the cushion if you are wrong. Oracle's is negative.
- **Short interest** — the share of a company's stock that investors have borrowed and sold, betting the price falls.
- **Expected return** — each scenario's return multiplied by its probability, added up.
- **Risk/reward** — the probability-weighted gain compared with the distance down to the worst case; negative means the weighted target sits below today's price.
- **Inverted score** — a score where a *higher* number is *worse* (downside risk, governance risk), flagged so it is never read as a positive.
- **RPO (remaining performance obligations)** — contracts already signed but not yet billed or recorded as revenue; the visible order book.
- **GPU utilisation** — how much of the installed AI chip capacity is actually in use.
- **Segment margin** — profit as a share of revenue for one business segment.
- **Credit rating / BBB−** — an agency's grade of how likely a borrower is to repay; BBB− is the lowest investment-grade notch, one step above "junk."
- **Reverse-DCF** — running a cash-flow valuation backwards to work out what growth and margins the current share price already assumes.
- **EBIT (operating profit)** — profit from operations before interest and tax.
- **Terminal margin / terminal value** — the steady-state margin, and the value, assumed for all years after the explicit forecast period. Most of Oracle's DCF answer rests on it.
- **ROIC (return on capital)** — the profit the business earns on each $100 of money put into it; compare it against the cost of capital.
- **Cost of capital** — what the money invested costs to raise, blending debt and equity. Oracle's ~11.2% is an estimate, explicitly labelled inference, not a filed figure.
- **EBITDA** — earnings before interest, tax, depreciation and amortisation; a rough proxy for operating cash profit.
- **Switching-cost moat** — the advantage from customers finding it costly or disruptive to leave.
- **Re-rating / multiple** — the market paying a higher (or lower) price for the same earnings.
- **EV/EBITDA (enterprise value to EBITDA)** — the value of the whole business, debt included, divided by its operating cash profit. NTM = next twelve months' estimate; LTM = last twelve months.
- **DCF (discounted cash flow)** — valuing a business on the cash it is projected to generate, discounted back to today's money.
- **Capex (capital expenditure)** — money spent on physical assets such as data centres.
- **Net debt (strict basis)** — total debt minus cash.
- **Net debt/EBITDA (leverage)** — how many years of operating cash profit it would take to repay net debt.
- **Free cash flow (FCF)** — operating cash flow minus total capital spending; the cash left over. Oracle's was negative in FY2026, so the dividend was funded by borrowing.
- **Covenant / covenant headroom** — a promise in a loan agreement (here, keeping EBITDA at least 3.0x interest) and the distance before it is breached.
- **Revolver (revolving credit facility)** — a pre-arranged bank credit line that can be drawn as needed; Oracle's is undrawn.
- **Off-balance-sheet commitment** — a future obligation not yet recorded as a liability, such as leases that have not yet started.
- **Dilution / diluted share count** — the share count including options and awards that could become shares; more shares means each existing share owns less.
- **Say-on-pay** — the shareholder vote on executive pay.
- **Motion to dismiss** — a defendant's early request that a court throw out a lawsuit before trial.
- **DEF 14A (proxy statement)** — the annual filing disclosing executive pay, board composition and related-party dealings.
- **Consensus / the bar** — the average of analysts' forecasts (41 analysts here) a company is measured against.
- **Basis points (bps)** — hundredths of a percentage point; 469bps = 4.69 percentage points.
- **Stop-loss** — a standing order to sell if the price falls to a set level; it does not protect against a gap, where the price jumps past it before the order can fill.

---

*Sources: `analyses/ORCL_2026-08-14/final_thesis.md` and `analyses/ORCL_2026-08-14/decision_record.json`. This memo adds no analysis, numbers, or evidence beyond those two files. Rating, conviction, caps and §24 filter trips are carried unchanged.*
