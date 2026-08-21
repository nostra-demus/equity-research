# balance-sheet-survival Module Dossier — INDIAMART

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `balance-sheet-survival_memo.md`.

- Generated: 2026-08-13T18:41:45Z
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

# Balance-Sheet-Survival Module — INDIAMART (Synthesis)

## Abstract

IndiaMART carries almost no debt — ₹231mn of Ind AS 116 lease liabilities against ₹5.2bn of FY26 EBITDA — and is deeply net cash on every measure, with gross debt falling every year and zero borrowing drawn since FY22. Its full lease-payment schedule (₹258.5mn undiscounted, 90.3% due within 24 months) is covered by cash on hand alone, so refinancing risk is negligible. Liquidity has no finite runway: annual free cash flow of roughly ₹6.8bn dwarfs ₹158.7mn of near-term obligations, and no covenant headroom question exists because no covenant-bearing debt exists. The stress test finds no break point even past a 100% EBITDA wipeout. Verdict: Fortress balance sheet — any risk to this company is operational, not financial.

## 1. Solvency Verdict

- **Verdict:** Fortress balance sheet
- **Net leverage (net debt / EBITDA):** N/M — net cash on both bases at every date. Strict basis (canonical, §15): −₹573.11mn / −0.11x FY26 EBITDA (FY26-end) → −₹151.83mn / −0.03x (latest, 30-Jun-2026). Broad basis (labelled, incl. ST investments + treasury book): −₹30,971.63mn / ~−5.95x FY26 EBITDA → −₹33,670.30mn / ~−6.34x (latest). Gross debt/EBITDA: 0.0444x FY26 / 0.0407x latest.
- **Liquidity runway:** No finite runway — annual FCF surplus ≈ ₹6.81bn (~₹567mn/month) after covering the only material near-term obligation; effective liquidity (₹30.65bn, adjusted for the FY26 dividend paid 29-Jul-2026) covers the ₹117.38mn 12-month lease obligation ~261x before FCF is even counted.
- **Maturity wall (% within 24 months):** 90.3% of the total ₹258.51mn undiscounted lease-payment schedule (98.2% within 36 months) — but the entire schedule is 0.7% of cash + liquid investments and is covered by cash on hand alone (₹368.11mn vs ₹233.29mn due within 24 months, 158% coverage).
- **Tightest covenant + headroom:** None exists — no covenant-bearing debt of any kind (zero "covenant" hits in the FY26 Annual Report; only debt is lease liabilities; no bank facility, bond, or rated debt). "Not assessable" is a structural fact about a debt-free balance sheet, not a disclosure gap.
- **Stress break point (EBITDA decline that breaks it):** None found. Liquidity is not exhausted within 12 months until an EBITDA decline of h=980% (mathematically beyond a 100% wipeout); net leverage cannot reach a 6x illustrative threshold on either basis because net debt is negative (net cash) throughout; there is no covenant to breach. A normal recession-scale −30%/−40% EBITDA decline moves gross leverage from 0.044x to only 0.074x and coverage from 175x to 105x — nowhere near a stress point.
- Solvency strength /100: **96** — no caps applied (see Section 4)
- Liquidity runway /100: **98**
- Refinancing risk /100 *(higher = worse)*: **3**
- Covenant headroom /100 *(or "Not assessable")*: **Not assessable** — no covenant-bearing debt exists (structural, not a disclosure gap; per MODULE_RULES §24 Filter 3 this is not scored down)
- Downside resilience /100: **98**
- Data quality /100: **93**
- Overall usefulness /100: **95**
- Biggest solvency risk (one line): None material on the balance sheet itself — the only channel that could hurt IndiaMART runs through the operating business (India SME subscriber demand, per `business-model/10_external-dependency.md`), not leverage, liquidity, or covenants.

## 1A. Module Disconfirmation

- **Strongest bear point:** The net-cash cushion is concentrated in a ₹30bn+ treasury book of short-duration mutual funds/bonds/ETFs/AIF units funded by customer-prepayment float, not in plain cash — AIF units can carry lock-in periods the filing does not separately quantify, so a small slice of the "effective liquidity" figure is flagged, not proven instantly liquid [`03_liquidity-runway.md` §1].
- **Strongest bull point (steelman):** Even ignoring the entire ₹30bn+ treasury book and every rupee of forecast FCF, cash & equivalents alone (₹368.11mn, 30-Jun-2026) covers the whole 24-month lease-payment schedule (₹233.29mn) 158% over — the survival case does not depend on the treasury book, FCF materializing, or any assumption at all [`02_maturity-wall-and-refinancing.md` §4].
- **Single killer risk specific to solvency:** None identified. The nearest thing to a "killer risk" this module can name is not financial: if IndiaMART ever drew material bank debt or bond financing (a pattern it has never shown in the FY22–LTM Jun-26 window), a covenant package would then exist and this read would need to be redone from scratch.
- **Disconfirming evidence already visible:** The FY26-end-to-30-Jun-2026 cash decline (₹804.13mn → ₹368.11mn) initially looked like the dividend draining liquid cash mid-quarter; the corrected read (interim filing's own note) shows the dividend was actually still unpaid at quarter-end and paid four weeks later, and the real driver was a rotation into the treasury book — a reconciliation the module caught and corrected rather than a red flag it is passing along undisclosed (see Section 3).

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| solvency-data-triage | Sufficient — no critical missing items | Absence of covenant, facility, and rating disclosure reflects a structurally debt-free balance sheet, not a data gap ("Total Debt Issued" = nil every period FY22–LTM Jun-26; credit ratings "Not Applicable") |
| capital-structure-and-leverage | Net cash on every measure and every year shown | Gross debt is ₹231.02mn (FY26) / ₹216.28mn (latest), 100% Ind AS 116 lease liabilities; net debt/EBITDA N/M (net cash) on both strict and broad bases; leverage falling every year with zero debt drawn since at least FY22 |
| maturity-wall-and-refinancing | Self-funded / low refi risk | ₹258.51mn undiscounted lease schedule (90.3% within 24 months) is covered 158% by cash on hand alone; "market closure" scenario changes nothing because there is no unsecured debt to roll |
| liquidity-runway | No finite runway | Annual FCF surplus ≈ ₹6.81bn vs ₹158.68mn near-term obligations; effective liquidity ₹30.65bn covers the 12-month obligation ~261x; corrected the pool's dividend-timing read (paid 29-Jul-2026, not mid-quarter) |
| coverage-and-covenants | No tightest covenant to report | EBITDA/interest 174.64x (FY26) / 212.36x (LTM); no covenant-bearing debt exists anywhere in the corporate structure, so headroom is "Not assessable" by construction |
| off-balance-sheet-and-contingencies | No material off-balance-sheet exposure | Max contingent exposure ₹521.86mn (four active, appealed tax/GST demands) = 2.17% of equity — immaterial; spike-test threshold (>15% of equity) not met; RF-OBS-001 not triggered |
| downside-stress-test | Survives every channel tested, no break point found | Liquidity exhaustion would require h=980% EBITDA decline; net leverage cannot reach 6x on either basis because net debt is negative throughout; no covenant to breach at any haircut |

## 3. Reconciliation

**One flagged and resolved disagreement:** `01_capital-structure-and-leverage.md` §6 attributed the FY26-end-to-30-Jun-2026 cash decline (₹804.13mn → ₹368.11mn) to the FY26 dividend (~₹3.6bn) being "paid out of the narrow cash-and-equivalents bucket" during the April–June quarter. `03_liquidity-runway.md` traced the interim filing's own note and found this incorrect: the dividend was recorded as an unpaid current liability ("Other payable" ₹3,245.59mn including "unpaid dividend of INR 3,236.66 for FY 25-26 paid subsequent to quarter end") at 30-Jun-2026 and was actually paid 29-Jul-2026 — i.e. after the last balance sheet in the pool but before today (13-Aug-2026). The reconciled, more precise view (03's, sourced directly to the interim filing's own note and corroborated by the Key Developments log) is carried forward: the quarter's cash decline is explained by a ₹3.14bn rotation into the treasury book, and the dividend is a separate, already-executed outflow that this synthesis nets out of today's effective liquidity (₹33.89bn reported → ₹30.65bn effective). This does not change the verdict — both readings still show a deeply net-cash balance sheet — but the more conservative, filing-sourced figure is the one used throughout this synthesis.

No other material disagreements between specialists. The ~2.2% EBITDA cross-tab gap within Capital IQ's own workbooks (flagged first in `earnings/01_historical-financials.md` fn.7) is carried consistently as a caveat by `01`, `04`, and `06` — not a disagreement between them, since all three use the same reported-EBITDA figures and flag the same residual uncertainty.

## 3A. Fragility Map (what breaks first)

| Fragility Driver | Indicator | Current Status | Why It Matters |
|---|---|---|---|
| Maturity concentration | % due within 24m | 90.3% of a ₹258.51mn total schedule — but covered 158% by cash alone | Wall risk is trivial in absolute terms; the percentage looks front-loaded only because the whole book is tiny |
| Availability liquidity | usable liquidity vs uses | ₹30.65bn effective liquidity vs ₹158.68mn near-term uses (~193x, gross-obligations basis) | No revolver exists to have an "availability" question — liquidity is 100% cash + liquid investments, no borrowing-base uncertainty |
| Covenant illusion risk | covenant EBITDA vs reported | N/A — no covenant-bearing debt, so no covenant-EBITDA definition exists to inflate | No addback risk because there is no covenant package to game |
| Floating-rate sensitivity | floating % net of hedges | 0% — 100% of gross debt is fixed-rate lease liabilities; no hedges needed or held | A rate shock cannot touch the liability side; it would only lift yield on the treasury book (asset-side upside) |
| Structural subordination | HoldCo debt vs upstreaming | Not applicable — IndiaMART is the ultimate listed parent; the only sub-parent debt (two convertible notes at Livekeeping Technologies) is $0mm outstanding | No trapped-value risk exists in the corporate structure |
| Contingent accelerants | CoC puts / cross-default | None disclosed — consistent with the absence of any external loan/bond agreement to attach such triggers to | No hidden accelerant exists because there is no credit agreement for one to live in |

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No debt maturity schedule | N — lease maturity table disclosed (Ind AS 116 Note 15(a)); no bonds/loans exist to schedule | Solvency strength | Not applied |
| No covenant disclosure | N — structural absence of covenant-bearing debt (zero "covenant" hits in the filing; the company has never drawn a facility), not an undisclosed note; `00` and `04` both explicitly instruct that the standard cap should not bind here | Covenant headroom / Overall usefulness | Covenant headroom = "Not assessable" (correct outcome regardless), but the usefulness-max-75 cap is NOT applied — net cash is a strategic asset (§24 Filter 3), not a scored deficiency |
| No cash flow statement | N — present (FY26 Annual Report + Q1 FY27 Interim Report + CIQ Cash Flow tab, FY22–LTM Jun-26) | Liquidity runway | Not applied |
| Only annual data (no interim) | N — Q1 FY27 interim (30-Jun-2026) is the primary liquidity-base date used throughout | Solvency strength | Not applied |
| No EBITDA base (stress not run) | N — EBITDA present and cash-backed (CFO > EBITDA every year FY22–FY26); stress test ran in full | Downside resilience | Not applied |

No cap trigger from MODULE_RULES binds. The one nuance carried forward from `00`/`04`: the literal "Not assessable" outcome for covenant headroom is correct, but its cause (a debt-free company) must not be treated by the master synthesizer as equivalent to an undisclosed-covenant data gap.

## 5. Survival Summary

IndiaMART is levered at essentially zero — gross debt of ₹231.02mn (FY26) is 100% Ind AS 116 lease liabilities, has fallen every year since FY22 purely from lease amortisation with no replacement financing drawn, and net debt is negative (net cash) on both the strict basis (−₹573.11mn FY26-end) and the broad basis (−₹30,971.63mn, including the treasury book) — the trend is deepening net cash, not rising leverage. The near-term maturity wall (₹258.51mn undiscounted, 90.3% due within 24 months) is entirely self-funded: cash on hand alone (₹368.11mn) covers it 158% over, so there is no refinancing dependence of any kind — no bank facility to renew, no bond to roll, no rating to protect. The liquidity runway has no finite endpoint (an annual FCF surplus of ~₹6.8bn against ₹158.68mn of near-term obligations), and there is no tightest covenant to approach because no covenant-bearing debt exists anywhere in the corporate structure. On the stress test, a normal recession-scale 30–40% EBITDA decline is trivially survivable without any equity raise, asset sale, or waiver — leverage stays net cash throughout and coverage stays above 100x — and the executed break-point solves show the structure does not fail even at EBITDA declines several multiples past a full 100% wipeout of current earnings.

## 6. What Would Change The Solvency Verdict?

| Current Verdict | What Would Strengthen It | What Would Weaken It | Data Needed |
|---|---|---|---|
| Fortress balance sheet | Further deepening of net cash (already happening every year); a disclosed committed facility that adds optionality without drawing it | A material debt-funded acquisition or capex program that draws bank/bond financing for the first time; a large, sudden crystallization of the ₹521.86mn contingent tax/GST exposure combined with a simultaneous cash outflow elsewhere; loss of the negative-working-capital subscription model (customers stop prepaying), which would remove the structural cash-source dynamic | A future debt note (if IndiaMART ever borrows), a covenant package (if one is ever signed), and continued tracking of the four active tax/GST appeals (currently ₹521.86mn max exposure, 2.17% of equity) for any adverse escalation |

## 6A. Survival Playbook (non-speculative levers)

- **Refi actions:** none needed and none taken — there is no debt to refinance (zero bank borrowings, bonds, term loans, or revolver in every period FY22–LTM Jun-26).
- **Asset-sale programs:** none announced and none needed — near-term obligations are covered by cash on hand alone.
- **Capex cuts:** low-value lever — capex is already minimal (₹70.00mn FY26, ₹41.30mn LTM), so cutting it further would not materially change the liquidity picture either way.
- **Dividend / buyback suspension:** available at management's discretion. The FY26 final + special dividend (~₹3.6bn) was discretionary and has already been paid (29-Jul-2026); no dividend or buyback is committed for the next 12 months as of the data-pool cutoff [`business-model/11_capital-allocation-governance.md`; `03_liquidity-runway.md` §2], so this lever is fully available if ever needed, though the survival case does not require it.
- **Covenant-amendment likelihood:** not applicable — no covenant-bearing debt exists to amend.

## 7. Note To The Final Synthesizer

- Gross leverage is 0.0444x EBITDA (FY26) / 0.0407x (latest); net leverage is negative (net cash) on both the strict basis (−0.11x FY26 EBITDA) and the broad basis (~−5.95x FY26 EBITDA, including the treasury book) — leverage is falling/deepening-net-cash every year, not rising.
- The maturity wall (₹258.51mn undiscounted, 90.3% due within 24 months) is entirely a lease-payment schedule, not a bond/loan wall, and is fully self-funded — cash on hand alone covers it 158% over; no refinancing access is required or exposed.
- The liquidity runway has no finite endpoint — annual FCF surplus ≈ ₹6.81bn vs ₹158.68mn of near-term obligations, and effective liquidity (₹30.65bn) covers those obligations ~261x before FCF is even counted; this runway depends almost entirely on liquidity already in hand, not on FCF materializing.
- No covenant exists to have headroom against — this is a structural fact about a debt-free balance sheet (confirmed: zero "covenant" hits in the full FY26 Annual Report, "Total Debt Issued" nil every period, credit ratings "Not Applicable"), not an undisclosed covenant package; do not treat this the way a genuine covenant-disclosure gap would be treated.
- The largest off-balance-sheet / contingent exposure is ₹521.86mn (consolidated max, four active appealed tax/GST demands) = 2.17% of equity. The spike test (max exposure ÷ equity > 15%, live matter) was NOT met, so `RF-OBS-001` was NOT fired by `05_off-balance-sheet-and-contingencies.md` — there is no standalone forensic tag to propagate here.
- Strategic-flexibility read (§24 Filter 3): IndiaMART's net-cash position (−₹573mn strict / −₹30.97bn broad at FY26-end, deepening every year) is counter-cyclical optionality — it funded its only control acquisition (Busy Infotech/Tolexo, $66.93mm, FY22) and roughly two decades of minority venture investments entirely from internal cash with zero debt ever drawn, and it gives the company capacity to hold headcount, support the business through an SME demand downturn, or pursue further M&A with no refinancing dependence. This is a positive, not "lazy capital" or a sub-optimal structure to be marked down.
- No partial-data cap applied in this module (Section 4) — the only nuance is that "covenant headroom: Not assessable" reflects a debt-free company, not a data gap, and should not be read as reducing this module's reliability.
- Biggest missing data point / single highest-value next data request: a direct company statement or bank-facility/sanction-letter confirming zero committed credit lines exist beyond what is inferred from "Total Debt Issued = nil" and the absence of any facility line item in the Capital Structure Details export — this would remove the last residual doubt that undrawn liquidity beyond cash could exist but be undisclosed. This is a low-value confirmatory item, not a gap that caps the verdict.
- **Explicit handoff:** the master synthesizer's "Balance Sheet and Survival Test" section should defer to this synthesis; the stress-test break points here (no break found on covenant, leverage, or liquidity channels even past a 100% EBITDA decline) are the inputs for the master's downside scenario and risk register — this module does not assign probabilities to those scenarios.

## 8. Simple Summary

- Total debt is ₹231mn (FY26) / ₹216mn (latest) — all of it is office/equipment lease payments, not bank loans or bonds. Net of cash, the company has negative debt (net cash) of ₹573mn (strict) to ₹31.0bn (broad, including its treasury investments).
- The "maturity wall" is a lease-payment schedule of ₹258.5mn, with 90% due in the next two years — but cash on hand alone (₹368mn) covers it 1.6 times over.
- The liquidity runway has no end date: free cash flow of about ₹6.8bn a year is roughly 43x the company's only near-term obligation (₹158.7mn).
- There is no covenant to break, because the company has never borrowed money that would come with one.
- The biggest off-balance-sheet item is ₹522mn of disputed tax/GST claims (four active appeals) — about 2% of equity, too small to matter to solvency even if the company loses every appeal.
- It survives a 30–60% drop in earnings with no strain at all — the model shows it would take an EBITDA decline far beyond 100% (i.e., outside any real-world scenario) before liquidity or leverage became a problem, and there is no covenant to break in the first place.
- No credit rating exists — because the company has never needed one; that is a fact about a debt-free company, not a missing data point.
- This module is highly useful for the master synthesizer: it establishes with high confidence that nothing on the balance sheet threatens this company — any risk case has to come from the operating business, not from debt.



---

## balance-sheet-survival / 00_solvency-data-triage.md

_Source: `00_solvency-data-triage.md`_

# Solvency Data Triage — INDIAMART

Note on dates: every file in `data/INDIAMART/` carries the identical filesystem last-modified date of 2026-08-13, which is the Drive-sync date for this pool, not the document's real vintage (CLAUDE.md §27 fix F23). "Period Covered" below is read from inside each document. `_pool_extracts/manifest.md` reports **0 extraction failures** across 38 workbooks (81 tabs) + 47 non-workbook files (128 extracts total), so no source is downgraded to "missing" for extraction failure (fix F03). No files exist under `data/INDIAMART/external/`, so there is no Section 1A external-data table for this pool, and no `ciq_facts.json` sidecar is present in `_pool_extracts/` — all figures below are this agent's own sourced read of the workbooks/filings.

## 1. File Inventory

| Filename (+ Tab where applicable) | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf | Annual filing — Integrated Annual Report + AGM Notice (audited, Ind AS) | FY ended Mar 31, 2026 | 2026-08-13 (sync) | **High** — debt note, contingent liabilities & commitments (Note 35), lease maturity table, pension/gratuity note, finance costs |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf | Annual filing (results-announcement version) | FY ended Mar 31, 2026 | 2026-08-13 (sync) | High — audited standalone + consolidated statements |
| IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-29-2025).pdf | Annual filing (audited) | FY ended Mar 31, 2025 | 2026-08-13 (sync) | High — prior-year comparator |
| IndiaMART_InterMESH_Limited_-_Form_Preliminary_Annual_Report(Apr-30-2026).pdf | Annual filing (preliminary) | FY ended Mar 31, 2026 | 2026-08-13 (sync) | Medium — superseded by full Annual Report |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf | Quarterly filing (audited, SEBI LODR Reg 33) | Q1 FY27, qtr ended Jun 30, 2026 | 2026-08-13 (sync) | **High** — most recent balance sheet/cash flow |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jan-20-2026).pdf | Quarterly filing | Q3 FY26, qtr ended Dec 31, 2025 | 2026-08-13 (sync) | High |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Oct-17-2025).pdf | Quarterly filing | Q2 FY26, qtr ended Sep 30, 2025 | 2026-08-13 (sync) | High |
| IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-18-2025).pdf | Quarterly filing | Q1 FY26, qtr ended Jun 30, 2025 | 2026-08-13 (sync) | High |
| 6× "Preliminary Interim Report" PDFs (Jul-21-2026, Jan-20-2026, Oct-17-2025, Jul-18-2025, Jan-22-2025, Jan-21-2025, Apr-29-2025, Apr-30-2026) | Quarterly filings (exchange-intimation / preliminary versions) | Q3 FY25 through Q1 FY27 | 2026-08-13 (sync) | Medium — duplicates/precursors of the final Interim/Annual Reports above |
| IndiaMART InterMESH Limited, Q1 2022–Q1 2027 Earnings Call*.pdf (21 files, Jan 2021 – Jul 2026) | Transcripts | FQ3 2021 through FQ1 2027 (~19 unbroken quarters) | 2026-08-13 (sync) | Medium — management commentary on cash use, capex, M&A funding |
| IndiaMART InterMESH Limited - ShareholderAnalyst Call.pdf | Transcript (ad hoc) | Jun 20, 2024 | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Financials (1).xls — tab: Balance Sheet | CIQ export | FY Mar-2022 – FY Mar-2026 + Jun-30-2026 | 2026-08-13 (sync) | **High** — total debt, net debt, cash & ST investments |
| " " — tab: Cash Flow | CIQ export | FY Mar-2022 – LTM Jun-30-2026 | 2026-08-13 (sync) | **High** — CFO, capex, debt issued/repaid, dividends |
| " " — tab: Capital Structure Summary | CIQ export | FY Mar-2022 – Jun-30-2026 | 2026-08-13 (sync) | **High** |
| " " — tab: Capital Structure Details | CIQ export | FY2026 & FY2025 "as reported" details (filed Apr-30-2026) | 2026-08-13 (sync) | **High** — instrument-level: Lease Liabilities only, ₹231mn |
| " " — tab: Historical Capitalization | CIQ export | FY Mar-2022 – Jun-30-2026 | 2026-08-13 (sync) | Medium |
| " " — tab: Ratios | CIQ export | FY Mar-2022 – Jun-30-2026 | 2026-08-13 (sync) | High — coverage/leverage ratios |
| " " — tab: Key Stats | CIQ export | FY Mar-2022 – FY Mar-2029E | 2026-08-13 (sync) | Medium |
| " " — tab: Income Statement | CIQ export | FY Mar-2022 – LTM Jun-30-2026 | 2026-08-13 (sync) | High — EBITDA/EBIT base, interest |
| " " — tab: Multiples | CIQ export | Current + historical | 2026-08-13 (sync) | Low |
| " " — tab: Supplemental | CIQ export | FY Mar-2022 – Jun-30-2026 | 2026-08-13 (sync) | Medium |
| " " — tab: Industry Specific | CIQ export | FY Mar-2022 – Jun-30-2026 | 2026-08-13 (sync) | Low |
| " " — tab: Pension OPEB | CIQ export | FY Mar-2021 – FY Mar-2026 | 2026-08-13 (sync) | **High** — gratuity plan funded status |
| " " — tab: Segments | CIQ export | FY21–FY26 | 2026-08-13 (sync) | Medium (asset-sale capacity context) |
| IndiaMART ... Financials.xls (12 tabs) / Financials Balance Sheet.xls / Financials Capital Structure Details.xls / Financials Capital Structure Summary.xls / Financials Cash Flow.xls / Financials Income Statement (1).xls / Financials Income Statement.xls / Financials Key Stats.xls / Financials Pension OPEB.xls / Financials Ratios.xls / Financials Segments.xls / Financials Supplemental.xls | CIQ export | Same coverage as Financials (1).xls | 2026-08-13 (sync) | Duplicate/near-duplicate workbooks — treated as one source, not double-counted |
| IndiaMART InterMESH Limited NSEI INDIAMART Fixed Income Securities Summary.xls — tab: Securities Summary | CIQ export (fixed-income/maturities) | Current outstanding instruments | 2026-08-13 (sync) | **High** — only 2 tiny, zero-outstanding convertible notes at subsidiary Livekeeping Technologies; confirms no material bonds/loans |
| IndiaMART InterMESH Limited NSEI INDIAMART Credit Health Panel.xls — tab: Summary | CIQ export (credit scoring) | LTM ending Jun-30-2026 vs peers | 2026-08-13 (sync) | **High** — Solvency score "Top" among 41 peers |
| " " — tab: Financials | CIQ export | LTM Jun-30-2026, Mar-2026, Mar-2025, Mar-2024, Mar-2023 (Company vs Group Mean) | 2026-08-13 (sync) | **High** — printed coverage/leverage/liquidity ratios |
| " " — tab: Operational Metrics Charts | CIQ export (chart, no printed values) | — | 2026-08-13 (sync) | Low |
| " " — tab: Solvency Metrics Charts | CIQ export (chart placeholders, no printed values — underlying numbers duplicated in the Financials tab) | — | 2026-08-13 (sync) | Low (numeric duplicate exists elsewhere) |
| " " — tab: Liquidity Metrics Charts | CIQ export (chart, no printed values) | — | 2026-08-13 (sync) | Low |
| " " — tab: Disclaimer | CIQ export | — | 2026-08-13 (sync) | None |
| Company Comparable Analysis IndiaMART InterMESH Limited.xls — tab: Credit Health Panel | CIQ export | — | 2026-08-13 (sync) | Medium (peer comparables) |
| " " — tabs: Financial Data, Trading Multiples, Operating Statistics, Implied Valuation, Valuation Chart, Business Description, Disclaimer | CIQ export | — | 2026-08-13 (sync) | Low (valuation-module relevance, not solvency) |
| IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls — 3 tabs (tree, Filtered Count, Aggregates) | CIQ export | Current | 2026-08-13 (sync) | Medium — confirms subsidiary map for HoldCo/OpCo check |
| IndiaMART InterMESH Limited NSEI INDIAMART Auditors.xls | CIQ export | Auditor history | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Board Members.xls / Committees.xls / Compensation Summary Compensation.xls | CIQ export | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Comparable M A Transactions.xls / Transaction Summary M A Private Placements.xls / Transaction Summary Public Offerings.xls | CIQ export | Historical | 2026-08-13 (sync) | Low–Medium (financing-history context) |
| IndiaMART InterMESH Limited NSEI INDIAMART Competitors.xls / Customers.xls / Suppliers.xls / Strategic Alliances.xls / Products.xls | CIQ export | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Corporate Timeline.xls / Events Calendar.xls / Key Developments.xls | CIQ export | Historical | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Investment Analysis Co Investors.xls / Direct Investments.xls | CIQ export | Current | 2026-08-13 (sync) | Low–Medium (contra-liquidity: equity method/venture investments) |
| IndiaMART InterMESH Limited NSEI INDIAMART Analyst Coverage.rtf / Industry Classifications.rtf / Long Business Description.rtf / Offices.rtf / Private Ownership.rtf / Professionals.rtf / Public Company Profile.rtf / Public Ownership Summary.rtf | CIQ export (rtf) | Current | 2026-08-13 (sync) | Low |
| IndiaMART InterMESH Limited NSEI INDIAMART Transaction Advisors.xls / Transcripts.xls (index) | CIQ export | Historical / index | 2026-08-13 (sync) | Low |
| IndiaMARTInterMESHLimitedNSEIINDIAMARTEstimatesReport.xls — 6 tabs (Consensus, Recent Changes, Multiples, Surprise, Trends, Revisions) + duplicate "(1)" file (Consensus tab only) | CIQ export (consensus estimates) | Consensus as of Jul-14-2026 | 2026-08-13 (sync) | Low (earnings/valuation-module relevance, not solvency) |

## 1A. External Data

Not applicable — `data/INDIAMART/external/` does not exist. No externally sourced research documents are in this pool.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Jun-02-2026).pdf | FY ended Mar 31, 2026 (published Jun 2, 2026) | ~2.4 |
| Quarterly filing | IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf | Q1 FY27, qtr ended Jun 30, 2026 | ~0.7 |
| Debt / capital-structure export | Financials (1).xls — Capital Structure Details/Summary tabs | FY2026 "as reported" (filed Apr-30-2026); FY26/Jun-26 balance-sheet debt line | ~3.5 (as-reported detail) / ~0.7 (balance-sheet column) |
| Fixed-income / maturities export | Fixed Income Securities Summary.xls | Current outstanding instruments (2 zero-outstanding convertible notes at a subsidiary) | Current |
| Cash flow statement | Financials (1).xls — Cash Flow tab | LTM ended Jun 30, 2026 | ~0.7 |
| Covenant / credit-agreement disclosure | None in pool | — | — |
| Credit rating report | None — Annual Report states "List of all credit ratings obtained by the Company: Not Applicable" | FY26 Annual Report, Jun-02-2026 | ~2.4 (as of the statement) |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | FY26 Annual Report (Ind AS), Jun-02-2026; CIQ Financials (1).xls Balance Sheet tab, Jun-30-2026 column | Debt, cash, equity base |
| Debt note (amounts by type) | Y | FY26 Annual Report, Note on Borrowings/Lease Liabilities; CIQ Capital Structure Details.xls — Lease Liabilities ₹231.02mn FY26, ₹216.28mn Jun-26, only instrument on the balance sheet | The debt stack and seniority |
| Maturity schedule | Y | FY26 Annual Report — "maturity analysis of expected undiscounted cash flows for lease liabilities as at year end" (Ind AS 116 lease note); Fixed Income Securities Summary.xls confirms no bond/loan maturities to schedule (only 2 zero-outstanding subsidiary convertible notes, one maturing 2036) | The maturity wall and refinancing exposure |
| Cash flow statement | Y | FY26 Annual Report, Statement of Cash Flows; CIQ Financials (1).xls Cash Flow tab, FY22–LTM Jun-26 | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | N/A (none exists) | CIQ Cash Flow tab — "Total Debt Issued" = nil every period FY22–LTM Jun-26; Capital Structure Details lists only lease liabilities, no revolver/term loan | The company holds no bank facility to draw on; liquidity is cash + short-term investments only — this is a fact about the balance sheet, not an unavailable disclosure |
| Interest expense detail | Y | FY26 Annual Report, Note 22 (Finance costs) — ₹27.09mn FY26 vs ₹37.50mn FY25; CIQ Credit Health Panel Financials tab — EBITDA/Interest 177.78x FY26 | Coverage ratios |
| Covenant disclosure | N/A (none exists) | No hits for "covenant" anywhere in the FY26 Annual Report full text; consistent with a company carrying no covenant-bearing loan/bond agreements | Headroom to a breach — not assessable because there is no covenant-bearing debt, not because a note is missing |
| Lease detail (operating/finance) | Y | FY26 Annual Report — Ind AS 116 lease liability note with maturity table; CIQ Balance Sheet — Curr. Port. of Leases ₹100.12mn, LT Leases ₹130.9mn (FY26) | Debt-like obligations |
| Pension / OPEB funded status | Y | FY26 Annual Report, gratuity/defined-benefit note; CIQ Financials (1).xls Pension OPEB tab — PBO ₹827.66mn vs Plan Assets ₹236.58mn (FY26), net liability ₹591.1mn | Off-balance-sheet obligation |
| Commitments & contingencies note | Y | FY26 Annual Report, Note 35 (Contingent liabilities and commitments) — Service tax/GST demands ₹219.18mn, capital commitments ₹3.64mn (FY26) vs ₹3.26mn (FY25) | Guarantees, LCs, litigation, tax claims |
| Credit ratings | N (genuinely absent) | FY26 Annual Report, BRSR section — "List of all credit ratings obtained by the Company: Not Applicable" | Refinancing access and cost — not assessable; company has no rated debt |
| EBITDA base (for stress test) | Y | CIQ Income Statement — EBITDA ₹5,140.44mn FY25, ₹5,314.65mn LTM Jun-26 (reconciliation gap flagged in `earnings/01_historical-financials.md` fn.7 — ~2.2% inconsistency across CIQ's own tabs, not a filing conflict) | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | Industry Classifications.rtf — "Trading Companies and Distributors" primary classification; a B2B online marketplace, not a bank/insurer/REIT | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | N/A (none exists) | Same evidence as "Committed/undrawn facility" row above | Determines usable liquidity — moot, since no revolver exists |
| Covenant EBITDA definition (addbacks / caps) | N/A (none exists) | Same evidence as "Covenant disclosure" row above | Moot — no covenant-bearing debt to define an EBITDA basis for |
| HoldCo / OpCo structure disclosure | Y (and immaterial) | Corporate Structure Tree.xls — subsidiary map; Fixed Income Securities Summary.xls — the only non-lease "debt" instruments (2 zero-outstanding convertible notes) sit at subsidiary Livekeeping Technologies Private Limited, wholly owned, private-placement, ₹0.001 coupon, $0mm outstanding | Structural subordination and upstreaming — not material given the near-zero amounts |
| Hedging / swaps disclosure | Y (disclosed as absent) | FY26 Annual Report — "The Company is not engaged in commodity trading, hedging or exchange risk management activities" | Floating-rate exposure net of hedges — moot; company carries no floating-rate debt |
| Change-of-control / cross-default / rating triggers | N — "Not disclosed in the data pool" | No debt/credit-agreement disclosure of this kind found; consistent with the absence of any external loan/bond agreement | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

`business-model/11_capital-allocation-governance.md` already confirms, independently: "Total Debt/EBITDA is 0.04x and Net Debt/EBITDA is not meaningful (net cash)" [Financials Capital Structure Summary.xls — Total Debt ₹231.02mn, Total Cash & ST Investments ₹31,202.65mn, Net Debt −₹30,971.6mn, FY26], and that all financing (including the one control acquisition, Busy Infotech, $66.93mm) was self-funded with zero debt drawn [Financials Cash Flow.xls — Total Debt Issued = nil every period FY22–LTM Jun-26]. `earnings/01_historical-financials.md` independently reports "Net Debt / EBITDA: N/M (net cash)... Stable — net-cash throughout" for every year FY22–FY26.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | India (NSE: INDIAMART; BSE: 542726) | Every regulatory filing addressed "To, BSE Limited / National Stock Exchange of India Limited" [FY26 Annual Report letter, Jun-02-2026] |
| Exchange | NSE (primary) and BSE | [FY26 Annual Report, Jun-02-2026] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | India — SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015, plus Companies Act 2013 | "Regulations 30, 34 of SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015" [FY26 Annual Report/AGM letter, Jun-02-2026] |
| Reporting standard (US GAAP / IFRS / Ind AS) | Ind AS | "The Financial Statements of the Company complied with all aspects of Indian Accounting Standards (IND AS) notified under Section 133 of the Companies Act, 2013" [FY26 Integrated Annual Report, Jun-02-2026] |
| Reporting currency (USD / INR / …) | INR (₹); fiscal year ends March 31 | CIQ Financials export header: "Currency: INR" across all periods [Financials (1).xls, Balance Sheet/Cash Flow tabs]; filings for "financial year ended March 31" each year |
| Document language(s) | English (all filings, transcripts, and exports reviewed) | Direct reading of all extracts; no non-English source documents in this pool |

This module reads/cites the Integrated Annual Report's borrowings and lease notes, the Contingent Liabilities & Commitments note (Note 35), the SEBI LODR Reg 33 quarterly results, and NSE/BSE Reg 30 intimations as the local-equivalent documents (CLAUDE.md §27, MODULE_RULES Jurisdiction-Aware Sourcing) — do not mark this pool "missing a 10-K debt note", "missing an 8-K", or "missing a Moody's/S&P/Fitch rating"; those US/international-agency forms simply do not apply, and the absence of a CRISIL/ICRA/CARE/India Ratings rating here is explained by the company holding no external debt to rate (Annual Report BRSR section, "credit ratings: Not Applicable"), not by a missing local-equivalent document.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N — lease maturity table is disclosed (Ind AS 116 note); no bonds/loans exist to schedule | — | Not applied |
| No covenant disclosure | N (functionally) — no covenant-bearing debt exists (zero hits for "covenant" in the FY26 Annual Report; only ₹231mn of lease liabilities on the balance sheet); this is a structural fact, not an undisclosed note | 04, 06 | Covenant headroom = "Not assessable" is still the correct downstream statement (per MODULE_RULES literal rule), but 04/06 must state explicitly it reflects zero funded debt, not a data gap — do not apply the "assume typical market covenants" fallback, since there is no debt for such covenants to attach to. Overall usefulness is NOT capped at 75 for this reason (§24 Filter 3: net cash is a strategic asset, not a scored deficiency) |
| No cash flow statement | N — present (Annual Report + CIQ Cash Flow tab, FY22–LTM Jun-26) | — | Not applied |
| No undrawn-facility disclosure | N — no revolver/facility exists at all (Total Debt Issued = nil every period; only instrument is lease liabilities); liquidity is genuinely cash + short-term investments only, and that is the true, undistorted picture, not an understatement | 03 | Not applied |
| No interest-expense detail | N — Finance costs disclosed in Note 22 (₹27.09mn FY26); EBITDA/Interest 177.78x (CIQ Credit Health Panel) | 04 | Not applied |
| No EBITDA base | N — EBITDA present (₹5,140–5,315mn range FY25–LTM Jun-26); minor ~2.2% cross-tab reconciliation gap within CIQ's own workbooks is flagged in `earnings/01_historical-financials.md` fn.7, not a missing-base issue | 06 | Not applied |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent, audited balance sheet (FY26 Annual Report, Jun-02-2026, and Q1 FY27 Interim Report, Jul-21-2026) is available together with the debt note (only ₹231.02mn/₹216.28mn of lease liabilities — the company carries essentially zero financial debt and ₹31.2–33.9bn of net cash), a full cash flow statement (FY22 through LTM Jun-30-2026), an Ind AS 116 lease maturity table, a pension/gratuity funded-status note, and a Contingent Liabilities & Commitments note (Note 35) with cited figures — so leverage, liquidity, coverage, and a stress test can all be built. The absence of a committed-facility disclosure, covenant terms, and a credit rating reflects that IndiaMART genuinely holds no revolver, no covenant-bearing loan/bond agreement, and no rated debt (confirmed directly: "List of all credit ratings obtained by the Company: Not Applicable"; zero "covenant" hits in the full filing text; "Total Debt Issued" = nil in every period of the cash flow statement) — these are facts about a debt-free balance sheet, not gaps in the data pool.
- **Sections that can run:** capital structure (trivial debt stack — leases only), maturity wall (no bond/loan wall exists; lease maturity table only), liquidity (cash + short-term investments; no facility to add), coverage/covenants (coverage ratios computable from finance costs; covenant headroom is "Not assessable" by construction, not by data absence), contingencies (Note 35, GST demands + capital commitments), stress test (EBITDA base is available; downside case tests whether ₹31–34bn of net cash survives a 30–60% EBITDA haircut against near-zero maturities).
- **Active partial-data caps:** None of the six standard MODULE_RULES score-cap triggers bind. The one nuance worth flagging downstream: the "no covenant disclosure" line in the Solvency Usability Check is genuinely N/A (no covenant-bearing debt), not a real gap, so agents 04/06 should state covenant headroom as "Not assessable — no covenant-bearing debt exists" rather than inferring assumed market covenants, and should not treat this as a usefulness-limiting cap.
- **Critical missing items:** None.
- **Single highest-value missing document:** None strictly missing; if one additional document would sharpen the module, it would be a bank-facility/sanction letter or a statement from the company confirming it holds zero committed credit lines (currently inferred conservatively from "Total Debt Issued = nil" and the absence of any facility line item in the Capital Structure Details export), to remove any residual doubt that undrawn liquidity beyond cash could exist but be undisclosed.



---

## balance-sheet-survival / 01_capital-structure-and-leverage.md

_Source: `01_capital-structure-and-leverage.md`_

# Capital Structure & Leverage — INDIAMART

**Reporting currency: INR (₹ millions), consolidated, Ind AS (Indian Accounting Standards, Companies Act 2013 Sec. 133). Fiscal year ends 31 March** (e.g. "FY26" = year ended 31-Mar-2026). Jurisdiction: India, listed NSE (INDIAMART) / BSE (542726), SEBI-LODR regime. All figures below are consolidated unless stated otherwise, sourced independently from the Capital IQ (CIQ) exports and the underlying audited Annual Report / SEBI LODR Reg 33 quarterly filings, cross-checked against each other. No `ciq_facts.json` sidecar exists for this pool run; all figures are this agent's own sourced read.

---

## 1. Debt Stack

IndiaMART carries **no bank borrowings, no bonds, no term loans, and no revolver**. The only interest-bearing / debt-like item on the consolidated balance sheet is **lease liabilities** (Ind AS 116 capitalises all leases — there is no separate off-balance-sheet "operating lease" bucket in this filing). Confirmed independently by the cash-flow statement: "Total Debt Issued" = nil in every period FY22 through LTM Jun-2026 [Capital IQ export, `Financials (1).xls`, Cash Flow tab] — the company has never drawn debt financing in this window.

| Instrument | Amount (FY26, 31-Mar-2026) | Amount (Latest, 30-Jun-2026) | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---:|---|---|---|---|---|---|---|
| Short-term debt / bank borrowings | ₹0 | ₹0 | — | — | — | — | — | — | No line item exists — confirmed by "Total Debt Issued = nil" every period [Financials (1).xls, Cash Flow tab] |
| Bonds / notes | ₹0 (parent level) | ₹0 | — | — | — | — | — | — | Not disclosed / does not exist at parent [FY26 Annual Report, Consolidated Balance Sheet] |
| Term loans | ₹0 | ₹0 | — | — | — | — | — | — | Not disclosed / does not exist |
| Revolver (drawn) | ₹0 — no revolver facility exists | ₹0 | — | — | — | — | — | — | No facility line item in Capital Structure Details export [`Financials Capital Structure Details.xls`] |
| Finance / capital leases — current portion | ₹100.12mn | ₹105.23mn | IndiaMART InterMESH Ltd (parent, consolidated) | Yes (per CIQ; secured by the underlying leased asset, standard for an Ind AS 116 right-of-use lease) | Senior | Underlying leased premises/equipment | Various, per lease term | Fixed | [FY26 Annual Report (Ind AS), Consolidated Balance Sheet, Note 15(a) — Lease liabilities; `Financials Capital Structure Details.xls`, FY2026 & FQ1 2027 "As Reported Details" — Type: Capital Lease, Seniority: Senior, Secured: Yes] |
| Finance / capital leases — non-current portion | ₹130.90mn | ₹111.05mn | IndiaMART InterMESH Ltd (parent, consolidated) | Yes | Senior | Underlying leased premises/equipment | Various, per lease term | Fixed | Same as above |
| **Total gross debt** | **₹231.02mn** | **₹216.28mn** | — | 100% secured, 100% senior | — | — | — | Fixed | [FY26 Annual Report, Consolidated Balance Sheet; `Financials Capital Structure Summary.xls` — Total Debt ₹231.02mn FY26 / ₹216.28mn Jun-26, Total Secured Debt = 100%, Total Senior Debt = 100%] |

**Footnote — subsidiary-level convertible notes (immaterial, excluded from the total above):** two "Corporate Convertible" instruments are recorded at wholly-owned subsidiary Livekeeping Technologies Private Limited (senior unsecured, coupon 0.001%, private placement, INR-denominated, maturities 1-Jan-2036 and 24-May-2036) — both show **$0mm / ₹0mm outstanding** at both offer and current dates. These do not add to gross debt. [`Fixed Income Securities Summary.xls`, Securities Summary tab]

**Trend:** gross debt has fallen every year as leases amortise down with no replacement financing drawn: ₹406.67mn (FY24) → ₹330.37mn (FY25) → ₹231.02mn (FY26) → ₹216.28mn (latest, 30-Jun-2026) [`Financials (1).xls`, Balance Sheet tab].

---

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Operating leases (IFRS 16 / US GAAP note) | Already capitalised — see Section 1 | Ind AS 116 (India's IFRS-16 equivalent) requires all leases (finance and what would elsewhere be called "operating") onto the balance sheet as right-of-use assets with a matching lease liability. There is no separate off-balance-sheet operating-lease bucket to add; the ₹231.02mn / ₹216.28mn total in Section 1 is the complete lease obligation. | [FY26 Annual Report, Note 2 (Material accounting policies) — Ind AS 116 application; Note 15(a) — Lease liabilities] |
| Pension / OPEB underfunding | Net unfunded liability ₹591.1mn (FY26): Projected Benefit Obligation ₹827.66mn vs Plan Assets ₹236.58mn. Booked on balance sheet as Current ₹132.9mn + Long-Term ₹458.2mn (labelled "Pension & Other Post-Retire. Benefits" in the CIQ balance sheet export). | Gratuity defined-benefit plan under Ind AS 19; recognised on-balance-sheet, not off-balance-sheet. Grew from ₹265.5mn (FY22) to ₹591.1mn (FY26) as the workforce and compensation base expanded. | [`Financials Pension OPEB.xls` — PBO ₹827.66mn, Plan Assets ₹236.58mn, Net Liability ₹591.1mn, FY26; FY26 Annual Report, gratuity/defined-benefit note] |
| Preferred equity | ₹0 — none disclosed | Not applicable | [FY26 Annual Report, Consolidated Balance Sheet, Equity section — Share capital + Other equity only, no preference share capital line] |

---

## 3. Cash & Liquid Assets

| Item | Amount (FY26, 31-Mar-2026) | Amount (Latest, 30-Jun-2026) | Restricted? | Source |
|---|---:|---:|---|---|
| Cash & equivalents | ₹804.13mn | ₹368.11mn | No | [`Financials (1).xls`, Balance Sheet tab; FY26 Annual Report, Consolidated Balance Sheet, Note 11] |
| Short-term investments (bank deposits >3mo) | ₹104.47mn | ₹84.00mn | Partially — see flag below | [`Financials (1).xls`, Balance Sheet tab] |
| Trading Asset Securities (treasury book: mutual funds, bonds, ETFs, AIF units — funded largely by customer-subscription prepayment float) | ₹30,294.05mn | ₹33,434.47mn | No | [`Financials (1).xls`, Balance Sheet tab; FY26 Annual Report, Note 8 — Investments] |
| **Total Cash & ST Investments (broad liquid base)** | **₹31,202.65mn** | **₹33,886.58mn** | — | [`Financials Capital Structure Summary.xls` — Total Cash & ST Investments] |
| Restricted / trapped cash (flag) | ₹3.30mn "earmarked balances with banks" (FY26) vs ₹2.61mn (FY25) — comprising unclaimed/unpaid dividend ₹0.48mn, bank balance held for the IndiaMART Employee Benefit Trust ₹2.73mn, and a deposit under lien ₹0.09mn | Immaterial in absolute terms (~0.01% of the broad cash base) but flagged, not silently netted, per MODULE_RULES Rule 3. Sits within the "bank balances other than cash and cash equivalents" note, not inside the headline Cash & equivalents line, so it is not already excluded from Section 3's cash figures above. | [FY26 Annual Report, Note 11 (Cash and bank balances) — "Earmarked balances with banks*" ₹3.30mn FY26 / ₹2.61mn FY25] |

No offshore/trapped-cash disclosure was found beyond the earmarked-balance note above; the company is a single-country (India) operator with modest overseas subsidiary presence and no disclosed repatriation restriction.

---

## 4. Gross & Net Debt

| Metric | FY26 (31-Mar-2026) | Latest (30-Jun-2026) | Source |
|---|---:|---:|---|
| Gross debt | ₹231.02mn | ₹216.28mn | Section 1 |
| − Cash & equivalents | ₹804.13mn | ₹368.11mn | Section 3 |
| **Net debt (strict, §15)** | **−₹573.11mn (net cash)** | **−₹151.83mn (net cash)** | Calc.; cross-checked against `earnings/01_historical-financials.md` §1 fn.5 (identical figures) |
| − Short-term investments + Trading Asset Securities | ₹30,398.52mn | ₹33,518.47mn | Section 3 |
| **Net debt (broad, incl. investments, §15)** | **−₹30,971.63mn (net cash)** | **−₹33,670.30mn (net cash)** | Matches CIQ's own "Net Debt" line exactly [`Financials Capital Structure Summary.xls` — Net Debt −30,971.6 FY26 / −33,670.3 Jun-26] |

Both bases show a **net-cash** balance sheet at every date shown; the two bases diverge sharply (₹573mn vs ₹31.0bn at FY26-end) because the "broad" figure nets in the ₹30bn+ treasury book of short-duration mutual funds/bonds/ETFs that IndiaMART holds against its customer-prepayment float (see `earnings/01_historical-financials.md` §1 fn.4 — this book sits inside Current Assets, not inside the headline Cash & equivalents line). Neither figure nets the ₹3.30mn earmarked/restricted balance flagged in Section 3.

---

## 5. Leverage Ratios

*No adjusted EBITDA is disclosed by the company* — a full-text search of the FY26 Annual Report for "adjusted EBITDA" / "non-GAAP" returned no matches [`earnings/01_historical-financials.md` §4]. All ratios below use **reported EBITDA** only. EBITDA base used: FY26 annual reported EBITDA ₹5,205.94mn; LTM (4 quarters ended 30-Jun-2026) reported EBITDA ₹5,314.65mn [Capital IQ export, `Financials (1).xls`, Income Statement tab — "LTM Jun-30-2026" column; a ~2.2% unreconciled gap exists between this figure and other CIQ tabs' EBITDA sums for the same period, flagged in `earnings/01_historical-financials.md` fn.7 as an inconsistency within CIQ's own workbooks, not a filing conflict].

| Ratio | On Reported EBITDA (FY26 / Latest LTM) | On Adjusted EBITDA | Source |
|---|---:|---:|---|
| Gross debt / EBITDA | 0.0444x (FY26: 231.02/5,205.94) / 0.0407x (Latest: 216.28/5,314.65) | n/a — not disclosed | Calc.; CIQ's own denominator gives 0.0436x FY26 / 0.0369x Jun-26 [`Financials Capital Structure Summary.xls` — Total Debt/EBITDA] — consistent to within the ~2% CIQ cross-tab gap noted above |
| Net debt / EBITDA (strict basis) | N/M — net cash of −0.11x FY26 / −0.03x Latest | n/a | Calc. from Section 4 strict row |
| Net debt / EBITDA (broad basis) | N/M — net cash equal to ~5.95x FY26 EBITDA / ~6.34x Latest LTM EBITDA | n/a | Calc. from Section 4 broad row; matches CIQ's own "Net Debt/EBITDA: NM" designation [`Financials Capital Structure Summary.xls`] |
| Debt / capital | 0.95% FY26 (231.02/24,234.77) / 0.97% Latest (216.28/22,412.26) | (n/a) | [`Financials Capital Structure Summary.xls` — Total Debt % of Total Capital 0.009533 FY26 / 0.009650 Jun-26] |
| Debt / equity | 0.96% FY26 (231.02/24,003.75) / 0.97% Latest (216.28/22,195.98) | (n/a) | Calc. from Section 1 and Section 4 balance sheet figures |

**Cycle position of the EBITDA base:** `business-model/10_external-dependency.md` classifies IndiaMART as **"Partly externally driven"** (SME/India-GDP demand link is qualitative, no quantified sensitivity disclosed) — not flagged as a deep cyclical / commodity name. MODULE_RULES' mid-cycle/normalised-EBITDA requirement therefore does not apply here; the FY26/latest-LTM reported EBITDA figures above are used as both the "latest" and effectively the working base, with no separate peak-vs-trough overlay required. Note for context only: `earnings/01_historical-financials.md` §6 records EBITDA margin as genuinely volatile within the last 5 years (39.4% FY22 → 26.6% FY23 → 26.5% FY24 → 37.0% FY25 → 33.2% FY26) — a cost-cycle effect, not a demand-cycle one — so a reader should not treat FY26's 33.2% margin as a permanent steady state even though no formal mid-cycle adjustment is triggered.

**Net debt/EBITDA basis used above:** both strict and broad bases are shown per Section 4; the ratio itself is not meaningfully different in decision terms (both are deeply net cash) — see Section 7 for which basis downstream agents should treat as canonical.

---

## 6. Leverage Trend

Net debt shown on the **strict** basis (gross debt − cash & equivalents only, §15 default) as the primary trend row, with the broad basis (also netting ST investments + the treasury book) alongside, both labelled.

| Metric | FY24 (Mar-24) | FY25 (Mar-25) | FY26 (Mar-26) | Latest (Jun-26) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt — strict (§15) | −₹441.37mn (net cash) | −₹404.47mn (net cash) | −₹573.11mn (net cash) | −₹151.83mn (net cash) | Net cash narrowed FY25→FY26 dip reversed, then narrowed sharply into the latest quarter |
| Net debt — broad (incl. ST investments + treasury book) | −₹22,824.8mn (net cash) | −₹28,392.9mn (net cash) | −₹30,971.6mn (net cash) | −₹33,670.3mn (net cash) | Deepening net cash every period |
| Net debt / EBITDA (broad basis, N/M convention) | N/M (net cash, ~7.2x FY24 EBITDA) | N/M (net cash, ~5.5x FY25 EBITDA) | N/M (net cash, ~5.95x FY26 EBITDA) | N/M (net cash, ~6.3x LTM EBITDA) | Stable — deep net cash throughout |
| Gross debt | ₹406.67mn | ₹330.37mn | ₹231.02mn | ₹216.28mn | Falling every period (lease amortisation, no new debt) |

Leverage is **falling on every measure that matters** — gross debt has fallen every year since the pool's earliest available year (FY22: ₹562.8mn) purely from lease amortisation, with zero new debt drawn in any period [`Financials (1).xls`, Cash Flow tab — "Total Debt Issued" = nil FY22–LTM Jun-26]. The **broad-basis net-cash pile has deepened every year** (−₹22.8bn FY24 to −₹33.7bn latest), driven by strong, growing free cash flow (FCF ₹5,444.9mn FY24 → ₹6,872.2mn FY26 [`earnings/01_historical-financials.md` §1]) and a subscription model that collects cash upfront (unearned revenue grew from ₹9,210.0mn to ₹19,652.6mn combined current+non-current, FY24→FY26). The one apparent wrinkle is the **strict-basis net cash figure narrowing sharply between FY26-end (−₹573.11mn) and the latest quarter (−₹151.83mn)** — this reflects the ₹804.13mn "Cash & equivalents" balance falling to ₹368.11mn as a large FY26 dividend (final ₹30/share + special ₹30/share, ~₹3.6bn total, declared Apr-2026) was paid out of the narrow cash-and-equivalents bucket even as funds were simultaneously rotated into the (much larger) treasury book of short-duration investments, which grew ₹2.68bn over the same quarter [`business-model/11_capital-allocation-governance.md` — dividend signal row; Section 3 above]. The single control acquisition in this window (Busy Infotech/Tolexo, $66.93mm, FY22, prior to the FY24 start of this trend table) was entirely self-funded from cash with zero debt drawn [`business-model/11_capital-allocation-governance.md`].

---

## 6A. HoldCo / OpCo & Structural Subordination

**Not applicable — no material HoldCo-level debt indicated.** IndiaMART InterMESH Limited is itself the ultimate listed parent (not a subsidiary of another operating HoldCo), and its own balance sheet carries the ₹231.02mn / ₹216.28mn of lease liabilities described in Section 1. The only debt instruments found anywhere in the corporate structure below the parent are the two zero-outstanding convertible notes at wholly-owned subsidiary Livekeeping Technologies Private Limited (Section 1 footnote) — both $0mm/₹0mm outstanding, so there is no structural-subordination exposure to assess. [`IndiaMART InterMESH Limited (NSEI_INDIAMART) Corporate Structure Tree.xls` — subsidiary map; `Fixed Income Securities Summary.xls`]

---

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Gross debt:** ₹231.02mn (FY26, 31-Mar-2026) / ₹216.28mn (latest, 30-Jun-2026) — entirely lease liabilities, 100% secured, 100% senior; no bank borrowings, bonds, term loans, or revolver exist [Section 1].
- **Net debt — canonical figure: strict basis (§15 default; no reason found in this pool to switch to broad).** Strict net debt = −₹573.11mn (net cash) at FY26-end, −₹151.83mn (net cash) at the latest quarter-end (30-Jun-2026). **Broad basis, shown alongside, labelled:** −₹30,971.63mn (net cash) FY26-end / −₹33,670.30mn (net cash) latest — this nets in the ₹30–34bn treasury book of short-duration mutual funds/bonds/ETFs. Downstream liquidity-runway (03) and stress-test (06) agents should note that MODULE_RULES separately defines *liquidity* (not net debt) as cash + liquid short-term investments, so Section 3's full ₹31.2–33.9bn "Total Cash & ST Investments" figure — not the strict net-debt figure — is the correct input for those agents' own liquidity calculations.
- **Cash & liquid investments:** ₹804.13mn cash + ₹104.47mn ST investments + ₹30,294.05mn trading securities = ₹31,202.65mn total (FY26); ₹368.11mn + ₹84.00mn + ₹33,434.47mn = ₹33,886.58mn total (latest, 30-Jun-2026). ₹3.30mn is earmarked/restricted (immaterial, flagged in Section 3, not netted out above).
- **EBITDA base used:** Reported EBITDA (company discloses no adjusted EBITDA) — ₹5,205.94mn FY26 annual, ₹5,314.65mn LTM ended 30-Jun-2026 [Section 5]. Cycle position: not a deep-cyclical name per `business-model/10_external-dependency.md` ("Partly externally driven"), so no separate mid-cycle/normalised EBITDA figure is required or provided — latest-year/LTM reported EBITDA is used as-is. A ~2.2% unreconciled gap exists between this figure and other CIQ tabs' EBITDA for the same periods (flagged in `earnings/01_historical-financials.md` fn.7) — propagate this caveat downstream.
- **Net debt / EBITDA (canonical, strict basis):** N/M — net cash equal to ~0.11x FY26 EBITDA / ~0.03x LTM EBITDA. **On the broad basis (labelled, not canonical):** N/M — net cash equal to ~5.95x FY26 EBITDA / ~6.34x LTM EBITDA.
- **Reporting currency:** INR (₹ millions), Ind AS consolidated, FY ends 31 March.

**No number above is estimated or based on adjusted EBITDA** — all figures are either directly filed (FY26 Annual Report, Q1 FY27 Interim Report) or a Capital IQ Tier-5 vendor export cross-checked against the filing (e.g. lease liabilities ₹231.02mn ties exactly to Note 15(a) of the Consolidated Balance Sheet). The one flagged uncertainty is the ~2.2% EBITDA cross-tab gap noted above, which downstream agents should carry forward as a caveat on any EBITDA-denominated ratio.

**IndiaMART is net cash on every measure and every year shown.** Strict-basis net cash (cash & equivalents only, less debt) has run positive since FY23 and stood at ₹573.11mn at FY26-end / ₹151.83mn at the latest quarter-end; on the broad basis (also netting the company's ₹30bn+ short-duration treasury book), net cash has deepened every year, from roughly ₹22.8bn (FY24) to ₹33.7bn (latest). This is a **strategic-flexibility signal, not a "lazy balance sheet"** (CLAUDE.md §24, Filter 3): the company has funded its only control acquisition (Busy Infotech/Tolexo, $66.93mm, FY22) and roughly two decades of ~20 minority venture-style investments entirely from internal cash with zero debt ever drawn [`business-model/11_capital-allocation-governance.md`], and this net-cash position gives it the ability to fund counter-cyclical action, absorb a demand downturn, or pursue further M&A without any refinancing dependence. This module does not conclude IndiaMART is "under-levered" or that it should add debt to optimise its cost of capital — per MODULE_RULES, the "optimal leverage" frame is rejected outright.



---

## balance-sheet-survival / 02_maturity-wall-and-refinancing.md

_Source: `02_maturity-wall-and-refinancing.md`_

# Maturity Wall & Refinancing — INDIAMART

**Reporting currency: INR (₹ millions), consolidated, Ind AS (Indian Accounting Standards, Companies Act 2013 Sec. 133). Fiscal year ends 31 March.** Jurisdiction: India, listed NSE (INDIAMART) / BSE (542726), SEBI-LODR regime. Gross debt figures are carried forward from `01_capital-structure-and-leverage.md` (canonical: ₹231.02mn at FY26-end 31-Mar-2026, ₹216.28mn at the latest quarter-end 30-Jun-2026) and cross-checked directly against the FY26 Annual Report's lease-liability maturity note. No `ciq_facts.json` sidecar exists for this pool run; all figures below are this agent's own sourced read.

**Framing note, stated up front:** IndiaMART's entire gross debt is lease liabilities on office/equipment right-of-use assets (Ind AS 116) — the company carries **zero bank borrowings, bonds, term loans, or revolver** [`01_capital-structure-and-leverage.md`, Section 1]. There is no bond or loan maturing that requires capital-markets access; what "matures" here is a schedule of contracted lease payments that either roll off as leases expire or get renewed/renegotiated directly with landlords. This is a fundamentally lower-risk maturity profile than a market-debt wall, and the analysis below states that distinction explicitly rather than applying corporate-bond refinancing logic uncritically.

---

## 1. Maturity Schedule

Source: the FY26 Annual Report discloses a maturity analysis of **expected undiscounted cash flows** for lease liabilities as at each year-end [FY26 Annual Report (Ind AS), Note 15(a) — Lease liabilities]. This is the only year-by-year breakdown in the data pool; the Capital IQ Capital Structure Details export shows no maturity date field for the lease-liability line (`Maturity: -`) [`Financials Capital Structure Details.xls`, FQ1 2027 & FY2026 "As Reported Details"].

| Period | Amount Due (undiscounted) | % of Total (undiscounted schedule) | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months | ₹117.38mn | 45.4% | Lease liabilities (office/equipment right-of-use leases) | FY26 Annual Report (Ind AS), Note 15(a) |
| Year 2 (12–24 months) | ₹115.91mn | 44.8% | Lease liabilities | FY26 Annual Report (Ind AS), Note 15(a) |
| Year 3 (24–36 months) | ₹20.56mn | 8.0% | Lease liabilities | FY26 Annual Report (Ind AS), Note 15(a) |
| Years 4–5 (36–60 months, combined bucket as disclosed) | ₹3.43mn | 1.3% | Lease liabilities | FY26 Annual Report (Ind AS), Note 15(a) |
| Thereafter (beyond 60 months) | ₹1.23mn | 0.5% | Lease liabilities | FY26 Annual Report (Ind AS), Note 15(a) |
| **Total (undiscounted lease payments)** | **₹258.51mn** | **100%** | — | FY26 Annual Report (Ind AS), Note 15(a) |

**Reconciliation to `01`'s canonical gross debt figure (required by self-check):** the ₹258.51mn total above is **undiscounted** (it includes future interest not yet accrued). `01`'s canonical gross debt of ₹231.02mn (FY26-end) is the **discounted** balance-sheet lease liability (current portion ₹100.12mn + non-current portion ₹130.90mn [FY26 Annual Report, Consolidated Balance Sheet, Note 15(a)]). The ₹27.49mn gap (₹258.51mn − ₹231.02mn) is the embedded future interest on the lease book, consistent with the FY26 P&L's "Interest cost of lease liabilities" of ₹27.09mn [FY26 Annual Report, Note 22 (Finance costs)] — the two figures track closely because the FY26 interest charge reflects roughly one year's unwind of a broadly similar-sized lease book. This is a standard Ind AS 116 reconciling item, not a data conflict.

**FY25 comparative (for trend context):** Within 1yr ₹129.61mn / Year 2 ₹115.35mn / Year 3 ₹113.49mn / Years 4–5 ₹20.52mn / Thereafter ₹2.99mn = Total ₹381.96mn [FY26 Annual Report, Note 15(a), comparative column]. The total undiscounted lease book has shrunk 32.3% year-on-year (₹381.96mn → ₹258.51mn) as leases roll off with no material new lease additions (FY26 additions were only ₹5.83mn against ₹131.85mn of payments made) [FY26 Annual Report, Note 15(a), lease-liability reconciliation].

**Scale check:** the entire lease book (₹258.51mn undiscounted, ≈$2.9mm at ~₹87/USD) is roughly 3.7% of FY26 EBITDA (₹5,205.94mn [`01`, Section 5]) and roughly 0.7% of the company's cash + liquid investments (₹31,202.65mn at FY26-end [`01`, Section 3]). At this scale, "maturity wall" is a formal exercise, not a real solvency question — the numbers are shown in full below because the module's job is to check, not to assume.

---

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (WAM), years | ~1.18 years (≈14 months) — estimated using each bucket's midpoint (0.5 / 1.5 / 2.5 / 4.0 / assumed 6.0 years) weighted by the undiscounted amount in that bucket; the filing discloses bucketed ranges, not exact dates, so this is an approximation. *Inference from disclosed buckets, not a company-stated WAM.* |
| % due within 12 months | 45.4% (₹117.38mn / ₹258.51mn) |
| % due within 24 months | 90.3% (₹233.29mn / ₹258.51mn) |
| % due within 36 months | 98.2% (₹253.85mn / ₹258.51mn) |
| Largest single maturity year (and amount) | Within-12-months bucket, ₹117.38mn (45.4% of the schedule) — Year 2 is close behind at ₹115.91mn (44.8%), so the "wall" is really front-loaded across the first 24 months, not concentrated in one year |

The profile is short and front-loaded: 90.3% of the entire lease-payment schedule is due inside 24 months, and 98.2% inside 36 months, with almost nothing (1.8%) beyond Year 3. This is the normal shape for a book of office/equipment leases with multi-year renewal cycles, not a distress signature — a genuine corporate-bond wall this front-loaded would be a red flag, but here the total sum at risk is ₹258.51mn against ₹31.2bn of liquid resources (Section 4).

---

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | 100% | `01_capital-structure-and-leverage.md`, Section 1 — all lease liabilities carry a fixed implicit/incremental-borrowing rate set at lease inception under Ind AS 116; Capital IQ's own "Floating Rate" field for the instrument reads "NA" [`Financials Capital Structure Details.xls`] |
| Floating-rate share | 0% | Same as above — there is no floating-rate debt to reprice if market rates move |
| Weighted-average implied discount rate | ≈9.65% (FY26 interest cost on lease liabilities ₹27.09mn ÷ average lease-liability balance of ₹280.70mn [(₹330.37mn opening + ₹231.02mn closing)/2]) | Calc. from FY26 Annual Report, Note 22 (Finance costs) and Note 15(a) (lease-liability reconciliation). *Inference, not from filings* — the filing does not itself state a single blended rate; this is a computed average across leases signed at different times and different implicit rates. |
| Current market refi rate (matching tenor, indicative benchmarks) | RBI policy repo rate 5.25% (Aug-2026, unchanged); India 2-year G-sec yield 6.00% (7-Aug-2026); India 3-year G-sec yield ≈6.05% (Aug-2026); India AAA-rated corporate bond yield, 2–3yr tenor, ≈6.56%–6.70% (LSEG benchmark, early Aug-2026) | **Web-sourced, indicative/unverified, dated Aug-2026** — see Sources below. No IndiaMART-specific credit rating exists in the data pool (Credit Health Panel shows "S&P Foreign Currency LT: –" for IndiaMART [`Credit Health Panel/Summary.txt`]; no CRISIL/ICRA/CARE rating action for the company was found in the pool — the company has never needed a rating because it has never issued rated debt) |
| Estimated refi cost step-up (bps) | **Not a clean like-for-like comparison — flagged, not computed as a headline number.** The implied ~9.65% average lease discount rate sits ABOVE today's ~6.6–6.7% AAA 2–3yr corporate-bond benchmark by roughly +295 to +310 bps, which on its face would suggest a NEGATIVE step-up (cheaper, not more expensive, to refinance today). But this comparison mixes two different things: the 9.65% figure is a blended real-estate/equipment lease discount rate set at various historical lease-inception dates (which typically embed an asset-specific/illiquidity premium above generic corporate credit), not a market bond coupon being rolled over. Lease renewals are negotiated with landlords against prevailing commercial-rent and lease-financing terms, not against G-sec or AAA-bond yields. **No reliable refi cost step-up can be computed from this pool's data**; the market-rate figures above are shown only to establish that IndiaMART is not facing a rising-rate refinancing shock (rates have been broadly stable to lower over FY24–FY26 relative to when older leases were priced) | Calc.; caveat is this agent's own read, labeled |

---

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities (₹233.29mn undiscounted, Section 1) | Amount | Evidence |
|---|---:|---|
| Cash on hand | ₹368.11mn (30-Jun-2026) — alone covers 158% of the entire next-24-month lease-payment schedule | `01_capital-structure-and-leverage.md`, Section 3; [FY26 Annual Report, Note 11] |
| Forecast FCF (recurring operating free cash flow) | FY26 FCF ₹6,872.19mn (CFO ₹6,942.19mn − capex ₹70.00mn); FY26 EBITDA ₹5,205.94mn — either figure dwarfs the ₹233.29mn 24-month lease obligation by roughly 20–30x | `earnings/01_historical-financials.md`, Section 1 |
| Revolver availability | Not applicable — no revolver facility exists [`01`, Section 1] | `01_capital-structure-and-leverage.md`, Section 1 |
| Asset-sale proceeds | Not applicable / not needed — no asset sale has been announced or is required | N/A |
| New debt issuance | Not applicable — no new debt issuance is committed or announced; the company has drawn zero incremental debt in every period FY22–LTM Jun-2026 [`01`, Section 1] | `01_capital-structure-and-leverage.md`, Section 1 |

The near-term wall (next 12–24 months, ₹233.29mn undiscounted) is fully covered by cash on hand alone (₹368.11mn), before any recourse to the company's ₹33.9bn broad liquid base (cash + ST investments + treasury book, latest [`01`, Section 3]) or to its recurring FCF (₹6,872mn FY26). IndiaMART requires no market access — no bank facility renewal, no bond rollover, no equity raise — to meet every lease payment scheduled through FY31 and beyond; the payments are, in substance, funded out of ordinary operating cash generation as they fall due, the same way rent is paid. No credit rating exists because the company has never needed one: it has drawn zero debt financing in every period covered by this pool ("Total Debt Issued" = nil, FY22 through LTM Jun-2026 [`01`, Section 1]). Floating-rate exposure is zero (Section 3), so no interest cost reprices if market rates move in either direction — the entire lease book sits at fixed, historically-set discount rates. **Conclusion: self-funded / low refi risk.**

---

## 5. Refinancing Read

The maturity wall here is trivial in absolute and relative terms: ₹258.51mn of total undiscounted lease payments (₹231.02mn on the balance sheet, discounted), front-loaded with 90.3% due inside 24 months, against ₹368.11mn of cash alone and ₹6,872mn of FY26 free cash flow — a coverage ratio no genuine debt-maturity wall would ever show. There is no cost step-up to compute in a meaningful sense: the only "refinancing" event that occurs is a landlord lease renewal, not a capital-markets rollover, and IndiaMART has no credit rating and no history of needing one because it has issued zero bonds, term loans, or drawn revolvers across the entire five-year window in this pool. The single biggest refinancing-adjacent risk is not financial but operational — if IndiaMART needed to relocate or expand office footprint on short notice, new leases would price at whatever commercial-rent and lease-financing terms prevail at signing, which the company does not control, but this is a cost-of-doing-business risk, not a solvency risk. **Under a "market closure" scenario (no new unsecured issuance available for 12 months), IndiaMART survives without any observable stress**: it has no unsecured issuance to roll in the first place, and its FY26 cash on hand (₹804.13mn at FY26-end / ₹368.11mn latest) plus ₹6,872mn of FY26 FCF comfortably exceed the entire lease-payment schedule for the next several years combined. This is a stated conclusion from this agent's own read of the maturity data, not the formal Layer-4 stress test — `06_downside-stress-test` owns the full EBITDA-haircut and liquidity-shock analysis.

---

Sources:
- [India 2 Year Note Yield - Trading Economics](https://tradingeconomics.com/india/2-year-note-yield)
- [India - 10-Year Government Bond Yield 2026 - countryeconomy.com](https://countryeconomy.com/bonds/india)
- [RBI August 2026 Policy: Repo Rate Held at 5.25% - Finnovate](https://www.finnovate.in/learn/blog/rbi-august-2026-policy-repo-rate-rupee-inflation)
- [RBI Policy Update August 2026 - India Infoline](https://www.indiainfoline.com/news/economy/rbi-policy-update-august-2026-repo-rate-unchanged-at-5-25-fy27-gdp-growth-raised-to-6-7-inflation-forecast-cut)
- [Corporate Bond Rates India 2026: Yield Analysis & Trends - Stashfin](https://www.stashfin.com/blogs/corporate-bonds-rate)
- [AAA Bonds Yield Spread (1Y vs 3Y) - India Macro Indicators](https://indiamacroindicators.co.in/economic-indicators/aaa-rated-bonds-yield-spread-1-year-3-year)



---

## balance-sheet-survival / 03_liquidity-runway.md

_Source: `03_liquidity-runway.md`_

# Liquidity Runway — INDIAMART

**Reporting currency: INR (₹ millions), consolidated, Ind AS. Fiscal year ends 31 March.** Figures below use the latest disclosed balance sheet (30-Jun-2026, Q1 FY27) as the liquidity base and the FY26 Annual Report's lease-maturity note (carried forward from `02_maturity-wall-and-refinancing.md`) for the next-12-month debt use. No `ciq_facts.json` sidecar exists for this pool run; all figures are this agent's own sourced read, cross-checked against `01` and `02`.

**Reconciliation flag, stated up front (material — flagged, not silently absorbed):** `01_capital-structure-and-leverage.md` §6 attributes the FY26-end-to-30-Jun-2026 cash decline (₹804.13mn → ₹368.11mn) to the FY26 dividend (₹60/share, final ₹30 + special ₹30, ~₹3.6bn) having been "paid out of the narrow cash-and-equivalents bucket" during that quarter. The Q1 FY27 Interim Report's own notes contradict this: as at 30-Jun-2026, "Other payable" jumped from ₹8.92mn to ₹3,245.59mn, explicitly because it "includes unclaimed dividend of INR 0.48 (31 March 2026: INR 0.48) and **unpaid dividend of INR 3,236.66 for FY 25-26 paid subsequent to quarter end**" [`IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf`, Note 15(b) — Other financial liabilities]. This is confirmed independently by the Key Developments log: the dividend's record/ex-date was 19-Jun-2026 but its **payment date was 29-Jul-2026** [`IndiaMART-InterMESH-Limited-NSEI-INDIAMART-Key-Developments.txt`, entries dated 2026-04-30 and 2026-06-29] — i.e. the dividend was still unpaid at the 30-Jun-2026 balance-sheet date and was paid roughly four weeks **after** it, not during the Apr–Jun quarter. The quarter's cash decline is better explained by the ₹3,140.42mn rotation into the Trading Asset Securities book (₹30,294.05mn → ₹33,434.47mn over the same quarter, per `01` §3) than by the dividend. This module carries the corrected reading forward: **the FY26 dividend was unpaid liquidity at 30-Jun-2026 and left the company on 29-Jul-2026 — before today (13-Aug-2026) but after the last balance sheet in the pool.** That means the pool's most recent balance sheet overstates *today's* effective liquidity by the dividend amount; Section 1 adjusts for this explicitly, sourced to the interim filing's own note, not inferred.

---

## 1. Liquidity Sources (committed only)

| Source | Amount (30-Jun-2026) | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | ₹368.11mn | Y | No restriction on this line itself. A separate "earmarked balances with banks" note (unclaimed dividend ₹0.48mn + EBT-trust balance ₹2.73mn + lien deposit ₹0.09mn ≈ ₹3.30mn at FY26-end) sits outside this line, immaterial (~0.9% of this line, ~0.01% of total liquidity) | [`01_capital-structure-and-leverage.md` §3; FY26 Annual Report (Ind AS), Note 11] |
| Liquid short-term investments (bank deposits >3 months) | ₹84.00mn | Y | No restriction disclosed | [`01_capital-structure-and-leverage.md` §3; Capital IQ export, Balance Sheet tab] |
| Trading Asset Securities (treasury book: short-duration mutual funds, bonds, ETFs, AIF units, funded by the customer-prepayment float) | ₹33,434.47mn | Y, with one caveat | Composition is not broken out by sub-instrument in the pool; AIF (Alternative Investment Fund) units can carry lock-in periods that the filing does not separately quantify — treated as usable because the book is disclosed as a whole as short-duration, but this sub-component is flagged, not assumed instantly liquid | [`01_capital-structure-and-leverage.md` §3; FY26 Annual Report, Note 8 — Investments] |
| Revolver / facilities (commitment) | ₹0 — **no facility of any kind exists** | N/A | This is a confirmed fact (zero bank borrowings, zero revolver, zero term loans in every period FY22–LTM Jun-2026, "Total Debt Issued" = nil), not an "availability unknown" gap — the MODULE_RULES exclusion for undisclosed-availability revolvers does not apply here because there is no revolver to exclude | [`01_capital-structure-and-leverage.md` §1] |
| Revolver availability (if disclosed) | N/A | N/A | No facility exists | — |
| **Total usable liquidity (as reported, 30-Jun-2026)** | **₹33,886.58mn** | | | [`01_capital-structure-and-leverage.md` §3, matches CIQ "Total Cash & ST Investments"] |
| **Less: FY26 dividend paid subsequent to quarter-end (already-executed cash outflow, not yet reflected above)** | **−₹3,236.66mn** | | Recorded as an unpaid current liability ("Other payable") at 30-Jun-2026; actually paid 29-Jul-2026 — i.e. before today (13-Aug-2026) but after the last balance sheet in the pool | [`IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf`, Note 15(b); Key Developments log, 2026-04-30 / 2026-06-29 entries] |
| **Effective total usable liquidity, adjusted to today (13-Aug-2026)** | **≈ ₹30,649.92mn** | | This is the figure used for the runway calculation below | Calc. |

Restricted cash: the ₹3.30mn earmarked-balance note (FY26-end) is immaterial and is not netted out of the cash line above; it is flagged per MODULE_RULES Rule 3, not silently absorbed. No offshore/trapped-cash disclosure exists beyond this note [`01_capital-structure-and-leverage.md` §3]. Reporting currency: INR millions throughout.

---

## 2. Near-Term Uses (next 12 months, 13-Aug-2026 to 13-Aug-2027)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from `02`) | ₹117.38mn (undiscounted lease payments due within 12 months of the FY26 Annual Report's Note 15(a) maturity table) | [`02_maturity-wall-and-refinancing.md` §1] |
| Cash interest | Embedded within the lease-payment figure above — Note 15(a)'s undiscounted schedule already includes both principal and the ~₹27mn/year of interest cost on the lease book; adding it again here would double-count (`02` §1's own reconciliation confirms the ₹27.49mn gap between the undiscounted total and the discounted balance-sheet liability is exactly this embedded interest) | [`02_maturity-wall-and-refinancing.md` §1, reconciliation footnote] |
| Maintenance capex | ₹41.30mn (LTM total capex, 4 quarters ended 30-Jun-2026 — the company does not disclose a maintenance-vs-growth capex split, so the full LTM figure is used) | [`earnings/01_historical-financials.md` §2] |
| Committed dividends / buybacks | ₹0 — no dividend or buyback has been declared or committed for the next 12 months as of the data-pool cutoff. (The FY26 final+special dividend, ~₹3.24bn net, is not a forward obligation — it was already paid on 29-Jul-2026, before today; see Section 1 adjustment.) | [`IndiaMART-InterMESH-Limited-NSEI-INDIAMART-Key-Developments.txt`; `business-model/11_capital-allocation-governance.md`] |
| **Total near-term uses (gross, excl. double-counted interest)** | **₹158.68mn** | Calc. (117.38 + 41.30 + 0) |

---

## 3. Runway

| Metric | Value |
|---|---:|
| Total effective committed liquidity (adjusted to today) | ₹30,649.92mn |
| Annual FCF (LTM, 4 quarters ended 30-Jun-2026) | ₹6,925.56mn [`earnings/01_historical-financials.md` §2] |
| Basis used | **Net-of-FCF** — FCF is strong, positive, and cash-backed: CFO has exceeded EBITDA every year for 5 straight years (121%–182%) with no cash-conversion red flags [`earnings/06_earnings-quality.md` §2, §7] |
| Annual net cash burn = (12-month debt maturities + committed dividends) − FCF | (₹117.38mn + ₹0) − ₹6,925.56mn = **−₹6,808.18mn** (i.e. an annual **surplus**, not a burn) |
| Monthly net cash burn (annual ÷ 12) | **−₹567.35mn/month** (i.e. a monthly surplus of ~₹567mn) |
| **Liquidity runway** | **No finite runway — FCF alone covers 12-month obligations ~59x over. Annual FCF surplus ≈ ₹6.81bn (~₹567mn/month).** |

Formula shown per MODULE_RULES §8 (net-of-FCF basis): monthly net burn = [(12-month debt maturities + committed dividends/buybacks) − FCF] ÷ 12. Cash interest and maintenance capex are deliberately **not** re-added — FCF (= CFO − total capex) already carries both, so adding them would double-count and understate the true runway.

**Liquidity-only coverage (informational, not the runway itself):** effective liquidity (₹30,649.92mn) ÷ the one real near-term use (₹117.38mn of lease payments) ≈ **261x** — i.e. cash and liquid investments alone, before touching a rupee of operating cash flow, would fund the entire next-12-month obligation about 261 times over.

### Seasonality / Peak Liquidity Need (Hard Check)

Working capital is **not materially seasonal**: `earnings/01_historical-financials.md` §5 finds only a 2–3 percentage-point spread in quarterly revenue share across FY24–FY26 (Q1 smallest at ~23.7–23.9% of the year, Q4 largest at ~25.6–26.3%), which does not clear the module's >30%/<20% seasonality-flag threshold. More importantly, operating working capital is **structurally negative** (−₹12,916.52mn at FY26-end, per `earnings/01_historical-financials.md` §1 fn.4) because customers prepay annual subscriptions upfront — working-capital movements are a net cash **source**, not a use, in this business. There is no disclosed seasonal peak cash need to re-run the runway against.

---

## 4. Sources & Uses Bridge

Internal sources cover the next 12 months many times over without any need for external access — no refinancing, no asset sale, no drawdown of any kind is required, because there is no facility to draw and no market debt to roll (`02_maturity-wall-and-refinancing.md` §4–5). Even on the deliberately conservative gross-obligations view (ignoring all FCF), effective liquidity of ₹30,649.92mn covers the full ₹158.68mn of disclosed near-term uses roughly 193x; on the net-of-FCF basis actually used above, LTM free cash flow alone (₹6,925.56mn) exceeds those obligations ~59x before the balance sheet is touched at all. Essentially none of this runway depends on FCF "holding up" in any marginal sense — FCF would have to collapse by well over 98% before the company needed to draw on its ₹30.65bn of liquid assets to meet its ₹117.38mn of contracted near-term obligations, and even a full FCF collapse to zero would still leave liquidity covering the obligation ~261x.

---

## 5. Liquidity Read

IndiaMART has no finite liquidity runway worth reporting: it generates an annual free-cash-flow surplus of roughly ₹6.81bn (~₹567mn/month) after covering its only material near-term obligation — ₹117.38mn of undiscounted lease payments due within 12 months — and holds ₹30.65bn of effective liquidity today (after netting the dividend paid 29-Jul-2026) against that same ₹117.38mn obligation, a coverage ratio of about 261x even before FCF is counted. This conclusion rests almost entirely on liquidity already in hand, not on FCF materializing — a full stop in operating cash generation would still leave the company able to fund its lease book roughly 261 times over. The single liquidity-relevant risk worth naming is not a funding gap but a capital-allocation question: with no debt to service and a growing pile of idle liquid assets, the real variable going forward is how much of that pile management chooses to distribute (dividends/buybacks, `business-model/11_capital-allocation-governance.md`) or deploy into further minority-stake acquisitions (a recurring, individually small but serial pattern per the same module), not whether the company can pay what it owes.



---

## balance-sheet-survival / 04_coverage-and-covenants.md

_Source: `04_coverage-and-covenants.md`_

# Coverage & Covenants — INDIAMART

**Reporting currency: INR (₹ millions), consolidated, Ind AS (Companies Act 2013 Sec. 133). Fiscal year ends 31 March** ("FY26" = year ended 31-Mar-2026). Jurisdiction: India, NSE (INDIAMART) / BSE (542726), SEBI-LODR regime. EBITDA basis: **reported only** — IndiaMART discloses no adjusted/non-GAAP EBITDA (full-text search of the FY26 Annual Report for "adjusted EBITDA"/"non-GAAP" returns no matches) [`earnings/01_historical-financials.md` §4]. Gross debt (per `01_capital-structure-and-leverage.md`): ₹231.02mn (FY26-end) / ₹216.28mn (30-Jun-2026), entirely lease liabilities under Ind AS 116 — **no bank borrowings, bonds, term loans, or revolver exist**.

**Data-quality note (flag, not a silent override):** `00_solvency-data-triage.md` cited FY26 Annual Report Note 22 "Finance costs" as ₹27.09mn (FY26) / ₹37.50mn (FY25). Tracing Note 22 directly in the filing text shows this is the **standalone-entity** (parent-only) figure and, within the consolidated statement, is specifically the "Interest cost of lease liabilities" sub-line only. The **consolidated** Note 22 total — the correct basis for this module, which runs on consolidated figures throughout — is **₹29.81mn (FY26) / ₹74.06mn (FY25)**, comprising lease interest (₹27.09mn / ₹37.50mn) plus interest on deferred acquisition consideration (₹2.72mn / ₹36.56mn) [FY26 Annual Report (Ind AS), Note 22 — Finance costs, Consolidated Statement of Profit and Loss, line 875 and note breakdown]. This consolidated total also ties to within 0.03% of the Capital IQ Income Statement's own "Interest Expense" line (−₹29.8mn FY26, −₹74.1mn FY25) [`Financials (1).xls`, Income Statement tab]. All ratios below use the **consolidated** ₹29.81mn / ₹74.06mn figures; this is a bad-extraction correction to the triage's citation, not a new data gap.

Interest is **gross** (no net-interest presentation used) — consolidated Finance costs per Note 22, cross-checked against the reconciliation-of-lease-liabilities note and the Capital IQ Income Statement export.

Per `earnings/06_earnings-quality.md`, reported EBITDA is **more than fully cash-backed**: "CFO has exceeded EBITDA in every one of the last 5 years (121%–182%)" — so the EBITDA used for coverage below is not an inflated accrual figure; if anything cash generation runs ahead of it. No cash-quality caveat applies to the coverage ratios.

---

## 1. Coverage Ratios

All figures computed via an executed Python snippet (Bash); see the underlying arithmetic and cross-checks below the table.

| Ratio | FY26 (year ended 31-Mar-2026) | LTM (4 qtrs ended 30-Jun-2026) | Source |
|---|---:|---:|---|
| EBITDA / interest | 174.64x (5,205.94 / 29.81) | 212.36x (5,314.65 / 25.02) | Calc.; EBITDA per `01` §5; interest per Note 22 (consolidated) and Capital IQ LTM interest roll-forward (below) |
| EBIT / interest | 168.26x (5,015.93 / 29.81) | 205.86x (5,150.87 / 25.02) | Calc.; EBIT per `earnings/01_historical-financials.md` §1/§2 |
| (EBITDA − capex) / interest | 172.29x ((5,205.94−70.00) / 29.81) | 210.75x ((5,314.65−41.30) / 25.02) | Calc.; capex (abs.) per `earnings/01` §1/§2 |
| Fixed-charge coverage | 21.01x ((5,205.94−70.00) / 244.50) | Not computed — annual-only inputs (short-term/low-value lease expense disclosed annually, not quarterly) | Calc. — see formula below |

**LTM interest cross-check (roll-forward, not the raw CIQ figure taken at face value):** FY26 consolidated Finance costs (₹29.81mn) − Q1 FY26 quarter (₹10.36mn) + Q1 FY27 quarter (₹5.59mn) = **₹25.04mn**, which matches the Capital IQ Income Statement's own LTM "Interest Expense" column (−₹25mn) to within rounding [FY26 Annual Report, Note 22; `IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-21-2026).pdf`, Note 22 (₹5.59mn incl. deferred-consideration interest now ₹0 — fully extinguished by Q1 FY27); `IndiaMART_InterMESH_Limited_-_Form_Interim_Report(Jul-18-2025).pdf`, Note 22 (₹10.36mn)]. ₹25.02mn is used above (25.04 rounds within the same order; the 2-cent gap is a rounding artefact of the two source figures each carrying 2 decimal places).

**Fixed-charge coverage formula and inputs (FY26 annual):** `(EBITDA − capex) / (gross interest + scheduled debt amortization + lease payments)`.
- Gross interest (consolidated Note 22 total) = ₹29.81mn.
- Scheduled debt amortization = the principal portion of the FY26 cash lease-liability repayment. Total cash "Repayment of lease liabilities (including interest)" = ₹131.85mn [FY26 Annual Report, Note 15(a) reconciliation and Statement of Cash Flows]; of this, ₹27.09mn is the lease-interest component (already counted once, inside gross interest above), leaving **₹104.76mn** of principal amortization.
- Lease payments (additional, not already captured above) = short-term and low-value lease expense **not capitalized** under Ind AS 116 (expensed directly to "Other expenses," inside EBITDA) = ₹109.93mn FY26 [FY26 Annual Report, Note 35 fn.3].
- Total fixed charges = 29.81 + 104.76 + 109.93 = **₹244.50mn**.
- (EBITDA − capex) = 5,205.94 − 70.00 = ₹5,135.94mn.
- Fixed-charge coverage = 5,135.94 / 244.50 = **21.01x**.

**Cross-check against the Capital IQ Credit Health Panel's own printed ratio:** CIQ's "EBITDA/Interest Exp. (x)" line reads 177.78x (Mar-2026) / 215.87x (LTM Jun-2026) — both within ~2% of the figures computed above (174.64x / 212.36x), the residual gap consistent with the ~2.2% EBITDA cross-tab inconsistency already flagged in `earnings/01_historical-financials.md` fn.7, not a new error [`IndiaMART-InterMESH-Limited-NSEI-INDIAMART-Credit-Health-Panel__Financials.txt`, "Solvency" block].

**Read on coverage:** at 174.64x EBITDA/interest (FY26) and 212.36x on the latest LTM, IndiaMART's operating earnings cover its entire interest bill roughly 175–210 times over. This is not a company where coverage is a live risk factor — the number is this large specifically because gross debt is ₹231mn against ₹5.2bn of EBITDA, not because of any unusual accounting treatment.

---

## 2. Covenant Inventory

**No maintenance financial covenants exist because no covenant-bearing debt exists.** A full-text search of the FY26 Annual Report for "covenant" returns zero hits [FY26 Annual Report (Ind AS), full-text search, 2026-08-13]. The company's only interest-bearing obligation is ₹231.02mn / ₹216.28mn of Ind AS 116 lease liabilities (Note 15(a)) — leases carry no financial-maintenance-covenant package of the kind attached to a bank facility or bond indenture. There is no revolver, no term loan, no bond, and no rated debt: "List of all credit ratings obtained by the Company: Not Applicable" [FY26 Annual Report, BRSR section]. `01_capital-structure-and-leverage.md` §1 and §6A independently confirm zero bank borrowings and zero HoldCo-level debt.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage | None — no covenant exists | Gross debt/EBITDA 0.044x (FY26); net cash on both strict and broad basis | Not applicable | Full-text search, FY26 Annual Report; `01` §1/§5 |
| Min interest coverage | None — no covenant exists | 174.64x EBITDA/interest (FY26) | Not applicable | As above; §1 above |
| Min liquidity / net worth | None — no covenant exists | ₹31.2–33.9bn cash + ST investments (`01` §3) | Not applicable | `01` §3 |
| Springing covenant trigger (e.g. revolver utilization) | None — no revolver exists | N/A | Not applicable | `00_solvency-data-triage.md` §3 — "Committed/undrawn facility: N/A (none exists)" |
| Equity cure rights | None disclosed — moot, no covenant-bearing facility | N/A | Not applicable | Same evidence base |
| Other (cross-default / change-of-control / rating triggers) | Not disclosed in the data pool — consistent with the absence of any external loan/bond agreement | N/A | Not applicable | `00` §3, row "Change-of-control / cross-default / rating triggers" |

**On the PARTIAL-DATA RULE's typical-market-covenant proxy:** this agent's own operating instructions call for a labeled hypothetical covenant (e.g. max net leverage 4.0–4.5x, min interest coverage 2.0–3.0x) when no covenant disclosure exists, with indicative headroom computed against it. That fallback is built for the ordinary case of a levered borrower whose credit-agreement terms simply were not in the data pool. It does not fit here: IndiaMART is not an under-disclosed levered borrower — it is a **structurally debt-free** company (gross debt 0.044x EBITDA, ₹231mn of pure lease liabilities, no bank facility of any kind ever drawn — "Total Debt Issued = nil" in every period FY22 through LTM Jun-2026 per the cash-flow statement). Computing "headroom" against a fictional 4.0–4.5x leverage ceiling or a fictional 2.0–3.0x coverage floor for a company running at 0.04x leverage and 175x coverage would manufacture a number with no credit relationship behind it, and risks being read as if a real lender relationship existed — the opposite of calibration. Per CLAUDE.md §23 (prefer the rule that is more conservative and less likely to create false confidence) and `00_solvency-data-triage.md`'s explicit instruction on this point, the indicative-proxy step is **omitted as inapplicable** rather than computed and then discarded. **Covenant headroom is marked "Not assessable" for scoring** — but the underlying reason is a debt-free balance sheet (a positive per CLAUDE.md §24 Filter 3: net cash is a strategic asset), not an unfilled disclosure gap, and the synthesis layer should not apply the same discount it would to a genuinely undisclosed covenant package.

### Covenant EBITDA Definition & Quality (required if headroom is computed)

**Not applicable — headroom is not computed (Section 2 above).** There is no covenant-bearing debt and therefore no lender-defined "covenant EBITDA" concept to describe. IndiaMART's own reported EBITDA (₹5,205.94mn FY26) is a straightforward Ind AS consolidated-statement figure with no addbacks, no adjusted-EBITDA disclosure, and no lender-negotiated definition of any kind [`earnings/01_historical-financials.md` §4]. There is no "addback illusion" risk to flag because there is no addback-permissive covenant package to inflate.

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | N/A — no covenant-bearing debt | — |
| Addbacks permitted (types) | N/A | — |
| Addback caps / limits | N/A | — |
| Is covenant EBITDA materially above reported EBITDA? | N/A (no covenant EBITDA exists; reported EBITDA has no addbacks) | `earnings/01_historical-financials.md` §4 |

---

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | None exists — no maintenance covenant attaches to any of IndiaMART's obligations |
| Headroom on tightest covenant (%) | Not assessable — structural absence of covenant-bearing debt, not a disclosure gap |
| EBITDA decline that would breach it (approx.) | Not applicable — there is no covenant to breach |
| Debt increase that would breach it (approx.) | Not applicable — same reason |

**Illustrative context only (not a real threshold, not scored):** at FY26 EBITDA/interest of 174.64x, EBITDA would need to fall by roughly 99.4% — to about ₹30mn, essentially to zero — before operating earnings alone stopped covering the ₹29.81mn interest bill; well past any plausible operating scenario for this business. On the debt side, gross debt (₹231.02mn) would need to grow roughly 22x, to over ₹5.2bn, before gross debt/EBITDA even reached a moderate 1.0x — a scale of borrowing IndiaMART has never approached in the 5-year window in this pool (FY22 peak gross debt: ₹562.8mn, still entirely leases) [`01_capital-structure-and-leverage.md` §1]. Neither figure represents an actual covenant; they are shown only to size how far the current position sits from where a typical covenant package would normally bind, and should not be read as, or scored as, a real headroom number.

---

## 4. Coverage / Covenant Read

Earnings cover interest with room to spare that isn't really "coverage" in the ordinary distress-analysis sense — EBITDA/interest runs 174.6x for FY26 and 212.4x on the latest LTM, against a ₹29.81mn (FY26) / ₹25.04mn (LTM) interest bill that exists purely because Ind AS 116 capitalises office and equipment leases as debt, not because IndiaMART has ever drawn a bank loan, bond, or revolver. There is no tightest covenant to report and no headroom percentage to compute, because there is no covenant-bearing debt in the corporate structure at all (zero "covenant" hits in the full FY26 Annual Report text, no credit rating, "Total Debt Issued" nil in every period FY22–LTM Jun-2026) — this is a structural fact about a debt-free balance sheet, not a data gap this agent could not fill. Nothing plausible on the coverage or covenant side would trip anything here: it would take IndiaMART borrowing roughly 22x its current gross debt (to over ₹5.2bn) before even a conservative 1.0x leverage ceiling would bind, and an operating collapse of essentially the entire EBITDA base before interest coverage itself became a constraint — neither of which is what determines this company's fate, so any distress scenario for IndiaMART has to come from somewhere other than interest coverage or covenant breach.



---

## balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md

_Source: `05_off-balance-sheet-and-contingencies.md`_

# Off-Balance-Sheet & Contingencies — INDIAMART

**Reporting currency: INR (₹ millions), consolidated, Ind AS (Indian Accounting Standards), unless marked standalone. Fiscal year ends 31 March** (FY26 = year ended 31-Mar-2026). Jurisdiction: India, SEBI-LODR regime. Source for this note: FY26 Annual Report, Note 36 "Contingent liabilities and commitments" (consolidated) and Note 35 (standalone, company-only) [`IndiaMART_InterMESH_Limited_-_Form_Annual_Report(Apr-30-2026).pdf`].

---

## 1. Off-Balance-Sheet / Debt-Like Obligations

| Item | Recognized Liability | Maximum / Gross Exposure | Already in 01's debt? | Source |
|---|---:|---:|---|---|
| Operating leases (if not capitalized) | ₹0 — none exist off-balance-sheet | ₹0 | **Yes — fully capitalized.** Ind AS 116 (India's IFRS-16 equivalent) puts every lease (finance and what other regimes would call "operating") on the balance sheet as a right-of-use asset with a matching lease liability. The full ₹231.02mn (FY26) / ₹216.28mn (latest) lease-liability total already sits in `01`'s debt stack — there is no separate off-balance-sheet lease bucket to add here. | [FY26 Annual Report, Note 2 (Material accounting policies) — Ind AS 116 application; `01_capital-structure-and-leverage.md` §1–2] |
| Pension / OPEB underfunding | ₹591.1mn net unfunded (Projected Benefit Obligation ₹827.66mn − Plan Assets ₹236.58mn), FY26 | ₹591.1mn — same figure; a defined-benefit gratuity plan under Ind AS 19 is fully recognized, not a contingent add-on | **Yes — already on-balance-sheet.** Booked as Current ₹132.9mn + Long-Term ₹458.2mn "Pension & Other Post-Retire. Benefits" and already reflected in `01`'s balance-sheet read. Not an off-balance-sheet item; listed here only for completeness per this agent's checklist. | [`Financials Pension OPEB.xls`; `01_capital-structure-and-leverage.md` §2] |
| Securitization / factoring | ₹0 — not disclosed, no arrangement found | ₹0 | N/A | No securitization, receivables-factoring, or off-balance-sheet financing vehicle is disclosed anywhere in the FY26 Annual Report notes, the Capital IQ Capital Structure Details export, or the Fixed Income Securities Summary. Consistent with a subscription-prepaid, negative-working-capital business model that collects cash upfront and has no receivables book to securitize. [`Financials Capital Structure Details.xls`; FY26 Annual Report, full notes review] |
| Purchase / take-or-pay commitments | ₹0 recorded | **₹3.64mn** capital commitment (FY26) vs ₹3.26mn (FY25) | No — not part of the debt stack; a routine capex commitment, immaterial (~0.015% of FY26 equity of ₹24,003.75mn) | [FY26 Annual Report, Note 36(b) / standalone Note 35(b) — "Capital and other commitments"] |

No take-or-pay, minimum-purchase, or long-term supply commitment beyond the ₹3.64mn capital commitment above is disclosed. IndiaMART has no bank borrowings, no revolver, and no securitization vehicle — its only debt-like item (lease liabilities) is already fully on-balance-sheet under Ind AS 116, so this section finds **no material off-balance-sheet debt-like exposure**.

---

## 2. Guarantees & Letters of Credit

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| Standby letters of credit | ₹0 | ₹0 — not disclosed | N/A | Not disclosed in the data pool — no LC facility or line item appears in the FY26 Annual Report notes or the Capital IQ Capital Structure Details export |
| Financial guarantees | ₹0 | ₹0 — not disclosed | N/A | Not disclosed in the data pool. No parent guarantee of subsidiary debt is disclosed; consistent with subsidiaries themselves carrying no external borrowings (the two Livekeeping "Corporate Convertible" notes are $0mm outstanding — `01_capital-structure-and-leverage.md` §1 footnote) |
| Performance / surety bonds | ₹0 | ₹0 — not disclosed | N/A | Not disclosed in the data pool |

**No guarantee or LC facility of any kind is disclosed anywhere in the pool.** This is consistent with a debt-free operator (per `01`) that has no bank credit lines requiring collateral support, and is not itself evidence of hidden exposure — the absence is corroborated by the contingent-liabilities note (Section 3 below) containing no guarantee-related items and by `business-model/11_capital-allocation-governance.md`'s independent read of the same note ("Off-balance-sheet items" row), which lists only the tax/GST demands below.

---

## 3. Litigation & Tax Contingencies

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) | Source |
|---|---:|---:|---|---|
| Income-tax demand, AY2016-17 — addition of income re: securities-premium receipts on share allotment to IndiaMART InterMESH Ltd, at subsidiary Busy Infotech (formerly Tolexo Online) — carried-forward losses reduced from ₹719.22mn to ₹482.07mn | ₹0 (no tax expense accrued) | ₹59.69mn (tax impact @25.17%) | **Active** — pending with CIT(Appeals); company contesting, management states its position is "possible to be upheld" | [FY26 Annual Report (consolidated), Note 36(a)(ii)(a)] |
| Income-tax demand, AY2017-18 — same securities-premium issue, Busy Infotech | ₹0 (no tax expense accrued) | ₹242.99mn | **Active** — company contesting in the appellate process; management states its position is "possible to be upheld" | [FY26 Annual Report (consolidated), Note 36(a)(ii)(b)] |
| Service-tax demand FY2013-14 to FY2017-18 — "Net gain on sale of current investments" under CCR 2004 rule 6(3) | ₹15.38mn principal already provided (FY2019-20); **₹15.38mn penalty not provided** | ₹15.38mn (unprovided penalty portion; principal of ₹15.38mn already booked separately) | **Active** — Commissioner (Appeals) rejected the company's appeal and imposed a 100% penalty; company has appealed to Tribunal, "believes the Company's position in the matter will be tenable" | [FY26 Annual Report (consolidated), Note 36(a)(ii)(c); standalone Note 35(a)(1)] |
| GST demand — Central GST Commissionerate, Noida — alleged incorrect ITC availment under Form TRAN-1 (transitional credit, Tolexo demerger) | ₹0 (no provision made) | ₹203.80mn (₹101.90mn demand + 100% penalty of ₹101.90mn) | **Active and recently escalated** — Commissioner (Appeals) dismissed the company's appeal on 2 April 2026 (post FY26 year-end); company is filing a further appeal before the Appellate Tribunal, states management "believes the case has strong merits" | [FY26 Annual Report (consolidated), Note 36(a)(ii)(d); standalone Note 35(a)(2)] |
| General ordinary-course litigation, claims, and proceedings (unquantified) | ₹0 disclosed provision for this catch-all; specific matters below the recognition threshold are individually provided where probable | Not quantified — company states amount/range of "reasonably possible loss" will not, individually or in aggregate, be material | **Remote / immaterial per company's own language** — explicit statement: "will not... have a material adverse effect on its business, financial position, results or cash flows" | [FY26 Annual Report (consolidated), Note 36(a)(ii); standalone Note 35(a)(3)] |

**Reconciliation note on the disclosed "Service tax/GST demand" contingent-liability total (₹219.18mn):** the ₹219.18mn figure in the note's summary table is the sum of the two unprovided residuals above — the ₹15.38mn penalty on the older service-tax matter (its ₹15.38mn principal is already booked, so only the penalty is a live contingent item) plus the full ₹203.80mn demand-plus-penalty on the newer TRAN-1 GST matter (nothing provided). 15.38 + 203.80 = 219.18, which ties exactly to the filed figure — confirming the read.

**Standalone (parent-only) note carries only the ₹219.18mn GST/service-tax items** — the ₹302.68mn income-tax demand sits at subsidiary Busy Infotech and appears only in the consolidated note (Note 36), not the standalone note (Note 35). Group-level (consolidated) max exposure is therefore the relevant figure for this module.

No matter above is flagged by the company as "probable" (which would require a booked provision under Ind AS 37); all four quantified items are disclosed as "possible," i.e. contingent rather than provided, and are all currently active in the appellate process rather than dormant or withdrawn — the TRAN-1 GST matter (₹203.80mn) is the most recently and adversely escalated, having just lost its first appeal in April 2026.

---

## 4. Contingent Exposure Summary

| Metric | Value |
|---|---:|
| Total recognized (booked) contingent liabilities | ₹0 — by definition under Ind AS 37, none of the disclosed contingent items carry a balance-sheet provision (the ₹15.38mn service-tax principal is booked, but that amount is excluded from the ₹219.18mn contingent figure itself — see reconciliation above) |
| Total maximum / gross exposure (consolidated, group level) | **₹521.86mn** = ₹302.68mn income-tax demands (Busy Infotech, AY2016-17 + AY2017-18) + ₹219.18mn GST/service-tax demands (incl. penalties) |
| Total maximum / gross exposure (standalone, parent only) | ₹219.18mn (GST/service-tax items only) |
| Capital commitments (non-contingent, contractual) | ₹3.64mn (FY26) |
| Max exposure ÷ recognized | Not meaningful — recognized base is ₹0 (nothing is provided for on the balance sheet; the entire ₹521.86mn sits off-balance-sheet as disclosed-but-unprovided contingent liability) |
| Max exposure ÷ total equity | **2.17%** (₹521.86mn ÷ ₹24,003.75mn FY26 consolidated equity, per `01_capital-structure-and-leverage.md` §5) |

---

## 5. Contingency Read

IndiaMART's off-balance-sheet and contingent exposure is small and fully disclosed: ₹521.86mn of maximum contingent exposure (four active, appealed tax/GST demands, none provided for) against ₹24.0bn of equity is 2.17% — immaterial to solvency even in a worst-case loss outcome. There is no undisclosed off-balance-sheet debt: leases are already fully capitalized under Ind AS 116 (captured in `01`'s debt stack), pension is fully recognized on-balance-sheet, and no guarantees, letters of credit, or securitization vehicles exist anywhere in the pool. The most active item — the ₹203.80mn TRAN-1 GST demand, which just lost its first appeal in April 2026 — is live and moving against the company procedurally, but even its full crystallization (plus every other quantified item) would not threaten solvency or liquidity for a company that is net cash on every measure (per `01`).

The rule-of-thumb spike test (max exposure ÷ recognized > 3x, or ÷ equity > 15%, AND the matter is live) is not met here: the equity ratio is 2.17%, far below the 15% threshold, so no `RF-OBS-001` tag is warranted despite all four quantified matters being procedurally active rather than remote.

---

## Partial-Data Note

The Contingent Liabilities & Commitments note (FY26 Annual Report, Note 36 consolidated / Note 35 standalone) is not thin — it itemizes specific demands with amounts, appeal status, and management's own assessment for each. No guarantee, LC, or securitization disclosure exists to review because none appears to exist for this business (a debt-free, subscription-prepaid marketplace with no receivables-financing need, per `01`). This is not a known-litigious or highly-levered name (zero bank debt, net cash on every measure, disclosed litigation assessed by the company as immaterial in aggregate) — the partial-data solvency-strength cap for "off-balance-sheet exposures undisclosed for a known-litigious/levered name" does not apply.



---

## balance-sheet-survival / 06_downside-stress-test.md

_Source: `06_downside-stress-test.md`_

# Downside Stress Test — INDIAMART

**Reporting currency: INR (₹ millions), consolidated, Ind AS. Fiscal year ends 31 March.** EBITDA basis: **reported** (IndiaMART discloses no adjusted/non-GAAP EBITDA — full-text search of the FY26 Annual Report for "adjusted EBITDA"/"non-GAAP" returns no matches [`earnings/01_historical-financials.md` §4]). Base period is **FY26 (year ended 31-Mar-2026, audited)**; the latest quarter (30-Jun-2026) and LTM figures are shown as cross-checks. All computations below (leverage, coverage, liquidity gap, break-point solves) were produced by an executed Python snippet; the exact inputs and outputs are reproduced inline.

**Cash-backed EBITDA confirmed.** Per `earnings/06_earnings-quality.md` §2, CFO has exceeded EBITDA in every one of the last 5 years (121%–182% of EBITDA), with no cash-conversion red flags — the EBITDA used below is real, collected cash, not an inflated accrual figure. No divergence between headline and cash-backed EBITDA exists for this company, so no adjustment is required.

---

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed, FY26 annual) | ₹5,205.94mn | `01_capital-structure-and-leverage.md` §5; cross-check LTM (4qtrs to 30-Jun-2026) ₹5,314.65mn |
| Gross debt | ₹231.02mn (FY26-end) / ₹216.28mn (latest, 30-Jun-2026) — 100% lease liabilities (Ind AS 116), no bank borrowings/bonds/term loans/revolver | `01` §1 |
| Net debt (strict, §15 canonical basis per `01`) | **−₹573.11mn (net cash)** FY26-end / −₹151.83mn (net cash) latest | `01` §4, §7 |
| Net debt (broad basis, labelled, not canonical) | −₹30,971.63mn (net cash) FY26-end / −₹33,670.30mn (net cash) latest | `01` §4 |
| Net debt / EBITDA | N/M — net cash on both bases at every date shown (strict: −0.11x FY26; broad: −5.95x FY26) | `01` §5 |
| EBITDA / interest | 174.64x (FY26) / 212.36x (LTM Jun-26) | `04_coverage-and-covenants.md` §1 |
| Tightest covenant + threshold | **None exists** — no covenant-bearing debt (zero "covenant" hits in the full FY26 Annual Report text; only debt is ₹231mn of Ind AS 116 lease liabilities; no bank facility, bond, or rated debt of any kind) | `04` §2 |
| Next-12m obligations | ₹158.68mn = ₹117.38mn undiscounted lease payments due within 12 months + ₹41.30mn LTM maintenance/total capex (no split disclosed) + ₹0 committed dividends | `03_liquidity-runway.md` §2 |
| Committed liquidity (effective, adjusted to today 13-Aug-2026) | ₹30,649.92mn = ₹33,886.58mn total cash + ST investments + treasury book (30-Jun-2026) − ₹3,236.66mn FY26 dividend paid 29-Jul-2026 (already-executed cash outflow not yet reflected in the last balance sheet in the pool) | `03` §1 |
| Floating-rate debt (gross) | ₹0 — 100% of gross debt (lease liabilities) carries a fixed implicit/incremental-borrowing rate set at lease inception | `02_maturity-wall-and-refinancing.md` §3 |
| Hedge coverage | N/A — company states it is "not engaged in commodity trading, hedging or exchange risk management activities"; no floating-rate exposure exists to hedge | `business-model/10_external-dependency.md` §1 |
| Working-capital seasonality / peak build | Not materially seasonal (2–3pp quarterly revenue-share spread, below the >30%/<20% flag threshold); operating working capital is structurally **negative** (−₹12,916.52mn at FY26-end) because customers prepay annual subscriptions — working-capital movements are a net cash source, not a use | `03` §3; `earnings/01_historical-financials.md` §5 |

**Cycle position of the EBITDA base:** `business-model/10_external-dependency.md` classifies IndiaMART as **"Partly externally driven"** (External Dependency Risk Score 52/100, inverted scale — higher = worse), not a deep cyclical/commodity name, so the MODULE_RULES trough-to-peak calibration overlay is not mandatory here. For context only: the worst single-year historical EBITDA move in the 5-year window in this pool was FY22→FY23, a **−11.9% decline** (₹2,971.01mn → ₹2,618.07mn), driven by a cost cycle (employee-expense step-up), not a demand shock — well inside the −30% haircut floor tested below. No formal history-calibrated scenario is added as a separate column for this reason, but the gap between that worst historical print and the haircuts tested is itself informative (Section 4).

**No pending or recently-announced material acquisition** requiring a pro-forma base was found in `business-model/11_capital-allocation-governance.md` or elsewhere in the data pool — the one control acquisition in the pool's window (Busy Infotech/Tolexo, $66.93mm) closed in FY22 and is already fully reflected in the FY26 balance sheet used above. No pro-forma adjustment is required.

---

## 2. Stress Scenarios

All figures computed via executed Python (inputs: FY26 EBITDA ₹5,205.94mn; FY26 gross debt ₹231.02mn; FY26 net debt strict −₹573.11mn / broad −₹30,971.63mn; FY26 consolidated interest ₹29.81mn; FY26 FCF ₹6,872.19mn; FY26 effective tax rate 26.74%; next-12m obligations ₹158.68mn; effective committed liquidity ₹30,649.92mn).

**FCF-to-EBITDA scaling assumption (stated per step 5):** lost EBITDA drops through to free cash flow at the after-tax operating margin, holding cash interest and maintenance capex fixed: `stressed FCF(h) ≈ FCF_base − EBITDA·h·(1 − tax rate)`, tax rate = 26.74% (FY26 effective rate, per `earnings/06_earnings-quality.md` §8). This is a simplifying assumption, not a filed figure — labelled as such. It is directionally conservative for h up to 60% (it assumes none of the lost EBITDA is offset by lower variable cost or working-capital release, even though this business's deferred-revenue collections would likely cushion cash generation further); it becomes unreliable at h approaching 100% (fixed costs would force actual losses long before EBITDA hits exactly zero), so results near h=100% in Section 3 are directional only, not literal.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA (₹mn) | 5,205.94 | 3,644.16 | 3,123.56 | 2,082.38 | 3,123.56 | 3,123.56 |
| Gross debt / EBITDA | 0.0444x | 0.0634x | 0.0740x | 0.1109x | 0.0740x | 0.0740x |
| Net debt / EBITDA (strict) | −0.11x (net cash) | −0.16x (net cash) | −0.18x (net cash) | −0.28x (net cash) | −0.18x (net cash) | −0.18x (net cash) |
| Net debt / EBITDA (broad, labelled) | −5.95x (net cash) | −8.50x (net cash) | −9.92x (net cash) | −14.87x (net cash) | −9.92x (net cash) | −9.92x (net cash) |
| EBITDA / interest | 174.64x | 122.25x | 104.78x | 69.85x | 104.78x | 104.78x (rate shock does not touch fixed-rate lease interest) |
| Tightest covenant headroom | Not assessable — none exists | Not assessable | Not assessable | Not assessable | Not assessable | Not assessable |
| Covenant breach? (Y/N) | N — no covenant to breach | N | N | N | N | N |
| Stressed FCF (₹mn) | 6,872.19 | 5,727.99 | 5,346.55 | 4,583.65 | 4,562.03 | 5,346.55 |
| 12-month liquidity gap (₹mn, negative = surplus) | −37,363.4 | −36,219.3 | −35,837.9 | −35,075.1 | −35,053.4 | −35,837.9 |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

Notes on the two shock columns:
- **−40% + WC shock:** working-capital seasonality is not disclosed as material (Section 1), so per the labeled-assumption rule this column applies a conservative labeled outflow of **5% of FY26 revenue** (₹15,690.42mn × 5% = ₹784.52mn) added to the 12-month obligations bucket. *Inference, not from filings — labeled assumption, not a disclosed seasonal build.* Even with this outflow layered on top of a 40% EBITDA cut, the liquidity gap stays a ₹35.05bn surplus.
- **−40% + rates +200bp:** **Not applicable / not computable as a distinct scenario.** IndiaMART carries zero floating-rate debt (100% of gross debt is fixed-rate lease liabilities, `02` §3) and no hedges, so a +200bp shock to the floating portion has **no effect on interest expense** — this column is numerically identical to the plain −40% column on every debt-side metric. (A +200bp move would raise the yield on the ₹30bn+ treasury book, which is an asset-side upside, not a liability-side risk, and is outside this stress test's scope.)

---

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches | **Not applicable — no covenant-bearing debt exists.** There is no threshold `T` to solve against; the company has never drawn a bank loan, bond, or revolver (`04` §2), so no maintenance covenant of any kind attaches to its ₹231mn lease-liability book. |
| Committed liquidity exhausted within 12 months | **h = 9.80 (980%)** — solve: `usable liquidity + FCF_base − EBITDA·h·(1−tax) = next-12m obligations` → `30,649.92 + 6,872.19 − 5,205.94·h·0.7326 = 158.68` → `h = (30,649.92 + 6,872.19 − 158.68) / (5,205.94 × 0.7326) = 9.797`. This exceeds 1 (100%) by nearly 10x — **not reached on an EBITDA decline alone.** EBITDA cannot decline more than 100% (to zero) under this framing; reaching this break point would require the company to be losing money at roughly 9–10x its current EBITDA scale for a full year, which is outside any plausible operating scenario. |
| Net leverage exceeds 6x (illustrative refi-market threshold) | **h ≥ 1.02 (strict basis), h ≥ 1.99 (broad basis) — not reached.** MAX-form solve: `h = 1 − net debt / (T × EBITDA)`. Strict: `h = 1 − (−573.11) / (6.0 × 5,205.94) = 1 + 0.0184 = 1.018`. Broad: `h = 1 − (−30,971.63) / (6.0 × 5,205.94) = 1 + 0.991 = 1.991`. Because net debt is **negative** (net cash) on both bases, the leverage ratio stays negative (net cash) for any EBITDA decline short of 100% — an EBITDA decline alone cannot flip this balance sheet into net debt of any multiple, let alone 6x. Net debt would first have to turn positive (new borrowing or a cash outflow exceeding the entire ₹573mn–₹31.0bn net-cash cushion) before a leverage ratio in the conventional sense even exists. |

**Illustrative, non-covenant sanity check (not a real threshold, shown only to size distance):** EBITDA/interest would fall to 1.0x — the point at which operating earnings alone stop covering the ₹29.81mn interest bill — only at **h = 0.994 (99.4%)**, i.e. EBITDA would need to collapse to roughly ₹30mn from ₹5,206mn. This is not a covenant and is not scored; it exists only to confirm that interest coverage, like leverage and liquidity, is not a plausible failure channel for this company (`04` §3 makes the same point independently).

---

## 4. Survival Read

IndiaMART does not break on any of the three channels this test exists to find — covenant, leverage, or liquidity — at −30%, −40%, or −60% EBITDA, and the executed solves in Section 3 show the structure does not break even under EBITDA declines several multiples beyond a 100% wipeout of current earnings. The reason is structural, not a favorable assumption: gross debt is ₹231.02mn (100% fixed-rate lease liabilities) against ₹5.2bn of FY26 EBITDA and ₹30.6bn of effective liquidity, there is no covenant-bearing debt of any kind to breach, and the company's next-12-month contractual obligations (₹158.68mn) are covered by cash and liquid investments alone roughly 193 times over before a rupee of stressed free cash flow is even counted. A normal recession-scale EBITDA decline of 30–40% is trivially survivable on its own — it moves gross leverage from 0.044x to 0.074x and coverage from 175x to 105x, neither of which approaches a stress point for any lender or the company itself. Market closure test: assuming no new unsecured refinancing is available for 12 months changes nothing, because IndiaMART has no unsecured (or any) debt to roll in the first place — its only "maturity" is a schedule of lease payments funded from cash on hand, and that conclusion holds with or without capital-markets access (`02` §4–5).

**IndiaMART is net cash on both the strict basis (−₹573.11mn at FY26-end, canonical per `01`) and the broad basis (−₹30,971.63mn, labelled), and it survives every haircut tested — 30%, 40%, 60%, plus a labeled working-capital shock — with no covenant breach and no liquidity gap.** This is the strongest survival outcome this module can report, and per MODULE_RULES and CLAUDE.md §24 (Filter 3), the ₹30–34bn net-cash position is **strategic optionality** — counter-cyclical capacity to keep investing, hold headcount, absorb a demand shock in the India SME sector (the one genuine external risk flagged by `business-model/10_external-dependency.md` — geopolitical and consumer-cycle exposure scored 52/100 on the inverted dependency scale, materially higher than any balance-sheet risk in this dossier), or fund further bolt-on M&A without any refinancing dependence — not idle capital and not a "nothing breaks" blandness finding. If this company fails, the failure will show up first in the operating business (subscriber losses, pricing power, the SME demand cycle already flagged elsewhere in this dossier), not in the balance sheet this module tests.
