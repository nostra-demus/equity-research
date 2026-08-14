> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**
> scenario 'bull' level 31.78 != forward_metric×multiple 32.8139 — the Playground recomputes the latter and would disagree with the recorded level; scenario 'base' level 23.67 != forward_metric×multiple 24.7028 — the Playground recomputes the latter and would disagree with the recorded level; scenario 'bear_cyclical' level 16.79 != forward_metric×multiple 17.8162 — the Playground recomputes the latter and would disagree with the recorded level; scenario 'bull' shows level 32.8139 but decision_record price_target is 31.78 (the Playground derives this from the recorded levers, disagreeing with the frozen thesis); scenario 'base' shows level 24.7028 but decision_record price_target is 23.67 (the Playground derives this from the recorded levers, disagreeing with the frozen thesis); scenario 'bear_cyclical' shows level 17.8162 but decision_record price_target is 16.79 (the Playground derives this from the recorded levers, disagreeing with the frozen thesis); the thesis records no SIGN CHECK against the module that owns its driver (synthesizer.md Step 3b / HARD GATE 7). State it even when the signs AGREE — one line naming the module, its factor label and its confidence. The absence of that line is what let a thesis contradict its own module in silence.; scenario 'base' has 2 conditions that must hold simultaneously but joint_probability_basis is empty — CLAUDE.md §10 requires stating why all conditions genuinely move together, or decomposing the conjunction into separate cases; scenario 'bear_cyclical' has 2 conditions that must hold simultaneously but joint_probability_basis is empty — CLAUDE.md §10 requires stating why all conditions genuinely move together, or decomposing the conjunction into separate cases
>
> Resolve the flagged items — re-run the synthesizer §14 math and/or the truth-integrity audit (`/research:verify-evidence`) — and re-publish before relying on these numbers. (CLAUDE.md §5/§10/§15; finish-gate F01/F17/F30.)

# HAIER — Investment Dossier (2026-08-13)

Haier Smart Home Co., Ltd. (SHSE:600690, also HKEX-listed) makes and sells refrigerators, washing machines, air conditioners, kitchen appliances, and water heaters worldwide under Haier, Casarte, GE Appliances, Candy, Fisher & Paykel, and AQUA — built mostly by buying established regional appliance makers rather than growing organically.

Run date: 2026-08-13 | Modules: business-model, earnings, valuation, balance-sheet-survival, management-governance, catalyst | `RUN_METADATA.md` not found for this run (non-blocking — modules were run directly, not via the `/research:full` master orchestrator; every module folder carries a complete `99_*-synthesis.md`) | No prior dated HAIER run exists — this is the first snapshot.

## Table of Contents

- Part I — Investment Committee Decision
- Part II — Cross-Cutting Analysis
- Part III — Module Chapters
- Part IV — Module Appendices
- Part V — Evidence and Process

---

# PART I — INVESTMENT COMMITTEE DECISION

## 1. One-Line Decision

`Decision: Watchlist — a fortress balance sheet and a properly-governed company are trading at only an 8.1% discount to fair value, while earnings are decelerating into a print (2026-08-27/28) whose own setup already favors a miss.`

## 2. Headline Scorecard

| Item | Answer |
|---|---|
| Rating | Watchlist |
| Suggested action | Monitor only — no position. Revisit after the 2026-08-27/28 H1 2026 print |
| Time horizon | 12 months (primary scenarios); the structural-erosion tail case plays out over 24–36 months |
| Expected return | +3.0% (probability-weighted, CNY 21.75 → CNY 22.41 weighted target) |
| Downside risk | 26.9% (loss to the headline structural-bear case, CNY 15.90) |
| Risk/reward | 0.11 (poor — see §14 for the executed math) |
| Understanding /100 | 75.5 |
| Conviction /100 | 42.0 |
| Suggested sizing | Monitor only — no position (track opportunity cost) |
| Thesis type | Company-specific; Commodity-conditional; Policy-conditional |
| Variant perception — edge score /100 | 25 |
| Biggest upside driver | North America's claimed post-weather/tariff shock proves genuinely one-off AND raw-material cost inflation stabilizes, letting margin expansion resume toward the CNY 31.78 bull case |
| Biggest downside driver | Raw-material cost inflation (84% of appliance COGS, no pass-through) compounding with China's fading trade-in subsidy, deepening the moat erosion already confirmed in the data |
| Killer risk | The confirmed moat-erosion trend (460bp gross-margin decline over 5 years, 2 consecutive ROIC declines) continues rather than stabilizes — the H1 2026 print (2 weeks away) is the first live test |
| Avoid-Big-Risks filters tripped (§24) | None of the six filters tripped to a hard cap (all tested explicitly, see §9A/Decision Audit Trail) |
| Rating cap, if any | Cross-module forensic mosaic (3 distinct tags — RF-EQ-001, RF-DISC-001, RF-DISC-002 — across 2 modules) caps the ceiling at "Starter Position Only"; the Watchlist rating chosen here is more conservative than that ceiling and is not itself forced by it |

## 3. Would I Buy This With Real Money Today?

**Final answer: I would not buy this today** because the price already reflects most of the good news (only an 8.1% cushion to fair value) while the next two weeks carry a real chance of a third consecutive earnings miss, and the moat — the thing that would justify paying up for Haier over its stronger-margin peers — is confirmed to be eroding, not stabilizing, in the most recent data.

- **Confidence score:** Understanding 75.5/100 (the situation is well understood — audited annual reports on two accounting bases, a Q1 2026 filing, full consensus history, five valuation methods, and a full solvency stress test all sit in the pool). Conviction 42.0/100 (a genuinely non-committal number — this is what "wait and see" looks like on a 0–100 scale, not a rounding error).
- **Position stance:** No position. This is a name to watch through the 2026-08-27/28 print, not to own into it.
- **What would raise confidence:** A H1 2026 print that beats the already-cut consensus (revenue > CNY 75,076mn, EPS > CNY 0.58) on both lines, with a segment P&L that actually reconciles the ">10% ex-North-America operating profit growth" claim management has not yet backed up with numbers; gross margin holding at or above 26.3%; the Haier Group Finance Co. related-party borrowing ratio stabilizing rather than climbing further past 37.7% of its cap.
- **What would lower confidence:** A third consecutive miss; gross margin falling below 26.3%; related-party borrowing utilization climbing further; a second straight year of negative incremental ROIC once FY2026 closes.
- **What would force exit/rejection:** Evidence the North America "one-off weather/tariff shock" story is false (tariffs persisting into H2, not "gradually easing" as management's own unverified forecast claims) combined with China demand deteriorating further — that combination would validate the structural-bear case (CNY 15.90, −26.9%) as the base case, not a tail risk, and this name would move from Watchlist to Avoid.

## 4. The Actual Variant Perception

- **What everyone already knows:** Haier trades at a 25–38% discount to Midea and Gree on every reported multiple; its margins (EBIT 6.9%) trail both peers (Midea 9.8%, Gree 17.4%); China's appliance trade-in subsidy is fading and raw-material costs are rising; the last two reported quarters both missed consensus.
- **What is probably priced in:** Most of it. The peer-relative valuation method — the dominant, market-anchored method in this dossier — finds that once Haier's below-peer margin and confirmed-eroding moat are quality-adjusted for, the residual gap to peers shrinks to a modest +1.5% (CNY 22.08 fair value vs. CNY 21.75 price). The market is not obviously mispricing the known facts.
- **What the engine thinks may be missed:** Two things, both modest, not decisive. First, the common "China SOE-adjacent stock trades cheap on a governance discount" story does not hold here — the management-governance module explicitly tested for a structurally unaligned controlling owner (§24 Filter 6) and did not find one; Haier Group Corporation is a collectively-owned enterprise with no pledging, no dual-class stock, and cumulative voting. Anyone assuming the discount is an ownership discount is wrong; it is an earnings-trajectory discount instead. Second, a genuine cross-module forensic mosaic exists: three separately sub-threshold accounting-integrity signals (rising accruals, an unreconciled favorable regional claim, a recurring subsidy mislabeled "non-recurring") span two different modules (earnings, management-governance) — no single module flagged this as material on its own, but stacked together they are a real, monitorable caution a surface read of "cheap, fortress-balance-sheet appliance maker" would miss.
- **What evidence proves we are actually different:** If the FY2026 annual report (~March 2027) shows Haier Group Finance Co. related-party borrowing continuing to climb past its current 37.7% cap-utilization AND the accrual pattern (receivables/inventory outgrowing revenue/COGS) persists for a third straight year, the forensic-mosaic caution is confirmed as a real, worsening pattern rather than a one-off. If instead borrowing utilization stabilizes or falls and the accrual pattern reverses, the caution is falsified and should be dropped from future runs.

Edge score: **25/100**. This is a real but modest edge — mostly a correction to what the discount is NOT (an ownership discount) plus a genuine but sub-threshold accounting-mosaic caution — not a strong, proprietary insight the market has missed. Per the edge gate, conviction is capped at 60 regardless of anything else in this dossier, and the actual computed conviction (42.0) sits well inside that cap.

## 5. Thesis → Antithesis → Final Thesis

- **Thesis:** Haier is a global-scale appliance maker with a fortress balance sheet (net cash on every basis, 1.61x gross leverage) trading close to fair value — a safe, if unexciting, way to own the China appliance sector.
- **Antithesis:** "Close to fair value" cuts both ways — the 8.1% margin of safety is thin, and the earnings trend feeding that fair-value estimate is deteriorating (revenue growth cut from +12.6% to +5.7% to outright −6.9% in the latest quarter), with the next print already set up to miss.
- **Revised thesis:** The balance-sheet safety is real and should limit how far this can fall in a genuine crisis, but it does not protect the equity from a re-rating if the moat keeps eroding — the valuation module's own structural-bear case (CNY 15.90, a real quarter of the current price, not a remote tail) is exactly what a continuing moat-erosion trend produces.
- **Antithesis:** Two consecutive misses have already happened and consensus has already been cut ~14% — is the bad news already in the price?
- **Final thesis:** Partially. The peer-relative method (the dossier's most trustworthy method, anchored in real market prices) finds most, not all, of the discount already reflects the weaker fundamentals — leaving a genuine but thin ~8% cushion, not a bargain. Combined with a near-term catalyst whose own setup favors another miss and a real (if modest) accounting-mosaic caution, the risk/reward does not clear the bar for a position today. This is a name to watch through the print, not to own into it.
- **Insight threshold reached:** the remaining uncertainty is mostly data-dependent, not reasoning-dependent — the single question that resolves this (does the moat erosion stabilize or continue?) will be answered incrementally by the 2026-08-27/28, ~late-October, and ~March-2027 prints, not by further analysis of what is already in the pool.

## 6. Simple Summary

- **What it does:** Makes and sells major home appliances worldwide under several owned brands, built mostly through acquisitions (GE Appliances 2016, Fisher & Paykel 2018, Candy 2019).
- **Why it may go up:** It clears its own cost of capital, holds more cash than debt, trades near fair value with a real margin of safety, and management's incentive pay genuinely misses its targets rather than getting rubber-stamped.
- **Why it may go down:** Rising raw-material costs (steel, copper, aluminium — 84% of the cost of what it sells) with no way to pass them to customers, a fading government subsidy that was propping up China demand, and a moat that is measurably shrinking against its two closest peers.
- **What data supports the thesis:** Audited annual reports on two accounting bases (translated from Chinese, not treated as a data gap), a Q1 2026 quarterly filing, a fresh (1-day-old) share price, full analyst consensus history, and a complete balance-sheet stress test.
- **What data is missing:** No committed bank credit line total, no formal loan covenant package, no credit rating, and no earnings-call transcript from after 2019 — none of these are severe enough to refuse a rating, but each limits how far this analysis can be pushed.
- **Buy now or wait:** Wait. The H1 2026 results (2026-08-27/28, about two weeks away) are the first real test of whether the earnings deceleration is stabilizing or continuing.
- **The one next thing to check:** The H1 2026 print itself — specifically, whether gross margin holds at or above 26.3% and whether the ">10% ex-North-America operating profit growth" claim management made in Q1 2026 is finally backed up by an actual segment-level number.

---

# PART II — CROSS-CUTTING ANALYSIS

## Decision Audit Trail

| Decision Driver | Bull Evidence | Bear Evidence | Which Side Wins? | Why? | Confidence /100 |
|---|---|---|---|---|---:|
| Is Haier cheap? | Peer-relative discount of 25–38% to Midea/Gree/Whirlpool on every multiple; own-history mean (7.38x) and quality-adjusted peer multiple (7.35x) converge independently | Quality-adjusted for below-peer margins, the residual gap shrinks to +1.5% (CNY 22.08 vs. CNY 21.75) — "mostly, not fully" explained by fundamentals, per the valuation module's own read | Bear (mild) | The peer-relative method is the dossier's most trustworthy method (real, dated market comps, independently corroborated by own-history), and it explicitly says most of the discount is warranted | 75 |
| Is the balance sheet safe? | Net cash on every basis since FY2021, 1.61x gross leverage, survives a full 100% EBITDA wipeout for a year without exhausting liquidity | 55% of gross debt sits in one within-12-month bucket; no committed bank facility, no covenant package, no credit rating exist anywhere in the pool | Bull | Cash alone covers the near-term wall 2.0x over — the disclosure gaps are real but do not change the arithmetic; this is genuinely a Fortress balance sheet, just an uncorroborated one | 85 |
| Is the earnings trend improving or worsening? | Management claims ex-North-America Q1 2026 operating profit grew >10%; China is gaining nominal share in several categories even as the market shrinks | Revenue growth cut from +12.6% (FY2023) to +5.7% (FY2025) to −6.9% (Q1 2026); two consecutive misses against an already-cut consensus; revision breadth net negative (EPS 1 up / 11 down) | Bear | The bull case rests entirely on one unverified management claim never reconciled to a segment P&L; the bear case is standing, already-reported evidence, not a forecast | 80 |
| Is governance a reason to avoid this stock? | No hard disqualifier; incentive pay genuinely missed its ROE/profit-growth hurdles in FY2025; 0% pledging; no dual-class stock; clean unqualified 13-year audit tenure | Haier Group Finance Co. relationship deepening fast — 57% of Group cash parked there, related-party borrowing up ~19x YoY to 37.7% of its cap; combined Chair/CEO role; sub-majority-independent Audit Committee | Neither — Watchlist band | Six red flags fired, reconciled to 0 Critical / 4 High / 2 Medium; nothing crosses the disqualifying threshold, but nothing here earns a clean bill either — "Standard / mixed" is the accurate read, not a bull or bear win | 80 |
| Does the accounting-integrity mosaic matter? | Each individual signal (rising accruals, an unreconciled regional claim, a mislabeled "non-recurring" subsidy) is sub-threshold on its own, and cash conversion has never broken down (CFO/EBITDA never below 93.9% in 5 years) | Three distinct tags (RF-EQ-001, RF-DISC-001, RF-DISC-002) fire across two modules (earnings, management-governance) — per CLAUDE.md §13, that compounds into a single High accounting-integrity flag | Bear (capped, not disqualifying) | The compounding rule exists precisely because individually-forgivable signals can be a real pattern when stacked — this caps the rating ceiling at "Starter Position Only," though it does not by itself force a lower rating | 70 |
| Is the near-term catalyst set up to help or hurt? | The CNY 6,000mn buyback (24.8% completed) is a proven-date, self-limiting capital-return catalyst; the FY2025 dividend paid on schedule | The H1 2026 print (2026-08-27/28) — the one dated event that can actually move the stock — has a setup that already points down: two consecutive misses, net-negative revision breadth | Bear | The buyback is real but small next to the print; the print's own setup, not a hypothetical, argues for caution into the date | 78 |

## 6. Valuation and Peer Mispricing

*(Deferring in full to `valuation/99_valuation-synthesis.md` — see Chapter C for the module's own account.)*

Haier reads as **fairly valued, not cheap**: base fair value of CNY 23.67/share sits only 8.8% above the CNY 21.75 price (1 trading day old, pool-verified). Bull / base / bear-cyclical / headline bear-structural levels are CNY 31.78 / 23.67 / 16.79 / 15.90 — a 2.0x spread from bull to bear-structural. The dominant method is peer-relative valuation (68% weight), the only method anchored in real, dated market prices for named comparables (Midea, Gree, Whirlpool).

| Metric | Company (Haier) | Peer Median (Midea/Gree/Whirlpool) | Premium / Discount | Interpretation |
|---|---:|---:|---:|---|
| EV/LTM EBITDA | ~6.75–7.38x (own-history) | 9.71x (unadjusted peer median) | −24.3% raw discount | Shrinks to ~+1.5% once quality-adjusted for below-peer margin — mostly warranted |
| LTM EBIT margin | 6.9% | Midea 9.8%, Gree 17.4% | Well below both named peers | Reflects the confirmed-eroding moat, not a market error |
| Gross margin | 26.3% | Midea 26.3% (tie), Gree 29.8% | Roughly ties Midea, trails Gree | Consistent with the margin-based multiple discount |

Three explanations for any residual gap were tested explicitly: (1) **True mispricing** — a modest +1.5% residual exists once quality-adjusted, genuinely small; (2) **Cycle fear** — partially supported: China's trade-in subsidy fade and raw-material inflation are real, already-realized headwinds, not merely feared ones; (3) **Balance-sheet, governance, or quality discount** — ruled out on the ownership dimension (no misaligned controlling owner found, §24 Filter 6 not tripped) but confirmed on the moat-quality dimension (460bp five-year gross-margin decline, ROIC down for two straight readings). The valuation gap is an earnings-trajectory discount, not an ownership-driven value trap.

The reverse-DCF read (`05_reverse-dcf.md`) is two-sided: the price implies either a historically unprecedented multi-year cash-flow contraction, or the market is simply discounting ordinary cash flows at a rate roughly 3x the DCF module's own CAPM-derived WACC (12.3% market-implied vs. 4.10% CAPM). Treat this as inconclusive, not a standalone conviction driver, exactly as the valuation module recommends.

## 7. Catalyst Calendar

*(Deferring in full to `catalyst/99_catalyst-synthesis.md` — see Chapter F for the module's own account. Timing-visibility 62/100 — proven near-term, vague long-run — sets the catalyst-timing confidence cap applied in the Confidence Scoring Rules below.)*

| Date / Window | Catalyst | Why It Matters | Bullish Trigger | Bearish Trigger |
|---|---|---|---|---|
| 2026-08-21 | Final FY2025 dividend payment (RMB 8.9151/10 shares) | Confirms cash is actually paid on the stepped-up payout floor | Already priced in — on-time payment is a confirmation, not a surprise | A payment delay or shortfall (no evidence points this way) |
| **2026-08-27/28** | **H1 2026 interim results** | The nearest catalyst that can actually move the stock; tests whether North America's claimed recovery is durable and whether China demand deterioration deepens | Revenue > CNY 75,076mn / EPS > CNY 0.58 (next-Q consensus), AND gross margin holds ≥26.3% | A third consecutive miss, gross margin below 26.3%, or China demand deteriorating further |
| Through 2027-03-26 | CNY 6,000mn buyback (24.8% complete as of Jun-2026) | Self-limiting capital-return program; unused shares cancelled after 3 years | Pace accelerates or completes early | Program stalls or lapses materially underspent |
| ~Late October 2026 (inferred, vague) | Q3 2026 results | Next checkpoint on the margin-erosion trajectory | North America tariff impact genuinely eases | China's "high base" subsidy-fade effect keeps pressuring the segment |
| ~March 2027 (inferred, vague) | FY2026 annual results | First full-year test of the ≥58% dividend floor and the Haier Group Finance Co. cap-utilization trend | Payout floor met, CCR delivers "high single-digit" growth | Related-party borrowing climbs further toward its cap |
| Ongoing, undated | China trade-in subsidy fade; US/EU tariffs; raw-material costs | The single most important catalyst is not one date — it is whether this trajectory stabilizes or continues, tested print by print | Subsidy extension, tariff relief, or commodity costs stabilizing | Continued fade/escalation on any of the three |

No §24-flagged catalyst applies (the acquisition-pattern check scored 35/100, well under the 70-severity trigger; no pending M&A or unproven-turnaround claim is on the calendar).

## 8. Scenario Model

Fair-value levels are taken verbatim from `valuation/99_valuation-synthesis.md` (that module owns the levels); this synthesis owns the probabilities (CLAUDE.md §10).

| Case | Probability | Return | Price Target | What Must Happen |
|---|---:|---:|---:|---|
| Bull | 20% | +46.1% | CNY 31.78 | Raw-material excess-cost growth reverts to 0pp AND China domestic demand partially recovers to +5% YoY (a genuine two-condition conjunction); multiple expands to the quality-adjusted ceiling (7.4x). 12-month horizon. |
| Base | 40% | +8.8% | CNY 23.67 | FY2026E consensus growth path holds roughly as guided (revenue +2.24%, EBITDA ~CNY 30.5bn); multiple sits modestly above the current LTM print but short of full reversion to own-history mean. 12-month horizon. |
| Bear-cyclical | 25% | −22.8% | CNY 16.79 | Commodity pressure, competitive intensity, and China property-cycle softness erase the SG&A-driven margin gains posted since FY2021; EBIT margin reverts to the 5-year trough (5.91%). 12-month horizon. |
| Bear-structural (headline bear) | 15% | −26.9% | CNY 15.90 | Moat erosion continues without stabilizing: revenue growth cut to roughly half consensus, EBIT margin fades to 5.00% by FY2030 (below the FY2021 trough), gross margin fades to 23.8%. 24–36 month horizon. |

Probabilities sum to 100%.

**Common driver / correlated-tail check:** All four cases are driven predominantly by ONE underlying variable — whether raw-material cost inflation (no pass-through) and China demand deterioration continue or stabilize. The bull and base cases both require this variable to improve or hold; both bear cases require it to worsen. This is not four independent draws — it is effectively one binary bet (stabilizes vs. continues) expressed across four magnitude bands. The bear-cyclical and bear-structural cases are not diversified from each other; if the driver worsens, both fire together, and the "26.9% downside" figure understates the correlated nature of the loss (there is no meaningfully separate path to bear-cyclical that avoids bear-structural risk if the trend continues past 12 months). This compounding is carried into the Risk Register (§9) and Kill Criteria (§10).

**Span/conjunction check:** The bull case (+46.1%) is well outside a single ordinary weekly move — no span violation. The bull case requires two conditions simultaneously (commodity reversion AND demand recovery) — a genuine, not manufactured, conjunction; the two bear cases require only one thing (continued deterioration) — this asymmetry is deliberate and reflects that deterioration is already partly realized (Q1 2026 already printed −6.9% revenue) while recovery has not yet been evidenced in any reported quarter.

**Executed math** (see §14 for the full reconciliation): probability-weighted expected return **+3.02%**; probability-weighted target price **CNY 22.41**; risk/reward **0.11**; downside risk **26.9%**.

Main upside driver: North America normalization + commodity-cost reversion (bull case). Main downside driver: continued commodity-cost/China-demand deterioration (both bear cases, correlated). Given a +3.0% expected return against 26.9% downside and a risk/reward of 0.11, **the expected return is not worth the risk at today's price** — this is the central quantitative reason behind the Watchlist rating.

## 9. Risk Register

| Risk | Severity /100 | Probability /100 | Early Warning Signal | How To Monitor |
|---|---:|---:|---|---|
| Earnings risk (third consecutive miss) | 60 | 55 | Revenue/EPS below next-Q consensus (CNY 75,076mn / CNY 0.58) | H1 2026 print, 2026-08-27/28 |
| Commodity-cost risk (no pass-through) | 65 | 55 | Copper/steel/aluminium prices continuing to rise past Q4 2025's already-realized −178bps hit | Quarterly gross-margin bridge each print |
| China demand / policy risk (subsidy fade) | 60 | 60 | China retail (ex-3C) continuing below the Q1 2026 −6.2% YoY pace | AVC/industry data each quarter |
| US/EU tariff risk | 55 | 50 | Tariff rates persisting or escalating rather than "gradually easing" as management's unverified claim states | North America segment commentary each print |
| Governance / related-party risk (Haier Group Finance Co.) | 50 | 45 | Related-party borrowing climbing further past 37.7% of its RMB10,000mn cap; cash-parked-with-affiliate % rising above 57% | FY2026 annual report (~March 2027) |
| Accounting-integrity mosaic (RF-EQ-001, RF-DISC-001, RF-DISC-002) | 45 | 40 | Receivables/inventory growth continuing to outpace revenue/COGS for a third year; the ex-North-America claim still unreconciled to a segment P&L | Each quarterly/annual filing |
| Valuation risk (thin margin of safety) | 55 | 45 | Base-case fair value (CNY 23.67) failing to hold as estimates cut further | Post-print consensus revision |
| Balance-sheet/liquidity risk | 20 | 15 | No committed bank facility disclosed; net-cash cushion narrowing (down from CNY 24.3bn net cash in FY2022 to CNY 5.0bn in FY2025) on rising dividends | Annual capital-structure disclosure |
| Execution/turnaround risk (moat stabilization) | 55 | 50 | Gross margin failing to hold ≥26.3% at the H1 print | H1 2026 print |
| Thesis-timing risk | 45 | 40 | The margin-erosion trajectory cannot be resolved by one print — a single beat should not be read as resolution | Track print-by-print through ~March 2027 |

**Correlation note:** Commodity-cost risk, China demand/policy risk, execution/turnaround risk, and valuation risk are NOT independent — they are four expressions of the same underlying driver (does the moat erosion continue?). Their joint materialization is the real tail risk, not a diversified basket of separate small risks. The governance/related-party risk and the accounting-integrity mosaic are a second, separate cluster (disclosure/self-dealing risk), correlated with each other but largely independent of the commodity/demand cluster.

## 9b. Governance & Stewardship

*(Deferring in full to `management-governance/99_management-governance-synthesis.md` — see Chapter D. This supersedes `business-model/11_capital-allocation-governance.md`'s quick-read score of 66/100.)*

- **Stewardship verdict:** Standard / mixed. Governance Score 63/100; Confidence-Adjusted Governance Score 50/100 (= 63 × 80% confidence); **Governance Rating: Watchlist** (55–69 band).
- **Capital-allocation record:** Mixed, trending negative at the margin — no goodwill impairment in 12+ years and a covered, growing dividend, but incremental ROIC turned negative in FY2025 (−8.3%) after four straight years of positive returns.
- **Incentive alignment:** Strong (78/100) — roughly 70–77% of CEO/CFO pay is multi-year equity anchored solely to ROE and profit-growth hurdles, and those hurdles were genuinely missed (not rubber-stamped) in FY2025.
- **Red-Flag Register (carried into §9/§10):** 6 red flags, reconciled to 0 Critical / 4 High / 2 Medium. The two highest-severity: **RF-RPT-003** (related-party borrowing from Haier Group Finance Co. up ~19x YoY to 37.7% of its RMB10,000mn cap; 57% of Group cash parked with the same affiliate — High, reconciled down from the specialist's own "Critical" trend-based tag per a level-basis materiality test, see the module's §3) and **RF-RPT-002** (connected transactions = 5.0% of FY2025 revenue — High).
- **Hard disqualifier:** None flagged by `business-model/01_disqualifier-scan.md`.

**Verdict-lock check:** No hard disqualifier and no Critical-severity red flag exists anywhere in this module — the §13/§18 "cap at Watchlist or lower" rule for a Critical governance flag is not itself triggered (there is no Critical flag), but the module's own Governance Rating already independently lands at "Watchlist," which is consistent with — and reinforces, not drives — the headline rating chosen in Part I.

## 9A. Bull Case — Steelman

| Bull Driver | Why it could dominate | Evidence today (cited) | What would confirm it |
|---|---|---|---|
| Pricing power / moat stabilization (business-model) | If China's price war eases as the trade-in subsidy laps its worst comparisons, gross margin could stop falling rather than keep falling | Through-cycle ROIC (8.32%, 5-yr avg) still clears WACC (≈3.9–4.8%) by 350–440bp; disqualifier scan found zero triggers and zero near-misses [`business-model/09_moat.md`, `01_disqualifier-scan.md`] | Two consecutive quarters of stable-or-rising gross margin |
| Beat setup / margin inflection (earnings) | Management's own claim that ex-North-America Q1 2026 operating profit grew >10% — if true, the group-level miss is a dated regional shock, not broad deterioration | Cash conversion has never broken down (CFO/EBITDA never below 93.9% in 5 years); non-GAAP adjustments run conservative [`earnings/06_earnings-quality.md`] | A segment P&L reconciling the >10% claim at the H1 print |
| De-rating reversion (valuation) | Own-history mean (7.38x) and quality-adjusted peer multiple (7.35x) converge independently — a genuine anchor, not a single method's artefact | `02_multiples-own-history.md`, `03_relative-valuation-peers.md` | A clean beat-and-raise quarter breaking the consensus-cutting cycle |
| Deleveraging / capital return (balance-sheet-survival) | Net cash on every basis funds counter-cyclical action (continued dividends, buybacks, opportunistic M&A) if the cycle worsens further — a strategic asset, not lazy capital | `balance-sheet-survival/99` §7, CLAUDE.md §24 Filter 3 | Buyback pace accelerating past its current 24.8% completion |
| Capital-return step-up (catalyst) | The CNY 6,000mn buyback is proven-dated and self-limiting (unused shares cancelled after 3 years) — a real signal if pace accelerates | Key Developments log, 2026-03-26 authorization | Faster tranche completion ahead of the 2027-03-26 deadline |

If forced to argue the opposite of the Watchlist verdict: the single most credible bull case is that the North America weakness genuinely was a one-off weather/tariff shock (not yet disproven, only unverified) and that China's "high base" comparison, once lapped after H1 2026, stops being a headwind — in which case the peer-relative discount (already only +1.5% residual once quality-adjusted) closes further as the multiple re-rates toward the 7.38x own-history mean. The single piece of evidence that would most move the engine toward this view is a segment-level P&L in the H1 2026 filing that actually reconciles the ">10% ex-North-America" claim with real numbers, rather than leaving it as an unverified assertion.

## 10. What Would Kill the Thesis?

### Thesis Kill Criteria

| Kill Criteria | What It Would Mean | How To Monitor | Module Source |
|---|---|---|---|
| A third consecutive earnings miss (H1 2026, 2026-08-27/28) | Confirms the deceleration is structural, not a one-off; the bear-cyclical case (CNY 16.79) becomes the more likely near-term path | Compare reported H1 revenue/EPS to next-Q consensus (CNY 75,076mn / CNY 0.58) | earnings |
| Gross margin falls below 26.3% at the H1 print | The cost-reduction program (explicitly labelled "not guaranteed to repeat") is failing to offset commodity inflation | H1 2026 segment/consolidated margin bridge | earnings |
| The North America ">10% ex-NA operating profit growth" claim is never reconciled to a segment P&L, or is reconciled and found overstated | The one thing propping up the "one-off shock" bull case disappears | H1 2026 filing segment disclosure | management-governance / earnings |
| Related-party borrowing from Haier Group Finance Co. climbs further past 37.7% of its RMB10,000mn cap, or cash-parked-with-affiliate % rises above 57% | The deepest governance risk in this dossier is worsening, not stabilizing | FY2026 annual report, ~March 2027 | management-governance |
| A GE Appliances goodwill impairment (25.3% of parent-company equity, 76% concentrated in this one 2016 deal) | Confirms the North America/tariff pressure is structural, not transient — the exact segment the goodwill sits behind | Annual impairment testing disclosure | business-model |
| Incremental ROIC stays negative for a second straight year (FY2026) | Confirms FY2025's −8.3% reading was not a one-off — capital is now being invested below its cost, not above it | FY2026 annual report | management-governance |

## 11. Positioning and Trade Construction

- **Recommendation:** Wait — do not open a position before the 2026-08-27/28 H1 2026 print. If a position is initiated after a clean beat, size it as a starter position only, not a full position, given the forensic-mosaic ceiling and the thin margin of safety.
- **Entry style (if initiated post-print):** Scale in only after the print confirms gross margin ≥26.3% and the segment P&L reconciles the North America claim — do not enter on the headline beat/miss alone.
- **Add levels:** Only on confirmed, print-by-print stabilization of gross margin over two consecutive quarters (H1 2026 and Q3 2026) — a single quarter is not enough evidence given the trajectory's own volatility.
- **Stop-loss logic:** A move toward the bear-cyclical level (CNY 16.79, −22.8%) should trigger a full re-underwrite, not an automatic stop. **The stop may not protect us on an earnings gap** — the H1 2026 print is a discrete, binary-risk event two weeks away, and Haier's FQ4 2025 print already showed a −43.9% single-quarter EPS surprise magnitude; a gap through any mechanical stop is a real risk into this date.
- **What not to do:** Do not treat the fortress balance sheet as a reason to hold through deteriorating earnings — net cash protects solvency, not the equity multiple.
- **Hedge:** Given the thesis's own correlated-tail structure (commodity costs + China demand + moat trajectory are one variable, not four), a direct short against a stronger-margin China appliance peer (see §12) is a more precise hedge than an index short.
- **Options vs. stock:** No IBKR options/positioning data exists in this pool — this question cannot be answered from available data.

## 12. 2nd Best Bet

**Midea Group (SZSE:000333)** — named repeatedly across the business-model, valuation, and management-governance modules as Haier's closest, stronger-margin domestic peer (LTM EBIT margin 9.8% vs. Haier's 6.9%; gross margin ties Haier's 26.3%; the SOTP module used Midea's own 12.71x multiple for Haier's Laundry segment). Midea shares the same underlying macro exposure (China trade-in subsidy fade, raw-material costs, the same consumer/property cycle) but has shown structurally less margin erosion, making it a less risky expression of the same "China appliance sector at an inflection" thesis. **This is a known peer name referenced only via this pool's Capital IQ competitor/comp data — no primary Midea filing, consensus, or governance data was reviewed in this run, so this is Level 2–3 evidence at best (a named comp, not a full underwrite) and would require its own dedicated run before sizing any position.**

- Why it is #2: same thesis vector (China appliance demand/commodity cost cycle), materially less margin erosion in the data already reviewed here.
- How it diversifies: if the China appliance sector overall stabilizes, Midea's stronger margin base should capture more of the upside per unit of macro-cycle improvement than Haier's thinner margin cushion.
- Why it may be safer: it is not carrying Haier's specific related-party financing dependency or the accounting-integrity mosaic flagged in this dossier.
- Catalyst that would make it better: the same H1 2026 China-demand data point that determines Haier's near-term trajectory also applies to Midea — a comparative read of both companies' H1 prints would be the natural next step.

## 13. Thesis → Antithesis Iteration

### Thesis 1
Haier is a global-scale, net-cash appliance maker trading close to fair value with real incentive alignment and no disqualifying red flags — a reasonable, lower-risk way to own China consumer-durables exposure.

### Antithesis 1
"Close to fair value" is doing a lot of work: an 8.1% margin of safety is thin, not a bargain, and it is calculated against a base case that assumes the current deceleration does not continue — an assumption the most recent quarter (Q1 2026, −6.9% revenue) already argues against.

### Revised Thesis 2
The balance sheet genuinely limits catastrophic downside (a full 100% EBITDA wipeout does not exhaust liquidity), but balance-sheet safety and equity-value safety are different things — the equity is exposed to a re-rating if the moat erosion (already confirmed, not hypothesized: 460bp gross-margin decline over 5 years) continues rather than stabilizes, and the near-term catalyst (H1 2026 print) is set up to test exactly that, with its own setup already favoring a miss.

### Antithesis 2
Two consecutive misses have already happened and consensus has already been cut ~14% — is this not already priced in, making the risk/reward attractive precisely because expectations are now low?

### Final Thesis
Partially, not fully. The peer-relative method — this dossier's most trustworthy method — finds that once quality-adjusted, most (not all) of Haier's discount to peers is warranted by its weaker margins and confirmed-eroding moat, leaving only a modest ~1.5% residual gap. Combined with a forensic-mosaic caution (three sub-threshold accounting-integrity signals compounding across two modules) and a genuinely poor probability-weighted risk/reward (+3.0% expected return against 26.9% downside, ratio 0.11), the setup does not clear the bar for a position today. The correct posture is to watch the print, not to pre-position for it.

**Insight threshold reached: the remaining uncertainty is mostly data-dependent, not reasoning-dependent.**

## 14. Math Validation

Executed via Python (see the exact snippet and output below — no scratch/mental arithmetic used, per CLAUDE.md §10 and the Step 4 workflow rule):

```
Scenarios: bull 20% @ CNY31.78 (+46.11%), base 40% @ CNY23.67 (+8.83%),
           bear_cyclical 25% @ CNY16.79 (-22.80%), bear_structural 15% @ CNY15.90 (-26.90%)

Sum of probabilities:                  100%
Probability-weighted expected return:  +3.02%
Probability-weighted target price:     CNY 22.41
Expected return from weighted target:  (22.41 - 21.75) / 21.75 = +3.02%   [reconciles exactly with the above]
Risk/reward:  (22.41 - 21.75) / (21.75 - 15.90) = 0.66 / 5.85 = 0.11
Downside risk:  -min(scenario returns) = -(-26.90%) = 26.90%
Margin of safety (base case): (23.67 - 21.75) / 23.67 = 8.11%
```

These figures are copied verbatim into the §2 Headline Scorecard, §8 Scenario Model, and `decision_record.json` — no re-typed or independently-recalculated numbers appear anywhere else in this dossier.

**Sensitivity note:** the entire spread between the base case (+8.8%) and the two bear cases (−22.8% to −26.9%) is driven by a single underlying assumption — whether the confirmed moat-erosion trend (already firing: 460bp five-year gross-margin decline, two consecutive ROIC declines) continues or stabilizes. This is the single fragile assumption behind this entire thesis, and it is exactly what the 2026-08-27/28 print begins to test.

---

# PART III — MODULE CHAPTERS

## Chapter A: Business Model

**Verdict: Average business — worth deeper work only if valuation is cheap.** No disqualifier triggered (0 of 8 tests, 0 of 5 near-misses). Business clarity 68/100; Business quality **42/100** (Weak, upper end); Moat **48/100** (Narrow moat, eroding — best single source is Brand); External dependency risk 52/100 (inverted, material — four simultaneously High-rated variables: commodity prices, the China trade-in subsidy cliff, US/EU tariffs, and the consumer/property cycle); Capital allocation & governance 66/100 (quick-read, superseded by the management-governance module's deeper 60/100); Data quality 82/100; Overall usefulness 58/100.

Strongest positive: five-year through-cycle ROIC (8.32%) clears an estimated cost of capital (≈3.9–4.8%) by 350–440bp. Strongest negative: gross margin fell 460bp over five years (30.9% → 26.3%), with the company's own MD&A attributing the FY2025 leg directly to Q4 copper/bulk-material price rises and intensifying domestic competition overwhelming its cost-reduction program. Most important segment: Household Food Storage & Cooking Solutions (41.7% of revenue, 43.4% of segment profit). None of the three business-model-owned §24 filters (crooks/integrity, serial acquirers, fast-changing industry) tripped. Full detail: `analyses/HAIER_2026-08-13/business-model/99_business-model-synthesis.md`.

## Chapter B: Earnings

**Verdict: Earnings decelerating.** Revenue growth cooled from +12.57% (FY2023) to +5.71% (FY2025) to −6.86% YoY (Q1 2026). Gross, EBITDA, and EBIT margins all fell together off a FY2024 peak. Earnings quality 66/100 (mostly clean but some working-capital/adjustment noise); Consensus setup 28/100 (higher = more beatable — the bar is genuinely hard, not easy, to clear); Earnings volatility 62/100 (inverted, higher = worse); Next-quarter setup: **favors a miss**. Red-flag severity: **Material concerns** (35 flags: 0 Critical / 12 High / 23 Medium / 3 Low / 3 Unclear).

Biggest driver: raw-material commodity cost inflation (84% of appliance-segment cost of sales), mechanically linked to the cost-reduction program that offsets it. Biggest risk: consensus has already been cut ~14% over six months yet the last two reported quarters both missed that already-lowered bar, with revision breadth still net negative (EPS 1 up / 11 down). RF-EQ-001 (rising accruals divergent from cash earnings) fired and is propagated as part of the cross-module forensic mosaic (see §9A/Decision Audit Trail). Full detail: `analyses/HAIER_2026-08-13/earnings/99_earnings-synthesis.md`.

## Chapter C: Balance-Sheet-Survival

**Verdict: Fortress balance sheet**, capped by disclosure gaps, not by the numbers. Net cash on every basis at every period FY2021 through Mar-2026 — net debt (strict) CNY (4,952.2)mn, gross debt/EBITDA 1.61x. 55.0% of gross debt sits in one within-12-month bucket, but FY2025 cash alone covers it 2.0x over. Liquidity runway ≈27.3 months (confidence capped at 60/100 — no committed/undrawn bank-facility figure exists anywhere in the pool). Covenant headroom **Not assessable** (no covenant/indenture disclosure anywhere in the pool). Stress test: liquidity is never exhausted through a full 100% EBITDA wipeout; only an indicative, unconfirmed covenant breaks, at a 54.1% EBITDA decline. Solvency strength 85/100; Downside resilience 90/100; Overall usefulness 72/100 (hard cap — no covenant disclosure). No `RF-OBS-001` contingent-liability spike tag emitted. Full detail: `analyses/HAIER_2026-08-13/balance-sheet-survival/99_balance-sheet-survival-synthesis.md`.

## Chapter D: Management-Governance

**Verdict: Standard / mixed.** Governance Score 63/100; Confidence-Adjusted Governance Score 50/100; **Governance Rating: Watchlist**. No hard disqualifier flagged. Management quality 64/100; Capital allocation 60/100 (supersedes business-model's 66/100 quick-read); Incentive alignment 78/100 ("strong" — pay is anchored entirely to ROE/profit-growth, zero size-based metrics, and the FY2025 hurdles were genuinely missed); Shareholder friendliness 61/100; Disclosure candor 56/100; Governance risk 40/100 (inverted, higher = worse); Overall usefulness 85/100.

6 red flags, reconciled to 0 Critical / 4 High / 2 Medium. Biggest signal: the deepening Haier Group Finance Co. relationship (57% of Group cash parked there; related-party borrowing up ~19x YoY to 37.7% of a RMB10,000mn cap). None of the three §24 filters this module owns (turnaround, serial acquirer, unaligned owner) tripped. RF-DISC-001 and RF-DISC-002 are propagated into the cross-module forensic mosaic (§9A/Decision Audit Trail). Full detail: `analyses/HAIER_2026-08-13/management-governance/99_management-governance-synthesis.md`.

## Chapter E: Valuation

**Verdict: Fairly valued.** Base fair value CNY 23.67/share (+8.8% vs. the CNY 21.75 price). Bull / bear-cyclical / bear-structural: CNY 31.78 / 16.79 / 15.90. Margin of safety +8.1%; downside to the headline structural bear −26.9%. Valuation attractiveness 45/100; Margin of safety 40/100; Valuation confidence 68/100; Downside risk 58/100 (inverted); Data quality 80/100; Overall usefulness 78/100. Dominant method: peer-relative valuation (68% weight) — the only method anchored in real, dated market prices, independently corroborated by the own-history multiple. No hard score caps triggered; no misaligned controlling owner found (RF-OWN-004 not fired) — this is earnings-trajectory value-trap risk, not ownership-driven. Full detail: `analyses/HAIER_2026-08-13/valuation/99_valuation-synthesis.md`.

## Chapter F: Catalyst

**Verdict: Dated, evidenced near-term catalysts.** Catalyst strength 58/100; Timing visibility 62/100 (proven near-term, vague long-run); Catalyst risk 65/100 (inverted, higher = worse); Overall usefulness 78/100. Nearest catalyst that can actually move the stock: H1 2026 interim results, 2026-08-27/28 — setup skews bearish (two consecutive misses against an already-cut consensus, net-negative revision breadth). The single most important catalyst — the margin-erosion trajectory — is not one date; it is tested print by print across H1 2026, Q3 2026 (inferred), and FY2026 annual (inferred) results. No §24-flagged catalyst on the calendar. Full detail: `analyses/HAIER_2026-08-13/catalyst/99_catalyst-synthesis.md`.

---

# PART IV — MODULE APPENDICES

## Appendix A: Business Model — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_data-triage.md` | data-triage | Sufficient — audited FY2025 annual reports (CAS + IFRS) and a Q1 2026 quarterly filing; no post-2019 transcript |
| `01_disqualifier-scan.md` | disqualifier-scan | No disqualifier triggered; 0 of 5 near-misses in band |
| `02_business-identity.md` | business-identity | Multi-brand, acquisition-built global appliance manufacturer; generic-operating-company sector overlay |
| `03_segment-map.md` | segment-map | Household Food Storage & Cooking Solutions dominant (41.7% revenue, 43.4% profit) |
| `04_unit-economics.md` | unit-economics | Value creation "Unclear" — no unit-volume or ASP data disclosed for any segment |
| `05_customer-geography.md` | customer-geography | Geography-concentrated (China 48.5% of revenue, discretionary/non-contracted), not customer-concentrated |
| `06_value-chain.md` | value-chain | "Mixed" economic control; raw materials 84.0% of appliance COGS with no pass-through mechanism |
| `07_business-quality.md` | business-quality | 42/100 (Weak, upper end) — gross margin down 460bp over five years |
| `08_competitive-map.md` | competitive-map | Gaining China share while trailing named peers on margin (EBIT 6.9% vs. Midea 9.8%, Gree 17.4%) |
| `09_moat.md` | moat | Narrow moat, eroding — ROIC clears WACC by 350–440bp but no single moat source clears "strong" |
| `10_external-dependency.md` | external-dependency | Risk score 52/100 — four simultaneously High-rated external variables |
| `11_capital-allocation-governance.md` | capital-allocation-governance | 66/100 quick-read (superseded by management-governance's 60/100 deeper dive) |
| `12_red-flags-sweep.md` | red-flags-sweep | Goodwill/intangibles 25.3% of parent equity, 76% concentrated in 2016 GE Appliances deal (severity 50/100) |

## Appendix B: Earnings — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_earnings-data-triage.md` | earnings-data-triage | Partial — full financials/consensus present; no post-2019 transcript |
| `01_historical-financials.md` | historical-financials | Revenue growth volatile; margins peaked FY2024, compressed FY2025 |
| `02_revenue-drivers.md` | revenue-drivers | China domestic demand is the single biggest revenue driver, and it is deteriorating |
| `03_margin-drivers.md` | margin-drivers | Raw materials (84% of appliance COGS) would drive a −178bps gross-margin hit alone |
| `04_guidance-consensus.md` | guidance-consensus | Bar is high — miss risk elevated; consensus cut ~14% but last two quarters still missed |
| `05_beat-miss-setup.md` | beat-miss-setup | Setup favors miss; the bull case rests on one unverified management claim |
| `06_earnings-quality.md` | earnings-quality | 66/100 — RF-EQ-001 (rising accruals) triggered; ~8% of revenue in factoring/supplier-finance |
| `07_earnings-sensitivity.md` | earnings-sensitivity | Volatility 62/100 — raw-material cost is the single highest-sensitivity variable |
| `08_earnings-red-flags.md` | earnings-red-flags | Material concerns — 35 flags (0 Critical / 12 High / 23 Medium / 3 Low / 3 Unclear) |

## Appendix C: Balance-Sheet-Survival — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_solvency-data-triage.md` | solvency-data-triage | Sufficient — no committed facility, no covenant package, no credit rating anywhere in the pool |
| `01_capital-structure-and-leverage.md` | capital-structure-and-leverage | Net cash every period FY2021–latest quarter; gross debt/EBITDA 1.61x |
| `02_maturity-wall-and-refinancing.md` | maturity-wall-and-refinancing | Self-funded — the next-24-month wall is covered 2.0x by cash alone |
| `03_liquidity-runway.md` | liquidity-runway | ≈27.3 months, net-of-FCF basis; confidence capped at 60/100 (no revolver disclosed) |
| `04_coverage-and-covenants.md` | coverage-and-covenants | EBITDA/interest 9.91x; real covenant headroom Not assessable |
| `05_off-balance-sheet-and-contingencies.md` | off-balance-sheet-and-contingencies | No RF-OBS-001 tag — largest off-BS item is routine trade finance |
| `06_downside-stress-test.md` | downside-stress-test | Survives −30% to −60% EBITDA declines with no liquidity gap at any level |

## Appendix D: Management-Governance — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_governance-data-triage.md` | governance-data-triage | Sufficient — no hard MODULE_RULES cap triggered |
| `01_management-and-track-record.md` | management-and-track-record | 64/100 — stable, internally promoted leadership, thin promise-vs-delivery sample |
| `02_capital-allocation-scorecard.md` | capital-allocation-scorecard | 60/100 — incremental ROIC turned negative in FY2025 (−8.3% YoY) |
| `03_incentives-and-compensation.md` | incentives-and-compensation | 78/100 — long-term pay anchored entirely to ROE/profit-growth; FY2025 hurdles genuinely missed |
| `04_ownership-and-insider-behavior.md` | ownership-and-insider-behavior | 69/100 — 34.49% controlling bloc; named directors/officers hold just 0.066% |
| `05_board-and-shareholder-rights.md` | board-and-shareholder-rights | 53/100 — related-party borrowing up ~19x YoY is the single most material leakage channel |
| `06_candor-and-disclosure-quality.md` | candor-and-disclosure-quality | 56/100 — a real selective-framing instance and a structural Q&A gap |

## Appendix E: Valuation — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_valuation-data-triage.md` | valuation-data-triage | Sufficient — no fully diluted share count/options schedule in the pool |
| `01_price-and-capital-structure.md` | price-and-capital-structure | Anchor: CNY 21.75 price (1 day old), EV CNY 175,100.7mn |
| `02_multiples-own-history.md` | multiples-own-history | Bottom 10–25th percentile of own 8-quarter multiple range |
| `03_relative-valuation-peers.md` | relative-valuation-peers | 25–38% discount to peers, largely warranted; quality-adjusted value CNY 22.08 |
| `04_intrinsic-dcf.md` | intrinsic-dcf | CNY 29.84/share (+37.2%), capped to Moderate confidence — WACC flagged as too low |
| `05_reverse-dcf.md` | reverse-dcf | Price implies −6.48%/yr FCF/EBITDA contraction OR a 4.40% terminal margin — both unprecedented |
| `06_sum-of-the-parts.md` | sum-of-the-parts | CNY 23.86/share (+9.7%), but comp-fragile (43% of spread rides on one segment's peer choice) |
| `07_scenario-and-fair-value.md` | scenario-and-fair-value | Base CNY 23.67; bull CNY 31.78; bear-cyclical CNY 16.79; bear-structural CNY 15.90 |

## Appendix F: Catalyst — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_catalyst-data-triage.md` | catalyst-data-triage | Sufficient — results date, dividend date, buyback window, bond maturities all present |
| `01_catalyst-calendar.md` | catalyst-calendar | 11 catalysts; 5 carry proven dates/windows, 6 are real but undated |

---

# PART V — EVIDENCE AND PROCESS

## 15. Evidence Used

| Evidence Source | What It Proves | Quality | Freshness | Problems |
|---|---|---|---|---|
| FY2025 Annual Report (SSE, CAS), audited | Financial statements, segment data, ownership, RPT disclosures, disqualifier tests | High | Filed 2026-03-26, ~4.5 months old | None — audited, unqualified opinion |
| FY2025 Annual Report (HKEX, IFRS), audited, translated | Cross-checked financials, connected-transactions disclosure (Rule 14A.56), compensation | High | Filed 2026-04-27 | None — translated per CLAUDE.md §27, not a data gap |
| 2026 First Quarter Report | Q1 2026 standalone results; unverified North America claim | High (for figures), Low (for the unreconciled claim) | Filed 2026-04-27 | The ex-North-America >10% claim is not reconciled to a segment P&L |
| Capital IQ Financials/Consensus/Estimates exports | Historical financials, consensus, revision history, peer comps | Medium-High | Pulled 2026-08-13 | One internal EBITDA inconsistency (Capital Structure Summary vs. Income Statement tabs), reconciled to the more transparent figure |
| Capital IQ current price (SHSE:600690) | Current price anchor | High | 2026-08-12, 1 trading day old | None — pool-verified, no staleness cap |
| Capital IQ Credit Health Panel | Relative peer solvency scoring | Low (opaque methodology) | 2026-08-12 | Ranks Haier bottom-quartile — conflicts with this dossier's own transparent leverage/liquidity math; not adopted per CLAUDE.md §4 |
| 2019 earnings-call transcripts (Q2/Q3) | Management tone/candor (historical only) | Low (stale) | ~7 years old | No post-2019 transcript exists anywhere in the pool — the single largest recurring data gap across modules |

## Claim Quality Ledger

| Key Claim | Claim Quality Level 0–5 | Evidence | Weakness / Caveat | Keep, Downgrade, or Remove |
|---|---:|---|---|---|
| Gross margin fell 460bp over five years (30.9% → 26.3%) | 5 | FY2021–FY2025 audited annual reports, CapIQ cross-check | None material | Keep |
| Net cash on every basis, FY2021–Mar 2026 | 5 | Audited balance sheets, CapIQ Capital Structure exports | None material | Keep |
| Base fair value CNY 23.67/share (+8.8%) | 4 | Weighted triangulation across peer/DCF/SOTP methods; cross-checked at CNY 23.56 | Method weights are analyst judgment, not a market fact | Keep |
| Ex-North-America Q1 2026 operating profit grew >10% | 1 | 2026 First Quarter Report, p.2 — a bare management assertion | Never reconciled to a segment P&L anywhere in the pool | Downgrade — treated as unverified throughout this dossier, not as evidence |
| Related-party borrowing up ~19x YoY to 37.7% of cap | 5 | FY2025 Annual Report (HKEX, IFRS), Note 13, pp.274–278 | Reconciled from "Critical" to "High" on a level-basis materiality test | Keep |
| Haier Group is not a structurally unaligned controlling owner (§24 Filter 6) | 4 | Corporate Structure Tree export, FY2025 Annual Report ownership disclosures | Tested explicitly by two independent specialists (04, 05) with concurring results | Keep |
| The reverse-DCF's "historically unprecedented contraction" reading | 2 | `05_reverse-dcf.md`, entangled with a flagged low-WACC artefact | The module itself labels this two-sided, not a clean conviction signal | Downgrade — not used as a standalone driver in this dossier |
| Cross-module forensic mosaic (3 tags, 2 modules) | 4 | `earnings/06`, `management-governance/06` — each tag individually Level 4–5 sourced | The compounding INFERENCE (that 3 sub-threshold signals together warrant a rating cap) is this synthesizer's own judgment, applying CLAUDE.md §13 mechanically, not a specialist finding | Keep — applied as a rating-ceiling input, not a standalone red flag |

## 16. Module Scorecard

| Module | Main Verdict | Module Synthesis Usefulness /100 | Sub-Agent Exception (if any) | Key Weakness | Override Needed? |
|---|---|---:|---|---|---|
| business-model | Average business, worth deeper work only if cheap | 58 | None | No unit-volume/ASP data anywhere in the pool | No |
| earnings | Earnings decelerating, setup favors miss | 78 (estimated — no single "Overall usefulness" figure stated, module content is dense and well-sourced) | None | No post-2019 transcript caps earnings clarity at 70 | No |
| balance-sheet-survival | Fortress balance sheet, disclosure-capped | 72 (module-stated) | None | No committed-facility/covenant/rating data anywhere in the pool | No |
| management-governance | Standard / mixed, Watchlist rating | 85 (module-stated) | None | No post-2019 Q&A record to test tone under pressure | No |
| valuation | Fairly valued | 78 (module-stated) | None | No fully-diluted share count/options schedule; DCF WACC flagged as too low by its own producer | No |
| catalyst | Dated, evidenced near-term catalysts, skews bearish | 78 (module-stated) | None | 6 of 11 catalysts are genuinely undated (labelled Vague, not dressed up) | No |

No module was overridden by this master synthesis — every module's verdict, scores, and red flags were absorbed as-is; the only synthesizer-level judgment applied on top is the cross-module forensic mosaic cap (§13) and the probability assignment in the Scenario Model (§8), both of which are the master synthesizer's own job per CLAUDE.md §22.

## 17. Consensus Expectations

- **Revenue:** FY2026E consensus CNY 309,111mn, implying only +2.24% growth — a sharp deceleration from FY2025's own +5.71%. Next-Q (H1 2026) consensus CNY 75,076mn.
- **EBITDA:** FY2026E consensus CNY 30,506mn (down from CNY 34,214mn six months ago, a −10.8% cut).
- **EPS:** FY2026E consensus CNY 2.13 (down ~14.1% from six months ago, ~13.4% from twelve months ago). Next-Q (H1 2026) consensus CNY 0.58.
- **Target price range:** Not disclosed in this pool as a standalone analyst target-price aggregate — the valuation module's own triangulated range (CNY 15.90–31.78) is used instead.
- **Number of analysts:** Not precisely disclosed — CapIQ revision counts (individual events, not unique analysts) are the only proxy available (11 down / 1 up on EPS in the trailing ~3 months).
- **Estimate revisions:** Net negative into the next print — Revenue next FY (−3 net breadth), EBITDA next FY (0 net breadth), EPS next FY (−10 net breadth, 1 up / 11 down).
- **Dispersion:** Not disclosed as a standalone high/low range in this pool.

**Is the market's bar low, fair, or high?** High, per the earnings module's own explicit read — consensus has already been cut sharply, but the last two reported quarters both missed that already-lowered bar, meaning the Street's cuts have consistently lagged the deterioration rather than overshooting it. Treat "the bar has already been lowered enough" as unproven going into the 2026-08-27/28 print.

## 18. Balance Sheet and Survival Test

*(Deferring in full to `balance-sheet-survival/99_balance-sheet-survival-synthesis.md` — see Chapter C above for the full account. Summarized here per the No-Bloat Rule.)*

Net debt is negative (net cash) on every basis since FY2021 — CNY (4,952.2)mn strict, CNY (16,975.1)mn broad. Cash: CNY 47,621.7mn on hand. Maturity wall: 55.0% of gross debt (CNY 23,452.2mn) sits in one within-12-month bucket, covered 2.0x by cash alone. Floating vs. fixed: 70% of FY2025 borrowings are floating-rate; a +200bp shock adds only CNY 509.4mn/yr pre-tax interest — immaterial given the net-cash position. Interest burden: EBITDA/interest coverage 9.91x. Liquidity risk: low in substance (27.3-month runway) but the confidence on that figure is capped at 60/100 because no committed/undrawn bank-facility figure exists anywhere in the pool. **If EBITDA fell 40–60%:** liquidity is never exhausted at any tested level, even a full 100% EBITDA wipeout for a year — only an indicative, unconfirmed leverage-covenant proxy (3.5x gross debt/EBITDA, not a real disclosed covenant) breaks, and only at a 54.1% EBITDA decline. This is fed directly into the Risk Register (§9) and Kill Criteria (§10) above as the balance-sheet break-point.

## Forecast Ledger

| Prediction | Probability | Time Window | Evidence Today | Confirmation Trigger | Falsification Trigger | Owner Module | Type | Confidence /100 |
|---|---:|---|---|---|---|---|---|---:|
| H1 2026 (2026-06-30 half-year) revenue and EPS beat the pre-print next-Q consensus (revenue CNY 75,076mn / EPS CNY 0.58 as of 2026-08-13 per Capital IQ) | 35% (Unlikely) | By 2026-08-28 | Two consecutive quarters (FQ4 2025, FQ1 2026) already missed an already-cut consensus; revision breadth net negative into this print | Reported H1 2026 revenue AND EPS both exceed the pre-print consensus figures above, per the H1 2026 results filing | Reported H1 2026 revenue OR EPS falls below the pre-print consensus figures above | earnings | earnings_eps | 70 |
| H1 2026 gross margin holds at or above FY2025's full-year 26.3% level | 35% (Unlikely) | By 2026-08-28 | Q4 2025 copper/bulk-material inflation already cut gross margin 1.1pp; no disclosed pass-through mechanism | Reported H1 2026 gross margin ≥26.3%, per the H1 2026 results filing income statement | Reported H1 2026 gross margin <26.3% | earnings | margin_or_cost | 65 |
| FY2026 EPS consensus (CNY 2.13 as of 2026-08-13) holds or is raised, not cut further, at the first post-H1-print Capital IQ refresh | 30% (Unlikely) | By ~2026-09-15 (post-print revision window) | Consensus has been cut in every measured window over the trailing 90 days and 6–12 months; revision breadth 1 up / 11 down | FY2026 EPS consensus at the first post-print CapIQ refresh is ≥CNY 2.13 | FY2026 EPS consensus at the first post-print CapIQ refresh is <CNY 2.13 | earnings | catalyst_or_estimate_revision | 65 |
| Haier Group Finance Co. related-party borrowing (RMB 3,767mn, 37.7% of a RMB10,000mn cap as of FY2025) stabilizes or declines in the FY2026 annual report | 50% (Toss-up) | By ~March 2027 (FY2026 annual report) | Borrowing rose ~19x YoY in FY2025 (RMB196mn → RMB3,767mn); no evidence yet of the trend reversing | FY2026 annual report shows related-party borrowing ≤RMB3,767mn AND/OR cash-parked-with-affiliate % ≤57% | FY2026 annual report shows both figures higher than their FY2025 levels | management-governance | governance_or_accounting | 55 |
| Incremental ROIC (computed FY2024→FY2025 basis) turns positive again for FY2026 | 45% (Toss-up) | By ~March 2027 (FY2026 annual report) | FY2025 incremental ROIC was −8.3% (the first negative reading after four straight positive years) | FY2026 annual report data, computed on the same methodology, shows incremental ROIC >0% | FY2026 annual report data shows incremental ROIC ≤0% for a second straight year | management-governance | governance_or_accounting | 55 |

Three of five forecasts (60%) resolve within ~90 days of this decision date, clearing the CLAUDE.md near-term-proof-point bar.
