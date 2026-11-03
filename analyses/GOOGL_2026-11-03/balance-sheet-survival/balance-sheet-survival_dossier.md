# balance-sheet-survival Module Dossier — GOOGL

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `balance-sheet-survival_memo.md`.

- Generated: 2026-11-03T13:32:29Z
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

# Balance-Sheet-Survival Module — GOOGL (Synthesis)

## Abstract

Alphabet's strict net leverage is 0.40x, up from (0.10)x net cash in FY2023, while the broad basis that also nets marketable securities shows $135.3bn of net cash. Only $1.0bn is disclosed due within 12 months and is self-funded, but the full 24-month wall is not disclosed, leaving refinancing-risk confidence Low. Usable liquidity is $265.1bn with no finite runway on the matched FCF basis; contractual covenant headroom is not assessable. The matched stress survives a 60% EBITDA fall, and the first modelled failure is an illustrative, noncontractual leverage limit near a 91% fall. The verdict is Solid, not Fortress, because the maturity schedule, covenant terms, and commitment cash-flow split remain missing. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Notes 4, 6 and 10; CIQ Financials, LTM ended 2026-09-30; `01_capital-structure-and-leverage.md`, §§5–6; `06_downside-stress-test.md`, §§2–4]

## 1. Solvency Verdict

- **Verdict:** Solid
- **Net leverage (net debt / EBITDA):** 0.40x on the canonical strict basis: $129,823m gross debt, including $3,705m finance leases but excluding $20,508m operating leases, less $56,334m cash and equivalents, divided by $185,516m of Capital IQ-calculated LTM EBITDA. Gross leverage is 0.70x. The secondary broad basis, which also nets $208,764m of marketable securities, is $135,275m net cash, or (0.73)x. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Notes 4 and 6; CIQ Financials → Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`; `01_capital-structure-and-leverage.md`, §§4–5]
- **Liquidity runway:** No finite runway on the matched net-of-FCF basis. $265,098m of usable liquidity—$56,334m cash and equivalents plus $208,764m marketable securities, excluding the $10,000m revolver—plus $19,747m LTM FCF covers $4,018m of known uses outside FCF and leaves a $15,729m annual surplus. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Notes 6 and 11; CIQ Financials → Cash Flow, LTM ended 2026-09-30; `03_liquidity-runway.md`, §§1–3]
- **Maturity wall (% within 24 months):** Not assessable; the disclosed lower bound is 0.8% within 12 months, or $1,016m of $126,118m financial debt. The 2027 allocation is not disclosed. [Q3 FY2026 Form 10-Q, Note 6 (Debt); `02_maturity-wall-and-refinancing.md`, §§1–2]
- **Tightest covenant + headroom:** Not assessable. Actual thresholds, covenant EBITDA, addback limits, springing tests and cure rights are undisclosed. The 4.5x maximum net-leverage case and its 91.2% headroom are illustrative, not contractual. [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility); `04_coverage-and-covenants.md`, §§2–3]
- **Stress break point (EBITDA decline that breaks it):** Contractual failure is not assessable. On the matched model, the first failure is the illustrative 4.5x maximum-net-leverage sensitivity at a 91.2% EBITDA decline; liquidity does not exhaust on an EBITDA decline alone. A separate unmatched outer bound that treats all $213,400m of 12-month purchase commitments as incremental produces a funding gap from about a 36.6% decline, but it may double count operating cost and capex and is not a break forecast. [Q3 FY2026 Form 10-Q, Item 2 (Purchase Commitments and Other Contractual Obligations); `06_downside-stress-test.md`, §§2–4]
- **Solvency strength /100:** 70 — capped because the complete current maturity schedule is unavailable.
- **Liquidity runway /100:** 60 — capped because the $10,000m revolver's usable availability is not disclosed.
- **Refinancing risk /100 (higher = worse; inverted):** 25 — the disclosed 12-month maturity is covered 55.4x by cash alone, but the 24-month wall is unknown, so confidence is Low. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 6; `02_maturity-wall-and-refinancing.md`, §§2 and 4]
- **Covenant headroom /100:** Not assessable.
- **Downside resilience /100:** 78 — the matched model survives the required 30%–60% EBITDA haircuts, but actual covenants and the purchase-commitment cash-flow split are missing.
- **Data quality /100:** 70 — recent primary statements cover debt, cash flow, leases and contingencies, while the annual wall, covenant package and revolver availability remain incomplete. [`00_solvency-data-triage.md`, §§3, 5 and 6]
- **Overall usefulness /100:** 72 — below the hard maximum of 75 from missing covenant disclosure.
- **Biggest solvency risk:** $924,400m of purchase commitments, including $213,400m due within 12 months, is outside headline debt and is not split between cash flows already represented in FCF and incremental calls. [Q3 FY2026 Form 10-Q, Note 10 and Item 2; `05_off-balance-sheet-and-contingencies.md`, §§1 and 5]

## 1A. Module Disconfirmation

- **Strongest bear point:** The $213,400m 12-month portion of $924,400m purchase commitments is not in headline debt or the matched stress uses. Treating all of it as incremental, plus the $10,869m working-capital proxy, turns the −40% stress into a $5,182m funding gap; this is an unmatched outer bound because the filing does not separate overlap with operating cost and capex. [Q3 FY2026 Form 10-Q, Item 2; `05_off-balance-sheet-and-contingencies.md`, §§1 and 5; `06_downside-stress-test.md`, §2]
- **Strongest bull point:** $265,098m of cash, equivalents and marketable securities exceeds the full $129,823m filing-based gross-debt stack, while only $1,016m is disclosed due within 12 months. The matched −60% stress still shows 0.99x strict net leverage and a $188,217m liquidity surplus. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Notes 4 and 6; `06_downside-stress-test.md`, §§2 and 4]
- **Single killer risk:** *Inference, not from filings:* a large, earlier-than-modelled cash call from purchase commitments, data-centre backstops or guarantees could consume liquidity before the undisclosed 2027–2028 debt wall is reached; total data-centre support is $75,700m = $48,000m executed credit derivatives + $27,700m future backstops, and financial guarantees are $22,800m = $16,200m energy-related + $6,600m TPU repurchase guarantees. [Q3 FY2026 Form 10-Q, Notes 3, 5 and 10; `05_off-balance-sheet-and-contingencies.md`, §§2 and 5]
- **Disconfirming evidence already visible:** Strict net debt rose from $20,335m at FY2025 to $73,489m at Q3 FY2026, and LTM FCF fell to $19,747m after $159,804m of capex, even though the broad net-cash balance improved. This makes the direction worse on the canonical strict basis and stops the broad net-cash figure from carrying the verdict alone. [FY2025 Form 10-K and Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; CIQ Financials → Cash Flow, LTM ended 2026-09-30; `01_capital-structure-and-leverage.md`, §6]

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| solvency-data-triage | **Partial:** the module can run, but the complete maturity wall, covenant package and revolver availability are missing. | Current filing data covers debt, cash flow, leases and contingencies; the missing debt schedule caps solvency at 70, missing covenants make headroom not assessable, and unknown revolver availability caps liquidity at 60. [`00_solvency-data-triage.md`, §§5–6] |
| capital-structure-and-leverage | **Very low leverage, but rising on the strict basis.** | Gross debt is $129,823m, strict net debt is $73,489m and net leverage is 0.40x; broad net cash is $135,275m only after also netting $208,764m marketable securities. [`01_capital-structure-and-leverage.md`, §§4–7] |
| maturity-wall-and-refinancing | **Disclosed 12-month wall is self-funded; 24-month wall is not assessable.** | $1,016m, or at least 0.8% of financial debt, is due within 12 months versus $56,334m cash, but no annual allocation is available for 2027 onward. [`02_maturity-wall-and-refinancing.md`, §§1–2 and 4–5] |
| liquidity-runway | **No finite runway on the matched FCF basis; confidence capped.** | $265,098m usable liquidity plus $19,747m FCF covers $4,018m known uses and leaves a $15,729m surplus; the $10,000m revolver is excluded because availability is unknown. [`03_liquidity-runway.md`, §§1–5] |
| coverage-and-covenants | **Debt service is well covered; contractual headroom is not assessable.** | EBITDA/gross-interest coverage is 43.94x and post-capex coverage is 6.09x, but the actual covenant thresholds and EBITDA definition are absent. [`04_coverage-and-covenants.md`, §§1–4] |
| off-balance-sheet-and-contingencies | **Large commitment envelope requires a cash-flow split.** | Purchase commitments are $924,400m, including $213,400m due within 12 months; live data-centre backstops and financial guarantees total $98,500m = $75,700m + $22,800m. RF-OBS-001 fired. [`05_off-balance-sheet-and-contingencies.md`, §§1–5] |
| downside-stress-test | **Survives the required −30% to −60% matched stresses without external action.** | At −60%, strict leverage is 0.99x and liquidity surplus is $188,217m; the first matched-model failure is the noncontractual 4.5x leverage sensitivity at a 91.2% EBITDA decline. [`06_downside-stress-test.md`, §§2–4] |

## 3. Reconciliation

- **Debt and net-cash definitions:** The filing-based module build is $129,823m gross debt, including finance leases but excluding operating leases. Capital IQ reports $150,331m because it also includes $20,508m of operating-lease liabilities. The canonical strict net debt is therefore $73,489m; the $69,784m earnings-module figure excludes $3,705m finance leases. The broad net-cash readings also differ: $135,275m on the filing-based debt definition versus Capital IQ's $114,767m lease-inclusive basis. Reconciled view: use $129,823m gross debt and $73,489m strict net debt for leverage, show operating leases separately, and label either broad figure every time. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 4; `ciq_facts.json`, `total_debt_m` and `net_debt_m`; `01_capital-structure-and-leverage.md`, §§1 and 4]
- **Maturity detail:** The CIQ sidecar's $67,504m mixed debt-and-lease detail and roughly 9.8-year WAM are based on partial FY2025 detail and do not include the full 2026 issuance. The current filing shows $126,118m of financial debt but does not calendarise $125,102m of it. Reconciled view: the filing controls; only $1,016m within 12 months is precise, and the 24-month share and current WAM remain not assessable. [Q3 FY2026 Form 10-Q, Note 6; `ciq_facts.json`, `debt_maturity_wall`; `02_maturity-wall-and-refinancing.md`, §§1–2]
- **Interest coverage:** Capital IQ's 60.3x uses $3,076m of reported interest expense after capitalised interest. The coverage specialist adds an estimated $1,146m of capitalised interest to produce a $4,222m gross-interest proxy and 43.94x coverage. Reconciled view: use the more conservative 43.94x for survival analysis and preserve the denominator qualifier. [FY2025 Form 10-K and Q3 FY2026 Form 10-Q, Other Income (Expense); `ciq_facts.json`, `interest_coverage_x`; `04_coverage-and-covenants.md`, §1]
- **Usable liquidity:** Triage described the missing-facility treatment as cash-only, while the liquidity specialist included $208,764m of filing-disclosed marketable securities under the module's liquid-investment rule. Reconciled view: show the $56,334m cash-only floor and $265,098m usable-liquidity total already in hand, exclude the $10,000m revolver, and retain the liquidity-score cap of 60. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 6; `00_solvency-data-triage.md`, §5; `03_liquidity-runway.md`, §1]
- **Stress basis:** The matched stress excludes the $213,400m of purchase commitments due within 12 months because their overlap with capex and operating cost is unknown. The separate all-in overlay may double count those costs. Reconciled view: use the 91.2% illustrative leverage break as the matched-model anchor, but keep the 36.6% commitment overlay as a labelled outer bound, never as a forecast. [Q3 FY2026 Form 10-Q, Item 2; `06_downside-stress-test.md`, §§2–3]

## 3A. Fragility Map (what breaks first)

| Fragility Driver | Indicator | Current Status | Why It Matters |
|---|---|---|---|
| Maturity concentration | % due within 24m | **Not assessable; lower bound 0.8%.** $1,016m is current, while the 2027 allocation is missing. [Q3 FY2026 Form 10-Q, Note 6; `02_maturity-wall-and-refinancing.md`, §§1–2] | The disclosed 12-month wall is small, but the annual wall cannot be tested for a hidden 2027–2028 spike. |
| Availability liquidity | usable liquidity vs uses | $56,334m cash-only floor; $265,098m including marketable securities versus $4,018m known uses. The $10,000m revolver is excluded. [`03_liquidity-runway.md`, §§1–3] | The conclusion rests on assets already held, not on an unproven facility, but the purchase-commitment cash-flow split is missing. |
| Covenant illusion risk | covenant EBITDA vs reported | Contractual threshold, covenant EBITDA, addbacks, springing tests and cures are undisclosed; the 4.5x case is illustrative only. [`04_coverage-and-covenants.md`, §§2–3] | Apparent 91.2% illustrative headroom cannot be called actual headroom or used to predict a breach. |
| Floating-rate sensitivity | floating % net of hedges | About 2.7% gross contractual proxy; swaps convert an undisclosed portion of fixed debt to floating. A +200bp shock adds about $67.7m before the unknown swap effect. [Q3 FY2026 Form 10-Q, Notes 3 and 6; `02_maturity-wall-and-refinancing.md`, §3] | Direct exposure is small, but the undisclosed swap notional prevents a net-rate read. |
| Structural subordination | HoldCo debt vs upstreaming | Parent notes are senior unsecured. Waymo's October $5,000m secured facility is not guaranteed by Alphabet or other subsidiaries; draw status is unknown. [`01_capital-structure-and-leverage.md`, §§1 and 6A] | Waymo lenders have first recourse to disclosed Waymo collateral, while parent access to subsidiary cash is not fully mapped. |
| Contingent accelerants | CoC puts / cross-default | Change-of-control and cross-default terms are undisclosed. Data-centre support is $75,700m = $48,000m executed + $27,700m future; financial guarantees are $22,800m = $16,200m energy-related + $6,600m TPU-related. [`05_off-balance-sheet-and-contingencies.md`, §2] | Calls can arrive faster than scheduled debt maturities and consume cash before the formal wall. |

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No debt maturity schedule | Y — current schedule incomplete | Solvency strength | max 70; final 70 |
| No covenant disclosure | Y | Covenant headroom; overall usefulness | Not assessable; usefulness max 75, final 72 |
| No cash flow statement | N | Liquidity runway | No cap |
| Only annual data (no interim) | N — Q3 FY2026 filing available | Solvency strength | No cap |
| No EBITDA base (stress not run) | N | Downside resilience; usefulness | No cap |
| Off-balance-sheet exposures undisclosed for a known-litigious/levered name | N — major commitments and guarantees are disclosed, although some legal maxima are not estimable | Solvency strength | No cap |
| Revolver exists but availability unknown | Y | Liquidity runway | max 60; final 60 |
| Covenant headroom relies on assumed covenant-EBITDA addbacks | N — headroom is marked Not assessable and no assumed addbacks are credited | Covenant headroom | No numeric score assigned |
| HoldCo has material debt but upstreaming constraints unclear | N — the separate Waymo facility is mapped and not guaranteed by Alphabet; its draw is not included in the September debt stack | Solvency strength | No additional cap |

If multiple caps affect the same score, the most restrictive applies.

## 5. Survival Summary

Alphabet has $129,823m of gross debt, 0.70x LTM EBITDA, and $73,489m of strict net debt, 0.40x EBITDA; both are low, but strict net debt worsened from $20,335m at FY2025 and from net cash in FY2023. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Notes 4 and 6; `01_capital-structure-and-leverage.md`, §§5–6] The $1,016m disclosed 12-month maturity is self-funded by $56,334m cash, but the 24-month wall is not assessable because the filing does not allocate 2027 principal. [Q3 FY2026 Form 10-Q, Note 6; `02_maturity-wall-and-refinancing.md`, §§1–5] Usable liquidity is $265,098m and produces no finite matched-basis runway, while actual covenant headroom is not assessable and the $10,000m revolver is excluded. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 6; `03_liquidity-runway.md`, §§1–5; `04_coverage-and-covenants.md`, §§2–4] The structure survives the 30%, 40% and 60% EBITDA haircuts without an equity raise, asset sale or waiver; at −60%, strict leverage is 0.99x and the liquidity surplus is $188,217m, while the first matched-model break is the noncontractual 4.5x leverage sensitivity at a 91.2% decline. [`06_downside-stress-test.md`, §§2–4] A normal 30%–40% downturn is therefore survivable on the matched model, but the unmatched overlay of all $213,400m 12-month purchase commitments creates a possible gap from about a 36.6% decline and must not be treated as a forecast until the commitment cash-flow overlap is known. [Q3 FY2026 Form 10-Q, Item 2; `06_downside-stress-test.md`, §§2–4]

## 6. What Would Change The Solvency Verdict?

| Current Verdict | What Would Strengthen It | What Would Weaken It | Data Needed |
|---|---|---|---|
| Solid | A complete current annual maturity schedule showing no concentrated 2027–2028 wall; executed facility terms showing usable availability and no tight maintenance covenant; and a commitment cash-flow split showing that the $213,400m due within 12 months is already represented in operating cost and capex. | A large near-term maturity, a materially tighter actual covenant, restricted access to the $265,098m liquid-asset pool, sustained negative FCF, or proof that a large share of the $213,400m 12-month commitments is incremental to the matched stress. | **Single highest-value request:** the executed Alphabet revolving-credit agreements, including covenant definitions, springing tests, cure rights, letters of credit/reserves and actual availability. [`00_solvency-data-triage.md`, §6] |

## 6A. Survival Playbook (non-speculative levers)

- Alphabet issued $80,800m of senior notes in 2026, proving recent market access; this is completed funding, not a committed future refinancing source. [Q3 FY2026 Form 10-Q, Note 6; `02_maturity-wall-and-refinancing.md`, §4]
- The $208,764m marketable-securities portfolio is already included in usable liquidity and can fund obligations without new debt, subject to the filing's disclosed asset values; it is not counted again as a separate source. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 3; `03_liquidity-runway.md`, §1]
- The remaining $69,500m common-share repurchase authorization is discretionary and was excluded from committed uses, so future repurchases can be withheld to preserve cash. Currently declared distributions of $3,002m remain in known uses. [Q3 FY2026 Form 10-Q, Note 11; `03_liquidity-runway.md`, §2]
- No announced asset-sale program, proven capex-cut plan or prior covenant-amendment lever is evidenced in the specialist outputs; none is credited. [`02_maturity-wall-and-refinancing.md`, §4; `06_downside-stress-test.md`, §4]

## 7. Note To The Final Synthesizer

- Gross debt is $129,823m and gross leverage is 0.70x; strict net debt is $73,489m and strict net leverage is 0.40x. The strict series is worsening, from $20,335m net debt at FY2025 and $9,512m net cash at FY2023. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Notes 4 and 6; `01_capital-structure-and-leverage.md`, §§5–6]
- Only $1,016m is disclosed due within 12 months and cash covers it 55.4x, so that wall is self-funded. The 24-month share, current WAM and largest maturity year are not assessable; do not call the whole wall laddered. [`02_maturity-wall-and-refinancing.md`, §§1–5]
- Usable liquidity is $265,098m = $56,334m cash and equivalents + $208,764m marketable securities. It produces no finite runway on known uses and matched FCF, but the $10,000m revolver is excluded because actual availability is unknown. [`03_liquidity-runway.md`, §§1–5]
- Contractual covenant headroom is not assessable. The 4.5x leverage limit, 3.0x coverage floor and 91.2% illustrative headroom are sensitivities, not actual terms. [`04_coverage-and-covenants.md`, §§2–4]
- The largest off-balance-sheet amount is $924,400m of purchase commitments, including $213,400m due within 12 months. Separate data-centre support is $75,700m = $48,000m executed + $27,700m future, and financial guarantees are $22,800m = $16,200m energy-related + $6,600m TPU-related. [`05_off-balance-sheet-and-contingencies.md`, §§1–2 and 5]
- **RF-OBS-001 (contingent-liability spike)**
- The matched model survives a 60% EBITDA fall with 0.99x strict leverage and a $188,217m liquidity surplus; its first modelled failure is the noncontractual 4.5x leverage sensitivity at a 91.2% decline. Keep the 36.6% all-commitment overlay labelled as an unmatched outer bound, not a forecast. [`06_downside-stress-test.md`, §§2–4]
- Broad net cash is $135,275m after netting $208,764m marketable securities. This is counter-cyclical strategic flexibility—funding operations and investment without forced refinancing—not idle capital; retain the **broad** label and the $73,489m strict net-debt figure beside it. [`01_capital-structure-and-leverage.md`, §§4 and 7]
- Partial-data caps apply: solvency strength max 70 for the missing wall, covenant headroom Not assessable and usefulness max 75 for missing covenant terms, and liquidity runway max 60 for unknown revolver availability.
- Biggest missing data point: the executed revolving-credit agreements with actual availability, covenant definitions, springing tests, cure rights and reserve/letter-of-credit detail. [`00_solvency-data-triage.md`, §6]
- **Explicit handoff:** the master synthesizer's “Balance Sheet and Survival Test” section should defer to this synthesis. The stress break points here are the inputs for the master's downside scenario and risk register; the master, not this module, assigns probabilities.

## 8. Simple Summary

- Gross debt is $129.8bn. Strict net debt is $73.5bn. Gross leverage is 0.70x and strict net leverage is 0.40x; the strict debt trend is rising. [`01_capital-structure-and-leverage.md`, §§5–7]
- At least 0.8% of financial debt, or $1.0bn, is due within 12 months and is covered by cash. The full 24-month wall is unknown. [`02_maturity-wall-and-refinancing.md`, §§1–5]
- Usable liquidity is $265.1bn, made of $56.3bn cash and $208.8bn marketable securities. Known uses and LTM FCF produce no finite runway limit; the revolver is excluded. [`03_liquidity-runway.md`, §§1–5]
- The tightest real covenant and its headroom are not assessable. The 91.2% leverage cushion is illustrative only. [`04_coverage-and-covenants.md`, §§2–4]
- The biggest off-balance-sheet amount is $924.4bn of purchase commitments, with $213.4bn due within 12 months; how much is incremental cash use is not disclosed. [`05_off-balance-sheet-and-contingencies.md`, §§1 and 5]
- The matched model survives 30%–60% EBITDA drops. At −60%, leverage is 0.99x and the liquidity surplus is $188.2bn; the illustrative break is near a 91% drop. [`06_downside-stress-test.md`, §§2–4]
- A Capital IQ field shows an S&P foreign-currency long-term rating of AA+, but no primary rating-agency report is in the pool. The full maturity schedule and covenant package are the key gaps. [`00_solvency-data-triage.md`, §§2–3]
- This module is useful for the master synthesizer, but only with the stated caps: it proves high matched-basis stress capacity, not actual covenant headroom or a complete maturity wall.



---

## balance-sheet-survival / 00_solvency-data-triage.md

_Source: `00_solvency-data-triage.md`_

# Solvency Data Triage — GOOGL

Frozen evidence binding: `data/GOOGL/` is cited logically below; all reads used immutable generation `b83f382cc1013f6f74e77e7e630f56fff0ef9fb8eda70142f4d09e40a1af0ae0`. The manifest has 27 sources, all with extraction status `ok`; it has no `external` sources and no extraction failures or Drive pointers. File modified times below are the 2026-11-03 frozen-snapshot time, not a reporting date. [Pool extraction manifest, generation b83f382cc1013f6f74e77e7e630f56fff0ef9fb8eda70142f4d09e40a1af0ae0, source inventory]

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| Alphabet Inc NasdaqGS GOOGL Auditors.xls — Auditors | Workbook tab, 47KB, 159×6 | Reference data; period not stated | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Board Members.xls — Board Members | Workbook tab, 93KB, 28×25 | Reference data; period not stated | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Summary | Workbook tab, 234KB, 42×11 | LTM ended 2026-09-30; financials updated 2026-10-29 | 2026-11-03 16:04† | High |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Financials | Workbook tab, 234KB, 40×13 | LTM ended 2026-09-30 | 2026-11-03 16:04† | High |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Operational Metrics Charts | Workbook tab, 234KB, 21×19 | LTM ended 2026-09-30 | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Solvency Metrics Charts | Workbook tab, 234KB, 18×19 | LTM ended 2026-09-30 | 2026-11-03 16:04† | High |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Liquidity Metrics Charts | Workbook tab, 234KB, 15×19 | LTM ended 2026-09-30 | 2026-11-03 16:04† | High |
| Alphabet Inc NasdaqGS GOOGL Credit Health Panel.xls — Disclaimer | Workbook tab, 234KB, 26×1 | Reference data | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Customers.rtf | Capital IQ customer export, 2.49MB | Recently disclosed relationships; two-year view | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Events Calendar.xls — Events Calendar | Workbook tab, 30KB, 8×1 | Events through 2026 | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Key Stats | Workbook tab, 298KB, 100×12 | FY2025 ended 2025-12-31 | 2026-11-03 16:04† | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Income Statement | Workbook tab, 298KB, 115×11 | FY2025 ended 2025-12-31 | 2026-11-03 16:04† | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Balance Sheet | Workbook tab, 298KB, 98×11 | FY2025 ended 2025-12-31 | 2026-11-03 16:04† | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Cash Flow | Workbook tab, 298KB, 77×11 | FY2025 ended 2025-12-31 | 2026-11-03 16:04† | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Multiples | Workbook tab, 298KB, 91×42 | FY2025 / market data | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Historical Capitalization | Workbook tab, 298KB, 39×40 | FY2025 / history | 2026-11-03 16:04† | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Capital Structure Summary | Workbook tab, 298KB, 117×21 | FY2025 ended 2025-12-31 | 2026-11-03 16:04† | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Capital Structure Details | Workbook tab, 298KB, 47×10 | FY2025 ended 2025-12-31; filed 2026-02-05 | 2026-11-03 16:04† | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Ratios | Workbook tab, 298KB, 161×11 | FY2025 ended 2025-12-31 | 2026-11-03 16:04† | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Supplemental | Workbook tab, 298KB, 55×10 | FY2025 ended 2025-12-31 | 2026-11-03 16:04† | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Industry Specific | Workbook tab, 298KB, 24×10 | FY2025 ended 2025-12-31 | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Pension OPEB | Workbook tab, 298KB, 21×10 | FY2025 ended 2025-12-31 | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Annual.xls — Segments | Workbook tab, 298KB, 67×10 | FY2025 ended 2025-12-31 | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Key Stats | Workbook tab, 489KB, 100×12 | Q3 FY2026 ended 2026-09-30 | 2026-11-03 16:04† | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Income Statement | Workbook tab, 489KB, 113×40 | Q3 FY2026 ended 2026-09-30 | 2026-11-03 16:04† | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Balance Sheet | Workbook tab, 489KB, 98×40 | Q3 FY2026 ended 2026-09-30 | 2026-11-03 16:04† | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Cash Flow | Workbook tab, 489KB, 76×40 | Q3 FY2026 ended 2026-09-30 | 2026-11-03 16:04† | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Multiples | Workbook tab, 489KB, 91×42 | Q3 FY2026 / market data | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Historical Capitalization | Workbook tab, 489KB, 39×40 | Q3 FY2026 / history | 2026-11-03 16:04† | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Capital Structure Summary | Workbook tab, 489KB, 79×79 | Q3 FY2026 ended 2026-09-30 | 2026-11-03 16:04† | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Capital Structure Details | Workbook tab, 489KB, 47×10 | Source says Q3 FY2026 filed 2026-10-29; detailed block is FY2025 as reported | 2026-11-03 16:04† | High |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Ratios | Workbook tab, 489KB, 161×40 | Q3 FY2026 ended 2026-09-30 | 2026-11-03 16:04† | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Supplemental | Workbook tab, 489KB, 38×40 | Q3 FY2026 ended 2026-09-30 | 2026-11-03 16:04† | Medium |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Industry Specific | Workbook tab, 489KB, 24×40 | Q3 FY2026 ended 2026-09-30 | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Pension OPEB | Workbook tab, 489KB, 15×6 | Q3 FY2026; no data available | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls — Segments | Workbook tab, 489KB, 70×40 | Q3 FY2026 ended 2026-09-30 | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Key Developments.xls — Key Developments | Workbook tab, 1.03MB, 520×7 | One-year window through 2026-11-02 | 2026-11-03 16:04† | Medium |
| Alphabet Inc NasdaqGS GOOGL Professionals.xls — Professionals | Workbook tab, 75KB, 34×24 | Reference data; period not stated | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Public Company Profile.rtf | Capital IQ profile, 277KB | Quote updated 2026-11-02; reference data | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Public Ownership History.xls — History | Workbook tab, 930KB, 8,319×6 | Historical ownership; latest date not used here | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Public Ownership Insider Trading.xls — Insider Trading | Workbook tab, 7.11MB, 48,134×11 | Historical insider activity; latest date not used here | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Public Ownership Summary.rtf | Capital IQ ownership summary, 319KB | Reference data; period not stated | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Strategic Alliances.xls — Strategic Alliances | Workbook tab, 534KB, 368×7 | Recently disclosed relationships; two-year view | 2026-11-03 16:04† | Low |
| Alphabet Inc NasdaqGS GOOGL Suppliers.rtf | Capital IQ supplier export, 2.23MB | Recently disclosed relationships; two-year view | 2026-11-03 16:04† | Low |
| Alphabet Inc., Q2 2026 Earnings Call, Jul 22, 2026.rtf | Earnings-call transcript, 271KB | Q2 FY2026 / 2026-07-22 | 2026-11-03 16:04† | Medium |
| Alphabet Inc., Q3 2026 Earnings Call, Oct 28, 2026.rtf | Earnings-call transcript, 291KB | Q3 FY2026 / 2026-10-28 | 2026-11-03 16:04† | Medium |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Consensus | Workbook tab, 9.00MB, 886×101 | FY2026 current year; release expected 2027-02-02 | 2026-11-03 16:04† | Low |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Recent Changes | Workbook tab, 9.00MB, 265×10 | Estimate changes through current export | 2026-11-03 16:04† | Low |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Guidance | Workbook tab, 9.00MB, 125×17 | Guidance through current export | 2026-11-03 16:04† | Low |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Multiples | Workbook tab, 9.00MB, 25×7 | Current market data | 2026-11-03 16:04† | Low |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Surprise | Workbook tab, 9.00MB, 463×92 | Historical through Q3 FY2026 | 2026-11-03 16:04† | Low |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Trends | Workbook tab, 9.00MB, 414×20 | Estimate trends through current export | 2026-11-03 16:04† | Low |
| AlphabetIncNasdaqGSGOOGLEstimatesReport.xls — Revisions | Workbook tab, 9.00MB, 595×20 | Estimate revisions through current export | 2026-11-03 16:04† | Low |
| Alphabet_Inc-Annual_Report_2024.pdf | Audited annual report, 1.28MB | FY2024 ended 2024-12-31 | 2026-11-03 16:04† | Medium |
| Alphabet_Inc-Annual_Report_2025.pdf | Audited annual report, 1.19MB | FY2025 ended 2025-12-31 | 2026-11-03 16:04† | High |
| Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc | Audited FY2025 Form 10-K, 3.13MB | FY2025 ended 2025-12-31; filed 2026-02-05 | 2026-11-03 16:04† | High |
| Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc | Q3 FY2026 Form 10-Q, 2.53MB | Quarter and nine months ended 2026-09-30; filed 2026-10-29 | 2026-11-03 16:04† | High |
| Alphabet_Inc_-_Form_DEFA14A(Jun-05-2026).doc | Definitive additional proxy material, 241KB | 2026-06-05 | 2026-11-03 16:04† | Low |
| Company Comparable Analysis Alphabet Inc.xls — Financial Data | Workbook tab, 147KB, 50×17 | Current export; period not stated | 2026-11-03 16:04† | Medium |
| Company Comparable Analysis Alphabet Inc.xls — Trading Multiples | Workbook tab, 147KB, 50×9 | Current export; period not stated | 2026-11-03 16:04† | Low |
| Company Comparable Analysis Alphabet Inc.xls — Operating Statistics | Workbook tab, 147KB, 50×13 | Current export; period not stated | 2026-11-03 16:04† | Low |
| Company Comparable Analysis Alphabet Inc.xls — Business Description | Workbook tab, 147KB, 44×3 | Reference data | 2026-11-03 16:04† | Low |
| Company Comparable Analysis Alphabet Inc.xls — Implied Valuation | Workbook tab, 147KB, 69×9 | Current export; period not stated | 2026-11-03 16:04† | Low |
| Company Comparable Analysis Alphabet Inc.xls — Valuation Chart | Workbook tab, 147KB, 32×2 | Current export; period not stated | 2026-11-03 16:04† | Low |
| Company Comparable Analysis Alphabet Inc.xls — Credit Health Panel | Workbook tab, 147KB, 48×10 | Current export; period not stated | 2026-11-03 16:04† | High |
| Company Comparable Analysis Alphabet Inc.xls — Disclaimer | Workbook tab, 147KB, 26×1 | Reference data | 2026-11-03 16:04† | Low |
| ICEGATEPayment_007000BEINDEL40211471233439453.pdf | Payment document, 16KB | Period not identified | 2026-11-03 16:04† | Low |
| Price_Charting Excel Export - Nov 3rd 2026 2_23_42 pm.xls — Pane 1 | Workbook tab, 184KB, 1,290×3 | Price history through 2026-11-03 | 2026-11-03 16:04† | Low |
| Price_Charting Excel Export - Nov 3rd 2026 2_23_42 pm.xls — Raw | Workbook tab, 184KB, 0×0 | Empty tab | 2026-11-03 16:04† | Low |
| Price_Charting Excel Export - Nov 3rd 2026 2_23_42 pm.xls — Attributions | Workbook tab, 184KB, 80×2 | Attribution metadata | 2026-11-03 16:04† | Low |
| Short_Interest_Charting Excel Export Nov-03-2026 3_45 AM.xls — Chart 1 with Data | Workbook tab, 100KB, 284×2 | Short-interest history through 2026-11-03 | 2026-11-03 16:04† | Low |
| Short_Interest_Charting Excel Export Nov-03-2026 3_45 AM.xls — Attributions | Workbook tab, 100KB, 45×1 | Attribution metadata | 2026-11-03 16:04† | Low |

†Snapshot metadata only. Reporting periods above come from each document or tab; no source date is inferred from its modified time. No `data/GOOGL/external/` document is in the frozen pool, so no Section 1A external-data table applies. The relationship graph is available but only covers recently disclosed customers and suppliers, not the full counterparty base; it does not change the solvency sufficiency result. [Pool extraction manifest; relationships.json, scope notes]

## 2. Most Recent Sources

Age is measured from the financial period-end where one exists, rounded to one decimal month, as of 2026-11-03.

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---:|
| Annual filing (debt + contingency notes) | `Alphabet_Inc_-_Form_10-K(Feb-05-2026).doc` | FY2025 ended 2025-12-31; filed 2026-02-05 | 10.1 |
| Quarterly filing | `Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc` | Q3 FY2026 ended 2026-09-30; filed 2026-10-29 | 1.1 |
| Debt / capital-structure export | `Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls` — Capital Structure Summary / Details | Export source says Q3 FY2026 filed 2026-10-29; detailed debt block is FY2025 as reported | 1.1 / 10.1 |
| Fixed-income / maturities export | Same workbook — Capital Structure Details; `ciq_facts.json` `debt_maturity_wall` | FY2025 detail; sidecar built from latest as-reported detail | 10.1 |
| Cash flow statement | Q3 FY2026 Form 10-Q; CIQ Quarterly Financials — Cash Flow | Nine months ended 2026-09-30 | 1.1 |
| Covenant / credit-agreement disclosure | None | Facility amount and drawings are disclosed, but covenant terms/definitions are not | N/A |
| Credit rating report | No primary rating-agency report; CIQ Credit Health Panel only | LTM ended 2026-09-30; panel shows S&P foreign-currency LT rating field | 1.1 |

The annual filing contains the audited balance sheet, cash-flow statement, Debt note, lease note, and Commitments and Contingencies note. The current 10-Q refreshes the balance sheet, cash flow, Debt note, and commitments. [FY2025 Form 10-K, Consolidated Financial Statements; Note 6 (Debt); Note 10 (Commitments and Contingencies); Q3 FY2026 Form 10-Q, Consolidated Financial Statements; Note 6 (Debt); Note 10 (Commitments and Contingencies)]

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] | Debt, cash, and equity base are current to 2026-09-30. |
| Debt note (amounts by type) | Y | [Q3 FY2026 Form 10-Q, Note 6 (Debt)] | Identifies commercial paper, senior unsecured notes, current maturities, currencies, and other long-term debt. |
| Maturity schedule | N — incomplete | [Q3 FY2026 Form 10-Q, Note 6 (Debt)]; [CIQ facts sidecar, `debt_maturity_wall`, Q3 2026 workbook read] | The filing gives maturity ranges, but not a full annual principal wall. The sidecar identifies dated debt but also says $24.632bn is undated and has unknown timing; the exported detailed block remains FY2025. |
| Cash flow statement | Y | [Q3 FY2026 Form 10-Q, Consolidated Statements of Cash Flows] | Supports CFO, capex, FCF, and cash-interest analysis. |
| Committed / undrawn facility detail | N — availability not shown | [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] | The filing states $10.0bn of revolvers and no borrowings, but it does not state borrowing-base reserves, letters of credit, or available-to-draw capacity. |
| Interest expense detail | Y | [Q3 FY2026 Form 10-Q, Consolidated Statements of Income and Cash Flows] | Supports coverage ratios and cash-interest cross-checks. |
| Covenant disclosure | N | [Q3 FY2026 Form 10-Q, Note 6 (Debt and Credit Facility)] | No financial-covenant threshold, test period, or breach headroom is disclosed in the available materials. |
| Lease detail (operating/finance) | Y | [Q3 FY2026 Form 10-Q, Note 4 (Leases)] | Captures debt-like fixed obligations and future payments. |
| Pension / OPEB funded status | N | [CIQ Financials — Quarterly Pension/OPEB, Q3 FY2026: “No Data Available”] | No funded-status source is available for an off-balance-sheet obligation check. |
| Commitments & contingencies note | Y | [Q3 FY2026 Form 10-Q, Note 10 (Commitments and Contingencies)] | Records purchase commitments, letters of credit, guarantees, indemnities, and legal matters. |
| Credit ratings | Y — vendor field only | [Capital IQ Credit Health Panel — Summary, LTM 2026-09-30] | The vendor panel records S&P foreign-currency LT `AA+`; no rating-agency report is in the pool. |
| EBITDA base (for stress test) | Y | [ciq_facts.json, `ltm_ebitda_m`, CIQ Financials → Income Statement, LTM ended 2026-09-30] | Provides an LTM denominator; it remains a CIQ calculation rather than company-reported adjusted EBITDA. |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y — operating company | [Capital IQ Public Company Profile, current export; Q3 FY2026 Form 10-Q, Note 11 (Segments)] | Selects the operating-company survival framework; Alphabet is not a bank or insurer. |
| Revolver terms + availability / borrowing base | N — partial terms only | [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] | Expiry dates and zero borrowings are disclosed, but usable availability and borrowing-base / reserve detail are not. |
| Covenant EBITDA definition (addbacks / caps) | N | [Q3 FY2026 Form 10-Q, Note 6 (Debt and Credit Facility)] | Prevents a defensible covenant-headroom calculation and avoids treating reported EBITDA as covenant EBITDA. |
| HoldCo / OpCo structure disclosure | Y — limited, not a classic HoldCo/OpCo case | [Q3 FY2026 Form 10-Q, Note 6 (Debt)] | The filing identifies a $5.0bn Waymo secured term loan as not guaranteed by Alphabet or other subsidiaries, allowing that separate-debtor fact to be mapped. |
| Hedging / swaps disclosure | Y | [Q3 FY2026 Form 10-Q, Note 3 (Derivative Financial Instruments)] | Allows rate exposure to be assessed net of disclosed interest-rate derivatives. |
| Change-of-control / cross-default / rating triggers | N | [Q3 FY2026 Form 10-Q, Part II, Item 6 / Exhibit 4 disclosure] | Debt instruments governing these terms are not supplied in the pool; hidden accelerants are not assessable. |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | [Capital IQ Public Company Profile, current export] |
| Exchange | Nasdaq Global Select Market (`NasdaqGS:GOOGL`) | [Capital IQ Public Company Profile, current export] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | [Q3 FY2026 Form 10-Q, cover page; FY2025 Form 10-K, cover page] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | [CIQ Estimates — Consensus, current export; Q3 FY2026 Form 10-Q, financial statements] |
| Reporting currency (USD / INR / …) | USD | [Q3 FY2026 Form 10-Q, Consolidated Financial Statements] |
| Document language(s) | English | [FY2025 Form 10-K; Q3 FY2026 Form 10-Q; pool source inventory] |

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | Y — full current wall unavailable | 02, 06 | Refi-risk confidence Low; solvency strength max 70 |
| No covenant disclosure | Y | 04, 06 | Covenant headroom not assessable; overall usefulness max 75 |
| No cash flow statement | N | 03, 04, 06 | None |
| No undrawn-facility disclosure | Y — commitment/draw stated, usable availability not | 03 | Liquidity = cash only; do not add the revolver. Liquidity-runway confidence is capped; module rule caps score at 60 where revolver availability is unknown. |
| No interest-expense detail | N | 04 | None |
| No EBITDA base | N | 06 | None |

## 6. Sufficiency Verdict

- **Verdict:** Partial
- **Reason:** Recent primary balance-sheet, debt-by-type, cash-flow, lease, commitment, and EBITDA sources support capital-structure, liquidity, coverage, contingencies, and a cash-only stress test, but the pool lacks a complete current maturity wall, covenant terms, and demonstrable revolver availability.
- **Sections that can run:** capital structure; liquidity using cash only; coverage; contingencies; and stress test. The maturity-wall and covenant sections can run only with the stated gaps and caps.
- **Active partial-data caps:**
  - Refinancing-risk confidence Low and solvency strength maximum 70 because the complete current maturity schedule is not available.
  - Covenant headroom is Not assessable and overall usefulness maximum 75 because covenant terms and covenant EBITDA are absent.
  - Liquidity must exclude the revolver and liquidity-runway score is capped at 60 because availability is not disclosed.
- **Critical missing items:**
  - A current, complete principal-by-year debt maturity schedule for the 2026 debt stack, including the foreign-currency notes and Waymo facility.
  - Executed Alphabet revolving-credit agreements or an equivalent liquidity note showing availability, letters of credit/reserves, covenants, addback limits, springing tests, and change-of-control/cross-default provisions.
- **Single highest-value missing document:** Alphabet revolving-credit agreements (credit agreement), including covenant definitions and actual availability.



---

## balance-sheet-survival / 01_capital-structure-and-leverage.md

_Source: `01_capital-structure-and-leverage.md`_

# Capital Structure & Leverage — GOOGL

Alphabet reports under U.S. GAAP in USD. Amounts below are USD millions unless stated otherwise; the balance-sheet date is 30 September 2026, the latest filed interim period. Filing citations refer logically to the frozen `data/GOOGL/` documents named in the citation, not to a live path. EBITDA means earnings before interest, tax, depreciation and amortisation; Alphabet does not report a company-defined EBITDA measure, so the leverage denominator is Capital IQ's GAAP-derived LTM calculation of $185,516m, not management-adjusted EBITDA. [CIQ Financials → Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`]

## 1. Debt Stack

| Instrument | Amount | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Short-term debt / current portion | 1,016 | Alphabet Inc. | No — underlying notes are senior unsecured | Senior unsecured | None disclosed | Within 12 months; the specific series is not disclosed | Underlying coupon not separately disclosed | [Q3 FY2026 Form 10-Q, Note 6 (Debt)] |
| Bonds / notes, non-current carrying amount | 125,102 | Alphabet Inc. | No | Senior unsecured; the notes rank equally with each other | None | 2027–2126 across the disclosed series | Mostly fixed; coupons 0.43%–6.90%. Floating notes are $1.8bn USD at SOFR + 0.44%–0.60% and A$2.3bn at BBSW + 0.65%–0.90%, reset quarterly | [Q3 FY2026 Form 10-Q, Note 6 (Debt)] |
| Term loan | 0 at 30 September 2026; $5,000 facility entered in October 2026 | Waymo | Yes, for the October facility | Senior secured | Certain Waymo assets and subsidiaries, subject to carve-outs | October 2032 | Term SOFR + 5.25% | [Q3 FY2026 Form 10-Q, Note 6 (Debt)] |
| Revolver (drawn) | 0 | Alphabet Inc. | Not disclosed | Not disclosed | Not disclosed | $4,000 expires April 2027; $6,000 April 2030 | Formula using certain market rates; pricing not disclosed | [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] |
| Finance / capital leases | 3,705 | Consolidated Alphabet entities | Lease-specific; filing does not state group security ranking | Not disclosed | Leased data-centre, land and office assets | Payments extend beyond 2030 | 4.0% weighted-average discount rate | [Q3 FY2026 Form 10-Q, Note 4 (Leases)] |
| **Total gross debt** | **129,823** | **Consolidated Alphabet** | **Predominantly unsecured notes; finance leases separate** | **As above** | **As above** | **As above** | **As above** | **$125,102 non-current debt + $1,016 current portion + $3,705 finance leases; [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Notes 4 and 6]** |

The $129,823m filing-based gross-debt total includes finance leases, as required by the module, but excludes operating leases and the October Waymo facility because the latter was not in the 30 September balance sheet and the filing does not state the drawn amount. Alphabet's $25,000m commercial-paper programme had no borrowings. The $10,000m revolver was fully undrawn, so it is not debt. [Q3 FY2026 Form 10-Q, Note 6 (Debt)]

Capital IQ's deterministic workbook read reports $150,331m of total debt at 30 September. That is reconcilable, not an alternative filing debt figure: $129,823m filing debt plus $20,508m operating-lease liabilities equals $150,331m. The report uses the filing-based $129,823m as gross debt and reports operating leases separately. [CIQ Financials → Balance Sheet, Q3 ended 2026-09-30; `ciq_facts.json`, `total_debt_m`; Q3 FY2026 Form 10-Q, Note 4 (Leases)]

The CIQ maturity-detail sidecar separately reports only $67,504m of principal, which does not reconcile to the 10-Q's $127,485m total face value of long-term debt. This is a material vendor-detail gap, likely omitting the 2026 issuances; it is flagged for the maturity-wall agent rather than used here. [CIQ Financials → Capital Structure Details, Q3 ended 2026-09-30; `ciq_facts.json`, `debt_maturity_wall`; Q3 FY2026 Form 10-Q, Note 6 (Debt)]

Cross-default provisions, change-of-control puts and rating-linked pricing steps are **not disclosed in the data pool**. The debt note does state that fixed-rate notes other than the yen series are redeemable at specified prices; floating notes are not redeemable before maturity. [Q3 FY2026 Form 10-Q, Note 6 (Debt)]

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Operating leases (U.S. GAAP lease note) | 20,508 recorded liability; 24,439 undiscounted future payments | Excluded from canonical gross debt because U.S. GAAP presents operating leases separately; included in CIQ's $150,331m vendor total debt. Data centres, land and offices are the main assets. | [Q3 FY2026 Form 10-Q, Note 4 (Leases)] |
| Pension / OPEB underfunding | Not disclosed separately | No quantified defined-benefit liability or underfunding was identified in the latest filing; the CIQ Q3 pension/OPEB sheet says “No Data Available.” This is not proof that no obligation exists. | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; CIQ Financials → Pension/OPEB, Q3 2026] |
| Mandatory convertible preferred equity | 18,023 carrying value; $19,000 liquidation preference | Classified in equity, not in gross debt. It pays cumulative 6.25% dividends, cash or shares at Alphabet's election, and converts around 15 May 2029 if not earlier converted. | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 11 (Stockholders' Equity)] |

The filing also discloses $130,500m of uncommenced leases, mainly for data centres and energy infrastructure. They are not recorded liabilities at 30 September and are not added to debt; the off-balance-sheet agent should assess their overlap with the broader commitments disclosures. [Q3 FY2026 Form 10-Q, Note 4 (Leases)]

## 3. Cash & Liquid Assets

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | 56,334 | No separately reported restricted-cash balance at 30 September 2026; do not infer that all subsidiary cash is freely upstreamable | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| Liquid short-term investments / marketable securities | 208,764 | No restriction disclosed; the portfolio includes money-market funds, deposits, government and corporate debt securities, asset-backed securities and marketable equity securities | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 3 (Debt and Equity Securities)] |
| Restricted / trapped cash (flag) | Not separately disclosed | No restricted-cash line is reported at the latest balance-sheet date. Geographic or legal cash-trapping detail is not disclosed in the data pool. | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |

Total cash, cash equivalents and marketable securities were $265,098m. The filing identifies those assets, together with operating cash flow, as principal liquidity sources; the broad net-cash calculation below nevertheless remains a different measure from strict net debt because it nets marketable securities. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Item 2 (Liquidity and Capital Resources)]

## 4. Gross & Net Debt

| Metric | Value | Source |
|---|---:|---|
| Gross debt | 129,823 | $125,102 long-term debt + $1,016 current portion + $3,705 finance leases. Operating leases excluded. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Notes 4 and 6] |
| − Cash & equivalents | (56,334) | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| **Net debt (strict, §15)** | **73,489** | **$129,823 − $56,334. This is the canonical downstream figure.** |
| − Liquid short-term investments | (208,764) | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| **Net debt (broad, incl. investments)** | **(135,275) net cash** | **$129,823 − $56,334 − $208,764. Broad basis only; not the canonical figure.** |

The canonical strict basis follows §15 and avoids assuming that all marketable securities are cash-equivalent to debt repayment. It makes Alphabet a $73,489m net-debt company on that basis, while the broad basis shows $135,275m net cash and therefore real financial flexibility if the securities are available and liquid.

The CIQ sidecar's authoritative vendor read is $114,767m **net cash on a broad, lease-inclusive basis**: $150,331m CIQ total debt less $265,098m cash and short-term investments. The $20,508m difference from this report's $135,275m broad net cash is exactly the operating-lease liability that CIQ includes in debt. The earnings module's $69,784m strict net debt excludes the $3,705m finance-lease liability; this report includes finance leases under the module definition, producing $73,489m. These are definitional differences, not conflicting cash or debt readings. [CIQ Financials → Balance Sheet, Q3 ended 2026-09-30; `ciq_facts.json`, `net_debt_m` and `total_debt_m`; Q3 FY2026 Form 10-Q, Notes 4 and 6; `analyses/GOOGL_2026-11-03/earnings/01_historical-financials.md`, §2]

## 5. Leverage Ratios

EBITDA base: $185,516m LTM to 30 September 2026, a Capital IQ calculated, GAAP-derived measure; Alphabet does not disclose a company-adjusted EBITDA reconciliation. “Adjusted EBITDA” is therefore not assessable. [CIQ Financials → Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`; Q3 FY2026 Form 10-Q, Consolidated Statements of Income]

| Ratio | On GAAP-derived calculated EBITDA (not management-reported) | On Adjusted EBITDA | Source |
|---|---:|---:|---|
| Gross debt / EBITDA | 0.70x | Not disclosed | $129,823 ÷ $185,516. [Q3 FY2026 Form 10-Q, Notes 4 and 6; CIQ Financials → Income Statement, LTM ended 2026-09-30] |
| Gross debt / EBITDA, CIQ operating-lease-inclusive view | 0.81x | Not disclosed | $150,331 ÷ $185,516; reconciliation to the filing view is in Section 1. [CIQ Financials → Balance Sheet / Income Statement, Q3 ended 2026-09-30; `ciq_facts.json`, `total_debt_m`, `ltm_ebitda_m`] |
| Net debt / EBITDA — **strict basis** | 0.40x | Not disclosed | $73,489 ÷ $185,516. |
| Net debt / EBITDA — **broad basis** | (0.73)x net cash | Not disclosed | $(135,275) ÷ $185,516; secondary measure only. |
| Net debt / EBITDA — three-year normalised proxy | 0.59x strict | Not disclosed | $73,489 ÷ $124,705 average FY2023–FY2025 calculated EBITDA. Inference, not from filings: used because the business-model work flags high consumer-cycle exposure. [FY2025 Form 10-K, Consolidated Statements of Income; CIQ Financials → Income Statement, LTM ended 2026-09-30; `analyses/GOOGL_2026-11-03/business-model/10_external-dependency.md`, §1] |
| Debt / capital | 16.1% | n/a | $129,823 ÷ ($129,823 debt + $677,549 total equity). [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| Debt / equity | 19.2% | n/a | $129,823 ÷ $677,549 total equity. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |

The $185,516m denominator is cash-backed at the CFO level, but FCF after total capex fell to $19,747m LTM as capex rose to $159,804m. This does not change the leverage arithmetic, but it cautions against treating the current EBITDA level as cash freely available for debt retirement. [CIQ Financials → Cash Flow / Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ocf_m`, `ltm_ebitda_m`; `analyses/GOOGL_2026-11-03/earnings/06_earnings-quality.md`, §§1–2]

## 6. Leverage Trend

| Metric | FY2023 | FY2024 | FY2025 | Latest: Q3 FY2026 / LTM | Direction |
|---|---:|---:|---:|---:|---|
| Gross debt (filing debt plus finance leases; operating leases excluded) [FY2024 Form 10-K, Notes 4 and 6; FY2025 Form 10-K, Notes 4 and 6; Q3 FY2026 Form 10-Q, Notes 4 and 6] | 14,536 | 15,859 | 51,043 | 129,823 | Rising |
| Net debt — strict §15 basis [same filings; cash and equivalents less the gross-debt build] | (9,512) net cash | (7,607) net cash | 20,335 | 73,489 | Rising |
| Net debt / EBITDA — strict basis [same filings; CIQ Financials → Income Statement, LTM ended 2026-09-30] | (0.10)x | (0.06)x | 0.14x | 0.40x | Rising |

The strict series moved from $9,512m net cash in FY2023 to $73,489m net debt at Q3 2026. The direct driver is debt and finance-lease growth from $51,043m at FY2025 to $129,823m, after $85,222m of nine-month debt proceeds; 2026 senior-note issuances totalled $45.0bn in USD and $35.8bn in foreign currencies. The filing ties the new financing to general corporate purposes, while the contemporaneous $132.0bn nine-month capex and AI infrastructure plan show why this funding cycle matters; the filing does not allocate each borrowing dollar to a particular capex item. [Q3 FY2026 Form 10-Q, Consolidated Statements of Cash Flows; Note 6 (Debt); Item 2 (Capital Expenditures)]

The countervailing metric is broad net cash: it rose from $75,800m at FY2025 to $135,275m at Q3 2026 as cash plus marketable securities increased from $126,843m to $265,098m. This does not overturn the strict-leverage direction: cash equivalents rose only $25,626m, while filing debt plus finance leases rose $78,780m; the broad result depends on also netting $208,764m of marketable securities. [FY2025 Form 10-K, Consolidated Balance Sheets; Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Notes 4 and 6]

## 6A. HoldCo / OpCo & Structural Subordination (if applicable)

| Item | Evidence | Why It Matters |
|---|---|---|
| Where debt sits (HoldCo vs OpCo) | Alphabet Inc.'s notes are senior unsecured obligations that rank equally. Waymo separately entered a $5,000m senior secured term loan in October 2026; it is secured by Waymo assets/subsidiaries and is not guaranteed by Alphabet or its other subsidiaries. [Q3 FY2026 Form 10-Q, Note 6 (Debt)] | Waymo lenders have recourse to the disclosed Waymo collateral, while the September parent debt snapshot does not include that facility. This is a specific structural-subordination point, not evidence that all Alphabet debt is subordinated. |
| Upstreaming constraints (dividend blockers, regulatory) | Not disclosed in the data pool. | Parent-level access to subsidiary cash cannot be fully assessed from the reviewed debt note. |
| Material restricted / trapped cash | No restricted-cash balance or trapped-cash amount separately disclosed at 30 September 2026. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] | The $56,334m cash-equivalents balance is used in strict net debt without asserting every dollar is immediately upstreamable. |

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Gross debt:** **$129,823m** at 30 September 2026 — $126,118m of filing debt (current plus long-term) plus $3,705m finance leases; excludes $20,508m operating leases and the undrawn/undisclosed-draw October Waymo term loan. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Notes 4 and 6]
- **Canonical net debt:** **$73,489m, strict §15 basis** = gross debt less $56,334m cash and equivalents. This is the one downstream agents should use for debt and leverage calculations.
- **Broad net cash (secondary, not canonical):** **$135,275m** = cash, equivalents and $208,764m marketable securities less the same gross debt. It supports strategic flexibility but must always carry the **broad** label.
- **Cash & liquid investments:** **$56,334m cash and equivalents; $208,764m marketable securities; $265,098m total.** No separately reported restricted-cash amount. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets]
- **EBITDA base:** **$185,516m LTM**, Capital IQ calculated from reported data, not management-reported or adjusted. Latest period, not a company-defined mid-cycle measure. A three-year FY2023–FY2025 calculated-EBITDA average of $124,705m is a normalised proxy only. [CIQ Financials → Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`; FY2025 Form 10-K, Consolidated Statements of Income]
- **Net debt / EBITDA:** **0.40x on the strict canonical basis and GAAP-derived calculated EBITDA**; **adjusted EBITDA not disclosed**. Broad net cash / EBITDA is **(0.73)x**, labelled broad.
- **Reporting currency:** **USD.**

The positive flexibility signal is the $135,275m broad net-cash position, not a reason to call the company over-capitalised or to assume it should add debt. The strict $73,489m net-debt figure is more conservative and remains canonical because it does not treat the whole marketable-securities portfolio as cash. The material caveats are the October $5,000m Waymo facility's unconfirmed draw status and the CIQ maturity-detail discrepancy flagged in Section 1.



---

## balance-sheet-survival / 02_maturity-wall-and-refinancing.md

_Source: `02_maturity-wall-and-refinancing.md`_

# Maturity Wall & Refinancing — GOOGL

All figures are USD millions under U.S. GAAP unless stated otherwise. The balance-sheet date is 30 September 2026. This is a partial-data maturity read: the current 10-Q gives the current portion of debt and maturity ranges by issuance cohort, but not the principal due in each future year. Refinancing-risk confidence is therefore **Low**.

## 1. Maturity Schedule

| Period | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months | 1,016 | 0.8%* | Current portion of long-term notes | [Q3 FY2026 Form 10-Q, Note 6 (Debt), pp. 26–27] |
| Year 2 | Not disclosed | Not assessable | The $9,000 2020 U.S.-dollar note cohort spans 2027–2060; the filing gives no amount for 2027 | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| Year 3 | Not disclosed | Not assessable | Several cohorts begin in 2028, but no 2028 principal amount is disclosed | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| Year 4 | Not disclosed | Not assessable | Cohort maturity ranges include 2029; no annual allocation is disclosed | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| Year 5 | Not disclosed | Not assessable | Cohort maturity ranges include 2030; no annual allocation is disclosed | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| Thereafter / unallocated non-current balance** | 125,102 | 99.2%* | Senior unsecured note cohorts with disclosed ranges of 2027–2126, plus other long-term debt | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| **Total financial debt** | **126,118** | **100.0%** | **$1,016 current portion + $125,102 long-term debt** | **[Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 6 (Debt)]** |

*Percentages use the $126,118 financial-debt schedule, not the $129,823 gross-debt measure used by `01`. Thus 0.8% is a minimum next-12-month share: it excludes finance-lease principal because the filing does not allocate that principal by year.

**This is not a claim that all $125,102 is due after Year 5. It is the entire non-current carrying balance held outside annual buckets because the filing does not provide those buckets.

The reporting currency is USD. The schedule reconciles to the $126,118 of current plus long-term debt in the filing. `01` reports $129,823 gross debt because it also includes the $3,705 finance-lease liability. The lease note gives cash payments, not annual principal: $771 remaining in 2026, $499 in 2027, $487 in 2028, $466 in 2029, $395 in 2030 and $1,712 thereafter, or $4,330 total less $625 imputed interest = the $3,705 liability. Adding the $4,330 payment flow to debt principal would mix bases. [Q3 FY2026 Form 10-Q, Note 4 (Leases); `01_capital-structure-and-leverage.md`, §§1 and 7]

The deterministic CIQ workbook read reports a $67,504 mixed debt-and-lease principal block: $24,420 dated debt + $24,632 undated debt + $18,453 amortising leases (rounding accounts for the $1 difference), with a roughly 9.8-year WAM as of 31 December 2025. That is not a usable current wall: it includes lease payments without a refinancing maturity, leaves $24,632 undated, and predates the 2026 issuance of $45.0bn of U.S.-dollar and $35.8bn of foreign-currency senior notes. It therefore cannot reconcile to the 30 September 2026 filing's $127,485 face value of long-term debt; the current filing controls. [CIQ Financials → Capital Structure Details, latest as-reported block: `ciq_facts.json`, `debt_maturity_wall` (present); Q3 FY2026 Form 10-Q, Note 6 (Debt), pp. 26–27]

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years) | Not assessable for current debt; no annual principal schedule is disclosed. The CIQ 9.8-year figure is a FY2025 partial-detail read and is not used. [CIQ Financials → Capital Structure Details, `ciq_facts.json`, `debt_maturity_wall`] |
| % due within 12 months | At least 0.8% of financial debt: $1,016 ÷ $126,118. Finance-lease principal due is not separately disclosed. [Q3 FY2026 Form 10-Q, Note 6 (Debt); Note 4 (Leases)] |
| % due within 24 months | Not assessable; lower bound is 0.8%. The 2027 amount is not disclosed. [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| % due within 36 months | Not assessable; lower bound is 0.8%. The 2027–2028 annual allocations are not disclosed. [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| Largest single maturity year (and amount) | Not assessable. The largest disclosed *cohort* is $45,000 of 2026 U.S.-dollar notes, but its maturities span 2028–2066 rather than one year. [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |

The only precise near-term principal finding is the $1,016 current portion. The filing's maturity ranges show the next notes may begin in 2027, but a range is not an annual maturity schedule. Treating the $9,000 2020 U.S.-dollar cohort as a 2027 maturity, or the $45,000 2026 cohort as a 2028 maturity, would overstate the wall without evidence. *Inference, not from filings: the missing annual allocation is the main limitation in this read.*

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | About 96.4% of $127,485 face debt is identified as fixed-rate by contractual classification; this is before interest-rate swaps and excludes the $1,221 other-long-term-debt line with no rate classification | $122,878 proxy ÷ $127,485; build below. [Q3 FY2026 Form 10-Q, Note 6 (Debt), pp. 26–27] |
| Floating-rate share | About 2.7% of face debt on a gross contractual proxy, before swaps | $3,386 proxy ÷ $127,485; build below. [Q3 FY2026 Form 10-Q, Note 6 (Debt), pp. 26–27] |
| Weighted-average coupon | Not disclosed and not computable from the filing's cohort-level coupon ranges and multi-currency balances | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26] |
| Current market refi rate (matching tenor) | 5.60% ICE BofA AA U.S. corporate effective yield at 30 October 2026; a broad AA USD proxy, **not tenor-matched** because current WAM is not assessable | [Web: FRED / ICE BofA AA U.S. Corporate Index Effective Yield, 2026-10-30 (indicative, unverified)] |
| Estimated refi cost step-up (bps) | Not assessable at portfolio level: no portfolio weighted-average coupon and no single matching maturity. Illustrative only: 5.60% less the 5.55% coupon on Q3's $1,300 U.S.-dollar floating issue = +5bp, not a whole-debt estimate | [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 26; Web: FRED / ICE BofA AA U.S. Corporate Index Effective Yield, 2026-10-30 (indicative, unverified)] |

The gross floating proxy is reconstructable: $1,800 of U.S.-dollar floating notes plus $1,586 pro rata for the A$2.3bn floating tranche within the $3,861 USD carrying value of the A$3.3bn fixed and A$2.3bn floating notes (`$1,800 + $3,861 × 2.3 ÷ 5.6 = $3,386`). Known fixed-rate debt is `$127,485 − $3,386 − $1,221 = $122,878`; the remaining 1.0% is other long-term debt whose rate is not classified. This is an inference from the disclosed currency-tranche proportions, not a filing-provided rate split. [Q3 FY2026 Form 10-Q, Note 6 (Debt), pp. 26–27]

The CIQ sidecar instead labels $500 as floating and $67,004 as fixed in its FY2025 mixed debt-and-lease detail. That is materially different from the current filing, which alone identifies $1,300 of new U.S.-dollar floating issuance in Q3 2026, as well as $1,800 of U.S.-dollar and A$2.3bn of Australian-dollar floating notes outstanding at 30 September. The period and scope mismatch is therefore flagged rather than averaged with the filing; the current filing controls. [CIQ Financials → Capital Structure Details, `ciq_facts.json`, `debt_maturity_wall` (present); Q3 FY2026 Form 10-Q, Note 6 (Debt), pp. 26–27]

Alphabet also says interest-rate swaps convert a portion of fixed-rate debt to floating-rate debt, but does not disclose the swap notional. The 2.7% figure is therefore a gross contractual measure, not net economic exposure. A 200bp rise would add roughly $68 annually to interest on the $3,386 directly identified floating proxy (`$3,386 × 2%`), before the unknown swap effect. [Q3 FY2026 Form 10-Q, Note 3 (Derivative Financial Instruments); Note 6 (Debt)]

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities | Amount | Evidence |
|---|---:|---|
| Cash on hand | 56,334 | Cash and cash equivalents at 30 September 2026; no separate restricted-cash balance is reported. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| Marketable securities (not cash on hand; broad-liquidity source only) | 208,764 | Marketable securities at 30 September 2026. This is not netted in the strict cash-only debt measure. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 3 (Debt and Equity Securities)] |
| Forecast FCF (or recent run-rate, labeled) | No forecast available; recent LTM FCF was 19,747 | Recent run-rate only, not a forecast: $179,551 LTM CFO less $159,804 LTM capex. [CIQ Financials → Cash Flow / Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ocf_m` (present); `earnings/01_historical-financials.md`, §2] |
| Revolver availability (only if availability known) | Unknown; excluded from available funding | $10,000 of revolvers, $0 drawn; the filing does not disclose usable availability, reserves, or letters of credit. [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility), p. 27] |
| Asset-sale proceeds (only if announced / authorized) | Unknown / none identified | No announced or authorised asset sale was identified in the reviewed filing. [Q3 FY2026 Form 10-Q, Note 6 (Debt); Item 2 (Liquidity and Capital Resources)] |
| New debt issuance (only if committed / announced) | Unknown; excluded from repayment sources | No committed parent refinancing is disclosed. Waymo's October $5,000 secured term-loan facility is separate, its draw is not stated, and Alphabet does not guarantee it. [Q3 FY2026 Form 10-Q, Note 6 (Debt), p. 27] |

The disclosed next-12-month note principal of $1,016 is covered by cash alone 55.4 times (`$56,334 ÷ $1,016`), before the recent FCF run-rate or marketable securities. Accordingly, the conclusion for the disclosed 12-month wall is **self-funded / low refi risk**; it does not extend to a quantified 24-month wall because the 2027 allocation is missing. The $265,098 of cash, equivalents and marketable securities provides a further broad-liquidity cushion, but only the $56,334 cash balance is used in the strict measure. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 6 (Debt)]

Recent market access is evidenced by $80,800 of 2026 senior-note issuance. The only available rating read is a Capital IQ vendor field showing S&P foreign-currency long-term `AA+`; no rating-agency report is in the pool, so this is not treated as primary rating evidence. The LTM FCF run-rate is not a repayment forecast and has fallen to $19,747 as capex reached $159,804, so ongoing investment needs rather than the disclosed 12-month principal wall are the cash-use constraint. [Q3 FY2026 Form 10-Q, Note 6 (Debt); Capital IQ Credit Health Panel — Summary, LTM ended 2026-09-30; CIQ Financials → Cash Flow, LTM ended 2026-09-30; `earnings/01_historical-financials.md`, §2]

## 5. Refinancing Read

The reported wall is $1,016 within 12 months, or at least 0.8% of financial debt, versus $56,334 cash; Alphabet survives the next 12 months under a market-closure assumption of no new unsecured issuance, assuming the reported cash remains available. The actual 24- and 36-month wall, WAM, and portfolio refinancing step-up are **Not assessable** because the 10-Q does not allocate $125,102 of non-current debt by year or disclose a weighted-average coupon. The biggest refinancing risk is not the disclosed 12-month maturity but the unquantified 2027–2028 allocation following $80,800 of 2026 issuance, while capex has reduced LTM CFO-minus-capex FCF to $19,747. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 6 (Debt); CIQ Financials → Cash Flow, LTM ended 2026-09-30; `earnings/01_historical-financials.md`, §2]



---

## balance-sheet-survival / 03_liquidity-runway.md

_Source: `03_liquidity-runway.md`_

# Liquidity Runway — GOOGL

Alphabet reports under U.S. GAAP in USD. Amounts below are USD millions and use the latest filed balance-sheet date, 30 September 2026, unless noted. Free cash flow (FCF) means cash from operations less total capex; liquidity runway means the time committed funds can meet near-term needs.

## 1. Liquidity Sources (committed only)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | 56,334 | Y | No restricted-cash balance is separately reported. Geographic or legal cash-trapping detail is not disclosed, so this does not establish that every subsidiary dollar can be upstreamed immediately. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| Liquid short-term investments / marketable securities | 208,764 | Y | No restriction is disclosed. The portfolio includes deposits, money-market funds, government and corporate debt, asset-backed securities and marketable equity securities. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Item 2 — Cash, Cash Equivalents, and Marketable Securities] |
| Revolver / facilities (commitment) | 10,000 | No | $4,000 expires April 2027 and $6,000 April 2030; no amounts were drawn. Commitment is shown separately because usable availability, letters of credit and any reserves are not disclosed. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Note 6 — Credit Facility, p.27] |
| Revolver availability (if disclosed) | Not disclosed | No | Excluded from usable liquidity under the module rule; this makes the headline figure conservative to the extent the $10,000 commitment is available. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Note 6 — Credit Facility, p.27] |
| **Total usable liquidity** | **265,098** |  | **$56,334 cash and equivalents + $208,764 marketable securities; excludes the $10,000 revolver.** | **[data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Balance Sheets]** |

## 2. Near-Term Uses (next 12 months)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from 02) | 1,016 | This is the disclosed current portion of financial debt and therefore a minimum. The filing does not calendarise finance-lease principal; the lease-payment schedule cannot be put on the same 12-month principal basis. [analyses/GOOGL_2026-11-03/balance-sheet-survival/02_maturity-wall-and-refinancing.md, §§1–2; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Note 6 — Debt, pp.26–27] |
| Cash interest | Not separately disclosed | Not added on the net-of-FCF basis: cash interest paid is already inside cash from operations. [analyses/GOOGL_2026-11-03/earnings/06_earnings-quality.md, §1; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Statements of Cash Flows] |
| Maintenance capex | Not disclosed | Alphabet does not split maintenance from growth capex. Total LTM capex was $159,804 and is already deducted in FCF, so it is not added again. [analyses/GOOGL_2026-11-03/earnings/01_historical-financials.md, §§1–2; CIQ Financials → Cash Flow, LTM ended 2026-09-30] |
| Committed dividends / buybacks | 3,002 | Currently declared cash payments only: about $2,705 common dividend ($0.22 × 12,294m 30-September common shares) plus $297 mandatory-preferred dividend ($15.63 × 19m preferred shares), payable in November–December 2026. The calculation is an inference from filing-disclosed share counts and rates. The $69,500 remaining common-share repurchase authorization is discretionary and excluded. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Note 11 — Preferred and Common Dividends / Share Repurchases, pp.36–37] |
| **Total near-term uses** | **4,018 known uses outside FCF** | **$1,016 maturities + $3,002 currently declared cash distributions. Cash interest and total capex are deliberately excluded from this net-of-FCF total to avoid double counting.** |

## 3. Runway

| Metric | Value |
|---|---:|
| Total committed liquidity | 265,098 |
| Annual FCF (or proxy) | 19,747 |
| Basis used (net-of-FCF / gross-obligations) | Net-of-FCF |
| Annual net cash burn (on the stated basis — see step 4) | **(15,729) surplus** |
| Monthly net cash burn (annual burn ÷ 12) | **(1,311) surplus per month** |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **No finite runway — FCF covers the disclosed financing and declared-cash uses.** |

Formula: `$265,098` usable liquidity; annual net cash burn = `($1,016 debt maturities + $3,002 currently declared cash dividends/buybacks) − $19,747 FCF = −$15,729`. FCF covers the known $4,018 of outside-FCF uses 4.9×; a negative burn is an annual surplus, so it does not produce a finite months figure. Cash interest and capex are not re-added because FCF already includes them.

The $19,747 FCF equals $179,551 LTM CFO less $159,804 total LTM capex. The deterministic CIQ sidecar confirms the $179,551 CFO reading (`ltm_ocf_m`, status present); its separate `levered_fcf_m` value of **$(1,162.5)** is explicitly a vendor-defined levered-FCF measure after interest, not the required CFO-minus-capex FCF, so it is not substituted into this calculation. [CIQ Financials → Cash Flow, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ocf_m` and `levered_fcf_m`; analyses/GOOGL_2026-11-03/earnings/01_historical-financials.md, §§1–2]

### Seasonality / Peak Liquidity Need (Hard Check)

Historical revenue is somewhat seasonal, with Q4 averaging 28.0% of annual revenue, but the filing does not disclose a peak working-capital cash build. Q3 FY2026 alone had $42.3bn of CFO and $51.4bn of capex, a roughly $9.1bn quarterly FCF deficit; that is evidence of capex timing, not a disclosed peak working-capital requirement. **Peak working-capital need not disclosed — runway may be overstated.** [analyses/GOOGL_2026-11-03/earnings/01_historical-financials.md, §5; data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Liquidity and Capital Resources]

## 4. Sources & Uses Bridge

Internal sources cover the disclosed next-12-month uses: $265,098 of already-held cash and marketable securities covers the $4,018 of known debt maturity and declared cash distributions 66.0×, before the $19,747 of LTM FCF. No refinancing, asset sale or facility draw is required for those disclosed uses. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 6 — Debt; Note 11 — Preferred and Common Dividends]

All headline liquidity is already in hand; FCF does not need to materialise to meet the known $4,018. The conclusion beyond those known uses depends on FCF remaining positive while AI infrastructure spend stays high, and it excludes the $10,000 revolver because availability is not disclosed. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Note 6 — Credit Facility; Item 2 — Capital Expenditures and Leases]

## 5. Liquidity Read

On the required net-of-FCF basis, Alphabet has **no finite liquidity-runway limit**: $19,747 of LTM CFO-minus-capex FCF exceeds the $4,018 of disclosed 12-month debt maturity and currently declared cash distributions by $15,729. This read depends only partly on FCF because $265,098 is already held, but ongoing self-funding of capex does depend on FCF remaining positive. [CIQ Financials → Cash Flow, LTM ended 2026-09-30; analyses/GOOGL_2026-11-03/earnings/01_historical-financials.md, §2]

The biggest liquidity risk is AI capex reducing FCF faster than the base case assumes: Q3 CFO was $42.3bn against $51.4bn of capex, and the filing reports $132.0bn of nine-month capex. A second limitation is that the $1,016 disclosed maturity is only a minimum because the 2027 allocation and finance-lease principal timing are not disclosed. Revolver availability is unknown and excluded; therefore the liquidity-runway confidence is capped at 60 under the module partial-data rule. [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026 Form 10-Q, Item 2 — Liquidity and Capital Resources; Note 4 — Leases; Note 6 — Debt / Credit Facility]



---

## balance-sheet-survival / 04_coverage-and-covenants.md

_Source: `04_coverage-and-covenants.md`_

# Coverage & Covenants — GOOGL

Alphabet reports under U.S. GAAP in USD. Amounts below are USD millions unless stated otherwise; ratios use the LTM period ended 30 September 2026. Alphabet does not report company-defined EBITDA. The $185,516m denominator is Capital IQ's calculated LTM EBITDA, not management-adjusted EBITDA. The deterministic sidecar is the controlling workbook read: the four quarterly CIQ EBITDA fields sum to $185,891m, $375m (0.2%) higher, so this report uses $185,516m rather than silently substituting the quarterly sum. [CIQ Financials → Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`; `data/GOOGL/Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls`, CIQ Financials → Quarterly Income Statement, Q4 FY2025–Q3 FY2026]

## 1. Coverage Ratios

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest | 43.94x | $185,516 ÷ $4,222 gross-interest proxy. [CIQ Financials → Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`; FY2025 Form 10-K, Other Income (Expense) note; Q3 FY2026 Form 10-Q, Other Income (Expense) note] |
| EBIT / interest | 37.18x | $156,976 ÷ $4,222. [CIQ Financials → Quarterly Income Statement, Q4 FY2025–Q3 FY2026; FY2025 Form 10-K, Other Income (Expense) note; Q3 FY2026 Form 10-Q, Other Income (Expense) note] |
| (EBITDA − capex) / interest | 6.09x | ($185,516 − $159,804) ÷ $4,222. [CIQ Financials → Income Statement / Cash Flow, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`, `ltm_ocf_m`; `data/GOOGL/Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls`, CIQ Financials → Cash Flow, Q4 FY2025–Q3 FY2026] |
| Fixed-charge coverage | Not assessable | The pool provides annual and nine-month lease cash flows, but does not separate LTM scheduled debt amortisation from voluntary repayments; a matched-basis fixed-charge denominator cannot be built. [FY2025 Form 10-K, Note 4 (Leases); Q3 FY2026 Form 10-Q, Note 4 (Leases) and Consolidated Statements of Cash Flows] |

The interest denominator is a **gross-interest proxy**, not net interest income: reported LTM interest expense is $3,076m and is stated net of capitalised interest. This report adds back estimated LTM capitalised interest of $1,146m — $447m FY2025 less $301m in 9M FY2025 plus $1,000m in 9M FY2026 — giving $4,222m. It excludes interest income. The CIQ sidecar's 60.3x interest-coverage fact reconciles to $185,516m ÷ $3,076m = 60.31x because it uses reported interest expense after capitalisation; that is a different denominator, not a conflicting source read. [FY2025 Form 10-K, Other Income (Expense) note; Q3 FY2026 Form 10-Q, Other Income (Expense) note; CIQ Financials → Income Statement EBITDA ÷ Interest Expense, LTM ended 2026-09-30; `ciq_facts.json`, `interest_coverage_x`]

EBITDA is cash-backed at the CFO level: LTM CFO was $179,551m, or 96.8% of the CIQ EBITDA measure. The caution is the $159,804m capex burden, which leaves $19,747m of CFO-minus-capex FCF and reduces EBITDA-minus-capex interest coverage to 6.09x. This report does not treat EBITDA as adjusted or as a substitute for post-capex cash generation. [CIQ Financials → Cash Flow / Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ocf_m`, `ltm_ebitda_m`; `analyses/GOOGL_2026-11-03/earnings/06_earnings-quality.md`, §§1–2]

**Executed calculation check (Bash/AWK; USD millions):**

```text
$ awk 'BEGIN { ebitda=185516; ebit=156976; capex=159804; reported_interest=3076; capitalized_interest=(447-301)+1000; gross_interest=reported_interest+capitalized_interest; strict_net_debt=73489; max_leverage=4.5; min_coverage=3.0; printf("capitalized_interest_ltm=%.0f\\n", capitalized_interest); printf("gross_interest_ltm=%.0f\\n", gross_interest); printf("EBITDA/gross_interest=%.2fx\\n", ebitda/gross_interest); printf("EBIT/gross_interest=%.2fx\\n", ebit/gross_interest); printf("(EBITDA-capex)/gross_interest=%.2fx\\n", (ebitda-capex)/gross_interest); printf("CIQ_EBITDA/reported_interest=%.2fx\\n", ebitda/reported_interest); printf("max_leverage_actual=%.3fx\\n", strict_net_debt/ebitda); printf("max_leverage_headroom=%.1f%%\\n", (max_leverage-(strict_net_debt/ebitda))/max_leverage*100); printf("min_coverage_headroom=%.1f%%\\n", ((ebitda/gross_interest)-min_coverage)/min_coverage*100); printf("EBITDA_decline_to_leverage_breach=%.1f%%\\n", (1-((strict_net_debt/max_leverage)/ebitda))*100); printf("net_debt_increase_to_leverage_breach=%.0f\\n", max_leverage*ebitda-strict_net_debt); }'
capitalized_interest_ltm=1146
gross_interest_ltm=4222
EBITDA/gross_interest=43.94x
EBIT/gross_interest=37.18x
(EBITDA-capex)/gross_interest=6.09x
CIQ_EBITDA/reported_interest=60.31x
max_leverage_actual=0.396x
max_leverage_headroom=91.2%
min_coverage_headroom=1364.7%
EBITDA_decline_to_leverage_breach=91.2%
net_debt_increase_to_leverage_breach=761333
```

## 2. Covenant Inventory

The filed credit-facility summaries disclose $10,000m of revolvers ($4,000m due April 2027 and $6,000m due April 2030), all undrawn at 30 September 2026, but do **not** disclose financial-maintenance thresholds, testing conditions, covenant EBITDA definitions, addback limits, cure rights, or revolver-utilisation triggers. The pool contains no underlying credit agreement. Waymo also entered a $5,000m senior secured term loan in October 2026, due October 2032 at Term SOFR + 5.25%; its financial covenants are likewise not disclosed, and Alphabet does not guarantee it. Contractual covenant headroom is therefore **Not assessable** for scoring. [Q3 FY2026 Form 10-Q, Note 6 (Debt and Credit Facility); FY2025 Form 10-K, Note 6 (Credit Facility)]

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage | **Illustrative 4.5x maximum; not a disclosed contractual term** | 0.40x strict net debt / LTM EBITDA | +91.2% | Labeled market-style assumption only: $(4.5 - 0.396) / 4.5$. Actual covenant definition is undisclosed. Strict net debt is $73,489m. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; `analyses/GOOGL_2026-11-03/balance-sheet-survival/01_capital-structure-and-leverage.md`, §§4–5] |
| Min interest coverage | **Illustrative 3.0x minimum; not a disclosed contractual term** | 43.94x gross-interest proxy | +1,364.7% | Labeled market-style assumption only: $(43.94 - 3.0) / 3.0$. Actual covenant definition is undisclosed. [FY2025 Form 10-K, Other Income (Expense) note; Q3 FY2026 Form 10-Q, Other Income (Expense) note] |
| Min liquidity / net worth | Not disclosed | Not assessable | Not assessable | No contractual threshold in the data pool. [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] |
| Springing covenant trigger (e.g., revolver utilisation threshold) | Not disclosed | $10,000m revolvers undrawn; activation status not assessable | Not assessable | Facility balances are disclosed; testing trigger is not. [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] |
| Equity cure rights (Y/N, limits) | Not disclosed | Not assessable | Not assessable | No cure terms in the data pool. [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] |
| Other: Waymo term-loan covenants | Not disclosed | $5,000m facility entered October 2026; draw status and covenant terms not disclosed | Not assessable | [Q3 FY2026 Form 10-Q, Note 6 (Debt)] |

The illustrative rows are not evidence that Alphabet has a 4.5x leverage covenant or a 3.0x coverage covenant. They are sensitivity cases required by the partial-data rule, based on the conservative strict-net-debt measure from the upstream debt analysis rather than a covenant-defined net-debt measure.

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | Not disclosed. Illustrative calculations use CIQ's unadjusted calculated LTM EBITDA of $185,516m, not covenant EBITDA. | [CIQ Financials → Income Statement, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`; Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] |
| Addbacks permitted (types) | Not disclosed. | [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] |
| Addback caps / limits | Not disclosed. | [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility)] |
| Is covenant EBITDA materially above reported EBITDA? | Unknown. Alphabet does not report company EBITDA, and no covenant calculation is supplied. Headroom quality is unknown; this is an addback-illusion risk. | [Q3 FY2026 Form 10-Q, Consolidated Statements of Income; Note 6 (Credit Facility)] |

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | **Not assessable — contractual terms are undisclosed.** The smaller illustrative, noncontractual cushion is the assumed 4.5x maximum net-leverage case. |
| Headroom on tightest covenant (%) | **Not assessable contractually; illustrative maximum-leverage headroom: +91.2%.** |
| EBITDA decline that would breach it (approx.) | **Not assessable contractually; illustrative maximum-leverage case: 91.2%**, holding strict net debt at $73,489m. Breach EBITDA would be $16,331m ($73,489m ÷ 4.5). |
| Debt increase that would breach it (approx.) | **Not assessable contractually; illustrative maximum-leverage case: $761,333m** of additional strict net debt, holding EBITDA at $185,516m: $(4.5 × 185,516) - 73,489$. |

The interest-coverage sensitivity would reach its assumed 3.0x floor after an approximately 93.2% EBITDA decline, using the $4,222m gross-interest proxy. It is less restrictive than the assumed maximum-leverage sensitivity, but neither is a contractual breach test. [FY2025 Form 10-K, Other Income (Expense) note; Q3 FY2026 Form 10-Q, Other Income (Expense) note; CIQ Financials → Income Statement, LTM ended 2026-09-30]

## 4. Coverage / Covenant Read

Earnings carry the gross-interest proxy at 43.94x EBITDA/interest; after total capex the ratio is still 6.09x, although LTM CFO-minus-capex FCF is only $19,747m. [CIQ Financials → Income Statement / Cash Flow, LTM ended 2026-09-30; `ciq_facts.json`, `ltm_ebitda_m`, `ltm_ocf_m`; `data/GOOGL/Alphabet Inc NasdaqGS GOOGL Financials_Quarterly.xls`, CIQ Financials → Cash Flow, Q4 FY2025–Q3 FY2026]

The tightest actual covenant and its headroom are not proven from available data: the facility summaries disclose balance and maturity, not thresholds, definitions, or cure terms. The illustrative 4.5x maximum-leverage case shows 91.2% headroom and would require a 91.2% EBITDA decline or $761.3bn of additional strict net debt to fail, but it must not be used as a contractual breach forecast. [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility); `analyses/GOOGL_2026-11-03/balance-sheet-survival/01_capital-structure-and-leverage.md`, §§4–5]



---

## balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md

_Source: `05_off-balance-sheet-and-contingencies.md`_

# Off-Balance-Sheet & Contingencies — GOOGL

Alphabet reports under U.S. GAAP in USD. Amounts below are USD millions unless stated otherwise, and use the latest filed balance-sheet date, 30 September 2026. “Maximum / gross” is a contractual or notional ceiling, not a probability-weighted loss and not a claim that every amount would be called at once.

## 1. Off-Balance-Sheet / Debt-Like Obligations

| Item | Recognized Liability | Maximum / Gross Exposure | Already in 01's debt? | Source |
|---|---:|---:|---|---|
| Operating leases already commenced | 20,508 | 24,439 undiscounted future payments | No — excluded from the canonical debt stack; CIQ’s vendor debt measure includes it | [Q3 2026 Form 10-Q, Note 4 (Leases)] |
| Finance leases already commenced | 3,705 | 4,330 undiscounted future payments | Yes — included in 01’s $129,823m gross debt | [Q3 2026 Form 10-Q, Note 4 (Leases); `01_capital-structure-and-leverage.md`, §1] |
| Leases not yet commenced, mainly data centres and energy infrastructure | 0 | 130,500; commencement is 2026–2031 and non-cancellable terms run one to 26 years | No | [Q3 2026 Form 10-Q, Note 4 (Leases); Item 2, Purchase Commitments and Other Contractual Obligations] |
| Short-term lease arrangement | 0 | 6,000 remaining non-cancellable commitment | No | [Q3 2026 Form 10-Q, Note 4 (Leases)] |
| Pension / OPEB underfunding | Not separately disclosed | Not assessable; the Q3 Capital IQ pension/OPEB worksheet says “No Data Available,” which is not evidence of zero | No | [Q3 2026 Form 10-Q, Consolidated Balance Sheets; CIQ Financials → Pension/OPEB, Q3 2026 — vendor export] |
| Securitization / factoring | Not proven from available data | Not assessable; no quantified programme was identified in the filed notes reviewed | No | [Q3 2026 Form 10-Q, Notes 1–14] |
| Purchase, take-or-pay and content commitments | 0; the filing says these future commitments are not reflected on the balance sheet, subject to counterparty performance | 924,400, including 802,100 of contractual commitments with remaining terms over one year and 213,400 due within 12 months | No | [Q3 2026 Form 10-Q, Note 10 (Commitments); Item 2, Purchase Commitments and Other Contractual Obligations] |
| VIE funding and support commitments | 445 equity-derivative liability; the VIE investment carrying value itself is not material | 31,900, including 20,000 contingent on milestones through 2030 and 10,000 of Crux AI data-centre/energy backstops | No | [Q3 2026 Form 10-Q, Notes 3 and 5 (Derivative Financial Instruments; Variable Interest Entities)] |

The $6,000m short-term lease item is not added to the aggregate below because the filing does not state whether it is included in the $130,500m uncommenced-lease amount. Nor is the $31,900m VIE amount added: the filing explicitly includes its $10,000m Crux element in the $75,700m backstop total, while the relationship between its remaining funding elements and the separately disclosed $21,900m future equity-funding category is not fully reconciled. The tier-5 Capital IQ relationship graph is limited to recently disclosed suppliers and customers and has no Crux AI node; it cannot establish that this related-party backstop is arm’s-length. [Q3 2026 Form 10-Q, Notes 4–5; Capital IQ Suppliers/Customers relationship graph, retrieved 2026-11-03 — scope-limited vendor export]

## 2. Guarantees & Letters of Credit

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| Standby letters of credit | Not separately disclosed | 4,500; already included in the 802,100 long-term purchase-commitment figure and therefore not added again | Secures performance under long-term supply agreements | [Q3 2026 Form 10-Q, Note 10 (Commitments)] |
| Executed data-centre credit-derivative backstops | 606 derivative liability | 48,000; included in the 75,700 total data-centre financial-support amount below | Third-party data-centre lease payments and associated energy costs if the underlying party defaults | [Q3 2026 Form 10-Q, Note 3 (Derivative Financial Instruments); Item 2, Contingent Commitments] |
| Future data-centre and energy-infrastructure backstops | No separately disclosed liability | 27,700, including 10,000 with related party Crux AI; included in the 75,700 total | Future backstops for data-centre and energy-supply infrastructure | [Q3 2026 Form 10-Q, Note 5 (Variable Interest Entities); Item 2, Contingent Commitments] |
| Total data-centre financial support | 606 credit-derivative liability for the executed portion; future-backstop carrying amount not separately disclosed | 75,700 = 48,000 executed credit derivatives + 27,700 future backstops | Data-centre leases and energy costs / infrastructure | [Q3 2026 Form 10-Q, Note 3; Item 2, Contingent Commitments] |
| Financial guarantees | Fair value not material; this is not a disclosed zero | 22,800 = 16,200 for power-purchase / energy-equipment procurement + 6,600 TPU-hardware repurchase guarantee | Energy-infrastructure counterparties and hardware customers; Alphabet says customers lack economic incentive to exercise the TPU repurchase option | [Q3 2026 Form 10-Q, Note 10 (Financial Guarantees); Item 2, Contingent Commitments] |
| Performance / surety bonds | Not separately disclosed | Not separately disclosed | Not proven from available data | [Q3 2026 Form 10-Q, Note 10 (Commitments and Contingencies)] |

## 3. Litigation & Tax Contingencies

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) | Source |
|---|---:|---:|---|---|
| Antitrust, privacy, regulatory and other legal matters | 13,800 of short-term accrued legal and regulatory fines and settlements, not allocated by case | Indeterminate. Alphabet says some matters seek speculative, substantial or indeterminate monetary amounts and it may be unable to estimate a reasonably possible loss or range. | Active. Alphabet records a liability when loss is probable and estimable; the filing does not provide a case-by-case probability or maximum for the remaining matters. | [Q3 2026 Form 10-Q, Note 10 (Legal Matters); Item 2, Accrued Legal and Regulatory] |
| Unrecognized tax benefits / uncertain tax positions | 12,200 long-term income taxes payable, primarily related to unrecognized tax benefits | Timing and amount of payment cannot be estimated beyond the recorded liability | Active tax uncertainty; not labelled remote | [Q3 2026 Form 10-Q, Item 2, Taxes; Note 14 (Income Taxes)] |
| Contractual indemnifications | No material claim provision separately disclosed | Not estimable | No material indemnification claims were probable or reasonably possible at 30 September 2026; this is not an assertion that every future claim is remote. | [Q3 2026 Form 10-Q, Note 10 (Indemnifications)] |

The recorded legal/regulatory balance fell from $15,600m at 31 December 2025 to $13,800m at 30 September 2026, but that is not evidence that aggregate legal exposure fell: the Q3 filing still says the loss range for some active matters cannot be estimated. Long-term tax payable rose from $9,500m to $12,200m over the same period. [FY2025 Form 10-K, Item 7 (Accrued Legal and Regulatory; Taxes); Q3 2026 Form 10-Q, Item 2 (Accrued Legal and Regulatory; Taxes); Note 10 (Legal Matters)]

## 4. Contingent Exposure Summary

| Metric | Value |
|---|---:|
| Total recognized contingent liabilities | 51,264 = 20,508 operating leases + 3,705 finance leases + 606 credit-derivative liability + 445 equity-derivative liability + 13,800 accrued legal/regulatory + 12,200 uncertain-tax liability |
| Total maximum / gross exposure | 1,175,300 = 924,400 purchase commitments + 130,500 uncommenced leases + 21,900 future equity-funding commitments + 75,700 data-centre backstops + 22,800 financial guarantees |
| Max exposure ÷ recognized | 22.93x = 1,175,300 ÷ 51,264 |
| Max exposure ÷ total equity | 173.5% = 1,175,300 ÷ 677,549 |

The $1,175,300m figure is a **gross disclosure envelope**, not a simultaneous-loss estimate: it mixes firm future purchases, lease payments, funding commitments and contingent guarantees. It excludes unquantifiable legal claims and indemnities, so it is not a ceiling on every possible liability. It also does not add $4,500m of letters of credit or $31,900m of VIE commitments because those are already included in the component disclosures or may overlap; the filing does not quantify every overlap. Total equity of $677,549m is at 30 September 2026. [Q3 2026 Form 10-Q, Consolidated Balance Sheets; Item 2, Purchase Commitments and Other Contractual Obligations; Note 10 (Commitments and Financial Guarantees)]

## 5. Contingency Read

The largest disclosed off-balance-sheet obligation is $924,400m of purchase commitments, of which $213,400m is due within 12 months; it increased from $149,100m at FY2025 and is not captured in headline debt. [FY2025 Form 10-K, Item 7, Purchase Commitments and Other Contractual Obligations; Q3 2026 Form 10-Q, Item 2, Purchase Commitments and Other Contractual Obligations]

The live contingent component is $98,500m of data-centre backstops and financial guarantees, including a $10,000m related-party Crux AI backstop; the filing says some guarantees may deliver assets or have limited economic incentive to be exercised. [Q3 2026 Form 10-Q, Notes 5 and 10; Item 2, Contingent Commitments]

The filing gives neither a probability nor a timing distribution for these calls, while legal, tax, pension and indemnity maxima remain partly unquantified; the $1,175,300m gross total is therefore a warning measure, not a solvency forecast. [Q3 2026 Form 10-Q, Notes 4, 5 and 10; Item 2, Purchase Commitments and Other Contractual Obligations]

RF-OBS-001 (contingent-liability spike)



---

## balance-sheet-survival / 06_downside-stress-test.md

_Source: `06_downside-stress-test.md`_

# Downside Stress Test — GOOGL

Alphabet reports under U.S. GAAP in USD. All figures below are USD millions unless stated otherwise. EBITDA is a Capital IQ calculation from reported data, not management-adjusted EBITDA; Alphabet does not disclose a company EBITDA measure or adjustment reconciliation.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | 185,516 LTM; CFO was 179,551, or 96.8% of EBITDA | [CIQ Financials→Income Statement “EBITDA” [LTM 12 months Sep-30-2026]; `ciq_facts.json`, `ltm_ebitda_m`; CIQ Financials→Cash Flow “Cash from Ops.” [LTM 12 months Sep-30-2026]; `ciq_facts.json`, `ltm_ocf_m`] |
| Net debt | 73,489 strict basis = 129,823 gross debt, including 3,705 finance leases, less 56,334 cash and equivalents; operating leases and marketable securities excluded | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Notes 4 and 6 (Leases and Debt)] |
| Net debt / EBITDA | 0.40x strict basis | 73,489 ÷ 185,516; [Q3 FY2026 Form 10-Q, Notes 4 and 6; CIQ Financials→Income Statement “EBITDA” [LTM Sep-30-2026]; `ciq_facts.json`, `ltm_ebitda_m`] |
| EBITDA / interest | 43.94x on a 4,222 gross-interest proxy, including estimated capitalised interest | [FY2025 Form 10-K, Other Income (Expense) note; Q3 FY2026 Form 10-Q, Other Income (Expense) note; `04_coverage-and-covenants.md`, §1] |
| Tightest covenant + threshold | Contractual covenant and threshold not disclosed. Sensitivity only: 4.5x maximum strict net leverage; 91.2% illustrative headroom | [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility); `04_coverage-and-covenants.md`, §§2–3] |
| Next-12m obligations | 4,018 known uses outside FCF = 1,016 debt due + 3,002 currently declared common and preferred dividends; this is not a full forecast of purchase commitments | [Q3 FY2026 Form 10-Q, Note 6 (Debt); Note 11 (Dividends); `03_liquidity-runway.md`, §2] |
| Committed liquidity | 265,098 = 56,334 cash and equivalents + 208,764 marketable securities; excludes the 10,000 revolver because availability is undisclosed | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 6 (Credit Facility)] |
| Floating-rate debt (gross) | 3,386 direct contractual proxy, about 2.7% of 127,485 debt face value; swaps may raise or lower net exposure | [Q3 FY2026 Form 10-Q, Notes 3 and 6; `02_maturity-wall-and-refinancing.md`, §3] |
| Hedge coverage (if any) | Interest-rate swaps convert an undisclosed portion of fixed debt to floating; hedge notional and net floating exposure are not disclosed | [Q3 FY2026 Form 10-Q, Note 3 (Derivative Financial Instruments)] |
| Working-capital seasonality / peak build | Not disclosed. Stress uses the 10,869 increase in inventory from 31 December 2025 to 30 September 2026 as a labelled partial working-capital cash-outflow proxy, not as a disclosed seasonal peak | [FY2025 Form 10-K, Consolidated Balance Sheets; Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; `06_earnings-quality.md`, §3] |

The reporting currency is USD. The 185,516 base is cash-backed at the CFO level, but not at the free-cash-flow level: LTM CFO less total capex was only 19,747 after 159,804 of capex. The CIQ sidecar's present 60.3x interest-coverage fact uses reported interest expense after capitalised interest; the 43.94x used here is the more conservative gross-interest proxy, so the two figures are definitionally different rather than conflicting. [CIQ Financials→Cash Flow / Income Statement [LTM Sep-30-2026]; `ciq_facts.json`, `ltm_ocf_m`, `ltm_ebitda_m`, `interest_coverage_x`; `04_coverage-and-covenants.md`, §1]

The deterministic CIQ balance-sheet read is 150,331 total debt and (114,767) net debt, meaning net cash on CIQ's broad, lease-inclusive basis. It reconciles to the filing read: CIQ includes 20,508 of operating-lease liabilities in debt and nets the full 265,098 cash-and-marketable-securities pool. This report instead uses the stricter filing-based 73,489 net-debt measure throughout, so the difference is definitional rather than a competing balance-sheet fact. [CIQ Financials→Balance Sheet “Total Debt” and “Net Debt” [Q3 Sep-30-2026]; `ciq_facts.json`, `total_debt_m`, `net_debt_m`; Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 4 (Leases)]

No material pending acquisition not reflected in the 30 September balance sheet was identified. Wiz and Intersect were closed in March 2026; no acquisition pro-forma adjustment is therefore made. The October 2026 Waymo 5,000 senior secured term-loan facility is not added because its draw status is not disclosed and it was not on the 30 September balance sheet. [Q3 FY2026 Form 10-Q, Notes 6 and 8 (Debt; Acquisitions and Divestitures)]

## 2. Stress Scenarios

The stressed FCF calculation is `FCF(h) = 19,747 − 185,516 × h × (1 − 16.8%)`, where `h` is the EBITDA haircut. It holds capex, cash interest and known financing uses fixed; 16.8% is the FY2025 effective tax rate. The liquidity gap is `known uses − (usable liquidity + stressed FCF)`; a negative gap is a surplus. The working-capital column adds the 10,869 inventory-build proxy. The rate column adds 67.7 of cash interest, equal to 3,386 direct floating-rate debt × 200bp, before any tax benefit or unknown swap effect. [FY2025 Form 10-K, Note 14 (Income Taxes); Q3 FY2026 Form 10-Q, Notes 3 and 6; `03_liquidity-runway.md`, §§2–3]

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | 185,516 | 129,861 | 111,310 | 74,206 | 111,310 | 111,310 |
| Net debt / EBITDA | 0.40x | 0.57x | 0.66x | 0.99x | 0.66x | 0.66x |
| EBITDA / interest | 43.94x | 30.76x | 26.36x | 17.58x | 26.36x | 25.95x |
| Tightest covenant headroom | Not assessable contractually; +91.2% illustrative | Not assessable; +87.4% illustrative | Not assessable; +85.3% illustrative | Not assessable; +78.0% illustrative | Not assessable; +85.3% illustrative | Not assessable; +85.3% illustrative |
| Covenant breach? (Y/N) | Not assessable; N on illustrative case | Not assessable; N on illustrative case | Not assessable; N on illustrative case | Not assessable; N on illustrative case | Not assessable; N on illustrative case | Not assessable; N on illustrative case |
| 12-month liquidity gap | (280,827) surplus | (234,522) surplus | (219,087) surplus | (188,217) surplus | (208,218) surplus | (219,020) surplus |
| Survives without external action? (Y/N) | Y* | Y* | Y* | Y* | Y* | Y* |

\*On the matched FCF basis and known uses above. It is not a contractual-covenant conclusion, and it is not a full forecast of the 213,400 of disclosed purchase commitments due within 12 months.

The direct floating-rate proxy is small, but the actual economic rate exposure is not computable because the swap notional is undisclosed. The company is not classified as a deep commodity or cyclically calibrated name by the business-model input; the required −30%/−40%/−60% cases therefore remain the relevant set, with advertising demand and regulation as the main external risks rather than a demonstrated commodity trough. [Q3 FY2026 Form 10-Q, Note 3; `10_external-dependency.md`, §§1–3]

All scenarios assume zero management mitigation — this is a survival bound, not a forecast; the earnings module's realised-offset case (`earnings/07` §2) is the expected-outcome read.

**Executed calculation check (Bash/AWK; USD millions):**

```text
$ awk 'BEGIN {e=185516; nd=73489; i=4222; f=19747; t=.168; l=265098; o=4018; w=10869; r=3386*.02; split("0 .3 .4 .6",hs," "); for(n=1;n<=4;n++){h=hs[n]; se=e*(1-h); sf=f-e*h*(1-t); printf("haircut=%.0f%% EBITDA=%.1f leverage=%.3fx coverage=%.2fx leverage_headroom=%.1f%% gap=%.1f\\n",h*100,se,nd/se,se/i,(4.5-nd/se)/4.5*100,o-(l+sf))} h=.4; se=e*(1-h); sf=f-e*h*(1-t); printf("40%%+WC EBITDA=%.1f leverage=%.3fx coverage=%.2fx leverage_headroom=%.1f%% gap=%.1f\\n",se,nd/se,se/i,(4.5-nd/se)/4.5*100,(o+w)-(l+sf)); printf("40%%+200bp EBITDA=%.1f leverage=%.3fx coverage=%.2fx leverage_headroom=%.1f%% gap=%.1f\\n",se,nd/se,se/(i+r),(4.5-nd/se)/4.5*100,o-(l+sf-r)); printf("break_4.5x=%.1f%% liquidity=%.1f%% refi_6.0x=%.1f%% commitment_overlay_WC=%.1f%%\\n",(1-nd/(4.5*e))*100,(l+f-o)/(e*(1-t))*100,(1-nd/(6*e))*100,(l+f-o-213400-w)/(e*(1-t))*100)}'
haircut=0% EBITDA=185516.0 leverage=0.396x coverage=43.94x leverage_headroom=91.2% gap=-280827.0
haircut=30% EBITDA=129861.2 leverage=0.566x coverage=30.76x leverage_headroom=87.4% gap=-234522.2
haircut=40% EBITDA=111309.6 leverage=0.660x coverage=26.36x leverage_headroom=85.3% gap=-219087.3
haircut=60% EBITDA=74206.4 leverage=0.990x coverage=17.58x leverage_headroom=78.0% gap=-188217.4
40%+WC EBITDA=111309.6 leverage=0.660x coverage=26.36x leverage_headroom=85.3% gap=-208218.3
40%+200bp EBITDA=111309.6 leverage=0.660x coverage=25.95x leverage_headroom=85.3% gap=-219019.6
break_4.5x=91.2% liquidity=181.9% refi_6.0x=93.4% commitment_overlay_WC=36.6%
```

**Purchase-commitment overlay — not included in the headline gap.** The filing discloses 213,400 of material purchase commitments due within 12 months. The pool does not separate the amount that will be operating cost or capex already reflected in the FCF scaling from any incremental cash call; adding all of it to the FCF-based gap would double count an unknown amount. As a deliberately unmatched outer bound, adding the entire 213,400 plus the 10,869 WC proxy turns the −40% case into a 5,182 gap and solves to a 36.6% EBITDA decline. This is a data-limit bound, not a forecast or a claim that Alphabet breaks at 36.6%. [Q3 FY2026 Form 10-Q, Item 2 (Purchase Commitments and Other Contractual Obligations); `05_off-balance-sheet-and-contingencies.md`, §§1 and 5]

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches | **Not assessable contractually.** Illustrative 4.5x maximum strict-net-leverage sensitivity: 91.2% decline |
| Committed liquidity exhausted within 12 months | **Does not exhaust on an EBITDA decline alone.** Calculated 181.9% decline is outside the possible 0–100% range |
| Net leverage exceeds 6.0x refi-market threshold | 93.4% decline; 6.0x is a labelled market-access sensitivity, not a disclosed covenant |

The illustrative MAX-covenant solve is direction-aware: `h = 1 − net debt ÷ (T × EBITDA) = 1 − 73,489 ÷ (4.5 × 185,516) = 91.2%`. The alternative illustrative MIN-coverage case is looser: `h = 1 − (T × interest) ÷ EBITDA = 1 − (3.0 × 4,222) ÷ 185,516 = 93.2%`. Neither is a real breach point because Alphabet does not disclose a maintenance threshold, covenant EBITDA definition, addback caps, springing trigger or cure rights. [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility); `04_coverage-and-covenants.md`, §§2–3]

The liquidity solve uses usable broad liquidity and known uses: `h = (265,098 + 19,747 − 4,018) ÷ (185,516 × (1 − 16.8%)) = 181.9%`. A result above 100% means liquidity does not run out from an EBITDA decline alone under this matched-basis calculation. The 6.0x refi sensitivity is `h = 1 − 73,489 ÷ (6.0 × 185,516) = 93.4%`. The calculation output in Section 2 produced each result. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; CIQ Financials→Income Statement / Cash Flow [LTM Sep-30-2026]; `ciq_facts.json`, `ltm_ebitda_m`, `ltm_ocf_m`]

## 4. Survival Read

On the matched FCF basis, Alphabet survives every required −30% to −60% EBITDA haircut without an equity raise, asset sale, waiver or new unsecured refinancing: strict net leverage reaches only 0.99x and the −60% case retains a 188,217 liquidity surplus. The known 12-month maturity is only 1,016, so a 12-month market closure does not force a refinancing; the undrawn 10,000 revolver is excluded because availability is not disclosed. [Q3 FY2026 Form 10-Q, Note 6 (Debt and Credit Facility); `02_maturity-wall-and-refinancing.md`, §§1 and 4]

The first modelled break is the noncontractual 4.5x leverage sensitivity at a 91.2% EBITDA fall, while actual covenant failure remains not assessable. The important limitation is not debt service: it is the 213,400 of purchase commitments due within 12 months, whose overlap with future operating cost and capex is not disclosed. If all were treated as incremental cash use, the unmatched −40% plus WC bound would need about 5,182 of external funding; that is a warning to obtain the commitment cash-flow split, not evidence that an ordinary 30–40% recession forces financing. [Q3 FY2026 Form 10-Q, Item 2 (Purchase Commitments and Other Contractual Obligations); `05_off-balance-sheet-and-contingencies.md`, §§1 and 5]
