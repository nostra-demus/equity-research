# Catalyst Data Triage — UBER

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | US SEC — NYSE:UBER, Delaware-incorporated | `FY25 10-K, p.1 (cover page — Delaware corporation)`, `FY25 10-K, Item 5 (exclusive-forum / Delaware Court of Chancery clauses)` |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | `FY25 10-K, "Financial Statements and Supplementary Data"` |
| Reporting currency (and fiscal year-end) | USD; fiscal year ends December 31 | `FY25 10-K, cover page ("For the fiscal year ended December 31...")` |
| Document language(s) | English (all pool documents) | Pool manifest — no non-English source in this pool |

US form names (10-K, 10-Q, 8-K, DEF 14A) are the correct local documents for this issuer — no local-equivalent substitution is needed. The proxy for the FY2025 annual meeting is incorporated by reference and referenced in the 10-K; the AGM itself already occurred in this run's window (see §1).

## External data (frameworks/EXTERNAL_DATA.md)

No `data/UBER/external/` folder exists in this pool — confirmed via directory listing. No external documents to inventory; the sufficiency verdict below rests entirely on filings, CIQ vendor exports, transcripts, and upstream module outputs.

## 1. Scheduled-Event Inventory

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | Y | Q3 FY2026 earnings — CIQ-derived estimated release Nov-03-2026, 12:30 PM. FQ3 2026 EBITDA guidance $2,860M–$2,960M and EPS Normalized $0.84–$0.88 already issued (Aug-05-2026 print). | `Uber Technologies Inc NYSE UBER Events Calendar.xls, Events Calendar tab` (extract: `Uber-Technologies-Inc-NYSE-UBER-Events-Calendar__Events-Calendar.txt`); `analyses/UBER_2026-08-08/earnings/04_guidance-consensus.md` |
| Debt maturity / refinancing date | Y | $2,000M 2026 Term Loan due December 2026 (within 12 months); 2028 Exchangeable Senior Notes (~$1.15bn principal) mature May 2028; 2028 Convertible Notes ($1,725M) mature December 2028; 2029 Senior Notes mature August 2029; further maturities through 2054. | `Q2 FY26 10-Q, Note 5`, cited in `analyses/UBER_2026-08-08/balance-sheet-survival/02_maturity-wall-and-refinancing.md`; `FY25 10-K, Note 8 (Long-Term Debt and Credit Arrangements)` |
| AGM / EGM / record date | Y (past, in-window) | Uber's FY2026 Annual General Meeting was held May-04-2026, 11:00 AM, alongside a Shareholder/Analyst Call. No FY2027 AGM date has yet been scheduled in this pool — treat as a soft ~12-month-forward window (typically early May), not a hard date. | `Uber Technologies Inc NYSE UBER Events Calendar.xls, Events Calendar tab` |
| Scheduled regulatory / legal decision | N (no fixed hearing/decision date) | Driver-classification litigation and licensing/permit risk are named and material (10-K Item 1A) but carry no scheduled decision date in this pool — ongoing, undated legal/regulatory exposure, not a dated catalyst. | `FY25 10-K, Item 1A Risk Factors` |
| Policy / government decision date | N (no fixed date) | City/state driver-pay and fee-cap rules (Chicago per-trip surcharge, SF surcharge, WA minimum-pay law, CA Prop 22) are already-implemented policy, not upcoming dated decisions. | `FY25 10-K, Item 1A Risk Factors`; `analyses/UBER_2026-08-08/business-model/10_external-dependency.md` |
| Operational event (launch / commissioning / contract) | Y | Delivery Hero SE acquisition: Business Combination Agreement signed Jul-16-2026 (€41.5/share cash, ~€12.9bn equity value / $14.8bn); tender offer "expected in the second half of 2027," financed via a ~€14bn committed bridge facility; requires merger-control/antitrust clearance and Delivery Hero shareholder approval (≥50%+1 acceptance threshold). Parallel Careem stake purchase (12.5% from e&, agreed Jun-1-2026, put/call window Dec-2031–Jan-2032) and smaller completed/pending deals (Blacklane $1.1bn, signed Mar-30-2026, expected close by end-2026; Getir Turkey delivery portfolio ~$340M, food-delivery leg expected to close 2H2026, Turkish Competition Board approval already received Jun-19-2026; SpotHero, expected H1 2026 close; Segments.ai closed Oct-2025). | `Uber Technologies Inc NYSE UBER Key Developments.rtf` (extract: `Uber-Technologies-Inc-NYSE-UBER-Key-Developments.txt`); cross-checked in `analyses/UBER_2026-08-08/management-governance/02_capital-allocation-scorecard.md` (§2, RF-CAP-004) |
| Capital-return event (dividend / buyback) | Y (program-level, no fixed dates) | Active buyback authorization (Feb-2024, expanded Jul-2025, ~$27bn cumulative authorization); FY2025 repurchases $6,523M, TTM (to Jun-30-2026) $6,904M; no dividend ever paid (0% payout, 2016–LTM). No scheduled buyback-completion date or dividend-initiation date exists in this pool — pace/continuation is a soft signal to watch each quarter, not a dated event. | `analyses/UBER_2026-08-08/management-governance/02_capital-allocation-scorecard.md, §3–4` |
| Market-structure event (index review / lock-up) | Y (already occurred, informational only) | Index Constituent Drop 2026-06-26 and multiple Index Constituent Add events 2026-06-29 are recorded in the Events Calendar — these are in the past relative to today (2026-08-09) and are not forward catalysts for the 12-month window this module builds. No forward-looking index review or lock-up expiry date is present in the pool. | `Uber Technologies Inc NYSE UBER Events Calendar.xls, Events Calendar tab` |

## 1A. Upstream-Sourced Catalyst Detail (context for `01_catalyst-calendar`)

- **Delivery Hero tender timing** is the single largest and most concrete dated item in the pool: a signed Business Combination Agreement (Jul-16-2026) with an explicit "expected in the second half of 2027" offer window — outside the ~12-month near-term band but real, dated, and evidenced (not thematic). The deal is financed with a new ~€14bn bridge facility that would roughly double Uber's debt, and requires divesting overlapping Uber Eats operations in 14 markets for $1.6bn (SSW Partners) — both quantified, both dated to deal-close mechanics. `management-governance/02` already tripped the §24 Filter 4 serial-acquirer cap (RF-CAP-004) on this pattern; `01_catalyst-calendar` should read this catalyst through that lens, not as an uncomplicated bullish trigger.
- **2026 Term Loan maturity (Dec-2026)** is the nearest dated balance-sheet catalyst — $2,000M due within about 4 months of this report date, already flagged in `balance-sheet-survival/02` with cash-on-hand coverage math ($5,391M unrestricted liquidity vs. $3,324M of next-24-month maturities).
- **Q3 FY2026 earnings (Nov-03-2026 estimated)** carries already-issued guidance (EBITDA $2,860M–$2,960M, EPS Normalized $0.84–$0.88) and a live consensus-vs-guidance read (`earnings/04`) — a genuinely dated, evidenced near-term catalyst with both a beat and a miss path already characterized (Revenue estimates cut −1.04% post-print; EBITDA/EPS estimates raised over the same window).
- **Valuation re-rating triggers** are stated in `valuation/07_scenario-and-fair-value.md`: bull case ($104.17) requires Gross Bookings growth accelerating toward ~25% YoY and driver/courier payment-ratio improvement (~$1.9bn combined EBIT swing); this is a threshold/what's-priced-in trigger tied to the same Nov-03-2026 print and subsequent quarters, not a separate dated event.

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | Y — full `00`–`08` + synthesis, dated 2026-08-08 | Next-results date (Nov-03-2026 est.), issued Q3 guidance, beat/miss setup, revenue-vs-profitability revision divergence |
| balance-sheet-survival | Y — full `00`–`06` + synthesis, dated 2026-08-08 | 2026 Term Loan maturity (Dec-2026), 2028/2029/2030/2031+ note maturities, liquidity-runway coverage math |
| management-governance | Y — full `00`–`06` + synthesis, dated 2026-08-08 | Buyback pace/authorization, M&A pipeline (Delivery Hero, Careem, Blacklane, Getir, SpotHero) read through §24 Filter 4, no controlling-owner conflict flagged |
| valuation | Y — full `00`–`07` + synthesis, dated 2026-08-09 | Bull/base/bear re-rating triggers (Gross Bookings growth, driver-payment ratio), AV-disruption structural-reset trigger (24–36 month) |
| business-model | Y — full `00`–`12` + synthesis, dated 2026-08-08 | Driver-classification policy exposure (undated, ongoing), regulatory licensing risk (undated, ongoing), AV/robotaxi competitive threat (dated informally to Waymo's already-live fleet, not a scheduled event) |

## 3. Triage Verdict

**Sufficient.** This pool carries an unusually complete forward-looking calendar for a catalyst module: a CIQ-derived Events Calendar with a concrete next-earnings date (Nov-03-2026), a signed and dated M&A agreement with a stated offer window (Delivery Hero, H2 2027) backed by primary Key-Developments evidence, a near-term debt maturity with a hard date (Dec-2026 Term Loan) sourced from the balance-sheet-survival module's own 10-Q read, an already-issued next-quarter guidance range, and all five upstream modules (earnings, balance-sheet-survival, management-governance, valuation, business-model) completed and available to feed category-specific catalysts. The calendar `01_catalyst-calendar` builds from this can carry real proven dates for at least three categories (earnings, refinancing, M&A) rather than leaning on vague or thematic language. The remaining categories — regulatory/legal decisions, policy/government decisions, and capital-return completion — have real, material exposure but no scheduled dates in this pool, and must be recorded as undated/thematic risk rather than dated catalysts, consistent with `CLAUDE.md` §17.

