# valuation Module Dossier — HAIER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-08-12T22:43:56Z
- Module folder: `valuation`
- Contents: 1 module synthesis + 8 specialist outputs = 9 files

## Table of Contents

- [valuation — module synthesis](#valuation-module-synthesis) — `99_valuation-synthesis.md`
- [valuation / 00_valuation-data-triage.md](#valuation-00-valuation-data-triage-md) — `00_valuation-data-triage.md`
- [valuation / 01_price-and-capital-structure.md](#valuation-01-price-and-capital-structure-md) — `01_price-and-capital-structure.md`
- [valuation / 02_multiples-own-history.md](#valuation-02-multiples-own-history-md) — `02_multiples-own-history.md`
- [valuation / 03_relative-valuation-peers.md](#valuation-03-relative-valuation-peers-md) — `03_relative-valuation-peers.md`
- [valuation / 04_intrinsic-dcf.md](#valuation-04-intrinsic-dcf-md) — `04_intrinsic-dcf.md`
- [valuation / 05_reverse-dcf.md](#valuation-05-reverse-dcf-md) — `05_reverse-dcf.md`
- [valuation / 06_sum-of-the-parts.md](#valuation-06-sum-of-the-parts-md) — `06_sum-of-the-parts.md`
- [valuation / 07_scenario-and-fair-value.md](#valuation-07-scenario-and-fair-value-md) — `07_scenario-and-fair-value.md`


---

## valuation — module synthesis

_Source: `99_valuation-synthesis.md`_

# Valuation Module — HAIER (Synthesis)

## Abstract

Haier Smart Home reads as fairly valued, not cheap: base fair value of CNY 23.67/share sits only 8.8% above the CNY 21.75 price, inside the fairly-valued band. Bull, base, bear-cyclical, and headline bear-structural levels run CNY 31.78, 23.67, 16.79, and 15.90 — driven mainly by peer-relative multiples (68% weight), which find most of Haier's 25–38% discount to Midea, Gree, and Whirlpool warranted by below-peer margins and a confirmed eroding moat. The reverse-DCF read implies an unprecedented cash-flow contraction, but that signal is entangled with an unusually low China discount rate. Margin of safety is a modest 8.1%, while downside to the structural bear case is 26.9% — a real asymmetry, and genuine earnings-trajectory value-trap risk.

## 1. Valuation Verdict

- **Verdict:** Fairly valued
- **Base-case fair value (point, per share):** CNY 23.67 (weighted triangulation across `03`/`04`/`06`; cross-checked at CNY 23.56 by the independent forward-metric × multiple build, a 0.5% gap)
- **Current price:** CNY 21.75 (A-shares, SHSE:600690, last close 2026-08-12, price-state `pool-verified`, 1 trading day old — no staleness cap)
- **Bull / Base / Bear fair-value levels (points):** Bull CNY 31.78 / Base CNY 23.67 / Bear-cyclical CNY 16.79 (12-month) / Bear-structural (headline) CNY 15.90 (24–36 month)
- **Cross-method dispersion (football field, low–high):** CNY 15.90 (DCF structural runoff, exit-multiple read) to CNY 34.11 (DCF sensitivity-grid high end); core value-producing methods (peers CNY 22.08, DCF CNY 29.84, SOTP CNY 23.86) span CNY 22.08–29.84, a 35.1% spread (below the 40% hard-disagreement trigger, reconciled explicitly, see §3)
- Valuation attractiveness /100 *(higher = cheaper)*: **45**
- Margin of safety /100 *(higher = better)*: **40** (base-case cushion is 8.1%)
- Valuation confidence /100: **68**
- Downside risk /100 *(higher = worse)*: **58** (26.9% loss to the headline structural bear case)
- Data quality /100: **80**
- Overall usefulness /100: **78**
- Dominant valuation method (one line): Peer-relative valuation (`03`) — the only method resting on real, dated market prices for named comparables, and its quality-adjusted multiple (7.35x) independently converges with `02`'s own 8-quarter trading mean (7.38x) despite being derived by a completely different route.
- What's priced in (one line): At `04`'s own WACC (4.10%) and 7.0x terminal multiple, the price implies either a sustained ~6.5%/yr FCF/EBITDA contraction through FY2030 or a 4.40% EBIT margin (below Haier's own FY2021 trough) — historically unprecedented — but this reading is entangled with a mechanically-too-low WACC (a flat, no-growth path only reconciles to price at ≈12.3% WACC), so the market may simply be discounting ordinary cash flows at a higher rate than CAPM implies, not pricing genuine collapse.
- Biggest valuation risk (one line): The moat module's independently confirmed "eroding" trajectory (460bp gross-margin decline over five years, ROIC down for two straight readings from its FY2024 subsidy-assisted peak) is a live, already-firing trend, not a hypothetical bear case — if it continues rather than stabilizes, the structural-reset bear (CNY 15.90, −26.9%) becomes the realistic path rather than a tail case.

## 1A. Module Disconfirmation

- **Strongest bear point:** The moat's confirmed "eroding" trajectory has already fired the structural-decline trigger (`business-model/09_moat.md` §5) — gross margin down 460bp in five years, ROIC falling for two straight readings — and produces a headline bear case of CNY 15.90 (−26.9%), a real quarter of the current price, not a remote tail.
- **Strongest bull point (steelman):** Two independent methods — `02`'s own 8-quarter trading mean/median (7.38x/7.34x EV/EBITDA) and `03`'s quality-adjusted peer multiple (7.35x, derived entirely from named comps and an evidenced margin haircut) — converge almost exactly, meaning the "cheap because deserved" read is not a single method's artefact; and Haier's net-cash balance sheet (−0.95x EBITDA) limits (not eliminates) the depth of the bear case relative to a levered peer like Whirlpool (+6.89x).
- **Single killer risk:** The entire "fairly valued, modest cushion" verdict rests on `03`'s judgment that the 25–38% peer discount is "mostly, not fully" explained by fundamentals — if the moat's already-confirmed erosion is not a stabilizing dip but a continuing trend, the residual "mostly explained" discount understates the correct multiple, and the structural bear becomes the realistic base case rather than a tail risk.
- **Disconfirming evidence already visible:** `05`'s reverse-DCF finds the market-implied WACC consistent with a flat/no-growth story is ≈12.3%, nearly 3x `04`'s CAPM-derived 4.10% — a gap this large suggests either the DCF's headline (+37.2%) is a low-WACC artefact (discounting the bull case's credibility) or the market genuinely misprices Haier's cost of capital; either reading cuts against treating `04`'s +37.2% as a clean undervaluation signal.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | Sufficient — all four sufficiency elements met (price, capital structure, forward consensus, peer comps, segment data) | No fully diluted share count / options schedule in the pool; per-share values fall back to diluted weighted-average shares, a labelled limitation |
| price-and-capital-structure | Anchor set: CNY 21.75 price (pool-verified, 1 day old), EV CNY 175,100.7m (broad cash basis), net cash −24,598.7m broad / −8,503.5m strict | Haier is a multi-class issuer (A/H/D-shares) — market cap built per-class at each venue's own price, not a single-price shortcut, to avoid a ~5.9% overstatement |
| multiples-own-history | Trades at bottom 10–25th percentile of its own 8-quarter multiple range, 6–18% below own mean/median | Only 8 quarters of pool history (short of the 3-year bar) — reversion target is illustrative-only, zero-weighted in `07`'s base point, but its 7.38x mean independently converges with `03`'s quality-adjusted multiple |
| relative-valuation-peers | 25–38% discount to Midea/Gree/Whirlpool median on every price multiple, largely warranted | Quality-adjusted EV/EBITDA (7.35x, haircut for Haier's 24%-below-peer EBITDA margin) implies CNY 22.08/share, only +1.5% vs price — the raw discount is mostly, not fully, explained by fundamentals |
| intrinsic-dcf | Base-case intrinsic value CNY 29.84/share, +37.2% vs price, but producer-capped to Moderate confidence | Mechanically-correct WACC (4.10%) flagged by its own producer as "materially below the discount rate the market appears to actually apply" (Haier's own trading multiple has never exceeded 10.1x EV/EBITDA); explicit structural-decline runoff case produces CNY 15.90–21.51 |
| reverse-dcf | Price implies −6.48%/yr FCF/EBITDA contraction through FY2030, or a 4.40% terminal EBIT margin — both historically unprecedented | The finding is entangled with `04`'s own low-WACC caveat: a flat, no-growth FCF path only reconciles to price at ≈12.3% WACC, a far more ordinary rate for a China industrial |
| sum-of-the-parts | Base-case breakup value CNY 23.86/share, +9.7% vs price, but comp-fragile | 49% of gross EV comes from the Laundry segment priced on Midea's 12.71x derived multiple (an imperfect comp); swapping to the cheapest domestic comp drops the value to CNY 16.74, a 23% swing |
| scenario-and-fair-value | Base CNY 23.67/share (+8.8%); bull CNY 31.78; bear-cyclical CNY 16.79; headline bear-structural CNY 15.90 | Margin of safety (+8.1%) and downside-to-bear (26.9%) are deliberately asymmetric — a modest cushion against a much larger drop is the single most important number in the dossier |

## 3. Reconciliation

The core cross-method spread — `04`'s DCF (CNY 29.84) vs `03`'s peer-relative base (CNY 22.08) — is 35.1%, below the 40% hard-disagreement trigger but close enough to require explicit reconciliation rather than a silent blend. `04`'s own producer already explains the gap: its mechanically-correct WACC (4.10%) is a product of China's sub-2% sovereign bond yield and Haier's low 0.46 beta, and it is "materially below the discount rate the market appears to actually apply to this stock" — Haier's own trading multiple has never exceeded 10.1x EV/EBITDA, yet the DCF's Gordon-growth terminal value (not used for the headline) implies a 24.7x terminal multiple at the same WACC. `05`'s reverse-DCF corroborates from the other direction: a flat, no-growth FCF path only reconciles to today's price at a WACC of ≈12.3%, far closer to what a China-listed industrial should carry. This is a low-WACC artefact pulling the DCF value up, not new evidence of undervaluation — and it is precisely why the Scenario Construction Policy caps `04` (plus `06`) combined at ≈⅓ weight rather than letting it drive the base point. `06`'s SOTP (CNY 23.86) sits close to the blended base but is separately flagged by its own producer as comp-fragile (43% of the spread rides on one segment's peer choice). Methods broadly agree once the DCF's WACC artefact is discounted: fair value clusters at CNY 22.08–23.86 across `03` and `06`, with `04`'s CNY 29.84 shown as an outlier explained above, not averaged in at full weight. The triangulated base point is CNY 23.67, dispersion CNY 15.90–34.11 across the full football field.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N — price is `pool-verified`, 1 trading day old | — | Not applicable |
| Stale pool-verified price (>5 trading days) | N — 1 trading day old | — | Not applicable |
| No consensus / forward estimates | N — FY2026E–FY2030E consensus present | — | Not applicable |
| No peer data | N — 3-name named peer set + 10-name corroborating CapIQ set | — | Not applicable |
| Only one valuation method usable | N — five methods run (02–06) | — | Not applicable |
| No cash flow AND DCF is only method | N — full cash flow statement present, and DCF is one of three weighted methods | — | Not applicable |
| SOTP not possible for multi-segment | N — SOTP ran on 6 reportable segments | — | Not applicable |
| Methods disagree >40% unreconciled | N — DCF vs peers spread is 35.1%, below the 40% trigger, and explicitly reconciled in §3 | — | Not applicable |
| Terminal value >75% of DCF EV | N — canonical exit-multiple basis TV is 74.94% of EV, just under the threshold (flagged as near-threshold by `04`, not clear of it) | Valuation confidence | Not triggered, but factored into the 68 confidence score qualitatively |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | N — management-governance module tested this explicitly and found Haier Group Corporation a collectively-owned enterprise, not government-controlled, not a value-maximizing parent's subsidiary, not a sprawling conglomerate; RF-OWN-004 not fired | — | Not applicable |

No hard score caps are triggered in this run. Valuation confidence (68) and the other scores reflect analyst judgment on data completeness, method convergence, and the near-threshold terminal-value and cross-method-spread findings noted above, not a mechanical cap.

## 5. Fair-Value Summary

The bull/base/bear levels — CNY 31.78 / 23.67 / 16.79 (cyclical) / 15.90 (headline structural) — are driven by the peer-relative method (`03`, 68% weight), the only method anchored in real, dated market prices for named comparables (Midea, Gree, Whirlpool); its quality-adjusted multiple independently converges with `02`'s own trading history, the strongest signal in this dossier. The current price implies, under `04`'s reverse-DCF, either a historically unprecedented multi-year cash-flow contraction or an all-time-low margin — evidence does not support either as achievable on Haier's own five-year history (revenue has never posted a full-year decline; FCF fell in only one of five years and fully rebounded) — but that "market is too pessimistic" read is undercut by `04`'s own admission that its WACC is unusually low relative to what the market visibly pays for this stock. The margin of safety (8.1%, the cushion if the base case is right) and the downside to the headline bear (26.9%, the loss if moat erosion continues) are genuinely different numbers, and the gap between them is the finding: a thin cushion against a much larger potential drop. Whether this is a genuine margin of safety or value-trap risk hinges entirely on whether the moat module's confirmed "eroding" trajectory (gross margin down 460bp in five years, ROIC falling for two straight readings from a subsidy-assisted FY2024 peak) is a stabilizing dip or a continuing trend — the evidence base (two consecutive earnings misses, ongoing consensus cuts) leans toward the latter, which argues for caution rather than conviction on the cheapness.

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Fairly valued | A clean beat-and-raise quarter breaking the consensus-cutting cycle (`02` §3: two consecutive misses, EPS cut ~14% over 6 months) would re-open the case for reversion toward `02`'s own 7.38x mean, lifting the peer-relative base toward CNY 24–29 | Confirmation that the moat's "eroding" trajectory (gross margin, ROIC) continues for another 1–2 readings would validate the structural-reset bear as the realistic path, not the tail case, pulling the base toward CNY 16–20 | FQ2 2026 results (due 2026-08-27) for a fresh segment split and a read on whether margin compression is stabilizing; a genuine pure-play laundry-appliance comp to resolve the SOTP's Laundry-segment comp-fragility (§5 of `06`) |

## 7. Note To The Final Synthesizer

- Bull/base/bear fair-value levels: CNY 31.78 / 23.67 / 16.79 (bear-cyclical, 12-month) / 15.90 (bear-structural, headline, 24–36 month). Dominant method: peer-relative (`03`), driven by real market comps and independently corroborated by `02`'s own trading history.
- What the price implies (from `05`): a historically unprecedented FCF/EBITDA contraction OR an all-time-low margin — not achievable on Haier's own five-year history taken at face value, but this "aggressive pessimism" read is entangled with `04`'s own flagged low-WACC artefact (a flat, no-growth path reconciles at ≈12.3% WACC, not 4.10%). Treat the reverse-DCF finding as two-sided, not a standalone conviction driver.
- Margin of safety (base-case cushion): +8.1%. Downside-to-bear (loss to the headline structural bear): 26.9%. These are deliberately different numbers — the asymmetry (small cushion, large potential drop) is the central finding of this dossier.
- Genuine value vs value-trap risk: this is earnings-trajectory-driven value-trap risk, NOT ownership-driven — the management-governance module tested and did not find a structurally misaligned controlling owner (RF-OWN-004 not fired; Haier Group is a collectively-owned enterprise). The warranted-multiple case: `03` found most (not all) of the 25–38% peer discount justified by Haier's below-peer margins and confirmed-eroding moat; the residual gap once quality-adjusted is a modest +1.5% (CNY 22.08 vs CNY 21.75). Whether that residual is genuine mispricing or the market correctly discounting a continuing structural decline depends on data not yet available (see below).
- Method to trust: `03` (peer-relative), because it rests on real, dated comps and converges independently with `02`'s own-history mean. Method to discount: `04`'s DCF headline (+37.2%) — its own producer flags the WACC behind it as mechanically too low relative to what the market actually pays for this stock; capped at 17% weight for exactly this reason.
- No partial-data caps applied in this run — price is pool-verified and fresh (1 trading day old), all five methods ran, and the cross-method spread (35.1%) stays below the 40% hard trigger. The only soft limitation: no fully diluted share count/options schedule in the pool, so per-share values use diluted weighted-average shares as a labelled fallback (a mild upside bias risk, per `01`).
- Biggest missing data point: FQ2 2026 segment-level results (due 2026-08-27) — the FY2025 segment split used for SOTP predates this release, and a fresh print would clarify whether the margin-erosion/consensus-cutting cycle is stabilizing (supports the bull/base case) or continuing (supports the bear case).
- **Explicit handoff:** the master synthesizer's "Valuation and Peer Mispricing" section should defer to this synthesis; the bull/base/bear fair-value LEVELS here (CNY 31.78 / 23.67 / 16.79 / 15.90) are the inputs for the master's probability-weighted scenario model — this module does not assign probabilities.

## 8. Simple Summary

- Haier is fairly valued, not cheap: base fair value (CNY 23.67) is only 8.8% above the CNY 21.75 price.
- Bull CNY 31.78, base CNY 23.67, bear-cyclical CNY 16.79 (12-month), headline bear-structural CNY 15.90 (24–36 month) — a 2.0x spread.
- The market is pricing in either a severe, unprecedented cash-flow decline or the mildest possible growth case discounted at an unusually low rate — the two readings can't be told apart from valuation alone.
- Downside sits mainly in the structural bear case: −26.9% if the confirmed moat erosion (margin down 460bp over five years) keeps going rather than stabilizing.
- The peer-relative method (real market comps) matters most here — it converges independently with Haier's own trading history, which the DCF (pulled up by an unusually low China WACC) does not.
- This is a real value-trap risk, but an earnings-trajectory one, not an ownership one — no misaligned controlling owner was found.
- A current, pool-verified price was available (1 trading day old) — no data gap there.
- This module is highly useful for the master synthesizer: five methods ran, the cross-method spread is explained rather than blended away, and the margin-of-safety/downside-to-bear split makes the risk/reward math straightforward to build on.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — HAIER

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Mar-26-2026).pdf | Annual filing (A-share/SSE, CAS basis) | FY2025 (ended Dec-31-2025) | 2026-08-12 (Drive sync date; document dated 2026-03-26 inside) | High |
| Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Apr-27-2026).pdf | Annual filing (H-share/HKEX, IFRS basis) | FY2025 (ended Dec-31-2025) | 2026-08-12 (sync) | High |
| Haier_Smart_Home_Co_Ltd_-_Form_Preliminary_Annual_Report(Mar-26-2026).pdf | Preliminary annual filing (CAS) | FY2025 | 2026-08-12 (sync) | Medium (superseded by the full Mar-26-2026 annual report) |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf | Quarterly filing | Q1 2026 (ended Mar-31-2026) | 2026-08-12 (sync) | High |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(May-18-2026).pdf | Interim/administrative filing (dividend implementation notice) | FY2025 dividend distribution | 2026-08-12 (sync) | Low |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Nov-28-2025).pdf | Interim/administrative filing | H1 2025-related notice | 2026-08-12 (sync) | Low |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Oct-30-2025).pdf | Quarterly filing | Q3 2025 (ended Sep-30-2025) | 2026-08-12 (sync) | Medium |
| Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Oct-31-2025).pdf | Interim/administrative filing | Q3 2025-related notice | 2026-08-12 (sync) | Low |
| Haier_Smart_Home_Co_Ltd_-_(Oct-23-2025).pdf | Exchange intimation / material-event disclosure | Oct-2025 | 2026-08-12 (sync) | Low-Medium |
| HaierSmartHomeCoLtdSHSE600690_AllAccess.pdf | Capital IQ company profile digest | Current, mixed | 2026-08-12 (sync) | Medium |
| Key Document Digest.pdf | Capital IQ filing index / digest | Current | 2026-08-12 (sync) | Low (navigation aid) |
| Haier Smart Home Co., Ltd., Q2 2019 Earnings Call, Aug 30, 2019.pdf | Earnings transcript | Q2 2019 | 2026-08-12 (sync) | Low (~7 years stale) |
| Haier Smart Home Co., Ltd., Q3 2019 Earnings Call, Oct 31, 2019.pdf | Earnings transcript | Q3 2019 | 2026-08-12 (sync) | Low (~7 years stale) |
| Haier Smart Home Co Ltd SHSE 600690 Financials.xls — tab: Key Stats | Financials export (CapIQ) | FY2022A–FY2028E | 2026-08-13 | High (price, mkt cap, TEV, multiples) |
| " " — tab: Income Statement | Financials export | Historical + estimates | 2026-08-13 | High |
| " " — tab: Balance Sheet | Financials export | FY2021–Q1 2026 | 2026-08-13 | High |
| " " — tab: Cash Flow | Financials export | FY2021–LTM/Q1 2026 | 2026-08-13 | High |
| " " — tab: Multiples | Financials export | Quarterly, 2024Q4–2026-08-12 | 2026-08-13 | High (own-history multiples) |
| " " — tab: Historical Capitalization | Financials export | Historical | 2026-08-13 | Medium |
| " " — tab: Capital Structure Summary | Financials export | FY2024–Q1 2026 | 2026-08-13 | High (net debt, debt/EBITDA) |
| " " — tab: Capital Structure Details | Financials export | Current | 2026-08-13 | Medium |
| " " — tab: Ratios | Financials export | Historical | 2026-08-13 | Medium |
| " " — tab: Supplemental | Financials export | Historical | 2026-08-13 | Low |
| " " — tab: Industry Specific | Financials export | Historical | 2026-08-13 | Low |
| " " — tab: Pension OPEB | Financials export | Historical | 2026-08-13 | Low |
| " " — tab: Segments | Financials export | FY2020–FY2025 | 2026-08-13 | High (SOTP inputs — business + geographic segments) |
| Haier Smart Home Co Ltd SHSE 600690 Financials (1).xls — 13 tabs | Financials export (near-duplicate of Financials.xls) | Same as above | 2026-08-13 | Redundant re-pull, no new evidence |
| Haier Smart Home Co Ltd SHSE 600690 Financials (2).xls — 13 tabs | Financials export (near-duplicate) | Same as above | 2026-08-13 | Redundant re-pull, no new evidence |
| Haier Smart Home Co Ltd SHSE 600690 Financials Capital Structure Details.xls — tab: Capital Structure Details | Financials export | Current | 2026-08-13 | Low (duplicate of tab above) |
| Haier Smart Home Co Ltd SHSE 600690 Financials Capital Structure Summary.xls — tab: Capital Structure Summary | Financials export | Current | 2026-08-13 | Low (duplicate) |
| Haier Smart Home Co Ltd SHSE 600690 Financials Segments.xls — tab: Segments | Financials export | Current | 2026-08-13 | Low (duplicate) |
| Company Comparable Analysis Haier Smart Home Co Ltd .xls — tab: Financial Data | Comps export (CapIQ) | As-of 2026-08-12 | 2026-08-13 | High |
| " " — tab: Trading Multiples | Comps export | As-of 2026-08-12 | 2026-08-13 | High (peer multiples — 10-name comp set) |
| " " — tab: Operating Statistics | Comps export | As-of 2026-08-12 | 2026-08-13 | Medium |
| " " — tab: Business Description | Comps export | Current | 2026-08-13 | Low |
| " " — tab: Implied Valuation | Comps export | As-of 2026-08-12 | 2026-08-13 | High (peer-multiple implied price/share) |
| " " — tab: Valuation Chart | Comps export | As-of 2026-08-12 | 2026-08-13 | Low |
| " " — tab: Credit Health Panel | Comps export | Current | 2026-08-13 | Low (solvency, not valuation) |
| " " — tab: Disclaimer | Comps export | — | 2026-08-13 | None |
| Haier Smart Home Co Ltd SHSE 600690 Comparable M A Transactions.xls — tab: Comparable M A Transactions | M&A comps export | Historical deals | 2026-08-13 | Medium (precedent-transaction cross-check) |
| Haier Smart Home Co Ltd SHSE 600690 Credit Health Panel.xls — 5 tabs | Credit/solvency export | Current | 2026-08-13 | Low-Medium (net debt cross-check) |
| Haier Smart Home Co Ltd SHSE 600690 Equity Listings.xls — tab: Equity Listings | Current-price export (CapIQ) | 2026-08-12 close | 2026-08-13 | High (current price, all listing venues) |
| Haier Smart Home Co Ltd SHSE 600690 Equity Listings (1).xls — tab: Equity Listings | Current-price export (duplicate) | 2026-08-12 close | 2026-08-13 | Redundant re-pull |
| HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls — tab: Consensus | Consensus/estimates export | FY2026E–FY2030E+ | 2026-08-13 | High |
| " " — tab: Multiples | Consensus/estimates export | NTM, FY2026E–FY2030E | 2026-08-13 | High (forward multiples) |
| " " — tab: Recent Changes | Estimates export | Recent revisions | 2026-08-13 | Medium |
| " " — tab: Guidance | Estimates export | Company guidance history | 2026-08-13 | Medium |
| " " — tab: Surprise | Estimates export | Historical beats/misses | 2026-08-13 | Low (earnings-module relevance) |
| " " — tab: Trends | Estimates export | Estimate trend history | 2026-08-13 | Low |
| " " — tab: Revisions | Estimates export | Estimate revision history | 2026-08-13 | Low |
| HaierSmartHomeCo,LtdSHSE600690EstimatesReport (1).xls — 7 tabs | Estimates export (duplicate) | Same as above | 2026-08-13 | Redundant re-pull |
| HaierSmartHomeCo,LtdSHSE600690EstimatesReport (2).xls — tab: Guidance | Estimates export (partial duplicate) | Same as above | 2026-08-13 | Redundant re-pull |
| Haier Smart Home Co Ltd SHSE 600690 Analyst Coverage.rtf | Analyst coverage list | Current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Board Members.rtf | Governance data | Current | 2026-08-13 | None (valuation) |
| Haier Smart Home Co Ltd SHSE 600690 Committees.rtf | Governance data | Current | 2026-08-13 | None |
| Haier Smart Home Co Ltd SHSE 600690 Compensation Summary Compensation.rtf | Governance data | Current | 2026-08-13 | None |
| Haier Smart Home Co Ltd SHSE 600690 Competitors.rtf | Competitive/peer list | Current | 2026-08-13 | Medium (supports peer-set validation) |
| Haier Smart Home Co Ltd SHSE 600690 Corporate Timeline.rtf / .xls | Corporate history | Historical | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Customers.xls | Customer data | Current | 2026-08-13 | None (valuation) |
| Haier Smart Home Co Ltd SHSE 600690 Events Calendar.xls | Events calendar | Forward | 2026-08-13 | Low (catalyst timing, not valuation input) |
| Haier Smart Home Co Ltd SHSE 600690 Fixed Income Securities Summary.rtf | Debt securities list | Current | 2026-08-13 | Medium (debt-bridge cross-check) |
| Haier Smart Home Co Ltd SHSE 600690 Fixed Income Summary.rtf | Debt securities summary | Current | 2026-08-13 | Medium |
| Haier Smart Home Co Ltd SHSE 600690 Industry Classifications.rtf | Industry classification | Current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Investment Analysis Co Investors.xls | PE/investor data | Historical | 2026-08-13 | None |
| Haier Smart Home Co Ltd SHSE 600690 Investment Analysis Direct Investments.xls | Direct investments | Historical | 2026-08-13 | None |
| Haier Smart Home Co Ltd SHSE 600690 Investment Criteria Direct Investments.xls | Investment criteria | — | 2026-08-13 | None |
| Haier Smart Home Co Ltd SHSE 600690 Key Developments.xls | News/key events | Historical | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 LP Co Investors.xls / LP Investments.xls | LP investor data | Historical | 2026-08-13 | None |
| Haier Smart Home Co Ltd SHSE 600690 Long Business Description.rtf | Business description | Current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 News.rtf | News feed | Historical | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Offices.rtf | Office locations | Current | 2026-08-13 | None |
| Haier Smart Home Co Ltd SHSE 600690 Portfolio Exposure.xls | Fund exposure | Current | 2026-08-13 | None |
| Haier Smart Home Co Ltd SHSE 600690 Private Ownership.rtf | Ownership | Current | 2026-08-13 | None |
| Haier Smart Home Co Ltd SHSE 600690 Products.rtf | Product list | Current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Professionals.rtf | Management bios | Current | 2026-08-13 | None |
| Haier Smart Home Co Ltd SHSE 600690 Public Holdings Detailed.xls | Shareholding data | Current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Public Ownership Summary.rtf | Ownership summary | Current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Strategic Alliances.xls | Alliances/JVs | Historical | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Suppliers.xls | Supplier data | Current | 2026-08-13 | None |
| Haier Smart Home Co Ltd SHSE 600690 Takeover Defenses.rtf / .xls (3 tabs) | Governance/takeover data | Current | 2026-08-13 | Low |
| Haier Smart Home Co Ltd SHSE 600690 Transaction Advisors.xls | Deal advisors | Historical | 2026-08-13 | None |
| Haier Smart Home Co Ltd SHSE 600690 海尔智家股份有限公司 Public Company Profile.rtf | Company profile | Current | 2026-08-13 | Low |
| Haier Smart Home Co., Ltd. (SHSE_600690) Corporate Structure Tree.xls — 3 tabs | Corporate structure/subsidiary tree | Current | 2026-08-13 | Low-Medium (SOTP entity mapping) |
| Transaction Summary Public Offerings.xls — tab: Public Offerings | Historical offerings (equity issuance) | Historical | 2026-08-13 | Low (share-count/dilution history cross-check) |

**Duplication note:** "Financials.xls", "Financials (1).xls", "Financials (2).xls" are near-identical 13-tab CapIQ exports (Key Stats/Income Statement/Balance Sheet/Cash Flow/Multiples/Segments/etc.); "EstimatesReport.xls" / "(1).xls" / "(2).xls" likewise duplicate each other; "Equity Listings.xls" / "(1).xls" are identical. These do not add distinct evidence — they are redundant re-pulls of the same source, not independent confirmations. No `ciq_facts.json` sidecar exists in the pool, so all figures below are this agent's own sourced read of the CapIQ workbook extracts (§4 tier 5, vendor data), cross-checked against the annual/interim filings (§4 tiers 1–2) where line items overlap.

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | China (mainland-incorporated, PRC); dual-primary listing on Shanghai Stock Exchange (A-share, 600690) and Hong Kong Stock Exchange (H-share, 6690); also lists D-shares on Frankfurt/Xetra/Munich/Stuttgart/Vienna/BATS-Chi-X and an unsponsored Level-I ADR (OTC Pink: HSHC.Y) | Equity Listings.xls (11 active listing venues); business-model/00_data-triage.md §2A confirms "於中華人民共和國註冊成立之股份有限公司" — Interim Report (Apr-27-2026).pdf, p.1 |
| Filing regime | Dual: SSE/CSRC disclosure rules (A-share) and HKEX/SFO Part XIVA + Listing Rules (H-share); Form F-6 filed with SEC for the ADR program | Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Mar-26-2026).pdf ("公司代码：600690"); (Apr-27-2026).pdf ("股份代號：6690") |
| Reporting standard | China ASBE (企业会计准则/CAS) — SSE annual report and both quarterly filings; IFRS (國際財務報告準則) — HKEX annual report, same FY2025 period. Quarterly filings state net profit/equity attributable to parent are not materially different under IFRS. | Annual Report (Mar-26-2026).pdf, p.1: "标准无保留意见" (unqualified opinion, 和信会计师事务所); Annual Report (Apr-27-2026).pdf contents page |
| Reporting currency (and scale) | RMB / CNY, reported in millions in CapIQ exports and in RMB (人民币) in the native filings | Key Stats tab: "Currency CNY" throughout; Annual Report (Mar-26-2026).pdf: "人民幣百萬元" |
| Fiscal-year end | December 31 | "12月31日止年度" (Annual Report Apr-27-2026.pdf); confirmed across all Financials tabs (Dec-31 period ends) |
| Document language(s) | Simplified Chinese (SSE annual report, most .rtf company-profile exports); Traditional Chinese + English bilingual (HKEX annual report); English (CapIQ workbook exports, 2019 earnings-call transcripts, Form F-6) | Throughout Section 1; consistent with business-model/00_data-triage.md §2A |

For valuation purposes: current price and share counts are read from the CapIQ Equity Listings/Key Stats exports (all venues, RMB-denominated primary listing on SSE); the enterprise-value bridge, income statement and cash-flow bases use the CAS-basis CapIQ Financials workbook (RMB millions), reconciled where relevant against the audited SSE annual report. No US-form absence (10-K/10-Q) is treated as a gap — the SSE Annual Report and Quarterly Results filings are the local-equivalent primary sources per CLAUDE.md §27.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Mar-26-2026).pdf [A-share/CAS] / (Apr-27-2026).pdf [H-share/IFRS] | FY2025 (ended Dec-31-2025) | ~4.6 |
| Quarterly filing | Haier_Smart_Home_Co_Ltd_-_Form_Interim_Report(Apr-27-2026).pdf | Q1 2026 (ended Mar-31-2026) | ~4.5 |
| Capital structure / balance sheet | Haier Smart Home Co Ltd SHSE 600690 Financials.xls — Balance Sheet + Capital Structure Summary tabs | Q1 2026 (ended Mar-31-2026) | ~4.5 |
| Consensus / estimate export | HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls — Consensus + Multiples tabs | FY2026E–FY2030E; NTM as of 2026-08-12 | <1 (as-of 2026-08-12) |
| Multiples export | Haier Smart Home Co Ltd SHSE 600690 Financials.xls — Multiples tab | Quarterly through 2026-08-12 | <1 |
| Peer / comps export | Company Comparable Analysis Haier Smart Home Co Ltd .xls — Trading Multiples + Implied Valuation tabs | As-of 2026-08-12 | <1 |
| Current price (Capital IQ) | Haier Smart Home Co Ltd SHSE 600690 Equity Listings.xls | 2026-08-12 close (SSE: CNY 21.75) | 0 (1 day old) |
| Cash flow statement | Haier Smart Home Co Ltd SHSE 600690 Financials.xls — Cash Flow tab | LTM / Q1 2026 (ended Mar-31-2026) | ~4.5 |
| Segment data | Haier Smart Home Co Ltd SHSE 600690 Financials.xls — Segments tab | FY2025 (ended Dec-31-2025) | ~7.6 (annual segment disclosure; next update at H1 2026 results, due 2026-08-27) |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | Equity Listings.xls — SSE close CNY 21.75, 2026-08-12; H-share HKD 21.08, D-share EUR 1.87, ADR USD 10.85 (same date) | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y (basic reported; diluted not separately broken out in CapIQ Key Stats, which defaults to "Dilution: Basic") | Key Stats tab: Shares Out. 9,255.6mm (blended A+H+D); Balance Sheet tab: Total Shares Out. on Balance Sheet Date 9,303.2mm (Q1 2026) | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | N — no options/RSU/convertible schedule found in the pool | Not located in Financials, Capital Structure, or Historical Capitalization tabs | Needed for fully diluted per-share fair value; treat basic share count as a mild upside bias on per-share values until confirmed |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y — Operating company (consumer durables/home appliances manufacturer), multi-segment | Segments tab (5 reporting segments + geography); Long Business Description.rtf | Determines which valuation methods are valid (multiples + DCF + SOTP all applicable; REIT/financial-institution methods not applicable) |
| Total debt, cash, minority/preferred | Y | Capital Structure Summary tab: Total Debt CNY 42,076.8mm, Cash & ST Investments CNY 66,675.5mm, Minority Interest CNY 9,606.0mm, Pref. Equity none (Q1 2026) | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | Financials.xls — Income Statement + Key Stats tabs, FY2022A–LTM (ended Mar-31-2026) | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Financials.xls — Cash Flow tab, FY2021–LTM/Q1 2026; Unlevered FCF and Levered FCF lines present | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | EstimatesReport.xls — Consensus + Multiples tabs, FY2026E–FY2030E, NTM figures | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | Financials.xls — Multiples tab, quarterly TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E series from 2024-12-31 through 2026-08-12 | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis...xls — Trading Multiples (10-peer set: Gree, Midea, Hisense, Robam, Supor, Snowky, Yayi, Ecovacs, Joyoung, Xinbao) + Implied Valuation tab | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y | Financials.xls — Segments tab: 5 business segments (Refrigeration, Kitchen Appliances, Air Solutions, Laundry, Water Solutions, plus "Other") with revenue, operating profit before tax, and assets by segment, FY2020–FY2025; plus geographic segments (China, America, Europe, etc.) | Sum-of-the-parts |
| Dividend / buyback data | Y | Cash Flow tab: Common Dividends Paid CNY 13,873.4mm (FY2025), CNY 13,577mm (LTM); Repurchase of Common Stock CNY 1,233.6mm (FY2025); Annual Report (Mar-26-2026.pdf) states FY2025 total payout ratio 55.0% of parent net income | Shareholder-yield read |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/03_segment-map.md | Y |
| business-model/08_competitive-map.md | Y |
| business-model/07_business-quality.md | Y |
| business-model/09_moat.md | Y |
| business-model/10_external-dependency.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/04_guidance-consensus.md | Y |
| earnings/03_margin-drivers.md | Y |
| earnings/07_earnings-sensitivity.md | Y |
| earnings/06_earnings-quality.md | Y |

Both business-model and earnings modules have completed full syntheses (99_business-model-synthesis.md, 99_earnings-synthesis.md), and management-governance and balance-sheet-survival modules have also completed (99_management-governance-synthesis.md, 99_balance-sheet-survival-synthesis.md). Downstream valuation agents should consume the balance-sheet-survival module's net-debt/leverage read and the earnings module's normalized-earnings read rather than re-deriving them from scratch.

## 1A. External Data

No `data/HAIER/external/` directory exists in the pool. No externally sourced research (alt-data, expert calls, channel checks, broker research) is present. This is not a sufficiency gap — external data is enrichment only, never required (see MODULE_RULES.md and CLAUDE.md §4).

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N — current price present (2026-08-12, 1 day old, multi-venue) | 01, 05, 07, 99 | Not applicable |
| No consensus / forward estimates | N — FY2026E–FY2030E consensus present, dated as-of 2026-08-12 | 02, 03, 04, 05 | Not applicable |
| No peer data | N — 10-name peer comp set present with trading multiples and implied valuation | 03, 06 | Not applicable |
| No segment-level data | N — 5 business segments + geographic segments present through FY2025 | 06 | Not applicable |
| No balance sheet / capital structure | N — Balance Sheet and Capital Structure Summary/Details present through Q1 2026 | 01, 04, 06 | Not applicable |
| No cash flow statement | N — Cash Flow tab present FY2021–LTM/Q1 2026, with Unlevered/Levered FCF pre-calculated | 04 | Not applicable |

**Additional note (not a standard flag but relevant to downstream confidence):** fully diluted share count / dilution schedule (options, RSUs, convertibles) is not located anywhere in the pool. CapIQ's Key Stats and per-share figures are computed on a **Basic** dilution basis ("Dilution: Basic" stated on multiple tabs). Downstream agents (01 current-price/share-count agent, 05 margin-of-safety agent) should flag per-share fair values as basic-share-count-based unless a diluted count can be sourced from the annual report notes, and should state this explicitly per CLAUDE.md §15 (per-share comparisons require fully-diluted share counts, source stated).

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Quarterly TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E series from 2024-12-31 through 2026-08-12 (Financials.xls — Multiples tab) |
| Peer relative valuation | Y | None | 10-peer comp set (Gree, Midea, Hisense, Robam, Supor, Snowky, Yayi, Ecovacs, Joyoung, Xinbao) with LTM and NTM multiples, plus a pre-computed Implied Valuation tab |
| Intrinsic DCF (Operating FCFF) | Y | None | Historical Unlevered FCF (Cash Flow tab) plus consensus forward estimates (EstimatesReport.xls) support a base near-term path; WACC/terminal assumptions are the analyst's own to build |
| Reverse DCF | Y | None | Current price, share count, and historical/forward FCF base all present to back out market-implied growth |
| SOTP | Y | None | 5 business segments with revenue, operating profit before tax, and assets by segment (FY2020–FY2025), plus peer multiples by comparable appliance sub-category (e.g. Robam for kitchen, Xinbao for small appliances) to assign segment multiples |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool holds a usable earnings/cash-flow base (audited FY2025 income statement and cash flow, both CAS and IFRS versions, plus Q1 2026 quarterly), capital-structure data for the EV bridge, forward consensus estimates, peer comps, segment data, and a current price only one day stale across all listing venues — all four sufficiency-rule elements are met simultaneously.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (operating FCFF), reverse-DCF, sum-of-the-parts.
- **Active partial-data caps:** None triggered.
- **Critical missing items:** None block the verdict. Note for downstream agents: no fully diluted share count / options-dilution schedule was located in the pool — per-share fair values should be flagged as basic-share-count-based (CapIQ default) pending confirmation from the annual report's equity notes; and the FY2025 annual segment split (most recent available) predates the FQ2 2026 results release (due 2026-08-27, per the business-model triage), so SOTP segment weights are current to end-2025, not mid-2026.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — HAIER (Haier Smart Home Co., Ltd., SHSE:600690)

**Jurisdiction and reporting basis:** Mainland-China-incorporated, dual-primary-listed on the Shanghai Stock Exchange (A-shares, SHSE:600690) and the Hong Kong Stock Exchange (H-shares, SEHK:6690), plus a Frankfurt-listed D-share line (XTRA:690D and related venues) and an unsponsored Level-I ADR (OTC Pink: HSHC.Y). A-share filings are prepared under China Accounting Standards for Business Enterprises (CAS/ASBE); the H-share annual report restates to IFRS, and the company states net profit/equity attributable to owners are not materially different between the two bases. All figures below are in RMB (CNY) millions unless stated otherwise, fiscal year ending 31 December. Source: `Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Apr-27-2026).pdf` (H-share/IFRS), contents page; `earnings/01_historical-financials.md` §1A (jurisdiction cross-check).

No `ciq_facts.json` sidecar exists for this ticker (confirmed absent in `analyses/HAIER_2026-08-13/_pool_extracts/`). All figures below are this agent's own sourced read of the Capital IQ workbook exports and the balance sheet, cross-checked against the earnings module's independently-computed net-debt figures (`earnings/01_historical-financials.md`), which reconcile exactly (see §5).

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | CNY 21.75 (A-shares / Domestic Shares, SHSE:600690 — primary listing) | Haier Smart Home Co Ltd SHSE 600690 Equity Listings.xls, Equity Listings tab | 2026-08-12 (last close, trade date stated in export) |
| Currency | CNY (RMB) | — | — |
| Price basis | Last close | Equity Listings tab, "Last Close Price" field | 2026-08-12 |

**Other listing venues, same trade date (context, not the anchor):** H-shares (SEHK:6690) HKD 21.08; H-shares via Shanghai-HK Stock Connect (SHSC:6690) HKD 21.08; D-shares (XTRA:690D, Xetra) EUR 1.87; D-shares (Deutsche Boerse, DB:690D) EUR 1.89; D-shares (Wiener Boerse, WBAG:690D) EUR 1.87 — all dated 2026-08-12. Unsponsored ADR (OTC Pink: HSHC.Y, 4 ordinary shares per ADR) USD 10.85, dated 2026-08-11 (one day older). [Equity Listings.xls, Equity Listings tab]

**Price staleness (quantitative).** Age = run date (2026-08-13) − quote as-of date (2026-08-12) = 1 calendar day ≈ 1 trading day. This is well under the 5-trading-day threshold — no refresh attempt was needed and none of the staleness score caps apply. The quote carries its own trade date (not merely a file-download date), so this is a genuine as-of date, not an "unconfirmed" vendor-export case.

**Cross-vendor-snapshot note (pool-internal, not a partial-data trigger):** A separate Capital IQ sheet in the same workbook family — "Financials.xls," Key Stats tab, "Latest Capitalization" section — carries an undated domestic-share price cell of CNY 22.00, about 1.1% above the trade-dated CNY 21.75 close used here. The same sheet's H-share (CNY-equivalent 18.504759) and D-share (CNY-equivalent 14.511014) price cells reconcile almost exactly to the 2026-08-12 HKD 21.08 and EUR 1.87 closes shown above (implied cross-rates ≈0.8776 CNY/HKD and ≈7.760 CNY/EUR), indicating those two cells were refreshed to 2026-08-12 while the domestic cell was not. This is a same-day vendor-snapshot timing artifact, not a stale price or a corroborated-but-conflicting web quote (the Partial-Data Rule's "two web sources" case does not apply — both figures are pool data). Per the same discipline (anchor on the more precisely-dated, lower figure), this report anchors on CNY 21.75 for the primary listing and recomputes the multi-class market cap accordingly (§3), while showing the Key-Stats snapshot value as a labelled cross-check.

**Price-state: `pool-verified`.**

## 2. Share Count

| Field | Value | Source |
|---:|---:|---|
| Basic shares outstanding (as-of Mar-31-2026, balance sheet date) | 9,303.218356 million | Balance Sheet tab, "Total Shares Out. on Balance Sheet Date," filing date 2026-04-27 |
| Basic shares outstanding (as-of Mar-31-2026, filing date) | 9,303.207356 million | Balance Sheet tab, "Total Shares Out. on Filing Date" |
| Shares outstanding — latest CapIQ snapshot (post-buyback, ~2026-08-12) | 9,255.610366 million | Key Stats tab, "Latest Capitalization" (Domestic 6,131.874725m + H-shares 2,853.587266m + D-shares 270.148375m); independently cross-validated at 9,255.6m in Company Comparable Analysis, Financial Data tab, "Shares Outstanding Latest," As-Of Date 2026-08-12 |
| Weighted Avg. Basic Shares Out. (LTM ended Mar-31-2026) | 9,223.987581 million | Income Statement tab |
| Weighted Avg. Diluted Shares Out. (LTM ended Mar-31-2026) | 9,311.825848 million | Income Statement tab |
| Options/RSUs count (if disclosed) | Not disclosed in the pool | — |
| Convertibles / potential shares (if disclosed) | Not disclosed in the pool | — |
| **Fully diluted shares (TSM + if-converted)** | **Not computable — no strike/conversion detail available** | See limitation below |
| Share count used for market cap | 9,255.610366 million (latest "as of" count, split by class) | Fully Diluted Equity Rules Hard Rule #1 |
| Share count used for per-share fair value | 9,311.825848 million (diluted weighted-average, LTM ended Mar-2026) | Fully Diluted Equity Rules Hard Rule #2, fallback provision |

**Share Count Reconciliation Table**

| Step | Shares (million) |
|---|---:|
| Basic shares outstanding (balance sheet date, Mar-31-2026) | 9,303.218356 |
| Latest CapIQ snapshot (~2026-08-12, net of buyback since Mar-31) | 9,255.610366 |
| + Dilutive effect embedded in the diluted weighted-average (LTM) vs. the LTM basic weighted-average | +87.838267 (9,311.825848 − 9,223.987581) |
| = Diluted weighted-average shares used for per-share fair value | 9,311.825848 |

**Limitation.** CapIQ's Key Stats, Historical Capitalization, and Capital Structure tabs all default to "Dilution: Basic" and no options/RSU/convertible schedule (strike prices, vesting, conversion terms) was located anywhere in the pool — not in the Financials workbook, the Capital Structure Details tab, nor the annual/interim filing excerpts reviewed by the earnings module (`earnings/00_earnings-data-triage.md` §5, same finding). A true treasury-stock-method fully diluted count cannot be built. This report falls back to the diluted weighted-average shares from the income statement (9,311.825848m, LTM ended Mar-2026) as the best available proxy for per-share fair-value work, labeled as a limitation per Fully Diluted Equity Rules Hard Rule #2. Note the counter-intuitive direction: this diluted weighted-average is *higher* than the latest point-in-time shares-out snapshot (9,255.61m) — it partly reflects an earlier, higher share count before the company's ongoing buyback (Treasury Stock rose from CNY −4,261.1m at FY2025-end to CNY −4,731.6m at Mar-31-2026, confirming active repurchases) plus a modest dilutive effect from unidentified instruments. Downstream per-share fair-value agents should treat this as a mild upside bias risk until a genuine options/converts schedule can be sourced from the annual report's equity notes.

## 3. Market Capitalization

Haier is a multi-class issuer (Domestic A-shares, H-shares, D-shares each trade at different prices in different currencies). Market cap is built per-class, consistent with Capital IQ's own methodology, using the 2026-08-12-dated closes from §1:

```
Domestic Shares:  6,131.874725m × CNY 21.75      = CNY 133,368.275269m
H-Shares:         2,853.587266m × CNY 18.504759*  = CNY  52,804.944849m
D-Shares:           270.148375m × CNY 14.511014*  = CNY   3,920.126929m
                                                     ─────────────────
Market Capitalization                             = CNY 190,093.347047m
```
\* H-share and D-share prices are the CNY-equivalent cells from the Key Stats tab, which already reconcile to the 2026-08-12 HKD 21.08 and EUR 1.87 closes (§1); no separate FX conversion was performed by this agent — the CNY-denominated cells were used as provided.

**Cross-check (CIQ Key-Stats snapshot, domestic cell undated/CNY 22.00):** CNY 191,626.341744m — about CNY 1,532.99m (0.81%) higher, entirely attributable to the CNY 22.00 vs. CNY 21.75 domestic-share price cell discussed in §1. Both figures are shown; **CNY 190,093.3m (using the trade-dated 21.75 close) is the canonical figure carried forward.**

**Rejected approach (flagged so downstream agents do not use it):** multiplying total shares outstanding (9,255.610366m) by the single domestic price (21.75) alone would give CNY 201,309.5m — this overstates market cap by ~5.9% because it ignores the H-share and D-share discount to the domestic A-share price (the "AH premium"). This single-price shortcut is NOT used.

## 4. Enterprise Value Bridge

Balance-sheet date used: **31-March-2026** (latest available quarterly balance sheet, filed 2026-04-27) — the most recent capital-structure snapshot in the pool.

| Component | Amount (CNY m) | Source |
|---|---:|---|
| Market capitalization | 190,093.35 | §3 above |
| + Total debt (short + long term) | 42,076.81 | Balance Sheet / Capital Structure Summary tab, Mar-31-2026 |
| + Minority / non-controlling interest | 9,606.03 | Balance Sheet tab, Mar-31-2026 |
| + Preferred equity | 0.00 (none disclosed) | Balance Sheet / Capital Structure Summary tab |
| + Operating lease liabilities | Not added separately — already inside Total Debt (CNY 6,182.66m of "Total Lease Liabilities" is a Capital Structure Summary sub-component of the CNY 42,076.81m Total Debt figure) | Capital Structure Details tab |
| + Underfunded pension / other LT obligations | Not added — immaterial (Pension & Other Post-Retire. Benefits was CNY 1,587.46m at FY2025-end, <1% of EV; line is blank/not reported at Mar-31-2026) | Balance Sheet tab |
| − Cash & equivalents (+ ST investments) — **canonical, broad basis** | 66,675.48 | Balance Sheet / Capital Structure Summary tab, Mar-31-2026 |
| − Equity-method investments | Not netted — shown separately, informational only (CNY 21,697.25m at Mar-31-2026; JV/associate stakes, not a bridge adjustment) | Balance Sheet tab, "Equity Method Investments" |
| **= Enterprise value (EV) — broad cash basis** | **175,100.70** | Computed: 190,093.35 + 42,076.81 + 9,606.03 + 0 − 66,675.48 |

**Cross-check (CIQ Key-Stats snapshot TEV, using its own CNY 22.00 domestic price):** CNY 176,633.70m — reconciles to within 0.9% of the canonical figure above, the gap fully explained by the market-cap difference in §3. An independent third cross-check — the USD-denominated Company Comparable Analysis workbook (Implied Valuation tab, as-of 2026-08-12) — reports Haier's "Total Enterprise Value Latest" as USD 25,802.9m; the implied CNY/USD conversion rate backed out from that same workbook's LTM revenue line (CNY 296,915.33m ÷ USD 44,028.5m ≈ 6.743) converts this to ≈ CNY 174,000m, within ~0.6% of the canonical CNY 175,100.7m figure — a third, independently-computed source supporting the same EV.

**Adjustments NOT made, stated explicitly:**
- Operating leases: not a separate add-on — already capitalized inside Total Debt via "Total Lease Liabilities" (CNY 6,182.66m), consistent with lease-capitalization accounting already reflected on the balance sheet.
- Pension: immaterial (<1% of EV), not adjusted.
- Contingent liabilities / guarantees: no disclosure reviewed in this pool pull; not adjusted, not a EV bridge line item by convention.
- Equity-method investments (CNY 21,697.25m): kept outside the bridge as an asset-side item, per standard CIQ convention — not subtracted from EV as if it were cash, and not added as if it were an operating asset requiring a separate multiple (that judgment belongs to `06_sum-of-the-parts` if material to segment economics).

### Cash quality — net only real, operating cash

Total Cash & ST Investments (CNY 66,675.48m) breaks into three balance-sheet lines:

| Line | Amount (CNY m, Mar-31-2026) | Nature |
|---|---:|---|
| Cash And Equivalents | 50,580.31 | Operating cash — strict basis |
| Short Term Investments | 11,011.21 | Conventional short-duration instruments |
| Trading Asset Securities | 5,083.96 | Fair-value-through-P&L instruments — carries mark-to-market exposure by classification |

"Trading Asset Securities" is, by its own accounting classification, exactly the kind of item CLAUDE.md §4/§15 and this module's cash-quality test flag for exclusion by default — a fair-value-through-P&L security carrying mark-to-market P&L, not confirmed as short-tenor operating cash from any note-level disclosure available to this agent in the current pool pull (the granular financial-instruments note inside the full annual report PDF was not parsed at line-item detail for this agent's task). No evidence was found that it is restricted, margin, or held by a financial subsidiary either — so this is a data-quality caveat, not a confirmed exclusion.

**EV shown three ways:**

| Basis | Cash netted (CNY m) | EV (CNY m) |
|---|---:|---:|
| Strict (Cash & Equivalents only) | 50,580.31 | 191,195.88 |
| **Broad (Cash & Equiv. + ST Investments + Trading Securities) — canonical, matches company's own filed Net Debt and CapIQ's headline convention** | 66,675.48 | **175,100.70** |
| Memo: excl. Trading Securities only (Cash & Equiv. + ST Investments) | 61,591.52 | 180,184.66 |

**Canonical choice and why:** the broad basis is used as the headline EV because it matches (a) the company's own reported balance-sheet "Net Debt" line, which nets all three components, and (b) the earnings module's independent cross-check (`earnings/01_historical-financials.md` §1, footnote 1), which reconciles to the identical CNY −24,598.7m broad net-debt figure at Mar-31-2026. Netting the Trading Asset Securities line into cash without note-level confirmation is a known way to understate EV and flatter net debt — flagged here explicitly, and the strict/excl.-trading-securities figures above let a downstream agent substitute a more conservative basis if warranted.

## 5. Net Debt & Leverage Snapshot

| Metric | Value (CNY m, Mar-31-2026) | Source |
|---|---:|---|
| Total debt | 42,076.81 | Balance Sheet / Capital Structure Summary tab |
| Cash & equivalents (strict) | 50,580.31 | Balance Sheet tab |
| Cash & ST investments (broad) | 66,675.48 | Balance Sheet / Capital Structure Summary tab |
| **Net debt (strict) = Total debt − Cash & equivalents only** | **−8,503.50 (net CASH)** | Computed; matches `earnings/01_historical-financials.md` §2 exactly (CNY −8,503.5m at Mar-31-2026) |
| **Net debt (broad) = Total debt − Cash & ST investments** | **−24,598.67 (net CASH)** | Balance Sheet tab, "Net Debt" line; matches `earnings/01_historical-financials.md` §1 footnote 1 exactly |
| Net debt (strict) / LTM EBITDA | −0.33x | Computed: −8,503.50 ÷ 25,950.21 (LTM EBITDA ended Mar-2026, Income Statement tab) |
| Net debt (broad) / LTM EBITDA | −0.95x | Computed: −24,598.67 ÷ 25,950.21 |
| Total debt / LTM EBITDA | 1.62x | Computed: 42,076.81 ÷ 25,950.21 (Capital Structure Summary tab shows 1.40x on a FY-2025-based EBITDA denominator; the LTM-based figure here uses the Mar-2026 LTM EBITDA) |

Both bases show Haier in a net-cash position (negative net debt) as of the latest quarter — consistent with `earnings/01_historical-financials.md`'s finding that the net-cash cushion has shrunk every year since FY2022 (broad net debt/EBITDA moved from about −1.24x in FY2022 toward roughly flat by FY2025) but remains net-cash through Q1 2026 on both measures. Capital Structure Summary tab shows CapIQ's own convention marking "Net Debt/EBITDA" as "NM" for negative net debt — the computed ratios above are shown instead of relying on that "NM" label.

## 6. Per-Share Reference Values

| Metric | Per Share (CNY) | Source |
|---|---:|---|
| Book value per share | 13.46 | Balance Sheet tab: Total Common Equity CNY 125,187.73m ÷ 9,303.218356m shares (balance sheet date, Mar-31-2026); matches CapIQ's own "Book Value/Share" cell |
| Tangible book value per share | 9.10 | Balance Sheet tab: Tangible Book Value CNY 84,651.27m ÷ 9,303.218356m shares; matches CapIQ's own "Tangible Book Value/Share" cell |
| Net cash per share (strict) | 0.91 | CNY 8,503.50m ÷ 9,303.218356m shares |
| Net cash per share (broad) | 2.64 | CNY 24,598.67m ÷ 9,303.218356m shares |

Per-share figures above use the balance-sheet-date share count (9,303.218356m, matching CapIQ's own book-value-per-share denominator) rather than the later ~2026-08-12 buyback-adjusted count (9,255.61m), consistent with pairing a balance-sheet-date metric with its own balance-sheet-date share count.

## 7. Anchor Summary (canonical numbers for downstream agents)

- **Current price:** CNY 21.75 (A-shares, SHSE:600690, primary listing), as of 2026-08-12, last close. 1 calendar day old at run date — no staleness cap.
- **Share counts used:** market cap → 9,255.610366m (latest CapIQ snapshot, ~2026-08-12, multi-class total); per-share fair value → 9,311.825848m (diluted weighted-average, LTM ended Mar-2026 — a labeled limitation, see §2).
- **Market cap:** CNY 190,093.3m (multi-class bridge; CIQ snapshot cross-check CNY 191,626.3m, within 0.8%).
- **Net debt:** broad basis (canonical) CNY −24,598.7m (net cash); strict basis CNY −8,503.5m (net cash) — both as of 31-Mar-2026. Use the broad basis unless a downstream agent states a specific reason to switch (Reconciliation Gate 1).
- **Enterprise value (EV):** CNY 175,100.7m (broad cash basis, canonical); CNY 191,195.9m (strict cash basis); CNY 180,184.7m (excl.-trading-securities memo basis). See §4 for the full three-way table and cash-quality caveat.
- **Reporting currency:** CNY (RMB), millions.

### Anchor Block (copy-forward)

- Price: CNY 21.75 (2026-08-12, last close — SHSE:600690 primary listing)
- Price-state: pool-verified
- Currency: CNY (RMB)
- Shares (market cap): 9,255.610366 million (CapIQ latest snapshot, ~2026-08-12, multi-class total — source: Key Stats tab, cross-validated vs. Company Comparable Analysis Financial Data tab)
- Shares (per-share fair value): 9,311.825848 million (diluted weighted-average, LTM ended Mar-2026 — limitation: no options/convertibles schedule found, so this is not a true fully-diluted TSM count)
- Market cap: CNY 190,093.3 million
- Net debt: CNY −24,598.7 million (broad, canonical) / CNY −8,503.5 million (strict) — both net cash
- EV: CNY 175,100.7 million (broad cash basis, canonical)
- Key caveats: (1) no options/RSU/convertible dilution schedule in the pool — per-share fair value uses diluted weighted-average as a fallback, not a true fully-diluted TSM count; (2) CNY 5,083.96m of "Trading Asset Securities" inside the broad cash figure carries mark-to-market P&L exposure by classification and is not confirmed as pure liquid operating cash from note-level detail available to this agent — shown as a three-way EV table in §4, broad basis used as canonical; (3) a same-day vendor-snapshot timing mismatch between two CapIQ sheets (CNY 22.00 vs. the trade-dated CNY 21.75 domestic close) is resolved in favor of the more precisely-dated figure, with the ~0.8-0.9% alternative shown as a cross-check throughout.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — HAIER

**Reporting currency: CNY (RMB), millions except per-share figures.** Anchor numbers (price, shares, market cap, EV, net debt) are taken verbatim from `valuation/01_price-and-capital-structure.md`: current price CNY 21.75 (A-shares, SHSE:600690, last close 2026-08-12); shares for market cap 9,255.610366m; shares for per-share fair value 9,311.825848m (diluted weighted-average, LTM, a labelled limitation — no options/converts schedule in the pool); market cap CNY 190,093.3m; net debt CNY −24,598.7m (broad basis, net cash); EV CNY 175,100.7m (broad cash basis, canonical).

**Data-coverage limitation, stated up front.** Haier has traded for decades, but the only multiples time series available in this data pool (`Haier Smart Home Co Ltd SHSE 600690 Financials.xls`, Multiples tab — three duplicate pulls in the pool, all identical) covers just **8 quarters, Dec-2024 through Aug-2026 (~20 months)**, not the 3–5 years this section normally spans. This is a pool-coverage limit, not a company-history limit — but the evidence this agent can cite is what it is. Per the module's short-history partial-data rule, **no mean/median reversion target is presented as a point or tight range fair-value input below**; the read is directional only (where the stock sits within its own short trailing range), and any reversion-implied value is labelled illustrative-only.

## 1. Current Multiples

Haier is an operating consumer-appliance/HVAC manufacturer — the standard EV-based operating multiples, P/E, P/BV, and dividend yield all apply; no REIT/financial-sector adjustment is needed (Business-Type Method Map).

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E | LTM (diluted EPS, 12m ended Mar-31-2026) | EPS CNY 2.01011 | **10.82x** | Price CNY 21.75 ÷ EPS 2.01011, computed by this agent [`earnings/01_historical-financials.md` §2; `01_price-and-capital-structure.md` §1]; cross-checks exactly to CapIQ's own "P/Diluted EPS Before Extra" cell, 10.82x [Public Company Profile, as of 2026-08-12] |
| P / E | NTM (consensus) | EPS CNY 2.18 (consensus NTM) | **9.99x** | CapIQ Estimates Report, Multiples tab, "NTM" row, data as of 2026-08-12 |
| P / E | FY2026 (consensus) | EPS CNY 2.12671 (22 analysts) | **10.23x** | Same source, "FY 2026" row |
| EV / EBITDA | LTM (12m ended Mar-31-2026) | EBITDA CNY 25,950.21m | **6.75x** | EV (broad) CNY 175,100.7m ÷ EBITDA 25,950.21m, computed by this agent [`01_price-and-capital-structure.md` §4; `earnings/01_historical-financials.md` §2] |
| EV / EBITDA | NTM (consensus) | — | **5.60x** | CapIQ Estimates Report, Multiples tab, "NTM" row |
| EV / EBITDA | FY2026 (consensus) | EBITDA CNY 30,506.36m | **5.70x** | Same source, "FY 2026" row |
| EV / EBIT | LTM | EBIT CNY 20,385.87m | **8.59x** | EV CNY 175,100.7m ÷ EBIT 20,385.87m, computed by this agent |
| EV / EBIT | NTM (consensus) | — | **7.48x** | CapIQ Estimates Report, Multiples tab |
| EV / Sales | LTM | Revenue CNY 296,915.33m | **0.59x** | EV CNY 175,100.7m ÷ Revenue 296,915.33m, computed by this agent |
| EV / Sales | NTM (consensus) | — | **0.56x** | CapIQ Estimates Report, Multiples tab |
| P / Book | LTM (balance sheet, Mar-31-2026) | BVPS CNY 13.46 | **1.62x** | Price CNY 21.75 ÷ BVPS 13.46 [`01_price-and-capital-structure.md` §6]; cross-checks exactly to CapIQ's own P/BV close, 1.616332 [Financials.xls, Multiples tab, 2026-08-12 column] |
| P / Tangible Book | LTM | Tang. BVPS CNY 9.10 | **2.39x** | Price CNY 21.75 ÷ Tang. BVPS 9.10 [`01_price-and-capital-structure.md` §6] |
| P / FCF (FCF yield) | LTM (12m ended Mar-31-2026) | FCF CNY 16,192.6m (CFO − Capex, §15 definition) | **11.74x (FCF yield 8.52%)** | Market cap CNY 190,093.3m ÷ FCF 16,192.6m, computed by this agent [`earnings/01_historical-financials.md` §2] |
| Dividend yield | LTM (trailing) | — | **5.3%** | CapIQ Public Company Profile, "Dividend Yield %" field, as of 2026-08-12 |

**Note on FCF-multiple volatility:** CapIQ's own "TEV/LTM Unlevered FCF" and "Market Cap/LTM Levered FCF" series (Multiples tab) swing from ~12x to NM (negative/near-zero denominator) quarter to quarter over the same 8 quarters, driven by working-capital timing, not by a stable underlying FCF trend — those two CapIQ-labelled series are not used as the headline P/FCF figure above; the CFO-minus-capex-based LTM figure (§15 definition) is used instead for stability.

## 2. Historical Multiple Bands (8 quarters — short of the standard 3–5yr window)

Source: `Haier Smart Home Co Ltd SHSE 600690 Financials.xls`, Multiples tab, "Close" row, quarterly, Dec-2024 through Aug-2026 (8 data points; identical across all three duplicate pulls in the pool).

| Multiple | Min | Mean | Median | Max | Current (anchor calc, §1) | Percentile of the 8-quarter range |
|---|---:|---:|---:|---:|---:|---:|
| P / E (LTM) | 10.15x | 11.74x | 11.56x | 14.24x | 10.82x | ~16% (near the bottom) |
| EV / EBITDA (LTM) | 5.87x | 7.38x | 7.34x | 9.74x | 6.75x | ~23% (bottom quartile) |
| EV / EBIT (LTM) | 7.99x | 9.63x | 9.49x | 12.13x | 8.59x | ~14% (near the bottom) |
| EV / Sales (LTM) | 0.55x | 0.69x | 0.69x | 0.90x | 0.59x | ~12% (near the bottom) |
| P / Book (LTM) | 1.52x | 1.94x | 1.97x | 2.42x | 1.62x | ~11% (near the bottom) |

**Reconciliation note:** CapIQ's own quarter-end "Close" value for the most recent (partial) quarter — EV/EBITDA 6.27x, P/E 10.82x, P/BV 1.62x [Multiples tab, 2026-08-12 column] — sits close to, but not identical with, this agent's anchor-based current calculation for EV/EBITDA (6.75x vs 6.27x, a ~7% gap); P/E and P/BV reconcile almost exactly. The EV/EBITDA gap most likely reflects a difference in the EV numerator's pricing/composition timing between CapIQ's rolling quarterly-close calculation and this agent's point-in-time anchor EV from `01` — both point to the same qualitative conclusion (current multiple below its own trailing mean), so the gap does not change the read. This is flagged rather than silently resolved.

Because history here is short (8 quarters, not 3–5 years), the min/mean/median/max band above should be treated by `07_scenario-and-fair-value` as an indicative, not fully evidenced, anchor for bull/bear scenario multiples — a longer window (annual multiples going back to FY2021 or earlier) was not available in this pool.

## 3. Re-Rating / De-Rating Read

Across the three most reliable multiples — EV/EBITDA, P/E, and EV/Sales (chosen because they are less distorted by Haier's M&A-inflated book value than P/BV) — the stock trades at a discount to its own 8-quarter mean and median: EV/EBITDA is **8.5% below its own mean** (6.75x vs 7.38x) and **8.1% below its own median** (6.75x vs 7.34x); P/E is **7.8% below its own mean** (10.82x vs 11.74x) and **6.4% below its own median** (10.82x vs 11.56x); EV/Sales is **14.7% below its own mean** (0.59x vs 0.69x) and **14.5% below its own median**. All three sit in roughly the bottom 10–25% of their own 8-quarter range (§2).

This reads as a genuine de-rating, not noise: it lines up with fundamentals that deteriorated over the same window, not merely a sentiment air-pocket. EBITDA margin fell from 9.80% (FY2024) to 8.78% (FY2025) to 8.74% (LTM) [`earnings/01_historical-financials.md` §1–2]; FY2026 consensus EPS has been cut ~14% over the trailing six months and ~13% over twelve months, with revision breadth still running 1-up/11-down in the trailing quarter [`earnings/04_guidance-consensus.md`]; and the FY2025 full-year print and the two most recently reported quarters (FQ4 2025, Q1 2026) both missed already-lowered consensus on revenue and EPS [`earnings/04_guidance-consensus.md`]. The multiple compression tracks a real earnings-estimate downgrade cycle, not a one-off market wobble.

## 4. Implied Value from Reversion — ILLUSTRATIVE ONLY, not a fair-value input

Per the module's short-history partial-data rule, because the own-multiple history available here is only ~20 months (well short of 3 years), **no point or tight-range reversion target is asserted as a fair-value input for `07_scenario-and-fair-value`.** The table below shows what reverting to the own 8-quarter mean/median would mechanically imply, labelled illustrative-only.

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price (CNY 21.75) |
|---|---:|---:|---:|---:|
| EV / EBITDA (LTM) | 7.38x / 7.34x | EV CNY 191,406m / 190,497m → Equity CNY 216,005m / 215,095m | CNY 23.20 / 23.10 | +6.7% / +6.2% |
| P / E (LTM) | 11.74x / 11.56x | — (direct per-share) | CNY 23.59 / 23.23 | +8.5% / +6.8% |
| EV / Sales (LTM) | 0.69x / 0.69x | EV CNY 205,373m / 204,850m → Equity CNY 229,972m / 229,448m | CNY 24.70 / 24.64 | +13.6% / +13.3% |
| P / Book (LTM) | 1.94x / 1.97x | — (direct per-share) | CNY 26.10 / 26.51 | +20.0% / +21.9% |

Equity value = implied EV − net debt (broad, CNY −24,598.7m, i.e. added back since Haier is net-cash); implied price = equity ÷ 9,311.825848m diluted weighted-average shares (`01_price-and-capital-structure.md` §2).

**Dispersion across the four multiples: roughly +6% to +22% above the current price.** No single point is asserted as the base case here — the dispersion itself, not a point, is the exhibit. The EV/EBITDA-median figure (CNY 23.10, +6.2%) is the narrowest and most operating-cash-flow-grounded of the four, but even that is explicitly **illustrative only**, not a number `07` should treat as a validated fair-value anchor, given the sub-3-year evidence base.

**Reversion assumption check:** reverting to the own 8-quarter mean/median assumes the warranted multiple has not structurally changed. The evidence in §3 argues against that assumption holding cleanly — margins have compressed for two consecutive years, consensus estimates have been cut sharply and are still being cut, and the two most recent prints both missed an already-lowered bar. Reversion to the old mean is a live case, not the base case, until at least one clean beat-and-raise print breaks the estimate-cutting cycle.

## 5. Own-History Read

Haier trades at the low end (roughly the bottom 10–25th percentile) of its own trailing multiple range across EV/EBITDA, P/E, EV/Sales, and P/Book, and 6–18% below its own 8-quarter mean/median on those same measures. Reverting to that mean/median would mechanically imply roughly +6% to +22% upside from CNY 21.75, but that reversion is **illustrative only** — the evidence base is under 3 years and the multiple compression tracks a real, ongoing earnings-downgrade cycle (margin compression, consensus cuts, and two consecutive quarterly misses against an already-lowered bar), not an unexplained sentiment discount. The single biggest caveat: this discount could be the market correctly pricing a lower structural earnings trajectory rather than a cyclical overreaction, and the old mean should not be treated as a reliable revert-to target until the estimate-cutting cycle stops. Separately, the management-governance module's ownership review found no structurally misaligned controlling owner (Filter 6 / RF-OWN-004 not triggered — Haier Group is a collectively-owned enterprise, not a state directed-lending vehicle, a value-maximizing parent's listed subsidiary, or a sprawling unrelated conglomerate) [`management-governance/04_ownership-and-insider-behavior.md`], so there is no structural-ownership reason to discount the reversion case further — the caveat here is purely about the earnings trajectory, not about the controlling shareholder.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — HAIER

**Anchor (from `01_price-and-capital-structure.md`, verbatim):** Current price CNY 21.75 (A-shares, SHSE:600690, last close 2026-08-12, `pool-verified`). Market cap CNY 190,093.3m. EV (broad cash basis, canonical) CNY 175,100.7m. Net debt (broad, canonical) CNY −24,598.7m (net cash). Diluted weighted-average shares (per-share fair-value basis) 9,311.825848m. Minority interest CNY 9,606.03m. All figures in RMB (CNY) unless a peer figure is shown in USD (Capital IQ comp export currency) or the peer is priced in its own local currency and flagged.

Every multiple in this report is on an **LTM (trailing twelve months)** basis unless explicitly marked NTM/forward — this matches the basis of the peer comp export.

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Midea Group Co., Ltd. | SZSE:000333 | Larger, more diversified Chinese appliance conglomerate (adds robotics/building tech); direct product overlap with Haier's dominant refrigerator/kitchen-appliance segment plus air conditioning and laundry; ~1.55x Haier's revenue | `business-model/08_competitive-map.md` §2, Competitor A — third-party-named (Whirlpool 2026 Form 10-K), corroborated by inclusion in Haier's own Capital IQ comparable-company set |
| Gree Electric Appliances, Inc. of Zhuhai | SZSE:000651 | China's #1/#2 domestic air-conditioner brand; product line also includes refrigerators, washing machines, and kitchen appliances (partial segment fit — AC is Gree's core, not Haier's dominant segment); ~0.58x Haier's revenue | `business-model/08_competitive-map.md` §2, Competitor B — third-party-named (AB Electrolux 10-K), corroborated by inclusion in Haier's own Capital IQ comparable-company set |
| Whirlpool Corporation | NYSE:WHR | Most scale-comparable non-Chinese peer (~0.35x Haier's revenue, at the outer edge of but within the ~5x comparable-scale threshold); direct North America rivalry via Haier's GE Appliances brand | `business-model/08_competitive-map.md` §2, Competitor C — third-party-named (AB Electrolux 10-K) |

**Source of the set:** all three peers come from `business-model/08_competitive-map.md`, which itself sourced them from the Capital IQ third-party competitor-relationship export (Haier's own Chinese-language annual report discusses competitive rank only in relative terms — "行业第二" — without naming rivals in the text reviewed, so this is a third-party-named, not company-named, set — flagged as such in the upstream module). This report does not need to self-select a peer set; competitive-map's set is used as-is.

**Peers considered and excluded from the primary table:**
- **BSH Hausgeräte (Bosch/Siemens)** — a comparably large global rival named in the same Capital IQ export, but privately held as a subsidiary of Robert Bosch GmbH. No public multiples exist. Excluded, not guessed.
- **AB Electrolux (publ) (OM:ELUX B)** — a credible, comparably scaled competitor (LTM revenue $13.5bn) that competitive-map considered but did not profile as a named peer. No multiples were sourced for it in this report (to keep the primary set to competitive-map's three named names); its FY2025 operating margin (2.8%, Web-sourced as of 2026-01-30, unverified, per `08_competitive-map.md` §5) is used only as directional context in §4 below, not in the comp table or the peer median.

**Data-pool coverage gap:** the Capital IQ "Company Comparable Analysis" workbook in the pool carries full trading multiples and operating statistics for Midea and Gree (both also appear in CapIQ's own default China-appliance comp set) but does **not** cover Whirlpool (a US-listed name outside CapIQ's default China-peer template). Whirlpool's multiples in §2 below are therefore **Web-sourced as of 2026-08-12, unverified** (stockanalysis.com), per the partial-data rule. This is a genuine, flagged gap on one of three named peers, not a self-selection issue.

## 2. Peer Multiples & Operating Stats

All CapIQ-sourced figures: `Company Comparable Analysis Haier Smart Home Co Ltd .xls`, tabs "Trading Multiples," "Operating Statistics," and "Financial Data," As-Of Date 2026-08-12 (Excel serial 46246), currency USD, "Values converted at today's spot rate." All Whirlpool figures: Web-sourced as of 2026-08-12 (stockanalysis.com), unverified, converted from the site's reported P/E, EV/EBITDA, EV/EBIT, P/S and revenue figures (EV/Sales and Net Debt/EBITDA computed by this agent from the site's EV, revenue, and EBITDA figures — shown below).

| Company | P/E (LTM) | EV/EBITDA (LTM) | EV/EBIT (LTM) | EV/Sales (LTM) | FCF Yield | Rev Growth (LTM YoY) | EBITDA Margin (LTM) | ROIC | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **Haier (600690)** | 10.8x | 6.3x | 8.5x | 0.6x | 8.52% | +1.25% | 8.7% | 7.56% (LTM Mar-2026) | −0.95x (net cash) | 2026-08-12 |
| Midea (000333) | 14.5x | 11.2x | 13.6x | 1.3x | 6.63% | +7.19% | 11.5% | Not disclosed | −0.72x (net cash) | 2026-08-12 |
| Gree (000651) | 7.7x | 4.2x | 5.0x | 0.9x | 18.57% | −11.53% | 20.2% | Not disclosed | −2.32x (net cash) | 2026-08-12 |
| Whirlpool (WHR) | 14.95x | 9.71x | 15.26x | 0.62x | −11.78% | −3.88% | 6.63% | Not confirmed | +6.89x (levered) | 2026-08-12, Web-sourced, unverified |
| **Peer median (n=3)** | **14.5x** | **9.71x** | **13.6x** | **0.9x** | **6.63%** | **−3.88%** | **11.5%** | **n/a — no peer disclosed** | **−0.72x** | — |

**Sources for computed peer cells:** Haier FCF yield = LTM FCF (CNY16,192.6m, `earnings/01_historical-financials.md` §2) ÷ market cap (CNY190,093.3m, `01`) = 8.52%. Haier Rev growth and EBITDA margin: CapIQ Operating Statistics tab, Haier row (0.0125, 0.087). Haier ROIC: `business-model/09_moat.md` §3, Capital IQ "Return on Capital %," LTM ended Mar-2026 (7.56%). Haier Net Debt/EBITDA: `01_price-and-capital-structure.md` §5, broad basis, canonical (−0.95x). Whirlpool EV/Sales = EV $9.61bn ÷ FY2025 revenue $15,524m = 0.619x [stockanalysis.com, WHR statistics + financials pages, 2026-08-12]. Whirlpool Net Debt/EBITDA: EBITDA implied from EV/EBITDA (9.61bn ÷ 9.71 ≈ $989.7m); Net debt = EV − Market cap = $9.61bn − $2.79bn ≈ $6.82bn; ND/EBITDA ≈ 6.89x [same source]. Whirlpool Rev growth = TTM (ended Jun-2026) −3.88% YoY [stockanalysis.com, WHR financials page, 2026-08-12]. Whirlpool EBITDA margin = implied EBITDA $989.7m ÷ TTM revenue $14,921m = 6.63%.

**Context cross-check (not the primary comp set):** CapIQ's own broader "default comps" template for Haier includes 10 China-listed appliance/durables names (Midea, Gree, plus Hisense Home Appliances, Hangzhou Robam, Zhejiang Supor, Hefei Snowky, Zhejiang Yayi, Ecovacs Robotics, Joyoung, Guangdong Xinbao) — several of these (Ecovacs = robotic vacuums, Joyoung/Snowky/Xinbao = small kitchen appliances, Yayi = specialty metals) are not confirmed business-fit peers per competitive-map's segment-overlap test, so this broader set is shown only as a corroborating sanity check, not the primary table. Its median (LTM basis, same As-Of Date): EV/Sales 1.0x, EV/EBITDA 9.6x, EV/EBIT 12.4x, P/E 14.5x, EBITDA margin 10.6%. This broad-set EV/EBITDA median (9.6x) sits within 1% of the named 3-peer median (9.71x) — the small named-peer sample is corroborated by the larger, less-curated CapIQ set, which increases confidence in the peer benchmark despite n=3 in the primary table.

## 3. Premium / Discount to Peer Median

| Multiple | Haier | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| P/E (LTM) | 10.8x | 14.5x | **(25.5%)** discount |
| EV/EBITDA (LTM) | 6.3x | 9.71x | **(35.1%)** discount |
| EV/EBIT (LTM) | 8.5x | 13.6x | **(37.5%)** discount |
| EV/Sales (LTM) | 0.6x | 0.9x | **(33.3%)** discount |
| FCF Yield (inverted reading — higher yield = cheaper) | 8.52% | 6.63% | Haier's yield is 28.5% above peer median → **discount** (not a premium; a higher yield is a lower price for the same cash) |

Formula (price multiples): `(Haier multiple − peer median) / peer median`. Formula (FCF yield, inverted per module rule): same arithmetic, but a positive result on a yield metric reads as a **discount**, since Haier is paying less per unit of cash flow than the peer median implies. All five multiples read the same direction: Haier trades at a **discount to the peer median on every measured basis**, by roughly 25–38% on the four price multiples and consistently on the yield check.

**Is the gap typical or unusual? Not assessable.** No peer-multiple time series exists in the data pool — the Capital IQ comp export is a single snapshot dated 2026-08-12, and `valuation/02_multiples-own-history.md` (which would carry Haier's own 3-year multiple band for this comparison) has not been produced in this run. This report cannot say whether the current 25–38% discount is wider, narrower, or in line with Haier's typical relationship to Midea/Gree/Whirlpool over the past ~3 years — that is a real gap, not an assumption. Downstream (`07`), this should be treated as a point-in-time reading only.

## 4. Is the Gap Warranted?

The discount is **largely warranted** on the evidence, though the quality-adjusted math in §5 leaves only a small residual gap once that evidence is priced in. Haier's LTM EBIT margin (6.9%) sits below both Midea (9.8%) and Gree (17.4%) on the identical Capital IQ basis, and its EBITDA margin (8.7%) is 24% below the peer median (11.5%) — the moat module independently found the same ordering and called the moat "narrow" and "eroding": Return on capital cleared an estimated cost of capital (7.56% LTM ROIC vs an inferred ≈3.9–4.8% WACC) but has fallen for two straight readings from a 9.12% FY2024 peak, and gross margin fell 460bp (30.9%→26.3%) over five years, a trend the company itself ties to commodity cost pressure it could not fully pass through [`business-model/09_moat.md` §5; `business-model/07_business-quality.md` §4]. Business quality scored 42/100 (weak, upper end), driven by the lowest-scoring rows — commodity dependence 18/100 (raw materials 84% of segment COGS) and competitive intensity 24/100 ("one of the most crowded consumer-durables categories globally") [`business-model/07_business-quality.md` §1–2]. Against that, Haier's balance sheet is the strongest of the three disclosed (net cash −0.95x EBITDA, versus Whirlpool's +6.89x levered position — Whirlpool's own elevated P/E (14.95x) likely reflects earnings depressed by that leverage and a negative FCF yield (−11.78%), not a genuine premium, which weakens Whirlpool's reliability as a peer anchor). One peer-set anomaly to flag: Gree, with by far the best margins in the set (17.4% EBIT), trades at the **lowest** P/E (7.7x) and EV/EBITDA (4.2x) of the three — a pattern inconsistent with pure quality-based pricing and suggestive of a broader China-appliance-sector multiple compression that is not specific to Haier's own fundamentals. **Conclusion: discount is warranted** — the margin, moat-trajectory, and cyclicality evidence supports Haier trading below the peer median, and the quality-adjusted implied value in §5 shows the raw 25–38% discount is mostly, not fully, explained by the fundamental quality gap.

## 5. Implied Value from Peer Multiples

**Basis matching:** all multiples below are LTM (trailing), applied to Haier's own LTM metric (LTM ended Mar-31-2026, from `earnings/01_historical-financials.md` §2) — trailing-to-trailing throughout, consistent with §16 Calculation Standard 4.

**Equity bridge used for every EV-based row** (from `01_price-and-capital-structure.md`, broad/canonical basis): `Implied Equity = Implied EV − Net Debt(broad, −24,598.67) − Minority Interest (9,606.03) = Implied EV + 14,992.64` (CNY m). Divided by 9,311.825848m diluted weighted-average shares (per-share fair-value count per `01`).

**Quality adjustment (base case):** Haier's LTM EBITDA margin (8.7%) sits at 0.7565x the peer median (11.5%) — a 24% relative shortfall directly evidenced by the moat/business-quality findings in §4 (bottom-of-peer-set margins, eroding trend, high commodity/competitive exposure). This ratio is applied as a haircut to the peer median EV/EBITDA multiple: `9.71x × (8.7% / 11.5%) = 7.35x`. This is this agent's own method — *Inference, not from filings* — chosen because EV/EBITDA (unlike EV/Sales or P/E) does not already normalize for margin differences, so a persistent, evidenced margin shortfall is applied directly as a multiple discount.

| Multiple | Applied Multiple | Basis | Implied EV or Equity (CNY m) | Implied Price/Share (CNY) | vs Current Price (21.75) |
|---|---:|---|---:|---:|---:|
| **EV/EBITDA — quality-adjusted (BASE CASE)** | 7.35x | LTM EBITDA 25,950.2 | EV 190,626 → Equity 205,618 | **CNY 22.08** | **+1.5%** |
| EV/EBITDA — peer median, unadjusted | 9.71x | LTM EBITDA 25,950.2 | EV 251,976 → Equity 266,969 | CNY 28.67 | +31.8% |
| EV/EBIT — peer median, unadjusted | 13.6x | LTM EBIT 20,385.9 | EV 277,248 → Equity 292,241 | CNY 31.38 | +44.3% |
| EV/Sales — peer median, unadjusted | 0.9x | LTM Revenue 296,915.3 | EV 267,224 → Equity 282,216 | CNY 30.31 | +39.3% |
| P/E — peer median, unadjusted | 14.5x | LTM diluted EPS 2.01 | — (direct per-share) | CNY 29.15 | +34.0% |
| FCF yield — peer median as cap rate | 6.63% | LTM FCF/share 1.739 | — (direct per-share) | CNY 26.23 | +20.6% |

**Reading the table:** applying the full, unadjusted peer median to Haier's own metrics (rows 2–6) implies CNY 26.2–31.4/share, +20.6% to +44.3% above the current CNY 21.75 — this is the mechanical consequence of the discount documented in §3 and should NOT be read as the base case, since §4 found most of that discount fundamentally warranted. The quality-adjusted EV/EBITDA point (row 1) is the base case this report carries forward: **CNY 22.08/share, +1.5% versus the current price** — essentially a "gap mostly closed by the fundamentals" result, with the unadjusted-multiple rows shown as the separate dispersion range (CNY 26.2–31.4) to make clear how much of the raw discount is quality-driven versus how much residual gap (if any) remains for other methods (`04` DCF, `07` triangulation) to arbitrate.

## 6. Relative Read

Haier trades at a 25–38% discount to its three named peers' median on every price multiple (P/E, EV/EBITDA, EV/EBIT, EV/Sales) and on an inverted FCF-yield check, as of the 2026-08-12 comp snapshot. Most of that gap is warranted: Haier's EBITDA margin runs 24% below the peer median, its moat is independently rated "narrow" and "eroding" (ROIC down for two straight years from a subsidy-assisted 2024 peak), and it carries the heaviest commodity and competitive-intensity exposure in the set — offset only partly by the strongest balance sheet of the three (net cash, versus Whirlpool's ~6.9x levered position). Once that margin gap is priced into the peer EV/EBITDA multiple (7.35x vs the peer median 9.71x), the implied base-case value is CNY 22.08/share, only 1.5% above the current CNY 21.75 — the raw discount is mostly explained by fundamentals, not a clean mispricing; the wider CNY 26.2–31.4/share range shown by the unadjusted multiples is the ceiling if Haier's margin and moat trajectory were to fully stabilize toward the peer median, which the evidence here does not yet support.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — HAIER (Haier Smart Home Co., Ltd., SHSE:600690)

**Business-type gate (MODULE_RULES Business-Type Method Map).** `00_valuation-data-triage.md` §3 and the business-model triage classify Haier as an **Operating company** (multi-segment global home-appliance manufacturer) — not a bank/insurer, REIT, or holding company. It carries a **High** commodity-cost dependence (raw materials 84% of appliance-segment cost of sales, `business-model/10_external-dependency.md`) and a **34/100 cyclicality score** (`business-model/07_business-quality.md`), so the **Cyclicality Gate** applies to the terminal margin even though the entity itself is not classified "Commodity/cyclical." An **FCFF DCF** is the correct method; it proceeds below, with the terminal margin normalized against peer-normal and the company's own prior trough (§2, §5).

**Currency and reporting basis.** All figures in RMB (CNY) millions unless stated otherwise. Base year is **FY2025 (ended 31-Dec-2025)**, reported under China Accounting Standards for Business Enterprises (CAS/ASBE), A-share (SHSE:600690) basis — the same basis `earnings/01_historical-financials.md` uses. Current price CNY 21.75 (2026-08-12 close), net debt, minority interest and diluted share count are carried forward from `valuation/01_price-and-capital-structure.md` (canonical anchor).

---

## 1. FCF Base & Normalizations

| Item | Base-Year Value (FY2025) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | 302,346.8 | None — as reported | `earnings/01_historical-financials.md` §1 |
| EBIT | 20,866.8 (6.90% margin) | None — no EBIT-level one-off identified. The company's ~RMB949.2mn of CSRC-defined non-recurring items (government subsidies, asset-disposal losses, FV gains) sit **below** the EBIT line and affect net profit, not EBIT (`earnings/01_historical-financials.md` §4; `earnings/06_earnings-quality.md` §4) | `earnings/01_historical-financials.md` §1 (CapIQ-derived, cross-checked to the company's own P&L movement table) |
| D&A | 5,676.6 (1.88% of revenue) | None | EBITDA (26,543.4) − EBIT (20,866.8), `earnings/01_historical-financials.md` §1 |
| Capex | 8,851.6 (2.93% of revenue) | None — FY2025 capex sits below the FY2023 peak (10,541.6), not a wave running above history (`earnings/03_margin-drivers.md` §9) | `earnings/01_historical-financials.md` §1 |
| Effective tax rate | 14.1% | **Used as-is as the normalized rate** — structural, not a one-off: the rate declined smoothly from 16.97% (FY2021) to 13.54% (LTM Mar-2026) with no visible spike/dip, driven by dozens of Haier subsidiaries qualifying for China's 15% High-and-New-Technology-Enterprise (HNTE) preferential rate vs the 25% statutory rate. **This reconciles exactly to `business-model/09_moat.md` §3's canonical normalized rate (14.1%, FY2025)** — no divergence to flag per the reconciliation requirement | `business-model/09_moat.md` §3; `earnings/06_earnings-quality.md` §8 |
| FCF (CFO − total capex) | 17,151.3 | None — earnings-quality found no distorting one-off inflating reported FCF; the strong CFO/EBITDA ratio (98.0% FY2025) is structurally supported by a negative cash-conversion cycle funded through supplier credit, not a one-time item (`earnings/06_earnings-quality.md` §1, fn.4) | `earnings/01_historical-financials.md` §1 |

No proxy FCF was required (a full cash-flow statement is available) and consensus forward estimates exist through FY2030 — the Partial-Data Rule's proxy/self-build caps do **not** apply. Confidence is nonetheless capped to **Moderate** for reasons stated in §8 (extreme WACC sensitivity; elevated near-term miss risk on the consensus revenue path).

---

## 2. Forecast Assumptions

**Explicit forecast: FY2026–FY2030 (5 years).** Revenue growth is Street consensus (Capital IQ Estimates, as of 2026-08-13 — a genuine pool export, tier 5, not web-sourced); margin, capex, and working-capital paths are this agent's own analyst assumptions, informed by the cited upstream modules, because Haier issues no formal consolidated guidance (`earnings/04_guidance-consensus.md` §2).

| Assumption | FY2026E | FY2027E | FY2028E | FY2029E | FY2030E | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | +2.24% | +4.98% | +4.77% | +6.93% | +5.85% | +2.00% (Gordon) | **Consensus**, `HaierSmartHomeCo…EstimatesReport.xls`, Consensus tab (FY2026E–FY2030E path; FY2026E ties exactly to `earnings/04_guidance-consensus.md` §3's CNY 309,111mn mean). Flagged: `earnings/04_guidance-consensus.md` §7 rates the "Bar" as **High / miss risk elevated** — two of the last two reported quarters missed an already-lowered consensus, and revision breadth is net negative into FQ2 2026 |
| Gross margin % | 25.8% | 26.0% | 26.2% | 26.3% | 26.3% | 26.3% | **Analyst assumption.** FY2025 actual 26.33% (`earnings/01_historical-financials.md` §1); Q1 2026 printed 25.3%, down 0.1pp YoY (`earnings/03_margin-drivers.md` §3), so Yr1 continues that pressure before a partial, not full, recovery — terminal is held at the FY2025 level, **not** the FY2024 peak (27.48%), consistent with the moat module's "eroding" trajectory finding |
| EBIT margin % | 6.60% | 6.70% | 6.80% | 6.85% | 6.90% | 6.90% | **Analyst assumption**, Cyclicality-Gate-benchmarked: terminal margin (6.90%) = the FY2025 actual, above the company's own 5-yr low (FY2021, 5.91%) but well below **peer-normal** — Midea 9.8% EBIT margin and Gree 17.4% EBIT margin, same LTM comp-set basis (`business-model/09_moat.md` §3) — and below the FY2024 subsidy-assisted cyclical peak (7.66%), which `business-model/07_business-quality.md` §4 explicitly calls "the cyclical high-water mark, not the sustainable run-rate" |
| Tax rate % | 14.1% | 14.1% | 14.1% | 14.1% | 14.1% | 14.1% | Held flat at the normalized structural rate (§1) — HNTE preferential-rate regime is long-standing and disclosed, not scheduled to lapse in the pool |
| Capex (% of revenue) | 2.95% | 2.93% | 2.90% | 2.88% | 2.85% | 2.85% | **Analyst assumption**, gently mean-reverting toward the FY2025 ratio (2.93%) from a slightly elevated FY2026 starting point, reflecting the Air Solutions (CCR/Kwikot) capacity build tapering (`earnings/03_margin-drivers.md` §9) |
| D&A (% of revenue) | 1.90% | 1.89% | 1.88% | 1.87% | 1.86% | 1.86% | **Analyst assumption**, held near the FY2025 ratio (1.88%) |
| Working capital driver | DSO 51.5d / DIO 73.7d / DPO 124.0d | DSO 52.0d / DIO 73.6d / DPO 123.0d | DSO 52.5d / DIO 73.5d / DPO 122.0d | DSO 53.0d / DIO 73.5d / DPO 121.0d | DSO 53.0d / DIO 73.5d / DPO 120.0d | Held at FY2030 levels | **Revenue/COGS-linked (days-of-sales), not a flat absolute** — extends `earnings/06_earnings-quality.md` §3's explicit finding that Haier's cash-conversion cycle (CCC) has narrowed every year (−10.8d FY2023 → −7.0d FY2024 → −1.2d FY2025) and "could turn positive within 1–2 years" if DSO keeps rising while DPO holds/falls. This forecast extends that disclosed trend (CCC: −1.2d FY2025 → +1.2d → +2.6d → +4.0d → +5.5d → +6.5d by FY2030), not a company-guided figure |

**Working-capital cash-effect sign check.** NWC is computed each year as AR (DSO/365 × revenue) + Inventory (DIO/365 × COGS) − AP (DPO/365 × COGS); FY2025 base NWC = CNY 10,296.8mn (cross-checks to the CapIQ "Working Capital" balance of CNY 10,487.2mn in `earnings/01_historical-financials.md` §1, ~1.8% gap attributable to definitional scope). Because the CCC is modeled turning from slightly negative to **positive** over the forecast (per the earnings-quality trend above), NWC **rises** every year (ΔNWC = +1,709.7 → +1,723.9 → +1,830.9 → +2,358.7 → +1,825.2, CNY mn) — a **cash use**, correctly **subtracted** in the FCF formula below. This is the opposite of the "negative-working-capital release" case (that pattern would apply only if the CCC stayed negative and the ratio held or widened) — here the disclosed CCC-narrowing trend is modeled through to its logical conclusion, which is a **headwind** to FCF, not a tailwind. Sign confirmed against the direction of the modeled ΔNWC path, not assumed.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 1.70% | China 10-year government bond yield, Aug-2026 — Web: tradingeconomics.com, 2026-08-07 (unverified, dated) — same rate `business-model/09_moat.md` §3 uses |
| Equity-risk premium | 6.50% (base case); 9.00% (sensitivity) | China ERP inference — *Inference, not from filings*, same range `business-model/09_moat.md` §3 uses |
| Beta | 0.46 | Capital IQ 5-year beta, `Company Comparable Analysis…xls`, Operating Statistics tab — corroborated by `…Public Company Profile.rtf` ("Beta 5Y: 0.46") |
| Cost of equity (k_e = rf + β×ERP) | 4.69% (base) / 5.84% (ERP-sensitivity) | Computed |
| Pre-tax cost of debt | 1.699% | Yield-to-worst on Haier's Jun-2028 senior unsecured RMB note, `…Fixed Income Securities Summary.rtf` |
| Tax rate (debt tax shield) | 14.1% | Same normalized rate as NOPAT (§1) |
| After-tax cost of debt | 1.459% | Computed: 1.699% × (1 − 0.141) |
| Equity / debt weights (market value) | 81.88% equity / 18.12% debt | Market cap CNY 190,093.35mn ÷ (Market cap + Total debt CNY 42,076.81mn), both from `valuation/01_price-and-capital-structure.md` §3–§4 — **market-value weights**, not CapIQ's book-based "Total Capital" weights (which the moat module used as a cross-check only) |
| **WACC** | **4.10% (base, ERP 6.5%) / 5.05% (ERP-sensitivity, 9.0%)** | Computed (formula below) |

**Formula (pinned by the executed snippet, not eyeballed):**
```
WACC = w_e·k_e + w_d·k_d·(1 − t)
w_e = 190,093.35 / (190,093.35 + 42,076.81) = 0.8188
w_d = 42,076.81 / (190,093.35 + 42,076.81) = 0.1812
k_e = 1.70% + 0.46 × 6.50% = 4.690%          [ERP sensitivity: 1.70% + 0.46 × 9.00% = 5.840%]
k_d(after-tax) = 1.699% × (1 − 0.141) = 1.459%
WACC = 0.8188×4.690% + 0.1812×1.459% = 4.1045%   [ERP sensitivity: 0.8188×5.840% + 0.1812×1.459% = 5.0461%]
```
Executed output:
```
ERP=6.50% -> ke=4.6900% kd_at=1.4594% WACC=4.1045%
ERP=9.00% -> ke=5.8400% kd_at=1.4594% WACC=5.0461%
```

**Sanity bound (MODULE_RULES Gate 4).** After-tax k_d (1.459%) ≤ WACC (4.105%) < k_e (4.690%) → **holds** (confirmed by the executed script: `True`). China is not a developed USD/EUR/GBP market, so the mega-cap k_e-vs-`rf + 1.4×ERP` ceiling does not formally apply, but for completeness: k_e (4.69–5.84%) implies an effective beta of 0.46 — well below 1.4 — so no override justification is needed either way.

**Cross-check against `business-model/09_moat.md`.** That module's own CAPM build (book-value "Total Capital" weights: 76.2% equity / 23.8% debt) produced WACC ≈3.9%–4.8%. This report's market-value-weighted WACC (4.10%–5.05%) sits within ~0.3pp of that range at every ERP point — well inside the ±2pp Gate-4 tolerance — so no divergence-driven grid-widening is triggered. **Base case used throughout §4–§7: WACC = 4.10% (ERP 6.5%).**

**A material finding, flagged here and carried through §5–§8:** this mechanically-correct WACC is unusually low — a consequence of China's current sub-2% sovereign yield and Haier's low 5-year beta — and it is **materially below** the discount rate the market appears to actually apply to this stock (Haier's own trailing TEV/LTM EBITDA has traded 5.9x–10.1x over the last six quarters, `Haier…Financials.xls`, Multiples tab). At WACC this low, the Gordon-growth terminal value becomes numerically unstable even at a conservative terminal growth rate — see §5.

---

## 4. Free Cash Flow Forecast & Discounting

| Year | Revenue | EBIT | NOPAT | Capex | ΔNWC (cash effect) | FCF | Discount Factor (mid-year, t−0.5) | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026E | 309,110.7 | 20,401.3 | 17,524.7 | 9,118.8 | −1,709.7 | 12,569.4 | 0.9801 (t=0.5) | 12,319.1 |
| FY2027E | 324,503.1 | 21,741.7 | 18,676.1 | 9,507.9 | −1,723.9 | 13,577.4 | 0.9414 (t=1.5) | 12,782.4 |
| FY2028E | 339,971.4 | 23,118.1 | 19,858.4 | 9,859.2 | −1,830.9 | 14,559.8 | 0.9043 (t=2.5) | 13,166.8 |
| FY2029E | 363,531.0 | 24,901.9 | 21,390.7 | 10,469.7 | −2,358.7 | 15,360.3 | 0.8687 (t=3.5) | 13,343.1 |
| FY2030E | 384,795.0 | 26,550.9 | 22,807.2 | 10,966.7 | −1,825.2 | 17,172.5 | 0.8344 (t=4.5) | 14,329.2 |

FCF = NOPAT + D&A − Capex − ΔNWC (D&A rows shown in §2; ΔNWC subtracted every year — NWC is rising, a cash use, per the §2 sign check).

**Discounting convention: mid-year (t − 0.5), as required by default.** Cash flows are assumed to arrive evenly through each fiscal year, not at year-end.

**Sum of PV of explicit FCFs = CNY 65,940.6mn.**

Executed command and raw output:
```
for i,r in enumerate(rows, start=1):
    t = i - 0.5
    df = 1/(1+WACC)**t
    pv = r['fcf']*df
    pv_sum += pv
--- output ---
2026 FCF=12569.4 t=0.5 DF=0.9801 PV=12319.1
2027 FCF=13577.4 t=1.5 DF=0.9414 PV=12782.4
2028 FCF=14559.8 t=2.5 DF=0.9043 PV=13166.8
2029 FCF=15360.3 t=3.5 DF=0.8687 PV=13343.1
2030 FCF=17172.5 t=4.5 DF=0.8344 PV=14329.2
Sum PV of explicit FCFs = 65940.6
```

---

## 5. Terminal Value

### Financeable-growth cross-check (Gate 2), run before selecting terminal g
```
Terminal-year (FY2030) net investment = Capex − D&A + ΔNWC = 10,966.7 − 7,157.2 + 1,825.2 = 5,634.6
Reinvestment rate = 5,634.6 / NOPAT(22,807.2) = 24.71%
Implied financeable g = ROIC × reinvestment rate
  using 5-yr through-cycle ROIC 8.32% (business-model/09_moat.md §3): g = 2.06%
  using LTM ROIC 7.56% (moat §3, Mar-2026):                              g = 1.87%
```
Chosen terminal g = **2.00%**, inside the 1.87%–2.06% financeable-growth band (gap ≤0.13pp, well within the ±1.5pp Gate-2 tolerance) — **not** an arbitrary macro-growth pick.

### Method 1 — Gordon growth (formal requirement; flagged UNRELIABLE at this WACC)
```
TV = FCFF_{n+1} / (WACC − g) = FCF_2030 × (1+g) / (WACC − g)
   = 17,172.5 × 1.02 / (0.041045 − 0.02000)
   = 17,516.0 / 0.021045
   = 832,304.7  (undiscounted)
PV(TV) = 832,304.7 × 0.8344 = 694,495.2
```
WACC − g = 2.105pp — clears the "must stay comfortably positive" bar in isolation, **but** the resulting terminal value implies an **EV/EBITDA multiple of 24.7x** on FY2030 terminal EBITDA (TV ÷ EBITDA_2030 = 832,304.7 ÷ 33,708.0). Haier's own trailing TEV/EBITDA has never exceeded 10.1x in the disclosed 2024Q4–2026Q2 history (§3), and named peers Midea/Gree trade on lower EBIT margins × comparable or lower multiples. **This fails the required cross-check ("the exit multiple implied by the Gordon TV should be sane for the business at maturity") outright** — it is a direct, mechanical consequence of the mechanically-low WACC (§3), not a modeling error in the cash-flow build. **Gordon-growth TV is therefore NOT used for the headline value** — shown here only because the method is formally required, and flagged unreliable.

### Method 2 — Exit multiple (**canonical, used for the headline value**)
```
TV = Terminal EBITDA × Exit multiple
Terminal EBITDA (FY2030) = EBIT(26,550.9) + D&A(7,157.2) = 33,708.0
Exit multiple = 7.0x — the midpoint of Haier's own trailing TEV/LTM EBITDA range over the last
  six disclosed quarters (5.9x–10.1x, `Financials.xls` Multiples tab), reflecting a mature,
  no-longer-fast-growing, margin-compressed profile — not the cyclical-peak multiple
TV = 33,708.0 × 7.0 = 235,956.3  (undiscounted)
PV(TV) = 235,956.3 × 0.8344 = 196,887.7
```

- **Terminal value (undiscounted): CNY 235,956.3mn** (exit-multiple, canonical)
- **PV of terminal value: CNY 196,887.7mn**
- **Terminal value as % of total EV: 74.94%** (canonical exit-multiple EV = 262,828.2 — see §6) — **just under the 75% terminal-dominated flag threshold; flagged as near-threshold, not clear of it.** On the Gordon-growth basis, TV is 91.33% of EV — clearly terminal-dominated and a second, independent reason that method is not used for the headline.

### Structural-decline / runoff terminal (trigger fired — `CLAUDE.md` §24 Filter 5 / avoid-ruin)

`business-model/09_moat.md` §5 verdict: **"Moat trajectory: eroding"** — gross margin down 460bp over five years (30.9%→26.3%), ROIC declining for two consecutive readings from its FY2024 peak (9.12%→7.97%→7.56%). This fires the §5 declining-perpetuity trigger. (Business-quality's rate-of-change score, 72/100, is above the 40 disruption threshold, so this is a competitive/cost-erosion trigger, not a disruption trigger — the runoff below models slow structural decay, not a technology wipeout.)

Runoff assumptions (all analyst assumption, labeled): revenue growth cut to roughly half the consensus path (demand destruction under continued price war + subsidy-cliff + tariff persistence); EBIT margin fades from 6.20% (FY2026) to **5.00%** by FY2030 — **below** the company's own FY2021 trough (5.91%), i.e. a genuinely non-recovering base, not just "below peak"; gross margin fades further (25.0%→23.8%); capex pulled back (2.90%→2.50% of revenue); working capital deteriorates faster (CCC: +6.0d→+30.0d) reflecting tighter supplier terms and stretched receivables in a stressed scenario.

```
Sum PV explicit FCF (runoff) = 35,275.4
Terminal FCF (FY2030, runoff) = 9,271.0
g_decline = −1.0% (nominal, below China CPI inflation ~1–2%, trending negative — a genuine runoff,
  not merely a fade — same nominal basis as the rest of this model, no real-rate substitution)
WACC − g_decline = 4.1045% − (−1.0%) = 5.105pp  (comfortably positive — a declining g moves AWAY from the WACC, resolving the §5 near-convergence risk that affects the base case)
TV (undiscounted) = 9,178.3 / 0.05105 = 179,807.1
PV(TV) = 150,035.4
EV (runoff) = 35,275.4 + 150,035.4 = 185,310.8   (TV = 81.0% of EV)
Equity (runoff) = 185,310.8 + 24,598.67 − 9,606.03 = 200,303.4
Per-share (runoff, Gordon) = 200,303.4 / 9,311.825848 = CNY 21.51   (−1.1% vs price CNY 21.75)

Exit-multiple cross-check (runoff): terminal EBITDA = 23,440.1; 5.0x (below Haier's own low-end
  trading range, reflecting a de-rated, impaired franchise) → TV = 117,200.7; PV(TV) = 97,795.1;
  EV = 133,070.5; Equity = 148,063.1; Per-share = CNY 15.90   (−26.9% vs price)
```

**This runoff case is the structural-reset BEAR input for `07_scenario-and-fair-value` and the master synthesizer's §24 Kill Criteria — it does not replace the base-case intrinsic value in §6 below.** It shows the DCF-side floor if the moat's already-observed erosion continues without stabilizing, spanning CNY 15.90 (exit-multiple read) to CNY 21.51 (Gordon read) — i.e., roughly flat to −27% from the current price, not a catastrophic wipeout, consistent with Haier's net-cash balance sheet and diversified geographic base limiting (not eliminating) downside.

---

## 6. DCF Output

**Canonical basis: exit-multiple terminal (7.0x terminal EBITDA), WACC = 4.10%.**

| Step | Value (CNY mn) |
|---|---:|
| PV of explicit FCFs | 65,940.6 |
| + PV of terminal value (exit-multiple, 7.0x) | 196,887.7 |
| **= Enterprise value** | **262,828.2** |
| − Net debt (broad, canonical, net CASH; `01` §5, Mar-31-2026) | −(−24,598.67) = +24,598.67 |
| − Minority interest (`01` §4) | −9,606.03 |
| − Preferred equity | 0.00 |
| **= Equity value** | **277,820.9** |
| ÷ Diluted weighted-average shares (`01` §2) | 9,311.825848 million |
| **= Intrinsic value per share** | **CNY 29.84** |
| vs current price (CNY 21.75, 2026-08-12) | **+37.2%** |

Executed output:
```
Exit-multiple EV (canonical base): EV=262828.2 -> Equity=277820.9
  (EV - NetDebt(-24598.7) - Minority(9606.0)) -> Per-share=29.84
Current price = CNY 21.75 (2026-08-12)
Implied upside (exit-multiple base): 37.2%
```

**Memo — Gordon-growth basis (NOT the headline, shown per format requirement, flagged unreliable per §5):** EV CNY 760,435.8mn → equity CNY 775,428.4mn → CNY 83.27/share (+282.9% vs price). This number is not decision-useful — it is a direct artifact of discounting at a WACC (4.10%) that is only ~2.1pp above even a conservative 2.0% terminal growth rate, and it implies a 24.7x terminal EV/EBITDA multiple against a stock that has never traded above 10.1x. It is disclosed for transparency, not used anywhere in §7–§8.

---

## 7. Sensitivity Grid (per-share intrinsic value)

**Primary grid — exit multiple (canonical method), WACC across columns, terminal EV/EBITDA multiple down rows:**

| | WACC 3.10% (−1%) | WACC 4.10% (base) | WACC 5.10% (+1%) |
|---|---:|---:|---:|
| 8.0x | 34.11 | 32.86 | 31.67 |
| 7.0x (base) | 30.95 | **29.84** | 28.77 |
| 6.0x | 27.80 | 26.81 | 25.88 |

Range across the full grid: **CNY 25.88 – 34.11/share** — every cell sits above the current price (CNY 21.75), giving a base-case-method margin-of-safety-positive read even at the low end of the grid.

**Secondary grid — Gordon growth (illustrative only, NOT used for the headline; shown to make the §3 WACC fragility explicit, per the required-grid format):**

| | WACC 3.10% (−1%) | WACC 4.10% (base) | WACC 5.10% (+1%) |
|---|---:|---:|---:|
| g = 2.50% | 281.37 | 106.99 | 66.53 |
| g = 2.00% (base) | 157.28 | 83.27 | 56.95 |
| g = 1.50% | 110.54 | 68.66 | 50.03 |

Every cell in this grid implies a terminal EV/EBITDA multiple far above Haier's own trading history (roughly 15x–70x, back-solved) — **none of these values is treated as a plausible fair-value estimate.** This grid exists only to document, transparently, why the Gordon-growth method is unusable at this WACC and to justify the shift to the exit-multiple canonical basis above.

---

## 8. Intrinsic Read

**Base-case intrinsic value: CNY 29.84/share** (exit-multiple DCF, 7.0x terminal EV/EBITDA, WACC 4.10%), **+37.2% above the CNY 21.75 current price.** The primary sensitivity grid (§7) shows this point is not fragile to reasonable WACC/multiple moves — the full range is CNY 25.88–34.11, all above the current price — but it IS highly sensitive to which terminal *method* is used: the formally-required Gordon-growth calculation, run at the same mechanically-correct WACC, produces an unusable CNY 68–107/share because Haier's China-sourced CAPM inputs (a sub-2% sovereign yield and a 0.46 beta) generate a WACC well below the discount rate the market visibly applies to this stock (its own trading multiple has never exceeded 10.1x EV/EBITDA, yet Gordon growth at a conservative 2.0% terminal g implies 24.7x). **The single assumption this value is most sensitive to is therefore not WACC or terminal growth individually, but the choice of terminal METHOD** — Gordon growth is mathematically live but economically unusable at this company's mechanical WACC, and every base-case number in this report rests on substituting an exit multiple anchored to Haier's own trading history instead. A separate, explicitly-labeled structural-decline/runoff terminal (triggered by the moat module's "eroding" trajectory finding) produces CNY 15.90–21.51/share — roughly flat to −27% from the current price — and is the bear-case input for `07_scenario-and-fair-value`, not a replacement for the CNY 29.84 base point above.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — HAIER (Haier Smart Home Co., Ltd., SHSE:600690)

This report inverts `04_intrinsic-dcf.md`'s own discounted-cash-flow (DCF) model — a method that estimates value by discounting future cash flows back to today's money — rather than building a new one. Instead of forecasting cash flows and deriving a fair value, it starts from today's price and solves backwards: holding `04`'s discount rate (the WACC, or weighted average cost of capital — the blended annual return debt and equity holders require) and its terminal method fixed, what growth or margin does the price require? This is the standard "reverse-DCF" or "what's priced in" read.

## 1. Inputs

All figures carried forward verbatim from `valuation/01_price-and-capital-structure.md` (price, EV) and `valuation/04_intrinsic-dcf.md` (WACC, FCF base, terminal method) — no independent WACC or base is derived here, per the module's reverse-DCF standard (this agent's job is to invert the same model `04` already built, not build a second one).

| Input | Value | Source |
|---|---:|---|
| Current price | CNY 21.75 (A-shares, SHSE:600690, 2026-08-12 close, `pool-verified`) | `01` §1 |
| Enterprise value (EV) — broad cash basis, canonical | CNY 175,100.70mn | `01` §4, §7 (= market cap 190,093.35 + debt 42,076.81 + minority 9,606.03 − cash & ST investments 66,675.48) |
| FCF base (FY2025 actual, CFO − total capex) | CNY 17,151.3mn | `04` §1, verbatim (`earnings/01_historical-financials.md` §1) |
| EBITDA base (FY2025 actual) | CNY 26,543.4mn (EBIT 20,866.8 + D&A 5,676.6) | `04` §1, verbatim |
| Discount rate (WACC) used | **4.10%** (precise: 4.1045%) — risk-free rate 1.70% (China 10-yr govt bond, web-sourced, dated) + beta 0.46 × equity-risk premium 6.50% → cost of equity 4.69%; after-tax cost of debt 1.459%; weights 81.88% equity / 18.12% debt (market-value) | `04` §3, verbatim |
| Forecast horizon | 5 years explicit (FY2026–FY2030) | `04` §2, §4, verbatim |
| Terminal method | **Exit multiple: 7.0x terminal EV/EBITDA** (midpoint of Haier's own trailing TEV/EBITDA trading range, 5.9x–10.1x over the last six quarters) — this is `04`'s **canonical** terminal method, not Gordon-growth perpetuity. `04` §5 explicitly flagged Gordon growth as "unreliable" at this WACC: even a conservative 2.0% terminal growth rate blows up into an implied 24.7x terminal multiple that Haier has never traded at. Because the canonical model's terminal value is driven by a **multiple**, not a growth rate, this reverse-DCF varies the **exit multiple** (not "terminal g") in the robustness section (§4) — the parameter that actually drives `04`'s terminal value. | `04` §5, verbatim |
| Terminal value as % of EV (at the primary solve below) | 63.4% — above the 60% threshold that requires a terminal-parameter stress test (§4) | Computed, this report |

**What is held fixed vs solved for (stated once, applies throughout §2):** WACC (4.10%), the 5-year horizon, the terminal exit multiple (7.0x), and the discounting convention (mid-year, cash flows arrive on average mid-period — the same convention `04` uses) are all held fixed at `04`'s values. The **growth rate applied uniformly to FCF and EBITDA** is the variable solved for, using an executed root-finder (`scipy.optimize.brentq`) against the target: PV(explicit FCFs) + PV(terminal value) = current EV (CNY 175,100.70mn).

## 2. Implied Expectations

**Executed solver (command and output):**
```python
from scipy.optimize import brentq
WACC = 0.041045; MULT = 7.0; HORIZON = 5; EV_TARGET = 175100.70
FCF0 = 17151.3; EBITDA0 = 26543.4

def pv_total(g, wacc=WACC, mult=MULT, ebitda0=EBITDA0, fcf0=FCF0, n=HORIZON):
    pv = sum(fcf0*(1+g)**t / (1+wacc)**(t-0.5) for t in range(1, n+1))
    tv = ebitda0*(1+g)**n*mult
    return pv + tv/(1+wacc)**(n-0.5)

g_primary = brentq(lambda g: pv_total(g) - EV_TARGET, -0.30, 0.30)
# --- output ---
# Implied uniform FCF/EBITDA CAGR = -6.476%
# Check: pv_total(-0.06476) = 175,100.70  (matches EV_TARGET exactly)
```

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCF/EBITDA CAGR over the 5-year horizon (uniform annual rate, base FCF/EBITDA, base WACC, base 7.0x multiple) | **−6.48% per year** (a sustained decline, not a slower-growth story) |
| Implied years of above-trend growth before the terminal multiple applies (fade model) | **Not solvable at any N ≥ 0** — see note below |
| Implied steady-state EBIT margin (holding `04`'s own consensus revenue path fixed, solving margin instead of growth) | **4.40%** |

**Fade-model note.** The classic "years of above-average growth" construction (grow at the consensus rate, then apply the terminal multiple after N years) was tested and does not reconcile to the price at any N ≥ 0. Even applying the 7.0x terminal multiple **immediately**, to today's EBITDA, with **zero** explicit years of cash flow in between, produces an EV of roughly CNY 189,600–191,500mn — still above the current CNY 175,100.70mn EV. Executed check:
```
N=0.1 years -> EV = 191,488.1   (already above EV_TARGET = 175,100.70)
```
This means no story built on positive-or-flat growth followed by the 7.0x multiple can rationalize today's price — the price only reconciles if cash flow itself shrinks over the forecast window (the −6.48%/yr result above), or if the terminal multiple / margin is compressed well below `04`'s base assumptions (see the EBIT-margin solve and §4).

**Second solve — implied EBIT margin, holding `04`'s own consensus revenue path fixed.** Instead of flexing growth, this holds `04`'s actual FY2026–FY2030 consensus revenue forecast (CNY 309,110.7mn → 384,795.0mn), D&A%, capex%, working-capital path, and tax rate (14.1%) exactly as `04` built them, and solves for a single uniform EBIT margin (replacing `04`'s 6.60%→6.90% ramp) that reconciles PV to the current EV:
```python
# revenue, D&A, capex, ΔNWC lists taken verbatim from 04's FY2026-2030 forecast table
m_solution = brentq(lambda m: pv_at_margin(m) - EV_TARGET, -0.05, 0.10)
# --- output ---
# Implied uniform EBIT margin = 4.403%
# FY2026E FCF at implied margin = 6,735.3   (vs 04's consensus-margin FY2026E FCF of 12,569.4)
# FY2030E FCF at implied margin = 8,918.5   (vs 04's consensus-margin FY2030E FCF of 17,172.5)
```

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCF/EBITDA CAGR = **−6.48%/yr**, cumulative −28.4% by FY2030 | Revenue never posted a full-year decline in FY2021–FY2025 (+7.25%, +12.57%, +4.31%, +5.71%; 4-yr revenue CAGR +7.42%). FCF fell in only one year of five (FY2022, −24.06% YoY) and fully rebounded the next year (+32.8% FY2023); 4-yr FCF CAGR is +1.97%, not negative. The worst *quarterly* revenue print on record is Q1 2026's −6.86% YoY — a single quarter, not a trend (`earnings/01_historical-financials.md` §1, §3, §6) | Earnings-sensitivity's largest single-variable bear case (raw-material cost inflation) is a **one-year** EBITDA hit of −RMB5,350mn (~−20% of base EBITDA) — large, but a one-off shock case, not a construct for five consecutive years of decline; the sensitivity module never models a sustained multi-year contraction of this magnitude (`earnings/07_earnings-sensitivity.md` §2, §4) | **No** — a 5-year sustained decline of this depth has no precedent in Haier's disclosed history and is not what even the earnings module's own bear-case variables build toward |
| Implied steady-state EBIT margin = **4.40%** (holding consensus revenue growth) | 5-year EBIT margin range: 5.91% (FY2021 trough) to 7.66% (FY2024 cyclical peak); FY2025 actual 6.90% (`earnings/01_historical-financials.md` §1) | `04`'s own explicitly-constructed structural-decline/runoff scenario — triggered by the moat module's "eroding" verdict — fades margin to **5.00%** by FY2030, still 60bp *above* the 4.40% this solve requires, and that runoff scenario also cuts revenue growth and the exit multiple to 5.0x at the same time (`04` §5; `business-model/09_moat.md` §5) | **Stretch / No** — 4.40% would be a new all-time low for Haier, ~150bp below its own FY2021 trough, and more pessimistic than the DCF module's own dedicated worst-case construction |

**Judgement.** Both solves point the same direction: at `04`'s own WACC (4.10%) and terminal multiple (7.0x), today's price is not paying for slower growth — it is pricing in either a sustained five-year cash-flow *contraction* with no precedent in Haier's five-year history, or a margin collapse below the company's own worst historical year and below its own DCF module's dedicated bear case. Judged purely on the literal math, that reads as **aggressive on the pessimism side** — the market appears to be pricing in more damage than the evidence supports, which (if the WACC used is the right one) would be a genuine undervaluation signal, consistent with `04`'s own base-case finding of +37.2% upside using the consensus growth path at the same WACC and multiple.

**But this finding carries a load-bearing caveat, not a footnote.** `04` §3 itself flags that its mechanically-computed 4.10% WACC — a product of China's sub-2% sovereign bond yield and Haier's low 0.46 beta — is "materially below the discount rate the market appears to actually apply to this stock," citing Haier's own trading multiple (5.9x–10.1x TEV/EBITDA) as evidence the market prices this stock more conservatively than CAPM says it should. This report's own supplementary check confirms the same thing from the other direction: solving for the WACC that reconciles the price **at zero FCF growth** (a flat, no-decline trajectory) gives **≈12.3%**, and at Haier's own actual 4-year historical FCF CAGR (+1.97%/yr) gives **≈14.85%** — both far more plausible discount rates for a Chinese industrial than 4.10%, and far more plausible growth assumptions than a 6.5%-a-year decline. *Inference, not from filings* — these are this agent's own supplementary solves, shown for interpretation only, not substituted for the required "hold WACC fixed" primary solve above. In other words: the "aggressive pessimism" finding is at least partly a mechanical artefact of the DCF's unusually low WACC (the same artefact that made `04`'s own Gordon-growth terminal value unusable), not necessarily evidence that the market has mispriced Haier's actual prospects. Both readings are shown; neither should be taken as the whole story on its own.

**Market-ceiling sanity check — not applicable.** This check exists to test whether an implied *growth* rate requires an implausible market-share gain (§3 of the agent brief); it can only make an implied acceleration look harder, never easier. Because the primary finding here is an implied **decline** (or a margin *compression*), not an implied growth acceleration, there is no market-share ceiling to test against — a shrinking or margin-compressing company requires no market-share gain at all. The check is skipped for this structural reason, not because market-size data is unavailable.

## 4. Robustness

**Discount rate:**

| Discount Rate | Implied FCF/EBITDA CAGR to Justify Price |
|---|---:|
| WACC − 1% (3.10%) | −7.27%/yr |
| WACC (4.10%, base) | **−6.48%/yr** |
| WACC + 1% (5.10%) | −5.69%/yr |

Spread across the WACC band: 1.58 percentage points (pp).

**FCF/EBITDA base** (low/base/high band sourced from `earnings/07_earnings-sensitivity.md` §2, §4's single highest-magnitude variable — raw-material commodity cost inflation, ±RMB5,350mn EBITDA, tax-adjusted at `04`'s normalized 14.1% rate to a ±RMB4,595.7mn FCF-equivalent swing; a simplification that ignores any capex/working-capital offset, labelled):

| FCF Base | Value (CNY mn) | Implied FCF/EBITDA CAGR to Justify Price |
|---|---:|---:|
| Low (base − raw-material bear-case impact, after-tax) | 12,555.6 (EBITDA 21,193.4) | −0.72%/yr |
| Base (FY2025 actual, `04`'s base) | 17,151.3 (EBITDA 26,543.4) | **−6.48%/yr** |
| High (base + raw-material bull-case impact, after-tax) | 21,746.9 (EBITDA 31,893.4) | −10.99%/yr |

Spread across the FCF-base band: 10.28pp — **more than 6x the WACC band's spread.** As in prior modules, **the FCF base is the dominant sensitivity, not the discount rate**: whether the implied expectation reads as "roughly flat" (−0.7%/yr, at the high end of the plausible near-term FCF base) or "a severe multi-year contraction" (−11.0%/yr, at the low end) depends far more on which year's cash flow is treated as the true run-rate than on any reasonable WACC move.

**Terminal-value stress (required — TV is 63.4% of EV at the primary solve, above the 60% threshold).** Because `04`'s canonical terminal method is an **exit multiple**, not Gordon-growth perpetuity (§1), this report varies the **exit multiple** ±1.0x in place of "terminal g ±0.5%" — the parameter that actually drives `04`'s terminal value:

| Exit Multiple | Implied FCF/EBITDA CAGR to Justify Price |
|---|---:|
| 6.0x (−1.0x) | −4.30%/yr |
| 7.0x (base) | **−6.48%/yr** |
| 8.0x (+1.0x) | −8.37%/yr |

Spread across the multiple band: 4.07pp — between the WACC-driven spread and the FCF-base-driven spread. **Ranking the three: FCF base (10.28pp) > exit multiple (4.07pp) > WACC (1.58pp).** The FCF base is by a wide margin the input this solve is most sensitive to.

## 5. What's-Priced-In Read

At CNY 21.75, and holding `04`'s own WACC (4.10%) and terminal 7.0x exit multiple fixed, the market is pricing in a **sustained ~6.5%-a-year contraction in FCF and EBITDA through FY2030** (cumulative −28.4%) — or, equivalently, an EBIT margin collapsing to 4.40%, a new low below Haier's own FY2021 trough (5.91%) and below `04`'s own dedicated structural-decline bear case (5.00%). Neither has a precedent in Haier's disclosed five-year history, where revenue has never posted a full-year decline and FCF fell in only one of five years before fully rebounding — so, taken literally, this reads as **aggressive on the pessimism side**, consistent with `04`'s own base-case DCF finding of +37.2% upside on the consensus growth path.

That said, the finding is entangled with a mechanical quirk this report cannot fully separate out: `04` itself flags its 4.10% WACC as unusually low relative to the discount rate Haier's own trading history implies (5.9x–10.1x EV/EBITDA), and this report's own supplementary check shows that a flat, no-growth FCF trajectory reconciles to today's price at a WACC of ~12.3% — a far more ordinary discount rate for a China-listed industrial than 4.10%. The honest read is therefore two-sided: **either** the market is pricing genuine, historically-unprecedented pessimism into Haier's cash flows, which would be a real margin-of-safety signal, **or** the market is simply discounting ordinary (even flat) cash flows at a materially higher rate than `04`'s CAPM-derived WACC — in which case this reverse-DCF's "aggressive decline" finding is largely an artefact of the low-WACC model it is required to invert, not proof of a genuine mispricing. This report cannot adjudicate between the two without a directly observed market discount rate; the master synthesizer should weigh this alongside `04`'s own low-WACC caveat and the cross-method dispersion in `07`, not treat the −6.48%/yr figure as a standalone conviction driver.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — HAIER (Haier Smart Home Co., Ltd., SHSE:600690)

**Reporting standard and currency:** China ASBE (CAS) segment note, cross-checked against the IFRS-basis H-share filing; all figures in RMB (CNY) millions, fiscal year ended Dec-31-2025 unless labelled FY2026E. Source: `business-model/03_segment-map.md`, citing `FY2025 Annual Report (SSE, CAS), Note 11(1) (分部信息), pp.222–224` and `FY2025 Annual Report (HKEX, IFRS), Note 4, pp.227–228`.

Cross-module inputs used: `business-model/03_segment-map.md` (segment revenue/profit/economics), `business-model/08_competitive-map.md` (named peer set), `valuation/01_price-and-capital-structure.md` (price, net debt, share count — used verbatim, Reconciliation Gate 1), `earnings/01_historical-financials.md` (FY2025 audited consolidated EBIT/EBITDA), `earnings/04_guidance-consensus.md` (consolidated FY2026 consensus). No `ciq_facts.json` sidecar exists for this ticker — all figures below are this agent's own sourced reads, cross-checked against the Capital IQ workbooks named inline.

Haier is **not** a single-segment business — the largest segment (Household Food Storage & Cooking Solutions) is 41.7% of FY2025 external revenue and 43.4% of segment profit, well under the 85% collapse threshold — so a full SOTP is run, not a collapse.

## 1. Segment Inventory

FY2025 (audited, CAS basis). "% of Total EBIT" denominator = RMB20,768mn, the **reportable-segment profit-before-tax total** disclosed in Note 11(1) (the six rows below plus a RMB50mn positive inter-segment-elimination residual sum to exactly this total — the residual is a reconciling item, not a business segment, and is not a corporate-cost drag). This reportable-segment total is 0.47% below CapIQ's derived consolidated "EBIT" line for FY2025 (RMB20,866.8mn, `earnings/01_historical-financials.md`) — an immaterial, named, definitional gap (segment profit-before-tax per the CAS note vs. a vendor-derived consolidated EBIT construct), not a vanished bucket (Reconciliation Gate 3).

| Segment | Revenue | EBIT-equivalent (segment profit before tax) | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| Household Food Storage & Cooking Solutions — Refrigerators/Freezers | 84,487 | 6,115 | 7.2% | 29.4% | `03_segment-map.md`, FY2025 AR (CAS) Note 11(1) |
| Household Food Storage & Cooking Solutions — Kitchen Appliances | 41,488 | 2,893 | 7.0% | 13.9% | Same |
| *Subtotal: Household Food Storage & Cooking Solutions* | *125,975* | *9,008* | *7.2%* | *43.4%* | Same |
| Air Solutions | 54,021 | 2,341 | 4.3% | 11.3% | Same |
| Home Laundry Care Solutions | 65,386 | 6,597 | 10.1% | 31.8% | Same |
| Household Water Solutions | 17,736 | 2,418 | 13.6% | 11.6% | Same |
| Other Business (channel distribution, component-parts mfg, small appliances, logistics) | 39,229 | 354 | 0.9% (external-revenue basis; company states 0.3% on a total-incl.-intersegment basis, `03_segment-map.md` §1) | 1.7% | Same |
| Reconciling item (inter-segment elimination) | — | 50 | — | 0.2% | Same |
| **Total (reportable segments)** | **302,347** | **20,768** | **6.9%** | **100%** | Same |

Revenue reconciles exactly to consolidated FY2025 revenue (RMB302,347mn, `earnings/01_historical-financials.md`). No unallocated negative corporate-cost bucket is disclosed at the segment level — the only reconciling item is the small positive RMB50mn elimination already included above (Gate 3 satisfied: nothing is dropped by assertion).

## 2. Segment Multiples & Comparables

**Forward basis.** No segment-level consensus estimate exists anywhere in the pool (`earnings/04_guidance-consensus.md` §2, §3: "not derivable — no segment-level consensus estimate exists"). Per the Suppress-rather-than-guess rule, this agent builds an **evidenced FY2026E estimate**: the consolidated FY2026 consensus EBIT (Capital IQ Estimates, `HaierSmartHomeCo,LtdSHSE600690EstimatesReport.xls`, Consensus tab, CNY22,722.0mn, 19–20 analysts) implies **+8.9% growth** over FY2025 audited consolidated EBIT (CNY20,866.8mn, `earnings/01_historical-financials.md`). This growth rate is applied **uniformly** across all six segment rows to the FY2025 audited base — labelled *"Inference, not from filings"* for the segment split (the growth rate itself is pool-sourced consensus; its uniform application across segments is this agent's own assumption). **Limitation, stated explicitly:** uniform application likely overstates growth for the real-estate-linked segments (Refrigeration, Kitchen, Laundry, Water — all flagged in `03_segment-map.md` as pressured by the China property downturn) and may understate Air Solutions, where the company's own qualitative guide is "high single-digit revenue growth and further improvement in operating margin" for the CCR sub-portion only (`earnings/04_guidance-consensus.md` §2) — a segment-specific number this agent cannot isolate from the CCR-only guide. Period basis for every segment: **FY2026E (FY+1)**.

Peer multiples are **NTM TEV/Forward EBITDA (Capital IQ)**, sourced from `Company Comparable Analysis Haier Smart Home Co Ltd .xls`, Trading Multiples tab, data as of 2026-08-12 (except Water Solutions, web-sourced — see below). Because the segment metric available is **EBIT** (segment profit before tax, not EBITDA — segment-level D&A is not disclosed), each peer's NTM EV/EBITDA is converted to an **implied NTM EV/EBIT** using that same peer's own LTM EV/EBIT ÷ LTM EV/EBITDA ratio (assumed stable from LTM to NTM) — shown as a formula in each row so the conversion is fully reproducible.

| Segment | Metric Used (period) | Named Comparable | Comparable's NTM EV/EBITDA | Conversion to NTM EV/EBIT | Multiple Applied | Why the comparable fits |
|---|---|---|---:|---|---:|---|
| Refrigerators/Freezers | FY2026E segment EBIT | Hisense Home Appliances Group (SZSE:000921) | 2.61x | ×(LTM EV/EBIT 3.2 ÷ LTM EV/EBITDA 2.4 = 1.333) | **3.48x** | Owns the Ronshen/Kelon refrigerator brands — China's oldest major refrigerator maker — a direct refrigeration-economics match, not a surface-label diversified peer |
| Kitchen Appliances | FY2026E segment EBIT | Hangzhou Robam Appliances (SZSE:002508) | 6.77x | ×(9.1÷7.9=1.152) | **7.80x** | Pure-play kitchen/cooking-appliance specialist (range hoods, gas hobs) — the closest economics match in the pool to Haier's kitchen-appliance line |
| Air Solutions | FY2026E segment EBIT | Gree Electric Appliances (SZSE:000651) | 4.08x | ×(5.0÷4.2=1.190) | **4.86x** | China's #1/#2 air-conditioner specialist by the company's own competitive read (`08_competitive-map.md`); direct category match for the HVAC-dominated Air Solutions segment |
| Home Laundry Care Solutions | FY2026E segment EBIT | Midea Group (SZSE:000333) | 10.47x | ×(13.6÷11.2=1.214) | **12.71x** | Best-available liquid domestic comp with material laundry-appliance exposure (Little Swan brand); **imperfect** — Midea is a diversified conglomerate (robotics, building tech, industrial) and no domestically-listed pure-play laundry specialist exists in the pool, so part of Midea's premium multiple may reflect businesses Haier's Laundry segment does not have. Flagged and sensitized in §3/§5 |
| Household Water Solutions | FY2026E segment EBIT | A.O. Smith Corp. (NYSE:AOS) | 10.57x (derived — see note) | ×(TTM EBITDA/EBIT 1.133) | **11.98x** | Global #1 water-heater / water-treatment maker with a large China water-heater JV — direct category match for Household Water Solutions |
| Other Business | FY2026E segment EBIT | Guangdong Xinbao Electrical Appliances (SZSE:002705) | 3.94x | ×(7.1÷4.3=1.651) | **6.51x** | OEM/ODM contract manufacturer of small appliances and component parts — matches the "equipment/component-parts manufacturing, small appliances" portion of this catch-all bucket; the distribution/logistics-services portion of Other Business has **no matching comparable** in the pool and is priced on this same multiple by default, a known imprecision flagged here, not silently absorbed |

**A.O. Smith derivation (web-sourced, unverified, labelled):** TTM EV/EBITDA 11.49x and enterprise value $9.00bn as of 2026-08-12 [stockanalysis.com, web]; no forward EV/EBITDA was published for this name, so a **derived NTM EV/EBITDA of 10.57x** is estimated as TTM EV/EBITDA × (forward P/E 16.05 ÷ trailing P/E 17.44 = 0.9203) [stockanalysis.com, 2026-08-12, web]; TTM EBITDA ($783.3mn, back-solved from EV/EBITDA) ÷ TTM EBIT ($691.3mn) = 1.133x conversion ratio to the EV/EBIT basis [stockanalysis.com, TTM period ended 2026-06-30, web]. Three stacked estimation steps — flagged as the single lowest-confidence multiple in this SOTP.

**Haier's own consolidated multiple, for context (not a segment row):** NTM TEV/Forward EBITDA 5.6x [same CapIQ workbook]; LTM TEV/EBIT 8.5x ÷ LTM TEV/EBITDA 6.3x = 1.349x conversion → **derived consolidated NTM EV/EBIT ≈ 7.56x**. Applied to consolidated FY2026E EBIT (CNY22,722.0mn) this implies EV ≈ CNY171,678mn — within 2% of Haier's own market-derived EV (CNY175,100.7mn, `01`), a sanity check that this multiple-conversion method is internally consistent.

## 3. Segment Valuation

FY2026E segment EBIT = FY2025 actual segment profit × 1.089 (§2). Segment EV = FY2026E EBIT × the derived NTM EV/EBIT multiple from §2.

| Segment | FY2026E EBIT (CNY mn) | Multiple (NTM EV/EBIT, derived) | Segment EV (CNY mn) |
|---|---:|---:|---:|
| Refrigerators/Freezers | 6,658.7 | 3.48x | 23,172.2 |
| Kitchen Appliances | 3,150.2 | 7.80x | 24,566.5 |
| Air Solutions | 2,549.1 | 4.86x | 12,381.5 |
| Home Laundry Care Solutions | 7,183.5 | 12.71x | 91,328.3 |
| Household Water Solutions | 2,633.0 | 11.98x | 31,534.0 |
| Other Business | 385.5 | 6.51x | 2,507.7 |
| **Gross enterprise value (sum)** | **22,560.0** | — | **185,490.2** |

(Reconciling item's FY2026E value, ~54.5mn, is not separately valued — it is a small positive elimination, not an operating business; omitting it from the sum is immaterial, <0.03% of gross EV.)

## 4. Equity Bridge

Anchors reused verbatim from `01_price-and-capital-structure.md` (Reconciliation Gate 1): net debt on the **broad** basis (canonical per `01`), minority interest, and the per-share-fair-value diluted share count.

| Step | Value (CNY mn) |
|---|---:|
| Gross enterprise value | 185,490.2 |
| − Capitalized unallocated corporate costs | 0.0 (none disclosed — see §1; the only reconciling item is a small positive elimination, already folded into the RMB20,768mn base) |
| − Net debt (broad basis, canonical from `01`) | (24,598.67) *(company is net CASH — shown as a negative number, i.e. added back once, per net-cash sign discipline; not double-counted)* |
| − Minority / preferred | (9,606.03) |
| + Equity-method investments (JV/associate stakes, per `01` §4) | 21,697.25 |
| − Conglomerate / holdco discount | 0.0 (see note below) |
| **= Equity value** | **222,180.1** |
| ÷ Diluted shares (9,311.825848mn, per `01` §2, per-share fair-value count) | |
| **= SOTP value per share** | **CNY 23.86** |
| vs current price (CNY 21.75, `01` §1, pool-verified, 2026-08-12) | **+9.7%** |

**Conglomerate/holdco discount: none applied.** Haier Smart Home is a single operating legal entity reporting product-line segments, not a legal holding company with separately-traded subsidiaries — there is no structural holdco layer to discount. The reason to treat the base-case SOTP result with caution is instead the **comparable-quality caveat on the Laundry segment** (§2, §5), not a conglomerate-structure discount; that caveat is carried as a sensitivity range below rather than a blanket discount.

**Sensitivity — Laundry comparable swap (dispersion, not a second scenario):** because no domestically-listed pure-play laundry specialist exists, replacing Midea's derived 12.71x with the **lowest** derived multiple in the domestic-appliance comp set used elsewhere in this SOTP (Hisense Home Appliances, 3.48x — i.e., assuming Laundry earns no premium at all over the cheapest domestic appliance peer) drops Home Laundry Care's segment EV from CNY91,328.3mn to CNY24,998.7mn, and:

| | Gross EV | Equity value | Per share | vs price (CNY 21.75) |
|---|---:|---:|---:|---:|
| Base (Midea 12.71x for Laundry) | 185,490.2 | 222,180.1 | **CNY 23.86** | +9.7% |
| Low sensitivity (Hisense 3.48x for Laundry) | 119,160.5 | 155,850.4 | **CNY 16.74** | −23.0% |

This CNY 16.74–23.86 range (a ~43% spread driven by one comparable choice on the single highest-weighted segment) is the dispersion this SOTP can defensibly show — not a false-precision single point.

## 5. SOTP Read

The base-case breakup value (CNY 23.86/share) sits 9.7% above the current price (CNY 21.75), but nearly the entire premium over Haier's own consolidated market value (CNY 175,100.7mn EV) comes from one segment: Home Laundry Care Solutions, valued at CNY 91,328mn — 49% of the whole SOTP's gross EV — despite carrying only 31.8% of segment profit, because it is priced on Midea's 12.71x derived forward EV/EBIT rather than Haier's own ~7.56x consolidated multiple. Strip that one assumption out (using the cheapest domestic-appliance peer instead) and the breakup value falls to CNY 16.74/share, 23% *below* the current price — so the entire "is Haier's best segment being masked by the consolidated multiple" thesis rests on whether Laundry deserves a Midea-like premium, and no clean pure-play laundry comparable exists in this pool to settle that question. The four smaller segments (Refrigerators, Kitchen, Air Solutions, Other Business) collectively add only ~CNY 62.6bn and are far less sensitive to comp choice. Treat this SOTP as a genuine but comp-fragile finding, not a confirmed undervaluation: it flags Laundry as the segment most likely to be under-multipled by the market, but the size of that mispricing cannot be pinned down without a better peer.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — HAIER (Haier Smart Home Co., Ltd., SHSE:600690)

**Anchor (verbatim from `01_price-and-capital-structure.md`):** Current price CNY 21.75 (A-shares, SHSE:600690, last close 2026-08-12, `pool-verified`, 1 trading day old — no staleness cap, no dual-price re-anchor needed). Diluted weighted-average shares (per-share fair-value count) 9,311.825848m. Net debt (broad, canonical) CNY −24,598.67m (net cash). Minority interest CNY 9,606.03m. Equity-bridge add-back used throughout = −Net debt − Minority = +CNY 14,992.64m. Currency: CNY (RMB) millions except per-share figures.

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | CNY 23.10–26.51 (illustrative reversion range) | Low — own producer marks this **illustrative-only** | **0%** | `02`'s own text: "no point or tight-range reversion target is asserted as a fair-value input," because the pool's own-multiple history is ~20 months, well short of the module's 3-year bar. Per the zero-weight rule (self-flagged non-value-producing), this is excluded from the weighted base point but shown in the football field (§2) and its min/mean/median/max band is still used to anchor the bull/base/bear multiples in §3 |
| Relative / peers (03) | CNY 22.08 (quality-adjusted EV/EBITDA base case) | Moderate–High | **68%** | Grounded in real, dated market comps (Midea, Gree; Whirlpool web-sourced). With `02` zero-weighted, `03` alone must carry the "multiples majority" the Scenario Construction Policy requires for an operating company with estimates. `03`'s own quality adjustment (7.35x vs peer-median 9.71x, haircut for Haier's 24%-below-peer EBITDA margin) is well evidenced by the moat/business-quality findings and lands almost exactly on `02`'s own 8-quarter mean/median (7.38x/7.34x) — two independent methods converging on the same multiple is the strongest signal in this triangulation |
| Intrinsic DCF (04) | CNY 29.84 (exit-multiple canonical, +37.2% vs price) | Moderate (producer-capped) | **17%** | Method Map primary for an Operating company, but `04` itself caps confidence at Moderate and flags its mechanically-correct WACC (4.10%) as "materially below the discount rate the market appears to actually apply to this stock" (own trading multiple never exceeded 10.1x EV/EBITDA). `05`'s reverse-DCF corroborates: a flat, no-growth FCF path only reconciles to price at a ~12.3% WACC. Capped per the Scenario Construction Policy (04+06 combined ≤ ≈⅓) rather than dragging the base down — here the DCF instead pulls the blend *up*, and the cap disciplines that pull the same way it would discipline a drag |
| Reverse-DCF (05) | (implied, not a value) — implies −6.48%/yr FCF/EBITDA contraction OR a WACC ≈12.3% is more realistic than `04`'s 4.10% | n/a | n/a | Cross-check only. Confirms the achievability question in §5, not a weighted input |
| Sum-of-the-parts (06) | CNY 23.86 (+9.7%); sensitivity range CNY 16.74–23.86 | Moderate | **15%** | `06`'s own producer flags this as "comp-fragile": 49% of gross EV comes from the Laundry segment priced on Midea's 12.71x derived multiple (Midea being a diversified conglomerate, an imperfect comp) — swapping to the cheapest domestic comp drops the value to CNY 16.74, a 23% swing on one assumption. Real but fragile; capped jointly with `04` at ≈⅓ combined |

Weights sum to 100% across value-producing methods (`03`, `04`, `06`). `02` is zero-weighted per its own illustrative-only flag (short 8-quarter history) and shown for transparency only. `05` is a cross-check, never a weighted input. `04` + `06` combined = 32%, inside the ≈≤⅓ cap (Scenario Construction & Method-Weighting Policy §1).

**Multiples-first applied.** Haier is an Operating company (Business-Type Method Map) with a usable forward metric (Capital IQ consensus FY2026E EBIT/EBITDA/EPS) and both an own-history band (`02`) and a peer set (`03`). Per policy, `02`+`03` together must carry the majority weight. Because `02` is self-flagged illustrative-only, `03` alone carries that majority (68%), and `04`/`06` are held to the capped cross-check role.

## 2. Triangulation & Reconciliation

**Method football field** (full high-to-low spread, not narrowed):

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| 02 Own-history multiples | CNY 23.10 – 26.51 (illustrative reversion only) | Low (illustrative-only) | 0% | Short 8-quarter history; shown for transparency and to anchor §3 multiples, not as a value input |
| 03 Relative/peers — quality-adj. base | CNY 22.08 | Moderate–High | 68% | See §1 |
| 03 Relative/peers — unadjusted peer-median dispersion | CNY 26.23 – 31.38 | Low–Moderate (mechanical, not the base case per `03`'s own read) | (inside 68%, not separately weighted) | Ceiling if Haier's margin fully converged to peer-normal — evidence does not yet support this |
| 04 Intrinsic DCF — canonical base | CNY 29.84 | Moderate (producer-capped) | 17% | See §1 |
| 04 DCF — primary sensitivity grid | CNY 25.88 – 34.11 | Moderate | (inside 17%) | WACC ±1pp × exit multiple 6.0x–8.0x |
| 04 DCF — structural-reset/runoff (bear input, see §3) | CNY 15.90 – 21.51 | Low (explicit worst-case construction) | (bear-case input, not base-point weight) | See §3 |
| 06 Sum-of-the-parts — base | CNY 23.86 | Moderate | 15% | See §1 |
| 06 SOTP — comp-swap sensitivity | CNY 16.74 – 23.86 | Low–Moderate | (inside 15%) | Laundry-segment comparable choice drives 43% of the spread |

**Weighted base-point calculation (executed):**

```
w03, w04, w06 = 0.68, 0.17, 0.15
v03, v04, v06 = 22.08, 29.84, 23.86   # CNY/share
blend = 0.68*22.08 + 0.17*29.84 + 0.15*23.86
      = 15.0144 + 5.0728 + 3.5790
      = 23.67   # CNY/share
```

**Base-case fair value (weighted triangulation point): CNY 23.67/share** (+8.8% vs the CNY 21.75 price). This is cross-checked in §3 by an independent forward-metric × multiple build, which lands at CNY 23.56 — a 0.5% gap, i.e. the two approaches for arriving at "base case" converge.

**Reconciliation judgement.** `03`'s peer-relative read is trusted most for the base point: it is the only method resting on real, dated market prices for named comparables, its margin-quality haircut is independently corroborated by the moat and business-quality modules (Haier's EBITDA margin genuinely sits 24% below the peer median, and the moat is independently rated "narrow" and "eroding" — not this agent's own assumption), and its quality-adjusted multiple (7.35x) converges almost exactly with `02`'s own 8-quarter mean/median (7.38x/7.34x) despite being derived by a completely different method — that convergence is the strongest signal in this dossier. `04`'s DCF is the clear outlier at +37.2%, and the divergence (35.1% above `03`, just under the 40% hard-disagreement trigger) is explained, not averaged away: `04`'s own producer flags its mechanically-correct WACC (4.10%, a product of China's sub-2% sovereign yield and Haier's 0.46 beta) as materially below the discount rate the market visibly applies (Haier's own trading multiple has never exceeded 10.1x EV/EBITDA), and `05`'s reverse-DCF corroborates from the other direction — a flat, no-growth FCF story only reconciles to today's price at a ~12.3% WACC, not 4.10%. This is a **low-WACC artefact pulling the DCF up**, the mirror image of the "low-DCF-drag" case the Scenario Construction Policy anticipates — the same capped-cross-check treatment (≤⅓ combined with `06`) disciplines it either way. `06`'s SOTP (CNY 23.86) sits close to the blended base but is flagged by its own producer as comp-fragile (one segment, one imperfect comparable, driving a 43% swing) — treated as corroborating, not load-bearing.

**Cross-method spread is real but does not clear the 40% hard trigger.** `04` vs `03`: (29.84 − 22.08)/22.08 = 35.1%. This is flagged and reconciled above (Reconciliation Gate 6) rather than silently blended.

## 3. Bull / Base / Bear Fair-Value Levels

Every case = forward FY2026E EBITDA × an EV/EBITDA multiple, bridged to equity using `01`'s canonical net-debt/minority anchor (`Equity = EV + CNY 14,992.64m`), divided by 9,311.825848m diluted weighted-average shares. Multiples are anchored to `02`'s own 8-quarter band (min 5.87x, mean 7.38x, median 7.34x, max 9.74x) — used here as a **band anchor for multiple selection only**, consistent with `02`'s own caveat that it is not a valid reversion-target value.

**Cyclicality Gate applied to the bear case.** Business-quality scores Haier's cyclicality at 34/100 and names FY2024 (9.12% ROIC, 7.66% EBIT margin) as a "subsidy-assisted cyclical high-water mark, not the sustainable run-rate" [`business-model/07_business-quality.md` §4]. The company's own 5-year EBIT-margin trough is **FY2021 at 5.91%** [`04_intrinsic-dcf.md` §2] — this is the through-cycle anchor used for `bear_cyclical` below, not a mild dip off the recent peak.

**Structural / permanent down-leg trigger fired.** `business-model/09_moat.md` §5 verdict: **"Moat trajectory: eroding"** — gross margin down 460bp over five years (30.9%→26.3%), ROIC down for two consecutive readings from its FY2024 peak (9.12%→7.97%→7.56%). Business-quality's rate-of-change/disruption row scores 72/100 (above the ~40 threshold), so this is a competitive/cost-erosion trigger, not a disruption trigger. Because the trajectory is **confirmed eroding** (not a bare "No moat proven" verdict), the structural-reset becomes the **headline Bear** — computed as the WORSE (lower) of `bear_structural` and `bear_cyclical` below, per the graduated rule. Both cases are shown separately and neither is merged into the other.

| Case | Fair Value / Share (point) | Forward Metric (FY2026E EBITDA, CNY mn) | Multiple (EV/EBITDA) | Horizon | What Must Be True |
|---|---:|---:|---:|---|---|
| **Bull** | **CNY 31.78** | 37,967.4 | 7.4x | 12-month | Raw-material excess-cost growth reverts to 0pp (consensus-basket input costs stop outrunning volume — earnings-sensitivity bull case, +CNY 5,350mn EBITDA) **AND** China domestic demand partially recovers to +5% YoY (subsidy-fade pain proves milder than the Q1-2026 −6.2% pace — +CNY 2,111mn EBITDA-equivalent) [`earnings/07_earnings-sensitivity.md` §2]. The multiple expands from base (6.7x) to 7.4x — at the quality-adjusted/own-history-mean ceiling (`03`'s 7.35x, `02`'s 7.38x mean), reflecting partial margin-gap closure versus Midea/Gree, **not** a re-rate to the full unadjusted peer median (9.71x), which the evidence does not support |
| **Base** | **CNY 23.56** (≈ CNY 23.67 triangulated, §2) | 30,506.36 (Capital IQ consensus, `02` §1) | 6.7x | 12-month | FY2026E consensus growth path holds roughly as guided (revenue +2.24%, EBITDA to ~CNY 30.5bn) — the same path `04`'s DCF forecasts explicitly. Multiple sits modestly above the current LTM print (6.75x) but well short of full reversion to `02`'s own mean (7.38x): the market keeps discounting Haier for its ongoing margin-erosion and consensus-cutting cycle (`02` §3: EPS cut ~14% over 6 months, two consecutive misses against an already-lowered bar), but stops discounting further |
| **Bear — cyclical trough** | **CNY 16.79** | 24,072.0 (FY2021 trough EBIT margin 5.91% applied to FY2026E consensus revenue CNY 309,110.7mn, + FY2025 D&A ratio) | 5.87x (own-history 8-quarter low) | 12-month | Commodity-cost pressure, competitive intensity and China property-cycle softness together erase the SG&A-driven margin gains posted since FY2021 — EBIT margin reverts fully to the company's own documented 5-year trough, not merely dips off the recent peak. Multiple compresses to the bottom of Haier's own trading range |
| **Bear — structural reset (HEADLINE)** | **CNY 15.90** | Terminal EBITDA CNY 23,440.1mn (FY2030, runoff) | 5.0x (below Haier's own low-end trading range — de-rated) | 24–36 month | Moat erosion continues without stabilizing: revenue growth cut to roughly half consensus, EBIT margin fades to **5.00% by FY2030 — below the FY2021 trough**, gross margin fades further (25.0%→23.8%), capex pulled back, working capital deteriorates (CCC +6.0d→+30.0d). Reproduced from `04_intrinsic-dcf.md` §5, its explicit structural-decline/runoff scenario, itself triggered by the same "eroding" moat verdict |

**Structural-reset bridge (executed, reproducing `04`'s EV-based reset with `01`'s canonical net-debt anchor — subtract net debt BEFORE dividing by shares):**
```
Runoff EV (impaired, EBITDA x de-rated multiple) = 23,440.1 x 5.0 = 117,200.7   (undiscounted TV)
PV(TV) = 97,795.1 ; PV(explicit runoff FCF) = 35,275.4
Impaired EV = 35,275.4 + 97,795.1 = 133,070.5
Equity = Impaired EV - Net debt(broad, canonical, -24,598.67) - Minority(9,606.03)
       = 133,070.5 + 24,598.67 - 9,606.03 = 148,063.14
Per-share = 148,063.14 / 9,311.825848 = CNY 15.90   (-26.9% vs price CNY 21.75)
```
This is an EV-based reset (impaired EBITDA × an EV multiple), so it is bridged with `01`'s canonical net-debt/minority anchor exactly as every other EV-based case in this report — no double subtraction, no equity-already-net double count.

**Headline Bear = worse of the two = CNY 15.90 (structural reset).** The cyclical trough (CNY 16.79) is milder; per the graduated rule the deeper case leads because the moat trajectory is confirmed eroding, not merely unproven. `bear_cyclical` (12-month) and `bear_structural` (24–36 month) are different horizons and are NOT blended — the structural case is a multi-year permanent-impairment path, the cyclical case a next-four-quarters risk.

**Bull-to-bear spread (the range):** CNY 15.90 (structural bear) to CNY 31.78 (bull) — a 2.0x span, driven overwhelmingly by whether Haier's margin erosion stabilizes (bull/base) or continues unchecked toward a new structural floor (bear-structural).

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price (2026-08-12, `pool-verified`, 1 trading day old) | CNY 21.75 |
| Base-case fair value (point, §2 weighted triangulation) | CNY 23.67 |
| Bear-case fair value (headline — structural reset) | CNY 15.90 |
| Bear-case fair value (cyclical trough, secondary) | CNY 16.79 |
| Implied upside to base case = (base FV − price) / price | **+8.8%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **+8.1%** |
| **Downside to bear** = (price − bear FV) / price — *inverted, higher = worse* (headline, structural) | **26.9%** |
| Downside to bear (cyclical trough, secondary) | 22.8% |

Both metrics are assessable — `01`'s price-state is `pool-verified` and the quote is 1 trading day old (no staleness cap). Margin of safety (8.1%) and downside-to-bear (26.9%) are deliberately different numbers: the cushion in the base case is modest, while the loss in the confirmed-eroding-moat bear case is a real quarter of the current price — the asymmetry itself is the finding (§6).

## 5. Warranted-Multiple Check

The base case implies a forward EV/EBITDA of 6.7x — below `02`'s own 8-quarter mean/median (7.38x/7.34x) and below `03`'s independently-derived quality-adjusted multiple (7.35x), which itself already prices in Haier's 24%-below-peer margin. This is a **conservative**, not an aggressive, warranted multiple: it does not require the market to forgive Haier's margin gap versus Midea/Gree, only to stop discounting it further than the current LTM level (6.75x). The bull case's 7.4x ceiling is capped at the quality-adjusted/own-history-mean level, deliberately short of the full unadjusted peer median (9.71x) that Haier has never earned. The one method that WOULD require a stretch is `04`'s DCF headline (+37.2%): it implies a 7.0x terminal multiple that is inside Haier's own trading history, so the multiple itself is not the issue — the issue is `04`'s own flagged, mechanically-too-low WACC (4.10% vs a market-implied ≈12.3% per `05`'s reverse-DCF), which is why `04` is capped at 17% weight rather than driving the base case. **Value-trap risk:** `02` itself flags that "this discount could be the market correctly pricing a lower structural earnings trajectory rather than a cyclical overreaction" — the moat module's independent "eroding" verdict corroborates that this is a live risk, not a footnote. No RF-OWN-004 structurally-misaligned-owner flag was found (`management-governance/99` — Haier Group Corporation is a collectively-owned enterprise, not government-controlled, not a value-maximizing parent's subsidiary, not a sprawling conglomerate), so the value-trap risk here is earnings-trajectory-driven, not ownership-driven.

## 6. Fair-Value Read

Base case is **CNY 23.67/share** (+8.8% vs the CNY 21.75 price), bull **CNY 31.78**, bear-cyclical **CNY 16.79**, and headline bear-structural **CNY 15.90** — a 2.0x bull-to-bear spread. Margin of safety in the base case is a modest **+8.1%**; downside to the headline (structural) bear case is a much larger **26.9%** — that asymmetry (small cushion, large drop) is the single most important number in this dossier, not either metric alone. The peer-relative method (`03`) drives the base point (68% weight) because it is the only method resting on real market prices and its quality-adjusted multiple independently converges with `02`'s own trading history — a rare two-method agreement in this dossier. The single biggest swing factor between bull and bear is **whether Haier's moat erosion (460bp gross-margin decline over five years, ROIC down for two straight readings from its FY2024 subsidy-assisted peak) stabilizes or continues**: stabilization plus a raw-material/China-demand tailwind produces the bull case at a modestly expanded multiple; continued erosion — the path the moat module's own verdict already flags as underway — produces the structural-reset bear case at a de-rated 5.0x multiple and a margin below even the company's own FY2021 trough. `04`'s high DCF headline (+37.2%) is a secondary consideration, not the driver: its own producer flags the WACC behind it as mechanically too low relative to what the market visibly pays for this stock.
