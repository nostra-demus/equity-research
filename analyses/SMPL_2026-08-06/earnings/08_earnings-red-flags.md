# Earnings Red Flags — SMPL

All eight upstream earnings outputs (00 through 07) are present and were read in full. Business-model cross-module outputs are available at `analyses/SMPL_2026-08-06/business-model/` and were used, specifically `12_red-flags-sweep.md`, `11_capital-allocation-governance.md`, `03_segment-map.md`, `06_value-chain.md`, and `10_external-dependency.md`. No upstream output is missing; this scan proceeds at full confidence on data completeness (00's own sufficiency verdict is "Sufficient"), though several individual disclosure gaps are flagged below in their own right.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 04_guidance-consensus | FQ4 FY26 and FY26 guidance sit within 0.5% of Street consensus on net sales and Adjusted EBITDA — a genuinely matched bar, not sandbagged | [04_guidance-consensus output, §3] | High |
| 04_guidance-consensus / 05_beat-miss-setup | Three consecutive quarterly beats on revenue and EPS, widening each time (+0.1%→+0.3%→+7.3% revenue; +8.1%→+13.6%→+19.5% EPS) | [04_guidance-consensus output, §6] | High |
| 06_earnings-quality | Cash conversion has not broken down: GAAP CFO/EBITDA ran 76–100% FY2023–2025; Adjusted-EBITDA-based conversion stayed at 62–80% through the Latest TTM | [06_earnings-quality output, §2] | High |
| business-model 11_capital-allocation-governance | Conservative leverage (0.5x net debt/Adjusted EBITDA at FY2025-end) with wide covenant headroom (max 6.00x, in compliance) | [business-model/11_capital-allocation-governance, §1] | High |
| business-model 11_capital-allocation-governance | Board chair (Kilts) and an independent director (Daley) bought shares on the open market near the FY2026 lows | [business-model/11_capital-allocation-governance, §1] | Medium |
| 02_revenue-drivers | Quest household penetration at a multi-year high (20.5%, +120bps y/y) and still rising; Quest is 63.7% of nine-month FY2026 net sales | [02_revenue-drivers output, §3–4] | High |
| 03_margin-drivers | FQ4 FY26 gross margin guided as "our strongest of the year," and FQ3's productivity-driven margin already beat the company's own internal forecast | [03_margin-drivers output, §5] | Medium |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | Four consecutive quarters of YoY revenue decline (−0.3% to −9.4%); TTM revenue −4.5% to $1,392.2M | [01_historical-financials output, §3, §6] | High |
| 01_historical-financials / 03_margin-drivers | Gross margin fell from 40.7% (FY21) to ~32.5% (latest quarter); the company's own Adjusted EBITDA margin fell from 20.2% (FY24) to 16.9% (Latest TTM) — a genuine ~330bps deterioration, not an impairment artifact | [01_historical-financials output, §2; 03_margin-drivers output, §3] | High |
| 06_earnings-quality | $391.9M cumulative goodwill/brand impairment across three of the last four quarters, excluded from Adjusted EBITDA every time | [06_earnings-quality output, §5, §9–10] | High |
| 04_guidance-consensus | FY2027 Street estimates falling every 30/60/90-day window; net revision breadth −4 to −6 across revenue/EBITDA/EPS over the last three months | [04_guidance-consensus output, §4–5] | High |
| 02_revenue-drivers | Atkins retail takeaway down 23.4%–24.6% two quarters running; household penetration −220bps y/y; Walmart already cut Atkins's shelf assortment | [02_revenue-drivers output, §5] | High |
| business-model 12_red-flags-sweep | CEO, principal accounting officer, and organizational structure all changed inside a 2–3 quarter window coinciding exactly with the impairment quarters; ~$25M restructuring cost | [business-model/12_red-flags-sweep, §2, §4] | Medium |
| 01_historical-financials | Net debt rose from $206.0M (FY2025-end) to $324.6M (FQ3 FY26) on $242.3M of buybacks funded while Adjusted EBITDA was falling | [01_historical-financials output, §6] | High |
| 03_margin-drivers / 07_earnings-sensitivity | Zero commodity hedges against the single highest-sensitivity variable (unhedged input-cost inflation, ~$27M / 12% of the FY2026 EBITDA guide) | [03_margin-drivers output, §8; 07_earnings-sensitivity output, §4] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| Brand-level P&L / margin / EBITDA disclosure (SMPL discloses one GAAP reportable segment under ASC 280) | 02_revenue-drivers §1; 03_margin-drivers §1 | Caps confidence in every brand-level driver and sensitivity figure; all brand-level EBITDA flow-through numbers are labeled inference, not filed data |
| Maintenance vs growth capex split | 06_earnings-quality §1 | Cannot confirm whether reported free cash flow (the cash left after running the business and paying for equipment) understates the true recurring figure now that capex has roughly quadrupled |
| Quantified tariff cost impact | 07_earnings-sensitivity §2 | A named FY2026 cost headwind carries no dollar sizing anywhere in the pool |
| Formal company volume/price/mix walk for any period | 02_revenue-drivers §6 | The growth decomposition used in this module relies on an agent-computed brand-revenue proxy, not a number the company itself discloses |
| Licensed alt-data consumption panel | 05_beat-miss-setup §10; 00_earnings-data-triage §1A | No early-warning signal exists for a consumption deceleration ahead of the reported print |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| 01_historical-financials | CFO (cash from operations) trend is "Deteriorating" — TTM CFO down 19.0% year-over-year in dollar terms | 06_earnings-quality | Cash conversion "itself has not broken down" — the CFO/EBITDA ratio has stayed above the 50% breakdown trigger on every basis tested | Y | Both — they are measuring different things (absolute CFO dollars vs the CFO/EBITDA ratio), not disagreeing on the underlying numbers. The synthesis should carry both framings together: cash generation is genuinely shrinking in dollar terms even though the conversion ratio has not collapsed |
| business-model 11_capital-allocation-governance | Classifies the OWYN write-down and leadership-turnover pattern as "Capital allocation concerns," explicitly stating "this is not a governance red flags case" | business-model 12_red-flags-sweep | Adds the CEO severance economics and the CFO/Principal-Accounting-Officer dual-hat, and argues "fully disclosed is not the same as governance-neutral" | Y | 12_red-flags-sweep is more complete (it adds facts 11 did not quantify) without actually reversing 11's classification — both stop short of a hard governance disqualifier, consistent with the business-model module's own `01_disqualifier-scan` finding of no hard trigger. This is a difference in emphasis, not a factual conflict, but the earnings synthesis should weight the fuller picture (11 + 12 together) when it reads the leadership-transition risk, not 11 alone |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No brand-level P&L, margin, or EBITDA disclosure (one GAAP reportable segment under ASC 280) | Triggered | High | High | [02_revenue-drivers output, §1; 03_margin-drivers output, §1] | Caps confidence in every brand-level driver and sensitivity claim; 07_earnings-sensitivity itself labels brand-level EBITDA flow-through figures "Low confidence" |
| No maintenance vs growth capex split disclosed | Triggered | Medium | High | [06_earnings-quality output, §1] | Free cash flow may understate or overstate the true recurring figure now that capex has roughly quadrupled with no disclosed reason |
| No formal company-disclosed volume/price/mix walk for any period | Triggered | Medium | High | [02_revenue-drivers output, §6] | Growth decomposition relies on an agent-computed brand-revenue proxy rather than a filed number; the FY2025 9.0% net-sales growth vs 5.5% consumption-growth gap cannot be cleanly attributed |
| Tariff cost impact not quantified by the company | Triggered | Medium | High | [07_earnings-sensitivity output, §2] | A named, active FY2026 cost headwind carries zero disclosed dollar sizing, so its size relative to the guided ~375bps gross-margin decline cannot be isolated |
| Current market price not directly confirmed in this module's triage pass | Unclear | Low | Unknown | [00_earnings-data-triage, §3, §5] | Flagged as a watch item for the master synthesizer (agent 99), not a gap that changes the earnings-setup read itself |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Revenue growth inflected from five years of gains to four consecutive quarters of YoY decline | Triggered | High | High | [01_historical-financials output, §3, §6] | Directly contradicts any framing of the setup as "accelerating"; the last five quarters are the relevant trend, not the five-year growth history |
| GAAP EBITDA/EBIT swung deeply negative on a non-cash impairment while the company's own clean KPI (Adjusted EBITDA margin) also fell a genuine ~330bps on the Latest TTM | Triggered | High | High | [01_historical-financials output, §2] | Confirms the margin compression is a real operating trend, not just a one-off accounting artifact of the write-down |
| QoQ revenue improvement (FQ3 +9.5%) sits alongside continued YoY deterioration (−6.3%) in the same quarter | Unclear | Medium | Medium | [01_historical-financials output, §3] | Risk that a reader anchors on the positive quarter-over-quarter move rather than the year-over-year read the historical-financials agent itself calls more reliable |
| One-off items are now the third occurrence in four quarters ($391.9M cumulative impairment) | Triggered | High | High | [06_earnings-quality output, §5, §9] | Repetition undermines the "one-off" label management continues to use in its non-GAAP reconciliation |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Company retail takeaway declined 6.7% while the underlying "purposeful nutrition" category grew 10% in the same 13-week period | Triggered | High | High | [02_revenue-drivers output, §3] | A clear share loss (~17 percentage points in one quarter), not merely a soft category — a stronger negative signal than a simple demand-weakness read |
| Two-customer concentration: Walmart (~31%) + Amazon (~18%) ≈ 49% of FY2025 net sales, both at-will with no minimum-purchase commitments | Triggered | High | Medium | [02_revenue-drivers output, §4; FY2025 10-K, Item 1A] | A single retailer assortment decision — as already happened once to Atkins — can move total revenue materially with no contractual protection |
| Deliberate FQ4 FY26 under-shipment relative to consumption (channel/inventory reset) | Unclear | Medium | Medium | [02_revenue-drivers output, §3; 05_beat-miss-setup output, §3] | Could be a clean, one-time timing reset as management describes, or could mask a deeper consumption deceleration; the two cannot be distinguished from filings alone |
| Atkins in structural decline (household penetration −220bps y/y, retail takeaway −23.4% to −24.6% two quarters running) tied to shelf-space loss and admitted marketing under-investment | Triggered | High | High | [02_revenue-drivers output, §5] | Second-largest brand (24.9% of nine-month FY2026 net sales) in a self-inflicted decline per management's own words, not yet stabilized |
| FY2025 net sales growth (+9.0%) vs disclosed brand consumption growth (+5.5%) leaves an unreconciled ~3.5pp gap, partly a calendar/M&A-timing artifact | Triggered | Medium | Medium | [02_revenue-drivers output, §6] | Already correctly excluded from any "organic growth" claim by 02_revenue-drivers, but the underlying gap is itself a data-quality flag for anyone using headline net-sales growth as an organic-demand proxy |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Zero commodity hedges against the cost line management itself names first every quarter for gross-margin moves | Triggered | High | High | [03_margin-drivers output, §8; FY2025 10-K, Item 1A] | No structural buffer against the single highest-sensitivity variable in the entire report (see §2.8 below) |
| Pass-through pricing lag (~12 months between cost inflation showing up and the offsetting price action reaching the market) | Triggered | Medium | High | [03_margin-drivers output, §3] | A full cycle of adverse cost moves is felt well before any price offset arrives — a timing asymmetry, not a symmetric risk |
| FY2025 marketing-spend cut (−6.7%) is named by the CEO as a direct cause of Atkins's household-penetration decline, and is now reversing (S&M +15.9% YoY in FQ3 FY26) | Triggered | Medium | High | [03_margin-drivers output, §2] | Last year's apparent SG&A "discipline" was not a sustainable margin gain — it is now a margin cost being paid back, and the S&M line is a genuine headwind again |
| Operating deleverage: a largely fixed G&A/D&A base spread over four straight quarters of declining revenue | Triggered | Medium | High | [03_margin-drivers output, §5; 07_earnings-sensitivity output, §6] | A given revenue decline now costs more margin than an equivalent revenue gain would add — the downside is structurally larger than the upside |
| Capex roughly quadrupled (FY2021–24 average ~$7M to $20.5M FY25, $28.1M TTM) while D&A has stayed flat — a coming depreciation step-up not yet in the P&L | Triggered | Medium | High | [03_margin-drivers output, §9; 06_earnings-quality output, §8] | A forward margin headwind that is invisible in the current-period numbers |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| FY2027 estimate revisions falling every 30/60/90-day window; net revision breadth −4 to −6 across revenue/EBITDA/EPS, unresolved | Triggered | High | High | [04_guidance-consensus output, §4–5] | The Street has not finished de-risking the out-year model even though the near-term bar looks fair — the medium-term setup is still being marked down |
| Company beat FQ3 FY26 revenue/EPS by the widest margin of the streak (+7.3%/+19.5%), then guided FQ4 to a steeper YoY decline (−13% to −10%) than the just-reported quarter's actual decline (−6.3%) | Triggered | High | High | [04_guidance-consensus output, §6; 01_historical-financials output, §3] | A beat-and-lower-guide pattern that could be misread as "accelerating" if only the trailing print is weighted, not the forward guide |
| FQ3 FY26 revenue/EPS beat coincided with a GAAP gross-margin MISS versus both the prior guided range and consensus (31.6% actual vs 36.40–36.60% guided, 33.29% consensus) | Triggered | High | High | [04_guidance-consensus output, §6] | Quality-of-beat concern: the headline beat and the leading-indicator margin line moved in opposite directions in the same quarter |
| Capex guidance sourcing conflict: verbatim transcript ($25M–$30M) vs same-dated Capital IQ Guidance tab ($20M–$25M), unresolved | Triggered | Medium | Medium | [04_guidance-consensus output, §2] | A $5M discrepancy on both ends of the range that has not been reconciled against a company press release |
| EPS beat pattern partly attributable to a falling share count (buybacks) and a favorable one-off tax benefit (Canadian subsidiary wind-down), not solely operating outperformance | Triggered | Medium | Medium | [06_earnings-quality output, §5, §8] | Below-the-line items flatter the reported EPS beat magnitude relative to core operating performance |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Beat streak is short (three quarters) and was already reset once before (FQ4 FY25 was an EPS miss) | Triggered | Medium | Medium | [05_beat-miss-setup output, §7] | Limited statistical power — a single miss resets the "recent conservative guide-setting" read to a much weaker three-out-of-five pattern |
| In-line FQ4 print risk is masked by a weak initial FY27 guide — the forward market reaction is set by the FY27 framing, not the trailing print | Triggered | High | Medium | [05_beat-miss-setup output, §5] | A clean FQ4 beat would not resolve the setup if the FY27 initial guide confirms the Street's already-negative revision trend |
| The miss case (unhedged, worsening commodity inflation) needs only one uncontrolled variable to move against the company, while the fuller beat case depends on several sub-category and channel-timing developments holding together at once | Unclear | Medium | Medium | [05_beat-miss-setup output, §2–3; 07_earnings-sensitivity output, §4] | Not a stark CLAUDE.md §10 conjunction violation, but the miss path is structurally simpler than the beat path |
| No licensed alt-data consumption panel exists to catch a consumption deceleration ahead of the reported number | Triggered | Medium | Medium | [05_beat-miss-setup output, §10; 00_earnings-data-triage output, §1A] | The engine's own pre-mortem names this exact blind spot as the way this setup would fail without warning |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Four of five applicable accrual-quality flags triggered (`RF-EQ-001`): revenue outgrowing CFO, receivables/inventory outgrowing revenue/COGS, capitalized costs rising | Triggered | High | High | [06_earnings-quality output, §6] | A textbook accrual-divergence pattern — earnings growth in some periods has not been matched by cash and working-capital discipline |
| Adjusted EBITDA has now excluded a $391.9M cumulative impairment across three of the last four quarters (56.3% of FY2025 GAAP EBITDA) | Triggered | High | High | [06_earnings-quality output, §4, §9–10] | The "clean" number investors are pointed to structurally cannot show this as anything but noise, despite it being a real, cash-relevant loss on prior acquisitions |
| Restructuring / integration costs recur every period despite being labeled non-recurring in the non-GAAP reconciliation | Triggered | High | High | [06_earnings-quality output, §4, §8] | Integration expense has recurred every period for two-plus years since the OWYN deal, and a separate restructuring charge reappeared in FY2026 |
| Adjusted-EBITDA-based cash conversion weakening (80% → 64% → 63%, FY2024 to Latest TTM) even though it has not breached the "breakdown" trigger | Triggered | Medium | Medium | [06_earnings-quality output, §2] | A genuine deterioration, correctly not overstated as a breakdown by the earnings-quality agent, but a real trend the synthesis should not ignore |
| Effective tax rate reduced by a one-off benefit (wind-down of a legacy Canadian subsidiary) in the same period used for the EPS beat | Triggered | Medium | Medium | [06_earnings-quality output, §5, §8] | Flatters the near-term reported EPS and effective tax rate relative to a clean operating read |
| Inventory days up 9.1% cumulatively over two years against a demand backdrop of four straight quarters of YoY revenue decline | Triggered | Medium | High | [06_earnings-quality output, §3] | Risk that inventory is building against softening sell-through rather than growth |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Unhedged commodity/input-cost inflation is the single highest-sensitivity variable (±$27M Adjusted EBITDA, ~12% of the FY2026 guidance midpoint) and is currently moving the wrong way | Triggered | High | High | [07_earnings-sensitivity output, §2, §4] | External, uncontrolled, and the FY2026 guide already bakes in further deterioration (a further ~375bps GAAP gross-margin decline) |
| Tariffs and commodity inflation are not independent — both raise the landed cost of the same imported inputs, compounding rather than offsetting, with no hedge against either | Triggered | High | Medium | [07_earnings-sensitivity output, §5] | Treating these as two separate, additive-only risks understates the combined downside if both move adversely together |
| The September 2026 price increase and its offsetting volume elasticity are mechanically linked, not independent — a worse commodity outcome raises the odds management leans harder on price, which raises the odds of landing in the volume-loss bear case | Triggered | High | Medium | [07_earnings-sensitivity output, §5] | The proposed fix for the #1 risk above carries its own, correlated downside rather than being a clean offset |
| Operating deleverage makes the downside asymmetric — a revenue miss costs more margin than an equivalent revenue beat gains | Triggered | Medium | High | [07_earnings-sensitivity output, §6] | A non-linear risk already identified and qualitatively sized by the sensitivity agent |
| Brand-level sensitivity dollar figures rely on a consolidated-margin flow-through assumption, not a disclosed brand P&L | Triggered | Medium | High | [07_earnings-sensitivity output, §1–2] | Labeled "Low confidence" by the sensitivity agent itself — a real limitation on the precision of any brand-specific dollar estimate used elsewhere in the module |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| FY2026 capex guidance: verbatim transcript ($25M–$30M) vs Capital IQ Guidance tab, same-dated entry ($20M–$25M) | Triggered | Medium | Medium | [04_guidance-consensus output, §2] | An unresolved $5M discrepancy on both ends of the range that the module could not settle from the pool alone |
| 01_historical-financials calls the CFO trend "Deteriorating" (dollar terms) while 06_earnings-quality states cash conversion "has not broken down" (ratio terms) | Unclear | Low | Low | [01_historical-financials output, §1–2; 06_earnings-quality output, §2] | Reconcilable — both are correct on their own metric, but a reader consulting either report alone could draw an inconsistent impression of cash health |
| business-model 11_capital-allocation-governance classifies the leadership/OWYN pattern as "Capital allocation concerns" while 12_red-flags-sweep adds the CEO severance economics and the CFO/Principal-Accounting-Officer dual-hat and argues disclosure is not the same as governance-neutrality | Unclear | Medium | Medium | [business-model/11_capital-allocation-governance, §2–4; business-model/12_red-flags-sweep, §2–3] | A difference in emphasis between two business-model agents on the same underlying facts; the earnings synthesis should weight the fuller (11+12) picture when assessing leadership-transition risk |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| A three-quarter widening beat streak could be narrated as "earnings accelerating," but the underlying trajectory is four consecutive quarters of YoY revenue decline, structurally compressing margins, and a guide implying an even steeper decline next quarter | Triggered | High | High | [01_historical-financials output, §3, §6; 04_guidance-consensus output, §6; 05_beat-miss-setup output, §8] | The single largest framing risk in this report — a synthesis that leads with the beat streak without the trend underneath would misstate the setup |
| Management explicitly frames FY2026 as "the early stages of our turnaround" with a returning former CEO — a turnaround narrative not yet backed by two to three years of proven delivery (CLAUDE.md §24 Filter 2) | Triggered | High | Medium | [03_margin-drivers output, §3; business-model/12_red-flags-sweep, §1] | The base rate for turnaround success is low; one quarter of productivity-driven margin outperformance is not proof of an inflection, and should not lift conviction on its own |
| The setup's single biggest sensitivity driver (unhedged commodity inflation, compounded by tariffs) is macro/commodity/policy-driven, not company-specific | Triggered | Medium | High | [07_earnings-sensitivity output, §2, §4–5] | The earnings synthesis should classify this thesis honestly per CLAUDE.md §14 rather than as a pure company-specific execution story |
| A near-term "balanced" beat/miss setup (FQ4 FY26) risks being conflated with the 12-month setup, which hinges on the unresolved September 2026 price increase / elasticity trade-off and still-falling FY27 Street estimates | Triggered | High | Medium | [05_beat-miss-setup output, §8–9; 04_guidance-consensus output, §4–5] | The quarter that actually determines the thesis (FQ1 FY27) is two quarters away and carries no company guidance yet |
| Bull case relies mostly on cited numbers rather than adjectives | Not Triggered | — | — | [Consistent across 02, 03, 04, 05, 07 output] | Upstream reports cite specific figures throughout; this specific trap is not present in this module's own work |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Data Completeness | No brand-level P&L/margin/EBITDA disclosure | Triggered | High | High | Every brand-level number in this module is an inference, not a filed figure |
| 2 | Historical Trend | Revenue growth inflected negative — 4 straight quarters of YoY decline | Triggered | High | High | Contradicts an "accelerating" framing outright |
| 3 | Historical Trend | GAAP collapse + genuine ~330bps Adjusted EBITDA margin decline (not just the impairment) | Triggered | High | High | Margin compression is real, not an accounting artifact |
| 4 | Historical Trend | Third impairment in four quarters ($391.9M cumulative) | Triggered | High | High | Undermines the "one-off" label management still uses |
| 5 | Revenue | Company takeaway −6.7% while category grew +10% (share loss) | Triggered | High | High | A share-loss story, not just a soft market |
| 6 | Revenue | Walmart + Amazon ≈49% of net sales, at-will, no minimums | Triggered | High | Medium | A single retailer decision can move total revenue materially |
| 7 | Revenue | Atkins structural decline (−220bps penetration, −23–25% takeaway) | Triggered | High | High | Second-largest brand still deteriorating, self-inflicted per management |
| 8 | Margins | Zero commodity hedges on the top sensitivity driver | Triggered | High | High | No structural buffer against the biggest single swing factor |
| 9 | Guidance/Consensus | FY2027 estimates still falling every 30/60/90 days, breadth −4 to −6 | Triggered | High | High | Street has not finished de-risking the out-year model |
| 10 | Guidance/Consensus | Biggest-ever beat immediately followed by a steeper decline guide | Triggered | High | High | Beat-and-lower-guide pattern risks being misread as acceleration |
| 11 | Guidance/Consensus | Revenue/EPS beat coincided with a GAAP gross-margin miss | Triggered | High | High | Quality-of-beat concern — the leading-indicator margin line missed the same quarter |
| 12 | Beat/Miss Setup | In-line FQ4 print risk masked by a weak initial FY27 guide | Triggered | High | Medium | The forward reaction is set by FY27 framing, not the trailing print |
| 13 | Earnings Quality | 4 of 5 accrual-quality flags triggered (`RF-EQ-001`) | Triggered | High | High | Textbook accrual-divergence pattern between earnings and cash/working capital |
| 14 | Earnings Quality | Adjusted EBITDA excludes a $391.9M cumulative impairment | Triggered | High | High | The "clean" KPI structurally hides a real, recurring value-destruction pattern |
| 15 | Earnings Quality | Restructuring/integration costs recur every period despite "non-recurring" label | Triggered | High | High | Adjustments meant to be one-off have become structural |
| 16 | Sensitivity | Unhedged commodity inflation is the #1 sensitivity variable, moving the wrong way | Triggered | High | High | ~$27M / ~12% of FY2026 EBITDA guide swing, external and uncontrolled |
| 17 | Sensitivity | Tariffs and commodity inflation compound rather than offset | Triggered | High | Medium | Combined downside larger than treating each risk separately |
| 18 | Sensitivity | Price increase and elasticity are mechanically linked, not independent | Triggered | High | Medium | The fix for the #1 risk carries its own correlated downside |
| 19 | Narrative/Framing | Beat streak could be misread as "accelerating" against a decelerating base | Triggered | High | High | The single largest framing risk in this report |
| 20 | Narrative/Framing | Turnaround narrative not yet backed by proven multi-year delivery | Triggered | High | Medium | Base rate for turnaround success is low; one quarter is not proof |
| 21 | Narrative/Framing | 12-month setup risks conflation with the "balanced" near-term FQ4 read | Triggered | High | Medium | The quarter that determines the thesis is 2 quarters away with no guide yet |
| 22 | Data Completeness | No maintenance vs growth capex split | Triggered | Medium | High | Cannot confirm true recurring free cash flow as capex has quadrupled |
| 23 | Data Completeness | No formal volume/price/mix walk disclosed | Triggered | Medium | High | Growth decomposition relies on an agent-built proxy, not a filed number |
| 24 | Data Completeness | Tariff cost impact not quantified | Triggered | Medium | High | A named FY2026 headwind with zero dollar sizing |
| 25 | Revenue | FQ4 under-shipment vs consumption — reset or masked deceleration? | Unclear | Medium | Medium | Cannot be distinguished from filings alone |
| 26 | Revenue | 9.0% net-sales growth vs 5.5% consumption growth gap (FY2025) | Triggered | Medium | Medium | Headline net-sales growth is not a clean organic-demand proxy |
| 27 | Margins | ~12-month pass-through lag between cost inflation and price offset | Triggered | Medium | High | A full cycle of cost inflation is felt before any price relief arrives |
| 28 | Margins | FY2025 marketing cut (linked by CEO to Atkins decline) now reversing | Triggered | Medium | High | Last year's apparent SG&A discipline is being paid back as a margin cost |
| 29 | Margins | Operating deleverage on a fixed-cost base against declining revenue | Triggered | Medium | High | Downside margin impact of a revenue miss exceeds the upside of an equal beat |
| 30 | Margins | Capex quadrupled while D&A stayed flat — coming depreciation step-up | Triggered | Medium | High | A forward margin headwind invisible in the current numbers |
| 31 | Guidance/Consensus | Capex guidance conflict: transcript ($25–30M) vs vendor tab ($20–25M) | Triggered | Medium | Medium | An unresolved $5M discrepancy on both ends of the guided range |
| 32 | Guidance/Consensus | EPS beat partly from lower share count and a one-off tax benefit | Triggered | Medium | Medium | Flatters the beat magnitude relative to core operating performance |
| 33 | Beat/Miss Setup | Beat streak is short (3 quarters) and already reset once before | Triggered | Medium | Medium | Limited statistical power; a single miss resets the pattern |
| 34 | Beat/Miss Setup | Miss case (1 uncontrolled variable) is structurally simpler than the beat case (several developments needed) | Unclear | Medium | Medium | Not a stark asymmetry, but the miss path needs less to go right |
| 35 | Beat/Miss Setup | No alt-data consumption panel to catch a deceleration early | Triggered | Medium | Medium | The engine's own named blind spot for how this setup could fail unseen |
| 36 | Earnings Quality | Adjusted-EBITDA cash conversion weakening (80%→64%→63%) | Triggered | Medium | Medium | A real deterioration, short of a "breakdown" but worth tracking |
| 37 | Earnings Quality | Tax-rate benefit (Canadian subsidiary wind-down) in the EPS-beat period | Triggered | Medium | Medium | Flatters the near-term reported EPS and effective tax rate |
| 38 | Earnings Quality | Inventory days up 9.1% over 2 years against declining revenue | Triggered | Medium | High | Risk inventory is building against softening sell-through |
| 39 | Sensitivity | Operating deleverage creates asymmetric downside | Triggered | Medium | High | Non-linear risk already qualitatively sized upstream |
| 40 | Sensitivity | Brand-level sensitivity dollars rely on a consolidated-margin proxy | Triggered | Medium | High | Labeled Low confidence upstream; a real precision limitation |
| 41 | Source Conflict | Capex guidance conflict (transcript vs vendor tab) | Triggered | Medium | Medium | Same item as #31, cross-referenced under Source Conflicts |
| 42 | Source Conflict | Business-model 11 vs 12 differ in emphasis on governance severity | Unclear | Medium | Medium | Synthesis should weight the fuller (11+12) picture, not 11 alone |
| 43 | Narrative/Framing | Setup is really a macro/commodity/policy bet on unhedged inputs | Triggered | Medium | High | Should be classified honestly per CLAUDE.md §14, not as pure execution |
| 44 | Historical Trend | QoQ improvement (+9.5%) sits beside continued YoY decline (−6.3%) | Unclear | Medium | Medium | Risk of anchoring on the less-reliable QoQ read |
| 45 | Data Completeness | Current market price not directly confirmed in this module's triage | Unclear | Low | Unknown | Watch item for agent 99; does not change the earnings-setup read |
| 46 | Source Conflict | 01 "CFO deteriorating" vs 06 "conversion has not broken down" | Unclear | Low | Low | Reconcilable — different metrics, not a real disagreement |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 40 |
| Critical flags | 0 |
| High flags | 21 |
| Medium flags | 19 |
| Low flags | 0 |
| Unclear flags | 6 |
| Unavailable checks (data missing) | 0 |

## 5. Red-Flag Severity Verdict

**Material concerns** — high-severity flags present; the earnings setup may be overstated or fragile.

The single most dangerous red flag is #19: the risk that the three-quarter widening beat streak gets read as "earnings accelerating" when the actual trajectory is four straight quarters of YoY revenue decline, genuine (not impairment-driven) margin compression of ~330 basis points, and a guide that implies an even steeper decline next quarter than the one just reported. What would resolve it: an FQ4 FY26 print and, more importantly, the initial FY27 guide (due alongside it on Oct-23-2026) showing the September 2026 price increase landing with volume elasticity at or below management's own stated 1.0x assumption, combined with FY27 Street estimates stabilizing rather than continuing to fall.

## 6. What The Synthesis Agent Should Know

- 40 red flags triggered (21 High, 19 Medium, 0 Critical), plus 6 Unclear items requiring judgment — no single flag is a hard disqualifier, but the volume and consistency of High-severity flags across revenue, margins, guidance, quality, and sensitivity argues against treating this as a clean setup.
- The single most dangerous flag: a beat-and-lower-guide pattern (three widening beats, then a guide implying a steeper YoY decline) that risks being narrated as acceleration when the underlying trend is deceleration — see Section 5.
- This module's own agents (04, 05) already hedge appropriately (bar called "fair," setup called "balanced," not "low" or "easy") — the synthesis should preserve that hedge rather than simplify it into a bullish or bearish headline.
- Consider whether "Mixed earnings setup" (per MODULE_RULES verdict categories) fits better than "Earnings stable" or "Earnings decelerating" alone: near-term guidance/consensus are matched (a stable signal) while the trailing trend, margin structure, and FY27 revisions are all decelerating — these are genuinely conflicting signals, not a single clean direction.
- Score caps to consider: the earnings-quality score of 44/100 ("Material concerns" band, per 06's own scoring) should not be averaged up by the beat streak; the earnings-volatility score of 68/100 (inverted — high volatility) reflects unhedged, correlated external variables that the synthesis should carry forward, not treat as independent, additive risks.
- Contradictions to reconcile: (1) "CFO deteriorating" (01) vs "cash conversion has not broken down" (06) — both correct, different metrics, carry both; (2) business-model 11 vs 12 differ in emphasis (not fact) on how much weight the CEO-severance/CFO-dual-hat facts should add to the "capital allocation concerns, not governance red flags" classification — the synthesis should read 11 and 12 together.
- Missing data that limited this scan: no brand-level P&L caps precision on every brand-specific number in this module; no maintenance/growth capex split; no quantified tariff impact; no alt-data consumption panel for early warning. None of these gaps changes the sufficiency verdict (00 called the pool "Sufficient"), but they cap the precision of specific claims as noted throughout Section 2.
- Net read: this setup is dirtier than a synthesis reading only 04/05 in isolation might conclude — 04 and 05 already flag the tension between the beat streak and the falling FY27 revisions, but this report adds the accounting/governance layer (06, plus business-model 11/12) that shows the "clean" Adjusted EBITDA number itself has structurally absorbed a real, recurring pattern of M&A value destruction and rising accrual divergence on top of the demand and margin trend.

## 7. Pre-Mortem — If The Earnings Setup Fails

If this earnings setup turns out to be wrong, the most likely reason is that the market (and this module) leaned on the three-quarter widening beat streak as a signal of improving execution, while the real swing factor — the September 2026 price increase running into volume elasticity at or above management's own stated 1.0x assumption, layered onto an already-decelerating Quest-bar and Atkins base and unhedged commodity cost inflation that is still worsening — broke worse than guided, and did so in a way that showed up first in retail consumption data rather than in a reported number. No licensed alt-data consumption panel exists anywhere in this pool (confirmed absent in `00_earnings-data-triage.md` §1A and named directly in `05_beat-miss-setup.md`'s own pre-mortem), so this is precisely the kind of deterioration the engine has no early-warning channel to catch before it appears in the FQ1 FY27 print — by which point the "accelerating" read built on the beat streak would already have been wrong for two quarters.
