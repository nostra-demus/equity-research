# Earnings Sensitivity — EMAR (Emaar Properties PJSC, DFM:EMAAR)

**Reporting standard:** IFRS | **Currency:** AED millions | **Fiscal year end:** 31 December
**Jurisdiction:** UAE — DFM/DFSA listing rules
**Run date:** 2026-06-22
**Baseline:** FY2025 EPS (diluted) AED 1.99; FY2025 EBITDA AED 24,132M (Capital IQ basis) / AED 25,561M (company-adjusted basis)

**Upstream inputs used:**
- `analyses/EMAR_2026-06-22/earnings/01_historical-financials.md` — REQUIRED (present)
- `analyses/EMAR_2026-06-22/earnings/02_revenue-drivers.md` — REQUIRED (present)
- `analyses/EMAR_2026-06-22/earnings/03_margin-drivers.md` — REQUIRED (present)
- `analyses/EMAR_2026-06-22/business-model/10_external-dependency.md` — optional cross-module (present, used)

No data-sufficiency degradation. All required upstreams are present.

---

## 1. Variable Selection

The six variables selected were drawn from the driver magnitude ratings in the revenue-drivers (02) and margin-drivers (03) upstream outputs, cross-checked against the external-dependency (10) module's dependency table.

**UAE Development backlog burn pace** (magnitude: High in 02) and **construction cost inflation** (magnitude: High in 03) together control the majority of group EBITDA, both via revenue timing and margin compression within the locked-in off-plan backlog of AED 134.3 billion. **New property sales in UAE** (magnitude: High in 02) is the leading indicator for revenue 3–6 years forward and is the variable that would stop backlog growth. **POC project mix** (which projects reach delivery milestones in a given year) is rated High in 03 because the Q3 2023 example showed a >10 percentage-point gross margin swing from mix alone. **UAE Corporate Tax / DMTT** (magnitude: High in 03 at the net level) is already a permanent structural change, but the rate trajectory is government-controlled and could move again — this is included because it is the single variable that caused a 1,370 basis-point net margin collapse in FY2025 and is entirely outside management's control. **EGP/AED exchange rate** is included from the external-dependency module's disclosed sensitivity (Note 34, FY2024 Annual Report), where a 10% EGP move produces AED 324 million of net income impact — the only externally-driven, company-disclosed sensitivity above 1% of net profit. A sixth candidate — interest rates — was reviewed and excluded because the filing's own sensitivity shows AED 30 million per ±100 basis points, less than 0.2% of net profit, confirming it is immaterial to earnings.

The five variables selected span the company-disclosed sensitivity (EGP/AED), historical-observed range (construction costs, POC mix, new property sales), and inference (delivery pace, corporate tax). All connect directly to a driver rated in 02 or 03 — none are invented.

---

## 2. Sensitivity Table

*(Inverted score warning does NOT apply here — this table reports impact magnitude, not a score. Confidence column definitions: High = company-disclosed; Medium = historical observed range; Low = inferred.)*

| Variable | Base Case | Move Basis | Bull Case | EPS/EBITDA Impact (bull) | Bear Case | EPS/EBITDA Impact (bear) | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|
| **UAE Development backlog burn pace** (delivery pace and POC milestone timing) | 6,129 units delivered in FY2025; Q4 contributes ~33% of annual revenue | Historical observed range: FY2024→FY2025 delivery accelerated +45%; Q4 disruption historically shifts AED 3–4 Bn revenue to the next year | +15% acceleration in FY2026 unit deliveries (~700 more units; reflects catch-up on large construction pipeline) | EBITDA +AED ~2,700M (+11%); EPS +AED ~0.18 (+9%) | Q4 construction delay across 3–4 major projects shifting ~10% of annual revenue to the next year | EBITDA −AED ~2,400M (−10%); EPS −AED ~0.16 (−8%) | Low — Inference, not from filings; delivery pace is not separately sensitised in any filing. Computed from UAE Development revenue (AED 36,443M FY2025) × delivery change × ~50% gross margin and ~46% EBITDA margin; tax-affected for EPS. | [02_revenue-drivers, Section 4 (delivery pace, magnitude: High); 01_historical-financials, Section 5 (Q4 seasonality)] |
| **UAE Development construction cost inflation vs locked-in selling prices** | UAE Dev gross margin ~50% in FY2025 (down from 52% in FY2024); costs are rising against prices locked in at off-plan booking 3–6 years ago | Historical range: UAE Dev gross margin moved from 52% (FY2024) to 50% (FY2025) — 200 bps in one year; project-level margins range from 27% to 61% per slide 19 | Construction cost stability / input cost relief: gross margin recovers to 52% (+200 bps on UAE Dev) | EBITDA +AED ~730M (+3%); EPS +AED ~0.05 (+2.5%) | Sustained 5% construction cost surge compresses UAE Dev gross margin by a further 250 bps to ~47.5% (below prior trough at project-mix level) | EBITDA −AED ~910M (−4%); EPS −AED ~0.06 (−3%) | Medium — historical observed range for the gross margin compression; no company-disclosed construction cost sensitivity table in any filing. Impact derived from: 200 bps × UAE Dev revenue AED 36,443M = AED 729M EBITDA impact; tax-affected for EPS. | [03_margin-drivers, Section 5 (construction cost row, magnitude: High); 02_revenue-drivers, Section 5 (UAE Dev gross margin table); FY2025 Investor Presentation, Feb-12-2026, slide 16] |
| **New UAE property sales (AED value — sets revenue backlog 3–6 years forward)** | AED 71.1 Bn in FY2025 (+9% YoY); unit volume 13,905 (−27% YoY but higher ASP); Q4 2025 sales were −18% vs Q4 2024 — first YoY quarterly decline | Historical range: FY2021→FY2025 annual sales ranged from AED ~30 Bn (FY2021 trough) to AED 71.1 Bn (FY2025); a 30–40% AED-value decline occurred in 2019–2020 cycle trough | +15% increase in FY2026 new sales (AED ~82 Bn) — backlog grows further, supporting revenue through FY2029–2030 | No FY2026 or FY2027 EBITDA/EPS impact (3–6 year recognition lag); FY2028+ revenue floor rises by ~AED 11 Bn | −30% fall in new sales (AED ~50 Bn in FY2026) — sustained for 2+ years, this halts backlog accumulation and risks revenue plateau from FY2028 onward | No FY2026 or FY2027 EBITDA/EPS impact (backlog of AED 134.3 Bn already provides 3.7x FY2025 UAE Dev revenue cover); FY2028 EBITDA at risk: −AED ~4,500M if new-sales drought persists 2 years (Inference, not from filings; estimated at FY2025 EBITDA margin × lost revenue volume) | Low — The 3–6 year lag means the near-term EPS/EBITDA impact is not quantifiable in isolation; the effect is deferred. Reported here because it is the most important leading indicator and the highest long-run earnings risk. | [02_revenue-drivers, Section 4 (new sales, magnitude: High); 10_external-dependency, Section 5 (single biggest lever); FY2025 Investor Presentation, slides 11, 17] |
| **POC project mix (which specific projects reach IFRS 15 milestones in a given year)** | FY2025 EBITDA margin 48.7% (CIQ basis); project-level gross margins range from 27% (The Oasis EP) to 61% (Emirates Living) | Historical observed range: Q3-2023 quarterly gross margin hit 75.8% and full-year EBITDA margin reached 53.8% — a +500 bps swing vs FY2024–FY2025 run-rate, driven entirely by which projects completed milestones in that quarter | High-margin project cohort (Emirates Living / Downtown legacy projects) dominates FY2026 delivery slate: EBITDA margin widens to ~52% | EBITDA +AED ~1,600M (+7%); EPS +AED ~0.11 (+5.5%) | Lower-margin new projects (The Oasis, newer launches at ~27–35% gross margin) dominate FY2026 milestone slate: EBITDA margin narrows to ~45% | EBITDA −AED ~900M (−4%); EPS −AED ~0.06 (−3%) | Low — Emaar does not disclose which projects are scheduled to hit milestones in coming quarters. Project-level gross margin mix is stated in the investor presentation (slide 19) but forward delivery allocation is not disclosed. Magnitude estimation: ±300 bps EBITDA margin on AED ~52 Bn TTM revenue. Inference, not from filings. | [03_margin-drivers, Section 5 (POC project mix row, magnitude: High, Unknown direction); 01_historical-financials, Section 1 (FY2023 margin anomaly); FY2025 Investor Presentation, Feb-12-2026, slide 19] |
| **UAE Corporate Tax rate (9% CIT) and Domestic Minimum Top-Up Tax (DMTT, 15%)** | CIT 9% from FY2024; DMTT 15% from FY2025; effective tax rate rose to 13.0% in FY2025 (from 7.7% in FY2024 and near-zero in FY2023); FY2025 tax expense AED 3,331M | Historical range: the step-up was government-imposed and permanent; prior regime was near-zero. International context: DMTT aligns UAE to OECD Pillar Two minimum (15%); further rate changes are policy-driven | DMTT relief or OECD Pillar Two carve-outs lower effective rate back to ~9% (CIT only, no DMTT): net profit benefit AED ~1,500–1,700M | EPS +AED ~0.12 to +AED ~0.14 (+6%–7%); EBITDA unaffected (tax is below EBITDA) | Further tax rate increase — e.g. DMTT applies at 15% with broader scope, raising effective rate to ~16%: additional tax burden ~AED 700–900M | EPS −AED ~0.06 to −AED ~0.07 (−3%–4%); EBITDA unaffected | Medium — the current rate structure is clear and filed. The move size uses the difference between a 9%-only regime and the current ~13% regime, and a possible further step to ~16%. No further rate increase has been announced. Inference on direction of rate change. | [03_margin-drivers, Section 2 (tax row, magnitude: High); 01_historical-financials, Section 6 (tax inflection points); FY2025 Investor Presentation, slide 12; FY2024 Annual Report, Note 9 (Taxation)] |
| **EGP / AED exchange rate** | FY2025: AED 0.0746/EGP (Dec-2025) vs AED 0.0835/EGP (Dec-2024) — a 10.7% depreciation; Emaar Misr EBITDA fell from AED 1,559M (FY2024, incl. AED ~650M forex gain) to AED 479M (FY2025, incl. AED ~170M forex loss) | **Company-disclosed sensitivity (Note 34, FY2024 Annual Report, p.191):** a 10% change in EGP/AED rate impacts comprehensive income by AED 323,807k | EGP strengthens 10% vs AED (EGP revaluation / IMF program-driven recovery): P&L / comprehensive income impact | +AED 324M to comprehensive income (~2.4% of FY2024 net profit; ~1.5% of FY2025 net profit); EPS +AED ~0.02 (+~1%) | EGP depreciates a further 10% vs AED (second devaluation, consistent with IMF program risk): P&L / comprehensive income impact | −AED 324M to comprehensive income; EPS −AED ~0.02 (−~1%) | **High** — company-disclosed sensitivity from the audited FY2024 Annual Report, Note 34, p.191. The AED 323,807k figure is a filed sensitivity, not an estimate. | [FY2024 Annual Report (IFRS, audited, filed Mar-14-2025), Note 34 (Market Risk — FX Sensitivity Table), p.191; 10_external-dependency, Section 2] |

**Notes on unit consistency:**
- EBITDA impacts are in AED millions; EPS impacts are in AED per share (diluted, ~7.6 billion weighted-average diluted shares, consistent with FY2025 EPS AED 1.99 on net profit AED ~15,156M attributable to parent).
- EPS impacts for EBITDA-level drivers are computed as: EBITDA impact × (1 − effective tax rate of ~13%) × (EBITDA-to-net-income conversion factor), then divided by ~7.6 billion diluted shares. This is an approximation; precise EPS impact also depends on non-controlling interest allocation and below-EBITDA items.
- New property sales (variable 3): near-term EPS/EBITDA impact is not quantifiable due to the 3–6 year recognition lag. The deferred impact is stated in qualitative terms.

---

## 3. Sensitivity Ranking

*(Ranked by absolute EBITDA impact, averaged across bull and bear; new property sales excluded from ranking because the near-term impact is not quantifiable.)*

| Rank | Variable | Absolute EBITDA Impact (avg of bull + bear) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | UAE Development backlog burn pace (delivery pace / Q4 milestone timing) | ~AED 2,550M avg | Improving — delivery volumes accelerating (+45% FY2025 vs FY2024); Q4 is the key risk quarter |
| 2 | POC project mix (which projects reach IFRS 15 milestones) | ~AED 1,250M avg | Unknown — depends on which projects reach delivery milestones each year; direction is unforeseeable from available data |
| 3 | Construction cost inflation vs locked-in off-plan prices | ~AED 820M avg | Headwind — UAE Dev gross margin already fell 200 bps in FY2025; direction is persistent but slow-moving |
| 4 | UAE Corporate Tax / DMTT (rate and scope) | ~AED 750M avg net income (below EBITDA) | Headwind — permanent structural step-up already applied; further adverse move is possible but not announced |
| 5 | EGP / AED exchange rate | ~AED 324M (company-disclosed, comprehensive income) | Neutral-to-stabilising — EGP depreciation already largely absorbed in FY2025 base; no further devaluation confirmed |

*Note: new property sales is ranked separately — it is the single highest long-run earnings risk but produces no quantifiable FY2026/FY2027 EBITDA impact because of the backlog buffer.*

---

## 4. The Single Highest-Sensitivity Variable

**UAE Development backlog burn pace — specifically, the timing and volume of construction deliveries in Q4 — is the single variable that can move earnings the most in any given year.**

Q4 consistently accounts for ~33% of annual revenue (32.5% average over FY2023–FY2025). In absolute terms, Q4-2025 alone contributed AED 16,450M of revenue. A delay across a handful of major projects that pushes 10% of annual revenue out of one fiscal year causes an estimated AED ~2,400M EBITDA reduction — roughly equal to four full quarters of hospitality and entertainment profit combined. This variable is **partly company-controlled**: Emaar manages construction schedules, contractor relationships, and can accelerate or slow project delivery timelines. However, external shocks — labour availability, material supply disruptions, regulatory permit delays, or extreme weather — can override management's delivery plan. The current trend is accelerating delivery (6,129 UAE units in FY2025 vs 4,242 in FY2024), and 93% of units under construction are already sold, providing strong incentive to complete on schedule. The adverse case would require a systemic disruption to the construction pipeline — not a remote risk given 50,800+ units active — but not a base case given current momentum.

---

## 5. Interaction Effects

Two interaction effects are worth noting. First, **delivery pace and POC project mix interact mechanically**: which projects reach milestones fastest is not independent of which projects are being pushed hardest. If Emaar accelerates delivery on newer, lower-margin projects (The Oasis, recent launches) to hit volume targets, the bull case on delivery pace can simultaneously produce the bear case on POC project mix, partially offsetting the gross EBITDA uplift from higher delivery volumes. The net effect of a delivery acceleration scenario therefore depends on the project-specific margin of the units being accelerated, and available data does not permit decomposing this.

Second, **construction cost inflation and delivery pace compound**: a supply-side construction shock (e.g. a regional steel shortage or UAE labour cost surge) tends to simultaneously slow delivery timelines and push up costs, hitting EBITDA from both the margin and the revenue-timing direction at once. In an adverse construction environment, the bear case on delivery pace (~AED 2,400M EBITDA hit) and the bear case on construction cost inflation (~AED 910M hit) could materialise concurrently, producing a combined EBITDA headwind of up to ~AED 3,300M (roughly −14% vs the FY2025 base) — materially larger than either variable in isolation. The EGP and corporate tax variables are independent of each other and of the construction variables.

---

## 6. Non-Linear Or Asymmetric Risks

Two asymmetries are present.

**Construction cost pass-through lag creates a one-way trap for the existing backlog.** For the AED 134.3 billion UAE revenue backlog (all of which is at prices locked in at off-plan booking date), there is zero ability to recover construction cost increases from buyers. Prices are contractually fixed. This means cost inflation hits margins immediately as projects complete, but a subsequent cost reduction only helps new project launches (whose revenue will not appear for 3–6 years). The mechanism is structurally asymmetric: cost inflation hurts the existing backlog faster and more certainly than cost deflation helps it. A 5% construction cost surge translates to an irreversible, multi-year margin compression on the entire in-flight backlog; a 5% cost decline benefits only projects not yet in active construction.

**New property sales have a long lag but a cliff risk if the cycle turns.** A 30–40% drop in new UAE property sales in FY2026 has no immediate EBITDA impact because the AED 134.3 billion backlog funds revenue through FY2028–2029. But if new sales drop and stay low for 2–3 consecutive years, revenue would eventually cliff off — not gradually decline — because the backlog stop-filling and delivery pipeline runs dry at similar times. The asymmetry is that the revenue protection from the existing backlog creates false comfort: management has 2–3 years of early warning time, but if that window is not used to restock the backlog, the eventual revenue correction can be sharp rather than gradual. The Q4 2025 unit-volume decline (first meaningful YoY decline in the current cycle) is the earliest visible signal that this variable may be approaching a turn.

---

## 7. Earnings Volatility Score

**48 / 100** — higher = WORSE (inverted: a higher score means more volatile / sensitive earnings)

Emaar's earnings sit in the **material sensitivity** band (41–60): EBITDA is highly stable in the near term due to the backlog buffer (3.7x annual UAE Development revenue coverage), but is meaningfully exposed to two variables it cannot fully control — construction cost inflation and POC project mix — and one that it cannot control at all: government tax policy. The EGP sensitivity is company-disclosed and relatively small at group level. The biggest single swing (delivery pace) is partly controllable. What keeps the score below 60 is that the AED 134.3 billion UAE backlog provides multi-year revenue visibility that is genuinely unusual for a developer — the near-term earnings range is narrower than the driver table might suggest for a typical volume-price business — but the existence of two high-magnitude, poorly-forecastable variables (POC mix and construction cost trajectory) prevents a lower score.

**One-line reason:** The backlog mechanic provides strong near-term revenue floor, but EBITDA can still swing ±10% from delivery timing and project mix alone, and the tax regime is government-controlled and permanently less favourable since FY2025.

---

*Inferences are labeled throughout. Company-disclosed sensitivities from the FY2024 Annual Report (Note 34) are the highest-confidence items. All other impact estimates are derived from historical driver ranges and segment-level data from the FY2025 Investor Presentation (preliminary, unaudited).*
