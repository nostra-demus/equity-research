# business-model Module Dossier — SMPL

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `business-model_memo.md`.

- Generated: 2026-08-05T19:25:32Z
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

# Business Model Reality Check — SMPL (Synthesis)

## Abstract

Simply Good Foods designs and markets protein and low-carb snacking brands — Quest, Atkins and OWYN — made entirely by third-party contract manufacturers and sold wholesale to large North American retailers. Quest, the dominant and only-growing brand, supplied 63.7% of nine-month FY2026 revenue while Atkins keeps shrinking and OWYN is still integrating. The strongest positive is the asset-light model's real cash generation: operating cash flow stayed positive in all of the last four fiscal years, including $178.5 million in FY2025, on capital spending of only 1.4-2.0% of sales. The strongest negative is a five-year, roughly 800-basis-point gross-margin decline (40.7% to 33.3% trailing-twelve-months) alongside no moat proven and return on capital sitting at or below its estimated cost of capital. No disqualifier triggered, but a tripped serial-acquirer filter (OWYN's $200 million write-off on a $280.4 million purchase) caps governance conviction — this reads as an average business worth deeper work only if valuation is cheap.

## 1. First-Pass Verdict

### Automatic Disqualifier Check

| # | Disqualifier | Triggered (Y/N) | Source |
|---|---|---|---|
| 1 | Auditor qualification or going-concern note (last 3 years) | N | Deloitte & Touche unqualified opinion, no going-concern language [FY2025 10-K, Auditor's Report] |
| 2 | >50% promoter / insider shares pledged | N | No promoter group; insiders hold 9.30% of shares; company bans pledging outright [2026 Proxy, Anti-Hedging and Pledging Policy] |
| 3 | Related-party transactions >25% of revenue or expenses | N | Only a legacy Investor Rights Agreement and standard indemnity agreements disclosed, no dollar-denominated RPT line [2026 Proxy, Certain Relationships] |
| 4 | Auditor changed twice in last 3 years without disclosed reason | N | Deloitte auditor since 2019; zero changes [2026 Proxy, Proposal 2] |
| 5 | Material restatement (>5% of revenue or net income) in last 2 years | N | No restatement found; FY2026 Q3 impairment is a current-period non-cash charge, not a restatement [FY2026 Q3 10-Q, Note 4] |
| 6 | Active regulatory enforcement action on financial reporting | N | "Not presently a party to any [material] litigation" [FY2025 10-K, Item 3] |
| 7 | >40% of revenue from single customer with no long-term contract | N | Largest customer (Walmart) ~31% of FY2025 net sales, below the 40% threshold [FY2025 10-K, Item 1A] |
| 8 | Negative operating cash flow in 3 of last 4 years (excl. growth-stage) | N | Positive operating cash flow in all of FY2022-FY2025 ($110.6m/$171.1m/$215.7m/$178.5m) [CIQ Financials_Annual, Cash Flow tab] |

All eight rows are clean. No verdict-lock applies.

### Verdict

- **Verdict:** Average business — worth deeper work only if valuation is cheap
- Disqualifier triggered: N
- Business clarity /100: 72 — the money-making mechanic (volume × net price, sold wholesale by an asset-light brand owner) is simple and well disclosed, but brand-level profitability is not disclosed at all, which caps clarity below the "very clear" band
- Business quality /100: 40 *(from `07_business-quality.md`, aggregate, weak band)*
- Moat /100: 30 *(from `09_moat.md`, strongest candidate source — brand — the only source scored above "very weak")*
- External dependency risk /100 *(higher = worse)*: 52 *(from `10_external-dependency.md`, "material external exposure, mixed mitigation" band)*
- Capital allocation & governance /100: 42 *(from `11_capital-allocation-governance.md`; already capped below the Filter 4 ceiling of 50 — see cap note below)*
- Data quality /100: 82 *(from `00_data-triage.md` — Sufficient verdict: FY2025 10-K ~9.3 months old, FQ3 FY2026 10-Q and transcript ~1 month old, 0 extraction failures across 65 extract files; gap is the absence of a `ciq_facts.json` sidecar and any brand-level profit disclosure, both noted, neither blocking sufficiency)*
- Overall usefulness /100: 45 *(capped at ≤70 by the Filter 4 trip below; sits well under that cap on the strength of the underlying weak quality/moat scores)*
- Business type (one line): Branded, asset-light consumer-packaged-food company selling protein/low-carb snacking brands (Quest, Atkins, OWYN) through third-party retailers, currently mid-way through a management-acknowledged operating turnaround [`02_business-identity.md`]
- Biggest business-model risk (one line): SMPL is a price-taker at both ends of the value chain — unhedged, single-source commodity inputs on one side and at-will, no-minimum-purchase retail contracts (Walmart ~31%, Amazon ~18%) on the other — with no moat proven to defend share as the September 2026 price increase is expected by management itself to trigger a roughly equal-or-larger volume loss [`06_value-chain.md`, `09_moat.md`].

**REJECTOR-FILTER CAPS (CLAUDE.md §24).**

- **Filter 1 — Crooks / integrity.** Not tripped. `01_disqualifier-scan.md` found no proven fraud and no unverified adverse "buzz" on integrity. No cap applied.
- **Filter 4 — Serial acquirers.** TRIPPED. `11_capital-allocation-governance.md` scored the acquisition-pattern row at 72/100 severity — two material, largely debt-funded post-IPO deals (Quest 2019, ~$982.1m; OWYN 2024, ~$280.4m funded mostly by a new $250m term loan), with OWYN already 71% written off ($200.0m of $280.4m) within two years, alongside a $93.0m Atkins brand impairment and $38.0m goodwill impairment in the same quarter. Per the rule, **Capital allocation & governance is capped at 50/100** (the underlying report already scored it at 42, inside that cap) and **Overall usefulness is capped at 70/100**.
- **Filter 5 — Fast-changing industry.** NOT tripped. `07_business-quality.md` scored the industry rate-of-change / disruption row at 45/100 — above the ≤40 trigger threshold — so Business quality is not capped by this filter and no `RF-BQ-005` tag applies. This is flagged as a live monitoring item, not a disqualifying one: the specific weight-management sub-category Atkins depends on (~29% of FY2025 revenue) is being reshaped by GLP-1 weight-loss drugs, and management itself acknowledges the "former management team" misjudged the trend.

**CAPITAL STRUCTURE TRANSACTION CAP.** Checked against `11_capital-allocation-governance.md`'s debt and share-count data: total debt moved from $437.3m (FY2024) to $304.4m (FY2025), a -30.4% YoY change, then to $448.5m (May-2026) — none of the disclosed period-over-period moves exceed the 50% YoY threshold. Shares outstanding moved from ~99.6m (FY2025) to ~88.4m (May-2026), an -11.2% change — below the 25% YoY threshold. **This cap is NOT triggered** — neither leg crosses its threshold, so it adds nothing beyond the Filter 4 cap already applied above.

**Module Disconfirmation (CLAUDE.md §8; fix F37).**

- **Strongest bear point:** A five-year, ~800-basis-point gross-margin decline (40.7% FY21 → 33.3% TTM) has continued to worsen in the most recent nine months (down a further ~470bps), and the company's own economic-moat test shows through-cycle return on capital (~7.0% CIQ vendor / ~8.8% computed) only marginally clearing a base-case cost of capital (~5.8%) and failing a more realistic, size-adjusted cost of capital (~7.8%), with the trough/TTM period failing both [`09_moat.md` §3].
- **Strongest bull point (steelman):** The asset-light model still throws off real cash — positive operating cash flow in all of the last four fiscal years ($178.5m in FY2025) on capex of only 1.4-2.0% of sales — and Quest, the dominant 63.7%-of-revenue brand, is still gaining household penetration (+120bps YoY to 20.5%) even as the consolidated business shrinks, with the board chairman and an independent director both buying stock in the open market near the FY2026 lows [`04_unit-economics.md`, `11_capital-allocation-governance.md`].
- **Single killer risk:** If the September 2026 price increase produces the volume loss management itself now expects (elasticity "at 1 or higher"), while Walmart (already cutting Atkins shelf space) or Amazon further trims distribution, SMPL has no proven moat to defend share on the way back down — the same dynamic already visible in Atkins' 24.6% quarterly revenue decline could spread to Quest [`06_value-chain.md` §3, `08_competitive-map.md` §3].
- **Disconfirming evidence already visible:** Quest's household penetration is still rising even as consolidated retail takeaway lags category growth (16.7-point gap in FQ3 FY2026) — some evidence the core brand is not (yet) losing ground the way Atkins has [`08_competitive-map.md` §3]. Cutting the other way, independent director David West's 696,000-share, $0-value "Other Disposition" (a non-open-market transfer of unclear character) complicates the "insiders are buying confidently" read that the capital-allocation report's smaller, open-market purchases by itself suggested [`12_red-flags-sweep.md` §2].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| data-triage | Sufficient — annual filing ~9.3 months old, quarterly filing + transcript ~1 month old, 0 extraction failures | No `ciq_facts.json` sidecar exists; CIQ figures must be cited from tab extracts directly |
| disqualifier-scan | No disqualifier triggered | All 8 checks clean; flags the $391.9m FY2026 Q3 impairment and Walmart/Amazon 49% concentration as material risks for downstream modules to weight |
| business-identity | Branded, asset-light CPG snacking company mid-turnaround | Revenue = volume × net price; company owns no manufacturing; single GAAP reportable segment despite three financially dissimilar brands |
| segment-map | Quest dominant and rising — 59.5% (FY25) → 63.7% (9mo FY26) of net sales | Zero brand-level profit, EBITDA, or asset disclosure despite Quest/Atkins/OWYN being financially dissimilar |
| unit-economics | Unclear — consolidated math still clears the bar today, but the trend is deteriorating and Quest cannot be isolated | Gross margin fell 220bps in FY2025 and a further ~470bps in the first nine months of FY2026; contribution-margin proxy down ~480bps over the same nine months |
| customer-geography | Concentrated on both customer and geography axes | Walmart (~31%) + Amazon (~18%) = ~49% of FY2025 net sales, both at-will with no minimum-purchase commitment; ~98% North America |
| value-chain | Squeezed — price-taker on both the input and output side | Single-source, unhedged core ingredients plus at-will retailer contracts; management expects price elasticity "at 1 or higher" on the September 2026 increase |
| business-quality | Aggregate 40/100 (weak) | ~800bps five-year gross-margin decline is the clearest single red flag; capital intensity (85) is the strongest factor, competitive intensity (30) the weakest |
| competitive-map | Losing relative share within its own dominant segment | Category grew 10% in FQ3 FY2026 while SMPL's retail takeaway fell 6.7% (a 16.7-point gap); BellRing Brands grew LTM revenue +6.4% vs SMPL's -4.5% |
| moat | No moat proven; trajectory eroding | Through-cycle ROIC (~7.0% CIQ vendor / ~8.8% computed) only marginally clears a base-case ~5.8% WACC and fails a size-adjusted ~7.8% WACC estimate; TTM/trough ROIC fails both |
| external-dependency | Partly externally driven; risk score 52/100 (inverted) | Unhedged commodity and tariff exposure is the single biggest lever; GLP-1 drug-driven category disruption is a live risk to Atkins |
| capital-allocation-governance | Capital allocation concerns; Filter 4 (serial acquirer) tripped | OWYN write-off of $200.0m against a $280.4m purchase price (71%) inside two years; capital allocation score capped at 50, scored 42 |
| red-flags-sweep | Elevated-transition-risk period — four related governance events concentrated in one window | CEO severance of $3.465m-$5.2m tied to the executive whose OWYN deal was later written down 71% (severity 50); CFO now also sole Principal Accounting Officer (severity 35); director West's 696,000-share zero-value disposition muddies the insider-buying signal (severity 30); $25m cash restructuring cost layered on top (severity 25) |

## 3. Reconciliation

No material disagreements between specialists on facts (revenue shares, margin figures, and customer/geography percentages are consistent across `02`, `03`, `05`, `06`, `07`, and `11`). One internal reconciliation worth noting for the record: `09_moat.md` found its own computed return on capital (8.8-8.9% through-cycle, 7.7% TTM) running ~180 basis points above the CIQ vendor's own "Return on Capital %" figure (7.0% through-cycle, 6.0% TTM), most likely because the vendor's capital base is broader than the strict debt-plus-equity-minus-cash basis used in the independent computation. `09_moat.md` already resolved this itself by using the more conservative, lower vendor figure as the headline for its economic-moat test — this synthesis adopts that same resolved figure and does not re-open it.

## 4. Note To The Final Synthesizer

- **Strongest business-model positive:** the asset-light, contract-manufactured model converts revenue to cash with very little capital (capex 1.4-2.0% of sales) and has produced positive operating cash flow in every one of the last four fiscal years, including $178.5 million in FY2025, even through the current margin and impairment stress [`07_business-quality.md`, `01_disqualifier-scan.md`].
- **Strongest business-model negative:** a five-year, ~800 basis-point gross-margin decline (40.7% FY21 → 33.3% TTM) that has worsened, not stabilized, in the most recent nine months, alongside a moat test that fails on a size-adjusted cost-of-capital basis [`07_business-quality.md`, `09_moat.md`].
- **Most important segment:** Quest — 59.5% of FY2025 revenue, rising to 63.7% of nine-month FY2026 revenue — is the brand the whole investment case now depends on, since Atkins is in structural decline (-24.6% quarterly) and OWYN is still integrating and structurally lower-margin [`03_segment-map.md`].
- **Cleanest unit-economics read:** cannot be derived at the brand level — the company aggregates Quest, Atkins and OWYN into one GAAP reportable segment and discloses zero brand-level profit, EBITDA or margin data, so every dollar-denominated unit-economics figure is consolidated across all three brands and cannot isolate whether Quest's own economics are healthy or are being subsidized by mix [`04_unit-economics.md`, `03_segment-map.md`].
- **Where the company sits vs named peers:** mixed, not a clean top or bottom — SMPL's LTM EBITDA/EBIT margins (15.6%/13.9%) sit at or slightly above BellRing Brands (13.4%/12.5%) and Glanbia's Performance Nutrition segment (13.0% EBITDA-only), but SMPL is losing on revenue growth (-4.5% LTM vs. BellRing's +6.4%) and — where disclosed — return on capital (SMPL's ~7-9% vs. BellRing's disclosed ~33.8% latest / ~46.6% five-year average, an unverified web figure but the only other data point in the named-peer set) [`08_competitive-map.md`, `09_moat.md` §4].
- **Main external dependency:** unhedged commodity and tariff-driven input-cost inflation (cocoa, dairy, protein, packaging) — the company explicitly does not hedge any core ingredient or packaging input, and this is the variable most likely to do the most damage on an adverse move [`10_external-dependency.md`].
- **Most important capital allocation or governance signal:** the OWYN acquisition — a $280.4 million, largely debt-funded deal that has already been written down $200.0 million (71%) within two years — is the clearest, most concrete evidence in this pool of value-destroying M&A, and it landed in the same fiscal window as a CEO change, a principal-accounting-officer resignation, and a $25 million restructuring program [`11_capital-allocation-governance.md`, `12_red-flags-sweep.md`].
- **Whether any automatic disqualifier triggered:** No. All eight `01_disqualifier-scan.md` checks are clean.
- **Which rejector filters tripped:** Filter 4 (serial acquirers) tripped at severity 72/100 — Capital allocation & governance capped at 50/100, Overall usefulness capped at 70/100. Filter 1 (crooks/integrity) and Filter 5 (fast-changing industry) did not trip — Filter 5's industry rate-of-change score (45/100) sits above the ≤40 trigger threshold, though the GLP-1-driven reshaping of the weight-management category remains a live, unresolved monitoring item for Atkins specifically.
- **Biggest missing data point:** brand-level (or at minimum Quest-only) gross margin, EBITDA and invested-capital disclosure — the single disclosure that would let the next analyst determine whether Quest's own unit economics are healthy in isolation, rather than blended with a declining Atkins and a structurally lower-margin OWYN [`04_unit-economics.md` §3, `03_segment-map.md` §3].
- **Whether the business deserves deeper work, and what would change the answer:** Worth deeper work only if valuation is cheap enough to compensate for the absence of a proven moat and the ongoing margin erosion — not a quality-compounder case at this stage. What would change the answer toward higher conviction: gross margin recovering toward the historical 38-40% band after the September 2026 price increase absorbs its expected volume hit, without further Walmart/Amazon shelf-space cuts, and a full fiscal year with no further material impairments or leadership turnover. What would change the answer toward avoid: a third material acquisition before OWYN is stabilized, further deterioration in Quest's own household penetration or retail takeaway (the one brand still growing), or a widening of the 16.7-point gap between category growth and SMPL's own retail takeaway.

## 5. Simple Summary

- **What it does:** Designs, markets and sells protein bars, shakes, powders and low-carb snacks under three brands — Quest, Atkins, OWYN — made by outside contract manufacturers, not by SMPL itself.
- **How it makes money:** Sells finished packaged product wholesale to large North American retailers; revenue is unit volume times the net price after trade promotions, with margin set by commodity input costs versus what the retailers will bear.
- **Whether each new unit creates value:** Unclear at the level that matters (Quest specifically) because the company discloses no brand-level profit; at the whole-company level the math still clears — gross margin comfortably exceeds marketing spend — but that consolidated number blends a growing Quest with a shrinking Atkins and a lower-margin OWYN.
- **Which segment matters most:** Quest, at 63.7% of nine-month FY2026 revenue and rising, is now effectively the whole investment case; Atkins is shrinking and OWYN is small and still integrating.
- **Whether it has a moat, and against whom:** No moat proven. Brand (household penetration) is the only candidate source scoring above "very weak," but a five-year gross-margin decline, an "at or below cost of capital" return on capital, and management's own admission that price increases will likely cost it volume all point the other way, against larger-scale rivals like BellRing Brands and Glanbia's Optimum Nutrition.
- **What external variables it depends on:** Unhedged commodity costs (cocoa, dairy, protein), tariffs on imported ingredients and packaging, and the GLP-1 weight-loss-drug trend reshaping the low-carb/weight-management category that Atkins depends on.
- **Whether capital is allocated well:** Mixed and capped. The balance sheet is conservatively run (0.5x net debt/EBITDA), but the OWYN acquisition — $280.4 million, mostly debt-funded — has already lost 71% of its value to a write-down within two years, tripping the serial-acquirer rejector filter and capping the governance score.
- **Whether it deserves deeper work:** Yes, but only if the price is cheap enough — this is an average, not a high-quality, business right now: real cash generation and a dominant, still-growing brand, offset by no proven moat, structural margin erosion, and a governance record scarred by one clearly value-destroying acquisition.



---

## business-model / 00_data-triage.md

_Source: `00_data-triage.md`_

# Data Triage — SMPL

## 1. File Inventory

Note on "Last Modified": these are Google-Drive sync timestamps (mostly 2026-07-24 or 2026-08-06), not statement dates — per CLAUDE.md fix F23, "Period Covered" below is parsed from text INSIDE each document, not from the file's mtime. `_pool_extracts/manifest.md` confirms 11 workbooks → 54 tabs, 65 total extract files, **0 extraction failures** — nothing in this pool is in a fail/fallback/missing-dependency state, so nothing is treated as absent for the sufficiency verdict.

| Filename | Type | Period Covered | Last Modified (Drive sync) | Notes |
|---|---|---|---|---|
| Annual Report on Form 10-K_2025.pdf | Annual filing (10-K) | FY2025, fiscal year ended Aug 30, 2025 | 2026-08-06 | Filed with SEC ~Oct 28, 2025. Primary annual filing, PDF. |
| The_Simply_Good_Foods_Company_-_Form_10-K(Oct-28-2025).doc | Annual filing (10-K) | FY2025, fiscal year ended Aug 30, 2025 | 2026-08-06 | Duplicate of above in mhtml/.doc export format, filed Oct 28, 2025. |
| The_Simply_Good_Foods_Company_-_Form_10-Q(Jul-09-2026).doc | Quarterly filing (10-Q) | FQ3 FY2026, quarter ended May 30, 2026 | 2026-08-06 | Filed with SEC Jul 9, 2026. Most recent quarterly filing. |
| The_Simply_Good_Foods_Company_-_Form_10-Q(Apr-09-2026).doc | Quarterly filing (10-Q) | FQ2 FY2026, quarter ended Feb 28, 2026 | 2026-08-06 | Filed with SEC Apr 9, 2026. |
| The Simply Good Foods Company, Q3 2026 Earnings Call, Jul 09, 2026.rtf | Earnings transcript | FQ3 FY2026 (quarter ended May 30, 2026), call held Jul 9, 2026 | 2026-07-24 | Most recent transcript, ~1 month old. |
| The Simply Good Foods Company, Q2 2026 Earnings Call, Apr 09, 2026.rtf | Earnings transcript | FQ2 FY2026 (quarter ended Feb 28, 2026), call held Apr 9, 2026 | 2026-06-25 | Prior-quarter transcript. |
| Annual Meeting Proxy Statement_2026.pdf | Proxy (governance/pay) | Governance data as of the 2026 Annual Meeting (held Jan 28, 2026), covering FY2025 compensation/board matters | 2026-08-06 | US DEF 14A-equivalent. Not a business-model primary source but useful for capital-allocation-governance agent. |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf | Data export (CIQ company profile) | As-of current (undated snapshot, no explicit period statement found in file) | 2026-08-06 | Vendor profile PDF, not a filing. |
| The Simply Good Foods Company NasdaqCM SMPL Key Developments.rtf | Data export (CIQ news/events feed) | Rolling news log, no single period | 2026-07-24 | Not a filing; supplementary. |
| The Simply Good Foods Company NasdaqCM SMPL Public Company Profile.rtf | Data export (CIQ company profile) | As-of current snapshot | 2026-07-24 | Not a filing; supplementary. |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership Summary.rtf | Data export (CIQ ownership summary) | As-of current snapshot | 2026-08-06 | Not a filing; supplementary. |
| Company Comparable Analysis The Simply Good Foods Company.xls — Financial Data | Data export tab (CIQ comps) | Multi-period comps, 50×17 | 2026-07-24 | Peer-comp financial data. |
| Company Comparable Analysis The Simply Good Foods Company.xls — Trading Multiples | Data export tab (CIQ comps) | Current trading multiples, 50×9 | 2026-07-24 | |
| Company Comparable Analysis The Simply Good Foods Company.xls — Operating Statistics | Data export tab (CIQ comps) | Multi-period, 50×13 | 2026-07-24 | |
| Company Comparable Analysis The Simply Good Foods Company.xls — Business Description | Data export tab (CIQ comps) | As-of current, 44×3 | 2026-07-24 | |
| Company Comparable Analysis The Simply Good Foods Company.xls — Implied Valuation | Data export tab (CIQ comps) | As-of current, 69×9 | 2026-07-24 | |
| Company Comparable Analysis The Simply Good Foods Company.xls — Valuation Chart | Data export tab (CIQ comps) | Time-series chart, 32×2 | 2026-07-24 | |
| Company Comparable Analysis The Simply Good Foods Company.xls — Credit Health Panel | Data export tab (CIQ comps) | Multi-period, 48×10 | 2026-07-24 | |
| Company Comparable Analysis The Simply Good Foods Company.xls — Disclaimer | Data export tab | Boilerplate, 26×1 | 2026-07-24 | Non-data tab. |
| Short_Interest_12m_SMPL.xls — Chart 1 with Data | Data export tab (short interest) | Trailing 12 months, 284×2 | 2026-08-06 | |
| Short_Interest_12m_SMPL.xls — Attributions | Data export tab | Boilerplate, 45×1 | 2026-08-06 | Non-data tab. |
| Credit Health Panel.xls — Summary | Data export tab (CIQ credit) | Multi-period, 63×11 | 2026-08-06 | |
| Credit Health Panel.xls — Financials | Data export tab (CIQ credit) | Multi-period, 40×13 | 2026-08-06 | |
| Credit Health Panel.xls — Operational Metrics Charts | Data export tab | 21×19 | 2026-08-06 | |
| Credit Health Panel.xls — Solvency Metrics Charts | Data export tab | 18×19 | 2026-08-06 | |
| Credit Health Panel.xls — Liquidity Metrics Charts | Data export tab | 15×19 | 2026-08-06 | |
| Credit Health Panel.xls — Disclaimer | Data export tab | Boilerplate, 26×1 | 2026-08-06 | Non-data tab. |
| Customers.xls — Customers | Data export tab (CIQ customer list) | As-of current, 20×6 | 2026-07-24 | |
| Events Calendar.xls — Events Calendar | Data export tab (CIQ events) | Forward calendar, 30×3 | 2026-08-06 | |
| Financials_Annual.xls — Key Stats | Data export tab (CIQ annual financials) | Multi-year annual, 91×12 | 2026-07-24 | |
| Financials_Annual.xls — Income Statement | Data export tab | Multi-year annual, 115×11 | 2026-07-24 | |
| Financials_Annual.xls — Balance Sheet | Data export tab | Multi-year annual, 88×11 | 2026-07-24 | |
| Financials_Annual.xls — Cash Flow | Data export tab | Multi-year annual, 75×11 | 2026-07-24 | |
| Financials_Annual.xls — Multiples | Data export tab | Multi-year annual, 91×41 | 2026-07-24 | |
| Financials_Annual.xls — Historical Capitalization | Data export tab | 39×37 | 2026-07-24 | |
| Financials_Annual.xls — Capital Structure Summary | Data export tab | 97×21 | 2026-07-24 | |
| Financials_Annual.xls — Capital Structure Details | Data export tab | 26×10 | 2026-07-24 | |
| Financials_Annual.xls — Ratios | Data export tab | Multi-year annual, 161×11 | 2026-07-24 | |
| Financials_Annual.xls — Supplemental | Data export tab | 60×10 | 2026-07-24 | |
| Financials_Annual.xls — Industry Specific | Data export tab | 15×6 | 2026-07-24 | |
| Financials_Annual.xls — Pension OPEB | Data export tab | 21×10 | 2026-07-24 | |
| Financials_Annual.xls — Segments | Data export tab (CIQ segment data) | Multi-year annual, 76×10 | 2026-07-24 | Feeds segment-map agent. |
| Financials_Quarterly.xls — Key Stats | Data export tab (CIQ quarterly financials) | Multi-quarter, 91×12 | 2026-07-24 | |
| Financials_Quarterly.xls — Income Statement | Data export tab | Multi-quarter, 113×40 | 2026-07-24 | |
| Financials_Quarterly.xls — Balance Sheet | Data export tab | Multi-quarter, 86×40 | 2026-07-24 | |
| Financials_Quarterly.xls — Cash Flow | Data export tab | Multi-quarter, 75×40 | 2026-07-24 | |
| Financials_Quarterly.xls — Multiples | Data export tab | Multi-quarter, 91×41 | 2026-07-24 | |
| Financials_Quarterly.xls — Historical Capitalization | Data export tab | 39×37 | 2026-07-24 | |
| Financials_Quarterly.xls — Capital Structure Summary | Data export tab | 70×79 | 2026-07-24 | |
| Financials_Quarterly.xls — Capital Structure Details | Data export tab | 26×10 | 2026-07-24 | |
| Financials_Quarterly.xls — Ratios | Data export tab | Multi-quarter, 161×40 | 2026-07-24 | |
| Financials_Quarterly.xls — Supplemental | Data export tab | 50×40 | 2026-07-24 | |
| Financials_Quarterly.xls — Industry Specific | Data export tab | 15×6 | 2026-07-24 | |
| Financials_Quarterly.xls — Pension OPEB | Data export tab | 15×6 | 2026-07-24 | |
| Financials_Quarterly.xls — Segments | Data export tab (CIQ segment data) | Multi-quarter, 71×40 | 2026-07-24 | Feeds segment-map agent. |
| Public Ownership History.xls — History | Data export tab (CIQ ownership) | Historical, 600×6 | 2026-08-06 | |
| Public Ownership Insider Trading.xls — Insider Trading | Data export tab (CIQ insider trades) | Historical log, 455×11 | 2026-08-06 | Feeds capital-allocation-governance / disqualifier-scan. |
| Suppliers.xls — Suppliers | Data export tab (CIQ supplier list) | As-of current, 38×8 | 2026-07-24 | Feeds value-chain / external-dependency agent. |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Consensus | Data export tab (CIQ estimates) | Forward consensus, 574×46 | 2026-08-06 | |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Recent Changes | Data export tab | 265×10 | 2026-08-06 | |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Guidance | Data export tab | 128×17 | 2026-08-06 | |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Multiples | Data export tab | 33×7 | 2026-08-06 | |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Surprise | Data export tab | 288×37 | 2026-08-06 | |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Trends | Data export tab | 296×18 | 2026-08-06 | |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — Revisions | Data export tab | 467×18 | 2026-08-06 | |

No investor presentation / investor deck file is present in the pool. No `ciq_facts.json` sidecar exists in `_pool_extracts/` (checked directly) — downstream agents must cite CIQ figures from the tab extracts listed above, sourced by their own reads.

## 1A. External Data

No `data/SMPL/external/` directory exists in the pool. No externally sourced research (alt-data panels, expert-call notes, channel checks, broker research, paid-API pulls) is present. This section is empty by design — nothing here moved (or could move) the sufficiency verdict.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months, vs. 2026-08-06) |
|---|---|---|---|
| Annual filing | Annual Report on Form 10-K_2025.pdf (and its .doc twin) | FY2025, fiscal year ended Aug 30, 2025 (filed ~Oct 28, 2025) | ~9.3 months since FYE |
| Quarterly filing | The_Simply_Good_Foods_Company_-_Form_10-Q(Jul-09-2026).doc | FQ3 FY2026, quarter ended May 30, 2026 (filed Jul 9, 2026) | ~2.2 months since period end; ~1 month since filing |
| Earnings transcript | The Simply Good Foods Company, Q3 2026 Earnings Call, Jul 09, 2026.rtf | FQ3 FY2026, call held Jul 9, 2026 | ~1 month |
| Investor deck | Not present in pool | — | — |
| Data export | TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls (Consensus tab, consensus as of Jul-09-2026 per embedded transcript header cross-check) | Forward consensus, current as of early Jul 2026 | ~1 month |

## 2A. Filing Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States (Nasdaq: SMPL) | 10-K cover page; CIQ profile "NasdaqCM:SMPL" [Annual Report on Form 10-K_2025.pdf; TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf] |
| Filing regime | US SEC | Form 10-K, Form 10-Q, DEF 14A-style proxy filed with SEC [Annual Report on Form 10-K_2025.pdf, cover page; Form 10-Q(Jul-09-2026).doc, SOX 906 certification referencing SEC filing] |
| Reporting standard | US GAAP | 10-K consolidated financial statements presented under US GAAP conventions (standard SEC domestic filer format) [Annual Report on Form 10-K_2025.pdf] |
| Reporting currency + fiscal-year end | USD; fiscal year ends the last Saturday in August (FY2025 ended Aug 30, 2025) | "fiscal year ended August 30, 2025" [Annual Report on Form 10-K_2025.pdf, cover/MD&A]; Q3 2026 earnings-call header states "Currency: USD" [Q3 2026 Earnings Call transcript, header] |
| Document language(s) | English (all documents) | Direct read of all extracts; no non-English filings in this pool |

Downstream agents should apply the US/SEC document map from CLAUDE.md §27: 10-K = annual filing, 10-Q = interim filing, proxy = governance/pay disclosure. No local-equivalent substitution is needed for this issuer.

## 3. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has an annual filing (FY2025 10-K, fiscal year ended Aug 30, 2025 — ~9.3 months old, within the 18-month window) AND a quarterly filing plus an earnings transcript both from FQ3 FY2026 (quarter ended May 30, 2026, filed/held early Jul 2026 — roughly 1 month old, well within the 6-month window), satisfying the Sufficient rule on both legs.
- **Critical missing items:** None required for sufficiency. Noted gaps that do not block the verdict: no standalone investor presentation/deck is in the pool (the earnings transcripts and CIQ exports substitute for the "deck" leg of the rule, which only requires one of {quarterly filing, transcript, investor deck}); no `ciq_facts.json` sidecar exists, so downstream agents must source CIQ figures directly from the tab-level extracts listed in Section 1, each cited by its own workbook/tab name and reconciled against the filing's own numbers per CLAUDE.md §5 where the same metric appears in both.



---

## business-model / 01_disqualifier-scan.md

_Source: `01_disqualifier-scan.md`_

# Disqualifier Scan — SMPL

## 1. Disqualifier Check

| # | Disqualifier | Triggered (Y/N) | Evidence |
|---|---|---|---|
| 1 | Auditor qualification or going-concern note (last 3 years) | N | Deloitte & Touche LLP's report states an unqualified opinion on both the consolidated financial statements and internal control over financial reporting (ICFR) for FY2025 (fifty-two weeks ended August 30, 2025); no going-concern language anywhere in the filing [FY2025 10-K, Report of Independent Registered Public Accounting Firm]. Prior years not separately re-verified in this pool, but no qualification, restatement, or going-concern note is referenced anywhere in the FY2025 10-K or the FY2026 Q2/Q3 10-Qs. |
| 2 | >50% promoter / insider shares pledged | N | No promoter group exists (this is a widely-held US company, not a founder/promoter-controlled issuer). Insiders (officers + directors) hold 9.30% of total shares outstanding [CIQ Public Ownership Summary]. The company's Anti-Hedging and Pledging Policy bans directors and management from pledging company stock as loan collateral outright: "We do not allow our management or directors to pledge our stock to secure loans or other financings" [2026 Annual Meeting Proxy Statement, "Anti-Hedging and Pledging Policy," p.~781/1938/2449]. No pledge disclosure found for any officer or director. Computed: 0% of insider group's own holding pledged ÷ 50% threshold — not triggered. (Separately, subsidiary equity interests are pledged as loan collateral under the corporate Credit Agreement [FY2025 10-K, Debt note] — this is ordinary secured corporate borrowing, not promoter/insider share pledging, and is not what #2 tests.) |
| 3 | Related-party transactions >25% of revenue or expenses | N | The FY2026 Proxy's "Certain Relationships and Related Person Transactions" section discloses only an Investor Rights Agreement (registration rights inherited from the 2017 Conyers Park Sponsor business combination, now with no board-nomination rights since October 2022) and standard director/officer indemnity agreements — no dollar-denominated related-party sales or purchases are disclosed [2026 Annual Meeting Proxy Statement, "Certain Relationships and Related Person Transactions," p.67-68]. No related-party transactions note with a dollar figure appears in the FY2025 10-K's Notes to Consolidated Financial Statements. Computed: related-party sales ÷ revenue = ~0% (no line item disclosed); related-party purchases ÷ total expenses = ~0% (no line item disclosed) — both far below the 25% threshold. |
| 4 | Auditor changed twice in last 3 years without disclosed reason | N | Deloitte & Touche LLP "has served as our independent public accounting firm since 2019" [2026 Annual Meeting Proxy Statement, "Ratification of Appointment of Deloitte & Touche LLP," p.68, line ~3322]. Zero auditor changes in the last 3 years (or since 2019), let alone two. |
| 5 | Material restatement (>5% of revenue or net income) in last 2 years | N | No restatement of prior-period financial statements is disclosed. The CIQ annual cash-flow export's "Restatement Type" field (NC = no change / RS = restated for reclassification / O = original) shows only routine "RS"/"RSA" reclassification tags in FY2018-FY2019 (outside the 2-year window) and "NC"/"O" (no restatement) for FY2022-FY2025 [CIQ Financials_Annual, Cash Flow tab, "Restatement Type" row]. The large FY2026 Q3 charges — a $391.9 million combined goodwill/intangible impairment (goodwill $38.0mm, OWYN brand $200.0mm, Atkins brand $93.0mm+31.0mm/quarter) — are current-period non-cash impairment charges triggered by a share-price decline, not a correction of previously issued financial statements [FY2026 Q3 10-Q, Note 4 (Goodwill and Intangibles)]. This is a real, disclosed earnings hit but it is not a restatement and does not trigger #5. |
| 6 | Active regulatory enforcement action on financial reporting | N | Item 3 (Legal Proceedings) of the FY2025 10-K states: "We are not presently a party to any litigation that we believe to be material, and we are not aware of any pending or threatened litigation against us that we believe could have a material adverse effect on our business, operating results, financial condition or cash flows" [FY2025 10-K, Item 3. Legal Proceedings, p.35]. No SEC investigation, subpoena, consent order, or cease-and-desist reference found anywhere in the 10-K, 10-Qs, or proxy. |
| 7 | >40% of revenue from single customer with no long-term contract | N | Largest customer Walmart Inc. = approximately 31% of consolidated net sales in FY2025 (24% mass retail + 7% Sam's Club/e-commerce); second-largest, Amazon, = approximately 18%; no other customer exceeds 10% [FY2025 10-K, Risk Factors, p.~2678 and MD&A p.~5400]. Computed: largest single customer 31% ÷ 40% threshold — not triggered (also below threshold, no ongoing long-term contract structure is disclosed either way, which is moot since the ratio itself does not cross 40%). |
| 8 | Negative operating cash flow in 3 of last 4 years (excl. growth-stage) | N | Cash from operations for the last four full fiscal years: FY2022 $110.6mm, FY2023 $171.1mm, FY2024 $215.7mm, FY2025 $178.5mm — all four years positive [CIQ Financials_Annual, Cash Flow tab, "Cash from Ops." row]. Trailing twelve months to May-30-2026 is also positive at $147.5mm despite a net loss of -$198.8mm driven by the non-cash impairment in #5. Zero of the last four years had negative operating cash flow. |

## 2. Triggered Disqualifiers — Detail

No disqualifier triggered.

## 3. Verdict-Lock Signal

- **Any disqualifier triggered:** N
- **If Y, names:** N/A
- **Action:** No verdict-lock applies from this scan. All 8 hard disqualifiers are clean on the evidence in the data pool. Downstream modules should still weigh the FY2026 Q3 goodwill/brand impairment ($391.9mm combined, driven by a sustained share-price decline against the OWYN and Atkins brands) and the 31%/18% two-customer concentration (Walmart/Amazon, 49% combined) as material risk factors in their own scoring — neither crosses a hard disqualifier threshold, but both are real and should be flagged in business-quality, red-flags-sweep, and balance-sheet-survival work.



---

## business-model / 02_business-identity.md

_Source: `02_business-identity.md`_

# Business Identity — SMPL

## 1. What The Company Actually Does

The Simply Good Foods Company designs, markets and sells packaged protein bars, ready-to-drink protein shakes, protein powders, protein chips, cookies and confections under three brands: Quest (protein-rich, low-sugar snacks), Atkins (low-carbohydrate weight-management foods and shakes), and OWYN (plant-based, allergen-free protein shakes and powders, acquired June 2024) [Annual Report on Form 10-K_2025, Item 1, p.7]. It does not manufacture anything itself — it contracts with third-party contract manufacturers to produce the products and with distributors and brokers to move them, while it keeps in-house the parts of the business that set the brand's value: marketing, product development, sales relationships and supply-chain planning [Annual Report on Form 10-K_2025, Item 1, p.10 ("We operate an asset-light business model. For the manufacture of our products, we contract with contract manufacturers...")]. Its customers are large North American retailers — mass merchandisers, grocery, club stores, drug stores, convenience stores and e-commerce — who buy the finished packaged product and resell it to consumers; the two biggest, Walmart and Amazon, took roughly 31% and 18% of FY2025 consolidated net sales respectively [Annual Report on Form 10-K_2025, Item 1, p.10]. Sales are concentrated in the United States: international sales (mainly Australia and New Zealand) were only about 2.0% of FY2025 total net sales [Annual Report on Form 10-K_2025, Item 1, p.17]. The problem it solves for the end consumer is convenient, protein-forward, lower-sugar/lower-carb food and snacking to support weight management, active lifestyles or general health goals [Annual Report on Form 10-K_2025, Item 1, p.7]. The company operates as a single reportable segment (Quest, Atkins and OWYN are run as separate operating segments internally but aggregated for reporting because of similar economics) [Annual Report on Form 10-K_2025, Item 8, Note, p.38 ("...organized into two operating segments, Quest and Atkins, and OWYN, which are aggregated into one reportable segment...")].

## 2. How The Company Makes Money

`Revenue = volume of product sold to retailers (cases/units) × net price per unit (list price less trade promotions, slotting fees, and other sales credits)`

This one formula applies across all three brands (Quest, Atkins, OWYN) — they are separately branded but share the identical asset-light sell-through-retail model; the brand-by-brand split of that one formula is `segment-map`'s job, not this report's. Volume is driven by retail distribution (how many stores/SKUs carry the product), household penetration (what share of U.S. households buy the brand), and underlying retail "takeaway" / consumption trends — all metrics management tracks explicitly [Q3 FY2026 Earnings Call, Jul 09, 2026, prepared remarks: "household penetration increased 120 basis points...retail takeaway declined 6.7%..."]. Price is driven by list-price increases (the company just announced a "high single-digit price increase across most of our portfolio" effective September 2026 to offset protein and packaging cost inflation) net of the trade promotions and slotting fees paid to retailers to win shelf space [Q3 FY2026 Earnings Call, Jul 09, 2026, prepared remarks]. Margin is set mainly by the cost of goods paid to contract manufacturers (ingredients — cocoa, dairy, proteins, soy, nuts — plus packaging, tolling fees and freight) relative to net price, and by how much of gross profit gets reinvested into selling and marketing (the largest discretionary opex line) [Annual Report on Form 10-K_2025, Item 7, p.40].

## 3. Business Type Classification

Branded, asset-light consumer-packaged-food company selling protein/low-carb snacking brands (Quest, Atkins, OWYN) through third-party retailers, currently mid-way through a management-acknowledged operating turnaround after a year of declining net sales, margin and household penetration [Q3 FY2026 Earnings Call, Jul 09, 2026, prepared remarks: "we remain in the early stages of our turnaround"].

## 3a. Sector Overlay & Required-KPI Checklist

The closest row in `frameworks/SECTOR_OVERLAYS.md` is "Retail / consumer," but that row's KPI grammar (same-store sales growth, sales per square foot, store count) is built for companies that operate physical stores. SMPL owns no stores — it is a brand manufacturer that sells *into* other companies' retail stores — so that row does not fit its actual economics. **No sector overlay for "branded asset-light CPG snacking company" — generic read.** The generic default (`volume, price/mix, utilization, order book/backlog, segment mix, working-capital cycle`) applies, refined with the specific KPIs management itself uses to run the business:

| KPI (as used by management) | Present / Absent in pool | Evidence |
|---|---|---|
| Net sales growth (volume + price/mix) | Present | FY2025 net sales $1,450.9M, +9.0% YoY [Annual Report on Form 10-K_2025, Item 7, p.40]; Q3 FY2026 net sales $357M, -6.3% YoY [Q3 FY2026 Earnings Call, Jul 09, 2026] |
| Gross margin (COGS as % of net sales) | Present | FY2025 gross margin 36.2%, down 220bps YoY [Annual Report on Form 10-K_2025, Item 7, p.41]; Q3 FY2026 gross margin 32.5%, down 390bps YoY [Q3 FY2026 Earnings Call, Jul 09, 2026] |
| Retail takeaway / consumption (point-of-sale, not just shipments) | Present | "Our retail takeaway declined 6.7% during the quarter" [Q3 FY2026 Earnings Call, Jul 09, 2026, prepared remarks] — sourced from Circana MULO++C scanner data, cited as such by management |
| Household penetration | Present | Quest 20.5% (+120bps YoY); Atkins 8.5% (-220bps YoY); OWYN 4.3% (flat YoY) [Q3 FY2026 Earnings Call, Jul 09, 2026, prepared remarks] |
| Customer / retailer concentration | Present | Walmart ~31% and Amazon ~18% of FY2025 consolidated net sales [Annual Report on Form 10-K_2025, Item 1, p.10] |
| Adjusted EBITDA margin | Present | FY2025 19.2% ($278.2M) vs. FY2024 20.2% ($269.1M) [Annual Report on Form 10-K_2025, Item 7, p.40] |
| Distribution / shelf-space trend (points of distribution) | Present, qualitative only (no numeric distribution-points series) | "Atkins net sales declined 24.6%...reflecting continued pressure from declining household penetration" and prior-year "reduction of distribution" [Annual Report on Form 10-K_2025, Item 7, p.40; Q3 FY2026 Earnings Call, Jul 09, 2026] |
| Inventory turns / working-capital cycle detail | Absent — not disclosed at brand or SKU level | Not found in 10-K or transcripts; only consolidated balance-sheet inventory is available in the CIQ Financials workbook |

No required KPI is critically absent for a first-pass identity read; the one gap (SKU/brand-level inventory and distribution-point counts) should be flagged as a data gap for `business-quality` and `unit-economics`, which need finer granularity than this report requires.

Sector-style red flags to carry forward (generic CPG lens, not a formal overlay row): (1) heavy reliance on two retailers for ~49% of FY2025 net sales with "at will" contracts and no minimum-purchase commitments [Annual Report on Form 10-K_2025, Item 1, p.10; Item 1A]; (2) one brand (Atkins) in active double-digit revenue decline while carrying a non-cash $82M goodwill/intangible impairment in Q3 FY2026 [Q3 FY2026 Earnings Call, Jul 09, 2026, prepared remarks]; (3) input-cost inflation (protein, packaging, cocoa) compressing gross margin faster than pricing can offset it in-year. Valuation norm for this business type: EV/EBITDA and P/E against volume/price/mix and gross-margin trend, and FCFF DCF — consistent with the generic operating-company path, not a store-based retail multiple.

## 4. What Drives Variance

Net sales moves mostly on volume (how many units retailers sell through to consumers, which tracks household penetration and shelf distribution) rather than price in a normal year, but FY2026 is not a normal year: management is layering a high-single-digit list-price increase in September 2026 on top of falling volume to offset protein and packaging cost inflation [Q3 FY2026 Earnings Call, Jul 09, 2026, prepared remarks]. Margin swings are driven mainly by commodity input costs (cocoa, dairy, protein) relative to the fixed tolling fees paid to contract manufacturers, plus brand mix — OWYN currently carries a lower gross margin than the legacy Quest/Atkins business, so its growing share of sales has been diluting the consolidated gross margin [Annual Report on Form 10-K_2025, Item 7, p.41: "lower gross profit margins of the OWYN business"]. Brand mix is also the single biggest swing factor at the consolidated level right now: Quest and OWYN are growing single digits while Atkins net sales fell 24.6% in the most recent quarter, so the blended net-sales and margin trend depends heavily on how much weight each brand carries [Q3 FY2026 Earnings Call, Jul 09, 2026, prepared remarks]. One-off items (the $82M non-cash impairment on Atkins/OWYN intangibles, restructuring costs in the supply chain) are currently distorting GAAP operating income relative to the underlying cash-generating business and should not be read as a recurring cost trend [Q3 FY2026 Earnings Call, Jul 09, 2026, prepared remarks].



---

## business-model / 03_segment-map.md

_Source: `03_segment-map.md`_

# Segment Map — SMPL

## 1. Segment Table

SMPL reports **one reportable segment** under US GAAP (ASC 280). Legally, there is no segment-level profit disclosure — the Chief Operating Decision Maker (the CEO) reviews only consolidated net income, not brand-level income [FY25 10-K, Note 15 (Segment and Customer Information)]. Revenue, however, IS disclosed by brand as part of a revenue-disaggregation note. The table below uses that brand-level revenue disaggregation as the closest available proxy for "segments" — it is NOT a GAAP reportable segment and profit shares are genuinely not disclosed.

| Segment (brand) | What It Does | Revenue Share (FY25) | Profit Share | Margin Quality | Capital Intensity | Cyclicality | Main Risk |
|---|---|---:|---:|---|---|---|---|
| Quest | Protein bars, protein chips, cookies, confections, RTD protein shakes — performance/active-lifestyle positioning | 59.5% | Not disclosed | Mid — no brand P&L, but management calls it the primary sales growth driver; FY25 net sales +11.1% y/y | Low (outsourced/co-manufactured, asset-light per management) | Mid — discretionary snack spend | Bar-segment consumption declined ~5% in FQ3 FY26 even as chips/milkshakes grew; brand reliant on continued innovation |
| Atkins | Low-carbohydrate protein bars, RTD shakes, confections — weight-management positioning | 29.0% | Not disclosed | Low — company states gross margin pressure from Atkins distribution losses; FY25 net sales −14.5% y/y; brand intangible impaired $60.9m in FY25 | Low (outsourced/co-manufactured) | Mid-High — losing retail shelf space | Structural distribution losses; retail takeaway declined ~24% y/y in FQ3 FY26; brand and trademark indefinite-lived intangible impaired in FY25 [FY25 10-K, Note 9] |
| OWYN | Plant-based, allergen-free RTD protein shakes and powders (acquired Nov 2023, full first year in FY25) | 9.4% | Not disclosed | Low — filing explicitly states OWYN carries "lower gross profit margins" than the legacy portfolio [FY25 10-K, MD&A p.39] | Low-Mid (integration still in progress; some incremental capex noted for salty-snacks/other capacity) | Mid-High — newly acquired, product-quality issue disclosed in FY26 depressing near-term distribution | Product-quality issue in FY26 (per Q3 FY26 call) causing expected distribution losses over the next 6–12 months; OWYN brand intangible also impaired in FY25 alongside Atkins |
| International / unallocated | Sales outside North America, not broken out by brand | 2.0% | Not disclosed | Not disclosed | Not disclosed | Not disclosed | Small and shrinking (-9.9% y/y in FY25); disclosure does not split by brand |

Revenue shares are calculated from the FY25 10-K brand/geography disaggregation table: Atkins $420.787m, Quest $863.614m, OWYN $137.020m, International $29.499m, Total $1,450.920m [FY25 10-K, Note 15 (Segment and Customer Information), "revenue disaggregated by geographic area and brand" table]. Shares sum to 99.9% of the $1,450.920m total (rounding). No brand-level operating profit, EBITDA, or margin figure is disclosed anywhere in the filing — the "Profit Share" column is "Not disclosed" for every row and should be treated as a hard disclosure gap by downstream agents.

## 2. Dominant Segment

**Quest is the dominant segment by revenue — 59.5% of FY2025 net sales ($863.6m of $1,450.9m) — and the trend is strengthening: Quest's share rose to 63.7% of net sales in the nine months ended May 30, 2026 ($652.0m of $1,023.2m) as Atkins kept shrinking** [FY25 10-K, Note 15; FQ3 FY26 10-Q, Note 12 (Segment and Customer Information)]. Profit share cannot be named because the company discloses no brand-level profit metric — the dominance call here rests on revenue only, which the report structure requires to be flagged explicitly as a limitation. Qualitatively, management calls Quest "our largest brand and most important growth engine of the company" [Q3 FY26 earnings call, Jul 9, 2026, CEO prepared remarks], and FY25 net sales grew 9.0% company-wide "driven by Quest and OWYN volume growth, which more than offset continued declines in Atkins" [FY25 10-K, MD&A p.38].

This is not a single-segment business in the GAAP sense (it legally reports one reportable segment company-wide, so >85% concentration by that measure is automatic and not meaningful) — but at the brand level, no single brand exceeds 85% of revenue, so it is treated here as a three-brand portfolio with one brand (Quest) clearly dominant and growing, one brand (Atkins) in structural decline, and one small, newly acquired, lower-margin brand (OWYN) still integrating.

## 3. Segment Disclosure Quality

Disclosure quality is weak relative to the size of the underlying brand differences. SMPL aggregates what it internally organizes as two-then-three operating segments (Quest and Atkins historically; Quest, Atkins, and OWYN as of the OWYN Acquisition in FQ2 FY2024) into a single ASC 280 reportable segment, on the stated grounds of similar products, production processes, distribution methods, customer types, and regulatory environment [FY25 10-K, Note 15]. That aggregation is permitted under GAAP but it means investors get brand-level revenue (helpful) with zero brand-level profitability, margin, or asset data (a real gap) — even though the filing's own MD&A makes clear the brands are NOT financially alike: Atkins had a $60.9m intangible impairment in FY25 driven by declining revenue projections [FY25 10-K, Note 9], and the MD&A separately states OWYN carries structurally lower gross margins than the rest of the portfolio [FY25 10-K, MD&A p.39]. Segment definitions changed twice in three years: one consolidated segment through FY2023, two operating segments (Quest, Atkins) from FY2024, and three operating segments (Quest, Atkins, OWYN) following the OWYN acquisition in FQ2 FY2024 — all three periods aggregated into one reportable segment throughout [FY25 10-K, Note 15]. The "Other/Corporate" bucket here is functionally the unbroken-out International line, which is small (2.0% of FY25 revenue, shrinking) and not a material disclosure problem on its own. The larger problem for downstream agents (`unit-economics`, `competitive-map`, `business-quality`) is the total absence of brand-level profit, EBITDA, or capital-employed data — any brand-level margin or ROIC work will have to rely on management's qualitative statements (e.g., "lower gross profit margins of the OWYN business") rather than a disclosed number, and should be labeled as such.

## 4. Citations

- Brand revenue shares (FY25: Atkins $420.787m / Quest $863.614m / OWYN $137.020m / International $29.499m / Total $1,450.920m) — FY25 10-K, Note 15 (Segment and Customer Information), "revenue disaggregated by geographic area and brand" table.
- FY24 comparative brand revenue (Atkins $491.986m / Quest $777.394m / OWYN $29.213m / International $32.728m / Total $1,331.321m) — FY25 10-K, Note 15, same table (comparative column).
- Nine-month FY2026 brand revenue (39 weeks ended May 30, 2026: Atkins $254.636m / Quest $652.045m / OWYN $94.091m / International $22.422m / Total $1,023.194m) — FQ3 FY26 10-Q (filed Jul 9, 2026), Note 12 (Segment and Customer Information), revenue disaggregation table.
- One-reportable-segment determination and aggregation rationale — FY25 10-K, Note 15 (Segment and Customer Information); FY25 10-K, MD&A, "Our Reportable Segment" section.
- FY25 net sales growth (+9.0%, $119.6m) "driven by Quest and OWYN volume growth ... offset continued declines in Atkins" — FY25 10-K, MD&A p.38-39.
- "lower gross profit margins of the OWYN business" — FY25 10-K, MD&A p.39.
- $60.9m impairment of Atkins brand/trademark intangible and licensing-agreement intangible in FY25 — FY25 10-K, Note 9 (Goodwill and Intangible Assets).
- FQ3 FY26 brand performance (Quest net sales +1.1%, OWYN +3.6%, Atkins −24.6%; Quest called "largest brand and most important growth engine") — Q3 FY26 earnings call transcript, Jul 9, 2026, CEO Joseph Scalzo prepared remarks.
- FQ3 FY26 net sales decline (−6.3% to $357.0m) "driven by distribution-related declines for Atkins ... partially offset by Quest and OWYN volume-driven growth" — FQ3 FY26 10-Q, MD&A, Jul 9, 2026.
- CIQ vendor cross-check: Financials_Annual.xls, Segments tab, reports SMPL as a single "Branded Nutritional Foods and Snacking Products" business segment with consolidated (not brand-level) revenue/profit/assets for FY2017–FY2025, consistent with the one-reportable-segment GAAP determination above [The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls, Segments tab]. No `ciq_facts.json` sidecar exists in this run's `_pool_extracts/`, so this vendor figure is cited directly from the workbook tab per the data-triage note, not from a facts sidecar.



---

## business-model / 04_unit-economics.md

_Source: `04_unit-economics.md`_

# Unit Economics — SMPL

## 1. Natural Unit

The natural economic unit for Quest (the dominant brand, 59.5% of FY25 net sales and rising to 63.7% of nine-month FY26 net sales [FY25 10-K, Note 15; FQ3 FY26 10-Q, Note 12]) is **the household** — an individual U.S. household that buys the brand at least once in a period. Management itself runs the business on this unit, not on dollars of revenue directly: "If you look at the fundamental metrics around brand health, that's households. So are we growing households, are we growing buy rate" [Q2 FY26 earnings call, Apr 9, 2026, CEO Q&A]. The two building blocks the company discloses are **household penetration** (% of U.S. households buying the brand in a period) and **buy rate** (purchase frequency/volume per buying household — disclosed only qualitatively, as "declining" or "growing," never as a number).

A packaged-food manufacturer's more literal production unit would be the case or unit of product sold, but SMPL discloses no price-per-unit, volume-per-case, or unit-count data anywhere in the filings, transcripts, or the CIQ workbooks reviewed — so that unit cannot be built from available evidence and is not used here. Household is the unit management itself uses to explain growth or decline, and it is the unit this report follows.

Because SMPL aggregates Quest, Atkins, and OWYN into a single ASC 280 reportable segment with no brand-level profit, gross margin, or asset disclosure [FY25 10-K, Note 15 — confirmed by `03_segment-map.md` §3], every dollar-denominated metric below (gross margin, contribution margin, marketing spend) is **consolidated across all three brands, not Quest-specific**. This is flagged in every row it affects.

## 2. Unit Economics Table

| Unit Economic | Value | Period | Direction vs Prior Year | Evidence |
|---|---|---|---|---|
| Revenue per unit (per household) | Not disclosed — the company gives household penetration (%) and net sales ($) separately but never divides one by the other, and gives no U.S. household count to derive it from filings alone | — | Unknown | No source discloses this figure |
| Household penetration — Quest (dominant brand) | 20.5% of U.S. households | FQ3 FY26 (13 weeks ended May 30, 2026) | **Improving** — up 120 basis points year-over-year | Q3 FY26 earnings call, Jul 9, 2026, CEO prepared remarks |
| Household penetration — Atkins | 8.5% | FQ3 FY26 | **Deteriorating** — down ~220 basis points year-over-year | Q3 FY26 earnings call, Jul 9, 2026, CEO prepared remarks |
| Household penetration — OWYN | 4.3% | FQ3 FY26 | Stable — flat year-over-year | Q3 FY26 earnings call, Jul 9, 2026, CEO prepared remarks |
| Buy rate (purchase frequency per household) | Not quantified — disclosed only directionally. Quest bar buy rate is explicitly called out as "improving [buy rate], particularly within bars" as a stated priority, implying it is currently weak; Atkins and OWYN buy rate both called "declining" | FY26 (qualitative, through FQ3) | **Deteriorating** for Atkins and OWYN; Quest bars flagged as needing improvement, Quest chips strong (chip consumption +17% in FQ3 FY26) | Q3 FY26 earnings call, Jul 9, 2026, CEO prepared remarks; Q2 FY26 earnings call, Apr 9, 2026, CEO prepared remarks |
| Gross margin per unit (consolidated, all 3 brands — not Quest-specific) | 36.2% of net sales (FY25) vs 38.4% (FY24); 32.2% (9 months FY26, ended May 30, 2026) vs 36.9% (9 months FY25) | FY25 10-K; FQ3 FY26 10-Q | **Deteriorating** — down 220 bps FY25 vs FY24; down 470 bps in the first 9 months of FY26 vs the prior-year period, driven by commodity cost inflation (notably cocoa), tariffs, and OWYN's structurally lower margin mix | FY25 10-K, MD&A p.41 (Results of Operations table); FQ3 FY26 10-Q, MD&A (39-week comparison table) |
| Contribution margin per unit (calculated: gross margin − Selling & marketing as % of net sales; a proxy, since brand-level variable-cost data is not disclosed) | 26.9% (FY25) vs 27.6% (FY24); 22.7% (9 months FY26) vs 27.5% (9 months FY25) | FY25 10-K; FQ3 FY26 10-Q | **Deteriorating** — down ~70 bps FY25 vs FY24, and down ~480 bps in the 9-month FY26 period vs the prior year, almost entirely a gross-margin story rather than a marketing-spend story | Calculated from FY25 10-K, MD&A p.41 and FQ3 FY26 10-Q, MD&A (both cited above) |
| Cost to acquire / build the unit (Selling & marketing spend, consolidated, all brands) | $134.3m = 9.3% of net sales (FY25) vs $143.9m = 10.8% (FY24); $97.0m = 9.5% of net sales (9 months FY26) vs $101.9m = 9.4% (9 months FY25) | FY25 10-K; FQ3 FY26 10-Q | Mixed — down as a % of sales FY25 vs FY24, but management states this cut was itself the cause of the household-penetration and buy-rate slowdown, not a sign of efficiency: "gross margins approaching 40%, with sustained marketing investment around 10% of sales... The shape of our P&L has moved far [away] from this ideal structure with gross margins in the middle 30s, reductions in marketing spend as a percent of sales" [Q2 FY26 earnings call, Apr 9, 2026, CEO prepared remarks] | FY25 10-K, MD&A p.41; FQ3 FY26 10-Q, MD&A; Q2 FY26 earnings call, Apr 9, 2026, CEO prepared remarks |
| Payback period or unit lifetime (per household) | Not disclosed — no cohort, retention-rate, or customer-lifetime-value data is published in any source reviewed | — | Unknown | No source discloses this figure |

## 3. Value Creation Read

**Unclear — the consolidated math still clears the bar today, but the dominant unit (Quest) cannot be isolated, and the trend is deteriorating across every disclosed period.** At the whole-company level, gross margin (32.2%–36.2% depending on period) comfortably exceeds Selling & marketing spend (9.3%–9.5% of net sales), leaving a large residual that funds G&A and still produces consolidated Adjusted EBITDA margins of 16.5% (9 months FY26) to 19.6% (9 months FY25) [FQ3 FY26 10-Q, MD&A] — arithmetically, each household recruited generates far more gross margin than it costs to market to, in aggregate. But that consolidated figure blends Quest (dominant, still gaining penetration) with Atkins (losing penetration and distribution, brand intangible impaired $60.9m in FY25 [FY25 10-K, Note 9]) and OWYN (management states explicitly it "carries lower gross profit margins" than the rest of the portfolio [FY25 10-K, MD&A p.39]) — so it is not possible to say from disclosure whether Quest's own household economics are healthy or are being subsidized by mix. The single most valuable missing disclosure is a brand-level (or even a Quest-only) gross margin and marketing-spend line — the company chooses not to publish one under its ASC 280 aggregation [confirmed in `03_segment-map.md`]. Management's own account of what broke the model — cutting marketing below its stated ~10%-of-sales "sustained investment" benchmark, which it directly links to slowing household penetration and buy rate on Atkins and OWYN, and now a softening Quest bar buy rate too [Q2 FY26 and Q3 FY26 earnings calls] — means the value-creation case rests on a return to that spending discipline, not on the current run-rate.

## 4. Sensitivity

**Gross margin has been the most volatile input historically and is the one that would most change this read if it moved another 20%.** It fell 220 basis points in FY25 (38.4% → 36.2%) and a further 390–470 basis points in FQ3 FY26 and the nine-month FY26 period (36.4%/36.9% → 32.5%/32.2%), driven by commodity inflation (cocoa named specifically), tariffs, restructuring costs, and OWYN's lower-margin mix [FY25 10-K, MD&A p.41; FQ3 FY26 10-Q, MD&A]. A further ~20% relative decline from the current 32.2% nine-month level (to roughly 26%) would push the calculated contribution-margin proxy (gross margin minus Selling & marketing) down toward the mid-teens, materially compressing the room available to fund marketing investment and G&A without an offsetting price increase. Selling & marketing spend as a percentage of sales has moved far less (9.3%–10.8% over the periods shown) but matters for a different reason: management's own account is that even the modest cut already taken — from roughly 10% toward 9.3%–9.5% — was enough to visibly slow household penetration and buy rate on two of the three brands, which suggests the unit-economics math is more sensitive to marketing underinvestment than the dollar-percentage move alone would suggest.



---

## business-model / 05_customer-geography.md

_Source: `05_customer-geography.md`_

# Customer And Geography Map — SMPL

## 1. Customer Map

| Customer Type | Importance (% of revenue if disclosed) | Long-term Contract? (Y/N/Not disclosed) | Evidence | Risk |
|---|---|---|---|---|
| Walmart Inc. (largest retailer; ~24% mass retail channel + ~7% Sam's Club/e-commerce channel) | ~31% of consolidated net sales, FY2025 | N — company states it maintains "at-will" contracts with retailers that "do not require recurring or minimum purchase amounts," and separately that retailers "rarely provide us with firm, long- or short-term volume purchase commitments." | FY25 10-K, Item 1A Risk Factors ("We rely on sales to a limited number of retailers…") | During FY2025, Walmart reduced the number of Atkins products it carries in its stores and may reduce assortment further [FY25 10-K, Item 1A] |
| Amazon (next-largest retailer, includes Amazon.com distributor/marketplace sales) | ~18% of consolidated net sales, FY2025 | N — same at-will, no-minimum-purchase disclosure applies to all significant retailers | FY25 10-K, Item 1A Risk Factors | Same platform-dependency and order-volatility risk as other large retailers |
| All other individual customers | Each <10% of consolidated net sales, FY2025 (not separately broken out) | Not disclosed | FY25 10-K, Item 1A Risk Factors ("No other customer represents more than 10% of sales") | Aggregate "limited number of retailers" concentration — company states it "expect[s] most of our sales will continue to come from a relatively small number of retailers for the foreseeable future" [FY25 10-K, Item 1A] |

Walmart and Amazon together accounted for approximately 49% of FY2025 consolidated net sales (31% + 18%), based on the company's own disclosed percentages [FY25 10-K, Item 1A]. The company sells through mass merchandise, food, club, drug, small-format, and e-commerce channels, but the underlying customer base for revenue-recognition purposes is a small number of retail accounts, not end consumers [FY25 10-K, Item 1, Business].

## 2. Geography Map

| Geography | % of Revenue | Trend (Growing / Stable / Declining / Unknown) | Evidence | Risk |
|---|---:|---|---|---|
| North America (substantially all United States) | 98.0% ($1,421.4m of $1,450.9m total net sales, 52 weeks ended August 30, 2025) | Growing in dollar terms, and its SHARE of total is rising (97.3% FY2023 → 97.5% FY2024 → 98.0% FY2025), driven by North America-based OWYN acquisition sales layering on top of Atkins/Quest | FY25 10-K, Note 15 (Segment and Customer Information — Geographic Information) | Company states in Item 1A that its "geographic focus…makes us particularly vulnerable to economic and other events and trends in North America" [FY25 10-K, Item 1A] |
| International (led by Australia and New Zealand; no single foreign country individually >10% of net sales) | 2.0% ($29.5m of $1,450.9m total net sales, FY2025) | Declining as a share of total (2.7% FY2023 → 2.5% FY2024 → 2.0% FY2025), and declining slightly in absolute dollars too ($33.1m FY2023 → $32.7m FY2024 → $29.5m FY2025) | FY25 10-K, Note 15 (Segment and Customer Information — Geographic Information); FY25 10-K, Item 1, Business ("top international sales are in Australia and New Zealand…international net sales represented approximately 2.0% of total net sales") | Immaterial to results either way — too small to move the business, and shrinking further |

Shares sum to 100% (North America 98.0% + International 2.0% = 100.0% of $1,450.9m total net sales, FY2025) [FY25 10-K, Note 15]. The company reports a single reportable segment (Quest, Atkins, and OWYN are aggregated) [FY25 10-K, Note 15], so no further segment-level geographic split is disclosed.

## 3. Concentration Flags

| Concentration Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| One customer >20% of revenue | Y | Walmart Inc. ~31% of consolidated net sales, FY2025 [FY25 10-K, Item 1A] |
| Top 3 customers >40% of revenue | Y | Walmart (~31%) + Amazon (~18%) already sum to ~49%, before any third customer is added [FY25 10-K, Item 1A] |
| One geography >50% of revenue | Y | North America ~98.0% of net sales, FY2025 [FY25 10-K, Note 15] |
| One customer or geography >30% with no long-term contract disclosed | Y | Walmart at ~31% of net sales is on an "at-will" relationship with "no recurring or minimum purchase amounts" and no "firm, long- or short-term volume purchase commitments" — explicitly disclosed by the company [FY25 10-K, Item 1A] |

## 4. Read

SMPL is concentrated on both axes, and the two concentrations compound rather than offset. On the customer side, two retailers — Walmart (~31%) and Amazon (~18%) — take roughly half of consolidated net sales, and the company explicitly discloses these are at-will relationships with no minimum purchase commitments, not contractually secured volume [FY25 10-K, Item 1A]. On the geography side, ~98% of net sales are North America (effectively U.S.), a share that has been rising, not diversifying, as new brands (OWYN) have been added domestically rather than internationally [FY25 10-K, Note 15]. The single biggest dependency for the synthesizer: Walmart alone is nearly a third of revenue with a purchasing relationship the company itself says carries no recurring or minimum-purchase guarantee, and Walmart has already begun cutting Atkins shelf space during FY2025 [FY25 10-K, Item 1A].



---

## business-model / 06_value-chain.md

_Source: `06_value-chain.md`_

# Value Chain Position — SMPL

## 1. Stages Occupied

| Value Chain Stage | Company Role (1 sentence) | Bargaining Power vs Upstream | Bargaining Power vs Downstream | Evidence |
|---|---|---|---|---|
| Raw material / ingredient & packaging sourcing | SMPL (directly, or via framework contracts its contract manufacturers execute) sources core ingredients — cocoa, dairy, proteins, soy, nuts, pea/pumpkin protein — and packaging, but grows or processes none of it itself; for certain ingredients (and for selected OWYN products) it buys directly and owns the input before it reaches the co-manufacturer [Annual Report on Form 10-K_2025, Item 1, p.11]. | **Weak** | N/A — feeds the manufacturing stage below | "We rely on a limited number and in certain cases single third-party suppliers to provide our core ingredients" [Annual Report on Form 10-K_2025, Item 1A, p.22]; "We do not use hedges for availability of any core ingredients or packaging" [Annual Report on Form 10-K_2025, Item 1A, p.22]; some ingredient contracts carry minimum-volume purchase commitments regardless of sell-through [Annual Report on Form 10-K_2025, Item 1A, p.22]. |
| Manufacturer / processor (100% outsourced, asset-light) | SMPL owns the formulation, food-safety specs and IP but contracts a "limited number" of third-party co-manufacturers to actually make the product, paying an agreed tolling charge per unit on top of ingredient/packaging cost [Annual Report on Form 10-K_2025, Item 1, p.11; Item 7, p.40]. | **Mid** | N/A — feeds the brand/sales stage below | "We rely on few contract manufacturers for most of our manufacturing needs" [Annual Report on Form 10-K_2025, Item 1A, risk-factor heading, p.24]; company can "qualify alternate suppliers as needed" and describes "a diversified pool of contract manufacturers" [Annual Report on Form 10-K_2025, Item 1, p.9, p.11] — some substitutability, but concentrated enough to be flagged as its own named risk factor. |
| End-customer-facing brand, sold wholesale into retail | SMPL owns the Quest, Atkins and OWYN brands, does the product development and marketing, and sells the finished packaged goods directly to large retailers (mass, club, grocery, drug, convenience, e-commerce), who resell to the end consumer [Business Identity output, §1; Annual Report on Form 10-K_2025, Item 1, p.10]. | N/A — already covered above | **Weak** | Walmart ≈31% and Amazon ≈18% of FY2025 consolidated net sales, no other retailer above 10% [Annual Report on Form 10-K_2025, Item 1, p.10]; SMPL "maintain[s] 'at will' contracts with these retailers, which do not require recurring or minimum purchase amounts" [Annual Report on Form 10-K_2025, Item 1, p.10; Item 1A, p.24]; "increasingly powerful retailers continue to demand lower pricing," and "during fiscal year 2025, Walmart reduced the number of Atkins products it carries in its stores" [Annual Report on Form 10-K_2025, Item 1A, p.24]. |

Bargaining power bands:
- **Strong:** Company sets price, dictates terms, has alternatives
- **Mid:** Negotiated outcomes, no extreme leverage either way
- **Weak:** Price-taker, terms imposed, few alternatives

## 2. Input Cost Pass-Through

Pass-through is slow and incomplete, not contractual. FY2025 gross margin fell 220 basis points to 36.2% of net sales (from 38.4% in FY2024) "primarily driven by unfavorable commodity expenses" [Annual Report on Form 10-K_2025, Item 7, p.41]. It kept falling in FQ3 FY2026: gross margin dropped 390 basis points year-over-year to 32.5%, and even stripping out one-time restructuring costs it was still down 210 basis points despite the company's own productivity initiatives [Q3 FY2026 Earnings Call, Jul 09, 2026, prepared remarks]. Management only decided to act on price roughly a year into this margin erosion, announcing a "high single-digit price increase across most of our portfolio" effective September 2026 "to offset inflation we are experiencing across proteins, packaging, and other key cost inputs" [Q3 FY2026 Earnings Call, Jul 09, 2026, prepared remarks] — there is no evidence in the 10-K or transcripts of an automatic, contractual cost-escalator or indexed-pricing clause with either suppliers or retailers; price increases are negotiated list-price actions taken after the fact, not built-in pass-throughs. The company explicitly states "we do not use hedges for availability of any core ingredients or packaging" [Annual Report on Form 10-K_2025, Item 1A, p.22], and certain ingredient contracts carry minimum-volume purchase commitments that force SMPL to keep buying even in weak sales periods [Annual Report on Form 10-K_2025, Item 1A, p.22] — a one-way commitment that adds to cost risk without adding pricing protection.

**Supplier / input concentration (quantify).** The 10-K does not disclose a percentage of cost of goods sold (COGS) or purchases tied to any single supplier or contract manufacturer — that figure is **not proven from available data**, and the CIQ "Suppliers" export in the data pool lists only lending-bank relationships (Barclays, BMO, Goldman Sachs, SunTrust as creditors), not a single named ingredient or packaging vendor, so it adds nothing to this question [The Simply Good Foods Company NasdaqCM SMPL Suppliers.xls, Suppliers tab]. What is disclosed and material: the company names nuts, protein and fiber as core ingredients for which it relies on "a limited number and in certain cases single third-party suppliers," a portion of which are international [Annual Report on Form 10-K_2025, Item 1A, p.22-23], and separately flags reliance on "few contract manufacturers for most of our manufacturing needs" as its own named risk factor [Annual Report on Form 10-K_2025, Item 1A, p.24]. A single-source dependency on an unquantified but named core-ingredient category, combined with zero commodity hedging, is a material supply-side risk in its own right and is carried into §5 below.

## 3. Customer Pricing Power

SMPL cannot yet show it can raise prices without losing volume — the evidence points the other way. The company is layering a high-single-digit list-price increase (effective September 2026) onto a business that already posted a 6.3% net-sales decline and a 6.7% retail-takeaway decline in FQ3 FY2026 [Q3 FY2026 Earnings Call, Jul 09, 2026, prepared remarks], and management's own forward guidance assumes the increase will not be volume-neutral: "we would expect, as we look at fiscal '27, elasticities to be at 1 or higher. So there's going to be a volume impact to our business" [Q3 FY2026 Earnings Call, Jul 09, 2026, Q&A]. An elasticity of 1 or higher means a given percentage price increase is expected to produce an equal-or-larger percentage volume decline — the textbook signature of a price-taker, not a price-setter. Guidance was cut alongside this: FY2026 net sales are now guided to decline 6-7% and adjusted EBITDA to $220-225 million, down from prior expectations [Q3 FY2026 Earnings Call, Jul 09, 2026, prepared remarks]. On the retailer side, Walmart already reduced Atkins shelf space in FY2025 in response to weak performance, not in response to a price increase [Annual Report on Form 10-K_2025, Item 1A, p.24] — a reminder that the retailer, not SMPL, decides distribution.

## 4. Economic Control Verdict

**Squeezed.** SMPL is a price-taker on inputs — single-source dependency on named core ingredients, no commodity hedging, minimum-volume purchase commitments, and roughly a year of margin erosion (220bps in FY2025, then a further 390bps/210bps-ex-restructuring in FQ3 FY2026) before it acted on price [Annual Report on Form 10-K_2025, Item 7, p.41; Item 1A, p.22; Q3 FY2026 Earnings Call, Jul 09, 2026]. It is also a price-taker on the output side — two retailers took ~49% of FY2025 net sales under "at will" contracts with no minimum-purchase commitment, retailers are described in SMPL's own risk factors as "increasingly powerful" and demanding "lower pricing," and management is now taking a price increase it expects to trigger a roughly matching or larger volume decline [Annual Report on Form 10-K_2025, Item 1, p.10; Item 1A, p.24; Q3 FY2026 Earnings Call, Jul 09, 2026]. The one relatively less-weak link is the contract-manufacturer relationship (Mid — some substitutability via a "diversified pool" of manufacturers), but that is not enough to offset weak power at both the ingredient-sourcing and retail-customer ends.

## 5. The Single Biggest Bargaining Risk

The Walmart relationship: ~31% of FY2025 consolidated net sales on an "at will" contract with no minimum-purchase commitment, and Walmart already cut Atkins shelf space once in FY2025 — a further reduction (at Walmart or, secondarily, at Amazon, which took ~18%) would hurt SMPL more than any single ingredient-supply disruption, since most core ingredients are described as available from "several suppliers" while only a subset are single-sourced [Annual Report on Form 10-K_2025, Item 1, p.10-11; Item 1A, p.24].



---

## business-model / 07_business-quality.md

_Source: `07_business-quality.md`_

# Business Quality — SMPL

Upstream inputs used: `02_business-identity.md`, `03_segment-map.md`, `05_customer-geography.md` — all present. No upstream gap to flag.

**Sector overlay (step 2b):** `02_business-identity.md` classifies SMPL as a "Branded, asset-light consumer-packaged-food company" and explicitly finds the closest `SECTOR_OVERLAYS.md` row ("Retail / consumer") does not fit — that row's KPI grammar (same-store sales, sales per square foot, store count) is built for companies that operate physical stores, and SMPL owns none; it sells brands *into* other companies' stores. **No sector overlay for "branded asset-light CPG snacking company" — generic 11-factor scoring applies**, consistent with the identity report's own conclusion. The generic factors below are still informed by CPG-specific evidence (commodity input costs, retailer trade terms, private-label competition) rather than a mechanical template.

## 1. Quality Factor Table

| Quality Factor | Score /100 | Evidence | Comment |
|---|---:|---|---|
| Pricing power *(higher = better)* | 40 | Company just announced a "high single-digit price increase across most of our portfolio" effective September 2026 to offset protein/packaging/freight inflation [Q3 FY26 Earnings Call, Jul 09 2026, prepared remarks]; but the 10-K itself warns "if our competitors maintain or lower their prices while we raise prices, we may lose customers or the purchase frequency of our products may slow" [FY25 10-K, Item 1A, p.~1153]; realized outcome: gross margin still fell from 38.4% (FY24) to 36.2% (FY25) and to 33.3% on a TTM basis despite pricing actions [FY25 10-K, Item 7, p.41; CIQ Financials_Annual export, Income Statement tab] | Company can raise list price, but cost pass-through has been incomplete for two straight years — pricing is defensive (chasing input cost), not a source of expanding margin |
| Repeat / recurring revenue *(higher = better)* | 58 | No contractual recurring revenue (retailers buy at-will, no minimum purchase commitments) [FY25 10-K, Item 1A]; but the underlying product is a habitual-use consumable and management tracks household-penetration as the core repeat-purchase KPI: Quest penetration +120bps YoY to 20.5%, OWYN flat at 4.3%, Atkins −220bps to 8.5% [Q3 FY26 Earnings Call, Jul 09 2026, prepared remarks] | Repeat purchase is real at the Quest brand but is actively eroding at Atkins — recurring revenue quality is brand-specific, not portfolio-wide |
| Customer stickiness *(higher = better)* | 32 | SMPL's actual customers are retailers, not end consumers, and the company discloses these are "at-will" relationships with "no recurring or minimum purchase amounts" and retailers "rarely provide us with firm, long- or short-term volume purchase commitments" [FY25 10-K, Item 1A]; this is not theoretical — Walmart (~31% of FY25 net sales) already cut the number of Atkins products it carries during FY2025 [FY25 10-K, Item 1A; `05_customer-geography.md` §1] | Walmart + Amazon at ~49% of net sales with zero contractual purchase floor is the single weakest link in the whole business model |
| Margin stability *(higher = better)* | 30 | Gross margin has fallen almost every year for five straight years: 40.7% (FY21) → 38.1% (FY22) → 36.5% (FY23) → 38.7% (FY24) → 36.2% (FY25) → 33.3% (TTM, 39 weeks to May 30 2026) [CIQ Financials_Annual export, Income Statement tab; FY25 10-K, Item 7, p.41 confirms FY25 at 36.2%, down 220bps YoY]; company attributes the decline to "unfavorable commodity expenses" and "lower gross profit margins of the OWYN business" [FY25 10-K, Item 7, p.41] | An ~800bps structural gross-margin decline over five years, worsening in the latest nine months, is the clearest single red flag in this table |
| Capital intensity *(low intensity = high score)* | 85 | Asset-light model — SMPL owns no manufacturing; it contracts with third-party contract manufacturers for all production [FY25 10-K, Item 1, p.10]; capex was $20.5M on $1,450.9M revenue in FY25 (1.4% of sales) and $28.1M on $1,392.2M TTM revenue (2.0% of sales) [CIQ Financials_Annual export, Cash Flow tab] | Genuinely low capital intensity — the business converts revenue to cash without needing plant and equipment, this is the strongest factor in the table |
| Competitive intensity *(low intensity = high score)* | 30 | 10-K states plainly: "the nutritional snacking industry is fragmented and highly competitive," names "a number of diverse competitors of varying sizes and capabilities, including developers, marketers and sellers of other branded and private label" products, and states some competitors "have resources substantially greater than we have" [FY25 10-K, Item 1, "Competition", p.~712-733]; company expects the industry "to remain highly competitive for the foreseeable future" [FY25 10-K, Item 1] | Not a moat-protected niche — SMPL competes against larger CPG players and private label in an explicitly fragmented category |
| Industry rate-of-change / disruption risk *(low rate-of-change = high score)* | 45 | Packaged/branded snacking itself is a slow-moving category, but SMPL's specific sub-category (protein/low-carb/weight-management) is being reshaped by GLP-1 weight-loss drugs; management has "just completed a thorough assessment of GLP-1 therapies and their impact on consumption behaviors" and frames Atkins as needing to "play a meaningful role in a GLP-1 world," while acknowledging the "former management team" misjudged the trend [Q3 FY26 Earnings Call, Jul 09 2026, CEO remarks] | Sits above the ≤40 Filter-5 trigger — the branded-CPG category itself is not fast-changing, but the specific weight-management niche SMPL depends on (via Atkins, ~29% of FY25 revenue) is undergoing real, still-unresolved behavioral disruption; this is a genuine monitoring item, not yet a disqualifying one |
| Regulatory dependence *(low dependence = high score)* | 75 | Standard US food-industry regulatory framework — FDA (manufacturing, labeling, composition), FTC (advertising accuracy), EPA, OSHA [FY25 10-K, Item 1, "Regulation and Compliance", p.~825-847]; no drug-style approval gate on any SMPL product, and no near-term regulatory catalyst or threat disclosed | Regulation is a compliance cost, not an existential gate — this is a normal food-company regulatory footprint |
| Commodity dependence *(low dependence = high score)* | 30 | Cost of goods is directly tied to cocoa, dairy, protein (whey/soy), and packaging input costs; FY25 gross-margin decline is explicitly attributed to "unfavorable commodity expenses compared to the prior year" [FY25 10-K, Item 7, p.41]; the September 2026 price increase exists specifically "to offset input inflation" across "proteins, packaging, and other key cost inputs" [Q3 FY26 Earnings Call, Jul 09 2026, CFO remarks] | Margin outcomes are largely a function of commodity cost cycles the company does not control and can only partially pass through |
| Cyclicality *(low cyclicality = high score)* | 65 | Revenue grew every fiscal year from FY2017 ($396.2M) through FY2025 ($1,450.9M) with no down year in the CIQ annual series, including through the 2020 and 2022 macro shocks [CIQ Financials_Annual export, Income Statement tab]; the current TTM revenue decline to $1,392.2M is attributed by management to brand-specific distribution losses at Atkins, not a broad consumer-spending downturn [FY25 10-K, Item 7, p.38-40; Q3 FY26 Earnings Call] | Packaged food/snacking has historically been a defensive, low-macro-cyclicality category for this company; the current decline reads as company-specific (Atkins), not macro-cyclical — but it is a real decline and should not be waved away as "just noise" |
| Disclosure quality *(higher = better)* | 55 | Company discloses brand-level revenue, customer concentration percentages, and household-penetration KPIs [FY25 10-K, Note 15; Q3 FY26 Earnings Call]; but it aggregates three internally-run operating segments (Quest, Atkins, OWYN) into one GAAP reportable segment and discloses zero brand-level profit, EBITDA, or asset data even though the brands are financially dissimilar (Atkins carried a $60.9M intangible impairment in FY25; OWYN explicitly runs lower gross margins) [`03_segment-map.md` §1, §3; FY25 10-K, Note 9, Note 15, MD&A p.39] | Revenue-side disclosure is good; profitability-side disclosure has a real, filing-permitted gap that limits any brand-level margin or ROIC work |

## 2. Aggregate Quality Score

**Aggregate: 40/100 (Weak).**

**Band anchor check:** the three lowest rows — margin stability (30), competitive intensity (30), and commodity dependence (30) — set a second-lowest score of 30, so the aggregate may not exceed 50. The 40 assigned here sits inside that ceiling.

**Weights used:** margin stability 18%, competitive intensity 15%, commodity dependence 15%, customer stickiness 15%, pricing power 10%, industry rate-of-change 8%, cyclicality 7%, disclosure quality 5%, recurring revenue 4%, capital intensity 2%, regulatory dependence 1%. These weights front-load the factors that are both weak AND currently live in the numbers (margin stability, competitive intensity, commodity dependence, retailer stickiness) — they are not abstract risks, they are the direct explanation for the ~800bps gross-margin decline and the Atkins revenue collapse already in the filings. Capital intensity and regulatory dependence are scored high but weighted low because an asset-light contract-manufacturing model is table stakes for this business type, not a differentiator that offsets weak pricing power or a fragmented competitive set. The weighted calculation lands at ~39; 40 is used as a round, defensible aggregate inside the anchor band.

## 3. Strongest Factor & Weakest Factor

| | Factor | Score | Why |
|---|---|---:|---|
| Strongest | Capital intensity | 85 | Genuinely asset-light — no owned manufacturing, capex is only 1.4–2.0% of revenue [FY25 10-K, Item 1, p.10; CIQ Financials_Annual export, Cash Flow tab] |
| Weakest | Competitive intensity | 30 | The 10-K itself calls the category "fragmented and highly competitive," names larger-resourced competitors and private label as direct rivals, and states the industry will "remain highly competitive for the foreseeable future" [FY25 10-K, Item 1, "Competition"] — this is the structural root of the weak pricing power and margin instability scores above it |

## 4. Read

SMPL is a branded, asset-light CPG snacking company, not a durable compounder in its current state: it converts revenue to cash with very little capital (capex ~1.4-2.0% of sales), but it competes in a fragmented, explicitly "highly competitive" category against larger rivals and private label, and it has let ~800bps of gross margin erode over five years (40.7% FY21 → 33.3% TTM) as commodity input costs (cocoa, dairy, protein, packaging) outran its pricing actions [CIQ Financials_Annual export, Income Statement tab; FY25 10-K, Item 7]. The current TTM margin run-rate (Adjusted EBITDA ~15.6% TTM vs 18.1% FY25 and ~18-19% in FY21-24) is a multi-year trough, not a cyclical peak the reader should discount — so the low margin-stability score here is not masking an inflated headline number, it is describing a real, still-unfolding decline that the September 2026 price increase is explicitly designed to arrest but has not yet proven it can. The single quality factor a buyer should watch over the next 24 months is margin stability / gross margin trajectory (currently 33.3% TTM, down from 41% in FY17): whether the September 2026 price increase restores gross margin toward the historical 38-40% band, or whether competitive and retailer-power dynamics (Walmart at ~31% of sales, at-will, no minimum-purchase commitment, already cutting Atkins shelf space) force the increase to be given back in trade spend. The industry rate-of-change row scored 45, above the ≤40 Filter-5 trigger, so this is not flagged as a sector/technology-cycle bet — but the GLP-1-driven reshaping of the weight-management category (Atkins, ~29% of FY25 revenue) is real, unresolved, and worth tracking as a secondary risk alongside margin stability.



---

## business-model / 08_competitive-map.md

_Source: `08_competitive-map.md`_

# Competitive Map — SMPL

## 1. Dominant Segment

Quest is the dominant brand/segment by revenue — 59.5% of FY2025 net sales, rising to 63.7% of net sales in the nine months ended May 30, 2026 as Atkins keeps shrinking [FY25 10-K, Note 15; FQ3 FY26 10-Q, Note 12]. Quest sells protein bars, protein chips, cookies, confections and RTD (ready-to-drink) protein shakes.

## 2. Named Competitors

The FY25 10-K's own "Competition" risk factor never names a single competitor by name — it describes "a number of diverse competitors of varying sizes and capabilities" in a "fragmented and highly competitive" nutritional-snacking industry [FY25 10-K, Item 1, p.11]. The three names below come from (a) Capital IQ's own comparable-company screen for SMPL (a peer-selection tool, not a competitor list, but the closest product match on it is informative) and (b) reputable but unaudited web industry-research sources, dated and labelled unverified per source-hierarchy rules. This is a real disclosure gap, flagged again in Section 5.

### Competitor A — BellRing Brands, Inc. (Premier Protein / Dymatize)

- **Ticker / listing:** NYSE: BRBR
- **Where they compete:** RTD protein shakes (Premier Protein) and protein powders/bars (Dymatize), sold through the same club, mass, drug and e-commerce retail channels SMPL uses — direct overlap with Quest's RTD-shake and bar lines and with Atkins'/OWYN's RTD shakes.
- **Scale:** LTM total revenue $2,331.7m vs. SMPL's LTM total revenue $1,392.2m (BellRing is ~1.7x SMPL's size) [Company Comparable Analysis — The Simply Good Foods Company.xls, Financial Data tab, as-of 2026-07-24]. LTM revenue grew +6.4% y/y vs. SMPL's LTM revenue decline of -4.5% over the same comparison window [same workbook, Operating Statistics tab].
- **Profitability / return on capital:** LTM EBITDA margin 13.4%, LTM EBIT margin 12.5%, LTM net income margin 6.8% [Company Comparable Analysis — The Simply Good Foods Company.xls, Operating Statistics tab, as-of 2026-07-24] — vs. SMPL's own LTM EBITDA margin 15.6%, EBIT margin 13.9%, and net margin -14.3% (SMPL's net margin is negative mainly on the FY26 non-cash Atkins/OWYN intangible impairment, per business-identity upstream; on EBITDA/EBIT margin, SMPL currently runs slightly ahead of BellRing). Return on invested capital (ROIC): ~33.8% as of the most recent reported period, down from a 5-year average of ~46.6% [Web: roic.ai / MacroTrends BRBR return-on-capital pages, accessed 2026-08 — vendor-calculated estimate, unverified, not a filed figure]. Company-reported FY2025 (ended Sep-2025) figures: revenue ~$2.3bn, gross margin 33.3%, GAAP operating margin ~11% [Web: BellRing Brands FY2025 Q4/full-year results press release, bellring.com, reported late 2025 — company-issued but not cross-checked against the 10-K in this pool].
- **Source named in:** Capital IQ's comparable-company screen for SMPL lists BellRing among the 10-company comp set [Company Comparable Analysis — The Simply Good Foods Company.xls, Business Description tab]; separately named as the RTD-shake category leader in third-party protein-bar-market industry research [Web: multiple market-research aggregators, accessed 2026-08, unverified].
- **One-line read:** BellRing runs a narrower, two-brand, RTD-shake-and-powder-led portfolio at greater scale and faster recent growth than SMPL, with EBITDA/EBIT margins currently a few points below SMPL's but a much higher disclosed return on invested capital.

### Competitor B — Glanbia plc (Optimum Nutrition, Performance Nutrition segment)

- **Ticker / listing:** Euronext Dublin / LSE: GL9 (Glanbia plc); Optimum Nutrition is a brand inside Glanbia's Performance Nutrition segment, not a separate listing.
- **Where they compete:** Global leader in protein powders, with Optimum Nutrition expanding into protein/lifestyle bars — a direct product-line overlap with Quest's bar and powder business, positioned more toward performance/sports nutrition than SMPL's mainstream-retail positioning.
- **Scale:** Performance Nutrition segment EBITDA was $233.8m at a 13.0% EBITDA margin in FY2025 [Web: Glanbia plc Full Year 2025 Results, glanbia.com, published 2026 — company-issued release, not a filing in this data pool]. Dividing EBITDA by the margin implies segment revenue of roughly $1.8bn (Inference, not from filings: $233.8m ÷ 13.0%) — a scale within ~1.3x of SMPL's $1.39bn LTM revenue, i.e. broadly comparable.
- **Profitability / return on capital:** Performance Nutrition segment EBITDA margin 13.0% in FY2025, down 380 basis points (a basis point is one-hundredth of a percentage point) y/y "driven by record inflation in whey input costs" [Web: Glanbia plc Full Year 2025 Results, glanbia.com, published 2026 — unverified vs. this pool, dated]. No segment-level EBIT margin, net margin or ROIC/ROCE figure was found in the sources reviewed for this report — treated as **not disclosed at the segment level** in the sources available here.
- **Source named in:** Not named in SMPL's own filings or transcripts; identified via reputable industry web coverage describing Glanbia/Optimum Nutrition as "a significant rival... directly challenging Simply Good Foods" in performance nutrition [Web: industry market-research summary, accessed 2026-08, unverified].
- **One-line read:** Optimum Nutrition is the protein-powder category leader expanding into the bar segment Quest depends on for growth, and it is absorbing materially larger margin compression from whey-input inflation than SMPL has disclosed for its own cost base.

### Competitor C — Kellanova (RXBAR)

- **Ticker / listing:** NYSE: K
- **Where they compete:** RXBAR occupies the "clean-label"/whole-food protein-bar niche adjacent to Quest's bar business, sold through similar mass/grocery/e-commerce channels.
- **Scale:** Kellanova's total company net sales were $9.55bn for the first nine months of 2025 (implying roughly $12–13bn annualized) [Web: Kellanova Q3 2025 results release, prnewswire.com, published Oct-2025 — unverified vs. this pool, dated] — roughly 9x SMPL's scale at the parent level. RXBAR itself is a single brand inside a much larger, mostly unrelated cereal/snacks portfolio; Kellanova does not break out RXBAR's own revenue. This fails the "comparable scale" criterion at the parent level and is included as a named, smaller, segment-specific rival brand rather than a scale peer.
- **Profitability / return on capital:** RXBAR-specific margin is **not public / not disclosed** — Kellanova reports no brand-level P&L for RXBAR. Kellanova's company-wide operating margin was approximately 10.2% as of mid-2025 [Web: Kellanova company financials, macrotrends.net, accessed 2026-08 — vendor-calculated, unverified], but this blends RXBAR with cereal, crackers and other unrelated snack lines and should not be read as RXBAR's own economics.
- **Source named in:** Named as a top protein/wellness-bar brand (with an estimated ~9.7% share of the protein-bar category) in third-party market-research coverage [Web: protein-bar market-share aggregator report, accessed 2026-08, unverified — single-source estimate, not corroborated elsewhere in this pool].
- **One-line read:** RXBAR is a real bar-aisle competitor for Quest, but the size mismatch with its parent and the total absence of brand-level disclosure mean it cannot anchor a clean margin or return-on-capital comparison the way BellRing or Glanbia's segment can.

## 3. Competitive Position

**Losing relative share within the dominant segment.** Management's own Q3 FY2026 remarks state the "purposeful nutrition category grew 10%" during the quarter while SMPL's consolidated "retail takeaway declined 6.7%" over the same 13 weeks [Q3 FY26 earnings call, Jul 9, 2026, CEO prepared remarks] — a 16.7-point gap between category growth and SMPL's own point-of-sale trend. Even Quest, the dominant and best-performing brand, grew retail takeaway only 1.4% in the quarter (decelerating from 2.4% the prior quarter) against that 10%-growing category [same source] — meaning the brand that management calls its "most important growth engine" is not keeping pace with the category it competes in, even though Quest's household penetration still rose 120 basis points year-over-year to 20.5% [Q3 FY26 earnings call, Jul 9, 2026]. As a scale proxy against the single most direct named peer: SMPL's LTM total revenue fell -4.5% while BellRing Brands' LTM total revenue rose +6.4% over the comparable period [Company Comparable Analysis — The Simply Good Foods Company.xls, Operating Statistics tab, as-of 2026-07-24]. No company- or brand-level market-share percentage is disclosed by SMPL itself; the reads above are proxies (retail takeaway vs. category growth, and revenue growth vs. a named peer), not an audited share figure.

## 4. Competitive Shape

Fragmented, with a moderately concentrated branded top tier. SMPL's own 10-K calls the "nutritional snacking industry ... fragmented and highly competitive" with "a number of diverse competitors of varying sizes," including branded and private-label players [FY25 10-K, Item 1, p.11]. Within the narrower protein-bar sub-category specifically, one industry market-share estimate puts the top seven branded players — Quest (21.8%), Clif Bar (18.5%), Barebells (12.1%), RXBAR (9.7%), ALOHA (8.3%), Pure Protein (7.1%) and Atkins (6.5%) — at a combined ~84% share [Web: protein-bar market-share aggregator report, accessed 2026-08, unverified, single-source estimate]. That combination — a fragmented broader "nutritional snacking" category per the company's own filing, sitting alongside a top-heavy branded sub-category per third-party research — reads as an oligopoly-leaning branded tier (roughly 6–7 firms controlling the large majority of the specific protein-bar niche) inside a much larger, genuinely fragmented adjacent category (general snack foods, private label, and smaller regional brands) that the 10-K describes but does not quantify.

## 5. Caveat

SMPL's own filings and earnings-call transcripts never name a specific competitor — the 10-K's "Competition" risk factor and the two earnings-call transcripts reviewed (Q2 and Q3 FY2026) use only generic language ("diverse competitors," "principal competitive factors") with no company names, no market-share disclosure, and no peer financial comparison. Every named competitor in Section 2 was therefore sourced from (a) Capital IQ's automated comparable-company screen for SMPL, which is a peer-selection tool built for valuation multiples, not a competitor list, and (b) web-based industry market-research aggregators that are dated and explicitly unverified per the source hierarchy — none of these figures come from an audited filing of the named competitor. The Glanbia Performance Nutrition segment revenue figure used here is an inference (EBITDA divided by disclosed margin), not a directly reported number. The protein-bar category market-share percentages (21.8% / 18.5% / 12.1% / etc.) come from a single market-research aggregator not cross-checked against a second source and should be treated as directional only. Resolving this would require either a sell-side industry note that names SMPL's competitors explicitly with sourced share data, or SMPL management naming specific competitors in a future transcript (analysts have not asked this directly in the two transcripts reviewed).



---

## business-model / 09_moat.md

_Source: `09_moat.md`_

# Moat — SMPL

No `ciq_facts.json` sidecar exists in this run's `_pool_extracts/` (confirmed absent), so all figures below are cited directly from the CIQ workbook exports and the FY2025 10-K, not from a facts sidecar.

## 1. Named Competitors

(Inherited from `08_competitive-map.md`. SMPL's own 10-K names no competitor by name — these three come from Capital IQ's comparable-company screen and dated, unverified web industry research, flagged as a disclosure gap there and carried forward here.)

- **Competitor A — BellRing Brands, Inc. (NYSE: BRBR)** — Premier Protein (RTD shakes) and Dymatize (powders/bars); direct overlap with Quest's RTD-shake and bar lines. ~1.7x SMPL's LTM revenue and growing (+6.4% y/y vs. SMPL's -4.5%) [Company Comparable Analysis — The Simply Good Foods Company.xls, Operating Statistics tab, as-of 2026-07-24].
- **Competitor B — Glanbia plc (Euronext Dublin/LSE: GL9), Optimum Nutrition** — global protein-powder category leader expanding into bars, a direct overlap with Quest; Performance Nutrition segment revenue ~$1.8bn (inferred: EBITDA ÷ margin), broadly comparable in scale to SMPL [Web: Glanbia plc FY2025 Results, glanbia.com, published 2026 — unverified vs. this pool].
- **Competitor C — Kellanova (NYSE: K), RXBAR** — clean-label bar brand adjacent to Quest's bar aisle; parent company is ~9x SMPL's scale and discloses no brand-level RXBAR financials [Web: Kellanova Q3 2025 results release, prnewswire.com, Oct-2025 — unverified vs. this pool].

## 2. Moat Sources

| Possible Moat | Present? (Y/N) | Evidence | Strength /100 |
|---|---|---|---:|
| Brand | Y (weak) | Household penetration is real and disclosed — Quest 20.5% (+120bps y/y), Atkins 8.5% (-220bps y/y), OWYN 4.3% (flat) [Q3 FY26 Earnings Call, Jul 09 2026, prepared remarks] — but the 10-K itself warns "if our competitors maintain or lower their prices while we raise prices, we may lose customers" [FY25 10-K, Item 1A], and management's own FY2027 planning assumes price elasticity "at 1 or higher" on the Sept-2026 price increase, i.e. an equal-or-larger expected volume loss for a given price rise — the signature of a price-taker, not a price-setter [Q3 FY26 Earnings Call, Jul 09 2026, Q&A; `06_value-chain.md` §3]. Gross margin fell from 40.7% (FY21) to 33.3% (TTM) despite the brand [CIQ Financials_Annual export, Ratios tab] | 30 |
| Cost advantage | N | Asset-light contract manufacturing is industry-standard, not proprietary to SMPL [FY25 10-K, Item 1, p.10]; the company is a demonstrated price-taker on inputs — single-source dependency on named core ingredients, zero commodity hedging, and one-way minimum-volume purchase commitments to suppliers [FY25 10-K, Item 1A, p.22; `06_value-chain.md` §1-2] — this is a cost *disadvantage*, not an advantage | 10 |
| Distribution | N | SMPL sells through the same mass/club/grocery/drug/e-commerce channels as every named competitor, with no proprietary distribution network; retailers hold the power, not SMPL — "at will" contracts with no minimum-purchase commitment, and Walmart (~31% of FY25 net sales) already cut the number of Atkins products it carries [FY25 10-K, Item 1, p.10; Item 1A, p.24] | 15 |
| Scale | N (vs. named competitors) | SMPL's LTM revenue ($1,392.2m) is smaller than BellRing's ($2,331.7m, ~1.7x) and Kellanova's parent (~9x), and roughly comparable to Glanbia's Performance Nutrition segment (~$1.8bn inferred) [Company Comparable Analysis workbook, Financial Data tab, as-of 2026-07-24; competitive-map §2]; the 10-K itself states some competitors "have resources substantially greater than we have" [FY25 10-K, Item 1, "Competition"] — SMPL is mid-pack, not a scale leader, against this specific peer set | 20 |
| Technology / IP | N (weak) | SMPL owns "numerous domestic and international trademarks and other proprietary rights" and states it "aggressively protect[s]" them via trademark, copyright, patent and trade-secret law [FY25 10-K, Item 1, "Intellectual Property", p.~697-702], but the same filing's own risk factor states the company "may not be able to adequately protect our material intellectual property" [FY25 10-K, Item 1A, p.~1648] — trademarks exist (protecting the brand names, not a technological or formulation edge), but no patent, proprietary process, or unique technology is disclosed as conferring a cost or quality advantage over named peers | 20 |
| Licenses / regulation | N | Standard FDA (manufacturing, labeling), FTC (advertising), EPA, OSHA framework applies equally to all branded-snack competitors — no licensing gate, quota, or exclusive permit keeps rivals out [FY25 10-K, Item 1, "Regulation and Compliance"; `07_business-quality.md` regulatory-dependence row, scored 75/100 for *low dependence*, which means low regulatory risk, not a barrier to entry] | 10 |
| Network effects | N | Physical packaged-food product sold one unit at a time through retail; no evidence of any effect where the product becomes more valuable as more people use it | 0 |
| Switching costs | N | Negative evidence is explicit: SMPL's own retailer contracts are "at will," with "no recurring or minimum purchase amounts," and retailers "rarely provide us with firm, long- or short-term volume purchase commitments" [FY25 10-K, Item 1A]; Walmart already exercised this and cut Atkins shelf space in FY2025 [FY25 10-K, Item 1A, p.24]. End consumers face essentially no cost to buy a different snack brand off the same shelf | 5 |
| Natural resource access | N | Core inputs (cocoa, dairy, protein/whey, soy, nuts) are bought on the open market from third-party suppliers, with a disclosed reliance on "a limited number and in certain cases single third-party suppliers" for some ingredients — a supply-side vulnerability, not a proprietary resource advantage [FY25 10-K, Item 1A, p.22-23; `06_value-chain.md` §1] | 5 |
| Location advantage | N | Asset-light model; SMPL owns no manufacturing plants or real estate that would confer a location-based cost or logistics edge [FY25 10-K, Item 1, p.10] | 0 |

No source scores above "weak" (≤40) on the CLAUDE.md §12 band. The strongest candidate — Brand — is undercut by the company's own disclosed price elasticity assumption (≥1) and a five-year, ~800bps gross-margin decline that the brand has not been able to arrest. **No clear moat proven from available data on the qualitative sources; the one item worth tracking (brand/household penetration at Quest) has not yet translated into durable pricing power or margin stability.**

## 3. Competitive Economics

| Company / Competitor | Gross Margin | EBIT Margin | Return on capital (ROIC, or ROE for financials) | Period | Source |
|---|---:|---:|---:|---|---|
| SMPL (Simply Good Foods) | 33.3% | 13.9% | Computed: 7.7% (TTM, trough) / 8.8% (FY22-FY25 through-cycle avg); CIQ vendor "Return on Capital %": 6.0% (TTM) / 7.0% (FY22-FY25 avg) | TTM = 39 weeks to May 30, 2026; through-cycle = FY2022-FY2025 | CIQ Financials_Annual export, Income Statement & Ratios tabs (own NOPAT/invested-capital computation, see below); Ratios tab for CIQ's own "Return on Capital %" |
| Competitor A — BellRing Brands (BRBR) | 30.2% | 12.5% | ~33.8% (latest reported), ~46.6% (5-year average) | LTM as-of 2026-07-24 (margins); latest reported / 5-yr avg (ROIC) | Company Comparable Analysis — The Simply Good Foods Company.xls, Operating Statistics tab, as-of 2026-07-24 (margins); Web: roic.ai / MacroTrends BRBR return-on-capital pages, accessed 2026-08 — vendor-calculated estimate, unverified, not a filed figure |
| Competitor B — Glanbia plc, Performance Nutrition segment (Optimum Nutrition) | Not disclosed at segment level | Not disclosed at segment level | Not disclosed | FY2025 | Web: Glanbia plc Full Year 2025 Results, glanbia.com, published 2026 — company-issued release, not in this data pool; segment EBITDA margin only (13.0%, down 380bps y/y) |
| Competitor C — Kellanova (RXBAR) | Not disclosed (brand-level) | Not disclosed (brand-level) | Not disclosed (brand-level) | — | Kellanova reports no brand-level P&L for RXBAR; parent-level operating margin (~10.2%, [Web: macrotrends.net, accessed 2026-08 — vendor-calculated, unverified]) blends RXBAR with unrelated cereal/cracker lines and is not used here as a RXBAR proxy |

**How SMPL's own return on capital was computed.** NOPAT = EBIT × (1 − normalized tax rate). EBIT is already reported net of the FY2025/TTM one-off items (the $60.9m FY25 Atkins intangible impairment and the $391.9m TTM Atkins/OWYN asset writedown both sit below the "Operating Income"/EBIT line in the CIQ income-statement export, in "Unusual Items," so EBIT does not need separate adjustment for them) [CIQ Financials_Annual export, Income Statement tab]. **Normalized tax rate: 25%**, the average of the four most recent non-distorted fiscal years — FY2022 27.9%, FY2023 24.0%, FY2024 25.1%, FY2025 23.8% [CIQ Financials_Annual export, Income Statement tab, "Effective Tax Rate %" row] — excluding FY2021 (49.4%, a clear outlier) and the TTM period (tax line is "NM," a $55.9m tax *benefit* on a negative EBT of -$254.6m distorted entirely by the non-cash writedown, not usable as a structural rate). Invested capital = Total Debt + Total Equity − Cash & Equivalents (strict basis; SMPL carries **net debt**, not net cash, in every period shown — Net Debt was $205.96m at FY25-end and $324.58m at TTM-end [CIQ Financials_Annual export, Balance Sheet tab] — so the net-cash/gross-capital caveat does not apply here). Average invested capital uses the average of the opening and closing balance for each period.

- FY2025: NOPAT = $240.903m EBIT × 0.75 = $180.68m; avg. invested capital = ($2,032.27m + $2,012.79m) / 2 = $2,022.53m; ROIC = **8.9%**.
- FY2024: NOPAT = $171.53m; avg. invested capital = $1,921.14m; ROIC = **8.9%**.
- FY2023: NOPAT = $153.71m; avg. invested capital = $1,817.60m; ROIC = **8.5%**.
- FY2022: NOPAT = $152.14m; avg. invested capital = $1,719.44m; ROIC = **8.9%**.
- **FY2022-FY2025 through-cycle average: 8.8%.**
- TTM (39 weeks to May 30, 2026, labeled **trough**, not peak — consistent with `07_business-quality.md` §4, which independently identifies the current run-rate as "a multi-year trough, not a cyclical peak"): NOPAT = $193.428m × 0.75 = $145.07m; avg. invested capital = ($2,012.79m + $1,742.70m) / 2 = $1,877.75m; ROIC = **7.7%**.

**Cross-check against the vendor figure.** CIQ's own "Return on Capital %" line is materially lower — 7.08% (FY22), 6.76% (FY23), 7.04% (FY24), 7.04% (FY25), 6.03% (TTM) [CIQ Financials_Annual export, Ratios tab] — a FY2022-2025 average of **7.0%** versus this report's computed 8.8%. The likely source of the ~180bp gap is a broader capital base in CIQ's formula (it does not disclose its exact methodology in this export; a base that does not net cash, or that uses total assets rather than debt+equity-cash, would mechanically produce a lower return for the same NOPAT). Per CLAUDE.md's conservative default, **the lower, CIQ vendor figure (7.0% through-cycle / 6.0% TTM) is used as the headline for the economic-moat test below**, with this report's own 8.8%/7.7% computation shown as the cross-check.

**The economic moat test (required).**

> Return on capital **roughly at / marginally above** cost of capital under the most defensible estimate, and **below** it under a more realistic, size-adjusted estimate: **~7.0% ROIC** (CIQ vendor "Return on Capital %," FY2022-FY2025 through-cycle average [CIQ Financials_Annual export, Ratios tab]) vs. **~5.8% WACC** (base CAPM estimate, ~+120bps gap) to **~7.8% WACC** (size-adjusted CAPM estimate, ~-80bps gap) — see basis below. On the TTM/trough reading, ROIC (6.0% CIQ vendor / 7.7% computed) sits **at or below** either WACC estimate.

No company-disclosed WACC, cost of equity, or hurdle rate was found anywhere in this pool — the 10-K's only "discount rate" references are to the unspecified, non-numeric discount rate used in the Atkins intangible-asset impairment test [FY25 10-K, Item 7 (Critical Audit Matter); Note 9], not a stated cost of capital. **Cost of capital is therefore estimated via CAPM — Inference, not from filings:**

- Risk-free rate: 4.6% (10-year US Treasury yield, 2026-08-05) [Web: tradingeconomics.com, accessed 2026-08-06 — dated, unverified].
- Equity risk premium: 5.5% (standard mature-market assumption; not company-specific).
- Beta: SMPL's own 5-year CIQ beta is **0.13** [The Simply Good Foods Company NasdaqCM SMPL Public Company Profile.xls, "Beta 5Y"] — an outlier even against this sector's already-low-beta comp set (peer betas 0.32-0.83 with a mean of 0.48 and median of 0.36 across nine named comps, excluding two near-zero/negative large-cap outliers) [Company Comparable Analysis — The Simply Good Foods Company.xls, Operating Statistics tab, as-of 2026-07-24]. SMPL's own beta is likely depressed by the stock's idiosyncratic 2026 collapse (52-week range $10.12-$33.44, a ~70% peak-to-trough decline concentrated in company-specific news, not broad-market moves) [TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.xls]. Per the CLAUDE.md §4 conservative default, this report uses the **peer-median beta (0.36)** as the primary CAPM input, and shows SMPL's own (lower) beta for transparency.
- Cost of equity: 4.6% + 0.36 × 5.5% = **6.6%** (peer-median beta) vs. 4.6% + 0.13 × 5.5% = **5.3%** (SMPL's own CIQ beta).
- Cost of debt: SOFR (3.65% as of 2026-08-03 [Web: sofrrate.com, accessed 2026-08-06]) + 2.00% Term Loan margin [FY25 10-K, Note 7 (Long-Term Debt), "2025 Repricing Amendment"] = 5.65% pretax; after-tax at the 25% normalized rate = **4.3%**.
- Weights: Market cap $909.4m + Total Debt $448.5m = $1,357.9m total capital; equity weight 67.0%, debt weight 33.0% [TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.xls, "Market Cap," "Total Debt," delayed quote as of 2026-07-23].
- **Base WACC (peer-median beta): 0.670 × 6.6% + 0.330 × 4.3% = ~5.8%.** Using SMPL's own outlier beta instead: ~5.0%.
- **Size-adjusted WACC (conservative cross-check, also inference):** adding a standard 3-point small-cap size premium (consistent with Duff & Phelps/Kroll size-premium practice for a ~$900m market-cap company, not company-disclosed) to the peer-median cost of equity gives 9.6% cost of equity and **~7.8% WACC**.

This is a genuinely marginal result, not a clean pass: the through-cycle ROIC clears only the lower (base, peer-beta) WACC estimate, and fails to clear the size-adjusted estimate that better reflects a $909m market-cap stock's true required return; the TTM/trough ROIC fails both. **This is not the profile of a business earning a return convincingly and durably above its cost of capital.**

## 4. Where The Company Sits

1. **Relative to peers:** Mixed, not a clean top or bottom. On LTM EBITDA/EBIT margin, SMPL (15.6% / 13.9%) sits at or slightly above BellRing (13.4% / 12.5%) and Glanbia's Performance Nutrition segment (13.0% EBITDA-only) [Company Comparable Analysis workbook, Operating Statistics tab; competitive-map §2]. But on revenue growth (-4.5% LTM vs. BellRing's +6.4%), net margin (-14.3% vs. BellRing's +6.8%), and — where disclosed — return on capital (SMPL's ~7-9% vs. BellRing's disclosed ~33.8% latest / ~46.6% 5-yr average, an unverified web figure but the only other ROIC data point in the named-peer set), SMPL sits at the **bottom** of the thin comparable set. A single-quarter margin lead over a peer growing faster and earning several multiples the return on capital is not evidence of superior competitive economics.
2. **Absolute (the economic moat test):** SMPL's through-cycle return on capital (~7.0% CIQ vendor / ~8.8% computed) sits only marginally above a base CAPM cost of capital (~5.8%) and **at or below** a more realistic, size-adjusted cost of capital (~7.8%) for a company of this market capitalization — see §3. The current trough-period return (6.0-7.7%) sits at or below either estimate.

## 5. Moat Verdict

**No moat proven.**

The strongest candidate source — brand (Quest's household penetration and category share) — scores only 30/100 in Section 2 because the company's own disclosures contradict durable pricing power: a five-year, ~800bps gross-margin decline [CIQ Financials_Annual export, Ratios tab; `07_business-quality.md` §1], an explicit "elasticities... at 1 or higher" expectation for the Sept-2026 price increase [Q3 FY26 Earnings Call, Jul 09 2026, Q&A], and a `06_value-chain.md` verdict of "Squeezed" — a price-taker on both the input (single-source, unhedged commodities) and output (at-will retailer contracts, Walmart already cutting Atkins shelf space) sides. Every other candidate source (cost, distribution, scale, IP, licenses, network effects, switching costs, resources, location) scores ≤20/100 with either no supporting evidence or evidence pointing the other way. **Applying the hard rule:** the economic test in §3 does not show return on capital convincingly and durably above cost of capital — it clears only the lower (base-CAPM) WACC estimate and fails the more defensible size-adjusted estimate, and the current trough-period return fails both — so even if the qualitative brand evidence were read generously, the verdict is capped at Narrow at best; combined with the weak Section-2 evidence overall, **No moat proven** is the more conservative and better-supported read. The durability test this would need to pass over five years: gross margin recovering toward the historical 38-40% band (FY17-FY21 range) *after* absorbing the Sept-2026 price increase's expected volume loss, without further retailer shelf-space cuts at Walmart or Amazon (~49% of FY25 net sales combined). Given `07_business-quality.md`'s industry rate-of-change score of 45/100 (above the ≤40 Filter-5 trigger but flagged as a live monitoring item — GLP-1 drugs reshaping the weight-management category Atkins depends on), any residual brand advantage is operating in a category under real, unresolved behavioral disruption, which shortens rather than lengthens the durability window.

**Moat trajectory: eroding.** Gross margin has fallen in four of the last five fiscal years (40.7% FY21 → 33.3% TTM) [CIQ Financials_Annual export, Ratios tab]; CIQ's own return-on-capital metric was roughly flat at ~7.0-7.1% from FY2022-FY2025 and then dropped to 6.0% TTM [CIQ Financials_Annual export, Ratios tab]; and `08_competitive-map.md` §3 documents SMPL losing share within its own dominant segment — consolidated retail takeaway fell 6.7% in FQ3 FY26 while the category grew 10%, a 16.7-point gap, and even Quest (the strongest brand) grew retail takeaway only 1.4%, decelerating from 2.4% the prior quarter, against that same 10%-growing category [Q3 FY26 Earnings Call, Jul 09 2026, CEO prepared remarks]. This eroding trajectory — not yet a critical governance or solvency flag, but a real and current deterioration — is the signal that should feed into any declining-perpetuity or impairment-trigger judgment made downstream in valuation.



---

## business-model / 10_external-dependency.md

_Source: `10_external-dependency.md`_

# External Dependency Check — SMPL

## 1. Dependency Table

| External Variable | Dependency Level (Low / Mid / High) | Why It Matters | Evidence |
|---|---|---|---|
| Commodity prices | High | Core inputs — nuts, protein, fiber, cocoa, dairy — are volatile, and the company explicitly does not hedge them: "We do not use hedges for availability of any core ingredients or packaging." Gross margin fell 220 basis points (a basis point is 1/100th of a percentage point) to 36.2% of net sales in FY2025 from 38.4% in FY2024, driven by "higher commodity expenses." The company's main lever is raising prices, and a high single-digit price increase is planned for September FY2026 to offset input inflation. | FY2025 10-K, p.22 (no hedges); FY2025 10-K, MD&A p.34 (gross margin 220bps decline, "higher commodity expenses"); Q3 FY2026 earnings call, Jul 9 2026, Q&A (Bealer: "input inflation across multiple areas," Sept price increase) |
| Interest rates | Low | Debt is $250 million in variable-rate term-loan borrowings (SOFR-based) as of Aug 30, 2025, with no interest-rate swaps or caps currently in place. A 1% rate rise adds about $2.5 million of annual interest expense — under 0.2% of FY2025 net sales of $1,450.9 million. Small in dollar terms relative to the size of the business. | FY2025 10-K, Item 7A, p.49 (1% rate rise = ~$2.5M interest expense; no derivatives currently used); FY2025 10-K, MD&A p.28 ($1,450.9M net sales) |
| FX | Low | International net sales were approximately 2.0% of total net sales in FY2025, with FX exposure concentrated in Canada and Australia operations. The business is overwhelmingly a US-dollar, North America-facing company. | FY2025 10-K, p.24 (international net sales ~2.0% of total); FY2025 10-K, Item 7A, p.49 (FX risk "primarily related to our operations in Canada and Australia") |
| Freight / logistics rates | Mid | An analyst flagged "a fairly sharp spike in trucking costs here in the U.S." on the Q3 FY2026 call, and the CFO confirmed input inflation is running "across multiple areas of the business." The FY2025 10-K risk factors separately name freight and packaging cost inflation as a driver of past gross-margin pressure. Not broken out as a standalone dollar figure, so it is folded into the broader cost-inflation basket rather than isolated. | Q3 FY2026 earnings call, Jul 9 2026, Q&A (analyst trucking-cost question, CFO confirms broad input inflation); FY2025 10-K, p.23 ("cost inflation in general and as related to tariffs" citing "ingredients, freight and packaging") |
| Government policy | High | The US announced tariffs in 2025 on imports from the EU, Canada, Mexico, and China, which the company says it anticipates "will cause inflationary pressures and higher costs on certain of our ingredients and packaging and imports from the affected countries during fiscal year 2026." The extent, duration, and offsetting actions by trading partners are explicitly stated as outside the company's control, and the company has no tariff hedge — its stated mitigation is price increases and cost-savings initiatives, which may not fully offset the impact. | FY2025 10-K, p.22–23 (tariff risk-factor language, "outside of our control"); FY2025 10-K, MD&A ("Business Trends"), p.39 ("effects of tariffs" cited as an ongoing margin risk for FY2026) |
| Regulation | Mid | FDA approval and growing use of GLP-1 weight-management medications is named as a risk factor that "could negatively affect the demand for many types of food in general and our products," directly touching Atkins' core positioning. Ingredient-level regulation (sweeteners, PFAS, and similar) is also cited as a factor that could force reformulation. Management is treating GLP-1 as a category-shaping force it must adapt marketing to, not something it can change. | FY2025 10-K, p.18–19 (weight-management medication / FDA risk factor); Q3 FY2026 earnings call, Jul 9 2026, prepared remarks ("completed a thorough assessment of GLP-1 therapies," "Atkins can play a meaningful role in a GLP-1 world") |
| Weather | Mid | Core ingredients (nuts, cocoa, dairy inputs) are farmed, and the 10-K names "weather conditions during growing, harvesting or shipping, including flood, drought, frost" as a risk to supplier reliability. Not quantified or isolated from the broader commodity-cost line — it is a contributing cause within commodity volatility rather than a distinct disclosed sensitivity. | FY2025 10-K, p.23 (supplier risk factor lists weather/flood/drought/frost among causes of ingredient supply disruption) |
| Geopolitics | Mid | The 10-K cites "the continuing conflict between Ukraine and Russia" as a geopolitical event that could disrupt suppliers, alongside the broader tariff/trade-policy risk (EU, Canada, Mexico, China) already covered under government policy. Direct operational exposure to conflict zones is not disclosed; the channel is indirect, through global ingredient sourcing and trade-policy response. | FY2025 10-K, p.23 (Ukraine-Russia conflict cited among geopolitical supply risks) |
| Consumer cycle | High | The company operates mainly in North America and calls out its geographic concentration as a vulnerability to "adverse regulations, economic climate, consumer trends, market fluctuations." Discretionary-spending pullback in an inflationary environment, private-label competition, and a structural shift in the weight-management category toward GLP-1 drugs are all named risks. This shows up in results: Atkins net sales have been declining as retailers cut shelf space — Walmart, the largest customer at ~31% of FY2025 sales, reduced the number of Atkins products it carries during FY2025. | FY2025 10-K, p.21 ("geographic focus... North America" risk factor); FY2025 10-K, p.24 (Walmart ~31% of FY2025 sales; Walmart reduced Atkins assortment in FY2025); FY2025 10-K, MD&A p.39 (Atkins distribution declines, e-commerce partial offset) |

Industrial cycle is skipped — Simply Good Foods is a branded consumer packaged-food company with no meaningful exposure to industrial capital-spending or manufacturing-capacity cycles; this variable does not apply.

## 2. Sensitivity, If Disclosed

| Variable | Disclosed Sensitivity | Citation |
|---|---|---|
| Interest rate | A 1% increase in interest rates would increase annual interest expense by approximately $2.5 million, based on the $250.0 million Term Facility balance outstanding as of August 30, 2025 | FY2025 10-K, Item 7A, p.49 |

No FX, commodity, or freight sensitivity table (e.g., "a 10% move in X impacts revenue/margin by $Y") is disclosed anywhere in the pool. The company states only qualitatively that inflation, tariffs, and commodity costs affect margins, without a quantified dollar sensitivity — a gap relative to peers that publish commodity baskets or FX sensitivity tables.

## 3. Classification

**Partly externally driven** — Commodity input costs, tariffs, and the GLP-1-driven shift in the weight-management category are real, cited, and currently unhedged pressures the company cannot control directly. But management retains genuine levers: it sets its own pricing (a high single-digit increase is planned for September FY2026), controls its own SKU mix and marketing spend across three brands (Quest, Atkins, OWYN), and is actively repositioning Atkins around the GLP-1 opportunity rather than being purely passive to it. Interest-rate and FX exposure are both small relative to the size of the business ($1,450.9 million FY2025 net sales). This is not a company whose stock is simply a wrapper around a single external variable — it is a branded-foods business absorbing real cost and category-shift pressure that pricing and mix decisions can only partly offset.

## 4. External Dependency Risk Score

**52/100** (higher = worse — this score is inverted; 52 sits in the "material external exposure, mixed mitigation" band).

Drivers of the score: unhedged commodity exposure with a demonstrated 220bp gross-margin hit in FY2025, unhedged and unquantified tariff exposure the company itself calls "outside of our control," and a structural regulatory/consumer-cycle risk (GLP-1 drugs) touching the core Atkins brand. Offsetting factors that keep the score out of the "mostly externally driven" band: pricing power evidenced by planned FY2026 increases, low FX exposure (~2% of sales international), and low interest-rate exposure (~0.2% of sales per 1% rate move).

## 5. The Single Biggest Lever

Commodity and tariff-driven input-cost inflation — unhedged core ingredients (cocoa, dairy, nuts, protein) plus tariffs on imported ingredients and packaging — is the variable that would do the most damage on a 20% adverse move, since the company has no hedges in place and its only stated offset is pricing, which the same filings warn can trigger volume losses if pushed too far.

Out-of-scope request received: none.



---

## business-model / 11_capital-allocation-governance.md

_Source: `11_capital-allocation-governance.md`_

# Capital Allocation & Governance — SMPL

## 1. Signal Table

Severity is INVERTED — higher score = worse.

| Signal | Observation | Evidence | Severity /100 *(higher = worse)* |
|---|---|---|---:|
| Acquisition pattern (frequency, size, integration outcomes; serial-acquirer + opportunity cost — Filter 4) | Two material, largely debt-funded post-IPO acquisitions (Quest Nutrition, Nov-2019, ~$982.1M; OWYN, Jun-2024, ~$280.4M funded mostly by a new $250M term loan) — Quest has compounded well (sales $350M at deal to $863M in FY2025) but OWYN has already been written down $200.0M of its ~$280.4M cost (71% of purchase price) inside two years, and the original Atkins brand intangible also took a $93.0M impairment in the same quarter | [FY2025 10-K, p.1 (Quest/OWYN Acquisition definitions); FY2025 10-K, MD&A p.1 ("$250 million borrowed to fund the OWYN acquisition"; "Quest... $350 million when we acquired it... FY2025 net sales of $863 million"); FY26 Q3 10-Q, Note 4 (Goodwill and Intangibles): "$200.0 million for OWYN and $93.0 million for Atkins for the thirty-nine weeks ended May 30, 2026"; CIQ Financials_Annual.xls, Cash Flow tab: Cash Acquisitions -982.1 (FYE Aug-29-2020), -280.4 (FYE Aug-31-2024)] | 72 |
| Net share count trajectory (buybacks minus issuance, dilution) | Shares outstanding rose steadily from ~70.6M (FY2017) to ~99.7M (FY2025) on RSU/PSU issuance and two acquisition-linked equity raises, then fell to 88.4M by May-2026 as the board doubled the buyback authorization ($200M added Jan-2026) and management repurchased 11.65M shares at an average $18.29 (well below the ~$35 average paid a year earlier) while the stock was near its lows | [CIQ Financials_Annual.xls, Balance Sheet tab: Total Shares Out. 70.582573 (2017) → 99.60388 (Aug-2025) → 88.460545 (May-2026)]; [FY26 Q3 10-Q, Stock Repurchase Program note: "$200.0 million increase... January 6, 2026"; "repurchased 2,061,263 and 11,651,767 shares... at an average price of $12.14 and $18.29"; prior-year "693,375 shares... at an average price of $35.10"] | 30 |
| Dividend policy & coverage | No cash dividend has ever been paid; the company states it does not expect to pay one and instead directs free cash flow to debt paydown, opportunistic buybacks and acquisitions — a deliberate reinvestment policy rather than a distress signal, but it means all capital-return discipline runs through buyback timing alone | [FY2025 10-K, p.32, "Dividends": "We currently do not pay dividends... we do not expect to declare any dividends in the foreseeable future"] | 20 |
| Capex intensity vs depreciation (growth vs maintenance) | Capital expenditure ($20.5M FY2025, $28.1M LTM May-2026) sits close to depreciation & amortization ($28.3M FY2025, $30.2M LTM), consistent with a low-capital-intensity, largely co-manufactured/outsourced production model rather than aggressive self-funded capacity growth | [CIQ Financials_Annual.xls, Cash Flow tab: Capital Expenditure -20.5 (FYE Aug-30-2025), -28.1 (LTM May-30-2026); Depreciation & Amort., Total 28.294 / 30.212 same periods] | 25 |
| Debt level and trajectory (absolute + vs EBITDA) | Total debt swung from $326.6M (FY2023) to $437.3M (FY2024, OWYN term loan) back down to $304.4M (FY2025, after repaying "essentially all" of the OWYN loan) then up again to $448.5M (May-2026, a fresh $150M debt issuance); net debt/EBITDA was 0.5x on the FY2025 term-loan basis and covenant headroom is wide (max total net leverage covenant of 6.00x, company "in compliance... as of May 30, 2026") | [FY2025 10-K, MD&A p.1: "trailing 12-month Net Debt to Adjusted EBITDA ratio of 0.5x"]; [FY26 Q3 10-Q, Note on Credit Agreement: "maximum total net leverage ratio equal to or less than 6.00:1.00... in compliance with all covenants as of May 30, 2026"]; [CIQ Financials_Annual.xls, Balance Sheet tab: Total Debt 326.63 / 437.309 / 304.427 / 448.464 across FY2023–May-2026] | 25 |
| Related-party transactions | The only disclosed related-person items are a legacy Investor Rights Agreement from the 2017 SPAC formation (registration rights, board-nomination rights that lapsed in Oct-2022) and standard director/officer indemnity agreements; the Audit Committee has a written Related Party Transactions Policy and reviewed the items disclosed — nothing resembling a related-party transaction with ongoing cash flow to an insider was found | [FY2026 Proxy Statement, "Certain Relationships and Related Person Transactions," p.67-68; "Board of Directors and Corporate Governance — Review of Related Person Transactions"] | 10 |
| Insider / promoter ownership and changes | Insiders/individuals hold only 9.30% of shares (institutions hold the rest, led by BlackRock 14.79% and Vanguard funds); the largest individual holder is Chairman James Kilts at 4.27%, who bought 80,000 shares on the open market in April-2026 near the stock's lows, and independent director Clayton Daley bought 10,000 shares in May-2026 — modest but directionally positive insider buying during the drawdown | [CIQ Public Ownership Summary.rtf: Institutions 99.39% / Individuals-Insiders 9.30%; Top Holders: BlackRock 14.79%, Vanguard Portfolio Mgmt 6.29%, Kilts 4.27%]; [CIQ Public Ownership Insider Trading.xls: Kilts, open-market buy 80,000 sh @ $12.39, 2026-04-23; Daley, open-market buy 10,000 sh @ $11.78, 2026-05-14] | 20 |
| Promoter share pledging *(if applicable, e.g. Indian listings)* | Not applicable — SMPL is a US/Nasdaq-listed company with no controlling promoter and no pledging disclosure regime | [FY2026 Proxy Statement, ownership section — no pledge disclosure required or found] | 0 |
| Auditor history (changes, qualifications, key audit matters) | Deloitte & Touche LLP has been the sole auditor since 2019 (no auditor change), issued an unqualified opinion with no going-concern language, and flagged two critical audit matters — trade-promotion allowance estimates and the FY2025 Atkins indefinite-lived intangible impairment test — both are estimate-judgment items, not fraud or control-failure findings | [FY2025 10-K, "Report of Independent Registered Public Accounting Firm," p.51: "We have served as the Company's auditor since 2019"; Critical Audit Matters: trade promotions allowance; Atkins intangible impairment evaluation]; [FY2026 Proxy Statement, Proposal 2: "Deloitte has served as our independent public accounting firm since 2019"] | 15 |
| Restatements / accounting policy changes | No restatement of previously issued financial statements was found in the 10-K or proxy; the only "restated"/"amended and restated" language relates to routine corporate-charter and bylaw amendments and CIQ's own historical data-vintage labels, not a financial restatement | [FY2025 10-K, full-text search — no restatement disclosure of prior-period financials found] | 5 |
| Off-balance-sheet items | Operating leases are recognized on-balance-sheet under current lease accounting (current + long-term lease liabilities of $7.975M + $43.452M as of May-2026) and are disclosed as a "Debt Equivalent Oper. Leases" supplemental line by the data vendor; no other off-balance-sheet financing vehicles (VIEs, SPEs, guarantees to third parties) are disclosed | [CIQ Financials_Annual.xls, Balance Sheet tab: Curr. Port. of Leases 7.975, Long-Term Leases 43.452 (May-2026); Debt Equivalent Oper. Leases 105.488 (FY2025)] | 10 |
| Working capital trend (receivable days, inventory days, cash conversion) | Inventory grew faster than revenue — inventory as a share of revenue rose from about 7.2% (FY2020, $59.1M/$816.6M) to roughly 11.5–11.8% (FY2025/LTM, $167.2M/$164.3M against $1,450.9M/$1,392.2M revenue) — a moderate build worth monitoring, while receivable days held roughly flat (~40 days in FY2020 vs. ~41.5 days in FY2025); operating cash flow of $178.5M in FY2025 covered net income of $103.6M comfortably, but LTM cash from operations fell to $147.5M against a net loss (driven by non-cash impairment, not cash operations) | [CIQ Financials_Annual.xls, Balance Sheet tab: Inventory 59.085 (2020) → 167.217 (2025) → 164.314 (May-2026); Accounts Receivable 89.74 → 164.978 → 156.067 same periods; Income-Statement tab: Total Revenue 816.641 (2020) → 1450.92 (2025) → 1392.235 (LTM)]; [CIQ Financials_Annual.xls, Cash Flow tab: Cash from Ops. 178.457 (FY2025) / 147.54 (LTM); Net Income 103.614 (FY2025) / -198.8 (LTM)] | 30 |
| Senior management turnover (CEO, CFO, board chair in last 3 years) | Heavy recent turnover: CEO Geoff Tanner departed all positions Jan-18-2026 and was replaced by returning former CEO Joe Scalzo (Scalzo had already left the CEO seat in Jul-2023 and the Executive Vice Chairman role in Aug-2024); the current CFO Christopher Bealer has held the role only since Jul-3-2025 (a Senior VP, Finance from Apr-2025); the prior principal accounting officer, Timothy Matthews, resigned Feb-6-2026 to take an external CFO job — three finance/CEO leadership changes inside roughly 12 months, occurring alongside the stock-price collapse and goodwill/intangible impairment | [CIQ Key Developments.rtf, entries dated Jan-19-2026, Jan-20-2026, Jan-28-2026: Tanner separation "effective... January 18, 2026"; Scalzo appointed President/CEO "effective as of January 19, 2026"; Matthews resignation "effective February 6, 2026"; Bealer "has served as Chief Financial Officer since July 3, 2025"] | 55 |

## 2. Classification

**Capital allocation concerns.** The acquisition-pattern row is the dominant issue: SMPL is a serial acquirer of exactly the kind CLAUDE.md §24 Filter 4 targets — two material, largely debt-funded deals since its 2019 IPO era, one of which (OWYN, bought for ~$280.4M in mid-2024) has already had 71% of its purchase price written off in intangible impairments inside two years, alongside a $93.0M impairment of the founding Atkins brand and a $38.0M goodwill impairment, all triggered in the same quarter (FQ3 FY2026) by a sustained stock-price decline [FY26 Q3 10-Q, Note 4]. Layered on top of that is unusually heavy senior-leadership turnover in a 12-month window (CEO, principal accounting officer) coinciding with the same value-destroying quarter. Offsetting factors are real: the balance sheet is conservatively levered (0.5x net debt/adjusted EBITDA at FY2025, wide covenant headroom), the auditor is stable with no going-concern or qualification, related-party exposure is minimal, and both the board chair and an independent director bought stock in the open market near the FY2026 lows rather than selling. This is not a "governance red flags" case — there is no fraud, no auditor qualification, no promoter pledging, no material related-party leakage — but the capital-allocation record on the OWYN deal, combined with the leadership churn, is a specific, cited problem with how capital and management continuity have been handled.

## 3. Most Material Signal

The acquisition-pattern row is the single signal that would most change this classification if it deteriorated further. OWYN's impairment is not a hypothetical opportunity-cost argument — it is a booked, audited $200.0M write-down against a $280.4M purchase price inside 24 months [FY26 Q3 10-Q, Note 4], the clearest direct evidence in this pool that a debt-funded acquisition destroyed value. If the Quest brand — the one acquisition that has genuinely compounded (sales $350M to $863M since 2019 [FY2025 10-K, MD&A p.1]) — were to show similar impairment signs in a future quarter, or if the company pursued a third material deal before OWYN is stabilized, the classification would move to "Governance red flags" territory under the Filter 4 rejector logic. The leadership turnover compounds this: a CEO change and a principal-accounting-officer resignation both landed in the same quarter as the goodwill trigger, which raises the question of whether the M&A judgment that produced OWYN will be repeated under new leadership or corrected.

## 4. Capital Allocation Score /100

**42/100.**

**Rejector-filter cap applied.** The acquisition-pattern row scored 72/100 severity — a clear serial-acquirer pattern (Quest 2019 and OWYN 2024, both material and debt-funded relative to the company's scale at the time) with a booked, audited $200.0M impairment on 71% of the OWYN purchase price within two years [FY26 Q3 10-Q, Note 4]. Per CLAUDE.md §24 Filter 4 and the module rejector-filter table, this caps the Capital Allocation Score at 50/100 regardless of the cleaner signals elsewhere (low leverage, stable auditor, minimal related-party exposure, insider buying near the lows). Within that cap, the score is set at 42/100 — below the cap ceiling — to reflect the additional weight of the senior-management turnover row (55/100 severity) landing in the same quarter as the impairment, which is a second, compounding concern rather than a fully independent one.



---

## business-model / 12_red-flags-sweep.md

_Source: `12_red-flags-sweep.md`_

# Red Flags Sweep — SMPL

## 1. Already Covered Upstream

Upstream specialists have already surfaced the material risks in this file. Nothing below repeats these.

| Upstream Agent | Flag Already Surfaced |
|---|---|
| disqualifier-scan | No hard disqualifier triggers, but flags the FY2026 Q3 $391.9M combined goodwill/brand impairment (OWYN $200.0M, Atkins $93.0M+$31.0M, goodwill $38.0M) and the Walmart/Amazon 31%/18% customer concentration as material risks for downstream modules to weight |
| business-identity (02) | Explicitly classifies SMPL as "mid-way through a management-acknowledged operating turnaround," quoting the CEO's own words ("we remain in the early stages of our turnaround") — the Filter 2 (Turnarounds) rejector angle is already named |
| segment-map (03) | Zero brand-level profit/EBITDA/asset disclosure despite three financially dissimilar brands aggregated into one GAAP reportable segment; Atkins' structural decline and OWYN's lower margin already flagged |
| customer-geography (05) | Walmart (~31%) + Amazon (~18%) = ~49% of FY2025 net sales, both "at-will" with no minimum-purchase commitment; ~98% North America concentration |
| value-chain (06) | Single-source/limited-supplier dependency for core ingredients (nuts, protein, fiber) and reliance on a "limited number" of contract manufacturers, no commodity hedging — already flagged in detail as the input side of a "squeezed" bargaining-power verdict |
| business-quality (07) | ~800bps five-year gross-margin decline (40.7%→33.3% TTM), weak pricing power (score 40), weak competitive intensity (score 30), GLP-1 category-disruption risk on Atkins |
| external-dependency (10) | Unhedged commodity/tariff exposure (score 52/100, inverted), GLP-1 regulatory/consumer-cycle risk |
| capital-allocation-governance (11) | Serial-acquirer pattern (Filter 4 trip, severity 72, cap applied at 50); OWYN 71% intangible write-down within 24 months; senior-leadership turnover (CEO, principal accounting officer) inside 12 months, severity 55; insider buying by Chairman Kilts and director Daley |

## 2. New Red Flags

| Red Flag | Why It Matters | Evidence | Severity /100 *(higher = worse)* |
|---|---|---|---:|
| CEO severance economics tied to the failed OWYN deal ("pay for failure") | The CEO whose tenure included the OWYN acquisition — now 71% written off within two years [`11_capital-allocation-governance.md` §1] — departed in January 2026 with a disclosed Executive Severance Plan entitlement. The FY2025 proxy's own estimate (using Aug-30-2025 pay levels) shows $3,465,000 of cash severance for an "Involuntary Separation without Cause" (the scenario that matches a straight CEO replacement, not a company sale), or $5,197,500 plus $1,419,390 of accelerated equity if the departure had instead qualified as a Change-in-Control termination. Separately, in May 2025 — roughly eight months before the departure and the same fiscal year as the OWYN write-down — the Board raised the CEO's Change-in-Control severance multiplier from 2.0x to 3.0x. None of this is a disclosure failure (it is fully itemized in the proxy), but the magnitude of a multi-million-dollar exit package for the executive responsible for a value-destroying deal is a governance-quality data point the capital-allocation report's turnover discussion did not quantify. | [2026 Annual Meeting Proxy Statement, "Executive Severance Plan" and "Change in Control Benefits," p.58-59; "Potential Payments Upon Termination or Change in Control" table, p.60 (Geoff E. Tanner: Severance $3,465,000 involuntary-without-cause / $5,197,500 change-in-control, Acceleration of Equity Awards $1,419,390 change-in-control only); CIQ Key Developments.rtf, entries dated Jan-19-2026 and Jan-20-2026 (Tanner separation effective Jan-18-2026)] | 50 |
| CFO now also serves as sole Principal Accounting Officer, with no separate controller/CAO in the finance leadership chain | The company's former VP, Controller & Chief Accounting Officer, Timothy Matthews, resigned February 6, 2026 to take an external CFO role [`11_capital-allocation-governance.md` §1]. As of the FQ3 FY2026 10-Q and the CIQ ownership export, CFO Christopher Bealer is now titled "CFO & Principal Accounting Officer" — the two senior finance-oversight roles are held by one person who has been CFO only since July 2025. This concentration of the finance-reporting function landed in the same fiscal year as the $391.9M combined goodwill/intangible impairment and its associated critical-audit-matter judgment calls. No material weakness or ineffective-controls conclusion is disclosed — the FQ3 FY26 10-Q states disclosure controls were "effective" and there were no material changes to internal control over financial reporting — so this is a structural thinning of the finance bench during a high-estimate-risk period, not a proven control failure. | [The Simply Good Foods Company NasdaqCM SMPL Public Ownership Insider Trading.xls: "Bealer, Christopher James (CFO & Principal Accounting Officer)" title field, multiple rows; FQ3 FY26 10-Q, Item 4 (Controls and Procedures): "disclosure controls and procedures were effective," "no changes...that have materially affected...internal control over financial reporting"] | 35 |
| Large, zero-value director share disposition not captured in the upstream insider-ownership picture | Independent director David J. West — a current partner of Centerview Capital Consumer, the same investment firm Board Chairman James Kilts is affiliated with — is shown in the CIQ Form 4 export disposing of an aggregate 696,000 shares (three line items of -348,000 / -261,000 / -87,000) on a Form 4 dated 2026-05-12 (filed 2026-05-13), classified as "Other Disposition" with $0 recorded transaction value, reducing his reported position by 17.39% to 1,653,300 shares. A $0-value "Other Disposition" of this type and size is consistent with a non-open-market transfer (for example, an in-kind distribution from a Centerview-affiliated investment vehicle to its underlying investors) rather than a personal cash sale — the data pool does not disclose which. Either way, this movement is roughly seven times the size of the Kilts (80,000 sh) and Daley (10,000 sh) open-market purchases the capital-allocation report highlighted as "modest but directionally positive insider buying," and it was not mentioned there. The synthesizer should treat the insider-ownership signal as more mixed than "buying near the lows" alone conveys. | [The Simply Good Foods Company NasdaqCM SMPL Public Ownership Insider Trading.xls: "West, David J. (Independent Director)," trade date 2026-05-12, filed 2026-05-13, transaction type "Other Disposition," transacted shares -348,000 / -261,000 / -87,000, transaction value $0, end-of-filing shares owned 1,653,300, % change -17.39%; 2026 Annual Meeting Proxy Statement, director bio, "David J. West, Current Partner of Centerview Capital Consumer"] | 30 |
| Cash cost of the ongoing reorganization is a quantified $25 million, layered on top of the CEO transition | Beyond the qualitative "early-stage turnaround" language already flagged in `02_business-identity.md`, the FQ3 FY26 10-Q quantifies the associated restructuring program: the company expects to incur approximately $25.0 million in total restructuring and other costs tied to its "modified organization design" (workforce reductions, management-structure changes, cost-savings initiatives), of which $18.1 million was incurred through the thirty-nine weeks ended May 30, 2026 ($13.5 million of that within FQ3 alone) and $12.2 million remained an outstanding liability as of the same date, to be paid through fiscal 2027. A further $1.0 million of incremental stock-based compensation in FQ2 FY2026 was recorded specifically in connection with "the separation of the Company's prior President and Chief Executive Officer." This is real cash leaving the business to fund the leadership and organizational reset, on top of the CEO severance figures above, and is a data point the synthesizer can use to size the near-term cost of the turnaround the identity report already flagged. | [FQ3 FY26 10-Q (filed Jul 09, 2026), MD&A liquidity discussion and Note 14 (Restructuring and Other): "the Company incurred $13.5 million and $18.1 million of costs for restructuring activities" for the thirteen and thirty-nine week periods ended May 30, 2026; "the outstanding restructuring liability was $12.2 million"; "the Company expects to incur approximately $25.0 million...in restructuring and other costs"; "$1.0 million...related to the separation of the Company's prior President and Chief Executive Officer in January 2026"] | 25 |

## 3. Most Severe New Flag

The CEO severance economics (severity 50) is the flag the synthesizer should weight most. It connects two things already flagged separately upstream — the serial-acquirer / OWYN-write-down finding in `11_capital-allocation-governance.md` and the leadership-turnover finding in the same report — into a single, quantified governance fact the earlier report did not state: the executive whose signature deal destroyed 71% of its purchase price within two years left with a disclosed severance entitlement in the $3.465–5.2 million range, under a plan whose Change-in-Control multiplier the Board had increased just months earlier. None of this is concealed — it is itemized in the proxy exactly as required — but "fully disclosed" and "governance-neutral" are not the same thing, and the capital-allocation report's own classification ("capital allocation concerns," not yet "governance red flags") should be read against this fact, not independently of it.

## 4. Cross-Cutting Patterns

Four items — the acquisition-pattern write-down (upstream), the leadership-turnover pattern (upstream), the CEO severance economics (new, this file), and the CFO/Principal-Accounting-Officer dual-hat (new, this file) — describe the same underlying event from four angles: SMPL's finance and executive leadership was reshaped in a single window (roughly November 2025 through February 2026) that coincides exactly with the $391.9 million impairment quarter, at a disclosed cash cost (severance plus the $25.0 million restructuring program) that is itself material relative to the company's ~$220-225 million FY2026 guided adjusted EBITDA. Individually each item is disclosed and explainable; together they describe a company that changed its CEO, its principal accounting officer, and its organizational structure in the same two-to-three-quarter window it recognized its largest-ever non-cash write-down — a concentration of change and cost the synthesizer should treat as a single elevated-transition-risk period rather than four unrelated data points.
