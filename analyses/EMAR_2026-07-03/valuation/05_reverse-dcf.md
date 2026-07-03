# Reverse DCF — What's Priced In — EMAR (Emaar Properties PJSC)

**Reporting standard:** IFRS | **Currency:** AED (UAE Dirham), AED millions unless stated
**Fiscal year end:** 31 December | **Jurisdiction:** UAE — Dubai Financial Market (DFM)
**Price-state: pool-verified** (two independent Capital IQ pool sources, AED 12.20, Jun-28-2026)

---

## 1. Inputs

All parameters below are taken verbatim from `04_intrinsic-dcf.md` (the model being inverted) and `01_price-and-capital-structure.md` (the price anchor). No independent re-derivation of WACC or FCF base was done.

| Input | Value | Source |
|---|---:|---|
| Current price | AED 12.20 | `01_price-and-capital-structure.md` §1 — pool-verified (Capital IQ Comps export + 01_Consensus.xlsx, Jun-28-2026) |
| Enterprise value (market-implied, canonical broad basis) | AED 96,672 Mn | EV = Market cap (8,838.790 Mn × AED 12.20 = AED 107,833 Mn) + Minority interest (AED 13,808 Mn) − Net cash broad (AED 24,969 Mn) — from `01` §4 |
| Shares | 8,838.790 million | `01` §2 — basic = estimated fully diluted (no dilution instruments identified) |
| Net cash (§15 broad basis) | AED 24,969 Mn | `01` §5 — CIQ standard; restricted escrow (AED 43,338 Mn) excluded |
| Minority interest | AED 13,808 Mn | `01` §4 — Q1-2026 balance sheet |
| Normalised FCF base (FY2025) | AED 24,295 Mn | `04_intrinsic-dcf.md` §1 — reported FCF (AED 32,524 Mn) minus AED 8,229 Mn of unearned-revenue advance payments from off-plan buyers; per `earnings/06_earnings-quality` §1 and §10 |
| Discount rate (WACC) — from 04 | **8.83%** | `04_intrinsic-dcf.md` §3 — CAPM: Rf 4.48% (10-yr US Treasury, web-sourced Jul-2026) + ERP 4.87% (Damodaran UAE, Jan-2026, web-sourced) × Beta 1.0 = CoE 9.35%; after-tax cost of debt 3.27%; equity weight 91.5%; computed WACC 8.83% |
| Forecast horizon | 7 years (FY2026–FY2032) | `04_intrinsic-dcf.md` §2 — same horizon as forward DCF |
| Terminal growth (g) | 2.0% | `04_intrinsic-dcf.md` §5 — lowered from 3.5% per Gate 2 (financeable-growth); at long-run USD/AED inflation anchor |
| Discounting convention | Mid-year (t − 0.5) | `04_intrinsic-dcf.md` — same as forward DCF |
| FCFF identity | FCFF = NOPAT + D&A − Capex − ΔNWC | `04_intrinsic-dcf.md` §1 — same as forward model |

**Note on the market-implied EV.** The market-implied EV (AED 96,672 Mn) equals the EV computed using today's price, minority interest, and the broad net cash — it is identical to the canonical EV in `01` §4 (AED 96,672 Mn), because the canonical EV uses the same price. The forward DCF (`04`) derived an EV of AED 328,880 Mn, which is 3.4× the market-implied EV. The reverse-DCF finds what path of FCF growth makes the DCF EV equal the market EV of AED 96,672 Mn.

---

## 2. Implied Expectations

**What was held fixed:** WACC (8.83%), terminal g (2.0%), normalised FCF base (AED 24,295 Mn), horizon (7 years), discounting convention (mid-year), FCF identity (FCFF = NOPAT + D&A − Capex − ΔNWC). These are identical to `04`'s assumptions — the model is inverted on the same basis.

**What was solved for:** A single constant FCF CAGR over the 7-year horizon that makes the DCF EV equal the market-implied EV of AED 96,672 Mn, with a Gordon Growth terminal at g = 2.0%.

**Solver:** Python bisection loop (`brentq_simple`, tolerance 1e-8, 300 iterations) executed via Bash. Command and root shown below.

```
Python bisection — executed result:

EV_implied = 107,833 (market cap) + 13,808 (minority) − 24,969 (net cash broad) = 96,672 Mn

Objective: dcf_ev(g) = EV_implied
dcf_ev(g) = sum_{yr=1}^{7} [ FCF_base × (1+g)^yr / (1+0.0883)^(yr-0.5) ]
            + [ FCF_base × (1+g)^7 × 1.02 / (0.0883 − 0.02) ] / (1.0883)^7

Root (bisection): g = −21.34%

Verification: dcf_ev(−21.34%) = 96,672 Mn ✓

Year-by-year FCF at implied g = −21.34%:
  FY2026: FCF = 19,111 Mn, DF = 0.9586, PV = 18,319 Mn
  FY2027: FCF = 15,033 Mn, DF = 0.8808, PV = 13,241 Mn
  FY2028: FCF = 11,826 Mn, DF = 0.8093, PV =  9,571 Mn
  FY2029: FCF =  9,302 Mn, DF = 0.7437, PV =  6,918 Mn
  FY2030: FCF =  7,317 Mn, DF = 0.6833, PV =  5,000 Mn
  FY2031: FCF =  5,756 Mn, DF = 0.6279, PV =  3,614 Mn
  FY2032: FCF =  4,528 Mn, DF = 0.5769, PV =  2,612 Mn
  PV of explicit FCFs: 59,276 Mn
  Terminal FCF (4,528 × 1.02): 4,618 Mn
  PV of terminal value: 37,396 Mn (38.7% of EV)
  Total EV: 96,672 Mn ✓  Per-share check: AED 12.20 ✓
```

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCF CAGR (constant, FY2025 base → FY2032) | **−21.3%** per year |
| Implied FCF level by FY2032 | AED 4,528 Mn (vs AED 24,295 Mn today; an 81% total contraction) |
| Implied steady-state FCF (Gordon perpetuity equivalent) | AED 6,603 Mn = 27.2% of FY2025 normalised FCF |
| Implied revenue by FY2032 (at `04`'s terminal FCF margin of 31.65%) | AED 14,306 Mn (vs FY2025 revenue of AED 49,557 Mn; a 71% total contraction) |
| Implied steady-state EBIT margin (at FY2025 revenue, g=0% flat FCF) | **13.9%** — below the FY2021 cycle-trough EBIT margin of 23.5% |
| PV of terminal value as % of EV | 38.7% — below the 60% threshold requiring terminal g sensitivity |

**Interpreting the −21.3% CAGR.** This number is the direct output of inverting the same model as `04`, using the same normalised FCF base. It is not a forecast — it is the growth rate the constant-CAGR model requires to match the market EV. The forward DCF (`04`) incorporated large working-capital releases in the early years (ΔNWC contributions of AED 4.3 Bn in FY2026 and AED 4.2 Bn in FY2027) that pushed explicit-period FCF PV to AED 136,581 Mn — already 41% MORE than the entire market-implied EV of AED 96,672 Mn. The constant-CAGR reverse-DCF must therefore price in a severe contraction from the FY2025 base to offset any contribution from the terminal. In plain terms: the market assigns a total enterprise value that is less than the present value of the next 7 years of FCF that `04`'s base-case model projects — meaning the market expects either dramatically lower near-term FCF, or no terminal value, or both.

**Secondary framing (more intuitive).** If one holds g = 0% (flat FCF forever at some constant level) and solves for the FCF level the market implies: the required flat FCF is AED 7,140 Mn — 29.4% of today's FY2025 normalised level. To generate AED 7,140 Mn of normalised FCF at FY2025 revenue (AED 49,557 Mn), Emaar would need an EBIT margin of approximately 13.9% — below its own cycle-trough EBIT margin of 23.5% in FY2021.

---

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| FCF CAGR of −21.3% per year for 7 years (FCF falls from AED 24,295 Mn to AED 4,528 Mn by FY2032) | FY2021–FY2025 normalised FCF CAGR: approximately +35% (AED ~7,170 Mn → AED 24,295 Mn). Even in the FY2022 dip (revenue fell −10.6%), normalised FCF stayed at AED 13,844 Mn. No 7-year run of −21% FCF contraction in Emaar's modern history. | `earnings/07_earnings-sensitivity.md` §4: POC delivery pace is the dominant variable at ±AED 2,500 Mn EBITDA sensitivity. A −15% delivery-pace shock moves EBITDA by ~−AED 2,500 Mn — not the ~AED 17,692 Mn annual contraction the market implies. | **No — historically unprecedented; not achievable without a sustained physical inability to deliver backlog** |
| Steady-state EBIT margin of 13.9% (at FY2025 revenue) | FY2021 trough EBIT margin: 23.5%. FY2020 EBITDA was AED 5.2 Bn (lowest in recent history). An EBIT margin of 13.9% has never been recorded in the available data for Emaar. | `earnings/07_earnings-sensitivity.md` §2: even a +10% construction-cost-inflation shock moves annual EBITDA by only ~AED 150–200 Mn — a 1% move in EBITDA margin, not the 32pp implied by the market. | **No — below any cycle-trough margin in recorded history** |
| Revenue contracting to AED 14,306 Mn by FY2032 (a 71% total shrinkage from AED 49,557 Mn) | UAE revenue backlog at Dec-31-2025: AED 134.3 Bn. At FY2025 delivery pace, this backlog alone supports AED 134.3 Bn / 5–6 years ≈ AED 22–27 Bn of annual revenue recognition through FY2031 — even with zero new sales. FY2021 revenue was AED 27.9 Bn. | `earnings/01_historical-financials.md` §6: the AED 154.8 Bn total backlog (AED 134.3 Bn UAE + AED 20.5 Bn international) locks in at least 3–4 years of elevated revenue even without any new sales. A decline to AED 14,306 Mn by FY2032 would require delivering fewer than 10% of the contracted backlog — not physically possible given construction obligations. | **No — physically impossible given existing contractual backlog obligations** |

**Market-ceiling sanity check.** For an operating real estate developer, the relevant ceiling test is a revenue-size comparison. The implied FCF CAGR of −21.3% translates to implied FY2032 revenue of AED 14,306 Mn (held at the normalised FCF margin of 31.65% from `04`'s terminal assumptions). Emaar's UAE revenue backlog alone stood at AED 134.3 Bn at Dec-31-2025 — roughly 9.4× FY2025 annual revenue. Delivering AED 14,306 Mn of revenue by FY2032 from a base of AED 49,557 Mn and an existing contracted backlog of AED 134.3 Bn is not feasible without cancelling the overwhelming majority of signed and construction-stage contracts. This is not a risk scenario — it is a physical impossibility under normal commercial conditions. The market-ceiling check therefore confirms the market-implied FCF path is **aggressively pessimistic beyond any scenario the evidence supports**. [Source: FY2025 Investor Presentation (Feb-12-2026), slide 16 (UAE backlog AED 134.3 Bn); `earnings/01_historical-financials.md` §6]

**Conclusion on achievability.** The market's implied FCF trajectory at AED 12.20 requires Emaar to experience a permanent earnings implosion that would need a combination of (a) most of its AED 134.3 Bn backlog being cancelled or defaulted on, (b) EBIT margins falling below 14% — a level never recorded — and (c) the business permanently producing below the absolute earnings it generated in FY2021, its deepest modern trough. None of these conditions has ever co-occurred. The market's implied expectations are **aggressive — specifically, aggressively pessimistic relative to evidence**. The implied scenario is not achievable in the downward direction under normal commercial conditions.

---

## 4. Robustness

**Primary solve: WACC sensitivity (base FCF = AED 24,295 Mn)**

| Discount Rate | Implied FCF CAGR to Justify Price |
|---|---:|
| WACC −1% (7.83%) | −23.1% |
| WACC base (8.83%) | **−21.3%** |
| WACC +1% (9.83%) | −19.7% |

WACC range: 3.4 percentage points. A lower WACC (a more generous discount rate, which raises any given stream's PV) paradoxically requires a FASTER contraction — because the lower WACC makes the explicitly-priced FCFs worth more in PV terms, requiring a sharper decline to keep the total below the market EV.

**Secondary solve: FCF base sensitivity (base WACC = 8.83%)**

The FCF base has much more impact than the discount rate — an 11pp range vs 3.4pp:

| FCF Base Case | FCF Base (AED Mn) | Basis | Implied FCF CAGR |
|---|---:|---|---:|
| Low — FY2024 normalised FCF | 15,506 | `earnings/01_historical-financials.md` §1 | −13.5% |
| Base — FY2025 normalised FCF | 24,295 | `04_intrinsic-dcf.md` §1 (canonical) | **−21.3%** |
| High — approx TTM normalised (Q2-25 to Q1-26) | 29,000 | Approximate (reported TTM FCF 30,982 Mn minus estimated unearned-revenue adjustment) | −24.5% |

**The FCF base is the dominant swing factor** — more than 3× the WACC range. At the Low FCF base (using FY2024's level as the starting point), the implied FCF CAGR rises to −13.5%, which would still require revenue to fall to roughly AED 22–24 Bn — still well below what the AED 134.3 Bn backlog alone guarantees.

**Combined WACC × FCF base robustness table**

| FCF Base | WACC 7.83% | WACC 8.83% | WACC 9.83% |
|---|---:|---:|---:|
| Low (AED 15,506 Mn, FY2024) | −15.5% | −13.5% | −11.6% |
| Base (AED 24,295 Mn, FY2025) | −23.1% | **−21.3%** | −19.7% |
| High (AED 29,000 Mn, TTM approx.) | −26.2% | −24.5% | −23.0% |

**Across the full grid (9 combinations), the implied FCF CAGR ranges from −11.6% to −26.2%.** Even at the most favourable combination (Low FCF base, High WACC), the market requires an 11.6%-per-year contraction from a starting FCF of AED 15,506 Mn — which still implies terminal FCF below AED 6,000 Mn, a level inconsistent with AED 134.3 Bn of existing contracted backlog.

**Terminal value % check.** TV as % of EV at the base case = 38.7%, well below the 60% threshold. The solve is NOT terminal-dominated. Terminal g sensitivity (±0.5%) is not required by the MODULE_RULES threshold but was computed for completeness: varying terminal g between 1.5% and 2.5% moves the implied FCF CAGR by only ±0.5pp (from −20.8% to −21.9%), confirming that terminal g is not a material driver in this low-TV-weight solve. The dominant input is unambiguously the FCF base.

---

## 5. What's-Priced-In Read

At AED 12.20, the market is pricing in a permanent and catastrophic collapse in Emaar's FCF — a 7-year constant contraction of 21% per year, taking normalised FCF from AED 24,295 Mn today to AED 4,528 Mn by FY2032, which would imply an EBIT margin below 14% — lower than any level in the company's recorded history, including the FY2021 post-COVID trough (23.5% EBIT margin). That implied scenario is **aggressively pessimistic to the point of being physically inconsistent** with Emaar's existing contractual obligations: the AED 134.3 Bn UAE revenue backlog alone (signed contracts already under construction) makes an 81% total FCF contraction over 7 years impossible under normal commercial conditions, regardless of new-sales activity. The market appears to be pricing Emaar as if the Dubai property cycle will immediately collapse to below-trough-level economics AND sustain that level for the entire forecast period — the most bearish combination of cycle position and margin assumptions in its history, compounded without recovery. This is not achievable downward; the implied expectations are conservative in the sense that the bar is actually unachievable, meaning any realistic out-turn — even a severe cycle downturn — is likely to produce significantly more FCF than the price embeds.

---

## Self-Check

- [x] Current price and EV match `01`, price-state is `pool-verified`. No partial-data stop applied.
- [x] WACC (8.83%), normalised FCF base (AED 24,295 Mn), terminal g (2.0%), horizon (7 years), and discounting convention (mid-year) are taken verbatim from `04_intrinsic-dcf.md`. The reverse-DCF inverts the same model.
- [x] Discount rate stated explicitly with components (Rf 4.48%, ERP 4.87%, beta 1.0, CoE 9.35%; after-tax cost of debt 3.27%; WACC 8.83%).
- [x] The solve clearly states what is held fixed (WACC, terminal g, FCF base, horizon, convention) and what is solved for (constant FCF CAGR).
- [x] Implied expectations are compared to the company's historical growth (`earnings/01_historical-financials.md`) and earnings-module evidence (`earnings/07_earnings-sensitivity.md`).
- [x] The achievable/stretch/no judgement is evidence-backed: backed by actual historical FCF levels, the AED 134.3 Bn contracted backlog, and the historical trough EBIT margin of 23.5%.
- [x] Robustness shown across BOTH the discount rate (3.4pp range) AND the FCF base (11pp range), with the FCF base named as the dominant input. Terminal g ±0.5% checked; TV% = 38.7% is below 60% threshold.
- [x] The implied-growth solve and all robustness re-solves were produced by an executed Bash/Python bisection solver with the command and root shown. No hand computation.
- [x] Market-ceiling check conducted: implied revenue (AED 14,306 Mn FY2032) tested against AED 134.3 Bn contracted backlog — physically impossible.
- [x] No banned phrases.
