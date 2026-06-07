# Reverse DCF — What's Priced In — TMCV

**Entity:** Tata Motors Limited (formerly TML Commercial Vehicles Limited), NSEI: TMCV. Demerged CV business; FY26 (year ended March 31, 2026) is the first full consolidated fiscal year. Reporting standard: Ind AS. Currency: INR (₹ crores).

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | ₹369.15 | S&P Capital IQ Financials export, Key Stats tab, downloaded 2026-06-07; last-close quote as of export date — from data pool (tier 5), not web-sourced |
| Enterprise value (EV) | ₹1,28,498 cr | Valuation/01_price-and-capital-structure.md — Anchor Block; Capital IQ convention: market cap ₹1,35,933 cr + total debt incl. leases ₹5,615 cr − cash & ST investments ₹13,050 cr |
| FCF base (FY26) | ₹12,438 cr | Company-defined FCF: CFO less capex, plus interest received, plus investee dividends, less investments in core-auto equity-accounted investees. FY26 Integrated Annual Report (Ind AS), MD&A p.219 and Value Creation Architecture p.15 |
| FCF yield on EV (implied by base year) | 9.7% | ₹12,438 / ₹1,28,498 — this is the starting observation that anchors the reverse-solve |
| Shares (per-share reference) | 3,681.72 mn | SEBI LODR Consolidated Audited Results, Balance Sheet, March 31, 2026 |
| Discount rate (WACC) used | 13.0% | See component table below |
| Forecast horizon | 10 years (FY27–FY36), then terminal value in perpetuity | Standard operating-company horizon; TMCV is a capital-goods manufacturer, not a short-cycle business |
| Terminal growth rate (g) | 4.5% | India long-run nominal GDP proxy: RBI real GDP target ~6.5–7% + inflation ~4–4.5% ≈ 10.5–11% nominal; using 4.5% as conservative perpetuity growth given the FCF cycle and the risk that EV powertrain transition compresses future CV demand. Inference, not from filings. |

**WACC components:**

| Component | Value | Source / Basis |
|---|---:|---|
| Risk-free rate (India 10Y G-Sec yield) | 6.95% | India 10-year government bond yield as of June 5, 2026 — web-sourced, unverified (tradingeconomics.com). Labeled per MODULE_RULES. |
| Equity risk premium (India total ERP) | 7.08% | Damodaran 2026 country risk premium dataset — India total ERP = 7.08% (Baa3-rated; CRP 2.85% added to mature-market premium). Web-sourced, unverified (pages.stern.nyu.edu, Jan 2026 update). |
| Beta | 0.90 | Inference, not from filings. India CV manufacturing is a cyclical domestic industrial; comparable India auto/CV sector betas run 0.85–1.0. TMCV has no multi-year listed trading history (listed November 2025). Applied at the low end given >95% India domestic revenue and the company's demonstrated counter-cyclical cash generation. |
| Cost of equity | 13.32% | 6.95% + 0.90 × 7.08% = 6.95% + 6.37% = 13.32% |
| Pre-tax cost of debt | ~7.5% | Finance costs FY26 = ₹874 cr on average gross debt ~₹7,000 cr (FY25 closing ₹9,156 cr, FY26 closing ₹4,817 cr; midpoint ₹6,987 cr). Gross yield ≈ 12.5% is distorted by debt repayment timing; using 7.5% as a credible INR borrowing rate for an investment-grade-equivalent company. Inference, not from filings. |
| After-tax cost of debt | 5.4% | 7.5% × (1 − 0.28 normalised tax rate) |
| Debt weight (debt/EV) | 4.4% | ₹5,615 cr total debt / ₹1,28,498 cr EV |
| Equity weight (equity/EV) | 95.6% | ₹1,22,883 cr equity / ₹1,28,498 cr EV |
| **WACC** | **13.0%** | 0.956 × 13.32% + 0.044 × 5.4% = 12.73% + 0.24% = **12.97%, rounded to 13.0%** |

**Model:** Operating FCFF model. TMCV is an operating company (Business-Type Method Map: Operating). EV is valued on FCFF; equity is bridged as EV minus net debt.

**WACC sanity check:** Risk-free rate (6.95%) is web-sourced and dated. After-tax cost of debt (5.4%) is positive and plausible. Terminal growth (4.5%) is below WACC (13.0%), which is required for a finite terminal value — condition satisfied. TMCV is net-cash positive, so debt weight is low and WACC is almost entirely driven by cost of equity.

---

## 2. Implied Expectations

The solve holds the discount rate (13.0%), forecast horizon (10 years), and terminal growth rate (4.5%) fixed. It solves for the single FCF CAGR (applied uniformly across the explicit 10-year period) that equates the PV of all cash flows to today's EV of ₹1,28,498 cr.

**Solve formula:**

```
EV = FCF_base × Σ(t=1..10)[(1+g)^t / (1.13)^t] + [FCF_base × (1+g)^10 × (1+g_TV) / (WACC − g_TV)] / (1.13)^10

where g_TV = 4.5%, (1.13)^10 = 3.3946
```

**Trial results (₹ crores):**

| FCF CAGR (g) | PV of Explicit FCFs | PV of Terminal Value | Total PV = modelled EV |
|---:|---:|---:|---:|
| 0.0% | 67,491 | 45,019 | 1,12,510 |
| 1.5% | 72,147 | 52,270 | 1,24,417 |
| 1.7% (implied) | ~73,600 | ~54,700 | ~1,28,300 |
| 2.0% | 75,475 | 60,393 | 1,35,868 |

The solve converges at approximately **g ≈ 1.7%** (₹1,28,300 cr ≈ ₹1,28,498 cr, difference <0.2%).

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCF CAGR over 10-year explicit horizon | ~1.7% per annum |
| Implied % of EV from terminal value | ~43% (₹54,700 cr / ₹1,28,498 cr) |
| Implied FCF CAGR vs India nominal GDP growth (~10–11%) | Approximately 8–9 percentage points below nominal GDP |
| Implied FCF CAGR in real terms (deflating by ~5% inflation) | Approximately −3% real per year — a slow real FCF contraction |
| Implied years of above-GDP growth before fade (alt framing) | Zero — the price implies FCF growth below GDP from year one |

**What was held fixed:** WACC (13.0%), terminal growth rate (4.5%), forecast horizon (10 years), FCF base (₹12,438 cr FY26).

**What was solved for:** The uniform FCF CAGR across FY27–FY36 that equates modelled EV to observed EV of ₹1,28,498 cr.

**Terminal value note:** At the implied g = 1.7%, terminal value is approximately 43% of modelled EV — well below the 75% dominance threshold. The reverse-DCF result is not terminal-dominated and is relatively robust.

**Secondary implied check — margin:** The solve can also be framed as a margin question. If revenue grows at 5% per annum (consensus ≈ 5.1% FY27 and consistent with single-digit guidance), then for FCF to grow at only 1.7%, the FCF margin must erode from its FY26 level of ~14.8% (₹12,438 cr / ₹83,855 cr). Specifically, at 5% revenue CAGR and 1.7% FCF CAGR, the FCF margin must compress from 14.8% to approximately 12.0% over ten years — a 280-basis-point decline. This is consistent with the market pricing in some margin headwind (commodity costs, Iveco financing drag, powertrain transition capex) rather than continued expansion.

---

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| FCF CAGR of ~1.7% over 10 years — effectively flat real FCF | Historical FCF data exists for only one full year (FY26: ₹12,438 cr; FY25 nine months: ₹5,880 cr). Revenue grew from ~₹66,000–68,000 cr in FY23 to ₹83,855 cr in FY26 — a three-year revenue CAGR of ~7–8% on the carve-out basis. Underlying EBITDA margin expanded from ~7.8% to 12.3% (550 bps) over the same period. FCF clearly grew faster than 1.7% over this window. | Street consensus embeds 5.1% revenue growth for FY27 and +20.5% normalised EPS growth. Earnings sensitivity shows CV volumes can swing ±₹6.57–7.28 EPS in either direction, but the normalised base (₹15.91 EPS, ₹12,438 cr FCF) is high and growing. Management guided "teens" EBITDA margin for FY27 — held, not declining. | Yes — the implied requirement is very conservative. A business that generated ₹12,438 cr FCF in FY26, is net-cash positive (₹13,713 cr company-defined), and is growing revenue at 5–10% per year should produce FCF CAGR well above 1.7% even accounting for the Iveco financing drag and commodity headwinds. |
| FCF margin compression from 14.8% to ~12.0% over 10 years | No multi-year FCF margin history. Underlying EBITDA margin has expanded structurally — 550 bps over three years. The first-ever double-digit EBIT margin was achieved in FY26 (10.2%). | Commodity headwind is confirmed for Q1 FY27 (100 bps impact in Q4 already, "significantly higher" in Q1 FY27). Iveco deal adds ~₹1,286 cr net interest if bridge at 6.5%. But capex guidance is held at 2–4% of revenue — no step-up. Non-cyclical revenue growing at 2.7× cyclical CAGR buffers through-cycle FCF. | Stretch on the downside — a 280-bps FCF margin compression over a decade would require persistent commodity inflation, full Iveco financing drag, AND no structural margin improvement. The base case is that EBITDA margins stay in the teens and FCF margins recover from any short-term commodity compression. |
| Zero years of above-GDP FCF growth implied | Revenue grew at ~7–8% CAGR over FY23–FY26 (above India real GDP of 6.5–7%). FCF growth was substantially faster during this margin expansion period. | Indonesia 70,000-unit export order (FY27 delivery), non-cyclical revenue growing 18.2% YoY in FY26, Fleet Edge surpassing 1 million connected vehicles — all growth vectors are active. | Clear upside to implied — the business has active growth drivers that the 1.7% implied CAGR ignores entirely. Even in a cyclical trough, TMCV's FCF should not permanently shrink below FY26 levels given its net-cash balance sheet and negative working-capital structure. |

**Assessment:** The market's implied expectations are conservative — arguably pricing in a mild, permanent deterioration in TMCV's FCF power. Three factors drive this: (1) the Iveco acquisition overhang (₹41,691 cr consideration pending approval, which if funded by debt will add significant financing cost and uncertainty); (2) the first-year nature of this listed entity (TMCV only listed in November 2025, so the market likely assigns a new-issuance uncertainty discount); and (3) India CV cycle concerns — the industry has historically seen −15% to +20% volume swings, and the market may be placing probability on a cycle turn. Against these concerns, the FY26 FCF of ₹12,438 cr is the highest in the entity's existence, and the balance sheet is net-cash by any definition. The implied 1.7% FCF CAGR is below what the current operating trajectory — 550 bps of margin expansion, negative working capital, accelerating non-cyclical revenues — would suggest is achievable absent the Iveco deal.

---

## 4. Robustness

Terminal growth held at 4.5% throughout. Horizon held at 10 years.

| Discount Rate | Implied FCF CAGR to Justify Price (EV = ₹1,28,498 cr) |
|---|---:|
| WACC 12.0% (−1%) | ~0.5% |
| WACC 13.0% (central) | ~1.7% |
| WACC 14.0% (+1%) | ~3.5% |

**Reading:** Even at the most demanding discount rate tested (14%), the market is pricing in FCF CAGR of only ~3.5% — still materially below nominal GDP growth and well below recent revenue and EBITDA growth rates. The conclusion is stable across the WACC range: the price embeds conservative-to-subdued FCF growth in every scenario. An investor who believes TMCV can grow FCF at 8–10% per annum (consistent with the recent revenue CAGR and management's teens EBITDA guidance) is being offered a substantial implied-expectations cushion, but must weigh it against the Iveco acquisition risk and the newness of the entity.

---

## 5. What's-Priced-In Read

At ₹369.15, the market is pricing in a 10-year FCF CAGR of approximately 1.7% — below India's nominal GDP growth of 10–11% and, in real terms, a mild contraction. That is conservative given TMCV's FY26 FCF of ₹12,438 cr, net-cash balance sheet of ₹13,713 cr (company-defined), and management's guidance for teens EBITDA margins in FY27. The implied expectations are most consistent with the market treating the pending ₹41,691 cr Iveco acquisition as a near-certain drag that will absorb the current cash surplus and then add leverage, effectively resetting the FCF power of the business. If the Iveco deal closes on bad terms or at peak financing costs, the bear-case FCF picture is materially worse than FY26 would suggest; if it closes on reasonable terms with Iveco contributing EBITDA, or if it does not close, the current implied 1.7% growth is well below what the standalone CV business can deliver, and that gap is upside to intrinsic value.

---

*Sources (web-sourced inputs, labeled per MODULE_RULES):*
- *India 10Y G-Sec yield 6.95% as of June 5, 2026: [tradingeconomics.com](https://tradingeconomics.com/india/government-bond-yield) — web-sourced, unverified.*
- *India total ERP 7.08%: Damodaran 2026 Country Risk Premium dataset, [pages.stern.nyu.edu](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html) — web-sourced, unverified (January 2026 data).*
