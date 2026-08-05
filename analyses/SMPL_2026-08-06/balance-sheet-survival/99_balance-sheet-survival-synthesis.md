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
