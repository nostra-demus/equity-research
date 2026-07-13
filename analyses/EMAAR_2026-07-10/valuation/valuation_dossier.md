# valuation Module Dossier — EMAR

- Generated: 2026-07-10T16:17:33Z
- Contents: 1 synthesis + 8 specialists = 9 files

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

# Valuation Module — EMAR (Synthesis)

*Emaar Properties PJSC (DFM: EMAAR). UAE / Dubai issuer; IFRS; reporting currency AED (dirham hard-pegged to the US dollar at 3.6725 AED/USD, so AED↔USD carries negligible currency risk). This synthesis composes the fair-value LEVELS, the margin of safety, and the value verdict from the upstream specialists `00`–`07`. It does NOT assign scenario probabilities, compute probability-weighted returns or risk/reward, rate the stock, or size a position — those belong to the master synthesizer.*

## Abstract

Emaar screens modestly below a defensible fair value: base-case worth is AED 15.00 against a pool-verified AED 12.20 price — roughly +23% upside, an +18.7% discount to that base. The bull/base/bear levels are AED 21.00 / 15.00 / 9.75, driven by sum-of-the-parts, where a wholly-owned Dubai mall annuity worth about 79% of today's entire enterprise value sits masked inside a cyclical developer. At AED 12.20 the market prices free cash flow to shrink about 13%/yr for a decade, at a margin below Emaar's own worst trough — too pessimistic given a AED 163bn sold backlog. Downside to a real Dubai cyclical trough is about 20%. Verdict: modestly undervalued, but a government-owner value trap, not a clean mispricing.

## 1. Valuation Verdict

- **Verdict:** **Modestly undervalued** — base-case fair value AED 15.00 is +23.0% above the AED 12.20 price (+18.7% margin of safety); the discount is real but partly a peak-earnings artefact and gated by a misaligned government owner, so it does not clear the "Materially undervalued" bar and is capped there by RF-OWN-004 (§24 Filter 6).
- **Base-case fair value (point, per share):** **AED 15.00** *(from 07)*
- **Current price:** **AED 12.20** (US$3.32, last close, as-of 2026-06-28) — **price-state `pool-verified`** (12 days stale; a data-quality caveat, not a no-price trigger) *(from 01)*
- **Bull / Base / Bear fair-value levels (points):** **AED 21.00 / AED 15.00 / AED 9.75** *(from 07)*
- **Cross-method dispersion (football field, low–high):** **~AED 9.6 to ~AED 23.8** — base points alone span AED 12.5 → AED 18 (a 44% spread) *(from 07)*
- Valuation attractiveness /100 *(higher = cheaper)*: **54** *(capped ≤60 by RF-OWN-004)*
- Margin of safety /100 *(higher = better)*: **49** *(the cushion is real at +18.7% but roughly matched by the ~20% fall to a true cyclical trough)*
- Valuation confidence /100: **55** *(data complete and all five methods ran, but the >40% method spread — though reconciled — and a single clean peer keep it mid-band)*
- Downside risk /100 *(higher = WORSE — inverted)*: **50** *(downside-to-bear +20.1% to a defensible Dubai trough, floored by net cash + the wholly-owned mall annuity, with tail risk of a deeper downturn and value-trap dead-money risk)*
- Data quality /100: **85** *(from 00 — "Sufficient"; 0 extraction failures, pool-verified price, full financials + consensus + peers + segments)*
- Overall usefulness /100: **80**
- Dominant valuation method (one line): **Sum-of-the-parts (`06`)** — the only method that both surfaces the masked wholly-owned Emaar Malls annuity (~AED 76.8bn EV, ~79% of current EV from 22% of profit) AND already prices the state-owner discount; the normalized FCFF DCF (`04`) corroborates the ~AED 17–18 asset value.
- What's priced in (one line): at AED 12.20 the market prices free cash flow to shrink ~13.4%/yr for a decade and a through-cycle EBIT margin near ~21% — below Emaar's own FY2021 trough (23.5%) and below audited peer Aldar (27.2%) — paying just 64% of `04`'s intrinsic; expectations are conservative on fundamentals (`05`).
- Biggest valuation risk (one line): the **government-owner value trap (RF-OWN-004)** — a value-indifferent Government-of-Dubai controller (Dubai Holding group, 29.73%) can keep a below-intrinsic price below intrinsic indefinitely, on top of developer earnings sitting at a Dubai-cycle peak consensus already marks down ~15%.

## 1A. Module Disconfirmation *(CLAUDE.md §8)*

- **Strongest bear point:** on the one cycle-robust measure, P/BV (~1.20x book vs a 0.94x own-median), and on through-cycle-normalized earnings (`03`: ~AED 11.5–12.6; `02`: ~AED 12.5 no-re-rate), fair value is at or below today's price — i.e. the asset-method upside evaporates once you strip peak earnings. The reverse-DCF's own tie-break says price sits squarely in the through-cycle-earnings camp.
- **Strongest bull point (steelman):** the wholly-owned Emaar Malls annuity plus net cash (~AED 76.8bn + ~AED 25bn ≈ AED 102bn) roughly equal the entire AED 107.8bn market cap (`06`), so the market assigns almost nothing to the #1 Dubai developer (72% of profit) — and `05` shows the price bakes in a permanent ~13%/yr runoff the AED 163.4bn sold backlog (94% sold, 3.3× revenue) contradicts.
- **Single killer risk (method validity + value trap):** the value hangs on the developer multiple and margin (a ~AED 11 bull-to-bear swing), and the whole gap is gated by RF-OWN-004 — a government owner with no incentive to spin the malls or lift the payout, so the masked value may never crystallise (dead money, not a loss).
- **Disconfirming evidence already visible:** consensus long-term growth −14.8% and a forward P/E (~6.9x) above the trailing (~5.7x) — the market explicitly prices an earnings decline; the flow multiples sit at the 0th percentile of a 4-year window that contains no Dubai downturn (up-cycle means, not through-cycle norms).

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage (`00`) | **Sufficient** — all five methods can run; no partial-data cap triggered | The one binding cap is carried from governance: **RF-OWN-004** owner-misalignment (attractiveness ≤60; value-trap flag mandatory; verdict ≤ "Modestly undervalued" on a cheap multiple alone). Price pool-verified. |
| price-and-capital-structure (`01`) | Price **AED 12.20** pool-verified (2026-06-28); **net cash on every basis** | Cash-basis choice moves EV by ~AED 22.9bn (~19%): broad EV **AED 96,657m** (net cash AED 24,969m) canonical vs strict EV AED 119,511m (net cash AED 2,115m). AED 43,338m RERA escrow excluded. |
| multiples-own-history (`02`) | Roughly fair on own history (~**AED 12.5**, no-re-rate); flow multiples at 0th percentile of a 4-year range | The 0th-percentile "discount" is peak earnings (EBITDA tripled, price only doubled) on an up-cycle-only window under a government owner = value trap, not margin of safety; reversion table marked illustrative-only (zero-weighted). |
| relative-valuation-peers (`03`) | Modestly cheap vs the one clean comp (Aldar) on peak metrics, roughly fair through-cycle; base **AED 16.9** | The 75% EV/EBITDA discount to peer median is mostly warranted (net-cash EV compression, peak earnings, six China/HK distortions); Aldar is the only clean comp and the *forward*-P/E gap to it is just −10%. |
| intrinsic-dcf (`04`) | Base intrinsic **≈ AED 18** (17.2 economic-NCI / 19.2 book-NCI); grid AED 15–22 | Market EV ≈ PV of the explicit 10-year FCFF alone — the market assigns ~zero to the post-2035 business + terminal + balance sheet. TV only 36% of EV; mid-cycle margin is the swing (±2pp EBIT ≈ ±AED 1/share). |
| reverse-dcf (`05`) | What's priced in is **conservative/undemanding** — price implies FCFF −13.4%/yr for a decade, ~21% through-cycle margin, pays 64% of `04` intrinsic | The implied ~21% terminal margin is below Emaar's own FY2021 trough (23.5%) and below Aldar (27.2%) — pricing structural impairment the sold backlog, mall annuity and net cash do not support; whether the gap closes depends on the owner. |
| sum-of-the-parts (`06`) | Parts worth more than the whole — base **AED 16.77** after a 20% holdco/state-owner discount; band AED 11.0–23.8 | The wholly-owned Emaar Malls annuity alone ~AED 76.8bn EV = ~79% of the entire current EV from 22% of profit; malls + net cash ≈ the whole market cap — but a government owner won't crystallise it. |
| scenario-and-fair-value (`07`) | **Modestly undervalued**; base **AED 15.00**, bull AED 21 / bear AED 9.75; MoS +18.7%, downside-to-bear +20.1% | The >40% method spread IS the finding: asset methods (SOTP/DCF ~AED 17–18) vs through-cycle-earnings (~AED 11–12.6). Base pulled down from a AED 16.52 blend for peak content + value trap; SOTP is the dominant method. |

## 3. Reconciliation

**The high-to-low spread exceeds 40% — this is the lead result, not a footnote.** The base points alone span AED 12.5 (`02`) → AED 18 (`04`) = a 44% spread; the full cross-method football field runs ~AED 9.6 to ~AED 23.8. The disagreement is not noise — it is **one question**: do you value Emaar on its **assets** (SOTP + DCF-terminal + book → ~AED 17–18) or on **normalized through-cycle earnings at a warranted multiple** (→ ~AED 11–12.6)? Today's AED 12.20 price sits squarely in the through-cycle-earnings camp; the asset methods say materially more.

The tie-breaker is the reverse-DCF (`05`): at AED 12.20 the market prices free cash flow to shrink ~13%/yr for a decade and the through-cycle margin to settle near ~21% — below Emaar's own worst recent trough and below its audited peer. That is pricing structural impairment, which the AED 163.4bn sold backlog (94% sold), the wholly-owned mall annuity and the net-cash balance sheet do not support — so on fundamentals fair value is above price.

**Which method I trust for this company, and why:** I weight **SOTP (`06`) most heavily** — it is the designated method for a holding-company-like hybrid, it alone surfaces the masked wholly-owned mall annuity, and it is the only method that already applies the RF-OWN-004 government-owner discount. The normalized FCFF **DCF (`04`)** corroborates the ~AED 17–18 asset value with a non-terminal-dominated model (TV only 36% of EV). I **discount `02`'s reversion exhibit** (up-cycle-only window, peak base metric, marked illustrative-only by its own producer) and treat `03`'s headline AED 16.9 with caution because it is struck on peak LTM EBITDA against a single clean comp. The reconciled base is **AED 15.00 — pulled ~9% below the AED 16.52 mechanical weighted blend** by `07`, a disclosed conservative adjustment (not a lens swap) because two of the four inputs carry no government-owner discount and sit on peak metrics. The own-history and peer-normalized reads (~AED 12) are what keep the base from underwriting the full asset value the misaligned owner has no interest in crystallising.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | **N** | — | Price IS pool-verified (CIQ Comps, as-of 2026-06-28); 12-day staleness is a data-quality caveat only. Margin of safety, downside-to-bear, observed up/down and attractiveness are all assessable. |
| No consensus / forward estimates | **N** | — | CIQ Consensus + NTM estimates present. |
| No peer data | **N** | — | 10-name comp set present (Aldar the clean UAE anchor). |
| Only one valuation method usable | **N** | — | All five value-producing methods ran. |
| No cash flow AND DCF is only method | **N** | — | Full annual + LTM cash flow present; DCF is one of five methods. |
| SOTP not possible for multi-segment | **N** | — | SOTP ran (three-segment breakup). |
| Methods disagree >40% unreconciled | **N (reconciled)** | Valuation confidence | Base points span AED 12.5→18 (44%); full dispersion AED 9.6–23.8. Explicitly reconciled in `07` §2 (asset-vs-earnings framing, reverse-DCF tie-breaker, base pulled from the AED 16.52 blend to AED 15.0). Hard max-55 cap NOT triggered because reconciliation was done — but the genuine dispersion holds confidence in the mid-band (55). |
| Terminal value >75% of DCF EV | **N** | — | TV is only 36% of DCF EV — a confidence plus. |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | **Y** | Valuation attractiveness | **max 60** applied (attractiveness set 54); **value-trap flag raised (mandatory)**; verdict held at **"Modestly undervalued"** — no better on a cheap multiple alone. |

*Most restrictive cap on each score is used. The only binding cap is RF-OWN-004; the >40% dispersion was reconciled so its hard confidence cap does not fire, though the dispersion still weighs confidence to the mid-band.*

## 5. Fair-Value Summary

The bull/base/bear levels are **AED 21.00 / 15.00 / 9.75**, and the single method driving them is **sum-of-the-parts**: a wholly-owned, recurring-rent Dubai mall annuity worth ~AED 76.8bn of enterprise value — about 79% of Emaar's entire current EV, from just 22% of profit — is masked inside a cyclical developer the market prices on one blended ~3.8x multiple, with the normalized DCF corroborating the ~AED 17–18 asset value. What the AED 12.20 price implies is a permanent runoff: free cash flow shrinking ~13%/yr for a decade at a through-cycle margin (~21%) below Emaar's own worst recent trough — and the earnings evidence (a AED 163.4bn sold backlog, 94% pre-sold, converting over 3–4 years; margins that have not sat below ~23.5% even in the last downturn) says that collapse is not achievable, so on fundamentals the gap to fair value is upside. Read the two price-relative metrics separately: the **margin of safety is +18.7%** (the discount of price to the AED 15.00 base) while the **downside-to-bear is +20.1%** (the loss to a genuine Dubai cyclical trough at AED 9.75) — a real cushion, but roughly matched by the fall to a true cycle low. The apparent cheapness carries real **value-trap risk**: the low flow multiples sit on record cycle-peak earnings consensus already marks down ~15%, and the controller is the value-indifferent Government of Dubai (Dubai Holding group, 29.73%) with every "independent" director a state official and the largest related-party channel unquantified under an IAS 24 election — so the base withholds the full asset value (SOTP AED 16.77 / DCF AED 18) the owner has no incentive to release. The warranted multiple behind the AED 15.00 base (~4.8x LTM / ~6.7x normalized EV/EBITDA; ~7.0x P/E) sits *below* Emaar's own ~6.5x EV/EBITDA and ~7.4x P/E medians and *below* Aldar's 8.3x/8.5x — so the base does not require a multiple the business has never earned; the risk is not that the number is unwarranted but that the owner may never let it close.

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper (→ Materially undervalued) | What Would Make It More Expensive (→ Fairly / Modestly overvalued) | Data Needed |
|---|---|---|---|
| **Modestly undervalued** (base AED 15.00; +18.7% MoS; RF-OWN-004 value-trap flag) | Credible evidence the government owner will crystallise the masked mall value (a mall spin / REIT / higher payout / minority-friendly related-party terms); the Dubai up-cycle extending past FY2028 with developer EBIT margin holding ~37%; a clean second UAE comp confirming an Aldar-parity warranted multiple | A genuine Dubai downturn (developer earnings −~35% off peak, per the boom-bust base rate) troughing toward the AED 9.75 bear; the ~21% priced-in margin proving structural (cheap-land spread gone, the new 15% tax a one-way ratchet); mall cap rates widening as rates/supply rise | Governance evidence on capital-return intent and IAS 24 related-party quantification (drives the value-trap discount); a ~3-year peer-multiple history to place the discount vs its own norm; a through-cycle Dubai developer-margin series to test the terminal |

## 7. Note To The Final Synthesizer

- **Bull / base / bear fair-value levels:** **AED 21.00 / 15.00 / 9.75**, base point **AED 15.00**; dominant method is **sum-of-the-parts (`06`)** (masked wholly-owned mall annuity + a built-in 20% state-owner discount), corroborated by the normalized FCFF DCF (`04`, ~AED 17–18). Cross-method football field ~AED 9.6–23.8 — a >40% spread that is itself the headline finding.
- **What the price implies (from reverse-DCF `05`):** at AED 12.20 the market prices FCFF to shrink ~13.4%/yr for a decade and a ~21% through-cycle margin — below the FY2021 trough (23.5%) and below Aldar (27.2%) — paying 64% of `04`'s intrinsic. That is structural-impairment pricing the AED 163.4bn sold backlog does NOT support: expectations are undemanding on fundamentals.
- **Margin of safety (the cushion):** **+18.7%** discount of price to the AED 15.00 base. **Downside-to-bear (the downside anchor):** **+20.1%** loss to the AED 9.75 cyclical trough; the trough is floored near AED 6–8/share by net cash + the wholly-owned mall annuity before any developer value.
- **Genuine value vs value trap:** this is a masked annuity AND a structural value trap at once. The warranted-multiple math supports the base (~4.8x LTM / ~6.7x normalized EV/EBITDA, below own-history and Aldar), so the level is defensible — but **RF-OWN-004 (§24 Filter 6) is live**: a value-indifferent Government-of-Dubai controller (Dubai Holding group, 29.73%) makes persistent cheapness a trap, not a margin of safety. Do not underwrite reversion to the old up-cycle mean the owner has no interest in delivering; a ~8% dividend yield pays holders to wait.
- **Which method to trust / discount for THIS company:** trust **SOTP (`06`)** and the **normalized DCF (`04`)**; treat `02`'s reversion table as illustrative-only (up-cycle window, peak metric) and `03`'s AED 16.9 headline as peak-earnings-inflated (single clean comp). The through-cycle-earnings reads (~AED 11–12.6) are the honest floor on the asset value.
- **Partial-data caps:** none from missing data — price is pool-verified, all five methods ran. The one binding cap is **RF-OWN-004** (attractiveness ≤60; mandatory value-trap flag; verdict ≤ Modestly undervalued). Note the price is 12 days stale and USD-normalized in the pool (converted to native AED at the 3.6725 peg).
- **Biggest missing data point (single highest-value next request):** primary-source evidence on the controller's capital-return intent toward minorities and the quantum of the IAS 24-hidden related-party channel — it is the swing between "modestly undervalued masked annuity" and "perennially cheap value trap."
- **Explicit handoff:** the master synthesizer's "Valuation and Peer Mispricing" section should **defer to this synthesis**. The bull/base/bear fair-value LEVELS here (AED 21 / 15 / 9.75) are the inputs for the master's probability-weighted scenario model — **the master assigns the probabilities, computes any probability-weighted target / risk-reward, and issues the rating; this module does not.**

## 8. Simple Summary

- **Modestly cheap, not a screaming bargain:** base fair value AED 15.00 vs a pool-verified AED 12.20 price — about +23% upside, an +18.7% cushion.
- **Bull / base / bear: AED 21.00 / 15.00 / 9.75.** The base is one point; the methods themselves range wide, ~AED 9.6 to ~AED 23.8.
- **The market is pricing a collapse:** free cash flow shrinking ~13%/yr for a decade at a margin below Emaar's worst-ever recent trough — which a AED 163bn, 94%-sold backlog says won't happen.
- **Downside** is a ~20% fall to a real Dubai cyclical trough (AED 9.75), floored by ~AED 25bn net cash plus a wholly-owned mall annuity; a severe downturn could go lower.
- **The method that matters most is sum-of-the-parts:** a wholly-owned Dubai mall business worth ~79% of the whole company's enterprise value is hidden inside a cyclical developer.
- **Value-trap risk is real and mandatory to flag:** a Government-of-Dubai owner (29.73%) with no incentive to unlock the hidden value can keep this cheap for years — cheapness here is not automatically a margin of safety.
- **A current price WAS available** (pool-verified, 12 days stale) — no no-price gap; the real gap is governance evidence on how the state owner treats minority holders.
- **Useful for the master synthesizer:** yes — clear levels, a dominant method, a what's-priced-in read, and a decision-critical value-trap flag. Confidence is mid-band because the methods genuinely disagree (though the gap is reconciled).



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — EMAR

Company: **Emaar Properties PJSC** (DFM:EMAAR). Data pool: `data/EMAR/`. Extract pool: `analyses/EMAR_2026-07-10/_pool_extracts/` (fresh — 20 workbooks → 57 tabs, 69 extracts, **0 extraction failures**; all 32 source files `status: ok` in `manifest.json`). CIQ deterministic facts sidecar `ciq_facts.json` is present and pinned into the reads below.

Periods below are parsed from INSIDE each document (period-end / "as of" / filing-date lines), NOT the Drive-sync last-modified date (fix F23). All CIQ financial tabs are in **AED**; the Capital IQ comps workbook is converted to **USD** at spot (flag for `01`).

## 1. File Inventory

Multi-tab workbooks are expanded to one row per tab (reconciled to `_pool_extracts/manifest.md`); single-tab workbooks, PDFs and RTFs are one row each. No workbook is left as a single opaque row.

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| Emaar_Properties_Annual_Report_2025.pdf | Audited annual report (IFRS), English | FY2025 (period-end 31-Dec-2025; filed 12-Feb-2026) | 2026-07-08 (sync) | High |
| Emaar_Properties_Annual_Report_2024.pdf | Audited annual report (IFRS) | FY2024 (period-end 31-Dec-2024) | 2026-07-08 (sync) | High |
| Emaar_Properties_Annual_Report_2023.pdf | Audited annual report (IFRS) | FY2023 (period-end 31-Dec-2023) | 2026-07-08 (sync) | Medium (history) |
| Emaar_Properties_Earnings_Press_Release_Q1_2026.pdf | Quarterly results press release | Q1 2026 (period-end 31-Mar-2026) | 2026-07-09 (sync) | High |
| Emaar_Properties_Earnings_Press_Release_Q4_2025.pdf | Quarterly / FY results press release | Q4/FY 2025 (period-end 31-Dec-2025) | 2026-07-09 (sync) | Medium |
| Emaar_Properties_Earnings_Press_Release_Q3_2025.pdf | Quarterly results press release | Q3 2025 (period-end 30-Sep-2025) | 2026-07-09 (sync) | Medium |
| Emaar properties Q4'25_Earnings_Call_Summary.pdf | Earnings-call summary (transcript tier) | Q4/FY 2025 | 2026-07-09 (sync) | Medium |
| Emaar Properties Q3'25_Earnings_Call_Summary.pdf | Earnings-call summary (transcript tier) | Q3 2025 | 2026-07-09 (sync) | Medium |
| Financials_Annual.xls → **Income Statement** | CIQ annual financials tab (98×7, AED) | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Balance Sheet** | CIQ annual financials tab (101×7, AED) | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Cash Flow** | CIQ annual financials tab (77×7, AED) | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Multiples** | CIQ annual multiples tab (91×9) | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Capital Structure Summary** | CIQ annual tab (96×7, AED) | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Capital Structure Details** | CIQ annual tab (44×10) — debt maturity/fixed-float | latest as-reported (31-Dec-2025) | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Historical Capitalization** | CIQ annual tab (39×7) | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Segments** | CIQ annual segment tab (84×7, AED) — revenue/PBT/assets/D&A by segment + geography | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Ratios** | CIQ annual ratios tab (161×7) — ROIC etc. | FY2020–FY2025 | 2026-06-20 (sync) | High |
| Financials_Annual.xls → **Key Stats** | CIQ annual tab (91×9) | FY2020–FY2025 | 2026-06-20 (sync) | Medium |
| Financials_Annual.xls → **Supplemental** | CIQ annual tab (38×7) | FY2020–FY2025 | 2026-06-20 (sync) | Low |
| Financials_Annual.xls → **Industry Specific** | CIQ annual tab (65×7) — real-estate KPIs | FY2020–FY2025 | 2026-06-20 (sync) | Medium |
| Financials_Annual.xls → **Pension OPEB** | CIQ annual tab (44×7) | FY2020–FY2025 | 2026-06-20 (sync) | Low |
| Financials_Quarterly.xls → **Income Statement** | CIQ quarterly tab (95×18, AED) | through Q1 (31-Mar-2026); LTM | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Balance Sheet** | CIQ quarterly tab (99×18, AED) | through 31-Mar-2026 | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Cash Flow** | CIQ quarterly tab (77×18, AED) | through 31-Mar-2026; LTM | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Multiples** | CIQ quarterly multiples tab (91×19) — 16-qtr EV/EBITDA history | through 31-Mar-2026 | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Capital Structure Summary** | CIQ quarterly tab (74×35, AED) | through 31-Mar-2026 | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Capital Structure Details** | CIQ quarterly tab (44×10) | latest as-reported | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Historical Capitalization** | CIQ quarterly tab (39×18) | through 31-Mar-2026 | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Segments** | CIQ quarterly segment tab (84×18, AED) | through 31-Mar-2026 | 2026-06-20 (sync) | High |
| Financials_Quarterly.xls → **Ratios** | CIQ quarterly ratios tab (161×18) | through 31-Mar-2026 | 2026-06-20 (sync) | Medium |
| Financials_Quarterly.xls → **Key Stats** | CIQ quarterly tab (91×7) | through 31-Mar-2026 | 2026-06-20 (sync) | Medium |
| Financials_Quarterly.xls → **Supplemental / Industry Specific / Pension OPEB** | CIQ quarterly tabs (26×18 / 65×18 / 30×18) | through 31-Mar-2026 | 2026-06-20 (sync) | Low–Medium |
| Company Comparable Analysis …PJSC.xls → **Financial Data** | CIQ comps tab (50×17, **USD**) — price, shares, market cap, net debt, EV, LTM/NTM IS | as-of 28-Jun-2026 | 2026-06-28 (sync) | High |
| Company Comparable Analysis …PJSC.xls → **Trading Multiples** | CIQ comps tab (50×9, USD) — TEV/EBITDA, P/E, P/TangBV (LTM + NTM) | as-of 28-Jun-2026 | 2026-06-28 (sync) | High |
| Company Comparable Analysis …PJSC.xls → **Implied Valuation** | CIQ comps tab (69×9) — implied value from peer multiples | as-of 28-Jun-2026 | 2026-06-28 (sync) | High |
| Company Comparable Analysis …PJSC.xls → **Operating Statistics** | CIQ comps tab (50×13) — growth/margins vs peers | as-of 28-Jun-2026 | 2026-06-28 (sync) | Medium |
| Company Comparable Analysis …PJSC.xls → **Credit Health Panel** | CIQ comps tab (48×10) — leverage/coverage vs peers | as-of 28-Jun-2026 | 2026-06-28 (sync) | Medium |
| Company Comparable Analysis …PJSC.xls → **Business Description** | CIQ comps tab (44×3) | as-of 28-Jun-2026 | 2026-06-28 (sync) | Low |
| Company Comparable Analysis …PJSC.xls → **Valuation Chart** | CIQ comps tab (32×2) | as-of 28-Jun-2026 | 2026-06-28 (sync) | Low |
| Company Comparable Analysis …PJSC.xls → **Disclaimer** | CIQ comps tab (26×1) | — | 2026-06-28 (sync) | Low |
| EstimatesReport.xls → **Consensus** | CIQ estimates tab (514×81, AED) — revenue/EPS/EBITDA/target price | as-of ~Jun-2026 | 2026-06-20 (sync) | High |
| EstimatesReport.xls → **Multiples** | CIQ estimates tab (25×7) — forward multiples | as-of ~Jun-2026 | 2026-06-20 (sync) | High |
| EstimatesReport.xls → **Trends** | CIQ estimates tab (305×15) — estimate trend | as-of ~Jun-2026 | 2026-06-20 (sync) | High |
| EstimatesReport.xls → **Revisions** | CIQ estimates tab (467×13) — up/down revisions | as-of ~Jun-2026 | 2026-06-20 (sync) | Medium |
| EstimatesReport.xls → **Surprise** | CIQ estimates tab (245×74) — beat/miss history | as-of ~Jun-2026 | 2026-06-20 (sync) | Medium |
| EstimatesReport.xls → **Recent Changes** | CIQ estimates tab (265×10) | as-of ~Jun-2026 | 2026-06-20 (sync) | Medium |
| EstimatesReport.xls → **Guidance** | CIQ estimates tab (42×3) | as-of ~Jun-2026 | 2026-06-20 (sync) | Medium |
| 01_Consensus.xlsx → Consensus | CIQ estimates split (517×81) — **duplicate** of EstimatesReport Consensus | as-of ~28-Jun-2026 | 2026-06-28 (sync) | High |
| 04_Multiples.xlsx → Multiples | CIQ forward-multiples split (26×7) — **duplicate** | as-of ~28-Jun-2026 | 2026-06-28 (sync) | High |
| 06_Trends.xlsx → Trends | CIQ estimates split (306×15) — **duplicate** | as-of ~28-Jun-2026 | 2026-06-28 (sync) | Medium |
| 07_Revisions.xlsx → Revisions | CIQ estimates split (476×13) — **duplicate** | as-of ~28-Jun-2026 | 2026-06-28 (sync) | Medium |
| 05_Surprise.xlsx → Surprise | CIQ estimates split (248×74) — **duplicate** | as-of ~28-Jun-2026 | 2026-06-28 (sync) | Medium |
| 03_Guidance.xlsx → Guidance | CIQ estimates split (42×3) — **duplicate** | as-of ~28-Jun-2026 | 2026-06-28 (sync) | Low |
| 02_Recent Changes.xlsx → Recent Changes | CIQ estimates split (266×10) — **duplicate** | as-of ~28-Jun-2026 | 2026-06-28 (sync) | Low |
| Emaar…Investment Analysis Direct Investments.xls → Direct Investments | CIQ tab (69×21) — equity-method / associate stakes | as-of 28-Jun-2026 | 2026-06-28 (sync) | Medium (EV bridge / SOTP) |
| Emaar…Key Developments.xls → Key Developments | CIQ events tab (49×7) — incl. May-2026 ICD→Dubai Holding block transfer | through Jun-2026 | 2026-06-28 (sync) | Medium |
| Emaar…Analyst Coverage.xls → Analyst Coverage | CIQ tab (34×6) — covering analysts | as-of 28-Jun-2026 | 2026-06-28 (sync) | Medium |
| Emaar…Public Ownership Summary.rtf | CIQ ownership summary (RTF) — float / holders | as-of ~May-2026 | 2026-06-28 (sync) | Medium (share count/float) |
| Emaar…Public Company Profile.rtf | CIQ company profile (RTF) | as-of ~Jul-2026 | 2026-07-08 (sync) | Medium |
| Emaar…Private Ownership.rtf | CIQ ownership (RTF) | as-of ~Jun-2026 | 2026-06-28 (sync) | Low |
| Emaar…Board Members.xls → Board Members | CIQ tab (29×25) | as-of Jun-2026 | 2026-06-28 (sync) | Low (governance) |
| Emaar…Professionals.xls → Professionals | CIQ tab (33×24) | as-of Jun-2026 | 2026-06-28 (sync) | Low (governance) |
| Emaar…Compensation Summary Compensation.xls → Summary Compensation | CIQ tab (27×18) | as-of Jun-2026 | 2026-06-28 (sync) | Low (governance) |
| Emaar…Customers.xls → Customers | CIQ tab (40×8) | as-of Jun-2026 | 2026-06-28 (sync) | Low |
| Emaar…Suppliers.xls → Suppliers | CIQ tab (46×8) | as-of Jun-2026 | 2026-06-28 (sync) | Low |
| Emaar…Strategic Alliances.rtf | CIQ tab (RTF) | as-of Jun-2026 | 2026-06-28 (sync) | Low |
| Emaar…Events Calendar.xls → Events Calendar | CIQ tab (23×3) | forward calendar | 2026-06-28 (sync) | Low |

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United Arab Emirates — Dubai Financial Market (DFM:EMAAR) | Comps workbook header "Emaar Properties PJSC (DFM:EMAAR)"; FY2025 Annual Report cover |
| Filing regime | UAE — SCA (Securities & Commodities Authority) / DFM disclosure; **not** US SEC | FY2025 Annual Report; DFM "Key Developments" exchange intimations |
| Reporting standard | **IFRS** (IAS 24 related-party election referenced) | FY2025 Annual Report, Notes; governance module Note 33 citation |
| Reporting currency (and scale) | **AED** (dirham); figures in AED millions / billions (peg 3.6725 AED/USD) | CIQ Segments/IS tabs "Currency AED"; AR "AED 49.6 Bn Revenue", "AED 25.6 Bn EBITDA" |
| Fiscal-year end | **31 December** | CIQ periods "Dec-31-2025"; AR "As of 31 December 2025" |
| Document language(s) | **English** (annual report, press releases, CIQ exports all English) | FY2025 Integrated Annual Report (English original) |

Downstream agents read and cite the local-equivalent documents (Annual Report, quarterly results press release, DFM intimations, shareholding disclosures). No US form is treated as "missing" — none applies (§27). The Capital IQ comps sheet is USD-converted at spot; the native financials, estimates and target price are in AED — `01` must reconcile currency (AED price ≈ USD 3.32 × 3.6725 ≈ **AED 12.19**) so every per-share/AED method stays consistent (§15 FX date/rate).

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | Emaar_Properties_Annual_Report_2025.pdf | FY2025 / 31-Dec-2025 | ~6 |
| Quarterly filing | Emaar_Properties_Earnings_Press_Release_Q1_2026.pdf + CIQ Financials_Quarterly | Q1 2026 / 31-Mar-2026 | ~3 |
| Capital structure / balance sheet | Financials_Quarterly.xls → Balance Sheet / Capital Structure Summary | 31-Mar-2026 | ~3 |
| Consensus / estimate export | EmaarPropertiesPJSCDFMEMAAREstimatesReport.xls → Consensus (also 01_Consensus.xlsx) | as-of ~Jun-2026 | ~0.5 |
| Multiples export | 04_Multiples.xlsx / EstimatesReport → Multiples + CIQ Financials → Multiples | as-of ~28-Jun-2026 | ~0.4 |
| Peer / comps export | Company Comparable Analysis Emaar Properties PJSC.xls | as-of 28-Jun-2026 | ~0.4 |
| Current price (IBKR / Capital IQ) | Company Comparable Analysis → Financial Data (USD 3.32; native ≈ AED 12.19) | 28-Jun-2026 | ~0.4 |
| Cash flow statement | Financials_Quarterly → Cash Flow (LTM) / Financials_Annual → Cash Flow | 31-Mar-2026 / FY2025 | ~3 |
| Segment data | Financials_Annual → Segments + Financials_Quarterly → Segments + AR IFRS 8 note | FY2025 / 31-Mar-2026 | ~3–6 |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | Comps → Financial Data: USD 3.32 as-of 28-Jun-2026 (native ≈ AED 12.19); `ciq_facts.current_price` | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | 8,838.8m — Comps → Financial Data (as-of 28-Jun-2026); AR FY2025; `ciq_facts.shares_outstanding_m` | Market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y (effectively nil) | LTIP is **cash-settled Phantom Shares** (no dilution); single share class; no convertibles noted — mgmt-gov 03/04; AR FY2025 | Fully diluted ≈ basic — per-share fair value unaffected |
| Business type track | Y | **Real estate developer (Operating + real-estate/NAV overlay)**; multi-segment + listed subsidiary — see note below | Determines valid methods (EV/EBITDA, P/E, FCFF DCF primary; NAV + SOTP cross-checks) |
| Total debt, cash, minority/preferred | Y | Total debt AED 10,064.4m; net cash −24,969.2m (CIQ vendor basis); minority ≈ AED 3,759m; preferred none — CIQ Balance Sheet / Capital Structure (31-Mar-2026) | Enterprise-value bridge |
| Income statement (LTM or FY) | Y | CIQ Annual + Quarterly Income Statement; LTM to 31-Mar-2026 (EBITDA 25,200.7m) | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | CIQ Annual + Quarterly Cash Flow; CFO LTM 31,973m; `ciq_facts.ltm_ocf_m` | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | EstimatesReport → Consensus; target price mean AED 17.07; NTM EBITDA in comps; **LT growth consensus −14.8%** | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | CIQ Financials → Multiples (16-qtr EV/EBITDA; current 4.0x = 0th percentile of range 5.1–8.4x) | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis — 10 peers + subject (TEV/EBITDA 3.6x vs peer median 14.3x; UAE peer Aldar 8.3x) | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y | CIQ Segments: FY2025 revenue Real Estate 39,550 (80%) / Leasing-Retail 7,681 (15%) / Hospitality 2,326 (5%); segment PBT & assets & D&A also given | Sum-of-the-parts |
| Dividend / buyback data | Y | Dividend AED 1.00/share FY2023–25 (~AED 8.84bn) — AR FY2025; mgmt-gov synthesis | Shareholder-yield read |

**Business-type note.** Emaar is a build-and-sell **real estate developer** (Real Estate ~80% of revenue and ~75% of segment pre-tax profit) with a recurring rent-collecting **Leasing/Retail (malls)** segment (~15% rev / ~20% PBT), a small **Hospitality** segment (~5%), and a separately **listed development subsidiary (Emaar Development PJSC)**; the company discloses a third-party **NAV of ~AED 247bn**. This is treated as **Operating with a real-estate/NAV overlay** (not a pure REIT): EV/EBITDA, P/E and FCFF DCF are the primary methods, with NAV and SOTP as the real-estate/holding-company cross-checks. Method-map ambiguity is stated per MODULE_RULES Business-Type Method Map.

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

Also present (drives the value-trap read): **management-governance/04_ownership-and-insider-behavior.md** and **99_management-governance-synthesis.md** — both fire **RF-OWN-004** (Government of Dubai / Dubai Holding controls 29.73%; founder-MD chairs a competing developer; IAS 24 election leaves the largest related-party channel unquantified). The governance module has explicitly handed a **value-trap note to valuation**: EV/EBITDA ~4.0x at the 0th percentile of its own 16-quarter range is not, on its own, a margin of safety under a government controller. balance-sheet-survival/ (all 8 files) is also present.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N | 01, 05, 07, 99 | Not triggered — price is pool-verified (Capital IQ Comps, 28-Jun-2026) |
| No consensus / forward estimates | N | 02, 03, 04, 05 | Not triggered — CIQ Consensus + NTM estimates present |
| No peer data | N | 03, 06 | Not triggered — 10-name comp set present |
| No segment-level data | N | 06 | Not triggered — segment revenue/PBT/assets present |
| No balance sheet / capital structure | N | 01, 04, 06 | Not triggered — full balance sheet + capital-structure tabs present |
| No cash flow statement | N | 04 | Not triggered — annual + quarterly cash flow present |

**No partial-data cap is triggered.** One score cap from OUTSIDE this table WILL bind, carried from management-governance: **RF-OWN-004 (structurally misaligned controlling owner, §24 Filter 6)** → per MODULE_RULES Score-Cap rules, **valuation attractiveness max 60**, **value-trap flag mandatory**, and the verdict may be **no better than "Modestly undervalued" on a cheap multiple alone**. Agents 03, 07 and 99 must apply it.

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | CIQ Financials → Multiples, 16-qtr EV/EBITDA history; current 4.0x = 0th percentile (5.1–8.4x, median 6.5x) |
| Peer relative valuation | Y | None | 10 peers; peer median TEV/EBITDA 14.3x is skewed by distressed Chinese developers (Longfor 128.8x) — anchor on UAE/GCC peers (Aldar 8.3x, Arabian Centres 18.9x) and reconcile |
| Intrinsic DCF (Operating FCFF) | Y | None | IS + CF + BS + consensus near-term path all present. **Cyclicality gate:** developer with a land-sale cycle; consensus LT growth −14.8% and FY2025 EBITDA at a record — normalize; do not terminal on peak margins |
| Reverse DCF | Y | None | Pool-verified price present → "what's priced in" is solvable; inverts `04`'s model (WACC + normalized FCF base) |
| SOTP | Y | None | Multi-segment (Real Estate / Leasing-Retail / Hospitality) with segment revenue, PBT, assets, D&A; listed subsidiary (Emaar Development) + Direct Investments tab for equity-method stakes; leasing/malls valued NAV/cap-rate — name comparables (Aldar; Arabian Centres for malls) |

## 6. Sufficiency Verdict

- **Verdict:** **Sufficient**
- **Reason:** A usable IFRS earnings/cash-flow base (income statement AND cash flow, annual + LTM), a full balance sheet / capital structure (net cash), forward consensus estimates, a 10-name peer comp set, own-history multiples, and a pool-verified current price are all present — every one of the five valuation methods can run.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic FCFF DCF, reverse-DCF, and SOTP (all five).
- **Active partial-data caps:** none (no partial-data condition is triggered). Note separately: the **RF-OWN-004 owner-misalignment score cap** (valuation attractiveness max 60; mandatory value-trap flag; verdict no better than "Modestly undervalued" on a cheap multiple alone) will bind, carried from management-governance — it is a §24 Filter-6 cap, not a missing-data cap.
- **Critical missing items:** none material. Minor items for downstream agents: (1) the pool price is USD-converted (Capital IQ spot) — `01` must reconcile to AED-native at the 3.6725 peg (≈ AED 12.19) so all AED/per-share methods tie out; (2) CIQ estimates are duplicated across `EstimatesReport.xls` and the split `0x_*.xlsx` files — use one copy, do not double-count; (3) the CIQ "ownership" export is absent (`ciq_facts` insider/institutional-holder fields `missing`) — not required for valuation, and float/holder data is covered by the RTF ownership summaries and the FY2025 AR.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — EMAR (Emaar Properties PJSC, DFM: EMAAR)

**Jurisdiction / regime:** United Arab Emirates, listed on the Dubai Financial Market (DFM). **Reporting standard:** IFRS. **Reporting currency:** AED (UAE dirham). **Fiscal year:** ends 31 December. **FX peg:** the AED is hard-pegged to the US dollar at **3.6725 AED/USD** (UAE central-bank peg in place since 1997), so AED↔USD conversion carries negligible currency risk; the peg is used throughout and dated to the price date where a conversion is made.

Plain-English glossary (first use): **market cap** = share count × price (what the equity is worth at today's price); **enterprise value (EV)** = what you'd pay for the whole business — market cap plus debt and minority stakes, minus cash; **net debt / net cash** = total borrowings minus cash (negative = the company holds more cash than debt); **minority (non-controlling) interest** = the slice of consolidated subsidiaries owned by outside shareholders, not by Emaar; **book value** = accounting net worth of the equity; **tangible book value** = book value stripped of goodwill/intangibles; **EBITDA** = rough proxy for operating cash profit before interest, tax and depreciation (used here only for a leverage ratio, not for valuation).

**Cross-module inputs used:** `earnings/01_historical-financials.md` (net-debt bases, share count, escrow treatment) and the deterministic facts sidecar `_pool_extracts/ciq_facts.json` (pinned: net debt, total debt, LTM EBITDA, shares, price). Business-model and management-governance files exist in the run root but are not required for this anchor; the ownership/misaligned-owner read is left to the valuation synthesizer.

**Business-type note (method-validity flag for downstream, not a valuation call):** Emaar is a **hybrid real-estate business** — ~80% of FY2025 revenue is build-to-sell property development (operating-company-like; the EV bridge is meaningful), ~15% leasing/retail (malls) and ~5% hospitality (recurring-income, REIT-like; downstream `04`/`06` may value these on an asset/NAV basis, for which the EV bridge is informational per the Business-Type Method Map). This agent builds the full EV bridge and flags the split; it makes no valuation judgment.

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | **AED 12.20** ( = US$3.32 × 3.6725 peg) | CIQ Comps → Financial Data, "Day Close Price Latest" (subject row), price quoted in USD | 2026-06-28 |
| Currency | AED (native DFM trading currency); source figure quoted in USD | — | — |
| Price basis | Last close (day-close, latest) | CIQ Comps "Day Close Price Latest" | 2026-06-28 |

**Price-state: `pool-verified`.** The price is from a pool source (CIQ Comps export) and the export explicitly timestamps the quote (`As-Of Date: 2026-06-28`) — this is the quote's own as-of date, not merely a file-download date, so the vendor-export-freshness ambiguity does not apply. No web quote was needed or used.

**Currency note (important for downstream):** the CIQ Comps sheet is USD-normalized (it states "Currency: US Dollar", "Values converted at today's spot rate"), so it reports Emaar at **US$3.32**. Emaar actually trades on the DFM in **AED**, and the company reports, the consensus target (AED 17.07), and book value (AED 10.16) are all in AED. I therefore make **AED the canonical currency** and convert the price at the 3.6725 peg: US$3.32 → **AED 12.20**. Cross-check: CIQ's own comps market cap of US$29,358.4m ÷ 8,838.8m shares = US$3.3216, i.e. AED 12.20 — internally consistent.

**Two pool prices exist — I anchor on the fresher one.** A second pool source, the CIQ Financials_Quarterly "Current Capitalization" (Key-Stats) block, shows a **native AED 13.02** share price. That workbook was pulled ~2026-06-20 (no explicit quote date in the block); the Comps price is explicitly as-of 2026-06-28. The ~6.4% gap (AED 13.02 → AED 12.20) is **eight days of price movement, not a data conflict** — the stock fell that week. The freshest dated pool price (AED 12.20, 2026-06-28) is the anchor; the older AED 13.02 is shown for transparency in §3–§4.

**Staleness caveat (data-quality, not a no-price trigger):** the anchor price is 12 days old relative to the report date (2026-07-10). Downstream trailing multiples and margin-of-safety inherit that small staleness. Price-state remains `pool-verified` (§ Score-Cap rules: staleness is a data-quality caveat, not the no-price cap).

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of 2026-06-28) | 8,838.789849m | CIQ Comps "Shares Outstanding Latest"; ties to CIQ Financials_Quarterly BS "Total Shares Out. on Filing Date" [Q1 Mar-31-2026] |
| Diluted weighted-average shares (LTM/FY) | 8,838.789849m (basic = diluted) | CIQ Financials_Quarterly, EPS basic & diluted identical; earnings/01 confirms FY25 & LTM basic = diluted |
| Options/RSUs count | None disclosed / immaterial | No option or RSU dilution reported; basic EPS = diluted EPS every period |
| Convertibles / potential shares | None | Debt is revolver + term loans + senior unsecured bonds + leases; no convertibles in the capital-structure detail |
| Treasury stock | None (AED 0) | CIQ Financials_Quarterly BS "Treasury Stock" = nil [Q1 Mar-31-2026] |
| **Fully diluted shares (TSM + if-converted)** | **8,838.789849m** | = basic; no dilutive instruments to add |
| Share count used for market cap | 8,838.789849m | most recent "as-of" count (Fully Diluted Equity Rule 1) |
| Share count used for per-share fair value | 8,838.789849m | fully diluted = basic; no limitation (Fully Diluted Equity Rule 2) |

**Share Count Reconciliation Table**

| Step | Shares (m) | Note |
|---|---:|---|
| Basic shares outstanding | 8,838.789849 | Par value AED 1.00/share (Common Stock AED 8,838.79m ÷ 8,838.79m = AED 1.00) |
| + Options / RSUs (TSM) | 0.000 | none disclosed |
| + Convertibles (if-converted) | 0.000 | none |
| **= Fully diluted shares used** | **8,838.789849** | used for BOTH market cap and per-share fair value |

No material gap between basic and fully diluted — Emaar reports identical basic and diluted EPS, has no treasury stock, no options/RSU overhang, and no convertibles. The single count of **8,838.8m** is used everywhere. (Historical note, not an adjustment: the count stepped up from 8,179.7m to 8,838.8m in Q4-2022 and has been stable since; the current count is the relevant anchor.)

---

## 3. Market Capitalization

`Market cap = fully diluted shares × current price`

- **AED basis (canonical):** 8,838.789849m × AED 12.20 = **≈ AED 107,818m (≈ AED 107.8bn)**
  (equivalently, CIQ Comps market cap US$29,358.4m × 3.6725 = AED 107,818m)
- **USD basis (source):** **US$29,358.4m (≈ US$29.4bn)** [CIQ Comps "Market Capitalization Latest", as-of 2026-06-28]

Cross-reference (older pool snapshot, ~2026-06-20): at the native AED 13.02 Key-Stats price, market cap = 8,838.8m × AED 13.02 = **AED 115,081m** [CIQ Financials_Quarterly Key-Stats "Current Capitalization"]. The AED 7,263m difference vs the canonical figure is entirely the eight-day price decline (AED 13.02 → AED 12.20), not a share-count or definitional change.

---

## 4. Enterprise Value Bridge

Two cash bases are shown because they differ materially and the choice moves EV by ~AED 22.9bn (~19%). **Canonical basis = broad** (see the cash-quality box below) — it matches the deterministic facts pin (`net_debt_m −24,969.2`) and CIQ's own multiple history and peer comps, giving downstream apples-to-apples comparability. The **strict (§15-default) basis is shown alongside every time** so neither figure is presented bare. Escrow cash is excluded from **both** bases. Price/shares as-of 2026-06-28.

| Component | Broad basis (canonical), AED m | Strict basis (§15 default), AED m | Source |
|---|---:|---:|---|
| Market capitalization | 107,818 | 107,818 | §3 above (CIQ Comps, 2026-06-28) |
| + Total debt (short + long term, incl. leases) | 10,064.4 | 10,064.4 | CIQ Financials_Quarterly, Total Debt [Q1 Mar-31-2026]; = curr. LT debt 1,996.2 + LT debt 7,290.2 + leases 778.0 |
| + Minority / non-controlling interest | 13,808.3 | 13,808.3 | CIQ Financials_Quarterly BS "Minority Interest" [Q1 Mar-31-2026] |
| + Preferred equity | 0.0 | 0.0 | none (CIQ Comps LTM Pref. Equity = nil) |
| − Cash & equivalents (operating) | (12,179.5) | (12,179.5) | CIQ Financials_Quarterly BS "Cash And Equivalents" [Q1 Mar-31-2026] |
| − Short-term investments (bank term deposits) | (22,503.4) | — | CIQ BS "Short Term Investments" [Q1 Mar-31-2026] — netted in broad only |
| − Trading asset securities (mark-to-market) | (350.7) | — | CIQ BS "Trading Asset Securities" [Q1 Mar-31-2026] — netted in broad only; flagged (see box) |
| **= Enterprise value (EV)** | **≈ 96,657** | **≈ 119,511** | derived; broad ties to CIQ Comps EV |
| = EV in USD (÷ 3.6725) | **≈ US$26,320m** | ≈ US$32,543m | broad ties to CIQ Comps "Total Enterprise Value Latest" US$26,319.7m ✔ |

Arithmetic (broad): 107,818 + 10,064.4 + 13,808.3 + 0 − 35,033.6 = **96,657m AED**.
Arithmetic (strict): 107,818 + 10,064.4 + 13,808.3 + 0 − 12,179.5 = **119,511m AED**.
The AED 22,854m gap between the two = short-term deposits 22,503.4 + trading securities 350.7. The broad EV of AED 96,657m reconciles to CIQ's independently-computed comps EV of US$26,319.7m (× 3.6725 = AED 96,659m) — a clean tie-out.

> **Cash quality — what is and is not netted (this is the single biggest capital-structure judgment for EMAR).**
> Emaar's balance sheet carries four distinct "cash-like" buckets at Q1 Mar-31-2026; they are NOT interchangeable:
> - **Operating cash & equivalents — AED 12,179.5m.** Genuine unrestricted operating cash. Netted in **both** bases. ✔
> - **Short-term investments — AED 22,503.4m.** Bank **term/fixed deposits** (maturity >3 months). Unrestricted and genuinely liquid, but not "cash equivalents" in the ≤3-month sense. They are **not** a financial-subsidiary investment book, **not** restricted, and **not** mark-to-market securities — so they do not fall in the categories one excludes by default. Netted in the **broad** basis; a conservative reader who holds to the strict §15 definition excludes them (→ strict EV AED 119,511m).
> - **Trading asset securities — AED 350.7m.** These **do** carry mark-to-market P&L — the one item here in the "exclude by default" set. They are ~0.4% of EV, so immaterial; excluding just these from broad gives a "mid" net cash of AED 24,618m (vs broad 24,969m) — the difference is not decision-relevant.
> - **Restricted escrow cash — AED 43,338.5m (NOT in any base).** RERA-mandated Dubai project-escrow balances that can only fund the specific off-plan projects they belong to — **trapped**; it cannot repay debt or return to shareholders, and it is the mirror of the AED 43,689m non-current unearned-revenue (customer-advance) liability. CIQ already excludes it from "cash"; so do I, on both bases. Netting it would understate EV and flatter net debt (earnings/01 confirms the AED 43,338m is escrow). The FY2025 audited "cash and cash equivalents" of AED 52,632,912k (FY2025 Annual Report, Note 10) is a still-broader cash-flow-statement figure that folds in restricted balances — do **not** use it for the EV bridge.
>
> **Why broad is canonical here:** the AED 22.5bn of term deposits are real, unrestricted liquidity that belongs to equity holders; pinning broad also matches the facts-sidecar net-debt pin and the CIQ multiple history/peer set (all broad-basis), so downstream `02`/`03`/`04`/`06` inherit one consistent basis. The strict figure is retained as the conservative floor and shown at every appearance (§15).

**Adjustments deliberately NOT made (and why):**
- **Operating / IFRS-16 lease liabilities — already inside total debt.** CIQ's AED 10,064.4m total debt already includes AED 778.0m of lease liabilities, so no separate lease add-on is required (avoids double-counting).
- **Unearned revenue / customer advances — AED 43,689m non-current — NOT treated as debt.** These are pre-collected off-plan sale proceeds that unwind into P&L as projects complete (matched by development inventory and the escrow cash), not a financing claim repayable in cash. Adding them would double-count against the escrow already excluded.
- **Pension / end-of-service benefits — AED 210.7m — NOT added.** UAE end-of-service gratuity obligation; ~0.2% of EV, immaterial. Could be treated as a small debt-like item but is not decision-relevant.
- **Equity-method investments — AED 7,528.7m — NOT subtracted** (consistent with CIQ's EV). A purist SOTP (`06`) may value associates/JVs separately and deduct them from EV; flagged for `06`, not applied here so the anchor matches CIQ.

---

## 5. Net Debt & Leverage Snapshot

Emaar is in a **net-cash** position on every basis (it holds more cash than borrowings). Both §15 bases shown; canonical = broad.

| Metric | Broad basis (canonical) | Strict basis (§15 default) | Source |
|---|---:|---:|---|
| Total debt (incl. leases) | AED 10,064.4m | AED 10,064.4m | CIQ Financials_Quarterly, Total Debt [Q1 Mar-31-2026]; facts pin `total_debt_m 10,064.4` |
| Cash netted | AED 35,033.6m (cash + ST deposits + trading sec.) | AED 12,179.5m (cash & equivalents only) | CIQ BS [Q1 Mar-31-2026] |
| **Net debt / (net cash)** | **(AED 24,969.2m)** net cash | **(AED 2,115.1m)** net cash | broad ties to facts pin `net_debt_m −24,969.2`; strict = 10,064.4 − 12,179.5 |
| Net debt / (net cash) in USD | (US$6,799m) | (US$576m) | ÷ 3.6725; broad ties to CIQ Comps LTM Net Debt −US$6,798m ✔ |
| LTM EBITDA (CIQ standardized) | AED 25,200.7m | AED 25,200.7m | facts pin `ltm_ebitda_m 25,200.7` [LTM Mar-31-2026]; label: standardized, not company non-IFRS EBITDA |
| **Net debt / EBITDA** | **−0.99x** (≈1x EBITDA of net cash) | **−0.08x** (roughly net-flat) | broad ties to facts pin `net_debt_ebitda_x −0.99`; strict = −2,115.1 / 25,200.7 |

Reconciliation to the facts sidecar: the pinned `net_debt_m −24,969.2` is the **broad** CIQ basis; its own source_ref flags "may net short-term/liquid investments; confirm vs the strict total-debt−cash basis (§15)." I confirm: strict net cash is **AED 2,115.1m**. This is a §15 basis distinction, not a misread of the workbook — the vendor's Net Debt line is correctly −24,969.2. Both are shown. Investment-grade credit backs the low leverage: **S&P BBB+ / Moody's Baa1** (upgrades noted for 2025) [earnings/01, citing FY2025 press release]; debt is ~66% fixed-rate, weighted-average maturity ~2.5y, nearest maturity 2026-06-30, and 100% unsecured except the AED 778m of (secured) lease liabilities [CIQ Capital Structure Summary/Details, Q1 Mar-31-2026].

---

## 6. Per-Share Reference Values

Divided by the fully diluted count of 8,838.789849m. Reporting currency AED.

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | **AED 10.16** | CIQ Financials_Quarterly BS "Book Value/Share" 10.157935 [Q1 Mar-31-2026] (= Total Common Equity AED 89,783.9m ÷ 8,838.8m) |
| Tangible book value per share | **AED 10.11** | CIQ BS "Tangible Book Value/Share" 10.107857 [Q1 Mar-31-2026] (= TBV AED 89,341.2m ÷ 8,838.8m; strips AED 442.6m intangibles) |
| Net cash per share — broad (canonical) | **AED 2.82** | = AED 24,969.2m ÷ 8,838.8m |
| Net cash per share — strict (§15) | **AED 0.24** | = AED 2,115.1m ÷ 8,838.8m |

For context only (no valuation judgment): canonical price AED 12.20 vs book value AED 10.16 per share. Restricted escrow cash is excluded from the net-cash-per-share figures, as in §4–§5.

---

## 7. Anchor Summary (canonical numbers for downstream agents)

Use these verbatim. Reporting currency **AED**; USD shown at the 3.6725 peg. All balance-sheet items as of Q1 **Mar-31-2026**; price/shares/market cap as of **2026-06-28**.

- **Current price:** AED 12.20 (US$3.32), last close, as-of 2026-06-28 — **pool-verified** (CIQ Comps). 12 days stale vs report date; native currency AED.
- **Fully diluted shares (market cap AND per-share fair value):** 8,838.789849m (basic = diluted; no options/converts/treasury).
- **Market cap:** ≈ AED 107,818m (US$29,358m).
- **Net cash — canonical (broad):** AED 24,969m net cash (US$6,799m); **strict (§15): AED 2,115m** net cash — state the basis every time (§15).
- **Enterprise value — canonical (broad):** ≈ AED 96,657m (US$26,320m); **strict (§15): ≈ AED 119,511m** (US$32,543m).
- **LTM EBITDA (for leverage only):** AED 25,200.7m (CIQ standardized). Net debt/EBITDA −0.99x broad / −0.08x strict.
- **Restricted escrow AED 43,338m excluded from all cash/EV figures** (RERA-trapped) — do not re-add.

### Anchor Block (copy-forward)

- Price: **AED 12.20** (US$3.32) (as-of 2026-06-28, last close)
- Price-state: **pool-verified** — the canonical tag `05`/`07`/`99` read (staleness caveat only; not a no-price trigger)
- Currency: **AED** (reporting/native); USD at 3.6725 peg
- Shares (market cap): **8,838.789849m** (CIQ Comps / Financials_Quarterly BS, Q1 Mar-31-2026)
- Shares (per-share fair value): **8,838.789849m** (fully diluted = basic; no dilution — no limitation)
- Market cap: **≈ AED 107,818m** (US$29,358m)
- Net debt: **canonical broad (net cash) AED 24,969m**; strict (§15) net cash AED 2,115m — label basis on every use
- EV: **canonical broad ≈ AED 96,657m** (US$26,320m); strict (§15) ≈ AED 119,511m (US$32,543m)
- Key caveats: (1) price is USD-normalized in the pool → converted to AED at the 3.6725 peg; native DFM price is AED. (2) Price 12 days stale (as-of 2026-06-28). (3) **Cash-basis choice moves EV by ~AED 22.9bn (~19%)** — broad nets AED 22.5bn of unrestricted bank term deposits; use broad for CIQ/peer multiple comparability, strict as the conservative floor; state the basis every time. (4) AED 43,338m restricted escrow excluded from all bases. (5) Hybrid business — EV bridge is meaningful for the ~80% development arm; recurring-income malls/hospitality may be valued on NAV/asset basis by `04`/`06`.

---

*Reconciliation note:* every headline number here reconciles to the `ciq_facts.json` pins (net debt −24,969.2 broad; total debt 10,064.4; LTM EBITDA 25,200.7; shares 8,838.8m; price US$3.32) and to CIQ's comps EV (US$26,319.7m). No pin was overridden; the strict-basis figures are an additional §15 read, not a contradiction of the vendor's (broad) Net Debt line. No valuation judgment is made in this report.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — EMAR (Emaar Properties PJSC, DFM: EMAAR)

**Reporting currency:** AED (UAE dirham), IFRS, FY ends 31 Dec; USD shown at the 3.6725 AED/USD peg where useful. **Anchors taken verbatim from `01_price-and-capital-structure.md` §7:** price **AED 12.20** (US$3.32, last close, pool-verified, as-of 2026-06-28); fully diluted shares **8,838.789849m**; market cap **≈ AED 107,818m**; **broad (canonical) net cash AED 24,969m** / strict (§15) net cash AED 2,115m; **broad EV ≈ AED 96,657m** / strict EV ≈ AED 119,511m; LTM EBITDA AED 25,200.7m. The multiple history below is CIQ **broad-basis** (its EV nets the AED 22.5bn of bank term deposits), so this agent uses the **broad** EV throughout for apples-to-apples comparability with the history and pins (Reconciliation Gate 1); the strict-basis sensitivity is noted where it moves a number.

**Business type (method map):** Emaar is a **hybrid** real-estate business — ~80% of FY2025 revenue is build-to-sell Dubai development (operating-company-like, so P/E and EV-based multiples are meaningful), ~15% leasing/retail (malls) and ~5% hospitality (recurring-income, REIT-like, better read on an asset/NAV basis). Per the Business-Type Method Map the full multiple set is used for the development-dominated whole, and **P/BV is flagged as the most cycle-robust anchor** (book value does not swing with the property cycle the way peak development earnings do). NAV/SOTP is left to `06`.

**Cross-module inputs used:** `earnings/01_historical-financials.md` (LTM metric base), `earnings/04_guidance-consensus.md` (forward estimates, consensus), `business-model/10_external-dependency.md` (cycle-peak read), `management-governance/04_ownership-and-insider-behavior.md` + `99` synthesis (**RF-OWN-004 fired — government controller; value-trap note handed to valuation**), and the deterministic facts sidecar `_pool_extracts/ciq_facts.json`.

Plain-English glossary (first use): **multiple** = price (or enterprise value) divided by a profit/sales/book number — how many years of that number you pay; **LTM** = last twelve months (trailing); **NTM/FY** = next-twelve-months / forecast-year (forward); **EV/EBITDA** = enterprise value ÷ operating cash profit; **P/E** = price ÷ earnings per share; **P/BV** = price ÷ book (accounting net worth) per share; **re-rate / de-rate** = the market pays more / less for the same AED of profit or book; **reversion** = the multiple moving back toward its own past average; **percentile of range** = where today sits between the lowest (0%) and highest (100%) reading of its own history.

---

## 1. Current Multiples

At the `01` anchor (price AED 12.20, broad EV AED 96,657m, as-of 2026-06-28). LTM metric base from `earnings/01` §1–2 [LTM to 31-Mar-2026]. All multiples **reported/standardized (not company-adjusted)**; period basis labelled.

| Multiple | Basis | Metric Value (AED m, or per-share) | Current Multiple | Source |
|---|---|---:|---:|---|
| P / E | LTM (cycle-**peak** EPS) | EPS AED 2.141 | **5.7x** | 12.20 ÷ 2.141; facts pin `pe_ltm_current_x` 5.9x @2026-03-31 close |
| P / E | NTM / FY2026 (forward) | EPS ~AED 1.95 | **6.9x / 6.3x** | CIQ Estimates→Multiples (`04_Multiples.xlsx`) |
| EV / EBITDA | LTM (broad EV) | EBITDA 25,201 | **3.8x** | 96,657 ÷ 25,201; pin `ev_ebitda_current_x` 4.0x @2026-03-31; Comps 3.6x @2026-06-28 |
| EV / EBITDA | NTM / FY2026 (forward) | — | **3.5x / 3.7x** | CIQ Estimates→Multiples |
| EV / EBIT | LTM (broad EV) | EBIT 23,521 | **4.1x** | 96,657 ÷ 23,521 |
| EV / Sales | LTM (broad EV) | Revenue 51,858 | **1.9x** | 96,657 ÷ 51,858 |
| P / Book | latest (Q1-26) | BVPS AED 10.16 | **1.20x** | 12.20 ÷ 10.16 [01 §6] |
| P / Tangible Book | latest (Q1-26) | TBVPS AED 10.11 | **1.21x** | 12.20 ÷ 10.11 [01 §6] |
| P / FCF (FCF yield) | LTM | see note | **~4.8x (~21%)** | normalized; reported & levered readings differ sharply — see note |
| Dividend yield | FY2025 / LTM | DPS AED 1.00 | **8.2%** | 1.00 ÷ 12.20 [earnings/04 §2] |

**Reconciliation to the facts pins (no override; gaps are date, not misread).** My anchor reads sit slightly below the pins because the pins are struck at the **2026-03-31** quarter close and my anchor is the fresher **2026-06-28** price — the stock fell over that window, compressing the multiple: EV/EBITDA 3.8x (anchor) vs pin **4.0x** (2026-03-31) vs Comps **3.6x** (2026-06-28); P/E 5.7x (anchor) vs pin **5.9x** (2026-03-31). The pin's `range_position` — "EV/EBITDA 4.0x … trailing range 5.1–8.4x (median 6.5x) over 16 closes → 0%ile → near-floor" — is confirmed exactly by my independent band build in §2. No material gap.

**FCF note (§15 — three definitions, do not conflate).** Reported CFO−capex FCF is AED 30,982m → 28.7% yield / 3.5x, but it is **inflated** by ~AED 8.3bn of growth-linked customer presale-advance inflow [earnings/01 §2]; **normalized operating FCF ~AED 22.6bn → ~21% yield / ~4.8x** is the recurring read used above. CIQ's own "Levered Free Cash Flow" AED 3,067m (after interest **and** after netting real-estate/securities investment) implies Market Cap/Levered FCF **~35x / ~2.8% yield** [pin `levered_fcf_m`] — the after-all-reinvestment figure. FCF multiples have **no usable own-history band** (mostly "NM" across the CIQ series as development investment swings the levered figure), so they are current-only.

---

## 2. Historical Multiple Bands (3–5 years)

**Source:** CIQ Financials_Quarterly → Multiples tab, "Close" rows — **16 quarter-end closes, Q1-2022 → Q4-2025** (a ~4-year window, satisfying the 3–5yr rule); the 2026 readings (2026-03-31 close 3.96x; annual export 2026-06-19 close 3.90x) are treated as **current**, matching the facts-sidecar convention. Basis = broad EV / standardized LTM metrics, same as §1.

| Multiple | Min | Mean | Median | Max | Current (anchor) | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| P / E (LTM) | 6.21 | 7.71 | 7.37 | 11.49 | **5.7** | **0% (below floor)** |
| EV / EBITDA (LTM) | 5.11 | 6.45 | 6.48 | 8.39 | **3.8** | **0% (below floor)** |
| EV / EBIT (LTM) | 5.68 | 7.33 | 7.35 | 9.84 | **4.1** | **0% (below floor)** |
| EV / Sales (LTM) | 2.15 | 2.89 | 2.88 | 3.78 | **1.9** | **0% (below floor)** |
| P / BV | 0.67 | 1.02 | 0.94 | 1.50 | **1.20** | **~64%** |

**Two things the table must not hide.** (1) On **all four flow multiples the current level is below the 4-year floor** — the 2026 readings undercut even the lowest quarter-end close of 2022–2025. (2) **P/BV is the exception** — it re-rated the other way, from a 0.67–0.80x discount-to-book in 2022 to ~1.20x now (upper-mid of its own range, ~64th percentile). (3) **The window is entirely an up-cycle.** 2022–2026 was one continuous Dubai property upswing; the last Dubai downturn (2015–2019) is outside this history, so these means are **up-cycle means**, not through-cycle norms [business-model/10 §2 — "Dubai property is boom-bust (2009; 2015–2019)"].

---

## 3. Re-Rating / De-Rating Read

**The flow multiples de-rated hard; the asset multiple re-rated up — and both are explained by the same fact.** On P/E, EV/EBITDA, EV/EBIT and EV/Sales the stock trades at a **~23–44% discount to its own 4-year mean and median** (P/E −26%/−23% vs mean/median; EV/EBITDA −41%/−41%; EV/EBIT −44%/−44%; EV/Sales −36%/−35% — each computed as (current − reference)/reference), sitting at the **0th percentile, below the floor** of the 16-quarter range. This de-rating is driven by the **denominator, not the price**: EBITDA roughly tripled (AED 9.3bn → 25.2bn) and EPS nearly tripled (AED 0.83 → 2.14) since 2022 while the share price only about doubled, so the earnings multiples compressed even as the stock rose [earnings/01 §1]. On **P/BV the opposite** — a **~18% premium to the own mean and ~28% to the own median** (~64th percentile), a re-rating that tracks a genuine improvement: the balance sheet inflected from net debt to ~AED 25bn net cash, S&P upgraded to BBB+ / Moody's to Baa1, and ROIC rose 4.7% → 13.7% [earnings/01 §1, §6; 01 §5]. The single most likely reason the flow multiples sit below their floor is that **the market is capitalizing peak Dubai-cycle earnings**: consensus long-term growth is **−14.8%** and the **forward P/E (NTM ~6.9x) is above the trailing (~5.7–5.9x)** — the market is explicitly pricing an earnings decline [ciq_facts `consensus_view`; earnings/04 §4]. A low multiple on peak earnings is a warning, not a mispricing.

---

## 4. Implied Value from Reversion

Mechanical reversion of each multiple to its own **mean and median** (§2), applied to the LTM metric. EV-based rows bridge to equity with the `01` **canonical broad net cash of +AED 24,969m** (`equity = target multiple × metric + net cash`), then ÷ 8,838.789849m shares; using strict net cash instead would lower each EV-based per-share value by **~AED 2.59** (one-line reason: history and pins are broad-basis, so broad keeps the reversion self-consistent — Reconciliation Gate 1).

| Multiple (reversion target) | Target (mean / median) | Implied EV or equity, AED m | Implied AED/share | vs Current AED 12.20 |
|---|---:|---:|---:|---:|
| P/E on **LTM peak** EPS 2.141 | 7.71 / 7.37 | equity direct | 16.51 / **15.78** | +35% / **+29%** |
| P/E on **normalized** EPS ~1.95 | 7.71 / 7.37 | equity direct | 15.03 / **14.37** | +23% / **+18%** |
| EV/EBITDA on LTM EBITDA 25,201 | 6.45 / 6.48 | 162,546 / 163,302 EV | 21.22 / **21.30** | +74% / **+75%** |
| EV/EBIT on LTM EBIT 23,521 | 7.33 / 7.35 | equity via bridge | 22.33 / **22.38** | +83% / **+83%** |
| EV/Sales on LTM revenue 51,858 | 2.89 / 2.88 | equity via bridge | 19.78 / **19.72** | +62% / **+62%** |
| P/BV on BVPS 10.16 | 1.02 / 0.94 | equity direct | 10.36 / **9.55** | −15% / **−22%** |

**ONE base-case point handed to `07`: ≈ AED 12.5 — essentially fair value on its own history (a "no re-rate" case, ~+2% vs price).** Derivation: normalized EPS ~AED 2.0 (LTM peak 2.14 / consensus FY2026 ~1.95 midpoint) held at the stock's **own current depressed multiple ~6.0x** — NOT its up-cycle median of 7.37x — because two pieces of evidence forbid underwriting the re-rate (below). **This is deliberately NOT the mechanical median-reversion number.** Per the RF-OWN-004 / §24-Filter-6 rule, reversion to the old mean is **not** presented as the base case; the median-reversion figures above (P/E ~AED 15.8; EV-based ~AED 20–22) are an **illustrative exhibit only**.

**Dispersion across the multiples (the exhibit, not the base):** **~AED 9.55 (P/BV median, cycle-robust downside) to ~AED 22.4 (EV/EBIT median, illustrative upside)** — a spread of well over 40%, so the methods disagree violently and confidence is capped (Reconciliation Gate 6). The disagreement **is** the finding: the EV/EBITDA, EV/EBIT and EV/Sales reversions (~AED 20–22) are the **least reliable** because they capitalize **peak** development EBITDA/EBIT/revenue at an up-cycle multiple **and** add the large broad net-cash balance — exactly the "peak metric × mid-cycle multiple" error the cyclicality gate rejects; P/E on normalized earnings (~AED 14.4) is more defensible as an upside ceiling; P/BV (~AED 9.6–10.4) is the cycle-robust downside anchor.

**Has the warranted multiple structurally changed? Partly — and in the direction that kills the reversion trade.** (a) The balance-sheet inflection (net-debt → ~AED 25bn net cash), the BBB+/Baa1 upgrades and ROIC 4.7% → 13.7% justify a **structurally higher** multiple than the 2022 trough — which is why P/BV re-rated up, and that part is warranted, so reverting P/BV all the way down to its 0.94x median is too harsh. (b) But the low **flow** multiples sit on **record cycle-peak earnings** that consensus expects to fall ~15% into a fast-rising Dubai supply pipeline [business-model/10 §2, §4; earnings/07 §6], so applying an up-cycle mean multiple to today's peak EPS/EBITDA overstates value. (c) **RF-OWN-004 fired** (§5) — a government controller is a structural cap on re-rating. Net: the earnings-multiple "discount to own history" is **not** underwritable as upside.

---

## 5. Own-History Read

On earnings-based multiples Emaar trades at — indeed just under — the bottom of its own 4-year range (EV/EBITDA ~3.8x vs a 5.1–8.4x band; P/E ~5.7x vs 6.2–11.5x; 0th percentile), which mechanically implies AED 15–22/share if it "reverted to the mean" — but **it should not be underwritten to, and here is the blunt reason it is a value trap, not a margin of safety:** those means are **peak-cycle means off a 2022–2026 window with no Dubai downturn in it**, the earnings base is at a **record cycle peak** consensus already marks down (−14.8% long-term growth, forward P/E above trailing), and **RF-OWN-004 fired** — the **Government of Dubai (Dubai Holding group, 29.73%)** controls the company, the board is government-staffed, and an IAS 24 election leaves the largest related-party channel unquantified; the governance module handed valuation an explicit note that "a state controller can keep a name cheap and keep it cheap" [management-governance/04 §Filter 6; 99 synthesis]. The one **cycle-robust** measure, **P/BV, says the opposite of a bargain** — at ~1.20x book vs a 0.94x own-median it implies ~22% **downside** on full reversion, with only the balance-sheet-inflection part of the re-rating warranted. **Base case: roughly fair value at ~AED 12.5 (no re-rate); the 0th-percentile flow-multiple "discount" is explained by peak earnings plus a misaligned government owner, so this module's reversion table is an illustrative exhibit only and must not enter `07` as a fair-value input on the strength of the low multiple alone** (value-trap flag mandatory; per §24 Filter 6 and the valuation Score-Cap, valuation attractiveness on the reversion read is capped).

---

*Reconciliation & self-check:* Anchors (price AED 12.20, broad EV AED 96,657m, shares 8,838.789849m, net cash AED 24,969m broad) match `01` §7 verbatim. Every multiple labelled LTM / NTM / FY and reported/standardized. Historical bands cite CIQ Financials_Quarterly Multiples (16 closes) and reconcile exactly to `ciq_facts.json` (`ev_ebitda_percentile` 0%; range 5.1–8.4x, median 6.5x). Premium/discount computed as (current − reference)/reference vs the own mean and median, per multiple. Base case is ONE named point (~AED 12.5, no-re-rate) + a separate cross-multiple dispersion (~AED 9.6–22.4); the structural-change and value-trap questions are answered explicitly. RF-OWN-004 handled per §24 Filter 6: reversion-to-mean is **not** the base case; value-trap flag raised. No naked "cheap/expensive" — every level carries its % gap.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — EMAR

*Emaar Properties PJSC (DFM: EMAAR). UAE / Dubai issuer; IFRS; reporting currency AED (dirham hard-pegged to the US dollar at 3.6725 AED/USD since 1997, so AED↔USD carries negligible currency risk). Anchor inherited verbatim from `01_price-and-capital-structure.md`: price **AED 12.20** (US$3.32, pool-verified, as-of 2026-06-28), **8,838.789849m** diluted shares, market cap **AED 107,818m**, canonical **broad** enterprise value **AED 96,657m** (net cash AED 24,969m), LTM EBITDA **AED 25,200.7m**. Business type = **hybrid real-estate developer** (~80% build-to-sell development, ~15% mall leasing, ~5% hospitality) — for a build-to-sell developer, earnings and asset (book) multiples are economic, so EV/EBITDA, P/E and P/tangible-book are all valid; a full NAV / P-NAV read is `06_sum-of-the-parts`'s job, not this agent's. Plain-English notes on first use: **EV/EBITDA** = enterprise value ÷ operating cash profit (what you pay for the whole business per dollar of pre-interest, pre-tax, pre-depreciation profit); **P/E** = price ÷ earnings per share; **P/tangible book (P/TangBV)** = price ÷ accounting net worth per share stripped of intangibles; **premium/(discount)** = how far above/below the peer benchmark the stock trades; **net cash** = more cash than debt.*

**Source note.** Every peer figure comes from the in-pool CIQ export **"Company Comparable Analysis Emaar Properties PJSC.xls"** (Trading Multiples / Operating Statistics / Financial Data / Implied Valuation sheets), Capital IQ Default Comps template, **currency US Dollar, as-of 2026-06-28**. No web sourcing was needed — the peer comp set is fully in the pool. Multiples are USD-normalized but ratios are currency-neutral; per-share implied values are computed in AED off the anchor. Peer medians are the CIQ Summary-Statistics medians, which **exclude the subject (Emaar)** — verified by re-computing (e.g. median of the 10 peers' EV/EBITDA = 14.3x, ties to CIQ).

---

## 1. Peer Set

The set is **partly inherited, partly vendor-supplied.** The three named rivals come from `business-model/08_competitive-map.md`; the broader listed comp set (10 names) is the CIQ "Company Comparable Analysis" peer list (CIQ's proprietary relevancy score). I tier them by true comparability rather than treating all ten as equal.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| **Aldar Properties** | ADX:ALDAR | **Closest comp.** Same country (UAE), same currency (AED, USD-pegged), same UAE development-plus-recurring model, same cycle position, similar revenue scale (LTM US$9.5bn vs Emaar US$14.1bn), audited-public. The one clean margin/multiple anchor. | competitive-map §2C **and** CIQ comp set |
| DAMAC Properties | Private (ex-DFM) | Direct #2 Dubai off-plan developer (~AED 36bn 2025 sales, ~45% of Emaar's). **Private since 2022 — no public multiples**; cannot be placed in the comp table. | competitive-map §2A (web) — no CIQ line |
| Sobha Realty | Private | #3 Dubai off-plan luxury (~AED 30bn 2025 sales). **Private — only a sukuk rating and sales public; no public multiples.** | competitive-map §2B (web) — no CIQ line |
| Dar Al Arkan | SASE:4300 | Saudi residential developer — regional (GCC), same off-plan model; carries a Vision-2030 growth premium and smaller-float dynamics Emaar does not share. | CIQ comp set |
| Retal Urban Development | SASE:4322 | Saudi residential developer — regional, comparable model; small-cap, high-multiple. | CIQ comp set |
| Arabian Centres (Cenomi Centers) | SASE:4321 | Saudi **mall operator** — recurring-rent REIT-like economics, not a build-to-sell developer; a partial comp for Emaar's ~15% leasing arm only. | CIQ comp set |
| China Overseas Land | SEHK:688 | Chinese developer — different market (China property downturn); earnings depressed → multiples cycle-distorted. Weak comp. | CIQ comp set |
| CK Asset Holdings | SEHK:1113 | HK/diversified developer-investor; different market and mix. Weak comp. | CIQ comp set |
| C&D International | SEHK:1908 | Chinese developer — China-cycle-distorted. Weak comp. | CIQ comp set |
| Poly Property | SEHK:119 | Chinese developer — China-cycle-distorted. Weak comp. | CIQ comp set |
| Yuexiu Property | SEHK:123 | Chinese developer — earnings collapsed (EBITDA −46% YoY) → 32x EV/EBITDA is a distressed artifact. Weak comp. | CIQ comp set |
| Longfor Group | SEHK:960 | Chinese developer — EBITDA −74% YoY → **128.8x** EV/EBITDA is meaningless (collapsed denominator). Weakest comp; distorts the peer mean. | CIQ comp set |

**Read on the set.** Only **one** peer is genuinely comparable — **Aldar** (same market, cycle, currency, audited). The two most direct Dubai rivals (**DAMAC, Sobha**) are **private, so no public multiples exist — flagged, not guessed.** The three Saudi names are regional GCC comps with a Vision-2030 premium; the six Chinese/HK names are in a different property cycle (the China downturn) and several have **collapsed earnings that mechanically inflate their multiples** — they raise the peer *mean* far above the *median* and should not be read as "what quality costs." I therefore carry the full-set median (mechanical benchmark), a Gulf/MENA-developer sub-median, and Aldar (the clean anchor) side by side.

---

## 2. Peer Multiples & Operating Stats

All figures CIQ "Company Comparable Analysis" export, as-of **2026-06-28**, LTM unless labelled NTM (forward). Emaar's LTM EBITDA (US$6,861.1m ≈ AED 25,197m) and net cash (LTM Net Debt −US$6,798m ≈ AED 24,969m) tie to the anchor; the comp set uses the **broad** net-cash basis for Emaar, matching `01`.

### 2A. Valuation multiples

| Company | P/E LTM | P/E NTM | EV/EBITDA LTM | EV/EBIT LTM | EV/Sales LTM | P/TangBV LTM |
|---|---:|---:|---:|---:|---:|---:|
| **Emaar (subject)** | **5.7** | **6.9** | **3.6** | **3.9** | **1.9** | **1.2** |
| Aldar (closest comp) | 8.5 | 7.6 | 8.3 | 8.8 | 2.4 | 1.6 |
| Dar Al Arkan | 16.1 | 17.3 | 13.0 | 13.3 | 6.6 | 0.9 |
| Retal Urban | 21.3 | 18.0 | 17.0 | 18.4 | 3.1 | 5.7 |
| Arabian Centres (mall op.) | 6.5 | 8.1 | 18.9 | 19.4 | 10.8 | 0.5 |
| China Overseas Land | 9.4 | 9.2 | 15.6 | 16.0 | 1.8 | 0.3 |
| CK Asset | 14.2 | 10.8 | 10.4 | 11.9 | 3.0 | 0.4 |
| C&D International | 7.5 | 7.1 | 10.7 | 10.9 | 0.8 | 0.9 |
| Poly Property | 24.2 | 20.3 | 13.0 | 13.6 | 1.2 | 0.2 |
| Yuexiu Property | 220.1 | 31.7 | 32.2 | 36.5 | 1.4 | 0.2 |
| Longfor Group | 36.1 | NM | 128.8 | 154.1 | 2.6 | 0.2 |
| **Peer median (10, ex-Emaar)** | **15.2** | **10.8** | **14.3** | **14.8** | **2.5** | **0.5** |
| *Peer mean (ex-Emaar)* | *36.4* | *14.5* | *26.8* | *30.3* | *3.4* | *1.1* |
| *Gulf/MENA developer median (Aldar/Dar Al Arkan/Retal)* | *16.1* | *17.3* | *13.0* | *13.3* | *3.1* | *0.9* |

### 2B. Operating statistics (the quality picture)

| Company | Rev Grw LTM | EBITDA Mgn | EBIT Mgn | Net Mgn | Net Debt/EBITDA | ROIC (LTM) | FCF Yield |
|---|---:|---:|---:|---:|---:|---:|---:|
| **Emaar (subject)** | **+33.4%** | **48.6%** | **45.4%** | **36.4%** | **−1.0x (net cash)** | **13.7%** | **~2.8%** |
| Aldar (closest comp) | +38.1% | 28.9% | 27.2% | 23.0% | +0.9x | n/d | n/a |
| Dar Al Arkan | +8.0% | 42.9% | 41.9% | 28.7% | +4.7x | n/d | n/a |
| Retal Urban | +15.0% | 17.9% | 16.7% | 11.6% | +3.6x | n/d | n/a |
| Arabian Centres | −3.1% | 57.1% | 55.5% | 55.2% | +12.6x | n/d | n/a |
| China Overseas Land | −9.2% | 10.9% | 10.7% | 7.6% | +7.9x | n/d | n/a |
| CK Asset | +27.3% | 22.2% | 18.4% | 19.2% | +1.2x | n/d | n/a |
| C&D International | −4.3% | 7.3% | 7.3% | 2.7% | +3.2x | n/d | n/a |
| Poly Property | +20.3% | 9.3% | 9.0% | 0.5% | +8.7x | n/d | n/a |
| Yuexiu Property | +0.1% | 3.2% | 3.0% | 0.1% | +21.6x | n/d | n/a |
| Longfor Group | −23.7% | 3.2% | 2.9% | 1.1% | +43.9x | n/d | n/a |
| **Peer median (ex-Emaar)** | **+4.0%** | **14.4%** | **13.7%** | **9.6%** | **+6.3x** | **n/d** | **n/a** |

Sources: multiples and operating stats — CIQ "Company Comparable Analysis" (Trading Multiples / Operating Statistics / Financial Data), as-of 2026-06-28. Net Debt/EBITDA computed = LTM Net Debt ÷ LTM EBITDA (Financial Data). Emaar ROIC 13.7% LTM — `ciq_facts.json` multi_year_trajectory (LTM Mar-2026); **peer ROIC "n/d" (not disclosed)** — not carried in the CIQ export and not audited-public for the private names, so net margin stands in as the peer profitability proxy (competitive-map §2C). Emaar FCF yield = LTM levered FCF AED 3,066.7m (`ciq_facts.json`; after interest and development spend) ÷ market cap AED 107,818m; **peer FCF yield "n/a"** — not in the comp export, so no peer FCF-yield median can be built. "NM"/"n/d" not invented.

**What the operating stats say in one line:** Emaar out-earns the entire peer set on every margin line (48.6% EBITDA margin vs 14.4% peer median; 36.4% net margin vs 9.6%), is the **only net-cash company** in the group (−1.0x vs +6.3x peer-median net debt/EBITDA), grows faster than the peer median (+33.4% vs +4.0%), and posts a 13.7% ROIC — but that ROIC is a **cyclical peak** (FY2021→LTM ran 4.7%→5.7%→8.5%→9.8%→12.5%→13.7%; through-cycle ~8–10% per `business-model/07`, `09`).

---

## 3. Premium / Discount to Peer Median

`Premium/(Discount) = (Emaar multiple − peer median) / peer median` (÷ the peer median, the reference). Positive = Emaar more expensive; negative = Emaar cheaper. For the price multiples below, a discount = cheaper.

| Multiple | Emaar | Peer Median | Premium / (Discount) | vs Aldar (closest comp) |
|---|---:|---:|---:|---:|
| EV/Sales LTM | 1.9 | 2.5 | **(24.0%)** | (20.8%) |
| EV/EBITDA LTM | 3.6 | 14.3 | **(74.8%)** | (56.6%) |
| EV/EBIT LTM | 3.9 | 14.8 | **(73.6%)** | (55.7%) |
| P/E LTM | 5.7 | 15.2 | **(62.5%)** | (32.9%) |
| **P/E NTM (forward)** | 6.9 | 10.8 | **(35.8%)** | **(9.6%)** |
| EV/EBITDA NTM (forward) | 3.5 | 14.4 | (75.4%) | (47.7%) |
| P/TangBV LTM | 1.2 | 0.5 | **+140.0% (premium)** | (25.0%) |

**Two facts jump out.** (1) Emaar trades at a deep discount on every **earnings/EV** multiple — but at a **+140% premium to the peer median on tangible book** (1.2x vs 0.5x), because the market correctly pays more per dollar of Emaar's assets given its far higher returns, while several peers (distressed Chinese developers) sit below book. So this is not a stock the market thinks is broken — it is a high-return asset base whose *earnings* multiple is compressed. (2) The trailing discount (−62% on P/E) **collapses to −10% versus Aldar on forward P/E** (6.9x vs 7.6x) — because consensus expects Emaar's EPS to *fall* (NTM EPS US$0.48 < LTM US$0.58; long-term growth −14.8% per `ciq_facts.json`) while peers' earnings hold or recover. Much of the "cheapness" is a trailing, peak-earnings artifact, not a forward one.

**Is the gap typical or unusual? — Not assessable for the peer-relative history.** The CIQ comp set is a single point-in-time snapshot (as-of 2026-06-28); no ~3-year peer-multiple history is in the pool, and none could be sourced, so I **cannot** state whether today's discount-to-peers is wider or narrower than Emaar's own norm — marking it **Not assessable** rather than inventing it. Context (belongs to `02_multiples-own-history`, not this agent): Emaar's *own* EV/EBITDA is at the **0th percentile of its 16-quarter range** (3.6–4.0x now vs a 5.1–8.4x range, median 6.5x per `ciq_facts.json` range_position) — i.e. its absolute multiple is at a 4-year floor. That is suggestive that the discount is at or near its widest, but because I cannot see whether peers de-rated in step, the *relative* gap over time stays Not assessable.

---

## 4. Is the Gap Warranted?

**Largely warranted versus the raw peer median; only modestly too deep versus the one clean comparable — and the residual is capped by a government-control value-trap flag.** The 75% EV/EBITDA discount to the 14.3x peer median is **not** a clean buy signal: it is inflated by (a) Emaar's **net-cash balance sheet** mechanically compressing its EV (every peer carries net debt, median +6.3x EBITDA; Emaar is −1.0x), (b) **peak-cycle earnings** — LTM EBITDA/ROIC sit at a Dubai-cycle high that `earnings/99` and `business-model/07`/`09` all flag as peaking ~2029 then declining (consensus long-term growth −14.8%), which mechanically lowers the trailing multiple, and (c) six **China/HK peers whose collapsed earnings inflate their own multiples** — genuinely different businesses, not a quality benchmark. I would **not** underwrite reversion to 14.3x. Against **Aldar** — the only true comp (same country, cycle, currency, audited) — Emaar's 57% EV/EBITDA and 33% trailing-P/E discount is only *partly* justified: Emaar out-earns Aldar on every margin line (48.6% vs 28.9% EBITDA), carries a far stronger balance sheet (net cash vs +0.9x), holds ~2x the sales and the #1 Dubai brand/land position — quality that warrants a *premium*, not a half-price multiple; but Aldar has a more durable earnings mix and a far better growth outlook (−1.7% vs Emaar's −14.8% long-term), and on **forward** P/E the gap to Aldar is already only 10%. Net of the offsets, the moat is **narrow and eroding** (through-cycle ROIC ~7.5–9.5% vs ~11–12% cost of capital — it clears the hurdle only at the peak) and the controller is the **Government of Dubai (Dubai Holding group, 29.73%) — RF-OWN-004 fired** (`management-governance/04`), so persistent cheapness is a **value-trap risk, not an automatic margin of safety**. **Conclusion: the discount to the raw peer median is warranted; the residual discount to the clean comp (Aldar) is modestly too deep, implying limited — not material — relative upside, and that upside is both peak-earnings-inflated and gated by the government-control value-trap flag.**

---

## 5. Implied Value from Peer Multiples

I do **not** apply the raw peer median (14.3x EV/EBITDA → ~AED 42/share) — it is cycle-distorted and unwarranted (Section 4). Instead I apply **quality-adjusted warranted multiples**, anchored on **Aldar** (the clean comp) discounted for Emaar's worse long-term-growth outlook, single-city concentration, peak-cycle earnings, and government-control overhang, and cross-checked against Emaar's own through-cycle range. Each peer multiple is applied to Emaar's metric **on the same basis** (LTM multiple → LTM metric; forward → forward). AED equity bridge from `01` (broad basis): `Equity = implied EV − total debt 10,064.4 − minority 13,808.3 + broad cash 35,033.6 = implied EV + 11,160.9`; ÷ 8,838.79m shares.

| Multiple (basis) | Warranted mult. | Quality adjustment applied | Implied EV / Equity (AED m) | Implied Price/Share | vs Price (AED 12.20) |
|---|---:|---|---:|---:|---:|
| **EV/EBITDA LTM — PRIMARY (base case)** | **5.5x** | Aldar 8.3x × ~0.66 — discount for −14.8% LT growth, single-city concentration & govt overhang; a premium to Emaar's own 3.6–4.0x floor its margins/balance sheet don't justify; net cash credited in the bridge | EV 138,604 / Eq 149,765 | **AED 16.94** | **+38.9%** |
| EV/EBIT LTM | 6.0x | Aldar 8.8x × ~0.68 (same logic; on Financial-Data EBIT AED 23,517m — CIQ's published 3.9x uses a slightly higher EBIT) | EV 141,102 / Eq 152,263 | AED 17.23 | +41.2% |
| P/E LTM | 8.0x | Aldar 8.5x (≈ parity — Emaar's better margins offset by worse growth) | Eq 150,738 | AED 17.04 | +39.7% |
| P/E NTM (forward → forward EPS AED 1.763) | 8.0x | ≈ Aldar's forward 7.6x; applied to the *lower* forward EPS → captures the expected earnings decline | Eq 124,676 | AED 14.10 | +15.6% |
| EV/Sales LTM | 2.5x | Peer median (Emaar's ~2x margins justify at least the median, vs its 1.9x) | EV 129,628 / Eq 140,788 | AED 15.93 | +30.6% |
| P/TangBV LTM (least cycle-distorted) | 1.4x | Above Emaar's 1.2x for superior ROE; below Aldar's 1.6x for growth/governance | Eq 125,006 | AED 14.14 | +15.9% |

**Base case (one point): AED 16.9/share** — the warranted **5.5x EV/EBITDA (LTM)**, the primary multiple. This is the point `07` should weight. It corroborates the consensus target (AED 17.07 mean / 17.50 median, `ciq_facts.json`).
**Dispersion across multiples (current-metric basis): ~AED 14.1 to ~AED 17.2** (low = P/TangBV 1.4x / forward P/E; high = EV/EBIT). All warranted multiples sit above today's AED 12.20.

**Mandatory peak-earnings cross-check (do not skip).** The base case applies a mid-cycle multiple to **peak** LTM EBITDA, so it sits at the **high end** of what is defensible. Normalizing EBITDA down ~28% toward through-cycle (consistent with `business-model/09`'s through-cycle ROIC ~8–10% vs 13.7% peak, and `earnings/06`'s normalized operating FCF ~AED 22.6bn vs reported ~AED 31bn), the **same 5.0–5.5x implies ~AED 11.5–12.6/share — i.e. roughly the current price.** So the genuine, through-cycle relative-value point is far closer to fair than the +39% headline: the peer-multiple method says Emaar is **cheap on trailing peak metrics but roughly fairly valued once the cycle is normalized.** `07` should weight the base point against this normalized anchor and the DCF (`04`).

---

## 6. Relative Read

**On trailing multiples Emaar looks deeply cheap — a 75% EV/EBITDA and 62% P/E discount to the peer median — but most of that gap is warranted: it is net-cash EV compression, peak-cycle earnings, and six China/HK names whose collapsed profits inflate the median, not a mispricing to arbitrage.** Against the one clean comparable, Aldar, the residual discount (−57% EV/EBITDA, but only −10% on forward P/E) is modestly too deep given Emaar's superior margins, net-cash balance sheet and #1 position — pointing to **limited, not material, relative upside**, with a peer-multiple base case of **AED 16.9/share** (warranted 5.5x LTM EV/EBITDA; dispersion AED 14.1–17.2) that drops to **~AED 11.5–12.6 once earnings are normalized** to through-cycle. The upside is **capped by the RF-OWN-004 government-control value-trap flag** — a state controller can keep this name cheap indefinitely — though a ~8% dividend yield (AED 1.00/share, 100% of share capital, paid pro-rata to minorities per the FY2025 press release) pays holders to wait. **Net: modestly cheap versus the clean peer on peak metrics, roughly fair through the cycle, and not a multiple to underwrite re-rating to the peer median.**



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — EMAR (Emaar Properties PJSC, DFM: EMAAR)

**Reporting standard:** IFRS. **Currency:** AED millions (dirham pegged to USD at 3.6725; USD shown at that peg). **Fiscal year:** ends 31 December. **Method:** FCFF DCF (unlevered free-cash-flow to the firm, discounted to enterprise value, then bridged to equity).

**Business-type gate applied.** The `00` triage classifies Emaar as **Operating with a real-estate / NAV overlay** — ~80% of revenue is build-to-sell property development (operating-company-like; the EV bridge is meaningful), ~15% leasing/retail (malls) and ~5% hospitality (recurring, REIT-like). Per the MODULE_RULES Business-Type Method Map, the triage names **EV/EBITDA, P/E and FCFF DCF as the primary methods, with NAV and SOTP as cross-checks** — so an FCFF DCF is valid here and is what this agent builds. The malls/hospitality NAV and the listed-subsidiary look-through are `06_sum-of-the-parts`'s job, not re-done here. **Cyclicality gate is live** (a Dubai property-cycle developer at a record-2025 peak; consensus long-term growth −14.8%): the base and terminal are normalized off the peak, not extrapolated from it.

**Plain-English glossary (first use):** *FCFF* = free cash flow to the firm — the cash the operations throw off before financing, available to all capital providers; *NOPAT* = operating profit after a normalized tax, before financing; *WACC* = weighted-average cost of capital (the blended return debt and equity holders require — the discount rate); *terminal value (TV)* = the value of all cash flows beyond the explicit forecast; *ROIC* = return on invested capital (profit earned per AED 100 of capital); *mid-year convention* = discounting each year's cash as if it arrives mid-year, since cash flows in through the year, not all on 31 December.

---

## 1. FCF Base & Normalizations

**Base year: FY2025 (audited) with an LTM-to-Mar-2026 cross-check.** FY2025 is a **cyclical peak** — Dubai's strongest year on record — so the base is used only to anchor the *level*; the forecast (§2) normalizes margins, cash tax and the working-capital tailwind down through the cycle. A full cash flow statement exists (annual + LTM), so FCF is **not** proxied — no partial-data FCF cap applies.

| Item | Base-Year Value (LTM Mar-26) | Normalization Applied | Source |
|---|---:|---|---|
| Reported FCF (CFO − PP&E capex) | 30,982 | **Headline — inflated; not used as the base.** | earnings/06 §1; CIQ Cash Flow |
| − Customer-advance build (Δ contract liabilities) | (8,347) | Cyclical working-capital tailwind (off-plan pre-collections outrunning handovers) — reverses when the cycle turns; stripped from the recurring base | earnings/06 §1, §10 |
| − Cash-tax-lag normalization (to accrued 15%) | (~2,494) | Cash tax paid AED 874m vs accrued ~AED 3,368m; the payable is building — normalize to the structural 15% rate | earnings/06 §8; CIQ IS |
| = **Normalized operating FCF (recurring, peak-year)** | **~20,140** | Lead figure (§15) — the recurring cash, not the AED 31bn headline | derived |
| **Normalized FCFF, NOPAT-based (accrued 15% tax)** | **~19,700** | = EBIT 23,521 × (1−0.15) + D&A ~1,680 − capex ~2,000 + non-advance ΔWC ~0 | derived; CIQ IS/CF |
| Memo — FY2025 EBIT / EBIT margin | 22,552 / **45.5%** | **Cyclical PEAK margin** — flattered by cheap legacy-land spread; forecast fades it | CIQ IS |
| Memo — LTM EBITDA (CIQ standardized) | 25,201 | For leverage/multiple context only | ciq_facts `ltm_ebitda_m` |
| Excluded — net finance income (~2,013 FY25) | non-operating | Return ON the cash pile → captured via the net-cash add-back in the §6 bridge (not double-counted in FCFF) | earnings/06 §1 |
| Excluded — securities/term-deposit investing (−7,679 FY25) | treasury | Deploying excess cash into deposits — a financing/treasury choice, not operating capex | CIQ Cash Flow |

**The base is ~AED 19.7–20bn of normalized FCFF at peak-year revenue/margins** — materially below the AED 31bn reported FCF and consistent with earnings/06's finding that reported cash overstates steady-state by ~27%. The forecast normalizes this down through the cycle.

---

## 2. Forecast Assumptions

Explicit horizon **10 years (FY2026–FY2035)** — long enough to model a full Dubai cycle (backlog-conversion up-leg → roll-over → mid-cycle) so the terminal is struck on **normalized, not peak**, cash. Every cell labeled.

| Assumption | Yr1 26 | Yr2 27 | Yr3 28 | Yr4 29 | Yr5 30 | Yr6 31 | Yr7 32 | Yr8 33 | Yr9 34 | Yr10 35 | Terminal | Source / Basis |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|---|
| Revenue growth % | +7.1 | +13.9 | +5.9 | −6.3 | −13.3 | −11.5 | −4.3 | +4.0 | +4.0 | +4.0 | +1.5 | 26–27 **consensus**; 28 near-consensus; 29–35 **analyst** cycle path |
| Revenue (AED m) | 53,089 | 60,456 | 64,000 | 60,000 | 52,000 | 46,000 | 44,000 | 45,760 | 47,590 | 49,494 | — | ″ |
| EBIT margin % | 43 | 41 | 38 | 36 | 34 | 32 | 31 | 33 | 34 | **35** | **35** | **consensus-derived** GM fade → EBIT (26–28); **analyst** down-cycle 29–35 |
| Tax rate % (NOPAT) | 15 | 15 | 15 | 15 | 15 | 15 | 15 | 15 | 15 | 15 | **15** | **moat canonical anchor** (UAE DMTT/Pillar-Two floor) — §3 reconciles |
| Capex (% revenue) | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | 4.0 | **analyst** (FY25 PP&E 934 + inv-property 1,015 = 3.9% rev); consensus capex 2.0–2.3bn |
| D&A (% revenue) | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | 3.1 | **analyst** (FY25 D&A/rev 3.2%) |
| Contract-liab. (advances) % rev | 82 | 80 | 74 | 68 | 62 | 58 | 57 | 57 | 58 | 58 | 58 | **analyst** — revenue-linked WC driver (FY25 40,724/49,557 = 82%) |

**Margin normalization (Cyclicality Gate — three anchors cited).** The terminal/mid-cycle **EBIT margin of 35%** is set *between* documented cycle points, not "below the recent peak":
- **FY2025 peak: 45.5%** [CIQ IS] — rejected as terminal (flattered by the cheap legacy-land spread, which management guides *down*: gross margin 63% FY23 → 55% FY25 → "low 50s" [earnings/03 §3]).
- **Peer-normal (Aldar, the one audited UAE peer): EBIT ~27.2%** [business-model/09 §3] — the terminal keeps a **~+8pp genuine premium** over Aldar, which the moat module confirms is real (brand + Downtown-Dubai location + land bank), but sheds the cyclical half of the current ~18pp gap.
- **Prior-trough (FY2021: EBIT 23.5%; FY2022: 32.3%)** [CIQ IS] — the terminal 35% sits **above** the trough (mid-cycle, not trough); the modeled **down-cycle low of 31% (FY2032)** sits just below FY2022's 32.3%, reflecting the moat module's *eroding* land-spread (a future trough can be worse than the last because the cheap-land buffer is smaller).

**Working capital scales with revenue (revenue-linked driver, not a flat absolute).** Emaar is a **negative-working-capital business** — buyers pre-fund construction, so contract-liability advances (AED 40,724m) exceed trade+unbilled receivables (11,137m) ~3.7x and the cash-conversion cycle is negative on a customer-funded basis [earnings/06 §3]. I model the dominant WC item — customer advances — as a **% of revenue** (the disclosed driver), and take the WC cash effect from the modeled year-on-year change in that balance (§4). The non-advance WC (development inventory build vs receivables/payables release) nets to ~0 through the cycle [earnings/06 §1: FY21–LTM non-advance WC averages ~0] and is folded in.

---

## 3. Discount Rate (WACC)

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.50% | US 10Y ~4.54% (Web: 2026-07-10, indicative/unverified); AED pegged to USD → US 10Y is the AED risk-free proxy |
| Equity-risk premium (UAE, total) | 4.87% | Damodaran 2026 (Web, unverified): mature-market 4.23% + UAE country-risk-premium 0.64% |
| Beta | 1.15 | Analyst — cyclical single-city developer; net cash → asset beta ≈ equity beta (matches business-model/09) |
| **Cost of equity (CAPM)** | **10.10%** | = 4.50% + 1.15 × 4.87% |
| Pre-tax cost of debt | 5.00% | Emaar 2029 sukuk ~5.0% mid (Web, unverified); S&P BBB+ / Moody's Baa1 |
| Tax rate (shield) | 15% | Normalized (§1) — same rate as NOPAT |
| After-tax cost of debt | 4.25% | = 5.00% × (1 − 0.15) |
| Equity / debt weights (market value) | 91.5% / 8.5% | mkt cap 107,818 / total debt 10,064.4 (valuation/01) |
| **WACC — computed** | **9.60%** | formula below |
| **WACC — used (base)** | **10.5%** | override justified below |

**Formula (executed, not eyeballed):**

```
== WACC BLEND ==
ke (CAPM) = 0.0450 + 1.15*0.0487 = 0.1010 (10.10%)
kd after-tax = 0.0500*(1-0.15) = 0.0425 (4.25%)
weights we=0.9146 wd=0.0854 (sum 1.000)
WACC computed = 0.9146*0.1010 + 0.0854*0.0425 = 0.0960 (9.60%)
WACC USED (base) = 10.5%  [computed 9.60%; moat-inferred ~11.4%; grid spans 9.5-11.5%]
```

**Override discipline (computed 9.60% → used 10.5%, +0.9pp, within ±1.5pp).** One-sentence justification: the 8.5% debt weight overstates any leverage benefit for a company holding ~3.5x more cash than debt — for a net-cash business WACC should approximate the **cost of equity (~10.1%)**, not be discounted below it — and a **single-city Dubai property-cycle** equity warrants a premium over the Aa2-sovereign-anchored Damodaran UAE ERP (Dubai's own credit is weaker than Abu Dhabi's). **Gate-4 cross-check:** the moat module (`09_moat.md` §3) independently infers a cost of capital of **~11.4% (range 10–12.5%)** using a higher 6.0% ERP; my 10.5% is within 0.9pp of it (inside the ~2pp tolerance), and the **§7 grid spans 9.5%–11.5%, covering both my computed 9.6% and the moat's 11.4%** — so no single rate is asserted. This WACC and the §1 normalized FCF base are the canonical inputs the reverse-DCF (`05`) inverts.

---

## 4. Free Cash Flow Forecast & Discounting

`FCFF = NOPAT + D&A − capex + WC cash effect`, where the **WC cash effect = +Δ(contract-liability balance)**. Because customer advances are a *liability*, a rise in that balance is a *fall* in net working capital → it **releases cash and ADDS to FCFF**; a fall in the balance absorbs cash and subtracts (i.e. +ΔCL = −ΔNWC). Mid-year convention (discount at t−0.5).

```
== EXPLICIT FCFF (AED m) ==
  Yr     Rev  EBm   EBIT  NOPAT   D&A  Capx     CL    dCL   FCFF    DF     PV
2026   53089  43%  22828  19404  1646  2124  43533   2809  21735 0.951  20677
2027   60456  41%  24787  21069  1874  2418  48365   4832  25357 0.861  21830
2028   64000  38%  24320  20672  1984  2560  47360  -1005  19091 0.779  14874
2029   60000  36%  21600  18360  1860  2400  40800  -6560  11260 0.705   7939
2030   52000  34%  17680  15028  1612  2080  32240  -8560   6000 0.638   3828
2031   46000  32%  14720  12512  1426  1840  26680  -5560   6538 0.577   3775
2032   44000  31%  13640  11594  1364  1760  25080  -1600   9598 0.523   5016
2033   45760  33%  15101  12836  1419  1830  26083   1003  13427 0.473   6350
2034   47590  34%  16181  13754  1475  1904  27602   1519  14844 0.428   6353
2035   49494  35%  17323  14724  1534  1980  28707   1104  15383 0.387   5958
Sum PV of explicit FCFF (mid-year) = 96,600
```

**Sum of PV of explicit FCFs: AED 96,600m.**

**Working-capital sign — checked against the modeled ΔCL, not assumed.** While the advance ratio is held (~80–82%, FY2026–27) and revenue grows, the contract-liability balance *rises* (+2,809, +4,832) → this negative-WC business **releases cash → ADDS to FCFF** (as required for a negative-WC book). Once the ratio mean-reverts down *and* revenue rolls over (FY2028–2032), the balance *falls* (−1,005 → −8,560) → it **absorbs cash → SUBTRACTS from FCFF** — the advance-reversal earnings/06 §10 flagged. Net over the decade the balance falls AED 40,724 → 28,707 = **−12,017 (a net cash USE of ~AED 12bn)**, so the WC tailwind is not extrapolated — it reverses net through the cycle. Sanity check passes: revenue *growing* in FY2026–27 with the ratio held → WC *adds* (correct sign for a negative-WC business); revenue *falling* with the ratio reverting → WC *cuts* (correct).

---

## 5. Terminal Value

**Method — Gordon growth, struck at ROIC ≈ WACC (no perpetual excess return).** Formula (written out): `TV = FCFF_{n+1} / (WACC − g)`, with `FCFF_{n+1} = NOPAT_terminal × (1+g) × (1 − g/ROIC)`. Setting terminal **ROIC = 9.5%** honors the moat module's economic test — **through-cycle ROIC ~7.5–9.5%, at or below the ~10.5–11.4% WACC**; Emaar clears its cost of capital only at the cyclical peak [business-model/09 §3]. The terminal therefore carries **no durable excess return**, and TV collapses to ≈ NOPAT/WACC.

```
== TERMINAL (BASE: ROIC 9.5% < WACC 10.5%, g 1.5%) ==
NOPAT_2035=14,724 EBITDA_2035=18,857 reinv=15.8%
FCFF_2036=12,586  TV=139,839  (= NOPAT/WACC check 140,233)
implied exit EV/EBITDA=7.4x (on NORMALIZED EBITDA; market 4.0x on PEAK EBITDA; Aldar 8.3x)
PV_TV=54,161  TV%EV=36%   EV=150,761
```

- Terminal g (base) = **1.5% nominal** — below UAE long-run nominal GDP (~4–5%) and below the ~2% inflation-plus-real proxy; because ROIC ≈ WACC, **g barely moves TV** (see §7), so the value is driven by WACC and the mid-cycle margin, not by g. `WACC − g` = 9.0pp, comfortably positive.
- **Terminal value (undiscounted): AED 139,839m.** **PV of TV: AED 54,161m.**
- **Terminal value as % of total EV: 36%** — well under the 75% terminal-dominance flag. The value sits mostly in the *visible* explicit cash flows, a point of strength for confidence.
- **Exit-multiple cross-check:** the Gordon TV implies **7.4x EV/EBITDA on normalized (mid-cycle) EBITDA** — sane for a mature developer earning its cost of capital (Aldar trades 8.3x), but note the market today applies only **4.0x on PEAK EBITDA**. The gap (4.0x → 7.4x) is the **value-trap question** (§7): if the government-owner discount is structural, the multiple need not re-rate.

**Structural-decline / runoff terminal (bear input — eroding-moat trigger fired, `CLAUDE.md` §24 Filter 5 lens).** The moat module returns a **Narrow moat with an *eroding* economic trajectory** (land-spread narrowing, new 15% tax, competition rising at the peak, consensus −14.8% LT growth) and explicitly hands this DCF the "peak-return / declining-perpetuity treatment" — so alongside the Gordon base I build a **runoff terminal**: **g = 0% nominal (≈ −2% real, below UAE ~2% inflation), terminal EBIT margin faded to 28%** (toward Aldar's 27% plus a thin residual premium), exit ~6.7x. This yields TV ~AED 103bn and a per-share of **~AED 17.6 (book NCI)**, or **~AED 15.0** combining the runoff terminal with the economic-minority deduction and a 5.0x exit. *(Note: the industry rate-of-change score is 72/100 — well above 40 — so §24 Filter 5's disruption trigger does NOT fire; this runoff is driven by the eroding **economic** moat and cyclicality, not by technology disruption.)* **This runoff is the structural-impairment scenario that feeds `07`'s structural-reset bear — it does not replace the base.**

---

## 6. DCF Output

Bridge uses valuation/01's anchors verbatim (broad/canonical net cash; book NCI). FCFF is the full consolidated operating cash flow, so associates (equity-method income is excluded from EBIT) are **added** and the minority claim is **deducted**.

| Step | Value (AED m) | Per share (AED) |
|---|---:|---:|
| PV of explicit FCFs | 96,600 | 10.93 |
| + PV of terminal value | 54,161 | 6.13 |
| **= Enterprise value (DCF)** | **150,761** | 17.06 |
| + Net cash (broad, canonical — valuation/01) | 24,969 | 2.82 |
| + Equity-method investments (associates/JVs) | 7,529 | 0.85 |
| − Minority interest (book NCI — valuation/01) | (13,808) | (1.56) |
| − Preferred | 0 | 0 |
| **= Equity value** | **169,451** | |
| ÷ Diluted shares (8,838.789849m) | | |
| **= Intrinsic value per share (base, book-NCI bridge)** | | **AED 19.2** |
| **Intrinsic per share (economic-minority basis, NCI at ~21% of EV)** | 151,589 | **AED 17.2** |
| **Central base-case intrinsic (midpoint of the two minority treatments)** | | **≈ AED 18** |
| vs current price | | **AED 12.20** (US$3.32, 2026-06-28) |
| Memo: consensus mean target | | AED 17.07 |
| Memo: book value / share | | AED 10.16 |

**Minority-interest judgment (material — flagged).** Minorities take **~21% of group earnings** (mostly the listed Emaar Development), but book NCI (AED 13,808m) is only ~8% of the DCF EV. Because FCFF here is 100% of the consolidated operating cash, deducting the minority at its **~21% economic earnings share (AED ~31,660m)** is the more conservative owner read and lowers the base to **AED 17.2**; book NCI (01-consistent) gives AED 19.2. The truth sits between — hence the central **~AED 18**. This tension is properly resolved in `06_sum-of-the-parts`.

**The single most important observation:** the market EV (broad AED 96,657m) ≈ the **PV of my explicit 10-year FCFF alone (AED 96,600m)**. The market is paying for the visible forecast cash and assigning **~zero to the post-2035 business** (explicit-only per-share ≈ AED 13.0 book / 12.3 economic — right at the price). The intrinsic-above-price is the terminal + balance sheet the market is not underwriting — consistent with the **government-owner value-trap discount (RF-OWN-004)** the triage carried in, and with cyclical-peak fear.

---

## 7. Sensitivity Grid (per-share intrinsic value, AED)

**Grid 1 — required WACC × terminal-g (book-NCI bridge):**

| | WACC 9.5% | WACC 10.5% | WACC 11.5% |
|---|---:|---:|---:|
| g +0.5% (2.0%) | 20.95 | 19.16 | 17.73 |
| g (1.5%) | 20.92 | **19.17** | 17.77 |
| g −0.5% (1.0%) | 20.88 | 19.18 | 17.81 |

The grid is **almost flat down the g-axis** — this is the honest signal that, with terminal ROIC ≈ WACC, **terminal growth adds no value**. The live dispersion is WACC (columns) and, more importantly, the mid-cycle margin (Grid 2). No cell is near `WACC − g ≤ 0`, so none is NM.

**Grid 2 — WACC × mid-cycle EBIT margin (the dominant driver; shifts the whole margin path, book-NCI bridge):**

| Terminal EBIT margin | WACC 9.5% | WACC 10.5% | WACC 11.5% |
|---|---:|---:|---:|
| 37% | 22.02 | 20.17 | 18.69 |
| **35% (base)** | 20.92 | **19.17** | 17.77 |
| 33% | 19.81 | 18.17 | 16.85 |
| 31% | 18.71 | 17.17 | 15.94 |

**Grid 3 — value-trap cross-check (terminal exit multiple on normalized EBITDA, book-NCI bridge):** a persistent depressed multiple, not a Gordon re-rating.

| Terminal EV/EBITDA | Per share (book NCI) | Per share (economic NCI 21%) |
|---|---:|---:|
| 4.0x (today's market, on normalized EBITDA) | 16.35 | 14.92 |
| 5.0x | 17.18 | 15.57 |
| 6.0x | 18.00 | 16.23 |
| 7.4x (Gordon base) | 19.16 | 17.14 |

Across all three grids plus the runoff terminal, the per-share dispersion is **~AED 15–22 (book NCI) / ~AED 13–17 (economic NCI)**, centered ~AED 17–19. Even the **explicit-only floor (zero terminal) is ~AED 13.0**, at/above the price — so the DCF's undervaluation signal does not depend on the terminal.

**Financeable-growth cross-check (Gate 2 — passes).** Terminal reinvestment is set = `g / ROIC` = 1.5% / 9.5% = **15.8% of NOPAT**, so implied growth = ROIC × reinvestment = 9.5% × 15.8% = **1.5% = modeled g** — locked and financeable. (Emaar's *recent* very-low reinvestment — capital-light, negative-WC — would finance only ~0% growth if extrapolated; the terminal deliberately charges the higher, sustainable reinvestment needed to keep buying land at market prices, which is why terminal FCFF steps below the flattered recent level.)

---

## 8. Intrinsic Read

**Base-case intrinsic value ≈ AED 18/share** (AED 19.2 on valuation/01's book-minority bridge; AED 17.2 deducting minorities at their ~21% economic earnings share) — with the sensitivity grid dispersing that point over **~AED 15–22** (WACC 9.5–11.5% and mid-cycle EBIT margin 31–37%), and a **structural-decline / value-trap floor near AED 13–15** (runoff terminal, or the market's depressed 4.0x multiple persisting). Even the zero-terminal floor (~AED 13) sits at the AED 12.20 price, so on discounted cash flows Emaar screens ~30–50% below intrinsic — a read the AED 17.07 Street consensus target independently brackets. The single assumption that decides the answer is the **normalized mid-cycle development margin** (±2pp EBIT ≈ ±AED 1/share, and it drives whether the down-cycle is as shallow as modeled), followed by whether the market's low multiple is cyclical fear (re-rates) or the structural **government-owner value-trap discount (RF-OWN-004)** that keeps a cash-rich, minority-leaky, single-city-cyclical developer perennially below its cash value — the reason the gap to price is left for `07`/`99` to adjudicate, not closed here.

---

### Self-check
- **Business-type gate applied** — FCFF DCF is the triage-designated primary method for an Operating+real-estate-overlay issuer; NAV/SOTP left to `06`; EV bridge not forced onto a pure REIT.
- **FCF base year stated (FY2025 peak + LTM) and normalizations itemized** (advance build, cash-tax lag, finance income, securities treasury).
- **Every forecast cell labeled** company-guided/consensus/analyst.
- **WACC** — all components sourced (rf, ERP, cost of debt web-labeled unverified); override shown both figures (9.6% computed / 10.5% used), justified, within ±1.5pp; Gate-4 cross-check vs moat's ~11.4% and grid spans both.
- **Terminal value disclosed as 36% of EV** (< 75%); exit-multiple cross-check shown; runoff/declining-perpetuity terminal built as the `07` bear input.
- **Cyclicality gate** — terminal margin 35% benchmarked against peer-normal (Aldar 27.2%), prior-trough (FY2021 23.5% / FY2022 32.3%) AND the FY2025 peak (45.5%), each cited.
- **WC forecast from a revenue-linked driver** (contract-liability % of revenue), not a flat absolute; **sign read off the modeled ΔCL** — advance build ADDS (FY26–27), advance reversal SUBTRACTS (FY28–32); net cycle = −12bn cash use; sanity-checked for a negative-WC business.
- **Financeable-growth cross-check run** (Gate 2) — terminal reinvestment = g/ROIC, implied g = modeled g = 1.5%, locked.
- **EV→equity→per-share bridge uses 01's net cash and share count**; economic-minority sensitivity shown.
- **Mid-year convention** stated (t−0.5), applied to explicit flows and TV.
- **Grid populated**; per-share dispersion range given; output leads with a single base point + dispersion.
- **WACC blend, PV sum, TV, and bridge all computed by executed snippets** (shown) — not mental arithmetic.
- Confidence: **Medium** — full cash-flow base and near-term consensus present (no partial-data cap), but out-year forecast is analyst-built for a deeply cyclical single-city developer at a peak, and the government-owner value-trap discount is unmodeled here; the RF-OWN-004 valuation-attractiveness cap (max 60) is applied downstream by `03`/`07`/`99`.
- No banned phrases.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — EMAR (Emaar Properties PJSC, DFM: EMAAR)

**What this does.** It inverts the *same* model `04_intrinsic-dcf` built — a reverse-DCF is only meaningful as the exact inverse of the forward DCF. I take `04`'s canonical discount rate (WACC 10.5%), normalized free-cash-flow base (~AED 19,700m), terminal growth (1.5%), horizon (10 years, FY2026–2035), mid-year discounting, and terminal return-on-capital (ROIC 9.5%) **verbatim**, and instead of computing a fair value I solve for the growth and margin today's price *requires*. Reporting currency **AED millions**; USD shown at the 3.6725 peg. *Plain-English note:* "reverse-DCF" = start from the price and work backwards to the expectations baked into it; "what's priced in" = the growth and margin the market must believe to justify paying today's price; "FCFF" = free cash flow to the firm (the cash the operations throw off before financing).

**Model tie-out (proof this is the SAME model).** Rebuilding `04`'s explicit forecast from its own inputs reproduces `04` to the dirham — explicit present value **AED 96,600m**, present value of terminal **AED 54,161m**, enterprise value **AED 150,761m**, terminal value 36% of EV — matching `04` §4–§6. Every solve below runs on that verified engine. Computed with an executed root-finder (Python; scipy was unavailable in the sandbox, so a bisection solver was used — commands and roots are in the working log, not hand-arithmetic).

---

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | AED 12.20 (US$3.32), **pool-verified**, as-of 2026-06-28 | from 01 §1 (CIQ Comps) |
| Market capitalization (equity) | AED 107,818m | from 01 §3 |
| 01 broad EV (market-convention) | AED 96,657m | from 01 §4 |
| **Operating FCFF-EV the price implies** (reverse-DCF target) | **AED 89,128m** (book-NCI); AED 95,342m (economic-NCI) | derived — inverse of 04 §6 bridge |
| FCF base — normalized FCFF (NOPAT-based) | **~AED 19,700m** (operating-FCF variant 20,140; mid-cycle floor 14,724) | from 04 §1 |
| Discount rate (WACC) used | **10.5%** (04's; computed 9.60%, +0.9pp override, within ±1.5pp) | from 04 §3 |
| Forecast horizon | **10 years** (FY2026–2035), mid-year convention (discount at t−0.5) | from 04 §2, §4 |
| Terminal growth / terminal ROIC | 1.5% / 9.5% (ROIC ≈ WACC → no perpetual excess return) | from 04 §5 |

**The correct target is the operating EV, not 01's headline EV.** `04`'s DCF produces an *operating* enterprise value from free cash flow, then bridges to equity: **+ net cash AED 24,969m + associates/JVs AED 7,529m − minority AED 13,808m**. Inverting that bridge from the market's equity value gives the operating EV the price implies: 107,818 − 24,969 − 7,529 + 13,808 = **AED 89,128m** (book-NCI). This is 01's broad EV (96,657) minus the associates (7,529) that `04` values *separately* — the right apples-to-apples figure to match against free cash flow that excludes associate income. (`04`'s looser "market EV ≈ PV of explicit cash flows" line compared 96,657 to 96,600; removing associates sharpens the target.)

---

## 2. Implied Expectations

**Held fixed** (all verbatim from `04`): WACC 10.5%, terminal g 1.5%, terminal ROIC 9.5%, 10-year horizon, mid-year discounting, and the normalized FCFF base / `04`'s revenue path. **Solved for**: (a) the constant FCFF CAGR off the normalized base, and (b) the uniform EBIT-margin shift applied to `04`'s revenue path — each set so the present value equals the AED 89,128m operating EV the price implies.

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCFF CAGR over the 10-yr horizon (constant growth off the ~AED 19,700m normalized base) | **−13.4%/yr** (economic-NCI basis −12.2%) |
| Implied years of above-GDP growth (fade model) | **0** — the price requires *runoff*, not growth |
| Implied steady-state (terminal) EBIT margin — `04`'s revenue path held, margin flexed | **~21%** (economic-NCI ~22.5%) |

**How undemanding this is.** Holding free cash flow *flat* at the normalized AED 19,700m base (0% growth) already discounts to an operating EV of **AED 210,606m — 2.4× what the market pays**. To reach AED 89,128m the base must *shrink* ~13%/yr for a decade. Equivalently, the market pays **64% of `04`'s intrinsic equity value** (AED 12.20 vs `04`'s ~AED 19.2 book-NCI) and **59% of its operating EV**. And `04`'s own base case — a cyclical normalization off the record-2025 peak — itself already implies FCFF fading **−5.0%/yr**; the price implies **−13.4%/yr**, i.e. the market is ~8pp/yr *more* pessimistic than `04`'s already-normalized base.

**The margin solve is the decision-relevant one** (a negative CAGR off a peak-normalized base is easy to misread; margin is `04`'s dominant value driver). Holding `04`'s cyclical revenue path and flexing only the margin, the price implies a **through-cycle EBIT (operating-profit) margin of ~21%** — *below* Emaar's own FY2021 trough (23.5%), *below* the one audited peer Aldar (27.2%), and far below `04`'s normalized mid-cycle (35%) and the FY2025 peak (45.5%).

---

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCFF CAGR = **−13.4%/yr** for 10 yrs (a permanent runoff) | Revenue CAGR **+15.4%/yr** FY2021–25 (accelerating: +7.3% / +32.7% / +39.6%) [earnings/01] | Consensus long-term growth **−14.8%** (peak-normalization); AED 163.4bn backlog = 3.3× revenue, ~94% sold [earnings/07; ciq_facts] | Bar is *too easy* — a perpetual 13%/yr decline is more pessimistic than even the backlog-locked near term → **conservative (undemanding)** |
| Implied terminal EBIT margin ≈ **21%** | FY2021 trough **23.5%**; FY2022 32.3%; FY2025 peak **45.5%** [04 §2, CIQ IS] | Gross margin 55%, guided "low 50s" → EBIT mid-30s mid-cycle; `04`'s modeled down-cycle low is 31% [earnings/03; 04 §2] | ~21% sits *below the worst recent trough and below the peer* → **stretch-to-unachievable as a permanent floor** → priced-in is **conservative** |

**Judgment.** The market's implied expectations are **conservative to the point of pricing structural impairment**: a permanent through-cycle margin (~21%) below Emaar's own worst recent trough (23.5%) and below its lower-margin audited peer (Aldar 27.2%), plus free cash flow shrinking ~13%/yr for a decade. The near term is contractually visible — an AED 163.4bn sold backlog (3.3× revenue, ~94% sold) converts to booked revenue over roughly 3–4 years [earnings/07 §1] — so the priced-in collapse is not supported by what is already under contract. The genuine bear anchors are real but do not reach 21%: the cheap-legacy-land spread is narrowing (gross margin 63%→55%, guided lower), the new 15% tax is a one-way ratchet, and through-cycle ROIC (~7.5–9.5%) sits at/below the ~10.5–11.4% cost of capital [business-model/09 §3] — which is exactly why `04` strikes no terminal excess return. Those facts justify a *fade* to `04`'s 35% mid-cycle plus a modest premium over Aldar; they do not justify a margin permanently below the FY2021 trough.

**Market-ceiling sanity check (one-directional — it can only raise the bar).** Emaar is an operating developer, so this is a revenue-size test, and the reverse-DCF solved a cash-flow/margin figure, so I convert to the implied revenue trajectory (margin held). But the implied growth is *negative*, so a ceiling cannot bind — the priced-in path requires the business to *shrink*, not to win any incremental market share. Translating −13.4%/yr to revenue takes it from AED 49,557m to ~**AED 12bn by 2035** — about a quarter of today's level and *below* the recognition profile of the AED 163.4bn already-sold backlog. Dubai's forward supply (≈167,000 units completing into 2026–27) and the consensus −14.8% path do frame a real down-cycle [earnings/07 §4; market size is a low-tier input — cited, not load-bearing], but even a sharp cyclical trough is not a permanent three-quarters revenue loss. The binding question here is the *opposite* of a ceiling — is the implied decline too steep? — and the evidence says yes.

---

## 4. Robustness

Implied FCFF CAGR to justify the price (operating EV AED 89,128m, book-NCI basis):

| Discount Rate | Implied FCFF CAGR |
|---|---:|
| WACC −1% (9.5%) | −14.5%/yr |
| **WACC (10.5%)** | **−13.4%/yr** |
| WACC +1% (11.5%) | −12.2%/yr |

**The FCF base is the larger swing factor — shown, not just the rate.** Using `04`'s own §1 figures for the band (no new inputs invented):

| FCF base (04 §1) | Implied FCFF CAGR |
|---|---:|
| Low — mid-cycle NOPAT 14,724 | −8.6%/yr |
| **Base — normalized FCFF 19,700** | **−13.4%/yr** |
| High — operating-FCF variant 20,140 | −13.7%/yr |

The FCF base swings the implied CAGR by **5.1pp** (−8.6% to −13.7%) versus **2.3pp** for a full ±1% on WACC — **the FCF base is the dominant input**, consistent with the other modules' finding. Read in margin terms, the same stress gives an implied terminal EBIT margin of **19.2% / 21.1% / 22.9%** at WACC 9.5% / 10.5% / 11.5% — below the FY2021 trough (23.5%) across the entire rate range.

*Terminal g ±0.5% (informational — terminal value is only **23% of EV** at the market solve, well under the 60% trigger, so this is not required):* implied CAGR moves just −13.1% / −13.4% / −13.6% across g = 1.0% / 1.5% / 2.0%. Terminal growth barely matters — exactly as `04` found, because terminal ROIC ≈ WACC means growth adds ~no value.

---

## 5. What's-Priced-In Read

At **AED 12.20**, the market prices Emaar's free cash flow to *shrink ~13%/yr for a decade* and its through-cycle operating margin to settle near **21% — below its own FY2021 trough (23.5%) and below audited peer Aldar (27.2%)** — paying just **64% of `04`'s intrinsic equity value**. That is a **conservative (undemanding)** set of expectations: the fundamental evidence — an AED 163.4bn sold backlog underpinning near-term revenue, a brand-plus-Downtown-Dubai-location moat that genuinely out-earns Aldar, and a margin that has not sat below ~23.5% even in the last trough — says the business can clear that bar, so on fundamentals the ~AED 6–7/share gap to `04`'s ~AED 18–19 intrinsic is upside, not fair pricing. **The caveat that decides whether the gap ever closes is structural, not fundamental:** the persistent discount matches the government-controlled-owner value trap the moat and DCF modules flag (Investment Corporation of Dubai ~22.3% controller and city master-planner, RF-OWN-004) — a misaligned owner can keep a below-intrinsic price below intrinsic indefinitely. The reverse-DCF's read is that the *expectations* baked into the price are too pessimistic; whether that converts into realized return, given the owner discount, is left to `07`/`99` to adjudicate — not decided here.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — EMAR

*Emaar Properties PJSC (DFM: EMAAR). UAE / Dubai issuer, **IFRS**, reporting currency **AED**; the dirham is hard-pegged to the US dollar at 3.6725 AED/USD, so AED↔USD carries negligible currency risk. All segment figures are audited **FY2025** (year ended 31 Dec 2025) from Note 3 of the annual report. Anchor price, shares, net cash and minority are taken verbatim from `01_price-and-capital-structure.md` (price AED 12.20, as-of 2026-06-28, pool-verified). This is a **base-case fair-value level (a point) with the multiple-driven dispersion shown separately** — not a single precise target, and not a probability-weighted price (that is the master synthesizer's job).*

**Why SOTP matters here.** Emaar is two businesses bolted together: a cyclical Dubai off-plan **developer** (build-and-sell homes, ~80% of revenue) sitting on top of a wholly-owned, prime, recurring-rent **mall landlord** ("Emaar Malls", ~15%) plus a small **hotel** arm (~5%). The market prices the whole group on one blended multiple — enterprise value ÷ operating cash profit (EV/EBITDA) of **4.0x**, the very bottom (0th percentile) of Emaar's own 16-quarter range of 5.1–8.4x [`ciq_facts.json` → ev_ebitda_current 4.0x / range_position]. A single low multiple can hide a high-value segment behind a low-value one. SOTP tests exactly that.

**This is NOT a single-segment business** — Real Estate is ~73–80% of profit/revenue, below the 85% collapse line — so the full breakup is run (Valuation MODULE_RULES, Segment/SOTP rule).

---

## 1. Segment Inventory

Reportable segments per IFRS 8 (three segments + an "Others" catch-all), FY2025, AED millions. The segment note reports each segment's "result" as **profit before tax, before impairment and before unallocated items** — a messy figure struck *after* each segment's own finance income and finance costs. For an EV multiple I need a pre-financing operating figure, so I strip each segment's net finance income back out:

> **Segment EBIT = segment result − segment finance income + segment finance costs.**  **Segment EBITDA = segment EBIT + segment depreciation/amortisation (D&A).**

This is the single most important adjustment in this report: the Real Estate "result" of AED 19,752m includes **AED 2,770m of finance income** (interest earned on its large cash and receivables). Leaving it in would double-count, because the cash that earns it is added back separately in the equity bridge (§4). Stripping it takes Real Estate to a clean ~45% operating (EBIT) margin — matching the segment-map caveat that the headline ~50% is "flattered by finance income."

| Segment | Revenue | EBIT (ex-finance) | EBITDA (ex-finance) | EBIT Margin | % of Segment EBIT | Source |
|---|---:|---:|---:|---:|---:|---|
| **Real Estate** (off-plan developer) | 39,550.4 | 17,846.9 | 18,140.1 | 45.1% | **72.5%** | FY2025 AR (IFRS), Note 3, p.187–188 |
| **Leasing, Retail & Related** (Emaar Malls) | 7,681.3 | 5,415.7 | 6,397.8 | 70.5% | **22.0%** | Note 3, p.187–188 |
| **Hospitality** (hotels) | 2,325.6 | 893.7 | 1,182.0 | 38.4% | **3.6%** | Note 3, p.187–188 |
| **Others** (property mgmt + financial-services associates) | 0.0¹ | 446.6 | 518.0 | n/m | **1.8%** | Note 3, p.187–188 |
| **Sum of reportable segments** | **49,557.3** | **24,602.9** | **26,237.8** | | **100.0%** | derived |
| *− Unallocated corporate SG&A (the corporate drag)* | | *(1,314.0)* | *(1,314.0)* | | *separate* | Note 3, p.187 (AED 1,313,953k) |

**"% of Segment EBIT" denominator** = the AED 24,602.9m sum of the four segments' operating EBIT, so the shares sum to exactly 100%. The **unallocated corporate SG&A of AED 1,314m sits *outside* the segments** and is shown as a separate line — it is not netted into any segment and cannot produce a >100% artefact. It is a real cost and is capitalised-and-subtracted in the bridge (§4), never dropped (Reconciliation Gate 3).

¹ Others carries no external segment revenue (its income sits in other operating income); it is 1.8% of segment profit and 2.4% of segment assets — immaterial, not a hiding place.

**Reconciliation to the consolidated read.** Sum-of-segment EBITDA 26,237.8 − corporate SG&A 1,314.0 = **24,923.8**, versus CIQ standardized group EBITDA of **24,132** [earnings/01]. The AED **~792m gap** is the group's share of associate/joint-venture results and other income that is embedded in the segment "results" but stripped from CIQ standardized EBITDA. Because that JV/associate income is *already captured inside the segment metrics*, I do **not** separately add the equity-method investment book value (AED 7,528.7m [`01`]) in the bridge — that would double-count (§4). Revenue foots exactly to the audited AED 49,557.3m [Note 4].

**Dominant segment / cyclicality flag (critical to every multiple below).** Real Estate carries 72.5% of segment EBIT, but this is a **Dubai property-cycle peak, not a run-rate**: 2025 was Dubai's strongest year on record, consensus long-term earnings growth is **−14.8%** (the market itself prices a roll-over), development gross margin is guided down from 63% (FY23) → 55% (FY25) → "low 50s," and the base rate is Dubai boom-bust (2009; 2015–2019) [business-model/10_external-dependency §3; earnings/03_margin-drivers §Cycle-Position; `ciq_facts` consensus_view]. The FY2025 net-profit figure is further flattered by a one-off tax relief, but that sits below EBIT — using pre-tax EV/EBITDA insulates this SOTP from the tax noise.

---

## 2. Segment Multiples & Comparables

Every multiple is EV/EBITDA on FY2025 segment operating EBITDA (ex-finance-income), each anchored to a **named** comparable. Peer multiples are the pool CIQ comp set (as-of 2026-06-28) where a listed comparable exists; the hotel comp is web-sourced and labelled unverified. Multiples are deliberately set *below* the direct comp where the segment is cyclical, single-city, or peak-earning.

| Segment | Metric Used | Multiple Applied (base) | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| **Real Estate** | EV/EBITDA (FY25, ex-finance) | **5.0x** | **Aldar Properties (ADX:ALDAR)** — the largest *listed* UAE developer; the only regional peer with audited, comparable economics | 8.3x EV/EBITDA LTM | CIQ Comps → Trading Multiples, 2026-06-28 |
| **Leasing / Retail (malls)** | EV/EBITDA (FY25) | **12.0x** | **Arabian Centres / Cenomi Centers (SASE:4321)** — listed Saudi mall owner-operator (recurring rent), the closest listed mall-landlord comp | 18.9x EV/EBITDA LTM | CIQ Comps → Trading Multiples, 2026-06-28 |
| **Hospitality** | EV/EBITDA (FY25) | **9.0x** | **Host Hotels & Resorts (NASDAQ:HST)** and asset-heavy hotel owners — no hotel peer exists in the pool comp set | ~10–13x EV/EBITDA | Web, 2026 — **unverified, directional** |
| **Others** | EV/EBITDA (FY25) | **5.0x** | Diversified property-services / financial-services holdings — conservative catch-all (cross-check: book net assets ~AED 3.9bn) | n/a (blended) | Note 3 (assets/liabilities); judgment |

**Why each multiple fits (and why the discount):**

- **Real Estate at 5.0x** — Aldar is the clean listed anchor at 8.3x. Emaar's developer arm out-earns Aldar by a wide margin (Emaar ~45% EBIT margin vs Aldar ~27% [CIQ Operating Statistics]) and carries net cash, which argues *up*. But three factors argue *down* by ~40%: (i) near-total single-city Dubai off-plan concentration (93% UAE revenue), (ii) peak-cycle earnings that consensus expects to fall ~15%, and (iii) the government-controller overhang (§4). 5.0x is a modest premium to the market's 4.0x whole-company multiple, reflecting the developer's superior margins/backlog without underwriting peer parity on peak earnings.
- **Leasing/Retail at 12.0x** — Arabian Centres/Cenomi (18.9x) is the direct listed mall comp. A 12x multiple is a ~36% discount to it and equates to an **~8.3% capitalisation rate** (the yield a buyer demands on rental profit; EBITDA ≈ net operating income here). For a prime Dubai retail portfolio anchored by The Dubai Mall, an 8%+ cap rate is conservative — a trophy-asset cap rate of ~6.7% would justify ~15x. Malls are the highest-quality, most stable segment (~70% EBIT margin, recurring rent) and are **wholly owned** (see §4).
- **Hospitality at 9.0x** — no pool hotel comp; global asset-heavy hotel owners trade ~10–13x [Web, unverified]. 9x reflects single-market Dubai tourism cyclicality and smaller scale. Immaterial to the total (~5% of value; ±2x barely moves the per-share figure).
- **Others at 5.0x** — a grab-bag of property-management fees and minority financial-services associate stakes; 5x its result ≈ its book net assets (~AED 3.9bn). Immaterial (~2%).

---

## 3. Segment Valuation

Base-case multiples (§2). AED millions.

| Segment | Metric Value (EBITDA) | Multiple | Segment EV | % of Gross EV |
|---|---:|---:|---:|---:|
| Real Estate | 18,140.1 | 5.0x | 90,700.3 | 50.2% |
| Leasing / Retail (malls) | 6,397.8 | 12.0x | 76,773.4 | 42.5% |
| Hospitality | 1,182.0 | 9.0x | 10,638.0 | 5.9% |
| Others | 518.0 | 5.0x | 2,589.9 | 1.4% |
| **Gross enterprise value (sum)** | | | **180,701.7** | 100.0% |

The malls (42.5% of gross EV) punch far above their 22% profit weight because a recurring-rent annuity earns a mid-teens multiple while a cyclical developer earns a low one. That gap is the whole point of running SOTP.

---

## 4. Equity Bridge

Base case. AED millions except per-share. Share count, net cash and minority are `01`'s canonical figures, used verbatim (Reconciliation Gate 1).

| Step | Value | Note |
|---|---:|---|
| Gross enterprise value | 180,701.7 | §3 |
| − Capitalised unallocated corporate SG&A (1,314.0 × 5.0x) | (6,570.0) | corporate drag capitalised at the developer multiple; **not dropped** (Gate 3) |
| − Net debt *(broad basis = **net cash** of 24,969.2, so this ADDS)* | **+24,969.2** | `01` canonical broad net cash; single line, added once, correct sign |
| − Minority / non-controlling interest (book) | (13,808.3) | `01`; concentrated in Emaar Development (the developer arm) — see below |
| + Equity-method investments | 0.0 | income already inside segment results (~AED 792m, §1); adding book (7,528.7) would double-count |
| − Preferred equity | 0.0 | none |
| **= Equity value (pre-discount)** | **185,292.6** | = AED **20.96**/share |
| − Conglomerate / holdco + state-owner discount (**20%**) | (37,058.6) | reason below |
| **= Equity value (post-discount)** | **148,234.1** | |
| ÷ Diluted shares | 8,838.789849 | `01` (basic = diluted; no options/converts) |
| **= SOTP value per share (base)** | **AED 16.77** | |
| vs current price | **AED 12.20** | `01`, pool-verified 2026-06-28 |
| **Margin of safety (base)** = (16.77 − 12.20) / 16.77 | **+27%** | discount of price to base fair value |

**Net-cash sign discipline.** The bridge subtracts net debt. Emaar is **net cash** on the canonical broad basis (AED 24,969m), so the line is a single positive add-back; there is **no** separate "+ net cash" line and no double-count. The broad basis nets in AED 22.5bn of unrestricted bank term deposits; `01`'s cash-quality test already excluded RERA-trapped escrow (AED 43,338m) and immaterial mark-to-market securities. On the **strict** §15 basis, net cash is only AED 2,115m — using strict instead of broad lowers the base by ~AED 2.58/share (to ~AED 14.2). Broad is `01`'s canonical figure and is used here; strict is carried as the conservative floor in the low case.

**Conglomerate / holdco discount of 20% — applied, with reason.** Two structural reasons, not a reflex haircut:
1. **RF-OWN-004 (§24 Filter 6, mandatory value-trap flag).** The **Government of Dubai (Dubai Holding group) controls 29.73%**; every "independent" director is a government official; and an IAS 24 election leaves the largest related-party channel (land/utilities/construction from the state ecosystem) unquantified to minorities [management-governance/99 synthesis; FY2025 AR Annex I p.153 / Note 33]. A controller pursuing a city-building agenda has **no incentive to break the company up** to release the malls' value. Persistent cheapness under such an owner is a value trap, not a margin of safety, and must be treated as such (Valuation MODULE_RULES; CLAUDE.md §24).
2. **Structure.** A cyclical developer and an annuity landlord priced as one entity; the masked value only crystallises via a spin/breakup that will not happen.

A 20% discount is mid-range for a government-controlled multi-segment entity; it brings the base to AED 16.77, essentially in line with the consensus analyst target of AED 17.07 [`ciq_facts` consensus_view] — an independent cross-check that the discounted base is not fanciful.

**Minority-interest note (direction of error).** The AED 13,808m minority is ~99% **Emaar Development PJSC** (the build-to-sell developer), plus a small Emaar Misr (Egypt) slice [FY2025 AR, material-NCI note]. **Emaar Malls was taken private in 2021 and is wholly owned — its SOTP value is fully attributable to Emaar Properties shareholders, not shared.** Because the minority sits in the Real Estate arm, subtracting *book* minority is about right at the base (5x) multiple but **understates** the true economic minority at higher developer multiples — so the bull case below is flattered and the true bull is lower than shown.

### Dispersion (multiple- and cycle-driven — shown separately, not false precision)

Same bridge, varying the two swing assumptions (developer multiple/cycle and mall multiple) and the cash basis; 20% discount applied throughout.

| Case | Real Estate | Malls | Hosp. | Cash basis | SOTP / share | vs price 12.20 |
|---|---|---|---|---|---:|---:|
| **Low (bear)** | EBITDA −20% (normalised) × 4.5x | 10.0x | 7.0x | strict (2,115) | **AED 11.04** | −10% |
| **Base** | 18,140 × 5.0x | 12.0x | 9.0x | broad (24,969) | **AED 16.77** | +37% |
| **High (bull)** | 18,140 × 8.3x (Aldar parity) | 15.0x | 11.0x | broad (24,969) | **AED 23.79**† | +95% |

†Bull overstates because book minority understates the true economic minority in the developer arm at 8.3x. The honest read is the **base ~AED 16.8, with a wide AED 11–24 band** — the width is itself the finding: the value hangs almost entirely on the developer multiple (the cyclical piece) and the mall multiple.

---

## 5. SOTP Read

**The parts are worth more than the whole (~AED 17 base vs AED 12.20 price), but the gap is a masked annuity, not a free lunch — and a government owner makes the discount partly warranted.** Break the value in two: on a conservative 12x mall multiple (a 36% discount to the Cenomi comp), the **wholly-owned Emaar Malls annuity alone is worth ~AED 76.8bn of enterprise value — 79% of Emaar's *entire* current EV of AED 96.7bn**, from just 22% of profit. Carve the malls, hotels and Others out of the current EV at their own multiples and the market is left implying the crown-jewel Dubai off-plan developer — 72% of group profit — at roughly **0.4x its own EBITDA, i.e. almost nothing**. That is the segment being masked: a high-quality recurring-rent landlord buried inside a company the market prices as one 4x cyclical developer.

**Which segment carries the value:** Real Estate is the largest single block by absolute EV (~50% at base), but it is the cyclical, peak-earning, minority-shared, lowest-multiple piece — so it *drives* the value while the **malls *hold* the quality**: the malls plus net cash (76.8 + 25.0 = ~AED 102bn) approximate the entire AED 107.8bn market cap, meaning the market assigns almost nothing, net, to the developer and hotels after the annuity and the cash.

**The value-trap caveat is doctrine here, not a hedge (RF-OWN-004).** The 27% base margin of safety and the malls-plus-cash floor look like protection, but the low multiple is at least partly *deserved*: developer earnings sit at a Dubai-cycle peak that consensus expects to fall ~15%, and the Government-of-Dubai controller (29.73%) has no incentive to unlock the masked mall value or distribute it to minorities. On a hard-but-defensible bear (developer normalised down, low multiples, strict cash), SOTP falls to ~AED 11 — below today's price. So this is a genuine masked annuity *and* a structural value trap at the same time; the parts justify no verdict better than "modestly undervalued," and the gap should be underwritten only by an investor who is paid to wait through the cycle under an owner who may never close it.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — EMAR (Emaar Properties PJSC, DFM: EMAAR)

*Dubai/UAE hybrid real-estate business — ~80% build-to-sell off-plan development (operating-company-like), ~15% mall leasing + ~5% hospitality (recurring-income, REIT-like). IFRS; reporting currency **AED** (dirham pegged to the US dollar at 3.6725, so AED↔USD carries negligible currency risk). Anchors taken verbatim from `01_price-and-capital-structure.md` §7: price **AED 12.20** (US$3.32, last close, **pool-verified**, as-of 2026-06-28), fully diluted shares **8,838.789849m**, market cap **≈ AED 107,818m**, canonical **broad** net cash **AED 24,969m** (strict §15 net cash AED 2,115m), broad EV **≈ AED 96,657m**, LTM EBITDA **AED 25,200.7m**, book value **AED 10.16/share**. **Price-state = `pool-verified`** (12 days stale — a data-quality caveat, not a no-price trigger), so the price-relative metrics in §4 ARE assessable. This report reconciles methods `02`–`06` into one base-case fair-value POINT plus bull/base/bear LEVELS; it does NOT assign probabilities, weight returns, size a position, or rate the stock — those belong to the master synthesizer.*

*Plain-English note (first use): **fair-value level** = an estimate of what a share is worth, one number per case; **margin of safety** = how far today's price sits below the base-case worth (the cushion); **downside to bear** = how far price would fall if the bad case happens (a loss measure — higher is worse); **EV/EBITDA** = enterprise value ÷ operating cash profit; **P/E** = price ÷ earnings per share; **P/BV** = price ÷ accounting net worth per share; **through-cycle** = averaged across boom and bust, not read at a single peak year; **warranted multiple** = the multiple the business actually deserves given quality, cyclicality and its owner.*

---

## 1. Method Summary

Business type from `00`/`01` = **Operating with a real-estate/NAV overlay** (a hybrid developer-plus-annuity, close to a holding company). Per the Business-Type Method Map the value-producing set is **02 (own-history multiples), 03 (relative/peers), 04 (intrinsic DCF), 06 (sum-of-the-parts)**; reverse-DCF (05) is a cross-check, not a weighted value. All four value-producing methods are valid for this type — none is zero-weighted for invalidity — but `02`'s **reversion exhibit** is zero-weighted because its own producer marked it *illustrative-only* (see below).

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | **AED 12.5** base ("no re-rate"); reversion exhibit AED 9.6–22.4 *(illustrative-only, zero-weighted)* | Low | **15%** | The 4-year multiple window is **entirely an up-cycle** (no Dubai downturn in it), so its means are up-cycle means, not through-cycle norms, and the base metric is a **record peak**. `02` explicitly marks its reversion table *illustrative-only* and hands `07` a near-circular "hold the current multiple" point (~AED 12.5 ≈ price). Lowest weight; reversion figures excluded. |
| Relative / peers (03) | **AED 16.9** base (warranted 5.5x LTM EV/EBITDA, on peak metrics); ~AED 11.5–12.6 once earnings normalized | Low–Medium | **20%** | Only **one** clean comparable (Aldar — same city, cycle, currency, audited). The other nine are private (DAMAC/Sobha — no public multiples) or China/HK names whose collapsed earnings inflate their multiples. A single clean comp is thin, and the base is struck on **peak** LTM EBITDA. |
| Intrinsic DCF (04) | **AED 18** central (AED 17.2 economic-NCI / AED 19.2 book-NCI); grid AED 15–22 | Medium | **30%** | FCFF DCF on **normalized mid-cycle** (not peak) earnings — the correct method for a cyclical, and terminal value is only **36% of EV** (not terminal-dominated, a confidence plus). Docked from top weight because it does **not** model the government-owner value-trap discount and swings ~AED 1/share per 2pp of mid-cycle margin. |
| Reverse-DCF (05) | *(implied, not a value)* — price implies FCFF **−13.4%/yr** for a decade and a ~**21%** through-cycle margin | Medium | n/a | Cross-check only. Inverts `04`'s exact model: tells us the market prices structural runoff and pays **64%** of `04`'s intrinsic — i.e. expectations are undemanding — but is not an independent fair value. |
| Sum-of-the-parts (06) | **AED 16.77** base (after a 20% holdco/state-owner discount); band AED 11.0–23.8 | Medium | **35%** | Highest weight: this is a **multi-segment hybrid** where a wholly-owned, recurring-rent **mall annuity (~22% of profit, ~AED 76.8bn EV)** is masked inside a cyclical developer priced on one blended 3.8x multiple. SOTP is the designated method for a holding-company-like structure **and is the only method that already applies the RF-OWN-004 government-owner discount**. |

Weights sum to **100%** across the four value-producing, business-type-valid methods. Reverse-DCF is a cross-check, not a weighted input.

---

## 2. Triangulation & Reconciliation

### Method football field (the honest cross-method spread — not pre-blended)

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | Base **AED 12.5**; illustrative reversion **AED 9.6–22.4** | Low | 15% | Up-cycle-only window; peak base metric; reversion illustrative-only; value-trap flag |
| Relative / peers (03) | Base **AED 16.9**; warranted-multiple band **AED 14.1–17.2**; normalized **AED 11.5–12.6** | Low–Med | 20% | One clean comp (Aldar); rest private/China-distorted; peak metrics |
| Intrinsic DCF (04) | Central **AED 18** (17.2–19.2); grid **AED 15–22**; runoff floor **AED 13–15** | Medium | 30% | Normalized mid-cycle FCFF; TV only 36% of EV; value-trap unmodeled |
| Sum-of-the-parts (06) | Base **AED 16.77**; band **AED 11.0–23.8** | Medium | 35% | Captures masked wholly-owned mall annuity; applies 20% state-owner discount |
| *Reverse-DCF (05, cross-check)* | *Market prices FCFF −13.4%/yr, ~21% margin — pays 64% of `04` intrinsic (too pessimistic on fundamentals)* | Medium | n/a | *Inverts `04`; "what's priced in", not a value* |

**True high-to-low dispersion across value-producing methods: ~AED 9.6 (02 P/BV cycle-robust / 06 bear) to ~AED 22–23.8 (04 grid high / 06 bull)** — a spread well over 40%. The base point below is reconciled FROM this spread; it is not smeared into a fake mid-band.

### The >40% spread IS the headline finding

The base points alone span **AED 12.5 → AED 18 = a 44% spread** (`04` 18 vs `02` 12.5), so cross-method disagreement is the lead result (Reconciliation Gate 6). The disagreement is not random noise — it is **one question**: do you value Emaar on its **assets** (SOTP + DCF-terminal + book → ~AED 17–18), or on **normalized through-cycle earnings at a warranted multiple** (→ ~AED 11–12.6)? Today's price (AED 12.20) sits squarely in the through-cycle-earnings camp; the asset methods say materially more. The reverse-DCF (`05`) adjudicates the tie-breaker: at AED 12.20 the market prices free cash flow to **shrink ~13%/yr for a decade** and the through-cycle operating margin to settle near **21% — below Emaar's own FY2021 trough (23.5%) and below audited peer Aldar (27.2%)**. That is pricing **structural impairment**, which the AED 163.4bn sold backlog (3.3× revenue, ~94% sold), the wholly-owned mall annuity and the net-cash balance sheet do not support — so on fundamentals fair value is **above** price. The catch is structural, not fundamental: the **RF-OWN-004 government controller** (Government of Dubai / Dubai Holding group, 29.73%; board government-staffed; IAS 24 hides the largest related-party channel) is a value-indifferent city-builder, and a misaligned owner can keep a below-intrinsic price below intrinsic indefinitely [`management-governance/99`; `04_ownership-and-insider-behavior` §Filter 6].

### Base-case fair value = a single POINT: AED 15.0

The mechanically-weighted blend of the four base points (15% × 12.5 + 20% × 16.9 + 30% × 18 + 35% × 16.77) = **AED 16.52** (executed snippet, §below). I publish the base **AED 1.52 (−9.2%) lower, at AED 15.0**, and state the reason rather than re-anchor silently: two of the four inputs — `04` (AED 18) and `03`'s headline (AED 16.9) — are struck on **peak LTM metrics** and carry **no** government-owner discount, whereas only `06` (20% discount) and `02` (no-re-rate) embed the RF-OWN-004 value trap. AED 15.0 applies that value-trap discount more evenly across the blend and pulls toward the through-cycle-normalized cluster — a **disclosed conservative adjustment** (Core Principle 6; §24 Filter 6), not a lens swap. The judgement in one line: I trust `06` (SOTP) most because it is the only method that both surfaces the masked wholly-owned mall annuity **and** already prices the state-owner discount, with `04`'s normalized DCF as the corroborating asset check; the own-history and peer-normalized reads (~AED 12) keep me from underwriting the full asset value the government owner has no interest in crystallising. AED 15.0 sits below consensus (AED 17.07 mean / 17.50 median) and below a full reversion to Emaar's own ~7.4x median P/E — deliberately, because the earnings base is a peak and the owner is misaligned.

---

## 3. Bull / Base / Bear Fair-Value Levels

Each case is a **single derived fair-value LEVEL (a point)** off one coherent assumption set. Default **12-month convergence horizon (to ~mid-2027)**; note that under the government-owner value trap the *timing* of convergence (especially the bull's asset-value recognition) can run longer than 12 months even if the *level* is right. The cross-method dispersion is the §2 football field; the bull-to-bear spread is the range. Operating drivers cite `earnings/07_earnings-sensitivity.md`; the warranted multiple ties to `business-model/07`, `09`.

| Case | Fair Value / Share (point) | Implied Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---|---|
| **Bull** | **AED 21.00** | ~6.9x LTM / ~9–10x normalized EV/EBITDA; ~9.8x P/E; 2.1x P/BV | 12m (~mid-2027) | Dubai up-cycle **extends past FY2028**; mid-cycle EBIT margin **holds ~37%** (the cheap legacy-land spread persists longer than guided); RE recognition **+12%** and pre-sales **+20%** [earnings/07 bull]; and the market gives **partial credit** to the masked wholly-owned mall annuity — a re-rate from 3.8x → ~6x LTM EV/EBITDA, still **below** Aldar's 8.3x. Anchored on `04`'s 37%-margin grid (AED 20–22) and a de-rated `06` bull. |
| **Base** | **AED 15.00** | ~4.8x LTM / **~6.7x normalized** EV/EBITDA; ~7.0x P/E; 1.5x P/BV | 12m (~mid-2027) | Dubai cycle **normalizes off the FY2025 peak** (consensus −14.8% long-term growth) but the AED 163.4bn backlog (94% sold) converts on schedule; through-cycle EBIT margin **~35%**; net cash + the wholly-owned mall annuity credited; a **partial (not full)** value-trap discount. Needs only a modest warranted re-rate 3.8x → ~4.8x LTM EV/EBITDA. |
| **Bear** | **AED 9.75** | ~0.96x book *(flow multiples distorted at a trough — read on book)* | 12m (~mid-2027) | A **genuine Dubai downturn** (prior-trough base rate below), not a mild dip: developer bookings/earnings **−~35% off peak**, mall net operating income softens with cap rates widening, valued ~0.95x book on **strict** net cash. = the **worse of** the cyclical through-cycle trough and the structural-reset runoff (below). |

**Bear = a true through-cycle trough, cited (not a dip off the peak).** Emaar's own 4-year multiple/earnings window (2022–2026) is **all up-cycle**, and `earnings/07`'s near-term bear moves (EPS −0.04 to −0.16) are **backlog-buffered up-cycle years** — the module itself flags the medium-term (2027–29) demand hit at an *illustrative* **−0.30 to −0.50+ EPS** and names the base rate as **Dubai boom-bust: ~50% peak-to-trough prices in 2008–09, ~35% in 2015–2019** [earnings/07 §4, §6; `business-model/07` cyclicality row; `10_external-dependency` §1]. So I widen the bear to that documented prior-downturn: developer earnings −~35% (deeper than `06`'s −20% "mild" bear at AED 11.04), landing at **AED 9.75 = 0.96x book**, at `02`'s cycle-robust P/BV anchor (0.94x median → AED 9.55). The trough does **not** reach the 2015–20 low of ~0.67x book (≈ AED 6.8) because the modern balance sheet — **AED 25bn net cash and the wholly-owned Emaar Malls annuity** (~98% occupancy, recurring rent) — is a far stronger floor than Emaar carried into prior downturns; net cash + malls − minority alone underpin ~AED 6–8/share before any developer, land-bank or hotel value.

**Structural-reset / permanent-impairment (avoid-ruin) — computed, and why it is NOT the headline bear here.** The trigger **fires**: `business-model/09` returns a **Narrow moat on an *eroding* economic trajectory** (the cheap-land spread narrows — gross margin 63%→55%, guided "low 50s"; a new 15% DMTT tax permanently lowers after-tax returns; through-cycle ROIC ~7.5–9.5% sits **at/below** the ~11–12% cost of capital, clearing it only at the peak). Critically this is an **economic** fade, **not** a disruption/obsolescence case — the disruption Filter 5 does **NOT** trip (business-quality rate-of-change **72/100**, well above 40) [`09` §5; `07_business-quality` §4]. So the correct reset is `04`'s **declining-perpetuity runoff** (g = 0%, terminal EBIT margin faded toward Aldar's ~28%), an **EV-based** reset bridged with `01`'s canonical net-cash anchor:

```
impaired operating EV = PV(explicit FCFF 96,600) + PV(runoff TV 39,893) = AED 136,493m
bridge (EV-based; net debt is NEGATIVE = net cash, so ADD):
  136,493 + net cash 24,969 + associates 7,529 − minority 13,808 = equity 155,182 → AED 17.56/sh (book-NCI)
  economic-minority basis (NCI ~21% of EV) → AED 15.9/sh; with 5.0x exit → ~AED 15.0/sh (matches 04 §5)
=> structural-reset ≈ AED 15–17.6
```
Because the eroding moat is a **slow economic fade cushioned near-term by the sold backlog, the mall annuity and net cash**, the structural-reset (~AED 15) is **milder** than the cyclical trough (~AED 9.75). Per the graduated worse-of rule, on a confirmed-eroding moat the headline Bear is the **WORSE (lower)** of the two — so **the cyclical trough (AED 9.75) is the headline Bear**, and the structural-reset (~AED 15) is carried here and to `99`/Kill-Criteria as the labelled **avoid-ruin / permanent-impairment reference** (the multi-year economic-fade floor, which here happens to sit *above* the 12-month cyclical trough). The reset per-share reconciles to its stated method (04's runoff), its impaired driver (28% terminal margin, no excess return), and `01`'s net-cash anchor. *(No probabilities — that is the master synthesizer's job.)*

---

## 4. Margin of Safety & Downside (two separate metrics)

Price-state = **`pool-verified`**, so both price-relative metrics are assessable (per MODULE_RULES Calculation-Standards 11, formulas verbatim).

| Metric | Value |
|---|---:|
| Current price | **AED 12.20** (US$3.32, as-of 2026-06-28) |
| Base-case fair value (point) | **AED 15.00** |
| Bear-case fair value | **AED 9.75** |
| Implied upside to base case = (base FV − price) / price | **+23.0%** |
| **Margin of safety** = (base FV − price) / base FV — *the cushion* | **+18.7%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* | **+20.1%** |

Margin of safety (+18.7% discount of price to base fair value) and downside-to-bear (+20.1% loss if the Dubai cycle troughs) are **different numbers measuring different things** — reported separately, neither used as a proxy for the other. The near-symmetry (≈19% cushion vs ≈20% loss-to-trough) is itself the read: the cushion to the base case is roughly matched by the fall to a true cyclical trough, so the margin of safety is real but not wide once the cycle is respected.

---

## 5. Warranted-Multiple Check

At **AED 15.0** the base implies **~4.8x LTM EV/EBITDA (≈6.7x on through-cycle EBITDA) and ~7.0x LTM P/E** — a *modest* re-rate from today's 3.8x / 5.7x that stays **below** Emaar's own ~6.5x EV/EBITDA and ~7.4x P/E medians and **below** Aldar's 8.3x / 8.5x, so the base does **not** require a multiple the business has never earned; it is warranted by the net-cash balance sheet, the wholly-owned mall annuity, the #1 Dubai brand/land position and BBB+/Baa1 ratings. **But value-trap risk is explicit and mandatory here (RF-OWN-004, §24 Filter 6):** the controller is the **Government of Dubai (Dubai Holding, 29.73%)**, a value-indifferent city-builder with every "independent" director a government official and the largest related-party channel unquantified — under such an owner persistent cheapness is a **trap, not a margin of safety**, so the base deliberately withholds the full asset value (SOTP AED 16.77 / DCF AED 18) and the bear assumes **no** re-rating the owner will not pursue. A low multiple sitting on **record cycle-peak earnings** that consensus already marks down (−14.8% long-term growth; forward P/E above trailing) reinforces the caution: the "0th-percentile" discount is partly a peak-earnings and misaligned-owner artefact, not a clean mispricing.

---

## 6. Fair-Value Read

Bull **AED 21** / base **AED 15.0** / bear **AED 9.75** (12-month levels), off a base point reconciled down from a AED 16.5 mechanical blend for the peak-earnings content and the government-owner value trap. Against the pool-verified AED 12.20 price the **margin of safety is +18.7%** (the cushion to base) and the separate **downside-to-bear is +20.1%** (the loss to a genuine Dubai trough) — a real but not wide cushion, roughly matched by the fall to a true cyclical low. **SOTP (`06`) drives the answer** — it alone surfaces the masked wholly-owned mall annuity (~AED 76.8bn EV, ~79% of today's entire enterprise value from 22% of profit) and already prices the state-owner discount — with `04`'s normalized DCF corroborating the ~AED 17–18 asset value and `05` confirming the market prices structural runoff that the backlog, malls and net cash do not support. The single biggest swing factor between bull and bear is **Dubai residential demand / the developer margin through the cycle** (a ~AED 11 swing turns on whether the mid-cycle EBIT margin holds ~37% or the cycle troughs ~35% off-peak), gated throughout by whether the misaligned Government-of-Dubai owner ever lets the masked value close — the reason the levels stop here and the bet is left to the master synthesizer.

*Executed-snippet provenance: the weighted blend (AED 16.52), the published levels and their implied multiples, the margin-of-safety / downside-to-bear metrics, and the structural-reset EV→equity bridge were all produced by a Python snippet (command + output shown in the working log), not by hand. Anchors (price AED 12.20, shares 8,838.789849m, broad net cash AED 24,969m, minority AED 13,808m, LTM EBITDA AED 25,200.7m, book AED 10.16) match `01` §7 verbatim.*
