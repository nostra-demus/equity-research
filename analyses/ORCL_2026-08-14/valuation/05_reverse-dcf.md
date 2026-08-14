# Reverse DCF — What's Priced In — ORCL

Reporting standard: US GAAP. Currency: USD (millions, except per-share). Fiscal year end: May 31 (FY2026 = year ended May-31-2026).

**Price-state check.** `01_price-and-capital-structure.md` records price-state **`pool-verified`** ($153.94, Aug-13-2026, delayed NYSE quote, Capital IQ pool export, corroborated against the prior-day close and the vendor's own day-change arithmetic). This agent can run.

**Method note.** This report inverts the SAME model as `04_intrinsic-dcf.md` — same WACC (9.96%), same 8-year explicit forecast structure (FY27–FY34), same terminal growth rate (3.5% nominal), same mid-year discounting convention, same net debt/minority/preferred bridge. It was rebuilt line-for-line in Python and cross-checked against 04's own printed outputs (EV, PV of explicit FCFs, PV of terminal value, FY34 revenue all reconcile to 04's figures within rounding) before being used to solve backwards. Where 04's own model structure makes a lever ill-posed (raw FCF CAGR — see §2), that is stated explicitly rather than forced.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $153.94 (Aug-13-2026, pool-verified) | `01_price-and-capital-structure.md` §1, §7 |
| Enterprise value (target, canonical lease-inclusive) | $584,464.2M | `01_price-and-capital-structure.md` §4, §7 |
| Net debt (strict) / Minority / Preferred | $136,143M / $548M / $4,954M | `01_price-and-capital-structure.md` §5, §7 (same bridge 04 uses) |
| FCF base, FY2026 (reported / normalized) | −$23,686M / −$28,328M | `04_intrinsic-dcf.md` §1 — negative, mid-AI-capex-supercycle (capex 82.6% of revenue); NOT usable as a growing-perpetuity starting point (see §2) |
| NOPAT base, FY2026 (well-posed analog) | $16,505M (GAAP EBIT $20,606M × (1 − 19.9% normalized tax)) | `04_intrinsic-dcf.md` §1 |
| Discount rate (WACC) used | **9.96%** (9.9594%) — CAPM k_e 12.25% (rf 4.65% + β1.72 × ERP 4.42%), after-tax k_d 3.99%, k_p 6.50%, weights 72.0%/27.2%/0.8% E/D/P | `04_intrinsic-dcf.md` §3, taken verbatim (not re-derived) |
| Terminal growth (g) | 3.5% nominal | `04_intrinsic-dcf.md` §5a, taken verbatim |
| Forecast horizon | 8 years (FY2027–FY2034) | `04_intrinsic-dcf.md` §2, taken verbatim |
| Discounting convention | Mid-year (t − 0.5) | `04_intrinsic-dcf.md` §5, taken verbatim |
| Terminal-year construction | Financeable-growth-consistent: terminal ROIC = WACC (no persistent excess return), reinvestment rate = g/ROIC | `04_intrinsic-dcf.md` §5a, taken verbatim |

**Executed replication check (Python):** rebuilding 04's exact revenue/margin/capex/working-capital assumptions at the base-case growth path reproduces EV = $342,472M, PV(explicit) = $66,163M, PV(TV) = $276,309M, FY34 revenue = $205,014M — all matching 04's printed figures to the dollar (rounding aside). This confirms the model was replicated correctly before inverting it.

## 2. Implied Expectations

**What is held fixed vs solved for.** WACC (9.96%), the 8-year forecast structure (margin %, gross margin %, D&A %, DSO/DPO), the terminal margin (33.0%), terminal g (3.5%), and the terminal ROIC=WACC construction are all held fixed at 04's values. The lever solved for is a uniform scaling factor **k** applied to 04's own year-by-year revenue-growth path (FY27–FY34: 33.6%, 24.0%, 18.0%, 14.0%, 11.0%, 9.0%, 7.0%, 5.5%, each × k) — i.e., "how much faster than 04's base case does revenue have to compound, holding everything else in the model the same, to make the model's own EV equal today's $584,464.2M EV." This directly answers "what growth is priced in" using 04's own cost structure, not an independently invented one.

| What the Price Implies | Solved Value | Note |
|---|---:|---|
| Implied FCF CAGR over the horizon | **Not well-defined** | FY2027–FY2028 FCF is negative in both the base case and every solved scenario (the guided AI-capex ramp swamps cash generation in the first two explicit years regardless of growth rate) — a CAGR on a series that changes sign has no meaningful value. Revenue and NOPAT (below) are the well-posed analogs. |
| Implied revenue growth-path scaling factor (k) | **1.53×** 04's own growth path | Solved via `scipy.optimize.brentq`, bracketed [1,2], root at k=1.5270 |
| Implied Revenue CAGR, FY2026→FY2034 (8yr) | **22.6%** | vs 04's own (deliberately conservative) base case of 14.9% over the same 8 years |
| Implied FY2027 revenue growth (the very next print) | **+51.3%** YoY (revenue ≈ $101.9B) | vs management's own FY2027 **guidance** of +33.6% (≈$90.0B) — this is the single nearest-term, most falsifiable number in this report |
| Implied NOPAT CAGR, FY2026→FY2034 (8yr) | **24.9%** | NOPAT base $16,505M → implied FY34 NOPAT $97,679M |
| Implied FY2030 revenue (under the solve) | **$215.5B** | For reference: management's own most-optimistic disclosed long-term outlook (31% revenue CAGR, FY25–FY30, Q4 FY26 investor deck slide 15, per `04_intrinsic-dcf.md` §2) implies FY2030 revenue of ≈$221.4B — the price-implied path sits just below that guide's implied endpoint |
| Implied steady-state (terminal) EBIT margin, holding g=3.5% and the base explicit path (k=1) fixed | **61.9%** | Solved via `brentq`, bracketed [0.55, 0.62]; vs 04's own terminal assumption of 33.0% and vs the highest margin in Oracle's own peer set (Microsoft 46.8% LTM EBIT margin, `business-model/09_moat.md` §3) — this margin has no peer precedent |
| Diagnostic: max EV achievable at g=3.5%, terminal margin=33%, k=1, terminal ROIC → ∞ (zero net reinvestment, the best case the model geometry allows) | **$492.2B EV**, a $92.3B shortfall vs the $584.5B target | Even the theoretical upper bound of this specific terminal construction (no reinvestment at all in perpetuity, which is not economically realistic for a data-center business) falls short of today's price — see §3 |

**Executed solver (Python, `scipy.optimize.brentq`):**
```
def build(k, WACC, g_term=0.035, term_margin=0.33, roic_term=None):
    # replicates 04's exact revenue/margin/capex/WC build, growth[i] = base_growth[i]*k
    ...
def f_k(k): return build(k, WACC_base)[0] - 584464.2
k_sol = brentq(f_k, 1.0, 2.0)   ->  k_sol = 1.527023937424579
EV_check = build(k_sol, WACC_base)[0]  ->  584464.2000000776   (matches target)

def f_margin(m): return build(1.0, WACC_base, term_margin=m)[0] - 584464.2
m_sol = brentq(f_margin, 0.55, 0.62)  ->  m_sol = 0.6190151867371815
```

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| FY2027 revenue +51.3% YoY | FY2026 actual +17.3% (highest in 5 years); 4yr CAGR FY22–26 = 12.2% | Management's own FY2027 guidance is +33.6% — already Oracle's most aggressive guide in years, driven by OCI's Q4 FY26 +93% YoY. The implied +51.3% requires beating that fresh guidance by ~18 points in the very next print | **No / Stretch** — beating a guide issued weeks ago by that much has no precedent in Oracle's disclosed history |
| Revenue CAGR 22.6%, FY26–FY34 (8yr) | Revenue CAGR FY22–26 (4yr) = 12.2%; EBIT (CIQ) CAGR FY22–26 = 9.0% | `earnings/07_earnings-sensitivity.md` ranks AI-infrastructure customer concentration as the #1 sensitivity, with a modeled **downside** of −$6,937M EBITDA (23% of FY26 EBITDA) and "no disclosed upside mirror of comparable size" (§6) — the earnings module's own asymmetry runs against, not for, sustaining this pace for 8 straight years | **Stretch, leaning No** |
| Terminal EBIT margin 61.9% (holding g=3.5%, ROIC=WACC) | Oracle's own 5-year margin range: 27.4% (FY23 trough) to 33.2% (FY26, CIQ EBIT basis) | No peer in `business-model/09_moat.md` §3 comes close: Microsoft 46.8%, AWS segment 35.4–39.4%, SAP 28.8% — 61.9% exceeds the best margin of any named peer by ~15 points | **No** — no evidence basis anywhere in the pool |
| FY2030 revenue $215.5B (vs management's own 31%-CAGR guide-implied $221.4B) | Management's own guide has already been undershot once: a smooth 31% CAGR from FY2025 ($57,399M) implies FY2026 revenue of ≈$75.2B; actual FY2026 was $67.4B — a ~10% miss against the guide's own implied first-year path | `04_intrinsic-dcf.md` §2 explicitly declined to adopt management's 31% guide as its own base case, citing `business-model/09_moat.md`'s "eroding" moat trajectory (ROIC below WACC for 4 straight years) and `07_business-quality.md`'s 33/100 disruption-risk score | **Stretch** — the one lens where price is closest to something management has actually said, but that guide itself has no delivery track record and was missed in year one |

**Market-ceiling sanity check (revenue-size test, one-directional).** ORCL is an operating business, so this test converts the implied revenue trajectory into an addressable-market read. Splitting the implied FY2030 revenue ($215.5B) into a non-OCI piece (grown at an illustrative 7%/yr from the FY2026 non-OCI base of $49,256M → ≈$64.6B by FY2030 — Inference, not from filings, a simplifying proxy since the pool does not carry a segment-level DCF) leaves an implied OCI/cloud-infrastructure revenue requirement of **≈$150.9B by FY2030**. The global cloud-infrastructure market was ≈$129B **per quarter** (≈$516B/year) in 2026, with the "Big Three" (AWS 28%, Azure 21%, Google Cloud 14%) holding 63% and Oracle holding ≈3% [`business-model/08_competitive-map.md` §3, Web: Synergy Research Group, 2026 — unverified, dated, Level 2]. Growing that market at an aggressive 20%/year for 4 years puts it at ≈$1,070B by FY2030; at a more conservative 15%/year, ≈$902B. Oracle's implied $150.9B of infrastructure revenue would then require a **≈14–17% global cloud-infrastructure market share by FY2030**, up from ≈3% today — a roughly **5–6x share increase in four years**. No hyperscaler has built a comparable share that fast: AWS and Azure each took the better part of a decade or more to reach their current 21–28% shares. This is an illustrative, approximate check (Level 2/3 evidence, segment split is this agent's own proxy, clearly labeled) — it can only make the growth requirement look harder, and it does: it is a **second, independent kill signal** (alongside the 61.9% implied terminal margin) pointing toward "aggressive/unachievable," not a reason to lift the read.

**Read.** Every lens examined — the near-term FY2027 print, the 8-year revenue CAGR, the terminal margin, and the market-share ceiling — points the same direction. The single lens where the price comes closest to something evidenced (management's own 31%-CAGR long-term guide) is itself a guide with zero years of delivery track record, already missed in its own first year, and built on top of a moat the business-model module scores as **eroding** (`business-model/09_moat.md` §5: "Return on capital vs. cost of capital has moved the wrong way for four consecutive years"). The market is pricing in an expectation set with no historical precedent in Oracle's own results and no peer precedent in the industry.

## 4. Robustness

Since terminal value is 80.7% of EV in 04's base case (well above the ~60% trigger), robustness is shown across WACC, the model's true "base" anchor (the FY2027 guided revenue level, since raw FY2026 FCF does not itself feed the multi-year build — see §1), and terminal g.

| Discount Rate | Implied Revenue CAGR (FY26–34) to Justify Price | Implied FY27 growth |
|---|---:|---:|
| WACC −1% (8.96%) | 20.3% | +46.0% |
| WACC (9.96%) | **22.6%** | +51.3% |
| WACC +1% (10.96%) | 24.8% | +56.4% |

| FY2027 Revenue Anchor (the model's real "base") | Required FY2028–34 CAGR | Overall FY26–34 CAGR |
|---|---:|---:|
| Guidance −5% ($85,490M) | 21.9% | 22.5% |
| Guidance (base, $89,989M) | 21.0% | 22.5% |
| Guidance +5% ($94,488M) | 20.2% | 22.6% |

| Terminal g (TV = 80.7% of EV in 04's base case — the ±0.5% check is required) | Implied Revenue CAGR (FY26–34) |
|---|---:|
| g − 0.5% (3.0%) | 22.6% |
| g (3.5%) | 22.6% |
| g + 0.5% (4.0%) | 22.5% |

**Executed robustness solves (Python, same `build()`/`brentq` machinery as §2):** WACC swept at −1%/base/+1% (roots 1.3686 / 1.5270 / 1.6779 on k); FY27 anchor swept ±5% with `build2()` solving k_rest on FY28–34 only; terminal g swept ±0.5% with `f_k_g()`. All four sweeps bracket and solve cleanly (no NM cells).

**Which input dominates.** **WACC is the dominant lever here — the opposite of the more common reverse-DCF pattern.** A 1-point WACC move shifts the implied revenue CAGR by ≈2.2–2.5 points (20.3%→24.8% across the ±1% range, a 4.5-point swing), while a ±5% swing in the FY2027 anchor (the closest analog to a "FCF base" stress for this specific model, since 04's forecast starts from a company-guided FY27 revenue figure, not from FY26 FCF) moves the required subsequent-year CAGR by only ≈1.7 points. Terminal g barely moves the answer at all (≤0.1 point across a full 1-point g range) — this is because 04's own financeable-growth constraint (terminal ROIC = WACC) makes the terminal-value build nearly linear in growth rather than hyperbolic in (WACC−g); 04's §7 sensitivity grid flags the same muting effect. The practical read: this reverse-DCF's "what's priced in" number is most sensitive to how the market is pricing Oracle's risk (WACC/beta), a little sensitive to how the FY27 print actually lands, and almost insensitive to the assumed long-run growth rate — because 04's own terminal construction already strips out most of the g-driven value creation by tying reinvestment to growth at zero excess return.

## 5. What's-Priced-In Read

At $153.94, the market is pricing in roughly a **51% FY2027 revenue beat against Oracle's own just-issued guidance**, sustained into a **22.6% revenue CAGR through FY2034** — a pace 7.6 points above 04's own already-conservative base case (14.9%) and, on the standard Gordon/financeable-growth terminal lens, requiring a **~62% terminal EBIT margin with no peer precedent** (vs. Microsoft's own best-in-class 46.8%). Even the model's theoretical best case (zero net reinvestment in perpetuity) falls $92.3B short of today's EV, and an independent market-share check finds the implied cloud-infrastructure revenue would require Oracle to hold a global market share (≈14–17%) that no hyperscaler has built this fast. This is **aggressive, bordering on unachievable** on the DCF's own terms — the one place it comes close to being merely "very aggressive" rather than "unachievable" is against management's own single most-optimistic long-term guide, a guide with zero years of delivery history that was already missed in year one, sitting on top of a moat `business-model/09_moat.md` independently scores as eroding. If Oracle's FY2027 print (due within the fiscal year ending May-2027) comes in near the guided +33.6% rather than the price-implied +51.3%, that is a direct, near-term falsification of what today's price already assumes.
