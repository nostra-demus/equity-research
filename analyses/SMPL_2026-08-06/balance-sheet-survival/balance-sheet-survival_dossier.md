# balance-sheet-survival Module Dossier — SMPL

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `balance-sheet-survival_memo.md`.

- Generated: 2026-08-05T20:35:35Z
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

# Balance-Sheet-Survival Module — SMPL (Synthesis)

## Abstract

Net leverage is low at 1.18x net debt to adjusted EBITDA ($276.1M net debt / $234.6M TTM adjusted EBITDA) but has more than doubled in a year, from 0.54x at FY2025 year-end, as a debt-funded share-buyback program pushed the term loan from $250M to $400M. There is no maturity wall: the entire debt stack is one floating-rate bullet loan due March 2030, with 0% due inside 36 months. Committed liquidity of $197.8M covers $0 of near-term obligations, and the lone covenant — a 6.00x springing net-leverage ceiling, currently inactive — carries wide but addback-unconfirmed headroom. The stress test shows the structure survives a 60% EBITDA decline without breaching the covenant or running out of liquidity; the covenant only breaks at roughly an 80% EBITDA decline. The verdict is Solid, with the real vulnerability being continued debt-funded buybacks, not the debt itself.

## 1. Solvency Verdict

- **Verdict: Solid**
- **Net leverage (net debt / EBITDA):** 1.18x (net debt $276.1M strict basis / adjusted EBITDA $234.6M TTM through May 30, 2026). Gross leverage: 1.70x (gross debt $400.0M face / $234.6M adjusted EBITDA). GAAP EBITDA is negative TTM ($(213.1)M, driven by $391.9M of non-cash impairment) so gross/net leverage on GAAP EBITDA is not meaningful [01_capital-structure-and-leverage.md §5,§7].
- **Liquidity runway:** No finite runway needed — $0 committed obligations in the next 12 months against $197.8M of committed liquidity (cash $123.9M + confirmed revolver availability $73.9M) and $119.4M TTM FCF sitting as pure surplus (FCF down 32.0% YoY) [03_liquidity-runway.md §3].
- **Maturity wall (% within 24 months):** 0%. All $400.0M is a single bullet term loan due March 17, 2030 (extended from March 2027 by the Nov-19-2025 amendment); 100% of debt matures in Year 4 of the schedule [02_maturity-wall-and-refinancing.md §1,§2].
- **Tightest covenant + headroom:** Max total net leverage ≤6.00:1.00 (springing, active only if revolver draws exceed $22.5M of the $75.0M commitment; currently inactive, revolver undrawn). Indicative headroom +80.3% at 1.18x actual — but the covenant-EBITDA addback definition is unconfirmed in the pool, so headroom quality is capped [04_coverage-and-covenants.md §2,§3].
- **Stress break point (EBITDA decline that breaks it):** Covenant breaches at ~80.4% EBITDA decline (adjusted EBITDA falling to ~$46.0M); the standard −30/−40/−60% haircuts produce no covenant breach and no 12-month liquidity gap at any level, because $0 is due in the next 12 months [06_downside-stress-test.md §3,§4].
- Solvency strength /100: **74** — low, though sharply rising, leverage; wide covenant headroom; no near-term wall; offset by a doubling of net leverage in one year and falling cash conversion (CFO/adjusted EBITDA 80.1%→62.9% over two years, per `earnings/06_earnings-quality.md`).
- Liquidity runway /100: **88** — near-zero committed 12-month obligations against $197.8M of committed liquidity and a large FCF cushion.
- Refinancing risk /100 (higher = worse, inverted): **20** — no wall for 3.6 years; the Nov-19-2025 amendment itself proves recent market access at an unchanged 200bps margin; risk is entirely a 2029–2030 question, not a current one.
- Covenant headroom /100: **60 (capped)** — raw indicative headroom is wide (+80.3%), but per MODULE_RULES.md's cap ("Covenant headroom relies on assumed covenant-EBITDA addbacks") the credit-agreement-specific EBITDA definition is unconfirmed in the pool, so headroom quality cannot be fully verified.
- Downside resilience /100: **83** — survives the full −30/−40/−60% haircut set and both combined shocks without a covenant breach or liquidity gap; the only material vulnerability (unmodeled buyback continuation) is a policy choice, not a structural weakness.
- Data quality /100: **85** — recent balance sheet (Q3 FY2026 10-Q), full debt note, cash flow statement, and covenant disclosure all present; only the covenant-EBITDA addback schedule and the Credit Agreement's change-of-control/cross-default language are unconfirmed [00_solvency-data-triage.md §5,§6].
- Overall usefulness /100: **85** — the master synthesizer can lean on this module's leverage, wall, liquidity, and stress-break figures directly; only the covenant-quality read carries a residual gap.
- **Biggest solvency risk (one line):** not the debt structure itself, but management's willingness to fund discretionary share buybacks with new debt while adjusted EBITDA margin sits at a multi-year trough and cash conversion is falling.

## 1A. Module Disconfirmation

- **Strongest bear point:** net leverage more than doubled in one year (0.54x → 1.18x) purely to fund $213.2M of discretionary buybacks against only $92.1M of FCF in the same 39-week window, while adjusted EBITDA margin (16.9% TTM) sits at a multi-year trough versus 19–20% in FY2024–FY2025 and CFO/adjusted EBITDA conversion has fallen from 80.1% to 62.9% [01_capital-structure-and-leverage.md §6; 03_liquidity-runway.md §4].
- **Strongest bull point:** the structure survives a full −60% EBITDA haircut with net leverage at only 2.94x (against a 6.00x ceiling), a 12-month liquidity surplus of $13.8M, and zero debt maturing before March 2030 — the covenant only breaks at an ~80% EBITDA decline with no historical precedent in the pool [06_downside-stress-test.md §2,§3,§4].
- **Single killer risk:** an unmodeled combination — a severe earnings decline (30–60%) occurring while management continues the current buyback pace ($284.3M annualized) rather than halting it, which the stress test computes would open a ~$37M–$73M 12-month funding gap even though nothing in the buyback program is a committed obligation [06_downside-stress-test.md §4].
- **Disconfirming evidence already visible:** the only maintenance covenant is a springing test not currently active (revolver undrawn against a $22.5M activation threshold), and the Nov-19-2025 amendment — executed nine months ago — upsized the facility by $150.0M at an unchanged 200bps margin, evidence the market was still extending credit on favorable terms even after the leverage increase began [02_maturity-wall-and-refinancing.md §4; 04_coverage-and-covenants.md §2].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| solvency-data-triage | Sufficient — no hard caps bind | The FY2025 10-K debt note is stale; the Nov-19-2025 amendment ($250M→$400M, maturity to March 2030) must be used as the current capital structure, and the pool's only credit rating (S&P BB-, Jul-2022) is over four years stale |
| capital-structure-and-leverage | Net debt $276.1M (strict), 1.18x net leverage on adjusted EBITDA | Net leverage rose from 0.54x to 1.18x in one year — a debt-funded buyback, not a deteriorating operating base, drove the increase |
| maturity-wall-and-refinancing | Self-funded / low refi risk for the stated horizon | 0% of debt is due within 36 months; the entire $400.0M is one floating-rate bullet loan due March 2030 with no interim amortization |
| liquidity-runway | No finite runway problem; $197.8M liquidity vs $0 near-term obligations | The real liquidity risk is behavioral — $213.2M of buybacks against $92.1M of FCF in 39 weeks, not a committed obligation shortfall |
| coverage-and-covenants | 11.7x interest coverage; 80.3% indicative covenant headroom | Only one maintenance covenant exists (springing 6.00x net-leverage ceiling), it is not currently active, and its EBITDA addback definition is unconfirmed in the pool |
| off-balance-sheet-and-contingencies | Thin, genuinely clean contingent footprint | Total contingent exposure is ~$1.3M (~0.1% of equity); no litigation, tax, or environmental matter carries a claimed amount or "reasonably possible" language |
| downside-stress-test | Survives −30/−40/−60% EBITDA haircuts with no covenant breach or liquidity gap | Covenant breach requires an ~80% EBITDA decline; the only path to a 12-month funding gap combines a 30–60% EBITDA decline with continued buybacks at the current pace |

## 3. Reconciliation

Two basis-level items surfaced across modules, both already flagged and reconciled at source:

1. **Net-debt basis.** `01_capital-structure-and-leverage.md` designates $276.1M (strict, funded-debt-only) as canonical, per MODULE_RULES.md's default. A lease-inclusive supplemental figure of $324.6M also exists and is the figure `earnings/01_historical-financials.md` headlines (net leverage 1.38x lease-inclusive vs 1.18x strict). This is not a disagreement between this module's own specialists — all of 01–06 use the $276.1M strict figure consistently — but the cross-module gap is worth flagging: the more conservative (higher) 1.38x reading should be kept in view alongside the 1.18x canonical figure.
2. **GAAP vs adjusted EBITDA.** GAAP EBITDA TTM is negative ($(213.1)M) due to $391.9M of non-cash impairment; every leverage, coverage, and stress figure in this synthesis necessarily uses the company-defined adjusted EBITDA ($234.6M TTM) as the only usable denominator. This is disclosed and consistent across 01, 04, and 06, not a disagreement, but it means every ratio in this report rests on a non-GAAP number whose cash conversion has fallen from 80.1% to 62.9% over two years [04_coverage-and-covenants.md §1].

No material disagreements exist between the specialists themselves on direction or conclusion.

## 3A. Fragility Map (what breaks first)

| Fragility Driver | Indicator | Current Status | Why It Matters |
|---|---|---|---|
| Maturity concentration | % due within 24m | 0% — but 100% of debt concentrated in a single 2030 bullet, no amortization ladder | No near-term wall risk, but the entire $400.0M refinances at once rather than in stages |
| Availability liquidity | Usable liquidity vs uses | $197.8M usable (cash + confirmed non-borrowing-base revolver availability) vs $0.0M committed near-term uses | No revolver-reality gap; availability is fully known and undrawn |
| Covenant illusion risk | Covenant EBITDA vs reported | Indicative headroom (+80.3%) computed on disclosed adjusted EBITDA, not a confirmed covenant-EBITDA definition | Addback-illusion risk is unresolved, not cleared — capped per MODULE_RULES.md |
| Floating-rate sensitivity | Floating % net of hedges | 100% floating, no disclosed hedge; +100bps ≈ +$4.0M/year cash interest | Every SOFR move hits cash interest immediately, independent of the maturity wall |
| Structural subordination | HoldCo debt vs upstreaming | None — the parent (NASDAQ-listed entity) carries no debt and no guarantee; all debt sits at the OpCo borrower/guarantor group | No trapped-value risk; standard secured-lender structure |
| Contingent accelerants | CoC puts / cross-default | Not disclosed in the extracted Credit Agreement text; would require the full exhibit to confirm | Hidden accelerants cannot be ruled out, but nothing in the pool indicates one exists |

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No debt maturity schedule | N — schedule confirmed via 10-Q amendment narrative | Solvency strength | Not applied |
| No covenant disclosure | N — one covenant disclosed, threshold and trigger both stated | Covenant headroom | Not applied (see next row for the applicable cap) |
| No cash flow statement | N — full CFO/FCF available | Liquidity runway | Not applied |
| Only annual data (no interim) | N — Q3 FY2026 10-Q (May 30, 2026) is the primary source | Solvency strength | Not applied |
| No EBITDA base (stress not run) | N — stress test ran fully on adjusted EBITDA | Downside resilience | Not applied |
| Covenant headroom relies on assumed covenant-EBITDA addbacks | **Y** — the Credit Agreement's own EBITDA/addback definition is not reproduced in the pool | Covenant headroom | **Max 60** (applied above) |

No other cap in MODULE_RULES.md's cap table binds. This is the most restrictive cap affecting covenant headroom and is applied as the final score.

## 5. Survival Summary

SMPL is lightly levered in absolute terms (1.18x net debt / adjusted EBITDA) but the direction is the story: leverage more than doubled over the trailing year, from 0.54x at FY2025 year-end, purely because management drew an additional $150.0M against the Credit Agreement to help fund $213.2M of discretionary share buybacks against only $92.1M of FCF in the same window — not because operations deteriorated. The near-term maturity wall is empty by structure, not by management skill: the entire $400.0M debt stack is a single bullet loan due March 2030, so there is nothing to refinance for at least 3.6 years regardless of market conditions. Liquidity is not a constraint either — $197.8M of committed liquidity sits against $0 of committed 12-month obligations, and the tightest (only) covenant, a 6.00x springing net-leverage ceiling, is not even currently active because the revolver is undrawn; if it were tested today it would carry +80.3% indicative headroom, though the covenant's own EBITDA definition is unconfirmed. The stress test confirms a normal recession (−30% to −40% adjusted EBITDA) is fully survivable with no waiver, asset sale, or equity raise, and even a severe −60% decline leaves leverage at only 2.94x; the covenant only breaks at an ~80% EBITDA decline that has no precedent in the company's own history. The one path to a real 12-month funding gap requires management to keep buying back stock at the current pace straight through a serious earnings decline — a reversible policy choice, not a structural weakness of the debt itself.

## 6. What Would Change The Solvency Verdict?

| Current Verdict | What Would Strengthen It | What Would Weaken It | Data Needed |
|---|---|---|---|
| Solid | A pause or slowdown in debt-funded buybacks that lets net leverage stabilize or fall back toward the 0.5–0.8x FY2025 range; a current (non-stale) credit rating confirming BB-/BB or better at today's leverage; confirmation of the covenant-EBITDA addback definition showing no material gap to reported adjusted EBITDA | Continued buybacks at the current ~$284.3M annualized pace combined with a genuine earnings decline (not just an accounting trough); a large sudden revolver draw (e.g., for a debt-financed acquisition) that activates the springing covenant; further adjusted-EBITDA margin erosion beyond the current 16.9% trough; a confirmed hedge-free floating-rate exposure meeting a sustained rate-hike cycle | The full Credit Agreement exhibit (covenant-EBITDA definition, addback caps, change-of-control/cross-default language); an updated credit-rating action reflecting the post-Nov-2025 capital structure |

## 6A. Survival Playbook (non-speculative levers)

- **Refi actions taken:** the Nov-19-2025 "2026 Incremental Facility Amendment" (Amendment No. 8) upsized the Term Facility from $250.0M to $400.0M and extended maturity from March 2027 to March 2030 at an unchanged 200bps margin — evidence of continued, favorable market access as of nine months ago [02_maturity-wall-and-refinancing.md §4].
- **Asset-sale programs:** none disclosed or announced in the pool.
- **Capex cuts:** not clearly assessable — no maintenance-vs-growth capex split is disclosed [`earnings/06_earnings-quality.md`, cited in 03_liquidity-runway.md §2], so capex flexibility as a lever cannot be sized from the data.
- **Dividend / buyback suspension:** the single largest evidenced lever. SMPL pays no dividend, and the stock-repurchase program is explicitly discretionary — the Company states it "does not obligate the Company to acquire any specific number of shares... may be suspended or discontinued at any time" [03_liquidity-runway.md §2]. Halting the current ~$284.3M annualized buyback pace would immediately remove the module's single identified path to a 12-month funding gap.
- **Covenant-amendment likelihood:** the Company has amended its Credit Agreement eight times, most recently nine months ago to add capacity and extend maturity — a demonstrated pattern of successful lender negotiation, though this is a track record for expanding/extending debt, not evidence of a prior amendment obtained under financial stress.

## 7. Note To The Final Synthesizer

- Net leverage is low in absolute terms (1.18x net debt/adjusted EBITDA, strict basis; 1.70x gross debt/adjusted EBITDA) but has more than doubled over the trailing 12 months (from 0.54x), driven by a debt-funded buyback program, not operating deterioration.
- The maturity wall is empty: 0% of debt is due within 36 months; the entire $400.0M is one floating-rate bullet term loan due March 2030. Refinancing is not currently exposed — the most recent refinancing event (Nov-19-2025) upsized and extended the facility on unchanged terms.
- The liquidity runway has no finite constraint: $197.8M of committed liquidity against $0 of committed 12-month obligations, plus $119.4M of TTM FCF as additional surplus (FCF itself down 32.0% YoY — a trend to watch, not a current shortfall).
- The tightest (and only) maintenance covenant is a 6.00x springing net-leverage ceiling, currently inactive (revolver undrawn against a $22.5M activation threshold). Indicative headroom is wide (+80.3%) but the covenant's own EBITDA addback definition is unconfirmed in the data pool — treat headroom quality as capped, not verified.
- The largest off-balance-sheet / contingent exposure is immaterial: ~$1.3M total (a $1.1M collateral-backed letter of credit and a $0.2M endorsement commitment), about 0.1% of equity. No RF-OBS-001 (contingent-liability spike) condition was met — the contingent footprint is genuinely thin, not opaque.
- The stress break point: the structure survives the full −30/−40/−60% EBITDA haircut set and both combined shocks (working-capital, +200bps rates) without a covenant breach or a 12-month liquidity gap. The covenant first breaks at an ~80% EBITDA decline. The only modeled path to a near-term funding gap requires management to continue discretionary buybacks at the current pace through a 30–60% EBITDA decline — a reversible policy choice, not a structural debt weakness.
- No net-cash / strategic-flexibility framing applies here — SMPL carries real net debt (not net cash), so the §24 Filter 3 positive read does not apply as written; the closest analog is that the empty maturity wall and ample committed liquidity give the company counter-cyclical flexibility despite carrying net debt, worth noting but distinct from a net-cash framing.
- One partial-data cap applied: covenant headroom is capped at 60/100 because the covenant-EBITDA addback definition is unconfirmed in the pool (MODULE_RULES.md cap table). No other hard cap binds.
- Biggest missing data point / single highest-value next data request: the full Credit Agreement exhibit (with the Nov-19-2025 Eighth Amendment), which would confirm the covenant-EBITDA definition and addback caps, and any change-of-control/cross-default language not reproduced in the 10-K/10-Q narrative.
- **Explicit handoff:** the master synthesizer's "Balance Sheet and Survival Test" section should defer to this synthesis. The stress break points here (covenant breach at ~80% EBITDA decline; no liquidity gap on EBITDA decline alone; a $37M–$73M gap only if buybacks continue through a 30–60% decline) are the inputs for the master's downside scenario and risk register — this module assigns no probabilities to them.

## 8. Simple Summary

- Debt: $400.0M gross (face value, one term loan), $276.1M net of $123.9M cash. Leverage: 1.18x net debt to adjusted EBITDA, 1.70x gross — low, but doubled in the past year.
- Maturity wall: none for the next 3.6 years. The entire debt is a single bullet loan due March 2030; it is fully covered without needing any refinancing, asset sale, or new market access before then.
- Liquidity runway: no finite number applies — committed liquidity ($197.8M) plus FCF cushion exceed the $0 of committed 12-month obligations by a wide margin.
- Tightest covenant: a 6.00x max net-leverage test that is not even currently active (revolver undrawn); if tested today it would have +80.3% headroom, but the exact covenant-EBITDA definition is unconfirmed.
- Biggest off-balance-sheet exposure: negligible (~$1.3M, about 0.1% of equity) — a collateral-backed letter of credit and a small endorsement commitment; no litigation or tax exposure of note.
- Survives a 30–60% EBITDA drop: yes, on every axis tested (covenant, liquidity, coverage) — the covenant only breaks at roughly an 80% decline, a level with no precedent in the company's history.
- Current rating / key data: the only credit rating in the pool (S&P BB-) is over four years stale and predates the current, larger debt load — treated as not a current read of credit quality, not a filled gap.
- Module usefulness for the master synthesizer: high — leverage, wall, liquidity, and stress figures are all directly usable; the one residual gap is the unconfirmed covenant-EBITDA addback definition.



---

## balance-sheet-survival / 00_solvency-data-triage.md

_Source: `00_solvency-data-triage.md`_

# Solvency Data Triage — SMPL

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| Annual Report on Form 10-K_2025.pdf | Annual filing (10-K) | FY2025 (ended Aug 30, 2025); filed Oct 28, 2025 | 2026-08-06 (Drive-sync date, not filing date) | High |
| The_Simply_Good_Foods_Company_-_Form_10-K(Oct-28-2025).doc | Annual filing (10-K, duplicate/mhtml render of above) | FY2025 (ended Aug 30, 2025) | 2026-08-06 (sync date) | High |
| The_Simply_Good_Foods_Company_-_Form_10-Q(Jul-09-2026).doc | Quarterly filing (10-Q, Q3 FY26) | Period ended May 30, 2026; filed Jul 09, 2026 | 2026-08-06 (sync date) | High — MOST RECENT debt/covenant disclosure, supersedes 10-K |
| The_Simply_Good_Foods_Company_-_Form_10-Q(Apr-09-2026).doc | Quarterly filing (10-Q, Q2 FY26) | Period ended Feb 28, 2026; filed Apr 09, 2026 | 2026-08-06 (sync date) | High |
| Annual Meeting Proxy Statement_2026.pdf | Proxy (DEF 14A equivalent) | FY2025 AGM (2026 proxy) | 2026-08-06 (sync date) | Medium — governance/pledge context, not primary solvency source |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls | Debt / capital-structure export (multi-tab workbook) | Annual, through FY2025 | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — tab: Balance Sheet (88×11) | Balance sheet export | Annual, through FY2025 | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — tab: Cash Flow (75×11) | Cash flow export | Annual, through FY2025 | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — tab: Capital Structure Summary (97×21) | Debt / capital-structure export | Annual, through FY2025 | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — tab: Capital Structure Details (26×10) | Debt / capital-structure export | Annual, through FY2025 | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — tab: Historical Capitalization (39×37) | Debt / capital-structure export | Multi-year through FY2025 | 2026-07-24 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — tab: Ratios (161×11) | Credit/solvency ratio export | Annual, through FY2025 | 2026-07-24 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — tab: Pension OPEB (21×10) | Pension/OPEB disclosure | Annual | 2026-07-24 | Low (no material plan) |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — tab: Segments (76×10) | Segment financials | Annual, through FY2025 | 2026-07-24 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls — tabs: Key Stats, Income Statement, Multiples, Supplemental, Industry Specific | Financial data exports | Annual, through FY2025 | 2026-07-24 | Low–Medium |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — tab: Balance Sheet (86×40) | Balance sheet export (quarterly series) | Through Q3 FY2026 (May 30, 2026) | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — tab: Cash Flow (75×40) | Cash flow export (quarterly series) | Through Q3 FY2026 | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — tab: Capital Structure Summary (70×79) | Debt / capital-structure export (quarterly series) | Through Q3 FY2026 | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — tab: Capital Structure Details (26×10) | Debt / capital-structure export | Through Q3 FY2026 | 2026-07-24 | High |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — tab: Historical Capitalization (39×37) | Debt / capital-structure export | Through Q3 FY2026 | 2026-07-24 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — tab: Ratios (161×40) | Credit/solvency ratio export | Through Q3 FY2026 | 2026-07-24 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — tab: Segments (71×40) | Segment financials | Through Q3 FY2026 | 2026-07-24 | Medium |
| The Simply Good Foods Company NasdaqCM SMPL Financials_Quarterly.xls — tabs: Key Stats, Income Statement, Multiples, Supplemental, Industry Specific, Pension OPEB | Financial data exports | Through Q3 FY2026 | 2026-07-24 | Low–Medium |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — tab: Summary (63×11) | Rating-adjacent / peer credit score export | LTM ending 2026-05-30, updated 2026-07-09 | 2026-08-06 | High — carries S&P issuer rating + peer solvency/liquidity scoring |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — tab: Financials (40×13) | Credit metrics export | LTM through Q3 FY2026 | 2026-08-06 | High |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — tab: Solvency Metrics Charts (18×19) | Solvency ratio chart data | LTM through Q3 FY2026 | 2026-08-06 | High |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — tab: Liquidity Metrics Charts (15×19) | Liquidity ratio chart data | LTM through Q3 FY2026 | 2026-08-06 | High |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — tab: Operational Metrics Charts (21×19) | Operating metrics chart data | LTM through Q3 FY2026 | 2026-08-06 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Credit Health Panel.xls — tab: Disclaimer (26×1) | Vendor disclaimer text | n/a | 2026-08-06 | n/a |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf | Public company profile (incl. S&P rating history) | As of 2026-08-06 pull | 2026-08-06 | Medium — carries S&P issuer credit rating (dated Jul-14-2022) |
| The Simply Good Foods Company NasdaqCM SMPL Public Company Profile.rtf | Public company profile | As of pull date | 2026-07-24 | Medium |
| Company Comparable Analysis The Simply Good Foods Company.xls — tab: Credit Health Panel (48×10) | Peer credit comparison | Recent | 2026-07-24 | Medium |
| Company Comparable Analysis The Simply Good Foods Company.xls — tabs: Financial Data, Trading Multiples, Operating Statistics, Business Description, Implied Valuation, Valuation Chart, Disclaimer | Comparable-company / valuation export | Recent | 2026-07-24 | Low (valuation-focused, not solvency) |
| Short_Interest_12m_SMPL.xls — tabs: Chart 1 with Data, Attributions | Short-interest export | Trailing 12 months | 2026-08-06 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Customers.xls — tab: Customers | Customer concentration export | Recent | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Suppliers.xls — tab: Suppliers | Supplier concentration export | Recent | 2026-07-24 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Events Calendar.xls — tab: Events Calendar | Corporate events calendar | Forward-looking | 2026-08-06 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Key Developments.rtf | Key developments / news log | Recent | 2026-07-24 | Low–Medium (M&A, financing events) |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership History.xls — tab: History | Ownership history export | Historical | 2026-08-06 | Low |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership Insider Trading.xls — tab: Insider Trading | Insider trading export | Historical | 2026-08-06 | Low (governance signal, not solvency) |
| The Simply Good Foods Company NasdaqCM SMPL Public Ownership Summary.rtf | Ownership summary | Recent | 2026-08-06 | Low |
| TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls — tabs: Consensus, Recent Changes, Guidance, Multiples, Surprise, Trends, Revisions (7 tabs) | Consensus estimates export | Forward estimates, updated through 2026-08 | 2026-08-06 | Low — earnings/valuation input, not a solvency source |
| The Simply Good Foods Company, Q2 2026 Earnings Call, Apr 09, 2026.rtf | Transcript | Q2 FY2026 (call date Apr 09, 2026) | 2026-06-25 | Medium — management commentary on debt paydown / refi |
| The Simply Good Foods Company, Q3 2026 Earnings Call, Jul 09, 2026.rtf | Transcript | Q3 FY2026 (call date Jul 09, 2026) | 2026-07-24 | Medium — most recent management commentary |

No user notes and no `data/SMPL/external/` folder are present in this pool.

**Note on "Last Modified":** most files show an Aug 6, 2026 filesystem timestamp — this is the Drive-sync date (fix F23), not the document's actual vintage. All periods above were read from inside each document (fiscal-period cover pages, "as of" lines, and tab headers), not from file metadata.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Annual Report on Form 10-K_2025.pdf | FY ended Aug 30, 2025 | ~11.3 |
| Quarterly filing | Form 10-Q (Jul-09-2026) | Period ended May 30, 2026 (Q3 FY2026) | ~2.3 |
| Debt / capital-structure export | Financials_Quarterly.xls, Capital Structure Summary tab | Through Q3 FY2026 (May 30, 2026) | ~2.3 |
| Fixed-income / maturities export | 10-Q (Jul-09-2026), Note 7 (Long-Term Debt); Financials_Quarterly.xls Capital Structure Details | May 30, 2026 | ~2.3 |
| Cash flow statement | 10-Q (Jul-09-2026) consolidated cash flow statement; Financials_Quarterly.xls Cash Flow tab | 9 months ended May 30, 2026 | ~2.3 |
| Covenant / credit-agreement disclosure | 10-Q (Jul-09-2026), Note 7 (max total net leverage 6.00:1.00, springing) | As of May 30, 2026 | ~2.3 |
| Credit rating report | S&P Global Ratings Credit Rating, per Credit Health Panel / Public Company profile | BB- issuer rating, dated Jul-14-2022 (stale — 4+ years old, no update in pool) | ~48.8 |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | 10-Q (Jul-09-2026), consolidated balance sheet as of May 30, 2026; Financials_Quarterly.xls Balance Sheet tab | Debt, cash, equity base |
| Debt note (amounts by type) | Y | 10-Q (Jul-09-2026), Note 7 (Long-Term Debt and Line of Credit) — Term Facility $400.0M outstanding at May 30, 2026 (up from $250.0M at Aug 30, 2025 per the 2026 Incremental Facility Amendment, Nov 19, 2025); Revolving Credit Facility $75.0M, undrawn | The debt stack and seniority |
| Maturity schedule | Y | 10-K FY2025 Note 7 gives the year-by-year table (all $250.0M due FY2027 as of Aug 30, 2025); superseded by the 10-Q (Jul-09-2026) narrative — Term Facility maturity extended to March 2030 by the Nov 19, 2025 amendment. The 10-Q text confirms the new maturity date but does NOT reprint a full updated year-by-year table in the extracted text — flag for 02 to locate/confirm the exact post-amendment schedule | The maturity wall and refinancing exposure |
| Cash flow statement | Y | 10-Q (Jul-09-2026) consolidated cash flow statement (9 months ended May 30, 2026); Financials_Quarterly.xls Cash Flow tab | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y | 10-K FY2025 & 10-Q (Jul-09-2026): $75.0M Revolving Credit Facility, undrawn, $0.9M letters of credit issued against it (per 10-K) / updated LC amount in 10-Q Note 7 (exact figure to be pulled by 02/03) | True liquidity beyond cash |
| Interest expense detail | Y | 10-K FY2025 income statement + Note 7 (effective rate 6.3% at Aug 30, 2025; 5.7% at May 30, 2026 per 10-Q); Financials_Quarterly.xls Income Statement | Coverage ratios |
| Covenant disclosure | Y | 10-K FY2025 & 10-Q (Jul-09-2026), Note 7: max total net leverage ratio ≤6.00:1.00, springing when revolver draws exceed 30% of commitments; compliant as of Aug 30, 2025 and May 30, 2026 | Headroom to a breach |
| Lease detail (operating/finance) | Y | 10-K FY2025, Note on Leases (ASC 842): operating leases (real estate, warehousing equipment), no finance leases in FY2025; lease liabilities and ROU assets disclosed | Debt-like obligations |
| Pension / OPEB funded status | Y (immaterial) | Financials_Annual.xls / Financials_Quarterly.xls, Pension OPEB tab — no material defined-benefit plan disclosed | Off-balance-sheet obligation |
| Commitments & contingencies note | Y | 10-K FY2025, Note 11 (Commitments and Contingencies) — no litigation the Company considers material as of the filing date | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Y (stale) | S&P Global Ratings Issuer Credit Rating BB-, stable outlook, rated Jul-14-2022, per Credit Health Panel Summary tab and Public Company profile — no more recent rating action in the pool despite the Nov 2025 debt increase and maturity extension | Refinancing access and cost |
| EBITDA base (for stress test) | Y | 10-K FY2025 income statement / Adjusted EBITDA reconciliation; Financials_Annual.xls & Financials_Quarterly.xls Income Statement tabs; cross-check against earnings/01_historical-financials.md | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | 10-K FY2025: operating packaged-food company; HoldCo/OpCo structure explicit — The Simply Good Foods Company (parent) is NOT a borrower/guarantor; Simply Good Foods USA, Inc. is administrative borrower; domestic subsidiaries guarantee on a secured basis | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | Y | 10-K FY2025 & 10-Q (Jul-09-2026): $75.0M committed Revolving Credit Facility, not a borrowing-base facility, undrawn as of both dates, availability reduced only by outstanding letters of credit | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | N | Not found in the extracted 10-K/10-Q text — the covenant leverage test and its EBITDA definition/addback detail are referenced but the specific addback schedule is not reproduced in the filings' MD&A; may require the full credit agreement exhibit (not in pool) | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | Y | 10-K FY2025 & 10-Q (Jul-09-2026), Note 7: parent not a borrower/guarantor; Simply Good Foods USA, Inc. is administrative borrower; guarantor subsidiaries (other than Quest Nutrition, LLC and Only What You Need, Inc.) are holding companies with no assets other than subsidiary investments | Structural subordination and upstreaming |
| Hedging / swaps disclosure | Partial | 10-K FY2025 discusses floating-rate SOFR exposure on the Term Facility and Revolving Credit Facility; no interest-rate swap/hedge disclosed in the extracted text — appears unhedged, to be confirmed by 04 | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | Partial | 10-K FY2025 risk factors reference Delaware anti-takeover provisions generally; explicit change-of-control put / cross-default / rating-trigger language for the Credit Agreement itself not located in the extracted Note 7 text — 01/06 should search the full credit agreement exhibit list (Exhibit 10.11 and related amendments referenced in the 10-K exhibit index) if a definitive answer is required | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

All six cross-module inputs exist under `analyses/SMPL_2026-08-06/business-model/` and `analyses/SMPL_2026-08-06/earnings/`.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | 10-K FY2025 cover page; incorporated in Delaware |
| Exchange | Nasdaq (ticker SMPL; CIQ exports label it "NasdaqCM") | Public Company Profile export; 10-K cover page |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | Form 10-K / Form 10-Q / DEF 14A-equivalent proxy all filed with the SEC |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | 10-K FY2025 basis of presentation; ASC 842 (leases), ASC Topic references throughout the notes |
| Reporting currency (USD / INR / …) | USD | All filings and CIQ exports state figures in USD ("In thousands"/"In Millions of the reported currency") |
| Document language(s) | English (all documents) | All filings, transcripts, and CIQ exports are in English; no non-English document in this pool |

Fiscal year ends the last Saturday in August (FY2025 ended August 30, 2025); quarterly periods do not align to calendar quarters (Q3 FY2026 ended May 30, 2026). No jurisdiction-mapping adjustments are needed — this is a standard US SEC filer and all downstream agents should cite 10-K/10-Q/DEF 14A-equivalent by their real US names.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N (schedule exists in FY2025 10-K; post-amendment full year-by-year table not located in the 10-Q extract — see note below) | 02, 06 | None — but 02 must confirm/reconstruct the updated schedule from the 10-Q's amendment narrative (Term Facility now $400.0M, due March 2030) since the FY2025 10-K table is stale (superseded by the Nov 19, 2025 amendment) |
| No covenant disclosure | N | 04, 06 | None — max total net leverage 6.00:1.00 (springing) is disclosed, but the covenant-EBITDA addback definition is not found in the pool; 04 should flag headroom quality as unconfirmed rather than apply the full "no covenant disclosure" cap |
| No cash flow statement | N | 03, 04, 06 | None |
| No undrawn-facility disclosure | N | 03 | None — $75.0M Revolving Credit Facility, undrawn, committed, not borrowing-base-based |
| No interest-expense detail | N | 04 | None |
| No EBITDA base | N | 06 | None |

No hard caps from the module's Partial-Data table bind. One soft flag applies: **covenant-EBITDA addback definition is not disclosed in the pool** (per Covenant Definition Rigor hard rules) — 04/06 should state headroom is computed on reported/adjusted EBITDA as disclosed, not on a confirmed covenant-EBITDA definition, and note this explicitly rather than assume full headroom quality.

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent balance sheet (Q3 FY2026 10-Q, as of May 30, 2026), a detailed debt note with maturity/covenant/security disclosure (10-K FY2025 Note 7, updated by the 10-Q's Nov 19, 2025 amendment narrative), and a full cash flow statement are all present, so leverage, liquidity, coverage, and a stress test can all be built.
- **Sections that can run:** capital structure, maturity wall, liquidity, coverage/covenants, contingencies, stress test.
- **Active partial-data caps:** none from the module's hard-cap table.
- **Critical missing items:** none disqualifying; two items need targeted work rather than a cap — (1) the exact post-Nov-2025-amendment year-by-year maturity table (Term Facility now $400.0M due March 2030, up from $250.0M due March 2027) should be pulled directly from the 10-Q's Note 7 or the Capital Structure Details/Summary CIQ tabs rather than relied on from the now-stale FY2025 10-K table; (2) the covenant's EBITDA addback definition and any interest-rate hedge are not found in the extracted text and should be treated as unconfirmed, not assumed favorable.
- **Single highest-value missing document:** the full Credit Agreement exhibit (with the eighth/2026 Incremental Facility Amendment) — it would give the exact covenant-EBITDA definition, addback caps, and any change-of-control/cross-default language that the 10-K/10-Q narrative summarizes but does not fully reproduce.

**Time-sensitive flag for downstream agents:** the FY2025 10-K (period ended Aug 30, 2025) describes a $250.0 million Term Facility maturing March 2027. This is materially stale. The Q3 FY2026 10-Q (period ended May 30, 2026, filed Jul 09, 2026) discloses that on November 19, 2025 the Company executed an eighth amendment increasing the Term Facility to $400.0 million and extending its maturity to March 17, 2030 (revolver maturity extended to the earlier of 91 days pre-Term-Facility-maturity or December 16, 2029). All downstream agents (01, 02, 06 especially) must use the 10-Q's post-amendment figures ($400.0M, March 2030 maturity, effective rate 5.7% at May 30, 2026) as the current capital structure, and cite the 10-K only for the FY2025 point-in-time comparison, not as the current debt stack. The S&P BB- issuer rating in the pool is dated Jul-14-2022 (over four years stale, predates both the OWYN acquisition financing and the 2026 Incremental Facility Amendment) — flag it as outdated rather than presenting it as a current read of credit quality.



---

## balance-sheet-survival / 01_capital-structure-and-leverage.md

_Source: `01_capital-structure-and-leverage.md`_

# Capital Structure & Leverage — SMPL

**Reporting currency:** US dollars (USD). Figures below are stated in $ millions unless a filing table is quoted directly, in which case the filing's own $ thousands are shown and converted. **Fiscal year:** ends the last Saturday in August (FY2025 ended Aug 30, 2025); interim periods do not track calendar quarters (Q3 FY2026 ended May 30, 2026). **Standard:** US GAAP.

**Time-sensitivity note (per `00_solvency-data-triage.md`):** the FY2025 10-K's debt note is stale. On November 19, 2025 the Company executed an eighth amendment (the "2026 Incremental Facility Amendment") that raised the Term Facility from $250.0 million to $400.0 million and pushed its maturity from March 2027 to March 17, 2030. This report uses the Q3 FY2026 10-Q (period ended May 30, 2026, filed Jul-09-2026) as the current capital structure and cites the FY2025 10-K only for point-in-time comparison. The S&P BB- issuer rating carried in the data pool is dated Jul-14-2022 — more than four years old, predating both the OWYN acquisition financing and the 2026 Incremental Facility Amendment — and is flagged as outdated, not a current read of credit quality [Credit Health Panel, Summary tab; `00_solvency-data-triage.md`].

---

## 1. Debt Stack

All disclosed interest-bearing debt sits under a single syndicated Credit Agreement (originally dated July 7, 2017, amended eight times through the Nov-19-2025 "2026 Incremental Facility Amendment"). There are no public bonds or notes — the entire funded-debt stack is one term loan plus an undrawn revolver.

| Instrument | Amount | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Short-term debt / current portion | $0.0M | — | — | — | — | — | — | No principal payments are due on the Term Facility in the 12 months following May 30, 2026; entire balance is classified long-term. [Q3 FY2026 10-Q, Note 5 (Long-Term Debt and Line of Credit)] |
| Bonds / notes | None disclosed | — | — | — | — | — | — | No public bonds or notes found in the pool; all funded debt is bank/syndicated. |
| Term loan ("Term Facility") | $400.0M (face); $397.0M net of $3.0M deferred financing fees | OpCo — administrative borrower is Simply Good Foods USA, Inc.; certain subsidiary holding companies are co-borrowers. **The Simply Good Foods Company (the parent, i.e. the NASDAQ-listed entity) is NOT a borrower and has not guaranteed the Credit Agreement.** | Secured | Senior secured (single tranche; the extracted text does not label a separate 1st/2nd-lien split — treat as one senior secured facility) | Pledged equity interests in subsidiaries + a security interest in "substantially all" of the borrowers' and guarantors' domestic assets | March 17, 2030 (extended from March 17, 2027 by the Nov-19-2025 amendment) | Floating — SOFR (0.00% floor) + 2.00% margin, or a base-rate alternative; effective rate 5.7% at May 30, 2026 (down from 6.3% at May 31, 2025). No interest-rate swap or hedge is disclosed in the extracted 10-K/10-Q text — the exposure appears unhedged; to be confirmed by `04_coverage-and-covenants`. | [Q3 FY2026 10-Q, Note 5] |
| Revolver (drawn) | $0.0M drawn of $75.0M committed | Same OpCo borrower/guarantor group as the Term Facility | Secured (same collateral package) | Senior secured, pari passu with the Term Facility (same Credit Agreement) | Same domestic-asset pledge, shared with the Term Facility | Earlier of 91 days pre-Term-Facility-maturity or Dec 16, 2029 (extended by the Nov-19-2025 amendment) | Floating — SOFR + 2.00% margin (or base-rate alternative) | [Q3 FY2026 10-Q, Note 5]. $1.1M of letters of credit are issued against the facility (to support two leased buildings); no cash has ever been drawn as of May 30, 2026. |
| Finance / capital leases | $0.0M | — | — | — | — | — | — | "As of May 30, 2026, the Company had no finance lease agreements." [Q3 FY2026 10-Q, Note 8 (Leases)] |
| **Total gross debt** | **$400.0M** (face) / **$397.0M** (balance-sheet carrying value, net of deferred financing fees) | | | | | | | Sum of the above; ties to "Long-term debt, less current maturities" of $397,037 thousand on the May 30, 2026 consolidated balance sheet. [Q3 FY2026 10-Q, Consolidated Balance Sheets] |

**Covenant on file (for context, detailed in `04_coverage-and-covenants`):** the Revolving Credit Facility carries a maximum total net leverage ratio of ≤6.00:1.00, springing only when revolver draws exceed 30% of total commitments. The Company states it was in compliance with all covenants as of both May 30, 2026 and August 30, 2025. The covenant-EBITDA addback definition is not reproduced in the extracted filing text — flagged per `00_solvency-data-triage.md` as unconfirmed, for `04` to resolve. [Q3 FY2026 10-Q, Note 5]

---

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Operating leases (US GAAP, ASC 842) | Total lease liabilities $51.4M (current $8.0M + long-term $43.5M); undiscounted future lease payments $61.1M through the leases' remaining terms (up to 6 years) | Capitalized on-balance-sheet under ASC 842 as a right-of-use asset and a separate lease-liability line (inside "Accrued expenses and other current liabilities" and "Other long-term liabilities" — not on the debt line). **US GAAP does not classify operating leases as debt**; they are shown here as a debt-like obligation but excluded from "gross debt" in Sections 1 and 4 above/below. Real estate and distribution-center leases; no finance leases exist. | [Q3 FY2026 10-Q, Note 8 (Leases)] |
| Pension / OPEB underfunding | None material | The Company sponsors only defined-contribution plans (401(k) and non-US equivalents); no defined-benefit pension or OPEB liability is disclosed. | [FY2025 10-K, Note (Employee Benefit Plans): "The Company sponsors defined contribution plans... All matching contributions are made in cash."] |
| Preferred equity | $0 | 100,000,000 preferred shares authorized, $0.01 par value; none issued or outstanding. | [Q3 FY2026 10-Q, Consolidated Balance Sheets] |

---

## 3. Cash & Liquid Assets

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | $123.9M (May 30, 2026); $98.5M (Aug 30, 2025) | No restricted-cash line item is disclosed anywhere in the balance sheet or notes; treated as fully unrestricted. | [Q3 FY2026 10-Q, Consolidated Balance Sheets] |
| Liquid short-term investments | None disclosed | n/a — the balance sheet carries a single "Cash" line; Capital IQ's own "Total Cash & ST Investments" export line equals the "Cash And Equivalents" line exactly in every fiscal year shown, confirming no separate short-term-investments balance exists. | [Financials_Annual.xls, Balance Sheet tab] |
| Restricted / trapped cash (flag) | None disclosed | Not flagged in any filing in the pool; no offshore/trapped-cash language found. This is a US domestic company with no material foreign-subsidiary cash-repatriation disclosure in the extracted text. | [Q3 FY2026 10-Q; FY2025 10-K] |

Because there is no separate liquid short-term-investments balance, the CLAUDE.md §15 **strict** basis (gross debt − cash & equivalents) and **broad** basis (also netting short-term investments) are numerically identical here — there is nothing further to net.

---

## 4. Gross & Net Debt

All figures as of the most recent balance-sheet date, **May 30, 2026** (Q3 FY2026 10-Q), unless noted.

| Metric | Value | Source |
|---|---:|---|
| Gross debt (funded debt, face value) | $400.0M | [Q3 FY2026 10-Q, Note 5] |
| − Cash & equivalents | $123.9M | [Q3 FY2026 10-Q, Consolidated Balance Sheets] |
| **Net debt (strict, §15) — CANONICAL** | **$276.1M** | $400.0M − $123.9M = $276.1M |
| − Liquid short-term investments | $0.0M (none disclosed) | See Section 3 |
| **Net debt (broad, incl. investments)** | **$276.1M** (identical to strict — no investments to net) | Same as above |

**Supplemental view — operating leases included (not the §15 broad/investments basis; shown to reconcile against cross-module and vendor figures that bundle lease liabilities into "total debt"):** funded debt net of deferred financing fees ($397.0M) + operating lease liabilities ($51.4M) − cash ($123.9M) = **$324.6M**. This reconciles exactly to the $324.6M net-debt figure in `earnings/01_historical-financials.md` and to the Capital IQ "Total Debt Outstanding" figure of $448.5M (= $397.0M term loan + $51.4M lease liabilities) cited in `business-model/11_capital-allocation-governance.md`. **This lease-inclusive figure is NOT the canonical net-debt figure for this module** — the canonical figure is the $276.1M strict, funded-debt-only figure above, per the module default (MODULE_RULES.md, Calculation Standard 3). Downstream agents (`02`–`06`) should use $276.1M unless they have a specific, stated reason to include leases.

---

## 5. Leverage Ratios

**EBITDA basis used:** the Company discloses both GAAP ("reported") EBITDA and a company-defined non-GAAP "Adjusted EBITDA" (which excludes loss on impairment, stock-based compensation, business-transaction/integration costs, inventory step-up, and term-loan financing fees) every quarter and fiscal year. Reported EBITDA is shown first in every row below; Adjusted EBITDA is never shown without it.

| Ratio | On Reported (GAAP) EBITDA | On Adjusted EBITDA | Source |
|---|---:|---:|---|
| Gross debt / EBITDA — **FY2025** (face debt $250.0M; last full fiscal year) | $250.0M / $177.9M = **1.41x** | $250.0M / $278.2M = **0.90x** | [FY2025 10-K, MD&A "Reconciliation of EBITDA and Adjusted EBITDA"; Q3 FY2026 10-Q, Note 5 (FY2025 comparative face value)] |
| Gross debt / EBITDA — **Latest TTM** (face debt $400.0M, through May 30, 2026) | $400.0M / $(213.1)M = **not meaningful** (negative denominator) | $400.0M / $234.6M = **1.70x** | [`earnings/01_historical-financials.md`, Section 4 TTM table, sourced to Q3 FY2026 10-Q + Q2 FY2026 10-Q MD&A reconciliations] |
| Net debt / EBITDA — **FY2025** (net debt $151.5M = $250.0M − $98.5M cash) | $151.5M / $177.9M = **0.85x** | $151.5M / $278.2M = **0.54x** | Same sources as above |
| Net debt / EBITDA — **Latest TTM** (canonical net debt $276.1M) | $276.1M / $(213.1)M = **not meaningful** | $276.1M / $234.6M = **1.18x** | Same sources as above |
| Debt / capital — **FY2025** | $250.0M / ($250.0M + $1,806.8M equity) = **12.2%** | (n/a) | [Q3 FY2026 10-Q, Consolidated Balance Sheets (Aug 30, 2025 comparative column)] |
| Debt / capital — **Latest** | $400.0M / ($400.0M + $1,418.1M equity) = **22.0%** | (n/a) | [Q3 FY2026 10-Q, Consolidated Balance Sheets] |
| Debt / equity — **FY2025** | $250.0M / $1,806.8M = **13.8%** | (n/a) | Same as above |
| Debt / equity — **Latest** | $400.0M / $1,418.1M = **28.2%** | (n/a) | Same as above |

**Net leverage basis used above: strict (§15).** There is no broad (investment-inclusive) basis to distinguish here (Section 4). If the lease-inclusive supplemental net debt of $324.6M were used instead, the Latest-TTM net leverage on Adjusted EBITDA would read $324.6M / $234.6M = **1.38x** (this is the figure `earnings/01_historical-financials.md` headlines) — 20 basis points of leverage higher than the canonical $276.1M / $234.6M = 1.18x strict reading. Both figures are shown so downstream agents can see the basis gap explicitly.

**Cyclicality check:** SMPL is not flagged as a deep cyclical name. `business-model/07_business-quality.md` scores cyclicality 65/100 (higher = less cyclical) and describes packaged/branded snack food as "a historically defensive, low-macro-cyclicality category," noting the current TTM revenue decline is attributed by management to brand-specific (Atkins) distribution losses, not a broad consumer-spending downturn. The mandatory normalized/mid-cycle EBITDA row for cyclicals is therefore not triggered. That said, the same source flags that Adjusted EBITDA margin (16.9% TTM) is at a **multi-year trough** versus 19–20% in FY2024–FY2025 — a real, still-unfolding decline, not a cyclical low the reader should discount. Leverage computed on the Latest TTM Adjusted EBITDA of $234.6M is therefore not a "peak-earnings" reading that flatters leverage — if anything, the denominator is currently depressed versus the FY2024–FY2025 run-rate, which would make leverage on a normalized EBITDA lower, not higher, than the 1.18–1.70x range shown above. [`business-model/07_business-quality.md`]

---

## 6. Leverage Trend

| Metric | FY2023 | FY2024 | FY2025 | Latest (TTM, May 30, 2026) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, §15 basis — funded debt only − cash) | ~$197.3M | ~$265.0M | $151.5M | $276.1M | Fell FY23→FY25, then rose sharply |
| Net debt / EBITDA (reported/GAAP EBITDA) | ~0.88x | 1.16x | 0.85x | n/m (negative EBITDA) | Volatile, distorted by impairments |
| Net debt / EBITDA (Adjusted EBITDA) | n/a (Adjusted EBITDA not separately reconciled for FY2023 in this pool) | 0.98x | 0.54x | 1.18x | Rising over the last 12 months |

FY2023 and FY2024 funded-debt figures are sourced from the Capital IQ "Total Term Loans" line (a vendor-computed net-of-financing-fee balance), because no FY2023/FY2024 10-K is present in this data pool to confirm the exact face value directly; FY2025 and Latest figures are confirmed directly from the Q3 FY2026 10-Q's own comparative debt-note table (both periods shown in the same table). [Financials_Annual.xls, Capital Structure Summary tab; Q3 FY2026 10-Q, Note 5]

**Is leverage rising or falling, and why:** Net debt fell over FY2023–FY2025 as the Company paid down "essentially all" of the $250.0M term loan drawn in June 2024 to fund the OWYN acquisition, reaching a low of $151.5M (0.54x Adjusted EBITDA) at FY2025 year-end. It has since reversed sharply: the November 19, 2025 amendment added a fresh $150.0M to the Term Facility (face value $250.0M → $400.0M), and the Company used $213.2M of cash for share repurchases in the 39 weeks ended May 30, 2026 (financing-activities detail: "$150.0 million in proceeds from issuance of long-term debt" and "$213.2 million in repurchases of common stock"). At the same time, Adjusted EBITDA fell from $278.2M (FY2025) to $234.6M (Latest TTM) — a genuine, non-impairment-related margin decline of roughly 330 basis points, not just an accounting artifact — so the leverage increase is a double-move: more debt on a smaller earnings base. Net leverage on Adjusted EBITDA rose from 0.54x (FY2025) to 1.18x strict / 1.38x lease-inclusive (Latest TTM). [Q3 FY2026 10-Q, Note 5 and Consolidated Statements of Cash Flows; `earnings/01_historical-financials.md`; `business-model/11_capital-allocation-governance.md`]

---

## 6A. HoldCo / OpCo & Structural Subordination

| Item | Evidence | Why It Matters |
|---|---|---|
| Where debt sits (HoldCo vs OpCo) | The parent, **The Simply Good Foods Company** (the NASDAQ-listed entity investors hold shares in), **is not a borrower under the Credit Agreement and has not provided a guarantee of it.** Simply Good Foods USA, Inc. is the administrative borrower; certain subsidiary holding companies are co-borrowers; each domestic subsidiary that is not a named borrower has guaranteed the debt on a secured basis. [Q3 FY2026 10-Q, Note 5] | All funded debt sits at the operating-subsidiary level, secured by those subsidiaries' own assets — the standard structure for a syndicated senior secured credit facility. The parent carries no debt of its own to be structurally subordinated to anything. |
| Upstreaming constraints (dividend blockers, regulatory) | Not disclosed in the extracted text as a distinct constraint; the Credit Agreement's covenants generally restrict "payment of dividends and other distributions to equity and warrant holders," which is a constraint ON the OpCo group's ability to upstream cash to the parent, not evidence the parent itself is levered. [Q3 FY2026 10-Q, Note 5] | Matters for `03_liquidity-runway` and `04_coverage-and-covenants` if the parent ever needed to fund something independently of the OpCo group — but the parent has no debt service of its own to fund. |
| Material restricted / trapped cash | None disclosed (Section 3). | n/a |

**Conclusion: Not applicable — no material HoldCo-level debt indicated.** The parent carries zero debt and no guarantee obligation; the entire funded-debt stack sits at the operating-company borrower/guarantor group, secured by that group's own domestic assets. This is not a structural-subordination risk case in the sense this section is designed to catch (there is no separate HoldCo debt layer ranking behind OpCo creditors) — it is the ordinary position of any secured lender ranking ahead of equity.

---

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

Use these numbers verbatim unless a specific, stated reason exists to deviate:

- **Gross debt (canonical):** $400.0M (face value of the Term Facility; $397.0M net of deferred financing fees on the balance sheet). Revolver undrawn ($0.0M of $75.0M committed; $1.1M of letters of credit issued against it). No finance leases. [Q3 FY2026 10-Q, Note 5]
- **Net debt (canonical): $276.1M — strict basis (§15).** No liquid short-term investments exist to distinguish a broad basis; strict = broad here. A lease-inclusive supplemental figure of $324.6M also exists (used by `earnings/01_historical-financials.md`) — flagged, but **not** the figure to carry forward by default.
- **Cash & liquid investments:** $123.9M cash & equivalents; $0.0M short-term investments; no restricted/trapped cash disclosed. [Q3 FY2026 10-Q, Consolidated Balance Sheets]
- **EBITDA base used:** dual-tracked. Reported (GAAP) EBITDA, Latest TTM (through May 30, 2026) = **$(213.1)M — negative**, driven by ~$392M of non-cash goodwill/intangible impairment recognized across the trailing four quarters (detailed in `earnings/01_historical-financials.md`), so not usable as a leverage denominator. Company-defined **Adjusted EBITDA, Latest TTM = $234.6M** (excludes the impairment, SBC, integration costs, term-loan fees). Not a cyclical name (Section 5) — no peak-vs-mid-cycle split required — but Adjusted EBITDA margin (16.9% TTM) is at a multi-year trough versus FY2024–FY2025 (19–20%), a genuine operating decline, not an accounting artifact.
- **Net debt / EBITDA, Latest TTM:** on Reported (GAAP) EBITDA — **not meaningful** (negative denominator). On Adjusted EBITDA — **1.18x** (canonical, strict net debt $276.1M / $234.6M), or **1.38x** if the lease-inclusive $324.6M net-debt figure is used instead (flag the basis whichever is quoted downstream).
- **Reporting currency:** USD.
- **Caveats to propagate downstream:** (1) leverage on Adjusted EBITDA is quoted here alongside the GAAP-EBITDA ratio, which is currently not meaningful because GAAP EBITDA is negative — do not drop this caveat when citing 1.18x/1.38x. (2) The FY2023/FY2024 funded-debt figures in the trend table are Capital-IQ-sourced (vendor), not directly filing-confirmed, because no FY2023/FY2024 10-K sits in this data pool. (3) The covenant-EBITDA addback definition is unconfirmed (Section 1) — `04_coverage-and-covenants` should treat covenant headroom quality as unconfirmed, not assumed favorable, even though the maximum 6.00x net-leverage covenant carries wide headroom against the 1.18–1.38x actual leverage shown here. (4) The pool's S&P BB- rating is stale (dated Jul-14-2022) and should not be read as a current credit-quality signal.

**Net cash / net leverage framing:** SMPL is **not** net cash — it carries $276.1M of net debt (strict basis) against $234.6M of TTM Adjusted EBITDA (1.18x). This is a real, if still modest by leveraged-finance standards, leverage position, not a cash-rich balance sheet; no "net cash" framing applies here.



---

## balance-sheet-survival / 02_maturity-wall-and-refinancing.md

_Source: `02_maturity-wall-and-refinancing.md`_

# Maturity Wall & Refinancing — SMPL

**Reporting currency:** US dollars (USD). **Fiscal year:** ends the last Saturday in August (FY2025 ended Aug 30, 2025). Figures below are stated as of the most recent balance-sheet date, **May 30, 2026** (Q3 FY2026 10-Q, filed Jul-09-2026), which is the current capital structure per `01_capital-structure-and-leverage.md` and supersedes the stale FY2025 10-K debt note. Today's date is 2026-08-06.

**Structural note up front:** SMPL's entire funded-debt stack is a single bullet term loan — one instrument, one maturity date, no scheduled amortization. There is no multi-year "schedule" to ladder because there is only one maturity event. This report still fills out the full standard structure so the size and timing of that one event are unambiguous, and to show the $0.0M rows are a real feature of the debt structure (a bullet loan), not missing data.

---

## 1. Maturity Schedule

All $400.0 million of face-value debt (the Term Facility) is due in a single bullet payment at maturity — March 17, 2030 (extended from the original March 17, 2027 date by the Nov-19-2025 "2026 Incremental Facility Amendment," Amendment No. 8 to the Credit Agreement). The Company "is not required to make principal payments on the Term Facility over the twelve months following the period ended May 30, 2026" [Q3 FY2026 10-Q, Note 5 (Long-Term Debt and Line of Credit)], and no interim amortization schedule of any kind is disclosed for the remaining life of the loan — consistent with the loan's structure as a single-tranche, non-amortizing (bullet) term facility. Buckets below are 12-month windows measured from today (Aug 6, 2026); the March 2030 maturity falls in the Year 4 window.

| Period | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (through Aug 2027) | $0.0M | 0% | — | [Q3 FY2026 10-Q, Note 5: "not required to make principal payments... over the twelve months following... May 30, 2026"] |
| Year 2 (Aug 2027 – Aug 2028) | $0.0M | 0% | — | No amortization disclosed for this window; consistent with the bullet structure. |
| Year 3 (Aug 2028 – Aug 2029) | $0.0M | 0% | — | Same. |
| Year 4 (Aug 2029 – Aug 2030) | **$400.0M** | **100%** | Term Facility (face value), matures March 17, 2030 | [Q3 FY2026 10-Q, Note 5; Key Developments, "Amendment to Credit Agreement Including New Term Loans and Extended Maturities," Nov-19-2025 entry] |
| Year 5 (Aug 2030 – Aug 2031) | $0.0M | 0% | — | Nothing remains after the Year-4 bullet repayment. |
| Thereafter | $0.0M | 0% | — | Same. |
| **Total** | **$400.0M** | **100%** | Term Facility, face value | Reconciles exactly to the $400.0M gross debt (face) figure carried forward from `01_capital-structure-and-leverage.md`, Section 7. No reconciling item. |

**Revolver (not part of the wall above — undrawn, $0.0M outstanding):** the $75.0M committed Revolving Credit Facility is undrawn ($1.1M of letters of credit issued against it; no cash drawn). Its maturity was also extended by the same amendment, to the earlier of (i) 91 days before the Term Facility's maturity or (ii) December 16, 2029 — i.e., it expires shortly before the Term Facility, inside the same Year-4 window. Because it carries a $0 balance, it adds nothing to the dollar maturity wall, but the Company will need to renew or replace this backstop facility around the same time it refinances the Term Facility if it wants continued committed liquidity beyond late 2029. [Q3 FY2026 10-Q, Note 5]

---

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) | **~3.8 years** from the May 30, 2026 balance-sheet date to the March 17, 2030 maturity (≈1,387 days); **~3.6 years** measured from today, Aug 6, 2026 (≈1,319 days). Because 100% of debt sits in one instrument, the WAM is simply the time to that single maturity — there is no blending across tranches. |
| % due within 12 months | **0%** |
| % due within 24 months | **0%** |
| % due within 36 months | **0%** |
| Largest single maturity year (and amount) | **FY2030 (fiscal year ending Aug 2030), $400.0M — 100% of total debt.** This is not a "spike within a ladder" — it is the only maturity event that exists. |

---

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | **0%** | No fixed-rate debt or interest-rate swap/hedge is disclosed anywhere in the extracted 10-K/10-Q text — the entire $400.0M is floating and appears unhedged. [Q3 FY2026 10-Q, Note 5; `01_capital-structure-and-leverage.md` §1] |
| Floating-rate share | **100%** ($400.0M of $400.0M face debt) | SOFR (0.00% floor) + 2.00% margin, or a base-rate alternative (higher of prime, fed funds + 0.50%, or Adjusted Term SOFR + 1.00%). [Q3 FY2026 10-Q, Note 5] |
| Weighted-average coupon | **5.7%** (effective rate at May 30, 2026; down from 6.3% at May 31, 2025, tracking Fed rate cuts through the floating-rate reset, not a credit re-pricing) | [Q3 FY2026 10-Q, Note 5] |
| Current market refi rate (matching tenor/credit) | **Indicative ~5.9%–6.3%** = current 3-month Term SOFR (~3.65% as of Aug 3, 2026) + an indicative BB-rated institutional term-loan spread of ~265 bps (mid-Feb-2026 market level, below its trailing 5-year average of ~304 bps) | Web-sourced, unverified, dated: SOFR level from FRED / sofrrate.com, 2026-08-03 (indicative); BB-loan spread level from market commentary referencing mid-Feb-2026 pricing (PineBridge/S&P-sourced 2026 leveraged-loan outlook commentary), not a filed source — **label as indicative, not a quote specific to SMPL's own credit**. |
| Estimated refi cost step-up (bps) | **Roughly 0 to +60 bps** on the margin/all-in rate if SMPL had to refinance today at a generic BB-rated market spread (~265 bps) versus its actual contractual margin (200 bps). At $400.0M face, +60 bps ≈ **$2.4M/year** of incremental interest cost. **This is a hypothetical "if refinanced today" estimate, not a near-term event** — the loan does not mature until March 2030, and the Nov-19-2025 amendment (9 months ago) actually re-priced $150.0M of new borrowing at the *same* 200 bps margin as the pre-existing balance, i.e., the market accepted 200 bps for SMPL as recently as late 2025 — tighter than the ~265 bps generic BB benchmark above. Whether that gap holds, narrows, or widens by 2029–2030 depends on SMPL's credit trajectory (leverage has risen to 1.18x net/Adjusted EBITDA from 0.54x a year earlier — see `01`) and on where leveraged-loan spreads sit at that time; neither is knowable today. Labeled: **Inference, not from filings**, built on a web-sourced benchmark. |

**Floating-rate sensitivity:** because 100% of the $400.0M is floating and unhedged, every 100 bps move in SOFR changes annual cash interest by **~$4.0M** (0.01 × $400.0M), with no swap disclosed to cushion it. A rate shock is a live exposure today, not just a refinancing-date risk — it hits current cash interest expense immediately on every SOFR reset, independent of the maturity wall.

---

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

Because $0 of debt is due within the next 24 months, there is, strictly, no near-term "refi funding plan" required — the table below shows what would be available if it were needed, for completeness and to make the far-dated wall's coverage legible.

| Source of repayment for next-24m maturities | Amount | Evidence |
|---|---:|---|
| Cash on hand | $123.9M (May 30, 2026) | [Q3 FY2026 10-Q, Consolidated Balance Sheets; `01_capital-structure-and-leverage.md` §3] |
| Forecast FCF (or recent run-rate, labeled) | $119.4M TTM (CFO $147.5M − capex $28.1M, TTM through the most recent quarter) — **recent run-rate, not a forward forecast; FCF fell 32.0% YoY (TTM $119.4M vs prior-year TTM $175.6M)**, driven by higher capex ($28.1M vs $6.4M) and lower CFO | [`earnings/01_historical-financials.md`, §"TTM" table] |
| Revolver availability (only if availability known) | $73.9M available ($75.0M committed − $1.1M letters of credit outstanding; not a borrowing-base facility) | [Q3 FY2026 10-Q, Note 5] |
| Asset-sale proceeds (only if announced / authorized) | **Unknown — none announced.** No asset-sale program is disclosed in the pool as a funding source for debt service. | Not disclosed |
| New debt issuance (only if committed / announced) | **N/A for the next 24 months** — no near-term maturity requires it. For the 2030 maturity itself, no refinancing plan, term sheet, or forward commitment has been announced this far out — normal for a facility 3.6 years from maturity. | Not disclosed |

Since $0 is due in 24 months, cash alone ($123.9M) plus 24 months of run-rate FCF (illustratively ~2× the TTM figure, i.e., roughly $200M+ if the recent run-rate held, though it is declining and should not be extrapolated flatly) would, on paper, already exceed the entire $400.0M face amount by the time the 2030 maturity actually arrives — but that is a multi-year extrapolation, not a funded commitment, and is flagged as such.

The near-term wall (next 12–24 months) is **fully covered without any market access** — there is nothing due. That is a structural fact of the bullet-loan repayment profile, not a liquidity achievement; `03_liquidity-runway` should not credit this as "strong liquidity management," only as an absence of near-term refinancing pressure. The rating posture is stale: the only rating in the pool is S&P BB-, stable outlook, dated Jul-14-2022 — more than four years old, predating both the $250.0M OWYN-acquisition draw (June 2024) and the Nov-19-2025 $150.0M upsize to $400.0M, so it cannot be read as a current opinion on today's higher leverage (1.18x net/Adjusted EBITDA, up from 0.54x a year earlier) [`00_solvency-data-triage.md`; `01_capital-structure-and-leverage.md` §6]. The most recent actual refinancing event — the Nov-19-2025 amendment that upsized the facility by $150.0M and pushed maturity out three years, at an unchanged 200 bps margin — is itself evidence of continued market access as of nine months ago, executed specifically "to fund working capital and general corporate purposes, including reinvestment, growth capital expenditures and repurchases of certain capital stock" [Key Developments export, Nov-19-2025 entry], not a distress refinancing. Floating-rate exposure means 100% of interest cost — all $400.0M — reprices with every SOFR move; there is no fixed-rate anchor and no disclosed hedge. **Conclusion: self-funded / low refi risk for the stated forecast horizon** — the 12–24 month wall is empty, and the single 2030 maturity sits far enough out that neither market closure risk nor coverage shortfall is currently testable against it.

---

## 5. Refinancing Read

SMPL has no maturity wall in any conventional sense for at least the next three years: its entire $400.0M debt stack is one floating-rate bullet term loan due March 17, 2030, with $0 of scheduled amortization before then, so 0% is due within 12, 24, or even 36 months [Q3 FY2026 10-Q, Note 5]. The refinancing cost, if the loan had to be repriced today, looks flat to modestly higher — the contractual 200 bps margin is tighter than the ~265 bps a generic BB-rated institutional term loan has priced at in 2026 per web-sourced market commentary (indicative, unverified), implying a step-up in the rough range of 0–60 bps (~$0–2.4M/year at $400.0M) if market spreads for SMPL's credit normalize to that generic level by 2029–2030 — though the Nov-19-2025 amendment itself repriced $150.0M of new borrowing at the *same* 200 bps margin, suggesting SMPL was still getting tighter-than-generic-BB terms as recently as nine months ago. The single biggest refinancing risk is not the wall's timing — it is that the only credit rating in the data pool (S&P BB-, Jul-14-2022) is more than four years stale and does not reflect the leverage increase since (net debt/Adjusted EBITDA up from 0.54x to 1.18x over the trailing year, per `01`) or the declining FCF run-rate (TTM FCF down 32.0% YoY per `earnings/01_historical-financials.md`) that will determine what terms are actually available when the 2030 refinancing conversation starts. **Under a "market closure" test (no new unsecured issuance for 12 months), SMPL survives the next 12 months without qualification**: $0 of debt matures in that window, cash on hand ($123.9M) and the undrawn, non-borrowing-base $75.0M revolver (availability $73.9M net of $1.1M letters of credit) do not need to be tapped for debt service at all, and no asset sale or new issuance is required. This is a direct read from the disclosed amortization schedule and balance sheet, not an assumption.



---

## balance-sheet-survival / 03_liquidity-runway.md

_Source: `03_liquidity-runway.md`_

# Liquidity Runway — SMPL

**Reporting currency:** US dollars (USD). **Fiscal year:** ends the last Saturday in August (FY2025 ended Aug 30, 2025). Figures below are as of the most recent balance-sheet date, **May 30, 2026** (Q3 FY2026 10-Q, filed Jul-09-2026), consistent with `01_capital-structure-and-leverage.md` and `02_maturity-wall-and-refinancing.md`. Today's date is 2026-08-06.

---

## 1. Liquidity Sources (committed only)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | $123.9M | Y | No restricted-cash line item is disclosed anywhere in the balance sheet or notes; treated as fully unrestricted. | [Q3 FY2026 10-Q, Consolidated Balance Sheets; `01_capital-structure-and-leverage.md` §3] |
| Liquid short-term investments | $0.0M | N/A | None disclosed — the balance sheet carries a single "Cash" line; no separate short-term-investments balance exists. | [`01_capital-structure-and-leverage.md` §3] |
| Revolver / facilities (commitment) | $75.0M | maybe | Not counted at face value — see availability row below. | [Q3 FY2026 10-Q, Note 5] |
| Revolver availability (disclosed) | $73.9M ($75.0M − $1.1M letters of credit outstanding) | Y | Not a borrowing-base facility, so full commitment less LCs is the correct availability figure; $0.0M drawn as cash as of May 30, 2026. | [Q3 FY2026 10-Q, Note 5; `02_maturity-wall-and-refinancing.md` §4] |
| **Total usable liquidity** | **$197.8M** ($123.9M + $0.0M + $73.9M) | | | Sum of the above |

There are no uncommitted lines disclosed to exclude — the entire $75.0M facility sits under the single Credit Agreement and is fully committed. Reporting currency: USD. Liquidity above is stated on the strict, committed-only basis required by this module: cash + $0 liquid investments + confirmed revolver availability (not the $75.0M headline commitment).

---

## 2. Near-Term Uses (next 12 months)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from 02) | $0.0M | [`02_maturity-wall-and-refinancing.md` §1: "not required to make principal payments on the Term Facility over the twelve months following... May 30, 2026"] |
| Cash interest | ~$20.0M (TTM accrual basis, derived) — flag: this reflects a period when the average outstanding balance was below the current $400.0M (the $150.0M upsize only closed Nov-19-2025); a forward run-rate at the full $400.0M balance and the current 5.7% effective rate would be ~$22.8M/year | [`04_coverage-and-covenants.md` §1: TTM interest expense $20.0M, derived from filed quarterly deltas] |
| Maintenance capex | Not separately disclosed — total capex (TTM) $28.1M used as the best available proxy; `earnings/06_earnings-quality.md` flags that no maintenance-vs-growth split is given in any filing in the pool. | [`earnings/01_historical-financials.md` §2; `earnings/06_earnings-quality.md` §2/§Sustainability table] |
| Committed dividends / buybacks | $0.0M | SMPL pays no dividend (none disclosed or declared in any filing in the pool). The stock-repurchase program is explicitly **discretionary**: "does not obligate the Company to acquire any specific number of shares... may be suspended or discontinued at any time" [Q3 FY2026 10-Q, "Stock Repurchase Program"]. $157.5M remains available under the authorization as of May 30, 2026, but none of it is a committed obligation — excluded from this line on that basis (flagged separately below given its recent size and pace). |
| **Total near-term uses (gross, informational only — not the runway input)** | **$48.1M** ($0.0M + $20.0M + $28.1M + $0.0M) | Sum of the above. Not used directly in the Section 3 runway formula because cash interest and capex are already inside FCF (see Section 3). |

---

## 3. Runway

| Metric | Value |
|---|---:|
| Total committed liquidity | $197.8M |
| Annual FCF (TTM) | $119.4M (CFO $147.5M − total capex $28.1M; down 32.0% YoY from $175.6M prior TTM) [`earnings/01_historical-financials.md` §2] |
| Basis used (net-of-FCF / gross-obligations) | **Net-of-FCF** — FCF is positive and directly filing-derived (not a proxy), so it is "meaningful" per the module rule |
| Annual net cash burn (on the stated basis) | (12-month debt maturities $0.0M + committed dividends/buybacks $0.0M) − FCF $119.4M = **−$119.4M** (a surplus, not a burn) |
| Monthly net cash burn (annual burn ÷ 12) | Not applicable — there is no burn; the equivalent monthly surplus is ≈$9.95M/month |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **No finite runway applies.** Near-term committed obligations are $0.0M, so there is nothing for the $197.8M of liquidity or the $119.4M of FCF to be measured against. State as an annual surplus: **$119.4M of TTM FCF, entirely unencumbered by any committed 12-month obligation.** |

**Formula shown, basis named:** on the net-of-FCF basis, annual net burn = (12-month maturities + committed dividends/buybacks) − FCF = ($0.0M + $0.0M) − $119.4M = −$119.4M. Cash interest (~$20.0M TTM) and capex ($28.1M TTM) are **not** re-added — FCF already nets both out (§15, MODULE_RULES §8). Even under the more conservative gross-obligations basis (ignoring FCF entirely and summing all $48.1M of interest + capex + maturities from Section 2), the same $119.4M of FCF alone covers it 2.48x over ($119.4M / $48.1M), leaving a further $71.3M of annual surplus after paying every disclosed near-term cash use in full — so the "no finite runway" conclusion does not depend on which basis is used, only its size does.

### Seasonality / Peak Liquidity Need (Hard Check)

Working capital is **mildly** seasonal, not materially so: no fiscal quarter took more than 30% or less than 20% of annual revenue in any of FY2023–FY2025; Q1 (Sept–Nov) is consistently the smallest quarter (~23–24% of annual revenue) and Q3/Q4 (Mar–Aug) are consistently the largest (~25–28%) [`earnings/01_historical-financials.md` §5]. Net working capital has also been stable across FY2021–FY2025 ($185.0M → $249.4M → $281.8M → $331.7M → $329.1M), with no sharp seasonal trough visible in the annual data [`earnings/01_historical-financials.md` §1]. A discrete peak-quarter cash-usage or working-capital-build dollar figure is not disclosed anywhere in the pool. **Peak working-capital need not disclosed — runway may be overstated**, though given the mild amplitude of the revenue seasonality shown (a 20–30% band, no outlier quarter) and the stable multi-year net-working-capital trend, the likely size of any understated seasonal draw is small relative to the $197.8M of liquidity and $119.4M of FCF surplus computed above — it would need to be an order of magnitude larger than anything in the disclosed history to turn this into a finite-runway situation.

---

## 4. Sources & Uses Bridge

Internal sources cover the next 12 months without qualification and without needing FCF to materialize at all: committed near-term obligations are $0.0M (no debt maturities before March 2030, no dividend, no committed buyback), against $197.8M of already-in-hand committed liquidity (cash $123.9M + confirmed revolver availability $73.9M). None of the 12-month runway depends on FCF holding up — the entire obligation set is already covered by liquidity sitting on the balance sheet today, and the $119.4M of TTM FCF is pure additional cushion, not a load-bearing input. The one real drain on this position is discretionary, not committed: in the 39 weeks ended May 30, 2026, the Company spent $213.2M on share buybacks against just $92.1M of FCF over the same window (CFO $102.2M − capex $10.1M) [Q3 FY2026 10-Q, MD&A "Liquidity and Capital Resources"; `01_capital-structure-and-leverage.md` §6], funding the $121.1M gap partly from a fresh $150.0M term-loan draw — a policy choice management can halt at any time (the program "does not obligate the Company to acquire any specific number of shares"), not a liquidity requirement, but it is the mechanism by which net leverage rose from 0.54x to 1.18x Adjusted EBITDA in the past year.

---

## 5. Liquidity Read

SMPL has no finite liquidity-runway problem over the next 12 months: committed near-term obligations total $0.0M against $197.8M of committed, already-in-hand liquidity (cash $123.9M + confirmed revolver availability $73.9M) and TTM free cash flow of $119.4M that sits entirely as surplus on top — no refinancing, asset sale, or FCF materializing is required, because there is nothing due (`02_maturity-wall-and-refinancing.md`). The single biggest liquidity risk here is not obligations but behavior: the Company has been spending faster than it earns through discretionary share buybacks ($213.2M in the 39 weeks ended May 30, 2026 versus $92.1M of FCF over the same period), funded partly by a $150.0M debt draw, while Adjusted EBITDA margin sits at a multi-year trough (16.9% TTM) and FCF itself is down 32.0% YoY — a trend that, if it continues at the current pace, would erode the liquidity cushion this report currently finds ample, even though nothing in the buyback program is a committed obligation today.



---

## balance-sheet-survival / 04_coverage-and-covenants.md

_Source: `04_coverage-and-covenants.md`_

# Coverage & Covenants — SMPL

**Basis for all figures below:** Latest TTM = twelve months ended May 30, 2026 (FQ4 FY2025 + FQ1–FQ3 FY2026), unless a fiscal-year figure is explicitly labeled. Reporting currency USD, US GAAP. Gross debt $400.0M (face) / net debt $276.1M (strict basis, canonical per `01_capital-structure-and-leverage.md`) carries forward unchanged from `01`.

---

## 1. Coverage Ratios

Interest expense is **gross** (no net-interest disclosure is used or justified) and is derived because no single filing states a clean TTM figure directly: FY2025 10-K annual interest expense $23.249M, minus the 39 weeks ended May 31, 2025 ($19.1M, derived from the Q3 FY2026 10-Q's disclosed $3.2M YoY decrease against the $15.9M nine-month FY2026 figure), plus the 39 weeks ended May 30, 2026 ($15.9M) = **$20.0M TTM interest expense**. [FY2025 10-K, Income Statement; Q3 FY2026 10-Q, MD&A "Interest expense"] This is a derivation from filed quarterly deltas, not a single reported TTM line — flagged per the partial-data rule ("no interest-expense detail" proxy), though the underlying quarterly figures are all filing-sourced, not estimated from a coupon.

| Ratio | Value | Source |
|---|---:|---|
| Adjusted EBITDA / interest (TTM) | **11.7x** ($234.6M / $20.0M) | [Q3 FY2026 10-Q MD&A EBITDA reconciliation; `01_historical-financials.md` §2] |
| GAAP EBITDA / interest (TTM) | **not meaningful** (−$213.1M / $20.0M = −10.6x) | GAAP EBITDA is negative — driven by $391.9M of non-cash goodwill/brand impairment over the trailing four quarters, not an operating cash-flow problem. [`earnings/06_earnings-quality.md` §1] |
| GAAP EBIT / interest (TTM) | **not meaningful** (−$243.3M / $20.0M = −12.1x) | GAAP EBIT (Income from operations) TTM = −$243.3M. [`earnings/01_historical-financials.md` §2] |
| "Adjusted EBIT" / interest (TTM) — **derived, not company-reported** | **10.2x** ($204.4M / $20.0M) | The company does not reconcile an adjusted operating-income figure [`earnings/01_historical-financials.md` §4: "EBIT — Not separately reconciled by the company"]. This is computed as Adjusted EBITDA ($234.6M) minus TTM D&A ($30.2M, itself derived as GAAP EBITDA − GAAP EBIT). **Inference, not from filings.** |
| (Adjusted EBITDA − capex) / interest (TTM) | **10.3x** (($234.6M − $28.1M) / $20.0M) | Capex TTM $28.1M. [`earnings/01_historical-financials.md` §2] |
| (GAAP EBITDA − capex) / interest (TTM) | **not meaningful** (−$241.2M / $20.0M) | Same impairment distortion as above. |
| Fixed-charge coverage (Adjusted EBITDA basis) | **6.1x** — (($234.6M − $28.1M) / ($20.0M interest + $0.0M scheduled amortization + $13.6M TTM lease payments) = $206.5M / $33.6M) | Scheduled amortization: $0 — the Term Facility has no principal payments due in the 12 months following May 30, 2026 (bullet-style amortization under the amended Credit Agreement). [`01_capital-structure-and-leverage.md` §1] TTM lease payments $13.6M, derived as FY2025 total lease cost ($13.186M) minus the 39-week-FY2025 figure ($9.893M) plus the 39-week-FY2026 figure ($10.314M). [FY2025 10-K, Leases note; Q3 FY2026 10-Q, Note 8 (Leases)] |
| Fixed-charge coverage (GAAP EBITDA basis) | **not meaningful** (−$241.2M / $33.6M) | Same impairment distortion. |

**EBITDA basis stated:** Adjusted EBITDA is the company's own non-GAAP metric, defined as EBITDA further adjusted to exclude loss on impairment, stock-based compensation, business-transaction costs, purchase-price-accounting inventory step-up, integration expenses, term-loan transaction fees, restructuring, and other non-core expenses. [Q3 FY2026 10-Q, MD&A "EBITDA and Adjusted EBITDA"] GAAP EBITDA/EBIT are shown first in every row above per module convention, but both read "not meaningful" on a TTM basis because of the impairment; Adjusted EBITDA is the only usable coverage denominator right now.

**Is the EBITDA cash-backed?** No, not fully — and this is a real caveat, not a formality. Per `earnings/06_earnings-quality.md` §2, CFO / Adjusted EBITDA conversion has been falling: 80.1% (FY2024) → 64.1% (FY2025) → **62.9% on the Latest TTM** ($147.5M CFO vs $234.6M Adjusted EBITDA). Roughly 37% of the Adjusted EBITDA used as the coverage denominator above is not showing up as operating cash in the same period. The 11.7x EBITDA/interest and 10.3x (EBITDA−capex)/interest figures are therefore coverage on an accrual earnings base with weakening — not broken, but weakening — cash conversion, not coverage on a fully cash-verified number.

---

## 2. Covenant Inventory

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max total net leverage ratio (Revolving Credit Facility, **springing**) | ≤ 6.00 : 1.00 | 1.18x (strict net debt $276.1M / Adjusted EBITDA $234.6M) / 1.38x if lease-inclusive net debt ($324.6M) is used | **+80.3%** (strict) / **+77.0%** (lease-inclusive) if the test were live today — see §3, it is not currently active | [Q3 FY2026 10-Q, Note 5 (Long-Term Debt and Line of Credit)] |
| Min interest coverage | Not disclosed | n/a | n/a | Not found anywhere in the extracted 10-K/10-Q Note 5 text — the Credit Agreement is disclosed as carrying only the one financial covenant above. |
| Min liquidity / net worth | Not disclosed | n/a | n/a | Not found in the pool. |
| Springing-covenant trigger | Revolver draws > 30% of the $75.0M commitment ($22.5M) | $0.0M drawn (0% of commitment); $1.1M of letters of credit issued against the facility do not count as "credit extensions" for this test per the filing's own wording | The company has **$22.5M of additional undrawn headroom** before the leverage test even activates | [Q3 FY2026 10-Q, Note 5] |
| Equity cure rights (Y/N, limits) | Not disclosed | — | — | "Not disclosed in the data pool" — no equity-cure language located in the extracted Note 5 text. |
| Other — cross-default / change-of-control | Not disclosed distinctly for the Credit Agreement | — | — | "Not disclosed in the data pool" — the 10-K's risk-factor section references Delaware anti-takeover provisions generally, not a Credit-Agreement-specific change-of-control put or cross-default clause; per `00_solvency-data-triage.md`, resolving this would require the full Credit Agreement exhibit, which is not in the pool. |

Only **one** maintenance financial covenant is disclosed for this credit facility, and it is a springing test tied to revolver utilization, not an always-on covenant. This is a genuinely covenant-light structure, not a data gap — the 10-Q's Note 5 language ("The Revolving Credit Facility has a maximum total net leverage ratio equal to or less than 6.00:1.00 contingent on credit extensions in excess of 30%...") is explicit that no other financial maintenance covenant exists in the Credit Agreement as disclosed. [Q3 FY2026 10-Q, Note 5]

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | Not reproduced in the extracted 10-K/10-Q text. The filings state the leverage threshold (6.00:1.00) and the springing trigger (30% of commitments) but do not reprint the Credit Agreement's own "Consolidated EBITDA" definition or addback schedule used for that specific covenant test. | 10-Q (Jul-09-2026), Note 5 — confirmed absent per `00_solvency-data-triage.md` §3 |
| Addbacks permitted (types) | Unknown for the covenant test specifically. The company's separately disclosed P&L non-GAAP "Adjusted EBITDA" (used in Section 1 above) excludes loss on impairment, stock-based compensation, business-transaction costs, inventory step-up, integration expenses, term-loan fees, and restructuring — but nothing in the pool confirms this P&L metric is the same definition the lenders use for the covenant test. **Inference, not from filings.** |
| Addback caps / limits | Not disclosed. |
| Is covenant EBITDA materially above reported EBITDA? | Almost certainly, if the covenant definition tracks the P&L Adjusted EBITDA (which excludes a $391.9M impairment) versus GAAP EBITDA of −$213.1M TTM — but this is not confirmed, since the credit-agreement-specific definition is not in the pool. **Inference, not from filings.** |

**Headroom-quality flag:** because the covenant-EBITDA addback definition is unconfirmed, the 80.3% headroom figure in Section 3 below is computed on the company's disclosed Adjusted EBITDA as a proxy, not on a confirmed covenant-EBITDA figure. Per the module's Covenant Definition Rigor hard rule, this caps covenant-headroom confidence — flag "addback illusion" risk as unresolved, not cleared. The single highest-value missing document remains the full Credit Agreement exhibit (per `00_solvency-data-triage.md`).

---

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | Max total net leverage ratio (springing, ≤6.00:1.00) — the only maintenance financial covenant disclosed |
| Is the covenant currently active/tested? | **No.** It springs only when revolver draws exceed 30% of the $75.0M commitment ($22.5M). The revolver is undrawn ($0.0M) as of May 30, 2026, so the test is not currently live. [Q3 FY2026 10-Q, Note 5] |
| Headroom on tightest covenant, if it were tested today (%) | **+80.3%** = (6.00 − 1.18) / 6.00, using the canonical strict net leverage of 1.18x (net debt $276.1M / Adjusted EBITDA $234.6M); **+77.0%** on the lease-inclusive 1.38x reading. Both are indicative, not a live compliance test, and both rest on the unconfirmed covenant-EBITDA definition flagged above. |
| Adjusted EBITDA decline that would breach it, holding net debt fixed at $276.1M | Adjusted EBITDA would have to fall to roughly **$46.0M** (from $234.6M TTM) to reach 6.00x — an **~80% decline**, which exceeds even the module's most severe standard stress haircut (−60%, which would leave Adjusted EBITDA at ~$93.8M and net leverage at ~2.9x, still well inside the threshold). [Computed: $276.1M / 6.00 = $46.0M; ($234.6M − $46.0M) / $234.6M = 80.4%] |
| Net debt increase that would breach it, holding Adjusted EBITDA fixed at $234.6M | Net debt would have to rise to roughly **$1,407.6M** (from $276.1M) — a **+$1,131.5M (+410%)** increase — to reach 6.00x on its own. [Computed: 6.00 × $234.6M = $1,407.6M] |

Both single-variable breach paths are extreme and, on their own, not plausible in the ordinary course — this covenant is not the company's near-term risk. The more relevant near-term fact is structural, not numerical: **the covenant does not even apply until the revolver is drawn past $22.5M**, and the revolver is currently undrawn. A large, sudden draw on the revolver (e.g., to fund a debt-financed acquisition or buyback) would be the actual event that first turns this covenant "on," well before leverage itself would need to move 80% to breach it.

---

## 4. Coverage / Covenant Read

Earnings on the company's own Adjusted EBITDA cover interest by 11.7x and fixed charges (interest + $0 scheduled amortization + $13.6M TTM lease payments) by 6.1x — but GAAP EBITDA and GAAP EBIT are both negative TTM (−$213.1M and −$243.3M) because of $391.9M of non-cash impairment over the last four quarters, so every coverage number here rests on a non-GAAP earnings base whose cash conversion has fallen from 80% to 63% over the same period (`earnings/06`), not a fully cash-verified one. The only maintenance financial covenant disclosed — a 6.00x max net-leverage test — carries a wide 80.3% indicative headroom against actual net leverage of 1.18x, but it is a springing covenant that is not even currently active (revolver undrawn, versus a $22.5M activation threshold), and the covenant's own EBITDA addback definition is not confirmed in the pool, so that headroom figure is a proxy on disclosed Adjusted EBITDA, not a verified covenant-EBITDA reading. Nothing here threatens near-term covenant compliance, but the coverage cushion is being built on an earnings number (Adjusted EBITDA) that is both shrinking (16.9% margin, a multi-year trough) and converting to cash less reliably than it did two years ago — the risk to watch is the trend in the numerator, not the covenant math itself.



---

## balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md

_Source: `05_off-balance-sheet-and-contingencies.md`_

# Off-Balance-Sheet & Contingencies — SMPL

**Reporting currency:** US dollars (USD). **Standard:** US GAAP. **Fiscal year:** ends the last Saturday in August (FY2025 ended Aug 30, 2025); most recent interim period is Q3 FY2026, ended May 30, 2026 (10-Q filed Jul 9, 2026). Both the FY2025 10-K (Note 10 Leases, Note 11 Commitments and Contingencies, Item 3 Legal Proceedings) and the Q3 FY2026 10-Q (Note 8 Leases, Note 9 Commitments and Contingencies, Part II Item 1 Legal Proceedings) were read directly; the 10-Q figures are used as current, with the 10-K cited for the prior-year comparative.

## 1. Off-Balance-Sheet / Debt-Like Obligations

| Item | Recognized Liability | Maximum / Gross Exposure | Already in 01's debt? | Source |
|---|---:|---:|---|---|
| Operating leases | $51.4M total lease liability at May 30, 2026 ($8.0M current + $43.5M long-term), recognized on-balance-sheet under ASC 842 with a matching $39.6M right-of-use asset | $61.1M undiscounted future lease payments through remaining terms (up to 6 years); the $9.7M gap to the $51.4M recognized figure is the imputed discount (6.0% weighted-average rate), not unrecognized exposure | Flagged, not double-counted — `01` lists operating leases in its "Other Debt-Like Obligations" section (Section 2) and explicitly excludes them from the "gross debt" figure used for leverage ratios, per the module's own convention (US GAAP does not treat operating leases as debt). No finance leases exist. | [Q3 FY2026 10-Q, Note 8 (Leases)]; [FY2025 10-K, Note 10 (Leases)] |
| Pension / OPEB underfunding | $0 | $0 — no defined-benefit plan exists | N/A | [FY2025 10-K, Note (Employee Benefit Plans): the Company sponsors only defined-contribution 401(k) and non-US equivalent plans, cash-funded, no accrued DB liability] |
| Securitization / factoring | None disclosed | None disclosed | N/A | No securitization, receivables-factoring, or off-balance-sheet financing vehicle (VIE/SPE) is disclosed anywhere in the FY2025 10-K or Q3 FY2026 10-Q |
| Purchase / take-or-pay commitments | $0.2M (celebrity/influencer endorsement contracts, payments due over the next year as of May 30, 2026, down from $0.8M as of Aug 30, 2025) | $0.2M — the disclosed figure is already the full remaining obligation under contracts in place; retailer contracts are explicitly at-will with no minimum-purchase or take-or-pay terms, and no supplier/co-manufacturer minimum-purchase commitment is disclosed | N/A — immaterial, not part of the funded-debt stack | [Q3 FY2026 10-Q, Note 9 (Commitments and Contingencies)]; [FY2025 10-K, Note 11]; retailer at-will language: [FY2025 10-K, Item 1A Risk Factors] |

No off-balance-sheet financing vehicle, VIE, or synthetic lease was found anywhere in the pool. This is a name with a thin off-balance-sheet footprint — the only material debt-like item outside the funded-debt stack is the operating-lease liability, and it is fully recognized on-balance-sheet under ASC 842, not hidden.

## 2. Guarantees & Letters of Credit

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| Standby letters of credit | $1.1M outstanding at May 30, 2026 (up from $0.9M at Aug 30, 2025) | $1.1M — face amount is the ceiling; no amounts have ever been drawn | Supports two of the Company's leased buildings (landlord security); the LC amount offsets against the $75.0M Revolving Credit Facility's availability | [Q3 FY2026 10-Q, Note 5 (Long-Term Debt and Line of Credit)]; [FY2025 10-K, Note 7] |
| Financial guarantees (subsidiary-to-lender, secured basis) | $400.0M face (the full Term Facility, guaranteed by each domestic subsidiary that is not itself a co-borrower) | $400.0M — capped at the guaranteed facility's own face amount | Lenders under the syndicated Credit Agreement | Already in `01`'s debt stack — this is the standard secured-guarantor structure for the single funded-debt instrument `01` documents, not an incremental exposure. **The Simply Good Foods Company (the NASDAQ-listed parent) is not a borrower and has not guaranteed the Credit Agreement** — it carries no guarantee obligation of its own. [Q3 FY2026 10-Q, Note 5]; [FY2025 10-K, Note 7] |
| Performance / surety bonds | None disclosed | None disclosed | N/A | No surety bond, performance bond, or third-party financial guarantee (to a customer, JV partner, or unconsolidated affiliate) is disclosed in either filing |

The only genuinely incremental (non-debt-stack) exposure here is the $1.1M letter of credit, which is fully collateral-backed lease security, not a contingent claim against the Company.

## 3. Litigation & Tax Contingencies

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) | Source |
|---|---:|---:|---|---|
| Ordinary-course litigation and claims | $0 reserve disclosed | Not quantified — no matter is identified by name or claimed amount | **Remote/dormant** in the Company's own language: "not presently a party to any litigation that it believes to be material" and "not aware of any pending or threatened litigation... that could have a material adverse effect on its business, operating results, financial condition or cash flows" — repeated verbatim in both the FY2025 10-K (Item 3, Note 11) and the Q3 FY2026 10-Q (Item 1, Note 9), i.e. confirmed current as of May 30, 2026 | [FY2025 10-K, Item 3 (Legal Proceedings) and Note 11]; [Q3 FY2026 10-Q, Part II Item 1 and Note 9] |
| Uncertain tax positions | $0 accrued unrecognized tax benefit at Aug 30, 2025 and Aug 31, 2024; no interest or penalties accrued | Not applicable — no position is recorded | **Remote**: "no changes to the uncertain tax position balance are anticipated within the next 12 months and are not expected to materially affect the financial statements"; tax years 2018–2024 remain open to examination by the IRS, state authorities, and foreign jurisdictions, but no specific examination, assessment, or claim is disclosed | [FY2025 10-K, Note 9 (Income Taxes)] |
| Environmental / asset retirement obligations | $0 | Company states compliance costs are "not expected to have a material effect" and asset retirement obligations "are not material" | **Remote** | [FY2025 10-K, "Environmental Regulations" section] |
| OWYN acquisition escrow | Settled — $1.7M released from escrow to the Company in Q2 FY2025 for a working-capital true-up; no earnout, contingent consideration, or deferred/holdback payment is disclosed for either the Quest (2019) or OWYN (2024) acquisition | N/A — fully closed out, no residual exposure | **Closed**, not a live contingency | [FY2025 10-K, "OWYN Acquisition" discussion] |

No litigation, tax, or environmental matter in the pool is quantified with a claimed dollar amount, an active docket, or "reasonably possible" (as opposed to remote) probability language. This is a genuinely clean litigation profile as disclosed, not a case of unquantified-but-real exposure — the Company's own boilerplate is consistent across the FY2025 10-K and the most recent 10-Q with no new matter introduced.

## 4. Contingent Exposure Summary

| Metric | Value |
|---|---:|
| Total recognized contingent liabilities (LC face + endorsement commitment; litigation/tax reserves are $0) | $1.3M ($1.1M LC + $0.2M endorsement commitment) |
| Total maximum / gross exposure (same items — no disclosed excess above recorded face amounts) | $1.3M |
| Max exposure ÷ recognized | ~1.0x |
| Max exposure ÷ total equity ($1,418.1M equity at May 30, 2026, per `01`) | ~0.1% |

These ratios exclude the $51.4M operating-lease liability, which is a recognized on-balance-sheet obligation (not an off-balance-sheet or contingent one) and is already carried at its full undiscounted-payments ceiling of $61.1M (a 1.19x gap that is pure interest-rate discounting, not unrecognized risk). Including the lease figures for completeness would still leave the ratios immaterial: ($1.3M + $61.1M) ÷ ($1.3M + $51.4M) ≈ 1.19x, and ($1.3M + $61.1M) ÷ $1,418.1M equity ≈ 4.4% — both far below the module's 3x-recognized / 15%-of-equity flag thresholds.

## 5. Contingency Read

SMPL's off-balance-sheet and contingent footprint is thin and, on the evidence in this pool, genuinely thin rather than opaque: the entire funded-debt stack is a single secured Term Facility guaranteed only by the Company's own domestic operating subsidiaries (already priced into `01`'s leverage numbers), the sole off-balance-sheet item of substance is a $51.4M operating-lease liability that is fully recognized on-balance-sheet under ASC 842, and the only truly unrecognized items are a $1.1M letter of credit (fully collateral-backed, capped at face) and a $0.2M endorsement-contract commitment. No litigation, tax, or environmental matter carries a claimed amount or "reasonably possible" language — the Company's own words describe every matter as immaterial or remote, repeated unchanged from the FY2025 10-K through the Q3 FY2026 10-Q filed nine months later. If any of these items were to crystallize, the maximum combined exposure (~$1.3M) is roughly 0.1% of the Company's $1,418.1M equity base and would not move the solvency picture `01`–`04` already establish; the item that actually matters for survival is the $400.0M funded-debt stack itself and its 5.7% floating rate, which this module's other agents already cover, not anything found here. No contingent-liability spike condition is met — there is no line item where maximum exposure exceeds 3x the recognized amount on a live/active matter, and no known-litigious or highly-levered profile exists that would otherwise warrant assuming undisclosed exposure per the module's partial-data rule.



---

## balance-sheet-survival / 06_downside-stress-test.md

_Source: `06_downside-stress-test.md`_

# Downside Stress Test — SMPL

**Reporting currency:** US dollars (USD). **Fiscal year:** ends the last Saturday in August. All figures below are as of the most recent balance-sheet date, May 30, 2026 (Q3 FY2026 10-Q), consistent with `01`–`05`. Today's date is 2026-08-06.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | $234.6M (company-defined Adjusted EBITDA, TTM through May 30, 2026) | `01_capital-structure-and-leverage.md` §7; `04_coverage-and-covenants.md` §1 |
| Net debt | $276.1M (strict basis — the canonical figure `01` designates) | `01_capital-structure-and-leverage.md` §4/§7 |
| Net debt / EBITDA | 1.18x | `01` §5, §7 |
| EBITDA / interest | 11.7x on the TTM-blended interest figure ($20.0M, per `04`); **10.3x on the forward run-rate interest ($22.8M = $400.0M × 5.7% effective rate)** — this report uses the forward figure throughout Section 2, because the $20.0M TTM figure partly reflects the period before the Nov-19-2025 $150.0M upsize and understates the interest the current $400.0M balance actually costs going forward | `04_coverage-and-covenants.md` §1; `02_maturity-wall-and-refinancing.md` §3 |
| Tightest covenant + threshold | Max total net leverage ratio ≤6.00:1.00 (**springing** — only tested when revolver draws exceed 30% of the $75.0M commitment, i.e. $22.5M; not currently active, revolver is undrawn) | `04_coverage-and-covenants.md` §2/§3 |
| Next-12m obligations | $0.0M (no debt maturities before March 2030; no dividend; buybacks are explicitly discretionary, "does not obligate the Company to acquire any specific number of shares") | `02_maturity-wall-and-refinancing.md` §1; `03_liquidity-runway.md` §2 |
| Committed liquidity | $197.8M (cash $123.9M + confirmed, non-borrowing-base revolver availability $73.9M; no minimum-liquidity covenant exists to net out, and no restricted/trapped cash is disclosed) | `03_liquidity-runway.md` §1 |
| Floating-rate debt (gross) | $400.0M — 100% of gross debt, unhedged | `01` §1; `02` §3 |
| Hedge coverage (if any) | None disclosed — no interest-rate swap or cap in the pool | `01` §1; `02` §3 |
| Working-capital seasonality / peak build | Mild (Q1 consistently the smallest quarter at ~23–24% of annual revenue, Q3/Q4 the largest at ~25–28%; no discrete peak-quarter cash figure disclosed) | `03_liquidity-runway.md` §3 ("Seasonality / Peak Liquidity Need") |

**EBITDA basis:** company-defined non-GAAP Adjusted EBITDA (excludes loss on impairment, stock-based compensation, integration costs, inventory step-up, term-loan fees, restructuring). GAAP EBITDA TTM is **negative** ($(213.1)M), driven entirely by $391.9M of non-cash goodwill/brand impairment across the trailing four quarters — it is excluded here because it is not usable as a leverage or coverage denominator, not because it is being ignored (`01` §5/§7). **Cash-backing caveat, carried forward from `earnings/06_earnings-quality.md`:** cash conversion of this Adjusted-EBITDA base (CFO ÷ Adjusted EBITDA) has fallen from 80.1% (FY2024) to 62.9% (Latest TTM) — roughly 37% of the $234.6M base is not showing up as operating cash in the same period. This does not change the EBITDA figure used below (it is still the best available, impairment-adjusted denominator, and no fully-reconciled "cash EBITDA" alternative is disclosed), but it means the coverage and leverage ratios below rest on an earnings base with real, worsening — not yet broken — cash-conversion risk, and the liquidity-side math in Section 2 (which is built off actual TTM free cash flow (FCF), not EBITDA) already reflects that weaker conversion directly.

**Cyclicality calibration check:** `business-model/10_external-dependency.md` scores SMPL 52/100 ("partly externally driven," not the "mostly externally driven" band) and `business-model/07_business-quality.md` scores cyclicality 65/100 (higher = less cyclical), describing packaged snack food as "historically defensive, low-macro-cyclicality." SMPL is **not** flagged as a deep cyclical/commodity name under this module's rule, so the mandatory trough-to-peak history-calibrated haircut is not triggered — the −30/−40/−60% set below is the full required scenario set. (Note: Adjusted EBITDA margin is nonetheless at a genuine multi-year trough — 16.9% TTM vs 19–20% FY2024–FY2025 — but per `01` §5 this makes current-period leverage a slightly conservative, not flattering, starting point for the haircuts that follow.)

**No pending acquisition found** in `business-model/11_capital-allocation-governance.md` or elsewhere in the data pool — the pro-forma adjustment in step 2a of this agent's workflow does not apply. The stress base below is the reported, as-filed balance sheet.

---

## 2. Stress Scenarios

All figures computed directly (Python, shown below); net debt is held constant at $276.1M across the EBITDA-only haircuts, per the module rule to hold the covenant's debt metric fixed unless a stress specifically moves it. The two combined scenarios move a second variable (a cash shock or interest expense) on top of the −40% EBITDA haircut; neither the working-capital shock nor the rate shock changes net debt or EBITDA, so leverage and covenant headroom are unchanged from the −40% column in those two scenarios — only the liquidity gap moves.

```
h        EBITDA   NetLev  EBITDA/Int  Headroom%  StressedFCF
0.00     234.60    1.177      10.289      80.39       119.40
0.30     164.22    1.681       7.203      71.98        66.62
0.40     140.76    1.961       6.174      67.31        49.02
0.60      93.84    2.942       4.116      50.96        13.83
```
(Executed via Bash/Python; formulas: NetLev = 276.1 / EBITDA(h); EBITDA/Int = EBITDA(h) / $22.8M forward-run-rate interest; Headroom% = (6.00 − NetLev)/6.00; StressedFCF(h) = $119.4M TTM FCF − EBITDA·h·(1 − 25% tax), per the FCF-scaling assumption in Section 3.)

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA ($M) | 234.6 | 164.2 | 140.8 | 93.8 | 140.8 | 140.8 |
| Net debt / EBITDA | 1.18x | 1.68x | 1.96x | 2.94x | 1.96x | 1.96x |
| EBITDA / interest | 10.3x | 7.2x | 6.2x | 4.1x | 6.2x | 4.6x (interest rises to $30.8M) |
| Tightest covenant headroom (springing 6.00x ceiling) | +80.4% | +72.0% | +67.3% | +51.0% | +67.3% | +67.3% |
| Covenant breach? (Y/N) | N | N | N | N | N | N |
| 12-month liquidity gap (uses − sources; negative = surplus) | −$119.4M (surplus) | −$66.6M (surplus) | −$49.0M (surplus) | −$13.8M (surplus) | −$7.3M (surplus) | −$41.0M (surplus) |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

**Working-capital shock, labeled assumption:** no discrete seasonal peak-build dollar figure is disclosed (`03` §3), so per the module's partial-data rule this uses a labeled assumption of 3% of TTM revenue ($1,392.2M × 3% = $41.8M) as a one-time added cash outflow inside the 12-month window, layered on the −40% EBITDA haircut. *Inference, not from filings.* Even under this shock, stressed FCF ($49.0M) still exceeds the shock, leaving a thin but positive $7.3M surplus against $0 committed obligations — before even touching the $197.8M of committed liquidity.

**Rate shock:** +200bps on the entire $400.0M floating-rate, unhedged balance = +$8.0M/year of cash interest (not tax-effected — a conservative simplification), layered on the −40% EBITDA haircut. Interest rises to $30.8M; EBITDA/interest falls to 4.6x; stressed FCF falls to $41.0M, still comfortably a surplus against $0 committed obligations.

**Market closure test** (no new unsecured refinancing for 12 months): irrelevant to the next 12 months by construction — $0 of debt matures in that window (`02` §1), so market closure changes nothing about the base case or any of the six columns above. It would only start to matter as the March 2030 maturity approaches, which is outside this stress test's 12-month liquidity window.

---

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches (springing 6.00x net-leverage ceiling) | **~80.4%** |
| Committed liquidity exhausted within 12 months | **Not reached on an EBITDA decline alone (h ≥ 100%)** |
| Net leverage exceeds an indicative market-refi stress threshold (5.00x, labeled assumption — see note) | **~76.5%** |

**(a) Covenant breach — solve, MAX/ceiling form:**
`h = 1 − net debt / (T · EBITDA) = 1 − 276.1 / (6.00 × 234.6) = 1 − 276.1 / 1,407.6 = 0.8039` → **80.4%** EBITDA decline, taking EBITDA to $46.0M against a constant $276.1M net debt. This matches `04_coverage-and-covenants.md` §3's independently-computed figure exactly (cross-check passes). This exceeds even the module's most severe standard haircut (−60%, which leaves leverage at only 2.94x) — the covenant is not a near-term risk on EBITDA decline alone. **The more relevant near-term trigger is structural, not an EBITDA move**: the covenant is currently inactive and only springs if the revolver is drawn past $22.5M (30% of the $75.0M commitment). A severe-enough downside that forces the company to draw the revolver for liquidity — rather than a pure earnings decline — is what would actually turn this covenant "on," and would do so well before leverage itself approached 6.00x.

**(b) Liquidity exhaustion — solve:** `committed liquidity + stressed FCF(h) = next-12-month obligations`, i.e. `$197.8M + [$119.4M − $234.6M·h·(1−0.25)] = $0.0M` → solving gives `h = ($197.8M + $119.4M) / ($234.6M × 0.75) = 1.803` — **h ≥ 100%, i.e. not reached on an EBITDA decline alone.** Sanity check at a full (100%) EBITDA wipeout: stressed FCF = $119.4M − $234.6M×0.75 = −$56.6M; liquidity ($197.8M) plus that stressed FCF still nets to a **positive** $141.3M — no 12-month shortfall even if Adjusted EBITDA fell to zero. This is a direct consequence of two structural facts, not an artifact of the formula: (i) $0 of debt is due in the next 12 months (the bullet structure means there is nothing for a bad year to collide with), and (ii) $197.8M of committed liquidity is large relative to the company's fixed cash costs. **FCF-scaling assumption stated plainly:** lost EBITDA is assumed to drop through to FCF at (1 − 25% effective tax rate), holding cash interest and capex fixed — this is the standard scaling this report uses per the module rule, and it is the more conservative of the two components (it assumes the full after-tax EBITDA loss hits cash, with no working-capital offset).

**(c) Net leverage exceeds a market-refi stress threshold:** No SMPL-specific refinancing-market leverage ceiling is disclosed in the pool. This row uses a **labeled assumption** of 5.00x — a round threshold below the company's own 6.00x covenant, illustrating where a BB−-type credit typically begins to see leveraged-loan market friction (*Inference, not from filings*). `h = 1 − 276.1 / (5.00 × 234.6) = 1 − 276.1 / 1,173.0 = 0.7646` → **76.5%**. Because this indicative threshold is below the actual 6.00x covenant, it triggers slightly before the covenant would (76.5% vs 80.4%) — but both are far beyond the module's standard −60% severe-case haircut, and both should be read as low-confidence, illustrative bookends, not hard limits.

---

## 4. Survival Read

The structure does not break on the standard −30/−40/−60% haircuts, and does not come close: even the most severe mandated case (−60% EBITDA, taking Adjusted EBITDA to $93.8M) leaves net leverage at 2.94x against a 6.00x springing covenant (still inactive) and a $13.8M annual FCF surplus against $0 of committed 12-month obligations. The first thing that would actually break is the covenant, and only at an ~80% EBITDA decline — a level this report is not aware of any precedent for in SMPL's own history and that would require Adjusted EBITDA to fall from $234.6M to roughly $46.0M. Liquidity does not run out on an EBITDA decline alone at any decline up to and including 100% (a full wipeout), because the entire $400.0M debt stack is a single bullet due March 2030 with $0 due in the next 12 months — a 30–40% decline, a normal recession and not a tail event, is survivable on the covenant and liquidity axes with no waiver, asset sale, or equity raise needed. The market closure test changes nothing for the next 12 months, because nothing is due in that window regardless of whether refinancing markets are open.

The real vulnerability this report finds is not modeled by the standard haircuts, because it is a policy choice, not a committed obligation: SMPL spent $213.2M on discretionary share buybacks in the 39 weeks ended May 30, 2026 (an annualized pace of roughly $284.3M) against just $92.1M of FCF over the same window, funding the gap partly with a fresh $150.0M debt draw (`03` §4; `01` §6). If that buyback pace continued unabated through a −40% EBITDA decline, the funding gap versus stressed FCF and committed liquidity combined would be roughly $37M within 12 months (($284.3M buyback pace − $49.0M stressed FCF) − $197.8M liquidity); at −60%, the gap widens to roughly $73M — figures computed here, not in the mandated tables above, because they assume a policy the company is not obligated to continue (per its own "does not obligate the Company to acquire any specific number of shares" language) and the module's convention correctly excludes discretionary buybacks from committed near-term obligations. In plain terms: the balance sheet survives a real recession on its own; the only way it gets into trouble inside 12 months is if management keeps buying back stock at the current pace straight through a serious earnings decline, which is a discretionary decision management can reverse at any time, not a structural weakness of the debt itself.

Out-of-scope request received: none. No probability is assigned to any of the above scenarios — that judgment belongs to the master synthesizer.
