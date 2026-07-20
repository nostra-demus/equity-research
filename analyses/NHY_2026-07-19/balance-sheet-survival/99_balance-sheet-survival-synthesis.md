# Balance-Sheet-Survival Module — NHY (Synthesis)

## Abstract

Norsk Hydro's leverage is low but rising — net debt/EBITDA climbed from 0.49x (FY2023) to 1.02x TTM (net debt NOK 22,503m, EBITDA NOK 21,976m) — still investment-grade (S&P BBB, Moody's Baa2). The 12-month wall (NOK 8,250m, 22.6% of debt) is small and already covered 1.36x by cash alone, with no refinancing dependence. Liquidity runway runs roughly 100 months against NOK 40,980m of committed liquidity, though the tightest covenant is undisclosed for parent debt, so headroom is Not assessable. The stress test finds no break until EBITDA falls roughly 69-71%, far beyond a normal 30-60% recession. Verdict: Solid — fortress-like leverage and liquidity, capped short of Fortress by the missing covenant disclosure.

## 1. Solvency Verdict

- **Verdict: Solid**
- **Net leverage (net debt / EBITDA):** 0.80x on FY2025 reported EBITDA (net debt NOK 20,489m strict basis / EBITDA NOK 25,696m) → rising to 1.02x on the latest TTM basis (net debt NOK 22,503m / TTM EBITDA NOK 21,976m through 31-Mar-2026). Gross debt / EBITDA = 1.42x (FY2025 reported EBITDA basis). [`01_capital-structure-and-leverage.md`, §5-7]
- **Liquidity runway:** ~100 months (~8.3 years) on the net-of-FCF basis (NOK 40,980m committed liquidity ÷ NOK 409m/month net burn); would show an outright annual surplus on FY2025's higher FCF. Even a zero-FCF shock leaves ~20 months of covered runway. [`03_liquidity-runway.md`, §3]
- **Maturity wall (% within 24 months):** 37.3% (NOK 13,643m of NOK 36,574m gross debt); 22.6% (NOK 8,250m) within 12 months. Cash on hand alone (NOK 11,251m, Q1 2026) covers the 12-month piece 1.36x; cash + TTM FCF covers the full 24-month wall 1.25x, before touching the NOK 24,194m committed, undrawn revolver. [`02_maturity-wall-and-refinancing.md`, §2, §4]
- **Tightest covenant + headroom:** Not confirmed — no numeric covenant threshold is disclosed for parent-level debt ("no financial covenants for those loans"), and part-owned-subsidiary loans that do carry covenants have undisclosed terms. An indicative, LABELED-ASSUMPTION test (3.5x max net leverage / 3.0x min EBITDA-interest, calibrated to Hydro's BBB rating) shows +77.2%/+263.4% headroom, but this is directional only, not a confirmed test. [`04_coverage-and-covenants.md`, §2-3]
- **Stress break point (EBITDA decline that breaks it):** ~69.4%-70.7% (TTM basis) before the assumed coverage or leverage covenant breaks (both indicative); liquidity does not exhaust on an EBITDA decline alone even at a full collapse to zero for a year. A 30-60% EBITDA decline produces no covenant breach and no liquidity gap on any tested basis. [`06_downside-stress-test.md`, §2-3]
- Solvency strength /100: **76** (strong — low absolute leverage and IG ratings, tempered by a leverage trend rising every period on the strict basis and by the undisclosed rate-type/covenant gaps)
- Liquidity runway /100: **92** (very strong — deep committed liquidity dwarfs near-term uses on every basis tested)
- Refinancing risk /100 (inverted, higher = worse): **15** (very low — wall is small, self-funded, IG-rated, no disclosed refi step-up of consequence)
- Covenant headroom /100: **Not assessable** (no covenant-EBITDA definition or numeric threshold disclosed for the parent debt that dominates the stack; part-owned-subsidiary covenant terms undisclosed)
- Downside resilience /100: **88** (very strong — survives the full 30-60% haircut range plus a working-capital and a rate shock with no covenant breach and a liquidity surplus)
- Data quality /100: **82** (good — audited annual filing + Q1 2026 interim, full debt/maturity/cash-flow/contingency disclosure; the two real gaps are the covenant-threshold disclosure and the 75.6%-of-debt-stack rate-type disclosure)
- Overall usefulness /100: **75** (capped — no-covenant-disclosure hard cap per MODULE_RULES.md applies despite otherwise strong data quality)
- **Biggest solvency risk (one line):** The real covenant that binds — if any exists at the part-owned-subsidiary level, or a tighter one than assumed at the parent level — is unknown, and 75.6% of the debt stack (NOK 27,634m) carries no disclosed rate type, so the true floating-rate exposure and refinancing cost cannot be pinned down despite an otherwise comfortable ~70% EBITDA-decline cushion.

## 1A. Module Disconfirmation

- **Strongest bear point:** On the canonical strict basis, net leverage has risen every period shown — 0.49x (FY2023) → 0.74x (FY2024) → 0.80x (FY2025) → 1.02x (latest TTM) — while TTM EBITDA has fallen 14.5% year-on-year on a 40% YoY drop in the alumina price index, and the most recent standalone quarter (Q1 2026) posted negative operating cash flow of NOK (1,891)m against a positive Adjusted EBITDA of NOK 8,668m [`01`, §6; `03`, §3].
- **Strongest bull point:** NOK 40,980m of committed, restriction-adjusted liquidity covers the entire next-12-month gross uses bucket (NOK 24,663m) roughly 1.7x over with no FCF credit needed at all; the 12-month debt wall (NOK 8,250m) is covered 1.36x by cash alone; and the company holds stable investment-grade ratings (S&P BBB, Moody's Baa2, upgraded from Baa3 in June 2024) [`02`, §4; `03`, §4].
- **Single killer risk:** 75.6% of the debt stack (NOK 27,634m) has no disclosed coupon or floating/fixed classification, and no numeric covenant threshold exists anywhere in the pool for the debt that actually carries covenants (part-owned-subsidiary loans) — a materially tighter true rate-reset or covenant position than this report's labeled assumptions could exist and would not be visible from the data available.
- **Disconfirming evidence already visible:** the Q1 2026 negative operating cash flow (NOK -1,891m) against positive Adjusted EBITDA (NOK 8,668m) is a live, disclosed instance of cash currently running behind reported profit — not a hypothetical stress scenario, but an event that has already happened in the most recent quarter [`03`, §3; `04`, §1].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| solvency-data-triage | Sufficiency: Sufficient | Data pool clears all three legs (balance sheet, debt note, cash flow statement); the only real gaps are the covenant-threshold definition and a standalone third-party rating-rationale document — neither blocks the analysis |
| capital-structure-and-leverage | Net debt (strict, canonical) NOK 20,489m FY2025 / NOK 22,503m Q1 2026; net debt/EBITDA 0.80x-1.02x | Net leverage has risen in every period on the strict basis (0.49x FY2023 → 1.02x latest TTM), even though it remains low in absolute terms and well inside the company's own <2.0x-over-the-cycle target |
| maturity-wall-and-refinancing | Self-funded / low refi risk for the next 24 months | The 12-month wall (NOK 8,250m) is covered 1.36x by cash alone; the single biggest refinancing risk is not timing but disclosure — 75.6% of the debt stack has no disclosed rate type |
| liquidity-runway | ~100-month runway (~8.3 years), net-of-FCF basis | NOK 40,980m of committed liquidity is overwhelmingly already in hand, not FCF-dependent; TTM FCF has fallen 50.5% YoY and Q1 2026 posted negative operating cash flow, a real quality wrinkle at the margin |
| coverage-and-covenants | EBITDA/interest 9.82x-10.90x; covenant headroom Not assessable | No numeric covenant threshold is disclosed anywhere for the debt that actually carries covenants (part-owned-subsidiary loans); the indicative labeled-assumption test shows wide headroom but is not a confirmed test |
| off-balance-sheet-and-contingencies | Max contingent exposure (narrow basis) NOK 7,252m vs. NOK 107,095m equity (~6.8%) | NOK 386,469m of non-cancellable purchase obligations (mostly power/alumina supply) is a downturn rigidity, not a surprise risk; the live, unquantified risk is ~NOK 3.6bn "possible" Brazil tax exposure plus active, unquantified Alunorte litigation |
| downside-stress-test | Survives 30-60% EBITDA decline with no covenant breach, no liquidity gap | Structure only breaks at a ~69-71% EBITDA collapse (indicative covenant basis); liquidity alone does not exhaust even at a full EBITDA collapse to zero for a year |

## 3. Reconciliation

- **Net-debt basis:** four different net-debt figures appear across sources for FY2025 — strict (NOK 20,489m, this module's canonical figure), broad/CIQ (NOK 12,500m), the company's own "Net debt" APM (NOK 9,669m), and the company's "Adjusted net debt" APM (NOK 18,213m). None is wrong; each nets a different set of near-cash/collateral items. `01` designated the strict basis as canonical per MODULE_RULES.md's default rule, and this synthesis follows that choice — the more conservative reading, consistent with CLAUDE.md's rule to prefer the conservative interpretation when sources differ. On the company's own broader APM, leverage looks calmer and more range-bound (0.73x on the company's cycle-average KPI); this synthesis surfaces both but leads with the conservative strict figure.
- **Leverage direction:** the strict basis shows leverage rising every period (0.49x → 1.02x); the company's own "Net debt" APM shows a rise-then-fall-then-rise pattern ending below its FY2024 peak. Reconciled view: leverage is rising on the more conservative basis and the direction should be read as a genuine, if modest, deterioration — not dismissed because a softer company metric reads calmer.
- **Covenant headroom framing vs. break point:** `04`'s indicative headroom (+263% coverage vs. +77% leverage, at current levels) reads as if coverage has far more room than leverage. `06`'s break-point analysis shows the two covenants actually break within 1-2 percentage points of each other (69.4% vs. 70.7% EBITDA decline) because coverage is linear in EBITDA while leverage is inverse in EBITDA. This is not a genuine disagreement — both are correct for the question each answers — but the break-point framing is the more decision-useful one for survival purposes and is used as the anchor number above.
- No other material disagreements between specialists.

## 3A. Fragility Map (what breaks first)

| Fragility Driver | Indicator | Current Status | Why It Matters |
|---|---|---|---|
| Maturity concentration | % due within 24m | 37.3% (NOK 13,643m); largest single year is Year 1/2026 at 22.6% | Front-loaded, but self-funded by cash alone (1.36x on the 12-month piece) — low wall risk in practice |
| Availability liquidity | usable liquidity vs uses | NOK 40,980m usable vs NOK 24,663m gross 12-month uses (1.7x); revolver commitment = availability, no borrowing base | Revolver reality is real, not headline-only — no availability haircut needed |
| Covenant illusion risk | covenant EBITDA vs reported | Unknown — no covenant-EBITDA definition disclosed anywhere; company's adjusted-EBITDA APM runs ~12.4% above reported EBITDA | If any real covenant used the company's more generous adjusted-EBITDA APM, headroom would look artificially wider than the reported-EBITDA basis used here |
| Floating-rate sensitivity | floating % net of hedges | Only 4.1% of gross debt confirmed floating (NOK 1,500m); 75.6% (NOK 27,634m) has no disclosed rate type | True floating exposure could be materially higher than the confirmed slice — a genuine rate shock could exceed the NOK 30m/+200bp impact modeled |
| Structural subordination | HoldCo debt vs upstreaming | Not applicable — centralized-treasury structure, debt issued at the parent, no HoldCo/OpCo pattern | Removes one major fragility channel other companies face |
| Contingent accelerants | CoC puts / cross-default | Not disclosed in the data pool (neither confirmed to exist nor confirmed absent) | A hidden accelerant tied to a rating downgrade or ownership change cannot be ruled out |

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No debt maturity schedule | N — a year-by-year contractual-obligations ladder (2026-2030+) is disclosed | Solvency strength | Not triggered |
| No covenant disclosure | Y — no numeric threshold for parent debt; part-owned-subsidiary covenant terms undisclosed | Covenant headroom; Overall usefulness | Covenant headroom = Not assessable; Overall usefulness capped at max 75 (applied: 75) |
| No cash flow statement | N — full annual (FY2021-2025A + LTM) and Q1 2026 cash flow statements are present | Liquidity runway | Not triggered |
| Only annual data (no interim) | N — Q1 2026 Board-approved interim report is in the pool and used throughout | Solvency strength | Not triggered |
| No EBITDA base (stress not run) | N — Adjusted and reported EBITDA both disclosed; the stress test ran on full data | Downside resilience; Overall usefulness | Not triggered |

No other cap in MODULE_RULES.md's Score Cap Rules table is triggered (no HoldCo/OpCo ambiguity, revolver availability is known, off-balance-sheet exposures are disclosed, not undisclosed). The most restrictive applicable cap — no-covenant-disclosure — governs Overall usefulness at 75.

## 5. Survival Summary

Norsk Hydro is lightly levered in absolute terms but the direction is worsening, not improving: net debt/EBITDA on the conservative strict basis has risen every period disclosed, from 0.49x (FY2023) to 1.02x on the latest trailing-twelve-month figure, driven by softening EBITDA (alumina prices down 40% year-on-year) and continued shareholder distributions rather than by new borrowing. The near-term maturity wall is self-funded, not refinancing-dependent — the 12-month piece (NOK 8,250m) is covered 1.36x by cash on hand alone, and the fuller 24-month wall is covered without touching the NOK 24,194m committed, undrawn revolver. The liquidity runway is long (~100 months on the conservative net-of-FCF basis) and the tightest covenant cannot be confirmed at all — no numeric threshold is disclosed for the parent debt that dominates the stack, and the loans that do carry real covenants (part-owned subsidiaries) have undisclosed terms, so covenant headroom is a genuine unknown rather than a comfortable number. The stress test finds the structure first breaks (on an indicative, labeled-assumption covenant basis) only at a ~69-71% EBITDA decline — a normal recession-range decline of 30-40% is comfortably survivable with no covenant breach, no liquidity gap, and no need for an equity raise, asset sale, or waiver. The one place this comfortable read could be wrong is exactly where disclosure is thinnest: the undisclosed rate type on 75.6% of the debt stack and the undisclosed covenant terms on the part-owned-subsidiary loans.

## 6. What Would Change The Solvency Verdict?

| Current Verdict | What Would Strengthen It | What Would Weaken It | Data Needed |
|---|---|---|---|
| Solid | Confirmed, disclosed covenant thresholds with wide actual headroom; a reversal of the rising strict-basis leverage trend; disclosed rate-type detail showing low true floating exposure | A confirmed tight covenant at the part-owned-subsidiary level; evidence that a large share of the undisclosed 75.6% rate-type debt is actually floating amid rising rates; a sustained (not single-quarter) negative operating cash flow trend; a large adverse ruling on the "possible" Brazil tax exposure (NOK 3.6bn) or the active Alunorte litigation | The underlying bond-trust-deed / credit-agreement covenant package for the part-owned-subsidiary loans referenced in Note 7.4; instrument-level rate-type disclosure for the 75.6% of debt currently unclassified |

## 6A. Survival Playbook (non-speculative levers)

- Dividend flexibility: the FY2026 ordinary dividend has not yet been declared; the company's own policy states share buybacks and extraordinary dividends "may supplement ordinary dividends during periods of strong financial results" — implying discretionary buybacks (NOK 856m FY2025, NOK 2,272m FY2024) can be curtailed if conditions weaken [`03_liquidity-runway.md`, §2].
- Committed, undrawn revolver capacity: NOK 24,194m (USD 1,600m + USD 800m) fully undrawn at FY2025-end, usable without a borrowing-base constraint, as a real (not speculative) liquidity backstop [`02`, §4].
- No evidenced asset-sale program, no evidenced capex-flexibility disclosure (total capex used as a proxy for maintenance capex; no maintenance/growth split disclosed), and no evidenced covenant-amendment history in this data pool — these levers are not confirmed and are not listed as available.

## 7. Note To The Final Synthesizer

- Net leverage is low in absolute terms (0.80x FY2025, 1.02x latest TTM, net debt/EBITDA, strict basis) but rising every period shown on the conservative basis — gross debt is roughly flat (NOK 36,574m FY2025 → NOK 33,754m Q1 2026) while net debt has risen (NOK 20,489m → NOK 22,503m) as cash has been used for distributions against a softening EBITDA base.
- The maturity wall (22.6% within 12 months, 37.3% within 24 months) is front-loaded but self-funded — cash on hand alone covers the 12-month piece 1.36x; refinancing is not required to clear it.
- The liquidity runway (~100 months, net-of-FCF basis) depends almost entirely on already-in-hand committed liquidity (NOK 40,980m), not on FCF holding up — even a complete stop in operating cash generation leaves ~20 months of covered runway.
- The tightest covenant is undisclosed for the debt that dominates the stack (parent-level loans have none; part-owned-subsidiary loans have unquantified covenants) — covenant headroom is Not assessable, not merely "comfortable."
- The largest live off-balance-sheet / contingent exposure is the combination of ~NOK 3.6 billion of "possible" (not provisioned) Brazilian indirect-tax disputes and active, unquantified Alunorte-related litigation (a Rotterdam damages case under appeal, Pará collective actions, and civil/criminal penalty appeals) — none of this is visible in the reported net-debt or leverage figures.
- The stress break point is an EBITDA decline of roughly 69-71% (indicative covenant basis) before any covenant breach; a normal 30-40% recession decline produces no covenant breach and no liquidity gap on any tested basis.
- Norsk Hydro is not a net-cash company on any basis shown (strict, broad, or either company APM) — it is low-leverage and liquidity-rich, which is a genuinely strong survival profile, but the strategic-flexibility read (per CLAUDE.md §24 Filter 3) applies more weakly here than it would for an actual net-cash balance sheet; do not describe it as net cash.
- One partial-data cap applied: no covenant disclosure → covenant headroom Not assessable, Overall usefulness capped at 75. No other hard cap in this module's rules was triggered.
- The single highest-value next data request: the underlying credit-agreement/trust-deed covenant package for the part-owned-subsidiary loans referenced in Note 7.4, which would convert the currently unquantifiable "some loans held by part-owned subsidiaries have financial covenants" disclosure into an actual headroom calculation.
- **Explicit handoff:** the master synthesizer's "Balance Sheet and Survival Test" section should defer to this synthesis; the stress break points here (30-60% EBITDA decline survivable with no breach; genuine break only beyond ~69-71%) are the inputs for the master's downside scenario and risk register — the master assigns probabilities, not this module.

## 8. Simple Summary

- Norsk Hydro owes about NOK 36.6 billion gross (NOK 33.8 billion at the latest Q1 2026 balance sheet) and about NOK 20.5-22.5 billion net of cash — a leverage ratio of 0.80x-1.02x net debt to earnings before interest, tax, and depreciation (EBITDA), which is low but has been rising every period shown.
- The next big bill (NOK 8.25 billion, due within 12 months) is already covered by cash on hand alone, with no need to borrow again to pay it.
- The company could run for roughly 100 months (over 8 years) on its cash, investments, and untapped credit lines before it would need any outside help, even if profit stopped covering its bills.
- We cannot say exactly how close the company is to breaking a loan covenant (a rule lenders set) because the actual threshold for the loans that carry one is not disclosed — only an estimate suggests a wide cushion.
- The biggest hidden risk sitting off the balance sheet is about NOK 3.6 billion of "possible" Brazilian tax disputes plus ongoing Brazilian environmental lawsuits, none of which are resolved or sized precisely.
- The company would survive a 30-60% drop in earnings with no broken covenant and no cash shortfall; it only breaks in a far more extreme scenario, an earnings drop of roughly 69-71%.
- Both an investment-grade credit rating (S&P BBB, Moody's Baa2, both stable) and a full debt-maturity schedule were available, so this read rests on solid ground — except for the missing covenant thresholds.
- This module is useful for the master synthesizer: the survival picture is clear and well-evidenced, with one specific, named gap (covenant thresholds) rather than a broad data shortage.
