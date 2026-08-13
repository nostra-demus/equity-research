# Intrinsic DCF — HAIER (Haier Smart Home Co., Ltd., SHSE:600690)

**Business-type gate (MODULE_RULES Business-Type Method Map).** `00_valuation-data-triage.md` §3 and the business-model triage classify Haier as an **Operating company** (multi-segment global home-appliance manufacturer) — not a bank/insurer, REIT, or holding company. It carries a **High** commodity-cost dependence (raw materials 84% of appliance-segment cost of sales, `business-model/10_external-dependency.md`) and a **34/100 cyclicality score** (`business-model/07_business-quality.md`), so the **Cyclicality Gate** applies to the terminal margin even though the entity itself is not classified "Commodity/cyclical." An **FCFF DCF** is the correct method; it proceeds below, with the terminal margin normalized against peer-normal and the company's own prior trough (§2, §5).

**Currency and reporting basis.** All figures in RMB (CNY) millions unless stated otherwise. Base year is **FY2025 (ended 31-Dec-2025)**, reported under China Accounting Standards for Business Enterprises (CAS/ASBE), A-share (SHSE:600690) basis — the same basis `earnings/01_historical-financials.md` uses. Current price CNY 21.75 (2026-08-12 close), net debt, minority interest and diluted share count are carried forward from `valuation/01_price-and-capital-structure.md` (canonical anchor).

---

## 1. FCF Base & Normalizations

| Item | Base-Year Value (FY2025) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | 302,346.8 | None — as reported | `earnings/01_historical-financials.md` §1 |
| EBIT | 20,866.8 (6.90% margin) | None — no EBIT-level one-off identified. The company's ~RMB949.2mn of CSRC-defined non-recurring items (government subsidies, asset-disposal losses, FV gains) sit **below** the EBIT line and affect net profit, not EBIT (`earnings/01_historical-financials.md` §4; `earnings/06_earnings-quality.md` §4) | `earnings/01_historical-financials.md` §1 (CapIQ-derived, cross-checked to the company's own P&L movement table) |
| D&A | 5,676.6 (1.88% of revenue) | None | EBITDA (26,543.4) − EBIT (20,866.8), `earnings/01_historical-financials.md` §1 |
| Capex | 8,851.6 (2.93% of revenue) | None — FY2025 capex sits below the FY2023 peak (10,541.6), not a wave running above history (`earnings/03_margin-drivers.md` §9) | `earnings/01_historical-financials.md` §1 |
| Effective tax rate | 14.1% | **Used as-is as the normalized rate** — structural, not a one-off: the rate declined smoothly from 16.97% (FY2021) to 13.54% (LTM Mar-2026) with no visible spike/dip, driven by dozens of Haier subsidiaries qualifying for China's 15% High-and-New-Technology-Enterprise (HNTE) preferential rate vs the 25% statutory rate. **This reconciles exactly to `business-model/09_moat.md` §3's canonical normalized rate (14.1%, FY2025)** — no divergence to flag per the reconciliation requirement | `business-model/09_moat.md` §3; `earnings/06_earnings-quality.md` §8 |
| FCF (CFO − total capex) | 17,151.3 | None — earnings-quality found no distorting one-off inflating reported FCF; the strong CFO/EBITDA ratio (98.0% FY2025) is structurally supported by a negative cash-conversion cycle funded through supplier credit, not a one-time item (`earnings/06_earnings-quality.md` §1, fn.4) | `earnings/01_historical-financials.md` §1 |

No proxy FCF was required (a full cash-flow statement is available) and consensus forward estimates exist through FY2030 — the Partial-Data Rule's proxy/self-build caps do **not** apply. Confidence is nonetheless capped to **Moderate** for reasons stated in §8 (extreme WACC sensitivity; elevated near-term miss risk on the consensus revenue path).

---

## 2. Forecast Assumptions

**Explicit forecast: FY2026–FY2030 (5 years).** Revenue growth is Street consensus (Capital IQ Estimates, as of 2026-08-13 — a genuine pool export, tier 5, not web-sourced); margin, capex, and working-capital paths are this agent's own analyst assumptions, informed by the cited upstream modules, because Haier issues no formal consolidated guidance (`earnings/04_guidance-consensus.md` §2).

| Assumption | FY2026E | FY2027E | FY2028E | FY2029E | FY2030E | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | +2.24% | +4.98% | +4.77% | +6.93% | +5.85% | +2.00% (Gordon) | **Consensus**, `HaierSmartHomeCo…EstimatesReport.xls`, Consensus tab (FY2026E–FY2030E path; FY2026E ties exactly to `earnings/04_guidance-consensus.md` §3's CNY 309,111mn mean). Flagged: `earnings/04_guidance-consensus.md` §7 rates the "Bar" as **High / miss risk elevated** — two of the last two reported quarters missed an already-lowered consensus, and revision breadth is net negative into FQ2 2026 |
| Gross margin % | 25.8% | 26.0% | 26.2% | 26.3% | 26.3% | 26.3% | **Analyst assumption.** FY2025 actual 26.33% (`earnings/01_historical-financials.md` §1); Q1 2026 printed 25.3%, down 0.1pp YoY (`earnings/03_margin-drivers.md` §3), so Yr1 continues that pressure before a partial, not full, recovery — terminal is held at the FY2025 level, **not** the FY2024 peak (27.48%), consistent with the moat module's "eroding" trajectory finding |
| EBIT margin % | 6.60% | 6.70% | 6.80% | 6.85% | 6.90% | 6.90% | **Analyst assumption**, Cyclicality-Gate-benchmarked: terminal margin (6.90%) = the FY2025 actual, above the company's own 5-yr low (FY2021, 5.91%) but well below **peer-normal** — Midea 9.8% EBIT margin and Gree 17.4% EBIT margin, same LTM comp-set basis (`business-model/09_moat.md` §3) — and below the FY2024 subsidy-assisted cyclical peak (7.66%), which `business-model/07_business-quality.md` §4 explicitly calls "the cyclical high-water mark, not the sustainable run-rate" |
| Tax rate % | 14.1% | 14.1% | 14.1% | 14.1% | 14.1% | 14.1% | Held flat at the normalized structural rate (§1) — HNTE preferential-rate regime is long-standing and disclosed, not scheduled to lapse in the pool |
| Capex (% of revenue) | 2.95% | 2.93% | 2.90% | 2.88% | 2.85% | 2.85% | **Analyst assumption**, gently mean-reverting toward the FY2025 ratio (2.93%) from a slightly elevated FY2026 starting point, reflecting the Air Solutions (CCR/Kwikot) capacity build tapering (`earnings/03_margin-drivers.md` §9) |
| D&A (% of revenue) | 1.90% | 1.89% | 1.88% | 1.87% | 1.86% | 1.86% | **Analyst assumption**, held near the FY2025 ratio (1.88%) |
| Working capital driver | DSO 51.5d / DIO 73.7d / DPO 124.0d | DSO 52.0d / DIO 73.6d / DPO 123.0d | DSO 52.5d / DIO 73.5d / DPO 122.0d | DSO 53.0d / DIO 73.5d / DPO 121.0d | DSO 53.0d / DIO 73.5d / DPO 120.0d | Held at FY2030 levels | **Revenue/COGS-linked (days-of-sales), not a flat absolute** — extends `earnings/06_earnings-quality.md` §3's explicit finding that Haier's cash-conversion cycle (CCC) has narrowed every year (−10.8d FY2023 → −7.0d FY2024 → −1.2d FY2025) and "could turn positive within 1–2 years" if DSO keeps rising while DPO holds/falls. This forecast extends that disclosed trend (CCC: −1.2d FY2025 → +1.2d → +2.6d → +4.0d → +5.5d → +6.5d by FY2030), not a company-guided figure |

**Working-capital cash-effect sign check.** NWC is computed each year as AR (DSO/365 × revenue) + Inventory (DIO/365 × COGS) − AP (DPO/365 × COGS); FY2025 base NWC = CNY 10,296.8mn (cross-checks to the CapIQ "Working Capital" balance of CNY 10,487.2mn in `earnings/01_historical-financials.md` §1, ~1.8% gap attributable to definitional scope). Because the CCC is modeled turning from slightly negative to **positive** over the forecast (per the earnings-quality trend above), NWC **rises** every year (ΔNWC = +1,709.7 → +1,723.9 → +1,830.9 → +2,358.7 → +1,825.2, CNY mn) — a **cash use**, correctly **subtracted** in the FCF formula below. This is the opposite of the "negative-working-capital release" case (that pattern would apply only if the CCC stayed negative and the ratio held or widened) — here the disclosed CCC-narrowing trend is modeled through to its logical conclusion, which is a **headwind** to FCF, not a tailwind. Sign confirmed against the direction of the modeled ΔNWC path, not assumed.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 1.70% | China 10-year government bond yield, Aug-2026 — Web: tradingeconomics.com, 2026-08-07 (unverified, dated) — same rate `business-model/09_moat.md` §3 uses |
| Equity-risk premium | 6.50% (base case); 9.00% (sensitivity) | China ERP inference — *Inference, not from filings*, same range `business-model/09_moat.md` §3 uses |
| Beta | 0.46 | Capital IQ 5-year beta, `Company Comparable Analysis…xls`, Operating Statistics tab — corroborated by `…Public Company Profile.rtf` ("Beta 5Y: 0.46") |
| Cost of equity (k_e = rf + β×ERP) | 4.69% (base) / 5.84% (ERP-sensitivity) | Computed |
| Pre-tax cost of debt | 1.699% | Yield-to-worst on Haier's Jun-2028 senior unsecured RMB note, `…Fixed Income Securities Summary.rtf` |
| Tax rate (debt tax shield) | 14.1% | Same normalized rate as NOPAT (§1) |
| After-tax cost of debt | 1.459% | Computed: 1.699% × (1 − 0.141) |
| Equity / debt weights (market value) | 81.88% equity / 18.12% debt | Market cap CNY 190,093.35mn ÷ (Market cap + Total debt CNY 42,076.81mn), both from `valuation/01_price-and-capital-structure.md` §3–§4 — **market-value weights**, not CapIQ's book-based "Total Capital" weights (which the moat module used as a cross-check only) |
| **WACC** | **4.10% (base, ERP 6.5%) / 5.05% (ERP-sensitivity, 9.0%)** | Computed (formula below) |

**Formula (pinned by the executed snippet, not eyeballed):**
```
WACC = w_e·k_e + w_d·k_d·(1 − t)
w_e = 190,093.35 / (190,093.35 + 42,076.81) = 0.8188
w_d = 42,076.81 / (190,093.35 + 42,076.81) = 0.1812
k_e = 1.70% + 0.46 × 6.50% = 4.690%          [ERP sensitivity: 1.70% + 0.46 × 9.00% = 5.840%]
k_d(after-tax) = 1.699% × (1 − 0.141) = 1.459%
WACC = 0.8188×4.690% + 0.1812×1.459% = 4.1045%   [ERP sensitivity: 0.8188×5.840% + 0.1812×1.459% = 5.0461%]
```
Executed output:
```
ERP=6.50% -> ke=4.6900% kd_at=1.4594% WACC=4.1045%
ERP=9.00% -> ke=5.8400% kd_at=1.4594% WACC=5.0461%
```

**Sanity bound (MODULE_RULES Gate 4).** After-tax k_d (1.459%) ≤ WACC (4.105%) < k_e (4.690%) → **holds** (confirmed by the executed script: `True`). China is not a developed USD/EUR/GBP market, so the mega-cap k_e-vs-`rf + 1.4×ERP` ceiling does not formally apply, but for completeness: k_e (4.69–5.84%) implies an effective beta of 0.46 — well below 1.4 — so no override justification is needed either way.

**Cross-check against `business-model/09_moat.md`.** That module's own CAPM build (book-value "Total Capital" weights: 76.2% equity / 23.8% debt) produced WACC ≈3.9%–4.8%. This report's market-value-weighted WACC (4.10%–5.05%) sits within ~0.3pp of that range at every ERP point — well inside the ±2pp Gate-4 tolerance — so no divergence-driven grid-widening is triggered. **Base case used throughout §4–§7: WACC = 4.10% (ERP 6.5%).**

**A material finding, flagged here and carried through §5–§8:** this mechanically-correct WACC is unusually low — a consequence of China's current sub-2% sovereign yield and Haier's low 5-year beta — and it is **materially below** the discount rate the market appears to actually apply to this stock (Haier's own trailing TEV/LTM EBITDA has traded 5.9x–10.1x over the last six quarters, `Haier…Financials.xls`, Multiples tab). At WACC this low, the Gordon-growth terminal value becomes numerically unstable even at a conservative terminal growth rate — see §5.

---

## 4. Free Cash Flow Forecast & Discounting

| Year | Revenue | EBIT | NOPAT | Capex | ΔNWC (cash effect) | FCF | Discount Factor (mid-year, t−0.5) | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026E | 309,110.7 | 20,401.3 | 17,524.7 | 9,118.8 | −1,709.7 | 12,569.4 | 0.9801 (t=0.5) | 12,319.1 |
| FY2027E | 324,503.1 | 21,741.7 | 18,676.1 | 9,507.9 | −1,723.9 | 13,577.4 | 0.9414 (t=1.5) | 12,782.4 |
| FY2028E | 339,971.4 | 23,118.1 | 19,858.4 | 9,859.2 | −1,830.9 | 14,559.8 | 0.9043 (t=2.5) | 13,166.8 |
| FY2029E | 363,531.0 | 24,901.9 | 21,390.7 | 10,469.7 | −2,358.7 | 15,360.3 | 0.8687 (t=3.5) | 13,343.1 |
| FY2030E | 384,795.0 | 26,550.9 | 22,807.2 | 10,966.7 | −1,825.2 | 17,172.5 | 0.8344 (t=4.5) | 14,329.2 |

FCF = NOPAT + D&A − Capex − ΔNWC (D&A rows shown in §2; ΔNWC subtracted every year — NWC is rising, a cash use, per the §2 sign check).

**Discounting convention: mid-year (t − 0.5), as required by default.** Cash flows are assumed to arrive evenly through each fiscal year, not at year-end.

**Sum of PV of explicit FCFs = CNY 65,940.6mn.**

Executed command and raw output:
```
for i,r in enumerate(rows, start=1):
    t = i - 0.5
    df = 1/(1+WACC)**t
    pv = r['fcf']*df
    pv_sum += pv
--- output ---
2026 FCF=12569.4 t=0.5 DF=0.9801 PV=12319.1
2027 FCF=13577.4 t=1.5 DF=0.9414 PV=12782.4
2028 FCF=14559.8 t=2.5 DF=0.9043 PV=13166.8
2029 FCF=15360.3 t=3.5 DF=0.8687 PV=13343.1
2030 FCF=17172.5 t=4.5 DF=0.8344 PV=14329.2
Sum PV of explicit FCFs = 65940.6
```

---

## 5. Terminal Value

### Financeable-growth cross-check (Gate 2), run before selecting terminal g
```
Terminal-year (FY2030) net investment = Capex − D&A + ΔNWC = 10,966.7 − 7,157.2 + 1,825.2 = 5,634.6
Reinvestment rate = 5,634.6 / NOPAT(22,807.2) = 24.71%
Implied financeable g = ROIC × reinvestment rate
  using 5-yr through-cycle ROIC 8.32% (business-model/09_moat.md §3): g = 2.06%
  using LTM ROIC 7.56% (moat §3, Mar-2026):                              g = 1.87%
```
Chosen terminal g = **2.00%**, inside the 1.87%–2.06% financeable-growth band (gap ≤0.13pp, well within the ±1.5pp Gate-2 tolerance) — **not** an arbitrary macro-growth pick.

### Method 1 — Gordon growth (formal requirement; flagged UNRELIABLE at this WACC)
```
TV = FCFF_{n+1} / (WACC − g) = FCF_2030 × (1+g) / (WACC − g)
   = 17,172.5 × 1.02 / (0.041045 − 0.02000)
   = 17,516.0 / 0.021045
   = 832,304.7  (undiscounted)
PV(TV) = 832,304.7 × 0.8344 = 694,495.2
```
WACC − g = 2.105pp — clears the "must stay comfortably positive" bar in isolation, **but** the resulting terminal value implies an **EV/EBITDA multiple of 24.7x** on FY2030 terminal EBITDA (TV ÷ EBITDA_2030 = 832,304.7 ÷ 33,708.0). Haier's own trailing TEV/EBITDA has never exceeded 10.1x in the disclosed 2024Q4–2026Q2 history (§3), and named peers Midea/Gree trade on lower EBIT margins × comparable or lower multiples. **This fails the required cross-check ("the exit multiple implied by the Gordon TV should be sane for the business at maturity") outright** — it is a direct, mechanical consequence of the mechanically-low WACC (§3), not a modeling error in the cash-flow build. **Gordon-growth TV is therefore NOT used for the headline value** — shown here only because the method is formally required, and flagged unreliable.

### Method 2 — Exit multiple (**canonical, used for the headline value**)
```
TV = Terminal EBITDA × Exit multiple
Terminal EBITDA (FY2030) = EBIT(26,550.9) + D&A(7,157.2) = 33,708.0
Exit multiple = 7.0x — the midpoint of Haier's own trailing TEV/LTM EBITDA range over the last
  six disclosed quarters (5.9x–10.1x, `Financials.xls` Multiples tab), reflecting a mature,
  no-longer-fast-growing, margin-compressed profile — not the cyclical-peak multiple
TV = 33,708.0 × 7.0 = 235,956.3  (undiscounted)
PV(TV) = 235,956.3 × 0.8344 = 196,887.7
```

- **Terminal value (undiscounted): CNY 235,956.3mn** (exit-multiple, canonical)
- **PV of terminal value: CNY 196,887.7mn**
- **Terminal value as % of total EV: 74.94%** (canonical exit-multiple EV = 262,828.2 — see §6) — **just under the 75% terminal-dominated flag threshold; flagged as near-threshold, not clear of it.** On the Gordon-growth basis, TV is 91.33% of EV — clearly terminal-dominated and a second, independent reason that method is not used for the headline.

### Structural-decline / runoff terminal (trigger fired — `CLAUDE.md` §24 Filter 5 / avoid-ruin)

`business-model/09_moat.md` §5 verdict: **"Moat trajectory: eroding"** — gross margin down 460bp over five years (30.9%→26.3%), ROIC declining for two consecutive readings from its FY2024 peak (9.12%→7.97%→7.56%). This fires the §5 declining-perpetuity trigger. (Business-quality's rate-of-change score, 72/100, is above the 40 disruption threshold, so this is a competitive/cost-erosion trigger, not a disruption trigger — the runoff below models slow structural decay, not a technology wipeout.)

Runoff assumptions (all analyst assumption, labeled): revenue growth cut to roughly half the consensus path (demand destruction under continued price war + subsidy-cliff + tariff persistence); EBIT margin fades from 6.20% (FY2026) to **5.00%** by FY2030 — **below** the company's own FY2021 trough (5.91%), i.e. a genuinely non-recovering base, not just "below peak"; gross margin fades further (25.0%→23.8%); capex pulled back (2.90%→2.50% of revenue); working capital deteriorates faster (CCC: +6.0d→+30.0d) reflecting tighter supplier terms and stretched receivables in a stressed scenario.

```
Sum PV explicit FCF (runoff) = 35,275.4
Terminal FCF (FY2030, runoff) = 9,271.0
g_decline = −1.0% (nominal, below China CPI inflation ~1–2%, trending negative — a genuine runoff,
  not merely a fade — same nominal basis as the rest of this model, no real-rate substitution)
WACC − g_decline = 4.1045% − (−1.0%) = 5.105pp  (comfortably positive — a declining g moves AWAY from the WACC, resolving the §5 near-convergence risk that affects the base case)
TV (undiscounted) = 9,178.3 / 0.05105 = 179,807.1
PV(TV) = 150,035.4
EV (runoff) = 35,275.4 + 150,035.4 = 185,310.8   (TV = 81.0% of EV)
Equity (runoff) = 185,310.8 + 24,598.67 − 9,606.03 = 200,303.4
Per-share (runoff, Gordon) = 200,303.4 / 9,311.825848 = CNY 21.51   (−1.1% vs price CNY 21.75)

Exit-multiple cross-check (runoff): terminal EBITDA = 23,440.1; 5.0x (below Haier's own low-end
  trading range, reflecting a de-rated, impaired franchise) → TV = 117,200.7; PV(TV) = 97,795.1;
  EV = 133,070.5; Equity = 148,063.1; Per-share = CNY 15.90   (−26.9% vs price)
```

**This runoff case is the structural-reset BEAR input for `07_scenario-and-fair-value` and the master synthesizer's §24 Kill Criteria — it does not replace the base-case intrinsic value in §6 below.** It shows the DCF-side floor if the moat's already-observed erosion continues without stabilizing, spanning CNY 15.90 (exit-multiple read) to CNY 21.51 (Gordon read) — i.e., roughly flat to −27% from the current price, not a catastrophic wipeout, consistent with Haier's net-cash balance sheet and diversified geographic base limiting (not eliminating) downside.

---

## 6. DCF Output

**Canonical basis: exit-multiple terminal (7.0x terminal EBITDA), WACC = 4.10%.**

| Step | Value (CNY mn) |
|---|---:|
| PV of explicit FCFs | 65,940.6 |
| + PV of terminal value (exit-multiple, 7.0x) | 196,887.7 |
| **= Enterprise value** | **262,828.2** |
| − Net debt (broad, canonical, net CASH; `01` §5, Mar-31-2026) | −(−24,598.67) = +24,598.67 |
| − Minority interest (`01` §4) | −9,606.03 |
| − Preferred equity | 0.00 |
| **= Equity value** | **277,820.9** |
| ÷ Diluted weighted-average shares (`01` §2) | 9,311.825848 million |
| **= Intrinsic value per share** | **CNY 29.84** |
| vs current price (CNY 21.75, 2026-08-12) | **+37.2%** |

Executed output:
```
Exit-multiple EV (canonical base): EV=262828.2 -> Equity=277820.9
  (EV - NetDebt(-24598.7) - Minority(9606.0)) -> Per-share=29.84
Current price = CNY 21.75 (2026-08-12)
Implied upside (exit-multiple base): 37.2%
```

**Memo — Gordon-growth basis (NOT the headline, shown per format requirement, flagged unreliable per §5):** EV CNY 760,435.8mn → equity CNY 775,428.4mn → CNY 83.27/share (+282.9% vs price). This number is not decision-useful — it is a direct artifact of discounting at a WACC (4.10%) that is only ~2.1pp above even a conservative 2.0% terminal growth rate, and it implies a 24.7x terminal EV/EBITDA multiple against a stock that has never traded above 10.1x. It is disclosed for transparency, not used anywhere in §7–§8.

---

## 7. Sensitivity Grid (per-share intrinsic value)

**Primary grid — exit multiple (canonical method), WACC across columns, terminal EV/EBITDA multiple down rows:**

| | WACC 3.10% (−1%) | WACC 4.10% (base) | WACC 5.10% (+1%) |
|---|---:|---:|---:|
| 8.0x | 34.11 | 32.86 | 31.67 |
| 7.0x (base) | 30.95 | **29.84** | 28.77 |
| 6.0x | 27.80 | 26.81 | 25.88 |

Range across the full grid: **CNY 25.88 – 34.11/share** — every cell sits above the current price (CNY 21.75), giving a base-case-method margin-of-safety-positive read even at the low end of the grid.

**Secondary grid — Gordon growth (illustrative only, NOT used for the headline; shown to make the §3 WACC fragility explicit, per the required-grid format):**

| | WACC 3.10% (−1%) | WACC 4.10% (base) | WACC 5.10% (+1%) |
|---|---:|---:|---:|
| g = 2.50% | 281.37 | 106.99 | 66.53 |
| g = 2.00% (base) | 157.28 | 83.27 | 56.95 |
| g = 1.50% | 110.54 | 68.66 | 50.03 |

Every cell in this grid implies a terminal EV/EBITDA multiple far above Haier's own trading history (roughly 15x–70x, back-solved) — **none of these values is treated as a plausible fair-value estimate.** This grid exists only to document, transparently, why the Gordon-growth method is unusable at this WACC and to justify the shift to the exit-multiple canonical basis above.

---

## 8. Intrinsic Read

**Base-case intrinsic value: CNY 29.84/share** (exit-multiple DCF, 7.0x terminal EV/EBITDA, WACC 4.10%), **+37.2% above the CNY 21.75 current price.** The primary sensitivity grid (§7) shows this point is not fragile to reasonable WACC/multiple moves — the full range is CNY 25.88–34.11, all above the current price — but it IS highly sensitive to which terminal *method* is used: the formally-required Gordon-growth calculation, run at the same mechanically-correct WACC, produces an unusable CNY 68–107/share because Haier's China-sourced CAPM inputs (a sub-2% sovereign yield and a 0.46 beta) generate a WACC well below the discount rate the market visibly applies to this stock (its own trading multiple has never exceeded 10.1x EV/EBITDA, yet Gordon growth at a conservative 2.0% terminal g implies 24.7x). **The single assumption this value is most sensitive to is therefore not WACC or terminal growth individually, but the choice of terminal METHOD** — Gordon growth is mathematically live but economically unusable at this company's mechanical WACC, and every base-case number in this report rests on substituting an exit multiple anchored to Haier's own trading history instead. A separate, explicitly-labeled structural-decline/runoff terminal (triggered by the moat module's "eroding" trajectory finding) produces CNY 15.90–21.51/share — roughly flat to −27% from the current price — and is the bear-case input for `07_scenario-and-fair-value`, not a replacement for the CNY 29.84 base point above.

