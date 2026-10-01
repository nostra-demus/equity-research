# Earnings Red Flags — BURL

All eight required upstream earnings outputs and all five available business-model inputs were reviewed. The scan uses the frozen evidence generation only. There are no extraction failures, and the current 10-Q, verbatim transcript, cash-flow statement, consensus, and revisions are available. [earnings-data-triage output, Sections 1–6]

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| earnings-data-triage | The earnings evidence set is sufficient and current. | FY2025 10-K, Q2 FY2026 10-Q, a contemporaneous verbatim Q2 call, consensus, revisions, and cash flow are present; no raw-pool file failed extraction. [earnings-data-triage output, Sections 1–6] | High |
| historical-financials | Q2 sales and underlying profitability improved. | Q2 sales were $2,997.8m, up 11.0% year on year; the filing-derived gross-margin change was +242 bps, of which the $55.5m tariff refund was about +185 bps. [historical-financials output, Section 3] | High |
| revenue-drivers | Store rollout gives a visible sales contribution. | New and non-comparable stores added $254.8m of Q2’s $296.8m sales increase; management guides to about 115 net new stores in FY2026. [revenue-drivers output, Sections 4, 6–7] | High |
| margin-drivers | Excluding the refund, Q2 adjusted EBIT margin improved by 100 bps. | Management attributed the underlying result to +70 bps merchandise margin, +20 bps product-sourcing efficiency and +50 bps SG&A leverage, partly offset by freight and a -30 bps residual. [margin-drivers output, Sections 3, 7–8] | Medium |
| earnings-quality | Historical cash conversion is not broken. | CFO/CIQ-standard EBITDA was 82.4%–102.5% in FY2022–FY2025; FY2025 reported-to-adjusted net income differed by 2.5%. [earnings-quality output, Sections 1–2, 7] | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| revenue-drivers | Mature-store demand is slower and not transaction-led. | Q2 comparable-store sales were +2% after +5% a year earlier; the increase came mainly from basket while transactions were relatively flat. [revenue-drivers output, Sections 3–4, 7] | High |
| margin-drivers | The Q2 reported margin is not a run rate. | The $55.5m tariff refund added about 185 bps to Q2 reported gross margin and management plans to reinvest it in H2, including 40% in Q3 and 60% in Q4. [margin-drivers output, Sections 2–3, 5, 8] | High |
| guidance-consensus | The next-quarter EPS estimate was cut sharply, while revenue estimates stayed flat. | CIQ FQ3 FY2027 normalized EPS fell from $2.04 60/90 days ago to $1.73; Q3 revenue consensus is $2,992.38m, inside management’s range. [guidance-consensus output, Sections 3–4, 7] | Medium |
| beat-miss-setup | The next print is balanced rather than a clean beat setup. | A successful setup needs strong new-store ramp, comparable-store sales near the high end, and price investment that lifts demand without deeper markdowns; warm weather and weak traffic can hurt both sales and margin. [beat-miss-setup output, Sections 2–3, 8–10] | Medium |
| earnings-sensitivity | The largest operating risks are linked but not company-quantified. | A weaker consumer or warm Fall can lower traffic, increase markdowns, and remove SG&A leverage together; only the interest-rate coefficient is company-disclosed. [earnings-sensitivity output, Sections 5–7] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| Store-cohort contribution, build cost and cash payback | business-model synthesis; revenue-drivers | Sales contribution from new stores is visible, but the return and profit ramp from the store-led growth are not proven from filings. [business-model-synthesis output, Sections 1, 4] |
| Demand elasticity from the planned H2 price investment | revenue-drivers; beat-miss-setup; earnings-sensitivity | The $55.5m refund reinvestment is known, but the increment to transactions, sales, or markdowns is not quantified. [revenue-drivers output, Section 4; earnings-sensitivity output, Section 2] |
| Matched Q3 Street adjusted-EPS or adjusted-EBIT-margin series | guidance-consensus; beat-miss-setup | CIQ normalized EPS cannot be compared cleanly with management’s Adjusted EPS, so an EPS beat/miss threshold is not assessable on a matched basis. [guidance-consensus output, Sections 2–3; beat-miss-setup output, Section 4] |
| Company-disclosed operating sensitivities for weather, traffic, freight and merchandise margin | earnings-sensitivity; business-model external-dependency | Downside cannot be sized reliably; the operating sensitivity table is partly a historical-range exercise, not guidance. [earnings-sensitivity output, Sections 1–2, 6–7; external-dependency output, Sections 1–2] |

### Contradictions Between Agents

*No material contradictions identified between upstream agents.* The apparent Q2 gross-margin difference—management’s rounded +250 bps versus a +242 bps calculation from reported line items—is reconcilable; both identify the $55.5m refund as the main non-run-rate item. [historical-financials output, Section 3; margin-drivers output, Section 3]

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status (Triggered / Not Triggered / Unclear / Unavailable) | Severity (Critical / High / Medium / Low) | Probability (High / Medium / Low / Unknown) | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Missing current filing, cash flow, transcript, consensus, or revisions | Not Triggered | Low | Low | The data triage confirms all are current and available in the frozen pool. [earnings-data-triage output, Sections 2–6] | No module-level data cap applies for those inputs. |
| Store-cohort profitability and payback data | Unavailable | Medium | Unknown | The company discloses the new-store sales contribution but not filed cohort contribution, build cost, or payback. [business-model-synthesis output, Sections 1, 4] | Store-led revenue can be measured, but earnings quality of the expansion cannot be confirmed. |
| Product-category or store-cohort margin disclosure | Unavailable | Low | Unknown | Burlington is one reportable segment and does not disclose category, channel, or cohort margins. [margin-drivers output, Sections 1, 6] | Limits attribution of merchandise-margin durability; it does not block a consolidated earnings read. |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Latest quarterly sales growth versus slower annual growth | Unclear | Medium | Medium | Annual sales growth slowed from 11.8% in FY2023 to 9.4% in FY2024 and 8.8% in FY2025, while Q2 FY2026 sales grew 11.0%. [historical-financials output, Sections 1, 3, 6] | One quarter does not establish renewed organic acceleration; Q3 mature-store demand must confirm it. |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Total-sales growth is mostly capacity-led while mature traffic is flat | Triggered | High | High | New and non-comparable stores supplied $254.8m, or about 86%, of Q2’s $296.8m sales increase. Comparable-store sales were +2%, driven mainly by basket; transactions were relatively flat. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, MD&A—Results of Operations] [data/BURL/Burlington Stores, Inc., Q2 2027 Earnings Call, Aug 27, 2026.rtf, Q2 FY2026 Q&A] | A claim of broad demand acceleration would be overstated. Weak traffic makes the larger store base less protective than the headline 11% sales growth implies. |
| Higher inventory and lower-price investment may turn into markdown pressure if demand misses | Triggered | Medium | Medium | Q2 inventory was $1,541.3m, up 9%; comparable-store inventory was up 11%. Management will reinvest the refund to sharpen value, but the sales response is not quantified. Reserve inventory fell to 43% from 50%, which is a partial offset. [data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Q2 FY2026, Inventory and Outlook] | This is a demand-and-margin risk, not evidence that inventory is already excess or impaired. |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Q2 reported margin contains a finite tariff refund that management will reinvest in H2 | Triggered | High | High | The $55.5m refund raised Q2 gross margin and added $41.3m after tax to Q2 net income. Management plans to reinvest about 40% in Q3 and 60% in Q4; it guides Q3 adjusted EBIT margin down 60–80 bps and Q4 down 40–60 bps. [data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Q2 FY2026, Operating Results and Outlook] [data/BURL/Burlington Stores, Inc., Q2 2027 Earnings Call, Aug 27, 2026.rtf, prepared remarks] | Q2 reported gross margin, EBITDA and EPS cannot be carried into H2 as recurring earnings. The full-year refund effect is planned to be neutral, not a permanent margin gain. |
| Durability of the remaining Q2 merchandise-margin gain | Unclear | Medium | Medium | Underlying gross margin was up 60 bps, with +70 bps merchandise margin partly offset by +10 bps freight; the adjusted-EBIT bridge has a -30 bps residual, and no operating coefficient is disclosed. [margin-drivers output, Sections 3, 7–8] | The underlying improvement is real but its repeatability through Fall demand and inventory flow is not proven. |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Q3 management Adjusted EPS and CIQ normalized EPS are not matched definitions | Unavailable | Medium | Unknown | Management guides Q3 Adjusted EPS of $1.60–$1.70, while CIQ consensus is $1.73093 normalized EPS. The company gives no quantitative forward GAAP reconciliation. [guidance-consensus output, Sections 1A–3] | Do not call the EPS bar easy or difficult from the apparent $0.03093 gap above guidance high. |
| Recent estimate cuts reduce evidence of an undemanding Street bar | Triggered | Medium | Medium | Q3 normalized EPS fell from $2.04 to $1.73 over 60/90 days and then stabilised over 30 days. The source-bound CIQ facts sidecar confirms FY2027 revenue revisions of 0 upward / 1 downward in the last month. [guidance-consensus output, Section 4] [CIQ Estimates→Revisions, Last-Month breadth, FY2027] | A prior four-quarter EPS beat record does not establish an easy next-quarter setup after the estimate reset. |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The Q3 upside case requires multiple linked conditions | Triggered | High | Medium | It requires continued new-store ramp, comparable-store sales near or above +3%, and a $22.2m Q3 price investment that lifts demand without additional markdowns. Q2 transactions were relatively flat and management calls late-September onward weather important. [beat-miss-setup output, Sections 2–3] [earnings-sensitivity output, Sections 2, 5–6] | The miss case is simpler: weak traffic or warm weather can hurt sales, markdowns and SG&A leverage together. |
| A Q3 in-line or beat result can leave the larger Q4 risk unresolved | Triggered | High | Medium | Q4 has averaged 31.5% of annual revenue versus Q3’s 23.6%, and carries about 60% of the refund reinvestment, or roughly $33m. [beat-miss-setup output, Sections 5–6, 9] | The earnings setup should not be upgraded on a Q3 print alone without a credible Q4 sales and margin outlook. |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Tariff refund inflates the latest reported cash and earnings quality read | Triggered | High | High | The 10-Q says the $55.5m refund benefited six-month operating cash flow; normalising the latest TTM CFO-minus-capex FCF for that cash benefit produces about $357.0m versus reported $412.5m. [earnings-quality output, Section 1] [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, MD&A—Liquidity and Capital Resources] | The refund is real cash, not an accounting error, but it is not recurring operating cash generation. |
| Recurring costs appear in the adjusted-results reconciliation | Triggered | Low | Medium | FY2025 favorable lease costs, impairment charges and litigation matters recurred, although the reported-to-adjusted net-income gap was only $15.5m, or 2.5%. [earnings-quality output, Sections 4–5, 7] | Adjusted results require a cross-check to GAAP; this is not large enough by itself to invalidate the setup. |
| CFO does not track earnings | Not Triggered | Low | Low | CFO/CIQ-standard EBITDA was above 80% in every FY2022–FY2025 year and was 99.2% in FY2025. [earnings-quality output, Sections 1–2] | No cash-conversion breakdown is visible in the audited history. |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Demand, weather, markdown and freight downside is correlated but not quantified | Triggered | High | High | The company discloses only a $6.3m annual cash-interest impact per 100 bps rate move. It does not disclose coefficients for weather, traffic, freight, merchandise margin or SG&A; a warm Fall or weaker consumer can affect all three operating levers together. [earnings-sensitivity output, Sections 1–2, 5–7] [external-dependency output, Sections 1–2] | The available downside estimates are bounds or historical ranges, not a measured operating-risk distribution. |
| Distribution-network concentration during the seasonal selling period | Triggered | Medium | Low | Six distribution centres shipped more than 99% of FY2025 merchandise units; the filing says a loss of significant primary-centre capacity could significantly disrupt the business. [data/BURL/Burlington_Stores_Inc_-_Form_10-K(Mar-19-2026).doc, FY2025, Item 1—Distribution and Warehousing; Item 1A—Distribution Network Risk] | This is an operational tail risk, not evidence of a current disruption. The supplier graph is not used to infer concentration because it covers only recently disclosed relationships. [CIQ Suppliers export (BURL), retrieved 2026-09-29 — vendor export, scope notes] |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| CIQ EBITDA is not interchangeable with a filing-derived EBITDA calculation in Q2/LTM | Unclear | Medium | Medium | The source-bound sidecar reports CIQ LTM EBITDA of $1,360.7m. The historical-financials report calculates filing-based LTM GAAP EBITDA of $1,440.2m, including a Q2 difference of about $54.0m; the $55.5m tariff refund is close but the CIQ workbook provides no bridge. [CIQ Financials→Income Statement 'EBITDA' [LTM 12 months Aug-01-2026]] [historical-financials output, Section 2] | Do not use the vendor EBITDA as a reported filing subtotal or mix it with company-adjusted EBITDA without definition and basis labels. This is a measurement limitation, not evidence that either source is wrong. |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| “Earnings accelerating” would overstate the evidence | Triggered | High | High | Q2’s 11% sales growth was mainly new-store sales; comparable-store growth was +2% and basket-led, while reported margin and cash flow include the refund that will be reinvested. [revenue-drivers output, Sections 4, 6–7] [margin-drivers output, Sections 3, 8] [earnings-quality output, Sections 1, 10] | The defensible framing is a mixed setup: underlying execution improved, but H2 demand conversion and margin durability remain unproven. |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Revenue | Total-sales growth is mostly capacity-led while mature traffic is flat | Triggered | High | High | Q2’s 11% total-sales growth does not prove broad organic demand acceleration. |
| 2 | Margins | Q2 reported margin contains a finite tariff refund that management will reinvest | Triggered | High | High | The reported Q2 margin cannot be extrapolated into H2. |
| 3 | Beat / Miss Setup | Q3 upside requires several linked conditions | Triggered | High | Medium | Weak traffic or weather can miss sales and margin at once. |
| 4 | Beat / Miss Setup | Q3 can beat while Q4 risk remains unresolved | Triggered | High | Medium | The larger seasonal quarter carries most of the planned price investment. |
| 5 | Earnings Quality / Accounting | Tariff refund inflates the latest cash and earnings-quality read | Triggered | High | High | Reported TTM FCF overstates recurring operating cash by up to the $55.5m disclosed refund benefit. |
| 6 | Sensitivity / External Variables | Correlated demand, weather and markdown downside lacks operating coefficients | Triggered | High | High | The downside range cannot be reliably sized from filings. |
| 7 | Narrative / Framing | “Earnings accelerating” would overstate the evidence | Triggered | High | High | The evidence supports mixed rather than confirmed acceleration. |
| 8 | Historical Trend | Latest quarterly sales growth versus slower annual growth | Unclear | Medium | Medium | Q3 must show whether the Q2 growth rate is durable. |
| 9 | Revenue | Higher inventory and price investment may turn into markdown pressure | Triggered | Medium | Medium | This is a real risk but not evidence of current inventory excess. |
| 10 | Margins | Durability of the remaining merchandise-margin gain | Unclear | Medium | Medium | The non-refund gain is positive but has no disclosed repeatability coefficient. |
| 11 | Guidance / Consensus | Recent estimate cuts reduce evidence of an undemanding Street bar | Triggered | Medium | Medium | Historical beats are less informative after the reset. |
| 12 | Sensitivity / External Variables | Distribution-network concentration | Triggered | Medium | Low | A low-probability operational disruption would be material in the seasonal second half. |
| 13 | Source Conflicts | CIQ EBITDA is not interchangeable with filing-derived EBITDA | Unclear | Medium | Medium | Definition confusion could create a false margin or leverage conclusion. |
| 14 | Earnings Quality / Accounting | Recurring costs in adjusted results | Triggered | Low | Medium | Adjusted metrics are not a cleaner replacement for GAAP metrics. |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 11 |
| Critical flags | 0 |
| High flags | 7 |
| Medium flags | 3 |
| Low flags | 1 |
| Unclear flags | 3 |
| Unavailable checks (data missing) | 3 |

The count is not a count of independent failure modes. The tariff refund is relevant to both margin and cash quality, while weak traffic, weather, price investment and markdowns are a linked downside chain.

## 5. Red-Flag Severity Verdict

**Material concerns**

The primary reports are sufficient and historical cash conversion is sound, so this is not a critical accounting or data-quality failure. But Q2’s headline strength came largely from store capacity and a finite tariff refund, while mature traffic was flat and the company has not shown the demand response to its H2 price investment. The single most dangerous red flag is a weak transaction response to that investment during the Fall season; Q3 comparable-store sales driven by transactions rather than only basket, with merchandise margin holding near the refund-excluded guide, would reduce that concern.

## 6. What The Synthesis Agent Should Know

- 11 triggered flags: 0 Critical, 7 High, 3 Medium and 1 Low; three further items are unclear and three checks are unavailable.
- The main risk is not the known refund reinvestment itself. It is whether the roughly $22.2m Q3 price investment produces enough transaction and sales response to avoid a sales-plus-markdown-plus-leverage miss.
- The earnings verdict should be **Mixed earnings setup**, not Earnings accelerating, unless Q3 proves that mature-store demand is improving on a refund-excluded margin basis.
- No formal MODULE_RULES hard data cap applies: current filings, quarterly data, cash flow, consensus and a verbatim transcript are all present. However, consensus setup should remain at the guidance-consensus agent’s **Fair** read because Q3 normalized EPS and company Adjusted EPS are unmatched definitions.
- Do not treat CIQ LTM EBITDA as filing-reported or company-adjusted EBITDA. Preserve the definition and the $79.5m filing-calculation versus CIQ LTM difference noted by the historical-financials agent.
- The margin and quality implications of the tariff refund are one linked issue, not two independent reasons to downgrade; similarly, weather, traffic, inventory and markdown risk must not be added as independent sensitivity cases.
- Missing store-cohort returns, price elasticity and operating sensitivity coefficients mean the growth and downside cases are less measurable than Q2’s headline numbers imply.
- The setup is dirtier than an earnings-growth headline suggests, but not a fraud, cash-conversion, or source-sufficiency case.

## 7. Pre-Mortem — If The Earnings Setup Fails

The most likely failure is that Burlington’s H2 price investment does not bring back transactions during a warm Fall, leaving the larger inventory position to require markdowns while sales leverage fades. Q2 can conceal this risk because 86% of its sales increase came from new and non-comparable stores and its reported profit also included the $55.5m refund; the next result would then miss on sales and margin even though the store count continues to grow. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Q2 FY2026, MD&A—Results of Operations and Inventory] [data/BURL/Burlington Stores, Inc., Q2 2027 Earnings Call, Aug 27, 2026.rtf, prepared remarks and Q&A]
