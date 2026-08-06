# business-model Module Dossier — UBER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `business-model_memo.md`.

- Generated: 2026-08-06T15:40:04Z
- Module folder: `business-model`
- Contents: 1 module synthesis + 13 specialist outputs = 14 files

## Table of Contents

- [business-model — module synthesis](#business-model-module-synthesis) — `99_business-model-synthesis.md`
- [business-model / 00_data-triage.md](#business-model-00-data-triage-md) — `00_data-triage.md`
- [business-model / 01_disqualifier-scan.md](#business-model-01-disqualifier-scan-md) — `01_disqualifier-scan.md`
- [business-model / 02_business-identity.md](#business-model-02-business-identity-md) — `02_business-identity.md`
- [business-model / 03_segment-map.md](#business-model-03-segment-map-md) — `03_segment-map.md`
- [business-model / 04_unit-economics.md](#business-model-04-unit-economics-md) — `04_unit-economics.md`
- [business-model / 05_customer-geography.md](#business-model-05-customer-geography-md) — `05_customer-geography.md`
- [business-model / 06_value-chain.md](#business-model-06-value-chain-md) — `06_value-chain.md`
- [business-model / 07_business-quality.md](#business-model-07-business-quality-md) — `07_business-quality.md`
- [business-model / 08_competitive-map.md](#business-model-08-competitive-map-md) — `08_competitive-map.md`
- [business-model / 09_moat.md](#business-model-09-moat-md) — `09_moat.md`
- [business-model / 10_external-dependency.md](#business-model-10-external-dependency-md) — `10_external-dependency.md`
- [business-model / 11_capital-allocation-governance.md](#business-model-11-capital-allocation-governance-md) — `11_capital-allocation-governance.md`
- [business-model / 12_red-flags-sweep.md](#business-model-12-red-flags-sweep-md) — `12_red-flags-sweep.md`


---

## business-model — module synthesis

_Source: `99_business-model-synthesis.md`_

# Business Model Reality Check — UBER (Synthesis)

## Abstract

Uber runs a two-sided marketplace app matching riders, eaters and shippers with drivers, couriers and freight carriers, taking a commission on each transaction without owning the vehicles. Mobility drives the business — 57% of FY2025 revenue and 90.5% of total EBITDA ($7,899mm of $8,730mm). The strongest positive is a cost edge over peers: Mobility's segment EBITDA margin hit 26.6% in FY2025 versus Lyft's near-zero and DiDi's negative margin. The strongest negative: three-year average return on capital (6.2%) sits below an 8.1% cost of capital, no moat is proven, and a serial-acquirer pattern — including the pending $14.8bn Delivery Hero deal — caps the capital-allocation score at 50/100. No disqualifier triggered; this is an average business worth deeper work only if cheap.

## 1. First-Pass Verdict

### Automatic Disqualifier Check

Restated from `01_disqualifier-scan.md` — no primary 10-K/10-Q sits in the data pool, so rows #3, #5, and #6 rest on the absence of evidence in a vendor-export/transcript-only dataset rather than a primary filing's own clean statement. This is a data-sufficiency cap on the scan, not itself a trigger.

| # | Disqualifier | Triggered (Y/N) | Source |
|---|---|---|---|
| 1 | Auditor qualification or going-concern note (last 3 years) | N | PwC, unqualified FY2024–FY2025 [`01_disqualifier-scan.md`] |
| 2 | >50% promoter / insider shares pledged | N | Insiders hold 0.18% of shares; no controlling group, no pledge disclosure [`01_disqualifier-scan.md`] |
| 3 | Related-party transactions >25% of revenue or expenses | N | No RPT note in pool; structurally implausible for a diffuse consumer marketplace — Not disclosed in available data [`01_disqualifier-scan.md`] |
| 4 | Auditor changed twice in last 3 years without disclosed reason | N | Same auditor (PwC) both years shown [`01_disqualifier-scan.md`] |
| 5 | Material restatement (>5% of revenue or net income) in last 2 years | N | Vendor "Restatement Type: RC/O" codes are Capital IQ reclassification artifacts, not company-disclosed restatements [`01_disqualifier-scan.md`] |
| 6 | Active regulatory enforcement action on financial reporting | N | No enforcement/investigation language found anywhere in the pool [`01_disqualifier-scan.md`] |
| 7 | >40% of revenue from single customer with no long-term contract | N | Revenue is atomized across millions of individual riders/eaters; no single-customer concentration [`01_disqualifier-scan.md`, `05_customer-geography.md`] |
| 8 | Negative operating cash flow in 3 of last 4 years (excl. growth-stage) | N | CFO positive and rising FY2022–FY2025: $642mm, $3,585mm, $7,137mm, $10,099mm [`01_disqualifier-scan.md`] |

No row triggered. The verdict below is NOT locked by this scan.

### Verdict

- **Verdict:** Average business — worth deeper work only if valuation is cheap
- Disqualifier triggered: N
- Business clarity /100: **68** — the two-sided, take-rate marketplace model and three-segment structure (Mobility/Delivery/Freight) are clearly disclosed and internally consistent across every upstream module; capped below "very clear" because the audited Gross Bookings/take-rate/Monthly Active Platform Consumer time series and the Corporate G&A vs. Platform R&D split are both absent from this pool (no primary 10-K) [`02_business-identity.md` §3a; `03_segment-map.md` §3]
- Business quality /100: **47** *(from `07_business-quality.md`; Mixed/Average, low end — dragged down by regulatory dependence 28, competitive intensity 32, industry rate-of-change 35)*
- Moat /100: **60** *(from `09_moat.md`; strongest individual moat source = Scale at 60. The overall moat VERDICT is "No moat proven" — through-cycle ROIC (6.2% 3-yr avg) sits below an ~8.1% WACC estimate; only FY2024–FY2025 individually clear that bar, and that recent run is flagged as a peak, not a steady state)*
- External dependency risk /100 *(higher = worse)*: **42** *(from `10_external-dependency.md`; Regulation rated High, FX and Consumer cycle rated Mid)*
- Capital allocation & governance /100: **50** *(from `11_capital-allocation-governance.md`; Rejector-Filter 4 cap applied — see below)*
- Data quality /100: **60** — no primary annual/quarterly filing in the pool (a real gap), but 0 extraction failures across 13 source files/45 tabs, a same-day earnings transcript (Aug-05-2026), and consistent six-year segment-level revenue AND EBITDA disclosure via the Capital IQ vendor export [`00_data-triage.md`]
- Overall usefulness /100: **62** *(capped at 70 by the Filter 4 serial-acquirer rule; set below that ceiling given the compounding data-sufficiency gap and the unproven moat)*
- Business type (one line): *(from `02_business-identity.md`)* A global, asset-light, multi-sided marketplace that takes a commission on gross transaction volume across three businesses — ride-hailing, food/goods delivery, and freight brokerage — while funding an early-stage, largely off-balance-sheet bet on autonomous-vehicle commercialization.
- Biggest business-model risk (one line): Driver/worker-classification regulation could reprice the core independent-contractor cost structure across Mobility and Delivery simultaneously — already demonstrated this quarter by a U.K. reclassification that cut Mobility's reported take rate by roughly 500 basis points [`10_external-dependency.md` §5; `02_business-identity.md` §2].

**REJECTOR-FILTER CAPS (CLAUDE.md §24).**

- **Filter 1 — Crooks / integrity.** Not tripped. `01_disqualifier-scan.md` found no proven fraud and no unverified adverse "buzz" on management integrity. No cap applied.
- **Filter 4 — Serial acquirers.** TRIPPED. `11_capital-allocation-governance.md` scored the acquisition-pattern row at 78/100 severity (≥70 threshold) — at least seven bolt-on deals in ~18 months (Trendyol Go, Getir, Careem, SS Ventures, Blacklane, SpotHero, Segments.ai, Crown Taxi) layered under a pending $14.8bn, debt-funded Delivery Hero acquisition (~10% of Uber's own market cap, funded by a ~€14bn bridge facility). **Cap applied: Capital allocation & governance score capped at 50/100; Overall usefulness capped at 70/100.**
- **Filter 5 — Fast-changing industry.** TRIPPED. `07_business-quality.md` scored the industry rate-of-change / disruption row at 35/100 (≤40 threshold) — Uber is spreading ~$10bn across six-plus unproven AV partners specifically because it cannot predict who wins the AV transition or whether it remains the rider-facing intermediary at all. **Cap rule: Business quality aggregate capped at 65/100.** The actual aggregate (47) already sits below that ceiling, so the cap is non-binding on the number, but the flag stands: this thesis is a sector / technology-cycle bet on the AV transition, not a settled durable compounder, and moat durability is discounted accordingly (`09_moat.md` §5).
  - **RF-BQ-005 (fast-changing industry: rate-of-change ≤40)**

**CAPITAL STRUCTURE TRANSACTION CAP.** Checked against realized (not pending) numbers: total debt did not change >50% YoY within the reported period (leverage in fact fell, Total Debt/EBITDA 2.9x FY2024 → 1.8x FY2025 → 1.4x Mar-2026 [`11_capital-allocation-governance.md`]), and share count moved only ~2.5% (2,089mm Dec-2024 → 2,036mm Mar-2026 → 2,043mm Aug-2026 [`11_capital-allocation-governance.md`]) — well under the 25% threshold. **Cap NOT independently triggered on realized figures.** The prospective, much larger capital-structure change (the ~€14bn Delivery Hero bridge facility) has not yet closed (deal signed Jul-16-2026, offer expected H2 2027 [`12_red-flags-sweep.md`]) and is already captured by the binding Filter 4 cap above — layering a second cap on the same score would not change the floor, since 50/100 is already the more restrictive of the two applicable rules.

**Module Disconfirmation (CLAUDE.md §8; fix F37).**

- **Strongest bear point:** Through-cycle return on capital (3-year average 6.2%, FY2023–FY2025) sits below an estimated ~8.1% cost of capital — the decisive economic-moat test fails even though Uber leads its named peers on margin, meaning the cost/scale edge has not yet been shown to create value above its own funding cost across a cycle [`09_moat.md` §3–§5].
- **Strongest bull point (steelman):** Return on capital has risen every single year for five straight years (-9.40% FY2021 → 10.59% LTM) and Mobility's segment EBITDA margin (26.6% FY2025) is far above Lyft's near-zero and DiDi's negative margins — a real, widening structural advantage, not a one-quarter blip, with LTM free cash flow now exceeding $10bn [`09_moat.md` §4–§5; `10_external-dependency.md` §3].
- **Single killer risk:** A driver/worker-classification ruling or new law in a major market (US or EU) reclassifying gig drivers as employees would strike directly at the independent-contractor cost structure underpinning both Mobility and Delivery at once — the U.K. already delivered a preview, cutting the reported Mobility take rate ~500bps in one quarter [`10_external-dependency.md` §5].
- **Disconfirming evidence already visible:** `07_business-quality.md` itself cautions that the current 9–11% return on capital should not be extrapolated as a steady-state level, citing the FY2020 pandemic trough (Mobility margin near breakeven) and Freight's -27% three-year revenue decline as the through-cycle counterweight; and `12_red-flags-sweep.md` shows FY2024–FY2025 GAAP net income was more than half explained by a non-cash deferred-tax benefit and mark-to-market gains, not by operating-business improvement, meaning even the recent ROIC "clearing the bar" years are flattered by items outside the core marketplace.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| data-triage | Verdict: Partial — no primary 10-K/10-Q in pool | Only a same-day earnings transcript and CIQ vendor exports are available; segment/MD&A/risk-factor detail must be re-verified against the primary filing |
| disqualifier-scan | No disqualifier triggered | All 8 checks read N, but 3 of them (RPT, restatement, enforcement) rest on absence of a primary filing rather than a filing's own clean statement |
| business-identity | Multi-sided, take-rate marketplace across three segments plus an AV bet | Company does not own the cars, restaurants, or trucks — only the app, matching software, and payment rails; ~$10bn committed across 6+ AV partners rather than proprietary AV technology |
| segment-map | Mobility is the dominant segment on both revenue and profit | Mobility = 57.0% of revenue but 90.5% of total EBITDA ($7,899mm of $8,730mm); Freight is EBITDA-negative and shrinking (-27% revenue over 3 years) |
| unit-economics | Unclear from disclosure, but directional evidence leans "creates value" | No trip count, per-trip contribution margin, or cohort data exists in the pool; the read rests on Mobility's segment margin trend (19.2%→26.6%), an inference not a computed unit-economics result |
| customer-geography | Geographically concentrated, not customer-concentrated | US/Canada = 50.9% of revenue with zero long-term contracts anywhere in the business; EMEA's rise (18.4%→31.5% since FY2021) is partly acquisition-driven |
| value-chain | Mixed economic control | Sets its own take rate and product mix, but is a price-taker on regulatory reclassification (UK) and local driver/courier-supply competition (Brazil) |
| business-quality | 47/100 — Mixed/Average, low end | Weakest factors are regulatory dependence (28), competitive intensity (32), and industry rate-of-change (35) — the last trips the Filter 5 rejector cap (RF-BQ-005) |
| competitive-map | Position vs. peers not fully disclosed; two partial proxies (holding share vs. DiDi in Brazil, growing faster than Lyft) | Named peers: Lyft (~4.6x smaller, near-breakeven), DiDi (larger by revenue but loss-making, the one rival Uber's own CEO names), Grab (profitable but ~1/8th scale) |
| moat | No moat proven — moat in structure, not economics; trajectory widening but early-stage | 3-year average ROIC (6.2%) sits below an estimated ~8.1% WACC; only FY2024–FY2025 individually clear that line, and are flagged as a recent peak |
| external-dependency | Partly externally driven; risk score 42/100 (inverted) | Regulation rated High — the single largest external variable, already visible in this quarter's reported take rate |
| capital-allocation-governance | Capital allocation concerns; score capped at 50/100 | Serial-acquirer pattern (severity 78) trips Filter 4 — 7+ bolt-ons in ~18 months plus the debt-funded $14.8bn Delivery Hero deal |
| red-flags-sweep | Three cross-cutting patterns compound: non-operating-driven net income, serial M&A with an uncertain 18-month close, and exogenous margin drivers | Most severe new flag (62): FY2024–FY2025 GAAP net income is dominated by a non-cash deferred-tax benefit and mark-to-market gains, not operating profit |

## 3. Reconciliation

One disagreement surfaced between upstream modules: `09_moat.md` cites FY2025 Total Debt of $12,302mm (Capital Structure Summary tab, Dec-31-2025 column), while `10_external-dependency.md` cites Total Debt of $14,731mm (Key Stats tab). Both are Capital IQ vendor tabs for the same company and roughly the same period, but they do not reconcile to the same figure — likely reflecting different debt definitions (e.g., inclusion/exclusion of finance leases) or a different as-of date (fiscal year-end vs. latest-quote snapshot) between the two tabs. Per the conservative-default rule (CLAUDE.md §4), this synthesis treats the higher figure ($14,731mm) as the more conservative read of gross debt exposure, while noting the lower figure is the one used in `09_moat.md`'s ROIC/WACC cross-check (which is internally consistent within that module's own capital-structure-summary-based calculation and not material to the moat verdict either way, since both figures leave Uber solidly investment-grade). This discrepancy should be resolved against the primary 10-K's debt footnote once it is added to the pool. No other material factual disagreement was found — the two net-debt figures ($9,340mm strict-basis, LTM) tie out identically between `10_external-dependency.md` and `11_capital-allocation-governance.md`, and the FY2025 ROIC figure (9.36%) is identical across `07_business-quality.md` and `09_moat.md`.

## 4. Note To The Final Synthesizer

- **Strongest business-model positive:** Mobility's segment EBITDA margin reached 26.6% in FY2025 (up from 19.2% in FY2020), well above Lyft's near-zero and DiDi's negative EBITDA margins over the same trailing period — a real, widening cost/scale advantage over the two closest named ride-hailing peers [`09_moat.md` §2–§4].
- **Strongest business-model negative:** Through-cycle return on capital (3-year average 6.2%, FY2023–FY2025) still sits below an estimated ~8.1% cost of capital — the margin lead over peers has not yet translated into an economic moat by the required through-cycle test, and only the most recent two years individually clear that bar [`09_moat.md` §3–§5].
- **Most important segment:** Mobility — 57.0% of FY2025 revenue but 90.5% of total-company EBITDA ($7,899mm of $8,730mm); Delivery is a real, improving second segment (33.2% of revenue); Freight is structurally immaterial to profit and shrinking [`03_segment-map.md`].
- **Cleanest unit-economics read (or why it cannot be derived):** Cannot be computed as a formal unit-economics test — no trip count, per-trip contribution margin, driver-acquisition cost, or cohort/lifetime-value data exists anywhere in this pool (the primary 10-K, which normally carries Uber's own Trips/Gross Bookings/MAPC supplemental table, is absent). The only directional proxy is Mobility's segment EBITDA margin trend (19.2%→26.6%, FY2020–FY2025), which is an inference, not a computed result [`04_unit-economics.md`].
- **Where the company sits vs. named peers on margin / ROIC:** Top of the four named peers (Lyft, DiDi, Grab) on both gross margin (40.8%) and EBIT margin (12.1%); no peer discloses ROIC, so a return-on-capital comparison against named peers is not possible from this pool — only the absolute (vs.-cost-of-capital) test could be run, and it failed on a through-cycle basis [`09_moat.md` §3–§4].
- **Main external dependency:** Regulation, rated High — driver/worker-classification fights, insurance-cost cycles, and the U.K. reclassification (already ~500bps of Mobility take-rate impact this quarter) are the single largest external variable in the business, per management's own words ("we are a highly regulated business") [`10_external-dependency.md` §1, §5].
- **Most important capital allocation or governance signal:** The serial-acquirer pattern — 7+ bolt-on deals in ~18 months plus the pending, debt-funded $14.8bn Delivery Hero acquisition (~10% of Uber's own market cap) — trips the Filter 4 rejector rule and caps the capital-allocation score at 50/100 regardless of otherwise clean hygiene (no promoter pledge, negligible insider ownership, investment-grade balance sheet pre-deal) [`11_capital-allocation-governance.md`].
- **Whether any automatic disqualifier triggered:** No. All 8 disqualifier-scan rows read N, though 3 of them rest on the absence of a primary filing rather than a filing's own explicit clean statement [`01_disqualifier-scan.md`].
- **Which rejector filters tripped, and the cap each applied:** Filter 4 (serial acquirers) tripped — Capital allocation score capped at 50/100, Overall usefulness capped at 70/100. Filter 5 (fast-changing industry) tripped — Business quality aggregate capped at 65/100 (non-binding on the actual 47 score, but the sector/technology-cycle-bet flag stands; propagated as **RF-BQ-005**). Filter 1 (crooks/integrity) did not trip.
- **Biggest missing data point:** The primary FY2025 10-K (or the FQ2 2026 10-Q) itself — every upstream module built its segment, geography, unit-economics, and governance read from Capital IQ vendor exports of that filing rather than the filing's own Item 1A risk factors, MD&A, segment note, and RPT disclosure. This is a data-completeness gap, not a language or translation issue (CLAUDE.md §27 does not apply here — the pool is entirely English-language).
- **Mandatory red-flag propagation (severity ≥ 40, from `12_red-flags-sweep.md` and `11_capital-allocation-governance.md`):**
  - Acquisition pattern / serial-acquirer M&A (severity 78) — already the basis of the Filter 4 cap above.
  - FY2024–FY2025 GAAP net income dominated by a non-cash deferred-tax benefit and mark-to-market gains, not operating profit (severity 62) — treat trailing GAAP net income, EPS growth, and any naive P/E multiple as contaminated by this pattern unless explicitly adjusted.
  - Delivery Hero deal's lopsided break fee (€700mm Uber vs. €200mm Delivery Hero) and ~18-month, multi-jurisdiction closing runway not yet resolved (severity 52).
  - Senior management turnover — three CFOs in three years (severity 48).
  - Net debt jump from ~$76mm (FY2025) to ~$9,340mm (LTM Jun-2026, strict basis) as Uber pre-funded the Delivery Hero stake (severity 45).
  - Related-party-transaction disclosure gap around PIF's 3.6% stake and board seat — flagged as an unverifiable disclosure gap, not a hidden channel, since no RPT note or proxy exists in this pool (severity 40).
  - Excluded from mandatory propagation (severity <40, summarized only): wrongful-death/vicarious-liability lawsuit tied to a driver's conduct (28) — a live instance of a structural liability category inherent to the marketplace model, but not solvency-threatening on its own; vendor "Restatement Type: O" reclassification code (28) and auditor-history disclosure gap (32) — both flagged upstream as vendor-artifact/data-gap issues, not evidence of an actual restatement or audit problem.
- **Whether the business deserves deeper work, and what would change the answer:** Worth deeper work only if valuation is cheap enough to compensate for an unproven moat and a capital-allocation score capped by the serial-acquirer pattern. The answer would improve toward "high-quality" if (a) return on capital sustains above the ~8.1% WACC estimate for a full cycle without regulatory or competitive props, and (b) the Delivery Hero deal closes on schedule near its committed terms without a leverage overshoot past management's stated target. The answer would worsen toward "low-quality" if a major-market driver-classification ruling lands, or if the Delivery Hero deal's leverage or integration outcome deteriorates materially from what is currently disclosed.

## 5. Simple Summary

- **What it does:** Runs an app that connects riders, food/grocery customers, and shippers with independent drivers, couriers, and trucking carriers — it owns the software and payment rails, not the vehicles.
- **How it makes money:** Takes a percentage (the "take rate," mid-20s% company-wide) of every fare, order, or shipment value that runs through the app.
- **Whether each new unit creates value:** Cannot be proven directly — no trip-level cost or lifetime-value data exists in this pool — but the best available proxy (Mobility's segment EBITDA margin, up from 19.2% to 26.6% over five years) points toward yes.
- **Which segment matters most:** Mobility, by a wide margin — 57% of revenue but over 90% of total profit. Freight is shrinking and loses money.
- **Whether it has a moat, and against whom:** A real cost and scale edge over Lyft and DiDi specifically, but not yet a proven economic moat — the company's own return on capital, averaged over the last three years, still falls short of its estimated cost of capital.
- **What external variables it depends on:** Regulation of the independent-contractor driver model is the single biggest one, followed by currency exposure (about half of revenue is outside the US/Canada) and discretionary consumer spending.
- **Whether capital is allocated well:** Mixed — clean balance sheet and buyback discipline through FY2025, but a serial-acquirer pattern (7+ deals in 18 months plus the pending $14.8bn Delivery Hero acquisition) caps this score at 50/100.
- **Whether it deserves deeper work:** Yes, but only if the valuation is cheap enough to compensate for an unproven moat, a capital-allocation cap, and a business model still exposed to an unresolved autonomous-vehicle disruption question.



---

## business-model / 00_data-triage.md

_Source: `00_data-triage.md`_

# Data Triage — UBER

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified* | Notes |
|---|---|---|---|---|
| Charting Excel Export Aug-05-2026 2_49 PM.xls — tab "Chart 1 with Data" | Data export | Historical equity price series through Aug-05-2026 | 2026-08-06 (sync) | Sparse/numeric chart series; 284×2 cells, little text content |
| Charting Excel Export Aug-05-2026 2_49 PM.xls — tab "Attributions" | Data export (metadata) | n/a | 2026-08-06 (sync) | Data-provider attributions (Interactive Data, Tullett Prebon) |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Financial Data" | Data export (Capital IQ comps) | As-Of 2026-08-06 | 2026-08-06 (sync) | Peer comp financials, Capital IQ Default Comps template |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Trading Multiples" | Data export | As-Of 2026-08-06 | 2026-08-06 (sync) | Peer trading multiples |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Operating Statistics" | Data export | As-Of 2026-08-06 | 2026-08-06 (sync) | Peer operating stats |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Business Description" | Data export | As-Of 2026-08-06 | 2026-08-06 (sync) | Peer business descriptions |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Implied Valuation" | Data export | As-Of 2026-08-06 | 2026-08-06 (sync) | Comp-based implied valuation |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Valuation Chart" | Data export | As-Of 2026-08-06 | 2026-08-06 (sync) | Chart data, low text content |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Credit Health Panel" | Data export (S&P) | As-Of 2026-08-06 | 2026-08-06 (sync) | S&P credit-health panel |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Disclaimer" | Metadata | n/a | 2026-08-06 (sync) | S&P copyright/licensing disclaimer |
| Company_Comparable_Analysis_Uber_Technologies _Inc.rtf | Data export (RTF companion) | As-Of 2026-08-06 | 2026-08-06 (sync) | Peer business descriptions (Lyft, DoorDash, DiDi, Avis Budget) — mirrors workbook tab |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | Data export | Current coverage list | 2026-08-06 (sync) | Sell-side analyst names, targets, recommendations |
| Uber Technologies Inc NYSE UBER Board Members.rtf | Data export | Current board roster | 2026-08-06 (sync) | Governance roster only, no bios/tenure detail extracted here |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Key Stats" | Data export (Capital IQ) | Multi-year, latest LTM | 2026-08-06 (sync) | |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Income Statement" | Data export (Capital IQ) | FY2021–FY2025 + LTM Jun-30-2026 | 2026-08-06 (sync) | "Restatement: Latest Filings" — derived from Uber's 10-Ks, not the filing itself |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Balance Sheet" | Data export (Capital IQ) | FY2021–FY2025 + Press Release (Jun-30-2026) | 2026-08-06 (sync) | Same caveat — vendor-parsed, not primary filing |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Cash Flow" | Data export (Capital IQ) | FY-annual, "Latest Filings" restatement | 2026-08-06 (sync) | |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Multiples" | Data export (Capital IQ) | Quarterly | 2026-08-06 (sync) | |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Historical Capitalization" | Data export (Capital IQ) | Quarterly | 2026-08-06 (sync) | |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Capital Structure Summary" | Data export (Capital IQ) | Annual | 2026-08-06 (sync) | |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Capital Structure Details" | Data export (Capital IQ) | Annual | 2026-08-06 (sync) | States "Source: A[nnual filing] 2025 filed Feb-13-2026" — confirms FY2025 10-K filing date, but the 10-K document itself is not in the pool |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Ratios" | Data export (Capital IQ) | Annual | 2026-08-06 (sync) | |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Supplemental" | Data export (Capital IQ) | Annual | 2026-08-06 (sync) | |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Industry Specific" | Data export (Capital IQ) | Annual | 2026-08-06 (sync) | Sparse (15×6) |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Pension OPEB" | Data export (Capital IQ) | Annual | 2026-08-06 (sync) | Sparse (15×6), likely mostly blank — n/a for Uber |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Segments" | Data export (Capital IQ) | FY2020–FY2025 | 2026-08-06 (sync) | Mobility / Delivery / Freight segment revenue, vendor-parsed from 10-K segment note |
| Uber Technologies Inc NYSE UBER Products.rtf | Data export | Current subsidiaries/products | 2026-08-06 (sync) | Product/subsidiary listing |
| Uber Technologies Inc NYSE UBER Professionals.rtf | Data export | Current professionals | 2026-08-06 (sync) | Management/professional roster |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | Data export (Capital IQ) | As-of Aug-06-2026 (stock quote); FY24–FY25 financials + estimates through FY28 | 2026-08-06 (sync) | Business description, investor list, stock quote, key financials |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.pdf | Earnings transcript | FQ2 2026 (quarter ended ~Jun-30-2026), call held Aug-05-2026 | 2026-08-06 (sync) | S&P Capital IQ transcript of Uber's own Q2 2026 earnings call; most recent and highest-value document in the pool |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Consensus" | Data export (Capital IQ estimates) | FQ2 2026 actual/surprise; consensus through FY2027 | 2026-08-06 (sync) | Consensus as of Aug-05-2026 10:04 AM GMT |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Recent Changes" | Data export (Capital IQ estimates) | Recent estimate revisions | 2026-08-06 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Guidance" | Data export (Capital IQ estimates) | Management guidance vs consensus | 2026-08-06 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Multiples" | Data export (Capital IQ estimates) | Forward multiples | 2026-08-06 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Surprise" | Data export (Capital IQ estimates) | Historical EPS/revenue surprise | 2026-08-06 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Trends" | Data export (Capital IQ estimates) | Estimate trend history | 2026-08-06 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — tab "Revisions" | Data export (Capital IQ estimates) | Analyst-by-analyst revisions | 2026-08-06 (sync) | |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — tab "Consensus" | Data export (Capital IQ estimates) | Same as "(1)" file | 2026-08-06 (sync) | Duplicate export, identical dims/cell counts to the "(1)" file |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — tab "Recent Changes" | Data export (Capital IQ estimates) | Same as "(1)" file | 2026-08-06 (sync) | Duplicate |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — tab "Guidance" | Data export (Capital IQ estimates) | Same as "(1)" file | 2026-08-06 (sync) | Duplicate |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — tab "Multiples" | Data export (Capital IQ estimates) | Same as "(1)" file | 2026-08-06 (sync) | Duplicate |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — tab "Surprise" | Data export (Capital IQ estimates) | Same as "(1)" file | 2026-08-06 (sync) | Duplicate |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — tab "Trends" | Data export (Capital IQ estimates) | Same as "(1)" file | 2026-08-06 (sync) | Duplicate |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — tab "Revisions" | Data export (Capital IQ estimates) | Same as "(1)" file | 2026-08-06 (sync) | Duplicate |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | Data export (Capital IQ, combined landscape report) | FY2024–FY2025 actuals, Jun-30-2026 press release, FY2026–FY2028 estimates | 2026-08-06 (sync) | Combines business description, key financials, investor list, stock quote — largest single RTF (3.3MB) |

*"Last Modified" reflects the pool-sync timestamp (all files synced 2026-08-06, the same day this triage runs), not the true document date — per CLAUDE.md §27/F23, periods above are parsed from inside each document (as-of dates, fiscal-period headers, "filed" dates), not from file-system metadata.

No `data/UBER/external/` folder exists — no externally sourced (alt-data / expert-call / broker) documents in this pool, so there is no Section 1A.

Pool-extraction manifest (`_pool_extracts/manifest.json`) shows **0 failures**: all 13 source files / 45 extracted tabs status `ok`. No source is in a `fail`, `fallback-text`, or `missing-dependency` state, so nothing is downgraded to "missing" on extraction grounds. `ciq_facts.json` does not exist in this run's `_pool_extracts/` folder — no sidecar to reconcile against; downstream agents must cite the workbook tabs directly.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing (primary document) | **Not present in pool** | Underlying FY2025 10-K referenced as "filed Feb-13-2026" inside the Capital IQ export (Financials.xls, "Capital Structure Details" tab) | ~6 (of the underlying filing; the filing itself is absent — only vendor-parsed data from it is in the pool) |
| Quarterly filing (primary document, e.g. 10-Q) | **Not present in pool** | n/a | n/a |
| Earnings transcript | Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.pdf | FQ2 2026 (quarter ended ~Jun-30-2026), call Aug-05-2026 | ~0 |
| Investor deck | **Not present in pool** | n/a | n/a |
| Data export | Uber Technologies Inc NYSE UBER Financials.xls (13 tabs); UberTechnologies,IncNYSEUBEREstimatesReport(.xls / (1).xls) (7 tabs each); Company Comparable Analysis...xls (8 tabs); UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | FY2021–FY2025 actuals, LTM/press-release Jun-30-2026, consensus through FY2027–FY2028 | ~0 (as-of / consensus dated Aug-05/06-2026) |

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (NYSE) | "Uber Technologies, Inc. (NYSE:UBER)"; primary office San Francisco, CA [Public Company Profile.rtf; CIQReportLandscape.rtf] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | US-domestic issuer; Capital IQ "Restatement: Latest Filings" tabs reference an "A[nnual filing] 2025 filed Feb-13-2026" — consistent with a US 10-K filing cadence [Financials.xls, Capital Structure Details tab] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP (inferred — not stated verbatim in any extracted tab) | Inference, not from filings: standard US domestic-filer treatment; no Ind AS / IFRS language anywhere in the pool |
| Reporting currency + fiscal-year end | USD; fiscal year ends Dec-31 | Income Statement / Balance Sheet tabs: "Currency: USD"; periods run "12 months Dec-31-20XX" [Financials.xls, Income Statement & Balance Sheet tabs] |
| Document language(s) | English | All 13 source documents and 45 extracted tabs are in English; no non-English filings in this pool |

Downstream agents should treat this as a standard US SEC filer: cite a 10-K/10-Q by name if one is later added to the pool, and read segment/MD&A detail from the primary filing rather than the vendor-summarized tabs once available.

## 3. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** The pool has a recent, high-value earnings transcript (Q2 2026 call, Aug-05-2026 — 0 months old) but contains no primary annual or quarterly filing document (no 10-K, no 10-Q); the only annual/quarterly-period financial detail comes from third-party Capital IQ exports that summarize the FY2025 10-K (filed Feb-13-2026) rather than the filing itself, and no investor deck is present.
- **Critical missing items:**
  - The FY2025 10-K (or the underlying 10-Q for the quarter covered by the Aug-05-2026 call) as a primary document — segment note detail, MD&A narrative, risk factors, and footnote disclosures needed for a serious business-model read are not directly available; only vendor-parsed line items are (Income Statement, Balance Sheet, Segments tabs in `Uber Technologies Inc NYSE UBER Financials.xls`).
  - No investor presentation / investor day deck in the pool.
  - Board Members and Professionals RTFs list names/roles only — no tenure, biography, or compensation detail extracted, limiting governance-adjacent business-model context.
  - The two "EstimatesReport" workbooks are duplicate exports of identical content (confirmed identical row/col/cell counts across all 7 tabs) — no incremental data, flagged so downstream agents don't double-count them as independent sources.



---

## business-model / 01_disqualifier-scan.md

_Source: `01_disqualifier-scan.md`_

# Disqualifier Scan — UBER

**Jurisdiction note:** UBER is a US SEC domestic filer (NYSE:UBER), reporting in USD under a Dec-31 fiscal year [data-triage §2A]. The data pool contains no primary 10-K/10-Q — only S&P Capital IQ vendor exports (Financials.xls, Estimates workbooks, CIQ Landscape report) and the Q2 2026 earnings-call transcript (Aug-05-2026). No related-party-transaction note, auditor's report body, risk-factors section, or restatement disclosure exists as a primary document in this pool; findings below are drawn from the vendor exports and transcript, and gaps are marked as such rather than assumed clean.

## 1. Disqualifier Check

| # | Disqualifier | Triggered (Y/N) | Evidence |
|---|---|---|---|
| 1 | Auditor qualification or going-concern note (last 3 years) | N | Auditor = PricewaterhouseCoopers LLP, opinion "Unqualified" for both FY2025 and FY2024 [UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf, "Auditors" table]. FY2023 opinion not separately listed in the pool's Auditors table; no going-concern or qualification language found anywhere in the transcript or vendor exports. Not disclosed in available data for FY2023 specifically — no primary 10-K in pool. |
| 2 | >50% promoter / insider shares pledged | N | Uber has no promoter/controlling group. "Individuals/Insiders" hold 3,586,107 shares = 0.18% of total shares outstanding (2,042,560,121 total); largest holder overall is BlackRock (institutional, 7.42%) [CIQReportLandscape.rtf, "Public Ownership Summary" & "Top 25 Holders"]. No pledge/encumbrance disclosure of any kind found in the pool (Board Members, Professionals, or Landscape report). Ratio: pledged shares ÷ insider holding — no pledge figure exists; insider block itself is far too small and diffuse for a promoter-style pledge structure. Threshold (>50%) not approached. |
| 3 | Related-party transactions >25% of revenue or expenses | N | Not disclosed in available data. No related-party-transaction note or Ind AS/US-GAAP equivalent disclosure is present in the pool (no 10-K Note). Uber's revenue is generated from a diffuse two-sided marketplace (millions of riders/eaters/shippers and independent drivers/couriers/carriers) [Uber-Technologies-Inc-NYSE-UBER-Financials__Segments.txt], which structurally has no basis for related-party sales or purchases at anywhere near a 25% concentration — Inference, not from filings, given the missing RPT note. |
| 4 | Auditor changed twice in last 3 years without disclosed reason | N | Same auditor (PricewaterhouseCoopers LLP) listed for both FY2025 and FY2024, both "Unqualified" [CIQReportLandscape.rtf, "Auditors" table]. No auditor-change disclosure found anywhere in the pool. |
| 5 | Material restatement (>5% of revenue or net income) in last 2 years | N | Capital IQ's Income Statement and Cash Flow tabs carry a "Restatement Type" metadata field marked "RC" for the FY2023/FY2024 columns [Uber-Technologies-Inc-NYSE-UBER-Financials__Income-Statement.txt, row "Restatement Type"; …Cash-Flow.txt, row "Restatement Type"]. This is Capital IQ's own database reclassification code (its legend distinguishes NC = no change, RC = reclassified, O = original, P = preliminary) — a vendor line-item recast to match the latest filing's presentation, not a company-disclosed financial restatement. No 8-K Item 4.02 / non-reliance disclosure, no "restatement" language in the earnings-call transcript, and no primary 10-K in the pool to confirm or refute an actual restatement. Flagged as a vendor-classification artifact, not a hard trigger; residual uncertainty here is a genuine data gap (no primary filing to check), not evidence of a restatement. |
| 6 | Active regulatory enforcement action affecting financial reporting | N | No litigation, SEC/DOJ investigation, subpoena, or enforcement-action language found anywhere in the pool (searched Supplemental notes, CIQ Landscape report client-announcement log, and the full Q2 2026 earnings-call transcript). S&P issuer credit rating is BBB+ [Company Comparable Analysis…Credit-Health-Panel.txt], consistent with no active solvency-linked enforcement flag. Caveat: the pool has no risk-factors section (no 10-K), so this is an absence of evidence in a thin dataset, not a confirmed clean bill — Not disclosed in available data beyond what is stated here. |
| 7 | >40% of revenue from single customer with no long-term contract | N | Uber's revenue is split across Mobility, Delivery, and Freight segments, each drawing from a large, diffuse base of individual riders, eaters, and shippers [Uber-Technologies-Inc-NYSE-UBER-Financials__Segments.txt]. No single-customer concentration disclosure exists (none would be expected for this business model), and no customer-concentration language appears in the transcript or vendor exports. |
| 8 | Negative operating cash flow in 3 of last 4 years (excl. growth-stage) | N | Cash from Operations: FY2022 $642mm, FY2023 $3,585mm, FY2024 $7,137mm, FY2025 $10,099mm — all four of the last four full fiscal years are positive and rising [Uber-Technologies-Inc-NYSE-UBER-Financials__Cash-Flow.txt, row "Cash from Ops."]. FY2021 was negative (-$445mm) but falls outside the last-4-year window measured from FY2025 (the latest completed fiscal year). |

## 2. Triggered Disqualifiers — Detail

No disqualifier triggered.

## 3. Verdict-Lock Signal

- **Any disqualifier triggered:** N
- **If Y, names:** N/A
- **Action:** No disqualifier fact found in the available data pool. The synthesizer is not required to lock the final verdict via this scan. Note the data-sufficiency caveat carried forward from `00_data-triage.md`: no primary 10-K/10-Q is in the pool, so rows #3 (related-party transactions), #5 (restatement), and #6 (enforcement action) rest on the absence of evidence in a vendor-export/transcript-only dataset rather than on a primary filing's explicit "no RPT above threshold" / "no restatement" / "no enforcement action" statement. This caps data sufficiency for this scan; it is not itself a trigger.



---

## business-model / 02_business-identity.md

_Source: `02_business-identity.md`_

# Business Identity — UBER

## 1. What The Company Actually Does

Uber runs a phone-app marketplace that connects three groups of buyers with three groups of sellers: people who need a ride with drivers who have a car, people who want food or goods delivered with couriers and merchants, and businesses that need something shipped with the trucking companies (carriers) that can move it [Company Comparable Analysis Uber Technologies Inc.xls, Business Description tab, As-Of 2026-08-06; Uber Technologies Inc NYSE UBER Public Company Profile.rtf, Business Description, as-of 2026-08-06]. It does not own the cars, the restaurants, or the trucks — it owns the app, the matching software, and the payment rails, and it takes a cut of every transaction that runs through them [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2025; Q2 FY2026 earnings call transcript, prepared remarks, Aug-05-2026]. Riders and eaters pay for convenience and reliability — a ride or a meal shows up on demand, tracked in real time, with one-tap payment — and drivers, couriers and carriers pay (in the form of the commission Uber keeps) for a steady stream of paying customers they would otherwise have to find themselves [Uber Technologies Inc NYSE UBER Public Company Profile.rtf, Business Description]. The business operates in the United States, Canada, Latin America, Europe, the Middle East, Africa and Asia Pacific, and is organized into three reported segments: Mobility (ridesharing, carsharing, micromobility, rentals, taxis), Delivery (restaurant, grocery, alcohol and convenience-store orders, plus a white-label "Uber Direct" delivery service for other retailers), and Freight (a digital marketplace matching shippers with trucking carriers) [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2020–FY2025; Company Comparable Analysis Uber Technologies Inc.xls, Business Description tab]. In FY2025 the Mobility segment generated $29.7bn of revenue, Delivery $17.2bn, and Freight $5.1bn, on total company revenue of $52.0bn [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2025]. Management is also spending — roughly $10bn over a multi-year period, per the CFO — to seed a fourth, not-yet-monetized line: positioning Uber as the "commercialization platform" that autonomous-vehicle (AV) makers plug into to reach paying riders, mostly through equity stakes in AV software partners (Waymo, Wayve, Zoox, Nuro, Pony, Baidu and others) and vehicle-purchase commitments (120,000 vehicles) rather than Uber building its own self-driving technology [Q2 FY2026 earnings call transcript, prepared remarks and Q&A, Aug-05-2026].

## 2. How The Company Makes Money

The whole company runs on one formula, applied three times:

- **Mobility:** `Revenue = Gross Bookings (ride fares paid by riders) × take rate` — the take rate is the slice of each fare Uber keeps after paying the driver.
- **Delivery:** `Revenue = Gross Bookings (value of food/grocery/goods orders + delivery fees) × take rate` — the slice Uber keeps after paying the courier and, in some cases, the restaurant.
- **Freight:** `Revenue = shipments booked × Uber's brokerage fee per shipment` — a spread between what the shipper pays and what the carrier is paid to move the load.

For the quarter ended June 2026, the CEO cited Gross Bookings of "more than $58 billion," up 22% year-on-year, against reported Q2 2026 revenue of $14,191mm — implying an overall take rate in the mid-20s percent [Q2 FY2026 earnings call transcript, prepared remarks, Aug-05-2026; UberTechnologies,IncNYSEUBEREstimatesReport(1).xls, Consensus tab, FQ2 2026 actual]. What drives **volume** (Gross Bookings): the number of trips and orders, the number of first-time and repeat users, and how deep Uber has penetrated "sparse markets" (management said under 10% of eligible U.S. consumers in sparse markets used Uber in the past year, versus over 50% in dense markets) [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. What drives **price/mix**: the fare or delivery fee charged per trip/order, and the shift toward lower-priced products (2- and 3-wheelers, "Wait & Save") that bring in new, more price-sensitive users at a lower ticket [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. What drives the **take rate itself**, and therefore margin: driver/courier incentive spend, insurance costs (a disclosed tailwind in 2026, partly reinvested into pricing), and one-off regulatory reclassifications — the CFO flagged a U.K. "business model change" that mechanically cut the reported Mobility take rate by roughly 500 basis points (400bps of it purely an accounting reclass of a cost line, not an economic change) [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026].

## 3. Business Type Classification

A global, asset-light, multi-sided marketplace that takes a commission on gross transaction volume across three businesses — ride-hailing, food/goods delivery, and freight brokerage — while funding an early-stage, largely off-balance-sheet bet on autonomous-vehicle commercialization.

## 3a. Sector Overlay & Required-KPI Checklist

Uber's classified type — a multi-sided, take-rate transaction marketplace (ride-hailing / on-demand delivery / freight brokerage) — does not match any row in `frameworks/SECTOR_OVERLAYS.md` (SaaS, bank, insurer, REIT, miner, oil & gas, retail, telecom, asset manager, pharma). **No sector overlay for multi-sided take-rate marketplace (ride-hailing / delivery / freight brokerage) — generic read.** The engine's default "Generic operating company" grammar (volume, price/mix, utilization, order book/backlog, segment mix, working-capital cycle) applies instead. Read against the pool:

| Generic KPI | Present / Absent in pool | Evidence |
|---|---|---|
| Volume (Gross Bookings, trips) | Present (qualitative, transcript-only — no CIQ tab carries a Gross Bookings time series) | "$58 billion" Gross Bookings, +22% YoY [Q2 FY2026 earnings call transcript, prepared remarks, Aug-05-2026] |
| Price/mix (take rate, fare/fee levels) | Present (transcript only) | Mobility take rate discussion, ~500bps YoY decline [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026] |
| Utilization (driver/vehicle, AV trips-per-vehicle-per-day) | Partial — qualitative only, no disclosed number series | "mid- to high 20s, low 30s" trips per AV per day [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026] |
| Order book / backlog | Not applicable to this business model (no contracted backlog concept for a spot marketplace) | — |
| Segment mix | Present | Mobility/Delivery/Freight revenue & EBITDA by year [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2020–FY2025] |
| Working-capital cycle | Absent from this agent's review — a Cash Flow tab exists in the pool but was not examined for this task | Uber Technologies Inc NYSE UBER Financials.xls, Cash Flow tab (unreviewed here) |

**Data gap flagged:** Gross Bookings — the single most important volume metric for this business model — appears only as a one-off, unaudited number quoted by management on the earnings call, with no multi-period CIQ or filing time series in this pool. The FY2025 10-K itself (which would carry the audited Gross Bookings, take-rate, and Monthly Active Platform Consumer disclosures) is absent from the pool [confirmed in `00_data-triage.md`, §3]. This caps confidence in any volume/take-rate trend read until the primary filing or investor deck is added.

## 4. What Drives Variance

Revenue and Gross Bookings growth move mostly on **volume** — trip and order frequency, first-time-user adds, and penetration of under-served ("sparse") markets and lower-cost product tiers (2/3-wheelers, Wait & Save) — which management said is broad-based rather than tied to a one-off event like the World Cup [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. Margin moves mostly on **take rate and mix**: driver/courier incentive spend, insurance-cost trends, and accounting-driven reclassifications (the U.K. change) can swing the reported take rate by hundreds of basis points without changing the underlying economics, so management explicitly told investors to look at the operating-income margin (Mobility operating margin cited at 7.6%) rather than the headline take rate [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. Segment mix also matters mechanically — Delivery and Freight run at structurally different EBITDA margins than Mobility, so a shift in revenue mix between segments moves consolidated margin even if each segment's own margin is unchanged [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2025]. Finally, bolt-on M&A (Trendyol Go, Getir, Careem reconsolidation, and the pending Delivery Hero deal) adds and removes Gross Bookings and revenue mechanically on a lapping basis, separate from organic growth or pricing [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026].



---

## business-model / 03_segment-map.md

_Source: `03_segment-map.md`_

# Segment Map — UBER

## 0. Sourcing Note

No primary 10-K or 10-Q is present in the data pool (`data/UBER/`) — confirmed in `00_data-triage.md`. The FY2025 Form 10-K was filed 2026-02-13 [Uber Technologies Inc NYSE UBER Financials.xls, Capital Structure Details tab, "Source: A[nnual filing] 2025 filed Feb-13-2026"], but the document itself is absent from the pool. All segment revenue and profit figures below are vendor-parsed from that 10-K's segment note by S&P Capital IQ (the "Segments" tab explicitly states it reflects Uber's audited segment disclosures, "Restatement: Latest Filings"). Per CLAUDE.md §5, these are cited as the Capital IQ export, not as the 10-K itself, since the underlying filing cannot be directly verified in this pool. No `ciq_facts.json` sidecar exists for this run (confirmed absent in triage) — there is nothing to reconcile against; this is the only quantitative segment source available. Downstream agents should re-verify against the primary 10-K once it is added to the pool.

## 1. Segment Table

FY2025 figures (fiscal year ended Dec-31-2025, the latest annual segment disclosure in the pool). Revenue and EBITDA figures per [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2025 column, filed 2026-02-13].

| Segment | What It Does | Revenue Share | Profit Share (of total company EBITDA) | Margin Quality | Capital Intensity | Cyclicality | Main Risk |
|---|---|---:|---:|---|---|---|---|
| Mobility | Ridesharing, carsharing, micromobility, rentals, taxis, plus financial-partnership and advertising products [UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf, Business Description] | 57.0% ($29,670mm of $52,017mm total) | 90.5% ($7,899mm of $8,730mm total EBITDA) | High — segment EBITDA margin 26.6% in FY2025, up from 19.2% in FY2020, improving every year in between [Financials.xls, Segments tab] | Low (asset-light marketplace; drivers own vehicles) | Mid — travel/discretionary-spend sensitive, but FY2020 COVID trough (margin -0%, near breakeven) shows real cyclical downside | Regulatory reclassification of drivers as employees; AV disruption to the driver-supply model |
| Delivery | Restaurant, grocery, alcohol, and retail delivery marketplace; Uber Direct white-label delivery-as-a-service; advertising [CIQReportLandscape.rtf, Business Description] | 33.2% ($17,248mm of $52,017mm total) | 40.9% ($3,572mm of $8,730mm total EBITDA) | Mid — segment EBITDA margin improved from -22.4% (FY2020) to +20.7% (FY2025), but the segment ran negative or near-zero EBITDA for its first two disclosed years [Financials.xls, Segments tab] | Low (asset-light; couriers, mostly gig workers) | Mid — grew hard through the pandemic, decelerating since; recent quarter shows Trendyol Go divestiture creating a reported-growth headwind [Q2 2026 transcript, l.700-701] | Thin structural margins versus Mobility; heavy reliance on restaurant/retail take rates that face competitive and regulatory pressure |
| Freight | Digital marketplace connecting shippers and carriers; on-demand logistics automation for SMB-to-enterprise shippers [CIQReportLandscape.rtf, Business Description] | 9.8% ($5,099mm of $52,017mm total) | -0.38% (-$33mm of $8,730mm total EBITDA) | Low — segment EBITDA has been negative or flat-to-breakeven in 5 of the last 6 disclosed fiscal years (FY2020 -22.5%, FY2021 -6.1%, FY2022 0.0%, FY2023 -1.2%, FY2024 -1.4%, FY2025 -0.65%) [Financials.xls, Segments tab] | Mid (brokerage model, but exposed to freight-market rate cycles) | High — revenue fell from a FY2022 peak of $6,947mm to $5,099mm in FY2025 (-27% over 3 years), tracking the broader trucking freight recession [Financials.xls, Segments tab] | Structurally sub-scale relative to Mobility/Delivery; exposed to a freight-rate downcycle the other two segments do not share |
| Corporate G&A and Platform R&D (unallocated) | Central overhead and shared platform R&D not allocated to a segment [Financials.xls, Segments tab] | Not a revenue line (0% of revenue) | -31.0% (-$2,708mm of $8,730mm total EBITDA) | Not applicable — this is a cost center, not a profit segment | n/a | n/a | Largest single drag on consolidated EBITDA; not broken out by function, so R&D vs. G&A cannot be separated from the pool data |

Revenue shares sum to 100.0% ($29,670 + $17,248 + $5,099 = $52,017mm total, matching the disclosed "Total Revenues" line exactly) [Financials.xls, Segments tab]. Profit shares (of total EBITDA) sum to 100.0% (90.5% + 40.9% − 0.4% − 31.0% = 100.0%); note these four rows are not independent "segments" in the same sense — Mobility, Delivery, and Freight are the three reportable operating segments, while Corporate G&A/Platform R&D is unallocated overhead the company nets against them to reach consolidated EBITDA. An "ALL Other" line existed in FY2020–FY2021 (revenue $135mm / $8mm) but has been zero/blank since FY2022 — not a current disclosure gap.

Supplementary margin data point from the Q2 FY2026 call (not comparable to the annual EBITDA-margin figures above, which are a different metric): CFO Balaji Krishnamurthy stated Mobility operating income margin "remains very strong at 7.6%" for the quarter [Q2 2026 transcript, l.518-519] — operating income nets out D&A and stock-based compensation differently than the segment-EBITDA figures in the table, so the two are not directly comparable line items.

## 2. Dominant Segment

Mobility is the dominant segment by both measures, and by a wide margin on profit. It generated 57.0% of FY2025 revenue ($29,670mm of $52,017mm) and 90.5% of FY2025 total-company EBITDA ($7,899mm of $8,730mm) [Financials.xls, Segments tab]. Even measured against the segment-level profit pool before corporate overhead is subtracted (Mobility $7,899mm + Delivery $3,572mm + Freight -$33mm = $11,438mm), Mobility still supplies 69.1% of segment-level EBITDA. Delivery is a real second segment (33.2% of revenue, a meaningful and improving profit contributor) — this is not a single-segment company in the >85%-threshold sense — but Mobility is unambiguously where the value sits, and Freight is immaterial to profit (a rounding error on total EBITDA, and shrinking).

## 3. Segment Disclosure Quality

Segment definitions have been consistent across the disclosed period: the same three reportable segments (Mobility, Delivery, Freight) appear in every fiscal year from FY2020 through FY2025, with the FY2020–FY2021 "ALL Other" bucket (an immaterial ≤1.2% of revenue) disappearing by FY2022 rather than growing — a shrinking, not a widening, "Other" problem. Both revenue and EBITDA are disclosed at the segment level for all six years, which is better disclosure than many peers provide (some competitors report segment revenue only). The main disclosure gap is the "Corporate G&A and Platform R&D" line: it is disclosed as a single unallocated cost pool (-$2,708mm in FY2025, equal to -31% of total EBITDA) with no split between general administrative cost and platform R&D spend — this matters because it obscures how much of Uber's cost base is genuinely fixed overhead versus discretionary technology investment (including AV/autonomous-vehicle R&D discussed extensively on the Q2 2026 call). One live change to watch: management announced an agreement to acquire Delivery Hero during the Q2 2026 call [Q2 2026 transcript, l.145-148, l.604-613] — if consummated, this will materially change the Delivery segment's geographic and revenue mix in future filings, and the three-segment structure used in this report may not hold in the FY2026 10-K. No investor deck was available in the pool to cross-check these shares against management's own slide presentation; cross-checking against a primary 10-K/investor deck is a priority for the next data refresh.

## 4. Citations

- FY2025 segment revenue ($29,670mm Mobility / $17,248mm Delivery / $5,099mm Freight / $52,017mm total): [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2025 column]
- FY2025 segment EBITDA ($7,899mm Mobility / $3,572mm Delivery / -$33mm Freight / -$2,708mm Corporate / $8,730mm total): [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2025 column]
- FY2020–FY2024 segment revenue and EBITDA history (used for margin-trend and cyclicality reads): [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, all columns]
- Segment business descriptions (what each segment does): [UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf, Business Description section]
- FY2025 10-K filing date (2026-02-13), confirming the vintage of the underlying segment note: [Uber Technologies Inc NYSE UBER Financials.xls, Capital Structure Details tab]
- Mobility Q2 FY2026 operating income margin (7.6%), supplementary/non-comparable metric: [Uber Technologies, Inc., Q2 2026 Earnings Call transcript, Aug-05-2026, CFO remarks, l.518-519]
- Delivery Hero acquisition announcement and Trendyol Go divestiture impact on Delivery reported growth: [Q2 2026 transcript, l.145-148, l.700-701]
- No primary 10-K/10-Q or investor deck in pool: [analyses/UBER_2026-08-06/business-model/00_data-triage.md, Sections 1–3]



---

## business-model / 04_unit-economics.md

_Source: `04_unit-economics.md`_

# Unit Economics — UBER

## 0. Sourcing Note

As flagged in `03_segment-map.md`, no primary 10-K or 10-Q sits in the data pool (`data/UBER/`) — confirmed in `00_data-triage.md`. Uber's own filings normally carry an audited supplemental table of Trips, Monthly Active Platform Consumers (MAPCs), and Gross Bookings by segment; that table is absent from this pool. The only per-unit-adjacent numbers available come from the Q2 2026 earnings call transcript (management commentary, not an audited figure) and from the Capital IQ-parsed segment financials already used in `03_segment-map.md`. Every row below states plainly whether a number is filing-grade, transcript-grade, or genuinely undisclosed.

## 1. Natural Unit

The natural economic unit for Mobility (the dominant segment — 57.0% of FY2025 revenue and 90.5% of FY2025 total-company EBITDA [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2025 column]) is **the trip** — one completed ride booked and paid for through the app.

Uber's own framing of the economics: `Revenue = Gross Bookings (the fare the rider pays) × take rate (the slice Uber keeps after paying the driver)` [Q2 FY2026 earnings call transcript, prepared remarks, Aug-05-2026, per `02_business-identity.md`]. The secondary unit types are **the order** (Delivery — 33.2% of FY2025 revenue) and **the shipment/load** (Freight — 9.8% of FY2025 revenue, and currently EBITDA-negative [`03_segment-map.md`, §1]).

## 2. Unit Economics Table

| Unit Economic | Value | Period | Direction vs Prior Year (Improving / Stable / Deteriorating / Unknown) | Evidence |
|---|---|---|---|---|
| Revenue per trip | Not disclosed — no trip count appears anywhere in the pool, so revenue cannot be divided by trip volume. The closest available proxy is the **take rate** (revenue ÷ Gross Bookings), which runs in the mid-20s% company-wide: Q2 2026 revenue $14,191mm ÷ Gross Bookings "more than $58 billion" ≈ 24–25% [UberTechnologies,IncNYSEUBEREstimatesReport (1).xls, Consensus tab, FQ2 2026 actual; Q2 2026 transcript, prepared remarks]. | Q2 2026 (proxy only) | Deteriorating for Mobility specifically — CFO states the Mobility take rate on reported revenue fell ~500 basis points year-on-year, though he attributes ~400bps of that to a U.K. accounting reclassification ("optical," moving cost out of cost-of-revenue) rather than a change in real economics, and says the *net* take rate disclosed in the 10-Q "will largely show take rate remaining broadly stable" [Q2 2026 transcript, Justin Post Q&A, Balaji Krishnamurthy] | [Q2 2026 transcript, Justin Post Q&A, l.508-520]; [UberTechnologies,IncNYSEUBEREstimatesReport (1).xls, Consensus tab] |
| Gross margin per trip | Not disclosed at the trip level. Best available proxy: **Mobility segment EBITDA margin** (a segment-level, not per-trip, figure) = 26.6% in FY2025, up from 19.2% in FY2020 [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, per `03_segment-map.md` §1] | FY2020–FY2025 | Improving — every disclosed year shows a higher segment EBITDA margin than the last, including recovery from a near-breakeven FY2020 COVID trough [`03_segment-map.md`, §1, citing Financials.xls, Segments tab] | [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2020–FY2025 columns] |
| Contribution margin per trip (after variable costs) | Not disclosed. A different, non-comparable metric exists: Mobility **operating income margin** (nets out D&A and stock-based compensation differently than segment EBITDA) was "very strong at 7.6%" for Q2 2026, per the CFO [Q2 2026 transcript, l.518-519]. This cannot be reconciled to the FY2025 26.6% segment-EBITDA figure above because the two use different cost bases — management itself flags them as not directly comparable. | Q2 2026 | Unknown — no prior-year operating-income-margin figure is disclosed in this pool to compare against | [Q2 2026 transcript, CFO remarks, l.518-520]; [`03_segment-map.md`, §1] |
| Cost to acquire / build the unit (driver incentive, rider promotion, or courier-acquisition cost per trip) | Not disclosed. The company only discloses total Selling & Marketing expense at the consolidated level, not allocated per segment or per trip: $4,789mm (FY2021) rising to $7,098mm (FY2025) in absolute dollars, but *falling* as a share of revenue from 27.4% to 13.6% over the same period [Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab, FY2021 and FY2025 columns] | FY2021–FY2025 | Improving (as a share of revenue) — but this is a company-wide ratio, not a per-trip cost, and mixes rider promotions, driver incentives, brand marketing and delivery-side courier acquisition together with no segment split | [Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab, "Selling and Marketing Exp." row, FY2021–FY2025 and LTM Jun-2026 columns] |
| Payback period or unit lifetime | Not disclosed. No cohort, vintage, or driver/rider lifetime-value data appears anywhere in the pool. | Not disclosed | Unknown | Not disclosed |

Where data is not disclosed, this is written explicitly above rather than estimated — no peer or industry figure has been substituted.

## 3. Value Creation Read

**Unclear from disclosure, but the directional evidence available leans toward "creates value."** The only genuinely per-unit-adjacent, filing-grade figure available — Mobility's segment EBITDA margin — has improved every year for six straight years (19.2% in FY2020 to 26.6% in FY2025 [`03_segment-map.md`, §1]), and company-wide Selling & Marketing spend (which includes rider/driver incentives, the main "cost to acquire a trip") has fallen from 27.4% to 13.6% of revenue over FY2021–FY2025 [Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab] — both point toward each marginal trip contributing more, not less, over time. However, the formal unit-economics test (contribution margin × unit lifetime > acquisition cost) cannot actually be computed from this pool: there is no trip count, no per-trip contribution margin, no per-driver acquisition cost, and no cohort or lifetime-value disclosure anywhere in the data provided. The single most valuable missing disclosure is Uber's own supplemental Trips / Monthly Active Platform Consumers (MAPCs) / Gross Bookings table, which is a standard part of its 10-K and 10-Q filings but is absent from this data pool — without it, "value creation" here is an inference from margin trend, not a computed unit-economics result. Note also that the segment-level margin read sits in a period that already includes a full cyclical trough (FY2020, near-zero Mobility EBITDA margin) and a strong recovery since, which somewhat protects this read from being a pure peak-cycle artifact — but the current period (FY2025/Q2 2026) still reflects post-pandemic pricing and insurance-cost tailwinds that management itself describes as being actively "reinvested" rather than banked, so the current margin level should not be read as a permanent structural floor [Q2 2026 transcript, Eric Sheridan Q&A, Balaji Krishnamurthy].

## 4. Sensitivity

Of the inputs visible in this pool, **take rate** is the one that would most change the value-creation read if it moved 20% — because Uber's own cost base per trip (driver payout, technology platform, and the S&M/incentive spend above) is set once the fare is split, so a 20% swing in the percentage Uber keeps of each Gross Booking dollar flows close to directly into Mobility's segment margin. The evidence shows this input is not stable in practice: the CFO reports a ~500-basis-point year-on-year swing in Mobility's *reported* take rate in a single quarter, and even after backing out the ~400bps U.K. reclassification, a real ~100bps of the move was "deliberate investment" in lower-cost products (Moto in Brazil) [Q2 2026 transcript, l.508-520]. Historically, though, the **cost-to-acquire input (S&M/incentive spend as a share of revenue)** has moved even further — from 27.4% of revenue in FY2021 to 13.6% in FY2025, a swing of roughly half — making it the most volatile lever visible in this pool, even though it is disclosed only at the consolidated level, not per trip [Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab]. A 20% move in either direction — take rate compressing under competitive or regulatory pressure, or incentive spend reversing back toward its FY2021 level — would be enough to erase several years of the margin improvement documented in Section 2.



---

## business-model / 05_customer-geography.md

_Source: `05_customer-geography.md`_

# Customer And Geography Map — UBER

## 0. Data Note

No primary annual filing (10-K) is present in this data pool — only Capital IQ vendor exports and the Q2 2026 earnings call transcript [00_data-triage.md, §2A/§3]. The geographic and segment revenue split below comes from a Capital IQ export that the vendor states is parsed from Uber's own FY2025 10-K segment note ("Restatement: Latest Filings," filing date shown as 2026-02-13) [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab]. Per CLAUDE.md §5/§27, this is cited as the vendor export, not as the 10-K itself, because the 10-K document is not in the pool to verify against. Uber does not disclose individual named customers anywhere in this pool — this is expected for a consumer marketplace with millions of riders and eaters, not a B2B supplier with a handful of accounts.

## 1. Customer Map

Uber does not disclose customer concentration by name or count (no "Customer A accounts for X%" language anywhere in the pool). Its revenue is inherently atomized across individual consumers rather than concentrated in a few paying accounts, so the table below uses the customer-TYPE breakdown the company does disclose — its three reporting segments, each serving a structurally different payer — rather than fabricating named accounts.

| Customer Type | Importance (% of FY2025 revenue) | Long-term Contract? (Y/N/Not disclosed) | Evidence | Risk |
|---|---|---|---|---|
| Mobility riders (individual consumers booking rides, one trip at a time) | 57.0% ($29,670M of $52,017M total) | N — per-trip transactional, no contract | [Capital IQ export, UBER Financials.xls, Segments tab, FY2025]; segment description in [Company Comparable Analysis — Business Description tab, as-of 2026-08-06] | Low per-customer risk (millions of riders), but revenue is 100% transactional — no backlog or contracted revenue cushions a demand shock |
| Delivery consumers and merchant partners (restaurants/retailers on the marketplace, plus Uber Direct white-label enterprise clients) | 33.2% ($17,248M of $52,017M total) | Not disclosed for consumer orders; Uber Direct enterprise contracts likely exist but terms/duration/count are not disclosed in this pool | [Capital IQ export, UBER Financials.xls, Segments tab, FY2025]; Uber Direct described in [Business Description tab] | Same transactional exposure as Mobility on the consumer side; merchant mix (single large chain vs many small restaurants) is not disclosed |
| Freight shippers and carriers (B2B logistics marketplace connecting shippers with truck carriers) | 9.8% ($5,099M of $52,017M total) | Not disclosed — no shipper-count or contract-term detail in this pool | [Capital IQ export, UBER Financials.xls, Segments tab, FY2025]; segment description in [Business Description tab] | This is the one segment structurally capable of customer concentration (B2B, fewer counterparties than a consumer app), but no shipper-concentration disclosure exists in this pool to confirm or rule it out |

**Not disclosed:** any named top customer, any percentage of revenue tied to a single payer, and any Freight shipper-count or contract-duration detail. Absence here is a pool gap (no 10-K risk-factor section is present), not evidence that no concentration exists in Freight.

## 2. Geography Map

FY2025 revenue by geographic segment [Capital IQ export, UBER Financials.xls, Segments tab, FY2025; vendor-stated as parsed from the FY2025 10-K geographic note]:

| Geography | % of Revenue | Trend (Growing / Stable / Declining / Unknown) | Evidence | Risk |
|---|---:|---|---|---|
| United States and Canada | 50.9% ($26,469M) | Declining share — was 57.8% of revenue in FY2021 ($10,094M/$17,455M) and 61.1% in FY2022, down to 50.9% by FY2025 | [Capital IQ export, UBER Financials.xls, Segments tab, FY2021–FY2025] | Largest single geography and still just over half of revenue — see Flag 3 below |
| Europe, Middle East and Africa (EMEA) | 31.5% ($16,364M) | Growing — up from 18.4% of revenue in FY2021 ($3,213M/$17,455M) to 31.5% in FY2025, the fastest-growing region by share | [Capital IQ export, UBER Financials.xls, Segments tab, FY2021–FY2025]; growth partly acquisition-driven — management cites the Trendyol Go, Getir (Turkey), and Careem re-consolidation deals as adding to Delivery bookings in the region [Q2 2026 Earnings Call transcript, Aug-05-2026, prepared remarks] | Growth mix includes M&A roll-up in Turkey/Middle East delivery, not purely organic — durability of the acquired revenue is unproven from this pool |
| Asia Pacific (APAC) | 11.3% ($5,857M) | Growing modestly — 15.6% of revenue in FY2021 ($2,731M/$17,455M) fell to 10.9% in FY2022 before recovering to 11.3% by FY2025 | [Capital IQ export, UBER Financials.xls, Segments tab, FY2021–FY2025] | Smallest of the four regions; competitive intensity from regional players (Grab, DiDi) is visible in the peer comp set [Company Comparable Analysis — Business Description tab] |
| Latin America (LATAM) | 6.4% ($3,327M) | Roughly stable — 8.1% of revenue in FY2021 down to 6.4% by FY2025 | [Capital IQ export, UBER Financials.xls, Segments tab, FY2021–FY2025]; management flags intensifying 2-wheeler delivery competition in Brazil against iFood affecting trip volumes even as share holds [Q2 2026 Earnings Call transcript, Aug-05-2026, prepared remarks] | Competitive pressure in the largest LATAM market (Brazil) is pushing incentive spend from Mobility to Delivery, per management [Q2 2026 Earnings Call transcript] |
| **Total** | **100.0% ($52,017M)** | — | [Capital IQ export, UBER Financials.xls, Segments tab, FY2025] | — |

Additional within-US color: management states only 30% of U.S. gross bookings and 25% of U.S. profits come from the top 20 U.S. cities, with "the long tail of thousands of other cities and suburbs" the primary growth and profit engine — i.e., within the largest geography, revenue is itself spread across a long tail of markets rather than concentrated in a handful of metros [Q2 2026 Earnings Call transcript, Aug-05-2026, prepared remarks].

## 3. Concentration Flags

| Concentration Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| One customer >20% of revenue | N | No named customer disclosed anywhere in the pool; Uber's Mobility and Delivery revenue is spread across millions of individual consumers by business-model design [Business Description tab]. Freight (9.8% of revenue) is the one segment structurally capable of a concentrated shipper, but no shipper-level disclosure exists to test this — flagged as a genuine data gap, not a clean pass |
| Top 3 customers >40% of revenue | N | Same reasoning — no named-customer disclosure exists in this pool to evaluate |
| One geography >50% of revenue | **Y** | United States and Canada = 50.9% of FY2025 revenue ($26,469M of $52,017M total) [Capital IQ export, UBER Financials.xls, Segments tab, FY2025] |
| One customer or geography >30% with no long-term contract disclosed | **Y** | United States and Canada (50.9%) and EMEA (31.5%) both exceed 30% of revenue; the business is transactional per-trip/per-order revenue with no long-term contract structure disclosed for either region [Capital IQ export, UBER Financials.xls, Segments tab, FY2025] |

## 4. Read

Uber is geographically concentrated but not customer-concentrated in the way that word usually implies: the U.S. and Canada still supply 50.9% of FY2025 revenue ($26,469M of $52,017M) [Capital IQ export, UBER Financials.xls, Segments tab], and that share plus EMEA's 31.5% together clear the >30%-with-no-contract flag, but the underlying payer base within each geography is millions of individual riders and eaters, not a handful of accounts. The concentration that exists is naked in the specific sense that per-trip and per-order revenue carries no long-term contract of any kind — a regulatory or demand shock in the U.S., where half of revenue sits, hits immediately with no contracted backlog to cushion it. The single biggest dependency the synthesizer should know: just over half of Uber's revenue still depends on the U.S. and Canada regulatory and competitive environment, with no long-term contract structure anywhere in the business to smooth a shock there, even as EMEA's rising share (18.4% to 31.5% since FY2021) is partly acquisition-driven (Trendyol Go, Getir, Careem) rather than fully organic [Capital IQ export, UBER Financials.xls, Segments tab; Q2 2026 Earnings Call transcript, Aug-05-2026].



---

## business-model / 06_value-chain.md

_Source: `06_value-chain.md`_

# Value Chain Position — UBER

**Data-pool caveat:** No primary FY2025 10-K or 10-Q is present in this pool — only Capital IQ vendor exports of the 10-K's line items and the FQ2 2026 (Aug-05-2026) earnings-call transcript [confirmed in `00_data-triage.md`, §1–§3]. This means the Item 1A Risk Factors text (which would normally carry supplier/driver-concentration and insurance-cost disclosure) and the MD&A narrative are not directly readable. Everything below is built from management's own comments on the Q2 2026 call, the Capital IQ segment workbook, and the upstream business-identity output — not from the primary filing's own risk-factor or supplier-note language. Where a number is not disclosed anywhere in this pool, this report says so rather than inventing one.

## 1. Stages Occupied

| Value Chain Stage | Company Role (1 sentence) | Bargaining Power vs Upstream | Bargaining Power vs Downstream | Evidence |
|---|---|---|---|---|
| Platform / marketplace (Mobility) | Runs the app, matching algorithm and payment rails connecting riders to independent drivers, taking a commission on each fare without owning any vehicle [`02_business-identity.md`, §1–2] | Mid | Mid | Mobility take rate fell ~500bps YoY in Q2 2026 (400bps from a U.K. regulatory reclassification, the rest from deliberate pricing investment in lower-cost products), which the company absorbed rather than fully passing through — a sign it does not fully control terms on either side of this stage [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026] |
| Platform / marketplace (Delivery) | Runs the app connecting eaters to couriers and to restaurants/retailers, taking a commission on order value plus delivery fees [`02_business-identity.md`, §1–2] | Weak-to-Mid | Mid | In Brazil, "the cost of securing that supply has gone up pretty significantly" as rival delivery apps (DiDi Food, Meituan-backed) bid for the same 2-wheeler couriers, forcing Uber to shift incentive spend from consumers to couriers to hold supply [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026] |
| Platform / marketplace (Freight) | Runs a digital brokerage matching shippers with trucking carriers, earning a spread rather than owning trucks [`02_business-identity.md`, §1; `03_segment-map.md`, Freight row] | Weak | Weak | Freight segment EBITDA has been negative or near-breakeven in 5 of the last 6 disclosed fiscal years (FY2020 −22.5% margin through FY2025 −0.65%), tracking the broader trucking freight cycle Uber does not set [`03_segment-map.md`, Freight row, citing Financials.xls Segments tab] |
| Emerging: AV commercialization intermediary | Positions itself as the demand-and-distribution layer that autonomous-vehicle makers (Waymo, Wayve, Zoox, Nuro, Pony, Baidu, Lucid/Nuro) plug into, funding this with ~$10bn of equity stakes and 120,000 vehicle-purchase commitments rather than building its own AV technology [`02_business-identity.md`, §1] | Weak | Not yet monetized | Management explicitly said it wants to avoid dependence on any single AV partner ("we're absolutely seeing a plethora of newer players... we want to make sure that we're not dependent on one partner") — an admission that today it needs the AV makers more than they need it, since Uber owns no self-driving technology of its own [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026] |

Bargaining power bands:
- **Strong:** Company sets price, dictates terms, has alternatives
- **Mid:** Negotiated outcomes, no extreme leverage either way
- **Weak:** Price-taker, terms imposed, few alternatives

## 2. Input Cost Pass-Through

Uber's main "input" is not a physical raw material but the cost of paying and retaining drivers/couriers (incentive spend) and the cost of insurance that covers them — both of which sit inside the take-rate calculation rather than a separate cost-of-goods line. The evidence in this pool shows partial, lagged, and sometimes involuntary pass-through rather than a clean contractual escalator. On the cost side, insurance "is becoming a tailwind this year," but instead of banking the saving or passing it through as higher margin, management is "reinvesting the savings from insurance back into the market," particularly in California [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026] — i.e., a favorable input-cost swing is being spent on lower prices/incentives to drive volume, not kept as margin. On the driver/courier-supply side, when local competition for delivery couriers intensified in Brazil, Uber responded by "moving incentives that we kind of put on the consumer side... to the delivery side" — a real-time reallocation of subsidy toward the supply side to defend courier availability, which is a cost absorbed by Uber, not passed to the consumer [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. The one clear instance of an involuntary, non-negotiated cost/revenue reclassification is the U.K. "business model change," which mechanically cut the reported Mobility take rate by ~400 of ~500 basis points year-on-year — a regulator-imposed shift of a cost line, not a pass-through Uber chose or priced for [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. No contractual indexed-pricing or escalator clause with drivers, couriers, restaurants, or carriers is disclosed anywhere in this pool.

**Supplier / input concentration (quantify).** Uber's "suppliers" are millions of independent drivers, couriers, and (in Freight) trucking carriers rather than a small vendor base, so classic supplier-concentration metrics (% of COGS from top supplier, sole-source inputs) do not apply the way they would for a manufacturer. No filing in this pool discloses driver or carrier count, geographic concentration of driver supply, or single-source dependency on any one fleet, courier network, or freight carrier — this is a genuine gap, not a zero. The closest disclosed dependency is at the AV-commercialization layer, which is not yet a revenue driver but is a real forward capital commitment: Uber has made equity investments and offtake commitments (120,000 vehicles) concentrated in a short list of named AV-software partners (Waymo, Wayve, Zoox, Nuro, Pony, Baidu) and vehicle OEMs (Lucid, Rivian), and management itself flagged this as a material single-partner risk today by noting it does not want to be "dependent on one partner" (Waymo) [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. On vehicle-OEM delivery risk specifically, the CEO was asked directly about "Lucid's ability to make those vehicle commitments given some recent news in the press," and answered that Lucid's new CEO is "taking some bold steps to... refactor the cost base" — management's own words acknowledging execution risk at a named, concentrated supply partner for the AV vehicle commitment [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. Beyond this, no other raw-material or single-source input concentration is quantified or disclosed in this pool — **not proven from available data.**

## 3. Customer Pricing Power

The evidence points to limited, mix-driven pricing power rather than the ability to simply raise prices and keep volume. Management's own growth narrative for the last 24 months centers on introducing lower-priced products — 2- and 3-wheelers globally, "Wait & Save" in the U.S. (which "allows consumers to kind of trade off time against price") — specifically to "introduce a whole new sector of consumers onto the platform" at a lower ticket, which is price-cutting into new segments, not price-raising on the existing base [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. Where Uber has raised effective prices, it has done so through premium product tiers additive to the base fare (Reserve, Uber for Business, Black) rather than a broad fare hike — U4B grew 40% year-on-year, but that is volume/mix growth in a higher-margin product line, not a price increase on the mainline product [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. The clearest test of pricing power against a real substitute came in Brazil, where rising local competition (DiDi, DiDi Food, Meituan-backed entrants) forced Uber to increase courier incentive spend rather than hold price — management said Uber "continue[s] to hold our share in Brazil" only by shifting subsidy, and that trip volumes in mobility were hurt by competition from outside its own category (delivery apps bidding for the same 2-wheeler supply) [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. No explicit, broad-based fare or delivery-fee increase with a disclosed volume reaction appears in this pool over the last 24 months — the disclosed pricing actions are narrower (premium-tier upsell, insurance-saving reinvestment into lower prices) and net toward defending or growing volume rather than testing price elasticity upward.

## 4. Economic Control Verdict

**Mixed.**

Uber sets its own take rate and product mix and can reallocate incentive spend across segments and geographies at will — real, working levers that produced a 26.6% Mobility segment EBITDA margin in FY2025, up from 19.2% in FY2020 [`03_segment-map.md`, Mobility row]. But it is a price-taker on two things it does not control: government-mandated cost reclassifications (the U.K. business-model change cut the reported Mobility take rate by ~400bps with no offsetting action available) and local courier/driver supply competition (Brazil, where Uber had to spend more to hold the same driver base) [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. Freight sits at the weak end on both sides — a spread-taking brokerage in a freight-rate cycle it cannot influence — but is only ~10% of group revenue and does not swing the group verdict [`03_segment-map.md`, Freight row].

## 5. The Single Biggest Bargaining Risk

Driver and courier supply in a competitive local market — as the Brazil example shows, a rival delivery or ride-hailing entrant bidding for the same gig-worker pool forces Uber to spend more to keep supply rather than set the price, and this same dynamic, applied to a larger market or compounded by a regulatory reclassification of drivers as employees (as already happened in the U.K.), would hit Mobility and Delivery margin at the same time [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026].



---

## business-model / 07_business-quality.md

_Source: `07_business-quality.md`_

# Business Quality — UBER

**Sector overlay:** Uber's classified type — a multi-sided, take-rate transaction marketplace (ride-hailing / on-demand delivery / freight brokerage) — matches no row in `frameworks/SECTOR_OVERLAYS.md` (SaaS, bank, insurer, REIT, miner, oil & gas, retail, telecom, asset manager, pharma). This is confirmed in the upstream `02_business-identity.md` §3a. **No sector overlay for multi-sided take-rate marketplace — generic 11-factor scoring applies.**

**Data-pool caveat carried forward:** no primary FY2025 10-K or 10-Q is present in the data pool — only Capital IQ vendor exports of the underlying filing's line items and the Q2 FY2026 earnings-call transcript (Aug-05-2026) [`00_data-triage.md`, §3]. Segment, income-statement, and cash-flow figures below are cited to the Capital IQ workbook tabs, per §5/§27, since the primary filing cannot be directly verified in this pool. No `ciq_facts.json` sidecar exists for this run — nothing to reconcile against.

## 1. Quality Factor Table

| Quality Factor | Score /100 | Evidence | Comment |
|---|---:|---|---|
| Pricing power *(higher = better)* | 45 | Overall take rate is mid-20s% (Q2 FY2026 Gross Bookings "more than $58 billion" vs. reported revenue $14,191mm) [Q2 FY2026 earnings call transcript, prepared remarks, Aug-05-2026]. But growth is explicitly being bought with lower prices: management cites Wait & Save and 2-/3-wheeler tiers as deliberately "introduc[ing] a whole new sector of consumers" at a lower ticket, and in Brazil, rising 2-wheeler-supply competition (DiDi Food, Meituan) is forcing Uber to shift incentive spend from Mobility to Delivery to hold share rather than raise price [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. The insurance-cost "tailwind" this year is being reinvested into price, not banked as margin [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. | Mixed — real fee-taking power on a large base, but management is trading price for volume, not holding price. |
| Repeat / recurring revenue *(higher = better)* | 48 | 100% of revenue is per-trip/per-order transactional with no long-term contract of any kind, for any customer type or geography [`05_customer-geography.md`, §1/§3]. Offsetting this: genuine repeat-usage behavior — 20% of consumers already use both Rides and Eats, and that cross-platform cohort is growing 1.5x faster than single-product users, plus a stated Uber One membership push ("bringing our technology and Uber One to millions more people") [Q2 FY2026 earnings call transcript, prepared remarks and Q&A, Aug-05-2026]. No ARR/subscription-mix or Uber One membership-count disclosure exists in this pool to quantify the stickiness. | Behavioral repeat use is real; contracted/recurring revenue is zero. |
| Customer stickiness *(higher = better)* | 45 | Millions of atomized individual riders/eaters with no named-account concentration [`05_customer-geography.md`, §1]. Cross-platform selling (Rides→Eats and back) and Uber One membership create some lock-in, but ride-hailing is a well-known multi-homing category (riders commonly run more than one app) and Uber itself frames "sparse market" growth as converting non-users, not upselling loyal ones — a sign switching costs are low at the margin [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. Freight is a B2B segment structurally capable of shipper concentration, but no shipper-level disclosure exists in the pool to test this [`05_customer-geography.md`, §1]. | Low structural switching cost for the core rider; cross-sell is the main retention lever. |
| Margin stability *(higher = better)* | 42 | Consolidated EBITDA margin swung from -16.8% (FY2021) to +12.1% (FY2025) [Financials.xls, Ratios tab, EBITDA Margin % row]. Mobility segment margin ran near breakeven in the FY2020 COVID trough before reaching 26.6% in FY2025 [`03_segment-map.md`, §1]. The improvement itself is partly exogenous, not execution: the CFO states a U.K. regulatory "business model change" mechanically cut the reported Mobility take rate by ~500bps (400bps a pure accounting reclass), and this year's insurance-cost tailwind is being reinvested rather than held as margin [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. | Trending up, but the trend is driven by regulatory/insurance swings management itself says not to read as durable — see §4. |
| Capital intensity *(low intensity = high score)* | 80 | Capex was $336mm on $52,017mm FY2025 revenue — 0.65% of revenue — with Fixed Asset Turnover of 17.0x [Financials.xls, Cash Flow tab; Financials.xls, Ratios tab]. Drivers, couriers, and carriers own the vehicles; Uber owns only the app and payment rails [`02_business-identity.md`, §1]. Discounted from a clean 90+: the ~$10bn multi-year AV commitment (equity stakes plus a 120,000-vehicle purchase commitment) is a real, growing capital call layered onto an otherwise asset-light model [Q2 FY2026 earnings call transcript, prepared remarks, Aug-05-2026]. | Asset-light core marketplace; AV bet is adding capital intensity at the margin. |
| Competitive intensity *(low intensity = high score)* | 32 | Uber competes directly against Lyft (U.S.), DiDi (Latin America, Asia), Grab (SE Asia), and DoorDash/Meituan/iFood (delivery) across every region it operates in [Company Comparable Analysis — Business Description tab, as-of 2026-08-06]. Management's own words: Brazil mobility trip volumes are being hit by "an enormous amount of competition" as DiDi Food and Meituan enter delivery and bid up 2-wheeler driver supply, forcing incentive reallocation [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. Latin America is described as "always been competitive." | Multiple, well-funded competitors in every geography; price/incentive competition is live and recent, not historical. |
| Industry rate-of-change / disruption risk *(low rate-of-change = high score)* | 35 | Management calls AV "one of the largest opportunities in Uber's history" and is committing ~$10bn over a multi-year period, spread as equity stakes across six-plus AV software partners (Waymo, Wayve, Zoox, Nuro, Pony, Baidu) specifically because "we want to make sure that we're not dependent on one partner" [Q2 FY2026 earnings call transcript, prepared remarks and Q&A, Aug-05-2026]. Spreading bets across that many unproven partners is itself the tell that the eventual winner (or whether Uber remains the intermediary at all, versus AV OEMs going direct-to-consumer) is not knowable today. AV trips are still under 0.5% of Uber's ~300 million weekly trips today, so the disruption is not imminent [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026], but the direction of travel — a driver-supply model being reengineered around a technology Uber does not own or control — is real. | See §4 — this trips the Filter 5 threshold. |
| Regulatory dependence *(low dependence = high score)* | 28 | Management's own description: "we are a highly regulated business" [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. A U.K. regulatory reclassification already cut the reported Mobility take rate by ~500bps this quarter, ~400bps of it a pure accounting reclass forced by the rule change [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. Worker/driver classification remains an open, city-by-city and state-by-state fight that "strikes directly at Uber's core independent-contractor cost structure" [`10_external-dependency.md`, §5]. Insurance cost — set by state insurance and tort-liability regimes, not by Uber — swung from headwind to tailwind this year and is being reinvested rather than banked [`10_external-dependency.md`, §1]. External-dependency agent rated Regulation "High" and the overall external-dependency score 42/100 (inverted; higher = worse) [`10_external-dependency.md`, §4]. | The single largest external variable in the whole business, by the company's own admission. |
| Commodity dependence *(low dependence = high score)* | 78 | Uber does not buy fuel directly — drivers, couriers, and carriers do — so pump prices affect driver supply/economics indirectly rather than hitting Uber's own income statement [`10_external-dependency.md`, §1]. The one segment with real commodity/cycle pass-through is Freight (9.8% of FY2025 revenue) [`03_segment-map.md`, §1], which is diesel- and spot-rate-exposed, but it is a minor share of the group. | Low direct commodity exposure at group level; concentrated and bounded in the smallest segment. |
| Cyclicality *(low cyclicality = high score)* | 38 | Both Mobility and Delivery are discretionary consumer spend; the FY2020 COVID trough took Mobility segment margin to near breakeven [`03_segment-map.md`, §1], and FY2021 group EBITDA margin was -16.8% [Financials.xls, Ratios tab]. Freight revenue fell from a FY2022 peak of $6,947mm to $5,099mm in FY2025 (-27% over three years), tracking the broader trucking freight recession, and ran negative-to-flat EBITDA in 5 of the last 6 disclosed years [`03_segment-map.md`, §1]. Current growth is itself leaning on price-sensitive product tiers explicitly designed to bring in trading-down consumers [`10_external-dependency.md`, §1]. | A real cyclical downside is visible in the record (FY2020, FY2022–25 Freight), not merely theoretical. |
| Disclosure quality *(higher = better)* | 60 | Segment revenue AND EBITDA (not revenue alone) are disclosed consistently across all six fiscal years FY2020–FY2025 for all three reportable segments, better than many peers [`03_segment-map.md`, §3]. The Q2 FY2026 call included granular, self-initiated detail — the CFO broke out the ~500bps U.K. take-rate move into its accounting-vs-economic components, and management broke the $10bn AV spend into its two component uses [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. Offsetting gaps: the Corporate G&A/Platform R&D line (-$2,708mm, -31% of FY2025 EBITDA) is not split between fixed overhead and discretionary R&D [`03_segment-map.md`, §3]; no audited Gross Bookings, take-rate, or Monthly Active Platform Consumer time series exists in this pool (only one-off transcript figures) [`02_business-identity.md`, §3a]; no FX/rate/commodity sensitivity table is disclosed [`10_external-dependency.md`, §2]. | Good segment-level disclosure and forthcoming transcript detail; some structural cost and volume metrics remain unsplit or unaudited in this pool. |

Bands: 0–20 Very weak · 21–40 Weak · 41–60 Mixed/Average · 61–80 Strong · 81–100 Very strong.

## 2. Aggregate Quality Score

**47/100 — Mixed/Average, at the low end.**

**Band anchor check:** row scores sorted ascending are 28 (regulatory dependence), 32 (competitive intensity), 35 (rate-of-change), 38 (cyclicality), 42 (margin stability), 45 (pricing power), 45 (stickiness), 48 (recurring revenue), 60 (disclosure), 78 (commodity dependence), 80 (capital intensity). The second-lowest row is 32 (competitive intensity), so the aggregate ceiling under the F43 anchor is 32 + 20 = 52. The Filter 5 rejector cap (rate-of-change ≤40 → business quality aggregate max 65, per `MODULE_RULES.md`) is looser and not binding here; the F43 anchor governs. 47 sits inside both ceilings.

**Weighting rationale:** the three lowest rows — regulatory dependence (28), competitive intensity (32), and industry rate-of-change (35) — dominate the read because they describe the structural risk to the take-rate/driver-supply model itself, the thing the whole business is priced on. Capital intensity (80) and commodity dependence (78) are real strengths but are secondary: an asset-light balance sheet does not offset a business whose take rate can move ~500bps in a quarter on a single regulatory reclassification, or whose growth is currently being defended with incentive spend against three simultaneous entrants in one country (Brazil). Recurring revenue, stickiness, margin stability, and pricing power (42–48, clustered around the mixed band) get roughly equal secondary weight; disclosure quality (60) is the one clear strength beyond the balance-sheet-related rows and is weighted lightly because it describes how well we can see the business, not how good the business is.

## 3. Strongest Factor & Weakest Factor

| | Factor | Score | Why |
|---|---|---:|---|
| Strongest | Capital intensity | 80 | Capex is 0.65% of FY2025 revenue ($336mm / $52,017mm) with Fixed Asset Turnover of 17.0x — drivers and carriers own the vehicles, Uber owns the app [Financials.xls, Cash Flow & Ratios tabs; `02_business-identity.md`, §1]. |
| Weakest | Regulatory dependence | 28 | Management's own words — "a highly regulated business" — and a U.K. rule change already moved the reported Mobility take rate ~500bps in a single quarter, with driver-classification fights ongoing city-by-city [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. |

## 4. Read

Uber is a two-sided, take-rate marketplace with an unusually asset-light balance sheet (capex under 1% of revenue) sitting on top of a business whose economics are exposed to three things it does not fully control: regulation of the independent-contractor driver model, live price/incentive competition from well-funded rivals in every region (Lyft, DiDi, Grab, DoorDash, Meituan, iFood), and a real strategic bet — roughly $10bn committed across six-plus AV partners — on whether Uber remains the rider-facing intermediary once autonomous vehicles scale, or gets disintermediated by AV makers going direct. Reported returns are currently near a cyclical/mix-driven high — Return on Capital rose from -4.85% (FY2022) to 9.36% (FY2025) and 10.59% on an LTM basis [Financials.xls, Ratios tab] — but management's own commentary shows a meaningful share of that improvement is temporary or optical: a U.K. regulatory reclassification, not organic execution, moved the reported take rate ~500bps this quarter, and this year's insurance-cost tailwind is being reinvested into price rather than held as margin [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. The FY2020 pandemic trough (Mobility margin near breakeven) and the Freight segment's -27% three-year revenue decline through the freight recession [`03_segment-map.md`, §1] are the through-cycle counterweight to today's headline ROC — a buyer should not extrapolate the current 9–11% return on capital as the steady-state level without discounting for these exogenous tailwinds. The single quality factor to watch over the next 24 months is regulatory dependence: a driver-classification ruling or new law in a major market (beyond the U.K. change already booked) would hit Mobility and Delivery simultaneously, changing unit economics across the whole platform rather than one segment or one currency block [`10_external-dependency.md`, §5].

Because the industry rate-of-change / disruption-risk row scored 35 (≤40), this reads closer to a sector / technology-cycle bet on the outcome of the AV transition than a settled, durable compounder (CLAUDE.md §24, Filter 5) — Uber itself is hedging that uncertainty by spreading $10bn across at least six unproven AV partners rather than backing one.

RF-BQ-005 (fast-changing industry: rate-of-change ≤40)



---

## business-model / 08_competitive-map.md

_Source: `08_competitive-map.md`_

# Competitive Map — UBER

## 1. Dominant Segment

Mobility (ridesharing, carsharing, micromobility, rentals, taxis) is the dominant segment — 57.0% of FY2025 revenue ($29,670mm of $52,017mm) and 90.5% of FY2025 total-company EBITDA ($7,899mm of $8,730mm) [03_segment-map.md, §2, sourcing Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2025].

## 2. Named Competitors

### Competitor A — Lyft, Inc.

- **Ticker / listing:** NasdaqGS:LYFT
- **Where they compete:** US and Canada peer-to-peer ridesharing marketplace, plus Express Drive (driver car rental) and bike/scooter micromobility — the closest like-for-like match to Uber's Mobility segment [Company Comparable Analysis Uber Technologies Inc.xls, Business Description tab, As-Of 2026-08-06].
- **Scale:** LTM total revenue $6,516.6mm (LTM through filing date 2026-05-08) [Company Comparable Analysis Uber Technologies Inc.xls, Financial Data tab, As-Of 2026-08-06]. Against Uber's Mobility-segment-only revenue of $29,670mm (FY2025), Lyft is roughly 4.6x smaller — inside the ~5x scale band even though Lyft is a fraction of Uber's total consolidated size ($55,227mm LTM).
- **Profitability / return on capital:** LTM EBITDA -$6.7mm (EBITDA margin -0.1%); LTM EBIT -$145mm (EBIT margin -2.2%) [Company Comparable Analysis Uber Technologies Inc.xls, Financial Data tab & Operating Statistics tab, As-Of 2026-08-06]. LTM net income margin is reported at 43.8% — this is inconsistent with a negative EBITDA/EBIT base for the same period and reads as a one-off, non-operating item (e.g., a tax-related credit), not recurring operating profitability; flagged here rather than used as a clean profitability comparison. ROIC/ROE: not disclosed in this comp export — not public from available data.
- **Source named in:** Capital IQ's own comp set for Uber (Company Comparable Analysis Uber Technologies Inc.xls) — Lyft is the top-ranked US peer by Capital IQ's relevancy score. Not directly named by Uber management in the Q2 FY2026 transcript in this data pool.
- **One-line read:** The direct US ridesharing rival, running near breakeven on EBITDA while Uber's Mobility segment runs a 26.6% segment EBITDA margin [03_segment-map.md, §1] — a scale and profitability gap, not a near-peer.

### Competitor B — DiDi Global Inc.

- **Ticker / listing:** OTCPK:DIDI.Y
- **Where they compete:** Ride-hailing and, per management's own Q2 FY2026 remarks, direct head-to-head competition against Uber Mobility in Latin America (Brazil specifically) and against Uber's Delivery business via "DiDi Food" [Uber Technologies, Inc., Q2 2026 Earnings Call transcript, Aug-05-2026, CEO Q&A: "We compete against DiDi, for example, locally [in Brazil]... DiDi's introduced DiDi Food"]. DiDi's home market is China, where it is not part of Uber's operating footprint.
- **Scale:** LTM total revenue $34,391.3mm (LTM through filing date 2026-06-02) [Company Comparable Analysis Uber Technologies Inc.xls, Financial Data tab, As-Of 2026-08-06] — larger than Uber's Mobility-segment-only revenue ($29,670mm), though DiDi's revenue recognition basis (its China ride-hailing business runs at very thin take rates versus Uber's Mobility segment) is not verified in this pool, so the two revenue lines are not necessarily built the same way.
- **Profitability / return on capital:** LTM EBITDA -$564.3mm (EBITDA margin -1.6%); LTM EBIT -$910mm (EBIT margin -2.6%); LTM net income margin -1.1% [Company Comparable Analysis Uber Technologies Inc.xls, Operating Statistics tab, As-Of 2026-08-06]. Negative at every profitability line shown. ROIC/ROE: not disclosed in this comp export — not public from available data.
- **Source named in:** Directly named by Uber's own CEO on the Q2 FY2026 earnings call as a local competitor in Brazil mobility and delivery [Q2 FY2026 transcript, Q&A, Aug-05-2026]; also present in Capital IQ's comp set for Uber.
- **One-line read:** The one competitor Uber management names by name on its own earnings call — a much larger but currently loss-making rival contesting Uber directly outside its China home base.

### Competitor C — Grab Holdings Limited

- **Ticker / listing:** NasdaqGS:GRAB
- **Where they compete:** Southeast Asia ride-hailing plus food/grocery delivery — the same multi-sided, take-rate marketplace model as Uber, run as a regional "superapp" [Company Comparable Analysis Uber Technologies Inc.xls, Business Description tab, As-Of 2026-08-06].
- **Scale:** LTM total revenue $3,731mm (LTM through filing date 2026-08-04) [Company Comparable Analysis Uber Technologies Inc.xls, Financial Data tab, As-Of 2026-08-06] — roughly 8x smaller than Uber's Mobility segment alone ($29,670mm). Included here as a clear regional rival despite the scale gap, consistent with the "regional/segment-specific rival even if smaller" allowance, not as a comparable-scale peer.
- **Profitability / return on capital:** LTM EBITDA $343mm (EBITDA margin 9.2%); LTM EBIT $138mm (EBIT margin 3.7%); LTM net income margin 16.0% [Company Comparable Analysis Uber Technologies Inc.xls, Operating Statistics tab, As-Of 2026-08-06]. Profitable, but at a thinner EBITDA margin than Uber's 13.5% consolidated LTM EBITDA margin and well below Uber's Mobility-segment 26.6% EBITDA margin [same source; 03_segment-map.md, §1]. ROIC/ROE: not disclosed in this comp export — not public from available data.
- **Source named in:** Capital IQ's comp set for Uber. Not directly named by Uber management in the Q2 FY2026 transcript in this data pool.
- **One-line read:** A smaller, profitable regional peer running the same multi-sided model, useful as a sanity check that a positive-EBITDA outcome is achievable at Grab's much smaller scale — Uber's segment-level margin is still well above it.

## 3. Competitive Position

Uber does not disclose a consolidated market-share number for Mobility in this data pool, and none of the three named competitors discloses one either — this is "Position vs peers: not fully disclosed," with two partial proxies. First, a direct, dated management quote: Uber's CEO said on the Q2 FY2026 call that "we continue to hold our share in Brazil" against DiDi, even as 2-wheeler delivery competition (DiDi Food, Meituan-backed entrants) pulled driver/courier supply and volume away from the Mobility side of the business there [Q2 FY2026 transcript, Q&A, Aug-05-2026] — a regional "Holding" read versus DiDi specifically, not a global one. Second, a growth-rate proxy versus Lyft: Uber's LTM total revenue grew 16.7% year-on-year versus Lyft's 9.4% [Company Comparable Analysis Uber Technologies Inc.xls, Operating Statistics tab] — consistent with Uber growing faster than its closest US peer, though this compares consolidated revenue (Mobility + Delivery + Freight) to Lyft's largely single-segment revenue, so it is a directional signal, not a clean segment-isolated share measure. Net read: Holding share against DiDi in the one region where management addressed it directly; a growth-rate proxy suggestive of Gaining against Lyft in aggregate revenue terms; no clean, disclosed global Mobility share figure exists in this pool.

## 4. Competitive Shape

The market is best described as a set of overlapping regional oligopolies rather than one global structure. No single company competes everywhere: Uber and Lyft are the two significant Capital-IQ-tracked US ridesharing marketplaces (Lyft's $6.5bn LTM revenue against Uber's $55.2bn total and $29.7bn Mobility-segment revenue is the supporting scale gap) [Company Comparable Analysis Uber Technologies Inc.xls, Financial Data tab], DiDi Global is the scale leader in China and expands opportunistically into other markets (management's own account of DiDi competing directly in Brazil shows this overlap is real, not theoretical) [Q2 FY2026 transcript, Q&A, Aug-05-2026], and Grab Holdings holds the equivalent regional position in Southeast Asia. This reads as a small-number-of-players (oligopoly-leaning) structure within any single geography, but a fragmented, multi-regional-champion structure at the global level — no HHI or top-N share disclosure exists in this pool to size the concentration more precisely.

## 5. Caveat

Uber's own FY2025 10-K — which would carry the company's own Item 1 "Competition" risk-factor language and any competitor names it chooses to disclose directly — is absent from the data pool [confirmed in `00_data-triage.md`, cited in `03_segment-map.md`, §0]. Lyft and Grab Holdings are drawn from Capital IQ's own comp-set selection for Uber (a Tier-5 vendor source, not a filing or transcript naming), not from Uber's own risk factors or management commentary in this pool; only DiDi Global is directly named by Uber's CEO in the Q2 FY2026 transcript available here. DoorDash also appears in the Capital IQ comp set but is a Delivery-segment (not Mobility-segment) rival and was excluded from the three profiles above to keep this map focused on the dominant segment per the segment-map upstream; it should be picked up if a delivery-segment competitive map is ever built separately. No peer discloses ROIC or ROE in the sources reviewed here — only EBITDA/EBIT/net-income margins were available, so the `moat` agent's competitive-economics table will need each peer's own annual filing to add a return-on-capital line. Re-verify this map once the primary 10-K (with its own Competition section) is added to the pool.



---

## business-model / 09_moat.md

_Source: `09_moat.md`_

# Moat — UBER

**Data-pool caveat carried forward:** no primary FY2025 10-K or 10-Q is present in the data pool — only Capital IQ vendor exports of the underlying filing's line items and the Q2 FY2026 earnings-call transcript (Aug-05-2026) [`00_data-triage.md`, §3; carried in `07_business-quality.md`, `10_external-dependency.md`]. No `ciq_facts.json` sidecar exists for this run. `08_competitive-map.md` is present and used as the source of named competitors — not missing.

## 1. Named Competitors

- **Lyft, Inc. (NasdaqGS:LYFT)** — direct US/Canada peer-to-peer ridesharing marketplace; ~4.6x smaller than Uber's Mobility segment alone on revenue; near-breakeven on EBITDA/EBIT [`08_competitive-map.md`, §2].
- **DiDi Global Inc. (OTCPK:DIDI.Y)** — China-based ride-hailing leader; the one rival Uber's own CEO names by name, competing directly against Uber Mobility and Delivery in Brazil; larger by revenue than Uber's Mobility segment but currently loss-making [`08_competitive-map.md`, §2].
- **Grab Holdings Limited (NasdaqGS:GRAB)** — Southeast Asia ride-hailing plus delivery "superapp," the same multi-sided model at roughly 1/8th Uber's Mobility-segment scale; the one named peer that is both profitable and structurally comparable [`08_competitive-map.md`, §2].

## 2. Moat Sources

| Possible Moat | Present? (Y/N) | Evidence | Strength /100 |
|---|---|---|---:|
| Brand | Y (weak) | Uber's LTM total revenue ($55,227mm) is ~8.5x Lyft's ($6,516.6mm) and ~14.8x Grab's ($3,731mm) [Company Comparable Analysis, Financial Data tab, As-Of 2026-08-06; `08_competitive-map.md`, §2] — real name recognition and scale. But brand is not converting into pricing power: business-quality scored pricing power only 45/100, finding management is deliberately trading price for volume via "Wait & Save" and 2-/3-wheeler tiers rather than holding price [`07_business-quality.md`, row 1]. | 35 |
| Cost advantage | Y (regional) | Uber's Mobility segment ran a 26.6% EBITDA margin in FY2025 versus Lyft's LTM EBITDA margin of -0.1% and DiDi's -1.6% [`03_segment-map.md`, §1; `08_competitive-map.md`, §2] — a real structural gap over the two closest ride-hailing peers. But this edge is not global: in Brazil, management is reallocating incentive spend from Mobility to Delivery to defend share against DiDi Food and Meituan-backed 2-wheeler entrants, meaning the cost edge is regional, not proven everywhere Uber operates [Q2 FY2026 earnings call transcript, Q&A, Aug-05-2026]. | 55 |
| Distribution | Y | 20% of Uber's consumers already use both Rides and Eats, and that cross-platform cohort is growing 1.5x faster than single-product users, reinforced by an Uber One membership push [`07_business-quality.md`, row 2]. Lyft is single-product; Grab is a comparable multi-vertical "superapp" but at roughly 1/8th Uber's Mobility-segment scale. | 50 |
| Scale | Y (vs. Lyft/Grab, not DiDi) | LTM total revenue $55,227mm vs. Lyft $6,516.6mm and Grab $3,731mm; Mobility-segment-only revenue ($29,670mm FY2025) is ~4.6x Lyft's total revenue and ~8x Grab's total revenue [`08_competitive-map.md`, §2]. DiDi is larger by revenue ($34,391.3mm LTM) but on an unverified, likely thinner take-rate basis in a different home market — not a clean like-for-like scale comparison [`08_competitive-map.md`, §2]. | 60 |
| Technology / IP | N (weak) | No patent portfolio or proprietary-technology evidence exists in this pool. On the one forward technology bet that matters (autonomous vehicles), Uber explicitly does not own the core technology — it is spreading ~$10bn in equity stakes across six-plus third-party AV software partners (Waymo, Wayve, Zoox, Nuro, Pony, Baidu) specifically "so that we're not dependent on one partner," which is itself evidence Uber cannot predict or control who wins, or whether it remains the rider-facing intermediary at all [`07_business-quality.md`, row 7]. Core dispatch/matching algorithms are not evidenced as differentiated versus Lyft/Grab/DiDi's comparable marketplace technology. | 20 |
| Licenses / regulation | N | Regulation is a headwind Uber itself names, not a barrier that keeps competitors out: "we are a highly regulated business," and a U.K. regulatory reclassification already cut the reported Mobility take rate ~500bps this quarter [`10_external-dependency.md`, Regulation row]. No evidence in this pool that any named competitor is excluded from a market Uber serves by licensing restriction. | 15 |
| Network effects | Y (diluted) | The two-sided marketplace mechanism (more riders → more driver supply → shorter wait times → more riders) is the structural driver behind Uber's segment-margin gap over Lyft. But business-quality explicitly finds multi-homing is common — "riders commonly run more than one app" — and management itself frames current growth as converting non-users into the category, not defending an exclusive network, which is a direct sign the network-effect lock-in is weak at the margin [`07_business-quality.md`, row 3]. | 45 |
| Switching costs | N (weak) | Explicitly evidenced as low: "ride-hailing is a well-known multi-homing category... a sign switching costs are low at the margin" [`07_business-quality.md`, row 3]. Cross-sell (Rides↔Eats) and Uber One membership create some lock-in but do not reverse this finding. | 20 |
| Natural resource access | N | Not applicable to a marketplace/technology platform. Not proven from available data. | — |
| Location advantage | N | No exclusive-territory, airport-concession, or city-permit-scarcity evidence disclosed anywhere in this pool. Not proven from available data. | — |

No single moat source clears the "very strong" band. The two most-evidenced sources — cost advantage and scale — are real against Lyft and Grab specifically, regional/partial against DiDi, and neither is demonstrated as durable enough on its own to defend profits without the return-on-capital confirmation tested in §3–§4 below.

## 3. Competitive Economics

| Company / Competitor | Gross Margin | EBIT Margin | Return on capital (ROIC) | Period | Source |
|---|---:|---:|---:|---|---|
| Uber Technologies | 40.8% | 12.1% | 9.36% (FY2025); 10.59% (LTM) | LTM through Jun-30-2026 (margins); FY2025 / LTM (ROC) | Company Comparable Analysis Uber Technologies Inc.xls, Operating Statistics tab, As-Of 2026-08-06 (margins); Uber Technologies Inc NYSE UBER Financials.xls, Ratios tab, "Return on Capital %" row (ROC) |
| Competitor 1 — Lyft, Inc. | 35.6% | -2.2% | Not disclosed | LTM through 2026-05-08 | Company Comparable Analysis Uber Technologies Inc.xls, Operating Statistics tab, As-Of 2026-08-06 |
| Competitor 2 — DiDi Global Inc. | 15.6% | -2.6% | Not disclosed | LTM through 2026-06-02 | Company Comparable Analysis Uber Technologies Inc.xls, Operating Statistics tab, As-Of 2026-08-06 |
| Competitor 3 — Grab Holdings Limited | 40.5% | 3.7% | Not disclosed | LTM through 2026-08-04 | Company Comparable Analysis Uber Technologies Inc.xls, Operating Statistics tab, As-Of 2026-08-06 |

Gross and EBIT margins for the three named peers are taken directly from the Operating Statistics tab of the same Capital IQ comp workbook `08_competitive-map.md` cites for EBITDA/EBIT/net-income margins — competitive-map's own profiles did not carry a gross-margin line, so this adds it from the identical source/tab rather than re-deriving a figure competitive-map already reports (EBIT margins here reconcile exactly to competitive-map's: Lyft -2.2%, DiDi -2.6%, Grab 3.7%). No peer discloses ROIC or ROE in any source in this pool [`08_competitive-map.md`, §5] — marked "Not disclosed," not invented.

**Tax-rate normalization used for NOPAT.** Uber's reported effective tax rate is not usable for a NOPAT calculation: Income Tax Expense was **-$5,758mm** (FY2024) and **-$4,346mm** (FY2025) — i.e., large net tax *benefits*, not expenses, against EBT of $4,087mm and $5,747mm respectively, driven by a release of the valuation allowance on U.S. deferred tax assets (Deferred Domestic/Foreign Taxes of -$6,027mm in FY2024 and -$4,779mm in FY2025) [Financials.xls, Income Statement tab, "Effective Tax Rate %" row shows "NM" for FY2024/FY2025]. This is a one-off, non-cash item that inflates reported net income and ROE but does not belong in an operating-return test. **This report uses a normalized structural tax rate of 24%** (approximating combined US federal + state statutory rates) applied to EBIT to compute NOPAT, stripping out the deferred-tax valuation-allowance release. Any later `valuation/04_intrinsic-dcf` NOPAT calculation should reconcile to this same 24% rate — this module runs first and is the anchor.

**Own cross-check against the CIQ vendor "Return on Capital %" figure.** NOPAT (FY2025) = EBIT $5,565mm × (1-0.24) = $4,229mm. Against FY2025 ending Total Capital of $40,385mm (Total Debt $12,302mm + Total Common Equity $27,041mm + Minority Interest $1,042mm) [Financials.xls, Capital Structure Summary tab, Dec-31-2025 column], this gives ROIC ≈ 10.5% (ending-capital basis) or ≈ 11.4% (average FY2024–FY2025 capital basis, $37,149mm). CIQ's own vendor figure for FY2025 is 9.36% [Financials.xls, Ratios tab] — within roughly 100–200bps of this independent cross-check, a difference attributable to CIQ's own tax-rate/capital-averaging convention rather than a material divergence; no flag required. **CIQ's "Return on Capital" is computed on Total Capital (debt + equity + minority interest) with no cash netted out — a gross-capital basis, not net-of-cash** — so no net-cash inflation risk applies here (Uber ran modest net debt, not net cash, in FY2025: Total Debt $12,302mm vs. Total Cash & ST Investments $7,633mm [Financials.xls, Balance Sheet tab, Dec-31-2025 column]).

**Through-cycle return, not a single peak year.** CIQ's own Return on Capital % time series [Financials.xls, Ratios tab]: FY2021 -9.40%, FY2022 -4.85%, FY2023 3.11%, FY2024 6.00%, FY2025 9.36%, LTM (through Jun-30-2026) 10.59%. Uber IPO'd in 2019 and has under one full standalone economic cycle as a profitable company — FY2021–FY2022 reflect COVID-era and post-IPO scaling losses rather than a classic commodity/economic trough, so neither the full 5-year average nor the single latest year is cleanly the right base. Two through-cycle reads, both shown:
- **5-year simple average (FY2021–FY2025): 0.84%** — dragged down by the FY2021–FY2022 scaling-loss years.
- **3-year average of the sustained-profitability stretch (FY2023–FY2025): 6.16%** — the more representative recent through-cycle figure, still materially below the cost of capital calculated below.
- **FY2025 (9.36%) and LTM (10.59%)** are the most recent single-year/trailing points and are labeled here as a **recent peak**, consistent with `07_business-quality.md`'s own explicit caution: "a buyer should not extrapolate the current 9–11% return on capital as the steady-state level" given the FY2020 pandemic trough and Freight's -27% three-year revenue decline as the through-cycle counterweight [`07_business-quality.md`, §4].

**Cost of capital — CAPM inference, not from filings.** No company-disclosed WACC, cost of equity, or hurdle rate exists anywhere in this pool. Built as: Risk-free rate 4.6% (10-year US Treasury yield, Aug-2026; Web: dated, unverified — used only as a CAPM input, not a headline claim) + Beta 1.15 (Uber's own **5-Year Beta**, a Capital IQ vendor figure — [Company Comparable Analysis Uber Technologies Inc.xls, Operating Statistics tab, As-Of 2026-08-06]) × 5.0% equity-risk-premium assumption (standard long-run US ERP assumption; Inference, not from filings) = **cost of equity ≈ 10.35%**. Cost of debt: Interest Expense $440mm / Total Debt (FY2025) $12,302mm ≈ 3.6% pre-tax, ≈ 2.7% after the same normalized 24% tax rate [Financials.xls, Income Statement & Balance Sheet tabs]. Weights from FY2025 capital structure — Debt 30.5%, Common Equity + Minority Interest 69.5% [Financials.xls, Capital Structure Summary tab, Dec-31-2025 column]. **WACC ≈ 10.35% × 0.695 + 2.7% × 0.305 ≈ 8.1%.**

**The economic moat test (required):**

> Return on capital **below** cost of capital on the required through-cycle basis: **6.2% 3-year average ROIC (FY2023–FY2025)** vs **~8.1% WACC** (-190bps) — [Financials.xls, Ratios tab, "Return on Capital %" row, FY2023–FY2025; WACC = CAPM inference, Beta from Company Comparable Analysis Uber Technologies Inc.xls, Operating Statistics tab]. The single latest-year figures — FY2025 (9.36%) and LTM (10.59%) — sit **above** this same ~8.1% WACC by +126bps and +249bps respectively, but these are a recent peak (only two years, FY2024–FY2025, have cleared the line at all) and are not used as the primary test result per the through-cycle standard above.

## 4. Where The Company Sits

1. **Relative to peers:** Company sits at the **top** of named peers on margin — Uber's LTM gross margin (40.8%) and EBIT margin (12.1%) are the highest of the four names shown in §3 (Grab 40.5%/3.7%, Lyft 35.6%/-2.2%, DiDi 15.6%/-2.6%). On return on capital, no clean peer comparison exists — none of the three named competitors discloses ROIC or ROE in any source in this pool [`08_competitive-map.md`, §5], so "insufficient data to compare return on capital against named peers" specifically, even though the margin comparison is clear.
2. **Absolute (the economic moat test):** the company earns a through-cycle return on capital **below** its cost of capital (6.2% 3-year average vs ~8.1% WACC) — the decisive test of whether the margin lead in §3 is an economic moat or a structural one that has not yet cleared its own funding cost across a full cycle.

## 5. Moat Verdict

**No moat proven — moat in structure, not economics.**

Uber has a real, cited structural advantage over Lyft and DiDi specifically — a Mobility-segment EBITDA margin of 26.6% against Lyft's near-zero and DiDi's negative margin, built on genuine scale and cross-platform distribution (§2) — but that advantage has not yet been shown to produce a return on capital sustained above Uber's own cost of capital through a full cycle: the 3-year average (6.2%) and 5-year average (0.84%) both sit below the ~8.1% WACC estimate, and only the most recent two years (FY2024–FY2025, plus the LTM point) clear that bar (§3–§4). Per the hard rule, peer-relative superiority alone cannot support a Strong-moat call when the through-cycle return sits below the cost of capital — this is exactly the "best of a bad lot" pattern the rule exists to catch, since two of the three named peers (Lyft, DiDi) are themselves running negative EBIT margins. The durability test this would need to pass over the next 5 years: hold the FY2024–FY2025 return-on-capital run rate (or improve on it) for at least two to three more years without regulatory reclassification (already worth ~500bps in one quarter, per `07_business-quality.md` row 8) or Brazil-style incentive-spend competition eroding it back toward the 3-year average — and do so while the industry's rate-of-change/disruption score (35/100, per `07_business-quality.md`) stays this low, which itself discounts how much durability credit any current advantage deserves (CLAUDE.md §24, Filter 5).

**Moat trajectory: widening (early-stage, not yet fully proven).** CIQ's own Return on Capital % series has risen every single year for five straight years — -9.40% (FY2021) → -4.85% (FY2022) → 3.11% (FY2023) → 6.00% (FY2024) → 9.36% (FY2025) → 10.59% (LTM) [Financials.xls, Ratios tab] — and Uber's LTM revenue grew 16.7% year-on-year against Lyft's 9.4% over the same period [`08_competitive-map.md`, §3], both consistent with a widening gap versus the closest US peer. This is labeled "widening" rather than "stable," because the direction is unambiguous and multi-year, not a single-quarter blip. It is qualified as "early-stage, not yet fully proven" because: (a) only the last two years have actually cleared the cost-of-capital line, so there is not yet a full cycle of evidence that the widening holds; (b) `07_business-quality.md` attributes part of the recent margin move to non-repeatable items (a UK regulatory reclassification, an insurance-cost swing being reinvested rather than banked) rather than pure execution; and (c) the fast-changing-industry discount (rate-of-change score 35/100) applies to any moat-durability read here, per CLAUDE.md §24 Filter 5 — a widening moat in a business facing an unresolved AV-disintermediation question is a weaker basis for underwriting durability than the same trend in a slower-moving industry.



---

## business-model / 10_external-dependency.md

_Source: `10_external-dependency.md`_

# External Dependency Check — UBER

**Data-pool caveat:** No primary annual filing (FY2025 10-K) or 10-Q is present in this pool — only Capital IQ vendor exports of filing line items and the FQ2 2026 earnings-call transcript (Aug-05-2026) [data-triage 00, §1–§3]. This report is built from management's own comments on the Q2 2026 call plus segment/geography splits from the Capital IQ "Financials.xls" workbook. No Item 1A Risk Factors text or Item 7A market-risk / sensitivity disclosure was available to read directly — where the underlying 10-K would normally carry a quantified FX or rate sensitivity table, this report says so and does not invent one.

## 1. Dependency Table

| External Variable | Dependency Level (Low / Mid / High) | Why It Matters | Evidence |
|---|---|---|---|
| Commodity prices | Low–Mid | Uber does not buy fuel directly — drivers do — so pump prices affect driver supply/economics indirectly rather than hitting Uber's own income statement. The Freight segment (5% of FY2025 revenue) is more directly commodity/cycle-exposed (diesel, spot freight rates) but is a minor share of the group. | Segment revenue split: Mobility $29,670mm, Delivery $17,248mm, Freight $5,099mm of $52,017mm total FY2025 revenue [Uber Technologies Inc NYSE UBER Financials.xls, Segments tab, FY2025 column] |
| Interest rates | Low | Total debt of $14,731mm against $5,391mm cash & short-term investments (net debt ~$9,340mm, strict basis) is modest next to a $138.8bn market cap and >$10bn trailing-12-month free cash flow; a rate move changes financing cost but does not threaten the model. No sensitivity table is in the pool to quantify a basis-point impact. | Key Stats tab: Total Debt $14,731mm, Cash & ST Investments $5,391mm, Market Cap $138,787mm [Financials.xls, Key Stats tab]; "trailing 12-month free cash flow exceeding $10 billion for the first time" [Q2 2026 transcript, prepared remarks] |
| FX | Mid | ~49% of FY2025 revenue is booked outside the U.S. and Canada (EMEA $16,364mm + LATAM $3,327mm + APAC $5,857mm of $52,017mm total), and the pending Delivery Hero deal is priced and structured in euros (€41.50/share, ~€12.9bn / $14.8bn equity value, a ~€14bn committed bridge facility), adding a fresh euro-denominated liability. Management itself flagged "bookings were up 22% constant currency, revenues up 19%" this quarter — a gap the company attributes partly to FX. No disclosed hedge ratio or sensitivity table is in this pool. | Geographic Segments, FY2025 [Financials.xls, Segments tab]; "bookings were up 22% constant currency, revenues up 19%" [Q2 2026 transcript, Q&A, Justin Post question]; Delivery Hero deal terms [CIQReportLandscape.rtf, deal summary] |
| Freight / logistics rates | Mid (small weight) | The Freight segment is a direct pass-through of the trucking/freight cycle — it ran negative-to-breakeven EBITDA every year from FY2022 to FY2025 (-$0 in FY22, -$64mm FY23, -$74mm FY24, -$33mm FY25) as the broader freight market stayed weak. It is only ~10% of group revenue, so its swing does not move the whole company, but within that segment the dependency is close to total. | Segment EBITDA by year [Financials.xls, Segments tab] |
| Government policy / Regulation | High | Management describes Uber in its own words as "a highly regulated business" and spent multiple answers on this call discussing driver/worker classification, insurance mandates, and AV-specific rules (school-zone driving, emergency-vehicle interaction, motorcade blocking) as live policy questions being negotiated city-by-city and state-by-state. A UK "business model change" — a regulatory-driven reclassification — already cut mobility's reported take rate by ~400 of the ~500 basis points of year-on-year decline this quarter (an "optical" cost-of-revenue shift, per the CFO). Insurance cost, which is itself largely state-regulated and litigation-driven, swung from a headwind to "a tailwind this year," and management is reinvesting the saving rather than banking it — meaning the current margin partly reflects a policy-driven cost swing, not durable execution. | "We are a highly regulated business... concerns about job loss... safety... congestion" [Q2 2026 transcript, John Colantuoni Q&A, Dara Khosrowshahi]; "business model change in the U.K... about 400 basis points is entirely related to this U.K. business model change" [Q2 2026 transcript, Justin Post Q&A, Balaji Krishnamurthy]; "insurance, which we have talked about, is becoming a tailwind this year. We are reinvesting the savings" [Q2 2026 transcript, Eric Sheridan Q&A, Balaji Krishnamurthy] |
| Weather | Not scored | No weather-specific disclosure or sensitivity appears anywhere in this pool (transcript or Capital IQ exports). Skipped rather than defaulted to Low, per instruction not to score unevidenced rows. | Not proven from available data. |
| Geopolitics | Low | Sovereign and Middle-East-linked capital (Public Investment Fund, Qatar Investment Authority) sits in Uber's own cap table and backs a key AV partner (Lucid, "backed by the Public Investment Fund... a big investor of ours"); the pending Careem stake step-up in the UAE is explicitly "subject to regulatory approval." This is real but narrow — an ownership/partner-concentration point, not a driver of core operating results. | Investor list incl. Public Investment Fund, Qatar Investment Authority [Public Company Profile.rtf, Current and Pending Investors]; "Lucid... backed by the Public Investment Fund. They are a big investor of ours" [Q2 2026 transcript, Justin Post Q&A, Dara Khosrowshahi]; Careem stake step-up "subject to regulatory approval and customary closing conditions" [CIQReportLandscape.rtf, deal summary] |
| Consumer cycle | Mid | Both Mobility and Delivery are discretionary consumer spend. Management's own growth narrative leans on price-sensitive product lines (Wait & Save, low-cost 2- and 3-wheelers) explicitly designed to "introduce a whole new sector of consumers" at a lower price point — an admission that a chunk of incremental growth is coming from consumers trading down, which is itself a consumer-budget-sensitivity signal. Q2 growth was also flattered by a one-off event (FIFA World Cup) that management says was "a benefit... as expected," on top of underlying trend. | "Wait & Save... low cost, it kind of introduces a whole new sector of consumers onto the platform" [Q2 2026 transcript, Doug Anmuth Q&A, Dara Khosrowshahi]; "the World Cup definitely was a benefit, but it was as expected to a large extent" [Q2 2026 transcript, Eric Sheridan Q&A, Balaji Krishnamurthy] |
| Industrial cycle | Mid (Freight-specific) | Freight directly tracks industrial shipping volumes and the trucking cycle; its multi-year negative-to-flat EBITDA (see Freight/logistics row) reflects a soft industrial freight cycle Uber cannot control. Confined to ~10% of group revenue, so it is a real but bounded exposure. | Segment EBITDA history [Financials.xls, Segments tab] |

## 2. Sensitivity, If Disclosed

No FX, commodity, or interest-rate sensitivity table (e.g., "a 10% USD move impacts revenue by $X") was found anywhere in this pool. The FY2025 10-K's Item 7A market-risk disclosure — which normally carries this kind of table for a US filer — is not present; only vendor-summarized income-statement, balance-sheet, and segment tabs are available [data-triage 00, §3]. Not proven from available data.

## 3. Classification

**Partly externally driven.**

Uber controls a lot of its own outcome: pricing/take-rate levers, product mix (premium Reserve/Black vs. Wait & Save), market-entry sequencing (sparse markets, cross-platform selling), AI-driven cost discipline on headcount, and capital allocation (buybacks vs. the Delivery Hero deal). Those are real, working levers — non-GAAP EPS grew 35% year-over-year this quarter and gross bookings grew 22% for a fourth straight quarter above 20% [Q2 2026 transcript, prepared remarks]. But a real slice of the current result is externally driven and outside management's control: the ~400bp UK take-rate hit was a regulatory reclassification, not a strategy choice; the insurance-cost "tailwind" being reinvested this year could reverse if litigation/insurance costs turn back up, since that cost line is set by state insurance and tort-liability regimes, not by Uber; nearly half of revenue is FX-exposed with no disclosed hedge detail in this pool; and the core "independent contractor" driver model — which underpins Mobility's take-rate and cost structure — remains an open regulatory question in multiple geographies, as management's own extended answer on AV/labor regulation makes clear.

## 4. External Dependency Risk Score

**42 / 100** (higher = worse; this score is inverted per CLAUDE.md §12 and MODULE_RULES — a higher number means MORE dangerous external dependence, not better performance).

This sits at the upper end of the 21–40 "partly externally driven, hedgeable / actively managed" band and edges into the 41–60 "material external exposure, mixed mitigation" band, reflecting: (a) a High rating on Regulation — the single most consequential variable, already visible in this quarter's reported take rate; (b) Mid ratings on FX and Consumer cycle, both material but partially offset by geographic diversification and price-tiered products; (c) a bounded, segment-contained Industrial-cycle/Freight exposure that cannot sink the group given its ~10% revenue share; and (d) Low ratings on interest rates and geopolitics given a moderate balance sheet and no direct geopolitical revenue concentration.

## 5. The Single Biggest Lever

Driver/worker classification regulation — a ruling or new law reclassifying gig drivers as employees in a major market (as the UK business-model change and ongoing U.S. state-by-state fights over insurance and worker status foreshadow) would strike directly at Uber's core independent-contractor cost structure across Mobility and Delivery simultaneously, doing more damage than an equivalent FX, freight-rate, or commodity move because it changes the unit economics of the whole platform rather than one segment or one currency block.

Inference, not from filings: the "20% adverse move" framing for a regulatory/labor variable is inherently qualitative (regulation does not move in percentage terms the way FX or commodity prices do); the comparison above is a directional judgment about scale of impact, not a quantified sensitivity, because no such sensitivity is disclosed in this pool.



---

## business-model / 11_capital-allocation-governance.md

_Source: `11_capital-allocation-governance.md`_

# Capital Allocation & Governance — UBER

**Data-pool caveat:** No primary annual or quarterly filing (10-K/10-Q) is present in `data/UBER/`. The pool's financial detail comes from Capital IQ vendor exports (workbook tabs, cited as "Capital IQ export") that summarize Uber's FY2025 10-K (filed 2026-02-13) and FQ2 2026 results, plus the Q2 2026 earnings-call transcript (Aug-05-2026, the highest-tier document actually in the pool). Where a fact material to this agent's scope (the Delivery Hero acquisition's deal value and financing) is confirmed by the transcript in the pool but its precise dollar terms are not, this report uses a dated web source and labels it as such, per CLAUDE.md §4/§11 — this is not a filing substitute, only a fill for one specific figure the pool cannot supply.

## 1. Signal Table

Severity is INVERTED — higher score = worse.

| Signal | Observation | Evidence | Severity /100 *(higher = worse)* |
|---|---|---|---:|
| Acquisition pattern (frequency, size, integration outcomes; serial-acquirer + opportunity cost — Filter 4) | Uber closed or has pending at least seven acquisitions in roughly 18 months (Trendyol Go, Getir, Careem reconsolidation, SS Ventures, Blacklane, SpotHero, Segments.ai, Crown Taxi) and, on top of that bolt-on cadence, agreed in July 2026 to buy Delivery Hero for $14.8 billion equity value — funded by a ~€14 billion committed bridge facility plus cash, doubling Uber's addressable market to ~100 countries — a deal roughly 10% of Uber's own $139 billion market cap. | Q2 2026 earnings-call transcript, prepared remarks and Q&A, p.4, p.11-14 (bolt-ons, Delivery Hero integration plan, "$4 billion of capital" spent on Delivery Hero market purchases in Q2); Uber Technologies Inc NYSE UBER Public Company Profile.rtf, "Current and Pending Subsidiaries" (Careem, Blacklane, SpotHero, Segments.ai, Crown Taxi, SS Ventures, Getir Türkiye); Web: Bloomberg, "Uber Agrees to Buy Delivery Hero in $14.8 Billion Deal," 2026-07-16 (dated, corroborated by TechCrunch and Uber's own 8-K press-release exhibit on SEC EDGAR — deal value, bridge-facility financing, and "<2x gross leverage" target not stated in the pool documents) | 78 |
| Net share count trajectory (buybacks minus issuance, dilution) | Shares outstanding fell from 2,089mm (Dec-2024) to 2,036mm (Mar-2026) as $6.5-6.9bn/year buybacks ran ~3.5x stock-based compensation (~$1.8-1.9bn/year), then ticked back up to 2,043mm (Aug-2026 quote) after buybacks were throttled to fund the Delivery Hero stake purchase. | Uber Technologies Inc NYSE UBER Financials.xls, Historical Capitalization tab, Dec-2024 to Mar-2026; Cash Flow tab, "Repurchase of Common Stock" / "Stock-Based Compensation," FY2024-LTM Jun-2026; Public Company Profile.rtf, "Shares Out. (mm): 2,042.6" as of Aug-05-2026 | 28 |
| Dividend policy & coverage | Uber has never paid a common or special dividend in any period shown (2021-LTM Jun-2026); management instead commits to returning ~50% of free cash flow via buybacks. | Uber Technologies Inc NYSE UBER Financials.xls, Cash Flow tab, "Total Dividends Paid" / "Special Dividend Paid" rows, all periods = "-"; Q2 2026 earnings-call transcript, CFO remarks on "deploying about 50% of our free cash flows towards buybacks," p.12 | 20 |
| Capex intensity vs depreciation (growth vs maintenance) | Capital expenditure ran $242-336mm/year against depreciation & amortization of $737-774mm/year (LTM) — capex is under half of D&A, consistent with an asset-light platform model rather than heavy reinvestment. | Uber Technologies Inc NYSE UBER Financials.xls, Cash Flow tab, "Capital Expenditure" and "Depreciation & Amort., Total," FY2021-LTM Jun-2026 | 15 |
| Debt level and trajectory (absolute + vs EBITDA) | Total debt/EBITDA fell from 2.9x (FY2024) to 1.8x (FY2025) to 1.4x (Mar-2026), then net debt jumped from $76mm (FY2025) to $9,340mm (LTM Jun-2026, strict basis: total debt $14,731mm − cash & ST investments $5,391mm) as Uber pre-funded part of the Delivery Hero stake; the pending ~€14bn bridge facility for the balance of the deal will push leverage materially higher before closing (management targets gross leverage below 2x, per the web-sourced deal announcement, not stated in the pool). | Uber Technologies Inc NYSE UBER Financials.xls, Capital Structure Summary tab, "Total Debt/EBITDA," FY2024-Mar-2026; Balance Sheet tab, "Net Debt," FY2024-Jun-2026 (Press Release); S&P Global Ratings, Issuer Credit Rating BBB+/Positive, May-28-2026 [Public Company Profile.rtf] | 45 |
| Related-party transactions | No related-party-transaction note, proxy, or DEF 14A is present in the pool; the Public Investment Fund of Saudi Arabia holds ~3.6% of shares outstanding and has a board seat (director since Nov-2023), which is disclosed governance, not a hidden related-party channel, but the pool cannot show whether commercial dealings with PIF-affiliated entities exist. | UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf, Top 25 Holders table (Public Investment Fund, 72,840,541 shares, 3.578% of CSO); Uber Technologies Inc NYSE UBER Board Members.rtf, Alnowaiser bio ("Deputy Governor & Head of International Investment of Public Investment Fund"; director since 2023-11-16); no RPT note in pool — **not proven from available data** | 40 |
| Insider / promoter ownership and changes | Individuals/insiders hold only ~0.18% of shares outstanding (float 99.7%) — ownership is fully institutionalized (BlackRock 7.4%, Capital Research 6.7%, Vanguard 6.6%, State Street 4.5%); no founder or executive holds a control block. | UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf, ownership-breakdown table ("Individuals/Insiders 3,586,107 shares, 0.18% / Public and Other 313,237,723 shares, 15.34%... Total 2,042,560,121, 99.66%") and Top 25 Holders table | 38 |
| Promoter share pledging *(if applicable, e.g. Indian listings)* | Not applicable — US-listed common stock, no promoter/pledging structure exists for a widely-held NYSE issuer. | n/a | 0 |
| Auditor history (changes, qualifications, key audit matters) | No auditor name, audit opinion, or key-audit-matter disclosure is present anywhere in the pool (no 10-K); no adverse signal (qualification, going-concern) surfaces in any document reviewed, but the absence itself is a genuine gap, not a clean bill of health. | Not disclosed in pool — **not proven from available data** | 32 |
| Restatements / accounting policy changes | Capital IQ flags the FY2025 annual data set with "Restatement Type: O" (Other) versus "NC" (no change) for FY2021-FY2024, indicating some vendor-tracked reclassification in the FY2025 figures; the pool gives no note explaining the nature of the change. | Uber Technologies Inc NYSE UBER Financials.xls, Cash Flow tab and Balance Sheet tab, "Restatement Type" row, FY2025 = "O" vs FY2021-FY2024 = "NC" | 28 |
| Off-balance-sheet items | Operating lease commitments ($1,179mm over the next 5 years, $1,592mm thereafter, as of FY2025) are disclosed and already reflected on the balance sheet under lease-liability lines; no other off-balance-sheet vehicle, guarantee, or SPE is evidenced in the pool. | Uber Technologies Inc NYSE UBER Financials.xls, Capital Structure Summary tab, "Operating Lease Commitment Due, Next 5 Yrs / After 5 Yrs," FY2025 | 15 |
| Working capital trend (receivable days, inventory days, cash conversion) | Cash conversion is strong: LTM cash from operations ($10,424mm) exceeds net income ($9,579mm), and accounts receivable grew roughly in line with revenue (receivable days ≈28 on LTM revenue of $55,227mm); trailing-12-month free cash flow topped $10 billion for the first time, per management. | Uber Technologies Inc NYSE UBER Financials.xls, Cash Flow tab, "Cash from Ops." vs "Net Income," LTM Jun-30-2026; Balance Sheet tab, "Accounts Receivable," FY2021-Jun-2026; Q2 2026 earnings-call transcript, CEO remarks, p.4 ("trailing 12-month free cash flow exceeding $10 billion for the first time") | 10 |
| Senior management turnover (CEO, CFO, board chair in last 3 years) | Uber has had three CFOs in roughly three years — Balaji Krishnamurthy became CFO on 2026-02-16, succeeding Prashanth Mahendra-Rajah (CFO since early 2024); the CTO role also changed hands in December 2025 (Praveen Neppalli Naga). CEO Dara Khosrowshahi (since 2017) and Board Chair Ronald Sugar (since 2018) have been stable throughout. | Uber Technologies Inc NYSE UBER Professionals.rtf, Krishnamurthy and Naga bios ("Chief Financial Officer at Uber Technologies, Inc. from February 16, 2026"; "Chief Technology Officer since December 2025"); Web: TechCrunch / CFO Dive, "Uber appoints new CFO as its AV plans accelerate," 2026-02-04 (confirms Mahendra-Rajah's exit and that Krishnamurthy is Uber's third CFO in three years — not stated in pool documents) | 48 |

## 2. Classification

**Capital allocation concerns.**

The trigger is the acquisition-pattern row. Uber is a serial acquirer in the literal sense CLAUDE.md §24 Filter 4 describes: at least seven bolt-on deals in ~18 months (Trendyol Go, Getir, Careem, SS Ventures, Blacklane, SpotHero, Segments.ai, Crown Taxi), layered under one transformative, debt-funded acquisition — Delivery Hero at $14.8 billion, funded by a ~€14 billion bridge facility, roughly 10% of Uber's own market value. Management itself confirmed on the Q2 2026 call that it "tactically pivoted quite heavily towards M&A" and pulled $4 billion of capital away from the buyback program to build the Delivery Hero stake before the deal was announced [Q2 2026 earnings-call transcript, p.12] — a live example of the opportunity cost §24 asks this agent to weigh, not just the deal's own projected synergies ($1.2bn run-rate, per the web-sourced announcement).

Outside of that M&A pattern, the rest of the governance picture reads as standard professional management: no promoter/pledging structure (not applicable to a US listing), negligible insider ownership (0.18%) spread across institutional holders with no control block, an investment-grade balance sheet (BBB+/Positive) with pre-deal leverage that had been falling (2.9x → 1.4x total debt/EBITDA), strong cash conversion, and no auditor qualification or going-concern flag surfaced anywhere in the available documents. CFO turnover (three CFOs in three years) is the second-most notable flag and keeps this report from reading as clean "owner-operator" territory, but on its own it would not change the classification.

## 3. Most Material Signal

The acquisition pattern is the signal that would most change this classification if it worsens. If the Delivery Hero deal's ~€14 billion of new debt pushes leverage meaningfully above the 2x gross-leverage target management has committed to (a target confirmed only in the web-sourced deal announcement, not the pool), or if a further large debt-funded deal is added to the current run rate of bolt-ons, the classification would move from "Capital allocation concerns" to "Governance red flags" — a serial-acquirer pattern combined with rising leverage is a materially different risk than the current buyback-funded, low-leverage profile the balance sheet shows through FY2025.

## 4. Capital Allocation Score /100

**50/100 — Rejector-filter cap applied.**

The acquisition-pattern row scores 78/100 severity — well above the CLAUDE.md §24 Filter 4 / MODULE_RULES.md threshold of ≥70 for a clear serial-acquirer pattern with a debt-funded deal near or above the company's own value. Per the rejector-filter rule, this caps the Capital Allocation Score at 50/100 regardless of the cleaner signals elsewhere in the table (low insider concentration, investment-grade leverage pre-deal, strong cash conversion, no promoter pledging). Without the cap, the un-weighted average severity across all 13 rows (≈32) would imply a score in the high-60s; the cap is applied here and stated explicitly because the M&A pattern — not the average — is the signal that should govern this business's capital-allocation read.



---

## business-model / 12_red-flags-sweep.md

_Source: `12_red-flags-sweep.md`_

# Red Flags Sweep — UBER

**Data-pool caveat carried forward:** no primary FY2025 10-K or 10-Q is present in `data/UBER/` — only Capital IQ vendor exports (Financials.xls workbook tabs, the CIQ Landscape report, the Company Comparable Analysis file) and the Q2 2026 earnings-call transcript (Aug-05-2026) [`00_data-triage.md`, §1–§3]. No `ciq_facts.json` sidecar exists for this run. All new findings below are cited to the specific Capital IQ workbook tab or the CIQ Landscape report's own dated news/deal items (a Tier-5 vendor source under CLAUDE.md §4, since the underlying 10-K/8-K cannot be directly verified in this pool), never presented as if lifted from the primary filing itself.

## 1. Already Covered Upstream

| Upstream Agent | Flag Already Surfaced |
|---|---|
| disqualifier-scan | No auditor qualification/going-concern (PwC, unqualified FY2024–FY2025); no promoter pledge (no controlling group); related-party-transaction, restatement, and enforcement-action rows all read "N" but rest on absence of a primary 10-K rather than a filing's own clean statement — flagged as a data-sufficiency cap, not a trigger. Vendor "Restatement Type: RC" on FY2023/FY2024 income statement and cash flow identified as a Capital IQ reclassification code, not a company restatement. |
| segment-map | Freight is structurally sub-scale and cyclical (-27% revenue over three years, negative-to-flat EBITDA in 5 of 6 years); Corporate G&A/Platform R&D is a single unallocated -$2,708mm (-31% of EBITDA) cost pool with no split between overhead and discretionary R&D; the pending Delivery Hero deal may break the current three-segment structure in future filings. |
| customer-geography | United States and Canada = 50.9% of FY2025 revenue with no long-term contract of any kind (transactional, per-trip/per-order); EMEA's rise from 18.4% to 31.5% of revenue since FY2021 is partly acquisition-driven (Trendyol Go, Getir, Careem), not fully organic; Freight shipper-count/concentration is a genuine disclosure gap. |
| business-quality | Regulatory dependence scored 28/100 (weakest factor) — a UK reclassification already cut Mobility's reported take rate ~500bps in one quarter; competitive intensity scored 32/100 (Lyft, DiDi, Grab, DoorDash/Meituan/iFood live incentive competition in Brazil); industry rate-of-change/AV-disruption risk scored 35/100, tripping the Filter 5 rejector cap (aggregate quality capped, thesis flagged as a sector/technology-cycle bet); margin-stability gains flagged as partly exogenous (UK reclass, insurance-cost reinvestment), not durable execution. |
| external-dependency | Regulation rated "High" driver of the 42/100 (inverted) external-dependency score; FX rated "Mid" (~49% of revenue outside US/Canada, Delivery Hero deal priced in euros); consumer-cycle trade-down growth (Wait & Save, 2-/3-wheeler tiers) and Freight's industrial-cycle exposure both flagged; driver/worker classification named the single biggest lever. |
| capital-allocation-governance | Serial-acquirer pattern trips Filter 4 (severity 78/100, Capital Allocation Score capped at 50): 7+ bolt-ons in ~18 months plus the debt-funded Delivery Hero deal (~10% of Uber's own market cap); three CFOs in three years (severity 48); PIF's 3.6% stake plus board seat flagged as an RPT disclosure gap, not a hidden channel (severity 40); leverage jump from a near-zero net debt position to ~$9.3bn (strict basis) pre-funding the Delivery Hero stake (severity 45); no auditor-history disclosure in the pool (severity 32); vendor "Restatement Type: O" on FY2025 balance sheet/cash flow (severity 28). |

## 2. New Red Flags

| Red Flag | Why It Matters | Evidence | Severity /100 *(higher = worse)* |
|---|---|---|---:|
| Reported GAAP net income for FY2023–FY2025 is dominated by non-operating items, not by marketplace operating profit | In FY2023, non-operating "Gain (Loss) On Sale Of Invest." ($1,536mm) plus "Gain (Loss) On Sale Of Assets" ($204mm) — together $1,740mm — exceeded that year's entire Operating Income of $1,110mm; net income was $1,887mm. In FY2024, Operating Income was $2,799mm, but a $5,758mm income-tax **benefit** (negative tax expense) pushed net income to $9,856mm — the tax benefit alone was more than 2x operating income. In FY2025, Operating Income was $5,565mm and the tax benefit was $4,346mm (43% of the $10,053mm net income figure). The balance sheet confirms the mechanism: "Deferred Tax Assets, LT" jumped from $170mm (FY2023) to $6,171mm (FY2024) to $10,951mm (FY2025) — now equal to ~39% of FY2025 total equity ($28,083mm) — consistent with a multi-year release of a deferred-tax valuation allowance against Uber's own NOL carryforwards ($31,443mm total NOL carryforward at FY2025, still declining from $43,733mm at FY2022). None of this is fraud — it is a disclosed, recurring accounting mechanism — but any downstream use of trailing GAAP net income or EPS (for a P/E multiple, an earnings-growth comparison, or a "profitability turned the corner" narrative) that does not strip these items out is measuring a tax and mark-to-market swing, not the health of the ride-hailing/delivery/freight marketplace. It also means roughly $10bn of Uber's own balance sheet (the deferred tax asset) is a non-cash asset whose value depends on Uber actually generating enough future taxable income to use it — a reversal (reinstating a valuation allowance) is the kind of swing that could show up as a large negative one-off in a weaker year. | [Uber Technologies Inc NYSE UBER Financials.xls, Income Statement tab, "Operating Income" / "Gain (Loss) On Sale Of Invest." / "Gain (Loss) On Sale Of Assets" / "Income Tax Expense" / "Net Income" rows, FY2023–FY2025 columns]; [same file, Balance Sheet tab, "Deferred Tax Assets, LT" and "Total Equity" rows, FY2023–FY2025]; [same file, Supplemental tab, "Total NOL C/F" row, FY2022 and FY2025] | 62 |
| The Delivery Hero acquisition carries a lopsided break fee and an ~18-month, multi-jurisdiction closing runway that is not yet resolved | The Business Combination Agreement (signed Jul-16-2026, €41.50/share, €12.9bn / $14.8bn equity value) is explicitly conditioned on a bare-majority acceptance threshold (50% of Delivery Hero's outstanding share capital plus one share), "receipt of certain merger control, competition approvals, financial regulatory clearances," and Delivery Hero shareholder approval — with the offer "expected in the second half of 2027," roughly 18 months after signing. If the deal terminates, Uber owes a €700 million break fee versus Delivery Hero's €200 million — a 3.5x asymmetry that falls on Uber if the transaction is blocked (e.g., on EU merger-control grounds) or fails to reach the acceptance threshold. A related step — SSW Partners agreeing separately to buy Delivery Hero businesses in 14 markets where Uber Eats and Delivery Hero already overlap, for $1.6bn — is itself evidence that management expects real antitrust overlap to need remedy before approval. Capital-allocation-governance already flagged the debt-funding and serial-acquirer pattern; this closing-condition/break-fee detail is the piece of deal-execution risk not yet in that report. | [UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf, "Summary M&A" section, Delivery Hero SE entry, Announced Date Jul-16-2026: deal size €13,153.30mm, "In case of termination, Uber Technologies, Inc. will pay 700 million and Delivery Hero SE will pay 200 million," "minimum acceptance threshold of 50% plus one share," "offer is expected in the second half of 2027," SSW Partners $1.6bn 14-market carve-out] | 52 |
| Active wrongful-death/vicarious-liability lawsuit tied to a driver's conduct while working the platform | A wrongful-death suit filed Jul-31-2026 in Middlesex Superior Court names Uber Technologies, Inc. and its subsidiary Portier, LLC (alongside the driver) after an Uber Eats courier, allegedly logged into the app and dispatching a delivery for Uber's financial benefit, struck and killed a pedestrian and fled the scene. The complaint brings claims of negligent hiring, retention, training, and supervision, plus gross negligence and wrongful death, against Uber Technologies and Portier directly (not just the driver), seeking compensatory and punitive damages. No single suit like this threatens Uber's solvency, but it is a live instance of a structural liability category inherent to running a marketplace of independent, largely unscreened-in-real-time drivers and couriers across hundreds of millions of trips — a recurring tail-risk class this pool otherwise only discusses in the abstract (driver classification, insurance-cost dependence), not as an active case. | [UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf, "Michael Kelly Injury Lawyers Files Wrongful Death Lawsuit Against Uber Technologies, Portier, and Guilherme Candido," Jul-31-2026, "Lawsuits & Legal Issue," Source: PR Newswire] | 28 |

## 3. Most Severe New Flag

The most material new flag is the tax- and mark-to-market-driven composition of Uber's reported net income across FY2023–FY2025 (severity 62). It is the single item most likely to mislead anyone reading Uber's headline earnings trend at face value: a $5,758mm deferred-tax benefit in FY2024 and a $4,346mm deferred-tax benefit in FY2025 — each larger than roughly half of that year's reported net income — sit on top of an operating business whose own Operating Income ($2,799mm and $5,565mm in those two years, respectively) is much smaller and more variable. The synthesizer should treat any narrative built on trailing GAAP net income, EPS growth, or a naive P/E multiple as contaminated by this pattern unless it has been explicitly adjusted, and should note that roughly $11bn of Uber's balance sheet (the deferred tax asset) is a non-cash item whose value is conditional on Uber's future taxable income actually materializing.

## 4. Cross-Cutting Patterns

Three things line up: (1) two consecutive years of GAAP net income substantially inflated by a non-cash tax benefit and equity-investment mark-to-market gains, (2) a serial-acquirer pattern already capped by capital-allocation-governance, now including a transformative $14.8bn deal with a genuinely uncertain ~18-month path to close and an asymmetric break fee, and (3) a business-quality read that already discounts recent margin gains as partly exogenous (a UK regulatory reclassification, an insurance-cost tailwind being reinvested rather than banked). Individually each is bounded; together they describe a company whose recent headline financial improvement leans more heavily on non-operating, one-off, and M&A-driven items than the underlying trend in Mobility/Delivery/Freight operating economics would suggest on its own — the synthesizer should weight recent GAAP profitability trends accordingly and prefer operating-income-level and segment-level evidence over consolidated net-income-level evidence when judging durability.
