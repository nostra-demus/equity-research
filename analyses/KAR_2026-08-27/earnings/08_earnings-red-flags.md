# Earnings Red Flags — KAR

All eight required upstream earnings outputs (00–07) and all three optional business-model cross-module inputs (`03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`) are present and were read in full. No upstream output missing. `ciq_facts.json` and `relationships.json` sidecars do not exist for this run (confirmed absent in `00_earnings-data-triage.md`) — no deterministic facts pin is available; this report relies on the sourced reads of upstream agents, cross-checked against the primary filings each upstream agent cites.

**Read this before anything else in this report.** Karoon's H1/FY2026 half-year result was scheduled for release **today, 2026-08-27** — the same date as this analysis. No Half-Yearly Report, Half-Year Audit Review, or investor presentation for the period ended 30-Jun-2026 exists anywhere in this data pool. Every consensus, guidance, beat/miss, and sensitivity figure in the upstream module is **pre-print positioning**. This is the single most important fact this red-flag scan can surface, and it is treated as Red Flag #1 below.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 02_revenue-drivers | 2Q26 realized prices spiked 33–58% QoQ / 47–58% YoY (Baúna $94.56/bbl, Who Dat liquids $101.93/bbl) | `2Q26 Activities Report`, pp.2–3 | High (fact) / but flagged below as not run-rate |
| 03_margin-drivers | Unit production cost improving — US$13.20/boe FY25 vs US$13.60/boe FY24, driven by the FPSO buyout removing lease costs | FY2025 Annual Report, p.48-49 | Medium |
| 06_earnings-quality | Cash conversion (CFO/EBITDA) above 65% in every one of the last four years, above 90% in two of them; negative FY2025 FCF fully explained by an itemised one-off buyout (normalised operating FCF +US$165.5m) | FY2025 Annual Report, p.48-49, 81 | High |
| 01_historical-financials | Leverage low and falling — Net Debt/EBITDA 0.34x (FY2024) → 0.36x (FY2025), both CIQ-basis | FY2025 Annual Report, p.79 | High |
| 03_margin-drivers | FPSO efficiency restored to 97.2% in 2Q26 (above the 90–95% target range) after a revitalisation campaign | `2Q26 Activities Report`, pp.2–3 | Medium |
| 04_guidance-consensus / 05_beat-miss-setup | H1 2026 revenue is unusually pre-known: already-disclosed Q1+Q2 cash sales revenue (US$244.6m) sits within 1% of the restated FH1 2026 consensus (US$243.3m) | `04_guidance-consensus.md` §1A | High |
| 05_beat-miss-setup | Two-year pattern of Net Income/EPS Normalized beating Street even when Revenue/EBITDA missed | `04_guidance-consensus.md` §6 | Medium (n=2, judgment) |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| 01_historical-financials | FY2025 revenue fell 19.0% (US$776.5m→US$628.6m); both halves of FY2025 down double digits YoY | FY2025 Annual Report, p.78 | High |
| 04_guidance-consensus | CY2026 production guidance cut ≈11% at the midpoint and capex guidance raised ≈55% at the midpoint between January and July 2026 — a real, filed deterioration, not analyst over-caution | `2Q26 Activities Report`, "2026 Full Year Guidance" table | High |
| 04_guidance-consensus | Street revision breadth net negative across Revenue, EBITDA, EBIT, EPS Normalized, worsening the further back the window (3-month more negative than 1-month on every metric) | CIQ Estimates Report, Revisions tab, 2026-08-14 | High |
| 01_historical-financials / 03_margin-drivers | FY2025 statutory EBITDA margin "expansion" (+257bps) is a one-off artefact — stripping the US$35.3m FPSO-disposal gain and US$21.2m contingent-consideration FV gain drops adjusted EBITDA margin to 51.6%, a 641bps compression | FY2025 Annual Report, Financial Summary p.48 | High |
| 02_revenue-drivers / 03_margin-drivers | Zero active oil-price hedges at 31-Dec-2025 or as of the 2Q26 filing — essentially none of any price move is cushioned | FY2025 Annual Report, Note 20(b); `2Q26 Activities Report`, p.5 | High |
| 02_revenue-drivers | Who Dat E-riser leak (~15,000 boepd gross shut in since Feb-2026, non-operated by LLOG) not expected to fully resume until 4Q27 | `2Q26 Activities Report`, p.4 | High |
| 06_earnings-quality | Effective tax rate collapsed from 46.7% (FY2024) to 12.4% (FY2025) on a non-cash Brazilian-real deferred-tax FX swing (>US$87m two-year swing on one line) | FY2025 Annual Report, Note 5(a), p.90 | High |
| 06_earnings-quality | "Non-recurring" cost items appear in every disclosed year, but a DIFFERENT basket each year — Underlying NPAT is a moving target | FY2025 Annual Report, p.48 | High |
| 03_margin-drivers / 07_earnings-sensitivity | Net debt roughly doubled in 1H26 (US$132.7m → US$269.7m) funding the capex ramp; consensus interest expense already ~5% above CY2026 guidance midpoint before the print | `2Q26 Activities Report`, p.4; `04_guidance-consensus.md` §3 | High |
| 07_earnings-sensitivity | Single-FPSO concentration: the Brazil segment (91.2% of FY2025 gross profit) runs entirely through one vessel; production fell 46% QoQ in a single planned-maintenance window in 2Q26 | `2Q26 Activities Report`, p.1, p.4 | High |
| 02_revenue-drivers / 03_margin-drivers | Management's own 2H26 planning assumption (US$60–70/bbl) sits *below* the US$94.56/bbl actually realized in 2Q26 — the company's own evidence the price spike is not treated internally as durable | `2Q26 Activities Report`, p.2 | High |
| 04_guidance-consensus / 05_beat-miss-setup | The entire H1 2026 EBITDA bar rests on a single analyst's estimate (Initiation of Coverage, 2026-08-04); US$46.5m of already-incurred flotel/FPSO integrity spend alone is ~37% of that bar | `KaroonEnergyLtdASXKAREstimatesReport.xls`, Recent Changes tab | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| H1/FY2026 half-year result (due 2026-08-27, today) — no Half-Yearly Report, Audit Review, or investor deck for the period ended 30-Jun-2026 anywhere in the pool | 00, 04, 05 | Every consensus/guidance/beat-miss read in the upstream module is pre-print positioning; could be overtaken within hours of this report being read |
| Company-disclosed group-level Brent-to-revenue/EBITDA sensitivity | business-model `10_external-dependency.md` §2 | The single highest-impact variable (oil price, ~US$110.7m avg swing per `07`) has no company-published sensitivity table — the ~US$8.6m EBITDAX-per-$1/bbl coefficient used throughout `07` is this report's own derivation, not company-disclosed |
| Confirmed outcome of the US federal (BSEE) royalty-relief application for Who Dat East, a stated FID precondition as of Feb-2026 | business-model `10_external-dependency.md` §1A | Who Dat East FID (expected 3Q26) is a stated growth catalyst whose precondition status is unresolved from available sources |
| Whether the Brazilian export tax is extended again beyond its current ~7-Sep-2026 expiry (only ~11 days after this report's date) | 02, 03; business-model `10_external-dependency.md` §1A | A live, time-sensitive policy variable resolves within days of this report, with no company-side lever besides an unresolved industry legal challenge |
| A capex maintenance/growth split for FY2021–FY2023 (only available for FY2024–FY2025) | 06_earnings-quality §1 | Limits how far back the normalised-FCF read can be extended with confidence |

### Contradictions Between Agents

*"No material contradictions identified between upstream agents."* Every upstream agent that touches the same fact (the EBITDA-margin one-off artefact, the guidance-cut timeline, the zero-hedge exposure, the 2Q26 price spike not being run-rate) reaches the same conclusion and cross-cites the others. One item is flagged below not as a contradiction but as a **basis-consistency risk for the synthesis layer to carry forward carefully**: `01_historical-financials.md`'s five-year annual table uses Capital IQ-**standardized** EBITDA (FY2024 US$498.3m / FY2025 US$364.7m), while `03_margin-drivers.md`, `06_earnings-quality.md`, and `07_earnings-sensitivity.md` all use the company's own **reported** "EBITDA" (US$450.3m / US$380.7m) or the company's "Underlying EBITDAX" (US$403.2m TTM). Each individual agent labels its own basis correctly per CLAUDE.md §15 — this is not a defect in any one report — but a reader condensing across sections without carrying the basis label could quote the wrong EBITDA figure under the wrong name. See Section 2.9.

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| H1/FY2026 result due today, not in this data pool — all downstream figures are pre-print positioning | Triggered | Critical | High | `00_earnings-data-triage.md` §0; `04_guidance-consensus.md` header time-critical flag | The module's entire beat/miss, guidance, and sensitivity read could be overtaken by facts within hours of this report being read; the master synthesizer must treat the earnings verdict as provisional, not final |
| Beat/miss bar for H1 2026 rests on a single-analyst (n=1) estimate, not a broad consensus | Triggered | High | High | `04_guidance-consensus.md` §1A ("Initiation of Coverage" entry, 2026-08-04) | A one-analyst bar can be stale or mis-modelled on a specific cost line in ways a nine-analyst FY2026 consensus would average out — flagged as the #1 pre-mortem risk by `05` itself |
| No investor presentation/deck newer than H1 2024 results (~24 months stale) | Triggered | Low | High | `00_earnings-data-triage.md` §1.1 | Minor — transcripts and quarterly Activities Reports substitute; not a material gap on its own |
| CIQ Financials workbook mechanically doubled the 6-month TY23 transition stub into a fake "12-month" Dec-31-2023 column (Revenue $825.8m/$412.9m = exactly 2.0x) | Triggered | Low | High | `01_historical-financials.md` §0 | Already caught and excluded by `01`, not a live gap; flagged here only as a general vendor-data-quality caution — the same CIQ workbook family feeds several other tables in this module |
| No true 8-quarter QoQ history — full P&L is half-yearly under this ASX regime, not quarterly | Not Triggered | Low | — | `00_earnings-data-triage.md` §0, §5 | Properly substituted per CLAUDE.md §27 — handled correctly via HoH substitution throughout; not a genuine data gap |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Statutory EBITDA margin "expansion" (+257bps FY25) is a one-off accounting artefact, not real improvement — adjusted for the two large one-off gains, EBITDA margin compressed 641bps | Triggered | High | High | `01_historical-financials.md` §6; `03_margin-drivers.md` §3 | A reader relying on the reported EBITDA-margin line alone would conclude margins expanded when the underlying business compressed — already correctly adjudicated upstream, but must travel with its qualifier into synthesis, not round to "margins improved" |
| Statutory NPAT margin rose +357bps FY25 while Underlying NPAT margin fell 1,046bps — same one-off distortion, opposite conclusion depending on which line is read | Triggered | High | High | `03_margin-drivers.md` §3 | Same risk as above, on the bottom-line metric most likely to be headlined in a press summary |
| H1 2025 EBITDAX margin spiked +1,340bps YoY while revenue and gross margin both fell sharply over the same half — a single-metric-disagrees case | Triggered | Medium | High | `01_historical-financials.md` §3 | Already named and resolved by `01`: driven by the same $35.3m FPSO-disposal gain. Carried here so the synthesis layer does not re-discover this as a new "H1 strength" signal |
| Company frames CY2026 as "two contrasting halves" (heavy 1H26 cost/capex enabling a stronger 2H26) — an unproven, forward-looking thesis, not yet evidenced by results | Unclear | Medium | Medium | `03_margin-drivers.md` §9; `05_beat-miss-setup.md` §9 | If the H1/FY2026 print (due today) does not show the capex/cost load moderating as management claims, the "two contrasting halves" narrative loses its evidentiary basis |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| 2Q26 price spike (+33–58% QoQ) is a geopolitical risk-premium event management itself does not budget as durable — 2H26 planning assumes US$60–70/bbl, below the actual 2Q26 print of US$94.56/bbl | Triggered | High | High | `02_revenue-drivers.md` §7; `2Q26 Activities Report`, p.2 | A reader extrapolating the 2Q26 price level forward into the imminent H1 2026 print, or into FY2026 as a whole, is working from a base the company itself does not use |
| Zero active price hedges — 100% of the dominant revenue driver flows through unmitigated | Triggered | High | High | FY2025 Annual Report, Note 20(b); `02_revenue-drivers.md` §4 | No cushion against a price reversal; the "recovery" narrative has no downside protection built in |
| Revenue "recovery" is entirely price, not volume/demand — CY2026 production guidance cut ~11% at the midpoint over the same window the price spiked | Triggered | High | High | `02_revenue-drivers.md` §4; `04_guidance-consensus.md` §2 | The two halves of the revenue story are moving in opposite directions (price up, volume down) — a naive "revenue accelerating" read would miss the volume deterioration entirely |
| Customer concentration — two customers account for >98% of revenue | Triggered | Medium | High | business-model `03_segment-map.md` §3, cited in `02_revenue-drivers.md` §3 | Structural, not a period event, but material counterparty concentration in a business with no hedges |
| Brazilian export tax expiry (~7-Sep-2026) is only ~11 days after this report's date, with no confirmed outcome | Triggered | High | Medium | `2Q26 Activities Report`, p.5; business-model `10_external-dependency.md` §1A | A live, near-term binary policy event (lapse vs further extension) that no source in this pool resolves |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| "Non-recurring" cost items appear in every disclosed year, but a DIFFERENT basket each time (flotel/transition/relocation costs FY25; advisory/transaction costs FY24) — Underlying NPAT/EBITDAX is a moving target, not a stable comparable measure | Triggered | High | High | `06_earnings-quality.md` §4 (pattern flag); Accounting Trap Checklist severity 45/100 | Weakens the reliability of the company's own headline "Underlying" metric that management and sell-side analysts anchor to |
| Unsuccessful exploration-well write-offs (US$10.9m–US$12.0m/yr) recur every disclosed year but are treated as non-recurring in the Underlying reconciliation | Triggered | Medium | High | `06_earnings-quality.md` §4 | Understates the true run-rate cost of the exploration programme when "Underlying" figures are used as the base for forward modelling |
| Operating deleverage: a volume shortfall does not just cut revenue, it also raises unit production cost per barrel (already observed at Who Dat, +7.6% YoY on lower production) — the downside is non-linear versus the sensitivity table's symmetric bull/bear figures | Triggered | Medium | High | `03_margin-drivers.md` §2; `07_earnings-sensitivity.md` §6 | A reader who takes the sensitivity table's symmetric volume impact at face value understates the true downside of the ongoing Who Dat and Baúna shut-ins |
| Unit DD&A guided higher for CY2026 (US$15–17/boe) vs US$15.19/boe FY2025 actual, on the owned-FPSO D&A step-up | Triggered | Low | High | `03_margin-drivers.md` §2, §9 | A locked-in, non-cash cost headwind embedded in the operating plan, real but modest |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| CY2026 production guidance cut ≈11% at the midpoint and capex guidance raised ≈55% at the midpoint, in two successive revisions since January 2026 — a real, filed deterioration in the operating plan, not conservative repositioning | Triggered | High | High | `04_guidance-consensus.md` §2 | Confirms the operating deterioration is structural (asset/well reliability), not a one-off; a third cut alongside the H1 print would confirm the trend |
| Street revision breadth net negative across Revenue, EBITDA, EBIT, and EPS Normalized over the trailing 1–3 months, worsening the further back the window | Triggered | High | High | `04_guidance-consensus.md` §5 | Consensus has been chasing the company's own guidance cuts down, not sitting ahead of them or providing a sandbagged low bar |
| AUD/USD conversion rate used to reconcile CIQ's AUD-denominated consensus to the company's USD guidance is derived/inferred (from matching two guidance line items), not a filed rate | Triggered | Medium | Medium | `04_guidance-consensus.md` §1A, labelled "Inference, not from filings" | Every restated USD consensus figure in `04` and `05` (including the capex-gap arithmetic) inherits this inferred FX rate; a material FX misestimate would shift every downstream USD comparison |
| Consensus interest expense (US$68.2m restated) already sits ~5% above the CY2026 guidance midpoint, near the top of the guided range, even before net debt roughly doubled in 1H26 | Triggered | Medium | Medium | `04_guidance-consensus.md` §3; `2Q26 Activities Report`, p.4 | Leaves limited room for interest costs to surprise favourably; more room to surprise adversely given the disclosed 1H26 debt build |
| Capex guidance-vs-consensus gap is scope-dependent (+28% above the narrow "Total capex" line but −13% below the all-in figure including flotel/transition/relocation/Petrobras items) — not a clean beat/miss signal | Triggered | Medium | High | `04_guidance-consensus.md` §3 | A reader quoting the bare "consensus above guidance" framing without the scope caveat would draw the wrong conclusion |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The entire H1 2026 EBITDA bar rests on a single analyst's estimate; US$46.5m of already-incurred flotel/FPSO integrity spend alone is ~37% of that US$125.9m EBITDA bar | Triggered | High | High | `05_beat-miss-setup.md` §3, §10 (named as the #1 pre-mortem risk) | If that single analyst under- or over-modelled the flotel cost, the "beat" or "miss" read could be an artefact of thin coverage rather than genuine operating performance |
| Historical 2-year pattern (Revenue/EBITDA miss, NPAT/EPS beat) is judgment from n=2 consecutive annual observations, well below the ~8 needed for an empirical base rate | Triggered | Medium | Medium | `05_beat-miss-setup.md` §7; CLAUDE.md §10 | Correctly labelled as judgment by `05`, not a measured frequency — carried here so the synthesis layer does not treat it as a reliable predictor |
| "Setup is balanced" verdict rests on the assumption that the single H1-2026 analyst's model of the flotel spend is directionally accurate — an assumption the report itself cannot verify pre-print | Unclear | Medium | Medium | `05_beat-miss-setup.md` §8 | The stated verdict is honest and hedged, but its accuracy is contingent on data this report explicitly cannot see |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Effective tax rate swung from 46.7% (FY2024) to 12.4% (FY2025) — a >US$87m two-year swing on a single non-cash Brazilian-real deferred-tax FX translation line | Triggered | High | High | `06_earnings-quality.md` §8, Accounting Trap Checklist severity 75/100 (inverted) | Both the statutory tax line and the "Underlying" earnings measure are noisier and less comparable period-to-period than a reader taking either number at face value would assume — named by `06` as the single biggest quality concern |
| Inventory days (DIO) rose 133% YoY (11.3→31.9 days), meeting the module's mechanical accrual-quality threshold | Triggered | Medium | High | `06_earnings-quality.md` §3, §6 | Explained by cargo-lifting timing (one less cargo shipped at year-end) rather than a demand issue, but real earnings/cash timing risk into the next reporting period regardless of the stated cause |
| Large fair-value / mark-to-market gains (US$21.2m contingent-consideration FV change + US$35.3m FPSO-disposal gain, FY2025) both flow through statutory P&L and are large relative to a ~US$125.5m NPAT base | Triggered | High | High | `06_earnings-quality.md` §8, severity 50/100 (inverted); §4, §5 | Both are well disclosed and itemised out of Underlying results, but their size means a reader looking only at statutory NPAT would see a materially distorted picture |
| FY2024's 96.5% cash-conversion ratio (the strongest of the five years shown) was itself flattered by a one-off US$50.9m deferred-tax-asset release | Triggered | Medium | High | `06_earnings-quality.md` §1 ("Other operating items" residual note) | The prior year's apparent cash-conversion strength is partly a one-off, not purely a repeatable operating characteristic — relevant context if FY2024 is used as a high-water-mark comparator |
| Cash conversion (CFO/EBITDA) fell to 66.0% in FY2025, the lowest since FY2021, against a rising interest bill (US$46.1m→US$70.2m) | Triggered | Medium | High | `06_earnings-quality.md` §2 | Still above the module's 50% red-flag threshold (does not trigger the cash-conversion-breakdown criterion), but the direction and the rising interest bill both warrant monitoring into the H1/FY2026 print |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| A single external variable (group-blended realized oil price) dominates earnings sensitivity — its ranked impact (~US$110.7m avg) is roughly 5x the next-largest variable (production volume, ~US$21.9m) | Triggered | High | High | `07_earnings-sensitivity.md` §3, §4 | The entire earnings setup is, in substance, a leveraged bet on Brent/Mars-differential crude prices, not a diversified operating story |
| Zero hedges means zero floor — no asymmetric downside protection against a price decline | Triggered | High | High | `07_earnings-sensitivity.md` §6 | The full symmetric downside of the price sensitivity is live, not capped, unlike a hedged peer |
| Single-FPSO, single-well concentration at Baúna — 91.2% of FY2025 gross profit runs through one vessel; a reliability event cut segment production 46% QoQ in a single planned window in 2Q26 | Triggered | High | Medium | `07_earnings-sensitivity.md` §6; `2Q26 Activities Report`, p.1, p.4 | An unplanned reliability event of similar scale would hit with no warning and no diversified-asset offset |
| Non-operated Who Dat asset — Karoon (30% working interest) does not control the E-riser repair timeline (targeted 3Q26 by operator LLOG) or the Who Dat East FID (expected 3Q26) | Triggered | High | Medium | `02_revenue-drivers.md` §5; `07_earnings-sensitivity.md` §6 | The company's own largest near-term US recovery lever is on someone else's schedule — a binary/step-change risk, not a smooth one |
| Interaction effects (volume shortfall + operating deleverage on unit costs; price rally + higher ad valorem export-tax dollar cost) are named but not compounded into the base sensitivity table's bull/bear figures | Triggered | Medium | High | `07_earnings-sensitivity.md` §5 | A reader summing the individual sensitivity rows independently would understate the combined downside of a simultaneous volume-and-cost shock, and overstate the net upside of a price rally |
| No company-disclosed group-level Brent-to-revenue/EBITDA sensitivity exists — only a narrow sensitivity for the US$34.2m Petrobras contingent-consideration liability, not for the ~US$628.6m of group revenue the company itself calls "near pure oil exposure" | Triggered | Medium | High | business-model `10_external-dependency.md` §2 | The single highest-impact variable in this entire module rests on this report's own per-unit derivation, not a company-published figure — labelled Inference throughout `07`, appropriately, but a genuine disclosure gap |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Multiple EBITDA bases in use across the module — Capital IQ-standardized (US$498.3m/US$364.7m FY24/FY25, used in `01`'s annual table) vs company-reported "EBITDA" (US$450.3m/US$380.7m, used in `03`/`06`/`07`) vs company "Underlying EBITDAX" (US$403.2m TTM, used in `01`'s TTM snapshot and `07`'s sensitivity base) | Unclear | Medium | High | `01_historical-financials.md` §1, §2; `03_margin-drivers.md` §3; `06_earnings-quality.md` §1; `07_earnings-sensitivity.md` §2 | Each individual agent labels its own basis correctly (CLAUDE.md §15 compliant) — this is not a defect in any one report — but a downstream reader condensing across sections without preserving the basis label could quote the wrong EBITDA figure under the wrong name |
| CIQ Financials workbook's Dec-31-2023 column mechanically doubles the genuine 6-month TY23 transition-period figures (confirmed by exact 2.0000x ratio) | Triggered | Low | High | `01_historical-financials.md` §0 | Already identified and excluded by `01`, not a live conflict; flagged here as a general caution that other CIQ tabs sourced from the same workbook family should be spot-checked for the same artefact if used elsewhere |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| This is fundamentally a commodity-conditional thesis, not a company-specific earnings story — ~93% oil/liquids-weighted, zero hedges, and the single highest-sensitivity variable (oil price) outweighs the next-largest by 5x | Triggered | High | High | `07_earnings-sensitivity.md` §4, §7; business-model `10_external-dependency.md` §3 | Per CLAUDE.md §14, the final thesis classification should read Commodity-conditional (or Company-specific-with-heavy-commodity-conditionality), and conviction should be downgraded accordingly rather than presented as a pure operating-execution story |
| Risk that the 2Q26 price spike headline ("+33–58% QoQ") gets narrated as "earnings accelerating" when management's own 2H26 planning assumption sits below the print and the underlying volume trend is deteriorating | Triggered | High | High | `02_revenue-drivers.md` §7; `04_guidance-consensus.md` §2 | The single most likely mis-framing risk for this ticker — every upstream agent that discusses the 2Q26 price correctly hedges it, but the headline number is the kind of figure that can lose its qualifier one layer up (CLAUDE.md §3) |
| Cash-conversion quality score (68/100, "Strong" band) and Earnings Volatility score (74/100, "High-volatility" band, inverted — higher = worse) sit in seemingly opposite bands and could read as contradictory without care | Unclear | Medium | Medium | `06_earnings-quality.md` §9; `07_earnings-sensitivity.md` §7 | Both are correct and not actually contradictory — earnings are well cash-backed AND highly sensitive to an external, unhedged price variable — but the synthesis layer must hold both truths simultaneously rather than average them into a single "moderate" read |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Data Completeness | H1/FY2026 result due today, not in this data pool — all downstream figures are pre-print positioning | Triggered | Critical | High | The entire module's verdict is provisional and could be overtaken by the actual print within hours |
| 2 | Historical Trend | Statutory EBITDA margin "expansion" (+257bps) is a one-off artefact; adjusted margin actually compressed 641bps | Triggered | High | High | Reported EBITDA-margin line alone gives the wrong directional read |
| 3 | Historical Trend | Statutory NPAT margin (+357bps) vs Underlying NPAT margin (-1,046bps) — same distortion on the bottom line | Triggered | High | High | Headline NPAT print is the metric most likely to mislead if the one-offs aren't carried forward |
| 4 | Revenue | 2Q26 price spike not treated as run-rate by management itself (2H26 planning assumption below the actual 2Q26 print) | Triggered | High | High | Risk of extrapolating a one-time geopolitical spike into the ongoing/next-period narrative |
| 5 | Revenue / Sensitivity | Zero active price hedges — full unmitigated exposure to the dominant revenue/earnings driver | Triggered | High | High | No downside protection if the recent price strength reverses |
| 6 | Revenue | Revenue "recovery" is price-only; volume is deteriorating (CY2026 production guidance cut ~11%) | Triggered | High | High | Two halves of the revenue story moving in opposite directions |
| 7 | Revenue | Brazilian export-tax expiry (~7-Sep-2026) is ~11 days after this report, outcome unresolved | Triggered | High | Medium | Live, near-term binary policy event with no company-side lever |
| 8 | Margins | "Non-recurring" cost basket changes every disclosed year — Underlying NPAT/EBITDAX is a moving target | Triggered | High | High | Weakens the reliability of management's own headlined "Underlying" metric |
| 9 | Guidance/Consensus | Real, filed guidance deterioration: production cut ~11%, capex raised ~55%, twice since January 2026 | Triggered | High | High | Confirms structural (asset/reliability) deterioration, not analyst over-caution |
| 10 | Guidance/Consensus | Street revision breadth net negative across Revenue/EBITDA/EBIT/EPS, worsening over time | Triggered | High | High | Consensus has been chasing guidance cuts down, not providing a low bar |
| 11 | Beat/Miss Setup | Entire H1 2026 EBITDA bar rests on one analyst's estimate; a single cost item is ~37% of that bar | Triggered | High | High | A thin single-analyst estimate, not a broad consensus, decides the beat/miss framing |
| 12 | Earnings Quality | Effective tax rate swung 46.7%→12.4% on a >US$87m two-year non-cash FX line | Triggered | High | High | Named by `06` as the single biggest quality concern; both statutory tax and "Underlying" earnings are noisier than a face-value read suggests |
| 13 | Sensitivity | Single external variable (oil price) dominates — ~5x the next-largest sensitivity | Triggered | High | High | The earnings setup is, in substance, a leveraged bet on crude prices |
| 14 | Sensitivity | Single-FPSO concentration — 91.2% of gross profit through one vessel | Triggered | High | Medium | A single reliability event can cut the whole segment's output with no diversified offset |
| 15 | Narrative | Thesis is fundamentally commodity-conditional, not company-specific | Triggered | High | High | Should be classified and conviction-capped per CLAUDE.md §14, not read as a pure operating-execution story |
| 16 | Narrative | Risk that the 2Q26 price headline gets narrated as "earnings accelerating" losing its hedge one layer up | Triggered | High | High | The most likely qualifier-loss failure mode for this ticker (CLAUDE.md §3) |
| 17 | Earnings Quality | Large FV/mark-to-market gains (US$21.2m + US$35.3m, FY2025) both flow through statutory P&L | Triggered | High | High | Statutory NPAT alone materially overstates repeatable earnings power |
| 18 | Guidance/Consensus | Consensus interest expense already near top of guided range, before the 1H26 net-debt build | Triggered | Medium | Medium | Limited room for interest costs to surprise favourably |
| 19 | Sensitivity | Non-operated Who Dat asset — Karoon does not control E-riser repair or FID timing | Triggered | High | Medium | The company's biggest near-term US recovery lever is on someone else's schedule |
| 20 | Data Completeness | Beat/miss bar rests on a single-analyst (n=1) H1 2026 estimate | Triggered | High | High | (Same fact as #11, listed once here for the Data Completeness lens) |
| 21 | Earnings Quality | Inventory days (DIO) rose 133% YoY, meeting the mechanical accrual-quality threshold | Triggered | Medium | High | Explained by cargo timing, but a real earnings/cash timing risk into the next print |
| 22 | Earnings Quality | FY2024's 96.5% cash conversion was itself flattered by a one-off US$50.9m deferred-tax-asset release | Triggered | Medium | High | Prior-year cash-conversion strength is partly one-off, relevant if used as a comparator |
| 23 | Earnings Quality | Cash conversion (CFO/EBITDA) fell to 66.0% in FY2025, lowest since FY2021, against a rising interest bill | Triggered | Medium | High | Still above the red-flag threshold, but the direction warrants monitoring |
| 24 | Margins | Unsuccessful exploration-well write-offs recur every year but are labelled non-recurring | Triggered | Medium | High | Understates the true run-rate cost of the exploration programme |
| 25 | Margins / Sensitivity | Operating deleverage on volume shortfalls is non-linear versus the sensitivity table's symmetric figures | Triggered | Medium | High | Understates the true downside of the ongoing Who Dat/Baúna shut-ins |
| 26 | Guidance/Consensus | AUD/USD conversion rate used to reconcile consensus is derived/inferred, not a filed rate | Triggered | Medium | Medium | Every restated USD consensus and capex-gap figure inherits this inferred FX rate |
| 27 | Guidance/Consensus | Capex guidance-vs-consensus gap is scope-dependent (+28% narrow vs -13% all-in) | Triggered | Medium | High | Bare "consensus above/below guidance" framing without the scope caveat is misleading |
| 28 | Sensitivity | Interaction effects (volume+cost; price+export-tax) not compounded into the base sensitivity table | Triggered | Medium | High | Understates combined downside / overstates net price-rally upside if summed row-by-row |
| 29 | Sensitivity | No company-disclosed group-level Brent-to-revenue/EBITDA sensitivity exists | Triggered | Medium | High | The highest-impact variable in the module rests on inferred, not company-published, coefficients |
| 30 | Source Conflicts | Multiple EBITDA bases (CIQ-standardized / company-reported / Underlying EBITDAX) in use across upstream agents | Unclear | Medium | High | Individually correct, but risks being condensed into the wrong figure under the wrong label downstream |
| 31 | Narrative | Quality score (68, Strong) and Volatility score (74, High/worse) look contradictory without care | Unclear | Medium | Medium | Both are correct simultaneously — cash-backed AND highly commodity-sensitive — must not be averaged |
| 32 | Historical Trend | H1 2025 EBITDAX margin spike (+1,340bps YoY) diverges from the revenue/gross-margin decline over the same half | Triggered | Medium | High | Already resolved by `01` (one-off FPSO gain) — carried forward so it is not re-discovered as a new "H1 strength" signal |
| 33 | Beat/Miss Setup | "Setup is balanced" verdict is contingent on the accuracy of a single pre-print analyst model | Unclear | Medium | Medium | Verdict is honest and hedged, but unverifiable until the print lands |
| 34 | Revenue | Customer concentration — two customers >98% of revenue | Triggered | Medium | High | Structural counterparty concentration in a fully unhedged business |
| 35 | Historical Trend | "Two contrasting halves" (H1 cost-heavy, H2 better) framing is unproven ahead of the print | Unclear | Medium | Medium | If H1/FY2026 doesn't show the cost load moderating, the narrative loses its evidentiary basis |
| 36 | Margins | Unit DD&A guided higher for CY2026 vs FY2025 actual | Triggered | Low | High | A modest, locked-in non-cash cost headwind |
| 37 | Data Completeness | Investor deck ~24 months stale | Triggered | Low | High | Minor; transcripts and Activities Reports substitute |
| 38 | Data Completeness / Source Conflicts | CIQ workbook's Dec-31-2023 column mechanically doubles the real 6-month TY23 figures | Triggered | Low | High | Already caught and excluded by `01`; caution flag only for other CIQ-sourced tabs |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 34 |
| Critical flags | 1 |
| High flags | 18 |
| Medium flags | 12 |
| Low flags | 3 |
| Unclear flags | 4 |
| Unavailable checks (data missing) | 0 |

## 5. Red-Flag Severity Verdict

**Material concerns.**

The setup carries one Critical, data-timing flag (the H1/FY2026 print was due the same day as this analysis and is not yet in the pool, making every consensus, guidance, and beat/miss read explicitly provisional) plus a wide, consistent set of High-severity flags — a real, filed guidance deterioration (production cut ~11%, capex up ~55%), zero hedges against a single dominant, oil-price-dependent earnings variable, two consecutive years of statutory-margin "expansion" that is actually a one-off accounting artefact, and a beat/miss bar resting on a single analyst's model of a cost item worth ~37% of the entire EBITDA base. None of this amounts to a governance, fraud, or going-concern flaw — cash conversion is genuinely strong and well-disclosed (`06_earnings-quality.md` §9) — but the earnings setup as read from this pool is fragile to (a) the imminent print and (b) a commodity variable the company does not hedge and cannot control. The single most dangerous red flag is #1 (the pre-print data-timing gap): it is resolved simply by the actual H1/FY2026 Half-Yearly Report and Half-Year Audit Review landing in the data pool, at which point every downstream figure in this module should be re-run against the primary filing rather than the current pre-print positioning.

## 6. What The Synthesis Agent Should Know

- 34 red flags triggered (1 Critical, 18 High, 12 Medium, 3 Low), plus 4 flagged "Unclear" — a dense but consistent set, not scattered noise; the same handful of underlying facts (unhedged commodity exposure, real guidance deterioration, one-off-driven margin metrics) recur across multiple categories.
- The single most dangerous red flag is the pre-print data-timing gap (#1): the H1/FY2026 half-year result was due today, 2026-08-27, and is not in this data pool. Every guidance/consensus/beat-miss figure downstream is provisional positioning, not a post-print read. Resolve by re-running the module once the Half-Yearly Report and Half-Year Audit Review land.
- No red flag here should change the earnings verdict on its own — but the combination of the guidance-cut timeline (#9), negative and worsening revision breadth (#10), and the thin single-analyst H1 bar (#11) argues against reading the setup as cleanly "improving" even with the 2Q26 price spike; if `99_earnings-synthesis` is inclined toward "Earnings accelerating" or "Earnings inflecting — positive," it should weigh #4, #6, #9, #10, #16 first.
- Score caps to consider from MODULE_RULES: the sensitivity report (`07`) already applies above-Low confidence to its earnings-volatility score because most dollar-material sensitivity rows are guidance-anchored — no additional cap is triggered by this scan on that score. No MODULE_RULES hard-cap trigger (no-consensus, no-transcript, no-segment-P&L, no-cash-flow) applies to KAR — all were confirmed present in `00_earnings-data-triage.md` §5/§6.
- No material contradictions between upstream agents were found — they are unusually well cross-referenced and internally consistent. One basis-consistency risk to carry forward: three different EBITDA figures (CIQ-standardized, company-reported, Underlying EBITDAX) are each correctly labelled in their own source report but could be conflated if synthesis drops the basis label (Section 2.9, #30).
- Missing data that prevented a fuller scan: the H1/FY2026 print itself (the dominant gap); a company-disclosed group-level Brent-to-revenue/EBITDA sensitivity (the highest-impact variable in the whole module rests on an inferred coefficient); confirmed resolution of the US royalty-relief application and the ~7-Sep-2026 Brazilian export-tax expiry (both resolve within days to weeks of this report).
- The setup is genuinely dirtier on the "quality of the improvement story" than the upstream agents' own individual verdicts might suggest in isolation — each upstream report correctly hedges its own claims (e.g. `03`'s "flagged, not trusted at face value" on the EBITDA margin), but the volume of one-off-driven, thinly-modelled, and pre-print-positioned evidence, taken together, is more fragile than any single upstream section states on its own. This module's own scores (`06` quality 68/100 Strong; `07` volatility 74/100 High-worse, inverted) already reflect that this is a cash-backed but highly volatile earnings profile — this scan does not dispute either score, but flags that a reader averaging them into "moderate" would be wrong (Section 2.10, #31).

## 7. Pre-Mortem — If The Earnings Setup Fails

If this earnings-setup read turns out wrong, the single most likely reason is that the H1/FY2026 print — due the same day as this analysis and not present in this data pool — lands with a THIRD consecutive adverse guidance revision (a further production cut, capex increase, or export-tax extension confirmed alongside the result), which this report could not see coming because every figure it relies on is pre-print positioning built on a single analyst's thin H1 2026 estimate. Management has already cut production guidance and raised capex guidance twice in 2026 (January and July); Street revision breadth has been net negative and worsening for three straight months; and the entire H1 2026 EBITDA bar hinges on whether one analyst correctly modelled a single US$46.5m cost line. A print that confirms rather than reverses this trend would turn the "balanced" beat/miss setup and the two-sided price narrative into a clean, avoidable miss — avoidable in the sense that every disclosed input pointing that way (the guidance cuts, the negative revision breadth, the thin single-analyst bar) was already visible in this pool before the print; the failure would be one of timing (CLAUDE.md §20 "timing error"), not missing evidence.
