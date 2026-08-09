# earnings Module Dossier — UBER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `earnings_memo.md`.

- Generated: 2026-08-09T00:49:19Z
- Module folder: `earnings`
- Contents: 1 module synthesis + 10 specialist outputs = 11 files

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
- [earnings / RESUMED_FROM.md](#earnings-resumed-from-md) — `RESUMED_FROM.md`


---

## earnings — module synthesis

_Source: `99_earnings-synthesis.md`_

# Earnings Module — UBER (Synthesis)

## Abstract

Uber's earnings setup is mixed: demand keeps speeding up, but the reported numbers and the beat streak's own metric both need discounting. Gross Bookings grew 24% year-on-year in Q2 FY26, the fourth straight quarter above 20%, while revenue growth cooled to 12.2% because a one-time UK rule change cut the quarter's revenue by $1.1 billion. Trip and booking volume is the clearest driver, funding the cost-of-revenue leverage behind most of the margin gain. The consensus bar sits within 0.4% of guidance on profit, a fair bar, though revenue estimates were cut 1.04% after the print. The biggest risk: the guided EBITDA metric's beat streak likely hides a recurring legal-reserve add-back worth up to 17.3% of adjusted EBITDA in one year.

## 1. Earnings Verdict

- **Verdict: Mixed earnings setup**
- Earnings quality /100: 71 *(from 06 — "mostly clean but some adjustment noise" band)*
- Consensus setup /100 *(higher = more beatable)*: 58 *(from 04 — a "fair" bar: consensus sits within 0.4% of guidance on EBITDA/EPS Normalized, with a modest beat tilt on those two metrics offset by a modest miss tilt on revenue and by unresolved quality caveats on the guided metric itself)*
- Earnings volatility /100 *(higher = worse)*: 60 *(from 07 — "Material sensitivity" band)*
- Next-quarter setup: Favors beat *(from 05)*, materially tempered by red-flag quality caveats on the guided metric — see Section 3
- Biggest earnings driver (one line): Trip / Gross Bookings volume growth — the base multiplier for Mobility and Delivery revenue and the source of the genuine ex-UK cost-of-revenue leverage that drove most of the quarter's margin gain [`02_revenue-drivers.md` §7; `03_margin-drivers.md` §7a]
- Biggest earnings risk (one line): The guided "EBITDA" metric's own four-quarter beat streak rests on an unconfirmed definition that likely still includes a recurring "one-off" legal/regulatory reserve add-back worth up to 17.3% of Adjusted EBITDA in FY2024 (6.5% in FY2025) [`06_earnings-quality.md` §4–5; `08_earnings-red-flags.md` §2.5, §2.7]
- Red-flag Severity Verdict (from `08_earnings-red-flags.md`, reported verbatim): **Material concerns**

## 1A. Module Disconfirmation

- **Strongest bear point:** The guided EBITDA-like metric Uber has "beaten" in 4 of 4 quarters has an unconfirmed exact definition in this data pool, likely still contains a recurring "one-off" legal/regulatory reserve add-back worth 17.3% of Adjusted EBITDA in FY2024 and 6.5% in FY2025, and the company stopped reconciling it to GAAP on a quarterly basis starting Q1 FY26 [`06_earnings-quality.md` §4; `08_earnings-red-flags.md` §2.5, §2.7]. Revenue consensus was cut 1.04% in the three trading days after the Q2 print, with net revision breadth of −11 at the FQ3 level [`04_guidance-consensus.md` §3, §5].
- **Strongest bull point (steelman):** Gross Bookings and trip volume have grown above 20% constant-currency for four straight quarters (Trips +18% YoY, MAPCs +16% YoY in Q2 FY26), and the ex-UK cost-of-revenue ratio improved a genuine 377 basis points in the same quarter — larger than the entire quarter's +180bps net EBITDA-margin gain. Cash conversion is unambiguously strong: CFO has exceeded unadjusted EBITDA in every profitable year (160–202% of EBITDA, FY2023–FY2025), with a clean accrual-quality checklist and no restatement or material weakness [`02_revenue-drivers.md` §4; `03_margin-drivers.md` §7a; `06_earnings-quality.md` §2, §6, §9].
- **Single killer risk:** The recurring "one-off" legal-reserve line reverses direction again — as the identical G&A line already did once, from +$549M favorable (FY2025) to −$138M unfavorable (Q2 FY26 alone) — breaking the EBITDA guidance-beat streak not because trip volume or Gross Bookings weakened, but because the accounting item quietly propping up the "beat the guided high end" pattern ran out [`03_margin-drivers.md` §7a; `08_earnings-red-flags.md` §7].
- **Disconfirming evidence already visible:** GAAP net income/EPS were inflated in two consecutive fiscal years by one-time, non-cash deferred-tax-asset valuation-allowance releases ($6.4B FY2024, $5.0B FY2025) — the GAAP EPS growth trend (4.56 → 4.73, +3.7%) is not a repeatable run rate [`06_earnings-quality.md` §5, §10]. Reported revenue growth has decelerated for two straight quarters (+14.5%, +12.2% YoY) against a ~20% prior run rate, and while most of that is a disclosed one-time UK item, this quarter's own revenue bridge could not cleanly separate volume's dollar contribution from price/mix/M&A inside a 19.69pp residual [`01_historical-financials.md` §3, §6; `02_revenue-drivers.md` §6a].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| earnings-data-triage | Sufficient — no active partial-data caps | No standalone investor deck in the pool, but verbatim transcripts and filings fill the management-commentary role at a higher trust tier |
| historical-financials | Revenue growth stable high-teens for 3 years, then decelerated to +14.5%/+12.2% YoY in the last 2 quarters; margins expanding every year since FY2021 | Strict net debt rose $3.96B (+67%) in the year to Jun-30-2026, funded by a $3,997M Q2 FY26 debt raise substantially used for an accelerated buyback ($6,904M TTM repurchases) |
| revenue-drivers | Trip / Gross Bookings volume is the single biggest revenue driver, still expanding — 4 consecutive quarters of constant-currency Gross Bookings growth above 20% | The UK Mobility revenue-recognition change cut Q2 FY26 revenue by $1.1B alone, a one-time step-down that persists through Q4 FY26 comparisons, not a demand slowdown |
| margin-drivers | SG&A/R&D headcount and discretionary-investment growth outpacing revenue (−232bps in Q2 FY26) is the driver most likely to reverse the margin-expansion trend if it continues | The genuine, ex-UK cost-of-revenue improvement (+377bps) in Q2 FY26 was larger than the entire quarter's net EBITDA-margin gain (+180bps) |
| guidance-consensus | Bar is fair — EBITDA and EPS Normalized consensus sit within 0.4% of the guidance midpoint | Revenue consensus and profitability consensus are moving in opposite directions over the same window: revenue cut 1.04% in 3 trading days post-print while EBITDA/EPS estimates rose modestly |
| beat-miss-setup | Setup favors beat | EBITDA has beaten its own guidance in 4 of 4 quarters and cleared the guided high end in the last 2 by a near-identical ~2.5% each time — a real but short, 2-quarter sample |
| earnings-quality | Score 71/100 — "mostly clean but some adjustment noise" | GAAP net income/EPS were inflated in 2 consecutive fiscal years by one-time non-cash deferred-tax-asset valuation-allowance releases ($6.4B FY2024, $5.0B FY2025) |
| earnings-sensitivity | Volatility score 60/100 (inverted) — "Material sensitivity" band | Driver/Courier/Carrier variable payments (cost of revenue) is the single highest quantifiable sensitivity (±$1,105M EBIT), but the unquantifiable driver-classification/labor-regulation tail risk could plausibly dwarf it if triggered |
| earnings-red-flags | Material concerns — 0 Critical, 7 High, 17 Medium, 4 Low, 7 Unclear flags | The 4-quarter EBITDA guidance-beat streak underlying the "favors beat" verdict rests on a guided metric whose exact composition is unconfirmed and likely still includes a recurring "one-off" legal-reserve add-back |

## 3. Reconciliation

**Disagreement 1 — beat-streak optimism vs. accounting-quality caveats on the same metric.** `05_beat-miss-setup` calls the setup "favors beat," anchored on Uber beating its own guided EBITDA-like metric in 4 of 4 quarters. `06_earnings-quality` and `08_earnings-red-flags` show that same guided metric's exact definition is unconfirmed in this pool and likely still contains a recurring "one-off" legal/regulatory reserve charge worth double-digit percentages of Adjusted EBITDA in both disclosed years. This is not a factual conflict — 05's beat-streak claim is accurate on its own terms — but a quality-adjusted reading materially tempers how much confidence that streak should carry forward. Per source hierarchy, the filing-level accounting-quality read (06) is the more conservative and credible input here; this synthesis presents the beat streak alongside the quality caveat rather than as a standalone bull signal.

**Disagreement 2 — basis mismatch between GAAP-EBIT sensitivity and guided-EBITDA-like beat magnitude.** `07_earnings-sensitivity` bases its entire analysis on GAAP EBIT (TTM $6,700M) because Uber no longer discloses quarterly Adjusted EBITDA; `04_guidance-consensus` and `05_beat-miss-setup` base their bar and beat analysis on the guided "EBITDA" line (understood to be Adjusted-EBITDA-like). Both agents flagged their own basis transparently. This synthesis does not blend a GAAP-EBIT-based sensitivity percentage with a guided-EBITDA-based beat magnitude — the two figures in Sections 5 and 6 below are kept on their own stated basis.

**Disagreement 3 (raised, not resolved, by this synthesis) — the earnings-trajectory verdict vs. `08`'s own framing recommendation.** `08_earnings-red-flags` explicitly states its "Material concerns" finding should "cap, not flip" the earnings verdict, and recommends against reclassifying to "Mixed," instead suggesting a hybrid framing ("stable-to-accelerating on volume, but the margin-beat streak rests on a metric whose comparability has degraded"). That framing does not map cleanly onto any single category in this module's fixed taxonomy (Section 1). This synthesis selects "Mixed earnings setup" instead, because three separate axes genuinely conflict rather than one axis simply being capped: (a) revenue — reported growth is decelerating while underlying Gross Bookings/volume growth is accelerating; (b) margins — expansion is real but roughly a quarter to a third accounting-driven (UK optics, a reversing legal-accrual swing) and the largest opex buckets are deliberately growing faster than revenue; (c) quality/consensus — cash quality is strong but GAAP headline numbers and the guided EBITDA-like metric both carry material caveats, and consensus itself is splitting (revenue cut, profitability raised) over the identical window. The reader should treat both framings as available: 08's hybrid narrative and this synthesis's "Mixed" categorical call describe the same underlying evidence from different angles, and neither should be read as contradicting the underlying facts in Sections 2 and 5.

No other material factual disagreements between specialists were found.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No consensus / estimate data | N — consensus present and fresh, as of Aug-05-2026 | Consensus setup | Not capped |
| No cash flow statement | N — cash flow statement present in filings and CIQ export back to Q1 2018 | Earnings quality | Not capped |
| No revision history | N — Recent Changes / Revisions / Trends tabs present | Consensus setup | Not capped |
| No verbatim transcript AND no sell-side proxy | N — verbatim CIQ call transcripts present for both Q1 FY26 and Q2 FY26 | Earnings clarity | Not capped |
| Transcript role filled ONLY by a sell-side proxy (no verbatim) | N — verbatim transcripts used, not a proxy | Earnings clarity | Not capped |
| Only inferred sensitivities | N — `07_earnings-sensitivity`'s variables are anchored to company-disclosed dollar swings (UK impact, G&A/legal swings, insurance cost); only the incremental-margin coefficients used to size bull/bear moves are inferred, not the underlying sensitivities themselves. `07` self-rates confidence "Medium" on most rows, "Low" only on the FX-to-EBIT dollarization row | Earnings volatility confidence | Confidence stated as Medium overall (Low specifically on the FX-to-EBIT dollarization sub-figure), not capped to Low across the board |

No score cap from `MODULE_RULES.md` was triggered by missing or weak data — the underlying earnings-module scores (71 quality, 58 consensus setup, 60 volatility) reflect the specialists' own evidence-based judgment, not a data-sufficiency cap.

## 5. Earnings Setup Summary

### Revenue Setup

The current revenue trajectory is not what it looks like on the surface. Reported growth cooling from an ~18% run rate to 12.2% YoY in the latest quarter is sustainable in the sense that most of the drop is a one-time accounting reclassification (the UK Mobility change), not weaker demand — Gross Bookings kept accelerating to 24% reported / 22% constant-currency growth in the same quarter. The single factor that would have to change for revenue direction to genuinely flip negative is a real deceleration in trip volume and MAPC growth, which this pool shows no evidence of yet (four straight quarters above 20% constant-currency growth). The gap between reported and underlying revenue is explicit and material: the UK item alone subtracted 8.69 percentage points from Q2 FY26's 12.17pp headline growth, meaning organic ex-UK, ex-FX growth ran closer to 19.9pp — but that residual (19.69pp of the 12.17pp bridge) bundles volume, price/mix, and unquantified M&A together, so the exact organic-volume figure cannot be isolated from this quarter's own arithmetic. Segment mix is a slower-moving, second-order drag: Delivery and Freight both carry lower take rates than Mobility, so continued mix shift toward them mechanically compresses the blended take rate even as total Gross Bookings keep growing.

### Margin Setup

Current margins sit at a multi-year high, and the evidence does not support treating that level as either a proven steady state or an obvious cyclical peak — the business-model module separately characterizes FY2025 margins as "a recent high-water mark, not a stabilized steady state." A large share of the reported margin improvement is durable and company-controlled — the ex-UK cost-of-revenue ratio genuinely improved 377bps in Q2 FY26, the single largest lever in the bridge — but the segment or driver most exposed to an adverse 10–20% move is SG&A/R&D headcount and discretionary investment, which already cost 232bps of margin in Q2 FY26 and is described by management as a deliberate reinvestment choice, not a one-off. Management does hold one real structural margin-protection lever — insurance-cost reinvestment into fares is entirely at its own discretion — but that lever is asymmetric: cost increases pass through to the P&L close to 1:1, while cost decreases are mostly spent on fares rather than banked as margin, so the company is closer to a price-taker on the downside than a price-taker on the upside.

### Quality Check

The single largest gap between reported and economic earnings sits in the two GAAP headline numbers most investors default to, and it is not narrowing — GAAP net income and diluted EPS were inflated by one-time, non-cash deferred-tax-asset valuation-allowance releases in both of the last two fiscal years ($6.4B FY2024, $5.0B FY2025), a pattern with no third-year precedent yet disclosed. The adjustments management uses to bridge GAAP to Adjusted EBITDA are not genuinely one-time in aggregate: stock-based compensation recurs by design, and the "legal, non-income tax, and regulatory reserve" line — labeled non-recurring — has appeared at material size in every disclosed year (17.3% of Adjusted EBITDA in FY2024, 6.5% in FY2025). A model of normalized earnings for next year should start from GAAP operating income (EBIT) or cash flow from operations, not GAAP net income/EPS or the company's Adjusted EBITDA as published — GAAP net income carries the tax-benefit distortion, and Adjusted EBITDA carries the recurring legal-reserve add-back and can no longer even be checked quarterly, since the company stopped disclosing it after Q4 FY2025.

### Consensus Bar

For the two metrics Uber actually guides — EBITDA and EPS Normalized — a material beat requires a third straight quarter of the genuine (not UK-optics-driven) cost-of-revenue leverage seen in Q1 and Q2 FY26, without an offsetting reversal in the legal-accrual line. The bar is most likely mispriced on the revenue line specifically, not the profitability lines: revenue carries no formal management guidance, so consensus is a pure Street construct that has already missed narrowly twice and was cut 1.04% in the three trading days after the Q2 print — this looks more like a bar drifting lower in response to the known UK effect than a stretched one. A meaningful share of the current EBITDA/EPS consensus confidence is anchored to a two-quarter streak of clearing the guided high end by an almost identical ~2.5% each time — a short base rate that could reverse the moment the legal-accrual line, which has already swung in both directions within the last two comparable periods, turns unfavorable again.

## 5b. Leverage & Capital Structure

Leverage is within normal range and did not change materially during the period — no dedicated treatment required.

*(Checked against both triggers using the strict net-debt basis from `01_historical-financials.md` §1–2: at the most recent period-end (Jun-30-2026), strict net debt / TTM unadjusted EBITDA is 1.32x [$9,861M / $7,474M] and net debt / last-disclosed Adjusted EBITDA is 1.13x [$9,861M / $8,730M, FY2025 figure] — both well under the 3.0x Trigger A threshold. Strict net debt did rise 67.0% YoY ($5,904M → $9,861M, driven by a $3,997M Q2 FY26 debt raise substantially funding an accelerated buyback), but this falls short of Trigger B's specific thresholds as literally defined: the net-debt/EBITDA ratio moved only about +0.19x YoY on a TTM-to-TTM basis [prior TTM 1.13x → latest TTM 1.32x], not the required >1.0x; net debt in absolute terms rose 1.67x, not the required "more than 2x" (i.e., more than doubling); and total debt could not be precisely tested YoY from the disclosure in this pool [only one full total-debt figure, $12,302M at FY2025 year-end, is available; Jun-30-2025 and Jun-30-2026 total-debt figures are not separately disclosed in the sources this module read]. This is flagged here as a material, well-documented capital-structure event worth the master synthesizer's attention even though it falls just short of the literal Section-5b trigger — see Section 6 and Section 8.)*

## 6. Key Numbers

- Revenue growth rate: FY2025 +18.3% YoY; latest quarter (Q2 FY26) +12.2% YoY reported, ~19.9pp implied ex-UK/ex-FX organic [`01_historical-financials.md` §1, §3; `02_revenue-drivers.md` §6a]
- EBITDA margin: 12.1% FY2025 (unadjusted), 14.7% Q2 FY26 (unadjusted, +180bps YoY); company Adjusted EBITDA margin 16.8% FY2025 (last disclosed; quarterly disclosure discontinued after Q4 FY2025) [`01_historical-financials.md` §1, §3; `03_margin-drivers.md` §3]
- EPS: GAAP diluted $4.73 FY2025 (inflated by a $5.0B one-time non-cash tax benefit); EPS Normalized $0.81 actual Q2 FY26 vs. $0.8046 consensus (+1.25% beat) [`01_historical-financials.md` §1; `04_guidance-consensus.md` §6; `06_earnings-quality.md` §5]
- CFO / EBITDA: 160.0% FY2025 (unadjusted-EBITDA basis); 115.7% FY2025 on a like-for-like company Adjusted-EBITDA basis — both well above the 70% "healthy" threshold [`06_earnings-quality.md` §2]
- Biggest driver current level: Gross Bookings $58.0B in Q2 FY26, +24% reported / +22% constant-currency YoY, the fourth consecutive quarter above 20% [`02_revenue-drivers.md` §4]
- Consensus gap: EBITDA consensus $2,918.95mm vs. guided midpoint $2,910mm (+0.31%, in-line); revenue consensus $14,694.75mm, cut 1.04% in 3 trading days post-print [`04_guidance-consensus.md` §3]
- Estimate revision direction: Revenue falling (net breadth −11 at FQ3 level, last month); EBITDA rising (net breadth +6 to +14 over the same window) — a genuine divergence, not noise [`04_guidance-consensus.md` §4–5]
- Earnings volatility score: 60/100 (inverted, higher = worse) — "Material sensitivity" band; largest quantifiable single-variable swing is ±$1,105M EBIT (driver/courier/carrier payments, cost-of-revenue ratio) [`07_earnings-sensitivity.md` §7, §4]

## 7. What Would Change The Earnings Verdict?

| Current Verdict | What Would Upgrade It | What Would Downgrade It | Data Needed |
|---|---|---|---|
| Mixed earnings setup | (1) A third straight quarter of clean, ex-UK cost-of-revenue leverage without an offsetting legal-accrual reversal; (2) revenue consensus stabilizing or turning positive once the UK item laps in Q1 FY27; (3) resumption of quarterly Adjusted EBITDA disclosure with the legal-reserve line broken out, confirming the guided metric's quality | (1) A third straight revenue miss beyond the ±0.6% range of the last two quarters; (2) EBITDA/EPS falling below the guided low end, breaking the 4-quarter beat streak; (3) the legal-accrual line swinging unfavorably again, as it already has once (FY2025 +$549M favorable → Q2 FY26 −$138M unfavorable); (4) the first quantified AV-investment P&L cost figure, which the CFO has explicitly deferred sizing; (5) any adverse driver-classification/labor-reclassification ruling in a large market | The Q4 FY26 guide (next print, expected early November 2026) — specifically whether it shows the normal seasonal step-up, whether it restates the guided EBITDA-like metric's composition, and whether it introduces a first AV-cost figure |

## 8. Note To The Final Synthesizer

- Dominant earnings trend: underlying demand (Gross Bookings/trip volume) is genuinely accelerating even as reported revenue growth is optically decelerating — the two readings point opposite directions and both are correct on their own terms.
- Earnings are backed by cash but not backed by clean headline numbers: cash conversion is strong (CFO/EBITDA 160–202% in FY2023–2025), but GAAP net income/EPS and the company's own Adjusted EBITDA both carry material, cited quality issues (one-time tax benefits two years running; a recurring "one-off" legal reserve).
- Consensus bar is fair for the metrics Uber guides (EBITDA, EPS Normalized), with a short (2-quarter) beat-tilt track record; the revenue bar has no formal guidance behind it and is actively being cut.
- Next-quarter setup favors a beat on the guided metrics per `05`, but that streak's own quality is questioned by `06`/`08` — present the two together, not the beat streak alone.
- Top sensitivity variable: driver/courier/carrier variable payments (cost of revenue), currently moving favorably (+377bps ex-UK, Q2 FY26); the single largest unpriced risk is the unquantifiable driver-classification/labor-regulation tail risk, which is excluded from the numeric sensitivity ranking only because no dollar figure can be sourced, not because it is small.
- No partial-data cap applied in this module (Section 4) — the data pool is complete; the "Mixed" verdict and the 71/58/60 scores reflect specialist judgment on fully available evidence, not a sufficiency discount.
- Biggest missing data point: the exact definition/composition of the guided "EBITDA" metric Uber has been beating — CIQ labels it simply "EBITDA," and its precise relationship to the company's historically disclosed Adjusted EBITDA (including whether it still nets the recurring legal-reserve add-back) is not independently confirmed anywhere in this pool.
- Red-flag Severity Verdict (from `08_earnings-red-flags.md`, reported verbatim, not softened): **Material concerns** — 0 Critical, 7 High, 17 Medium, 4 Low, 7 Unclear flags.
- **High-severity red flags propagated verbatim from `08` (all surfaced above or here; none silently dropped):** (1) reported revenue growth decelerating with a real optical component beyond the disclosed UK one-off; (2) company-level Adjusted EBITDA disclosure discontinued at the quarterly level starting Q1 FY26; (3) the recurring "legal, non-income tax, and regulatory reserve" charge excluded from Adjusted EBITDA at double-digit-percent size two years running; (4) SG&A/R&D growth outpacing revenue (−232bps Q2 FY26), deliberate and could reverse the margin trend; (5) the guided "EBITDA" metric's exact definition is not independently confirmed in this pool; (6) revenue and profitability consensus diverging in opposite directions over the same window; (7) GAAP net income/EPS inflated in 2 consecutive fiscal years by one-time non-cash deferred-tax-asset valuation-allowance releases; (8) driver-classification/labor-regulation risk is unquantifiable and could dwarf every quantified sensitivity variable if triggered; (9, Unclear-status but High severity) the "favors beat" verdict in `05` does not itself carry `06`'s quality caveats forward — addressed directly in Section 3, Disagreement 1.
- Forensic tag check: `06_earnings-quality.md` explicitly states `RF-EQ-001` (rising accruals divergent from cash earnings) was tested and **NOT triggered** (only 1 of 6 standard accrual-quality rows fired, below the 2-row threshold). No `RF-EQ-002` (cash-conversion breakdown) tag was raised anywhere in `06` — cash conversion was found strong (CFO/EBITDA well above 100%), not breaking down. Neither forensic tag fired, so neither is propagated as a standalone line per the tag-propagation rule (propagation applies only to tags that actually fired).
- What would change the verdict: see Section 7 — a clean third-quarter beat without an offsetting legal-accrual reversal would justify moving toward "Earnings accelerating"; a third straight revenue miss beyond the recent range, or a guided-metric-defined loss of the beat streak, would justify moving toward "Earnings decelerating."

## 9. Simple Summary

- Revenue is growing more slowly on paper (12.2% last quarter) but the real driver — trips and bookings — is still speeding up (24% growth, fourth straight quarter above 20%); the gap is a one-time UK accounting change, not weaker demand.
- Margins are expanding, but a meaningful chunk of the improvement this quarter came from that same UK accounting change and from a legal-reserve line that already flipped from helping to hurting once — the part fully under management's control (people costs, marketing) is currently working against margin, not for it.
- Earnings are not entirely clean: cash generation is genuinely strong, but the two numbers most people look at first — GAAP net income/EPS and the company's own Adjusted EBITDA — are both flattered, one by a one-time tax windfall two years running, the other by a "one-off" cost that keeps showing up every year.
- The consensus bar for profit (EBITDA, EPS) is set fair, not soft — analysts have essentially copied management's own guidance. The revenue bar has no guidance behind it at all and is being cut.
- Next quarter setup leans toward a beat on the numbers Uber actually guides, but that beat streak is short (two quarters) and rests on a metric whose exact makeup this report could not fully verify.
- The single biggest swing factor is driver/courier/carrier payments (the company's largest cost line) — currently working in Uber's favor, but the single biggest unmeasured risk is a driver-employment-status ruling in a major market, which nobody has put a dollar figure on.
- Earnings volatility is real, not extreme — five separately measurable factors can each move profit by 8–17% in a normal-sized swing, plus one unmeasured but potentially much larger regulatory risk.
- This module is useful for the master synthesizer: it gives a genuine, evidence-based split verdict — accelerating on volume, questionable on the quality of the metric behind the beat streak — rather than a false single-direction call.



---

## earnings / 00_earnings-data-triage.md

_Source: `00_earnings-data-triage.md`_

# Earnings Data Triage — UBER

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | Delaware incorporation; principal office San Francisco, CA [FY25 10-K, cover page] |
| Exchange | New York Stock Exchange (NYSE: UBER) | [FY25 10-K, cover page; Q2 FY26 10-Q, cover page] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | 10-K / 10-Q filed under Section 13/15(d) of the Securities Exchange Act of 1934, Commission File No. 001-38902 [FY25 10-K, cover page] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | "in conformity with accounting principles generally accepted in the United States of America" [FY25 10-K, auditor's report]; CIQ Consensus tab header confirms "Acctg. Standard: US GAAP" [UberTechnologies,IncNYSEUBEREstimatesReport.xls, Consensus tab] |
| Reporting currency | USD | Consolidated financial statements stated in USD [FY25 10-K; Q2 FY26 10-Q] |
| Fiscal-year end | December 31 | "For the fiscal year ended December 31, 2025" [FY25 10-K, cover page] |
| Document language(s) | English (all documents) | All filings, transcripts, and CIQ exports in the pool are in English — no non-English documents present |

No jurisdiction mismatch. Uber is a Delaware-incorporated, NYSE-listed US filer, so US SEC forms (10-K, 10-Q) are the correct primary source and are all present in the pool.

## 1. File Inventory

Multi-tab workbooks were pre-extracted via `extract_pool.py` (fresh, no rebuild needed — 51 tabs across 7 workbooks, 65 extracts). All 21 sources report `status: ok` in `_pool_extracts/manifest.json` — no extraction failures, fallback-text, or missing-dependency states. Every tab is listed below as its own row.

| Filename (parent) / Tab | Type | Period Covered | Last Modified (Drive sync date — not authoritative; see period column) | Earnings Relevance |
|---|---|---|---|---|
| Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | Annual filing (10-K) | FY ended Dec-31-2025 | Aug 8 21:42 (sync date) | High |
| Uber_Technologies_Inc_-_Form_10-Q(May-06-2026).doc | Quarterly filing (10-Q) | Quarter ended Mar-31-2026 (Q1 FY26) | Aug 8 21:42 (sync date) | High |
| Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Quarterly filing (10-Q) | Quarter ended Jun-30-2026 (Q2 FY26) | Aug 8 21:42 (sync date) | High |
| Uber Technologies, Inc., Q1 2026 Earnings Call, May 06, 2026.rtf | Verbatim transcript | FQ1 2026 (call date May-06-2026) | Aug 7 00:23 (sync date) | High |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | Verbatim transcript | FQ2 2026 (call date Aug-05-2026) | Aug 7 00:23 (sync date) | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Income Statement | Data export (annual financials) | FY2018–FY2025 | Aug 7 00:24 (sync date) | High |
| …→ Balance Sheet | Data export | FY2018–FY2025 | " | High |
| …→ Cash Flow | Data export | FY2018–FY2025 | " | High |
| …→ Segments | Data export (segment P&L) | FY2018–FY2025 (Segment Adjusted EBITDA basis) | " | High |
| …→ Ratios | Data export | FY2018–FY2025 | " | Medium |
| …→ Key Stats | Data export | FY2018–FY2025 | " | Medium |
| …→ Multiples | Data export | FY2018–FY2025 | " | Low |
| …→ Capital Structure Summary | Data export | FY2018–FY2025 | " | Medium |
| …→ Capital Structure Details | Data export | FY2018–FY2025 | " | Low |
| …→ Historical Capitalization | Data export | FY2018–FY2025 | " | Low |
| …→ Supplemental | Data export | FY2018–FY2025 | " | Low |
| …→ Industry-Specific | Data export | FY2018–FY2025 | " | Low |
| …→ Pension-OPEB | Data export | FY2018–FY2025 | " | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Income Statement | Data export (quarterly financials) | Q1 2018–Q2 2026 (Jun-30-2026), incl. a "Press Release" flagged Q2 2026 column | Aug 7 00:26 (sync date) | High |
| …→ Balance Sheet | Data export | Q1 2018–Q2 2026 | " | High |
| …→ Cash Flow | Data export | Q1 2018–Q2 2026 | " | High |
| …→ Segments | Data export (segment P&L) | Q1 2018–Q2 2026 | " | High |
| …→ Ratios | Data export | Q1 2018–Q2 2026 | " | Medium |
| …→ Key Stats | Data export | Q1 2018–Q2 2026 | " | Medium |
| …→ Multiples | Data export | Q1 2018–Q2 2026 | " | Low |
| …→ Capital Structure Summary | Data export | Q1 2018–Q2 2026 | " | Medium |
| …→ Capital Structure Details | Data export | Q1 2018–Q2 2026 | " | Low |
| …→ Historical Capitalization | Data export | Q1 2018–Q2 2026 | " | Low |
| …→ Supplemental | Data export | Q1 2018–Q2 2026 | " | Low |
| …→ Industry-Specific | Data export | Q1 2018–Q2 2026 | " | Low |
| …→ Pension-OPEB | Data export | Q1 2018–Q2 2026 | " | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls → Consensus | Consensus/estimate export | Consensus as of Aug-05-2026 10:04 AM GMT | Aug 6 20:23 (sync date) | High |
| …→ Guidance | Guidance data | Guidance dates through FQ3 2026 (Aug-05-2026 guidance date) | " | High |
| …→ Recent Changes | Estimate revision data | Through Aug-2026 | " | High |
| …→ Revisions | Estimate revision data | Through Aug-2026 | " | High |
| …→ Surprise | Earnings surprise history | Through FQ2 2026 actual (reported Aug-05-2026) | " | High |
| …→ Trends | Estimate trend data | Through Aug-2026 | " | Medium |
| …→ Multiples | Consensus multiples | As of Aug-05-2026 | " | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls → [same 7 tabs] | Consensus/estimate export (duplicate) | Same content as above — byte-identical extract text (only the internal "SOURCE:" filename tag differs); confirmed via diff of extracted tabs | Aug 8 21:40 (sync date) | Duplicate of above — treated as one source, not double-counted |
| Company Comparable Analysis Uber Technologies Inc.xls → Financial Data | Data export (comps) | LTM as of Jun-30-2026 | Aug 6 20:24 (sync date) | Medium |
| …→ Trading Multiples | Data export (comps) | As of pricing date | " | Low |
| …→ Operating Statistics | Data export (comps) | LTM as of Jun-30-2026 | " | Low |
| …→ Business Description | Data export | Current | " | Low |
| …→ Implied Valuation | Data export (comps-implied valuation) | Current | " | Low |
| …→ Valuation Chart | Data export | Current | " | Low |
| …→ Credit Health Panel | Data export (credit metrics) | Current | " | Medium |
| …→ Disclaimer | Boilerplate | n/a | " | Low |
| Short Iinterest_12m_Uber.xls → Chart 1 with Data | Data export (short interest) | Trailing 12 months to Aug-2026 | Aug 8 22:00 (sync date) | Low |
| …→ Attributions | Boilerplate | n/a | " | Low |
| Uber Technologies Inc NYSE UBER Events Calendar.xls → Events Calendar | Data export (calendar) | 2026 (through Nov-03-2026 est. earnings date) | Aug 8 21:43 (sync date) | Medium |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | Data export (company profile) | Current, market cap/price as of Aug-05-2026 | Aug 6 20:28 (sync date) | Medium |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | Data export (company profile) | Current, TEV/market cap price as of Aug-05-2026 | Aug 8 22:00 (sync date) | Low |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | Data export (sell-side coverage list) | Current | Aug 6 20:27 (sync date) | Low |
| Uber Technologies Inc NYSE UBER Board Members.rtf | Data export (governance) | Current | Aug 6 20:32 (sync date) | Low (out of earnings scope) |
| Uber Technologies Inc NYSE UBER Customers.rtf | Data export | Current | Aug 7 00:25 (sync date) | Low |
| Uber Technologies Inc NYSE UBER Products.rtf | Data export | Current | Aug 6 20:27 (sync date) | Low |
| Uber Technologies Inc NYSE UBER Professionals.rtf | Data export (management roster) | Current | Aug 6 20:32 (sync date) | Low |
| Uber Technologies Inc NYSE UBER Suppliers.rtf | Data export | Current | Aug 7 00:25 (sync date) | Low |
| Uber Technologies Inc NYSE UBER Key Developments.rtf | User/vendor note (news log) | Rolling news log through Aug-2026 | Aug 7 00:25 (sync date) | Medium |

No external data (`data/UBER/external/`) is present in this pool — Section 1A is omitted.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, vs 2026-08-09) |
|---|---|---|---|
| Annual filing | Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | FY ended Dec-31-2025 | ~7.2 months since period end; filed Feb-13-2026 (~5.9 months ago) |
| Quarterly filing | Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Quarter ended Jun-30-2026 (Q2 FY26) | ~1.3 months since period end; filed Aug-05-2026 (4 days ago) |
| Earnings transcript | Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | FQ2 2026 call, Aug-05-2026 | 4 days |
| Investor deck | Not present in pool | — | — |
| Consensus / estimate export | UberTechnologies,IncNYSEUBEREstimatesReport.xls → Consensus | Consensus as of Aug-05-2026 10:04 AM GMT | 4 days |
| Cash flow data | Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Cash Flow | Through Q2 2026 (Jun-30-2026) | ~1.3 months |
| Guidance data | UberTechnologies,IncNYSEUBEREstimatesReport.xls → Guidance | FQ3 2026 guidance issued Aug-05-2026 (EPS Normalized 0.84–0.88) | 4 days |

No standalone investor deck is present in the data pool (confirmed also by business-model `00_data-triage.md` and `03_segment-map.md §3`). This is a gap for management-facing visual/strategic framing, but not a blocker: the verbatim transcripts and filings substitute for driver detail.

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | FY25 10-K; Q2 FY26 10-Q; CIQ Financials_Quarterly.xls → Income Statement (Q1 2018–Q2 2026) | Needed for revenue, margin, EPS |
| Balance sheet | Y | FY25 10-K; Q2 FY26 10-Q; CIQ Financials_Quarterly.xls → Balance Sheet | Needed for working capital and leverage |
| Cash flow statement | Y | FY25 10-K; Q2 FY26 10-Q; CIQ Financials_Quarterly.xls → Cash Flow (Q1 2018–Q2 2026) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Q2 FY26 10-Q (period ended Jun-30-2026, filed Aug-05-2026); Q2 FY26 earnings call same day | Needed for trend and setup |
| Last 8 quarters | Y | CIQ Financials_Quarterly.xls (Income Statement/Balance Sheet/Cash Flow/Segments back to Q1 2018 — far more than 8 quarters) | Needed for seasonality and inflection |
| Consensus estimates | Y | CIQ Estimates Report → Consensus tab, as of Aug-05-2026 (same day as latest 10-Q) | Needed for market bar |
| Estimate revisions | Y | CIQ Estimates Report → Recent Changes and Revisions tabs | Needed for revision momentum |
| Earnings transcript | Y | Q1 FY26 (May-06-2026) and Q2 FY26 (Aug-05-2026) verbatim CIQ call transcripts, both with Call Participants / Presentation / Q&A sections | Needed for management tone and driver detail |
| Segment P&L | Y | FY25 10-K Note 13; CIQ Financials_Quarterly.xls / Financials_Annual.xls → Segments tabs (Mobility / Delivery / Freight, both revenue and profit); note the profit metric changed from Segment Adjusted EBITDA to Segment Operating Income effective Q1 FY26 (Q2 FY26 10-Q, Note 10) — a measurement-basis break flagged for downstream agents | Needed for mix shift |
| Current price | Y | UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf and Public Company Profile.rtf — "TEV and Market Cap are calculated using a close price as of Aug-05-2026" | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — present at `analyses/UBER_2026-08-09/business-model/03_segment-map.md`; provides FY25 and H1 FY26 segment revenue/profit splits (Mobility/Delivery/Freight) with the Segment Adjusted EBITDA → Segment Operating Income basis-change flag already documented |
| 06_value-chain.md | Y — present at `analyses/UBER_2026-08-09/business-model/06_value-chain.md` |
| 10_external-dependency.md | Y — present at `analyses/UBER_2026-08-09/business-model/10_external-dependency.md` |

The full business-model module (00 through 99, including the synthesis and dossier) has already run and is available for the earnings module to read.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus is present and fresh (as of Aug-05-2026, same day as the latest 10-Q) | 04, 05, 99 | Not applied |
| No quarterly data | N — quarterly data runs Q1 2018 through Q2 2026 | 01, 02, 03, 06 | Not applied |
| No VERBATIM transcript, sell-side proxy present | N — Q1 FY26 and Q2 FY26 are both verbatim CIQ call transcripts (Call Participants / Presentation / Q&A), not sell-side proxies | 02, 03, 04 | Not applied |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | Not applied |
| No segment-level P&L | N — segment revenue and profit are disclosed (10-K Note 13; CIQ Segments tabs); note the FY25 Segment Adjusted EBITDA figures are NOT directly comparable to the FY26 Segment Operating Income figures without re-basing — flag for `02`/`03`, not a data-absence cap | 02, 03, 99 | Not applied (a methodology-break flag, not a missing-data cap) |
| No cash flow statement | N — cash flow statement present in filings and CIQ export back to Q1 2018 | 06, 99 | Not applied |
| No current price | N — close price as of Aug-05-2026 present in CIQ company-profile exports | 99 | Not applied |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has the latest annual filing (FY25 10-K, filed Feb-13-2026), the latest quarterly filing (Q2 FY26 10-Q, period ended Jun-30-2026, filed Aug-05-2026), a verbatim earnings-call transcript for the same quarter (Aug-05-2026), and complete income statement / balance sheet / cash flow / segment data back to 2018 — all extraction statuses are `ok` with none of the six partial-data flags triggered.
- **Active partial-data caps:** None.
- **Critical missing items:** None. Only a minor, non-blocking gap: no standalone investor deck is present in the pool (management commentary is instead sourced from the verbatim transcripts and filings, which fill that role at a higher trust tier per the module's source hierarchy). Downstream agents should also note the FY26 segment-profit-metric change (Segment Adjusted EBITDA → Segment Operating Income, effective Q1 FY26) when building any FY25-vs-FY26 segment margin bridge — it is a measurement-basis break, not a data gap, and re-basing is required before comparing across the two periods.



---

## earnings / 01_historical-financials.md

_Source: `01_historical-financials.md`_

# Historical Financials — UBER

Reporting standard: US GAAP. Reporting currency: USD, in millions unless noted. Fiscal year end: December 31 (calendar year) [FY25 10-K, cover page].

## 1. Annual Financial Table (5 years, FY2021–FY2025)

All figures in $ millions except per-share items. "EBITDA" below is the unadjusted measure (income from operations + total depreciation & amortization) — it is NOT Uber's company-defined "Adjusted EBITDA," which is shown separately in Section 4.

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 17,455 | 31,877 | 37,281 | 43,978 | 52,017 | Stable |
| Revenue YoY % | n/m | +82.6% | +17.0% | +18.0% | +18.3% | Stable |
| Gross Profit* | 6,227 | 9,805 | 13,835 | 16,495 | 20,025 | Stable |
| Gross Margin %* | 35.7% | 30.8% | 37.1% | 37.5% | 38.5% | Stable |
| EBITDA (unadjusted) | (2,932) | (885) | 1,933 | 3,536 | 6,312 | Inflecting |
| EBITDA Margin % | (16.8)% | (2.8)% | 5.2% | 8.0% | 12.1% | Inflecting |
| EBIT | (3,834) | (1,832) | 1,110 | 2,799 | 5,565 | Inflecting |
| EBIT Margin % | (22.0)% | (5.7)% | 3.0% | 6.4% | 10.7% | Inflecting |
| EPS (diluted, GAAP) | (0.28) | (4.65) | 0.87 | 4.56 | 4.73 | Volatile |
| CFO | (445) | 642 | 3,585 | 7,137 | 10,099 | Stable |
| Capex | (298) | (252) | (223) | (242) | (336) | Stable |
| FCF (CFO – Capex) | (743) | 390 | 3,362 | 6,895 | 9,763 | Stable |
| Working Capital (Total Current Assets − Total Current Liabilities) | (205) | 396 | 1,843 | 769 | 1,673 | Volatile |
| Net Debt (strict: total debt − cash & equivalents) | 7,309 | 7,509 | 7,022 | 5,543 | 5,197 | Stable |
| Net Debt / EBITDA (unadjusted) | NM (EBITDA<0) | NM (EBITDA<0) | 3.63x | 1.57x | 0.82x | Inflecting |

*Data quality note on Gross Profit / Gross Margin: Uber's GAAP income statement does not report a "gross profit" line — it discloses five cost/opex categories (cost of revenue excl. D&A; operations & support; sales & marketing; R&D; G&A) [FY25 10-K, Item 8, Consolidated Statements of Operations]. The Gross Profit/Margin rows above are Capital IQ's own construction (Revenue less CIQ's "Cost of Goods Sold" classification, which nets cost of revenue and operations & support) [CIQ Financials_Annual.xls → Income Statement]. See Section 3 for a flagged inconsistency in this classification across quarterly vs. annual-sourced columns.

**Growth math check (spot-check):** FY2025 Revenue YoY = (52,017 − 43,978) / 43,978 = 18.28% ≈ 18.3%. FY2025 EBITDA margin = 6,312 / 52,017 = 12.14% ≈ 12.1%. Both computed by an executed Python script (see method note in Section 7).

**Margin change (bps):** EBITDA margin FY2021→FY2022 +1,402bps; FY2022→FY2023 +796bps; FY2023→FY2024 +286bps; FY2024→FY2025 +409bps. Gross margin FY2024→FY2025 +99bps; FY2023→FY2024 +40bps [computed from CIQ Financials_Annual.xls → Income Statement].

**FCF definition:** FCF = CFO − |Capex| (capex is reported as a negative cash outflow in the source; absolute value used) [CIQ Financials_Annual.xls → Cash Flow].

**Net debt definition (strict basis, per CLAUDE.md §15):** Total debt (long-term debt + current portion of long-term debt + short-term borrowings, excluding operating lease liabilities) minus cash and cash equivalents only (short-term investments excluded). FY2025: Total debt $12,302M − Cash $7,105M = $5,197M [FY25 10-K, Consolidated Balance Sheets; CIQ Financials_Annual.xls → Balance Sheet]. Note: Capital IQ's own "Net Debt" export line reports different (lower) figures in most years (e.g., $76M for FY2025 vs. $5,197M strict here) — its exact netting basis could not be reproduced from the disclosed balance-sheet components in this pool and is not used in this report; it is flagged here rather than silently used or discarded.

## 2. TTM Snapshot

TTM = four quarters ended Jun-30-2026 (latest). Prior TTM = four quarters ended Jun-30-2025.

| Metric | Latest TTM (Jul-25–Jun-26) | Prior TTM (Jul-24–Jun-25) | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 55,227 | 47,331 | +16.7% | [CIQ Financials_Annual.xls → Income Statement, LTM Jun-30-2026 column; CIQ Financials_Quarterly.xls → Income Statement, Q3 FY24–Q2 FY26 sum] |
| EBITDA (unadjusted) | 7,474 | 5,230 | +42.9% | [same sources] |
| EBIT | 6,700 | 4,509 | +48.6% | [same sources] |
| EPS diluted (GAAP) | 4.58 (CIQ LTM calc); 4.55 (sum of 4 quarterly EPS) | 5.87 (sum of 4 quarterly EPS) | n/m — prior-TTM EPS was inflated by one-time items concentrated in Q3 FY24/Q4 FY24 (see Section 6) | [CIQ Financials_Annual.xls → Income Statement, LTM column; CIQ Financials_Quarterly.xls → Income Statement] |
| CFO | 10,424 | 8,789 | +18.6% | [CIQ Financials_Annual.xls → Cash Flow, LTM column; quarterly sum] |
| Capex | (308) | (249) | +23.7% | [same] |
| FCF | 10,116 | 8,540 | +18.5% | [computed: CFO − |Capex|] |
| Net debt at latest period-end (strict) | 9,861 (as of Jun-30-2026) | 5,904 (as of Jun-30-2025) | +$3,957M (+67.0%) | [Q2 FY26 10-Q, Condensed Consolidated Balance Sheets; CIQ Financials_Quarterly.xls → Balance Sheet] |

Note: Net debt is a point-in-time balance-sheet metric, not a TTM flow metric — the "Latest"/"Prior" columns above are balance-sheet dates (period-end), not summed flows.

**Biggest single number in this table:** strict net debt rose $3.96B (+67%) in one year, driven by a large H1 FY26 debt raise ($3,997M long-term debt issued in Q2 FY26 alone) funding an accelerated buyback program (LTM repurchases of common stock: $6,904M vs. FY2025 full-year $6,523M) [CIQ Financials_Quarterly.xls → Cash Flow; CIQ Financials_Annual.xls → Cash Flow].

## 3. Latest Quarterly Trend Table (8 quarters, Q3 FY2024–Q2 FY2026)

| Metric | Q3 FY24 | Q4 FY24 | Q1 FY25 | Q2 FY25 | Q3 FY25 | Q4 FY25 | Q1 FY26 | Q2 FY26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 11,188 | 11,959 | 11,533 | 12,651 | 13,467 | 14,366 | 13,203 | 14,191 | +7.5% QoQ (Q2 FY26) | +12.2% YoY (Q2 FY26) |
| Gross Margin %* | 33.4% | 49.7% | 34.1% | 34.3% | 34.3% | 49.6% | 39.2% | 39.3% | See data-quality note below | n/a |
| EBITDA (unadjusted) | 1,247 | 946 | 1,406 | 1,631 | 1,308 | 1,967 | 2,114 | 2,085 | −1.4% QoQ | +27.8% YoY |
| EBITDA Margin % | 11.1% | 7.9% | 12.2% | 12.9% | 9.7% | 13.7% | 16.0% | 14.7% | −130bps QoQ | +180bps YoY |
| EPS (diluted, GAAP) | 1.20 | 3.21 | 0.83 | 0.63 | 3.11 | 0.14 | 0.13 | 1.17 | See note below | −7bps n/m (one-time-item driven) |

*Data-quality flag (Gross Margin %): the Q4 FY24 and Q4 FY25 columns jump to ~49.6–49.7% while every Q1–Q3 column sits at 33–39%. This is a Capital IQ classification artifact, not a real quarterly margin inflection: Uber's actual filed FY2024 "Cost of revenue, exclusive of D&A" was $26,651M (60.6% of revenue) and FY2025 was $31,338M (60.3% of revenue) [FY25 10-K, Item 8], implying a revenue-less-cost-of-revenue-alone margin of ~39.4%/39.7% for the full year — much closer to the Q1–Q3 pattern than the Q4-only spike. The FY24 income-statement export is also flagged "Reclassified" for the Q4 FY24 column in the source data [CIQ Financials_Quarterly.xls → Income Statement, Restatement Type row]. Working hypothesis: CIQ's annual/10-K-sourced columns classify "Cost of Goods Sold" as cost-of-revenue only, while its 10-Q-sourced quarterly columns also fold in "Operations and support" expense — an inconsistent basis within the same export. **This is not proven from available data as to the exact vendor mechanism** and is flagged rather than silently used.

EPS volatility note: the Q4 FY24 EPS spike (3.21, +160% QoQ) and continued elevated FY24/FY25 GAAP EPS coincide with a large non-cash income-tax benefit — FY2024 income tax expense was a $5,758M benefit and FY2025 a $4,346M benefit, both consistent with release of a deferred-tax-asset valuation allowance (balance-sheet Deferred Tax Assets, LT: $170M FY2023 → $6,171M FY2024 → $10,951M FY2025) [FY25 10-K, Item 8, Income Statement and Balance Sheet; CIQ Financials_Annual.xls → Income Statement/Balance Sheet]. This is a hygiene flag for the earnings-quality agent (`06_earnings-quality`), not a full causal claim — the tax note itself is not in this pool.

QoQ / YoY revenue detail (all 8 quarters): Q3 FY24 +4.6% QoQ / +20.4% YoY; Q4 FY24 +6.9% / +20.4%; Q1 FY25 −3.6% / +13.8%; Q2 FY25 +9.7% / +18.2%; Q3 FY25 +6.5% / +20.4%; Q4 FY25 +6.7% / +20.1%; Q1 FY26 −8.1% / +14.5%; Q2 FY26 +7.5% / +12.2% [computed from CIQ Financials_Quarterly.xls → Income Statement].

**Most important recent-quarter finding:** Q2 FY26 revenue growth decelerated to +12.2% YoY (from a ~20% run rate in the four quarters before it) even as Gross Bookings grew +24% YoY in the same quarter. The gap is explained by a disclosed one-time item: "Mobility business model changes in the United Kingdom... negatively impacted revenue by $1.1 billion" [Q2 FY26 10-Q, MD&A, Revenue discussion]. Labelled as a one-time revenue-recognition change, not a demand slowdown — reported revenue growth understates underlying platform activity in this quarter.

Sources: [CIQ Financials_Quarterly.xls → Income Statement, Q3 FY24–Q2 FY26 columns]; [Q2 FY26 10-Q, Condensed Consolidated Statements of Operations, filed Aug-05-2026]; [Q1 FY26 10-Q, filed May-06-2026].

## 4. Reported vs Adjusted Metrics

| Metric | Reported Value (FY2025) | Adjusted Value (FY2025) | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA | 6,312 (unadjusted: EBIT + total D&A) | 8,730 (company-defined "Adjusted EBITDA") | +2,418 | Adds back stock-based comp ($1,826M, the largest single item), legal/non-income-tax/regulatory reserve changes and settlements ($564M), goodwill/asset impairments ($2M), acquisition/financing/divestiture expenses ($43M), loss on lease arrangements ($2M), restructuring ($9M) [components sum to $2,446M against the operating-income base; the $2,418M gap to the unadjusted-EBITDA base reflects a $28M difference in the D&A add-back methodology between CIQ's total-D&A figure and the company's opex-line D&A] | [FY25 10-K, Item 7 MD&A, Adjusted EBITDA reconciliation table] |
| EBIT | 5,565 (GAAP income from operations) | Company does not disclose a separate Adjusted EBIT / Adjusted operating income metric. | n/a | n/a | [FY25 10-K, Item 7; no Adjusted EBIT reconciliation present] |
| EPS | 4.73 (GAAP diluted EPS) | 1.94 (Capital IQ "Normalized Diluted EPS," LTM basis; FY2025 = 1.70) | −3.03 (FY2025); −2.64 (LTM) | Uber does not publish a company-defined "Adjusted EPS." The figure shown is Capital IQ's own normalization (removes one-time/unusual items per CIQ's standard methodology) and is labelled as a vendor estimate, not a company metric. Directionally consistent with the large non-cash tax benefits described in Section 3 that inflate reported GAAP EPS. | [CIQ Financials_Annual.xls → Income Statement, "Normalized Diluted EPS" row — vendor-derived, not company-disclosed] |

**Disclosure-change flag (material for downstream tracking):** Uber stopped presenting company-level "Adjusted EBITDA" as a headline non-GAAP metric starting with the Q1 FY26 10-Q — the term does not appear anywhere in either the Q1 FY26 or Q2 FY26 earnings-call transcripts (zero mentions in both, confirmed by full-text search) [Q1 FY26 Earnings Call, May-06-2026; Q2 FY26 Earnings Call, Aug-05-2026], and the Q1/Q2 FY26 10-Qs reconcile only "Free cash flow," not company Adjusted EBITDA [Q1 FY26 10-Q, filed May-06-2026; Q2 FY26 10-Q, filed Aug-05-2026]. Segment-level profit measure also changed from "Segment Adjusted EBITDA" to "Segment Operating Income" effective Q1 FY26, with prior-period segment figures recast [Q1 FY26 10-Q, MD&A]. The last disclosed company-level Adjusted EBITDA is therefore the FY2025 annual figure ($8,730M) from the FY25 10-K — no FY26 quarterly Adjusted EBITDA update exists in this pool. Downstream agents relying on Adjusted EBITDA trend should use the unadjusted CIQ "EBITDA" figures in Sections 1–3 for FY26 quarters, or Free Cash Flow, which the company continues to report.

## 5. Quarterly Seasonality Table (last 3 fiscal years: FY2023–FY2025)

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 EBITDA Margin | FY2024 EBITDA Margin | FY2025 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 23.7% | 23.0% | 22.2% | 23.0% | (0.6)% | 3.6% | 12.2% |
| Q2 | 24.8% | 24.3% | 24.3% | 24.5% | 5.8% | 9.1% | 12.9% |
| Q3 | 24.9% | 25.4% | 25.9% | 25.4% | 6.4% | 11.1% | 9.7% |
| Q4 | 26.7% | 27.2% | 27.6% | 27.2% | 8.6% | 7.9% | 13.7% |

No quarter exceeds 30% or falls below 20% of annual revenue, so the >30%/<20% flag threshold is not tripped. That said, there is a consistent, mild pattern: Q4 is the strongest revenue quarter in all three years (26.7–27.6% of the year, and rising each year) and Q1 the weakest (22.2–23.7%, and falling each year) [computed from CIQ Financials_Quarterly.xls → Income Statement]. EBITDA margin does not show the same clean seasonal pattern — FY2024's Q4 dip (7.9%, below both Q2 and Q3 that year) breaks the revenue-share pattern and coincides with the concentrated legal/regulatory reserve charges added back in the FY2024 Adjusted EBITDA reconciliation ($1,123M for the full year) [FY25 10-K, Item 7]; this is a one-time-item effect layered on top of the underlying seasonal revenue pattern, not a contradiction of it.

## 6. Key Trend Summary

Revenue growth has held in a stable high-teens band for three straight fiscal years (+17.0% FY2023, +18.0% FY2024, +18.3% FY2025) [CIQ Financials_Annual.xls → Income Statement], but the two most recent quarters (Q1 FY26 +14.5% YoY, Q2 FY26 +12.2% YoY) show a real deceleration in reported revenue growth versus the ~20% run rate of the prior four quarters — though Gross Bookings still grew 24% YoY in Q2 FY26, and the gap is substantially explained by a disclosed $1.1B one-time UK Mobility revenue-recognition change, not weaker underlying demand [Q2 FY26 10-Q, MD&A]. Margins are expanding: EBITDA margin (unadjusted) has risen every year from FY2021's (16.8)% to FY2025's 12.1%, and the company's Adjusted EBITDA margin reached 16.8% in FY2025 (up from 14.7% in FY2024) [FY25 10-K, Item 7], though the company stopped disclosing this adjusted metric on a quarterly basis after Q4 FY2025 (see Section 4), which limits visibility into whether the margin-expansion trend continued into FY26. There is material but not extreme seasonality: Q4 is consistently the strongest revenue quarter (~27% of the year) and Q1 the weakest (~23%), a pattern that has held for three straight fiscal years (Section 5). The clearest inflection points in the last five years are (1) the FY2022→FY2023 swing from negative to positive EBIT/EBITDA, marking the transition from growth-at-a-loss to sustained profitability, and (2) a large, recent balance-sheet inflection: strict net debt rose $3.96B (+67%) in the year to Jun-30-2026, funded by a $3,997M debt raise in Q2 FY26 alone used substantially to fund an accelerated buyback program (LTM repurchases of $6,904M) — a leverage increase (Net Debt/unadjusted-EBITDA rising from 0.82x at FY2025 year-end to 1.32x on an LTM basis) that this module flags for the balance-sheet/capital-allocation-focused agents to examine further, since it sits outside this agent's scope to evaluate (Section 2).

## 7. Citations

[1] FY25 10-K (filed Feb-13-2026), Item 8, Consolidated Statements of Operations
[2] FY25 10-K (filed Feb-13-2026), Item 8, Consolidated Balance Sheets
[3] FY25 10-K (filed Feb-13-2026), Item 8, Consolidated Statements of Cash Flows
[4] FY25 10-K (filed Feb-13-2026), Item 7, MD&A — Adjusted EBITDA reconciliation table
[5] Q1 FY26 10-Q (filed May-06-2026), MD&A — Segment Operating Income basis change (Segment Adjusted EBITDA → Segment Operating Income, effective Q1 FY26)
[6] Q2 FY26 10-Q (filed Aug-05-2026), Condensed Consolidated Statements of Operations
[7] Q2 FY26 10-Q (filed Aug-05-2026), Condensed Consolidated Balance Sheets
[8] Q2 FY26 10-Q (filed Aug-05-2026), MD&A — Free Cash Flow reconciliation
[9] Q2 FY26 10-Q (filed Aug-05-2026), MD&A — Revenue discussion (UK Mobility business-model change, −$1.1B impact)
[10] Q1 FY26 Earnings Call transcript, May-06-2026 (verbatim CIQ transcript) — zero mentions of "Adjusted EBITDA" (full-text search)
[11] Q2 FY26 Earnings Call transcript, Aug-05-2026 (verbatim CIQ transcript) — zero mentions of "Adjusted EBITDA" (full-text search)
[12] Capital IQ export, Uber Technologies Inc NYSE UBER Financials_Annual.xls → Income Statement / Balance Sheet / Cash Flow / Segments tabs, data pulled Aug-2026
[13] Capital IQ export, Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Income Statement / Balance Sheet / Cash Flow tabs, data pulled Aug-2026

Method note: all growth rates, margins (bps), TTM sums, FCF, and leverage ratios in this report were computed via executed Python scripts (not mental arithmetic) that read the values transcribed from the sources above; annual and quarterly CIQ figures were cross-checked against each other (quarterly sums reconciled exactly to annual/LTM totals for revenue, EBITDA, EBIT, CFO, and capex) and against the Q1/Q2 FY26 10-Q primary filings for CFO, capex, and revenue, all of which tied out exactly.



---

## earnings / 02_revenue-drivers.md

_Source: `02_revenue-drivers.md`_

# Revenue Drivers — UBER

Reporting standard: US GAAP. Reporting currency: USD, in millions unless noted. Fiscal year end: December 31 [FY25 10-K, cover page]. No `ciq_facts.json` sidecar is present in `analyses/UBER_2026-08-09/_pool_extracts/` for this run, so all figures below are this agent's own sourced read of the 10-K, 10-Q, and earnings-call filings, cross-checked against the Capital IQ exports in `data/UBER/`.

## 1. Segment Decomposition Status

Segment decomposition applied — 3 segments (Mobility, Delivery, Freight) from the business-model module's `03_segment-map.md` [analyses/UBER_2026-08-09/business-model/03_segment-map.md]. Uber is not single-segment: Mobility is 57.0% of FY2025 revenue, Delivery 33.2%, Freight 9.8% [FY25 10-K, p.57]. Segment-level revenue and profit are both disclosed, which is a strength for this decomposition; sub-segment detail (Mobility financial-partnerships/advertising revenue split; Delivery Grocery & Retail vs. core-restaurant split) is described only qualitatively and is not quantified in the filings reviewed [FY25 10-K, Note 13].

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Marketplace | GMV × take rate |
| Multi-segment | Sum of segment revenue drivers |

Uber is best modelled as a multi-segment marketplace. Company-specific formula:

**Total Revenue = Σ over segments (Gross Bookings₍segment₎ × Revenue Margin₍segment₎)**, where Gross Bookings₍segment₎ = MAPCs (monthly active platform consumers) × monthly Trips per MAPC (frequency) × average booking value per Trip, and Revenue Margin (Uber's own term for take rate, i.e. revenue ÷ Gross Bookings) is net of Driver/Merchant earnings and Driver incentives [Q2 FY26 10-Q, MD&A, p.33 — Revenue Margin defined; p.43 — Key Metrics]. Freight is a partial exception: its "Gross Bookings" figure is defined to equal Freight revenue itself, so Freight's take rate is effectively fixed at ~1.0 by definition [Q2 FY26 10-Q, MD&A, p.43 — Gross Bookings definition]. Since January 2, 2026, the UK Mobility take rate is structurally lower than before, because a regulatory change moved driver payments in certain UK markets from a cost-of-revenue line to a direct deduction from revenue [Q2 FY26 10-Q, MD&A, p.33].

## 3. Market / Share / Price / Mix Split

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand | Improving | Trips grew 18% YoY and MAPCs grew 16% YoY in Q2 FY26, the fourth straight quarter of Gross Bookings growth above 20% [Q2 FY26 10-Q, MD&A, p.34; Q2 FY26 Earnings Call, CEO prepared remarks]. Both Mobility and Delivery ride on discretionary consumer spending [analyses/UBER_2026-08-09/business-model/10_external-dependency.md, "Consumer cycle" row] | 80 |
| Company market share | Improving (Delivery); Mixed (Mobility) | CFO: "we gained category position in all of our large markets" in Delivery [Q2 FY26 Earnings Call, Q&A]; in the US, insurance-cost savings reinvested into pricing drove California/L.A./S.F. trip growth to "meaningfully outpace... the rest of the country" [Q2 FY26 Earnings Call, CFO Q&A]. Against this, the segment-map flags Brazil two-wheeler share loss in Mobility to DiDi/Meituan [analyses/UBER_2026-08-09/business-model/03_segment-map.md] | 55 |
| Price / realization (take rate) | Deteriorating (Mobility, regulatory-driven); Stable-to-improving (Delivery, ad-mix-driven) | Mobility take rate (revenue ÷ Gross Bookings) fell from 30.7% (Q2 FY25: $7,288M / $23,762M) to 25.4% (Q2 FY26: $7,363M / $28,988M), a ~528bp drop, driven by the UK business-model change [Q2 FY26 10-Q, MD&A, p.40–41; computed]. Delivery take rate rose slightly, 18.9%→19.1%, helped by a $182M advertising-revenue increase [Q2 FY26 10-Q, MD&A, p.41; computed] | 70 |
| Product / customer / geography mix | Improving | Delivery (higher-growth, still lower-margin-quality than Mobility) is 33.2% of revenue and growing faster (25% vs. Mobility's 18% in FY2025) [FY25 10-K, p.57], shifting the consolidated mix toward Delivery; advertising revenue (higher-margin) rose $568M in Delivery in FY2025 alone [FY25 10-K, p.57] | 45 |
| FX translation | Modest tailwind (recent quarter); ~neutral (FY2025) | Q2 FY26 revenue grew 12% reported vs. 11% constant-currency (~+1.2pp FX tailwind) [Q2 FY26 10-Q, MD&A, p.34]. FY2025 revenue grew 18% both reported and constant-currency (~0pp effect, both rounded to the same whole number) [FY25 10-K, MD&A, p.55] | 25 |
| M&A / divestitures | Present, not yet material at consolidated level | Delivery closed an 85% stake in Trendyol GO (Türkiye) on June 17, 2025 [FY25 10-K, Note 17]; agreed to acquire Getir's Türkiye delivery business (~$435M cash) in February 2026, closed "earlier this month" per the Aug-05-2026 call, i.e. within Q3 FY26 — zero impact on the Q2 FY26 figures analysed here [FY25 10-K, Note 19; Q2 FY26 Earnings Call, Q&A]. A pending acquisition of Delivery Hero (announced; expected close H2 2027) would roughly double Uber's addressable markets to ~100, but has zero effect on any period in this report [Q2 FY26 Earnings Call, CEO/CFO remarks] | 20 (rising to High once Delivery Hero closes) |

This separates market growth from company execution: reported Delivery revenue growth (28% in Q2 FY26) is not pure organic demand — a meaningful (unquantified in this filing) share of it is the Trendyol GO acquisition still working through the year-over-year base, on top of the $182M advertising-mix tailwind [Q2 FY26 Earnings Call, CFO Q&A — "on the whole, it is a headwind to delivery reported growth on a net basis [starting Q3]... because Trendyol Go was a lot larger... than the 2 acquisitions"]. Reported Mobility revenue growth (1% in Q2 FY26) understates organic demand: it is suppressed almost entirely by a one-time regulatory revenue-recognition change in the UK, not by weaker Trip volumes (see Section 6a).

## 4. Revenue Driver Table (consolidated)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Trip / Gross Bookings volume | Trips 3,867M in Q2 FY26 (+18% YoY); Gross Bookings $58.0B in Q2 FY26 (+24% reported / +22% constant-currency) | Improving | High | [Q2 FY26 10-Q, MD&A, p.34, 43]. Segment MD&A attributes GB growth in ALL THREE segments "primarily" or "due to" an increase in Trip volumes, in both FY2025 and Q2 FY26 [FY25 10-K, p.57; Q2 FY26 10-Q, p.41] |
| Take rate / regulatory revenue-recognition regime | Mobility take rate 25.4% (Q2 FY26), down ~528bp YoY | Deteriorating (Mobility, mechanical, not demand-driven) | High | UK change cut Mobility/total revenue by $1.1B in Q2 FY26 alone and $2.1B for H1 FY26 [Q2 FY26 10-Q, MD&A, p.34]. See Section 6a for the arithmetic |
| Segment mix (Delivery vs. Mobility growth gap) | Delivery 33.2% of FY25 revenue and growing 25% vs. Mobility's 18% [FY25 10-K, p.57] | Improving (mix shifting to a lower-margin-quality but faster-growing segment) | Mid | [FY25 10-K, p.57] |
| Advertising revenue (mostly Delivery) | +$568M in FY2025; +$182M in Q2 FY26 alone | Improving | Mid | [FY25 10-K, p.57; Q2 FY26 10-Q, p.41] |
| FX translation | ~+1.2pp tailwind to revenue growth in Q2 FY26; ~0pp for FY2025 | Improving (recently; historically variable) | Mid | [Q2 FY26 10-Q, MD&A, p.34; FY25 10-K, MD&A, p.55] |
| M&A (Delivery bolt-ons; pending Delivery Hero) | Trendyol GO closed Jun-2025; Getir closed Aug-2026 (Q3, not in this report's period); Delivery Hero pending, expected close H2 2027 | Improving, not yet material | Mid (Low today; High post-2027 if Delivery Hero closes) | [FY25 10-K, Note 17, Note 19; Q2 FY26 Earnings Call, Q&A] |
| Freight cycle (industrial/trucking demand) | Freight revenue +26% YoY in Q2 FY26 vs. −1% for full-year FY2025 | Improving (early recovery — see cycle-position note below) | Low at consolidated level (~9.8% of revenue); High within the segment | [Q2 FY26 10-Q, MD&A, p.41; FY25 10-K, p.57] |
| Regulatory driver-classification risk (contractor→employee) | Not currently triggered in a major market; New Zealand Supreme Court found 4 drivers were employees while logged in (Nov 2025) | Deteriorating tail risk (not a current-period driver) | High if triggered | Company states reclassification in a major market "would require us to fundamentally change our business model" [FY25 10-K, Item 1A, p.11–12] |
| Insurance-cost tailwind reinvested into pricing (US) | Insurance flagged by CFO as "becoming a tailwind this year," reinvested into fares, concentrated in California | Improving | Mid | [Q2 FY26 Earnings Call, CFO Q&A] |
| Sparse-market penetration / new products (U4B, Uber Health, Reserve) | <10% of eligible US consumers in sparse markets used Uber in the past 12 months vs. >50% in dense markets; U4B +40% YoY | Improving | Mid | [Q2 FY26 Earnings Call, CFO Q&A] |
| Autonomous-vehicle (AV) commercialization | Live in 7 cities, "on track to be live in 15 cities by year-end" 2026 | Improving, not yet material | Low today | CEO: "the numbers are small at this point" [Q2 FY26 Earnings Call, CEO Q&A] |
| Uber One membership (retention/frequency) | 46 million members as of Dec-31-2025, available in 30+ countries | Stable-to-improving (no YoY comparison disclosed in this pool) | Mid | [FY25 10-K, p.9] |

Magnitude bands per this module's convention: High = >5% revenue impact from a reasonable move; Mid = 2–5%; Low = <2%.

## 5. Revenue Drivers By Segment

### Segment: Mobility (57.0% of FY2025 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Trip volumes | Mobility Gross Bookings $28,988M in Q2 FY26, +22.0% reported / +20% constant-currency YoY | Improving | High | [Q2 FY26 10-Q, MD&A, p.40–41, 43] |
| UK regulatory revenue-recognition change | −$1.1B to Mobility revenue in Q2 FY26 alone; −$2.1B for H1 FY26 | One-time step-down, not a demand change | High | [Q2 FY26 10-Q, MD&A, p.34, 40] |
| Insurance cost / pricing lever | Insurance expense rose $851M in FY2025 (up on rate per mile and miles driven); management is now reinvesting insurance savings into lower fares, concentrated in California | Improving (pricing lever, company-controlled) | Mid | [FY25 10-K, p.57; Q2 FY26 Earnings Call, CFO Q&A] |
| Airport-trip concentration | 15% of 2025 Mobility Gross Bookings came from airport trips | Stable (travel-cycle sub-exposure) | Mid | [analyses/UBER_2026-08-09/business-model/10_external-dependency.md] |
| Financial-partnerships and advertising revenue (Mobility) | Included in Mobility revenue but not quantified separately | Not proven from available data | Not assessable | [FY25 10-K, Note 13] |

### Segment: Delivery (33.2% of FY2025 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Trip volumes | Delivery Gross Bookings $27,463M in Q2 FY26, +26.4% reported / +25% constant-currency YoY | Improving | High | [Q2 FY26 10-Q, MD&A, p.41, 43] |
| Advertising revenue | +$182M in Q2 FY26 alone; +$568M for FY2025 | Improving | Mid | [Q2 FY26 10-Q, p.41; FY25 10-K, p.57] |
| M&A (Trendyol GO, Getir, Careem reconsolidation) | Trendyol GO (85% stake, closed Jun-17-2025) not yet fully lapped in the Q2 FY26 YoY comparison; Getir closed Aug-2026 (Q3, not in this quarter); a net headwind to reported growth from Q3 FY26 as Trendyol GO laps | Net tailwind in Q2 FY26, becomes a net headwind from Q3 FY26 | Mid | [FY25 10-K, Note 17, Note 19; Q2 FY26 Earnings Call, CFO Q&A] |
| Category/share position | "We gained category position in all of our large markets" | Improving | Mid | [Q2 FY26 Earnings Call, CFO Q&A] |
| Pending Delivery Hero acquisition | Announced; expected close H2 2027, migration through 2029; would roughly double addressable markets | Not yet in the numbers | Currently zero; High if/when it closes | [Q2 FY26 Earnings Call, CEO/CFO remarks] |

### Segment: Freight (9.8% of FY2025 revenue) — immaterial to consolidated revenue magnitude, covered briefly

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Freight rate cycle | Q2 FY26 revenue +26% YoY ("increase in gross booking per trip and trip volume"), reversing FY2025's −1% ("challenging freight market cycle") | Improving — early recovery | Low at consolidated level; High within segment | [Q2 FY26 10-Q, MD&A, p.41; FY25 10-K, p.57] |

**Cycle-position read (Cycle-Position Rule):** Freight is the one segment with a clear external demand/margin cycle. FY2025 revenue fell 1% and the 10-K used explicit trough language, "challenging freight market cycle" [FY25 10-K, p.57]. That phrase does not reappear in the Q2 FY26 10-Q; instead Freight revenue rose 26% YoY on "an increase in gross booking per trip and trip volume" — both rate and volume improving together [Q2 FY26 10-Q, p.41]. This reads as an early-stage recovery off a trough, not a new steady-state — freight-rate cycles have historically been multi-year and this is one data point (a single quarter) after a prior down-year, so the current level should not be treated as a normalised run rate. Mobility and Delivery do not show comparable evidence of being at either a cyclical peak or trough: Gross Bookings growth has stayed above 20% for four consecutive quarters with no disclosed deceleration in underlying Trip volumes [Q2 FY26 10-Q, MD&A, p.34], so this is read as mid-cycle expansion, not peak froth (no valuation or capacity-utilization signal in this pool indicates a peak) and not trough (growth is accelerating, not decelerating, ex-UK — see Section 6a).

**One-time policy item, labelled non-run-rate:** The UK Mobility revenue-recognition change (effective January 2, 2026) is a one-time step-down in reported revenue, not a recurring drag that compounds further. It will continue to suppress year-over-year comparisons through Q4 FY26 (because the prior-year comparison periods predate the January 2026 change), and should mechanically drop out of the year-over-year comparison starting Q1 FY27, once both the current and prior-year quarters sit under the new regime [Q2 FY26 10-Q, MD&A, p.34 — inference on timing, not from filings]. Treat any reported Mobility/total revenue growth rate through Q4 FY26 as understating underlying demand by roughly the size of this item.

## 6. Revenue Growth Decomposition

**Table A — FY2025 annual (clean baseline, no UK distortion; the UK change took effect Jan-2-2026, after FY2025 closed).**

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Mobility (segment revenue $ change) | +10.42pp | Mobility revenue $25,087M→$29,670M (+$4,583M) / $43,978M prior-year total [FY25 10-K, p.57; computed] |
| Delivery (segment revenue $ change) | +7.95pp | Delivery revenue $13,750M→$17,248M (+$3,498M) / $43,978M [FY25 10-K, p.57; computed]. Of this, +1.29pp is the disclosed $568M advertising-revenue increase; the remaining +6.66pp tracks Delivery's 22% constant-currency Gross Bookings growth (Delivery core revenue ex-ads grew ~21.3% vs. GB growth of 22%, a ~0.7pp gap) [FY25 10-K, p.57; computed] |
| Freight (segment revenue $ change) | −0.10pp | Freight revenue $5,141M→$5,099M (−$42M) / $43,978M [FY25 10-K, p.57; computed] |
| FX | ~0pp | Reported revenue growth 18% vs. constant-currency revenue growth 18% (both disclosed to the same whole number) [FY25 10-K, MD&A, p.55] |
| M&A (Trendyol GO, within Delivery) | Not separately quantified; embedded in the Delivery row above | Trendyol GO closed Jun-17-2025, contributing ~6.5 months to FY2025 vs. 0 months to FY2024 [FY25 10-K, Note 17] |
| **Total revenue growth** | **18.27pp (18.3%)** | Revenue $43,978M→$52,017M [FY25 10-K, p.9; computed] |

Segment rows sum exactly to the reported total (10.42 + 7.95 − 0.10 = 18.27pp) because segment revenue is, by construction, the full decomposition of consolidated revenue — there is no residual at this level. The residual sits one layer down, inside each segment (see Table B and Section 6a for how far that can be pushed with disclosed data).

**Table B — Q2 FY26 quarterly (most recent quarter; distorted by the UK one-time item, which is flagged, not netted out).**

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| FX | +1.17pp | Total revenue growth 12% reported vs. 11% constant-currency [Q2 FY26 10-Q, MD&A, p.34]; see derivation in Section 6a |
| UK regulatory revenue-recognition change (one-time) | −8.69pp | $1,100M revenue reduction / $12,651M prior-year total revenue [Q2 FY26 10-Q, MD&A, p.34]; see derivation in Section 6a |
| Volume + price/mix + unquantified M&A (organic, combined — not separable from this filing) | +19.69pp | Plug: Total (12.17pp) − FX (+1.17pp) − UK (−8.69pp); see Section 6a for why this cannot be split further |
| **Total revenue growth** | **12.17pp (12.2%)** | Revenue $12,651M→$14,191M [Q2 FY26 10-Q, MD&A, p.34; computed] |

## 6a. Decomposition Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

**FX (Table B, Q2 FY26):**
```
FX: reported revenue growth (12%) − constant-currency revenue growth (11%) [Q2 FY26 10-Q, MD&A, Financial and Operational Highlights table, p.34]
  = +1.17pp of the 12.17pp observed growth (12.17% computed from $12,651M→$14,191M; 11% CC as disclosed)
  → basis matches: both figures are the filing's own total-company, same-period reconciliation — no cross-basis use.
```

**UK regulatory revenue-recognition change (Table B, Q2 FY26):**
```
UK change: −$1,100M stated revenue impact, Q2 FY26 quarter alone [Q2 FY26 10-Q, MD&A, p.34]
  ÷ $12,651M prior-year (Q2 FY25) total revenue [Q2 FY26 10-Q, MD&A, p.34]
  = −8.69pp of the 12.17pp observed growth
  → basis matches: this is a company-disclosed dollar figure, not a modelled ratio, applied against the same prior-year total-revenue base used for every other row in Table B, so it is comparable across rows.
```

**Volume + price/mix + M&A (organic, combined) — the plug row:**
```
19.69pp = Total (12.17pp) − FX (+1.17pp) − UK (−8.69pp)
  → This is a residual, not an independently measured driver. Trips grew 18.3% YoY (3,268M→3,867M) [Q2 FY26 10-Q, MD&A, p.43] is the nearest available corroborating figure, but it cannot be equated to the 19.69pp on a like-for-like basis: Trips is a count metric that EXCLUDES Freight, while the 19.69pp is a revenue-dollar contribution that INCLUDES Freight — different bases (§15). The two are directionally consistent (both show demand still expanding) but this report refuses to present 19.69pp as "Volume's contribution" on the authority of an 18.3% Trips number measured on a different base.
```

**Reconciliation:** 1.17pp + (−8.69pp) + 19.69pp = **12.17pp reconciled, $0.00pp arithmetic residual** in Table B (the third row is defined as the plug, so it reconciles by construction). But the ECONOMIC content of that reconciliation is limited: only two of the three rows (FX, UK) rest on a named, independently disclosed mechanism; the third and largest row in absolute-value terms (19.69pp, versus 1.17pp and 8.69pp for the other two) is an undifferentiated bundle of volume, price, mix, and unquantified M&A. That means more than half of the gross magnitude in Table B (19.69 of the 1.17+8.69+19.69=29.55pp total gross swing) is not attributed to a specific, evidenced mechanism. This caps how precisely Section 7 can size any single organic sub-driver — it can name Volume as the *structurally* largest lever (on repeated qualitative filing language, see Section 7), but it cannot put a verified number on Volume alone from this quarter's bridge.

Table A (FY2025 annual) has no such problem: its rows are segment revenue dollars, which sum to the total by construction with zero ambiguity, and the one sub-decomposition performed inside Table A (Delivery's $568M advertising carve-out) is a disclosed dollar figure, not a modelled ratio.

## 7. The Single Biggest Revenue Driver

**Trip / Gross Bookings volume** — driven by MAPC growth (+16% YoY in Q2 FY26) and Trip frequency — is the single biggest revenue driver. It is the base multiplier that both Mobility and Delivery revenue scale from (Freight's own volume plays the same role at a smaller scale), and segment MD&A repeatedly and consistently names an "increase in Trip volumes" as the primary driver of Gross Bookings growth in ALL THREE segments, in both FY2025 and Q2 FY26 [FY25 10-K, p.57; Q2 FY26 10-Q, MD&A, p.41]. A 10–20% swing in Trip volume — up or down — would move Gross Bookings, and therefore revenue at a given take rate, by a broadly comparable order of magnitude across the whole company simultaneously; no single segment's take-rate move can do that on its own, because take rate is much closer to its structural bounds (Freight's is fixed near 1.0 by definition, and Mobility's just took the biggest evidenced move seen in this data set, ~528bp, which is close to the upper end of what a regulatory shock — not a routine pricing decision — can do). Current direction: still expanding. Trips grew 18% YoY and MAPCs grew 16% YoY in Q2 FY26, marking the fourth consecutive quarter of Gross Bookings growth above 20% [Q2 FY26 10-Q, MD&A, p.34; Q2 FY26 Earnings Call, CEO prepared remarks]. The one flag on this conclusion, stated plainly per Section 6a: this quarter's own revenue bridge could not separate Volume's dollar contribution from Price/Mix/M&A inside the 19.69pp organic bucket, so the claim above rests on the filing's repeated qualitative attribution language across two reporting periods, not on a verified pp figure from this quarter's arithmetic alone. Separately and worth flagging even though it is not the "biggest" driver by this test: take rate/regulatory policy is the biggest source of near-term SURPRISE in the reported numbers — it has already moved one quarter's revenue growth by 8.7 percentage points via a single country's tax/regulatory change, a bigger single-quarter swing than anything volume has produced on its own in this data set.



---

## earnings / 03_margin-drivers.md

_Source: `03_margin-drivers.md`_

# Margin Drivers — UBER

Reporting standard: US GAAP. Reporting currency: USD, $ millions unless noted. Fiscal year end: December 31 [FY25 10-K, cover page]. All bps figures are basis points (0.01 percentage points). Upstream `01_historical-financials.md` was available and is used as the margin baseline; no missing-upstream flag needed.

Business-model module IS available (`analyses/UBER_2026-08-09/business-model/`) — segment decomposition and pricing-power context below draw on `03_segment-map.md` and `06_value-chain.md`.

## 3b. Sector Overlay

Business identity (`02_business-identity.md` §3a) classifies Uber as a two-sided, multi-vertical on-demand marketplace platform (ride-hailing, delivery, freight brokerage) and states explicitly: *"No row in `frameworks/SECTOR_OVERLAYS.md` matches an on-demand, multi-sided mobility/delivery/freight marketplace platform... No sector overlay... — generic read."*

**No sector overlay for two-sided on-demand mobility/delivery/freight marketplace platform — generic cost stack applies**, refined by the platform-specific metrics Uber discloses (Gross Bookings, take rate / Revenue Margin, Segment Adjusted EBITDA / Segment Operating Income) per the identity module's own KPI checklist.

## 1. Segment Decomposition Status

Segment-map (`03_segment-map.md`) exists and is used. Uber is **not** single-segment: Mobility is 57.0% of FY2025 revenue ($29,670M of $52,017M), Delivery 33.2% ($17,248M), Freight 9.8% ($5,099M) [FY25 10-K, p.8484–8502]. Segment-level profit **is** disclosed (not just revenue), so drivers are decomposed by segment in Section 6. One measurement-basis change is flagged and carried through this report: effective Q1 FY26, Uber switched its segment profit metric from **Segment Adjusted EBITDA** to **Segment Operating Income** and recast prior periods [Q2 FY26 10-Q, Note 10, p.14216–14221]. The two are not directly comparable (Segment Operating Income includes stock-based compensation and certain D&A that Segment Adjusted EBITDA excluded), so this report never blends FY2025 Adjusted-EBITDA-basis segment margins with FY2026 Operating-Income-basis segment margins in the same delta — each is shown on its own basis, labelled.

## 2. Cost Stack

Uber's GAAP income statement does not report "gross profit" or a single "COGS" line the way a manufacturer does — it discloses six cost/opex categories: cost of revenue (ex-D&A), operations and support, sales and marketing, R&D, G&A, and D&A [FY25 10-K, Item 8]. The rows below use those disclosed categories (no invented lines).

| Cost Line | % of Revenue (FY2025 / FY2024) | Direction | Evidence | Margin Risk |
|---|---:|---|---|---|
| Cost of revenue, excl. D&A (Driver/Courier payments & incentives, insurance, Carrier payments, credit-card fees, data-center costs) | 60.3% / 60.6% | Improving slowly (annual); optically improved further in Q2 FY26 (55.1% vs 60.1% Q2 FY25) but ~132bps of that quarterly move is a UK revenue-recognition classification change, not organic (see §7a) | "increased $4.7 billion, or 18%... a $1.6 billion increase in Driver payments... a $1.6 billion increase in Courier payments... a $851 million increase in insurance expense" [FY25 10-K, Item 7 MD&A]; Q2 FY26 detail: "$808 million decrease in Driver payments and incentives, as a result of Mobility business model changes in the UK" [Q2 FY26 10-Q, MD&A] | High — largest cost line (~60% of revenue); moves mechanically with Gross Bookings and is exposed to insurance-rate swings and accounting-classification shifts that distort YoY reads |
| Insurance (sub-component of cost of revenue, Mobility-driven, not a standalone GAAP line) | Embedded in cost of revenue; FY25 increase of $851M ≈ 164bps of FY25 revenue | FY2025: headwind (+$851M). 2026-to-date: tailwind per management, but explicitly **reinvested**, not banked as margin | "a $851 million increase in insurance expense primarily due to an increase in insurance rate per mile and miles driven" [FY25 10-K, MD&A]; "insurance... is becoming a tailwind this year. We are reinvesting the savings from insurance back into the market" [Q2 FY26 transcript, CFO Balaji Krishnamurthy] | Mid — a swing item that management has chosen to spend rather than let flow to margin; not run-rate in either direction |
| Freight Carrier payments (cost of revenue subset, Freight segment) | Not a separate line for Mobility/Delivery — Freight is a distinct 9.8%-of-revenue segment where Carrier payments are booked in cost of revenue and move roughly in lockstep with Freight revenue | Pass-through — Carrier payments rose $320M as Freight revenue rose $322M in Q2 FY26 | "Freight Segment Operating Loss decreased primarily attributable to a $322 million increase in Freight revenue, partially offset by an $320 million increase in Freight Carrier payments" [Q2 FY26 10-Q, MD&A] | Low at consolidated level (Freight is ~10% of revenue) but structurally caps how much a freight-cycle recovery can improve consolidated margin — see §6 |
| Energy / fuel | Not disclosed as a Uber cost line — Uber owns no vehicle fleet, so fuel sits with Drivers/Carriers, not on Uber's own income statement | N/A to Uber's P&L directly; indirect via driver-supply risk | "Factors such as inflation, increased fuel prices... have and may continue to increase the costs incurred by Drivers and Carriers... A decreased supply of Drivers... would decrease our network liquidity" [FY25 10-K, Item 1A] | Low-Mid — indirect (driver-supply) channel only, not a direct cost line |
| Labor / headcount (embedded across Operations & Support, S&M, R&D, G&A — no single consolidated payroll line) | Growth disclosed narratively per opex category, not as one figure | Headwind in FY26-to-date — headcount cost increases cited in every opex line's 2025-vs-2024 and Q2-FY26-vs-Q2-FY25 walk | e.g. "a $138 million increase in employee headcount costs" (Operations and support, FY25 vs FY24); "$80 million increase in employee compensation costs including stock-based compensation" (Operations and support, Q2 FY26 vs Q2 FY25) [FY25 10-K MD&A; Q2 FY26 10-Q MD&A] | Mid — spread across four opex lines, each growing faster than revenue in Q2 FY26 (see §7) |
| Sales & Marketing | 9.4% / 9.9% (FY25/FY24, improving); 10.7% / 9.6% (Q2 FY26/Q2 FY25, worsening) | Annual: tailwind. Latest quarter: headwind — deliberate reinvestment | "increased $305 million or 25%... primarily attributable to a $136 million increase in consumer discounts, promotions, credits and refunds and a $115 million increase in indirect advertising and marketing" [Q2 FY26 10-Q, MD&A] | Mid — largely a discretionary lever tied to the insurance-savings reinvestment decision above |
| Research & Development | 6.5% / 7.1% (FY25/FY24, improving); 7.4% / 6.6% (Q2 FY26/Q2 FY25, worsening) | Annual: tailwind. Latest quarter: headwind | "increased $203 million... primarily attributable to a $189 million increase in employee compensation costs including stock-based compensation" [Q2 FY26 10-Q, MD&A] | Mid — SBC/headcount-driven, structural, not one-off |
| General & Administrative | 6.2% / 8.3% (FY25/FY24, improving sharply); 6.6% / 5.3% (Q2 FY26/Q2 FY25, worsening sharply) | Volatile — dominated by legal/regulatory reserve swings, not core opex leverage | FY25: "decreased $398 million, or 11%, primarily attributable to a $549 million decrease in legal-related accruals" — FY24's Adjusted-EBITDA reconciliation shows the broader "legal, non-income-tax and regulatory reserve" add-back falling from $1,123M (FY24) to $564M (FY25) [FY25 10-K MD&A; FY25 10-K, Item 7 Adj. EBITDA reconciliation]. Q2 FY26: "increased $266 million, or 40%, primarily attributable to a $138 million increase in legal-related accruals" [Q2 FY26 10-Q, MD&A] | High — this line alone swung the FY25 margin bridge by ~105bps of tailwind (one-off) and the Q2 FY26 bridge by ~97bps of headwind (one-off); it is the least repeatable driver in the cost stack |
| Stock-based compensation (embedded across all four opex lines above, not a standalone GAAP income-statement line but disclosed in the cash-flow statement / Adj. EBITDA reconciliation) | 3.5% of revenue FY25 ($1,826M/$52,017M) vs 4.1% FY24 ($1,796M/$43,978M) | Tailwind — SBC dollars grew only 1.7% while revenue grew 18.3%, so SBC as a share of revenue fell ~57bps | "Stock-based compensation expense... 1,796 [FY24] ... 1,826 [FY25]" [FY25 10-K, Item 7, Adj. EBITDA reconciliation table] | Low-Mid — a real, GAAP-expensed cost (not adjusted out of the margins in this report), currently shrinking as a share of revenue |
| D&A | 1.4% / 1.6% (FY25/FY24) | Tailwind, small | "The change in depreciation and amortization expenses was not material" [FY25 10-K, MD&A] | Low — D&A is only ~1% of revenue; Uber is asset-light (FY25 capex $336M, TTM capex $308M) [`01_historical-financials.md` §1–2] |
| Interest expense (below EBIT, shown for completeness) | 0.85% / 1.19% (FY25/FY24) | Tailwind | "Interest expense... (523) [FY24] ... (440) [FY25]" [FY25 10-K, Item 7] | Low — revolver undrawn; a 100bp rate move only affects the fair value of fixed-rate notes by ~$538M, not cash interest [`10_external-dependency.md`] |

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

Because Uber does not report a GAAP "gross profit" line, the table below uses (Revenue − Cost of revenue, ex-D&A) as the closest disclosed analog — labelled "Revenue-less-COGS margin," not "gross margin," to avoid implying a metric Uber does not present. Figures are FY2025 vs FY2024 (annual, cleanest comparable period; the FY25 10-K, filed Feb-13-2026, is the latest audited annual filing).

| Margin Level | FY2025 | FY2024 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Revenue-less-COGS margin (proxy; not GAAP "gross margin") | 39.75% | 39.39% | +36 | Cost of revenue grew slightly slower than revenue (Driver/Courier payment leverage from Gross Bookings growth, partly offset by the $851M insurance-cost increase) | [FY25 10-K, Item 7 MD&A; computed] |
| EBITDA margin (unadjusted: EBIT + total D&A) | 12.1% | 8.0% | +409 | Falling G&A ratio (legal-accrual reduction, ~105bps of the 409bps is a one-off — see §7a), plus modest operating leverage in cost of revenue, S&M, R&D, O&S | [`01_historical-financials.md` §1; computed] |
| EBIT margin | 10.7% | 6.4% | +434 | Same drivers as EBITDA plus a flat D&A ratio | [`01_historical-financials.md` §1; computed] |

Company-defined **Adjusted EBITDA margin** (which adds back SBC, legal/regulatory reserve changes, impairments, and restructuring) rose to 16.8% in FY2025 from 14.7% in FY2024 — a +204bps move [FY25 10-K, Item 7, Adj. EBITDA reconciliation]. **Uber stopped disclosing company-level Adjusted EBITDA on a quarterly basis starting with the Q1 FY26 10-Q** — the term appears zero times in either the Q1 or Q2 FY26 earnings-call transcripts (full-text search) [`01_historical-financials.md` §4]. This report therefore uses the unadjusted EBITDA figures (which CIQ constructs and which reconcile to the reported income statement) for the FY26-quarter margin bridge in Section 7, since no FY26 quarterly Adjusted EBITDA exists in this pool.

**Pass-through lag:** the value-chain output states Uber's largest input cost (Driver/Courier payments) "moves mechanically with Gross Bookings rather than through a negotiated pass-through clause" — there is effectively no lag on this cost, because it scales automatically with the transaction it funds [`06_value-chain.md` §2]. Insurance is the one input cost with a real lag/discretion gap: a rate/mileage-driven cost swing shows up first, and management then decides — over subsequent quarters — whether to bank it as margin or reinvest it into fares/incentives; FY2025's $851M insurance headwind and the 2026 insurance "tailwind... reinvested back into the market" [Q2 FY26 transcript, CFO] show this discretion working in both directions within about a 12-month window.

## 4. Margin Walk — Which Margin Level Matters Most?

**EBITDA margin (and the underlying unadjusted EBIT margin, which tracks it closely since D&A is only ~1% of revenue) is the most useful level for Uber.** There is no meaningful "gross margin" concept for a marketplace that nets driver/courier payments through cost of revenue rather than owning the underlying asset, so the revenue-less-COGS proxy in Section 3 is a partial view at best — it excludes the S&M/insurance-reinvestment decisions that management actively uses as a margin lever (Section 2). EBITDA margin captures the full effect of that lever, of the driver/courier payment scaling, and of SG&A leverage, while removing the small and non-cash-adjacent noise of D&A. The caveat is that Uber's own preferred metric — Adjusted EBITDA margin, which also strips out SBC, legal reserves, and restructuring — is no longer disclosed quarterly (Section 3), which weakens visibility into whether the FY2025 margin-expansion trend continued into FY2026 on a like-for-like basis; this report works instead from unadjusted EBITDA, which is fully reconcilable to the filed income statement every quarter.

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Gross Bookings / trip-volume growth (take-rate leverage on cost of revenue) | Higher Gross Bookings scales Driver/Courier payment leverage and, historically, has shrunk the cost-of-revenue ratio | Tailwind | High | Gross Bookings +24% YoY in Q2 FY26 even as reported revenue grew only 12.2% [`01_historical-financials.md` §3]; cost-of-revenue ratio fell from 60.1% to 55.1% of revenue in the same quarter (partly UK-driven — see §7a) |
| SG&A / R&D headcount and discretionary-investment growth outpacing revenue | Operations & Support, S&M, R&D and G&A(-ex-legal) all grew faster than revenue in Q2 FY26, a net -232bps drag that quarter | Headwind | Mid-High | O&S +16%, S&M +25%, R&D +24%, G&A +40% vs revenue +12.2% YoY, Q2 FY26 [Q2 FY26 10-Q, MD&A]; see §7a for the bps decomposition |
| Insurance cost trend (Mobility) | FY2025: cost headwind. 2026: cost tailwind, but management chooses to reinvest the saving into fares/incentives rather than bank it as margin | Neutral-to-slight-headwind on reported margin (despite an underlying cost tailwind) | Mid-High | "insurance... is becoming a tailwind this year. We are reinvesting the savings from insurance back into the market" [Q2 FY26 transcript, CFO]; FY25 insurance cost rose $851M (~164bps of FY25 revenue) [FY25 10-K MD&A] |
| UK Mobility revenue-recognition / business-model change (effective Jan-2026) | Cuts both reported revenue and reported cost of revenue; net effect on the COGS-as-%-of-revenue ratio is a modest, largely optical, tailwind; net effect on reported revenue growth is a real headwind | One-off / non-run-rate (labelled) | High on optics, more muted on economics — see §7a for the derivation | "negatively impacted revenue by $1.1 billion" in Q2 FY26 alone [Q2 FY26 10-Q, MD&A]; "of that 500 basis points [Mobility revenue-margin decline], about 400 basis points is entirely related to this U.K. business model change, and it's an optical impact" [Q2 FY26 transcript, CFO] |
| G&A legal / regulatory reserve volatility | FY2025: $549M reduction in legal-related accruals was a one-off tailwind (~105bps of the 409bps FY25 EBITDA-margin gain). Q2 FY26: a $138M increase in legal accruals was a one-off headwind (~97bps of the quarter's G&A ratio move) | Volatile — direction flips period to period | High | [FY25 10-K MD&A; Q2 FY26 10-Q MD&A] |
| Segment mix (Delivery ~19% take rate and Freight ~pass-through growing alongside Mobility's ~30% take rate) | A revenue-dollar shift toward Delivery/Freight mechanically pulls the blended take rate down even as total Gross Bookings grow | Structural headwind | Mid | "Mobility runs at roughly a 30% take rate versus roughly 19% for Delivery and effectively 100% (pass-through) for Freight, so a shift in growth toward Delivery or Freight mechanically pulls the blended take rate down" [`02_business-identity.md` §4] |
| Stock-based compensation (embedded, non-cash) | SBC dollars grew only 1.7% FY24→FY25 vs revenue +18.3%, shrinking SBC as a share of revenue | Tailwind | Low-Mid | $1,796M FY24 → $1,826M FY25 [FY25 10-K, Item 7] |
| Freight cycle | Revenue growth accelerated from -1% (FY2025, full year) to +26% YoY (Q2 FY26) on both price and volume, but Carrier payments (pass-through) move almost 1:1 with revenue, so the segment barely improved in dollar-profit terms | Improving volume, thin margin flow-through | Low at consolidated level (Freight ~10% of revenue) | "Freight revenue increased primarily attributable to a 25% increase in Freight Gross Bookings due to an increase in gross booking per trip and trip volume" [Q2 FY26 10-Q, MD&A]; Freight Segment Operating Loss improved only $2M despite the $322M revenue gain [same source] |
| Driver/Courier employment-reclassification risk (US, EU, and other jurisdictions) | If triggered in a major market, Uber states it would have to "fundamentally change" its business model and pursue "significant price increases for Riders" | Headwind if realized; not currently realized | High if triggered, currently Unknown timing | "would require us to fundamentally change our business model" [FY25 10-K, Item 1A, p.11] |
| Pending Delivery Hero acquisition (announced; expected close H2 2027, integration through 2029) | Integration and goodwill risk; not yet in the reported numbers | Headwind (future), currently not reflected | Unknown, flagged | "roughly doubling addressable markets — integration risk is real, not yet in the numbers" [`03_segment-map.md` §1] |
| AV commercialization investment (~$10B multi-year) | See Section 9 — both a future cost and a demand/optionality signal | Both signs — see §9 | Currently Low reported impact; future Unknown | "In terms of the P&L versus cash flow impacts... there will be a P&L impact, and we'll size that for investors clearly as we have historically done" [Q2 FY26 transcript, CFO] |

## 6. Margin Drivers By Segment

Mobility is the dominant segment on both revenue (57.0% FY25) and profit (69.1% of FY25 segment-level Adjusted EBITDA) [`03_segment-map.md` §2]. All three segments are material enough to decompose.

### Segment: Mobility (57.0% of FY25 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Insurance rate per mile / miles driven | FY25: $851M cost increase pressured Mobility Adjusted EBITDA. 2026: management calls insurance "a tailwind," reinvested into pricing | Neutral-to-headwind on margin (reinvested), tailwind on underlying cost | High | "Mobility Adjusted EBITDA increased primarily attributable to an increase in Mobility Gross Bookings, partially offset by... a $851 million increase in insurance expense" [FY25 10-K, MD&A] |
| UK business-model change | Cuts Mobility revenue ($1.1B in Q2 FY26 alone) and Driver-payment cost ($813M in the same quarter) simultaneously | One-off / non-run-rate; net dollar effect on Mobility segment profit **cannot be cleanly isolated from this pool's disclosure** — the $1.1B revenue reduction and $813M cost reduction are not a stated 1:1 offset, and an "as-if" reconstruction attempted for this report did not reconcile against management's own framing (CFO states the take-rate effect is "largely" optical and Mobility operating-income margin "remains very strong at 7.6%" on a Gross-Bookings basis) — flagged as **not fully reconcilable from available disclosure**, not asserted with false precision | High | "Mobility revenue increased primarily attributable to an increase in Mobility Gross Bookings of 22%... partially offset by business model changes in the UK that negatively impacted revenue by $1.1 billion... Mobility Segment Operating Income increased primarily attributable to... an $813 million decrease in Driver payments and incentives" [Q2 FY26 10-Q, MD&A] |
| Network costs, credit-card processing, indirect advertising | FY25: $224M network-cost increase, $164M credit-card-fee increase, $105M indirect-advertising increase, all pressuring Mobility EBITDA | Headwind, scales with Gross Bookings | Mid | [FY25 10-K, MD&A] |
| Driver-classification / reclassification risk | Would force "significant price increases for Riders" if triggered | Headwind if realized | High if triggered | [FY25 10-K, Item 1A, p.11] |
| Reported Segment Operating Income margin (new metric, Q2 FY26 basis) | $2,215M / $7,363M = 30.1% (Q2 FY26) vs $1,729M / $7,288M = 23.7% (Q2 FY25) | Improving, but this basis is heavily affected by the UK revenue-recognition change noted above — not a clean like-for-like read | High optical magnitude; economic magnitude not separable from this pool | [Q2 FY26 10-Q, MD&A, p.20687–20785] |

### Segment: Delivery (33.2% of FY25 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Courier payments/incentives scaling with Delivery Gross Bookings | FY25: +$1.6B cost increase tracked Delivery GB growth (+22% trip volume) | Neutral (mechanical pass-through-like scaling, not a margin driver on its own) | High dollar size, Low net margin effect | [FY25 10-K, MD&A] |
| Employee headcount costs | FY25: +$337M | Headwind | Mid | [FY25 10-K, MD&A, p.8726] |
| Segment Operating Income margin, clean YoY (not UK-affected — UK change is Mobility-specific) | Q2 FY26: $1,055M / $5,245M = 20.1% vs Q2 FY25: $766M / $4,102M = 18.7%, a **real** +144bps improvement, not distorted by any disclosed one-off | Tailwind | Mid | [Q2 FY26 10-Q, MD&A, p.20687–20785; computed] |
| Inorganic growth (Trendyol GO, Getir, Careem-Delivery reconsolidation) | Adds integration/goodwill risk alongside revenue | Headwind risk, not yet quantified as a margin drag | Unknown | [`03_segment-map.md` §1] |
| Pending Delivery Hero acquisition | Roughly doubles addressable markets; integration through 2029 | Headwind (future), not yet in the numbers | Unknown | [`03_segment-map.md` §1] |

### Segment: Freight (9.8% of FY25 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Freight rate cycle (price per shipment) | FY25 revenue fell 1% ("challenging freight market cycle"); Q2 FY26 revenue rose 26% YoY on both higher gross-booking-per-trip AND higher trip volume — a real inflection signal, not base-effect only | Was Headwind (FY25), now Tailwind (Q2 FY26) — cycle position updated below | Low at consolidated level, High for the segment's own trajectory | "Freight Gross Bookings declined 1% year-over-year... as a result of challenging freight market cycles" [FY25 10-K, MD&A]; "Freight revenue increased primarily attributable to a 25% increase in Freight Gross Bookings due to an increase in gross booking per trip and trip volume" [Q2 FY26 10-Q, MD&A] |
| Carrier payments (near-total pass-through) | Move almost 1:1 with Freight revenue — a $322M revenue increase produced only a $2M improvement in Freight's Operating Loss in Q2 FY26 | Structural cap on margin flow-through even in a recovering cycle | High (caps upside) | "Freight Segment Operating Loss decreased primarily attributable to a $322 million increase in Freight revenue, partially offset by an $320 million increase in Freight Carrier payments" [Q2 FY26 10-Q, MD&A] |
| Segment profitability | Still loss-making: Adjusted EBITDA -0.6% of segment revenue FY25 (improved from -1.4% FY24); Segment Operating Income -$24M Q2 FY26 vs -$26M Q2 FY25 | Improving but still negative | Low (Freight is ~10% of group revenue and near-zero of group profit) | [`03_segment-map.md` §1; Q2 FY26 10-Q, MD&A] |

**Cycle-Position Rule (Freight):** Freight is the segment the external-dependency module flags as genuinely cyclical ("Freight/logistics rates — Mid" dependency, tied to the trucking spot-rate cycle) [`10_external-dependency.md` §1]. FY2025 sits at or near a cycle **trough** — revenue fell 1% and the company's own MD&A used the word "challenging" [FY25 10-K, MD&A]. Q2 FY26's +26% YoY revenue growth, driven by both price (gross booking per trip) and volume, is the first clear evidence in this pool of an **inflection off that trough** — but it is one quarter of data, margin flow-through is structurally thin (pass-through carrier payments), and the segment is still loss-making. This is **not** a normalised run-rate yet; it is labelled as an early-stage recovery signal, not a new baseline. Mobility and Delivery are demand-driven rather than commodity-cyclical in the same sense; this pool shows no evidence of either being at a demand peak — Gross Bookings and trip volumes are both still accelerating [`01_historical-financials.md` §3] — so no peak/trough label is applied to those two segments beyond the general consumer-discretionary sensitivity already flagged as "Mid" in `10_external-dependency.md`.

## 7. Margin Bridge — Latest Period

Latest reported quarter: Q2 FY26 (three months ended Jun-30-2026) vs Q2 FY25 (three months ended Jun-30-2025), the most recent YoY comparison available [Q2 FY26 10-Q, filed Aug-05-2026]. Metric: unadjusted EBITDA margin (Revenue minus the five opex lines minus D&A, then D&A added back), since Uber no longer discloses quarterly Adjusted EBITDA (Section 3). Reported change: 12.9% (Q2 FY25) → 14.7% (Q2 FY26) = **+180bps** [`01_historical-financials.md` §3].

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Cost of revenue ratio — organic (ex-UK effect) | +376 | Derived; see §7a |
| Cost of revenue ratio — UK Mobility revenue-recognition change | +132 | Derived; see §7a |
| Operations & Support ratio | −17 | [Q2 FY26 10-Q, MD&A; computed] |
| Sales & Marketing ratio (deliberate reinvestment) | −111 | [Q2 FY26 10-Q, MD&A; computed] |
| R&D ratio (headcount/SBC growth) | −71 | [Q2 FY26 10-Q, MD&A; computed] |
| G&A ratio — legal-accrual increase (one-off) | −97 | Derived; see §7a |
| G&A ratio — other (headcount, contractor growth) | −33 | Derived; see §7a |
| D&A ratio | +6 | [Q2 FY26 10-Q, MD&A; computed] |
| **Total (components)** | **+185** | Sum of the above |
| **Total margin change (reported)** | **+180** | [`01_historical-financials.md` §3] |
| **Residual / Other** | **−5** | Rounding across %-of-revenue conversions performed to 3–4 significant figures; not a further identified driver |

FX and Price/Mix (beyond the UK item above) are **not separately disclosed** for the Q2 FY26 margin bridge — Uber discloses reported-vs-constant-currency Gross Bookings growth but not a margin-level FX sensitivity [`10_external-dependency.md` §2], so those rows are marked "Not disclosed" rather than estimated.

## 7a. Bridge Attribution and Residual

**Cost of revenue ratio — UK effect (derivation):**
```
Basis: Q2 FY26 (three months ended Jun-30-2026) vs Q2 FY25, both consolidated $, both from the same
Q2 FY26 10-Q MD&A (Revenue discussion and Cost of Revenue discussion) — same document, same period,
same measurement basis, so the two disclosed dollar figures are safely combinable.

As-if revenue (removing the UK effect) = $14,191M (reported) + $1,100M (UK revenue impact, disclosed)
  = $15,291M
As-if cost of revenue (removing the UK effect) = $7,815M (reported) + $808M (UK Driver-payment
  decrease, disclosed) = $8,623M
As-if cost-of-revenue ratio = $8,623M / $15,291M = 56.39%
Actual reported cost-of-revenue ratio = $7,815M / $14,191M = 55.07%
UK effect on the ratio = 56.39% − 55.07% = 1.32pp = 132bps of the 508bps total cost-of-revenue-ratio
  improvement (7,611/12,651 = 60.15% → 7,815/14,191 = 55.07%, a −508bps move, i.e. +508bps tailwind)
  → 132bps of the 508bps tailwind (26%) is UK-driven; 376bps (74%) is organic (from combined-driver/
  courier-payment leverage on the ex-UK revenue base, the insurance trend, and Delivery/Freight
  Gross-Bookings scaling within cost of revenue — this organic remainder is not further decomposable
  from the disclosure in this pool, and is not asserted beyond "organic/other").
```
**Caveat on this UK derivation:** the $1.1B revenue impact and the $808M cost impact are both disclosed in the same MD&A section for the same UK change, but the filing does not state they are a designed 1:1 offset — a $292M gap exists between them ($1,100M − $808M). This report does **not** assume the gap nets to zero at the Mobility-segment level; Section 6 explicitly flags that a full segment-level reconciliation of the UK effect is **not achievable from this pool's disclosure**, and the CFO's own framing ("about 400 basis points is entirely related to this U.K. business model change, and it's an optical impact") is stated on the **Mobility revenue-margin (take-rate) basis**, not the consolidated cost-of-revenue-ratio basis computed above — these are two different bases and are not mixed in this report.

**G&A ratio — legal-accrual increase (derivation):**
```
Q2 FY26 10-Q MD&A: G&A "increased $266 million, or 40%... primarily attributable to a $138 million
increase in legal-related accruals and expenses" — the single largest disclosed driver of the G&A
dollar increase.
$138M / $14,191M (Q2 FY26 revenue) = 0.97% = 97bps of the G&A ratio's 130bps total headwind
  (5.29% → 6.59%) → 97bps (75%) is the one-off legal-accrual swing; 33bps (25%) is the remainder
  (headcount + contractor growth, both cited in the same MD&A passage).
```
**Reconciliation:** components sum to **+185bps**; the stated Total margin change is **+180bps**; the residual is **−5bps**, attributed to rounding across the %-of-revenue conversions and not assigned to any single named driver. This is a small residual relative to the 180bps total (≈3%), so the component breakdown above is treated as materially reconciled, not merely directionally suggestive.

**FY2025 vs FY2024 annual bridge (supporting context, not the "latest period" bridge above):** EBITDA margin moved +409bps (8.0% → 12.1%). Component check: cost-of-revenue ratio −36bps (tailwind), O&S ratio −72bps, S&M ratio −44bps, R&D ratio −53bps, G&A ratio −204bps — sum = 409bps, an **exact** reconciliation to the reported change (0bps residual) [computed from FY25 10-K, Item 7]. Within the G&A component, the $549M legal-accrual reduction alone is $549M / $52,017M = 105.5bps — **just over half (52%) of the entire 204bps G&A tailwind, and roughly a quarter (26%) of the total 409bps FY25 EBITDA-margin improvement**, is a one-off legal-reserve swing that should not be extrapolated into FY2026.

## 8. The Single Biggest Margin Driver

**SG&A and R&D headcount/investment growth outpacing revenue is the single biggest driver that would compress margins further if it continues, and it is currently pointed the wrong way for margin.** The Q2 FY26 bridge in Section 7 shows Operations & Support, Sales & Marketing, R&D, and the non-legal portion of G&A together cost **−232bps** of margin in the quarter (−17 −111 −71 −33), the largest single directional bucket in the bridge apart from the cost-of-revenue line, and unlike the cost-of-revenue improvement (which is roughly one-quarter accounting-driven and cannot repeat once the UK change annualizes), this opex growth is described by management as **deliberate** — reinvesting insurance savings into fares/incentives (S&M), and increasing headcount/SBC-linked compensation (R&D, O&S) [Q2 FY26 10-Q, MD&A]. The cost-of-revenue tailwind (+508bps gross, +376bps organic) is larger in absolute bps terms and does explain more than half of the quarter's +180bps net improvement even after removing the UK effect (376bps of 180bps is more than the whole observed change, meaning the opex growth and G&A-legal swing are what pull the net figure down from what the cost-of-revenue line alone would have delivered) — so cost of revenue is the larger tailwind, but SG&A/R&D growth is the driver most likely to reverse the improvement if management chooses to keep investing at the current pace, and it is the one lever fully within management's discretion (as demonstrated by the insurance-reinvestment decision itself).

## 9. Investment Spend — Both Signs

Uber's own reported capex is small and not running well above its own history (FY25 capex $336M vs FY24 $242M, TTM capex $308M vs prior-TTM $249M — a modest step-up, not a multiple) [`01_historical-financials.md` §1–2]. But the disclosed **~$10 billion multi-year autonomous-vehicle (AV) investment program** is far larger than any historical Uber capex or investment line and is treated here as the item this section exists to test.

| Reading | What it would show | Evidence here |
|---|---|---|
| Spend as a future COST | A P&L drag as the ~$10B lands — equity-investment write-downs/losses, and balance-sheet support (fleet ops, real estate, ~120,000 vehicle offtake commitments) converting into recognized expense or depreciation as deployment scales | CFO: "In terms of the P&L versus cash flow impacts... the closer we get to deployment and scale out, there will be a P&L impact, and we'll size that for investors clearly as we have historically done" [Q2 FY26 transcript, CFO Balaji Krishnamurthy] — an explicit, not-yet-quantified future cost; "$10 billion... investment over a multiyear period... two distinct kinds of investments: [1] equity investments in AV software partners... [2] using our balance sheet selectively to bootstrap the AV infrastructure on the ground... support for fleet ops, for real estate or for the OEMs who need some offtake commitments" [same transcript] |
| Spend as a DEMAND signal | Partner-ecosystem scale-out ahead of proven unit economics — commercial launches expanding, multiple OEM/software partners simultaneously live or approved, framed by management as building "the world's leading commercialization platform for autonomous vehicles" | "we're live in 7 cities, and we're on track to be live in 15 cities by year-end... NVIDIA release its Alpamayo open-weight model and our partners at Wayve received a permit in the U.K., and Zoox received approval to scale its robotaxi" [Q2 FY26 transcript, CEO Dara Khosrowshahi]; "for every dollar that we have invested, our partners have been able to raise an additional $2.50 from other investors" [Q2 FY26 transcript, CFO] — evidence of external capital following Uber's anchor investment, a form of market validation, though **not** a contracted-revenue backlog in the way a cloud-infrastructure order book would be |
| **Current read** | The evidence in this pool favors the **DEMAND / optionality** reading as the more informative signal **today**, because the cost side is explicitly not yet quantified or flowing through the P&L (management deferred sizing it), while the demand side has concrete, dated observables (7 cities live now, 15 targeted by year-end; named partner approvals in the same quarter). This is **not** a backlog in the AWS sense — there is no disclosed contracted-revenue figure behind the AV program, so the demand signal here is weaker evidence than a booked order book, and this report does not overstate it as one. **The observable that would flip this read:** the first quarter Uber actually discloses a quantified AV-related P&L charge (an impairment, a depreciation step-up, or a stated margin-impact figure) — at that point the cost side stops being deferred and becomes measurable, and Section 9 in the next report should re-weigh accordingly. |



---

## earnings / 04_guidance-consensus.md

_Source: `04_guidance-consensus.md`_

# Guidance & Consensus — UBER

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ Estimates Report (`UberTechnologies,IncNYSEUBEREstimatesReport.xls` — Consensus, Guidance, Surprise, Trends, Revisions, Recent Changes tabs) [Capital IQ Estimates export, data as of 2026-08-05 through 2026-08-08] |
| Data as of date | 2026-08-05 (initial post-print snapshot, embedded in the FQ2 2026 transcript header as "Consensus as of Aug-05-2026 10:04 AM GMT" [Q2 FY26 transcript, S&P Global Market Intelligence Estimates header]) through 2026-08-08 (continued intraday revisions captured in the Recent Changes tab) |
| Fiscal year basis | US GAAP, fiscal year end Dec-31 (calendar year) [Capital IQ Estimates export, Consensus tab: "Acctg. Standard: US GAAP", "Current Fiscal Year End: Dec-31-2026"] |
| Analyst count | Varies by metric: Target Price 47/47; Revenue (FQ3 2026) 36–39; EBITDA (FQ3 2026) 28–49; EPS Normalized (FQ3 2026) 28–39; EPS (GAAP, FQ3 2026) 24–31 [Capital IQ Estimates export, Consensus tab and Revisions tab] |
| Currency | USD [Capital IQ Estimates export, Consensus tab: "Currency: Reported Currency"] |
| Calendarization issue? | N — fiscal year end Dec-31 matches calendar year, no reconciliation needed |

The two `EstimatesReport.xls` files in the data pool are byte-identical duplicates (confirmed in `00_earnings-data-triage.md`); this agent treats them as one source. Two verbatim earnings-call transcripts are also in the pool (FQ1 2026, FQ2 2026), both used for management-guidance colour per Section 2.

## 2. Management Guidance

Uber's formal, numeric quarterly guidance currently covers two metrics: (adjusted) EBITDA — guided continuously since 2019 — and EPS Normalized, which the company began guiding as a distinct range only starting FQ1 2026 (no guidance values appear for this line in any prior quarter in the pool's Guidance tab). Uber does not issue formal revenue guidance; the CIQ Guidance tab's Revenue row has been blank for every quarter since FQ2 2020, consistent with the transcript record. The company also stopped issuing EBIT, Net Income (GAAP), Capex, and Free Cash Flow guidance ranges years ago (last guided in 2019, 2019, 2021, and 2023 respectively) — none of those rows carry current values.

| Metric | Period | Guidance | Type (Point / Range / Qualitative) | Source |
|---|---|---|---|---|
| EBITDA (Uber's guided metric, understood to be company-defined Adjusted EBITDA; the CIQ export line is simply labelled "EBITDA" and its definition is not independently re-stated in this pool extract — flagged per hygiene rule) | FQ3 2026 (quarter ending Sep-2026) | $2,860mm – $2,960mm (midpoint $2,910mm) | Range | [Capital IQ Estimates export, Guidance tab, guidance issued 2026-08-05] |
| EPS Normalized | FQ3 2026 | $0.84 – $0.88 (midpoint $0.86) | Range | [Capital IQ Estimates export, Guidance tab, guidance issued 2026-08-05] |
| Revenue | FQ3 2026 | Not guided | — | No formal revenue guidance issued; CIQ Guidance tab shows no revenue range for any quarter since FQ2 2020 |
| Capex | — | Not guided | — | No Capex guidance range since FY2020 (last: "$550mm–$600mm" outflow, guided 2020-05-07) |
| Free Cash Flow | — | Not guided as a range | — | No FCF guidance range since FY2022 (last guide was "0", i.e. a floor/breakeven signal, guided 2022-05-04) |
| Gross Bookings (qualitative) | FQ3 2026 | "Relatively healthy trends for delivery in the third quarter"; continued expectation the U.S. business "accelerate[s] through this year," attributed to three items: an insurance-cost tailwind being reinvested into pricing, product-innovation velocity (Reserve, U4B, Black, Wait & Save), and AV rollout | Qualitative | [Q2 FY26 transcript, prepared remarks — Dara Khosrowshahi, CEO; Balaji Krishnamurthy, CFO, Q&A] |

No specific numeric Gross Bookings guidance figure for FQ3 2026 is present anywhere in the extracted CIQ Guidance tab (it tracks EPS Normalized, Revenue, EBITDA, EBIT, Net Income GAAP, Capex, and FCF only — not Gross Bookings). Management's own historical framing is useful context: on the Q2 2026 call, the CEO stated Q2 gross bookings "grew 22% year-on-year to more than $58 billion, above the high end of our guidance and marking our fourth consecutive quarter above 20% growth" [Q2 FY26 transcript, prepared remarks]. That confirms Uber does guide gross bookings internally (and beat that guide in Q2), but the specific FQ3 2026 gross-bookings range itself is not captured in this pool's structured data — a genuine gap, not treated as "not proven," but flagged as unavailable for the guidance-vs-consensus comparison below.

## 3. Guidance vs Consensus Table

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| EBITDA | FQ3 2026 | $2,860mm – $2,960mm (midpoint $2,910mm) | $2,918.95mm (32–49 analysts) [Capital IQ Estimates export, Consensus tab, Market Summary] | +$8.95mm (+0.31% vs midpoint) | In-line — consensus sits essentially at the guidance midpoint |
| EPS Normalized | FQ3 2026 | $0.84 – $0.88 (midpoint $0.86) | $0.8632 (28–39 analysts) [Capital IQ Estimates export, Consensus tab, fiscal-quarters section] | +$0.0032 (+0.37% vs midpoint) | In-line — consensus sits essentially at the guidance midpoint |
| Revenue | FQ3 2026 | Not guided | $14,694.75mm (36–39 analysts) [Capital IQ Estimates export, Consensus tab, Market Summary] | N/A (no guidance to compare against) | No formal guidance issued |

Gap = Consensus minus Guidance midpoint. For the two metrics Uber actually guides, consensus has converged almost exactly onto the guidance midpoint (both gaps under 0.4%) — this is the literal definition of a "fair" bar for those two lines, not a stretched or discounted one.

**A material post-print drift on Revenue is worth flagging separately.** The FQ2 2026 transcript's own embedded consensus snapshot — captured at "Aug-05-2026 10:04 AM GMT," i.e. the morning of the print — showed FQ3 2026 Revenue consensus at $14,849.61mm [Q2 FY26 transcript, S&P Global Market Intelligence Estimates header]. By the time of this pool's most current pull (Aug-08-2026), that figure had fallen to $14,694.75mm — a $154.86mm (−1.04%) cut in three trading days, consistent with the Revisions-tab pattern in Section 5 below (heavy net-downward revenue revisions in the days right after the print). Since Revenue carries no formal guidance to anchor against, this drift is a pure Street sentiment signal, not a guidance gap — but it is the single largest, freshest move in the whole estimate set.

## 3A. Alt-Data Cross-Check

No external alt-data panel exists for this ticker — `data/UBER/external/` does not exist in the data pool (confirmed in `00_earnings-data-triage.md`, Section 1A). This section is omitted; its absence is not a data gap.

## 4. Estimate Revision Momentum Table

| Estimate | 3 Months Ago | 2 Months Ago | 1 Month Ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue (next Q, FQ3 2026, $mm) | 14,795.07 | 14,789.07 | 14,846.89 | 14,697.36 | Falling (recent) |
| EPS Normalized (next Q, FQ3 2026, $) | 0.86 | 0.87 | 0.87 | 0.86 | Flat |
| Revenue (current FY, FY2026, $mm) | 58,308.00 | 58,132.30 | 58,181.97 | 57,834.88 | Falling |
| EPS Normalized (current FY, FY2026, $) | 3.33 | 3.35 | 3.34 | 3.37 | Rising (modest) |
| Revenue (next FY, FY2027, $mm) — supplemental | 66,705.07 | 67,042.58 | 67,043.88 | 67,028.29 | Roughly flat |
| EPS Normalized (next FY, FY2027, $) — supplemental | 4.31 | 4.37 | 4.42 | 4.42 | Rising |
| EBITDA (current FY, FY2026, $mm) — supplemental | 11,033.97 | 11,261.16 | 11,272.84 | 11,365.18 | Rising |

[Capital IQ Estimates export, Trends tab — "1 month ago" / "2 months ago" / "3 months ago" columns, current as of the pool pull]

Revenue estimates have been cut at both the next-quarter and current-year horizon over the last three months, with the cut concentrated in the days right after the Q2 print (see Section 3). Profitability estimates (EBITDA, EPS Normalized) have moved the opposite way — modestly higher over the same window, most clearly for EBITDA (+3.0% over three months at the FY2026 level). This is a genuine divergence, not noise: the Street is trimming the top line while raising the profit line for the same company over the same period.

## 5. Revision Breadth

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue, FQ3 2026 (next Q) | 8 | 19 | −11 | Last Month (≈ Aug 5–8, 2026, the post-Q2-print / Q3-guide window) |
| Revenue, FY 2026 (current FY) | 11 | 20 | −9 | Last Month |
| EBITDA, FQ3 2026 (next Q) | 13 | 7 | +6 | Last Month |
| EBITDA, FY 2026 (current FY) | 19 | 5 | +14 | Last Month |
| EPS Normalized, FQ3 2026 (next Q) | 9 | 7 | +2 | Last Month |
| EPS Normalized, FY 2026 (current FY) | 12 | 9 | +3 | Last Month |

[Capital IQ Estimates export, Revisions tab, "Last Month" section]

Over the slightly longer "Last 3 Months" window the pattern is similar but less lopsided on Revenue (FQ3 2026: 16 up / 18 down; FY2026: 24 up / 19 down) and more strongly positive on EBITDA (FQ3 2026: 20 up / 3 down; FY2026: 28 up / 0 down) [Capital IQ Estimates export, Revisions tab, "Last 3 Months" section]. The direction is consistent across both windows: Revenue revisions skew negative, profitability revisions skew positive, and the skew is sharpest in the freshest (Last Month) window — i.e. it intensified right around this print, it did not fade.

One likely structural driver of the EPS-specific (though not EBITDA-specific) softness in upward breadth: the Street's Effective Tax Rate assumption for FQ3 2026 has risen from 16.77% three months ago to 18.94% currently, and the FY2026 assumption has risen from 9.5% twelve months ago to 20.77% currently [Capital IQ Estimates export, Trends tab and Consensus tab, Effective Tax Rate % row]. A rising tax-rate assumption eats into EPS upside even where EBITDA estimates are being raised — consistent with EPS Normalized revision breadth (+2 to +3, barely positive) being far weaker than EBITDA revision breadth (+6 to +14) over the identical window.

## 6. Historical Beat / Miss Pattern

| Period | Revenue Beat/Miss | EPS (Normalized) Beat/Miss | Magnitude | Notes |
|---|---|---|---:|---|
| Q3 FY25 (Sep-2025) | Beat | Miss | Rev +1.55% ($13,467mm vs $13,261.49mm est.); EPS Norm. −25.4% ($0.6468 vs $0.8676 est.) | EBITDA landed inside its own guided range ($2,190–2,290mm; actual $2,256mm, +0.71% vs midpoint). GAAP EPS beat by +350.7% (one-off equity-stake gain) — the Normalized-EPS miss was driven by items below the EBITDA line, not core operating execution [Capital IQ Estimates export, Surprise tab; Q2 FY26 transcript, embedded S&P estimates table] |
| Q4 FY25 (Dec-2025) | Beat | Miss | Rev +0.30% ($14,366mm vs $14,322.67mm est.); EPS Norm. −10.1% ($0.71 vs $0.7854 est.) | EBITDA landed inside its own guided range ($2,410–2,510mm; actual $2,487mm, +1.10% vs midpoint), near the high end. GAAP EPS missed by −82.1% (one-off item), the mirror image of Q3's pattern [Capital IQ Estimates export, Surprise tab; Q2 FY26 transcript, embedded S&P estimates table] |
| Q1 FY26 (Mar-2026) | Miss | Beat | Rev −0.45% ($13,203mm vs $13,262.69mm est.); EPS Norm. +4.31% ($0.72 vs $0.6933 est.) | First quarter EBITDA cleared ABOVE the top of its own guided range ($2,370–2,470mm; actual $2,481mm, +2.52% vs midpoint, +$11mm above the high end). This is also the first quarter Uber issued a formal EPS Normalized guide (0.65–0.72) — actual landed exactly at the top of that range. GAAP EPS missed −81.7% (one-off item) [Capital IQ Estimates export, Surprise tab and Guidance tab; Q2 FY26 transcript, embedded S&P estimates table] |
| Q2 FY26 (Jun-2026) | Miss | Beat | Rev −0.52% ($14,191mm vs $14,265.78mm est.); EPS Norm. +1.25% ($0.81 vs $0.8046 est.) | Second straight quarter EBITDA cleared ABOVE the top of its own guided range ($2,700–2,800mm; actual $2,819mm, +2.51% vs midpoint, +$19mm above the high end). GAAP EPS beat +41.0% this quarter (favourable one-off) [Capital IQ Estimates export, Surprise tab and Guidance tab; Q2 FY26 transcript, prepared remarks: "Gross bookings grew 22% year-on-year... above the high end of our guidance"] |

**Reported (GAAP) EPS is not usable for a beat/miss read on its own** — it has swung from +350.7% to −82.1% to −81.7% to +41.0% over these four quarters, almost certainly driven by mark-to-market movements in Uber's equity stakes (Aurora, Didi, Grab, Joby, and similar), which the company itself separates out in its non-GAAP reconciliation. EPS Normalized is the cleaner series and is used for the beat/miss and bar calls in this report.

**The pattern that matters for the bar going forward:** EBITDA has beaten its own guidance in all four of the last four quarters, and — critically — has beaten ABOVE the guided high end in each of the last two (Q1 and Q2 FY26), by a consistent ~2.5% over the guided midpoint both times. Revenue has flipped from small beats (Q3/Q4 FY25, +0.3% to +1.6%) to small misses (Q1/Q2 FY26, −0.5%) against consensus (there being no formal revenue guide to measure against). EPS Normalized has flipped from large misses (driven by below-the-line items, not core execution) to small beats over the same window, coinciding with Uber's decision to start guiding EPS Normalized as its own range beginning Q1 FY26.

## 7. Bar Assessment

**Bar is fair.**

For the two metrics Uber actually guides — EBITDA and EPS Normalized — the current Street consensus for FQ3 2026 sits within roughly 0.3–0.4% of the guidance midpoint in both cases (Section 3). That is the textbook definition of an in-line bar: analysts have simply adopted management's own guided range as their base case, neither discounting it (bar low) nor stretching above it (bar high).

Two secondary signals complicate a pure "fair" call and are worth weighing directly, because they point in opposite directions and neither is decisive on its own:

- **A tailwind for beat odds on EBITDA/EPS:** the company has now beaten its own EBITDA guidance in four straight quarters, and beaten ABOVE the guided high end in the last two by a near-identical ~2.5% margin each time (Section 6). Consensus is set at the guidance midpoint, not at a "beat-adjusted" level that reflects this streak — so if the pattern holds a third straight quarter, the guided range itself, not just consensus, would likely be cleared again. This is evidence-based streak continuation, not a guarantee (a two-quarter streak is a short base rate), but it tilts the odds toward another EBITDA/EPS beat rather than a miss.
- **A headwind for beat odds on Revenue:** Revenue carries no formal guidance to anchor against, and the freshest revision data (the three days immediately following the Q2 print and Q3 guide) shows a clear net-downward skew — 8 up vs. 19 down at the FQ3 2026 level, 11 up vs. 20 down at the FY2026 level (Section 5) — alongside a −1.04% cut in the specific FQ3 2026 revenue consensus number itself since the morning of the print (Section 3). Revenue has also missed (very narrowly, under 0.6%) consensus in each of the last two reported quarters. None of this points to a stretched ("high") bar in the sense of consensus sitting meaningfully above where the company is likely to land — the misses have been small — but it does argue against calling the revenue bar "low."

Net: this is not a single clean signal in one direction, so "fair" is the correct call for the guided metrics that anchor this section, with the qualifier that the profitability line (EBITDA/EPS) carries a modest continuation-of-streak beat tilt while the revenue line carries a modest continuation-of-trend miss tilt (both small, single-digit-percent in magnitude, not the kind of gap that would justify "low" or "high" outright).



---

## earnings / 05_beat-miss-setup.md

_Source: `05_beat-miss-setup.md`_

# Beat / Miss Setup — UBER

## 1. Next Quarter Context

The next print covers FQ3 2026 (quarter ended Sep-30-2026), expected to report in early November 2026. Q3 is a moderate seasonal quarter — third-largest of four (25.4–25.9% of annual revenue over the last three fiscal years, behind Q4's 27.2% average) [`01_historical-financials.md` §5]. Consensus is essentially pinned to management's own guidance for the two metrics Uber formally guides: EBITDA consensus $2,918.95mm vs guided midpoint $2,910mm (+0.31%), and EPS Normalized consensus $0.8632 vs guided midpoint $0.86 (+0.37%) — both within 0.4% of the guide, the textbook definition of a "fair" bar [`04_guidance-consensus.md` §3, §7]. Revenue carries no formal guidance; consensus is $14,694.75mm, down 1.04% in the three trading days after the Q2 print [`04_guidance-consensus.md` §3].

## 2. Beat Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| EBITDA / EPS Normalized clears the guided high end for a third straight quarter | Driver/Courier/Carrier payments (cost of revenue), the largest cost line at 55–61% of revenue | Genuine (ex-UK-reclassification) cost-of-revenue leverage repeats the +377bps Q2 pattern; no offsetting G&A/legal-accrual reversal | Mid | EBITDA has beaten its own guidance 4/4 quarters and cleared ABOVE the guided high end in the last two (Q1, Q2 FY26) by a near-identical ~2.5% each time; the two quarters before that were smaller within-range beats (+0.71%, +1.10%), so the "above high end" pattern is a short, 2-quarter base rate [`04_guidance-consensus.md` §6; `03_margin-drivers.md` §8a] |
| Gross Bookings / trip volume sustains >20% constant-currency growth | Trip volume (Gross Bookings) — the single biggest revenue driver per `02_revenue-drivers.md` §7 | US sparse-market penetration, insurance-cost tailwind reinvested into fares, and product innovation (U4B +40% YoY) continue converting into trip growth | Mid | Four consecutive quarters of Gross Bookings growth above 20% constant currency; MAPCs +16% YoY; management's own qualitative FQ3 framing reaffirms the US business "accelerate[s] through this year" [`02_revenue-drivers.md` §4; `04_guidance-consensus.md` §2] |
| Freight segment cyclical inflection continues, narrowing the segment loss further | Freight market cycle | Gross booking per trip AND trip volume both keep improving off the FY2025 trough | Low–Mid | Q2 FY26 Freight Gross Bookings +25% constant currency after FY2025's −1% ("challenging freight market cycle"); only one quarter of confirmed inflection, and Freight is 11.2% of revenue — small consolidated impact even if it beats [`02_revenue-drivers.md` §5 Freight; `03_margin-drivers.md` §7 Freight] |
| Delivery organic growth and high-margin advertising revenue outrun the M&A drag | Delivery segment — organic growth + advertising | Advertising revenue keeps growing without a matching Gross Bookings increase (+$182M in Q2 alone) and organic delivery growth (ex-M&A) stays "accelerating" as management describes it, offsetting the Trendyol Go lap | Mid | Delivery Segment Operating Income grew faster than revenue in Q2 (+38% vs +28%); CFO says the company "gained category position in all of our large markets" — a company-reported, not independently verified, claim [`02_revenue-drivers.md` §5 Delivery; `03_margin-drivers.md` §7 Delivery] |

## 3. Miss Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Revenue misses consensus for a third straight quarter | UK Mobility business-model reclassification + take-rate/mix compression | The recurring ~$1.1bn/quarter UK revenue drag (persists until it laps Q1 FY27) combines with continued Delivery/Freight mix shift toward lower-take-rate revenue, and underlying trip growth cools faster than the recent >20% streak suggests | Mid–High | Revenue missed consensus narrowly in the last two quarters (−0.45%, −0.52%); FQ3 2026 revenue consensus itself was cut 1.04% in the three trading days after the Q2 print; net revision breadth over the last month is −11 at the FQ3 level (8 up / 19 down) [`04_guidance-consensus.md` §3, §4, §5] |
| G&A / legal-accrual line swings unfavorably again | G&A cost line | A new or larger legal-related accrual/settlement lands in Q3, mirroring the Q2 FY26 swing (which cost 97bps of EBIT margin after helping FY2025 by 106bps) | Mid | Flagged in `03_margin-drivers.md` §8a as "the single most unpredictable swing item in the cost stack" — the identical line item moved margin favorably by ~106bps in FY2025 and unfavorably by ~97bps the very next comparable quarter, and should not be extrapolated in either direction |
| Driver/Courier incentive costs rise to defend supply | Cost of revenue — the largest single cost line | Competitive pressure forces Uber to raise driver/courier incentives, reversing the genuine ex-UK cost improvement seen in Q2 (+377bps) | Low–Mid | `business-model/06_value-chain.md` flags this as an active risk ("we may need to increase… Driver incentives… without adversely affecting… supply liquidity"); currently a tailwind, but this is the single largest lever if it reverses [`03_margin-drivers.md` §9] |
| Rising tax-rate assumption compresses EPS Normalized even if EBITDA holds | Effective tax rate (below EBITDA, above EPS Normalized) | Consensus tax-rate assumption keeps climbing, as it has for three straight months | Mid | Street's FQ3 2026 effective tax rate assumption rose from 16.77% three months ago to 18.94% currently; EPS Normalized revision breadth (+2 to +3) is far weaker than EBITDA revision breadth (+6 to +14) over the same window — a structural EPS-specific headwind even where EBITDA is being raised [`04_guidance-consensus.md` §5] |

## 4. What Magnitude Matters?

| Metric | Consensus / Bar | Material Beat Threshold | Material Miss Threshold | Why |
|---|---:|---:|---:|---|
| Revenue | $14,694.75mm (no formal guidance) | >+2% vs consensus (>$14,988.6mm) | >−2% vs consensus (<$14,400.8mm) | The last four quarters' surprises ranged from −0.52% to +1.55% — a move beyond ±2% would exceed the entire recent observed range and signal a genuine change in trip-volume trend, not just the known UK-reclassification optical drag [`04_guidance-consensus.md` §6] |
| EBITDA | Guided $2,860–2,960mm (midpoint $2,910mm); consensus $2,918.95mm | >$2,960mm (above guided high end, continuing the 3rd straight above-high-end quarter) | <$2,860mm (below guided low end, breaking the 4-quarter guidance-beat streak) | Clearing the guided range's own high end is now the market's revealed bar after two straight quarters of doing so by ~2.5%; falling below the low end would be a first in the trailing four quarters [`04_guidance-consensus.md` §6] |
| EPS (Normalized) | Guided $0.84–0.88 (midpoint $0.86); consensus $0.8632 | >$0.88 (above guided high end) | <$0.84 (below guided low end) | Same guided-range logic as EBITDA; GAAP EPS is excluded from this test because it is dominated by non-operating equity-stake mark-to-market swings, not operating results [`01_historical-financials.md` §3; `04_guidance-consensus.md` §6] |
| Guidance (forward, i.e. the Q4 FY26 guide issued alongside this print) | No FQ4 numeric guide exists yet | A Q4 EBITDA guide implying a margin step-up consistent with Q4's historical seasonal strength (FY2025 Q4 EBITDA margin 13.7%) | A Q4 guide flat-to-down vs Q3, or one that introduces a specific, negative AV-investment P&L dollar figure for the first time | Q4 is seasonally the largest and highest-margin quarter in three years of data; a guide that fails to reflect that pattern, or that lands the first quantified AV cost hit flagged in `03_margin-drivers.md` §10, would be read as a genuine deceleration signal, not noise |

## 5. In-Line Print But Bad Guidance Risk

| Risk | Evidence | Why It Matters |
|---|---|---|
| In-line or beat current quarter but Q4 guide fails to show normal seasonal step-up | Q4 has averaged 27.2% of annual revenue and the highest EBITDA margin of any quarter (13.7% in FY2025) over the last three fiscal years [`01_historical-financials.md` §5] | A flat-to-Q3 Q4 guide would break a consistent three-year seasonal pattern and would likely be read as a genuine slowdown, not seasonality |
| Beat EBITDA/EPS but the forward guide embeds the first quantified AV-investment P&L cost | CFO on the $10bn AV program: "the closer we get to deployment and scale out, there will be a P&L impact, and we'll size that for investors clearly as we go" — no dollar or bps figure disclosed yet [`03_margin-drivers.md` §10] | The market currently reads the AV spend as a demand signal (external co-investment, live trip volume) rather than a cost; the first quantified cost figure would flip that read and could depress the forward margin outlook even on a beat quarter |
| Beat GAAP EPS due to one-off equity-stake mark-to-market gains, not operating quality | GAAP EPS swung +350.7%, −82.1%, −81.7%, +41.0% surprise over the last four quarters, driven by non-operating equity-stake gains/losses (Aurora, Didi, Grab, Joby); EPS Normalized is the cleaner series [`01_historical-financials.md` §3; `04_guidance-consensus.md` §6] | A GAAP EPS "beat" read at face value without separating out the mark-to-market swing would be a false-quality signal — the operating trend is better read from EBITDA/EBIT/EPS Normalized |
| Beat on the guided metrics but G&A/legal-accrual line reverses in the forward guide | The identical G&A legal-accrual line swung +106bps favorable in FY2025 then −97bps unfavorable in Q2 FY26 — "should not be extrapolated in either direction" [`03_margin-drivers.md` §8a] | A beat this quarter says nothing about whether the next quarter's G&A line repeats or reverses; the forward guide could embed a fresh negative swing even after a clean Q3 beat |

## 6. Seasonality Read

Q3 is a moderate, not a peak, seasonal quarter: it has averaged 25.4% of annual revenue over the last three fiscal years, ahead of Q1 (23.0%) and Q2 (24.5%) but behind Q4 (27.2%) [`01_historical-financials.md` §5]. Margin seasonality within Q3 has actually been softer than Q2 in the one comparable year with clean data: FY2025 Q3 EBITDA margin was 9.7%, down from Q2 FY2025's 12.9%, before recovering to 13.7% in Q4 [`01_historical-financials.md` §5]. Uber's own FQ3 2026 guided EBITDA range ($2,860–2,960mm) is roughly flat to modestly up versus the actual Q2 FY2026 print ($2,819mm) rather than assuming a big sequential step-up, which is broadly consistent with this softer historical Q3 seasonal pattern already being reflected in the guide. Net: seasonality is a mild, already-priced-in factor here — it neither meaningfully helps nor hurts the setup, since the guided range appears to already account for the typical Q3 softening.

## 7. Historical Pattern

Uber has beaten its own EBITDA guidance in all four of the last four quarters, and cleared ABOVE the guided high end in the last two (Q1, Q2 FY26) by a nearly identical ~2.5% each time — a real but short (two-quarter) pattern, following two more modest within-range beats in Q3/Q4 FY25 (+0.71%, +1.10%) [`04_guidance-consensus.md` §6]. Revenue has flipped from small beats against consensus in Q3/Q4 FY25 (+0.3% to +1.6%) to small misses in Q1/Q2 FY26 (around −0.5%), a trend partly explained by the known, mechanical UK reclassification but reinforced by the post-print downward revision skew this quarter [`04_guidance-consensus.md` §6]. EPS Normalized flipped from large misses (driven by below-the-EBITDA-line items) to small beats, coinciding with Uber starting to guide the metric as its own range in Q1 FY26. GAAP EPS is not usable as a pattern at all given its non-operating mark-to-market swings. The synthesizer should weight the EBITDA/EPS Normalized beat pattern moderately-to-highly (it is mechanistically explained by a genuine, quantified cost-of-revenue improvement, not just noise) but should weight the "above guided high end" magnitude specifically as a short, two-quarter sample, not yet a fully proven new normal.

## 8. Setup Verdict

**Setup favors beat.**

The single most important factor is the EBITDA/EPS Normalized guidance-beat streak: Uber has beaten its own guidance in 4 of the last 4 quarters and cleared the guided high end in the last 2 by a near-identical ~2.5%, backed by a genuine, quantified cost-of-revenue improvement (+377bps ex-UK in Q2 FY26) rather than a one-off [`03_margin-drivers.md` §8a; `04_guidance-consensus.md` §6]. The single biggest risk that could flip this verdict is a third straight revenue miss against consensus — revenue estimates were cut 1.04% in the three trading days after the Q2 print with net revision breadth of −11, and a wider-than-expected miss (beyond the ±0.5% range of the last two quarters) would likely dominate headline market reaction even if EBITDA/EPS clear their guided ranges again [`04_guidance-consensus.md` §3, §5].

## 9. Second-Quarter Look-Ahead

The quarter after next, Q4 FY2026, is seasonally the strongest of the year (27.2% average revenue share, historically the highest EBITDA margin quarter) [`01_historical-financials.md` §5], which should help the setup mechanically. Two offsetting factors are already visible: the UK reclassification drag will still be in the year-over-year comparison (it does not lap until Q1 FY27), so reported revenue optics stay suppressed, while the Trendyol Go M&A headwind to Delivery should normalize by Q4 per management [`02_revenue-drivers.md` §4]. There is no visibility yet on the specific numeric Q4 guide (Uber guides only one quarter forward at a time), and the AV-investment P&L cost — not yet quantified — is the wildcard that could first surface in that guide.

## 10. Pre-Mortem

If this "favors beat" setup fails, the most likely reason is that the revenue miss widened materially beyond the narrow (under 0.6%) misses of the last two quarters — either because the UK reclassification effect or the underlying trip-volume deceleration (YoY growth already cooled from the high-teens FY2023–2025 run-rate to +14.5% and +12.2% in the last two quarters, per `01_historical-financials.md` §6) proved larger than the guided-metric beat streak could offset in the market's read, or because the volatile G&A/legal-accrual line swung unfavorably again and ate into the EBITDA beat itself.



---

## earnings / 06_earnings-quality.md

_Source: `06_earnings-quality.md`_

# Earnings Quality — UBER

Reporting standard: US GAAP. Reporting currency: USD, $ millions unless noted. Fiscal year end: December 31 [FY25 10-K, cover page]. This report reads `01_historical-financials.md` as its baseline and independently re-derives the cash-flow bridge and working-capital metrics from the primary filing and Capital IQ export data.

## 1. EBITDA → CFO → FCF Bridge (5 years, FY2021–FY2025)

"EBITDA" below is the unadjusted measure used in upstream `01_historical-financials` (income from operations + total depreciation & amortization) — it is NOT Uber's company-defined "Adjusted EBITDA" (see Section 4). "Working capital change" and "Other operating items" are derived, not filed, line items — see the note beneath the table for the exact derivation and what each absorbs.

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA (unadjusted) | (2,932) | (885) | 1,933 | 3,536 | 6,312 | Inflecting |
| Working capital change | 1,682 | 335 | 165 | 2,374 | 2,227 | Volatile, consistently positive |
| Tax paid (cash) | (87) | (175) | (234) | (324) | (345) | Rising |
| Interest paid (cash) | (449) | (513) | (629) | (475) | (386) | Improving |
| Other operating items (derived residual — see note) | 1,341 | 1,880 | 2,350 | 2,026 | 2,291 | Stable, rising with SBC |
| **CFO** | (445) | 642 | 3,585 | 7,137 | 10,099 | Inflecting |
| Maintenance capex | Not split — see note | | | | | |
| Growth capex | Not split — see note | | | | | |
| Total capex | (298) | (252) | (223) | (242) | (336) | Stable |
| **FCF (CFO − Total Capex)** | (743) | 390 | 3,362 | 6,895 | 9,763 | Inflecting |
| **CFO / EBITDA %** | n/m (EBITDA negative) | n/m (EBITDA negative) | 185.4% | 201.8% | 160.0% | Consistently well above 100% |

**Capex split not disclosed — total capex used.** Uber does not break out maintenance vs. growth capex in the filings in this pool. Capex is small relative to revenue in every year (≤0.7% of revenue), so this omission has limited effect on the FCF read for this business — unlike a capital-intensive business, capex is not the swing factor here. [FY25 10-K, Item 8, Consolidated Statements of Cash Flows; CIQ Financials_Annual.xls → Cash Flow]

**Derivation note (so the bridge reconciles).** "Working capital change" = Change in Accounts Receivable + Change in Accounts Payable + Change in Other Net Operating Assets, as filed in the cash-flow statement [CIQ Financials_Annual.xls → Cash Flow]. "Tax paid" and "Interest paid" are the company's own supplemental cash-flow disclosures [CIQ Financials_Annual.xls → Cash Flow, "Cash Taxes Paid" / "Cash Interest Paid" rows; cross-checked to FY25 10-K cash-flow statement]. "Other operating items" is a derived plug (= CFO − EBITDA + Tax paid + Interest paid − Working capital change) because EBITDA (an operating-income-based measure) and CFO (a net-income-based measure) bridge through several non-operating and non-cash items that Capital IQ's export does not itemize consistently across years — stock-based compensation (the largest single item: SBC was $1,168M FY21 → $1,793M FY22 → $1,935M FY23 → $1,796M FY24 → $1,826M FY25), reversal of non-cash mark-to-market gains/losses on equity investments (Aurora, Didi, Grab, Lucid, Waabi — see Section 8), and reversal of the large non-cash deferred-tax benefit described in Section 5. This residual is not proven to decompose further from the data in this pool and is flagged as a derived figure, not silently used. [Computed from CIQ Financials_Annual.xls → Cash Flow; FY25 10-K, Item 8]

**Lead figure — normalised operating FCF equals reported FCF here (§15 check).** Uber's disclosed "Free cash flow" is CFO − capex with no company-defined add-back (interest/dividends received) and no single disclosed one-off cash item inflating it — FY2025 FCF of $9,763M (company-reported $9,763M matches) [FY25 10-K, Item 7, Highlights table]. There is nothing to normalise out of FCF itself. The one caveat worth carrying forward (not a headline adjustment, but a directional note): a meaningful share of the FY2024–FY2025 "Other Net Operating Assets" working-capital inflow is the growth in accrued insurance reserves (an actuarial liability, not a trading payable) — see Section 3 and Section 6. This is a genuine, recurring feature of Uber's captive-insurance funding model, not a one-off, so it is not stripped out of the lead FCF figure — but its judgment-based nature is flagged.

## 2. Cash Conversion Assessment

CFO has tracked, and in fact outpaced, unadjusted EBITDA in every profitable year on record: CFO/EBITDA was 185.4% in FY2023, 201.8% in FY2024, and 160.0% in FY2025 — all far above the 70% "healthy" threshold and above 100%, meaning cash generation is stronger than the accounting operating-profit trend, not weaker [computed from CIQ Financials_Annual.xls → Income Statement/Cash Flow]. Measured against the company's own "Adjusted EBITDA" instead (a like-for-like non-GAAP comparison), CFO/Adjusted EBITDA was 110.1% in FY2024 ($7,137M / $6,484M) and 115.7% in FY2025 ($10,099M / $8,730M) [FY25 10-K, Item 7] — still comfortably above 100%. The driver is a structurally negative working-capital cycle (Section 3) plus a growing insurance-reserve float (Section 6), not aggressive revenue recognition. CFO/EBITDA has NOT been below 50% in any of the last three years — the reverse is true — so this is not a cash-conversion breakdown.

## 3. Working Capital Trends

Uber has no inventory (an asset-light marketplace/platform business — no "Inventory" line appears anywhere in the balance sheet) [CIQ Financials_Annual.xls → Balance Sheet], so DIO is not applicable. DSO is computed on trade "Accounts Receivable" rather than Capital IQ's "Total Receivables" line, because "Total Receivables" (AR + "Other Receivables") shows a reclassification break starting FY2024 — "Other Receivables" (~$700–720M in FY2021–FY2023) reports as a dash from FY2024 onward, most likely reclassified into another balance-sheet bucket rather than genuinely eliminated — a Capital IQ presentation artifact, not a real balance-sheet event; using the consistent trade-AR-only series avoids that break. [CIQ Financials_Annual.xls → Balance Sheet]

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 30.3 | 28.0 | 25.1 | Improving | Low |
| Inventory days (DIO) | N/A | N/A | N/A | N/A — no inventory (service/platform business) | N/A |
| Payable days (DPO) | 12.3 | 11.3 | 10.9 | Declining | Low — not a liquidity-stretch signal since it is falling, not rising |
| Cash conversion cycle (DSO + DIO − DPO) | 17.9 | 16.7 | 14.2 | Improving (shrinking) | Low |

**Formulas and basis:** DSO = 365 × average Accounts Receivable ÷ Revenue; DPO = 365 × average Accounts Payable ÷ Cost of revenue, exclusive of D&A (the company's own COGS line — FY2023 $22,457M, FY2024 $26,651M, FY2025 $31,338M [FY25 10-K, Item 8, Consolidated Statements of Operations]); average balances = (opening + closing)/2. None of the flag thresholds trip: DSO is falling, not rising >10% YoY; DIO is not applicable; DPO is falling, not rising sharply.

**Classification caveat on DPO.** Uber's formal "Accounts Payable" balance ($728M FY2022 → $1,013M FY2025) is small relative to cost of revenue because driver and courier payments (the bulk of cost of revenue) are settled through frequent, sometimes near-instant, payouts rather than sitting in a trade-payables balance — a large share of the corresponding liability instead sits in "Accrued Exp." ($5,827M FY2023 → $6,357M FY2024 → $7,842M FY2025 per CIQ Financials_Annual.xls → Balance Sheet), which commingles driver payables with legal reserves, compensation accruals, and other items and cannot be cleanly decomposed from this pool. DPO computed strictly on formal Accounts Payable therefore understates the true float from cost-of-revenue-related liabilities; it is reported per the standard formula with this caveat stated rather than adjusted informally.

## 4. Non-GAAP Adjustments

| Adjustment | Amount (FY2025) | Recurring? (Y/N) | Concern Level (Low/Mid/High) | Evidence |
|---|---:|---|---|---|
| Stock-based compensation (SBC) add-back | $1,826M | Y — recurs every year ($1,168M FY21 → $1,935M FY23 → $1,826M FY25) | Mid — well-disclosed, but a real recurring dilution cost equal to ~3.5% of FY2025 revenue, excluded entirely from Adjusted EBITDA | [FY25 10-K, Item 7, Adjusted EBITDA reconciliation] |
| Legal, non-income tax, and regulatory reserve changes and settlements | $564M (down from $1,123M FY2024) | Y — present in both disclosed years, at material size in both | High — added back as if non-recurring, but recurs every year the company discloses; see Section 5 | [FY25 10-K, Item 7, Adjusted EBITDA reconciliation] |
| Goodwill/asset impairments, loss on sale of assets, net | $2M | Y (small, recurs) | Low — immaterial size | [FY25 10-K, Item 7] |
| Acquisition, financing and divestiture-related expenses | $43M | Y (recurs; up from $25M FY2024) | Low — small, ties to disclosed active M&A pipeline (e.g. Getir food-delivery deal) | [FY25 10-K, Item 7; Item 8, Subsequent Events] |
| Loss on lease arrangement, net | $2M | Y (small, recurs) | Low | [FY25 10-K, Item 7] |
| Restructuring and related charges | $9M (down from $25M FY2024; $236M FY2023 merger-related; $362M FY2020) | Y — periodic but recurring across the last five fiscal years | Low–Mid — small in FY2024–FY2025, but the pattern shows this line has appeared in most years, undercutting the "one-off" framing when it recurs | [FY25 10-K, Item 7; FY25 10-K Income Statement, "Merger & Related Restruct. Charges" FY2023; CIQ Financials_Annual.xls → Income Statement] |

Total non-D&A add-backs from Income from Operations to Adjusted EBITDA were $2,446M in FY2025 (SBC $1,826M + Legal/regulatory $564M + Impairment $2M + Acquisition-related $43M + Lease $2M + Restructuring $9M) [FY25 10-K, Item 7] — this is 43.9% of Income from Operations ($5,565M) and exceeds the 15% materiality threshold by a wide margin. SBC alone is the largest component in every year disclosed.

**Disclosure-reduction flag.** Uber stopped presenting company-level "Adjusted EBITDA" as a headline non-GAAP metric starting with the Q1 FY2026 10-Q — the term appears zero times in either the Q1 FY2026 or Q2 FY2026 earnings-call transcripts (full-text search) [Q1 FY26 Earnings Call, May-06-2026; Q2 FY26 Earnings Call, Aug-05-2026], and the segment profit measure changed from "Segment Adjusted EBITDA" to "Segment Operating Income" effective Q1 FY2026, with prior-period figures recast [Q1 FY26 10-Q, MD&A]. Free cash flow continues to be disclosed. This is a real reduction in like-for-like margin visibility going into FY2026, flagged for the earnings-synthesis and consensus modules.

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification (Genuine / Suspicious / Recurring "one-off") | Evidence |
|---|---|---:|---|---|
| Deferred-tax-asset valuation-allowance release — Netherlands DTAs | FY2025 | $5.0B benefit, flowing through the reported $4,346M net income-tax benefit | Genuine one-time non-cash tax event, but classified here as a "recurring one-off" at the P&L level because a materially similar event occurred the prior year too (see next row) — the pattern of large annual DTA releases means GAAP net income/EPS should not be extrapolated on a 2-year trend without stripping this out | [FY25 10-K, Item 8, Income Tax Note, p. re Netherlands valuation allowance; FY25 10-K, Item 7, Highlights, "$5.0 billion benefit from the release of our Netherlands' deferred tax assets valuation allowance"] |
| Deferred-tax-asset valuation-allowance release — US federal & state DTAs | Q4 FY2024 | $6.4B release, contributing to the reported $5,758M net FY2024 income-tax benefit | Genuine one-time non-cash tax event; two consecutive fiscal years with a multi-billion-dollar release is the single biggest earnings-quality issue in this report (Section 10) | [FY25 10-K, Item 8, Income Tax Note: "release of $6.4 billion of our valuation allowance of certain U.S. federal and state deferred tax assets in the fourth quarter of 2024"] |
| Legal, non-income tax, and regulatory reserve changes and settlements | FY2024–FY2025 | $1,123M (FY2024), $564M (FY2025) | Recurring "one-off" — added back to Adjusted EBITDA as non-recurring in both disclosed years; see Section 4 | [FY25 10-K, Item 7, Adjusted EBITDA reconciliation] |
| Unrealized mark-to-market losses/gains on equity investments (Aurora, Lucid, Didi, Waabi, Grab) | FY2025 | Net $97M pre-tax unrealized loss (a $802M Aurora loss and $155M Lucid loss, partly offset by $409M Didi gain, $179M Waabi gain, $145M Grab gain) | Genuine but recurring volatility — this line has swung from a $7,227M loss (FY2022) to a $1,536M gain (FY2023) to (per MD&A) a roughly $1.8B unrealized gain (FY2024) to a $97M net loss (FY2025); excluded from Adjusted EBITDA but a real, recurring source of GAAP net-income noise | [FY25 10-K, Item 7, Highlights; FY25 10-K, Item 7, FY2025 CFO discussion re "$1.8 billion of unrealized gains from equity securities" in FY2024; CIQ Financials_Annual.xls → Income Statement, "Gain (Loss) On Sale Of Invest." row] |
| Foodpanda Taiwan termination fee settlement | FY2025 | Disclosed as a partial offset within the working-capital cash-flow discussion; exact dollar amount not separately quantified in the MD&A text in this pool | Genuine one-off, small relative to the $10.1B FY2025 CFO | [FY25 10-K, Item 7, FY2025 CFO discussion, "partially offset by the settlement of the Foodpanda Taiwan termination fee"] |

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | N | Revenue +18.0% (FY2024) / +18.3% (FY2025) vs. CFO +99.1% (FY2024) / +41.5% (FY2025) — CFO has grown far faster than revenue in both years [computed from CIQ Financials_Annual.xls] |
| Receivables growing faster than revenue | N | Trade AR fell −2.1% in FY2024 (vs. +18.0% revenue) and grew +14.8% in FY2025 (vs. +18.3% revenue) — receivables have grown slower than revenue in both years, consistent with the declining DSO in Section 3 [CIQ Financials_Annual.xls → Balance Sheet] |
| Inventory growing faster than COGS | N/A | No inventory — asset-light platform business [CIQ Financials_Annual.xls → Balance Sheet] |
| Deferred revenue declining (if subscription/contract business) | N/A | Uber is not primarily a subscription/contract-liability business at the consolidated level; no material deferred-revenue / contract-liability balance is disclosed as a separate balance-sheet line in this pool. Not proven from available data as a material metric here |
| Capitalized costs growing as % of revenue | Y | Net capitalized internal-use software rose from $650M (FY2024) to $820M (FY2025), +26.2%, vs. revenue growth of +18.3% — a real but small-base divergence (net internal-use software is ~1.6% of FY2025 revenue) [FY25 10-K, Item 8, Property and Equipment Note] |
| Frequent accounting policy changes | N | No restatement, no material weakness, and no GAAP accounting-policy change disclosed in the FY2025 10-K's risk factors or internal-controls sections [FY25 10-K, Item 9A]. The Adjusted EBITDA → Segment Operating Income presentation change (Section 4) is a non-GAAP metric/disclosure change, not a GAAP accounting-policy change, and prior periods were recast for comparability [Q1 FY26 10-Q, MD&A] — noted separately as a transparency concern, not scored here as a policy-change flag |

Only 1 of the 6 rows above is triggered Y (capitalized costs), which is below the 2-row threshold — **`RF-EQ-001 (rising accruals divergent from cash earnings)` is NOT triggered.** Accrual quality on the standard tests is clean: cash generation is outrunning both revenue and receivables growth, and there is no inventory or deferred-revenue distortion to assess.

**Separate judgment-based item worth flagging (not one of the six standard rows, but material to accrual quality):** short- and long-term insurance reserves — an actuarial estimate for Uber's self-insurance/captive-insurance program — grew from $9,796M (FY2024: $2,754M short-term + $7,042M long-term) to $12,463M (FY2025: $3,387M short-term + $9,076M long-term), +27.2% YoY, well above the 18.3% revenue growth rate [FY25 10-K, Item 8, Consolidated Balance Sheets]. The company's own MD&A states the increase in cash from working capital in both FY2024 and FY2025 was "primarily driven by an increase in our accrued insurance reserves primarily due to liabilities recorded during the period exceeding claims paid out" [FY25 10-K, Item 7, Liquidity and Capital Resources]. This is a genuine, disclosed, and recurring feature of the captive-insurance funding model (premiums/reserves build ahead of claims), not evidence of channel-stuffing-style manipulation — but insurance-reserve valuation is called out by the auditor as a Critical Audit Matter specifically because of "significant judgment by management" and "a high degree of auditor judgment, subjectivity and effort" [FY25 10-K, Item 7A / Report of Independent Registered Public Accounting Firm]. A meaningful share of reported CFO growth in FY2024–FY2025 rests on this estimate continuing to build faster than claims are paid; if that reverses (claims catching up to reserves), CFO growth could decelerate even with unchanged revenue growth. Flagged for monitoring, not scored as a red flag today given no evidence of reserve inadequacy or manipulation.

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported (FY2025) | Adjusted (FY2025) | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | 6,312 (unadjusted: EBIT + total D&A) | 8,730 (company "Adjusted EBITDA") | +2,418 | +38.3% | Partially — SBC and legal/regulatory reserve items recur every year; impairment/acquisition/lease/restructuring items are individually small but collectively present every year too | [FY25 10-K, Item 7, Adjusted EBITDA reconciliation; CIQ Financials_Annual.xls → Income Statement] |
| EBIT | 5,565 (GAAP income from operations) | Not disclosed — Uber does not publish an Adjusted EBIT / Adjusted operating income metric | n/a | n/a | n/a | [FY25 10-K, Item 7 — no Adjusted EBIT reconciliation present] |
| Net income | 10,053 (GAAP, attributable to Uber) | Not disclosed by the company (no "Adjusted Net Income" metric); CIQ does not export a separate normalized net-income dollar figure in this pool — see EPS row below for the closest available adjusted comparison | n/a | n/a | n/a | [FY25 10-K, Item 7 — no Adjusted Net Income reconciliation present; CIQ Financials_Annual.xls → Income Statement] |
| EPS (diluted) | 4.73 (GAAP) | 1.70 (Capital IQ "Normalized Diluted EPS" — a vendor estimate, not a company-disclosed figure) | −3.03 | −64.1% | No — the gap is driven substantially by the non-recurring $5.0B Netherlands DTA valuation-allowance release (Section 5) plus equity-investment mark-to-market volatility, both excluded from CIQ's normalization | [CIQ Financials_Annual.xls → Income Statement, "Normalized Diluted EPS" row — vendor-derived, not company-disclosed; FY25 10-K, Income Tax Note] |

## 8. Accounting Trap Checklist

*(Severity column is inverted — higher = WORSE.)*

| Trap | Triggered? (Y/N) | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | SBC $1,826M (FY2025), ~3.5% of revenue, added back in full to Adjusted EBITDA every year [FY25 10-K, Item 7] | 55 |
| Restructuring costs recur every year | Y | Restructuring/merger-related charges appear in FY2020 ($362M), FY2023 ($236M), FY2024 ($25M), FY2025 ($9M) — present in most of the last five fiscal years, though small in the two most recent [FY25 10-K, Item 7; CIQ Financials_Annual.xls → Income Statement] | 30 |
| Capitalized costs rising faster than revenue | Y | Net internal-use software +26.2% (FY2025) vs. revenue +18.3%, off a small ~1.6%-of-revenue base [FY25 10-K, Item 8, Property and Equipment Note] | 25 |
| Receivable factoring / supplier finance disclosed | N | No factoring or supplier-finance program disclosure found in the FY25 10-K in this pool | 0 |
| Inventory write-downs or reserve releases | N/A | No inventory. Allowance for doubtful accounts is stable ($91M FY2023 → $95M FY2024 → $91M FY2025), no evidence of a reserve release [FY25 10-K, Item 8, Schedule II] | 0 |
| Revenue recognized before cash collection risk is clear | N | Agent-model, primarily card-collected revenue; DSO is short (25.1 days FY2025) and declining, the opposite of a collection-risk signal [Section 3] | 5 |
| Change in useful life / depreciation assumptions | N | No such change disclosed in the FY25 10-K in this pool | 0 |
| Tax rate unusually low or boosted by one-off | Y | Two consecutive fiscal years of multi-billion-dollar non-cash deferred-tax-asset valuation-allowance releases ($6.4B FY2024, $5.0B FY2025) drove large net income-tax benefits and inflated GAAP net income/EPS well above the operating-earnings trend [FY25 10-K, Item 8, Income Tax Note] | 80 |
| Large fair-value / mark-to-market gains | Y | Unrealized gains/losses on equity investments (Aurora, Didi, Grab, Lucid, Waabi) swung from a $7,227M loss (FY2022) to gains/losses of varying size in every subsequent year, including a $97M net unrealized loss in FY2025 — a recurring, sizeable source of GAAP earnings volatility excluded from Adjusted EBITDA [FY25 10-K, Item 7; CIQ Financials_Annual.xls → Income Statement] | 45 |

## 9. Earnings Quality Score

**Score: 71/100** — "Mostly clean but some adjustment noise" band (61–80).

The single most important reason for this score: Uber's cash-generation engine is genuinely clean and strong — CFO has exceeded unadjusted EBITDA every profitable year (160–202% of EBITDA in FY2023–FY2025), FCF grew to $9,763M in FY2025, working capital is a consistent source of cash, receivables and payables show no distortion, and there is no inventory, no restatement, and no material weakness. But the score is held out of the top band (81–100) because the two headline profitability numbers investors are most likely to extrapolate — GAAP net income/EPS and the company's own Adjusted EBITDA — both carry real, cited quality issues: GAAP net income was inflated by a $5.0B one-time non-cash tax benefit in FY2025 and a $6.4B one-time non-cash tax benefit in FY2024 (two years running), and Adjusted EBITDA's own bridge treats a recurring, multi-hundred-million-dollar "legal, non-income tax and regulatory reserve" charge as a non-recurring add-back in both disclosed years. The recent discontinuation of quarterly Adjusted EBITDA disclosure compounds the concern by reducing forward visibility into whether the margin trend is holding.

## 10. The Single Biggest Quality Concern

The single biggest risk that reported earnings overstate economic reality is not in cash flow — it is in the two GAAP headline numbers most investors default to. GAAP net income and diluted EPS have been inflated in each of the last two fiscal years by large, one-time, non-cash income-tax benefits: a $6.4B release of U.S. federal and state deferred-tax-asset valuation allowances in Q4 FY2024, and a $5.0B release of Netherlands deferred-tax-asset valuation allowances in FY2025 [FY25 10-K, Item 8, Income Tax Note]. Neither event will repeat at similar scale, so GAAP EPS growth computed off the FY2024→FY2025 trend (4.56 → 4.73, +3.7%) is not a repeatable run rate — it understates how flattering both years already were relative to underlying operating profit. This is compounded, not offset, by the fact that the company's own "Adjusted EBITDA" — the metric management uses to describe margin progress — adds back a "legal, non-income tax, and regulatory reserve changes and settlements" charge that has appeared, at material size, in every year disclosed in this pool ($1,123M FY2024, $564M FY2025), which is the opposite of a non-recurring item by definition. None of this touches the underlying cash-generation quality, which remains strong and well evidenced (Sections 1–3, 6) — but an investor pricing Uber off headline GAAP EPS growth, or off Adjusted EBITDA margin expansion without adjusting for the recurring legal-reserve add-back, would be working from a materially flattered picture of repeatable earnings power.



---

## earnings / 07_earnings-sensitivity.md

_Source: `07_earnings-sensitivity.md`_

# Earnings Sensitivity — UBER

Reporting standard: US GAAP. Reporting currency: USD (millions). All figures below use GAAP operating income (EBIT), not Adjusted EBITDA — `03_margin-drivers.md` §1 and §5 flag that Uber stopped disclosing a comparable consolidated Adjusted EBITDA reconciliation after FY2025 (the term does not appear in the Q1 or Q2 FY2026 10-Qs or transcripts) and itself now recommends EBIT as "the most useful metric for Uber going forward." Using EBIT keeps this report on a basis that is (a) consistently disclosed across every period cited, and (b) not distorted by the below-the-line, non-operating mark-to-market swings that make GAAP diluted EPS an unreliable earnings-sensitivity metric for Uber (TTM diluted EPS fell 22.5% even as TTM EBIT rose 48.6% — `01_historical-financials.md` §2, §6). Where a variable's impact is genuinely revenue-level only (FX), that is stated explicitly rather than forced into an EBIT figure that isn't disclosed.

Base period used throughout: **TTM ended Jun-30-2026** — Revenue $55,227M, EBIT $6,700M (12.1% margin) [`01_historical-financials.md` §2].

## 1. Variable Selection

Six variables were selected from the upstream driver tables and the business-model external-dependency output, prioritizing the highest magnitude ratings in each: (1) **Trip / Gross Bookings volume growth** (Revenue Driver Table, Magnitude High), the single biggest revenue driver per `02_revenue-drivers.md` §7; (2) **Driver/Courier/Carrier variable payments** (cost of revenue, Margin Driver Table, Magnitude High), the single biggest margin driver per `03_margin-drivers.md` §9; (3) **G&A / legal-accrual swings** (Margin Driver Table, Magnitude High), flagged as the single most unpredictable driver in the cost stack; (4) **Mobility insurance cost / fare pass-through** (Margin Driver Table, Magnitude High on the cost line), included for its disclosed asymmetric behavior (see §6); (5) **FX translation** (Revenue Driver Table, Magnitude Low–Mid, but the only variable besides interest rates with an exact company-disclosed sensitivity); and (6) **Driver classification / labor regulation** (External Dependency Table, Dependency Level High), pulled directly from `business-model/10_external-dependency.md` §1 and §5, which names it "the single item that could force a structural change to the business model." The UK Mobility revenue/cost reclassification (High magnitude in both upstream tables) was deliberately excluded as a core sensitivity variable — it is a known, mechanical, already-quantified accounting effect with a fixed lapse date (Q1 FY2027), not a variable with genuine forward uncertainty in its size or direction; it is referenced only as context. Interest-rate risk was excluded despite a company-disclosed sensitivity because its Magnitude is rated Low (a $538M fair-value mark against fixed-rate notes, not a cash-earnings effect) [`business-model/10_external-dependency.md` §1–§2].

## 2. Sensitivity Table

All "EBIT Impact" figures are in USD millions, GAAP operating income basis, applied to the $55,227M TTM revenue base unless noted. Inverted-metric note: none of the impact columns below are inverted — positive = favorable to EBIT, negative = unfavorable.

| Variable | Base Case | Move Basis | Bull Case | EBIT Impact (bull) | Bear Case | EBIT Impact (bear) | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|
| Trip / Gross Bookings volume (proxied by ex-UK YoY revenue growth) | ~19.9% ex-UK, ex-FX YoY growth (Q2 FY26) | Historical observed range: headline YoY revenue growth ranged +12.2% to +18.3% over the last 5 reported periods; Gross Bookings constant-currency growth has stayed above 20% for 4 consecutive quarters | Accelerates to ~25% YoY | +$828M | Decelerates to ~15% YoY | −$828M | Medium (move size historical; ~30% incremental-EBIT-margin coefficient is inferred, not disclosed) | [`02_revenue-drivers.md` §6a, §7; `01_historical-financials.md` §1, §3] |
| Driver/Courier/Carrier variable payments (cost of revenue, % of revenue) | 55.1% reported / 56.4% ex-UK (Q2 FY26) | Historical observed range: this ratio swung −132bps (UK optical effect) to +377bps (genuine improvement) within one YoY quarterly comparison; −35bps for FY2025 full year | Improves 2pp, to ~53.1% | +$1,105M | Worsens 2pp, to ~57.1% | −$1,105M | Medium (move size is a historical-range inference; the dollar conversion itself is a direct, non-inferred calculation) | [`03_margin-drivers.md` §3, §8a; `business-model/06_value-chain.md` §1 (competitive-incentive risk)] |
| G&A / legal-accrual swings | FY2025: +$549M favorable swing (~106bps); Q2 FY26 alone: −$138M unfavorable swing (~97bps) | Company-disclosed historical swings — the identical line item moved margin favorably then unfavorably in consecutive periods | Repeat of FY2025's favorable swing | +$549M | Q2 FY26's unfavorable swing sustained across 4 quarters | −$552M | Medium (the disclosed dollar swings are High confidence; annualizing the bear case is Inference, not from filings) | [`03_margin-drivers.md` §3, §8a] |
| Mobility insurance cost / fare pass-through | FY2025: +$851M cost-line headwind; March-2026 renewals delivered "hundreds of millions" in savings, reinvested into fares | Company-disclosed historical dollar swing plus management's own stated reinvestment philosophy ("return that goodness back to the market") | Costs fall ~$850M, but per management's stated philosophy most is reinvested into fares — only a fraction estimated to reach EBIT | +$150M (≈18% retention — Inference, not from filings; no disclosed retention ratio) | Costs rise ~$850M again (repeat of FY2025's disclosed pattern) with no offsetting fare increase | −$850M | Medium (bear case is a direct historical dollar swing); Low (bull case retention fraction is inferred) | [`03_margin-drivers.md` §4, §6; Q1 FY26 earnings call, Q&A] |
| FX translation | Q2 FY26: +1pp revenue tailwind (12% reported vs. 11% constant-currency) | Company-disclosed range: FY2025 full year was a ~−1pp Gross Bookings headwind; Q2 FY26 was a +1–2pp tailwind — a ~2–3pp directional swing within about two quarters | Widens to +2pp revenue growth | +$1,105M revenue (EBIT-equivalent ≈ +$134M, inferred using the 12.1% consolidated EBIT margin — not company-disclosed at the EBIT level) | Reverts to −2pp revenue growth | −$1,105M revenue (EBIT-equivalent ≈ −$134M, inferred) | High for the revenue-level pp figure (company-disclosed); Low for the EBIT-level dollarization (inferred, no disclosed FX-to-EBIT sensitivity) | [`02_revenue-drivers.md` §3; `business-model/10_external-dependency.md` §2] |
| Driver classification / labor regulation | Independent-contractor status currently upheld in all major operating markets; no active adverse ruling forcing reclassification | No company-disclosed dollar or bps sensitivity exists | Continued favorable/status-quo rulings — removes tail risk but adds no incremental EBIT beyond the base case | Impact: not quantifiable | A reclassification ruling/law in a large market (most consequentially the US) forcing employee status | Impact: not quantifiable — 10-K states only that Uber "would incur significant additional expenses" without a dollar figure, and might not retain "a majority of the Drivers currently using our platform" | Low (no disclosed sensitivity; qualitative severity assessment only) | [`business-model/10_external-dependency.md` §1, §5; FY25 10-K, Item 1A] |

## 3. Sensitivity Ranking

Ranked by absolute EBIT impact (average of |bull| and |bear|, USD millions). Driver classification / labor regulation is excluded from the ranked list because its impact is not quantifiable — see the note beneath the table.

| Rank | Variable | Absolute Impact (avg of bull + bear) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | Driver/Courier/Carrier variable payments (cost of revenue ratio) | $1,105M | Improving (genuine ex-UK ratio improved 377bps in Q2 FY26) |
| 2 | Trip / Gross Bookings volume growth | $828M | Improving but decelerating (ex-UK growth ~19.9% vs. FY23–25's ~17–18% trend) |
| 3 | G&A / legal-accrual swings | $552M | Currently a headwind (Q2 FY26 swung unfavorable after FY2025's favorable swing) — direction is genuinely unpredictable, not trending |
| 4 | Mobility insurance cost / fare pass-through | $500M | Currently a cost-line tailwind (March-2026 renewal savings), but reinvested into fares, so near-zero realized EBIT benefit today |
| 5 | FX translation (EBIT-equivalent, inferred) | $134M | Tailwind (+1pp, Q2 FY26) — has swung to a headwind as recently as FY2025 |

**Not ranked (impact not quantifiable): Driver classification / labor regulation.** This is a critical omission from the numeric ranking, not a signal that it is unimportant — `business-model/10_external-dependency.md` §4 rates it the primary driver of a 48/100 External Dependency Risk Score (higher = worse) and §5 names it "the single item that could force a structural change to the business model." If it were quantifiable, it would plausibly rank above every variable in the table above; it is excluded from the numeric ranking specifically because no company-disclosed or reliably inferable dollar figure exists, and inventing one would violate this module's no-source-no-claim standard.

## 4. The Single Highest-Sensitivity Variable

Among the variables that can be quantified, **Driver/Courier/Carrier variable payments (the cost-of-revenue line, 55–61% of revenue)** moves EBIT the most — a plausible ±2 percentage-point swing in this ratio is worth ±$1,105M against a $6,700M TTM EBIT base, roughly ±17%. Its current direction is favorable: the genuine, ex-UK-reclassification improvement in this line was +377bps in Q2 FY26 alone, larger than the entire +186bps net EBIT-margin gain that quarter (`03_margin-drivers.md` §8a) — every other driver in the bridge is currently a net drag against it. This variable is largely company-controlled (an operating decision on incentive intensity) but not fully — `business-model/06_value-chain.md` §1 flags that Uber "may need to increase or may not be able to reduce the Driver incentives that we offer without adversely affecting the supply liquidity," meaning competitive pressure from rivals (Lyft, DoorDash, and local operators) to defend driver and courier supply is what would force the adverse case. A caveat belongs alongside this finding: if the unquantifiable driver-classification/labor-regulation risk (§3) were to crystallize in a large market, it would very plausibly dwarf this variable's impact — it is excluded from the ranking only because it carries no company-disclosed dollar sensitivity, not because it is smaller.

## 5. Interaction Effects

Several of these variables move together rather than independently. First, **Driver/Courier incentive payments and Trip/Gross Bookings volume are mechanically linked**: both cost of revenue and revenue scale with Gross Bookings, so an acceleration in trip volume (the #2-ranked variable) tends to also increase absolute driver/courier payments (the #1-ranked variable) — the two rarely move in isolation, and the net EBIT effect depends on whether incentive intensity (cost per trip) rises, falls, or holds steady alongside volume, which is a separate, largely company-controlled decision. Second, **FX translation and reported Gross Bookings/revenue growth compound rather than offset**: Q2 FY26's headline Gross Bookings growth of 24% included a +2pp FX tailwind on top of 22% constant-currency growth [`02_revenue-drivers.md` §3] — if FX reverses to the ~−1pp headwind seen in FY2025 at the same time organic volume growth decelerates (the bear case in row 1), the two effects would compound into a larger-than-either-alone deceleration in headline reported growth, even though the underlying organic trend and the FX effect are unrelated. Third, per the external-dependency table, a **fuel-price spike (Mid dependency) could simultaneously raise insurance-adjacent driver costs and force higher incentive payments** to retain drivers on the platform [`business-model/10_external-dependency.md` §1] — meaning the insurance and driver-incentive rows in §2 are not fully independent; a single commodity shock could hit both at once. The G&A/legal-accrual line is the one variable in this table that appears genuinely idiosyncratic — it has swung in opposite directions in consecutive periods with no evident correlation to the other five variables (`03_margin-drivers.md` §8a).

## 6. Non-Linear Or Asymmetric Risks

Two clear asymmetries are visible in the evidence, plus one likely-but-unproven non-linearity:

- **Insurance cost pass-through is explicitly asymmetric by management's own stated philosophy.** A cost increase (bear case, §2) risks a close-to-full pass-through to the P&L (−$850M EBIT if not offset), while a cost decrease (bull case) is largely reinvested into fares rather than kept as margin (management: "our philosophy has been to return that goodness back to the market") — the disclosed evidence supports an estimated ~18% retention on the upside versus effectively 100% exposure on the downside. This is a real, cited asymmetry, not a modeling assumption.
- **Driver classification / labor regulation is a binary, non-linear tail risk.** Unlike every other variable in this table, which moves earnings along a roughly continuous range, an adverse reclassification ruling in a large market would not scale gradually — it would trigger a step-change in cost structure (wages, benefits, taxes) and a risk to driver retention itself, which the 10-K frames as potentially forcing a structural change to the business model, not a marginal cost increase [`business-model/10_external-dependency.md` §5].
- **Operating deleverage risk in the volume bear case (likely, not company-quantified).** The Trip/Gross Bookings volume row (§2) assumes a ~30% incremental EBIT margin applies symmetrically in both directions, but this is an inference drawn from a period of accelerating growth (FY2024→FY2025, Q2'25→Q2'26). In a genuine volume slowdown, Uber may still need to sustain driver/courier incentive spending to protect supply liquidity (per `business-model/06_value-chain.md` §1) even as revenue growth cools — meaning the bear case for volume could compress EBIT by more than the symmetric −$828M shown in §2, because the cost side would not necessarily de-lever at the same rate revenue decelerated. This is flagged as a plausible non-linearity, not confirmed by any disclosed period of an actual Uber volume downturn in this data pool.

## 7. Earnings Volatility Score

**60/100** (inverted: higher = WORSE / more sensitive to small input changes).

One-line reason: five separately quantifiable variables can each move EBIT by roughly 8–17% of the $6,700M TTM base (a $134M–$1,105M range) on realistic near-term move sizes, plus one unquantifiable structural tail risk (driver classification) that the business-model module itself rates as the primary driver of a 48/100 External Dependency Risk Score — placing this in the "Material sensitivity" band, not "Very stable," even though the underlying operating trend (EBITDA, EBIT, FCF) has shown consistent multi-year improvement rather than volatility on its own (`01_historical-financials.md` §6).



---

## earnings / 08_earnings-red-flags.md

_Source: `08_earnings-red-flags.md`_

# Earnings Red Flags — UBER

All eight upstream earnings outputs (`00`–`07`) are present and were read in full, plus the optional business-model cross-module outputs (`03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`, `12_red-flags-sweep.md`). No upstream input is missing — this scan proceeds with full data availability, not a degraded-confidence basis.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | Revenue growth has held in a stable high-teens band for three straight fiscal years; margins expanded every year FY2021–FY2025; net debt/EBITDA improved to 0.82x at FY2025 year-end | Revenue +17.0%/+18.0%/+18.3% FY23–25; EBITDA margin (16.8)%→12.1% FY21–25 [01_historical-financials output, §1] | High |
| 02_revenue-drivers | Gross Bookings and trip volume are still accelerating, not decelerating — 4 consecutive quarters of constant-currency Gross Bookings growth above 20% | Trips +18% YoY, MAPCs +16% YoY, Gross Bookings +24% reported/+22% CC in Q2 FY26 [02_revenue-drivers output, §4, §7] | High |
| 03_margin-drivers | The ex-UK cost-of-revenue improvement in Q2 FY26 (+377bps) was larger than the entire quarter's net EBITDA-margin gain (+180bps) | Derived arithmetic: as-if cost-of-revenue ratio 56.39% vs actual 55.07%, isolating a genuine 376bps organic improvement [03_margin-drivers output, §7a] | High |
| 04_guidance-consensus | Consensus for the two metrics Uber actually guides (EBITDA, EPS Normalized) sits within 0.4% of the guidance midpoint — a textbook "fair" bar | EBITDA consensus $2,918.95mm vs guided midpoint $2,910mm (+0.31%); EPS Normalized $0.8632 vs $0.86 (+0.37%) [04_guidance-consensus output, §3] | High |
| 05_beat-miss-setup | Uber has beaten its own EBITDA guidance in 4 of the last 4 quarters, and cleared the guided high end in the last 2 by a near-identical ~2.5% each time | [05_beat-miss-setup output, §7–8] | Medium (short, 2-quarter above-high-end sample, self-flagged) |
| 06_earnings-quality | Cash conversion is genuinely strong: CFO exceeded unadjusted EBITDA in every profitable year (160–202% of EBITDA, FY2023–2025); accrual-quality checklist is clean (only 1 of 6 standard flags triggered) | [06_earnings-quality output, §2, §6, §9] | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | Reported revenue growth decelerated sharply over the last two quarters (+14.5% Q1 FY26, +12.2% Q2 FY26) versus the ~20% run rate of the four quarters before | [01_historical-financials output, §3, §6] | High |
| 02_revenue-drivers | The UK Mobility revenue-recognition change cut revenue by $1.1B in Q2 FY26 alone and will keep suppressing YoY comparisons through Q4 FY26 | [02_revenue-drivers output, §5, §6a] | High |
| 03_margin-drivers | SG&A/R&D headcount and discretionary-investment growth outpaced revenue and cost −232bps of margin in Q2 FY26 — deliberate, and the most likely driver to reverse the margin-expansion trend if sustained | [03_margin-drivers output, §7, §8] | High |
| 04_guidance-consensus | Revenue consensus was cut 1.04% in the three trading days after the Q2 print, with net revision breadth of −11 at the FQ3 level — the freshest, most negative signal in the whole estimate set | [04_guidance-consensus output, §3, §5] | High |
| 05_beat-miss-setup | A third straight revenue miss versus consensus is the single biggest risk that could break the "favors beat" setup | [05_beat-miss-setup output, §10] | Medium (forward-looking) |
| 06_earnings-quality | GAAP net income/EPS were inflated in two consecutive fiscal years by one-time, non-cash deferred-tax-asset valuation-allowance releases ($6.4B FY2024, $5.0B FY2025) | [06_earnings-quality output, §5, §10] | High |
| 07_earnings-sensitivity | Driver classification / labor-regulation risk is unquantifiable and, if triggered in a major market, would plausibly dwarf every other quantified sensitivity variable | [07_earnings-sensitivity output, §3, §6] | Medium (Low confidence, per source — no disclosed dollar sensitivity) |
| business-model 12_red-flags-sweep | A recurring "Legal, non-income tax, and regulatory reserve" line, defined in the filing as non-recurring, has appeared at double-digit-percent-of-Adjusted-EBITDA size two years running ($1,123M FY24 = 17.3%; $564M FY25 = 6.5%) — flagged `RF-RFS-001` | [business-model 12_red-flags-sweep output, §2–3] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| Standalone investor deck | 00_earnings-data-triage | Low — filings and verbatim transcripts substitute for driver/management-framing detail |
| Sub-segment revenue detail (Mobility financial-partnerships/advertising split; Delivery Grocery & Retail vs. core restaurant delivery) | 02_revenue-drivers | Medium — limits precision of segment-level revenue-driver decomposition |
| Numeric FQ3 2026 Gross Bookings guidance | 04_guidance-consensus | Medium — Uber guides Gross Bookings internally (and beat it in Q2) but the range itself isn't in this pool's structured data, so the guidance-vs-consensus comparison in §3 of `04` cannot cover it |
| Quantified AV-investment P&L cost impact | 03_margin-drivers, 05_beat-miss-setup | High — CFO has explicitly deferred sizing this; the first quantified figure is flagged by both agents as the item most likely to flip the current "demand signal" reading of the ~$10B AV program |
| Segment-level reconciliation of the UK Mobility revenue/cost effect (a $292M gap between the disclosed $1.1B revenue impact and $808M cost impact) | 03_margin-drivers | Medium — caps how precisely the Mobility segment margin bridge can be read this quarter |
| Delivery merchant concentration percentage | business-model 06_value-chain | Low-Medium — the 10-K flags concentration qualitatively but discloses no percentage |
| 2026 Proxy Statement (insider/officer ownership) | business-model 12_red-flags-sweep (referencing capital-allocation-governance) | Low for earnings module specifically — governance-relevant, tangential to the earnings setup itself |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 05_beat-miss-setup | "Setup favors beat" — driven primarily by Uber beating its own guided EBITDA metric in 4 of 4 quarters, above the guided high end in the last 2 | 06_earnings-quality / business-model 12_red-flags-sweep | The Adjusted-EBITDA-like metric Uber guides and has been "beating" excludes a recurring, double-digit-percent-of-EBITDA "one-off" legal/regulatory reserve charge two years running, and the company stopped disclosing the full quarterly Adjusted-EBITDA-to-GAAP reconciliation starting Q1 FY26 | Y — not a direct factual conflict (05's beat-streak claim is accurate on its own terms), but a quality-adjusted reading materially tempers 05's beat-streak confidence | 06/12 — the source hierarchy favors the filing-level accounting-quality read over the guidance-streak framing when the two inputs describe the same underlying metric from different angles; synthesis should present the beat streak alongside this caveat, not standalone |
| 07_earnings-sensitivity | Bases its entire sensitivity analysis on GAAP EBIT (TTM $6,700M) because Adjusted EBITDA is no longer disclosed quarterly | 04_guidance-consensus / 05_beat-miss-setup | Base their beat/miss and bar analysis on the guided "EBITDA" line (understood to be Adjusted-EBITDA-like, quarterly guide midpoint $2,910mm for FQ3 2026) | Y — both agents flagged their own basis transparently; the two are simply not on the same metric and should not be blended without re-basing | Neither is "more credible" — this is a genuine basis split the synthesis agent must carry forward explicitly, not average away |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No standalone investor deck present | Triggered | Low | High | "No standalone investor deck is present in the pool" [00_earnings-data-triage output, §2] | Minimal — verbatim transcripts and filings fill the management-commentary role at a higher trust tier |
| Sub-segment revenue detail not quantified (Mobility fin-partnerships/ads; Delivery Grocery & Retail vs. core) | Unavailable | Medium | Unknown | "Not proven from available data" [02_revenue-drivers output, §5] | Limits precision of any sub-segment revenue-driver claim; does not block the consolidated or 3-segment read |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Reported revenue growth decelerating (18.3%→14.5%→12.2% YoY over 3 quarters) while the underlying narrative frames it as a one-time item only | Triggered | High | High | "Q2 FY26 revenue growth decelerated to +12.2% YoY... even as Gross Bookings grew +24% YoY" [01_historical-financials output, §3, §6] | Real optical deceleration that the market may not fully discount; a second data point (revenue decomposition residual, below) shows the gap cannot be fully attributed to the UK item alone from this quarter's own bridge |
| Company-defined Adjusted EBITDA disclosure discontinued at the quarterly level starting Q1 FY2026 | Triggered | High | High | "Zero mentions of 'Adjusted EBITDA'" in Q1/Q2 FY26 transcripts (full-text search) [01_historical-financials output, §4; 06_earnings-quality output, §4] | Removes the like-for-like margin-trend metric investors had used to track FY2025's margin-expansion story into FY2026 |
| CIQ quarterly Gross Margin % export shows a classification artifact (Q4 spikes to ~49.7% vs Q1–Q3's 33–39%) | Triggered | Low | Low | Identified and reconciled to the filed cost-of-revenue ratio; flagged as a vendor classification inconsistency, not a real margin swing [01_historical-financials output, §3] | Already corrected by the upstream agent and not propagated into any downstream conclusion |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Q2 FY26 revenue-growth decomposition leaves 19.69pp of the 12.17pp total growth as an undifferentiated "Volume + price/mix + unquantified M&A" plug | Triggered | Medium | Medium | "More than half of the gross magnitude in Table B... is not attributed to a specific, evidenced mechanism" [02_revenue-drivers output, §6a] | Caps how precisely the "biggest revenue driver" claim (Trip volume) can be verified from this quarter's own arithmetic alone |
| Segment mix shift toward Delivery/Freight (lower take rate than Mobility) is a structural drag on the blended take rate | Triggered | Medium | High | "A shift in growth toward Delivery or Freight mechanically pulls the blended take rate down" [03_margin-drivers output, §5, citing business-model `02_business-identity`] | Ongoing headwind to revenue-per-Gross-Booking-dollar even as total Gross Bookings grow |
| Delivery's reported growth includes an unquantified M&A contribution (Trendyol GO) that flips from tailwind to headwind starting Q3 FY26 | Triggered | Medium | High | CFO: Trendyol Go "was a lot larger... than the 2 acquisitions [replacing it]," a "net... headwind to delivery reported growth on a net basis [starting Q3]" [02_revenue-drivers output, §3] | Directly relevant to the very next quarter this red-flag scan covers (FQ3 2026) |
| Revenue consensus and revision breadth deteriorating (−1.04% cut in 3 trading days, breadth −11 at FQ3 level) | Triggered | High | High | [04_guidance-consensus output, §3, §5] — see also §2.5 below | The freshest, most negative signal available in the entire data pool |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| SG&A/R&D headcount and discretionary-investment growth outpacing revenue (−232bps of margin in Q2 FY26) is deliberate and could reverse the margin-expansion trend if sustained | Triggered | High | Medium | "The driver most likely to reverse the improvement if management chooses to keep investing at the current pace" [03_margin-drivers output, §7, §8] | Directly threatens the durability of the margin story that underlies the "favors beat" EBITDA setup |
| G&A / legal-accrual line swings unpredictably — favorable +106bps (FY2025) then unfavorable −97bps (Q2 FY26) in consecutive comparable periods | Unclear | Medium | Medium | "Should not be extrapolated in either direction" [03_margin-drivers output, §7a; 05_beat-miss-setup output, §3] | A fresh unfavorable swing could eat directly into the next EBITDA beat even after a clean Q3 print |
| Mobility segment-level UK effect not fully reconcilable — $292M gap between the disclosed $1.1B revenue impact and $808M cost impact | Unclear | Medium | Medium | "Not achievable from this pool's disclosure" [03_margin-drivers output, §6] | Caps confidence in any segment-level Mobility margin read this quarter beyond the consolidated bridge |
| Recurring "Legal, non-income tax, and regulatory reserve" charge excluded from Adjusted EBITDA at material size two years running ($1,123M FY24 = 17.3% of Adj. EBITDA; $564M FY25 = 6.5%) despite being labeled non-recurring | Triggered | High | High | Filing itself defines the item as "distinct from normal, recurring" matters, yet it recurs at double-digit-% size [06_earnings-quality output, §4–5; business-model 12_red-flags-sweep output, §2, RF-RFS-001] | Inflates the margin-expansion narrative investors are pricing off Adjusted EBITDA |
| Insurance cost pass-through is explicitly asymmetric (near-full downside exposure vs. an inferred ~18% upside retention) | Triggered | Medium | Medium | Management: "our philosophy has been to return that goodness back to the market" [07_earnings-sensitivity output, §6] | A future insurance-cost spike would likely hit margin close to 1:1, while the current tailwind is largely being spent, not banked |
| Freight cyclical "inflection" is based on a single quarter of data | Triggered | Low | Medium | "One quarter of confirmed inflection"; FY2025 used explicit "challenging freight market cycle" language [02_revenue-drivers output, §5; 03_margin-drivers output, §6] | Small consolidated impact (Freight ~9.8% of revenue), but risk of treating one data point as a new baseline |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The guided "EBITDA" metric's definition is not independently confirmed in this pool — CIQ labels it simply "EBITDA" though it is "understood to be" company-defined Adjusted EBITDA | Triggered | High | Medium | "Its definition is not independently re-stated in this pool extract — flagged per hygiene rule" [04_guidance-consensus output, §2] | The entire 4-quarter guidance-beat streak underlying the "favors beat" verdict rests on a metric whose exact composition (and thus whether it is affected by the recurring "one-off" legal-reserve exclusion above) is not confirmed from primary disclosure in this pool |
| Revenue and profitability consensus are diverging in opposite directions over the same 1–3 month window | Triggered | High | High | Revenue estimates cut (FQ3: −1.04%; FY26: falling); EBITDA/EPS Normalized estimates flat-to-rising over the same window [04_guidance-consensus output, §4–5] | A genuine split signal, not noise — the market is simultaneously trimming the top line and raising the profit line for the same company |
| Rising effective-tax-rate assumption compresses EPS Normalized even as EBITDA estimates rise | Triggered | Medium | High | FQ3 2026 tax-rate assumption rose from 16.77% (3 months ago) to 18.94% (current); FY2026 assumption rose from 9.5% to 20.77% [04_guidance-consensus output, §5] | Structural headwind specific to the EPS Normalized line, independent of operating performance |
| EBITDA/EPS "above guided high end" pattern is a short, 2-quarter base rate | Triggered | Medium | Medium | "A real but short (two-quarter) pattern" [04_guidance-consensus output, §7; 05_beat-miss-setup output, §7] | The market-revealed "beat the high end" bar may be set on an insufficient sample to reliably project forward |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Third straight revenue miss vs. consensus is the single biggest disclosed risk to the "favors beat" setup | Unclear | Medium | Medium | Revenue missed consensus in the last 2 quarters (−0.45%, −0.52%); net revision breadth −11 at FQ3 level [05_beat-miss-setup output, §3, §10] | If it materializes beyond the ±0.6% range of the last two quarters, this is explicitly flagged as likely to dominate market reaction even if EBITDA/EPS clear their guided ranges |
| In-line or beat current quarter but Q4 guide fails to reflect normal seasonal step-up, or introduces the first quantified AV-cost figure | Unclear | Medium | Medium | Q4 has averaged 27.2% of annual revenue and the highest EBITDA margin (13.7% FY2025) of any quarter over 3 years [05_beat-miss-setup output, §5] | A flat-to-Q3 Q4 guide, or the first AV P&L cost disclosure, would be read as a genuine deceleration signal, not seasonality |
| GAAP EPS is not usable for a beat/miss read on its own (dominated by non-operating mark-to-market swings) | Not Triggered (already correctly handled upstream) | Low | High | GAAP EPS surprise swung +350.7%, −82.1%, −81.7%, +41.0% over 4 quarters; 05 explicitly excludes it from its beat/miss test [05_beat-miss-setup output, §5–6] | Already mitigated — flagged here only to confirm the exclusion is correctly applied and should be carried into synthesis |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| GAAP net income/EPS inflated in 2 consecutive fiscal years by one-time, non-cash deferred-tax-asset valuation-allowance releases ($6.4B FY2024, $5.0B FY2025) | Triggered | High | High | "GAAP EPS growth computed off the FY2024→FY2025 trend (4.56 → 4.73, +3.7%) is not a repeatable run rate" [06_earnings-quality output, §5, §10] | The single biggest quality concern named by the earnings-quality agent itself; any investor pricing off headline GAAP EPS growth is working from a materially flattered trend |
| Recurring "one-off" legal/regulatory reserve line inflates Adjusted EBITDA two years running | Triggered | High | High | See §2.4 above — cross-listed here because it is fundamentally an accounting-classification issue [06_earnings-quality output, §4–5; business-model 12_red-flags-sweep output, §2] | Same impact as above — inflates the margin-progress metric management and consensus both anchor to |
| Consolidated Adjusted EBITDA reconciliation discontinued starting Q1 FY2026 | Triggered | High | High | See §2.2 above | Reduces forward visibility into whether the FY2025 margin-expansion trend is holding on a like-for-like basis |
| Growing self-insurance reserve build ($9.8B→$12.5B, +27.2% YoY vs. 18.3% revenue growth) drove a meaningful share of reported operating-cash-flow/working-capital growth | Triggered | Medium | Medium | Company MD&A: increase in cash from working capital "primarily driven by an increase in our accrued insurance reserves... due to liabilities recorded during the period exceeding claims paid out"; insurance-reserve valuation is an auditor Critical Audit Matter due to "significant judgment by management" [06_earnings-quality output, §6; business-model 12_red-flags-sweep output, §2] | If claims catch up to reserves, CFO growth could decelerate even with unchanged revenue growth — a genuine, disclosed, judgment-based feature, not evidence of manipulation, but a real forward risk to the "cash generation is strong" bullish claim |
| GAAP net income also moved by unrealized mark-to-market swings on a ~$9.2B strategic equity-investment portfolio (Aurora, Didi, Grab, Lucid, Waabi), a $1.9B YoY swing | Triggered | Medium | High | [business-model 12_red-flags-sweep output, §2] | A second, distinct source of GAAP earnings noise unrelated to the tax-benefit item above; both must be stripped before extrapolating GAAP profitability |
| Segment profit measurement basis changed (Segment Adjusted EBITDA → Segment Operating Income) effective Q1 FY26, prior periods recast | Triggered | Medium | High | "Not directly comparable" [00_earnings-data-triage output, §5; business-model 03_segment-map output, §3] | FY2025 and FY2026 segment margins cannot be blended in the same delta without re-basing — a hygiene requirement, not a quality defect, but an easy error for downstream synthesis to make |
| Capitalized internal-use software costs grew faster than revenue (+26.2% vs. +18.3%) | Triggered | Low | Low | Off a small (~1.6% of revenue) base [06_earnings-quality output, §6, §8] | Immaterial today; worth monitoring only if the growth rate persists at a larger base |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Driver classification / labor-regulation risk is unquantifiable and, if triggered in a major market, would plausibly dwarf every other quantified sensitivity variable | Triggered | High | Unknown | Excluded from the numeric sensitivity ranking specifically because no company-disclosed or reliably inferable dollar figure exists; New Zealand Supreme Court already found 4 drivers were employees while logged in (Nov 2025) [07_earnings-sensitivity output, §3, §6; business-model 10_external-dependency output, §1, §5] | The single largest unpriced tail risk in the whole earnings setup — none of the quantified sensitivities capture it |
| Government/regulatory policy has already moved a full quarter's revenue by ~8% in one mid-sized market (UK) | Triggered | Medium | Medium | UK VAT/business-model change cut Q2 FY26 revenue by $1.1B (~8% of that quarter's $14.2B) [business-model 10_external-dependency output, §5] | A demonstrated precedent for how large a single-country policy shock can be — directly relevant to sizing the driver-classification tail risk above in a larger market such as the US |
| Insurance cost pass-through asymmetry (near-full downside exposure vs. ~18% inferred upside retention) | Triggered | Medium | Medium | See §2.4 — cross-listed here as a sensitivity-basis issue [07_earnings-sensitivity output, §6] | Same evidence, sensitivity-magnitude framing |
| Volume bear-case EBIT impact may be understated — symmetric ~30% incremental-margin assumption may not hold if driver-incentive spend stays sticky in a slowdown | Unclear | Medium | Low | "Flagged as a plausible non-linearity, not confirmed by any disclosed period of an actual Uber volume downturn in this data pool" [07_earnings-sensitivity output, §6] | Labeled inference; if correct, the bear case for the #2-ranked sensitivity variable (Trip/Gross Bookings volume) could be materially worse than the ±$828M shown |
| FX and volume deceleration could compound rather than offset in a bear scenario | Triggered | Medium | Low | Q2 FY26 headline growth included a +2pp FX tailwind on top of 22% CC growth; a simultaneous FX reversal and volume deceleration would compound [07_earnings-sensitivity output, §5] | A correlated-shock scenario not captured by treating each sensitivity variable independently |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Capital IQ's own "Net Debt" export line diverges materially from the strict computed figure ($76M vendor vs. $5,197M computed, FY2025) | Triggered | Medium | Low | "Its exact netting basis could not be reproduced from the disclosed balance-sheet components in this pool and is not used in this report" [01_historical-financials output, §1] | Low direct earnings-module relevance (net debt is a balance-sheet/leverage metric), but a real, unreconciled vendor-vs-computed gap that other modules should not silently adopt |
| Basis mismatch between `07_earnings-sensitivity` (GAAP EBIT) and `04`/`05` (guided EBITDA-like metric) | Triggered | Medium | High | See Contradictions table, §1 above | Synthesis must not blend a GAAP-EBIT-based sensitivity percentage with a guided-EBITDA-based beat magnitude |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The "favors beat" setup verdict is built on a guided EBITDA-like metric whose quality is separately and materially qualified elsewhere in the same module (71/100, "mostly clean but some adjustment noise") | Unclear | High | Medium | 05's beat-streak framing does not itself reference 06's caveats; the two live in different sections of the same module [05_beat-miss-setup output, §8; 06_earnings-quality output, §9–10; business-model 12_red-flags-sweep output, §3, RF-RFS-001] | Synthesis should present the beat streak alongside the quality caveat, not as a standalone "clean" bull signal |
| The $10B AV investment program is framed as primarily a "demand/optionality signal" today, based substantially on management's own framing (external co-investment ratios, city-count targets) | Triggered | Medium | Medium | The upstream agent itself states this reading "is not a backlog in the AWS sense" and names the specific observable that would flip it — the first quantified AV P&L charge [03_margin-drivers output, §9] | Already self-qualified upstream; carried forward here because a demand-signal narrative not yet tested against a real cost figure is inherently fragile |
| FY2025 margin levels are the peak of a 3-year expansion, not yet a demonstrated steady state | Not proven from available data as a standalone claim in this module — flagged for cross-reference | Low | Medium | Business-quality module (not itself an earnings-module input) separately characterizes FY2025 margins as "a recent high-water mark, not a stabilized steady state" [business-model 12_red-flags-sweep output, §1, citing `07_business-quality`] | Context only — outside this module's own upstream inputs, included because it bears directly on whether the margin-expansion trend this module treats as durable is, in fact, proven durable |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Historical Trend | Reported revenue growth decelerating (18.3%→14.5%→12.2% YoY) with a real optical component beyond the disclosed UK one-off | Triggered | High | High | Market may not fully discount the deceleration as pure UK optics |
| 2 | Historical Trend | Consolidated Adjusted EBITDA disclosure discontinued at the quarterly level starting Q1 FY26 | Triggered | High | High | Removes the like-for-like margin-trend metric used to track FY2025's story into FY2026 |
| 3 | Margins | Recurring "Legal, non-income tax, and regulatory reserve" charge excluded from Adjusted EBITDA at double-digit-% size two years running | Triggered | High | High | Inflates the margin-progress narrative management and consensus both anchor to |
| 4 | Margins | SG&A/R&D growth outpacing revenue (−232bps in Q2 FY26), deliberate and could reverse the margin trend | Triggered | High | Medium | Single most likely driver to break the margin-expansion story if sustained |
| 5 | Guidance/Consensus | Guided "EBITDA" metric's definition not independently confirmed in this pool | Triggered | High | Medium | The 4-quarter beat streak underlying "favors beat" rests on an unconfirmed metric composition |
| 6 | Guidance/Consensus | Revenue and profitability consensus diverging (revenue cut −1.04%/breadth −11; EBITDA/EPS flat-to-rising) over the same window | Triggered | High | High | Freshest, most negative signal in the whole data pool |
| 7 | Earnings Quality | GAAP net income/EPS inflated 2 consecutive years by one-time non-cash DTA valuation-allowance releases ($6.4B FY24, $5.0B FY25) | Triggered | High | High | GAAP EPS growth trend (4.56→4.73) is not a repeatable run rate |
| 8 | Earnings Quality | Consolidated Adjusted EBITDA reconciliation discontinued starting Q1 FY26 (same fact as #2, listed once per category) | Triggered | High | High | Reduces forward visibility into like-for-like margin trend |
| 9 | Sensitivity | Driver classification/labor-regulation risk is unquantifiable and could dwarf every quantified sensitivity variable if triggered | Triggered | High | Unknown | Single largest unpriced tail risk in the whole setup |
| 10 | Narrative/Framing | "Favors beat" setup verdict does not itself carry forward the quality caveats on the guided metric it rests on | Unclear | High | Medium | Risk that synthesis reads the beat streak as a clean bull signal without the offsetting quality context |
| 11 | Margins | G&A/legal-accrual line swings unpredictably in opposite directions across consecutive comparable periods | Unclear | Medium | Medium | A fresh unfavorable swing could eat into the next EBITDA beat regardless of operating performance |
| 12 | Margins | Mobility segment-level UK effect not fully reconcilable ($292M gap between disclosed revenue and cost impacts) | Unclear | Medium | Medium | Caps confidence in any Mobility segment margin read beyond the consolidated bridge |
| 13 | Margins | Insurance cost pass-through is explicitly asymmetric (near-full downside vs. ~18% inferred upside retention) | Triggered | Medium | Medium | A future insurance-cost spike would likely hit margin near 1:1; the current tailwind is mostly spent, not banked |
| 14 | Revenue | Q2 FY26 revenue-growth decomposition leaves 19.69pp of 12.17pp total growth as an undifferentiated plug | Triggered | Medium | Medium | Caps precision of the "Trip volume is the biggest driver" claim for this specific quarter |
| 15 | Revenue | Segment mix shift toward Delivery/Freight (lower take rate) is a structural drag on blended take rate | Triggered | Medium | High | Ongoing headwind to revenue-per-Gross-Booking-dollar |
| 16 | Revenue | Trendyol GO M&A tailwind to Delivery flips to a headwind starting Q3 FY26 | Triggered | Medium | High | Directly relevant to the very next reported quarter |
| 17 | Beat/Miss | Third straight revenue miss vs. consensus is the single biggest disclosed risk to the "favors beat" setup | Unclear | Medium | Medium | Could dominate market reaction even if EBITDA/EPS clear guided ranges again |
| 18 | Beat/Miss | Q4 guide risk — either fails normal seasonal step-up or introduces first quantified AV-cost figure | Unclear | Medium | Medium | Either outcome would likely be read as genuine deceleration, not noise |
| 19 | Guidance/Consensus | EBITDA/EPS "above guided high end" pattern is a short, 2-quarter base rate | Triggered | Medium | Medium | Market-revealed "beat the high end" bar may be set on an insufficient sample |
| 20 | Guidance/Consensus | Rising effective-tax-rate assumption compresses EPS Normalized even as EBITDA estimates rise | Triggered | Medium | High | Structural headwind specific to EPS Normalized, independent of operating performance |
| 21 | Earnings Quality | Growing self-insurance reserve build (+27.2% YoY vs. 18.3% revenue growth) drove a meaningful share of reported CFO/working-capital growth | Triggered | Medium | Medium | If claims catch up to reserves, CFO growth could decelerate even with unchanged revenue |
| 22 | Earnings Quality | GAAP net income also moved by unrealized mark-to-market swings on a ~$9.2B equity-investment portfolio ($1.9B YoY swing) | Triggered | Medium | High | A second, distinct source of GAAP earnings noise beyond the tax-benefit item |
| 23 | Earnings Quality | Segment profit measurement basis changed (Segment Adjusted EBITDA → Segment Operating Income) effective Q1 FY26 | Triggered | Medium | High | FY25/FY26 segment margins cannot be blended without re-basing |
| 24 | Sensitivity | Government/regulatory policy has already moved a full quarter's revenue by ~8% in one mid-sized market (UK) | Triggered | Medium | Medium | Demonstrated precedent for sizing the driver-classification tail risk in a larger market |
| 25 | Sensitivity | Volume bear-case EBIT impact may be understated due to sticky driver-incentive spend in a slowdown | Unclear | Medium | Low | Labeled inference; if correct, the #2-ranked sensitivity variable's bear case could be worse than shown |
| 26 | Sensitivity | FX and volume deceleration could compound rather than offset in a correlated bear scenario | Triggered | Medium | Low | Not captured by treating each sensitivity variable independently |
| 27 | Source Conflicts | Basis mismatch between `07`'s GAAP-EBIT sensitivity base and `04`/`05`'s guided-EBITDA-like base | Triggered | Medium | High | Synthesis must not blend the two without re-basing |
| 28 | Source Conflicts | Capital IQ's own "Net Debt" export diverges materially from the strict computed figure ($76M vs. $5,197M) | Triggered | Medium | Low | Low direct earnings relevance; a real, unreconciled vendor-vs-computed gap |
| 29 | Data Completeness | No standalone investor deck present | Triggered | Low | High | Minimal — filings and transcripts fill the role at a higher trust tier |
| 30 | Margins | Freight cyclical "inflection" is based on a single quarter of data | Triggered | Low | Medium | Risk of treating one data point as a new baseline |
| 31 | Earnings Quality | Capitalized internal-use software costs growing faster than revenue | Triggered | Low | Low | Immaterial today off a small (~1.6% of revenue) base |
| 32 | Historical Trend | CIQ quarterly Gross Margin % export shows a classification artifact | Triggered | Low | Low | Already corrected upstream and not propagated downstream |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 25 |
| Critical flags | 0 |
| High flags | 7 |
| Medium flags | 17 |
| Low flags | 4 |
| Unclear flags | 7 |
| Unavailable checks (data missing) | 1 |

## 5. Red-Flag Severity Verdict

**Material concerns.**

No flag rises to Critical — the underlying cash-generation engine is genuinely strong (CFO/EBITDA 160–202% in FY2023–2025, clean accrual-quality checklist, no restatement or material weakness), and the data pool itself is complete. But seven High-severity flags cluster around a single theme: the guided, "beaten" EBITDA-like metric that anchors the module's "favors beat" verdict is harder to verify and lower-quality than the headline streak suggests — its precise definition is unconfirmed in this pool, it likely still contains a recurring "one-off" legal-reserve add-back worth double-digit percentages of Adjusted EBITDA in each of the last two disclosed years, the company stopped publishing the reconciliation that would let an outsider check this quarterly, and GAAP EPS/net income (the headline numbers most investors default to) were separately inflated two years running by one-time tax items. The single most dangerous red flag is #5/#10 combined: the "favors beat" setup rests on beating a metric whose own quality is questioned elsewhere in the same module, without that caveat carried into the beat/miss verdict itself. What would resolve it: the next quarter's guided-metric composition being explicitly restated against GAAP operating income with the legal-reserve line broken out, or Uber resuming quarterly Adjusted EBITDA disclosure.

## 6. What The Synthesis Agent Should Know

- 25 red flags triggered (0 Critical, 7 High, 17 Medium, 4 Low), plus 7 Unclear flags — no flag alone invalidates the earnings setup, but the High-severity cluster should meaningfully temper the "favors beat" confidence level.
- The single most dangerous red flag: the guided EBITDA-like metric Uber has "beaten" for 4 straight quarters (a) has an unconfirmed exact definition in this pool, (b) likely still includes a recurring "one-off" legal-reserve add-back worth 6.5%–17.3% of Adjusted EBITDA in the last two disclosed years, and (c) is no longer reconciled to GAAP on a quarterly basis — so the beat streak is real on its own terms but should not be read as evidence the underlying margin story is clean.
- This red-flag scan should cap, not flip, the earnings verdict: it supports treating "Earnings accelerating" or an unqualified "favors beat" framing as overstated; a more defensible synthesis framing is "Earnings stable-to-accelerating on volume, but the margin-beat streak rests on a metric whose comparability has degraded" — this is a nuance for `99_earnings-synthesis` to weigh, not a mandate to reclassify to "Mixed."
- Recommend the synthesis apply (or explicitly note it is not applying) the MODULE_RULES caps already triggered upstream: `06`'s Earnings Quality score (71/100) already reflects the DTA/legal-reserve issues; this scan does not find grounds to lower it further, but recommends the synthesis's "Overall usefulness" narrative explicitly carry the recurring "one-off" finding forward rather than let the clean CFO/EBITDA ratio dominate the quality read on its own.
- Contradictions to reconcile: (1) `05`'s beat-streak optimism vs. `06`/business-model `12`'s accounting-quality caveats on the same guided metric — present together, do not average; (2) `07`'s GAAP-EBIT sensitivity base vs. `04`/`05`'s guided-EBITDA-like base — do not blend a GAAP-EBIT percentage move with a guided-EBITDA beat magnitude without explicit re-basing.
- Missing data that limited this scan: none data-critical. The one genuine "Unavailable" check (sub-segment revenue detail — Mobility financial-partnerships/advertising, Delivery Grocery & Retail vs. core) limits precision but does not block any conclusion in this report.
- Net read vs. upstream: the setup is dirtier than `05`'s "favors beat" headline alone suggests, but cleaner than a reader focused only on the GAAP EPS/DTA-release issue would conclude — the cash-generation engine (CFO, FCF, accrual quality) is genuinely strong and under-emphasized relative to the accounting-classification noise sitting on top of the headline profitability metrics.

## 7. Pre-Mortem — If The Earnings Setup Fails

If this "favors beat" setup turns out to be wrong, the most likely reason is that the market and this module both over-credited the 4-quarter EBITDA guidance-beat streak without pricing in that the guided metric's own comparability had degraded — specifically, a recurring "one-off" legal/regulatory reserve add-back (worth 17.3% of Adjusted EBITDA in FY2024 and 6.5% in FY2025) stops recurring favorably, or simply reverses direction the way the identical G&A line already did once (from +$549M favorable in FY2025 to −$138M unfavorable in Q2 FY26 alone), breaking the beat streak not because Trip volume or Gross Bookings weakened, but because the accounting item that had been quietly propping up the "beat the guided high end" pattern ran out — and because the module never carried `06`'s explicit quality caveat on that same metric into `05`'s "favors beat" verdict, this failure mode would look, in real time, like an unexplained miss rather than the accounting-classification reversal it actually was.



---

## earnings / RESUMED_FROM.md

_Source: `RESUMED_FROM.md`_

<!-- resumed-from: analyses/UBER_2026-08-08 | run-date: 2026-08-08 -->

# Scoped re-run — earnings

> New data invalidated part of this module, so it is **staged for a scoped rerun, not a rebuild from
> scratch**. The finished specialist orbs were carried verbatim from the run below; the orbs `00_earnings-data-triage.md`, `01_historical-financials.md`, `02_revenue-drivers.md`, `03_margin-drivers.md`, `06_earnings-quality.md`, `08_earnings-red-flags.md` and this module's synthesis
> are scoped to re-run against the refreshed pool for THIS run.
>
> **This note is written at staging time, before the rerun executes.** It records what was carried and
> what is scoped to run — it is not a claim that the rerun has finished. If the launch never starts, or
> this module's agent aborts, the work above was never actually refreshed; this module's own
> `99_*-synthesis.md` (present or not) is the ground truth for whether it completed.

- Carried from: `analyses/UBER_2026-08-08` (run dated 2026-08-08)
- Copied into: `analyses/UBER_2026-08-09`
- The carried orbs keep the vintage of the run that produced them, not this run's date.

**How to read this.** The intake plan that scoped these holes rides in THIS run root
(`intake/*_intake_plan.json`, copied verbatim from the run whose analysis produced it); it names the
documents that landed and the exact orbs they invalidate. This module is scoped to re-run exactly those
plus its synthesis, and every module downstream of it is scoped to re-run its synthesis. The rest of the
run is carried, priced and stamped.
