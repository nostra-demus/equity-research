# Earnings Sensitivity — BG

**Company:** Bunge Global SA (NYSE: BG). **Reporting currency:** US$ millions; EPS in US$/share. **Fiscal year:** ends Dec 31. **FY0 = FY2025** (10-K); **latest quarter Q0 = Q1 2026** (10-Q). All three required upstream outputs (`01_historical-financials`, `02_revenue-drivers`, `03_margin-drivers`) are present and read; the optional business-model `10_external-dependency.md` is present and read.

**Baselines used for all impact math (stated once):**
- **FY2026 management guidance: adjusted EPS $9.00–$9.50** (midpoint ~$9.25); D&A ~$975M; capex $1.5–1.7bn; interest expense $620–660M [Q1 2026 earnings release, Outlook].
- **FY2025 adjusted EPS $7.57; GAAP EPS $4.91**; FY2025 adjusted Total EBIT $2,034M [01 §1, §4].
- **Diluted share count 195.7M** (Q1 2026 post-Viterra) [Q1 2026 10-Q, Note 18].
- **Tax rate to convert pretax $ to after-tax EPS: 21%** — *Inference, not from filings*.
- **Per-share conversion: after-tax EPS ≈ pretax $ × 0.79 ÷ 195.7M shares** (~$155M pretax ≈ $0.63 EPS).

**Two framing facts that govern every row (carried from upstream):**
1. **Earnings are a spread, not a price.** Raw materials are ~90% of net sales [03 §2]. Bunge keeps the exchange-set crush/merchandising spread, "no contractual lever… to defend its margin." So the high-magnitude variables are the spread itself and what moves it — not the flat commodity price.
2. **The disclosed Item 7A 10% commodity sensitivity ($131M) is NOT the crush-margin sensitivity.** It is a point-in-time MtM VaR on hedged net trading positions; it understates the earnings swing because the un-hedgeable crush-margin and biofuel-mandate *trend* is what moves EPS [10 §2].

## 1. Variable Selection

Variables drawn from High-magnitude ratings in `02` §4 and `03` §5, cross-checked against `10` §1. Seven clear the bar: (1) soybean/softseed crush spread; (2) biofuel mandate policy (EPA RVO + Brazil/Indonesia/EU); (3) processed/merchandised volume & utilization; (4) freight/ocean-bunker cost (Grain); (5) Corporate & Other drag; (6) interest expense/rates; (7) FX. MtM timing excluded (non-cash, reverses).

## 2. Sensitivity Table

EPS impacts are annual, after-tax, per diluted share, against the FY2026 adjusted-EPS base (~$9.25).

| Variable | Base Case | Move Basis | EPS Impact (bull) | EPS Impact (bear) | Confidence |
|---|---|---|---:|---:|---|
| **1. Soybean + softseed crush spread** | soy+softseed adj. EBIT ~$1,746M (FY25) | Historical ±15% (inside the ±40–61% YoY band) | **+$1.06** | **−$1.06** | Medium |
| **2. Biofuel mandate policy** | RVO favorable; in $9.00–9.50 guide | Disclosed transcript swing (+$1.50 midpoint in 2mo) | **+$0.75** | **−$1.50** | High (move size); direction High |
| **3. Volume & utilization (op. leverage)** | $2,037M fixed cost over throughput | Inference, ~5% throughput move | **+$0.50** | **−$0.50** | Low |
| **4. Freight / ocean-bunker (Grain)** | bunker spike hit Q1'26 | Historical event ($122M single-quarter swing) | **+$0.40** | **−$0.61** | Medium |
| **5. Corporate & Other drag** | −$796M FY25 | Historical range (−$367M FY24 → −$796M FY25) | **+$0.81** | **−$0.20** | Medium |
| **6. Interest expense / rates (100bp)** | FY26 interest $620–660M | Company-disclosed Item 7A (~$78M / 100bp) | **+$0.31** | **−$0.31** | High |
| **7. FX (10% on net positions)** | real/CAD/euro/yuan | Company-disclosed ("not material" net of hedges) | **+$0.10** | **−$0.10** | High |

**Memo — disclosed commodity Item 7A VaR (narrow, NOT the crush-spread row):** 10% adverse on highest daily trading position = $(131)M ≈ −$0.53 EPS; lowest = $(61)M ≈ −$0.25 EPS [FY25 10-K, Item 7A]. Point-in-time MtM VaR, understates the crush-margin cycle exposure.

## 3. Sensitivity Ranking

| Rank | Variable | Absolute Impact ($/sh) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | Biofuel mandate policy | **$1.13** | Tailwind (RVO favorable) |
| 2 | Soybean + softseed crush spread | **$1.06** | Tailwind, symmetric; "heavily inverted" curves |
| 3 | Corporate & Other drag | **$0.51** | Headwind, easing |
| 4 | Freight / ocean-bunker cost | **$0.51** | Headwind (conflict) |
| 5 | Volume & utilization | **$0.50** | Tailwind (Viterra footprint) |
| 6 | Interest expense / rates | **$0.31** | Headwind (Viterra debt) |
| 7 | FX | **$0.10** | Mixed / immaterial |

Variables 1–2 (~$1.06–1.13) are roughly double 3–5 (~$0.50). Together variables 1+2 can move FY26 adjusted EPS by >$2 (~±23%).

## 4. The Single Highest-Sensitivity Variable

**Biofuel mandate policy is the single variable that moves earnings most, and it does so by moving the crush spread (rank 2) — one transmission chain, not two independent bets.** The cleanest evidence: the EPA RVO decision moved BG's own FY2026 adjusted-EPS guidance from $7.50–8.00 to $9.00–9.50 (+$1.50, ~+19%) in ~two months. It is external/policy-controlled, not company-controlled. Current direction tailwind; an adverse swing (RVO under-delivery, blending economics weakening) would retrace guidance toward $7.50–8.00 (~−$1.50). The thesis classification this implies is **policy-conditional / commodity-conditional**, not company-specific.

## 5. Interaction Effects

(1) Biofuel policy and the crush spread are mechanically linked (a mandate is favorable *because* it lifts the oil leg). (2) Crush spread and volume co-move (weak spread = weak demand = lower throughput de-levering the fixed base). (3) Geopolitics is a common upstream cause: the Middle East conflict simultaneously helped the oil leg (rank 1) and hurt freight (rank 4) — a partial natural hedge. (4) Interest and working-capital intensity co-move (higher flat price inflates WC debt). The biofuel-policy/crush-spread chain has no offset and is where compounding works against earnings.

## 6. Non-Linear / Asymmetric Risks

Downside-skewed: spread compresses faster than it expands (soy EBIT −61% FY24 vs +40% FY25) with no contractual floor; operating deleverage on the $2,037M fixed base; all three legs must be priced before margin locks; leverage (ND/EBITDA ~5.8x) amplifies any EBIT shock at the EPS line. One favorable asymmetry: geopolitics/energy is two-sided (self-hedging at the consolidated level).

## 7. Earnings Volatility Score

**Score: 70 / 100** — *INVERTED: higher = WORSE (more volatile / more sensitive).* Band: 61–80 — High volatility.

**Confidence in this score: Low** — the most material variable (crush spread) has no company-disclosed crush-margin sensitivity; only a narrow MtM VaR is disclosed, and the dominant impact figures are historical-range or inferred.

**One-line reason:** Two external, policy- and market-set variables (biofuel mandates and the crush spread) — neither company-controlled, mechanically linked, no contractual margin defense, asymmetric downside — can each move FY2026 adjusted EPS by ~$1.0–1.5 (together >±20% of the ~$9.25 base). The score sits at the lower end of "high volatility" because BG demonstrably dampens the ride (VaR-limited hedging, hemispheric diversification, positive segment EBIT FY23–25) but those levers manage volatility around the trend, not the trend itself. Consistent with the business-model external-dependency score of 72/100 (also inverted, "mostly externally driven").