# valuation Module Dossier — BURL

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-09-29T17:28:34Z
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

# Valuation Module — BURL (Synthesis)

## Abstract

BURL is fairly valued: the $254.69 close is 7.5% above the $237.01 base value, so there is no cushion. The 12-month levels are $370.63 bull, $237.01 base, and $66.31 cyclical-trough bear; a 70% peer forward-earnings / 30% discounted-cash-flow blend drives the base. At today's price, the model implies annual free-cash-flow growth of 46.75% through FY2030 or a 13.85% operating-profit margin, neither proven by current evidence. The bear level implies 74.0% downside, while valid methods span $133.46–$302.88 and cap confidence. Verdict: fairly valued because the base is 7.5% below the price, but the outcome range is wide. [Valuation 05 Reverse DCF, §§2–5; Valuation 07 Scenario & Fair Value, §§2–6]

## 1. Valuation Verdict

- **Verdict:** **Fairly valued** — the $254.69 price is 7.46% above the $237.01 base fair value, within the module's ±10% band. [Valuation 07 Scenario & Fair Value, §§4 and 6]
- **Base-case fair value (point, per share):** **$237.01**, on a 12-month horizon. [Valuation 07 Scenario & Fair Value, §§2–3]
- **Current price:** **$254.69**, pool-verified NYSE close on 2026-09-28; one trading day old. [Capital IQ Comps, Financial Data, subject row, 2026-09-28; CIQ facts sidecar]
- **Bull / Base / Bear fair-value levels (points):** **$370.63 / $237.01 / $66.31** per share; the bear is a recoverable cyclical-trough case, not a permanent-impairment case. [Valuation 07 Scenario & Fair Value, §3]
- **Cross-method dispersion (football field, low–high):** **$133.46–$302.88**, a 126.94% high-to-low spread measured from the low; excluded own-history sensitivities were $317.03–$438.53. [Valuation 07 Scenario & Fair Value, §§1–2]
- **Valuation attractiveness /100** *(higher = cheaper)*: **40** — the base implies 6.94% downside from price, although the peer method alone implies 10.5% upside. [Valuation 03 Relative Valuation, §5; Valuation 07 Scenario & Fair Value, §§2 and 4]
- **Margin of safety /100** *(higher = better)*: **30** — margin of safety, meaning the price discount to base fair value, is **(7.46%)**, so no cushion exists. [Valuation 07 Scenario & Fair Value, §4]
- **Valuation confidence /100:** **50** — data coverage is good, but the 126.94% method spread triggers a hard maximum of 55. [Valuation 00 Data Triage, §§3–6; Valuation 07 Scenario & Fair Value, §§1–2]
- **Downside risk /100** *(higher = worse; inverted)*: **88** — downside to the $66.31 bear value is **73.96%**. [Valuation 07 Scenario & Fair Value, §§3–4]
- **Data quality /100:** **88** — all core inputs are present and the price is fresh, but the enterprise-value vendor series does not reconcile and the fully diluted share count is a period-average proxy. [Valuation 00 Data Triage, §§3–6; Valuation 01 Price & Capital Structure, §§2 and 4; Valuation 02 Own History, §1]
- **Overall usefulness /100:** **78** — the module produces testable fair-value levels and a price-implied expectations read, but its base value remains sensitive to a large peer-versus-cash-flow disagreement. [Valuation 05 Reverse DCF, §5; Valuation 07 Scenario & Fair Value, §§2–6]
- **Dominant valuation method:** Matched peer NTM P/E — next-twelve-month price divided by earnings — at 70% weight, because it uses direct off-price peers and avoids the lease-sensitive enterprise-value bridge; the applied 23.333x multiple retains a 10% discount to the direct-peer median. [Capital IQ Comps, Financial Data and Trading Multiples, as of 2026-09-28; Valuation 03 Relative Valuation, §§4–5]
- **What's priced in:** The reverse-DCF, which solves what the current price assumes, requires **46.75% annual FCFF growth** through FY2030 to $1.641bn, or a **13.85% EBIT margin**; FCFF is cash available to debt and equity providers, and EBIT is operating profit before interest and tax. Neither requirement is proven. [Valuation 05 Reverse DCF, §§2–5]
- **Biggest valuation risk:** Store and supply-chain spending may not turn earnings growth into durable cash flow; that is the main reason the DCF is $133.46 while the peer base is $281.39. [Valuation 04 Intrinsic DCF, §§2 and 6–8; Valuation 07 Scenario & Fair Value, §2]

## 1A. Module Disconfirmation

- **Strongest bear point:** The filing-based DCF is **$133.46**, 47.6% below the current price, and the same model requires 46.75% annual FCFF growth or a 13.85% EBIT margin to justify $254.69, versus a 7.8% LTM EBIT margin. [Valuation 04 Intrinsic DCF, §§6–8; Valuation 05 Reverse DCF, §§2–5]
- **Strongest bull point:** A 10% warranted discount to the two direct peers still gives **$281.39** on NTM P/E, 10.5% above price; the bull reaches **$370.63** only with $13.00 NTM EPS and a 28.51x P/E. [Valuation 03 Relative Valuation, §§4–5; Valuation 07 Scenario & Fair Value, §3]
- **Single killer risk:** The peer method values forward earnings, while the DCF exposes weak cash conversion under heavy capital spending; if growth capex does not fall or generate later cash flow, the peer-led base is too high. [Valuation 04 Intrinsic DCF, §§2 and 4–8]
- **Disconfirming evidence already visible:** The $281.39 peer value contradicts the below-market $237.01 blended base, while the $133.46 DCF contradicts the peer read; the 126.94% field shows that neither direction is independently settled. [Valuation 07 Scenario & Fair Value, §§1–2]

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | **Sufficient; no active partial-data cap.** | A fresh pool price, forward estimates, peers, cash flow and capital structure are all present; SOTP is inapplicable because BURL has one reportable segment. [Valuation 00 Data Triage, §§3–6] |
| price-and-capital-structure | **Pool-verified anchor available.** | Price is $254.69; canonical strict net debt is $1.216bn and EV is $17.210bn, while CIQ's $5.202bn net debt is a separately reconciled lease-inclusive vendor measure. [Valuation 01 Price & Capital Structure, §§1 and 4–7] |
| multiples-own-history | **De-rated, but reversion is not an admissible base.** | Mechanical median values are $317.03 on EV/Sales and $438.53 on P/E, but the vendor EV basis and historical share basis do not reconcile cleanly. [Valuation 02 Own History, §§3–6] |
| relative-valuation-peers | **The peer gap is wider than warranted after a 10% durability discount.** | Matched NTM P/E gives $281.39; the $302.88 EV/EBITDA check depends on a lease-inclusive vendor bridge. [Valuation 03 Relative Valuation, §§4–7] |
| intrinsic-dcf | **Intrinsic value is $133.46 per share.** | The sensitivity range is $109.91–$168.23 and terminal value supplies 74.35% of EV, leaving the result sensitive to capex and later cash conversion. [Valuation 04 Intrinsic DCF, §§5–8] |
| reverse-dcf | **Current expectations are aggressive and not proven.** | Price requires 46.75% annual FCFF growth through FY2030 or a 13.85% steady-state EBIT margin; holding the DCF cash path fixed instead implies a 6.95% discount rate. [Valuation 05 Reverse DCF, §§2–5] |
| sum-of-the-parts | **Single-segment — SOTP collapses.** | BURL's one U.S. off-price retail segment accounts for 100% of reportable revenue and profit, so a breakup would duplicate the peer method. [Valuation 06 Sum-of-the-Parts, §§1–5] |
| scenario-and-fair-value | **$370.63 bull / $237.01 base / $66.31 cyclical-trough bear.** | The 70% peer / 30% DCF base is 6.94% below price, with a negative 7.46% margin of safety and 73.96% downside to bear. [Valuation 07 Scenario & Fair Value, §§2–6] |

## 3. Reconciliation

The valid football field runs from the **$133.46 DCF** to the **$302.88 peer EV/EBITDA support check**, a 126.94% high-to-low spread; this exceeds 40%, so it is the first finding and caps confidence at 55. The direct comparison between method base points is also wide: $133.46 for DCF versus $281.39 for peer NTM P/E. Own-history sensitivities of $317.03–$438.53 remain visible but receive no weight because their historical share and enterprise-value bases do not reconcile; SOTP adds no value because the company has one segment. [Valuation 02 Own History, §§1 and 4–6; Valuation 03 Relative Valuation, §5; Valuation 04 Intrinsic DCF, §§6–8; Valuation 06 Sum-of-the-Parts, §5; Valuation 07 Scenario & Fair Value, §§1–2]

The reconciled base is **$237.01**, calculated as `70% × $281.39 peer value + 30% × $133.46 DCF`. The peer method leads because it uses BURL's $12.06 NTM EPS and a 23.333x warranted P/E against Ross and TJX, while avoiding the inconsistent lease treatment in EV multiples. The DCF remains a material cross-check because its $850.5m FY2030 FCFF path is already growth-heavy, yet the price requires $1.641bn under the same WACC and terminal-growth convention. [Capital IQ Comps, Financial Data and Trading Multiples, as of 2026-09-28; Valuation 03 Relative Valuation, §5; Valuation 04 Intrinsic DCF, §4; Valuation 05 Reverse DCF, §2; Valuation 07 Scenario & Fair Value, §2]

**Sector Cycle Reality Test roll-up:** `02` and `03` both found the test **Not assessable — no sector-level multiple history**. Neither called its reference cycle-elevated or cycle-depressed, neither emitted `RF-VAL-001` or `RF-VAL-002`, and there is no same-direction compounding cap. The absence still matters: BURL's old multiple band and today's peer median cannot be treated as stable, independent anchors. [Valuation 02 Own History, §5; Valuation 03 Relative Valuation, §6]

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | N | MoS, downside-to-bear (Downside-risk score), observed up/down, attractiveness + confidence | Not applied — $254.69 is pool-verified as of 2026-09-28. |
| No consensus / forward estimates | N | Valuation confidence | Not applied — NTM EPS and EBITDA are available. |
| No peer data | N | Overall usefulness | Not applied — Ross and TJX matched data are available. |
| Only one valuation method usable | N | Valuation confidence | Not applied — peer valuation and DCF both produce values. |
| No cash flow AND DCF is only method | N | Valuation confidence | Not applied — cash flow is available and DCF is not the only method. |
| SOTP not possible for multi-segment | N | Overall usefulness | Not applied — BURL is single-segment, so collapse is appropriate rather than a data failure. |
| Full high-to-low field of valid value-producing methods exceeds 40% | **Y** | Valuation confidence | **Maximum 55; final score 50.** The field is $133.46–$302.88, or 126.94% of the low. |
| Terminal value >75% of DCF EV | N | Valuation confidence | Not applied — terminal value is 74.35% of DCF EV. |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | N | Valuation attractiveness | Not applied — filings show dispersed, one-share/one-vote ownership and no controller. [Management-Governance 04 Ownership & Insider Behavior, §4] |
| Sector Cycle Reality Test flags `02` and/or `03` cycle-elevated/depressed, unreconciled | N | Valuation confidence | Not applied — both tests were Not assessable and emitted no cycle tag. |

The pool price is one trading day old, so the separate stale-price cap does not apply. [Valuation 01 Price & Capital Structure, §§1 and 7]

## 5. Fair-Value Summary

The 12-month levels are **$370.63 bull, $237.01 base, and $66.31 cyclical-trough bear**; the 70%-weighted peer NTM P/E drives the base, while the 30%-weighted DCF forces a cash-conversion discount. At $254.69, the reverse-DCF implies 46.75% annual FCFF growth through FY2030 or a 13.85% EBIT margin, neither established by the earnings or business-model evidence. Margin of safety is **(7.46%)**, meaning price is above base fair value, while downside to the $66.31 bear is a separate **73.96%** loss measure. There is no controlling-owner value-trap flag, but there is multiple-reversion risk: BURL's 42/100 business quality, narrow and not yet economically proven moat, capital needs, and unavailable sector-multiple history do not justify simply restoring the old P/E band. The matched peer P/E is the method to trust most; the DCF is the necessary downside check, while own-history reversion and SOTP should receive no weight. [Business Model 07 Business Quality, §§1–4; Business Model 09 Moat, §§3–5; Valuation 02 Own History, §§4–6; Valuation 03 Relative Valuation, §§4–7; Valuation 04 Intrinsic DCF, §§6–8; Valuation 07 Scenario & Fair Value, §§2–6]

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Fairly valued — $237.01 base versus $254.69 price | A lower price while $12.06 NTM EPS and the 19.65x base-equivalent P/E remain intact, or realized cash flow begins to track above the DCF path without higher capital needs. | NTM EPS below $12.06, stalled margin gains, or capex staying near the current 6%–7% of sales range would weaken cash conversion and the warranted multiple. | **Single highest-value request:** one matched forward cash-flow dataset with consensus capex, working capital and FCFF through FY2030, including analyst counts, to test the $850.5m DCF path against the $1.641bn price-implied requirement. [Valuation 04 Intrinsic DCF, §§2–4; Valuation 05 Reverse DCF, §2] |

## 7. Note To The Final Synthesizer

- Use **$370.63 bull / $237.01 base / $66.31 cyclical-trough bear**, all on a 12-month horizon; the base is a 70% peer NTM P/E / 30% DCF blend. [Valuation 07 Scenario & Fair Value, §§2–3]
- The $254.69 price implies 46.75% annual FCFF growth through FY2030 or a 13.85% EBIT margin under the DCF conventions; neither is proven, while holding the base cash path fixed implies a 6.95% discount rate. [Valuation 05 Reverse DCF, §§2–5]
- Margin of safety is **(7.46%)** to the $237.01 base; downside to the **$66.31** bear is **73.96%**. These are separate measures. [Valuation 07 Scenario & Fair Value, §4]
- This is not a controlling-owner value trap, but simple multiple reversion is risky: the old P/E series is not admissible, sector multiple history is unavailable, and business quality is 42/100 with a narrow, not yet economically proven moat. [Management-Governance 04 Ownership & Insider Behavior, §4; Valuation 02 Own History, §§4–6; Business Model 07 Business Quality, §1; Business Model 09 Moat, §5]
- Trust the matched peer NTM P/E most; keep DCF as the conservative cash-conversion check; give no weight to own-history reversion or SOTP. [Valuation 07 Scenario & Fair Value, §§1–2]
- The 126.94% method spread applies the hard valuation-confidence cap of 55; the final score is 50. No price, consensus, peer, terminal-dominance, owner, or cycle-distortion cap applies.
- The single highest-value next input is a matched consensus capex, working-capital and FCFF dataset through FY2030 with analyst counts.
- The master synthesizer's **Valuation and Peer Mispricing** section should defer to this synthesis; the fair-value **levels** here are the inputs for the master's probability-weighted scenario model, and the master assigns the probabilities.

## 8. Simple Summary

- The $254.69 price is 7.5% above the $237.01 base value, so BURL is fairly valued on the module's rule and has no cushion.
- The 12-month levels are **$370.63 bull, $237.01 base, and $66.31 cyclical-trough bear**.
- The market price implies **46.75% annual FCFF growth through FY2030** or a **13.85% EBIT margin**; neither is proven.
- The stated bear means **73.96% downside** to $66.31.
- The direct-peer NTM P/E matters most; DCF is the downside check. Own-history reversion and SOTP get no weight.
- No controlling-owner trap is present, but old-multiple reversion may be a trap because the historical basis is disputed and sector multiple history is missing.
- A fresh, pool-verified price was available; no price-related cap applies.
- This module is useful for the master, but confidence is **50/100** because valid methods span $133.46–$302.88.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — BURL

The frozen evidence binding is valid: generation `fc90a997f0c1c57b475af85d46d5fac22d04f645a3d926655acba4ef4b26f766` declares `raw/BURL` as its raw prefix, matching the supplied capability. All 30 manifest sources have extraction status `ok`; there are no external-data documents and no failed extractions. The filesystem timestamp below is a frozen-snapshot timestamp, not an as-of date; coverage dates come from inside each source. [Extraction-generation manifest, 2026-09-29]

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| BURL_2024 Annual Report.pdf (1,091,176 B) | Annual filing | FY2024 ended 2025-02-01 | 2026-09-29 snapshot | High — audited historical financials |
| BURL_2025 Annual Report.pdf (7,643,153 B) | Annual filing | FY2025 ended 2026-01-31 | 2026-09-29 snapshot | High — latest audited financials |
| BURL_2026 Proxy Statement.pdf (5,879,186 B) | Proxy | 2026 annual meeting | 2026-09-29 snapshot | Medium — equity awards and share data |
| BURL_Q1_2026_Earnings_PR.pdf (194,784 B) | Earnings release | Q1 FY2026 ended 2026-05-02 | 2026-09-29 snapshot | High — interim earnings/guidance |
| BURL_Q2_2026_Earnings_PR.pdf (149,006 B) | Earnings release | Q2 FY2026 ended 2026-08-01 | 2026-09-29 snapshot | High — latest earnings/guidance |
| BURL_Short_Interest_Charting Excel Export - Sep 28th 2026 9_08_33 pm.xls — Pane 1 (286×3; 134,144 B) | Market-data workbook tab | Through 2026-09-28 | 2026-09-29 snapshot | Low — positioning context |
| BURL_Short_Interest_Charting Excel Export - Sep 28th 2026 9_08_33 pm.xls — Raw (0×0; 134,144 B) | Empty workbook tab | No data | 2026-09-29 snapshot | Low — empty tab, not an extraction failure |
| BURL_Short_Interest_Charting Excel Export - Sep 28th 2026 9_08_33 pm.xls — Attributions (80×2; 134,144 B) | Workbook tab | Through 2026-09-28 | 2026-09-29 snapshot | Low — source metadata |
| Burlington Stores Inc NYSE BURL Auditors.xls — Auditors (64×6; 36,864 B) | CIQ governance workbook tab | As-of date not stated inside tab | 2026-09-29 snapshot | Low |
| Burlington Stores Inc NYSE BURL Board Members.xls — Board Members (29×25; 68,608 B) | CIQ governance workbook tab | As-of date not stated inside tab | 2026-09-29 snapshot | Low |
| Burlington Stores Inc NYSE BURL Committees.xls — Committees (43×2; 42,496 B) | CIQ governance workbook tab | As-of date not stated inside tab | 2026-09-29 snapshot | Low |
| Burlington Stores Inc NYSE BURL Compensation Summary Compensation.xls — Summary Compensation (46×66; 65,024 B) | CIQ governance workbook tab | FY2025 / 2026 proxy period | 2026-09-29 snapshot | Medium — equity awards/dilution context |
| Burlington Stores Inc NYSE BURL Events Calendar.xls — Events Calendar (23×3; 31,744 B) | CIQ events workbook tab | Current/upcoming 2026 events | 2026-09-29 snapshot | Medium — catalyst dates |
| Burlington Stores Inc NYSE BURL Financials_Annual.xls — Key Stats (92×9; 225,290 B) | CIQ financials workbook tab | Annual history through FY2025 and LTM 2026-08-01 | 2026-09-29 snapshot | High |
| Burlington Stores Inc NYSE BURL Financials_Annual.xls — Income Statement (112×7; 225,290 B) | CIQ financials workbook tab | Annual history through FY2025 and LTM 2026-08-01 | 2026-09-29 snapshot | High — earnings base |
| Burlington Stores Inc NYSE BURL Financials_Annual.xls — Balance Sheet (94×7; 225,290 B) | CIQ financials workbook tab | Annual history through FY2025 | 2026-09-29 snapshot | High — capital structure |
| Burlington Stores Inc NYSE BURL Financials_Annual.xls — Cash Flow (71×7; 225,290 B) | CIQ financials workbook tab | Annual history through FY2025 and LTM 2026-08-01 | 2026-09-29 snapshot | High — DCF base |
| Burlington Stores Inc NYSE BURL Financials_Annual.xls — Multiples (91×9; 225,290 B) | CIQ financials workbook tab | Quarterly market-multiple history through 2026-09-18 | 2026-09-29 snapshot | High — own-history valuation |
| Burlington Stores Inc NYSE BURL Financials_Annual.xls — Historical Capitalization (39×7; 225,290 B) | CIQ financials workbook tab | Annual/quarterly capitalization history | 2026-09-29 snapshot | High — EV bridge history |
| Burlington Stores Inc NYSE BURL Financials_Annual.xls — Capital Structure Summary (107×7; 225,290 B) | CIQ financials workbook tab | Annual history through FY2025 | 2026-09-29 snapshot | High — debt/cash/supporting bridge |
| Burlington Stores Inc NYSE BURL Financials_Annual.xls — Capital Structure Details (34×10; 225,290 B) | CIQ financials workbook tab | Latest reported debt-detail block | 2026-09-29 snapshot | High — maturities and debt components |
| Burlington Stores Inc NYSE BURL Financials_Annual.xls — Ratios (161×7; 225,290 B) | CIQ financials workbook tab | Annual history through FY2025 and LTM 2026-08-01 | 2026-09-29 snapshot | Medium — return/cash-flow checks |
| Burlington Stores Inc NYSE BURL Financials_Annual.xls — Supplemental (68×7; 225,290 B) | CIQ financials workbook tab | Annual history through FY2025 | 2026-09-29 snapshot | Medium |
| Burlington Stores Inc NYSE BURL Financials_Annual.xls — Industry Specific (41×7; 225,290 B) | CIQ financials workbook tab | Annual history through FY2025 | 2026-09-29 snapshot | Medium — retailer operating statistics |
| Burlington Stores Inc NYSE BURL Financials_Annual.xls — Pension OPEB (21×7; 225,290 B) | CIQ financials workbook tab | Annual history through FY2025 | 2026-09-29 snapshot | Low |
| Burlington Stores Inc NYSE BURL Financials_Annual.xls — Segments (90×7; 225,290 B) | CIQ financials workbook tab | Annual history through FY2025 | 2026-09-29 snapshot | Medium — confirms single segment |
| Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Key Stats (92×9; 361,994 B) | CIQ financials workbook tab | Quarterly history through Q2 FY2026, 2026-08-01 | 2026-09-29 snapshot | High |
| Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Income Statement (108×21; 361,994 B) | CIQ financials workbook tab | Quarterly history through Q2 FY2026, 2026-08-01 | 2026-09-29 snapshot | High — LTM earnings base |
| Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Balance Sheet (93×21; 361,994 B) | CIQ financials workbook tab | Quarterly history through Q2 FY2026, 2026-08-01 | 2026-09-29 snapshot | High — latest capital structure |
| Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Cash Flow (71×21; 361,994 B) | CIQ financials workbook tab | Quarterly history through Q2 FY2026, 2026-08-01 | 2026-09-29 snapshot | High — LTM cash-flow base |
| Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Multiples (91×19; 361,994 B) | CIQ financials workbook tab | Quarterly market-multiple history through 2026-09-18 | 2026-09-29 snapshot | High — own-history valuation |
| Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Historical Capitalization (39×21; 361,994 B) | CIQ financials workbook tab | Quarterly history through Q2 FY2026 | 2026-09-29 snapshot | High — EV bridge history |
| Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Capital Structure Summary (78×41; 361,994 B) | CIQ financials workbook tab | Quarterly history through Q2 FY2026, 2026-08-01 | 2026-09-29 snapshot | High — debt/cash/supporting bridge |
| Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Capital Structure Details (34×10; 361,994 B) | CIQ financials workbook tab | Latest reported debt-detail block | 2026-09-29 snapshot | High — debt terms/maturities |
| Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Ratios (161×21; 361,994 B) | CIQ financials workbook tab | Quarterly history through Q2 FY2026, 2026-08-01 | 2026-09-29 snapshot | Medium |
| Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Supplemental (44×21; 361,994 B) | CIQ financials workbook tab | Quarterly history through Q2 FY2026 | 2026-09-29 snapshot | Medium |
| Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Industry Specific (36×21; 361,994 B) | CIQ financials workbook tab | Quarterly history through Q2 FY2026 | 2026-09-29 snapshot | Medium — retailer statistics |
| Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Pension OPEB (15×6; 361,994 B) | CIQ financials workbook tab | Latest reported periods | 2026-09-29 snapshot | Low |
| Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Segments (90×21; 361,994 B) | CIQ financials workbook tab | Quarterly history through Q2 FY2026, 2026-08-01 | 2026-09-29 snapshot | Medium — confirms single segment |
| Burlington Stores Inc NYSE BURL Investment Analysis Direct Investments.xls — Direct Investments (137×21; 110,080 B) | CIQ investments workbook tab | Latest reported investment holdings | 2026-09-29 snapshot | Low |
| Burlington Stores Inc NYSE BURL Key Developments.xls — Key Developments (51×6; 52,736 B) | CIQ events workbook tab | 2025–2026 developments | 2026-09-29 snapshot | Medium — catalysts/context |
| Burlington Stores Inc NYSE BURL Professionals.xls — Professionals (34×24; 59,392 B) | CIQ people workbook tab | As-of date not stated inside tab | 2026-09-29 snapshot | Low |
| Burlington Stores Inc NYSE BURL Public Company Profile.rtf (272,692 B) | CIQ company profile | As-of date not stated inside document | 2026-09-29 snapshot | Medium — business classification |
| Burlington Stores Inc NYSE BURL Public Ownership History.xls — History (1,018×6; 146,944 B) | CIQ ownership workbook tab | Through 2026-06-30 | 2026-09-29 snapshot | Medium — float/ownership context |
| Burlington Stores Inc NYSE BURL Public Ownership Insider Trading.xls — Insider Trading (1,385×11; 249,344 B) | CIQ ownership workbook tab | Events through 2026-08-05; open-market entries through 2026-06-22 | 2026-09-29 snapshot | Low |
| Burlington Stores Inc NYSE BURL Public Ownership Summary.rtf (292,122 B) | CIQ ownership summary | Latest ownership period through 2026-06-30 | 2026-09-29 snapshot | Medium — float/ownership context |
| Burlington Stores Inc NYSE BURL Strategic Alliances.xls — Strategic Alliances (18×5; 39,936 B) | CIQ relationships workbook tab | As-of date not stated inside tab | 2026-09-29 snapshot | Low |
| Burlington Stores Inc NYSE BURL Suppliers.rtf (210,899 B) | CIQ supplier export | Recently disclosed suppliers within prior two years | 2026-09-29 snapshot | Low — scope does not represent the full supplier base |
| Burlington Stores, Inc., Q1 2027 Earnings Call, May 28, 2026.rtf (287,744 B) | Earnings transcript | Q1 FY2026 results / 2026-05-28 | 2026-09-29 snapshot | High — guidance and assumptions |
| Burlington Stores, Inc., Q2 2027 Earnings Call, Aug 27, 2026.rtf (290,816 B) | Earnings transcript | Q2 FY2026 results / 2026-08-27 | 2026-09-29 snapshot | High — latest guidance and assumptions |
| BurlingtonStores,IncNYSEBURLEstimatesReport.xls — Consensus (477×59; 4,268,202 B) | CIQ estimates workbook tab | Current FYE 2027-01-31; forward estimates | 2026-09-29 snapshot | High — consensus and target-price data |
| BurlingtonStores,IncNYSEBURLEstimatesReport.xls — Recent Changes (265×10; 4,268,202 B) | CIQ estimates workbook tab | Current FYE 2027-01-31; recent estimate changes | 2026-09-29 snapshot | High |
| BurlingtonStores,IncNYSEBURLEstimatesReport.xls — Guidance (142×63; 4,268,202 B) | CIQ estimates workbook tab | Current FYE 2027-01-31; management guidance history | 2026-09-29 snapshot | High |
| BurlingtonStores,IncNYSEBURLEstimatesReport.xls — Multiples (21×7; 4,268,202 B) | CIQ estimates workbook tab | NTM and FY2027–FY2029 | 2026-09-29 snapshot | High — forward multiples |
| BurlingtonStores,IncNYSEBURLEstimatesReport.xls — Surprise (215×53; 4,268,202 B) | CIQ estimates workbook tab | Historical annual/quarterly surprise record | 2026-09-29 snapshot | Medium |
| BurlingtonStores,IncNYSEBURLEstimatesReport.xls — Trends (314×11; 4,268,202 B) | CIQ estimates workbook tab | Current FYE 2027-01-31; estimate trend history | 2026-09-29 snapshot | High |
| BurlingtonStores,IncNYSEBURLEstimatesReport.xls — Revisions (485×10; 4,268,202 B) | CIQ estimates workbook tab | Current FYE 2027-01-31; recent revisions | 2026-09-29 snapshot | High |
| Burlington_Stores_Inc_-_Form_10-K(Mar-19-2026).doc (5,892,097 B) | SEC Form 10-K | FY2025 ended 2026-01-31 | 2026-09-29 snapshot | High — latest audited filing |
| Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc (3,580,833 B) | SEC Form 10-Q | Q2 FY2026 ended 2026-08-01 | 2026-09-29 snapshot | High — latest interim filing |
| Burlington_Stores_Inc_-_Form_DEF_14A(Apr-02-2026).doc (16,833,985 B) | SEC DEF 14A | 2026 annual meeting | 2026-09-29 snapshot | Medium — equity awards/dilution context |
| Company Comparable Analysis Burlington Stores Inc.xls — Financial Data (50×17; 149,510 B) | CIQ comparables workbook tab | As of 2026-09-28; LTM/NTM data | 2026-09-29 snapshot | High — current price, shares, EV bridge and peer financials |
| Company Comparable Analysis Burlington Stores Inc.xls — Trading Multiples (50×9; 149,510 B) | CIQ comparables workbook tab | As of 2026-09-28; LTM/NTM multiples | 2026-09-29 snapshot | High — peer relative valuation |
| Company Comparable Analysis Burlington Stores Inc.xls — Operating Statistics (50×13; 149,510 B) | CIQ comparables workbook tab | As of 2026-09-28 | 2026-09-29 snapshot | Medium — peer operating checks |
| Company Comparable Analysis Burlington Stores Inc.xls — Business Description (44×3; 149,510 B) | CIQ comparables workbook tab | As of 2026-09-28 | 2026-09-29 snapshot | Medium — peer-set review |
| Company Comparable Analysis Burlington Stores Inc.xls — Implied Valuation (69×9; 149,510 B) | CIQ comparables workbook tab | As of 2026-09-28 | 2026-09-29 snapshot | High — relative valuation cross-check |
| Company Comparable Analysis Burlington Stores Inc.xls — Valuation Chart (32×2; 149,510 B) | CIQ comparables workbook tab | As of 2026-09-28 | 2026-09-29 snapshot | Medium — valuation visualization |
| Company Comparable Analysis Burlington Stores Inc.xls — Credit Health Panel (48×10; 149,510 B) | CIQ comparables workbook tab | As of 2026-09-28 | 2026-09-29 snapshot | Medium — debt-risk context |
| Company Comparable Analysis Burlington Stores Inc.xls — Disclaimer (26×1; 149,510 B) | CIQ comparables workbook tab | As of 2026-09-28 | 2026-09-29 snapshot | Low |
| Price_Charting Excel Export - Sep 21st 2026 4_24_31 pm.xls — Pane 1 (1,290×2; 175,616 B) | Price-history workbook tab | Through 2026-09-21 | 2026-09-29 snapshot | High — own-history price/multiple context |
| Price_Charting Excel Export - Sep 21st 2026 4_24_31 pm.xls — Raw (0×0; 175,616 B) | Empty workbook tab | No data | 2026-09-29 snapshot | Low — empty tab, not an extraction failure |
| Price_Charting Excel Export - Sep 21st 2026 4_24_31 pm.xls — Attributions (80×2; 175,616 B) | Workbook tab | Through 2026-09-21 | 2026-09-29 snapshot | Low — source metadata |

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States / New York Stock Exchange; ticker BURL | [FY2025 Form 10-K, cover] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC: Form 10-K, Form 10-Q and DEF 14A are present | [FY2025 Form 10-K, cover; Q2 FY2026 Form 10-Q, cover] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | [FY2025 Form 10-K, Report of Independent Registered Public Accounting Firm; CIQ Estimates Consensus, header] |
| Reporting currency (and scale, e.g. INR crore) | USD; financial workbook values are in millions except per-share data | [CIQ Financials Quarterly Income Statement, header] |
| Fiscal-year end | 52/53-week year ending the Saturday closest to 31 January; FY2026 ends 2027-01-30 | [Q2 FY2026 Form 10-Q, Note 1] |
| Document language(s) | English | [FY2025 Form 10-K; Q2 FY2026 Form 10-Q; extraction-generation manifest] |

Downstream agents should use the SEC documents above as the local primary source. BURL is an operating off-price retailer, not a financial, REIT, commodity producer, or holding company. [Q2 FY2026 Form 10-Q, Segment Reporting]

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | Burlington_Stores_Inc_-_Form_10-K(Mar-19-2026).doc | FY2025 ended 2026-01-31 | 8.0 |
| Quarterly filing | Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc | Q2 FY2026 ended 2026-08-01 | 1.9 |
| Capital structure / balance sheet | Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc; CIQ Financials_Quarterly — Balance Sheet | 2026-08-01 | 1.9 |
| Consensus / estimate export | BurlingtonStores,IncNYSEBURLEstimatesReport.xls — Consensus | Current FYE 2027-01-31; exact export as-of not stated inside sheet | Not assessable |
| Multiples export | Burlington Stores Inc NYSE BURL Financials_Quarterly.xls — Multiples | Through 2026-09-18 | 0.4 |
| Peer / comps export | Company Comparable Analysis Burlington Stores Inc.xls — Financial Data / Trading Multiples | 2026-09-28 | 0.0 |
| Current price (IBKR / Capital IQ) | Company Comparable Analysis Burlington Stores Inc.xls — Financial Data | 2026-09-28 | 0.0 |
| Cash flow statement | Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc; CIQ Financials_Quarterly — Cash Flow | Q2 FY2026 ended 2026-08-01 | 1.9 |
| Segment data | Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc; CIQ Financials_Quarterly — Segments | Q2 FY2026 ended 2026-08-01; one reportable segment | 1.9 |

The CIQ facts sidecar independently confirms that the price, shares outstanding, debt/cash, LTM earnings and cash-flow data, historical multiples, forward consensus, and peer multiples are present in the cited CIQ workbooks. No sidecar conflicts were reported. [ciq_facts.json, generation fc90a997f0c1c57b475af85d46d5fac22d04f645a3d926655acba4ef4b26f766]

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | [CIQ Comps Financial Data, as of 2026-09-28] | Pool-verified anchor for market cap, EV, multiples and margin of safety |
| Diluted share count | Y | [Q2 FY2026 Form 10-Q, Statements of Income / EPS disclosures; CIQ Comps Financial Data, as of 2026-09-28] | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y | [FY2025 Form 10-K, stock compensation and convertible-notes disclosures; Q2 FY2026 Form 10-Q, Convertible Notes] | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y — Operating | [Q2 FY2026 Form 10-Q, Segment Reporting] | Determines valid methods: operating-company multiples, FCFF DCF and reverse DCF |
| Total debt, cash, minority/preferred | Y | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets; CIQ Comps Financial Data, as of 2026-09-28] | Needed for the EV bridge |
| Income statement (LTM or FY) | Y | [Q2 FY2026 Form 10-Q, Condensed Consolidated Statements of Income; CIQ Financials Quarterly Income Statement, through 2026-08-01] | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | [Q2 FY2026 Form 10-Q, Condensed Consolidated Statements of Cash Flows; CIQ Financials Quarterly Cash Flow, through 2026-08-01] | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | [CIQ Estimates Consensus, current FYE 2027-01-31; CIQ Estimates Multiples] | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | [CIQ Financials Annual/Quarterly Multiples, through 2026-09-18; Price Charting Export, through 2026-09-21] | Own-history re-rating read |
| Peer / comps data | Y | [CIQ Comps Financial Data / Trading Multiples, as of 2026-09-28] | Relative valuation |
| Segment-level revenue & EBIT | Y — one reportable operating segment | [Q2 FY2026 Form 10-Q, Segment Reporting] | Confirms that SOTP collapses to consolidated valuation rather than supporting a breakup |
| Dividend / buyback data | Y | [FY2025 Form 10-K, Stockholders' Equity / Repurchase Program disclosures; Q2 FY2026 Form 10-Q, Stockholders' Equity] | Shareholder-yield and share-count context |

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

The balance-sheet-survival capital-structure output and the management-governance ownership/synthesis outputs are also available for the later valuation agents' canonical net-debt and owner-alignment reads.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N | 01, 05, 07, 99 | None — pool-verified CIQ price as of 2026-09-28 is available |
| No consensus / forward estimates | N | 02, 03, 04, 05 | None — CIQ consensus and forward-multiples tabs are available |
| No peer data | N | 03, 06 | None — dated CIQ comparable-company set is available |
| No segment-level data | N | 06 | None — filing identifies one reportable segment; SOTP is not meaningful rather than missing |
| No balance sheet / capital structure | N | 01, 04, 06 | None — Q2 filing and CIQ capital-structure tabs are available |
| No cash flow statement | N | 04 | None — Q2 filing and CIQ cash-flow tab are available |

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Dated CIQ historical-multiples series and price history are present |
| Peer relative valuation | Y | None | Dated CIQ comparable-company financial and trading-multiple tabs are present |
| Intrinsic DCF (Operating FCFF) | Y | None | Operating business with audited/interim income, cash-flow and balance-sheet data plus forward estimates |
| Reverse DCF | Y | None | Pool-verified current price, capital structure and cash-flow/forward-data inputs are present |
| SOTP | N | No multiple material segments | The filing reports one operating segment; a forced breakup would not be an independent valuation method |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The frozen pool provides a usable income-statement and cash-flow base, balance-sheet/capital-structure data, a pool-verified current price, and both forward consensus and dated peer/relative valuation inputs.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF, reverse-DCF.
- **Active partial-data caps:** None.
- **Critical missing items:** None for a multi-method valuation; SOTP is not applicable because BURL has one reportable segment.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — BURL

Burlington Stores, Inc. is a U.S. GAAP operating company. Its reporting currency is USD and its fiscal year ends on the Saturday closest to January 31. Amounts below are USD millions except per-share data and share counts. [FY2025 Form 10-K, Item 7—Fiscal Year; Q2 FY2026 Form 10-Q, Note 1—Basis of Presentation]

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| **Decision line** (ticker · venue · currency) | BURL common stock · NYSE · USD | [FY2025 Form 10-K, Item 5] | 2026-09-28 |
| Current price | **$254.69** | [Capital IQ Comps→Financial Data, “Day Close Price Latest” (subject row); CIQ facts sidecar] | 2026-09-28 |
| Currency | USD | [Capital IQ Comps→Financial Data, subject row] | 2026-09-28 |
| Price basis (last close / intraday / indicative) | Day close / last close | [Capital IQ Comps→Financial Data, “Day Close Price Latest” (subject row); CIQ facts sidecar] | 2026-09-28 |

The decision line is BURL common stock on the NYSE. It is the primary listed common line and the line on which every downstream per-share value should be stated. The price is **pool-verified**: the source-bound CIQ sidecar reports $254.69 for the September 28 close. It is one trading day old at the September 29 run date, so no price-staleness refresh or confidence cap applies. [Capital IQ Comps→Financial Data, “Day Close Price Latest” (subject row), 2026-09-28; CIQ facts sidecar]

Single listed line — no cross-line issue.

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | 62.815m at August 1, 2026; 62.8m CIQ latest at September 28, 2026 | [Q2 FY2026 Form 10-Q, cover; Capital IQ Comps→Financial Data, “Shares Outstanding Latest” (subject row), 2026-09-28; CIQ facts sidecar] |
| Diluted weighted-average shares (period) | 63.896m (Q2 FY2026 three months) | [Q2 FY2026 Form 10-Q, Statement of Operations, p.6] |
| Options/RSUs count (if disclosed) | 1.260m options; 0.653m unvested RSUs and 0.364m unvested performance share units, all at January 31, 2026 | [FY2025 Form 10-K, Notes to Consolidated Financial Statements—Share-Based Compensation] |
| Convertibles / potential shares (if disclosed) | $186.1m 2027 Convertible Notes; initial 4.8560 shares per $1,000 principal, or about 0.904m maximum conversion shares before any net-share settlement effect | [Q2 FY2026 Form 10-Q, Note 4—Long-Term Debt, pp.12–13] |
| **Fully diluted shares (TSM + if-converted)** | **63.896m diluted weighted-average proxy; current TSM/if-converted total not computable** | [Q2 FY2026 Form 10-Q, Statement of Operations, p.6] |
| Share count used for market cap | **62.8m** | [Capital IQ Comps→Financial Data, “Shares Outstanding Latest” (subject row), 2026-09-28; CIQ facts sidecar] |
| Share count used for per-share fair value | **63.896m** | [Q2 FY2026 Form 10-Q, Statement of Operations, p.6] |

The Q2 three-month diluted weighted average exceeds the Q2 basic weighted average of 62.867m by 1.029m shares (1.64%). Burlington says diluted EPS uses the treasury-stock method for options, restricted stock and RSUs, and the if-converted method for applicable convertible notes. The $254.69 September 28 close exceeds the 2027 notes’ stated initial $205.93 conversion price. Even so, the filing does not supply current option strikes, current unvested awards, or the exact net-share settlement effect needed to rebuild a September 28 treasury-stock-method and if-converted count. The 63.896m diluted weighted average is therefore the conservative per-share proxy, not a confirmed point-in-time fully diluted total. [Q2 FY2026 Form 10-Q, Statement of Operations, p.6; Note 4—Long-Term Debt, pp.12–13; Note 7—Earnings Per Share; Capital IQ Comps→Financial Data, “Day Close Price Latest,” 2026-09-28; CIQ facts sidecar]

| Share Count Reconciliation | Millions of shares | Basis |
|---|---:|---|
| Q2 FY2026 basic weighted-average shares | 62.867 | Three months ended August 1, 2026 [Q2 FY2026 Form 10-Q, Statement of Operations, p.6] |
| + Dilutive securities, aggregate | 1.029 | Diluted less basic weighted average; the filing does not split this current-period figure by instrument [Q2 FY2026 Form 10-Q, Statement of Operations, p.6; Note 7—Earnings Per Share] |
| = Diluted weighted-average proxy used for per-share values | **63.896** | Three months ended August 1, 2026 [Q2 FY2026 Form 10-Q, Statement of Operations, p.6] |

The market-cap count is the latest pool-sourced shares-outstanding read, while per-share fair-value work uses the higher diluted proxy so it does not omit known dilution. The difference in dates is a stated limitation.

## 3. Market Capitalization

`Market cap = share count × current price`

`62.8m shares × $254.69 = $15,994.5m`, or **$16.0bn** (rounded).

The price and 62.8m share count are both from the same September 28 Capital IQ subject-company snapshot, as mechanically pinned in the CIQ facts sidecar. [Capital IQ Comps→Financial Data, “Day Close Price Latest” and “Shares Outstanding Latest” (subject row), 2026-09-28; CIQ facts sidecar]

## 4. Enterprise Value Bridge

| Component | Amount | Source |
|---|---:|---|
| Market capitalization | 15,994.5 | `$254.69 × 62.8m`; [Capital IQ Comps→Financial Data, subject row, 2026-09-28; CIQ facts sidecar] |
| + Total debt (short + long term) | 1,919.5 | Financial debt: Term Loan Facility $1,711.7m + 2027 Convertible Notes $186.1m + finance leases $21.8m, before $5.9m deferred financing costs. [Q2 FY2026 Form 10-Q, pp.5, 10, 12–13, 30; balance-sheet-survival/01 Leverage Anchor Summary] |
| + Minority / non-controlling interest | 0.0 | No separately reported non-controlling interest on the condensed consolidated balance sheet. [Q2 FY2026 Form 10-Q, p.5] |
| + Preferred equity | 0.0 | No preferred shares issued or outstanding. [FY2025 Form 10-K, Note 7—Capital Stock, p.60] |
| + Operating lease liabilities (if material, optional adjustment) | 0.0 in canonical EV; 3,992.6 separately | $448.7m current + $3,543.9m long-term operating leases; excluded from the financial-debt EV bridge and shown below as an alternative. [Q2 FY2026 Form 10-Q, Note 3, pp.10–11] |
| + Underfunded pension / other long-term obligations (if material) | 0.0 adjusted | No funded defined-benefit deficit is presented in the available filing read; defined-contribution cost is not a balance-sheet obligation. [Q2 FY2026 Form 10-Q, p.5; Capital IQ Financials Annual workbook, Pension/OPEB, FY2025—vendor export] |
| − Cash & equivalents (+ ST investments) | (703.7) | [Q2 FY2026 Form 10-Q, p.5] |
| − Equity-method investments (if treated separately) | 0.0 | No separately reported equity-method investment balance. [Q2 FY2026 Form 10-Q, p.5] |
| **= Enterprise value (EV)** | **17,210.3** | `$15,994.5m + $1,919.5m − $703.7m` |

The canonical EV is **$17.210bn**. It uses the filing-based gross financial debt from `balance-sheet-survival/01`, as required, and excludes operating leases from strict debt. This is a debt-definition choice, not a statement that lease commitments are immaterial: including the $3.993bn operating-lease liability produces a separate lease-inclusive obligation view of **$21.203bn** (`$17,210.3m + $3,992.6m`). [Q2 FY2026 Form 10-Q, Note 3, pp.10–11; balance-sheet-survival/01 Leverage Anchor Summary]

The required CIQ sidecar reports $5,906.1m total debt and $5,202.4m net debt at August 1, 2026. It reconciles to the lease-inclusive vendor basis: the $3,992.6m operating-lease liability plus financial debt carried after deferred financing costs. That vendor net-debt amount is **not** broad §15 net debt, because broad debt would mean financial debt less liquid short-term investments; it is a lease-inclusive obligation measure. The filing-based strict bridge above is canonical. [CIQ Financials→Balance Sheet, “Total Debt” and “Net Debt,” Q2 2026-08-01; CIQ facts sidecar; Q2 FY2026 Form 10-Q, pp.5, 10, 12]

Cash quality: the $703.7m is cash and equivalents, with no separately reported liquid short-term investments and no separately reported restricted-cash balance. A $44.0m long-term-investment balance in the CIQ workbook is not identified as short-term or liquid, so it is not netted. [Q2 FY2026 Form 10-Q, p.5; Capital IQ Financials Annual workbook, Balance Sheet, Q2 FY2026 column—vendor export]

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | 1,919.5 | [Q2 FY2026 Form 10-Q, pp.5, 10, 12–13, 30; balance-sheet-survival/01 Leverage Anchor Summary] |
| Cash & equivalents | (703.7) | [Q2 FY2026 Form 10-Q, p.5] |
| **Net debt (strict, §15: total debt − cash & equivalents)** | **1,215.8** | `$1,919.5m − $703.7m`; [balance-sheet-survival/01 Leverage Anchor Summary] |
| − Liquid short-term investments (if netted) | 0.0 | No incremental separately reported liquid short-term investments. [Capital IQ Financials Annual workbook, Balance Sheet, Q2 FY2026 column—vendor export] |
| **Net debt (broad, incl. investments — only if used)** | **1,215.8** | Same as strict because there is no incremental liquid short-term investment balance. [balance-sheet-survival/01 Leverage Anchor Summary] |
| Net debt / latest EBITDA (label GAAP or adjusted) | 0.84x strict / $1,440.2m filing-derived GAAP EBITDA; 0.83x strict / $1,461.1m company-defined adjusted EBITDA | `$1,215.8m ÷ $1,440.2m`; `$1,215.8m ÷ $1,461.1m`. [FY2025 Form 10-K, p.29; Q2 FY2026 Form 10-Q, pp.3, 20, 29; balance-sheet-survival/01 Leverage Anchor Summary] |

“Strict” means financial debt, including finance leases, less cash and cash equivalents. It excludes the $3,992.6m operating-lease liability. The latest filing-derived EBITDA calculation and the company-defined adjusted EBITDA are not interchangeable with CIQ’s $1,360.7m LTM standard EBITDA; the CIQ measure is a vendor calculation. [Capital IQ Financials→Income Statement, EBITDA, LTM 2026-08-01; CIQ facts sidecar; balance-sheet-survival/01 Leverage Anchor Summary]

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | $31.34 | `$2,002.248m common equity ÷ 63.896m diluted-share proxy`; [Q2 FY2026 Form 10-Q, p.5; Statement of Operations, p.6] |
| Tangible book value per share | $30.60 | `($2,002.248m common equity − $47.064m goodwill) ÷ 63.896m diluted-share proxy`; no other separately carried intangible asset is shown in the Q2 balance-sheet read. [Q2 FY2026 Form 10-Q, p.5] |
| Net debt per share | $19.03 net debt | `$1,215.8m strict net debt ÷ 63.896m diluted-share proxy`; [balance-sheet-survival/01 Leverage Anchor Summary; Q2 FY2026 Form 10-Q, p.5] |

## 7. Anchor Summary (canonical numbers for downstream agents)

- Current price: **$254.69** at the September 28, 2026 NYSE close. [Capital IQ Comps→Financial Data, “Day Close Price Latest” (subject row), 2026-09-28; CIQ facts sidecar]
- Share counts: **62.8m** for market cap (CIQ latest, September 28); **63.896m** diluted weighted-average proxy for per-share fair value (Q2 FY2026). [Capital IQ Comps→Financial Data, “Shares Outstanding Latest,” 2026-09-28; Q2 FY2026 Form 10-Q, p.6; CIQ facts sidecar]
- Market cap: **$15.995bn** (`$254.69 × 62.8m`).
- Enterprise value: **$17.210bn**, using $1.9195bn financial gross debt and $0.7037bn cash.
- Net debt: **$1.216bn strict §15 basis**; broad net debt is also $1.216bn because there is no incremental liquid short-term-investment balance. [balance-sheet-survival/01 Leverage Anchor Summary]
- Reporting currency: **USD**.

`balance-sheet-survival/01` ran and its filing-based canonical strict net debt is used. It differs from CIQ’s $5.202bn lease-inclusive vendor net-debt measure because CIQ includes the $3.993bn operating-lease liability; the difference is reconciled above rather than silently substituted. [CIQ facts sidecar; Q2 FY2026 Form 10-Q, Note 3, pp.10–11; balance-sheet-survival/01 Leverage Anchor Summary]

### Anchor Block (copy-forward)

- Decision line: **BURL · NYSE · USD** — every downstream fair value, margin of safety, and yield is on this line. Single listed line.
- Other listed lines: **None**.
- Price: **$254.69** (2026-09-28, NYSE day close).
- Price-state: **pool-verified** — the canonical tag `05`/`07`/`99` read.
- Currency: **USD**.
- Distribution basis: **none quoted** — BURL has not declared, and does not expect to declare in the near term, a common-stock dividend. [FY2025 Form 10-K, Item 5—Dividends]
- Shares (market cap): **62.8m** (Capital IQ Comps→Financial Data, 2026-09-28; CIQ facts sidecar).
- Shares (per-share fair value): **63.896m** (Q2 FY2026 diluted weighted-average shares; proxy because a current TSM/if-converted rebuild is not possible from the admitted disclosures).
- Market cap: **$15.995bn**.
- Net debt: **$1.216bn** (strict basis; filing-based `balance-sheet-survival/01` canonical figure; reconciled against CIQ’s $5.202bn lease-inclusive vendor measure).
- EV: **$17.210bn** (financial-debt bridge); **$21.203bn** in the separately labelled lease-inclusive obligation view.
- Key caveats: operating-lease liabilities are a material $3.993bn separate fixed commitment; fully diluted shares are a Q2 weighted-average proxy; the pool price is one trading day old and does not require a staleness cap.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — BURL

Burlington Stores, Inc. is a U.S. GAAP operating retailer and reports in USD. Fiscal periods are 52/53-week years ending near January 31. The $254.69 NYSE close (September 28, 2026), $17.210bn enterprise value (EV, the value of equity plus financial debt less cash), $1.216bn strict net debt and 63.896m diluted-share proxy below are inherited verbatim from `01_price-and-capital-structure`. The canonical EV excludes the separately disclosed $3.993bn operating-lease liability; this matters when comparing it with Capital IQ's vendor EV series. [valuation/01 Price & Capital Structure, Anchor Summary; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, pp.5, 10–13]

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E | LTM diluted GAAP EPS | $11.13 / share | 22.88x | `$254.69 ÷ $11.13`; [valuation/01 Price & Capital Structure, Anchor Summary; data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data, subject row, 2026-09-28] |
| EV / EBITDA | LTM; Capital IQ standard EBITDA, not a GAAP subtotal | $1,360.7m | 12.65x | `$17,210.3m ÷ $1,360.7m`; [valuation/01 Price & Capital Structure, Anchor Summary; data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Income Statement, LTM to 2026-08-01; ciq_facts.json, LTM EBITDA] |
| EV / EBIT | LTM; Capital IQ operating-income calculation | $951.6m | 18.09x | `$17,210.3m ÷ $951.6m`; [valuation/01 Price & Capital Structure, Anchor Summary; data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data, subject row, 2026-09-28] |
| EV / Sales | LTM reported net sales | $12,198.6m | 1.41x | `$17,210.3m ÷ $12,198.6m`; [valuation/01 Price & Capital Structure, Anchor Summary; data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Income Statement, LTM to 2026-08-01] |
| P / Book | Latest book value per diluted-share proxy | $31.34 / share | 8.13x | `$254.69 ÷ $31.34`; [valuation/01 Price & Capital Structure, §6] |
| P / FCF / FCF yield | LTM normalised operating FCF | $357.0m | 44.80x / 2.23% | `$15,994.5m ÷ $357.0m`; normalised FCF = reported $412.5m less the $55.5m tariff-refund benefit. [earnings/06 Earnings Quality, §1; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, p.20] |
| Dividend yield | Trailing and forward | $0 declared | 0.0% | Burlington has not declared, and does not expect to declare in the near term, a common-stock dividend. [data/BURL/Burlington_Stores_Inc_-_Form_10-K(Mar-19-2026).doc, Item 5—Dividends] |

The LTM FCF yield uses the conservative, normalised cash figure. Reported LTM FCF would instead give a 2.58% yield (`$412.5m ÷ $15,994.5m`), but the $55.5m refund is not a recurring operating input. [earnings/06 Earnings Quality, §§1 and 10; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, p.20]

**Capital IQ reconciliation.** The source-bound sidecar reports its latest historical `TEV/LTM EBITDA` close as **8.5x** at September 18, 2026 and its `P/LTM EPS` close as **21.3x**; those are the authoritative vendor reads and are not overwritten here. But the canonical strict-debt EV produces 12.65x on the same vendor LTM EBITDA. Separately, the CIQ comparable-company sheet gives a lease-inclusive TEV of $21.201bn and LTM EBITDA of $1.361bn, whose visible arithmetic is 15.58x, while its Trading Multiples sheet prints 9.0x. The 8.5x/9.0x figures therefore cannot be reconciled to either disclosed EV bridge from the frozen workbook. This is an unresolved vendor-definition or extraction-basis gap, not a reason to substitute a preferred number silently. [ciq_facts.json, `ev_ebitda_current_x`; data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet, latest Close; data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data and Trading Multiples, subject row, 2026-09-28]

## 2. Historical Multiple Bands (3–5 years)

The bands use the 16 quarterly `Close` observations from September 30, 2022 through June 30, 2026. The September 18, 2026 CIQ observation is shown separately as the vendor-current comparison and is excluded from the historical statistics. Percentile of range is `(current − historical minimum) ÷ (historical maximum − historical minimum)`, capped at 0%/100% if outside the range.

| Multiple | Min | Mean | Median | Max | Current | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| P / E | 28.51x | 40.95x | 39.40x | 81.01x | 22.88x anchor / 21.31x CIQ | Below range / 0% |
| EV / EBITDA | 8.27x | 10.83x | 11.12x | 13.23x | 12.65x canonical / 8.54x CIQ | 88% / 6% — not comparable |
| EV / EBIT | 25.18x | 31.56x | 30.80x | 47.16x | 18.09x canonical / 21.12x CIQ | Below range / 0% |
| EV / Sales | 1.27x | 1.72x | 1.76x | 1.98x | 1.41x canonical / 1.50x CIQ | 20% / 33% |

[data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet, `Close` rows for the 16 historical quarter-end columns and September 18, 2026 latest column; ciq_facts.json, `range_position`, `ev_ebitda_percentile`, `pe_ltm_current_x`]

The anchor-current figures use the strict-debt EV and September 28 price required by `01`; the CIQ-current figures use the vendor series' September 18 close. The 10-day price-date difference explains part of the P/E and EV/Sales gap, but it does not explain the EV/EBITDA identity failure described in §1. Historical `Multiples` is also labelled “Dilution: Basic,” whereas the anchor P/E uses diluted LTM EPS; this is a stated basis limitation on the P/E reversion read. [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet, header; valuation/01 Price & Capital Structure, §§1, 4 and 7]

## 3. Re-Rating / De-Rating Read

On the least-disputed equity-side measure, the anchor P/E of 22.88x is **44.1% below** its own 40.95x mean and **41.9% below** its 39.40x median: `(22.88 ÷ 40.95) − 1` and `(22.88 ÷ 39.40) − 1`. It is below the lowest one of the 16 historical closes, 28.51x. EV/Sales is also lower: 1.41x is **18.1% below** its 1.72x mean and **19.9% below** its 1.76x median. [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet, `Close` rows; valuation/01 Price & Capital Structure, Anchor Summary; earnings/01 Historical Financials, §2]

This is a de-rating versus BURL's own recorded P/E and EV/Sales history, not proof that the market is wrong. *Inference, not from filings:* the lower multiple is consistent with a mixed-quality, discretionary retail model: business quality is scored 42/100, current reported Q2 gross margin included a $55.5m tariff refund that management plans to reinvest, and the store/supply-chain build consumes substantial capital. The evidence does not establish that the old P/E premium remains warranted. [business-model/07 Business Quality, §§1–4; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, p.20; data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Outlook]

EV/EBIT also sits below its recorded range, but it is not independent confirmation. EV/EBITDA cannot be used in this read because its 8.54x vendor series close conflicts materially with both the canonical 12.65x calculation and the CIQ comparable-sheet arithmetic in §1. [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet, `Close` rows; data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data and Trading Multiples, 2026-09-28]

## 4. Implied Value from Reversion

The required own-history base point is a **mechanical sensitivity, not an admissible fair-value input**: **$438.53 per share**, the 39.40x historical-median P/E applied to current $11.13 diluted LTM EPS. It is named because P/E has no EV bridge, but it still carries the basic-versus-diluted-history limitation. `07_scenario-and-fair-value` should not weight it as a clean base case unless it first resolves the vendor-basis conflicts and concludes that the historic P/E is warranted by current business quality. [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet, `Close` P/E rows; valuation/01 Price & Capital Structure, Anchor Summary; earnings/01 Historical Financials, §2]

| Multiple | Reversion Target (mean / median) | Implied EV or Equity | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| P / E | 40.95x / 39.40x | Equity $29.120bn / $28.020bn | $455.74 / **$438.53** | +78.9% / +72.2% |
| EV / Sales | 1.72x / 1.76x | EV $21.017bn / $21.473bn; equity $19.801bn / $20.257bn | $309.89 / $317.03 | +21.7% / +24.5% |

P/E arithmetic is `multiple × $11.13 EPS`; implied equity is then price × 63.896m diluted shares. EV/Sales arithmetic is `multiple × $12,198.6m LTM sales`; implied equity is EV less $1.216bn **strict** net debt, divided by 63.896m diluted shares. The median points across the two mechanically usable multiples span **$317.03–$438.53**, a $121.50 or 38.3%-of-low dispersion, rather than a corroborated range. [valuation/01 Price & Capital Structure, Anchor Summary; earnings/01 Historical Financials, §2; data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet]

EV/EBITDA and EV/EBIT are deliberately excluded from the reversion table. Applying their vendor historical bands to strict-debt EV would silently mix the strict anchor with a vendor TEV basis; for EV/EBITDA, the reported current vendor multiple additionally fails the basic numerator/denominator identity. The reversion also assumes that the multiple was not structurally changed by quality, cyclicality, capital needs, or the current tariff-refund effect. Available business-model and earnings evidence does not prove that assumption. [valuation/01 Price & Capital Structure, §§4–5; business-model/07 Business Quality, §4; earnings/06 Earnings Quality, §10]

## 5. Sector Cycle Reality Test

**Not assessable — no sector-level multiple history.** The frozen pool has BURL's own multiple series and a one-date peer snapshot, but no dated retail-sector P/E or EV/EBITDA series. As a limited price-only context, the SPDR S&P Retail ETF (XRT) rose from $56.59 on September 30, 2022 to $82.70 on September 28, 2026, or 46.1%; that return cannot distinguish earnings growth from a sector-multiple expansion and is therefore not evidence that BURL's own band is cycle-elevated or cycle-depressed. No `RF-VAL-001` or `RF-VAL-002` tag is warranted. [Web: FinanceCharts, XRT weekly close 2022-09-30 (indicative, unverified); Web: Stock Analysis, XRT close 2026-09-28 (indicative, unverified)]

## 6. Own-History Read

P/E and EV/Sales both place BURL below their recorded four-year ranges, but they produce materially different mechanical median values: $438.53 and $317.03 per share. The single biggest caveat is the unresolved Capital IQ enterprise-value basis: its historical EV/EBITDA close is 8.54x while the strict anchor yields 12.65x and its own comparable sheet does not reproduce either figure. Reversion to the historic P/E mean is not a clean base case until that data issue, the basic-versus-diluted P/E basis, the sector-cycle gap, and the case for a continuing historic multiple are resolved. [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Multiples sheet; data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data and Trading Multiples, 2026-09-28; valuation/01 Price & Capital Structure, Anchor Summary]



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — BURL

All amounts are USD. Burlington Stores, Inc. is an operating company; the decision line is BURL common stock on the NYSE. The pool-verified close was $254.69 on 2026-09-28, and per-share work below uses the 63.896m diluted weighted-average-share proxy required by the valuation anchor. [Price & Capital Structure — BURL, 2026-09-29, §§1–2]

## 1. Peer Set

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Ross Stores, Inc. | NasdaqGS: ROST | U.S. off-price apparel and home-fashion retailer; it operates Ross Dress for Less and dd’s DISCOUNTS, the closest same-format national competitor. | [Competitive Map — BURL, 2026-09-29, §2] |
| The TJX Companies, Inc. | NYSE: TJX | Its U.S. Marmaxx business (T.J. Maxx, Marshalls and Sierra) competes in off-price apparel and home fashions, albeit at much larger scale and within an international group. | [Competitive Map — BURL, 2026-09-29, §2] |

This is the competitive-map peer set, not a self-selected broad apparel-retail basket. The Capital IQ export also lists Gap, Victoria’s Secret, Urban Outfitters, American Eagle, Abercrombie, Five Below and Target, but their branded, specialty, value, department-store, or food/general-merchandise models are less direct matches. No private peer is included in the public-multiple median. Burlington’s own filing describes a wider competitive field but does not name individual rivals. [Competitive Map — BURL, 2026-09-29, §§2, 4]

## 2. Peer Multiples & Operating Stats

All populated multiple, revenue-growth and margin cells below are Capital IQ vendor data from the same `Company Comparable Analysis Burlington Stores Inc.xls` snapshot, so the numerator/denominator basis is matched across the three companies. P/E is LTM diluted EPS before extra items; EV multiples are LTM total-enterprise-value multiples unless marked NTM. The comp snapshot is 2026-09-28; the latest underlying income-statement filing dates are 2026-09-01 for Ross, 2026-08-28 for TJX and 2026-08-27 for BURL. [data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Trading Multiples / Financial Data / Operating Statistics, as of 2026-09-28]

| Company | P/E | EV/EBITDA | EV/EBIT | EV/Sales | FCF Yield | Rev Growth | EBITDA Margin | ROIC | Net Debt/EBITDA | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| BURL | 22.9x | 9.0x | 22.3x | 1.7x | 2.6%* | 10.9% | 11.1% | 7.8%† | 3.82x‡ | 2026-09-28 |
| Ross | 28.6x | 15.7x | 24.3x | 3.1x | Not supplied | 14.0% | 14.9% | Not supplied | 0.12x‡ | 2026-09-28 |
| TJX | 24.1x | 11.8x | 20.0x | 2.4x | Not supplied | 7.7% | 14.3% | Not supplied | 0.93x‡ | 2026-09-28 |
| **Peer median** | **26.4x** | **13.8x** | **22.2x** | **2.75x** | **Not assessable** | **10.8%** | **14.6%** | **Not assessable** | **0.53x** | 2026-09-28 |

With two direct peers, each arithmetic mean equals the median/midpoint shown above. FCF yield is not comparable: the peer export supplies no peer cash-flow values. BURL’s 2.6% is operating FCF yield, calculated as $412.5m TTM CFO minus total capex, divided by the $15.995bn market capitalization; it is not CIQ’s $107.4m levered-FCF field. [Historical Financials — BURL, 2026-09-29, §§1, 6; Price & Capital Structure — BURL, 2026-09-29, §3; CIQ Financials→Cash Flow, Levered Free Cash Flow, LTM 2026-08-01]

† BURL’s 7.8% LTM ROIC is a CIQ vendor read; the peer material supplies Ross and TJX ROE, not same-basis ROIC, so those cells are deliberately not inferred. [CIQ Financials→Income Statement + Ratios, multi-year columns, retrieved 2026-09-29; Moat — BURL, 2026-09-29, §§3–4]

‡ These ratios are derived from the comparable export’s `LTM Net Debt ÷ LTM EBITDA` fields: Ross $451.0m / $3,657.1m, TJX $8,313.0m / $8,903.0m, and BURL $5,202.4m / $1,360.7m. They are CIQ vendor-basis ratios, not BURL’s canonical strict net-debt measure. For BURL, the deterministic CIQ sidecar reports 3.82x as present; its lease-inclusive vendor net debt differs from the $1.216bn strict filing-based net debt, or 0.84x of filing-derived EBITDA. [data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data, as of 2026-09-28; CIQ Financials→Balance Sheet / Income Statement, Q2 and LTM 2026-08-01; Price & Capital Structure — BURL, 2026-09-29, §§4–5]

**CIQ reconciliation.** The source-bound sidecar reports BURL at 8.5x LTM EV/EBITDA and 21.3x LTM P/E in the separate CIQ Financials multiples workbook, while the matched Comp workbook used in the table reports 9.0x and 22.9x. The 5.9% and 7.5% gaps are material data-vendor/workbook differences, so they are flagged rather than blended. This peer analysis uses the matched Comp workbook for both BURL and peers. The sidecar’s stated 7.1x peer EV/EBITDA median is the export’s broad ten-name basket; this report’s 13.75x is the two-name direct off-price median. [CIQ Financials→Multiples, latest close; CIQ Comps→Trading Multiples, as of 2026-09-28; `ciq_facts.json`, `ev_ebitda_current_x`, `pe_ltm_current_x`, and `peer_ev_ebitda` — status present]

## 3. Premium / Discount to Peer Median

For price multiples, `premium / (discount) = (BURL multiple − peer median) / peer median`. The first four rows are LTM; the last two use matched NTM Capital IQ estimates. No yield gap is shown because peer FCF yields are unavailable.

| Multiple | Company | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| LTM P/E | 22.9x | 26.4x | (13.1%) discount |
| LTM EV/EBITDA | 9.0x | 13.8x | (34.5%) discount |
| LTM EV/EBIT | 22.3x | 22.2x | 0.7% premium |
| LTM EV/Sales | 1.7x | 2.75x | (38.2%) discount |
| NTM P/E | 21.12x | 25.93x | (18.5%) discount |
| NTM EV/EBITDA | 13.75x | 17.70x | (22.3%) discount |

[data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Trading Multiples, as of 2026-09-28]

**Is the gap typical or unusual?** Not assessable — the admitted snapshot contains no three-year history of the same BURL-versus-ROST/TJX multiple gap. BURL’s own historical multiple record would not answer this peer-relative question.

## 4. Is the Gap Warranted?

**Conclusion: discount is too deep (relative upside), but only after retaining a 10% warranted discount.** BURL’s 11.1% LTM EBITDA margin is 350bp below the direct-peer median of 14.6%, but that lower margin already reduces BURL’s EBITDA and EPS denominators; it is therefore not a reason to cut an EV/EBITDA or P/E multiple again. [data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Operating Statistics, as of 2026-09-28]

The remaining risk is durability rather than margin: BURL’s business-quality score is 42/100, its moat is judged narrow and not yet proven economically, and its CIQ vendor-basis net-debt/EBITDA is 3.82x versus the direct-peer median of 0.53x. The strict filing-based BURL ratio is only 0.84x, so the vendor obligation measure is not evidence of a near-term solvency issue; it does, however, make the EV-basis comparison sensitive to lease treatment. [Business Quality — BURL, 2026-09-29, §§2, 4; Moat — BURL, 2026-09-29, §§3–5; Price & Capital Structure — BURL, 2026-09-29, §5]

BURL’s vendor long-term EPS-growth input is 16.95%, above Ross’s 14.62% and TJX’s 9.94% (peer midpoint 12.28%), which partly offsets the durability gap. [data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Operating Statistics, as of 2026-09-28]

I therefore retain a 10% discount to the direct-peer forward P/E and EV/EBITDA medians for durability and capital-structure uncertainty. This is judgment informed by the cited evidence, not an empirical frequency and not a margin-ratio haircut. It leaves a 10% warranted gap, while the observed 18.5% NTM P/E gap is 8.5 percentage points wider.

## 5. Implied Value from Peer Multiples

The base-case point is the NTM P/E result because it applies a matched forward equity multiple to matched forward EPS and avoids an EV bridge dominated by different retailer lease-accounting treatments. Forward inputs are BURL NTM EPS of $12.06 and NTM EBITDA of $1,541.89m. [data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data, as of 2026-09-28]

| Multiple | Applied Peer Multiple | Implied EV or Equity | Implied Price/Share | vs Current Price |
|---|---:|---:|---:|---:|
| NTM P/E | 25.925x median × 90% = **23.333x** | Equity: $17,979.7m | **$281.39** | **+10.5%** |
| NTM EV/EBITDA | 17.695x median × 90% = **15.926x** | EV: $24,555.4m; equity: $19,353.0m | **$302.88** | **+18.9%** |

NTM P/E arithmetic: `$12.06 × 23.333x = $281.39` per share. The EV/EBITDA cross-check is `$1,541.89m × 15.926x = $24,555.4m EV`; less $5,202.4m CIQ vendor-basis net debt; divided by 63.896m diluted-share proxy = $302.88. This explicit EV bridge is an exception to the canonical strict-debt anchor: the CIQ TEV multiple itself uses the lease-inclusive vendor framework, so using $1.216bn strict net debt would mismatch the multiple. It is a supporting check, not the base point. [data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Trading Multiples / Financial Data, as of 2026-09-28; CIQ Financials→Balance Sheet, Net Debt, Q2 2026-08-01; Price & Capital Structure — BURL, 2026-09-29, §§2, 4]

**Base-case implied value: $281.39 per share from NTM P/E.** The peer-method dispersion is **$281.39–$302.88 per share**; it is a cross-method spread, not a bull/bear range. Both are calculated against the $254.69 pool-verified close. [Price & Capital Structure — BURL, 2026-09-29, §1]

**Quality-adjustment ledger**

| Multiple adjusted | Peer median | Adjusted to | Gap already in the denominator? | What the extra adjustment pays for | How it was sized |
|---|---:|---:|---|---|---|
| NTM P/E | 25.925x | 23.333x | Yes — EPS already contains the lower margin | Narrow/not-yet-proven economic moat, mixed business quality, and vendor lease-inclusive obligation uncertainty; **not** lower margin | 10% judgment discount, leaving BURL below the direct-peer median; informed by 42/100 quality, narrow-moat read and 3.82x versus 0.53x vendor net-debt/EBITDA |
| NTM EV/EBITDA | 17.695x | 15.926x | Yes — EBITDA already contains the lower margin | Same durability and capital-structure uncertainty; **not** lower margin | Same 10% judgment discount for a consistent forward-multiple cross-check |

The unadjusted direct-peer NTM P/E would imply $312.65 per share. It is not used as the base point because the qualitative and lease-basis risks above are separate from BURL’s lower reported earnings and are not demonstrated to deserve full parity. [data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Trading Multiples / Financial Data, as of 2026-09-28; Business Quality — BURL, 2026-09-29, §2; Moat — BURL, 2026-09-29, §5]

## 6. Sector Cycle Reality Test

**Not assessable — no sector-level multiple history.** The direct-peer Capital IQ export is a single 2026-09-28 multiple snapshot. The available web retail proxy, XRT, reports current FY1 P/E of 13.76x and a 3-year annualized S&P Retail Select Industry Index return of 11.89% as of 2026-08-31, but neither provides a three-to-five-year multiple series; price returns cannot separate earnings growth from a valuation change. No cycle-elevated or cycle-depressed tag is emitted. [data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Trading Multiples, as of 2026-09-28; Web: [State Street XRT fund page](https://www.ssga.com/us/en/intermediary/etfs/state-street-spdr-sp-retail-etf-xrt), accessed 2026-09-29, unverified]

## 7. Relative Read

Against the two direct off-price peers, BURL’s 21.12x NTM P/E is 18.5% below the 25.93x median. Retaining a 10% warranted discount for durability and capital-structure uncertainty produces the $281.39 base point, or 10.5% above the $254.69 close; the EV/EBITDA cross-check is $302.88 but depends on the lease-inclusive vendor bridge.

The peer FCF-yield comparison and the sector-multiple-history test are unavailable. The observed gap is therefore a relative-value signal, not proof that BURL’s multiple will close.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — BURL

Burlington Stores is an operating U.S. retailer, so this is an FCFF (free cash flow to all capital providers) DCF, followed by a financial-debt EV-to-equity bridge. It is not a bank, REIT, commodity producer, or holding company. The reporting currency is USD and the fiscal year ends on the Saturday closest to January 31. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Note 1 and Segment Reporting]

## 1. FCF Base & Normalizations

Base period is the latest twelve months to August 1, 2026; all amounts are USD millions unless stated otherwise. The DCF uses `FCFF = NOPAT + D&A − capex − ΔNWC`, rather than copying CFO minus capex, because CFO includes financing cash interest and the latest reported cash flow includes a non-recurring tariff refund.

| Item | Base-Year Value | Normalization Applied | Source |
|---|---:|---|---|
| Revenue — LTM | 12,198.6 | None; context only, as the forecast starts with forward consensus | [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Income Statement, LTM Aug. 1 2026] |
| EBIT — LTM, CIQ standard | 951.6 | Less $55.5 tariff refund recorded in Q2 cost of sales gives $896.1m normalized operating reference. The refund is not assumed to recur. | [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Income Statement, LTM Aug. 1 2026; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, MD&A—Tariff Refunds] |
| CFO — LTM | 1,415.5 | Vendor cash-from-operations read reconciles to the CIQ facts sidecar; not used as unlevered FCF. | [CIQ Financials→Cash Flow ‘Cash from Ops.’, LTM Aug. 1 2026; ciq_facts.json] |
| Capex — LTM cash paid for property and equipment | (1,002.9) | None | [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Cash Flow, LTM Aug. 1 2026] |
| Reported FCF — CFO less capex | 412.5 | Reported, levered operating-cash read; it is not the DCF FCFF base. | [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Cash Flow, LTM Aug. 1 2026] |
| Tariff-refund normalization | (55.5) | Conservative full-cash subtraction. The filing says Q2 operating cash flow benefited by $55.5m but does not separately disclose timing. | [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, MD&A—Liquidity and Capital Resources] |
| Normalized operating FCF | 357.0 | `412.5 − 55.5`; a cash-flow cross-check, not the FCFF valuation input. | [data/BURL/Burlington Stores Inc NYSE BURL Financials_Quarterly.xls, Cash Flow, LTM Aug. 1 2026; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, MD&A—Tariff Refunds] |
| Operating NWC at FY2025 end | 145.0 | `receivables 111.2 + inventory 1,414.8 + prepaid/other 300.0 − payables 1,024.3 − other current liabilities 656.7`; cash, financial debt and operating-lease liabilities are excluded. This is 1.253% of FY2025 revenue and is the revenue-linked forecast driver. | [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Condensed Consolidated Balance Sheets, Jan. 31 2026 column] |
| Normalized tax rate | 25.3% | Local normalization: simple average of FY2024 25.4% and FY2025 25.2%. It excludes the lower interim rate, which the Q2 filing attributes partly to purchased federal energy tax credits. The moat output’s economic test was *Not assessable*, so it did not supply a canonical cross-module NOPAT rate. | [data/BURL/BURL_2025-Annual-Report.txt, MD&A—Income Taxes; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Note 7—Income Taxes] |

The CIQ facts sidecar confirms LTM CFO of $1,415.5m and separately labels its $107.4m levered FCF as after-interest, so that smaller vendor measure is not substituted for CFO less capex. [CIQ Financials→Cash Flow ‘Cash from Ops.’ and ‘Levered Free Cash Flow’, LTM Aug. 1 2026; ciq_facts.json]

## 2. Forecast Assumptions

Company fiscal years are used below: FY2026 ends January 30, 2027. CIQ labels the same year FY2027. Forecast revenue, EBIT and EBITDA for FY2026–FY2028 are the source-bound CIQ consensus workbook read; the later years are analyst assumptions, not company guidance. The FY2026 revenue and capex assumptions also sit inside management’s +10% to +11% sales guidance and about $875m capex, net of landlord allowances. [data/BURL/BurlingtonStores,IncNYSEBURLEstimatesReport.xls, Consensus sheet, company-level FY2027–FY2029; data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Outlook, 2026-08-27]

| Assumption | FY2026 | FY2027 | FY2028 | FY2029 | FY2030 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | 10.9% (CIQ consensus) | 8.9% (CIQ consensus) | 10.3% (CIQ consensus) | 5.0% (analyst assumption) | 4.0% (analyst assumption) | 2.5% (analyst assumption) | CIQ revenue consensus is $12,828.7m / $13,975.1m / $15,420.0m for FY2026–FY2028. Terminal growth is below CBO’s 2.7%–5.1% nominal-GDP range for 2036 and consistent with a mature U.S. retailer, not a company forecast. [data/BURL/BurlingtonStores,IncNYSEBURLEstimatesReport.xls, Consensus sheet; Web: CBO Budget and Economic Outlook 2026–2036, published 2026, unverified] |
| EBIT margin % | 8.10% (CIQ consensus) | 8.42% (CIQ consensus) | 8.97% (CIQ consensus) | 9.00% (analyst assumption) | 9.00% (analyst assumption) | 9.00%, then ROIC fades to WACC (analyst assumption) | The first three values are CIQ EBIT ÷ CIQ revenue. A 9.0% terminal margin is only modestly above FY2028 consensus, but above BURL’s 7.8% LTM CIQ EBIT margin and below the 12.2%–12.7% peer EBIT margins reported for TJX and Ross. [data/BURL/BurlingtonStores,IncNYSEBURLEstimatesReport.xls, Consensus sheet; analyses/BURL_2026-09-29/business-model/09_moat.md, §3] |
| Tax rate % | 25.3% (analyst normalization) | 25.3% (analyst normalization) | 25.3% (analyst normalization) | 25.3% (analyst normalization) | 25.3% (analyst normalization) | 25.3% (analyst normalization) | Local normalized rate described in §1; it removes the Q2 purchased-energy-credit effect. [data/BURL/BURL_2025-Annual-Report.txt, MD&A—Income Taxes; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Note 7—Income Taxes] |
| D&A (% of revenue) | 3.65% (CIQ consensus) | 3.78% (CIQ consensus) | 4.00% (CIQ consensus) | 4.00% (analyst assumption) | 4.00% (analyst assumption) | 4.00% (analyst assumption) | Derived as CIQ EBITDA less CIQ EBIT for FY2026–FY2028; held thereafter. New stores and supply-chain infrastructure raised Q2 D&A to 3.8% of sales. [data/BURL/BurlingtonStores,IncNYSEBURLEstimatesReport.xls, Consensus sheet; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Results of Operations] |
| Capex (% of revenue) | 6.82% (company-guided) | 6.30% (analyst assumption) | 5.80% (analyst assumption) | 5.50% (analyst assumption) | 5.62% (analyst assumption) | 5.62% (analyst assumption) | FY2026 is management’s $875m, net of landlord allowances. The terminal ratio is set so reinvestment finances 2.5% growth at a terminal ROIC equal to WACC; it does not assume excess returns forever. [data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Outlook, 2026-08-27] |
| Operating NWC (% of revenue) | 1.253% (analyst assumption) | 1.253% (analyst assumption) | 1.253% (analyst assumption) | 1.253% (analyst assumption) | 1.253% (analyst assumption) | 1.253% (analyst assumption) | Held at the FY2025 operating-NWC/revenue ratio from the filing-based build in §1; this generates each year’s dollar change rather than holding a cash-flow amount flat. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Condensed Consolidated Balance Sheets, Jan. 31 2026 column] |

The 8.97% FY2028 CIQ EBIT margin is a vendor consensus, not a filing fact. It exceeds the company’s 7.8% LTM CIQ margin, while Q2 reported margin included a $55.5m tariff refund that management intends to reinvest over Q3 and Q4. The model therefore does not extend the refund, and its 9.0% later-year margin is an analyst assumption rather than an extrapolation of Q2’s reported margin. [CIQ Financials→Income Statement, LTM Aug. 1 2026; ciq_facts.json; data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, MD&A—Tariff Refunds]

## 3. Discount Rate (WACC)

WACC is the blended required return for debt and equity capital. The market-value weights use the canonical $15.995bn equity market capitalization and $1.920bn financial debt from `01`; operating leases stay out of this bridge because lease expense is already inside EBIT. [analyses/BURL_2026-09-29/valuation/01_price-and-capital-structure.md, §§3–5]

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 5.24% | [Web: U.S. 10-year Treasury yield, 2026-09-28, unverified] |
| Equity-risk premium | 4.14% | [Web: Damodaran implied U.S. equity-risk premium, 2026-09-01, unverified] |
| Beta | 1.42 | Five-year CIQ beta; it is above the 0.8 cyclical-business floor and is not floored. [CIQ Comparable Analysis→Operating Statistics, as of 2026-09-28; analyses/BURL_2026-09-29/business-model/09_moat.md, §3] |
| Cost of equity | 11.12% | `5.24% + 1.42 × 4.14%` |
| Pre-tax cost of debt | 4.10% | Annualized Q2 interest expense of $78.636m ÷ $1,919.5m filing-based financial debt. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Statements of Income; analyses/BURL_2026-09-29/valuation/01_price-and-capital-structure.md, §4] |
| Tax rate | 25.3% | Local normalized rate in §1. |
| Equity / debt weights | 89.28% / 10.72% | $15.995bn market capitalization / $1.920bn financial debt; weights sum to 100.00%. [analyses/BURL_2026-09-29/valuation/01_price-and-capital-structure.md, §§3–4] |
| **WACC** | **10.26%** | `w_e·k_e + w_d·k_d·(1 − t)`; executed calculation in §4. |

The low-side checks pass: cost of equity less risk-free rate is 5.88 percentage points, above the 4-point floor; beta is 1.42; and no country-risk premium is added because BURL’s cash flows are U.S.-dollar and U.S.-based. There is no discretionary WACC override. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Segment Reporting]

## 3A. Cost-of-Capital Reality Test

| Reference | Rate | Source (cite per §5) | Gap vs model WACC |
|---|---:|---|---:|
| Model WACC (CAPM build, §3) | 10.26% | This agent, §3 | — |
| Scope-matched group discount rate | Group discount rate not disclosed | No group impairment WACC or cost-of-equity rate identified in the admitted 10-K/10-Q. | N/A |
| Other disclosed rate (comparator only) | 6.2% | U.S. operating-lease weighted-average discount rate; collateralized incremental borrowing-rate input, not a group WACC or group cash-flow rate. [data/BURL/Burlington_Stores_Inc_-_Form_10-Q(Aug-27-2026).doc, Note 3—Lease Commitments] | (4.06)pp |
| Market-implied rate | Runs after this agent — reconcile in `05_reverse-dcf` | `05` inverts this model’s normalized inputs. | Pending |
| Trailing earnings yield / normalized operating-FCF yield | 4.37% / 2.23% | `$11.13 ÷ $254.69`; `$357.0m ÷ $15,994.5m`. These are equity yields, not WACC substitutes. [analyses/BURL_2026-09-29/earnings/01_historical-financials.md, §2; analyses/BURL_2026-09-29/valuation/01_price-and-capital-structure.md, §§1–3] | Not comparable |
| Peer / industry cost of capital | Not assessable | No dated peer WACC was in the admitted evidence. | N/A |

Escalation branch: not triggered. There is no scope-matched disclosed group rate, and the only filing rate is a lease incremental-borrowing comparator; the market-implied rate is sequenced to `05`.

## 4. Free Cash Flow Forecast & Discounting

Amounts are USD millions. Discounting uses the mid-year convention: each annual cash flow is discounted at `t − 0.5`, because it is assumed to arrive through the fiscal year rather than only at year-end. `ΔNWC` is calculated from the modeled NWC balance at a fixed 1.253% of revenue. It rises from $145.0m at FY2025 end to $160.8m in FY2026 and then to $211.0m in FY2030, so every `ΔNWC` is a cash use and is correctly subtracted from FCFF.

| Year | Revenue | EBIT | NOPAT | D&A | Capex | ΔWC | FCF | Discount Factor | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 12,828.7 | 1,038.7 | 775.9 | 468.7 | (875.0) | (15.8) | 353.8 | 0.952358 | 337.0 |
| FY2027 | 13,975.1 | 1,176.9 | 879.1 | 527.8 | (880.4) | (14.4) | 512.2 | 0.863775 | 442.4 |
| FY2028 | 15,420.0 | 1,383.9 | 1,033.8 | 616.2 | (894.4) | (18.1) | 737.5 | 0.783432 | 577.8 |
| FY2029 | 16,191.0 | 1,457.2 | 1,088.5 | 647.6 | (890.5) | (9.7) | 836.0 | 0.710561 | 594.0 |
| FY2030 | 16,838.6 | 1,515.5 | 1,132.1 | 673.5 | (947.0) | (8.1) | 850.5 | 0.644469 | 548.1 |

The first three revenue, EBIT and D&A rows above are CIQ consensus. FY2026 capex is company guidance; later capex, revenue and margin rows are analyst assumptions stated in §2. [data/BURL/BurlingtonStores,IncNYSEBURLEstimatesReport.xls, Consensus sheet; data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Outlook, 2026-08-27]

The executed calculation below pins the WACC assembly, discounted-FCF sum, terminal value and equity bridge. Units are USD millions except per-share value.

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
rf, erp, beta, kd, tax = .0524, .0414, 1.42, .078636/1.9195, .253
we = 15.994532/(15.994532+1.9195); wd = 1-we; ke = rf+beta*erp
wacc = we*ke + wd*kd*(1-tax)
rev = [12828.72198,13975.10768,15420.00842,16191.008841,16838.649195]
ebit = [1038.71547,1176.87207,1383.90191,.09*rev[3],.09*rev[4]]
da = [468.7047,527.82702,616.21611,.04*rev[3],.04*rev[4]]
capex = [875,.063*rev[1],.058*rev[2],.055*rev[3],.05624*rev[4]]
nwc = [11566.91*.012533] + [r*.012533 for r in rev]
fcf = [e*(1-tax)+d-c-(nwc[i+1]-nwc[i]) for i,(e,d,c) in enumerate(zip(ebit,da,capex))]
pv = [f/(1+wacc)**(i-.5) for i,f in enumerate(fcf,1)]
tv = fcf[-1]*1.025/(wacc-.025); pvtv = tv/(1+wacc)**4.5; ev = sum(pv)+pvtv
equity = ev-1215.8; per_share = equity/63.896
print(f"CAPM k_e = {rf:.4%} + {beta:.2f} x {erp:.4%} = {ke:.4%}")
print(f"k_d = annualized Q2 interest $78.636m / financial debt $1,919.5m = {kd:.4%}; after-tax k_d = {kd*(1-tax):.4%}")
print(f"weights: w_e={we:.6%}, w_d={wd:.6%}, sum={we+wd:.6%}")
print(f"WACC = {we:.6f}*{ke:.6f} + {wd:.6f}*{kd:.6f}*(1-{tax:.3f}) = {wacc:.6%}")
print(f"sanity: after-tax k_d ({kd*(1-tax):.4%}) <= WACC ({wacc:.4%}) < k_e ({ke:.4%}) = {kd*(1-tax)<=wacc<ke}")
print(f"PV explicit FCF sum = {sum(pv):.1f}")
print(f"TV = FY2030 FCF {fcf[-1]:.1f} * (1+2.50%) / ({wacc:.4%}-2.50%) = {tv:.1f}")
print(f"PV TV = {pvtv:.1f}; EV = {ev:.1f}; TV/EV={pvtv/ev:.2%}")
print(f"Equity bridge: EV {ev:.1f} - strict net debt 1215.8 - minority 0 - preferred 0 = equity {equity:.1f}; / 63.896m = ${per_share:.2f}/share")
reinvestment = (capex[-1]-da[-1]+(nwc[-1]-nwc[-2]))/(ebit[-1]*(1-tax))
print(f"Terminal reinvestment = (capex {capex[-1]:.1f} - D&A {da[-1]:.1f} + dNWC {nwc[-1]-nwc[-2]:.1f}) / NOPAT {ebit[-1]*(1-tax):.1f} = {reinvestment:.2%}")
print(f"Financeable g = terminal ROIC {wacc:.4%} * reinvestment {reinvestment:.2%} = {wacc*reinvestment:.2%}")
PY
CAPM k_e = 5.2400% + 1.42 x 4.1400% = 11.1188%
k_d = annualized Q2 interest $78.636m / financial debt $1,919.5m = 4.0967%; after-tax k_d = 3.0602%
weights: w_e=89.284936%, w_d=10.715064%, sum=100.000000%
WACC = 0.892849*0.111188 + 0.107151*0.040967*(1-0.253) = 10.255319%
sanity: after-tax k_d (3.0602%) <= WACC (10.2553%) < k_e (11.1188%) = True

PV explicit FCF sum = 2499.3
TV = FY2030 FCF 850.5 * (1+2.50%) / (10.2553%-2.50%) = 11240.6
PV TV = 7244.2; EV = 9743.5; TV/EV=74.35%
Equity bridge: EV 9743.5 - strict net debt 1215.8 - minority 0 - preferred 0 = equity 8527.7; / 63.896m = $133.46/share

Terminal reinvestment = (capex 947.0 - D&A 673.5 + dNWC 8.1) / NOPAT 1132.1 = 24.87%
Financeable g = terminal ROIC 10.2553% * reinvestment 24.87% = 2.55%
```

Sum of PV of explicit FCFs: **$2,499.3m**.

## 5. Terminal Value

- **Method and formula:** Gordon growth. `TV = FCFF_(n+1) / (WACC − g) = FCFF_n × (1 + g) / (WACC − g)`. Here: `$850.5m × 1.025 / (10.2553% − 2.5%) = $11,240.6m`.
- **Terminal growth:** 2.5% nominal USD. It is below the WACC by 7.76 percentage points and below the cited CBO long-run nominal-GDP range. [Web: CBO Budget and Economic Outlook 2026–2036, published 2026, unverified]
- **Terminal value, undiscounted:** $11,240.6m.
- **PV of terminal value:** $7,244.2m.
- **Terminal value as % of total EV:** **74.35%**. This is just below the 75% terminal-dominance cap but remains the key fragility, as shown in §7.
- **Exit-multiple cross-check:** the Gordon terminal value implies `11,240.6 ÷ (1,515.5 + 673.5) = 5.14x` FY2030 EBITDA. That is below BURL’s 8.5x current LTM EV/EBITDA and the dated 7.1x peer-set median, so the continuing value does not rely on a high mature multiple. [CIQ Financials→Multiples ‘TEV/LTM EBITDA’ close; CIQ Comps→Trading Multiples ‘TEV/EBITDA LTM—Latest’, as of 2026-09-28; ciq_facts.json]
- **Terminal excess-return treatment:** the terminal ROIC is set equal to the 10.26% WACC, not above it. The upstream moat report calls the structural moat narrow but could not establish an economic spread; the trajectory is *not assessable*, not a finding of erosion. [analyses/BURL_2026-09-29/business-model/09_moat.md, §§3–5]
- **Runoff trigger:** not generated. The moat trajectory is not assessable and the business-quality rate-of-change/disruption score is 45, above the ≤40 trigger. [analyses/BURL_2026-09-29/business-model/09_moat.md, §5; analyses/BURL_2026-09-29/business-model/07_business-quality.md, §1]

The terminal financeability check holds: terminal reinvestment is 24.87%, and 10.2553% ROIC × 24.87% reinvestment = 2.55%, close to the 2.5% terminal growth assumption. No unquantified terminal-growth bridge is required.

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFs | 2,499.3 |
| + PV of terminal value | 7,244.2 |
| **= Enterprise value** | **9,743.5** |
| − Net debt (strict basis) | (1,215.8) |
| − Minority / preferred | 0.0 |
| **= Equity value** | **8,527.7** |
| ÷ Diluted shares | 63.896m |
| **= Intrinsic value per share** | **$133.46** |
| vs current price | **$254.69; intrinsic value is 47.6% below price** |

The bridge uses the canonical $1.216bn strict net debt and 63.896m diluted weighted-average proxy from `01`, rather than the CIQ sidecar’s $5.202bn lease-inclusive vendor net-debt measure. [analyses/BURL_2026-09-29/valuation/01_price-and-capital-structure.md, §7; CIQ Financials→Balance Sheet ‘Net Debt’, Q2 Aug. 1 2026; ciq_facts.json]

## 7. Sensitivity Grid (per-share intrinsic value)

Terminal growth is down the rows and WACC across columns. All `WACC − g` gaps remain well above 0.5 percentage points, so no cell is invalid.

| | WACC −1% (9.26%) | WACC (10.26%) | WACC +1% (11.26%) |
|---|---:|---:|---:|
| g +0.5% (3.0%) | $168.23 | $141.87 | $121.90 |
| g (2.5%) | $156.68 | $133.46 | $115.57 |
| g −0.5% (2.0%) | $146.72 | $126.08 | $109.91 |

## 8. Intrinsic Read

The base-case intrinsic value is **$133.46 per BURL share**, versus a pool-verified $254.69 close on September 28, 2026; the WACC/growth grid spans **$109.91–$168.23**. The dominant assumption is not a refund-adjusted quarter: it is whether an off-price retailer can turn FY2026–FY2028 consensus EBIT growth into roughly $851m of FY2030 FCFF while still reinvesting about $947m in capex. The result is sensitive to the terminal value, which supplies 74.35% of EV, and it should be reconciled with the reverse-DCF’s market-implied return before synthesis.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — BURL

Burlington Stores is a U.S. GAAP operating retailer. Amounts below are USD millions except per-share data and percentages. This report uses the same FCFF (free cash flow to all capital providers) mechanics, financial-debt EV bridge, five-year horizon, 2.5% terminal growth and mid-year discounting convention as `04_intrinsic-dcf`; it does not estimate a standalone fair value.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $254.69 at the September 28, 2026 NYSE close; pool-verified | [Capital IQ Comps→Financial Data, “Day Close Price Latest” (subject row), 2026-09-28; CIQ facts sidecar; Valuation 01 Price & Capital Structure, §1] |
| Enterprise value | $17,210.3m | Financial-debt EV: market cap $15,994.5m + financial debt $1,919.5m − cash $703.7m. [Valuation 01 Price & Capital Structure, §4] |
| FCFF base | $353.8m, FY2026 | First explicit FCFF in `04`’s NOPAT + D&A − capex − ΔNWC model. It is the fixed starting base for the primary solve. [Valuation 04 Intrinsic DCF, §4] |
| Discount rate (WACC) used | 10.2553% | CAPM cost of equity 11.1188%, after-tax debt cost 3.0602%, and 89.28% / 10.72% equity / debt weights. [Valuation 04 Intrinsic DCF, §§3–4] |
| Terminal growth | 2.5% | Gordon-growth terminal value. [Valuation 04 Intrinsic DCF, §§2, 5] |
| Forecast horizon and convention | FY2026–FY2030; five explicit years; mid-year discounting | Cash flows are discounted at `t − 0.5`. [Valuation 04 Intrinsic DCF, §4] |

`04` also reports $357.0m normalized operating FCF and $412.5m reported CFO-minus-capex FCF for the LTM. Those are cash-flow cross-checks, not the unlevered FCFF input, so neither replaces the $353.8m FCFF base in the primary solve. [Valuation 04 Intrinsic DCF, §1]

## 2. Implied Expectations

The primary solve holds the $353.8m FY2026 FCFF base, 10.2553% WACC, 2.5% terminal growth, five-year horizon and mid-year convention fixed. It solves one variable: a constant FY2026–FY2030 FCFF growth rate. The valuation equation is:

`EV(g) = Σ[t=1..5] $353.8 × (1 + g)^(t−1) / (1 + 10.2553%)^(t−0.5) + [$353.8 × (1 + g)^4 × 1.025 / (10.2553% − 2.5%)] / (1 + 10.2553%)^4.5`.

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCFF CAGR over FY2026–FY2030 | **46.75%** |
| Implied FY2030 FCFF | **$1,640.8m** |
| Implied years of above-terminal-growth cash-flow growth | **Five of five explicit years**; the primary solve has no separate fade stage before the 2.5% terminal rate |
| Implied steady-state EBIT margin | **13.85%** in a secondary solve that holds `04`’s revenue, D&A, capex, NWC, tax, WACC, terminal growth and convention fixed, then solves for one uniform FY2026–FY2030 EBIT margin |
| PV of terminal value / implied EV | **81.21%** in the primary growth solve |

The 46.75% result produces FCFF of $353.8m, $519.2m, $761.9m, $1,118.1m and $1,640.8m across FY2026–FY2030. It is a constant-growth expression of the price, not a claim that the market literally forecasts that exact annual pattern. The secondary 13.85% margin solve is an alternative way to meet the same EV with `04`’s revenue path; if only FY2030 margin were allowed to change while the first four `04` FCFF years stayed fixed, the required FY2030 EBIT margin rises to 15.48%. Both are inference from the model, not filing facts.

The primary price-equivalent FCFF growth requires $1,640.8m in FY2030, versus $850.5m in `04`’s base path: 92.9% higher. `04`’s own FY2026–FY2030 FCFF path compounds at 24.52%, less than the 46.75% constant-growth result. [Valuation 04 Intrinsic DCF, §4]

## 2A. Implied Discount Rate — the dual solve (always run this)

The mirror solve holds `04`’s exact FCFF path of $353.8m, $512.2m, $737.5m, $836.0m and $850.5m; its 2.5% terminal growth; five-year horizon; and mid-year convention fixed. It solves for the discount rate that gives the same $17,210.3m EV.

| Solve | Held fixed | Solved value |
|---|---|---:|
| Implied discount rate at `04`’s base-case cash flows | `04` FCFF path, terminal `g`, horizon and mid-year convention | **6.95%** |
| `04`’s model WACC (for comparison) | — | **10.26%** |
| Ratio (implied ÷ model) | — | **0.677x** |

The equivalent implied rate is 3.31 percentage points below the model WACC, not more than 1.5x above it; therefore the special “market prices a collapse” escalation does not apply. This result is the input for `04` §3A: it cuts toward either cash flows above `04`’s path or a lower required return, not toward a market-implied cash-flow collapse. [Valuation 04 Intrinsic DCF, §§3A, 4]

Price cannot identify which variable is wrong. If the debt cost and capital weights were mechanically retained, a 6.95% WACC would imply a 7.41% cost of equity and a residual 1.53% equity-risk premium at the model’s 1.42 beta and 5.24% risk-free rate. That is materially below the 4.14% ERP in `04`, so the lower-rate reading is not directly supported by the available risk inputs; this is an inference, not evidence that the market actually uses a 6.95% rate. No scope-matched company discount rate was disclosed to settle the question, and the 6.2% lease rate is not a group WACC comparator. [Valuation 04 Intrinsic DCF, §§3, 3A]

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| FCFF CAGR of 46.75% over FY2026–FY2030 | FCF was $149.0m, $376.1m, ($17.0m) and $171.6m in FY2022–FY2025, then $412.5m LTM. A multi-year FCF CAGR is not meaningful because FY2024 was negative. [Earnings 01 Historical Financials, §§1–2] | `04`’s cash path reaches $850.5m in FY2030, a 24.52% FY2026–FY2030 FCFF CAGR. Earnings sensitivities identify merchandise margin/markdowns and SG&A leverage as the largest quantified quarterly variables; the $55.5m Q2 tariff refund is planned to be reinvested rather than retained. [Valuation 04 Intrinsic DCF, §4; Earnings 07 Earnings Sensitivity, §§2–6] | **Stretch — not proven from available data.** |
| Uniform EBIT margin of 13.85% through FY2026–FY2030 | BURL’s CIQ-standard EBIT margin was 7.5% in FY2025 and 7.8% LTM. [Earnings 01 Historical Financials, §§1–2] | `04` uses 8.10%, 8.42%, 8.97%, 9.00% and 9.00% EBIT margins for FY2026–FY2030. BURL’s LTM 7.8% margin is below Ross’s 12.7% and TJX’s 12.2%; the moat report does not establish a sustained economic spread. [Valuation 04 Intrinsic DCF, §2; Business Model 09 Moat, §§3–5] | **Not proven; aggressive margin requirement.** |

The 46.75% FCFF requirement is aggressive against the cash-flow record and against `04`’s already growth-heavy 24.52% FCFF path. The comparison uses the same metric where possible: unstable reported FCF means it does not claim a false historical FCF CAGR, while revenue growth is only an indirect scale check. FY2022–FY2025 revenue grew at a 9.97% CAGR and FY2025-to-LTM revenue grew 5.62%; those figures do not by themselves test FCFF growth. [Earnings 01 Historical Financials, §§1–2]

The operating evidence does show possible levers—new stores, sourcing flexibility, merchandise margin and SG&A leverage—but it does not establish five years of 46.75% FCFF compounding or a 13.85% EBIT margin. The narrower structural moat, sub-peer current EBIT margin, consumer/markdown sensitivity and material store and supply-chain reinvestment make the requirement a stretch rather than a proven base case. [Business Model 09 Moat, §§3–5; Business Model 07 Business Quality, §§1–4; Earnings 07 Earnings Sensitivity, §§2–6]

### Market-ceiling sanity check

For an operating-business scale check only, holding FY2026 FCFF conversion fixed at 2.758% of `04`’s $12,828.7m revenue turns the 46.75% FCFF solve into a $59,495.4m FY2030 revenue equivalent, 363.8% above FY2026. This is an inference, not a forecast: a higher FCFF conversion would lower the revenue required. The frozen pool contains no credible, dated off-price/apparel addressable-market size or category-revenue series, so a market-share or incremental-market capture test is **not assessable** and is not invented. [Valuation 04 Intrinsic DCF, §§2, 4]

## 4. Robustness

| Discount Rate | Implied FCFF CAGR to Justify Price |
|---|---:|
| WACC −1% (9.2553%) | 40.91% |
| WACC (10.2553%) | 46.75% |
| WACC +1% (11.2553%) | 52.20% |

| FCFF starting-point robustness | Cash-flow base | Implied FCFF CAGR to Justify Price |
|---|---:|---:|
| Low / canonical | $353.8m FY2026 FCFF | 46.75% |
| Base / normalized operating-FCF cross-check | $357.0m | 46.39% |
| High / literal CFO-minus-capex FCF | $412.5m | 40.81% |

The $357.0m and $412.5m figures are mechanically stress-tested starting cash amounts only; they have different levered/unlevered definitions and do not replace `04`’s $353.8m FCFF base. Across the specified tests, WACC is the larger driver: the ±1 percentage-point WACC range changes implied growth by 11.29 percentage points, versus 5.94 points across the stated $353.8m–$412.5m cash-flow range. [Valuation 04 Intrinsic DCF, §§1, 4]

`04`’s terminal value is 74.35% of its EV and the primary reverse-growth solve is 81.21% terminal value, so terminal-growth robustness is required.

| Terminal growth | Implied FCFF CAGR to Justify Price |
|---|---:|
| 2.0% (−0.5%) | 48.91% |
| 2.5% | 46.75% |
| 3.0% (+0.5%) | 44.47% |

The following executed bisection solver produced the primary, robustness, dual-rate and margin roots above. It uses the exact mid-year convention from `04`.

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
EV,W,g0=17210.3,.10255319,.025
F0=353.8
path=[353.8,512.2,737.5,836.0,850.5]
rev=[12828.72198,13975.10768,15420.00842,16191.008841,16838.649195]
da=[468.7047,527.82702,616.21611,.04*rev[3],.04*rev[4]]
cap=[875,.063*rev[1],.058*rev[2],.055*rev[3],.05624*rev[4]]
nwc=[11566.91*.012533]+[x*.012533 for x in rev]

def root(f,lo,hi):
    a,b=lo,hi; fa,fb=f(a),f(b)
    assert fa*fb<0,(fa,fb)
    for _ in range(250):
        m=(a+b)/2; fm=f(m)
        if fa*fm<=0:b,fb=m,fm
        else:a,fa=m,fm
    return (a+b)/2

def pvgrowth(x,w=W,b=F0,tg=g0):
    f=[b*(1+x)**i for i in range(5)]
    pv=sum(v/(1+w)**(i-.5) for i,v in enumerate(f,1))
    pvtv=f[-1]*(1+tg)/(w-tg)/(1+w)**4.5
    return pv+pvtv,pvtv,f

def pvpath(w):
    pv=sum(v/(1+w)**(i-.5) for i,v in enumerate(path,1))
    pvtv=path[-1]*(1+g0)/(w-g0)/(1+w)**4.5
    return pv+pvtv,pvtv

def pvmargin(m):
    f=[r*m*(1-.253)+d-c-(nwc[i+1]-nwc[i]) for i,(r,d,c) in enumerate(zip(rev,da,cap))]
    pv=sum(v/(1+W)**(i-.5) for i,v in enumerate(f,1))
    pvtv=f[-1]*(1+g0)/(W-g0)/(1+W)**4.5
    return pv+pvtv,pvtv,f

for name,w in [('WACC-1%',W-.01),('WACC',W),('WACC+1%',W+.01)]:
    x=root(lambda x:pvgrowth(x,w)[0]-EV,-.5,2); print(name,format(x,'.6%'))
for name,b in [('FY26_FCFF_low',353.8),('norm_operating_FCF_crosscheck',357),('reported_CFO_capex_FCF_high',412.5)]:
    x=root(lambda x:pvgrowth(x,W,b)[0]-EV,-.5,2); print(name,format(x,'.6%'))
for name,tg in [('terminal_g-0.5%',.02),('terminal_g',.025),('terminal_g+0.5%',.03)]:
    x=root(lambda x:pvgrowth(x,W,F0,tg)[0]-EV,-.5,2); print(name,format(x,'.6%'))
x=root(lambda x:pvgrowth(x)[0]-EV,-.5,2); ev,pvtv,f=pvgrowth(x)
r=root(lambda r:pvpath(r)[0]-EV,.0250001,.5)
m=root(lambda m:pvmargin(m)[0]-EV,0,.5); _,_,fm=pvmargin(m)
print('growth_root',format(x,'.10%'),'FY30_FCFF',format(f[-1],'.1f'),'TV_EV',format(pvtv/ev,'.2%'))
print('rate_root',format(r,'.10%'),'rate_ratio',format(r/W,'.3f')+'x')
print('margin_root',format(m,'.10%'),'FY30_FCFF',format(fm[-1],'.1f'))
PY
WACC-1% 40.907688%
WACC 46.748962%
WACC+1% 52.201876%
FY26_FCFF_low 46.748962%
norm_operating_FCF_crosscheck 46.394879%
reported_CFO_capex_FCF_high 40.807065%
terminal_g-0.5% 48.910327%
terminal_g 46.748962%
terminal_g+0.5% 44.472190%
growth_root 46.7489617700% FY30_FCFF 1640.8 TV_EV 81.21%
rate_root 6.9465166246% rate_ratio 0.677x
margin_root 13.8539329743% FY30_FCFF 1461.0
```

## 5. What's-Priced-In Read

At $254.69, the price requires a 46.75% FCFF CAGR from FY2026 through FY2030 on the same WACC, terminal growth and discounting convention as `04`, reaching $1.641bn of FY2030 FCFF. That is aggressive and not proven from the available data: it is 92.9% above `04`’s FY2030 FCFF path and the alternative revenue-path solve needs a 13.85% EBIT margin versus BURL’s 7.8% LTM margin. [Valuation 04 Intrinsic DCF, §§2, 4; Business Model 09 Moat, §3]

Holding `04`’s cash-flow path fixed instead reconciles the price at a 6.95% discount rate, 0.677x the model WACC, so the price reflects substantially stronger cash generation, a materially lower required return, or both; the available evidence supports neither explanation strongly enough to call the implied expectations conservative.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — BURL

Burlington Stores, Inc. reports under U.S. GAAP in USD and has a fiscal year ending on the Saturday closest to January 31. It is effectively single-segment — SOTP collapses to the consolidated read. This is therefore not an independent fair-value method and is not an input to the scenario valuation. [FY2025 Form 10-K, fiscal year ended 2026-01-31, Note 1 — Segment Information; Q2 FY2026 Form 10-Q, fiscal six months ended 2026-08-01, Note 1 — Segment Reporting]

## 1. Segment Inventory

| Segment | Revenue | EBIT (or EBITDA) | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| U.S. off-price retail | $11,566.9m total revenue (FY2025) | Not disclosed; CODM measure is $610.2m net income | Not assessable — no segment EBIT or EBITDA is disclosed | 100.0% of reportable-segment profit | [FY2025 Form 10-K, Note 1 — Segment Information] |

The denominator is reportable-segment profit, not an inferred EBIT total. The 10-K says Burlington has one reportable segment, derives all revenue in the United States and is managed on a consolidated basis; the Q2 FY2026 filing retains that definition. [FY2025 Form 10-K, Note 1 — Segment Information; Q2 FY2026 Form 10-Q, Note 1 — Segment Reporting]

The source-bound CIQ sidecar reports one `Retail - Apparel` segment at $11,559m, 100% of revenue. That is $7.9m, or 0.07%, below the filing's $11,566.9m. The audited filing is used above; the small vendor difference does not alter the single-segment conclusion. [CIQ Financials→Segments, Revenues, 12 months ended 2026-01-31; ciq_facts.json, segments_revenue]

**Effectively single-segment — SOTP collapses to the consolidated read.** Product categories are merchandise within the same retail operation, not separate reportable businesses. A forced apparel/home/footwear breakup would require made-up revenue, cost and capital allocations.

## 2. Segment Multiples & Comparables

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| U.S. off-price retail (the whole group) | $1,541.89m NTM consolidated EBITDA; no separately forecast segment metric | None — collapse path. BURL's observed NTM TEV/forward EBITDA is 13.75x, for sanity-check context only | Ross Stores (ROST); TJX Companies (TJX) | Ross 18.77x; TJX 16.62x NTM TEV/forward EBITDA | [Capital IQ Estimates, Multiples sheet, current FYE 2027; Capital IQ Comps, Financial Data and Trading Multiples, as of 2026-09-28] |

Ross is the closest national U.S. off-price peer; TJX's Marmaxx formats overlap with Burlington but the quoted TJX multiple is for the larger consolidated group. Both are economically closer than department-store or mall-specialty comparables because their core operations are off-price retail, but neither multiple is applied here. [data/BURL/Company-Comparable-Analysis-Burlington-Stores-Inc.xls, Financial Data and Trading Multiples, as of 2026-09-28; FY2025 Form 10-K, Item 1 — Competition]

The observed 13.75x versus 16.62x–18.77x is a peer-relative fact, not a breakup value. It cannot by itself establish that BURL warrants either peer multiple: BURL's LTM EBIT margin is 7.8%, below Ross's 12.7% and TJX's 12.2% on the reported vendor basis. [Capital IQ Estimates, Multiples sheet, current FYE 2027; Capital IQ Comps, Operating Statistics, as of 2026-09-28]

This sanity check stays entirely on the Capital IQ TEV convention. The vendor's $5,202.4m net-debt figure includes operating-lease liabilities, whereas the valuation module's canonical strict net debt is $1,215.8m; neither vendor TEV nor a peer multiple is carried into the bridge below. [CIQ Financials→Balance Sheet, Net Debt, Q2 2026-08-01; ciq_facts.json, net_debt_m; Q2 FY2026 Form 10-Q, pp.5, 10–13]

## 3. Segment Valuation

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| U.S. off-price retail | $1,541.89m NTM consolidated EBITDA | Not applied — single-segment collapse | Not calculated |
| **Gross enterprise value (sum)** |  |  | **Not calculated** |

No segment EV is calculated because there is only one reportable business and applying a peer multiple to it would duplicate the consolidated peer valuation in `03_relative-valuation-peers`, not create a SOTP read. The reported NTM EBITDA is a Capital IQ consolidated estimate, not a company-issued segment forecast. [Capital IQ Estimates, Consensus sheet, current FYE 2027; Capital IQ Estimates, Multiples sheet, current FYE 2027]

## 4. Equity Bridge

| Step | Value |
|---|---:|
| Gross enterprise value | Not calculated — no independent SOTP EV |
| − Capitalized unallocated corporate costs | Not applicable — no segment EV is being bridged; corporate costs are already inside the sole segment's results |
| − Net debt | Not applied; a valid EV bridge would subtract $1,215.8m strict net debt once |
| − Minority / preferred | Not applied; $0.0m / $0.0m in the canonical bridge |
| + Equity-method investments | Not applied; $0.0m separately reported |
| − Conglomerate / holdco discount (if any) | Not applicable — BURL is a single operating business, not a holdco |
| **= Equity value** | **Not calculated** |
| ÷ Diluted shares | 63.896m proxy, but no equity value to divide |
| **= SOTP value per share** | **Not assessable — SOTP collapsed** |
| vs current price | Not assessable; current price is $254.69 at the 2026-09-28 NYSE close [Capital IQ Comps→Financial Data, subject row, 2026-09-28; ciq_facts.json, current_price] |

Reconciliation Gate 3: no corporate bucket is omitted. FY2025 `other segment expenses` were $2,965.3m and include store-related costs, store payroll, corporate costs, marketing and strategy, and other store and selling expenses. Those costs sit within the one reported segment; the observed consolidated NTM EBITDA sanity check is after the group's operating costs. [FY2025 Form 10-K, Note 1 — Segment Information]

The bridge convention, if an EV had existed, would use the canonical $1,215.8m strict net debt (`$1,919.5m` financial debt less `$703.7m` cash and equivalents), with no separate net-cash line. The diluted-share proxy is 63.896m. [Q2 FY2026 Form 10-Q, pp.5–6, Note 4; Valuation/01 Price & Capital Structure, Anchor Summary]

No conglomerate discount is warranted because the filing presents one operating segment, rather than a collection of separately owned businesses. This does not mean a quality or multiple discount is unwarranted; that is a consolidated peer-valuation question. [FY2025 Form 10-K, Note 1 — Segment Information]

## 5. SOTP Read

There is no valid breakup value versus the $254.69 share price because Burlington's U.S. off-price retail operation is 100% of reported revenue and reportable profit. SOTP therefore adds no independent valuation evidence and should not receive a method weight.

The only usable check is consolidated: BURL's observed 13.75x NTM EV/EBITDA is below the 16.62x TJX and 18.77x Ross readings, but the lower 7.8% LTM EBIT margin versus 12.2% and 12.7%, respectively, means this is not proof that its sole segment is being masked by a conglomerate structure. [Capital IQ Comps, Trading Multiples and Operating Statistics, as of 2026-09-28]



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — BURL

All values are for Burlington Stores, Inc. common stock (`BURL`, NYSE, USD). The pool-verified close is **$254.69 on 2026-09-28** and per-share values use the 63.896m diluted weighted-average-share proxy. [Capital IQ Comps → Financial Data, subject row, 2026-09-28; Q2 FY2026 Form 10-Q, p.6; `ciq_facts.json`, `current_price` and `shares_outstanding_m`]

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $317.03–$438.53 mechanical sensitivity | Low | 0% | `02` explicitly marks its reversion values illustrative rather than admissible: the historical P/E series is basic-share based, and its EV-based series has an unresolved Capital IQ EV-definition conflict. It remains visible but is not a fair-value input. |
| Relative / peers (03) | **$281.39** base; $302.88 EV/EBITDA check | Medium | **70%** | The matched NTM P/E is a direct equity valuation against the two closest public off-price peers and needs no lease-heavy EV bridge. Its 10% discount already reflects durability and capital-structure uncertainty. |
| Intrinsic DCF (04) | **$133.46** | Low–medium | **30%** | It uses filing-based strict net debt and normalizes the tariff refund, but 74.35% of EV is terminal value and the result rests on large store/supply-chain reinvestment assumptions. It is therefore a cross-check, capped below one-third of the blend. |
| Reverse-DCF (05) | 46.75% FY2026–FY2030 FCFF CAGR implied; not a value | Low | n/a | A price-implied-expectations cross-check only; it does not produce a fair value. |
| Sum-of-the-parts (06) | Not assessable — single-segment collapse | n/a | 0% | BURL reports one U.S. off-price retail segment, so a breakup would duplicate the consolidated peer read rather than add an independent value. |

Weights sum to 100% across the two valid, value-producing methods. BURL is an operating retailer with usable forward estimates, so the peer method carries the majority; the DCF is deliberately a minority cross-check. `02` and `03` both found the sector-cycle multiple-history test **not assessable**, not cycle-elevated or cycle-depressed; neither emitted `RF-VAL-001` or `RF-VAL-002`. [valuation/02 Multiples — Own History, §§4–5; valuation/03 Relative Valuation — Peers, §§5–6; valuation/04 Intrinsic DCF, §§5–8; valuation/06 Sum-of-the-Parts, §§1–5]

## 2. Triangulation & Reconciliation

The headline finding is the **126.94% full high-to-low spread** from the DCF's $133.46 to the peer method's $302.88 EV/EBITDA support check. Even comparing only the two method base points, $133.46 versus $281.39 is a 110.84% spread. This exceeds the 40% threshold, so valuation confidence is capped at 55; the explanation below does not remove that cap.

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $317.03–$438.53, illustrative only | Low | 0% | Shown for transparency; excluded because `02` says it is not an admissible fair-value input. |
| Relative / peers (03) | $281.39 NTM P/E base; $302.88 NTM EV/EBITDA check | Medium | 70% | The P/E result applies BURL's $12.06 NTM EPS to a 23.333x warranted peer P/E; the EV check uses a lease-inclusive vendor debt basis and is not the selected peer point. |
| Intrinsic DCF (04) | $133.46; sensitivity $109.91–$168.23 | Low–medium | 30% | Cash-flow method with strict-debt bridge, but a 74.35% terminal-value share and a high capex burden make its absolute value fragile. |
| Reverse-DCF (05) | 46.75% implied FCFF CAGR; 13.85% implied steady-state EBIT margin | Low | n/a | It tests whether the market price can be met; it is not a value. |
| Sum-of-the-parts (06) | Not assessable — collapsed | n/a | 0% | One reportable segment; no independent breakup value. |

The mechanically weighted base point is **$237.01 per share**: 70% of the $281.39 peer P/E result plus 30% of the $133.46 DCF. The peer P/E deserves more weight because it uses a matched forward equity metric and a direct peer set, while the DCF is unusually sensitive to terminal value and to whether growth capex ever becomes cash flow. The DCF cannot be ignored: at the current price, its reverse solve needs 46.75% FCFF compounding for five years or a 13.85% steady-state EBIT margin, neither of which is proven by the available operating evidence. The own-history values do not corroborate the peer value because `02` itself flags its basis defects; they are a historical market record, not an independent proof that BURL warrants its former multiple. [data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data and Trading Multiples, 2026-09-28; valuation/03 Relative Valuation — Peers, §5; valuation/04 Intrinsic DCF, §§5–8; valuation/05 Reverse DCF, §§2–5]

The executed calculation was:

```text
$ /usr/local/Cellar/python@3.12/3.12.14/Frameworks/Python.framework/Versions/3.12/bin/python3.12 - <<'PY'
peer, dcf, price = 281.39, 133.46, 254.69
base = .70*peer + .30*dcf
bull = 13.00 * 28.51
base_pe = base / 12.06
bear = 3.49 * 19.00
print(base, bull, base_pe, bear)
print((302.88-dcf)/dcf, (base-price)/price, (base-price)/base, (price-bear)/price)
PY
237.01099999999997 370.63 19.652653399668325 66.31
1.2693638568125272 -0.0694099177876843 -0.07458579129173186 0.739582629740116
```

The base level's 19.65x NTM-P/E equivalent is a **translation of the weighted peer/DCF point**, not a new own-history reversion assumption. It is below the 28.51x low in `02`'s basic-share historical P/E series and below `03`'s 23.333x warranted peer P/E. That conservative translation is the disclosed effect of giving the low DCF a 30% weight; it should not be mistaken for evidence that a 19.65x P/E is a stable historical anchor.

## 3. Bull / Base / Bear Fair-Value Levels

The levels below use a 12-month convergence horizon. The forward EPS inputs are a practical equity-value translation of the method blend. The bear's $3.49 uses the actual FY2022 diluted GAAP EPS trough because BURL is a cyclical discretionary retailer; the pool does not supply a through-cycle normalized-EPS trough. It is therefore a conservative basis-limited downside case, not a claim that GAAP and CIQ normalized EPS are interchangeable. FY2022 also had $8.685bn sales and a 4.6% CIQ EBIT margin, versus $12.199bn LTM sales and a 7.8% CIQ EBIT margin, which prevents the bear from being merely a small haircut to current earnings. [earnings/01 Historical Financials, §§1–2; business-model/07 Business Quality, §§1 and 4]

| Case | Fair Value / Share (point) | Forward Metric (EPS/EBITDA) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| Bull | **$370.63** | $13.00 NTM EPS — 7.8% above the $12.06 vendor NTM EPS | **28.51x P/E** — the low end of `02`'s observed historical P/E band | 12 months | Inference, not from filings: sales remain near the top of FY2026 guidance, merchandise margin retains the Q2 underlying 70bp improvement after refund reinvestment, SG&A leverage holds, and the market restores BURL at least to the bottom of its historical P/E band. The $13.00 EPS is an upside scenario, not consensus. [data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Outlook, 2026-08-27; data/BURL/Burlington Stores, Inc., Q2 2027 Earnings Call, 2026-08-27, prepared remarks; data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data, 2026-09-28; valuation/02 Multiples — Own History, §2] |
| Base | **$237.01** | $12.06 NTM EPS | **19.65x P/E equivalent** — `$237.01 ÷ $12.06` | 12 months | FY2026 revenue guidance and the NTM EPS consensus are broadly met, but the 70% peer / 30% DCF blend remains in force because capex, consumer demand, markdown risk and the no-recurring-tariff-refund normalization constrain the warranted multiple. [data/BURL/Company Comparable Analysis Burlington Stores Inc.xls, Financial Data, 2026-09-28; data/BURL/BURL_Q2_2026_Earnings_PR.pdf, Outlook, 2026-08-27; valuation/04 Intrinsic DCF, §§1–6] |
| Bear (cyclical trough) | **$66.31** | $3.49 EPS — actual FY2022 diluted GAAP trough used as the basis-limited through-cycle proxy | **19.00x P/E** — below the 19.65x base equivalent | 12 months if a deep consumer/markdown downturn develops | A repeat of the admitted performance trough: low-income consumer demand and weather weaken traffic, markdowns reverse merchandise-margin gains, and fixed store/supply-chain costs lose leverage. The 19.00x multiple is judgment, not a reported historical low; it is below `02`'s basic-share series and makes this a severe capital-loss boundary rather than a central forecast. [earnings/01 Historical Financials, §1; earnings/07 Earnings Sensitivity, §§2–6; business-model/10 External Dependency, §§1–5] |

The bull multiple is above the base equivalent and is anchored at the low end of `02`'s historic band. The bear multiple is below the base equivalent. Neither lower base nor bear equivalent is presented as a clean extension of `02`'s own-history range: `02` rejected that series as a fair-value input because its historical share and EV bases do not reconcile. The required mechanics are transparent rather than concealed.

No separate structural-reset value is calculated. The trigger does not fire: the moat verdict is **Narrow moat — structural, not yet proven economic** with trajectory **not assessable**, rather than “No moat proven” or eroding; the business-quality disruption score is 45, above the ≤40 trigger. The headline bear is thus the recoverable cyclical-trough case, not a permanent-impairment case. [business-model/09 Moat, §5; business-model/07 Business Quality, §1]

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | **$254.69** — pool-verified NYSE close, 2026-09-28 |
| Base-case fair value (point) | **$237.01** |
| Bear-case fair value | **$66.31** |
| Implied upside to base case = (base FV − price) / price (%) | **(6.94%)** |
| **Margin of safety** = (base FV − price) / base FV — the cushion (%) | **(7.46%)** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* (%) | **73.96%** |

The price is pool-verified and one trading day old, so price-relative reads are assessable without a staleness adjustment. The negative margin of safety is different from the 73.96% inverted downside-to-bear figure; the latter is the loss if the stated trough case occurs. [Capital IQ Comps → Financial Data, subject row, 2026-09-28; valuation/01 Price & Capital Structure, §§1 and 7]

## 5. Warranted-Multiple Check

The base level translates to 19.65x NTM EPS, below BURL's 23.333x warranted peer P/E and below the lowest 28.51x P/E in the disputed own-history series. That restraint is supported by a 42/100 business-quality score, a narrow but not economically proven moat, 7.8% LTM EBIT margin versus 12.7% for Ross and 12.2% for TJX, and substantial store/supply-chain spending; it does not rely on double-counting BURL's lower margin inside an earnings multiple. [business-model/07 Business Quality, §§1–4; business-model/09 Moat, §§3–5; valuation/03 Relative Valuation — Peers, §§2 and 4]

The bull requires a 28.51x P/E, merely re-entering the bottom of the historical range, plus $13.00 NTM EPS. That level is not supported by a proven sustained excess-return spread: through-cycle ROIC is 7.0% on the cited CIQ series and the moat report could not establish a matching cost-of-capital spread. The sector-cycle test is not assessable for both own history and peers, so neither the former P/E band nor the current peer median can be treated as a confirmed durable anchor. [business-model/09 Moat, §§3–5; valuation/02 Multiples — Own History, §5; valuation/03 Relative Valuation — Peers, §6]

## 6. Fair-Value Read

For the next 12 months, the derived fair-value levels are **$370.63 bull, $237.01 base, and $66.31 cyclical-trough bear** per BURL share. At the $254.69 pool-verified close, the base point implies **(6.94%)** upside, a **(7.46%)** margin of safety, and a **73.96%** inverted downside-to-bear. The 70%-weighted peer P/E drives the base level, but the 30%-weighted DCF sharply limits it because its normalized cash-flow value is $133.46. The largest swing factor is whether merchandise-margin and SG&A gains turn into durable cash flow after tariff-refund reinvestment and heavy growth capex, rather than reversing through a consumer and markdown downturn. [valuation/03 Relative Valuation — Peers, §5; valuation/04 Intrinsic DCF, §§1–8; earnings/07 Earnings Sensitivity, §§2–6]
