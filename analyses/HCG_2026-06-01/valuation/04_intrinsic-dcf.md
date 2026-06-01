# Intrinsic DCF — HCG

**Company:** HealthCare Global Enterprises Limited (NSE: HCG, BSE: 539787) — pan-India, single-segment oncology hospital network.
**Business type (from `00_valuation-data-triage`):** Operating company (Health Care Facilities). Per the Business-Type Method Map this is a **FCFF DCF + reverse-DCF** name; the EV bridge is value-relevant, not informational. Demand is non-cyclical (oncology), so the Cyclicality Gate's mid-cycle normalization is NOT required — the FY26 base is a representative operating year, not a peak/trough (`business-model/07_business-quality.md` cyclicality 72/100; `business-model/10_external-dependency.md` "Partly externally driven," consumer cycle Mid).
**Reporting currency:** INR (₹). All amounts in ₹ million (₹ Mn) unless per-share. FY ends 31 March; FY26 = year ended 31 Mar 2026; FY27 = year ending 31 Mar 2027.
**Date:** 2026-06-01.

> **Anchor numbers (from `01_price-and-capital-structure.md`, used verbatim):** Price **₹646.15** (NSE last close, ~late-May 2026 pool snapshot); market-cap shares **149.30M**; per-share fair-value shares **151.79M** (fully diluted, TSM); market cap **₹96,461.1M**; net debt **₹11,944.4M** (total debt − cash, incl. Ind AS 116 leases; CLAUDE.md default); minority interest **₹782.4M**; preferred **₹0**; **EV ₹109,187.9M**. Net debt ex-lease (company-defined) ₹3,387M is shown as a memo where it changes the bridge materially.
>
> **Cross-module inputs used (all present and consumed, not re-derived):** `earnings/01_historical-financials.md` (FCF/EBIT/capex/ΔWC base), `earnings/04_guidance-consensus.md` + the CIQ EstimatesReport.xls (FY27–FY29 consensus revenue/EBIT/D&A/capex/tax path), `earnings/03_margin-drivers.md` (margin path and the COGS-vs-operating-leverage tension), `earnings/07_earnings-sensitivity.md` (assumption ranges → sensitivity grid), `business-model/07_business-quality.md` + `business-model/09_moat.md` (ROIC ≈ 4.5–5.0% vs cost of capital → terminal ROIC discipline), `business-model/10_external-dependency.md` (cyclicality → terminal-growth choice).

---

## 0. Headline (read this first)

This DCF produces a **wide, method-dependent range — roughly ₹140 to ₹600 per share — that sits well below the ₹646.15 price on cash flows but reaches it only on a persistent rich exit multiple.** The reason is structural, not a modeling artifact: HCG earns a return on capital of ~4.5–5.0% against a WACC of ~10.7% (`business-model/09_moat.md` §3), so each rupee it reinvests to grow destroys value in present-value terms. When the terminal value is forced to be *financeable* (reinvestment actually funds the growth at a realistic terminal ROIC), the Gordon-growth DCF collapses to **≈₹90–₹190/share**. When the terminal value is instead set by an **exit EV/EBITDA multiple** in HCG's own/peer trading range (15–19x), it lands at **≈₹480–₹770/share**. The two methods disagree by far more than 40%, and that disagreement is the finding. Confidence is capped (see §8).

---

## 1. FCF Base & Normalizations

Base year **FY26** (year ended 31 Mar 2026). FY26 is sourced from the board-approved audited results deck (19 May 2026) + the CIQ "Press Release" column, not the full statutory FY26 statements (not in pool) — `earnings/01` data limitation; carried here. Reporting currency INR ₹ Mn.

FCF is shown on two definitions, kept separate per CLAUDE.md §15:
- **Levered FCF = CFO − total capex** (the disclosed "free cash flow" definition).
- **FCFF (unlevered) = NOPAT + D&A − capex − ΔNWC** — the definition used to drive this DCF (FCFF identity gate, MODULE_RULES). The two are NOT mixed.

| Item | Base-Year Value (FY26) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue (ops + govt grant) | 25,454.1 | None | `earnings/01` §1; Q4&FY26 deck p.20 |
| Reported EBIT (operating, pre other-income) | 2,466 | None (deck EBIT incl. other income coincides at 2,466 for FY26) | `earnings/01` §1; deck p.19/20 |
| D&A | 2,441.7 | None | CIQ Financials.xls Cash Flow FY26; deck p.19 |
| Capex (PP&E acquisition) | 2,885 | Used the earnings-module PP&E figure (₹2,885M). CIQ Cash Flow line shows ₹2,921M (incl. ~₹36M classification diff) — immaterial, flagged | `earnings/01` §1 (2,885); CIQ Cash Flow (2,921) |
| ΔNet working capital (CIQ "Change in NWC") | +460.9 | None (a use of cash; receivables-led) | CIQ Financials.xls Cash Flow FY26 |
| Effective tax rate (FY26 reported) | 15.4% | **Normalized to 25.17%** for FCFF (FY26 effective rate was depressed by the ₹319M goodwill impairment + ₹127M labour-code exceptional; India marginal corporate rate ≈25.17% — *analyst assumption*) | CIQ Financials.xls Ratios (15.4%); rate basis `earnings/07` §intro |
| CFO | 3,471.0 | None | `earnings/01` §1; deck p.22 |
| **Levered FCF (CFO − capex)** | **586** | None | derived (3,471 − 2,885); ties `earnings/01` §1 |
| **FCFF (NOPAT@25.17% + D&A − capex − ΔNWC)** | **≈ +941** | normalized tax; pre-financing | derived: 2,466×0.7483 + 2,441.7 − 2,885 − 460.9 ≈ 941 |

**Why the base FCF is thin and not the right anchor for value.** FY26 FCFF is barely positive (~₹0.9bn) and levered FCF is only ₹586M (0.61% FCF yield on market cap; `valuation/02` §1) — because capex (₹2,885M) ran ~1.2x D&A (₹2,442M) during the Nagpur/Vizag/North-Bangalore build-out, and EBIT margin is only 9.7%. A DCF off a single thin base year would understate value if the build-out is genuinely pre-productive. I therefore **do not capitalize the FY26 base**; I forecast the consensus inflection explicitly (§2, §4) and let the model's tension surface in the terminal value (§5), which is where the ROIC-vs-WACC problem actually bites.

---

## 2. Forecast Assumptions

Horizon: **5 explicit years (FY27–FY31)**. FY27–FY29 are taken from CIQ consensus (the EstimatesReport.xls fiscal-year columns); FY30–FY31 are my own taper of that path toward a normalized state. Every cell is labelled.

| Assumption | FY27 | FY28 | FY29 | FY30 | FY31 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---|
| Revenue (₹ Mn) | 29,106 | 33,354 | 38,891 | 43,557 | 47,913 | — | FY27–FY29 **consensus** (CIQ EstimatesReport, 9–10 analysts); FY30–FY31 **analyst** |
| Revenue growth % | +14.4% | +14.6% | +16.6% | +12.0% | +10.0% | 5.0% | FY27–FY29 consensus-implied; FY30–FY31 **analyst taper** toward mgmt's "~15%" guide decaying; terminal **analyst** |
| EBIT margin % | 10.8% | 12.4% | 12.8% | 13.0% | 13.0% | 13.0% | FY27–FY29 **consensus** (EBIT/revenue); FY30–FY31 **analyst** (hold ~13%, ~peer-25th-pctile, below 16.8% peer median) |
| Tax rate % | 22.3% | 23.2% | 20.0% | 25.17% | 25.17% | 25.17% | FY27–FY29 **consensus** effective rate; FY30+ **analyst** (India marginal rate) |
| D&A (% of revenue) | 9.1% | 8.6% | 8.5% | 8.5% | 8.5% | — | FY27–FY29 **consensus** (D&A line); FY30–FY31 **analyst** (hold 8.5%) |
| Capex (% of revenue) | 11.2% | 9.2% | 10.6% | 9.5% | 9.0% | (set by terminal reinvestment, §5) | FY27–FY29 **consensus** capex line; FY30–FY31 **analyst** taper toward maintenance+modest growth |
| Capex (₹ Mn) | 3,259 | 3,065 | 4,118 | 4,138 | 4,312 | — | as above |
| Δ Working capital (₹ Mn, use of cash) | 37 | 42 | 55 | 47 | 44 | grows with NOPAT | **analyst**: ~1.0% of incremental revenue (hospital receivables grow with revenue; `earnings/03` notes ECL allowance ₹807.9M and slow payor cycle) |

**Read on the consensus path (required base-rate check).** Consensus embeds a sharp profitability inflection: EBIT margin 9.7% (FY26) → 10.8% → 12.4% → 12.8% (FY29), and FCF rising from ₹550M (FY26) to ₹1,808M (FY27) to ₹2,884M (FY28) (CIQ EstimatesReport, Free Cash Flow line). This is consistent with management's qualitative guide (~15% revenue, ~+100 bps/yr EBITDA margin, "20%+ ROCE in 5 years," net-debt ceiling 2.5x — `earnings/04` §2) and with the cohort-migration thesis (14 ramping centres at 18% centre-EBITDA climbing toward the 26%/27%-ROCE mature bucket — `earnings/03` §6, `business-model/07` §4). **But it is not yet earned:** HCG has missed normalized-EPS consensus in three of the last four fiscal years, FY27 EPS-N has been cut −19% over six months (`earnings/04` §4, §6), and group ROIC has sat at 4.5–5.0% for six years without crossing its cost of capital (`business-model/09` §3). I keep the consensus operating path for FY27–FY29 (it is the disclosed Street base) but (a) taper margins to a sub-peer ~13% rather than the peer-median ~16.8% in FY30–FY31, and (b) let the terminal value enforce ROIC discipline (§5), because the whole valuation turns on whether this inflection is real and durable.

---

## 3. Discount Rate (WACC)

WACC inputs are **not in the data pool** (confirmed: no beta/cost-of-capital field in CIQ Financials.xls). Risk-free, ERP and beta are **web-sourced and labelled unverified**; capital weights and cost of debt are pool/filing-grade.

| Component | Value | Source |
|---|---:|---|
| Risk-free rate (India 10Y G-sec) | 7.00% | Web: India 10Y G-sec ~7.0% late-May 2026 (tradingeconomics), 2026-05 (indicative, unverified) |
| Equity-risk premium (India, total) | 7.08% | Web: Damodaran "Country Risk Premiums," Jan-2026 update (mature-market ERP 4.23% + India CRP 2.85%) (unverified) |
| Unlevered beta (Hospitals/Healthcare Facilities, global) | 0.56 | Web: Damodaran Global betas, Jan-2026 (249 firms; D/E 46.6%) (unverified) |
| Relevered beta (to HCG D/E 0.180, tax 25.17%) | 0.635 | Calc: 0.56 × [1 + (1−0.2517) × 0.180] |
| **Cost of equity (Ke)** | **11.50%** | 7.00% + 0.635 × 7.08% |
| Pre-tax cost of debt | 8.50% | HCG avg cost of debt ~8% (Q4/FY26 call, `earnings/04` §2 / `business-model/10` §1); used 8.5% to be conservative on residual variable-rate debt |
| Tax rate (marginal) | 25.17% | India marginal corporate rate (analyst) |
| After-tax cost of debt | 6.36% | 8.50% × (1 − 0.2517) |
| Equity / debt weights (market) | 84.8% / 15.2% | E = market cap ₹96,461.1M; D = total debt incl. leases ₹17,353.6M (matches the EV/net-debt basis from `01`) |
| **WACC** | **≈ 10.7%** | 0.848 × 11.50% + 0.152 × 6.36% |

**WACC sanity (MODULE_RULES gate).** Risk-free and ERP carry dated web sources (flagged); after-tax cost of debt (6.36%) is well above 0 and consistent with HCG's ~8% disclosed borrowing cost; terminal g (5.0%, §5) is below the WACC and below a defensible long-run India nominal-growth proxy (~10–11% nominal = ~4–5% real + ~5–6% inflation), so g does not breach the currency's growth ceiling. **One judgment flag:** `business-model/09` infers HCG's cost of capital at ~12–13% (a bottom-of-peer, high-leverage, weak-credit operator — CIQ Credit Health all 4/4). My 10.7% sits below that because I use a sector unlevered beta relevered to HCG's *current* (post-rights-issue, lower) leverage rather than a name-specific risk premium. I treat **10.7% as the base and ~11.7% (WACC+1%, closer to the moat module's read) as the more conservative column** in the sensitivity grid (§7); a higher WACC lowers value, so the conservative default leans on the right-hand column.

---

## 4. Free Cash Flow Forecast & Discounting

FCFF = EBIT × (1 − tax) + D&A − capex − ΔNWC. Discounted at WACC = 10.7% (mid-year convention NOT used; end-of-year discounting, stated for reproducibility). All ₹ Mn.

| Year | Revenue | EBIT | NOPAT | D&A | Capex | ΔWC | FCFF | Discount Factor | PV of FCFF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY27 | 29,106 | 3,146 | 2,444 | 2,654 | 3,259 | 37 | 1,802 | 0.903 | 1,628 |
| FY28 | 33,354 | 4,125 | 3,168 | 2,865 | 3,065 | 42 | 2,925 | 0.816 | 2,386 |
| FY29 | 38,891 | 4,986 | 3,989 | 3,317 | 4,118 | 55 | 3,133 | 0.737 | 2,308 |
| FY30 | 43,557 | 5,662 | 4,237 | 3,702 | 4,138 | 47 | 3,755 | 0.666 | 2,499 |
| FY31 | 47,913 | 6,229 | 4,661 | 4,073 | 4,312 | 44 | 4,378 | 0.601 | 2,632 |

**Sum of PV of explicit FCFF (FY27–FY31): ≈ ₹11,453M.**

Note the explicit-period FCFF is positive and rising only because consensus assumes the margin inflection AND capex falling as a share of revenue while D&A catches up. If FY27–FY29 margins land at the lower end of `earnings/07`'s ranges (e.g., COGS share keeps rising, scheme repricing bites — both Mid/High adverse drivers), explicit FCFF is materially lower; the grid in §7 carries that.

---

## 5. Terminal Value

Terminal value is the entire valuation debate for HCG, so I show **both** methods and do not average them.

### Method A — Gordon growth, made financeable (ROIC-disciplined) — the economically honest lens

- Terminal growth **g = 5.0%** (analyst; below WACC, below India long-run nominal-growth proxy; oncology demand structurally growing, `business-model/07` cyclicality 72).
- **Financeable-growth gate (MODULE_RULES economic-consistency #2):** terminal reinvestment rate = g ÷ terminal ROIC. I set **terminal ROIC = 9%** (an *improvement* on today's ~5% as ramping centres mature, but still below the ~10.7% WACC and well below the ~16.8% peer-median return — analyst assumption, anchored to `business-model/09` §5's "must cross ~12% to prove the moat; not yet"). Reinvestment rate = 5.0% ÷ 9% = **56% of NOPAT.**
- Terminal NOPAT (FY31 NOPAT × 1.05) = ₹4,894M; terminal FCFF = 4,894 × (1 − 56%) = **₹2,175M.**
- Terminal value (undiscounted) = 2,175 ÷ (0.107 − 0.05) = **₹38,059M.**
- **PV of terminal value = ₹22,878M.**

| Method A output | Value (₹ Mn) |
|---|---:|
| PV of explicit FCFF | 11,453 |
| + PV of terminal value | 22,878 |
| = Enterprise value | 34,331 |
| − Net debt | −11,944 |
| − Minority interest | −782 |
| = Equity value | 21,605 |
| ÷ 151.79M shares | — |
| **= Intrinsic value per share** | **≈ ₹142** |
| **Terminal value as % of EV** | **66.6%** |

### Method B — Exit EV/EBITDA multiple — the "multiple persists" lens

- Terminal metric: **FY31 EBITDA = EBIT 6,229 + D&A 4,073 = ₹10,301M.**
- Exit multiple range: **12x – 19x**, spanning a de-rated case to HCG's own current LTM multiple. Anchors: HCG current NTM EV/EBITDA 19.0x, LTM 23.4x (`valuation/02` §1); warranted peer band 18–26x (`valuation/03` §5 Step B); a 12x reflects de-rating toward the peer low-multiple outliers / a quality discount.

| Exit multiple on FY31 EBITDA (₹10,301M) | Enterprise value (₹ Mn) | Equity value (₹ Mn) | Per share | TV as % of EV |
|---:|---:|---:|---:|---:|
| 12.0x | 85,762 | 73,036 | **₹481** | ~86% |
| 15.0x | 104,339 | 91,613 | **₹604** | ~89% |
| 19.0x | 129,109 | 116,383 | **₹767** | ~90% |

### Reconciliation of A vs B (required — methods diverge >40%)

The gap between ₹142 (Method A) and ₹481–₹767 (Method B) is **not** a math error — it is the value-vs-multiple problem stated cleanly. **Method A asks "what cash can this business actually distribute if it must fund its own growth at the returns it earns?" and answers: not much, because ROIC < WACC makes growth value-dilutive.** **Method B asks "what will the next buyer pay for FY31 EBITDA?" and answers: a lot, because hospital EBITDA trades at 15–25x in this market regardless of ROIC.** Both are legitimate; they measure different things. The honest synthesis is a **range that spans them**, with the low end (cash-flow reality) as the margin-of-safety anchor and the high end (multiple persistence) as the bull. I do **not** split the difference.

**Terminal-dominance escalation (MODULE_RULES gate #5).** In Method A the TV is 66.6% of EV (below the 75% flag) *only because* the disciplined terminal FCFF is small; in Method B the TV is ~86–90% of EV (terminal-dominated). Either way the valuation is dominated by assumptions about year 5+, so per the gate I add the second lens (the exit-multiple cross-check above IS that lens) and **cap valuation confidence (§8).**

---

## 6. DCF Output

The single-number "DCF value" is method-dependent; I present the bridge for the **base case** (Method A, the economically disciplined lens) and carry Method B explicitly as the upper bound.

| Step | Method A (Gordon, financeable) | Method B (Exit 15x) |
|---|---:|---:|
| PV of explicit FCFF | 11,453 | 11,453 |
| + PV of terminal value | 22,878 | 92,887 |
| **= Enterprise value** | **34,331** | **104,339** |
| − Net debt | −11,944 | −11,944 |
| − Minority / preferred | −782 / 0 | −782 / 0 |
| **= Equity value** | **21,605** | **91,613** |
| ÷ Diluted shares (151.79M) | — | — |
| **= Intrinsic value per share** | **≈ ₹142** | **≈ ₹604** |
| vs current price ₹646.15 | **−78%** | **−7%** |

**EV → equity bridge ties to `01`:** 34,331 − 11,944 − 782 = 21,605 (Method A). The bridge components (net debt ₹11,944.4M, minority ₹782.4M, 151.79M fully diluted shares) are `01`'s anchor verbatim. No plug.

**What it takes to justify the ₹646.15 price (reverse cross-check):**
- Via exit multiple: the model needs a **terminal EV/EBITDA of ≈16.0x on FY31 EBITDA** to reach ₹646 — i.e., HCG would have to still trade at ~16x in FY31, below today's 19–23x but above a de-rated 12x. Achievable only if the rich hospital multiple persists.
- Via Gordon growth: at a financeable terminal ROIC of 9–20%, reaching ₹646 needs **perpetuity g ≈ 9–11%** — essentially equal to the WACC, which is not a defensible long-run growth rate. **A disciplined Gordon-growth DCF cannot reach today's price at any sane terminal growth.**

---

## 7. Sensitivity Grid (per-share intrinsic value)

**Grid A — Gordon growth (financeable, terminal ROIC fixed at 9%).** WACC across columns, terminal g down rows. This is the base-case engine; per-share in ₹.

| | WACC 9.72% | WACC 10.72% (base) | WACC 11.72% |
|---|---:|---:|---:|
| g = 5.5% | ₹182 | ₹137 | ₹106 |
| g = 5.0% (base) | ₹185 | **₹142** | ₹112 |
| g = 4.5% | ₹187 | ₹147 | ₹117 |

Grid A range: **₹106 – ₹187.** Note how *insensitive* it is to g and WACC — because when growth must be funded at a sub-WACC ROIC, faster growth barely adds value. The real swing factor is the terminal ROIC, not g or WACC:

**Grid A′ — terminal ROIC sensitivity (WACC 10.72%, g 5.0%):**

| Terminal ROIC | 7% | 8% | 9% (base) | 10.5% | 12% |
|---|---:|---:|---:|---:|---:|
| Per share | ₹89 | ₹119 | **₹142** | ₹169 | ₹189 |

**Grid B — Exit EV/EBITDA multiple (WACC 10.72%).** Exit multiple on FY31 EBITDA down rows.

| Exit multiple | Per share | vs ₹646.15 |
|---|---:|---:|
| 12.0x | ₹481 | −26% |
| 15.0x | ₹604 | −7% |
| 19.0x | ₹767 | +19% |

**Combined per-share range across both methods: ≈ ₹89 – ₹767.** The defensible *intrinsic* (cash-flow) range is **≈₹90–₹190** (Grid A/A′); the *multiple-persistence* range is **≈₹480–₹770** (Grid B). The single assumption that moves the answer most is **whether HCG's terminal return on capital rises above its cost of capital** (Grid A′) and, equivalently, **whether a 15–19x exit multiple is warranted for a sub-cost-of-capital operator** (Grid B) — these are two views of the same question.

---

## 8. Intrinsic Read

On discounted cash flows that must fund their own growth at the returns HCG actually earns, the company is worth **≈₹90–₹190 per share (base ≈₹142)** — roughly 70–85% below the ₹646.15 price — because a ~5% ROIC against a ~10.7% WACC makes reinvested growth value-dilutive, and a disciplined Gordon-growth terminal cannot reach today's price at any defensible perpetuity growth (it would need g≈WACC). The price is reconcilable only through Method B, where an exit EV/EBITDA of ~16x on FY31 EBITDA gets to ≈₹604 (−7%) — i.e., today's quote rests almost entirely on the rich hospital trading multiple persisting for five-plus years, not on intrinsic cash generation. The valuation is **most sensitive to the terminal return on capital** (₹89 at 7% ROIC vs ₹189 at 12%) — the same cohort-maturity/margin-inflection bet that `business-model/09` flags as unproven and `earnings/04` shows the Street still cutting; confidence is capped (terminal-dominated, ROIC < WACC, methods diverge >40%), so this is a low-confidence intrinsic read whose honest output is a range, not a point.

---

### Self-check
- **Business-type gate applied:** Operating company → FCFF DCF used; no bank/REIT method forced. Cyclicality gate checked and not triggered (oncology demand non-cyclical) — FY26 base is representative, not peak/trough.
- **FCF base year stated (FY26) and normalizations itemized** (tax normalized 15.4%→25.17%; capex source flagged 2,885 vs CIQ 2,921); both levered FCF (₹586M) and FCFF (~₹941M) shown, not mixed.
- **Every forecast assumption labelled** company-guided/consensus vs analyst (FY27–FY29 = consensus; FY30–FY31 + terminal = analyst).
- **WACC components all shown with sources; web-sourced rates (rf, ERP, beta) labelled unverified;** WACC sanity bounds checked (g<WACC, g<nominal-growth proxy, after-tax Kd>0); the moat module's higher ~12–13% cost-of-capital read flagged and carried as the conservative WACC+1% column.
- **Terminal value disclosed as % of EV** (Method A 66.6%; Method B ~86–90%) and **terminal-dominance escalation applied** (second lens = exit-multiple cross-check; confidence capped).
- **EV→equity→per-share bridge uses `01`'s net debt (₹11,944.4M), minority (₹782.4M), and 151.79M fully diluted shares verbatim;** no plug, ties to anchor.
- **Sensitivity grid populated; gives a per-share RANGE** (Grid A ₹106–₹187; Grid A′ ₹89–₹189; Grid B ₹481–₹767).
- **Output is a range (≈₹90–₹770), not a false-precision point;** the cross-method divergence (>40%) is stated as the finding, not averaged.
- **Confidence capped and labelled:** terminal-dominated + ROIC<WACC + methods diverge >40% → intrinsic confidence Low. Forward estimates ARE present (consensus), so the "no consensus" cap is not the binding one; the binding caps are terminal-dominance (confidence max 60) and cross-method >40% disagreement (confidence max 55).
- **No banned phrases** ("cheap/expensive," "undervalued/overvalued," "attractive," "well positioned," "strong fundamentals" avoided; discounts/premiums stated with numbers).
- **Out-of-scope guardrail:** no scenario probabilities, no probability-weighted target, no risk/reward, no rating, no position sizing — those belong to `07_scenario-and-fair-value` and the master synthesizer.
