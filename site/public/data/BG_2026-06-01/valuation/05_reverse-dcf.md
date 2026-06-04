# Reverse DCF — What's Priced In — BG

**Company:** Bunge Global SA (NYSE: BG). **Reporting currency:** US$ millions unless a per-share basis is stated. **Today:** 2026-06-01. **Business type:** commodity/cyclical **Operating** company (agri-commodity processor/merchandiser) per `00_valuation-data-triage` and `01_price-and-capital-structure` — so this agent reverses an **FCFF / enterprise-value** model (Business-Type Method Map: Commodity/cyclical → FCFF DCF on normalized mid-cycle earnings). The cyclicality gate applies: the FCFF base is a **normalized mid-cycle band**, not a trailing point figure (trailing FCF is negative and Viterra-distorted).

> **No pool-sourced price — confidence-capped.** The anchor price ($123.35) is **indicative/web-sourced**, not from the data pool [01 §1; corroborated by stockanalysis.com $123.30 close 2026-05-29, and a CNBC/search aggregate ~$126.50 — Web, 2026-06-01, unverified]. Per MODULE_RULES this reverse-DCF runs on that indicative anchor, but the no-current-price caps bind: **valuation confidence ≤ 55**, and every implied-expectation figure inherits the indicative-price caveat (a precise pool price would shift EV and the implied growth a touch). Treat the price as an indicative **~$123–126** band, and the "what's-priced-in" read as directional, not precise.

> **This agent established its OWN discount rate** (it runs in parallel with `04_intrinsic-dcf`, not after it). The synthesizer reconciles any WACC difference between `04` and this module.

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price (indicative) | **$123.35** | Web: MarketBeat close 2026-05-29 (indicative, unverified) [01 §1] |
| Shares (market-cap basis) | 194,018,115 | 10-Q cover, Apr-27-2026 [01 §2] |
| Market cap (indicative) | $23,932M (~$23.9B) | 194,018,115 × $123.35 [01 §3] |
| Total debt | $14,553M | Q1 FY26 10-Q Note 13 [01 §4] |
| Cash & equivalents | $839M | Q1 FY26 10-Q balance sheet [01 §4] |
| Net debt | $13,714M | Total debt − cash [01 §5] |
| NCI + redeemable NCI | $1,381M + $51M | 10-Q balance sheet [01 §4] |
| **Enterprise value (EV), base (cash-only)** | **$39,078M (~$39.1B)** | EV bridge [01 §4]; alt $38,318M if ST investments netted |
| **FCFF base (normalized mid-cycle)** | **~$1,750M** (band ~$1,674M–$2,299M) | Built below from FY26 guidance/consensus; see §1a |
| **Discount rate (WACC) used** | **7.0%** (robustness 6.0%–8.0%) | Built below; components in §1b |
| Forecast horizon (explicit) | **10 years** + Gordon terminal | Standard; terminal g = 2.5% (long-run US nominal GDP proxy) |

### 1a. Why the FCFF base is normalized (cyclicality gate — mandatory)

Trailing FCF is **not usable** as a base: FY2025 FCF = **−$879M** and TTM FCF (to Q1'26) = **−$1,161M** [earnings/01 §1–§2]. Both are depressed by the mid-2025 Viterra consolidation (CFO collapsed to $844M FY25 on seasonal working-capital build and integration, while capex rose to $1,723M). Using a single trough figure is a banned approach for a cyclical [MODULE_RULES, Cyclicality gate]. The base is therefore a **forward normalized mid-cycle FCFF**, built from FY2026 guidance the Street has corroborated:

- FY26 consensus EBIT **$3,025M** (consensus EBITDA $3,997M − guided D&A $975M ≈ $3,022M; ties to Street EBIT $3,025M) [earnings/04 §3]. NOPAT = $3,025M × (1 − 24% guided tax) = **$2,299M**.
- `FCFF = NOPAT + D&A − capex − ΔNWC`. With guided capex $1,600M (midpoint) and mid-cycle ΔNWC ≈ 0: FCFF ≈ 2,299 + 975 − 1,600 = **$1,674M** (low end).
- With steady-state capex = D&A ($975M) and ΔNWC ≈ 0: FCFF ≈ **$2,299M** (high end).
- **Cross-check (adjusted FFO):** Q1'26 adjusted FFO $530M; FY26 framed ~40% H1 / 60% H2 → FY adjusted FFO ~$2.2–2.5bn; less capex $1.6bn → ~$0.6–0.9bn, less maintenance capex → ~$1.0–1.5bn. This brackets the EBIT-built figure [earnings/04 §2; Q1 2026 release, pp.7–9].

**Base used: ~$1,750M**, leaning toward the guided-capex (lower) end. Rationale: Bunge is still in an elevated-capex integration phase, and over a full commodity cycle ΔNWC for a growing flat-price book is more likely a modest drain than zero. The band (~$1,674M–$2,299M) is carried into the sensitivity table — the implied-growth read is shown across the whole band, not just the point.

### 1b. Discount rate (WACC) — components and basis

| Component | Value | Basis |
|---|---:|---|
| Risk-free rate | 4.45% | 10Y US Treasury, 2026-05-29 [Web: FRED/Treasury H.15, 2026-05-29 — indicative, unverified] |
| Equity risk premium | 5.0% | Damodaran implied US ERP 4.23% (Jan-2026) normalized up to a 5.0% mature-market figure [Web: Damodaran 2026 data update, unverified]; the higher figure is conservative (raises Ke) |
| Beta | 0.60 | Web range 0.53–0.63 [Web: stockanalysis.com 0.63; other aggregators 0.53, 2026-06-01, unverified] |
| Cost of equity (CAPM) | 7.45% | 4.45% + 0.60 × 5.0%. **Cross-check:** company discloses cost of equity **7.2%** [business-model/09_moat §3; Q1 FY26 call] — independent corroboration |
| Pre-tax cost of debt | ~4.4% (guided) / ~5.75% (normalized BBB) | Guided FY26 net interest $640M ÷ debt $14,553M = 4.4%; normalized = rf 4.45% + ~1.3% IG spread [earnings/04 §2] |
| After-tax cost of debt | ~3.3%–4.4% | Pre-tax × (1 − 24% tax) |
| Capital weights | E 62% / D 38% | Market-cap equity $23.9B / book debt $14.55B (near-par, IG) |
| **Mechanical blended WACC** | **5.7%–6.3%** | CAPM Ke + guided/normalized Kd at the weights above |
| **WACC used (base)** | **7.0%** | See note below |

**Why 7.0%, above the mechanical ~6% blend.** The mechanical CAPM/blended WACC (≈5.9%) is implausibly low for a 2%-EBIT-margin commodity processor carrying ~5.8x net-debt/EBITDA. Three adjustments push the working figure up, all evidence-based: (1) the published **beta of 0.53–0.63 understates operating and financial risk** — it reflects the stock's portfolio-diversification benefit, not the cyclicality of an un-hedgeable crush spread with "no contractual lever to defend margin" [earnings/07 framing facts]; (2) the **guided cost of debt (4.4%) is flattered** by legacy low-rate debt and interest-income netting — a normalized IG cost is ~5.75%; (3) anchoring at/above the company's **own disclosed 7.2% cost of equity** and its **6.7% headline ROIC** avoids letting the DCF manufacture value the moat module explicitly says BG does not earn [business-model/09_moat §3]. The base **7.0%** sits just above the mechanical blend and just below the disclosed cost of equity; robustness is run at **6.0% / 7.0% / 8.0%** (§4), spanning the CAPM-low to a risk-adjusted-high for a 5.8x-levered cyclical. *This WACC is this agent's own build; `04_intrinsic-dcf` may differ — the synthesizer reconciles.*

**WACC sanity bounds (MODULE_RULES item 4):** rf and ERP are dated and web-labelled (above); after-tax Kd (3.3%–4.4%) is positive and consistent with an IG credit; terminal g (2.5%) does not exceed long-run US nominal GDP. All bounds pass.

---

## 2. Implied Expectations

**Solve:** hold the discount rate (WACC 7.0%), horizon (10y explicit + Gordon terminal), terminal growth (2.5%), and the normalized FCFF base ($1,750M) **fixed**, then find the value that sets the present value of FCFF equal to today's EV ($39,078M). Solved by bisection; formula: `EV = Σ FCFF₀(1+g)ᵗ/(1+WACC)ᵗ + [FCFF₁₀(1+gₜ)/(WACC−gₜ)]/(1+WACC)¹⁰`.

| What the Price Implies | Solved Value | What was held fixed / solved |
|---|---:|---|
| **Implied FCFF CAGR over 10y (primary)** | **~2.3% per year** | Held: WACC 7.0%, gₜ 2.5%, FCFF₀ $1,750M, 10y horizon. **Solved: explicit FCFF CAGR.** |
| Implied years of above-GDP growth (fade model) | **~0 years** | Held: WACC 7.0%, a 5–10% "high" growth rate, gₜ 2.5%, FCFF₀ $1,750M. **Solved: number of high-growth years.** Even ~0 excess-growth years over-covers EV (PV ≈ $39.86B ≥ EV $39.08B): the price needs **no** extended high-growth phase. |
| Implied steady-state EBIT margin | **~2.5%–3.9%** (≈3.3% midpoint) | Held: revenue flat at consensus $91,485M, capex = D&A, ΔNWC ≈ 0, WACC 7.0%. **Solved: constant EBIT margin** via `margin = EV(WACC−g)/[rev(1−tax)(1+g)]` — 3.93% at g=0%, 2.47% at g=2.5%. |

**Reconciliation of the three solves.** They agree. A ~2.3% FCFF CAGR ≈ the terminal rate, i.e. the market is paying for **mid-cycle FCFF that merely keeps pace with inflation/GDP** — which is exactly why the fade model needs ~0 years of excess growth, and why the implied EBIT margin (~3.3% midpoint) is only modestly above the depressed FY25 GAAP level (2.18%) and right at the Street's own FY26 implied margin (EBIT $3,025M / rev $91,485M = **3.31%**). Three independent framings all say: **the price requires no margin recovery to the cycle peak and no above-GDP growth — only that normalized mid-cycle economics hold.**

**Terminal value share:** terminal value is **64.8% of EV** at the base — **below** the 75% terminal-dominance flag, so the DCF is not terminal-dominated and the no-extra-lens escalation is not triggered. (The implied FCFF yield on the base is `$1,750M / $39,078M = 4.48%`; a single-stage Gordon model implies a perpetual growth of **~2.4%**, consistent with the 10-stage solve.)

---

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| **Implied FCFF CAGR ≈ 2.3%/yr (10y)** | FCF was +$2,186M (FY23) → +$524M (FY24) → −$879M (FY25); no clean multi-year FCF CAGR (Viterra break). Adjusted EPS path FY23 $13.66 → FY24 $9.19 → FY25 $7.57 (down ~26% over two years) [earnings/01 §1, §4] | FY26 guided adjusted EPS $9.00–9.50 (+~20% vs FY25 $7.57); FY27 consensus $10.89; revenue estimates ~flat (+1.4%/yr FY26→FY27) [earnings/04 §2, §4] | **Yes (low bar).** 2.3% FCFF growth ≈ inflation. The Street already models adjusted EPS up ~20% into FY26 and a further ~15% into FY27. The price asks for far less than the near-term consensus path. |
| **Implied EBIT margin ≈ 3.3% (midpoint)** | Total EBIT margin: FY23 5.60% → FY24 3.37% → FY25 2.18%; adjusted EBIT margin FY25 ~2.9% [earnings/01 §1, §6] | Street FY26 implied EBIT margin = 3.31% (EBIT $3,025M / rev $91,485M); upgrade is margin/biofuel-led, not volume-led [earnings/04 §4] | **Yes / Stretch.** ~3.3% is above the FY25 trough (2.18%) but below FY24 (3.37%) and far below the FY23 peak (5.60%). It requires the FY26 crush/biofuel margin recovery to **hold mid-cycle**, not expand. Achievable if spreads normalize; a stretch if they retrace to the FY25 trough. |
| **Implied ~0 years of above-GDP growth** | Scale has not produced ROIC above cost of capital: headline ROIC 6.7% vs 7.2% cost of equity [business-model/09_moat §3] | Moat = **narrow**; advantage is shared with ADM/Cargill/LDC; "no proven margin/ROIC superiority" [business-model/09_moat §5] | **Yes (consistent).** The price assumes **no excess-return / no above-GDP growth phase** — which matches a narrow-moat business earning ~its cost of capital. The market is not paying for a moat-driven growth runway. |

**Judgement (3 sentences).** The market's implied expectations are **conservative-to-fair, not aggressive**: at the indicative ~$123 price the EV embeds only ~2.3% FCFF growth and a ~3.3% mid-cycle EBIT margin, both **below** the near-term consensus trajectory (FY26 adjusted EPS +~20%, FY27 +~15%) and well below the FY23 cycle-peak margin of 5.60%. The cited evidence for "achievable" is direct: management's own raised FY26 guide ($9.00–9.50) and the Street's matched $9.43 consensus already imply more earnings power than the price requires [earnings/04 §3]. The single thing that must hold for the implied case to be cleared is that the **FY26 crush/biofuel margin recovery does not retrace to the FY25 trough** — and because the dominant driver (biofuel mandate policy → crush spread) is external/policy-set with no contractual floor and asymmetric downside [earnings/07 §4, §6], that "hold" is a real, not trivial, condition.

---

## 4. Robustness

Implied 10-year FCFF CAGR required to justify the indicative EV ($39,078M), holding FCFF₀ = $1,750M and gₜ = 2.5% fixed, varying only WACC:

| Discount Rate | Implied FCFF CAGR to Justify Price | Terminal Value % of EV |
|---|---:|---:|
| WACC − 1% (6.0%) | **−0.7%** (FCFF can *shrink* slightly and still justify the price) | 68% |
| **WACC (7.0%) — base** | **+2.3%** | 65% |
| WACC + 1% (8.0%) | **+4.8%** | 62% |

**Sensitivity to the normalized FCFF base** (WACC 7.0% fixed) — this is the larger swing factor than WACC:

| FCFF₀ | Implied 10y FCFF CAGR |
|---|---:|
| $1,500M | +4.2% |
| $1,674M (guided-capex low end) | +2.8% |
| **$1,750M (base)** | **+2.3%** |
| $2,000M | +0.6% |
| $2,299M (maint-capex high end) | −1.1% |

**Read of robustness.** Across the full WACC band (6%–8%) the implied FCFF growth stays in a **−0.7% to +4.8%** range — at every plausible discount rate the price asks for **at-or-below GDP-level** FCFF growth. The result is more sensitive to the **FCFF base** than to WACC: even at the conservative low end of the normalized band ($1,674M) the implied growth is only ~2.8%, and at the maintenance-capex high end ($2,299M) the price is justified by **shrinking** FCFF. Under no reasonable combination does the price require aggressive growth. (Note: the EV-choice also matters mildly — netting ST investments to EV $38,318M lowers the implied CAGR to ~2.0%.)

---

## 5. What's-Priced-In Read

At the indicative **~$123** price, the market is pricing in roughly **2.3% FCFF growth for 10 years** on a normalized mid-cycle base of ~$1,750M — equivalently, **~0 years of above-GDP growth** and a **~3.3% mid-cycle EBIT margin** — discounted at a 7.0% WACC. That is **conservative-to-fair**, not aggressive: it sits **below** the near-term consensus path (FY26 adjusted EPS guided +~20% to $9.00–9.50, FY27 consensus $10.89) and below the FY23 cycle-peak EBIT margin of 5.60%, and it asks for no moat-driven excess returns — consistent with the narrow-moat, ~cost-of-capital ROIC the business-model module found [business-model/09_moat §3, §5; earnings/04 §2].

**Direction:** because the implied expectations are **at or below** what the company can plausibly deliver if mid-cycle margins merely hold, the asymmetry leans to **upside** rather than downside. The binding condition is the cyclical one: the price's modest assumptions are only "achievable" if the FY26 crush/biofuel-driven margin recovery holds mid-cycle and does not retrace to the FY25 trough (2.18% EBIT margin) — a policy- and spread-dependent variable with asymmetric downside and **no contractual floor** [earnings/07 §4, §6]. If spreads retrace to trough, the ~$1,750M base is too high and the priced-in ~2.3% growth becomes a stretch; if they hold or normalize, the price is undemanding. This is the classic commodity-processor setup: **the price is not the risk — the mid-cycle margin assumption is.**

---

*Self-check: price and EV tie to `01` verbatim (indicative caveat propagated); WACC stated with full components and basis (own build, parallel to `04`); the solve states what was held fixed (WACC, horizon, gₜ, FCFF base) and what was solved for (growth / years / margin); implied expectations compared to BG's actual FCF/EPS/margin history and to earnings-module guidance/consensus and moat evidence; achievable/stretch judgement is evidence-cited, not asserted; robustness shown across WACC and across the FCFF base; no banned phrases used. No-price cap binds: valuation confidence ≤ 55.*
