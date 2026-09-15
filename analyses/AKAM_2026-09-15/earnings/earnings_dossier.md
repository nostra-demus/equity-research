# earnings Module Dossier — AKAM

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `earnings_memo.md`.

- Generated: 2026-09-14T07:26:09Z
- Module folder: `earnings`
- Contents: 1 module synthesis + 9 specialist outputs = 10 files

## Table of Contents

- [earnings — module synthesis](#earnings-module-synthesis) — `99_earnings-synthesis.md`
- [earnings / 00_earnings-data-triage.md](#earnings-00-earnings-data-triage-md) — `00_earnings-data-triage.md`
- [earnings / 01_historical-financials.md](#earnings-01-historical-financials-md) — `01_historical-financials.md`
- [earnings / 02_revenue-drivers.md](#earnings-02-revenue-drivers-md) — `02_revenue-drivers.md`
- [earnings / 03_margin-drivers.md](#earnings-03-margin-drivers-md) — `03_margin-drivers.md`
- [earnings / 04_guidance-consensus.md](#earnings-04-guidance-consensus-md) — `04_guidance-consensus.md`
- [earnings / 05_beat-miss-setup.md](#earnings-05-beat-miss-setup-md) — `05_beat-miss-setup.md`
- [earnings / 06_earnings-quality.md](#earnings-06-earnings-quality-md) — `06_earnings-quality.md`
- [earnings / 07_earnings-sensitivity.md](#earnings-07-earnings-sensitivity-md) — `07_earnings-sensitivity.md`
- [earnings / 08_earnings-red-flags.md](#earnings-08-earnings-red-flags-md) — `08_earnings-red-flags.md`


---

## earnings — module synthesis

_Source: `99_earnings-synthesis.md`_

# Earnings Module — AKAM (Synthesis)

## Abstract

Q2 revenue rose 5.4% year on year, but GAAP-derived EBITDA—operating profit before depreciation and amortization—fell 18.7% and diluted GAAP earnings per share (EPS) fell 26.8%, making Akamai’s setup mixed. Security drives growth, yet Delivery shrinks and cloud infrastructure services (CIS) costs arrive before related revenue. Q3 consensus sits near the revenue midpoint and below the adjusted-EPS midpoint, so it is fair. The biggest risk is another CIS delay while GAAP operating margin is 7.21 percentage points lower year on year. No missing-data cap applies, but inferred sensitivities and unresolved profit definitions cap usefulness; verdict: Mixed earnings setup. [Q2 FY2026 Form 10-Q, pp.5, 30–32; Q2 FY2026 earnings call, CFO Q&A; Q2 2026 earnings release, p.2; Capital IQ Estimates Report, Guidance worksheet]

## 1. Earnings Verdict

- **Verdict:** Mixed earnings setup
- Earnings clarity /100: **64** — full primary and consensus coverage is offset by missing solution-category profit and unreconciled profit definitions.
- Earnings quality /100: **63** [06_earnings-quality, §9]
- Consensus setup /100 *(higher = more beatable)*: **50** — the bar is fair, near management’s midpoint, with modestly negative estimate momentum. [04_guidance-consensus, §§4–7]
- Earnings volatility /100 *(higher = worse; inverted)*: **62** [07_earnings-sensitivity, §7]
- Data quality /100: **80** — the evidence set is sufficient, but only six actual quarters and no solution-category P&L are available. [00_earnings-data-triage, §§3, 6]
- Overall usefulness /100: **65** — capped because the vendor and filing profit definitions remain unreconciled. [08_earnings-red-flags, §2.9]
- Next-quarter setup: **Balanced** [05_beat-miss-setup, §8]
- Biggest earnings driver: Security was 55.0% of Q2 revenue, grew 10%, and added 5.03 percentage points to company revenue growth, more than the company’s 5.38% total because Delivery subtracted 2.32 points. [Q2 FY2026 Form 10-Q, Note 11 p.23 and Item 2 p.30]
- Biggest earnings risk: A CIS deployment delay can leave capacity costs in the quarter without the expected revenue while strict net debt—debt less cash only—divided by GAAP-derived EBITDA is already 5.14x. [Q2 FY2026 earnings call, CFO Q&A; Q2 FY2026 Form 10-Q, pp.3–4; 01_historical-financials, §2]
- **Earnings red-flag severity verdict: Material concerns** [08_earnings-red-flags, §5]

## 1A. Module Disconfirmation

- **Strongest bear point:** Q2 revenue grew 5.4%, but gross margin fell 331 basis points (3.31 percentage points), GAAP-derived EBITDA fell 18.7%, and diluted GAAP EPS fell 26.8%; growth is not reaching reported profit. [Q2 FY2026 Form 10-Q, p.5; Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet]
- **Strongest bull point:** Security grew 10%, CIS grew 39%, management reported more than $2.8bn of signed 2026 multi-year CIS commitments, and free cash flow remained positive in each of FY2023–FY2025. The commitment amount is management commentary, not reported backlog. [Q2 FY2026 Form 10-Q, p.30; Q2 FY2026 earnings call, prepared remarks; FY2025 Form 10-K, pp.54–56]
- **Single killer risk:** CIS equipment or data-centre delays defer revenue while co-location and build-out costs are already recognized; 5.14x strict net debt / GAAP-derived EBITDA reduces the room for another timing miss. [Q2 FY2026 earnings call, CFO Q&A; Q2 FY2026 Form 10-Q, pp.3–4]
- **Disconfirming evidence already visible:** Cash from operations (CFO) exceeded GAAP-derived EBITDA in FY2023–FY2025, and the company beat final quarterly revenue and normalized-EPS consensus in the last four reported quarters, although the sample is only four and the beat sizes have narrowed. [FY2025 Form 10-K, pp.54–56; Capital IQ Estimates Report, Surprise worksheet, FQ3 2025–FQ2 2026]

## 2. Specialist Roll-Up

| Specialist | Verdict Line *(earnings-volatility score: higher = worse)* | Biggest Finding |
|---|---|---|
| earnings-data-triage | **Sufficient; no active partial-data caps.** | The pool has the FY2025 10-K, Q2 2026 10-Q and cash-flow statement, verbatim Q2 call, and current consensus/revision history; only six actual quarters are available. [00_earnings-data-triage, §§3, 6] |
| historical-financials | **Revenue stable; reported profitability compressing.** | Q2 revenue rose 5.4%, but gross margin fell 331 basis points, GAAP-derived EBITDA margin fell 716 basis points, and GAAP EPS fell 26.8%. [Q2 FY2026 Form 10-Q, p.5; Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet] |
| revenue-drivers | **Security is the largest current driver; CIS is a later acceleration lever.** | Security added 5.03 percentage points to Q2 growth, CIS added 2.67 points, and Delivery subtracted 2.32 points; the category bridge has no residual, but the price/volume split is undisclosed. [Q2 FY2026 Form 10-Q, Note 11 p.23 and Item 2 p.30] |
| margin-drivers | **Near-term margin pressure; CIS demand has not yet offset the cost build.** | Cost of revenue explains 331 of the 721-basis-point GAAP EBIT-margin decline, while research and development, sales and marketing, and general and administrative expense explain another 440 basis points before small offsets; the accounting bridge has no residual. [Q2 FY2026 Form 10-Q, pp.5, 32–34] |
| guidance-consensus | **Bar is fair.** | Q3 revenue consensus is 0.06% above management’s midpoint; normalized EPS is 1.16% below its non-GAAP midpoint, but the adjusted definitions are not formally bridged. [Q2 2026 earnings release, p.2; Capital IQ Estimates Report, Guidance worksheet] |
| beat-miss-setup | **Setup is balanced.** | Security must offset Delivery weakness and the stated lack of Q3 CIS acceleration; Q4 is more exposed to deployment timing than Q3. [Q2 FY2026 Form 10-Q, p.30; Q2 FY2026 earnings call, CFO Q&A] |
| earnings-quality | **63/100 — mostly cash-backed, with material adjustment noise.** | FY2025 non-GAAP operating income exceeded GAAP operating income by $686.7m, including $459.4m of recurring stock-based compensation (SBC), even though CFO exceeded GAAP-derived EBITDA. [FY2025 Form 10-K, pp.54–56; Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet] |
| earnings-sensitivity | **62/100 — elevated volatility; higher is worse.** | Payroll, stock-based compensation, and other operating expenses are the largest directly measurable sensitivity: the reported 441-basis-point ratio gap equals a $48.5m zero-mitigation bound in a Q2-sized quarter. [Q2 FY2026 Form 10-Q, pp.5, 33–34] |
| earnings-red-flags | **Material concerns.** | Ten High flags include falling reported profitability, missing solution economics, Delivery pressure, CIS timing, recurring adjusted add-backs, and conflicting profit definitions. [08_earnings-red-flags, §§3–5] |

## 3. Reconciliation

- **Revenue direction versus earnings direction:** The historical and revenue specialists call revenue stable because Q2 grew 5.4%, while the margin and red-flag specialists show GAAP-derived EBITDA down 18.7% and GAAP EPS down 26.8%. These are different metrics, not competing facts. The profit measures outweigh the revenue direction for an earnings-acceleration call, while continuing top-line growth prevents a clean “Earnings decelerating” verdict; the reconciled view is mixed. [Q2 FY2026 Form 10-Q, p.5; Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet]
- **Filing versus vendor profit definitions:** FY2025 GAAP-derived EBITDA is $1,275.6m from audited operating income plus reported depreciation and amortization, versus Capital IQ EBITDA of $1,180.9m; audited GAAP operating income is $566.9m versus the vendor’s $628.2m. The gaps are not bridged. Use the audited build for reported trends and keep the vendor series on its own labeled basis. [FY2025 Form 10-K, pp.54–56; CIQ Financials, Income Statement, FY2025 — vendor basis, frozen 2026-09-14]
- **Strict versus broad leverage:** The filing-based strict measure is $6,082.6m net debt and 5.14x net debt / GAAP-derived EBITDA, while CIQ reports $4,722.7m broad-basis net debt and 4.37x using vendor EBITDA. CIQ includes lease liabilities in debt and nets marketable securities; the strict build excludes leases and nets only cash, so neither ratio substitutes for the other. [Q2 FY2026 Form 10-Q, pp.3–4; CIQ Financials, Balance Sheet and Income Statement, LTM 30 Jun 2026 — vendor basis]
- **Capital-expenditure definitions:** Management’s $347m Q2 “CapEx” (capital expenditure) is not reconciled to $225.8m of cash purchases of property, equipment, and capitalized internal-use software. Use $225.8m for CFO-minus-total-capex free cash flow; do not infer the cash effect of the $347m measure. [Q2 FY2026 Form 10-Q, p.7; Q2 FY2026 earnings call, CFO prepared remarks]
- **CIS timing:** The revenue specialist calls signed CIS commitments a future acceleration lever, while the beat/miss specialist says CIS growth should not accelerate in Q3. Both can be true: the Q3 timing statement controls the next-quarter setup, while the commitments are a Q4-and-later test. [Q2 FY2026 earnings call, CFO Q&A]
- **Cap adjudication:** The red-flag report says no explicit module cap is triggered, but it also finds the vendor and filing profit definitions materially different and unreconciled. The module rule for unreconcilable sources therefore caps Overall usefulness at 65; no other numerical score cap applies. Sensitivity confidence is separately Low because no clean company-disclosed per-unit earnings sensitivity exists. [08_earnings-red-flags, §§2.8–2.9, 6; 07_earnings-sensitivity, §2]

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No quarterly data | N | Earnings clarity | Not applicable; six actual quarters are available |
| No consensus / estimate data | N | Consensus setup | Not applicable; max 30 not used |
| Consensus present but stale | N | Consensus setup | No staleness haircut; current fields post-date Q2 results |
| No cash flow statement | N | Earnings quality | Not applicable; max 45 not used |
| No revision history | N | Consensus setup | Not applicable; max 60 not used |
| No verbatim transcript AND no sell-side proxy | N | Earnings clarity | Not applicable; max 70 not used |
| Transcript role filled ONLY by a sell-side proxy (no verbatim) | N | Earnings clarity | Not applicable; max 70 not used |
| No segment-level P&L for a multi-segment business | N | Earnings clarity | Akamai has one formal reportable segment; missing solution-category profit remains a limitation, not this cap |
| Only inferred sensitivities | Y | Earnings volatility confidence | **Low confidence; no numerical score cap** |
| Conflicting sources not reconcilable | Y | Overall usefulness | **max 65; final score 65** |

## 5. Earnings Setup Summary

### Revenue Setup

The Q2 revenue path is not an acquisition or foreign-exchange illusion: LayerX closed after quarter-end, no Q2 acquisition contribution is disclosed, and foreign exchange reduced growth by only 0.11 percentage points. [Q2 FY2026 Form 10-Q, pp.30–31; Q2 FY2026 earnings call, prepared remarks] It can persist over the next 12 months only if Security keeps growing and signed CIS capacity becomes billable; a signed CIS deal normally needs six to nine months before revenue starts. [Q2 FY2026 earnings call, Q&A] Security is the single factor most capable of reversing the direction because it is 55.0% of revenue, so a like-for-like 10% move equals about 5.5% of group revenue. Reported and underlying Q2 revenue do not materially diverge on the disclosed bridge: the +5.38-percentage-point total consists of Security +5.03 points, CIS +2.67 points, and Delivery −2.32 points, with zero residual, although the price-versus-volume split remains unknown. [Q2 FY2026 Form 10-Q, Note 11 p.23 and Item 2 pp.30–31]

### Margin Setup

Current margins are not a normalized run rate: the company is in a mid-cycle investment transition, not a proven trough, and CIS capacity cost can arrive before the related revenue. [Q2 FY2026 Form 10-Q, pp.30–32; Q2 FY2026 earnings call, CFO Q&A] The largest measurable 10% adverse move is in the $506.6m quarterly non-cost-of-revenue operating-expense base; with zero mitigation, `10% × $506.6m = $50.7m` of GAAP-derived EBITDA downside in a Q2-sized quarter—an inference, not a filing forecast, and close to the specialist’s $48.5m historical-ratio bound. [07_earnings-sensitivity, §§2–4] Akamai is not a pure price-taker because some large CIS contracts have cost-price mechanisms and annual escalators, but their coverage and realized offset are undisclosed, so no company-wide margin protection is proven. [Q2 FY2026 earnings call, CFO Q&A] Missing category margins also means the Security/CIS mix shift cannot yet prove a group-margin recovery. [Q2 FY2026 Form 10-Q, Note 14 p.25]

### Quality Check

The largest gap between reported and economic earnings is the recurring adjusted-profit exclusion: FY2025 non-GAAP operating income was $686.7m above GAAP operating income, including $459.4m of stock-based compensation, which rose from $328.5m in FY2023. Recurring restructuring and rising capitalized stock-based compensation reinforce that this gap is not narrowing on the available record. [FY2025 Form 10-K, pp.34–36, 54; Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet] A normalized FY2027 model should start with GAAP profit and CFO-minus-total-capex free cash flow, then separate dilution and genuinely temporary items; starting from non-GAAP would remove recurring employee and restructuring costs. [FY2025 Form 10-K, pp.54–56]

### Consensus Bar

A material Q3 beat requires Security to hold near its Q2 pace while revenue lands in the upper half of guidance and operating expense stays near the low end; earlier CIS conversion would help, but management explicitly does not expect Q3 CIS growth to accelerate. [Q2 FY2026 earnings call, CFO prepared remarks and Q&A] The bar looks correctly set: revenue consensus is 0.06% above the guidance midpoint, while normalized EPS is 1.16% below the non-GAAP midpoint, and the adjusted definitions make those small gaps directional rather than precise. [Q2 2026 earnings release, p.2; Capital IQ Estimates Report, Guidance worksheet] No quantified macro or one-off benefit anchors current consensus; the risk is instead that the expected Q4 CIS contract ramp is treated as certain despite deployment timing. [Q2 FY2026 earnings call, CFO Q&A]

## 5b. Leverage & Capital Structure

Trigger A fires: at 30 June 2026, strict net debt was $6,082.6m—$1,705.6m current convertible notes plus $5,857.3m long-term convertible notes less $1,480.3m cash—and strict net debt / trailing-twelve-month (TTM) GAAP-derived EBITDA was 5.14x, above 3.0x. [Q2 FY2026 Form 10-Q, pp.3–4; 01_historical-financials, §2] A true year-over-year ratio and absolute change were not calculated by the upstream specialists; the nearest matched definition is FY2025 year-end, when strict net debt was $3,175.1m and leverage 2.49x, implying a six-month increase of $2,907.5m and 2.65x. [FY2025 Form 10-K, p.53; 01_historical-financials, §§1, 6] The largest disclosed driver is $3.50bn principal of convertible notes issued in May 2026; the filing event coincides with, but does not by itself fully explain, the change in strict net debt. [Q2 FY2026 Form 10-Q, Note 7 p.16] The 5.14x ratio is GAAP-derived, not Adjusted EBITDA; CIQ’s 4.37x instead uses $4,722.7m broad-basis net debt and $1,079.9m vendor EBITDA, so it is not a substitute. [CIQ Financials, Balance Sheet and Income Statement, LTM 30 Jun 2026 — vendor basis] At least $1,705.6m of $7,562.9m carrying-value debt, or 22.6%, is current and therefore due within 12 months; the full fraction due within 24 months and the weighted-average interest rate are not provided by the upstream work. [Q2 FY2026 Form 10-Q, pp.3–4] Whether leverage is already constraining buybacks, dividends, or credit ratings is not proven from available data; capex was still guided to about 40% of FY2026 revenue, and no cited upstream evidence records a capital-return pause, capex deferral, or negative rating action. [Q2 FY2026 earnings call, CFO prepared remarks]

## 6. Key Numbers

- Revenue growth rate: **Q2 FY2026 +5.4% year on year** to $1,099.7m. [Q2 FY2026 Form 10-Q, p.5]
- EBITDA margin: **24.2% GAAP-derived**, down 716 basis points year on year; this is GAAP operating income plus depreciation and amortization, not company Adjusted EBITDA. [Q2 FY2026 Form 10-Q, pp.5, 7]
- EPS: **$0.52 diluted GAAP**, down 26.8% year on year, versus $1.59 company-defined non-GAAP EPS. [Q2 FY2026 Form 10-Q, p.5; Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet]
- CFO / EBITDA: **119.1% in FY2025**, using cash from operations over GAAP-derived EBITDA; H1 FY2026 CFO then fell 10.1% year on year. [FY2025 Form 10-K, pp.54–56; Q2 FY2026 Form 10-Q, pp.7–8]
- Biggest driver current level: **Security $604.4m, 55.0% of Q2 revenue, +10% year on year**, contributing +5.03 percentage points to company growth. [Q2 FY2026 Form 10-Q, Note 11 p.23 and Item 2 p.30]
- Consensus gap: **Q3 revenue $0.653m, or 0.06%, above management’s midpoint; normalized EPS 1.16% below the non-GAAP midpoint.** [Q2 2026 earnings release, p.2; Capital IQ Estimates Report, Guidance worksheet]
- Estimate revision direction: **Q3 revenue and normalized EPS each down 1.2% over 90 days**; last-month FY2026 revenue breadth was 3 up / 1 down, while GAAP EPS breadth was 0 up / 1 down. [Capital IQ Estimates Report, Trends and Revisions worksheets; CIQ facts sidecar, source-bound FY2026 revision reads]
- Earnings volatility score: **62/100, higher = worse (inverted)**; the largest direct bound is $48.5m per Q2-sized quarter from the reported operating-expense ratio gap, with zero mitigation. [07_earnings-sensitivity, §§2, 7]

## 7. What Would Change The Earnings Verdict?

| Current Verdict | What Would Upgrade It | What Would Downgrade It | Data Needed |
|---|---|---|---|
| Mixed earnings setup | Reported Q4 CIS growth accelerates on a standalone year-on-year basis while GAAP gross and operating margins improve versus Q4 FY2025 and cash conversion also improves; signed commitments alone do not qualify. | The Q4 CIS ramp is deferred again, Security slows while Delivery remains down, or standalone-quarter GAAP margins and cash conversion deteriorate further versus the same quarter a year earlier. | A solution-level CIS P&L and capital-spend bridge showing revenue, direct cost, margin, deployed capacity, and realized contract cost recovery on the same period basis. |

## 8. Note To The Final Synthesizer

- **Earnings red-flag severity verdict: Material concerns.** Do not soften this to a clean setup. [08_earnings-red-flags, §5]
- **Dominant trend and narrative flag:** Revenue rose 5.4%, but gross margin fell 331 basis points, GAAP-derived EBITDA fell 18.7%, and GAAP EPS fell 26.8%; “Earnings accelerating” is not supported. [Q2 FY2026 Form 10-Q, p.5; Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet]
- **Missing solution economics — High:** Security, Delivery, and CIS revenue are disclosed, but category profit, margin, assets, and capex are not; the mix shift does not prove improving earnings or returns. [Q2 FY2026 Form 10-Q, Note 14 p.25]
- **Delivery pressure — High:** Delivery and other cloud applications are 36.0% of revenue and fell 6% because of lower renewal pricing and customer traffic optimization. [Q2 FY2026 Form 10-Q, p.30]
- **CIS timing and adverse interaction — High:** Large deals normally take six to nine months to reach revenue, while co-location and build-out costs can arrive earlier; delayed revenue and incurred cost can therefore move against earnings together. [Q2 FY2026 earnings call, CFO Q&A]
- **Cost growth — High:** Cost of revenue, research and development, sales and marketing, and general and administrative expense rose 14%, 18%, 16%, and 15%, respectively, against 5% revenue growth. [Q2 FY2026 Form 10-Q, pp.5, 32–34]
- **Next quarter and look-ahead — High:** Q3 is Balanced, but an in-line Q3 is not a full test because management places the larger CIS ramp in Q4; another short deployment delay can cause a Q4 guide-down. [Q2 FY2026 earnings call, Q&A; Goldman Sachs Communacopia + Technology Conference, 2026-09-09, CFO discussion]
- **Cash backing and adjusted-profit risk — High:** CFO exceeded GAAP-derived EBITDA in FY2023–FY2025 and free cash flow stayed positive, but non-GAAP earnings exclude recurring SBC and restructuring; FY2025 SBC alone was $459.4m, above $452.0m GAAP net income. [FY2025 Form 10-K, pp.35–36, 54–56; Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet]
- **RF-EQ-001 (rising accruals divergent from cash earnings)**
- **Definition conflict — High:** FY2025 vendor EBITDA and operating income materially differ from the audited GAAP-derived values; keep each basis separate in leverage, FCF, and valuation work. [FY2025 Form 10-K, pp.54–56; CIQ Financials, Income Statement, FY2025 — vendor basis]
- **Consensus bar:** The Q3 bar is fair, not clearly easy; it is nearly at the revenue-guide midpoint, below the adjusted-EPS midpoint, and revisions have drifted modestly lower. [Capital IQ Estimates Report, Guidance and Trends worksheets]
- **Top sensitivity:** Payroll, SBC, and non-cost-of-revenue operating expenses are rising faster than revenue and create the largest direct quarterly bound; the more important non-linear risk is CIS capacity cost arriving before revenue. [Q2 FY2026 Form 10-Q, pp.5, 33–34; Q2 FY2026 earnings call, CFO Q&A]
- **Caps and limits:** No missing-data cap applies, but sensitivity confidence is Low and unreconciled source definitions cap module usefulness. Six-quarter history also prevents a seasonality or durable beat-rate claim. [00_earnings-data-triage, §§3, 5; 07_earnings-sensitivity, §2]
- **Biggest missing data point:** Solution-level CIS profit and capital spending on one matched basis, including realized cost recovery; without it, the return and margin effect of the signed commitments is not proven.
- **What changes the verdict:** Upgrade only when CIS acceleration arrives with year-on-year GAAP margin and cash-conversion improvement; downgrade if deployment slips again while costs and leverage stay elevated.

## 9. Simple Summary

- Revenue is still growing, but Security is carrying a shrinking Delivery business.
- Reported margins and profit are falling much faster than revenue is growing.
- Cash flow is positive, but adjusted earnings remove large recurring costs.
- The Q3 consensus bar looks fair, not easy.
- The Q3 beat/miss setup is Balanced.
- Q4 CIS deployment timing is the main earnings test.
- Cost growth and timing make earnings volatility elevated; exact category sensitivity is low confidence.
- This module is useful, but profit-definition conflicts and missing category economics cap confidence.



---

## earnings / 00_earnings-data-triage.md

_Source: `00_earnings-data-triage.md`_

# Earnings Data Triage — AKAM

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | [FY2025 Form 10-K, cover] |
| Exchange | Nasdaq Global Select Market; ticker AKAM | [FY2025 Form 10-K, cover] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC — Form 10-K annual filing and Form 10-Q interim filing | [FY2025 Form 10-K, cover; Q2 2026 Form 10-Q, cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | [FY2025 Form 10-K, Item 7 (non-GAAP measures); Q2 2026 Supplemental Financial Information, introductory note] |
| Reporting currency | USD | [Q2 2026 Form 10-Q, Item 1; Capital IQ Financials — Income Statement, units] |
| Fiscal-year end | 31 December | [FY2025 Form 10-K, cover] |
| Document language(s) | English | [FY2025 Form 10-K, cover; Q2 2026 Form 10-Q, cover] |

The next US interim report will be a standalone three-month Form 10-Q, with comparative year-to-date statements alongside it; it is not a cumulative-only reporting regime. [Q2 2026 Form 10-Q, Item 1 — three- and six-month statements]

## 1. File Inventory

The frozen manifest records 16 source files, including five workbooks expanded into 38 tabs (49 extracts in total), with zero extraction failures. File timestamps below are pool-freeze/sync timestamps only; periods are taken from document contents, not those timestamps. [Frozen generation manifest, totals and source entries]

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| 23cab413-4bd3-4055-8415-e3e81559c003.pdf (249 KB) | Earnings press release | Q2 ended 30 Jun 2026; released 6 Aug 2026 | 14 Sep 2026 10:54 (pool sync) | High |
| 6b47a3ae-7484-4682-b959-73a68a8842b5.pdf (348 KB) | Supplemental financial information | Q2 ended 30 Jun 2026; quarterly history Q1 2025–Q2 2026 | 14 Sep 2026 10:54 (pool sync) | High |
| 8201ec17-6108-433f-bfdb-2ac3555bf343.pdf (217 KB) | Earnings press release | Q1 ended 31 Mar 2026; released 7 May 2026 | 14 Sep 2026 10:54 (pool sync) | High |
| 825b8027-5dc8-4664-8e3a-9bb6544bb003.pdf (125 KB) | Supplemental financial information | Q1 ended 31 Mar 2026; quarterly history Q1 2025–Q1 2026 | 14 Sep 2026 10:54 (pool sync) | High |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Key Stats (91 × 9; 217 KB) | Capital IQ data export — key statistics | Historical financial and trading statistics through LTM 30 Jun 2026 | 14 Sep 2026 10:54 (pool sync) | Medium |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Income Statement (120 × 7; 217 KB) | Capital IQ data export — income statement | FY2021–FY2025 and LTM 30 Jun 2026 | 14 Sep 2026 10:54 (pool sync) | High |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Balance Sheet (89 × 7; 217 KB) | Capital IQ data export — balance sheet | 31 Dec 2021–31 Dec 2025 and 30 Jun 2026 | 14 Sep 2026 10:54 (pool sync) | High |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Cash Flow (72 × 7; 217 KB) | Capital IQ data export — cash flow | FY2021–FY2025 and LTM 30 Jun 2026 | 14 Sep 2026 10:54 (pool sync) | High |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Multiples (91 × 9; 217 KB) | Capital IQ data export — valuation multiples | Historical closes through latest available close | 14 Sep 2026 10:54 (pool sync) | Low |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Historical Capitalization (39 × 7; 217 KB) | Capital IQ data export — capitalization | Historical capitalization through latest available period | 14 Sep 2026 10:54 (pool sync) | Low |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Capital Structure Summary (87 × 7; 217 KB) | Capital IQ data export — capital structure | Latest reported/LTM periods through 30 Jun 2026 | 14 Sep 2026 10:54 (pool sync) | Medium |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Capital Structure Details (35 × 10; 217 KB) | Capital IQ data export — debt detail | Latest reported debt structure | 14 Sep 2026 10:54 (pool sync) | Medium |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Ratios (161 × 7; 217 KB) | Capital IQ data export — ratios | FY2021–FY2025 and LTM 30 Jun 2026 | 14 Sep 2026 10:54 (pool sync) | Medium |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Supplemental (64 × 7; 217 KB) | Capital IQ data export — supplemental | FY2021–FY2025 and LTM 30 Jun 2026 | 14 Sep 2026 10:54 (pool sync) | Medium |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Industry Specific (15 × 6; 217 KB) | Capital IQ data export — industry-specific data | Historical periods through FY2025 | 14 Sep 2026 10:54 (pool sync) | Low |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Pension OPEB (21 × 7; 217 KB) | Capital IQ data export — pension/OPEB | Historical periods through latest reported period | 14 Sep 2026 10:54 (pool sync) | Low |
| Akamai Technologies Inc NasdaqGS AKAM Financials.xls — Segments (72 × 7; 217 KB) | Capital IQ data export — business/geographic segments | FY2020–FY2025 | 14 Sep 2026 10:54 (pool sync) | Medium |
| Akamai Technologies, Inc. Presents at Citi’s 2026 Global TMT Conference, Sep-09-2026 02_35 PM.pdf (148 KB) | Verbatim company-conference transcript; not an earnings call | 9 Sep 2026 | 14 Sep 2026 10:54 (pool sync) | Medium |
| Akamai Technologies, Inc. Presents at Goldman Sachs Communacopia + Technology Conference 2026, Sep-09-2026 02_25 PM.pdf (154 KB) | Verbatim company-conference transcript; not an earnings call | 9 Sep 2026 | 14 Sep 2026 10:54 (pool sync) | Medium |
| Akamai Technologies, Inc., 2025.pdf (55.0 MB) | Audited annual filing — Form 10-K | Fiscal year ended 31 Dec 2025 | 14 Sep 2026 10:55 (pool sync) | High |
| Akamai Technologies, Inc., Q1 2026 Earnings Call, May 07, 2026.pdf (410 KB) | Verbatim earnings-call transcript (S&P Global MI; prepared remarks and Q&A) | Q1 2026 call, 7 May 2026 | 14 Sep 2026 10:55 (pool sync) | High |
| Akamai Technologies, Inc., Q1 2026.pdf (653 KB) | Quarterly filing — Form 10-Q | Quarter ended 31 Mar 2026 | 14 Sep 2026 10:55 (pool sync) | High |
| Akamai Technologies, Inc., Q2 2026 Earnings Call, Aug 06, 2026.pdf (389 KB) | Verbatim earnings-call transcript (S&P Global MI; prepared remarks and Q&A) | Q2 2026 call, 6 Aug 2026 | 14 Sep 2026 10:55 (pool sync) | High |
| Akamai Technologies, Inc., Q2 2026.pdf (692 KB) | Quarterly filing — Form 10-Q | Quarter ended 30 Jun 2026 | 14 Sep 2026 10:55 (pool sync) | High |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Consensus (529 × 121; 7.9 MB) | Capital IQ estimates export — consensus | FY ending 31 Dec 2026; forward quarterly and annual estimates | 14 Sep 2026 10:55 (pool sync) | High |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Recent Changes (265 × 10; 7.9 MB) | Capital IQ estimates export — dated estimate changes | Latest displayed changes 7 Sep 2026; FY2026 and forward | 14 Sep 2026 10:55 (pool sync) | High |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Guidance (142 × 89; 7.9 MB) | Capital IQ estimates export — company guidance history | Latest guidance dated 6 Aug 2026; Q3 and FY2026 | 14 Sep 2026 10:55 (pool sync) | High |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Multiples (26 × 7; 7.9 MB) | Capital IQ estimates export — estimate multiples | Current/forward estimate periods | 14 Sep 2026 10:55 (pool sync) | Low |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Surprise (263 × 111; 7.9 MB) | Capital IQ estimates export — reported surprise history | Annual history FY1999–FY2025; quarterly history included | 14 Sep 2026 10:55 (pool sync) | High |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Trends (303 × 21; 7.9 MB) | Capital IQ estimates export — estimate trends | FQ3 2026–FY2035, with 1–18 month history | 14 Sep 2026 10:55 (pool sync) | High |
| AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Revisions (467 × 21; 7.9 MB) | Capital IQ estimates export — revision breadth | FQ3 2026–FY2035, with 1–18 month history | 14 Sep 2026 10:55 (pool sync) | High |
| Company Comparable Analysis Akamai Technologies Inc.xls — Financial Data (50 × 17; 159 KB) | Capital IQ comparable-company export — financial data | As of 14 Sep 2026; LTM/NTM data | 14 Sep 2026 10:55 (pool sync) | Medium |
| Company Comparable Analysis Akamai Technologies Inc.xls — Trading Multiples (50 × 9; 159 KB) | Capital IQ comparable-company export — trading multiples | As of 14 Sep 2026; LTM/NTM data | 14 Sep 2026 10:55 (pool sync) | Low |
| Company Comparable Analysis Akamai Technologies Inc.xls — Operating Statistics (50 × 13; 159 KB) | Capital IQ comparable-company export — operating statistics | As of 14 Sep 2026; LTM/NTM data | 14 Sep 2026 10:55 (pool sync) | Medium |
| Company Comparable Analysis Akamai Technologies Inc.xls — Business Description (44 × 3; 159 KB) | Capital IQ comparable-company export — business descriptions | As of 14 Sep 2026 | 14 Sep 2026 10:55 (pool sync) | Low |
| Company Comparable Analysis Akamai Technologies Inc.xls — Implied Valuation (69 × 9; 159 KB) | Capital IQ comparable-company export — implied valuation | As of 14 Sep 2026 | 14 Sep 2026 10:55 (pool sync) | Low |
| Company Comparable Analysis Akamai Technologies Inc.xls — Valuation Chart (32 × 2; 159 KB) | Capital IQ comparable-company export — valuation chart | As of 14 Sep 2026 | 14 Sep 2026 10:55 (pool sync) | Low |
| Company Comparable Analysis Akamai Technologies Inc.xls — Credit Health Panel (48 × 10; 159 KB) | Capital IQ comparable-company export — credit health | As of 14 Sep 2026; LTM data | 14 Sep 2026 10:55 (pool sync) | Medium |
| Company Comparable Analysis Akamai Technologies Inc.xls — Disclaimer (26 × 1; 159 KB) | Export disclaimer | As of 14 Sep 2026 | 14 Sep 2026 10:55 (pool sync) | Low |
| Supplemental Financial Information, 1st Quarter 2026.xlsx — Disclaimer (33 × 1; 38 KB) | Supplemental-financial-information disclaimer | Quarter ended 31 Mar 2026 | 14 Sep 2026 10:55 (pool sync) | Low |
| Supplemental Financial Information, 1st Quarter 2026.xlsx — Supplemental Metrics (61 × 8; 38 KB) | Supplemental financial data — metrics | Q1 2025–Q1 2026 | 14 Sep 2026 10:55 (pool sync) | High |
| Supplemental Financial Information, 1st Quarter 2026.xlsx — Supplemental Revenue (46 × 8; 38 KB) | Supplemental financial data — solution revenue | Q1 2025–Q1 2026 | 14 Sep 2026 10:55 (pool sync) | High |
| Supplemental Financial Information, 1st Quarter 2026.xlsx — GAAP to Non-GAAP Reconciliation (126 × 8; 38 KB) | Supplemental financial data — GAAP/non-GAAP reconciliation | Q1 2025–Q1 2026 | 14 Sep 2026 10:55 (pool sync) | High |
| Supplemental Financial Information, 1st Quarter 2026.xlsx — Non-GAAP Definitions (63 × 1; 38 KB) | Supplemental financial data — non-GAAP definitions | Quarter ended 31 Mar 2026 | 14 Sep 2026 10:55 (pool sync) | Medium |
| Supplemental Financial Information, 2nd Quarter 2026.xlsx — Disclaimer (9 × 1; 41 KB) | Supplemental-financial-information disclaimer | Quarter ended 30 Jun 2026 | 14 Sep 2026 10:55 (pool sync) | Low |
| Supplemental Financial Information, 2nd Quarter 2026.xlsx — Supplemental Metrics (61 × 10; 41 KB) | Supplemental financial data — metrics | Q1 2025–Q2 2026 | 14 Sep 2026 10:55 (pool sync) | High |
| Supplemental Financial Information, 2nd Quarter 2026.xlsx — Supplemental Revenue (46 × 10; 41 KB) | Supplemental financial data — solution revenue | Q1 2025–Q2 2026 | 14 Sep 2026 10:55 (pool sync) | High |
| Supplemental Financial Information, 2nd Quarter 2026.xlsx — GAAP to Non-GAAP Reconciliation (126 × 10; 41 KB) | Supplemental financial data — GAAP/non-GAAP reconciliation | Q1 2025–Q2 2026 | 14 Sep 2026 10:55 (pool sync) | High |
| Supplemental Financial Information, 2nd Quarter 2026.xlsx — Non-GAAP Definitions (63 × 1; 41 KB) | Supplemental financial data — non-GAAP definitions | Quarter ended 30 Jun 2026 | 14 Sep 2026 10:55 (pool sync) | Medium |

No `data/AKAM/external/` directory or external-research documents are present in the frozen pool. The supplier/customer relationship sidecar is also empty (zero relationship rows), so it adds no earnings-relevant counterparties. [Frozen relationship graph, concentration]

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | Akamai Technologies, Inc., 2025.pdf — Form 10-K | FY ended 31 Dec 2025 | 8.5 |
| Quarterly filing | Akamai Technologies, Inc., Q2 2026.pdf — Form 10-Q | Quarter ended 30 Jun 2026 | 2.5 |
| Earnings transcript | Akamai Technologies, Inc., Q2 2026 Earnings Call, Aug 06, 2026.pdf — verbatim transcript | Q2 2026 call, 6 Aug 2026 | 1.3 |
| Investor deck | No standalone investor deck; two investor-conference transcripts are available | Latest conference: 9 Sep 2026 | 0.2 |
| Consensus / estimate export | AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls — Consensus / Trends / Revisions tabs | Current FY end 31 Dec 2026; Q3 release scheduled 3 Nov 2026 | Current; recent changes through 7 Sep 2026 |
| Cash flow data | Akamai Technologies, Inc., Q2 2026.pdf — Form 10-Q | Six months ended 30 Jun 2026; standalone-quarter cash flow can be derived only by subtraction | 2.5 |
| Guidance data | 23cab413-4bd3-4055-8415-e3e81559c003.pdf — Q2 results release; CIQ Guidance tab | Q3 and FY2026 guidance issued/updated 6 Aug 2026 | 1.3 |

The Q2 call is a verbatim S&P Global Market Intelligence transcript with prepared remarks and a Q&A, not a broker note or a press-release substitute. [Q2 2026 Earnings Call transcript, contents and pp. 4–9] The consensus workbook itself identifies 3 Nov 2026 as the Q3 2026 release date and includes current forecast, change, trend, and revision tabs; its estimate-based figures remain Tier 5, while reported figures stay anchored to filings. [Capital IQ Estimates — Consensus / Recent Changes / Trends / Revisions]

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | Q2 2026 Form 10-Q, Item 1 — Condensed Consolidated Statements of Income | Needed for revenue, margin, EPS |
| Balance sheet | Y | Q2 2026 Form 10-Q, Item 1 — Condensed Consolidated Balance Sheets | Needed for working capital and leverage |
| Cash flow statement | Y | Q2 2026 Form 10-Q, Item 1 — Condensed Consolidated Statements of Cash Flows | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Q2 2026 Form 10-Q; Q2 results release, 6 Aug 2026 | Needed for trend and setup |
| Last 8 quarters | N | Q2 Supplemental Financial Information — six consecutive reported quarters, Q1 2025–Q2 2026 | Needed for seasonality and inflection; six periods are useful, but not the full eight-quarter window |
| Consensus estimates | Y | Capital IQ Estimates — Consensus, current FY end 31 Dec 2026 | Needed for market bar |
| Estimate revisions | Y | Capital IQ Estimates — Recent Changes and Revisions, latest changes 7 Sep 2026 | Needed for revision momentum |
| Earnings transcript | Y | Q2 2026 Earnings Call transcript — verbatim, prepared remarks and Q&A | Needed for management tone and driver detail |
| Segment P&L | Y, with limitation | FY2025 Form 10-K, Note 17; Q2 2026 Form 10-Q, Note 17 — one reportable segment, plus solution-category revenue | Needed for mix shift; solution-level profit is not separately disclosed |
| Current price | Y | USD 106.79, Capital IQ Comps — Financial Data, as of 14 Sep 2026 | Needed only for master-level stock reaction context |

The current-price availability is the source-bound read in `ciq_facts.json`: USD 106.79 from the Comps Financial Data subject row as of 14 Sep 2026. [CIQ facts sidecar — current_price, present] No material mismatch with the underlying Capital IQ workbook was identified in this triage. The six-quarter rather than eight-quarter history is a limitation to disclose in seasonal analysis, but it is not a module-defined partial-data cap.

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y |
| 06_value-chain.md | Y |
| 10_external-dependency.md | Y |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N | 04, 05, 99 | None |
| No quarterly data | N | 01, 02, 03, 06 | None |
| No VERBATIM transcript, sell-side proxy present | N | 02, 03, 04 | None — Q1 and Q2 verbatim earnings-call transcripts are present |
| No transcript AND no sell-side proxy | N | 02, 03, 04 | None |
| No segment-level P&L | N — Akamai reports one formal segment and discloses solution revenue, although it does not disclose solution profit | 02, 03, 99 | None; keep the solution-profit limitation visible in driver work |
| No cash flow statement | N | 06, 99 | None |
| No current price | N | 99 | None |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The frozen pool contains an audited FY2025 Form 10-K, Q2 2026 Form 10-Q with income statement, balance sheet, and cash flow statement, a Q2 verbatim earnings-call transcript, official Q2 release and supplemental tables, and current consensus, guidance, and revision exports. [FY2025 Form 10-K, cover; Q2 2026 Form 10-Q, Item 1; Q2 2026 Earnings Call transcript, contents; Capital IQ Estimates workbook]
- **Active partial-data caps:** None.



---

## earnings / 01_historical-financials.md

_Source: `01_historical-financials.md`_

# Historical Financials — AKAM

US GAAP; USD millions except per-share data, margins, and leverage. Fiscal year ends 31 December. “EBITDA (GAAP-derived)” below means GAAP income from operations plus depreciation and amortization recorded in operating expenses; it is not Akamai’s non-GAAP Adjusted EBITDA.

## 1. Annual Financial Table (3–5 years)

| Metric | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---|
| Revenue [1] | 3,811.9 | 3,991.2 | 4,208.2 | Stable |
| Revenue YoY % [4] | N/A | 4.7% | 5.4% | Stable |
| Gross profit (revenue − cost of revenue) [1, 4] | 2,300.9 | 2,370.4 | 2,480.7 | Stable |
| Gross margin % [4] | 60.4% | 59.4% | 59.0% | Decelerating |
| EBITDA (GAAP-derived) [1, 4] | 1,208.1 | 1,181.8 | 1,275.6 | Volatile |
| EBITDA margin % [4] | 31.7% | 29.6% | 30.3% | Volatile |
| EBIT (GAAP income from operations) [1] | 637.3 | 533.4 | 566.9 | Volatile |
| EBIT margin % [4] | 16.7% | 13.4% | 13.5% | Volatile |
| EPS (diluted, GAAP) [1] | 3.52 | 3.27 | 3.07 | Decelerating |
| CFO (cash from operations) [1] | 1,348.4 | 1,519.2 | 1,518.8 | Stable |
| Capex (PP&E + capitalized internal-use software) [1, 4] | 730.0 | 685.3 | 819.5 | Volatile |
| FCF (CFO − total capex) [4] | 618.4 | 833.9 | 699.3 | Volatile |
| Operating working capital [3, 4] | 397.3 | 374.8 | 522.5 | Volatile |
| Net debt — strict basis* [2, 3, 4] | 3,048.8† | 3,028.1 | 3,175.1 | Stable |
| Net debt / EBITDA [4] | 2.52x† | 2.56x | 2.49x | Stable |

*Strict net debt is convertible debt and revolving debt, excluding operating-lease liabilities, less cash and equivalents. The builds are: FY24 = $1,149.1m current notes + $2,396.7m long-term notes − $517.7m cash = $3,028.1m; FY25 = $4,105.4m long-term notes − $930.2m cash = $3,175.1m. [FY2025 Form 10-K, p.53]

†FY23 = $3,538.2m long-term debt − $489.5m cash = $3,048.8m. It is a **strict basis (vendor debt figure; composition unconfirmed against the filing debt note)**, because the frozen annual filing does not contain a FY23 balance sheet. [Capital IQ Financials workbook, Balance Sheet, FY2023 column — vendor basis, data frozen 2026-09-14]

Operating working capital excludes cash, investments, debt, leases, and current-income-tax balances. Its build is accounts receivable + prepaid and other current assets − accounts payable − accrued expenses excluding current income taxes − deferred revenue − other current liabilities: FY23 $724.3m + $216.1m − $146.9m − $282.2m − $107.5m − $6.4m = $397.3m; FY24 $727.7m + $253.8m − $130.4m − $294.5m − $149.2m − $32.5m = $374.8m; FY25 $793.7m + $306.5m − $125.1m − $266.4m − $151.2m − $35.0m = $522.5m. [Capital IQ Financials workbook, Balance Sheet, FY2023–FY2025 columns — vendor basis, data frozen 2026-09-14]

The deterministic CIQ sidecar reports FY25 EBITDA of $1,180.9m (28%), versus $1,275.6m (30.3%) under the GAAP-derived definition above — a $94.7m difference. The vendor workbook also reports a different FY25 operating-income basis ($628.2m) from the audited $566.9m. The material gap requires a definition/reclassification reconciliation; it is not silently overridden. The table uses the audited-statement build, and provider EBITDA should not be used in a multiple or leverage comparison until reconciled. [CIQ Financials→Income Statement, FY2025 column — vendor basis; FY2025 Form 10-K, p.54]

## 2. TTM Snapshot

Latest TTM is the four actual reported quarters from Q3 FY2025 through Q2 FY2026. A prior TTM cannot be built from the frozen primary documents because Q3 and Q4 FY2024 quarterly financials are absent; it is not estimated.

| Metric | Latest TTM | Prior TTM | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 4,322.8 | N/A | N/A | $4,208.2m FY25 − $2,058.6m H1 FY25 + $2,173.3m H1 FY26. [FY2025 Form 10-K, p.54; Q2 FY2026 Form 10-Q, p.5] |
| EBITDA (GAAP-derived) | 1,184.1 | N/A | N/A | FY25 $1,275.6m − H1 FY25 $655.5m + H1 FY26 $564.1m. [FY2025 Form 10-K, pp.54–56; Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet] |
| EBIT (GAAP income from operations) | 455.7 | N/A | N/A | $566.9m − $306.0m + $194.8m. [FY2025 Form 10-K, p.54; Q2 FY2026 Form 10-Q, p.5] |
| EPS diluted (GAAP) | 2.75 | N/A | N/A | Provider LTM calculation; do not add rounded quarterly EPS. [Capital IQ Financials workbook, Income Statement, LTM Jun. 30 2026 column — vendor basis, data frozen 2026-09-14] |
| CFO | 1,447.2 | N/A | N/A | $1,518.8m − $710.3m + $638.8m. [FY2025 Form 10-K, pp.55–56; Q2 FY2026 Form 10-Q, pp.7–8] |
| Capex | 817.3 | N/A | N/A | $819.5m − $419.8m + $417.6m; each period includes PP&E plus capitalized internal-use software. [FY2025 Form 10-K, p.55; Q2 FY2026 Form 10-Q, p.7] |
| FCF | 629.9 | N/A | N/A | $1,447.2m CFO − $817.3m capex. [FY2025 Form 10-K, pp.55–56; Q2 FY2026 Form 10-Q, pp.7–8] |
| Net debt at latest period-end — strict basis | 6,082.6 | N/A | N/A | $1,705.6m current convertible notes + $5,857.3m long-term convertible notes − $1,480.3m cash; operating leases are excluded. [Q2 FY2026 Form 10-Q, pp.3–4] |

Net debt is a point-in-time balance-sheet metric, not a TTM flow metric.

CIQ-sidecar reconciliation: the mechanically parsed vendor reads are LTM EBITDA $1,079.9m, CFO $1,447.2m, levered FCF $710.1m, total debt $9,339.0m, net debt $4,722.7m, and net debt/EBITDA 4.37x. CFO matches the primary-source TTM calculation after rounding. The other comparisons are not like-for-like: this report's $1,184.1m EBITDA is GAAP-derived, its $629.9m FCF is CFO minus total capex rather than levered FCF, and its $6,082.6m strict net debt excludes $1,776.2m operating-lease liabilities and nets only $1,480.3m cash. CIQ's $4,722.7m net-debt read includes those lease liabilities in debt and also nets $4,616.3m of cash plus marketable securities, so it is a broad cash basis and must not be substituted for strict net debt. [CIQ Financials→Income Statement and Balance Sheet, LTM Jun. 30 2026 — vendor basis; Q2 FY2026 Form 10-Q, pp.3–4]

## 3. Latest Quarterly Trend Table (up to 8 quarters)

Actual reported quarters available in the frozen pool are shown below. EBITDA is GAAP-derived as defined above; gross margin is gross profit divided by revenue.

| Metric | Q1 FY25 | Q2 FY25 | Q3 FY25 | Q4 FY25 | Q1 FY26 | Q2 FY26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---|---|
| Revenue [5] | 1,015.1 | 1,043.5 | 1,054.6 | 1,094.9 | 1,073.6 | 1,099.7 | +2.4% | +5.4% |
| Gross margin % [4, 5] | 58.7% | 59.1% | 59.3% | 58.7% | 56.1% | 55.8% | −29 bps | −331 bps |
| EBITDA (GAAP-derived) [4, 5] | 328.6 | 326.9 | 342.6 | 277.4 | 298.2 | 265.8 | −10.9% | −18.7% |
| EBITDA margin % [4, 5] | 32.4% | 31.3% | 32.5% | 25.3% | 27.8% | 24.2% | −361 bps | −716 bps |
| EPS (diluted, GAAP) [5] | 0.82 | 0.71 | 0.97 | 0.58 | 0.71 | 0.52 | −26.8% | −26.8% |

## 4. Reported vs Adjusted Metrics

The latest-quarter adjusted values are company-defined non-GAAP measures. They are shown beside, not merged into, GAAP figures.

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA, Q2 FY2026 | 265.8 GAAP-derived | 416.1 Adjusted EBITDA | +150.2 | The company adds back stock-based compensation, depreciation/amortization, acquired-intangible amortization, restructuring and acquisition items, interest expense and other expense; it subtracts interest and marketable-securities income. | [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet] |
| EBIT, Q2 FY2026 | 80.3 GAAP income from operations | 270.7 non-GAAP income from operations | +190.4 | Stock-based compensation, depreciation/amortization, acquired-intangible amortization, restructuring and acquisition-related items are excluded from the non-GAAP measure. | [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet] |
| EPS, Q2 FY2026 | 0.52 GAAP diluted EPS | 1.59 non-GAAP diluted EPS | +1.07 | The company applies the above adjustments after tax and adjusts the non-GAAP diluted share count for note-hedge transactions. | [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet] |

## 5. Quarterly Seasonality Table (last 3 fiscal years)

Insufficient quarterly history for seasonality analysis. The pool has six actual quarters (Q1 FY2025 through Q2 FY2026), not three full fiscal years; no seasonal revenue-share conclusion is drawn.

## 6. Key Trend Summary

Revenue is **Stable**: annual growth was 4.7% in FY24 and 5.4% in FY25, and H1 FY26 revenue rose 5.6% year on year. [FY2025 Form 10-K, p.54; Q2 FY2026 Form 10-Q, p.5]

Margins are **Compressing**: gross margin moved from 60.4% in FY23 to 59.0% in FY25, then to 56.0% in H1 FY26, 298 basis points below H1 FY25; GAAP EBIT margin fell 590 basis points year on year to 9.0% in H1 FY26. [FY2025 Form 10-K, p.54; Q2 FY2026 Form 10-Q, p.5]

There is no support for a seasonality conclusion from the available six-quarter record. The clear recent inflection is profitability: GAAP operating margin was 8.7% in Q4 FY25 and 7.3% in Q2 FY26, versus 15.7% in Q3 FY25. [Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet]

Balance-sheet leverage also changed materially: strict net debt was $3.18bn at FY25 and $6.08bn at Q2 FY26, while strict net debt/GAAP-derived EBITDA rose from 2.49x to 5.14x. The Q2 filing says Akamai issued $3.50bn principal of new convertible notes in May 2026; that event coincides with, but does not by itself fully explain, the leverage change. [FY2025 Form 10-K, p.53; Q2 FY2026 Form 10-Q, pp.3–4, Note 7 p.16]

Calculation audit — executed Python check using the cited amounts:

```text
FY25 FCF=699.265; TTM revenue=4322.834; TTM FCF=629.879; Q2-26 strict ND/EBITDA=5.14x
```

## 7. Citations

[1] FY2025 Form 10-K (year ended 2025-12-31), Consolidated Statements of Income p.54; Consolidated Statements of Cash Flows pp.55–56.

[2] FY2025 Form 10-K (year ended 2025-12-31), Consolidated Balance Sheets p.53.

[3] Capital IQ Financials workbook, Balance Sheet, FY2023–FY2025 columns — vendor basis, data frozen 2026-09-14. Used only where the FY2025 audited filing has no FY2023 balance-sheet comparative or where the defined operating-working-capital build requires the vendor’s separately presented current-tax line.

[4] Calculations from the stated rows: growth = (current − prior) / prior; gross margin = (revenue − cost of revenue) / revenue; GAAP-derived EBITDA = GAAP operating income + D&A; capex = PP&E purchases + capitalized internal-use software; FCF = CFO − capex; leverage = strict net debt / GAAP-derived EBITDA.

[5] Q2 2026 Supplemental Financial Information (unaudited), Supplemental Metrics sheet and GAAP to Non-GAAP Reconciliation sheet. The workbook provides actual Q1 FY2025 through Q2 FY2026 values in USD thousands; this report presents USD millions.

[6] Q2 FY2026 Form 10-Q (three and six months ended 2026-06-30), Condensed Consolidated Balance Sheets pp.3–4; Statements of Income p.5; Statements of Cash Flows pp.7–8; Note 7 (Debt) p.16.



---

## earnings / 02_revenue-drivers.md

_Source: `02_revenue-drivers.md`_

# Revenue Drivers — AKAM

US GAAP; USD millions unless stated otherwise. Fiscal year ends 31 December. The latest reported period is Q2 2026.

## 1. Segment Decomposition Status

Segment decomposition applied — 3 economic solution categories from the business-model module. AKAM is one US-GAAP reportable segment, but no category exceeds 85% of revenue, so a consolidated-only read would hide the opposing Security/CIS and Delivery trends. Category profit and margin data are not disclosed. [analyses/AKAM_2026-09-14/business-model/03_segment-map.md; data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 14, p. 25]

The company’s sector-overlay checklist specifies a generic read rather than a SaaS-only KPI set. Remaining performance obligations (RPO — contracted revenue not yet recognized) are available and are used as the contracted-base KPI; net retention, billings, customer counts, and category backlog are not disclosed. [analyses/AKAM_2026-09-14/business-model/02_business-identity.md, §3a; data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23]

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Multi-segment contracted and usage-based infrastructure provider | Sum of Security contracts and usage + Delivery/other cloud-applications commitments and traffic usage + CIS (cloud infrastructure services) compute commitments and usage + professional/managed-service fees |

Company-specific formula: **Revenue = contracted commitments, renewals and cross-sold services + usage above commitments (network traffic and cloud consumption) × renewal/unit price, across Security, Delivery and other cloud applications, and CIS.** This is an inference from the disclosed contract and recognition model, not a filing formula. Most services are recognized over time, generally ratably because of consistent monthly usage; usage above a commitment is recognized when served. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23; data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 27]

The contracted base is meaningful but not the same as a full sales backlog: RPO was $7.6bn at 30 June 2026, with about 40% expected in the next 12 months and another 40% in the following two to three years. It excludes variable usage without a committed contract and expected renewals. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23]

## 3. Market / Share / Price / Mix Split

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand | Mixed, with Security and CIS improving while Delivery weakens | Q2 Security revenue grew 10% and CIS 39%; Delivery and other cloud applications fell 6%. Security growth came from API security, web application firewall and Guardicore products; CIS growth came from new/existing compute customers and compute-partner solutions. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 30] | 95 |
| Company market share | Unknown | The filing attributes category movement to Akamai product sales, renewal pricing and customer behaviour, but discloses no market-share series or share change. Product growth is not proof of share gains. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 30] | 45 |
| Price / realization | Deteriorating in Delivery; mixed overall | Delivery’s decline was driven by downward contract-renewal pricing. Management says large CIS contracts can include mechanisms to reflect hardware-cost changes, but gives no company-wide realized-price measure. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 30; data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, Q&A] | 85 |
| Product / customer / geography mix | Shifting toward Security and CIS | Security’s revenue share rose from 52.9% in Q2 2025 to 55.0% in Q2 2026; CIS rose from 6.8% to 9.0%; Delivery and other cloud applications fell from 40.3% to 36.0%. This is a revenue-mix observation, not evidence of a category-margin change. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23; calculations from stated revenue rows] | 80 |
| FX translation | Small negative in Q2 | FX reduced Q2 revenue by $1.1m, or about 0.11 percentage points of Q2 2025 revenue. It is too small to explain the category divergence. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 31; calculation from stated amounts] | 20 |
| M&A / divestitures | No material FY2026 revenue contribution disclosed | LayerX was acquired on 2 July 2026, after Q2, and management expected no material FY2026 revenue impact. It cannot explain Q2 growth. No divestiture contribution is disclosed. [data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, prepared remarks] | 15 |

## 4. Revenue Driver Table (consolidated)

| Driver | Current Level | Direction (Improving / Stable / Deteriorating / Unknown) | Magnitude (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Contracted revenue base | $7.6bn RPO at 30 June; roughly 40% due in the next 12 months | Unknown — no prior RPO comparator is disclosed | High | RPO supports revenue visibility but excludes expected renewals and uncommitted variable usage. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23] |
| Security adoption and cross-sell | $604.4m, 55.0% of Q2 revenue; +10% YoY | Improving | High | Growth was led by API security, web application firewall and Guardicore segmentation sales. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 30] |
| Delivery renewal price | Delivery and other cloud applications: $395.9m, 36.0% of Q2 revenue; -6% YoY | Deteriorating | Mid | The filing names downward renewal pricing as a driver. It does not quantify the price-only effect. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 30] |
| Delivery traffic / variable usage | Traffic growth improved but remained below prior years; Delivery and other cloud applications fell 6% YoY | Deteriorating | Mid | Customer cost optimization reduced network traffic; management expects moderated traffic growth through the rest of 2026. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, pp. 28, 30] |
| CIS customer deployment and conversion | $99.3m, 9.0% of Q2 revenue; +39% YoY | Improving, but capacity-constrained | Mid | Growth came from new/existing compute customers and compute partners. Management reported more than $2.8bn of signed 2026 multi-year CIS commitments, but said large deals normally take six to nine months from signing to revenue recognition. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 30; data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, prepared remarks and Q&A] |
| Data-centre/GPU capacity | Management said all GPU capacity was sold out and additional deployments are needed for signed contracts | Improving demand; capacity is a timing constraint | Mid | Capacity, data-centre space, power and equipment delivery govern when signed CIS commitments can turn into revenue. [data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, prepared remarks and Q&A] |
| FX | -$1.1m Q2 YoY revenue effect | Deteriorating | Low | Reported Q2 revenue was reduced by FX; the amount is already embedded in reported category revenue changes. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 31] |

The business-model module flags Delivery and other cloud applications as cyclical. Its latest position is **mid-cycle / weak, not a verified trough**: the category declined 6% YoY, and management describes traffic growth as improved but still moderated versus prior years, with continued moderation expected in 2026. The pool has no full-cycle category-volume history, so a peak or trough call is not proven. No one-time policy tailwind is identified as a current revenue driver. [analyses/AKAM_2026-09-14/business-model/10_external-dependency.md, §1; data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, pp. 28, 30]

## 5. Revenue Drivers By Segment (if applicable)

### Segment: Security (55.0% of Q2 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| API security, web application firewall and Guardicore sales | Security revenue $604.4m; +10% YoY reported, +9% constant currency | Improving | High | The filing identifies those products as the source of Security growth. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 30] |
| AI-related security need | Management reported demand across web application firewall, API security and Guardicore; the filing does not quantify an AI-only revenue contribution | Improving | Mid | The earnings call described AI security demand as a contributor; this is management commentary, not a separately reported KPI. [data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, prepared remarks] |
| Renewal pricing | Some Delivery and Security renewal prices have declined in recent years, partly offset by incremental solution sales | Mixed | Mid | The filing describes price pressure and mitigation through upselling, but gives no Security-only realized-price series. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 28] |
| LayerX acquisition | Acquired after quarter-end; no material FY2026 revenue impact expected | Stable | Low | It expands the security portfolio but is not a reported Q2 driver. [data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, prepared remarks] |

### Segment: Delivery and other cloud applications (36.0% of Q2 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Renewal unit pricing | $395.9m revenue; -6% YoY reported, -5% constant currency | Deteriorating | Mid | Downward pricing on contract renewals was a stated cause of the decline. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 30] |
| Media/gaming and customer-optimization traffic | Traffic growth remains moderated; customer cost optimization reduced traffic | Deteriorating | Mid | The filing names macro pressure and customer cost optimization; it does not quantify their separate dollar effects. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, pp. 28, 30] |
| AI-generated traffic | Management says Delivery revenue is mainly bytes delivered and current AI text/agent traffic has not yet changed that byte volume at scale | Stable | Low | This limits a claim that AI is currently reversing Delivery’s trend. [data/AKAM/Akamai Technologies, Inc., Citi 2026 Global TMT Conference, 2026-09-09, management discussion] |

### Segment: Cloud infrastructure services (CIS) (9.0% of Q2 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| New and existing compute customers; compute-partner solutions | $99.3m revenue; +39% YoY reported and constant currency | Improving | Mid | These customer and partner sales drove the category increase. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 30] |
| Signed multi-year commitments | More than $2.8bn announced as signed in 2026; a newly announced $600m, four-year customer had no material 2026 revenue effect | Improving | Mid | Commitments create a future conversion pipeline, not current recognized revenue. [data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, prepared remarks] |
| Capacity deployment, power and GPU delivery | GPU capacity reported sold out; large deals normally recognize revenue six to nine months after signing | Improving demand; timing risk remains | Mid | The timing of equipment, space and power determines the ramp; management expected no CIS growth acceleration in Q3 and a larger ramp in Q4. [data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, Q&A] |
| CIS price protection | Large contracts can include mechanisms to reflect input-cost changes | Improving / protected, but not quantified | Mid | This commentary applies to large CIS contracts, not to all company revenue or all customer contracts. [data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, Q&A] |

## 6. Revenue Growth Decomposition

Q2 2026 reported revenue rose $56.188m, or **5.38%**, from Q2 2025. This is a solution-category bridge, not a volume/price bridge: the filing discloses the category dollars but does not quantify Delivery’s separate renewal-price and traffic effects, nor Security’s or CIS’s unit-price versus volume effects. All category changes below are reported dollars, so the separately disclosed $1.1m FX drag is already embedded and is not added again. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, pp. 30–31]

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Security solution-category net change | +5.03 | $604.436m less $551.914m, driven by sales of API security, web application firewall and Guardicore solutions. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23; Item 2—Revenue, p. 30] |
| Delivery and other cloud applications net change | -2.32 | $395.927m less $420.117m. The filing attributes the decline to downward renewal pricing and customer cost optimization that reduced traffic, but does not split their individual contributions. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23; Item 2—Revenue, p. 30] |
| CIS solution-category net change | +2.67 | $99.319m less $71.463m, from sales to new/existing compute customers and compute partners. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23; Item 2—Revenue, p. 30] |
| FX | Not additive | FX reduced Q2 revenue by $1.1m, or -0.11pp, but that effect is already included in the reported category rows. Adding it would double count. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 2—Revenue, p. 31; calculation from stated amounts] |
| Acquisitions / divestitures | 0.00 | No Q2 acquisition or divestiture contribution is disclosed; LayerX closed after quarter-end. [data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, prepared remarks] |
| Other | 0.00 | Category totals exactly reconcile to reported revenue growth. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23; calculation from stated amounts] |
| Total revenue growth | +5.38 | $1,099.682m versus $1,043.494m. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23] |

## 6a. Decomposition Attribution and Residual (MODULE_RULES "Driver Attribution" / §15)

Security solution-category net change: `($604.436m − $551.914m) ÷ $1,043.494m Q2 2025 total revenue base` [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23]

`= +5.03pp of the +5.38pp observed growth`

`→ Asserted from disclosed category revenue; no volume, price, or mix ratio applied.`

Delivery and other cloud applications net change: `($395.927m − $420.117m) ÷ $1,043.494m Q2 2025 total revenue base` [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23]

`= −2.32pp of the +5.38pp observed growth`

`→ Asserted from disclosed category revenue; no price/traffic ratio applied. A price-versus-traffic split is not disclosed, so no modelled pp split is claimed.`

CIS solution-category net change: `($99.319m − $71.463m) ÷ $1,043.494m Q2 2025 total revenue base` [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23]

`= +2.67pp of the +5.38pp observed growth`

`→ Asserted from disclosed category revenue; no volume, price, or mix ratio applied.`

Reconciliation: `+5.03pp − 2.32pp + 2.67pp + 0.00pp Other = +5.38pp`, equal to total revenue growth of `(1,099.682 − 1,043.494) ÷ 1,043.494 = +5.38pp`. The category bridge therefore has **5.38pp explained and 0.00pp residual**. This does not make the underlying price/volume drivers fully known: the category bridge reconciles, while the Delivery price-versus-traffic split remains undisclosed.

RF-EARN-001: revenue decomposition reconciled — explained 5.38pp, residual 0.00pp, total 5.38pp

## 7. The Single Biggest Revenue Driver

**Security adoption and cross-sell is the single biggest current revenue driver.** Security was 55.0% of Q2 revenue and its $52.522m YoY increase contributed +5.03pp, more than the full +5.38pp company growth because Delivery subtracted -2.32pp. A like-for-like 10% movement in the current Security revenue base would move total company revenue by about 5.5% (`10% × 55.0%`), which makes it the largest current category driver. Its direction is improving, led by API security, web application firewall and Guardicore sales. CIS is the main **future acceleration** lever in management’s commentary, but at 9.0% of Q2 revenue it is not yet the largest reported revenue driver; its large commitments still depend on capacity deployment and a typical six-to-nine-month conversion period. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11, p. 23; Item 2—Revenue, p. 30; data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, prepared remarks and Q&A]



---

## earnings / 03_margin-drivers.md

_Source: `03_margin-drivers.md`_

# Margin Drivers — AKAM

US GAAP; USD millions except percentages and basis points (bps). The latest reported period is Q2 FY2026 (three months ended 30 June 2026). “GAAP-derived EBITDA” below is income from operations plus reported depreciation and amortization; it is not Akamai's company-defined Adjusted EBITDA.

## 1. Segment Decomposition Status

Business-model outputs are available. Akamai has one US-GAAP reportable segment, but three material solution categories: Security was 55.0% of Q2 revenue, Delivery and other cloud applications 36.0%, and cloud infrastructure services (CIS) 9.0%. No category exceeds 85%, so a category-level driver read is useful. However, Akamai does not disclose costs, operating profit, assets, capital expenditure, or margins by category. The margin bridge therefore remains consolidated; category profit attribution is **Not assessable**. [Q2 FY2026 Form 10-Q, Note 11 pp. 23–24; Note 14 p. 25; Business-model Segment Map]

**Sector overlay:** No sector overlay for global cloud-security, edge/cloud-infrastructure, and content-delivery services — generic cost stack applies. [Business-model Business Identity, §3a]

## 2. Cost Stack

The main rows below are GAAP income-statement expenses and are additive through operating income. The separate stock-based compensation (SBC, employee pay in shares) and depreciation views are diagnostic only because they are already embedded in those main rows.

| Cost Line | Q2 FY2026 Amount / % Revenue | Direction vs. Q2 FY2025 | Evidence | Margin Risk |
|---|---:|---|---|---|
| Cost of revenue | $485.9 / 44.2% | +14%; ratio +331 bps | Co-location, bandwidth, network build-out, payroll, SBC and depreciation all rose; revenue rose 5%. [Q2 FY2026 Form 10-Q, pp. 5, 32] | High — direct gross-margin pressure while CIS capacity is built. |
| Research and development | $148.8 / 13.5% | +18%; ratio +147 bps | Higher payroll and SBC from strategic-initiative headcount, merit increases and the new retirement benefit. [Q2 FY2026 Form 10-Q, p. 33] | Mid — management expects it to remain above 2025 in the rest of 2026. |
| Sales and marketing | $170.0 / 15.5% | +16%; ratio +145 bps | Go-to-market headcount reinvestment and higher SBC. [Q2 FY2026 Form 10-Q, p. 33] | Mid — spend rose faster than revenue. |
| General and administrative | $187.7 / 17.1% | +15%; ratio +149 bps | Higher payroll and SBC, with the same benefit-plan effect. [Q2 FY2026 Form 10-Q, p. 34] | Mid — this was a larger margin impact than any single disclosed network-cost subline. |
| Acquired-intangible amortization | $25.1 / 2.3% | −9%; ratio **improved** 38 bps | Lower after FY2025 impairment of certain completed technologies. [Q2 FY2026 Form 10-Q, p. 34] | Low — a reported offset, not an operating-cost improvement. |
| Restructuring | $1.8 / 0.2% | −41%; ratio **improved** 13 bps | The company does not expect material further charges from the actions described. [Q2 FY2026 Form 10-Q, p. 34] | Low. |
| Interest expense | $9.1 / 0.8% | +11% | Non-operating; it does not affect gross margin or EBIT. [Q2 FY2026 Form 10-Q, p. 5] | Low for operating margin; outside this margin walk. |

Within cost of revenue, the disclosed direct-cost movements isolate the immediate pressure but not the economic cause of each movement. Energy is embedded in co-location, and raw-material and freight costs are not separately disclosed.

| Cost-of-Revenue Detail | Q2 FY2026 / % Revenue | Direction vs. Q2 FY2025 | Evidence | Margin Risk |
|---|---:|---|---|---|
| Co-location | $99.5 / 9.0% | +14%; ratio +69 bps | Data-centre space and power costs are rising as CIS and AI capacity expand; hyperscaler competition is an added cost factor. [Q2 FY2026 Form 10-Q, pp. 28, 32] | High. |
| Bandwidth | $53.5 / 4.9% | +17%; ratio +49 bps | Network investment lifted the line. The company also cites efficiency work and supplier-renewal pricing as mitigation, but Q2 was higher year on year. [Q2 FY2026 Form 10-Q, pp. 28, 32] | Mid. |
| Network build-out and supporting services | $74.4 / 6.8% | +28%; ratio +119 bps | Primarily compute-partner costs as the programme expands. [Q2 FY2026 Form 10-Q, p. 32] | High. |
| Payroll and related costs in cost of revenue | $91.6 / 8.3% | +8%; ratio +20 bps | Headcount growth and annual merit increases. [Q2 FY2026 Form 10-Q, p. 32] | Mid. |
| SBC in cost of revenue | $38.8 / 3.5% | +27%; ratio +59 bps | New retirement benefit and performance-based plan achievement. [Q2 FY2026 Form 10-Q, p. 32] | Mid. |
| Network-equipment depreciation | $84.7 / 7.7% | +4%; ratio **improved** 14 bps | The percentage benefit reflects the revenue denominator; the dollar cost still rose and future server/memory price increases are expected to raise depreciation. [Q2 FY2026 Form 10-Q, pp. 29, 32] | High over the next 3–12 months. |
| Internal-use software amortization | $43.4 / 3.9% | +14%; ratio +29 bps | Capitalized software is amortized to cost of revenue over two to ten years. [Q2 FY2026 Form 10-Q, pp. 32–33] | Mid. |

Total Q2 SBC was $146.3m (13.3% of revenue), up from $112.8m (10.8%). Total depreciation and amortization was $185.5m (16.9%), up from $175.5m (16.8%). These figures overlap the rows above and are not added again. [Q2 FY2026 Form 10-Q, pp. 7, 32–34]

## 3. Gross Margin → EBITDA Margin → EBIT Margin Walk

| Margin Level | Latest Q2 FY2026 | Q2 FY2025 | Change bps | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin | 55.8% | 59.1% | −331 | Cost of revenue grew 14% against 5% revenue growth; network build-out, co-location and bandwidth were the largest disclosed cost-pressure lines. | [Q2 FY2026 Form 10-Q, pp. 5, 32] |
| EBITDA margin, GAAP-derived | 24.2% | 31.3% | −716 | Gross-margin decline plus R&D, sales and marketing, and G&A growth faster than revenue. | $80.3m GAAP operating income + $185.5m D&A = $265.8m; Q2 FY2025: $151.5m + $175.5m = $326.9m. [Q2 FY2026 Form 10-Q, pp. 5, 7; calculation] |
| EBIT margin (GAAP income from operations) | 7.3% | 14.5% | −721 | The same gross-margin and operating-expense pressures; lower acquired-intangible amortization and restructuring only offset 51 bps. | [Q2 FY2026 Form 10-Q, pp. 5, 32–34; calculation] |

For context only, the company-defined non-GAAP operating margin was 24.6% in Q2 FY2026 versus 29.6% in Q2 FY2025, and Adjusted EBITDA margin was 37.8% versus 42.6%. Those measures exclude SBC, depreciation/amortization and other items, so they do not replace the GAAP walk. [Q2 2026 Supplemental Financial Information, Supplemental Metrics and GAAP-to-Non-GAAP Reconciliation sheets]

Management's Q3 guidance is for approximately 70% **cash** gross margin and 24–26% non-GAAP operating margin. Cash gross margin is not GAAP gross margin, and management does not provide a GAAP reconciliation for its forward non-GAAP guidance; it is directionally consistent with continued near-term capacity pressure, not a GAAP forecast. [Q2 FY2026 earnings call, CFO prepared remarks; Q2 FY2026 results release, p. 2]

**Pass-through lag:** company-wide realised cost recovery is not computable from the pool. For large CIS deals, management says cost-price mechanisms and annual escalators can cover hardware, memory, labour and power changes, but every deal differs and the covered revenue share is not disclosed. Large-deal signing to revenue recognition is typically six to nine months; management expects co-location costs can lead revenue by roughly one quarter, and in longer ramps five to six months. This is a CIS-specific management description, not evidence of company-wide pass-through. [Q2 FY2026 earnings call, CFO Q&A]

## 4. Margin Walk — Which Margin Level Matters Most?

**GAAP EBIT margin**—income from operations after direct and operating costs—matters most now. Gross margin explains 331 bps of the Q2 year-on-year decline, but GAAP EBIT margin fell 721 bps because R&D, sales and marketing, and G&A each also grew faster than revenue. Gross margin remains the earliest signal of data-centre cost pressure; it is insufficient on its own while Akamai funds CIS sales and engineering capacity. [Q2 FY2026 Form 10-Q, pp. 5, 32–34]

## 5. Margin Driver Table (consolidated)

| Driver | Impact on Margins | Direction (Tailwind / Neutral / Headwind / Unknown) | Magnitude | Evidence |
|---|---|---|---|---|
| CIS capacity build-out: co-location, compute partners, bandwidth and future depreciation | These costs are recognised before a large customer deployment is fully producing revenue; they pushed cost of revenue to 44.2% of Q2 revenue. | Headwind near term | High | Co-location +14%, bandwidth +17%, and network build-out/support +28%; the filing attributes part of each increase to platform and CIS expansion. [Q2 FY2026 Form 10-Q, p. 32] |
| CIS contract ramp and price mechanisms | Can reverse some capacity pressure once contracted capacity is deployed; the coverage and realised recovery are not disclosed. | Unknown | High | Management describes customer pre-orders, reserve-style capacity, and large-deal pricing mechanisms, but not category margins or a realised recovery rate. [Q2 FY2026 earnings call, CFO Q&A] |
| Employee payroll and SBC | Raised R&D, sales, G&A and direct network costs faster than revenue. | Headwind | High | Total SBC rose $33.5m to $146.3m; R&D, sales and marketing, and G&A rose 18%, 16%, and 15%, respectively, against 5% revenue growth. [Q2 FY2026 Form 10-Q, pp. 5, 32–34] |
| Delivery renewal pricing and traffic optimisation | Lowers revenue from the legacy category and may weaken fixed-cost absorption. Its category margin is not disclosed. | Headwind | Mid | Delivery and other cloud applications revenue fell 6%, from lower renewal pricing and customer cost optimisation that reduced traffic. [Q2 FY2026 Form 10-Q, p. 30] |
| Security growth and solution mix | Helps revenue scale, but its category margin is not disclosed. | Unknown | Mid | Security revenue rose 10%, led by API security, web application and Guardicore segmentation products. [Q2 FY2026 Form 10-Q, p. 30] |
| Bandwidth efficiency and vendor-renewal pricing | A mitigation lever, but not a Q2 benefit on the reported cost line. | Neutral | Mid | Akamai cites network efficiency and improved provider renewal pricing; Q2 bandwidth fees nevertheless rose 17%. [Q2 FY2026 Form 10-Q, pp. 28, 32] |
| FX | Small at the latest-quarter level. | Neutral | Low | FX reduced Q2 revenue by $1.1m; a hypothetical 10% US-dollar move was not material to interim results. [Q2 FY2026 Form 10-Q, pp. 31, 43] |

**Cycle position:** Mid-cycle / investment transition — *inference, not from filings.* This is not a normalised margin run rate: Security grew 10% and CIS 39%, while the 36%-of-revenue Delivery category fell 6%, and capacity costs are being added ahead of some CIS revenue. The available data cannot establish a historical peak or trough, and no one-time policy tailwind is used in this read. This aligns with the business-model view that enterprise IT spending and data-centre supply are material external variables. [Q2 FY2026 Form 10-Q, pp. 30–32; Business-model External Dependency, §§1 and 3]

## 6. Margin Drivers By Segment (if applicable)

These are economic revenue categories, not reportable operating segments. No category-level P&L is disclosed, so the direction of each category's margin impact is not independently measurable and none is used to allocate the consolidated bridge.

### Solution category: Security (55.0% of Q2 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| API security, web application security and Guardicore segmentation sales | Revenue scale could help fixed-cost absorption; category margin is not disclosed. | Unknown | Not assessable | Security revenue rose 10% to $604.4m; the filing identifies those product families as drivers. [Q2 FY2026 Form 10-Q, p. 30] |
| Renewal pricing competition | Lower prices can pressure revenue and margin, but the Q2 filing does not quantify Security's specific price effect. | Headwind | Not assessable | The annual filing says some Security renewal prices have declined from competition. [FY2025 Form 10-K, Item 7, pp. 28–29] |

### Solution category: Delivery and other cloud applications (36.0% of Q2 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Downward renewal pricing and customer traffic optimisation | Revenue fell, which can reduce absorption of a distributed network's fixed costs; category margin is not disclosed. | Headwind | Not assessable | Revenue fell 6% to $395.9m; the filing identifies both lower renewal pricing and lower traffic. [Q2 FY2026 Form 10-Q, p. 30] |
| Mix within the combined category | The line includes $95.4m of other cloud applications, so it is not a pure Delivery-margin proxy. | Unknown | Not assessable | [Q2 2026 Supplemental Financial Information, Supplemental Revenue sheet] |

### Solution category: Cloud infrastructure services (9.0% of Q2 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Capacity, co-location and hardware deployment ahead of revenue | Management expects lower margins during the deployment ramp; category margin is not disclosed. | Headwind near term | Not assessable | CIS revenue grew 39% to $99.3m. Management says co-location cost may precede revenue by about a quarter, longer in some ramps. [Q2 FY2026 Form 10-Q, p. 30; Q2 FY2026 earnings call, CFO Q&A] |
| Contracted capacity and price escalators | Could support margin after ramping, but each deal differs and covered revenue is not disclosed. | Unknown | Not assessable | Management describes price mechanisms for hardware, memory, labour and power in large contracts. [Q2 FY2026 earnings call, CFO Q&A] |

## 7. Margin Bridge — Latest Period

This is a **GAAP EBIT-margin bridge for Q2 FY2026 versus Q2 FY2025**, using reported income-statement line items. It is not a product price/volume/mix bridge: the filing does not separate the cost increases between external inflation, capacity added, service mix and utilisation.

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Cost of revenue | −331 | $485.9m / $1,099.7m versus $426.5m / $1,043.5m. [Q2 FY2026 Form 10-Q, pp. 5, 32] |
| R&D | −147 | $148.8m / $1,099.7m versus $125.8m / $1,043.5m. [Q2 FY2026 Form 10-Q, pp. 5, 33] |
| Sales and marketing | −145 | $170.0m / $1,099.7m versus $146.2m / $1,043.5m. [Q2 FY2026 Form 10-Q, pp. 5, 33] |
| G&A | −149 | $187.7m / $1,099.7m versus $162.6m / $1,043.5m. [Q2 FY2026 Form 10-Q, pp. 5, 34] |
| Lower acquired-intangible amortization | +38 | $25.1m / $1,099.7m versus $27.7m / $1,043.5m. [Q2 FY2026 Form 10-Q, pp. 5, 34] |
| Lower restructuring charge | +13 | $1.8m / $1,099.7m versus $3.1m / $1,043.5m. [Q2 FY2026 Form 10-Q, pp. 5, 34] |
| Other | 0 | No other operating-expense line is omitted from the GAAP income statement. Commercial-driver allocation remains unavailable. [Q2 FY2026 Form 10-Q, p. 5] |
| **Total GAAP EBIT-margin change** | **−721** | 7.3% versus 14.5%. [Q2 FY2026 Form 10-Q, p. 5; calculation] |

## 7a. Bridge Attribution and Residual (MODULE_RULES “Driver Attribution” / §15)

Each figure is derived from reported expense and revenue, not a sensitivity. The basis matches in every case: consolidated standalone Q2 US-GAAP income-statement values, each divided by revenue for the same quarter.

```text
Cost of revenue: −[(485.932 / 1,099.682) − (426.535 / 1,043.494)] × 10,000
  = −331.3 bps of the −721.4 bps observed change
  → basis matches; reported-line calculation, no sensitivity applied

R&D: −[(148.821 / 1,099.682) − (125.838 / 1,043.494)] × 10,000 = −147.4 bps
Sales and marketing: −[(170.045 / 1,099.682) − (146.239 / 1,043.494)] × 10,000 = −144.9 bps
G&A: −[(187.686 / 1,099.682) − (162.597 / 1,043.494)] × 10,000 = −148.5 bps
Acquired-intangible amortization: −[(25.089 / 1,099.682) − (27.721 / 1,043.494)] × 10,000 = +37.5 bps
Restructuring: −[(1.825 / 1,099.682) − (3.103 / 1,043.494)] × 10,000 = +13.1 bps
```

The reported-cost-line bridge sums to −721.4 bps and the observed GAAP EBIT-margin change is −721.4 bps, so the rounded reconciliation is **−721 bps explained, 0 bps residual**. That is an accounting reconciliation, not proof that cost of revenue was caused by one economic input: management explicitly combines capacity expansion, partner costs, compensation and market-price effects in the disclosed cost stack. [Q2 FY2026 Form 10-Q, pp. 5, 32–34]

RF-EARN-002: margin bridge reconciled — explained -721bps, residual 0bps, total -721bps

## 8. The Single Biggest Margin Driver

**Cost of revenue** is the largest single reported line: its 331-bps deterioration accounts for 46% of the 721-bps Q2 GAAP EBIT-margin decline. It therefore does **not** explain a majority of the move; R&D, sales and marketing, and G&A together explain the other 390 bps after small amortization and restructuring offsets. Within cost of revenue, network build-out and supporting services was the largest disclosed subcomponent at 119 bps, but the filing does not separate the effect of CIS capacity added from partner-cost inflation or product mix. The most likely next margin mover is the timing of CIS revenue ramp relative to co-location and related capacity cost, rather than a proven single input-price sensitivity. [Q2 FY2026 Form 10-Q, pp. 30, 32–34; Q2 FY2026 earnings call, CFO Q&A]

## 9. Investment Spend — Both Signs

| Reading | What it would show | Evidence here |
|---|---|---|
| Spend as a future **COST** | Co-location and deployment cost before revenue, then more depreciation and software amortization as capacity goes live. | Cost of revenue rose 14% in Q2; management expects co-location, bandwidth, network-equipment depreciation and internal-use-software amortization to rise through 2026. It explicitly says deployed capacity can create a quarter of margin pressure before revenue. [Q2 FY2026 Form 10-Q, pp. 28, 32–33; Q2 FY2026 earnings call, CFO Q&A] |
| Spend as a **DEMAND signal** | Signed, long-duration commitments that require capacity instead of speculative deployment. | Management reported more than $2.8bn of 2026 CIS multi-year contract wins, including a new-customer contract of more than $600m over four years; the call says customers commonly reserve capacity months in advance and that large deals usually take six to nine months from signing to revenue. These are management disclosures, not a reported backlog balance or an independently measured utilisation rate. [Q2 FY2026 results release, p. 1; Q2 FY2026 earnings call, CFO prepared remarks and Q&A] |

The cash-flow statement reports $225.8m of Q2 purchases of property/equipment and capitalized internal-use software, versus $223.8m in Q2 FY2025. Management separately described “Q2 CapEx” as $347m (32% of revenue) and forecast FY2026 capital expenditures of roughly 40% of revenue, but the frozen disclosures do not provide a reconciliation between that management-defined measure and cash capital expenditure. They must not be treated as a like-for-like trend. [Q2 FY2026 Form 10-Q, p. 7; Q2 FY2026 earnings call, CFO prepared remarks]

**Current read:** Near-term, the cost sign is visible in reported and guided margins. The demand sign is meaningful because management disclosed signed multi-year CIS commitments, but it does not yet prove category profitability or utilisation. The one observable that would flip this read is actual Q4 FY2026 CIS revenue acceleration from the signed deployments; management expects it, while Q3 is not expected to accelerate. [Q2 FY2026 earnings call, CFO Q&A]



---

## earnings / 04_guidance-consensus.md

_Source: `04_guidance-consensus.md`_

# Guidance & Consensus — AKAM

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ Estimates Report workbook (direct pool export; Tier 5). Management guidance is checked against Akamai’s Q2 release and verbatim earnings call. |
| Data as of date | The workbook has no single snapshot timestamp. Its current Q3 normalized-EPS field is dated 2026-09-04 and its current Q3 revenue and FY2026 fields are dated 2026-09-07; both dates post-date the Q2 release on 2026-08-06. [Capital IQ Estimates Report, Guidance worksheet, `Actual/Latest Date` fields] |
| Fiscal year basis | Calendar FY2026 ending 2026-12-31; Q3 ends 2026-09-30. [Capital IQ Estimates Report, Consensus worksheet header] |
| Analyst count | Q3: revenue 22, normalized EPS 22, EBITDA 17. FY2026: revenue 24, normalized EPS 25, EBITDA 19. [Capital IQ Estimates Report, Revisions worksheet, Last Month—# of Analysts] |
| Currency | USD, reported currency; US GAAP. “Normalized EPS” is the vendor’s adjusted measure, while Akamai calls its comparable guidance non-GAAP EPS. [Capital IQ Estimates Report, Consensus worksheet] |
| Calendarization issue? | N — the direct export labels the next period FQ3 2026, and AKAM is a U.S. calendar-year reporter. |

No consensus-data cap applies: the pool contains direct Capital IQ consensus, trends, revisions, and surprise history, plus a verbatim Q2 call.

## 1A. Reporting-Basis Reconciliation

| Field | Value |
|---|---|
| Next period the company will actually FILE | Q3 2026 Form 10-Q for the three months ended 2026-09-30. |
| Expected filing date + source for that date | 2026-11-03, per the Capital IQ Estimates Report header. [Capital IQ Estimates Report, Consensus worksheet header] |
| What that filing contains | **Standalone period** — a U.S. quarterly filing, not a cumulative half-year report. |
| Vendor estimate as pulled (period label + value) | FQ3 2026 standalone: revenue $1,118.153m; normalized EPS $1.68032 per share. [Capital IQ Estimates Report, Guidance worksheet, current FQ3 2026 fields] |
| Already-reported stub inside that period | Not applicable: Q2 2026 is not part of the standalone Q3 filing. |
| Consensus restated onto the filing basis — show the arithmetic | No restatement is needed: FQ3 2026 bar = the vendor’s standalone FQ3 2026 revenue of $1,118.153m and normalized EPS of $1.68032. |
| Basis-restated bar vs the same period a year earlier | Q3 2025 actual revenue was $1,054.630m, so the revenue bar implies +6.0% year on year: $1,118.153m / $1,054.630m − 1. Q3 2025 normalized EPS was $1.86, so the EPS bar implies −9.7%: $1.68032 / $1.86 − 1. [Capital IQ Estimates Report, Surprise worksheet, FQ3 2025 actuals] |

The stub-ratio sanity check is not applicable because the filing is a standalone quarter. The vendor labels and the company reporting basis agree, so the Q3 consensus values above are the comparable bar used below.

## 2. Management Guidance

| Metric | Period | Guidance | Type (Point / Range / Qualitative) | Source |
|---|---|---|---|---|
| Revenue | Q3 2026 | $1,105m–$1,130m; midpoint $1,117.5m | Range | [Q2 2026 earnings release, Financial guidance, p.2] |
| Revenue | FY2026 | $4,445m–$4,530m; midpoint $4,487.5m | Range | [Q2 2026 earnings release, Financial guidance, p.2] |
| EBITDA | Q3 2026 | 38%–40% EBITDA (profit before interest, tax, depreciation, and amortisation) margin. At the concurrent revenue bounds, this is $419.9m–$452.0m ($1,105m × 38%; $1,130m × 40%); $435.95m midpoint. This is a derived dollar range, not a separately quoted dollar target. | Range, derived from disclosed revenue and margin ranges | [Q2 2026 earnings call, CFO prepared remarks] |
| Non-GAAP operating margin | Q3 2026 / FY2026 | 24%–26% / 25%–26% | Range | [Q2 2026 earnings release, Financial guidance, p.2] |
| Non-GAAP EPS | Q3 2026 / FY2026 | $1.60–$1.80 / $6.40–$7.05; midpoints $1.70 / $6.725 | Range | [Q2 2026 earnings release, Financial guidance, p.2] |
| Capex | Q3 2026 / FY2026 | $475m–$525m in Q3; about 40% of FY2026 revenue | Range / qualitative full-year level | [Q2 2026 earnings call, CFO prepared remarks] |
| Q3 operating inputs | Q3 2026 | Cash gross margin about 70%; non-GAAP operating expense $347m–$359m; non-GAAP depreciation $153m–$155m; tax rate about 19%; diluted shares about 150m | Range / point | [Q2 2026 earnings call, CFO prepared remarks] |
| Solution-category growth | FY2026 | CIS growth at least 50% in constant currency; Security high-single-digit constant-currency growth; Delivery and other cloud applications down mid-single digits in constant currency | Qualitative / threshold | [Q2 2026 earnings call, CFO prepared remarks] |
| FX assumption | Q3 2026 / FY2026 | Q3 revenue impact of negative $2m sequentially and negative $8m year on year; FY revenue benefit of positive $9m year on year at then-current spot rates | Point assumption | [Q2 2026 earnings call, CFO prepared remarks] |

## 3. Guidance vs Consensus Table

Gap = Street consensus minus management’s guidance midpoint. EPS compares Capital IQ normalized EPS with company non-GAAP EPS, the closest available series; the two labels are not treated as formally identical definitions. The EBITDA comparison is directional because the workbook does not supply an adjustment bridge to management’s disclosed EBITDA-margin measure.

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| Revenue | Q3 2026 | $1,105m–$1,130m; midpoint $1,117.5m | $1,118.153m | +$0.653m (+0.06%) | Street above midpoint; inside range |
| EBITDA | Q3 2026 | $419.9m–$452.0m derived range; midpoint $435.95m | $434.247m | −$1.703m (−0.39%) | Street below midpoint; inside derived range |
| Normalized / non-GAAP EPS | Q3 2026 | $1.60–$1.80; midpoint $1.70 | $1.68032 | −$0.01968 (−1.16%) | Street below midpoint; inside range |
| Revenue | FY2026 | $4,445m–$4,530m; midpoint $4,487.5m | $4,491.263m | +$3.763m (+0.08%) | Street above midpoint; inside range |
| Normalized / non-GAAP EPS | FY2026 | $6.40–$7.05; midpoint $6.725 | $6.69863 | −$0.02637 (−0.39%) | Street below midpoint; inside range |

Management guidance is from the Q2 release and call; consensus values are from the current Capital IQ Guidance worksheet. [Q2 2026 earnings release, Financial guidance, p.2; Q2 2026 earnings call, CFO prepared remarks; Capital IQ Estimates Report, Guidance worksheet, current FQ3/FY2026 fields]

## 4. Estimate Revision Momentum Table

| Estimate | 90 Days Ago | 60 Days Ago | 30 Days Ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue (next Q, FQ3 2026, $m) | 1,131.99 | 1,132.02 | 1,118.76 | 1,118.15 | Falling |
| Normalized EPS (next Q, FQ3 2026, $/share) | 1.70 | 1.70 | 1.68 | 1.68 | Falling |
| Revenue (next FY, FY2026, $m) | 4,503.31 | 4,503.40 | 4,489.93 | 4,491.26 | Falling |
| Normalized EPS (next FY, FY2026, $/share) | 6.71 | 6.71 | 6.70 | 6.70 | Falling |

The 90-day-to-current changes are modest but negative: Q3 revenue is down 1.2%, Q3 normalized EPS down 1.2%, FY2026 revenue down 0.3%, and FY2026 normalized EPS down 0.2%. The last-month FY revenue move is a $1.33m increase, but it does not reverse the lower level versus 60 and 90 days. [Capital IQ Estimates Report, Trends worksheet, FQ3 2026 and FY2026]

## 5. Revision Breadth

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue FY2026 | 3 | 1 | +2 | Last month |
| EBITDA FY2026 | 2 | 1 | +1 | Last month |
| Normalized EPS FY2026 | 2 | 2 | 0 | Last month |
| GAAP EPS FY2026 — definition cross-check | 0 | 1 | −1 | Last month |

The source-bound CIQ facts sidecar is the authoritative read for the two headline FY2026 checks: revenue revisions are 3 upward and 1 downward, while **GAAP** EPS revisions are 0 upward and 1 downward. Those values reconcile to the Revisions worksheet. The normalized-EPS row is separately shown because that is the vendor series closest to Akamai’s non-GAAP EPS guidance. [Capital IQ Estimates→Revisions (Last-Month breadth, FY), source-bound `ciq_facts.json`; Capital IQ Estimates Report, Revisions worksheet, Last Month]

## 6. Historical Beat / Miss Pattern

The table uses the Capital IQ Surprise worksheet’s final consensus for each reported quarter, rather than management’s initial guide. It therefore tests execution against the Street’s last published bar, not guidance accuracy.

| Period | Revenue Beat/Miss | EPS Beat/Miss | Magnitude | Notes |
|---|---|---|---:|---|
| Q3 2025 | Beat: $1,054.630m vs $1,043.887m (+1.03%) | Normalized EPS beat: $1.86 vs $1.63574 (+13.41%) | Revenue +$10.74m; EPS +$0.2243 | [Capital IQ Estimates Report, Surprise worksheet, FQ3 2025] |
| Q4 2025 | Beat: $1,094.912m vs $1,076.128m (+1.75%) | Normalized EPS beat: $1.84 vs $1.75044 (+5.14%) | Revenue +$18.78m; EPS +$0.0896 | [Capital IQ Estimates Report, Surprise worksheet, FQ4 2025] |
| Q1 2026 | Beat: $1,073.610m vs $1,072.735m (+0.08%) | Normalized EPS beat: $1.61 vs $1.60435 (+0.62%) | Revenue +$0.87m; EPS +$0.0057 | [Capital IQ Estimates Report, Surprise worksheet, FQ1 2026] |
| Q2 2026 | Beat: $1,099.682m vs $1,092.853m (+0.63%) | Normalized EPS beat: $1.59 vs $1.57684 (+0.63%) | Revenue +$6.83m; EPS +$0.0132 | [Capital IQ Estimates Report, Surprise worksheet, FQ2 2026] |

The four-quarter record is 4/4 normalized-EPS and revenue beats, but the size has narrowed sharply since Q3–Q4 2025. It does not prove an ongoing beat rate. The source-bound annual GAAP check is less favourable: FY2025 GAAP EPS surprise was −9% and revenue surprise was 0%; that annual GAAP result is not interchangeable with the quarterly normalized-EPS sequence above. [Capital IQ Estimates→Surprise (annual), source-bound `ciq_facts.json`]

## 7. Bar Assessment

**Bar is fair — current post-Q2 consensus, not provisional.** The Q3 revenue bar is only $0.65m (0.06%) above management’s midpoint, while normalized EPS and EBITDA are 1.16% and 0.39% below their midpoints; all three values remain within management’s ranges. Consensus has moved down modestly from 90 days ago, but FY revenue and EBITDA breadth in the last month are still positive (+2 and +1) and normalized-EPS breadth is neutral, so the evidence does not establish either a clearly low or a clearly high bar. [Capital IQ Estimates Report, Guidance, Trends, and Revisions worksheets]

The Q3 bar also needs a timing qualifier. Management said CIS growth should not accelerate in Q3 because some GPU deliveries slipped from Q2 into Q3, while it expects a large Q4 acceleration as contracted capacity starts producing revenue. Q3 consensus is therefore a fair test of the next filing, but not a complete test of the FY2026 CIS ramp. [Q2 2026 earnings call, CFO Q&A]



---

## earnings / 05_beat-miss-setup.md

_Source: `05_beat-miss-setup.md`_

# Beat / Miss Setup — AKAM

## 1. Next Reporting Period Context

AKAM is expected to file its Q3 2026 Form 10-Q for the standalone three months ended 30 September 2026, with the Capital IQ workbook indicating 3 November 2026 as the expected filing date. **FQ3 2026 bar: revenue $1,118.153m / normalized EPS $1.68032 per share (standalone three-month basis; no restatement is needed because Q2 is not part of the Q3 filing; normalized EPS is the vendor's adjusted series and only the closest available comparison to company non-GAAP EPS).** The revenue bar implies 6.0% year-on-year growth and the normalized-EPS bar a 9.7% decline versus Q3 2025; seasonality is not assessable from only six actual quarters, and consensus is nearly at management's $1,117.5m revenue midpoint and below its non-GAAP EPS midpoint, making the bar fair rather than clearly easy. [Capital IQ Estimates Report, Guidance and Consensus worksheets, current FQ3 2026 fields — vendor basis, data frozen 2026-09-14; Q2 2026 earnings release, Financial guidance, p.2]

## 2. Beat Scenarios

Likelihood labels are judgment based on the cited Q2 data, Q2 call, and 9 September management comments; they are not empirical probabilities.

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Security carries the quarter | Security adoption and cross-sell | Security must hold or improve on Q2's 10% year-on-year growth, allowing the largest category (55% of Q2 revenue) to offset the known Delivery drag and Q3's lack of CIS acceleration. | Mid | Security revenue was $604.4m, up 10% year on year in Q2, led by API security, web application firewall, and Guardicore. Management later described continuing demand in mature WAF, DDoS, and bot products. [Q2 FY2026 Form 10-Q, Item 2—Revenue, p.30; Citi 2026 Global TMT Conference, 2026-09-09, management discussion] |
| Better-than-expected Delivery retention | Delivery renewal pricing and traffic | Delivery's renewal-price decline and traffic optimisation would need to be less adverse than in Q2, helping revenue and fixed-network cost absorption. This is a partial offset, not an AI-driven Delivery rebound. | Low | Delivery and other cloud applications were $395.9m, down 6% year on year in Q2. At the September conference, management said pricing remained competitive and AI had not yet changed Delivery's byte volume at scale. [Q2 FY2026 Form 10-Q, Item 2—Revenue, p.30; Citi 2026 Global TMT Conference, 2026-09-09, management discussion] |
| Earlier CIS capacity conversion | CIS deployment and GPU availability | Recently delivered GPUs and contracted capacity would need to be installed and billable earlier than management assumed, producing more Q3 revenue even though management did not expect category-growth acceleration in Q3. | Low | Some GPU shipments slipped from Q2 into Q3, reducing the weeks of Q3 revenue from signed deals; management explicitly did not expect CIS growth acceleration in Q3. [Q2 FY2026 earnings call, 2026-08-06, CFO Q&A] |
| EPS beats within the revenue range | Colocation and operating-spend execution | Revenue would need to land near the upper half of the $1,105m–$1,130m range while non-GAAP operating expense stays near the low end of $347m–$359m and EBITDA margin reaches the upper part of the 38%–40% range. | Mid | Consensus EBITDA is $434.247m, 0.39% below management's derived $435.95m midpoint; normalized EPS consensus is 1.16% below the $1.70 non-GAAP EPS midpoint. The comparisons are directional because the vendor workbook has no adjustment bridge to management's measures. [Q2 2026 earnings call, CFO prepared remarks; Capital IQ Estimates Report, Guidance worksheet — vendor basis, data frozen 2026-09-14] |

## 3. Miss Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| CIS deployment timing slips again | GPU, colocation, and equipment deployment | Capacity arriving later than planned, or taking longer to rack and activate, would remove more Q3 revenue weeks while much of the associated spend remains in the quarter. | Mid | Q2 CapEx was below guidance because GPU shipments arrived after quarter-end and pushed planned spend into Q3. Management said Q3 would not show CIS growth acceleration because the shift reduced Q3 revenue weeks. [Q2 FY2026 earnings call, 2026-08-06, CFO prepared remarks and Q&A] |
| Delivery declines more than management assumes | Renewal price and customer traffic | Downward renewal pricing or customer optimisation would need to worsen from Q2, taking a larger-than-guided bite from the 36%-of-revenue combined Delivery and other-cloud-applications category. | Mid | The Q2 filing attributes the category's 6% decline to lower renewal pricing and customer cost optimisation. Management still said in September that Delivery pricing was competitive. [Q2 FY2026 Form 10-Q, Item 2—Revenue, p.30; Citi 2026 Global TMT Conference, 2026-09-09, management discussion] |
| Capacity costs outrun current revenue | Colocation, network build-out, and operating expenses | Revenue could remain inside guidance while colocation, equipment-related depreciation, and operating expenses leave EBITDA or EPS below the consensus bar. | Mid | Q3 CapEx is guided to $475m–$525m, or 43%–46% of revenue; Q3 cash gross margin is about 70% and non-GAAP operating margin 24%–26%. Management attributes the margin pressure to CIS capacity expansion. [Q2 FY2026 earnings call, CFO prepared remarks] |
| Security slows at the same time as Delivery weakens | Security adoption and cross-sell | Security growth would need to fall below the high-single-digit full-year direction just as Delivery remains weak, leaving no large category to offset CIS's Q3 timing limitation. | Low | Security was 55% of Q2 revenue and grew 10%, but the full-year guide is only high-single-digit constant-currency growth and no in-quarter Security KPI is disclosed. [Q2 FY2026 Form 10-Q, Item 2—Revenue, p.30; Q2 FY2026 earnings call, CFO prepared remarks] |

## 4. What Magnitude Matters?

The numerical beat/miss cut-offs below are judgment thresholds, not company guidance or measured stock-reaction thresholds. They use the last four quarterly surprise magnitudes (revenue beats of 0.08%–1.75% and normalized-EPS beats of 0.62%–13.41%) as a small, four-observation reference and therefore are not empirical frequencies. [Capital IQ Estimates Report, Surprise worksheet, FQ3 2025–FQ2 2026 — vendor basis, data frozen 2026-09-14]

| Metric | Consensus / Bar | Material Beat Threshold | Material Miss Threshold | Why |
|---|---:|---:|---:|---|
| Revenue | $1,118.153m | At least $1,123.7m (0.5% above consensus) | At most $1,112.6m (0.5% below consensus) | A $5.6m move is materially larger than the $0.653m gap between consensus and the $1,117.5m guidance midpoint, yet remains within the $1,105m–$1,130m guide range. [Q2 2026 earnings release, Financial guidance, p.2; Capital IQ Estimates Report, Guidance worksheet — vendor basis, data frozen 2026-09-14] |
| EBITDA | $434.247m vendor EBITDA | Not assessable on a matched basis; $438.6m (1% above) is only a vendor-series flag | Not assessable on a matched basis; $429.9m (1% below) is only a vendor-series flag | Management guides EBITDA margin, while the workbook's EBITDA definition has no disclosed adjustment bridge. It must not be treated as a clean comparison to GAAP-derived or company-defined EBITDA. [Q2 2026 earnings call, CFO prepared remarks; Capital IQ Estimates Report, Guidance worksheet — vendor basis, data frozen 2026-09-14] |
| EPS | $1.68032 normalized EPS | At least $1.70 | At most $1.66 | $1.70 both exceeds consensus by 1.17% and equals management's non-GAAP EPS midpoint; $1.66 is 1.21% below consensus but still within the $1.60–$1.80 guide range. Definition differences remain. [Q2 2026 earnings release, Financial guidance, p.2; Capital IQ Estimates Report, Guidance worksheet — vendor basis, data frozen 2026-09-14] |
| Guidance | FY2026 revenue guide $4.445bn–$4.530bn; midpoint $4.4875bn | Midpoint raised by at least $25m to $4.5125bn, with the Q4 CIS-ramp timing retained | Midpoint cut by at least $25m to $4.4625bn, or Q4 CIS-ramp timing deferred | The current midpoint is only $3.763m below FY2026 revenue consensus; a $25m change is a 0.56% move and would be more informative than that current gap. The timing condition matters because management places the larger CIS acceleration in Q4. [Q2 2026 earnings release, Financial guidance, p.2; Capital IQ Estimates Report, Guidance worksheet — vendor basis, data frozen 2026-09-14; Q2 FY2026 earnings call, CFO Q&A] |

## 5. In-Line Print But Bad Guidance Risk

| Risk | Evidence | Why It Matters |
|---|---|---|
| In-line Q3 but guide-down from a delayed Q4 CIS ramp | Management expected the larger CIS acceleration in Q4 after Q3 GPU-delivery delays. At the September Goldman conference, management described Q4 revenue contributions of about $15m and about $20m from two larger deals, while acknowledging that a one- or two-week delay can move timing. [Q2 FY2026 earnings call, CFO Q&A; Goldman Sachs Communacopia + Technology Conference, 2026-09-09, CFO discussion] | Q3 can meet its bar without disproving a FY2026 shortfall if the Q4 ramp moves. |
| Beat revenue but weak margin guide | Q3 CapEx guidance is $475m–$525m and management guides 24%–26% non-GAAP operating margin, with colocation investment cited as the reason for gross-margin pressure. [Q2 FY2026 earnings call, CFO prepared remarks] | A revenue beat is lower quality if incremental capacity spending prevents margin or free-cash-flow improvement. |
| Beat adjusted EPS but miss quality | Q2 GAAP diluted EPS was $0.52 versus non-GAAP diluted EPS of $1.59; the $1.07 difference reflects, among other items, stock-based compensation, depreciation/amortization, acquired-intangible amortization, restructuring, and acquisition-related items. [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet] | A normalized-EPS beat alone does not establish that GAAP operating profit or cash conversion has improved. |
| Beat revenue but working capital deteriorates | FY2025 operating working capital rose to $522.5m from $374.8m in FY2024, but no Q3 working-capital guide or billing-mix KPI is disclosed. [FY2025 Form 10-K, pp.53–56; Capital IQ Financials workbook, Balance Sheet, FY2024–FY2025 columns — vendor basis, data frozen 2026-09-14] | Not proven from available data whether a Q3 revenue beat would convert to cash; the quarterly cash-flow and balance-sheet print is needed. |

## 6. Seasonality Read

Seasonality neither helps nor hurts this setup because it is not assessable from the available history: only Q1 FY2025 through Q2 FY2026 are actual reported quarters, rather than three complete fiscal years. The setup should therefore rest on the Q3 standalone guidance and category drivers, not on an assumed third-quarter pattern. [Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet; Capital IQ Estimates Report, Guidance worksheet — vendor basis, data frozen 2026-09-14]

## 7. Historical Pattern

AKAM beat final Street revenue and normalized EPS in each of Q3 2025 through Q2 2026, but the revenue beat narrowed from 1.03% and 1.75% in Q3–Q4 2025 to 0.08% and 0.63% in Q1–Q2 2026; the recent EPS beats were also only 0.62% and 0.63%. This is judgment informed by four quarters, not a measured beat rate. It merits limited weight because the source-bound annual check shows FY2025 GAAP EPS missed by 9% while revenue was in line, which is not interchangeable with the quarterly normalized-EPS series. [Capital IQ Estimates Report, Surprise worksheet, FQ3 2025–FQ2 2026 — vendor basis, data frozen 2026-09-14; Capital IQ Estimates→Surprise (annual), source-bound `ciq_facts.json`]

## 8. Setup Verdict

**Setup is balanced.** The single most important factor is Security: it was 55% of Q2 revenue and grew 10%, so sustained Security execution has to offset both the Delivery decline and management's stated absence of CIS growth acceleration in Q3. [Q2 FY2026 Form 10-Q, Note 11, p.23; Q2 FY2026 earnings call, CFO Q&A]

The single biggest risk that could flip the setup is CIS deployment timing: later GPU, equipment, colocation, or power availability removes in-quarter revenue weeks while Q3 capacity spend and margin pressure remain. The near-midpoint revenue bar and consensus below EPS and EBITDA midpoints prevent this known risk from establishing a clear miss case. [Q2 2026 earnings release, Financial guidance, p.2; Q2 FY2026 earnings call, CFO prepared remarks and Q&A]

## 9. Second-Quarter Look-Ahead

The quarter after Q3—Q4 2026—has a different, more binary setup. Management expects the signed CIS deployments to begin contributing in Q4, with the September conference indicating about $15m and about $20m from two larger deals and further ramping in 2027; that creates more upside than Q3, but also more sensitivity to deployment dates. [Goldman Sachs Communacopia + Technology Conference, 2026-09-09, CFO discussion]

Security and Delivery remain relevant, but Q4 should be judged chiefly on whether CIS revenue actually starts to convert, not merely on signed commitments or management's long-term revenue description. [Q2 FY2026 earnings call, CFO Q&A]

## 10. Pre-Mortem

If this setup fails, the most likely error is treating signed CIS commitments and capacity commentary as Q3 revenue despite management's explicit statement that Q3 would not accelerate. A second likely error is giving too much weight to four consecutive, but shrinking, normalized-EPS beats while overlooking the risk that Delivery price/traffic weakness and capacity costs offset Security growth. [Q2 FY2026 earnings call, CFO Q&A; Capital IQ Estimates Report, Surprise worksheet, FQ3 2025–FQ2 2026 — vendor basis, data frozen 2026-09-14]



---

## earnings / 06_earnings-quality.md

_Source: `06_earnings-quality.md`_

# Earnings Quality — AKAM

US GAAP; USD millions except percentages and days. This review uses the audited FY2023–FY2025 record for the three-year bridge and the Q2 FY2026 filing as a current check.

## 1. EBITDA → CFO → FCF Bridge (3–5 years)

| Item | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---|
| EBITDA (GAAP-derived) | 1,208.1 | 1,181.8 | 1,275.6 | Stable |
| Working capital change (cash-flow operating assets and liabilities) | (130.7) | (34.3) | (173.1) | Deteriorating |
| Tax paid (cash) | (134.5) | (136.3) | (143.5) | Rising outflow |
| Interest paid (cash) | (6.3) | (20.4) | (23.3) | Rising outflow |
| Other operating items (reconciling residual) | 411.8 | 528.4 | 583.1 | Rising |
| **CFO** | **1,348.4** | **1,519.2** | **1,518.8** | Stable |
| Maintenance capex | N/D | N/D | N/D | Not disclosed |
| Growth capex | N/D | N/D | N/D | Not disclosed |
| **Total capex used** | **730.0** | **685.3** | **819.5** | Volatile |
| **FCF (CFO − Total Capex)** | **618.4** | **833.9** | **699.3** | Volatile |
| **CFO / EBITDA %** | **111.6%** | **128.5%** | **119.1%** | High, stable |

EBITDA here is GAAP income from operations plus depreciation and amortization (D&A), not the company's Adjusted EBITDA. The residual is shown rather than hidden: it equals CFO less EBITDA, cash-flow working-capital change, cash tax paid, and cash interest paid; it therefore includes the net-income-to-operating-income difference and other non-cash reconciling items, including stock-based compensation (SBC). The bridge reconstructs CFO in every year. Audited income, cash-flow, capex, working-capital, and cash-interest inputs are from the filing; the separately disclosed cash-tax field is a Capital IQ workbook read and is not presented as a filing number. [FY2025 Form 10-K, pp.54–56; Capital IQ Financials workbook, Cash Flow, FY2023–FY2025 columns — vendor basis, data frozen 2026-09-14]

Normalised operating FCF equals the FCF shown: the company's FCF definition is CFO less cash purchases of property and equipment and capitalized internal-use software, which matches the required definition, and no disclosed one-off cash inflow was identified that would inflate it. [Q2 2026 Supplemental Financial Information, Non-GAAP Definitions sheet; FY2025 Form 10-K, pp.55–56] Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow.

## 2. Cash Conversion Assessment

CFO exceeded GAAP-derived EBITDA in all three full years, at 112%, 129%, and 119%, and operating FCF remained positive at $618.4m, $833.9m, and $699.3m. This supports a cash-backed earnings read, not a cash-conversion breakdown. [FY2025 Form 10-K, pp.54–56]

The qualifier matters: cash conversion is helped by non-cash SBC of $328.5m in FY2023, $393.4m in FY2024, and $459.4m in FY2025, all added back in CFO. It supports cash flow, but it is not free to shareholders because it represents share-based employee pay and is then excluded again in management's adjusted earnings. FY2025 CFO also absorbed a $173.1m working-capital outflow, versus $34.3m in FY2024, and management cites higher cash tax payments and restructuring severance as reasons cash flow did not grow. [FY2025 Form 10-K, pp.35–36, 43, 55]

The deterministic CIQ sidecar's LTM CFO read of $1,447.2m agrees with the primary-source calculation of FY2025 CFO $1,518.8m minus H1 FY2025 CFO $710.3m plus H1 FY2026 CFO $638.8m. H1 FY2026 CFO was down 10.1% year on year, while the cash-flow working-capital outflow was $198.3m versus $132.7m. [CIQ Financials→Cash Flow “Cash from Ops.”, LTM Jun-30-2026 — vendor basis; FY2025 Form 10-K, pp.55–56; Q2 FY2026 Form 10-Q, pp.7–8]

## 3. Working Capital Trends

Period-end balances are used consistently because the frozen primary record does not provide an opening FY2023 balance-sheet comparative. DSO = 365 × period-end receivables ÷ revenue; DIO = 365 × period-end inventory ÷ COGS; DPO = 365 × period-end payables ÷ COGS. Akamai reports no inventory balance, so DIO is set to 0.0 rather than estimated. DIO and DPO use COGS, not revenue.

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO) | 69.4 | 66.5 | 68.8 | Deteriorated in FY2025 | Medium — FY2025 receivables rose 9.1% while revenue rose 5.4%; DSO rose 3.4%, below the 10% flag threshold. |
| Inventory days (DIO) | 0.0 | 0.0 | 0.0 | N/A | Low — no inventory balance is reported. |
| Payable days (DPO) | 35.5 | 29.4 | 26.4 | Falling | Low — lower DPO is not evidence of supplier stretching. |
| Cash conversion cycle (DSO + DIO − DPO) | 33.9 | 37.2 | 42.4 | Deteriorating | Medium — FY2025 lengthened 5.2 days. |

The FY2024 and FY2025 receivables, payables, deferred-revenue and income-statement inputs are audited; FY2023 balances are from the source-bound vendor workbook because the FY2025 10-K does not include a FY2023 balance sheet. [FY2025 Form 10-K, pp.53–54; Capital IQ Financials workbook, Balance Sheet, FY2023 column — vendor basis, data frozen 2026-09-14]

Deferred revenue (current plus non-current contract liabilities) fell 4.1% to $168.3m in FY2025 from $175.5m in FY2024, while revenue grew 5.4%. This is a modest negative signal rather than proof of revenue-recognition failure: contract liabilities are customer prepayments for unsatisfied services and make up a limited share of annual revenue. [FY2025 Form 10-K, pp.53–54, Note 16 pp.82–83]

## 4. Non-GAAP Adjustments

| Adjustment | Amount | Recurring? (Y/N) | Concern Level (Low / Mid / High) | Evidence |
|---|---:|---|---|---|
| Stock-based compensation | 459.4 (FY2025) | Y | High | Added back in non-GAAP operating income, net income, and Adjusted EBITDA; it equals 102% of FY2025 GAAP net income. [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet, FY2025 column] |
| Amortization of acquired intangible assets | 111.1 (FY2025) | Y | Mid | Increased from $66.8m in FY2023 and $92.1m in FY2024 as acquired-intangible amortization. [FY2025 Form 10-K, p.54; Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet, FY2025 column] |
| Amortization of capitalized SBC and interest | 50.9 (FY2025) | Y | Mid | Excluded from non-GAAP measures; the underlying capitalized SBC has risen each year. [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet, FY2025 column; FY2025 Form 10-K, p.34] |
| Restructuring charge | 58.1 (FY2025) | Y | Mid | Excluded as a non-GAAP item and incurred in each of FY2023–FY2025. [FY2025 Form 10-K, pp.35–36, 54] |
| Acquisition-related costs | 3.2 (FY2025) | Y | Low | Excluded, but small relative to revenue and operating income. [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet, FY2025 column] |
| Legal settlements | 4.0 (FY2025) | N from available record | Low | Excluded; the supplied FY2025 reconciliation shows a single $4.0m amount. [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet, FY2025 column] |

The adjustment burden is material: FY2025 non-GAAP income from operations was $1,253.6m versus GAAP operating income of $566.9m, a $686.7m increase. Its largest component is recurring SBC, not a one-time cash charge. [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet, FY2025 column]

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification (Genuine / Suspicious / Recurring "one-off") | Evidence |
|---|---|---:|---|---|
| Restructuring: facilities exit and workforce actions | FY2023 | 56.6 | Recurring "one-off" | The FlexBase and headcount actions included facility impairments, severance, and other changes. [FY2025 Form 10-K, p.36; p.54] |
| Restructuring: redeployment and acquisition-related actions | FY2024 | 95.4 | Recurring "one-off" | Included severance and impairment of acquired intangible assets and capitalized internal-use software. [FY2025 Form 10-K, p.36; p.54] |
| Restructuring: Q4 2025 action | FY2025 | 58.1 | Recurring "one-off" | Included headcount reductions and impairments of acquired intangible assets and capitalized internal-use software. [FY2025 Form 10-K, pp.35–36, 54] |
| Legal settlement | FY2025 | 4.0 | Genuine from available record | Separately excluded in the FY2025 non-GAAP reconciliation; recurrence is not proven from the supplied record. [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet, FY2025 column] |

Management expects no material additional charge from each named restructuring action, but a new restructuring action has occurred in each of the last three years. The conclusion is therefore that the individual programmes may end, not that restructuring cost is absent from the recurring earnings record. [FY2025 Form 10-K, pp.35–36]

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | N | FY2024 revenue rose 4.7% while CFO rose 12.7%; FY2025 revenue rose 5.4% while CFO was essentially flat. Only one of the two observed years meets the condition. [FY2025 Form 10-K, pp.54–56] |
| Receivables growing faster than revenue | Y | FY2025 receivables rose to $793.7m from $727.7m (+9.1%), ahead of revenue growth of 5.4%. [FY2025 Form 10-K, pp.53–54] |
| Inventory growing faster than COGS | N | No inventory balance is reported in the audited balance sheet. [FY2025 Form 10-K, p.53] |
| Deferred revenue declining (if subscription/contract business) | Y | Contract liabilities/deferred revenue fell to $168.3m from $175.5m (−4.1%) in FY2025, although the company sells mainly contracted services. [FY2025 Form 10-K, pp.53, 82–83] |
| Capitalized costs growing as % of revenue | Y | Capitalized SBC was $77.0m, $99.6m, and $114.8m in FY2023–FY2025: 2.02%, 2.50%, and 2.73% of revenue. [FY2025 Form 10-K, p.34; p.54] |
| Frequent accounting policy changes | N | No material accounting-policy change is identified in the FY2025 10-K or Q2 FY2026 10-Q reviewed; this is not a claim that no future change can occur. [FY2025 Form 10-K, Note 2 pp.61–64; Q2 FY2026 Form 10-Q, Note 1 p.10] |

RF-EQ-001 (rising accruals divergent from cash earnings)

The tag is triggered by three table rows. It should be read with its scale: FY2025 cash conversion remained above 100%, but receivables, deferred revenue, and capitalization trends require the next filings to show that cash collection and expense recognition remain aligned with reported growth.

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA | 1,275.6 GAAP-derived | 1,801.6 Adjusted EBITDA | 526.1 | 41.2% | Mostly Y | GAAP-derived EBITDA = operating income plus D&A; company-defined Adjusted EBITDA removes SBC, acquired-intangible amortization, restructuring, interest, taxes, and other items. [FY2025 Form 10-K, pp.54–55; Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation and Non-GAAP Definitions sheets] |
| EBIT | 566.9 GAAP operating income | 1,253.6 non-GAAP income from operations | 686.7 | 121.1% | Mostly Y | The reconciliation excludes recurring SBC, amortization, and restructuring. [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet, FY2025 column] |
| Net income | 452.0 GAAP | 1,046.4 non-GAAP | 594.4 | 131.5% | Mostly Y | Includes the tax effect of the adjustments and certain discrete tax items. [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation and Non-GAAP Definitions sheets, FY2025 column] |
| EPS | 3.07 GAAP diluted | 7.12 non-GAAP diluted | 4.05 | 131.9% | Mostly Y | Non-GAAP EPS reflects the same adjustments; share-count treatment can also differ when note-hedge transactions are in the money. [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation and Non-GAAP Definitions sheets, FY2025 column] |

## 8. Accounting Trap Checklist

| Trap | Triggered? (Y/N) | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | FY2025 non-GAAP results exclude $459.4m of SBC, and H1 FY2026 excludes $275.0m. [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet] | 75 |
| Restructuring costs recur every year | Y | Charges were $56.6m, $95.4m, and $58.1m in FY2023–FY2025. [FY2025 Form 10-K, pp.35–36, 54] | 65 |
| Capitalized costs rising faster than revenue | Y | Capitalized SBC rose from 2.02% to 2.73% of revenue over FY2023–FY2025. [FY2025 Form 10-K, p.34; p.54] | 50 |
| Receivable factoring / supplier finance disclosed | N | Not disclosed in the reviewed cash-flow, revenue-recognition, and financing disclosures; absence of a disclosure is not proof that no arrangement exists. [FY2025 Form 10-K, pp.55–56, 61–64] | 0 |
| Inventory write-downs or reserve releases | N | No inventory balance is reported, and no inventory reserve release is identified in the reviewed record. [FY2025 Form 10-K, p.53] | 0 |
| Revenue recognized before cash collection risk is clear | N | Unbilled receivables are normally billed within one month, and accounts with payment no longer reasonably assured move to a cash-basis reserve. [FY2025 Form 10-K, pp.46, 63–64] | 20 |
| Change in useful life / depreciation assumptions | N | The company periodically reviews useful lives, but no material change is identified in the reviewed periods. [FY2025 Form 10-K, pp.48, 64] | 15 |
| Tax rate unusually low or boosted by one-off | N | FY2025 GAAP tax expense was $150.4m on $602.4m pre-tax income (about 25%); the H1 FY2026 reconciliation references discrete tax items but does not quantify a GAAP tax benefit that would support this trigger. [FY2025 Form 10-K, p.54; Q2 2026 Supplemental Financial Information, Non-GAAP Definitions sheet] | 20 |
| Large fair-value / mark-to-market gains | N | FY2025 gain on investments was $9.4m, not large relative to $452.0m GAAP net income. [FY2025 Form 10-K, p.55; Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet] | 10 |

## 9. Earnings Quality Score

**63 / 100 — Mostly clean but some working-capital or adjustment noise.** The score is supported by three years of positive FCF and CFO/GAAP-derived EBITDA above 100%. It is held near the bottom of this band because non-GAAP profit removes recurring SBC and recurring restructuring costs, while receivables, deferred revenue, and capitalized SBC create three accrual-quality flags. [FY2025 Form 10-K, pp.34–36, 53–56; Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet]

## 10. The Single Biggest Quality Concern

The largest concern is that adjusted profit is a poor proxy for per-share economic earnings. FY2025 non-GAAP operating income was more than double GAAP operating income because it removed $459.4m of SBC, plus other adjustments; SBC alone exceeded FY2025 GAAP net income of $452.0m. CFO and FCF are real cash measures, but their strength is partly produced by adding this non-cash employee expense back. The report should therefore lead with GAAP and cash FCF, not management's adjusted EPS or Adjusted EBITDA, until share dilution and the rising capitalization of SBC are shown to be economically contained. [FY2025 Form 10-K, pp.34, 54–56; Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet, FY2025 column]



---

## earnings / 07_earnings-sensitivity.md

_Source: `07_earnings-sensitivity.md`_

# Earnings Sensitivity — AKAM

US GAAP; USD millions except percentages and basis points (bps). All quantified impacts are illustrative **GAAP-derived EBITDA** sensitivities for one Q2 FY2026-sized quarter. GAAP-derived EBITDA here is income from operations plus depreciation and amortization, or $265.8m in Q2 FY2026; it is not Akamai's company-defined Adjusted EBITDA. They are not forecasts or a financial model.

## 1. Variable Selection

The five variables below come from the highest-magnitude rows in the revenue and margin-driver tables: Security adoption, CIS deployment and its capacity cost, Delivery renewal price/traffic, and the payroll/SBC-led operating-cost base. The business-model external-dependency read also identifies data-centre capacity, power, and server supply as high exposure, so it is included through the CIS-capacity row. Category profit is not disclosed; consequently, the three category-revenue impacts use Q2's **consolidated** 55.8% GAAP gross margin and hold non-cost-of-revenue operating expenses unchanged. That is an inference, not a filing measure of category EBITDA. The CIQ sidecar's present $1,079.9m LTM EBITDA is a vendor definition and is not substituted for the $1,184.1m GAAP-derived TTM build in the historical-financials report; this report instead uses the directly reported Q2 baseline. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), pp. 5, 30, 32–34; data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, prepared remarks and Q&A; CIQ Financials→Income Statement, EBITDA, LTM Jun. 30 2026 — vendor basis]

## 2. Sensitivity Table

| Variable | Base Case | Move Basis | Bull Case | EPS/EBITDA Impact (bull) | Bear Case | EPS/EBITDA Impact (bear) | Mitigation assumed | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|---|
| Payroll, SBC and non-cost-of-revenue operating expenses (R&D, S&M, G&A) | $506.6m, 46.1% of Q2 revenue | The Q2 year-on-year expense-ratio rise was 441 bps: 46.1% less 41.7%; at Q2 revenue this is $48.5m | Return to 41.7% of revenue (−441 bps) | +$48.5m GAAP-derived EBITDA | A further +441-bp expense-ratio shock to 50.5% of revenue | −$48.5m GAAP-derived EBITDA | 0% — bound; the filing identifies headcount, merit and benefit-plan costs but gives no realised cost-offset rate | Medium — historical reported expense ratio; the symmetric bear is an inference | Q2 R&D, S&M and G&A were $148.8m, $170.0m and $187.7m, each up faster than revenue. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), pp. 5, 33–34] |
| Cost of revenue, including CIS capacity build-out (aggregate proxy; the filing does not isolate CIS) | $485.9m, 44.2% of Q2 revenue / 55.8% gross margin | Q2 cost-of-revenue ratio was 331 bps above Q2 FY2025; $1,099.7m × 3.31% = $36.4m | Return to Q2 FY2025's 40.9% cost ratio / 59.1% gross margin | +$36.4m GAAP-derived EBITDA | A further +331-bp cost-ratio shock to 47.5% | −$36.4m GAAP-derived EBITDA | 0% — bound — realised offset not computable from the pool; efficiency and vendor-renewal mitigation is disclosed but not measured | Medium for total cost sensitivity; Low for attributing it to CIS | Co-location rose 14%, bandwidth 17%, and network build-out/support 28%; total cost of revenue rose 14% versus revenue growth of 5%. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), pp. 5, 28, 32] |
| Security adoption and cross-sell | $604.4m Q2 revenue, 55.0% of total | Q2 Security revenue rose $52.5m, or 10% year on year | Another 10% increase: +$60.4m revenue | +$33.7m GAAP-derived EBITDA proxy ($60.4m × 55.8% consolidated gross margin) | Return to Q2 FY2025 revenue of $551.9m: −$52.5m revenue | −$29.3m GAAP-derived EBITDA proxy ($52.5m × 55.8%) | 0% — bound — realised offset not computable; assumes the current consolidated gross margin and no change in operating expenses, not a Security margin | Low — Security margin and incremental operating cost are undisclosed | API security, web application firewall and Guardicore drove the 10% Security increase. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11 p. 23; Item 2 p. 30] |
| CIS deployment and conversion of signed commitments | $99.3m Q2 revenue, 9.0% of total | Q2 CIS revenue rose $27.9m, or 39% year on year | Repeat the reported 39% increase: +$38.7m revenue | +$21.6m GAAP-derived EBITDA proxy ($38.7m × 55.8%) | Return to Q2 FY2025 revenue of $71.5m: −$27.9m revenue | −$15.5m GAAP-derived EBITDA proxy ($27.9m × 55.8%) | 0% — bound — realised offset not computable; assumes current consolidated gross margin and no change in operating expenses | Low — CIS margin, capacity cost and conversion rate are undisclosed | Large CIS deals usually take six to nine months from signing to revenue, while capacity, space, power and equipment can constrain the ramp. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11 p. 23; Item 2 p. 30; data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, prepared remarks and Q&A] |
| Delivery renewal pricing and traffic usage | $395.9m Q2 revenue, 36.0% of total | Q2 Delivery and other cloud applications fell $24.2m, or 6% year on year, from lower renewal pricing and customer traffic optimisation | Return to Q2 FY2025 revenue of $420.1m: +$24.2m revenue | +$13.5m GAAP-derived EBITDA proxy ($24.2m × 55.8%) | Another 6% decline: −$23.8m revenue | −$13.3m GAAP-derived EBITDA proxy ($23.8m × 55.8%) | 0% — bound — realised offset not computable; assumes current consolidated gross margin and no operating-expense response | Low — Delivery category margin and the price-versus-traffic split are undisclosed | The 10-Q names downward renewal pricing and customer cost optimisation as contributors to the 6% decline. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11 p. 23; Item 2 pp. 28, 30] |

The $48.5m, $36.4m, and category-revenue calculations are transparent bounds rather than estimates of expected earnings. For example, the payroll/SBC row is `(46.063% − 41.656%) × $1,099.682m = $48.5m`; the Security row is `$604.436m × 10% × 55.8% = $33.7m`. No realised mitigation rate can be computed from the pool. The company describes bandwidth efficiency, improved provider pricing and CIS contract price mechanisms, but does not disclose their coverage or realised earnings offset. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), pp. 28, 32; data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, Q&A]

No `sensitivity_summary.json` is emitted. None of the earnings rows has a clean company-disclosed or defensibly derived *per-unit* EBITDA coefficient: the category rows use an aggregate-margin bound and the cost rows are ratio shocks. The filing's 100-bp interest-rate disclosure moves available-for-sale security fair value by about $25.8m, not earnings, so it is outside this earnings sidecar. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Item 3—Interest Rate Risk, p. 43]

## 3. Sensitivity Ranking

| Rank | Variable | Absolute Impact (avg of bull + bear) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | Payroll, SBC and non-cost-of-revenue operating expenses | $48.5m per Q2-sized quarter | Rising faster than revenue |
| 2 | Cost of revenue / CIS-capacity aggregate proxy | $36.4m per Q2-sized quarter | Rising faster than revenue |
| 3 | Security adoption and cross-sell | $31.5m per Q2-sized quarter | Improving |
| 4 | CIS deployment and conversion | $18.6m per Q2-sized quarter | Improving, but capacity-constrained |
| 5 | Delivery renewal pricing and traffic usage | $13.4m per Q2-sized quarter | Deteriorating |

Ranks 1–2 are direct reported-cost sensitivities. Ranks 3–5 are low-confidence aggregate-margin proxies, so their apparent precision must not be used to infer category profitability or added to ranks 1–2. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), pp. 5, 23, 30, 32–34]

## 4. The Single Highest-Sensitivity Variable

The biggest directly measurable variable is the payroll, SBC and operating-expense ratio. It is partly company-controlled: hiring, compensation and sales investment are management choices, although merit increases and the retirement benefit are already in the cost base. R&D, S&M and G&A consumed 46.1% of Q2 revenue, 441 bps more than a year earlier; reversing that reported ratio gap would add $48.5m to a Q2-sized quarter's GAAP-derived EBITDA, while another same-sized gap would subtract it. The adverse sensitivity would occur if these costs again rise materially faster than revenue; it is a mirrored historical shock, not a claim that it will occur. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), pp. 5, 33–34]

## 5. Interaction Effects

CIS conversion and capacity cost move together but on different clocks. The company says co-location cost can precede associated revenue by about one quarter, and five to six months in longer ramps; large contract signing to revenue normally takes six to nine months. A delayed CIS ramp can therefore combine a lower CIS-revenue outcome with higher capacity cost. Delivery weakness can further reduce fixed-cost absorption. Conversely, Security and CIS growth can help the revenue denominator, but their category margins are not disclosed. Do not add the CIS revenue, capacity-cost, and Delivery rows: that would double count overlapping cost and utilisation effects. [data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, CFO Q&A; data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), pp. 28, 30, 32]

## 6. Non-Linear Or Asymmetric Risks

The material asymmetry is capacity timing. Management reported GPU capacity sold out and identifies data-centre space, power and equipment delivery as deployment constraints. A small delay can defer CIS revenue while co-location, bandwidth and build-out costs are already recognised; this is worse than a symmetric revenue change. Delivery's lower renewal price and traffic can also hurt more than the gross-margin proxy suggests if network and operating costs cannot fall quickly. The pool does not quantify either category's cost flexibility, so the table's 0%-mitigation cases are bounds, not expected outcomes. [data/AKAM/Akamai Technologies, Inc., Q2 2026 Earnings Call, 2026-08-06, prepared remarks and Q&A; data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), pp. 28, 30, 32, 52]

## 7. Earnings Volatility Score

**62 / 100 — higher = WORSE.** Earnings sensitivity is high: Q2 revenue rose 5.4% year on year while GAAP-derived EBITDA fell 18.7%, and the largest current variables are the investment-driven cost base and capacity timing. The absence of category margins and realised pass-through data makes the quantified revenue sensitivities low confidence. [data/AKAM/Supplemental Financial Information, 2nd Quarter 2026.xlsx, Supplemental Metrics sheet; data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), pp. 28, 30, 32–34]



---

## earnings / 08_earnings-red-flags.md

_Source: `08_earnings-red-flags.md`_

# Earnings Red Flags — AKAM

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 02_revenue-drivers | Security is the largest current revenue driver. | Security was $604.4m, 55.0% of Q2 revenue, and grew 10% year on year; its growth added 5.03 percentage points to company growth. [Q2 2026 Form 10-Q, Note 11 and Item 2, pp.23, 30] | High |
| 02_revenue-drivers | CIS has a material contracted conversion pipeline. | CIS revenue grew 39% to $99.3m and management reported more than $2.8bn of signed 2026 multi-year CIS commitments, but said large deals generally take six to nine months to become revenue. [Q2 2026 Form 10-Q, Item 2, p.30; Q2 2026 earnings call, prepared remarks and Q&A] | Medium |
| 04_guidance-consensus | The Q3 consensus bar is within management guidance. | Q3 revenue consensus of $1,118.153m is $0.653m above the $1,117.5m guidance midpoint; normalized EPS consensus of $1.68032 is below the $1.70 non-GAAP midpoint. [Q2 2026 earnings release, Financial guidance, p.2; Capital IQ Estimates Report, Guidance worksheet] | Medium |
| 06_earnings-quality | Cash flow is positive and historically exceeded GAAP-derived EBITDA. | FY2023–FY2025 CFO/GAAP-derived EBITDA was 111.6%, 128.5%, and 119.1%; FCF, defined as CFO less total capex, was positive in all three years. [FY2025 Form 10-K, pp.54–56] | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | Reported profitability is falling despite revenue growth. | Q2 revenue grew 5.4% year on year, while gross margin fell 331 bps, GAAP-derived EBITDA fell 18.7%, and GAAP diluted EPS fell 26.8%. [Q2 2026 Form 10-Q, p.5; Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet] | High |
| 02_revenue-drivers | Delivery remains a material offset. | Delivery and other cloud applications were 36.0% of Q2 revenue and fell 6% from lower renewal pricing and customer traffic optimization. [Q2 2026 Form 10-Q, Item 2, p.30] | High |
| 03_margin-drivers | CIS build-out costs are ahead of revenue. | Cost of revenue rose 14%, including co-location +14%, bandwidth +17%, and network build-out/support +28%, against 5% revenue growth. [Q2 2026 Form 10-Q, pp.5, 32] | High |
| 05_beat-miss-setup | An in-line Q3 can still leave FY2026 at risk. | Management said CIS growth would not accelerate in Q3; September conference commentary placed roughly $15m and $20m of Q4 revenue on two larger deployments whose timing can move by one or two weeks. [Q2 2026 earnings call, Q&A; Goldman Sachs Communacopia + Technology Conference, 2026-09-09, CFO discussion] | High |
| 06_earnings-quality | Adjusted profit excludes recurring costs. | FY2025 non-GAAP operating income was $1,253.6m versus GAAP operating income of $566.9m; the reconciliation excluded $459.4m of recurring stock-based compensation (SBC). [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| Solution-category costs, margins, capex, and profit | 01_historical-financials; 02_revenue-drivers; 03_margin-drivers | Security, Delivery, and CIS can be measured for revenue but not for incremental profitability or return on the cloud build. [Q2 2026 Form 10-Q, Note 14, p.25] |
| More than six actual quarterly observations | 00_earnings-data-triage; 01_historical-financials; 05_beat-miss-setup | Seasonality and a durable beat/miss base rate are not assessable. [Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet] |
| A reconciled bridge from management's CapEx and EBITDA measures to cash capex and vendor EBITDA | 03_margin-drivers; 04_guidance-consensus | Margin, FCF, leverage, and consensus-comparison conclusions cannot use those measures interchangeably. [Q2 2026 earnings call, CFO prepared remarks; Q2 2026 Form 10-Q, p.7; Capital IQ Estimates Report, Guidance worksheet] |
| Realised CIS cost recovery and the revenue share covered by price mechanisms | 03_margin-drivers; 07_earnings-sensitivity; 06_value-chain | The reported cost pressure cannot be translated into a measured margin recovery rate. [Q2 2026 earnings call, CFO Q&A] |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 01_historical-financials | FY2025 GAAP-derived EBITDA is $1,275.6m; the audited calculation uses operating income plus reported D&A. | Capital IQ Financials read recorded by 01 / 07_earnings-sensitivity | FY2025 vendor EBITDA is $1,180.9m; LTM vendor EBITDA is $1,079.9m. | N — definitions/reclassification have not been bridged. | The audited GAAP-derived build for GAAP trend work; neither definition should be substituted into the other. [FY2025 Form 10-K, pp.54–56; CIQ Financials→Income Statement, FY2025 and LTM Jun. 30 2026 — vendor basis] |
| 02_revenue-drivers | CIS commitments are a future acceleration lever. | 05_beat-miss-setup | Management does not expect CIS growth acceleration in Q3 because capacity delivery timing removed revenue weeks. | Y — they apply to different time windows. | The Q3 timing statement controls the next-quarter setup; signed commitments matter more for Q4 and later. [Q2 2026 earnings call, Q&A] |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status (Triggered / Not Triggered / Unclear / Unavailable) | Severity (Critical / High / Medium / Low) | Probability (High / Medium / Low / Unknown) | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Solution-category P&L, margins, assets, and capex are not disclosed. | Triggered | High | High | Akamai has one reportable segment and does not disclose economic-category costs, operating profit, assets, or capital expenditure. [Q2 2026 Form 10-Q, Note 14, p.25] | The claimed mix shift cannot establish that Security or CIS improves group profitability, or that CIS earns an adequate return. |
| Only six actual reported quarters are available. | Triggered | Medium | High | The pool contains Q1 2025 through Q2 2026 actual quarterly data, not three full fiscal years or eight quarters. [Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet; 00_earnings-data-triage output, §3] | Seasonality and a durable quarterly surprise base rate are not assessable. |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Revenue growth is accompanied by sharply worse reported profitability. | Triggered | High | High | Q2 revenue rose 5.4% year on year, but gross margin fell 331 bps to 55.8%, GAAP-derived EBITDA fell 18.7%, and GAAP diluted EPS fell 26.8%. [Q2 2026 Form 10-Q, p.5; Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet] | A revenue-growth or adjusted-EPS beat does not demonstrate an earnings acceleration. |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Delivery renewal-price pressure and traffic optimization persist in a material revenue category. | Triggered | High | High | Delivery and other cloud applications were $395.9m, 36.0% of Q2 revenue, down 6%; the filing attributes the decline to lower renewal pricing and customer cost optimization that reduced traffic. [Q2 2026 Form 10-Q, Item 2, p.30] | Security must offset a large, shrinking category; the exact split between price and traffic is undisclosed. |
| CIS commitments have material deployment and revenue-recognition timing risk. | Triggered | High | High | Management said large CIS deals normally take six to nine months from signing to revenue, GPU shipments slipped into Q3, and it did not expect CIS growth acceleration in Q3. [Q2 2026 earnings call, prepared remarks and Q&A] | Signed commitments should not be treated as Q3 revenue; a delay removes revenue weeks while capacity costs remain. |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Capacity and operating costs are rising materially faster than revenue. | Triggered | High | High | Q2 cost of revenue rose 14%, R&D 18%, sales and marketing 16%, and G&A 15%, versus 5% revenue growth; GAAP EBIT margin fell 721 bps to 7.3%. [Q2 2026 Form 10-Q, pp.5, 32–34] | The cost base can cause an EBITDA or EPS miss even if revenue remains inside guidance. |
| CIS cost recovery is not measured. | Triggered | Medium | High | Management describes price mechanisms in some large CIS contracts, but the covered revenue share and realised recovery are undisclosed; co-location cost can precede revenue by about one quarter or longer. [Q2 2026 earnings call, CFO Q&A] | A margin-recovery narrative is not proven from available data. |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Revision momentum is modestly negative despite the Q3 bar sitting near the guidance midpoint. | Triggered | Medium | High | Q3 revenue and normalized EPS consensus are each down 1.2% over 90 days; FY2026 GAAP EPS revision breadth is 0 upward / 1 downward in the last month. [Capital IQ Estimates Report, Trends and Revisions worksheets; CIQ facts sidecar — eps_revisions, present] | Consensus does not provide a clear cushion against execution risk, even though it is not above guidance. |
| The Q3 EPS and EBITDA consensus comparisons lack a complete definition bridge. | Unclear | Medium | High | Capital IQ normalized EPS is only the closest vendor series to company non-GAAP EPS; vendor EBITDA has no disclosed bridge to management's guided EBITDA-margin measure. [04_guidance-consensus output, §§2–3] | Small apparent gaps to guidance must not be read as precise beatability evidence. |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The apparent four-quarter beat record is narrow and not a measured base rate. | Triggered | Medium | High | Revenue beats narrowed from 1.03% and 1.75% in Q3–Q4 2025 to 0.08% and 0.63% in Q1–Q2 2026; recent normalized-EPS beats were 0.62% and 0.63%. [Capital IQ Estimates Report, Surprise worksheet, FQ3 2025–FQ2 2026] | Four shrinking adjusted-series beats do not establish recurring upside to consensus. |
| An in-line Q3 can still be followed by a Q4 CIS-ramp guide-down. | Triggered | High | High | The larger CIS acceleration is expected in Q4, while two larger-deal contributions discussed in September were about $15m and $20m and can move with a one- or two-week delay. [Q2 2026 earnings call, Q&A; Goldman Sachs Communacopia + Technology Conference, 2026-09-09, CFO discussion] | A Q3 beat or in-line print is not a full test of the FY2026 earnings setup. |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Non-GAAP earnings exclude large recurring SBC and other recurring items. | Triggered | High | High | FY2025 non-GAAP operating income was $1,253.6m versus $566.9m GAAP; the reconciliation excludes $459.4m of SBC, which exceeded FY2025 GAAP net income of $452.0m. [Q2 2026 Supplemental Financial Information, GAAP to Non-GAAP Reconciliation sheet; FY2025 Form 10-K, p.54] | An adjusted-EPS beat can overstate the economic earnings available per share. |
| Working-capital indicators have weakened, although cash conversion remains positive. | Triggered | Medium | High | FY2025 receivables rose 9.1% against 5.4% revenue growth, contract liabilities fell 4.1%, and H1 2026 CFO fell 10.1% while working-capital outflow rose to $198.3m from $132.7m. [FY2025 Form 10-K, pp.53–56, 82–83; Q2 2026 Form 10-Q, pp.7–8] | The next cash-flow and balance-sheet print must confirm that reported growth converts to cash. |
| Restructuring and product-retirement costs recur. | Triggered | Medium | High | Restructuring charges were $56.6m, $95.4m, and $58.1m in FY2023–FY2025; FY2024 and FY2025 actions included ending solutions and impairing prior technology or software assets. [FY2025 Form 10-K, Note 10, pp.74–75] | Prior investment write-downs raise the execution bar for the new cloud-capacity spend. |
| H1 2026 tax rate makes net-income comparison less clean. | Triggered | Medium | High | H1 effective tax rate was 16.4% versus 30.3%, mainly from excess SBC tax benefit, a state-credit valuation-allowance change, and higher R&D-credit benefit. [Q2 2026 Form 10-Q, Note 12 and Item 2, p.35] | Reported net-income improvement can contain a tax benefit rather than operating improvement. |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| CIS deployment delay and capacity cost can move together adversely, without a disclosed earnings sensitivity. | Triggered | High | High | Co-location cost can precede revenue by about one quarter and sometimes five to six months; large deals take six to nine months to recognize revenue. [Q2 2026 earnings call, CFO Q&A] | Downside is asymmetric: delayed revenue can coincide with already-incurred co-location, bandwidth, and build-out cost. |
| Category earnings sensitivities are low-confidence zero-mitigation bounds. | Triggered | Medium | High | Security, CIS, and Delivery sensitivity rows use consolidated gross margin because category margins and realised mitigation are not disclosed; the sensitivity agent labels them bounds, not forecasts. [07_earnings-sensitivity output, §§1–2] | Do not add or rely on the dollar sensitivity rows as a forecast of category EBITDA. |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Vendor EBITDA and operating-income figures materially differ from the audited GAAP-derived figures. | Triggered | High | High | FY2025 CIQ EBITDA is $1,180.9m versus $1,275.6m GAAP-derived, a $94.7m difference; CIQ operating income is $628.2m versus audited GAAP operating income of $566.9m. [CIQ Financials→Income Statement, FY2025 — vendor basis; FY2025 Form 10-K, p.54] | Leverage, FCF, and valuation work must retain each definition and cannot silently combine them. |
| Management's $347m Q2 “CapEx” is not reconciled to $225.8m cash purchases of property/equipment and capitalized software. | Unclear | Medium | High | The filing reports $225.8m of Q2 cash capital expenditure, while management described $347m of Q2 CapEx; the frozen disclosures provide no reconciliation. [Q2 2026 Form 10-Q, p.7; Q2 2026 earnings call, CFO prepared remarks] | The apparent CapEx trend and cash FCF effect are not comparable until the definitions are bridged. |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| “Earnings accelerating” is not supported by reported profitability or the stated Q3 CIS timing. | Triggered | High | High | Q2 revenue grew 5.4% but gross margin, GAAP-derived EBITDA, and GAAP EPS fell; management said CIS growth would not accelerate in Q3. [Q2 2026 Form 10-Q, p.5; Q2 2026 earnings call, Q&A] | The appropriate earnings framing is mixed and timing-dependent, not a proven positive inflection. |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Data completeness | Solution-category P&L, margins, assets, and capex absent | Triggered | High | High | No proof that the revenue mix shift improves earnings or return on cloud spend. |
| 2 | Historical trend | Revenue growth with sharply weaker reported profitability | Triggered | High | High | Revenue and adjusted-EPS results can overstate the underlying earnings trend. |
| 3 | Revenue | Delivery renewal pricing and traffic pressure | Triggered | High | High | A 36%-of-revenue category remains a material drag. |
| 4 | Revenue | CIS conversion and deployment timing | Triggered | High | High | Signed commitments are not Q3 revenue and may slip while costs remain. |
| 5 | Margins | Costs rising faster than revenue | Triggered | High | High | An EPS or EBITDA miss can occur inside revenue guidance. |
| 6 | Beat / miss | In-line Q3 can still precede a Q4 CIS-ramp guide-down | Triggered | High | High | The next print is not a full FY2026 test. |
| 7 | Earnings quality | Recurring SBC and other costs excluded from non-GAAP earnings | Triggered | High | High | Adjusted EPS is not a clean measure of per-share economic earnings. |
| 8 | Sensitivity | Delayed CIS revenue and capacity cost can coincide | Triggered | High | High | Downside is asymmetric and not cleanly quantified. |
| 9 | Source conflicts | CIQ and audited profit definitions differ materially | Triggered | High | High | Mixed-definition leverage, FCF, or valuation conclusions would be unreliable. |
| 10 | Narrative | Positive earnings inflection is not demonstrated | Triggered | High | High | The setup should be framed as mixed and timing-dependent. |
| 11 | Data completeness | Six-quarter history limits seasonality and base rates | Triggered | Medium | High | A seasonal or repeat-beat conclusion lacks support. |
| 12 | Margins | Realised CIS cost recovery not disclosed | Triggered | Medium | High | Margin recovery cannot be assumed. |
| 13 | Guidance / consensus | Estimates drifted modestly lower | Triggered | Medium | High | Consensus gives no clear cushion against execution risk. |
| 14 | Guidance / consensus | Vendor normalized EPS and company non-GAAP EPS lack a bridge | Unclear | Medium | High | Small guide-to-consensus gaps are directional only. |
| 15 | Beat / miss | Four observed beats are shrinking and too few for a base rate | Triggered | Medium | High | Past beats provide limited support for a Q3 beat call. |
| 16 | Earnings quality | Working-capital signals weakened despite positive cash conversion | Triggered | Medium | High | Cash conversion needs confirmation in the next filing. |
| 17 | Earnings quality | Recurring restructuring and product retirements | Triggered | Medium | High | New cloud investment must prove more durable than retired assets. |
| 18 | Earnings quality | H1 tax-rate benefit reduces net-income comparability | Triggered | Medium | High | Net-income changes can contain non-operating tax effects. |
| 19 | Sensitivity | Category sensitivities are zero-mitigation bounds | Triggered | Medium | High | Sensitivity figures are not earnings forecasts. |
| 20 | Source conflicts | Management and cash CapEx definitions are unreconciled | Unclear | Medium | High | FCF and investment-rate conclusions need a definition bridge. |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 18 |
| Critical flags | 0 |
| High flags | 10 |
| Medium flags | 8 |
| Low flags | 0 |
| Unclear flags | 2 |
| Unavailable checks (data missing) | 0 |

## 5. Red-Flag Severity Verdict

**Material concerns**

The earnings setup is fragile because the reported record already shows revenue growth alongside materially lower margins and GAAP profit, while the hoped-for CIS ramp is explicitly delayed beyond Q3. The single most dangerous red flag is the timing mismatch between CIS revenue and capacity cost: it would be resolved only by reported CIS acceleration accompanied by stable or improving gross margin, cash conversion, and a reconciled investment measure in Q4 or later. [Q2 2026 Form 10-Q, pp.5, 30, 32; Q2 2026 earnings call, Q&A]

## 6. What The Synthesis Agent Should Know

- 18 triggered flags: 10 High, 8 Medium, and no Critical flags; two additional Medium issues remain definition-unresolved.
- The single most dangerous red flag is CIS deployment timing: capacity cost can precede revenue, Q3 CIS growth is not expected to accelerate, and Q4 timing can move with short deployment delays. [Q2 2026 earnings call, Q&A; Goldman Sachs Communacopia + Technology Conference, 2026-09-09, CFO discussion]
- The earnings verdict should be **Mixed earnings setup**, not accelerating: Q2 revenue rose 5.4% while gross margin fell 331 bps, GAAP-derived EBITDA fell 18.7%, and GAAP EPS fell 26.8%. [Q2 2026 Form 10-Q, p.5; Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet]
- No explicit MODULE_RULES score cap is triggered: quarterly data, consensus, cash flow, and verbatim transcripts are available. Keep the missing solution economics visible as a confidence limitation rather than inventing a cap. [00_earnings-data-triage output, §5; Q2 2026 Form 10-Q, Note 14, p.25]
- Preserve the unresolved CIQ-versus-filing EBITDA and operating-income differences, and do not combine management's $347m Q2 CapEx with cash capital expenditure of $225.8m. [01_historical-financials output, §1; 03_margin-drivers output, §9]
- The key missing evidence is solution-level profit, margin, and capital expenditure, plus a reconciled definition of CapEx and a measured CIS cost-recovery rate.
- The setup is dirtier than a simple Security-growth or four-quarter adjusted-beat narrative suggests: Delivery weakness, capacity cost, recurring adjustments, and Q4 conversion timing all remain live.

## 7. Pre-Mortem — If The Earnings Setup Fails

If the earnings setup fails, the most likely reason is that signed CIS commitments were mistaken for near-term earnings while capacity was built and paid for before deployments could produce revenue. Management has already said that GPU-delivery timing limits Q3 CIS acceleration and that co-location cost can lead revenue; therefore, a seemingly acceptable Q3 print could still be followed by weaker Q4 guidance, lower margins, and poor cash conversion. [Q2 2026 earnings call, CFO Q&A]
