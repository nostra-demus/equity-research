# Earnings Red Flags — V

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| historical-financials | Reported net revenue accelerated from 11.3% in FY25 to 14.4% in the June-2026 TTM. | [01_historical-financials output, §6; data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, MD&A pp.31–33] | High |
| beat-miss-setup | The $12.097bn FQ4 revenue bar implies 12.8% growth on the matched FQ4 FY25 base of $10.724bn, within management's low-double-digit to low-teens GAAP outlook. | [05_beat-miss-setup output, §1; data/V/Visa_Inc_-_Form_10-K(Nov-06-2025).doc, Consolidated Statements of Operations p.60; data/V/Visa-Inc-Q3-2026-Financial-Results-Presentation.pdf, p.20] | High |
| beat-miss-setup | Revenue and vendor-defined normalized EPS beat in each of the last four quarters, though this is only a four-observation history and does not describe GAAP EPS. | [05_beat-miss-setup output, §7; data/V/VisaIncNYSEVEstimatesReport.xls, Surprise FQ4 FY25–FQ3 FY26] | Medium |
| earnings-quality | FY23–FY25 CFO-to-GAAP-derived EBITDA was 81.0%–94.6%; FY25 FCF was $21.577bn. | [06_earnings-quality output, §§1–2; data/V/Visa_Inc_-_Form_10-K(Nov-06-2025).doc, pp.60, 65] | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| margin-drivers | Client incentives were $4.680bn, up 18% year on year, and management expects FQ4 incentive growth slightly above Q3 as about 20% of payment volume renews; some marketing expense also shifted into Q4. | [03_margin-drivers output, §§5, 8; data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, MD&A pp.33–35; data/V/Visa Inc., Q3 2026 Earnings Call, Jul 28, 2026.rtf, CFO prepared remarks] | High |
| revenue-drivers | June/July cross-border e-commerce benefited from promotional timing, days mix and FIFA-related activity; management said July had moderated and should return toward a more typical relationship to travel. | [02_revenue-drivers output, §§3–4; data/V/Visa Inc., Q3 2026 Earnings Call, Jul 28, 2026.rtf, prepared remarks and Q&A] | High |
| earnings-quality | Latest TTM CFO fell 3.9% and FCF fell 4.8% while revenue rose 14.4%; FY25 accounts receivable rose 22.1% against 11.3% revenue growth. | [06_earnings-quality output, §§2–3, 6; data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, p.10; data/V/Visa_Inc_-_Form_10-K(Nov-06-2025).doc, pp.59–60] | High |
| guidance-consensus | The FQ4 consensus export is at least 43 days old; FY26 GAAP-EPS revisions were 0 upward and 16 downward in the last month while revenue revisions were 29 upward and 3 downward. | [04_guidance-consensus output, §§1, 5; ciq_facts.json, `eps_revisions` and `revenue_revisions` — CIQ Estimates→Revisions (Last-Month breadth, FY)] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| A refreshed FQ4 consensus and revision history after 2026-08-11. | 04_guidance-consensus; 05_beat-miss-setup | The next-print bar is provisional; do not draw a trading conclusion from the 43-day-old export. |
| Standalone FQ4 EBITDA or EBIT consensus and a primary-source dollar FQ4 revenue range. | 05_beat-miss-setup; 04_guidance-consensus | A revenue beat cannot be tested against a same-basis operating-profit bar, and management's qualitative guide cannot prove an exact dollar gap. |
| A common-basis volume/price/mix/incentive bridge and category-level margins. | 02_revenue-drivers; 03_margin-drivers | Only 1.0pp of Q3's 14.4% reported revenue growth is directly attributed (FX); the economics of the other 13.4pp cannot be assigned reliably. |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 04_guidance-consensus | FQ4 consensus revenue implied 18.9% growth and sat above management's qualitative range, using $10.172bn as the prior-year denominator. | 05_beat-miss-setup | $10.172bn is Q3 FY25; FQ4 FY25 was $10.724bn, so the unchanged $12.097bn consensus implies 12.8%, within the guide. | N — the 18.9% comparison uses the wrong quarter. | 05. The audited FY25 income statement gives the matched FQ4 base. [data/V/Visa_Inc_-_Form_10-K(Nov-06-2025).doc, p.60] |
| 01_historical-financials | Q3 GAAP-derived EBITDA margin fell 152bps year on year. | 03_margin-drivers | The same cited Q3 values calculate to 62.27% less 63.84%, or 157bps. | Y — a 5bp arithmetic difference. | 03, which prints the calculation from the Q3 filing values. [data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, p.4] |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status (Triggered / Not Triggered / Unclear / Unavailable) | Severity (Critical / High / Medium / Low) | Probability (High / Medium / Low / Unknown) | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Standalone FQ4 EBIT/EBITDA consensus is unavailable; Visa provides no EBITDA guidance. | Unavailable | Medium | Unknown | [05_beat-miss-setup output, §4; data/V/VisaIncNYSEVEstimatesReport.xls, Consensus FY2026; data/V/Visa-Inc-Q3-2026-Financial-Results-Presentation.pdf, p.20] | A revenue beat can still coincide with an operating-margin miss. |
| Primary company material gives a qualitative FQ4 revenue range, not a dollar range. | Unavailable | Low | Unknown | [04_guidance-consensus output, §§2–3; data/V/Visa-Inc-Q3-2026-Financial-Results-Presentation.pdf, p.20] | The exact distance between management's view and the $12.097bn consensus cannot be measured. |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **RF-05: Revenue growth has not translated cleanly into margin or cash growth.** Q3 EBIT margin fell 161bps year on year despite a 387bps benefit from the lower litigation provision; TTM CFO and FCF also fell while revenue rose. | Triggered | Medium | High | [03_margin-drivers output, §§3, 7; 06_earnings-quality output, §2; data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, pp.4, 10, 34–35] | A top-line acceleration label overstates what the reported operating and cash trends establish. |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **RF-04: The filing directly assigns only 1.0pp of Q3's 14.4% reported growth to FX; the remaining 13.4pp (93%) is an unallocated residual, while temporary cross-border activity is explicitly identified.** | Triggered | Medium | High | [02_revenue-drivers output, §§6–7; data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, MD&A pp.31–33; data/V/Visa Inc., Q3 2026 Earnings Call, Jul 28, 2026.rtf, Q&A] | Payment volume is the closest driver, but it is not filing-proven to explain the growth; a normalisation can make FQ4 softer than an extrapolation of Q3. |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **RF-02: Client-retention economics are a near-term margin and EPS risk.** Incentives grew 18%, faster than net revenue, and management expects their FQ4 growth to be slightly above Q3; deferred marketing expense is also expected in Q4. | Triggered | High | High | [03_margin-drivers output, §§5, 8; 05_beat-miss-setup output, §3; data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, MD&A p.33; data/V/Visa Inc., Q3 2026 Earnings Call, Jul 28, 2026.rtf, CFO prepared remarks] | A revenue result near the bar can still produce weaker net revenue, margin or EPS. |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **RF-03: Consensus is stale.** The last FQ4 normalized-EPS change was 2026-08-10 and the latest workbook update 2026-08-11, at least 43 days before this report. | Triggered | Medium | High | [04_guidance-consensus output, §§1, 7; data/V/VisaIncNYSEVEstimatesReport.xls, Recent Changes 2026-08-10 to 2026-08-11] | The consensus setup is provisional and needs a discretionary staleness haircut, not the no-consensus cap. |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **RF-06: The beat case requires several mid-likelihood conditions—sustained activity, incremental VAS/pricing and favourable costs—while the cost headwind is explicitly guided.** | Triggered | Medium | Medium | [05_beat-miss-setup output, §§2–3; data/V/Visa-Inc-Q3-2026-Financial-Results-Presentation.pdf, p.20; data/V/Visa Inc., Q3 2026 Earnings Call, Jul 28, 2026.rtf, CFO prepared remarks] | The four-quarter normalized-EPS beat record is a counterweight, not proof of an easy beat; the setup is balanced rather than clearly favourable. |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **RF-07: GAAP and adjusted earnings can give different messages.** Litigation has been excluded in FY23–FY25; FY25 non-GAAP EPS exceeded GAAP EPS by $1.27 (12.5%), and nine-month FY26 GAAP income includes a $351m one-time non-cash tax benefit. | Triggered | Medium | High | [06_earnings-quality output, §§4–8; data/V/Visa_Inc_-_Form_10-K(Nov-06-2025).doc, pp.41–44; data/V/Visa-Inc-Q3-2026-Earnings-Release.pdf, pp.10–11] | A normalized-EPS beat is not automatically a GAAP-EPS or recurring-profit beat; do not annualise the current tax rate or legal-cost outcome. |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **RF-08: The central operating sensitivities are low-confidence zero-mitigation bounds, not disclosed net-earnings sensitivities.** The $329m activity and $219m price/VAS/mix effects are inferred, overlap, cannot be added, and assume no incentive, price or cost response. | Triggered | Medium | High | [07_earnings-sensitivity output, §§1–6; data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, MD&A pp.31–33] | Earnings-volatility confidence must remain Low under the module rules; the size of a demand, incentive or regulatory downside is not proven from filings. |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| **RF-01: The earlier 18.9% FQ4 consensus-growth comparison uses Q3 FY25 revenue, not the matched FQ4 FY25 revenue.** | Triggered | High | High | [04_guidance-consensus output, §1A; 05_beat-miss-setup output, §1; data/V/Visa_Inc_-_Form_10-K(Nov-06-2025).doc, p.60] | It incorrectly turns a 12.8% bar within management's qualitative range into an above-guidance “high bar,” which can reverse the consensus conclusion. |
| **RF-09: Q3 GAAP-derived EBITDA-margin decline is reported as both 152bps and 157bps.** | Triggered | Low | High | [01_historical-financials output, §3; 03_margin-drivers output, §3; data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, p.4] | The qualitative direction is unchanged, but synthesis should use the recalculated 157bps figure and not repeat the 152bps value. |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No additional narrative flag beyond the period-matching error and revenue/margin limitations above. | Not triggered | Low | Low | [01_historical-financials output, §6; 05_beat-miss-setup output, §8] | The upstream files otherwise label the setup balanced and preserve the qualifications around temporary demand, costs and cash conversion. |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Source Conflicts | RF-01: FQ4 consensus growth was first calculated against Q3 FY25, not FQ4 FY25. | Triggered | High | High | The “high bar” conclusion is invalid; the corrected matched-period bar is 12.8%, not 18.9%. |
| 2 | Margins | RF-02: Incentives are growing faster than revenue and Q4 includes deferred marketing spend. | Triggered | High | High | A revenue result near the bar can still disappoint on margins or EPS. |
| 3 | Guidance / Consensus | RF-03: Consensus is at least 43 days stale. | Triggered | Medium | High | The next-print bar and revision read require refresh before a decision. |
| 4 | Revenue | RF-04: 93% of Q3 growth is an unallocated residual and temporary cross-border support is identified. | Triggered | Medium | High | Q3 growth cannot be treated as a proven, repeatable volume-led run rate. |
| 5 | Historical Trend | RF-05: Revenue acceleration has not produced clean margin or cash acceleration. | Triggered | Medium | High | Reported operating and cash trends are weaker than a top-line-only read. |
| 6 | Beat / Miss Setup | RF-06: The beat needs multiple mid-likelihood conditions while costs have an explicit Q4 headwind. | Triggered | Medium | Medium | The evidence supports a balanced setup, not a clear positive surprise skew. |
| 7 | Earnings Quality / Accounting | RF-07: Recurring exclusions and a one-time tax benefit can separate adjusted from GAAP earnings. | Triggered | Medium | High | A normalized EPS beat is not a clean proxy for recurring GAAP profit. |
| 8 | Sensitivity / External Variables | RF-08: Key operating sensitivities are inferred, overlapping zero-mitigation bounds. | Triggered | Medium | High | Downside magnitude is not measured, so volatility confidence is Low. |
| 9 | Source Conflicts | RF-09: The Q3 EBITDA-margin change differs by 5bps between agents. | Triggered | Low | High | Use the recalculated 157bps decline; the directional conclusion does not change. |

## 4. Red-Flag Score

| Metric | Value |
|---|---:|
| Total flags triggered | 9 |
| Critical flags | 0 |
| High flags | 2 |
| Medium flags | 6 |
| Low flags | 1 |
| Unclear flags | 0 |
| Unavailable checks (data missing) | 2 |

## 5. Red-Flag Severity Verdict

**Material concerns** — the core operating evidence is not a fraud or liquidity warning, but the earnings setup is more fragile than a top-line acceleration narrative suggests. The most dangerous issue is the FQ4 period-matching error: it changes the Street hurdle from a claimed 18.9% to 12.8% and therefore reverses the “high-bar” conclusion; a refreshed FQ4 consensus using the $10.724bn FQ4 FY25 base resolves it. The separate operating test is whether temporary Q3 cross-border support fades while incentives and deferred marketing costs rise in FQ4.

## 6. What The Synthesis Agent Should Know

- Nine triggered flags: 2 High, 6 Medium and 1 Low; no Critical flag and two unavailable same-period checks.
- The single most dangerous red flag is the incorrect Q3-for-Q4 comparator in `04_guidance-consensus`; the correct $12.097bn FQ4 bar implies 12.8% growth, not 18.9%. [05_beat-miss-setup output, §1]
- Do not call the consensus bar high. The earnings verdict should be **Mixed earnings setup** unless refreshed estimates and FQ4 results show that the corrected bar is both current and economically beatable.
- Apply the named consensus-staleness haircut; do not apply the no-consensus max-30 cap because consensus exists. No overall-usefulness max-65 cap is required after the period mismatch is corrected, but earnings-volatility confidence must be Low because the operating sensitivities are inferred. [MODULE_RULES, Score Cap Rules]
- Resolve the 152bps versus 157bps Q3 EBITDA-margin calculation in favour of 157bps, and preserve the 18.9% versus 12.8% conflict rather than averaging the two readings.
- Missing data: a refreshed consensus/revision history, standalone FQ4 EBIT/EBITDA consensus, a company dollar revenue range and a common-basis revenue/margin driver bridge.
- The setup is dirtier than a simple “earnings accelerating” read: Q3 revenue is improving, but temporary activity, faster incentives, deferred marketing, falling cash conversion and non-GAAP/GAAP differences all limit the inference.

## 7. Pre-Mortem — If The Earnings Setup Fails

The most likely failure mode is that temporary June/July cross-border e-commerce activity is mistaken for a normal run rate. Management already identified promotional timing, days mix and FIFA-related activity and said July had moderated; if that lift fades as FQ4 incentives grow faster and deferred marketing expense lands, Visa can miss on margin or EPS even if revenue remains near the corrected $12.097bn bar. [data/V/Visa Inc., Q3 2026 Earnings Call, Jul 28, 2026.rtf, prepared remarks and Q&A; data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, MD&A p.33]
