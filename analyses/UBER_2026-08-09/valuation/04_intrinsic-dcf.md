# Intrinsic DCF — UBER

Reporting standard: US GAAP. Reporting currency: USD millions, except per-share figures. Fiscal year end: December 31. Business type: **Operating** (asset-light, two-sided marketplace — Mobility, Delivery, Freight) per `valuation/00_valuation-data-triage.md` §3 and `business-model/02_business-identity.md`; the FCFF DCF below is the correct primary method for this business type (Business-Type Method Map, no Financial/REIT/Holding-co override applies).

**Canonical anchors used (from `01_price-and-capital-structure.md`, verbatim):** current price $68.18 (2026-08-06, pool-verified); fully diluted shares 2,056.327M; net debt $9,340M (**broad basis, canonical for this module**); minority interest $1,083M; EV $149,684.7M (context only — this agent derives its own DCF-implied EV below).

**Material item NOT modeled below (carried forward from `01` §4):** Uber signed a Business Combination Agreement on 2026-07-16 to acquire Delivery Hero SE (~$14.8bn implied equity value), funded partly by a new €14.2bn bridge credit facility — both post-date the Jun-30-2026 balance sheet used for the anchors above and are excluded from this DCF's forecast and capital structure, consistent with `01`'s treatment. If the bridge facility is drawn, both net debt and the future cash-flow base would move materially; this DCF should be re-run once the deal closes (expected H2 2027).

---

## 1. FCF Base & Normalizations

Two reference points are used: **TTM ended Jun-30-2026** (the freshest read, used for sanity-checking margin trend) and **FY2025A** (the last complete audited fiscal year, used as the Year-0 anchor the explicit forecast grows from, avoiding the double-counting risk of starting a multi-year build from a rolling TTM window that already contains two quarters of the current fiscal year).

| Item | TTM (Jun-30-2026) | FY2025A (Year 0 anchor) | Normalization Applied | Source |
|---|---:|---:|---|---|
| Revenue | $55,227M | $52,017M | None | [`earnings/01_historical-financials.md` §1–2] |
| GAAP EBIT (Income from operations) | $6,700M (12.13% margin) | $5,565M (10.70% margin) | None — GAAP EBIT used throughout, not company-defined Adjusted EBITDA, per `earnings/03_margin-drivers.md` §5 (Uber itself stopped disclosing consolidated Adjusted EBITDA after FY2025 and now points to EBIT/Segment Operating Income) | [`earnings/01_historical-financials.md` §1–2] |
| CFO | $10,424M | $10,099M | None | [`earnings/01_historical-financials.md` §1–2] |
| Capex | $308M | $336M | None | [`earnings/01_historical-financials.md` §1–2] |
| FCF (CFO − Capex, company's own definition) | $10,116M | $9,763M | None — Uber's own FCF reconciliation matches CFO − capex exactly with no add-back [`earnings/06_earnings-quality.md` §1] | [`earnings/01_historical-financials.md` §2] |

**Normalizations considered and NOT applied, stated explicitly:**
- **Stock-based compensation:** already expensed in GAAP EBIT and in CFO (added back as non-cash within CFO, not stripped from EBIT). No adjustment made — this DCF uses GAAP EBIT/NOPAT, which already carries the real, recurring SBC cost, consistent with CLAUDE.md §15 (no silent use of management-adjusted numbers).
- **UK Mobility revenue/cost reclassification:** cuts both revenue and cost of revenue by a matching amount (−$1.1bn revenue / −$808M driver payments in Q2 FY26 alone) — an accounting-optics change with **no net cash-flow effect** [`earnings/03_margin-drivers.md` §6, §8a]. Not adjusted, because it does not change FCF; the effect is confined to the ratio-level margin read, not the dollar cash-flow base this DCF is built on.
- **G&A / legal-accrual swings:** a genuinely two-way, unpredictable item (+$549M favorable FY2025, −$138M unfavorable Q2 FY26 alone — the identical line item, opposite direction, `earnings/03_margin-drivers.md` §8a). Not smoothed into the base year; instead, the forecast margin path (§2 below) is set conservatively enough that it does not depend on this swing continuing in either direction.
- **Deferred-tax valuation-allowance releases (~$6.0bn FY2024, ~$5.0bn FY2025 Netherlands release):** these sit below EBIT (in the GAAP tax line) and do not affect EBIT, CFO, or FCF; excluded by construction from this DCF's NOPAT (built off EBIT × a normalized tax rate, §3 below), not off reported net income [`business-model/09_moat.md` §3].
- **Mark-to-market gains/losses on minority equity stakes (Aurora, Grab, DiDi, Delivery Hero):** below the operating line, excluded by construction (EBIT-based NOPAT).

No cash flow statement gap exists (quarterly and annual CFO/FCF are both directly disclosed), so the Partial-Data proxy rule does not apply — FCF is a directly reported figure, not a proxy.

---

## 2. Forecast Assumptions

10-year explicit horizon (FY2026E–FY2035E), grown off the FY2025A base ($52,017M revenue). Years 1–2 revenue growth is anchored to Capital IQ consensus; all other cells are **analyst assumptions, not company-guided**, built from the margin-driver and moat evidence cited inline.

| Assumption | Yr1 (FY26E) | Yr2 (FY27E) | Yr3 | Yr4 | Yr5 | Yr6 | Yr7 | Yr8 | Yr9 | Yr10 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 11.2% | 15.9% | 12.0% | 10.0% | 8.5% | 7.5% | 6.5% | 5.5% | 5.0% | 4.5% | 3.5% | Yr1–2: **consensus** [`earnings/04_guidance-consensus.md` §4 — FY2026E $57,834.88M, FY2027E $67,028.29M]. Yr2's jump partly reflects the UK Mobility reclassification's Q1 FY2027 lapse date creating an easier YoY comp base [`earnings/03_margin-drivers.md` §6]. Yr3–10: **analyst assumption**, faded from the Yr1–2 consensus average toward the terminal rate; Terminal g = 3.5% is discussed in §5 |
| EBIT margin % (GAAP) | 12.5% | 12.8% | 13.0% | 13.1% | 13.2% | 13.2% | 13.1% | 13.0% | 12.9% | 12.8% | 12.8% | **Analyst assumption.** Starts near the TTM 12.13% (not the Q2'26 quarterly peak of 13.32%), consistent with `business-model/07_business-quality.md` §4's caution that FY2025/TTM margins are "near-peak, post-recovery readings" not yet a stabilized steady state. Peaks modestly (13.2%) mid-forecast reflecting the genuine ex-UK cost-of-revenue leverage (`earnings/03_margin-drivers.md` §9), then **fades** in Yr7–10 to reflect competitive intensity (scored 28/100, `business-model/07_business-quality.md`) and the unquantified future AV P&L cost (`earnings/03_margin-drivers.md` §10) — a deliberate check against Gate 3 (ROIC drift) rather than extrapolating peak margins into perpetuity |
| Tax rate % (normalized) | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | 21% | **Reconciles to `business-model/09_moat.md` §3's canonical normalized rate** — the US federal statutory rate, stripped of the ~$6.0bn (FY2024) and ~$5.0bn (FY2025) one-off deferred-tax valuation-allowance releases that produced GAAP effective tax *benefits* of −139.6% and −74.9%. Consensus FY2026+ effective tax rate assumptions (18–21%) corroborate 21% as reasonable [`business-model/09_moat.md` §3] |
| Capex (% of revenue) | 0.6% | 0.8% | 1.0% | 1.3% | 1.6% | 1.8% | 2.0% | 2.1% | 2.2% | 2.2% | 2.2% | **Analyst assumption.** Current book capex is only 0.56% of TTM revenue (`earnings/01` §2), but Uber disclosed a **$10bn multiyear AV investment program** on the Q2 FY26 call with no quantified P&L/capex timeline yet ("we'll size that for investors clearly as we go") [`earnings/03_margin-drivers.md` §10]. This forecast ramps capex intensity toward 2.2% of revenue by Yr9–10 as a conservative placeholder for that program landing on the balance sheet — genuinely uncertain, flagged explicitly, not company-guided |
| D&A (% of revenue) | 1.3% | 1.4% | 1.5% | 1.7% | 1.9% | 2.0% | 2.1% | 2.2% | 2.2% | 2.2% | 2.2% | **Analyst assumption**, ramped in lockstep with the capex assumption above and converging to it by Yr9 (steady-state capex ≈ D&A) |
| Δ Working capital (cash effect, % of revenue) | +3.0% | +2.5% | +2.2% | +2.0% | +1.8% | +1.6% | +1.4% | +1.2% | +1.1% | +1.0% | +1.0% | **Revenue-linked driver — see the working-capital note below.** Positive = cash SOURCE (adds to FCFF). Faded down from the recent 3-year average (FY2023–FY2025: 0.44%, 5.40%, 4.28% of revenue — `earnings/06_earnings-quality.md` §1) toward a more moderate, sustainable 1.0% by Yr10 — **analyst assumption** |

**Working-capital driver — why this is a cash SOURCE, not a use.** Uber's disclosed CFO-bridge "Working capital change" line has been **positive (a cash inflow) in every one of the last five years** — +$1,682M (FY21), +$335M (FY22), +$165M (FY23), +$2,374M (FY24), +$2,227M (FY25) [`earnings/06_earnings-quality.md` §1]. This is NOT primarily a receivables/payables story (DSO is falling — 30.3→25.1 days — and DPO is roughly flat at ~11 days, `earnings/06_earnings-quality.md` §3); it is dominated by the **buildup of Uber's self-insurance reserves** ($12.5bn balance at Dec-31-2025), a real, cited operating liability that grows as Gross Bookings grow and is recognized in cash before claims are paid [`earnings/06_earnings-quality.md` §1, citing FY25 10-K's "Valuation of Insurance Reserves" critical audit matter]. A growing net operating liability funds part of Uber's growth ahead of the cash outflow — the same economic direction as a negative-working-capital retailer, even though Uber's raw DSO/DPO alone would not fully capture it. This forecast models it as a revenue-linked cash-source ratio (not a flat dollar figure, per the Hard Rule), fading down from its recent-history level rather than extrapolating the FY2024/FY2025 peak forward, because reserve-growth deceleration should track the modeled revenue-growth deceleration. **Sign check:** revenue rises every forecast year, the ratio is held positive (a source) and fading, so the modeled dollar cash effect is positive and shrinking in dollar terms after Yr4 (from $1,735M in Yr1 to $1,188M in Yr10) — computed directly from the ratio × forecast revenue in §4, not inferred from "growth" alone.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.65% | [Web: 10-year US Treasury yield, ~4.65–4.69%, early August 2026 (dated, unverified) — cross-checked against `business-model/09_moat.md` §3's independently web-sourced 4.6%, consistent] |
| Equity-risk premium | 4.5% | Blended long-run US estimate — between Damodaran's early-2026 implied ERP (~4.2%) and the standard long-run historical estimate (~5.0%) [Web, dated 2026-08-09, unverified — not company-disclosed, Inference] |
| Beta | 1.15 (5-year) | [Capital IQ Comparable Analysis export, Public Company Profile, as-of 2026-08-06 — same figure independently cited in `business-model/09_moat.md` §3] |
| Cost of equity (CAPM) | 9.83% | `k_e = rf + β × ERP = 4.65% + 1.15 × 4.5% = 9.825%` |
| Pre-tax cost of debt | 4.2% | FY2025 interest expense $440M ÷ LT + current debt $10,521M (FY2025-end) [FY25 10-K; cross-checked to `business-model/09_moat.md` §3's identical 4.2% figure] |
| Tax rate (for the debt tax shield) | 21% | Same normalized rate as NOPAT (§2 above) |
| After-tax cost of debt | 3.32% | `4.2% × (1 − 21%)` |
| Equity / debt weights (market value) | 90.43% / 9.57% | Equity = market cap $139,261.7M; Debt = total debt $14,731M (both from `01_price-and-capital-structure.md` §3–4) — `w_e = 139,261.7/(139,261.7+14,731) = 90.43%`; `w_d = 14,731/(139,261.7+14,731) = 9.57%` |
| **WACC** | **9.20%** | See formula and executed snippet below |

**Formula:** `WACC = w_e·k_e + w_d·k_d·(1 − t) = 0.9043 × 9.825% + 0.0957 × 3.318% = 8.884% + 0.318% = 9.203%` (no preferred equity exists — `01` §4 confirms nil preferred — so the `w_p·k_p` term is omitted).

**WACC sanity bounds (MODULE_RULES Gate 4):** `after-tax k_d (3.32%) ≤ WACC (9.20%) < k_e (9.83%)` — **holds**, confirmed by the executed snippet below. For this developed-market (USD) mega-cap, `k_e` (9.83%) sits below the `rf + 1.4 × ERP` bound (4.65% + 1.4×4.5% = 10.95%), consistent with the actual sourced 5-year beta (1.15) rather than an unjustified high-beta assumption — no override or additional justification required.

**Cross-check against the moat module's inferred cost of capital (Gate 4):** `business-model/09_moat.md` §3 independently derives WACC ≈ 9.7% using the same CAPM structure (rf 4.6%, beta 1.15, ERP 5.0%, kd 4.2%). This DCF's 9.20% differs by only ~0.5pp — well inside the ~2pp reconciliation threshold — so **no dual-rate sensitivity grid is required**; the §7 grid's ±1.00pp WACC columns (8.20%–10.20%) already span both figures.

**No discretionary override applied** — the WACC used (9.20%) equals the mechanically computed value; no analyst adjustment was made.

**Executed WACC-blend snippet:**
```
$ python3 -c "
tax=0.21; rf=0.0465; erp=0.045; beta=1.15
ke=rf+beta*erp
pretax_kd=0.042; aftertax_kd=pretax_kd*(1-tax)
mktcap=139261.7; debt=14731.0
we=mktcap/(mktcap+debt); wd=debt/(mktcap+debt)
wacc=we*ke+wd*aftertax_kd
print('ke=',round(ke*100,3),'aftertax_kd=',round(aftertax_kd*100,3),'we=',round(we*100,2),'wd=',round(wd*100,2))
print('WACC=',round(wacc*100,3))
print('Sanity aftertax_kd<=WACC<ke:', aftertax_kd<=wacc<ke)
"
ke= 9.825 aftertax_kd= 3.318 we= 90.43 wd= 9.57
WACC= 9.203
Sanity aftertax_kd<=WACC<ke: True
```

---

## 4. Free Cash Flow Forecast & Discounting

**Discounting convention: mid-year (t − 0.5)** — cash flows are assumed to arrive evenly through each year, so Year 1 is discounted at t=0.5, Year 2 at t=1.5, …, Year 10 at t=9.5. (Simplification flagged: the valuation date, 2026-08-09, falls roughly 60% through calendar FY2026; treating Yr1/FY2026E as starting from t=0 slightly overstates its PV by a few weeks of discounting — immaterial relative to the overall dispersion shown in §7.)

`FCFF = NOPAT + D&A − Capex + Working-capital cash source` (NOPAT + D&A − Capex − ΔNWC per the Economic Consistency Gate, with the working-capital term's sign flipped to positive because it is a disclosed, recurring cash SOURCE for this business — see the sign-check note in §2).

| Year | Revenue | EBIT (margin) | NOPAT | D&A | Capex | WC cash source | FCFF | Discount Factor (t−0.5) | PV of FCFF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 (FY26E) | 57,842.9 | 7,230.4 (12.50%) | 5,712.0 | 752.0 | 347.1 | +1,735.3 | 7,852.2 | 0.9569 | 7,514.0 |
| 2 (FY27E) | 67,039.9 | 8,581.1 (12.80%) | 6,779.1 | 938.6 | 536.3 | +1,676.0 | 8,857.3 | 0.8763 | 7,761.6 |
| 3 (FY28E) | 75,084.7 | 9,761.0 (13.00%) | 7,711.2 | 1,126.3 | 750.8 | +1,651.9 | 9,738.5 | 0.8025 | 7,814.7 |
| 4 (FY29E) | 82,593.2 | 10,819.7 (13.10%) | 8,547.6 | 1,404.1 | 1,073.7 | +1,651.9 | 10,529.8 | 0.7348 | 7,737.6 |
| 5 (FY30E) | 89,613.6 | 11,829.0 (13.20%) | 9,344.9 | 1,702.7 | 1,433.8 | +1,613.0 | 11,226.8 | 0.6729 | 7,554.5 |
| 6 (FY31E) | 96,334.6 | 12,716.2 (13.20%) | 10,045.8 | 1,926.7 | 1,734.0 | +1,541.4 | 11,779.8 | 0.6162 | 7,258.7 |
| 7 (FY32E) | 102,596.4 | 13,440.1 (13.10%) | 10,617.7 | 2,154.5 | 2,051.9 | +1,436.3 | 12,156.6 | 0.5643 | 6,859.6 |
| 8 (FY33E) | 108,239.2 | 14,071.1 (13.00%) | 11,116.2 | 2,381.3 | 2,273.0 | +1,298.9 | 12,523.3 | 0.5167 | 6,471.0 |
| 9 (FY34E) | 113,651.1 | 14,661.0 (12.90%) | 11,582.2 | 2,500.3 | 2,500.3 | +1,250.2 | 12,832.4 | 0.4732 | 6,071.9 |
| 10 (FY35E) | 118,765.4 | 15,202.0 (12.80%) | 12,009.6 | 2,612.8 | 2,612.8 | +1,187.7 | 13,197.2 | 0.4333 | 5,718.4 |

**Working-capital sign check:** every year's WC cash-source figure is positive (a source, adding to FCFF) — this matches the actual direction of Uber's disclosed 5-year working-capital history (§2), which has been a cash inflow every year, not an outflow. Revenue is rising every year and the modeled ratio is fading, so the dollar cash effect itself declines through the horizon (+$1,735M → +$1,188M) even as it stays positive — the sign is read off the modeled ΔNWC path, not assumed from "growth" alone.

**Sum of PV of explicit FCFs: $70,762.1M.**

**Executed discounting snippet:**
```
$ python3 /tmp/uber_final.py   # (full model; relevant excerpt)
Sum PV explicit FCFF = 70762.1
```
(Full year-by-year FCFF, discount factors, and PVs shown in the table above were produced by this same executed script — see the full run log referenced in §5/§6 below for the terminal-value and bridge segments.)

---

## 5. Terminal Value

**Method: Gordon growth perpetuity.** `TV = FCFF_{n+1} / (WACC − g) = FCFF_10 × (1 + g) / (WACC − g)`.

- FCFF Year 10 = $13,197.2M
- Terminal growth `g` = **3.5%** (nominal) — analyst assumption, below the ~4% long-run US nominal-GDP proxy (WACC's reporting currency is USD)
- `FCFF_11 = 13,197.2 × 1.035 = $13,659.1M`
- `WACC − g = 9.203% − 3.5% = 5.703%` — comfortably positive, well above the ~1–2pp near-convergence danger zone
- `TV (undiscounted) = 13,659.1 / 0.05703 = $239,527.0M`
- `PV(TV) = TV × discount factor (Yr10, mid-year, t=9.5) = 239,527.0 × 0.4333 = $103,787.1M`
- **Terminal value as % of total EV: 59.46%** — below the 75% terminal-dominance threshold; no escalation to a mandatory second lens is triggered, though the exit-multiple cross-check below is shown regardless as a sanity check.

**Exit-multiple cross-check.** The Gordon TV of $239,527M against Year-10 EBIT of $15,202M implies an exit EV/EBIT multiple of **~15.8x**. Against Year-10 EBITDA (EBIT + D&A = $15,202M + $2,613M = $17,815M), that is **~13.4x EV/EBITDA**. Both sit inside a plausible range for a mature, still-modestly-growing (4.5% terminal-adjacent) asset-light platform business, and are not wildly disconnected from Uber's own current LTM EV/EBITDA — this is a sanity check, not an independent valuation.

**Why terminal g was set at 3.5%, not a higher figure — the financeable-growth cross-check (Gate 2).** The reinvestment-rate/ROIC cross-check (`Implied growth ≈ ROIC × reinvestment rate`) breaks down mechanically for this forecast: because the working-capital cash source (§2) exceeds the modeled capex-minus-D&A gap in later years, the **modeled reinvestment rate at Year 10 is −9.9%** (net capital is being *released*, not invested), and invested capital (walked forward from the moat module's FY2025 base of $29,843.5M) **falls** to $12,616M by Year 10, driving a modeled ROIC that rises implausibly from 20.6% (Yr1) to 95.2% (Yr10). This is the flip side of the same working-capital dynamic that boosts FCFF in §4 — a real, disclosed, revenue-linked cash source (§2) — but it makes the standard `ROIC × reinvestment rate` formula (designed for capital-intensive compounders) meaningless here, and the gap between that formula's implied growth (≈ −9%) and the modeled terminal g (3.5%) is far larger than the ~1.5pp threshold. **Per the Hard Rule's own named bridge — "working-capital release" — this is exactly that case, explicitly disclosed and quantified above, not an unquantified flag.** Consistent with the rule's alternative remedy, **intrinsic confidence in this DCF is capped (Low–Medium)** rather than mechanically forcing terminal g toward the formula's nonsensical negative reading, and the sensitivity grid (§7) is shown at g = 3.0% / 3.5% / 4.0% so a reader can see the base case is not levered on the top end of a plausible growth range. The declining-perpetuity structural-reset case below (a much lower g) is the more conservative counterpart this tension argues for.

**ROIC drift check (Gate 3).** The moat module (`business-model/09_moat.md` §5) verdicts a **Narrow** moat — "widening" over the last two years but with a 5-year through-cycle average ROIC (+0.85%) still below WACC, and an unresolved AV-disruption risk. This forecast does **not** assume ever-expanding excess returns: EBIT margin (the main lever on ROIC here) is capped at 13.2% mid-forecast and **fades** to 12.8% by Year 10 — flat-to-down, not up — specifically to avoid extrapolating a narrow, recently-proven moat into perpetual margin expansion. The residual ROIC escalation shown above is a working-capital-driven artifact (falling invested capital base), not a margin-driven one.

**Structural-decline / runoff terminal trigger (avoid-ruin, CLAUDE.md §24 Filter 5).** `business-model/07_business-quality.md` §1 scores **industry rate-of-change / disruption risk at 32/100** (≤ the ~40 threshold) — Uber "may fail to offer autonomous vehicle technologies... at competitive scale... before competitors," and Waymo already runs a commercialized robotaxi fleet independent of Uber's platform [FY25 10-K, cited in `business-model/09_moat.md` §5]. This trips the Hard Rule's declining-perpetuity trigger. A second, explicitly labeled terminal is built alongside the base case:

- **Structural-reset (declining-perpetuity) terminal — bear input, NOT the base case.** EBIT margin is faded down starting Year 5 to reflect an AV-driven competitive/take-rate compression scenario (Yr5: 11.0% → Yr10: 7.0%, versus the base case's 13.2%→12.8%), holding the same revenue and working-capital paths as the base case. Terminal `g_runoff` = **1.0%** (nominal, at/below the long-run US inflation proxy, consistent with a structurally impaired, non-recovering franchise — same nominal basis as the rest of this DCF).
  - Yr10 FCFF (stressed) = $7,755.4M
  - `FCFF_11 = 7,755.4 × 1.01 = $7,832.9M`
  - `TV = 7,832.9 / (9.203% − 1.0%) = 7,832.9 / 8.203% = $95,494.1M`
  - `PV(TV) = 95,494.1 × 0.4333 = $41,377.6M`
  - Sum of PV of stressed explicit FCFF = $58,248.5M
  - EV (stressed) = $58,248.5M + $41,377.6M = $99,626.1M
  - Equity = $99,626.1M − $9,340M − $1,083M = $89,203.1M
  - **Per-share (structural-reset terminal): $43.38**

This structural-reset case is the DCF input for `07_scenario-and-fair-value`'s structural-reset bear leg and the master synthesizer's Kill Criteria — **it does not replace the base-case intrinsic value below.**

---

## 6. DCF Output

**Executed EV → equity → per-share bridge snippet:**
```
EV = Sum PV FCFF + PV(TV) = 70,762.1 + 103,787.1 = 174,549.2
TV % of EV = 103,787.1 / 174,549.2 = 59.46%
Equity value = EV - net debt - minority = 174,549.2 - 9,340.0 - 1,083.0 = 164,126.2
Per share = Equity / diluted shares = 164,126.2 / 2,056.327 = 79.82
vs price $68.18 => (79.82-68.18)/68.18 = +17.07%
```

| Step | Value |
|---|---:|
| PV of explicit FCFs (Yr1–Yr10) | $70,762.1M |
| + PV of terminal value | $103,787.1M |
| **= Enterprise value (DCF-derived)** | **$174,549.2M** |
| − Net debt (broad basis, canonical per `01`) | $9,340.0M |
| − Minority / non-controlling interest | $1,083.0M |
| − Preferred equity | $0 (nil, per `01` §4) |
| **= Equity value** | **$164,126.2M** |
| ÷ Diluted shares (per `01` §2) | 2,056.327M |
| **= Intrinsic value per share (base case)** | **$79.82** |
| vs current price ($68.18, 2026-08-06, pool-verified) | **+17.07%** (fair value above price) |

For context, this DCF-derived EV ($174,549.2M) sits **16.6% above** `01`'s current-market EV ($149,684.7M) — consistent with the per-share premium above.

---

## 7. Sensitivity Grid (per-share intrinsic value)

WACC across columns (base 9.20%, ±1.00pp — spans the ~0.5pp gap to the moat module's independently-derived 9.7% cost of capital, per Gate 4), terminal growth down rows (base 3.5%, ±0.5pp):

| | WACC 8.20% | WACC 9.20% (base) | WACC 10.20% |
|---|---:|---:|---:|
| g = 4.00% | $105.99 | $84.93 | $70.66 |
| g = 3.50% (base) | $97.68 | **$79.82** | $67.28 |
| g = 3.00% | $90.97 | $75.52 | $64.37 |

No grid cell approaches `WACC − g ≤ 0` — the closest spread (WACC 8.20% / g 4.00%) is still 4.20pp — so no cell is marked NM.

For reference, the **structural-reset (declining-perpetuity) terminal** from §5 — a distinct, lower-g, lower-margin scenario, not a grid cell of the base case — computes to **$43.38/share**, materially below the low end of this grid, reflecting the AV-disruption bear leg rather than a WACC/g wobble around the base case.

---

## 8. Intrinsic Read

**Base-case intrinsic value: $79.82/share** (DCF-derived, mid-year convention, WACC 9.20%, terminal g 3.5%), against a current price of $68.18 — a +17.1% premium of fair value over price. The §7 grid disperses that point from $64–$106/share on plausible ±1pp WACC / ±0.5pp terminal-growth moves — a wide band that shows the base point is not a precise single number, and the separately labeled structural-reset (AV-disruption) terminal at $43.38/share sits well below even the low end of that grid, marking the downside this DCF's central case does not carry. The single assumption this value is most sensitive to is **terminal growth interacting with WACC** (the g=4.0%/WACC=8.2% corner is 2.5x the g=3.0%/WACC=10.2% corner), compounded by a genuine method tension flagged in §5: Uber's disclosed working-capital release (self-insurance-reserve buildup) makes the standard financeable-growth cross-check unusable at face value, which is why intrinsic confidence here is capped at Low–Medium rather than presented at face value alongside the +17% headline — a reader relying on this DCF alone, without the multiples-based cross-checks in `02`/`03`, would be leaning on a self-built 10-year forecast beyond the 2-year consensus horizon for the majority of the value (terminal value is 59.5% of EV).

