# balance-sheet-survival Module Dossier — UBER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `balance-sheet-survival_memo.md`.

- Generated: 2026-08-06T16:45:27Z
- Module folder: `balance-sheet-survival`
- Contents: 1 module synthesis + 7 specialist outputs = 8 files

## Table of Contents

- [balance-sheet-survival — module synthesis](#balance-sheet-survival-module-synthesis) — `99_balance-sheet-survival-synthesis.md`
- [balance-sheet-survival / 00_solvency-data-triage.md](#balance-sheet-survival-00-solvency-data-triage-md) — `00_solvency-data-triage.md`
- [balance-sheet-survival / 01_capital-structure-and-leverage.md](#balance-sheet-survival-01-capital-structure-and-leverage-md) — `01_capital-structure-and-leverage.md`
- [balance-sheet-survival / 02_maturity-wall-and-refinancing.md](#balance-sheet-survival-02-maturity-wall-and-refinancing-md) — `02_maturity-wall-and-refinancing.md`
- [balance-sheet-survival / 03_liquidity-runway.md](#balance-sheet-survival-03-liquidity-runway-md) — `03_liquidity-runway.md`
- [balance-sheet-survival / 04_coverage-and-covenants.md](#balance-sheet-survival-04-coverage-and-covenants-md) — `04_coverage-and-covenants.md`
- [balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md](#balance-sheet-survival-05-off-balance-sheet-and-contingencies-md) — `05_off-balance-sheet-and-contingencies.md`
- [balance-sheet-survival / 06_downside-stress-test.md](#balance-sheet-survival-06-downside-stress-test-md) — `06_downside-stress-test.md`


---

## balance-sheet-survival — module synthesis

_Source: `99_balance-sheet-survival-synthesis.md`_

# Balance-Sheet-Survival Module — UBER (Synthesis)

## Abstract

Uber's disclosed balance sheet is strong today: net leverage of 1.32x GAAP EBITDA (0.98x on Adjusted EBITDA) against $9,861mm of strict net debt, falling steadily through FY2023–FY2025 before rising again in H1 FY2026 on new debt issuance. The maturity wall is thin through 2027 (14.8% of debt due within 12 months) and self-funded by cash and free cash flow alone. Liquidity has no finite runway — $10,059mm of committed cash, investments, and undrawn revolver plus a $10,116mm annual free-cash-flow surplus exceed even a full EBITDA wipeout, though the tightest covenant is an unfiled, labeled assumption. The real break point is forward-looking: the near-certain, signed-not-closed Delivery Hero acquisition, financed by a roughly €14 billion bridge facility with no disclosed covenant terms, would push pro-forma leverage to 2.6x–3.5x current EBITDA (5.0x–6.6x mid-cycle) and could breach an assumed 3.5x covenant at an EBITDA decline of as little as 0.9%–25.5% once drawn. Verdict: Adequate, capped by undisclosed covenant terms and a growing $5.6 billion contingent tax exposure.

## 1. Solvency Verdict

- **Verdict:** Adequate
- **Net leverage (net debt / EBITDA):** 1.32x on Reported/GAAP EBITDA ($7,474mm LTM), 0.98x on Adjusted EBITDA ($10,043mm LTM); net debt (strict basis, canonical) = $9,861mm at Jun-30-2026 [`01`]. Gross debt/EBITDA is 1.97x (GAAP) / 1.47x (Adj.) on gross debt of $14,731mm [`01`]. On a normalised/mid-cycle EBITDA base (FY2023–FY2025 3-yr avg, a scaling-stage floor-check, not a clean cyclical trough), net leverage reads 2.51x (GAAP) / 1.54x (Adj.) [`01` §5].
- **Liquidity runway:** No finite runway — an annual FCF surplus of ~$7,941mm over 12-month obligations, on top of $10,059mm of already-in-hand committed liquidity that alone would fund ~41 months of debt service, interest, capex, and returns crediting zero operating cash flow [`03`].
- **Maturity wall (% within 24 months):** 15.1% ($2,223mm of $14,731mm); 14.8% within 12 months. Covered 2.2x by cash alone and ~4.6x by committed liquidity before any FCF is counted [`02`, `03`].
- **Tightest covenant + headroom:** Not assessable — no maintenance-covenant disclosure exists anywhere in the pool. Indicative-only, labeled-assumption headroom on an assumed 3.5x max-net-leverage covenant is +62% (GAAP) / +72% (Adj.), but this is Inference, not from filings [`04`].
- **Stress break point (EBITDA decline that breaks it):** On the disclosed balance sheet, the assumed covenant does not breach until a 62.3% (GAAP) / 71.9% (Adj.) EBITDA decline, and committed liquidity plus FCF never exhausts on an EBITDA decline alone. **Once the pending Delivery Hero acquisition closes and the ~€14bn bridge facility is drawn**, the same assumed covenant would breach at an EBITDA decline of just 25.5% (consideration-only, GAAP) to 0.9% (full-bridge, GAAP) — a normal 30–40% recession breaches it in three of four modeled pro-forma combinations [`06`].
- Solvency strength /100: 65 *(capped at 75 — off-balance-sheet exposures undisclosed for a litigious/levered name; scored below the cap for the undisclosed pending-acquisition covenant risk)*
- Liquidity runway /100: 88
- Refinancing risk /100 *(higher = worse)*: 35
- Covenant headroom /100 *(or "Not assessable")*: Not assessable
- Downside resilience /100 *(or "Not assessable")*: 68
- Data quality /100: 76
- Overall usefulness /100: 75 *(capped — no covenant disclosure)*
- Biggest solvency risk (one line): The near-certain Delivery Hero acquisition (signed 2026-07-16, ~€14bn bridge facility, no disclosed covenant terms) would compress a currently wide covenant cushion (+62–72% headroom) to near-zero (0.9–25.5% breach threshold) once drawn.

## 1A. Module Disconfirmation

- **Strongest bear point:** Pro-forma Delivery Hero leverage on a mid-cycle EBITDA base runs 5.0x–6.6x GAAP, and an assumed 3.5x covenant could breach at an EBITDA decline of just 0.9% (full-bridge draw) to 25.5% (consideration-only) — a normal recession breaches it in three of the four pro-forma combinations modeled [`06` §3, §4].
- **Strongest bull point:** On the disclosed balance sheet, committed liquidity ($10,059mm) plus LTM free cash flow ($10,116mm, cash-backed — CFO has exceeded Adjusted EBITDA every year since FY2023) never exhausts under any EBITDA haircut modeled, including a full 100% wipeout; the near-term wall is covered ~4.6x by liquidity alone before FCF is counted [`03`, `06` §4].
- **Single killer risk:** The undisclosed covenant package on the ~€14bn Delivery Hero bridge facility, combined with the near-certain draw — the exact term that determines whether an ordinary downturn breaches the credit once the deal closes [`00` §5; `04` §2; `06` §3].
- **Disconfirming evidence already visible:** gross debt rose $2,429mm in H1 FY2026 to $14,731mm, with $1,997mm of new short-term debt appearing on the balance sheet with no instrument-level disclosure anywhere in the pool [`01` §1; `02` §1]; the gross unrecognized tax benefit rose $674mm (+13.7%) YoY to $5,611mm and is not separately broken out from Other Non-Current Liabilities, triggering `RF-OBS-001` [`05` §3–5].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| solvency-data-triage | Partial sufficiency verdict | Core triad (balance sheet, instrument-level debt note, cash flow statement) is fully present and current through Jun-30-2026; the single gap keeping the verdict at Partial is covenant disclosure — no credit agreement, indenture, or covenant summary is anywhere in the pool [`00`] |
| capital-structure-and-leverage | Net leverage 1.32x GAAP / 0.98x Adj.; not net cash | Gross debt rose $2,429mm in H1 FY2026 to $14,731mm with no instrument-level breakout for the increase; the ~€14bn Delivery Hero bridge facility is signed but not reflected in any balance-sheet figure [`01`] |
| maturity-wall-and-refinancing | Self-funded, low refi risk for the disclosed 24-month wall | 14.8% of debt due within 12 months is covered >4x by cash alone; the real forward refinancing risk is the undisclosed, unidentified $1,997mm of new short-term debt and the pending ~€14bn DH bridge, not the disclosed bond ladder [`02`] |
| liquidity-runway | No finite liquidity runway — FCF surplus | $10,059mm committed liquidity + $10,116mm LTM FCF surplus dwarfs $2,945mm of 12-month obligations; the pending DH bridge (1.6x the size of the entire current liquidity pool) is not reflected in this runway at all [`03`] |
| coverage-and-covenants | Coverage strong (16.18x–21.74x EBITDA/interest); covenant headroom Not assessable | An illustrative full DH-bridge draw would land pro-forma leverage almost exactly at an assumed 3.5x covenant threshold (~0% indicative headroom, GAAP basis) [`04`] |
| off-balance-sheet-and-contingencies | Contingent exposure ≥$6,414mm, 22.6% of equity; `RF-OBS-001` fired | $5,611mm gross unrecognized tax benefit grew 13.7% YoY and is not separately broken out on the balance sheet; no dedicated commitments-and-contingencies note exists anywhere in the pool [`05`] |
| downside-stress-test | Fortress on the current disclosed balance sheet; does not clearly survive a 30–40% decline once the DH bridge is drawn | The pro-forma covenant-breach point collapses from a 62.3–71.9% EBITDA decline today to 0.9–25.5% once the acquisition closes and the bridge is drawn [`06`] |

## 3. Reconciliation

`04_coverage-and-covenants.md` flags an unresolved ambiguity in the $1,997mm jump in "Current Portion of Long-Term Debt" at Jun-30-2026 (from $307mm of lease obligations only at FY2025 year-end): it may represent real new short-term debt, or it may be a US-GAAP mechanical reclassification of the $1,725mm 2028 Convertible Notes to current if they became currently convertible (which typically settles in equity, not cash, and would not represent a genuine near-term cash outflow). `02_maturity-wall-and-refinancing.md` does not resolve this ambiguity either — it treats the full $1,997mm as real, unidentified short-term debt (the more conservative reading) for maturity-wall and liquidity-coverage purposes. This synthesis adopts the same conservative treatment: the $1,997mm is counted as a genuine near-term obligation throughout Sections 1–2 above, even though the true cash impact could be smaller if the convertible-reclassification explanation is correct. This does not change the survival conclusion — the wall is covered several times over either way — but the underlying instrument composition remains genuinely unresolved in this data pool.

No other material disagreements between specialists were found; `02` through `06` all build directly on `01`'s canonical net-debt and EBITDA figures without contradiction.

## 3A. Fragility Map (what breaks first)

| Fragility Driver | Indicator | Current Status | Why It Matters |
|---|---|---|---|
| Maturity concentration | % due within 24m | 15.1% ($2,223mm), covered ~4.6x by committed liquidity alone [`02`, `03`] | Wall risk is low today, but $1,997mm of the near-term bucket is unidentified by instrument [`01`, `02`] |
| Availability liquidity | Usable liquidity vs. uses | $10,059mm committed vs. $2,945mm 12-month uses (3.4x); revolver availability figure is stale by ~4 months (Mar-31-2026) [`03`] | Revolver reality: not independently confirmed as "committed" in the pool (no credit agreement present) [`03` §1] |
| Covenant illusion risk | Covenant EBITDA vs. reported | No covenant-EBITDA definition disclosed; Uber's own Adjusted EBITDA runs 34.4% above GAAP EBITDA, ~25% of that bridge unitemized [`04` §2] | Addback risk: any future covenant-EBITDA definition tracking Adjusted EBITDA could overstate true headroom by an unquantified margin |
| Floating-rate sensitivity | Floating % net of hedges | 0% of drawn debt is floating (100% fixed); the pending ~€14bn DH bridge facility's rate structure and hedges are undisclosed [`01`, `02` §3] | Rate shock: a +200bp move reprices nothing outstanding today, but bridge facilities are conventionally floating and would add ~$193–321mm/yr once drawn [`06` §3] |
| Structural subordination | HoldCo debt vs. upstreaming | Not applicable — no material HoldCo-level debt; all instruments issued at the single reporting entity [`01` §6A] | Trapped value: not a live risk on current evidence, though no dedicated corporate-structure/guarantor note confirms this affirmatively |
| Contingent accelerants | CoC puts / cross-default | Not disclosed on Uber's own bond/revolver documentation; the DH deal itself carries a €700mm (Uber)/€200mm (Delivery Hero) reciprocal termination fee [`00` §3; `05` §1] | Fast failure: change-of-control and cross-default triggers on the existing bond stack remain a genuine unknown |

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No debt maturity schedule | N | — | Not applicable — instrument-level maturity schedule is present [`00`, `02`] |
| No covenant disclosure | **Y** | Covenant headroom; Overall usefulness | Covenant headroom = "Not assessable"; Overall usefulness max 75 |
| No cash flow statement | N | — | Not applicable — cash flow statement present through LTM Jun-30-2026 [`00`, `03`] |
| Only annual data (no interim) | N | — | Not applicable — Q2 FY2026 interim balance sheet, income statement, and cash flow are all present |
| No EBITDA base (stress not run) | N | — | Not applicable — stress test ran fully on both GAAP and Adjusted EBITDA [`06`] |
| Off-balance-sheet exposures undisclosed for a known-litigious/levered name | **Y** | Solvency strength | max 75 (module-specific cap, `MODULE_RULES.md` Score Cap Rules) |
| Covenant headroom relies on assumed covenant-EBITDA addbacks | **Y** (superseded — see above) | Covenant headroom | Already "Not assessable"; this cap would separately have limited it to max 60 |
| HoldCo has material debt but upstreaming constraints unclear | N | — | Not applicable — no material HoldCo-level debt evidenced [`01` §6A] |

The most restrictive applicable cap for each score is used above; no conflicts required resolution beyond the covenant-headroom row.

## 5. Survival Summary

Uber's leverage trend is genuinely improving on the numbers as reported: net debt fell from $7,022mm (FY2023) to $5,197mm (FY2025) as EBITDA scaled, before reversing sharply in H1 FY2026 to $9,861mm on new debt issuance tied to pre-funding the Delivery Hero stake purchase — so the direction is currently up, not down, even before the acquisition itself closes. The near-term maturity wall is self-funded, not refinancing-dependent: 14.8% of debt due within 12 months is covered several times over by cash and committed liquidity alone, and the FY2028 cluster ($2,850mm) is over two years away. The liquidity runway has no finite exhaustion point under current obligations — committed liquidity plus free cash flow exceed even a complete EBITDA wipeout — but the tightest covenant cannot be verified because no covenant disclosure exists anywhere in the pool; the +62–72% headroom shown is a labeled assumption, not a filed fact. The stress break point on the disclosed balance sheet is deep (a 62–72% EBITDA decline before the assumed covenant breaks), so a normal 30–40% recession is comfortably survivable **as currently constituted**. That conclusion inverts once the Delivery Hero acquisition closes and the roughly €14 billion bridge facility is drawn: pro-forma leverage on Uber's own mid-cycle EBITDA runs 5.0x–6.6x, and the same assumed covenant would need only a 25.5% (consideration-only) to 0.9% (full-bridge) EBITDA decline to breach — meaning a normal recession would likely require lender accommodation (a covenant waiver or amendment) rather than trigger a liquidity crisis, since liquidity itself stays deep in every pro-forma scenario modeled.

## 6. What Would Change The Solvency Verdict?

| Current Verdict | What Would Strengthen It | What Would Weaken It | Data Needed |
|---|---|---|---|
| Adequate | The Delivery Hero bridge facility's actual covenant package showing meaningful headroom post-draw; confirmation the $1,997mm current-debt jump is a non-cash convertible-note reclassification rather than real short-term debt; a dedicated commitments-and-contingencies note showing the $5,611mm UTB is fully accrued and the litigation/classification exposures are immaterial | Full €14bn bridge draw combined with a normal recession-scale EBITDA decline (which the pro-forma stress shows would breach an assumed covenant); the DH deal falling through and triggering the €700mm break fee at the same time as an operating downturn; a confirmed covenant breach or waiver requirement disclosed post-close | The bridge facility's actual covenant terms and definitions (single highest-value document); an updated, instrument-level Q2/Q3 FY2026 debt note explaining the $2,429mm gross-debt increase; a dedicated commitments & contingencies note |

## 6A. Survival Playbook (non-speculative levers)

- **Discretionary buyback throttling — already evidenced:** management deployed ~50% of FCF toward buybacks historically but cut this by ~$4bn in Q2 FY2026 specifically to fund the pre-deal Delivery Hero stake purchase, demonstrating the buyback is genuinely discretionary and has already been used as a cash-conservation lever once [`01` §6; `03` §4].
- **No dividend obligation:** Uber has never paid a dividend in any period shown (FY2021–LTM), so there is no contractual dividend commitment competing for cash in a downturn [`03` §2].
- **Equity-method stake as a potential asset-sale lever:** `06_downside-stress-test.md` names a partial sale of the ~$3.8bn of AV-partner equity-method stakes already on the balance sheet as a possible source of accelerated pay-down post-DH-close — this is the stress-test agent's own labeled option, not a company-announced program [`06` §5].
- **No announced asset-sale program for debt reduction:** not disclosed in the pool — the AV-stake option above is inference, not an evidenced management commitment [`05` §1].
- **No evidenced covenant-amendment history:** cannot be assessed — no covenant package (existing or pending) is disclosed anywhere in the pool, so there is no track record of amendments or waivers to draw on [`00` §5; `04` §2].

## 7. Note To The Final Synthesizer

- Leverage direction: net debt fell FY2023→FY2025 ($7,022mm → $5,197mm) as EBITDA scaled, then rose sharply in H1 FY2026 to $9,861mm on new debt issuance tied to pre-funding the Delivery Hero stake. Current net leverage is 1.32x GAAP EBITDA / 0.98x Adjusted EBITDA (gross debt/EBITDA 1.97x / 1.47x) — low by either measure, but the direction over the last two quarters is up, not down.
- Maturity wall: thin and self-funded through 2027 (14.8% within 12 months, 15.1% within 24 months), covered several times over by cash and committed liquidity alone. No refinancing dependence on the disclosed ladder. The real forward wall event is the pending Delivery Hero bridge facility, not the bond schedule.
- Liquidity runway: no finite runway — depends almost entirely on cash and committed liquidity already in hand ($10,059mm), with FCF ($10,116mm LTM, cash-backed) as a bonus buffer rather than a load-bearing assumption.
- Tightest covenant: **undisclosed** — no credit agreement, indenture, or covenant-threshold summary exists anywhere in the pool. The +62–72% headroom figure used in stress testing is a labeled assumption (Inference, not from filings), not a filed fact.
- Largest live off-balance-sheet / contingent exposure: `RF-OBS-001` (contingent-liability spike) — total contingent exposure of at least $6,414mm (22.6% of Jun-30-2026 total equity), driven by a $5,611mm gross unrecognized tax benefit that grew 13.7% year-over-year and is not separately broken out from Other Non-Current Liabilities on the balance sheet, plus a live €700mm (~$803mm) Delivery Hero termination fee, an active wrongful-death lawsuit, and an unquantified driver-classification risk category.
- Stress break point: on the disclosed balance sheet, the assumed covenant does not breach until a 62–72% EBITDA decline and liquidity never exhausts on an EBITDA decline alone. **Once the Delivery Hero acquisition closes and the bridge is drawn, the same assumed covenant would breach at just a 0.9%–25.5% EBITDA decline** — a normal 30–40% recession breaches it in three of four pro-forma combinations modeled. This is a leverage-covenant risk, not a liquidity risk — liquidity stays deep in every pro-forma scenario.
- Partial-data caps applied: covenant headroom is "Not assessable" (no covenant disclosure in the pool); overall usefulness capped at 75; solvency strength capped at 75 (off-balance-sheet exposures undisclosed for a litigious/levered name).
- Biggest missing data point / single highest-value next data request: the credit agreement or bond indenture covenant package for Uber's existing debt, **and** the term sheet for the pending ~€14bn Delivery Hero bridge facility (maintenance-covenant thresholds, covenant-EBITDA definition, rate structure, hedging) — this single category of document would resolve the covenant-headroom gap and pin down the exact pro-forma breach point that currently depends on a labeled assumption.
- **Explicit handoff:** the master synthesizer's "Balance Sheet and Survival Test" section should defer to this synthesis; the stress break points here (62–72% on the current balance sheet, collapsing to 0.9–25.5% once the Delivery Hero bridge is drawn) are the inputs for the master's downside scenario and risk register — this module does not assign probabilities to the deal closing or to any EBITDA-decline scenario.

## 8. Simple Summary

- Uber owes $14,731mm gross debt and $9,861mm net debt (net of cash only) as of Jun-30-2026 — leverage is 1.32x this year's earnings (GAAP EBITDA) or 0.98x on its own adjusted measure, both low.
- The next big bond maturity is FY2028 ($2,850mm); everything due in the next 12 months (14.8% of the debt pile) is covered by cash alone more than twice over.
- Liquidity has no set end date — cash, safe investments, and an undrawn credit line ($10,059mm) plus a year of free cash flow ($10,116mm) cover everything the company owes over the next year several times over.
- The tightest debt covenant cannot be checked — no lender agreement showing the actual threshold is in the data pool, so the "how close to breaking" figure used here is a labeled guess, not a filed fact.
- The biggest hidden risk is a $5,611mm unresolved tax dispute (growing 13.7% a year) plus a €700mm break fee tied to the pending Delivery Hero deal — together over a fifth of shareholders' equity.
- The company survives even a 100% collapse in earnings on cash and liquidity alone today — but that changes once the ~€14 billion Delivery Hero acquisition loan is actually drawn, at which point a normal recession (30–40% earnings drop) would likely trip an assumed loan covenant.
- A current credit rating was available (S&P BBB+, investment grade), but the key gap is the loan-covenant terms — for both Uber's existing debt and the new Delivery Hero loan.
- This module is useful for the master synthesizer: the current-balance-sheet read is solid, but the real story is the forward Delivery Hero leverage risk, which is not yet in any reported number.



---

## balance-sheet-survival / 00_solvency-data-triage.md

_Source: `00_solvency-data-triage.md`_

# Solvency Data Triage — UBER

**Scope note:** No primary SEC filing (10-K / 10-Q / 8-K) is physically present in `data/UBER/`. Every balance-sheet, debt, and cash-flow figure below is sourced from Capital IQ's vendor transcription of Uber's filings (source-hierarchy tier 5, CLAUDE.md §4) and is cited as "CIQ export," never as "10-K" or "10-Q." The verbatim Q2 FY2026 earnings-call transcript (Aug-05-2026) is a primary call record and is cited as such. This is consistent with the read already established by `business-model/00_data-triage.md` and `earnings/00_earnings-data-triage.md` for this same pool — carried forward here, not re-litigated. `_pool_extracts/manifest.json` reports **0 extraction failures** across all 5 workbooks / 37 tabs and 8 non-workbook documents — every document listed below is genuinely present and readable; nothing is a bad extraction.

## 1. File Inventory

Every file's on-disk "last modified" timestamp is **2026-08-06** for all 13 source files — this is the Drive-sync date, not the document's real period (CLAUDE.md §27 fix F23). Period Covered below is parsed from **inside** each document/tab.

| Filename | Type | Period Covered | Last Modified (sync date — not authoritative) | Solvency Relevance |
|---|---|---|---|---|
| Charting Excel Export Aug-05-2026 2_49 PM.xls — tab "Chart 1 with Data" | Workbook tab (284×2) | Price/volume history, multi-year through Aug-2026 | 2026-08-06 | Low |
| Charting Excel Export Aug-05-2026 2_49 PM.xls — tab "Attributions" | Workbook tab (45×1) | n/a (data-source credits) | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Financial Data" | Workbook tab (50×17) | LTM / recent annual peer financials | 2026-08-06 | Medium |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Trading Multiples" | Workbook tab (50×9) | As of 2026-08-06 | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Operating Statistics" | Workbook tab (50×13) | LTM | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Business Description" | Workbook tab (44×3) | n/a (descriptive) | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Implied Valuation" | Workbook tab (69×9) | As of 2026-08-06 | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Valuation Chart" | Workbook tab (32×2) | As of 2026-08-06 | 2026-08-06 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Credit Health Panel" | Workbook tab (47×10) | As-of 2026-08-06; LTM ending 2026-06-30; financials updated 2026-08-05 | 2026-08-06 | **High** — Overall/Operational/Solvency/Liquidity credit-health ranks vs peer comp set, plus S&P Issuer Credit Rating (BBB+) |
| Company Comparable Analysis Uber Technologies Inc.xls — tab "Disclaimer" | Workbook tab (26×1) | n/a | 2026-08-06 | Low |
| Company_Comparable_Analysis_Uber_Technologies _Inc.rtf | RTF (comp-set summary) | As of 2026-08-06 | 2026-08-06 | Medium |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | RTF | As of 2026-08-06 | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Board Members.rtf | RTF | As of 2026-08-06 | 2026-08-06 | Low (governance, not solvency) |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Key Stats" | Workbook tab (91×9) | As of 2026-08-05 | 2026-08-06 | Medium |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Income Statement" | Workbook tab (118×7) | FY2021–FY2025 + LTM Jun-30-2026 | 2026-08-06 | High — interest expense, EBIT/EBITDA base |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Balance Sheet" | Workbook tab (96×7) | FY2021–FY2025 + Press-Release column Jun-30-2026 | 2026-08-06 | **High** — debt, cash, equity, leases |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Cash Flow" | Workbook tab (74×7) | FY2021–FY2025 + LTM Jun-30-2026 | 2026-08-06 | **High** — CFO, capex, FCF, cash interest paid, debt issued/repaid |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Multiples" | Workbook tab (91×9) | FY2021–LTM | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Historical Capitalization" | Workbook tab (39×7) | Quarterly, Dec-2024–Mar-2026 | 2026-08-06 | Medium — TEV bridge, quarterly debt/cash |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Capital Structure Summary" | Workbook tab (99×7) | FY2024, FY2025, Q1 FY2026 (Mar-31-2026) | 2026-08-06 | **High** — leverage ratios, fixed-payment/maturity schedule, undrawn credit, secured/unsecured split |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Capital Structure Details" | Workbook tab (46×10) | FY2025 (as reported, filed 2026-02-13) and FY2024 detail | 2026-08-06 | **High** — instrument-by-instrument debt stack: type, coupon, maturity, seniority, secured/unsecured, convertible |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Ratios" | Workbook tab (161×7) | FY2020–FY2025 | 2026-08-06 | Medium — EBITDA/EBIT margins |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Supplemental" | Workbook tab (72×7) | FY2020–FY2025 | 2026-08-06 | Low–Medium — NOL carryforwards, fair-value levels |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Industry Specific" | Workbook tab (15×6) | n/a | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Pension OPEB" | Workbook tab (15×6) | "No Data Available" | 2026-08-06 | n/a — Uber discloses no pension/OPEB plan; not a data gap, a true absence of the obligation |
| Uber Technologies Inc NYSE UBER Financials.xls — tab "Segments" | Workbook tab (53×7) | FY2021–FY2025 | 2026-08-06 | Medium — segment EBITDA (asset-sale/stress calibration) |
| Uber Technologies Inc NYSE UBER Products.rtf | RTF | n/a (descriptive) | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Professionals.rtf | RTF | As of 2026-08-06 | 2026-08-06 | Low |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | RTF | As of 2026-08-05/06 | 2026-08-06 | Medium — ownership, quote, market cap |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.pdf | Transcript (primary call record) | Q2 FY2026 (quarter ended Jun-30-2026), call date 2026-08-05 | 2026-08-06 | **High** — management commentary on buybacks (~50% of FCF), Delivery Hero deal financing, balance-sheet capacity for AV bootstrapping |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls — 7 tabs (Consensus, Recent Changes, Guidance, Multiples, Surprise, Trends, Revisions) | Workbook, 7 tabs | Consensus/estimate data through FY2027–FY2028 | 2026-08-06 | Low (earnings-consensus focus, not solvency) |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls — 7 tabs (duplicate of above) | Workbook, 7 tabs | Same as above | 2026-08-06 | Low — near-duplicate file of the "(1)" version |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | RTF (comprehensive CIQ company report incl. deal/M&A log, ownership, news) | As of 2026-08-06 | 2026-08-06 | **High** — Delivery Hero acquisition terms (€14bn committed bridge facility), ownership/holders detail, litigation news items |

## 1A. External Data

No `data/UBER/external/` directory exists in this pool. No externally sourced research (alt-data panels, expert calls, channel checks, broker research, paid-API pulls) is present. This section is empty by data-pool fact, not by omission — confirmed via a recursive filesystem search for `*external*` under `data/UBER/`, which returned nothing.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) — via CIQ export of the FY2025 10-K | Uber Technologies Inc NYSE UBER Financials.xls, "Balance Sheet" / "Capital Structure Details" tabs | FY2025 (Dec-31-2025), filed 2026-02-13 | ~6 |
| Quarterly filing — via CIQ Press-Release column, corroborated by the Q2 2026 earnings call | Uber Technologies Inc NYSE UBER Financials.xls, "Balance Sheet" / "Cash Flow" tabs ("Press Release" / LTM Jun-30-2026 columns) | Q2 FY2026 (Jun-30-2026), released 2026-08-05 | 0 |
| Debt / capital-structure export | Uber Technologies Inc NYSE UBER Financials.xls, "Capital Structure Summary" / "Capital Structure Details" tabs | FY2025 (Dec-31-2025) instrument detail; ratios roll to Q1 FY2026 (Mar-31-2026) | 4–6 |
| Fixed-income / maturities export | Uber Technologies Inc NYSE UBER Financials.xls, "Capital Structure Summary" tab, "Fixed Payment Schedule" rows | FY2024 and FY2025 annual snapshots (Due +1 through +5, and After 5 Yrs) | ~6 |
| Cash flow statement | Uber Technologies Inc NYSE UBER Financials.xls, "Cash Flow" tab | LTM ended Jun-30-2026 | 0 |
| Covenant / credit-agreement disclosure | — | **Not in the pool** | n/a |
| Credit rating report | Company Comparable Analysis Uber Technologies Inc.xls, "Credit Health Panel" tab (S&P Issuer Credit Rating Foreign Currency LT Rating) | As of 2026-08-06 | 0 |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | Financials.xls, Balance Sheet tab, FY2025 + Jun-30-2026 Press-Release column | Debt, cash, equity base |
| Debt note (amounts by type) | Y | Financials.xls, Capital Structure Details tab — instrument-level: bonds/notes, exchangeable notes, commercial paper, finance leases, operating-lease liabilities, revolver, with coupon, seniority, secured/unsecured, convertible flag | The debt stack and seniority |
| Maturity schedule | Y | Financials.xls, Capital Structure Summary tab, "Fixed Payment Schedule" (Due +1 through +5, After 5 Yrs) and Capital Structure Details tab (per-instrument maturity dates 2027–2054) | The maturity wall and refinancing exposure |
| Cash flow statement | Y | Financials.xls, Cash Flow tab, FY2021–LTM Jun-30-2026 | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y | Financials.xls, Capital Structure Summary tab, "Available Credit" — Undrawn Commercial Paper $2,000mm, Undrawn Revolving Credit $4,657mm (FY2025) / $4,668mm (Q1 FY2026); revolver maturity 2029-09-26, unsecured | True liquidity beyond cash |
| Interest expense detail | Y | Financials.xls, Income Statement tab — "Interest Expense" and "Net Interest Exp." rows, all periods FY2021–LTM | Coverage ratios |
| Covenant disclosure | **N** | Not disclosed anywhere in the pool — no credit agreement, indenture, or covenant summary is present; the Capital Structure Details/Summary tabs give instrument terms (coupon, maturity, security) but no maintenance-covenant thresholds | Headroom to a breach |
| Lease detail (operating/finance) | Y | Financials.xls, Balance Sheet tab (Curr./LT lease liabilities) and Capital Structure Details tab (Finance Leases $222mm, Operating Lease Liabilities $1,559mm, both FY2025) | Debt-like obligations |
| Pension / OPEB funded status | N/A | Financials.xls, Pension/OPEB tab — "No Data Available" | Uber discloses no pension/OPEB plan; a true absence of the obligation, not a missing disclosure |
| Commitments & contingencies note | Partial | No dedicated commitments/contingencies note is in the pool; individual litigation items surface only as news items in UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf (e.g. a wrongful-death lawsuit filed 2026, no recorded liability or maximum-exposure figure given) and the Delivery Hero deal termination fees (Uber pays €700mm if it walks, Delivery Hero pays €200mm) | Guarantees, LCs, litigation, tax claims — figures are incomplete, not zero |
| Credit ratings | Y | Company Comparable Analysis Uber Technologies Inc.xls, Credit Health Panel tab — S&P Issuer Credit Rating Foreign Currency LT Rating: **BBB+**, as of 2026-08-06 | Refinancing access and cost |
| EBITDA base (for stress test) | Y | Financials.xls, Income Statement tab (reported/GAAP EBITDA) and earnings/01_historical-financials.md (Adj. EBITDA, company-defined, cross-checked to Segments tab) | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | Public Company Profile.rtf — "Passenger Ground Transportation" primary industry classification; asset-light operating technology platform, not a bank/insurer/REIT; single consolidated NYSE-listed entity, no disclosed material HoldCo-level debt | Selects the correct framework (Business Type Applicability Gate) — this is a standard operating-company analysis, not the financial-institution override |
| Revolver terms + availability / borrowing base | Y | Financials.xls, Capital Structure Summary tab — Senior Unsecured Revolving Loans, $0 drawn, $4,657–4,668mm undrawn, maturity 2029-09-26; commitment size not itemized separately from the undrawn figure but availability itself is disclosed (not a borrowing-base facility on the evidence available) | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | **N** | Not disclosed — no covenant-EBITDA definition, addback list, or addback cap appears anywhere in the pool | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | Y (not applicable) | No material HoldCo-level debt or subordinated financing structure is evident in Capital Structure Details — all listed instruments are issued at the single reporting entity level; Careem and other subsidiaries appear in the ownership/M&A log without a disclosed structural-subordination note | Structural subordination and upstreaming — not a live risk on current evidence, but not affirmatively ruled out by a dedicated disclosure either |
| Hedging / swaps disclosure | **N** | Not disclosed — Capital Structure Summary shows "Variable Rate Debt: 0" (all disclosed debt is fixed-rate) but no dedicated hedging/derivatives note is in the pool to confirm whether the pending €14bn Delivery Hero bridge facility will carry floating-rate exposure or hedges | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | **N** | Not disclosed in the data pool — the only trigger-like terms found relate to the pending Delivery Hero deal itself (a €700mm/€200mm reciprocal break fee), not to Uber's existing bond/revolver documentation | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

`business-model/11_capital-allocation-governance.md` already flags the July-2026 Delivery Hero acquisition (€12.9bn / $14.8bn equity value) financed by a **~€14 billion committed bridge facility** (affiliates of Morgan Stanley, Bank of America, and Deutsche Bank), on top of ~$4bn of Delivery Hero market purchases already funded from Uber's own balance sheet in Q2 2026. This is confirmed independently in `UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf`'s deal-summary text. **None of this bridge facility appears in the FY2025 or Q1-Q2 FY2026 balance-sheet/debt-stack figures above** — it is a signed-but-undrawn, not-yet-closed commitment (offer expected H2 2027, subject to a 50%+1-share acceptance threshold and merger-control/competition/financial-regulatory approvals). Downstream agents (01 capital structure, 02 maturity wall, 06 stress test) must treat this as a **material, near-certain future addition to gross debt** that the current-period leverage ratios do not yet reflect, and should state both the "as-reported" leverage and a pro-forma view that layers in the bridge facility, labelled as such.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | Public Company Profile.rtf, "Primary Office Location: San Francisco, CA" |
| Exchange | NYSE (ticker UBER) | Public Company Profile.rtf, "Ticker: UBER (NYSE)" |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | Domestic US issuer; CIQ exports transcribe the FY2025 10-K (filed 2026-02-13, per Balance Sheet tab "Filing Date" row) and quarterly results |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | Standard CIQ "Reported Currency" / "Latest Filings" restatement basis for a US domestic filer; no IFRS/Ind AS labeling anywhere in the pool |
| Reporting currency (USD / INR / …) | USD | All tabs, "Currency: USD"; Delivery Hero deal terms are stated in EUR in the source documents and used verbatim (€41.50/share, €12.9bn equity value / $14.8bn, ~€14bn bridge facility) — not re-derived |
| Document language(s) | English (all documents); the Delivery Hero deal-summary text itself references a German-domiciled target (XTRA:DHER) but the CIQ narrative describing it is in English | UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf |

No non-English source documents are present in this pool, so the CLAUDE.md §27 language-is-not-a-gap provision is not triggered here — noted for completeness per the triage template.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N | 02, 06 | Not applicable — maturity schedule is present (Fixed Payment Schedule, Capital Structure Summary tab) |
| No covenant disclosure | **Y** | 04, 06 | Covenant headroom = "Not assessable" (or must be built on a labeled, market-typical assumption if agent 04 chooses); Overall usefulness max 75 |
| No cash flow statement | N | 03, 04, 06 | Not applicable — cash flow statement is present through LTM Jun-30-2026 |
| No undrawn-facility disclosure | N | 03 | Not applicable — undrawn commercial paper and revolver amounts are disclosed |
| No interest-expense detail | N | 04 | Not applicable — Interest Expense and Net Interest Exp. lines are disclosed for every period |
| No EBITDA base | N | 06 | Not applicable — both reported/GAAP EBITDA and company-defined Adj. EBITDA are available and cross-checked against `earnings/01_historical-financials.md` |

## 6. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** The core triad — a recent balance sheet, an instrument-level debt note with maturities, and a cash flow statement — is fully present and current (balance sheet and cash flow both roll to Jun-30-2026; the debt note is FY2025, filed 2026-02-13, ~6 months old), so leverage, liquidity, coverage, and the downside stress test can all be built. The single missing item is covenant disclosure: no credit agreement, indenture, or covenant-threshold summary is anywhere in the pool, so true covenant headroom cannot be computed — only the instrument-level terms (coupon, maturity, security) are known. This one gap is enough, per the module's own Partial rule, to keep the verdict at Partial rather than Sufficient.
- **Sections that can run:** capital structure, maturity wall, liquidity, coverage (interest coverage computable; covenant headroom cannot), contingencies (partial — no dedicated commitments/contingencies note, only scattered litigation items and M&A break fees), stress test
- **Active partial-data caps:**
  - No covenant disclosure → covenant headroom = "Not assessable" in agent 04; Overall usefulness capped at 75 (MODULE_RULES.md Score Cap Rules)
  - Off-balance-sheet exposures (litigation, contingent liabilities) are not comprehensively disclosed for a name with visible litigation exposure (see wrongful-death suit in the CIQ landscape report) → Solvency strength max 75 (MODULE_RULES.md Score Cap Rules: "Off-balance-sheet exposures undisclosed for a known-litigious/levered name")
- **Critical missing items:**
  - Covenant thresholds and covenant-EBITDA definition/addback detail (no credit agreement or indenture terms in the pool)
  - A dedicated commitments & contingencies note (recorded liability vs. maximum exposure) — only scattered litigation news items and M&A break-fee terms are available
  - Hedging/derivatives disclosure for the pending ~€14bn Delivery Hero bridge facility (currently all disclosed debt is fixed-rate; the bridge facility's rate structure and any hedges are not disclosed in this pool)
  - Change-of-control / cross-default / rating-trigger language on Uber's own existing bond/revolver documentation (not disclosed)
- **Single highest-value missing document:** The credit agreement / bond indenture covenant package (maintenance-covenant thresholds, covenant-EBITDA definition and addback caps, cross-default and change-of-control language) — this single document would resolve the covenant-headroom gap, the covenant-EBITDA-quality gap, and the trigger-scan gap simultaneously, and is the one gap keeping this verdict at Partial rather than Sufficient. A close second: the pending Delivery Hero bridge-facility term sheet (rate structure, covenants, hedging), given it is about to become Uber's single largest debt instrument.



---

## balance-sheet-survival / 01_capital-structure-and-leverage.md

_Source: `01_capital-structure-and-leverage.md`_

# Capital Structure & Leverage — UBER

**Reporting currency:** USD (millions unless stated). **Reporting standard:** US GAAP, fiscal year end Dec-31. **Source-pool caveat (carried from `00_solvency-data-triage.md`):** no primary SEC filing (10-K/10-Q) is physically present in `data/UBER/`; every balance-sheet and debt-note figure below is Capital IQ's vendor transcription of Uber's FY2025 10-K (filed 2026-02-13) and Q2 FY2026 results (released 2026-08-05) — cited as "CIQ export," never as "10-K." No `ciq_facts.json` sidecar exists for this run, so every figure is this agent's own sourced read of the CIQ workbook tabs, cross-checked line-by-line against `earnings/01_historical-financials.md`. The Q2 FY2026 earnings-call transcript (Aug-05-2026) is a primary call record and is cited as such.

**Cyclicality flag (from `business-model/07_business-quality.md`):** cyclicality scored 38/100 (inverted: lower = more cyclical) — "a real cyclical downside is visible in the record (FY2020, FY2022–25 Freight), not merely theoretical." Per `MODULE_RULES.md` Calculation Standard 4, Section 5 below therefore shows leverage on both latest and a normalised/mid-cycle EBITDA base, labelled.

## 1. Debt Stack

Instrument-level detail below is as of **FY2025 (Dec-31-2025)**, the most recent full instrument-level breakout in the pool, filed 2026-02-13 [CIQ export — Financials.xls, Capital Structure Details tab]. All disclosed fixed-rate debt; **Variable Rate Debt = $0** and the revolver (undrawn) is the only floating-rate-benchmarked facility [CIQ export — Financials.xls, Capital Structure Summary tab, "Fixed Rate Debt" / "Variable Rate Debt" rows, FY2025].

| Instrument | Amount (FY2025, $mm) | Entity | Secured? | Seniority | Collateral | Maturity | Rate | Source |
|---|---:|---|---|---|---|---|---|---|
| Current portion of LT debt/leases | 307 (leases only; no bond current maturity at FY2025) | Uber Technologies, Inc. (single reporting entity) | No (bonds); Yes (leases, secured by leased asset) | Senior | n/a / leased asset | Various, within 12mo of Dec-31-2025 | n/a | CIQ export, Balance Sheet tab, FY2025 |
| 2028 Convertible Notes | 1,725 | Uber Technologies, Inc. | No | Senior | n/a | 2028-12-01 | 0.875% fixed, convertible | CIQ export, Capital Structure Details tab |
| 2028 Exchangeable Senior Notes | 1,125 | Uber Technologies, Inc. | **Yes** | Senior | Not itemized beyond "secured" flag | 2028-05-15 | 0.000% fixed (zero-coupon), exchangeable | CIQ export, Capital Structure Details tab |
| 2029 Senior Note | 1,500 | Uber Technologies, Inc. | No | Senior | n/a | 2029-08-15 | 4.500% fixed | CIQ export, Capital Structure Details tab |
| 2030 Senior Note | 1,250 | Uber Technologies, Inc. | No | Senior | n/a | 2030-01-15 | 4.300% fixed | CIQ export, Capital Structure Details tab |
| 2031 Senior Notes | 1,000 | Uber Technologies, Inc. | No | Senior | n/a | 2031-01-15 | 4.150% fixed | CIQ export, Capital Structure Details tab |
| 2034 Senior Note | 1,500 | Uber Technologies, Inc. | No | Senior | n/a | 2034-09-15 | 4.800% fixed | CIQ export, Capital Structure Details tab |
| 2035 Senior Notes | 1,250 | Uber Technologies, Inc. | No | Senior | n/a | 2035-09-15 | 4.800% fixed | CIQ export, Capital Structure Details tab |
| 2054 Senior Note | 1,250 | Uber Technologies, Inc. | No | Senior | n/a | 2054-09-15 | 5.350% fixed | CIQ export, Capital Structure Details tab |
| Commercial paper program | 0 drawn ($2,000 undrawn capacity) | Uber Technologies, Inc. | No | Senior | n/a | Program renews (2026-07-01 reference date) | n/a (undrawn) | CIQ export, Capital Structure Details / Summary tabs |
| Revolver (Senior Unsecured Revolving Loans) | 0 drawn ($4,657 undrawn, FY2025) | Uber Technologies, Inc. | No | Senior | n/a | 2029-09-26 | Benchmark (floating), undrawn | CIQ export, Capital Structure Details / Summary tabs |
| Finance leases | 222 | Uber Technologies, Inc. | Yes | Senior | Leased asset | Through 2030 | 6.000% imputed | CIQ export, Capital Structure Details tab |
| Operating lease liabilities | 1,559 | Uber Technologies, Inc. | Yes (tagged secured — collateral is the leased asset) | Senior | Leased asset | Various (schedule in `02`) | 6.600% imputed | CIQ export, Capital Structure Details tab |
| **Total gross debt (FY2025)** | **12,302** | | | | | | | Sum of principal ($12,381) + debt discount/issuance-cost adjustments (−$79) [CIQ export, Capital Structure Summary tab] |

**Reconciliation check:** Total Senior Bonds and Notes ($10,600) + Total Lease Liabilities ($1,781, = finance leases $222 + operating lease liabilities $1,559) = Total Principal Due $12,381; less $79mm of net discount/issuance-cost adjustments = Total Debt Outstanding $12,302 — ties exactly to the Balance Sheet tab's FY2025 "Total Debt" supplemental row [CIQ export, Balance Sheet tab, FY2025 column].

**Roll-forward to the latest balance sheet (Jun-30-2026, Q2 FY2026 press release):** gross debt rose to **$14,731mm** — Current Portion of LT Debt $1,997mm + Current Portion of Leases $178mm + Long-Term Debt $10,726mm + Long-Term Leases $1,830mm [CIQ export, Balance Sheet tab, Jun-30-2026 Press-Release column] — a **+$2,429mm increase over FY2025**. Instrument-level detail (which specific notes/facilities account for the increase) is **not disclosed in the pool** for Q2 FY2026; only the FY2025 year-end breakout above has instrument granularity. Cash-flow evidence corroborates new debt issuance: LTM Jun-30-2026 Total Debt Issued = $6,229mm vs. Total Debt Repaid = $4,514mm, net debt issued = $1,715mm [CIQ export, Cash Flow tab, LTM column] — roughly coincident with the ~$4,000mm of capital management spent building the Delivery Hero market stake in Q2 2026 [`business-model/11_capital-allocation-governance.md`]. **Partial data: the exact instrument composition of the $2,429mm FY2025→Q2 FY2026 debt increase is not disclosed in this pool** — flagged for `02_maturity-wall-and-refinancing`.

**Material forward item — NOT included in any total above:** Uber signed a Business Combination Agreement (2026-07-16) to acquire the remaining ~63.21% stake in Delivery Hero SE for €8.4bn (€41.50/share cash, €12.9bn / $14.8bn total equity value), financed by a **committed bridge facility of approximately €14 billion** from affiliates of Morgan Stanley, Bank of America, and Deutsche Bank [CIQ export, UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf, deal-summary text]. The deal is **not yet closed** — offer expected H2 2027, subject to a 50%+1-share acceptance threshold and merger-control/competition/financial-regulatory approvals; termination fees are €700mm (Uber) / €200mm (Delivery Hero) if either side walks. **None of the €14bn bridge facility appears in the Jun-30-2026 balance sheet.** This is a near-certain, material future addition to gross debt that current-period leverage ratios below do not reflect — downstream agents (`02`, `06`) must treat it as a labelled pro-forma overlay, not a sunk fact.

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Operating leases (US GAAP, ASC 842) | $1,559mm (FY2025); $1,830mm LT + $178mm current = $2,008mm combined lease liability at Jun-30-2026 (finance + operating leases not split in the Q2 press-release balance sheet) | US GAAP (ASC 842) already capitalizes operating leases on the balance sheet (post-2019) — unlike the pre-2019 US GAAP treatment, there is no off-balance-sheet operating-lease gap here to add back. Already included in "Total gross debt" above. | CIQ export, Balance Sheet tab / Capital Structure Details & Summary tabs |
| Pension / OPEB underfunding | None | Uber discloses no pension/OPEB plan — CIQ's dedicated Pension/OPEB tab returns "No Data Available." This is a true absence of the obligation, not a missing disclosure. | CIQ export, Financials.xls, Pension OPEB tab |
| Preferred equity | None | No preferred stock line on the balance sheet; Historical Capitalization tab shows "+ Pref. Equity: -" for every period shown. | CIQ export, Balance Sheet tab / Historical Capitalization tab |

## 3. Cash & Liquid Assets

All figures as of Jun-30-2026 (Q2 FY2026 press-release balance sheet) unless noted.

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | $4,870mm | No | CIQ export, Balance Sheet tab, Jun-30-2026 |
| Liquid short-term investments | $521mm | No | CIQ export, Balance Sheet tab, Jun-30-2026 |
| **Total cash & ST investments** | **$5,391mm** | — | CIQ export, Balance Sheet tab, Jun-30-2026 |
| Restricted cash | $661mm | **Yes — flagged, excluded from all net-debt and liquidity figures below** | CIQ export, Balance Sheet tab, Jun-30-2026 ("Restricted Cash" line, reported separately from Cash & Equivalents / Total Cash & ST Investments) |
| Long-term investments (not liquid — excluded) | $12,532mm | Not restricted, but **not liquid/near-cash** — a mix of equity-method investments ($3,773mm, incl. AV-partner and Delivery Hero-adjacent stakes) and other long-term securities; not netted into any figure below | CIQ export, Balance Sheet tab, Jun-30-2026 |

**Note on a CIQ definitional inconsistency (flagged, not adopted):** the Balance Sheet tab's own precomputed "Net Debt" supplemental row nets in not just cash & ST investments but also a further pool of "Long-Term Marketable Securities" for FY2021–FY2025 (e.g. FY2025: $12,302mm debt − $7,633mm cash&STInv − $4,593mm LT marketable securities = $76mm, ties to the row exactly) — but stops doing so at Jun-30-2026 (where $14,731mm − $5,391mm = $9,340mm ties without any further subtraction), most likely because that investment pool is now dominated by the illiquid Delivery Hero strategic equity stake rather than liquid marketable securities. Because this vendor row silently switches basis across periods, **this agent does not use it** — Section 4 below computes net debt directly and consistently from the raw balance-sheet cash/investment/debt lines for every period, per CLAUDE.md §15.

## 4. Gross & Net Debt

| Metric | Value ($mm, Jun-30-2026) | Source |
|---|---:|---|
| Gross debt | 14,731 | CIQ export, Balance Sheet tab, Jun-30-2026 (supplemental "Total Debt" row) |
| − Cash & equivalents | 4,870 | CIQ export, Balance Sheet tab, Jun-30-2026 |
| **Net debt (strict, §15) — CANONICAL** | **9,861** | Calc: 14,731 − 4,870 |
| − Liquid short-term investments (additional) | 521 | CIQ export, Balance Sheet tab, Jun-30-2026 |
| **Net debt (broad, incl. ST investments)** | **9,340** | Calc: 14,731 − 5,391. (This broad figure happens to match CIQ's own precomputed "Net Debt" row for this one period only — see note above on why it diverges in earlier periods.) |

**Basis designation:** the **strict** figure ($9,861mm) is the canonical net-debt figure this module uses downstream (default per `MODULE_RULES.md` Calculation Standard 3 — no stated reason to prefer broad). The broad figure is shown alongside, labelled, because liquid ST investments ($521mm) are material enough to move net leverage by roughly 0.05x on Adj. EBITDA. Restricted cash ($661mm) and long-term investments ($12,532mm) are excluded from both bases — see Section 3.

## 5. Leverage Ratios

EBITDA bases, both labelled per `earnings/01_historical-financials.md`: (1) **Reported/GAAP-based EBITDA** = Operating Income + D&A (CapIQ-standardized, LTM Jun-30-2026 = $7,474mm) [CIQ export, Income Statement tab]; (2) **Adjusted EBITDA (company-defined, non-GAAP)** = Uber's own guided metric, adds back stock-based compensation ($1,939mm LTM) and other unitemized items (LTM Jun-30-2026 = $10,043mm, per `earnings/01_historical-financials.md` §2, cross-checked to the Segments tab's "Total EBITDA" row). Cycle position: LTM/latest = current print; see the normalised row below for the cyclicality flag.

| Ratio | On Reported/GAAP EBITDA (LTM $7,474mm) | On Adjusted EBITDA (LTM $10,043mm) | Source / Formula |
|---|---:|---:|---|
| Gross debt / EBITDA | 1.97x | 1.47x | 14,731 / EBITDA |
| Net debt / EBITDA (strict basis, canonical) | 1.32x | 0.98x | 9,861 / EBITDA |
| Net debt / EBITDA (broad basis, labelled) | 1.25x | 0.93x | 9,340 / EBITDA |
| Debt / capital | 34.2% | (n/a) | 14,731 / (14,731 + 27,316 common equity + 1,083 minority interest = 43,130) [CIQ export, Balance Sheet tab, Jun-30-2026] |
| Debt / equity (common equity basis) | 53.9% | (n/a) | 14,731 / 27,316 |
| Debt / equity (total equity incl. minority interest) | 51.9% | (n/a) | 14,731 / 28,399 |

**Cyclicality row (per `business-model/07_business-quality.md` flag, cyclicality 38/100):** on a normalised/mid-cycle EBITDA base — the FY2023–FY2025 3-year average, since Uber has under one full standalone leverage cycle post-turnaround-to-profitability — net leverage reads meaningfully worse than the latest print:

| Basis | Reported/GAAP EBITDA | Adj. EBITDA | Net debt (strict) / EBITDA |
|---|---:|---:|---:|
| **Latest / LTM (peak-to-date)** | 7,474 | 10,043 | 1.32x (GAAP) / 0.98x (Adj.) |
| **Normalised / mid-cycle (FY2023–FY2025 3-yr avg)** | 3,927 | 6,422 | 2.51x (GAAP) / 1.54x (Adj.) |

**Caveat on the normalised row:** Uber's FY2023–FY2025 EBITDA trajectory (GAAP: $1,933mm → $3,536mm → $6,312mm) reflects a structural margin inflection — a business scaling out of losses toward profitability — not a repeating cyclical oscillation around a stable mean, so this 3-year average is a conservative floor-check, not a claim that EBITDA will revert to it. The evidenced cyclical swing actually visible in the record is narrower and segment-specific: Freight segment revenue fell from a $6,947mm FY2022 peak to $5,099mm in FY2025 (−27% over three years), tracking a broader trucking-freight recession [`business-model/07_business-quality.md`, `03_segment-map.md`], and the FY2020 COVID trough took Mobility segment margin to near breakeven. Freight is ~9.8% of FY2025 group revenue, so a Freight-specific downturn alone would not move group EBITDA by anywhere near the gap shown in the table above — the table is shown per the module's hard rule, but the group-level normalised figure should be read as a scaling-stage floor-check, not a peak/trough cyclical estimate.

**Cross-check against CIQ's own precomputed Credit Ratios (Capital Structure Summary tab, rolls only to Mar-31-2026, not Jun-30-2026):** Total Debt/EBITDA 2.91x (FY2024) → 1.84x (FY2025) → 1.40x (Mar-2026); Net Debt/EBITDA NM (FY2024) → 0.01x (FY2025) → 0.28x (Mar-2026). These use a CIQ-internal EBITDA denominator not separately itemized in the pool and are shown here only as a reference point — they do not exactly reproduce this agent's own GAAP- or Adjusted-EBITDA-based ratios above (formula and EBITDA source both stated, per module rule 13), and in any case predate the Jun-30-2026 debt increase.

## 6. Leverage Trend

Net debt shown on the **strict** basis (gross debt − cash & equivalents), computed consistently from raw balance-sheet lines for every period (see Section 3 note on why CIQ's own precomputed row is not used).

| Metric | FY2023 | FY2024 | FY2025 | Latest (Jun-30-2026) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, $mm) | 7,022 | 5,543 | 5,197 | 9,861 | Falling FY2023→FY2025, then **rising sharply** in H1 FY2026 |
| Net debt / EBITDA (GAAP-based) | 3.63x | 1.57x | 0.82x | 1.32x | Same pattern |
| Net debt / EBITDA (Adj. EBITDA-based) | 1.73x | 0.85x | 0.60x | 0.98x | Same pattern |
| Gross debt / EBITDA (GAAP-based) | 6.05x | 3.23x | 1.95x | 1.97x | Falling FY2023→FY2025, roughly flat since |

Leverage fell steadily through FY2023–FY2025 as EBITDA scaled (GAAP EBITDA +227% over the two years, gross debt essentially flat to down) — a genuine deleveraging-through-earnings-growth story, not debt paydown: gross debt actually rose slightly from $11,702mm (FY2023) to $12,302mm (FY2025) [CIQ export, Balance Sheet tab], while cash built from $5,407mm to $7,633mm, so net debt fell mainly on the cash side. That trend reversed in H1 FY2026: net debt (strict) rose $4,664mm from FY2025 year-end to Jun-30-2026, driven by (1) new debt issuance ($6,229mm gross issued LTM vs. $4,514mm repaid, net +$1,715mm [CIQ export, Cash Flow tab]) and (2) a cash drawdown used to help fund roughly $4,000mm of Delivery Hero market-stake purchases in Q2 FY2026 [`business-model/11_capital-allocation-governance.md`; Q2 FY2026 earnings-call transcript]. This is a pre-funding step ahead of the much larger ~€14bn bridge facility for the full Delivery Hero acquisition (Section 1), which is not yet drawn or reflected in any period shown.

## 6A. HoldCo / OpCo & Structural Subordination

Not applicable — no material HoldCo-level debt indicated. Every instrument in the FY2025 Capital Structure Details tab is issued at the single reporting entity level (Uber Technologies, Inc.); no subordinated-financing or structural-subordination note is present in the pool for Careem or any other subsidiary [`00_solvency-data-triage.md`, §3]. This is not an affirmative "no HoldCo debt exists anywhere" finding (no dedicated corporate-structure/guarantor note is in the pool), but nothing in the available data indicates one.

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Gross debt:** $14,731mm (Jun-30-2026, Q2 FY2026 press-release balance sheet) [CIQ export, Balance Sheet tab]
- **Net debt — CANONICAL (strict, §15 basis):** $9,861mm = $14,731mm gross debt − $4,870mm cash & equivalents. **Broad basis (labelled, not canonical):** $9,340mm, additionally netting $521mm of liquid ST investments.
- **Cash & liquid investments:** $5,391mm total (cash & equivalents $4,870mm + ST investments $521mm). Excludes $661mm restricted cash (flagged, not counted) and $12,532mm of illiquid long-term investments.
- **EBITDA base used:** Reported/GAAP-based EBITDA, LTM Jun-30-2026 = **$7,474mm** (Operating Income + D&A); Adjusted EBITDA (company-defined, non-GAAP), LTM Jun-30-2026 = **$10,043mm**. Cycle position: this is the **latest/peak-to-date** print — a normalised/mid-cycle 3-year average (FY2023–FY2025) is $3,927mm (GAAP) / $6,422mm (Adj.), shown in Section 5 with its caveat (structural-maturation distortion, not a clean cyclical trough/peak).
- **Net debt / EBITDA (canonical net debt, both EBITDA bases):** 1.32x on Reported/GAAP EBITDA; 0.98x on Adjusted EBITDA. On the normalised/mid-cycle base: 2.51x (GAAP) / 1.54x (Adj.) — carry this caveat downstream if a stress scenario uses it.
- **Reporting currency:** USD.
- **Propagate downstream:** (1) gross debt rose $2,429mm from FY2025 to Q2 FY2026 with no instrument-level breakout available in this pool — flagged for `02`; (2) the ~€14bn Delivery Hero bridge facility is signed but undrawn and not in any figure above — treat as a material, near-certain pro-forma overlay, not a sunk fact, for `02` and `06`; (3) this agent's own net-debt and leverage figures deliberately diverge from CIQ's own precomputed "Net Debt" row because that row's definition is inconsistent across periods (Section 3) — downstream agents should use the figures in this Anchor Summary, not the raw CIQ "Net Debt" supplemental row.

Uber is **not** net cash at the latest balance-sheet date (net debt strict $9,861mm positive). It was intermittently net cash in FY2021 and briefly near-net-cash at FY2024 (strict net debt $5,543mm was still positive on this agent's consistent calculation — see Section 6; only CIQ's own inconsistent broader netting showed a negative/net-cash figure that period) — this is noted for completeness but should not be read as a "net cash balance sheet" positive-flexibility finding, since on the strict, consistently-applied basis Uber has carried net debt in every period shown.



---

## balance-sheet-survival / 02_maturity-wall-and-refinancing.md

_Source: `02_maturity-wall-and-refinancing.md`_

# Maturity Wall & Refinancing — UBER

**Reporting currency:** USD (millions unless stated). **Reporting standard:** US GAAP. **Source-pool caveat (carried from `00_solvency-data-triage.md` / `01_capital-structure-and-leverage.md`):** no primary SEC filing (10-K/10-Q) is physically present in `data/UBER/`; every figure below is Capital IQ's vendor transcription of Uber's FY2025 10-K (filed 2026-02-13) and Q2 FY2026 results (released 2026-08-05) — cited as "CIQ export," never as "10-K." No `ciq_facts.json` sidecar exists for this run.

**Anchor from `01`:** gross debt (canonical, Jun-30-2026) = **$14,731mm**; net debt (strict) = **$9,861mm**. This agent reconciles its own maturity build to that $14,731mm total.

## 1. Maturity Schedule

The most recent **instrument-level** maturity detail in the pool is the FY2025 year-end (Dec-31-2025) debt note [CIQ export, Capital Structure Details tab; Capital Structure Summary tab, "Fixed Payment Schedule"], which totals $12,302mm and reconciles exactly to `01`'s FY2025 gross-debt figure. Between FY2025 and the latest balance sheet (Jun-30-2026), gross debt rose $2,429mm to $14,731mm — and **critically, "Current Portion of Long-Term Debt" jumped from $0 (FY2025) to $1,997mm (Jun-30-2026)** [CIQ export, Balance Sheet tab], even though no bond in the FY2025 instrument table matures before May-2028. This $1,997mm is **not itemized by instrument anywhere in the pool** (no Q2 FY2026 Capital Structure Details tab exists). Cross-checking the balance-sheet roll-forward (Long-Term Debt +$205mm — consistent with normal zero-coupon-note accretion on the existing 2028 bonds, not a maturity shift; Long-Term Leases +$356mm; Current Leases −$129mm) shows the existing $10,600mm bond stack did **not** move to current — the $1,997mm is additive, new short-term-dated debt raised during H1 FY2026. Cash-flow evidence is consistent with new short-term financing: LTM Jun-30-2026 gross debt issued was $6,229mm vs. $3,359mm for FY2025 alone [CIQ export, Cash Flow tab], and the increase roughly coincides with the ~$4,000mm spent on Delivery Hero open-market stake purchases in Q2 FY2026 [`01_capital-structure-and-leverage.md`; Q2 FY2026 transcript, p.12]. **The specific facility, its rate, and lender are not disclosed in this pool — this is inference, not from filings**, and is the single largest open question in this maturity wall.

Given that, the table below anchors the **within-12-months** bucket to the actual, current Jun-30-2026 balance-sheet classification (most conservative, most current), and anchors **Years 2 onward** to the last fully itemized (FY2025-vintage) bond/lease schedule — labelled, because it has not been updated for the $2,429mm of H1 FY2026 balance-sheet change. Bond amounts are shown at **principal** (not net of the ~$79mm original-issue discount).

| Period | Amount Due ($mm) | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (by ~Jun-2027) | 2,175 | 14.8% | $1,997mm unidentified new short-term debt (H1 FY2026, no instrument detail in pool) + $178mm current finance/operating-lease obligations | Balance Sheet tab, Jun-30-2026 |
| Year 2 (~FY2027, FY2025-vintage bucket) | 48 | 0.3% | Finance-lease amortization only — no bond scheduled | Capital Structure Summary, Fixed Payment Schedule, FY2025 |
| Year 3 (~FY2028) | 2,850 | 19.3% | 2028 Convertible Notes $1,725mm (0.875%) + 2028 Exchangeable Senior Notes $1,125mm (0.000%, secured) | Capital Structure Details, FY2025 |
| Year 4 (~FY2029) | 1,500 | 10.2% | 2029 Senior Note (4.500%) | Capital Structure Details, FY2025 |
| Year 5 (~FY2030) | 1,250 | 8.5% | 2030 Senior Note (4.300%) | Capital Structure Details, FY2025 |
| Thereafter (FY2031+) | 6,830 | 46.4% | 2031 Senior Notes $1,000mm (4.150%) + 2034 Senior Note $1,500mm (4.800%) + 2035 Senior Notes $1,250mm (4.800%) + 2054 Senior Note $1,250mm (5.350%) + $1,830mm long-term lease liabilities | Capital Structure Details, FY2025; Balance Sheet tab, Jun-30-2026 (leases) |
| **Total** | **14,653** | **99.5%** | | |

**Reconciling item:** $14,653mm vs. $14,731mm canonical gross debt = a **$78mm (0.5%) gap**, consistent with the ~$79mm net original-issue-discount/issuance-cost adjustment that `01` shows nets bond principal ($12,381mm) down to carrying value ($12,302mm at FY2025) — bonds are shown above at principal, not carrying value. Not a missing-instrument gap.

**Bucket-definition caveat:** "Within 12 months" is a true rolling 12-month figure sourced from the Jun-30-2026 balance sheet. "Year 2" through "Thereafter" are FY2025 fiscal-year buckets (anchored to Dec-31-2025) that have **not** been re-cut for the ~14 months elapsed since — a mild double-counting/gap risk exists at the boundary between "Within 12 months" and "Year 2," but the known bond ladder (Years 3–thereafter) is unaffected since none of those bonds have moved.

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) — bonds & notes only, precise | **7.36 years** (computed from stated maturity dates vs. today 2026-08-06, weighted by principal; formula: Σ(principal × years-to-maturity) / Σ(principal), $10,600mm base) |
| Weighted-average maturity (years) — blended incl. leases + unidentified ST debt, approximate | **~5.9 years** (adds $1,997mm unidentified debt at an assumed 0.5-yr midpoint and $2,008mm of lease obligations at an assumed ~4-yr average — both **labelled estimates, inference not from filings**, since neither has a disclosed single maturity) |
| % due within 12 months | **14.8%** ($2,175mm / $14,731mm) |
| % due within 24 months | **15.1%** ($2,223mm / $14,731mm) |
| % due within 36 months | **34.4%** ($5,073mm / $14,731mm) |
| Largest single maturity year (and amount) | **FY2028 — $2,850mm (19.3% of total debt)**, driven by two notes maturing the same calendar year: 2028 Convertible Notes ($1,725mm, May–Dec 2028 window) + 2028 Exchangeable Senior Notes ($1,125mm) |

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share (of drawn/outstanding debt) | **100%** — Variable Rate Debt = $0 drawn at every period shown (FY2024–Mar-2026) | CIQ export, Capital Structure Summary tab, "Fixed Rate Debt" $9,475mm + "Zero Coupon Debt" $1,125mm = $10,600mm total bonds, FY2025; "Variable Rate Debt" row = 0 |
| Floating-rate share (of drawn/outstanding debt) | **0%** drawn. Up to $4,668mm undrawn revolver (Mar-31-2026) + $2,000mm undrawn commercial paper is benchmark-rate (floating) if drawn — currently 0% utilized | CIQ export, Capital Structure Summary tab, "Undrawn Revolving Credit" / "Undrawn Commercial Paper," Mar-31-2026 |
| Weighted-average coupon — bonds & notes ($10,600mm), all instruments | **3.55%** | Calc: Σ(principal × coupon)/Σ(principal); see Section 1 instrument list |
| Weighted-average coupon — plain-vanilla senior notes only ($7,750mm, excl. the two zero/near-zero-coupon convertible/exchangeable notes) | **4.67%** | Same calc, excluding 2028 Convertible Notes (0.875%) and 2028 Exchangeable Senior Notes (0.000%), which are priced for embedded equity optionality, not a comparable straight-debt yield |
| Weighted-average imputed rate, finance + operating leases (memo, not "refinanced" via capital markets) | Finance leases 6.00%; operating leases 6.60% (imputed) | CIQ export, Capital Structure Details tab |
| Current market refi rate (broad BBB-rated US corporate benchmark) | **5.61%** (ICE BofA BBB US Corporate Index effective yield, as of 2026-07-24) | Web: ycharts.com/ICE BofA BBB US Corporate Effective Yield, dated 2026-07-24 (indicative, unverified, broad-index proxy — not tenor-matched or UBER-specific) |
| Reference: 10-year US Treasury yield | 4.61% (2026-08-06) | Web: 10Y UST yield, 2026-08-06 (indicative, unverified) |
| Implied credit spread (BBB index vs. 10Y UST) | ~100bps | Calc: 5.61% − 4.61% |
| Estimated refi cost step-up — headline (all bonds vs. BBB benchmark) | **+206bps** (3.55% → 5.61%) | Calc: 5.61% − 3.55% |
| Estimated refi cost step-up — like-for-like (plain-vanilla notes only vs. BBB benchmark) | **+94bps** (4.67% → 5.61%) | Calc: 5.61% − 4.67% |

**Reading the two step-up figures:** the headline +206bps overstates the true refinancing cost because it compares straight-bond-equivalent market rates against a blended coupon that includes two zero/near-zero-coupon convertible/exchangeable notes ($2,850mm) priced cheap in exchange for embedded equity value — not a like-for-like refinancing cost. The **+94bps** plain-vanilla comparison is the more decision-useful estimate for what UBER would pay to refinance its straight senior notes today. Either way, the step-up is a genuine cost increase, not a rounding error: refinancing the $2,850mm of FY2028 maturities alone at even the conservative +94bps would add roughly $27mm/year of incremental interest expense (2,850 × 0.94%) versus today's blended coupon on that tranche, before accounting for the fact ~$2,850mm of that tranche currently carries a near-zero coupon specifically because of its convertible/exchangeable structure — a straight refinancing (without renewing the equity-linked feature) would cost meaningfully more than 94bps versus the old near-zero coupon on that specific tranche.

**S&P issuer rating:** BBB+ (foreign-currency long-term), as of the latest CIQ Credit Health Panel snapshot (2026-08-06) [CIQ export, Company Comparable Analysis, Credit Health Panel tab] — investment-grade, one notch above the broad "BBB" index used above, so the BBB-index benchmark is a conservative (not favorable) proxy for UBER's own likely refinancing cost.

**Cross-default / change-of-control / rating-trigger scan:** Not disclosed in the data pool — no indenture excerpts or guarantor/covenant notes are present.

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities ($2,223mm: $2,175mm within 12mo + $48mm Year-2) | Amount | Evidence |
|---|---:|---|
| Cash on hand | $4,870mm | CIQ export, Balance Sheet tab, Jun-30-2026 |
| Forecast FCF (CFO − total capex, CLAUDE.md §15 basis) | $10,116mm LTM (= $10,424mm CFO − $308mm capex) | CIQ export, Cash Flow tab, LTM Jun-30-2026. Cross-checked to management commentary: "a little bit over $10 billion in free cash flows over the trailing 12 months" [Q2 FY2026 transcript, p.11-12, CFO Balaji Krishnamurthy]. Note: CIQ's own "Levered Free Cash Flow" line item ($7,239mm LTM) uses a different, CIQ-internal definition (likely nets additional financing items) — the CFO-minus-capex figure above is the module-canonical basis and is the one that ties to management's own stated number. |
| Revolver availability (committed, undrawn) | $4,668mm (Mar-31-2026, most recent figure in pool; not updated to Jun-30-2026) | CIQ export, Capital Structure Summary tab, "Undrawn Revolving Credit." Commitment status ("committed" vs. "uncommitted") is not explicitly labelled in the pool — treated as a standard committed revolving facility per convention, since $0 is drawn against it across every period shown and CIQ tags it "Revolving Credit" (not a demand/uncommitted line). **Flagged: not independently confirmed as committed.** |
| Asset-sale proceeds | Unknown — none announced or authorized for debt reduction | Not disclosed in the data pool |
| New debt issuance | Unknown — no specific committed issuance for this wall is announced. Demonstrated market access: $6,229mm gross debt issued LTM Jun-30-2026 | CIQ export, Cash Flow tab, LTM |

**In plain terms:** the near-term wall (next 12–24 months, $2,223mm) is small relative to cash alone ($4,870mm, 2.2x coverage) and trivial relative to free cash flow (~$10.1bn LTM, ~4.5x coverage) — Uber does not need market access to clear the disclosed 24-month wall. It carries an investment-grade S&P rating (BBB+) and has issued $6,229mm of new debt in the trailing 12 months, evidencing continued capital-markets access. Floating-rate exposure on drawn debt is 0%, so a rate move does not directly reprice existing interest cost — it only affects the coupon on anything newly issued or drawn. The largest genuine near-term risk is not the disclosed wall itself but the **$1,997mm of unidentified new short-term debt** (Section 1) whose terms, lender, and true maturity date are not confirmed in this pool, and the pending **~€14 billion Delivery Hero acquisition bridge facility** (signed 2026-07-16, committed but undrawn, not reflected in any balance sheet above per `01`) — a near-certain, much larger future draw that this section's coverage math does not include. **Conclusion: self-funded / low refi risk for the disclosed 24-month wall**, conditional on the $1,997mm unidentified item behaving as ordinary short-term debt rather than a stressed facility, and explicitly excluding the DH bridge overlay, which is a separate, much larger, forward risk that `06_downside-stress-test` should model on its own terms.

## 5. Refinancing Read

The disclosed maturity wall is thin and cheap through 2027 (14.8% of debt within 12 months, next-to-nothing in the following year) before a real cluster hits FY2028 ($2,850mm, 19.3% of the stack, from two 2028 notes) — that cluster and everything after it is comfortably laddered out to 2054 (weighted-average maturity ~7.4 years on the bond stack), and none of it is floating-rate. Refinancing any of the plain-vanilla senior notes today would cost roughly +94bps over their current weighted coupon (4.67% → a ~5.6% BBB-index benchmark) — a real but not crippling step-up given Uber's BBB+ rating, $10.1bn of trailing free cash flow, and $4.9bn of cash. The single biggest refinancing risk is not the disclosed ladder at all: it is (1) the $1,997mm of new short-term debt that appeared on the balance sheet in H1 FY2026 with no instrument-level disclosure anywhere in this pool — its true tenor and terms are unconfirmed — and (2) the ~€14 billion Delivery Hero acquisition bridge facility, signed but undrawn, which is roughly the size of Uber's entire current debt stack and is not reflected in any figure in this report. **Uber survives the next 12 months under a "market closure" assumption (no new unsecured issuance) on currently disclosed instruments alone:** cash ($4,870mm) plus the committed, undrawn revolver ($4,668mm, availability known) total ~$9,538mm against a $2,175mm within-12-month wall — more than 4x coverage before any FCF is counted, and FCF alone (~$10.1bn LTM) would cover it again on its own. That conclusion does not extend to the DH bridge facility once drawn, which this module treats as a separate, labelled pro-forma overlay per `01` and is out of scope for this agent's 24-month wall read.

**Assumption label:** the $1,997mm unidentified short-term debt is treated here as behaving like ordinary repayable/refinanceable short-term debt (Inference, not from filings) because no contrary evidence (default notice, going-concern language, covenant breach) appears anywhere in the pool.



---

## balance-sheet-survival / 03_liquidity-runway.md

_Source: `03_liquidity-runway.md`_

# Liquidity Runway — UBER

**Reporting currency:** USD (millions unless stated). **Source-pool caveat (carried from `00`–`02`):** no primary SEC filing (10-K/10-Q) is physically present in `data/UBER/`; every figure below is Capital IQ's vendor transcription of Uber's FY2025 10-K (filed 2026-02-13) and Q2 FY2026 results (released 2026-08-05) — cited as "CIQ export," never as "10-K." The Q2 FY2026 earnings-call transcript (Aug-05-2026) is a primary call record and is cited as such. All balance-sheet figures are as of Jun-30-2026 unless stated; the revolver availability figure is the most recent disclosed (Mar-31-2026) and is flagged as stale by ~4 months.

## 1. Liquidity Sources (committed only)

| Source | Amount ($mm) | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | 4,870 | Y | Not restricted | `01_capital-structure-and-leverage.md` §3, CIQ Balance Sheet tab, Jun-30-2026 |
| Liquid short-term investments | 521 | Y | Not restricted | `01_capital-structure-and-leverage.md` §3, CIQ Balance Sheet tab, Jun-30-2026 |
| Revolver / facility (commitment) | 4,668 (undrawn) | maybe | Senior Unsecured Revolving Loans; $0 drawn; matures 2029-09-26. Figure is Mar-31-2026, not re-disclosed at Jun-30-2026 — stale by ~4 months. Not a borrowing-base facility on the evidence available, so availability = commitment, not a reduced borrowing base | `02_maturity-wall-and-refinancing.md` §4, CIQ Capital Structure Summary tab |
| Revolver availability (as disclosed) | 4,668 | Y | Treated as committed by convention (tagged "Revolving Credit," not a demand line, $0 drawn across every period shown) — **flagged: not independently confirmed as "committed" in the pool** (no credit agreement present) | `01_capital-structure-and-leverage.md` §1; `02_maturity-wall-and-refinancing.md` §4 |
| **Total usable liquidity** | **10,059** | | = 4,870 + 521 + 4,668 | Calc. |

**Excluded from the headline figure (per hard rule):**
- **Commercial paper program, $2,000mm undrawn capacity** — excluded. CP issuance depends on market appetite at the time of need, not on a firm commitment; it is not treated as committed, undrawn liquidity even though $0 is currently drawn against the program. [`01_capital-structure-and-leverage.md` §1, CIQ Capital Structure Details/Summary tabs]
- **Restricted cash, $661mm** — excluded and flagged. Not usable for near-term obligations. [`01_capital-structure-and-leverage.md` §3, CIQ Balance Sheet tab, Jun-30-2026, "Restricted Cash" line]
- **Long-term investments, $12,532mm** (incl. $3,773mm of equity-method stakes, including AV-partner and Delivery Hero-adjacent holdings) — excluded as illiquid, not near-cash. [`01_capital-structure-and-leverage.md` §3]

No minimum-liquidity or springing-liquidity covenant is disclosed in the pool, so nothing is subtracted for one [`04_coverage-and-covenants.md` §2]. Reporting currency: USD.

## 2. Near-Term Uses (next 12 months)

| Use | Amount ($mm) | Source |
|---|---:|---|
| Debt maturities (from `02`) | 2,175 | `02_maturity-wall-and-refinancing.md` §1 — "Within 12 months (by ~Jun-2027)": $1,997mm unidentified new short-term debt (H1 FY2026, no instrument detail disclosed) + $178mm current lease obligations, CIQ Balance Sheet tab, Jun-30-2026 |
| Cash interest (LTM gross, used as next-12-month proxy) | 462 | `04_coverage-and-covenants.md` §1, CIQ Income Statement tab, "Interest Expense," LTM Jun-30-2026 |
| Maintenance capex | 308 | CIQ Cash Flow tab, "Capital Expenditure," LTM Jun-30-2026. **Inference, not from filings:** the pool does not split capex between maintenance and growth; total capex (an asset-light business, so the split is likely small) is used as a conservative proxy |
| Committed dividends / buybacks | 0 committed | Uber has never paid a dividend in any period shown, FY2021–LTM ("Total Dividends Paid" = "-") [`earnings/01_historical-financials.md` §1; CIQ Cash Flow tab]. The buyback program (management states "deploying about 50% of our free cash flows towards buybacks" [Q2 FY2026 transcript, p.12]) is **discretionary, not contractual** — evidenced by management itself throttling it by ~$4bn in Q2 FY2026 to fund the Delivery Hero stake purchase [`business-model/11_capital-allocation-governance.md`]. Treated here as $0 committed; see §4 for how a resumed buyback would change the picture |
| **Total near-term uses** | **2,945** | Sum |

## 3. Runway

| Metric | Value |
|---|---:|
| Total committed liquidity | $10,059mm |
| Annual FCF (LTM, CFO − total capex, CLAUDE.md §15 basis) | $10,116mm (= $10,424mm CFO − $308mm capex) [`02_maturity-wall-and-refinancing.md` §4, CIQ Cash Flow tab, LTM; cross-checked to management: "a little bit over $10 billion in free cash flows over the trailing 12 months," Q2 FY2026 transcript, p.11-12] |
| Basis used | **Net-of-FCF** — FCF is meaningfully positive, growing (+18.5% YoY), and cash-backed: CFO has exceeded Adj. EBITDA for three straight years, reaching 115.7% of Adj. EBITDA in FY2025 [`earnings/06_earnings-quality.md` §9, cited via `04_coverage-and-covenants.md` §1] |
| Annual net cash burn (net-of-FCF basis) | **−$7,941mm** (a surplus, not a burn). Formula: (12-month debt maturities $2,175mm + committed dividends/buybacks $0) − FCF $10,116mm = 2,175 − 10,116 = −7,941. **Cash interest ($462mm) and maintenance capex ($308mm) are NOT re-added** — FCF (CFO − total capex) already carries both, per the module's net-of-FCF formula |
| Monthly net cash burn | **−$662mm/month** (net cash build, not burn): −7,941 / 12 |
| **Liquidity runway (months)** | **Not a finite runway — FCF surplus.** LTM FCF ($10,116mm) exceeds the entire next-12-month obligations bucket ($2,175mm of maturities + $0 committed returns) by $7,941mm/year. Liquidity alone ($10,059mm) also covers 12-month maturities 4.6x over (10,059/2,175) before any FCF is counted |

**Conservative cross-check — liquidity-only runway with FCF assumed at zero (i.e., the gross-obligations basis, run here only as a stress sanity check, not the module-designated basis since FCF is reliable):** monthly burn = full 12-month uses ÷ 12 = $2,945mm / 12 = $245mm/month. On that basis, $10,059mm of committed liquidity alone — with **no** operating cash inflow credited at all — funds **~41 months (~3.4 years)** of debt service, interest, capex, and returns. This is the floor case; it is not the headline figure because FCF is real, cash-backed, and not a fragile assumption (§3 read below), but it shows the in-hand-liquidity cushion is deep even without FCF.

### Seasonality / Peak Liquidity Need (Hard Check)

Working capital is **mildly seasonal, not sharply so**: Q1 is consistently the softest revenue quarter (~23% of annual revenue vs. a ~25% even split) and Q4 the strongest (~27–28%) in every one of the last three fiscal years (FY2023–FY2025), with Adj. EBITDA margin following the same pattern (lowest in Q1, highest in Q4) [`earnings/01_historical-financials.md` §5]. Working capital itself (current assets − current liabilities) has moved from −$205mm (FY2021) to +$1,673mm (FY2025) and is described as "volatile" year to year [`earnings/01_historical-financials.md` §1], but no dollar figure for a peak-quarter cash-usage build (e.g., a driver/courier-incentive or insurance-reserve seasonal swing) is disclosed anywhere in the pool. **Peak working-capital need not disclosed — runway may be overstated.** Given the mild historical seasonality band (Q1 revenue share ~22–24% vs. a flat 25%), the plausible seasonal swing is small relative to the ~$8bn annual FCF surplus computed above, but it is not quantified and is not netted into any figure in this report.

## 4. Sources & Uses Bridge

Internal sources cover the next 12 months many times over without any external access: $10,059mm of already-in-hand committed liquidity (cash, liquid investments, and undrawn committed revolver — none of it dependent on market conditions) alone covers the $2,945mm of total near-term uses (maturities + interest + capex) 3.4x, before a dollar of FCF is credited. Layering in LTM FCF ($10,116mm, cash-backed per `earnings/06`) turns the 12-month picture into a projected $7,941mm net cash build, not a drawdown. **Roughly 78% of the total coverage cushion is already-in-hand liquidity ($10,059mm of the combined $10,059mm liquidity + $7,941mm FCF-surplus-above-obligations ≈ $18.0bn total buffer), and the remaining ~22% depends on FCF continuing at its current run rate** — a lower bar than most companies face, since even the fully conservative zero-FCF stress case (§3) still shows ~41 months of coverage from liquidity alone. The one live call on this cushion not reflected above: if Uber resumes its ~50%-of-FCF buyback policy at its recent run rate (~$6.5–6.9bn/year, per `business-model/11_capital-allocation-governance.md`) rather than continuing to throttle it for M&A, roughly two-thirds of the annual FCF surplus would be redirected to discretionary shareholder returns — still leaving a comfortable surplus over the disclosed $2,175mm 12-month maturity wall, but materially thinner than the headline $7,941mm figure if both buybacks and further M&A cash calls (see §5) draw on the same pool simultaneously.

## 5. Liquidity Read

Uber does not have a finite liquidity runway in any meaningful sense — it has an annual FCF surplus of roughly $7,941mm over its disclosed 12-month obligations, on top of $10,059mm of already-in-hand committed liquidity that alone would fund ~41 months of debt service, interest, capex, and returns even crediting zero operating cash flow. The runway depends almost entirely on cash already in hand rather than on FCF materializing — FCF is a bonus buffer, not a load-bearing assumption, and it is cash-backed (CFO has exceeded Adj. EBITDA every year since FY2023). The single biggest liquidity risk this report can identify is **not captured in any figure above**: the pending ~€14 billion Delivery Hero acquisition bridge facility (signed 2026-07-16, committed but undrawn, offer expected H2 2027) is roughly 1.6x the size of Uber's entire current $10,059mm liquidity pool and is not reflected in this runway at all — once drawn, it would need to be modeled as a separate, much larger liquidity event, which is `06_downside-stress-test`'s job, not this agent's [`01_capital-structure-and-leverage.md` §1; `02_maturity-wall-and-refinancing.md` §4-5]. A secondary, smaller risk is the $1,997mm of unidentified new short-term debt on the balance sheet at Jun-30-2026, whose true cash-maturity terms are not disclosed in this pool [`02_maturity-wall-and-refinancing.md` §1] — it is included in the 12-month uses bucket above at face value, conservatively.



---

## balance-sheet-survival / 04_coverage-and-covenants.md

_Source: `04_coverage-and-covenants.md`_

# Coverage & Covenants — UBER

**Reporting currency:** USD (millions unless stated). **Reporting standard:** US GAAP, fiscal year end Dec-31. **Period base:** LTM ended Jun-30-2026 unless stated otherwise (Q2 FY2026 press release, released 2026-08-05). **Source-pool caveat (carried from `00_solvency-data-triage.md` / `01_capital-structure-and-leverage.md`):** no primary SEC filing (10-K/10-Q) is physically present in `data/UBER/`; every figure below is Capital IQ's vendor transcription of Uber's FY2025 10-K (filed 2026-02-13) and Q2 FY2026 results (released 2026-08-05) — cited as "CIQ export," never as "10-K." No `ciq_facts.json` sidecar exists for this run (confirmed: `analyses/UBER_2026-08-06/_pool_extracts/` contains no such file), so every figure is this agent's own sourced read of the CIQ workbook tabs, cross-checked against `earnings/01_historical-financials.md`. **No covenant disclosure exists anywhere in the pool** — confirmed independently at `00_solvency-data-triage.md` §3 ("Covenant disclosure: N — Not disclosed anywhere in the pool — no credit agreement, indenture, or covenant summary is present"). Per the module's partial-data rule, covenant thresholds below are LABELED ASSUMPTIONS calibrated to Uber's actual credit profile (S&P Issuer Credit Rating **BBB+**, investment grade [Company Comparable Analysis Uber Technologies Inc.xls, Credit Health Panel tab, as of 2026-08-06]), and covenant headroom is marked **Not assessable** for scoring purposes even though indicative figures are computed.

## 1. Coverage Ratios

All figures LTM ended Jun-30-2026. Interest is **gross** (per Calculation Standard 5: "use gross interest expense unless net interest is disclosed and justified") — Uber's Interest Expense line is $462mm LTM [CIQ export, Financials.xls, Income Statement tab, "Interest Expense" row, LTM Jun-30-2026 column]. Note for context: Uber also earned $740mm of Interest and Investment Income over the same period, so its **net** interest position is actually a net $278mm of *income*, not expense [same source, "Interest and Invest. Income" and "Net Interest Exp." rows] — using gross interest is the more conservative read and is what the table below uses throughout.

| Ratio | Value | Source |
|---|---:|---|
| EBITDA (GAAP) / interest | 7,474 / 462 = **16.18x** | CIQ export, Income Statement tab, "EBITDA" supplemental row and "Interest Expense" row, LTM Jun-30-2026 |
| EBITDA (Adj., company-defined) / interest | 10,043 / 462 = **21.74x** | CIQ export, Segments tab "Total EBITDA" (cross-checked to `earnings/01_historical-financials.md` §2) / Income Statement "Interest Expense," LTM Jun-30-2026 |
| EBIT / interest | 6,700 / 462 = **14.50x** | CIQ export, Income Statement tab, "EBIT"/"Operating Income" row, LTM Jun-30-2026 |
| (EBITDA GAAP − capex) / interest | (7,474 − 308) / 462 = **15.51x** | CIQ export, Income Statement + Cash Flow tab ("Capital Expenditure," LTM $308mm), LTM Jun-30-2026 |
| (EBITDA Adj. − capex) / interest | (10,043 − 308) / 462 = **21.07x** | Same sources |
| Fixed-charge coverage — Basis A (itemized instrument schedule) | (7,166) / (462 + 159 + 265) = **8.09x** (GAAP EBITDA); (9,735) / 886 = **10.99x** (Adj. EBITDA) | CIQ export, Capital Structure Summary tab, FY2025 "Fixed Payment Schedule" ("LT Debt Incl. Cap. Leases Due +1" = $159.1mm; "Operating Lease Commitment Due +1" = $265mm) |
| Fixed-charge coverage — Basis B (latest balance-sheet current maturities, conservative) | (7,166) / (462 + 1,997 + 178) = **2.72x** (GAAP EBITDA); (9,735) / 2,637 = **3.69x** (Adj. EBITDA) | CIQ export, Balance Sheet tab, Jun-30-2026 Press-Release column ("Current Portion of LT Debt" $1,997mm + "Current Portion of Leases" $178mm), per `01_capital-structure-and-leverage.md` §1 roll-forward |

**EBITDA basis stated:** both GAAP-based (Operating Income + D&A) and Adjusted (company-defined, non-GAAP, adds back stock-based compensation and unitemized items) are shown throughout, per `01`'s convention. **Interest basis stated:** gross, per above.

**Two fixed-charge coverage bases, and why they diverge so much (2.72x–3.69x vs. 8.09x–10.99x):** Basis A uses the FY2025 itemized "Fixed Payment Schedule" tab, where scheduled near-term principal is small ($159mm of long-term debt/cap-lease principal, $265mm of operating-lease payments — Uber's bond stack is almost entirely bullet-maturity, non-amortizing). Basis B uses the actual Jun-30-2026 balance sheet, where **Current Portion of LT Debt jumped to $1,997mm** from $307mm (leases only) at FY2025 year-end [`01_capital-structure-and-leverage.md` §1] — a nearly $1.7bn increase with **no instrument-level breakout disclosed in the pool** for what moved current. A plausible explanation not confirmed by the pool: the $1,725mm 2028 Convertible Notes (0.875% coupon) can be reclassified as a current liability under US GAAP if the notes become currently convertible (a standard mechanical trigger tied to Uber's own stock price versus the conversion price), which would inflate "current portion" without representing a genuine near-term cash outflow (conversion typically settles in equity, not cash). **This ambiguity is not resolved in this pool — flagged for `02_maturity-wall-and-refinancing`, whose job is the maturity wall itself.** Per the module's conservative-default rule, this agent reports Basis B (2.72x–3.69x) as the more conservative, headline fixed-charge coverage figure, with Basis A shown alongside as the instrument-schedule alternative.

**Cash quality cross-check (`earnings/06_earnings-quality.md`):** "cash-backed operating earnings are genuinely strong and improving — CFO has exceeded Adj. EBITDA for three straight years, reaching 115.7% in FY2025" [`earnings/06_earnings-quality.md` §9]. EBITDA used above is **not** materially inflated versus cash-backed earnings — no coverage caveat is warranted on cash-quality grounds. The one flagged gap in `earnings/06` is that ~24–25% of the FY2025/LTM GAAP→Adj. EBITDA bridge ($592mm of $2,418mm FY2025; ~$630mm of $2,569mm LTM) is not itemized beyond stock-based compensation [`earnings/01_historical-financials.md` §4] — relevant to covenant-EBITDA quality in Section 2 below, not to the cash-backing of coverage.

## 2. Covenant Inventory

**No maintenance-covenant thresholds are disclosed anywhere in the data pool** — no credit agreement, bond indenture excerpt, or covenant summary is present; only instrument-level terms (coupon, maturity, security, seniority) appear in the Capital Structure Details/Summary tabs [`00_solvency-data-triage.md` §3]. Per the partial-data rule, the rows below apply **labeled market-typical assumptions calibrated to Uber's actual credit profile** (S&P BBB+, unsecured revolving credit facility, no secured bank debt) rather than the rule's own generic leveraged-borrower example (4.0–4.5x / 2.0–3.0x), because Uber is investment-grade, not a leveraged borrower — using a leveraged-borrower assumption on an IG name would understate headroom and misstate the credit. **All headroom in this table is Inference, not from filings, and is marked Not assessable for scoring.**

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage (labeled assumption: ~3.5x, typical for a large-cap IG unsecured revolving credit facility) | 3.5x (assumption) | Net debt (strict, canonical) / EBITDA: **1.32x** (GAAP) / **0.98x** (Adj.) | **+62% (GAAP basis) / +72% (Adj. basis)** — Inference, not from filings | Actual: `01_capital-structure-and-leverage.md` §5 (net debt $9,861mm / EBITDA). Threshold: labeled assumption, no filed source |
| Min interest coverage (labeled assumption: ~3.0x, if such a covenant exists at all — many large-cap IG unsecured revolvers carry no coverage covenant) | 3.0x (assumption) | EBITDA/interest: **16.18x** (GAAP) / **21.74x** (Adj.) | **+439% (GAAP basis) / +625% (Adj. basis)** — Inference, not from filings | Actual: Section 1 above. Threshold: labeled assumption, no filed source |
| Min liquidity / net worth | Not disclosed; no evidence such a covenant exists for this instrument type | n/a | Not assessable | `00_solvency-data-triage.md` §3 |
| Springing covenant trigger (e.g., revolver utilization threshold) | Not disclosed. If one exists (common structure: springs when revolver utilization exceeds ~25–30%), it is **not currently active** — revolver is $0 drawn / $4,657mm undrawn at FY2025 (0% utilization) [`01_capital-structure-and-leverage.md` §1] | 0% utilization | Not applicable at current utilization | `01_capital-structure-and-leverage.md` §1; assumption on trigger level is Inference, not from filings |
| Equity cure rights (Y/N, limits) | Not disclosed in the pool | n/a | Not assessable | `00_solvency-data-triage.md` §3 |
| Other — pending Delivery Hero bridge facility (~€14bn, committed, not yet drawn) | Covenant package for this facility is not disclosed anywhere in the pool | n/a — facility not yet drawn, not in any balance-sheet figure above | Not assessable; material forward risk | `01_capital-structure-and-leverage.md` §1, citing `UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf` deal-summary text and `business-model/11_capital-allocation-governance.md` |

**Why the labeled assumption still matters despite the huge indicative headroom:** even on the module's own generic leveraged-borrower thresholds (4.0x max leverage, not the tighter 3.5x used here), Uber's actual net leverage (0.98x–1.32x) would clear with wide margin. The credit-profile read (S&P BBB+, unsecured, undrawn $4,657mm revolver, $6,657mm total undrawn credit including commercial paper [`01_capital-structure-and-leverage.md` §1]) is consistent with an issuer whose *existing* obligations carry no realistic near-term covenant risk. **The risk that matters here is not today's covenant math — it is the undisclosed covenant package on the pending ~€14bn Delivery Hero bridge facility**, which is a near-certain, material future addition to gross debt not reflected in any ratio above (see the pro-forma note in Section 3).

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | **Undisclosed.** No credit agreement is in the pool, so there is no filed covenant-EBITDA definition. Section 2's indicative headroom instead uses the two EBITDA series this pool does disclose: GAAP-based EBITDA (Operating Income + D&A) and Uber's own company-defined Adjusted EBITDA. | `00_solvency-data-triage.md` §3; `01_capital-structure-and-leverage.md` §5 |
| Addbacks permitted (types) | Undisclosed for any covenant-specific definition. Uber's own **Adjusted EBITDA** (the closest real-world proxy for what a covenant definition would likely track) adds back stock-based compensation ($1,939mm LTM) plus an unitemized remainder (~$630mm LTM, ~25% of the total $2,569mm GAAP→Adj. bridge) not broken out in this pool. | `earnings/01_historical-financials.md` §4 |
| Addback caps / limits | Undisclosed — no addback cap is stated anywhere in the pool. | `00_solvency-data-triage.md` §3 |
| Is covenant EBITDA materially above reported EBITDA? | **Not assessable directly** (no covenant-EBITDA definition exists to compare against), but as a proxy: Uber's own Adjusted EBITDA ($10,043mm LTM) is **34.4% above** GAAP-based EBITDA ($7,474mm LTM) [Calc: (10,043−7,474)/7,474]. If a future credit agreement's covenant-EBITDA definition tracks something close to Adjusted EBITDA, roughly a quarter of that adjustment gap is not itemized in this pool — an "addback illusion" risk flag for any future covenant-headroom calculation, not a finding about today's (non-existent) covenant. | Calc. from `earnings/01_historical-financials.md` §4 |

**Headroom-quality verdict:** because no covenant-EBITDA definition is disclosed, the indicative headroom in Section 2 is **low-quality by construction** — it rests on this agent's own choice of GAAP vs. Adjusted EBITDA, not a filed definition. Per `MODULE_RULES.md` Score Cap Rules ("Covenant headroom relies on assumed covenant-EBITDA addbacks → Covenant headroom max 60"), covenant headroom for this name is **Not assessable** for scoring, notwithstanding the wide indicative margin computed above.

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant (indicative, labeled assumption) | Max net leverage (assumed 3.5x) — the smallest indicative headroom of the two assumed covenants (+62% GAAP / +72% Adj., vs. +439%/+625% on the assumed interest-coverage covenant) |
| Headroom on tightest covenant (%) | **+62% (GAAP EBITDA basis) / +72% (Adj. EBITDA basis)** — Inference, not from filings; Not assessable for scoring (no filed covenant exists) |
| EBITDA decline that would breach it (approx.) | On the assumed 3.5x threshold and current net debt ($9,861mm strict): breach requires GAAP EBITDA to fall to $9,861/3.5 = **$2,817mm**, a **62.3% decline** from the current $7,474mm LTM GAAP EBITDA. Calc: (7,474 − 2,817)/7,474 = 62.3% |
| Debt increase that would breach it (approx.) | On the assumed 3.5x threshold and current GAAP EBITDA held flat ($7,474mm): breach requires net debt to rise to 3.5 × 7,474 = **$26,159mm**, a **+$16,298mm increase (+165%)** from the current $9,861mm strict net debt |
| Pro-forma overlay: ~€14bn Delivery Hero bridge facility, illustrative | **Not sunk — the facility is signed but undrawn and not in any figure above** [`01_capital-structure-and-leverage.md` §1]. Illustrative only (Inference, not from filings; FX rate is an unverified estimate, not sourced from the pool): at a rough ~1.16 EUR/USD, €14,000mm ≈ $16,240mm. If fully drawn on top of current net debt with EBITDA unchanged, pro-forma net debt ≈ $26,101mm, pro-forma net leverage ≈ **3.49x (GAAP EBITDA) / 2.60x (Adj. EBITDA)** — i.e., on the GAAP-EBITDA basis this illustrative full-draw scenario lands almost exactly on the assumed 3.5x covenant threshold, with **~0% indicative headroom left** on that basis (vs. ~26% on the Adj. EBITDA basis). This combines two unresolved unknowns (an assumed covenant threshold and an unsourced FX estimate) and is shown only to size the direction of the risk, not as a breach forecast. |

## 4. Coverage / Covenant Read

Earnings comfortably cover interest today — EBITDA/interest is 16.18x on GAAP EBITDA and 21.74x on Uber's own Adjusted EBITDA, both on gross interest of $462mm LTM, and Uber is in fact a net interest earner ($278mm of net interest income, not expense) [Income Statement tab, LTM Jun-30-2026]. Fixed-charge coverage is a wider range — 2.72x–3.69x on the conservative, latest-balance-sheet basis (driven by a $1,997mm current-portion-of-debt figure whose composition is not disclosed in this pool and may include a convertible-note reclassification rather than real near-term cash principal) versus 8.09x–10.99x on the itemized instrument schedule, which better reflects Uber's actual bullet-maturity bond stack.

No maintenance covenant is disclosed anywhere in the pool, so there is no real "tightest covenant" to report — every headroom figure above is this agent's own labeled assumption (net leverage ≤3.5x, interest coverage ≥3.0x, both Inference, not from filings), and covenant headroom is marked **Not assessable** for scoring per the module's partial-data rule. On those assumed thresholds, today's actual net leverage (1.32x GAAP / 0.98x Adj.) would need a 62% EBITDA decline or a 165% net-debt increase to breach — a wide margin that is consistent with the credit's S&P BBB+ investment-grade rating.

What would actually move this posture is not visible in this pool: the pending ~€14bn Delivery Hero bridge facility is not yet drawn and carries no disclosed covenant package, but an illustrative full-draw scenario (net debt + ~$16.2bn, EBITDA unchanged) lands right at the assumed 3.5x threshold on a GAAP-EBITDA basis — the real covenant question for this name is what that facility's terms look like once signed, not the current, largely covenant-light bond-and-revolver stack.



---

## balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md

_Source: `05_off-balance-sheet-and-contingencies.md`_

# Off-Balance-Sheet & Contingencies — UBER

**Reporting currency:** USD (millions unless stated). **Reporting standard:** US GAAP, fiscal year end Dec-31. **Source-pool caveat (carried from `00_solvency-data-triage.md` / `01_capital-structure-and-leverage.md`):** no primary SEC filing (10-K/10-Q) is physically present in `data/UBER/`. Every figure below is Capital IQ's vendor transcription of Uber's FY2025 10-K (filed 2026-02-13) and Q2 FY2026 results (released 2026-08-05), cited as "CIQ export," never as "10-K." **There is no dedicated Commitments & Contingencies note in this pool** — confirmed by a targeted search across all 37 workbook tabs and 8 non-workbook documents for "commitment," "contingen*," "guarantee," "letter of credit," "indemnif*," and "litigat*"; the only hits are (a) a Supplemental-tab tax-contingency rollforward, (b) the Delivery Hero deal's break-fee terms, (c) one active lawsuit surfaced as a news item in the CIQ Landscape report, and (d) the operating-lease payment schedule (already on-balance-sheet, per `01`). This is consistent with `00`'s finding of "Partial" commitments/contingencies disclosure and its flag: *"Off-balance-sheet exposures undisclosed for a known-litigious/levered name → Solvency strength max 75."* This agent's own read below reinforces rather than resolves that cap.

## 1. Off-Balance-Sheet / Debt-Like Obligations

| Item | Recognized Liability | Maximum / Gross Exposure | Already in 01's debt? | Source |
|---|---:|---:|---|---|
| Operating leases (US GAAP ASC 842 — capitalized, not off-balance-sheet) | $1,559mm (FY2025 lease liability); combined finance+operating lease liability $2,008mm at Jun-30-2026 (not split in the press-release balance sheet) | $2,771mm total undiscounted future minimum lease payments (Due Next 5 Yrs $1,179mm + Due After 5 Yrs $1,592mm, FY2025) vs. the $1,559mm discounted liability — the ~$1,212mm gap is imputed interest, not an unrecognized obligation | **Yes** — already inside `01`'s $14,731mm gross-debt figure (Jun-30-2026); listed here only to confirm no add-back is needed | CIQ export, Financials.xls, Capital Structure Summary tab, "Operating Lease Commitment Due" rows, FY2025 |
| Pension / OPEB underfunding | None | None | n/a | CIQ export, Financials.xls, Pension/OPEB tab — "No Data Available"; Uber discloses no pension/OPEB plan, a true absence of the obligation, not a missing disclosure (consistent with `00` and `01`) |
| Securitization / factoring | Not disclosed | Not disclosed | n/a | No securitization, receivables-factoring, or off-balance-sheet SPE vehicle is evidenced anywhere in the pool — flagged as a genuine data gap, not assumed zero |
| Purchase / take-or-pay commitments | Not disclosed | Not disclosed | n/a | No purchase-obligation or take-or-pay schedule is disclosed in this pool (the "Fixed Payment Schedule" in `01`/`02` covers debt and lease payments only, not vendor/supply commitments) |
| Delivery Hero SE acquisition — reciprocal termination fee | $0 recorded (contingent; deal not closed) | **€700mm payable by Uber** if Uber terminates (Delivery Hero pays €200mm if it terminates) ≈ **$803mm** at an implied ~1.147 USD/EUR rate, derived from the deal's own stated dual-currency equivalent (€12.9bn equity value = $14.8bn) — not an independently sourced/dated FX rate, used only for this comparison | **No** — not in `01`'s debt stack; this is a new item this agent surfaces | CIQ export, UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf, Delivery Hero deal-summary text, announced 2026-07-16 |
| Careem Technologies — remaining-stake put/call option | $100mm (agreed 12.50% stake purchase from e&, announced 2026-06-01, size disclosed) | Undisclosed — a reciprocal put option (e&) / call option (Uber) on e&'s remaining 37.53% Careem stake, exercisable Dec-2031–Jan-2032; no strike price or valuation formula is disclosed in this pool | **No** — a future, price-undisclosed contingent purchase obligation, not in `01`'s debt stack | CIQ export, UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf, Careem deal-summary text |

State the reporting currency: **USD**. Uber's own dollar/euro dual-currency figures are used verbatim where the company states both (e.g., €12.9bn/$14.8bn); the €700mm/€200mm break-fee figures carry no company-stated dollar equivalent, so the USD figure shown is this agent's own labeled conversion at the deal's implied rate (CLAUDE.md §27), not a filed number.

## 2. Guarantees & Letters of Credit

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| Standby letters of credit | Not disclosed | Not disclosed | n/a | Not disclosed anywhere in the pool — no credit-agreement, indenture, or LC-facility summary is present (consistent with `00`'s covenant-disclosure gap) |
| Financial guarantees | Not disclosed | Not disclosed | n/a | Not disclosed in the pool |
| Performance / surety bonds | Not disclosed | Not disclosed | n/a | Not disclosed in the pool |

This is a genuine data gap, not an assumption of zero exposure. A ride-hailing/delivery platform operating across ~70 countries typically carries some regulatory/insurance surety or performance-bond posting requirements at the local-license level; none is itemized in this pool. Per the module's partial-data rule, undisclosed guarantee/LC exposure **cannot be ruled out** and is treated as a residual unknown, not zero.

## 3. Litigation & Tax Contingencies

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) | Source |
|---|---:|---:|---|---|
| Kahare v. Uber Technologies, Inc., Portier, LLC, et al. (wrongful-death / vicarious-liability suit, Middlesex Superior Court, MA) | Not disclosed / unknown | Unspecified — complaint seeks "compensatory and punitive damages," no dollar figure stated | **Active** — filed 2026-07-31, ~1 week before this report date; no resolution reported | CIQ export, UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf, "Michael Kelly Injury Lawyers Files Wrongful Death Lawsuit…," Jul-31-2026, Source: PR Newswire |
| Unrecognized tax benefits (FIN 48 / ASC 740-10 rollforward, uncertain tax positions, all jurisdictions aggregated) | **$5,611mm** (FY2025 year-end gross unrecognized tax benefit) — presumed substantially housed within "Other Non-Current Liabilities" ($9,373mm, FY2025); the pool does **not** separately break out the UTB liability on the face of the balance sheet, so this agent cannot confirm what portion is actually accrued there vs. genuinely unprovided-for | $5,611mm is itself the ceiling of the disclosed rollforward; of this, **$5,100mm** is flagged by the company's own disclosure as the portion that "would impact the effective tax rate" if resolved — i.e., material P&L sensitivity to how these positions are ultimately settled | **Live / growing, not remote** — balance rose from $4,937mm (FY2024) to $5,611mm (FY2025), a **+$674mm (+13.7%) increase in one year**, with a fresh $693mm addition for current-year positions in FY2025 alone; no settlement or statute-of-limitations lapse of comparable size in the same period ($5mm settled, $1mm lapsed) | CIQ export, Financials.xls, Supplemental tab, "Adoption of FIN 48 Related Items," FY2020–FY2025 |
| Driver / worker-classification litigation and regulatory reclassification (structural category, not a named case) | Not disclosed / unquantified | Not disclosed / unquantified | **Live as a category** — `business-model/10_external-dependency.md` and `business-model/12_red-flags-sweep.md` both name driver/worker classification as "the single biggest lever" and cite a UK regulatory reclassification that already cut ~400bps off Mobility's reported take rate this quarter; no dollar reserve, settlement, or maximum-exposure figure for classification litigation specifically is anywhere in this pool | `business-model/10_external-dependency.md`, §Classification row "Government policy / Regulation — High"; `business-model/12_red-flags-sweep.md` |

Use of the company's own probability language: the pool contains no explicit "probable / reasonably possible / remote" language for any of the three items above (no risk-factors section or contingencies note is present) — status above is this agent's own read of filing dates, trend, and news-item recency, labeled as **Inference, not from filings** for the "live/active" characterization, while the underlying dollar figures (UTB rollforward, break-fee terms, lawsuit filing) are directly sourced.

## 4. Contingent Exposure Summary

| Metric | Value |
|---|---:|
| Total recognized contingent liabilities | **$5,611mm** — the FY2025 gross unrecognized tax benefit, presumed (not confirmed) substantially accrued within Other Non-Current Liabilities; all other items in Sections 1–3 carry $0 recorded / not disclosed |
| Total maximum / gross exposure | **≥$6,414mm** = $5,611mm (UTB) + $803mm (Delivery Hero €700mm break fee) — **PLUS** unquantified: the Kahare wrongful-death claim, driver/worker-classification exposure, and the Careem remaining-stake put/call price. The true figure is understated because three of five items in this report carry no dollar ceiling |
| Max exposure ÷ recognized | **1.14x** ($6,414mm / $5,611mm) — appears modest only because the single largest item (UTB) is counted in both the numerator and denominator; the genuinely *unrecognized* increment (break fee + unquantified items) is smaller in isolation but open-ended |
| Max exposure ÷ total equity | **22.6%** ($6,414mm / $28,399mm total equity incl. minority interest, Jun-30-2026, per `01`) |

## 5. Contingency Read

The largest quantified contingent item is not litigation — it is a **$5,611mm gross unrecognized tax benefit** (FY2025) that grew $674mm (+14%) in one year and is not separately broken out on the balance sheet, so this agent cannot confirm it is fully provisioned; layered on top is a **live, unresolved €700mm (~$803mm) termination-fee exposure** tied to the pending Delivery Hero acquisition, plus at least one active wrongful-death lawsuit and an unquantified driver-classification risk category that recurring UK/US regulatory action shows is not theoretical. None of these three items alone threatens solvency, but together they total at least **22.6% of Jun-30-2026 total equity** against a pool that contains no dedicated commitments-and-contingencies note, no covenant-package disclosure, and no guarantee/LC schedule — so undisclosed exposures beyond what is captured here cannot be ruled out. If the UTB were to crystallize unfavorably at anywhere near its full $5.1bn effective-tax-rate-sensitive portion, it would land directly on the income statement in the period resolved, cutting into the cash-generation base this module's stress test (`06`) relies on.

RF-OBS-001 (contingent-liability spike)

The trigger is applied on the conservative-default basis (CLAUDE.md §4): the pool cannot confirm the UTB is fully accrued (it is not broken out from the $9,373mm Other Non-Current Liabilities line), the balance is growing YoY rather than resolving, and the Delivery Hero break fee is a live, unresolved deal term — so max exposure ÷ total equity (22.6%) clears the 15% rule-of-thumb threshold with the underlying matters live rather than remote or dormant.



---

## balance-sheet-survival / 06_downside-stress-test.md

_Source: `06_downside-stress-test.md`_

# Downside Stress Test — UBER

**Reporting currency:** USD (millions unless stated). **Reporting standard:** US GAAP, fiscal year end Dec-31. **Period base:** LTM ended Jun-30-2026 unless stated. **Source-pool caveat (carried from `00`–`05`):** no primary SEC filing (10-K/10-Q) is physically present in `data/UBER/`; every balance-sheet, debt, and covenant figure below is Capital IQ's vendor transcription of Uber's FY2025 10-K (filed 2026-02-13) and Q2 FY2026 results (released 2026-08-05), cited as "CIQ export," never as "10-K." **No maintenance covenant is disclosed anywhere in the pool** — per `04_coverage-and-covenants.md`, all covenant thresholds used below are **labeled assumptions** calibrated to Uber's S&P BBB+ credit profile, and every breach point derived from them is **indicative, not a filed fact**.

**EBITDA basis used:** two bases are carried throughout, exactly as `01`/`04` present them — **Reported/GAAP-based EBITDA** (Operating Income + D&A, LTM = $7,474mm) and **Adjusted EBITDA** (company-defined, non-GAAP, LTM = $10,043mm). Both are **cash-backed**: `earnings/06_earnings-quality.md` §2 shows CFO has exceeded Adjusted EBITDA every year since FY2023 (115.7% in FY2025, 103.8% LTM), so neither EBITDA base is inflated relative to cash generation — this report does not need to discount either series for cash-quality reasons. GAAP-based EBITDA is used as the primary haircut base (the more conservative of the two, and the one that does not carry a large non-cash stock-based-compensation add-back), with Adjusted EBITDA shown in parallel throughout, per module convention.

## 0. Pending Acquisition — Pro-Forma Trigger (mandatory check)

Uber signed a Business Combination Agreement (2026-07-16) to buy the remaining ~63.21% of Delivery Hero SE for **€8.4bn cash** (€41.50/share; implied 100%-equity value €12.9bn / $14.8bn, per the deal's own stated dual-currency equivalent), financed by a **committed bridge facility of ~€14bn**. The deal is signed but **not closed** (offer expected H2 2027; termination fees €700mm Uber / €200mm Delivery Hero) [`01_capital-structure-and-leverage.md` §1, citing `UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf` deal-summary text]. This is a material, near-certain pending acquisition not yet reflected in the reported balance sheet, so **Section 3 below builds a pro-forma overlay in addition to the disclosed-balance-sheet stress**, per the module's pending-acquisition rule.

**FX used throughout this report:** the deal's own stated dual-currency equivalent, €12.9bn = $14.8bn → implied rate **1.14729 USD/EUR**, applied consistently to every euro figure below (per CLAUDE.md §27 — use the filing's own stated equivalent rather than an independently sourced rate).

**Already-reflected vs. pending:** ~$4,000mm of open-market Delivery Hero share purchases in Q2 FY2026 are **already inside** the current $9,861mm net debt (strict) figure [`01_capital-structure-and-leverage.md` §1, §6] — not added again here. What is **not yet reflected** is the cash consideration for the remaining ~63.21% stake (€8.4bn ≈ **$9,638mm**) and the possibility that the full €14bn bridge facility (≈**$16,062mm**) is drawn to also cover Delivery Hero's own debt refinancing, fees, and buffer.

**Perimeter-matching caveat (Inference, not from filings):** Delivery Hero's own EBITDA and consolidating net debt are **not disclosed anywhere in this pool** — no target financials are present. Per the module's matching rule, this report does **not** add Delivery Hero's own debt to the numerator without its EBITDA in the denominator, and vice versa. The pro-forma below therefore adds only **Uber's own acquisition-financing debt** (the cash consideration, funded by the bridge) to net debt, while holding the EBITDA base at **Uber's own EBITDA only**. This is a labeled, partial pro-forma — it excludes Delivery Hero's own balance sheet and earnings entirely, in both directions, rather than guessing either. The likely direction of the omission: Delivery Hero almost certainly carries its own net debt (it is a public company with its own bond stack), so a **fully combined** pro-forma would show even less headroom than the figures below, not more.

## 1. Base Case (today, disclosed balance sheet — no pro-forma)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (GAAP-based, cash-backed) | $7,474mm (LTM Jun-30-2026) | `01_capital-structure-and-leverage.md` §5, §7 |
| Base EBITDA (Adjusted, company-defined, cash-backed) | $10,043mm (LTM Jun-30-2026) | `01_capital-structure-and-leverage.md` §5, §7 |
| Net debt (strict, §15 basis — CANONICAL, per `01`) | $9,861mm | `01_capital-structure-and-leverage.md` §4, §7 |
| Net debt / EBITDA (GAAP / Adj.) | 1.32x / 0.98x | `01_capital-structure-and-leverage.md` §5 |
| EBITDA / interest (GAAP / Adj., gross interest $462mm) | 16.18x / 21.74x | `04_coverage-and-covenants.md` §1 |
| Tightest covenant + threshold (labeled assumption, Not filed) | Max net leverage ≤3.5x (typical large-cap IG unsecured revolver) | `04_coverage-and-covenants.md` §2, §3 |
| Next-12m obligations | $2,945mm ($2,175mm maturities + $462mm cash interest + $308mm maintenance capex + $0 committed returns) | `03_liquidity-runway.md` §2 |
| Committed liquidity | $10,059mm (cash $4,870mm + ST investments $521mm + undrawn committed revolver $4,668mm) | `03_liquidity-runway.md` §1 |
| Floating-rate debt (gross, drawn) | $0 — 100% of drawn debt is fixed-rate; $4,668mm revolver + $2,000mm commercial paper are floating-if-drawn, currently $0 drawn | `02_maturity-wall-and-refinancing.md` §3 |
| Hedge coverage | Not disclosed in the pool | `02_maturity-wall-and-refinancing.md` §3 |
| Working-capital seasonality / peak build | Mild: Q1 revenue share ~22–24% vs. a flat 25% split; no dollar peak-cash-use figure disclosed | `03_liquidity-runway.md` §3 |

**Reporting currency: USD. EBITDA basis: both GAAP-based and Adjusted (company-defined), each labeled at every use, per `01`/`04` convention.**

## 2. Stress Scenarios — Disclosed Balance Sheet (no pro-forma overlay)

Net debt held at the current $9,861mm (strict) throughout this table — the pro-forma overlay in Section 3 is where the pending acquisition is modeled. FCF pass-through assumption: **stressed FCF(h) ≈ FCF_base − (1 − tax) × GAAP EBITDA_base × h**, holding cash interest and maintenance capex fixed inside the FCF walk, with a labeled **10% effective cash-tax-rate** assumption (Inference, not from filings — conservative relative to Uber's actual FY2025 cash-tax/Adj.-EBITDA ratio of ~4%, reflecting Uber's ~$31.4bn NOL carryforward shield per `earnings/06_earnings-quality.md` §10). Adjusted EBITDA is stressed by subtracting the **same dollar decline** as GAAP EBITDA (its addbacks, chiefly $1,939mm of non-cash stock-based compensation, do not shrink mechanically with an operating downturn).

Executed solve (Python):
```
GAAP_EBITDA(h) = 7474*(1-h);  Adj_EBITDA(h) = 10043 - 7474*h
ND/EBITDA(h)   = 9861 / EBITDA(h)
EBITDA/Int(h)  = EBITDA(h) / 462
Headroom(h)    = (3.5 - ND/EBITDA(h)) / 3.5      [MAX covenant, direction-aware]
FCF(h)         = 10116 - 0.90 * 7474 * h          [10% tax assumption]
12m gap(h)     = 2945 - (10059 + FCF(h))          [negative = surplus]
```

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA (GAAP) | 7,474 | 5,232 | 4,484 | 2,990 | 4,484 | 4,484 |
| EBITDA (Adj.) | 10,043 | 7,801 | 7,053 | 5,559 | 7,053 | 7,053 |
| Net debt / EBITDA (GAAP) | 1.32x | 1.89x | 2.20x | 3.30x | 2.20x | 2.20x (n/a — see note) |
| Net debt / EBITDA (Adj.) | 0.98x | 1.26x | 1.40x | 1.77x | 1.40x | 1.40x (n/a — see note) |
| EBITDA / interest (GAAP) | 16.18x | 11.32x | 9.71x | 6.47x | 9.71x | 9.71x |
| EBITDA / interest (Adj.) | 21.74x | 16.88x | 15.27x | 12.03x | 15.27x | 15.27x |
| Tightest covenant headroom (GAAP / assumed 3.5x max leverage) | +62.3% | +46.1% | +37.2% | **+5.8%** | +37.2% | +37.2% |
| Tightest covenant headroom (Adj.) | +71.9% | +63.9% | +60.1% | +49.3% | +60.1% | +60.1% |
| Covenant breach? (Y/N, GAAP / Adj.) | N / N | N / N | N / N | N / N | N / N | N / N |
| 12-month liquidity gap (uses − sources; negative = surplus) | −17,230 | −15,212 | −14,539 | −13,194 | **−13,849** | −14,539 (n/a — see note) |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

**WC shock (labeled assumption, not disclosed):** 5% of a single quarter's LTM revenue ($55,227mm/4 × 5% ≈ **$690mm**), calibrated to the ~2-point gap between Uber's softest quarter's revenue share (~23%) and a flat 25% split noted in `03_liquidity-runway.md` §3 (no dollar seasonal-build figure is disclosed). Added only to the 12-month uses bucket (does not move EBITDA/leverage/coverage). At −40% EBITDA + this shock, 12-month uses rise to $3,635mm against $17,484mm of sources (liquidity + stressed FCF) — still a **$13,849mm surplus**, not a gap.

**Rate shock (+200bp on floating debt): not applicable / not computable on the disclosed balance sheet.** 100% of drawn debt is fixed-rate and $0 is drawn on the floating-rate revolver or commercial-paper program [`02_maturity-wall-and-refinancing.md` §3] — a +200bp move reprices nothing currently outstanding, and the liquidity surplus at −40% EBITDA (§ above) is large enough that no revolver draw is needed to fund the stress. The columns above show "n/a" flags for that reason; the leverage/coverage/liquidity figures in that column are identical to the plain −40% column because no floating exposure exists to shock. **The real forward rate exposure is the pending Delivery Hero bridge facility (Section 3)** — bridge facilities are conventionally floating-rate, and that exposure does not exist on today's balance sheet.

## 3. Pro-Forma Overlay — Post–Delivery Hero Close

Two illustrative net-debt add-ons (Section 0): **(A) consideration-only** — the disclosed €8.4bn (≈$9,638mm) cash price for the remaining stake, financed by the bridge — pro-forma net debt **$19,498mm**; **(B) full-bridge draw (illustrative upper bound)** — the entire committed €14bn facility (≈$16,062mm) drawn, which 04's own illustrative note suggests may be sized to also cover Delivery Hero's own debt refinancing and fees — pro-forma net debt **$25,923mm**. Both use **Uber's own EBITDA only** in the denominator (Delivery Hero's own EBITDA is not in this pool — Section 0 caveat); both leverage readings are therefore best read as a **floor on true combined leverage**, not a ceiling.

**Leverage shown on both peak/latest and mid-cycle EBITDA** (mid-cycle = FY2023–FY2025 3-year average, GAAP $3,927mm / Adj. $6,422mm, per `01_capital-structure-and-leverage.md` §5 — labeled a scaling-stage floor-check, not a clean cyclical trough, per `01`'s own caveat):

| Basis | Net debt | GAAP EBITDA (peak/latest) | Leverage (peak) | GAAP EBITDA (mid-cycle) | Leverage (mid-cycle) | Adj. EBITDA (peak) | Leverage (peak, Adj.) | Adj. EBITDA (mid-cycle) | Leverage (mid-cycle, Adj.) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Current (actual, no deal) | 9,861 | 7,474 | 1.32x | 3,927 | 2.51x | 10,043 | 0.98x | 6,422 | 1.54x |
| Pro-forma (A) consideration-only | 19,498 | 7,474 | **2.61x** | 3,927 | **4.97x** | 10,043 | 1.94x | 6,422 | **3.04x** |
| Pro-forma (B) full-bridge (illustrative) | 25,923 | 7,474 | **3.47x** | 3,927 | **6.60x** | 10,043 | 2.58x | 6,422 | **4.04x** |

**Read:** on today's actual EBITDA, the deal looks tolerable (2.6x–3.5x GAAP-EBITDA leverage). On a mid-cycle EBITDA base — the more conservative, through-cycle view the module's cyclicality rule requires — pro-forma leverage runs **5.0x–6.6x on a GAAP basis**, well past where an investment-grade issuer typically sits, even before Delivery Hero's own (undisclosed) net debt is added.

### Pro-forma stress (haircuts applied to Uber's own EBITDA; net debt held at each pro-forma level)

| Scenario | h=0% | h=30% | h=40% | h=60% |
|---|---:|---:|---:|---:|
| **(A) Consideration-only, ND/EBITDA (GAAP)** | 2.61x (headroom +25.5%, N) | 3.73x (headroom **−6.5%, Y**) | 4.35x (headroom −24.2%, Y) | 6.52x (headroom −86.3%, Y) |
| **(A) Consideration-only, ND/EBITDA (Adj.)** | 1.94x (headroom +44.5%, N) | 2.50x (+28.6%, N) | 2.76x (+21.0%, N) | 3.51x (**−0.2%, Y**) |
| **(B) Full-bridge, ND/EBITDA (GAAP)** | 3.47x (headroom **+0.9%, N**) | 4.95x (−41.6%, Y) | 5.78x (−65.2%, Y) | 8.67x (−147.7%, Y) |
| **(B) Full-bridge, ND/EBITDA (Adj.)** | 2.58x (+26.3%, N) | 3.32x (+5.1%, N) | 3.68x (**−5.0%, Y**) | 4.66x (−33.2%, Y) |

Breach flags use the same assumed 3.5x max-leverage covenant as Section 2 — **applied here only as an illustrative anchor; the bridge facility's own covenant package is not disclosed anywhere in this pool** [`04_coverage-and-covenants.md` §2]. Coverage (EBITDA/interest) is checked separately below and is **not** the binding constraint in most cells — using a labeled 6.0% assumed bridge-facility interest rate (Inference, not from filings), pro-forma interest rises to $1,040mm (A) / $1,426mm (B); coverage stays above the assumed 3.0x floor through −40% EBITDA in every pro-forma case and only dips below it (2.87x A / 2.10x B) at the −60% haircut — by which point the leverage covenant has already breached at a much shallower decline in every pro-forma scenario. **Leverage, not coverage, is the binding constraint once the deal closes.**

**Rate shock on the pro-forma overlay (illustrative, labeled):** a +200bp move on the DH-related debt (bridge facilities are conventionally floating-rate, unlike Uber's existing 100%-fixed bond stack) would add **~$193mm/yr** (consideration-only, $9,638mm × 2%) to **~$321mm/yr** (full-bridge, $16,062mm × 2%) of incremental interest — real money, but not large enough on its own to move the EBITDA/interest coverage figures above the assumed 3.0x floor at any haircut level shown; leverage remains the binding constraint even with this shock layered on.

**Timing caveat:** the deal is not expected to close until H2 2027 — over a year from this report's date — so this pro-forma overlay does not apply to the disclosed 12-month liquidity runway in Section 2, which covers obligations already on the books today. It is the medium-term structural risk this stress test is required to surface, not an imminent 12-month liquidity event.

## 4. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches (current balance sheet, GAAP EBITDA basis) | **62.3%** |
| Tightest covenant breaches (current balance sheet, Adj. EBITDA basis) | **71.9%** |
| Tightest covenant breaches (pro-forma A, consideration-only, GAAP basis) | **25.5%** |
| Tightest covenant breaches (pro-forma B, full-bridge, GAAP basis) | **0.9%** |
| Committed liquidity exhausted within 12 months (current balance sheet) | **Not reached on an EBITDA decline alone (h ≥ 1)** |
| Net leverage exceeds 6.0x (illustrative refi-market / IG-to-HY crossover threshold), current balance sheet, GAAP basis | **78.0%** |
| Net leverage exceeds 6.0x, pro-forma A (consideration-only), GAAP basis | **56.5%** |
| Net leverage exceeds 6.0x, pro-forma B (full-bridge), GAAP basis | **42.2%** |

**Show the solve (direction-aware, MAX/ceiling form, per `04`'s own covenant type):**

- **Covenant breach, current balance sheet:** `h = 1 − net debt ÷ (T · EBITDA)`. GAAP: `h = 1 − 9,861 ÷ (3.5 × 7,474) = 1 − 0.377 = 62.3%`. Adj.: `h = 1 − 9,861 ÷ (3.5 × 10,043) = 1 − 0.280 = 71.9%`. Both reconcile exactly to `04_coverage-and-covenants.md` §3's own indicative figure (62.3%), a cross-check pass.
- **Covenant breach, pro-forma A:** `h = 1 − 19,498 ÷ (3.5 × 7,474) = 25.5%` (GAAP); `h = 1 − 19,498 ÷ (3.5 × 10,043) = 44.5%` (Adj.).
- **Covenant breach, pro-forma B:** `h = 1 − 25,923 ÷ (3.5 × 7,474) = 0.9%` (GAAP) — i.e., on a full bridge draw and unchanged EBITDA, the illustrative 3.5x threshold is **already essentially reached** (0.9% of headroom); `h = 1 − 25,923 ÷ (3.5 × 10,043) = 26.3%` (Adj.).
- **Liquidity exhaustion, current balance sheet:** solve `liquidity + FCF_base − (1−tax)×GAAP_EBITDA×h = obligations_12m` for `h`: `h = (10,059 + 10,116 − 2,945) ÷ (0.90 × 7,474) = 17,230 ÷ 6,726.6 = 2.56`. Since `h ≥ 1`, **liquidity does not exhaust on an EBITDA decline alone** — even a complete (100%) EBITDA wipeout still leaves stressed FCF of $3,389mm plus $10,059mm of liquidity ($13,448mm) against $2,945mm of 12-month obligations. This is not a spurious figure; it reflects genuinely deep committed liquidity plus a large cash buffer relative to a small near-term wall (14.8% of debt due within 12 months, per `02`).
- **Net-leverage-threshold (6.0x) rows:** same MAX form with `T = 6.0`. Current: `h = 1 − 9,861 ÷ (6.0 × 7,474) = 78.0%`. Pro-forma A: `h = 1 − 19,498 ÷ (6.0 × 7,474) = 56.5%`. Pro-forma B: `h = 1 − 25,923 ÷ (6.0 × 7,474) = 42.2%`.

## 5. Survival Read

On the balance sheet as reported today, Uber is a fortress case: net leverage is 1.32x (GAAP EBITDA) / 0.98x (Adjusted EBITDA), the assumed 3.5x max-leverage covenant does not breach until a **62–72% EBITDA decline** — deeper than any downturn in Uber's own disclosed history (FY2021 group Adjusted EBITDA was actually negative, −$774mm, but that trough happened at a far smaller revenue and cash-liquidity base than today's; the pool does not carry a group-level FY2020 dollar figure to build a second, cleaner trough-to-peak calibration, and `business-model/10_external-dependency.md` scores Uber 42/100 for external dependence, "partly externally driven," not a flagged "deep cyclical/commodity" name, so the module's mandatory history-calibration is applied here only as this qualitative FY2021 reference rather than a forced ratio column that would require dividing by a negative EBITDA) — and committed liquidity ($10,059mm) plus LTM free cash flow ($10,116mm, cash-backed per `earnings/06`) never comes close to exhausting under any EBITDA haircut modeled: even a full (100%) EBITDA wipeout leaves a liquidity-plus-FCF surplus over 12-month obligations. A working-capital shock and a floating-rate shock (the latter not applicable — 0% of drawn debt is floating) do not change that conclusion. **Market closure test:** assuming no new unsecured issuance for 12 months, cash ($4,870mm) plus the committed, undrawn revolver ($4,668mm, availability known) alone cover the $2,175mm within-12-month wall more than 4x over, before any FCF is counted [`02_maturity-wall-and-refinancing.md` §5] — liquidity holds, and nothing breaks.

**That verdict changes once the pending Delivery Hero acquisition is priced in.** The €8.4bn (~$9,638mm) cash consideration for the remaining 63.21% stake, financed by a committed bridge facility, would on its own push net leverage to 2.6x on today's GAAP EBITDA and to **4.97x on Uber's own mid-cycle EBITDA** — and if the full €14bn (~$16,062mm) bridge is drawn (plausible if it is also sized to refinance Delivery Hero's own debt), pro-forma leverage on a mid-cycle base runs to **6.6x**, before Delivery Hero's own EBITDA or debt (neither disclosed in this pool) is added on either side of the ledger. Under that pro-forma overlay, the same assumed 3.5x covenant would need only a **25.5% EBITDA decline** (consideration-only case) — or almost no decline at all, **0.9%**, in the full-bridge case — to breach; a normal recession-scale −30% to −40% EBITDA decline **would breach it** in three of the four consideration-only/full-bridge, GAAP/Adjusted combinations modeled in Section 3. Because the shortfall would be a leverage-covenant breach rather than a cash shortage (liquidity and FCF remain ample even in the pro-forma case, per Section 3's coverage check), what the company would need is not an equity raise or distressed asset sale but a **covenant waiver or amendment from the bridge lenders**, an accelerated pay-down (e.g., from the $10bn+ of annual FCF or a partial sale of the ~$3.8bn AV-partner equity-method stakes already on the balance sheet), or delaying/reducing the buyback program that management has already throttled once, in Q2 2026, to fund the pre-deal stake purchase [`01_capital-structure-and-leverage.md` §6].

Uber is **not net cash** on the strict basis today (net debt $9,861mm positive) — the strongest survival category (net cash as strategic optionality) does not apply. Read plainly: the company survives a 30–40% EBITDA decline comfortably **as currently constituted**, with wide covenant and liquidity margin; it does **not** clearly survive the same decline **once the Delivery Hero deal closes and the bridge is drawn**, at least not without lender accommodation on a covenant that — to be explicit — is itself only a labeled, unfiled assumption (no covenant package for the bridge is disclosed anywhere in this pool), so the precise breach point is indicative, not a filed fact. The single biggest thing to break, and the first thing to break, is a leverage covenant on the pro-forma structure — not liquidity, which stays deep throughout every scenario modeled here.
