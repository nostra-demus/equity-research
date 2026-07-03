# Earnings Sensitivity — EMAR (Emaar Properties PJSC)

**Reporting standard:** IFRS | **Currency:** AED millions | **Fiscal year end:** 31 December
**Baseline EPS (FY2025):** AED 1.99 diluted | **Baseline EBITDA (CIQ, FY2025):** AED 24,132 Mn
**Note (inverted score):** Earnings Volatility Score in Section 7 is higher = WORSE.

---

## 1. Variable Selection

The 3–7 variables were drawn directly from the driver tables in `02_revenue-drivers.md` and `03_margin-drivers.md`, using magnitude ratings to rank order. The highest-magnitude variables from those tables are: (1) UAE Development backlog / POC delivery pace (magnitude: High, from both revenue and margin driver tables); (2) new property sales / buyer demand (magnitude: High, revenue table); (3) construction cost inflation on backlog (magnitude: High, margin table); (4) the UAE tax regime — Corporate Tax (9%) and DMTT (15%) (magnitude: High, margin table); (5) IFRS 15 POC project-mix timing and seasonality (magnitude: High for quarterly volatility, margin and revenue tables); (6) the EGP/AED foreign exchange rate on Emaar Misr (magnitude: Mid, both tables); and (7) Emaar Malls rent per sq. ft. / occupancy (magnitude: Mid, revenue and margin tables). The `10_external-dependency.md` output flagged the Dubai property demand cycle as the single biggest external lever and endorsed construction cost and FX as secondary exposures — consistent with the variable selection here. No variables have been invented outside the upstream driver tables.

The full FY2025 audited Annual Report was not in the data pool at the date of this analysis; accordingly, the IFRS 7 market-risk sensitivity tables (which would contain company-disclosed FX and interest-rate quantitative sensitivities) are unavailable. Where company-disclosed sensitivity exists in the preliminary results filing or investor presentation, it is used and labelled High confidence. Otherwise, the historical observed range or filing-supported inference is used, labelled Medium or Low.

---

## 2. Sensitivity Table

| Variable | Base Case | Move Basis | Bull Case | EPS/EBITDA Impact (bull) | Bear Case | EPS/EBITDA Impact (bear) | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|
| UAE Development backlog POC delivery pace (construction milestone timing) | AED 36,443 Mn UAE Dev revenue in FY2025; delivery pace drives IFRS 15 recognition | Historical observed range: UAE Dev revenue growth ranged from −34% (FY2020 COVID) to +55% (FY2025); for near-term sensitivity, a delivery pace shift of ±15% on in-year POC release is realistic given Q4 concentration | +15% faster POC milestone certification → ~+AED 5.5 Bn additional revenue → ~+AED 2.5 Bn EBITDA at 46% UAE Dev margin | EBITDA +AED 2,500 Mn; EPS ~+AED 0.20 | −15% delivery delay across milestones → ~−AED 5.5 Bn revenue → ~−AED 2.5 Bn EBITDA | EBITDA −AED 2,500 Mn; EPS ~−AED 0.20 | Medium (historical range; no company-disclosed ±delivery sensitivity table available) | FY2025 Investor Presentation (Feb-12-2026), slide 16 (UAE Dev revenue AED 36,443 Mn); `01_historical-financials.md` §3 (Q4 captures 33% of annual revenue); `02_revenue-drivers.md` §8 (10–20% shift in POC pace moves revenue by AED 5–10 Bn) |
| New property sales / buyer demand (Dubai off-plan bookings) | AED 71.1 Bn UAE property sales in FY2025 (+9% vs FY2024); 13,905 units sold | Historical observed range: sales value ranged from AED ~30 Bn (FY2022) to AED 80.4 Bn (FY2025 total Dubai market); a ±20% move in new sales is realistic across a cycle | +20% new sales → ~+AED 14 Bn additional backlog accretion; impacts FY2028–2030 revenue, not current year directly | Revenue/EBITDA: Minimal impact on FY2026 earnings; backlog buffer means new-sales changes take 3–4 years to reach P&L. Inference | EBITDA FY2026: ~+AED 0 Mn (backlog buffer absorbs); FY2028+ impact material | −20% new sales → same logic; FY2026 EBITDA impact minimal; FY2028 revenue gap forms | EBITDA FY2026: ~−AED 0 Mn (absorbed by AED 134.3 Bn backlog) | Medium (structural: backlog mechanics delay impact) | `02_revenue-drivers.md` §7 (cycle position; AED 134.3 Bn backlog covers 3–4 years); `10_external-dependency.md` §5 (20% adverse demand move) |
| Construction cost inflation (contractor labour, steel, concrete) on AED 134.3 Bn UAE backlog | Gross margin achieved on backlog 46–47% (Dec-31-2025); locked at project launch prices | Historical / industry inference: Dubai construction cost inflation not quantified in available filings; FY2025 FY2024 Annual Report IFRS 7 sensitivity not yet filed; applying a ±10% cost move on the ~50% of backlog still under construction (construction portion of remaining cost) as a realistic but inferred range | −10% construction cost (lower material/labour prices): gross margin on delivery cohort improves by ~3–4 pp; ~+AED 500–700 Mn EBITDA per year (spread over 5–6 year delivery schedule; annual flow-through ~AED 150 Mn) | EBITDA +AED 150–200 Mn per year over delivery horizon; EPS ~+AED 0.01–0.02 per year | +10% construction cost inflation: gross margin on delivery cohort compresses by ~3–4 pp; ~−AED 500–700 Mn EBITDA per year | EBITDA −AED 150–200 Mn per year; EPS ~−AED 0.01–0.02 per year (annual; full impact over 5–6 years = AED 700–1,000 Mn total EBITDA erosion) | Low (inferred from disclosed backlog margin of 46–47% and construction cost proportion; no company-disclosed sensitivity; full IFRS 7 tables not yet filed) | FY2025 Investor Presentation, slide 19 (Gross Margin Achieved 46–47%); `03_margin-drivers.md` §8 (construction cost inflation single biggest margin risk); `06_value-chain.md`; Inference, not from filings for cost proportion |
| UAE tax regime — Corporate Tax (9%) + DMTT (15%) | Effective tax rate FY2025: 13.0%; tax expense AED 3,331 Mn on NPBT AED 25,657 Mn | Company-disclosed: DMTT applicable from FY2025 (footnote, investor deck); historical rate shift from 7.7% (FY2024) to 13.0% (FY2025) is disclosed; marginal range: ±2 pp effective tax rate on existing base | −2 pp effective tax rate (e.g. treaty relief, deductible cost uplift): tax expense falls by ~AED 513 Mn on AED 25.7 Bn NPBT | EPS +~AED 0.05 | +2 pp effective tax rate (OECD Pillar Two base erosion expansion, broader DMTT scope): tax rises by ~AED 513 Mn | EPS −~AED 0.05 | High (rate levels are company-disclosed; marginal move is inference) | FY2025 Investor Presentation, slide 12 (net profit AED 22,326 Mn; DMTT footnote); `01_historical-financials.md` §1 (effective tax rate history: 1.5% FY2023 → 7.7% FY2024 → 13.0% FY2025); `03_margin-drivers.md` §2 (−413 bps NP margin FY2024→FY2025 from DMTT) |
| IFRS 15 POC quarterly project-mix / seasonality (Q4 concentration) | Q4 captures 32–33% of annual revenue (FY2023–FY2025 average 32.5%); Q4-2025 AED 16,450 Mn = 33.2% of FY2025 | Historical observed range: Q4 revenue share ranged 31.3%–33.2% over FY2023–FY2025; within a year the quarterly margin can swing 300–500 bps based on which projects certify milestones | Q4 revenue share rises to 35% (upside project-mix: more high-margin villas certify in Q4) → ~+AED 750 Mn additional Q4 revenue vs base; at 50%+ EBITDA margin on the mix → ~+AED 375 Mn EBITDA | EBITDA +AED 375 Mn; EPS ~+AED 0.03 (annual Q4 beat) | Q4 revenue share falls to 30% (delivery delays, milestone shift into Q1 next year) → ~−AED 1,000–1,250 Mn revenue not recognized in year → ~−AED 500 Mn EBITDA | EBITDA −AED 500 Mn; EPS ~−AED 0.04 | Medium (historically observed quarterly range; not a formal disclosed sensitivity) | `01_historical-financials.md` §5 (Q4 seasonality table: 31.3%–33.2% revenue share; EBITDA margin range 47%–51%); `03_margin-drivers.md` §5 (POC timing: up to 500 bps swing in quarterly gross margin) |
| EGP/AED foreign exchange rate (Emaar Misr / Egypt) | AED 0.0746/EGP (Dec-2025); group FX gain/(loss) AED −260 Mn FY2025 vs AED +505 Mn FY2024 | Historical observed range: EGP depreciated ~10.7% vs AED in FY2025; in FY2024 the rate was AED 0.0835/EGP. A further ±10% EGP move (AED 0.0671–AED 0.0820/EGP) represents a realistic observed range | EGP strengthens 10% vs AED (AED 0.0820/EGP): Emaar Misr AED-translated revenues and EBITDA improve; ~+AED 170–200 Mn group EBITDA vs base (reversing the FY2025 FX loss) | EBITDA +AED 170–200 Mn; EPS ~+AED 0.01 | EGP weakens further 10% (AED 0.0671/EGP): additional AED forex loss at Emaar Misr ~−AED 150–170 Mn on top of existing FX loss position | EBITDA −AED 150–170 Mn; EPS ~−AED 0.01 | Medium (observed FY2024→FY2025 EGP/AED move of 10.7%; management discloses the FX loss line; no forward hedge disclosed) | FY2025 Investor Presentation, slide 21 (EGP/AED rate at Dec-2025 and Dec-2024; Emaar Misr FX loss AED ~170 Mn FY2025 vs gain AED ~650 Mn FY2024); `10_external-dependency.md` §2 |
| Emaar Malls rent per sq. ft. / occupancy | AED 657 psf (FY2025, owned portfolio), +4.8% YoY; occupancy >98%; Malls EBITDA AED 4,935 Mn at 86% margin (AED 5,754 Mn revenue) | Historical observed range: rent psf grew from AED 627 (FY2024) to AED 657 (FY2025), +4.8%; 10-year range AED 419 (2013) to AED 657 (2025). A ±5% rent move represents roughly one year of incremental reset direction | +5% rent per sq. ft. → ~+AED 288 Mn malls revenue → at 86% EBITDA margin → ~+AED 247 Mn EBITDA | EBITDA +AED 247 Mn; EPS ~+AED 0.02 | −5% rent decline (consumer spending correction, tenant distress) → ~−AED 288 Mn malls revenue → ~−AED 247 Mn EBITDA | EBITDA −AED 247 Mn; EPS ~−AED 0.02 | Medium (historical rent growth rate from 10-year chart; no company-disclosed rent sensitivity; occupancy ceiling limits volume upside) | FY2025 Investor Presentation, slide 22 (Malls: Revenue AED 5,754 Mn, EBITDA AED 4,935 Mn, 86% margin); slide 27 (Rent per sq ft AED 657; 10-year history) |

**Note on variable 2 (new property sales):** The impact on FY2026 earnings is near-zero because the AED 134.3 Bn UAE backlog provides a 3–4 year buffer between sales and recognised revenue. This variable belongs in the table because it is the highest-magnitude driver of long-term revenue, but it ranks low in any near-term (next-12-month) earnings sensitivity analysis. It is retained to avoid omitting a clearly identified high-importance driver.

---

## 3. Sensitivity Ranking

*Note: Rankings are by absolute EBITDA impact on a 12-month horizon. Variable 2 (new sales) is ranked separately as a structural variable with near-zero near-term impact.*

| Rank | Variable | Absolute Impact (avg of bull + bear, EBITDA) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | UAE Development backlog POC delivery pace | AED 2,500 Mn | Positive — delivery pace accelerating (FY2025: 6,129 units delivered vs 4,242 in FY2024); Q4 seasonal concentration creates upside risk |
| 2 | IFRS 15 POC quarterly project-mix / Q4 concentration | AED 438 Mn (avg of +375 / −500) | Neutral seasonal — Q4 consistently dominant; near-term risk is delivery delays pushing milestones into Q1 next year |
| 3 | Emaar Malls rent per sq. ft. / occupancy | AED 247 Mn | Positive — rent per sq. ft. growing 4–5% annually; occupancy at ceiling |
| 4 | UAE tax regime (Corporate Tax + DMTT) | AED 513 Mn (EPS basis: AED 0.05 × fully diluted shares ~11.2 Bn = AED 560 Mn) | Negative — already embedded; marginal risk of further OECD Pillar Two expansion |
| 5 | EGP/AED FX rate (Emaar Misr) | AED 183 Mn (avg of +185 / −160) | Negative — EGP still under pressure; no disclosed hedging |
| 6 | Construction cost inflation on backlog | AED 175 Mn per year (near-term annual flow-through); total over delivery horizon AED 700–1,000 Mn | Negative — Dubai building boom creating contractor cost pressure; disclosed backlog margin stable at 46–47% so far |
| — | New property sales / buyer demand | Near zero on FY2026 earnings; material from FY2028 onward | Positive — AED 71.1 Bn UAE sales in FY2025; Q1-2025 record quarterly level; volume softening (units down 27%) offset by ASP rise |

**Ranking note:** The UAE Development backlog POC delivery pace is the dominant variable by a wide margin — at AED 2,500 Mn EBITDA sensitivity, it is 5–6× the next-ranked variable. The tax regime impact is stated as an EPS effect (the DMTT compresses net profit, not EBITDA) and is therefore not directly comparable to EBITDA-basis rankings; on an EPS basis, a ±2 pp tax rate move equates to ~AED 513 Mn pre-tax (AED ~0.05 EPS impact), placing it between Ranks 3 and 4 on an EBITDA-equivalent basis.

---

## 4. The Single Highest-Sensitivity Variable

**The pace at which Emaar converts its AED 134.3 Bn UAE revenue backlog into recognised IFRS 15 revenue — through construction milestone certification — is the single variable that moves earnings the most.**

The current direction is positive: units delivered rose from 4,242 in FY2024 to 6,129 in FY2025 (+44%), and the Q4 POC pattern is accelerating as the 2021–2024 vintage of off-plan sales reaches construction completion. This variable is partly company-controlled (management sequences project launches and delivery timelines) and partly external (contractor capacity, building-material availability, government permitting speed). A ±15% shift in the annual rate of POC milestone certification moves EBITDA by approximately AED 2,500 Mn — equivalent to roughly 10% of FY2025 EBITDA — without any change in new sales. For the bear case to arrive: sustained construction slowdowns across the 50,800+ units under active development in the UAE (caused by contractor labour shortages, material cost disputes halting progress, or planning delays on large master-plan projects) would delay the quarterly certification of milestones. Because Q4 alone captures 32–33% of annual revenue through this mechanism, a disruption concentrated in Q4 milestone timing would have an outsized annual earnings effect — a Q4 delivery delay could shift AED 1–2 Bn of EBITDA from one year to the next with no change in underlying business value.

---

## 5. Interaction Effects

Two interaction effects are material and should be read together rather than independently.

First, the **backlog delivery pace and construction cost inflation compound each other**. A construction slowdown (the bear case for Variable 1) often arises from the same root cause as cost inflation (the bear case for Variable 6): contractor capacity tightness in a building boom. If Dubai's concurrent mega-projects (the AED 180 Bn Dubai Creek Harbour, the Al Maktoum Airport expansion, competitors' projects) strain labour supply, Emaar faces both slower delivery milestones AND higher contractor re-pricing simultaneously. In this compound scenario, EBITDA impact is not the sum of the two individual sensitivities (AED 2,500 + AED 175 Mn annually) applied independently — the delivery delay pushes the cost inflation into a compressed window, making the margin impact larger when units finally complete.

Second, **the Dubai property demand cycle (new sales) and POC delivery pace interact over a 3–4 year lag**. A demand decline in new sales today does not immediately cut EBITDA (the backlog absorbs it), but it reduces the future backlog accretion, meaning delivery pace will eventually slow as there are fewer units to build and deliver. The interaction creates a J-curve effect: near-term earnings stay high (backlog delivering), new sales slow (demand cycle peaks), then revenue falls 3–4 years later as the backlog depletes. This is not captured in the single-variable sensitivity table but is the key structural risk in the earnings outlook.

---

## 6. Non-Linear Or Asymmetric Risks

Three asymmetries are present in Emaar's sensitivity profile:

**1. Q4 concentration and delivery delay asymmetry (Variable 5 — POC timing):** Because Q4 captures 32–33% of annual revenue and EBITDA through IFRS 15 POC milestone timing, a delivery delay that pushes milestones into January (Q1 of the following year) creates a disproportionately large annual earnings miss. The upside is bounded (Q4 cannot easily exceed 35% share in a single year without a project-specific windfall), but the downside from a late Q4 delay is structurally larger. This is an asymmetric risk: a delay of a few weeks in construction certification can shift 2–3% of annual EBITDA from one year to the next.

**2. New sales to backlog to revenue: non-linear and lagged (Variable 2):** The backlog buffer creates a long, non-linear pathway from demand to earnings. A 30% decline in new sales does not produce a 30% EBITDA decline — it produces near-zero impact for 3 years, then a step-change decline as backlog depletes. The asymmetry is that investors may mis-price the lag: visible new-sales weakness years before the earnings impact arrives can depress the stock disproportionately (or be ignored too long if optimism prevails).

**3. EGP/AED FX: downside asymmetric (Variable 6):** The EGP has depreciated continuously against the AED since 2016. There is no structural reason for a sustained EGP strengthening; upside from EGP appreciation is historically rarer and shorter-lived than the downside from EGP depreciation. Emaar Misr's AED-reported EBITDA already collapsed from AED 1,559 Mn (96% margin, FY2024 — partly inflated by AED 650 Mn FX gain) to AED 479 Mn (31% margin, FY2025). If EGP depreciates a further 20–30%, the AED-translated EBITDA from Emaar Misr approaches zero or negative territory, removing a segment entirely from the earnings picture. The downside from further EGP weakness is therefore non-linear (can completely eliminate a segment's contribution) while the upside from EGP stability or modest strengthening is limited (already at suppressed margins).

---

## 7. Earnings Volatility Score

**Score: 38 / 100 (higher = WORSE — more volatile)**

**Band: Moderately stable — one or two variables matter but are manageable (21–40)**

**Reason:** Emaar's earnings are substantially insulated from short-term external volatility by two structural features — the AED 134.3 Bn revenue backlog (which locks in 3–4 years of revenue regardless of new sales), and the recurring-business EBITDA floor (Emaar Malls at 86% EBITDA margin contributing AED 4,935 Mn, Hospitality at 48% contributing AED 1,109 Mn). These together provide a durable base. The key swing variable — POC delivery pace — is partly company-controlled and historically stable within a 10–15% band in any given year outside of a COVID-scale external event. The main sources of volatility that push the score above 20 are: (i) Q4 POC concentration creates quarter-to-quarter swings that can look like earnings misses but are timing effects; (ii) the tax regime step-change (DMTT) is now embedded and will not create additional noise unless further expanded; and (iii) EGP/AED FX is an ongoing source of headline noise at the sub-segment level. The score is held at 38 rather than a higher number because the AED 134.3 Bn backlog is the clearest earnings-smoothing mechanism in the data pool — it would require a multi-year disruption (not a single-quarter event) to materially erode the earnings trajectory.

---

## Citations

| Label | Source | Period | Reference |
|---|---|---|---|
| [1] | FY2025 Investor Presentation (Preliminary Annual Report) | FY2025 | DFM filing, Feb-12-2026 — slides 12, 13, 16, 17, 19, 21, 22, 27, 32 |
| [2] | Capital IQ Annual Financial export | FY2021–FY2025 | Income Statement, Cash Flow, Balance Sheet tabs |
| [3] | Capital IQ Quarterly Financial export | Q1-2022 through Q1-2026 | Income Statement, Balance Sheet tabs |
| [4] | Q1-2026 Preliminary Interim Results | Q1-2026 (period ended Mar-31-2026) | DFM filing, Apr-08-2026 |
| [5] | `01_historical-financials.md` (upstream) | FY2021–LTM Mar-2026 | analyses/EMAR_2026-07-03/earnings/ |
| [6] | `02_revenue-drivers.md` (upstream) | FY2025 | analyses/EMAR_2026-07-03/earnings/ |
| [7] | `03_margin-drivers.md` (upstream) | FY2025 | analyses/EMAR_2026-07-03/earnings/ |
| [8] | `10_external-dependency.md` (cross-module) | FY2025 | analyses/EMAR_2026-07-03/business-model/ |
