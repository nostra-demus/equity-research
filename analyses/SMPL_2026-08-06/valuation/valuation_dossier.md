# valuation Module Dossier — SMPL

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `valuation_memo.md`.

- Generated: 2026-08-05T21:17:55Z
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

# Valuation Module — SMPL (Synthesis)

## Abstract

Simply Good Foods trades modestly undervalued at $11.33 against a base-case fair value of $15.27, a 25.8% margin of safety, driven mainly by peer relative valuation (60% weight) blended with intrinsic DCF (40%) — bull $21.98, headline bear $8.42, and a separate structural-reset floor of $13.09 that still sits above today's price. The market is pricing in roughly a 9%-a-year normalized free-cash-flow decline for six straight years, harsher than the company's own guidance or the evidence supports past the next year or two. Downside to the headline bear is 25.7% of today's price. Weak business quality and no proven moat justify part, not all, of the market's discount, so the verdict is modestly undervalued, not a screaming bargain.

## 1. Valuation Verdict

- **Verdict:** Modestly undervalued
- **Base-case fair value (point, per share):** $15.27
- **Current price:** $11.33 (close, Aug-04-2026; price-state **pool-verified**, fresh — ≈2 calendar days old)
- **Bull / Base / Bear fair-value levels (points):**
  - Bull: **$21.98** (+94.0% vs. price)
  - Base: **$15.27** (+34.8% vs. price)
  - Bear (headline, operating, 12-mo): **$8.42** (−25.7% vs. price)
  - Bear (structural reset / avoid-ruin floor, 24–36 mo): **$13.09** (+15.5% vs. price — notably still above today's price)
- **Cross-method dispersion (football field, low–high):** $8.42 (headline bear) to $51.31 (own-history P/E-mean reversion, self-flagged not achievable); the tighter, live-method core is $13.76 (peers) – $17.53 (DCF), with SOTP corroborating at $16.71
- **Valuation attractiveness /100** *(higher = cheaper)*: **68**
- **Margin of safety /100** *(higher = better)*: **60** (25.8% cushion to base fair value)
- **Valuation confidence /100:** **64**
- **Downside risk /100** *(higher = worse)*: **55** (25.7% loss to the headline bear-case value)
- **Data quality /100:** **78**
- **Overall usefulness /100:** **80**
- **Dominant valuation method (one line):** Peer relative valuation (quality-adjusted NTM EV/EBITDA) — the sole surviving multiples-camp method once own-history reversion self-excluded as not achievable; corroborated within 27% by an independently-built intrinsic DCF (which itself cross-checks to an 8.0x exit multiple near the peer median).
- **What's priced in (one line):** A normalized free-cash-flow decline of roughly 9%/year for six straight years (FY2026–FY2031), or equivalently an 11.4% steady-state EBIT margin held indefinitely — a path more severe than company guidance, Street consensus, or even `04`'s own structural-bear input.
- **Biggest valuation risk (one line):** The base case ($15.27) rests on a terminal-value-dominated DCF (66.4% of EV) and a peer multiple that assumes the current "no moat proven, eroding trajectory" read stabilizes rather than persists — if Quest decelerates and commodity costs worsen as the headline-bear narrative describes, $8.42 (not $15.27) becomes the relevant anchor.

## 1A. Module Disconfirmation

- **Strongest bear point:** The market's own skepticism has real cited support — `business-model/07_business-quality.md` scores SMPL 40/100 (Weak), `business-model/09_moat.md` finds "No moat proven" with the trajectory explicitly "eroding" (gross margin down 4 of 5 years, ROIC drifting 7.1%→6.0% TTM, Quest itself losing category share), LTM revenue is −4.5% against a peer median of +0.3%, and FY2027 consensus is still being cut net-negative every month (revision breadth −4 to −6). The DCF base case is 66.4% terminal-value-dominated, meaning $15.27 is mostly a bet that this deterioration stabilizes rather than continues.
- **Strongest bull point (steelman):** Two independently-derived, evidence-grounded methods — peer relative ($13.76, +21.4%) and intrinsic DCF ($17.53, +54.7%) — agree within 27% and both sit meaningfully above price; even `04`'s own labelled permanent-impairment / structural-reset scenario ($13.09) sits above today's $11.33. The reverse-DCF (`05`) independently shows the market is pricing in a decline path (−9.08%/yr FCF for 6 straight years, zero years of even flat FCF) more severe than SMPL's own worst labelled structural case — the price already embeds outcomes worse than the module's own bear construction.
- **Single killer risk:** A genuine value-trap dynamic where the "turnaround" (September-2026 price increase landing, Quest re-accelerating, commodity costs easing) does not happen — management-governance's own read confirms zero years of proven operating inflection (RF-MGT-004) and a serial-acquirer history (OWYN, 71% impaired within 24 months) that caps trust in management's ability to execute the recovery the base case assumes.
- **Disconfirming evidence already visible:** `earnings/04_guidance-consensus.md` shows FY2027 estimate revisions net-negative across revenue, EBITDA and EPS in the trailing 90 days; GAAP LTM EBIT/EBITDA/EPS are all negative on a $391.9M impairment; `earnings/06_earnings-quality.md` flags rising accruals divergent from cash earnings (RF-EQ-001); `management-governance/99` independently rates governance "Watchlist" (59/100) with a CEO departure and two senior-leadership changes inside twelve months.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| valuation-data-triage | Sufficient — pool-verified price, full consensus/peer/cash-flow data; SOTP structurally not possible (single GAAP segment, no brand profit disclosure) | LTM GAAP EBITDA/EPS are impairment-distorted and negative; every downstream agent must state whether it uses GAAP, company Adjusted, or CIQ's own (divergent, third) EBITDA basis |
| price-and-capital-structure | Price $11.33 (pool-verified, Aug-04-2026); EV $1,326.84M; net debt $324.58M (1.38x Adj. EBITDA) | Two independent CIQ exports corroborate the price exactly; a stale $10.28 embedded price flagged and rejected as the anchor |
| multiples-own-history | SMPL trades at/below its own 5-year floor on every multiple tested (EV/Sales, EV/EBITDA, EV/EBIT, P/E, P/Book) | Mechanical reversion implies $33–$51/share, but self-rejected as a fair-value input — the old multiples were earned by a 5-year uninterrupted grower with a stable margin, a profile the current business does not have |
| relative-valuation-peers | 22%–48% discount to peer median across every computable multiple; discount "largely, not fully" warranted | Quality-adjusted (18% haircut) NTM EV/EBITDA of 7.15x on NTM Adj. EBITDA implies $13.76/share (+21.4%) — SMPL's below-peer-median leverage and at-or-above-peer-median margin argue the discount has room to be narrower |
| intrinsic-dcf | Base-case intrinsic value $17.53/share (+54.7%), WACC 7.93%, terminal g corrected to 1.0% via the financeable-growth gate | Only the Gate-2 financeable-growth correction (down from a plain 3.0% default) brought the DCF into a range corroborated by an independent 8.0x exit-multiple cross-check ($16.91) |
| reverse-dcf | Market prices in a −9.08%/yr normalized FCF decline for 6 straight years, or an 11.4% steady-state EBIT margin held indefinitely | The price does not even embed a "flatline forever" scenario (g=0 implies EV of $2,121M vs. today's $1,327M) — even `04`'s own structural-bear case ($13.09) sits above today's price |
| sum-of-the-parts | SOTP cannot be built (single GAAP segment, no brand-level profit disclosure); collapses to a consolidated BellRing-multiple sanity check at $16.71/share | Self-flagged as mechanically the same calculation as `03` on the same consolidated inputs — corroborates, does not independently triangulate |
| scenario-and-fair-value | Base fair value $15.27 (60/40 blend of peers/DCF); bull $21.98, headline bear $8.42, structural-reset floor $13.09 | The wide apparent football-field dispersion ($33–$51) lives entirely in the self-rejected own-history reversion — the two live triangulating methods (peers, DCF) agree within 27% |

## 3. Reconciliation

The two value-producing, weighted methods disagree by 27.4% ($13.76 peers vs. $17.53 DCF — `(17.53−13.76)/13.76`), below the 40% hard-flag threshold and explicitly reconciled by `07`: the DCF's higher read is not a stretch — its implied terminal EV/EBITDA (8.4x) sits close to the peer median (8.72x), and its Gordon-formula base is independently corroborated by an 8.0x exit-multiple cross-check ($16.91, within $0.62 of the DCF's own $17.53). No silent averaging was needed.

The much larger apparent spread in the football field — own-history reversion at $37.74 ($33.08–$51.31), 174% above the peer read and 115% above the DCF — is not a live disagreement to reconcile. `02`'s own producer explicitly rejects it as "not underwritten as achievable": that multiple set was earned by a business growing revenue every year for five years with a stable-to-expanding margin, and the current business has four straight quarters of decline, ~330bps of margin compression, a $391.9M impairment, and a CEO departure. `06` (SOTP, $16.71) is not independent corroboration either — it is self-flagged as mechanically the same calculation as `03` on the same consolidated inputs. Net: **methods broadly agree once the self-excluded/non-independent legs are set aside — the live fair-value core clusters at $13.76–$17.53, with the base point at $15.27; the wide headline dispersion is a rejected historical ceiling, not a genuine cross-method conflict.**

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No pool-verified price (price-state `indicative` or `none`) | **N** — price is pool-verified, $11.33, fresh (≈2 calendar days) | MoS, downside-to-bear, observed up/down, attractiveness + confidence | Not applicable — all scores computed on the pool-verified anchor |
| Stale pool-verified price (>5 trading days) | **N** — 2 calendar days old, well inside the freshness threshold | Valuation confidence | Not applicable |
| No consensus / forward estimates | **N** — 8-analyst consensus with target price, FY2026E/FY2027E EPS/revenue/EBITDA, plus company guidance, all present | Valuation confidence | Not applicable |
| No peer data | **N** — 10 named peers with LTM/NTM multiples as of 2026-07-24 | Overall usefulness | Not applicable |
| Only one valuation method usable | **N** — two independent weighted methods (peers, DCF) plus two corroborating/cross-check legs (own-history, SOTP, reverse-DCF) | Valuation confidence | Not applicable |
| No cash flow AND DCF is only method | **N** — full annual and quarterly cash flow statements exist; DCF is not the only method | Valuation confidence | Not applicable |
| SOTP not possible for multi-segment | **N** — SMPL is genuinely single-segment under GAAP (not a multi-segment business forced to skip SOTP); the SOTP non-readiness here is a business-structure fact, not a data gap | Overall usefulness | Not applicable |
| Methods disagree >40% unreconciled | **N** — the two weighted methods disagree by 27.4%, explicitly reconciled (§3) | Valuation confidence | Not applicable |
| Terminal value >75% of DCF EV | **N** — 66.4% of EV, below the 75% escalation line (flagged, not capped); `04` adds the required second lens (8.0x exit-multiple cross-check) anyway | Valuation confidence | Not applicable |
| Misaligned controlling owner (RF-OWN-004, §24 Filter 6) | **N** — `management-governance/04_ownership-and-insider-behavior.md` finding 04-012 and `99_management-governance-synthesis.md` confirm RF-OWN-004 is Not Applicable; SMPL is widely held (largest holder BlackRock ~13.9–14.8%, passive), no dual-class structure, no controlling bloc | Valuation attractiveness | Not applicable |

**No score caps triggered.** All six scores above (attractiveness 68, MoS 60, confidence 64, downside risk 55, data quality 78, overall usefulness 80) are evidence-based reads, not cap-constrained — confidence is held in the "mixed" band on its own merits (terminal-value-heavy DCF, judgment-call quality haircuts, thin/volatile GAAP earnings base), not because a hard cap fired.

## 5. Fair-Value Summary

The bull/base/bear fair-value levels — $21.98 / $15.27 / $8.42, with a structural-reset floor at $13.09 — are driven primarily by peer relative valuation on quality-adjusted NTM EV/EBITDA (60% of the base-point weight), the sole surviving multiples-camp method once own-history reversion self-excluded, blended with intrinsic DCF (40%, elevated above the usual ≤⅓ cross-check cap for that stated reason). At $11.33, the price implies a normalized FCF decline of roughly 9%/year for six straight years — the reverse-DCF and earnings-module evidence agree this is achievable for perhaps the next 1–2 years (FY2026 guidance −6.9% revenue, FY2027 consensus −4.5%) but not for four more years on top of it, given Quest's continued growth, an unlanded price increase, and easing Atkins comps that management itself flags. The margin of safety to the base case is 25.8% (a real but not extreme cushion); the downside to the headline bear is a separate 25.7% (the loss if the "turnaround stalls" narrative plays out instead). This cheapness is not a clean, uncomplicated bargain: `business-model/07`'s 40/100 weak-quality score and `business-model/09`'s "no moat proven, eroding trajectory" verdict mean part of the current discount is fundamentals-driven and deserved, not an ownership-driven value trap (RF-OWN-004 is not applicable) — the honest read is a real but partial margin of safety on a business that has not yet proven its own recovery.

## 6. What Would Change The Valuation Verdict?

| Current Verdict | What Would Make It Cheaper | What Would Make It More Expensive | Data Needed |
|---|---|---|---|
| Modestly undervalued | A confirmed acceleration of Quest's decline or Atkins' erosion (pushing toward the $8.42 headline bear); a third debt-funded acquisition before OWYN stabilizes (§24 Filter 4 pattern already flagged by management-governance); a further net-negative FY2027 estimate-revision cycle; commodity costs worsening beyond the FY2026 guide | The September-2026 price increase landing at or below management's stated elasticity assumption; Quest re-accelerating toward its historical growth rate; two-to-three consecutive quarters of margin stabilization at or above the TTM trough (proving the "turnaround" thesis management-governance says is not yet evidenced); a peer-multiple re-rate as the quality discount narrows | FQ4 FY2026 results (price-increase volume response, Quest/Atkins/OWYN brand-level trend); FY2027 guidance (first full post-impairment year); confirmation of whether the CEO transition stabilizes senior-leadership turnover |

## 7. Note To The Final Synthesizer

- **Fair-value levels:** Bull $21.98 / Base $15.27 / Bear (headline, 12-mo) $8.42 / Bear (structural reset, 24–36 mo) $13.09 — dominant method is peer relative valuation (60% weight), corroborated by intrinsic DCF (40% weight, elevated above the standard ≤⅓ cross-check cap because own-history reversion self-excluded, leaving peers as the sole multiples-camp method).
- **What the price implies:** a normalized FCF decline of ~9%/year for six straight years, or an 11.4% steady-state EBIT margin held indefinitely — more severe than company guidance/consensus supports past 1–2 years, and more severe than even this module's own structural-reset bear case ($13.09, which still sits above today's price).
- **Margin of safety vs. downside-to-bear:** margin of safety to base = 25.8% (the cushion); downside to the headline bear = 25.7% (the loss) — two separate reads that happen to be close in magnitude here but are not restatements of one another.
- **Genuine value or value trap:** No unaligned-controlling-owner flag applies (RF-OWN-004 confirmed Not Applicable by management-governance; SMPL is widely held, largest holder BlackRock ~13.9–14.8% passive, single share class). The cheapness is fundamentals-driven, not ownership-driven — but it is not fully warranted: `business-model` scores quality 40/100 (Weak) and moat "No moat proven, eroding trajectory," and management-governance separately confirms zero years of proven operating inflection and a serial-acquirer pattern (OWYN, 71% impaired). Treat the base case as a partial, not a clean, margin of safety.
- **Which method to trust:** peer relative valuation (quality-adjusted NTM EV/EBITDA) and intrinsic DCF, which agree within 27% and are the two methods actually doing triangulation work. Discount the own-history reversion ($37.74) entirely — it is self-rejected by its own producer as resting on a growth/margin profile the current business does not have. Treat SOTP ($16.71) as an echo of the peer read, not independent corroboration.
- **Partial-data caps:** none applied — price is pool-verified and fresh, consensus/peer/cash-flow data are all complete, methods are reconciled within threshold, and no misaligned-owner flag exists. All scores above are evidence-based reads, not cap-driven.
- **Biggest missing data point:** brand-level (Quest / Atkins / OWYN) profit or EBIT disclosure — SMPL discloses brand revenue but no brand profit anywhere in the pool, which is why a genuine sum-of-the-parts cannot be built and why the qualitative read ("Quest is likely doing the heavy lifting inside a consolidated multiple that a shrinking Atkins and a still-integrating OWYN are dragging down") cannot be sized in dollars.
- **Explicit handoff:** the master synthesizer's "Valuation and Peer Mispricing" section should defer to this synthesis; the bull/base/bear fair-value LEVELS here ($21.98 / $15.27 / $8.42 / $13.09) are the inputs for the master's probability-weighted scenario model — this module assigns no probabilities.

## 8. Simple Summary

- **Cheap or expensive:** Modestly undervalued — 25.8% margin of safety to the $15.27 base-case fair value at today's $11.33 price.
- **Bull / base / bear levels:** Bull $21.98, Base $15.27, headline Bear $8.42, plus a structural-reset floor of $13.09 that still sits above today's price.
- **What the market is pricing in:** A normalized free-cash-flow decline of roughly 9% a year for six straight years — a harsher path than the company's own guidance, Street consensus, or even this module's own worst labelled scenario supports.
- **Where the downside is:** 25.7% loss to the headline bear case ($8.42) if the "turnaround stalls" — driven by deeper commodity cost pressure and Quest deceleration, not by a balance-sheet or liquidity event.
- **Which method matters most:** peer relative valuation (quality-adjusted NTM EV/EBITDA), corroborated by intrinsic DCF within 27% — own-history multiples and SOTP are both self-flagged as not independently useful here.
- **Value trap risk:** Low on ownership grounds (no misaligned controlling owner) but the discount is only partly, not fully, deserved — weak business quality (40/100) and "no moat proven, eroding trajectory" mean part of the cheapness reflects real, unresolved risk, not pure mispricing.
- **Current price available:** Yes — pool-verified, fresh (≈2 calendar days old), corroborated by two independent Capital IQ exports. No price gap in this run.
- **Module usefulness for the master synthesizer:** High — all four active valuation methods ran cleanly, reconciled within threshold, on a fresh pool-verified price with no active data-quality caps.



---

## valuation / 00_valuation-data-triage.md

_Source: `00_valuation-data-triage.md`_

# Valuation Data Triage — SMPL

## 1. File Inventory

Extraction ran clean: `_pool_extracts/manifest.md` reports 11 workbook(s) → 54 tab(s); 65 extract file(s); **0 failures**. Every multi-tab workbook below is listed tab-by-tab, reconciled against the manifest.

| Filename | Type | Period Covered (from inside doc) | Last Modified (file mtime) | Valuation Relevance |
|---|---|---|---|---|
| Annual Report on Form 10-K_2025.pdf | Annual filing (10-K) | FY2025, fiscal year ended Aug 30, 2025 (filed ~Oct 28, 2025) | 2026-08-06 | High |
| The_Simply_Good_Foods_Company_-_Form_10-K(Oct-28-2025).doc (mhtml) | Annual filing (10-K), duplicate export | FY2025, fiscal year ended Aug 30, 2025 | 2026-08-06 | High (duplicate of above) |
| The_Simply_Good_Foods_Company_-_Form_10-Q(Jul-09-2026).doc (mhtml) | Quarterly filing (10-Q) | FQ3 FY2026, quarter ended May 30, 2026 (filed Jul 9, 2026) | 2026-08-06 | High — most recent quarterly filing; carries the Q3 FY26 goodwill/intangible impairment |
| The_Simply_Good_Foods_Company_-_Form_10-Q(Apr-09-2026).doc (mhtml) | Quarterly filing (10-Q) | FQ2 FY2026, quarter ended Mar 1, 2026 (filed Apr 9, 2026) | 2026-08-06 | Medium — superseded by Jul-09 10-Q for balance sheet, useful for trend |
| Annual Meeting Proxy Statement_2026.pdf | Proxy / governance | FY2026 AGM notice | 2026-08-06 | Medium — share count / ownership context, not a primary valuation input |
| The Simply Good Foods Company, Q3 2026 Earnings Call, Jul 09, 2026.rtf | Transcript | FQ3 FY2026 (quarter ended May 30, 2026), call held Jul 9, 2026 | 2026-07-24 | Medium-High — most recent management guidance/commentary |
| The Simply Good Foods Company, Q2 2026 Earnings Call, Apr 09, 2026.rtf | Transcript | FQ2 FY2026 (quarter ended Mar 1, 2026), call held Apr 9, 2026 | 2026-06-25 | Medium |
| **Company Comparable Analysis The Simply Good Foods Company.xls** — tab: Financial Data | Peer/comps export (workbook tab) | As-of 2026-07-24; LTM/NTM figures for SMPL + 10 peers | 2026-07-24 | High — peer market cap, EV, LTM/NTM revenue/EBITDA/EPS |
| " — tab: Trading Multiples | Peer/comps export (workbook tab) | As-of 2026-07-24 | 2026-07-24 | High — LTM & NTM TEV/Rev, TEV/EBITDA, TEV/EBIT, P/E, P/TangBV for SMPL + 10 named peers |
| " — tab: Operating Statistics | Peer/comps export (workbook tab) | As-of 2026-07-24 | 2026-07-24 | Medium |
| " — tab: Business Description | Peer/comps export (workbook tab) | As-of 2026-07-24 | 2026-07-24 | Low |
| " — tab: Implied Valuation | Peer/comps export (workbook tab) | As-of 2026-07-24 | 2026-07-24 | High — CIQ's own implied-valuation output, useful cross-check |
| " — tab: Valuation Chart | Peer/comps export (workbook tab) | As-of 2026-07-24 | 2026-07-24 | Low |
| " — tab: Credit Health Panel | Peer/comps export (workbook tab) | As-of 2026-07-24 | 2026-07-24 | Low (solvency-module territory) |
| " — tab: Disclaimer | Peer/comps export (workbook tab) | — | 2026-07-24 | None |
| **The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls** — tab: Key Stats | Annual financials export (workbook tab) | FY2017–FY2025A, LTM May-30-2026, FY2026E | 2026-07-24 | High — current price ($10.28 as of extract date), shares out, market cap |
| " — tab: Income Statement | Annual financials export (workbook tab) | FY2017–FY2025A, LTM May-30-2026 | 2026-07-24 | High — revenue/EBITDA/EBIT/EPS base |
| " — tab: Balance Sheet | Annual financials export (workbook tab) | FY2017–FY2025A, LTM May-30-2026 | 2026-07-24 | High — capital structure |
| " — tab: Cash Flow | Annual financials export (workbook tab) | FY2017–FY2025A, LTM May-30-2026 | 2026-07-24 | High — CFO/capex for FCF |
| " — tab: Multiples | Annual financials export (workbook tab) | FY2017–FY2025A, LTM | 2026-07-24 | High — own-history multiple band |
| " — tab: Historical Capitalization | Annual financials export (workbook tab) | Quarterly, 2017-08 to 2026-05 | 2026-07-24 | High — historical share price, shares out, EV/TEV, book value time series |
| " — tab: Capital Structure Summary | Annual financials export (workbook tab) | FY2017–FY2025A, 3-mo May-30-2026 | 2026-07-24 | High — debt/equity mix |
| " — tab: Capital Structure Details | Annual financials export (workbook tab) | Current | 2026-07-24 | Medium |
| " — tab: Ratios | Annual financials export (workbook tab) | FY2017–FY2025A, LTM | 2026-07-24 | Medium |
| " — tab: Supplemental | Annual financials export (workbook tab) | FY2017–FY2025A, LTM | 2026-07-24 | Low |
| " — tab: Industry Specific | Annual financials export (workbook tab) | Current | 2026-07-24 | Low |
| " — tab: Pension OPEB | Annual financials export (workbook tab) | Current | 2026-07-24 | Low (not material — SMPL has no material pension) |
| " — tab: Segments | Annual financials export (workbook tab) | FY2017–FY2025A | 2026-07-24 | Medium — confirms single ASC 280 reportable segment, consolidated only |
| **The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls** — tab: Key Stats | Quarterly financials export (workbook tab) | Quarterly series through FQ3 FY2026 | 2026-07-24 | High — LTM build |
| " — tab: Income Statement | Quarterly financials export (workbook tab) | Quarterly series through FQ3 FY2026 | 2026-07-24 | High |
| " — tab: Balance Sheet | Quarterly financials export (workbook tab) | Quarterly series through FQ3 FY2026 | 2026-07-24 | High |
| " — tab: Cash Flow | Quarterly financials export (workbook tab) | Quarterly series through FQ3 FY2026 | 2026-07-24 | High |
| " — tab: Multiples | Quarterly financials export (workbook tab) | Quarterly series through FQ3 FY2026 | 2026-07-24 | High |
| " — tab: Historical Capitalization | Quarterly financials export (workbook tab) | Quarterly, 2017-08 to 2026-05 | 2026-07-24 | Medium (duplicate series of Annual workbook tab) |
| " — tab: Capital Structure Summary | Quarterly financials export (workbook tab) | Quarterly series | 2026-07-24 | High |
| " — tab: Capital Structure Details | Quarterly financials export (workbook tab) | Current | 2026-07-24 | Medium |
| " — tab: Ratios | Quarterly financials export (workbook tab) | Quarterly series | 2026-07-24 | Medium |
| " — tab: Supplemental | Quarterly financials export (workbook tab) | Quarterly series | 2026-07-24 | Low |
| " — tab: Industry Specific | Quarterly financials export (workbook tab) | Current | 2026-07-24 | Low |
| " — tab: Pension OPEB | Quarterly financials export (workbook tab) | Current | 2026-07-24 | Low |
| " — tab: Segments | Quarterly financials export (workbook tab) | Quarterly series | 2026-07-24 | Medium |
| **TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls** — tab: Consensus | Consensus/estimate export (workbook tab) | Target price / EPS / revenue / EBITDA estimates, FY2026E onward; "as of" data current to run window | 2026-08-06 | High — target price $14.88 mean, 8 estimates, current price $11.34/$11.33 embedded |
| " — tab: Recent Changes | Consensus/estimate export (workbook tab) | Recent estimate revisions | 2026-08-06 | Medium |
| " — tab: Guidance | Consensus/estimate export (workbook tab) | Company guidance ranges (revenue/EBITDA) | 2026-08-06 | High — company-issued guidance ranges |
| " — tab: Multiples | Consensus/estimate export (workbook tab) | NTM through FY2033/CY2032 forward multiples | 2026-08-06 | High — long-range forward multiple curve |
| " — tab: Surprise | Consensus/estimate export (workbook tab) | Historical estimate beats/misses | 2026-08-06 | Low-Medium |
| " — tab: Trends | Consensus/estimate export (workbook tab) | Estimate trend history | 2026-08-06 | Low-Medium |
| " — tab: Revisions | Consensus/estimate export (workbook tab) | Estimate revision history | 2026-08-06 | Low-Medium |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf | Current-price source / company profile (Capital IQ) | **Share price as of Aug-04-2026: $11.33 close / $11.34 last (delayed); holders as of Aug-05-2026** | 2026-08-06 | **High — the freshest pool-verified current price and full EV bridge** |
| The Simply Good Foods Company NasdaqCM SMPL Public Company Profile.rtf | Current-price source / company profile (Capital IQ), duplicate format | Same profile content as the PDF above | 2026-07-24 | High (older-dated duplicate; PDF above is fresher) |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — tab: Summary | Capital-structure/credit export (workbook tab) | Multi-year through LTM | 2026-08-06 | Medium (solvency-module primary; supports net-debt cross-check) |
| " — tab: Financials | Capital-structure/credit export (workbook tab) | Multi-year through LTM | 2026-08-06 | Medium |
| " — tab: Operational Metrics Charts | Capital-structure/credit export (workbook tab) | Chart data | 2026-08-06 | Low |
| " — tab: Solvency Metrics Charts | Capital-structure/credit export (workbook tab) | Chart data | 2026-08-06 | Low |
| " — tab: Liquidity Metrics Charts | Capital-structure/credit export (workbook tab) | Chart data | 2026-08-06 | Low |
| " — tab: Disclaimer | Capital-structure/credit export (workbook tab) | — | 2026-08-06 | None |
| Short_Interest_12m_SMPL.xls — tab: Chart 1 with Data | Other (short interest) | Trailing 12 months | 2026-08-06 | Low |
| " — tab: Attributions | Other | — | 2026-08-06 | None |
| The Simply Good Foods Company NasdaqCM SMPL Customers.xls — tab: Customers | Other (business-model input) | Current | 2026-07-24 | Low (relevant to business-model module, not valuation) |
| The Simply Good Foods Company NasdaqCM SMPL Suppliers.xls — tab: Suppliers | Other (business-model input) | Current | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Events Calendar.xls — tab: Events Calendar | Other (catalyst dates) | Forward calendar | 2026-08-06 | Low-Medium (catalyst dating, not fair-value input) |
| The Simply Good Foods Company NasdaqCM SMPL Key Developments.rtf | Other (news/deal log) | Multi-year news log | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership History.xls — tab: History | Other (ownership) | Multi-year | 2026-08-06 | Low (governance-module territory) |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership Insider Trading.xls — tab: Insider Trading | Other (insider trades) | Multi-year | 2026-08-06 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership Summary.rtf | Other (ownership) | Current | 2026-08-06 | Low |

No documents under `data/SMPL/external/`. No `ciq_facts.json` sidecar exists in `_pool_extracts/` for this run — vendor workbook figures are cited directly from the tab extracts (each cited with its exact tab name and "as of" date), per the note already carried in `earnings/00_earnings-data-triage.md` and `business-model/03_segment-map.md` for this run.

## 1A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country / exchange | United States (Nasdaq: SMPL, NasdaqCM tier) | 10-K cover page; CIQ profile header "NasdaqCM:SMPL" [Annual Report on Form 10-K_2025.pdf; TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf] |
| Filing regime | US SEC (domestic filer — 10-K / 10-Q / DEF 14A-equivalent proxy) | Filing types and dates on face of documents [Annual Report on Form 10-K_2025.pdf; Form 10-Q(Jul-09-2026).doc; Annual Meeting Proxy Statement_2026.pdf] |
| Reporting standard | US GAAP | Consensus workbook header "Acctg. Standard: US GAAP" [EstimatesReport.xls, Consensus tab]; 10-K consolidated statements prepared under US GAAP conventions [Annual Report on Form 10-K_2025.pdf] |
| Reporting currency (and scale) | USD, reported in millions (per-share items in whole dollars) | "In Millions of the reported currency, except per share items" [Financials_Annual.xls, Income Statement tab header] |
| Fiscal-year end | Last Saturday in August (FY2025 ended Aug 30, 2025; FY2026 will end ~Aug 29, 2026) | "Current Fiscal Year End: Aug-31-2026" [EstimatesReport.xls, Consensus tab]; fiscal period labels "Aug-30-2025" etc. throughout Financials_Annual.xls |
| Document language(s) | English (all documents) | All extracts observed in English; no translation flag required |

No local-equivalent substitution issue arises here — SMPL is a standard US domestic SEC filer, so 10-K/10-Q/proxy are the correct primary documents and are all present.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, from run date 2026-08-06) |
|---|---|---|---|
| Annual filing | Annual Report on Form 10-K_2025.pdf | FY2025, fiscal year ended Aug 30, 2025 (filed Oct 28, 2025) | ~9.3 months since FYE; ~9.3 months since filing |
| Quarterly filing | The_Simply_Good_Foods_Company_-_Form_10-Q(Jul-09-2026).doc | FQ3 FY2026, quarter ended May 30, 2026 (filed Jul 9, 2026) | ~2.2 months since quarter-end; ~1 month since filing |
| Capital structure / balance sheet | Financials_Quarterly.xls, Balance Sheet tab (cross-checked to the Jul-09-2026 10-Q) | Quarter ended May 30, 2026 | ~2.2 months |
| Consensus / estimate export | TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls, Consensus tab | Target price $14.88 mean (8 estimates); FY2026E/FY2027E EPS, revenue, EBITDA | Data embedded is current to the run window (file mtime 2026-08-06) |
| Multiples export | Financials_Annual.xls / Financials_Quarterly.xls, Multiples tabs; EstimatesReport.xls, Multiples tab | Own-history LTM through FY2033E/CY2032E forward curve | Current |
| Peer / comps export | Company Comparable Analysis The Simply Good Foods Company.xls, Trading Multiples & Financial Data tabs | As-of 2026-07-24 (10 named peers) | ~0.4 months (13 days) |
| Current price (Capital IQ) | TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf | Close $11.33 as of Aug-04-2026 (Last delayed $11.34) | 2 calendar days (~1-2 trading days) — fresh |
| Cash flow statement | Financials_Quarterly.xls, Cash Flow tab (LTM through May-30-2026); FQ3 FY26 10-Q | LTM ended May 30, 2026 | ~2.2 months |
| Segment data | Financials_Annual.xls, Segments tab; FY25 10-K Note 15; business-model/03_segment-map.md | FY2025 (brand-level revenue disaggregation); one GAAP reportable segment | ~9.3 months for the audited brand split; FQ3 FY26 10-Q Note 12 updates it to 9-months-ended May 30, 2026 |

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | Y | TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf, close $11.33 as of Aug-04-2026; cross-checked to EstimatesReport.xls Consensus tab "Latest Price/Last Close Price: 11.34/11.33" | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | 10-K, Note on EPS: "Weighted average common shares – diluted 101,510,772" (FY2025); Public Company Profile: Shares Out. 88.46m (current, basic, cover-page count) — both bases present, must be reconciled by `01` | Needed for market cap and per-share fair value |
| Dilution data (options/RSUs/convertibles) | Y | 10-K, Note on stock-based compensation and EPS: stock options, RSUs, PSUs, treasury-stock-method language and options-outstanding table as of Aug 30, 2025 | Needed for fully diluted per-share fair value |
| Business type track (Operating / Financial / REIT / Commodity / Holding co.) | Y — Operating (packaged/branded consumer nutrition) | 10-K business description; CIQ profile "Packaged Foods and Meats" industry classification | Determines which valuation methods are valid |
| Total debt, cash, minority/preferred | Y | Financials_Annual.xls / Financials_Quarterly.xls, Capital Structure Summary & Balance Sheet tabs; Public Company Profile EV bridge (Cash $123.88m, Total Debt $448.46m, no pref/minority) | Needed for the enterprise-value bridge |
| Income statement (LTM or FY) | Y | Financials_Annual.xls, Income Statement tab (FY2017–FY2025A + LTM May-30-2026); FY25 10-K; FQ3 FY26 10-Q | Earnings/EBITDA base for multiples and DCF |
| Cash flow statement | Y | Financials_Annual.xls / Financials_Quarterly.xls, Cash Flow tabs (LTM through May-30-2026); FY25 10-K; FQ3 FY26 10-Q | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | EstimatesReport.xls, Consensus tab (8 analysts, target price $14.88 mean, FY2026E/FY2027E EPS/revenue/EBITDA); Guidance tab (company-issued ranges) | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y | Financials_Annual.xls / Financials_Quarterly.xls, Multiples tabs (FY2017–FY2025A + LTM); Historical Capitalization tab (quarterly share price/EV series back to 2017) | Own-history re-rating read |
| Peer / comps data | Y | Company Comparable Analysis xls (10 named peers: UTZ, JJSF, HAIN, CPB, MZTI, BRBR, CAG, FRPT, KHC, JBSS), Trading Multiples & Financial Data tabs, as-of 2026-07-24 | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Partial — revenue Y, EBIT N | Financials_Annual.xls Segments tab (one GAAP reportable segment, no brand-level profit); FY25 10-K Note 15; business-model/03_segment-map.md (brand-level revenue disaggregation exists, profit share explicitly "Not disclosed" for every brand) | Sum-of-the-parts — revenue split exists but no segment/brand profit metric is disclosed anywhere in the pool |
| Dividend / buyback data | Y | Public Company Profile: "Dividend Yield % —" (no dividend); Financials_Annual.xls Cash Flow tab carries buyback/repurchase lines; FY25 10-K discloses share-repurchase program | Shareholder-yield read (SMPL pays no dividend; buybacks disclosed) |

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

All ten upstream business-model and earnings outputs exist in this run root. Management-governance module outputs are also complete (`management-governance/99_management-governance-synthesis.md`) and confirm the §24 Filter 6 unaligned-owner test is **not triggered** (RF-OWN-004 = Not Applicable — no government, parent, or conglomerate control; largest holder BlackRock at ~14.8%, passive) [management-governance/04_ownership-and-insider-behavior.md, finding 04-012; 99_management-governance-synthesis.md]. This means the value-trap score cap tied to a misaligned controlling owner does not apply here, subject to the downstream valuation agents' own confirmation.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | N — a pool-verified Capital IQ price ($11.33 close, Aug-04-2026, ~2 calendar days old) exists | 01, 05, 07, 99 | Not applicable |
| No consensus / forward estimates | N — 8-analyst consensus with target price, FY2026E/FY2027E EPS/revenue/EBITDA, and a company guidance range all present | 02, 03, 04, 05 | Not applicable |
| No peer data | N — 10 named peers with LTM and NTM multiples as of 2026-07-24 | 03, 06 | Not applicable |
| No segment-level data | **Y (partial)** — brand-level revenue exists but brand-level profit/EBIT is explicitly not disclosed anywhere in the pool (one GAAP reportable segment; "Profit Share... Not disclosed" for every brand) | 06 | SOTP cannot be built on a genuine segment-EBIT × comparable-multiple basis; `06` should return the "single-segment — SOTP collapses to the consolidated read" note per the Segment/SOTP Rule (>85% of the one GAAP reportable segment is automatic here), while still flagging the brand-mix dispersion (Quest growing, Atkins in structural decline, OWYN newly acquired and lower-margin) as a qualitative read, not a quantified SOTP input |
| No balance sheet / capital structure | N — full balance sheet and capital-structure detail through FQ3 FY2026 (May 30, 2026) present | 01, 04, 06 | Not applicable |
| No cash flow statement | N — annual (FY2017–FY2025) and quarterly (through FQ3 FY2026) cash flow statements present | 04 | Not applicable |

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y | None | Financials_Annual.xls / Financials_Quarterly.xls Multiples tabs give an LTM-through-FY2025 own-history band, plus a Historical Capitalization series of quarterly share price/EV back to 2017 — but note LTM EPS/margins are distorted by the FQ3 FY2026 goodwill/intangible impairment (net loss of $198.8m LTM per Cash Flow tab "Net Income" row), so downstream agents must reconcile GAAP LTM multiples against CIQ's "Normalized Net Income" line (LTM $110.1m) and flag which basis each multiple uses |
| Peer relative valuation | Y | None | 10 named packaged-food peers (UTZ, JJSF, HAIN, CPB, MZTI, BRBR, CAG, FRPT, KHC, JBSS) with LTM and NTM TEV/Revenue, TEV/EBITDA, TEV/EBIT, P/E, P/TangBV, as-of 2026-07-24 |
| Intrinsic DCF (Operating FCFF) | Y | None | Full annual and quarterly cash flow statements (CFO, capex) support a `CFO − total capex` FCFF build; forward consensus (through FY2027E, and CIQ's own forward-multiple curve through FY2033/CY2032) supports a multi-year forecast path |
| Reverse DCF | Y (conditional on `04` running first per Calculation Standard 9) | None outright, but depends on `04`'s output existing | Pool-verified price and full cash-flow base support solving for implied growth once `04` sets the base-case WACC/horizon/FCF base |
| SOTP | **N** | No brand-level (or segment-level) profit/EBIT disclosure anywhere in the pool — SMPL reports one GAAP reportable segment; brand revenue is disclosed but brand profit is explicitly "Not disclosed" [business-model/03_segment-map.md] | Per the Segment/SOTP Rule, `06` should record "single-segment — SOTP collapses to the consolidated read" rather than fabricating brand-level margins; a qualitative brand-mix discussion (Quest growing/dominant, Atkins declining, OWYN newly integrated and lower-margin) can still inform the multiples/DCF forecast path even though it cannot feed a quantified SOTP |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A usable LTM/FY earnings and cash-flow base, full capital-structure data (balance sheet, debt schedule, no preferred/minority), a pool-verified current price (Capital IQ, $11.33 close as of Aug-04-2026, ~2 days old), an 8-analyst forward consensus with company guidance, and a 10-name peer comp set with LTM/NTM multiples are all present — clearing both the "usable earnings/cash-flow base" and "at least one forward-looking or relative input" legs of the Sufficient rule with a pool-verified price on top.
- **Methods that can run:** own-history multiples, peer relative valuation, intrinsic DCF (Operating FCFF), reverse-DCF (once `04` runs). SOTP does not run as a quantified method — SMPL is a single GAAP reportable segment with no brand-level profit disclosure; `06` should log the single-segment collapse note rather than force a fabricated breakup.
- **Active partial-data caps:** None triggered from the Score-Cap Rules table — no-price, no-consensus, no-peer-data, no-balance-sheet, and no-cash-flow caps all fail to apply because each underlying input is present. The only structural limitation is SOTP non-readiness (Segment/SOTP Rule — "SOTP not possible for a multi-segment business" cap does not apply either, since SMPL is not a multi-segment business under GAAP; `06`'s output caps Overall usefulness at 80 only if it were a multi-segment business forced to skip SOTP, which is not the case here — flagged for `99` to confirm at synthesis time).
- **Critical missing items:** None blocking. One flag for downstream agents: LTM GAAP net income (−$198.8m) and diluted EPS (−$2.08) are impairment-distorted by the Q3 FY2026 goodwill and Atkins/OWYN intangible impairments triggered by the share-price decline [FQ3 FY26 10-Q, Impairment notes]; agents building multiples or a DCF FCF base off "reported" earnings must state whether they are using GAAP-reported or CIQ-normalized figures (Normalized Net Income LTM $110.1m) per CLAUDE.md §15's reported-vs-adjusted separation requirement, and must not silently mix the two.



---

## valuation / 01_price-and-capital-structure.md

_Source: `01_price-and-capital-structure.md`_

# Price & Capital Structure — SMPL

Reporting standard: US GAAP. Reporting currency: USD (in millions unless stated otherwise; per-share items in whole dollars). Fiscal year ends the last Saturday in August (FY2025 ended August 30, 2025). Jurisdiction: US domestic SEC filer (Delaware incorporation, Nasdaq: SMPL) — 10-K / 10-Q / proxy are the correct primary documents; no local-equivalent substitution issue arises. [FY2025 10-K, cover page; `valuation/00_valuation-data-triage.md` §1A]

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $11.33 (close) | Capital IQ Public Company Profile [TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf, "Share Price as of Aug-04-2026" / "Previous Close 11.33"] | Aug-04-2026 |
| Currency | USD | Same source | — |
| Price basis (last close / intraday / indicative) | Last close ($11.33); a "Last (Delayed)" quote of $11.34 is also shown on the same page | Same source | Aug-04-2026 (close) / delayed intraday quote undated to the minute |

**Cross-check (two independent pool sources agree exactly):** `TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls`, Consensus tab, "Latest Price/Last Close Price: 11.34/11.33" [EstimatesReport.xls, Consensus tab, file current to run window 2026-08-06] matches the Public Company Profile PDF's $11.34 delayed / $11.33 close exactly. Both are Capital IQ-sourced pool exports (not two independently-owned data providers), so this is an internal-consistency cross-check within the data pool, not the "two independent web sources" corroboration test — it is not needed here because a genuine pool-verified quote already exists (Source Hierarchy tier 3, `MODULE_RULES.md`), which takes priority over any web quote.

**Stale duplicate flagged (not used):** `The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls`, Key Stats tab, "Current Capitalization" box shows a stale embedded price of $10.28 with Shares Out. 88.460545 and Market Cap 909.37 — an older snapshot baked into that workbook export at a prior refresh. This is NOT used as the anchor; it is superseded by the fresher Public Company Profile PDF and the Consensus tab, both of which agree at $11.33/$11.34. Flagged here so downstream agents do not pick up the stale $10.28 figure by mistake.

**Price staleness (quantitative):** Run date 2026-08-06 (Thursday) − quote as-of 2026-08-04 (Tuesday close) = 2 calendar days ≈ 1–2 trading days. This is well inside the 5-trading-day freshness threshold — **no refresh attempt required, no staleness cap applies.**

**Price-state tag: `pool-verified`.**

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | 88,460,545 (Jul-02-2026) | FQ3 FY2026 10-Q cover page: "As of July 2, 2026, there were 88,460,545 shares of common stock, par value $0.01 per share, issued and outstanding." [Form 10-Q (Jul-09-2026), cover page] — cross-checked to Capital IQ Public Company Profile "Shares Out. 88.46" [TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf] |
| Diluted weighted-average shares (period) | 89,940,680 (13 weeks ended May-30-2026) | Form 10-Q (Jul-09-2026), Consolidated Statements of Operations — basic = diluted for this period because the Company reported a net loss, making all potentially dilutive securities antidilutive |
| Options/RSUs count (if disclosed) | Options: 3,429,580 outstanding, wtd-avg strike $23.02, wtd-avg remaining life 6.22 yrs. RSUs (non-vested): 1,121,300, wtd-avg grant-date fair value $22.04. PSUs (non-vested): 353,039, wtd-avg grant-date fair value $34.32. SARs: 150,000 outstanding, wtd-avg strike $37.67 | Form 10-Q (Jul-09-2026), Note on Stock-Based Compensation, all "as of May 30, 2026" |
| Convertibles / potential shares (if disclosed) | None — both the Term Loan and the Revolving Credit Facility are explicitly marked "Convertible: No" | Financials_Quarterly.xls, Capital Structure Details tab, "FY 2025 Capital Structure As Reported Details" |
| **Fully diluted shares (TSM + if-converted)** | **89,934,884** | Agent calculation: 88,460,545 (basic, cover-page) + 1,121,300 (non-vested RSUs, full add) + 353,039 (non-vested PSUs at target, full add) = 89,934,884. Options (3,429,580 @ $23.02) and SARs (150,000 @ $37.67) are excluded entirely — both are out-of-the-money at the $11.33 current price (strike > price), so the treasury-stock method yields zero incremental shares for both |
| Share count used for market cap | 88,460,545 | Cover-page "as of" count, per Fully Diluted Equity Rules Hard Rule 1 |
| Share count used for per-share fair value | 89,934,884 | Fully diluted count above |

**Limitation / simplification stated:** the fully diluted count above adds the full non-vested RSU/PSU count rather than netting each award against its disclosed unrecognized compensation cost (a stricter treasury-stock-method refinement GAAP diluted EPS applies for share-settled awards). Because RSUs/PSUs carry no cash exercise price, the simplification's error is small relative to the options/SARs exclusion, which is unambiguous (both strikes are roughly double the current price). This is a simplified TSM, not the diluted weighted-average of 89,940,680 — the two happen to be close (a coincidence of this being a net-loss quarter where GAAP diluted = basic).

**Material gap noted:** the FY2025 10-K (fiscal year ended Aug-30-2025) reports a full-year diluted weighted-average of 101,510,772 shares (basic 100,695,181 + options 629,800 + non-vested units 185,791) [FY2025 10-K, EPS note]. That count is ~13% higher than the current 88,460,545 cover-page count — the gap reflects roughly 12 million shares repurchased since FY2025 began (buybacks of $213.2 million in the thirty-nine weeks ended May-30-2026 alone [Form 10-Q (Jul-09-2026), cash flow MD&A]). The FY2025 10-K's diluted weighted-average is NOT used for market cap or current per-share fair value — it is a stale, pre-buyback count, shown here only to explain why FY2025-vintage per-share figures elsewhere in the pool run higher share counts than this report's anchor.

## 3. Market Capitalization

`Market cap = share count × current price = 88,460,545 × $11.33 = $1,002.26 million`

Cross-checked exactly to Capital IQ's own computed figure: "Market Capitalization 1,002.26" [TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf, Capitalization box].

## 4. Enterprise Value Bridge

| Component | Amount (USD mm) | Source |
|---|---:|---|
| Market capitalization | 1,002.26 | Section 3 above |
| + Funded debt (Term Loan, net carrying value) | 397.04 | Financials_Quarterly.xls, Balance Sheet tab, "Long-Term Debt" as of May-30-2026 ($397.037M net of unamortized deferred financing fees); gross principal outstanding was $400.0 million [Form 10-Q (Jul-09-2026), Note 5 (Long-Term Debt and Line of Credit): "As of May 30, 2026, the outstanding balance of the Term Facility was $400.0 million... there were no amounts drawn against the Revolving Credit Facility"] |
| + Operating lease liabilities (current + long-term) | 51.43 | Financials_Quarterly.xls, Balance Sheet tab: Curr. Port. of Leases $7.975M + Long-Term Leases $43.452M, as of May-30-2026. The Company had no finance leases as of that date [Form 10-Q (Jul-09-2026), Note 8 (Leases): "As of May 30, 2026, the Company had no finance lease agreements"] |
| + Minority / non-controlling interest | 0 | Financials_Annual.xls, Key Stats tab: "+ Total Minority Interest —" |
| + Preferred equity | 0 | Same source: "+ Pref. Equity —" |
| − Cash & equivalents | (123.88) | Financials_Quarterly.xls, Balance Sheet tab, "Cash And Equivalents" as of May-30-2026 |
| **= Enterprise value (EV)** | **1,326.84** | Sum of the above |

Arithmetic: 1,002.26 + 397.04 + 51.43 + 0 + 0 − 123.88 = 1,326.85 (rounding; ties to Capital IQ's own headline TEV of $1,326.84 in the Public Company Profile bridge, which bundles funded debt and operating lease liabilities into one "Total Debt" line of $448.46M — this report splits that line into its two components for transparency, per the report structure's requirement to state operating-lease treatment explicitly, and the two presentations reconcile exactly: $397.04M + $51.43M = $448.46M).

**Cash quality check:** the $123.88M "Cash and Equivalents" line is genuine operating cash — no restricted cash, margin balances, or long-tenor mark-to-market securities are disclosed anywhere in the FQ3 FY2026 10-Q (searched: no "restricted cash," "short-term investments," or "marketable securities" line items appear in the balance sheet or notes). SMPL has no financial subsidiary and no equity-method investments. No adjustment to the CIQ "cash" figure was needed — it is adopted as-is because it already represents only real, unrestricted operating cash. [Form 10-Q (Jul-09-2026), Consolidated Balance Sheets and Notes]

**Adjustments NOT made, and why:**
- **Pension / OPEB:** no adjustment — SMPL carries no material pension or other post-employment benefit obligation [Financials_Annual.xls, Pension OPEB tab: no material balances; `valuation/00_valuation-data-triage.md` §1, row "Pension OPEB... not material"].
- **Contingent liabilities / litigation reserves:** not incorporated into this bridge — that is `balance-sheet-survival/05_off-balance-sheet-and-contingencies.md`'s scope, not this agent's.
- **Equity-method investments:** none disclosed; no adjustment needed.

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt (funded debt + operating lease liabilities, per CIQ's bundled definition) | $448.46M | Section 4 bridge above |
| Cash & equivalents | $123.88M | Section 4 bridge above |
| **Net debt (total debt − cash)** | **$324.58M** | Agent calculation: 448.46 − 123.88 = 324.58. Cross-checked to `earnings/01_historical-financials.md` §2, which independently states "Net debt at latest period-end (May-30-26): $324.6M" [7]. The two reconcile to rounding — no gap. |
| Net debt / EBITDA — **GAAP basis, LTM (May-30-2026)** | **Not meaningful** | `earnings/01_historical-financials.md` §2 computes LTM GAAP EBITDA at **$(213.1)M** (negative) — the company's own quarterly GAAP-to-Adjusted-EBITDA reconciliation tables [Form 10-Q (Jul-09-2026) and Form 10-Q (Apr-09-2026)] show LTM EBITDA turned deeply negative because of a $391.9M non-cash goodwill/brand impairment recognized across FQ4 FY2025–FQ3 FY2026. A leverage ratio on a negative EBITDA denominator is not meaningful and is not shown. |
| Net debt / **Adjusted** EBITDA — LTM (May-30-2026), company-defined non-GAAP measure | **1.38x** ($324.58M / $234.6M) | Adjusted EBITDA of $234.6M (LTM) is sourced from `earnings/01_historical-financials.md` §2, built from the company's own quarterly Adjusted EBITDA disclosures (excludes loss on impairment, stock-based comp, business-transaction costs, inventory step-up, integration expense, term-loan fees, and restructuring, per the company's own non-GAAP definition) [Form 10-Q (Jul-09-2026) and Form 10-Q (Apr-09-2026), "Reconciliation of EBITDA and Adjusted EBITDA"]. Cross-checked against Capital IQ's independently-computed Credit Health Panel: "Net Debt/EBITDA (x)" = **1.4x** for the same LTM period [Credit Health Panel.xls, Financials tab, LTM 2026-05-30 column] — the two agree within rounding. |

**Data-quality flag (source-hierarchy note):** Capital IQ's own "EBITDA" line in the Financials_Annual.xls Key Stats tab shows LTM (May-30-2026) EBITDA as **+$217.5M**, which is neither the GAAP-reported figure (−$213.1M, per the company's own 10-Q reconciliation tables) nor the company's own disclosed Adjusted EBITDA ($234.6M) — it sits between the two, evidence that CIQ's standardized "EBITDA" field applies its own partial normalization that does not match either of the company's own disclosed bases. Per the source hierarchy (filings beat vendor exports), this report uses the company's own GAAP and Adjusted EBITDA figures (via `earnings/01_historical-financials.md`, which built them directly from the 10-K/10-Q reconciliation tables) for the leverage ratio above, not the CIQ Key Stats "EBITDA" line. This divergence is analyzed in full in `earnings/01_historical-financials.md` §4/§6 and is the single biggest data-quality issue in the SMPL pool.

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | $16.03 | Financials_Quarterly.xls, Balance Sheet tab: Total Common Equity $1,418.12M ÷ 88.460545M shares (as of May-30-2026), matches the tab's own disclosed "Book Value/Share" of 16.03 |
| Tangible book value per share | $(1.03) | Same source: Tangible Book Value $(90.7)M ÷ shares outstanding — negative because Goodwill ($552.0M) + Other Intangibles ($956.9M) exceed total common equity even after the FY2026 impairments |
| Net debt per share | $3.67 | $324.58M net debt (Section 5) ÷ 88.460545M basic shares |

## 7. Anchor Summary (canonical numbers for downstream agents)

Current price is pool-verified at $11.33 (close, Aug-04-2026), corroborated exactly by two independent Capital IQ exports within the pool (Public Company Profile PDF and the Estimates Report Consensus tab). It is fresh (≈1–2 trading days old at the 2026-08-06 run date) — no staleness cap applies. Basic shares outstanding for market cap (88,460,545, as of Jul-02-2026) and fully diluted shares for per-share fair value (89,934,884, simplified TSM — options and SARs excluded as out-of-the-money) are each sourced from the FQ3 FY2026 10-Q. Market cap is $1,002.26M and enterprise value is $1,326.84M, bridged from funded debt ($397.04M, a single non-convertible Term Loan, undrawn revolver) plus operating lease liabilities ($51.43M) less genuine operating cash ($123.88M) — no preferred equity, no minority interest, no equity-method investments. Net debt is $324.58M, cross-checked to the earnings module's independently-computed $324.6M. Leverage on a GAAP-EBITDA basis is not meaningful (LTM GAAP EBITDA is negative, driven by a $391.9M non-cash goodwill/brand impairment); on the company's own Adjusted EBITDA basis, net debt / Adjusted EBITDA (LTM) is 1.38x — corroborated independently by Capital IQ's Credit Health Panel at 1.4x. Reporting currency is USD throughout.

### Anchor Block (copy-forward)

- Price: $11.33 (Aug-04-2026, last close)
- Price-state: pool-verified
- Currency: USD
- Shares (market cap): 88,460,545 (FQ3 FY2026 10-Q cover page, "as of" Jul-02-2026)
- Shares (per-share fair value): 89,934,884 (fully diluted — simplified TSM; RSUs/PSUs added in full, options and SARs excluded as out-of-the-money at current price)
- Market cap: $1,002.26M
- Net debt: $324.58M (total debt $448.46M [funded debt $397.04M + operating lease liabilities $51.43M] − cash $123.88M)
- EV: $1,326.84M
- Key caveats: (1) GAAP LTM EBITDA is negative (impairment-driven) — any net debt/EBITDA ratio downstream must use the company's own Adjusted EBITDA ($234.6M LTM, net debt/Adj. EBITDA = 1.38x) or state explicitly that the GAAP ratio is not meaningful; (2) Capital IQ's own Key Stats "EBITDA" field does not match either the GAAP or the company-defined Adjusted EBITDA figure for the LTM period — do not cite it as either; (3) fully diluted share count uses a simplified (non-netted) RSU/PSU add rather than the strict unrecognized-compensation-cost treasury-stock refinement — a small-magnitude limitation, stated for transparency; (4) FY2025-vintage per-share/EPS figures elsewhere in the pool use a materially higher diluted weighted-average share count (101,510,772) that predates ~12 million shares of subsequent buybacks — do not mix that count with this report's current 88,460,545 / 89,934,884 counts.



---

## valuation / 02_multiples-own-history.md

_Source: `02_multiples-own-history.md`_

# Multiples — Own History — SMPL

Reporting currency: USD. Anchors taken verbatim from `01_price-and-capital-structure.md`: price $11.33 (close, Aug-04-2026, pool-verified), market cap $1,002.26M (shares 88,460,545), enterprise value (EV) $1,326.84M, net debt $324.58M (strict basis: total debt $448.46M [funded debt + operating leases] − cash $123.88M), fully diluted shares 89,934,884. Business type: Operating (packaged/branded consumer nutrition) — EV-based and P/E-based multiples apply per the Business-Type Method Map; no REIT/financial adjustments needed.

**A note that governs this whole report:** SMPL's trailing twelve months (LTM, ended May-30-2026) carries a $391.9M non-cash goodwill/brand impairment that makes GAAP EBITDA, EBIT, net income and EPS **negative** — every GAAP-basis multiple on those lines is NM (not meaningful) [`earnings/01_historical-financials.md` §2]. This report uses the company's own disclosed **Adjusted EBITDA** (non-GAAP, company-defined) where available, and separately shows Capital IQ's own independently-computed "EBITDA"/"EBIT"/"Normalized Net Income" lines, which are neither GAAP nor the company's Adjusted EBITDA (a divergence already flagged in `01` §5 as "the single biggest data-quality issue in the SMPL pool"). Every multiple below states which basis it uses.

## 1. Current Multiples

| Multiple | Basis (LTM / NTM / FY) | Metric Value | Current Multiple | Source |
|---|---|---:|---:|---|
| EV / Sales | LTM (to May-30-26) | Revenue $1,392.2M | **0.95x** | `earnings/01_historical-financials.md` §2; EV $1,326.84M per `01` |
| EV / Sales | FY2026E (consensus) | Revenue $1,351.7M | 0.98x | `TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls`, Multiples tab, FY2026 row |
| EV / Sales | NTM (consensus) | Revenue $1,292.2M | 1.03x | Same source, NTM row |
| EV / EBITDA | LTM, GAAP | GAAP EBITDA $(213.1)M | **NM** (negative) | `earnings/01_historical-financials.md` §2 |
| EV / EBITDA | LTM, company-defined Adjusted EBITDA | $234.6M | **5.66x** | `earnings/01_historical-financials.md` §2 (company's own quarterly reconciliation tables); EV per `01` |
| EV / EBITDA | LTM, Capital IQ-computed basis (differs from both GAAP and company Adjusted — see note above) | $217.5M | 6.10x | `Financials_Annual.xls`, Key Stats tab, "EBITDA" LTM column |
| EV / EBITDA | FY2026E (consensus) | EBITDA $222.1M | 5.97x | EstimatesReport.xls, Multiples tab, FY2026 row |
| EV / EBITDA | NTM (consensus) | EBITDA $217.8M | 6.09x | Same source, NTM row |
| EV / EBIT | LTM, GAAP | GAAP EBIT $(243.3)M | **NM** (negative) | `earnings/01_historical-financials.md` §2 |
| EV / EBIT | LTM, Capital IQ-computed basis (no company-disclosed Adjusted EBIT exists — company reconciles only to Adjusted EBITDA, not adjusted operating income) [`earnings/01` §4] | $193.4M | 6.86x | `Financials_Annual.xls`, Key Stats tab, "EBIT" LTM column |
| EV / EBIT | FY2026E (consensus) | EBIT $198.7M | 6.68x | EstimatesReport.xls, Multiples tab, FY2026 row |
| EV / EBIT | NTM (consensus) | — | 6.68x | Same source, NTM row |
| P / E | LTM, GAAP | GAAP diluted EPS $(2.08) | **NM** (negative) | `earnings/01_historical-financials.md` §2 |
| P / E | LTM, Capital IQ-normalized net income basis | Normalized net income $110.1M ÷ 89.935M diluted shares = $1.22/sh | 9.10x | `Financials_Annual.xls`, Income Statement tab, "Normalized Net Income" LTM column; market cap $1,002.26M per `01` |
| P / E | FY2026E (consensus, normalized EPS) | EPS $1.646 | 6.88x | EstimatesReport.xls, Multiples tab, FY2026 row |
| P / E | NTM (consensus, normalized EPS) | EPS $1.67 | 6.77x | Same source, NTM row |
| P / Book | LTM (to May-30-26) | Book value $1,418.12M / $16.03 per share | 0.71x | `01_price-and-capital-structure.md` §6 |
| P / Book | FY2026E (consensus) | — | 0.72x | EstimatesReport.xls, Multiples tab, FY2026 row |
| P / Tangible Book | LTM | Tangible BV $(90.7)M (negative — goodwill + intangibles exceed equity) | **NM** | `01_price-and-capital-structure.md` §6 |
| P / FCF | LTM | FCF (CFO − capex) $119.4M | 8.39x | `earnings/01_historical-financials.md` §2; market cap per `01` |
| FCF yield | LTM | Same | 11.9% | Same |
| Dividend yield | — | SMPL pays no dividend | 0% | `01_price-and-capital-structure.md`; Capital IQ Public Company Profile, "Dividend Yield % —" |

**PEG (FY2026E, consensus):** 2.88x [EstimatesReport.xls, Multiples tab] — flagged for completeness only; not load-bearing given the LT-growth estimate behind it is built from only 3 analysts with a wide high/low spread (9.0%/−1.7%) [EstimatesReport.xls, Consensus tab].

## 2. Historical Multiple Bands (5 years, quarterly close, 2021-Q3 through 2026-Q2)

Band built from 20 consecutive quarterly closing values (2021-09-30 through 2026-06-30) in the pool's own multiples time series — a genuine 5-year own-history band, not a partial-data case. Source for every cell: `Financials_Annual.xls` (identical to `Financials_Quarterly.xls`), Multiples tab, "Close" rows, each metric. All multiples in this table are on Capital IQ's own consistently-computed basis (its EBITDA/EBIT reclassification, not GAAP or the company's Adjusted EBITDA — see the note at the top of this report); this is what makes the *time series itself* internally consistent for a like-for-like reversion read, even though the LTM EBITDA number embedded in it ($217.5M) differs modestly from the company's own Adjusted EBITDA ($234.6M).

| Multiple (CIQ basis) | Min | Mean | Median | Max | Current (fresh, at $11.33 anchor) | Percentile of Range |
|---|---:|---:|---:|---:|---:|---:|
| EV / LTM Sales | 1.09x | 2.92x | 3.12x | 4.39x | 0.95x | **Below the 5-yr min** (−13% under the prior floor) |
| EV / LTM EBITDA (CIQ basis) | 6.11x | 14.81x | 15.85x | 21.28x | 6.10x | At the 5-yr floor (essentially tied with the min) |
| EV / LTM EBIT (CIQ basis) | 7.10x | 17.06x | 18.23x | 24.41x | 6.86x | **Below the 5-yr min** (−3% under the prior floor) |
| P / LTM Normalized EPS (CIQ basis) | 10.66x | 41.91x | 32.08x | 179.86x | 9.10x | **Below the 5-yr min** (−15% under the prior floor) |
| P / Book | 0.79x | 2.14x | 2.24x | 3.35x | 0.71x | **Below the 5-yr min** (−10% under the prior floor) |

**Caveat on the P/E band:** the mean (41.91x) is heavily skewed by 2021–2022 values as high as 179.86x — a period when SMPL's normalized earnings base was tiny and volatile shortly after the Atkins reverse-merger. The median (32.08x) is a more representative center for that metric; even so, both sit far above anything the current, structurally different earnings base plausibly warrants (Section 5).

Note on the most recent single data point in the source workbook (2026-07-23, not used in the band above): that column shows EV/EBITDA(CIQ) = 5.34x, implying a spot price then of roughly $9.46 — about 20% below the $11.33 anchor used in this report (Aug-04-2026). The stock has moved materially in the ~2 weeks between that snapshot and the run date (consistent with the post-Q3-earnings-beat rally noted in `earnings/04_guidance-consensus.md` §6); this report's "Current" column above is freshly computed at the pool-verified $11.33 anchor, not lifted from that stale workbook column.

## 3. Re-Rating / De-Rating Read

SMPL has **de-rated sharply and now trades at or below its own 5-year floor on every multiple tested** — not a modest discount to its own history, a genuine trough. On EV/LTM Sales the stock sits 67% below its own 5-year mean (2.92x) and 69% below its own median (3.12x); on EV/LTM EBITDA it is 59% below the mean (14.81x) and 61% below the median (15.85x); on P/Book it is 67% below the mean (2.14x) and 68% below the median (2.24x). On four of the five metrics tested, the current level is not merely near the bottom of the 5-year band — it is **below the 5-year minimum**, a level the stock has not traded at over this entire history.

This is a de-rating with a clear, cited cause, not an unexplained anomaly to arbitrage. Revenue has inflected from five straight years of GAAP growth (+16.2% FY22 to +9.0% FY25) into four consecutive quarters of year-over-year decline (−0.3% to −9.4%, LTM revenue down 4.5%) [`earnings/01_historical-financials.md` §6]. The company's own Adjusted EBITDA margin — its cleaned-up, non-impairment metric — has compressed roughly 330 basis points over the last twelve months (20.2% FY24 → 19.2% FY25 → 16.9% LTM) [`earnings/01_historical-financials.md` §2]. GAAP earnings turned deeply negative on a $391.9M combined goodwill/brand impairment (OWYN and Atkins) triggered, per the company's own 10-Q, by "a sustained decline in the Company's share price and declines in the Company's market capitalization" [`earnings/01_historical-financials.md` §6, citing FQ3 FY26 10-Q Note 4], and this coincided with a CEO departure inside the same window. Street estimate-revision breadth for FY2027 remains net-negative across revenue, EBITDA and EPS (−4 to −6 net revisions in the last three months) with every trailing estimate line still falling [`earnings/04_guidance-consensus.md` §4–§5]. The multiple compression is a rational market response to a business that has gone from a mid-single-to-high-single-digit grower with expanding scale to a shrinking-revenue, margin-compressing, impairment-taking business over roughly the last 12–18 months — not an unexplained dislocation.

## 4. Implied Value from Reversion

Reversion targets applied to the current LTM metric base. **Read this table as a sanity check on how far the stock has moved from its own history, not as a fair-value estimate** — see the caveat immediately below and in Section 5.

| Multiple | Reversion Target (mean / median) | Implied EV or Equity Value | Implied Price/Share | vs Current Price ($11.33) |
|---|---:|---:|---:|---:|
| EV / Sales | mean 2.92x | EV $4,065.2M → Equity $3,740.6M | $41.59 | +267% |
| EV / Sales | median 3.12x | EV $4,343.7M → Equity $4,019.1M | $44.69 | +294% |
| EV / EBITDA (median own-history multiple applied to company Adjusted EBITDA — a labeled cross-basis approximation, see note) | mean 14.81x | EV $3,474.4M → Equity $3,149.8M | $35.02 | +209% |
| EV / EBITDA (same basis) | median 15.85x | EV $3,718.4M → Equity $3,393.8M | **$37.74** | **+233%** |
| EV / EBIT (CIQ basis, metric matches band basis) | mean 17.06x | EV $3,299.9M → Equity $2,975.3M | $33.08 | +192% |
| EV / EBIT (CIQ basis) | median 18.23x | EV $3,526.2M → Equity $3,201.6M | $35.60 | +214% |
| P / E (CIQ-normalized EPS $1.224) | mean 41.91x | — | $51.31 | +353% |
| P / E (CIQ-normalized EPS $1.224) | median 32.08x | — | $39.28 | +247% |
| P / Book (BVPS $16.03) | mean 2.14x | — | $34.30 | +203% |
| P / Book (BVPS $16.03) | median 2.24x | — | $35.91 | +217% |

Cross-basis note on the EV/EBITDA row: the historical band's own multiple was built from Capital IQ's own EBITDA definition ($217.5M LTM), which differs modestly (7%) from the company's disclosed Adjusted EBITDA ($234.6M) used here as the metric. Applying the CIQ-basis historical multiple to the company's Adjusted EBITDA is a labeled approximation, chosen because Adjusted EBITDA is the metric management and the Street actually guide to and track (`earnings/04_guidance-consensus.md`); the two EBITDA bases are close enough (7% apart) that this substitution does not materially change the conclusion.

**Base-case point (named): EV/EBITDA at the own-history MEDIAN multiple (15.85x) applied to LTM company-Adjusted EBITDA ($234.6M) implies $37.74/share.** This is chosen as the base-case point because EV/EBITDA on the company's own Adjusted-EBITDA basis is the multiple management, the Street, and (per `earnings/04`) the guidance-vs-consensus framework are actually built around — more standard for this business than EV/Sales or the CIQ-normalized P/E, whose bands carry their own distortions (noted above and in Section 5). **The cross-method dispersion around that point is wide: $33.08–$51.31 across the eight reversion computations above (EV/EBIT low end to P/E-mean high end), roughly $35–$45 as the tighter core of that range excluding the two most extreme (P/E mean, EV/Sales median).** Every single reversion figure — even the lowest, EV/EBIT-mean at $33.08 — implies upside of roughly 190% or more from the $11.33 current price.

**Reversion assumption stated explicitly, and rejected as a base case:** this table assumes the warranted multiple has NOT structurally changed — i.e., that SMPL should trade at the same EV/EBITDA, EV/Sales, P/E and P/Book multiples it commanded during a period (2021–2025) when it was a consistent mid-to-high-single-digit revenue grower with a stable-to-expanding Adjusted EBITDA margin. The evidence in Section 3 argues directly against that assumption: revenue has inflected to four straight quarters of decline, the Adjusted EBITDA margin has compressed ~330bps in the LTM, GAAP earnings carry a $391.9M impairment, the CEO has departed, and Street FY2027 estimates are still being cut net-negative every month. The management-governance module's own §24 Filter-2 screen (turnarounds) caps management-quality scoring specifically because there is not yet two-to-three years of proven operating improvement to support a turnaround thesis [`management-governance/99_management-governance-synthesis.md`, Filter 2]. A reversion to the 2021–2025-era multiple set is therefore **not underwritten as achievable** by this agent's own read of the earnings-module evidence; the table above is shown as the mechanical own-history sanity check the module rules require, not as a defensible fair-value input on its own.

## 5. Own-History Read

SMPL trades at or below its own 5-year floor on every multiple tested — EV/Sales, EV/EBITDA, EV/EBIT, P/E, and P/Book — a genuinely extreme own-history discount (roughly 58–78% below its own 5-year mean depending on the metric), not a modest dip. Mechanically reverting to the own-history median multiple on Adjusted EBITDA implies roughly $37.74/share, more than triple the current $11.33 price, and every other reversion computation in Section 4 points the same direction and magnitude. **The single biggest caveat, and it is decisive: the old mean was earned by a business that grew revenue every year for five years and held or expanded its margin; the current business has four straight quarters of revenue decline, ~330bps of margin compression on its own cleaned-up metric, a nine-figure non-cash impairment, and a recent CEO departure — reverting to the old mean assumes that business is still intact, and the cited evidence says it is not (yet) proven to be.** No unaligned-controlling-owner flag applies here (management-governance module confirms RF-OWN-004 / §24 Filter 6 is Not Applicable — SMPL is widely held, largest holder BlackRock at ~14.8% passive), so this is not an ownership-driven value trap; it is a fundamentals-driven one, and the correct read is that the stock's own multiple history is a *ceiling reference point for what re-rating could look like if the turnaround is proven*, not a base-case fair-value anchor to underwrite today.



---

## valuation / 03_relative-valuation-peers.md

_Source: `03_relative-valuation-peers.md`_

# Relative Valuation — Peers — SMPL

Anchor (from `01_price-and-capital-structure.md`, used verbatim): price $11.33 (close, Aug-04-2026, pool-verified); shares for market cap 88,460,545; fully diluted shares for per-share fair value 89,934,884; market cap $1,002.26M; net debt $324.58M (strict: total debt $448.46M − cash $123.88M); EV $1,326.84M. Business type: Operating (branded, asset-light packaged food) per the Business-Type Method Map — EV/EBITDA, EV/EBIT, EV/Sales, P/E and FCF yield are all valid multiples for this company.

## 1. Peer Set

The peer set comes from a dedicated Capital IQ comparable-company export in the data pool (`Company Comparable Analysis The Simply Good Foods Company.xls`, "Capital IQ Default Comps" template, as-of 2026-07-24) — a systematic vendor screen, not this agent's own selection, and not identical to the three competitors named qualitatively in `business-model/08_competitive-map.md` (BellRing, Glanbia, Kellanova). Only BellRing appears in both sets; Glanbia (Euronext Dublin/LSE: GL9, Optimum Nutrition sits inside a larger diversified segment) and Kellanova (NYSE: K, RXBAR is an undisclosed sub-brand of a ~9x-larger diversified cereal/snacks company) are **not** in this CIQ comp screen and have **no usable public multiples in this dataset** — Optimum Nutrition and RXBAR are not separately listed, so no standalone multiple exists for either; they are flagged, not guessed at.

| Peer | Ticker | Why Comparable | Source of Inclusion |
|---|---|---|---|
| Utz Brands | NYSE:UTZ | Branded US salty snacks (chips, pretzels) sold through the same mass/club/grocery/DSD channels; same GICS Packaged Foods & Meats classification | Capital IQ Default Comps screen, as-of 2026-07-24 |
| J&J Snack Foods | NasdaqGS:JJSF | Branded/private-label snack and nutritional food manufacturer selling into retail and foodservice; asset-light-adjacent branded-food comp | Capital IQ Default Comps screen, as-of 2026-07-24 |
| The Hain Celestial Group | NasdaqGS:HAIN | Branded "better-for-you"/organic/natural food and snack company — closest positioning match to SMPL's health-and-wellness angle outside BellRing | Capital IQ Default Comps screen, as-of 2026-07-24 |
| The Campbell's Company | NasdaqGS:CPB | Large diversified branded packaged-food company with a snacks segment (Goldfish, Snyder's, Kettle); useful as a mega-cap scale/quality benchmark, not a category-narrow peer | Capital IQ Default Comps screen, as-of 2026-07-24 |
| The Marzetti Company (fka Lancaster Colony) | NasdaqGS:MZTI | Branded specialty food company (dressings, dips, frozen bakery) sold to retail/foodservice; comparable asset-light branded-CPG structure | Capital IQ Default Comps screen, as-of 2026-07-24 |
| BellRing Brands | NYSE:BRBR | **Direct category competitor** — Premier Protein (RTD shakes) and Dymatize (powders/bars) compete head-on with Quest's RTD-shake/bar lines and Atkins'/OWYN's RTD shakes [business-model/08_competitive-map.md, Competitor A] | Capital IQ Default Comps screen AND named in `business-model/08_competitive-map.md` |
| Conagra Brands | NYSE:CAG | Large diversified branded frozen/shelf-stable food and snacks company (Birds Eye, Slim Jim, Angie's BOOMCHICKAPOP); scale/quality benchmark, broader category than SMPL | Capital IQ Default Comps screen, as-of 2026-07-24 |
| Freshpet | NasdaqGM:FRPT | High-growth, branded, single-category specialty food company; closer in market-cap range and growth-multiple profile than the mega-caps in this set | Capital IQ Default Comps screen, as-of 2026-07-24 |
| The Kraft Heinz Company | NasdaqGS:KHC | Mega-cap branded packaged-food company; included as a scale/quality benchmark, not a narrow category peer | Capital IQ Default Comps screen, as-of 2026-07-24 |
| John B. Sanfilippo & Son | NasdaqGS:JBSS | Branded/private-label nut and snack-bar processor; small-to-mid-cap branded-food comp closer to SMPL's own market-cap range | Capital IQ Default Comps screen, as-of 2026-07-24 |

**Composition caveat:** only BellRing is a true head-to-head active-nutrition/protein competitor. The other nine span from small/mid-cap branded-snack names (JJSF, MZTI, JBSS, FRPT, UTZ) to mega-cap diversified branded-food conglomerates (CPB, CAG, KHC) whose scale, category mix, and growth profile differ materially from SMPL's narrower protein/low-carb/weight-management portfolio. This is a GICS-sector-matched vendor screen, not a hand-picked category-pure set — the premium/discount reads in Section 3 should be read with that heterogeneity in mind, and the peer **median** (not mean, which two extreme EV/EBIT outliers distort) is used throughout for this reason.

## 2. Peer Multiples & Operating Stats

All figures as-of 2026-07-24 [Company Comparable Analysis The Simply Good Foods Company.xls, Trading Multiples, Financial Data, and Operating Statistics tabs], except SMPL's own multiples, which this agent recomputed on the canonical anchor from `01` (EV $1,326.84M, as of Aug-04-2026) rather than the comp workbook's own stale SMPL row (which embeds a $10.28 price / $1,234M EV, ~13 days older and pre-dating a subsequent price move) — per the Reconciliation Gate ("every agent uses the price... and EV from `01` verbatim"). Peer figures are untouched (their own price dates are each peer's own last reported close as of 2026-07-24, not the SMPL-specific date). SMPL's LTM Revenue ($1,392.2M) ties exactly to `earnings/01_historical-financials.md`'s independently-built LTM figure — cross-checked, no gap.

| Company | P/E (LTM) | EV/EBITDA (LTM) | EV/EBIT (LTM) | EV/Sales (LTM) | FCF Yield | Rev Growth (LTM YoY) | EBITDA Margin (LTM) | Total Debt/EBITDA (LTM) | Data As-of |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| **SMPL** | NM (EPS −$2.08) | **6.10x** (CIQ-basis EBITDA $217.5M); **5.66x** on company-defined Adj. EBITDA $234.6M | 6.86x | 0.95x | 11.9% (mkt cap basis; $119.4M LTM FCF ÷ $1,002.26M mkt cap [`earnings/01_historical-financials.md` §2]) / 9.0% (EV basis) | −4.5% | 15.6% (CIQ) / 16.9% (co. Adj. EBITDA margin, `earnings/01` §2) | 1.9x (CIQ Total Debt); 1.38x on co.-defined Net debt/Adj. EBITDA [`01`, §5] | 2026-08-04 (price) / 2026-05-30 (financials) |
| Utz Brands (UTZ) | NM | 29.0x | 240.8x | 2.0x | Not disclosed in comps export | +2.4% | 6.8% | 10.6x | 2026-07-24 |
| J&J Snack Foods (JJSF) | 25.3x | 7.7x | 16.3x | 1.0x | Not disclosed in comps export | −2.0% | 11.0% | 0.9x | 2026-07-24 |
| Hain Celestial (HAIN) | NM | 6.1x | 18.2x | 0.4x | Not disclosed in comps export | −10.0% | 5.8% | 6.1x | 2026-07-24 |
| Campbell's (CPB) | 10.5x | 6.1x | 10.3x | 1.3x | Not disclosed in comps export | −2.9% | 17.2% | 3.4x | 2026-07-24 |
| Marzetti (MZTI) | 16.7x | 8.6x | 11.9x | 1.4x | Not disclosed in comps export | +2.9% | 15.4% | 0.1x | 2026-07-24 |
| BellRing Brands (BRBR) | 10.1x | 8.5x | 9.2x | 1.2x | Not disclosed in comps export | +6.4% | 13.4% | 3.9x | 2026-07-24 |
| Conagra Brands (CAG) | NM | 7.3x | 9.5x | 1.3x | Not disclosed in comps export | −2.9% | 15.4% | 4.2x | 2026-07-24 |
| Freshpet (FRPT) | 15.5x | 15.0x | 31.2x | 2.5x | Not disclosed in comps export | +12.0% | 16.3% | 2.6x | 2026-07-24 |
| Kraft Heinz (KHC) | NM | 7.5x | 9.9x | 1.9x | Not disclosed in comps export | −1.8% | 23.1% | 3.4x | 2026-07-24 |
| John B. Sanfilippo (JBSS) | 14.1x | 8.0x | 11.2x | 0.9x | Not disclosed in comps export | +5.1% | 10.4% | 0.8x | 2026-07-24 |
| **Peer median (10 names)** | **14.8x** | **7.8x** | **11.5x** | **1.3x** | n/a | **+0.3%** | **14.4%** | **3.4x** | 2026-07-24 |

Forward (NTM) basis — same source, NTM EBITDA/Revenue/EPS are Capital IQ consensus estimates for each name:

| Company | NTM TEV/Fwd Revenue | NTM TEV/Fwd EBITDA | NTM Fwd P/E |
|---|---:|---:|---:|
| **SMPL** (recomputed on canonical EV/price) | **1.03x** (EV $1,326.84M ÷ NTM Rev $1,293.4M) | **6.07x** (EV $1,326.84M ÷ NTM EBITDA $218.42M) | **6.74x** (price $11.33 ÷ NTM EPS $1.68) |
| UTZ | 1.89x | 12.11x | 17.6x |
| JJSF | 1.01x | 8.67x | 18.78x |
| HAIN | 0.52x | 6.79x | 9.84x |
| CPB | 1.37x | 8.78x | 11.2x |
| MZTI | 1.37x | 8.41x | 15.01x |
| BRBR | 1.13x | 8.39x | 9.94x |
| CAG | 1.30x | 9.13x | 9.93x |
| FRPT | 2.35x | 12.89x | 40.75x |
| KHC | 1.93x | 9.47x | 12.55x |
| JBSS | 0.88x | 7.56x | 13.61x |
| **Peer median** | **1.34x** | **8.72x** | **13.08x** |

**FCF yield:** not disclosed anywhere in this peer comps export (no CFO/capex line items for the 10 peers) — this agent does not fabricate it. SMPL's own FCF yield ($119.4M LTM FCF ÷ $1,002.26M market cap = 11.9%; ÷ EV = 9.0%) is shown for context only and is **not** compared against a peer median in Section 3 for this reason.

**ROIC:** not computed for 8 of 10 peers in the pool. `business-model/09_moat.md` computed SMPL's own through-cycle ROIC at ~7.0% (CIQ vendor) / ~8.8% (agent-computed, FY2022–FY2025 average), against a ~5.8%–7.8% estimated WACC range — a marginal, not clearly moat-supporting, result. The same report cites a web-sourced, unverified BellRing ROIC of ~33.8% (latest) / ~46.6% (5-yr average) [`business-model/09_moat.md` §3, sourced to roic.ai/MacroTrends, accessed 2026-08 — vendor-calculated estimate, unverified, not a filed figure] — far above SMPL's own. No ROIC figure for the other 8 peers exists in this pool; this table does not guess at them.

**Data-quality flag (carried from `01`):** CIQ's own "EBITDA" line for SMPL ($217.5M LTM) sits between the company's own GAAP EBITDA (−$213.1M, impairment-distorted) and its own disclosed Adjusted EBITDA ($234.6M) [`01_price-and-capital-structure.md` §5]. The CIQ-basis multiples above are used for the peer premium/discount read in Section 3 because CIQ applies the same "unusual items" reclassification to every peer, making it the internally consistent basis for cross-company comparison — but it is neither SMPL's GAAP number nor its own company-defined Adjusted EBITDA, and both alternates are shown alongside for transparency, per CLAUDE.md §15.

## 3. Premium / Discount to Peer Median

Formula: `(company multiple − peer median) / peer median`. Positive = premium (company multiple higher, priced richer); negative = discount (company multiple lower, priced cheaper on that multiple). FCF yield is a yield metric (not shown here, since no peer FCF yield data exists to compare against) — if it existed, a higher SMPL yield than peer median would read as a discount, not a premium; this inversion did not need to be applied because no peer FCF yield exists to invert against.

| Multiple | Company | Peer Median | Premium / (Discount) |
|---|---:|---:|---:|
| EV/Sales (LTM) | 0.95x | 1.30x | **(26.7%)** |
| EV/EBITDA (LTM, CIQ-basis) | 6.10x | 7.80x | **(21.8%)** |
| EV/EBIT (LTM, CIQ-basis) | 6.86x | 11.50x | **(40.3%)** |
| P/E (LTM) | NM | 14.80x | Not computable — SMPL LTM EPS is negative (impairment-driven) |
| EV/Sales (NTM) | 1.03x | 1.34x | **(23.4%)** |
| EV/EBITDA (NTM) | 6.07x | 8.72x | **(30.3%)** |
| P/E (NTM) | 6.74x | 13.08x | **(48.4%)** |

SMPL trades at a discount to the peer median on every computable multiple, ranging from roughly 22% (LTM EV/EBITDA) to roughly 48% (NTM P/E). The EV/EBIT read (−40.3%) is the least reliable of the set — peer EV/EBIT dispersion is extreme (9.2x to 240.8x, driven by UTZ's near-zero EBIT base), so the peer median itself carries wide error even though it is more robust than the mean (36.8x). The NTM P/E discount (−48.4%) is the largest, but P/E discounts on a name whose earnings are currently thin and volatile (GAAP LTM EPS −$2.08, NTM consensus EPS only $1.68) mechanically amplify any given dollar gap in the multiple — this discount should not be read as twice as meaningful as the EV/EBITDA discount just because the percentage is larger.

**Is the gap typical or unusual? Not assessable.** The data pool contains only a single dated snapshot of peer multiples (2026-07-24) — no historical time series of peer multiples exists anywhere in the pool, and this agent does not fabricate a multi-year peer-relative history. `02_multiples-own-history.md` (SMPL's own multiple history against itself, not against peers) is a separate agent's output and does not substitute for this. This is the **relative gap to peers over time**, distinct from SMPL's own absolute multiple history, and it cannot be assessed from available data.

## 4. Is the Gap Warranted?

The evidence is mixed but net supports most of the discount, not all of it. Against the discount: `business-model/07_business-quality.md` scores SMPL 40/100 (Weak band) with the three lowest sub-scores — margin stability (30), competitive intensity (30), commodity dependence (30) — all directly tied to an ~800bps five-year gross-margin decline (40.7% FY21 → 33.3% TTM); `business-model/09_moat.md` concludes "No moat proven," with brand (the strongest candidate) capped at 30/100 because the company's own disclosed price elasticity assumption (≥1 for the September-2026 price increase) signals a price-taker, not a price-setter; and SMPL's LTM revenue fell −4.5% against a peer median of +0.3% — the second-worst growth rate in the ten-name set (only HAIN's −10.0% is worse), while `earnings/04_guidance-consensus.md` shows FY2027 consensus revenue, EBITDA, and EPS estimates still being cut across every trailing window (30/60/90-day trend all falling; net revision breadth −4 to −6 over the last three months) — the market has not finished re-rating this business down. Against the full observed discount, however: SMPL's LTM EBITDA margin (15.6%) sits above the peer median (14.4%), and its leverage (1.9x CIQ Total Debt/EBITDA, or 1.38x on the company's own Net debt/Adjusted EBITDA basis) is meaningfully below the peer median of 3.4x — SMPL is not the over-levered name in this set. **Conclusion: the discount is largely warranted, but not fully** — the weak-quality, no-moat, negative-growth evidence justifies trading below the peer median, but the depth of some of the observed gaps (30-48% on NTM EBITDA and NTM P/E) outruns what the margin and leverage evidence alone would support, given SMPL's still-competitive current profitability and below-median leverage.

## 5. Implied Value from Peer Multiples

**Quality adjustment applied:** an 18% discount to each peer median multiple (multiplier 0.82×), reflecting the net-negative but not extreme quality/growth/moat gap in Section 4 (weak quality score, no moat, worst-in-class-but-one growth) partially offset by SMPL's below-peer-median leverage and at-or-above-peer-median current EBITDA margin. This is smaller than the market's currently observed discount on the forward multiples (30–48%), reflecting the view that part of that gap is earnings-quality noise (a thin, volatile EPS/EBITDA base mechanically widening percentage-based multiple gaps) rather than a fundamentals-only quality discount. This adjustment is a judgment call tied to the cited evidence, not a mechanical output — `07_scenario-and-fair-value` may weight it differently.

Applied on the **same basis** as each peer multiple (NTM peer multiple × NTM company metric; LTM peer multiple × LTM company metric):

| Multiple | Applied Peer Multiple (peer median × 0.82) | Implied EV | Implied Equity Value | Implied Price/Share | vs Current Price ($11.33) |
|---|---:|---:|---:|---:|---:|
| **NTM EV/EBITDA (base case)** | **7.15x** (8.72 × 0.82) | $1,561.8M | $1,237.2M | **$13.76** | **+21.4%** |
| LTM EV/EBITDA (CIQ-basis) | 6.40x (7.80 × 0.82) | $1,391.1M | $1,066.6M | $11.86 | +4.7% |
| LTM EV/Sales | 1.07x (1.30 × 0.82) | $1,484.1M | $1,159.5M | $12.89 | +13.8% |
| NTM EV/Sales | 1.10x (1.34 × 0.82) | $1,421.2M | $1,096.6M | $12.19 | +7.6% |
| LTM EV/EBIT (low-confidence — see caveat) | 9.43x (11.50 × 0.82) | $1,823.8M | $1,499.2M | $16.67 | +47.1% |
| NTM P/E (low-confidence — see caveat) | 10.73x (13.08 × 0.82) | n/a (direct per-share) | n/a | $18.02 | +59.1% |

Equity bridge: Implied EV − net debt ($324.58M, `01`'s canonical strict basis) = Implied equity value; ÷ 89,934,884 fully diluted shares = implied price/share (for EV-based multiples). For the NTM P/E line, the multiple applies directly to NTM EPS ($1.68) — no bridge needed.

**Base-case point: $13.76/share**, from the primary multiple (NTM EV/EBITDA, quality-adjusted 7.15x applied to NTM EBITDA $218.42M) — +21.4% versus the current $11.33 price. This multiple is chosen as primary because SMPL's GAAP P/E is NM (negative LTM EPS) and EV/EBITDA is the standard primary multiple for an operating branded-food company under the Business-Type Method Map.

**Dispersion:** across the EV/Sales and EV/EBITDA methods (the more reliable subset — LTM and NTM, on Revenue and EBITDA bases), the implied price ranges **$11.86–$13.76** (roughly +5% to +21% versus current price). The LTM EV/EBIT ($16.67) and NTM P/E ($18.02) methods produce materially higher implied values, but both are flagged low-confidence: EV/EBIT because peer dispersion is extreme (9.2x–240.8x driven by a near-zero EBIT outlier), and P/E because it is being applied to a currently thin, still-being-cut consensus EPS base ($1.68 NTM, down from $1.74 ninety days ago per `earnings/04_guidance-consensus.md` §4) — a small change in that denominator moves the implied price a lot. These two are shown for completeness but are excluded from the base-case dispersion range.

## 6. Relative Read

SMPL trades at a 22%–48% discount to the peer median across every computable multiple (widest on NTM P/E, narrowest on LTM EV/EBITDA), and the evidence — a 40/100 weak business-quality score, no proven moat, an ~800bps five-year gross-margin decline, and LTM revenue growth of −4.5% against a peer median of +0.3% — supports most, but not all, of that gap; SMPL's below-peer-median leverage (1.9x vs. peer median 3.4x Total Debt/EBITDA) and at-or-above-peer-median current EBITDA margin (15.6% vs. 14.4%) argue the discount has room to be somewhat narrower than the market currently prices. Applying a quality-adjusted (18% haircut) peer-median NTM EV/EBITDA multiple of 7.15x to SMPL's NTM EBITDA of $218.42M implies a base-case value of **$13.76/share (+21.4% vs. the $11.33 current price)**, with a dispersion of **$11.86–$13.76** across the more reliable EV/Sales and EV/EBITDA methods (EV/EBIT and P/E-based reads of $16.67–$18.02 are shown but flagged low-confidence given extreme peer dispersion and a thin, still-falling consensus EPS base, respectively). The relative-gap-over-time context (typical vs. wider vs. narrower than SMPL's historical relationship to these peers) is **Not assessable** — the pool contains only a single 2026-07-24 peer-multiple snapshot, with no historical peer-comp series to compare it against.



---

## valuation / 04_intrinsic-dcf.md

_Source: `04_intrinsic-dcf.md`_

# Intrinsic DCF — SMPL

Business-type gate: `00_valuation-data-triage.md` and `business-model/02_business-identity.md` both classify SMPL as an **Operating** business (branded, asset-light consumer-packaged-food company). Per the Business-Type Method Map, the FCFF DCF below is the correct primary intrinsic method — no bank/insurer, REIT, or holding-company override applies. Reporting standard: **US GAAP**. Currency: **USD, millions** (per-share in whole dollars). Fiscal year ends the last Saturday in August (FY2025 ended Aug-30-2025). Jurisdiction: US domestic SEC filer — no local-equivalent substitution issue. [`valuation/00_valuation-data-triage.md` §1A]

**Cyclicality Gate note:** `earnings/03_margin-drivers.md` and `business-model/10_external-dependency.md` both use cycle-position language for SMPL (unhedged commodity input costs, a margin trough) even though SMPL is not formally classified "Commodity/cyclical" under the Method Map. This report applies the same discipline anyway: the terminal margin below is benchmarked against SMPL's own recent trough (TTM Adjusted EBITDA margin 16.9%) and its own FY2024 level (20.2%), not against management's own aspirational "~20%" target or the FY2021 historical peak — see §2 and §5.

## 1. FCF Base & Normalizations

Base year: **FY2025** (52 weeks ended Aug-30-2025), with the trailing-twelve-months (TTM, 39 weeks to May-30-2026) shown for context. [`earnings/01_historical-financials.md` §1–§2]

| Item | Base-Year Value (FY2025) | Normalization Applied | Source |
|---|---:|---|---|
| Revenue | $1,450.9M | None | FY2025 10-K, Income Statement |
| GAAP EBIT (Income from Operations) | $156.9M (10.8% margin) | — reported basis | FY2025 10-K, Item 7, p.41 |
| **+ Atkins brand intangible impairment (non-cash, one-off)** | +$60.9M | Added back — a discrete non-cash write-down, not a recurring operating cost | FY2025 10-K, Note 9; `earnings/01_historical-financials.md` §7 [8] |
| **= Normalized EBIT (this report's base)** | **$217.8M (15.0% margin)** | GAAP EBIT + impairment add-back only — SBC, integration expense, and restructuring are **kept in**, not stripped, because `earnings/06_earnings-quality.md` §4/§9 flags the company's own "Adjusted EBITDA" for excluding these as if one-off when they have recurred every period for 2+ years | Agent calculation |
| GAAP CFO | $178.5M | None | FY2025 10-K, Cash Flow Statement |
| Capex | $20.5M | None (no maintenance/growth split disclosed) | FY2025 10-K |
| **Reported FCF (CFO − Capex)** | **$157.9M** | Standard definition, no company-specific FCF metric exists | `earnings/01_historical-financials.md` §1 |
| TTM (39wk to May-30-26) GAAP EBIT | $(243.3)M | Distorted by $391.9M of impairment across FQ4 FY25–FQ3 FY26 | `earnings/01_historical-financials.md` §2 |
| **+ TTM impairment add-back** | +$391.9M | Same logic as above | `earnings/01_historical-financials.md` §6 |
| **= TTM Normalized EBIT** | **$148.6M (10.7% margin)** | Confirms the current run-rate sits at a genuine multi-year **trough**, not the FY2025 level — consistent with `business-model/07_business-quality.md` §4 ("a multi-year trough, not a cyclical peak") | Agent calculation |
| Company "Adjusted EBITDA" (non-GAAP) FY2025 | $278.2M (19.2% margin) | **Not used as this report's normalized base** — it strips SBC and integration expense as if non-recurring; used only as the top-line margin anchor for the forecast (§2), with SBC/integration separately re-inserted | `earnings/01_historical-financials.md` §4; `earnings/06_earnings-quality.md` §4 |

**FCFF identity used (Economic Consistency Gate 1):** `FCFF = NOPAT + D&A − Capex − ΔNWC`, with one further, explicitly labeled adjustment: **− SBC** (stock-based compensation), treated as a recurring economic cost to equity holders (dilution) even though it is a non-cash add-back inside CFO. This directly answers the earnings-quality module's flag that the company's own "Adjusted EBITDA" — which this report uses as the top-line margin driver in the forecast — excludes SBC every single period [`earnings/06_earnings-quality.md` §4, §8]. No other definition is mixed in.

**Confidence:** a full cash-flow statement exists (no proxy needed) and forward guidance/consensus exist through FY2027 (no self-built near-term forecast needed) — the Partial-Data Rule caps do **not** apply. Confidence is nonetheless capped at **Medium**, not High, because of (a) the earnings-quality module's RF-EQ-001 flag (rising accruals divergent from cash earnings) and (b) the terminal-value share of EV (§5/§6).

## 2. Forecast Assumptions

6-year explicit forecast, FY2026–FY2031 (fiscal year ends last Saturday in August). FY2026 is company guidance; FY2027 is Street consensus (still being cut — see `earnings/04_guidance-consensus.md` §4–§5); FY2028–FY2031 are analyst assumptions, not company-guided, built to fade toward the terminal state.

| Assumption | FY26 | FY27 | FY28 | FY29 | FY30 | FY31 | Terminal | Source / Basis |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Revenue growth % | −6.9% | −4.5% | +1.0% | +2.0% | +2.5% | +3.0% | +1.0% | FY26: company guidance midpoint ($1,350.0M net sales, "down 7% to 6%") [`earnings/04_guidance-consensus.md` §2]. FY27: Street consensus $1,284.62M, **falling** — 3-month revision breadth −6 [`earnings/04_guidance-consensus.md` §4–§5], labeled *consensus, not company-guided, still being cut*. FY28–31: **analyst assumption, not company-guided** — models a return to modest growth as the Sept-2026 price increase annualizes and Atkins laps its worst comps; explicitly does **not** assume a snap-back to FY21–24-style high-single-digit growth |
| Adjusted EBITDA margin % (company non-GAAP) | 16.5% | 17.2% | 17.0% | 17.0% | 17.0% | 17.0% | 17.0% | FY26: guidance midpoint ($222.5M / $1,350M) [`earnings/04_guidance-consensus.md` §2]. FY27: consensus ($220.91M / $1,284.62M) [`earnings/04_guidance-consensus.md` §4]. FY28–terminal: **analyst assumption** — held at 17.0%, between the TTM trough (16.9%) and FY2024 (20.2%); explicitly **not** management's own "~20%" aspirational target and **not** the FY2021 peak (Cyclicality Gate) |
| less: fading integration/restructuring add-back (re-inserted as a real cost) | 1.5% | 1.0% | 0.5% | 0.0% | 0.0% | 0.0% | 0.0% | **Analyst assumption** — OWYN-deal integration expense has recurred every period since FY2024 ($20.9M FY25, $5.2M in a single FQ3 FY26 quarter alone) [`earnings/06_earnings-quality.md` §4]; modeled to wind down over 3 years (deal is 2+ years old by FY2028), not treated as permanent |
| D&A (% of revenue) | 1.3% | 1.4% | 1.5% | 1.5% | 1.5% | 1.5% | 1.5% | **Analyst assumption** — capex has quadrupled (FY2025 $20.5M vs FY2021–24 average ~$7M) and D&A "has not yet hit the P&L" from that step-up [`earnings/03_margin-drivers.md` §9]; modeled to rise from FY2025's 1.2% toward 1.5% as the new capex is placed in service |
| Normalized EBIT margin % (= above minus D&A) | 13.7% | 14.8% | 15.0% | 15.5% | 15.5% | 15.5% | 15.5% | Agent calculation from the rows above |
| Tax rate % | 25% | 25% | 25% | 25% | 25% | 25% | 25% | **Normalized, reconciled to `business-model/09_moat.md` §3's canonical rate.** Moat's economic-moat test WAS assessable and published 25% as the average of FY22 (27.9%), FY23 (24.0%), FY24 (25.1%), FY25 (23.8%), excluding the FY21 outlier and the impairment-distorted TTM. Matches company's own FY26 guidance ("roughly 25%") [`earnings/04_guidance-consensus.md` §2]. This DCF uses the **same** rate — no divergence |
| Capex (% of revenue) | 2.0% | 2.0% | 1.8% | 1.6% | 1.5% | 1.5% | 1.5% | FY26: guidance $25M–$30M midpoint $27.5M (transcript figure; the Guidance-tab vendor figure of $20M–$25M is flagged as conflicting in `earnings/04_guidance-consensus.md` §2, transcript preferred per source hierarchy) ≈ 2.0% of $1,350M. FY27–terminal: **analyst assumption**, fading toward 1.5% as the OWYN-facility investment cycle completes — still well above the pre-FY2025 historical average of 0.4–0.9% of revenue, i.e. NOT assumed to revert fully |
| Δ Working capital (% of revenue, revenue-linked) | 22.7% ratio, held | 22.7% | 22.7% | 22.7% | 22.7% | 22.7% | 22.7% | Net working capital held at **22.7% of revenue** = FY2025 actual ($329.1M / $1,450.9M) [`earnings/01_historical-financials.md` §1], applied to forecast revenue each year (revenue-linked driver, not a flat absolute). Cross-referenced to `earnings/06_earnings-quality.md` §3: DSO 39.7 / DIO 61.1 / DPO 27.0 days, cash-conversion cycle **lengthening** (+3.6 days over two years, entirely an inventory build) — holding the ratio flat is therefore a **conservative, not favorable**, simplification: if the CCC keeps lengthening, actual WC drag could be worse than modeled here |
| SBC (% of revenue, deducted at the FCF line, not embedded in EBIT margin) | 1.2% | 1.2% | 1.2% | 1.2% | 1.2% | 1.2% | 1.2% | **Analyst assumption**, close to the FY2025 actual (1.05%) and FY2024 actual (1.38%) [`earnings/06_earnings-quality.md` §4]; held flat as a recurring dilution cost |

**Working-capital sign check:** in FY2026–FY2027, revenue is **falling** while the NWC ratio is held flat — this **releases** cash (−$22.6M and −$13.8M respectively, i.e. NWC itself shrinks in dollar terms), which correctly **adds** to FCF in those two years. From FY2028 onward, revenue resumes growing, so the same held ratio now **absorbs** cash (+$2.9M to +$9.3M), correctly **subtracting** from FCF. This is the modeled `ΔNWC = NWC_t − NWC_{t-1}` read directly off the forecast NWC path, not inferred from the growth direction alone — sign confirmed correct in both directions.

## 3. Discount Rate (WACC)

No company-disclosed WACC or hurdle rate exists anywhere in the pool [`business-model/09_moat.md` §3]. Built via CAPM — **Inference, not from filings** — using the same risk-free rate, ERP, and cost-of-debt inputs the moat module already sourced, so this figure and the moat module's own cost-of-capital cross-check do not diverge (Gate 4).

| Component | Value | Source |
|---|---:|---|
| Risk-free rate | 4.6% | 10-year US Treasury yield, 2026-08-05 [Web: tradingeconomics.com, accessed 2026-08-06 — dated, unverified; same figure `business-model/09_moat.md` §3 already used] |
| Equity risk premium | 5.5% | Standard mature-market assumption, not company-specific [`business-model/09_moat.md` §3] |
| Beta (peer-median, used) | 0.36 | Nine named peer betas (0.32–0.83, excluding two near-zero/negative large-cap outliers) [Company Comparable Analysis workbook, Operating Statistics tab, as-of 2026-07-24]. SMPL's own 5-year CIQ beta is **0.13** — flagged as an outlier likely depressed by the stock's own idiosyncratic 2026 collapse (52-week range $10.12–$33.44), not a genuine low-risk signal; per the conservative default, the peer-median beta is used, not SMPL's own |
| Size premium | +3.0% | Duff & Phelps/Kroll-style small-cap size premium for a ~$1.0bn market-cap company — not company-disclosed. **Included in the primary cost-of-equity build below** (not layered on afterward as a discretionary override), because SMPL's own beta and even the peer-median beta plainly understate the company's risk given its 68/100 earnings-volatility score [`earnings/07_earnings-sensitivity.md` §7], "No moat proven" verdict, and RF-EQ-001 accrual flag [`business-model/09_moat.md` §5; `earnings/06_earnings-quality.md` §6] |
| **Cost of equity (kₑ = rf + β×ERP + size premium)** | **9.58%** | 4.6% + (0.36×5.5%) + 3.0% = 4.6% + 1.98% + 3.0% = 9.58% |
| *(Cross-check, no size premium: kₑ = rf + β×ERP)* | *6.58%* | *4.6% + 1.98% — shown as a lower-bound sensitivity, not used as the primary figure* |
| Pre-tax cost of debt | 5.65% | SOFR 3.65% (2026-08-03) [Web: sofrrate.com, accessed 2026-08-06] + 2.00% Term Loan margin [FY2025 10-K, Note 7, "2025 Repricing Amendment"] |
| Tax rate (for the debt tax shield) | 25% | Same normalized rate as §2/NOPAT — no mixing of rates |
| After-tax cost of debt | 4.24% | 5.65% × (1 − 0.25) |
| Equity / debt weights (market value) | 69.1% / 30.9% | Market cap $1,002.26M [`valuation/01_price-and-capital-structure.md` §3] / Total debt $448.46M (funded debt $397.04M + operating lease liabilities $51.43M) [`valuation/01_price-and-capital-structure.md` §4]. $1,002.26M / $1,450.72M = 69.1%; $448.46M / $1,450.72M = 30.9% |
| **WACC (used)** | **7.93%** | 0.691 × 9.58% + 0.309 × 4.24% = 6.62% + 1.31% = 7.93% |

**Formula (pinned, executed — not eyeballed):**
```
WACC = w_e·k_e + w_d·k_d·(1-t)
k_e  = rf + beta*ERP + size_premium
    = 0.046 + 0.36*0.055 + 0.03 = 0.0958  (9.58%)
k_d_after = 0.0565*(1-0.25) = 0.0424     (4.24%)
w_e = 1002.26/(1002.26+448.46) = 0.6909
w_d = 448.46/(1002.26+448.46)  = 0.3091
WACC = 0.6909*0.0958 + 0.3091*0.0424 = 0.0793   (7.93%)
```
Output: `WACC used=0.0793 (7.93%); WACC base CAPM (no size prem)=0.0586 (5.86%); ke=0.0958; kd_after=0.0424; we=0.6909; wd=0.3091`

**Sanity bound (Gate 4):** `after-tax kd (4.24%) ≤ WACC (7.93%) < ke (9.58%)` — **holds, with comfortable room on both sides** (not a tight, assembly-error-prone band). SMPL is a ~$1.0bn small-cap, not a developed-market mega-cap, so the "kₑ above rf + 1.4×ERP needs justification" mega-cap clause does not apply — if anything a small-cap with a 68/100 earnings-volatility score and a "No moat proven" verdict warrants a higher, not lower, discount rate than a plain market-beta CAPM would produce.

**Cross-check against the moat module (Gate 4):** `business-model/09_moat.md` §3 independently built a "base WACC" (peer-median beta, no size premium) of **5.8%** and a "size-adjusted WACC" of **~7.8%**, explicitly calling the size-adjusted figure "more realistic" for a company of this market cap. This report's 7.93% sits **0.13pp from moat's own 7.8% size-adjusted figure** — no material divergence, Gate 4 cross-check satisfied without needing a spanning grid. The pure-CAPM 5.86% figure is shown only as a lower-bound sensitivity anchor (used in the low-WACC column of §7), not as a separately-computed WACC that this report then "overrides" — there is no override to bound at ±1.5pp because the size premium is built into the primary CAPM specification from the start, consistent with moat's own preferred figure.

## 4. Free Cash Flow Forecast & Discounting

USD millions. Mid-year discounting convention used throughout (cash flows assumed to arrive, on average, mid-period — discount factor = 1/(1+WACC)^(t−0.5)).

| Year | Revenue | Norm. EBITDA¹ | EBIT | NOPAT | D&A | Capex | ΔWC | SBC | FCF | Disc. Factor (t−0.5) | PV of FCF |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| FY2026 | 1,350.4 | 202.6 | 185.0 | 138.7 | 17.6 | 27.0 | −22.6 | 16.2 | 135.7 | 0.9626 | 130.6 |
| FY2027 | 1,289.6 | 208.9 | 190.9 | 143.1 | 18.1 | 25.8 | −13.8 | 15.5 | 133.7 | 0.8919 | 119.3 |
| FY2028 | 1,302.5 | 214.9 | 195.4 | 146.5 | 19.5 | 23.4 | +2.9 | 15.6 | 124.1 | 0.8263 | 102.5 |
| FY2029 | 1,328.5 | 225.9 | 205.9 | 154.4 | 19.9 | 21.3 | +5.9 | 15.9 | 131.3 | 0.7656 | 100.5 |
| FY2030 | 1,361.7 | 231.5 | 211.1 | 158.3 | 20.4 | 20.4 | +7.5 | 16.3 | 134.4 | 0.7094 | 95.4 |
| FY2031 | 1,402.6 | 238.4 | 217.4 | 163.1 | 21.0 | 21.0 | +9.3 | 16.8 | 136.9 | 0.6573 | 90.0 |

¹ Normalized EBITDA = company Adjusted EBITDA (§2 row 2) less the fading integration/restructuring re-insertion (§2 row 3). ΔWC shown with cash-effect sign already applied (negative = cash source/release; positive = cash use/absorption) — matches the §2 sign-check.

**Sum of PV of explicit FCFs = $638.2M.**

**Executed command and raw output:**
```
$ python3 dcf_smpl3.py  (excerpt)
(2026, t=1, FCF=135.66, DF=0.9626, PV=130.58)
(2027, t=2, FCF=133.73, DF=0.8919, PV=119.26)
(2028, t=3, FCF=124.06, DF=0.8263, PV=102.52)
(2029, t=4, FCF=131.26, DF=0.7656, PV=100.50)
(2030, t=5, FCF=134.42, DF=0.7094, PV=95.36)
(2031, t=6, FCF=136.95, DF=0.6573, PV=90.01)
pv_sum = 638.24
```

## 5. Terminal Value

**Financeable-growth cross-check (Economic Consistency Gate 2) — run BEFORE picking terminal g.** Reinvestment rate = `(capex − D&A + ΔNWC) / NOPAT`; implied growth = ROIC × reinvestment rate, with terminal ROIC set to WACC (7.93%) per the "No moat proven" fade rule below.
- At an initial candidate g = 3.0% (a plain nominal-GDP default): reinvestment rate = 5.86%, implied growth = 7.93% × 5.86% = **0.46%** — a **2.54pp gap** versus the modeled 3.0%, well past the 1.5pp trigger.
- At g = 1.0%: reinvestment rate = 1.95%, implied growth = 7.93% × 1.95% = **0.15%** — a **0.85pp gap**, under the 1.5pp trigger.
- **Action taken (per the Gate 2 "teeth"):** terminal g is **lowered from the initial 3.0% nominal-GDP default to 1.0%**, because the modeled reinvestment (capex ≈ D&A in the terminal year — no net capacity growth capex is modeled — plus only modest NWC growth) cannot finance more than roughly 1% of perpetual growth once ROIC is faded to WACC. The residual 0.85pp gap is not separately quantified here (SMPL's brand/marketing-driven growth is expensed through SG&A, not capitalized, so some real growth capacity is not captured by the capex/NWC formula) and is accepted as under-threshold, not bridged further.

**No-moat terminal fade (moat trigger, §5 structural rule).** `business-model/09_moat.md` §5 verdict is **"No moat proven"** — an unproven, not necessarily decaying, franchise. Per the rule, the BASE terminal carries **no perpetual excess return**: terminal ROIC is faded to WACC (7.93%, essentially where SMPL's own through-cycle ROIC of 7.0–8.8% already sits — moat §3) and g is faded to the financeable ~1.0% level derived above, not to a moat-premium nominal-GDP rate.

- **Gordon growth formula:** `TV = FCFF_{n+1} / (WACC − g) = FCF_2031 × (1+g) / (WACC − g) = 136.9 × 1.01 / (0.0793 − 0.01) = 138.3 / 0.0693 = $1,996.4M` (undiscounted, as of end-FY2031).
- `WACC − g = 6.93pp` — comfortably positive, not near-zero; no grid cell in §7 approaches the divide-by-zero boundary (checked explicitly below).
- **PV of terminal value** = $1,996.4M × 1/(1.0793)^6 = $1,996.4M × 0.6327 = **$1,263.1M**.
- **Terminal value as % of total EV = $1,263.1M / $1,901.3M = 66.4%.** Below the 75% low-confidence threshold, but still the majority driver of value — flagged, not treated as disqualifying.

**Exit-multiple cross-check.** Implied terminal EV/Adjusted-EBITDA multiple = $1,996.4M / $238.4M (FY2031 Adjusted EBITDA) = **8.4x**. For comparison: SMPL's own **current spot EV/Adjusted-EBITDA (TTM) is 5.7x** ($1,326.84M / $234.6M [`valuation/01_price-and-capital-structure.md` §5]) — the Gordon TV therefore implies real multiple expansion from today's distressed level, though only to roughly where a stabilized, no-moat packaged-food business would be expected to trade (not back to a moat-premium multiple). Direct exit-multiple cross-checks:

| Exit multiple | TV (undisc.) | PV(TV) | EV | Equity | Per share |
|---|---:|---:|---:|---:|---:|
| 7.0x | $1,669.1M | $1,056.0M | $1,694.2M | $1,369.7M | $15.23 |
| **8.0x (≈ implied)** | **$1,907.5M** | **$1,206.9M** | **$1,845.1M** | **$1,520.5M** | **$16.91** |
| 9.0x | $2,146.0M | $1,357.7M | $1,995.9M | $1,671.4M | $18.58 |

The 8.0x cross-check ($16.91/share) sits close to the Gordon-formula base ($17.53/share, §6) — the two methods corroborate each other reasonably well once terminal g is corrected to the financeable level; they would NOT have corroborated at the original 3.0% g (Gordon would have implied a 12.0x exit multiple, more than double the current spot 5.7x, with no cross-check support).

**Structural-decline / runoff terminal (moat-trajectory trigger).** `business-model/09_moat.md` §5 separately states the **moat trajectory is "eroding"** (gross margin down in 4 of the last 5 years; CIQ return-on-capital drifting from ~7.1% to 6.0% TTM; SMPL losing share within its own dominant Quest segment even as the category grows). This is a second, independent trigger (alongside "No moat proven") requiring a declining-perpetuity terminal be built and shown alongside the base — **not** substituted for it. Nominal g is set at −1.0% (below expected US inflation, trending negative, stated on the same nominal basis as the rest of this model — not a real-rate concept smuggled in), with the terminal Adjusted EBITDA margin faded further to 14.5% (below the TTM trough of 16.9%, reflecting continued, non-recovering share loss rather than the base case's stabilization at 17.0%):

- Runoff-year FCF (last explicit-forecast-year economics, faded margin) = **$123.1M**; FCF_{n+1} = $123.1M × 0.99 = $121.9M
- `TV = 121.9 / (0.0793 − (−0.01)) = 121.9 / 0.0893 = $1,365.0M` (undiscounted)
- PV(TV) = $1,365.0M × 0.6327 = **$863.6M**
- EV = $638.2M (same explicit PV, unchanged) + $863.6M = **$1,501.9M**
- Equity = $1,501.9M − $324.58M net debt = **$1,177.3M**
- **Per share = $13.09**

This runoff case is the **structural-impairment / bear input** that feeds `07_scenario-and-fair-value`'s structural-reset bear case and the master synthesizer's Kill Criteria — it is shown here as a labeled alternative, not folded into or replacing the single base-case point in §6.

## 6. DCF Output

| Step | Value |
|---|---:|
| PV of explicit FCFs (FY2026–FY2031) | $638.2M |
| + PV of terminal value (Gordon, g=1.0%, no-moat fade) | $1,263.1M |
| **= Enterprise value** | **$1,901.3M** |
| − Net debt | $324.6M |
| − Minority / preferred | $0 (none disclosed) [`valuation/01_price-and-capital-structure.md` §4] |
| **= Equity value** | **$1,576.7M** |
| ÷ Diluted shares (fully diluted, per `01`) | 89,934,884 |
| **= Intrinsic value per share** | **$17.53** |
| vs current price ($11.33, pool-verified, close 2026-08-04) | **+54.7%** |

**Executed bridge snippet:**
```
EV = pv_sum(638.24) + pv_tv(1263.05) = 1901.29
equity = EV(1901.29) - net_debt(324.58) = 1576.71
per_share = equity(1576.71) / shares(89.934884) = 17.53
upside = (17.53-11.33)/11.33 = 54.7%
```

## 7. Sensitivity Grid (per-share intrinsic value)

WACC across columns (base 7.93%, ±1pp), terminal growth down rows (base 1.0%, ±0.5pp — the financeable-growth-corrected base, not the original 3.0% default):

| | WACC 6.93% | WACC 7.93% (base) | WACC 8.93% |
|---|---:|---:|---:|
| g = 1.5% | $22.72 | $18.70 | $15.76 |
| g = 1.0% (base) | $21.03 | **$17.53** | $14.92 |
| g = 0.5% | $19.60 | $16.52 | $14.18 |

**Guard check:** the tightest cell (WACC 6.93%, g 1.5%) has `WACC − g = 5.43pp` — comfortably positive; no cell in this grid approaches the divide-by-near-zero boundary, so no cell is marked NM.

Separately, the runoff/declining-perpetuity terminal (§5) produces **$13.09/share** at the base WACC — shown here as the structural-bear anchor, not a grid cell (it uses a different, negative g and a different terminal margin, not a mechanical flex of the base-case grid).

## 8. Intrinsic Read

**Base-case intrinsic value: $17.53/share** (Gordon-growth DCF, WACC 7.93%, terminal g 1.0% after the Gate-2 financeable-growth correction from an initial 3.0% default; corroborated by an independent 8.0x exit-multiple cross-check at $16.91/share). The sensitivity grid disperses this point from **$14.18 to $22.72** across a ±1pp WACC and ±0.5pp terminal-growth flex, with a separate structural-decline (runoff) case at **$13.09/share** if the moat module's "eroding" trajectory finding continues unchecked into a permanent share-loss path. All three reads sit above the current price ($11.33), but the dispersion is wide relative to the gap to price — this is a "no moat proven, ROIC roughly at cost of capital" business where the DCF's own terminal-value share (66.4% of EV) means the answer is dominated by a modest handful of forward-looking assumptions, not a high-confidence cash-flow certainty. The single assumption this value is most sensitive to is **terminal growth/reinvestment financeability**: the raw Gordon formula at a plain 3.0% nominal-GDP default would have implied $23.62/share (a 12.0x exit multiple, more than double SMPL's own current 5.7x spot multiple, with no independent cross-check support) — only the Gate-2 financeable-growth correction down to 1.0% brought the base case into a range corroborated by the exit-multiple lens.



---

## valuation / 05_reverse-dcf.md

_Source: `05_reverse-dcf.md`_

# Reverse DCF — What's Priced In — SMPL

Business-type gate: SMPL is an **Operating** business (branded, asset-light consumer-packaged-food company) [`00_valuation-data-triage.md` §1A; `business-model/02_business-identity.md`] — the standard FCFF reverse-DCF applies, not a DDM/residual-income equity-direct model. Price-state is **pool-verified** ($11.33, close, Aug-04-2026) [`01_price-and-capital-structure.md` §1] — the partial-data stop does not apply.

This report inverts the SAME model as `04_intrinsic-dcf.md`: it holds `04`'s WACC (7.93%), terminal growth (1.0%), 6-year explicit horizon (FY2026–FY2031), and mid-year discounting convention fixed and verbatim, and solves backward for the FCF path today's enterprise value actually requires.

## 1. Inputs

| Input | Value | Source |
|---|---:|---|
| Current price | $11.33 (close, Aug-04-2026) | `01_price-and-capital-structure.md` §1, price-state: pool-verified |
| Enterprise value (EV) | $1,326.84M | `01_price-and-capital-structure.md` §4 (market cap $1,002.26M + funded debt $397.04M + operating leases $51.43M − cash $123.88M) |
| FCF base (FY2025, "year 0") | $151.2M (normalized FCFF, `04`'s identity) | Derived below, matching `04`'s own FCFF construction |
| Discount rate (WACC) used | 7.93% | `04_intrinsic-dcf.md` §3, verbatim (CAPM: kₑ 9.58% incl. 3.0pp small-cap size premium, after-tax kd 4.24%, weights 69.1%/30.9%) |
| Terminal growth (g) | 1.0% | `04_intrinsic-dcf.md` §5, verbatim (financeable-growth-corrected from an initial 3.0% nominal-GDP default per the Gate-2 reinvestment cross-check) |
| Forecast horizon | 6 years (FY2026–FY2031) | `04_intrinsic-dcf.md` §2, verbatim |
| Discounting convention | Mid-year for explicit FCFs (t−0.5); terminal value discounted at the full final year (t=6, not 5.5) | `04_intrinsic-dcf.md` §4–§5, matched exactly (discount factors 0.9626…0.6573 for t=1..6; TV factor 0.6327 = 1/1.0793⁶) |

**FCF base derivation (held to `04`'s own FCFF identity — `NOPAT + D&A − Capex − ΔNWC − SBC` — applied to the FY2025 base year, not re-derived):**
```
NOPAT_2025      = 217.8 × (1−0.25)              = 163.35   (Normalized EBIT from 04 §1, 25% tax rate from 04 §2)
+ D&A_2025      = 177.9 (GAAP EBITDA) − 156.9 (GAAP EBIT) = 21.0   (earnings/01 §1)
− Capex_2025    = 20.5                                     (earnings/01 §1)
− ΔNWC_2025     = 329.1 − 331.7 = −2.6 (a release, so −ΔNWC = +2.6)  (earnings/01 §1, FY25 vs FY24 NWC)
− SBC_2025      = 15.3                                     (earnings/01 §4, FY2025 disclosed SBC)
= FCF0          = 163.35 + 21.0 − 20.5 + 2.6 − 15.3 = 151.15 ≈ $151.2M
```
Two alternate FCF0 anchors are carried through §4 as robustness bands: FY2025 **reported** FCF (CFO − Capex) = $157.9M [`earnings/01_historical-financials.md` §1], and the **latest TTM** FCF (to May-30-26) = $119.4M [`earnings/01_historical-financials.md` §2] — the current trough, per `business-model/07_business-quality.md`'s "multi-year trough, not a cyclical peak" finding.

## 2. Implied Expectations

**What was held fixed:** WACC (7.93%), terminal g (1.0%), horizon (6 years), discounting convention (all from `04`, verbatim) and the FY2025 normalized FCF0 ($151.2M). **What was solved for:** a single constant annual FCF growth rate `g` applied to FCF0 for 6 years, such that the resulting present value (explicit FCFs discounted mid-year + Gordon-growth terminal value on the year-6 FCF, discounted at the full final year) equals today's EV of $1,326.84M.

**Executed solver (Python, `scipy.optimize.brentq`):**
```
def f(g):
    pv_explicit = sum(FCF0*(1+g)**t / (1+WACC)**(t-0.5) for t in range(1,7))
    fcf6 = FCF0*(1+g)**6
    tv = fcf6*(1+0.01)/(0.0793-0.01)
    pv_tv = tv/(1+0.0793)**6
    return (pv_explicit + pv_tv) - 1326.84
g_implied = brentq(f, -0.5, 0.9)
```
**Root returned: g = −9.08%** (FCF0 = $151.15M normalized FY2025 base).

Cross-check outputs from the same run: PV of explicit FCFs = $539.45M, PV of terminal value = $787.39M, EV = $1,326.84M (ties exactly), terminal value = **59.3% of EV** — near the 60% terminal-dominance threshold, so terminal-g robustness is shown in §4.

| What the Price Implies | Solved Value |
|---|---:|
| Implied FCF CAGR over the 6-year horizon (FY2026–FY2031) | **−9.08% per year** |
| Implied years of above-GDP (or even flat) FCF growth priced in | **Zero** — the solved path is a continuous decline in every one of the 6 explicit years, not a trough-then-recovery shape |
| Implied steady-state EBIT margin (holding `04`'s own revenue path fixed — see below) | **11.4%** |

**Sanity check — flat FCF, no decline at all.** Running the identical solver with `g = 0` (FCF held flat at the $151.2M FY2025 level for all 6 years, same WACC and terminal g) produces an EV of **$2,121.1M** — both above `04`'s own base-case EV ($1,901.3M) and far above the current $1,326.84M EV. **The price does not even embed a "flatline forever" scenario; it requires a full six years of continuous decline.**

**Secondary solve — implied steady-state EBIT margin.** Holding `04`'s own revenue path fixed (FY26 −6.9%, FY27 −4.5% [company guidance / Street consensus], FY28–31 fading to +1.0% to +3.0% [`04`'s analyst assumption]) and `04`'s own D&A%, capex%, SBC%, and 22.7%-of-revenue working-capital ratio, the constant EBIT margin that reproduces today's EV is **11.4%** — solved the same way (`brentq` on the margin variable, same discounting). That sits *below* both the TTM trough of 10.7% normalized EBIT margin (close to it) and well below `04`'s own terminal assumption of 15.5% and FY2025's normalized 15.0%. In other words: even if revenue recovers on schedule exactly as `04` assumes, the price still requires operating margins to stay pinned near today's trough — not recover — for the full horizon.

## 3. Implied vs Achievable

| Implied Requirement | Company History | Earnings-Module Evidence | Achievable? |
|---|---|---|---|
| Implied FCF CAGR = −9.08%/yr for 6 straight years (FY26–FY31) | FY2021–FY2025 FCF CAGR = **+5.8%/yr** ($126.2M → $157.9M); revenue CAGR over the same period = **+9.6%/yr** — five straight years of GAAP growth before the last four quarters turned negative [`earnings/01_historical-financials.md` §1, §6] | FY2026 guidance is −6.9% revenue and FY2027 consensus is −4.5% (still being cut, revision breadth −6) [`earnings/04_guidance-consensus.md`, per `04_intrinsic-dcf.md` §2] — genuinely supports 1–2 years of comparable-magnitude decline, but **`04`'s own analyst-built forecast has revenue re-accelerating to +1% to +3% by FY2028–31**, and `earnings/07_earnings-sensitivity.md` §2 shows Quest (63.7% of sales) still growing +1.1% YoY, a September-2026 price increase not yet in effect, and management flagging Atkins comps as "becoming more favorable" from FY27 | **Stretch to No** — the first 1–2 years are within the guided/consensus range; sustaining that pace for 4 more years contradicts both `04`'s own forecast shape and the earnings-module driver evidence |
| Implied steady-state EBIT margin = 11.4% (holding `04`'s revenue path) | FY2021 margin 17.7%, falling to FY2025's 10.8% GAAP / 15.0% normalized; TTM normalized margin 10.7% (a documented multi-year trough, not a peak) [`earnings/01_historical-financials.md` §1–§2; `business-model/07_business-quality.md` §4] | `04`'s own terminal assumption is 15.5%, benchmarked between the TTM trough (16.9% Adj. EBITDA basis) and FY2024 (20.2%) — deliberately **not** management's own "~20%" aspirational target [`04_intrinsic-dcf.md` §2 Cyclicality Gate note] | **Stretch** — 11.4% sits close to but marginally below the documented trough; it requires the current trough to persist indefinitely with no recovery even after the September-2026 price increase and Atkins comp-easing that management itself flags |

In 2–4 sentences: the market's implied expectations are **aggressive on the downside**, not conservative. A one-to-two-year continuation of the currently guided decline is well evidenced (FY26 guidance −6.9%, FY27 consensus −4.5%, still being cut), but the priced-in path requires that pace of decline — or a margin pinned at the trough — to run unbroken for a full six years, which is a materially harsher outcome than `04`'s own analyst-built forecast (revenue recovering to +1–3% growth from FY28, margin recovering to 15.5%) and than the company's own five-year pre-2025 history (+9.6%/yr revenue CAGR, +5.8%/yr FCF CAGR). **Market-ceiling check (Operating business, per §5 of the framework): not meaningful here and not run — the priced-in path is a *decline*, not a growth path requiring incremental market-share capture, so there is no addressable-market ceiling to test against; the check exists to make implied growth look harder, and there is no growth to stress-test.** The only ceiling worth naming in the opposite direction: `04`'s own **structural-reset/runoff bear case** — a labeled, permanent-share-loss scenario with a 14.5% terminal margin and −1% perpetual decline [`04_intrinsic-dcf.md` §5] — still computes to **$13.09/share**, above today's $11.33 price. The market is pricing in something worse than even `04`'s own structural-bear input.

## 4. Robustness

**FCF base.**

| FCF Base (FY2025, "year 0") | Implied FCF CAGR to Justify Price |
|---|---:|
| TTM trough (latest 39wk, $119.4M) | **−4.56%/yr** |
| FY2025 normalized (base, $151.2M — `04`'s FCFF identity) | **−9.08%/yr** |
| FY2025 reported (CFO − Capex, $157.9M) | **−9.91%/yr** |

**Discount rate.**

| Discount Rate | Implied FCF CAGR to Justify Price |
|---|---:|
| WACC −1pp (6.93%) | **−11.64%/yr** |
| WACC (base, 7.93%) | **−9.08%/yr** |
| WACC +1pp (8.93%) | **−6.75%/yr** |

**Terminal growth** (shown because base-solve terminal value = 59.3% of EV, near the ~60% dominance threshold, and `04`'s own base case carries TV at 66.4% of EV):

| Terminal g | Implied FCF CAGR to Justify Price |
|---|---:|
| g − 0.5pp (0.5%) | **−8.24%/yr** |
| g (base, 1.0%) | **−9.08%/yr** |
| g + 0.5pp (1.5%) | **−9.98%/yr** |

**Executed commands and roots** (same `brentq` solver as §2, parameter swept): FCF0 sweep → `{119.4: -4.56%, 151.15: -9.08%, 157.9: -9.91%}`; WACC sweep → `{0.0693: -11.64%, 0.0793: -9.08%, 0.0893: -6.75%}`; terminal-g sweep → `{0.005: -8.24%, 0.01: -9.08%, 0.015: -9.98%}`.

**Which input dominates:** the **FCF base** spans the implied-growth solve by **5.35 percentage points** (−4.56% to −9.91%) across its low/base/high band; the **WACC** spans it by **4.89 percentage points** (−11.64% to −6.75%) across ±1pp; **terminal g** spans it by only **1.74 percentage points** (−8.24% to −9.98%) across ±0.5pp. The FCF base is the marginally larger swing factor here, with WACC close behind and terminal g the least sensitive of the three — consistent with the general pattern that the base, not the discount rate, usually does the most work in a reverse-DCF read.

## 5. What's-Priced-In Read

At $11.33, the market is pricing in a **normalized FCF decline of roughly 9% a year for six straight years** (FY2026–FY2031) off a $151M FY2025 base — not a return to flat, let alone growth, and (on the margin-holding-revenue-fixed solve) an operating margin pinned near today's documented trough indefinitely. That is more severe than what the evidence supports past the next 1–2 years: SMPL's own FY2026 guidance (−6.9% revenue) and FY2027 consensus (−4.5%, still being cut) justify roughly that pace of decline near-term, but not for four more years on top of it — `04`'s own analyst-built DCF forecast has revenue recovering to +1–3% growth from FY2028, and even `04`'s labeled structural-reset/permanent-share-loss bear case ($13.09/share) still sits above today's price. This reads as **aggressive on the downside** — the market may be pricing a deeper, more durable decline than the company's own guidance shape, the earnings-module driver evidence (Quest still growing, an unlanded September-2026 price increase, easing Atkins comps), or `04`'s own bear case support — which is consistent with `04`'s independently-derived +54.7% intrinsic upside. The flip side is real and documented, not dismissed: a 68/100 (high) earnings-volatility score, negative FY2027 estimate-revision breadth, zero commodity hedges, and an "eroding" moat trajectory (`business-model/09_moat.md` §5) mean a milder version of this decline path is a live, evidenced risk — just not, on the evidence gathered here, the full six-year, no-recovery path the current price requires.



---

## valuation / 06_sum-of-the-parts.md

_Source: `06_sum-of-the-parts.md`_

# Sum-of-the-Parts — SMPL

**Collapse note (read first):** SMPL reports **one GAAP reportable segment** (ASC 280) — the Chief Operating Decision Maker (the CEO) reviews only consolidated net income, with no brand-level profit metric reviewed or disclosed [FY25 10-K, Note 15 (Segment and Customer Information); `business-model/03_segment-map.md` §1]. By the GAAP segment test alone, that is 100% of EBIT concentrated in one reportable segment — mechanically far past the partial-data rule's 85% threshold. Internally, management runs three brands (Quest, Atkins, OWYN) and discloses brand-level **revenue**, but explicitly discloses **no** brand-level profit, EBIT, EBITDA, or margin for any of the three — "Profit Share... Not disclosed" for every row [`business-model/03_segment-map.md` §1, Table]. Even judged at the brand level (where no single brand exceeds 85% of revenue), a genuine brand-by-brand SOTP cannot be built because the second required input — a segment EBIT or EBITDA to multiply — simply does not exist in the filings. Per the sum-of-the-parts agent's own partial-data rule: **"Effectively single-segment — SOTP collapses to the consolidated read."** This report therefore does not, and cannot, produce a quantified brand-by-brand breakup. What follows is (a) the required brand revenue inventory with the profit gap stated explicitly, and (b) the collapsed single-"segment" (consolidated) valuation sanity check, run on a forward EV/EBITDA basis against a named, economics-matched comparable — which is the only SOTP-shaped exercise the data will support.

Because the collapse point is the whole consolidated company, this method's output is arithmetically close to (and should be read alongside, not stacked independently on top of) the peer-relative-valuation method in `03_peer-multiples.md`. It corroborates rather than adds a genuinely independent data point — flagged here for `07`'s triangulation.

## 1. Segment Inventory

Reporting currency: USD (millions). Reporting standard: US GAAP. Fiscal year ends the last Saturday in August (FY2025 ended Aug 30, 2025).

| Segment (brand) | Revenue (FY25) | EBIT / EBITDA | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| Quest | $863.6m (59.5%) | Not disclosed | Not disclosed | N/A — no brand EBIT disclosed | FY25 10-K, Note 15; `business-model/03_segment-map.md` |
| Atkins | $420.8m (29.0%) | Not disclosed | Not disclosed | N/A — no brand EBIT disclosed | Same |
| OWYN | $137.0m (9.4%) | Not disclosed | Not disclosed | N/A — no brand EBIT disclosed | Same |
| International / unallocated | $29.5m (2.0%) | Not disclosed | Not disclosed | N/A — no brand EBIT disclosed | Same |
| **Consolidated (the one GAAP reportable segment)** | **$1,450.9m (100%)** | **GAAP EBIT $156.9m / GAAP EBITDA $177.9m (FY25); Adjusted EBITDA $278.2m (FY25, company non-GAAP)** | GAAP EBIT margin 10.8%; Adj. EBITDA margin 19.2% (FY25) | **100% by construction (the only EBIT the company discloses)** | FY25 10-K, Income Statement & MD&A reconciliation; `earnings/01_historical-financials.md` §1, §4 |

**"% of Total EBIT" denominator, defined:** because SMPL discloses EBIT/EBITDA only at the consolidated level, the 100% row above is not a segment "share" in the usual SOTP sense — it is the entire disclosed profit pool. There is no separate unallocated-corporate bucket sitting outside the brands: the consolidated GAAP and Adjusted EBITDA figures already net every cost the company incurs (COGS, SG&A, corporate overhead, brand-specific marketing) across all three brands and International in one number. This satisfies Reconciliation Gate 3 (no vanished bucket) on the collapse path — nothing is dropped by assertion, because there is nothing left outside the one number being valued.

## 2. Segment Multiples & Comparables

Only one row is possible given the collapse — the "segment" being valued is the whole consolidated company.

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| Consolidated (collapsed) | NTM Adjusted EBITDA ≈ $217.78M (Capital IQ consensus, calendarized NTM; company's own FY2026E Adjusted EBITDA guidance is $220–225M, corroborating the same basis) | 8.39x (base case) | **BellRing Brands, Inc. (NYSE: BRBR)** | NTM TEV/Forward EBITDA 8.39x | `TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls`, Consensus tab (NTM EBITDA, guidance cross-check); `Company Comparable Analysis The Simply Good Foods Company.xls`, Trading Multiples tab, as-of 2026-07-24 (BRBR NTM TEV/EBITDA) |

**Period basis stated:** forward (NTM), both metric and multiple — not trailing. LTM GAAP EBITDA is not usable here regardless of period-matching, because it is negative on an impairment-distorted basis (−$213.1M LTM per `earnings/01_historical-financials.md` §2); the NTM Adjusted EBITDA figure avoids that distortion and is cross-checked directly to the company's own forward guidance range.

**Why BellRing is the matching comparable, not just the nearest ticker:** BRBR is the single closest economic match in the peer set — a branded, outsourced-manufacturing, RTD-protein-shake-and-bar business (Premier Protein, Dymatize) sold through the identical club/mass/drug/e-commerce retail channels SMPL uses, directly overlapping Quest's bar/RTD lines and Atkins'/OWYN's RTD shakes [`business-model/08_competitive-map.md` §2, Competitor A]. It is not matched on ticker proximity or sector label alone — the other nine names in the CIQ comp set are real packaged-food companies but sit on different economics: Conagra (CAG), Campbell's (CPB), Kraft Heinz (KHC) are diversified multi-category packaged-food conglomerates several times SMPL's scale with different growth/margin structures; Freshpet (FRPT) is a premium, capital-intensive, refrigerated pet-food grower on a much higher multiple (12.89x NTM EV/EBITDA) reflecting a different growth category; Utz (UTZ) is a capital-heavier salty-snack manufacturer; Hain Celestial (HAIN) is closer in *decline profile* (a struggling "healthy" branded portfolio, similar in spirit to Atkins' own trajectory) but sells a different product set (organic/natural grocery, not protein nutrition) — it is used below only as the low end of a sanity range, not the primary comparable.

**Dispersion (not a weighted method, a labelled range):** using the same NTM Adjusted EBITDA base against the low end of the comparable range (HAIN, 6.79x — a declining-brand analogue) and a higher end (peer group median across all 10 names, 8.72x) brackets the base case. This is shown as dispersion only, per the "point value with separate dispersion" requirement — it is not three independently-derived scenarios.

| Case | Multiple | Comparable basis |
|---|---:|---|
| Low | 6.79x | HAIN NTM TEV/EBITDA — declining-brand analogue, not a category match |
| **Base** | **8.39x** | **BRBR NTM TEV/EBITDA — best economics match** |
| High | 8.72x | Peer group median (10 names), as-of 2026-07-24 |

## 3. Segment Valuation

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Consolidated (collapsed) — Low | $217.78M | 6.79x | $1,478.7M |
| **Consolidated (collapsed) — Base** | **$217.78M** | **8.39x** | **$1,827.2M** |
| Consolidated (collapsed) — High | $217.78M | 8.72x | $1,899.0M |
| **Gross enterprise value (sum) — Base** | | | **$1,827.2M** |

There is only one line to sum because there is only one disclosed profit pool.

## 4. Equity Bridge

| Step | Low | Base | High |
|---|---:|---:|---:|
| Gross enterprise value | $1,478.7M | $1,827.2M | $1,899.0M |
| − Capitalized unallocated corporate costs | $0 (already netted inside the single consolidated EBITDA figure — see §1 Gate-3 note; no separate bucket exists to capitalize) | $0 | $0 |
| − Net debt (strict basis: total debt $448.46M − cash $123.88M, as of May-30-2026) | ($324.58M) | ($324.58M) | ($324.58M) |
| − Minority / preferred | $0 (none disclosed) | $0 | $0 |
| + Equity-method investments | $0 (none disclosed) | $0 | $0 |
| − Conglomerate / holdco discount | $0 — see note below | $0 | $0 |
| **= Equity value** | **$1,154.1M** | **$1,502.6M** | **$1,574.5M** |
| ÷ Diluted shares (fully diluted, TSM) | 89,934,884 | 89,934,884 | 89,934,884 |
| **= SOTP value per share** | **$12.83** | **$16.71** | **$17.51** |
| vs current price ($11.33, close Aug-04-2026) | +13.2% | +47.5% | +54.6% |

Net debt, share count, and the EV bridge components are carried forward unchanged from `01_price-and-capital-structure.md` §4–§5 (net debt $324.58M, fully diluted shares 89,934,884). SMPL is net-debt (not net-cash), so only the single "− net debt" line applies; no add-back is needed and none is shown, avoiding the double-count `01` warns against.

**Conglomerate / holdco discount: none applied.** SMPL is not a legal holding company and holds no minority stakes in the three brands — Quest, Atkins, and OWYN are wholly-owned operating brands inside one corporate and legal structure, not separately listed or partially-owned subsidiaries. A structural holdco discount (the kind applied when a listed parent trades below the sum of its publicly-tradeable stakes) has no mechanism to apply here. What this collapse genuinely cannot do is quantify a **brand-mix** discount or premium — i.e., whether the market is under- or over-pricing Quest's growth against Atkins' decline — because no brand-level profit exists to isolate that effect. That gap is stated as a qualitative limitation in §5, not papered over with an invented multiplier.

## 5. SOTP Read

A genuine sum-of-the-parts cannot be built for SMPL: it is one GAAP reportable segment with brand-level revenue but zero brand-level profit disclosure, so there is no second input (a brand EBIT) to multiply by a brand-specific comparable. What collapses out instead is a consolidated forward-multiple sanity check: applying BellRing Brands' NTM EV/EBITDA of 8.39x (the closest economics match — same RTD-protein-and-bar category, same retail channels) to SMPL's own NTM Adjusted EBITDA of $217.78M implies roughly $16.71/share against the $11.33 close, with a $12.83–$17.51 range depending on which peer multiple is used — all of it above the current price. That gap says the market is pricing SMPL meaningfully below where a directly comparable branded-nutrition peer trades on the same forward earnings base, not that any one brand is "masked" — the filings give no way to say whether that discount belongs to Quest, Atkins, or OWYN specifically. Qualitatively, and only qualitatively (per `business-model/03_segment-map.md` and `08_competitive-map.md`), Quest is the brand management calls the "most important growth engine" (59.5% of FY25 revenue, rising to 63.7% of nine-month FY2026 revenue) while Atkins is in clear structural decline (FY25 net sales −14.5%, a $60.9M brand intangible impairment, FQ3 FY26 retail takeaway −24.6% y/y) and OWYN is a newly acquired, explicitly lower-margin brand still integrating through a disclosed FY26 product-quality issue — so the qualitative read is that Quest is very likely doing the heavy lifting inside a consolidated multiple that a shrinking Atkins and a still-integrating OWYN are dragging down, but this cannot be sized in dollars or turned into a quantified per-brand value without a profit disclosure SMPL does not provide.

**Method status for `07`:** treat this as a labelled sanity check that corroborates the peer-relative-valuation method (`03`), not as an independent SOTP data point — since the collapse point is the consolidated company, this method and peer relative valuation are mechanically the same calculation on largely the same inputs, and should not both be counted as separate legs of a triangulation.



---

## valuation / 07_scenario-and-fair-value.md

_Source: `07_scenario-and-fair-value.md`_

# Scenario & Fair Value — SMPL

Anchors used verbatim from `01_price-and-capital-structure.md`: current price **$11.33** (close, Aug-04-2026, price-state **pool-verified**, fresh — 2 calendar days old, no staleness cap); shares for per-share fair value **89,934,884** (fully diluted); net debt **$324.58M** (strict basis: total debt $448.46M − cash $123.88M). Business type: **Operating** (branded, asset-light consumer-packaged-food company) per the Business-Type Method Map — FCFF DCF, EV/EBITDA, EV/Sales, P/E and FCF yield are all valid; no Financial/REIT override applies. Reporting currency USD throughout.

## 1. Method Summary

| Method | Fair / Implied Value (per share) | Confidence | Weight | Why This Weight |
|---|---:|---|---:|---|
| Own-history multiples (02) | $37.74 (median-reversion point; range $33.08–$51.31) | Low, as a fair-value input | **0%** | **Zero-weighted.** `02`'s own producer states this table is "shown as the mechanical own-history sanity check the module rules require, not as a defensible fair-value input on its own" — the old multiples were earned by a business growing revenue every year for five years with a stable-to-expanding margin; the current business has four straight quarters of revenue decline, ~330bps of margin compression, a $391.9M impairment, and a CEO departure. Self-flagged non-value-producing; carried in the football field only |
| Relative / peers (03) | $13.76 (quality-adjusted NTM EV/EBITDA; dispersion $11.86–$13.76 on the reliable EV/Sales & EV/EBITDA subset) | Medium (only 1 of 10 comps — BellRing — is a true category peer; the 18% quality haircut is a stated judgment call, not mechanical) | **60%** | Carries the majority weight per the Method-Weighting Policy's multiples-first rule for an Operating business with a usable forward metric and a peer multiple set. With `02` excluded (self-flagged, above) and `06` excluded (self-flagged as non-independent, below), `03` is the sole surviving multiples-camp method, so it alone must carry the "majority" role `02`+`03` would normally share |
| Intrinsic DCF (04) | $17.53 (Gordon TV, WACC 7.93%, terminal g 1.0% after the Gate-2 financeable-growth correction; sensitivity grid $14.18–$22.72) | Medium (terminal value is 66.4% of EV — flagged but below the 75% low-confidence line; corroborated by an independent 8.0x exit-multiple cross-check at $16.91) | **40%** | Elevated above the standard ≤⅓ cross-check cap for a stated reason: with `02` zero-weighted, `03` alone cannot fill the full "majority" role the policy expects from the multiples camp, so `04` — the only other value-producing method — is weighted above the default cross-check ceiling rather than left an under-weighted afterthought. Still held below `03` because DCF here is terminal-value-dominated |
| Reverse-DCF (05) | (implied, not a value) — market prices in a −9.08%/yr FCF decline for 6 straight years, or an 11.4% steady-state EBIT margin held indefinitely | n/a | n/a | Cross-check only, per the rules — informs whether the base case (and even the bear cases below) is achievable against the evidence; not a weighted input |
| Sum-of-the-parts (06) | $16.71 (base, BellRing 8.39x NTM EV/EBITDA on NTM Adj. EBITDA $217.78M; range $12.83–$17.51) | Medium-low, as an independent input | **0%** | **Zero-weighted.** SMPL is a single GAAP reportable segment with brand-level revenue but zero brand-level profit disclosure — a genuine SOTP cannot be built. `06`'s own producer states: "treat this as a labelled sanity check that corroborates the peer-relative-valuation method (`03`)... should not both be counted as separate legs of a triangulation." Carried in the football field only |

Weights sum to 100% across the two value-producing methods valid for this business type and not self-flagged as non-independent/illustrative-only (`03` and `04`). `02` and `06` are self-excluded by their own producers, not by this agent's discretion, and remain visible in the §2 football field for transparency. Reverse-DCF (`05`) is a cross-check, not a weighted input.

## 2. Triangulation & Reconciliation

**Method football field** (honest cross-method spread — not narrowed):

| Method | Value / Range | Confidence | Weight | Why this weight |
|---|---:|---|---:|---|
| 02 — Own-history multiples | $37.74 point; $33.08–$51.31 range | Low (as a fair-value input) | 0% | Self-flagged not a defensible fair-value input — reversion to the old multiple set assumes an intact growth/margin profile the evidence says no longer holds |
| 03 — Relative / peers | $13.76 point; $11.86–$13.76 reliable range ($16.67–$18.02 low-confidence extension) | Medium | 60% | Sole surviving multiples-camp method; carries the multiples-first majority |
| 04 — Intrinsic DCF | $17.53 point; $14.18–$22.72 sensitivity range | Medium | 40% | Only other value-producing method; elevated cross-check weight (stated reason above) |
| 05 — Reverse-DCF | Not a value — implied −9.08%/yr FCF CAGR (6 yrs) | n/a | n/a | Cross-check only |
| 06 — SOTP (collapsed) | $16.71 point; $12.83–$17.51 range | Medium-low | 0% | Self-flagged as corroborating `03`, not independent (mechanically the same calculation on the same consolidated inputs) |

**Base-case fair value (single point): $15.27/share** — a 60/40 weighted blend of `03` ($13.76 × 0.60 = $8.26) and `04` ($17.53 × 0.40 = $7.01):
```
base_point = 0.60*13.76 + 0.40*17.53 = 8.256 + 7.012 = 15.27
```
**Reconciliation judgement:** the two value-producing methods disagree by 27.4% ($13.76 vs $17.53 — `(17.53-13.76)/13.76`), below the 40% hard-flag threshold but wide enough to note explicitly. `04`'s higher read is not a "low-DCF drag" case that needs defending down — if anything the DCF sits *above* the peer-relative read, and it is internally corroborated (its implied terminal EV/EBITDA of 8.4x sits close to the peer median of 8.72x, and the Gordon-formula base is cross-checked against an independent 8.0x exit-multiple lens at $16.91, within $0.62 of the DCF's own $17.53). The more material disagreement is between the two *excluded* methods (`02` at $37.74) and the two weighted ones — that gap is the headline finding below, not the 03-vs-04 gap.

**Headline finding — the >40% spread lives entirely in the rejected own-history reversion, not in the weighted methods.** `02`'s mechanical reversion point ($37.74, +233% vs price) sits 174% above `03`'s peer-relative read ($13.76) and 115% above `04`'s DCF ($17.53) — a spread that would be alarming if `02` were a live input. It is not: `02`'s own agent explicitly rejects it as "not underwritten as achievable," citing four straight quarters of revenue decline, ~330bps margin compression, a $391.9M impairment, and a CEO departure — the same evidence this report's own weighted methods (`03`'s quality-discounted peer multiple, `04`'s no-moat WACC/terminal fade) already price in. `06` ($16.71) sits close to `04` (4.9% apart) and is explicitly a peer-relative echo, not independent corroboration. Net: the two methods actually doing triangulation work — peers and intrinsic DCF — agree within 27%, both meaningfully above the current price; the wide "football field" number is a rejected historical ceiling, not a live disagreement.

## 3. Bull / Base / Bear Fair-Value Levels

All cases use **NTM (~FY2027) Adjusted EBITDA** as the forward metric (company non-GAAP, consensus base of $218.42M per `03`) and an **EV/NTM-Adjusted-EBITDA** multiple, bridged with `01`'s canonical net debt ($324.58M, strict basis) and 89,934,884 fully diluted shares. Horizon: 12 months (≈ Aug-2027) for Base/Bull/Bear-operating; 24–36 months for the separately-labeled structural-reset case.

| Case | Fair Value / Share (point) | Forward Metric (NTM Adj. EBITDA) | Multiple | Horizon | What Must Be True (operating drivers) |
|---|---:|---:|---:|---|---|
| **Bull** | **$21.98** | $264.5M | 8.70x | 12 mo (~Aug-2027) | Commodity input costs ease vs. the FY2026 guide (+$27.0M EBITDA, within the company's own 3-yr observed gross-margin-swing band [`earnings/07_earnings-sensitivity.md` §2]) + Quest re-accelerates to +8% YoY from the current +1.1% (+$11.4M) + the Sept-2026 price increase lands at the low end of management's elasticity range (0.7x, +$7.7M) — a coherent "turnaround proven" story, not five independent draws. Multiple expands to the plain (un-discounted) peer median (8.72x ≈ 8.70x used), i.e. the 18% quality haircut `03` currently applies closes entirely because the evidence behind it (weak margin stability, no moat, negative growth) is no longer present |
| **Base** | **$15.27** | $218.42M (unchanged, consensus) | 7.77x | 12 mo (~Aug-2027) | The weighted triangulation point above. Multiple is the blend of `03`'s quality-adjusted peer multiple (7.15x) and `04`'s DCF-implied multiple (8.70x) at the same 60/40 weights — i.e. neither the full quality discount persists nor does it fully close; margin stabilizes near the TTM trough, Atkins decline moderates on schedule, no major re-rating catalyst fires |
| **Bear (operating, headline)** | **$8.42** | $177.4M | 6.10x | 12 mo (~Aug-2027) | Commodity costs worsen further vs. guide (−$27.0M) + Quest bar softness deepens as the CEO himself flagged for FY2027, Quest growth falling to −5% YoY (−$10.1M) + Atkins decline deepens to −30% YoY rather than easing (−$3.9M) — a single coherent "turnaround stalls" narrative (weak demand + unrelieved cost pressure), not five independent negative draws. Multiple compresses to SMPL's own 5-year floor (6.11x, `02`'s own-history band — used as 6.10x for consistency with the current spot multiple), reflecting continued erosion with no re-rating catalyst |
| **Bear (structural reset / avoid-ruin floor)** | **$13.09** | — (EV-based DCF reset, see bridge below) | — | 24–36 mo | Permanent, not cyclical, share loss: Atkins/OWYN terminal margin fades to 14.5% (below the TTM trough) and the terminal perpetuity turns **negative** (g = −1.0%), reflecting continued, non-recovering share loss inside SMPL's own dominant Quest segment (`business-model/09_moat.md` §5: consolidated retail takeaway −6.7% in FQ3 FY26 vs. a category growing +10%) |

**Both columns stated for every case; direction check:** Bull raises both the metric (+21.1% vs. base) and the multiple (+12.0% vs. base) — same direction. Bear (operating) lowers both the metric (−18.8% vs. base) and the multiple (−21.5% vs. base) — same direction. Neither case moves the metric while holding or inverting the multiple.

**Bull multiple not reached toward `02`'s own-history band, and why (cited reason, per the hard-rule carve-out):** `02`'s own agent explicitly disclaims its 5-year band (mean 14.81x, median 15.85x EV/EBITDA) as achievable — that band was earned by a five-year uninterrupted grower with a stable-to-expanding margin, a profile the evidence says the current business does not have. Reaching toward it for the bull case would violate the same "warranted-multiple" discipline `02` itself applies. The bull case instead anchors its multiple expansion on an evidenced, currently-observed re-rate (the plain peer median, 8.72x) — a specific, cited alternative, not an invented ceiling.

### Structural-reset bridge (executed)

`04_intrinsic-dcf.md` §5 independently built this as a declining-perpetuity DCF terminal (moat-trajectory trigger — see §3 below); reproduced here to confirm the bridge:

```
$ python3 -c "
pv_explicit = 638.2
pv_tv_runoff = 863.6
ev = pv_explicit + pv_tv_runoff
net_debt = 324.58
equity = ev - net_debt
shares = 89.934884
print('EV =', ev, ' Equity =', equity, ' Per share =', round(equity/shares,2))
"
EV = 1501.8   Equity = 1177.2   Per share = 13.09
```
Method: EV-based reset (impaired terminal EBIT/EBITDA via a declining Gordon perpetuity), bridged with `01`'s canonical net debt ($324.58M) subtracted **before** dividing by shares — matches the requirement that an EV-based reset use the canonical net-debt anchor, not an equity-multiple double-count.

### Which case is the headline Bear (graduated rule)

`business-model/09_moat.md` §5 delivers **both** triggers simultaneously: verdict **"No moat proven"** AND moat trajectory **"eroding"** (gross margin down 4 of 5 years; return on capital drifting from ~7.1% to 6.0% TTM; SMPL losing share within its own dominant Quest segment even as the category grows). A confirmed-eroding trajectory makes the structural reset headline-Bear-eligible, computed as the **worse (lower) of** the structural reset and the 12-month operating deterioration case:
```
worse_of(8.42, 13.09) = 8.42
```
**The operating case ($8.42) is worse than the structural reset ($13.09), so it is the headline Bear** — the deeper near-term deterioration case is not overridden by the milder multi-year reset. The structural reset ($13.09) is carried forward as the labelled avoid-ruin floor for `master-synthesizer` Kill Criteria, not discarded: it is materially above today's price, which is itself notable (see §6) — even SMPL's own permanent-impairment path does not currently imply downside from $11.33.

**No probabilities assigned to any case** — that is the master synthesizer's job.

**Note on "cyclical trough" methodology (why this Bear is not built on a prior-recession trough):** SMPL is not classified Commodity/Cyclical under the Business-Type Method Map, and `business-model/07_business-quality.md` scores its cyclicality factor 65/100 — "packaged food/snacking has historically been a defensive, low-macro-cyclicality category for this company," with revenue growing every fiscal year from FY2017 through FY2025 and the current decline attributed by management to **brand-specific** (Atkins) distribution losses, not a macro downturn. There is no prior recession-driven down-cycle in the company's own history to anchor a trough to (nor a clean predecessor/segment history — Atkins itself pre-dates the 2017 reverse-merger, but no standalone financials for that era exist in the pool). The operating Bear above is therefore built from the earnings-sensitivity module's own "further deterioration from the current documented trough" inputs (`earnings/07_earnings-sensitivity.md` §2), not a cyclical-trough construct — the correct methodology given this business is not evidenced to be macro-cyclical.

## 4. Margin of Safety & Downside (two separate metrics)

| Metric | Value |
|---|---:|
| Current price | $11.33 (close, Aug-04-2026, pool-verified) |
| Base-case fair value (point) | $15.27 |
| Bear-case fair value (headline, operating) | $8.42 |
| Bear-case fair value (structural reset / avoid-ruin floor) | $13.09 |
| Implied upside to base case = (base FV − price) / price | **+34.8%** |
| **Margin of safety** = (base FV − price) / base FV — the cushion | **25.8%** |
| **Downside to bear** = (price − bear FV) / price — *inverted: higher = worse* (using the headline $8.42 bear) | **25.7%** |

```
margin_of_safety = (15.27-11.33)/15.27 = 0.258 -> 25.8%
implied_upside    = (15.27-11.33)/11.33 = 0.348 -> 34.8%
downside_to_bear   = (11.33-8.42)/11.33 = 0.257 -> 25.7%
```

These are two different numbers, not restatements of one another: the cushion to the base case (25.8%) and the loss to the headline bear case (25.7%) happen to land close in magnitude here, but they measure different things — one is a discount to a fair-value point, the other is a loss from today's price. Neither substitutes for the other.

**A note the reader should not skip:** the structural-reset avoid-ruin floor ($13.09) sits *above* today's price ($11.33, +15.5%) — even SMPL's own labeled permanent-impairment scenario does not currently price in downside from the current level. This is consistent with `05_reverse-dcf.md`'s independent finding that the market is pricing in a decline path (−9.08%/yr FCF for 6 straight years) more severe than even `04`'s own structural-bear input.

## 5. Warranted-Multiple Check

The base-case fair value implies a **7.77x EV/NTM-Adjusted-EBITDA** multiple — below the peer median (8.72x), below BellRing's own 8.39x, and far below SMPL's own 5-year historical mean (14.81x, explicitly rejected as achievable by `02`). Given `business-model/07_business-quality.md`'s 40/100 (Weak) aggregate quality score, a "No moat proven" verdict with an explicitly "eroding" trajectory (`business-model/09_moat.md` §5), and LTM revenue growth of −4.5% against a peer median of +0.3%, a sub-peer-median multiple is what the evidence supports — this is not a case of upside requiring a multiple the business has never earned. The bull case's 8.70x multiple asks for less than that: it requires the currently-observed 18% quality discount to close, not for SMPL to reach a premium above its category peer. No unaligned-controlling-owner value-trap flag applies (`management-governance` confirms RF-OWN-004 / §24 Filter 6 is Not Applicable — SMPL is widely held, largest holder BlackRock at ~14.8% passive [`02_multiples-own-history.md` §5]), so persistent cheapness here is read as a fundamentals-driven discount to be tested against evidence, not an ownership-driven trap.

## 6. Fair-Value Read

Base-case fair value is **$15.27/share** (+34.8% vs. the $11.33 price; 25.8% margin of safety), bracketed by a **bull of $21.98** (a proven-turnaround case, +94.0% vs. price) and a **headline bear of $8.42** (a "turnaround stalls" 12-month deterioration case, −25.7% downside to bear) — with a separately-labeled structural-reset/avoid-ruin floor of **$13.09** that, notably, still sits above today's price. The two value-producing methods — peer-relative ($13.76) and intrinsic DCF ($17.53) — agree within 27%, both above the current price; the much wider apparent dispersion in the football field ($33–$51 from `02`'s own-history reversion) is explicitly disclaimed by its own producer and does not drive the base point. The intrinsic DCF is the marginally larger swing factor in the blend (40% weight, terminal-value-heavy at 66.4% of EV), but it is corroborated by an independent exit-multiple cross-check ($16.91) and by the reverse-DCF finding that today's price already embeds a deeper, more sustained decline (−9.08%/yr FCF for 6 years) than the company's own guidance shape or `04`'s own bear case supports. The single biggest swing factor between bull and bear is **whether the September-2026 price increase lands with volume losses at or below management's own stated elasticity assumption, and whether Quest's growth (63.7% of sales) re-accelerates or the current bar-category softness deepens** — both variables move the operating case by double-digit millions of Adjusted EBITDA in either direction and are unresolved as of this run.
