# Earnings Red Flags — NHY

Business-model module available and used (`analyses/NHY_2026-07-19/business-model/`, all 12 numbered agents plus synthesis present) — cross-module cross-checks in this report draw on `10_external-dependency.md`, `11_capital-allocation-governance.md`, and `12_red-flags-sweep.md`.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 05_beat-miss-setup | Revenue has beaten Street consensus in all 4 of the last 4 quarters | Rev +3.3% / +6.0% / +1.5% / +0.3% surprise, FQ2'25-FQ1'26 [05_beat-miss-setup output, §6-7] | Medium-High |
| 04_guidance-consensus | FQ2 2026 EBITDA/EPS bar was cut sharply in the 30 days before the print, while revenue estimates stayed net-positive | FQ2 EBITDA −9.5%, zero analysts raised FQ2 EPS in the last month; FQ2 revenue still net +2 up-revisions [04_guidance-consensus output, §4-5, §7] | High |
| 04_guidance-consensus | Street models ~6.5% more FY2026 capex than management guided | Guided NOK 13,500m vs consensus NOK 14,377.4m [04_guidance-consensus output, §3] | High |
| 02_revenue-drivers / 03_margin-drivers | Q1 2026 rebound driven by higher realized aluminium prices, seasonal Extrusions volume, and stronger recycling spreads | Adjusted EBITDA +55% QoQ, Adjusted EPS +196% QoQ [01_historical-financials output, §3] | High |
| 06_earnings-quality | Multi-year cash conversion is reasonable on average (3-yr avg CFO/EBITDA 81.3%, TTM 79.4%) | [06_earnings-quality output, §2] | Medium |
| 01_historical-financials | Leverage stays comfortably inside the company's own target throughout the window (0.2x-0.9x vs sub-2x target) | Adjusted net debt/Adjusted EBITDA [01_historical-financials output, §1, footnote 5] | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | TTM revenue (ended Mar-2026) is down 3.2% vs FY2025; Q1 2026 revenue is down 11.7% YoY | [01_historical-financials output, §2-3] | High |
| 02_revenue-drivers / 03_margin-drivers | The LME aluminium price move that is driving the recovery is explicitly a one-time Middle East supply-shock spike, not demand growth — "flagged as NOT run-rate" | [02_revenue-drivers output, §7; 03_margin-drivers output, §8] | High |
| 02_revenue-drivers | Alumina price sits below its 3-year band on a structural 2.7-3.0 million tonne 2026 oversupply, "not obviously reversible on the same short horizon" | [02_revenue-drivers output, §7] | High |
| 03_margin-drivers | Extrusions, the largest revenue segment (37.5% FY2025), has a negative reported EBIT margin (-2.2% FY2025) and five plants proposed for closure | [03_margin-drivers output, §6] | High |
| 06_earnings-quality | Restructuring/rationalization costs recur every year and are growing (265→407→1,795 NOK m, FY23-25), booked as a non-recurring add-back each time | [06_earnings-quality output, §8-9] | High |
| 06_earnings-quality | Reported net income/EPS sit 34%-180% below adjusted net income/EPS in every one of the last three years | [06_earnings-quality output, §7] | High |
| 06_earnings-quality | Q1 2026 net cash from operating activities was negative NOK (1,891)m against positive Adjusted EBITDA of NOK 8,668m | [06_earnings-quality output, §2] | High |
| 07_earnings-sensitivity | Earnings Volatility Score 70/100 (inverted — higher = worse); the two largest, highest-confidence sensitivities (LME price, USD/NOK) are both variables Hydro does not control | [07_earnings-sensitivity output, §7] | High |
| business-model/11_capital-allocation-governance | Q1 2026 receivable days spiked from 33.0 to 56.7 (LTM basis), with accounts receivable nearly doubling QoQ, unexplained in the pool | [business-model/11_capital-allocation-governance output, row "Working capital trend"] | Medium-High |
| business-model/12_red-flags-sweep | Alumetal recycler bolt-on (NOK 2.7bn carrying value) clears its FY2025 impairment test by only ~18% headroom; company's own words call a future impairment "likely" if weak conditions persist | [business-model/12_red-flags-sweep output, §2] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| A clean 8-quarter P&L series (only 5 quarters available, several approximate/vendor-only) | 00_earnings-data-triage, 01_historical-financials | No formal seasonality read possible; QoQ/YoY trend precision is lower for Q2-Q3 2025 |
| Company-reported FY2021-2022 EBITDA/EBIT | 01_historical-financials | Shortens the visible earnings-quality history to 3 years; low current-period impact |
| A company-published revenue-level price/volume/FX bridge | 02_revenue-drivers | Revenue growth decomposition is qualitative/directional only, not a precise pp attribution |
| Maintenance vs. growth capex split | 06_earnings-quality | FCF may understate or overstate true recurring free cash flow; cannot isolate sustaining capex |
| A dated current-price snapshot | 00_earnings-data-triage | Affects only master-level stock-reaction commentary, not this module's earnings read |
| Explanation for the Q1 2026 receivables spike and the FY2025 Norway revenue jump | business-model/11_capital-allocation-governance, business-model/12_red-flags-sweep | Both are quantified, unexplained anomalies feeding directly into this report's Earnings Quality and Revenue flag categories |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 06_earnings-quality | Q1 2026's negative operating cash flow is "a genuine, disclosed cash-conversion breakdown...attributable to the ordinary working-capital cycle of a commodity producer riding higher prices, not to accrual manipulation" | business-model/11_capital-allocation-governance | The same-quarter receivable-days jump (33.0→56.7 days, AR NOK 17,212m→NOK 31,384m) is flagged as "unexplained in the pool" and scored 40/100 severity, warranting "monitoring" | Y — same underlying fact, different granularity and materiality read, not a factual disagreement | business-model/11's read is more credible on magnitude: it cites the specific DSO/AR figures and calls the size unexplained, while 06's "ordinary working-capital cycle" characterization is not itself backed by a magnitude comparison to prior quarters. See §2.7/§2.9 below |
| 00_earnings-data-triage | Consensus data is "as of Apr-29-2026 7:13 AM GMT" | 04_guidance-consensus | Corrects this to 2026-07-15, the actual last-touched date of the live Consensus/Trends/Revisions tabs | Y — 04 identifies and documents the correction explicitly | 04_guidance-consensus (self-corrected with citation evidence; triage's Apr-29 date belongs to the transcript's own auto-generated cover page, not the live workbook) |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Full 8-quarter P&L series not available; Q2/Q3 2025 figures are chart-derived (approximate) or vendor-only (not from a filing) | Triggered | Medium | High | Q2'25 revenue "~NOK 53.1bn on a bar chart, no exact figure disclosed" [01_historical-financials output, §3, footnote 7]; Q3'25 revenue and Adjusted EBITDA sourced to the vendor cover page, not a filing [01_historical-financials output, §3, footnotes 8, 10] | Limits the precision of trend/seasonality reads; no formal seasonality table could be built (`01_historical-financials.md`, §5) |
| Company-reported FY2021-2022 EBITDA/EBIT not in the pool | Not Triggered | Low | High | Marked N/A cleanly, not estimated [01_historical-financials output, §1, footnote 2] | No downstream calculation relies on these years; immaterial to the current setup |
| Vendor (Capital IQ / S&P) data for this ticker has shown two independent internal inconsistencies within this pool | Triggered | Low | High | (1) CIQ's own EBITDA/EBIT reclassification does not reconcile to audited figures (~NOK 27bn gap on FY2025 EBITDA) [01_historical-financials output, intro data-quality note]; (2) the FQ1 2026 transcript cover page's auto-generated surprise stats (EPS +24.70%, Rev +1.46%) do not match the recomputation from the same workbook's own Surprise-tab actual/estimate pair (EPS +34.4%, Rev +0.29%) [04_guidance-consensus output, §1] | Both were caught and corrected by upstream agents using the filing-anchored number, so no current misstatement stands — but the pattern means any future CIQ-sourced figure for NHY should be cross-checked against the filing before being cited standalone |
| No dated current-price snapshot in the pool | Triggered | Low | High | [00_earnings-data-triage output, §4] | Affects only 99's master-level stock-reaction commentary, not the core earnings-setup read |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Reported EBITDA/EPS swing sharply quarter to quarter on non-cash items (e.g., Q4 2025 reported EBITDA margin fell to 4.2%) | Not Triggered | — | — | Correctly traced to unrealized LME/power derivative mark-to-market timing, a structural feature disclosed and explained by the company every year [01_historical-financials output, §3, §6; 06_earnings-quality output, §4] | Properly explained upstream — not a hidden trend problem |
| One quarter's margin recovery driven substantially by an opaque, one-off-laden line item | Triggered — see §2.4, "MG1" (counted once, under Margins, in the Section 3 summary — not duplicated here) | High | High | [03_margin-drivers output, §7] | See §2.4 |
| QoQ improvement (Q1'26 vs Q4'25) coexists with YoY deterioration (Q1'26 vs Q1'25, revenue −11.7%) | Not Triggered as a hidden issue — already explicit in the data (both directions are shown side by side) | — | — | [01_historical-financials output, §3] | See §2.10, "NF1" for the framing risk this creates |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Growth described as price/FX-driven rather than organic demand | Not Triggered — already correctly labelled | — | — | "the FY2026-to-date revenue story is not organic demand growth — it is a commodity-price and currency story overlaid on roughly flat volumes" [02_revenue-drivers output, §3] | Properly disclosed; no correction needed |
| Unexplained 55.7% YoY jump in Norway (home-market) revenue | Triggered | Low | Unknown | Norway revenue NOK 7,831m (FY2024) → NOK 12,190m (FY2025), vs low-single-digit or negative growth in every other major geography; not explained anywhere in the pool [business-model/12_red-flags-sweep output, §2] | Not examined by the earnings module's own revenue-driver work; could be a benign internal-trading/reclassification effect (Norway is also the production hub) or something requiring further check |
| Pull-forward risk (buying ahead of an expected price move) | Unavailable | — | Unknown | No data in the pool confirms or denies pull-forward buying around the Q1 2026 price spike | Not proven from available data — flagged as a gap, not assessed either way |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Q1 2026 QoQ Adjusted EBITDA recovery driven more than half by an opaque "Other" bucket, including a disclosed one-off | **Triggered (MG1)** | High | High | Of the +NOK 3,050m total QoQ Adjusted EBITDA bridge, "Other (commercial activities in Metal Markets/Bauxite & Alumina, plus NOK 600mn release of previously eliminated internal margins)" contributed +NOK 1,600m — 52% of the total move [03_margin-drivers output, §7] | The quarter's headline margin recovery (+537bps Adjusted EBITDA margin) is only partly a clean operating improvement; over half of it sits in a line the company itself only partially explains, including a one-off internal-margin-elimination release that should not repeat |
| Recurring "one-off" rationalization/closure costs booked every year and growing | Triggered — see §2.7, "EQ2" (counted once, under Earnings Quality, in the Section 3 summary) | High | High | 265 (FY23) → 407 (FY24) → 1,795 (FY25) NOK m [06_earnings-quality output, §8-9] | See §2.7 |
| Hydro Extrusions (largest revenue segment, 37.5% FY2025) remains structurally weak | **Triggered (MG3)** | Medium | High | Reported EBIT margin fell from ~+4% (2020-2023) to −2.2% (FY2025); five European plants proposed for closure; North American demand −4% YoY in Q1 2026; full-year 2026 European/NA demand growth guided at only ~1% [03_margin-drivers output, §6] | Masked at the group level by the aluminium-price spike lifting Aluminium Metal's contribution — the group headline recovery does not mean the largest revenue segment has stopped deteriorating |
| "Gross margin" is a CIQ reclassification with no company-disclosed subtotal behind it | Not Triggered — already flagged and labelled by upstream | — | — | [01_historical-financials output, §1, footnote 1; 03_margin-drivers output, §3] | Properly caveated; no action needed |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| FQ2 2026 EBITDA/EPS estimate cuts track management's own guided Q2 cost bridge, not an independent Street markdown | **Triggered (GC1)** | High | Medium | The cuts "track the company's own Q2 bridge commentary (higher energy/carbon/raw-material costs, lower Aluminium Metal volumes) rather than looking like an independent, unexplained Street markdown" [04_guidance-consensus output, §7] | If actual Q2 costs land near the guided midpoint (not the low end), the post-cut consensus is now accurate rather than conservative — this undercuts the "low bar" reading that the "favors beat" verdict (`05_beat-miss-setup.md`, §8) leans on for EBITDA/EPS specifically, even though the revenue-line logic (net-positive revisions) is unaffected |
| Consensus models more capex than management guided (favorable variance) | Not Triggered — this is a tailwind, not a red flag | — | — | Street NOK 14,377.4m vs guided NOK 13,500m [04_guidance-consensus output, §3] | No adverse impact; a capex undershoot toward guidance would help FCF, not hurt it |
| Consensus data-as-of date discrepancy between triage and 04 | Not Triggered — self-corrected with citation | — | — | [04_guidance-consensus output, §1] | See Contradictions table above; already resolved, current consensus is confirmed non-stale (2026-07-15, 3 days before the print) |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| EPS/EBITDA historical beat pattern is close to a coin flip, unlike the revenue beat streak | **Triggered (BM1)** | Medium | High | Last 4 quarters: EPS surprise +15.1%, −12.8%, −6.8%, +34.4% — "two beats bracketing two misses...closer to a coin flip with wide variance, not a directional edge" [05_beat-miss-setup output, §7] | The "favors beat" verdict is built mainly on the revenue beat streak (a real signal) plus the mechanical EBITDA/EPS bar-lowering (see GC1); it should not be read as implying a strong historical EPS/EBITDA beat tendency in its own right |
| Beat case requires more favorable outcomes to align than the miss case | Not Triggered — roughly balanced | — | — | 4 beat scenarios vs 3 miss scenarios, none individually implausible [05_beat-miss-setup output, §2-3] | No material asymmetry found |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Q1 2026 receivables spike, unexplained and larger in magnitude than 06's own characterization conveys | **Triggered (EQ1)** | High | High | Days-sales-outstanding jumped from 33.0 days (FY2025) to 56.7 days (LTM Mar-2026); accounts receivable nearly doubled quarter-on-quarter (NOK 17,212m Dec-2025 → NOK 31,384m Mar-2026, +82.3%) against QoQ revenue growth of only +6.7% (NOK 47,215m → NOK 50,388m) [business-model/11_capital-allocation-governance output, row "Working capital trend"; 01_historical-financials output, §3]. 06_earnings-quality's own accrual-quality table stops at FY2025 annual data and does not carry this Q1 2026 balance-sheet detail into its flag table, characterizing the associated negative CFO instead as an "ordinary working-capital cycle" [06_earnings-quality output, §2, §6] | This is the single largest, most-recent-quarter, unexplained cash-quality signal in the pool — it sits directly under the same quarter (Q1 2026) that both the "favors beat" setup (`05`) and the margin-recovery narrative (`03`, MG1) use as their base case. If it repeats or worsens in FQ2 2026 (releasing 22-Jul-2026), it would materially weaken the case that the recent earnings recovery is cash-backed |
| Recurring "one-off" restructuring plus large non-cash fair-value/mark-to-market swings drive a persistent, large reported-vs-adjusted gap | **Triggered (EQ2)** | High | High | Restructuring: 265→407→1,795 NOK m (FY23-25), "occurs every year...size is growing" [06_earnings-quality output, §8]; net-income/EPS gap: +34% (FY25), +84% (FY24), +180% (FY23) vs adjusted [06_earnings-quality output, §7] | Reported bottom-line EPS should never be used standalone for this company; the recurring rationalization add-back also means even *adjusted* EBITDA likely overstates the ongoing cash cost of running Hydro's asset base by a modest, persistent amount each year [06_earnings-quality output, §10] |
| Receivable factoring / reverse-factoring facility disclosed | **Triggered (EQ3)** | Low | Low-Medium | "Hydro has set a total limit for such arrangements...currently NOK 5.5 billion but was not fully utilized at year-end" [06_earnings-quality output, §8, citing Integrated Annual Report 2025, p.179] | A standing, currently-unused capacity that could inflate reported CFO if utilization rises — worth monitoring alongside the receivables spike above, not currently triggering a concern on its own |
| Alumetal recycler bolt-on sits at thin impairment headroom | **Triggered (EQ4)** | Medium | Medium-High | FY2025 impairment test: recoverable amount exceeds the NOK 2.7bn carrying value by only ~18%; "continued weak market conditions or further weakening of demand and/or margins is likely to result in impairment in a future period" — company's own words [business-model/12_red-flags-sweep output, §2, citing Integrated Annual Report 2025, Note 2.2, p.163-164] | A live, quantified, near-term earnings risk from the company's only material acquisition of the last five years; not incorporated into the earnings module's own margin-driver or sensitivity work, which stops at the Metal Markets segment's price/volume drivers |
| Stock-based compensation excluded from adjusted earnings | Not Triggered | — | — | SBC immaterial (NOK 17.4m 2025) [06_earnings-quality output, §8] | No impact |
| Tax rate unusually low / boosted by a one-off | Not Triggered | — | — | Effective tax rate is high, not low (57%/43%/39% FY23-25) [06_earnings-quality output, §8] | No impact |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Alumina price sits at a multi-year low on a structural, not-obviously-reversible oversupply | **Triggered (SE2)** | Medium | Medium-High | Realized price USD 345/mt (Q1'26) vs 3-year band USD 359-462/mt; global oversupply estimated at 2.7-3.0 million tonnes for 2026 [02_revenue-drivers output, §7; 07_earnings-sensitivity output, §2-3, ranked #3 sensitivity by absolute impact] | A persistent, sizeable headwind (avg bull/bear swing NOK 4,140m) embedded in the setup that is not obviously resolved by the same catalyst (Middle East de-escalation) that would resolve the aluminium-price tailwind |
| LME aluminium price spike is the single biggest lever and is explicitly non-run-rate | Triggered — already thoroughly quantified upstream, carried forward as a standing risk (not a new finding) | Medium | Medium | ~21% of FY2025 Adjusted EBITDA bear-case sensitivity; ~USD 3,192/mt Q1'26 average vs FY2023-25 realized band USD 2,218-2,573/mt [07_earnings-sensitivity output, §2, §4] | Already correctly the centerpiece of `03_margin-drivers.md` and `07_earnings-sensitivity.md`; flagged here only to confirm it is the largest single reversal risk to the whole setup, not newly discovered |
| Correlated variables (LME price, USD/NOK, recycling spread) share a single root cause | **Triggered (SE3)** | Low | High | "Three of the six variables move together rather than independently, and summing their bull or bear cases at face value would overstate the combined swing" [07_earnings-sensitivity output, §5] | Already flagged by 07 — carried forward as an explicit caution for 99: do not sum independent scenario probabilities/impacts across these three variables without adjusting for the shared Middle East catalyst |
| Sensitivity impact not quantifiable for some variables | Not Triggered as a gap — labelled and confidence-capped appropriately | — | — | Alumina and Extrusions volume sensitivities are explicitly marked "Inference, not from filings" with reduced (Low/Medium) confidence [07_earnings-sensitivity output, §2] | Properly handled; no correction needed |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Materiality/characterization gap between 06_earnings-quality and business-model 11_capital-allocation-governance on the same Q1 2026 receivables event | **Triggered (SC1)** | Medium | High | 06 calls the Q1 2026 negative CFO an "ordinary working-capital cycle" event attributable to higher prices/sales [06_earnings-quality output, §2]; business-model 11 quantifies the same event as DSO nearly doubling (33.0→56.7 days) and scores it 40/100 severity, calling it "unexplained" [business-model/11_capital-allocation-governance output] | Not a factual contradiction (both describe the same cash-flow event) but a materiality-read gap the synthesis must reconcile — business-model 11's more granular, quantified read should be weighted alongside 06's qualitative "ordinary cycle" framing, not superseded by it |
| CIQ vendor EBITDA/EBIT reclassification vs audited EBITDA/EBIT | Not Triggered as an unresolved conflict | — | — | Already reconciled in favor of the audited filing figure, per source hierarchy [01_historical-financials output, intro data-quality note] | Resolved; see §2.1 for the residual "treat future CIQ figures with care" caution |
| Transcript auto-stat vs. Surprise-tab actual/estimate pair (same workbook) | Not Triggered as an unresolved conflict | — | — | Already reconciled in favor of the filing-anchored recomputation [04_guidance-consensus output, §1] | Resolved; see §2.1 |
| One specialist says revenue improving, another says demand weakening | Not Triggered | — | — | 02_revenue-drivers is explicit that price/FX, not demand, is driving revenue, and end-market demand is independently assessed as "Stable to weak" in the same report [02_revenue-drivers output, §3] | Internally consistent, not a cross-agent contradiction |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| "Favors beat" / earnings-recovery framing risks being read as structural acceleration | **Triggered (NF1)** | High | High | TTM revenue (ended Mar-2026) is down 3.2% vs FY2025; Q1 2026 revenue is down 11.7% YoY [01_historical-financials output, §2-3]; the recovery driving the "favors beat" verdict is explicitly tied to "a Middle East conflict and the closure of the Strait of Hormuz," described by the company as a supply shock, not demand growth [02_revenue-drivers output, §7; 05_beat-miss-setup output, §1, §8] | The synthesis agent must not label this "Earnings accelerating" without the same non-run-rate caveat every upstream driver report already attaches — the correct classification is closer to a commodity/geopolitical-conditional setup riding a one-time price spike than a structural inflection |
| Thesis is really a macro/commodity/geopolitical bet disguised as a stock-specific setup | Not Triggered as a hidden framing problem — already transparently classified | — | — | LME price repeatedly labelled "NOT run-rate" and tied to a named geopolitical event across `02`, `03`, `05`, `07` [e.g., 03_margin-drivers output, §8] | Good discipline already shown upstream; CLAUDE.md §14 classification should carry this through explicitly at 99 |
| Good business quality confused with good earnings setup | Not Triggered | — | — | No upstream report conflates Hydro's low-leverage, cost-curve position with a claim that the near-term earnings setup is improving structurally | No correction needed |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Earnings Quality/Accounting | Q1 2026 receivables spike (DSO 33.0→56.7 days; AR +82.3% QoQ), unexplained and under-weighted in 06's own flag table | Triggered | High | High | The base quarter behind the "favors beat" and margin-recovery narratives may be less cash-backed than the earnings-quality score (55/100) implies |
| 2 | Margins | Q1'26 QoQ Adjusted EBITDA recovery >50% explained by an opaque "Other" bucket incl. a disclosed one-off internal-margin release | Triggered | High | High | Over half of the headline margin recovery is not a clean, repeatable operating improvement |
| 3 | Earnings Quality/Accounting | Recurring "one-off" restructuring (growing every year) plus large non-cash FV/MTM swings drive a 34%-180% reported-vs-adjusted net income/EPS gap | Triggered | High | High | Reported EPS is unreliable standalone; even adjusted EBITDA likely overstates ongoing cash cost |
| 4 | Guidance/Consensus | FQ2 2026 EBITDA/EPS estimate cuts track management's own guided cost bridge, not independent Street conservatism | Triggered | High | Medium | Undercuts the "low bar" logic behind the "favors beat" verdict for EBITDA/EPS specifically |
| 5 | Narrative/Framing | "Favors beat" framing risks reading as structural acceleration despite TTM revenue −3.2% and a one-time geopolitical price shock | Triggered | High | High | Synthesis must classify this as commodity/geopolitical-conditional, not "Earnings accelerating" |
| 6 | Beat/Miss Setup | EPS/EBITDA historical beat pattern is close to a coin flip, unlike the revenue beat streak | Triggered | Medium | High | The "favors beat" verdict's confidence should not be extended uniformly from revenue to EPS/EBITDA |
| 7 | Margins | Hydro Extrusions (37.5% of FY2025 revenue) remains structurally weak (-2.2% FY2025 EBIT margin) | Triggered | Medium | High | Masked at the group level by the aluminium-price spike; the largest revenue segment has not stopped deteriorating |
| 8 | Earnings Quality/Accounting (cross-module) | Alumetal bolt-on (NOK 2.7bn carrying value) at only ~18% impairment headroom; company calls a future impairment "likely" | Triggered | Medium | Medium-High | A quantified, near-term earnings risk not incorporated into the earnings module's own driver work |
| 9 | Sensitivity/External | Alumina price at a multi-year low on a structural, not-obviously-reversible oversupply | Triggered | Medium | Medium-High | A persistent, sizeable (#3-ranked) headwind not resolved by the same catalyst that resolves the aluminium tailwind |
| 10 | Source Conflicts | Materiality-characterization gap between 06 ("ordinary working-capital cycle") and business-model 11 ("unexplained," 40/100 severity) on the same Q1 2026 event | Triggered | Medium | High | Synthesis must reconcile which read to weight; business-model 11's quantified read is more credible on magnitude |
| 11 | Data Completeness | Full 8-quarter P&L series unavailable; Q2/Q3 2025 figures approximate or vendor-only | Triggered | Medium | High | Limits trend/seasonality precision; no formal seasonality read possible |
| 12 | Sensitivity/External | LME price, USD/NOK, and recycling-spread sensitivities share one root cause (Middle East shock) | Triggered | Low | High | Summing their bull/bear cases independently in any scenario math would double-count one catalyst |
| 13 | Revenue | Unexplained 55.7% YoY jump in Norway (home-market) revenue | Triggered | Low | Unknown | Not examined by the earnings module; plausibly benign but unverified |
| 14 | Earnings Quality/Accounting | Receivable factoring/reverse-factoring facility disclosed (NOK 5.5bn limit, not fully utilized) | Triggered | Low | Low-Medium | Standing capacity that could inflate CFO if utilization rises; not currently triggering a concern alone |
| 15 | Data Completeness | Vendor (CIQ) data for this ticker has shown two independent internal inconsistencies within this pool, both caught and corrected | Triggered | Low | High | No current misstatement stands, but future CIQ-sourced figures for NHY warrant cross-checking against the filing |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 15 |
| Critical flags | 0 |
| High flags | 5 |
| Medium flags | 6 |
| Low flags | 4 |
| Unclear flags | 0 |
| Unavailable checks (data missing) | 1 |

## 5. Red-Flag Severity Verdict

**Material concerns** — high-severity flags present; earnings setup may be overstated or fragile.

No single flag rises to Critical (no fraud, going-concern, or solvency-invalidating evidence was found — leverage stays comfortably inside the company's own sub-2x target throughout the window). But five High-severity flags cluster around the same underlying tension: the Q1 2026 quarter used as the base case for the "favors beat" FQ2 2026 setup shows an unexplained, unusually large receivables build (DSO nearly doubling) that the earnings-quality report under-weighted, a margin recovery more than half explained by an opaque one-off-laden line item, and a "low bar" narrative that leans on Street estimate cuts which actually track management's own guided cost bridge rather than independent conservatism. The single most dangerous red flag is the Q1 2026 receivables spike (flag #1): it is the most recent, most quantifiable, and most directly tied to whether the earnings recovery investors are being asked to extrapolate into FQ2 2026 is cash-backed. It would be resolved — in either direction — by the FQ2 2026 results, due 22-Jul-2026, three days after this report's as-of date: if the FQ2 cash-flow statement shows accounts receivable normalizing while CFO recovers, this was ordinary price-driven working-capital timing; if receivables keep building while CFO stays negative, it becomes a materially more serious earnings-quality concern than the current 55/100 score reflects.

## 6. What The Synthesis Agent Should Know

- 15 red flags triggered: 0 Critical, 5 High, 6 Medium, 4 Low, 0 Unclear, 1 Unavailable (pull-forward risk — no data either way).
- The single most dangerous red flag: the Q1 2026 receivables spike (DSO 33.0→56.7 days, AR +82.3% QoQ, unexplained) — see Section 5 for what resolves it (the FQ2 2026 print, 22-Jul-2026).
- This red-flag scan does **not** change the earnings-verdict category recommended by `05_beat-miss-setup.md` ("favors beat") on its own — but it should push the synthesis to qualify that verdict: the revenue-line logic (4-for-4 beat streak, net-positive revisions) is on firmer ground than the EBITDA/EPS-line logic (a "coin-flip" historical pattern plus a bar-lowering that tracks guided costs, not independent conservatism).
- This report recommends the synthesis treat the earnings-quality score (55/100 from `06_earnings-quality.md`) as a **ceiling, not a settled read** — the Q1 2026 receivables magnitude, quantified only in the cross-module business-model output, was not fully incorporated into that score.
- Two score-cap-relevant considerations for the synthesizer: (1) the Earnings clarity score should reflect the incomplete 8-quarter series (flag #11) per the module's own "No quarterly data → Earnings clarity max 60" logic, adjusted for the fact that the latest quarter and one year of comparatives are present (a partial, not full, cap situation — 01/00 already noted no hard cap is triggered); (2) do not let the Consensus setup score read as fully "beatable" without noting flag #4 (bar-lowering tracks guided costs).
- Contradiction to reconcile: `06_earnings-quality.md`'s "ordinary working-capital cycle" characterization of Q1 2026's cash-conversion breakdown vs. business-model `11_capital-allocation-governance.md`'s quantified "unexplained," 40/100-severity read of the same event (flag #10) — weight the more granular, quantified business-model read.
- Missing data that prevented a fuller scan: no maintenance/growth capex split (limits normalized FCF precision); no company revenue-level price/volume/FX bridge (limits precise pp attribution); no explanation anywhere in the pool for the Norway revenue jump or the receivables spike.
- Net read: this setup is **dirtier than the upstream agents' individual verdicts suggest in aggregate** — not because any single upstream report is wrong on its own terms, but because the cross-agent view surfaces a receivables-quality question and a bar-lowering-logic question that no single upstream agent was positioned to weigh against the whole "favors beat" narrative.

## 7. Pre-Mortem — If The Earnings Setup Fails

If the "favors beat" earnings setup for FQ2 2026 turns out to be wrong, the most likely reason we missed it is that the Q1 2026 receivables spike (DSO 33.0→56.7 days, accounts receivable nearly doubling quarter-on-quarter) was not what 06_earnings-quality called it — "the ordinary working-capital cycle of a commodity producer riding higher prices" — but the early sign of a genuine cash-conversion problem that the earnings-quality score (55/100) did not weight heavily enough because the underlying figure was quantified only in a different module's (business-model `11`) use of a different data tab (Capital IQ Ratios export, LTM Mar-2026 column) rather than in the earnings module's own working-capital table, which stopped at FY2025 annual data. If FQ2 2026's cash-flow statement (due 22-Jul-2026) shows receivables continuing to build while operating cash flow stays negative, the "beat" the market may see in the P&L would not be backed by cash, and the setup would fail on an earnings-quality basis that this specific evidence gap kept partially hidden from the synthesis.
