# Earnings Sensitivity — HAIER

## 1. Variable Selection

Seven variables are selected, all traced to the highest-magnitude rows in `02_revenue-drivers.md` and `03_margin-drivers.md`: (1) raw-material commodity cost inflation — margin-drivers' own "single biggest margin driver" (§8), rated High magnitude and worth -178bps of revenue before mitigation; (2) China domestic demand (subsidy fade + real-estate cycle) — revenue-drivers' own "single biggest revenue driver" (§7), rated High magnitude at 48.5% of FY2025 revenue; (3) North America demand (tariffs + the Q1 2026 weather shock) — rated High magnitude at 26.4% of FY2025 revenue; (4) the company's own cost-reduction program's offset effectiveness — the single largest tailwind line in the margin bridge (+128.4bps, margin-drivers §7), and therefore the mirror-image risk to variable (1); and three company-disclosed financial sensitivities carried over from the business-model `10_external-dependency.md` note-43 table — (5) interest rate on floating-rate borrowings, (6) RMB vs USD, and (7) RMB vs EUR. China price competition and Air Solutions' segment-specific margin decline were considered but folded into variables (1) and (2) respectively, since both are driven by the same underlying commodity/demand mechanics already captured. FX and interest-rate sensitivities are small in absolute RMB terms but are included because they are the only company-disclosed, audited per-unit rates in the pool — everything else here is this agent's own derived coefficient (labelled).

---

## 2. Sensitivity Table

**Basis note:** "EBITDA Impact" below is a pre-tax, EBITDA-equivalent gross-profit flow-through (variables 1–4), computed by this agent from the company's own filed cost/revenue tables — it is a derived estimate, not a company-disclosed EBITDA sensitivity (Haier discloses no company-wide commodity-sensitivity table, per `10_external-dependency.md` §2, and EBITDA itself is a CapIQ-derived, non-GAAP construct per `01_historical-financials.md` §1). Variables 5–7 are company-disclosed sensitivities on **pre-tax profit** (FX) or **after-tax net profit** (interest rate) — a different metric level than EBITDA, labelled explicitly per CLAUDE.md §15; they are not summed with variables 1–4. Approximate EPS-equivalent figures in parentheses use a labelled 25% statutory PRC tax-rate assumption (Inference, not from filings — the company does not disclose its effective tax rate in this pool) applied to the pre-tax RMB mn figure, divided by the FY2025 weighted-average diluted share count of 9,310.9mn [`01_historical-financials.md` §3, fn.5]. Interest-rate impact is already after-tax as disclosed, so no further tax adjustment is applied to it.

| Variable | Base Case | Move Basis | Bull Case | EPS/EBITDA Impact (bull) | Bear Case | EPS/EBITDA Impact (bear) | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|
| Raw-material commodity cost inflation (steel, aluminium, copper, plastics/foam) | FY2025 raw-material $ grew +7.46% YoY vs appliance-segment revenue +3.77% — a 3.69pp "excess" cost-growth rate | Historical observed range — FY2025's own realized excess growth, reversed (bull) or doubled (bear) | Excess growth reverts to 0pp (costs grow only with volume) | +RMB5,350mn EBITDA (~+RMB0.43 EPS, inferred) | Excess growth doubles to 7.4pp (Q4 2025 copper/bulk-material trend persists and worsens) | −RMB5,350mn EBITDA (~−RMB0.43 EPS, inferred) | Medium | `03_margin-drivers.md` §7 (FY2025 Annual Report (SSE, CAS), p.42, computed) |
| China domestic demand (trade-in subsidy fade + real-estate cycle) | 48.5% of FY2025 revenue (RMB146,555mn); FY2025 growth +3.06% YoY; Q1 2026 industry retail (ex-3C) −6.2% YoY (AVC) | Company-cited industry data (AVC) extended to a full-year scenario — Inference for the specific bull/bear magnitudes | Partial recovery to +5% YoY revenue growth | +RMB2,111mn EBITDA-equivalent gross profit (~+RMB0.17 EPS, inferred) | Persistent −10% YoY revenue decline (Q1 2026 pace sustained) | −RMB4,222mn EBITDA-equivalent gross profit (~−RMB0.34 EPS, inferred) | Medium | `02_revenue-drivers.md` §4 (2026 First Quarter Report, p.3, AVC data); China gross margin 28.81% [`03_margin-drivers.md` §7] |
| North America demand (tariffs + Q1 2026 weather shock) | 26.4% of FY2025 revenue (RMB79,871mn); FY2025 Americas growth +0.43% (roughly flat); Q1 2026 US industry demand −10% YoY (AHAM) | Company-cited industry data (AHAM), Q1 2026 pace extended — Inference for magnitudes | Reverts to +5% YoY (weather normalizes, tariff impact "gradually eases" per management's stated 2026 expectation) | +RMB1,066mn EBITDA-equivalent gross profit (~+RMB0.09 EPS, inferred) | Persistent −10% YoY (tariffs/weather-linked weakness continues) | −RMB2,133mn EBITDA-equivalent gross profit (~−RMB0.17 EPS, inferred) | Low | `02_revenue-drivers.md` §4 (2026 First Quarter Report, p.3–4, AHAM data); group gross margin 26.7% used as proxy (no NA-segment margin disclosed) |
| Cost-reduction program effectiveness ("极致成本战略" — the offsetting "other cost items" line) | FY2025 offset RMB3,858.5mn (128.4bps of revenue); this line fell −19.46% YoY vs a revenue-scaled counterfactual | Historical observed — FY2025's own realized offset, deepened (bull) or reversed to zero (bear) | Offset deepens ~50% to RMB5,788mn (line falls to ~−31.1% YoY) | +RMB1,929mn EBITDA (~+RMB0.16 EPS, inferred) | Offset reverts to zero (line grows in line with revenue, +3.77% YoY, no further net reduction) | −RMB3,859mn EBITDA (~−RMB0.31 EPS, inferred) | Low | `03_margin-drivers.md` §7 (FY2025 Annual Report (SSE, CAS), p.42, computed); §8 flags this offset as "not guaranteed to repeat" |
| Interest rate on floating-rate borrowings | 70% of FY2025 borrowings floating-rate (RMB25,468mn of RMB36,382mn) | Company-disclosed sensitivity | −1 percentage point | +RMB273mn after-tax net profit (~+RMB0.03 EPS) | +1 percentage point | −RMB273mn after-tax net profit (~−RMB0.03 EPS) | High | `10_external-dependency.md` §2 (FY2025 Annual Report (HKEX, IFRS), Note 43, p.301) |
| RMB vs USD | ~51% of revenue overseas; USD is one of the main transactional exposure currencies | Company-disclosed sensitivity | −5% RMB (depreciation) | +RMB128mn pre-tax profit (~+RMB0.01 EPS, inferred) | +5% RMB (appreciation) | −RMB128mn pre-tax profit (~−RMB0.01 EPS, inferred) | High | `10_external-dependency.md` §2 (FY2025 Annual Report (HKEX, IFRS), Note 43, p.300) |
| RMB vs EUR | Europe is 12.7% of FY2025 revenue (RMB38,491mn) | Company-disclosed sensitivity | −5% RMB (depreciation) | +RMB94mn pre-tax profit (~+RMB0.01 EPS, inferred) | +5% RMB (appreciation) | −RMB94mn pre-tax profit (~−RMB0.01 EPS, inferred) | High | `10_external-dependency.md` §2 (FY2025 Annual Report (HKEX, IFRS), Note 43, p.300) |

---

## 3. Sensitivity Ranking

Ranked by the average of |bull| and |bear| impact, on the EBITDA-equivalent / disclosed-metric basis shown in §2 (rows 1–4 are pre-tax EBITDA-equivalent; rows 5–7 are pre-tax or after-tax profit — a smaller, different metric base, flagged, not blended into rows 1–4's ranking logic beyond ordering by magnitude).

| Rank | Variable | Absolute Impact (avg of bull + bear) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | Raw-material commodity cost inflation | RMB5,350mn | Headwind — Q4 2025 copper/bulk-material rises cited by the company as ongoing |
| 2 | China domestic demand (subsidy fade + real estate) | RMB3,166.5mn | Deteriorating — Q1 2026 industry retail −6.2% YoY, management flags a "high base" pressuring 2026 |
| 3 | Cost-reduction program effectiveness | RMB2,893.75mn | Currently a tailwind, but management-dependent and "not guaranteed to repeat" (`03_margin-drivers.md` §8) |
| 4 | North America demand (tariffs + weather) | RMB1,599.5mn | Deteriorating, but company frames the Q1 2026 driver as one-time (weather); tariff piece more persistent |
| 5 | Interest rate on floating-rate borrowings | RMB273mn | Stable — no rate-move signal in this pool |
| 6 | RMB vs USD | RMB128mn | RMB appreciated in Q1 2026 (per the finance-expense-ratio reversal noted in `03_margin-drivers.md` §2) — a headwind direction |
| 7 | RMB vs EUR | RMB94mn | Not separately trended in this pool for the latest quarter |

---

## 4. The Single Highest-Sensitivity Variable

**Raw-material commodity cost inflation** moves earnings the most. Its current direction is a headwind: the company's own MD&A attributes FY2025's -110bps gross-margin decline specifically to "Q4 rises in copper and other bulk materials" [`03_margin-drivers.md` §3, §8], and raw materials now sit at 84.0% of the appliance segments' cost of sales, the highest share in the disclosed history. It is externally driven — Haier does not set steel, aluminium, or copper prices — though the company partially manages the exposure through commodity-futures hedging and supplier "volume-price betting" (`03_margin-drivers.md` §2). For it to swing to the adverse case, two things need to happen together, and the first has already been observed once: (1) global base-metal prices continue rising at or above the pace seen in Q4 2025 (external market data cited in this analysis — not from Haier's own filings — shows LME copper alone moved 19–42% over calendar 2025, illustrating the potential range even though Haier's blended, partially-hedged basket would likely see a damped version of that swing), and (2) the company's own cost-reduction program (variable 4, ranked 3rd) fails to widen its offset at the same pace it did in FY2025 — i.e., variables 1 and 3 move against each other rather than variable 4 continuing to absorb the shock as it did last year.

---

## 5. Interaction Effects

Three pairs of variables in this table are not independent. First, **raw-material cost inflation and the cost-reduction program (variables 1 and 4) are mechanically linked, not additive** — the program exists specifically to offset commodity swings, so a bear case for one is more likely alongside a bear case for the other if the program's capacity to keep pace is exhausted; the two should be read as a single combined exposure, not summed as if independent. Second, **raw-material cost inflation and China domestic price competition interact** — margin-drivers §5 shows both hit gross margin in the same direction in FY2025 (rising input costs plus an industry-wide ASP decline the company attributes to "intensifying domestic competition"), so a commodity-cost shock landing during an already-competitive China pricing environment would compound rather than net out. Third, **China domestic demand and raw-material costs both feed off the same real-estate/subsidy macro cycle in one direction only for China** (a property-market downturn depresses both appliance replacement demand and, less directly, broader industrial commodity demand) — this is Inference, not from filings, and is not a mechanism Haier's own disclosures link explicitly. FX and commodity costs may also correlate in principle (globally-traded metals are USD-priced, so RMB depreciation would raise RMB-denominated input costs at the same time it helps translated overseas revenue) — this is Inference, not from filings, and the company's disclosed hedging programs for FX and commodities are managed separately, so no confirmed linkage exists in the pool.

---

## 6. Non-Linear Or Asymmetric Risks

- **Operating deleverage on China volume declines.** SG&A does not scale down proportionately with lower China revenue. The Q1 2026 admin-expense ratio worsened 80bps year-on-year, which the company partly attributes to "de-leveraging on lower volume" itself [`03_margin-drivers.md` §5]. This means the China domestic demand bear case in §2 (a pure gross-margin flow-through) likely **understates** the true EBITDA hit — a disclosed non-linearity this agent's linear estimate does not capture.
- **No pass-through mechanism for commodity costs.** Business-model `06_value-chain.md` confirms Haier has no escalator, indexed-pricing, or cost-plus clause with any customer. Input-cost increases are absorbed, not passed through — evidenced by two consecutive periods (FY2025 and Q1 2026) where gross margin fell for the same stated reason [`03_margin-drivers.md` §3]. This makes the raw-material bear case a near-direct hit to margin with no offsetting price lever, while the bull case (falling input costs) is not guaranteed to be fully retained either, since China's competitive pricing environment could force any cost-decline windfall back out via ASP cuts — an asymmetry against the bull case that the linear coefficient in §2 does not model.
- **Tariff policy moves in discrete steps, not smoothly.** The North America variable's Q1 2026 weakness combines a dated one-time weather shock with a tariff-cost increase; tariff RATES can jump by policy announcement rather than drifting continuously, so the true downside beyond the ±10% range modelled in §2 is not necessarily linear.
- **The disclosed FX sensitivity table is narrower than the real exposure.** `10_external-dependency.md` §2 states plainly that the company's ±5% FX sensitivity table "only covers monetary assets/liabilities at period-end, not full P&L/margin translation exposure" — and FY2025's finance-expense ratio moved 36bps on Euro appreciation alone, a P&L effect the static table would not have predicted. The RMB/USD and RMB/EUR rows in §2 should be read as a floor on FX sensitivity, not a ceiling.

---

## 7. Earnings Volatility Score

**62/100** (inverted scale — higher = worse / more sensitive). One-line reason: three High-magnitude variables (raw-material costs, China domestic demand, and the cost-reduction program that offsets the first) can each swing EBITDA by roughly 10–20% of its FY2025 base (RMB26,543.4mn) on realistic single-year moves, and two disclosed non-linearities (operating deleverage on China volume, an FX sensitivity table that covers only monetary positions, not full P&L translation) mean the linear estimates in §2 likely understate rather than overstate the true downside — but active, evidenced mitigation (commodity hedging, a cost-reduction program that offset 72% of FY2025's raw-material headwind, and revenue diversified across 8+ geographic regions per `02_revenue-drivers.md` §3) keeps this out of the 81–100 "dominated by external variables" band.

---

## Citations

[1] `analyses/HAIER_2026-08-13/earnings/01_historical-financials.md`
[2] `analyses/HAIER_2026-08-13/earnings/02_revenue-drivers.md`
[3] `analyses/HAIER_2026-08-13/earnings/03_margin-drivers.md`
[4] `analyses/HAIER_2026-08-13/business-model/10_external-dependency.md`
[5] FY2025 Annual Report (A-share/CAS), 海尔智家股份有限公司2025年年度报告, filed 2026-03-26, p.42
[6] FY2025 Annual Report (H-share/IFRS), filed 2026-04-27, Note 43, pp.299-301
[7] 2026 First Quarter Report (Q1 2026, CAS, unaudited), filed 2026-04-27, pp.2-5
[8] Web: Barchart, "Base Metals in Q4 and 2025 — What Are the Prospects for Q1 2026 and Beyond," 2026 (unverified, dated — used only for illustrative commodity-price-volatility context, not as a cited RMB figure)
