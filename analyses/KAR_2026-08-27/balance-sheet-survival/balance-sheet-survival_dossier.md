# balance-sheet-survival Module Dossier — KAR

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `balance-sheet-survival_memo.md`.

- Generated: 2026-08-27T14:31:15Z
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

# Balance-Sheet-Survival Module — KAR (Synthesis)

## Abstract

Karoon Energy carries low leverage that has fallen sharply since FY2022 and sits at 0.36x net debt/EBITDA (net debt $132.7m, canonical strict basis, FY2025 Annual Report) even before the trailing months' capex-driven rise to $269.7m (0.83x on clean EBITDA, 30-Jun-2026 unaudited). Its $338.8m debt stack is a barbell, not a wall: 99.7% is a single $350.0m bullet due May-2029, with only 0.3% due inside 24 months. Committed liquidity of $307.0m–$546.1m covers near-term obligations 24–43 months, and covenant headroom, though not precisely measurable (no indenture is in the data pool), is indicatively wide. The stress test shows the first plausible break — an indicative debt-service covenant — only near a 55% EBITDA decline, and liquidity never exhausts, even at a full EBITDA wipeout. Verdict: Solid.

## 1. Solvency Verdict

- **Verdict: Solid**
- **Net leverage (net debt / EBITDA):** 0.36x on reported EBITDA ($132.7m canonical net debt ÷ $380.7m FY2025 reported EBITDA); 0.41x on one-off-stripped clean EBITDA ($324.2m); gross leverage 0.89x ($338.8m gross debt ÷ $380.7m). On the more current, unaudited 30-Jun-2026 snapshot, net debt has risen to $269.7m, implying 0.83x on clean EBITDA — still low in absolute terms but the trajectory is worth watching [01, 06].
- **Liquidity runway:** 24.3 months on the current, post-step-down (most conservative) basis; 28.7 months on the current unaudited snapshot; 43.2 months on the FY2025 audited anchor. Every basis clears the 12-month test comfortably [03].
- **Maturity wall (% within 24 months):** 0.3% ($1.1m of finance leases against $338.8m gross debt). 99.7% is a single bullet — the $350.0m (face) Second Priority Senior Secured Notes, due 14-May-2029 [02].
- **Tightest covenant + headroom:** Not assessable on a real, disclosed threshold — no indenture or credit agreement for either the Notes or the $340.0m RBL exists in the data pool; the Annual Report states only that "the Group has complied with all loan covenants." Under a LABELED market-typical assumption, the indicative tightest test is a DSCR-style (EBITDA − recurring capex)/interest covenant (assumed 1.2x–1.5x floor), with indicative headroom of +50.7% to +88.3% on the recurring-capex basis [04].
- **Stress break point (EBITDA decline that breaks it):** The indicative DSCR-style covenant is the first thing to trip, at roughly a 54.6%–58.4% EBITDA decline (between the −40% and −60% haircuts tested). Committed liquidity does not exhaust at any tested EBITDA haircut, including a full 100% wipeout combined with a $100m working-capital shock — a $230.9m surplus remains even then [06].
- Solvency strength /100: **80** (very low leverage across every basis tested — latest, peak, mid-cycle, one-off-stripped — but tempered by a sub-investment-grade B/B+ rating that sits at odds with the leverage ratios, a barbell maturity structure concentrated in a single 2029 bullet, and a post-anchor net-debt rise driven by heavy capex)
- Liquidity runway /100: **85** (24–43 months of committed, disclosed-availability liquidity against near-term obligations; no cap applies — the RBL's availability is disclosed, not merely a headline commitment)
- Refinancing risk /100 (higher = worse): **32** (near-term risk is close to zero — trivial 24-month maturities, a bond trading above par with a market yield below its own coupon; medium-term risk is real — the RBL's Sep-2028 maturity and the Notes' May-2029 bullet compress into an 8-month window, against a sub-investment-grade rating and an unhedged, commodity-cyclical earnings base)
- Covenant headroom /100: **60 (capped — Not assessable on a real threshold)**. Indicative headroom is wide (+51% to +88%), but MODULE_RULES.md's score cap applies because no covenant thresholds or covenant-EBITDA definition are disclosed anywhere in the pool.
- Downside resilience /100: **85** (survives every EBITDA haircut tested, including −60%, without a real covenant breach or liquidity exhaustion; the only trip is an indicative, unmeasured covenant at ~55% decline)
- Data quality /100: **85** (a recent audited annual balance sheet, a reviewed interim balance sheet, a full contractual maturity schedule, and an audited cash flow statement are all present; the sole material gap is the covenant-threshold/covenant-EBITDA definition)
- Overall usefulness /100: **75 (capped)** — MODULE_RULES.md caps usefulness at 75 whenever covenant disclosure is absent, regardless of how strong the underlying leverage and liquidity picture is.
- **Biggest solvency risk (one line):** The 2028–2029 refinancing compression — the RBL matures Sep-2028 and the $350.0m Notes bullet lands May-2029, eight months apart, against a sub-investment-grade (S&P B / Fitch B) rating and a reserves-based facility whose borrowing base would plausibly shrink further than its disclosed amortisation schedule in the same severe, sustained oil-price decline that would produce a deep EBITDA haircut.

## 1A. Module Disconfirmation

- **Strongest bear point:** The debt stack is a barbell, not a ladder — 99.7% of gross debt is a single $350.0m bullet due May-2029, and the RBL that would otherwise backstop a refinancing shortfall matures just eight months earlier (Sep-2028) [02]. Both instruments must likely be refinanced or replaced in the same narrow window while Karoon carries a sub-investment-grade B/B+ rating and runs fully unhedged into a commodity-cyclical business [00, 02, 04].
- **Strongest bull point (steelman):** Net leverage is low on every basis tested — latest (0.36x), peak-year floor (0.27x), mid-cycle/normalised (0.33x), and even the one-off-stripped clean EBITDA basis (0.41x) — and the stress test shows liquidity does not exhaust even at a full 100% EBITDA wipeout combined with a $100m working-capital shock, leaving a $230.9m surplus [01, 06]. The bond itself trades above par with a market yield (8.211% YTW) below its own 10.50% coupon, meaning the market currently prices refinancing risk as favorable, not adverse [02].
- **Single killer risk specific to solvency:** A sustained, severe oil-price decline that both cuts EBITDA deeply (Karoon is ~93% oil/liquids-weighted and unhedged) AND triggers a reserves-based redetermination that cuts RBL availability below its disclosed step-down schedule — compounding exactly when the 2028–2029 maturity pair needs refinancing [06 caveat on the liquidity solve; business-model/10_external-dependency.md].
- **Disconfirming evidence already visible:** Net debt more than doubled in the six months after the audited FY2025 anchor — $132.7m (31-Dec-2025) to $269.7m (30-Jun-2026) — while cash fell 61% ($206.1m to $80.3m), driven by a heavy, largely front-loaded capital programme rather than by earnings weakness [01 §6, 03]. This does not change the survival verdict (leverage remains low in absolute terms even at the current snapshot, 0.83x on clean EBITDA), but it is a real, disclosed deterioration in trajectory that the FY2025-anchor figures alone would understate.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| solvency-data-triage | Sufficient — full audited balance sheet, debt note, maturity schedule, and cash flow statement present; covenant thresholds are the one material gap | No indenture or credit agreement for either the Notes or the RBL exists in the pool — covenant thresholds and covenant-EBITDA definition are undisclosed |
| capital-structure-and-leverage | Low but non-zero leverage (0.27x–0.41x net debt/EBITDA across every basis tested) | Net debt rose from $132.7m to $269.7m in the six months after the FY2025 anchor, driven by capex, not new borrowing; sub-investment-grade rating (B/B+) sits at odds with the low leverage ratios |
| maturity-wall-and-refinancing | Self-funded / low refi risk for the next 12–24 months; a barbell, not a ladder | 99.7% of gross debt is a single $350.0m bullet due May-2029; the RBL matures Sep-2028, compressing both instruments into an 8-month refinancing window |
| liquidity-runway | Runway is at least 24 months even on the most conservative, most current snapshot | Committed liquidity rests on cash plus a secured, asset-backed RBL with disclosed availability, not on FCF (FY2025 FCF was negative $37.1m and was deliberately not netted) |
| coverage-and-covenants | Interest is comfortably covered on every measured basis (EBITDA/interest 9.33x); covenant headroom is Not assessable on a real threshold | No indenture/credit agreement is in the pool; the only covenant disclosure is a one-line compliance statement — indicative headroom is wide but unmeasured |
| off-balance-sheet-and-contingencies | Total maximum quantifiable contingent exposure is $47.6m (4.6% of equity) — below the RF-OBS-001 threshold | The filing's "up to $285m" Petrobras earn-out headline is a stale, mostly-already-paid cumulative programme cap; the correctly-scoped forward residual is only ~$42.4m |
| downside-stress-test | Survives a 30–60% EBITDA decline on every real (measured) metric; the only trip is an indicative, unmeasured covenant near a ~55% decline | Committed liquidity does not exhaust at any tested haircut, including a full 100% EBITDA wipeout plus a $100m working-capital shock — a $230.9m surplus remains |

## 3. Reconciliation

No material disagreements between specialists on measured facts — every agent used the same canonical debt stack, net debt, and EBITDA bases from `01`, and consistently flagged the FY2025 audited anchor alongside the more current, unaudited 30-Jun-2026 snapshot as the more conservative read (per MODULE_RULES.md §7). Two items are worth naming explicitly, not because specialists disagreed, but because each surfaced a tension the other did not fully resolve:

- **Rating vs. ratio gap.** `01` and `04` both flag that Karoon's leverage ratios (0.27x–0.41x net debt/EBITDA) look investment-grade-like while its actual credit rating (S&P B / Fitch B, Stable) is sub-investment-grade. Neither module resolves why — the most likely explanation, not stated in either report, is that rating agencies weight commodity-price volatility, reserve life, and the single-bullet maturity structure more heavily than a point-in-time leverage ratio; this gap is carried forward unresolved and is the reason the verdict here is "Solid," not "Fortress."
- **Anchor-date deterioration.** `01`'s canonical figures use the FY2025 audited anchor (net debt $132.7m); `02`, `03`, and `06` each separately confirm the post-anchor rise to $269.7m (30-Jun-2026, unaudited) and treat it as the more decision-relevant, conservative figure. This synthesis follows the same convention: the verdict block above states leverage on both bases.

## 3A. Fragility Map (what breaks first)

| Fragility Driver | Indicator | Current Status | Why It Matters |
|---|---|---|---|
| Maturity concentration | % due within 24m | 0.3% ($1.1m of $338.8m); 99.7% is a single 2029 bullet | A weighted-average maturity of ~3.4 years reads comfortably but conceals that the debt stack is a barbell — nothing due for years, then a $350.0m cliff |
| Availability liquidity | RBL availability vs. near-term uses | $226.7m availability (post-step-down, Sep-2026) vs. $27.6m net-of-FCF near-term uses / $151.8m gross-obligations uses | Large surplus today, but the RBL's availability is on a disclosed, mechanical amortisation schedule ($340.0m → $283.3m → $226.7m) that shrinks regardless of Karoon's own credit quality, and could plausibly shrink further under a reserves-based redetermination in a severe oil-price decline |
| Covenant illusion risk | Covenant EBITDA vs. reported EBITDA | Undisclosed — reported EBITDA itself carries ~$56.5m (14.8%) of one-off, non-cash gains (FPSO disposal gain + Petrobras fair-value gain) | Whether covenant EBITDA would strip those gains, add back further items, or match reported EBITDA exactly cannot be determined from this pool — "addback illusion" risk is unassessed, not ruled out |
| Floating-rate sensitivity | Floating % net of hedges | 0% currently (RBL undrawn at both anchor dates; Notes 100% fixed at 10.50%) | Zero current rate exposure, but a full RBL draw would be entirely floating (SOFR + undisclosed margin) with no active hedge — the last Brent collar expired unreplaced |
| Structural subordination | HoldCo debt vs. upstreaming | None — Notes and RBL both guaranteed/secured by Group entities comprising ≥90% of EBITDAX and ≥90% of total assets; no disclosed dividend blocker | Debt is effectively Group-wide obligated, not trapped below a thinly-guaranteed holding layer |
| Contingent accelerants | CoC puts / cross-default | Not disclosed in the pool (no indenture/credit agreement present) | Absence of disclosure is itself a gap, not evidence of absence — hidden accelerants cannot be ruled out |

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No debt maturity schedule | N — full contractual maturity table is disclosed [00, 02] | Solvency strength | Not applicable |
| No covenant disclosure | **Y** — no indenture/credit agreement in the pool; only a one-line compliance statement [00, 04] | Covenant headroom | Not assessable; capped at 60. Overall usefulness capped at 75 |
| No cash flow statement | N — audited FY2025 and reviewed H1 FY2025 cash flow statements are present [00] | Liquidity runway | Not applicable |
| Only annual data (no interim) | N — a reviewed H1 FY2025 interim balance sheet and cash flow statement exist, plus quarterly Activities Report updates through 2Q26 [00] | Solvency strength | Not applicable |
| No EBITDA base (stress not run) | N — a usable, cash-backed EBITDA base exists and the stress test ran in full [00, 06] | Downside resilience | Not applicable |

No other MODULE_RULES.md caps apply: the RBL's availability is disclosed (not "unknown"), no known-litigious/levered off-balance-sheet exposure went undisclosed (RF-OBS-001 did not fire), and the HoldCo/OpCo structure and guarantor scope are fully disclosed with no material subordination. The most restrictive cap in effect is the covenant-disclosure cap, which governs both Covenant headroom and Overall usefulness.

## 5. Survival Summary

Karoon is a low-leverage balance sheet with a falling-then-flattening trend: net leverage fell from 0.77x (FY2022) to a low, stable 0.34x–0.36x band over FY2024–FY2025, and stays inside a narrow 0.27x–0.41x range across every basis tested (latest, peak, mid-cycle, one-off-stripped) — though the most current, unaudited data point (30-Jun-2026) shows net debt has since risen to $269.7m (0.83x on clean EBITDA), driven by a heavy capital programme rather than new borrowing or earnings weakness. The near-term maturity wall is entirely self-funded: only 0.3% of gross debt is due within 24 months, and the real structural risk is not near-term but a compressed 2028–2029 window where the RBL's Sep-2028 maturity and the Notes' May-2029 bullet both need refinancing within roughly eight months of each other, against a sub-investment-grade B/B+ rating. Liquidity runway is long — 24 to 43 months depending on the anchor date used — and the tightest covenant, though not measurable against a real disclosed threshold, sits at an indicatively wide +51% to +88% headroom under a labelled market-typical assumption. The stress test's break point is the single clearest finding in the module: the first thing to trip, even indicatively, is a debt-service covenant near a 55%–58% EBITDA decline, and liquidity itself never exhausts on any EBITDA haircut tested, including a full 100% wipeout combined with a $100m working-capital shock. A normal recession-scale EBITDA decline (−30% to −40%) is comfortably survivable without a waiver, an equity raise, or an asset sale on every metric this module can actually measure.

## 6. What Would Change The Solvency Verdict?

| Current Verdict | What Would Strengthen It | What Would Weaken It | Data Needed |
|---|---|---|---|
| Solid | The Notes indenture or RBL credit agreement disclosing real, measured covenant thresholds that confirm the wide indicative headroom (would support upgrading toward "Fortress" if the RBL's reserves-based redetermination mechanic is also shown to be resilient to a severe, sustained oil-price decline) | A continuation of the post-FY2025 net-debt rise (already $132.7m → $269.7m in six months) without the guided 2H26 free-cash-flow improvement materialising; a rating downgrade; a Brent price decline severe enough to trigger an adverse RBL borrowing-base redetermination ahead of the disclosed amortisation schedule | The indenture / credit agreement (covenant thresholds + covenant-EBITDA definition); an interim (H1 FY2026) balance sheet to confirm the current trajectory; disclosure of the RBL's borrowing-base redetermination formula and its sensitivity to oil price |

## 6A. Survival Playbook (non-speculative levers)

- **Refi action available, not yet taken:** the Notes carry a next call date of 3-Sep-2026 at 105.25% of par; the bond currently trades above par with a market yield-to-worst (8.211%) below the 10.50% coupon, giving Karoon an evidenced opportunity to refinance at a lower cost — whether management intends to exercise the call is not disclosed in this pool [02].
- **Capex flexibility, evidenced:** 85% of the FY2026 capex budget was already spent by 30-Jun-2026 (the Baúna flotel revitalisation, SPS-92 well intervention, and Who Dat A1 sidetrack together totalled $214.6m across 1Q26–2Q26), and management explicitly guides to "lower capital expenditure" and "higher free cash flow" in 2H26 — a disclosed, near-term self-correcting lever on the post-anchor cash burn, not a speculative one [01, 03].
- **Dividend/buyback suspension, evidenced as discretionary:** the board pays 20–40% of underlying NPAT semi-annually under a stated policy, not a fixed dollar commitment, and the on-market buyback ($4.0m in 2Q26, ~$97m cumulative since 2H24) is a stated intent, not a contractual obligation — both are genuine, cuttable levers in a downside [03; business-model/11_capital-allocation-governance.md].
- No asset-sale programme is announced or authorized anywhere in the data pool.
- No debt-restructuring, waiver request, or covenant amendment has occurred or is disclosed as pending.

## 7. Note To The Final Synthesizer

- Net leverage is low and has fallen structurally since FY2022 (0.77x → 0.34x–0.36x), gross leverage is also low (0.89x gross debt/EBITDA), and this holds across every basis tested (latest, peak-year floor, mid-cycle/normalised, one-off-stripped) — but net debt has more than doubled since the FY2025 audited anchor ($132.7m → $269.7m over six months to 30-Jun-2026), driven by capex, not by weaker earnings or new borrowing.
- The maturity wall is a barbell, not a ladder: 99.7% of gross debt is a single $350.0m bullet due May-2029; only 0.3% is due within 24 months. Refinancing is not currently secured (no committed refi facility for the 2029 bullet is disclosed) but is currently favorable on market pricing — the bond trades above par with a market yield below its own coupon. The real refinancing risk is the compression of the RBL's Sep-2028 maturity and the Notes' May-2029 bullet into an eight-month window, against a sub-investment-grade B/B+ rating.
- Liquidity runway is 24–43 months depending on anchor date, and depends on cash on hand plus a secured, asset-backed RBL whose disclosed availability is on a mechanical, reserves-based step-down schedule ($340.0m → $283.3m → $226.7m by 30-Sep-2026) independent of Karoon's own credit quality.
- The tightest covenant cannot be measured against a real threshold — no indenture or credit agreement is in the data pool. Indicative headroom, under a labelled market-typical assumption, is wide (+51% to +88%), but this is not a confirmed fact.
- No off-balance-sheet or contingent exposure met the RF-OBS-001 threshold (max exposure ÷ recognized liability > 3x, or max exposure ÷ equity > 15%, on a matter genuinely live). The largest quantifiable exposure — the Petrobras Baúna earn-out — is correctly scoped at a ~$42.4m forward residual (1.38x recognized, 4.6% of equity), not the filing's stale "up to $285m" cumulative headline, most of which has already been paid.
- The stress break point: the first thing to trip, even indicatively, is a debt-service covenant near a 54.6%–58.4% EBITDA decline (between the −40% and −60% haircuts tested); committed liquidity does not exhaust at any tested haircut, including a full 100% EBITDA wipeout combined with a $100m working-capital shock, leaving a $230.9m surplus.
- Karoon is **not** a net-cash balance sheet (net debt is positive on the strict basis at every anchor date tested), so the module's "net cash as strategic asset" framing (§24 Filter 3) does not apply verbatim — the survival strength here comes from low absolute leverage and deep committed liquidity, not from a net-cash cushion.
- A covenant-disclosure cap applies: Covenant headroom is capped at 60 (Not assessable on a real threshold) and Overall usefulness is capped at 75, both per MODULE_RULES.md, because no indenture or credit agreement for either the Notes or the RBL exists anywhere in the data pool.
- Biggest missing data point / single highest-value next data request: the Notes indenture or the RBL credit agreement (or a term sheet disclosing the actual financial-covenant thresholds and the covenant-EBITDA definition) — this is the one document that would convert the current "compliant, per management" statement into a measured, direction-aware headroom figure.
- **Explicit handoff:** the master synthesizer's "Balance Sheet and Survival Test" section should defer to this synthesis; the stress break points here (the ~55% EBITDA-decline covenant trip, the non-exhausting liquidity result, and the 2028–2029 maturity compression) are the inputs for the master's downside scenario and risk register — this module does not assign probabilities to any of them.

## 8. Simple Summary

- Total debt is $338.8m (carrying value; $351.1m face), almost all a single $350.0m bond due 2029; net debt is $132.7m against the FY2025 audited books, but has risen to $269.7m by mid-2026 on heavy capital spending. Net leverage is low either way: 0.36x and 0.83x respectively against clean EBITDA.
- The maturity wall is essentially not a near-term issue — only $1.1m (0.3% of debt) is due in the next 24 months. The real risk is 2028–2029, when both the revolving facility and the bond bullet come due within eight months of each other.
- Liquidity runway is 24 to 43 months, backed by cash plus a secured, undrawn credit facility with disclosed, if shrinking, availability.
- The tightest loan covenant cannot actually be checked — no loan agreement is in the data — but a reasonable, labeled estimate puts headroom at roughly 50–88%, wide but unverified.
- The largest off-balance-sheet item is an oil-price-linked earn-out payment tied to the 2019 Baúna acquisition; its real forward exposure is about $42.4m, not the $285m headline figure the filing also quotes (most of that $285m has already been paid).
- Karoon survives a 30% to 60% drop in earnings on every number this module can actually measure — the first thing that would break, even on an unverified estimate, is a debt-service covenant near a 55% earnings decline, and cash-plus-facility liquidity never runs out, even in a total earnings wipeout.
- Karoon does have credit ratings (S&P B / Fitch B, both Stable, sub-investment-grade) — but the actual loan-agreement terms behind those ratings are missing from the data; that is the single biggest gap.
- This module is useful for the master synthesizer: leverage, liquidity, and the stress test are all solidly evidenced; only the covenant precision is capped.



---

## balance-sheet-survival / 00_solvency-data-triage.md

_Source: `00_solvency-data-triage.md`_

# Solvency Data Triage — KAR

Karoon Energy Ltd (ASX: KAR), ABN 53 107 001 338 — Australian-incorporated, ASX-listed upstream oil & gas producer (Baúna/Santos Basin, Brazil, operated; Who Dat/Dome Patrol/Abilene, Gulf of America, non-operated). This triage reads `data/KAR/` directly. No `ciq_facts.json` or `relationships.json` sidecar exists in `_pool_extracts/` for this run — no deterministic facts pin or supply-chain graph is available; all figures below are this agent's own sourced read of the underlying documents, cross-checked to the audited FY2025 Annual Report where the same line item is disclosed there. No `data/KAR/external/` folder exists in this pool — there is no externally sourced research to inventory (Section 1A is omitted per the "when any external documents exist" trigger).

Pool extraction is clean: per `analyses/KAR_2026-08-27/_pool_extracts/manifest.json`, all 85 tracked sources are `status: ok`, except two `in-place` (non-extractable-by-design) items — a personal audio file (`Sapna Kusumgar…mp3`) and an unrelated `ai_team_characters.json` config file, neither solvency-relevant. **Zero sources are in a `fail`, `fallback-text`, or `missing-dependency` state** — nothing is downgraded to "missing" on extraction grounds. Per `manifest.md`: 48 workbooks → 170 tabs; 205 extract files; 0 failures.

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| `Filings/…Form_Annual_Report(Feb-25-2026).pdf` | Annual filing (audited, statutory Annual Report) | FY2025 (year ended 31-Dec-2025) | Aug 26 2026 (Drive-sync date, not evidentiary) | **High** — Notes 14–19 (Leases, Provisions, Contingent Liabilities, Borrowings, Other Financial Assets/Liabilities, Contributed Equity), liquidity-risk maturity table, going-concern statement |
| `Filings/…Form_Preliminary_Final_Report(Feb-25-2026).pdf` | Annual filing (Appendix 4E — ASX results-to-market) | FY2025 (year ended 31-Dec-2025) | Aug 26 2026 | High — audited/reviewed summary financials, same period as Annual Report |
| `Filings/…Form_Preliminary_Annual_Report(Jan-27-2026).pdf` | Duplicate / mislabeled (byte-identical to Q4 Activities Report filed one day earlier) | 4Q25/CY25 (period ending 31-Dec-2025) | Aug 26 2026 | Low — duplicate, not independent |
| `Filings/…Form_Half_Yearly_Report(Aug-26-2025).pdf` | Interim filing (Appendix 4D — half-year report) | H1 FY2025 (half year ended 30-Jun-2025) | Aug 26 2026 | **High** — interim balance sheet, cash flow, dividend |
| `Filings/…Form_Half_Year_Audit_Review(Aug-26-2025).pdf` | Interim filing (auditor's independent review report + reviewed financial statements) | H1 FY2025 (half year ended 30-Jun-2025) | Aug 26 2026 | **High** — reviewed Notes incl. Borrowings, drawn debt, cash |
| `Filings/…Form_Half_Yearly_Report(Aug-27-2024).pdf` | Interim filing (Appendix 4D) | H1 FY2024 (half year ended 30-Jun-2024) | Aug 26 2026 | Medium — prior-year comparative |
| `Filings/…Form_Half_Year_Audit_Review(Aug-27-2024).pdf` | Interim filing (auditor review) | H1 FY2024 | Aug 26 2026 | Medium — prior-year comparative |
| `Filings/…Form_Other(Aug-27-2024).pdf` | Investor materials (chart-heavy deck, likely H1 FY24 results presentation) | ~1H24/CY21–1H24 | Aug 26 2026 | Low — presentation-tier |
| `Filings/…Form_Second_Quarter_Activities_Report(Jul-22-2026).pdf` | Quarterly Activities Report (ASX Listing Rule 5.5 — production/cash update, not full financials) | 2Q26 (quarter/period ended 30-Jun-2026) | Aug 26 2026 | **High** — most recent cash, net debt, liquidity, undrawn facility figures in the pool |
| `Filings/…Form_First_Quarter_Activities_Report(Apr-27-2026).pdf` | Quarterly Activities Report | 1Q26 (period ended 31-Mar-2026) | Aug 26 2026 | High — cash/liquidity update |
| `Filings/…Form_Fourth_Quarter_Activities_Report(Jan-26-2026).pdf` | Quarterly Activities Report | 4Q25 (period ended 31-Dec-2025) | Aug 26 2026 | High — cash/liquidity update, pre-audit |
| `Filings/…Form_Third_Quarter_Activities_Report(Oct-22-2025).pdf` | Quarterly Activities Report | 3Q25 (period ended 30-Sep-2025) | Aug 26 2026 | Medium — cash/liquidity update |
| `Filings/…Form_Second_Quarter_Activities_Report(Jul-23-2025).pdf` | Quarterly Activities Report | 2Q25 (period ended 30-Jun-2025) | Aug 26 2026 | Medium — prior-year comparative |
| `Filings/…Form_Third_Quarter_Activities_Report(Oct-23-2024).pdf` | Quarterly Activities Report | 3Q24 (period ended 30-Sep-2024) | Aug 26 2026 | Low — older comparative |
| `Filings/…Form_Fourth_Quarter_Activities_Report(Jan-29-2025).pdf` | Quarterly Activities Report | 4Q24 (period ended 31-Dec-2024) | Aug 26 2026 | Low — older comparative |
| `Karoon Energy Ltd ASX KAR Fixed Income Summary.xls` → tab `Summary` | Debt / capital-structure export (CIQ) | As of 31-Dec-2025 | Aug 26 2026 | **High** — issuer credit ratings, debt summary, credit ratios, single-bond issuance detail |
| `Karoon Energy Ltd ASX KAR Fixed Income Securities Summary.xls` → tab `Securities Summary` | Fixed-income / maturities export (CIQ) | Current (bond outstanding as of extraction) | Aug 26 2026 | High — bond-level detail (coupon, seniority, call schedule) |
| `Karoon Energy Ltd ASX KAR Fixed Income S P Global Ratings.xls` → tab `S P Global Ratings` | Credit rating export (CIQ/S&P) | Rating action 2024-04-23, reviewed 2026-04-28 | Aug 26 2026 | High — issuer credit rating detail |
| `Karoon Energy Ltd ASX KAR Financials.xls` + `(1)`…`(5).xls` (6 files, 13 tabs each) | Data export (CIQ core financials) — **6 duplicate copies of one workbook** | Annual, mixed old FYE (Jun-30) and new FYE (Dec-31): FY21–FY23(Jun), FY23–FY25(Dec) | Aug 26 2026 | **High** — Balance Sheet, Cash Flow, Capital Structure Summary/Details, Ratios, Pension/OPEB tabs; treated as one source for sufficiency (identical content) |
| `Karoon Energy Ltd ASX KAR Financials Balance Sheet.xls` → `Balance Sheet` | Data export (CIQ, single-tab subset) | Same period range | Aug 26 2026 | Redundant with Financials.xls |
| `Karoon Energy Ltd ASX KAR Financials Cash Flow.xls` → `Cash Flow` | Data export (CIQ, subset) | Same period range | Aug 26 2026 | Redundant |
| `Karoon Energy Ltd ASX KAR Financials Income Statement.xls` → `Income Statement` | Data export (CIQ, subset) | Same period range | Aug 26 2026 | Redundant (EBITDA base) |
| `Karoon Energy Ltd ASX KAR Financials Key Stats.xls` → `Key Stats` | Data export (CIQ, subset) | Same period range | Aug 26 2026 | Medium |
| `Karoon Energy Ltd ASX KAR Financials Pension OPEB.xls` → `Pension OPEB` | Data export (CIQ, subset) | FY21–FY25 | Aug 26 2026 | Low — pension immaterial (peak liability ~$0.5m) |
| `Karoon Energy Ltd ASX KAR Financials Ratios.xls` → `Ratios` | Data export (CIQ, subset) | Same period range | Aug 26 2026 | Redundant with Financials.xls |
| `Karoon Energy Ltd ASX KAR Financials Supplemental.xls` → `Supplemental` | Data export (CIQ, subset) | Same period range | Aug 26 2026 | Low |
| `Karoon Energy Ltd ASX KAR Financials Industry Specific.xls` → `Industry Specific` | Data export (CIQ, subset) | Same period range | Aug 26 2026 | Low — E&P operating stats |
| `Karoon Energy Ltd ASX KAR Credit Health Panel.xls` → tabs `Summary`, `Financials`, `Operational/Solvency/Liquidity Metrics Charts`, `Disclaimer` (6 tabs) | Credit rating / peer-benchmarking export (CIQ) | LTM ending 31-Dec-2025, updated 2026-02-27 | Aug 26 2026 | **High** — vendor solvency/liquidity/operational scores vs. 41 industry peers |
| `Company Comparable Analysis Karoon Energy Ltd.xls` → tabs `Financial Data`, `Trading Multiples`, `Operating Statistics`, `Business Description`, `Implied Valuation`, `Valuation Chart`, `Credit Health Panel`, `Disclaimer` (8 tabs) | Comparable-company / valuation export (CIQ) | Current | Aug 26 2026 | Low-Medium — valuation-tier, not solvency-tier except duplicate Credit Health Panel tab |
| `KaroonEnergyLtdASXKAREstimatesReport.xls` → 6 tabs (Consensus, Recent Changes, Guidance, Multiples, Surprise, Trends, Revisions) | Estimates / consensus export (CIQ) | Current, next print flagged "FQ2 2026" due 26-Aug-2026 | Aug 26 2026 | Medium — EBITDA/consensus base for stress test |
| `KaroonEnergyLtdASXKAREstimatesReport (1).xls` → `Guidance` | Estimates export, duplicate | Same as above | Aug 26 2026 | Redundant |
| `Transcript Digest/…2025 Earnings Call, Feb 26, 2026.pdf` (and 9 other transcripts, 2021–2025 vintage + 1 undated Shareholder/Analyst Call) | Earnings/analyst call transcripts | FY2021–FY2025 annual + H1 calls; most recent 2025 Earnings Call (Feb-26-2026) | Aug 26 2026 | Medium — management commentary on leverage, refi, buyback framework |
| `Karoon Energy Ltd (ASX_KAR) Corporate Structure Tree.xls` → 3 tabs | Corporate structure export (CIQ) | Current | Aug 26 2026 | Medium — subsidiary map (KEI (Brazil Santos) Pty Ltd, KEI Finance 1 Pty Ltd, Karoon USA Finance Inc, Karoon Petróleo & Gás Ltda) for HoldCo/OpCo mapping |
| `Karoon Energy Ltd ASX KAR Public Ownership Detailed.xls` / `…Insider Trading.xls` / `…Public Ownership Summary.rtf` | Ownership exports (CIQ) | Current | Aug 26 2026 | Low — governance-tier, not solvency |
| `Karoon Energy Ltd ASX KAR Auditors.xls`, `…Board Members.xls`, `…Committees.xls`, `…Compensation Summary Compensation.xls`, `…Corporate Timeline.xls`, `…Key Developments.xls`, `…Professionals.xls`, `…Takeover Defenses.xls` (3 tabs), `…Transaction Advisors.xls`, `…Analyst Coverage.xls`, `…Events Calendar.xls`, `…Competitors.xls`, `…Products.xls`, `…Strategic Alliances.xls`, `…Suppliers.xls`, `…Customers.xls`, `…Investment Analysis Co-Investors.xls`, `…Investment Analysis Direct Investments.xls`, `…Comparable M&A Transactions.xls`, `Transaction Summary M&A Private Placements.xls`, `Transaction Summary Public Offerings.xls`, `…Industry Classifications.rtf`, `…Long Business Description.rtf`, `…Private Ownership.rtf`, `…Public Company Profile.rtf` | Data exports (CIQ, governance/business/M&A tier) | Current / historical | Aug 26 2026 | Low — not solvency-relevant for this module |
| `AI Agents Type. The Wrap🌯 17 Nov 2024 _ Market Corrects.pdf`, `Munshot AI Podcasts — Aug 17–23, 2026.pdf`, `ChatGPT Image Aug 27, 2026….png`, `AI_Sales_Team_Textiles*.xlsx` (3 files, ~30 tabs total), `ai_team_characters.json`, `Sapna Kusumgar…mp3` | Unrelated documents (no KAR content) | N/A | Aug 26–27 2026 | None — not KAR-related; excluded from all solvency tables below |

## 1A. External Data

Not applicable. `data/KAR/external/` does not exist in this pool — no externally sourced research (alt-data panel, expert call, channel check, broker note) to inventory. Nothing here affects the sufficiency verdict.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | `Filings/…Form_Annual_Report(Feb-25-2026).pdf` | FY2025, year ended 31-Dec-2025 (released 26-Feb-2026) | ~6 |
| Quarterly filing (ASX Activities Report — production/cash, not full financials) | `Filings/…Form_Second_Quarter_Activities_Report(Jul-22-2026).pdf` | 2Q26, quarter ended 30-Jun-2026 | ~1 |
| Debt / capital-structure export | `Karoon Energy Ltd ASX KAR Fixed Income Summary.xls` / `Financials (1).xls` → Capital Structure Summary/Details | As of 31-Dec-2025 | ~8 |
| Fixed-income / maturities export | `Karoon Energy Ltd ASX KAR Fixed Income Securities Summary.xls` | Bond outstanding, next call 2026-09-03 | current |
| Cash flow statement | `Filings/…Form_Annual_Report(Feb-25-2026).pdf` (Note-level, audited); `Financials (1).xls` → Cash Flow tab | FY2025, year ended 31-Dec-2025 | ~8 |
| Covenant / credit-agreement disclosure | `Filings/…Form_Annual_Report(Feb-25-2026).pdf`, Note 17 Borrowings ("The Group has complied with all loan covenants throughout the reporting period") | FY2025 | ~8 |
| Credit rating report | `Karoon Energy Ltd ASX KAR Fixed Income S P Global Ratings.xls` (S&P: B, Stable, last reviewed 2026-04-28); FY2025 Annual Report also cites a Fitch B (Stable) rating | Reviewed 28-Apr-2026 | ~5 |

*Note on "quarterly filing": KAR does not file US-style quarterly financial statements. Per CLAUDE.md §27, ASX-listed E&P issuers report a full audited/reviewed income statement, balance sheet, and cash flow **half-yearly** (Appendix 4D + Half Year Audit Review), not quarterly. The Activities Reports filed each quarter (ASX Listing Rule 5.5) cover production, realised prices, and a summary cash/liquidity/net-debt table only — not a full balance sheet. The 2Q26 Activities Report is the freshest liquidity data point in the pool but is not a substitute for the half-yearly balance sheet; the most recent full interim balance sheet is the H1 FY2025 Half Year Audit Review (30-Jun-2025), and the most recent full annual balance sheet is FY2025 (31-Dec-2025).*

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | FY2025 Annual Report, Consolidated Statement of Financial Position, p.79 (audited, 31-Dec-2025); `Financials (1).xls` Balance Sheet tab (CIQ, same period) | Debt, cash, equity base |
| Debt note (amounts by type) | Y | FY2025 Annual Report, Note 17 Borrowings, p.106–107 — Long term bonds ($350.0m gross), syndicated RBL facility ($340m committed, undrawn), transaction costs, corporate credit rating | The debt stack and seniority |
| Maturity schedule | Y | FY2025 Annual Report, "(d) Liquidity Risk" p.116 — full contractual-maturity table by <6mo / 6-12mo / 1-3yr / 3-5yr / >5yr bucket for borrowings, leases, payables, contingent consideration; `Karoon Energy Ltd ASX KAR Fixed Income Securities Summary.xls` (bond maturity 2029-05-14, next call 2026-09-03) | The maturity wall and refinancing exposure |
| Cash flow statement | Y | FY2025 Annual Report, Consolidated Statement of Cash Flows, p.81 (audited); `Financials (1).xls` Cash Flow tab (CIQ, FY21–FY25) | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y | FY2025 Annual Report Note 17 — $340m syndicated RBL, undrawn at 31-Dec-2025, availability subject to semi-annual redetermination and a facility-reduction schedule from 31-Mar-2026 (borrowing-base mechanic disclosed, not merely a headline commitment) | True liquidity beyond cash |
| Interest expense detail | Y | Fixed Income Summary tab — EBIT/Interest 4.8x, EBITDA/Interest 9.3x, (EBITDA-Capex)/Interest 2.2x (as of Dec-31-2025); coupon detail (10.5% fixed on the Notes, SOFR + margin on the RBL) in Note 17 and Securities Summary | Coverage ratios |
| Covenant disclosure | Partial | FY2025 Annual Report Note 17: "The Group has complied with all loan covenants throughout the reporting period" — compliance is stated, but the actual covenant THRESHOLDS (max leverage ratio, min interest cover, etc.) and covenant-EBITDA definition/addbacks are **not disclosed anywhere in this pool**; no credit agreement / indenture document is in the pool ("There are no Indentures or Credit Agreements available for this company" — Fixed Income Summary tab) | Headroom to a breach |
| Lease detail (operating/finance) | Y | FY2025 Annual Report Note 14 Leases; Balance Sheet shows Curr. Port. of Leases ($0.7m) and Long-Term Leases ($0.4m) at FY2025 vs $51.8m/$125.9m at FY2024 (Baúna FPSO lease bought out during 2025, "Gain on disposal of FPSO right-of-use asset" $35.3m) | Debt-like obligations |
| Pension / OPEB funded status | Y | `Financials (1).xls` Pension OPEB tab — net liability immaterial, peaking at $0.5m (Jun-2021), $0.1m at Dec-2025 | Off-balance-sheet obligation |
| Commitments & contingencies note | Y | FY2025 Annual Report Note 16 Contingent Liabilities and Contingent Assets, p.105 — Petrobras contingent consideration (up to $285m total, $34.2m fair value on balance sheet at 31-Dec-2025), $5.0m Pacific E&P deferred consideration, Brazilian local-content compliance risk, tax audit exposure; Note 15 restoration provision $278.4m + BRL 843.8m (~$153.4m) surety bond + BRL 117.7m (~$21.4m) parent guarantee to Brazil's ANP for Baúna decommissioning; capital commitments $0.7m | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Y | S&P: B, Stable outlook, new rating 2024-04-23, last reviewed 2026-04-28 (`Fixed Income S&P Global Ratings.xls`); FY2025 Annual Report also states a Fitch B (Stable) rating — sub-investment-grade on both | Refinancing access and cost |
| EBITDA base (for stress test) | Y | FY2025 Annual Report Financial Summary p.48 (company "EBITDA" $380.7m, "EBITDAX" $403.2m, "Underlying EBITDAX" $388.8m — three related non-IFRS measures, reconciled in `earnings/01_historical-financials.md` §4); CIQ-standardized EBITDA $364.7m FY2025 (`Financials (1).xls`) — bases differ materially and must be reconciled downstream (see §5 flag) | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | Operating company — upstream oil & gas E&P. Not a bank/insurer/REIT. Confirmed HoldCo/OpCo structure: parent Karoon Energy Ltd (ASX-listed) guarantees debt issued by wholly-owned subsidiaries Karoon USA Finance Inc. (Notes issuer) and KEI (Brazil Santos) Pty Ltd / KEI Finance 1 Pty Ltd / Karoon Petróleo & Gás Ltda (RBL facility parties, secured against Baúna/Patola and Who Dat assets, guaranteed by Group members comprising ≥90% of EBITDAX and ≥90% of total assets) | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | Y | FY2025 Annual Report Note 17 — $340m syndicated RBL ("amortising reserves based loan"), secured against Baúna/Patola and Who Dat, term SOFR + margin, matures 30-Sep-2028, subject to semi-annual borrowing-base redetermination and a facility-reduction schedule from 31-Mar-2026; undrawn at 31-Dec-2025 and (per the 2Q26 Activities Report) the $350.0m "drawn debt" cited there is the Notes, not the RBL — RBL still undrawn as of 30-Jun-2026 | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | N | Not disclosed anywhere in the pool — no indenture or credit agreement document exists in the pool for either the Notes or the RBL ("There are no Indentures or Credit Agreements available for this company" — Fixed Income Summary tab); only the fact of compliance is stated, not the covenant-EBITDA construction | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | Y | Corporate Structure Tree export + FY2025 Annual Report Note 17 (guarantor scope ≥90% EBITDAX/≥90% total assets) + Note 15(b) "Contingent Liabilities of Parent Company" (parent guarantee to ANP) | Structural subordination and upstreaming |
| Hedging / swaps disclosure | Y | FY2025 Annual Report Note 17/18 — Brent oil-price collar hedges (bought puts/sold calls) tied to RBL drawn amounts; "At 31 December 2025, as the syndicated loan facility was currently undrawn, the Group had no outstanding hedges"; last collar expired out-of-the-money end-2025, not replaced (unhedged into FY2026) | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | Partial | Not explicitly itemized in the pool beyond the general covenant-compliance statement and the RBL's redetermination/reduction-schedule mechanic; no dedicated change-of-control or cross-default clause text is disclosed (consistent with no credit agreement being in the pool) | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

All six cross-module files exist and were read for this triage. `business-model/10_external-dependency.md` flags Karoon as **high commodity-cyclicality** (~93% oil/liquids-weighted production, "near pure oil exposure," currently unhedged) — downstream agents in this module must show leverage on both latest-year and mid-cycle/normalised EBITDA per MODULE_RULES.md §4. `business-model/11_capital-allocation-governance.md` independently confirms the debt stack (Note 17 reconciliation), the off-balance-sheet decommissioning instruments (Note 15/16), and a debt- and equity-funded acquisition pattern (Baúna 2019, Who Dat 2023, FPSO buyout 2025). `earnings/01_historical-financials.md` provides a reconciled five-year EBITDA/Net-Debt series (CIQ basis) plus a filing-verified net-debt reconciliation (Borrowings + Lease liabilities − Cash, strict basis) that this module's `01_capital-structure-and-leverage` agent should use as its starting cross-check.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | Australia | ABN 53 107 001 338 on Appendix 4D/4E cover pages; "ASX Listing Rules" cited throughout [FY2025 Annual Report, cover letter] |
| Exchange | ASX (Australian Securities Exchange), ticker KAR | Filenames and headers throughout the pool ("ASX: KAR") |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | **Other — ASX Listing Rules / Australian Corporations Act.** Local-equivalent forms used in this pool: Appendix 4D (half-year report), Appendix 4E (preliminary final report / results-to-market), Half Year Audit Review (auditor's review report), quarterly Activities Reports (production/cash, not full financials, per ASX Listing Rule 5.5) | `Filings/…Form_Half_Yearly_Report(Aug-26-2025).pdf`, `Filings/…Form_Preliminary_Final_Report(Feb-25-2026).pdf`, `Filings/…Form_Second_Quarter_Activities_Report(Jul-22-2026).pdf` |
| Reporting standard (US GAAP / IFRS / Ind AS) | IFRS as adopted by the Australian Accounting Standards Board (AASB) — e.g. Note 15 explicitly cites AASB 137 (Provisions, Contingent Liabilities and Contingent Assets) and AASB 119 (Employee Benefits) | FY2025 Annual Report, Note 15; CIQ Estimates Consensus tab header states "Acctg. Standard: IFRS" |
| Reporting currency (USD / INR / …) | US dollars (US$) — the company reports its financial statements in USD despite an ASX/AUD listing | "US$M" columns throughout Notes 14–19 and the Appendix 4D/4E statements [FY2025 Annual Report]. Note: dividend amounts are quoted in AUD cents (e.g. "2025 interim dividend 2.4 AUD cents" — Half Yearly Report), and the CIQ Estimates/market-summary tabs and traded share price are in AUD — a mixed-currency pool; any cross-currency figure downstream must carry its FX date/rate per CLAUDE.md §15 |
| Document language(s) | English (all documents in the pool are English-language originals; no translation required) | — |

Downstream agents in this module should read the Annual Report (Notes 14–19) as the annual-filing tier, the Half Year Audit Review / Half Yearly Report as the interim-filing tier, and the quarterly Activities Reports as a liquidity/net-debt update tier (not a full balance sheet) per CLAUDE.md §27 — do not expect or require a US 10-K/10-Q/8-K or an Indian Ind AS filing. State the reporting currency (USD) on every figure, and flag AUD-denominated items (dividends, share price, market-cap-based ratios) explicitly when they appear.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N | 02, 06 | Not applicable — full contractual-maturity table is disclosed (FY2025 Annual Report, Liquidity Risk note, p.116) |
| No covenant disclosure | **Y (partial)** | 04, 06 | Compliance is stated but covenant thresholds and covenant-EBITDA definition/addback detail are not disclosed (no indenture/credit agreement in the pool) — headroom is **not precisely computable**; use typical market covenants as a LABELED assumption per MODULE_RULES.md; covenant headroom max 60; Overall usefulness max 75 |
| No cash flow statement | N | 03, 04, 06 | Not applicable — audited cash flow statement present for FY2025 and H1 FY2025, plus CIQ five-year series |
| No undrawn-facility disclosure | N | 03 | Not applicable — $340m undrawn RBL disclosed with terms, security, and redetermination mechanic |
| No interest-expense detail | N | 04 | Not applicable — EBIT/Interest, EBITDA/Interest, (EBITDA-Capex)/Interest ratios and coupon detail all disclosed |
| No EBITDA base | N | 06 | Not applicable — company discloses EBITDA, EBITDAX, and Underlying EBITDAX; CIQ provides a standardized alternative; reconciliation required (three non-IFRS bases differ materially — see §3 note) but a usable base exists |

*Two additional partial-data conditions from MODULE_RULES.md's fuller taxonomy also apply, not among the six rows above:* **no revolver availability/borrowing-base detail** does NOT apply (the RBL's borrowing-base redetermination mechanic and security package ARE disclosed, and it is confirmed undrawn as of both 31-Dec-2025 and 30-Jun-2026) — liquidity CAN include the RBL's headline $340m commitment as committed, undrawn capacity, though its true availability under the reserves-based redetermination formula is not independently computable from this pool and should be flagged by `03_liquidity-runway`. **No HoldCo/OpCo disclosure for known HoldCo debt** does NOT apply — the guarantor/security structure is disclosed (≥90% EBITDAX / ≥90% total assets guarantee scope).

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent, audited balance sheet (FY2025, 31-Dec-2025) is available together with a detailed debt note (Note 17 — bond and RBL terms, seniority, security), a full contractual maturity schedule (Liquidity Risk note), and an audited cash flow statement, so leverage, liquidity, the maturity wall, coverage, and a downside stress test can all be built; the only material gap is the precise covenant-threshold/covenant-EBITDA definition, which caps covenant-headroom precision but does not block the module.
- **Sections that can run:** capital structure, maturity wall, liquidity, coverage/covenants (with the stated covenant-definition cap), contingencies, stress test.
- **Active partial-data caps:** Covenant headroom max 60 (score cap, MODULE_RULES.md) — covenant thresholds and covenant-EBITDA addback definition are not disclosed in this pool, only the fact of compliance ("The Group has complied with all loan covenants throughout the reporting period," FY2025 Annual Report Note 17); Overall usefulness max 75 for the same reason.
- **Critical missing items:** The actual financial-covenant thresholds (e.g. max leverage, min interest cover, min liquidity) for both the $350m Notes and the $340m syndicated RBL, and the covenant-EBITDA definition/addback caps — no indenture or credit agreement document is present in the pool ("There are no Indentures or Credit Agreements available for this company" — Fixed Income Summary tab).
- **Single highest-value missing document:** The Notes indenture / RBL credit agreement (or a summary term sheet disclosing the actual financial-covenant thresholds and covenant-EBITDA construction) — this is the one document that would convert the current "compliant, per management" statement into a computable, direction-aware headroom figure.



---

## balance-sheet-survival / 01_capital-structure-and-leverage.md

_Source: `01_capital-structure-and-leverage.md`_

# Capital Structure & Leverage — KAR

Karoon Energy Ltd (ASX: KAR), Australian-incorporated upstream oil & gas producer (Baúna/Patola, Santos Basin, Brazil — operated; Who Dat/Dome Patrol/Abilene, Gulf of America — non-operated), reports under IFRS as adopted by the AASB, in **US dollars** despite its ASX/AUD listing [FY2025 Annual Report, cover / accounting policies]. Reporting currency for every figure below is **USD** unless stated otherwise. Fiscal year: the company changed its year-end from 30 June to 31 December (a 6-month transition period, "TY23," sits between the last old-convention year and FY2024); the latest audited balance sheet is **FY2025, year ended 31-Dec-2025**, filed 26-Feb-2026 [FY2025 Annual Report]. No `ciq_facts.json` or `relationships.json` sidecar exists for this run (confirmed absent in `00_solvency-data-triage.md`); every figure below is this agent's own sourced read, cross-checked between the Capital IQ workbook exports and the primary Annual Report.

Corporate credit rating: **S&P B (Stable), Fitch B (Stable)** — sub-investment-grade [Karoon Energy Ltd ASX KAR Fixed Income Summary.xls, "Summary" tab; FY2025 Annual Report, Note 17]. Business-model cross-checks (`business-model/10_external-dependency.md`) flag Karoon as **high commodity-cyclicality** — ~93% of production is oil/liquids-weighted, FY2025 revenue and EBITDAX moved almost entirely with the realised oil price, and the company runs fully unhedged as of the latest filing — so leverage is shown below on both the latest-year and a mid-cycle/normalised EBITDA basis per MODULE_RULES.md §4.

## 1. Debt Stack

FY2025 (31-Dec-2025), reporting currency **USD**, in US$ millions.

| Instrument | Amount | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Short-term debt / current portion | $0.0m (no short-term borrowings); current portion of leases $0.7m | Group (operating subsidiaries) | Yes (lease) | Senior | Leased asset | N/A | N/A | FY2025 Annual Report, Consolidated Statement of Financial Position, p.79 |
| Bonds / notes — Second Priority Senior Secured Notes | $350.0m principal ($337.7m carrying value, net of $12.3m unamortized transaction costs) | **Karoon USA Finance Inc.** (US financing subsidiary), guaranteed by Karoon Energy Ltd (ASX parent) and certain subsidiaries | Yes — Second Priority Senior Secured | Senior | Various Group assets, incl. Baúna/Patola and Who Dat | May 2029 (2029-05-01 per CIQ Capital Structure export; 2029-05-14 per CIQ Fixed Income Securities export — filing states "May 2029" without a specific day; small day-level discrepancy between the two vendor exports, flagged) | Fixed, 10.50% coupon, semi-annual | FY2025 Annual Report, Note 17 Borrowings, p.106-107; Karoon Energy Ltd ASX KAR Fixed Income Summary.xls |
| Term loans | None outstanding | — | — | — | — | — | — | FY2025 Annual Report, Note 17 |
| Revolver — Secured Syndicated Reserves-Based Lending (RBL) Facility | $0 drawn; $340.0m committed, fully undrawn at 31-Dec-2025 | **KEI (Brazil Santos) Pty Ltd, KEI Finance 1 Pty Ltd, Karoon Petróleo & Gás Ltda** (operating subsidiaries), guaranteed by Group members comprising ≥90% of EBITDAX and ≥90% of total assets | Yes — secured | Senior | Baúna/Patola and Who Dat assets | 30-Sep-2028; amortising facility — subject to semi-annual borrowing-base redetermination and a facility-reduction schedule commencing 31-Mar-2026 | Floating, term SOFR + margin (margin not disclosed in the extracted filing pages) | FY2025 Annual Report, Note 17, p.106; Karoon Energy Ltd ASX KAR Financials.xls, Capital Structure Details tab |
| Finance / capital leases | $1.1m total ($0.7m current + $0.4m non-current) | Group (operating entities) | Yes | Senior | Leased asset(s) | Various (short remaining terms) | N/A | FY2025 Annual Report, Note 14 Leases; Consolidated Statement of Financial Position, p.79 |
| **Total gross debt** | **$338.8m carrying value ($351.1m principal/face value)** | — | — | — | — | — | — | FY2025 Annual Report, Notes 14 & 17 (reconciled); Karoon Energy Ltd ASX KAR Financials.xls, Capital Structure Summary tab |

**Note on the FPSO lease and IFRS 16:** the $1.1m lease-liability total is a sharp fall from $177.7m at FY2024 — almost the entire prior lease balance was the Baúna FPSO (floating production, storage and offloading vessel) charter, which Karoon bought out during 2025 (a $35.3m "Gain on disposal of FPSO right-of-use asset" was recognised) [FY2025 Annual Report, p.78, Note 3(b)]. This is an IFRS 16-capitalised lease already sitting on the balance sheet as debt, not an off-balance-sheet operating lease — see §2.

**Note on the vendor "Total Debt" figure:** the Capital IQ "Total Debt Outstanding" line ($338.8m) is confirmed by direct reconciliation to equal Note 17 Borrowings (carrying value, $337.7m) plus Note 14 Lease liabilities ($1.1m) — both audited balance-sheet line items — so it is the more complete, filing-tied figure. The company's own "Net debt" glossary metric (used in its Financial Overview / Three Year Summary tables) instead uses the **$350.0m face/principal value** of the Notes (excluding unamortized transaction costs) and **excludes lease liabilities entirely** ("Net debt: Total borrowings (excluding transaction costs) less cash and cash equivalents" [FY2025 Annual Report, Glossary, p.140]). At FY2025 the gap between the two constructions is small ($338.8m vs $350.0m gross, an ~$11.2m difference) because the FPSO lease had already shrunk to $1.1m. **At FY2024 the same gap was much larger**: the company's own metric showed gross debt of $350.0m (Notes only) and net debt of just $8.8m at 31-Dec-2024, while the audited balance sheet actually carried $511.2m of total debt (Notes $333.5m + FPSO lease $177.7m) and $170.0m of net debt — a **$161.2m (≈1,833%) gap** between the company's own narrow metric and the fully reconciled balance-sheet figure at that date [FY2025 Annual Report, "THREE YEAR SUMMARY" p.141; Karoon Energy Ltd ASX KAR Financials.xls, Balance Sheet & Capital Structure Summary tabs]. This is flagged because a reader relying on the company's own headline "net debt" figure alone would have materially understated total debt-like obligations as recently as twelve months before this report's balance-sheet date.

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Restoration/decommissioning provision (Baúna, US GoM) | $278.4m non-current, on balance sheet (up from $214.2m FY2024, +$64.2m: $53.7m re-measurement + $10.5m discount unwinding) | Recognised liability under AASB 137 — not a financial-debt instrument, but a large, growing obligation; backed by a **BRL 843.8m (US$153.4m equivalent) surety bond** provided to Brazil's ANP regulator (June 2025) and a **BRL 117.7m (US$21.4m equivalent) parent-company guarantee** — both off-balance-sheet security instruments collateralising the already-recognised provision, not incremental liabilities | FY2025 Annual Report, Note 15 Provisions, p.104-105 |
| Deferred acquisition consideration — Petrobras (Baúna earn-out) | $34.2m fair value recognised on balance sheet ($27.4m current + $6.8m non-current), against an undiscounted maximum of **up to $285m** | Embedded derivative / other financial liability, oil-price-linked; not classified as "debt" by the company but is a real deferred cash obligation contingent on oil prices | FY2025 Annual Report, Note 16(a)(i), Note 18, p.105/108 |
| Deferred acquisition consideration — Pacific Exploration & Production Corp. | Up to $5.0m, **not recognised** on balance sheet (contingent on first production ≥1 MMboe from specified blocks) | Contingent liability, not provided for | FY2025 Annual Report, Note 16(a)(i), p.105 |
| Pension / OPEB underfunding | $0.1m net liability at FY2025 (immaterial; peaked at $0.5m in FY2021) | No formal defined-benefit pension plan; this is a small long-service-leave-type liability, not a funded pension scheme | Karoon Energy Ltd ASX KAR Financials Pension OPEB.xls |
| Preferred equity | None | Not applicable — no preferred shares on issue | FY2025 Annual Report, Consolidated Statement of Financial Position, p.79 |
| Operating leases (IFRS 16 vs US GAAP note) | No material operating leases outside the recognised $1.1m finance-lease balance | Karoon reports under **IFRS (AASB), which capitalises all material leases** (IFRS 16) — there is no separate off-balance-sheet "operating lease" bucket to disclose; what would be an operating lease under US GAAP is already on-balance-sheet here as the $1.1m lease-liability line in §1 | FY2025 Annual Report, Note 14 Leases |

## 3. Cash & Liquid Assets

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | $206.1m (FY2025); of which $164.4m floating-rate, $41.7m fixed-rate | No restricted or trapped cash disclosed anywhere in the FY2025 Annual Report notes read for this report; "security deposits" are a separate line item from cash & equivalents, held with rated banks as part of normal credit-risk management, not flagged as restricted | FY2025 Annual Report, Consolidated Statement of Financial Position p.79; Note 20 Financial Risk Management, p.113 |
| Liquid short-term investments | None disclosed separately — "Total Cash & ST Investments" equals cash & equivalents in the Capital IQ export (no separate investment balance) | N/A | Karoon Energy Ltd ASX KAR Financials.xls, Balance Sheet tab |
| Restricted / trapped cash (flag) | None disclosed | N/A — flag is negative (no restriction found) | FY2025 Annual Report — no "restricted cash" line item found in a full-text read of the Notes |

## 4. Gross & Net Debt

FY2025 (31-Dec-2025), US$ millions. Basis: **strict** (cash & equivalents only; no short-term investments to net in — see §3, none disclosed). This is the canonical basis for the module.

| Metric | Value | Source |
|---|---:|---|
| Gross debt | $338.8m (carrying value, incl. leases: Notes $337.7m + leases $1.1m) | FY2025 Annual Report, Notes 14 & 17 (reconciled) |
| − Cash & equivalents | $206.1m | FY2025 Annual Report, p.79 |
| **Net debt (strict, §15)** — canonical | **$132.7m** | Derived: $338.8m − $206.1m; ties to CIQ Balance Sheet "Net Debt" FY2025 |
| Company's own labelled net-debt metric (for cross-reference, same strict cash basis, but debt side = $350.0m face value of Notes only, leases excluded) | $143.9m | FY2025 Annual Report, "THREE YEAR SUMMARY" p.141: "$350.0m total debt (ex lease liabilities and transaction costs) − $206.1m cash" |
| − Liquid short-term investments | None disclosed | — |
| **Net debt (broad, incl. investments)** | Not applicable — no liquid short-term investments disclosed beyond cash & equivalents | — |

**Basis note:** both figures above are strict (cash-only); they differ only in how "total debt" is constructed — the canonical $132.7m ties every dollar to the audited balance sheet's own Notes 14 (Leases, $1.1m) and 17 (Borrowings, $337.7m carrying value, i.e. net of unamortized issuance costs), while the company's own $143.9m glossary metric uses the Notes' undiscounted $350.0m face value and drops the (now-small) lease liability. The $132.7m figure is designated canonical for this module because it reconciles exactly to the primary financial statements' own recognised balance-sheet liabilities; §1 shows why this distinction mattered far more at FY2024 (a $161.2m gap) than it does today.

## 5. Leverage Ratios

FY2025 (31-Dec-2025). EBITDA bases, all company-disclosed non-IFRS measures unless noted: **reported "EBITDA"** $380.7m (statutory, non-IFRS, includes one-off items — see caveat below); **"Underlying EBITDAX"** $388.8m (company's own further-adjusted measure — adds back exploration & evaluation expense, strips select non-recurring items, but is *not* simply "EBITDA minus one-offs"; net effect vs reported EBITDA is a modest +$8.1m) [FY2025 Annual Report, Financial Summary p.48]. A third, independently-constructed **CIQ-standardized EBITDA** of $364.7m also exists and is used only for the mid-cycle/peer-consistent multi-year series below (§6) [Karoon Energy Ltd ASX KAR Financials.xls; reconciled in `earnings/01_historical-financials.md` §1].

| Ratio | On Reported EBITDA ($380.7m) | On Adjusted EBITDA ("Underlying EBITDAX," $388.8m) | Source |
|---|---:|---:|---|
| Gross debt / EBITDA | 0.89x | 0.87x | Derived: $338.8m gross debt ÷ each EBITDA base |
| Net debt / EBITDA | 0.35x | 0.34x | Derived: $132.7m canonical net debt ÷ each EBITDA base |
| Debt / capital | 24.7% | (n/a) | Karoon Energy Ltd ASX KAR Fixed Income Summary.xls, "Credit Ratios" — Total Debt/Capital 24.7% (matches CIQ Capital Structure Summary: $338.8m ÷ ($338.8m + $1,032.5m total common equity) = $1,371.3m total capital) |
| Debt / equity | 32.8% | (n/a) | Karoon Energy Ltd ASX KAR Fixed Income Summary.xls, "Credit Ratios" — Total Debt/Equity 32.8% ($338.8m ÷ $1,032.5m) |

**One-off caveat this table must carry (CLAUDE.md §3 — the disagreeing number must be named):** `earnings/01_historical-financials.md` flags that FY2025 reported EBITDA of $380.7m includes a **$35.3m gain on disposal of the Baúna FPSO right-of-use asset** and a **$21.2m positive change in fair value of the Petrobras contingent consideration** — both one-off, non-operating items. Stripped ($380.7m − $35.3m − $21.2m = **$324.2m**), net debt/EBITDA on this cleaner basis would be $132.7m ÷ $324.2m = **0.41x** rather than 0.35x. Even on this stricter basis, leverage stays well under 0.5x — the qualifier changes the precision of the number, not the conclusion that gross and net leverage are low.

**Cycle position:** per `business-model/10_external-dependency.md` (external dependency score 75/100, "Mostly externally driven" — high commodity dependency, currently unhedged), Karoon is a cyclical name and a single-year figure understates fragility if that year happens to sit near a cycle peak.

| Ratio (net debt/EBITDA) | Basis | Value | Label |
|---|---|---:|---|
| Net debt / EBITDA, latest year | $132.7m ÷ $364.7m (CIQ-standardized FY2025 EBITDA) | 0.36x | Latest |
| Net debt / EBITDA, peak-year EBITDA | $132.7m ÷ $498.3m (CIQ-standardized FY2024 EBITDA — the highest of the five disclosed years) | 0.27x | **Peak — a floor, not the central estimate** |
| Net debt / EBITDA, mid-cycle/normalised | $132.7m ÷ $398.3m (3-year average of CIQ-standardized EBITDA, FY2023(Jun) $332.0m + FY2024(Dec) $498.3m + FY2025(Dec) $364.7m, ÷3) | 0.33x | **Mid-cycle / normalised** |

The FY2021-FY2022 (Jun) years are excluded from the mid-cycle average because they reflect Karoon's pre-Who Dat production ramp (revenue +125.5% FY22, +47.1% FY23) rather than a steady-state operating base — including them would blend a volume-ramp low with a price cycle rather than isolate cycle amplitude. Inference, not from filings: this 3-year average is this agent's own construction for a normalised leverage cross-check, not a company-disclosed figure. Across every basis tested — latest, peak, mid-cycle, and the one-off-stripped $324.2m EBITDA — net debt/EBITDA stays inside a narrow 0.27x-0.41x band, i.e. leverage is low under all of them, not just the most flattering one.

## 6. Leverage Trend

US$ millions. Net debt basis: **strict** (cash & equivalents only), CIQ/balance-sheet-reconciled total-debt construction (Notes 14+17), consistent with the canonical basis in §4. EBITDA basis: CIQ-standardized (for a consistent five-year series; see `earnings/01_historical-financials.md` §1 for the full reconciliation and the FY2021-2023 fiscal-year-end note).

| Metric | FY2022 (Jun) | FY2023 (Jun) | FY2024 (Dec) | FY2025 (Dec) — Latest audited | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, CIQ-reconciled basis) | $158.3m | $200.9m | $170.0m | $132.7m | Falling |
| Net debt / EBITDA | 0.77x | 0.61x | 0.34x | 0.36x | Falling, then flat |

Sources: `earnings/01_historical-financials.md` §1 (Karoon Energy Ltd ASX KAR Financials.xls, Balance Sheet / Capital Structure Summary tabs, cross-checked to the FY2025 Annual Report for the two most recent years).

Net leverage has fallen sharply since FY2022 (0.77x) to a low, stable band (0.34x-0.36x) over FY2024-FY2025, driven mainly by EBITDA growth from the Baúna/Who Dat production base outrunning debt growth — total borrowings have been essentially flat at $333.5m-$350.0m (face value) since the May-2024 issuance of the $350m Notes, which refinanced an earlier RBL draw used to fund the Who Dat acquisition [FY2025 Annual Report, Note 17]. The FY2023→FY2024 net-debt fall ($200.9m→$170.0m) and the FY2024→FY2025 fall ($170.0m→$132.7m) were funded from operating cash flow and the FPSO right-of-use buyout was paid largely from cash on hand rather than new debt [`earnings/01_historical-financials.md` §6; `business-model/11_capital-allocation-governance.md` §1]. **Subsequent to FY2025 year-end, net debt has risen materially and should be watched:** the 2Q26 Activities Report (unaudited, quarterly production/cash update, not a full balance sheet) shows net debt of $269.7m at 30-Jun-2026 (cash $80.3m, drawn debt flat at $350.0m) versus $143.9m at 31-Dec-2025 on the company's own comparable metric — a rise driven by capital expenditure (the Baúna flotel revitalisation, the SPS-92 well intervention, and the Who Dat A1 sidetrack, together $214.6m across 1Q26-2Q26) and share buybacks ($4.0m in 2Q26 alone), not by new borrowing [2Q26 Activities Report (Jul-22-2026), p.4]. This is flagged as the most current data point available but is **not** incorporated into the FY2025 canonical figures above, consistent with using the latest audited/reviewed balance sheet as the anchor.

## 6A. HoldCo / OpCo & Structural Subordination (if applicable)

| Item | Evidence | Why It Matters |
|---|---|---|
| Where debt sits (HoldCo vs OpCo) | The $350.0m Notes are issued by **Karoon USA Finance Inc.**, a wholly-owned US financing subsidiary, but are **guaranteed by the ASX-listed parent Karoon Energy Ltd and certain subsidiaries**. The $340.0m RBL facility is held at operating subsidiaries **KEI (Brazil Santos) Pty Ltd, KEI Finance 1 Pty Ltd and Karoon Petróleo & Gás Ltda**, secured against the Baúna/Patola and Who Dat operating assets and guaranteed by Group members comprising **≥90% of EBITDAX and ≥90% of total assets** | Because guarantee/security scope covers ≥90% of the Group's own EBITDAX and assets, and both instruments sit within (or are guaranteed by) entities holding the actual producing assets, there is **no material structural subordination** — the debt is effectively Group-wide obligated, not trapped below a thinly-guaranteed holding layer |
| Upstreaming constraints (dividend blockers, regulatory) | Not disclosed in the pool as a distinct restriction; the Group paid dividends and ran a buyback programme throughout FY2025 without disclosed upstreaming impediments | No evidence of a dividend blocker at either the Notes-issuer or RBL-borrower level |
| Material restricted / trapped cash | None disclosed (§3) | Net debt is not overstated or understated by a restricted-cash gap |

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

The following are the canonical figures every other solvency agent in this module should use verbatim, all as of **31-Dec-2025**, reporting currency **USD**:

- **Gross debt: $338.8m** (carrying value, incl. leases: $337.7m Notes + $1.1m leases; principal/face value $351.1m). All of it is Senior and Secured; $350.0m fixed at 10.50%; the $340.0m RBL is undrawn and would be floating (SOFR + margin) if drawn.
- **Net debt: $132.7m — strict basis (§15), CANONICAL.** Reason for choosing this over the company's own $143.9m glossary metric: it reconciles exactly to the audited balance sheet's own Notes 14 (Leases) and 17 (Borrowings), whereas the company's own figure excludes the lease liability and uses face rather than carrying value — a construction that produced a $161.2m gap from the fully reconciled figure as recently as FY2024 (§1). No broad (investment-inclusive) basis applies — no material liquid short-term investments are disclosed beyond cash & equivalents.
- **Cash & liquid investments: $206.1m** cash & equivalents; no separate liquid short-term investments disclosed; no restricted/trapped cash identified.
- **EBITDA base:** reported (company non-IFRS) EBITDA **$380.7m** — includes ~$56.5m of one-off gains (FPSO disposal gain $35.3m + Petrobras contingent-consideration fair-value gain $21.2m); a cleaner, one-off-stripped figure is **$324.2m** (labelled adjustment, see §5). Adjusted ("Underlying EBITDAX") is **$388.8m**. Cycle position: FY2025 is **not** the cycle peak — peak (of the five disclosed years) was FY2024 (Dec) at $498.3m CIQ-standardized / $450.3m company-reported; a mid-cycle/normalised 3-year average (CIQ basis) is **$398.3m**.
- **Net debt / EBITDA:** 0.35x on reported EBITDA ($380.7m); 0.34x on adjusted EBITDA ($388.8m); 0.41x on the one-off-stripped $324.2m EBITDA; 0.33x on mid-cycle/normalised EBITDA ($398.3m); 0.27x on peak-year EBITDA ($498.3m, floor, not central estimate). Across every basis, leverage sits in a narrow 0.27x-0.41x band.
- **Reporting currency: USD** (the company's stated functional and presentation currency, despite its AUD-denominated ASX listing and AUD-denominated dividends — dividend and share-price figures elsewhere in the data pool are in AUD and must carry that label if cited downstream).

Karoon is **net cash on a purely operating-cash-vs-drawn-debt view were the RBL undrawn amount included, but net debt-positive on the strict cash-only basis used here** — it carries $132.7m of net debt against $1,032.5m of equity and $338.8m of gross debt, i.e. low but not zero leverage; this is not a net-cash balance sheet. The $340.0m committed, undrawn RBL facility (secured, ≥90%-of-Group-guaranteed) is a real source of contingent liquidity beyond the cash balance, though its true point-in-time availability is subject to a semi-annual reserves-based redetermination and a facility-reduction schedule that had already reduced the commitment to $283.3m by 31-Mar-2026 per the most recent quarterly update (§6) — this reduction mechanic belongs to `02_maturity-wall-and-refinancing` and `03_liquidity-runway` to size in full. Sub-investment-grade rating (S&P B / Fitch B, both Stable) and a 10.50% coupon on the Notes reflect a levered-for-its-rating-band capital structure even though the leverage ratios themselves are low — that gap between rating and ratio-based leverage should be reconciled by `04_coverage-and-covenants`.

If any number above is estimated or based on adjusted/non-IFRS EBITDA, that caveat is stated inline; the one-off-stripped $324.2m EBITDA figure and the 3-year mid-cycle average are this agent's own constructions (labelled "Inference, not from filings" in §5) and should be carried with that label by any downstream agent that reuses them.



---

## balance-sheet-survival / 02_maturity-wall-and-refinancing.md

_Source: `02_maturity-wall-and-refinancing.md`_

# Maturity Wall & Refinancing — KAR

Karoon Energy Ltd (ASX: KAR) reports under IFRS (AASB) in **US dollars** (reporting currency for every figure below), fiscal year ended 31-Dec-2025 for the audited anchor date. This agent reuses the canonical debt stack from `01_capital-structure-and-leverage.md`: gross debt (carrying value) **$338.8m** = Senior Secured Notes $337.7m (net of unamortized issuance costs; $350.0m face value) + finance leases $1.1m. No `ciq_facts.json` sidecar exists for this run; the maturity and rate-exposure figures below are read directly from the FY2025 Annual Report's Liquidity Risk and Financial Risk Management notes, cross-checked against the Capital IQ Fixed Income Securities Summary export and the most recent quarterly Activities Reports.

## 1. Maturity Schedule

Anchor date: **31-Dec-2025** (FY2025 audited balance sheet, consistent with `01`'s canonical figures). Amounts are carrying value, US$ millions. Karoon's debt is effectively **two instruments**: a single bullet Note maturing 14-May-2029, and an immaterial finance-lease tail; there is no laddered amortization schedule to speak of.

| Period (from 31-Dec-2025) | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (to 31-Dec-2026) | $0.7m | 0.2% | Finance lease, current portion | FY2025 Annual Report, Consolidated Statement of Financial Position, p.79; Note 14 |
| Year 2 (1-Jan-2027 to 31-Dec-2027) | $0.4m | 0.1% | Finance lease, non-current (short remaining term) | FY2025 Annual Report, Note 14 Leases |
| Year 3 (1-Jan-2028 to 31-Dec-2028) | $0.0m | 0.0% | None — but see §4: the $340.0m RBL facility (undrawn, already amortising — see §4) matures 30-Sep-2028, within this window | FY2025 Annual Report, Note 17 Borrowings |
| Year 4 (1-Jan-2029 to 31-Dec-2029) | $337.7m | 99.7% | Second Priority Senior Secured Notes, $350.0m face / $337.7m carrying, single bullet, matures 14-May-2029 | FY2025 Annual Report, Note 17 Borrowings, p.106–107; Capital IQ Fixed Income Securities Summary (maturity date 2029-05-14) |
| Year 5 (1-Jan-2030 to 31-Dec-2030) | $0.0m | 0.0% | None | — |
| Thereafter | $0.0m | 0.0% | None | — |
| **Total** | **$338.8m** | **100%** | Reconciles to `01`'s canonical gross debt (carrying value) exactly: $0.7m + $0.4m + $337.7m = $338.8m | Derived; cross-checked to `01_capital-structure-and-leverage.md` §7 |

The filing's own liquidity-risk note buckets maturities differently (<6mo / 6–12mo / 1–3yr / 3–5yr / >5yr) and discloses **undiscounted contractual cash flows including future interest**, not principal alone: borrowings show $18.4m (<6mo) + $18.4m (6–12mo) + $73.5m (1–3yr) + $368.4m (3–5yr) = $478.7m total, of which $368.4m in the 3–5yr bucket is the $350.0m principal bullet plus one semi-annual coupon (~$18.4m at 10.5% on $350m/2) landing in the same window [FY2025 Annual Report, Note 20(d) Liquidity Risk, p.117]. The table above reconstructs the **principal-only** schedule used by this module (per MODULE_RULES.md's "wall, not the average" convention), reconciled to `01`'s carrying-value gross debt.

**As-of-today reframing:** eight months have passed between the audited anchor date (31-Dec-2025) and today (27-Aug-2026). From today, the Notes' bullet maturity is **14-May-2029, ~32 months (2.7 years) away** — still outside the 36-month window from today by roughly four months. The small lease amounts ($1.1m total) will likely have substantially rolled off by now given their short disclosed remaining terms, but no interim (H1 FY2026) balance sheet is in the data pool to confirm the exact residual — this is this agent's own dating exercise, labeled *Inference, not from filings*.

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years), from 31-Dec-2025 anchor | **~3.4 years** — derived: ($0.7m×0.5yr + $0.4m×1.5yr + $337.7m×3.37yr) ÷ $338.8m ≈ 3.36 years |
| Weighted-average maturity (years), from today (27-Aug-2026) | **~2.7 years** (Inference, not from filings — rolls the same schedule forward by the ~0.66 years elapsed) |
| % due within 12 months | 0.2% ($0.7m ÷ $338.8m) |
| % due within 24 months | 0.3% ($1.1m ÷ $338.8m) |
| % due within 36 months | 0.3% (unchanged — no debt matures in Year 3; the Notes land in Year 4) |
| Largest single maturity year (and amount) | **2029 — $337.7m carrying value / $350.0m face value, 99.7% of gross debt** — a single bullet repayment, not an amortizing schedule |

This is a **barbell, not a ladder**: essentially nothing is due for four years, then nearly the entire debt stack comes due at once in a single bullet. A weighted-average maturity of ~3.4 years reads comfortably in isolation, but it conceals that the "wall" is really one $350.0m cliff in 2029, not a spread-out repayment profile — the WAM understates the concentration risk on its own (MODULE_RULES.md §3, "the wall, not the average").

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | ~100% of drawn debt ($350.0m face value Notes, fixed 10.50% coupon); the $1.1m of finance leases (0.3% of gross debt) carry no separately disclosed rate | FY2025 Annual Report, Note 17 Borrowings; Note 20(a)(ii) Interest Rate Risk table, p.114 — "Fixed Interest Rate" column shows $350.0m of Borrowings, $0 floating |
| Floating-rate share | 0% of drawn debt currently (the $340.0m RBL is undrawn at both 31-Dec-2025 and 30-Jun-2026, so it contributes no current floating exposure); if drawn, it would be floating (term SOFR + an undisclosed margin) — a **contingent** rate exposure, not a current one | FY2025 Annual Report, Note 17; Note 20(a)(ii), p.114 ("As at 31 December 2025 and 31 December 2024, there was no interest rate hedging in place") |
| Weighted-average coupon | 10.50% (the only rate-bearing debt currently outstanding is the fixed-coupon Notes) | FY2025 Annual Report, Note 17; Capital IQ Fixed Income Securities Summary |
| Current market refi rate (matching tenor) | **8.211% yield-to-worst** on KAR's own outstanding Notes, priced at 103.571 (i.e., trading *above* par) — this is a live, instrument-specific market read, not a generic benchmark | Capital IQ Fixed Income Securities Summary export, "Current YTW" / "Current Price" fields, pool extraction dated 2026-08-27 |
| Cross-check (generic benchmarks, web-sourced) | 5-year US Treasury yield ~4.33% (Web: FRED/Treasury, 2026-08-05, indicative, unverified); ICE BofA Single-B US High Yield Index effective yield ~7.31% (Web: FRED series BAMLH0A2HYBEY, most recent found dated ~Apr-2026, indicative, unverified, ~4 months stale) | Web-sourced, dated and labeled per MODULE_RULES.md |
| Estimated refi cost step-up (bps) | **−229bps (a decrease, not a step-up):** 8.211% market YTW − 10.50% coupon = −2.289 percentage points | Derived from the two rows above |

**Read this table carefully — it runs against the usual pattern.** Karoon's bond currently trades *above* par (103.571 vs 100 issued), meaning the market's required yield on this exact credit (8.211%) sits below the 10.50% coupon it was issued at in May-2024. The generic single-B high-yield cross-check (~7.31%, though several months stale) and the 5-year Treasury (~4.33%) both corroborate that 8.2% is a plausible market-clearing rate for a B/B+-rated, oil-and-gas-secured credit today, not a data anomaly. If Karoon refinanced the Notes today, the evidence points to a **lower** cost of debt than the existing coupon, not a higher one — consistent with net leverage falling from 2.13x (FY2022) to 0.36x (FY2025) over the period `01_capital-structure-and-leverage.md` documents. This is a snapshot as of the extraction date; market yields can move materially over the ~2.7 years remaining to the 2029 maturity, and this is not a forecast that they will stay this low.

The Notes carry a **next call date of 3-Sep-2026** (call price 105.25% of par) [Capital IQ Fixed Income Securities Summary] — roughly one week from this report's date. This gives Karoon an early opportunity to refinance the Notes at the improved market rate implied above, at the cost of a 5.25-point call premium; whether management intends to exercise it is not disclosed in this data pool.

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

Next-24-month scheduled maturities total **$1.1m** (finance leases only, per §1) — the following sources are shown for completeness, not because a shortfall exists.

| Source of repayment for next-24m maturities ($1.1m) | Amount | Evidence |
|---|---:|---|
| Cash on hand | $206.1m (31-Dec-2025, audited) / $80.3m (30-Jun-2026, unaudited quarterly update) | FY2025 Annual Report, p.79; 2Q26 Activities Report (Jul-22-2026), p.4 — "cash and cash equivalents" |
| Forecast FCF (or recent run-rate, labeled) | FY2025 FCF was **negative $37.1m** (CFO $251.4m − Capex $288.5m); TTM-to-30-Jun-2025 FCF was negative $9.9m | `earnings/01_historical-financials.md` §1–§2. Labeled: this is a trailing run-rate, not a forward forecast, and it is negative — flagged explicitly, though the $1.1m maturity window is far too small for FCF sign to matter |
| Revolver availability (only if availability known) | $283.3m committed, undrawn, available as of 30-Jun-2026 (amortising: was $340.0m at inception, stepped to $283.3m on 31-Mar-2026, and is scheduled to step further to $226.7m on 30-Sep-2026 under the semi-annual borrowing-base redetermination / straight-amortising schedule) | 2Q26 Activities Report (Jul-22-2026), p.4, "Liquidity" table and accompanying text |
| Asset-sale proceeds (only if announced / authorized) | Unknown — no asset sale is announced or authorized in the data pool | Not disclosed |
| New debt issuance (only if committed / announced) | Unknown — no new issuance is committed or announced in the data pool | Not disclosed |

The near-term wall (next 12–24 months) is **trivially covered by cash alone** — $1.1m of maturities against $80.3m–$206.1m of cash on hand, before any FCF, revolver, or market access is even needed. FCF has been negative on a trailing basis (FY2025: −$37.1m; TTM-to-Jun-2025: −$9.9m), driven by heavy growth capex (Baúna flotel revitalisation, SPS-92 well intervention, Who Dat A1 sidetrack — together $214.6m across 1Q26–2Q26 per `01`'s §6) rather than by operating weakness, but this does not threaten the maturity schedule itself because there is essentially nothing scheduled to refinance in the window; it is, however, the reason net debt rose from $132.7m (31-Dec-2025) to $269.7m (30-Jun-2026) and cash fell from $206.1m to $80.3m over the same six months — a liquidity-trajectory finding that belongs to `03_liquidity-runway` but is flagged here as context. Floating-rate share is currently 0% of drawn debt, so a rate move today reprices nothing; if the RBL is ever drawn, 100% of the drawn balance would reprice with SOFR. Rating posture: S&P **B (Stable)** issuer / **B+** issue-level, Fitch **B (Stable)** — both sub-investment-grade, unchanged since the 2024 issuance [`01_capital-structure-and-leverage.md` §0; Capital IQ Fixed Income Securities Summary], and the bond's own market pricing (above par, §3) is a favorable, not adverse, signal for market access today. Conclusion: **self-funded / low refi risk** for the next 12–24 months — the wall does not require market access at all in that window.

## 5. Refinancing Read

Karoon's maturity profile is a barbell, not a wall in the near term: 99.7% of its $338.8m gross debt (carrying value) is a single $350.0m (face) bullet Note maturing 14-May-2029, roughly 2.7 years from today, with only $1.1m of finance-lease payments due in the next 24 months [§1–§2]. Refinancing that bullet today would likely cost **less**, not more, than its 10.50% coupon — the Notes currently trade above par with a market yield-to-worst of 8.211% (Capital IQ, priced 2026-08-27), roughly 229bps below the coupon and broadly consistent with the wider single-B high-yield energy market [§3] — though that is a snapshot, not a guarantee held over the next 2.7 years. The biggest refinancing risk is not the near-term wall but the **compression of two events into 2028–2029**: the $340.0m committed RBL backstop is on a fixed, reserves-based amortisation schedule that has already cut availability to $283.3m (31-Mar-2026) and is scheduled to fall to $226.7m by 30-Sep-2026 regardless of Karoon's own credit trajectory, and that facility matures 30-Sep-2028 — roughly eight months before the $350.0m Notes bullet comes due in May-2029 — meaning Karoon will likely need to refinance or replace both instruments within a short window while carrying sub-investment-grade B/B+ ratings in a commodity-cyclical, currently unhedged business [`business-model/10_external-dependency.md`]. **Under a "market closure" assumption (no new unsecured issuance for 12 months), Karoon survives the next 12 months**: it has no unsecured-market refinancing need in that window ($0.7m of scheduled lease maturities only), $80.3m of cash on hand (30-Jun-2026), and a $283.3m committed, already-secured, undrawn RBL that does not require fresh capital-markets access to draw — *Inference, not from filings: this assumes the RBL's disclosed borrowing-base amortisation (283.3m → 226.7m by Sep-2026) does not fall to zero within the next 12 months, which the disclosed step-down schedule does not suggest.*



---

## balance-sheet-survival / 03_liquidity-runway.md

_Source: `03_liquidity-runway.md`_

# Liquidity Runway — KAR

Karoon Energy Ltd (ASX: KAR) reports under IFRS (AASB) in **US dollars** (the company's stated functional and presentation currency, despite its AUD-denominated ASX listing and AUD dividends) [`01_capital-structure-and-leverage.md` §0]. All figures below are USD unless labeled otherwise. This agent reuses the canonical debt stack, net debt, and cash figures from `01_capital-structure-and-leverage.md` and the next-12-month maturity figure from `02_maturity-wall-and-refinancing.md`. No `ciq_facts.json` sidecar exists for this run; the cash-flow and near-term obligation figures below are read from the FY2025 Annual Report, cross-checked against `earnings/01_historical-financials.md` and `earnings/06_earnings-quality.md`, and updated against the most recent quarterly disclosure (2Q26 Activities Report, 22-Jul-2026, unaudited).

**Two anchor dates are used deliberately.** The canonical, audited balance-sheet anchor is **31-Dec-2025** (FY2025 Annual Report), consistent with `01` and `02`. But `01` §6 and `02` §4 both flag that net debt has risen materially since then — cash fell from $206.1m to $80.3m and net debt rose from $132.7m to $269.7m over the six months to 30-Jun-2026, driven by a heavy capital programme, not new borrowing. Per MODULE_RULES.md §7 ("assume the more fragile reading when data is thin"), this report computes the runway on BOTH the audited FY2025 anchor and the more current, unaudited 30-Jun-2026 snapshot, and treats the latter as the more conservative, decision-relevant figure.

## 1. Liquidity Sources (committed only)

### FY2025 audited anchor (31-Dec-2025)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | $206.1m | Y | No restricted or trapped cash disclosed anywhere in the FY2025 Annual Report notes read for this report | FY2025 Annual Report, Consolidated Statement of Financial Position, p.79 |
| Liquid short-term investments | $0 | N/A | None disclosed separately from cash & equivalents | Karoon Energy Ltd ASX KAR Financials.xls, Balance Sheet tab |
| Revolver / facility (RBL) — commitment | $340.0m, undrawn | Maybe | Secured, borrowing-base Reserves Based Lending facility; do NOT count the headline commitment alone as liquidity — see availability row | FY2025 Annual Report, Note 17 Borrowings, p.106 |
| Revolver availability (disclosed) | $340.0m at 31-Dec-2025 | Y | Availability = full commitment at this date; the semi-annual borrowing-base step-down schedule had not yet started (first step-down effective 31-Mar-2026) | `02_maturity-wall-and-refinancing.md` §4; FY2025 Annual Report, Note 17 |
| **Total usable liquidity (FY2025 anchor)** | **$546.1m** | | $206.1m cash + $340.0m RBL availability | Derived |

No uncommitted credit lines are disclosed anywhere in the data pool for this ticker.

### Current, unaudited snapshot (30-Jun-2026, most recent quarterly disclosure)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | $80.3m | Y | No restriction disclosed in the quarterly update | 2Q26 Activities Report (Jul-22-2026), p.5, "Cash, Liquidity and Cash Flows" table |
| Revolver / facility (RBL) — commitment | $340.0m (original), now amortised | Maybe | Same facility as above; the borrowing-base step-down has now started | Same |
| Revolver availability (disclosed) | $283.3m at 30-Jun-2026, stepping to **$226.7m on 30-Sep-2026** under the semi-annual redetermination / straight-amortising schedule | Y | Company discloses this line item as "Undrawn available facilities" — actual availability, not headline commitment; satisfies the module's "revolvers are not liquidity unless availability is known" rule | 2Q26 Activities Report (Jul-22-2026), p.5 |
| **Total usable liquidity (current, unaudited)** | **$363.6m** | | $80.3m cash + $283.3m RBL availability. This ties exactly to the company's own disclosed "Total liquidity" line — the cleanest available cross-check | 2Q26 Activities Report (Jul-22-2026), p.5 |
| **Total usable liquidity (current, post-step-down, conservative)** | **$307.0m** | | $80.3m cash + $226.7m RBL availability effective 30-Sep-2026 — this agent's own forward substitution, labeled *Inference, not from filings*: assumes cash is unchanged between 30-Jun-2026 and the step-down date | Derived from the same source |

Reporting currency for every figure above is USD. No liquid short-term investments beyond cash are disclosed at either date. The RBL is secured against the Baúna/Patola and Who Dat operating assets and guaranteed by Group members comprising ≥90% of EBITDAX and ≥90% of total assets [`01` §6A] — it is a real, asset-backed committed facility, not an unsecured line that could be pulled at will, but its available amount is mechanically shrinking on a disclosed schedule independent of Karoon's own credit performance.

## 2. Near-Term Uses (next 12 months)

Basis: FY2025 audited actuals (steady-state run-rate), cross-checked against CY26 company guidance where available.

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from `02`, next 12 months from the 31-Dec-2025 anchor) | $0.7m (finance lease, current portion) | `02_maturity-wall-and-refinancing.md` §1 |
| Cash interest (gross finance costs paid, FY2025 actual) | $66.3m | `earnings/06_earnings-quality.md` §1 (EBITDA→CFO→FCF bridge); cross-check: CY26 company guidance "Finance costs and interest, net of interest income" $60–70m, midpoint $65m — consistent [2Q26 Activities Report, p.7] |
| Maintenance capex (FY2025 actual, filing-disclosed split: "Payments for oil and gas assets," sustaining Baúna/Who Dat production) | $57.9m | `earnings/06_earnings-quality.md` §1 |
| Committed dividends / buybacks | $26.9m (dividends only — see note) | See note below |
| **Total near-term uses** | **$151.8m** | Sum of the four rows above |

**Dividend/buyback note (qualifier carried explicitly):** Karoon has no fixed-dollar dividend contractually "committed" for the next 12 months — the board pays 20–40% of underlying NPAT semi-annually under a stated policy, not a guaranteed cash amount [`business-model/11_capital-allocation-governance.md` §1]. The $26.9m used above is the most recent declared combined interim + final FY2025 dividend, used as a policy-consistent proxy for the forward 12 months (FY2026's dividend has not yet been declared in this data pool) — labeled *Inference, not from filings*. The board has also stated it "continues to view buybacks as an attractive near-term use of capital" and intends to continue an on-market buyback (recent run-rate: $4.0m in 2Q26 alone; ~$97m cumulative since the programme began in 2H24) [2Q26 Activities Report, p.5], but no fixed forward-12-month buyback dollar amount is committed or disclosed — it is excluded from the headline "committed" total and shown here only as a memo item: at the recent $4.0m/quarter run-rate, buybacks would add roughly **$16m/year** of discretionary (cuttable) cash use on top of the $151.8m total above. Because both the dividend and the buyback are board-discretionary and could be reduced in a downside, treating them at their recent run-rate is the conservative (not the flattering) choice for this table.

**Maintenance-capex caveat:** FY2025's $57.9m maintenance-capex figure is this report's cleanest filing-sourced base case, but CY26 guidance discloses a much larger, largely front-loaded sustaining-capital programme this specific year — the Baúna flotel revitalisation and FPSO integrity work alone is guided at $49–53m (of which $46.5m was already spent in 1H26), on top of $178–202m of guided CY26 investment capex [2Q26 Activities Report, p.7]. 85% of the year's budgeted capex was already spent by 30-Jun-2026, and management explicitly guides to "lower capital expenditure" and "higher free cash flow" in 2H26 [2Q26 Activities Report, p.2] — so the FY2025 steady-state $57.9m figure likely understates the capital actually deployed in the 12 months trailing today, but overstates what remains to be spent in the 12 months forward from today. This cuts both ways and is not adjusted for in the headline total above; it is flagged as a source of imprecision, not corrected mechanically.

## 3. Runway

Basis chosen: **Gross-obligations.** FY2025 reported FCF was **negative $37.1m** (CFO $251.4m − total capex $288.5m) [`earnings/01_historical-financials.md` §1], and the trailing six months to 30-Jun-2026 show continued heavy cash burn (net debt roughly doubled, cash fell 61%, driven by capex) [`01_capital-structure-and-leverage.md` §6]. Per MODULE_RULES.md §8, FCF this negative/volatile is treated as unreliable, so this report does **not** net FCF against obligations — it uses the full gross 12-month uses bucket instead, which is the more conservative of the two allowed bases. (Context, not part of the calculation: `earnings/06_earnings-quality.md` finds FY2025's reported FCF was fully explained by an itemised, one-off $202.6m M&A/settlement outflow — the FPSO buyout and the Petrobras contingent-consideration payment — and that *normalised operating FCF* was actually +$165.5m. If that normalised figure holds going forward, obligations would be more than internally funded and the true runway would be materially longer than computed below; this is upside context, not the headline number, because the reported, not normalised, cash outcome is what actually left the bank.)

| Metric | FY2025 audited anchor | Current (30-Jun-2026, unaudited) — company's own liquidity figure | Current, post-step-down (conservative) |
|---|---:|---:|---:|
| Total committed liquidity | $546.1m | $363.6m | $307.0m |
| Annual FCF (or proxy) | Negative $37.1m — NOT netted (gross-obligations basis) | Same | Same |
| Basis used | Gross-obligations | Gross-obligations | Gross-obligations |
| Annual net cash burn (12-month uses, §2) | $151.8m | $151.8m | $151.8m |
| Monthly net cash burn (annual ÷ 12) | $12.65m | $12.65m | $12.65m |
| Coverage multiple (liquidity ÷ annual burn) | 3.60x | 2.40x | 2.02x |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **≈43.2 months** | **≈28.7 months** | **≈24.3 months** |

Formula: runway (months) = total committed liquidity ÷ [ (12-month debt maturities + cash interest + maintenance capex + committed dividends) ÷ 12 ]. On every basis tested — the audited FY2025 anchor, the current unaudited snapshot, and the conservative post-step-down snapshot that assumes the RBL has already amortised to $226.7m — the runway clears 24 months, well beyond the 12-month window this metric is meant to test. The gap between the FY2025 anchor (43.2 months) and the current snapshot (24.3–28.7 months) is driven entirely by the post-year-end fall in cash and RBL availability documented in `01` and `02`, not by any change in the near-term obligations themselves.

### Seasonality / Peak Liquidity Need (Hard Check)

`earnings/01_historical-financials.md` §5 finds no material calendar seasonality provable from this data pool: Karoon reports half-yearly, not quarterly, full financials, and the swings observed (FYE-convention change, the FPSO buyout, realised-price moves) are company-specific events, not a recurring seasonal working-capital pattern. `earnings/06_earnings-quality.md` §3 does flag a company-specific, cargo-lifting-timing effect (crude-oil inventory on the FPSO rose 126.8% FY24→FY25, reflecting "one less cargo in the period" at year-end) — this is a single-cargo timing effect in a single-FPSO, cargo-based sales model, not a seasonal working-capital build. **Peak working-capital need is not disclosed** in the data pool beyond this cargo-timing note — the runway above may be marginally overstated in any single quarter where a cargo lifting slips past a period-end, but the effect (one cargo, roughly $90–125m of revenue per Baúna cargo per the 2Q26 Activities Report's own realised-price table) is small relative to the 24+ month runway calculated above and does not change the conclusion.

## 4. Sources & Uses Bridge

On the current, most conservative snapshot, in-hand liquidity ($307.0m–$363.6m, cash plus the RBL's actual disclosed availability) covers the next 12 months of obligations ($151.8m) roughly 2.0x–2.4x over — internal sources alone, with no FCF assumed to materialise and no external market access required, clear the next 12 months comfortably. Because this report deliberately used the gross-obligations basis (FCF not netted), **100% of the calculated runway sits in already-in-hand or already-committed liquidity — cash on the balance sheet plus a secured, asset-backed RBL with disclosed current availability — not in FCF that still has to show up.** If FY2025's normalised operating FCF (+$165.5m, ex one-off M&A) recurs, it would be additive to this runway rather than a load-bearing assumption within it; if it does not recur, the runway calculated above is unaffected because FCF was never counted as a source.

## 5. Liquidity Read

Karoon's liquidity runway is **at least 24 months** against its near-term obligations even on the most conservative, most current data point in the pool (the 30-Jun-2026 unaudited snapshot, using the RBL's post-step-down $226.7m availability rather than today's $283.3m) — and roughly 43 months on the audited FY2025 anchor. The runway rests entirely on cash already on the balance sheet ($80.3m at 30-Jun-2026) plus a secured, asset-backed, borrowing-base RBL whose current and near-term availability is a matter of public disclosure, not on FCF that has to materialise: FY2025 reported FCF was negative and this report deliberately did not net any forecast recovery against obligations. The single biggest liquidity risk is not the 12-month window this metric tests but the **trajectory feeding it**: cash fell from $206.1m to $80.3m and net debt rose from $132.7m to $269.7m in just six months on heavy, largely self-funded capital spending (Baúna flotel revitalisation, SPS-92 and A1 sidetrack work), and the RBL's own availability is on a disclosed, mechanical amortisation schedule ($340.0m → $283.3m → $226.7m by 30-Sep-2026, continuing toward its 30-Sep-2028 maturity) that shrinks regardless of Karoon's credit quality — if the current heavy-capex, cash-burning trajectory continued for another 12–18 months rather than reverting to the company's own guided "higher 2H26 free cash flow," the runway would compress from the ~24–43 months calculated here toward the 12-month line this metric exists to flag.



---

## balance-sheet-survival / 04_coverage-and-covenants.md

_Source: `04_coverage-and-covenants.md`_

# Coverage & Covenants — KAR

Karoon Energy Ltd (ASX: KAR), reporting in **US dollars** under IFRS (AASB), fiscal year ended **31-Dec-2025**. All figures below are US$ millions unless stated otherwise. No `ciq_facts.json` or `relationships.json` sidecar exists for this run (confirmed absent in `00_solvency-data-triage.md`); every figure is this agent's own sourced read, cross-checked to `01_capital-structure-and-leverage.md` for the canonical debt/EBITDA base and reconciled directly against the Capital IQ Fixed Income Summary workbook's own "Credit Ratios" tab (opened and read cell-by-cell for this report — see §1 reconciliation).

## 1. Coverage Ratios

**Interest basis (CLAUDE.md §15 — state gross vs net):** the FY2025 Consolidated Statement of Profit or Loss reports one P&L line, "Finance costs," of **$80.9m** (FY2024: $69.3m) [FY2025 Annual Report, p.79, Note 4(b)]. That line is broader than debt interest: its own breakdown is Interest expense $37.4m + Finance charges on lease liabilities $3.4m + Discount unwinding on provision for restoration $10.5m (non-cash, decommissioning-provision accretion, not debt-related) + Withholding tax expense $17.8m (a cash tax cost on interest paid to the foreign noteholders, not interest itself) + Other finance costs $11.8m (RBL commitment fees / amortisation of debt-issue costs, not separately itemised in the extracted pages) [FY2025 Annual Report, Note 2(b) Segment Information, p.86, tying to Note 4(b), p.89]. This report uses **two labelled bases**, matched consistently top-and-bottom in each ratio (§15):
- **Debt-related interest, $40.8m** (Interest expense $37.4m + lease finance charges $3.4m) — this is the basis that reconciles exactly to the Capital IQ Fixed Income Summary workbook's own "Credit Ratios" tab (EBIT/Interest 4.8x, EBITDA/Interest 9.3x, (EBITDA−Capex)/Interest 2.2x — verified below by direct recomputation), and is the closest available proxy to gross cash cost of the debt stack.
- **Full P&L finance costs, $80.9m** — the conservative, GAAP-line cross-check; it nets in non-debt items (decommissioning discount unwind, withholding tax, other), so it overstates the "cost of debt" but is shown because it is the actual reported expense line.

**EBITDA basis:** company-reported (non-IFRS) FY2025 EBITDA **$380.7m**, which includes ~$56.5m of one-off gains (a $35.3m FPSO-disposal gain and a $21.2m contingent-consideration fair-value gain) [`01_capital-structure-and-leverage.md` §5]. A one-off-stripped EBITDA of **$324.2m** is shown as a cross-check. Per `earnings/06_earnings-quality.md` §1, FY2025 cash conversion (CFO/EBITDA) was **66.0%**, down from 96.5% in FY2024 but still above the 50% red-flag line the earnings-quality module tests against — EBITDA is materially cash-backed, though the FY2025 step-down (driven by a $66.3m cash interest bill, up from $52.0m, and the unwind of a FY2024 one-off tax-timing benefit) is worth carrying forward, not rounded away.

**Capex basis:** FY2025 total capex was **$288.5m**, of which **$202.6m was one-off M&A/settlement spend** (the $115.0m Baúna FPSO buyout + the $87.6m Petrobras contingent-consideration payment) — recurring (maintenance + growth) capex was **$85.9m** [`earnings/06_earnings-quality.md` §1]. Both are shown because the two produce materially different coverage reads (see the flagged disagreement below).

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest (debt-related interest $40.8m) | **9.33x** | Derived: $380.7m ÷ $40.8m; matches CIQ Fixed Income Summary "EBITDA/Interest Exp." 9.3x |
| EBIT / interest (debt-related interest $40.8m) | **4.84x** | Derived: EBIT (CIQ-standardized) $197.4m ÷ $40.8m [`earnings/01_historical-financials.md` §1]; matches CIQ "EBIT/Interest Exp." 4.8x. Company does not disclose a standalone "EBIT" line item. |
| (EBITDA − total capex) / interest (debt-related interest $40.8m) | **2.26x** | Derived: ($380.7m − $288.5m) ÷ $40.8m; matches CIQ "(EBITDA-CAPEX)/Interest Exp." 2.2x |
| Fixed-charge coverage: (EBITDA − total capex) / (interest + lease finance charges) | **2.22x** | Derived: $92.2m ÷ ($40.8m + $0.7m current lease); lease obligation is now immaterial ($1.1m total lease liability post-FPSO buyout, vs $177.7m at FY2024 — `01_capital-structure-and-leverage.md` §1) so this barely differs from the row above |

**The disagreeing number, named (CLAUDE.md §3):** the headline (EBITDA − capex)/interest of 2.2x is dragged down almost entirely by FY2025's one-off M&A capex. Recomputed on **recurring capex only ($85.9m)**, (EBITDA − capex)/interest is **7.23x** on the debt-related-interest basis — more than 3x stronger than the headline. Recomputed on the **conservative full-finance-costs basis ($80.9m)**, the same ratio is **1.14x** on total capex but **3.64x** on recurring capex. The weakest reading in the whole set — (one-off-stripped EBITDA $324.2m − total capex $288.5m) ÷ $40.8m = **0.87x** — stacks two different one-off distortions (a stripped-down EBITDA AND a one-off-inflated capex figure) in the same ratio and is not a representative read of recurring debt-service capacity; it is shown only as the floor of the range, not the central estimate. The central, most representative read is **7.2x–9.3x** (recurring capex or interest-only denominator against reported EBITDA); the **2.2x** vendor-standard figure is real but is a mechanical artefact of one large, itemised, non-recurring cash outflow, not a deterioration in the business's ability to service its debt.

## 2. Covenant Inventory

**No indenture or credit-agreement document exists in the data pool for either the $350.0m Notes or the $340.0m syndicated RBL facility** — the Capital IQ Fixed Income Summary workbook states directly: *"There are no Indentures or Credit Agreements available for this company"* [Karoon Energy Ltd ASX KAR Fixed Income Summary.xls, "Latest Key Docs/Research"]. The only covenant disclosure in the entire pool is one sentence in the Annual Report: *"The Group has complied with all loan covenants throughout the reporting period"* [FY2025 Annual Report, Note 17 Borrowings, "Covenants," p.107]. No actual thresholds, no covenant-EBITDA definition, and no addback detail are disclosed anywhere. Per MODULE_RULES.md's partial-data rule, this table uses **typical market covenants for a single-B-rated E&P borrower as a LABELED ASSUMPTION**; all headroom figures below are indicative, not measured against a real threshold, and are marked **"Not assessable"** for scoring purposes.

| Covenant | Threshold (assumed, LABELED) | Current Actual | Headroom (indicative, assumed basis) | Source |
|---|---|---:|---:|---|
| Max net leverage (net debt/EBITDA) | **3.0x–4.0x** (Inference, not from filings — typical RBL/HY-bond maintenance range for a single-B E&P credit) | 0.36x (reported EBITDA basis, canonical per `01`) | **+88.0% to +91.0%** (indicative only) | Assumption; actual from `01_capital-structure-and-leverage.md` §5 |
| Min interest coverage (EBITDA/interest) | **2.5x–3.0x** (Inference, not from filings — typical bond incurrence-test range; bonds more often use an incurrence Fixed-Charge-Coverage test than a maintenance covenant) | 9.33x (debt-related-interest basis) | **+211% to +273%** (indicative only) | Assumption; actual from §1 above |
| Min DSCR-style coverage, (EBITDA−capex)/interest | **1.2x–1.5x** (Inference, not from filings — typical reserves-based-lending DSCR range) | 2.26x (total capex, debt-related interest, CIQ-matched) / 7.23x (recurring capex only) | **+50.7% to +88.3%** on the recurring-capex basis; on the artefact combination (one-off-inclusive capex + full finance costs) as low as **−5.0% to −24.0%** — see §1 flag, not a real breach, a capex-basis artefact | Assumption; actual from §1 above |
| Min liquidity / net worth | **Not disclosed; no minimum-liquidity requirement mentioned anywhere in the pool** | Cash & equivalents $206.1m [`01_capital-structure-and-leverage.md` §3] | Not assessable — no threshold exists to measure against | FY2025 Annual Report; CIQ Fixed Income Summary |
| Springing covenant trigger (e.g., RBL utilization threshold) | Not disclosed. The RBL's borrowing-base **redetermination is semi-annual and its facility-reduction schedule commences 31-Mar-2026 regardless of utilization** [FY2025 Annual Report, Note 17, p.107] — this is a structural/mechanical feature of a reserves-based-lending facility, not a utilization-triggered springing covenant, and belongs primarily to `02_maturity-wall-and-refinancing`/`03_liquidity-runway` to size | RBL was **0% drawn** at both 31-Dec-2025 and 30-Jun-2026 [`01_capital-structure-and-leverage.md` §1, §6] | If a utilization-triggered springing leverage/coverage covenant does exist in the (undisclosed) credit agreement, it is **not currently active** given zero drawn balance | Inference, not from filings |
| Equity cure rights (Y/N, limits) | Not disclosed in the data pool | — | Not assessable | FY2025 Annual Report; CIQ Fixed Income Summary — no cure-rights language found |
| Other — Petrobras contingent-consideration acceleration | Not a financial covenant; oil-price-linked deferred consideration, up to $285.0m undiscounted, $34.2m recognised at fair value [`01_capital-structure-and-leverage.md` §2] | Payable annually 2022–2026 on Brent price bands ≥$50–$70/bbl [FY2025 Annual Report, Note 18(ii), p.109-110] | Not a covenant — flagged here because it is the closest thing to a contractual, price-linked payment obligation in the capital structure | FY2025 Annual Report, Note 18(ii) |

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | **Undisclosed.** No indenture or credit agreement is in the pool; the Annual Report states only that covenants were complied with, not what "EBITDA" means for that test | FY2025 Annual Report, Note 17, p.107; CIQ Fixed Income Summary, "Latest Key Docs/Research" |
| Addbacks permitted (types) | Undisclosed | — |
| Addback caps / limits | Undisclosed | — |
| Is covenant EBITDA materially above reported EBITDA? | **Unknown — cannot be judged.** Reported EBITDA itself already carries ~$56.5m (14.8%) of one-off gains (§1); whether the actual covenant-EBITDA definition would strip those out, add back further items, or match the reported figure exactly cannot be determined from this pool | Inference, not from filings |

**The headroom above is high-confidence on direction (KAR's leverage and coverage sit far inside any plausible single-B covenant band) but low-confidence on magnitude (§15 rule — assumed thresholds, not measured ones) and its quality cannot be verified against a real covenant-EBITDA definition — "addback illusion" risk is unassessed, not ruled out.** Per MODULE_RULES.md's score-cap table, covenant headroom is capped at 60/100 and Overall usefulness at 75/100 for this module because the actual thresholds are undisclosed.

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | **Not assessable — no real covenant thresholds are disclosed.** Under the labeled assumptions in §2, the *indicative* tightest test is the DSCR-style (EBITDA−capex)/interest covenant (assumed 1.2x–1.5x floor), because it is the only assumed test where a plausible combination of bases (one-off-inclusive capex + full finance costs) shows negative indicative headroom — flagged in §1 as an artefact of FY2025's $202.6m one-off M&A capex, not a genuine near-breach |
| Headroom on tightest covenant (%) | Indicative range **+50.7% to +88.3%** on the recurring-capex basis (the representative reading); **−5.0% to −24.0%** on the one-off-inclusive-capex/full-finance-costs combination (the artefact floor — not a real signal because FY2025's capex will not recur at that level: $202.6m of $288.5m total capex was the one-off FPSO buyout and Petrobras settlement) |
| EBITDA decline that would breach it (approx.) | On the assumed max net-leverage covenant (3.0x–4.0x, net debt held flat at $132.7m): EBITDA would need to fall **88.4%–91.3%** from $380.7m. On the assumed DSCR-style covenant (1.2x–1.5x, recurring capex $85.9m, interest $40.8m held flat): EBITDA would need to fall **61.4%–64.6%**. (If FY2025's elevated one-off-inclusive capex of $288.5m were instead treated as the ongoing run-rate — not the base case — an EBITDA decline of only **8.1%** would trip an assumed 1.5x DSCR floor; this is the sensitivity that should be watched if capex does not fall back toward the $85.9m recurring level.) All figures: Bash/Python computation, shown in full in the working below |
| Debt increase that would breach it (approx.) | On the assumed max net-leverage covenant (3.0x–4.0x, EBITDA held flat at $380.7m): net debt would need to rise from $132.7m by **$1,009.4m–$1,390.1m** (to $1,142.1m–$1,522.8m) — roughly 3–4x the entire current debt stack. Karoon's near-term debt-increase drivers are its ongoing capex programme (2Q26 update shows net debt already risen to $269.7m by 30-Jun-2026 on the company's own comparable metric, still far short of any of these thresholds) and the undrawn $340.0m RBL, not a step-change acquisition |

**Working (Bash-executed, shown for reproducibility):**
```
EBITDA decline to breach assumed max net leverage 3.0x: 88.4%   [= 1 − 132.7/(3.0×380.7)]
EBITDA decline to breach assumed max net leverage 4.0x: 91.3%   [= 1 − 132.7/(4.0×380.7)]
EBITDA decline to breach assumed DSCR-style 1.5x (recurring capex $85.9m): 61.4%
EBITDA decline to breach assumed DSCR-style 1.2x (recurring capex $85.9m): 64.6%
EBITDA decline to breach assumed DSCR-style 1.5x (one-off-inclusive capex $288.5m, sensitivity only): 8.1%
Debt increase to breach assumed max net leverage 3.0x (EBITDA flat): $1,009.4m
Debt increase to breach assumed max net leverage 4.0x (EBITDA flat): $1,390.1m
```

## 4. Coverage / Covenant Read

Earnings comfortably carry interest on every measured basis: EBITDA/interest is 9.33x and even the most conservative interest-only reading (full P&L finance costs of $80.9m against reported EBITDA) is 4.71x, both far above any plausible single-B covenant floor of 2.0x–3.0x — this is a low-leverage balance sheet (net debt/EBITDA 0.36x, per `01`) carrying debt that is expensive for its size (10.50% coupon) but not hard to service. No real covenant thresholds are disclosed anywhere in the pool (confirmed absent by both the Annual Report's one-line compliance statement and the Capital IQ workbook's own "no indentures or credit agreements available" note), so covenant headroom is genuinely **not assessable** rather than "comfortable" — the indicative, labeled-assumption headroom is wide (+51% to +88% on the tightest plausible test, recurring-capex basis) but this is a modeled estimate, not a measured fact. The one number that would trip a false-comfort read is the (EBITDA − capex)/interest ratio when total FY2025 capex ($288.5m, of which $202.6m was the one-off FPSO buyout and Petrobras settlement) is used undifferentiated from recurring spend — on that combination the coverage falls as low as 1.14x–0.87x, which is why this report names and separates the one-off capex rather than letting a single blended ratio understate the company's actual, recurring debt-service capacity.



---

## balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md

_Source: `05_off-balance-sheet-and-contingencies.md`_

# Off-Balance-Sheet & Contingencies — KAR

Karoon Energy Ltd (ASX: KAR), reporting currency **US dollars (US$)**, IFRS as adopted by the AASB, FY2025 (year ended 31-Dec-2025), audited FY2025 Annual Report filed 26-Feb-2026. All figures below are US$ millions unless stated otherwise. Total equity at 31-Dec-2025: **$1,032.5m** [FY2025 Annual Report, Consolidated Statement of Financial Position, p.79]. This agent reads `01_capital-structure-and-leverage.md` to avoid double-counting: the $278.4m restoration (decommissioning) provision, the $34.2m Petrobras contingent-consideration derivative, and the $1.1m finance-lease liability are already recognised on Karoon's balance sheet and are covered in `01`'s debt-stack / other-debt-like-obligations tables — they are referenced here only where they carry an incremental, off-balance-sheet, or maximum-exposure dimension that `01` does not size. No `ciq_facts.json` sidecar exists for this run; every figure below is this agent's own sourced read of the FY2025 Annual Report, cross-checked to `01`.

## 1. Off-Balance-Sheet / Debt-Like Obligations

Reporting currency: **USD**.

| Item | Recognized Liability | Maximum / Gross Exposure | Already in 01's debt? | Source |
|---|---:|---:|---|---|
| Operating leases (if not capitalized) | N/A — none | N/A | N/A — Karoon reports under IFRS 16, which capitalises all material leases; the $1.1m finance-lease liability is already on-balance-sheet and already in `01`'s debt stack. No separate off-balance-sheet operating-lease bucket exists. | FY2025 Annual Report, Note 14 Leases |
| Pension / OPEB underfunding | $0.1m net liability (immaterial long-service-leave-type liability; no defined-benefit pension scheme) | $0.1m (fully recognized — no unfunded/off-balance-sheet component) | Yes — already in `01`'s "Other Debt-Like Obligations" table | Karoon Energy Ltd ASX KAR Financials Pension OPEB.xls |
| Securitization / factoring | None disclosed | N/A | N/A | No securitization, factoring, or receivables-sale programme found in a full-text read of the Notes |
| Purchase / take-or-pay commitments — capital & service expenditure | $0 (not recognized — executory contracts) | **$41.1m total** ($0.7m capital commitments, all due ≤1 year; $40.4m service commitments — predominantly Baúna FPSO logistics/services contracts — $30.8m ≤1 year, $9.6m 1-5 years) [FY2024 comparative: $74.1m total, so this has fallen $33.0m year-on-year] | No — not previously sized in `01` (which covers debt-like instruments, not executory purchase commitments) | FY2025 Annual Report, Note 23 Commitments, p.121 |

## 2. Guarantees & Letters of Credit

Reporting currency: **USD**.

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| Surety bond — Baúna decommissioning | $0 (off-balance-sheet security instrument; collateralises the already-recognized $278.4m restoration provision — see `01` §2, not incremental to the $278.4m) | BRL 843.8m (US$153.4m equivalent at 31-Dec-2025) | ANP (Brazil's national petroleum regulator), Baúna field decommissioning obligations | FY2025 Annual Report, Note 15(a), p.104-105 |
| Parent-company guarantee — Baúna decommissioning | $0 (same restoration provision, being superseded — "Management is actively working to have the Parent Company guarantee released") | BRL 117.7m (US$21.4m equivalent at 31-Dec-2025) | ANP, Baúna field decommissioning obligations (duplicative with the surety bond above pending release) | FY2025 Annual Report, Note 15(a) p.105; Note 22(c) p.121 |
| Parent-company guarantees — Santos Basin concession agreements | $0 | Amount **not disclosed** in the data pool | ANP — guarantees a subsidiary's obligations under Concession Agreements covering Blocks BM-S-61, BM-S-68, S-M-1102 and S-M-1537 | FY2025 Annual Report, Note 22(c) p.121 |
| Bank guarantees — property lease rentals | $0.2m (fully funded/cash-collateralized by security deposits — no net exposure) | $0.2m | Property lessors (Parent Company office leases) | FY2025 Annual Report, Note 22(b), p.121 |
| Financial guarantees — intercompany support | Not quantified | Not quantified — open-ended statement of intent | "The Company's present intention is to provide the necessary financial support for all Australian incorporated subsidiaries… as is necessary for each company to pay all debts as and when they become due" — an intercompany support commitment, not a third-party exposure | FY2025 Annual Report, Note 22(b)(ii), p.121 |
| Performance / surety bonds (other) | None disclosed beyond the ANP bond above | N/A | N/A | Full-text read of Notes 14-23 found no other performance bonds |

**Note on the ANP decommissioning security package:** the $153.4m surety bond and the $21.4m parent guarantee both collateralise the *same* already-recognized $278.4m restoration provision (see `01` §2) — they are not additive to it. They are listed here because they are genuine off-balance-sheet security instruments (contingent calls on Karoon's own assets/parent guarantee if the provision is not funded as expected), not because they represent exposure beyond the $278.4m already on the balance sheet.

## 3. Litigation & Tax Contingencies

Reporting currency: **USD**. The company classifies these under Note 16 "Contingent Liabilities and Contingent Assets," applying AASB 137: recognition is required only where "a future sacrifice of economic benefits" is "probable" — items below are, by the company's own test, judged not to meet that bar (recognition not required), which is the company's own version of "not probable / not remote enough to book."

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) | Source |
|---|---:|---:|---|---|
| Petrobras contingent consideration (Baúna acquisition earn-out) | $34.2m fair value recognized (embedded derivative — $27.4m current, $6.8m non-current) | **Filing's own headline figure: "up to US$285 million"** — this is the *cumulative, 5-year programme cap* across testing years CY2022-CY2026 (annual tiers from $0 at Brent <$50 up to a per-year maximum at Brent ≥$70, summing to $285m across all five years — see build below). **The genuinely forward-looking (not-yet-tested) residual at 31-Dec-2025 is materially smaller: ~$42.4m** ($27.4m CY2025 amount, already fixed and paid Jan-2026, + up to $15.0m CY2026 maximum if Brent averages ≥$70, of which $6.8m is already fair-valued and recognized) | **Active but shrinking / substantially crystallized.** CY2022-2024 tiers have already been tested and settled — the FY2025 reconciliation shows $87.6m paid during FY2025 alone and $86.0m paid during FY2024, i.e. most of the $285m programme cap is historical cash already paid, not forward risk. Only the CY2026 tier remains genuinely oil-price-contingent | FY2025 Annual Report, Note 16(a), Note 18(ii), p.105/108-109 |
| Deferred consideration — Pacific Exploration and Production Corp. | $0 (not provided for — "dependent on uncertain future events") | $5.0m | **Contingent, not yet triggered.** Payable only on first production reaching ≥1 MMboe from specified Santos Basin blocks (S-M-1037, S-M-1101, S-M-1102, S-M-1165, S-M-1166); company's own language treats this as too uncertain to recognize, not as remote/dormant | FY2025 Annual Report, Note 16(a)(i), p.105 |
| Brazilian local-content compliance (Concession Contracts) | $0 | **Not quantified** — potential ANP fine for failing to meet the minimum Brazilian local-content requirement (up to 55% during exploration/appraisal phase) | Ongoing compliance obligation under Concession Contracts for 8 named Santos Basin blocks; no breach or fine disclosed as crystallized. Company does not quantify a maximum penalty | FY2025 Annual Report, Note 16(a)(iii), p.105 |
| Tax audits (ordinary course, multiple jurisdictions) | $0 | **Not quantified** | "In the ordinary course of business, the Group is subject to audits from relevant government revenue authorities... which could result in an amendment to historical tax positions" — generic disclosure, no specific assessment or claim named | FY2025 Annual Report, Note 16(a)(ii), p.105 |
| Other legal claims (ordinary course) | $0 | **Not quantified** | Company's own language: "No material loss to the Group is expected to result" — the company's own probability characterization is effectively remote | FY2025 Annual Report, Note 16(a)(iv), p.105 |
| Contingent assets | $0 | $0 | None — "The Group has no contingent assets as at 31 December 2025 (31 December 2024: $Nil)" | FY2025 Annual Report, Note 16(b), p.105 |

## 4. Contingent Exposure Summary

Reporting currency: **USD**. This summary uses the correctly-scoped, forward-looking maximum for the Petrobras earn-out ($42.4m residual, not the $285m cumulative 5-year programme cap, most of which is already-paid historical cash — see §3 build) so the total is not inflated by a sunk, already-settled figure. Unquantified items (local-content fine, tax audit adjustment) cannot be summed and are flagged separately rather than assumed at zero.

| Metric | Value |
|---|---:|
| Total recognized contingent liabilities (Petrobras fair value + Pacific E&P + bank guarantee) | $34.4m ($34.2m Petrobras + $0.0m Pacific E&P + $0.2m bank guarantee) |
| Total maximum / gross exposure, quantifiable items (residual Petrobras $42.4m + Pacific E&P $5.0m + bank guarantee $0.2m) | $47.6m |
| Max exposure ÷ recognized | 1.38x ($47.6m ÷ $34.4m) |
| Max exposure ÷ total equity ($1,032.5m) | 4.6% |
| Memo: including firm (non-contingent) purchase commitments ($41.1m, Note 23) | $88.7m total ÷ $34.4m recognized = 2.58x; ÷ equity = 8.6% |
| Memo: if the filing's full $285m Petrobras programme cap were used instead of the correctly-scoped $42.4m residual (methodologically wrong — see §3) | $290.2m ÷ $34.4m = 8.4x; ÷ equity = 28.1% — **would cross both RF-OBS-001 thresholds, but only by using a stale, already-paid cumulative figure as if it were still live, which it is not** |
| Memo (context, not summed above — collateral for an already-recognized liability, not incremental): ANP surety bond + parent guarantee behind the $278.4m restoration provision | $174.8m ($153.4m + $21.4m) — 16.9% of equity, but secures a liability already fully recognized on the balance sheet, not an add-on exposure |

## 5. Contingency Read

The largest genuinely off-balance-sheet items are the two decommissioning security instruments backing Karoon's own $278.4m restoration provision — a BRL 843.8m (US$153.4m) surety bond and a BRL 117.7m (US$21.4m) parent-company guarantee to Brazil's ANP regulator [FY2025 Annual Report, Note 15(a), Note 22(c)] — but these collateralize a liability Karoon has already recognized in full on its balance sheet (see `01` §2), so they add no exposure beyond what is already booked; the only live risk is that the recognized $278.4m estimate proves too low, which is a provision-adequacy question for `04`/`06`, not an off-balance-sheet spike. The Petrobras Baúna earn-out carries a filing-quoted "up to US$285 million" headline that looks large next to the $34.2m currently recognized, but the correct, forward-looking residual is only about $42.4m (1.38x recognized, 4.6% of equity) once the already-paid CY2022-2025 tiers are excluded — using the $285m cumulative programme cap as if it were still outstanding would overstate the exposure roughly 6-7x. Two items remain genuinely unquantified — the Brazilian local-content compliance fine and ordinary-course tax-audit exposure — and neither is sized in the filing; per the module's partial-data rule, undisclosed magnitude on a known regulatory exposure (local content) is a real gap, not an invented number, and it caps confidence in "total" contingent exposure rather than being assumed at zero. None of the quantifiable items meets the RF-OBS-001 bar (max ÷ recognized > 3x or max ÷ equity > 15%, AND the matter genuinely live) on a correctly-scoped basis, so this module does not emit that tag for KAR.



---

## balance-sheet-survival / 06_downside-stress-test.md

_Source: `06_downside-stress-test.md`_

# Downside Stress Test — KAR

Karoon Energy Ltd (ASX: KAR) reports under IFRS (AASB) in **US dollars**; every figure below is USD unless labelled otherwise. This agent consumes `01`–`05` of this module (all read in full) plus `business-model/10_external-dependency.md`, `business-model/11_capital-allocation-governance.md`, `earnings/03_margin-drivers.md`, and `earnings/06_earnings-quality.md`. No pending or recently-announced material acquisition exists in the data pool (confirmed in `business-model/11_capital-allocation-governance.md` §1 — the last transaction was the 2025 Baúna FPSO buyout, already fully reflected in the FY2025 balance sheet) — the pro-forma acquisition check in this agent's workflow therefore does not apply; the stress base below is the reported balance sheet, not a pro-forma one.

**A usable EBITDA base exists** (§4, `04_coverage-and-covenants.md` confirms EBITDA/EBIT/interest all disclosed) and **covenant thresholds are undisclosed** (confirmed absent in `04` §2 and `00` §5/§6: "There are no Indentures or Credit Agreements available for this company"). Per the partial-data rule, this stress test runs against the labelled-assumption covenants carried from `04`, and every covenant breach point below is **indicative, not measured against a real, disclosed threshold**.

## 1. Base Case (today)

Reporting currency: **USD**. EBITDA basis: **cash-backed, one-off-stripped reported EBITDA — $324.2m.** This is `01_capital-structure-and-leverage.md` §5's one-off-stripped figure (company-reported FY2025 EBITDA $380.7m, less a $35.3m non-cash gain on disposal of the Baúna FPSO right-of-use asset and a $21.2m non-cash fair-value gain on the Petrobras contingent-consideration liability — both one-off, non-operating, non-cash items that should not inflate a downside starting point). This basis is cross-checked against `earnings/06_earnings-quality.md` §2: FY2025 cash conversion (CFO ÷ EBITDA) was 66.0%, above the module's 50% red-flag line in every one of the last three reported years — reported EBITDA is materially cash-backed, and stripping the two one-off gains removes non-recurring items without implying a cash-conversion problem. Company-reported EBITDA ($380.7m) and Underlying EBITDAX ($388.8m) are shown for cross-reference but are NOT used as the stress base, because a downside test should not start from a base inflated by ~$56.5m of one-time, non-cash gains.

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed, one-off-stripped) | **$324.2m** | `01_capital-structure-and-leverage.md` §5; cross-checked `earnings/06_earnings-quality.md` §2 |
| — for reference: reported EBITDA / Underlying EBITDAX | $380.7m / $388.8m | `01` §5 |
| Net debt — **canonical (strict basis, FY2025 audited anchor, 31-Dec-2025)** | **$132.7m** | `01_capital-structure-and-leverage.md` §4/§7 — designated canonical for this module |
| Net debt — **current, unaudited (30-Jun-2026)**, flagged as the more fragile, decision-relevant trajectory | **$269.7m** | `01` §6; `02` §4; `03` §0 — cash fell $206.1m→$80.3m and net debt rose $132.7m→$269.7m over 6 months, driven by capex, not new borrowing |
| Net debt / EBITDA (clean EBITDA basis) | 0.41x (canonical net debt) / 0.83x (current net debt) | Derived: $132.7m or $269.7m ÷ $324.2m |
| EBITDA / interest (debt-related interest $40.8m) | 7.95x (clean EBITDA basis); 9.33x on reported EBITDA (04's basis) | `04_coverage-and-covenants.md` §1 |
| Tightest covenant + threshold | **Not assessable on a real threshold — no indenture/credit agreement in the pool.** Indicative tightest test (labelled assumption): DSCR-style (EBITDA − recurring capex) ÷ debt-related interest, assumed floor **1.2x–1.5x** | `04_coverage-and-covenants.md` §2/§3 |
| Next-12m obligations — gross-obligations basis (debt maturities + cash interest + maintenance capex + dividends) | $151.8m | `03_liquidity-runway.md` §2 |
| Next-12m obligations — net-of-FCF basis (debt maturities + dividends only; interest and capex already inside FCF) | $27.6m ($0.7m + $26.9m) | Derived from `03` §2 components, per MODULE_RULES.md §8 |
| Committed liquidity — FY2025 audited anchor | $546.1m ($206.1m cash + $340.0m RBL, full availability) | `03_liquidity-runway.md` §1 |
| Committed liquidity — current (30-Jun-2026) | $363.6m ($80.3m cash + $283.3m RBL availability) | `03` §1 |
| Committed liquidity — current, post-step-down (conservative, RBL steps to $226.7m on 30-Sep-2026) | $307.0m | `03` §1 |
| Floating-rate debt (gross) | **$0 (0% of drawn debt).** The $350.0m Notes are 100% fixed at 10.50%; the $340.0m RBL is undrawn at both 31-Dec-2025 and 30-Jun-2026 and would be floating (SOFR + undisclosed margin) only if drawn | `02_maturity-wall-and-refinancing.md` §3 |
| Hedge coverage | **None active.** Last Brent collar expired out-of-the-money end-2025 and was not replaced; fully unhedged into FY2026 | `business-model/10_external-dependency.md` §1; `02` §3 |
| Working-capital seasonality / peak build | No provable recurring seasonal pattern (half-yearly reporter). One disclosed, company-specific cargo-timing effect: crude-oil inventory on the FPSO rose 126.8% FY24→FY25 ("one less cargo in the period" at year-end), each Baúna cargo worth roughly $90m–$125m of revenue | `03_liquidity-runway.md` §3 (Seasonality Hard Check); `earnings/06_earnings-quality.md` §3 |

Karoon is **not net cash** on the strict basis at either anchor date (net debt $132.7m canonical / $269.7m current, against $338.8m gross debt and $1,032.5m equity) — this is a low-leverage, not a net-cash, balance sheet, so the module's "fortress" net-cash framing does not apply verbatim; the standout survival characteristic instead is the sheer size of committed liquidity relative to near-term obligations (see §3–4).

## 2. Stress Scenarios

Base EBITDA $324.2m (clean, one-off-stripped). Leverage is shown on both the canonical FY2025 net debt ($132.7m) and the current, more fragile 30-Jun-2026 net debt ($269.7m). Committed liquidity uses the current, post-step-down (conservative) figure of $307.0m as the decision-relevant basis for the liquidity-gap row (the FY2025-anchor $546.1m figure is shown as context in §1 but is stale relative to the disclosed post-year-end deterioration). All dollar figures US$m; formulas and full working are in §3 and the Bash-executed calculations referenced there.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp | Historical trough calibration (−54.2%) |
|---|---:|---:|---:|---:|---:|---:|---:|
| EBITDA | 324.2 | 226.9 | 194.5 | 129.7 | 194.5 | 194.5 | 148.5 |
| Net debt / EBITDA (canonical net debt $132.7m) | 0.41x | 0.58x | 0.68x | 1.02x | 0.68x | 0.68x | 0.89x |
| Net debt / EBITDA (current net debt $269.7m) | 0.83x | 1.19x | 1.39x | 2.08x | 1.39x | 1.39x | 1.82x |
| EBITDA / interest (debt-related, $40.8m) | 7.95x | 5.56x | 4.77x | 3.18x | 4.77x | 4.77x | 3.64x |
| DSCR-style: (EBITDA − recurring capex $85.9m) / interest | 5.84x | 3.46x | 2.66x | 1.07x | 2.66x | 2.66x | 1.53x |
| Tightest covenant headroom (indicative, DSCR-style, T=1.5x floor) | +289% | +130% | +77% | **−29%** | +77% | +77% | +2% (razor-thin) |
| Covenant breach? (Y/N, indicative only — no real threshold disclosed) | N | N | N | **Y (indicative)** | N | N | N (marginal) |
| 12-month liquidity gap (net-of-FCF basis; negative = surplus) | −$444.9m | −$380.7m | −$359.3m | −$316.5m | −$259.3m | −$359.3m | −$356.5m |
| Survives without external action? (Y/N) | Y | Y | Y | **Y on liquidity; a real covenant at this assumed threshold would need a waiver** | Y | Y | Y (marginal on the indicative covenant) |

**Rate shock (−40% + rates +200bp): not applicable in direct-cost terms.** Floating-rate debt is currently $0 (RBL fully undrawn at both anchor dates, §1) — a +200bp move reprices nothing today. Labelled sensitivity only: if the $283.3m RBL were fully drawn (not required or indicated by any scenario below — liquidity never needs it, §3), +200bp would add roughly $5.7m/year of interest cost ($283.3m × 2.00%) — immaterial next to the $194.5m of EBITDA left at −40%. This column is therefore identical to the plain −40% column on every metric that uses debt-related interest, and is shown for completeness per MODULE_RULES.md's stress-test rule.

**Working-capital shock, labelled assumption:** $100m cash outflow, the midpoint of the disclosed $90m–$125m single-Baúna-cargo revenue value (`03` §3) — modelled as one cargo's proceeds not received in the stress window (a real, disclosed timing mechanism in this single-FPSO, cargo-based sales model, not a seasonal build). Applied on top of the −40% EBITDA case by reducing usable liquidity by $100m.

All scenarios assume zero management mitigation — this is a survival bound, not a forecast; the earnings module's realised-offset case (`earnings/07` §2, if produced) is the expected-outcome read.

## 3. Break Points

**Executed solve (Bash/Python, shown for reproducibility):**

```
Leverage covenant (MAX, net debt/EBITDA), h = 1 − net debt/(T×EBITDA), EBITDA=$324.2m clean:
  T=3.0x, canonical net debt $132.7m: h = 1 − 132.7/(3.0×324.2) = 0.864 → 86.4%
  T=4.0x, canonical net debt $132.7m: h = 1 − 132.7/(4.0×324.2) = 0.898 → 89.8%
  T=3.0x, current net debt $269.7m:   h = 1 − 269.7/(3.0×324.2) = 0.723 → 72.3%
  T=4.0x, current net debt $269.7m:   h = 1 − 269.7/(4.0×324.2) = 0.792 → 79.2%

Coverage covenant (MIN, EBITDA/interest), h = 1 − (T×interest)/EBITDA, interest=$40.8m:
  T=2.5x: h = 1 − (2.5×40.8)/324.2 = 0.685 → 68.5%
  T=3.0x: h = 1 − (3.0×40.8)/324.2 = 0.622 → 62.2%

DSCR-style covenant (MIN, (EBITDA−recurring capex)/interest), h = 1 − (T×interest + capex)/EBITDA, capex=$85.9m:
  T=1.2x: h = 1 − (1.2×40.8+85.9)/324.2 = 0.584 → 58.4%
  T=1.5x: h = 1 − (1.5×40.8+85.9)/324.2 = 0.546 → 54.6%

Refi-market net-leverage threshold (MAX, e.g. 6.0x — a level well above sub-investment-grade E&P norms):
  T=6.0x, canonical net debt: h = 1 − 132.7/(6.0×324.2) = 0.932 → 93.2%
  T=6.0x, current net debt:   h = 1 − 269.7/(6.0×324.2) = 0.861 → 86.1%

Liquidity exhaustion, usable liquidity + stressed FCF(h) = obligations (net-of-FCF basis, $27.6m):
  stressed FCF(h) = FCF_base − EBITDA×h×(1−tax) = 165.5 − 324.2×h×0.66 = 165.5 − 213.97×h
  (FCF_base = $165.5m normalised operating FCF ex one-off M&A [earnings/06 §1]; tax = 34%, Brazilian statutory
   rate, labelled assumption, since effective cash tax has ranged 12.4%–46.7% and is not a reliable forward rate)
  h_break = (liquidity + 165.5 − 27.6) / 213.97
    FY2025 anchor liquidity $546.1m:      h_break = 3.20  → h≥1, DOES NOT BREACH on EBITDA decline alone
    Current liquidity $363.6m:            h_break = 2.34  → h≥1, DOES NOT BREACH on EBITDA decline alone
    Current, post-step-down $307.0m:      h_break = 2.08  → h≥1, DOES NOT BREACH on EBITDA decline alone
  Sanity check at h=100% (total EBITDA wipeout): stressed FCF = −$48.5m; liquidity+FCF still $258.5m (post-step-
  down basis) against $27.6m of obligations — a $230.9m surplus even in a complete EBITDA wipeout.
```

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest (indicative, undisclosed) covenant breaches — DSCR-style, T=1.5x floor | **≈54.6%** (T=1.2x: ≈58.4%) — first break in the tested range, occurring between the −40% and −60% haircuts |
| Coverage covenant breaches (indicative) — EBITDA/interest, T=3.0x floor | ≈62.2% (T=2.5x: ≈68.5%) |
| Net-leverage covenant breaches (indicative) — MAX 3.0x, current net debt basis | ≈72.3% (canonical net debt basis: ≈86.4%) |
| Net leverage exceeds a 6.0x refi-market threshold | ≈86.1% (current net debt) / ≈93.2% (canonical net debt) — **does not bind inside any tested haircut; shown only because it is far outside the −30/−40/−60 range, confirming leverage is not the binding constraint** |
| Committed liquidity exhausted within 12 months | **Does not breach on an EBITDA decline alone (h≥1 on every liquidity basis tested, including the current, post-step-down $307.0m figure).** Karoon's committed liquidity so far exceeds its net-of-FCF near-term obligations ($27.6m) that even a complete, 100% EBITDA wipeout leaves a $230.9m liquidity surplus, before any WC shock is even applied |

**Caveat on the liquidity solve:** this result assumes the $340.0m RBL's disclosed, mechanical step-down schedule ($340.0m→$283.3m→$226.7m by 30-Sep-2026) is the only change to its availability. The RBL is a **reserves-based lending** facility whose borrowing base is periodically redetermined against the value of proved reserves — a severe, sustained oil-price decline (the underlying driver of any EBITDA haircut this deep) would plausibly cut the redetermined borrowing base further than the disclosed amortisation schedule alone, beyond what this pool discloses a formula for. The liquidity break-point above should be read as **liquidity does not break on the EBITDA decline itself**, not as a guarantee that RBL availability is immune to the same commodity-price shock that produced the EBITDA decline.

## 4. Survival Read

Karoon survives a 30–40% EBITDA decline — an ordinary cyclical downturn for a name whose own history already shows a 54.2% peak-to-trough EBITDA swing (FY2024 $450.3m to FY2022 $206.3m, company-reported basis) — on every metric tested here, with no covenant breach (even on the indicative, undisclosed assumed thresholds from `04`) and a large liquidity surplus, without needing a waiver, an equity raise, or an asset sale. The first thing to break in the tested range is the **indicative** DSCR-style covenant (assumed 1.2x–1.5x floor on (EBITDA − recurring capex)/interest), which trips at roughly a 55–58% EBITDA decline — a level between the −40% and −60% haircuts — but this is a labelled assumption, not a measured fact: no indenture or credit agreement for either the $350.0m Notes or the $340.0m RBL exists in the data pool (`04` §2, `00` §6), so this is the best available proxy for where a real covenant might sit, not a confirmed breach level. **Liquidity itself does not exhaust on an EBITDA decline alone at any haircut tested, including a full (100%) EBITDA wipeout combined with a $100m working-capital shock** — Karoon's $307.0m of current, post-step-down committed liquidity so exceeds its $27.6m of net-of-FCF near-term obligations (debt maturities plus the policy-consistent dividend proxy; buybacks are discretionary and excluded) that this is the single strongest finding in this stress test, not a bland "nothing breaks." **Market closure test:** assuming no new unsecured refinancing is available for 12 months, Karoon still clears the next 12 months comfortably — the only scheduled maturity in that window is $0.7m of finance leases, cash on hand ($80.3m at 30-Jun-2026) alone covers it many times over, and the $283.3m RBL is a secured, already-committed facility that does not require fresh capital-markets access to draw. The real vulnerability this test surfaces is **not** the 12-month window but the medium-term compression already flagged in `02`: the RBL matures 30-Sep-2028 and the $350.0m Notes bullet lands 14-May-2029, both inside a period where, if a 50%+ EBITDA decline actually materialised and persisted for multiple years (rather than the single-year shock modelled here), the RBL's own reserves-based redetermination and Karoon's sub-investment-grade (S&P B / Fitch B) rating would make refinancing that 2028–2029 pair materially harder and more expensive than the current point-in-time 8.211% market yield-to-worst (`02` §3) suggests.
