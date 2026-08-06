# Earnings Red Flags — UBER

Business-model module outputs ARE available for this run and are used below (`03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`, `12_red-flags-sweep.md`, `99_business-model-synthesis.md`).

All eight required upstream earnings outputs (`00`–`07`) are present. No upstream output is missing.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 02_revenue-drivers | Gross Bookings grew 22% YoY, a fourth straight quarter above 20% growth; framed as durable, broad-based demand | "Gross bookings grew 22% year-on-year to more than $58 billion... marking our fourth consecutive quarter of growth above 20%" [Q2 2026 transcript, prepared remarks] | Medium — figure is management-quoted only, no audited multi-period Gross Bookings series exists in the pool |
| 03_margin-drivers / 06_earnings-quality | Adjusted EBITDA margin has expanded every quarter for at least two years (15.11% → 19.86%, FQ3'24→FQ2'26) | [01_historical-financials.md, §3] | High — cross-checked to annual totals |
| 06_earnings-quality | CFO has exceeded Adj. EBITDA every year since FY2023, reaching 115.7% in FY2025; TTM FCF over $10bn for the first time | [06_earnings-quality.md, §1–§2] | High — corroborated by management's own TTM FCF statement |
| 04_guidance-consensus | Company beat the high end of its own Adjusted EBITDA guidance in each of the last two quarters | [04_guidance-consensus.md, §6] | High |
| 06_earnings-quality | Working capital cycle shrinking (18.5→14.5 days), DSO falling — no receivables-quality concern | [06_earnings-quality.md, §3] | High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials / 04_guidance-consensus | Revenue growth decelerating — two most recent quarters (+14.5%, +12.2% YoY) are the slowest of the last 8, and Revenue missed the Street's pre-print estimate in each of the last two quarters | [01_historical-financials.md, §3, §6; 04_guidance-consensus.md, §6] | High |
| 02_revenue-drivers | ~10pp gap between Gross Bookings growth (+22%) and reported Revenue growth (+12.2%) cannot be cleanly decomposed into take rate/mix/FX/M&A | [02_revenue-drivers.md, §6] | Medium — qualitative direction evidenced, precise split not resolvable from this pool |
| 06_earnings-quality / business-model 12_red-flags-sweep | GAAP net income/EPS in FY2024–FY2025 inflated by back-to-back non-cash deferred-tax valuation-allowance releases ($5,758mm, $4,346mm) | [06_earnings-quality.md, §5, §8, §10; 12_red-flags-sweep.md, §2] | High |
| 03_margin-drivers / 07_earnings-sensitivity | Insurance-cost tailwind is fully reinvested into pricing, not banked — zero disclosed buffer if it reverses | [03_margin-drivers.md, §6, §8; 07_earnings-sensitivity.md, §6] | High |
| 07_earnings-sensitivity | SG&A leverage — the single largest quantified sensitivity ($780mm) — is already reversing (LTM ratio 20.50% vs. FY2025 low of 19.87%) | [07_earnings-sensitivity.md, §4] | High |
| business-model 12_red-flags-sweep | Delivery Hero deal carries an asymmetric break fee (€700mm Uber vs. €200mm target), an ~18-month uncertain closing runway, and an unsized future P&L impact | [12_red-flags-sweep.md, §2] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| No primary SEC filing (10-K/10-Q/8-K) anywhere in the pool; all figures are Capital IQ vendor transcriptions | 00_earnings-data-triage, carried through 01–07 | No line item in this entire module has been independently verified against the audited/regulatory filing itself |
| Segment P&L is annual-only (FY2020–FY2025), no interim/LTM column | 00, 02, 03 | Current-quarter mix-shift read capped at Earnings clarity max 70 |
| Gross Bookings and Monthly Active Platform Consumers — the two KPIs the business model runs on — have no audited multi-period series, only one-off management quotes | 02_revenue-drivers, §1.2 | Bookings-driven bull narrative rests on unaudited, single-point figures |
| No FX, commodity, or interest-rate sensitivity table (Item 7A equivalent) anywhere in the pool | 07_earnings-sensitivity, §1; business-model 10_external-dependency, §2 | Every dollar figure in the sensitivity table is this module's own inference, not company-disclosed |
| No investor deck / no CFO shareholder letter in the pool | 04_guidance-consensus, §1 | Every guidance number is sourced from the vendor Guidance tab, not verified against a company-issued document |
| No FQ3 2026 Gross Bookings guidance range in the pool (only qualitative confirmation that Uber guides Gross Bookings internally) | 04_guidance-consensus, §2 | Cannot assess whether the single biggest revenue driver is set up to beat or miss its own internal bar |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 02_revenue-drivers | Frames Mobility Gross Bookings growth as "improving," "durable," the single biggest driver of the next 3–12 months | 01_historical-financials / 04_guidance-consensus | Reported Revenue is decelerating (two slowest quarters of the last 8) and has missed Street pre-print estimates twice running | Y — both are consistent with the facts once the ~10pp bookings-to-revenue gap is acknowledged, but the *framing* differs: 02 emphasizes the volume KPI, 01/04 emphasize the reported financial-statement metric | 01/04's reported-Revenue read is more credible for the earnings-module's own purpose (this module measures reported earnings, not an unaudited operational KPI); 02's own §6 flags the same gap and does not overstate it |
| 02_revenue-drivers (§3) | Cites an analyst's live-call claim that "revenue [was] up 19%" constant-currency | 01_historical-financials | CIQ-sourced reported revenue growth for the same quarter is +12.2% YoY | N — flagged explicitly by 02 itself as unreconciled, not resolved by either agent | Neither source wins outright; the CIQ figure [1_historical-financials.md §3] is the module's own primary number and is used as the anchor throughout this module — the analyst's live-call figure is treated as unverified |
| 03_margin-drivers (Section 4, quarterly gross-margin walk) | Accepts management's characterization that ~400bps of the ~500bps Mobility take-rate decline is "an optical impact" of a UK reclassification, not economic | 01_historical-financials (§3 flag) | Independently flags that the resulting ~5pp quarterly Gross Margin % jump (39.6%→45%) is not corroborated by the LTM GAAP gross margin, which moved only +225bps | Y, partially — both agents flag the same discrepancy; neither can verify the CFO's explanation against a primary filing (no 10-Q in pool) | Neither — this agent treats the CFO's explanation as management's own unverified assertion, not confirmed fact, until the 10-Q is available |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No primary SEC filing (10-K/10-Q/8-K) present in the data pool — every figure used across this module is a Capital IQ vendor transcription | Triggered | High | High | [00_earnings-data-triage.md, §0, §6] | No number in this module — revenue, margin, cash flow, guidance — has been checked against the audited/regulatory source itself; all figures are one layer removed from the primary evidence |
| Segment P&L (Mobility/Delivery/Freight) is annual-only, stale ~2 quarters vs. the Jun-30-2026 period | Triggered | Medium | High | [02_revenue-drivers.md, §1; 00_earnings-data-triage.md, §5] | Current-quarter mix-shift read capped (Earnings clarity max 70, per MODULE_RULES); the "which segment is actually driving this quarter" question cannot be answered with current data |
| Gross Bookings / Monthly Active Platform Consumers — the two KPIs this business model lives on — have no audited, multi-period time series in the pool | Triggered | Medium | High | [02_revenue-drivers.md, §1.2] | The entire "bookings accelerating" bull narrative rests on isolated management quotes, not a verifiable series |
| No FX, commodity, or interest-rate sensitivity table (Item 7A equivalent) anywhere in the pool | Triggered | Low | High | [07_earnings-sensitivity.md, §1; business-model 10_external-dependency.md, §2] | Every dollar sensitivity figure in `07_earnings-sensitivity.md` is this module's own inference, explicitly labeled Low confidence |
| Change in useful-life or depreciation assumptions | Unavailable | Low | Unknown | [06_earnings-quality.md, §8] | No note-level detail on depreciation policy exists in this pool (no 10-K); cannot be assessed either way |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Revenue growth decelerating (two most recent quarters, +14.5% and +12.2% YoY, are the slowest of the last 8) while Gross Bookings still grew >20% for a fourth straight quarter | Triggered | High | High | [01_historical-financials.md, §3, §6; 02_revenue-drivers.md, §6] | Central to whether the setup is "accelerating" (bookings) or "decelerating" (reported revenue) — the module cannot fully resolve which is the truer signal |
| Quarterly Gross Margin % step-change (39.6%→45.0%, FQ4'25→FQ1'26) is not corroborated by the annual/LTM GAAP gross margin, which moved only +225bps over the same window | Triggered | Medium | High | [01_historical-financials.md, §3 flag; 03_margin-drivers.md, §4 flag] | Quarterly gross-margin comparisons from FQ1'26 onward are not usable at face value without adjustment |
| Adj. EBITDA margin expansion pace is decelerating (+204bps FY2025 vs. +550bps FY2023) | Not Triggered (benign) | Low | High | [01_historical-financials.md, §1] | A normal maturation pattern as the business scales, not evidence of a breaking margin story |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| ~10pp gap between Gross Bookings growth (+22% YoY) and reported Revenue growth (+12.2% YoY) cannot be cleanly decomposed into take rate, mix, FX, or M&A | Triggered | High | High | [02_revenue-drivers.md, §6] | Without this decomposition, the module cannot distinguish "real demand growth masked by one-time accounting" from "genuine, ongoing price/take-rate erosion" — the exact fork 05_beat-miss-setup's own pre-mortem names as the single most likely failure mode |
| Reported growth this quarter and next carries a real M&A/divestiture base effect (Trendyol Go still in the year-ago Delivery base; laps in Q3 FY2026) rather than pure organic demand | Triggered | Medium | High | [02_revenue-drivers.md, §3, §5; 05_beat-miss-setup.md, §2] | A Q3 FY2026 Delivery growth "improvement" driven by lapping a divestiture must not be read as accelerating organic demand |
| Freight segment is in a structural, multi-year trough (revenue -27% from FY2022 peak, negative-to-breakeven EBITDA in 5 of 6 years) and was not discussed at all on the Q2 FY2026 call | Triggered | Low | High | [02_revenue-drivers.md, §5, Freight row; business-model 03_segment-map.md] | Bounded impact (~10% of revenue, near-zero EBITDA), but a full quarter's worth of driver commentary for this segment is simply absent |
| US/Canada is 50.9% of FY2025 revenue and the entire business is transactional (spot, per-trip/per-order) with no long-term contracts of any kind | Triggered | Low | High | [business-model 12_red-flags-sweep.md, §1, customer-geography row] | Structural — no revenue backlog exists to smooth a demand shock; every quarter's revenue must be re-earned |
| Analyst live-call claim ("revenue up 19% constant currency") for the same quarter does not reconcile with the CIQ-reported +12.2% figure | Triggered | Medium | Unclear | [02_revenue-drivers.md, §3] | Leaves the FX/constant-currency component of the growth story unresolved |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Insurance-cost / driver-incentive tailwind is being fully reinvested into pricing, not banked — zero disclosed buffer if the cost line reverses | Triggered | High | Medium | [03_margin-drivers.md, §6, §8; 07_earnings-sensitivity.md, §6] | This is a state-regulated, tort-driven cost line management does not control; a reversal hits Adjusted EBITDA directly and immediately with no offset disclosed anywhere in this pool |
| SG&A leverage — the module's single largest quantified sensitivity variable (±$780mm) — is already reversing (LTM ratio 20.50% vs. the FY2025 low of 19.87%, a +63bps move) | Triggered | High | Medium-High | [07_earnings-sensitivity.md, §3–§4; 03_margin-drivers.md, §3] | The bear-case direction on the biggest quantified swing factor has already started, not merely a hypothetical scenario |
| ~25% of the Adj. EBITDA-vs-GAAP-EBITDA gap (~$592mm FY2025, ~$630mm LTM) beyond stock-based compensation is not itemized anywhere in the pool | Triggered | Medium | High | [06_earnings-quality.md, §4] | A material slice of the headline Adjusted EBITDA figure the company guides to and the Street tracks cannot be explained from available data |
| Corporate G&A / Platform R&D is a single unallocated cost pool (-31% of total EBITDA) with no split between fixed overhead and discretionary R&D (including AV spend) | Triggered | Medium | High | [business-model 03_segment-map.md, §3] | Obscures how much of the cost base is genuinely fixed vs. discretionary — a real constraint on judging operating leverage durability |
| Quarterly Gross Margin step-change accepted as an "optical" accounting effect on management's word alone, with no primary filing (10-Q) available to verify the reclassification mechanics | Unclear | Medium | Unknown | [03_margin-drivers.md, §4 flag] | If the "optical, non-economic" framing is wrong or incomplete, the FQ1'26–FQ2'26 gross-margin improvement is smaller than it appears |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Company has not issued formal Revenue guidance since FQ2 2020 — the exact metric that is currently decelerating and missing has no company-guided anchor | Triggered | Medium | High | [04_guidance-consensus.md, §2] | Revenue beat/miss thresholds in `05_beat-miss-setup.md` §4 are set against the Street's own estimate history, not a company commitment — a weaker anchor than the guided EBITDA/EPS lines |
| Adjusted EBITDA and Adjusted EPS consensus now sit at (not below) management's newly issued FQ3 2026 guidance midpoints, closing the gap that supported the last two quarters' beats | Triggered | Medium | High | [04_guidance-consensus.md, §3, §7] | The "bar is fair, not low" — the two-quarter EBITDA/EPS beat pattern was partly a function of a bar the Street has now caught up to |
| Revenue estimate revisions falling (FQ3 2026 cut ~1.0% in the last month; FY2026 cut ~0.6%), with negative net revision breadth over the last month (-9) | Triggered | Medium | High | [04_guidance-consensus.md, §4–§5] | Revision momentum on the one un-guided, decelerating metric is moving the wrong direction heading into the print |
| GAAP EPS revision breadth sign-flips between windows (+18 net last month, -19 net over 3 months) | Triggered | Low | High | [04_guidance-consensus.md, §5] | Confirms GAAP EPS revisions are noise-driven (non-operating marks), not a usable signal — already correctly excluded from the guided-metric analysis |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Revenue miss case (a straightforward continuation of a two-quarter miss streak, Mid-High likelihood) is simpler and more probable than the revenue beat case (Low-Mid likelihood, requires the U.K.-reclassification/mix drag to moderate) | Triggered | Medium | Medium-High | [05_beat-miss-setup.md, §2–§3] | Asymmetric setup on the metric with the least company-guided support |
| The historical "beat streak" backing the Adjusted EBITDA/EPS beat case is only two quarters — a short base rate by the module's own admission | Triggered | Low | High (as a data-limitation, not a forecast) | [05_beat-miss-setup.md, §7] | Two data points, however consistent, is a thin foundation for treating the beat pattern as a durable base rate |
| In-line Q3 print risk masking a soft, unsized Q4 guide — CFO has explicitly deferred quantifying the P&L impact of AV and Delivery Hero investment spend | Triggered | High | Unknown | [05_beat-miss-setup.md, §5, §9; 03_margin-drivers.md, §9] | Q4 is Uber's seasonally strongest quarter; an in-line Q3 print combined with a weak or newly-cost-laden Q4 guide would flip the setup from "beat streak intact" to "inflecting negative" without a Q3 miss occurring at all |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| GAAP net income and diluted EPS for FY2024 and FY2025 are dominated by a non-cash deferred-tax valuation-allowance release ($5,758mm and $4,346mm respectively, recurring two years running) | Triggered | High | Medium (probability of a future reversal / non-recurrence, not of the fact itself) | [06_earnings-quality.md, §5, §8, §10; business-model 12_red-flags-sweep.md, §2] | Anyone reading headline GAAP EPS growth (+4.56 → +4.73) as an operating signal is measuring a tax event, not the marketplace's economics; normalized EPS (+0.73 → +1.70) is the cleaner series |
| Large, sign-flipping fair-value / mark-to-market gains on equity-stake holdings embedded in GAAP net income (-$7,227mm FY2022 to +$1,832mm FY2024 to -$97mm FY2025) | Triggered | Medium | High (recurs every year) | [06_earnings-quality.md, §4, §8] | A second, independent source of GAAP-earnings noise stacked on top of the tax-benefit distortion |
| Stock-based compensation ($1,826mm FY2025, ~3.5% of revenue) excluded from Adjusted EBITDA | Triggered | Medium | High | [06_earnings-quality.md, §8] | Standard non-GAAP practice, but a real, dilutive cost the headline Adjusted EBITDA/EPS figures management guides to do not reflect |
| Deferred Tax Assets, LT now equal to ~39–40% of FY2025 total equity — a non-cash balance-sheet asset whose value is conditional on Uber generating enough future taxable income to use it | Triggered | Medium | Low-Medium (reversal probability) | [business-model 12_red-flags-sweep.md, §2] | If a valuation allowance is ever reinstated, it would appear as a large negative one-off — the mirror image of the tailwind already booked |
| "Other Long-Term Assets" grew from $3,276mm (FY2021) to $14,019mm (FY2025), faster than revenue, with composition not itemized in this pool | Unclear | Medium | Unknown | [06_earnings-quality.md, §6] | Could be equity-method investments, right-of-use assets, or capitalized costs — cannot be resolved from available data |
| CFO tracking / cash conversion | Not Triggered | — | — | [06_earnings-quality.md, §2] | CFO has exceeded Adj. EBITDA every year since FY2023 (up to 115.7% in FY2025) — checked and clean, the strongest positive signal in the dataset |
| Working capital build / receivables growing faster than revenue | Not Triggered | — | — | [06_earnings-quality.md, §3, §6] | DSO falling every year (30.3→25.1 days FY2023–FY2025); no persistent pattern |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No company-disclosed sensitivity table exists anywhere in the pool — every dollar figure in `07_earnings-sensitivity.md` is this module's own inference; the module's own Earnings Volatility Score (45/100) carries explicitly Low confidence | Triggered | Medium | High | [07_earnings-sensitivity.md, §7] | The entire sensitivity read rests on the agent's own extrapolation of historical cost ratios, not a management-provided coefficient |
| Driver/worker-classification regulation — named the "single biggest lever" — carries a magnitude this pool cannot bound at all | Triggered | High | Low (near-term) | [07_earnings-sensitivity.md, §4, §6; business-model 10_external-dependency.md, §5] | A reclassification ruling in a major market would strike Mobility and Delivery's independent-contractor cost structure simultaneously — a discrete, binary trigger, not a gradual drift |
| Multiple sensitivity variables are linked, not independent: bookings deceleration and SG&A operating-deleverage compound in a downturn; insurance-cost and regulation share the same root cause (state insurance/tort/labor regimes) | Triggered | Medium | Medium | [07_earnings-sensitivity.md, §5] | The two largest quantified deltas in the sensitivity table can move together, not diversify — the range shown likely understates true downside |
| ~49% of FY2025 revenue booked outside the U.S./Canada with no disclosed hedge ratio, compounded by a euro-denominated ~€14bn Delivery Hero bridge facility | Triggered | Medium | Unknown | [business-model 10_external-dependency.md, §1; 02_revenue-drivers.md, §3] | Two FX exposures (revenue translation vs. euro-denominated debt) run in different directions and do not net out cleanly per the module's own interaction-effects read |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| An analyst's live-call statement ("bookings +22% constant currency, revenue +19%") does not reconcile with the CIQ-reported +12.2% revenue growth for the same quarter | Triggered | Medium | Unclear | [02_revenue-drivers.md, §3, §6] | Leaves an unresolved ~7pp gap between two sources describing the same quarter's revenue growth |
| Quarterly Gross Margin % (Estimates Report Consensus tab) diverges 5+pp from the annual/LTM GAAP gross margin (Income Statement tab) for the same company in the same period, only partially explained by an unverified management claim | Triggered | Medium | Unclear | [01_historical-financials.md, §3 flag; 03_margin-drivers.md, §4 flag] | Two internally-sourced CIQ series disagree with each other; resolution depends on a primary filing this pool does not contain |
| Upstream agents' framing of the earnings trajectory (02's "accelerating"/"durable" language for bookings vs. 01/04's "decelerating" reported-revenue read) | Not a hard contradiction — reconciled in §1 above | — | — | See §1, Contradictions Between Agents | Both readings are evidenced; the divergence is in emphasis (KPI vs. financial-statement metric), not in the underlying facts |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The revenue-driver narrative ("Mobility Gross Bookings is the single biggest driver," "improving," "durable rather than one-off") is built substantially on an unaudited, management-quoted KPI, while the audited-adjacent, CIQ-reported Revenue metric is decelerating and has missed consensus for two straight quarters | Triggered | High | High | [02_revenue-drivers.md, §7; 01_historical-financials.md, §3, §6] | The module's own "single biggest driver" framing risks anchoring the reader to the more favorable of two available growth measures |
| The "earnings accelerating" impression from the Adjusted EBITDA/EPS beat streak sits alongside a GAAP net income series that is majority non-operating (deferred-tax benefit, mark-to-market swings) in both FY2024 and FY2025 | Triggered | High | High | [06_earnings-quality.md, §10; business-model 12_red-flags-sweep.md, §3–§4] | A synthesizer reading "profitability turned the corner" from GAAP net income growth would be measuring a tax and mark-to-market swing, not marketplace economics, per the business-model module's own cross-cutting-pattern finding |
| The pending Delivery Hero acquisition — an asymmetric €700mm/€200mm break fee, an ~18-month uncertain multi-jurisdiction closing runway, and an explicitly unsized future P&L impact — sits outside this module's current-quarter scope but is a real overhang the beat/miss setup does not price | Triggered | Medium | Unknown (timing and outcome both) | [business-model 12_red-flags-sweep.md, §2; 03_margin-drivers.md, §9] | The current-quarter "setup is balanced" verdict in `05_beat-miss-setup.md` does not extend to the 12-month horizon once this deal's financing and integration costs begin to show up |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Data Completeness | No primary SEC filing anywhere in the pool; all figures are vendor transcriptions | Triggered | High | High | No number in this module is independently verified against the audited filing |
| 2 | Historical Trend | Revenue growth decelerating (two slowest quarters of last 8) while bookings still grow >20% | Triggered | High | High | Central unresolved fork: accelerating (bookings) vs. decelerating (revenue) |
| 3 | Revenue | ~10pp bookings-to-revenue gap not decomposable into take rate/mix/FX/M&A | Triggered | High | High | Cannot separate real demand growth from genuine price/take-rate erosion |
| 4 | Margins | Insurance-cost tailwind fully reinvested, zero disclosed buffer if reversed | Triggered | High | Medium | Would hit Adjusted EBITDA directly and immediately if the tailwind reverses |
| 5 | Margins | SG&A leverage (largest quantified sensitivity, ±$780mm) already reversing | Triggered | High | Medium-High | The bear-case direction on the biggest swing factor has already started |
| 6 | Beat/Miss Setup | In-line Q3 print risk masking a soft, unsized Q4 guide (AV/Delivery Hero costs) | Triggered | High | Unknown | Could flip the setup from "beat streak intact" to "inflecting negative" without a Q3 miss |
| 7 | Earnings Quality | GAAP net income/EPS dominated by a recurring non-cash deferred-tax benefit ($5,758mm FY24 / $4,346mm FY25) | Triggered | High | Medium | Headline GAAP EPS growth is a tax event, not an operating signal |
| 8 | Sensitivity | Driver/worker-classification regulation — unbounded magnitude, single biggest lever | Triggered | High | Low (near-term) | A major-market reclassification ruling would strike Mobility and Delivery simultaneously |
| 9 | Narrative/Framing | Revenue narrative leans on unaudited Gross Bookings KPI while reported Revenue decelerates/misses | Triggered | High | High | Risks anchoring the reader to the more favorable of two available growth measures |
| 10 | Narrative/Framing | "Earnings accelerating" impression rests on Adj. EBITDA/EPS while GAAP net income is majority non-operating | Triggered | High | High | A naive GAAP-profitability read would be measuring tax/mark-to-market swings, not the business |
| 11 | Margins | ~25% of the Adj. EBITDA-vs-GAAP-EBITDA gap beyond SBC (~$592mm FY25) is not itemized | Triggered | Medium | High | A material slice of the guided EBITDA metric cannot be explained from available data |
| 12 | Margins | Corporate G&A/Platform R&D unallocated cost pool (-31% of EBITDA) not broken out | Triggered | Medium | High | Obscures how much of the cost base is fixed vs. discretionary |
| 13 | Margins | Quarterly gross-margin "optical" reclassification claim unverified against a primary filing | Unclear | Medium | Unknown | If the framing is wrong, the FQ1'26–FQ2'26 gross-margin gain is smaller than reported |
| 14 | Guidance/Consensus | No formal Revenue guidance issued since FQ2 2020 | Triggered | Medium | High | The decelerating metric has no company-guided anchor, only a Street estimate |
| 15 | Guidance/Consensus | Adj. EBITDA/EPS consensus now sits at, not below, the new guidance midpoints | Triggered | Medium | High | The beat cushion that supported the last two quarters has largely closed |
| 16 | Guidance/Consensus | Revenue estimate revisions falling, negative net breadth last month | Triggered | Medium | High | Revision momentum on the un-guided metric is moving the wrong way into the print |
| 17 | Beat/Miss Setup | Revenue miss case simpler/more probable than the revenue beat case | Triggered | Medium | Medium-High | Asymmetric setup on the metric with the least company-guided support |
| 18 | Earnings Quality | Large, sign-flipping mark-to-market gains/losses embedded in GAAP net income | Triggered | Medium | High | A second, independent source of GAAP-earnings noise |
| 19 | Earnings Quality | SBC ($1,826mm FY25, ~3.5% of revenue) excluded from Adjusted EBITDA | Triggered | Medium | High | Standard practice, but a real dilutive cost the guided metric does not reflect |
| 20 | Earnings Quality | Deferred Tax Assets now ~39–40% of total equity, contingent on future taxable income | Triggered | Medium | Low-Medium | A future valuation-allowance reinstatement would be a large negative one-off |
| 21 | Earnings Quality | "Other Long-Term Assets" growing faster than revenue, composition not itemized | Unclear | Medium | Unknown | Cannot resolve whether this reflects capitalized costs, equity stakes, or ROU assets |
| 22 | Sensitivity | No company-disclosed sensitivity table; Earnings Volatility Score confidence explicitly Low | Triggered | Medium | High | The entire sensitivity read is this module's own inference, not a management coefficient |
| 23 | Sensitivity | Bookings-deceleration and SG&A-deleverage risks can compound; insurance cost and regulation share a root cause | Triggered | Medium | Medium | The disclosed sensitivity range likely understates true downside |
| 24 | Sensitivity | ~49% of revenue FX-exposed, no disclosed hedge ratio, compounded by euro Delivery Hero facility | Triggered | Medium | Unknown | Two FX exposures run in different directions and do not net out cleanly |
| 25 | Source Conflicts | Analyst live-call "+19% constant currency" claim does not reconcile with CIQ +12.2% reported revenue | Triggered | Medium | Unclear | Leaves a ~7pp gap between two sources describing the same quarter unresolved |
| 26 | Source Conflicts | Quarterly gross margin diverges 5+pp from annual/LTM GAAP gross margin, only partly explained | Triggered | Medium | Unclear | Two internally-sourced CIQ series disagree; resolution needs a primary filing |
| 27 | Narrative/Framing | Delivery Hero deal overhang (asymmetric break fee, unsized P&L impact) not priced into the current-quarter setup | Triggered | Medium | Unknown | The "setup is balanced" verdict does not extend past the current quarter once this deal's costs begin to show |
| 28 | Beat/Miss Setup | Historical Adj. EBITDA/EPS "beat streak" backing the beat case is only two quarters | Triggered | Low | High (as a data-limitation) | A thin base rate for a pattern the setup partly relies on |
| 29 | Revenue | Freight in a multi-year trough, not discussed at all on the Q2 FY2026 call | Triggered | Low | High | A full quarter of driver commentary is absent for ~10% of revenue |
| 30 | Revenue | US/Canada 50.9% of revenue, fully transactional, no long-term contracts anywhere | Triggered | Low | High | No revenue backlog exists to smooth a demand shock |
| 31 | Guidance/Consensus | GAAP EPS revision breadth sign-flips between windows | Triggered | Low | High | Confirms GAAP EPS revisions are non-operating noise, already correctly excluded from the guided-metric read |
| 32 | Data Completeness | No FX/commodity/interest-rate sensitivity table anywhere in the pool | Triggered | Low | High | Every sensitivity dollar figure in this module is inference, not disclosure |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 29 |
| Critical flags | 0 |
| High flags | 9 |
| Medium flags | 18 |
| Low flags | 5 |
| Unclear flags | 3 |
| Unavailable checks (data missing) | 1 |

## 5. Red-Flag Severity Verdict

**Material concerns** — high-severity flags present; earnings setup may be overstated or fragile.

The setup's cash-backed core (CFO exceeding Adjusted EBITDA for three straight years, a shrinking working-capital cycle) is genuinely clean. But the earnings *narrative* leans on two things that this scan cannot fully verify: an unaudited Gross Bookings KPI standing in for a decelerating, twice-missing reported Revenue line, and an Adjusted EBITDA/EPS beat streak sitting next to a GAAP net income series that is majority non-operating tax benefit two years running. The single most dangerous red flag is the unreconciled ~10-percentage-point gap between +22% Gross Bookings growth and +12.2% reported Revenue growth [02_revenue-drivers.md, §6] — if that gap turns out to be driven more by genuine price/take-rate erosion than by the "optical" U.K. accounting explanation management offers, the entire "demand is accelerating" framing inverts. This would be resolved by the FY2025 10-K's actual MD&A revenue bridge or the FQ3 2026 10-Q, neither of which is in this data pool.

## 6. What The Synthesis Agent Should Know

- 29 flags triggered/unclear across 10 categories: 9 High, 18 Medium, 5 Low, 3 Unclear, 1 Unavailable. Zero Critical.
- The single most dangerous red flag: the unreconciled ~10pp Gross Bookings-to-Revenue growth gap [02_revenue-drivers.md, §6] — this determines whether the setup is genuinely "accelerating" (management's framing) or "decelerating" (the reported-financials framing in 01/04). Would be resolved by a primary filing's revenue bridge, which is absent from this pool.
- No red flag here should independently change the earnings verdict category chosen by `99_earnings-synthesis` — but the synthesis should weight the reported-Revenue deceleration (two consecutive Street misses, falling revision momentum) at least as heavily as the Gross Bookings acceleration story, since 02_revenue-drivers's own optimistic framing is not fully corroborated by the module's own reported numbers.
- Score caps to carry forward: current-quarter mix-shift clarity is already capped at max 70 per the stale segment P&L (02, 03); Earnings Volatility Score confidence is explicitly Low per 07's own score cap trigger (no disclosed sensitivity table).
- Contradictions to reconcile: (1) 02's "durable"/"improving" bookings framing vs. 01/04's decelerating reported-revenue framing — both evidenced, differ in which metric is emphasized; (2) the analyst's unreconciled "+19% constant currency" claim vs. CIQ's +12.2% reported figure — neither source resolves this; (3) the quarterly gross-margin step-change vs. the LTM GAAP gross margin — CFO's "optical" explanation is unverified against a primary filing.
- Missing data that prevented a full scan: no primary 10-K/10-Q/8-K anywhere in the pool (every figure is a CIQ vendor transcription); no company-disclosed sensitivity table; no Gross Bookings/MAPC audited series; no FQ3 2026 CFO shareholder letter or investor deck.
- The setup is dirtier than the upstream agents' individual framings suggest in isolation — each of 01–07 flags its own caveats accurately, but no single upstream agent connects the bookings-vs-revenue gap, the SG&A-reversal-already-visible point, and the GAAP-earnings-quality distortion into one combined read of how fragile the "beat streak" narrative actually is. This agent's job was to make that connection explicit.

## 7. Pre-Mortem — If The Earnings Setup Fails

If this earnings setup turns out to be wrong, the most likely reason is that the ~10-percentage-point gap between +22% Gross Bookings growth and +12.2% reported Revenue growth [02_revenue-drivers.md, §6] was driven more by genuine, ongoing price/take-rate erosion in Mobility than by the "optical, non-economic" U.K. reclassification management described on the call — a claim this scan could not verify against a primary filing because no 10-Q is present in the data pool. If that is the true driver, the Adjusted EBITDA/EPS beat streak the bull case leans on is being funded by a shrinking take rate rather than durable cost discipline, and the two-quarter Revenue miss streak already visible in the data [04_guidance-consensus.md, §6] is the leading indicator that was underweighted relative to the more favorable Gross Bookings framing.
