# balance-sheet-survival Module Dossier — NHY

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `balance-sheet-survival_memo.md`.

- Generated: 2026-07-19T16:09:12Z
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



---

## balance-sheet-survival / 00_solvency-data-triage.md

_Source: `00_solvency-data-triage.md`_

# Solvency Data Triage — NHY

## 1. File Inventory

Multi-tab workbooks were pre-extracted via `.claude/tools/extract_pool.py` (already fresh in this run: 5 workbooks → 36 tabs, 45 extract files, 0 failures — see `_pool_extracts/manifest.md` / `manifest.json`). No `ciq_facts.json` sidecar exists in `_pool_extracts/`, so every Capital IQ figure below is read directly from the workbook tab extracts, not from a pinned facts file. No `data/NHY/external/` directory exists — no external documents to inventory (Section 1A below is empty by inventory, not by omission).

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| integrated-annual-report-2025.pdf | Annual filing (Norwegian statutory Integrated Annual Report, IFRS-EU) | FY2025 (year ended 31-Dec-2025) | 2026-07-18 (Drive sync date, not filing date; report approved 13-Feb-2026 per filing-date fields inside the CIQ workbook) | High — carries the debt notes (7.1 Capital management, 7.4 Short and long-term debt), Note 8.1 Financial and commercial risk management (interest-rate, credit, liquidity risk, contractual-obligations ladder), Note 4.1 (provisions & contingent liabilities), Note 11 (Guarantees), pension notes, and credit-rating disclosure |
| first-quarter-report-2026.pdf | Quarterly filing (Board-approved Quarterly Report, Oslo Børs continuing-obligations equivalent of a 10-Q/6-K) | Q1 2026 (ended 31-Mar-2026), Board-approved 28-Apr-2026 | 2026-07-18 | High — latest consolidated balance sheet and cash flow statement |
| Norsk Hydro ASA, Q1 2026 Earnings Call, Apr 29, 2026.pdf | Earnings transcript (verbatim, CIQ/S&P Global Market Intelligence) | FQ1 2026 call, 29-Apr-2026 | 2026-07-18 | Medium — management commentary on refinancing, ratings, and liquidity |
| Norsk Hydro ASA, Q4 2025 Earnings Call, Feb 13, 2026.pdf | Earnings transcript (verbatim) | FQ4 2025 / FY2025 call, 13-Feb-2026 | 2026-07-18 | Medium |
| nhy-presentation-q1-2026.pdf | Investor deck | Q1 2026, presented 29-Apr-2026 | 2026-07-18 | Low-Medium — headline figures only, not a primary debt source |
| nhy-investor-day-2025.pdf | Investor deck (strategy) | Investor Day, London, 27-Nov-2025 | 2026-07-18 | Low — capital-structure targets/ambition language, not primary debt detail |
| NorskHydroASAOBNHY_PublicCompany.pdf | Data export (Capital IQ company profile) | TTM through Mar-31-2026A + FY2026E/27E | 2026-07-18 | Medium — includes S&P/Moody's rating snapshot |
| Norsk Hydro ASA OB NHY Board Members.rtf | Data export (Capital IQ governance) | Current | 2026-07-18 | Low (out of solvency scope) |
| Norsk Hydro ASA OB NHY Customers.rtf | Data export (Capital IQ relationships) | Trailing 2 years | 2026-07-18 | Low (out of solvency scope) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Financial Data | Data export (tab) | Multi-year, comparable set | 2026-07-18 | Low (peer comp) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Trading Multiples | Data export (tab) | Current | 2026-07-18 | Low (peer comp) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Operating Statistics | Data export (tab) | Current | 2026-07-18 | Low (peer comp) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Business Description | Data export (tab) | Descriptive | 2026-07-18 | Low |
| Company Comparable Analysis Norsk Hydro ASA.xls — Implied Valuation | Data export (tab) | Current | 2026-07-18 | Low (valuation, out of module scope) |
| Company Comparable Analysis Norsk Hydro ASA.xls — Valuation Chart | Data export (tab) | Current | 2026-07-18 | Low |
| Company Comparable Analysis Norsk Hydro ASA.xls — Credit Health Panel | Data export (tab) | As-of 2026-07-18 | 2026-07-18 | High — peer-relative Overall/Operational/Solvency/Liquidity credit scores + S&P LT issuer rating for NHY and 10 peers |
| Company Comparable Analysis Norsk Hydro ASA.xls — Disclaimer | Data export (tab) | n/a | 2026-07-18 | None |
| Norsk Hydro ASA OB NHY Financials.xls — Key Stats | Data export (tab) | FY2022-FY2025A + LTM Mar-2026 + FY2026-28E | 2026-07-18 | Medium |
| Norsk Hydro ASA OB NHY Financials.xls — Income Statement | Data export (tab) | FY2021-FY2025A + LTM | 2026-07-18 | Medium (EBITDA base for coverage/leverage) |
| Norsk Hydro ASA OB NHY Financials.xls — Balance Sheet | Data export (tab) | FY2021-FY2025A + Q1 2026 | 2026-07-18 | High — debt, cash, equity, pension liability lines |
| Norsk Hydro ASA OB NHY Financials.xls — Cash Flow | Data export (tab) | FY2021-FY2025A + LTM Mar-2026 | 2026-07-18 | High — CFO, capex, debt issued/repaid, dividends, cash interest paid, levered/unlevered FCF |
| Norsk Hydro ASA OB NHY Financials.xls — Multiples | Data export (tab) | Annual | 2026-07-18 | Low |
| Norsk Hydro ASA OB NHY Financials.xls — Historical Capitalization | Data export (tab) | Quarterly, Dec-2024 to Mar-2026 | 2026-07-18 | Medium — market cap, TEV, debt/equity build |
| Norsk Hydro ASA OB NHY Financials.xls — Capital Structure Summary | Data export (tab) | FY2024, FY2025, Q1 2026 | 2026-07-18 | High — total debt, undrawn revolver, net debt, leverage ratios, 5-year fixed payment schedule, contractual-obligations ladder |
| Norsk Hydro ASA OB NHY Financials.xls — Capital Structure Details | Data export (tab) | FY2025 and FY2024 "as reported" | 2026-07-18 | High — instrument-level debt detail: type, coupon/floating rate, maturity, seniority, secured/unsecured, repayment currency |
| Norsk Hydro ASA OB NHY Financials.xls — Ratios | Data export (tab) | Annual history | 2026-07-18 | Medium |
| Norsk Hydro ASA OB NHY Financials.xls — Supplemental | Data export (tab) | Annual | 2026-07-18 | Low |
| Norsk Hydro ASA OB NHY Financials.xls — Industry Specific | Data export (tab) | Annual | 2026-07-18 | Low |
| Norsk Hydro ASA OB NHY Financials.xls — Pension OPEB | Data export (tab) | FY2020-FY2025 | 2026-07-18 | Medium — defined-benefit obligation, plan assets, funded status |
| Norsk Hydro ASA OB NHY Financials.xls — Segments | Data export (tab) | FY2020-FY2025 | 2026-07-18 | Low (asset-sale/liquidity-lever context, not solvency-primary) |
| Norsk Hydro ASA OB NHY Products.xls — Products | Data export (tab) | Current | 2026-07-18 | Low (out of solvency scope) |
| NorskHydroASAOBNHYEstimatesReport.xls — Consensus | Data export (tab) | As of Apr-29-2026 | 2026-07-18 | Low (out of solvency scope) |
| NorskHydroASAOBNHYEstimatesReport.xls — Recent Changes | Data export (tab) | Rolling | 2026-07-18 | Low |
| NorskHydroASAOBNHYEstimatesReport.xls — Guidance | Data export (tab) | FQ2 2008-FY2030 | 2026-07-18 | Low (capex guidance context only) |
| NorskHydroASAOBNHYEstimatesReport.xls — Multiples | Data export (tab) | Current | 2026-07-18 | Low |
| NorskHydroASAOBNHYEstimatesReport.xls — Surprise | Data export (tab) | Multi-quarter history | 2026-07-18 | Low |
| NorskHydroASAOBNHYEstimatesReport.xls — Trends | Data export (tab) | FQ2 2026-FY2029 | 2026-07-18 | Low |
| NorskHydroASAOBNHYEstimatesReport.xls — Revisions | Data export (tab) | FQ2 2026-FY2029 | 2026-07-18 | Low |
| NorskHydroASAOBNHYEstimatesReport (1).xls — Consensus/Recent Changes/Guidance/Multiples/Surprise/Trends/Revisions (7 tabs) | Data export (second export/refresh, not byte-identical but tab-for-tab structurally identical) | Same as above | 2026-07-18 | Low — treat as one source with the non-"(1)" file, not a corroborating independent vintage |

## 1A. External Data

No `data/NHY/external/` directory exists in the pool. No external documents (alt-data panels, expert calls, channel checks, broker research, paid-API pulls) are present. This has no effect on the sufficiency verdict.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | integrated-annual-report-2025.pdf | FY2025 (ended 31-Dec-2025), approved 13-Feb-2026 | ~6.6 since period-end |
| Quarterly filing | first-quarter-report-2026.pdf | Q1 2026 (ended 31-Mar-2026), Board-approved 28-Apr-2026 | ~3.6 since period-end |
| Debt / capital-structure export | Norsk Hydro ASA OB NHY Financials.xls — Capital Structure Details / Summary tabs | FY2025 "as reported" (source: "A 2025 filed Feb-13-2026"), plus Q1 2026 snapshot | ~3.6-6.6 |
| Fixed-income / maturities export | Norsk Hydro ASA OB NHY Financials.xls — Capital Structure Summary tab (5-yr fixed payment schedule); integrated-annual-report-2025.pdf, Note 8.1 (contractual-obligations ladder to 2030+) | FY2025 | ~6.6 |
| Cash flow statement | Norsk Hydro ASA OB NHY Financials.xls — Cash Flow tab (FY2021-2025A + LTM Mar-2026); first-quarter-report-2026.pdf (Q1 2026 statement) | LTM through Mar-2026 | ~3.6 |
| Covenant / credit-agreement disclosure | integrated-annual-report-2025.pdf, Note 7.4 ("majority of long-term loans are held by the parent company. There are no financial covenants for those loans. Some loans held by part-owned subsidiaries have financial covenants as part of the terms.") | FY2025 | ~6.6 |
| Credit rating report | integrated-annual-report-2025.pdf (S&P Global BBB stable / Moody's Baa2 stable, disclosed inline, not a standalone rating-agency report); Company Comparable Analysis Norsk Hydro ASA.xls — Credit Health Panel tab (S&P LT issuer rating snapshot, as-of 2026-07-18) | FY2025 / current | ~6.6 (filing) / current (CIQ panel) |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | Q1 2026 consolidated balance sheet [first-quarter-report-2026.pdf]; FY2025 [integrated-annual-report-2025.pdf]; FY2021-2025A+Q1 2026 [Norsk Hydro ASA OB NHY Financials.xls, Balance Sheet tab] | Debt, cash, equity base |
| Debt note (amounts by type) | Y | Note 7.4 Short and long-term debt (unsecured loans NOK 31,721m, other loans NOK 445m, lease liabilities NOK 4,305m, bank loans/overdrafts NOK 103m FY2025) [integrated-annual-report-2025.pdf, p.181-182]; instrument-level detail by type/coupon/seniority/secured [Capital Structure Details tab] | The debt stack and seniority |
| Maturity schedule | Y | Contractual-obligations table by year 2026-2030+ (long-term debt incl. interest) [integrated-annual-report-2025.pdf, Note 8.1, p.187]; "long-term debt that falls due after 2030 amounted to NOK 11,824 million" [p.~204]; 5-year fixed payment schedule (Due +1 through +5, After 5 Yrs) [Capital Structure Summary tab] | The maturity wall and refinancing exposure |
| Cash flow statement | Y | CFO, capex, debt issued/repaid, dividends, cash interest paid, levered/unlevered FCF, FY2021-2025A + LTM Mar-2026 [Norsk Hydro ASA OB NHY Financials.xls, Cash Flow tab]; Q1 2026 statement [first-quarter-report-2026.pdf] | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y | "two syndicated revolving credit facilities, USD 1,600 million maturing in November 2030 and USD 800 million maturing in November 2027... Both facilities were undrawn per year-end 2025" [integrated-annual-report-2025.pdf, p.179]; "Undrawn Revolving Credit 24,193.656" (NOK m, FY2025) [Capital Structure Summary tab] — no borrowing-base language found, so this reads as a committed (not borrowing-base) facility | True liquidity beyond cash |
| Interest expense detail | Y | Cash Interest Paid NOK 2,358m (FY2025/LTM) [Cash Flow tab]; Note 7.5 Finance income and expense referenced [integrated-annual-report-2025.pdf, p.182] | Coverage ratios |
| Covenant disclosure | Partial | "There are no financial covenants for [parent-company long-term] loans. Some loans held by part-owned subsidiaries have financial covenants as part of the terms" [integrated-annual-report-2025.pdf, Note 7.4, p.182] — directional statement only; no covenant thresholds, definitions, or headroom numbers disclosed for the subsidiary loans that do carry covenants | Headroom to a breach |
| Lease detail (operating/finance) | Y | Lease Liabilities NOK 4,305m (FY2025) / NOK 4,669m (FY2024), classified Capital Lease/Secured [Capital Structure Details tab]; Long-Term Leases line on balance sheet [Balance Sheet tab] | Debt-like obligations |
| Pension / OPEB funded status | Y | Defined-benefit obligation NOK 18,169m, plan assets NOK 20,861m FY2025 (over-funded on a DBO basis) [Pension OPEB tab]; Pension & Other Post-Retire. Benefits NOK 9,438m on balance sheet (gross/unfunded portions by jurisdiction) [Balance Sheet tab]; Net pension asset (obligation) at fair value shown in Adjusted net debt bridge [integrated-annual-report-2025.pdf, p.180] | Off-balance-sheet obligation |
| Commitments & contingencies note | Y | Note 4.1 Uncertain assets and liabilities / Contingent liabilities and contingent assets — Brazil tax cases "known cases amount to about NOK 4.3 billion, of which losses are considered possible in cases amounting to about NOK 3.6 billion"; Alunorte litigation (uncertain, unquantified); Note 11 Guarantees "Total guarantees not recognized NOK 2,952m FY2025 / NOK 3,073m FY2024" [integrated-annual-report-2025.pdf, p.171-172, 198] | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Y | "S&P Global (current rating BBB, stable outlook) and Moody's (current rating Baa2, stable outlook)" [integrated-annual-report-2025.pdf, p.178-179, 3020-3021]; S&P LT issuer rating BBB reconfirmed in peer panel [Company Comparable Analysis Norsk Hydro ASA.xls, Credit Health Panel tab, as-of 2026-07-18] | Refinancing access and cost |
| EBITDA base (for stress test) | Y | Adjusted EBITDA NOK 28,889m (2025) / NOK 26,318m (2024) [integrated-annual-report-2025.pdf, p.180]; reported EBITDA derivable from Income Statement + D&A tabs [Norsk Hydro ASA OB NHY Financials.xls]; segment EBITDA FY2020-2025 [Segments tab] | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | Operating company — integrated aluminium producer (bauxite/alumina, energy, aluminium metal, metal markets, extrusions); not a bank, insurer, or REIT. Debt is issued centrally: "the majority of long-term loans are held by the parent company" [integrated-annual-report-2025.pdf, Note 7.4, p.182] — a centralized-treasury structure, not a HoldCo/OpCo structural-subordination pattern | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | Y | Two syndicated multicurrency RCFs, USD 1,600m (matures Nov-2030) and USD 800m (matures Nov-2027), refinanced in 2025 "as sustainability linked loans," both undrawn at FY2025-end, both usable as swingline sub-facilities [integrated-annual-report-2025.pdf, p.179, 3799]; no borrowing-base mechanism disclosed — commitment amount = availability | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | N | No covenant-EBITDA definition, addback list, or addback cap disclosed anywhere in the pool — consistent with the parent-company loans (the bulk of long-term debt) carrying no financial covenants at all; the subsidiary-level covenants referenced in Note 7.4 are not defined | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | N/A (gate: not applicable) | Norsk Hydro ASA is the single listed parent; debt is centrally issued at the parent level per Note 7.4, and equity/loan funding of subsidiaries is on an arm's-length, ownership-proportional basis [integrated-annual-report-2025.pdf, p.179] — no structural-subordination pattern to map | Structural subordination and upstreaming |
| Hedging / swaps disclosure | Y | Cash-flow hedges for Alunorte/Albras Brazil currency exposure; "the bonds pay a mix of floating short-term interest and long-term fixed interest... strategy is to keep a mix of floating and fixed interest exposures on the debt" [integrated-annual-report-2025.pdf, Note 8.1, p.187]; Fixed Rate Debt NOK 7,440m vs Variable Rate Debt NOK 1,500m (FY2025) [Capital Structure Summary tab] | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | N | Not disclosed anywhere in the pool — no change-of-control put, cross-default, or rating-linked pricing-step language found in the annual report, quarterly report, or CIQ exports | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

Both the business-model module (all 12 numbered agents + `99_business-model-synthesis.md`) and the earnings module (all 8 numbered agents + `99_earnings-synthesis.md`) have completed for NHY. Downstream balance-sheet-survival agents can read cyclicality/commodity-exposure calibration, capital-allocation/leverage-trajectory context, the segment/asset base, and the EBITDA/CFO/FCF/margin trend directly from these completed modules rather than re-deriving them from the raw pool.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | Norway | "traded on the Oslo Stock Exchange (OSE) during 2025" [integrated-annual-report-2025.pdf, p.2972]; incorporated 1905 in NO [Capital IQ Public Company profile] |
| Exchange | Oslo Børs (OB:NHY); ADR also trades OTC in the US (OTCPK:NHYD.Y) | [NorskHydroASAOBNHYEstimatesReport.xls, Trends tab header] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | Other — Norwegian statutory reporting under Oslo Børs continuing obligations / the Norwegian Accounting Act; no US SEC or India SEBI-LODR filings apply | "prepared in accordance with the Norwegian Accounting Act" [integrated-annual-report-2025.pdf]; "approved by the Board of Directors on 28 April 2026" [first-quarter-report-2026.pdf, p.1] |
| Reporting standard (US GAAP / IFRS / Ind AS) | IFRS Accounting Standards as adopted by the EU (consolidated); parent-company standalone accounts under the Norwegian Accounting Act | "consolidated financial statements... prepared in accordance with IFRS® Accounting Standards as adopted by the EU" [integrated-annual-report-2025.pdf] |
| Reporting currency (USD / INR / …) | NOK (Norwegian krone), millions; fiscal year ends 31 December | "Amounts in NOK million" throughout all notes; FY2025 = year ended 31-Dec-2025 |
| Document language(s) | English (every filing, deck, transcript, and Capital IQ export in this pool is in English; no non-English source documents found) | Direct reading of all files in `_pool_extracts/` |

Downstream agents in this module should read the Norwegian statutory Integrated Annual Report (Board's Report + audited IFRS-EU consolidated financial statements + Notes, especially Note 7.1/7.4/8.1/4.1/11) as the Tier-1 debt/contingency/covenant/rating source, and the Board-approved Quarterly Report as the Tier-2 interim source, per CLAUDE.md §27 and MODULE_RULES.md's Jurisdiction-Aware Sourcing section. No US indenture or Moody's/S&P/Fitch "report" document exists as a standalone file, but the ratings themselves (S&P BBB stable, Moody's Baa2 stable) are disclosed directly inside the audited annual report — this is not a data gap; a standalone third-party rating-rationale PDF is simply not in the pool. State all figures in NOK; do not convert without stating the FX date/rate (none required here since the reporting currency is used throughout).

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N | 02, 06 | Not applicable — a year-by-year contractual-obligations ladder (2026-2030+) and a 5-year fixed payment schedule are both disclosed |
| No covenant disclosure | Y (partial) | 04, 06 | The parent-company loans (majority of long-term debt) carry no financial covenants — genuinely low covenant risk, not a gap. But the subsidiary-level loans that DO carry covenants have no disclosed threshold, definition, or headroom — covenant headroom for that slice is "Not assessable"; per Score Cap Rules, Overall usefulness capped at max 75 for that portion, and Covenant headroom score should reflect the "quality unknown" status for the subsidiary-covenant debt specifically (the parent debt itself is not covenant-constrained) |
| No cash flow statement | N | 03, 04, 06 | Not applicable — full annual (FY2021-2025A + LTM Mar-2026) and Q1 2026 cash flow statements are present, including cash interest paid |
| No undrawn-facility disclosure | N | 03 | Not applicable — both RCFs' full commitment amounts (USD 1,600m + USD 800m) are disclosed as fully undrawn at FY2025-end, with no borrowing-base mechanism, so the full commitment counts as availability |
| No interest-expense detail | N | 04 | Not applicable — Cash Interest Paid (NOK 2,358m FY2025/LTM) is disclosed directly in the Cash Flow tab |
| No EBITDA base | N | 06 | Not applicable — Adjusted EBITDA (NOK 28,889m FY2025) is disclosed in Note 7.1, and reported EBITDA/segment EBITDA are derivable from the Income Statement and Segments tabs |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has a recent audited annual filing (FY2025 Integrated Annual Report, IFRS-EU, ~6.6 months old) with instrument-level debt notes, a year-by-year maturity/contractual-obligations ladder, a full cash flow statement (annual and Q1 2026), disclosed committed-and-undrawn revolving facilities, disclosed credit ratings (S&P BBB / Moody's Baa2), a quantified contingent-liabilities note (Brazil tax cases, Alunorte litigation, guarantees), and an EBITDA base for the stress test — clearing all three legs of the Sufficient rule (balance sheet + debt note + cash flow statement).
- **Sections that can run:** capital structure, maturity wall, liquidity, coverage/covenants (with a partial-data flag on the subsidiary-level covenant slice only), contingencies, stress test.
- **Active partial-data caps:** None hard-triggered at the module level. One targeted note: covenant headroom for the (undisclosed-threshold) subsidiary-level covenant debt is "Not assessable" and should be labeled as such by `04_coverage-and-covenants`; this does not cap the parent-level (majority) debt, which is affirmatively disclosed as covenant-free.
- **Critical missing items:** No standalone third-party rating-agency rationale document (the ratings themselves are disclosed inline in the audited filing, so this is a minor completeness gap, not a sufficiency gap). No change-of-control / cross-default / rating-trigger language found anywhere in the pool — flag as "Not disclosed in the data pool" per MODULE_RULES.md's Structural Priority & Entity Mapping hard rule, rather than assuming absence of such clauses.
- **Single highest-value missing document:** The underlying bond-trust-deed / RCF credit-agreement covenant package for the subsidiary-level loans referenced in Note 7.4 — this would convert the currently un-quantifiable "some loans held by part-owned subsidiaries have financial covenants" disclosure into an actual headroom calculation.



---

## balance-sheet-survival / 01_capital-structure-and-leverage.md

_Source: `01_capital-structure-and-leverage.md`_

# Capital Structure & Leverage — NHY

Reporting currency: **Norwegian krone (NOK), millions**, unless stated otherwise. Norsk Hydro ASA (Oslo Børs: NHY) reports under IFRS Accounting Standards as adopted by the EU, fiscal year ended 31 December [Integrated Annual Report 2025, p.140]. This is not a US SEC or India SEBI-LODR filer; the local-equivalent documents used here are the Board-approved Integrated Annual Report 2025 (the 10-K/annual-filing equivalent, approved 13-Feb-2026) and the Board-approved First Quarter Report 2026 (the 10-Q equivalent, approved 28-Apr-2026), per `00_solvency-data-triage.md` §4A. Norsk Hydro is an operating industrial company (integrated aluminium producer), not a bank, insurer, or REIT — the standard debt/EBITDA and leverage framework applies (MODULE_RULES.md, Business Type Applicability Gate).

**Basis note (read before the tables):** Three different "net debt" numbers appear across sources for the same date, and none is wrong — they use different definitions. This report designates ONE as canonical for downstream agents (§4, §7) and shows the others labelled for reconciliation.

## 1. Debt Stack

FY2025 (year-end 31-Dec-2025) instrument-level detail, sourced from the Capital IQ workbook's "Capital Structure Details" export and cross-tied to the audited Note 7.4 aggregate. The audited note discloses debt in three aggregate lines (unsecured loans NOK 31,721m, other loans NOK 445m, lease liabilities NOK 4,305m) plus bank loans/overdrafts NOK 103m tracked separately as short-term debt, for a total of NOK 36,574m [Integrated Annual Report 2025, Note 7.4 (Short and long-term debt), p.181-182]. The Capital IQ export decomposes the "unsecured loans" aggregate into named bond series and term loans (bonds, green bond, sustainability-linked instruments) — this decomposition is **not itself in the audited note**, which only names bond listings in prose ("five bonds in NOK... three bonds in EUR...") without per-bond amounts; the CIQ split is used here for granularity because the two sources' **totals** tie out exactly (36,574 = 36,471 audited "Outstanding debt" + 103 audited "Bank loans and overdraft facilities" = CIQ "Total Debt Outstanding" 36,574), and is flagged as vendor-sourced at the instrument-detail level.

| Instrument | Amount (NOK m) | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Bank loans and overdraft facilities | 103 | Parent (centralized treasury) | No | Senior | None | 2026-12-31 | Not disclosed | [Norsk Hydro ASA OB NHY Financials.xls, Capital Structure Details tab; Integrated Annual Report 2025, Note 7.4, p.181] |
| Bonds (NOK) | 7,000 | Parent | No | Senior | None | Not disclosed at instrument level (part of NOK-bond series maturing through the 5-yr schedule, §2 of `02`) | Fixed (rate not disclosed at instrument level) | [Capital Structure Details tab] |
| Bonds (NOK) | 200 | Parent | No | Senior | None | Not disclosed | Fixed (rate not disclosed) | [Capital Structure Details tab] |
| European Green Bond | 5,940 | Parent | No | Senior | None | Not disclosed | Fixed, 3.750% | [Capital Structure Details tab] — repayment currency EUR, NOK-equivalent shown |
| Sustainability Linked Bond (floating) | 1,500 | Parent | No | Senior | None | 2028-11-30 | Floating, 3-month NIBOR + 2.000% | [Capital Structure Details tab] |
| Sustainability Linked Bond (fixed) | 1,500 | Parent | No | Senior | None | 2028-11-30 | Fixed, 5.257% | [Capital Structure Details tab] |
| Sustainability Linked Loan (USD) | 2,016 | Parent | No | Senior | None | 2029 | Not disclosed | [Capital Structure Details tab] — repayment currency USD, NOK-equivalent shown |
| Other loans | 445 | Parent/subsidiaries (unspecified) | No | Senior | None | Not disclosed | Not disclosed | [Capital Structure Details tab; Note 7.4] |
| Unsecured loans (residual, CIQ decomposition) | 17,764 | Parent (per Note 7.4: "majority of long-term loans are held by the parent company") | No | Senior | None | Not disclosed at instrument level | Not disclosed | [Capital Structure Details tab] |
| Multicurrency Syndicated RCF #1 | 0 drawn (USD 1,600m committed) | Parent | No | Senior | None (shared, unsecured) | 2030-11-01 | n/a — undrawn | [Integrated Annual Report 2025, p.179; Capital Structure Details tab] |
| Multicurrency Syndicated RCF #2 | 0 drawn (USD 800m committed) | Parent | No | Senior | None (shared, unsecured) | 2027-11-01 | n/a — undrawn | [Integrated Annual Report 2025, p.179] |
| Finance/capital leases (lease liabilities) | 4,305 | Consolidated group | **Yes** | Senior | Leased assets | Various (not itemised) | Not disclosed | [Capital Structure Details tab, classified "Capital Lease/Secured"; Note 7.4, p.181] |
| CIQ reconciling "Total Adjustments" (FX/discount/other, unexplained in workbook) | −4,199 | n/a | n/a | n/a | n/a | n/a | n/a | [Capital Structure Summary tab, "Total Adjustments" row] |
| **Total gross debt (FY2025)** | **36,574** | | | | | | | [Capital Structure Summary tab, "Total Debt Outstanding"; ties to Integrated Annual Report 2025, Note 7.4: 36,471 "Outstanding debt" + 103 "Bank loans and overdraft facilities" = 36,574] |

Memo — FY2024 comparison: Total gross debt NOK 34,748m [Balance Sheet tab; Note 7.4]. Of FY2025's NOK 36,574m, NOK 8,149m is classified current/short-term (bank loans NOK 103m + current portion of long-term debt NOK 8,046m) and NOK 28,425m is long-term (incl. lease liabilities) [Integrated Annual Report 2025, Note 7.4, p.181].

**Seniority/security:** Every instrument disclosed is **senior**; only the lease liabilities (NOK 4,305m, 11.8% of gross debt) are secured (by the leased assets themselves). All bonds, term loans, and the revolver are senior **unsecured**. Note 7.4 states: "the majority of long-term loans are held by the parent company. There are no financial covenants for those loans. Some loans held by part-owned subsidiaries have financial covenants as part of the terms" [Integrated Annual Report 2025, p.182] — the identity, amount, and covenant terms of those subsidiary-level loans are **not disclosed** in the data pool (covenant-headroom implications belong to `04_coverage-and-covenants`, not this agent).

**Change-of-control / cross-default clauses:** Not disclosed in the data pool.

## 2. Other Debt-Like Obligations

| Obligation | Amount (NOK m) | Treatment | Source |
|---|---:|---|---|
| Operating leases | Already capitalized — see Section 1 | Hydro reports under **IFRS**, which requires capitalizing substantially all leases (IFRS 16) onto the balance sheet as a right-of-use asset and a lease liability. There is no separate off-balance-sheet "operating lease" pool left to add — the NOK 4,305m "Lease Liabilities" line in Section 1 already is the full lease obligation. | [Integrated Annual Report 2025, Note 7.4, p.181 (Lease liabilities NOK 4,305m); Norsk Hydro ASA OB NHY Financials.xls, Balance Sheet tab, "Long-Term Leases" row] |
| Pension / OPEB | Defined-benefit obligation (DBO) NOK 18,169m; plan assets NOK 20,861m; **group-level plan assets exceed the DBO by NOK 2,692m** (a funding surplus on a global aggregate basis) | IFRS does not allow netting an overfunded plan in one jurisdiction against an underfunded plan in another. The balance sheet therefore separately recognizes a **pension asset** of NOK 10,563m (long-term assets, overfunded plans, mainly domestic) and a **pension/OPEB liability** of NOK 9,438m (long-term liabilities, underfunded plans) — these do not net to the plan-level surplus figure once other adjustments (actuarial items, non-Norwegian plans) are folded in; the net recognized position on the balance sheet is +NOK 1,661m [Pension OPEB tab]. Treat the NOK 9,438m liability line as the debt-like obligation that reduces net-debt-equivalent capacity; the NOK 10,563m asset is a separate, plan-specific item, not fungible cash. | [Norsk Hydro ASA OB NHY Financials.xls, Pension OPEB tab, FY2025 column; Balance Sheet tab, "Pension & Other Post-Retire. Benefits" row = NOK 9,438m] |
| Preferred equity | None | Not disclosed / none outstanding | [Norsk Hydro ASA OB NHY Financials.xls, Historical Capitalization tab, "Pref. Equity" row = "-" for all periods shown] |

## 3. Cash & Liquid Assets

| Item | Amount (NOK m, FY2025) | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | 16,085 | Partially — of the NOK 16,085m cash position, **NOK 4.7 billion was outside Hydro's group cash-pooling arrangements at year-end 2025, mainly in Brazil** [Integrated Annual Report 2025, Note 7.2, p.181]. This is not formally "restricted" cash under IFRS, but it is not centrally poolable for group liquidity purposes — flag as a soft trapped-cash signal, not a hard restriction. | [Integrated Annual Report 2025, Note 7.2, p.181; Balance Sheet tab] |
| Short-term investments | 10,600 (audited, Note 7.3) — of which NOK 2,611m is "collateral accounts and other" (cash pledged mainly against derivative positions, not freely available) | The NOK 2,611m collateral-accounts component is functionally restricted (posted against derivatives). Hydro's own "Adjusted net debt" APM (§4) explicitly nets out collateral for short/long-term liabilities (NOK 2,848m combined FY2025) as unavailable-for-debt-service. | [Integrated Annual Report 2025, Note 7.3 (Short-term investments), p.181] |
| Cash & short-term investments in captive insurance company (Industriforsikring AS) | 1,267 | **Restricted in substance** — Hydro's own disclosure states this cash "is assumed to not be available to service or repay future Hydro debt" and is excluded from the company's Adjusted net debt measure. | [Integrated Annual Report 2025, "Adjusted net debt" note, p.180, footnote 3] |
| Collateral for long-term liabilities (added back as available in the company's "Net debt" APM) | 220 | Small, offsetting item | [Integrated Annual Report 2025, "Adjusted net debt" note, p.180] |

**Classification note:** Capital IQ's own "Short Term Investments" field for FY2025 (NOK 7,989m) is NOK 2,611m lower than the audited Note 7.3 figure (NOK 10,600m) — the gap is exactly the "collateral accounts and other" component, which CIQ appears to classify outside short-term investments (likely folded into other current-asset lines). Both figures reconcile once this component is accounted for; this is a classification difference, not an extraction error. At Q1 2026, CIQ's figure (NOK 9,413m) matches the company's own disclosed short-term investments exactly, so the gap is FY2025-specific. [Cross-checked: Norsk Hydro ASA OB NHY Financials.xls, Balance Sheet tab vs Integrated Annual Report 2025, Note 7.3, p.181; First Quarter Report 2026, "Adjusted net debt" table, p.24]

## 4. Gross & Net Debt

| Metric | Value (NOK m, FY2025) | Source |
|---|---:|---|
| Gross debt | 36,574 | [Section 1; Integrated Annual Report 2025, Note 7.4; Capital Structure Summary tab] |
| − Cash & equivalents | 16,085 | [Integrated Annual Report 2025, Note 7.2; Balance Sheet tab] |
| **Net debt (strict, §15 — canonical basis for this module, see designation below)** | **20,489** | Derived: 36,574 − 16,085 |
| − Short-term investments (CIQ classification, netting only the non-collateral portion, NOK 7,989m) | 7,989 | [Balance Sheet tab] |
| **Net debt (broad, incl. investments — CIQ basis)** | **12,500** | [Capital Structure Summary tab, "Net Debt" row — ties exactly to Gross debt (36,574) − Total Cash & ST Investments (24,074)] |

**Memo — company-defined APMs (shown for reconciliation, NOT used as this module's canonical figure, since each uses additional definitional adjustments beyond the standard strict/broad bases):**

- Hydro's own "**Net debt**" APM (= cash + full short-term investments incl. collateral accounts + collateral for long-term liabilities, less short- and long-term interest-bearing debt) = **NOK 9,669m** FY2025 (down from NOK 15,976m FY2024) [Integrated Annual Report 2025, "Adjusted net debt" note, p.180].
- Hydro's own "**Adjusted net debt**" APM (as above, further netting out collateral-for-liabilities, captive-insurance cash, net pension position, and provisions net of tax) = **NOK 18,213m** FY2025 (down from NOK 24,066m FY2024) [same source].
- These two company APMs are lower than this module's strict basis and (in the "Net debt" APM's case) lower than the broad/CIQ basis too, because they credit additional near-cash items (the collateral-accounts portion of short-term investments, and small collateral-for-liabilities add-backs) that this module's standard bases do not net in.

**Canonical designation:** Per MODULE_RULES.md's default rule ("strict by default; broad only with a stated reason"), this report designates the **strict basis (NOK 20,489m)** as the canonical net-debt figure for downstream agents in this module. No company-specific reason overrides the default here — short-term investments are real and largely liquid (time deposits, debt securities), but crediting them is exactly the general case the default rule is built for, not a special exception. Downstream agents should still be aware that on a broader (CIQ or company-APM) basis, net leverage reads meaningfully lower — this gap is material and is carried forward explicitly in §7.

## 5. Leverage Ratios

EBITDA base: **company-reported (audited) EBITDA**, FY2025 = NOK 25,696m; **adjusted EBITDA** (company APM), FY2025 = NOK 28,889m (+NOK 3,193m adjustment, mostly non-cash unrealized LME-linked derivative timing gains and rationalization/closure costs) [Integrated Annual Report 2025, p.36, "Other performance measures" table]. Per `earnings/01_historical-financials.md`, the Capital IQ workbook's own "EBITDA"/"EBIT" fields for Hydro (e.g., FY2025 "EBITDA" 51,454) do **not** reconcile to the audited figures and are not used anywhere in this report — a template/extraction mismatch flagged by the earnings module, not a real economic item.

| Ratio | On Reported EBITDA | On Adjusted EBITDA | Source |
|---|---:|---:|---|
| Gross debt / EBITDA | 1.42x (36,574 / 25,696) | 1.27x (36,574 / 28,889) | Derived from §1, §5 EBITDA figures |
| Net debt / EBITDA (**canonical, strict basis, NOK 20,489m**) | 0.80x (20,489 / 25,696) | 0.71x (20,489 / 28,889) | Derived |
| Net debt / EBITDA (broad basis, NOK 12,500m — memo, not canonical) | 0.49x (12,500 / 25,696) | 0.43x (12,500 / 28,889) | Derived |
| Debt / capital (Total debt ÷ [Total debt + Total equity incl. minority]) | 25.5% (36,574 / 143,669) | n/a | [Capital Structure Summary tab, "Total Debt" row = 0.254571 of Total Capital — ties exactly] |
| Debt / equity (Total debt ÷ Total common equity, NOK 99,843m) | 36.6% | n/a | Derived; on total equity incl. minority interest (NOK 107,095m) the ratio is 34.2% |

**Company's own headline leverage KPI (shown for context, not this module's basis):** Hydro targets **average Adjusted net debt / Adjusted EBITDA below 2.0x over the cycle**, with a targeted Adjusted net debt of around NOK 25 billion [Integrated Annual Report 2025, p.180]. On this company-defined basis (average Adjusted net debt NOK 21,051m ÷ Adjusted EBITDA NOK 28,889m), FY2025's ratio is **0.73x** [Integrated Annual Report 2025, Note 7.1, p.181] — comfortably inside the company's own 2.0x ceiling, but this measure uses a materially smaller numerator (average, further-adjusted net debt) than this module's canonical strict basis above; the two are not interchangeable.

**Cyclicality (per `business-model/07_business-quality.md` and `10_external-dependency.md`): Norsk Hydro is flagged as an extremely cyclical, price-taking commodity aluminium producer** — group ROE swung from 24.9% (2022, a post-COVID price-spike peak) to 2.6% (2023, the trough) and back to 7.7% (2025), which the business-model module reads as "roughly mid-cycle," not a peak or trough [`business-model/07_business-quality.md`]. Reported EBITDA is only disclosed for FY2023–FY2025 in this data pool (FY2021–FY2022 not available); the 3-year average is NOK 25,177m, essentially in line with FY2025's own NOK 25,696m — consistent with the mid-cycle read (no material peak/mid-cycle gap is visible in the years available, unlike a company currently sitting at a clear price-spike high).

| Leverage basis | Net debt / EBITDA |
|---|---:|
| Latest year (FY2025 reported EBITDA, NOK 25,696m) | 0.80x |
| 3-yr average / normalised (FY2023–FY2025 reported EBITDA, NOK 25,177m — the only years with disclosed reported EBITDA in this pool) | 0.81x |

Both readings use the canonical strict net debt of NOK 20,489m. The near-identical result reflects the mid-cycle positioning noted above — this is NOT evidence that Hydro is immune to the cycle; it means FY2025 itself is not an outlier high (peak) EBITDA year, so this particular normalisation does not reveal hidden leverage the way it would for a company reporting at a price-spike peak. A genuine trough scenario (2023-level ROE) is tested by `06_downside-stress-test`, not here.

## 6. Leverage Trend

All net-debt figures below use the strict basis (canonical). Reported EBITDA (annual, company-disclosed); "Latest" column uses the TTM reported EBITDA (four quarters ended 31-Mar-2026) from `earnings/01_historical-financials.md`.

| Metric | FY2023 | FY2024 | FY2025 | Latest (Q1 2026 balance sheet / TTM EBITDA) | Direction |
|---|---:|---:|---:|---:|---|
| Gross debt | 36,089 | 34,748 | 36,574 | 33,754 | Roughly flat, no clear trend |
| Net debt (strict basis) | 11,471 | 19,699 | 20,489 | 22,503 | **Rising** |
| Reported EBITDA (annual) / TTM (latest) | 23,291 | 26,543 | 25,696 | 21,976 (TTM) | Falling (latest) |
| Net debt (strict) / EBITDA | 0.49x | 0.74x | 0.80x | 1.02x (TTM) | **Rising** |

Memo — company's own "Net debt" APM tells a directionally similar but less alarming story: NOK 8,191m (FY2023, per `earnings/01_historical-financials.md`) → NOK 15,976m (FY2024) → NOK 9,669m (FY2025) → NOK 12,860m (Q1 2026) — a rise, then a fall, then a rise again, ending at a level below FY2024's peak. [Integrated Annual Report 2025, p.180; First Quarter Report 2026, p.24]

**Is leverage rising or falling, and why?** On this module's canonical (strict) basis, net leverage has risen every period shown: 0.49x (FY2023) → 0.74x (FY2024) → 0.80x (FY2025) → 1.02x (TTM through Q1 2026) — driven by a combination of (1) a shift in the cash/short-term-investment mix that this basis does not credit as offsetting debt, (2) continued shareholder distributions (buybacks of NOK 686m LTM plus an ongoing floor dividend) even as EBITDA has softened, and (3) the TTM EBITDA decline itself (−14.5% versus FY2025) on falling alumina prices (Q1 2026 revenue −11.7% YoY on a 40% YoY drop in the alumina price index) [`earnings/01_historical-financials.md`, §2, §6; `first-quarter-report-2026.pdf`, p.9]. On the broader company-APM basis the picture is calmer (leverage stayed inside the company's own sub-1x range throughout, per §5), because that basis credits Hydro's larger short-term-investment and collateral balances as available liquidity — a real difference in interpretation that downstream agents should carry forward, not average away.

## 6A. HoldCo / OpCo & Structural Subordination

Not applicable — no material HoldCo-level debt indicated. Norsk Hydro ASA is a single listed parent; per Note 7.4, "the majority of long-term loans are held by the parent company," and funding of subsidiaries, associates, and joint arrangements is done "on an arm's length basis," proportional to Hydro's ownership share [Integrated Annual Report 2025, p.179, 182]. This is a centralized-treasury structure (debt issued at the parent and passed down as intercompany loans/equity), not a HoldCo/OpCo structure with structural subordination risk. The only entity-level nuance worth flagging: some loans held by **part-owned subsidiaries** carry financial covenants not disclosed at the parent level (§1) — this is a covenant-disclosure gap for `04_coverage-and-covenants`, not a structural-subordination issue for this section.

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Reporting currency:** NOK (Norwegian krone), millions. Fiscal year ended 31-Dec-2025 for the primary balance sheet used here; latest available balance sheet is 31-Mar-2026 (Q1 2026).
- **Gross debt:** NOK 36,574m (FY2025, audited-tied). [Integrated Annual Report 2025, Note 7.4, p.181; Norsk Hydro ASA OB NHY Financials.xls, Capital Structure Summary tab]
- **Net debt — canonical (strict basis, §15 default):** NOK 20,489m (= gross debt NOK 36,574m − cash & equivalents NOK 16,085m only). This is the figure downstream agents (`02`, `03`, `04`, `06`) should use unless they state an explicit reason to switch.
  - Broad basis (nets in liquid short-term investments, CIQ classification): NOK 12,500m — shown alongside, labelled, not canonical.
  - Company's own "Net debt" APM (further nets collateral items): NOK 9,669m — memo only, company-specific definition.
  - Company's own "Adjusted net debt" APM (further nets pension/provisions, excludes captive-insurance cash): NOK 18,213m — memo only.
- **Cash & liquid investments:** Cash & equivalents NOK 16,085m + short-term investments NOK 10,600m (audited) = NOK 26,685m total liquid assets. Of this, ~NOK 4.7bn cash sits outside group cash-pooling (mainly Brazil), and NOK 2,611m of short-term investments is collateral posted against derivatives — both flagged as reduced-availability, not fully "restricted." [§3]
- **EBITDA base used:** **Reported (audited) EBITDA, NOK 25,696m, FY2025** — used as the primary base. Adjusted EBITDA (company APM) is NOK 28,889m, FY2025. Cycle position: **mid-cycle / latest, not peak or trough**, per `business-model/07_business-quality.md` (FY2025 ROE 7.7% vs 2022 peak 24.9% and 2023 trough 2.6%); the only available 3-year normalised reported-EBITDA average (FY2023–FY2025, NOK 25,177m) is close to the FY2025 figure itself, so no material peak-vs-mid-cycle adjustment is available from this data pool (a genuine trough is modelled separately in `06_downside-stress-test`). Note the latest TTM reported EBITDA (through Mar-2026) is materially lower, NOK 21,976m (−14.5% vs FY2025) — flag this decline to downstream agents as the most current run-rate.
- **Net debt / EBITDA (canonical net debt, NOK 20,489m):** 0.80x on reported EBITDA (25,696); 0.71x on adjusted EBITDA (28,889). Using the latest TTM reported EBITDA (21,976) instead of FY2025, the ratio rises to ~0.93x — flagged as the more current (if not yet audited-annual) read.
- **Caveat for downstream agents:** the leverage read is basis-sensitive here. On this module's canonical strict basis, net leverage has risen in every period shown (0.49x FY2023 → 1.02x latest TTM) and sits close to 1x. On the company's own broader APMs, leverage is lower (0.7x–0.9x on the company's disclosed average Adjusted net debt/Adjusted EBITDA) and has been more range-bound. Both are cited in this report (§4–§6); use the canonical strict figures above unless a specific downstream need (e.g., matching a rating agency's or covenant's own definition) requires the broader basis, in which case state that reason explicitly.
- **Net cash / net debt status:** Norsk Hydro is **net debt on every basis shown** (strict, broad, and both company APMs) — it is not a net-cash company at FY2025 or Q1 2026. Net leverage nonetheless remains low in absolute terms (well under 1.0x-1.5x on any basis) relative to the company's own 2.0x-over-the-cycle ceiling, and the company holds NOK 24.2bn of undrawn, committed revolving credit as of FY2025-end [Integrated Annual Report 2025, p.179] — this liquidity detail belongs to `03_liquidity-runway`, not this section, and is noted here only for completeness of the anchor.



---

## balance-sheet-survival / 02_maturity-wall-and-refinancing.md

_Source: `02_maturity-wall-and-refinancing.md`_

# Maturity Wall & Refinancing — NHY

Reporting currency: **Norwegian krone (NOK), millions**, unless stated otherwise. This report reuses `01_capital-structure-and-leverage.md`'s canonical gross debt of NOK 36,574m (FY2025, year-end 31-Dec-2025), which is tied exactly to the audited Note 7.4 total (Integrated Annual Report 2025, p.181-182: unsecured loans 31,721 + other loans 445 + lease liabilities 4,305 + bank loans/overdrafts 103 = 36,574) and to the Capital IQ workbook's "Total Debt Outstanding" line. The maturity schedule below is anchored to the same FY2025 balance sheet date; it is therefore **~6.6 months old as of this report's date (2026-07-19)**, and roughly half of the nominal "Year 1" (calendar 2026) window has already elapsed. The Q1 2026 balance sheet shows gross debt down to NOK 33,754m and short-term borrowings up to NOK 5,102m — consistent with continued amortization — but the Capital IQ workbook does not carry a year-by-year maturity split at Q1 2026 (the "Fixed Payment Schedule" columns for Mar-2026 are blank), so the FY2025 schedule remains the only year-by-year breakdown available in this data pool.

## 1. Maturity Schedule

| Period | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (Year 1 / 2026) | NOK 8,250m | 22.6% | Bank loans and overdraft facilities (NOK 103m, matures 2026-12-31) + current portion of long-term debt/leases (remainder — instrument mix not broken out at year level). Note: the audited balance sheet's own "short-term debt" total for FY2025 is NOK 8,149m (bank loans NOK 103m + current portion of long-term debt NOK 8,046m) — NOK 101m (0.3% of gross debt) below this CIQ schedule figure. This is an unreconciled vendor-classification gap, flagged not resolved. | [Norsk Hydro ASA OB NHY Financials.xls, Capital Structure Summary tab, "LT Debt (Incl. Cap. Leases) Due +1"; cross-check Integrated Annual Report 2025, Note 7.4, p.181] |
| Year 2 (2027) | NOK 5,393m | 14.7% | Instrument mix not broken out by year beyond Year 1. Multicurrency Syndicated RCF #2 (USD 800m committed, undrawn) matures 2027-11-01 and sits in this window but contributes NOK 0 to this figure since it is undrawn. | [Capital Structure Summary tab; Integrated Annual Report 2025, p.179] |
| Year 3 (2028) | NOK 5,591m | 15.3% | Includes the two Sustainability Linked Bonds (NOK 3,000m combined face — NOK 1,500m fixed at 5.257%, NOK 1,500m floating at 3-month NIBOR + 2.000%), both maturing 2028-11-30 — the only instrument-level maturity confirmed to fall in this bucket. | [Capital Structure Summary tab; Capital Structure Details tab; Integrated Annual Report 2025, Note 7.4] |
| Year 4 (2029) | NOK 4,027m | 11.0% | Includes Sustainability Linked Loan – USD (NOK 2,016m equivalent), maturing 2029. | [Capital Structure Summary tab; Capital Structure Details tab] |
| Year 5 (2030) | NOK 2,129m | 5.8% | Multicurrency Syndicated RCF #1 (USD 1,600m committed, undrawn) matures 2030-11-01 and sits in this window but contributes NOK 0 (undrawn). No other instrument confirmed maturity in this bucket from the data pool. | [Capital Structure Summary tab; Integrated Annual Report 2025, p.179] |
| Thereafter (2031+) | NOK 11,185m | 30.6% | Bulk of the NOK 17,764m "unsecured loans" residual (instrument-level maturity not disclosed) and the undated NOK bonds (NOK 7,200m combined face) likely sit substantially in this bucket. Norsk Hydro ASA's own parent-company **standalone** accounts separately disclose NOK 11,824m of parent-level long-term debt falling due after 2030 [Note 12, p.219] — a different scope (parent-only vs. consolidated group) but close enough (NOK 639m / ~5.4% relative gap) to corroborate this consolidated figure directionally, not to confirm it exactly. | [Capital Structure Summary tab; Integrated Annual Report 2025, Note 12 (Norsk Hydro ASA standalone accounts), p.219] |
| **Total** | **NOK 36,574m** | **100%** | Ties exactly to `01`'s canonical gross debt figure. | [`01_capital-structure-and-leverage.md`, §1, §7] |

Cross-reference (undiscounted, principal + interest, consolidated group — a different table used for liquidity-risk disclosure, not directly comparable to the principal-only schedule above): the audited Note 8.1 "Long-term debt incl. interest" cash-flow ladder shows NOK 9,712m (2026), 6,348m (2027), 6,581m (2028), 4,740m (2029), 2,506m (2030), and NOK 13,167m thereafter, total NOK 43,053m [Integrated Annual Report 2025, p.187]. The higher near-term figures there (vs. the principal-only schedule) reflect embedded interest cash flows, not a larger principal wall.

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) | ~4.2 years (base case) — **Inference, not from filings**, for the "thereafter" bucket's average tenor. Computed as Σ(bucket amount × bucket year)/total gross debt, using year 1–5 = 1–5 and assuming an 8-year average tenor for the "thereafter" (2031+) bucket (a placeholder, since no instrument-level dates exist beyond 2030 in this pool). Sensitivity: WAM ranges from ~3.9 years (7-year "thereafter" assumption) to ~4.8 years (10-year assumption) — material sensitivity to this one unobservable input, so treat 4.2 years as indicative, not precise. |
| % due within 12 months | 22.6% (NOK 8,250m / NOK 36,574m) |
| % due within 24 months | 37.3% (NOK 13,643m / NOK 36,574m — Year 1 + Year 2) |
| % due within 36 months | 52.6% (NOK 19,234m / NOK 36,574m — Year 1 + Year 2 + Year 3) |
| Largest single maturity year (and amount) | Year 1 / 2026: NOK 8,250m (22.6% of gross debt) — the largest **single named year**. The "thereafter" (2031+) bucket is larger in aggregate (NOK 11,185m, 30.6%) but spans an unspecified number of years beyond the 5-year horizon, so it is not a single-year spike. |

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share (disclosed) | 20.3% of gross debt (NOK 7,440m: European Green Bond NOK 5,940m at 3.750% + Sustainability Linked Bond fixed tranche NOK 1,500m at 5.257%) | [Capital Structure Details tab; Capital Structure Summary tab, "Fixed Rate Debt" row] |
| Floating-rate share (disclosed) | 4.1% of gross debt (NOK 1,500m: Sustainability Linked Bond floating tranche, 3-month NIBOR + 2.000%) | [Capital Structure Details tab; Capital Structure Summary tab, "Variable Rate Debt" row] |
| Rate type not disclosed | 75.6% of gross debt (NOK 27,634m: bank loans/overdrafts NOK 103m, NOK bonds NOK 7,200m combined, other loans NOK 445m, Sustainability Linked Loan – USD NOK 2,016m, unsecured loans residual NOK 17,764m, and lease liabilities NOK 4,305m — none of these instruments carry a disclosed coupon or floating-rate basis in the Capital IQ instrument export or the audited notes) | [Capital Structure Details tab, "Coupon/Base Rate" and "Floating Rate" columns = "NA" for these rows] |
| Weighted-average coupon (contractual, instrument-level) | Not computable — 75.6% of the debt stack has no disclosed rate. Only three instruments (24.4% of gross debt) carry a disclosed rate: Green Bond 3.750%, SLB fixed 5.257%, SLB floating 3m NIBOR + 2.000%. | [Capital Structure Details tab] |
| Implied all-in cost of debt (proxy) | ~6.4%–6.6% (Cash Interest Paid NOK 2,358m, FY2025/LTM, ÷ gross debt: 6.45% on FY2025 year-end debt NOK 36,574m; 6.61% on the FY2024–FY2025 average debt NOK 35,661m). Used as a proxy for the weighted-average coupon since the instrument-level rate is undisclosed for most of the stack; not a contractual figure. | [Norsk Hydro ASA OB NHY Financials.xls, Cash Flow tab, "Cash Interest Paid"; `01_capital-structure-and-leverage.md`, §1, §6] |
| Current market refi rate (matching tenor, by currency) | NOK 5-year: Norway 5Y government bond yield ~4.53% (17-Jul-2026) + an indicative BBB corporate spread of ~100–125bps ≈ **5.5%–5.8%**. EUR 5-year: Germany 5Y Bund yield ~2.60% (30-Jun-2026) + ~100–125bps ≈ **3.6%–3.85%**. USD 5-year: US 5Y Treasury yield ~4.28% (17-Jul-2026) + ~100–125bps ≈ **5.3%–5.5%**. 3-month NIBOR could not be sourced directly; proxied via the unchanged Norges Bank policy rate of 4.25% (since 07-May-2026) plus a typical ~15–25bps NIBOR-to-policy-rate spread ≈ **~4.4%–4.5%**, implying the existing SLB floating tranche's current effective rate is roughly 6.4%–6.5% (NIBOR + 2.000%). | Web: Norway 5Y govt yield, TradingView/Investing.com, 2026-07-19 (indicative, unverified); Web: Germany 5Y Bund, TradingEconomics, 2026-06-30 (indicative, unverified); Web: US 5Y Treasury, 2026-07-17 (indicative, unverified); Web: Norges Bank policy rate 4.25%, press release 2026-05-07, held 2026-06-17 (indicative, unverified); BBB spread ~100bps context from ICE BofA BBB US Corporate Index OAS commentary, 2026 (indicative, unverified, US-market proxy applied to NOK/EUR without confirmation it holds in those markets) |
| Estimated refi cost step-up (bps) | Mixed picture, not a uniform step-up. Instrument-specific: Green Bond (3.750% coupon) vs. estimated EUR market (~3.6%–3.85%) ≈ **flat to −15bps**. SLB fixed (5.257% coupon) vs. estimated NOK market (~5.5%–5.8%) ≈ **+25 to +55bps**. SLB floating is already market-linked (no step-up concept applies). Blended/proxy basis: the implied all-in cost of debt (~6.4%–6.6%) already **exceeds** the estimated current NOK BBB 5-year benchmark (~5.5%–5.8%), suggesting a blended step-up of roughly **−60 to −110bps (i.e., potentially a decrease)** if the undisclosed 75.6% of the stack were refinanced at generic BBB terms today. This cross-methodology comparison (vendor-implied average vs. sovereign-yield-plus-spread estimate) is approximate and should be read as directional, not precise, given the large disclosure gap on instrument-level rates. |

## 4. Refinancing Exposure

**Corroborating market signal on the bond book:** the audited notes state the five NOK-listed and three EUR-listed bonds' aggregate market value was only ~NOK 0.2 billion above carrying (amortized-cost) value at 31-Dec-2025 [Integrated Annual Report 2025, Note 7.4, p.182] — a small premium (~1.4% of the ~NOK 14.6bn face value of those bonds), consistent with the bonds trading close to par and with current-market yields not being dramatically below their coupons. This supports the "flat-to-modest" step-up read above rather than a large one.

**Cross-default / change-of-control / rating-trigger clauses:** Not disclosed in the data pool [carried forward from `01_capital-structure-and-leverage.md`, §1] — no evidence either way of a hidden accelerant tied to a rating downgrade or ownership change.

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities (NOK 13,643m: Year 1 NOK 8,250m + Year 2 NOK 5,393m) | Amount | Evidence |
|---|---:|---|
| Cash on hand | NOK 11,251m (Q1 2026, latest balance sheet) / NOK 16,085m (FY2025 year-end, for reference) | [Norsk Hydro ASA OB NHY Financials.xls, Balance Sheet tab; Integrated Annual Report 2025, Note 7.2] |
| Forecast FCF (recent run-rate, labeled) | TTM FCF (module-standard, CFO − total capex) = NOK 5,810m through 31-Mar-2026, down 50.5% year-on-year from FY2025's NOK 11,729m. This is a trailing run-rate, not a company forecast — Hydro discloses no forward FCF guidance in this pool. | [`earnings/01_historical-financials.md`, §1–§2; Norsk Hydro ASA OB NHY Financials.xls, Cash Flow tab] |
| Revolver availability (only if availability known) | NOK 24,193.656m committed, fully undrawn at FY2025-end, no borrowing-base mechanism (commitment = availability). Composed of two facilities: USD 800m (≈ within this 24-month window, matures Nov-2027) and USD 1,600m (matures Nov-2030, outside this window). | [Integrated Annual Report 2025, p.179; Capital Structure Summary tab, "Undrawn Revolving Credit"] |
| Asset-sale proceeds (only if announced / authorized) | Unknown / not applicable — no asset-sale program earmarked for debt reduction is announced or authorized in the data pool. | Not disclosed in the data pool |
| New debt issuance (only if committed / announced) | Unknown for these specific maturities — Hydro has an ongoing practice of issuing and rolling debt generally (LTM Total Debt Issued NOK 13,645m vs. Total Debt Repaid NOK 11,877m), but no specific new issuance is committed or announced against the next-24-month wall in this pool. | [Norsk Hydro ASA OB NHY Financials.xls, Cash Flow tab] |

Cash alone (Q1 2026: NOK 11,251m) covers 82% of the next-24-month wall (NOK 13,643m); cash plus the TTM FCF run-rate (NOK 5,810m) totals NOK 17,061m, covering the full 24-month wall (125%) without drawing on the NOK 24.2bn of committed, undrawn revolver capacity. For the nearer 12-month figure alone (NOK 8,250m), cash on hand (NOK 11,251m) covers it 1.36x on its own, before any FCF or revolver access is used. Rating support: S&P BBB (stable) and Moody's Baa2 (stable, upgraded from Baa3 in June 2024) [Integrated Annual Report 2025, p.178-179] — an investment-grade footing that should support normal-market access, though neither transcript in this pool (Q4 2025 or Q1 2026 earnings calls) contains management commentary on refinancing plans or ratings, so no forward-looking company view is available to corroborate. Only 4.1% of gross debt carries a confirmed floating rate (the SLB floating tranche, NIBOR-linked) — a small confirmed slice reprices with rate moves — but because 75.6% of the debt stack has no disclosed rate type at all, the true floating exposure could be materially higher than this confirmed figure; this is a real disclosure gap, not evidence of low floating exposure. Conclusion: **self-funded / low refi risk** for the next 24 months — the wall is covered by cash and recent-run-rate FCF alone, with the committed revolver and an investment-grade rating as additional, largely untapped backstops — but this verdict is capped by the 75.6% rate-type disclosure gap, which prevents a precise refinancing-cost read for most of the stack.

## 5. Refinancing Read

The near-term wall is front-loaded but small in absolute terms: NOK 8,250m (22.6% of gross debt) due within 12 months and NOK 13,643m (37.3%) within 24 months, both comfortably inside cash on hand (NOK 11,251m at Q1 2026) plus a trailing-twelve-month free cash flow run-rate of NOK 5,810m — before touching the NOK 24.2bn of committed, undrawn revolving credit. The refinancing cost picture is mixed rather than a clear headwind: the two disclosed fixed-rate bonds show only a flat-to-modest step-up (0 to +55bps) against estimated current market rates, and the implied all-in cost of debt (~6.4%–6.6%) already sits above the estimated NOK/EUR benchmark-plus-spread rates (~3.6%–5.8%), so a blended refinancing today could plausibly cost the same or less — a conclusion that rests on an indicative, web-sourced benchmark and a vendor-implied proxy, not a confirmed contractual comparison. The single biggest refinancing risk in this analysis is not the wall's timing but its opacity: 75.6% of the NOK 36,574m debt stack (bank loans, NOK bonds, other loans, the USD sustainability loan, the unsecured-loans residual, and lease liabilities) carries no disclosed coupon or floating-rate basis anywhere in this data pool, so the true rate-reset exposure and true refinancing cost cannot be pinned down instrument-by-instrument. Under a "market closure" scenario (no new unsecured issuance for 12 months), Norsk Hydro survives the next 12 months on the best available evidence: the NOK 8,250m due within that window is covered 1.36x by cash on hand alone (NOK 11,251m, Q1 2026), with FCF and the fully undrawn NOK 24.2bn committed revolver as additional, unused cushion — no assumption beyond the disclosed cash balance and maturity figures is required for this conclusion.



---

## balance-sheet-survival / 03_liquidity-runway.md

_Source: `03_liquidity-runway.md`_

# Liquidity Runway — NHY

Reporting currency: **Norwegian krone (NOK), millions**, unless stated otherwise. Norsk Hydro ASA reports under IFRS Accounting Standards as adopted by the EU [Integrated Annual Report 2025, p.140]. This report reuses `02_maturity-wall-and-refinancing.md`'s next-12-month maturity figure (NOK 8,250m) and `01_capital-structure-and-leverage.md`'s cash/debt figures, and cross-checks free cash flow (FCF) against `earnings/01_historical-financials.md` and `earnings/06_earnings-quality.md`. Both the cash flow statement and the committed-facility disclosure are present and adequate in this data pool, so neither of MODULE_RULES.md's liquidity-runway score caps ("no cash flow statement," "no revolver availability disclosed") is triggered here.

**Balance-sheet date used:** this report uses the **latest available balance sheet, 31-Mar-2026 (Q1 2026)**, not the FY2025 year-end date, because a liquidity runway measured from today (2026-07-19) should start from the most current cash position available. FY2025 year-end figures (31-Dec-2025) are shown alongside for reconciliation with `01`'s canonical figures, since the restricted-cash and collateral breakdowns below are only disclosed annually and are carried forward as the latest known split.

## 1. Liquidity Sources (committed only)

| Source | Amount (NOK m) | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents (Q1 2026, 31-Mar-2026) | 11,251 | Y, with a carve-out | Of the FY2025 year-end cash balance (NOK 16,085m), NOK 1,267m sat in the captive insurance subsidiary (Industriforsikring AS) and is, by the company's own admission, "assumed to not be available to service or repay future Hydro debt" — functionally restricted [Integrated Annual Report 2025, "Adjusted net debt" note, p.180, footnote 3]. This split is not re-disclosed quarterly, so the same NOK 1,267m is carried forward here as a labeled approximation against the Q1 2026 balance. Separately, ~NOK 4.7bn (FY2025 figure) sits outside Hydro's group cash-pooling arrangements, mainly in Brazil — a soft "not centrally poolable" signal, not a hard restriction, so it is NOT deducted, only flagged [Integrated Annual Report 2025, Note 7.2, p.181]. | [First Quarter Report 2026, p.23, Condensed balance sheets; Integrated Annual Report 2025, p.180-181] |
| Liquid short-term investments (Q1 2026) | 9,413 | Y, with a carve-out | Of the FY2025 year-end balance (NOK 10,600m), NOK 2,611m was "collateral accounts and other" — cash pledged against derivative positions, functionally restricted; Hydro's own Adjusted net debt APM nets this out as unavailable for debt service [Integrated Annual Report 2025, Note 7.3, p.181]. Same carried-forward approximation applied to the Q1 2026 balance. | [First Quarter Report 2026, p.23; Integrated Annual Report 2025, Note 7.3, p.181] |
| Revolver / facilities (commitment) | 24,194 (USD 1,600m maturing Nov-2030 + USD 800m maturing Nov-2027, NOK-equivalent) | Maybe → treated as usable (see next row) | No borrowing-base mechanism disclosed — commitment equals availability by construction, so this is not the "count as usable only if availability is known" edge case. Fully undrawn (NOK 0 drawn) as of FY2025-end; the Q1 2026 report does not re-confirm drawn/undrawn status, so this is carried forward from the last confirmed disclosure, flagged. No minimum-liquidity or springing-liquidity covenant is disclosed in this data pool [`04_coverage-and-covenants.md`, line on springing covenant: "not currently active — 0% utilization"]. | [Integrated Annual Report 2025, p.179; `01_capital-structure-and-leverage.md`, §1] |
| Revolver availability (confirmed) | 24,194 | Y | Commitment = availability (no borrowing base, no reserves disclosed). Uncommitted lines: none disclosed in this pool — there is nothing to exclude on that count. | [Integrated Annual Report 2025, p.179] |
| **Total usable liquidity (restriction-adjusted)** | **40,980** | | = (11,251 − 1,267 captive-insurance cash) + (9,413 − 2,611 derivative-collateral investments) + 24,194 revolver. Memo — raw, unadjusted total (no restricted-cash carve-outs): NOK 44,858m (11,251 + 9,413 + 24,194). | Derived |

No uncommitted credit lines are disclosed anywhere in this data pool, so there is nothing uncommitted to separately exclude beyond the carve-outs above. Reporting currency throughout: NOK millions.

## 2. Near-Term Uses (next 12 months, 2026-07-19 to 2027-07-19)

| Use | Amount (NOK m) | Source |
|---|---:|---|
| Debt maturities (from `02`) | 8,250 | `02_maturity-wall-and-refinancing.md`, §1 ("Within 12 months (Year 1 / 2026)"). This figure is anchored to the FY2025 (31-Dec-2025) schedule and is ~6.6 months stale as of this report's date — `02` itself flags that roughly half of the nominal Year-1 window has already elapsed. Corroborating, more current data point: the Q1 2026 balance sheet's short-term debt balance is NOK 5,102m, down from NOK 8,149m at FY2025-end — consistent with the wall being worked down as expected, not with a hidden increase. |
| Cash interest | 2,358 | FY2025 actual cash interest paid, used as a forward proxy — Hydro discloses no forward interest guidance in this pool [`earnings/06_earnings-quality.md`, §1; Norsk Hydro ASA OB NHY Financials.xls, Cash Flow tab] |
| Maintenance capex | 11,582 | **Proxy — total capex used, not a true maintenance-only figure.** Hydro does not split maintenance/sustaining capex from growth capex in this data pool; management refers qualitatively to "historically high sustaining capital expenditure" with no number given [`earnings/06_earnings-quality.md`, §1, footnote 3; Integrated Annual Report 2025, p.51]. Using total capex (NOK 11,582m, FY2025 cash-flow-statement basis) as the near-term-uses line therefore likely overstates the true maintenance-only obligation. |
| Committed dividends / buybacks | 2,473 | **Policy floor, not a declared amount — see note below.** |
| **Total near-term uses (gross)** | **24,663** | Sum of rows above |

**Dividend timing note (read before Section 3):** Hydro pays one ordinary dividend a year, proposed with Q4 results (~February) and paid after Annual General Meeting (AGM) approval, "generally occurring in May" or June [Integrated Annual Report 2025, p.64, dividend-policy note; Note 7.7]. The FY2025 dividend (NOK 3.00/share, ~NOK 5.9bn, ~60% of adjusted net income) was proposed with the FY2025 results and approved at the AGM on 7-May-2026 [Integrated Annual Report 2025, p.1590-91 narrative, p.3061]. Because Hydro's practice is to pay in May or June, this dividend was almost certainly already paid before this report's date (2026-07-19) — **Inference, not from filings**: no Q2 2026 report is in this data pool to confirm the exact payment date, so this is a dated assumption, not a confirmed fact. On that basis, the FY2025 dividend falls **before**, not within, the forward-looking 12-month window used here. The next dividend event inside this window would be the FY2026 dividend — proposed ~February 2027, approved at AGM ~May 2027, paid ~May/June 2027 — which has **not yet been declared**. The NOK 2,473m shown above is the disclosed **policy floor** (NOK 1.25 per share × 1,978,489,136 shares outstanding [Integrated Annual Report 2025, Note 13, p.9928]), used as the most conservative evidence-based stand-in for a "committed" distribution. The company's actual last three ordinary dividends (NOK 2.50, 2.25, 3.00 per share for FY2023–FY2025) were materially larger, in the NOK 4.4bn–5.9bn range — treat NOK 2,473m as a floor, not a best estimate, and the true FY2026 dividend outflow is more likely to land well above it. Share buybacks are explicitly discretionary ("Share buybacks or extraordinary dividends may supplement ordinary dividends during periods of strong financial results" [Integrated Annual Report 2025, p.1059]) — not committed. Recent run-rate context only: NOK 856m (FY2025) / NOK 2,272m (FY2024) bought back; NOK 0 is used in the "committed" bucket above.

## 3. Runway

| Metric | Value |
|---|---:|
| Total committed liquidity (restriction-adjusted, Q1 2026) | NOK 40,980m |
| Annual FCF used (TTM, ended 31-Mar-2026 — the more current, more conservative figure) | NOK 5,810m (down 50.5% YoY from FY2025's NOK 11,729m) [`earnings/01_historical-financials.md`, §2] |
| Basis used | **Net-of-FCF** — TTM FCF is positive (NOK 5,810m) and, per `earnings/06_earnings-quality.md`, cash conversion is cash-backed (TTM CFO/EBITDA = 79.4%, 3-year average 81.3%), not an accrual illusion, so FCF is treated as meaningful. |
| Annual net cash burn (net-of-FCF basis) = (12-month maturities NOK 8,250m + committed dividend floor NOK 2,473m) − FCF NOK 5,810m | NOK 4,913m |
| Monthly net cash burn (annual burn ÷ 12) | NOK 409m |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn = 40,980 ÷ 409** | **~100 months (~8.3 years)** |

**Formula, shown in full:** Runway (months) = Total usable liquidity (NOK 40,980m) ÷ [ (12-month debt maturities NOK 8,250m + committed dividend floor NOK 2,473m − TTM FCF NOK 5,810m) ÷ 12 ] = 40,980 ÷ 409 ≈ **100 months**. Cash interest and maintenance capex are deliberately **not** added a second time here — TTM FCF (= CFO − total capex) already carries both, and re-adding them would double-count and understate the true runway.

**Sensitivity — how much this depends on which FCF window is used:** if FY2025's higher FCF (NOK 11,729m, pre-slowdown) is used instead of the TTM figure, the bracketed annual figure turns negative — (8,250 + 2,473) − 11,729 = **−1,006** — meaning FCF alone would more than cover the dividend floor and the maturity wall, with a **NOK ~1.0 billion annual surplus** and no finite runway needed on that basis. The gap between these two readings (a ~100-month runway vs. an outright surplus) is entirely the ~50% TTM decline in FCF, not a change in obligations — flagged as the single most FCF-sensitive part of this analysis.

**Sensitivity — zero-FCF stress (harshest reading, illustrative only, not the headline basis):** if operating cash generation were assumed to fall to zero for the next 12 months (the gross-obligations basis, ignoring all operating inflows), the full near-term-uses bucket from §2 (NOK 24,663m, including cash interest and total capex) would apply with no FCF offset: monthly burn = 24,663 ÷ 12 = NOK 2,055m, and liquidity alone (NOK 40,980m) would still cover **~20 months** before external funding was needed. This is not the basis used for the headline figure (FCF is positive and cash-backed, so the net-of-FCF basis governs per MODULE_RULES §8), but it shows that even under a complete stop in operating cash generation, in-hand liquidity alone is not the binding constraint over the next 12 months.

### Seasonality / Peak Liquidity Need (Hard Check)

Working capital is **not proven to be calendar-seasonal** — `earnings/01_historical-financials.md`, §5 finds this data pool has too few quarters (5 of a possible 8) to test for a repeatable calendar pattern, and explicitly warns not to infer seasonality from the swings visible in that window, which track commodity-price cycles (aluminium/alumina price moves), not the calendar. That said, a real, disclosed working-capital cash swing did occur in the most recent quarter: Q1 2026 net cash from operating activities was **negative NOK (1,891)m** against a positive Adjusted EBITDA of NOK 8,668m, driven by "operating capital build from higher prices and sales" [Integrated Annual Report 2025, p.4 highlights; First Quarter Report 2026, p.24, 37]. This is price-cycle-driven, not calendar-seasonal, and no peak-quarter cash-usage figure is disclosed anywhere in this pool. Per the hard-check requirement: **peak working-capital need not disclosed — runway may be overstated.** The Q1 2026 event (a single-quarter cash outflow of NOK 1,891m from operations alone) is a concrete illustration of how much a price-cycle-driven working-capital swing can cost in a single quarter, well above the smoothed annual TTM FCF figure used in the headline runway.

## 4. Sources & Uses Bridge

In-hand liquidity alone (NOK 40,980m, restriction-adjusted) covers the entire gross next-12-month uses bucket (NOK 24,663m, §2 — debt maturities, cash interest, total capex, and the dividend floor combined) roughly **1.7 times over**, with no FCF credit needed at all; on the harsher zero-FCF stress, liquidity alone still lasts ~20 months (§3). Internal sources (cash + FCF) therefore cover the next 12 months without requiring external access — no refinancing, asset sale, or new drawdown is needed on any of the readings shown. Of the ~100-month headline runway, essentially all of it is already-in-hand liquidity (NOK 40,980m sitting on the balance sheet or committed and undrawn today); TTM FCF (NOK 5,810m/year) only has to cover a modest NOK 4,913m annual shortfall between maturities/dividend-floor and FCF itself — a small increment relative to the NOK 40,980m liquidity base, not a load-bearing assumption the runway depends on.

## 5. Liquidity Read

Norsk Hydro's liquidity runway is roughly **100 months (about 8.3 years)** on the conservative, most-current (TTM) FCF basis, and would show an outright annual surplus rather than a finite runway if the higher FY2025 FCF figure were used instead — either way, the company is not liquidity-constrained over any horizon relevant to near-term survival. This is overwhelmingly an already-in-hand-liquidity story (NOK 40,980m of usable cash, liquid investments, and fully committed, undrawn revolver capacity against a NOK 24,663m gross annual-uses bucket), not a story that depends on FCF holding up — even a complete stop in operating cash generation would still leave ~20 months of covered runway (§3). The single biggest liquidity risk is not the size of the buffer but its trajectory and quality at the margin: TTM FCF has fallen 50.5% versus FY2025 (NOK 11,729m → NOK 5,810m) on a 40% YoY alumina-price drop, and the most recent standalone quarter (Q1 2026) posted a negative NOK (1,891)m operating cash flow against positive Adjusted EBITDA — a real, disclosed sign that reported profit is currently running ahead of cash at the margin, even though it does not threaten the runway at today's liquidity scale.



---

## balance-sheet-survival / 04_coverage-and-covenants.md

_Source: `04_coverage-and-covenants.md`_

# Coverage & Covenants — NHY

Norsk Hydro ASA (Oslo Børs: NHY) reports under IFRS Accounting Standards as adopted by the EU, in Norwegian krone (NOK million), fiscal year ended 31 December [Integrated Annual Report 2025, p.140]. This is a Norwegian listed issuer, not a US SEC or India SEBI filer; the local-equivalent documents are the Board-approved Integrated Annual Report 2025 (annual-filing equivalent) and the Board-approved First Quarter Report 2026 (interim-filing equivalent) [`00_solvency-data-triage.md`]. Debt, net-debt basis, and the EBITDA base are carried forward from `01_capital-structure-and-leverage.md` (canonical strict net debt NOK 20,489m; canonical EBITDA base = company-reported audited EBITDA, FY2025 NOK 25,696m).

## 1. Coverage Ratios

All ratios use **gross** interest expense — Note 7.5 "Finance income and expense," "Interest expense (amortized cost)" NOK 2,357m FY2025, which already includes the lease-interest component (NOK 391m, separately disclosed as required by IFRS 16 but not additive to the 2,357m total) [Integrated Annual Report 2025, Note 7.5, p.182; Note 7.4 lease note, p.165]. This is the audited group interest expense, not a proxy — the no-interest-detail partial-data rule does not apply here.

| Ratio | Value (FY2025) | Value (TTM, ended 31-Mar-2026) | Source |
|---|---:|---:|---|
| EBITDA / interest (reported EBITDA) | 10.90x (25,696 / 2,357) | 9.82x (21,976 / 2,239) | [Integrated Annual Report 2025, p.36 (EBITDA), Note 7.5, p.182 (interest); First Quarter Report 2026, p.6, p.17 (finance note)] |
| EBITDA / interest (adjusted EBITDA, memo) | 12.26x (28,889 / 2,357) | n/a — TTM adjusted EBITDA not separately built here | [Integrated Annual Report 2025, p.36] |
| EBIT / interest | 6.11x (14,401 / 2,357) | 4.82x (10,781 / 2,239) | [Integrated Annual Report 2025, p.140 (EBIT); First Quarter Report 2026, p.6] |
| (EBITDA − capex) / interest | 5.99x (14,114 / 2,357) | 4.62x (10,346 / 2,239) | Derived from `earnings/01_historical-financials.md` §1–§2 |
| Fixed-charge coverage: (EBITDA − capex) / (interest + 12-month scheduled debt maturities) | 1.36x (14,114 / 10,403; maturities = current portion of long-term debt NOK 8,046m at FY2025-end) | 1.41x (10,346 / 7,341; maturities = short-term debt NOK 5,102m at Q1 2026-end) | [Integrated Annual Report 2025, Note 7.4, p.181 (current portion); First Quarter Report 2026, p.17 (balance sheet)] |

**Formula and derivation shown (Bash/Python executed, not mental arithmetic):**
```
interest_ttm = interest_FY2025 (2,357) − interest_Q1'25 (588) + interest_Q1'26 (470) = 2,239
EBITDA/interest FY2025  = 25,696 / 2,357  = 10.90x
EBIT/interest FY2025    = 14,401 / 2,357  = 6.11x
(EBITDA−capex)/interest = (25,696−11,582) / 2,357 = 5.99x
Fixed-charge coverage   = (25,696−11,582) / (2,357+8,046) = 1.36x
```

**EBITDA basis stated:** the primary base is **company-reported (audited) EBITDA** (NOK 25,696m FY2025), not the company's own further-adjusted EBITDA APM (NOK 28,889m, which is shown as a memo column above) and not the Capital IQ workbook's "EBITDA" field (NOK 51,454m for FY2025), which the earnings module flagged as a template/extraction mismatch that does not reconcile to any audited figure and is not used anywhere in this report [`earnings/01_historical-financials.md`, data-quality note]. Interest is **gross** (Note 7.5 "Interest expense," not netted against interest income).

**Cash-backing of the EBITDA base:** per `earnings/06_earnings-quality.md`, multi-year cash conversion (CFO/EBITDA) is 95.4% (FY2023), 57.9% (FY2024), 90.7% (FY2025) — a 3-year average of 81.3% and a TTM figure of 79.4%, both above the module's 70% "healthy" threshold. Reported EBITDA is **not materially above cash-backed EBITDA on a multi-year average basis**, but the most recent standalone quarter (Q1 2026) shows negative operating cash flow (NOK −1,891m) against a positive Adjusted EBITDA of NOK 8,668m, driven by a working-capital build on higher prices [`earnings/06_earnings-quality.md` §2]. Coverage ratios above should therefore be read as sound on a trailing-year basis but with a live, disclosed near-term cash-conversion wrinkle that a single-quarter snapshot would understate.

**Fixed-charge coverage caveat:** the "scheduled debt maturities" figure used (NOK 8,046m current portion of long-term debt at FY2025-end; NOK 5,102m short-term debt at Q1 2026-end) is a balance-sheet snapshot of the next-12-month maturity, not a smoothed annual amortization schedule — it can be lumpy year to year and should be cross-checked against `02_maturity-wall-and-refinancing.md`'s own year-by-year wall once available (that module had not yet produced output at the time this agent ran; this agent proceeded on its own read of the debt note, per MODULE_RULES.md). No separate lease-principal-repayment line is disclosed at the group level beyond what is folded into the current-portion-of-long-term-debt figure, so the fixed-charge formula uses interest + scheduled maturities only ("+ lease payments" collapses into the same maturities line here, since Hydro's lease liabilities are consolidated into the same debt note and are not decomposed into a separate lease-cash-payment schedule in this data pool).

## 2. Covenant Inventory

**No credit-agreement summary or maintenance-covenant schedule with numeric thresholds exists in the data pool.** The only disclosure is qualitative: "the majority of long-term loans are held by the parent company. There are no financial covenants for those loans. Some loans held by part-owned subsidiaries have financial covenants as part of the terms" [Integrated Annual Report 2025, Note 7.4, p.182]. The identity, amount, and specific threshold of those part-owned-subsidiary covenants are **not disclosed**. No credit-agreement, indenture, or bank-facility covenant text is in the pool for the parent-level bonds, term loans, or the two multicurrency revolvers.

Per the module's partial-data rule (no covenant disclosure → typical market covenant as a LABELED assumption; headroom "Not assessable" for scoring), the table below applies an indicative covenant calibrated to Hydro's actual credit profile — an S&P BBB-rated (foreign-currency, long-term) issuer [Credit Health Panel, Capital IQ export, as-of 2026-07-18] — rather than a generic leveraged-loan covenant, since Hydro is investment-grade, not a leveraged borrower. Investment-grade bonds typically carry incurrence covenants (negative pledge, limitation on liens, cross-default), not tight maintenance financial covenants — so a maintenance-covenant framework is itself of limited relevance to the parent-level debt; the assumed thresholds below are shown for indicative headroom only, not as evidence a real covenant exists at these levels.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage (LABELED ASSUMPTION — typical maintenance-covenant style ceiling for a BBB-rated industrial issuer, conservative low end of the market range) | 3.5x net debt/EBITDA (assumed) | 0.80x (net debt/EBITDA, strict, reported EBITDA) [`01_capital-structure-and-leverage.md` §5] | **+77.2%** (direction: MAX covenant, headroom = (3.5−0.80)/3.5) | Assumption per MODULE_RULES.md partial-data rule; actual from `01` |
| Min interest coverage (LABELED ASSUMPTION) | 3.0x EBITDA/interest (assumed) | 10.90x (FY2025) | **+263.4%** (direction: MIN covenant, headroom = (10.90−3.0)/3.0) | Assumption; actual derived §1 above |
| Min liquidity / net worth | Not disclosed | n/a | Not assessable | Not disclosed in data pool |
| Springing covenant trigger (revolver utilization threshold) | Not disclosed | Both revolvers (USD 1,600m and USD 800m committed) show **NOK 0 drawn** at FY2025-end [`01_capital-structure-and-leverage.md` §1] | Not applicable / not currently active (0% utilization on disclosed facilities) — but existence of a springing trigger is itself not confirmed or denied in the pool | [Integrated Annual Report 2025, p.179] |
| Equity cure rights (Y/N, limits) | Not disclosed | n/a | Not assessable | Not disclosed in data pool |
| Part-owned-subsidiary covenants (actual, disclosed to exist but not quantified) | Not disclosed (amount, metric, threshold all withheld) | Not disclosed | Not assessable | [Integrated Annual Report 2025, Note 7.4, p.182] — "Some loans held by part-owned subsidiaries have financial covenants as part of the terms" |

**Scoring implication:** per MODULE_RULES.md's Score Cap Rules, "No covenant disclosure" → Covenant headroom = "Not assessable" for scoring purposes, and Overall usefulness capped at max 75. The indicative headroom percentages above are shown for directional context only and must not be read as a confirmed covenant test.

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | Not disclosed — no credit-agreement covenant-EBITDA definition exists in the pool. The indicative headroom above uses this module's canonical **reported (audited) EBITDA**, not a covenant-specific definition. | Not disclosed |
| Addbacks permitted (types) | Not disclosed for any real covenant. For context: the company's own **adjusted EBITDA APM** (NOK 28,889m FY2025, +NOK 3,193m vs reported) adds back unrealized LME/power/raw-material derivative timing gains, rationalization & closure costs, and transaction-related items — a company reporting APM, not a covenant definition [Integrated Annual Report 2025, p.36]. | [Integrated Annual Report 2025, p.36] |
| Addback caps / limits | Not disclosed (no real covenant exists to cap) | Not disclosed |
| Is covenant EBITDA materially above reported EBITDA? | Unknown — no covenant-EBITDA definition to compare. If a real covenant used the company's adjusted-EBITDA APM instead of reported EBITDA, covenant EBITDA would run ~12.4% above reported (28,889 vs 25,696, FY2025), which would flatter any real leverage/coverage test versus the figures in §1–§2 above. | Inference, not from filings |

**Explicit statement per partial-data rule:** the covenant definition is undisclosed, so headroom quality is **unknown** — there is a real risk of an "addback illusion" if any actual covenant (particularly at the part-owned-subsidiary level) uses a more generous EBITDA definition than the reported figure used here. This cannot be resolved from the current data pool.

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant (of the two labeled assumptions) | Max net leverage (assumed 3.5x ceiling) — tighter than the assumed min-coverage test in relative headroom terms (+77.2% vs +263.4%) |
| Headroom on tightest covenant (%) | +77.2% (indicative only — Not assessable for scoring per the no-covenant-disclosure cap) |
| EBITDA decline that would breach it (approx.) | A **~77.2% collapse in EBITDA** from FY2025's NOK 25,696m down to ~NOK 5,854m, holding net debt fixed at NOK 20,489m, would push net leverage to the assumed 3.5x ceiling (20,489/5,854 = 3.5x). This is a far larger decline than the module's standard −30%/−40%/−60% stress-test haircuts (see `06_downside-stress-test.md`), which under this labeled assumption would NOT breach the assumed leverage covenant even at −60% EBITDA (25,696 × 0.40 = 10,278; 20,489/10,278 = 1.99x, still well inside 3.5x). |
| Debt increase that would breach it (approx.) | Net debt would need to rise from NOK 20,489m to ~NOK 89,936m (net debt/EBITDA = 3.5x at FY2025 EBITDA held flat) — a **~4.4x increase (+338.9%)** in net debt. This is not a realistic near-term scenario absent a large debt-funded acquisition. |
| EBITDA decline that would breach the assumed min-coverage covenant (3.0x) | EBITDA would need to fall to ~NOK 7,071m (a **72.5% decline** from FY2025's NOK 25,696m), holding interest expense flat at NOK 2,357m, for EBITDA/interest to fall to the assumed 3.0x floor. |

## 4. Coverage / Covenant Read

Earnings comfortably cover interest on the numbers actually disclosed: FY2025 EBITDA/interest is 10.90x and EBIT/interest is 6.11x, falling to 9.82x and 4.82x on a TTM (ended 31-Mar-2026) basis as EBITDA softened on lower alumina prices — both remain multiples away from any plausible distress level. Fixed-charge coverage is thinner at 1.36x (FY2025) because the denominator adds the next 12 months' scheduled debt maturity (NOK 8,046m) to interest — this reflects debt due for repayment/refinancing, not an inability to service interest itself, and should be read alongside `02_maturity-wall-and-refinancing.md`'s own maturity ladder once available. No real maintenance-covenant schedule is disclosed for the parent-level debt (Note 7.4 states there are none for parent-held loans, and confirms — without quantifying — that some part-owned-subsidiary loans do carry covenants); the indicative labeled-assumption test built here (3.5x max leverage, 3.0x min coverage, calibrated to Hydro's BBB S&P rating) shows wide headroom (+77.2% and +263.4% respectively) against actual net leverage of only 0.80x, but this headroom is explicitly **not assessable for scoring** under the module's no-covenant-disclosure cap, and the undisclosed part-owned-subsidiary covenant terms remain a genuine, unquantified gap.



---

## balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md

_Source: `05_off-balance-sheet-and-contingencies.md`_

# Off-Balance-Sheet & Contingencies — NHY

Reporting currency: **Norwegian krone (NOK), millions**, unless stated otherwise (litigation amounts originally disclosed in Brazilian Real, BRL, are shown in BRL as filed — no FX conversion is invented where the filing does not state one, per CLAUDE.md §27). Norsk Hydro ASA reports under IFRS Accounting Standards as adopted by the EU, fiscal year ended 31-Dec-2025 [Integrated Annual Report 2025]. Primary source for this section: the FY2025 Integrated Annual Report's Note 4.1 (Uncertain assets and liabilities), Note 8.1 (Financial and commercial risk management — contractual obligations), Note 11 to the parent-company financial statements (Guarantees), and the ESG Factbook's "Updates on previously reported legal cases." Canonical net-debt/leverage figures are set by `01_capital-structure-and-leverage.md`; this agent does not restate them and flags overlaps explicitly below.

## 1. Off-Balance-Sheet / Debt-Like Obligations

| Item | Recognized Liability | Maximum / Gross Exposure | Already in 01's debt? | Source |
|---|---:|---:|---|---|
| Operating leases | N/A | N/A | **Yes** — Hydro reports under IFRS, which requires capitalizing substantially all leases (IFRS 16) onto the balance sheet. There is no separate off-balance-sheet operating-lease pool; the full NOK 4,305m "Lease Liabilities" line is already inside `01`'s gross-debt stack. | [Integrated Annual Report 2025, Note 7.4, p.181; `01_capital-structure-and-leverage.md`, §2] |
| Pension / OPEB | NOK 9,438m (recognized pension/OPEB liability, underfunded plans) | Defined-benefit obligation NOK 18,169m vs. plan assets NOK 20,861m — an aggregate surplus of NOK 2,692m that IFRS does not let Hydro net across jurisdictions, so a NOK 10,563m pension **asset** and a NOK 9,438m pension **liability** sit separately on the balance sheet | **Yes** — the NOK 9,438m liability line is already inside `01`'s debt-like-obligations table; shown here only for completeness, not additive | [Norsk Hydro ASA OB NHY Financials.xls, Pension OPEB tab, FY2025; `01_capital-structure-and-leverage.md`, §2] |
| Securitization / factoring (trade receivables) | Not disclosed (drawn amount not stated; company states the NOK 5.5bn limit "was not fully utilized at year-end") | NOK 5,500m — the total limit Hydro has set for factoring, reverse factoring, and any type of sale of receivables across subsidiaries | No | [Integrated Annual Report 2025, "Funding of subsidiaries, associates and jointly controlled entities" note, p.179] |
| Contract commitments for investments in PP&E | 0 (off-balance-sheet, not yet recognized) | NOK 4,811m | No | [Integrated Annual Report 2025, Note 8.1, p.188] |
| Additional authorized future investments in PP&E (Board/management-approved, not yet contracted) | 0 | NOK 8,433m | No | [Integrated Annual Report 2025, Note 8.1, p.188] |
| Contract commitments for other future investments | 0 | NOK 19m | No | [Integrated Annual Report 2025, Note 8.1, p.188] |
| **Total capital commitments** | **0** | **NOK 13,263m** | No | [Integrated Annual Report 2025, Note 8.1, p.188 — "Total"] |
| Unconditional purchase obligations (bauxite/alumina/aluminium, energy — mainly long-term power purchase agreements — and other raw materials/transportation) | 0 (off-balance-sheet, non-cancellable forward commitments, not a recognized liability) | **NOK 386,469m** total undiscounted (2026: 50,024; 2027: 42,723; 2028: 40,389; 2029: 38,695; 2030: 38,129; thereafter: 176,511). Split FY2025: Bauxite/alumina/aluminium NOK 251,397m; Energy-related NOK 129,198m; Other NOK 5,874m | No | [Integrated Annual Report 2025, Note 8.1, p.187-188 ("Hydro has long-term contractual commitments for the purchase of aluminium, raw materials, electricity, and transportation... future non-cancellable fixed and determinable obligations")] |

**Read this row carefully — it is not a typical "contingent liability."** The NOK 386,469m unconditional purchase obligations are overwhelmingly long-term power purchase agreements (PPAs) and raw-material supply contracts that keep Hydro's smelters running "on an ongoing basis throughout the year with no planned shutdown periods" [Integrated Annual Report 2025, p.187]. They are not a guarantee that might never be called or a lawsuit that might be dismissed — they are contracts Hydro would largely need to honor anyway to keep producing, and in a normal year the associated purchases are funded by the sales they enable. The solvency-relevant risk is narrower but real: because they are **non-cancellable**, in a demand or price collapse Hydro cannot simply stop buying power and alumina to match a fall in aluminium sales, so the fixed purchase commitment stays in place while the offsetting revenue shrinks — a genuine downside amplifier the stress test (`06`) should model, not a number to be added at face value to a "gross contingent liability" total.

## 2. Guarantees & Letters of Credit

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| Guarantees (standby letters of credit, performance bonds, payment/financial guarantees — bundled as one disclosed total, not broken out by type) | 0 — explicitly labeled "Total guarantees not recognized" | NOK 2,952m (FY2025) / NOK 3,073m (FY2024) | "All commercial guarantees are on behalf of subsidiaries" — i.e., the parent (Norsk Hydro ASA) has extended guarantees to third parties for its own subsidiaries' obligations, arising "in the ordinary course of business" | [Integrated Annual Report 2025, Note 11 (Guarantees), p.219-220] |

No standalone third-party rating-agency guarantee/surety disclosure exists in the data pool beyond this note. Change-of-control, cross-default, and rating-trigger clauses are **not disclosed** anywhere in the pool [per `00_solvency-data-triage.md`, §3] — this is recorded as an unknown, not assumed absent.

## 3. Litigation & Tax Contingencies

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) | Source |
|---|---:|---:|---|---|
| Brazilian indirect tax disputes (large portfolio of cases, administrative and legal systems) | ~NOK 601m (2025 indirect-tax provisions, short + long-term combined; "provision for indirect taxes is mainly related to operations in Brazil" and covers cases Hydro assesses as >50% loss probability) | Known cases total **~NOK 4.3 billion**, of which losses are considered **possible** (not probable) in cases amounting to **~NOK 3.6 billion**; "a significant share of those amounts is covered by tax indemnifications from acquisition" (percentage not disclosed) | **Active / live.** "The final outcome of these cases is not expected until several years into the future, and is highly uncertain. Additional cases may be raised by tax authorities..." | [Integrated Annual Report 2025, Note 4.1, p.172-173] |
| Alunorte / Cainquiama Rotterdam case (financial damages + personal injuries, filed 2021, Netherlands) | 0 | Not estimable — "it is not possible at this time to provide a range of possible outcomes or a reliable estimate of potential future exposure" | **Active.** Dismissed by the Rotterdam District Court on legal and factual grounds, 24-Sep-2025; **appealed by the plaintiffs in December 2025** — the appeal is live | [Integrated Annual Report 2025, ESG Factbook, p.269 ("Updates on previously reported legal cases")] |
| Pará collective actions — ~100 individuals (Abaetetuba/Barcarena, 2018 rainfall/tailings event) and related Cainquiama/association collective lawsuits | 0 | Not quantified | **Active.** 112 of 142 cases stayed pending a decision in a separate related collective lawsuit; 30 cases ongoing pending a ruling on the stay request; other Cainquiama collective suits pending at the lower court | [Integrated Annual Report 2025, ESG Factbook, p.269] |
| Fuel-switch delay claim (Cainquiama, filed 2019) | 0 (Hydro disputes the ruling and has appealed) | **BRL 50 million** moral-damage award ordered by the Pará lower court, May 2024 | **Active** — appeal pending at the Court of Appeal | [Integrated Annual Report 2025, ESG Factbook, p.270] |
| Federal criminal case — 2018 rainfall/tailings overflow (filed by the Federal Public Prosecutor Office) | 0 (Alunorte disagrees and has appealed) | **BRL 100 million** penalty ordered by the Federal lower Court, July 2024 | **Active** — appeal pending at the Court of Appeal | [Integrated Annual Report 2025, ESG Factbook, p.270] |
| Class actions — 2009 bauxite-residue overflow legacy (two cases with unfavorable rulings against Alunorte) | 0 | Not quantified ("compensation should be paid" — amount not stated in the filing) | **Active** — one case pending Court of Appeal; the other's Superior Court appeal was denied on procedural grounds and it is now pending an enforcement decision (Alunorte disputes the underlying merits) | [Integrated Annual Report 2025, ESG Factbook, p.270] |
| DRS1/DRS2 construction claim (Cainquiama, filed 2017, alleged Ecological Reserve encroachment) | 0 | Not quantified | **Active** — pending decision at the lower court | [Integrated Annual Report 2025, ESG Factbook, p.270] |
| >5,400 lawsuits related to the 2009 bauxite-residue storm-water overflow | 0 | N/A | **Resolved / dormant** — "all lawsuits were closed with favorable decisions to Alunorte" | [Integrated Annual Report 2025, ESG Factbook, p.270] |
| The Dalles, Oregon (US) casthouse environmental-compliance matter | 0 | N/A | **Resolved / dormant** — three-year Administrative Agreement with the US EPA; company states it is "in material compliance" | [Integrated Annual Report 2025, ESG Factbook, p.269] |
| Environmental clean-up / asset retirement obligations (general, beyond the recognized provision) | NOK 4,290m recognized (2025) | Unquantifiable incremental exposure — "Hydro may be deemed liable for remediation that is not acknowledged as Hydro's responsibility, and therefore not provided for... the cost of remediation of any additional contamination deemed Hydro's responsibility is uncertain" | **Latent, not itemized as a specific active claim** — a standing disclosure of estimation uncertainty rather than a named live case | [Integrated Annual Report 2025, Note 4.1, p.171-172] |
| Product warranty / product liability and contract-delivery disputes (general disclosure) | Recognized "where a payment is probable" (amount not separately broken out) | Not quantified — "may involve significant amounts and outcomes may be difficult to assess" | Not itemized as a specific active claim | [Integrated Annual Report 2025, Note 4.1, p.172] |

The company's own probability language is used throughout: "possible" (disclosed, not provisioned) for the NOK 3.6bn Brazil tax slice; provisioned only where loss is assessed "above 50 percent"; and "not possible... to provide a range of possible outcomes" for Alunorte-related litigation, which this report records as unquantifiable rather than estimated. The Brazilian civil/criminal litigation items (Cainquiama Rotterdam appeal, Pará collective actions, fuel-switch and criminal-penalty appeals, class-action enforcement) are genuinely **live** — none are settled — even though most carry no company-stated dollar range.

## 4. Contingent Exposure Summary

Two totals are shown because the items in this note are not homogeneous: guarantees and litigation/tax are classic contingent liabilities (may never crystallize, but could spike suddenly on an adverse ruling); the purchase and capital commitments in §1 are largely committed, near-certain operating cash outflows rather than contingent risk. Blending them into one number would overstate the "surprise" risk and understate the operating-commitment risk, so both are shown, separately, against the same denominator.

| Metric | Narrow basis (guarantees + Brazil tax dispute max; BRL litigation and unquantifiable items excluded from the total, as they cannot be reliably summed) | Broad basis (adds capital commitments + unconditional purchase obligations from §1) |
|---|---:|---:|
| Total recognized contingent liabilities | NOK ~601m (indirect-tax provision, proxy for the >50%-probability tax cases) | Same, NOK ~601m (capital and purchase commitments carry zero recognized liability) |
| Total maximum / gross exposure | NOK 7,252m (guarantees NOK 2,952m + Brazil tax known-cases max NOK 4,300m) | NOK 406,984m (7,252 + capital commitments 13,263 + unconditional purchase obligations 386,469) |
| Max exposure ÷ recognized | ~12.1x | ~677x (mechanical result of an almost entirely unrecognized off-balance-sheet base — not a meaningful multiple on its own; see narrative) |
| Max exposure ÷ total equity (NOK 107,095m, total equity incl. minority interest, FY2025 [`01_capital-structure-and-leverage.md`, §5]) | ~6.8% | ~380% (3.8x equity) |

The BRL-denominated litigation awards (BRL 50m + BRL 100m = BRL 150m ordered against Hydro/Alunorte, both under appeal) and the unquantifiable Alunorte-related claims are deliberately excluded from both totals rather than force-converted or estimated at zero — the filing itself states a reliable estimate is not possible for the larger Alunorte claims, and the BRL amounts are immaterial in scale relative to Hydro's NOK debt and equity base even before conversion.

## 5. Contingency Read

The single largest off-balance-sheet number is the **NOK 386,469m of unconditional, non-cancellable purchase obligations** (mostly power and alumina/aluminium supply contracts, ~10.6x Hydro's own NOK 36,574m of on-balance-sheet gross debt) — but this is a committed operating cost of running the smelters, not a surprise risk, so it belongs in the stress test as a rigidity (fixed input costs that cannot be cut when demand falls), not in a "things that might blow up" tally. The genuine contingent exposure that could crystallize with no warning is smaller but live: **~NOK 4.3 billion of known Brazilian tax disputes** (NOK 3.6bn of it only "possible," largely unprovisioned, partly indemnity-covered) and **NOK 2,952m of parent guarantees on subsidiary obligations**, plus a cluster of **active, unquantified Alunorte-related Brazilian litigation** — a Rotterdam damages case under active appeal, Pará collective actions, and BRL 50m/BRL 100m civil and criminal penalty awards both under appeal — none of which are remote or dormant, and none of which the company can currently size. None of these figures alone threatens solvency against Hydro's NOK 107,095m equity base or its NOK 20,489m canonical net debt [`01_capital-structure-and-leverage.md`], but an adverse, simultaneous outcome on the Brazil tax "possible" slice and the pending Alunorte criminal/civil appeals — combined with the rigid purchase-obligation base holding cash outflows fixed in a downturn — is the scenario that would turn a currently low-leverage balance sheet into a materially more stretched one, and it is not visible anywhere in the reported net-debt or leverage figures.



---

## balance-sheet-survival / 06_downside-stress-test.md

_Source: `06_downside-stress-test.md`_

# Downside Stress Test — NHY

Reporting currency: **Norwegian krone (NOK), millions**, unless stated otherwise. Norsk Hydro ASA reports under IFRS Accounting Standards as adopted by the EU, fiscal year ended 31-Dec [Integrated Annual Report 2025, p.140]. This is a Norwegian listed issuer (Oslo Børs); local-equivalent documents are the Integrated Annual Report 2025 and the First Quarter Report 2026, per `00_solvency-data-triage.md`. Norsk Hydro is an operating industrial company (integrated aluminium producer) — the standard debt/EBITDA stress framework applies (MODULE_RULES.md, Business Type Applicability Gate). No material pending or recently-announced acquisition exists in the data pool (the only material deal, Alumetal, closed in 2023 and is already consolidated in the FY2025 balance sheet) — the pro-forma check in the workflow does not apply here; the stress base below is the reported/current balance sheet, not a pro-forma one.

**EBITDA basis used:** this report runs the primary stress on the **TTM reported EBITDA (NOK 21,976m, through 31-Mar-2026)** — the most current run-rate, and materially lower (−14.5%) than FY2025's full-year NOK 25,696m — paired with the latest (Q1 2026) balance-sheet net debt (NOK 22,503m, strict basis). This is the more conservative and more current pairing (per `01`, §6-7). The FY2025 annual figures are shown alongside throughout as the reference/reconciliation basis, since `04`'s own indicative covenant calculations were built on FY2025. Both bases are cash-backed: per `earnings/06_earnings-quality.md`, CFO/EBITDA is 79.4% (TTM) and 81.3% (3-year average), above the 70% "healthy" threshold — reported EBITDA is not materially inflated versus cash generation, so no adjustment for cash-backing is needed beyond using reported (not the company's further-adjusted) EBITDA, consistent with `01` and `04`'s canonical choice.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed, TTM through 31-Mar-2026) | NOK 21,976m | `01_capital-structure-and-leverage.md` §6-7; cross-checked `earnings/06_earnings-quality.md` (CFO/EBITDA TTM 79.4%) |
| Base EBITDA (FY2025 annual, reference) | NOK 25,696m | `01`, §5, §7 |
| Net debt (strict basis, canonical — Q1 2026 latest) | NOK 22,503m | `01`, §6 (canonical strict basis designated in `01` §4/§7) |
| Net debt (strict basis, FY2025 year-end, reference) | NOK 20,489m | `01`, §4, §7 |
| Net debt / EBITDA (TTM basis) | 1.02x | Derived: 22,503 / 21,976 |
| Net debt / EBITDA (FY2025 basis) | 0.80x | Derived: 20,489 / 25,696 |
| EBITDA / interest (TTM) | 9.82x | `04_coverage-and-covenants.md` §1 |
| EBITDA / interest (FY2025) | 10.90x | `04`, §1 |
| Tightest covenant + threshold | Max net leverage, **assumed** 3.5x (LABELED ASSUMPTION — no real covenant disclosed for parent-level debt) | `04`, §2-3 |
| Next-12m obligations (gross: maturities + cash interest + total capex + dividend floor) | NOK 24,663m | `03_liquidity-runway.md` §2 |
| Next-12m obligations (net-of-FCF basis: maturities + dividend floor only) | NOK 10,723m | `03`, §3 |
| Committed liquidity (restriction-adjusted, Q1 2026) | NOK 40,980m | `03`, §1 |
| Floating-rate debt (gross, confirmed) | NOK 1,500m (4.1% of gross debt) — Sustainability Linked Bond floating tranche, 3-month NIBOR + 2.000% | `01`, §1; `02_maturity-wall-and-refinancing.md` §3 |
| Rate type not disclosed | 75.6% of gross debt (NOK 27,634m) — true floating exposure could be materially higher than the confirmed 4.1% | `02`, §3 |
| Hedge coverage (if any) | Not disclosed for the floating tranche specifically; group-level LME/FX/power hedging exists but is not itemised against this instrument | `02`, §3; `business-model/10_external-dependency.md` |
| Working-capital seasonality / peak build | Not proven calendar-seasonal (too few quarters to test), but a real, disclosed price-cycle-driven outflow occurred in Q1 2026: net cash from operations of NOK (1,891)m against positive Adjusted EBITDA of NOK 8,668m | `03`, §3 ("Seasonality / Peak Liquidity Need" hard check) |

No EBITDA-base gap exists here — the stress test runs on full data, not the "Not assessable" partial-data path. Covenant thresholds ARE undisclosed for parent-level debt, so per the partial-data rule, this report runs the stress against `04`'s labeled-assumption covenants (3.5x max net leverage, 3.0x min EBITDA/interest) and **all covenant breach points below are indicative, not confirmed** — flagged throughout.

## 2. Stress Scenarios

*(All figures NOK millions unless stated. Covenant headroom is signed: positive = headroom remaining, negative = breached. Covenant thresholds are LABELED ASSUMPTIONS per `04` — indicative only.)*

| Metric | Base (TTM) | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock (+NOK1,891m outflow) | −40% + rates +200bp (on NOK1,500m confirmed floating) |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | 21,976 | 15,383 | 13,186 | 8,790 | 13,186 | 13,186 |
| Net debt used | 22,503 | 22,503 | 22,503 | 22,503 | 24,394 | 22,503 |
| Net debt / EBITDA | 1.02x | 1.46x | 1.71x | 2.56x | 1.85x | 1.71x |
| EBITDA / interest | 9.82x | 6.87x | 5.89x | 3.93x | 5.89x | 5.81x |
| Tightest covenant headroom (assumed 3.5x max leverage) | +70.9% | +58.2% | +51.2% | +26.9% | +47.1% | +51.2% |
| Covenant breach? (Y/N) | N | N | N | N | N | N |
| 12-month liquidity gap (uses − sources; negative = surplus) | −31,977 | −31,782 | −30,353 | −27,496 | −28,462 | −30,353 |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

Notes on the two additional shocks:
- **Working-capital shock**: no disclosed seasonal-build percentage exists (`03` explicitly finds working capital "not proven to be calendar-seasonal" in this pool). The labeled assumption used is the actual, disclosed Q1 2026 operating-cash outflow of NOK 1,891m (a real, price-cycle-driven working-capital build, not a calendar-seasonal one) — applied here as a one-time additional draw on the balance sheet (added to net debt for the leverage calculation, since it must be financed from somewhere if it recurs). Even doubled or tripled, this shock is small relative to the NOK 40,980m liquidity base.
- **Rate shock**: +200bp applied only to the NOK 1,500m confirmed floating-rate tranche (no hedge disclosed against it), adding NOK 30m of annual interest — immaterial (coverage moves from 5.89x to 5.81x at −40% EBITDA). This almost certainly **understates** true rate sensitivity: 75.6% of gross debt (NOK 27,634m) carries no disclosed rate type, so if a material share of that undisclosed balance is actually floating, the real rate-shock impact could be several times larger than shown here. This is a genuine disclosure gap, not evidence of low floating exposure — flagged, not resolved.
- A **market-closure scenario** (no new unsecured issuance for 12 months) is addressed in §4 below, consistent with `02`'s own finding that the 12-month wall is covered by cash alone.
- **Cyclical calibration**: Norsk Hydro is flagged as an extremely cyclical, price-taking commodity producer (`business-model/10_external-dependency.md`, risk score 74/100 inverted). However, this data pool discloses company-reported EBITDA for only three years (FY2023–FY2025); FY2022 (the post-COVID price-spike peak year, ROE 24.9%) has no disclosed EBITDA figure, so a true peak-to-trough EBITDA range cannot be built from this pool. The shallowest disclosed trough year available, FY2023 (ROE 2.6%), still shows reported EBITDA of NOK 23,291m — only **9.4% below** FY2025's NOK 25,696m, far shallower than the standard 30–60% haircuts above. This tells us reported EBITDA at Hydro is historically more stable than net income/ROE (large swings sit below the EBITDA line — impairments, derivative timing — per `earnings/06_earnings-quality.md`), but it also means the pool cannot corroborate or refute a genuine deep-cycle trough (e.g., a 2009- or 2015-style downturn) — the 30/40/60% haircuts above remain the primary, and in this case the more rigorous, read; no additional history-calibrated haircut column is added because the data does not support one beyond the shallow FY2023 data point already noted.

## 3. Break Points

*(All formulas executed via Python — see snippet below — not computed by hand.)*

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches — min EBITDA/interest coverage (assumed 3.0x floor) | **~69.4%** (TTM basis) / ~72.5% (FY2025 basis) |
| Tightest covenant breaches — max net leverage (assumed 3.5x ceiling) | **~70.7%** (TTM basis) / ~77.2% (FY2025 basis, matches `04`'s own calc exactly) |
| Committed liquidity exhausted within 12 months | **Does not breach on an EBITDA decline alone (h ≥ 1)** — see solve below |
| Net leverage exceeds an illustrative 6.0x refi-market threshold | **~82.9%** (TTM basis) |

**Executed solve (Python, shown in full):**

```
Inputs: EBITDA_TTM=21,976; net_debt_latest=22,503; interest_TTM=2,239
        FCF_TTM=5,810; maturities_12m=8,250; div_floor=2,473; liquidity=40,980; tax≈35%

(a) Leverage breach (MAX/ceiling, T=3.5x — direction-aware per 04/MODULE_RULES):
    h = 1 − net_debt / (T × EBITDA_base)
    h = 1 − 22,503 / (3.5 × 21,976) = 1 − 22,503/76,916 = 1 − 0.2926 = 0.7074 → ~70.7% (TTM)
    Check: net_debt / (T × EBITDA_base×(1−h)) = 22,503 / (3.5 × 6,429.4) = 3.500  ✓
    FY2025 basis: h = 1 − 20,489/(3.5×25,696) = 1 − 0.2279 = 0.7721 → 77.2% (ties to 04's own figure)

(b) Coverage breach (MIN/floor, T=3.0x):
    h = 1 − (T × interest) / EBITDA_base
    h = 1 − (3.0 × 2,239) / 21,976 = 1 − 6,717/21,976 = 1 − 0.3057 = 0.6943 → ~69.4% (TTM)
    FY2025 basis: h = 1 − (3.0×2,357)/25,696 = 1 − 0.2752 = 0.7248 → 72.5% (ties to 04's own figure)

(c) Refi-threshold breach (MAX form, T=6.0x, illustrative):
    h = 1 − 22,503/(6.0×21,976) = 1 − 0.1707 = 0.8293 → ~82.9%

(d) Liquidity exhaustion:
    Solve: liquidity + [FCF_base − EBITDA_base×h×(1−tax)] = (maturities_12m + div_floor)
    h = (liquidity + FCF_base − obligations) / (EBITDA_base × (1−tax))
    h = (40,980 + 5,810 − 10,723) / (21,976 × 0.65) = 36,067 / 14,284.4 = 2.52 → h ≥ 1
    Sanity check at h=100% (EBITDA→0 for a full year): stressed FCF = 5,810 − 21,976×0.65 = −8,474
      liquidity + stressed FCF = 40,980 − 8,474 = 32,506  vs.  obligations 10,723 → still covered ~3.0x
    Conclusion: liquidity does NOT exhaust on an EBITDA decline alone, even at a full collapse to zero —
    reported per the hard rule as "does not breach on EBITDA decline alone," not a fabricated finite %.
```

The coverage covenant (assumed) breaks marginally before the leverage covenant on both bases (69.4% vs 70.7% TTM; 72.5% vs 77.2% FY2025) — this is worth flagging because `04`'s own indicative-headroom framing (+263% coverage headroom vs +77% leverage headroom, using each covenant's own signed-headroom formula at *today's* actual levels) reads as if coverage has far more room. That framing is correct for headroom at the current level, but it is not the same question as "which EBITDA decline breaks it first" — coverage is a linear function of EBITDA (the covenant's numerator), while leverage is an inverse function of EBITDA (the covenant's denominator), so the two break-even points end up close together even though today's headroom percentages look very different. Both break points sit far beyond the standard 30–60% haircut range tested in §2 — no covenant breach occurs within any scenario modeled above.

## 4. Survival Read

Norsk Hydro survives a 30–60% EBITDA decline without a covenant breach, a liquidity gap, or any need for an equity raise, distressed asset sale, or covenant waiver — even the harshest modeled case (−60% EBITDA, net debt/EBITDA rising to 2.56x) leaves the assumed 3.5x leverage covenant with 26.9% headroom and liquidity in surplus by roughly NOK 27.5 billion. The structure only breaks under a genuinely extreme scenario: an EBITDA collapse of roughly 69–71% (TTM basis) — a decline far beyond a normal recession — which would breach the (unconfirmed, labeled-assumption) coverage covenant marginally before the leverage covenant; liquidity itself does not run out even if EBITDA fell to zero for a full year, because the NOK 40,980m of committed, restriction-adjusted liquidity dwarfs the NOK 10,723m of maturities-plus-dividend-floor obligations that liquidity would actually need to cover. A 30–40% EBITDA decline — the range of a normal recession, not a tail event — is comfortably survivable on the company's own balance sheet, with no external action required. **Market closure test:** assuming no new unsecured refinancing access for 12 months, liquidity still holds — the NOK 8,250m due within 12 months (per `02`) is covered 1.36x by cash on hand alone (NOK 11,251m, Q1 2026) before touching the NOK 24,194m fully undrawn, committed revolver or any FCF; nothing breaks first under closed markets because the near-term wall is small and pre-funded. Norsk Hydro is **not net cash** on the canonical strict basis (net debt NOK 22,503m, Q1 2026) — this is a low-leverage, liquidity-rich balance sheet rather than a net-cash one, and its resilience in this stress test comes from the combination of low starting leverage (1.02x TTM), deep committed liquidity (NOK 40,980m, ~1.9x the gross annual near-term uses bucket), and covenant thresholds (even if the real, undisclosed thresholds are tighter than the 3.5x/3.0x labeled assumptions used here) that would need to move a very long way before an EBITDA decline alone forces a breach. The two real, disclosed vulnerabilities this stress test cannot fully close are the same ones flagged upstream: 75.6% of the debt stack carries no disclosed rate type (so a genuine rate shock could be larger than modeled here), and the tightest covenant figures throughout are labeled assumptions, not confirmed thresholds — a real covenant at the part-owned-subsidiary level, undisclosed in amount or terms, remains a residual unknown this stress test cannot rule out.
