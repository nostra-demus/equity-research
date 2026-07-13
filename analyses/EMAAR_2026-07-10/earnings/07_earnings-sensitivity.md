# Earnings Sensitivity — EMAR

*Emaar Properties PJSC (DFM: EMAAR). Dubai/UAE real-estate developer. Reporting basis IFRS; currency AED millions unless stated (the dirham is pegged to the US dollar at ~3.6725 AED/USD). Fiscal year ends 31 December. Latest reported period Q1 2026 (quarter ended 31 Mar 2026). This agent identifies which variables would most change earnings if they moved, and by how much — it does NOT forecast, build scenarios, or set the earnings verdict.*

**Upstream inputs.** All three required upstreams present and used: `01_historical-financials`, `02_revenue-drivers`, `03_margin-drivers`. Cross-module `business-model/10_external-dependency` present and used to identify the external variables. No upstream missing.

*Plain-English glossary (first use): **off-plan** = a home sold before it is built, paid in instalments during construction; **POC (percentage-of-completion)** = revenue booked in step with construction progress on already-sold homes; **backlog** = value of signed sales not yet booked as revenue; **pre-sales / bookings** = new sales contracts signed in the period (a leading indicator, not yet revenue); **gross margin** = sales minus the land-and-build cost of what was handed over; **EBITDA** = rough operating cash profit before interest, tax and depreciation; **PBT** = profit before tax; **EPS** = profit per share (to owners); **DMTT** = Domestic Minimum Top-up Tax (the OECD "Pillar Two" 15% minimum corporate tax); **bps** = basis points (100 bps = 1.0 percentage point); **pp** = percentage points.*

**Flow-through to EPS (owners) — the arithmetic behind every impact below.** Base = FY2025 audited: revenue AED 49,557m, gross margin 54.9%, PBT AED 25,656m, tax 13.0%, minority interest AED 4,726m (21.2% of group net profit, almost all the Emaar Development float), net profit to owners AED 17,599m, EPS AED 1.99 (LTM AED 2.14), diluted shares 8,838.8m [CIQ Financials_Annual Income Statement; FY2025 AR Note 29]. Because ~80% of profit is the Real Estate/development engine, an operating (development) impact is taxed at ~13% and loses ~20% to Emaar Development minorities → a **~0.70 pre-tax-to-owners factor**; the tax-rate line uses ~0.80 (owners bear ~80% of a group tax change); interest income uses ~0.75. **These flow-through factors are an inference, not from filings, and are Low-precision** — they let the six variables be compared on one bottom-line unit (AED/share to owners). Pre-tax AED-million magnitudes are shown in brackets so the operating size is visible before the flow-through.

---

## 1. Variable Selection

The six variables below are the highest-magnitude drivers carried out of the upstream tables, re-expressed as earnings sensitivities. From `02_revenue-drivers` §4 the "High"-magnitude revenue levers are Real Estate backlog conversion (POC recognition), the backlog itself, contracted pre-sales, and Dubai demand. From `03_margin-drivers` §5 the "High"-magnitude margin levers are development gross margin (mix + land-price spread) and the UAE tax step-up (DMTT), with construction-cost inflation and rate-driven net finance income rated "Mid." From `business-model/10_external-dependency` §5 the single biggest external lever is Dubai residential property demand. I collapsed the overlapping revenue rows into two distinct, testable levers — the **pace of Real Estate revenue recognition** (converting the already-sold backlog: near-term, semi-controllable) and **Dubai off-plan pre-sales/demand** (refilling the backlog and setting launch prices: external, lagged) — because they move earnings on different clocks. Excluded as immaterial: FX (AED pegged to USD; 93% UAE revenue; disclosed +10% move worth only AED 88–376m to reserves, not profit [10 §2]) and the leasing/hospitality annuity (~20% of revenue, stable ~69%/~37% margins). The result is six variables spanning revenue quantity, unit profitability, input cost, the tax line, the finance-income line, and the external demand cycle.

---

## 2. Sensitivity Table

Sorted by 12-month absolute EPS impact (largest first). **EPS impacts are AED/share to owners; the bracketed figure is the pre-tax AED-million move before tax/minority.** Bull = the move that helps earnings; Bear = the move that hurts. Base is FY2025 unless stated.

| Variable | Base Case | Move Basis | Bull Case | EPS Impact (bull) | Bear Case | EPS Impact (bear) | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|
| **1. Real Estate recognition pace (delivery / POC on the sold backlog)** — the quantity of development revenue booked | RE revenue AED 39,550m (80% of group); delivered-homes value +49.6% YoY; pace set by construction progress on the AED 163.4bn sold backlog | **Historical observed range** — delivered-homes value swung −24% to +51% YoY over FY2020–25; a ±10–12% deviation from expected in-year recognition is conservative vs that | Recognition +12% (2026–28 delivery ramp pulls forward) | **+0.19** (+AED 2,370m) | Recognition −10% (construction / handover slippage, contractor capacity) | **−0.16** (−AED 1,980m) | Medium | [CIQ Industry-Specific tab, Delivered Homes Value FY20–25; 02_revenue-drivers §7; Q1'26 PR backlog AED 163.4bn] |
| **2. Development gross margin** (land-price spread + product/segment mix) | Group gross margin 54.9% FY2025; development ~50–52% (housing-sales gross margin 49.2%) | **Historical range + company guidance** — 63.0% (FY23) → 57.4% (FY24) → 54.9% (FY25); management guides "low 50s sustainably" | Gross margin +100 bps (spread holds, mix stabilises) | **+0.04** (+AED 500m) | Gross margin −300 bps (continued mix/spread compression + soft pricing) | **−0.12** (−AED 1,490m) | Medium | [CIQ Income Statement; CIQ Industry-Specific (Housing COGS/Sales 0.45); 03_margin-drivers §3, §8; Q4'25 call proxy] |
| **3. Construction input-cost inflation** (steel / cement / labour) | Cost of sales AED 22,330m (45.1% of revenue); no cost-escalator on the sold backlog (fixed selling prices) | **Cited industry range + inference** — construction-input inflation ±3–5%/yr; hits margin via POC cost remeasurement, passed to price only at the next launch | Input costs −3% | **+0.05** (+AED 670m) | Input costs +5% | **−0.09** (−AED 1,120m) | Low (P&L conversion inferred) | [10_external-dependency §1; 03_margin-drivers §3, §5; CIQ Industry-Specific (Total Cost of Sales 22,330)] |
| **4. Effective tax rate** (UAE Corporate Tax + DMTT / Pillar Two) | Effective 13.0% on PBT AED 25,656m; tax AED 3,331m; DMTT added AED 2,114m in 2025 | **Historical + disclosed mechanics** — effective rate 1.5% (FY23) → 7.7% (FY24) → 13.0% (FY25); DMTT sets a 15% jurisdictional floor; the Q3'25 MD120 relief was a one-off | Rate −2.5 pp (further reliefs / profit mix) | **+0.06** (+AED 640m) | Rate +3.5 pp (toward/above 15% as transition reliefs lapse) | **−0.08** (−AED 900m) | Medium | [FY2025 AR tax note 2.4 (DMTT AED 2,114,381k); CIQ IS effective rate; 10_external-dependency §1] |
| **5. Interest rates → net finance income** (the deposit pile) | Finance income from bank deposits & securities AED 2,505m; interest expense AED 492m; net +AED 2,013m; ~AED 55bn of short-dated (1-day–3-month) deposits | **Company-disclosed (debt side) + inference (asset side)** — disclosed ±100 bps → AED 26m on floating debt ONLY; asset-side inferred ~AED 550m per 100 bps on the deposit pile (US Fed via AED peg) | Rates +100 bps | **+0.05** (+AED 540m) | Rate cuts −150 bps | **−0.07** (−AED 810m) | Low (material asset-side inferred; disclosed figure captures only the immaterial debt side) | [FY2025 AR Financial-Instruments note p.215–216 (±100 bps → AED 26,165k); FY2025 AR finance-income note (AED 2,505,247k); balance sheet cash+ST inv 28,254 + restricted deposits 42,879; 03_margin-drivers §5] |
| **6. Dubai off-plan pre-sales / demand** (new bookings — refills the backlog, sets launch prices) | Property sales AED 80.4bn FY2025 (+16%); backlog AED 163.4bn (3.3× revenue, ~94% of pipeline sold) | **Cited industry / cycle range** — 10 §5 uses a 20% adverse move; Dubai boom-bust base rate (2009; 2015–19); consensus long-term growth −14.8% | Pre-sales +20% (near-term, buffered) | **+0.03** (+AED 490m) | Pre-sales −20% (near-term, buffered) — **medium-term (2027–29) impact is several-fold larger** | **−0.04** (−AED 660m) | Low (near-term EPS conversion inferred; buffered by backlog) | [10_external-dependency §5; 02_revenue-drivers §3 cycle-position; Q4'25 & Q1'26 PR; ciq_facts consensus_view] |

**Read-through on confidence.** Emaar publishes market-sensitivity tables (rates, FX, equity price) in the FY2025 Financial-Instruments note [p.215–216], but they cover only financial instruments and are all tiny — they do **not** put a number against the property-demand exposure that actually drives the equity. So the material sensitivities above rest on historical ranges (Medium) or clearly-labelled inference (Low), not company-disclosed sensitivity — the one place a company figure exists (rates) it captures the wrong side of the balance sheet (see Variable 5 and §6). No sensitivity here is High-confidence.

---

## 3. Sensitivity Ranking

Sorted by absolute impact (average of the bull and bear EPS moves, AED/share to owners). **Inverted note:** this ranks how much each variable *moves* earnings — it is not a good/bad judgment.

| Rank | Variable | Absolute Impact (avg of bull + bear) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | Real Estate recognition pace (delivery / POC) | **0.17** | Improving — 2026–28 delivery ramp; but the master input (demand) is decelerating |
| 2 | Development gross margin (spread + mix) | **0.08** | Declining — guided to "low 50s"; sits at a cycle high |
| 3 | Construction input-cost inflation | **0.07** | Rising — cost of sales +250 bps FY24→25 |
| 4 | Effective tax rate (CT + DMTT) | **0.07** | Rising — 1.5% → 13.0%; DMTT 15% floor |
| 5 | Interest rates → net finance income | **0.06** | Falling rates → this below-EBIT tailwind is fading |
| 6 | Dubai pre-sales / demand (near-term) | **0.04** *(near-term; #1 on a medium-term basis — see §4, §6)* | Improving but decelerating, at a cycle peak |

**Ranking caveat (the key one).** This table is on a **12-month reported-earnings** basis. On that clock the pace of revenue recognition dominates because it is the quantity of high-margin development revenue booked. Dubai demand ranks last near-term **only because the AED 163.4bn contracted backlog (3.3× revenue, ~94% sold) buffers the next 12–24 months** — but demand is the #1 sensitivity over the medium term, because it is the upstream master of both recognition pace and margin once the backlog depletes (§4, §6).

---

## 4. The Single Highest-Sensitivity Variable

Two answers, on two clocks, and the split is the most useful thing here.

**Over the module's 3–12 month window, the single biggest EPS mover is the pace of Real Estate revenue recognition** — how fast construction progress converts the already-sold AED 163.4bn backlog into booked revenue (a ±10–12% swing moves EPS ~±0.17, i.e. ~±8–9% of FY2025 EPS of AED 1.99). Its current direction is **Improving** — management guides deliveries to "ramp materially" through 2026–28 [02_revenue-drivers §5; Q1'26 PR]. It is **partly company-controlled** (construction management, contractor scheduling, handover timing) but sits on top of an external master input. The adverse case is construction or handover slippage — contractor-capacity limits, permitting, or a deliberate slowing of starts if demand softens — pushing recognition to the low end.

**Over the medium term the single dominant variable is Dubai residential property demand** (off-plan pre-sales volume × price), which `10_external-dependency` §5 correctly calls "the whole game." It is **external** — set by the Dubai property cycle, foreign-capital inflows, visa/population policy and geopolitics, none of which management sets. Its near-term EPS impact is small (~±0.04) only because the backlog buffers it; a sustained move flows into recognised revenue AND margin (via launch prices) with a 2–3 year lag, and by 2027–29 could swing EPS several times the near-term figure (illustrative order −0.30 to −0.50+ in a sustained down-cycle — *inference, not from filings*). What would need to happen for the adverse case: the Dubai cycle rolling over from a record 2025 into the fast-rising supply pipeline (648 launches, 167,000+ units), stalling backlog replenishment and pressuring absorption and prices — the scenario consensus long-term growth of −14.8% already leans toward [ciq_facts consensus_view; 10 §5]. In short: **recognition pace decides reported EPS this year; Dubai demand decides the earnings level two-to-three years out.**

---

## 5. Interaction Effects

These variables are not independent — several move together, and mostly in the same, adverse direction in a downturn.

- **Recognition pace (1), gross margin (2) and demand (6) are one linked chain in a Dubai down-cycle.** Weak demand first softens launch pricing and mix (margin down), then — with a lag — starves the backlog so there is less to recognise (volume down), while sticky selling/admin cost turns into operating deleverage. A downturn therefore hits the quantity, the unit margin, and the cost ratio at once; the three do not net off, they compound. This is why the near-term buffer can mask a sharp medium-term step-down.
- **Construction cost (3) and gross margin (2) both land in the same gross-margin line.** They are tested separately (a cost-side shock vs a price/mix shock), but a downturn that brings both — cost overruns *and* soft prices — stacks them: the FY2025 bear pair alone is roughly −300 bps (price/mix) plus ~−225 bps (a +5% cost shock), i.e. a combined gross-margin hit far larger than either row shown alone.
- **Interest rates (5) sit partly apart, and cut both ways.** A rate-cut cycle removes the below-EBIT interest-income tailwind (near-term adverse) at the same time as it tends to accompany a softening cycle — so rates and demand can move adversely together near-term. But lower rates also improve buyer affordability, which supports demand with a lag — a partial medium-term offset. Net: rates are a near-term headwind to the finance-income line but a modest medium-term help to the demand line. One further offset: the deposit balance keeps growing (net cash rose to ~AED 25bn broad), so balance growth partly cushions the rate-cut hit to interest income.
- **FX does not interact** — the AED peg neutralises it (93% UAE revenue), so it is left out of the compounding set.

---

## 6. Non-Linear Or Asymmetric Risks

Material asymmetries exist, and they lean to the downside.

1. **Demand is time-asymmetric — small now, large later (the headline asymmetry).** The AED 163.4bn backlog makes the next 12–24 months of revenue highly visible, so a demand shock barely moves near-term EPS — but the same shock, sustained, hits earnings hard once the backlog depletes. Low near-term sensitivity is not low risk; it is deferred risk.
2. **Development gross margin is downside-skewed.** Management guides it *down* to "low 50s," and the flattering land-price spread (cheap legacy land at AED 50,235m cost, sold at peak prices) only narrows from here [03 §8; CIQ Industry-Specific]. Upside is capped (+100 bps modelled); downside is open (−300 bps, and faster in a price war). The bull and bear are not symmetric.
3. **Construction-cost pass-through lag.** There is no cost-escalator on the sold backlog, so input-cost inflation compresses margin immediately (via POC cost remeasurement) while any recovery waits for the next launch — cost hurts on a faster clock than price can offset.
4. **Operating deleverage.** SG&A leverage added +185 bps to the EBITDA margin FY24→25, but SG&A grew ~24% in Q4'25 vs +11% for the full year [03 §2] — if revenue growth stalls with cost sticky, the leverage reverses faster than it accrued.
5. **The disclosed rate sensitivity understates true rate risk by roughly 20×.** The company discloses ±100 bps → AED 26m (floating debt only). The real exposure is the ~AED 55bn of short-dated deposits earning AED 2,505m, where 100 bps is ~AED 550m — a below-EBIT tailwind a rate-cut cycle quietly removes, invisible in the disclosed table.
6. **Tax is a one-way ratchet.** DMTT sets a 15% jurisdictional floor; the effective rate stepped 1.5% → 7.7% → 13.0% and is more likely to drift up toward 15%+ as transition reliefs lapse than to fall (the Q3'25 relief was a one-off) — downside-skewed on the net-margin line.
7. **Minority leakage rises as development outgrows the group.** ~21% of group profit already leaks to Emaar Development minorities; because that arm grows fastest, more of any upside leaks out — a mild damper on EPS-to-owners on the way up (and a mild cushion on the way down).

No covenant-threshold non-linearity applies — the balance sheet is net cash (~AED 25bn broad) with ~52× interest cover, so there is no debt/EBITDA trip-wire in the sensitivity set [ciq_facts; 10 §1].

---

## 7. Earnings Volatility Score

**52 / 100 — INVERTED SCALE: higher = WORSE (more volatile / more sensitive to small input changes).**

Band 41–60: **Material sensitivity — earnings can swing meaningfully.**

**One-line reason:** Emaar's earnings are a geared claim on the Dubai property cycle at a record peak — four separate levers (recognition pace, development gross margin, the stepped-up DMTT tax, and rate-sensitive deposit income) each move EPS by mid-single digits or more, and a clustered adverse move is worth ~15–25% of near-term EPS — but the AED 163.4bn contracted backlog (3.3× revenue, ~94% sold), ~AED 25bn net cash and ~20% recurring income buffer the next 12–24 months, which is what keeps this out of the high-volatility (61–80) band despite the cycle-peak exposure.

**Confidence in this score: Low-to-Medium** — the company discloses sensitivities only for immaterial financial-instrument risks, not for its real (property-demand) exposure, so the material sensitivities rest on historical ranges and labelled inference (per MODULE_RULES, inferred-only sensitivities cap volatility confidence toward Low).

---

*Self-check: 6 variables selected (within 3–7) and ranked; every variable traces to a driver in 02, 03 or 10 (none invented); bull/bear move sizes use the hierarchy — company-disclosed (rates/tax mechanics), historical observed range (recognition pace, gross margin), cited industry/cycle range (demand, construction cost) — with inferences labelled; the one company-disclosed sensitivity (±100 bps → AED 26m) is used and its blind spot flagged; impacts in EPS (AED/share to owners) with pre-tax AED-m shown; ranking table sorted by absolute impact; earnings-volatility score flagged inverted (higher = worse); flow-through factors labelled Low-precision inference; no banned phrases adopted as the analysis's own verdict.*
