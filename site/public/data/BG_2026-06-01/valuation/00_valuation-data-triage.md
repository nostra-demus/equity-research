# Valuation Data Triage — BG

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Valuation Relevance |
|---|---|---|---|---|
| bunge_10k.txt | Annual filing (10-K, text) | FY2025 (FY ended Dec-31-2025; FY23–FY25 comparatives) | 2026-05-11 | High |
| bunge-2025-annual-report.pdf | Annual report (PDF) | FY2025 | 2026-05-11 | High |
| bunge_10q.txt | Quarterly filing (10-Q, text) | Q1 FY2026 (qtr ended Mar-31-2026) | 2026-05-11 | High |
| bunge 10q.pdf | Quarterly filing (10-Q, PDF) | Q1 FY2026 | 2026-05-11 | High |
| q1-2026-earnings-release.pdf | Earnings release | Q1 FY2026 | 2026-05-11 | High |
| q1_call.txt | Transcript (earnings call, text) | Q1 FY2026 (Apr 29, 2026 call) | 2026-05-11 | High (forward guidance) |
| q1-2026-bunge-limited-earnings-conference-call.pdf | Transcript (PDF) | Q1 FY2026 | 2026-05-11 | High |
| Consensus.xlsx | Consensus/estimate export (Capital IQ) | Estimates incl. FY26/27/28; target price 142 mean | 2026-05-09 | High |
| Multiples.xlsx | Multiples export (Capital IQ) | NTM / FY26 / FY27 / FY28 (TEV/REV, TEV/EBITDA, TEV/EBIT, P/E, PEG, P/BV) | 2026-05-09 | High |
| Guidance.xlsx | Management guidance export (Capital IQ) | Guided FY series incl. FY2026 | 2026-05-09 | Medium |
| Revisions.xlsx | Estimate-revisions export (Capital IQ) | FQ2 2026 → FY2028 (EPS Normalized) | 2026-05-09 | Medium |
| Trends.xlsx | Estimate-trends export (Capital IQ) | FQ2 2026 → FY2028 (current vs 1/2 mo ago) | 2026-05-09 | Medium |
| Surprise.xlsx | Beat/miss-history export (Capital IQ) | EPS Normalized history (2000→present) | 2026-05-09 | Low |
| Recent Changes.xlsx | Broker-change log (Capital IQ) | Recent broker revisions, FY2026 | 2026-05-09 | Low |

Notes: PDF and .txt versions of the 10-K, 10-Q and Q1 call are duplicates of the same source in two formats; the .txt versions are the working copies. All seven .xlsx files are Capital IQ Estimates exports for Bunge Global SA (NYSE:BG), USD, US GAAP, data as of 2026-05-09.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing | bunge_10k.txt (= bunge-2025-annual-report.pdf) | FY2025 (Dec-31-2025) | ~5 |
| Quarterly filing | bunge_10q.txt (= bunge 10q.pdf) | Q1 FY2026 (Mar-31-2026) | ~2 |
| Capital structure / balance sheet | bunge_10q.txt (10-Q balance sheet) | As of Mar-31-2026 | ~2 |
| Consensus / estimate export | Consensus.xlsx | Data as of 2026-05-09 | <1 |
| Multiples export | Multiples.xlsx | Data as of 2026-05-09 | <1 |
| Peer / comps export | None in pool | — | — |
| Current price (IBKR / Capital IQ) | None in pool (see note) | — | — |
| Cash flow statement | bunge_10k.txt (FY23–FY25) + bunge_10q.txt (Q1 FY26) | Through Mar-31-2026 | ~2 |
| Segment data | bunge_10k.txt (segment Note + MD&A) | FY2025 | ~5 |

Note on current price: there is NO standalone IBKR/Capital IQ price file or screenshot. The only share price in the pool is a stale grant-date reference — "Bunge's closing share price on the NYSE as of July 2, 2025 of $81.39 per share" (bunge_10k.txt, line 5519) — ~11 months old and not usable as a current price. The Capital IQ Multiples are "Based on Market Price" as of 2026-05-09, but no explicit current-price field was provided. The mean analyst target price is $142 (range 116–150), a target not a current price.

## 3. Valuation Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Current price | N | No price file; only stale $81.39 grant-date ref [line 5519, as of Jul-2-2025] | Anchor for market cap, EV, multiples, margin of safety |
| Diluted share count | Y | 194,018,115 registered shares o/s [10-Q cover, Apr-27-2026]; diluted WA 195,733,665 [10-Q Note 18] | Market cap and per-share fair value |
| Dilution data | Y (partial) | RSU/PBRSU disclosures + diluted EPS reconciliation [10-K ~line 8107; 10-Q Note 18] | Fully diluted per-share fair value |
| Business type track | Y | Commodity/cyclical Operating company — agri-commodity processor/merchandiser [segment Note, lines 274–401] | Determines valid valuation methods |
| Total debt, cash, minority/preferred | Y | ST debt 3,245 + current LT 1,361 + LT debt 9,947; cash; NCI 1,381; redeemable NCI 51 [10-Q balance sheet, lines 204–225] | EV bridge |
| Income statement (LTM or FY) | Y | FY23–FY25 + Q1 FY26 / Q1 FY25 | Earnings/EBITDA base |
| Cash flow statement | Y | CFO, capex (FY25 $1,723M) [10-K lines 4827–4859]; Q1 FY26 in 10-Q | FCF base for DCF and FCF yield |
| Forward estimates (consensus) | Y | FY26/27/28 EPS, EBITDA, revenue [Consensus/Trends/Revisions, 2026-05-09] | NTM/FY multiples and DCF near-term path |
| Historical multiple data | Y (partial) | Forward NTM/FY26–28 multiples [Multiples.xlsx]; no long historical own-multiple series | Own-history re-rating read |
| Peer / comps data | N | No peer/comps export in pool | Relative valuation and SOTP segment multiples |
| Segment-level revenue & EBIT | Y | 4 reportable segments + Corporate & Other, with segment EBIT [segment Note, lines 274–401] | Sum-of-the-parts |
| Dividend / buyback data | Y | Quarterly dividend $0.70/sh; repurchase program expanded Nov-13-2024, authorized to Oct-19-2028 [lines 1937–2002, 3060] | Shareholder-yield read |

## 4. Cross-Module Availability

At triage time the current run path `analyses/BG_2026-06-01/` did not yet contain business-model or earnings outputs. Within this `/research:full` run those modules complete first, so their outputs become available at the current-run path before this module's Layer 1.

| Cross-Module Output | Available? (Y/N) at triage |
|---|---|
| business-model/03_segment-map.md | N at triage (populated before valuation Layer 1) |
| business-model/08_competitive-map.md | N at triage (same) |
| business-model/07_business-quality.md | N at triage (same) |
| business-model/09_moat.md | N at triage (same) |
| business-model/10_external-dependency.md | N at triage (same) |
| earnings/01_historical-financials.md | N at triage (same) |
| earnings/04_guidance-consensus.md | N at triage (same) |
| earnings/03_margin-drivers.md | N at triage (same) |
| earnings/07_earnings-sensitivity.md | N at triage (same) |
| earnings/06_earnings-quality.md | N at triage (same) |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No current price | Y | 01, 05, 07, 99 | MoS "Not assessable"; valuation confidence max 55; reverse-DCF cannot solve "what's priced in"; 07 outputs fair-value levels with NO observed up/downside % |
| No consensus / forward estimates | N | — | Not triggered — full Capital IQ consensus set present |
| No peer data | Y | 03, 06 | Overall usefulness max 70; relative valuation runs on own forward multiples only; SOTP segment multiples must be comparable-justified or low-confidence |
| No segment-level data | N | — | Not triggered — 4-segment EBIT detail present |
| No balance sheet / capital structure | N | — | Not triggered — full Q1 FY26 balance sheet present |
| No cash flow statement | N | — | Not triggered — FY23–FY25 + Q1 FY26 cash flow present |

Note on the no-price cap: MODULE_RULES permits an indicative web-sourced current price ONLY if explicitly labeled "Indicative price, web-sourced as of {DATE}, not from data pool — unverified," with the limitation propagated. If `01` does not source such a quote, the no-current-price caps bind in full and margin of safety is "Not assessable." This is a Partial condition, not Insufficient.

## 6A. Method Readiness Matrix

| Method | Ready? (Y/N) | Blocking Missing Inputs | Notes |
|---|---|---|---|
| Own-history multiples | Y (partial) | No long own-multiple time series | Forward multiples (NTM/FY26–28) available; long-run re-rating limited |
| Peer relative valuation | Y (partial) | No peer/comps export | Runs on BG's own forward multiples; peer set must be justified (low-confidence) |
| Intrinsic DCF (Operating FCFF) | Y | None blocking | Full IS + BS + CFS + consensus present. Cyclicality gate: use a mid-cycle margin band |
| Reverse DCF | N (price-blocked) | Current price | Runnable only if 01 supplies a clearly-labeled indicative web price |
| SOTP | Y (partial) | Segment comparable multiples | 4 segments with EBIT present; segment multiples comparable-justified or low-confidence |

## 6. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** A usable earnings/cash-flow base, full capital structure, segment-level EBIT, and a complete forward-consensus set are present, so at least four valuation methods can run — but no current-price source and no peer/comps export are in the pool.
- **Methods that can run:** own-history multiples (forward-weighted), peer relative valuation (low-confidence without a peer export), intrinsic FCFF DCF (mid-cycle margin band given commodity cyclicality), and SOTP. Reverse-DCF cannot run unless `01` supplies an indicative, clearly-labeled web price.
- **Active partial-data caps:** No current price → margin of safety "Not assessable"; valuation confidence max 55; reverse-DCF unrunnable; 07 expresses targets as fair-value levels with no observed up/downside. No peer data → overall usefulness max 70; relative valuation and SOTP segment multiples low-confidence. Cyclicality gate → DCF must use a normalized mid-cycle margin band.
- **Critical missing items:** current price as of ~2026-06-01 (single highest-value missing input — unlocks margin of safety and reverse-DCF); a peer/comps multiples export (ADM, Ingredion, other agri-processors) to anchor relative valuation and SOTP segment multiples.