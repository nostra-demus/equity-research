# Earnings Red Flags — META

All seven upstream earnings-module outputs (`00` through `07`) and all three optional business-model cross-module outputs (`03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`) were read for this scan. No upstream output is missing. The pre-extraction sidecars (`_pool_extracts/ciq_facts.json`, `_pool_extracts/relationships.json`) were not available this session; per the task instructions this is a missing convenience aid, not a data gap, and this report's own citations are sourced from the upstream agents' own citations to filings, transcripts, and Capital IQ exports.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | Revenue growth has accelerated every year since the FY2022 trough (-1.1% → +15.7% → +21.9% → +22.2%), and quarterly YoY growth kept climbing into 2026 (+26.2% Q3'25 → +33.1% Q1'26 → +28.0% Q2'26) | [01_historical-financials output, §6] | High |
| 06_earnings-quality | Cash conversion is exceptional and consistent: CFO has exceeded EBITDA every year FY2021–FY2025 (105%–123%), well above the 70% "healthy" bar | [06_earnings-quality output, §2] | High |
| 06_earnings-quality | Meta discloses no adjusted EBITDA/EBIT/EPS bucket at all — only FX-neutral revenue and free cash flow — leaving no non-GAAP bucket to hide recurring costs like stock-based compensation | [06_earnings-quality output, §4, §9] | High |
| 02_revenue-drivers | Ad impressions (+14% YoY) and average price per ad (+12% YoY) both accelerated in Q2 FY26, broad-based across all four geographic regions, with no acquisition or one-off revenue tailwind identified | [02_revenue-drivers output, §3, §4, §7] | High |
| 06_earnings-quality | No customer concentration (no customer ≥10% of revenue or AR), DSO falling every year (40.1 → 36.8 → 33.4 days), no inventory or receivable-factoring red flags | [06_earnings-quality output, §3, §6] | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 03_margin-drivers | Operating margin fell 1,214bps YoY in Q2 FY26 (43.02% → 30.88%); R&D cost growth alone accounts for 69% of that decline, and 70% of the R&D drag (-585bps of -838bps) is a named-but-unquantified residual | [03_margin-drivers output, §4, §7, §7a, §8] | High |
| 05_beat-miss-setup | "Setup favors miss" — consensus already sits above management's own guidance on every quantifiable line (revenue, EBIT floor, capex), leaving no cushion | [05_beat-miss-setup output, §8] | High |
| 04_guidance-consensus | GAAP-EPS revision breadth is deeply negative (44 of 52 analysts cut FY2026 GAAP EPS in the last month, net −39) and price targets were cut by 45 of 58 analysts (zero raised), mean target falling 8.6% in a month | [04_guidance-consensus output, §5] | High |
| 01_historical-financials | Net cash position ($4.8bn–$23.5bn net cash every year FY2021–FY2024) flipped to net debt of +$22.9bn at FY2025 year-end and +$68.2bn by the latest TTM period-end; disclosed free cash flow fell -20.4% TTM YoY even as CFO grew +27.4%, driven by capex +71.2% TTM YoY | [01_historical-financials output, §1, §2, §6] | High |
| 07_earnings-sensitivity | The single largest EBIT sensitivity variable is an advertiser-budget/consumer-cycle shock (~$17.4bn swing, ~19.5% of TTM operating income) — entirely external and not company-controlled; a fixed, growing AI cost base would amplify (not cushion) any resulting downturn | [07_earnings-sensitivity output, §4, §6] | Medium (directional finding High confidence; the exact dollar sizing is explicitly labelled Low confidence / inferred) |
| 06_earnings-quality | A January 2025 useful-life extension on servers/network assets added ~$1.00/share (≈4.3%) to FY2025 diluted EPS through a non-cash depreciation reduction, timed exactly as the AI-capex asset base ramps fastest | [06_earnings-quality output, §8, §10] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| Segment-level capex and assets for Family of Apps vs Reality Labs | Business-model `03_segment-map.md`, §1, §3 | Cannot verify how much of the AI-capex surge is funding the profit engine (FoA) versus the loss-making segment (Reality Labs), or judge capital efficiency by segment |
| A company-disclosed measured elasticity for the single biggest sensitivity variable (advertiser-budget shock) | 07_earnings-sensitivity, §2 methodology note, §4 | The largest EBIT-swing variable in the whole sensitivity table rests on an inferred flow-through rate (39.1%, Meta's own current TTM EBIT margin), not a disclosed number — labelled Low confidence by the sensitivity agent itself |
| A dollar-quantified breakdown of the four named R&D cost drivers (technical hiring, severance, infrastructure, third-party AI token costs) | 03_margin-drivers, §7a | 70% of the single biggest margin driver (R&D, -838bps) cannot be decomposed further from Meta's own disclosure — this is the residual the whole margin story rests on |
| A gross pre-mitigation input-cost shock and a measured realised-recovery rate (§9 Base Rate Discipline: mitigation assumption) | 07_earnings-sensitivity, §2 (bear cases held at 0% mitigation / "bound," not a forecast); business-model `06_value-chain.md`, §2 | Every bear-case sensitivity in `07` is explicitly labelled a zero-mitigation bound, not a forecast — properly labelled upstream, but the true (non-zero) mitigation rate cannot be estimated from this data pool for cost-of-revenue or R&D shocks specifically |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 01_historical-financials | Its own calculated EBITDA (Operating Income + D&A) implies a Q1+Q2 FY26 D&A add-back of ≈$14,755m | 03_margin-drivers | The 10-Q's own disclosed cash-flow-statement D&A for the same H1 FY26 period is $12,355m — a ≈$2,400m gap that "cannot resolve the source of... from the data available" [03_margin-drivers output, §4] | Partially — 03 and 07 both resolve the practical question by adopting GAAP Operating Income (EBIT) as the primary/only margin and sensitivity metric instead of the calculated EBITDA, but the ≈$2,400m gap itself remains unexplained from this data pool | 03/07's approach is more credible: Income from Operations is a directly reported GAAP line, whereas 01's EBITDA depends on a Capital IQ D&A allocation that does not reconcile to the 10-Q's own cash-flow statement |
| 06_earnings-quality | Uses a filing-sourced diluted weighted-average share count of 2,574m, cited to [FY2025 10-K, Consolidated Statements of Income, p.89], to build a full-year "adjusted" EPS figure | 07_earnings-sensitivity | States "a clean, filing-sourced diluted share count was not established from this data-pool session," and for that reason avoids EPS as its sensitivity impact unit entirely | Y — the same FY2025 10-K that 06 cites was available in the same data pool 07 drew from; 07's statement reads as an oversight, not an actual data gap | 06's citation is directly sourced and verifiable against the 10-K income statement; 07's claim of unavailability is not supported by the pool's own content, though its choice to keep the sensitivity table in EBIT dollars rather than force an EPS conversion is itself a defensible, conservative choice on other grounds |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| ≈$2,400m unreconciled gap between 01's calculated EBITDA D&A add-back and the 10-Q's own disclosed cash-flow D&A | Triggered | Low (mitigated — 03/07 both moved to EBIT as the primary basis rather than silently using the mismatched EBITDA) | High | [03_margin-drivers output, §4] | Any reader who uses 01's EBITDA margin figures in isolation, without reading 03's flag, would be working from a figure with an unexplained ≈$2.4bn gap against the filed cash-flow statement |
| Segment-level capex and assets not disclosed for Family of Apps vs Reality Labs | Triggered | Low | High | [business-model 03_segment-map output, §1, §3] | Cannot verify how the AI-capex surge splits between the profit engine (FoA) and the loss-making segment (RL), limiting a capital-efficiency read by segment |
| No company-disclosed measured elasticity for the single biggest sensitivity variable (advertiser-budget shock) | Triggered | Medium | High | [07_earnings-sensitivity output, §2 methodology note, §4] | The largest EBIT-swing variable in the whole sensitivity table rests on an inferred flow-through rate, not a disclosed number |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Net cash position flipped to net debt within roughly 18 months (net cash every year FY2021–FY2024 → +$22.9bn net debt FY2025 → +$68.2bn TTM Jun-2026) | Triggered | Medium | High | [01_historical-financials output, §1, §6] | A multi-year balance-sheet strength has reversed quickly, driven by capex; feeds the leverage/survival read even though the module frames it as capex-driven, not distress |
| Company-disclosed free cash flow fell -20.4% TTM YoY even as CFO grew +27.4% and revenue accelerated | Triggered | Medium | High | [01_historical-financials output, §2, §6] | The cash the business can actually deploy outside capex is shrinking even as headline growth looks strong; a revenue-only narrative would miss this |
| Operating margin compression is itself accelerating — from -80bps for all of FY2025 to -1,214bps YoY in the single most recent quarter (Q2 FY26) | Triggered | High | High | [01_historical-financials output, §1, §6; 03_margin-drivers output, §4] | Directly contradicts a clean "earnings accelerating" read; carried forward into Narrative/Framing §2.10 |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Part of the average-price-per-ad reacceleration is a comparison-base effect ("improvements in macro conditions relative to Q2 of last year"), explicitly flagged as not run-rate | Triggered | Medium | High | [02_revenue-drivers output, §3, §7; 03_margin-drivers output, §10] | This tailwind rolls off as comps normalise; management's own Q3 FY26 guidance ($61–64bn) already implies deceleration from Q2's +28% |
| Ad-impression growth is concentrated in lower-monetizing geographies and surfaces (APAC, Reels), mechanically dragging blended price even as volume looks strong | Triggered | Low | High | [02_revenue-drivers output, §3] | The "quality" (margin) of incremental revenue is lower than the base even though the headline growth rate is strong |
| ≈1.46pp of the 11.76pp "Price" growth line is currency (FX), not ad-tech or demand improvement | Triggered | Low (already isolated and quantified by the revenue agent, not hidden) | High | [02_revenue-drivers output, §6a] | Confirms the pricing-power narrative is partly currency; correctly disclosed upstream, restated here to prevent it silently inflating a "pricing power" read at the synthesis layer |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| R&D cost growth (69% of the -1,214bps margin decline) is 70% (-585bps of -838bps) a named-but-unquantified residual (technical hiring, severance, infrastructure, AI token costs bundled together) | Triggered | High | High | [03_margin-drivers output, §7a, §8] | The single biggest driver of the entire earnings setup cannot be broken into its components; if severance (tied to the May 2026 headcount reduction) rolls off faster than infrastructure/token costs grow, the margin picture could look better than modeled, or worse if the reverse is true — this is presently unknowable from disclosure |
| R&D cost inflation is a cost-per-employee story, not a headcount-growth story (headcount down 1% YoY, FoA employee compensation +56%) | Triggered | Medium | High | [03_margin-drivers output, §3] | A cost-per-head dynamic (premium AI hiring, higher SBC) is less reversible by a hiring freeze than a headcount-driven cost line would be |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Consensus sits above management's own guidance midpoint on every quantifiable FY2026/Q3 line (revenue +1.3%, EBIT +6.0% above the qualitative floor, capex +1.5%) | Triggered | High | High | [04_guidance-consensus output, §3] | Leaves no cushion for the Q3 print; already the reason 04 itself calls "Bar is high" |
| GAAP-EPS revision breadth is deeply negative (44 of 52 cut FY2026 GAAP EPS, net -39) and price targets were cut by 45 of 58 analysts (zero raised), mean target down 8.6% in a month | Triggered | High | High | [04_guidance-consensus output, §5] | A sharp, one-directional analyst repricing in the month before this report — a genuine consensus-trap risk for anyone reading only the revenue-side momentum |
| FY2026 blended tax-rate consensus (5.86%) is not on a matched basis against management's 15–17% guide for the remaining quarters | Not Triggered as a defect — already correctly identified and labelled "not a matched-basis gap" by the guidance-consensus agent | Low | N/A | [04_guidance-consensus output, §3] | None — included to confirm the check was made and passed |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Asymmetric setup: the beat case needs continued impression/price momentum to outrun a raised cost base; the miss case only needs already-guided costs/tax to land where guided | Triggered | High | High (05's own explicit verdict) | [05_beat-miss-setup output, §8] | Carries directly into the earnings verdict category the synthesis agent must pick |
| Revenue beat magnitude has shrunk every quarter for four straight quarters (+3.71% → +2.43% → +1.36% → +0.85%), and the most recent quarter (Q2 FY26) missed EPS outright on both GAAP and Normalized bases | Triggered | Medium | Medium (judgment — n=4, below the ~8-observation empirical threshold, properly labelled by 05) | [05_beat-miss-setup output, §7] | The historical cushion that supported treating a Meta revenue beat as near-automatic is nearly gone |
| Two of the last four quarters carried one-off items that swung GAAP EPS by more than 50% in either direction | Triggered | Medium | Low-Medium (judgment, small sample, properly labelled by 05) | [05_beat-miss-setup output, §3, §5] | A future EPS "beat" could again be a one-off tax/legal artifact rather than an operating beat; must be reconciled to Normalized EPS before being read as clean |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| A January 2025 useful-life extension on servers/network assets lowered FY2025 depreciation and added ≈$1.00/share (≈4.3%) to FY2025 diluted EPS, timed exactly as the asset base being depreciated grows fastest | Triggered | Medium-High | High | [06_earnings-quality output, §8, §10] | Reported EPS growth is flattered by a favorable, hard-to-verify accounting assumption (limited real-world AI-hardware service-life history) at the moment it is hardest to check |
| The October 2025 "Venture" data-center joint venture keeps ≈$27bn of committed AI infrastructure spend off Meta's own consolidated capex/balance sheet, with disclosed maximum exposure to $45.95bn including residual value guarantees | Triggered | Medium-High | High | [06_earnings-quality output, §5, §10] | The capex figures the market prices — and that feed FCF and leverage reads — understate the total committed AI-infrastructure capital by a knowable amount |
| Effective tax rate swung from an unusually low 11.8% (FY2024) to an unusually high 29.6% (FY2025) on one-off items in both directions | Triggered | Low (already fully reconciled and explained) | High | [06_earnings-quality output, §8] | Period-over-period EPS comparisons are not clean without reading the tax note; already correctly flagged and explained upstream |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The single largest EBIT sensitivity variable (advertiser-budget/consumer-cycle shock, ≈$17.4bn / ≈19.5% of TTM operating income) is entirely external and not company-controlled | Triggered | High | Unknown (no shock currently in evidence; this is a stress case, not a forecast) | [07_earnings-sensitivity output, §4; business-model `10_external-dependency` output, §5] | The biggest single lever on the whole earnings setup sits outside Meta's control |
| Non-linear operating deleverage: the now-large, semi-fixed AI cost base would amplify — not cushion — a demand downturn, because FY2026 total-expense guidance has been raised, not cut, at every checkpoint | Triggered | High | Unknown | [07_earnings-sensitivity output, §6; 03_margin-drivers output, §10] | Converts what would historically have been a moderate revenue slowdown into a materially larger margin hit than in past cycles |
| R&D and cost-of-revenue sensitivities share a common root cause (the AI compute build-out) and are not independent, though the sensitivity table treats them as separate rows | Triggered | Medium | Medium | [07_earnings-sensitivity output, §5] | A single supply-side compute-cost shock (power or GPU-price spike) could hit both lines at once; summing the two bear cases as independent would understate the combined risk — 07 already flags this explicitly, so the risk is labelled, not hidden |
| FX has no disclosed cost-side offset; a revenue-side FX move (guided to flip to a ~1% headwind in Q3 FY26 after a favorable H1) hits EBIT largely undiluted | Triggered | Medium | High (guided) | [07_earnings-sensitivity output, §2, §6; 03_margin-drivers output, §7] | Unlike a typical multinational with natural cost hedges, Meta's FX exposure is close to 1:1 on the revenue side |
| Regulatory risk (DMA/GDPR/DSA) is a step function, not a smooth slope — a single adverse ruling on the EU consent model could remove monetisable ad-data signal in one step | Triggered | Medium | Unknown | [07_earnings-sensitivity output, §6; business-model `10_external-dependency` output, §1A] | Tail risk not represented by the continuous bull/bear sensitivity ranges elsewhere in `07` |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| 06_earnings-quality uses a filing-sourced diluted share count (2,574m, FY2025 10-K) while 07_earnings-sensitivity states one "was not established from this data-pool session" and avoids EPS as its unit for that reason | Triggered | Low | High | [06_earnings-quality output, §7; 07_earnings-sensitivity output, header] | 07's stated limitation appears to be an oversight rather than an actual gap, since the same 10-K was available to it; synthesis should treat 07's EBIT-only framing as a stylistic/conservatism choice, not proof EPS-level sensitivity is uncomputable |
| ≈$2,400m gap between 01's calculated EBITDA D&A add-back and the 10-Q's own disclosed cash-flow D&A (cross-referenced from §2.1) | Triggered | Low (mitigated — already resolved in favor of EBIT by 03/07) | High | [03_margin-drivers output, §4] | Counted once in the Section 3 rollup under Data Completeness; listed here only to confirm it is also a genuine cross-agent figure conflict |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The revenue read frames the setup as "accelerating" / an "extended upcycle," while the same period shows the sharpest operating-margin compression in the tracked history and the beat/miss agent's own verdict is "Setup favors miss" | Triggered | High | High | [02_revenue-drivers output, §7; 03_margin-drivers output, §4; 05_beat-miss-setup output, §8] | A synthesis that leads with "earnings accelerating" without carrying the margin qualifier would drop exactly the kind of qualifier CLAUDE.md §3 requires be carried at every layer; across all seven upstream reports the honest read is "Mixed earnings setup" (revenue accelerating, margin decelerating, consensus stretched) or "Earnings decelerating," not a clean "accelerating" call |
| The bull case for treating the AI capex wave as a demand signal rests on management's qualitative language ("demand constrained," "ROI-positive"), not a disclosed backlog/RPO figure | Triggered | Medium | Unknown | [03_margin-drivers output, §9] | Correctly self-aware upstream ("weaker than a disclosed backlog number... should be weighted accordingly"), but this is the single biggest assumption behind reading the AI cost wave as "demand signal" rather than "cost got ahead of demand" |
| Q4 FY26 seasonality is sometimes cited as a potential offset to near-term margin pressure, but the cost/tax guidance runs through year-end too | Not Triggered as a hidden confusion — 05 already states this correctly | Low | N/A | [05_beat-miss-setup output, §9] | None — included to confirm the check was made |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Margins | R&D cost growth (69% of margin decline) is 70% an unquantified residual | Triggered | High | High | The single biggest driver of the setup is a black box that could move either direction |
| 2 | Historical Trend | Operating margin compression is itself accelerating (-80bps FY2025 → -1,214bps YoY Q2 FY26) | Triggered | High | High | Directly contradicts a clean "accelerating" earnings read |
| 3 | Guidance / Consensus | Consensus sits above guidance on every quantifiable line | Triggered | High | High | No cushion for the Q3 FY26 print |
| 4 | Guidance / Consensus | GAAP-EPS revision breadth deeply negative + broad price-target cuts | Triggered | High | High | Analysts are actively repricing lower ahead of Q3 |
| 5 | Beat / Miss Setup | Asymmetric setup — beat needs continued momentum, miss only needs guided costs to land | Triggered | High | High | Verdict already "favors miss" |
| 6 | Sensitivity | Advertiser-budget shock is the single largest, entirely external EBIT sensitivity (~$17.4bn) | Triggered | High | Unknown | Biggest lever on the whole setup sits outside company control |
| 7 | Sensitivity | Non-linear operating deleverage: fixed AI cost base amplifies a demand downturn | Triggered | High | Unknown | A moderate revenue slowdown could produce an outsized margin hit |
| 8 | Narrative / Framing | "Accelerating" revenue framing sits beside the sharpest margin compression on record and a "favors miss" verdict | Triggered | High | High | Risk that synthesis drops the margin qualifier and overstates the setup |
| 9 | Historical Trend | Net cash flipped to net debt within ~18 months | Triggered | Medium | High | A multi-year balance-sheet strength reversed quickly, capex-driven |
| 10 | Historical Trend | FCF -20.4% TTM despite CFO +27.4% | Triggered | Medium | High | Deployable cash outside capex is shrinking even as headline growth looks strong |
| 11 | Revenue | Price reacceleration is partly a comparison-base effect, not run-rate | Triggered | Medium | High | Tailwind rolls off as comps normalise; Q3 guidance already implies deceleration |
| 12 | Margins | Cost-per-employee, not headcount growth, drives R&D cost inflation | Triggered | Medium | High | A less reversible cost dynamic than a headcount-driven cost line |
| 13 | Beat / Miss Setup | Revenue beat magnitude shrunk 4 straight quarters + Q2 FY26 EPS miss on both bases | Triggered | Medium | Medium | The near-automatic revenue-beat cushion is nearly gone |
| 14 | Beat / Miss Setup | 2 of last 4 quarters carried EPS-swinging one-off items | Triggered | Medium | Low-Medium | A future EPS "beat" could again be a non-operating artifact |
| 15 | Earnings Quality | Useful-life extension added ≈4.3% to FY2025 EPS via non-cash depreciation cut | Triggered | Medium-High | High | Reported EPS is flattered by a hard-to-verify assumption right at the capex ramp |
| 16 | Earnings Quality | Off-balance-sheet "Venture" JV keeps ≈$27bn (max exposure $45.95bn) of AI infrastructure spend outside consolidated capex/balance sheet | Triggered | Medium-High | High | True committed AI-infrastructure capital is larger than the consolidated capex line shows |
| 17 | Sensitivity | R&D and cost-of-revenue sensitivities are correlated, not independent | Triggered | Medium | Medium | A single compute-cost shock could hit both lines at once, understating combined risk if summed naively |
| 18 | Sensitivity | FX has no disclosed cost-side offset | Triggered | Medium | High (guided) | A guided FX headwind hits EBIT close to 1:1 |
| 19 | Sensitivity | Regulatory risk (DMA/GDPR/DSA) is a step function, not a smooth slope | Triggered | Medium | Unknown | A single adverse ruling could remove ad-data signal in one step |
| 20 | Data Completeness | No measured elasticity for the single biggest sensitivity variable (advertiser-budget shock) | Triggered | Medium | High | The largest EBIT-swing variable rests on an inferred flow-through rate, not a disclosed number |
| 21 | Narrative / Framing | AI capex bull case rests on qualitative "demand constrained" language, not a disclosed backlog figure | Triggered | Medium | Unknown | The biggest assumption behind reading capex as demand signal, not cost overrun |
| 22 | Revenue | Impression growth concentrated in lower-monetizing regions/surfaces | Triggered | Low | High | The "quality" of incremental revenue is lower-margin than the base |
| 23 | Revenue | ≈1.46pp of "Price" growth is currency, already isolated by the revenue agent | Triggered | Low | High | Confirms pricing-power narrative is partly currency; already correctly disclosed |
| 24 | Earnings Quality | Effective tax rate swung from 11.8% (FY2024) to 29.6% (FY2025) on one-offs | Triggered | Low | High | Period-over-period EPS comparisons need the tax note; already reconciled |
| 25 | Data Completeness | ≈$2,400m unreconciled gap between 01's EBITDA D&A add-back and the 10-Q's disclosed cash-flow D&A | Triggered | Low | High | Mitigated — 03/07 use EBIT as primary basis instead |
| 26 | Data Completeness | Segment-level capex/assets not disclosed for FoA vs Reality Labs | Triggered | Low | High | Cannot verify capital efficiency by segment |
| 27 | Source Conflicts | Diluted share count treated inconsistently between 06 (2,574m, sourced) and 07 (stated unavailable) | Triggered | Low | High | 07's EBIT-only framing should be read as a choice, not proof EPS sensitivity is uncomputable |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 27 |
| Critical flags | 0 |
| High flags | 8 |
| Medium flags | 13 |
| Low flags | 6 |
| Unclear flags | 0 |
| Unavailable checks (data missing) | 0 |

## 5. Red-Flag Severity Verdict

**Material concerns** — high-severity flags present; earnings setup may be overstated or fragile.

No critical flags (no accounting fraud, going-concern, or governance disqualifier) were found, and data completeness is strong (00's own sufficiency verdict was "Sufficient," with no partial-data caps binding). But eight High-severity flags cluster around one story: revenue is genuinely accelerating, while operating margin is compressing at an accelerating rate (-1,214bps in the latest quarter) on a cost base (R&D, 70% unquantified) management has guided to keep growing, consensus already sits above guidance with no cushion, and the single biggest earnings sensitivity (advertiser-budget shock, ~$17.4bn) is entirely external and would be amplified — not cushioned — by that same fixed cost base if it turned adverse. The single most dangerous red flag is the R&D margin residual (§2.4, Row 1): 70% of the biggest driver of the entire earnings setup cannot be broken into its named components (technical hiring, severance, infrastructure, AI token costs), so neither the bull case (margin stabilises as severance rolls off) nor the bear case (infrastructure/token costs prove stickier and demand slows) can be confirmed from what Meta discloses. This would be resolved by two things: Meta quantifying the four named R&D sub-drivers individually in a future filing, or two further quarters of data showing whether margin re-stabilises as ad-impression/price growth meets or beats the guided deceleration.

## 6. What The Synthesis Agent Should Know

- 27 red flags triggered: 0 Critical, 8 High, 13 Medium, 6 Low — no single flag caps the thesis on its own, but the High-severity flags cluster around one theme (margin quality and its interaction with an uncontrolled external variable), which the synthesis should treat as one connected risk, not eight separate ones.
- The single most dangerous red flag: 70% of the R&D margin decline (-585bps of -838bps, itself 69% of the total -1,214bps operating-margin compression) is an unquantified residual — Meta names four drivers (technical hiring, severance, infrastructure, AI token costs) but discloses none of them by dollar amount [03_margin-drivers output, §7a].
- This scan supports "Mixed earnings setup" or "Earnings decelerating (margin)" over a clean "Earnings accelerating" verdict — revenue is genuinely accelerating (Level 5 evidence), but operating margin is compressing at an accelerating rate over the same period, and the beat/miss agent's own verdict is "Setup favors miss." A synthesis that headlines "accelerating" without carrying the margin qualifier drops the qualifier CLAUDE.md §3 prohibits dropping.
- No new hard score cap is recommended beyond what 03/06/07 already applied (03 already down-weighted the EBITDA-based read in favor of EBIT; 06 already capped Earnings Quality at 74/100 for the useful-life extension and off-balance-sheet JV; 07 already scored Earnings Volatility 65/100 inverted for the advertiser-budget/deleverage interaction). The synthesis should not re-derive these scores; it should carry them forward with the qualifiers intact.
- Two agent-level inconsistencies need reconciling, not averaging: (1) 01's calculated EBITDA implies a ≈$2,400m higher D&A add-back than the 10-Q's own disclosed cash-flow D&A for H1 FY26 — 03/07 already resolved this by using EBIT, and synthesis should do the same; (2) 06 sourced a filing-based diluted share count (2,574m) that 07 stated was unavailable — 07's EBIT-only sensitivity framing should be read as a conservative choice, not evidence that EPS-level sensitivity cannot be computed.
- Missing data that prevented parts of the scan from going further: segment-level capex/assets (FoA vs Reality Labs) and a company-disclosed elasticity for the advertiser-budget shock (the single biggest sensitivity variable) — both are genuine filing-level gaps, not agent errors.
- Net verdict on cleanliness: dirtier than the upstream agents' individual framing suggests when read in isolation (revenue-drivers reads bullish on its own; margin-drivers, guidance-consensus, and beat-miss each read cautiously on their own) — but no dirtier than what 05's own "Setup favors miss" verdict and 03's own R&D-residual disclosure already imply when read together. This report's main contribution is naming the connective tissue between them, not surfacing a hidden problem no upstream agent saw.

## 7. Pre-Mortem — If The Earnings Setup Fails

If this earnings setup turns out to be wrong, the most likely reason is that a synthesis leaned on the revenue-acceleration narrative (ad impressions +14% YoY, price +12% YoY, four straight quarters of accelerating growth) while under-weighting that operating margin was already compressing at an *accelerating* rate in the same period (-80bps for all of FY2025, then -1,214bps YoY in the single most recent quarter) on a cost base that is 70% unexplained from disclosure (the R&D residual) and that management has guided to keep growing (FY2026 total expenses raised, not cut, at every checkpoint) — and that this margin deterioration would compound with, rather than be offset by, a slowdown in the one variable Meta does not control (advertiser budgets, the largest single sensitivity in the whole dataset). The specific piece of evidence that would have caught this earlier, had it existed, is a dollar-quantified breakdown of the ≈$585bps R&D residual into its four named-but-undisclosed components — without it, neither the bull case (the residual is mostly one-off severance rolling off) nor the bear case (the residual is mostly structural infrastructure/token costs that will not roll off) can be confirmed, and a thesis built on either reading is exposed the moment Meta reports Q3 FY26.
