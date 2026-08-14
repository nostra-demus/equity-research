# Oracle Corporation (ORCL) — Colleague Memo

**Company:** Oracle Corporation · **Ticker:** ORCL · **Exchange:** NYSE · **Currency:** USD
**Memo date:** 2026-08-14 · **Current price:** $153.94 (as of 2026-08-13, 14:26 CT) [Capital IQ pool export — delayed NYSE quote, pool-verified]
**Source:** condensed from `final_thesis.md` and `decision_record.json`, run root `analyses/ORCL_2026-08-14`. No new analysis is added here.

> **Carried warning from the thesis:** the automated finish-gate flagged an integrity issue in the valuation scenario file (each case records only half of its metric×multiple pair, and the sum-of-the-parts and peer-anchor tables are incomplete), so the thesis was committed **UNVERIFIED / PROVISIONAL**. The scenario price levels below are the ones the thesis carries, but that gate has not cleared. Treat the levels as provisional.

**Decision: Watchlist** — the price already assumes a 51.3% FY2027 revenue jump that management has not guided to, on a balance sheet whose spending program breaks at an ordinary-sized profit fall, with an unresolved securities-fraud allegation that mechanically caps the rating at Watchlist regardless of the valuation debate.

---

## 1. The Decision at a Glance

| Item | Answer |
|---|---|
| Rating | **Watchlist** |
| Suggested action | No new position at $153.94. Do not buy (no cushion against the $133.77 base case). Do not short into the 2026-09-04 earnings print (the setup is balanced, not tilted to a miss, and short interest is only 1.74% of shares outstanding). Re-underwrite after the FQ1 FY2027 print, the 2026 proxy, and the court's motion-to-dismiss outcome. |
| Position stance | **No position** — monitor only, track opportunity cost. Not a starter position, not a short. |
| Time horizon | 12 months, with a flagged 24–36 month structural-reset tail case |
| Expected return | **−27.1%** (probability-weighted across four cases) |
| Downside risk | **79.58%** (to the headline structural-reset bear case, $31.44) |
| Risk/reward | **−0.34** (negative — the probability-weighted target sits below today's price) |
| Confidence (conviction) /100 | **51.0** |
| Understanding /100 | 75.2 |
| Data sufficiency /100 | **78** |
| Margin of safety | **−15.08%** (negative — the stock trades above, not below, the base-case fair value) |
| Thesis type (§14) | Company-specific · Sector-cycle · Balance-sheet survival |
| Rating cap | **Watchlist ceiling** — RF-MGT-005 (Critical, unresolved securities class action), per §24 Filter 1. Independently reinforced by the negative margin of safety and the "Stretched" solvency verdict. |
| §24 filters tripped | **Filter 1 (integrity)** — soft-tripped, RF-MGT-005, caps the rating at Watchlist. **Filter 5 (fast-changing industry)** — tripped, RF-BQ-005. Filters 2, 4 and 6 did not trip. |
| Red flags | 9 governance flags, **2 Critical** (RF-MGT-005, RF-CAP-003); earnings module separately logged 23 flags (11 High), verdict "Material concerns", zero Critical |
| Variant-perception edge score /100 | 45 (below the 50-point bar for a confidence lift) |

*Inverted scores in this memo — where a higher number means worse: downside risk 79.58%, governance risk 58/100, earnings volatility 68/100, refinancing risk 58/100, external dependency risk 72/100, catalyst risk 62/100.*

---

## 2. What the Company Does

Oracle sells the database and business software that large companies run their operations on — payroll, accounting, orders, records. Increasingly it also rents out computing capacity, especially the graphics chips (GPUs) used to train and run artificial-intelligence models. That rental business is called OCI (Oracle Cloud Infrastructure).

**The revenue model, as a simple formula:**

> *Revenue = (software licences + annual support fees on the installed base) + (cloud capacity rented × the price per unit of capacity)*

Two things matter about that formula today.

First, one segment is effectively the whole company. "Cloud and Software" is 86.9% of FY2026 revenue and 90.7% of segment profit [`business-model/03_segment-map.md`]. Inside it, the growth is entirely OCI: OCI revenue grew 77% in FY26, while software-support revenue grew 1% (flat at $19,804M) [`business-model/03`, `/09_moat.md` §2].

Second, the growth is bought, not free. To rent out capacity you must first build data centres. Capital spending (capex) rose 162% in FY26, which pushed free cash flow — the cash left after the business pays for its own equipment — from −$394M to −$23,686M [`earnings/01_historical-financials.md`]. Total debt rose 54% in one year to $167.4bn, and S&P cut Oracle's credit rating to BBB− on 2026-07-09 — one notch above junk [`business-model/11_capital-allocation-governance.md`; `balance-sheet-survival/99`].

The signed-but-not-yet-billed order book — called RPO, remaining performance obligations, the contracted revenue Oracle has won but not yet recognised — grew 363% to $638bn [`business-model/02_business-identity.md`]. That backlog is the entire bull story.

---

## 3. The Variant Perception (§7)

**What everyone already knows.** Oracle is growing fast on AI-infrastructure demand: OCI +77% in FY26, RPO up 363% to $638bn, and Oracle is treated as one of the named beneficiaries of AI capital spending alongside Microsoft and Amazon.

**What is probably priced in.** A continuation of that hyper-growth into a premium valuation. Specifically, the reverse-DCF — a calculation that runs the valuation backwards to ask "what would have to be true for today's price to be right" — says the price already assumes a 22.6% revenue growth rate per year from FY26 to FY34, a 51.3% revenue jump in FY2027, and a 61.9% terminal EBIT margin [`valuation/05_reverse-dcf.md`]. On the surface the market does not look irrational: Oracle trades near its own five-year multiple range, and independent peer and own-history methods land at $148.70 and $151.27, both within about 3% of today's price [`valuation/02`, `/03`].

**What the engine thinks the market may be missing — the edge.** Not "the stock is expensive." Three specific, checkable numbers:

1. That 51.3% FY2027 revenue figure sits **18 points above management's own just-issued guidance of +33.6%** [`valuation/05`; `earnings/04_guidance-consensus.md`]. The company itself is not promising what the price assumes.
2. The 61.9% terminal EBIT margin (operating profit as a share of revenue, on a lasting basis) **has no peer precedent** — the best named peer, Microsoft, posts 46.8% [`valuation/05`; `business-model/09` §4].
3. Meanwhile Oracle's own return on capital (ROIC — the profit earned on each $100 of money put into the business) has **fallen every year for four straight years**, from 12.35% in FY22 to 8.22% in FY26, at or below an estimated ~11.2% cost of capital (what that money costs to raise) [`business-model/09_moat.md`]. Note the honesty caveat the thesis carries: the ROIC trend is well-evidenced (Level 4), but the specific cost-of-capital comparison is labelled "Inference, not from filings" — the declining direction is the load-bearing fact, not the precise gap.

On top: the balance sheet's real weak point is the spending programme, not the debt, and it breaks at a 2%–20% fall in EBITDA — inside normal-recession range, not a tail event [`balance-sheet-survival/06_downside-stress-test.md`].

**What evidence would prove the edge is real.** This is dated and falsifiable. If Oracle's FQ1 FY2027 print on **2026-09-04** shows revenue growth materially above the guided 27–29% range *with* gross margin not stepping down further — converging toward the 51.3% pace the price requires — the overvaluation call is wrong and should be dropped. If growth lands inside or below guidance and/or margin compresses further as management has already flagged, the call is confirmed.

**Edge score: 45/100.** Below the 50-point threshold for a confidence lift. This is a real, quantified mismatch, not just "expensive stock" — but it does not clear the bar for high conviction. Because the decision is Watchlist (non-committal), the edge gate does not bind the headline anyway.

---

## 4. Why It Could Work — Bull Case

| Driver | Evidence today | What would confirm it |
|---|---|---|
| **A real, evidenced switching-cost moat.** Customers cannot easily leave. Software-support revenue held flat at $19,804M (+1%) even as licence revenue fell 9% — people keep paying for support on software they've stopped buying new copies of. That is a durable earnings floor under the growth leg. | `business-model/09_moat.md` §2 | Support revenue holding flat or growing through FY2027 while licence revenue keeps falling |
| **Demand is supply-constrained, not demand-constrained.** 98% of AI data-centre capacity is already contracted and GPU utilisation — how much of the installed chip capacity is in use — is 97.5%. The limit is how fast Oracle can build (power, chips, buildings), not whether customers want more. | `earnings/02_revenue-drivers.md` | A fifth mega-customer signing, or the FERC "Project Jupiter" power order clearing quickly |
| **Little re-rating is even required.** Independently derived own-history ($151.27) and peer ($148.70) fair values sit within ~3% of today's price. If RPO converts on schedule, the stock does not need the market to pay a higher multiple to hold current levels. | `valuation/02_multiples-own-history.md`, `/03_relative-valuation-peers.md` | Multiples holding at 11.5–11.7x forward EV/EBITDA through the next two quarters without compressing |
| **Founder ownership is a real anchor.** Larry Ellison holds 40.21% (~$168.5bn) and remains an engaged Executive Chair/CTO — not an absentee or misaligned controller. §24 Filter 6 (unaligned owner) explicitly did **not** trip. | `management-governance/04_ownership-and-insider-behavior.md`, findings 04-001, 04-008 | Ellison's active operating role unchanged; continued specific technical disclosure (e.g. the 97.5% utilisation figure) rather than promotional deflection |
| **A clean FQ1 beat removes the most immediate objection.** Guidance is published and dated: revenue +27–29%, non-GAAP EPS $1.72–$1.76, reported 2026-09-04. | `catalyst/99` §2; `earnings/04` | Revenue growth materially above the 27–29% guide with gross margin not stepping down further |

**The strongest form of the opposite argument, in the thesis's own words:** Oracle's demand signal may be different in kind from a typical late-cycle spending story. If the physical build constraint resolves faster than guided, RPO could convert into recognised, margin-protected revenue faster than the base case assumes — in which case the multiples-based ~$150 fair value, not the DCF's $68.92, is the right anchor. The single most informative evidence would be an FQ1 print clearing 35%+ year-on-year revenue growth *without* a further gross-margin step-down. The earnings module flags that exact combination as the harder one to achieve, which is why it would matter so much if it happened.

---

## 5. Why It Could Fail — Bear Case and the Killer Risk (§8)

**1. The price requires a beat nobody has promised.** 51.3% FY2027 revenue growth versus management's own +33.6% guide, and a 61.9% terminal EBIT margin no peer has posted (Microsoft, the best, is 46.8%). The reverse-DCF's own theoretical best case still falls $92.3bn short of today's enterprise value [`valuation/05`]. Valuation risk is scored 82/100 severity, 55/100 probability.

**2. Customer concentration.** Four customers each contracted more than $8bn in FQ4 FY26 alone (named across AMD, Meta, NVIDIA, OpenAI, TikTok, xAI). A stress case implies ~$6.9bn of EBITDA downside — about 23% of FY26 EBITDA [`earnings/07_earnings-sensitivity.md`]. Separately, the reported ~$300bn OpenAI/Stargate contract would be roughly 47% of the whole RPO backlog if still outstanding (labelled inference, not a filed fact) [`business-model/05_customer-geography.md`].

**3. Margins are compressing, and management has guided them to compress further.** FY26 gross margin fell 469 basis points (4.69 percentage points) on data-centre capacity costs. Consolidated GAAP operating margin only moved −21bps because a separately earned +502bps of cost leverage nearly offset it — two large opposing forces, not one clean trend [`earnings/03_margin-drivers.md`]. And FY26 GAAP EPS growth of +34% leans on a $2.7bn+ one-time investment gain that management itself excludes from its own forward math (18% growth excluding gains, not 34%) [`earnings/06_earnings-quality.md`].

**4. The balance sheet's real constraint is the spending programme, not the debt.** On paper the picture reassures: only 5.5% of debt is due within 12 months, covered several times by $31.3bn cash plus a fully available $10.0bn undrawn revolver (a pre-agreed bank borrowing line), and the one disclosed covenant (a promise to lenders) does not breach until EBITDA falls 54.8%–62.4% [`balance-sheet-survival/02`, `/04`]. But that comfort assumes maintenance-level spending. Substitute Oracle's actual guided ~$70bn FY2027 capex and the liquidity runway collapses from ~20.1 months to ~5.8–6.9 months, with committed liquidity exhausted at a **2%–20% EBITDA decline** [`balance-sheet-survival/03`, `/06`]. Separately, $260,000mn of data-centre lease commitments — roughly 1.9x Oracle's entire current gross debt stack — are not yet on the balance sheet and begin commencing FY2027–FY2029 (RF-OBS-001) [`balance-sheet-survival/05`].

**5. Governance: two Critical red flags.** RF-MGT-005 — an unresolved securities class action filed 2026-02-03 naming Ellison, both co-CEOs, two other executives and one director, alleging Oracle overstated the AI-deal growth outlook. RF-CAP-003 — dividend and total uses of capital are not covered by free cash flow (FY2026 coverage −409.4%); uses of capital over FY2022–2026 equal 233% of cumulative operating cash flow, funded by $115.8bn of new debt, preferred stock and equity-plan proceeds. Buybacks are now 1.9% of stock-based pay expense and the share count is rising again (+5.3% off the FY2023 trough). Two CFO changes in eight months landed in the same fiscal year debt rose 54%. Every named executive sold stock in the trailing 12 months with zero offsetting buys.

### The killer risk, in one sentence

> A pullback, delay, or renegotiation by one of the four named >$8bn AI-infrastructure customers inside the $638bn RPO backlog would hit revenue directly while $167.4bn of debt-funded capacity built to serve that demand stays on the books — compounding with a ~$70bn FY2027 capital programme that a stress test shows exhausts committed liquidity at just a 2%–20% EBITDA decline.

**Why that compounding matters.** The thesis's joint-tail check is explicit: all four scenarios and four of the ten risk-register rows are driven by *one* underlying variable — whether AI-infrastructure demand and named-customer RPO conversion hold. A single adverse demand shock produces the earnings miss **and** the liquidity stress at the same time. This downside is not diversified. Only the governance/integrity risk and the Netherlands GDPR risk are genuinely independent of it.

---

## 6. Avoid-Big-Risks Check (§24)

| Filter | Status | Evidence | Cap imposed |
|---|---|---|---|
| **1. Crooks / integrity** | **Soft-tripped** | RF-MGT-005 — unresolved securities class action filed 2026-02-03 naming Ellison, both co-CEOs, two other executives and one director, over the AI-deal growth outlook. Its existence and pendency are Level-5 sourced [FY26 10-K Note 15]; **the allegation itself is not proven** — only unresolved. | Caps management quality and disclosure candor at 60/100 and the **headline rating at no better than Watchlist**, with no edge-score bypass, until cleared by primary evidence |
| **2. Turnaround** | Did not trip | — | — |
| **3. High debt / survival** | Not recorded as a formal filter trip, but the balance-sheet module's verdict is **"Stretched"** | Net debt/EBITDA (strict) 4.46x, up from 3.83x two years ago; total debt +54% to $167.4bn; S&P downgrade to BBB− on 2026-07-09; liquidity exhausted at a 2%–20% EBITDA decline once guided capex is included | The "Stretched" solvency verdict is cited as an independent reinforcement of the Watchlist cap |
| **4. Serial acquirer** | Did not trip | Two spaced deals; acquisition-pattern severity 30/100, below the 70 threshold | — |
| **5. Fast-changing industry** | **Tripped** | RF-BQ-005 — industry rate-of-change / disruption-risk score 33/100 (threshold ≤40) | Caps business quality at 65 (non-binding — actual score is already 43) and flags the AI buildout as a **sector/technology-cycle bet, not a durable compounder**. Also caps catalyst strength at max 55 (applied at 52), with an explicit instruction that a clean beat alone must **not** be read as conviction-lifting |
| **6. Unaligned owner** | Did not trip | Ellison's 40.21% (~$168.5bn) is an engaged, aligned founder stake | — |

**Survival read in one line:** Oracle is solvent on debt service alone — EBITDA/interest coverage is 6.63x–7.98x and ~99% of debt is effectively fixed-rate — but (EBITDA − capex)/interest is **−5.47x**, meaning that once the building programme is counted the business does not generate enough to cover its own interest, and it depends on open capital markets while sitting one notch above junk.

---

## 7. Valuation and Fair Value (§16)

| Level | Price | vs. today's $153.94 |
|---|---:|---:|
| Bull | $212.67 | +38.15% |
| **Base (fair value)** | **$133.77** | **−13.10%** |
| Bear — cyclical (12mo) | $94.62 | −38.53% |
| Bear — structural reset (24–36mo, headline) | $31.44 | −79.58% |

**Margin of safety: −15.08%.** Margin of safety is the discount between the price you pay and what the business is worth — the cushion that protects you if you are wrong. Here it is negative: the stock trades *above* the base-case fair value. There is no cushion.

**Method and weighting.** The dominant approach is multiples-first — own-history EV/EBIT plus peer forward EV/EBITDA, 80% combined weight, appropriate for an operating company with usable forward estimates. A DCF (discounted cash flow — valuing the business by its future cash, discounted back to today) is weighted 20% as a cross-check.

**The methods disagree materially, and the thesis says so rather than averaging it away.** Multiples cluster near $150 (own-history $151.27, peers $148.70). The DCF lands at $68.92 — a 207.7% cross-method spread, and its terminal value (the assumed value of everything beyond the forecast years) is 80.7% of the total enterprise value, which makes it assumption-heavy. The valuation module therefore weighted the DCF at 20%, not zero and not a majority, producing a blended base case of $133.77 — 13% below price, an explicitly disclosed departure from a pure multiples average. That method spread cost 7 confidence points.

**Why the cautious side won.** Three independent lenses agree: the DCF, the reverse-DCF (price requires a 51.3% FY27 beat and a 61.9% terminal margin with no peer precedent), and the business-model module's separately confirmed eroding return-on-capital trend.

**Peer comparison** (10-name Capital IQ set; the full set is skewed up by three hyper-growth outliers — Palantir 63.3x, Snowflake 98.7x, CrowdStrike 116.9x):

| Metric | Oracle | Peer median | Read |
|---|---:|---:|---|
| Forward (NTM) EV/EBITDA | 11.65x | 15.19x | Looks like a 23.3% discount — but against the cleaner five-name 10-K-named-competitor subset it flips to roughly in-line (11.65x vs 11.92x) |
| LTM EBITDA margin | 45.3% | 30.4% | +49% premium — a genuine positive |
| Total debt / EBITDA | 5.0x | 1.1x (10-name); 0.8x (named-competitor subset) | ~4.5x–6x peer leverage — an extreme gap |
| Return on capital | ~8.5%–10.5% (own-computed) | Microsoft ~21%; SAP ~12–14% (both unverified, web-sourced) | Oracle is the weakest of the three on capital returns despite the fastest headline growth |

The thesis's own conclusion on the gap: this is **true mispricing**, not cycle fear. The stock is not trading at a discount for AI-spending scepticism — it trades at a premium to its own history and in line with peers, while carrying 4.5–6x peer leverage that the market appears not to have priced.

---

## 8. Catalysts (§17)

Seven of fourteen identified events carry proven dates. Catalyst strength scored 52/100 (capped at max 55 by §24 Filter 5).

| Date / window | Event | Bullish trigger | Bearish trigger |
|---|---|---|---|
| 2026-08-25 | Annual General Meeting — tests say-on-pay opposition against the prior two years' 18–22% | Opposition falls below 18% | Opposition holds at or above 18–22% |
| **2026-09-04** | **FQ1 FY2027 earnings — the single most important catalyst.** Tests whether RPO conversion can approach the price-implied 51.3% growth vs. management's 33.6% guide. Guidance: revenue +27–29%, non-GAAP EPS $1.72–$1.76 | Revenue clears the guide ceiling; gross margin does not step down further than flagged | A named mega-customer pullback, or a larger-than-guided margin step-down |
| 2026-09-16 | Defendants must respond to the OCI securities class action | Motion to dismiss narrows or removes named defendants | Defendants answer instead of moving to dismiss |
| ~2026-09-28 | 2026 proxy statement (DEF 14A) expected — the primary source for pay, board and related-party detail, currently a genuine gap | No new related-party dealings; pay design moves toward per-share metrics | Pay design unchanged from the revenue-based CFO metric |
| September 2026 (day undisclosed) | $3.3bn Oracle guarantee of a data-centre lessor's borrowing matures | Lessor refinances independently | Lessor cannot refinance and draws the guarantee |
| Overdue since 2026-06-28 | Netherlands Supreme Court GDPR ruling — **the biggest bearish catalyst**; a non-binding Advocate General opinion already leans against Oracle, damages unquantified | Court rules for Oracle, or damages judged immaterial | Court adopts the adverse recommendation |
| Apr-2027 / 2027-08-16 | $2,250mn senior notes / $4,645mn term loan mature (part of $17,355mn due within 24 months, against −$23,686mn FY2026 levered free cash flow) | Refinanced from cash/revolver without fresh issuance at stressed spreads | Must issue new debt into a market pricing further-downgrade risk |
| Q1 FY2027–FY2029 | $260,000mn of additional data-centre lease commitments begin moving onto the balance sheet (~1.9x today's entire gross debt) | Leases commence alongside matching RPO-to-revenue conversion | Leases commence but demand does not convert on schedule |

**Important caveat carried from the catalyst module:** the 2026-09-04 print, the lease-commencement window and the ~$40bn FY2027 financing plan are all flagged under §24 Filter 5. None should be read as automatically conviction-lifting even on a clean beat, because the outcome hinges on an AI-infrastructure spending race with no knowable winner.

---

## 9. Scenario Model (§10)

| Case | Probability | Return | Price target | What must happen |
|---|---:|---:|---:|---|
| Bull | 15% | +38.15% | $212.67 | Gross margin snaps back toward FY25 levels **and** all four named >$8bn customers keep converting RPO on schedule **and** the market re-rates to Oracle's 5-year mean multiple (14.0x vs 11.65x today) — a three-condition conjunction |
| Base | 32% | −13.10% | $133.77 | Consensus forward EBITDA ($49,996M) is roughly achieved; the market keeps discounting the leverage and eroding ROIC — no further de-rating, no re-rating |
| Bear — cyclical (12mo) | 33% | −38.53% | $94.62 | At least one named mega-customer pulls back on contracted RPO, and/or the FY27 gross-margin step-down lands harder than guided |
| Bear — structural reset (24–36mo) | 20% | −79.58% | $31.44 | The eroding moat does not stabilise: OCI never reaches AWS/Azure-level scale economics and commoditises, while the legacy support annuity shrinks faster than OCI can replace it |

- **Probabilities sum to 100%** ✓ (15 + 32 + 33 + 20)
- **Probability-weighted expected return: −27.10%**
- **Probability-weighted target price: $112.22** — which reconciles: (112.22 − 153.94) / 153.94 = −27.10% ✓
- **Risk/reward: (112.22 − 153.94) / (153.94 − 31.44) = −0.34**
- **Downside risk: 79.58%**

**Span and conjunction checks.** The bull case is +38% above the current price — a genuinely large move, so the case set is not too narrow. The bull needs three conditions at once; the cyclical bear needs effectively one adverse event. That asymmetry is deliberate and evidenced, and it is why bull carries less weight than bear-cyclical despite a comparable move size.

**Sensitivity, disclosed rather than hidden.** The result is materially sensitive to the 20% weight on the structural bear. At 10% weight, expected return moves to roughly −19%; at 30%, roughly −35%. The *direction* (negative expected return, no margin of safety, do not buy) holds across that range; the *magnitude* is not precise beyond "materially negative."

**Is the expected return worth the risk? No.** A negative probability-weighted expected return and a negative risk/reward are the quantitative basis for "no new position" — not a hunch.

---

## 10. What Would Change Our Mind (§8/§19)

Five kill criteria, all specific and observable:

1. **FQ1 FY2027 revenue growth (2026-09-04) prints below the guided 27–29% range, or gross margin steps down more than management has already flagged.** Confirms the overvaluation and margin-timing risk. *(Owner: earnings)*
2. **Any of the four named >$8bn AI-infrastructure customers pulls back, delays, or renegotiates contracted RPO.** The single named killer risk. Monitor via quarterly RPO disclosure and material-event filings. *(earnings / business-model)*
3. **Committed liquidity is drawn down faster than the 2%–20% EBITDA-decline break point** — the revolver is drawn, capex is cut, or a covenant-basis dispute arises. Confirms the "Stretched" read is binding, not theoretical. *(balance-sheet-survival)*
4. **The OCI securities class action survives the motion-to-dismiss stage** (defendants respond by 2026-09-16; a ruling could land as late as ~2026-12-18) **or is amended with stronger allegations.** Keeps the Watchlist ceiling in place regardless of the valuation call. *(management-governance)*
5. **The 2026 proxy (due ~2026-09-28) discloses co-CEO pay still built on revenue/size rather than per-share or ROIC measures, and/or say-on-pay opposition stays at 18–22%.** Confirms weak incentive alignment. *(management-governance)*

**What would flip the thesis the other way** (the falsification side): FQ1 revenue growth **above 35% year-on-year with gross margin flat or higher** than FQ4 FY2026. Those are the two forecast-ledger falsification triggers, held at 65% and 60% probability respectively.

**What would force outright exit or rejection:** confirmed loss of a named AI-infrastructure customer's committed capacity; a covenant-basis dispute; or evidence that the disclosed FY2026 cybersecurity incidents were more material than currently characterised.

---

## 11. Second-Best Bet

**Microsoft (MSFT)** — a safer way to express the same AI-infrastructure demand theme. It is named directly as Oracle's closest scaled competitor in both cloud infrastructure and cloud applications, and scores better on every quality measure this run examined: LTM EBIT margin 46.8% vs Oracle's 33.2%, third-party-estimated ROIC ~21% vs Oracle's own-computed ~8.5–10.5%, and roughly 21% of global cloud-infrastructure share vs Oracle's ~3%. It carries the same demand exposure without Oracle's leverage (4.46x net debt/EBITDA and rising), without an unresolved securities-fraud allegation, and without the four-customer concentration.

**The caveat matters:** no dedicated Microsoft research was performed in this run. This is a directional, evidence-anchored comparison drawn from data gathered on Oracle's peer set — not a second thesis. A real Microsoft view would need its own run before any sizing.

---

## 12. What We'd Need to Get More Confident

Data sufficiency is 78/100 — good, with gaps. The main ones:

- **Segment-level (OCI-specific) capex, invested-capital base, and forward margin/revenue guidance.** Oracle states it does not track assets by business [FY26 10-K, Note 13].
- The **2026 proxy statement** (due ~2026-09-28) — resolves the incentive-alignment, board and related-party caps.
- The **full text of the revolving credit agreement** (Exhibit 10.14) and a primary rating-agency rationale — resolves the covenant-quality cap held at 60/100.
- The verbatim **FQ2 FY2026 transcript** — the one genuinely bad quarter (the ~$15bn capex-guidance miss, stock −10.8%) has no verbatim record, capping the "tone in bad times" read.
- Company-disclosed interest-rate sensitivity on the $167.4bn debt load, and a quantified capex-to-revenue margin-timing lag.

**The single highest-value next data request:** *segment-level (OCI-specific) capital expenditure, invested-capital base, and forward margin/revenue guidance.* Both the business-model and valuation modules independently named this as their biggest gap. It is the one input that would let management's "high-20s" steady-state ROIC claim be tested against filed evidence instead of relying on the declining consolidated segment margin as the only audited proxy. Next possible release: 2026-09-04.

---

## 13. Bottom Line

- **What it does:** sells database and business software (86.9% of revenue sits in one segment) and rents AI computing capacity; OCI grew 77% in FY26 and is the entire growth story, funded by debt.
- **Why it may go up:** demand is real and supply-constrained — 98% of AI data-centre capacity is contracted, GPU use is 97.5%, and the signed order book grew 363% to $638bn. The legacy support annuity ($19,804M, flat) is a proven earnings floor.
- **Why it may go down:** the price assumes a 51.3% FY2027 revenue jump against management's own 33.6% guide, and a 61.9% terminal margin no peer has posted. Debt rose 54% to $167.4bn, S&P cut the rating to BBB−, and committed liquidity runs out at a 2%–20% EBITDA fall once the real ~$70bn capex plan is counted.
- **What supports the thesis:** an audited FY2026 10-K, two verbatim transcripts, and Capital IQ exports — 5 of 6 modules rated their data "Sufficient". Data sufficiency 78/100.
- **What is missing:** OCI-specific capex and returns data, the 2026 proxy, the credit-agreement covenant text, and the worst-quarter transcript.
- **Buy now or wait: wait.** Expected return is −27.1%, risk/reward is −0.34, and the margin of safety is −15.08% — there is no cushion. And a Critical, unresolved securities-fraud allegation caps the rating at Watchlist regardless of how the valuation debate resolves.
- **Do not short it either.** The earnings setup into 2026-09-04 is genuinely balanced (the clean beat rate over four quarters is 50%), short interest is just 1.74% of shares outstanding, and a real supply-constrained demand story creates squeeze risk.
- **The one thing to watch next:** the **2026-09-04 FQ1 FY2027 print** — whether revenue lands near the 27–29% guide (expected, 65% probability) or jumps above 35% (which would flip this thesis).

---

## 14. Plain-English Glossary

- **RPO (remaining performance obligations)** — contracted revenue a company has signed but not yet billed or recognised; Oracle's is $638bn, up 363%.
- **OCI (Oracle Cloud Infrastructure)** — Oracle's business renting out computing capacity, especially AI chips.
- **Capex (capital expenditure)** — money spent on long-lived assets like data centres; Oracle's rose 162% in FY26 and is guided at ~$70bn for FY2027.
- **Free cash flow (FCF)** — cash from operations minus total capex; the cash actually left over. Oracle's was −$23,686M in FY2026.
- **EBITDA** — earnings before interest, tax, depreciation and amortisation; a rough measure of operating cash profit. Oracle's LTM EBITDA margin is 45.3%.
- **EBIT** — operating profit after depreciation but before interest and tax. Oracle's LTM EBIT margin is 33.2%; Microsoft's is 46.8%.
- **Gross margin** — revenue left after the direct cost of delivering the service; Oracle's fell 469 basis points in FY26.
- **Basis point (bp)** — one hundredth of a percentage point; 469bps = 4.69 percentage points.
- **EPS (earnings per share)** — profit divided by shares outstanding. "GAAP" is the audited accounting standard; "non-GAAP" is management's adjusted version — Oracle's FY26 GAAP EPS grew 34%, but only 18% excluding one-off gains.
- **Net debt (strict basis)** — total debt minus cash; Oracle's is $136,143M ($167.4bn debt less $31,289M cash).
- **Net debt/EBITDA** — how many years of operating cash profit it would take to repay net debt; Oracle's is 4.46x versus a peer median of about 1.1x on total debt.
- **ROIC (return on capital)** — the profit the business earns on each $100 of money put into it; compare it against the cost of capital. Oracle's fell from 12.35% to 8.22% over four years.
- **Cost of capital (WACC)** — what the money used by the business costs to raise; Oracle's is estimated at ~11.2% (an inference, not a filed figure).
- **Moat** — a durable advantage that stops competitors taking the business; Oracle's is rated "narrow, eroding."
- **Multiple (EV/EBITDA, EV/EBIT)** — the price the market pays per dollar of profit, measured against enterprise value. Oracle trades at 11.65x forward EV/EBITDA.
- **Enterprise value (EV)** — the whole business's value: market value of shares plus debt, less cash. Oracle's is $584,464.2M.
- **NTM / LTM** — next twelve months (forward estimate) / last twelve months (actual).
- **DCF (discounted cash flow)** — valuing a business by its expected future cash, converted back into today's money.
- **Terminal value** — the assumed value of everything beyond the explicit forecast years; it is 80.7% of Oracle's DCF value, which makes that DCF assumption-heavy.
- **Reverse-DCF** — running the valuation backwards to ask what growth and margins the current price already assumes. Oracle's price assumes a 51.3% FY27 revenue jump and a 61.9% terminal margin.
- **Margin of safety** — the discount between price paid and estimated worth; the cushion if you are wrong. Oracle's is −15.08% (there is none).
- **Risk/reward** — expected gain measured against expected loss; Oracle's is −0.34, meaning the weighted target sits below today's price.
- **Probability-weighted expected return** — each scenario's return multiplied by its probability, then added up; −27.10% here.
- **Covenant** — a promise to lenders that, if broken, can force early repayment. Oracle's one disclosed covenant does not breach until EBITDA falls 54.8%–62.4%.
- **Revolver** — a pre-agreed bank borrowing line the company can draw on; Oracle's $10.0bn is fully undrawn.
- **Off-balance-sheet commitment** — a future obligation not yet recorded as a liability; Oracle has $260,000mn of data-centre leases starting FY2027–FY2029.
- **Credit rating / BBB−** — an agency's judgment of default risk; BBB− is the lowest investment-grade notch, one step above "junk."
- **Short interest** — the share of a company's stock borrowed and sold by investors betting it falls; Oracle's is 1.74% of shares outstanding.
- **Squeeze** — when a rising price forces those short sellers to buy back, pushing the price higher still.
- **Say-on-pay** — the shareholder vote on executive pay; Oracle drew 18–22% opposition at each of the last two meetings.
- **Motion to dismiss** — a defendant's request to throw a lawsuit out before trial; surviving one means the case proceeds.
- **Buyback** — a company purchasing its own shares; Oracle's FY2026 spend was 1.9% of its stock-based pay expense, so the share count is rising again.
- **ATM equity programme** — selling new shares into the market over time; Oracle has a $20bn programme inside its ~$40bn FY2027 financing plan.
- **Conjunction check** — testing whether a scenario secretly requires several things to go right at once; Oracle's bull case requires three.
