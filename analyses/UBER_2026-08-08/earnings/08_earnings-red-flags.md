# Earnings Red Flags — UBER

Business-model module is available (`analyses/UBER_2026-08-08/business-model/`); this scan uses `03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`, `12_red-flags-sweep.md`, and `99_business-model-synthesis.md` as cross-module inputs alongside all eight earnings-module outputs (`00`–`07`). No upstream output is missing.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| `05_beat-miss-setup` | "Setup favors beat" for FQ3 2026 | EBITDA has beaten its own guidance in 4 of the last 4 quarters, above the guided high end in the last 2 by ~2.5% each [`05_beat-miss-setup.md` §7–8; `04_guidance-consensus.md` §6] | Medium — see the EBITDA-definition red flag in §2.9/§2.5 below, which weakens the specific evidentiary basis |
| `02_revenue-drivers` | Trip / Gross Bookings volume is strong and improving | Trips +18% YoY, Gross Bookings +22% constant-currency, four consecutive quarters above 20% CC growth, MAPCs +16% YoY [Q2 FY26 10-Q, MD&A Highlights] | High |
| `03_margin-drivers` | Genuine (ex-reclassification) cost-of-revenue leverage | +377bps of the +186bps total Q2 FY26 EBIT-margin gain came from genuine driver/courier-payment leverage, independently reconciled to GAAP figures [`03_margin-drivers.md` §8a] | High |
| `06_earnings-quality` | Cash generation is genuinely strong | CFO exceeded reported EBITDA by 150–200% in every profitable year FY2023–FY2025; 0 of 6 accrual-quality flags triggered; DSO/DPO trends favorable [`06_earnings-quality.md` §2–3, §6] | High |
| `01_historical-financials` | EBITDA/EBIT margin expanding every year for 5 straight years | EBITDA margin (16.8%) → 12.1%, EBIT margin (22.0%) → 10.7%, FY2021–FY2025 [`01_historical-financials.md` §1] | High |
| `03_margin-drivers` | Delivery segment margin expanding faster than revenue | Segment Operating Income +38% vs revenue +28% in Q2 FY26 [`03_margin-drivers.md` §7] | Medium-High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| `04_guidance-consensus` | Revenue estimates are being cut, not raised, right after the print | FQ3 2026 revenue consensus fell 1.04% in 3 trading days post-print; net revision breadth −11 (8 up / 19 down) at the FQ3 level [`04_guidance-consensus.md` §3, §5] | High |
| `business-model/12_red-flags-sweep` | GAAP net income inflated 2 straight years by one-off, non-cash tax items | $6.4bn combined FY24 federal/state deferred-tax valuation-allowance release; $5.0bn Netherlands valuation-allowance release in FY25 — reported net income ran roughly double pretax income in both years [`12_red-flags-sweep.md` §2, RF-RFS-001] | High |
| `business-model/12_red-flags-sweep` | $12.5bn self-insurance reserve (Critical Audit Matter) is a real driver of the CFO/FCF growth story | Reserve grew 27% YoY (FY24 $9.8bn → FY25 $12.5bn); MD&A attributes FY24/FY25 working-capital cash gains "primarily" to this reserve build [`12_red-flags-sweep.md` §2] | High |
| `business-model/11_capital-allocation-governance` (via `99_business-model-synthesis`) | Serial-acquirer pattern culminating in a large debt-funded deal | ~12 deals since 2019; pending $14.8bn Delivery Hero takeover funded mainly via a new €14.2bn bridge facility; Filter 4 (CLAUDE.md §24) capped the business-model capital-allocation score at 50/100 [`99_business-model-synthesis.md` §1, §4] | High |
| `06_earnings-quality` | Adjusted EBITDA excludes real, recurring costs | SBC $1,826M (20.9% of Adjusted EBITDA) and a "legal, non-income-tax and regulatory reserve" add-back ($564M FY25, $1,123M FY24) both recur every year shown [`06_earnings-quality.md` §4, §8] | High |
| `07_earnings-sensitivity` / `business-model/10_external-dependency` | Driver-classification / labor-regulation risk is an unquantifiable, binary tail risk | 10-K states a reclassification "would incur significant additional expenses" with no dollar figure; `10_external-dependency.md` names it "the single item that could force a structural change to the business model" | Medium — severity is High if triggered, but probability is currently rated Low near-term |
| `03_margin-drivers` | G&A/legal-accrual line is genuinely unpredictable | Same line swung +106bps favorable in FY2025, then −97bps unfavorable in Q2 FY26 — "should not be extrapolated in either direction" [`03_margin-drivers.md` §8a] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| No earnings press release / non-GAAP reconciliation document in the data pool for FQ1/FQ2 FY2026 | Not explicitly named by any single upstream agent, but implied by `01`/`03`/`06`'s joint finding that the 10-Q body no longer discloses a consolidated Adjusted EBITDA reconciliation | Cannot verify the definitional basis of the "EBITDA" figure that `04`/`05` use for the guidance-beat-streak narrative — see §2.5/§2.9 below |
| No dated current-price / spot-quote file | `00_earnings-data-triage.md` §3, §5 | Limits only master-level "stock reaction" framing; does not cap any earnings-module score |
| No AV-investment P&L cost quantification (dollar or bps figure) | `03_margin-drivers.md` §10; `05_beat-miss-setup.md` §5, §9 | The $10bn multiyear AV program's cost side is unmeasured; current bullish "demand" read rests on asymmetric disclosure |
| No numeric FQ4 2026 guide yet | `05_beat-miss-setup.md` §9 | Normal one-quarter-ahead guidance cadence — not itself a red flag, but the AV cost figure could first surface there |
| No Mobility-only Trip count or per-Driver acquisition cost (business-model-level gap) | `business-model/99_business-model-synthesis.md` §4 | Does not block the earnings-module verdict; relevant mainly to a unit-economics/valuation read outside this module's scope |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| `01_historical-financials` (§3, quarterly trend table) | Q2 FY26 "EBITDA (reported)" = $2,085M (GAAP Income from operations + D&A) | `04_guidance-consensus` (§6) / `05_beat-miss-setup` (§7–8) | Q2 FY26 "actual EBITDA" = $2,819M, cleared above the $2,700–2,800mm guided range | N within this data pool — the two figures differ by $734M (35.2%) and cannot be bridged from any primary source available here, because Uber's 10-Q no longer discloses a consolidated Adjusted-EBITDA reconciliation for FY2026 (`01`/`03`/`06` all independently flag this disclosure change) | Neither is "wrong" on its own terms — `01`'s figure is GAAP-basis (transparently derived, reconcilable to the 10-K/10-Q); `04`/`05`'s figure is a Street/CIQ-sourced, Adjusted-EBITDA-like figure that cannot be independently verified for FY2026 in this pool. The GAAP figure (`01`) is more credible as an audited-basis number; the guided/consensus figure (`04`/`05`) is more credible as the actual bar the market is using, but its precise definition is unverified. See §2.5/§2.9 for the full analysis. |
| `01_historical-financials` (§6) / `05_beat-miss-setup` (§10, Pre-Mortem) | "Revenue growth is decelerating" — YoY cooled from ~17–18% (FY23–25) to +14.5% (Q1'26) and +12.2% (Q2'26); `05`'s pre-mortem calls this "underlying trip-volume deceleration" | `02_revenue-drivers` (§4, §6, §6a) | Trips +18% YoY, Gross Bookings +22% constant-currency (4 consecutive quarters above 20% CC); the UK Mobility reclassification alone accounts for −8.7pp of Q2's 12.2pp headline growth, and ex-UK/ex-FX growth is ~19.9% — i.e., NOT decelerating versus the 17–18% FY23–25 base rate | Y — the underlying arithmetic reconciles cleanly in `02`'s own decomposition | `02_revenue-drivers` is more credible on what is actually happening to demand: it explicitly separates the mechanical UK accounting effect from organic trip volume, and its residual reconciles to 0.0pp. `01`'s headline revenue-growth trend is factually accurate as a description of reported revenue, but `05`'s pre-mortem language conflates "revenue growth deceleration" with "trip-volume deceleration" — these are not the same thing once the UK effect is stripped out. See §2.2/§2.10 below. |
| `06_earnings-quality` (§5, §7) | FY2025's tax benefit is "smaller" than FY2024's ~$6.0bn release and "does not recur at this scale" | `business-model/12_red-flags-sweep` (§2) | FY2025 carried its OWN large, discrete one-off: a $5.0bn Netherlands deferred-tax valuation-allowance release, on top of FY2024's $6.4bn combined federal/state release — both years show reported net income running roughly double pretax income | Y — both cite the same 10-K, just at different granularity | `12_red-flags-sweep`'s figure is more complete: it identifies a *second, comparably large* one-off item in FY2025 that `06_earnings-quality` characterized only as a smaller residual rather than its own discrete event. See §2.7/§2.9 below. |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No earnings press release / non-GAAP reconciliation in the pool for FQ1/FQ2 FY2026 | Triggered | High | High | The 10-Q body does not mention "EBITDA" outside one segment-methodology sentence [`01_historical-financials.md` §4; `03_margin-drivers.md` §1; `06_earnings-quality.md` §1, §7]; no press-release file is inventoried in `00_earnings-data-triage.md` §1 | The guided/consensus "EBITDA" figure that anchors `05`'s "favors beat" verdict cannot be verified against a primary source for FY2026 — see §2.5/§2.9 |
| No dated current-price / spot-quote file | Triggered | Low | High | [`00_earnings-data-triage.md` §3, §5] | Limits only master-level stock-reaction commentary; no earnings-module score impact |
| AV-investment P&L cost not yet quantified anywhere in the pool | Triggered | Medium | Medium | CFO: "we'll size that for investors clearly as we go" — no dollar or bps figure disclosed [`03_margin-drivers.md` §10] | Forward guide (Q4 FY26 or later) is a wildcard that could reprice the "demand not cost" reading |
| Two `EstimatesReport.xls` files are byte-identical duplicates | Not Triggered | Low | High | Correctly identified and treated as one source by `00`/`04` [`00_earnings-data-triage.md` §1; `04_guidance-consensus.md` §1] | None — already handled correctly upstream |
| No numeric FQ4 2026 guide yet | Not Triggered | Low | High | Normal one-quarter-ahead guidance cadence [`05_beat-miss-setup.md` §9] | Not a red flag on its own; the AV cost figure could first surface there |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Headline "revenue growth decelerating" narrative is materially overstated once the UK Mobility reclassification is stripped out | Triggered | High | High | Q2 FY26 headline growth +12.2% vs ex-UK/ex-FX growth ~19.9% [`02_revenue-drivers.md` §6a]; the UK effect alone is −8.7pp of the 12.2pp reported growth | If uncorrected, the master synthesizer could read "decelerating" as a genuine demand slowdown when the evidence shows trip volume/Gross Bookings growth stable-to-accelerating (4 straight quarters >20% CC) |
| GAAP diluted EPS fell 22.5% TTM even as EBITDA (+42.9%), EBIT (+48.6%), and FCF (+18.5%) all grew double-digits | Triggered | Medium | High | [`01_historical-financials.md` §2, §6; `06_earnings-quality.md` §7] — driven by non-operating equity-stake mark-to-market swings and a one-off tax benefit, not operations | Well flagged upstream already; real trap for a reader who quotes headline GAAP EPS as the earnings trend |
| Q4 gross-margin figures (49.6–49.7%) are a Capital IQ classification artifact, not a real quarterly step-change | Triggered | Low | High | Verified and fully explained: Q4 is a plug (Annual − 9 months) that concentrates a COGS-classification gap into one column [`01_historical-financials.md` §3] | Already correctly caveated upstream; no unaddressed residual risk |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| UK Mobility business-model reclassification recurs every quarter until it laps Q1 FY2027, mechanically suppressing reported revenue growth | Triggered | Medium | High | −$1.1bn Q2 FY26 revenue impact, −$2.1bn six-month impact [`02_revenue-drivers.md` §4] | Already well quantified and disclosed; risk is a reader treating this as demand weakness (see §2.2/§2.10) |
| FQ3 2026 revenue consensus cut 1.04% in 3 trading days post-print; net revision breadth −11 (8 up / 19 down) | Triggered | Medium | High | [`04_guidance-consensus.md` §3, §5] | Revenue has missed consensus narrowly in the last 2 quarters; this is the single biggest near-term threat `05` itself identifies to its own "favors beat" call |
| Company-reported market-share gains are self-reported, not independently verified | Triggered | Low-Medium | Medium | CFO: "our category position... is actually higher today than it was a year ago"; no third-party market-share data in the pool [`02_revenue-drivers.md` §3] | Modest — the underlying volume metrics (Trips, Gross Bookings, MAPCs) are independently disclosed and don't depend on this claim |
| Take-rate/mix residual (−2.1pp) in the Q2 revenue decomposition is a derived plug, not an independently confirmed company figure | Triggered | Low | Medium | Explicitly self-flagged: "a derived plug, not an independently quoted company ratio" [`02_revenue-drivers.md` §6a] | Low — already labeled as inference by the source agent; does not change the overall reconciliation |
| Freight's cyclical inflection (+25% CC Q2 FY26) is based on a single quarter of confirmed data | Triggered | Low | Medium | "one quarter of data is not proof of a durable freight-cycle recovery" [`03_margin-drivers.md` §7, Cycle-Position note] | Low at the consolidated level (Freight is 11.2% of revenue); already well caveated |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| G&A/legal-accrual line is genuinely unpredictable and could swing unfavorably again in Q3 | Triggered | Medium | Medium | Same line item moved margin +106bps favorable in FY2025, then −97bps unfavorable in Q2 FY26 [`03_margin-drivers.md` §8a] | Named directly by `05` §3 as a miss scenario; the single most volatile line in the whole cost stack |
| ~132bps (26%) of Q2 FY26's cost-of-revenue-ratio "improvement" is the UK reclassification, not genuine cost discipline | Triggered | Low | High | [`03_margin-drivers.md` §8a] — already separated from the genuine +377bps improvement | Low — fully reconciled and disclosed; risk only if a reader takes the unadjusted total at face value |
| Insurance-cost pass-through is explicitly asymmetric — near-100% downside exposure vs an inferred ~18% upside retention | Triggered | Medium | Medium | Management: "our philosophy has been to return that goodness back to the market" on cost decreases, but a cost increase historically flowed close to fully to the P&L [`07_earnings-sensitivity.md` §6] | A future insurance-cost spike would not be offset the way a decrease is "given back" — an asymmetric bear case |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The guided/consensus "EBITDA" figure for FY2026 quarters does not match the GAAP-basis EBITDA computed elsewhere in this same module, and no primary-source reconciliation is available to confirm its definition | Triggered | High | High | Q2 FY26: $2,085M (GAAP-basis, `01_historical-financials.md` §3) vs $2,819M ("actual EBITDA," cleared above the guided high end, `04_guidance-consensus.md` §6) — a $734M (35.2%) gap; Q1 FY26 shows the same pattern ($2,114M GAAP-basis vs $2,481M guided-comparison figure); Uber's 10-Q no longer discloses a consolidated Adjusted EBITDA reconciliation for FY2026 [`01`/`03`/`06`, cross-referenced above] | This is the primary evidentiary chain behind `05`'s "Setup favors beat" verdict (the "beat guided EBITDA range 4/4 quarters, above high end 2 straight" claim) — that specific claim rests on a figure that cannot be verified from a primary source in this pool. Triggers the MODULE_RULES "Conflicting sources not reconcilable → Overall usefulness max 65" cap. See §2.9 |
| Rising Street effective-tax-rate assumption compresses EPS Normalized even as EBITDA estimates are being raised | Triggered | Medium | Medium-High | FY2026 ETR assumption rose from 9.5% (12 months ago) to 20.77% (currently); EPS Normalized revision breadth (+2 to +3) is far weaker than EBITDA revision breadth (+6 to +14) over the same window [`04_guidance-consensus.md` §5] | A structural EPS-specific headwind that could produce an EPS miss even on an EBITDA beat |
| No formal revenue guidance issued by the company | Not Triggered (structural, not new) | Low | High | Uber has not guided revenue since FQ2 2020 [`04_guidance-consensus.md` §2] | Long-standing practice, not a new or worsening disclosure gap |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| "Above guided high end" streak that anchors the bull case is only a 2-quarter sample | Triggered | Medium | Medium | `05` itself: "a real but short (two-quarter) pattern" [`05_beat-miss-setup.md` §7] | Base-rate discipline concern (CLAUDE.md §9) — a 2-quarter streak is a thin foundation for the module's central verdict, compounded by the EBITDA-definition gap in §2.5 |
| Revenue miss risk (a 3rd straight quarter) is `05`'s own named single biggest threat to "favors beat," but its pre-mortem language attributes the risk partly to "underlying trip-volume deceleration" that `02`'s own decomposition does not support | Triggered | High | High | [`05_beat-miss-setup.md` §10; contradicted by `02_revenue-drivers.md` §6a — see §2.2/§2.9/§2.10] | Mischaracterizes the nature of the revenue risk: the real risk is the bounded, mechanical UK reclassification (lapses Q1 FY27) plus modest take-rate/mix compression, not an open-ended demand slowdown |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| GAAP net income inflated in BOTH FY2024 and FY2025 by large, one-off, non-cash deferred-tax valuation-allowance releases, with no non-recurring caveat on the headline highlights table | Triggered | High | High | $6.4bn combined FY24 federal/state release; $5.0bn Netherlands release in FY25; reported net income ran roughly double pretax income in both years [`business-model/12_red-flags-sweep.md` §2, RF-RFS-001, severity 60] — a more complete finding than `06_earnings-quality.md` §5/§7, which characterized the FY2025 item only as "smaller" without identifying it as its own discrete ~$5bn one-off | Any forward EPS/net-income model that anchors on the FY24→FY25 net-income trend ("up 2%") needs to strip this out first — the underlying pretax operating income actually grew 41% while a shrinking tax benefit masked the acceleration |
| $12.5bn self-insurance reserve (Critical Audit Matter, +27% YoY) is a material, disclosed driver of the touted CFO/FCF growth, beyond what `06`'s own caveat conveys | Triggered | Medium-High | High | MD&A: FY24/FY25 working-capital cash gains "primarily driven by an increase in our accrued insurance reserves ... liabilities recorded during the period exceeding claims paid out" [`business-model/12_red-flags-sweep.md` §2, severity 45; corroborated in `06_earnings-quality.md` §1, §2] | A real share of the FY24→FY25 CFO growth ($7.1bn→$10.1bn) and FCF growth ($6.9bn→$9.8bn) is reserve-build timing, not pure organic collection improvement — this tailwind reverses when claims catch up to accruals |
| Stock-based compensation ($1.8bn, 20.9% of Adjusted EBITDA) permanently excluded from headline non-GAAP profitability | Triggered | Medium | High | [`06_earnings-quality.md` §4, §8 — trap severity 55] | Already comprehensively flagged upstream; a real, recurring, dilutive cost not reflected in the "clean" Adjusted EBITDA number |
| "Legal, non-income tax and regulatory reserve" add-back recurs at material size (>$500M) in both years shown despite being framed as an adjustment | Triggered | Medium | High | $564M FY25, $1,123M FY24 [`06_earnings-quality.md` §4, §5] | Contradicts its own "non-recurring" framing by its own repetition |
| Large fair-value / mark-to-market gains on minority equity stakes swing GAAP net income by $1.4–1.6bn in single quarters | Triggered | Medium | High | [`01_historical-financials.md` §3; `06_earnings-quality.md` §8 — trap severity 60] | Already flagged; makes GAAP EPS unusable as a standalone quality signal (already correctly excluded from `05`'s beat/miss read) |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Driver classification / labor-regulation risk is an unquantifiable, binary tail risk excluded from the numeric sensitivity ranking | Triggered | High | Low (near-term) | "would incur significant additional expenses," no dollar figure; rated the primary driver of a 48/100 (inverted) External Dependency Risk Score [`07_earnings-sensitivity.md` §3, §6; `business-model/10_external-dependency.md` §5] | Would very plausibly dwarf every other quantified sensitivity if triggered in a large market — excluded from ranking only for lack of a disclosed dollar figure, not because it is smaller |
| Pending $14.8bn Delivery Hero acquisition, funded mainly via a new €14.2bn bridge facility, sits inside a ~12-deal serial-acquirer pattern already capped at business-model Filter 4 (severity 78) | Triggered | High | High | Net debt (strict) already rose from $5,197M (FY25) to $9,861M (Jun-30-2026), Net Debt/EBITDA from 0.82x to ~1.32x, BEFORE this deal closes [`01_historical-financials.md` §6; `business-model/99_business-model-synthesis.md` §1, §4] | Outside this module's scope to score, but the earnings module's cash-generation/"beat" narrative does not incorporate the leverage and integration risk building in parallel — a scope blind spot the synthesis layer should not silently inherit |
| AV $10bn multiyear investment — cost side explicitly "not yet sized"; current read leans on asymmetric (demand-only) disclosure | Triggered | Medium | Medium | CFO: "the closer we get to deployment and scale out, there will be a P&L impact, and we'll size that for investors clearly as we go" [`03_margin-drivers.md` §10] | The first quantified AV cost figure (plausibly in the Q4 FY26 guide) could flip the current bullish "demand signal" framing |
| Insurance cost pass-through and driver-incentive costs could both be hit simultaneously by a single fuel-price shock | Triggered | Medium | Medium | [`07_earnings-sensitivity.md` §5; `business-model/10_external-dependency.md` §1] | Two of the largest cost-line sensitivities are not fully independent — a correlated downside scenario is understated if modeled as two separate risks |
| Sole-source, no-fallback dependency on Google Maps, with redacted forward pricing, from the same corporate parent (Alphabet) that owns a direct AV competitor (Waymo) | Triggered | Low-Medium | Low (near-term) | 4th amendment to the Google Maps agreement (Apr-19-2026) has redacted "Year 4-5 Pricing" terms [`business-model/12_red-flags-sweep.md` §2, severity 40] | More a moat/strategic risk than a near-term earnings risk; the actual cost trajectory of this dependency is not knowable from the filing |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| `01_historical-financials`'s GAAP-basis EBITDA vs `04_guidance-consensus`/`05_beat-miss-setup`'s guided/consensus "EBITDA" — same label, different (unreconciled) figures | Triggered | High | High | $2,085M vs $2,819M for Q2 FY26 (35.2% gap); same pattern in Q1 FY26 ($2,114M vs $2,481M) — see §1 Contradictions table and §2.5 | Triggers MODULE_RULES "Conflicting sources not reconcilable → Overall usefulness max 65" |
| `01`/`05`'s "revenue growth decelerating" framing vs `02`'s decomposition showing trip-volume/Gross-Bookings growth stable-to-accelerating once the UK reclassification is stripped out | Triggered | High | High | See §1 Contradictions table and §2.2/§2.10 | Master synthesizer should use `02`'s decomposed read, not the unadjusted headline, when characterizing demand trend |
| `06_earnings-quality`'s treatment of the FY2025 tax benefit as merely "smaller" vs `business-model/12_red-flags-sweep`'s identification of a discrete $5.0bn Netherlands one-off | Triggered | Medium-High | High | See §1 Contradictions table and §2.7 | The earnings module's own quality read understates how much of FY2025's net income is one-off relative to the business-model module's more granular finding |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| "Setup favors beat" leans on a short (2-quarter) above-guidance-high-end streak measured on an unreconciled Street-EBITDA figure — two separate weaknesses compounding into one headline verdict | Triggered | High | High | Combines §2.5/§2.6/§2.9 findings [`05_beat-miss-setup.md` §7–8; `04_guidance-consensus.md` §6] | The synthesis agent should treat "favors beat" as directionally supported by the independently-verified GAAP EBIT-margin bridge (`03`/`07`), but should not lean on the specific "beat guided EBITDA range" claim without flagging the definitional gap |
| Revenue "deceleration" language is used interchangeably with "trip-volume deceleration" in `05`'s pre-mortem, when `02`'s own decomposition shows the opposite for the volume component specifically | Triggered | High | High | See §1 Contradictions table and §2.2 | Could lead the master synthesizer to overweight a demand-slowdown narrative that the evidence does not support |
| AV $10bn spend is read as a "demand signal" based on asymmetric disclosure (demand side quantified and observable; cost side explicitly not yet sized) | Triggered | Medium | Medium | `03_margin-drivers.md` §10 itself flags this explicitly: "the evidence favors the DEMAND reading... because the cost-side evidence is explicitly NOT yet quantified" | Already self-aware upstream; worth carrying forward as a live risk to the synthesis, not a settled conclusion |
| The earnings module's overall bullish tilt (margin expansion, cash generation, beat streak) does not incorporate the parallel capital-structure/M&A risk the business-model module already capped (Filter 4, serial acquirer) | Triggered | Medium | High | `99_business-model-synthesis.md` §1, §4 vs the earnings module's scope, which excludes valuation/capital allocation by design (`MODULE_RULES.md`, Scope) | A scope boundary, not a module error — but the synthesis layer must not let the earnings module's clean read imply the whole investment case is clean |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Source Conflicts / Guidance-Consensus | Guided/consensus "EBITDA" ≠ GAAP-basis EBITDA for FY2026 quarters; no primary-source reconciliation available ($2,085M vs $2,819M, Q2 FY26) | Triggered | High | High | Undermines the specific evidentiary chain behind `05`'s "favors beat" verdict; triggers a MODULE_RULES usefulness cap |
| 2 | Narrative/Framing / Historical Trend | "Revenue growth decelerating" narrative conflated with "trip-volume deceleration"; underlying volume is stable-to-accelerating once UK reclassification is stripped out | Triggered | High | High | Risk of mischaracterizing the demand trend in the master synthesis |
| 3 | Earnings Quality | GAAP net income inflated in BOTH FY2024 ($6.4bn) and FY2025 ($5.0bn) by one-off deferred-tax valuation-allowance releases | Triggered | High | High | Any forward EPS/net-income trend model must strip both years, not just FY2024 |
| 4 | Sensitivity/External | Pending $14.8bn Delivery Hero deal, funded via €14.2bn bridge facility, inside an already-capped serial-acquirer pattern; net debt/EBITDA already rose 0.82x→~1.32x before the deal closes | Triggered | High | High | Leverage/integration risk building in parallel to the "clean earnings" narrative, outside this module's scope to score |
| 5 | Sensitivity/External | Driver classification / labor-regulation risk is unquantifiable and excluded from the numeric sensitivity ranking | Triggered | High | Low (near-term) | Would dwarf every quantified sensitivity if triggered in a large market |
| 6 | Beat/Miss Setup | Revenue-miss pre-mortem attributes risk partly to "trip-volume deceleration" not supported by `02`'s decomposition | Triggered | High | High | Mischaracterizes the nature of the single biggest named risk to the "favors beat" call |
| 7 | Earnings Quality | $12.5bn self-insurance reserve (Critical Audit Matter, +27% YoY) is a material, underweighted driver of CFO/FCF growth | Triggered | Medium-High | High | Reserve-build timing, not pure organic cash-collection improvement; reverses when claims catch up |
| 8 | Source Conflicts | `06`'s "smaller" characterization of the FY2025 tax benefit understates a discrete, comparably-sized $5.0bn one-off found by the business-model module | Triggered | Medium-High | High | Earnings-quality read should treat FY2025, not just FY2024, as tax-benefit-distorted |
| 9 | Beat/Miss Setup | "Above guided high end" streak anchoring the bull case is only 2 quarters | Triggered | Medium | Medium | Thin base rate for the module's central verdict (CLAUDE.md §9) |
| 10 | Margins | G&A/legal-accrual line is genuinely unpredictable, could swing unfavorably again in Q3 | Triggered | Medium | Medium | Named directly as `05`'s own miss scenario |
| 11 | Revenue / Guidance-Consensus | FQ3 2026 revenue consensus cut 1.04% in 3 days post-print; net revision breadth −11 | Triggered | Medium | High | Single biggest near-term threat to the revenue side of the setup |
| 12 | Sensitivity/External | Insurance-cost pass-through is asymmetric (~100% downside exposure vs ~18% inferred upside retention) | Triggered | Medium | Medium | A future cost spike would not be offset the way a decrease is "given back" |
| 13 | Guidance/Consensus | Rising Street tax-rate assumption (9.5%→20.77% FY2026) compresses EPS Normalized even as EBITDA estimates rise | Triggered | Medium | Medium-High | Structural EPS-specific headwind independent of operating performance |
| 14 | Sensitivity/External | AV $10bn investment cost side explicitly not yet sized; current bullish read rests on asymmetric disclosure | Triggered | Medium | Medium | First quantified AV cost figure could flip the current "demand" framing |
| 15 | Earnings Quality | SBC ($1.8bn, 20.9% of Adjusted EBITDA) and a recurring "legal/regulatory" add-back excluded from headline non-GAAP profitability | Triggered | Medium | High | Real, recurring, dilutive costs not reflected in the "clean" Adjusted EBITDA figure |
| 16 | Historical Trend | GAAP diluted EPS fell 22.5% TTM even as EBITDA/EBIT/FCF grew double-digit | Triggered | Medium | High | Real trap for a reader quoting headline GAAP EPS as the earnings trend (already well-flagged upstream) |
| 17 | Sensitivity/External | Sole-source Google Maps dependency, redacted pricing, same parent as AV competitor Waymo | Triggered | Low-Medium | Low (near-term) | Cost trajectory of this dependency is not knowable from the filing; more moat-relevant than near-term-earnings-relevant |
| 18 | Margins | ~132bps (26%) of Q2 FY26's cost-of-revenue-ratio "improvement" is the UK reclassification, not genuine cost discipline | Triggered | Low | High | Fully reconciled and disclosed already; risk only if unadjusted total is taken at face value |
| 19 | Revenue | Company-reported market-share gains are self-reported, not independently verified | Triggered | Low-Medium | Medium | Underlying volume metrics don't depend on this claim |
| 20 | Revenue | Take-rate/mix residual (−2.1pp) in the Q2 decomposition is a derived plug, not independently confirmed | Triggered | Low | Medium | Already labeled as inference by the source agent |
| 21 | Revenue | Freight's cyclical inflection is based on a single quarter of confirmed data | Triggered | Low | Medium | Small consolidated impact (Freight is 11.2% of revenue); already well caveated |
| 22 | Historical Trend | Q4 gross-margin figures (49.6–49.7%) are a Capital IQ classification artifact | Triggered | Low | High | Already correctly explained upstream; no unaddressed residual risk |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 22 |
| Critical flags | 0 |
| High flags | 6 |
| Medium flags | 10 |
| Low flags | 6 |
| Unclear flags | 0 |
| Unavailable checks (data missing) | 0 |

## 5. Red-Flag Severity Verdict

**Material concerns** — high-severity flags present; the earnings setup may be overstated in specific places and should not be taken purely at face value.

No flag rises to Critical (nothing here invalidates the earnings setup outright, and there is no fraud, going-concern, or hard disqualifier signal), but six High-severity flags cluster around the same weak point: the specific evidence chain behind `05`'s "Setup favors beat" verdict — a short, 2-quarter, above-guided-high-end EBITDA streak — is measured on a "EBITDA" figure that does not match the GAAP-basis EBITDA this same module computes elsewhere, and cannot be reconciled to a primary source for FY2026 within this data pool. The single most dangerous red flag is #1 (the EBITDA-definition gap): it would be resolved by pulling Uber's FQ1/FQ2 2026 earnings press releases (or shareholder letters) into the data pool and confirming whether the guided/consensus "EBITDA" figure is still Adjusted EBITDA on the same basis as FY2025's disclosed reconciliation.

## 6. What The Synthesis Agent Should Know

- 22 red flags triggered: 0 Critical, 6 High, 10 Medium, 6 Low, 0 Unclear, 0 Unavailable.
- The single most dangerous red flag: the guided/consensus "EBITDA" figure for FQ1/FQ2 2026 does not match this module's own GAAP-basis EBITDA calculation (a 35.2% gap in Q2 FY26 alone), and Uber's 10-Q no longer discloses a consolidated non-GAAP reconciliation to verify it — this is the primary evidence behind the "favors beat" verdict. Resolve by pulling the FQ1/FQ2 2026 earnings press releases into the data pool.
- This should cap the **Consensus setup** score component under MODULE_RULES's "Conflicting sources not reconcilable → Overall usefulness max 65" rule — the earnings-quality/beat-streak evidence chain built on the disputed EBITDA figure should not receive full weight.
- The "Earnings decelerating" framing implied by headline revenue growth (18% → 12%) should NOT be adopted as-is: `02_revenue-drivers`'s own decomposition shows trip volume and Gross Bookings growth is stable-to-accelerating once the UK Mobility reclassification (−8.7pp of Q2's growth) is stripped out. If the synthesis needs one label, "Earnings stable to inflecting-positive on an underlying basis, obscured by a mechanical accounting reclassification" is closer to the evidence than "decelerating."
- Two contradictions require explicit reconciliation in the synthesis: (1) `01`'s GAAP-basis EBITDA vs `04`/`05`'s guided-basis "EBITDA" (unreconcilable within this pool); (2) `06`'s treatment of the FY2025 tax benefit as a lesser residual vs `business-model/12_red-flags-sweep`'s identification of a discrete $5.0bn Netherlands one-off comparable in scale to FY2024's $6.4bn item.
- Missing data that prevented a full scan: none of the module's hard score caps were triggered (data-triage verdict was "Sufficient"), but the absence of any earnings press release in the pool is a real, uncapped gap that specifically prevents verification of the FY2026 EBITDA-guidance basis.
- Net: the setup is dirtier than the upstream module's own "favors beat" / "mostly clean" framing suggests in two specific places — the EBITDA-guidance evidentiary basis, and the extent to which FY2024–FY2025 GAAP earnings quality was propped up by one-off tax items (both years, not just one) — but cleaner than a naive reading of "revenue growth decelerating" would suggest, since the underlying trip-volume trend is not actually slowing once the accounting reclassification is removed.

## 7. Pre-Mortem — If The Earnings Setup Fails

If this earnings setup turns out to be wrong, the most likely reason is that the "favors beat" verdict was built on a "beat guided EBITDA range" streak measured against a Street/CIQ-sourced "EBITDA" figure whose exact definition could not be verified against any primary source in this data pool — because Uber discontinued its consolidated Adjusted EBITDA reconciliation in the 10-Q starting Q1 FY2026 and no earnings press release was in the pool to fill that gap. If that guided metric's basis has shifted in a way this module could not detect (a different set of add-backs, a different treatment of the UK reclassification, or simply a definitional drift the company has not re-anchored since dropping the reconciliation table), a future "beat" or "miss" against it would be measured against the wrong yardstick, and the true GAAP-operating-income trend — which this module's own sensitivity work (`07`) correctly treats as the cleaner basis — could tell a different story than the guidance-beat streak implies.
