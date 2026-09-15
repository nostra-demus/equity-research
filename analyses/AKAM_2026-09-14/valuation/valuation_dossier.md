# valuation Module Dossier — AKAM

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-09-14T10:57:39Z
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

# Valuation Module — AKAM (Synthesis)

## Abstract

AKAM is materially overvalued: the $68.78 base fair value is 35.6% below the $106.79 pool-verified price. The 12-month levels are $109.66 bull, $68.78 base and $45.65 bear_cyclical, all set by one discounted-cash-flow (DCF) model, which values future cash and is mostly driven by cash beyond the detailed forecast; a separate 24–36 month structural floor is $33.99. The price implies 16.35% annual free-cash-flow (FCF, cash from operations less cash capex) growth to $1.245bn by FY2030, a stretch not proven by matched cash history or current margins. Margin of safety—the base-value cushion—is −55.3%, while the 12-month bear implies 57.3% downside. The verdict is materially overvalued, with confidence capped because no second valid value-producing method exists. [valuation/01_price-and-capital-structure.md, Anchor Block; valuation/05_reverse-dcf.md, §§2–5; valuation/07_scenario-and-fair-value.md, §§1–6]

## 1. Valuation Verdict

- **Verdict:** **Materially overvalued** — the $68.78 base fair value is 35.6% below the $106.79 price. [valuation/07_scenario-and-fair-value.md, §§4, 6]
- **Base-case fair value (point, per share):** **$68.78**. [valuation/04_intrinsic-dcf.md, §§6–8; valuation/07_scenario-and-fair-value.md, §§1–3]
- **Current price:** **$106.79**, pool-verified day close on 2026-09-14 for AKAM common stock on Nasdaq Global Select Market in USD. [CIQ Comps → Financial Data, “Day Close Price Latest” subject row, data as of 2026-09-14; valuation/01_price-and-capital-structure.md, §§1, 7]
- **Bull / Base / Bear fair-value levels (points):** **bull $109.66 / base $68.78 / bear_cyclical $45.65**, each a 12-month convergence level; **bear_structural $33.99** is a separate 24–36 month avoid-ruin floor. [valuation/07_scenario-and-fair-value.md, §3]
- **Cross-method dispersion (football field, low–high):** **Not assessable — one valid value-producing method.** The DCF’s $45.65–$109.66 sensitivity span is within-method uncertainty, not cross-method corroboration. [valuation/07_scenario-and-fair-value.md, §2]
- **Valuation attractiveness /100** *(higher = cheaper)*: **10** — base fair value is 35.6% below price and the DCF-grid bull is only 2.7% above price. [valuation/07_scenario-and-fair-value.md, §§3–4]
- **Margin of safety /100** *(higher = better)*: **5** — margin of safety is **−55.3% = ($68.78 − $106.79) / $68.78**, so there is no base-value cushion. [valuation/07_scenario-and-fair-value.md, §4]
- **Valuation confidence /100:** **50** — capped because only the DCF produces a valid fair-value point; its terminal value, the estimated worth after the detailed forecast, is 82.2% of enterprise value. [valuation/04_intrinsic-dcf.md, §5; valuation/07_scenario-and-fair-value.md, §§1–2]
- **Downside risk /100** *(higher = worse; inverted)*: **85** — the 12-month bear implies 57.3% downside, while the separate 24–36 month structural floor implies 68.2%. [valuation/07_scenario-and-fair-value.md, §§3–4]
- **Data quality /100:** **72** — price, filings, consensus, cash flow and capital structure are usable, but own-multiple history is only six closes and the supplied peer matrix cannot support a warranted value. [valuation/00_valuation-data-triage.md, §§3, 5–6A; valuation/02_multiples-own-history.md, §§2–4; valuation/03_relative-valuation-peers.md, §§2–5]
- **Overall usefulness /100:** **62** — the module gives reproducible cash-based levels and a reverse-DCF expectation test, but it cannot triangulate across independent value-producing methods. [valuation/05_reverse-dcf.md, §§2–5; valuation/07_scenario-and-fair-value.md, §§1–2]
- **Dominant valuation method:** Intrinsic FCFF DCF — free cash flow to the firm discounted and bridged from enterprise value to equity — because it is the only complete, filing-bridged value-producing method; its 82.2% terminal-value share keeps confidence low. [valuation/04_intrinsic-dcf.md, §§1, 4–8]
- **What’s priced in:** At $106.79, the reverse DCF at a fixed weighted-average cost of capital (WACC, the return demanded by lenders and shareholders) requires **16.35% annual FCF growth** from $629.9m LTM to $1.245bn in FY2030, or a 19.21% FY2030 FCF margin on the DCF revenue path; this is a stretch not proven by the matched FCF record. [valuation/05_reverse-dcf.md, §§2–5]
- **Biggest valuation risk:** The fair-value point rests on one terminal-dominated model; a 1 percentage-point WACC and 0.5 percentage-point terminal-growth swing spans $45.65–$109.66 per share. [valuation/04_intrinsic-dcf.md, §§5, 7]

## 1A. Module Disconfirmation

- **Strongest bear point:** The market requires 16.35% annual FCF growth through FY2030, versus 6.34% matched FCF CAGR in FY2023–FY2025 and a 9.92% LTM decline; the $68.78 DCF base is 35.6% below price. [valuation/05_reverse-dcf.md, §§3, 5; valuation/07_scenario-and-fair-value.md, §4]
- **Strongest bull point:** Security revenue grew 10% and CIS grew 39% in Q2 FY2026, and the top valid DCF sensitivity reaches $109.66, 2.7% above price, if the forecast cash path holds with 5.22% WACC and 1.30% terminal growth. The earnings evidence does not separately prove that cash conversion. [valuation/05_reverse-dcf.md, §3; valuation/07_scenario-and-fair-value.md, §3]
- **Single killer risk:** Terminal value supplies 82.2% of DCF enterprise value, so the sole fair-value method can move sharply on small discount-rate or terminal-growth changes. [valuation/04_intrinsic-dcf.md, §§5, 7]
- **Disconfirming evidence already visible:** Holding the DCF cash path fixed, the market price reconciles at a 5.05% implied WACC, 1.17 percentage points below the model’s 6.22%; a persistently lower required return would support the current price without the full 16.35% FCF-growth solve. [valuation/05_reverse-dcf.md, §2A]

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | **Sufficient**, with method limitations. | The pool has current price, filings, cash flow, consensus and peer data, but only six own-history closes; sum-of-the-parts (SOTP, valuing separate businesses individually) is not applicable because AKAM has one reportable segment. [valuation/00_valuation-data-triage.md, §§3, 5–6A] |
| price-and-capital-structure | **Pool-verified anchor established.** | $106.79 price, 153.686m diluted working shares and $6,082.6m strict net debt (total debt less cash and equivalents) produce the canonical bridge; CIQ’s lease- and investment-inclusive debt fields are reconciled but not substituted. [valuation/01_price-and-capital-structure.md, §§2, 4–7] |
| multiples-own-history | **Upper-range directional read; fair value not assessable.** | Current price/next-twelve-month normalized earnings (P/NTM EPS) is 11.9% above its six-close mean, but roughly 1.5 years of history cannot support a reversion value. [valuation/02_multiples-own-history.md, §§2–6] |
| relative-valuation-peers | **Warranted peer value not assessable.** | The apparent 77.4% EV/EBITDA discount (enterprise value divided by earnings before interest, tax, depreciation and amortization) uses a heterogeneous 59.4x median and a subject multiple that does not reconcile to the filing bridge; $377.81 is mechanical only. [valuation/03_relative-valuation-peers.md, §§2–7] |
| intrinsic-dcf | **Base intrinsic value $68.78; low confidence.** | Terminal value is 82.2% of EV; the sensitivity grid is $45.65–$109.66, with a $33.99 structural-runoff input. [valuation/04_intrinsic-dcf.md, §§5–8] |
| reverse-dcf | **Current price embeds a stretch not proven by available data.** | $106.79 requires 16.35% annual FCF growth to $1.245bn in FY2030 at the model WACC, or a 19.21% margin on the DCF revenue path. [valuation/05_reverse-dcf.md, §§2–5] |
| sum-of-the-parts | **Effectively single-segment — SOTP collapses.** | Security, Delivery and CIS are revenue categories without separate profit or capital data, so no independent breakup value is produced. [valuation/06_sum-of-the-parts.md, §§1–5] |
| scenario-and-fair-value | **Single-method fair value; confidence capped at 50.** | The 12-month levels are $109.66 / $68.78 / $45.65, plus a distinct $33.99 structural floor over 24–36 months. [valuation/07_scenario-and-fair-value.md, §§1–6] |

## 3. Reconciliation

A cross-method football field cannot be built: **$68.78 from the intrinsic DCF is the only valid value-producing point**, so cross-method dispersion is Not assessable rather than 0%. The $45.65–$109.66 range is the DCF sensitivity grid, not evidence from independent methods. The single-method cap therefore limits valuation confidence to 50/100, while terminal dominance independently limits it to 60/100. [valuation/04_intrinsic-dcf.md, §§5–7; valuation/07_scenario-and-fair-value.md, §§1–2]

The multiples-first policy cannot operate because neither multiples specialist produced a usable forward implied value: own history is only six closes, and the heterogeneous peer set supplies no defensible warranted multiple. This is the policy’s named **no usable forward multiple** exception, so the DCF carries 100% mechanical weight without implying high trust. The $377.81 peer result is excluded because it applies the 59.4x broad-basket median mechanically, and SOTP is excluded because AKAM has one reportable segment. [valuation/02_multiples-own-history.md, §§2–4; valuation/03_relative-valuation-peers.md, §§2–5; valuation/06_sum-of-the-parts.md, §§1–5; valuation/07_scenario-and-fair-value.md, §§1–2]

Within the DCF, the $68.78 Gordon-growth base sits above the $60.03 exit-multiple check, while the separate declining-perpetuity case falls to $33.99. The reverse-DCF also cuts against false certainty: the market-implied WACC is 5.05% versus the model’s 6.22%, so part of the valuation gap may be the required return rather than cash growth alone. Even so, at the model WACC the current price needs 16.35% annual FCF growth, which the matched cash-flow history and current margin evidence do not prove. [valuation/04_intrinsic-dcf.md, §§5–8; valuation/05_reverse-dcf.md, §§2A–5]

**Sector Cycle Reality Test roll-up:** `02` emitted no cycle tag because the available IGV price proxy rose 14.1%, below the roughly 25% guide, though it was not sector-multiple history. `03` was **Not assessable — no sector-level multiple history** and emitted no tag. There is therefore no same-direction cycle flag to compound, but the absence of a flag is not evidence that either zero-weight multiple anchor is sound. [valuation/02_multiples-own-history.md, §5; valuation/03_relative-valuation-peers.md, §6; valuation/07_scenario-and-fair-value.md, §2]

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N — $106.79 is pool-verified on 2026-09-14 | MoS, downside-to-bear (Downside-risk score), observed up/down, attractiveness + confidence | N/A; price-relative scores remain assessable |
| Stale pool-verified price (>5 trading days) | N — zero trading days old | Valuation confidence | N/A |
| No consensus / forward estimates | N — FY2026–FY2028 consensus is available, with an undated-export freshness caveat | Valuation confidence | N/A |
| No peer data | N — a dated peer export exists, although it cannot support a warranted value | Overall usefulness | N/A |
| Only one valuation method usable | **Y** | Valuation confidence | **max 50; final 50** |
| No cash flow AND DCF is only method | N — filing cash-flow statements and LTM FCF are available | Valuation confidence | N/A |
| SOTP not possible for multi-segment | N — AKAM is effectively single-segment, so collapse is not a missing-data cap | Overall usefulness | N/A |
| Full high-to-low field of valid value-producing methods exceeds 40% | N — the field is Not assessable because only one method produced value | Valuation confidence | N/A; single-method cap applies |
| Terminal value >75% of DCF EV | **Y — 82.2%** | Valuation confidence | max 60; superseded by stricter max 50 |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | N — no controlling-owner structure was flagged | Valuation attractiveness | N/A; operating value-trap risk remains |
| Sector Cycle Reality Test flags `02` and/or `03` cycle-elevated/depressed, unreconciled | N — `02` emitted no tag; `03` was Not assessable | Valuation confidence | N/A |

## 5. Fair-Value Summary

The 12-month levels are **$109.66 bull, $68.78 base and $45.65 bear_cyclical**, with a separate **$33.99 bear_structural** floor over 24–36 months; the $68.78 base is set entirely by the FCFF DCF because no multiple or SOTP method produced a valid point. [valuation/07_scenario-and-fair-value.md, §§1–3] At $106.79, the price implies 16.35% annual FCF growth to $1.245bn by FY2030 or a 19.21% margin on the DCF revenue path, a stretch not proven by matched cash history or current margins. [valuation/05_reverse-dcf.md, §§2–5] Margin of safety is **−55.3%** against the $68.78 base, while downside to the $45.65 12-month bear is **57.3%**; the $33.99 structural floor implies **68.2%** downside on its longer horizon. [valuation/07_scenario-and-fair-value.md, §4] The apparent 77.4% peer discount is value-trap risk rather than proven value because the comparison is heterogeneous and unreconciled, while no economic moat is proven, business quality is 48/100, disruption risk is 35/100 and strict net debt/GAAP-derived EBITDA is 5.14x. [valuation/01_price-and-capital-structure.md, §5; valuation/03_relative-valuation-peers.md, §§2–7; valuation/07_scenario-and-fair-value.md, §5] There is no RF-OWN-004 owner flag; the trap risk comes from business durability, leverage and unsupported cash conversion, not a controlling owner. [valuation/07_scenario-and-fair-value.md, §5]

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Materially overvalued — $68.78 base is 35.6% below $106.79 | Evidence that Security and CIS growth converts into FCF near the reverse-DCF requirement: roughly $1.245bn by FY2030, or a 19.21% margin on $6.482bn revenue, together with support for a required return near the 5.05% market-implied WACC. [valuation/05_reverse-dcf.md, §§2–3] | Persistent CFO margin near H1 FY2026’s 29.4%, cash capex near 20% of revenue, Delivery price pressure, or a move toward the 7.22% WACC / 0.30% terminal-growth sensitivity would support $45.65; a lasting decline supports the $33.99 structural floor. [valuation/04_intrinsic-dcf.md, §§2, 5, 7; valuation/07_scenario-and-fair-value.md, §3] | **Single highest-value next request:** a consistent, same-date peer export with EV, LTM and NTM revenue, EBITDA, EBIT, EPS, FCF and net debt for the named peers, sufficient to build a second matched-basis value-producing method. [valuation/03_relative-valuation-peers.md, §5] |

## 7. Note To The Final Synthesizer

- Use the valuation module’s case identities unchanged: **bull $109.66 / base $68.78 / bear_cyclical $45.65** at 12 months, plus **bear_structural $33.99** at 24–36 months; the intrinsic FCFF DCF is the sole driver. [valuation/07_scenario-and-fair-value.md, §§1–3]
- At $106.79, the reverse DCF implies **16.35% annual FCF growth** to $1.245bn by FY2030 or a **19.21% FCF margin** on the DCF revenue path; this is possible but not proven by the matched history or current margin evidence. [valuation/05_reverse-dcf.md, §§2–5]
- Margin of safety is **−55.3%** against the $68.78 base; downside to the $45.65 12-month bear is **57.3%**, and the separate $33.99 structural floor implies **68.2%** downside over 24–36 months. [valuation/07_scenario-and-fair-value.md, §4]
- The apparent peer discount is not proven value. No RF-OWN-004 owner flag exists, but the heterogeneous peer comparison, no proven moat, 48/100 business quality, 35/100 disruption score and 5.14x strict leverage create operating value-trap risk. [valuation/01_price-and-capital-structure.md, §5; valuation/03_relative-valuation-peers.md, §§2–7; valuation/07_scenario-and-fair-value.md, §5]
- Trust the DCF as the only complete filing-bridged method, but discount its precision because terminal value is 82.2% of EV. Exclude the $377.81 mechanical peer result, do not infer an own-history reversion point from six closes, and do not force a SOTP on one reportable segment. [valuation/02_multiples-own-history.md, §§2–4; valuation/03_relative-valuation-peers.md, §5; valuation/04_intrinsic-dcf.md, §5; valuation/06_sum-of-the-parts.md, §5]
- The **single-method cap** applies: valuation confidence cannot exceed **50/100**. The no-price, no-consensus, no-peer-data, multi-segment SOTP, >40% cross-method-spread, misaligned-owner and sector-cycle caps do not apply; terminal dominance’s 60 cap is less restrictive. [valuation/00_valuation-data-triage.md, §5; valuation/07_scenario-and-fair-value.md, §§1–2]
- The single highest-value missing input is a consistent same-date, matched-basis peer export with EV and LTM/NTM revenue, EBITDA, EBIT, EPS, FCF and net debt for the named peers. [valuation/03_relative-valuation-peers.md, §5]
- **Explicit handoff:** the master synthesizer’s **Valuation and Peer Mispricing** section should defer to this synthesis. These fair-value **levels** are the inputs for the master’s probability-weighted scenario model; the master assigns probabilities, and this module does not.

## 8. Simple Summary

- AKAM is materially overvalued: the $68.78 base value is 35.6% below the $106.79 price.
- The levels are $109.66 bull, $68.78 base and $45.65 bear_cyclical at 12 months; the 24–36 month bear_structural floor is $33.99.
- The market prices 16.35% annual FCF growth to $1.245bn by FY2030, which is not proven by the matched cash record.
- Margin of safety is −55.3%; downside to the 12-month bear is 57.3%, and downside to the structural floor is 68.2%.
- The DCF is the only method that matters here, but 82.2% of its enterprise value comes from the terminal value.
- The peer “discount” is value-trap risk, not proven value; the comparison is mixed and does not reconcile to the filing bridge.
- A current, pool-verified $106.79 price was available as of 2026-09-14.
- The module is useful as a cash-expectations warning, but not as independent multi-method triangulation; confidence is capped at 50/100.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — AKAM

The immutable frozen generation is complete: all 16 source files have manifest status `ok`, including 38 separately extracted workbook tabs. There are no `fail`, `fallback-text`, `missing-dependency`, or `gdrive-pointer` source rows, and no `external/` documents. File-system modified dates were deliberately not used because they can reflect sync time rather than the document's own period; periods below come from document content. [Frozen generation manifest, source inventory]

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| `23cab413-4bd3-4055-8415-e3e81559c003.pdf` (244 KB) | Q2 earnings release | Q2 ended Jun. 30, 2026; released Aug. 6, 2026 | Not used — period read inside | High |
| `6b47a3ae-7484-4682-b959-73a68a8842b5.pdf` (340 KB) | Q2 supplemental financial information | Jun. 30, 2026 | Not used — period read inside | High |
| `8201ec17-6108-433f-bfdb-2ac3555bf343.pdf` (212 KB) | Q1 earnings release | Q1 ended Mar. 31, 2026; released May 7, 2026 | Not used — period read inside | Medium |
| `825b8027-5dc8-4664-8e3a-9bb6544bb003.pdf` (122 KB) | Q1 supplemental financial information | Mar. 31, 2026 | Not used — period read inside | Medium |
| `Akamai Technologies Inc NasdaqGS AKAM Financials.xls` (212 KB) | Capital IQ Financials workbook; 13 tabs inventoried below | FY21–FY25, LTM Jun. 30, 2026, and FY26E–FY28E where applicable | Not used — period read inside | High |
| `Akamai Technologies, Inc. Presents at Citi’s 2026 Global TMT Conference, Sep-09-2026 02_35 PM.pdf` (144 KB) | Investor presentation | Sep. 9, 2026 | Not used — period read inside | Medium |
| `Akamai Technologies, Inc. Presents at Goldman Sachs Communacopia + Technology Conference 2026, Sep-09-2026 02_25 PM.pdf` (150 KB) | Investor presentation | Sep. 9, 2026 | Not used — period read inside | Medium |
| `Akamai Technologies, Inc., 2025.pdf` (52.4 MB) | FY25 Form 10-K | Fiscal year ended Dec. 31, 2025 | Not used — period read inside | High |
| `Akamai Technologies, Inc., Q1 2026 Earnings Call, May 07, 2026.pdf` (400 KB) | Earnings-call transcript | May 7, 2026 / Q1 2026 | Not used — period read inside | Medium |
| `Akamai Technologies, Inc., Q1 2026.pdf` (637 KB) | Form 10-Q | Quarter ended Mar. 31, 2026 | Not used — period read inside | High |
| `Akamai Technologies, Inc., Q2 2026 Earnings Call, Aug 06, 2026.pdf` (379 KB) | Earnings-call transcript | Aug. 6, 2026 / Q2 2026 | Not used — period read inside | Medium |
| `Akamai Technologies, Inc., Q2 2026.pdf` (676 KB) | Form 10-Q | Quarter ended Jun. 30, 2026 | Not used — period read inside | High |
| `AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls` (7.5 MB) | Capital IQ Estimates workbook; 7 tabs inventoried below | FY26 is current fiscal year; Q3 release scheduled Nov. 3, 2026 | Not used — period read inside | High |
| `Company Comparable Analysis Akamai Technologies Inc.xls` (155 KB) | Capital IQ Quick Comparable Analysis workbook; 8 tabs inventoried below | As of Sep. 14, 2026 | Not used — period read inside | High |
| `Supplemental Financial Information, 1st Quarter 2026.xlsx` (37 KB) | Supplemental workbook; 5 tabs inventoried below | Mar. 31, 2026 | Not used — period read inside | Medium |
| `Supplemental Financial Information, 2nd Quarter 2026.xlsx` (40 KB) | Supplemental workbook; 5 tabs inventoried below | Jun. 30, 2026 | Not used — period read inside | High |

Workbook-tab inventory — each row below is a distinct manifest tab, not an opaque workbook. [Frozen generation manifest, source inventory]

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| `Financials.xls` — `Key Stats` (91×9) | Capital IQ key financials, current capitalization, estimates | FY22–FY25; LTM Jun. 30, 2026; FY26E–FY28E | Not used — period read inside | High |
| `Financials.xls` — `Income Statement` (120×7) | Capital IQ income statement | FY21–FY25; LTM Jun. 30, 2026 | Not used — period read inside | High |
| `Financials.xls` — `Balance Sheet` (89×7) | Capital IQ balance sheet | FY21–FY25; Jun. 30, 2026 | Not used — period read inside | High |
| `Financials.xls` — `Cash Flow` (72×7) | Capital IQ cash flow | FY21–FY25; LTM Jun. 30, 2026 | Not used — period read inside | High |
| `Financials.xls` — `Multiples` (91×9) | Own trading-multiple history | Mar. 31, 2025–Sep. 11, 2026 | Not used — period read inside | High |
| `Financials.xls` — `Historical Capitalization` (39×7) | Historical price, shares, market cap | Quarterly history through Sep. 2026 | Not used — period read inside | High |
| `Financials.xls` — `Capital Structure Summary` (87×7) | Debt, leases, cash and capitalization | Latest reported / LTM Jun. 30, 2026 | Not used — period read inside | High |
| `Financials.xls` — `Capital Structure Details` (35×10) | Debt maturity and instrument detail | Latest as-reported debt block; maturities through 2033 | Not used — period read inside | High |
| `Financials.xls` — `Ratios` (161×7) | Profitability and return ratios | FY21–FY25; LTM Jun. 30, 2026 | Not used — period read inside | Medium |
| `Financials.xls` — `Supplemental` (64×7) | Supplemental financial data | FY21–FY25; LTM Jun. 30, 2026 | Not used — period read inside | Medium |
| `Financials.xls` — `Industry Specific` (15×6) | Industry data | Latest vendor reported periods | Not used — period read inside | Low |
| `Financials.xls` — `Pension OPEB` (21×7) | Pension/OPEB data | FY21–FY25; LTM Jun. 30, 2026 | Not used — period read inside | Low |
| `Financials.xls` — `Segments` (72×7) | Segment and geographic revenue | FY21–FY25, including FY25 geographic revenue | Not used — period read inside | High |
| `EstimatesReport.xls` — `Consensus` (529×121) | Capital IQ consensus estimates | Current fiscal year ends Dec. 31, 2026; FY26–FY35 estimates | Not used — period read inside | High |
| `EstimatesReport.xls` — `Recent Changes` (265×10) | Estimate changes | Current FY26 and forward estimates | Not used — period read inside | Medium |
| `EstimatesReport.xls` — `Guidance` (142×89) | Company guidance versus estimates | Q3 and FY26 | Not used — period read inside | High |
| `EstimatesReport.xls` — `Multiples` (26×7) | Estimate-based trading multiples | Current / forward FY26 | Not used — period read inside | High |
| `EstimatesReport.xls` — `Surprise` (263×111) | Estimate beat/miss history | Historical through FY25 | Not used — period read inside | Medium |
| `EstimatesReport.xls` — `Trends` (303×21) | Consensus estimate trends | Current FY26 and forward estimates | Not used — period read inside | Medium |
| `EstimatesReport.xls` — `Revisions` (467×21) | Estimate revision breadth | Current FY26 and forward estimates | Not used — period read inside | Medium |
| `Comparable Analysis.xls` — `Financial Data` (50×17) | Peer financial data and subject capitalization | As of Sep. 14, 2026 | Not used — period read inside | High |
| `Comparable Analysis.xls` — `Trading Multiples` (50×9) | Peer and subject trading multiples | As of Sep. 14, 2026 | Not used — period read inside | High |
| `Comparable Analysis.xls` — `Operating Statistics` (50×13) | Peer operating statistics | As of Sep. 14, 2026 | Not used — period read inside | Medium |
| `Comparable Analysis.xls` — `Business Description` (44×3) | Peer business descriptions | As of Sep. 14, 2026 | Not used — period read inside | Medium |
| `Comparable Analysis.xls` — `Implied Valuation` (69×9) | Implied peer valuation | As of Sep. 14, 2026 | Not used — period read inside | High |
| `Comparable Analysis.xls` — `Valuation Chart` (32×2) | Peer valuation chart | As of Sep. 14, 2026 | Not used — period read inside | Medium |
| `Comparable Analysis.xls` — `Credit Health Panel` (48×10) | Peer credit metrics | As of Sep. 14, 2026 | Not used — period read inside | Medium |
| `Comparable Analysis.xls` — `Disclaimer` (26×1) | Vendor terms | As of Sep. 14, 2026 | Not used — period read inside | Low |
| `Supplemental Financial Information, 1st Quarter 2026.xlsx` — `Disclaimer` (33×1) | Supplemental-information disclaimer | Mar. 31, 2026 | Not used — period read inside | Low |
| `Supplemental Financial Information, 1st Quarter 2026.xlsx` — `Supplemental Metrics` (61×8) | GAAP/non-GAAP metrics | Q1 2025–Q1 2026 | Not used — period read inside | High |
| `Supplemental Financial Information, 1st Quarter 2026.xlsx` — `Supplemental Revenue` (46×8) | Revenue by solution/geography | Q1 2025–Q1 2026 | Not used — period read inside | High |
| `Supplemental Financial Information, 1st Quarter 2026.xlsx` — `GAAP to Non-GAAP Reconciliation` (126×8) | Adjustment reconciliation | Q1 2025–Q1 2026 | Not used — period read inside | Medium |
| `Supplemental Financial Information, 1st Quarter 2026.xlsx` — `Non-GAAP Definitions` (63×1) | Non-GAAP definitions | Mar. 31, 2026 | Not used — period read inside | Low |
| `Supplemental Financial Information, 2nd Quarter 2026.xlsx` — `Disclaimer` (9×1) | Supplemental-information disclaimer | Jun. 30, 2026 | Not used — period read inside | Low |
| `Supplemental Financial Information, 2nd Quarter 2026.xlsx` — `Supplemental Metrics` (61×10) | GAAP/non-GAAP metrics | Q1 2025–Q2 2026 | Not used — period read inside | High |
| `Supplemental Financial Information, 2nd Quarter 2026.xlsx` — `Supplemental Revenue` (46×10) | Revenue by solution/geography | Q1 2025–Q2 2026 | Not used — period read inside | High |
| `Supplemental Financial Information, 2nd Quarter 2026.xlsx` — `GAAP to Non-GAAP Reconciliation` (126×10) | Adjustment reconciliation | Q1 2025–Q2 2026 | Not used — period read inside | Medium |
| `Supplemental Financial Information, 2nd Quarter 2026.xlsx` — `Non-GAAP Definitions` (63×1) | Non-GAAP definitions | Jun. 30, 2026 | Not used — period read inside | Low |

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States / Nasdaq Global Select Market; common stock ticker `AKAM` | [Q2 2026 Form 10-Q, cover] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC: Form 10-K annual filing and Form 10-Q quarterly filings | [FY25 Form 10-K, cover]; [Q2 2026 Form 10-Q, cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | [Q2 2026 Form 10-Q, Note 1] |
| Reporting currency (and scale, e.g. INR crore) | USD; filings are generally in thousands except per-share amounts | [Q2 2026 Form 10-Q, financial statements] |
| Fiscal-year end | December 31 | [FY25 Form 10-K, cover] |
| Document language(s) | English | [FY25 Form 10-K, cover]; [Q2 2026 Form 10-Q, cover] |

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | `Akamai Technologies, Inc., 2025.pdf` | FY ended Dec. 31, 2025 [FY25 Form 10-K, cover] | 8.5 |
| Quarterly filing | `Akamai Technologies, Inc., Q2 2026.pdf` | Quarter ended Jun. 30, 2026 [Q2 2026 Form 10-Q, cover] | 2.5 |
| Capital structure / balance sheet | `Akamai Technologies, Inc., Q2 2026.pdf` | Jun. 30, 2026; cross-checked to CIQ Financials balance sheet [Q2 2026 Form 10-Q, balance sheets] | 2.5 |
| Consensus / estimate export | `AkamaiTechnologies,IncNasdaqGSAKAMEstimatesReport.xls` — `Consensus` | FY26 current fiscal year; specific snapshot date is not printed inside the export [Capital IQ Estimates Consensus, FY26] | Not dateable |
| Multiples export | `Company Comparable Analysis Akamai Technologies Inc.xls` — `Trading Multiples` | Sep. 14, 2026 [Capital IQ Comps Trading Multiples, data as of 2026-09-14] | 0.0 |
| Peer / comps export | `Company Comparable Analysis Akamai Technologies Inc.xls` — `Financial Data` / `Trading Multiples` | Sep. 14, 2026 [Capital IQ Comps, data as of 2026-09-14] | 0.0 |
| Current price (IBKR / Capital IQ) | `Company Comparable Analysis Akamai Technologies Inc.xls` — `Financial Data` | USD 106.79 as of Sep. 14, 2026 [CIQ Comps→Financial Data “Day Close Price Latest” (subject), 2026-09-14] | 0.0 |
| Cash flow statement | `Akamai Technologies, Inc., Q2 2026.pdf` | Six months ended Jun. 30, 2026; LTM also supplied in CIQ Financials [Q2 2026 Form 10-Q, statements of cash flows] | 2.5 |
| Segment data | `Akamai Technologies, Inc., Q2 2026.pdf` | One reportable segment, quarter / six months ended Jun. 30, 2026 [Q2 2026 Form 10-Q, Note 14] | 2.5 |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | USD 106.79, pool-verified as of Sep. 14, 2026 [CIQ Comps→Financial Data “Day Close Price Latest” (subject), 2026-09-14] | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | Q2 diluted weighted-average shares are disclosed; 143.7m shares outstanding is also pinned by the CIQ sidecar [Q2 2026 Supplemental Metrics, shares used in per-share calculation]; [CIQ Comps→Financial Data “Shares Outstanding Latest” (subject), 2026-09-14] | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y | The Q2 10-Q identifies stock awards, convertible notes and warrants, and describes treasury-stock / if-converted treatment [Q2 2026 Form 10-Q, Note 13] | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y — Operating | One operating and reportable segment; services business [Q2 2026 Form 10-Q, Note 14] | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | Y | Latest balance sheet and debt note are present; CIQ total debt read is USD 9,339.0m, which remains subject to filing-basis reconciliation [Q2 2026 Form 10-Q, balance sheets and Note 7]; [CIQ Financials→Balance Sheet “Total Debt” (46203.0)] | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | FY25 audited statements, Q2 interim statements, and LTM CIQ financials are present [FY25 Form 10-K, financial statements]; [Q2 2026 Form 10-Q, statements of income] | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Q2 cash-flow statement plus LTM cash from operations in CIQ Financials [Q2 2026 Form 10-Q, statements of cash flows]; [CIQ Financials→Cash Flow “Cash from Ops.” (LTM Jun-30-2026)] | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | FY26 consensus and forward years, including revenue, EBITDA and EPS, are present [Capital IQ Estimates Consensus, FY26 and NTM] | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y — limited | Six quarterly close observations run from Mar. 31, 2025 to Sep. 11, 2026; CIQ marks the resulting own-history range low-confidence [CIQ Financials→Multiples, close observations] | Own-history re-rating read |
| Peer / comps data | Y | Ten named peers plus subject and summary statistics are supplied as of Sep. 14, 2026 [Capital IQ Comps Trading Multiples, data as of 2026-09-14] | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y — single reportable segment | The Q2 filing supplies one segment's revenue and cost lines; it also says Akamai does not operate material separate lines of business [Q2 2026 Form 10-Q, Note 14] | Confirms that SOTP collapses to the consolidated read rather than being a missing-data gap |
| Dividend / buyback data | Y | Q2 release discloses USD 410m of repurchases for 3m shares; no dividend claim is needed for the shareholder-yield read [Q2 2026 earnings release, share repurchases] | Shareholder-yield read |

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
| No current price | N | 01, 05, 07, 99 | None — dated pool-verified price is present |
| No consensus / forward estimates | N | 02, 03, 04, 05 | None — consensus is present; the undated-export freshness limitation must remain visible |
| No peer data | N | 03, 06 | None — dated peer set is present |
| No segment-level data | N | 06 | None — one reportable segment means SOTP is not independently applicable |
| No balance sheet / capital structure | N | 01, 04, 06 | None — Q2 balance sheet and debt-note data are present |
| No cash flow statement | N | 04 | None — Q2 cash flow and LTM CIQ cash flow are present |

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y — limited | None | Only six quarterly close observations are available (Mar. 2025–Sep. 2026), so this is not a stable 3–5-year anchor and must carry low confidence. [CIQ Financials→Multiples, close observations] |
| Peer relative valuation | Y | None | Dated Sep. 14 peer financial and trading-multiple sheets cover ten named peers. [Capital IQ Comps Trading Multiples, data as of 2026-09-14] |
| Intrinsic DCF (Operating FCFF) | Y | None | Operating-company method; LTM cash flow, interim financials, guidance and consensus are present. [Q2 2026 Form 10-Q, statements of cash flows]; [Capital IQ Estimates Consensus, FY26 and NTM] |
| Reverse DCF | Y | None | A dated pool price is available; the agent can invert the DCF once its normalized FCFF base and WACC are built. [CIQ Comps→Financial Data “Day Close Price Latest” (subject), 2026-09-14] |
| SOTP | N — not applicable | No material separate reportable segments | Akamai has one operating and reportable segment, so a breakup would be spurious and should collapse to the consolidated read. [Q2 2026 Form 10-Q, Note 14] |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool contains usable FY/LTM income and cash-flow bases, a current balance sheet and debt data, dated pool-verified price and peer multiples, plus forward consensus and guidance; this supports more than two valid methods.
- **Methods that can run:** own-history multiples (limited history), peer relative valuation, intrinsic FCFF DCF, and reverse-DCF.
- **Critical implementation limitation:** The CIQ own-history multiples series has only six quarterly closes, so it may be a cross-check but cannot be treated as a stable 3–5-year reversion anchor. The estimates export also lacks an explicit snapshot date inside the workbook; its content is usable, but downstream agents must carry that freshness qualification.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — AKAM

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| **Decision line** (ticker · venue · currency) | **AKAM · Nasdaq Global Select Market · USD** | [Q2 FY2026 Form 10-Q, cover] | 2026-09-14 |
| Current price | **$106.79** | [CIQ Comps → Financial Data, “Day Close Price Latest” (subject row), data as of 2026-09-14; `ciq_facts.json`, `current_price`, present] | 2026-09-14 |
| Currency | USD | [CIQ Comps → Financial Data, “Day Close Price Latest” (subject row), data as of 2026-09-14] | 2026-09-14 |
| Price basis | Day close | [CIQ Comps → Financial Data, “Day Close Price Latest” (subject row), data as of 2026-09-14] | 2026-09-14 |

Akamai reports under U.S. GAAP in USD and has a 31 December fiscal year. The price and market-capitalization date is 14 September 2026, while the latest filed balance-sheet date is 30 June 2026; the EV bridge is therefore a current-market/last-filed-balance-sheet bridge, not a same-day balance-sheet snapshot. [Q2 FY2026 Form 10-Q, cover and Note 1; Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; CIQ Comps → Financial Data, data as of 2026-09-14]

AKAM common stock on Nasdaq is the decision line: it is the primary listed common stock disclosed in the Q2 filing. Single listed line — no cross-line issue. [Q2 FY2026 Form 10-Q, cover]

| Listed line | Ticker · venue | Currency | Price | As-of | Premium / (discount) vs decision line, same-currency | Notes for a holder of this line |
|---|---|---:|---:|---|---:|---|
| Decision line only | AKAM · Nasdaq Global Select Market | USD | $106.79 | 2026-09-14 | 0.0% | Single listed line — no cross-line issue. |

The quote is zero trading days old on the run date. No refresh was required or attempted. It is pool-sourced and dated; it is not a web-indicative quote.

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | 143.7166m | [Q2 FY2026 Form 10-Q, cover — 143,716,609 common shares outstanding at 2026-08-03; CIQ Comps → Financial Data, “Shares Outstanding Latest,” 143.7m as of 2026-09-14; `ciq_facts.json`, `shares_outstanding_m`, present] |
| Diluted weighted-average shares (period) | 153.686m | [Q2 FY2026 Form 10-Q, Note 13 (Net Income per Share), p.24 — Q2 FY2026] |
| Options/RSUs count (if disclosed) | 3.673m incremental shares in Q2 diluted EPS, using the treasury-stock method; the current award population and average strike were not disclosed in the Q2 filing | [Q2 FY2026 Form 10-Q, Note 13, p.24] |
| Convertibles / potential shares (if disclosed) | 5.353m incremental shares in Q2 diluted EPS, using the if-converted method; warrants contributed 0.0m in the quarter | [Q2 FY2026 Form 10-Q, Note 13, p.24] |
| **Fully diluted shares (TSM + if-converted)** | **153.686m — latest disclosed Q2 diluted weighted-average, not a point-in-time count** | [Q2 FY2026 Form 10-Q, Note 13, p.24: 144.660m basic weighted average + 3.673m stock awards + 5.353m convertibles = 153.686m] |
| Share count used for market cap | **143.700m** | [CIQ Comps → Financial Data, “Shares Outstanding Latest,” data as of 2026-09-14; `ciq_facts.json`, `shares_outstanding_m`, present] |
| Share count used for per-share fair value | **153.686m** | [Q2 FY2026 Form 10-Q, Note 13, p.24] |

The market-cap count is the current outstanding-share count, as required for capitalization. The per-share working count is the latest disclosed diluted weighted-average count. A current fully diluted count cannot be rebuilt exactly because the Q2 filing provides the treasury-stock-method and if-converted *incremental result*, not a same-date award population, weighted-average exercise prices, and conversion treatment as of 14 September. The 153.686m count is consequently a disclosed period-average limitation, not an assertion that that number was outstanding on 14 September. It includes 9.026m Q2 incremental diluted shares: 3.673m stock awards plus 5.353m convertibles. [Q2 FY2026 Form 10-Q, Note 13, p.24]

The Q2 filing also excluded 58.480m potential shares from Q2 diluted EPS, including 56.320m warrants, because they were anti-dilutive or performance conditions were not met. These are not added to the fair-value denominator without evidence that they are dilutive. [Q2 FY2026 Form 10-Q, Note 13, p.24]

## 3. Market Capitalization

`Market cap = 143.700m shares × $106.79 = $15,345.7m`

The calculation uses the same CIQ current-share and current-price reads pinned by the facts sidecar. [CIQ Comps → Financial Data, “Shares Outstanding Latest” and “Day Close Price Latest,” data as of 2026-09-14; `ciq_facts.json`, `shares_outstanding_m` and `current_price`, present]

## 4. Enterprise Value Bridge

| Component | Amount | Source |
|---|---:|---|
| Market capitalization | $15,345.7m | $106.79 × 143.700m; [CIQ Comps → Financial Data, data as of 2026-09-14; `ciq_facts.json`, `current_price` and `shares_outstanding_m`, present] |
| + Total debt | $7,562.8m carrying value | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Note 7 (Debt), pp.17–20] |
| + Minority / non-controlling interest | $0.0m — no separate non-controlling-interest balance disclosed | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4] |
| + Preferred equity | $0.0m — no preferred shares issued or outstanding | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.4] |
| + Operating lease liabilities (optional adjustment) | Not in canonical EV; $1,776.2m if treated as debt-like | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4] |
| + Underfunded pension / other long-term obligations | Not added — defined-benefit/OPEB underfunding not proven from available data | [FY2025 Form 10-K, Note 17 (Employee Benefit Plans)] |
| − Cash & equivalents | $(1,480.3)m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3] |
| − Equity-method investments | $0.0m — none separately disclosed | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3] |
| **= Enterprise value (EV)** | **$21,428.3m** | $15,345.7m + $7,562.8m − $1,480.3m |

The canonical EV excludes operating-lease liabilities so it stays on the filing debt-note basis used by the balance-sheet-survival module. A lease-adjusted EV is $23,204.5m = $21,428.3m + $1,776.2m, shown only as a sensitivity. No pension adjustment is made because a defined-benefit or OPEB deficit is not proven, and no separately identified equity-method investment is deducted. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; FY2025 Form 10-K, Note 17]

**Canonical debt source.** The balance-sheet-survival Leverage Anchor Summary supplies the filing-based $7,562.8m gross debt and $6,082.6m strict net debt used here. It is $1,705.6m current convertible notes plus $5,857.3m non-current convertible notes; the related contractual principal is $7,640.0m. The current classification of the $1,705.6m 2033 notes reflects conversion rights during Q3 FY2026, not a stated FY2026 contractual maturity. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Note 7 (Debt), pp.17–20; balance-sheet-survival/01_capital-structure-and-leverage.md, Leverage Anchor Summary]

**CIQ reconciliation.** The facts sidecar reports CIQ vendor total debt of $9,339.0m and net debt of $4,722.7m, both present reads. The $1,776.2m gap to filing-based gross debt is operating-lease liabilities. CIQ’s net-debt figure additionally nets $4,616.3m of cash plus all marketable securities, rather than only cash equivalents. It is therefore a lease-inclusive, investment-inclusive broad figure, not strict net debt, and is not used in the canonical bridge. [CIQ Financials → Balance Sheet, period-end 2026-06-30; `ciq_facts.json`, `total_debt_m` and `net_debt_m`, present; Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4]

**Cash quality.** The canonical bridge nets only $1,480.3m of cash and equivalents. It excludes $1.5m restricted cash, $1,875.1m of current marketable securities, and $1,260.9m of non-current marketable securities. The filing reports the marketable securities separately; its investment note says the securities use Level 1 or Level 2 inputs, but $1,231.6m of the non-current available-for-sale securities are contractually due after one through five years. They may support a labelled broad liquidity sensitivity, not an unlabelled cash offset in EV. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3; Statements of Cash Flows, p.8; Note 2 (Investments and Fair Value Measurements), pp.13–15]

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | $7,562.8m carrying value | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Note 7, pp.17–20] |
| Cash & equivalents | $(1,480.3)m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3] |
| **Net debt (strict, §15: total debt − cash & equivalents)** | **$6,082.6m = $7,562.8m − $1,480.3m** | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; balance-sheet-survival/01_capital-structure-and-leverage.md, Leverage Anchor Summary] |
| − Liquid short-term marketable securities (broad basis only) | $(1,875.1)m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3] |
| Net debt (broad, cash plus current marketable securities) | $4,207.4m | $7,562.8m − $1,480.3m − $1,875.1m; [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3] |
| − Non-current marketable securities (broad basis only) | $(1,260.9)m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3; Note 2, pp.13–15] |
| Net debt (broad, cash plus all marketable securities) | $2,946.5m | $7,562.8m − $1,480.3m − $1,875.1m − $1,260.9m; [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3] |
| Net debt / latest EBITDA | **5.14x strict-basis / LTM GAAP-derived EBITDA** = $6,082.6m / $1,184.1m | [FY2025 Form 10-K, Consolidated Statements of Income, pp.54–56; Q2 FY2026 Form 10-Q, Statements of Income, p.5; Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet; balance-sheet-survival/01_capital-structure-and-leverage.md, Leverage Anchor Summary] |

The $1,184.1m denominator is GAAP-derived EBITDA — income from operations plus depreciation and amortization — and not company-defined adjusted EBITDA. The pool does not provide a matching LTM company-defined adjusted-EBITDA series, so an adjusted-EBITDA leverage ratio is not assessable. [balance-sheet-survival/01_capital-structure-and-leverage.md, Leverage Anchor Summary]

CIQ instead reports $1,079.9m LTM EBITDA and 4.37x net debt/EBITDA, both present reads in the facts sidecar. That is not a contradiction in arithmetic: it combines CIQ’s $4,722.7m lease-inclusive, investment-inclusive net debt with CIQ’s different EBITDA definition. It must not replace the 5.14x strict-basis, GAAP-derived figure. [CIQ Financials → Income Statement and Balance Sheet, LTM/period-end 2026-06-30; `ciq_facts.json`, `ltm_ebitda_m` and `net_debt_ebitda_x`, present]

## 6. Per-Share Reference Values

The closest matched-basis references divide the 30 June point-in-time balance sheet by 143.591m shares outstanding at 30 June. The diluted working references divide the same point-in-time balance by the Q2 period-average diluted count of 153.686m; they are useful for fair-value work but are explicitly a mixed point-in-time/period-average basis.

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share — matched June 30 basic point-in-time basis | $33.07 = $4,748.5m / 143.591m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4] |
| Book value per share — diluted working reference, mixed basis | $30.90 = $4,748.5m / 153.686m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Note 13, p.24] |
| Tangible book value per share — matched June 30 basic point-in-time basis | $6.83 = ($4,748.5m − $3,202.9m goodwill − $564.3m acquired intangibles) / 143.591m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4] |
| Tangible book value per share — diluted working reference, mixed basis | $6.39 = ($4,748.5m − $3,202.9m − $564.3m) / 153.686m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Note 13, p.24] |
| Net debt per share — strict, matched June 30 basic point-in-time basis | $42.36 = $6,082.6m / 143.591m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4] |
| Net debt per share — strict, diluted working reference, mixed basis | $39.58 = $6,082.6m / 153.686m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Note 13, p.24] |

## 7. Anchor Summary (canonical numbers for downstream agents)

The downstream capitalization anchor is: $106.79 price at 14 September 2026; 143.700m current shares for market capitalization; 153.686m latest disclosed diluted weighted-average shares for per-share fair values; $15,345.7m market capitalization; $6,082.6m strict net debt; and $21,428.3m canonical EV. The $7,562.8m debt and $6,082.6m strict net debt are the balance-sheet-survival module’s filing-based canonical figures. The CIQ vendor values of $9,339.0m total debt and $4,722.7m net debt are reconciled, not substituted: they include operating leases and net all marketable securities. [CIQ Comps → Financial Data, data as of 2026-09-14; `ciq_facts.json`, `current_price` and `shares_outstanding_m`, present; Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; balance-sheet-survival/01_capital-structure-and-leverage.md, Leverage Anchor Summary]

### Anchor Block (copy-forward)

- Decision line: **AKAM · Nasdaq Global Select Market · USD** — every downstream fair value, margin of safety, and yield is on this line. Single listed line.
- Other listed lines: **None**.
- Price: **$106.79** (2026-09-14, day close; [CIQ Comps → Financial Data, data as of 2026-09-14; `ciq_facts.json`, `current_price`, present]).
- Price-state: **pool-verified** — the canonical tag `05`/`07`/`99` read.
- Currency: **USD**.
- Distribution basis: **none quoted**.
- Shares (market cap): **143.700m** ([CIQ Comps → Financial Data, data as of 2026-09-14; `ciq_facts.json`, `shares_outstanding_m`, present]).
- Shares (per-share fair value): **153.686m** ([Q2 FY2026 Form 10-Q, Note 13, p.24] — latest diluted weighted-average; exact current fully diluted count not computable from disclosed award-strike and conversion terms).
- Market cap: **$15,345.7m** ($106.79 × 143.700m).
- Net debt: **$6,082.6m, strict basis** = $7,562.8m gross debt − $1,480.3m cash and equivalents ([Q2 FY2026 Form 10-Q, pp.3–4]; agrees with balance-sheet-survival/01’s canonical filing-based figure).
- EV: **$21,428.3m** = $15,345.7m + $7,562.8m − $1,480.3m; operating leases excluded from canonical EV. Lease-adjusted sensitivity: $23,204.5m.
- Key caveats: market price is 2026-09-14 but balance-sheet inputs are 2026-06-30; per-share fair-value count is a Q2 diluted weighted average, not an exact 2026-09-14 fully diluted share count; CIQ’s debt and net-debt fields use a different lease- and investment-inclusive vendor basis.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — AKAM

All figures are USD millions except per-share data, percentages, and multiples. Akamai is a US GAAP operating company. This report uses the AKAM common stock listed on the Nasdaq Global Select Market as the decision line. The price is $106.79 at 14 September 2026; the canonical enterprise value (EV, market value plus debt less cash) is $21,428.3m, and the diluted per-share working count is 153.686m. [valuation/01_price-and-capital-structure, §§1, 4, 7]

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E — reported | LTM GAAP diluted EPS | $2.75/share | 38.8x = $106.79 / $2.75 | [Capital IQ Financials → Multiples, `P/LTM EPS` Close latest, 2026-09-11; source-bound `ciq_facts.json`, `pe_ltm_current_x` = 38.8, present; earnings/01_historical-financials, §2] |
| P / E — normalized | FY2026 vendor normalized EPS | $6.69863/share | 15.9x = $106.79 / $6.69863 | [Capital IQ Estimates Report, Guidance worksheet, FY2026 current normalized EPS, 2026-09-07; earnings/04_guidance-consensus, §3] |
| EV / EBITDA — reported | LTM GAAP-derived EBITDA | $1,184.1m | 18.1x = $21,428.3m / $1,184.1m | [valuation/01_price-and-capital-structure, §7; earnings/01_historical-financials, §2] |
| EV / EBITDA — vendor estimate | NTM vendor EBITDA; definition not reconciled to company adjusted EBITDA | $1,868.8m | 11.5x = $21,428.3m / $1,868.8m | [Capital IQ Estimates Report, Multiples worksheet, NTM TEV/EBITDA, data as of 2026-09-14; valuation/06_sum-of-the-parts, §2] |
| EV / EBIT — reported | LTM GAAP operating income | $455.7m | 47.0x = $21,428.3m / $455.7m | [valuation/01_price-and-capital-structure, §7; earnings/01_historical-financials, §2] |
| EV / Sales — reported | LTM revenue | $4,322.8m | 5.0x = $21,428.3m / $4,322.8m | [valuation/01_price-and-capital-structure, §7; earnings/01_historical-financials, §2] |
| EV / Sales — consensus | FY2026 revenue | $4,491.263m | 4.8x = $21,428.3m / $4,491.263m | [Capital IQ Estimates Report, Guidance worksheet, FY2026 current revenue, 2026-09-07; earnings/04_guidance-consensus, §3] |
| P / Book | 2026-06-30 reported equity | $4,748.5m | 3.23x = $15,345.7m / $4,748.5m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; valuation/01_price-and-capital-structure, §§3, 6] |
| P / FCF and FCF yield | LTM operating FCF (cash from operations less all capex) | $629.9m | 24.4x; 4.1% yield = $629.9m / $15,345.7m | [earnings/01_historical-financials, §2; valuation/01_price-and-capital-structure, §7] |
| Dividend yield | No cash dividend | $0.00/share | 0.0% | [FY2025 Form 10-K, Item 5; balance-sheet-survival/99_balance-sheet-survival-synthesis, p.91] |

The Capital IQ historical series reports a direct 13.4x `TEV/LTM EBITDA` close at 11 September, which is the authoritative read of that workbook. It is not interchangeable with the 18.1x above: the latter uses the filing-based $21,428.3m canonical EV and $1,184.1m GAAP-derived EBITDA, while the vendor series uses its own TEV and EBITDA definitions. The sidecar separately reports $1,079.9m LTM vendor EBITDA, so the provider does not supply a bridge sufficient to map its multiple series to the filing-based GAAP metric. This is a definition limitation, not a basis for replacing the canonical EV or EBITDA. [Capital IQ Financials → Multiples, `TEV/LTM EBITDA` Close latest, 2026-09-11; source-bound `ciq_facts.json`, `ev_ebitda_current_x` = 13.4 and `ltm_ebitda_m` = 1,079.9, present; valuation/01_price-and-capital-structure, §§4–5]

## 2. Historical Multiple Bands (3–5 years)

Only six quarterly close observations are available: 31 March 2025 through 30 June 2026, with a current endpoint at 11 September 2026. This is about 1.5 years, not a 3–5-year history. The table is a short-range directional read, not a stable reversion anchor. Each row uses the Capital IQ `Multiples` sheet's internally consistent vendor close series; it must not be mixed with the filing-based EV/GAAP multiples in §1.

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| P / LTM EPS | 24.6x | 30.2x | 26.9x | 40.0x | 38.8x | 83.3% |
| P / NTM normalized EPS | 11.3x | 13.9x | 12.9x | 17.5x | 15.6x | 66.7% |
| TEV / LTM EBITDA | 9.5x | 11.0x | 10.1x | 13.6x | 13.4x | 83.3% |
| TEV / NTM EBITDA | 8.1x | 9.5x | 8.7x | 11.8x | 10.7x | 66.7% |
| TEV / LTM EBIT | 23.2x | 27.5x | 24.5x | 36.3x | 39.0x | 100.0% |
| TEV / LTM revenue | 3.6x | 4.1x | 3.8x | 5.0x | 4.6x | 66.7% |
| P / Book value | 2.4x | 2.8x | 2.6x | 3.5x | 3.2x | 66.7% |
| Market cap / LTM levered FCF | 17.7x | 22.3x | 20.9x | 29.2x | 21.6x | 66.7% |

Calculations use the six historical close values, excluding the 11 September 2026 endpoint: percentile = historical closes at or below the current close / 6. For example, the LTM EBITDA series is 13.4x current versus a 9.5x–13.6x historical range; the source-bound sidecar independently confirms the 13.4x current figure, the 83.3% percentile, and the low-confidence six-close status. [Capital IQ Financials → Multiples, Close rows, 2025-03-31 to 2026-09-11; source-bound `ciq_facts.json`, `ev_ebitda_current_x` = 13.4, `ev_ebitda_percentile` = 0.833, and `range_position`, present]

## 3. Re-Rating / De-Rating Read

On the more comparable equity measures, P/LTM EPS is 38.8x, 28.4% above its six-quarter mean of 30.2x and 44.4% above its 26.9x median: `(38.7810 − 30.2111) / 30.2111` and `(38.7810 − 26.8516) / 26.8516`. P/NTM normalized EPS is 15.6x, 11.9% above its 13.9x mean and 20.5% above its 12.9x median; P/B is 3.23x, 14.4% and 24.4% above its 2.82x mean and 2.60x median. [Capital IQ Financials → Multiples, `P/LTM EPS`, `P/NTM EPS`, and `P/BV` Close rows, 2025-03-31 to 2026-09-11]

The vendor TEV/LTM EBITDA series is also 21.3% above its 11.0x mean and 32.4% above its 10.1x median, but it is a lower-confidence confirmation because its EV and EBITDA definitions do not reconcile to the canonical filing-based calculation in §1. The change cannot be causally proven from the available data. Inference, not from filings: the market is giving some credit to the security/cloud mix — management guides CIS growth of at least 50% and high-single-digit Security growth in FY2026 — while the counter-evidence is lower LTM margins and much higher strict net debt. [Capital IQ Financials → Multiples, `TEV/LTM EBITDA` Close row, 2025-03-31 to 2026-09-11; Q2 2026 earnings call, CFO prepared remarks; earnings/01_historical-financials, §§2, 6; valuation/01_price-and-capital-structure, §5]

## 4. Implied Value from Reversion

No own-history implied EV, equity value, or per-share target is published. A six-observation, 1.5-year history is below the roughly three-year minimum for a mean/median reversion target, and the vendor EV/EBITDA, EV/EBIT, and levered-FCF series do not have a complete bridge to the filing-based strict-EV and GAAP measures. Any price derived from those medians would be illustrative-only and is not a fair-value input for `07_scenario-and-fair-value`.

The required base-case own-history implied value is therefore **Not assessable**. The evidence supports a directional conclusion — current P/E, P/B, and vendor EV multiples are in the upper half of this short sample — but not a point or tight reversion range. A reversion calculation would additionally assume the warranted multiple is unchanged. That assumption is not supported: Q2 gross margin was 55.8%, down 331 basis points year on year, and strict net debt was $6.08bn, up from $3.18bn at FY2025. [Q2 FY2026 Form 10-Q, Statements of Income, p.5; Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; earnings/01_historical-financials, §§1–2]

## 5. Sector Cycle Reality Test

No material same-direction sector move is indicated over the available short window: IGV, an ETF tracking North American software and related digital-media companies, rose from $88.97 in March 2025 to $101.52 in September 2026, or 14.1%, below the roughly 25% materiality guide. This is a sector price proxy rather than sector multiple history, so it cannot prove a stable valuation anchor; it does not trigger a cycle-elevated or cycle-depressed flag. [Web: Digrin, IGV monthly price history, accessed 2026-09-14 (unverified); iShares, IGV fund description and 2026-09-11 closing price]

## 6. Own-History Read

AKAM trades at a premium to its short own-history sample: P/LTM EPS is 28.4% above the sample mean, P/B is 14.4% above, and the vendor TEV/LTM EBITDA series is 21.3% above. This is a directional upper-range read, not evidence for a mean-reversion fair value or a valuation floor.

The biggest caveat is dual: the history is only six quarters, and the vendor EV-based series cannot be made like-for-like with the filing-based strict-EV/GAAP metrics. Falling margins, a strict-net-debt increase from $3.18bn at FY2025 to $6.08bn at Q2 FY2026, and no proven overall economic moat also weaken any presumption that an old median is warranted. [earnings/01_historical-financials, §§1, 6; business-model/99_business-model-synthesis, Verdict and pp.48–50]



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — AKAM

All figures are USD and LTM unless stated otherwise. AKAM is an operating company, so EV/EBITDA, EV/EBIT, EV/Sales, P/E and FCF yield are the relevant methods. `N/S` means the frozen Capital IQ workbook did not supply a usable value; it does not mean zero. `[CIQ]` means Capital IQ Company Comparable Analysis, named sheet, data as of 2026-09-14 — vendor export. The source-bound `ciq_facts.json` is the authoritative read for the AKAM and peer-summary numbers explicitly identified below.

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Cloudflare | NYSE: NET | Edge security, WAF, bot management, DDoS, API security and content delivery overlap with AKAM Security and delivery. | [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export; FY2025 Form 10-K, Item 1, pp.3–5] |
| Okta | NasdaqGS: OKTA | Identity-security vendor; an enterprise-security reference, but not a delivery-network peer. | [CIQ Company Comparable Analysis, default AKAM comp set, 2026-09-14 — vendor export] |
| Fortinet | NasdaqGS: FTNT | Web, cloud and network-security products overlap with AKAM security, though it is not a like-for-like delivery-network business. | [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export; FY2025 Form 10-K, Item 1, pp.3–4] |
| Snowflake | NYSE: SNOW | Cloud-data platform reference in the vendor set; more distant economics than AKAM. | [CIQ Company Comparable Analysis, default AKAM comp set, 2026-09-14 — vendor export] |
| Twilio | NYSE: TWLO | Communications-platform reference in the vendor set; more distant economics than AKAM. | [CIQ Company Comparable Analysis, default AKAM comp set, 2026-09-14 — vendor export] |
| Palo Alto Networks | NasdaqGS: PANW | Enterprise-security reference; it overlaps on security spending but not CDN economics. | [CIQ Company Comparable Analysis, default AKAM comp set, 2026-09-14 — vendor export] |
| Fastly | NasdaqGS: FSLY | Direct edge-cloud, CDN, WAF, bot-management, DDoS and API-security overlap. | [CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export; FY2025 Form 10-K, Item 1, pp.3–5] |
| MongoDB | NasdaqGM: MDB | Database platform reference in the vendor set; more distant economics than AKAM. | [CIQ Company Comparable Analysis, default AKAM comp set, 2026-09-14 — vendor export] |
| DigitalOcean | NYSE: DOCN | Cloud-infrastructure reference in the vendor set; smaller and more cloud-hosting exposed. | [CIQ Company Comparable Analysis, default AKAM comp set, 2026-09-14 — vendor export] |
| Commerce.com | NasdaqGM: CMRC | Software reference in the vendor set; not a direct AKAM product peer. | [CIQ Company Comparable Analysis, default AKAM comp set, 2026-09-14 — vendor export] |

The set comes from `business-model/08_competitive-map.md`: Cloudflare, Fortinet and Fastly are the closest disclosed product overlaps; the other seven are Capital IQ’s broader default set. All are public. The broad set is useful as a market-context screen, but it is not a homogeneous peer group for a valuation anchor: it combines profitable security vendors, loss-making cloud platforms and other software businesses. [Business Model — Competitive Map, §§2, 4–5; CIQ Company Comparable Analysis, Business Description sheet, 2026-09-14 — vendor export]

## 2. Peer Multiples & Operating Stats

| Company | P/E | EV/EBITDA | EV/EBIT | EV/Sales | FCF Yield | Rev Growth | EBITDA Margin | ROIC | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| AKAM | 38.8x [CIQ] | 13.4x [CIQ; see reconciliation below] | N/S | 4.6x [CIQ] | 4.1% [$629.9m LTM FCF / $15,345.7m market cap] | 5.9% [CIQ] | 25.0% [CIQ] | 2.7% [CIQ] | 4.37x [CIQ broad basis] / 5.14x [strict basis] | 2026-09-14; LTM to 2026-06-30 |
| Cloudflare | NM | NM | NM | 43.2x [CIQ-derived: $108,515.7m EV / $2,512m revenue] | N/S | 33.5% [CIQ] | (0.1%) [CIQ] | N/S | N/S | 2026-09-14; latest filing 2026-08-06 |
| Okta | N/S | N/S | N/S | 8.7x [CIQ] | N/S | 11.2% [CIQ] | 10.4% [CIQ] | N/S | N/S | 2026-09-14 |
| Fortinet | N/S | N/S | N/S | N/S | N/S | 18.8% [CIQ] | 34.5% [CIQ] | N/S | N/S | 2026-09-14; latest filing 2026-07-30 |
| Snowflake | NM | NM | NM | N/S | N/S | 32.0% [CIQ] | (19.1%) [CIQ] | N/S | NM | 2026-09-14 |
| Twilio | N/S | 79.4x [CIQ] | N/S | N/S | N/S | 17.8% [CIQ] | N/S | N/S | N/S | 2026-09-14 |
| Palo Alto Networks | NM | 158.2x [CIQ] | NM | N/S | N/S | N/S | 13.6% [CIQ] | N/S | N/S | 2026-09-14 |
| Fastly | NM | NM | NM | N/S | N/S | 20.4% [CIQ] | (5.6%) [CIQ] | N/S | N/S | 2026-09-14; latest filing 2026-08-05 |
| MongoDB | NM | NM | NM | N/S | N/S | 25.5% [CIQ] | N/S | N/S | N/S | 2026-09-14 |
| DigitalOcean | N/S | 34.3x [CIQ] | N/S | N/S | N/S | 21.4% [CIQ] | N/S | N/S | N/S | 2026-09-14 |
| Commerce.com | NM | N/S | N/S | N/S | N/S | 2.8% [CIQ] | 6.1% [CIQ] | N/S | N/S | 2026-09-14 |
| **Peer median** | N/S | **59.4x [CIQ facts, present]** | N/S | N/S | N/S | 20.9% [CIQ] | 7.6% [CIQ] | N/S | N/S | 2026-09-14 |

The source-bound facts sidecar reports `TEV/EBITDA 13.4x vs peer set median 59.4x (high 158.2x / low 12.8x)` as the authoritative workbook read. It does not supply a peer mean; the raw workbook has no complete, consistently populated multiple matrix, so a mean is **Not assessable** rather than inferred from blanks. [CIQ Comps → Trading Multiples, `TEV/EBITDA LTM - Latest`, data as of 2026-09-14; `ciq_facts.json`, `peer_ev_ebitda`, present]

AKAM’s 4.1% FCF yield is $629.9m filing-built LTM FCF divided by $15,345.7m market capitalization. It is not the CIQ $710.1m levered-FCF measure, which is after interest and cannot be substituted for CFO less total capex. [FY2025 Form 10-K, pp.55–56; Q2 FY2026 Form 10-Q, pp.7–8; Valuation — Price & Capital Structure, §§3, 7; `ciq_facts.json`, `levered_fcf_m`, present]

The AKAM column contains two deliberately separate leverage bases. The 4.37x vendor number is broad: it includes operating leases in debt and nets cash plus marketable securities. The strict, filing-based number is 5.14x = $6,082.6m strict net debt / $1,184.1m GAAP-derived LTM EBITDA. They must not be substituted for one another. [CIQ Financials → Balance Sheet and Income Statement, LTM/period-end 2026-06-30; `ciq_facts.json`, `net_debt_ebitda_x`, present; Q2 FY2026 Form 10-Q, pp.3–4; Valuation — Price & Capital Structure, §5]

There is also a material AKAM reconciliation failure: the 13.4x CIQ EV/EBITDA read does not tie to the canonical filing bridge. Using $21,428.3m canonical EV and the CIQ $1,079.9m LTM EBITDA gives 19.84x, while $21,428.3m / $1,184.1m GAAP-derived EBITDA gives 18.10x. Neither equals 13.4x. This report retains 13.4x as the authoritative vendor read of that workbook, but does not use it as a valuation input. [CIQ Financials → Multiples and Income Statement, LTM June 2026; `ciq_facts.json`, `ev_ebitda_current_x` and `ltm_ebitda_m`, present; Valuation — Price & Capital Structure, §§4, 7; Earnings — Historical Financials, §2]

## 3. Premium / Discount to Peer Median

| Multiple | Company | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| EV/EBITDA, LTM vendor basis | 13.4x | 59.4x | **(77.4%) discount** = (13.4x − 59.4x) / 59.4x |
| P/E | N/S | N/S | Not assessable |
| EV/EBIT | N/S | N/S | Not assessable |
| EV/Sales | 4.6x | N/S | Not assessable |
| FCF yield | 4.1% | N/S | Not assessable |

**Is the gap typical or unusual?** **Not assessable** — the frozen evidence has no ~3-year series of AKAM’s multiples relative to the same peer set. The vendor read also fails the filing-bridge reconciliation above, so the point-in-time 77.4% EV/EBITDA discount is not a verified relative-value signal.

## 4. Is the Gap Warranted?

**Discount is warranted, but not sizeable from the available peer matrix.** AKAM’s 5.9% LTM revenue growth trails the default-set median of 20.9%, and its 25.0% LTM EBITDA margin is below Fortinet’s 34.5%, although it is above the loss-making Cloudflare and Fastly; the broad median margin is not a meaningful quality benchmark because the group includes several loss makers. [CIQ Company Comparable Analysis, Financial Data and Operating Statistics sheets, 2026-09-14 — vendor export; Business Model — Moat, §3]

The underlying quality evidence is less favourable than a simple multiple comparison suggests: Q2 FY2026 gross margin was 55.8%, down 330 bps year on year; the business-quality score is 48/100, and the fast-changing-industry score is 35/100. The moat review finds no moat proven and reports LTM ROIC of 2.7%, while noting that its cost of capital is not assessable from the frozen evidence. [Q2 FY2026 Form 10-Q, Consolidated Statements of Income; Business Model — Business Quality, §§1–4; Business Model — Moat, §§3–5]

Finally, strict net debt/GAAP-derived EBITDA is 5.14x following May 2026 convertible issuance, a balance-sheet burden that the high-growth peers’ scattered vendor leverage fields do not measure on a matching basis. These are separate durability, growth and leverage reasons for a discount; this report does **not** apply a margin-ratio haircut to an earnings multiple. [Q2 FY2026 Form 10-Q, pp.3–4 and Note 7, pp.17–20; Valuation — Price & Capital Structure, §5]

## 5. Implied Value from Peer Multiples

No warranted peer multiple, and therefore no peer-derived **base-case implied value**, can be defended from the frozen data. The only complete peer-multiple statistic is the heterogeneous 59.4x vendor median, and the vendor’s subject multiple fails the EV-bridge reconciliation. The calculation below is shown because it is reproducible, not because it is a fair-value estimate.

| Multiple | Applied Peer Multiple | Implied EV or Equity | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| Broad default-set EV/EBITDA — mechanical only, **not a base-case value** | 59.4x LTM CIQ EBITDA | $64,146.1m EV = 59.4x × $1,079.9m; $58,063.5m equity = EV − $6,082.6m strict net debt | $377.81 = $58,063.5m / 153.686m diluted working shares | +253.8% vs $106.79 |
| Warranted peer-multiple base case | Not assessable | Not assessable | **Not assessable** | Not assessable |

The $377.81 mechanical result uses the vendor EBITDA denominator to match the vendor multiple, the canonical $6,082.6m strict net-debt bridge, and the required 153.686m diluted working share count. It is not a valid valuation range: the raw 59.4x median includes a mixture of security, cloud and software businesses with unmatched growth, profitability and capital intensity, and there is no consistent peer P/E, EV/EBIT, EV/Sales or FCF-yield dispersion from which to triangulate. [CIQ Financials → Income Statement, LTM June 2026; `ciq_facts.json`, `ltm_ebitda_m` and `peer_ev_ebitda`, present; Valuation — Price & Capital Structure, §7]

The peer-multiple dispersion is **Not assessable**. This is a partial-data outcome, not a reason to manufacture a narrower range. The closest high-value next input is a consistent, same-date Capital IQ peer export with EV, LTM/NTM revenue, EBITDA, EBIT, EPS, FCF and net debt for the named peers.

| Multiple adjusted | Peer median | Adjusted to | Gap already in the denominator? | What the extra adjustment pays for | How it was sized |
|---|---:|---:|---|---|---|
| None — no quality adjustment applied | 59.4x EV/EBITDA | N/A | Yes — EBITDA already carries the margin gap | N/A; no separate risk, durability or growth adjustment can be sized from a complete matched peer matrix | N/A |

No convergence with `02_multiples-own-history` is claimed: that method records where AKAM itself has traded and is not independent corroboration of a peer-derived value.

## 6. Sector Cycle Reality Test

**Not assessable — no sector-level multiple history.** The frozen pool has a 2026-09-14 peer snapshot but no same-basis peer-group aggregate multiple or sector-index multiple 3–5 years earlier. No cycle-elevated/depressed tag is emitted.

## 7. Relative Read

AKAM shows a 77.4% EV/EBITDA discount to Capital IQ’s broad default-set median, but the number is not a usable relative-value signal: the basket is economically mixed and the vendor’s 13.4x AKAM multiple does not reconcile to the filing-based EV bridge. AKAM’s slower growth, weaker margins versus Fortinet, declining profitability and 5.14x strict leverage support a discount, but its defensible size is not proven from the available data. The $377.81 mechanical broad-basket result is not a base-case value; a peer-based base point and cross-multiple range are **Not assessable**.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — AKAM

AKAM is an operating business, so the valuation method is an FCFF-style DCF with an EV-to-equity bridge. It reports under U.S. GAAP in USD; all amounts below are USD millions except per-share data. This is a cash-flow cross-check, not a view of what the current price implies.

## 1. FCF Base & Normalizations

The cash-flow anchor is the LTM period ended 30 June 2026. I use the module's cash identity, `FCFF approximation = CFO − total cash capex`, because a cash-flow statement exists. NOPAT is shown as a profitability and terminal-financeability control, but it is not added again to FCF; doing so would double count items already in CFO. The DCF counts only the estimated H2 FY2026 cash flow because the latest cash balance already includes H1 FY2026.

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | 4,322.8 | LTM to 30 Jun. 2026; no normalization. | [FY2025 Form 10-K, Consolidated Statements of Income, p.54; Q2 FY2026 Form 10-Q, Statements of Income, p.5] |
| GAAP EBIT | 455.7 | LTM operating income. It is used only as a margin control, because future consensus EBITDA/EBIT definitions are not reconciled to GAAP. | [FY2025 Form 10-K, p.54; Q2 FY2026 Form 10-Q, p.5] |
| CFO | 1,447.2 | LTM CFO; H1 FY2026 CFO was 638.8 versus 710.3 a year earlier, so the first forecast CFO margin is below LTM. | [FY2025 Form 10-K, Statements of Cash Flows, pp.55–56; Q2 FY2026 Form 10-Q, pp.7–8; CIQ Financials → Cash Flow, LTM Jun. 2026 — vendor export, reconciled] |
| Total cash capex | (817.3) | Purchases of property/equipment plus capitalized internal-use software. It is the filing-based cash-capex definition, not management's unreconciled “CapEx” measure. | [FY2025 Form 10-K, p.55; Q2 FY2026 Form 10-Q, p.7] |
| Reported FCF | 629.9 | `1,447.2 − 817.3`; this is the observed cash benchmark. No one-off cash inflow was identified. | [FY2025 Form 10-K, pp.55–56; Q2 FY2026 Form 10-Q, pp.7–8] |
| Operating working capital | 522.5 at FY2025 | The forecast uses NWC as a percentage of revenue. The FY2025 build is receivables + prepaids − payables − accrued expenses excluding income taxes − deferred revenue − other current liabilities. | [Capital IQ Financials → Balance Sheet, FY2025 — vendor export; Earnings Historical Financials, §1] |
| Tax rate for NOPAT and WACC | 19.0% | Normalized model rate. It excludes the H1 FY2026 16.4% reported rate because the filing identifies excess SBC tax benefits, a state-credit valuation-allowance change, and R&D-credit benefits. The FY2026–FY2029 consensus effective-tax-rate series is about 19%; this is a modeling assumption, not company guidance. | [Q2 FY2026 Form 10-Q, Note 12, p.24; Capital IQ Estimates → Consensus, Effective Tax Rate, FY2026–FY2029 — vendor export] |

FY2025 reported FCF was $699.3m, while LTM FCF fell to $629.9m. The lower LTM base is the conservative starting point. Stock-based compensation remains a material limitation: FY2025 SBC was $459.4m and H1 FY2026 SBC was $275.0m. CFO adds it back as a non-cash charge, while the per-share bridge uses the latest disclosed diluted shares; future award dilution cannot be rebuilt from the pool. [FY2025 Form 10-K, pp.34, 54–56; Q2 FY2026 Form 10-Q, Note 13, p.24]

## 2. Forecast Assumptions

`C` = direct Capital IQ consensus estimate; `A` = analyst assumption, not company-guided. The FY2026–FY2028 revenue cells use consensus; the export has no single workbook snapshot date, so its current figures carry that freshness limitation. The FY2026 company revenue range is $4,445m–$4,530m, and the FY2026 consensus value of $4,491.3m sits within it. [Q2 FY2026 earnings release, Financial guidance, p.2; Capital IQ Estimates → Consensus, FY2026–FY2028 — vendor export]

| Assumption | FY2026E | FY2027E | FY2028E | FY2029E | FY2030E | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 6.7% (C) | 13.1% (C) | 11.5% (C) | 8.0% (A) | 6.0% (A) | 0.8% (A) | FY2026–FY2028 revenue is $4,491.3m / $5,078.7m / $5,662.3m from consensus. FY2029–FY2030 fade as the CIS ramp matures. [Capital IQ Estimates → Consensus, FY2026–FY2028 — vendor export; Q2 FY2026 earnings call, prepared remarks and Q&A] |
| GAAP EBIT margin % | 10.5% (A) | 12.0% (A) | 13.0% (A) | 13.5% (A) | 14.0% (A) | 14.0%, but return on capital fades to WACC (A) | Starts at LTM GAAP EBIT margin of 10.5%; FY2030 remains below FY2023's 16.7%. Q2 FY2026 GAAP EBIT margin was 7.3%, so the recovery is an assumption, not guidance. [FY2025 Form 10-K, p.54; Q2 FY2026 Form 10-Q, p.5] |
| Tax rate % | 19.0% (A) | 19.0% (A) | 19.0% (A) | 19.0% (A) | 19.0% (A) | 19.0% (A) | Normalized rate described in §1; excludes the disclosed H1 FY2026 discrete benefits. [Q2 FY2026 Form 10-Q, Note 12, p.24] |
| CFO (% of revenue) | 30.0% (A) | 31.0% (A) | 32.0% (A) | 33.0% (A) | 33.5% (A) | 33.5% (A) | H1 FY2026 CFO margin was 29.4%; LTM was 33.5%. The path assumes cash conversion returns only to the LTM level, not above it. [FY2025 Form 10-K, pp.55–56; Q2 FY2026 Form 10-Q, pp.7–8] |
| Cash capex (% of revenue) | 20.0% (A) | 20.0% (A) | 19.5% (A) | 19.0% (A) | 18.5% (A) | 18.5% (A) | LTM filing-based cash capex was 18.9% of revenue. Management's roughly 40%-of-revenue FY2026 “CapEx” guide is not used as the same metric because the company does not reconcile it to cash capex. [Q2 FY2026 Form 10-Q, p.7; Q2 FY2026 earnings call, CFO prepared remarks] |
| NWC (% of revenue) | 13.0% (A) | 12.5% (A) | 12.0% (A) | 11.7% (A) | 11.5% (A) | 11.5% (A) | Begins near the FY2025 12.4% working-capital base, then improves modestly. It is a revenue-linked driver, not a flat-dollar assumption. [Capital IQ Financials → Balance Sheet, FY2025 — vendor export; Earnings Quality, §3] |

The forecast deliberately does not use FY2026 consensus EBITDA or EBIT as if it were GAAP. The vendor's FY2026 EBITDA forecast is $1,749.3m, materially above the LTM vendor figure of $1,079.9m, while management guides non-GAAP operating margin rather than GAAP margin. There is no supplied reconciliation proving that those forward measures equal the GAAP-derived EBITDA or EBIT used in the historical report. [Capital IQ Estimates → Consensus, FY2026 — vendor export; Q2 FY2026 earnings release, Financial guidance, p.2]

## 3. Discount Rate (WACC)

WACC is the blended cost of debt and equity — the return both lenders and shareholders require. I use market-value weights and the same 19.0% normalized tax rate as NOPAT. There is no discretionary WACC override.

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.83% | [Web: U.S. Treasury daily par yield curve, 10-year Treasury, 2026-09-09 (unverified)](https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?field_tdr_date_value_month=202609&type=daily_treasury_yield_curve) |
| Equity-risk premium | 4.23% | [Web: Damodaran U.S. implied ERP, data update 2026-01-09 (unverified)](https://pages.stern.nyu.edu/adamodar/New_Home_Page/datacurrent.html) |
| Beta | 1.00 used | Raw AKAM beta was 0.63 on a five-year monthly window versus the S&P 500; it is floored at 1.00 because Akamai is price-competed and carries material data-centre capacity exposure. [Web: Yahoo Finance, AKAM, 5Y monthly beta versus S&P 500, accessed 2026-09-14 (unverified)](https://finance.yahoo.com/quote/AKAM/?p=AKAM); [Q2 FY2026 Form 10-Q, MD&A—Revenue and Cost of Revenue, pp.30–32] |
| Cost of equity | 9.06% | `4.83% + 1.00 × 4.23%` |
| Pre-tax cost of debt | 0.55% | Principal-weighted effective interest rate on the five convertible-note tranches: $42.237m annualized effective interest ÷ $7,640m principal. [Q2 FY2026 Form 10-Q, Note 7 (Debt), pp.17–20] |
| Tax rate | 19.0% | Normalized tax rate in §1. |
| Equity / debt weights | 66.99% / 33.01% | $15,345.7m market capitalization and $7,562.8m filing carrying debt. [Price & Capital Structure, §§3–4; Q2 FY2026 Form 10-Q, pp.3–4] |
| **WACC** | **6.22%** | `0.669869 × 9.06% + 0.330131 × 0.55% × (1 − 19.0%)` |

The required bounds pass: after-tax debt cost is 0.45% ≤ WACC 6.22% < cost of equity 9.06%; `k_e − r_f` is 4.23 percentage points; and 9.06% is below `4.83% + 1.4 × 4.23% = 10.75%`. No country-risk premium is added. This is a deliberate choice, not an assertion of zero country risk: AKAM reports in USD and the pool does not show cash flows concentrated in an emerging or non-reserve-currency market, though international revenue was 50% of Q2 revenue. [Q2 FY2026 Form 10-Q, p.31]

## 3A. Cost-of-Capital Reality Test

| Reference | Rate | Source (cite per §5) | Gap vs model WACC |
|---|---:|---|---:|
| Model WACC (CAPM build, §3) | 6.22% | This agent, §3 | — |
| Scope-matched group discount rate | **Group discount rate not disclosed** | The 10-K describes annual goodwill testing for one reporting unit but does not disclose a group WACC, cost of equity, or impairment discount rate. [FY2025 Form 10-K, Goodwill and Acquired Intangible Assets; Q2 FY2026 Form 10-Q, Note 5] | N/A |
| Other disclosed rate — comparator only | 3.6% / 4.4% / 5.1% | Real-estate, co-location, and data-centre operating-lease discount rates. These are obligation-specific lease rates, not a group WACC or cost of equity. [FY2025 Form 10-K, Note 15 (Leases), p.80] | −2.6pp / −1.8pp / −1.1pp |
| Market-implied rate | Not available | `05_reverse-dcf` runs after this report and must test the same cash-flow base and WACC. | N/A |
| Trailing FCF yield / earnings yield | 4.10% / 2.58% | `629.9 ÷ 15,345.7` and `$2.75 LTM GAAP EPS ÷ $106.79`; equity yields are cross-checks, not directly comparable to WACC. [Historical Financials, §2; Price & Capital Structure, §§1–3] | N/A |
| Peer / industry cost of capital | Not proven from available data | No scope-matched peer WACC is present in the frozen pool. | N/A |

**Escalation branch:** no `RF-VAL-003` trigger is testable at this point: a scope-matched group rate is not disclosed and the market-implied rate belongs to the later reverse-DCF. The low coupon cost of debt reflects existing convertibles; it is not evidence that new debt could be raised at 0.55%.

## 4. Free Cash Flow Forecast & Discounting

The operational rows are full fiscal-year forecasts. The first discounted cash-flow row uses only H2 FY2026: full-year forecast FCF of $449.1m less reported H1 FCF of $221.2m (`$638.8m CFO − $417.6m cash capex`). This prevents cash already reflected in the 30 June 2026 balance sheet from being counted twice. Cash flows are discounted from the last filed balance-sheet date using mid-period timing: 0.25 years for H2 FY2026, then 1.0, 2.0, 3.0, and 4.0 years for FY2027–FY2030. The price is 14 September 2026, so the June balance-sheet/September-price mismatch remains a stated limitation. [Q2 FY2026 Form 10-Q, pp.3, 7–8; Price & Capital Structure, §1]

| Year | Revenue | EBIT | NOPAT | CFO | Capex | ΔNWC | Full-year FCF | DCF cash used | Discount Factor | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026E | 4,491.3 | 471.6 | 382.0 | 1,347.4 | (898.3) | +61.4 | 449.1 | 227.9 (H2 only) | 0.985035 | 224.5 |
| FY2027E | 5,078.7 | 609.4 | 493.7 | 1,574.4 | (1,015.7) | +51.0 | 558.7 | 558.7 | 0.941471 | 526.0 |
| FY2028E | 5,662.3 | 736.1 | 596.2 | 1,812.0 | (1,104.2) | +44.6 | 707.8 | 707.8 | 0.886367 | 627.4 |
| FY2029E | 6,115.3 | 825.6 | 668.7 | 2,018.1 | (1,161.9) | +36.0 | 856.1 | 856.1 | 0.834489 | 714.4 |
| FY2030E | 6,482.3 | 907.5 | 735.1 | 2,171.6 | (1,199.2) | +30.0 | 972.3 | 972.3 | 0.785646 | 763.9 |

`Full-year FCF = CFO − cash capex`. NOPAT, D&A, and working capital are not separately added into that FCF row because CFO already contains their cash effect. D&A is 17.0% / 17.5% / 18.0% / 18.0% / 17.5% of revenue in FY2026–FY2030, respectively, and is used only for the terminal financeability check.

**Working-capital sign check:** modeled NWC increases from $522.5m at FY2025 to $583.9m, $634.8m, $679.5m, $715.5m, and $745.5m. The annual changes shown as +$61.4m, +$51.0m, +$44.6m, +$36.0m, and +$30.0m are cash absorptions, so they lower CFO; they are not subtracted a second time from FCF. The NWC/revenue ratio falls, but NWC still rises in dollars because revenue grows. This is the required actual-path sign, not an inference from the ratio alone.

Sum of PV of explicit FCFs: **$2,856.2m**.

Executed Bash calculation and raw output:

```bash
awk 'BEGIN{rf=.0483;erp=.0423;beta=1;ke=rf+beta*erp;kd=42.237/7640;t=.19;we=15345.7/(15345.7+7562.8);wd=1-we;w=we*ke+wd*kd*(1-t);split("227.926 558.7 707.8 856.1 972.3",f," ");split(".25 1 2 3 4",tt," ");pv=0;for(i=1;i<=5;i++)pv+=f[i]/(1+w)^tt[i];g=w*((1199.2-1134.4+30.0)/735.1);tv=f[5]*(1+g)/(w-g);pvtv=tv/(1+w)^4.5;ev=pv+pvtv;eq=ev-6082.6;ps=eq/153.686;printf("WACC blend: we=%.6f, ke=%.6f, wd=%.6f, kd_after_tax=%.6f, WACC=%.6f\n",we,ke,wd,kd*(1-t),w);printf("PV explicit FCF=%.1f; terminal g=%.4f; TV=%.1f; PV TV=%.1f; EV=%.1f\n",pv,g,tv,pvtv,ev);printf("EV-to-equity: EV %.1f - strict net debt 6082.6 = equity %.1f; / diluted shares 153.686 = $%.2f/share\n",ev,eq,ps)}'
```

```text
WACC blend: we=0.669869, ke=0.090600, wd=0.330131, kd_after_tax=0.004478, WACC=0.062168
PV explicit FCF=2856.2; terminal g=0.0080; TV=18099.3; PV TV=13797.2; EV=16653.4
EV-to-equity: EV 16653.4 - strict net debt 6082.6 = equity 10570.8; / diluted shares 153.686 = $68.78/share
```

## 5. Terminal Value

- **Base method — Gordon growth:** `TV = FCFF_(n+1) / (WACC − g) = 972.3 × (1 + 0.80%) / (6.2168% − 0.80%) = $18,099.3m`.
- **Why terminal growth is only 0.80%:** terminal reinvestment is `(capex − D&A + ΔNWC) / NOPAT = (1,199.2 − 1,134.4 + 30.0) / 735.1 = 12.89%`. With terminal ROIC faded to the 6.22% WACC because no moat is proven, financeable nominal growth is `6.22% × 12.89% = 0.80%`. This is 0.7 percentage points below long-run nominal GDP assumptions, but avoids assuming a perpetual excess return that the upstream moat read does not support. [Business-model Moat, §§3 and 5]
- Terminal value (undiscounted): **$18,099.3m**.
- PV of terminal value: **$13,797.2m**.
- **Terminal value as % of total EV: 82.2%.** This is above the 75% threshold: the DCF is terminal-dominated and low confidence.
- **Exit-multiple cross-check:** FY2030 modeled EBITDA is $2,041.9m (`$907.5m EBIT + $1,134.4m D&A`). An 8.0x exit value gives $16,335.2m terminal value, $12,452.5m PV, and **$60.03 per share**. The Gordon value implies 8.86x terminal EBITDA. The current CIQ LTM EV/EBITDA read is 13.4x, but it uses a vendor EBITDA definition that differs from the GAAP-derived series and its six-close own-history range is low confidence; the 8.0x check is therefore an analyst cross-check, not a peer-derived target. [CIQ Financials → Multiples, latest and six closes — vendor export; Historical Financials, §1]

**Structural-decline / runoff terminal — separate bear input, not the base:** the moat report says *“No moat proven — trajectory eroding”* with a material cash-conversion contradiction, and Business Quality scores rate-of-change/disruption at 35/100. That activates a separate structural-reset terminal. I model FY2031 FCF at $800m (about a 12% FCF margin after a fade from FY2030's 15% margin and a GAAP EBIT-margin fade toward 10%) and `g = −1.0%` nominal thereafter. Its terminal value is $11,085.2m, PV is $8,450.3m, and the resulting per-share value is **$33.99**. This is an inference, not from filings, and it is not silently substituted for the base Gordon case. [Business-model Moat, §5; Business-model Business Quality, §4]

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFs | 2,856.2 |
| + PV of terminal value | 13,797.2 |
| **= Enterprise value** | **16,653.4** |
| − Net debt (strict basis) | (6,082.6) |
| − Minority / preferred | 0.0 |
| **= Equity value** | **10,570.8** |
| ÷ Diluted shares | 153.686m |
| **= Intrinsic value per share** | **$68.78** |
| vs current price | **$38.01 below $106.79 (−35.6%)** |

The bridge uses the canonical filing-based strict net debt of $6,082.6m and the Q2 diluted weighted-average share count of 153.686m. The denominator is not a point-in-time fully diluted count; the filing does not disclose the current award population and strikes needed to rebuild one. [Price & Capital Structure, §§2, 5, and 7; Q2 FY2026 Form 10-Q, Note 13, p.24]

## 7. Sensitivity Grid (per-share intrinsic value)

WACC across columns; terminal growth down rows. All cells are valid: the smallest `WACC − g` is 3.92 percentage points, well above the 0.5 percentage-point invalidity guard.

| | WACC −1% (5.22%) | WACC (6.22%) | WACC +1% (7.22%) |
|---|---:|---:|---:|
| g +0.5% (1.30%) | $109.66 | $78.40 | $57.77 |
| g (0.80%) | $94.34 | **$68.78** | $51.24 |
| g −0.5% (0.30%) | $82.14 | $60.79 | $45.65 |

## 8. Intrinsic Read

**Base intrinsic value is $68.78 per share**, versus the dated pool-verified price of $106.79; the $45.65–$109.66 sensitivity grid is the dispersion exhibit, not a substitute for that point. The biggest sensitivity is terminal value, which supplies 82.2% of EV; the $60.03 exit-multiple cross-check and the $33.99 structural-runoff input show why this DCF should carry low confidence rather than a precise conclusion. The model's key operating assumption is that cash conversion returns from H1 FY2026's 29.4% CFO margin to the LTM 33.5% level while cash capex declines from 20.0% to 18.5% of revenue; that recovery is not proven from filings.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — AKAM

AKAM is an operating business. This reverse discounted-cash-flow (DCF) analysis values enterprise cash flows, then compares them with the pool-verified enterprise value. Akamai reports under U.S. GAAP in USD; all amounts are USD millions except per-share data and percentages.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $106.79 at the 14 Sep. 2026 close; pool-verified | [CIQ Comps → Financial Data, “Day Close Price Latest,” data as of 2026-09-14; `ciq_facts.json`, `current_price`, present; Price & Capital Structure, §1] |
| Enterprise value | $21,428.3 | `$15,345.7m` market cap + `$7,562.8m` filing debt − `$1,480.3m` cash and equivalents; operating leases excluded. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Price & Capital Structure, §§3–4] |
| FCF base | $629.9 LTM to 30 Jun. 2026 | Free cash flow (FCF, cash from operations less cash capex) = `$1,447.2m − $817.3m`; no one-off normalization was identified. [FY2025 Form 10-K, Statements of Cash Flows, pp.55–56; Q2 FY2026 Form 10-Q, Statements of Cash Flows, pp.7–8; Intrinsic DCF, §1] |
| Discount rate (WACC) used | 6.2168% | Used verbatim from `04`: 9.06% cost of equity, 0.45% after-tax debt cost, and 66.99% / 33.01% equity/debt weights. [Intrinsic DCF, §3] |
| Terminal growth | 0.80% | Used verbatim from `04`; it is the model's financeable growth after return on capital fades to WACC. [Intrinsic DCF, §5] |
| Forecast horizon (years) | H2 FY2026 through FY2030; five cash-flow slots, terminal value discounted 4.5 years from 30 Jun. 2026 | Same dates and mid-period timing as `04`: 0.25, 1, 2, 3, and 4 years for explicit cash flows. [Intrinsic DCF, §4] |

The price state is **pool-verified**, so the reverse-DCF can run. The enterprise-value bridge uses the filing-based strict debt-and-cash basis from `01`, not CIQ's lease- and investment-inclusive net-debt field. [Price & Capital Structure, §§4–5 and Anchor Block]

## 2. Implied Expectations

I held the $629.9m LTM FCF base, 6.2168% WACC, 0.80% terminal growth, five cash-flow slots, and `04`'s timing convention fixed. I solved only for one annual FCF growth rate, `x`. The cash-flow sequence is `0.5 × base × (1+x)^0.5` for H2 FY2026, then `base × (1+x)^1.5` through `base × (1+x)^4.5` for FY2027–FY2030; terminal value is discounted at 4.5 years exactly as in `04`. This is an inference from the DCF inputs, not a filing forecast.

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCF CAGR over the horizon | **16.35%** a year |
| Implied H2 FY2026 / FY2027 / FY2028 / FY2029 / FY2030 FCF | $339.7m / $790.5m / $919.8m / $1,070.2m / **$1,245.1m** |
| Implied period of above-terminal growth | 4.5 years at 16.35%, before the model fades to 0.80% terminal growth |
| Implied FY2030 FCF margin if `04`'s $6,482.3m revenue path is held | **19.21%**, versus `04`'s 15.00% FY2030 FCF margin |

The executed root-find was:

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
B,EV,w,tg=629.9,21428.3,.062168,.008
t=[.25,1,2,3,4]
def root(f,lo,hi):
    for _ in range(200):
        m=(lo+hi)/2
        if f(lo)*f(m)<=0: hi=m
        else: lo=m
    return (lo+hi)/2
def ev_g(g,W=w,base=B,term=tg):
    c=[.5*base*(1+g)**.5]+[base*(1+g)**(i+.5) for i in range(1,5)]
    return sum(x/(1+W)**u for x,u in zip(c,t))+c[-1]*(1+term)/(W-term)/(1+W)**4.5
def ev_w(W):
    c=[227.9,558.7,707.8,856.1,972.3]
    return sum(x/(1+W)**u for x,u in zip(c,t))+c[-1]*(1+tg)/(W-tg)/(1+W)**4.5
g=root(lambda x:ev_g(x)-EV,-.9,.5)
wi=root(lambda x:ev_w(x)-EV,tg+1e-6,.5)
print(f'FCF_CAGR={g:.8%}; EV={ev_g(g):.1f}')
print(f'IMPLIED_WACC={wi:.8%}; EV={ev_w(wi):.1f}; ratio={wi/w:.4f}')
PY
```

```text
FCF_CAGR=16.34956885%; EV=21428.3
IMPLIED_WACC=5.04657045%; EV=21428.3; ratio=0.8118
```

The primary solve's terminal-value present value is $17,662.9m, or **82.4%** of EV. Its terminal dependence makes terminal-growth sensitivity necessary and limits precision.

## 2A. Implied Discount Rate — the dual solve (always run this)

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied discount rate at `04`'s base-case cash flows | `04`'s $227.9m / $558.7m / $707.8m / $856.1m / $972.3m cash-flow path, 0.80% terminal growth, and its timing convention | **5.05%** |
| `04`'s model WACC (for comparison) | — | **6.22%** |
| Ratio (implied ÷ model) | — | **0.81x** |

The 5.05% dual solve is 1.17 percentage points below `04`'s 6.22% WACC, so it cuts **against** the model WACC: with `04`'s cash-flow path unchanged, the current EV only reconciles at a lower required return. The 0.81x ratio is not the >1.5x trigger for the two-reading escalation. It therefore does not support a claim that the market is pricing a cash-flow collapse. The two non-exclusive explanations are a lower market-required return or more cash than `04` forecasts; the fixed-WACC solve quantifies the latter at 16.35% FCF CAGR.

For `04` §3A, the handoff is: **market-implied WACC 5.05%, 0.81x the 6.22% model WACC, cutting against the model rate but not triggering the >1.5x escalation.** `04` found no scope-matched group discount rate in the filings; lease discount rates are obligation-specific comparators, not a group WACC. [FY2025 Form 10-K, Note 15 (Leases), p.80; Intrinsic DCF, §3A]

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| 16.35% annual FCF growth to $1,245.1m in FY2030 | FCF was $618.4m in FY2023, $833.9m in FY2024, $699.3m in FY2025, and $629.9m LTM. FY2023–FY2025 FCF CAGR was 6.34%; LTM FCF was 9.92% below FY2025. [Historical Financials, §§1–2] | Q2 FY2026 revenue grew 5.4% year on year, while GAAP-derived EBITDA fell 18.7%. Security revenue grew 10% and CIS grew 39%, but category margins and their conversion into FCF are not disclosed; cost and payroll ratios are rising faster than revenue. [Earnings Sensitivity, §§1–3; Q2 FY2026 Form 10-Q, pp.5, 23, 30, 32–34] | **Stretch — not proven from available data** |
| 19.21% FY2030 FCF margin if `04` revenue is retained | LTM FCF margin was 14.57%. The `04` path reaches a 15.00% FY2030 FCF margin, not 19.21%. [Historical Financials, §2; Intrinsic DCF, §4] | The latest earnings evidence shows Q2 gross margin down 331 bps year on year and an expense-ratio increase of 441 bps. A margin recovery is possible but not demonstrated. [Historical Financials, §§3 and 6; Earnings Sensitivity, §2] | **Stretch — not proven from available data** |

At a fixed LTM FCF margin of 14.57%, the $1,245.1m FY2030 FCF requirement converts to **$8.545bn** of revenue, 31.8% above `04`'s $6.482bn FY2030 revenue path. Alternatively, holding `04`'s revenue path demands the 19.21% FCF margin above. This conversion is **inference, not from filings**; it shows the two possible ways to meet the price, not a company forecast.

The market-ceiling test cannot be completed credibly: the frozen pool has no dated addressable-market estimate or market-share series for Akamai's blended Delivery, Security, and CIS businesses. The filing discusses competition and potential market-share loss, while the business-model work specifically says market share is not disclosed. I therefore do not invent a TAM or use this check to support upside. [FY2025 Form 10-K, Item 1—Competition, p.8; Business-model Moat, §§4–5]

The implied 16.35% FCF CAGR is aggressive against the matched FCF history, not merely against revenue growth. It is not impossible: Security and CIS are growing, but the evidence does not establish their margins, and delivery pricing, capacity timing, payroll/SBC, and cost of revenue are current offsets. The moat read is also qualified: network scale exists, but no economic moat is proven; profit-economics measures eroded while cash conversion improved, so erosion is not confirmed across every metric. [Business-model Moat, §§2–5]

## 4. Robustness

| Discount Rate | Implied FCF CAGR to Justify Price |
|---|---:|
| WACC −1% (5.2168%) | 10.72% |
| WACC (6.2168%) | 16.35% |
| WACC +1% (7.2168%) | 21.34% |

| FCF-base sensitivity, same cash definition | FCF Base | Implied FCF CAGR to Justify Price |
|---|---:|---:|
| Low — H1 FY2026 annualized stress | $442.4m = $221.2m H1 FCF × 2 | 26.46% |
| Base — LTM | $629.9m | 16.35% |
| High — FY2025 actual | $699.3m | 13.49% |

The base sensitivity uses only the cash bases already stated in `04`: actual H1 FY2026 FCF, LTM FCF, and FY2025 FCF, each as CFO less total cash capex. The H1 annualization is a mechanical downside bound, not a forecast. [Intrinsic DCF, §§1 and 4]

| Terminal Growth | Implied FCF CAGR to Justify Price |
|---|---:|
| 0.30% (base −0.5%) | 18.48% |
| 0.80% (base) | 16.35% |
| 1.30% (base +0.5%) | 14.05% |

Across the observed FCF-base band, implied growth moves 13.0 percentage points (26.46% to 13.49%), slightly more than the 10.6-point movement across WACC ±1%. The FCF base is therefore the larger sensitivity in this run. Terminal growth also matters because terminal value is 82.4% of EV: a ±0.5% change moves implied growth by 4.4 percentage points.

## 5. What's-Priced-In Read

At $106.79, the market prices **16.35% annual FCF growth for 4.5 years**, from $629.9m LTM to roughly $1.245bn in FY2030, while retaining a 6.2168% WACC and 0.80% terminal growth. That is **aggressive**, because the matching FCF record was volatile—6.34% CAGR in FY2023–FY2025 and a 9.92% LTM decline—while Q2 FY2026 showed rising revenue but falling GAAP-derived EBITDA. [Historical Financials, §§1–3; Earnings Sensitivity, §§1–3]

There is no evidence-backed reason to call the requirement impossible, but it needs either revenue of about $8.545bn at the LTM FCF margin or a 19.21% FCF margin on `04`'s FY2030 revenue path. Both are above the supplied base path and are not proven from available data. The reverse-DCF therefore offers no evidence-based upside from the current price.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — AKAM

Akamai reports under U.S. GAAP in USD and has a 31 December fiscal year. **Effectively single-segment — SOTP collapses to the consolidated read.** The company has one operating and reportable segment, managed as one business; its CODM uses consolidated net income and the company does not accumulate discrete financial information for separate entities. The three solution categories are revenue disclosures, not profit-reporting segments. [Q2 FY2026 Form 10-Q, Note 1, p.10; Note 14 (Segment Information), p.25]

## 1. Segment Inventory

| Segment | Revenue | EBIT (or EBITDA) | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| Providing cloud services — AKAM's one reportable segment | $2,173.3m, H1 FY2026 | Not separately disclosed | Not disclosed | 100% of the one reportable business¹ | [Q2 FY2026 Form 10-Q, Note 14 (Segment Information), pp.25–26] |

¹This is not a calculated segment-EBIT share: Akamai discloses no separate segment EBIT or EBITDA. It means the sole reportable business contains all reported operations. The $2,173.3m revenue reconciles to the three solution-category revenues: Security $1,194.2m + Delivery and other cloud applications $785.1m + Cloud infrastructure services (CIS) $193.9m = $2,173.3m for H1 FY2026. [Q2 FY2026 Form 10-Q, Note 11 (Revenue from Contracts with Customers), p.23]

Security is the largest solution category by revenue ($604.4m, 55.0% of Q2 FY2026 revenue), followed by Delivery and other cloud applications ($395.9m, 36.0%) and CIS ($99.3m, 9.0%). These are not SOTP components: the company provides neither category costs, EBIT/EBITDA, margins, assets nor capital expenditure. [Q2 FY2026 Form 10-Q, Note 11, p.23; Note 14, pp.25–26]

There is no separate corporate or unallocated segment to capitalize and deduct. The reported one-segment cost stack already includes “other segment items,” which are marketing programmes, professional-service fees, non-income tax expense and other expenses; treating them as an additional corporate deduction would double count them. [Q2 FY2026 Form 10-Q, Note 14, pp.25–26]

## 2. Segment Multiples & Comparables

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| AKAM's one consolidated reportable segment | NTM consolidated EBITDA $1,868.8m, a Capital IQ estimate; not a solution-category metric | Not applied — SOTP collapsed | None used to set a SOTP multiple | N/A | [Capital IQ Estimates Report, Consensus worksheet, NTM EBITDA, data as of 2026-09-14] |

The available peers cannot support one defensible whole-company SOTP multiple. Cloudflare overlaps in security and delivery but its NTM EV/EBITDA is 127.66x; Fortinet is chiefly a security-and-networking vendor at 34.53x; Fastly overlaps in edge delivery/security at 25.08x. Each has a different product mix, capital needs and forward margin profile from Akamai's combined security, delivery and CIS operation. Applying any of them to all of AKAM would be an inference, not a comparable-based SOTP. [CIQ Company Comparable Analysis, Trading Multiples sheet, data as of 2026-09-14; CIQ Company Comparable Analysis, Business Description sheet, data as of 2026-09-14]

For a market-implied sanity check only, AKAM's own observed NTM EV/EBITDA is 10.74x. It is not an applied fair-value multiple: using the company's present trading multiple merely reproduces a market value rather than independently valuing the business. [Capital IQ Estimates Report, Multiples worksheet, NTM TEV/EBITDA, data as of 2026-09-14]

## 3. Segment Valuation

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| One consolidated reportable segment | $1,868.8m NTM EBITDA | Not applied | Not produced — no defensible segment multiple |
| Market-implied check only, not a SOTP valuation | $1,868.8m NTM EBITDA | 10.7396x current AKAM NTM EV/EBITDA (10.74x rounded) | $20,070.2m vendor TEV = $1,868.8m × 10.7396x |
| **Gross enterprise value (sum)** |  |  | **Not produced** |

The market-implied check reconciles, to rounding, to Capital IQ's $20,070.2m total enterprise value. It must not be bridged with the filing-based capital structure below: the vendor TEV nets a different, lease- and investment-inclusive net-debt figure of $4,722.7m, while the canonical equity bridge uses strict net debt of $6,082.6m. Combining those bases would manufacture a spurious SOTP equity value. [CIQ Company Comparable Analysis, Financial Data sheet, data as of 2026-09-14; `ciq_facts.json`, `net_debt_m`, present; Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; valuation/01_price-and-capital-structure.md, Anchor Summary]

## 4. Equity Bridge

| Step | Value |
|---|---:|
| Gross enterprise value | Not produced — SOTP collapsed to the consolidated read |
| − Capitalized unallocated corporate costs | Not separately deductible — costs are within the one reportable segment, not a separate corporate bucket |
| − Net debt | $6,082.6m strict basis; would be deducted once from a valid gross EV |
| − Minority / preferred | $0.0m / $0.0m |
| + Equity-method investments | $0.0m — none separately disclosed |
| − Conglomerate / holdco discount (if any) | None — AKAM is one operating/reportable business, not a holding company |
| **= Equity value** | **Not produced** |
| ÷ Diluted shares | 153.686m, latest disclosed Q2 diluted weighted-average; not used because no SOTP equity value exists |
| **= SOTP value per share** | **Not produced** |
| vs current price | Not assessable for SOTP; current AKAM price is $106.79 at 2026-09-14 |

The strict-basis net debt is $7,562.8m carrying-value debt less $1,480.3m cash and equivalents. This is the canonical downstream bridge; it excludes marketable securities and operating leases, which are reported separately. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; valuation/01_price-and-capital-structure.md, Anchor Summary]

No conglomerate or holdco discount is warranted because there is no separable collection of businesses to discount. This does not create a $0 corporate-cost assumption: it preserves the one-segment cost stack already included in the reported operation.

## 5. SOTP Read

No independent per-share breakup value is produced and this method should not be fed into `07_scenario-and-fair-value` as a weighted valuation method. AKAM's sole reportable segment carries 100% of disclosed business value; Security is the largest revenue category, but whether it carries most value is not proven because the filing does not disclose category profit or capital use. [Q2 FY2026 Form 10-Q, Note 11, p.23; Note 14, pp.25–26]

The core SOTP insight is negative: the evidence does not show a high-multiple component hidden inside a low-multiple consolidated business. A separate category SOTP is not possible — segment EBIT and matching segment comparables are unavailable.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — AKAM

All amounts are USD unless stated otherwise. The decision line is AKAM common stock on the Nasdaq Global Select Market. The $106.79 close on 14 September 2026 is pool-verified. This is a partial-data triangulation: only the intrinsic DCF produces a valid fair-value point. Accordingly, the base case is a single-method result and valuation confidence is capped at 50/100; it is not a broad-method consensus. [CIQ Comps → Financial Data, data as of 2026-09-14; `ciq_facts.json`, `current_price`, present; valuation/01_price-and-capital-structure, Anchor Block; valuation/04_intrinsic-dcf, §§5–8]

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | Not assessable — illustrative-only | Low | 0% | Only six quarterly closes (about 1.5 years) are available, below the report's minimum for a reversion target. The vendor EV/EBITDA series also does not reconcile to the filing-based EV bridge. [CIQ Financials → Multiples, 2025-03-31 to 2026-09-11; `ciq_facts.json`, `range_position`, present; valuation/02_multiples-own-history, §§2–4] |
| Relative / peers (03) | Not assessable — $377.81 is mechanical only | Low | 0% | The only complete statistic is a heterogeneous 59.4x vendor peer median, and AKAM's 13.4x vendor EV/EBITDA does not reconcile to the canonical bridge. It cannot set a warranted peer value. [CIQ Comps → Trading Multiples, data as of 2026-09-14; `ciq_facts.json`, `peer_ev_ebitda`, present; valuation/03_relative-valuation-peers, §§2–5] |
| Intrinsic DCF (04) | **$68.78** | Low | **100%** | It is the sole valid value-producing method. Its 82.2% terminal-value share of EV makes the point sensitive, but it is a fully bridged FCFF result using $6,082.6m strict net debt and 153.686m diluted working shares. [valuation/04_intrinsic-dcf, §§4–7; data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), pp.3–8, 17–20, 24] |
| Reverse-DCF (05) | 16.35% implied annual FCF growth; not a value | Low | n/a | This is a cross-check only. At the current EV, it requires FY2030 FCF of $1.245bn and a 19.21% FCF margin on the DCF revenue path. [valuation/05_reverse-dcf, §§2–5] |
| Sum-of-the-parts (06) | Not produced — single-segment sanity check only | n/a | 0% | AKAM has one reportable segment and no solution-category profit or capital data, so a breakup cannot be structured on a forward basis. [data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), Note 11 p.23; Note 14 pp.25–26; valuation/06_sum-of-the-parts, §§1–5] |

Weights sum to 100% across valid, value-producing methods: `1.00 × $68.78 = $68.78`. The 100% DCF weight is a mechanical consequence of the other methods being unusable; it does not signal high confidence.

## 2. Triangulation & Reconciliation

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Intrinsic DCF | $68.78 base; $45.65–$109.66 sensitivity grid | Low | 100% | The base uses a 6.22% WACC, 0.80% terminal growth, and a terminal value equal to 82.2% of EV. The grid changes WACC and terminal growth; it is not a second independent method. [valuation/04_intrinsic-dcf, §§4–7] |

The full high-to-low dispersion across valid value-producing **methods** is **Not assessable (one method)**, not 0%. The $45.65–$109.66 DCF sensitivity span is 140.2% of its lower bound, but it is within-method model sensitivity rather than cross-method corroboration. The single-method rule caps valuation confidence at 50/100; terminal dominance would independently cap the DCF at 60/100. [valuation/04_intrinsic-dcf, §§5, 7; valuation/MODULE_RULES.md, Score Cap Rules]

The $68.78 base point is therefore the DCF value, not a blended mid-point. The DCF's $60.03 exit-multiple check is directionally consistent with a lower cash-flow value, while its $33.99 declining-perpetuity structural-reset input shows the downside if the fading profit economics become permanent. [valuation/04_intrinsic-dcf, §5]

Neither multiple method provides independent support for the DCF. `02` found no cycle-elevated/depressed tag from its limited IGV price proxy (a 14.1% move, below the 25% guide); `03` could not test sector multiple history. More importantly, both methods are zero-weighted: `02` has too little history and `03` has no defensible homogeneous peer multiple. Their non-flagged status must not be read as evidence that the multiple anchors are sound. [valuation/02_multiples-own-history, §§4–5; valuation/03_relative-valuation-peers, §§5–6]

## 3. Bull / Base / Bear Fair-Value Levels

These are 12-month convergence levels derived from `04`'s DCF sensitivity grid, not a new peer- or own-history-multiple valuation. The P/FCF figures are an algebraic translation of each DCF equity value into the FY2030 FCF per diluted share; they are **implied**, not observed or warranted peer multiples. That distinction is necessary because `02`'s vendor FCF series uses a different definition and is illustrative-only. [valuation/02_multiples-own-history, §§1–4; valuation/04_intrinsic-dcf, §§4–7]

| Case | Fair Value / Share (point) | Forward Metric (FCF / terminal growth) | Implied P/FCF Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **$109.66** | FY2030 FCF $972.3m = $6.3265/share; terminal FCF growth 1.30% | 17.33x | 12 months | The documented FY2030 cash path must be met, including a recovery from H1 FY2026's 29.4% CFO margin toward 33.5%, while cash capex falls from 20.0% to 18.5% of revenue. Security and CIS must convert growth to cash despite capacity costs, and the market must accept a 5.22% WACC. The earnings evidence does not separately prove this upside path. [valuation/04_intrinsic-dcf, §§2, 4, 7; earnings/07_earnings-sensitivity, §§2, 5–6] |
| Base | **$68.78** | FY2030 FCF $972.3m = $6.3265/share; terminal FCF growth 0.80% | 10.87x | 12 months | FY2026–FY2028 revenue consensus and `04`'s EBIT-margin recovery to 14.0% by FY2030 occur, while return on capital fades to the 6.22% WACC because no moat is proven. [valuation/04_intrinsic-dcf, §§2, 4–6; business-model/09_moat, §§3–5] |
| bear_cyclical — operating / valuation sensitivity | **$45.65** | FY2030 FCF $972.3m = $6.3265/share; terminal FCF growth 0.30% | 7.22x | 12 months | The explicit cash path is unchanged, but lower lasting FCF growth and a 7.22% WACC compress the implied multiple. This is a DCF sensitivity state, not a documented cyclical trough: the earnings work does not supply a full-year through-cycle FCF range. Rising payroll/SBC, co-location and network costs, delayed CIS conversion, and Delivery renewal-price pressure are the evidence-backed ways the operating path can weaken. [valuation/04_intrinsic-dcf, §7; earnings/07_earnings-sensitivity, §§2, 4–6; data/AKAM/Akamai Technologies, Inc., Q2 2026 (Form 10-Q), pp.28, 30, 32–34] |

The case mechanics were executed rather than hand-calculated:

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
shares=153.686
fcf=972.3
for label,value,g,wacc in [('bull',109.66,.013,.0522),('base',68.78,.008,.0622),('bear',45.65,.003,.0722)]:
    metric=fcf/shares
    multiple=value/metric
    print(f'{label}: FCF/share={metric:.4f}; implied_P/FCF={multiple:.4f}x; check={metric*multiple:.2f}; terminal_g={g:.1%}; WACC={wacc:.2%}')
PY
```

```text
bull: FCF/share=6.3265; implied_P/FCF=17.3333x; check=109.66; terminal_g=1.3%; WACC=5.22%
base: FCF/share=6.3265; implied_P/FCF=10.8717x; check=68.78; terminal_g=0.8%; WACC=6.22%
bear: FCF/share=6.3265; implied_P/FCF=7.2156x; check=45.65; terminal_g=0.3%; WACC=7.22%
```

The bull is only 2.7% above the current price and therefore fails the scenario span check. It is the top of the valid DCF sensitivity grid, not a complete bullish operating case. No wider bull level is defensible from the valid methods, so it must not be used as if it captures all positive outcomes. [valuation/04_intrinsic-dcf, §7; valuation/MODULE_RULES.md, Scenario Construction & Method-Weighting Policy §2]

### bear_structural — Avoid-Ruin Structural Reset (24–36 Months)

The structural-reset trigger fires because the moat verdict is “No moat proven — trajectory eroding” and the rate-of-change/disruption score is 35/100. The moat report also records a material contradiction: CFO/EBITDA rose 16.3 percentage points while margins and ROIC fell. Its qualifier therefore travels: erosion is identified on profit economics but is not confirmed across every measure. I keep the $33.99 reset as a **24–36 month avoid-ruin floor**, rather than replacing the 12-month bear, because `04` is usable and already fades terminal ROIC to WACC. [business-model/09_moat, §5; business-model/07_business-quality, §4; valuation/04_intrinsic-dcf, §5]

`04`'s structural case uses FY2031 FCF of $800.0m, a roughly 12% FCF margin after a terminal GAAP EBIT-margin fade toward 10%, and −1.0% terminal growth. It is an EV-based declining-perpetuity valuation, so strict net debt is deducted before division: PV explicit FCF $2,856.2m + PV structural terminal value $8,450.3m = structural EV $11,306.5m; less $6,082.6m strict net debt = equity $5,223.9m; divided by 153.686m diluted working shares = **$33.99 per share**. [valuation/04_intrinsic-dcf, §§4–6; valuation/01_price-and-capital-structure, Anchor Block]

| Case label | Fair Value / Share | Forward Metric | Implied P/FCF Multiple | Horizon | Billing |
|---|---:|---:|---:|---|---|
| bear_structural | **$33.99** | FY2031 FCF $800.0m = $5.2054/share; −1.0% terminal growth | 6.53x | 24–36 months | Avoid-ruin floor, not the 12-month headline bear; the formal moat verdict retains its cash-conversion qualifier. |

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
pv_explicit=2856.2; pv_struct_terminal=8450.3; net_debt=6082.6; shares=153.686
ev=pv_explicit+pv_struct_terminal
equity=ev-net_debt
print(f'structural EV={pv_explicit:.1f}+{pv_struct_terminal:.1f}={ev:.1f}; equity={ev:.1f}-{net_debt:.1f}={equity:.1f}; per_share={equity:.1f}/{shares:.3f}=${equity/shares:.2f}')
PY
```

```text
structural EV=2856.2+8450.3=11306.5; equity=11306.5-6082.6=5223.9; per_share=5223.9/153.686=$33.99
```

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | $106.79, pool-verified at 2026-09-14 [CIQ Comps → Financial Data, data as of 2026-09-14; `ciq_facts.json`, `current_price`, present] |
| Base-case fair value (point) | $68.78 |
| Bear-case fair value | $45.65 — 12-month operating / valuation-sensitivity bear |
| Implied upside to base case = (base FV − price) / price | **−35.6%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **−55.3%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **57.3%** |

The two metrics are deliberately different: the −55.3% margin of safety says the current price is above the $68.78 base fair value, while the 57.3% inverted downside-to-bear measures the decline from $106.79 to $45.65. The separate $33.99 avoid-ruin floor implies 68.2% downside at its longer 24–36 month horizon; it is not substituted into the 12-month bear metric.

The weighting and price-relative arithmetic were executed as follows:

```bash
/usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
price=106.79; base=68.78; bear=45.65
weighted=1.00*base
print(f'weighted_base={weighted:.2f}')
print(f'implied_upside_to_base={(base-price)/price:.1%}')
print(f'margin_of_safety={(base-price)/base:.1%}')
print(f'downside_to_bear={(price-bear)/price:.1%}')
PY
```

```text
weighted_base=68.78
implied_upside_to_base=-35.6%
margin_of_safety=-55.3%
downside_to_bear=57.3%
```

## 5. Warranted-Multiple Check

The base value's implied 10.87x FY2030 P/FCF translation depends on cash conversion recovering while terminal returns fade to the cost of capital. That is more cautious than assuming a permanent excess return, but it is still a low-confidence value because 82.2% of the DCF EV is terminal value. [valuation/04_intrinsic-dcf, §§4–7]

The current price is not supported by the available cash evidence: `05` calculates that it requires 16.35% annual FCF growth to $1.245bn by FY2030 or a 19.21% FCF margin on `04`'s revenue path, versus LTM FCF margin of 14.57%. Security and CIS growth can help, but their category margins are not disclosed; Delivery price pressure and infrastructure costs remain visible. [valuation/05_reverse-dcf, §§2–5; earnings/07_earnings-sensitivity, §§1–6]

There is no RF-OWN-004 controlling-owner flag: the governance work identifies no government, parent, conglomerate, or controlling-owner structure. The relevant valuation limitation is operating durability instead—business quality is 48/100, disruption risk is 35/100, and no economic moat is proven. [management-governance/04_ownership-and-insider-behavior, §4; business-model/07_business-quality, §§2, 4; business-model/09_moat, §5]

## 6. Fair-Value Read

The levels are **$109.66 bull, $68.78 base, and $45.65 12-month bear**, with a separate $33.99 avoid-ruin structural-reset floor. At the $106.79 pool-verified price, the base case gives a −55.3% margin of safety and the 12-month bear implies 57.3% downside; those are separate measures. The $68.78 DCF drives the answer because all other methods are non-value-producing, so confidence is capped rather than strengthened by false triangulation. The main swing factor is whether Security and CIS growth turns into lasting cash conversion before data-centre capacity, payroll/SBC, and Delivery renewal-price pressure erode the terminal cash-flow path. [valuation/04_intrinsic-dcf, §§4–8; valuation/05_reverse-dcf, §§2–5; earnings/07_earnings-sensitivity, §§2, 5–6]
