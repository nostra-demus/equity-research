# valuation Module Dossier — NU

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-08-31T07:46:02Z
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

# Valuation Module — NU (Synthesis)

## Abstract

NU’s US$6.47 base fair value is 54.8% below the pool-verified US$14.30 NYSE price. [Scenario & Fair Value — NU, §§2–6, 2026-08-31] The 12-month bull/base/bear levels are US$8.43/US$6.47/US$4.40, expressed on forward price-to-tangible-book-value (P/TBV), while the base point equally blends peer NTM P/E and residual income. [Scenario & Fair Value — NU, §§1–3, 2026-08-31] At a 16.51% cost of equity, price implies 47.36% terminal ROE or 80.89% FY2027–30 profit growth; neither is proven, though a 9.78% implied hurdle exposes rate uncertainty. [Reverse DCF — NU, §§2–5, 2026-08-31] Margin of safety is negative 121.2%, and bear-case downside is 69.3%. [Scenario & Fair Value — NU, §4, 2026-08-31] The verdict is materially overvalued, with the unproven group-wide cost of equity the main unresolved input.

## 1. Valuation Verdict

- **Verdict:** **Materially overvalued** — base fair value is 54.8% below the pool-verified price. [Scenario & Fair Value — NU, §§4, 6, 2026-08-31]
- **Base-case fair value (point, per share):** **US$6.47** on `NU · NYSE · USD`. [Scenario & Fair Value — NU, §2, 2026-08-31]
- **Current price:** **US$14.30**, last close 2026-08-29; price-state **pool-verified**. [Capital IQ Comps → Financial Data, subject row, as of 2026-08-29; `ciq_facts.json` `current_price`]
- **Bull / Base / Bear fair-value levels (points):** **US$8.43 / US$6.47 / US$4.40**, each with a 12-month horizon. [Scenario & Fair Value — NU, §3, 2026-08-31]
- **Cross-method dispersion (football field, low–high):** **US$2.95–US$7.92** per share; a 2.68x or 168% low-to-high span. [Scenario & Fair Value — NU, §2, 2026-08-31]
- Valuation attractiveness /100 *(higher = cheaper)*: **5** — the base value is 54.8% below price and even the bull value is below price. [Scenario & Fair Value — NU, §§3–6, 2026-08-31]
- Margin of safety /100 *(higher = better)*: **0** — the defined cushion is negative 121.2%. [Scenario & Fair Value — NU, §4, 2026-08-31]
- Valuation confidence /100: **48** — two weighted methods are 33% apart, but the complete football field spans 168% and the residual-income discount rate is not group-wide. [Scenario & Fair Value — NU, §§1–2, 2026-08-31; Intrinsic Equity Value — NU, §§3, 8, 2026-08-31]
- Downside risk /100 *(higher = worse — inverted)*: **90** — the loss from US$14.30 to the US$4.40 bear value is 69.3%. [Scenario & Fair Value — NU, §4, 2026-08-31]
- Data quality /100: **80** — current price, filings, consensus and peers are present, but a group-wide cost of equity and sector-multiple history are absent. [Valuation Data Triage — NU, §§2–6, 2026-08-31; Intrinsic Equity Value — NU, §8, 2026-08-31]
- Overall usefulness /100: **72** — the module supplies current-price-relative case levels and a reconciled base, but the wide dispersion and rate question limit precision. [Scenario & Fair Value — NU, §§1–6, 2026-08-31]
- Dominant valuation method: **Forward P/TBV drives the bull/base/bear levels; the US$6.47 base point itself equally blends the peer NTM-P/E value and residual-income value.** [Scenario & Fair Value — NU, §§1–3, 2026-08-31]
- What’s priced in: **At the 16.51% cost of equity, US$14.30 requires 47.36% terminal ROE or 80.89% FY2027–30 net-income growth; the same earnings path reconciles at a 9.78% cost of equity, so the aggressive-expectations verdict is conditional on the rate.** [Reverse DCF — NU, §§2–5, 2026-08-31]
- Biggest valuation risk: **The 16.51% rate is disclosed for a Brazil-focused Investments CGU, not NU Group; if the proper group cost of equity is nearer the 9.78% market-implied rate, the US$5.55 residual-income value materially understates equity value.** [Intrinsic Equity Value — NU, §3, 2026-08-31; Reverse DCF — NU, §2A, 2026-08-31]

## 1A. Module Disconfirmation

- **Strongest bear point:** Both weighted values—US$7.38 from peer NTM P/E and US$5.55 from residual income—sit below US$14.30, and the US$8.43 bull level also remains below price. [Scenario & Fair Value — NU, §§1–4, 2026-08-31]
- **Strongest bull point:** NU’s vendor-basis LTM revenue growth was 44.33% versus the direct-peer median’s 6.63%, and the current price reconciles to the modeled earnings path at a 9.78% cost of equity; both observations can support a multiple above mature-bank peers. [Relative Valuation — Peers — NU, §§2, 4, 2026-08-31; Reverse DCF — NU, §2A, 2026-08-31]
- **Single killer risk:** The group cost of equity is not proven; choosing 16.51% rather than a rate nearer 9.78% changes the residual-income conclusion from large downside to price reconciliation. [Intrinsic Equity Value — NU, §3A, 2026-08-31; Reverse DCF — NU, §2A, 2026-08-31]
- **Disconfirming evidence already visible:** FY2023–FY2025 diluted EPS compounded at 66.0% from a low base and FY2025 ROE was 30.3%, weakening a simple convergence-to-incumbent-bank valuation; the record covers only two profitable growth years and not a full credit cycle. [Reverse DCF — NU, §3, 2026-08-31]

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | **Sufficient** | NU is a financial issuer; pool-verified price, forward estimates, historical multiples and direct-bank peers support equity-direct valuation, with no core partial-data cap. [Valuation Data Triage — NU, §§3–6, 2026-08-31] |
| price-and-capital-structure | **Pool-verified anchor; value equity directly** | `NU · NYSE · USD` closed at US$14.30 on 2026-08-29; per-share work uses 4,908.841m diluted shares, and the EV bridge is informational for this lender. [Price & Capital Structure — NU, §§1–2, 7, 2026-08-31] |
| multiples-own-history | **Directional de-rating; no fair-value point** | NTM P/E is 14.8x versus a 19.4x seven-observation mean, but the 17-month history is too short for a reversion value. [Multiples — Own History — NU, §§2–6, 2026-08-31] |
| relative-valuation-peers | **Premium unjustified on available relative evidence** | Direct-bank median NTM P/E gives US$7.38 per share, with US$2.95–US$7.38 across P/TBV and P/E reads; NU’s growth supports some, not all, of its premium. [Relative Valuation — Peers — NU, §§3–7, 2026-08-31] |
| intrinsic-dcf | **US$5.55 residual-income value; Low confidence** | The valid equity-direct model spans US$4.40–US$6.94, but its 16.51% discount rate is CGU-specific and FY2026 earnings contain a US$991.0m deferred-tax benefit. [Intrinsic Equity Value — NU, §§3, 6–8, 2026-08-31] |
| reverse-dcf | **Aggressive expectations conditional on the discount rate** | US$14.30 requires 47.36% terminal ROE at 16.51%, but the same earnings path reconciles at a 9.78% cost of equity. [Reverse DCF — NU, §§2–5, 2026-08-31] |
| sum-of-the-parts | **Single-segment — SOTP collapses** | Banking is the sole reportable segment; US$7.38 is only a collapsed peer-P/E sanity check and receives no separate weight. [Sum-of-the-Parts — NU, §§1–5, 2026-08-31] |
| scenario-and-fair-value | **US$8.43 / US$6.47 / US$4.40; no valuation cushion** | Equal weighting of US$7.38 peer NTM P/E and US$5.55 residual income produces US$6.47, versus US$14.30 and 69.3% downside to bear. [Scenario & Fair Value — NU, §§1–6, 2026-08-31] |

## 3. Reconciliation

The full football field is **US$2.95–US$7.92**, a 168% low-to-high spread, so method dispersion is the first finding. The US$2.95 P/TBV low and US$7.92 named-bank P/E high share one peer set and are not independent confirmation; their gap reflects whether NU’s excess growth and returns persist. [Scenario & Fair Value — NU, §2, 2026-08-31] The two weighted primary points are narrower: US$5.55 residual income versus US$7.38 peer NTM P/E, a 33% spread. The US$6.47 base is their 50/50 blend, with peer NTM P/E the more observable market anchor and residual income the conservative intrinsic cross-check because its 16.51% cost of equity is CGU-specific. [Scenario & Fair Value — NU, §§1–2, 2026-08-31; Intrinsic Equity Value — NU, §3, 2026-08-31] Own-history contributes no value because the series covers only 17 months, while SOTP contributes no weight because Banking is the sole segment. [Multiples — Own History — NU, §4, 2026-08-31; Sum-of-the-Parts — NU, §5, 2026-08-31]

**Sector Cycle Reality Test roll-up:** `02` and `03` both report **Not assessable — no sector-level multiple history**. Neither fires `RF-VAL-001` nor `RF-VAL-002`, so there is no same-direction cycle flag or compounding cap. The missing sector history means the reference points are not proven stable; it does not itself trigger a score cap. [Multiples — Own History — NU, §5, 2026-08-31; Relative Valuation — Peers — NU, §6, 2026-08-31]

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N | MoS, downside-to-bear (Downside-risk score), observed up/down, attractiveness + confidence | None; US$14.30 is pool-verified as of 2026-08-29. |
| No consensus / forward estimates | N | Valuation confidence | None; FY2026/FY2027 estimates are present. |
| No peer data | N | Overall usefulness | None; direct Brazilian-bank peer data are present. |
| Only one valuation method usable | N | Valuation confidence | None; peer NTM P/E and residual income both produce values. |
| No cash flow AND DCF is only method | N | Valuation confidence | None; cash-flow data exist, and a financial-company residual-income model is used with a peer method. |
| SOTP not possible for multi-segment | N | Overall usefulness | None; NU has one reportable Banking segment, so SOTP correctly collapses. |
| Methods disagree >40% unreconciled | N | Valuation confidence | None; the 168% full field is reconciled, and the two weighted points differ by 33%. |
| Terminal value >75% of DCF EV | N | Valuation confidence | None; continuing value is 20.1% of residual-income equity value. [Intrinsic Equity Value — NU, §5, 2026-08-31] |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | N | Valuation attractiveness | None; the governance module explicitly finds RF-OWN-004 does not apply, although founder control remains a minority-rights risk. [Ownership & Insider Behavior — NU, §§3–4A, 2026-08-31; Management-Governance Synthesis — NU, §4, 2026-08-31] |
| Sector Cycle Reality Test flags `02` and/or `03` cycle-elevated/depressed, unreconciled | N | Valuation confidence | None; both checks are Not assessable and neither emits a cycle tag. |

No hard score cap applies. The 48/100 valuation-confidence score is a synthesis judgment reflecting method quality and dispersion, not a cap override.

## 5. Fair-Value Summary

The 12-month bull/base/bear levels are US$8.43/US$6.47/US$4.40, all expressed through a forward P/TBV framework; the US$6.47 base point reconciles the equal-weight US$7.38 peer NTM-P/E and US$5.55 residual-income values. [Scenario & Fair Value — NU, §§1–3, 2026-08-31] At US$14.30, the market requires a 47.36% terminal ROE at the modeled 16.51% cost of equity or an 80.89% FY2027–30 profit CAGR, neither proven by the two-year post-loss record; a 9.78% implied cost of equity is the key alternative explanation. [Reverse DCF — NU, §§2–5, 2026-08-31] Margin of safety—the discount of price to base fair value—is negative 121.2%, while downside to the US$4.40 bear value is 69.3%; these are separate measures. [Scenario & Fair Value — NU, §4, 2026-08-31] The stock may look low against its short own-history series at 14.8x NTM P/E versus a 19.4x mean, but seven observations over 17 months do not establish a normal multiple. [Multiples — Own History — NU, §§2–6, 2026-08-31] Credit cyclicality, a 52/100 business-quality score and only provisionally widening narrow moat make short-history reversion a value-trap risk; no structurally misaligned-owner flag applies. [Scenario & Fair Value — NU, §5, 2026-08-31; Management-Governance Synthesis — NU, §4, 2026-08-31]

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Materially overvalued — base fair value is 54.8% below price | A price fall toward or below US$6.47 without fair-value deterioration, or primary evidence that a group cost of equity near the 9.78% implied rate is warranted while NU sustains credit quality and returns high enough to support more than the 2.30x peer-high P/TBV. | Lower FY2027 tangible book than the US$3.6645 proxy, credit losses that push the warranted multiple to or below 1.20x P/TBV, or a higher share price without better earnings would widen the gap and pull value toward the US$4.40 bear level. | **Highest-value next request:** a defensible NU Group cost of equity—sourced beta, country-risk treatment and group scope—reconciled to the 16.51% Brazil-CGU hurdle and 9.78% market-implied rate. [Intrinsic Equity Value — NU, §3, 2026-08-31; Reverse DCF — NU, §2A, 2026-08-31] |

## 7. Note To The Final Synthesizer

- Use **US$8.43 / US$6.47 / US$4.40** as the 12-month bull/base/bear fair-value levels. Forward P/TBV defines the cases; the base point equally blends peer NTM P/E and residual income. [Scenario & Fair Value — NU, §§1–3, 2026-08-31]
- At US$14.30, the price implies 47.36% terminal ROE at a 16.51% cost of equity or 80.89% FY2027–30 net-income growth; those are not proven, but the same earnings path reconciles at a 9.78% rate. [Reverse DCF — NU, §§2–5, 2026-08-31]
- Margin of safety to the US$6.47 base is **negative 121.2%**; downside to the **US$4.40 bear** is **69.3%**. Do not merge the two measures. [Scenario & Fair Value — NU, §4, 2026-08-31]
- This is not proven value: NU’s 14.8x NTM P/E is below its 19.4x short-series mean, but the series has only seven points over 17 months, while credit-cycle and return durability remain unresolved. RF-OWN-004 did not fire. [Multiples — Own History — NU, §§2–6, 2026-08-31; Management-Governance Synthesis — NU, §4, 2026-08-31]
- Trust peer NTM P/E as the more observable market anchor and forward P/TBV for scenario construction; keep residual income as a conservative cross-check and give no independent weight to own-history reversion or collapsed SOTP. [Scenario & Fair Value — NU, §§1–3, 2026-08-31]
- No partial-data cap applies. Confidence remains mixed because the full football field spans US$2.95–US$7.92 and the group cost of equity is not proven. [Scenario & Fair Value — NU, §2, 2026-08-31]
- The single highest-value next data request is a sourced NU Group cost of equity that resolves the 16.51% CGU-rate versus 9.78% market-implied-rate conflict. [Intrinsic Equity Value — NU, §3A, 2026-08-31; Reverse DCF — NU, §2A, 2026-08-31]
- **Explicit handoff:** the master synthesizer’s “Valuation and Peer Mispricing” section should defer to this synthesis. These bull/base/bear fair-value **levels** are the inputs for the master’s probability-weighted scenario model; the master assigns probabilities, not this module.

## 8. Simple Summary

- NU is materially overvalued because US$6.47 base fair value is 54.8% below the US$14.30 price.
- The 12-month bull/base/bear values are US$8.43 / US$6.47 / US$4.40.
- At a 16.51% cost of equity, the market prices in 47.36% terminal ROE or 80.89% FY2027–30 profit growth; a 9.78% implied rate is the main alternative explanation.
- Margin of safety is negative 121.2%; downside to the US$4.40 bear is 69.3%.
- Forward P/TBV sets the cases; peer NTM P/E and residual income equally set the base.
- The low end of a 17-month own-multiple series is not a proven value anchor and creates reversion-based value-trap risk.
- A fresh, pool-verified US$14.30 price was available as of 2026-08-29; no price cap applies.
- The module is useful for the master, but the US$2.95–US$7.92 dispersion and unresolved group cost of equity keep confidence at 48/100.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — NU

## 1. File Inventory

Snapshot binding validated: 115 raw files; 48 workbooks with 109 tabs; manifest reports 0 extraction failures and no external-source rows. Parent rows include snapshot byte size. `2026-08-31*` is the shared filesystem snapshot mtime, not a source date; the Period Covered column uses the document/workbook content instead.

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| `data/NU/99The_Expectant_Father__th_Edition_.torrent` (26114 B) | Unrelated torrent | Not applicable | 2026-08-31* | Low |
| `data/NU/Charting Excel Export Aug-29-2026 2_02 PM.xls` (102400 B) | Capital IQ chart/pricing export | As-of 2026-08-29 (title/data) | 2026-08-31* | Medium |
| `data/NU/Company Comparable Analysis Nu Holdings Ltd .xls` (121350 B) | Capital IQ peer/comps export | As-of 2026-08-29 | 2026-08-31* | High |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_(Aug-13-2026).pdf` (26915636 B) | Q2 earnings presentation | Q2 2026 ended 2026-06-30 | 2026-08-31* | High |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_(Aug-19-2025).pdf` (76713 B) | Earnings presentation | Q2 2025 (per document date) | 2026-08-31* | Medium |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` (10078848 B) | Audited annual filing | FY2025 ended 2025-12-31 | 2026-08-31* | High |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_Form_Annual_Report(Feb-26-2026).pdf` (1384938 B) | Audited annual filing | FY2025 ended 2025-12-31 | 2026-08-31* | High |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` (1305646 B) | Reviewed interim filing | Q2/H1 2026 ended 2026-06-30 | 2026-08-31* | High |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf` (118289 B) | BDR availability notice | Q2 2026 availability notice | 2026-08-31* | Low |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_Form_Interim_Report(May-14-2026).pdf` (1268225 B) | Reviewed interim filing | Q1 2026 ended 2026-03-31 | 2026-08-31* | High |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_Form_Interim_Report(May-15-2026).pdf` (1268225 B) | Reviewed interim filing | Q1 2026 ended 2026-03-31 | 2026-08-31* | High |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_Form_Interim_Report(May-20-2026).pdf` (118126 B) | BDR availability notice | Q1 2026 availability notice | 2026-08-31* | Low |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_Form_Interim_Report(Nov-17-2025).pdf` (79363 B) | BDR availability notice | Q3 2025 availability notice | 2026-08-31* | Low |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf` (26900813 B) | Q2 earnings release/presentation | Q2 2026 ended 2026-06-30 | 2026-08-31* | High |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Feb-25-2026).pdf` (22751043 B) | Q4 earnings release | Q4/FY2025 ended 2025-12-31 | 2026-08-31* | Medium |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(May-14-2026).pdf` (2205975 B) | Q1 earnings release | Q1 2026 ended 2026-03-31 | 2026-08-31* | Medium |
| `data/NU/Filings 2/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Nov-13-2025).pdf` (20414889 B) | Q3 earnings release | Q3 2025 ended 2025-09-30 | 2026-08-31* | Medium |
| `data/NU/Filings/Nu_Holdings_Ltd_-_(Aug-13-2026).pdf` (26915636 B) | Q2 earnings presentation | Q2 2026 ended 2026-06-30 | 2026-08-31* | High |
| `data/NU/Filings/Nu_Holdings_Ltd_-_(Aug-19-2025).pdf` (76713 B) | Earnings presentation | Q2 2025 (per document date) | 2026-08-31* | Medium |
| `data/NU/Filings/Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` (10078848 B) | Audited annual filing | FY2025 ended 2025-12-31 | 2026-08-31* | High |
| `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Annual_Report(Feb-26-2026).pdf` (1384938 B) | Audited annual filing | FY2025 ended 2025-12-31 | 2026-08-31* | High |
| `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` (1305646 B) | Reviewed interim filing | Q2/H1 2026 ended 2026-06-30 | 2026-08-31* | High |
| `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-20-2026).pdf` (118289 B) | BDR availability notice | Q2 2026 availability notice | 2026-08-31* | Low |
| `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(May-14-2026).pdf` (1268225 B) | Reviewed interim filing | Q1 2026 ended 2026-03-31 | 2026-08-31* | High |
| `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(May-15-2026).pdf` (1268225 B) | Reviewed interim filing | Q1 2026 ended 2026-03-31 | 2026-08-31* | High |
| `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(May-20-2026).pdf` (118126 B) | BDR availability notice | Q1 2026 availability notice | 2026-08-31* | Low |
| `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Nov-17-2025).pdf` (79363 B) | BDR availability notice | Q3 2025 availability notice | 2026-08-31* | Low |
| `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Aug-13-2026).pdf` (26900813 B) | Q2 earnings release/presentation | Q2 2026 ended 2026-06-30 | 2026-08-31* | High |
| `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Feb-25-2026).pdf` (22751043 B) | Q4 earnings release | Q4/FY2025 ended 2025-12-31 | 2026-08-31* | Medium |
| `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(May-14-2026).pdf` (2205975 B) | Q1 earnings release | Q1 2026 ended 2026-03-31 | 2026-08-31* | Medium |
| `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Preliminary_Interim_Report(Nov-13-2025).pdf` (20414889 B) | Q3 earnings release | Q3 2025 ended 2025-09-30 | 2026-08-31* | Medium |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` (1423442 B) | IBKR tax report | FY2025-26 | 2026-08-31* | Low |
| `data/NU/Interactive_Brokers_FY2025-26_CA_Audit_Note.txt` (3863 B) | User tax-audit note | FY2025-26 | 2026-08-31* | Low |
| `data/NU/NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` (1012101 B) | User research memo | As-of 2026-08-30 | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Analyst Coverage (1).xls` (36864 B) | Capital IQ analyst coverage | Current FY2026; export header has no as-of | 2026-08-31* | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Analyst Coverage.xls` (36864 B) | Capital IQ analyst coverage | Current FY2026; export header has no as-of | 2026-08-31* | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Auditors.xls` (31744 B) | Capital IQ governance reference | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Board Members.xls` (84992 B) | Capital IQ governance reference | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Committees.xls` (39936 B) | Capital IQ governance reference | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Comparable M A Transactions (1).xls` (30720 B) | Capital IQ M&A comparables | Export header has no as-of | 2026-08-31* | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Comparable M A Transactions.xls` (30720 B) | Capital IQ M&A comparables | Export header has no as-of | 2026-08-31* | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Competitors.xls` (115200 B) | Capital IQ peer list | Export header has no as-of | 2026-08-31* | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Corporate Timeline.xls` (45568 B) | Capital IQ reference data | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Customers.xls` (36864 B) | Capital IQ reference data | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Equity Listings.rtf` (132690 B) | Capital IQ listing data | Export header has no as-of | 2026-08-31* | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Equity Listings.xls` (38400 B) | Capital IQ listing data | Export header has no as-of | 2026-08-31* | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Events Calendar.xls` (32256 B) | Capital IQ event calendar | Forward events; export header has no as-of | 2026-08-31* | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Balance Sheet.xls` (43018 B) | Capital IQ balance sheet | FY2021–FY2025; latest 2026-06-30 | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Capital Structure Details.xls` (36362 B) | Capital IQ capital structure | FY2021–FY2025; latest 2026-06-30 | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Capital Structure Summary.xls` (38922 B) | Capital IQ capital structure | FY2021–FY2025; latest 2026-06-30 | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Cash Flow.xls` (40458 B) | Capital IQ cash flow | FY2021–FY2025; LTM ended 2026-06-30 | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Historical Capitalization.xls` (37898 B) | Capital IQ historical capitalization | FY2021–FY2025; latest 2026-06-30 | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Income Statement.xls` (43530 B) | Capital IQ income statement | FY2021–FY2025; LTM ended 2026-06-30 | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Industry Specific.xls` (39434 B) | Capital IQ financial data | FY2021–FY2025; latest 2026-06-30 where available | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Key Stats.xls` (53258 B) | Capital IQ financial data | FY2021–FY2025; latest 2026-06-30 where available | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Multiples (1).xls` (43530 B) | Capital IQ historical multiples | Quarterly to 2026-08-28 | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Multiples.xls` (43018 B) | Capital IQ historical multiples | Quarterly to 2026-08-28 | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Ratios.xls` (51722 B) | Capital IQ financial ratios | FY2021–FY2025; latest 2026-06-30 | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Segments (1).xls` (41994 B) | Capital IQ segment data | FY2020–FY2025 | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Segments.xls` (41994 B) | Capital IQ segment data | FY2020–FY2025 | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Supplemental.xls` (37386 B) | Capital IQ financial data | FY2021–FY2025; latest 2026-06-30 where available | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` (204810 B) | Capital IQ financial data | FY2021–FY2025; latest 2026-06-30 where available | 2026-08-31* | High |
| `data/NU/Nu Holdings Ltd NYSE NU Fixed Income S P Global Ratings.xls` (40960 B) | Capital IQ ratings export | Export header has no as-of | 2026-08-31* | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Fixed Income Securities Summary.xls` (862720 B) | Capital IQ debt securities | Export header has no as-of | 2026-08-31* | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Industry Classifications.rtf` (73308 B) | Capital IQ reference data | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Investment Analysis Co Investors.xls` (37376 B) | Capital IQ reference data | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Investment Analysis Direct Investments.xls` (53248 B) | Capital IQ reference data | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Key Developments.rtf` (165601 B) | Capital IQ reference data | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Long Business Description.rtf` (103753 B) | Capital IQ reference data | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Private Ownership.rtf` (126348 B) | Capital IQ ownership data | Latest dated holdings 2026-06-30 where applicable | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Products.xls` (36352 B) | Capital IQ reference data | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Professionals.xls` (61952 B) | Capital IQ reference data | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Public Company Profile.rtf` (248705 B) | Capital IQ reference data | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Public Ownership Crossholdings.xls` (255488 B) | Capital IQ ownership data | Latest dated holdings 2026-06-30 where applicable | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Public Ownership Detailed.xls` (368640 B) | Capital IQ ownership data | Latest dated holdings 2026-06-30 where applicable | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Public Ownership History.xls` (191488 B) | Capital IQ ownership data | Latest dated holdings 2026-06-30 where applicable | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Public Ownership Insider Trading.xls` (37376 B) | Capital IQ ownership data | Latest dated holdings 2026-06-30 where applicable | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Public Ownership Summary.rtf` (311765 B) | Capital IQ ownership data | Latest dated holdings 2026-06-30 where applicable | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Strategic Alliances.xls` (49152 B) | Capital IQ reference data | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Suppliers.xls` (48640 B) | Capital IQ reference data | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Takeover Defenses.xls` (61952 B) | Capital IQ governance reference | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls` (40960 B) | Capital IQ reference data | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Nu Holdings Ltd. Form 20-F filed on Apr-08-2026.pdf` (172472 B) | Audited annual filing | FY2025 ended 2025-12-31 | 2026-08-31* | High |
| `data/NU/NuHoldingsLtdNYSENUEstimatesReport.xls` (4295928 B) | Capital IQ consensus/estimates export | Current FY2026; header does not print an as-of | 2026-08-31* | High |
| `data/NU/Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).doc` (8788731 B) | Audited annual filing | FY2025 ended 2025-12-31 | 2026-08-31* | High |
| `data/NU/Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` (10078782 B) | Audited annual filing | FY2025 ended 2025-12-31 | 2026-08-31* | High |
| `data/NU/Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).doc` (14381260 B) | Audited annual filing | FY2024 ended 2024-12-31 | 2026-08-31* | Medium |
| `data/NU/Nu_Holdings_Ltd_-_Form_20-F(Apr-16-2025).pdf` (23263226 B) | Audited annual filing | FY2024 ended 2024-12-31 | 2026-08-31* | Medium |
| `data/NU/Nu_Holdings_Ltd_-_Form_20-F(Apr-19-2024).pdf` (17864859 B) | Audited annual filing | FY2023 ended 2023-12-31 | 2026-08-31* | Medium |
| `data/NU/Nu_Holdings_Ltd_-_Form_20-F(Apr-20-2023).pdf` (8095693 B) | Audited annual filing | FY2022 ended 2022-12-31 | 2026-08-31* | Low |
| `data/NU/Nu_Holdings_Ltd_-_Form_20-F(Apr-21-2022).pdf` (9612276 B) | Audited annual filing | FY2021 ended 2021-12-31 | 2026-08-31* | Low |
| `data/NU/Transaction Summary M A Private Placements.xls` (36864 B) | Capital IQ transaction export | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Transaction Summary Public Offerings.xls` (34304 B) | Capital IQ transaction export | Export header has no as-of | 2026-08-31* | Low |
| `data/NU/Transcript Digest/Nu Holdings Ltd. - ShareholderAnalyst Call.pdf` (98560 B) | Shareholder/analyst call transcript | Document date not parsed | 2026-08-31* | Low |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q1 2022 Earnings Call, May 16, 2022.pdf` (363491 B) | Earnings transcript | Nu Holdings Ltd., Q1 2022 Earnings Call, May 16, 2022 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q1 2023 Earnings Call, May 15, 2023.pdf` (474229 B) | Earnings transcript | Nu Holdings Ltd., Q1 2023 Earnings Call, May 15, 2023 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q1 2024 Earnings Call, May 14, 2024.pdf` (399783 B) | Earnings transcript | Nu Holdings Ltd., Q1 2024 Earnings Call, May 14, 2024 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q1 2025 Earnings Call, May 13, 2025.pdf` (385397 B) | Earnings transcript | Nu Holdings Ltd., Q1 2025 Earnings Call, May 13, 2025 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q1 2026 Earnings Call, May 14, 2026.pdf` (403073 B) | Earnings transcript | Nu Holdings Ltd., Q1 2026 Earnings Call, May 14, 2026 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q2 2022 Earnings Call, Aug 15, 2022.pdf` (390889 B) | Earnings transcript | Nu Holdings Ltd., Q2 2022 Earnings Call, Aug 15, 2022 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q2 2023 Earnings Call, Aug 15, 2023.pdf` (418503 B) | Earnings transcript | Nu Holdings Ltd., Q2 2023 Earnings Call, Aug 15, 2023 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q2 2024 Earnings Call, Aug 13, 2024.pdf` (388744 B) | Earnings transcript | Nu Holdings Ltd., Q2 2024 Earnings Call, Aug 13, 2024 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q2 2025 Earnings Call, Aug 14, 2025.pdf` (387734 B) | Earnings transcript | Nu Holdings Ltd., Q2 2025 Earnings Call, Aug 14, 2025 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q2 2026 Earnings Call, Aug 13, 2026.pdf` (407887 B) | Earnings transcript | Nu Holdings Ltd., Q2 2026 Earnings Call, Aug 13, 2026 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q3 2022 Earnings Call, Nov 14, 2022.pdf` (389225 B) | Earnings transcript | Nu Holdings Ltd., Q3 2022 Earnings Call, Nov 14, 2022 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q3 2023 Earnings Call, Nov 14, 2023.pdf` (409673 B) | Earnings transcript | Nu Holdings Ltd., Q3 2023 Earnings Call, Nov 14, 2023 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q3 2024 Earnings Call, Nov 13, 2024.pdf` (387355 B) | Earnings transcript | Nu Holdings Ltd., Q3 2024 Earnings Call, Nov 13, 2024 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q3 2025 Earnings Call, Nov 13, 2025.pdf` (391462 B) | Earnings transcript | Nu Holdings Ltd., Q3 2025 Earnings Call, Nov 13, 2025 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q4 2021 Earnings Call, Feb 22, 2022.pdf` (348045 B) | Earnings transcript | Nu Holdings Ltd., Q4 2021 Earnings Call, Feb 22, 2022 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q4 2022 Earnings Call, Feb 14, 2023.pdf` (406365 B) | Earnings transcript | Nu Holdings Ltd., Q4 2022 Earnings Call, Feb 14, 2023 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q4 2023 Earnings Call, Feb 22, 2024.pdf` (398620 B) | Earnings transcript | Nu Holdings Ltd., Q4 2023 Earnings Call, Feb 22, 2024 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q4 2024 Earnings Call, Feb 20, 2025.pdf` (435352 B) | Earnings transcript | Nu Holdings Ltd., Q4 2024 Earnings Call, Feb 20, 2025 | 2026-08-31* | Medium |
| `data/NU/Transcript Digest/Nu Holdings Ltd., Q4 2025 Earnings Call, Feb 25, 2026.pdf` (398604 B) | Earnings transcript | Nu Holdings Ltd., Q4 2025 Earnings Call, Feb 25, 2026 | 2026-08-31* | Medium |
| `data/NU/U21257060_20260331_20260331.pdf` (70516 B) | Other PDF | 2026-03-31 (filename; document period not used) | 2026-08-31* | Low |
| `data/NU/consolidated_tax_report_2025-26.xlsx` (151589 B) | IBKR tax report | FY2025-26 | 2026-08-31* | Low |
| `data/NU/WORKBOOK-TAB INVENTORY` | The 109 rows below are the manifest-tab extracts; each tab is an independent inventory row. | Period inherits the parent document listed above. | n/a | Per parent |
| `data/NU/Charting Excel Export Aug-29-2026 2_02 PM.xls` — `Chart 1 with Data` (284x2) | Capital IQ chart/pricing export workbook tab | As-of 2026-08-29 (title/data) | n/a | Medium |
| `data/NU/Charting Excel Export Aug-29-2026 2_02 PM.xls` — `Attributions` (45x1) | Capital IQ chart/pricing export workbook tab | As-of 2026-08-29 (title/data) | n/a | Medium |
| `data/NU/Company Comparable Analysis Nu Holdings Ltd .xls` — `Financial Data` (50x17) | Capital IQ peer/comps export workbook tab | As-of 2026-08-29 | n/a | High |
| `data/NU/Company Comparable Analysis Nu Holdings Ltd .xls` — `Trading Multiples` (50x9) | Capital IQ peer/comps export workbook tab | As-of 2026-08-29 | n/a | High |
| `data/NU/Company Comparable Analysis Nu Holdings Ltd .xls` — `Operating Statistics` (50x13) | Capital IQ peer/comps export workbook tab | As-of 2026-08-29 | n/a | High |
| `data/NU/Company Comparable Analysis Nu Holdings Ltd .xls` — `Business Description` (44x3) | Capital IQ peer/comps export workbook tab | As-of 2026-08-29 | n/a | High |
| `data/NU/Company Comparable Analysis Nu Holdings Ltd .xls` — `Implied Valuation` (69x9) | Capital IQ peer/comps export workbook tab | As-of 2026-08-29 | n/a | High |
| `data/NU/Company Comparable Analysis Nu Holdings Ltd .xls` — `Valuation Chart` (32x2) | Capital IQ peer/comps export workbook tab | As-of 2026-08-29 | n/a | High |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `IBKR - Tax Summary` (24x8) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `IBKR - Consolidated Events` (37x17) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `IBKR - Capital Gains Detail` (6x25) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `IBKR - Income and Taxes` (35x15) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `IBKR - Closing Holdings` (4x17) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `IBKR - Performance Summary` (4x15) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `IBKR - Cash Report` (4x5) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `IBKR - SBI FX Rates` (5x10) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `Audit & Reconciliation` (24x8) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `Source Statement Tables` (1037x27) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `IBKR - Unmapped Numeric Rows` (1136x8) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `IBKR - Source Totals` (60x7) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `Source Statement Text` (2122x4) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `README - IBKR Report` (12x2) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `LTCG` (146x18) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `STCG` (163x20) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `F&O` (51x10) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `Intraday` (46x12) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `Dividend` (68x10) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `Interest` (19x5) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `Bonds & SGB` (25x12) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `Schedule FA` (41x13) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `Schedule FSI` (33x10) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `Form 67` (27x13) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Interactive_Brokers_Consolidated_Tax_Report_FY2025-26.xlsx` — `Schedule TR` (28x8) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Analyst Coverage (1).xls` — `Analyst Coverage` (41x6) | Capital IQ analyst coverage workbook tab | Current FY2026; export header has no as-of | n/a | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Analyst Coverage.xls` — `Analyst Coverage` (41x6) | Capital IQ analyst coverage workbook tab | Current FY2026; export header has no as-of | n/a | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Auditors.xls` — `Auditors` (18x5) | Capital IQ governance reference workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Board Members.xls` — `Board Members` (28x25) | Capital IQ governance reference workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Committees.xls` — `Committees` (35x2) | Capital IQ governance reference workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Comparable M A Transactions (1).xls` — `Comparable M A Transactions` (17x9) | Capital IQ M&A comparables workbook tab | Export header has no as-of | n/a | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Comparable M A Transactions.xls` — `Comparable M A Transactions` (17x9) | Capital IQ M&A comparables workbook tab | Export header has no as-of | n/a | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Competitors.xls` — `Competitors` (89x8) | Capital IQ peer list workbook tab | Export header has no as-of | n/a | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Corporate Timeline.xls` — `Corporate Timeline` (51x4) | Capital IQ reference data workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Customers.xls` — `Customers` (16x8) | Capital IQ reference data workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Equity Listings.xls` — `Equity Listings` (25x11) | Capital IQ listing data workbook tab | Export header has no as-of | n/a | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Events Calendar.xls` — `Events Calendar` (27x3) | Capital IQ event calendar workbook tab | Forward events; export header has no as-of | n/a | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Balance Sheet.xls` — `Balance Sheet` (89x7) | Capital IQ balance sheet workbook tab | FY2021–FY2025; latest 2026-06-30 | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Capital Structure Details.xls` — `Capital Structure Details` (29x10) | Capital IQ capital structure workbook tab | FY2021–FY2025; latest 2026-06-30 | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Capital Structure Summary.xls` — `Capital Structure Summary` (60x7) | Capital IQ capital structure workbook tab | FY2021–FY2025; latest 2026-06-30 | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Cash Flow.xls` — `Cash Flow` (72x7) | Capital IQ cash flow workbook tab | FY2021–FY2025; LTM ended 2026-06-30 | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Historical Capitalization.xls` — `Historical Capitalization` (38x7) | Capital IQ historical capitalization workbook tab | FY2021–FY2025; latest 2026-06-30 | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Income Statement.xls` — `Income Statement` (94x7) | Capital IQ income statement workbook tab | FY2021–FY2025; LTM ended 2026-06-30 | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Industry Specific.xls` — `Industry Specific` (68x7) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Key Stats.xls` — `Key Stats` (80x9) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Multiples (1).xls` — `Multiples` (61x9) | Capital IQ historical multiples workbook tab | Quarterly to 2026-08-28 | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Multiples.xls` — `Multiples` (60x9) | Capital IQ historical multiples workbook tab | Quarterly to 2026-08-28 | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Ratios.xls` — `Ratios` (149x7) | Capital IQ financial ratios workbook tab | FY2021–FY2025; latest 2026-06-30 | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Segments (1).xls` — `Segments` (77x7) | Capital IQ segment data workbook tab | FY2020–FY2025 | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Segments.xls` — `Segments` (77x7) | Capital IQ segment data workbook tab | FY2020–FY2025 | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials Supplemental.xls` — `Supplemental` (50x7) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — `Key Stats` (85x9) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — `Income Statement` (94x7) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — `Balance Sheet` (89x7) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — `Cash Flow` (72x7) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — `Multiples` (61x9) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — `Historical Capitalization` (38x7) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — `Capital Structure Summary` (60x7) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — `Capital Structure Details` (33x10) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — `Ratios` (149x7) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — `Supplemental` (50x7) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — `Industry Specific` (68x7) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — `Pension OPEB` (15x6) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — `Segments` (77x7) | Capital IQ financial data workbook tab | FY2021–FY2025; latest 2026-06-30 where available | n/a | High |
| `data/NU/Nu Holdings Ltd NYSE NU Fixed Income S P Global Ratings.xls` — `S P Global Ratings` (20x8) | Capital IQ ratings export workbook tab | Export header has no as-of | n/a | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Fixed Income Securities Summary.xls` — `Securities Summary` (2299x24) | Capital IQ debt securities workbook tab | Export header has no as-of | n/a | Medium |
| `data/NU/Nu Holdings Ltd NYSE NU Investment Analysis Co Investors.xls` — `Co-Investors` (53x3) | Capital IQ reference data workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Investment Analysis Direct Investments.xls` — `Direct Investments` (55x21) | Capital IQ reference data workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Products.xls` — `Products` (31x5) | Capital IQ reference data workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Professionals.xls` — `Professionals` (29x24) | Capital IQ reference data workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Public Ownership Crossholdings.xls` — `Crossholdings` (1840x7) | Capital IQ ownership data workbook tab | Latest dated holdings 2026-06-30 where applicable | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Public Ownership Detailed.xls` — `Detailed` (1346x15) | Capital IQ ownership data workbook tab | Latest dated holdings 2026-06-30 where applicable | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Public Ownership History.xls` — `History` (1499x5) | Capital IQ ownership data workbook tab | Latest dated holdings 2026-06-30 where applicable | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Public Ownership Insider Trading.xls` — `Insider Trading` (46x11) | Capital IQ ownership data workbook tab | Latest dated holdings 2026-06-30 where applicable | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Strategic Alliances.xls` — `Strategic Alliances` (25x7) | Capital IQ reference data workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Suppliers.xls` — `Suppliers` (25x8) | Capital IQ reference data workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Takeover Defenses.xls` — `Corporate Governance` (48x4) | Capital IQ governance reference workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Takeover Defenses.xls` — `Takeover Defenses` (26x4) | Capital IQ governance reference workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd NYSE NU Takeover Defenses.xls` — `Compare Defenses` (36x8) | Capital IQ governance reference workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls` — `Nu Holdings Ltd NYSENU Corpor` (53x17) | Capital IQ reference data workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls` — `Filtered Count` (22x4) | Capital IQ reference data workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Nu Holdings Ltd. (NYSE_NU) Corporate Structure Tree.xls` — `Aggregates` (22x4) | Capital IQ reference data workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/NuHoldingsLtdNYSENUEstimatesReport.xls` — `Consensus` (397x30) | Capital IQ consensus/estimates export workbook tab | Current FY2026; header does not print an as-of | n/a | High |
| `data/NU/NuHoldingsLtdNYSENUEstimatesReport.xls` — `Recent Changes` (265x10) | Capital IQ consensus/estimates export workbook tab | Current FY2026; header does not print an as-of | n/a | High |
| `data/NU/NuHoldingsLtdNYSENUEstimatesReport.xls` — `Multiples` (26x5) | Capital IQ consensus/estimates export workbook tab | Current FY2026; header does not print an as-of | n/a | High |
| `data/NU/NuHoldingsLtdNYSENUEstimatesReport.xls` — `Surprise` (200x20) | Capital IQ consensus/estimates export workbook tab | Current FY2026; header does not print an as-of | n/a | High |
| `data/NU/NuHoldingsLtdNYSENUEstimatesReport.xls` — `Trends` (238x21) | Capital IQ consensus/estimates export workbook tab | Current FY2026; header does not print an as-of | n/a | High |
| `data/NU/NuHoldingsLtdNYSENUEstimatesReport.xls` — `Revisions` (357x17) | Capital IQ consensus/estimates export workbook tab | Current FY2026; header does not print an as-of | n/a | High |
| `data/NU/Transaction Summary M A Private Placements.xls` — `M A Private Placements` (25x14) | Capital IQ transaction export workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/Transaction Summary Public Offerings.xls` — `Public Offerings` (15x8) | Capital IQ transaction export workbook tab | Export header has no as-of | n/a | Low |
| `data/NU/consolidated_tax_report_2025-26.xlsx` — `LTCG` (146x18) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/consolidated_tax_report_2025-26.xlsx` — `STCG` (163x20) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/consolidated_tax_report_2025-26.xlsx` — `F&O` (51x10) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/consolidated_tax_report_2025-26.xlsx` — `Intraday` (46x12) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/consolidated_tax_report_2025-26.xlsx` — `Dividend` (68x10) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/consolidated_tax_report_2025-26.xlsx` — `Interest` (19x5) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/consolidated_tax_report_2025-26.xlsx` — `Bonds & SGB` (25x12) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/consolidated_tax_report_2025-26.xlsx` — `Schedule FA` (41x13) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/consolidated_tax_report_2025-26.xlsx` — `Schedule FSI` (33x10) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/consolidated_tax_report_2025-26.xlsx` — `Form 67` (27x13) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |
| `data/NU/consolidated_tax_report_2025-26.xlsx` — `Schedule TR` (28x8) | IBKR tax report workbook tab | FY2025-26 | n/a | Low |

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | Cayman Islands issuer; NYSE ordinary shares, ticker NU | [FY25 Form 20-F, cover; description of shares] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC foreign private issuer — Form 20-F annual filing; interim IFRS financial statements | [FY25 Form 20-F, cover; Q2 2026 Interim Financial Statements, cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | IFRS Accounting Standards | [FY25 Form 20-F, “Presentation Currency”; Q2 2026 Interim Financial Statements, basis of preparation] |
| Reporting currency (and scale, e.g. INR crore) | USD; financial statements and CIQ financial exports in USD millions | [FY25 Form 20-F, “Presentation Currency”; Capital IQ Financials, Balance Sheet header] |
| Fiscal-year end | 31 December | [FY25 Form 20-F, cover] |
| Document language(s) | English primary; one Portuguese BDR availability notice. No language-related gap. | [FY25 Form 20-F, cover; Form Interim Report, 2026-08-20] |

NU is a financial-services issuer, not an operating-company DCF case: the CIQ financials use the Bank template and report one Banking business segment. Downstream work should value equity directly with P/E, P/TBV and, if modelled, residual-income/DDM methods rather than EV/EBITDA or FCFF. [Capital IQ Financials, Segments; Valuation MODULE_RULES, Business-Type Method Map]

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | `data/NU/Nu_Holdings_Ltd_-_Form_20-F(Apr-08-2026).pdf` | FY2025 ended 2025-12-31; filed 2026-04-08 | 4.8 |
| Quarterly filing | `data/NU/Filings/Nu_Holdings_Ltd_-_Form_Interim_Report(Aug-14-2026).pdf` | Three and six months ended 2026-06-30 | 2.0 |
| Capital structure / balance sheet | `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — Balance Sheet tab | Latest balance sheet 2026-06-30 | 2.0 |
| Consensus / estimate export | `data/NU/NuHoldingsLtdNYSENUEstimatesReport.xls` — Consensus tab | Current FY end 2026-12-31; source header does not print an as-of date | Not assessable |
| Multiples export | `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — Multiples tab | Quarterly pricing/multiples through 2026-08-28 | 0.1 |
| Peer / comps export | `data/NU/Company Comparable Analysis Nu Holdings Ltd .xls` — Financial Data / Trading Multiples | As-of 2026-08-29 | 0.1 |
| Current price (IBKR / Capital IQ) | `data/NU/Company Comparable Analysis Nu Holdings Ltd .xls` — Financial Data | USD 14.30 as-of 2026-08-29 | 0.1 |
| Cash flow statement | `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — Cash Flow | LTM ended 2026-06-30 | 2.0 |
| Segment data | `data/NU/Nu Holdings Ltd NYSE NU Financials.xls` — Segments | FY2025; one Banking segment | 8.0 |

The deterministic CIQ facts sidecar reconciles the critical workbook reads: current price USD 14.30 and shares outstanding 4,830.7m, both as-of 2026-08-29; it also reports total debt USD 5,896.7m and net debt of negative USD 9,274.2m on a vendor basis that may include liquid investments. The later EV/equity bridge must rebuild strict net debt from the filing balance sheet rather than use that broad vendor net-debt number as an unlabeled figure. [Capital IQ Comps → Financial Data, subject row, as-of 2026-08-29; CIQ Financials → Balance Sheet “Total Debt” and “Net Debt” [2026-06-30]]

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y — pool-verified | USD 14.30, CIQ Comps Financial Data subject row, as-of 2026-08-29 | Anchor for the named NYSE:NU line; fresh within five trading days. |
| Diluted share count | Y — weighted-average diluted shares | Q2 2026 interim filing, Note 9: 4,904.837m diluted shares for Q2; 4,908.841m for H1 | Needed for per-share fair value. |
| Dilution data (options/RSUs/convertibles) | Y | FY25 Form 20-F, equity incentive plan: options and RSUs disclosed; Q2 2026 interim filing, treasury shares/repurchase note | Needed for a fully diluted per-share bridge. |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y — Financial | CIQ Financials uses Bank template; FY2025 Segments reports Banking as the sole business segment | Determines valid equity-based valuation methods. |
| Total debt, cash, minority/preferred | Y | Capital IQ Financials Balance Sheet, 2026-06-30; Q2 2026 interim statement of financial position | Needed for capital-structure analysis; EV is informational for a financial issuer. |
| Income statement (LTM or FY) | Y | Q2 2026 reviewed interim statements; CIQ Financials Income Statement LTM ended 2026-06-30 | Earnings base for P/E and residual-income/DDM inputs. |
| Cash flow statement | Y | Q2 2026 reviewed interim cash-flow statement; CIQ Financials Cash Flow LTM ended 2026-06-30 | Cash-flow quality check; not an FCFF valuation base for this financial issuer. |
| Forward estimates (consensus) | Y | CIQ Estimates Consensus, current FY2026 and FY2027 GAAP EPS/book value/revenue rows | Forward P/E, P/B and residual-income/DDM inputs. |
| Historical multiple data | Y | CIQ Financials Multiples, quarterly data through 2026-08-28 | Own-history P/E/P-B/P-TBV read. |
| Peer / comps data | Y | CIQ Quick Comparable Analysis, as-of 2026-08-29 | Relative P/E/P-TBV read. |
| Segment-level revenue & EBIT | Y — limited | CIQ Financials Segments, Banking is the sole business segment; financial-sector income measures rather than EBIT | Confirms SOTP collapses to consolidated equity read. |
| Dividend / buyback data | Y | Q2 2026 interim filing, Note 31: USD 1.0bn repurchase authorization; CIQ Estimates Consensus DPS rows | Shareholder-yield and capital-return read. |

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
| No current price | N | 01, 05, 07, 99 | None — pool-verified USD 14.30 as-of 2026-08-29. |
| No consensus / forward estimates | N | 02, 03, 04, 05 | None — FY2026 and FY2027 EPS/book-value estimates are present. |
| No peer data | N | 03, 06 | None — CIQ peer set and P/E/P-TBV data are present. |
| No segment-level data | N | 06 | None; one Banking segment makes SOTP non-applicable rather than data-missing. |
| No balance sheet / capital structure | N | 01, 04, 06 | None — reviewed Q2 balance sheet and CIQ capital-structure sheets are present. |
| No cash flow statement | N | 04 | None — reviewed Q2 cash-flow statement is present. |

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Use financial-sector P/E, P/B and P/TBV history; do not use EV/EBITDA. |
| Peer relative valuation | Y | None | CIQ peer set has NTM P/E and P/TBV; assess peer economic comparability downstream. |
| Intrinsic DCF (Operating FCFF) | N | Not a missing-data result — invalid business-method match | NU is a financial issuer; use residual-income/DDM if an intrinsic equity method is built. |
| Reverse DCF | N | Operating FCFF reverse-DCF is not valid for a financial issuer | A reverse residual-income/DDM formulation is outside this operating-DCF method slot. |
| SOTP | N | Not a missing-data result — only one Banking business segment | SOTP collapses to the consolidated equity valuation. |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** Reviewed Q2 2026 financial statements and FY2025 audited IFRS filings provide an earnings, balance-sheet and cash-flow base; pool-verified price, historical P/E/P-TBV data, forward estimates and a peer set support two financial-sector relative valuation methods.
- **Methods that can run:** own-history multiples; peer relative valuation.
- **Active partial-data caps:** None.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — NU

All dollar amounts are US$ millions unless stated otherwise. Nu reports under IFRS Accounting Standards in U.S. dollars and has a 31 December fiscal year. It is a financial institution, so this EV bridge is an informational reconciliation, not an intrinsic-value method; later valuation work should value equity directly (for example, using price-to-book and residual income). [FY2025 Form 20-F, cover page; Business Identity — NU, §3]

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| **Decision line** (ticker · venue · currency) | **NU · NYSE · USD** | [FY2025 Form 20-F, cover page] | 2026-08-29 |
| Current price | **US$14.30** | [Capital IQ Comps → Financial Data, subject row; `ciq_facts.json` `current_price`, authoritative workbook read] | 2026-08-29 |
| Currency | USD | [Capital IQ Comps → Financial Data, header] | 2026-08-29 |
| Price basis (last close / intraday / indicative) | Last close | [Capital IQ Comps → Financial Data, subject row] | 2026-08-29 |

The decision line is Class A ordinary shares on the NYSE. It is the registered primary line and the most liquid disclosed venue (76.82m three-month average daily shares versus 7.11m for the next-largest listed line). All downstream per-share values refer to this line in USD. Class B shares are not separately listed; they have otherwise identical economic rights, convert one-for-one to Class A, but have 20 votes per share versus one for Class A. [FY2025 Form 20-F, Item 10.B; Capital IQ Equity Listings, 2026-08-28]

Capital IQ's detailed listing export labels the NYSE close as 2026-08-28, while the comparable-analysis export is explicitly as of 2026-08-29 and reports the same US$14.30. I use the latter as the price date, as required by the deterministic sidecar. The age is two calendar days, about 1.4 trading days, and therefore below the five-trading-day refresh threshold. No refresh was needed. [Capital IQ Comps → Financial Data, as of 2026-08-29; Capital IQ Equity Listings, trade date 2026-08-28]

| Listed line | Ticker · venue | Currency | Price | As-of | Premium / (discount) vs decision line, same-currency | Notes for a holder of this line |
|---|---|---:|---:|---|---:|---|
| Class A ordinary share | NU · NYSE | USD | 14.30 | 2026-08-29 | 0.0% | **Decision line.** |
| BDR, 6 BDR = 1 ordinary share | ROXO34 · BOVESPA | BRL | 12.33 per BDR | 2026-08-28 | 0.0% mechanically | The price implies BRL 5.1734/US$ from `(12.33 × 6) ÷ 14.30`. This is a price-implied conversion, not an independently sourced FX quote, so it does not establish a tradable premium. |
| CEDEAR, 2 CEDEAR = 1 ordinary share | NU · Buenos Aires | ARS | 11,500 per CEDEAR | 2026-08-28 | 0.0% mechanically | The price implies ARS 1,608.39/US$ from `(11,500 × 2) ÷ 14.30`; it is a price-implied conversion only. |
| Class A ordinary share | NUCO · BVC | COP | 46,200 | 2026-08-28 | 0.0% mechanically | The price implies COP 3,230.77/US$ from `46,200 ÷ 14.30`; it is a price-implied conversion only. |
| CEDEAR, 2 CEDEAR = 1 ordinary share | NUD · Buenos Aires | USD | 7.51 per CEDEAR | 2026-08-28 | **+5.0%** | Two CEDEAR equal US$15.02 per ordinary share: `(7.51 × 2 ÷ 14.30) − 1 = 5.0%`. This USD gap is a real cross-line observation, though liquidity is far lower than NYSE. |
| Class A ordinary share | NU N · BMV | MXN | 243.68 | 2026-08-28 | 0.0% mechanically | The price implies MXN 17.0406/US$ from `243.68 ÷ 14.30`; it is a price-implied conversion only. |
| Class A ordinary share | 1NUH · Borsa Italiana | EUR | 12.45 | 2026-08-28 | 0.0% mechanically | The price implies EUR 0.8706/US$ from `12.45 ÷ 14.30`; it is a price-implied conversion only. |
| Class A ordinary share | M1Z · Deutsche Börse | EUR | 12.32 | 2026-08-28 | 0.0% mechanically | The price implies EUR 0.8615/US$ from `12.32 ÷ 14.30`; it is a price-implied conversion only. |
| Class A ordinary share | M1Z · Börse München | EUR | 12.79 | 2026-08-27 | Not independently assessable | This close is one extra day older than the other cross-lines. The implied EUR 0.8944/US$ mapping from `12.79 ÷ 14.30` is not a matched-date FX comparison. |

The non-USD comparisons use each line's stated ratio and the listed close. The frozen pool has no independent dated FX source for these lines, so the mechanically zero differences above must not be read as evidence of executable parity. The USD CEDEAR line is the exception: it is 5.0% above the NYSE decision line after the disclosed 2:1 ratio. [Capital IQ Equity Listings, 2026-08-28]

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | **4,790.029m** at 2026-06-30 | [H1 FY2026 reviewed interim financial statements, Note 31: 4,830.689m issued less 40.660m treasury shares] |
| Diluted weighted-average shares (period) | 4,908.841m | [H1 FY2026 reviewed interim financial statements, Note 9, six months ended 2026-06-30] |
| Options/RSUs count (if disclosed) | Not separately disclosed at period end; 49.133m incremental diluted shares in H1 EPS | [H1 FY2026 reviewed interim financial statements, Note 9] |
| Convertibles / potential shares (if disclosed) | No convertible debt disclosed; 3.045m business-acquisition incremental shares included in H1 diluted EPS; 26.050m anti-dilutive potential instruments excluded | [H1 FY2026 reviewed interim financial statements, Note 9; Note 24] |
| **Fully diluted shares (TSM + if-converted)** | **4,908.841m** — H1 weighted-average diluted count | [H1 FY2026 reviewed interim financial statements, Note 9] |
| Share count used for market cap | **4,790.029m** — latest issued shares less treasury shares | [H1 FY2026 reviewed interim financial statements, Note 31] |
| Share count used for per-share fair value | **4,908.841m** — diluted weighted average | [H1 FY2026 reviewed interim financial statements, Note 9] |

| Share-count reconciliation | Shares (m) | Source |
|---|---:|---|
| Issued Class A and Class B ordinary shares at 30 June 2026 | 4,830.689 | [H1 FY2026 reviewed interim financial statements, Note 31] |
| Less: Class A treasury shares | (40.660) | [H1 FY2026 reviewed interim financial statements, Note 31] |
| **Basic shares outstanding used for market cap** | **4,790.029** | Analyst calculation from the filing lines above |
| H1 basic weighted-average shares | 4,856.663 | [H1 FY2026 reviewed interim financial statements, Note 9] |
| Plus: share-based payment dilution | 49.133 | [H1 FY2026 reviewed interim financial statements, Note 9] |
| Plus: business-acquisition dilution | 3.045 | [H1 FY2026 reviewed interim financial statements, Note 9] |
| **H1 fully diluted weighted-average shares used for per-share values** | **4,908.841** | [H1 FY2026 reviewed interim financial statements, Note 9] |

The period-end fully diluted count cannot be independently calculated because the interim filing does not provide current option strikes and all relevant vesting or conversion terms. The disclosed diluted EPS count already applies the treasury-stock method (TSM) to instruments that are dilutive; it is therefore the least-assumptive per-share denominator. It is 2.5% above the period-end basic count, so per-share fair-value work must use 4,908.841m rather than the market-cap count. [H1 FY2026 reviewed interim financial statements, Note 9]

**Capital IQ reconciliation.** The deterministic sidecar reports 4,830.7m shares outstanding as of 2026-08-29, matching the workbook's 4,830.689m `Total Shares Out. on Balance Sheet Date` field. That field equals the filing's issued-share total but does not deduct the 40.660m treasury shares the filing says Nu holds. I therefore use the filing-based 4,790.029m external-share count for market cap. The basis difference is 40.660m shares (0.8%) or US$581.6m at US$14.30; it is not silently substituted. [Capital IQ Comps → Financial Data, as of 2026-08-29; `ciq_facts.json` `shares_outstanding_m`, authoritative workbook read; H1 FY2026 reviewed interim financial statements, Note 31]

## 3. Market Capitalization

`Market cap = 4,790.029m shares × US$14.30 = US$68,497.4m`

This is the filing-based, treasury-adjusted equity value on the NYSE decision line. Capital IQ's displayed US$69,078.8m market cap instead uses its 4,830.7m issued-share field; the US$581.4m difference is the treasury-share reconciliation above. [H1 FY2026 reviewed interim financial statements, Note 31; Capital IQ Comps → Financial Data, as of 2026-08-29]

## 4. Enterprise Value Bridge

| Component | Amount | Source |
|---|---:|---|
| Market capitalization | 68,497.4 | 4,790.029m × US$14.30; sources in §§1–3 |
| + Total debt: borrowings and financing | 4,682.3 | [H1 FY2026 reviewed interim financial statements, Note 24] |
| + Repurchase agreements, included as debt-like funding | 1,058.3 | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8] |
| **+ Total debt (canonical)** | **5,740.6** | Analyst calculation: 4,682.3 + 1,058.3 |
| + Minority / non-controlling interest | 2.1 | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8] |
| + Preferred equity | 0.0 — none disclosed | [H1 FY2026 reviewed interim financial statements, Note 31] |
| + Operating lease liabilities (optional adjustment) | 66.4 | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8] |
| + Underfunded pension / other long-term obligations | 0.0 — no separately disclosed underfunded pension item identified | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, pp.7–8] |
| − Cash & equivalents | (13,551.6) | [H1 FY2026 reviewed interim financial statements, Note 11] |
| − Equity-method investments | (93.0) | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.7] |
| **= Enterprise value (EV), before optional lease adjustment** | **60,595.4** | `68,497.4 + 5,740.6 + 2.1 − 13,551.6 − 93.0` |
| **= EV, including optional lease adjustment** | **60,661.9** | Prior line + 66.4 |

The canonical debt build is US$4,682.3m of financial bills and margin-loan financing plus US$1,058.3m of repurchase agreements. It excludes customer deposits and card-network payables: for a deposit-taking financial group, they are core balance-sheet funding and operating liabilities rather than corporate debt for an EV valuation. It also excludes the US$66.4m lease liability from canonical debt and reports it separately as the optional EV adjustment. [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8; Note 24]

The cash deduction is accounting cash and equivalents, not unrestricted parent-company cash. Its build is US$7,741.9m central-bank deposits, US$3,096.4m overnight reverse repos, US$2,101.7m bank balances and US$611.6m short-term investments. I do not also deduct the US$9,149.1m compulsory and other central-bank deposits or the longer-dated securities portfolio; those are outside the filing's cash-and-equivalents note and may be regulatory or maturity-constrained. [H1 FY2026 reviewed interim financial statements, Note 11; Statement of Financial Position, p.7]

**Vendor reconciliation.** Capital IQ reports total debt of US$5,896.7m and net debt of US$(9,274.2)m for 30 June 2026; the sidecar confirms both as present. The total-debt gap to the US$5,740.6m canonical build is exactly the US$66.4m lease liability plus US$89.7m fair-value derivative liability: `5,740.6 + 66.4 + 89.7 = 5,896.7`. Neither is included in canonical debt; the lease is separately shown above and the derivative is not financing debt. The CIQ net-debt figure implies US$1,463.2m more net cash than this filing-based bridge and cannot be rebuilt from the filing's cash-equivalent definition; the sidecar itself warns that its vendor basis may net liquid investments. It is a cross-check, not the canonical input. [Capital IQ Financials → Balance Sheet, 30 June 2026; `ciq_facts.json` `total_debt_m` and `net_debt_m`, authoritative workbook reads; H1 FY2026 reviewed interim financial statements, Statement of Financial Position, pp.7–8]

`balance-sheet-survival/01_capital-structure-and-leverage.md` is not available in this run root. Accordingly, the filing-based build above is the canonical debt input for this report. The earnings module's narrower US$4,682.3m debt and US$8,869.4m strict net-cash arithmetic exclude the US$1,058.3m repo; that upstream report expressly deferred the repo-scope decision to the balance-sheet-survival module. This report includes the repo as debt-like secured funding and therefore carries US$7,811.0m strict net cash. [Historical Financials — NU, §2; H1 FY2026 reviewed interim financial statements, Note 24; Statement of Financial Position, p.8]

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | 5,740.6 | Filing-based build: Note 24 borrowings 4,682.3 + repurchase agreements 1,058.3 |
| Cash & equivalents | 13,551.6 | [H1 FY2026 reviewed interim financial statements, Note 11] |
| **Net debt (strict, §15: total debt − cash & equivalents)** | **(7,811.0) net cash** | `5,740.6 − 13,551.6`; strict basis |
| − Liquid short-term investments (if netted) | Not applicable — US$611.6m is already within filing cash & equivalents | [H1 FY2026 reviewed interim financial statements, Note 11] |
| **Net debt (broad, incl. investments — only if used)** | Not used | Longer-dated securities and compulsory central-bank deposits are not netted |
| Net debt / latest EBITDA (label GAAP or adjusted) | Not assessable | Nu does not report EBITDA; for this lender, funding cost and interest income are core operations rather than a meaningful EBITDA base. [Historical Financials — NU, §§1–2] |

The strict net-cash result is an accounting bridge, not a claim that US$7,811.0m is freely distributable or available for buybacks. It supports deposits and regulated lending operations. No leverage-to-EBITDA ratio is shown because a reported EBITDA measure is absent and would not be the appropriate balance-sheet-risk measure for this financial institution. [Business Identity — NU, §3; Historical Financials — NU, §§1–2]

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | US$2.70 | `US$13,249.7m parent equity ÷ 4,908.841m diluted shares`; [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8; Note 9] |
| Tangible book value per share | US$2.46 | `(US$13,249.7m − US$409.4m goodwill − US$747.1m intangibles) ÷ 4,908.841m`; [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.7; Note 9] |
| Net cash per share | US$1.59 | `US$7,811.0m strict net cash ÷ 4,908.841m`; filing-based calculation in §5 |

Nu has never declared or paid a cash dividend, has no dividend policy, and says it does not expect to pay dividends in the foreseeable future. No dividend or distribution yield is therefore quoted in this run. [FY2025 Form 20-F, Item 8.A, “Dividend and Dividend Policy”]

## 7. Anchor Summary (canonical numbers for downstream agents)

Use the following figures verbatim. They are in USD and are tied to the NYSE Class A decision line. The company is a financial institution, so the EV and net-cash bridge are informational; later valuation should value equity directly.

- Current price: **US$14.30** (2026-08-29 last close; Capital IQ pool source)
- Share counts used: **4,790.029m** for market cap (30 June 2026 issued shares less treasury shares); **4,908.841m** for per-share fair value (H1 FY2026 diluted weighted average)
- Market cap: **US$68,497.4m**
- Enterprise value: **US$60,595.4m** before the optional US$66.4m lease adjustment; **US$60,661.9m** including it
- Net debt: **US$(7,811.0)m net cash, strict basis** — US$5,740.6m canonical debt less US$13,551.6m cash and equivalents
- Reporting currency: **USD; IFRS Accounting Standards**

The balance-sheet-survival leverage-anchor output is unavailable. The bridge therefore uses the filing-based US$5,740.6m debt definition. Capital IQ's US$5,896.7m total debt includes the US$66.4m lease and US$89.7m derivative liability; its US$(9,274.2)m net debt is a different vendor basis and is not substituted. [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, pp.7–8; Capital IQ Financials → Balance Sheet, 30 June 2026; `ciq_facts.json`]

### Anchor Block (copy-forward)

- Decision line: **NU · NYSE · USD** — every downstream fair value, margin of safety, and yield is on this line.
- Other listed lines: ROXO34 · BOVESPA; NU / NUD · Buenos Aires; NUCO · BVC; NU N · BMV; 1NUH · Borsa Italiana; M1Z · Deutsche Börse / Börse München. The USD NUD CEDEAR was 5.0% above NYSE after its 2:1 ratio on 2026-08-28; non-USD premiums are not independently assessable from the frozen-pool FX evidence.
- Price: **US$14.30** (2026-08-29, last close)
- Price-state: **pool-verified** — the canonical tag `05`/`07`/`99` read.
- Currency: **USD**
- Distribution basis: **none quoted** — no declared cash dividend; no yield is available to a buyer today.
- Shares (market cap): **4,790.029m** (H1 FY2026 interim, Note 31 — issued shares less treasury shares)
- Shares (per-share fair value): **4,908.841m** (H1 FY2026 interim, Note 9 diluted weighted average; detailed point-in-time option terms unavailable)
- Market cap: **US$68,497.4m**
- Net debt: **US$(7,811.0)m net cash** (strict basis: Note 24 borrowings plus repo funding less Note 11 cash; balance-sheet-survival/01 unavailable)
- EV: **US$60,595.4m** before optional leases; US$60,661.9m including the US$66.4m lease liability
- Key caveats: Class A price is pool-verified and current, but Capital IQ's share count is issued rather than treasury-adjusted; cash is predominantly held in regulated financial subsidiaries; the EV bridge is informational for this financial institution.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — NU

NU reports under IFRS Accounting Standards in USD. The decision line is the Class A ordinary share, `NU · NYSE · USD`. I use the `01` anchors verbatim: US$14.30 last close at 29 August 2026, US$68,497.4m market capitalization, and 4,908.841m diluted weighted-average shares for per-share work. Enterprise value is informational only because Nu is a deposit-taking financial institution. P/E (share price divided by earnings per share), P/B (share price divided by book value per share), and P/TBV (share price divided by tangible book value per share) are the relevant measures; EV/EBITDA, EV/EBIT, and P/FCF are not meaningful for this bank. [Price & Capital Structure — NU, §§1, 3–4 and 7]

Unless another source is named, Capital IQ multiple citations below refer to the frozen `data/NU/Nu Holdings Ltd NYSE NU Financials.xls — Multiples` workbook tab, quarterly and basic dilution, and the forward-consensus citation refers to `data/NU/NuHoldingsLtdNYSENUEstimatesReport.xls — Multiples`. [Capital IQ Financials → Multiples; Capital IQ Estimates → Multiples, current frozen exports]

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E | LTM, Capital IQ basic dilution; adjustment status not stated | US$0.734 LTM EPS implied by US$14.30 / 19.480x | **19.5x** | [`ciq_facts.json` `pe_ltm_current_x` = 19.5x, source ref: CIQ Financials → Multiples “P/LTM EPS” Close (latest); Capital IQ Financials → Multiples, 2026-08-28] |
| P / E | NTM, Capital IQ basic dilution | US$0.969 NTM EPS implied by US$14.30 / 14.764x | **14.8x** | [Capital IQ Financials → Multiples, “P/NTM EPS” Close, 2026-08-28] |
| P / E | FY2026, GAAP consensus | US$0.848 implied FY2026 EPS; displayed consensus rounds to US$0.85 | **16.9x** | [Capital IQ Estimates → Multiples, FY2026 Price/Earnings, current export; Earnings Guidance & Consensus — NU, §4] |
| P / Book | LTM, Capital IQ basic dilution | US$2.743 book value/share implied by US$14.30 / 5.214x | **5.2x** | [Capital IQ Financials → Multiples, “P/BV” Close, 2026-08-28] |
| P / Tangible Book | LTM, Capital IQ basic dilution | US$2.503 tangible book value/share implied by US$14.30 / 5.712x | **5.7x** | [Capital IQ Financials → Multiples, “P/Tangible BV” Close, 2026-08-28] |
| Dividend yield | Trailing / forward | No declared cash dividend | N/A | [FY2025 Form 20-F, Item 8.A, “Dividend and Dividend Policy”; Price & Capital Structure — NU, §6] |

The direct workbook P/B and P/TBV series use **basic** dilution. `01` uses the required fully diluted 4,908.841m-share denominator and derives US$2.70 book value/share and US$2.46 tangible book value/share; at US$14.30 those are 5.30x and 5.81x, respectively. This 1.7%–1.8% basis difference is disclosed rather than mixed: the Capital IQ basic series is retained only to keep the historical comparison like-for-like, while any later per-share fair value must use `01`'s diluted count. [Price & Capital Structure — NU, §§2 and 6; Capital IQ Financials → Multiples, 2026-08-28]

## 2. Historical Multiple Bands (3–5 years)

**Historical multiple bands unavailable at the requested 3–5-year length.** The frozen Capital IQ export contains only seven observations from 31 March 2025 to 28 August 2026 (about 17 months). The table is therefore a short-range positioning exhibit, not a 3–5-year normal range and not a fair-value anchor. `Percentile of Range` is `(current − minimum) / (maximum − minimum)`, not a statistical percentile.

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| P / E | 19.5x | 26.8x | 25.4x | 34.1x | 19.5x | 0.0% |
| P / E | 14.8x | 19.4x | 19.7x | 24.0x | 14.8x | 0.0% |
| P / Book | 5.2x | 6.6x | 6.5x | 8.1x | 5.2x | 1.9% |
| P / Tangible Book | 5.7x | 7.3x | 7.2x | 8.9x | 5.7x | 1.6% |

The first P/E row is LTM and the second is NTM. Calculations use the seven Capital IQ `Close` observations: 2025-03-31, 2025-06-30, 2025-09-30, 2025-12-31, 2026-03-31, 2026-06-30 and 2026-08-28. For example, LTM P/E mean = `(25.384 + 31.197 + 34.096 + 32.451 + 24.581 + 20.612 + 19.480) / 7 = 26.829x`; the current 19.480x is 27.4% below that short-series mean. [Capital IQ Financials → Multiples, “P/LTM EPS”, “P/NTM EPS”, “P/BV” and “P/Tangible BV” Close rows, quarterly dates 2025-03-31 to 2026-08-28; analyst calculations]

## 3. Re-Rating / De-Rating Read

On the two most useful financial-sector measures, the market is paying less than during this short observed period: NTM P/E is 14.8x, 23.8% below the 19.4x mean and 24.9% below the 19.7x median; P/TBV is 5.7x, 22.0% below the 7.3x mean and 20.3% below the 7.2x median. LTM P/E gives the same directional result at 19.5x, 27.4% below its 26.8x short-series mean. [Capital IQ Financials → Multiples, quarterly Close rows 2025-03-31 to 2026-08-28; analyst calculations]

The multiples export does not attribute the change, so a causal conclusion is not proven. **Inference, not from filings:** the lower observed multiples coexist with rapidly rising consensus FY2026 GAAP EPS of US$0.85 versus FY2025 reported diluted EPS of US$0.5846, but also with lender-specific quality questions: filing-built TTM CFO was negative US$1.382bn, expected-credit-loss coverage rose 149bp from FY2025 to June 2026, and H1 2026 included a US$991.0m deferred-tax benefit. Those risks can constrain the multiple the market will pay even if near-term earnings rise. [Capital IQ Estimates → Trends, FY2026; FY2025 Form 20-F, Consolidated Statements of Income, F-6–F-7; Historical Financials — NU, §§2–3 and 6; Earnings Quality — NU, §§5–6]

## 4. Implied Value from Reversion

No own-history reversion value, base-case point, or cross-multiple value range is produced. The evidence is only a 17-month, seven-observation series, materially shorter than the roughly three years needed for a mean or median reversion target. Applying its 19.7x NTM-P/E median or 7.2x P/TBV median to current metrics would be illustrative-only and is deliberately not a fair-value input for `07_scenario-and-fair-value`.

Reversion would also assume that the warranted multiple has not changed. That assumption is not established: the business-model work rates quality 52/100 and calls the moat narrow and only provisionally widening, while country, consumer-credit and regulatory dependence remain material. [Business Quality — NU, Quality Factor Table; Moat — NU, §§3–5; External Dependency Check — NU, §§1 and 3]

## 5. Sector Cycle Reality Test

**Not assessable — no sector-level multiple history.** The frozen pool has no Brazil/Latin-American financial-sector P/E, P/B, or P/TBV series covering the same 17-month window. B3's IFNC is a total-return *price* index for Brazilian financials, not a sector multiple series; its publicly available historical-statistics page provides annual high/low records rather than matching-date valuation multiples. A price-index move cannot establish a sector P/E or P/B re-rating, so the short NU band is neither tagged cycle-elevated nor cycle-depressed. [Web: [B3 IFNC methodology](https://www.b3.com.br/en_us/market-data-and-indices/indexes/indexes-for-segments-and-sectors/financials-index-ifnc.htm) and [historic statistics](https://sistemaswebb3-listados.b3.com.br/indexStatisticsPage/records/IFNC?language=en-us), accessed 2026-08-31 (official web sources, unverified)]

## 6. Own-History Read

NU is at or within 2% of the low end of every observed 17-month P/E, P/B, and P/TBV range: 14.8x NTM P/E and 5.7x P/TBV are the clearest two measures. That is a directional de-rating read, not proof of an undervaluation: a seven-point series has no established through-cycle mean, and the sector-cycle test could not validate the reference range.

The single biggest caveat is that earnings quality and credit-cycle evidence may justify some persistent compression. A reversion to the short-period mean must not be used as the base case unless a longer multiple history and evidence that cash, tax, and credit-risk concerns have improved make the earlier range warranted. [Earnings Quality — NU, §§6 and 9–10; Business Model Synthesis — NU, §§3 and 7]



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — NU

All figures are for NU Class A ordinary shares on the NYSE in US dollars. Nu reports under IFRS Accounting Standards. The 29 August 2026 close was US$14.30. [Capital IQ Comps → Financial Data, subject row, data as of 2026-08-29; `ciq_facts.json` `current_price`]

Nu is a deposit-taking financial institution, so this report uses equity multiples: price/earnings (P/E, the price paid for each dollar of earnings) and price/tangible book value (P/TBV, the price paid for each dollar of equity excluding goodwill and other intangibles). EV/EBITDA, EV/EBIT, net-debt/EBITDA and cash-flow yield are not meaningful common measures here: Nu does not report EBITDA or EBIT, and its CFO is driven by lending, deposits and securities movements rather than distributable free cash flow. [FY2025 Form 20-F, Consolidated Statements of Income and Cash Flows, F-6–F-7 and F-14–F-15; H1 FY2026 interim financial statements, Statements of Cash Flows, p.12]

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Itaú Unibanco Holding S.A. | BOVESPA: ITUB4 | Brazilian retail credit, deposits, cards, payments, investments and insurance; its broad retail bank competes for the same borrower and depositor. | Nu names Itaú as a main Brazilian consumer-credit competitor. [FY2025 Form 20-F, Item 3.D, “Substantial and increasingly intense competition”] |
| Banco Bradesco S.A. | BOVESPA: BBDC4 | Brazilian retail credit, cards, deposits, payments, investments and insurance; it competes in Nu’s principal country and end market. | Nu names Bradesco as a main Brazilian consumer-credit competitor. [FY2025 Form 20-F, Item 3.D, “Substantial and increasingly intense competition”] |
| Banco Santander (Brasil) S.A. | BOVESPA: SANB11 | Brazilian consumer credit, cards, deposits, payments, investments and insurance; it is a direct listed incumbent in Nu’s principal market. | Nu names Santander Brasil as a main Brazilian consumer-credit competitor. [FY2025 Form 20-F, Item 3.D, “Substantial and increasingly intense competition”] |

This is the business-model competitive-map’s core, directly named public peer set, not a self-selected broad fintech screen. Banco Inter, BTG, C6, XP, Mercado Pago, PicPay, PagSeguro and StoneCo are product-specific competitors, but have different mixes or no matched direct-bank multiple in the selected set; including them would widen the comparison without making it more like-for-like. [Competitive Map — NU, §§2, 5; FY2025 Form 20-F, Item 3.D] No private company is included in the selected core set.

## 2. Peer Multiples & Operating Stats

All price, multiple, revenue-growth and net-income-margin fields below are the Capital IQ comparable-analysis workbook’s matched cross-section, in US dollars, as of 2026-08-29; vendor `Total Revenue` and margin definitions are bank-template measures and are not substituted for Nu’s audited IFRS revenue. Nu’s LTM P/E of 19.50x agrees with the deterministic sidecar’s authoritative workbook read. [Capital IQ Company Comparable Analysis, Financial Data / Trading Multiples / Operating Statistics, data as of 2026-08-29; `ciq_facts.json` `pe_ltm_current_x`]

| Company | LTM P/E | NTM P/E | P/TBV | FCF Yield | LTM Rev Growth | LTM Net-Income Margin | ROIC / ROE | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| NU | 19.50x | 14.76x | 5.70x | N/A — bank CFO not distributable FCF | 44.33% | 42.73% | 17.2% four-year IFRS ROE; FY2025 30.3% [FY2025 Form 20-F, Consolidated Statements of Profit or Loss and Financial Position, pp.155, 157; FY2024 Form 20-F, Statement of Changes in Equity] | N/A — bank; EBITDA not reported | 2026-08-29 [1] |
| Santander Brasil | 8.10x | 7.61x | 1.20x | N/A | 8.47% | 28.66% | 12.5% recurring managerial ROAE, 2Q26 [Banco Santander (Brasil) Form 6-K, 2Q26 Earnings Release, p.3] | N/A | 2026-08-29 [1] |
| Bradesco | 7.40x | 6.08x | 1.10x | N/A | 6.23% | 26.07% | 16.2% consolidated ROAE, 2Q26 [Banco Bradesco Form 6-K, 2Q26 Economic and Financial Analysis, p.7] | N/A | 2026-08-29 [1] |
| Itaú | 9.30x | 8.16x | 2.30x | N/A | 6.63% | 32.58% | 24.3% annualized recurring managerial ROE, 2Q26 [Itaú Unibanco Form 6-K, 2Q26 earnings release, 2026-08-04] | N/A | 2026-08-29 [1] |
| **Peer median** | **8.10x** | **7.61x** | **1.20x** | **N/A** | **6.63%** | **28.66%** | **16.2%**† | **N/A** | **2026-08-29** |
| **Peer mean** | **8.27x** | **7.28x** | **1.53x** | **N/A** | **7.11%** | **29.10%** | **17.7%**† | **N/A** | **2026-08-29** |

[1] Capital IQ Company Comparable Analysis, Financial Data / Trading Multiples / Operating Statistics, data as of 2026-08-29. †The return measures mix each bank’s stated 2Q26 managerial or recurring ROE/ROAE definitions; they are a directional comparison only, not a matched audited league table. NU’s 17.2% is a FY2022–FY2025 IFRS average and therefore is not directly comparable to a single-quarter annualised peer result. [FY2025 Form 20-F, Consolidated Statements of Profit or Loss and Financial Position, pp.155, 157; peer releases cited above]

## 3. Premium / Discount to Peer Median

Premium / discount is `(NU multiple − peer median) / peer median`. A positive result is a premium for price multiples. The earning-yield cross-check reverses the reading: a lower yield is a premium, not a discount.

| Multiple | NU | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| LTM P/E | 19.50x | 8.10x | **+140.7% premium** |
| NTM P/E | 14.76x | 7.61x | **+94.0% premium** |
| P/TBV | 5.70x | 1.20x | **+375.0% premium** |
| LTM earnings yield (inverted check) | 5.13% | 12.35% | **58.5% lower yield = premium** |

The current gap is **Not assessable** against NU’s own approximately three-year relationship to these peers. The pool contains NU’s own multiple history, but not a historical multiple series for this direct-bank peer set; NU’s own P/E moving from 34.10x at 30 September 2025 to 19.48x at 28 August 2026 cannot show whether its premium to the three peers widened or narrowed. [Capital IQ Financials → Multiples, quarterly series, 2025-03-31 to 2026-08-28]

## 4. Is the Gap Warranted?

**Premium is unjustified (relative downside).** NU’s 44.33% LTM vendor-basis revenue growth and 42.73% LTM net-income margin are above the peer medians of 6.63% and 28.66%, so a growth premium is warranted. [Capital IQ Company Comparable Analysis, Operating Statistics, data as of 2026-08-29] But the available return evidence does not show a similarly clear, matched return lead: NU’s 17.2% four-year IFRS ROE is near the 16.2% peer median, while the comparisons mix a four-year audited NU result with 2Q26 peer managerial measures. [FY2025 Form 20-F, Consolidated Statements of Profit or Loss and Financial Position, pp.155, 157; peer releases cited in §2] The business-quality assessment is 52/100 and calls out regulation, Brazilian consumer-credit cyclicality and unstable bank margins; the moat is narrow and widening only provisionally, not confirmed. [Business Quality — NU, §§1–4; Moat — NU, §§3–5] The 94.0% NTM P/E and 375.0% P/TBV premiums therefore require sustained high growth and returns that the current comparable return record does not establish.

## 5. Implied Value from Peer Multiples

These are equity values, not EV values, because NU is a financial institution. The company metrics and peer multiples are matched by basis: NTM P/E is applied to Capital IQ NTM EPS of US$0.97; LTM P/E to LTM EPS of US$0.73; and P/TBV to US$2.46 tangible book per diluted share. The per-share calculations use the 4,908.841m diluted weighted-average shares required by the anchor. [Capital IQ Company Comparable Analysis, Financial Data / Trading Multiples, data as of 2026-08-29; H1 FY2026 reviewed interim financial statements, Note 9; Price & Capital Structure — NU, §§2, 6]

| Multiple | Applied Peer Multiple | Implied Equity Value | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| NTM P/E — primary base | 7.61x median, unadjusted | US$36.24bn = `7.61 × US$0.97 × 4,908.841m` | **US$7.38** = `7.61 × US$0.97` | **(48.4%)** |
| LTM P/E | 8.10x median, unadjusted | US$29.03bn = `8.10 × US$0.73 × 4,908.841m` | US$5.91 = `8.10 × US$0.73` | (58.6%) |
| P/TBV | 1.20x median, unadjusted | US$14.49bn = `1.20 × US$2.46 × 4,908.841m` | US$2.95 = `1.20 × US$2.46` | (79.4%) |

**Base-case implied value: US$7.38 per NYSE Class A share**, using the direct-peer median NTM P/E on matched NTM EPS. The separate cross-multiple dispersion is **US$2.95–US$7.38 per share**. It is not an independent football field: all three values share the same three-peer set and the P/TBV value is especially sensitive to whether the market believes NU’s present growth/return profile is durable.

| Multiple adjusted | Peer median | Adjusted to | Gap already in the denominator? | What the extra adjustment pays for | How it was sized |
|---|---:|---:|---|---|---|
| NTM P/E | 7.61x | 7.61x | **Yes** — earnings already carry profitability | No adjustment. Lower margin is not a valid additional haircut on P/E. | No separately evidenced durability, growth, incremental-return or risk adjustment was quantified. |
| LTM P/E | 8.10x | 8.10x | **Yes** — earnings already carry profitability | No adjustment. | Same hard-gate conclusion as NTM P/E. |
| P/TBV | 1.20x | 1.20x | **No** — book is return-blind | No adjustment. A return-based premium or discount could be valid, but the available ROE definitions and periods are not matched enough to size one. | Median retained rather than inventing a ROE haircut or premium. |

The double-count test is therefore passed: no earnings multiple is haircutted for NU’s margin, and no adjustment uses an `own margin / peer margin` ratio. Any convergence with NU’s own-history multiple would be a coincidence rather than independent corroboration, because own history records prior market pricing rather than a separate valuation input.

## 6. Sector Cycle Reality Test

**Not assessable — no sector-level multiple history.** The direct-bank Capital IQ workbook is a single 2026-08-29 snapshot. The available official broad-market proxy supplies an MSCI Brazil forward P/E of 8.44x at 2026-07-31, but not a same-basis 2023 direct-bank peer series; it cannot establish whether this three-bank median re-rated or de-rated by more than 25%. [Capital IQ Company Comparable Analysis, Trading Multiples, data as of 2026-08-29] [MSCI Brazil Index, data as of 2026-07-31](https://www.msci.com/indexes/index/907600/msci-brazil-index) — broad-market proxy, unverified for the bank peer set.

## 7. Relative Read

NU trades at a 94.0% NTM P/E premium and a 375.0% P/TBV premium to its three directly named Brazilian-bank peers. Faster growth supports part of that premium, but mixed quality, a provisional narrow moat and no clear matched return lead leave the observed premium unjustified on this evidence. The peer-median NTM P/E implies US$7.38 per NYSE Class A share, with US$2.95–US$7.38 dispersion across the three peer-multiple reads; the peer anchor’s sector-cycle position remains not assessable.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic Equity Value — NU (Residual-Income Model)

NU is a deposit-taking financial institution. An FCFF DCF and EV bridge would treat deposits, loans, funding cost and regulatory capital as non-operating items, which is not valid for a lender. This report therefore values equity directly with a residual-income model: opening book value plus the present value of earnings above the required return on equity. The decision line is **NU · NYSE · USD**. NU reports under IFRS Accounting Standards in US dollars and has a 31 December year-end. [Valuation Data Triage — NU, §1A; Price & Capital Structure — NU, §§1, 7]

## 1. Equity Base & Normalizations

All amounts are US$ millions unless stated otherwise. The base is equity at 30 June 2026, not CFO or FCF: lending and deposit flows make the latter unsuitable as distributable cash for this bank. [Earnings Quality — NU, §§1–3]

| Item | Base Value | Treatment in Residual-Income Model | Source |
|---|---:|---|---|
| Parent equity / opening book value | 13,249.7 | Opening equity, B0 | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8; Price & Capital Structure — NU, §6] |
| Fully diluted shares | 4,908.841m | Per-share denominator throughout | [H1 FY2026 reviewed interim financial statements, Note 9; Price & Capital Structure — NU, §2] |
| Book value per diluted share | 2.70 | Reconciles to 13,249.7 / 4,908.841 | [Price & Capital Structure — NU, §6] |
| H1 FY2026 reported net income | 1,932.520 | Deducted from the FY2026 consensus full-year earnings estimate; it is already reflected in the 30 June book value | [H1 FY2026 interim financial statements, Statement of Income, p.5; Statement of Changes in Equity, p.10] |
| FY2026 consensus GAAP EPS | 0.85 | FY2026 net income = 0.85 × 4,908.841 = 4,172.5; used only for unreported H2 earnings | [Capital IQ Estimates — Trends, FY2026 current; Guidance & Consensus — NU, §4] |
| H1 FY2026 deferred-tax benefit | 991.046 | **Not normalized away.** The filing does not disclose its reversal timing or a forward cash-tax rate, so a tax adjustment would be invented. It is instead a model-risk flag. | [H1 FY2026 interim financial statements, Note 30, pp.36–37; Earnings Quality — NU, §5] |
| Cash dividends / modeled repurchases | None modeled through FY2030 | NU has no dividend policy. A US$1.0bn repurchase authorization is not treated as an executed buyback; the filing does not give a committed timing or completed amount in the evidence used here. This is an analyst assumption, not company guidance. | [FY2025 Form 20-F, Item 8.A, “Dividend and Dividend Policy”; H1 FY2026 reviewed interim financial statements, Note 31; Price & Capital Structure — NU, §6] |

The H1 book tax rate was 11.8%, lowered by the US$991.046m deferred-tax benefit against US$1,249.145m current tax expense. The residual-income model uses GAAP earnings after tax, so it cannot use an EBIT/NOPAT tax normalization; future cash-tax timing is not proven from available data. This makes the FY2026 consensus earnings input less certain, rather than a reason to fabricate a normalized rate. [H1 FY2026 interim financial statements, Statement of Income, p.5; Note 30, p.37]

## 2. Forecast Assumptions

`RI_t = NI_t − k_e × B_{t−1} × period fraction`; `B_t = B_{t−1} + NI_t − distributions`. No distributions are modeled during the explicit period. For this lender, retained earnings are the relevant reinvestment: capex and conventional working-capital assumptions are not used.

| Assumption | H2 2026 | FY2027 | FY2028 | FY2029 | FY2030 | Terminal FY2031 onward | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---|
| GAAP EPS (US$) | 0.456 | 1.080 | 1.280 | 1.460 | 1.620 | Not separately forecast | H2 is FY2026 consensus EPS 0.850 less H1 reported earnings per diluted share equivalent (1,932.520 / 4,908.841 = 0.394); FY2027–30 are **analyst assumptions, not company-guided**. |
| Net income (US$m) | 2,240.0 | 5,301.5 | 6,283.3 | 7,166.9 | 7,952.3 | 8,438.8 | H2 calculation above; FY2027–30 are EPS × diluted shares; terminal earnings are 20.0% terminal ROE × FY2030 ending book. |
| ROE on beginning book | 33.8% annualized | 34.2% | 30.2% | 26.5% | 23.2% | 20.0% | Explicit-period path is **analyst assumption** that fades from FY2025 IFRS ROE of 30.3%; terminal 20.0% is only 349bp above the 16.51% company hurdle. [Moat — NU, §3; FY2025 Form 20-F, pp.155, 157, F-38] |
| Distribution / payout | 0.0% | 0.0% | 0.0% | 0.0% | 0.0% | 85.0% | Explicit zero payout is an analyst assumption; terminal payout is `(20.0% − 3.0%) / 20.0%`, which retains 15.0% to finance 3.0% book-value growth. |
| Book-value / residual-income growth | Derived | Derived | Derived | Derived | Derived | 3.0% | Terminal residual-income growth is an **analyst assumption**, below Nu’s 3.69% Brazil long-term-inflation assumption in its impairment test because NU reports in USD and has material FX translation exposure. [FY2025 Form 20-F, Note 4, goodwill impairment analysis, F-37–F-38; External Dependency Check — NU, §§1–2] |

The near-term earnings path is not a smooth extrapolation of the latest quarter. Q2 2026 risk-adjusted NIM was 12.4%, following a 294bp sequential lift from credit income and lower credit cost, while risk expansion also added 24bp to early delinquencies and US$170m to the allowance bridge. The forecast therefore fades ROE after FY2027 rather than treats the latest spread as a permanent run rate. [Q2 2026 Earnings Presentation, slides 16, 18; Earnings Sensitivity — NU, §§2, 4]

**Financeable-growth check.** For a lender, retained earnings rather than industrial capex is the financeable-growth driver. The terminal assumptions reconcile exactly: `20.0% terminal ROE × 15.0% retention = 3.0% growth`. This is below the 20.0% terminal ROE, so it requires the modeled 85.0% terminal payout; it is an assumption, not a disclosed capital-return plan.

## 3. Cost of Equity

This model discounts equity directly at the cost of equity (`k_e`); it does not calculate WACC or use an EV bridge. The **used 16.51% rate is the company’s own disclosed Brazil-focused Investments-activities CGU cost of equity**, not a group-wide rate. It is conservative versus the illustrative market build below and avoids assigning a low USD CAPM rate to a business with 91.4% of FY2025 geographic revenue in Brazil. [FY2025 Form 20-F, Note 4, goodwill impairment analysis, F-37–F-38; External Dependency Check — NU, §1]

| Component / cross-check | Value | Source / treatment |
|---|---:|---|
| USD long-term government-bond rate | 4.45% | Web-sourced, 1 July 2026 US Treasury rate used in Damodaran’s July update; unverified third-party valuation input. [Web: Damodaran, current data update, 2026-07-01] |
| Brazil total equity-risk premium | 7.59% | Web-sourced January 2026 country-risk data; includes country exposure and is an external input. [Web: Damodaran, Country Default Spreads and Risk Premiums, 2026-01-05] |
| Beta | 1.00 floor, illustrative only | No sourced NU beta was found in the frozen pool. The module’s cyclical/emerging-market floor is used only for the market check, not as a claimed measured beta. [Valuation MODULE_RULES, Economic Consistency Gate 4; Business Quality — NU, §§1–2] |
| Illustrative market cost of equity | 12.04% | `4.45% + 1.00 × 7.59%`; not used because beta is a policy floor rather than a sourced NU measurement. |
| **Used cost of equity** | **16.51%** | **Company-disclosed impairment-test cost of equity for the Brazil-focused Investments CGU; no discretionary WACC override.** [FY2025 Form 20-F, Note 4, goodwill impairment analysis, F-37–F-38] |

The used 16.51% rate clears the low-side test: it is 12.06 percentage points above the 4.45% USD reference rate. The company’s rate is 4.47 percentage points above the illustrative 12.04% market check. That gap is disclosed rather than tuned away: the filed rate has narrower scope than the group but is the only company-specific hurdle located, and using it is conservative. The relevant financial-company arithmetic is `k_e`, not `after-tax k_d ≤ WACC < k_e`.

### 3A. Cost-of-Capital Reality Test

| Reference | Rate | Source | Gap vs used cost of equity |
|---|---:|---|---:|
| Used cost of equity | 16.51% | This report, §3 | — |
| Company disclosed discount rate | 16.51% | Investments-activities CGU impairment test; stated as a cost of equity, not a group-wide rate. [FY2025 Form 20-F, Note 4, F-37–F-38] | 0bp |
| Market-implied rate | Runs after this report; the FCFF reverse-DCF slot is invalid for this financial issuer | [Valuation Data Triage — NU, §6A] | Not assessable |
| Trailing earnings yield | 5.13% | `1 / 19.5x` using the present Capital IQ LTM P/E; this is not a cost-of-equity estimate. [Capital IQ Financials → Multiples, latest P/LTM EPS 19.5x; `ciq_facts.json` `pe_ltm_current_x`] | −1,138bp |
| Illustrative market build | 12.04% | Web inputs and 1.00 beta floor in §3 | −447bp |

**Escalation branch:** no low-rate escalation applies because the model uses, rather than undercuts, the company’s own disclosed rate. Scope remains a limitation: this is a Brazil-focused Investments CGU rate, not proof of the correct group-wide cost of equity.

## 4. Residual-Income Forecast & Discounting

Discounting uses the mid-year convention. Measured from 30 June 2026, the H2 2026 earnings midpoint is 0.25 years away; each full-year forecast is discounted to its mid-year. Ending book values reflect the no-distribution explicit-period assumption.

| Period | Opening Book | Net Income | Equity Charge | Residual Income | Ending Book | Discount Factor | PV of Residual Income |
|---|---:|---:|---:|---:|---:|---:|---:|
| H2 2026 | 13,249.7 | 2,240.0 | 1,093.8 | 1,146.2 | 15,489.7 | 0.962519 | 1,103.3 |
| FY2027 | 15,489.7 | 5,301.5 | 2,557.3 | 2,744.2 | 20,791.2 | 0.858295 | 2,355.3 |
| FY2028 | 20,791.2 | 6,283.3 | 3,432.6 | 2,850.7 | 27,074.6 | 0.736671 | 2,100.0 |
| FY2029 | 27,074.6 | 7,166.9 | 4,470.0 | 2,696.9 | 34,241.5 | 0.632281 | 1,705.2 |
| FY2030 | 34,241.5 | 7,952.3 | 5,653.3 | 2,299.1 | 42,193.8 | 0.542684 | 1,247.7 |

Sum of PV of explicit residual income: **US$8,511.5m**.

Executed calculation and raw output:

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
B0=13249.7; sh=4908.841; ke=0.1651; g=0.03; h1=1932.520
profits=[0.85*sh-h1,1.08*sh,1.28*sh,1.46*sh,1.62*sh]
periods=[0.5,1,1,1,1]; times=[.25,1,2,3,4]
labels=['H2 2026','FY2027','FY2028','FY2029','FY2030']
B=B0; pv=0
print('Residual-income model (US$m):')
print('period | BOP | NI | ROE | equity_charge | RI | EOP | DF | PV_RI')
for lab,ni,p,t in zip(labels,profits,periods,times):
    charge=ke*B*p; ri=ni-charge; Bnext=B+ni; df=(1+ke)**(-t); pvri=ri*df; pv+=pvri
    print(f'{lab} | {B:.1f} | {ni:.1f} | {ni/B/p:.2%} | {charge:.1f} | {ri:.1f} | {Bnext:.1f} | {df:.6f} | {pvri:.1f}')
    B=Bnext
ri_next=B*0.20-B*ke; tv=ri_next/(ke-g); pv_tv=tv*(1+ke)**(-4.5); equity=B0+pv+pv_tv
print(f'PV explicit RI={pv:.1f}; terminal RI FY2031={ri_next:.1f}; TV={tv:.1f}; PV TV={pv_tv:.1f}; equity={equity:.1f}; value/share={equity/sh:.2f}; TV%= {pv_tv/(pv+pv_tv):.1%}')
print('Sensitivity $/share:')
for roe in [.18,.20,.22]:
    row=[]
    for k in [.1551,.1651,.1751]:
        Bb=B0; pp=0
        for ni,p,t in zip(profits,periods,times):
            ri=ni-k*Bb*p; pp+=ri*(1+k)**(-t); Bb+=ni
        row.append(f'{(B0+pp+(roe-k)*Bb/(k-g)*(1+k)**(-4.5))/sh:.2f}')
    print(f'terminal ROE {roe:.0%}: ' + ' | '.join(row))
print('Cost of equity market check (not used):',4.45+7.59)
PY
Residual-income model (US$m):
period | BOP | NI | ROE | equity_charge | RI | EOP | DF | PV_RI
H2 2026 | 13249.7 | 2240.0 | 33.81% | 1093.8 | 1146.2 | 15489.7 | 0.962519 | 1103.3
FY2027 | 15489.7 | 5301.5 | 34.23% | 2557.3 | 2744.2 | 20791.2 | 0.858295 | 2355.3
FY2028 | 20791.2 | 6283.3 | 30.22% | 3432.6 | 2850.7 | 27074.6 | 0.736671 | 2100.0
FY2029 | 27074.6 | 7166.9 | 26.47% | 4470.0 | 2696.9 | 34241.5 | 0.632281 | 1705.2
FY2030 | 34241.5 | 7952.3 | 23.22% | 5653.3 | 2299.1 | 42193.8 | 0.542684 | 1247.7
PV explicit RI=8511.5; terminal RI FY2031=1472.6; TV=10899.8; PV TV=5480.0; equity=27241.2; value/share=5.55; TV%= 39.2%
Sensitivity $/share:
terminal ROE 18%: 5.50 | 4.91 | 4.40
terminal ROE 20%: 6.22 | 5.55 | 4.98
terminal ROE 22%: 6.94 | 6.19 | 5.55
Cost of equity market check (not used): 12.04
```

## 5. Continuing Value

Method and formula:

`CV_2030 = RI_2031 / (k_e − g_RI)`

`= [B_2030 × (terminal ROE − k_e)] / (k_e − g_RI)`

`= [42,193.8 × (20.0% − 16.51%)] / (16.51% − 3.0%) = US$10,899.8m`.

- Terminal residual income: **US$1,472.6m** in FY2031.
- Continuing value, undiscounted: **US$10,899.8m**.
- PV of continuing value: **US$5,480.0m**.
- Continuing value is **39.2% of total present value of residual income** and **20.1% of total equity value**. It is not terminal-dominated on the 75% threshold.

The terminal ROE fades from 34.2% in FY2027 to 20.0%, only 349bp over the 16.51% equity hurdle. A residual return is permitted because the upstream moat read is *Narrow moat — trajectory widening (provisional)*, not “No moat proven”; its 17.2% four-year IFRS ROE was only 68bp over the same hurdle, so a 20.0% terminal ROE is an analyst assumption rather than a proven durable result. The structural-runoff trigger is not met: business-quality rate-of-change/disruption is 50/100, above the ≤40 trigger. [Moat — NU, §§3, 5; Business Quality — NU, §1]

## 6. Equity Value Output

| Step | Value |
|---|---:|
| Opening book value | 13,249.7 |
| + PV of explicit residual income | 8,511.5 |
| + PV of continuing value | 5,480.0 |
| **= Equity value** | **27,241.2** |
| ÷ Fully diluted shares | 4,908.841m |
| **= Intrinsic value per NYSE NU share** | **US$5.55** |
| Current NYSE NU price, 2026-08-29 | US$14.30 |
| Model value versus current price | (61.2%) |

No debt, cash, minority-interest or EV bridge is added here: those are already part of the regulated lender’s book equity and balance-sheet economics. The filing-based strict net-cash bridge of US$7,811.0m is informational, not a cash amount that can be added to a banking residual-income valuation. [Price & Capital Structure — NU, §§4–5]

## 7. Sensitivity Grid (US$ per NYSE NU share)

Cost of equity across columns; terminal ROE down rows. Terminal residual-income growth is held at 3.0%.

| Terminal ROE \ Cost of Equity | 15.51% | 16.51% | 17.51% |
|---|---:|---:|---:|
| 22.0% | 6.94 | 6.19 | 5.55 |
| 20.0% | 6.22 | **5.55** | 4.98 |
| 18.0% | 5.50 | 4.91 | 4.40 |

The grid spans US$4.40–6.94 per share. It varies the two assumptions that determine continuing residual income; it does not give equal status to a cost of equity lower than the company’s filed hurdle.

## 8. Intrinsic Read

**Base intrinsic value is US$5.55 per NYSE NU share; the sensitivity grid gives US$4.40–6.94.** This is 61.2% below the pool-verified US$14.30 close on 29 August 2026, but it is a low-confidence equity cross-check rather than a rating: the discount rate comes from a Brazil-focused CGU, while FY2026 reported earnings include a material deferred-tax benefit with uncertain reversal timing. [Capital IQ Comps → Financial Data, subject row, as-of 2026-08-29; H1 FY2026 interim financial statements, Note 30, pp.36–37]

The dominant assumption is not near-term EPS; it is whether NU can sustain returns well above a 16.51% required equity return after its current credit-income and lower-credit-cost lift fades. The filed evidence shows both higher early delinquencies from risk expansion and ECL coverage rising to 16.86% at June 2026, so a terminal ROE materially above the 18–22% grid is not proven from available data. [Earnings Sensitivity — NU, §§2, 4; Earnings Quality — NU, §§3, 10]

Partial data: financial-company residual-income model used; no group-wide cost of equity, sourced NU beta, or forecast cash-tax reversal is available. Intrinsic confidence is capped at Low.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — NU

## 1. Inputs

NU is a deposit-taking financial institution, so an enterprise-value / FCFF reverse DCF would be the wrong tool. This report inverts the same equity-direct residual-income model used in `04_intrinsic-dcf`: book value plus earnings above the required return on equity. All amounts are US$ millions unless stated otherwise; NU reports under IFRS in US dollars. [FY2025 Form 20-F, cover page; Intrinsic Equity Value — NU, §§1–5]

| Input | Value | Source |
|---|---:|---|
| Decision line / current price | NU · NYSE · US$14.30, last close 2026-08-29; pool-verified | [Capital IQ Comps → Financial Data, subject row, as of 2026-08-29; `ciq_facts.json` `current_price`, authoritative workbook read] |
| Fully diluted shares | 4,908.841m | [H1 FY2026 reviewed interim financial statements, Note 9] |
| Price-implied equity value used in the equity model | US$70,196.4m = US$14.30 × 4,908.841m | Analyst calculation from the price and diluted-share inputs above |
| Enterprise value | Informational only: US$60,595.4m before the optional lease adjustment; not an intrinsic input for this lender | [Price & Capital Structure — NU, §7] |
| FCF base | Not applicable. CFO and FCF are not distributable-cash measures for a deposit-taking lender. | [Historical Financials — NU, §§1–2; Valuation MODULE_RULES, Business-Type Method Map] |
| Equity / earnings base used instead | Opening parent equity US$13,249.7m at 30 June 2026; H2 FY2026 net income US$2,240.0m; FY2027–30 net income path US$5,301.5m / 6,283.3m / 7,166.9m / 7,952.3m | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8; Intrinsic Equity Value — NU, §§1–2] |
| Discount rate used | 16.51% cost of equity, not WACC. It is Nu's disclosed rate for the Brazil-focused Investments-activities CGU, not a proven group-wide rate. | [FY2025 Form 20-F, Note 4, goodwill impairment analysis, pp.F-37–F-38; Intrinsic Equity Value — NU, §3] |
| Forecast horizon / timing | H2 FY2026 plus FY2027–30; terminal from FY2031; mid-year discounting from 30 June 2026 | [Intrinsic Equity Value — NU, §§2, 4–5] |
| Terminal assumptions | 20.0% terminal ROE, 3.0% residual-income growth and 85.0% terminal payout in `04`'s base model | [Intrinsic Equity Value — NU, §§2, 5] |

`04` values the same base path at US$5.55 per share, versus US$14.30 in the pool. This reverse solve therefore keeps its equity base, 16.51% cost of equity, 3.0% terminal growth and mid-year convention intact; it does not add the lender's informational EV bridge or cash balance. [Intrinsic Equity Value — NU, §§4–6; Price & Capital Structure — NU, §§4–7]

## 2. Implied Expectations

The primary solve holds the `04` explicit earnings path, cost of equity, terminal growth and timing fixed, then solves only for the terminal ROE that makes equity value equal the current share price. The secondary solve holds the 20.0% terminal ROE and the same discount-rate, terminal-growth and timing assumptions fixed, then solves a constant FY2027–FY2030 net-income CAGR starting from the FY2026 consensus net income of US$4,172.5m. These are alternative reconciliations, not assumptions to add together.

| What the Price Implies | Solved Value |
|---|---:|
| Implied terminal ROE, with `04`'s explicit earnings path unchanged | **47.36%** |
| Implied FY2027–FY2030 net-income CAGR, with terminal ROE held at `04`'s 20.0% | **80.89%** |
| Implied FY2030 net income in that constant-growth solve | **US$44,674.4m** |
| `04` base-path FY2026–FY2030 net-income CAGR, for comparison | 17.50% |

The 80.89% solve grows net income from US$4,172.5m in FY2026 to US$44,674.4m in FY2030, or 10.7 times the FY2026 starting amount. It also requires that FY2030 profit be 4.62 times `04`'s US$7,952.3m base-path FY2030 profit. [Capital IQ Estimates — Trends, FY2026 current; H1 FY2026 interim financial statements, Statement of Income, p.5; Intrinsic Equity Value — NU, §2]

Executed solver command and output:

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
B0, sh, price, k0, tg = 13249.7, 4908.841, 14.30, .1651, .03
p04, period, t = [2240.0,5301.5,6283.3,7166.9,7952.3], [.5,1,1,1,1], [.25,1,2,3,4]
target = price*sh
def val(k, roe, ps=p04):
    b=B0; pv=0
    for ni, frac, tm in zip(ps, period, t):
        pv += (ni-k*b*frac)/(1+k)**tm; b += ni
    return B0+pv+(roe-k)*b/(k-tg)/(1+k)**4.5
def root(f, lo, hi):
    for _ in range(160):
        m=(lo+hi)/2
        if f(lo)*f(m)<=0: hi=m
        else: lo=m
    return (lo+hi)/2
roe = root(lambda x: val(k0,x)-target, k0+1e-7, 2)
fy26 = 1932.520+2240.0
def growth_path(h): return [2240.0]+[fy26*(1+h)**i for i in range(1,5)]
growth = root(lambda x: val(k0,.20,growth_path(x))-target, -.5, 2)
ke = root(lambda x: val(x,.20)-target, tg+1e-7, .6)
print(f'Primary terminal-ROE root = {roe:.8%}')
print(f'Constant FY2027–FY2030 net-income CAGR root = {growth:.8%}; FY2030 NI = {growth_path(growth)[-1]:.1f}')
print(f'Implied cost-of-equity root = {ke:.8%}; ratio to 04 = {ke/k0:.4f}x')
PY
Primary terminal-ROE root = 47.35637331%
Constant FY2027–FY2030 net-income CAGR root = 80.89022785%; FY2030 NI = 44674.4
Implied cost-of-equity root = 9.77721830%; ratio to 04 = 0.5922x
```

## 2A. Implied Discount Rate — the dual solve (always run this)

The mirror solve fixes every `04` base-case input: the H2 FY2026 and FY2027–30 earnings path, 20.0% terminal ROE, 3.0% terminal growth, no explicit-period distributions and the mid-year convention. It solves only the cost of equity.

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied cost of equity at `04`'s base-case earnings path | `04` earnings path, 20.0% terminal ROE, 3.0% terminal growth, horizon and convention | **9.78%** |
| `04` model cost of equity, for comparison | — | **16.51%** |
| Ratio (implied ÷ model) | — | **0.592x** |

The 9.78% root is 673bp below the 16.51% rate used in `04`, and 226bp below its illustrative 12.04% market build that already uses a 1.00 beta floor and Brazil total equity-risk premium. This does not establish that the market is wrong: it presents two readings. **Reading A — the cash flows are too low at a 16.51% hurdle:** the price requires the 47.36% terminal ROE or 80.89% explicit-profit growth described above. **Reading B — the applied rate is too high for NU's group equity:** the 16.51% filed rate is for one Brazil-focused CGU, not a group-wide hurdle. The available evidence does not prove which reading wins; it does show that a conclusion that the market is simply pricing a collapse would be unsupported. [FY2025 Form 20-F, Note 4, pp.F-37–F-38; Intrinsic Equity Value — NU, §3]

This 9.78% market-implied rate is an input to `04` §3A's cost-of-capital reality test. The output-path contract limits this agent to `05_reverse-dcf.md`, so `04` is not edited here; its owner should carry this number into the cross-check table.

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Terminal ROE of 47.36% | FY2025 IFRS ROE was 30.3%; the FY2022–FY2025 average was 17.2%, only 68bp above the same 16.51% filed hurdle. | The moat is narrow and provisionally widening; its return evidence is not a full credit-cycle proof. | **Stretch — not proven.** |
| FY2027–FY2030 net-income CAGR of 80.89%, with terminal ROE held at 20.0% | Diluted EPS grew from US$0.2121 in FY2023 to US$0.5846 in FY2025, a 66.0% CAGR from a low profit base; FY2026 consensus EPS of US$0.85 is 45.4% above FY2025. | Q2's risk-adjusted-NIM bridge included +178bp credit income and +115bp lower credit cost, but neither is disclosed as a durable dollar earnings coefficient. Risk expansion also increased early delinquency by 24bp and Q2 ECL was 46.4% above Q2 2025. | **No — not proven from available data.** |

FY2023–FY2025 EPS growth is the closest positive same-metric history, but it covers only two years after losses in FY2021–FY2022. It is therefore a judgment-informed comparison, not a measured four-year base rate. It falls 14.9 percentage points below the 80.89% requirement, and the required growth must persist for four fiscal years rather than two. [Historical Financials — NU, §§1, 6; Capital IQ Estimates — Trends, FY2026 current]

The latest operating drivers are mixed. The reported Q2 benefit from credit income and lower credit cost can support earnings, but the same risk expansion raised early delinquency, while a 100% downside macro weighting would increase the allowance by US$504.7m. The latter is an allowance sensitivity, not an EPS forecast, so it cannot be mechanically deducted from the reverse-DCF path. [Earnings Sensitivity — NU, §§2, 4–6; Q2 2026 Earnings Presentation, slides 16 and 18]

**Market-ceiling sanity check:** a revenue-TAM test is not meaningful for this lender. The pool gives FY2025 deposits of US$41.9bn, but no cited addressable loan-book, deposit-pool or asset-base estimate that can test the US-dollar earnings path on a matched basis. This check is **Not assessable**; it provides no favourable inference. [Moat — NU, §2]

## 4. Robustness

The continuing value is only 20.1% of total equity value in `04`, below the 60% threshold for a mandatory terminal-growth stress. The required terminal ROE is nevertheless materially rate-sensitive:

| Cost of Equity | Implied Terminal ROE to Justify US$14.30 |
|---|---:|
| 15.51% | 42.49% |
| 16.51% | 47.36% |
| 17.51% | 52.53% |

The executed solver returned 42.49310713%, 47.35637331% and 52.53243453% for those three rates. A 100bp lower rate reduces the required terminal ROE by 486bp; a 100bp higher rate increases it by 518bp.

| Explicit-earnings base stress | Implied Terminal ROE | Treatment |
|---|---:|---|
| `04` base path: H2 FY2026 US$2,240.0m; FY2027–30 US$5,301.5m / 6,283.3m / 7,166.9m / 7,952.3m | 47.36% | Base solve above. [Intrinsic Equity Value — NU, §2] |
| Low / high earnings-base band | Not assessable | `04` and the earnings module provide no filing-backed or consensus low/high earnings path. The allowance range is not an earnings coefficient, so applying it as a profit band would invent precision. [Earnings Sensitivity — NU, §§2–3] |

An evidence-backed comparison between discount-rate and earnings-base sensitivity is therefore not assessable. The rate alone moves the required terminal ROE by roughly five percentage points per 100bp, and the more important judgment is scope: the 16.51% rate is CGU-specific rather than a proven group cost of equity. No unsupported ±10% earnings stress is used.

## 5. What's-Priced-In Read

At US$14.30, applying `04`'s 16.51% cost of equity and its explicit earnings path requires a 47.36% terminal ROE. Alternatively, holding `04`'s 20.0% terminal ROE requires 80.89% annual net-income growth from FY2027 through FY2030, ending at US$44.7bn. Those are aggressive requirements versus FY2025's 30.3% ROE, the 17.2% four-year ROE average and the mixed credit evidence. [Moat — §§3–5; Earnings Sensitivity — §§2, 4]

The dual solve tempers that conclusion: the same `04` earnings path reconciles at a 9.78% cost of equity, while `04` uses a 16.51% rate that is filed but only for a Brazil-focused CGU. The reverse read is therefore **aggressive conditional on `04`'s discount rate**, not proof that the market is mispricing NU.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — NU

## 1. Segment Inventory

Nu reports under IFRS Accounting Standards in U.S. dollars and has a 31 December year-end. All amounts are US$ millions unless stated otherwise. The `% of Total EBIT` denominator would normally be reportable-segment EBIT. Nu does not disclose segment EBIT or EBITDA, so that percentage is not calculable; its sole reportable segment represents 100% of disclosed consolidated profit instead.

| Segment | Revenue | EBIT (or EBITDA) | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| Nu Group — Banking (sole reportable segment) | 15,774.7 | N/A — no segment EBIT/EBITDA; FY2025 IFRS net income was 2,868.9 | N/A — no segment EBIT/EBITDA disclosed | N/A — 100% of disclosed consolidated profit | [FY2025 Form 20-F, Consolidated Statements of Income, F-7; Note 34, F-97] |

**Effectively single-segment — SOTP collapses to the consolidated read.** The CEO reviews and allocates capital for the whole Group as one reportable banking segment. A bank should be valued directly on equity earnings or book value, rather than by applying an EV multiple and then adding back operating cash. The geographic table is not a substitute: it reports revenue but no country profit, and it uses a US$12,083.8m product-scope subtotal rather than the US$15,774.7m IFRS total revenue. [FY2025 Form 20-F, Note 34 (Segment information), F-97; Note 34(b), F-98; Valuation Module Rules, Business-Type Method Map]

The Capital IQ sidecar's present `segments_revenue` fact is US$6,991.185m for `Banking` (100%), from the FY2025 segment workbook. That is the authoritative vendor read, not the audited IFRS revenue line. It reconciles exactly to a bank-template subtotal: US$15,774.741m total revenue less US$4,578.680m interest and other financial expenses less US$4,204.876m expected credit loss = US$6,991.185m. I use the audited US$15,774.7m revenue above because it is the filing's stated total-revenue line; there is no conflict once the definitions are matched. [Capital IQ Financials → Segments, FY2025 annual column; `ciq_facts.json` `segments_revenue`, authoritative workbook read; FY2025 Form 20-F, Consolidated Statements of Income, F-7]

No unallocated or corporate segment is disclosed. The sole segment is the consolidated Group, so any corporate costs are already inside consolidated earnings; no cost bucket can be capitalized or removed without double counting. [FY2025 Form 20-F, Note 34, F-97] The tier-5 relationship graph also identifies Nu Pagamentos, Nu BN México and Nu Colombia as Group entities, not external businesses to value separately; its view is limited to recently disclosed counterparties. [Capital IQ Suppliers/Customers relationship graph, scope notes and entity affiliation, frozen export]

## 2. Segment Multiples & Comparables

The only useful collapsed-SOTP check is equity-direct: forward P/E, not EV/EBITDA or EV/EBIT. The metric is Capital IQ's NTM GAAP EPS of US$0.970 per share; its matching NTM P/E uses the same forward basis. The vendor displays the estimate on a basic-dilution convention, so the result below is a sanity check rather than a stand-alone fair-value input. [Capital IQ Company Comparable Analysis, Financial Data / Trading Multiples, data as of 2026-08-29; Capital IQ Estimates → Multiples, current export]

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| Nu Group — Banking (collapsed check) | NTM GAAP EPS: US$0.970/share (vendor, basic-dilution convention) | 7.61x NTM P/E | Banco Santander (Brasil) S.A. | 7.61x NTM P/E | [Capital IQ Company Comparable Analysis, Financial Data / Trading Multiples, data as of 2026-08-29] |

Santander Brasil is a named Nu competitor with Brazilian retail lending, cards, deposits, payments, investments and insurance, so its capital intensity, funding and credit-risk economics are a closer match than a generic fintech or software peer. [FY2025 Form 20-F, Item 3.D, “Substantial and increasingly intense competition”] It is not a full valuation answer: Nu's 44.33% LTM vendor-basis revenue growth was far above Santander Brasil's 8.47%, so applying Santander's multiple mechanically is deliberately a conservative cross-check, not evidence that Nu warrants identical valuation. [Capital IQ Company Comparable Analysis, Operating Statistics, data as of 2026-08-29]

For multiple-driven dispersion only, the other named Brazilian bank checks are Banco Bradesco at 6.08x NTM P/E (US$5.90/share) and Itaú at 8.16x (US$7.92/share); Santander gives US$7.38/share. Those figures are not a forward SOTP range feeding `07`; all are the same single-bank P/E lens. [Capital IQ Company Comparable Analysis, Trading Multiples / Financial Data, data as of 2026-08-29]

## 3. Segment Valuation

The normal SOTP output would be segment enterprise values. That is not valid for a deposit-taking financial group: the P/E check produces an equity value directly. The arithmetic is `US$0.970 NTM EPS × 7.61x × 4,908.841m diluted shares = US$36,235.6m`; the vendor EPS is rounded, so the equity-value arithmetic is illustrative to the shown precision. [Capital IQ Company Comparable Analysis, Financial Data / Trading Multiples, data as of 2026-08-29; H1 FY2026 reviewed interim financial statements, Note 9]

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Nu Group — Banking | US$0.970 NTM GAAP EPS/share | 7.61x NTM P/E | N/A — financial equity method; US$36,235.6m direct-equity sanity value |
| **Gross enterprise value (sum)** |  |  | **N/A — an EV SOTP is not valid for this financial issuer** |

## 4. Equity Bridge

The equity-only check does **not** use an EV bridge. In particular, the US$(7,811.0)m strict net-cash figure is not added: it supports regulated lending and funding operations and is already part of the financial group's equity economics. Adding it after applying P/E would double count. [H1 FY2026 reviewed interim financial statements, Note 11 and Note 24; Price & Capital Structure — NU, §§4–5]

| Step | Value |
|---|---:|
| Gross enterprise value | N/A — financial issuer valued directly on equity |
| − Capitalized unallocated corporate costs | N/A — sole segment's consolidated EPS already includes all Group costs; no unallocated bucket disclosed |
| − Net debt | N/A — not applied; US$(7,811.0)m strict net cash is operating/regulatory financial-group cash, not surplus cash to add |
| − Minority / preferred | N/A — P/E uses the parent-share EPS; no separate deduction in this equity method |
| + Equity-method investments | N/A — not separately added in this equity method |
| − Conglomerate / holdco discount (if any) | US$0 — no separate holding-company or multi-business structure disclosed |
| **= Equity value** | **US$36,235.6m — single-bank P/E sanity check, not a formal SOTP bridge** |
| ÷ Diluted shares | 4,908.841m [H1 FY2026 reviewed interim financial statements, Note 9] |
| **= SOTP value per share** | **US$7.38 — collapsed-P/E sanity check only** |
| vs current price | US$14.30 at 2026-08-29; check is US$6.92 lower, or (48.4%) versus price [Capital IQ Comps → Financial Data, 2026-08-29; `ciq_facts.json` `current_price`, authoritative workbook read] |

No conglomerate or holding-company discount is warranted because there is no separately disclosed holding-company asset or second reportable business. This is not a conclusion that the share price should equal US$7.38: a one-segment P/E check cannot substitute for the peer and residual-income valuation work needed for a financial institution.

## 5. SOTP Read

There is no hidden segment value: Banking is the entire disclosed business, so a breakup adds no information beyond consolidated equity valuation. The only direct check is US$7.38 per share using Santander Brasil's 7.61x NTM P/E, with US$5.90–US$7.92 across the three named Brazilian-bank multiples, versus NU's US$14.30 price. [Capital IQ Company Comparable Analysis, Trading Multiples / Financial Data, data as of 2026-08-29]

The segment that carries the value is therefore the whole Banking Group. It is not being masked by a consolidated multiple; the relevant question is whether Nu's materially higher growth and return profile warrants its 14.76x NTM P/E rather than the 6.08x–8.16x direct-bank comparison range. This collapsed check is not a weighted fair-value method for `07`.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — NU

All values are for Nu Class A ordinary shares (`NU · NYSE · USD`). NU is a deposit-taking financial institution that reports under IFRS in USD, so the valid equity-value lenses are P/E, P/TBV, and residual income rather than EV/EBITDA or FCFF. [Valuation Data Triage — NU, §§1A, 6A; Price & Capital Structure — NU, §7]

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | No fair-value point; 17-month positioning series only | Low | 0% | The seven observations are materially shorter than the required 3–5-year history and `02` marks any reversion as illustrative-only. It is not a value-producing input. [Multiples — Own History — NU, §§2, 4] |
| Relative / peers (03) | **US$7.38** primary NTM P/E; US$2.95–7.38 cross-multiple dispersion | Medium-low | 50% | A directly named Brazilian-bank peer set and matched NTM P/E are available, but NU's growth premium is only partly evidenced and the P/TBV result is highly sensitive to durable returns. [Relative Valuation — Peers — NU, §§2–5] |
| Intrinsic residual-income (04) | **US$5.55**; US$4.40–6.94 sensitivity grid | Low | 50% | Residual income is a valid primary financial-company method, but its 16.51% cost of equity is a Brazil-focused CGU rate rather than a proven group hurdle, and FY2026 earnings include a US$991.0m deferred-tax benefit with uncertain reversal timing. [Intrinsic Equity Value — NU, §§3, 6–8] |
| Reverse residual-income (05) | US$14.30 implies 47.36% terminal ROE at `04`'s 16.51% hurdle, or a 9.78% implied cost of equity | Low | n/a | Cross-check only. It shows that price and `04` cannot both be right, but does not itself produce a fair value. [Reverse DCF — NU, §§2–2A, 5] |
| Sum-of-the-parts (06) | US$7.38 collapsed P/E check; US$5.90–7.92 across named-bank checks | Low | 0% | NU has one Banking segment. The producer marks this as a single-segment sanity check, not a stand-alone weighted value. [Sum-of-the-Parts — NU, §§1–5] |

Weights sum to 100% across the two valid, value-producing methods. The financial-company method map makes residual income valid, but its CGU-specific discount rate is a material limitation; this offsets the peer method's unresolved growth-premium question and supports equal, rather than decorative, weights. `02` and `06` remain in the football field but do not enter the base point.

## 2. Triangulation & Reconciliation

The displayed football field runs from **US$2.95 to US$7.92**, a 2.68x span (168% from low to high). That is the headline uncertainty: US$2.95 is the unadjusted peer-median P/TBV check and US$7.92 is the highest named-bank NTM-P/E check. They are not independent methods; they share the same peer group and differ chiefly in whether NU's excess return is durable. The two weighted primary points are narrower, US$5.55–7.38 (33%), but neither supports the US$14.30 pool price. [Relative Valuation — Peers — NU, §5; Intrinsic Equity Value — NU, §§6–7; Sum-of-the-Parts — NU, §§2, 5]

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history multiples | No value; observed NTM P/E 14.8x–24.0x is illustrative-only | Low | 0% | The 17-month history is not a through-cycle reference. [Multiples — Own History — NU, §§2, 4] |
| Relative / peers | US$7.38 primary; US$2.95–7.38 across NTM P/E, LTM P/E and P/TBV | Medium-low | 50% | NTM P/E is the producer's matched-basis primary result; the P/TBV lower point is a warning, not a mechanically adjusted base. [Relative Valuation — Peers — NU, §5] |
| Intrinsic residual income | US$5.55; US$4.40–6.94 sensitivity | Low | 50% | Correct equity-direct method for a lender, but its group cost of equity and tax normalization are not proven. [Intrinsic Equity Value — NU, §§3, 6–8] |
| Sum-of-the-parts | US$7.38; US$5.90–7.92 named-bank check range | Low | 0% | Duplicates the peer P/E lens for a sole Banking segment. [Sum-of-the-Parts — NU, §§1–5] |

Neither `02` nor `03` could assess sector-level multiple history, so neither fires a cycle-elevated or cycle-depressed tag. That is an explicit evidence gap, not proof that either reference is stable. [Multiples — Own History — NU, §5; Relative Valuation — Peers — NU, §6]

**Base-case fair value: US$6.47 per share.** It is the mechanically weighted point: 50% of the US$7.38 peer NTM-P/E value plus 50% of the US$5.55 residual-income value = US$6.465, rounded to US$6.47. [Relative Valuation — Peers — NU, §5; Intrinsic Equity Value — NU, §6] The peer lens is more directly linked to tradable Brazilian-bank valuations, while residual income is the business-type-appropriate intrinsic method; equal weights reflect the latter's CGU-rate limitation and the former's unproven premium. This is a reconciliation judgment, not a midpoint smearing of the full US$2.95–7.92 football field.

Executed calculation and raw output:

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
price=14.30; peer_primary=7.38; residual_income=5.55
base=0.50*peer_primary+0.50*residual_income
fy27_bvps_vendor_basic=4.12174; basic=4790.029; diluted=4908.841
fy27_bvps_diluted=fy27_bvps_vendor_basic*basic/diluted
fy27_tbvps_proxy=fy27_bvps_diluted*(2.46/2.70)
bull=fy27_tbvps_proxy*2.30; base_mult=base/fy27_tbvps_proxy; bear=fy27_tbvps_proxy*1.20
print(base, fy27_bvps_diluted, fy27_tbvps_proxy, bull, base_mult, bear)
print((base-price)/price, (base-price)/base, (price-bear)/price)
PY
6.465 4.021978646661981 3.664491877512027 8.428331318277661 1.7642263151724493 4.397390253014432
-0.5479020979020979 -1.2119102861562258 0.6924901920968929
```

The raw inputs are the US$7.38 peer primary value, US$5.55 residual-income value, US$4.12174 FY2027 consensus book value per share, 4,790.029m market-cap shares, 4,908.841m diluted shares, and current US$2.46 tangible book value per diluted share / US$2.70 book value per diluted share. [Relative Valuation — Peers — NU, §5; Intrinsic Equity Value — NU, §6; Capital IQ Estimates → Consensus, FY2027 Book Value / Share, current frozen export; Price & Capital Structure — NU, §§2, 6]

## 3. Bull / Base / Bear Fair-Value Levels

The horizon is 12 months, to roughly August 2027. A financial-company P/TBV framework is used for all three scenario levels so the multiple moves are comparable. The FY2027 vendor book-value-per-share consensus is US$4.12174. It is adjusted from the vendor per-share basis to `01`'s fully diluted basis: `4.12174 × 4,790.029m / 4,908.841m = US$4.0220`. The resulting FY2027 tangible-book-value-per-share (TBVPS) proxy is `US$4.0220 × (US$2.46 / US$2.70) = US$3.6645`; holding the June 2026 tangible-to-book ratio constant is an inference, not a published tangible-book consensus. [Capital IQ Estimates → Consensus, FY2027 Book Value / Share, current frozen export; Price & Capital Structure — NU, §§2, 6]

| Case | Fair Value / Share (point) | Forward Metric (EPS/EBITDA) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---|---:|---|---|
| Bull | **US$8.43** | FY2027 TBVPS proxy US$3.6645 | **2.30x P/TBV** | 12 months | The FY2027 book-value consensus is reached, the Q2 credit-income and lower-credit-cost benefits do not reverse sharply, and NU earns the core peer set's highest current P/TBV (Itaú's 2.30x). Q2's lower credit cost added 115bp to risk-adjusted NIM, but higher early delinquency remains visible; this is an operating condition, not a forecast coefficient. [Capital IQ Estimates → Consensus, FY2027 Book Value / Share, current frozen export; Capital IQ Company Comparable Analysis → Trading Multiples, 2026-08-29; Earnings Sensitivity — NU, §§2, 4–6] |
| Base | **US$6.47** | FY2027 TBVPS proxy US$3.6645 | **1.764x P/TBV** | 12 months | The peer-primary and residual-income methods reconcile as above. The 1.764x multiple is 47% above the selected direct-peer median of 1.20x but below Itaú's 2.30x, requiring some credit-growth premium without assuming that NU sustains its current observed 5.7x trailing P/TBV. [Relative Valuation — Peers — NU, §§2–5; Intrinsic Equity Value — NU, §6] |
| Bear (credit-cycle trough) | **US$4.40** | FY2027 TBVPS proxy US$3.6645 | **1.20x P/TBV** | 12 months | The forward book base remains intact but investors apply the selected direct-peer median P/TBV. The relevant prior downturn is FY2022, when NU reported diluted EPS of **negative US$0.078**; P/E was therefore unusable in that down-leg. The bear uses P/TBV rather than a mild P/E haircut, while the disclosed 100%-downside macro case raises ECL by US$504.7m before tax. [Historical Financials — NU, §1; Capital IQ Estimates → Consensus, FY2027 Book Value / Share, current frozen export; Capital IQ Company Comparable Analysis → Trading Multiples, 2026-08-29; Earnings Sensitivity — NU, §§2, 4] |

The bear is a credit-cycle trough, not a permanent-impairment floor. A structural-reset calculation is not triggered: the moat verdict is narrow with a provisionally widening trajectory, not eroding, and business-model disruption risk is 50/100, above the approximately 40 trigger. [Moat — NU, §5; Business Quality — NU, §1]

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | **US$14.30** — pool-verified last close, 2026-08-29 |
| Base-case fair value (point) | US$6.47 |
| Bear-case fair value | US$4.40 |
| Implied upside to base case = `(base FV − price) / price` | **(54.8%)** |
| **Margin of safety** = `(base FV − price) / base FV` — the cushion | **(121.2%)** — negative; no cushion |
| **Downside to bear** = `(price − bear FV) / price` — *inverted: higher = worse* | **69.3%** |

The US$14.30 price is the deterministic sidecar's authoritative workbook read (`CIQ Comps→Financial Data 'Day Close Price Latest'`, as of 2026-08-29), consistent with `01`; its two-calendar-day age is below the stale-price threshold. [Price & Capital Structure — NU, §§1, 7; `ciq_facts.json` `current_price` = US$14.30, source ref as stated]

## 5. Warranted-Multiple Check

The base 1.764x forward P/TBV is a 47% premium to the selected direct-peer median of 1.20x but remains below Itaú's 2.30x; it gives NU some credit for higher growth without assuming its recent 5.7x trailing P/TBV is durable. [Relative Valuation — Peers — NU, §§2–5]

NU's quality score is 52/100 and its moat is narrow and only provisionally widening; its four-year IFRS ROE of 17.2% is only 68bp above the 16.51% company-disclosed equity hurdle. [Business Quality — NU, §§1–4; Moat — NU, §§3–5]

The pool price implies a 3.90x forward P/TBV (`US$14.30 / US$3.6645`), 121% above the base multiple and above the core peer set's 2.30x high, while ECL coverage rose 149bp to 16.86% by June 2026 and filing-built TTM CFO was negative US$1.382bn; that premium is not supported by a proven through-cycle return record. [Earnings Quality — NU, §§1–3, 9–10; Capital IQ Company Comparable Analysis → Trading Multiples, 2026-08-29]

## 6. Fair-Value Read

The 12-month bull/base/bear fair-value levels are **US$8.43 / US$6.47 / US$4.40** per NYSE Class A share. At the pool-verified US$14.30 price, the base-case implied upside is negative 54.8%, the margin of safety is negative 121.2%, and downside to the bear level is 69.3% (inverted: higher is worse). Equal weighting of the peer NTM-P/E and residual-income methods drives the US$6.47 base; the short own-history series and collapsed SOTP do not contribute weight. The biggest swing factor is whether credit losses and risk-adjusted NIM permit a P/TBV premium to move from the peer-median 1.20x toward the peer-high 2.30x. [Relative Valuation — Peers — NU, §5; Intrinsic Equity Value — NU, §6; Earnings Sensitivity — NU, §§2, 4]
