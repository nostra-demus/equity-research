# Earnings Red Flags — UBER

All eight upstream earnings outputs (`00`–`07`) are present and were read in full, plus the optional business-model cross-module outputs (`03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`, `12_red-flags-sweep.md`). No upstream input is missing — this scan proceeds with full data availability, not a degraded-confidence basis.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | Revenue growth has held in a stable high-teens band for three straight fiscal years; margins expanded every year FY2021–FY2025; net debt/EBITDA improved to 0.82x at FY2025 year-end | Revenue +17.0%/+18.0%/+18.3% FY23–25; EBITDA margin (16.8)%→12.1% FY21–25 [01_historical-financials output, §1] | High |
| 02_revenue-drivers | Gross Bookings and trip volume are still accelerating, not decelerating — 4 consecutive quarters of constant-currency Gross Bookings growth above 20% | Trips +18% YoY, MAPCs +16% YoY, Gross Bookings +24% reported/+22% CC in Q2 FY26 [02_revenue-drivers output, §4, §7] | High |
| 03_margin-drivers | The ex-UK cost-of-revenue improvement in Q2 FY26 (+377bps) was larger than the entire quarter's net EBITDA-margin gain (+180bps) | Derived arithmetic: as-if cost-of-revenue ratio 56.39% vs actual 55.07%, isolating a genuine 376bps organic improvement [03_margin-drivers output, §7a] | High |
| 04_guidance-consensus | Consensus for the two metrics Uber actually guides (EBITDA, EPS Normalized) sits within 0.4% of the guidance midpoint — a textbook "fair" bar | EBITDA consensus $2,918.95mm vs guided midpoint $2,910mm (+0.31%); EPS Normalized $0.8632 vs $0.86 (+0.37%) [04_guidance-consensus output, §3] | High |
| 05_beat-miss-setup | Uber has beaten its own EBITDA guidance in 4 of the last 4 quarters, and cleared the guided high end in the last 2 by a near-identical ~2.5% each time | [05_beat-miss-setup output, §7–8] | Medium (short, 2-quarter above-high-end sample, self-flagged) |
| 06_earnings-quality | Cash conversion is genuinely strong: CFO exceeded unadjusted EBITDA in every profitable year (160–202% of EBITDA, FY2023–2025); accrual-quality checklist is clean (only 1 of 6 standard flags triggered) | [06_earnings-quality output, §2, §6, §9] | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | Reported revenue growth decelerated sharply over the last two quarters (+14.5% Q1 FY26, +12.2% Q2 FY26) versus the ~20% run rate of the four quarters before | [01_historical-financials output, §3, §6] | High |
| 02_revenue-drivers | The UK Mobility revenue-recognition change cut revenue by $1.1B in Q2 FY26 alone and will keep suppressing YoY comparisons through Q4 FY26 | [02_revenue-drivers output, §5, §6a] | High |
| 03_margin-drivers | SG&A/R&D headcount and discretionary-investment growth outpaced revenue and cost −232bps of margin in Q2 FY26 — deliberate, and the most likely driver to reverse the margin-expansion trend if sustained | [03_margin-drivers output, §7, §8] | High |
| 04_guidance-consensus | Revenue consensus was cut 1.04% in the three trading days after the Q2 print, with net revision breadth of −11 at the FQ3 level — the freshest, most negative signal in the whole estimate set | [04_guidance-consensus output, §3, §5] | High |
| 05_beat-miss-setup | A third straight revenue miss versus consensus is the single biggest risk that could break the "favors beat" setup | [05_beat-miss-setup output, §10] | Medium (forward-looking) |
| 06_earnings-quality | GAAP net income/EPS were inflated in two consecutive fiscal years by one-time, non-cash deferred-tax-asset valuation-allowance releases ($6.4B FY2024, $5.0B FY2025) | [06_earnings-quality output, §5, §10] | High |
| 07_earnings-sensitivity | Driver classification / labor-regulation risk is unquantifiable and, if triggered in a major market, would plausibly dwarf every other quantified sensitivity variable | [07_earnings-sensitivity output, §3, §6] | Medium (Low confidence, per source — no disclosed dollar sensitivity) |
| business-model 12_red-flags-sweep | A recurring "Legal, non-income tax, and regulatory reserve" line, defined in the filing as non-recurring, has appeared at double-digit-percent-of-Adjusted-EBITDA size two years running ($1,123M FY24 = 17.3%; $564M FY25 = 6.5%) — flagged `RF-RFS-001` | [business-model 12_red-flags-sweep output, §2–3] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| Standalone investor deck | 00_earnings-data-triage | Low — filings and verbatim transcripts substitute for driver/management-framing detail |
| Sub-segment revenue detail (Mobility financial-partnerships/advertising split; Delivery Grocery & Retail vs. core restaurant delivery) | 02_revenue-drivers | Medium — limits precision of segment-level revenue-driver decomposition |
| Numeric FQ3 2026 Gross Bookings guidance | 04_guidance-consensus | Medium — Uber guides Gross Bookings internally (and beat it in Q2) but the range itself isn't in this pool's structured data, so the guidance-vs-consensus comparison in §3 of `04` cannot cover it |
| Quantified AV-investment P&L cost impact | 03_margin-drivers, 05_beat-miss-setup | High — CFO has explicitly deferred sizing this; the first quantified figure is flagged by both agents as the item most likely to flip the current "demand signal" reading of the ~$10B AV program |
| Segment-level reconciliation of the UK Mobility revenue/cost effect (a $292M gap between the disclosed $1.1B revenue impact and $808M cost impact) | 03_margin-drivers | Medium — caps how precisely the Mobility segment margin bridge can be read this quarter |
| Delivery merchant concentration percentage | business-model 06_value-chain | Low-Medium — the 10-K flags concentration qualitatively but discloses no percentage |
| 2026 Proxy Statement (insider/officer ownership) | business-model 12_red-flags-sweep (referencing capital-allocation-governance) | Low for earnings module specifically — governance-relevant, tangential to the earnings setup itself |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 05_beat-miss-setup | "Setup favors beat" — driven primarily by Uber beating its own guided EBITDA metric in 4 of 4 quarters, above the guided high end in the last 2 | 06_earnings-quality / business-model 12_red-flags-sweep | The Adjusted-EBITDA-like metric Uber guides and has been "beating" excludes a recurring, double-digit-percent-of-EBITDA "one-off" legal/regulatory reserve charge two years running, and the company stopped disclosing the full quarterly Adjusted-EBITDA-to-GAAP reconciliation starting Q1 FY26 | Y — not a direct factual conflict (05's beat-streak claim is accurate on its own terms), but a quality-adjusted reading materially tempers 05's beat-streak confidence | 06/12 — the source hierarchy favors the filing-level accounting-quality read over the guidance-streak framing when the two inputs describe the same underlying metric from different angles; synthesis should present the beat streak alongside this caveat, not standalone |
| 07_earnings-sensitivity | Bases its entire sensitivity analysis on GAAP EBIT (TTM $6,700M) because Adjusted EBITDA is no longer disclosed quarterly | 04_guidance-consensus / 05_beat-miss-setup | Base their beat/miss and bar analysis on the guided "EBITDA" line (understood to be Adjusted-EBITDA-like, quarterly guide midpoint $2,910mm for FQ3 2026) | Y — both agents flagged their own basis transparently; the two are simply not on the same metric and should not be blended without re-basing | Neither is "more credible" — this is a genuine basis split the synthesis agent must carry forward explicitly, not average away |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No standalone investor deck present | Triggered | Low | High | "No standalone investor deck is present in the pool" [00_earnings-data-triage output, §2] | Minimal — verbatim transcripts and filings fill the management-commentary role at a higher trust tier |
| Sub-segment revenue detail not quantified (Mobility fin-partnerships/ads; Delivery Grocery & Retail vs. core) | Unavailable | Medium | Unknown | "Not proven from available data" [02_revenue-drivers output, §5] | Limits precision of any sub-segment revenue-driver claim; does not block the consolidated or 3-segment read |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Reported revenue growth decelerating (18.3%→14.5%→12.2% YoY over 3 quarters) while the underlying narrative frames it as a one-time item only | Triggered | High | High | "Q2 FY26 revenue growth decelerated to +12.2% YoY... even as Gross Bookings grew +24% YoY" [01_historical-financials output, §3, §6] | Real optical deceleration that the market may not fully discount; a second data point (revenue decomposition residual, below) shows the gap cannot be fully attributed to the UK item alone from this quarter's own bridge |
| Company-defined Adjusted EBITDA disclosure discontinued at the quarterly level starting Q1 FY2026 | Triggered | High | High | "Zero mentions of 'Adjusted EBITDA'" in Q1/Q2 FY26 transcripts (full-text search) [01_historical-financials output, §4; 06_earnings-quality output, §4] | Removes the like-for-like margin-trend metric investors had used to track FY2025's margin-expansion story into FY2026 |
| CIQ quarterly Gross Margin % export shows a classification artifact (Q4 spikes to ~49.7% vs Q1–Q3's 33–39%) | Triggered | Low | Low | Identified and reconciled to the filed cost-of-revenue ratio; flagged as a vendor classification inconsistency, not a real margin swing [01_historical-financials output, §3] | Already corrected by the upstream agent and not propagated into any downstream conclusion |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Q2 FY26 revenue-growth decomposition leaves 19.69pp of the 12.17pp total growth as an undifferentiated "Volume + price/mix + unquantified M&A" plug | Triggered | Medium | Medium | "More than half of the gross magnitude in Table B... is not attributed to a specific, evidenced mechanism" [02_revenue-drivers output, §6a] | Caps how precisely the "biggest revenue driver" claim (Trip volume) can be verified from this quarter's own arithmetic alone |
| Segment mix shift toward Delivery/Freight (lower take rate than Mobility) is a structural drag on the blended take rate | Triggered | Medium | High | "A shift in growth toward Delivery or Freight mechanically pulls the blended take rate down" [03_margin-drivers output, §5, citing business-model `02_business-identity`] | Ongoing headwind to revenue-per-Gross-Booking-dollar even as total Gross Bookings grow |
| Delivery's reported growth includes an unquantified M&A contribution (Trendyol GO) that flips from tailwind to headwind starting Q3 FY26 | Triggered | Medium | High | CFO: Trendyol Go "was a lot larger... than the 2 acquisitions [replacing it]," a "net... headwind to delivery reported growth on a net basis [starting Q3]" [02_revenue-drivers output, §3] | Directly relevant to the very next quarter this red-flag scan covers (FQ3 2026) |
| Revenue consensus and revision breadth deteriorating (−1.04% cut in 3 trading days, breadth −11 at FQ3 level) | Triggered | High | High | [04_guidance-consensus output, §3, §5] — see also §2.5 below | The freshest, most negative signal available in the entire data pool |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| SG&A/R&D headcount and discretionary-investment growth outpacing revenue (−232bps of margin in Q2 FY26) is deliberate and could reverse the margin-expansion trend if sustained | Triggered | High | Medium | "The driver most likely to reverse the improvement if management chooses to keep investing at the current pace" [03_margin-drivers output, §7, §8] | Directly threatens the durability of the margin story that underlies the "favors beat" EBITDA setup |
| G&A / legal-accrual line swings unpredictably — favorable +106bps (FY2025) then unfavorable −97bps (Q2 FY26) in consecutive comparable periods | Unclear | Medium | Medium | "Should not be extrapolated in either direction" [03_margin-drivers output, §7a; 05_beat-miss-setup output, §3] | A fresh unfavorable swing could eat directly into the next EBITDA beat even after a clean Q3 print |
| Mobility segment-level UK effect not fully reconcilable — $292M gap between the disclosed $1.1B revenue impact and $808M cost impact | Unclear | Medium | Medium | "Not achievable from this pool's disclosure" [03_margin-drivers output, §6] | Caps confidence in any segment-level Mobility margin read this quarter beyond the consolidated bridge |
| Recurring "Legal, non-income tax, and regulatory reserve" charge excluded from Adjusted EBITDA at material size two years running ($1,123M FY24 = 17.3% of Adj. EBITDA; $564M FY25 = 6.5%) despite being labeled non-recurring | Triggered | High | High | Filing itself defines the item as "distinct from normal, recurring" matters, yet it recurs at double-digit-% size [06_earnings-quality output, §4–5; business-model 12_red-flags-sweep output, §2, RF-RFS-001] | Inflates the margin-expansion narrative investors are pricing off Adjusted EBITDA |
| Insurance cost pass-through is explicitly asymmetric (near-full downside exposure vs. an inferred ~18% upside retention) | Triggered | Medium | Medium | Management: "our philosophy has been to return that goodness back to the market" [07_earnings-sensitivity output, §6] | A future insurance-cost spike would likely hit margin close to 1:1, while the current tailwind is largely being spent, not banked |
| Freight cyclical "inflection" is based on a single quarter of data | Triggered | Low | Medium | "One quarter of confirmed inflection"; FY2025 used explicit "challenging freight market cycle" language [02_revenue-drivers output, §5; 03_margin-drivers output, §6] | Small consolidated impact (Freight ~9.8% of revenue), but risk of treating one data point as a new baseline |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The guided "EBITDA" metric's definition is not independently confirmed in this pool — CIQ labels it simply "EBITDA" though it is "understood to be" company-defined Adjusted EBITDA | Triggered | High | Medium | "Its definition is not independently re-stated in this pool extract — flagged per hygiene rule" [04_guidance-consensus output, §2] | The entire 4-quarter guidance-beat streak underlying the "favors beat" verdict rests on a metric whose exact composition (and thus whether it is affected by the recurring "one-off" legal-reserve exclusion above) is not confirmed from primary disclosure in this pool |
| Revenue and profitability consensus are diverging in opposite directions over the same 1–3 month window | Triggered | High | High | Revenue estimates cut (FQ3: −1.04%; FY26: falling); EBITDA/EPS Normalized estimates flat-to-rising over the same window [04_guidance-consensus output, §4–5] | A genuine split signal, not noise — the market is simultaneously trimming the top line and raising the profit line for the same company |
| Rising effective-tax-rate assumption compresses EPS Normalized even as EBITDA estimates rise | Triggered | Medium | High | FQ3 2026 tax-rate assumption rose from 16.77% (3 months ago) to 18.94% (current); FY2026 assumption rose from 9.5% to 20.77% [04_guidance-consensus output, §5] | Structural headwind specific to the EPS Normalized line, independent of operating performance |
| EBITDA/EPS "above guided high end" pattern is a short, 2-quarter base rate | Triggered | Medium | Medium | "A real but short (two-quarter) pattern" [04_guidance-consensus output, §7; 05_beat-miss-setup output, §7] | The market-revealed "beat the high end" bar may be set on an insufficient sample to reliably project forward |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Third straight revenue miss vs. consensus is the single biggest disclosed risk to the "favors beat" setup | Unclear | Medium | Medium | Revenue missed consensus in the last 2 quarters (−0.45%, −0.52%); net revision breadth −11 at FQ3 level [05_beat-miss-setup output, §3, §10] | If it materializes beyond the ±0.6% range of the last two quarters, this is explicitly flagged as likely to dominate market reaction even if EBITDA/EPS clear their guided ranges |
| In-line or beat current quarter but Q4 guide fails to reflect normal seasonal step-up, or introduces the first quantified AV-cost figure | Unclear | Medium | Medium | Q4 has averaged 27.2% of annual revenue and the highest EBITDA margin (13.7% FY2025) of any quarter over 3 years [05_beat-miss-setup output, §5] | A flat-to-Q3 Q4 guide, or the first AV P&L cost disclosure, would be read as a genuine deceleration signal, not seasonality |
| GAAP EPS is not usable for a beat/miss read on its own (dominated by non-operating mark-to-market swings) | Not Triggered (already correctly handled upstream) | Low | High | GAAP EPS surprise swung +350.7%, −82.1%, −81.7%, +41.0% over 4 quarters; 05 explicitly excludes it from its beat/miss test [05_beat-miss-setup output, §5–6] | Already mitigated — flagged here only to confirm the exclusion is correctly applied and should be carried into synthesis |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| GAAP net income/EPS inflated in 2 consecutive fiscal years by one-time, non-cash deferred-tax-asset valuation-allowance releases ($6.4B FY2024, $5.0B FY2025) | Triggered | High | High | "GAAP EPS growth computed off the FY2024→FY2025 trend (4.56 → 4.73, +3.7%) is not a repeatable run rate" [06_earnings-quality output, §5, §10] | The single biggest quality concern named by the earnings-quality agent itself; any investor pricing off headline GAAP EPS growth is working from a materially flattered trend |
| Recurring "one-off" legal/regulatory reserve line inflates Adjusted EBITDA two years running | Triggered | High | High | See §2.4 above — cross-listed here because it is fundamentally an accounting-classification issue [06_earnings-quality output, §4–5; business-model 12_red-flags-sweep output, §2] | Same impact as above — inflates the margin-progress metric management and consensus both anchor to |
| Consolidated Adjusted EBITDA reconciliation discontinued starting Q1 FY2026 | Triggered | High | High | See §2.2 above | Reduces forward visibility into whether the FY2025 margin-expansion trend is holding on a like-for-like basis |
| Growing self-insurance reserve build ($9.8B→$12.5B, +27.2% YoY vs. 18.3% revenue growth) drove a meaningful share of reported operating-cash-flow/working-capital growth | Triggered | Medium | Medium | Company MD&A: increase in cash from working capital "primarily driven by an increase in our accrued insurance reserves... due to liabilities recorded during the period exceeding claims paid out"; insurance-reserve valuation is an auditor Critical Audit Matter due to "significant judgment by management" [06_earnings-quality output, §6; business-model 12_red-flags-sweep output, §2] | If claims catch up to reserves, CFO growth could decelerate even with unchanged revenue growth — a genuine, disclosed, judgment-based feature, not evidence of manipulation, but a real forward risk to the "cash generation is strong" bullish claim |
| GAAP net income also moved by unrealized mark-to-market swings on a ~$9.2B strategic equity-investment portfolio (Aurora, Didi, Grab, Lucid, Waabi), a $1.9B YoY swing | Triggered | Medium | High | [business-model 12_red-flags-sweep output, §2] | A second, distinct source of GAAP earnings noise unrelated to the tax-benefit item above; both must be stripped before extrapolating GAAP profitability |
| Segment profit measurement basis changed (Segment Adjusted EBITDA → Segment Operating Income) effective Q1 FY26, prior periods recast | Triggered | Medium | High | "Not directly comparable" [00_earnings-data-triage output, §5; business-model 03_segment-map output, §3] | FY2025 and FY2026 segment margins cannot be blended in the same delta without re-basing — a hygiene requirement, not a quality defect, but an easy error for downstream synthesis to make |
| Capitalized internal-use software costs grew faster than revenue (+26.2% vs. +18.3%) | Triggered | Low | Low | Off a small (~1.6% of revenue) base [06_earnings-quality output, §6, §8] | Immaterial today; worth monitoring only if the growth rate persists at a larger base |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Driver classification / labor-regulation risk is unquantifiable and, if triggered in a major market, would plausibly dwarf every other quantified sensitivity variable | Triggered | High | Unknown | Excluded from the numeric sensitivity ranking specifically because no company-disclosed or reliably inferable dollar figure exists; New Zealand Supreme Court already found 4 drivers were employees while logged in (Nov 2025) [07_earnings-sensitivity output, §3, §6; business-model 10_external-dependency output, §1, §5] | The single largest unpriced tail risk in the whole earnings setup — none of the quantified sensitivities capture it |
| Government/regulatory policy has already moved a full quarter's revenue by ~8% in one mid-sized market (UK) | Triggered | Medium | Medium | UK VAT/business-model change cut Q2 FY26 revenue by $1.1B (~8% of that quarter's $14.2B) [business-model 10_external-dependency output, §5] | A demonstrated precedent for how large a single-country policy shock can be — directly relevant to sizing the driver-classification tail risk above in a larger market such as the US |
| Insurance cost pass-through asymmetry (near-full downside exposure vs. ~18% inferred upside retention) | Triggered | Medium | Medium | See §2.4 — cross-listed here as a sensitivity-basis issue [07_earnings-sensitivity output, §6] | Same evidence, sensitivity-magnitude framing |
| Volume bear-case EBIT impact may be understated — symmetric ~30% incremental-margin assumption may not hold if driver-incentive spend stays sticky in a slowdown | Unclear | Medium | Low | "Flagged as a plausible non-linearity, not confirmed by any disclosed period of an actual Uber volume downturn in this data pool" [07_earnings-sensitivity output, §6] | Labeled inference; if correct, the bear case for the #2-ranked sensitivity variable (Trip/Gross Bookings volume) could be materially worse than the ±$828M shown |
| FX and volume deceleration could compound rather than offset in a bear scenario | Triggered | Medium | Low | Q2 FY26 headline growth included a +2pp FX tailwind on top of 22% CC growth; a simultaneous FX reversal and volume deceleration would compound [07_earnings-sensitivity output, §5] | A correlated-shock scenario not captured by treating each sensitivity variable independently |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Capital IQ's own "Net Debt" export line diverges materially from the strict computed figure ($76M vendor vs. $5,197M computed, FY2025) | Triggered | Medium | Low | "Its exact netting basis could not be reproduced from the disclosed balance-sheet components in this pool and is not used in this report" [01_historical-financials output, §1] | Low direct earnings-module relevance (net debt is a balance-sheet/leverage metric), but a real, unreconciled vendor-vs-computed gap that other modules should not silently adopt |
| Basis mismatch between `07_earnings-sensitivity` (GAAP EBIT) and `04`/`05` (guided EBITDA-like metric) | Triggered | Medium | High | See Contradictions table, §1 above | Synthesis must not blend a GAAP-EBIT-based sensitivity percentage with a guided-EBITDA-based beat magnitude |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The "favors beat" setup verdict is built on a guided EBITDA-like metric whose quality is separately and materially qualified elsewhere in the same module (71/100, "mostly clean but some adjustment noise") | Unclear | High | Medium | 05's beat-streak framing does not itself reference 06's caveats; the two live in different sections of the same module [05_beat-miss-setup output, §8; 06_earnings-quality output, §9–10; business-model 12_red-flags-sweep output, §3, RF-RFS-001] | Synthesis should present the beat streak alongside the quality caveat, not as a standalone "clean" bull signal |
| The $10B AV investment program is framed as primarily a "demand/optionality signal" today, based substantially on management's own framing (external co-investment ratios, city-count targets) | Triggered | Medium | Medium | The upstream agent itself states this reading "is not a backlog in the AWS sense" and names the specific observable that would flip it — the first quantified AV P&L charge [03_margin-drivers output, §9] | Already self-qualified upstream; carried forward here because a demand-signal narrative not yet tested against a real cost figure is inherently fragile |
| FY2025 margin levels are the peak of a 3-year expansion, not yet a demonstrated steady state | Not proven from available data as a standalone claim in this module — flagged for cross-reference | Low | Medium | Business-quality module (not itself an earnings-module input) separately characterizes FY2025 margins as "a recent high-water mark, not a stabilized steady state" [business-model 12_red-flags-sweep output, §1, citing `07_business-quality`] | Context only — outside this module's own upstream inputs, included because it bears directly on whether the margin-expansion trend this module treats as durable is, in fact, proven durable |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Historical Trend | Reported revenue growth decelerating (18.3%→14.5%→12.2% YoY) with a real optical component beyond the disclosed UK one-off | Triggered | High | High | Market may not fully discount the deceleration as pure UK optics |
| 2 | Historical Trend | Consolidated Adjusted EBITDA disclosure discontinued at the quarterly level starting Q1 FY26 | Triggered | High | High | Removes the like-for-like margin-trend metric used to track FY2025's story into FY2026 |
| 3 | Margins | Recurring "Legal, non-income tax, and regulatory reserve" charge excluded from Adjusted EBITDA at double-digit-% size two years running | Triggered | High | High | Inflates the margin-progress narrative management and consensus both anchor to |
| 4 | Margins | SG&A/R&D growth outpacing revenue (−232bps in Q2 FY26), deliberate and could reverse the margin trend | Triggered | High | Medium | Single most likely driver to break the margin-expansion story if sustained |
| 5 | Guidance/Consensus | Guided "EBITDA" metric's definition not independently confirmed in this pool | Triggered | High | Medium | The 4-quarter beat streak underlying "favors beat" rests on an unconfirmed metric composition |
| 6 | Guidance/Consensus | Revenue and profitability consensus diverging (revenue cut −1.04%/breadth −11; EBITDA/EPS flat-to-rising) over the same window | Triggered | High | High | Freshest, most negative signal in the whole data pool |
| 7 | Earnings Quality | GAAP net income/EPS inflated 2 consecutive years by one-time non-cash DTA valuation-allowance releases ($6.4B FY24, $5.0B FY25) | Triggered | High | High | GAAP EPS growth trend (4.56→4.73) is not a repeatable run rate |
| 8 | Earnings Quality | Consolidated Adjusted EBITDA reconciliation discontinued starting Q1 FY26 (same fact as #2, listed once per category) | Triggered | High | High | Reduces forward visibility into like-for-like margin trend |
| 9 | Sensitivity | Driver classification/labor-regulation risk is unquantifiable and could dwarf every quantified sensitivity variable if triggered | Triggered | High | Unknown | Single largest unpriced tail risk in the whole setup |
| 10 | Narrative/Framing | "Favors beat" setup verdict does not itself carry forward the quality caveats on the guided metric it rests on | Unclear | High | Medium | Risk that synthesis reads the beat streak as a clean bull signal without the offsetting quality context |
| 11 | Margins | G&A/legal-accrual line swings unpredictably in opposite directions across consecutive comparable periods | Unclear | Medium | Medium | A fresh unfavorable swing could eat into the next EBITDA beat regardless of operating performance |
| 12 | Margins | Mobility segment-level UK effect not fully reconcilable ($292M gap between disclosed revenue and cost impacts) | Unclear | Medium | Medium | Caps confidence in any Mobility segment margin read beyond the consolidated bridge |
| 13 | Margins | Insurance cost pass-through is explicitly asymmetric (near-full downside vs. ~18% inferred upside retention) | Triggered | Medium | Medium | A future insurance-cost spike would likely hit margin near 1:1; the current tailwind is mostly spent, not banked |
| 14 | Revenue | Q2 FY26 revenue-growth decomposition leaves 19.69pp of 12.17pp total growth as an undifferentiated plug | Triggered | Medium | Medium | Caps precision of the "Trip volume is the biggest driver" claim for this specific quarter |
| 15 | Revenue | Segment mix shift toward Delivery/Freight (lower take rate) is a structural drag on blended take rate | Triggered | Medium | High | Ongoing headwind to revenue-per-Gross-Booking-dollar |
| 16 | Revenue | Trendyol GO M&A tailwind to Delivery flips to a headwind starting Q3 FY26 | Triggered | Medium | High | Directly relevant to the very next reported quarter |
| 17 | Beat/Miss | Third straight revenue miss vs. consensus is the single biggest disclosed risk to the "favors beat" setup | Unclear | Medium | Medium | Could dominate market reaction even if EBITDA/EPS clear guided ranges again |
| 18 | Beat/Miss | Q4 guide risk — either fails normal seasonal step-up or introduces first quantified AV-cost figure | Unclear | Medium | Medium | Either outcome would likely be read as genuine deceleration, not noise |
| 19 | Guidance/Consensus | EBITDA/EPS "above guided high end" pattern is a short, 2-quarter base rate | Triggered | Medium | Medium | Market-revealed "beat the high end" bar may be set on an insufficient sample |
| 20 | Guidance/Consensus | Rising effective-tax-rate assumption compresses EPS Normalized even as EBITDA estimates rise | Triggered | Medium | High | Structural headwind specific to EPS Normalized, independent of operating performance |
| 21 | Earnings Quality | Growing self-insurance reserve build (+27.2% YoY vs. 18.3% revenue growth) drove a meaningful share of reported CFO/working-capital growth | Triggered | Medium | Medium | If claims catch up to reserves, CFO growth could decelerate even with unchanged revenue |
| 22 | Earnings Quality | GAAP net income also moved by unrealized mark-to-market swings on a ~$9.2B equity-investment portfolio ($1.9B YoY swing) | Triggered | Medium | High | A second, distinct source of GAAP earnings noise beyond the tax-benefit item |
| 23 | Earnings Quality | Segment profit measurement basis changed (Segment Adjusted EBITDA → Segment Operating Income) effective Q1 FY26 | Triggered | Medium | High | FY25/FY26 segment margins cannot be blended without re-basing |
| 24 | Sensitivity | Government/regulatory policy has already moved a full quarter's revenue by ~8% in one mid-sized market (UK) | Triggered | Medium | Medium | Demonstrated precedent for sizing the driver-classification tail risk in a larger market |
| 25 | Sensitivity | Volume bear-case EBIT impact may be understated due to sticky driver-incentive spend in a slowdown | Unclear | Medium | Low | Labeled inference; if correct, the #2-ranked sensitivity variable's bear case could be worse than shown |
| 26 | Sensitivity | FX and volume deceleration could compound rather than offset in a correlated bear scenario | Triggered | Medium | Low | Not captured by treating each sensitivity variable independently |
| 27 | Source Conflicts | Basis mismatch between `07`'s GAAP-EBIT sensitivity base and `04`/`05`'s guided-EBITDA-like base | Triggered | Medium | High | Synthesis must not blend the two without re-basing |
| 28 | Source Conflicts | Capital IQ's own "Net Debt" export diverges materially from the strict computed figure ($76M vs. $5,197M) | Triggered | Medium | Low | Low direct earnings relevance; a real, unreconciled vendor-vs-computed gap |
| 29 | Data Completeness | No standalone investor deck present | Triggered | Low | High | Minimal — filings and transcripts fill the role at a higher trust tier |
| 30 | Margins | Freight cyclical "inflection" is based on a single quarter of data | Triggered | Low | Medium | Risk of treating one data point as a new baseline |
| 31 | Earnings Quality | Capitalized internal-use software costs growing faster than revenue | Triggered | Low | Low | Immaterial today off a small (~1.6% of revenue) base |
| 32 | Historical Trend | CIQ quarterly Gross Margin % export shows a classification artifact | Triggered | Low | Low | Already corrected upstream and not propagated downstream |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 25 |
| Critical flags | 0 |
| High flags | 7 |
| Medium flags | 17 |
| Low flags | 4 |
| Unclear flags | 7 |
| Unavailable checks (data missing) | 1 |

## 5. Red-Flag Severity Verdict

**Material concerns.**

No flag rises to Critical — the underlying cash-generation engine is genuinely strong (CFO/EBITDA 160–202% in FY2023–2025, clean accrual-quality checklist, no restatement or material weakness), and the data pool itself is complete. But seven High-severity flags cluster around a single theme: the guided, "beaten" EBITDA-like metric that anchors the module's "favors beat" verdict is harder to verify and lower-quality than the headline streak suggests — its precise definition is unconfirmed in this pool, it likely still contains a recurring "one-off" legal-reserve add-back worth double-digit percentages of Adjusted EBITDA in each of the last two disclosed years, the company stopped publishing the reconciliation that would let an outsider check this quarterly, and GAAP EPS/net income (the headline numbers most investors default to) were separately inflated two years running by one-time tax items. The single most dangerous red flag is #5/#10 combined: the "favors beat" setup rests on beating a metric whose own quality is questioned elsewhere in the same module, without that caveat carried into the beat/miss verdict itself. What would resolve it: the next quarter's guided-metric composition being explicitly restated against GAAP operating income with the legal-reserve line broken out, or Uber resuming quarterly Adjusted EBITDA disclosure.

## 6. What The Synthesis Agent Should Know

- 25 red flags triggered (0 Critical, 7 High, 17 Medium, 4 Low), plus 7 Unclear flags — no flag alone invalidates the earnings setup, but the High-severity cluster should meaningfully temper the "favors beat" confidence level.
- The single most dangerous red flag: the guided EBITDA-like metric Uber has "beaten" for 4 straight quarters (a) has an unconfirmed exact definition in this pool, (b) likely still includes a recurring "one-off" legal-reserve add-back worth 6.5%–17.3% of Adjusted EBITDA in the last two disclosed years, and (c) is no longer reconciled to GAAP on a quarterly basis — so the beat streak is real on its own terms but should not be read as evidence the underlying margin story is clean.
- This red-flag scan should cap, not flip, the earnings verdict: it supports treating "Earnings accelerating" or an unqualified "favors beat" framing as overstated; a more defensible synthesis framing is "Earnings stable-to-accelerating on volume, but the margin-beat streak rests on a metric whose comparability has degraded" — this is a nuance for `99_earnings-synthesis` to weigh, not a mandate to reclassify to "Mixed."
- Recommend the synthesis apply (or explicitly note it is not applying) the MODULE_RULES caps already triggered upstream: `06`'s Earnings Quality score (71/100) already reflects the DTA/legal-reserve issues; this scan does not find grounds to lower it further, but recommends the synthesis's "Overall usefulness" narrative explicitly carry the recurring "one-off" finding forward rather than let the clean CFO/EBITDA ratio dominate the quality read on its own.
- Contradictions to reconcile: (1) `05`'s beat-streak optimism vs. `06`/business-model `12`'s accounting-quality caveats on the same guided metric — present together, do not average; (2) `07`'s GAAP-EBIT sensitivity base vs. `04`/`05`'s guided-EBITDA-like base — do not blend a GAAP-EBIT percentage move with a guided-EBITDA beat magnitude without explicit re-basing.
- Missing data that limited this scan: none data-critical. The one genuine "Unavailable" check (sub-segment revenue detail — Mobility financial-partnerships/advertising, Delivery Grocery & Retail vs. core) limits precision but does not block any conclusion in this report.
- Net read vs. upstream: the setup is dirtier than `05`'s "favors beat" headline alone suggests, but cleaner than a reader focused only on the GAAP EPS/DTA-release issue would conclude — the cash-generation engine (CFO, FCF, accrual quality) is genuinely strong and under-emphasized relative to the accounting-classification noise sitting on top of the headline profitability metrics.

## 7. Pre-Mortem — If The Earnings Setup Fails

If this "favors beat" setup turns out to be wrong, the most likely reason is that the market and this module both over-credited the 4-quarter EBITDA guidance-beat streak without pricing in that the guided metric's own comparability had degraded — specifically, a recurring "one-off" legal/regulatory reserve add-back (worth 17.3% of Adjusted EBITDA in FY2024 and 6.5% in FY2025) stops recurring favorably, or simply reverses direction the way the identical G&A line already did once (from +$549M favorable in FY2025 to −$138M unfavorable in Q2 FY26 alone), breaking the beat streak not because Trip volume or Gross Bookings weakened, but because the accounting item that had been quietly propping up the "beat the guided high end" pattern ran out — and because the module never carried `06`'s explicit quality caveat on that same metric into `05`'s "favors beat" verdict, this failure mode would look, in real time, like an unexplained miss rather than the accounting-classification reversal it actually was.
