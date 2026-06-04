# Reverse DCF — What's Priced In — HCG

*HealthCare Global Enterprises Limited (NSE: HCG, BSE: 539787) — pan-India oncology-focused hospital network. All figures INR million (₹ Mn), consolidated, unless a per-share / ratio figure is stated. FY ends 31 March (FY26 = year ended 31 Mar 2026). Reported (Ind AS, post-Ind AS 116) figures used unless an adjusted basis is labelled.*

**Business type (from `00_valuation-data-triage` / Business-Type Method Map):** Operating company (Health Care Facilities). The correct reverse model is therefore an **FCFF / enterprise-value** reverse-DCF — solve for the cash-flow growth the current EV implies, discounted at WACC. This is **not** a Financial or REIT issuer, so the equity-direct DDM/residual-income route does not apply.

> **This agent runs in parallel with `04_intrinsic-dcf` and establishes its OWN discount rate** using the same component methodology (risk-free + ERP + beta for cost of equity; after-tax cost of debt; market-value weights). It does not read `04`. The synthesizer reconciles any WACC difference between the two.

> **Upstream inputs used:** `01_price-and-capital-structure.md` (price ₹646.15, EV ₹109,187.9M, net debt, shares — present, used verbatim); `earnings/01_historical-financials.md` (FCF base and FY22–FY26 history — present); `earnings/07_earnings-sensitivity.md` (achievable EBITDA/EPS swing ranges — present); `earnings/04_guidance-consensus.md` (forward consensus and management guidance — present); `business-model/09_moat.md` and `10_external-dependency.md` (moat durability and the policy overhang on any above-average growth — present). All available and consumed.

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | ₹646.15 | from `01` (NSE last close, ~late-May 2026 pool snapshot; CIQ EstimatesReport.xls) |
| Enterprise value (anchor) | ₹109,187.9M | from `01` §4 (mkt cap 96,461.1 + total debt 17,353.6 incl. leases + minority 782.4 − cash 5,409.2) |
| Net debt (incl. leases) | ₹11,944.4M | from `01` §5 (total debt − cash; ties to CIQ "Net Debt" FY26) |
| Shares (market cap) | 149.30M | from `01` §2 (paid-up capital ₹1,493.0M ÷ ₹10) |
| FCF base — literal FY26 | ₹586M | `earnings/01` §1 (CFO 3,471 − capex 2,885; CFO/capex from Q4&FY26 deck p.22/p.15) |
| FCF base — normalized (maint. capex ≈ D&A) | ₹1,029M | CFO 3,471 − maintenance capex proxy 2,442 (D&A FY26 ₹2,441.7M, `earnings/03` cost stack); see base-choice note |
| Discount rate (WACC) used | **12.4%** | built below (components stated); independent of `04` |
| Forecast horizon (years) | **10** explicit + Gordon terminal | stated; horizon sensitivity (5/15y) in §4 |
| Terminal growth g | 5.0% | India long-run nominal proxy; ≤ risk-free (7.0%); WACC-sanity bound respected |
| Tax rate | 25% | India normal corporate rate ≈25.17% (*Inference, not from filings*); used for NOPAT in the margin lens |

### Discount rate (WACC) build — components stated

Same methodology the DCF uses; each input sourced and labelled.

| Component | Value | Basis |
|---|---:|---|
| Risk-free rate (India 10Y G-Sec) | 7.0% | `Web: tradingeconomics / macrotrends India 10Y yield, ~29-May-2026 (indicative, unverified)`. Corroborated by HCG's own ESOP-model risk-free 7.15–7.18% [FY24-25 AR, Note (share-based payments), risk-free interest rate disclosure]. |
| Equity risk premium (total, India) | 7.5% | `Web: Damodaran "Country Default Spreads and Risk Premiums," India total ERP ≈7.46% (July-2025 update; 2026 edition Mar-2026) (indicative, unverified)`. Rounded to 7.5%. |
| Beta (levered) | 0.85 | *Inference, not from filings.* The CIQ 5-Year raw beta for HCG is **−0.09** [Company Comparable Analysis.xls, Operating Statistics, 5-Year Beta, as-of 2026-06-01] — economically nonsensical for WACC (a negative beta would put cost of equity below the risk-free rate). Indian hospital peer raw betas in the same export are all illiquidity-distorted and low (Max 0.10, NH 0.17, Medanta 0.19, Fortis 0.65, Yatharth 0.99). I reject the raw −0.09 and use a re-levered sector beta: Health Care Facilities unlevered beta ≈0.70 (*inference*), re-levered at HCG D/E ≈0.18 (total debt 17,354 ÷ equity 96,461) → ≈0.79; rounded up to **0.85** to stay conservative and inside the observed Fortis-to-Yatharth (0.65–0.99) range. |
| Cost of equity | 13.4% | 7.0% + 0.85 × 7.5% = 13.375% ≈ 13.4% |
| Pre-tax cost of debt | 8.0% | Average cost of debt ~8% [Q4/FY26 transcript, Q&A, lines 482–483, via `earnings/04` §2]; consistent with ~8% on residual variable debt |
| After-tax cost of debt | 6.0% | 8.0% × (1 − 0.25) |
| Equity weight (E/V) | 84.8% | equity ₹96,461M ÷ (96,461 + 17,354) on market values |
| Debt weight (D/V) | 15.2% | debt ₹17,354M (incl. leases) ÷ 113,815 |
| **WACC** | **12.36% ≈ 12.4%** | 0.848 × 13.4% + 0.152 × 6.0% = 11.36% + 0.91% |

This 12.4% sits inside the moat module's stated "plausible India cost of capital ~12–13%" range [`business-model/09_moat.md` §3, footnote 2]. WACC-sanity bounds (MODULE_RULES Economic Consistency Gate 4) are met: risk-free and ERP are dated and labelled; after-tax cost of debt 6.0% is plausible vs HCG's ~8% reality; terminal g (5.0%) is below the risk-free rate.

### FCF base choice — stated, because it drives the answer

FY26 literal FCF is **₹586M**, but that figure is *depressed by growth capex*: FY26 capex was ₹2,885M against D&A of only ₹2,442M, and FCF has fallen every year while the network expands (Nagpur, Vizag, North Bangalore, ~200+ new beds guided) [`earnings/01` §1, §6; `earnings/04` §2]. Reverse-DCF-ing off ₹586M would double-penalize: it treats growth capex as a permanent cash drain *and then* asks the company to grow. The economically honest primary base normalizes capex toward maintenance (≈ D&A ₹2,442M), giving **normalized FCF ≈ CFO 3,471 − 2,442 = ₹1,029M**. I solve on **both** bases and flag the spread. Neither base is flattering: even the higher (normalized) base requires a large implied growth (§2).

---

## 2. Implied Expectations

**Method (FCFF / EV reverse-DCF):** hold the discount rate (WACC 12.4%), the terminal growth (5.0%), and the horizon (10 years explicit) **fixed**; **solve for** the constant FCFF growth rate over the explicit horizon that sets the present value of FCFF + terminal value equal to today's EV (₹109,187.9M). Then run two secondary lenses (steady-state EBIT margin; pure-Gordon FCFF multiple) to triangulate.

| What the Price Implies | Solved Value |
|---|---:|
| **Implied FCF CAGR over 10y** — on **normalized** FCF base (₹1,029M) *(primary)* | **≈ 33%** |
| Implied FCF CAGR over 10y — on **literal** FY26 FCF base (₹586M) | ≈ 42% |
| Implied FCF CAGR over 10y — on mid base (capex ≈ ₹2,663M → FCF ₹808M) | ≈ 37% |
| Implied years of above-GDP (>5%) FCF growth — *fade view, normalized base* | the price needs **~15 years** of ~25% FCF growth, or ~10 years of ~33%, before fading to 5% (see §4 horizon row) |
| Implied steady-state EBIT margin — *revenue fixed at 14%→5% fade, ROIC 15%* | **degenerate: >50% (solver ceiling)** — i.e. margin expansion *alone* cannot justify the EV; growth is the load-bearing assumption (see note) |
| Pure-Gordon cross-check: year-1 FCFF needed for EV (no explicit ramp) | **₹7,695M** = 13.1× literal FY26 FCF, or 7.5× normalized FCF |

**Held fixed vs solved:** WACC (12.4%), terminal g (5.0%), and horizon (10y) were held fixed; the **FCFF growth rate** was solved for in the primary table. In the EBIT-margin lens, revenue growth (14% fading to 5%), WACC, ROIC (15%) and horizon were held fixed and the **flat EBIT margin** was solved for.

**Note on the degenerate EBIT-margin lens (a finding, not a failure).** When revenue growth is pinned to the consensus-like fade and reinvestment is set ROIC-consistently, no plausible EBIT margin — even one well above the ~16.8% peer median, up to the 50% solver ceiling — generates enough FCFF to justify the EV. The model only clears at the high implied *growth* rates in the primary table. **Translation: the current price is a growth bet, not a margin bet.** Margin expansion (management's "+100 bps" FY27 and "20%+ ROCE in 5 years" roadmap) is necessary but nowhere near sufficient on its own; the EV requires a multi-year, high-teens-to-30%+ compounding of free cash flow that HCG has never produced.

**Terminal-value caveat (MODULE_RULES Gate 5).** At the solved growth rates the terminal value is **73–76% of total PV** (76% on the literal base, 73% on the normalized base) — at/above the 75% terminal-dominance flag. The reverse-DCF is therefore **terminal-sensitive**; that is why the EV/EBITDA multiple-decay cross-check (§3) and the pure-Gordon line above are carried alongside, not the single-base FCF-CAGR number in isolation.

---

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| **Implied FCF CAGR ≈ 33%** (normalized base, 10y) | FCF has **declined**: ₹1,184M (FY23) → ₹989M → ₹1,082M → **₹586M (FY26)** — a negative trajectory, not +33% [`earnings/01` §1] | FY26 capex ₹2,885M > CFO growth; FY27 EPS-Normalized consensus cut −19% over 6 months; HCG missed EPS consensus in 3 of last 4 FYs [`earnings/04` §4, §6] | **No** (no precedent; trajectory is the wrong sign) |
| Implied FCF CAGR ≈ 42% (literal base, 10y) | as above | as above | **No** |
| Equivalent: sustain ~20% **EBITDA** growth for many years (EV/EBITDA decays 23.4x→19.0x→15.8x on FY26→FY27E→FY28E) | Reported EBITDA CAGR FY23–FY26 ≈ +16%/yr; FY26 +20.3% YoY [`earnings/01` §1–§2] | Consensus FY27 EBITDA +23% (₹5,737M), FY28 +20% (₹6,899M); management "EBITDA to grow faster than historical 18% CAGR" [`earnings/04` §2–§4] | **Stretch** — ~20% EBITDA growth has happened recently and is consensus near-term, but must persist a decade+ to feed 33% FCF growth as capex normalizes |
| Implied steady-state EBIT margin >> peer median (margin lens degenerate) | FY26 EBIT margin 9.7%; six-year ROC 4.5–5.0%, **below cost of capital every year** [`earnings/01` §1; `business-model/09_moat.md` §3] | FY27 consensus EBIT margin 10.8%; management targets "20%+ pre-tax ROCE in 5y" (FY26 actual 14%) [`earnings/04` §2] | **Stretch-to-No** — needs a margin/return inflection HCG has guided to but never delivered |
| Above-GDP growth must persist ~10–15 years | Narrow, economically **unproven** moat; advantages "not converting into defended economics" [`business-model/09_moat.md` §5] | Government DPCO price control + scheme disallowances cap pricing on ~33% of revenue with no hedge [`10_external-dependency.md` §5; `earnings/07` §6] | **No** — a decade-plus advantage period is hard to defend for a narrow-moat, policy-exposed operator |

**Judgement (evidence-backed).** The price's implied expectations are **aggressive**. The single cleanest disconfirming fact: HCG's free cash flow has *fallen* from ₹1,184M to ₹586M over FY23–FY26 [`earnings/01` §1], yet the EV requires it to compound at ~33% (normalized base) to ~42% (literal base) for a decade. The +20%-ish EBITDA growth embedded in the EV (EV/EBITDA decaying from 23.4x trailing toward 15.8x on FY28E) is in line with recent results and consensus *near-term*, but for that to translate into 33%+ FCF growth, capex must fall sharply *while* growth stays high — and HCG is in the opposite phase (capex rising into a bed-expansion programme). The moat is narrow and "economically unproven," with ROC below cost of capital in each of the last six years [`business-model/09_moat.md` §3, §5], so the long, defended above-average growth window the price assumes lacks evidentiary support. Earnings-module driver evidence (volume/utilisation is the dominant lever and *is* improving; West cluster has utilisation headroom from 50%) gives a plausible *direction* for double-digit EBITDA growth [`earnings/07` §3–§4], but not for the 30%+ FCF compounding the price demands.

---

## 4. Robustness

Implied FCF CAGR to justify today's EV, varying the discount rate ±1% (10-year explicit horizon, g_term 5.0%). Both FCF bases shown because the base choice is the larger swing factor than ±1% WACC.

| Discount Rate | Implied FCF CAGR — normalized base (₹1,029M) | Implied FCF CAGR — literal base (₹586M) |
|---|---:|---:|
| WACC −1% (11.4%) | 30.5% | 38.6% |
| **WACC (12.4%)** | **33.2%** | **41.6%** |
| WACC +1% (13.4%) | 35.7% | 44.3% |

**Horizon sensitivity (normalized base, WACC 12.4%):** a longer assumed above-average-growth window lowers the required annual rate but lengthens the years of excess growth the market must believe in —

| Explicit horizon | Implied FCF CAGR |
|---|---:|
| 5 years | 62.3% |
| 10 years | 33.2% |
| 15 years | 24.8% |

Read: even stretching the high-growth window to **15 years**, the price still requires ~**25% annual FCF growth** off a normalized base — against a company whose FCF has been declining. The conclusion (aggressive) is stable across both the ±1% WACC band and the 5–15-year horizon band; it does not hinge on the exact discount rate.

---

## 5. What's-Priced-In Read

At **₹646.15** (EV ₹109,187.9M), the market is pricing in roughly **33% annual free-cash-flow growth for a decade** on a normalized-capex base — and **~42%** if you take FY26's literal ₹586M FCF — fading to 5% thereafter, equivalent to holding ~20% EBITDA growth long enough to bleed EV/EBITDA down from 23.4x to the mid-teens. **That is aggressive.** It is aggressive because HCG's free cash flow has *declined* from ₹1,184M to ₹586M over FY23–FY26 while capex climbed, it has earned a return on capital (4.5–5.0%) below its ~12.4% cost of capital in every one of the last six years, and its moat is narrow and "economically unproven," with ~33% of revenue exposed to government price control that caps pricing with no hedge [`earnings/01` §1; `business-model/09_moat.md` §3, §5; `10_external-dependency.md` §5].

Because the implied expectations sit **above** what the company's own history and the earnings-module evidence can plausibly deliver, the reverse-DCF points to **downside risk** in the current price rather than embedded upside: the market is already extrapolating the volume/utilisation-led EBITDA inflection management has *guided* (15–20% revenue, +100 bps margin, 20%+ ROCE in five years) but has not yet *converted into cash*. The bull rebuttal — that maturing centres (West at 50% utilisation, ramping cohort growing +17%) plus capex normalization could lift FCF conversion sharply — is the one path that defends the price, but it is a forecast of an inflection, not a fact in the record. **For the price to be merely fair (not aggressive), HCG must do something it has never done: compound free cash flow at 25–33% for 10–15 years.** That is the bar the current price sets.

*Note: scenario probabilities, probability-weighted targets, risk/reward, and the final rating are deliberately not produced here — those belong to `07_scenario-and-fair-value` and the master synthesizer, not this agent.*

---

### Self-check

- [x] Current price (₹646.15) and EV (₹109,187.9M) match `01` verbatim; price present, so the agent runs (not skipped).
- [x] Discount rate stated explicitly (12.4%) with full component basis; built independently of `04` per the parallel-run rule.
- [x] Solve states what was held fixed (WACC, g, horizon) and what was solved for (FCFF growth; and EBIT margin in the secondary lens).
- [x] Implied expectations compared to HCG's actual FCF history (declining ₹1,184M→₹586M) and to earnings-module evidence (consensus, surprise record, capex phase, sensitivity drivers).
- [x] Achievable/stretch/no judgement is tied to cited rows, not asserted.
- [x] Robustness shown across WACC ±1% and across 5/10/15-year horizons.
- [x] Terminal value flagged at 73–76% of PV (terminal-sensitive); EV/EBITDA decay and pure-Gordon lines carried as cross-checks.
- [x] Raw CIQ beta (−0.09) rejected with reasoning; substitute beta labelled as inference.
- [x] No banned phrases ("cheap/expensive", "undervalued/overvalued", "attractive", "well positioned", etc.) used as conclusions.
