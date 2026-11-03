# valuation Module Dossier — GOOGL

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-11-03T16:14:46Z
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

# Valuation Module — GOOGL (Synthesis)

## Abstract

GOOGL is fairly valued: the $268.28 base case is 3.84% below the pool-verified $278.99 price. The 12-month bull/base/bear levels are $378.30/$268.28/$200.74, driven mainly by forward P/E, while the producer-endpoint football field spans $95.95–$360.09. The current price requires 11.78% annual normalized FCFF growth for six years from a $164.9bn post-build base; that is a stretch against 2.68% reported-FCF growth in FY2023–FY2025. Margin of safety is negative 3.99%, and the bear implies 28.05% downside; a separate 24–36-month structural-reset floor is $73.63. The valuation offers no base-case cushion, and method disagreement limits confidence.

## 1. Valuation Verdict

- **Verdict:** **Fairly valued** — the $268.28 base-case fair value is 3.84% below the $278.99 price, within the defined ±10% band. [Valuation 07 Scenario & Fair Value — GOOGL, §§3–6]
- **Base-case fair value (point, per share):** **$268.28** for GOOGL Class A on Nasdaq, in USD. [Valuation 07 Scenario & Fair Value — GOOGL, §3]
- **Current price:** **$278.99 on 2026-11-03; price-state `pool-verified`.** [Valuation 01 Price & Capital Structure — GOOGL, §§1 and 7]
- **Bull / Base / Bear fair-value levels (points):** **$378.30 / $268.28 / $200.74**, each on a 12-month horizon to November 2027. The separate **$73.63** figure is a 24–36-month structural-reset sensitivity, not the 12-month bear. [Valuation 07 Scenario & Fair Value — GOOGL, §§3 and 6]
- **Cross-method dispersion (football field, low–high):** primary method points **$117.57–$305.19**, a 159.6% high-to-low spread; the broader producer-endpoint field is **$95.95–$360.09**. [Valuation 07 Scenario & Fair Value — GOOGL, §2]
- **Valuation attractiveness /100 (higher = cheaper): 42** — price is 3.84% above base fair value, and the forward-P/E discount is not enough to offset the cash-conversion risk.
- **Margin of safety /100 (higher = better): 35** — margin of safety is **(3.99%)**, so there is no base-case cushion. [Valuation 07 Scenario & Fair Value — GOOGL, §4]
- **Valuation confidence /100: 55** — full inputs and four value-producing methods help, but the 159.6% primary-method spread applies the hard cap. [Valuation 07 Scenario & Fair Value — GOOGL, §§1–2]
- **Downside risk /100 (higher = worse; inverted): 68** — the 12-month bear is **$200.74**, or **28.05%** below price; the $73.63 structural-reset sensitivity is a separate 24–36-month avoid-ruin floor. [Valuation 07 Scenario & Fair Value — GOOGL, §§3–4]
- **Data quality /100: 88** — the pool has a current price, filings, cash flow, consensus, peers, multiple history, and segment data, but peer-cycle history and forward segment forecasts are missing. [Valuation 00 Data Triage — GOOGL, §§3–6; Valuation 03 Relative Valuation — GOOGL, §6; Valuation 06 SOTP — GOOGL, §2]
- **Overall usefulness /100: 80** — the module supplies reproducible levels and a clear expectations test, while exposing rather than hiding the large method gap.
- **Dominant valuation method:** Forward P/E on NTM GAAP EPS; own-history and peer P/E carry 75% of the base because Alphabet is an operating company with usable forward estimates, but the two market-based lenses are not independent. [Valuation 07 Scenario & Fair Value — GOOGL, §§1–2]
- **What's priced in:** At $278.99, the reverse-DCF requires **11.78% annual FCFF growth for six years** from the normalized $164.932bn post-build base at a 10.3705% WACC and 2.5% terminal growth; the specialist labels this a stretch. [Valuation 05 Reverse DCF — GOOGL, §§1–5]
- **Biggest valuation risk:** The AI and Cloud build may not turn NTM earnings into post-build cash flow; that gap is why the DCF is $117.57 while the multiple-led values are near $300. [Valuation 04 Intrinsic DCF — GOOGL, §§5–8; Valuation 07 Scenario & Fair Value — GOOGL, §2]

## 1A. Module Disconfirmation

- **Strongest bear point:** The FCFF DCF gives **$117.57**, 57.9% below price, and 80.4% of its EV comes from terminal value even after capex is assumed to fall from 40.3% to 18.0% of revenue by FY2031. [Valuation 04 Intrinsic DCF — GOOGL, §§2 and 5–8]
- **Strongest bull point:** GOOGL is 17.7% below the selected peers on NTM P/E while its NTM revenue growth is 27.3% versus the peers' 19.6% median; the own-history and peer P/E points are $299.76 and $305.19. [Valuation 03 Relative Valuation — GOOGL, §§3–5; Valuation 02 Multiples — GOOGL, §4]
- **Single killer risk:** The current price already requires 11.78% normalized FCFF growth for six years; failure to normalize capex and recover cash conversion would invalidate the forward-P/E-led base. [Valuation 05 Reverse DCF — GOOGL, §§2–5]
- **Disconfirming evidence already visible:** The $299.76 own-history and $305.19 peer P/E points sit above price, but they share forward vendor data and market anchors; against them, the $241.99 SOTP and $117.57 DCF are both below price. [Valuation 07 Scenario & Fair Value — GOOGL, §2]

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | **Sufficient; all five methods can run.** | All 27 raw sources extracted successfully, and current price, cash flow, consensus, peers, history, and segment data are available. [Valuation 00 Data Triage — GOOGL, §§3–6] |
| price-and-capital-structure | **Pool-verified $278.99 anchor for GOOGL Class A.** | Canonical EV is $3,523.015bn using $73.489bn strict net debt, $6.900bn NCI, $18.023bn preferred equity, and 12.368bn diluted valuation shares. [Valuation 01 Price & Capital Structure — GOOGL, §§4–7] |
| multiples-own-history | **Conditional own-history value of $299.76.** | GOOGL's 20.24x NTM P/E is 7.5% below the 21.87x five-year median; P/B gives $353.46–$360.09 but is only a secondary cross-check. [Valuation 02 Multiples — GOOGL, §§2–6] |
| relative-valuation-peers | **P/E-led peer value of $305.19, with a conflicted relative read.** | The internal field is $210.90–$305.19: P/E shows a 17.7% discount, while NTM EV/revenue and EV/EBITDA show 3.7% and 10.6% premiums. [Valuation 03 Relative Valuation — GOOGL, §§3–7] |
| intrinsic-dcf | **Low-confidence intrinsic value of $117.57.** | The grid is $95.95–$149.41, terminal value is 80.4% of EV, and the separate 24–36-month structural-reset sensitivity is $73.63. [Valuation 04 Intrinsic DCF — GOOGL, §§5–8] |
| reverse-dcf | **The current price embeds a stretch cash-flow path.** | Price requires 11.78% normalized FCFF CAGR for six years versus 2.68% reported-FCF CAGR in FY2023–FY2025; the 6.32% dual-solve discount rate fails the equity-risk-premium floor. [Valuation 05 Reverse DCF — GOOGL, §§2–5] |
| sum-of-the-parts | **SOTP value of $241.99.** | Inferred NTM segment revenue and capitalized Alphabet-level/Other Bets costs create a $201–$297 sensitivity and leave base SOTP 13.3% below price. [Valuation 06 SOTP — GOOGL, §§2–5] |
| scenario-and-fair-value | **Fair-value levels of $378.30 bull / $268.28 base / $200.74 bear.** | Margin of safety is (3.99%), downside to the 12-month bear is 28.05%, and the primary method-point spread is 159.6%. [Valuation 07 Scenario & Fair Value — GOOGL, §§2–6] |

## 3. Reconciliation

The full field exceeds 40%: the four primary value-producing points span **$117.57–$305.19**, or 159.6% relative to the low, while their disclosed sensitivity endpoints span **$95.95–$360.09**. The 55/100 confidence cap therefore applies; explaining the gap does not waive it. [Valuation 07 Scenario & Fair Value — GOOGL, §2]

- **Own history versus peers:** $299.76 and $305.19 appear close, but they are not independent corroboration. Both use Capital IQ forward data and market-set reference multiples, and the peer anchor has no admitted sector-multiple history. [Valuation 07 Scenario & Fair Value — GOOGL, §2]
- **Multiples versus DCF:** The multiple lenses capitalize NTM earnings, whereas the **$117.57** DCF charges the FY2026 cash-flow trough and assumes a long capex normalization. The DCF's 80.4% terminal-value share makes it a warning and cross-check, not the dominant method. [Valuation 04 Intrinsic DCF — GOOGL, §§4–8]
- **SOTP versus the other methods:** The **$241.99** SOTP sits between the DCF and P/E points because it values Cloud separately but deducts $411.5bn of capitalized Alphabet-level and Other Bets costs; its forward segment revenue split is inferred. [Valuation 06 SOTP — GOOGL, §§2–5]
- **Reconciled view:** The **$268.28** base uses 45% own-history, 30% peers, 15% DCF, and 10% SOTP. Forward P/E remains dominant for this operating company, while the cash-flow and segment methods keep the base below the multiples-only points. [Valuation 07 Scenario & Fair Value — GOOGL, §§1–3]

**Sector Cycle Reality Test:** `02` found no cycle flag: its broad Nasdaq-100 proxy's P/E fell 7.7% from December 2021 to September 2026, below the roughly 25% trigger, though the web-sourced proxy is indicative and imperfect. `03` marked the peer-cycle check **Not assessable** because no 3–5-year selected-peer multiple history was in the pool. There is therefore no same-direction `RF-VAL-001`/`RF-VAL-002` compounding trigger, but the peer median remains an unproven stable anchor. [Valuation 02 Multiples — GOOGL, §5; Valuation 03 Relative Valuation — GOOGL, §6]

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N | MoS, downside-to-bear (Downside-risk score), observed up/down, attractiveness + confidence | Not applied; $278.99 is pool-verified as of 2026-11-03. |
| No consensus / forward estimates | N | Valuation confidence | Not applied; CIQ NTM/FY estimates are available. |
| No peer data | N | Overall usefulness | Not applied; a dated comparable-company export is available. |
| Only one valuation method usable | N | Valuation confidence | Not applied; own history, peers, DCF, and SOTP produced values. |
| No cash flow AND DCF is only method | N | Valuation confidence | Not applied; cash-flow statements exist and DCF is not the only method. |
| SOTP not possible for multi-segment | N | Overall usefulness | Not applied; SOTP produced $241.99. |
| Full high-to-low field of valid value-producing methods exceeds 40% | **Y** | Valuation confidence | **max 55; final 55**. Primary points span $117.57–$305.19, or 159.6%. |
| Terminal value >75% of DCF EV | **Y** | Valuation confidence | **max 60**; DCF terminal value is 80.4%. The stricter 55 dispersion cap controls. |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | N | Valuation attractiveness | Not applied; founder voting control is a separate governance issue, but the specified controller-objective conflict was not evidenced and RF-OWN-004 did not fire. [Management-Governance 04 Ownership & Insider Behavior — GOOGL, §4] |
| Sector Cycle Reality Test flags `02` and/or `03` cycle-elevated/depressed, unreconciled | N | Valuation confidence | Not applied; `02` found no flag and `03` was Not assessable, so no same-direction compounding trigger fired. |

## 5. Fair-Value Summary

The 12-month fair-value levels are **$378.30 bull, $268.28 base, and $200.74 bear**, and the base is driven mainly by forward P/E through a 45% own-history and 30% peer weight. [Valuation 07 Scenario & Fair Value — GOOGL, §§1–3] At $278.99, the market requires 11.78% annual normalized FCFF growth for six years from the $164.932bn post-build base; the 2.68% FY2023–FY2025 reported-FCF CAGR and still-unproven post-build conversion make that achievable only as a stretch. [Valuation 05 Reverse DCF — GOOGL, §§2–5] Margin of safety is **(3.99%)**, while downside to the **$200.74** 12-month bear is **28.05%**; the separate **$73.63** figure is a 24–36-month structural-reset sensitivity, not the headline bear. [Valuation 07 Scenario & Fair Value — GOOGL, §§3–4] The 17.7% NTM P/E discount to selected peers is not proven genuine value because the stock is already at premiums on NTM EV/revenue and EV/EBITDA, and the DCF/SOTP values sit below price. [Valuation 03 Relative Valuation — GOOGL, §§3–7] RF-OWN-004 did not fire, so owner misalignment is not the value-trap mechanism; the live risk is that an earnings multiple overstates value if AI investment does not turn into cash flow. [Management-Governance 04 Ownership & Insider Behavior — GOOGL, §4; Valuation 04 Intrinsic DCF — GOOGL, §8]

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| **Fairly valued — $268.28 base versus $278.99 price** | A price below $268.28 without forward-EPS erosion, or evidence that FY2031 FCFF reaches at least the modeled $164.932bn and vendor-defined ROIC recovers above FY2025's 19.3%, would make the $299.76–$305.19 multiple-led points more credible. [Valuation 04 Intrinsic DCF — GOOGL, §4; Valuation 05 Reverse DCF — GOOGL, §3] | A 15% NTM EPS shortfall to $11.65 with a 17.23x multiple gives $200.74; ROIC falling below the current 15.6% or failure of capex normalization would strengthen the $117.57 DCF warning. [Valuation 07 Scenario & Fair Value — GOOGL, §3; Valuation 05 Reverse DCF — GOOGL, §3] | **Single highest-value request:** a source-bound FY2027–FY2031 post-build cash-flow bridge tying revenue and EBIT to D&A, capex, and FCFF. |

## 7. Note To The Final Synthesizer

- Use **$378.30 bull / $268.28 base / $200.74 bear** as the 12-month fair-value levels; forward P/E is dominant through the 45% own-history and 30% peer weights. Keep the **$73.63** 24–36-month structural-reset sensitivity separate from the 12-month set. [Valuation 07 Scenario & Fair Value — GOOGL, §§1–3]
- At $278.99, price implies **11.78% annual normalized FCFF growth for six years** from a $164.932bn post-build base at 10.3705% WACC and 2.5% terminal growth; the reverse-DCF calls this a stretch. [Valuation 05 Reverse DCF — GOOGL, §§1–5]
- Margin of safety is **(3.99%)**; downside to the **$200.74** 12-month bear is **28.05%**. The separate $73.63 structural-reset sensitivity has a 24–36-month horizon and must not be blended as a same-date target without naming that horizon mismatch. [Valuation 07 Scenario & Fair Value — GOOGL, §§3–4]
- This is not proven value: the peer NTM P/E discount is offset by EV-multiple premiums, a $241.99 SOTP, and a $117.57 DCF. RF-OWN-004 did not fire; the value-trap risk is failed cash conversion, not a proven structurally misaligned controller. [Valuation 03 Relative Valuation — GOOGL, §§3–7; Management-Governance 04 Ownership & Insider Behavior — GOOGL, §4]
- Trust forward P/E most for this operating company, but do not count own history and peer P/E as independent confirmation. Discount the terminal-dominated DCF and inference-heavy SOTP as cross-checks without discarding their warning. [Valuation 07 Scenario & Fair Value — GOOGL, §2]
- Partial-data caps did not apply. The **159.6% full primary-method spread** caps valuation confidence at 55, and the DCF's 80.4% terminal share separately caps it at 60; the stricter 55 cap controls. [Valuation 07 Scenario & Fair Value — GOOGL, §2; Valuation 04 Intrinsic DCF — GOOGL, §5]
- Biggest missing data point: a source-bound FY2027–FY2031 post-build cash-flow bridge tying revenue and EBIT to D&A, capex, and FCFF.
- **Explicit handoff:** the master synthesizer's “Valuation and Peer Mispricing” section should defer to this synthesis. These bull/base/bear fair-value **levels** are the inputs to the master's probability-weighted scenario model; the master assigns probabilities, not this module.

## 8. Simple Summary

- GOOGL is fairly valued on this work: the **$268.28** base is **3.84% below** the **$278.99** price.
- The 12-month levels are **$378.30 bull / $268.28 base / $200.74 bear**.
- The price requires **11.78% annual normalized FCFF growth for six years** from the post-build base; that is a stretch against 2.68% FY2023–FY2025 reported-FCF growth.
- Downside to the **$200.74** 12-month bear is **28.05%**; **$73.63** is a separate 24–36-month structural-reset sensitivity.
- Forward P/E matters most, but own-history and peer P/E are not independent evidence.
- The value-trap risk is failed conversion of AI investment into cash flow, not RF-OWN-004 owner misalignment.
- A current price was available and pool-verified: **$278.99 on 2026-11-03**.
- The module is useful for the master, but the **159.6%** primary-method spread limits confidence and must remain visible.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — GOOGL

The frozen evidence binding was validated against immutable generation `b83f382cc1013f6f74e77e7e630f56fff0ef9fb8eda70142f4d09e40a1af0ae0`. The extraction manifest reports all 27 raw sources as `ok`; there are no failed, fallback-text, missing-dependency, or Drive-pointer sources. The inventory repeats every workbook tab as its own row (72 rows total). All raw files have the same 2026-11-03 21:13 sync timestamp, so that timestamp is shown only as metadata and is not used to judge document recency. Periods below are taken from the document contents where available. [Immutable extraction manifest, generation `b83f382…af0ae0`]

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| Alphabet Inc NasdaqGS GOOGL Auditors.xls — Auditors [48,128 B] | Tier-5 vendor governance workbook | Current period not stated in tab | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Board Members.xls — Board Members [94,720 B] | Tier-5 vendor governance workbook | Current period not stated in tab | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Summary [240,038 B] | Tier-5 credit-health workbook | LTM / Q3 Sep-30-2026 | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Financials [240,038 B] | Tier-5 credit-health workbook | LTM / Q3 Sep-30-2026 | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Operational Metrics Charts [240,038 B] | Tier-5 credit-health workbook | LTM / Q3 Sep-30-2026 | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Solvency Metrics Charts [240,038 B] | Tier-5 credit-health workbook | LTM / Q3 Sep-30-2026 | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Liquidity Metrics Charts [240,038 B] | Tier-5 credit-health workbook | LTM / Q3 Sep-30-2026 | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Disclaimer [240,038 B] | Vendor disclosure tab | Current period not stated | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Customers.rtf [2,609,920 B] | Tier-5 supplier/customer export | Recently disclosed relationships; two-year scope | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Events Calendar.xls — Events Calendar [30,208 B] | Tier-5 event calendar | Upcoming events; dates in tab | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Key Stats [305,162 B] | Tier-5 annual financials workbook | FY Dec-31; latest FY2025 | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Income Statement [305,162 B] | Tier-5 annual financials workbook | FY Dec-31; latest FY2025 | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Balance Sheet [305,162 B] | Tier-5 annual financials workbook | FY Dec-31; latest FY2025 | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Cash Flow [305,162 B] | Tier-5 annual financials workbook | FY Dec-31; latest FY2025 | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Multiples [305,162 B] | Tier-5 annual multiples workbook | FY Dec-31 history; latest FY2025 | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Historical Capitalization [305,162 B] | Tier-5 market-cap history workbook | FY Dec-31 history; latest FY2025 | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Capital Structure Summary [305,162 B] | Tier-5 capital-structure workbook | FY Dec-31; latest FY2025 | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Capital Structure Details [305,162 B] | Tier-5 capital-structure workbook | FY Dec-31; latest FY2025 | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Ratios [305,162 B] | Tier-5 annual ratio workbook | FY Dec-31; latest FY2025 | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Supplemental [305,162 B] | Tier-5 annual financials workbook | FY Dec-31; latest FY2025 | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Industry Specific [305,162 B] | Tier-5 annual financials workbook | FY Dec-31; latest FY2025 | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Pension OPEB [305,162 B] | Tier-5 annual financials workbook | FY Dec-31; latest FY2025 | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Segments [305,162 B] | Tier-5 annual segment workbook | FY Dec-31; latest FY2025 | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Key Stats [501,258 B] | Tier-5 quarterly financials workbook | Q3 Sep-30-2026 latest | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Income Statement [501,258 B] | Tier-5 quarterly financials workbook | Q3 Sep-30-2026 latest | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Balance Sheet [501,258 B] | Tier-5 quarterly financials workbook | Q3 Sep-30-2026 latest | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Cash Flow [501,258 B] | Tier-5 quarterly financials workbook | Q3 Sep-30-2026 latest | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Multiples [501,258 B] | Tier-5 quarterly multiples workbook | Q3 Sep-30-2026 latest | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Historical Capitalization [501,258 B] | Tier-5 market-cap history workbook | Q3 Sep-30-2026 latest | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Capital Structure Summary [501,258 B] | Tier-5 capital-structure workbook | Q3 Sep-30-2026 latest | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Capital Structure Details [501,258 B] | Tier-5 capital-structure workbook | Q3 Sep-30-2026 latest | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Ratios [501,258 B] | Tier-5 quarterly ratio workbook | Q3 Sep-30-2026 latest | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Supplemental [501,258 B] | Tier-5 quarterly financials workbook | Q3 Sep-30-2026 latest | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Industry Specific [501,258 B] | Tier-5 quarterly financials workbook | Q3 Sep-30-2026 latest | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Pension OPEB [501,258 B] | Tier-5 quarterly financials workbook | Q3 Sep-30-2026 latest | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Segments [501,258 B] | Tier-5 quarterly segment workbook | Q3 Sep-30-2026 latest | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet Inc NasdaqGS GOOGL Key Developments.xls — Key Developments [1,078,272 B] | Tier-5 corporate-events workbook | Historical events through current export | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Professionals.xls — Professionals [76,288 B] | Tier-5 vendor profile workbook | Current period not stated in tab | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Public Company Profile.rtf [283,225 B] | Tier-5 company profile | Current company description | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet Inc NasdaqGS GOOGL Public Ownership History.xls — History [951,808 B] | Tier-5 ownership-history workbook | Latest dated holdings Jun-30-2026 | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Public Ownership Insider Trading.xls — Insider Trading [7,456,256 B] | Tier-5 insider-trading workbook | Through Oct-30-2026 | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Public Ownership Summary.rtf [326,346 B] | Tier-5 ownership summary | Current ownership snapshot | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Strategic Alliances.xls — Strategic Alliances [547,328 B] | Tier-5 relationships workbook | Current/historical disclosed alliances | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc NasdaqGS GOOGL Suppliers.rtf [2,343,546 B] | Tier-5 supplier/customer export | Recently disclosed relationships; two-year scope | 2026-11-03 21:13 sync (ignored) | Low |
| Alphabet Inc., Q2 2026 Earnings Call, Jul 22, 2026.rtf [277,504 B] | Tier-6 earnings transcript | Q2 2026; Jul-22-2026 | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet Inc., Q3 2026 Earnings Call, Oct 28, 2026.rtf [297,984 B] | Tier-6 earnings transcript | Q3 2026; Oct-28-2026 | 2026-11-03 21:13 sync (ignored) | Medium |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Consensus [9,437,632 B] | Tier-5 consensus-estimates workbook | FY2026, FY2027–FY2032; FY2026 release Feb-02-2027 | 2026-11-03 21:13 sync (ignored) | High |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Recent Changes [9,437,632 B] | Tier-5 consensus-estimates workbook | Current fiscal-year estimate changes | 2026-11-03 21:13 sync (ignored) | Medium |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Guidance [9,437,632 B] | Tier-5 guidance/estimates workbook | Current FY2026 | 2026-11-03 21:13 sync (ignored) | Medium |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Multiples [9,437,632 B] | Tier-5 forward-multiples workbook | NTM; FY2026–FY2032 | 2026-11-03 21:13 sync (ignored) | High |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Surprise [9,437,632 B] | Tier-5 surprise-history workbook | Historical and current FY estimates | 2026-11-03 21:13 sync (ignored) | Medium |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Trends [9,437,632 B] | Tier-5 estimates-trends workbook | Current FY2026 and forward periods | 2026-11-03 21:13 sync (ignored) | Medium |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Revisions [9,437,632 B] | Tier-5 estimate-revisions workbook | Current FY2026 and forward periods | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet_Inc-Annual_Report_2024.pdf [1,340,363 B] | Tier-1 audited annual filing | FY ended Dec-31-2024 | 2026-11-03 21:13 sync (ignored) | Medium |
| Alphabet_Inc-Annual_Report_2025.pdf [1,245,502 B] | Tier-1 audited annual filing | FY ended Dec-31-2025 | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc [3,285,053 B] | Tier-1 audited annual filing | FY ended Dec-31-2025; filed Feb-05-2026 | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc [2,652,960 B] | Tier-2 quarterly filing | Q3 and nine months ended Sep-30-2026; filed Oct-29-2026 | 2026-11-03 21:13 sync (ignored) | High |
| Alphabet_Inc_-_Form_DEFA14A(Jun-05-2026).doc [246,546 B] | Tier-4 proxy/governance disclosure | Jun-05-2026 | 2026-11-03 21:13 sync (ignored) | Low |
| Company Comparable Analysis Alphabet Inc.xls — Financial Data [150,022 B] | Tier-5 comparable-company workbook | As of Nov-03-2026; LTM Sep-30-2026 | 2026-11-03 21:13 sync (ignored) | High |
| Company Comparable Analysis Alphabet Inc.xls — Trading Multiples [150,022 B] | Tier-5 comparable-company workbook | As of Nov-03-2026; LTM/NTM | 2026-11-03 21:13 sync (ignored) | High |
| Company Comparable Analysis Alphabet Inc.xls — Operating Statistics [150,022 B] | Tier-5 comparable-company workbook | As of Nov-03-2026 | 2026-11-03 21:13 sync (ignored) | Medium |
| Company Comparable Analysis Alphabet Inc.xls — Business Description [150,022 B] | Tier-5 comparable-company workbook | As of Nov-03-2026 | 2026-11-03 21:13 sync (ignored) | Medium |
| Company Comparable Analysis Alphabet Inc.xls — Implied Valuation [150,022 B] | Tier-5 comparable-company workbook | As of Nov-03-2026; LTM/NTM | 2026-11-03 21:13 sync (ignored) | High |
| Company Comparable Analysis Alphabet Inc.xls — Valuation Chart [150,022 B] | Tier-5 comparable-company workbook | As of Nov-03-2026 | 2026-11-03 21:13 sync (ignored) | Medium |
| Company Comparable Analysis Alphabet Inc.xls — Credit Health Panel [150,022 B] | Tier-5 comparable-company workbook | As of Nov-03-2026 | 2026-11-03 21:13 sync (ignored) | Medium |
| Company Comparable Analysis Alphabet Inc.xls — Disclaimer [150,022 B] | Vendor disclosure tab | As of Nov-03-2026 | 2026-11-03 21:13 sync (ignored) | Low |
| ICEGATEPayment_007000BEINDEL40211471233439453.pdf [16,825 B] | Other document | Valuation period not identified | 2026-11-03 21:13 sync (ignored) | Low |
| Price_Charting Excel Export - Nov 3rd 2026 2_23_42 pm.xls — Pane 1 [188,416 B] | Tier-5 price-history workbook | Nov-03-2021 to Nov-02-2026; latest close Nov-02-2026 | 2026-11-03 21:13 sync (ignored) | High |
| Price_Charting Excel Export - Nov 3rd 2026 2_23_42 pm.xls — Raw [188,416 B] | Price-history workbook, empty tab (0×0) | No data | 2026-11-03 21:13 sync (ignored) | Low — does not affect usable Pane 1 |
| Price_Charting Excel Export - Nov 3rd 2026 2_23_42 pm.xls — Attributions [188,416 B] | Price-source attribution tab | Export dated Nov-03-2026 | 2026-11-03 21:13 sync (ignored) | Low |
| Short_Interest_Charting Excel Export Nov-03-2026 3_45 AM.xls — Chart 1 with Data [102,400 B] | Tier-5 short-interest workbook | Export dated Nov-03-2026 | 2026-11-03 21:13 sync (ignored) | Low |
| Short_Interest_Charting Excel Export Nov-03-2026 3_45 AM.xls — Attributions [102,400 B] | Short-interest attribution tab | Export dated Nov-03-2026 | 2026-11-03 21:13 sync (ignored) | Low |

The `Customers` and `Suppliers` exports are a tier-5 relationship graph, not filings. Their declared scope is recently disclosed relationships within the last two years and current subsidiaries; the graph identifies 14 likely-group rows, which must not be treated as arm’s-length counterparties. They are not valuation-method inputs for this triage. [Capital IQ Suppliers/Customers relationship graph, immutable generation `b83f382…af0ae0`]

No `data/GOOGL/external/` directory or external-research documents are in the frozen pool.

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States / NasdaqGS:GOOGL | [FY2025 Form 10-K, cover; Capital IQ Estimates Consensus, FY2026] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | [FY2025 Form 10-K, cover; Q3 2026 Form 10-Q, cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | [Capital IQ Estimates Consensus, header] |
| Reporting currency (and scale, e.g. INR crore) | USD; financial workbooks report USD millions except per-share data | [Capital IQ Quarterly Financials, Income Statement header; Capital IQ Comps Financial Data, 2026-11-03] |
| Fiscal-year end | December 31 | [FY2025 Form 10-K, cover] |
| Document language(s) | English | [FY2025 Form 10-K; Q3 2026 Form 10-Q; Capital IQ exports] |

Downstream agents should therefore use US SEC local equivalents: the 10-K for the audited annual filing and the 10-Q for interim financials. The next standard interim result is a standalone three-month US quarter; the available latest 10-Q also reports the nine-month cumulative period. [Q3 2026 Form 10-Q, cover]

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc | FY ended Dec-31-2025; filed Feb-05-2026 | 10.1 from period end |
| Quarterly filing | Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc | Q3 / nine months ended Sep-30-2026; filed Oct-29-2026 | 1.1 from period end |
| Capital structure / balance sheet | Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc; Financials_Quarterly — Balance Sheet / Capital Structure Summary | Sep-30-2026 | 1.1 |
| Consensus / estimate export | AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Consensus | FY2026; FY2026 earnings release shown as Feb-02-2027 | As-of date not printed in tab |
| Multiples export | Company Comparable Analysis Alphabet Inc.xls — Trading Multiples; EstimatesReport — Multiples | As of Nov-03-2026; LTM / NTM | 0.0 |
| Peer / comps export | Company Comparable Analysis Alphabet Inc.xls — Financial Data / Trading Multiples | As of Nov-03-2026 | 0.0 |
| Current price (IBKR / Capital IQ) | Company Comparable Analysis Alphabet Inc.xls — Financial Data; Price_Charting — Pane 1 | CIQ as of Nov-03-2026; matching latest closing price in chart Nov-02-2026 | 0.0–0.1 |
| Cash flow statement | Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc; Financials_Quarterly — Cash Flow | Q3 / nine months ended Sep-30-2026 | 1.1 |
| Segment data | Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc; Financials_Quarterly — Segments | Q3 / nine months ended Sep-30-2026 | 1.1 |

The deterministic CIQ sidecar confirms that its present current-price read is USD 278.99, sourced to the Comps Financial Data subject row as of 2026-11-03; this matches the price-chart’s 2026-11-02 close. Its present shares-outstanding read is 12,294 million. That is the authoritative vendor read for those workbooks, while the later capital-structure agent must use the 10-Q for the filing-based debt and cash bridge. [CIQ facts sidecar, `current_price` and `shares_outstanding_m`, source refs to CIQ Comps Financial Data, 2026-11-03; Price Charting Pane 1, 2026-11-02]

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | CIQ Comps Financial Data as of Nov-03-2026; price chart latest close Nov-02-2026 | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | Q3 2026 Form 10-Q, Earnings per Share; CIQ Comps Financial Data shares outstanding as of Nov-03-2026 | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y | Q3 2026 Form 10-Q, Earnings per Share: RSUs and other contingent shares under treasury-stock method; mandatory convertibles under if-converted method | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y — Operating | FY2025 Form 10-K, Item 1; Q3 2026 Form 10-Q, segment disclosure | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | Y | Q3 2026 Form 10-Q, balance-sheet and debt notes; CIQ Quarterly Financials / Comps Financial Data | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | Q3 2026 Form 10-Q; CIQ Quarterly Financials — Income Statement | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Q3 2026 Form 10-Q, Statements of Cash Flows; CIQ Quarterly Financials — Cash Flow | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | Capital IQ EstimatesReport — Consensus, Guidance, Multiples, Trends, Revisions | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | CIQ Annual / Quarterly Financials — Multiples and Historical Capitalization; Price Charting — Pane 1 | Own-history re-rating read |
| Peer / comps data | Y | Capital IQ Company Comparable Analysis — Financial Data, Trading Multiples, Implied Valuation | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y | Q3 2026 Form 10-Q, segment disclosure; CIQ Quarterly Financials — Segments | Sum-of-the-parts |
| Dividend / buyback data | Y | Q3 2026 Form 10-Q, equity and earnings-per-share disclosures | Shareholder-yield read |

The share-count sources must not be silently conflated: the CIQ 12,294 million is a current shares-outstanding read for the price bridge, while the valuation agents should take their fully diluted per-share count from the 10-Q’s diluted-EPS disclosure and reconcile the two bases. [CIQ facts sidecar, `shares_outstanding_m`, 2026-11-03; Q3 2026 Form 10-Q, Earnings per Share]

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

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N | 01, 05, 07, 99 | None — pool-verified CIQ price exists as of Nov-03-2026 |
| No consensus / forward estimates | N | 02, 03, 04, 05 | None — Capital IQ estimates and forward multiples are present |
| No peer data | N | 03, 06 | None — comparable-company financial and multiple tabs are present |
| No segment-level data | N | 06 | None — Q3 2026 filing and CIQ segment tabs are present |
| No balance sheet / capital structure | N | 01, 04, 06 | None — Q3 2026 filing and CIQ capital-structure tabs are present |
| No cash flow statement | N | 04 | None — Q3 2026 filing and CIQ cash-flow tab are present |

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Historical price/capitalization and LTM/FY multiple series are present. |
| Peer relative valuation | Y | None | A dated 11-company Capital IQ comparable set and LTM/NTM operating data are present; the peer-selection agent must still assess economic comparability. |
| Intrinsic DCF (Operating FCFF) | Y | None | Operating-company track, cash-flow base, capital structure, and consensus/forward inputs are present. |
| Reverse DCF | Y | None | Pool-verified current price, shares, EV inputs, and forward inputs are present. |
| SOTP | Y | None | Google Services, Google Cloud, and Other Bets segment disclosures are present, together with comparables; segment-specific multiple choices remain a later-agent judgment. |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a usable income-statement and cash-flow base, latest balance-sheet/capital-structure data, a pool-verified current price, consensus estimates, historical multiples, a dated peer-comps export, and segment disclosures, so at least two valuation methods can be independently built.
- **Methods that can run:** own-history multiples; peer relative valuation; intrinsic DCF; reverse-DCF; SOTP.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — GOOGL

Alphabet reports under U.S. GAAP and in USD. Amounts below are USD millions unless stated otherwise. This is an operating company; the enterprise-value (EV) bridge is therefore a valuation input, not a valuation conclusion.

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| **Decision line** (ticker · venue · currency) | **GOOGL · Nasdaq Global Select Market · USD** | [Q3 FY2026 Form 10-Q, cover] | 2026-11-03 |
| Current price | **$278.99** | [Capital IQ Comps → Financial Data, subject row; deterministic `ciq_facts.json` `current_price` read] | 2026-11-03 |
| Currency | USD | [Capital IQ Comps → Financial Data, subject row] | 2026-11-03 |
| Price basis | Vendor “Day Close Price Latest”; the price-chart export also shows $278.99 for its latest 2026-11-02 close | [Capital IQ Comps → Financial Data, subject row; Price Charting → Pane 1] | 2026-11-03 / 2026-11-02 |

The decision line is GOOGL, the Class A common stock named in this run. It is the ticker supplied for the analysis and has a pool-verified USD quote. The deterministic sidecar's authoritative read of the Comps workbook is $278.99 and 12,294 million shares outstanding; the independently extracted price chart corroborates the prior trading day's $278.99 close. [Capital IQ Comps → Financial Data, subject row; deterministic `ciq_facts.json` `current_price` and `shares_outstanding_m`; Price Charting → Pane 1]

The quote's stated as-of date is the run date, so its age is 0 trading days. No refresh is required and no price-staleness cap applies. `Price-state: pool-verified`.

| Listed line | Ticker · venue | Currency | Price | As-of | Premium / (discount) vs decision line, same-currency | Notes for a holder of this line |
|---|---|---:|---:|---|---:|---|
| Class C capital stock | GOOG · Nasdaq Global Select Market | USD | $278.04 | 2026-11-03 | (0.34%) | The common-stock economic rights are the same as Class A except voting rights; the price is $0.95 below GOOGL. [Capital IQ Comps → Financial Data, subject row; Q3 FY2026 Form 10-Q, Note 12 (Net Income per Common Share)] |
| Series A mandatory-convertible preferred depositary share | GOOGM · Nasdaq Global Select Market | USD | Not available in pool | Not available | Not comparable | Each depositary share is 1/20 of a Series A 6.25% mandatory-convertible preferred share; it is not one Class A common share. [Q3 FY2026 Form 10-Q, cover; Note 11 (Stockholders' Equity)] |
| Series B mandatory-convertible preferred depositary share | GOOGN · Nasdaq Global Select Market | USD | Not available in pool | Not available | Not comparable | Each depositary share is 1/20 of a Series B 6.25% mandatory-convertible preferred share; it is not one Class C common share. [Q3 FY2026 Form 10-Q, cover; Note 11 (Stockholders' Equity)] |

Class B common stock is included in Alphabet's issued-share count but is not a separately quoted decision line in the reviewed pool. It has 827 million shares outstanding as of 21 October 2026. [Q3 FY2026 Form 10-Q, cover]

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | **12,294m** — 5,888m Class A + 827m Class B + 5,579m Class C | [Q3 FY2026 Form 10-Q, cover, 2026-10-21; deterministic `ciq_facts.json` `shares_outstanding_m`, source ref: CIQ Comps → Financial Data] |
| Diluted weighted-average shares (period) | **12,368m** for Q3 FY2026 | [Q3 FY2026 Form 10-Q, Note 12 (Net Income per Common Share)] |
| Options/RSUs count (if disclosed) | **112m incremental shares** from RSUs and other contingently issuable shares under the treasury-stock method in Q3 FY2026; this is dilution used in EPS, not the count of unvested awards | [Q3 FY2026 Form 10-Q, Note 12 (Net Income per Common Share)] |
| Convertibles / potential shares (if disclosed) | **0 incremental shares** in Q3 diluted EPS from preferred conversion. The 19m mandatory-convertible preferred shares could convert into roughly 43.0m–53.8m common shares in May 2029, before any benefit from capped-call transactions. | [Q3 FY2026 Form 10-Q, Notes 11 and 12] |
| **Fully diluted shares (TSM + if-converted)** | **12,368m** | 12,256m Q3 weighted-average basic shares + 112m RSU/contingent-share dilution + 0 preferred-conversion dilution. [Q3 FY2026 Form 10-Q, Note 12] |
| Share count used for market cap | **12,294m current issued common shares**, priced by class | [Q3 FY2026 Form 10-Q, cover; Capital IQ Comps → Financial Data, 2026-11-03] |
| Share count used for per-share fair value | **12,368m fully diluted weighted-average shares** | [Q3 FY2026 Form 10-Q, Note 12] |

### Share Count Reconciliation

| Q3 FY2026 weighted-average common shares | Shares (m) | Treatment |
|---|---:|---|
| Basic common shares | 12,256 | Consolidated Class A, B and C weighted average. |
| + RSUs and other contingently issuable shares | 112 | Treasury-stock method. |
| + Mandatory-convertible preferred shares | 0 | If-converted effect was anti-dilutive in the Q3 EPS calculation. |
| **= Fully diluted shares used for per-share fair value** | **12,368** | The count downstream valuation work should use. |

The current issued count is 74m below the Q3 diluted weighted average because the two measures have different dates and bases; it is not an unexplained arithmetic difference. The mandatory preferred stock remains a separate preferred-equity claim in the EV bridge rather than being both deducted as preferred and added as common shares. Its final conversion ratio is share-price dependent, and the filing says capped calls are intended to reduce dilution. [Q3 FY2026 Form 10-Q, cover; Note 11; Note 12]

## 3. Market Capitalization

`Market cap = sum of each common class's issued shares × its own quoted price`

`= (5,888m × $278.99) + (827m × $278.99) + (5,579m × $278.04)`

`= $1,642,693m + $230,725m + $1,551,185m = $3,424,603m`

The class-by-class calculation is required because Class C (GOOG) closed $0.95 below Class A (GOOGL). Applying the GOOGL price to every 12,294m share would give $3,429,903m, $5,300m too high. This report therefore uses **$3,424,603m**. [Q3 FY2026 Form 10-Q, cover; Capital IQ Comps → Financial Data, subject row, 2026-11-03]

## 4. Enterprise Value Bridge

| Component | Amount | Source |
|---|---:|---|
| Market capitalization | 3,424,603 | Section 3 class-by-class calculation. [Q3 FY2026 Form 10-Q, cover; Capital IQ Comps → Financial Data, 2026-11-03] |
| + Total debt (short + long term) | 129,823 | **Canonical filing-based total:** $125,102m long-term debt + $1,016m current portion + $3,705m finance-lease liabilities. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Notes 4 and 6; `balance-sheet-survival/01_capital-structure-and-leverage.md`, Leverage Anchor Summary] |
| + Minority / non-controlling interest | 6,900 | Total NCI in consolidated subsidiaries; $825m is redeemable NCI. The filing reports NCI/RNCI within common stock and APIC, so it is separated here before valuing the common line. [Q3 FY2026 Form 10-Q, Note 7 (Noncontrolling Interests)] |
| + Preferred equity | 18,023 | Carrying value of the 19m mandatory-convertible preferred shares; liquidation preference is $19,000m. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 11] |
| + Operating lease liabilities (optional adjustment) | — canonical; 20,508 lease-inclusive sensitivity | Operating leases are excluded from canonical debt. The optional lease-inclusive EV is shown below. [Q3 FY2026 Form 10-Q, Note 4 (Leases)] |
| + Underfunded pension / other long-term obligations | Not separately quantified | No separate defined-benefit underfunding amount was identified in the latest filing; no adjustment made. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| − Cash & equivalents | (56,334) | Cash only; no separately reported restricted-cash amount. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| − Equity-method investments | — | Not separately quantified from non-marketable securities; no deduction made. [Q3 FY2026 Form 10-Q, Note 3 (Debt and Equity Securities)] |
| **= Enterprise value (EV)** | **3,523,015** | $3,424,603 + $129,823 + $6,900 + $18,023 − $56,334. |

The canonical EV is **$3,523,015m**. Adding the $20,508m operating-lease liability produces a clearly labelled lease-inclusive EV of **$3,543,523m**; it is not the canonical bridge.

Cash quality matters here. The canonical bridge nets only $56,334m of cash and equivalents. It does not net the $208,764m marketable-securities portfolio, which includes money-market funds, deposits, government and corporate debt securities, asset-backed securities and marketable equity securities. There is no separately disclosed restricted-cash balance, but the pool does not establish that every marketable security is an immediate operating-cash equivalent. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 3; `balance-sheet-survival/01_capital-structure-and-leverage.md`, §3]

The deterministic CIQ read is $150,331m total debt and $114,767m net cash on its vendor basis. The $20,508m difference from filing-based gross debt is the operating-lease liability CIQ includes; its net-debt field also nets $265,098m of cash plus marketable securities. The canonical bridge does not silently substitute either vendor convention. [CIQ Financials → Balance Sheet, Q3 ended 2026-09-30; deterministic `ciq_facts.json` `total_debt_m` and `net_debt_m`; Q3 FY2026 Form 10-Q, Notes 3, 4 and 6]

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | 129,823 | Filing debt plus finance leases; operating leases excluded. [Q3 FY2026 Form 10-Q, Notes 4 and 6; `balance-sheet-survival/01_capital-structure-and-leverage.md`, Leverage Anchor Summary] |
| Cash & equivalents | (56,334) | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| **Net debt (strict, §15: total debt − cash & equivalents)** | **73,489** | **$129,823 − $56,334. Canonical downstream basis.** |
| − Marketable securities (if netted) | (208,764) | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 3] |
| **Net debt (broad, incl. investments — only if used)** | **(135,275) net cash** | $129,823 − $56,334 − $208,764. Broad basis only; not canonical. |
| Net debt / latest EBITDA | **0.40x** | $73,489 ÷ $185,516m LTM EBITDA. EBITDA is Capital IQ's calculated, GAAP-derived measure, not management-reported adjusted EBITDA. [CIQ Financials → Income Statement, LTM ended 2026-09-30; deterministic `ciq_facts.json` `ltm_ebitda_m`] |

The strict $73,489m figure agrees with this run's balance-sheet-survival Leverage Anchor Summary. It differs from the earnings module's $69,784m strict figure only because that earlier build excludes $3,705m of finance-lease liabilities; the canonical valuation bridge includes those leases under the balance-sheet module definition. [Q3 FY2026 Form 10-Q, Notes 4 and 6; `balance-sheet-survival/01_capital-structure-and-leverage.md`, §§4 and 7; `earnings/01_historical-financials.md`, §2]

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | **$52.77** | ($659,526m reported common equity − $6,900m NCI) ÷ 12,368m fully diluted shares. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 7; Note 12] |
| Tangible book value per share | **$47.36** | ($652,626m common equity attributable to Alphabet holders − $58,117m goodwill − $8,817m net intangibles) ÷ 12,368m. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Notes 7, 9 and 12] |
| Net debt per share | **$5.94 net debt, strict basis** | $73,489m ÷ 12,368m. [Q3 FY2026 Form 10-Q, Notes 4 and 6; Note 12] |

For context only, broad-basis net cash is $10.94 per diluted share ($135,275m ÷ 12,368m); it is not labelled or used as strict net cash.

## 7. Anchor Summary (canonical numbers for downstream agents)

- Current price: **$278.99** on **2026-11-03**, vendor Day Close Price Latest; pool-verified. [Capital IQ Comps → Financial Data, subject row; deterministic `ciq_facts.json` `current_price`]
- Market-cap shares: **12,294m** current issued common shares, priced by class; per-share fair-value shares: **12,368m** Q3 fully diluted weighted-average shares. [Q3 FY2026 Form 10-Q, cover; Note 12]
- Market capitalization: **$3,424,603m**.
- Enterprise value: **$3,523,015m** canonical; **$3,543,523m** including operating-lease liabilities.
- Net debt: **$73,489m, strict basis** — $129,823m filing debt plus finance leases less $56,334m cash and equivalents. This is the filing-based figure from `balance-sheet-survival/01`; it is used instead of CIQ's broad, lease-inclusive $114,767m net-cash field.
- Reporting currency: **USD**.

### Anchor Block (copy-forward)

- Decision line: **GOOGL · Nasdaq Global Select Market · USD** — every downstream fair value, margin of safety, and yield is on this line.
- Other listed lines: **GOOG · Nasdaq Global Select Market · (0.34%) vs GOOGL on 2026-11-03**; **GOOGM / GOOGN · Nasdaq Global Select Market · preferred depositary shares, not price-comparable; pool prices unavailable**.
- Price: **$278.99** (2026-11-03, vendor Day Close Price Latest; pool-verified).
- Price-state: **pool-verified** — the canonical tag `05`/`07`/`99` read.
- Currency: **USD**.
- Distribution basis: **none quoted**.
- Shares (market cap): **12,294m** (Q3 FY2026 Form 10-Q cover; deterministic CIQ sidecar confirms the Comps-workbook read).
- Shares (per-share fair value): **12,368m** (Q3 FY2026 Form 10-Q, Note 12; 112m treasury-stock-method RSU/contingent-share dilution, preferred conversion 0 in Q3 diluted EPS).
- Market cap: **$3,424,603m** (Class A + Class B + Class C class-specific-price build).
- Net debt: **$73,489m** (strict basis; Q3 FY2026 Form 10-Q Notes 4 and 6; agrees with `balance-sheet-survival/01` canonical figure; CIQ's $114,767m is broad net cash on a lease-inclusive, investment-netted basis).
- EV: **$3,523,015m** (canonical; operating leases excluded; $3,543,523m lease-inclusive sensitivity).
- Key caveats: **$18,023m mandatory-convertible preferred equity stays in the EV bridge because its Q3 if-converted EPS effect was zero; final 2029 common-share conversion is price dependent. Marketable securities are not netted in strict net debt.**



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — GOOGL

Alphabet reports under U.S. GAAP in USD and has a 31 December fiscal year. This report applies to **GOOGL, Class A common stock, Nasdaq Global Select Market, USD**. Current price is **$278.99 on 3 November 2026**; the canonical enterprise value (EV, the value of equity plus financing claims less cash) is **$3,523,015m** and the per-share value count is **12,368m fully diluted shares**. [Valuation 01 Price & Capital Structure — GOOGL, §7; `data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc`, Q3 FY2026 Form 10-Q, cover and Note 12]

For compact citations below, CIQ Comps means `data/GOOGL/Company Comparable Analysis Alphabet Inc.xls`; CIQ Financials means `data/GOOGL/Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls`; and CIQ Estimates means `data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls`. These are Tier-5 vendor exports in the frozen 3 November 2026 pool.

## 1. Current Multiples

The EV multiples below use the canonical strict-basis EV from `01`: $3,424,603m market capitalization + $129,823m debt including finance leases + $6,900m non-controlling interests + $18,023m preferred equity − $56,334m cash. This is deliberately different from Capital IQ's broad-net-cash TEV used in its historical EV series. [Valuation 01 Price & Capital Structure — GOOGL, §§3–5]

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E | LTM, reported GAAP | $19.15 diluted EPS | 14.57x | [CIQ Comps → Financial Data, subject row, 2026-11-03; `ciq_facts.json` `pe_ltm_current_x` = 14.6x, status present] |
| P / E | NTM, Capital IQ consensus GAAP; basic-share vendor convention | $13.79 EPS | 20.24x | [CIQ Comps → Financial Data, subject row, 2026-11-03; CIQ Estimates → Multiples, NTM; CIQ Financials → Multiples header: Dilution = Basic] |
| EV / EBITDA | LTM, calculated GAAP-derived EBITDA; not management-adjusted | $185,516m | 18.99x | [$3,523,015m ÷ $185,516m; Valuation 01, §7; `ciq_facts.json` `ltm_ebitda_m` = $185,516m, status present] |
| EV / EBIT | LTM, reported operating income | $156,976m | 22.44x | [$3,523,015m ÷ $156,976m; Valuation 01, §7; CIQ Financials → Income Statement, LTM ended 2026-09-30] |
| EV / Sales | LTM, reported revenue | $471,098m | 7.48x | [$3,523,015m ÷ $471,098m; Valuation 01, §7; CIQ Financials → Income Statement, LTM ended 2026-09-30] |
| P / Book | Q3 FY2026 common equity | $652,626m | 5.25x | [$3,424,603m ÷ $652,626m; Valuation 01, §§3 and 6; Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 7] |
| P / FCF / FCF yield | LTM operating FCF = CFO − capex | $19,747m / 0.58% yield | 173.42x | [$3,424,603m ÷ $19,747m; Earnings 01 Historical Financials — GOOGL, §2; Q3 FY2026 Form 10-Q, Statements of Cash Flows] |
| Dividend yield | Forward annualised common dividend, gross; not contractual | $0.88 per share (= 4 × $0.22) | 0.32% | [Q3 FY2026 Form 10-Q, Note 11 (Preferred and Common Dividends): $0.22 quarterly common dividend declared in October 2026, record date 7 December and payment date 14 December 2026] |

The $19.747bn FCF figure is operating CFO less total capex, not Capital IQ's levered FCF. It is sharply lower because LTM capex was $159.804bn, so its 173.42x P/FCF is not a normal earnings multiple and has no matched own-history series here. [Earnings 01 Historical Financials — GOOGL, §2; CIQ Financials → Cash Flow, LTM ended 2026-09-30]

Capital IQ's own current TEV/LTM EBITDA read is **17.4x**, which matches the direct extraction of **17.4225x** from the Multiples close series and the deterministic sidecar. Its $3,327,859m TEV is **$195,156m lower** than the canonical bridge because CIQ nets marketable securities and uses its own lease/debt convention; it must not replace the 18.99x canonical read. [CIQ Financials → Multiples, TEV/LTM EBITDA Close, latest; `ciq_facts.json` `ev_ebitda_current_x` = 17.4x, status present; Valuation 01, §4]

## 2. Historical Multiple Bands (3–5 years)

The bands use 20 settled quarterly closes from **31 December 2021 through 30 September 2026**. The 2 November 2026 close is the current observation and is excluded. Mean and median are simple statistics of those 20 closes. Rank percentile is `historical closes at or below current ÷ 20`; range position is `(current − minimum) ÷ (maximum − minimum)`. [CIQ Financials → Multiples, Close rows, 2021-12-31–2026-11-02; vendor export data as of 2026-11-03]

| Multiple | Basis (LTM / NTM / FY) | Observations (n, window) | Min | Mean | Median | Max | Current | Rank percentile | Range position |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| P / E | NTM consensus EPS; CIQ basic-share convention, same forward series throughout | 20, 2021-12-31–2026-09-30 | 17.23x | 22.38x | 21.87x | 29.40x | 20.24x | 25.0% | 24.7% |
| P / E | LTM GAAP EPS; current denominator includes a non-operating Q2 FY2026 gain | 20, 2021-12-31–2026-09-30 | 17.26x | 24.07x | 25.51x | 30.88x | 14.56x | 0.0% | -19.8% |
| P / Book | Basic-share CIQ P/B. Current CIQ close is 5.20x; canonical P/B is 5.25x, a 0.9% difference | 20, 2021-12-31–2026-09-30 | 4.51x | 6.82x | 6.70x | 9.77x | 5.20x CIQ / 5.25x canonical | 10.0% | 13.1% |
| EV / EBITDA | LTM, **CIQ vendor TEV**; this row is internally comparable but not the canonical strict-basis EV | 20, 2021-12-31–2026-09-30 | 10.93x | 17.54x | 16.98x | 25.81x | 17.42x CIQ / 18.99x canonical | 55.0% vendor-only | 43.6% vendor-only |

The P/NTM EPS band is the cleanest own-history series: the current 20.24x is **9.6% below the 22.38x mean** and **7.5% below the 21.87x median**, calculated as `(20.24 ÷ reference) − 1`. The P/B read is lower still: canonical 5.25x is **23.1% below its mean** and **21.7% below its median**. Its historical rank uses the 5.20x CIQ close to keep the series on its stated basic-share basis; the result remains two of 20 observations at or below current using 5.25x. [CIQ Financials → Multiples, P/NTM EPS and P/BV Close rows, 2021-12-31–2026-11-02]

The LTM P/E discount is not a reliable valuation signal: 14.56x is 39.5% below the five-year mean and 42.9% below the median, but Q2 FY2026 contains a disclosed $98.999bn gain on sale of investments in the vendor series. That gain inflates LTM GAAP EPS; it does not establish normal cash earnings. [Earnings 01 Historical Financials — GOOGL, §§2–3; CIQ Financials → Quarterly Income Statement, Q2 FY2026]

**Admissibility for `07_scenario-and-fair-value`:** use the P/NTM EPS band (17.23x–29.40x) as the primary own-history anchor and P/B only as a lower-weight cross-check. The LTM P/E band is not admissible because its current denominator is one-off-inflated. The TEV/EBITDA band is not admissible because its broad-net-cash vendor TEV cannot be applied to the canonical strict-basis EV without reconstructing historical debt, cash, investments, leases, preferred equity, and non-controlling interests on the same basis.

## 3. Re-Rating / De-Rating Read

On the forward earnings measure that avoids the Q2 gain, GOOGL trades at 20.24x NTM P/E: 7.5% below its five-year median and at the 25th historical rank percentile. That is a modest de-rating versus the company's own forward-earnings history, not a claim that the historical median is automatically warranted. [CIQ Financials → Multiples, P/NTM EPS Close rows, 2021-12-31–2026-11-02]

P/B gives a larger de-rating read—5.25x canonical P/B versus a 6.70x median—but is a secondary measure for an operating platform because it does not test the return on the new AI and Cloud infrastructure. The $98.999bn Q2 investment-sale gain makes the much larger LTM P/E discount uninformative; conversely, vendor-basis EV/EBITDA is roughly at its own mean (17.42x versus 17.54x), but it cannot be compared to the canonical EV. The evidence therefore does not support one uniform multiple conclusion. [Q3 FY2026 Form 10-Q, Item 2 (Capital Expenditures and Leases); Earnings 01 Historical Financials — GOOGL, §§2–3; CIQ Financials → Multiples]

## 4. Implied Value from Reversion

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| P / NTM EPS | Median 21.87x × $169,534m NTM earnings | $3,707,469m equity | $299.76 | +7.45% |
| P / NTM EPS | Mean 22.38x × $169,534m NTM earnings | $3,793,676m equity | $306.73 | +9.94% |
| P / Book | Median 6.70x × $652,626m common equity | $4,371,538m equity | $353.46 | +26.69% |
| P / Book | Mean 6.82x × $652,626m common equity | $4,453,614m equity | $360.09 | +29.07% |

The one base-case own-history point is **$299.76 per GOOGL share**, from the **21.87x five-year median P/NTM EPS**. The fully diluted bridge is explicit: $13.79 CIQ basic EPS × 12,294m issued shares = $169,534m implied NTM earnings; 21.87x × $169,534m = $3,707,469m equity; $3,707,469m ÷ 12,368m fully diluted shares = $299.76. The $299.76–$360.09 dispersion across the NTM P/E and P/B methods is an exhibit of method disagreement, not a probability range or a final fair-value range. P/B is higher because it does not directly charge the reduced cash conversion from the AI build; it should not receive equal weight merely because it produces a higher level. [CIQ Comps → Financial Data, subject row, 2026-11-03; CIQ Financials → Multiples, P/NTM EPS and P/BV Close rows; Valuation 01 Price & Capital Structure — GOOGL, §7; Earnings 01 Historical Financials — GOOGL, §2]

Reversion assumes the warranted multiple has not changed. That assumption is only partly supported: reported margins improved, but the business-model work classifies the company as exposed to fast AI-led change, notes that nine-month FY2026 capex of $132.0bn exceeded CFO of $127.1bn, and says returns on the additional infrastructure are unproven. The P/NTM median is therefore a conditional reference point, not a floor. [Q3 FY2026 Form 10-Q, Statements of Cash Flows and Item 2; Business Model Reality Check — GOOGL, §1]

## 5. Sector Cycle Reality Test

The broad growth-sector proxy does **not** show a material same-direction five-year multiple move on the available evidence: Nasdaq-100 trailing P/E was 38.00x in December 2021 and 35.09x in September 2026, a 7.7% decrease, below the roughly 25% trigger. This is an imperfect proxy for Alphabet's advertising-plus-cloud mix and is web-sourced, so it is indicative and unverified; it does not trigger a cycle-elevated or cycle-depressed flag. [Web: Siblis Research, *NASDAQ 100 P/E Ratio & Earnings*, year-end table, retrieved 2026-11-03 — indicative, unverified]

## 6. Own-History Read

GOOGL trades at **20.24x NTM P/E**, 7.5% below its five-year median; after converting the basic-share vendor EPS to the 12,368m fully diluted valuation share count, simple median reversion gives **$299.76**, 7.5% above the $278.99 pool-verified price. P/B suggests $353–$360, but that result is a secondary cross-check rather than a clean base case because it does not answer whether the AI-capacity build will earn an adequate return.

The biggest caveat is denominator and business-model change. LTM P/E is depressed by the disclosed Q2 investment-sale gain, while current cash conversion is pressured by capex; a return to the old median is not warranted unless future Cloud and Search returns validate the larger infrastructure base. The sector-proxy test did not show a material five-year valuation reset, but it is an indicative broad-index check rather than proof that Alphabet's own history is a stable anchor. [Earnings 01 Historical Financials — GOOGL, §§2–3; Q3 FY2026 Form 10-Q, Item 2; Web: Siblis Research, retrieved 2026-11-03 — indicative, unverified]



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — GOOGL

Alphabet reports under U.S. GAAP in USD. The decision line is **GOOGL · Nasdaq Global Select Market · USD** at **$278.99** on 2026-11-03; EV-derived values use 12,368m fully diluted shares and the canonical bridge from `01`: $73,489m strict net debt, $6,900m non-controlling interest (NCI), and $18,023m preferred equity. [Capital IQ Comps → Financial Data, subject row, data as of 2026-11-03; `ciq_facts.json` `current_price` and `shares_outstanding_m`; Q3 FY2026 Form 10-Q, Note 12; Price & Capital Structure — GOOGL, §§4 and 7]

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Meta Platforms | META | Competes for consumer attention and advertising budgets through Family of Apps; this is an advertising-attention comparison, not pure Search. | [Competitive Map — GOOGL, §2; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Business Description, data as of 2026-11-03]
| Amazon.com | AMZN | Competes in retail media, commerce search, sponsored ads, display and video advertising; overlap is narrower than general Search. | [Competitive Map — GOOGL, §2; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Business Description, data as of 2026-11-03]
| Microsoft | MSFT | Bing, Copilot, Edge and Search Advertising make this the clearest public general-search rival; Azure also overlaps with Google Cloud. | [Competitive Map — GOOGL, §2; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Business Description, data as of 2026-11-03]

The set comes from `business-model/08_competitive-map.md`, not a self-selected screen. The broader Capital IQ export also lists Reddit, Pinterest, Netflix, DoorDash, Snap, The Trade Desk and Match; they are not used in the primary median because their scale, end markets, or business models are less comparable with Alphabet's combined search, advertising and cloud business. Private search/AI rivals have no public multiples in the frozen pool and are not assigned assumed values. [Competitive Map — GOOGL, §5; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples and Business Description, data as of 2026-11-03]

## 2. Peer Multiples & Operating Stats

All price multiples and operating statistics below are **LTM** and come from the frozen Capital IQ comparable workbook as of 2026-11-03. FCF yield is LTM CFO less capex divided by market capitalization; peer FCF yield is not supplied in the workbook, so it is not imputed. Net debt/EBITDA uses the workbook's vendor `LTM Net Debt` divided by LTM EBITDA, including its vendor cash/investment conventions; this is used only for like-for-like peer comparison, not for GOOGL's valuation bridge.

| Company | P/E | EV/EBITDA | EV/EBIT | EV/Sales | FCF Yield | Rev Growth | EBITDA Margin | ROIC | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| GOOGL | 14.6x† | 17.4x† | 21.2x† | 7.1x† | 0.6%‡ | 22.2%† | 39.4%† | 15.6%§ | (0.62)x† | 2026-11-03 |
| Meta | 20.7x† | 13.1x† | 17.3x† | 6.6x† | N/A | 27.5%† | 48.1%† | N/A | 0.28x† | 2026-11-03 |
| Amazon | 19.9x† | 14.1x† | 27.4x† | 3.6x† | N/A | 15.4%† | 23.0%† | N/A | 1.04x† | 2026-11-03 |
| Microsoft | 26.5x† | 17.2x† | 22.2x† | 11.1x† | N/A | 17.9%† | 59.4%† | N/A | 0.34x† | 2026-11-03 |
| **Peer median** | **20.7x** | **14.1x** | **22.2x** | **6.6x** | **N/A** | **17.9%** | **48.1%** | **N/A** | **0.34x** | **2026-11-03** |

† [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples, Financial Data and Operating Statistics, data as of 2026-11-03]. The net-debt ratios are calculated from that workbook's LTM net-debt and EBITDA fields. The deterministic source-bound read confirms GOOGL's $185,516m LTM EBITDA, 17.4x LTM EV/EBITDA and (0.62)x vendor-basis net debt/EBITDA. [`ciq_facts.json`, `ltm_ebitda_m`, `ev_ebitda_current_x`, and `net_debt_ebitda_x`]

‡ GOOGL LTM FCF yield = $19,747m CFO less capex ÷ $3,424,603m market capitalization = 0.58%, rounded to 0.6%. [Historical Financials — GOOGL, §2; Price & Capital Structure — GOOGL, §3]

§ GOOGL's 15.6% is Capital IQ's LTM vendor-defined ROIC. The peer material in the competitive map has ROE rather than a matched ROIC definition, so peer ROIC is not comparable and remains N/A. [`ciq_facts.json`, `multi_year_trajectory`; Moat — GOOGL, §3]

Each bold peer-median cell is the numerical median of the three preceding selected-peer values, not the broader Capital IQ summary statistic.

The deterministic CIQ sidecar reports 17.4x GOOGL LTM EV/EBITDA against **15.5x** for the workbook's full ten-company set. This report's **14.1x** median is a deliberate three-peer calculation (META, AMZN and MSFT), not a conflicting workbook read. [`ciq_facts.json`, `peer_ev_ebitda`; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples, data as of 2026-11-03]

## 3. Premium / Discount to Peer Median

| Multiple | Company | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| LTM EV/Sales | 7.1x | 6.6x | +7.6% premium |
| LTM EV/EBITDA | 17.4x | 14.1x | +23.4% premium |
| LTM EV/EBIT | 21.2x | 22.2x | (4.5%) discount |
| LTM P/E | 14.6x | 20.7x | (29.5%) discount |
| LTM FCF yield | 0.6% | N/A | Not assessable — peer FCF yield is absent |

Premium / (discount) = `(GOOGL multiple − peer median) ÷ peer median`; the price-multiple signs above follow that formula. [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples and Financial Data, data as of 2026-11-03]

The forward read used for valuation points the same way but with smaller P/E separation: GOOGL is at a 3.7% premium on NTM EV/revenue (5.55x versus 5.35x), a 10.6% premium on NTM EV/EBITDA (11.78x versus 10.65x), and a 17.7% discount on NTM P/E (20.24x versus 24.59x). [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples, Financial Data and Implied Valuation, data as of 2026-11-03]

**Is the gap typical or unusual?** Not assessable — the admitted pool contains no 3-year history of this selected peer set's multiples. GOOGL's own 39-quarter EV/EBITDA history does not answer the relative-gap question. [`ciq_facts.json`, `range_position`; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples, data as of 2026-11-03]

## 4. Is the Gap Warranted?

**Conclusion: the forward P/E discount is too deep (relative upside), but the EV/revenue and EV/EBITDA premiums prevent an all-in relative-value conclusion.** GOOGL's 39.4% LTM EBITDA margin is 870bp below the selected-peer median of 48.1%, although its 22.2% LTM revenue growth is above the 17.9% median; lower margin is already reflected in EBITDA, EBIT and EPS denominators and is not used again as an earnings-multiple haircut. [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Operating Statistics, data as of 2026-11-03]

An extra risk discount is warranted for durability rather than current margin: business quality is 62/100, the moat is narrow and mixed, the rate-of-change score is 40/100, and capital spending rose from $91.4bn in FY2025 to $132.0bn in the first nine months of 2026. The ongoing AI infrastructure build, regulatory remedies, and uncertain returns on added capital can affect post-NTM earnings durability. [Business Quality — GOOGL, §§1–4; Moat — GOOGL, §5; data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Item 7; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, nine months 2026, Item 2]

The counterweight is real: NTM revenue implied by the same CIQ workbook grows 27.3% for GOOGL, versus a 19.6% median for the three peers, and vendor-basis net debt/EBITDA is (0.62)x versus 0.34x. These inputs do not establish that the P/E discount should disappear, but they support a narrower-than-current 17.7% discount as a judgment read. [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Financial Data and Trading Multiples, data as of 2026-11-03; `ciq_facts.json`, `net_debt_ebitda_x`]

## 5. Implied Value from Peer Multiples

The forward bases are matched: NTM peer multiples are applied to GOOGL's NTM CIQ revenue of $599,564.79m, EBITDA of $282,405.72m, and diluted EPS of $13.79. EV methods bridge as `implied EV − $73,489m strict net debt − $6,900m NCI − $18,023m preferred equity`, then divide by 12,368m fully diluted shares. [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Financial Data, Trading Multiples and Implied Valuation, data as of 2026-11-03; Price & Capital Structure — GOOGL, §§2, 4 and 7]

| Multiple | Applied Peer Multiple | Implied EV or Equity | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| NTM EV/Revenue | 5.35x median → **4.55x** adjusted | EV $2,726,521m | $212.49 | (23.8%) |
| NTM EV/EBITDA | 10.65x median → **9.59x** adjusted | EV $2,706,856m | $210.90 | (24.4%) |
| NTM P/E | 24.59x median → **22.13x** adjusted | Equity $3,774,546m | $305.19 | +9.4% |

**Base-case implied value: $305.19 per GOOGL Class A share from the NTM P/E method.** The peer-method dispersion is **$210.90–$305.19** per share, a 44.7% high-to-low field relative to the low. That spread is material: the P/E result reflects a lower forward earnings denominator after the FY2026 non-operating EPS distortion, while the EV methods continue to put a lower value on the same operating earnings and revenue base. It should not be averaged into a false-precision figure. [Historical Financials — GOOGL, §§2–3; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Implied Valuation, data as of 2026-11-03]

**Quality-adjustment ledger**

| Multiple adjusted | Peer median | Adjusted to | Gap already in the denominator? | What the extra adjustment pays for | How it was sized |
|---|---:|---:|---|---|---|
| NTM EV/Revenue | 5.35x | 4.55x | No — revenue is margin-blind | GOOGL's 39.4% LTM EBITDA margin is below the 48.1% peer median, plus the AI-capacity/durability risk. | 15% judgment discount: less than the 18.1% margin shortfall because GOOGL's 27.3% NTM revenue growth is 7.7pp above the peer median. This is an inference, not from filings, not a mechanical margin-ratio formula. |
| NTM EV/EBITDA | 10.65x | 9.59x | Yes — current margin is already in GOOGL EBITDA | Earnings durability and the risk that AI infrastructure spending, depreciation and regulatory remedies reduce returns after the NTM period; **not** lower margin. | 10% judgment discount, not an empirical frequency. It is anchored to $195bn–$205bn FY2026 CapEx guidance versus $91.4bn FY2025 CapEx and the 40/100 rate-of-change score. [Guidance & Consensus — GOOGL, §2; Business Quality — GOOGL, §§1–4] |
| NTM P/E | 24.59x | 22.13x | Yes — current margin is already in GOOGL EPS | The same post-NTM durability, regulatory and return-on-new-capital risk; **not** lower margin or a `margin ÷ peer margin` formula. | 10% judgment discount, not an empirical frequency, matched to the evidence and rationale in the NTM EV/EBITDA row. [Business Quality — GOOGL, §§1–4; Moat — GOOGL, §5] |

The forward P/E point is the primary peer read because it values common equity after expected depreciation, interest and tax. It is not independent corroboration of any own-history method: `02_multiples-own-history` was not available at this stage, and an own-history multiple would record the market's past pricing rather than independently establish mispricing.

## 6. Sector Cycle Reality Test

Not assessable — no sector-level multiple history. The frozen Capital IQ comparable workbook provides only the 2026-11-03 snapshot, and the pool's price chart is GOOGL-only rather than a three-peer or sector-multiple history; no 3–5-year peer-group re-rating/de-rating can therefore be measured from admitted evidence. [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Trading Multiples, data as of 2026-11-03; data/GOOGL/Price_Charting Excel Export - Nov 3rd 2026 2_23_42 pm.xls, Pane 1]

## 7. Relative Read

GOOGL is 17.7% below the selected peers' NTM P/E median, but 3.7% and 10.6% above their NTM EV/revenue and EV/EBITDA medians, respectively. The P/E-led base point is $305.19, with a $210.90–$305.19 peer-method field; the field is too wide to portray as one clean relative-value signal. The peer anchor's sector-cycle status is not assessable, so the current peer median is a snapshot rather than a proven stable valuation anchor.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — GOOGL

Alphabet is an operating company reporting under US GAAP in USD, so an FCFF DCF is the applicable intrinsic method. The decision line is GOOGL on Nasdaq Global Select Market, and all per-share amounts use 12,368m fully diluted shares. [analyses/GOOGL_2026-11-03/valuation/00_valuation-data-triage.md, §§1A and 3; analyses/GOOGL_2026-11-03/valuation/01_price-and-capital-structure.md, §§1–2]

## 1. FCF Base & Normalizations

Base year is FY2025; figures are USD millions unless stated otherwise. FCF means CFO less total capex. The model does not extrapolate FY2025's $73.266bn FCF because FY2026 capex is guided/estimated near $200bn; it explicitly models that investment period.

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| FY2025 revenue | 402,836 | Reported base for the FY2026 consensus-growth calculation. | [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Consolidated Statements of Income, p.49] |
| FY2025 CFO | 164,713 | Reported; no quantified one-off cash receipt is available to remove. | [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Consolidated Statements of Cash Flows, p.51] |
| FY2025 capex | (91,447) | Total property-and-equipment purchases; maintenance/growth split is not disclosed. | [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Consolidated Statements of Cash Flows, p.51] |
| **FY2025 FCF (CFO − capex)** | **73,266** | Historical reference only; not treated as a steady-state run rate. | [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Consolidated Statements of Cash Flows, p.51] |
| TTM Sep-2026 CFO | 179,551 | CIQ sidecar's authoritative workbook read; reconciles to the earnings module. | [CIQ facts sidecar, `ltm_ocf_m` = 179,551, CIQ Financials→Cash Flow, LTM Sep-30-2026] |
| TTM Sep-2026 capex / FCF | (159,804) / 19,747 | Reported CFO-minus-capex run rate; its fall is driven by capex, not a cash-collection failure. | [CIQ Financials→Cash Flow, LTM Sep-30-2026 — vendor export; analyses/GOOGL_2026-11-03/earnings/01_historical-financials.md, §2] |
| Normalized tax rate for NOPAT | 16.0% | Uses the moat module's canonical rounded FY2023–FY2025 effective-tax-rate average (13.9%, 16.4%, 16.8%). It avoids treating FY2025's legal/tax distortions as the permanent rate. | [analyses/GOOGL_2026-11-03/business-model/09_moat.md, §3; data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, Note 14] |
| FY2025 operating NWC | (23,550) | Calculated as receivables + inventory + other current assets less current liabilities, excluding cash and marketable securities; this is the forecast driver, not total balance-sheet working capital. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Consolidated Balance Sheets, p.4] |
| Canonical forward FCF path | FY2026 FCFF (32,277); FY2031 FCFF 164,932 | Analyst model output, not a filing figure. The FY2026 trough reflects the $201.207bn capex consensus; the FY2031 level is the normalized post-build reference that `05_reverse-dcf` should invert with this report's WACC. | [Capital IQ Estimates Report — Consensus, FY2026 capex; analyses/GOOGL_2026-11-03/earnings/04_guidance-consensus.md, §§2–3] |

The FY2026 GAAP net-income run rate is not used as an operating-cash-flow base: nine-month FY2026 other income included $127.3bn of equity-security gains, mostly unrealised. FCFF is therefore built from EBIT after normalized tax, not from GAAP EPS. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Note 3 and Consolidated Statements of Income; analyses/GOOGL_2026-11-03/earnings/06_earnings-quality.md, §§5 and 10]

## 2. Forecast Assumptions

`C` = company-guided or CIQ consensus; `A` = analyst assumption, not company-guided. FY2026 revenue and capex are consensus; Alphabet supplied no numeric revenue, EBIT, or EPS guide. All later forecast cells marked `A` are deliberately conservative fades rather than filing forecasts.

| Assumption | FY2026 | FY2027 | FY2028 | FY2029 | FY2030 | FY2031 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 24.0% C | 17.0% A | 14.0% A | 11.0% A | 8.0% A | 2.5% A | 2.5% A | FY2026 revenue consensus is $499.429bn; the later fade is an analyst assumption below the sidecar's 13.1% mean long-term growth by FY2029 and at a mature nominal rate by FY2031. [Capital IQ Estimates→Consensus, FY2026; CIQ facts sidecar, `consensus_view`] |
| EBIT margin % | 31.0% A | 31.5% A | 31.75% A | 31.5% A | 31.0% A | 31.0% A | 31.0% A | Below 33.9% nine-month FY2026 operating margin because management cited depreciation, third-party compute and data-centre operating-cost pressure; it does not presume the legal-cost comparison repeats. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, nine months FY2026, Consolidated Statements of Income and Item 2; analyses/GOOGL_2026-11-03/earnings/03_margin-drivers.md, §§3, 8] |
| Tax rate % | 16.0% A | 16.0% A | 16.0% A | 16.0% A | 16.0% A | 16.0% A | 16.0% A | Canonical normalized-tax rate from the moat module; see §1. |
| D&A (% of revenue) | 7.5% A | 9.0% A | 10.5% A | 11.5% A | 12.0% A | 12.0% A | 12.0% A | Fades upward from LTM D&A implied by CIQ EBITDA less reported EBIT as the current data-centre build enters service. [CIQ facts sidecar, `ltm_ebitda_m` = 185,516, CIQ Financials→Income Statement, LTM Sep-30-2026; Q3 FY2026 Form 10-Q, Consolidated Statements of Income] |
| Capex (% of revenue) | 40.3% C | 33.0% A | 28.0% A | 23.0% A | 20.0% A | 18.0% A | 18.0% A | FY2026 consensus capex is $201.207bn, within management's $195bn–$205bn range. The later decline is an analyst assumption; it remains above FY2025's 22.7% until FY2030. [Capital IQ Estimates Report — Consensus and Guidance, FY2026; Q3 2026 earnings call, prepared remarks; FY2025 Form 10-K, Item 7] |
| Ending operating NWC (% of revenue, used to derive ΔNWC) | (5.0%) A | (4.8%) A | (4.6%) A | (4.5%) A | (4.5%) A | (4.5%) A | (4.5%) A | Starts near the FY2025 operating-NWC ratio of (5.8%) and gradually normalizes as TPU inventory rises. Receivable days were stable near 52 while inventory became material in FY2026. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Cash Flows; analyses/GOOGL_2026-11-03/earnings/06_earnings-quality.md, §3] |

The NWC path is revenue-linked. Forecast NWC remains negative, but it becomes more negative in dollars as revenue grows; therefore `ΔNWC` is negative and adds cash to FCFF. This is a calculated cash effect, not an assumption that growth automatically releases cash.

## 3. Discount Rate (WACC)

WACC is the blended required return of common equity, debt, and preferred equity. All weights are market-value weights; the unrounded weights sum to 100.00%. No discretionary override is applied: the computed 10.37% is the used WACC.

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 5.29% | [Web: Damodaran implied-ERP update, 2026-11-01, US Treasury rate for USD — unverified] |
| Equity-risk premium | 4.41% | [Web: Damodaran implied-ERP update, 2026-11-01, trailing-12-month adjusted-payout implied US ERP — unverified] |
| Beta | 1.21 | [Web: Yahoo Finance, GOOGL five-year monthly beta, retrieved 2026-11-03 — unverified] |
| Cost of equity, `k_e = rf + beta × ERP` | 10.63% | 5.29% + 1.21 × 4.41%; calculated from rows above. |
| Pre-tax cost of debt, `k_d` | 5.00% | Analyst approximation within Alphabet's disclosed effective-rate ranges on outstanding 2026 USD notes (3.93%–6.57%); not a bond-market yield. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Note 6 (Debt), p.26] |
| Normalized tax rate | 16.00% | Same 16.0% NOPAT rate as §1. [Business Model Moat — GOOGL, §3] |
| After-tax cost of debt | 4.20% | 5.00% × (1 − 16.0%). |
| Common-equity weight | 95.86% | $3,424.603bn market cap ÷ ($3,424.603bn + $129.823bn debt + $18.023bn preferred). [Valuation Price & Capital Structure — GOOGL, §§3–4] |
| Debt weight | 3.63% | $129.823bn canonical filing debt, including finance leases. [Valuation Price & Capital Structure — GOOGL, §4] |
| Preferred-equity weight / cost | 0.50% / 6.25% | Mandatory-convertible preferred carrying value / stated coupon. [Q3 FY2026 Form 10-Q, Note 11; Valuation Price & Capital Structure — GOOGL, §4] |
| **WACC** | **10.37%** | Executed formula below. |

The arithmetic bounds pass: after-tax `k_d` of 4.20% ≤ WACC of 10.37% < CAPM `k_e` of 10.63%. The equity premium over the USD risk-free rate is 5.34 percentage points, above the ~4-point floor. The beta source uses a five-year monthly window; Alphabet is USD-reporting and globally diversified, so no emerging/single-country risk premium is added. [Web: Yahoo Finance, GOOGL five-year monthly beta, retrieved 2026-11-03 — unverified; FY2025 Form 10-K, Item 1 — international operations]

## 3A. Cost-of-Capital Reality Test

| Reference | Rate | Source (cite per §5) | Gap vs model WACC |
|---|---:|---|---:|
| Model WACC (CAPM build, §3) | 10.37% | This report, §3 | — |
| Scope-matched group discount rate | **Group discount rate not disclosed** | No filing-disclosed rate was found for the listed group's USD operating cash flows, on a WACC basis. | NM |
| Other disclosed rate (comparator only) | 3.93%–6.57% effective rates | Alphabet 2026 USD note tranches; debt instruments, not the group's cost of equity or WACC. [Q3 FY2026 Form 10-Q, Note 6 (Debt), p.26] | (6.44) to (3.80)pp |
| Market-implied rate | Runs after this agent — reconcile in `05_reverse-dcf`. | `05` must invert the same 16.0% tax base, FCFF path, and 10.37% WACC. | Pending |
| Trailing FCF yield / GAAP earnings yield | 0.58% / 6.87% | $19.747bn TTM FCF ÷ $3,424.603bn market cap; $19.17 LTM EPS ÷ $278.99. GAAP EPS is distorted by investment gains, so neither is a WACC anchor. [CIQ Financials→Cash Flow, LTM Sep-30-2026; CIQ facts sidecar, `current_price`; analyses/GOOGL_2026-11-03/earnings/06_earnings-quality.md, §10] |
| Peer / industry cost of capital | Not assessable | No dated, scope-matched peer WACC is in the admitted evidence. | NM |

Escalation: not triggered. No scope-matched group rate is disclosed, and the reverse-DCF market-rate comparison is sequenced after this report; `05` must test it rather than treating the comparator debt rates as a group WACC.

## 4. Free Cash Flow Forecast & Discounting

FCFF = NOPAT + D&A − capex − ΔNWC. Discounting uses the mid-year convention: cash arrives through each year, so the factor is `1 / (1 + WACC)^(t − 0.5)`.

| Year | Revenue | EBIT | NOPAT | Capex | ΔWC | FCF | Discount Factor | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 499,429 | 154,823 | 130,051 | (201,207) | (1,421) | (32,277) | 0.9519 | (30,723) |
| FY2027 | 584,332 | 184,065 | 154,614 | (192,830) | (3,076) | 17,451 | 0.8624 | 15,050 |
| FY2028 | 666,138 | 211,499 | 177,659 | (186,519) | (2,594) | 63,679 | 0.7814 | 49,759 |
| FY2029 | 739,414 | 232,915 | 195,649 | (170,065) | (2,631) | 113,248 | 0.7080 | 80,177 |
| FY2030 | 798,567 | 247,556 | 207,947 | (159,713) | (2,662) | 146,723 | 0.6415 | 94,117 |
| FY2031 | 818,531 | 253,745 | 213,145 | (147,336) | (898) | 164,932 | 0.5812 | 95,857 |

D&A is included in FCFF but omitted from the compact table: it is $37.457bn/$52.590bn/$69.945bn/$85.033bn/$95.828bn/$98.224bn in FY2026–FY2031, respectively. It is derived from the §2 percentages. A negative `ΔNWC` adds cash: for example, FY2027 NWC moves from $(24.971)bn to $(28.048)bn, so `ΔNWC = −$3.076bn` and FCFF receives a $3.076bn cash release. The modeled sign therefore matches the modeled balance-sheet path.

Sum of PV of explicit FCFs: **$304.231bn**.

The following is the executed calculation for the WACC blend, explicit-FCF PV sum, terminal value, and EV-to-equity bridge. Amounts are USD millions.

```text
$ awk 'BEGIN { we=.958615; wd=.036340; wp=.005045; ke=.106261; kd=.05; tax=.16; kp=.0625; wacc=we*ke+wd*kd*(1-tax)+wp*kp; f[1]=-32277.063; f[2]=17451.048; f[3]=63679.325; f[4]=113247.525; f[5]=146723.324; f[6]=164931.976; for(i=1;i<=6;i++){pv=f[i]/(1+wacc)^(i-.5); sum+=pv}; g=.025; tv=f[6]*(1+g)/(wacc-g); pvtv=tv/(1+wacc)^5.5; ev=sum+pvtv; equity=ev-73489-6900-18023; per=equity/12368; exit_tv=351968.279*9; exit_pv=exit_tv/(1+wacc)^5.5; exit_ev=sum+exit_pv; exit_per=(exit_ev-73489-6900-18023)/12368; printf "WACC = %.6f*%.6f + %.6f*%.6f*(1-%.2f) + %.6f*%.6f = %.6f (%.2f%%)\n",we,ke,wd,kd,tax,wp,kp,wacc,100*wacc; printf "PV explicit FCF = %.3f\nFCF_2032 = %.3f\nTV = %.3f\nPV TV = %.3f\nEV = %.3f\nEquity = %.3f\nPer share = %.2f\nExit-9x per share = %.2f\n",sum,f[6]*(1+g),tv,pvtv,ev,equity,per,exit_per }'
WACC = 0.958615*0.106261 + 0.036340*0.050000*(1-0.16) + 0.005045*0.062500 = 0.103705 (10.37%)
PV explicit FCF = 304231.122
FCF_2032 = 169055.275
TV = 2147961.580
PV TV = 1248346.061
EV = 1552577.183
Equity = 1454165.183
Per share = 117.57
Exit-9x per share = 165.49
```

## 5. Terminal Value

Base terminal value uses Gordon growth:

`TV = FCFF_{2032} / (WACC − g) = FCFF_{2031} × (1 + g) / (WACC − g)`

`= $164.932bn × 1.025 / (10.3705% − 2.5%) = $2,147.962bn`.

The 2.5% nominal `g` is an analyst assumption below the $-denominated risk-free rate and is intended to represent a mature cash-flow fade, not a claim that AI growth persists forever. The `WACC − g` spread is 7.87 percentage points, so no sensitivity cell nears a denominator failure.

- Terminal value, undiscounted: **$2,147.962bn**.
- PV of terminal value: **$1,248.346bn**.
- **Terminal value as % of EV: 80.4%.** This exceeds the 75% limit: the DCF is terminal-dominated and has low intrinsic confidence.
- The Gordon terminal implies **6.10× FY2031 EBITDA**. An exit-multiple cross-check at 9.0× FY2031 EBITDA produces **$165.49 per share**. The 9.0× is an analyst assumption, below the current 17.4× LTM EV/EBITDA and peer median 15.5×; it is a sensitivity comparator, not a second base value. [CIQ facts sidecar, `ev_ebitda_current_x` and `peer_ev_ebitda`, CIQ Comps, 2026-11-03]

Financeability check: the terminal path requires a 22.1% reinvestment rate, `(capex − D&A + ΔNWC) / NOPAT`, and implies terminal ROIC of 11.33%, or only about 96bp above WACC. Thus the model fades the present return advantage rather than retaining a large perpetual excess return. [analyses/GOOGL_2026-11-03/business-model/09_moat.md, §§3 and 5]

**Structural-decline / runoff terminal (bear input; not the base intrinsic):** the business-quality rate-of-change score is 40/100, meeting the declining-perpetuity trigger. A structural-reset terminal fades FY2031 EBIT margin to 27.0%, holds capex at 20.0% of revenue, lets operating-NWC improve to (4.0%) of revenue (a $3.194bn cash use), and uses 1.0% nominal growth. It yields FY2031 FCFF of $116.966bn, PV of terminal value $732.759bn, and **$73.63 per share** after the same strict debt, minority, preferred, and diluted-share bridge. This is a 24–36 month structural-reset sensitivity for `07_scenario-and-fair-value`, not a silent replacement for the most-likely base. [analyses/GOOGL_2026-11-03/business-model/07_business-quality.md, §§1 and 4]

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFs | 304,231 |
| + PV of terminal value | 1,248,346 |
| **= Enterprise value** | **1,552,577** |
| − Net debt, strict basis | (73,489) |
| − Minority interest | (6,900) |
| − Preferred equity | (18,023) |
| **= Equity value** | **1,454,165** |
| ÷ Fully diluted shares (m) | 12,368 |
| **= Intrinsic value per GOOGL share** | **$117.57** |
| vs pool-verified GOOGL price of $278.99, 2026-11-03 | **(57.9%)** |

The bridge uses the valuation anchor's canonical strict $73.489bn net debt (including finance leases and only cash equivalents), $6.900bn non-controlling interest, $18.023bn preferred claim, and 12.368bn diluted shares. It does not add the $208.764bn marketable-securities balance as cash because the anchor did not establish a separately realizable non-operating portion. [analyses/GOOGL_2026-11-03/valuation/01_price-and-capital-structure.md, §§2, 4, 5 and 7]

## 7. Sensitivity Grid (per-share intrinsic value)

WACC across columns, terminal growth down rows. Every cell has `WACC − g` comfortably above 0.5 percentage points.

| | WACC 9.37% | WACC 10.37% | WACC 11.37% |
|---|---:|---:|---:|
| g 3.0% | $149.41 | $124.95 | $106.42 |
| g 2.5% | $139.22 | $117.57 | $100.89 |
| g 2.0% | $130.43 | $111.08 | $95.95 |

## 8. Intrinsic Read

**Base intrinsic value is $117.57 per GOOGL share; the WACC/terminal-growth grid spans $95.95–$149.41, versus the pool-verified $278.99 price on 2026-11-03.** The point is most sensitive to whether roughly $200bn of FY2026 capex can fade from 40.3% to 18.0% of revenue while EBIT margin settles near 31.0%; terminal value still supplies 80.4% of EV, so this DCF is a low-confidence cross-check rather than a standalone fair-value conclusion. The $73.63 structural-reset sensitivity shows the permanent-impairment outcome if AI economics and the margin fade worsen.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — GOOGL

Alphabet is an operating company reporting under US GAAP in USD. Amounts are USD millions unless stated otherwise. This is an enterprise-value (EV) reverse-DCF for GOOGL, the Nasdaq Class A common-stock line.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $278.99, 2026-11-03; pool-verified | [CIQ facts sidecar, `current_price` = $278.99; source ref: CIQ Comps→Financial Data “Day Close Price Latest,” as of 2026-11-03] |
| Enterprise value | $3,523,015 | [Valuation Price & Capital Structure — GOOGL, §4; Q3 FY2026 Form 10-Q, Notes 4, 6, 7 and 11] |
| Normalized FCFF base | $164,932 in FY2031 | [Intrinsic DCF — GOOGL, §1 and §4] |
| Discount rate (WACC) used | 10.3705% | [Intrinsic DCF — GOOGL, §3] |
| Forecast horizon | Six years; mid-year discounting | [Intrinsic DCF — GOOGL, §4] |
| Terminal growth | 2.5% | [Intrinsic DCF — GOOGL, §5] |

The $164.932bn FCFF (free cash flow to all capital providers) base is the forward DCF's normalized post-build FY2031 cash flow. It is used verbatim rather than the literal TTM $19.747bn FCF or FY2025 $73.266bn FCF, because the latter two include the current AI-capex build and `04` identifies FY2031 as the reverse-DCF reference. [Intrinsic DCF — GOOGL, §1; data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Consolidated Statements of Cash Flows, p.51; CIQ facts sidecar, `ltm_ocf_m` = $179,551m, source ref: CIQ Financials→Cash Flow, LTM Sep-30-2026]

## 2. Implied Expectations

The primary normalised-base solve holds the $164.932bn FCFF base, 10.3705% WACC, 2.5% terminal growth, six-year horizon, and mid-year convention fixed. It solves `x` in:

`EV = Σ[FCFF₀ × (1 + x)^t / (1 + WACC)^(t − 0.5)] + [FCFF₀ × (1 + x)^6 × (1 + g) / (WACC − g)] / (1 + WACC)^5.5`, for `t = 1…6`.

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCFF CAGR over the six-year normalised horizon | **11.78%** |
| Implied years of above-terminal growth | **Six years** at 11.78%, before the 2.5% terminal fade |
| Implied steady-state EBIT margin | **Not separately solved**; `04`'s 31.0% is held fixed for the cash-flow conversion |
| FCFF in year six | $321,811 |
| Terminal value as a share of solved EV | 69.1% |

This is a cash-flow-growth solve, not a margin solve. The $321.811bn year-six FCFF is $164.932bn × 1.117848^6; the terminal FCFF is $329.856bn after 2.5% growth. Terminal value is more than 60% of EV, so the terminal-growth sensitivity is shown in §4. The primary solve does not force a CAGR from FY2026's negative $32.277bn FCFF, which would be mathematically meaningless; the full FY2026–FY2031 path is instead used without alteration in the dual discount-rate solve below. [Intrinsic DCF — GOOGL, §§1, 4 and 5]

Executed bisection solver (Python 3.12; amounts in USD millions):

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -c "EV=3523015.; W=.103705; TG=.025; N=6; B=164931.976; F=[-32277.063,17451.048,63679.325,113247.525,146723.324,164931.976];
def pg(x,w=W,b=B,g=TG):
 f=[b*(1+x)**t for t in range(1,N+1)]; return sum(v/(1+w)**(t-.5) for t,v in enumerate(f,1))+f[-1]*(1+g)/(w-g)/(1+w)**(N-.5)
def pp(w): return sum(v/(1+w)**(t-.5) for t,v in enumerate(F,1))+F[-1]*(1+TG)/(w-TG)/(1+w)**(N-.5)
def root(fn,lo,hi):
 flo=fn(lo)-EV
 for _ in range(300):
  m=(lo+hi)/2
  if flo*(fn(m)-EV)<=0: hi=m
  else: lo=m; flo=fn(lo)-EV
 return (lo+hi)/2
print(root(lambda x:pg(x),-.9,1)); print(root(pp,.026,.5))"
0.11784784950044391
0.06315989564080118
```

The first root is 11.7848%; it reproduces the $3,523,015m EV. The second root is the 6.3160% dual solve in §2A. The same executed solver produced every rate, base, and terminal-growth re-solve in §4.

## 2A. Implied Discount Rate — the dual solve (always run this)

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied discount rate at `04`'s base-case cash flows | `04`'s FY2026–FY2031 FCFF path, 2.5% terminal growth, six-year mid-year convention | **6.32%** |
| `04`'s model WACC (for comparison) | — | **10.37%** |
| Ratio (implied ÷ model) | — | **0.61×** |

The full `04` path values to $1,552,577m at 10.3705%, matching `04`; it reaches the current EV only at a 6.3160% discount rate. This is the market-implied-rate input for the pending row in `04` §3A. [Intrinsic DCF — GOOGL, §§3–5]

The 0.61× ratio is below, not above, the 1.5× escalation threshold. It therefore does not support the claim that the market prices an unprecedented cash-flow collapse. It also does not validate 6.32% as Alphabet's WACC: keeping `04`'s debt and preferred weights fixed would imply an equity cost of roughly 6.40%, only 1.11 percentage points above its 5.29% risk-free rate, below `04`'s 4-point equity-risk-premium floor. *Inference, not from filings.* The evidence-backed read is that the price needs cash flows above `04`'s path, a lower required return than `04` uses, or both; this reverse solve cannot distinguish the mix. [Intrinsic DCF — GOOGL, §3 and §3A]

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| 11.78% FCFF CAGR for six normalised years, after the current capex build | Reported FCF was $69.495bn in FY2023, $72.764bn in FY2024, and $73.266bn in FY2025: 2.68% CAGR. TTM Sep-2026 FCF was $19.747bn, down 73.2% year on year as capex rose 105.2%. | Search demand is the largest recurring EBIT lever in the sensitivity work: a static ±10% Q3 Search-revenue stress changes EBIT by ±$2.576bn. Cloud revenue rose 103% year on year in Q3, but higher depreciation, third-party compute and data-centre costs remain live constraints. These are sensitivities, not cash-flow forecasts. | **Stretch** |
| Sustain 31.0% EBIT margin and about 20.15% FCFF/revenue conversion while growing cash flow | FY2025 EBIT margin was 32.0%; nine-month FY2026 operating margin was 33.9%. This supports the margin level, but does not prove the post-build FCF conversion. | The earnings work identifies infrastructure cost and R&D as each having a static ±$1.276bn Q3 EBIT effect per 100bp change; management has flagged depreciation and compute-cost pressure. | **Stretch** |

The FCF comparison is matched to FCF, not revenue: historical FCF has been broadly flat, while the price needs 11.78% normalised FCFF growth. Revenue grew 14.48% CAGR in FY2023–FY2025, but that is not evidence that FCF can grow at the same rate while capex remains elevated. [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2023–FY2025, Consolidated Statements of Cash Flows and Income, pp.49–51; Historical Financials — GOOGL, §§1–2]

The business case is not disproven: Cloud revenue and contracted backlog can support post-build growth. But the moat read is narrow and stable rather than widening; vendor ROIC fell from 19.3% in FY2025 to 15.6% LTM September 2026 as cash conversion also declined. The next FY2026 full-year ROIC on the same basis is the clean disconfirmation point: recovery above FY2025's 19.3% would support the cash-flow premise; a further fall below 15.6% would weaken it. [Earnings Sensitivity — GOOGL, §§2–4; Moat — GOOGL, §§3 and 5]

Market-ceiling sanity check: holding `04`'s FY2031 FCFF/revenue conversion fixed at 20.15% ($164.932bn ÷ $818.531bn), the $321.811bn year-six FCFF requirement translates to roughly $1.597tn of revenue. *Inference, not from filings.* The admitted pool has no credible total addressable market for Alphabet's combined advertising, cloud, subscriptions, devices, and Other Bets businesses, so a market-share ceiling cannot be tested without inventing a TAM. This check therefore provides no upside support. [Intrinsic DCF — GOOGL, §§2 and 4]

## 4. Robustness

| Discount Rate | Implied FCFF CAGR to Justify Price |
|---|---:|
| WACC −1%: 9.3705% | 8.88% |
| WACC: 10.3705% | 11.78% |
| WACC +1%: 11.3705% | 14.47% |

| FCFF Starting Base | Basis | Implied FCFF CAGR to Justify Price |
|---|---|---:|
| $19,747 | Literal TTM FCF | 63.96% |
| $73,266 | Literal FY2025 reported FCF | 29.97% |
| $164,932 | `04` normalized FY2031 FCFF — primary-model base | 11.78% |

| Terminal Growth | Implied FCFF CAGR to Justify Price |
|---|---:|
| 2.0% | 12.76% |
| 2.5% | 11.78% |
| 3.0% | 10.74% |

The FCF-base choice is the dominant input: the literal-TTM-to-normalised-base range changes the solved growth rate by 52.18 percentage points, versus 5.60 points for WACC ±1% and 2.02 points for terminal growth ±0.5%. The literal FCF rows are not replacements for `04`'s normalized base; they show why the conclusion depends on the assumed success of the capex normalization. [Intrinsic DCF — GOOGL, §§1, 4 and 5; data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Consolidated Statements of Cash Flows, p.51; CIQ facts sidecar, `ltm_ocf_m`, source ref: CIQ Financials→Cash Flow, LTM Sep-30-2026]

## 5. What's-Priced-In Read

At $278.99, the market price requires 11.78% annual FCFF growth for six years from `04`'s $164.932bn normalised post-build base, with a 2.5% terminal growth rate and a 10.3705% WACC. That is **stretch**, not conservative: it is well above the 2.68% FY2023–FY2025 reported-FCF CAGR, and it relies on AI capex falling from its current intensity while returns on the new capacity improve. [CIQ facts sidecar, `current_price`; Intrinsic DCF — GOOGL, §§1–5; Historical Financials — GOOGL, §1]

The price is not a clean signal that the market is pessimistic. Holding `04`'s full cash-flow path fixed instead gives a 6.32% implied discount rate, but that rate would violate `04`'s equity-risk-premium floor; the evidence therefore points to a cash-flow expectation above `04`'s base, not a defensible conclusion that the market has mispriced a collapse.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — GOOGL

## 1. Segment Inventory

Alphabet reports under U.S. GAAP in USD. The latest filed segment data are for the nine months ended 30 September 2026, in USD millions. “% of Total EBIT” below uses **reportable-segment operating income** of $139.877bn ($119.290bn Google Services + $26.533bn Google Cloud − $5.946bn Other Bets), which sums to 100%; Alphabet-level activities are a separate unallocated cost pool and are not in that denominator.

| Segment | Revenue | EBIT (or EBITDA) | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| Google Services | $280.479bn | $119.290bn EBIT | 42.5% | 85.3% | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 2026, Note 15, pp. 41–42] |
| Google Cloud | $75.505bn | $26.533bn EBIT | 35.1% | 19.0% | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 2026, Note 15, pp. 41–42] |
| Other Bets | $1.165bn | $(5.946)bn EBIT | (510.4%) | (4.3%) | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 2026, Note 15, pp. 41–42] |
| Alphabet-level activities (unallocated cost pool) | — | $(18.835)bn EBIT | — | Not in reportable-segment denominator | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 2026, Note 15, pp. 41–42] |

The revenue tie-out is $280.479bn + $75.505bn + $1.165bn + $0.120bn unallocated hedging gain = $357.269bn total revenue. The operating-income tie-out is $119.290bn + $26.533bn − $5.946bn − $18.835bn = $121.042bn consolidated income from operations. Alphabet does not disclose segment assets or capex, so segment returns and capital intensity cannot be rebuilt from the filing. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 2026, Note 15, pp. 41–42]

## 2. Segment Multiples & Comparables

The period basis is **NTM**, not trailing. Capital IQ supplies consolidated NTM revenue of $599.565bn but no NTM segment forecasts. The segment allocation is therefore an explicit inference, not from filings: $414.0bn Services + $184.0bn Cloud + $1.5bn Other Bets + $0.065bn hedging = $599.565bn. It gives Cloud most of the forecast mix shift because Cloud revenue was $30.709bn in Q3, up 103% year on year, and management said TPU-system sales should scale in Q4 and ramp further in 2027; the filing does not split that growth between recurring consumption, TPU systems, or acquired revenue. [data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls, Capital IQ Estimates→Consensus (Market Summary), NTM; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 2026, Note 15, pp. 41–42; data/GOOGL/Alphabet Inc., Q3 2026 Earnings Call, 2026-10-28, prepared remarks]

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| Google Services | NTM revenue $414.0bn (inferred) | 5.35x EV/revenue | Meta Platforms | 5.35x NTM EV/forward revenue | [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Capital IQ Comps→Trading Multiples, 2026-11-03; data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls, Capital IQ Estimates→Consensus (Market Summary), NTM] |
| Google Cloud | NTM revenue $184.0bn (inferred) | 7.00x EV/revenue | Microsoft | 9.26x NTM EV/forward revenue | [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Capital IQ Comps→Trading Multiples, 2026-11-03; data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls, Capital IQ Estimates→Consensus (Market Summary), NTM] |
| Other Bets | Not structurally forward basis — excluded | — | No matching forward comparable | — | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 2026, Note 15, pp. 41–42] |
| Alphabet-level activities | No revenue metric; capitalized as a cost in the bridge | — | — | — | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 2026, Note 15, pp. 41–42] |

Meta is the closest large advertising-attention platform for Google Services; its business is not pure search, so the 5.35x anchor is not given a premium. Microsoft is the closest named first-party hyperscale-cloud comparable. Google Cloud receives 7.00x, below Microsoft’s 9.26x, because its latest reported segment operating margin is 35.1% and management identified near-term Cloud-margin pressure from capacity costs. This is a revenue-multiple adjustment, where profitability is not already in the denominator; it is not a mechanical margin-ratio haircut. [data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Capital IQ Comps→Trading Multiples, 2026-11-03; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 2026, Note 15, pp. 41–42; data/GOOGL/Alphabet Inc., Q3 2026 Earnings Call, 2026-10-28, prepared remarks]

Other Bets has no usable forward profit forecast or matching forward comparable in the admitted evidence. It is excluded rather than valued on trailing losses, but its latest reported LTM loss is capitalized below so it does not disappear from the bridge. The $24.729bn Alphabet-level and $9.563bn Other Bets LTM cost run-rates are reconstructed from FY2025 and nine-month 2026 segment disclosures; this is an explicit bridge convention, not a trailing-earnings SOTP. A 12.0x capitalization factor is below Alphabet’s 15.34x FY2027 forward EV/EBIT vendor multiple, giving partial credit for uncertain duration and optionality rather than assuming either cost pool is worth zero. [data/GOOGL/Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc, FY2025, Note 15, pp. 86–87; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 2026, Note 15, pp. 41–42; data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls, Capital IQ Estimates→Multiples, FY2027]

## 3. Segment Valuation

All values below are USD billions. Enterprise value (EV) is the value of the operations before debt, cash, and other financing claims.

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Google Services | $414.0bn NTM revenue | 5.35x | $2,214.9bn |
| Google Cloud | $184.0bn NTM revenue | 7.00x | $1,288.0bn |
| Other Bets | Excluded; loss capitalized in bridge | — | — |
| **Gross enterprise value (sum)** |  |  | **$3,502.9bn** |

Formula: ($414.0bn × 5.35) + ($184.0bn × 7.00) = $3,502.9bn. The multiple-driven sensitivity is $201–$297 per share: Services at 4.8x–6.0x and Cloud at 5.5x–9.26x, with the same bridge below. That is a sensitivity range, not a second weighted fair-value estimate.

## 4. Equity Bridge

Values are USD billions except per-share amounts. The strict net-debt line is subtracted once: $73.489bn = $129.823bn filing debt including finance leases − $56.334bn cash and equivalents; marketable securities are not netted.

| Step | Value |
|---|---:|
| Gross enterprise value | $3,502.9bn |
| − Capitalized Alphabet-level unallocated corporate costs | $(296.7)bn ($24.729bn LTM × 12.0x) |
| − Capitalized excluded Other Bets loss | $(114.8)bn ($9.563bn LTM × 12.0x) |
| − Net debt (strict) | $(73.5)bn |
| − Minority / preferred | $(24.9)bn ($6.9bn NCI + $18.0bn mandatory-convertible preferred equity) |
| + Equity-method investments | $0.0bn — not separately quantified |
| − Conglomerate / holdco discount (if any) | $0.0bn |
| **= Equity value** | **$2,993.0bn** |
| ÷ Diluted shares | 12.368bn |
| **= SOTP value per share** | **$241.99** |
| vs current price | **$(37.00) / (13.3%)** versus $278.99 |

The bridge uses the canonical valuation anchor: 12.368bn fully diluted shares, $73.489bn strict net debt, $6.900bn non-controlling interests, and $18.023bn preferred equity. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 2026, Notes 4, 6, 7, 11 and 12; data/GOOGL/Company Comparable Analysis Alphabet Inc.xls, Capital IQ Comps→Financial Data, 2026-11-03; deterministic `ciq_facts.json`, `current_price` and `shares_outstanding_m`] No conglomerate discount is applied because Alphabet is not a holding company and the shared-cost and Other Bets drags are explicitly capitalized; a second discount would duplicate those deductions.

## 5. SOTP Read

The base SOTP is **$241.99 per GOOGL Class A share**, $37.00 or 13.3% below the pool-verified $278.99 price; the multiple-only sensitivity is broad at $201–$297 because no segment consensus or pure-play Cloud comparable is in the evidence set. Google Services carries $2.21tn, or 63% of gross segment EV, while Cloud carries $1.29tn, or 37%, despite 31% of the NTM revenue allocation. Cloud is the value amplifier, but the $411.5bn capitalized Alphabet-level and Other Bets drag prevents the breakup from establishing a discount to the current price.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — GOOGL

Alphabet reports under U.S. GAAP in USD. Every level below applies to **GOOGL Class A common stock on Nasdaq Global Select Market, USD**, and uses the valuation anchor's 12,368m fully diluted shares. The $278.99 current price is pool-verified as of 2026-11-03. [Q3 FY2026 Form 10-Q, cover and Note 12; Capital IQ Comps → Financial Data, subject row, 2026-11-03; deterministic `ciq_facts.json` `current_price`]

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $299.76 base P/NTM EPS; $353.46–$360.09 P/B cross-check | Medium-low | 45% | The P/NTM EPS band is the cleanest admissible own-history series: 17.23x–29.40x, with a 21.87x median. P/B is retained only as a secondary cross-check because it does not test the return on the AI and Cloud build. [Valuation 02 Multiples — GOOGL, §§2 and 4; CIQ Financials → Multiples, 2021-12-31–2026-11-02] |
| Relative / peers (03) | $305.19 base NTM P/E; $210.90–$305.19 internal peer-method field | Medium-low | 30% | NTM P/E values equity after depreciation, interest and tax. The peer set is economically relevant but its EV/revenue and EV/EBITDA outputs disagree with P/E, and the peer-cycle history is not assessable. [Valuation 03 Relative Valuation — GOOGL, §§2, 5 and 6; Capital IQ Comps → Trading Multiples, 2026-11-03] |
| Intrinsic DCF (04) | $117.57; WACC/growth grid $95.95–$149.41 | Low | 15% | FCFF is the applicable intrinsic method for an operating company, but 80.4% of its EV is terminal value and its result depends on capex falling from 40.3% of FY2026 revenue to 18.0% by FY2031. [Valuation 04 Intrinsic DCF — GOOGL, §§2, 5–8; Capital IQ Estimates → Consensus, FY2026] |
| Reverse-DCF (05) | 11.78% six-year normalized FCFF CAGR implied; not a fair-value output | Cross-check | n/a | It tests whether the selected levels require an achievable cash-flow outcome; it is not a weighted value. [Valuation 05 Reverse DCF — GOOGL, §§2–5] |
| Sum-of-the-parts (06) | $241.99; multiple-only sensitivity $201–$297 | Low | 10% | It recognizes the separate Services and Cloud economics, but NTM segment revenue is inferred and the Alphabet-level and Other Bets cost capitalization is judgmental. [Valuation 06 Sum-of-the-Parts — GOOGL, §§2–5; Q3 FY2026 Form 10-Q, Note 15] |

Weights sum to 100%. GOOGL is an operating company with a usable NTM earnings measure, so the two multiples lenses carry 75%, while DCF and SOTP together are 25%. Reverse-DCF is a cross-check only. The 02 P/NTM band is admissible: its sector proxy did not show a material five-year same-direction move. The 03 peer reference has no admitted sector-multiple history, so it is not a proven stable anchor. [Valuation 02 Multiples — GOOGL, §5; Valuation 03 Relative Valuation — GOOGL, §6]

## 2. Triangulation & Reconciliation

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history P/NTM EPS | $299.76 base; P/B cross-check $353.46–$360.09 | Medium-low | 45% | Uses the admissible forward-EPS history; the P/B result gets no extra weight. |
| Peer relative valuation | $305.19 base; $210.90–$305.19 field | Medium-low | 30% | The P/E result is the most directly comparable equity lens, but peers give conflicting revenue and EBITDA values. |
| DCF | $117.57; $95.95–$149.41 grid | Low | 15% | Terminal-dominated, capital-intensity-sensitive cash-flow lens. |
| SOTP | $241.99; $201–$297 sensitivity | Low | 10% | Segment structure is useful, but the NTM allocation and cost capitalization are inferred. |
| Reverse-DCF | Price requires 11.78% normalized FCFF CAGR for six years | Cross-check | n/a | It informs the realism of the multiple-led levels, not their arithmetic. |

The high-to-low field of the four primary value-producing method points is **$117.57–$305.19**, a **159.6%** spread relative to the low. That is the headline finding and caps valuation confidence at 55/100. The broader football-field endpoints disclosed by the producers — the DCF grid low and P/B cross-check high — are $95.95–$360.09, a 275.3% spread; those are not silently blended into the base point. [Valuation 02 Multiples — GOOGL, §4; Valuation 03 Relative Valuation — GOOGL, §5; Valuation 04 Intrinsic DCF — GOOGL, §7; Valuation 06 Sum-of-the-Parts — GOOGL, §3]

The mechanically weighted base value is **$268.28 per share**. This trusts the forward P/E lenses most, as required for an operating company with estimates, but does not ignore the DCF's low cash-conversion result or the SOTP's capitalized corporate-cost drag. The gap is real rather than a rounding issue: the DCF assumes a 10.37% WACC and a long capex normalization, while the multiples methods capitalize NTM earnings without proving that post-build free-cash-flow conversion. [Valuation 04 Intrinsic DCF — GOOGL, §§2–5; Valuation 02 Multiples — GOOGL, §4; Valuation 03 Relative Valuation — GOOGL, §5]

The two multiples reads are not independent corroboration. Both use Capital IQ forward data and market-based reference levels; additionally, 03 cannot test whether the peer-group median is cycle-elevated or depressed. 02 found no material move in its broad Nasdaq-100 proxy, so no same-direction cycle tag fires, but the untested peer anchor remains a confidence limitation. [Valuation 02 Multiples — GOOGL, §5; Valuation 03 Relative Valuation — GOOGL, §6]

## 3. Bull / Base / Bear Fair-Value Levels

All three headline cases use the same measure and period: **NTM consensus GAAP EPS expressed on a 12,368m fully diluted-share equivalent basis**. The $13.706 base is the dilution-consistent equivalent of the admissible 02 P/NTM EPS build ($299.76 ÷ 21.87x), not a new earnings forecast. The ±15% EPS changes are **inference, not from filings**, informed by the earnings sensitivity work rather than a reported consensus range: the individual Search, Cloud, cost and R&D stresses are quarter-sized, non-additive, and explicitly not forecasts. [Valuation 02 Multiples — GOOGL, §4; Earnings Sensitivity — GOOGL, §§2 and 5]

| Case | Fair Value / Share (point) | Forward Metric (EPS/EBITDA) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **$378.30** | $15.76 NTM GAAP EPS, fully diluted equivalent | 24.00x P/NTM EPS | 12 months, to Nov. 2027 | Search advertiser demand and monetisation improve while Cloud converts demand without the expected depreciation, third-party-compute and data-centre costs taking the gains. The 24.00x is inside the admissible 17.23x–29.40x own-history P/NTM band. [Earnings Sensitivity — GOOGL, §§2–4; Valuation 02 Multiples — GOOGL, §2] |
| Base | **$268.28** | $13.71 NTM GAAP EPS, fully diluted equivalent | 19.57x P/NTM EPS effective multiple | 12 months, to Nov. 2027 | This is the disclosed 45% / 30% / 15% / 10% method blend. It assumes the forward earnings base is achieved but assigns less than the 21.87x own-history median because returns on the AI capacity build and post-build cash conversion remain unproven. [Valuation 02 Multiples — GOOGL, §4; Valuation 04 Intrinsic DCF — GOOGL, §§2 and 8; Business Quality — GOOGL, §§1 and 4] |
| Bear | **$200.74** | $11.65 NTM GAAP EPS, fully diluted equivalent | 17.23x P/NTM EPS | 12 months, to Nov. 2027 | A 15% earnings shortfall coincides with compression to the historical P/NTM low: weaker advertiser budgets or Search monetisation, slower Cloud conversion, and higher infrastructure or R&D intensity. These drivers can overlap, so the result does not add the separate static stresses. [Earnings Sensitivity — GOOGL, §§2, 5 and 6; External Dependency Check — GOOGL, §§1 and 5; Valuation 02 Multiples — GOOGL, §2] |

The executed arithmetic is below. It uses upstream method outputs and the dilution-consistent NTM EPS equivalency; it does not re-run a valuation method.

```text
$ awk 'BEGIN { own=299.76; peer=305.19; dcf=117.57; sotp=241.99; price=278.99; base=.45*own+.30*peer+.15*dcf+.10*sotp; eps=own/21.87; bull=eps*1.15*24.00; bear=eps*.85*17.23; printf "base=$%.2f; EPS=$%.5f; base P/E=%.2fx; bull=$%.2f; bear=$%.2f; MOS=%.2f%%; downside=%.2f%%\\n", base, eps, base/eps, bull, bear, (base-price)/base*100, (price-bear)/price*100 }'
base=$268.28; EPS=$13.70645; base P/E=19.57x; bull=$378.30; bear=$200.74; MOS=-3.99%; downside=28.05%
```

**Avoid-ruin floor — not the 12-month headline bear:** the structural-reset trigger fires because business quality assigns the AI-led rate-of-change / disruption row **40/100**, while the moat verdict is **Narrow, stable (mixed)** rather than confirmed eroding. The policy therefore keeps the $200.74 cyclical/operating bear as the headline 12-month case and carries the 24–36-month structural reset separately. [Business Quality — GOOGL, §§1 and 4, `RF-BQ-005`; Moat — GOOGL, §5]

The carried-forward structural-reset DCF value is **$73.63 per share**. It uses a 27.0% FY2031 EBIT margin, 20.0% capex/revenue, 1.0% terminal growth, and the same strict net-debt, NCI, preferred-equity and diluted-share bridge; this is an avoid-ruin floor, not a headline case. The bridge reconciles as $1,009,068m implied impaired EV − $73,489m strict net debt − $6,900m NCI − $18,023m preferred equity = $910,656m equity ÷ 12,368m diluted shares = $73.63 per share. The implied EV is a mechanical reconciliation of 04's published per-share result, **inference, not from filings**, not an independent DCF rerun. [Valuation 04 Intrinsic DCF — GOOGL, §5; Valuation 01 Price & Capital Structure — GOOGL, §§4–5]

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | $278.99, pool-verified on 2026-11-03 [Capital IQ Comps → Financial Data, subject row; deterministic `ciq_facts.json` `current_price`] |
| Base-case fair value (point) | $268.28 |
| Bear-case fair value | $200.74 |
| Implied upside to base case = (base FV − price) / price (%) | **(3.84%)** |
| **Margin of safety** = (base FV − price) / base FV — the cushion (%) | **(3.99%)** — no cushion at the current price |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* (%) | **28.05%** |

The price is pool-verified, so price-relative metrics are assessable. Margin of safety and downside to bear use different denominators and answer different questions; the first is a negative base-case cushion and the second is the loss from the current price to the 12-month bear level.

## 5. Warranted-Multiple Check

The base's 19.57x P/NTM EPS multiple is below the current 20.24x and inside the admissible 17.23x–29.40x own-history band, so it does not require a multiple that Alphabet has never sustained. [Valuation 02 Multiples — GOOGL, §§1–2] It is nevertheless not a durable entitlement: business quality is 62/100, the moat is narrow and stable rather than widening, and the rate-of-change score is 40/100 while capex reached $132.0bn in the first nine months of FY2026. [Business Quality — GOOGL, §§1–4; Moat — GOOGL, §5; Q3 FY2026 Form 10-Q, Item 2] The multiple is warranted only if Search and Cloud monetize the enlarged infrastructure base without a further fall in vendor-defined ROIC and cash conversion; those are not proven from available data. [Moat — GOOGL, §5; Valuation 05 Reverse DCF — GOOGL, §3]

## 6. Fair-Value Read

The 12-month fair-value levels are **$378.30 bull, $268.28 base, and $200.74 bear** per GOOGL Class A share; the separate 24–36-month avoid-ruin floor is $73.63. At the $278.99 pool-verified price, the base is 3.84% below price, margin of safety is negative 3.99%, and downside to the 12-month bear is 28.05%. The result is driven by forward P/E lenses, but the $117.57 DCF and $241.99 SOTP keep the base below the multiples-only values and create a 159.6% primary-method spread. The biggest swing factor is whether AI and Cloud capex converts into post-build free cash flow while Search advertising demand holds; the reverse-DCF says the current price needs 11.78% normalized FCFF growth for six years. [Valuation 04 Intrinsic DCF — GOOGL, §8; Valuation 05 Reverse DCF — GOOGL, §5]
