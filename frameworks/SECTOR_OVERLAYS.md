# SECTOR_OVERLAYS.md — business-type KPI & risk overlays (fix F-SECTOR-1)

The engine is sector-**agnostic** by design: it classifies any business, picks the right
valuation method (DCF / DDM / NAV), and refuses what it can't do (e.g. a bank in the
balance-sheet-survival module). But it was not sector-**fluent** at the KPI level — nothing
*required* the metric grammar a given sector lives or dies by. The CRM run showed the
generic agents surface SaaS KPIs *when the data is present*, so the gap is **enforcement,
not capability**: on a thin pool the engine would produce a KPI-blind read and triage would
still pass "Sufficient."

This file is the **self-declared overlay map** (per CLAUDE.md §26 — data, not engine code).
Consumers key off the business type classified by `business-model/02_business-identity`:
- **`02_business-identity`** emits the required-KPI checklist below and marks each KPI
  present / absent in the pool.
- **`earnings/02_revenue-drivers`, `03_margin-drivers`** build the decomposition on the
  sector KPIs where they apply.
- **`business-model/07_business-quality`** weights the sector-specific factors.
- A business type **not** listed here falls to the generic path — state explicitly
  *"No sector overlay for {type} — generic read"* (graceful degradation, never a silent gap).

Coverage is intentionally the high-value sectors first; add a row by editing this file only
(no engine change). When a **required** KPI for the classified type is **absent** from the
pool, flag it as a data gap and let the owning module cap its read — a KPI-blind thesis on a
KPI-driven business must not present as complete.

| Business type | Required KPIs (the metric grammar) | Sector-specific red flags | Valuation norm |
|---|---|---|---|
| **SaaS / subscription software** | cRPO, total RPO, dollar-based net retention (NRR) / gross retention or attrition, billings, ARR & growth, subscription vs services mix, **stock-based comp as % of revenue** (GAAP vs non-GAAP gap), Rule-of-40 | SBC dilution masked by non-GAAP "profitability"; bookings (cRPO) decelerating while revenue holds; growth bought via M&A; net-retention slipping below ~100% | FCFF DCF on GAAP FCF (charge SBC); EV/NTM-revenue & EV/cRPO vs growth; reverse-DCF on implied growth |
| **Bank / lender** | NIM, loan & deposit growth, CASA / funding mix, GNPA & NNPA / NPL, credit cost (provisions / loans), PCR (coverage), CET1 / CAR, ROA, ROE, cost-to-income | Rising NPAs with falling coverage; rapid unseasoned loan growth; NIM propped by risky mix; restructured-book / evergreening; promoter/related-party lending | **DDM / residual-income on cost of equity, NOT FCFF/EV** (per valuation Business-Type Map); P/B vs ROE; never net-debt/EBITDA |
| **Insurer** | combined ratio (loss + expense), float & investment yield, reserve development, embedded value / VNB (life), solvency ratio, premium growth | adverse reserve development; combined ratio > 100 structurally; aggressive reserve releases; investment-yield reach-for-risk | embedded value / VNB (life); P/B & combined-ratio-adjusted earnings (P&C); not FCFF |
| **REIT / real estate** | FFO & AFFO (per share), occupancy, cap rate, NOI & same-store NOI growth, WALE / lease expiry, LTV, dividend coverage from AFFO | development overreach; LTV creep; occupancy/SS-NOI declining; AFFO not covering the distribution | **NAV (asset value − net debt) and/or DDM on FFO/AFFO, NOT EBITDA-DCF** (depreciation non-economic) |
| **Commodity producer / miner** | production volume, AISC / unit cash cost, reserves & resource life, grade / strip ratio, realized price vs benchmark, capex intensity | cost inflation eroding the margin; reserve depletion without replacement; single-asset / single-commodity concentration; price taken at the peak | **mid-cycle-normalized FCFF DCF** (Cyclicality Gate — never a single peak/trough year); EV/EBITDA across the cycle; NAV of reserves |
| **Oil & gas (E&P)** | production (boe/d), reserves (1P/2P) & reserve-replacement, finding & development cost, netback / unit opex, decline rate, hedging book | reserve write-downs; F&D cost above realized netback; balance-sheet stress at low prices; aggressive PUD bookings | NAV of reserves + mid-cycle DCF; EV/EBITDAX, EV/flowing-barrel |
| **Retail / consumer** | same-store sales growth (SSSG), sales per sq ft, gross margin, inventory turns, store count & unit economics, online mix | SSSG negative while store count grows; inventory bloat / markdown risk; margin given to traffic; lease overhang | EV/EBITDA & P/E vs SSSG and unit economics; FCFF DCF |
| **Telecom** | ARPU, subscriber net adds & churn, data usage, network capex / sales, tower / spectrum obligations, net-debt/EBITDA | ARPU war / churn spike; capex never earning its cost of capital; spectrum/debt overhang; regulated-price exposure | EV/EBITDA, FCFF DCF; per-sub / tower SOTP where relevant |
| **Asset manager / exchange** | AUM & net flows, fee rate / revenue yield, operating margin, performance-fee dependence, mix (active/passive) | persistent net outflows; fee compression; performance-fee cliff; key-person / mandate concentration | P/E & EV/EBITDA on AUM-driven earnings; % of AUM |
| **Pharma / biotech** | pipeline by phase, patent cliff / LOE schedule, R&D productivity, approved-drug sales & growth, peak-sales estimates | binary trial dependence; near patent cliff with thin pipeline; single-drug concentration; pricing/regulatory exposure | risk-adjusted NPV (rNPV) of pipeline + base-business DCF; not a naive FCFF |
| **Generic operating company** (default) | volume, price/mix, utilization, order book / backlog, segment mix, working-capital cycle | the standard business-quality + §24 filters apply | FCFF DCF + multiples (the engine's default) |
