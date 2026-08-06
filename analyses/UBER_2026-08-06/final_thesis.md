> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**
> Headline Scorecard 'Suggested sizing'='Watch only — no position; track opportunity cost' does not match sizing_hint.action='monitor only — no position (track opportunity cost)' in decision_record.json — the position size the reader sees must be the recorded one, in full (synthesizer.md §2); scenario 'base' level 74.91 != forward_metric×multiple 75.4148 — the Playground recomputes the latter and would disagree with the recorded level; scenario 'bear_cyclical' level 40.23 != forward_metric×multiple 40.7475 — the Playground recomputes the latter and would disagree with the recorded level; scenario 'bear_structural' has no decision_record counterpart — a lever set for a case the thesis does not hold; scenario 'base' shows level 75.4148 but decision_record price_target is 74.91 (the Playground derives this from the recorded levers, disagreeing with the frozen thesis); scenario 'bear_cyclical' shows level 40.7475 but decision_record price_target is 40.23 (the Playground derives this from the recorded levers, disagreeing with the frozen thesis); verify-evidence verdict = Material issues (not Clean/Minor — integrity 67/100, see verification_report.json)
>
> Resolve the flagged items — re-run the synthesizer §14 math and/or the truth-integrity audit (`/research:verify-evidence`) — and re-publish before relying on these numbers. (CLAUDE.md §5/§10/§15; finish-gate F01/F17/F30.)

# UBER — Investment Dossier (2026-08-06)

Uber Technologies runs a two-sided marketplace app (Mobility, Delivery, Freight) that takes a commission on rides, food/goods orders, and freight loads without owning the vehicles.

Run date: 2026-08-06 | Modules: business-model, earnings, valuation, balance-sheet-survival, management-governance, catalyst | `RUN_METADATA.md`: not present for this run (non-blocking — the run appears to have been invoked module-by-module rather than via the master orchestrator; no prior dated UBER run exists to compare against).

## Table of Contents

- Part I — Investment Committee Decision
- Part II — Cross-Cutting Analysis
- Part III — Module Chapters
- Part IV — Module Appendices
- Part V — Evidence and Process

---

# PART I — INVESTMENT COMMITTEE DECISION

## 1. One-Line Decision

`Decision: Watchlist — a genuinely improving marketplace business trading close to fair value (9.0% margin of safety) is capped from a Buy by a Critical-materiality serial-acquirer flag (RF-CAP-004) on the debt-funded $14.8bn Delivery Hero deal, whose bridge facility would compress covenant headroom to near zero once drawn.`

## 2. Headline Scorecard

| Item | Answer |
|---|---|
| Rating | **Watchlist** |
| Suggested action | Do not initiate a position now. Track the FQ3 2026 print (~Oct 2026) and the Delivery Hero bridge-facility covenant terms once disclosed; revisit at the next scheduled review. |
| Time horizon | 12 months (default) |
| Expected return | +8.1% (probability-weighted, base $68.18 → $73.73 blended target) |
| Downside risk | 41.0% to the cyclical bear case ($40.23); 53.2% to a memo-only 24–36 month structural-reset floor ($31.88), not blended into the headline |
| Risk/reward | 0.20x (a thin ~$5.55/share upside cushion against a ~$27.95/share cyclical-bear drop) |
| Understanding /100 | 62.5 |
| Conviction /100 | 48.0 |
| Suggested sizing | Watch only — no position; track opportunity cost |
| Thesis type | Company-specific; Sector-cycle |
| Variant perception — edge score /100 | 40 (below the 50 threshold — confidence capped at 60 regardless of decision) |
| Biggest upside driver | The market's implied bar (14.7% FCFF growth, 12.8% terminal margin) sits below what Uber already delivers (LTM EBIT margin 12.1%, Mobility EBITDA margin 26.6%) and below consensus (18.6% CAGR, 16.0% margin) — a re-rating case that is evidenced but not yet earned through a full cycle |
| Biggest downside driver | The Delivery Hero acquisition's ~€14bn bridge facility (undisclosed covenant terms) would compress the assumed covenant cushion from +62–72% today to a breach on as little as a 0.9%–25.5% EBITDA decline once drawn |
| Killer risk | The Delivery Hero deal closing and drawing its bridge facility without adequate disclosed covenant headroom, at the exact moment leverage discipline is least proven (RF-CAP-004) |
| Avoid-Big-Risks filters tripped (§24) | Filter 4 (serial acquirers, RF-CAP-004, Critical materiality); Filter 5 (fast-changing industry, RF-BQ-005) |
| Rating cap, if any | **RF-CAP-004 (serial-acquirer pattern) caps the rating at Watchlist — no bypass regardless of thesis type or edge score (eval check AD)** |

## 3. Would I Buy This With Real Money Today?

**Final answer: I would not buy this today** because the cushion I am being paid to take the risk (a 9.0% discount to base-case fair value) is roughly one-quarter the size of the loss I am exposed to if the cyclical bear case plays out (41.0%), and the single largest item on the forward calendar — the $14.8bn, debt-funded Delivery Hero acquisition — is a Critical-materiality red flag under the engine's own serial-acquirer rule (RF-CAP-004), not a reason to get more constructive. This is a real business with a genuine margin lead over its two closest named ride-hailing peers, but the price is not currently paying me enough to own the acquisition risk sitting on top of it.

- **Confidence score:** Conviction 48/100; Understanding (how well the situation is evidenced) 62.5/100.
- **Position stance:** No position. Track, do not own.
- **What would raise confidence:** (1) the Delivery Hero bridge facility's actual covenant terms, showing real post-draw headroom; (2) a third consecutive quarter of return on capital clearing the ~8.1% cost-of-capital estimate, closing the "no moat proven" gap; (3) the FQ3 2026 10-Q's MD&A revenue bridge resolving whether the ~10pp Gross-Bookings-to-Revenue gap is accounting noise or real price erosion.
- **What would lower confidence:** A further large debt-funded acquisition announced before Delivery Hero even closes; a covenant breach or waiver disclosed post-draw; a driver-classification ruling in a major market; a third straight quarter of revenue missing the Street.
- **What would force exit/rejection:** A confirmed covenant breach, a leverage overshoot past management's own (unverified) <2x gross-leverage target, or a major-market employment-reclassification ruling that structurally reprices the independent-contractor cost base.

## 4. The Actual Variant Perception

- **What everyone already knows:** Uber is the largest global ride-hailing/delivery marketplace, has turned consistently profitable (operating income $(1,832)mm FY2022 → $5,565mm FY2025), is buying back stock, and has signed a large, debt-funded acquisition of Delivery Hero (announced 2026-07-16, public knowledge). Driver-classification regulatory risk and an AV-partnership strategy (not owned technology) are widely discussed.
- **What is probably priced in:** A cautious, not aggressive, growth case. The reverse-DCF shows the current $68.18 price requires only 14.7% FCFF growth and a 12.8% terminal margin — both below Uber's own consensus-anchored case (18.6%/16.0%) and below what Uber already delivers (12.1% LTM EBIT margin). The market is already discounting Uber's "no moat proven" finding (ROIC below WACC on a 3-year average) and the capital-allocation risk of the M&A program; that is part of why Uber trades at a 17.5% NTM EV/EBITDA discount to its four-name core peer set despite having the group's highest margin.
- **What the engine thinks may be missed:** (1) The Delivery Hero bridge facility's forward covenant compression is not visible in ANY currently reported balance-sheet ratio (leverage today is 1.32x GAAP EBITDA) because the debt has not been drawn yet — the risk is real and quantified by the balance-sheet-survival module's own stress test (0.9%–25.5% EBITDA-decline breach threshold post-draw) but sits outside what a screen of today's reported numbers would show. (2) SG&A leverage — the single largest quantified earnings sensitivity (±$780mm) — has already begun reversing (LTM ratio 20.50% vs the FY2025 low of 19.87%), ahead of when it will show up clearly in a headline Adjusted EBITDA miss. (3) The ~10-percentage-point gap between Gross Bookings growth (+22% YoY) and reported Revenue growth (+12.2% YoY) remains unreconciled against any primary filing — management calls it "optical" (a UK accounting reclassification), but that claim is unverified.
- **What evidence proves we are actually different:** This is a testable, falsifiable claim, not a restated consensus view. If the FQ3 2026 print (reported ~late October 2026, guided 2026-08-05) shows the LTM SG&A ratio continuing to rise past 20.50% AND reported Revenue growth continuing to lag Gross Bookings growth by a similar or wider gap with no primary-filing reconciliation offered, that would confirm the margin/re-rating case is more fragile than the market's already-cautious bar assumes. Conversely, if the Delivery Hero bridge facility's actual covenant package (once disclosed, expected ahead of the H2 2027 close) shows real post-draw headroom, the balance-sheet risk this dossier flags would be refuted. Edge score: **40/100** — evidence-based and falsifiable, but not yet strong enough to clear the 50-point threshold that would unlock conviction above 60. Confidence is therefore capped regardless of anything else in this dossier.

## 5. Thesis → Antithesis → Final Thesis

- **Thesis:** Uber's cost/scale edge over Lyft and DiDi (Mobility EBITDA margin 26.6% vs near-zero/negative) is durable, and the market's cautious bar (14.7% FCFF growth) leaves room for a modest re-rating toward peer multiples.
- **Antithesis:** Through-cycle return on capital (6.2% 3-year average) still sits below the ~8.1% cost-of-capital estimate — the margin lead has not yet cleared the bar that defines an economic moat, and the modest re-rating this thesis needs is evidenced but not earned.
- **Revised thesis:** Even granting the margin lead is real, the single largest capital decision management has made in the last 18 months — the debt-funded, $14.8bn Delivery Hero acquisition — is a Critical-materiality red flag (RF-CAP-004) that must cap conviction regardless of the underlying business quality, per the engine's own no-bypass rule.
- **Antithesis:** The organic capital-allocation record (excluding M&A) is genuinely value-creative — incremental ROIC 25–35%, buybacks that actually shrank the share count — and the board is independently strong (90% independent, zero disclosed related-party transactions). This is not a governance failure; it is one specific, quantifiable capital-allocation risk sitting on top of an otherwise reasonable operator.
- **Final thesis:** Watchlist. The business is better than "average," but the price does not yet compensate for the acquisition risk, and the rating cap is mechanical, not a judgment call this synthesis is free to override.
- **Insight threshold reached:** the remaining uncertainty is mostly data-dependent (the Delivery Hero bridge covenant terms, the FQ3 2026 revenue-bookings reconciliation), not reasoning-dependent.

## 6. Simple Summary

- **What it does:** Runs an app connecting riders, food/grocery customers, and shippers with independent drivers, couriers, and truckers — it owns the software and payment rails, not the vehicles.
- **Why it may go up:** It already has the best margin among its named ride-hailing peers, cash flow keeps growing (CFO $10,099mm in FY2025), and the market's implied growth bar is below what the company already delivers.
- **Why it may go down:** The pending $14.8 billion Delivery Hero acquisition is financed by a large bridge loan whose repayment terms are not yet public — once drawn, an ordinary recession could trip an assumed loan covenant. Net debt already doubled to $9.3 billion before that loan is even drawn.
- **What data supports the thesis:** Cash-backed earnings (CFO consistently above Adjusted EBITDA), a clean current balance sheet (1.32x leverage), an independent board, and a same-day earnings transcript confirming two straight quarters of profit beats.
- **What data is missing:** No primary SEC filing (10-K/10-Q) anywhere in the data pool — every number here is a Capital IQ vendor transcription; no disclosed loan-covenant terms for either Uber's existing debt or the new Delivery Hero bridge facility; no read compensation-plan disclosure (though the underlying proxy has been located).
- **Buy now or wait:** Wait. The cushion (9.0%) is too thin relative to the downside (41.0% to the bear case) while the acquisition-risk flag stands.
- **The one next thing to check:** The Delivery Hero bridge facility's actual covenant package — the single document that would resolve whether the forward leverage risk is real or manageable.

---

# PART II — CROSS-CUTTING ANALYSIS

## Decision Audit Trail

| Decision Driver | Bull Evidence | Bear Evidence | Which Side Wins? | Why? | Confidence /100 |
|---|---|---|---|---|---:|
| Is Uber's margin lead a real economic moat? | Mobility EBITDA margin 26.6% (FY2025) vs Lyft near-zero, DiDi negative; ROIC risen every year for 5 years, -9.4% → 10.6% LTM [`business-model/09_moat.md`] | 3-year average ROIC (6.2%) sits below an estimated ~8.1% WACC; only FY2024–FY2025 individually clear that bar, and both years are flattered by a combined $10.1bn non-cash deferred-tax benefit [`business-model/09_moat.md`; `earnings/06_earnings-quality.md`] | Bear (partially) | The through-cycle test — not the single best year — is the correct standard per CLAUDE.md §9 base-rate discipline; the moat is "in structure, not yet in economics" | 72 |
| Is the Delivery Hero acquisition a reason to raise or lower conviction? | Doubles Uber's delivery footprint to ~100 countries; management communicates a $1.2bn run-rate synergy target | Debt-funded, 10.6% of Uber's own market cap, 7+ bolt-ons in 18 months preceding it, $4bn pulled from a buyback promise to help fund the stake, forced $1.6bn antitrust divestiture, RF-CAP-004 Critical materiality [`management-governance/02_capital-allocation-scorecard.md`] | Bear (mechanically) | §24 Filter 4 + Rating Cap Rules: RF-CAP-004 caps the rating at Watchlist with no bypass, regardless of thesis type or edge score (eval check AD) | 85 |
| Is the current balance sheet safe? | Net leverage 1.32x GAAP EBITDA / 0.98x Adjusted; committed liquidity + FCF exceed even a 100% EBITDA wipeout; no finite liquidity runway exhaustion [`balance-sheet-survival/99`] | Once the Delivery Hero bridge is drawn, pro-forma leverage runs 5.0x–6.6x mid-cycle EBITDA and an assumed covenant would breach at just 0.9%–25.5% EBITDA decline; the covenant terms themselves are undisclosed | Bull today, Bear forward | The disclosed balance sheet genuinely is "Adequate" — but the forward risk is real, evidenced, and not yet priced into any current ratio | 68 |
| Is revenue decelerating or is that an accounting artifact? | Management calls the ~10pp bookings-to-revenue gap "optical" (UK reclassification), consistent with the smooth Adjusted EBITDA margin trend | The claim is unverified against any primary filing; reported revenue growth (+12.2% YoY) is genuinely the second-slowest of the last 8 quarters and missed the Street twice running [`earnings/99`] | Unresolved — conservative default applies | No primary filing exists in this pool to confirm either reading; per CLAUDE.md §4 the more conservative (reported-revenue) framing is weighted at least as heavily | 40 |
| Is this a value opportunity or fairly priced? | Base fair value $74.91 is +9.9% above the $68.18 price; three of four value-producing methods land within a reasonable spread once reconciled | The 9.9% gap sits just inside the "fairly valued" band (not "modestly undervalued"); margin of safety is a thin 9.0%; downside to the bear case (41.0%) is 4.6x the upside cushion | Bear (asymmetry) | Risk/reward of 0.20x is a genuinely poor ratio even though the base case is technically positive-expected-value | 70 |

## 6. Valuation and Peer Mispricing

This section defers in full to `analyses/UBER_2026-08-06/valuation/99_valuation-synthesis.md`.

**Verdict: Fairly valued** (base-case fair value $74.91 is +9.9% above the $68.18 pool-verified price — just inside the ±10% "fairly valued" band, one point from "modestly undervalued"). Bull $104.89 / Base $74.91 / Bear-cyclical (12-month) $40.23 / Bear-structural (24–36 month avoid-ruin floor, memo only) $31.88.

| Metric | Uber (NTM) | Core Peer Median (Lyft, DoorDash, DiDi, Grab) | Premium / Discount | Interpretation |
|---|---:|---:|---:|---|
| EV/EBITDA | 11.89x | 14.42x (raw) | -17.5% | Discount only partly warranted — Uber has the group's highest EBITDA margin (13.5% LTM) |
| P/E | (below peer median) | — | -38.5% | Reflects "no moat proven" and the serial-acquirer capital-allocation risk, not just cyclicality |
| Applied quality-adjusted multiple | 13.0x | — | 10% haircut to peer median | Reflects an explicit, evidenced quality discount, not a blanket comp mismatch |

Three possible reasons for the gap, per the valuation module's own reconciliation:
1. **True mispricing** — Uber's margin lead is real and understated by the raw peer multiple.
2. **Warranted-multiple discount, not a value trap** — no misaligned controlling owner exists (RF-OWN-004 not triggered), so this is not ownership-driven cheapness; it is a "no moat proven yet" discount that is evidenced but not disproven.
3. **Capital-allocation risk discount** — the market may already be pricing some of the Delivery Hero/serial-acquirer risk into the multiple, which would mean today's 17.5% discount is doing real work, not offering free upside.

The DCF (terminal value 77.1% of EV) is capped at valuation confidence 60 and is not the trusted method; the peer-relative read (68% weight) is. Cross-method dispersion ($51.15 SOTP conservative-comp to $115.44 own-history illustrative-only) was reconciled as a comparable-selection artefact, not a fundamental disagreement, per the valuation synthesis.

## 7. Catalyst Calendar

This section defers in full to `analyses/UBER_2026-08-06/catalyst/99_catalyst-synthesis.md`. **Verdict: Catalysts exist but timing is vague** (Timing visibility 38/100; Catalyst strength capped at 50 because the single largest catalyst, Delivery Hero, is §24-flagged and must not be read as conviction-lifting).

| Date / Window | Catalyst | Why It Matters | Bullish Trigger | Bearish Trigger |
|---|---|---|---|---|
| ~2026-10-29 (web-sourced estimate; guidance itself is proven) | FQ3 2026 results | Third straight test of the beat streak; guided Adj. EBITDA $2,860–$2,960mm, Adj. EPS $0.84–$0.88 | Adj. EBITDA clears $2,960mm for a 3rd straight quarter; Revenue stabilizes | Revenue misses a 3rd straight quarter; insurance-cost tailwind reverses with no disclosed buffer |
| ~early Feb 2027 (inference from reporting cadence) | FQ4 2026 results (seasonally strongest quarter; first quarter AV/DH costs could be sized) | Tests whether Delivery Hero/AV costs start eroding the seasonal margin peak | Raised guide with AV/DH costs small relative to base | Held-flat/cut guide, or a large newly-disclosed cost line |
| ~by Jun-2027 (rolling window) | Repayment/refinancing of $1,997mm unidentified new short-term debt | Largest disclosed near-term balance-sheet unknown; instrument and true terms undisclosed | Rolls over routinely against >4x liquidity coverage | Unfavorable terms or a change-of-control trigger surfaces |
| **H2 2027 (bounded window)** | **Delivery Hero SE acquisition close** ($14.8bn, ~€14bn bridge facility) | The single largest catalyst on the calendar — 10.6% of Uber's own market cap — **§24 Filter 4-flagged; not conviction-lifting** | Closes on schedule, antitrust divestiture clean, synergies begin showing | Slips past H2 2027, antitrust block, leverage overshoot, €700mm termination fee triggers |
| 2028-05-15 / 2028-12-01 (proven, filing-sourced) | FY2028 debt maturity cluster ($2,850mm, 19.3% of total debt) | First real maturity wall after the thin 2026–2027 window | Refinanced at a modest step-up (BBB+ rating, $10bn+ FCF) | Uber's own credit spread widens materially (e.g., on a DH leverage overshoot) |
| Undated / thematic | Buyback-framework resumption (paused after $4bn redirected to the DH stake) | Largest capital-return signal for the next 12 months, no scheduled resumption date | Resumes near the pre-pause ~50%-of-FCF rate | Stays paused/throttled well beyond the DH close |
| Undated / thematic | Driver/worker-classification ruling in a major market | Management's own top-named external risk; UK reclassification already cut ~400bps of Mobility take rate | Jurisdiction resolves in Uber's favor | A major market reclassifies drivers as employees |

## 8. Scenario Model

Fair-value levels are adopted verbatim from `valuation/99_valuation-synthesis.md` (labels `bull` / `base` / `bear_cyclical` / `bear_structural`); this synthesis assigns the probabilities. `bear_structural` is a memo-only 24–36 month avoid-ruin floor, per the valuation module's own instruction — **not blended into the probability-weighted headline set below** (its three headline scenarios sum to 100%); it is carried instead into the Kill Criteria (§10) and Risk Register (§9) as a tail-risk marker.

| Case | Probability | Return | Price Target | What Must Happen |
|---|---:|---:|---:|---|
| bull | 25% | +53.9% | $104.89 | Bookings growth re-accelerates (~+4pp vs FY2025 pace) AND SG&A leverage resumes improving AND the insurance-cost tailwind is banked, not reinvested AND the Delivery Hero deal closes cleanly AND the market grants a multiple above the raw peer median (14.42x) |
| base | 50% | +9.9% | $74.91 | Consensus growth/margin path holds; market closes roughly a third of today's EV/EBITDA discount to the quality-adjusted peer level (13.25x, still below the raw 14.42x median) |
| bear_cyclical | 25% | -41.0% | $40.23 | Bookings deceleration continues while cost base cannot flex down fast enough (SG&A already reversing); multiple compresses toward Lyft's 7.94x; 12-month cyclical trough |
| *bear_structural (memo, not blended)* | *n/a (24–36 month tail)* | *-53.2%* | *$31.88* | *A major-market driver-classification ruling or AV disintermediation triggers a non-recovering 8.0% terminal EBIT margin and -2.0% terminal growth* |

**Common driver check:** the bull and base cases share the same underlying variable (whether the market grants a higher EV/EBITDA multiple on durable margin gains); the bear_cyclical and bear_structural cases share a different common variable (regulatory/competitive cost-structure pressure). The bull/base spread and the bear spread are therefore each internally correlated, not three independent draws — a bad print on SG&A or bookings growth would likely move both the base and bear cases together, not just one.

**Math (executed, not eyeballed):**

```
Sum of probabilities: 25% + 50% + 25% = 100%  ✓
Expected return = 0.25×53.84% + 0.50×9.87% + 0.25×(-40.99%) = 8.15%
Probability-weighted target = 0.25×$104.89 + 0.50×$74.91 + 0.25×$40.23 = $73.73
Expected return from target = ($73.73 − $68.18) / $68.18 = 8.15%  ✓ reconciles
Downside risk = −min(returns) = −(−40.99%) = 41.0%
Risk/reward = ($73.73 − $68.18) / ($68.18 − $40.23) = $5.55 / $27.95 = 0.20x
Margin of safety = ($74.91 − $68.18) / $74.91 = 8.98% ≈ 9.0%
```

Main upside driver: a modest re-rating toward peer multiples on durable margin gains. Main downside driver: cost-base inflexibility meeting a bookings slowdown, compounded by the (excluded from this headline math but real) Delivery Hero leverage tail. **Is the expected return worth the risk? No** — a 0.20x risk/reward and a rating already capped at Watchlist by RF-CAP-004 argue for tracking, not owning, at the current price.

## 9. Risk Register

| Risk | Severity /100 | Probability /100 | Early Warning Signal | How To Monitor |
|---|---:|---:|---|---|
| Earnings risk (bookings-vs-revenue gap; SG&A reversal) | 55 | 55 | LTM SG&A ratio rising past 20.50%; a 3rd straight revenue miss vs Street | FQ3 2026 print (~Oct 2026) |
| Valuation risk (margin treated as a peak, not a new normal) | 60 | 45 | NTM EV/EBITDA multiple stays at/below 11.89x rather than re-rating | Quarterly multiple tracking vs the 4-name core peer set |
| Balance-sheet risk — forward (Delivery Hero bridge covenant compression) | 80 | 45 (contingent on deal closing on the current bridge structure) | Bridge term sheet disclosure showing <10% post-draw headroom | Track the DH deal's financing disclosures through H2 2027 |
| Off-balance-sheet / contingent liability risk (RF-OBS-001) | 50 | 35 | Further growth in the $5,611mm gross unrecognized tax benefit (already +13.7% YoY) | Next annual filing's tax-contingency note |
| Regulatory / policy risk (driver classification) | 75 | 30 | A major-market ruling or codified employee-reclassification law | Ongoing city/state/EU policy tracking |
| Capital-allocation / governance risk (RF-CAP-004, serial acquirer) | 70 | 50 | A further large debt-funded deal announced before DH closes; leverage overshoot past the (unverified) <2x target | Quarterly leverage disclosure through DH close |
| Execution risk (Delivery Hero integration; concurrent ~$10bn AV spend) | 60 | 40 | Synergy target ($1.2bn run-rate, management-communicated, unquantified in filings) not itemized post-close | Post-close integration disclosures (H2 2027+) |
| Thesis timing risk (vague catalyst dates) | 45 | n/a | Only the FY2028 debt cluster is a proven, filing-sourced date | Catalyst module's own Timing-visibility score (38/100) |
| Macro/input-cost risk (insurance-cost tailwind fully reinvested, zero buffer) | 55 | 35 | Insurance/driver-incentive cost line reverses with no offsetting lever | Quarterly COGS ratio (currently 61.5% of revenue) |

**Correlation note:** the balance-sheet risk, capital-allocation risk, and execution risk all share the same underlying driver — the Delivery Hero deal and its financing — so their joint materialization (deal closes, bridge draws, leverage overshoots, AND integration disappoints) is the real tail scenario, not three independent 40–50% shots. This compounded downside is the basis for the bear_structural memo floor and is not fully captured in the headline 25%-probability bear_cyclical case.

## 9b. Governance & Stewardship

This section defers in full to `analyses/UBER_2026-08-06/management-governance/99_management-governance-synthesis.md` and supersedes the business-model module's capital-allocation-governance quick-read.

- **Stewardship verdict:** Standard / mixed. Governance Score 49/100 (Weak band); Confidence-Adjusted Governance Score 32/100 (confidence 65/100).
- **Capital allocation:** capped at 50/100 by the serial-acquirer pattern (RF-CAP-004, Critical materiality) — organic capital allocation is value-creative (incremental ROIC 25–35%, net share count −2.2%), but the M&A program is the dominant, least-proven, highest-risk decision.
- **Incentive alignment:** 10/100 (capped max 50) — unproven, not disproven; no compensation-metric disclosure was actually read despite the underlying FY2026 DEF 14A having been located by the module.
- **Board quality:** genuinely strong — 90% independent directors, no poison pill, no dual-class stock, zero disclosed related-party transactions above $120,000, confirmed from a primary SEC EDGAR pull.
- **Insider ownership:** 0.18% combined, almost entirely stock-compensation-derived rather than bought; net insider activity is modest, mechanical selling.
- **Red-Flag Register carried into Risk Register (§9) and Kill Criteria (§10):**
  - **RF-CAP-004** (Critical materiality; not a hard-lock tier flag, but caps capital allocation at 50/100 and floors governance risk at 60) — serial-acquirer pattern, $14.8bn Delivery Hero deal.
  - **RF-DISC-002** (High) — ~25% of Adjusted EBITDA's own addback never itemized; a combined $10.1bn two-year deferred-tax benefit inflated GAAP net income and was never flagged as a distortion on any call.
- **No hard disqualifier flagged** by `business-model/01_disqualifier-scan.md`.

**Verdict-lock check:** no Critical hard-lock red flag (fraud/going-concern/enforcement/restatement/RPT>10%) exists per the module's own reconciliation, so the §13 universal verdict-lock ("Serious governance concerns") is not independently triggered. The rating cap here comes from the separate, non-bypassable §24 Filter 4 mechanism (RF-CAP-004), which lands at the same place (Watchlist) via a different, mechanical rule.

## 9A. Bull Case — Steelman

| Bull Driver | Why it could dominate | Evidence today (cited) | What would confirm it |
|---|---|---|---|
| Pricing power / margin durability (business-model) | Mobility's cost/scale edge over Lyft and DiDi could be a genuine, widening structural advantage rather than a cyclical peak | Mobility EBITDA margin 26.6% FY2025 (up from 19.2% FY2020); ROIC risen every year for 5 straight years [`business-model/09_moat.md`] | A 3rd consecutive year of ROIC clearing the ~8.1% WACC estimate |
| Beat-streak setup (earnings) | Adjusted EBITDA/EPS have beaten guidance highs twice running; cash conversion is genuinely clean (CFO 115.7% of Adj. EBITDA) | [`earnings/99` §1A] | A 3rd straight Adj. EBITDA beat at or above the $2,960mm guidance high end |
| De-rating reversion (valuation) | Uber trades at a 17.5% NTM EV/EBITDA discount to peers despite having the group's highest margin; the reverse-DCF bar is achievable, not stretched | [`valuation/99` §1] | NTM EV/EBITDA multiple moving from 11.89x toward 13.0x+ |
| Deleveraging optionality (balance-sheet-survival) | The disclosed balance sheet today is genuinely strong (1.32x leverage, no finite liquidity exhaustion), and buybacks/asset sales (e.g., the ~$3.8bn AV-partner equity stakes) are real, non-speculative levers if the Delivery Hero draw needs to be offset | [`balance-sheet-survival/99` §6A] | The DH bridge terms disclosing a real amortization/paydown mechanism |
| Capital-return step-up (catalyst) | The paused ~50%-of-FCF buyback framework resuming near pre-pause levels would be a clean, evidenced positive catalyst not yet priced with a date | [`catalyst/99` §2] | A confirmed resumption announcement with cadence and size |

If forced to argue the opposite of the headline Watchlist verdict: the single most credible bull case is that the market has already priced in most of the Delivery Hero risk (the deal has been public since 2026-07-16, and the stock still trades at a peer discount despite the best-in-class margin), so the RF-CAP-004 cap may be penalizing a risk the price already reflects rather than one still to be discovered. The single piece of evidence that would most move this dossier toward that view is the bridge facility's actual covenant terms showing real headroom — at which point the serial-acquirer flag would remain a documented risk but the "undisclosed, near-zero headroom" tail this dossier weights most heavily would be resolved.

## 10. What Would Kill the Thesis?

### Thesis Kill Criteria

| Kill Criteria | What It Would Mean | How To Monitor | Module Source |
|---|---|---|---|
| Delivery Hero bridge facility discloses a covenant threshold with <10% post-draw headroom, or a covenant breach/waiver is disclosed within 4 quarters of the draw | The forward leverage risk this dossier flags as its single killer risk is confirmed, not hypothetical | Bridge-facility financing disclosures through H2 2027 close | balance-sheet-survival |
| Revenue misses the Street for a 3rd straight quarter AND the LTM SG&A ratio continues rising past 20.50% | The margin/re-rating case underlying the base and bull scenarios is genuinely fragile, not merely decelerating on optics | FQ3 2026 print (~Oct 2026) | earnings |
| A further large debt-funded acquisition is announced before Delivery Hero even closes, or gross leverage overshoots the (unverified) <2x target | Management repeats the exact pattern that triggered RF-CAP-004, confirming the serial-acquirer risk rather than resolving it | Quarterly leverage and M&A disclosures | management-governance |
| A driver-classification ruling or new law in a major market (US or EU) reclassifies gig drivers as employees | The independent-contractor cost structure underpinning both Mobility and Delivery is repriced simultaneously — the business-model module's own named "biggest business-model risk" | Ongoing city/state/EU regulatory tracking | business-model |
| The NTM EV/EBITDA multiple compresses further toward Lyft's 7.94x rather than re-rating, confirming the market treats current margins as a peak | The valuation case's central assumption (an evidenced but not-yet-earned re-rating) is refuted | Quarterly multiple tracking vs the 4-name peer set | valuation |

## 11. Positioning and Trade Construction

- **Position type:** No position — Watchlist, per the decision. This is not a "starter position with a tight stop"; the RF-CAP-004 cap is a documented, non-bypassable conviction ceiling, not a sizing question.
- **Entry style (if the setup improves):** Wait for either (a) the Delivery Hero bridge covenant terms to be disclosed with real headroom, or (b) the price to fall toward or through the cyclical bear case ($40.23) on confirmed fundamentals (not merely sentiment), which would meaningfully improve the risk/reward from today's thin 0.20x.
- **Add levels:** Not applicable — no position initiated.
- **Stop-loss logic:** Not applicable while on Watchlist. If a starter position is later initiated (post-cap resolution), be explicit that **a stop may not protect against an earnings-gap move** — Uber has already shown two-sided quarterly surprises (Adjusted EBITDA beats, Revenue misses) in the same print, and the next scheduled catalyst (FQ3 2026, ~Oct 2026) sits inside any near-term holding window.
- **What not to do:** Do not treat the Delivery Hero deal's size as a reason to get more bullish — both the business-model and catalyst modules independently flag this as a risk to size, not a conviction-lifting catalyst.
- **Hedge:** No hedge is recommended given no position is being taken. If exposure exists via other means (e.g., a sector ETF), no options/positioning data exists in this pool to make a specific options recommendation — that itself is a documented data gap (module absence, capped at 80 in the confidence framework).

## 12. 2nd Best Bet

**Lyft, Inc. (LYFT)** — the most directly related, lower-risk expression of the same core thesis vector (US ride-hailing marketplace economics).

- **Why it is #2:** Lyft is the named comparable this dossier's own valuation and business-model modules use throughout — Uber's Mobility margin lead (26.6% vs Lyft's near-zero EBITDA margin) is the central "real edge" this dossier credits, and Lyft is a pure-play way to test the sector-cycle thesis (is US ride-hailing consolidating around scale economics?) without the serial-acquirer capital-allocation risk (Filter 4) that caps this dossier's UBER rating.
- **How it diversifies the main thesis:** Removes the Delivery Hero / debt-funded M&A risk entirely — Lyft has no comparable pending acquisition in this pool's evidence — while keeping exposure to the same regulatory/driver-classification risk and the same demand-cycle variable.
- **Why it may be safer or more convex:** Safer in the sense of no serial-acquirer conviction cap; more convex in the sense that Lyft trades at a much lower absolute multiple (7.94x NTM EV/EBITDA per the peer set used in this dossier's SOTP), so any sector-wide re-rating would move it proportionally further — though this dossier has not run a full Lyft-specific valuation and this is a directional observation, not a quantified target.
- **What catalyst would make it better than the main idea:** If Uber's own catalyst calendar shows the Delivery Hero risk materializing (a slip, an antitrust block, or a leverage overshoot) while the underlying US ride-hailing demand cycle stays intact, Lyft would capture the sector upside without the company-specific capital-allocation drag.

**Alternative (event-driven, not a directional 2nd bet):** Delivery Hero SE itself is the counterparty to Uber's largest catalyst — a merger-arbitrage position capturing the spread to the €41.50/share cash offer is a genuinely related, differently-shaped way to express a view on the same event without taking on Uber's own capital-structure risk. This dossier did not evaluate Delivery Hero's own fundamentals, deal-break risk, or arb spread and this is not a rated recommendation — it is named here only because it is directly, evidentially connected to this dossier's single most important catalyst.

## 13. Thesis → Antithesis Iteration

### Thesis 1
Uber's margin lead over Lyft and DiDi is a real, widening structural advantage, and the market's cautious growth bar leaves room for a modest valuation re-rating.

### Antithesis 1
The margin lead has cleared the cost-of-capital bar for only two of the last three years — a through-cycle test, not a single strong year, is the correct standard, and the moat verdict itself reads "no moat proven."

### Revised Thesis 2
Even granting the moat question is genuinely open (not resolved against Uber), the price already reflects a cautious bar, so the stock is closer to fair value than a screen of "great margins, cheap peer multiple" alone would suggest — this narrows, but does not eliminate, the case for patience.

### Antithesis 2
The single largest capital-allocation decision on the table — the debt-funded Delivery Hero acquisition — is independently a Critical-materiality red flag (RF-CAP-004) under the engine's own rejector-filter doctrine, and that filter caps the rating at Watchlist with no bypass clause, regardless of how the valuation or moat debate resolves.

### Final Thesis
Watchlist. This is a mechanical, evidence-based cap, not a close judgment call — the underlying business debate (moat: open; valuation: fairly valued, thin cushion) would likely land at Watchlist on its own merits, and the RF-CAP-004 cap removes any ambiguity about whether a higher rating could be justified today.

**Insight threshold reached: the remaining uncertainty is mostly data-dependent, not reasoning-dependent.** The single document that would most change this analysis — the Delivery Hero bridge facility's covenant terms — is not a reasoning gap; it is a document that does not yet exist in public form.

## 14. Math Validation

- Sum of scenario probabilities: 25% + 50% + 25% = **100%** ✓
- Probability-weighted expected return: 0.25×53.84% + 0.50×9.87% + 0.25×(−40.99%) = **8.15%**
- Probability-weighted target price: 0.25×$104.89 + 0.50×$74.91 + 0.25×$40.23 = **$73.73**
- Expected return from target price: ($73.73 − $68.18) / $68.18 = **8.15%** — reconciles exactly with the direct calculation above
- Risk/reward: ($73.73 − $68.18) / ($68.18 − $40.23) = **0.20x**
- Downside risk: −min(53.84%, 9.87%, −40.99%) = **41.0%**
- Margin of safety: ($74.91 − $68.18) / $74.91 = **9.0%**

**Sensitivity note:** the base case is most sensitive to the single assumption that the market grants Uber a 13.25x NTM EV/EBITDA multiple (vs. today's 11.89x) — a re-rating the valuation module itself calls "evidenced but not yet earned." If the market instead treats the current margin level as a cyclical peak (the bear case's own framing), the multiple stays near 11.89x and both the base case's modest upside and the bull case's larger upside collapse toward the bear case. This single assumption, not the probabilities chosen here, is the dominant driver of whether this dossier's expected return is positive or negative.

All figures above are copied verbatim into `decision_record.json` (`expected_return_pct`, `downside_risk_pct`, `risk_reward`, `margin_of_safety_pct`) and the §2 Headline Scorecard — no re-typing, no divergence.

---

# PART III — MODULE CHAPTERS

## Chapter A: Business Model

*(Compressed per the No-Bloat Rule — full text at `analyses/UBER_2026-08-06/business-model/99_business-model-synthesis.md`)*

**Verdict: Average business — worth deeper work only if valuation is cheap.** No disqualifier triggered. Business clarity 68/100, Business quality 47/100 (Mixed/Average, low end), Moat 60/100 (strongest source: Scale; overall verdict "No moat proven"), External dependency risk 42/100 (inverted; Regulation rated High), Capital allocation & governance 50/100 (capped by Filter 4), Overall usefulness 62/100 (capped at 70 by Filter 4).

Mobility drives the business: 57.0% of FY2025 revenue, 90.5% of total EBITDA ($7,899mm of $8,730mm). Mobility's segment EBITDA margin reached 26.6% in FY2025 (up from 19.2% in FY2020) — well above Lyft's near-zero and DiDi's negative margins, a real, widening cost/scale advantage. But 3-year average return on capital (6.2%, FY2023–FY2025) sits below an estimated ~8.1% cost of capital; only the most recent two years individually clear that bar, and both are flattered by non-cash tax items. Freight is EBITDA-negative and shrinking (-27% revenue over 3 years).

**Rejector-filter caps (§24):** Filter 4 (serial acquirers) TRIPPED — at least 7 bolt-on deals in ~18 months plus the pending $14.8bn, debt-funded Delivery Hero acquisition; caps capital allocation at 50/100 and overall usefulness at 70/100. Filter 5 (fast-changing industry) TRIPPED (RF-BQ-005) — industry rate-of-change scored 35/100 (≤40 threshold); caps business quality at 65/100 (non-binding on the actual 47) and flags this as a sector/technology-cycle bet, not a settled durable compounder.

Biggest business-model risk: driver/worker-classification regulation could reprice the independent-contractor cost structure across Mobility and Delivery simultaneously — already demonstrated this quarter by a UK reclassification that cut Mobility's reported take rate by roughly 500bps.

Biggest missing data point: the primary FY2025 10-K or FQ2 2026 10-Q — every module built its segment, geography, unit-economics, and governance read from Capital IQ vendor exports rather than the filing's own risk factors, MD&A, segment note, and RPT disclosure.

## Chapter B: Earnings

*(Compressed per the No-Bloat Rule — full text at `analyses/UBER_2026-08-06/earnings/99_earnings-synthesis.md`)*

**Verdict: Mixed earnings setup.** Earnings quality 68/100 (cash-backed but GAAP net income/EPS distorted by non-cash tax benefits). Consensus setup 45/100 (bar is fair, not low — consensus already sits at, not below, the new guidance midpoints). Earnings volatility 45/100 (Low confidence — no company-disclosed sensitivity table). **Red-flag severity verdict: Material concerns** (high-severity flags present).

Adjusted EBITDA margin has expanded every quarter for 2+ years (15.11% → 19.86%) and beaten guidance highs twice running. But reported revenue growth decelerated to the two weakest quarters of the last eight (+14.5%, +12.2%) and missed the Street both times. Mobility Gross Bookings grew +22% YoY for a fourth straight quarter — a ~10pp gap to reported revenue that cannot be cleanly decomposed from this pool; management's "optical, UK reclassification" explanation is unverified against any primary filing.

GAAP EPS ($4.56 → $4.73, FY2024→FY2025) is dominated by a non-cash, two-years-running deferred-tax benefit ($5,758mm + $4,346mm); normalized EPS ($0.73 → $1.70) is the cleaner comparison. CFO has exceeded Adjusted EBITDA every year since FY2023 (115.7% FY2025, 103.8% TTM).

**Leverage note (Trigger B fired):** net debt more than doubled YoY — $3,816mm (Jun-2025) → $9,340mm (Jun-2026), +144.8% — driven by the Delivery Hero pre-funding. Current ratio (0.93x net debt/Adjusted EBITDA) is low, but the direction is up.

Neither RF-EQ-001 (rising accruals) nor RF-EQ-002 (cash-conversion breakdown) fired — CFO/Adjusted EBITDA stayed above 70% in all of the last three fiscal years.

Nine High-severity flags carried forward, most importantly: (1) no primary SEC filing anywhere in the pool; (2) the unreconciled ~10pp Gross-Bookings-to-Revenue gap; (3) the insurance-cost tailwind fully reinvested with zero disclosed buffer; (4) SG&A leverage — the largest quantified sensitivity — already reversing.

## Chapter C: Balance-Sheet Survival

*(Compressed per the No-Bloat Rule — full text at `analyses/UBER_2026-08-06/balance-sheet-survival/99_balance-sheet-survival-synthesis.md`)*

**Verdict: Adequate**, capped by undisclosed covenant terms and a growing $5.6bn contingent tax exposure. Net leverage 1.32x GAAP EBITDA / 0.98x Adjusted EBITDA (net debt strict basis $9,861mm at Jun-30-2026, canonical $9,340mm per earnings module's slightly earlier cut). Solvency strength 65/100 (capped at 75 for undisclosed off-balance-sheet exposures). Liquidity runway 88/100 — no finite exhaustion point; $10,059mm committed liquidity + $10,116mm LTM FCF surplus exceed even a 100% EBITDA wipeout. Covenant headroom: **Not assessable** — no credit agreement, indenture, or covenant summary exists anywhere in the pool.

Maturity wall thin and self-funded through 2027 (14.8% of debt due within 12 months, covered >4x by committed liquidity). RF-OBS-001 fired: total contingent exposure ≥$6,414mm (22.6% of equity), driven by a $5,611mm gross unrecognized tax benefit (+13.7% YoY, not separately broken out on the balance sheet).

**The forward risk that dominates this module's own framing:** once the Delivery Hero acquisition closes and the ~€14bn bridge facility is drawn, pro-forma leverage on a mid-cycle EBITDA base runs 5.0x–6.6x, and an assumed 3.5x covenant would need only a 0.9% (full-bridge draw) to 25.5% (consideration-only) EBITDA decline to breach — a normal 30–40% recession breaches it in three of four pro-forma combinations modeled. This is a leverage-covenant risk, not a liquidity risk; liquidity stays deep in every pro-forma scenario.

## Chapter D: Catalyst

*(Compressed per the No-Bloat Rule — full text at `analyses/UBER_2026-08-06/catalyst/99_catalyst-synthesis.md`)*

**Verdict: Catalysts exist but timing vague.** Catalyst strength 50/100 (capped — the Delivery Hero deal is §24 Filter 4-flagged and must not be read as conviction-lifting). Timing visibility 38/100. Catalyst risk 63/100 (inverted, higher = worse).

Only the FY2028 debt maturity cluster ($2,850mm) clears the strict "proven, filing-sourced date" bar. Every catalyst that could actually move the stock (FQ3 2026 earnings, Delivery Hero close, the next AGM, buyback resumption, regulatory rulings) carries a window, an inference, or no date at all. The nearest catalyst that matters is the FQ3 2026 earnings print (~2026-10-29, web-sourced estimate; the guidance NUMBERS are proven, the DATE is not).

## Chapter E: Management-Governance

*(Compressed per the No-Bloat Rule — full text at `analyses/UBER_2026-08-06/management-governance/99_management-governance-synthesis.md`)*

**Verdict: Standard / mixed.** Governance Score 49/100 (Weak band); Confidence-Adjusted Governance Score 32/100. Management quality 65/100. Capital allocation 50/100 (capped by RF-CAP-004). Incentive alignment 10/100 (capped max 50 — unproven, not disproven). Shareholder friendliness 74/100. Disclosure candor 56/100. No hard disqualifier flagged.

Dara Khosrowshahi delivered a proven, delivered turnaround (operating income $(1,832)mm FY2022 → $5,565mm FY2025). Board is genuinely independent (90%, no poison pill, no dual-class stock, zero disclosed RPT above $120,000, confirmed from a primary SEC EDGAR DEF 14A pull). Insiders hold just 0.18% of shares, almost entirely stock-compensation-derived. **RF-CAP-004** (Critical materiality) — serial-acquirer pattern culminating in the $14.8bn Delivery Hero deal, funded partly by diverting $4bn from a promised buyback program — caps capital allocation at 50/100 and floors governance risk at 60 (set at 65). **RF-DISC-002** (High) — ~25% of Adjusted EBITDA's addback never itemized; a $10.1bn two-year deferred-tax GAAP inflation never proactively flagged.

## Chapter F: Valuation

*(Compressed per the No-Bloat Rule — full text at `analyses/UBER_2026-08-06/valuation/99_valuation-synthesis.md`)*

**Verdict: Fairly valued** (base fair value $74.91, +9.9% above the $68.18 price — inside the ±10% band, one point from "modestly undervalued"). Bull $104.89 / Base $74.91 / Bear-cyclical $40.23 / Bear-structural (memo) $31.88. Valuation attractiveness 55/100. Margin of safety 32/100 (underlying cushion +9.0% — thin). Valuation confidence 58/100 (capped — DCF terminal value 77.1% of EV). Downside risk 65/100 (inverted, higher = worse — 41.0% loss to cyclical bear, 53.2% to structural floor).

Dominant method: peer-relative valuation (68% weight) on the four-name core marketplace set (Lyft, DoorDash, DiDi, Grab) — tightest economics-matched comparable set with real forward coverage. The reverse-DCF shows the price requires only 14.7% FCFF growth and a 12.8% terminal margin — both below Uber's own consensus-anchored base case and below what Uber already delivers, reading as achievable, not stretched. Not an ownership-driven value trap (RF-OWN-004 not triggered) — this is a warranted-multiple question: the "no moat proven" finding means the assumed re-rating (11.89x → 13.25x) is evidenced but not yet earned through a full cycle.

---

# PART IV — MODULE APPENDICES

## Appendix A: Business Model — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_data-triage.md` | data-triage | Verdict: Partial — no primary 10-K/10-Q in pool; a same-day earnings transcript and CIQ vendor exports are the available base |
| `01_disqualifier-scan.md` | disqualifier-scan | No disqualifier triggered — all 8 checks read N, though 3 rest on absence of a primary filing |
| `02_business-identity.md` | business-identity | Multi-sided, take-rate marketplace across three segments plus an AV bet; does not own cars, restaurants, or trucks |
| `03_segment-map.md` | segment-map | Mobility = 57.0% of revenue but 90.5% of total EBITDA; Freight is EBITDA-negative and shrinking |
| `04_unit-economics.md` | unit-economics | Unclear from disclosure; directional evidence (Mobility margin trend) leans "creates value" — an inference, not a computed result |
| `05_customer-geography.md` | customer-geography | Geographically concentrated (US/Canada 50.9%), not customer-concentrated; zero long-term contracts |
| `06_value-chain.md` | value-chain | Mixed economic control — sets own take rate, but a price-taker on regulatory reclassification |
| `07_business-quality.md` | business-quality | 47/100 — Mixed/Average, low end; regulatory dependence (28), competitive intensity (32), rate-of-change (35) are weakest |
| `08_competitive-map.md` | competitive-map | Position vs. peers only partially disclosed; two partial proxies (Brazil share vs DiDi, growth vs Lyft) |
| `09_moat.md` | moat | No moat proven — 3-yr avg ROIC (6.2%) below ~8.1% WACC estimate; only FY2024–FY2025 individually clear it |
| `10_external-dependency.md` | external-dependency | Risk score 42/100 (inverted); Regulation rated High — the single largest external variable |
| `11_capital-allocation-governance.md` | capital-allocation-governance | Score capped at 50/100 — serial-acquirer pattern (severity 78) trips Filter 4 |
| `12_red-flags-sweep.md` | red-flags-sweep | Most severe flag (62): FY2024–FY2025 GAAP net income dominated by non-cash deferred-tax benefit and mark-to-market gains |

## Appendix B: Earnings — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_earnings-data-triage.md` | earnings-data-triage | Sufficient — verbatim, one-day-old transcript, current consensus, full three-statement data; no primary SEC filing |
| `01_historical-financials.md` | historical-financials | Revenue growth decelerating at the margin while margins expand; GAAP EPS inflated by one-time deferred-tax benefits |
| `02_revenue-drivers.md` | revenue-drivers | Mobility Gross Bookings growth is the single biggest driver; the ~10pp gap to reported revenue cannot be cleanly decomposed |
| `03_margin-drivers.md` | margin-drivers | Adjusted EBITDA margin is the most useful margin metric; the insurance-cost tailwind is fully reinvested, leaving zero buffer |
| `04_guidance-consensus.md` | guidance-consensus | Bar is fair — consensus now sits at the new guidance midpoints, closing the gap that supported the last two beats |
| `05_beat-miss-setup.md` | beat-miss-setup | Setup is balanced — bifurcated pattern: Revenue missed twice, Adjusted EBITDA/EPS beat the guidance high end twice |
| `06_earnings-quality.md` | earnings-quality | Score 68/100 — mostly clean, cash-backed, capped by GAAP-earnings distortion |
| `07_earnings-sensitivity.md` | earnings-sensitivity | Earnings Volatility Score 45/100, Low confidence — SG&A leverage is the largest quantified sensitivity and is already reversing |
| `08_earnings-red-flags.md` | earnings-red-flags | **Material concerns** — the unreconciled ~10pp Gross-Bookings-to-Revenue gap is the single most dangerous flag |

## Appendix C: Valuation — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_valuation-data-triage.md` | valuation-data-triage | Sufficient — all five methods can run; no primary 10-K/10-Q, a real but non-blocking gap |
| `01_price-and-capital-structure.md` | price-and-capital-structure | Price $68.18 pool-verified; EV $149,210.14mm; net debt (strict) $9,340mm |
| `02_multiples-own-history.md` | multiples-own-history | Own-history bands illustrative-only (17-month window) — zero-weighted in the base point |
| `03_relative-valuation-peers.md` | relative-valuation-peers | Base $73.39/share (+7.6%); highest EBITDA margin among 4 core peers yet trades at a discount |
| `04_intrinsic-dcf.md` | intrinsic-dcf | Base $82.87/share (+21.5%); terminal value 77.1% of EV — exceeds the 75% threshold |
| `05_reverse-dcf.md` | reverse-dcf | Price requires 14.7% FCFF CAGR and 12.8% steady-state EBIT margin — both below Uber's own base case |
| `06_sum-of-the-parts.md` | sum-of-the-parts | Base-comp case $95.73 (+40.4%); conservative-comp case $51.15 (-25.0%) — cannot cleanly call the stock |
| `07_scenario-and-fair-value.md` | scenario-and-fair-value | Base $74.91/share (+9.9%); Bull $104.89; Bear (cyclical) $40.23; Bear (structural, memo) $31.88 |

## Appendix D: Balance-Sheet Survival — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_solvency-data-triage.md` | solvency-data-triage | Partial sufficiency — core triad present; covenant disclosure is the single gap |
| `01_capital-structure-and-leverage.md` | capital-structure-and-leverage | Net leverage 1.32x GAAP / 0.98x Adj.; not net cash; gross debt rose $2,429mm in H1 FY2026 |
| `02_maturity-wall-and-refinancing.md` | maturity-wall-and-refinancing | Self-funded, low refi risk for the disclosed 24-month wall; the real risk is the undisclosed $1,997mm short-term debt addition |
| `03_liquidity-runway.md` | liquidity-runway | No finite liquidity runway — FCF surplus dwarfs 12-month obligations |
| `04_coverage-and-covenants.md` | coverage-and-covenants | Coverage strong (16.18x–21.74x); covenant headroom Not assessable |
| `05_off-balance-sheet-and-contingencies.md` | off-balance-sheet-and-contingencies | Contingent exposure ≥$6,414mm (22.6% of equity); RF-OBS-001 fired |
| `06_downside-stress-test.md` | downside-stress-test | Fortress on the current balance sheet; does not clearly survive a 30–40% decline once the DH bridge is drawn |

## Appendix E: Management-Governance — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_governance-data-triage.md` | governance-data-triage | Partial sufficiency — no DEF 14A/10-K/10-Q/8-K in `data/UBER/`, but ownership/board/capital-allocation history usable |
| `01_management-and-track-record.md` | management-and-track-record | Score 65/100 — real, delivered turnaround, undercut by CFO churn (3 in ~8 years) |
| `02_capital-allocation-scorecard.md` | capital-allocation-scorecard | Score 50/100 (capped from 58) — organic allocation is value-creative; M&A program trips RF-CAP-004 |
| `03_incentives-and-compensation.md` | incentives-and-compensation | Score 10/100 (capped max 50) — incentive alignment cannot be assessed; no CD&A/SCT read |
| `04_ownership-and-insider-behavior.md` | ownership-and-insider-behavior | Score 55/100 — clean pledge/control picture, negligible grant-driven insider ownership |
| `05_board-and-shareholder-rights.md` | board-and-shareholder-rights | Score 84/100 — genuinely independent board, confirmed from a primary FY2026 DEF 14A pulled from SEC EDGAR |
| `06_candor-and-disclosure-quality.md` | candor-and-disclosure-quality | Score 56/100 (mixed) — direct answers on the one available transcript, alongside a persistently unitemized non-GAAP addback |

## Appendix F: Catalyst — Sub-Agent Outputs

| File | Agent | Verdict / Headline Finding |
|---|---|---|
| `00_catalyst-data-triage.md` | catalyst-data-triage | Confirms upstream module data used to build the calendar |
| `01_catalyst-calendar.md` | catalyst-calendar | Builds the consolidated 12-month calendar reproduced in Part II §7 above |

---

# PART V — EVIDENCE AND PROCESS

## 15. Evidence Used

| Evidence Source | What It Proves | Quality | Freshness | Problems |
|---|---|---|---|---|
| Capital IQ Financials export (Income Statement, Balance Sheet, Cash Flow, Segments) | Revenue, margins, cash flow, segment split, balance sheet | Medium (vendor tier 5, not primary filing) | Through Jun-30-2026 | No primary 10-K/10-Q anywhere in the pool to cross-check |
| Q2 FY2026 earnings call transcript (Aug-05-2026) | Management commentary, guidance, Q&A directness | High (primary, verbatim) | Same-day | Only one quarter's transcript in the pool — no FQ3/FQ4 2025 (the actual weak quarters) |
| Capital IQ Estimates report (Consensus, Guidance, Revisions) | Consensus setup, guidance history, revision direction | Medium (vendor) | 0–1 days old | — |
| Capital IQ Comparable Analysis (Trading Multiples, Implied Valuation) | Peer multiples, relative valuation | Medium (vendor) | Current | 10-name peer set; 4-name core marketplace subset used for the trusted method |
| FY2026 DEF 14A (SEC EDGAR, pulled by `management-governance/05`) | Board composition, related-party transactions, takeover defenses, Say-on-Pay history | High (primary filing) | Filed 2026-03-23 | Compensation Discussion & Analysis section was located but not read for this run |
| Capital IQ M&A database / Public Company Profile | Delivery Hero deal terms, acquisition history | Medium (vendor) | Current | Synergy target ($1.2bn) and gross-leverage target (<2x) are web-sourced, unverified |
| Web sources (TechCrunch, CFO Dive, TipRanks earnings calendar) | CFO transition context, FQ3 2026 date estimate | Low | Dated, labeled unverified | Used only where no pool source covers the same fact; flagged inline throughout |

## Claim Quality Ledger

| Key Claim | Claim Quality Level 0–5 | Evidence | Weakness / Caveat | Keep, Downgrade, or Remove |
|---|---:|---|---|---|
| Mobility EBITDA margin 26.6% (FY2025), well above Lyft/DiDi | 4 | Capital IQ Segments tab, cross-checked across 2 modules | Vendor-tier, not primary filing | Keep |
| 3-year average ROIC (6.2%) below ~8.1% WACC estimate | 3 | Business-model moat module's own calculation | WACC is an estimate (beta 1.15, ERP 5.0%), not a filed figure | Keep, labeled as an estimate |
| RF-CAP-004 serial-acquirer pattern (7+ deals, $14.8bn Delivery Hero) | 4 | Capital IQ M&A database, Public Company Profile, Q2 FY2026 transcript | Deal terms are primary-adjacent (public disclosure), synergy/leverage targets are web-sourced | Keep |
| Delivery Hero bridge covenant breach at 0.9%–25.5% EBITDA decline post-draw | 2 | Balance-sheet-survival module's own stress-test model on a labeled assumption (3.5x covenant) | Explicitly "Inference, not from filings" — no covenant disclosure exists anywhere in the pool | Keep, labeled as inference |
| ~10pp Gross-Bookings-to-Revenue gap is "optical" (UK reclassification) | 2 | Management's own quote on the Q2 FY2026 call | Unverified against any primary filing; this dossier explicitly does not accept it at face value | Downgrade — treated as unresolved, conservative default applied |
| Base fair value $74.91, +9.9% margin gap | 3 | Valuation module's reconciled peer-relative method (68% weight) | Cross-method dispersion is real ($51.15–$115.44 before reconciliation); DCF component capped for terminal-value dominance | Keep |
| Net leverage 1.32x GAAP EBITDA (current, disclosed balance sheet) | 4 | Capital IQ Balance Sheet tab, cross-checked | Vendor-tier; two figures in the pool ($9,340mm earnings-module cut vs $9,861mm balance-sheet-survival cut) reflect slightly different as-of dates | Keep, both cited with their as-of date |
| FQ3 2026 earnings date ~2026-10-29 | 1 | Web (TipRanks earnings calendar, unverified) | Explicitly flagged by the catalyst module as unverified — only the guidance NUMBERS are proven | Keep, labeled unverified throughout |

## 16. Module Scorecard

| Module | Main Verdict | Module Synthesis Usefulness /100 | Sub-Agent Exception (if any) | Key Weakness | Override Needed? |
|---|---|---:|---|---|---|
| business-model | Average business — worth deeper work only if cheap | 62 | None material | No primary 10-K/10-Q anywhere in the pool | No |
| earnings | Mixed earnings setup | 78 | None material | Unresolved ~10pp bookings-vs-revenue gap; no company-disclosed sensitivity table | No |
| valuation | Fairly valued (borderline modestly undervalued) | 82 | None material | DCF terminal value 77.1% of EV (capped, but not the trusted method) | No |
| balance-sheet-survival | Adequate | 75 | None material | Covenant headroom "Not assessable" — no covenant disclosure anywhere in the pool | No |
| management-governance | Standard / mixed | 68 | None material | Compensation disclosure located but not read for this run | No |
| catalyst | Catalysts exist but timing vague | 68 | None material | Only the FY2028 debt cluster clears the strict proven-date bar | No |

No module verdict was overridden by this synthesis. The one place this synthesis actively adjudicates rather than defers is the RF-CAP-004 rating-cap mechanism (§24 Filter 4 / Rating Cap Rules), which converts the management-governance module's own "Standard / mixed, not a hard-lock" governance verdict into a mechanical Watchlist ceiling on the master decision — consistent with, not contradicting, that module's own findings.

## 17. Consensus Expectations

- **Revenue:** Street estimates are being cut into the print (~-1.0% last month, ~-0.6% for FY2026); no company revenue guidance has been issued since FQ2 2020, so the Street's own estimate is the only anchor, and it has been wrong (too high) twice running.
- **Adjusted EBITDA:** Consensus $2,919.3mm vs. guidance midpoint $2,910mm (+0.3%) — essentially in line; estimates have been RISING (~+2.9% over 3 months, net revision breadth +14 to +28 analysts).
- **Adjusted EPS:** Consensus $0.86, exactly at the $0.86 guidance midpoint.
- **Target price range / analyst count:** Not itemized in the modules read for this synthesis beyond the estimates workbook; not reproduced here to avoid overstating precision — see `_pool_extracts/UberTechnologies...EstimatesReport` files for the raw export.
- **Dispersion:** Not separately quantified in the module syntheses beyond the revision-direction figures above.

**Is the market's bar low, fair, or high?** Fair, not low, on the Adjusted EBITDA/EPS lines — consensus has already moved to sit AT the new guidance midpoints, closing the room that powered the last two quarters' beats. The bar looks more genuinely open on Revenue, where the Street's own estimate (not a management commitment) has already proven wrong twice, in the direction of being too high.

## 18. Balance Sheet and Survival Test

This section defers in full to `analyses/UBER_2026-08-06/balance-sheet-survival/99_balance-sheet-survival-synthesis.md` (see Chapter C above for the compressed module chapter, and §9/§10 above for how its break points feed the Risk Register and Kill Criteria). Verdict: **Adequate** on the disclosed balance sheet; the real break point is forward-looking and tied to the undrawn Delivery Hero bridge facility, not to anything currently on the balance sheet.

**Balance sheet data included: business-model, earnings, valuation, balance-sheet-survival, management-governance, catalyst.**

## Forecast Ledger

Time horizon default: 12 months. Risk appetite: medium-to-high (default, not specified by the user). Desired win: +30% or better (default). Position type: long equity idea framework (default), though the actual decision here is Watchlist, not a long position.

| Prediction | Probability | Time Window | Evidence Today | Confirmation Trigger | Falsification Trigger | Owner Module | Type | Confidence /100 |
|---|---:|---|---|---|---|---|---|---:|
| FQ3 2026 Adjusted EBITDA will land within or above the guided $2,860–$2,960mm range | 65 | 2026-10-25 to 2026-11-05 | Guidance issued 2026-08-05; last two quarters beat the guidance high end [`earnings/04`] | Reported FQ3 2026 Adjusted EBITDA ≥ $2,860mm | Reported FQ3 2026 Adjusted EBITDA < $2,860mm | earnings | earnings_eps | 65 |
| FQ3 2026 reported Revenue growth will miss the Street's pre-print consensus for a 3rd consecutive quarter | 45 | 2026-10-25 to 2026-11-05 | Revenue estimates cut ~-1.0% last month; FQ1'26 -0.45%, FQ2'26 -0.52% misses [`earnings/04`] | Reported FQ3 2026 revenue growth below the pre-print Street consensus | Reported FQ3 2026 revenue growth meets or beats the pre-print Street consensus | earnings | revenue | 50 |
| FQ3 2026 SG&A ratio will stay at or above the LTM (Jun-2026) level of 20.50%, continuing its reversal off the FY2025 low | 55 | 2026-10-25 to 2026-11-05 | LTM SG&A ratio 20.50% vs FY2025 low 19.87%, +63bps already reversed [`earnings/07`] | Reported FQ3 2026 SG&A/revenue ≥ 20.50% | Reported FQ3 2026 SG&A/revenue < 19.87% | earnings | margin_or_cost | 50 |
| The Delivery Hero acquisition will close within the H2 2027 window without a covenant breach or waiver disclosed in the four quarters following the bridge draw | 50 | 2027-07-01 to 2027-12-31 | Business Combination Agreement signed 2026-07-16; €700mm/€200mm termination fees; $1.6bn SSW Partners divestiture required [`catalyst/01`, `balance-sheet-survival/06`] | Deal closes within H2 2027 and no breach/waiver disclosed within 4 quarters of the bridge draw | Deal slips past 2027-12-31, is blocked/terminated, or a breach/waiver is disclosed within 4 quarters of the draw | balance-sheet-survival | balance_sheet_or_solvency | 40 |
| Uber's NTM EV/EBITDA multiple will sit at or above 13.0x (vs. 11.89x today) at the 12-month review | 40 | 2027-07-01 to 2027-08-31 | Base case assumes the market closes roughly a third of the current -17.5% discount [`valuation/07`] | NTM EV/EBITDA ≥ 13.0x at the 12-month review | NTM EV/EBITDA remains ≤ 11.89x at the 12-month review | valuation | valuation_or_price_return | 40 |

3 of 5 forecasts (60%) resolve within ~90 days of the decision date, satisfying the near-term proof-point requirement.

---

**Confirmation:**
- Final thesis path: `analyses/UBER_2026-08-06/final_thesis.md`
- Decision record path: `analyses/UBER_2026-08-06/decision_record.json`
- Idea assessment path: `analyses/UBER_2026-08-06/idea_3_6m.json`
- Modules included: Chapter A (Business Model), Chapter B (Earnings), Chapter C (Balance-Sheet Survival), Chapter D (Catalyst), Chapter E (Management-Governance), Chapter F (Valuation)
