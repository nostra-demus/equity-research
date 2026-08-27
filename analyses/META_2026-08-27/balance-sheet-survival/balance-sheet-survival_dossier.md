# balance-sheet-survival Module Dossier — META

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `balance-sheet-survival_memo.md`.

- Generated: 2026-08-27T14:14:03Z
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

# Balance-Sheet-Survival Module — META (Synthesis)

## Abstract

Meta carries low leverage today — net debt of $68.2 billion against TTM EBITDA of $112.1 billion, a net leverage (net debt/EBITDA, what it owes relative to one year of cash-generating profit) of 0.61 times on the strict cash-only basis, or net CASH of $6.6 billion once marketable securities are counted — but the direction is a genuine build: from net cash every year FY2021–FY2024 to real net debt now, driven by bond issuance funding an AI-infrastructure capex program that has outrun free cash flow. Nothing is contractually due in the next 12 months, and cash alone ($15.5 billion) covers everything due through 2030 (1.5x over). Committed liquidity of $90.3 billion produces no finite runway limit, and there is no financial covenant on the notes to test headroom against. The stress test found no break point even at a full 100% EBITDA wipeout for a year. The verdict is a fortress balance sheet today, tempered by the rising-leverage trend and a $696 billion off-balance-sheet forward-commitment buildout that could compress the free-cash-flow cushion this read leans on.

## 1. Solvency Verdict

- **Verdict:** Fortress balance sheet
- **Net leverage (net debt / EBITDA):** 0.61x on the strict basis (net debt $68,202m ÷ TTM reported EBITDA $112,056m, June 30, 2026) — canonical basis per `01`. On the broad basis (also netting $74,798m of marketable securities), META is net CASH of $6,596m (−0.06x). Both bases carried with their labels per CLAUDE.md §15. [`01_capital-structure-and-leverage.md` §4–5]
- **Liquidity runway:** No finite runway — TTM free cash flow ($37,872m) alone covers the entire 12-month non-FCF obligation load ($5,398m of dividends, $0 debt maturities) with a $32,474m annual surplus, before touching $90,260m of on-hand cash and marketable securities, which alone would cover 12-month obligations for roughly 200 months. [`03_liquidity-runway.md` §3]
- **Maturity wall (% within 24 months):** 5.06% of face debt ($4,250m of $84,000m); 0.0% within 12 months. 87.8% ($73,750m) sits in an undifferentiated "Thereafter" bucket spanning 2031–2066 with no year-by-year split disclosed. [`02_maturity-wall-and-refinancing.md` §1–2]
- **Tightest covenant + headroom:** None exists — "We are not subject to any financial covenants under the Notes" [Q2 FY26 10-Q, Note 8, cited in `04_coverage-and-covenants.md` §2]. Not assessable in the technical sense, but a favorable structural fact (no maintenance covenant to breach), not a disclosure gap.
- **Stress break point (EBITDA decline that breaks it):** None found inside the tested range. Net leverage rises to only 1.52x even at −60% EBITDA; a full, mechanical 100% EBITDA wipeout for 12 months still leaves a $34,210m liquidity surplus over 12-month obligations. Illustrative (not real) covenant thresholds would require an 86–96% EBITDA collapse. [`06_downside-stress-test.md` §2–3]
- Solvency strength /100: **82** — leverage and liquidity levels are exceptionally strong, but the score is held below the top band by the pace of the leverage build (net cash → 0.61x net debt in under two years) and the scale of growing off-balance-sheet forward commitments (see 1A). No MODULE_RULES cap applies (§4 below).
- Liquidity runway /100: **95**
- Refinancing risk /100 (higher = worse): **12** — negligible near-term wall, wide cash cushion, but the undated 87.8% "Thereafter" bucket keeps this off zero.
- Covenant headroom /100: **Not assessable** — no financial covenants exist on the Notes; this is a favorable fact pattern (zero contractual breach risk), not the disclosure gap the "Not assessable" classification usually signals. [`04_coverage-and-covenants.md` §3]
- Downside resilience /100: **95** — the stress test (mandatory, ran fully) found no break point at −30%, −40%, −60%, the combined working-capital shock, or even a full EBITDA wipeout.
- Data quality /100: **92** — from `00`: Sufficiency verdict "Sufficient," 0 pool-extraction failures, full debt note, maturity schedule, cash flow statement, and covenant disclosure all present and cross-checked.
- Overall usefulness /100: **90**
- Biggest solvency risk (one line): not a near-term survival risk but a trajectory one — debt-funded capex ($89,325m TTM, +71% YoY) is outrunning FCF ($37,872m TTM, −20% YoY), while $696,300m of non-cancelable purchase commitments and not-yet-commenced leases (up 166–236% in six months) sit entirely off the debt stack and will need to be funded from that same, currently shrinking, FCF cushion.

## 1A. Module Disconfirmation

- **Strongest bear point:** net debt swung from −$15,063m (net cash, FY2024) to +$68,202m (0.61x EBITDA) in six quarters, funded by five bond issuances totaling $84,000m face value since Aug-2022 (most recently $30,000m Nov-2025, $25,000m May-2026); EBITDA/interest coverage compressed from 129.9x (FY2023) to 55.2x (TTM) over the same window, and a single-quarter annualized run-rate (Q2'26 interest alone) would already push coverage to ~36x. [`01_capital-structure-and-leverage.md` §6; `04_coverage-and-covenants.md` §1]
- **Strongest bull point:** even holding the debt stack, dividend, and capex fully constant, a full mechanical 100% EBITDA wipeout for 12 months still leaves a $34,210m liquidity surplus, because $90,260m is already sitting in cash and marketable securities today — the survival math does not depend on the leverage trend reversing. [`06_downside-stress-test.md` §2]
- **Single killer risk specific to solvency:** none identified inside the tested range — the module's own stress test, run mandatorily across −30/−40/−60% EBITDA plus a working-capital and rate shock, found no covenant breach, no liquidity gap, and no maturity-driven distress at any tested level. The closest thing to a killer risk is off-balance-sheet, not on-balance-sheet: if the $696,300m of firm forward commitments (purchase commitments + not-yet-commenced leases) continues compounding at its disclosed six-month pace (+166% to +236%) while FCF keeps falling (−20.4% YoY), the FCF cushion this liquidity read leans on could shrink or reverse, shifting the burden onto the $90,260m in-hand balance — still large, but no longer growing. [`05_off-balance-sheet-and-contingencies.md` §1, §5]
- **Disconfirming evidence already visible:** `05` computes a quantified contingent-exposure bucket of ≈$178,808m (9.5x the $18,740m recognized liability, 68.5% of equity) — dominated by two unconsolidated data-center joint ventures ($46,030m and $13,000m max exposure) and a live IRS transfer-pricing dispute ($15,890m newly asserted for 2017–2019 on top of a rising $18,740m recorded balance) — and flags this with a standalone red-flag tag, `RF-OBS-001 (contingent-liability spike)`.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| solvency-data-triage | Sufficiency verdict: Sufficient — all six module sections can run on primary filings | No revolving credit facility or commercial paper program disclosed anywhere in the pool; META relies solely on cash + marketable securities for liquidity |
| capital-structure-and-leverage | Net debt/EBITDA 0.61x strict (net cash $6,596m on broad basis); gross debt $83,664m, 100% fixed-rate senior unsecured notes | Leverage flipped from net cash (every year FY2021–FY2024) to net debt in FY2025 and has since more than doubled by mid-2026, funded by AI-infrastructure capex outrunning FCF |
| maturity-wall-and-refinancing | Self-funded / low refi risk — $0 due in 12 months, 5.06% due in 24 months, ~20-year weighted-average maturity | 87.8% of face debt ($73,750m) sits in an undifferentiated "Thereafter" bucket (2031–2066) with no disclosed year-by-year split |
| liquidity-runway | No finite runway — FCF surplus of $32,474m annually before touching $90,260m of on-hand liquidity | Trajectory risk: TTM capex +71.2% YoY vs TTM FCF −20.4% YoY, against $349,310m of non-cancelable AI-infrastructure purchase commitments |
| coverage-and-covenants | EBITDA/interest 55.2x TTM; no maintenance financial covenants exist under the Notes | Coverage compressed from 129.9x (FY2023) to 55.2x (TTM) as interest expense nearly quintupled on five bond issuances since Aug-2022 |
| off-balance-sheet-and-contingencies | Quantified contingent exposure ≈$178,808m (9.5x recognized, 68.5% of equity); RF-OBS-001 fired | $696,300m of firm forward commitments (purchase commitments + leases not yet commenced) sits entirely off the debt stack, up 166–236% in six months |
| downside-stress-test | Survives −30/−40/−60% EBITDA, a combined working-capital shock, and a full 100% EBITDA wipeout without a covenant breach, liquidity gap, or need for external action | No break point reached anywhere inside the tested range — the illustrative covenant thresholds would require an 86–96% EBITDA collapse |

## 3. Reconciliation

No material disagreements between specialists on the underlying numbers. The one item every downstream agent had to carry consistently, and did, is the strict-vs-broad net-debt divergence: `01` designates strict ($68,202m net debt, 0.61x) as canonical and broad (net cash of $6,596m) as context, and `02`, `03`, `04`, `06` all reuse that same framing without silently switching basis. `03` and `04` also each chose the more conservative of two available figures where a choice existed — `03` used the higher P&L interest-expense figure ($2,029m TTM) over the lower cash-interest-paid figure ($696m FY2025) per MODULE_RULES §7 ("assume the more fragile reading"); `04` used the same TTM P&L interest figure for its coverage ratios. This is consistent methodology, not a disagreement to reconcile.

## 3A. Fragility Map (what breaks first)

| Fragility Driver | Indicator | Current Status | Why It Matters |
|---|---|---|---|
| Maturity concentration | % due within 24m | 5.06% ($4,250m); 87.8% undated in "Thereafter" (2031–2066) | No near-term wall, but a single-year spike decades out cannot be ruled out from disclosed data |
| Availability liquidity | usable liquidity vs uses | $90,260m (cash + marketable securities) vs $5,398m 12-month non-FCF obligations | No revolver exists at all — liquidity is self-funded from the balance sheet, not facility-dependent |
| Covenant illusion risk | covenant EBITDA vs reported | N/A — no covenant, no adjusted-EBITDA addback bucket of any kind | Zero addback risk because there is nothing to add back to and nothing to test against |
| Floating-rate sensitivity | floating % net of hedges | 0% — 100% of funded debt is fixed-rate | A rate shock cannot reprice any existing debt; only future new issuance |
| Structural subordination | HoldCo debt vs upstreaming | N/A — single-entity issuer, no HoldCo/OpCo structure | No trapped-value or upstreaming risk |
| Contingent accelerants | CoC puts / cross-default | Not disclosed in the data pool | Unknown whether a rating or CoC event could accelerate debt — absence of evidence, not evidence of absence |

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No debt maturity schedule | N — full future-principal-payments schedule disclosed in 10-K/10-Q | Solvency strength | Not applied |
| No covenant disclosure | N — an explicit "no financial covenants" disclosure exists; this is disclosure, not absence | Covenant headroom | Not applied (headroom classified "Not assessable" for the favorable reason stated above, not the usual gap-driven reason; Overall usefulness NOT capped to 75) |
| No cash flow statement | N — full cash flow statement present in 10-Q, CIQ tabs, press releases | Liquidity runway | Not applied |
| Only annual data (no interim) | N — Q2 FY2026 10-Q (interim) used as the primary balance-sheet date throughout | Solvency strength | Not applied |
| No EBITDA base (stress not run) | N — EBITDA base computable and cross-checked; stress test ran in full | Downside resilience | Not applied |

No MODULE_RULES score cap applies to this run. The 82/100 solvency-strength score and the 12/100 refinancing-risk score reflect this synthesis's own judgment on the leverage trajectory and off-balance-sheet growth (§1A), not a mechanical cap.

## 5. Survival Summary

META is lightly levered by any conventional measure — 0.61x net debt/EBITDA on the strict basis, or outright net cash on the broad basis — but the trend is unambiguously worsening: net debt has moved from −$23,477m (net cash, FY2023) to +$68,202m in roughly two and a half years, entirely to fund an AI-infrastructure capex program that has outrun free cash flow (TTM capex +71.2% YoY vs TTM FCF −20.4% YoY). The near-term maturity wall is not a refinancing question at all — $0 is due in the next 12 months and cash on hand alone covers everything due through 2030 1.5 times over — so the wall is self-funded, not refinancing-dependent. The liquidity runway has no finite limit under current obligations: $90,260m of cash and marketable securities plus a large FCF surplus mean the company is not approaching any liquidity constraint, and there is no covenant to break because the Notes carry none. A normal recession-scale shock (−30% to −40% EBITDA) is comfortably survivable without an equity raise, asset sale, or waiver, and even a −60% EBITDA decline or a full, mechanical 100% wipeout for a year does not exhaust liquidity or breach an illustrative covenant threshold. The one genuine fragility is off the balance sheet: $696,300m of firm forward commitments (purchase commitments plus leases not yet commenced) is compounding faster than FCF, and if that pace continues, the FCF cushion this survival read currently leans on could shrink or reverse in future periods.

## 6. What Would Change The Solvency Verdict?

| Current Verdict | What Would Strengthen It | What Would Weaken It | Data Needed |
|---|---|---|---|
| Fortress balance sheet | FCF growth outpacing capex again, reversing the net-debt build; a disclosed year-by-year split of the "Thereafter" maturity bucket showing no concentration; a primary rating-agency report confirming AA- or higher | Continued acceleration of debt-funded capex pushing net debt/EBITDA materially above 1x with no FCF recovery; the $696,300m of firm forward commitments crystallizing into cash outflows faster than FCF can absorb; a material adverse outcome in the IRS transfer-pricing dispute ($15,890m newly asserted) or the New Mexico AG trial ($62,850m sought) | Next 2–3 quarters of capex/FCF trend; the un-itemized 72% of the "Thereafter" debt bucket; a primary S&P/Moody's/Fitch rating report |

## 6A. Survival Playbook (non-speculative levers)

- Share repurchases already suspended in practice: zero shares repurchased in H1 FY2026, a discretionary cash-return lever already not being used [`03_liquidity-runway.md` §2, sourced to `business-model/11_capital-allocation-governance.md`].
- Dividend continues uninterrupted ($2,699m paid H1 FY2026) and is not contractually constrained (no covenant exists to restrict it) — a future suspension, if needed, remains available but is not currently evidenced as being contemplated.
- Demonstrated, repeated capital-markets access: five senior unsecured bond issuances since Aug-2022 totaling $84,000m face value, the latest as recently as May-2026 — evidence of standing refinancing/funding capacity, not a plan for a specific future need [`02_maturity-wall-and-refinancing.md` §4].
- No asset-sale program, no capex-cut announcement, and no covenant-amendment history are evidenced in the data pool — capex is currently rising (+71.2% YoY), not being pulled back.

## 7. Note To The Final Synthesizer

- Leverage is low but rising fast, both gross and net: gross debt $83,664m (0.75x EBITDA); net debt $68,202m strict (0.61x EBITDA) — up from net cash every year FY2021–FY2024. On the broad basis (netting marketable securities), META remains net cash of $6,596m; carry both figures with their basis label, never one alone.
- The maturity wall is a non-event for solvency purposes: $0 due in 12 months, 5.06% due in 24 months, self-funded by cash on hand alone (1.5x cover through 2030); the only wall-related uncertainty is the undisclosed year-by-year split inside the 87.8% "Thereafter" bucket (2031–2066), which is a disclosure-granularity limitation, not a near-term refinancing risk.
- The liquidity runway has no finite limit under current 12-month obligations: $90,260m in-hand liquidity plus a $37,872m TTM FCF surplus; the runway depends on already-in-hand cash, not on FCF holding up.
- There is no covenant to name as tightest — META's Notes carry no maintenance financial covenants at all, a favorable structural fact, not an "undisclosed" gap; covenant headroom is "Not assessable" for that reason.
- The largest live off-balance-sheet / contingent exposure: `RF-OBS-001 (contingent-liability spike)` — a quantified contingent-exposure bucket of ≈$178,808m (9.5x the $18,740m recognized liability, 68.5% of total equity), dominated by two unconsolidated data-center joint ventures and a live IRS transfer-pricing dispute; separately, and larger still, $696,300m of firm (non-contingent) forward commitments for AI infrastructure sits entirely off the debt stack, up 166–236% in six months.
- The stress break point: none found inside the tested range (−30%/−40%/−60% EBITDA, combined working-capital shock, and a full 100% wipeout check) — this module's inputs for the master's downside scenario and risk register should reflect that the structure does not break at any level this test is capable of reaching from today's starting leverage and liquidity.
- Net cash on the broad basis, and very low leverage even on the strict basis, is a strategic asset here per CLAUDE.md §24 Filter 3 — it funds counter-cyclical optionality (no refinancing dependence, no covenant constraint on capital allocation) and should be read as a positive, not as "lazy" capital.
- No MODULE_RULES partial-data cap applied in this run; the 82/100 solvency-strength and 12/100 refinancing-risk scores reflect this synthesis's own judgment on the leverage trajectory and off-balance-sheet growth, not a mechanical cap.
- Biggest missing data point (single highest-value next request): a primary rating-agency report or rationale (S&P/Moody's/Fitch) confirming and dating the AA- rating directly — the only rating signal currently available is a Capital IQ Credit Health Panel secondary readout (tier 5), not a native agency document.
- **Explicit handoff:** the master synthesizer's "Balance Sheet and Survival Test" section should defer to this synthesis; the stress break points here are the inputs for the master's downside scenario and risk register — this module does not assign probabilities or a rating.

## 8. Simple Summary

- Debt: $83,664m gross, $68,202m net (net cash of $6,596m if marketable securities are also counted) — leverage of 0.61x net debt to EBITDA, up sharply from net cash two years ago.
- Maturity wall: nothing due in 12 months, 5% due in 24 months, fully covered by cash on hand alone — not a refinancing risk.
- Liquidity runway: no finite limit — $90,260m on hand plus a $37,872m annual free-cash-flow surplus.
- Covenants: none exist on the debt, so there is nothing to break — a favorable fact, not a data gap.
- Biggest off-balance-sheet exposure: $178,808m of quantified contingent exposure (litigation, tax dispute, JV guarantees) plus a much larger $696,300m of firm AI-infrastructure forward commitments, both growing fast.
- Survives a 30–60% profit (EBITDA) drop with no breach, no liquidity gap, and no need to raise equity, sell assets, or ask for a waiver — even a full one-year profit wipeout leaves a cash surplus.
- A current credit rating was available only as a secondary Capital IQ readout (S&P AA-), not a primary agency report — that is the single highest-value next data request.
- This module is highly useful to the master synthesizer: the data was sufficient across every section, no cap applied, and the survival read is clean and fully reproducible.



---

## balance-sheet-survival / 00_solvency-data-triage.md

_Source: `00_solvency-data-triage.md`_

# Solvency Data Triage — META

**Note on dates:** every file in `data/META/` carries the same filesystem "last modified" timestamp (2026-08-26), which is the Drive-sync date, not a real document date (CLAUDE.md §27/F23). The Last Modified column below is shown only as a pool-sync record; the authoritative date for every row is the reporting period parsed from inside the document.

## 1. File Inventory

| Filename | Type | Period Covered (from inside document) | Last Modified (pool sync, not authoritative) | Solvency Relevance |
|---|---|---|---|---|
| Meta_Platforms_Inc_-_Form_10-K(Jan-29-2026).doc | Annual filing (10-K) | FY2025, period end Dec 31, 2025; filed Jan 29, 2026 | 2026-08-26 | High |
| Meta_Platforms_Inc_-_Form_10-Q(Jul-30-2026).doc | Quarterly filing (10-Q) | Q2 FY2026, period end Jun 30, 2026; filed Jul 30, 2026 | 2026-08-26 | High |
| Meta_Platforms_Inc_-_Form_DEF_14A(Apr-16-2026).doc | Proxy (DEF 14A) | For 2026 Annual Meeting (May 27, 2026); filed Apr 16, 2026 | 2026-08-26 | Medium (governance/comp, not primary solvency) |
| Meta-03-31-2026-Exhibit-99-1_Q1_Press Release.pdf | Quarterly earnings press release | Q1 FY2026, period end Mar 31, 2026 | 2026-08-26 | High (cash, debt, capex, FCF headline figures) |
| Meta-06-30-2026-Exhibit-99-1_Q2_Press Release.pdf | Quarterly earnings press release | Q2 FY2026, period end Jun 30, 2026 | 2026-08-26 | High (cash, debt, capex, FCF headline figures) |
| Earnings-Presentation-Q1-2026.pdf | Investor deck | Q1 FY2026 | 2026-08-26 | Low–Medium |
| Earnings-Presentation-Q2-2026.pdf | Investor deck | Q2 FY2026 | 2026-08-26 | Low–Medium |
| Meta Platforms, Inc., Q4 2025 Earnings Call, Jan 28, 2026.rtf | Transcript | Q4 FY2025 call, Jan 28, 2026 | 2026-08-26 | Medium (management commentary on capex/debt) |
| Meta Platforms, Inc., Q1 2026 Earnings Call, Apr 29, 2026.rtf | Transcript | Q1 FY2026 call, Apr 29, 2026 | 2026-08-26 | Medium |
| Meta Platforms, Inc., Q2 2026 Earnings Call, Jul 29, 2026.rtf | Transcript | Q2 FY2026 call, Jul 29, 2026 | 2026-08-26 | Medium |
| Meta Platforms Inc NasdaqGS META Financials_Annual.xls — Key Stats | CIQ workbook tab | Annual series through FY2025 | 2026-08-26 | Medium |
| … — Income Statement | CIQ workbook tab | Annual series through FY2025 | 2026-08-26 | Medium |
| … — Balance Sheet | CIQ workbook tab | Annual series through FY2025 | 2026-08-26 | High (debt, cash lines) |
| … — Cash Flow | CIQ workbook tab | Annual series through FY2025 | 2026-08-26 | High (CFO, capex, FCF) |
| … — Multiples | CIQ workbook tab | Annual series | 2026-08-26 | Low |
| … — Historical Capitalization | CIQ workbook tab | Annual series | 2026-08-26 | High (capital structure history) |
| … — Capital Structure Summary | CIQ workbook tab | Annual series | 2026-08-26 | High |
| … — Capital Structure Details | CIQ workbook tab | Annual series | 2026-08-26 | High (debt by instrument) |
| … — Ratios | CIQ workbook tab | Annual series | 2026-08-26 | Medium |
| … — Supplemental | CIQ workbook tab | Annual series | 2026-08-26 | Low–Medium |
| … — Industry Specific | CIQ workbook tab | Annual series | 2026-08-26 | Low |
| … — Pension OPEB | CIQ workbook tab | Annual series (no material DB pension) | 2026-08-26 | Low (n/a — no material plan) |
| … — Segments | CIQ workbook tab | Annual series | 2026-08-26 | Low–Medium |
| Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — Key Stats | CIQ workbook tab | Quarterly series through Q2 FY2026 | 2026-08-26 | Medium |
| … — Income Statement | CIQ workbook tab | Quarterly series through Q2 FY2026 | 2026-08-26 | Medium |
| … — Balance Sheet | CIQ workbook tab | Quarterly series through Q2 FY2026 (cash & ST inv. $90.26bn latest) | 2026-08-26 | High |
| … — Cash Flow | CIQ workbook tab | Quarterly series through Q2 FY2026 | 2026-08-26 | High |
| … — Multiples | CIQ workbook tab | Quarterly series | 2026-08-26 | Low |
| … — Historical Capitalization | CIQ workbook tab | Quarterly series | 2026-08-26 | High |
| … — Capital Structure Summary | CIQ workbook tab | Quarterly series | 2026-08-26 | High |
| … — Capital Structure Details | CIQ workbook tab | Quarterly series | 2026-08-26 | High |
| … — Ratios | CIQ workbook tab | Quarterly series | 2026-08-26 | Medium |
| … — Supplemental | CIQ workbook tab | Quarterly series | 2026-08-26 | Low–Medium |
| … — Industry Specific | CIQ workbook tab | Quarterly series | 2026-08-26 | Low |
| … — Pension OPEB | CIQ workbook tab | Quarterly series (n/a) | 2026-08-26 | Low |
| … — Segments | CIQ workbook tab | Quarterly series | 2026-08-26 | Low–Medium |
| Meta Platforms Inc NasdaqGS META Credit Health Panel.xls — Summary | CIQ workbook tab | LTM ending 2026-06-30, financials updated 2026-07-31 | 2026-08-26 | High (S&P FC LT rating AA-, peer solvency/liquidity scores) |
| … — Financials | CIQ workbook tab | LTM through 2026-06-30 | 2026-08-26 | Medium |
| … — Operational Metrics Charts | CIQ workbook tab | Chart-only, no extractable numeric series | 2026-08-26 | Low |
| … — Solvency Metrics Charts | CIQ workbook tab | Chart-only, no extractable numeric series (chart titles: FFO Interest Coverage, EBITDA/Interest, FFO/Total Debt, Net Debt/EBITDA, Total Debt/Capital, Financial Debt/Total Liabilities, Total Debt/Revenue) | 2026-08-26 | Medium (labels only; underlying figures must be built from the Financials/Balance Sheet tabs and filings instead) |
| … — Liquidity Metrics Charts | CIQ workbook tab | Chart-only, no extractable numeric series | 2026-08-26 | Medium (same caveat) |
| … — Disclaimer | CIQ workbook tab | n/a | 2026-08-26 | None |
| Company Comparable Analysis Meta Platforms Inc .xls — Financial Data | CIQ workbook tab | Peer comp set | 2026-08-26 | Low |
| … — Trading Multiples | CIQ workbook tab | Peer comp set | 2026-08-26 | Low |
| … — Operating Statistics | CIQ workbook tab | Peer comp set | 2026-08-26 | Low |
| … — Business Description | CIQ workbook tab | n/a | 2026-08-26 | None |
| … — Implied Valuation | CIQ workbook tab | Peer comp set | 2026-08-26 | None (valuation, out of module scope) |
| … — Valuation Chart | CIQ workbook tab | n/a | 2026-08-26 | None |
| … — Credit Health Panel | CIQ workbook tab | Peer set, LTM 2026-06-30 | 2026-08-26 | Medium (duplicate of dedicated Credit Health Panel workbook, peer context) |
| … — Disclaimer | CIQ workbook tab | n/a | 2026-08-26 | None |
| MetaPlatforms,IncNasdaqGSMETAEstimatesReport.xls — Consensus | CIQ workbook tab | Forward consensus | 2026-08-26 | Low (earnings/valuation input, not solvency) |
| … — Recent Changes | CIQ workbook tab | Forward consensus | 2026-08-26 | Low |
| … — Guidance | CIQ workbook tab | Forward guidance | 2026-08-26 | Low–Medium (capex guidance $130–145bn FY26 relevant to future obligations) |
| … — Multiples | CIQ workbook tab | Forward | 2026-08-26 | Low |
| … — Surprise | CIQ workbook tab | Historical beats/misses | 2026-08-26 | Low |
| … — Trends | CIQ workbook tab | Historical | 2026-08-26 | Low |
| … — Revisions | CIQ workbook tab | Historical | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Key Developments.xls — Key Developments | CIQ workbook tab | Event log incl. individual debt-note issuances (e.g. "4.550% Notes due May 15, 2031", "6.300% Notes due May 15, 2056") | 2026-08-26 | Medium (debt-issuance event detail) |
| Meta Platforms Inc NasdaqGS META Events Calendar.xls — Events Calendar | CIQ workbook tab | Forward calendar | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Public Ownership History.xls — History | CIQ workbook tab | Historical ownership | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Public Ownership Insider Trading.xls — Insider Trading | CIQ workbook tab | Historical insider trades | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Public Ownership Summary.rtf | Document | Current ownership summary | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Public Company Profile.rtf | Document | Company profile | 2026-08-26 | Low |
| Meta Platforms Inc NasdaqGS META Customers.rtf | CIQ relationship export | Recently disclosed customer relationships | 2026-08-26 | Low (not solvency-relevant directly) |
| Meta Platforms Inc NasdaqGS META Suppliers.rtf | CIQ relationship export | Recently disclosed supplier relationships | 2026-08-26 | Low–Medium (informs the capex/vendor-financing story behind the AI infrastructure buildout, not a direct solvency input) |
| META_Short_Interest_12m_Charting Excel Export Aug-26-2026 7_48 AM.xls — Chart 1 with Data | CIQ workbook tab | 12-month short interest series to Aug 26, 2026 | 2026-08-26 | None (trading/positioning data) |
| … — Attributions | CIQ workbook tab | n/a | 2026-08-26 | None |

No `analyses/META_2026-08-27/_pool_extracts/ciq_facts.json` and no `analyses/META_2026-08-27/_pool_extracts/relationships.json` exist in this run's `_pool_extracts/` folder — neither sidecar is present, so this triage relies entirely on its own sourced reads of the pool documents and workbook tabs (including the Suppliers.rtf and Customers.rtf CIQ relationship exports read directly, not via a relationships.json sidecar). `manifest.md`/`manifest.json` in `_pool_extracts/` confirm 10 workbooks → 53 tabs, 67 total extract files, **0 failures** — every source in the pool extracted cleanly; there is no bad-extraction gap in this pool.

There is no `data/META/external/` folder — no externally sourced research (alt-data panels, expert calls, channel checks, paid-API pulls) is present in this pool. Section 1A is therefore omitted.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, vs 2026-08-27) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Meta_Platforms_Inc_-_Form_10-K(Jan-29-2026).doc | FY2025, period end Dec 31, 2025 | ~8 months |
| Quarterly filing | Meta_Platforms_Inc_-_Form_10-Q(Jul-30-2026).doc | Q2 FY2026, period end Jun 30, 2026 | ~2 months |
| Debt / capital-structure export | Meta Platforms Inc NasdaqGS META Financials_Quarterly.xls — Capital Structure Details / Summary | Through Q2 FY2026 | ~2 months |
| Fixed-income / maturities export | 10-Q Note 8 (Debt) future-principal-payments schedule; Key Developments (individual note series) | As of Jun 30, 2026 | ~2 months |
| Cash flow statement | 10-Q + Q2 FY2026 press release + Financials_Quarterly CIQ tab | Q2 FY2026 (CFO $31.86bn, FCF $784m TTM-quarter) | ~2 months |
| Covenant / credit-agreement disclosure | 10-K Note 10 / 10-Q Note 8 ("We are not subject to any financial covenants under the Notes.") | FY2025 / Q2 FY2026 | ~2 months |
| Credit rating report | Meta Platforms Inc NasdaqGS META Credit Health Panel.xls — Summary tab (S&P Foreign Currency LT: AA-) | LTM ending 2026-06-30, financials updated 2026-07-31 | ~1 month |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | 10-Q, period end Jun 30, 2026; Financials_Quarterly CIQ Balance Sheet tab | Debt, cash, equity base |
| Debt note (amounts by type) | Y | 10-K Note 10 / 10-Q Note 8 (fixed-rate senior unsecured Notes, $59.0bn FY25 → $84.0bn Q2'26 after $25bn May-2026 issuance, by series/maturity/rate) | The debt stack and seniority |
| Maturity schedule | Y | 10-K/10-Q future-principal-payments table by year (2027–2030 + "Thereafter") | The maturity wall and refinancing exposure |
| Cash flow statement | Y | 10-Q; Q2 FY2026 press release (CFO $31.86bn, capex $31.08bn incl. finance-lease principal, FCF $784m); Financials_Quarterly CIQ Cash Flow tab | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | N | No revolving credit facility, commercial paper program, or committed line disclosed anywhere in the 10-K or 10-Q (search for "revolving," "credit facility," "commercial paper," "line of credit" returned no matches) | True liquidity beyond cash — here, liquidity is cash + marketable securities only, no undrawn facility to add |
| Interest expense detail | Y | 10-K/10-Q: interest expense on the Notes, net of capitalized interest, $1.09bn (FY2025) disclosed by year; effective interest rates by series | Coverage ratios |
| Covenant disclosure | Y (states none exist) | 10-K/10-Q: "We are not subject to any financial covenants under the Notes." | Headroom to a breach — here, headroom is not a binding constraint because no maintenance covenants exist |
| Lease detail (operating/finance) | Y | 10-K Note on Leases: operating lease ROU assets/liabilities (current + non-current) and finance leases, with a maturity schedule of lease liabilities | Debt-like obligations |
| Pension / OPEB funded status | Y (n/a — none material) | 10-K search for "pension"/"defined benefit"/"OPEB" returns only unrelated litigation case names (Plumbers & Steamfitters Local 60 Pension Trust v. Meta); CIQ Pension-OPEB tab is empty/blank in both Financials_Annual and Financials_Quarterly workbooks | Off-balance-sheet obligation — confirmed not material for Meta |
| Commitments & contingencies note | Y | 10-K Note 11 (Commitments and Contingencies): $131.05bn non-cancelable contractual commitments, mostly cloud capacity/servers/data centers, scheduled by year; Legal Proceedings section (FTC antitrust, youth-related litigation, class actions) | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Y | Credit Health Panel Summary tab: S&P Foreign Currency LT rating "AA-" for META (vs. AA+ for Alphabet, peer set), LTM 2026-06-30, updated 2026-07-31 — a Capital IQ-sourced rating readout (tier 5), not a native S&P rating-action report | Refinancing access and cost |
| EBITDA base (for stress test) | Y | earnings/01_historical-financials.md: EBITDA (calc'd as Op. Income + D&A) FY2021–FY2025 = 54,720 / 42,241 / 57,929 / 84,820 / 101,892 ($m); TTM Q2FY26 EBITDA $112,056m | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | 10-K: operating company (Interactive Media & Services), single-entity issuer of the Notes — no bank/insurer regulatory capital regime, no disclosed HoldCo/OpCo debt structure | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | N | No revolver disclosed in the pool (see above) | Determines usable liquidity and springing covenants — not applicable here since no revolver exists |
| Covenant EBITDA definition (addbacks / caps) | N (n/a — no covenants) | 10-K/10-Q explicitly state no financial covenants under the Notes | Prevents "fake headroom" — not applicable; there is no covenant to define |
| HoldCo / OpCo structure disclosure | Y (n/a — single-entity issuer) | 10-K/10-Q: the Notes are issued directly by Meta Platforms, Inc., no disclosed HoldCo/OpCo subordination structure | Structural subordination and upstreaming — not applicable |
| Hedging / swaps disclosure | Y (states none material) | 10-K: short-term FX forward contracts for cash management only (not hedging-designated, none outstanding at FY25-end); Notes are 100% fixed-rate, "fluctuations in interest rates do not have any impact on our consolidated financial statements" | Floating-rate exposure net of hedges — confirmed no floating-rate debt exposure |
| Change-of-control / cross-default / rating triggers | N | No change-of-control put, cross-default, or rating-trigger pricing step disclosed in the Notes description in the 10-K/10-Q | Hidden accelerants to distress — state "Not disclosed in the data pool" per MODULE_RULES |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

All business-model (00–12, 99, dossier) and earnings (00–08, 99, dossier) module outputs exist and are populated for this run. `earnings/01_historical-financials.md` already computes a clean, filing-cross-checked EBITDA and net-debt series (net debt/EBITDA moved from net cash in FY2021–FY2024 to net debt of 0.22x in FY2025). `earnings/06_earnings-quality.md` confirms CFO/EBITDA cash conversion consistently >100% (105–123% across FY2021–2025), which cross-checks the EBITDA base this module will use for coverage and the stress test.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | 10-K cover page; Nasdaq Global Select Market listing |
| Exchange | Nasdaq (NasdaqGS: META) | 10-K, Credit Health Panel Summary tab |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | 10-K, 10-Q, DEF 14A all SEC forms |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | 10-K Notes to Consolidated Financial Statements (basis of presentation) |
| Reporting currency (USD / INR / …) | USD, reported in millions | 10-K/10-Q financial statements; CIQ workbooks ("In Millions of the reported currency") |
| Document language(s) | English (all documents in the pool are native English filings; no translation required) | 10-K, 10-Q, DEF 14A, transcripts, CIQ exports |

Standard US filing-regime sourcing applies throughout this module: 10-K/10-Q debt and contingency notes, DEF 14A for governance-adjacent items, no local-equivalent substitution needed.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N — a full future-principal-payments schedule by year is disclosed in both the 10-K and 10-Q | 02, 06 | Not applied |
| No covenant disclosure | N — disclosure exists and states affirmatively that no financial covenants apply to the Notes; this is a full disclosure of a "no covenants" state, not an absence of disclosure | 04, 06 | Not applied (headroom is trivially "no maintenance covenant to breach," not "not assessable") |
| No cash flow statement | N — full cash flow statement present in 10-Q, CIQ tabs, and press releases | 03, 04, 06 | Not applied |
| No undrawn-facility disclosure | Y — no revolving credit facility or commercial paper program is disclosed anywhere in the pool | 03 | Liquidity = cash + marketable securities only; state explicitly this is not "understated" liquidity in the usual sense (no known-but-undisclosed facility), but that a facility may exist and simply not be discussed in the 10-K/10-Q narrative — flag as "no committed facility identified in the pool," not "understated" |
| No interest-expense detail | N — interest expense on the Notes disclosed by year, with effective rates by series | 04 | Not applied |
| No EBITDA base | N — EBITDA is computable and cross-checked (earnings/01_historical-financials.md) | 06 | Not applied |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent balance sheet (Q2 FY2026 10-Q), a full debt note with amounts by series and a year-by-year maturity schedule (10-K/10-Q Note on Debt), and a complete cash flow statement (10-Q, press releases, CIQ tabs) are all present and mutually cross-checked, so leverage, the maturity wall, liquidity, coverage, and a downside stress test can all be built from primary filings.
- **Sections that can run:** capital structure, maturity wall, liquidity, coverage/covenants, contingencies, stress test — all six.
- **Active partial-data caps:** none from the standard MODULE_RULES.md list. One narrower note (not a MODULE_RULES cap): no committed revolving credit facility or borrowing-base line is disclosed anywhere in the pool, so headline liquidity for this module should be built as cash + marketable securities only, with an explicit statement that no committed-but-undrawn facility was identified in the data pool (as distinct from a facility that exists but whose availability is merely undisclosed).
- **Critical missing items:** none that block the module. Two items are genuinely undisclosed rather than missing-from-extraction: (1) change-of-control / cross-default / rating-trigger provisions on the Notes — state "Not disclosed in the data pool" per MODULE_RULES §"Structural Priority" hard rule; (2) a native rating-agency rationale/report (Moody's/S&P/Fitch primary document) is not in the pool — the only rating signal available is the Capital IQ Credit Health Panel's own readout of an S&P Foreign Currency LT rating (AA-), which should be cited as a Capital IQ export (tier 5), not as a Moody's/S&P/Fitch report.
- **Single highest-value missing document:** a primary rating-agency report or rationale (S&P/Moody's/Fitch) confirming and dating the AA- (or equivalent) rating directly, rather than relying on the Capital IQ Credit Health Panel's secondary readout of it.



---

## balance-sheet-survival / 01_capital-structure-and-leverage.md

_Source: `01_capital-structure-and-leverage.md`_

# Capital Structure & Leverage — META

Reporting currency: **USD, in millions** unless stated otherwise. Reporting standard: US GAAP. Fiscal year end: December 31. Balance-sheet dates used: latest interim = June 30, 2026 (Q2 FY2026 10-Q, filed Jul-30-2026); latest audited annual = December 31, 2025 (FY2025 10-K, filed Jan-29-2026).

## 1. Debt Stack

Meta Platforms, Inc. is a single-entity issuer — there is no HoldCo/OpCo structure and no subsidiary guarantor complexity disclosed. All debt is issued directly by the parent.

| Instrument | Amount | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Short-term debt / current portion | $0 | Meta Platforms, Inc. | N/A | N/A | N/A | N/A — future principal payments schedule shows $0 due "Remainder of 2026" | N/A | Q2 FY26 10-Q, Note 8 (Long-term Debt), p.19 |
| Bonds / notes (five series) | $84,000 face value ($83,664 carrying, net of $336m unamortized discount/issuance costs) | Meta Platforms, Inc. | No — unsecured | Senior unsecured; "each series of the Notes ranks equally with each other" | None (unsecured) | Staggered 2027–2066 by series (Aug-2022 Notes 2027–2062 $10,000; May-2023 Notes 2028–2063 $8,500; Aug-2024 Notes 2029–2064 $10,500; Nov-2025 Notes 2030–2065 $30,000; May-2026 Notes 2031–2066 $25,000) | Fixed — stated rates range 3.50%–6.45% across series/tranches (effective rates 3.63%–6.48%) | Q2 FY26 10-Q, Note 8 (Long-term Debt), p.19 |
| Term loans | Not disclosed — no term loan facility exists in the pool | — | — | — | — | — | — | 10-K/10-Q — no term-loan language found |
| Revolver (drawn) | $0 — no revolving credit facility, commercial paper program, or committed line of credit is disclosed anywhere in the 10-K or 10-Q | Meta Platforms, Inc. | N/A | N/A | N/A | N/A | N/A | 10-K/10-Q (search for "revolving," "credit facility," "commercial paper" returns no matches); confirmed in `00_solvency-data-triage.md` §3 |
| Finance / capital leases | $1,184 present value as of Dec 31, 2025 ($308 current + $876 non-current) — most recent year the amount is separately disclosed; not broken out as a distinct line on the Q2 FY26 condensed balance sheet (embedded within "Accrued expenses and other current liabilities" and "Other liabilities," per accounting-policy note) | Meta Platforms, Inc. | Asset-secured (leased network infrastructure) | Structurally senior to unsecured notes only to the extent of the leased asset; not otherwise ranked | Leased network infrastructure | Weighted-average remaining term 15.1 years (FY2025); weighted-average discount rate 4.1% (FY2025) | Fixed (imputed discount rate) | FY2025 10-K, Leases note (Note 6), pp. — lease-liability maturity schedule and PV table |
| **Total gross debt (funded debt only, matches Balance Sheet "Long-term debt" line)** | **$83,664** (carrying value, Jun 30, 2026); $58,744 (Dec 31, 2025) | — | — | — | — | — | — | Q2 FY26 10-Q, Consolidated Balance Sheets |

**Debt-scope note (US GAAP vs IFRS 16, per MODULE_RULES Calculation Standard #2):** Meta's own balance sheet and debt note treat only the fixed-rate senior unsecured Notes as "debt" (Long-term debt line = $83,664m). Operating lease liabilities ($28,654m at Jun 30, 2026 — see §2) are recognized under US GAAP (ASC 842) as a separate balance-sheet liability but are **not** included in the debt note or in "Long-term debt." If those operating lease liabilities were capitalized as debt (the IFRS 16-style view), total debt-like obligations would be **≈$113,502m** ($83,664 Notes + $28,654 operating leases + $1,184 finance leases). Capital IQ's own vendor "Total Debt" field for META is $112,318m [Capital IQ Financials_Annual export, LTM through 2026-06-30, cited in `business-model/11_capital-allocation-governance.md`] — this reconciles almost exactly to Notes ($83,664) + operating lease liabilities ($28,654) = $112,318, i.e. the CIQ figure appears to fold in operating leases but not finance leases. This module's canonical "gross debt" is the filing's own funded-debt figure ($83,664m); the lease-inclusive view is shown for completeness and must be labelled whenever cited (§15/§27 hygiene — never present the CIQ vendor aggregate under the filing's name).

Meta does not have preferred stock outstanding: its certificate of incorporation authorizes undesignated preferred stock, but no shares are issued and the stockholders' equity section of the balance sheet carries no preferred-stock line [Q2 FY26 10-Q, Risk Factors p.22; Consolidated Balance Sheets].

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Operating leases (US GAAP note) | $28,654 present value as of Jun 30, 2026 ($2,425 current + $26,229 non-current); $25,153 at Dec 31, 2025 ($2,213 current + $22,940 non-current). Weighted-average remaining term 12.3 years, weighted-average discount rate 4.3% (FY2025) | Recognized on-balance-sheet as a separate liability under US GAAP (ASC 842) — not classified as "debt" in the company's own debt note. Data centers, offices, and colocations. | Q2 FY26 10-Q, Consolidated Balance Sheets; FY2025 10-K, Leases note |
| Pension / OPEB underfunding | Not material — no defined-benefit pension or OPEB plan disclosed. A 10-K text search for "pension"/"defined benefit"/"OPEB" returns only an unrelated litigation case name (a shareholder-plaintiff pension trust); the Capital IQ Pension-OPEB tab is blank in both annual and quarterly workbooks. | N/A | FY2025 10-K (full-text search); Capital IQ Financials_Annual/Quarterly, Pension-OPEB tabs |
| Preferred equity | $0 outstanding (authorized but unissued) | N/A | Q2 FY26 10-Q, Risk Factors p.22; Consolidated Balance Sheets (no preferred-stock line) |
| Non-cancelable purchase commitments (not debt, flagged for context) | $349,310 as of Jun 30, 2026 (up from $131,050 at Dec 31, 2025 per prior-period disclosure), of which $53,520 due in 2026 and $81,650 due in 2027; plus a separate $14,720 contingent cloud-capacity obligation | Off-balance-sheet contractual commitment, mostly third-party cloud capacity and data-center/server/network infrastructure for the AI buildout — **not** funded debt and not included in gross debt above. Owned in full by `05_off-balance-sheet-and-contingencies`; shown here only so the reader is not misled that the debt stack in §1 is the company's full forward obligation. | Q2 FY26 10-Q, Note 9 (Commitments and Contingencies) |

## 3. Cash & Liquid Assets

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | $15,462 (Jun 30, 2026); $35,873 (Dec 31, 2025) | No | Q2 FY26 10-Q, Consolidated Balance Sheets |
| Liquid short-term investments (Marketable securities) | $74,798 (Jun 30, 2026); $45,719 (Dec 31, 2025) — government/agency securities, investment-grade corporate debt, money market funds, and marketable equity securities, classified Level 1/2 fair value | No | Q2 FY26 10-Q, Consolidated Balance Sheets; MD&A "Liquidity and Capital Resources," p.33 |
| Restricted / trapped cash (flag) | $13,550 restricted cash equivalents as of Jun 30, 2026, of which $10,800 is escrow-related money market funds tied to multi-year AI-infrastructure purchase agreements. **Restricted from general corporate use**; expected release 2028–2030 as the underlying purchase obligations are satisfied. Classified within "Other assets," **not** inside the $15,462 cash-and-equivalents line above (so no double-count risk, but this cash is not usable liquidity today). | Yes — explicitly restricted | Q2 FY26 10-Q, Note on Restricted Cash Equivalents (referencing Note 9, Commitments and Contingencies) |

## 4. Gross & Net Debt

All figures as of June 30, 2026 unless noted. Total cash + liquid investments = $15,462 + $74,798 = **$90,260**, consistent with the 10-Q's own MD&A statement that "Cash, cash equivalents, and marketable securities were $90.26 billion as of June 30, 2026."

| Metric | Value | Source |
|---|---:|---|
| Gross debt (funded debt only) | $83,664 | Q2 FY26 10-Q, Consolidated Balance Sheets / Note 8 |
| − Cash & equivalents | $15,462 | Q2 FY26 10-Q, Consolidated Balance Sheets |
| **Net debt (strict, §15)** | **$68,202** | Calculated: 83,664 − 15,462 |
| − Liquid short-term investments (marketable securities) | $74,798 | Q2 FY26 10-Q, Consolidated Balance Sheets |
| **Net debt (broad, incl. investments)** | **−$6,596 (net CASH of $6,596)** | Calculated: 83,664 − 90,260 |

**This is a material, sign-flipping divergence and must be carried with its basis label at every layer downstream.** On the strict §15 basis (cash & equivalents only), META shows net debt of $68.2bn. On the broad basis (also netting the $74.8bn of marketable securities, which Meta's own MD&A groups together with cash as its "principal sources of liquidity"), META is net CASH by $6.6bn. Per MODULE_RULES Calculation Standard #3, **strict is designated the module's canonical net-debt figure by default**, and no stated reason overrides that default here — so §7 below carries the strict figure as canonical, with the broad figure shown alongside, labelled, for downstream awareness. `02_maturity-wall-and-refinancing`, `03_liquidity-runway`, `04_coverage-and-covenants`, and `06_downside-stress-test` should each state explicitly which basis they use if they depart from strict.

## 5. Leverage Ratios

EBITDA basis used: **TTM reported/calculated EBITDA of $112,056m** (four quarters ended Jun-30-2026; = Operating Income + D&A, since Meta discloses no adjusted or GAAP EBITDA line item) [`earnings/01_historical-financials.md` §2, cross-checked against Q2 FY26 10-Q and Capital IQ quarterly export]. A comparable FY2025 annual reported-EBITDA figure ($101,892m) is shown alongside for the year-end point. Meta does not disclose an adjusted EBITDA, so the "On Adjusted EBITDA" column is not assessable and is marked n/a throughout — no separate GAAP-vs-adjusted reconciliation is needed because there is only one (reported/calculated) basis.

| Ratio | On Reported EBITDA (TTM $112,056m) | On Adjusted EBITDA | Source |
|---|---:|---:|---|
| Gross debt / EBITDA | 0.75x (83,664 / 112,056) | n/a — not disclosed | Calculated from §1 and §5 EBITDA base |
| Net debt / EBITDA (strict, canonical) | 0.61x (68,202 / 112,056) | n/a — not disclosed | Calculated from §4 strict net debt |
| Net debt / EBITDA (broad, for context) | −0.06x — net cash (−6,596 / 112,056) | n/a — not disclosed | Calculated from §4 broad net debt |
| Debt / capital | 24.3% (83,664 / [83,664 + 261,221 total stockholders' equity]) | n/a | Q2 FY26 10-Q, Consolidated Balance Sheets |
| Debt / equity | 32.0% (83,664 / 261,221) | n/a | Q2 FY26 10-Q, Consolidated Balance Sheets |

**Cycle-position note:** `business-model/10_external-dependency.md` does **not** classify META as a deep cyclical or commodity name — its External Dependency Risk Score is 55/100 ("partly externally driven," largest single lever is advertiser-budget sensitivity, not a classic commodity/industrial cycle). Per MODULE_RULES Calculation Standard #4, a normalised/mid-cycle EBITDA row is therefore not required and is not shown. That said, EBITDA margin has compressed in recent quarters (Q2 FY26 45.3%, −690bps YoY, per `earnings/01_historical-financials.md`) as AI-infrastructure depreciation ramps — this is a live margin trend for `06_downside-stress-test` to weigh, not a peak-vs-mid-cycle question.

## 6. Leverage Trend

| Metric | FY2023 | FY2024 | FY2025 | Latest (TTM period-end, Jun-30-2026) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, §15) | −$23,477 (net cash) | −$15,063 (net cash) | $22,871 | $68,202 | Rising sharply |
| Net debt / EBITDA | −0.41x | −0.18x | 0.22x | 0.61x | Rising sharply |

Source: `earnings/01_historical-financials.md` §1–§2 (net debt built as Long-term debt − cash & equivalents only, cross-checked against the FY2025 10-K balance sheet for FY2024–FY2025).

Leverage is **rising**, and the driver is unambiguous: five note issuances since Aug-2022 (cumulative $84,000m face value, most recently $30,000m in Nov-2025 and $25,000m in May-2026) have funded a capex buildout that has outrun free cash flow — capex grew from $37,256m (FY2024) to $69,691m (FY2025, +87%) and is running at $89,325m on a TTM basis (+71% YoY), while company-disclosed FCF fell from $52,103m (FY2024) to $43,585m (FY2025) and is down a further 20.4% YoY on a TTM basis to $37,872m [Q2 FY26 10-Q, Note 8; `earnings/01_historical-financials.md` §1–§2]. The flip from a multi-year net-cash position (net cash every year FY2021–FY2024) to net debt in FY2025 that has since more than doubled by mid-2026 has occurred alongside continued dividend payments ($2,699m in H1 FY2026) and no share repurchases in H1 FY2026 — i.e., the debt is funding the AI-infrastructure buildout, not distributions [`business-model/11_capital-allocation-governance.md`].

## 6A. HoldCo / OpCo & Structural Subordination

Not applicable — no material HoldCo-level debt indicated. Meta Platforms, Inc. is the single, direct issuer of all outstanding Notes; the 10-Q/10-K disclose no HoldCo/OpCo subordination structure, no subsidiary guarantors, and no upstreaming constraints [Q2 FY26 10-Q, Note 8 (Long-term Debt)].

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Gross debt (funded debt only, canonical):** $83,664m (carrying value; $84,000m face value), as of Jun 30, 2026. Excludes $28,654m of operating lease liabilities and $1,184m of finance lease liabilities (latest separately disclosed, Dec 31, 2025 basis) that are on-balance-sheet but not classified as "debt" under US GAAP; the lease-inclusive (IFRS 16-style) view is ≈$113,502m — label it explicitly if used. [Q2 FY26 10-Q, Consolidated Balance Sheets / Note 8]
- **Net debt — strict basis (§15), designated the module's canonical figure:** $68,202m (gross debt $83,664m − cash & equivalents $15,462m), as of Jun 30, 2026. [Q2 FY26 10-Q]
  - **Net debt — broad basis (also netting $74,798m marketable securities), shown for context, NOT canonical:** −$6,596m, i.e. **net CASH of $6,596m**. This is a materially different, sign-flipping read from the strict figure and must always carry its "broad" label if quoted downstream.
- **Cash & liquid investments:** $90,260m total ($15,462m cash & equivalents + $74,798m marketable securities), as of Jun 30, 2026. A further $13,550m of restricted cash equivalents exists (of which $10,800m is escrow tied to AI-infrastructure purchase commitments, released 2028–2030) but is excluded from this figure and from usable liquidity.
- **EBITDA base used:** $112,056m, TTM through Jun 30, 2026, **reported/calculated** (Operating Income + D&A — Meta discloses no adjusted or GAAP EBITDA line), **latest/current** basis. Not cycle-normalised: META is not classified as a deep cyclical/commodity name by `business-model/10_external-dependency.md` (score 55/100, "partly externally driven"), so no separate mid-cycle EBITDA figure applies. FY2025 annual reported EBITDA ($101,892m) is the comparable year-end anchor for §6's trend table.
- **Net debt / EBITDA, canonical (strict net debt ÷ reported TTM EBITDA):** 0.61x. On the FY2025 year-end point: 0.22x. On adjusted EBITDA: not assessable — not disclosed. On the broad (net-cash) basis: −0.06x (net cash).
- **Reporting currency:** USD, in millions.

**Estimation / basis flags for downstream propagation:** (1) The strict-vs-broad net debt divergence above ($68.2bn debt vs $6.6bn cash) is the single most consequential number in this report for `03_liquidity-runway` and `06_downside-stress-test` — carry both figures with their labels, do not silently pick one. (2) No adjusted EBITDA is disclosed by the company; every leverage/coverage ratio in this module rests on a calculated reported-EBITDA figure (Op. Income + D&A), not a company-defined non-GAAP measure — say so wherever the ratio is cited. (3) Finance lease liabilities are not separately disclosed on the Q2 FY26 interim balance sheet face; the $1,184m figure used above is the last full-year (Dec 31, 2025) disclosure and is flagged as dated. (4) META is net cash on a broad, investment-inclusive basis and has been net cash on the strict basis every year FY2021–FY2024; the FY2025–2026 net-debt build reflects a genuine capex-funded increase in leverage, not distress — this should be read alongside the rejection of the "optimal leverage" frame (CLAUDE.md §24, Filter 3): rising leverage funding a large capex programme is a capital-allocation and execution-risk question for other agents, not evidence in itself of fragility, given the coverage and liquidity levels shown here.



---

## balance-sheet-survival / 02_maturity-wall-and-refinancing.md

_Source: `02_maturity-wall-and-refinancing.md`_

# Maturity Wall & Refinancing — META

Reporting currency: **USD, in millions** unless stated otherwise. Reporting standard: US GAAP. Fiscal year end: December 31. Balance-sheet date used: June 30, 2026 (Q2 FY2026 10-Q, filed Jul-30-2026). Gross debt figure reused from `01_capital-structure-and-leverage.md`: **$83,664m carrying value / $84,000m face value** — the filing's own funded-debt figure (senior unsecured Notes only; operating leases of $28,654m and finance leases of $1,184m are on-balance-sheet but not classified as "debt" by the company and are excluded here, consistent with `01`'s canonical scope).

## 1. Maturity Schedule

Meta discloses future principal payments **by calendar year**, not by rolling 12-month window from the balance-sheet date — this is the finest granularity in the filing. The table below uses the filing's own buckets, mapped to the nearest year-number label.

| Period | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (Remainder of 2026, i.e. Jul–Dec 2026) | $0 | 0.0% | None maturing | Q2 FY26 10-Q, Note 8 (Long-term Debt), p.19 |
| Year 2 (2027) | $2,750 | 3.3% | Senior unsecured Notes — the 2027 tranche of the August-2022 series | Q2 FY26 10-Q, Note 8; tranche coupon (3.500%) and maturity date (Aug-15-2027) from Capital IQ Capital Structure Details, FY2025 (Dec-31-2025) basis — cross-checked and reconciles exactly to the 10-Q's series-level total |
| Year 3 (2028) | $1,500 | 1.8% | Senior unsecured Notes — the 2028 tranche of the May-2023 series | Q2 FY26 10-Q, Note 8; tranche detail (4.600% coupon, maturity May-15-2028) per Capital IQ Capital Structure Details, FY2025 basis |
| Year 4 (2029) | $1,000 | 1.2% | Senior unsecured Notes — a tranche within the August-2024 series (2029–2064 range); exact sub-tranche not separately itemized in the data pool | Q2 FY26 10-Q, Note 8 |
| Year 5 (2030) | $5,000 | 6.0% | Senior unsecured Notes — combines a $1,000m tranche of the May-2023 series (4.800% coupon, maturity May-15-2030, per Capital IQ) plus an estimated ~$4,000m from within the November-2025 series' 2030–2065 range, not separately itemized | Q2 FY26 10-Q, Note 8; partial tranche detail per Capital IQ Capital Structure Details, FY2025 basis |
| Thereafter (2031–2066) | $73,750 | 87.8% | Senior unsecured Notes — the balance of the August-2022, May-2023, August-2024, November-2025, and May-2026 series, laddered out to final maturities in 2062–2066 | Q2 FY26 10-Q, Note 8 |
| **Total (face value)** | **$84,000** | **100%** | | Q2 FY26 10-Q, Note 8 |
| Less: unamortized discount and issuance costs | ($336) | — | | Q2 FY26 10-Q, Note 8 |
| **Total (carrying value, reconciles to `01`'s canonical gross debt)** | **$83,664** | — | | Q2 FY26 10-Q, Consolidated Balance Sheets |

**Reconciliation check (self-check item):** the schedule sums to $84,000m face value, which ties to `01`'s stated $84,000m face / $83,664m carrying gross debt, with the $336m gap being unamortized discount and issuance costs (a standard non-cash reconciling item, not a missing obligation).

**Data-granularity limitation, flagged per MODULE_RULES Calculation Standard #9:** 87.8% of face debt ($73,750m) sits inside the undifferentiated "Thereafter" bucket, which spans 2031–2066 (35 years). Capital IQ's tranche-level detail (available only for the August-2022 and May-2023 series, $18,500m combined, itemized into 9 individual tranches with exact maturity dates: 2027-08-15 $2,750m/3.500%; 2028-05-15 $1,500m/4.600%; 2030-05-15 $1,000m/4.800%; 2032-08-15 $3,000m/3.850%; 2033-05-15 $1,750m/4.950%; 2052-08-15 $2,750m/4.450%; 2053-05-15 $2,500m/5.600%; 2062-08-15 $1,500m/4.650%; 2063-05-15 $1,750m/5.750%) itemizes $13,250m of the Thereafter bucket, with no single itemized year exceeding $3,000m. The remaining $60,500m (72% of total face debt — the balance of the August-2024 $10,500m, November-2025 $30,000m, and May-2026 $25,000m series) has **no disclosed year-by-year split** in either the 10-Q or the Capital IQ export. A single-year concentration inside "Thereafter" beyond what is itemized above cannot be ruled out from available data. [Capital IQ Capital Structure Details, FY2025 (Dec-31-2025) basis — company issued the May-2026 series after this CIQ snapshot, so that $25,000m series is not itemized at all.]

## 2. Maturity Profile Metrics

| Metric | Value |
|---|---:|
| Weighted-average maturity (years, from Jun-30-2026) | **~20.0 years** — Inference, not from filings. Computed using the 9 individually-dated tranches above (Aug-2022 + May-2023 series, $18,500m) plus the midpoint of the disclosed maturity range for the three un-itemized series (Aug-2024 $10,500m midpoint ≈2046.5; Nov-2025 $30,000m midpoint ≈2047.5; May-2026 $25,000m midpoint ≈2048.5), weighted by face value ($1,678,500m-years ÷ $84,000m = 19.98 years). The true figure could differ materially if the un-itemized 72% of debt is skewed toward either end of its disclosed range rather than centered. |
| % due within 12 months (through Jun-30-2027) | **0.0%** ($0). Confirmed directly by the 10-Q's "Remainder of 2026" line ($0) and corroborated by the tranche-level maturity date of the nearest bond (2027 tranche, Aug-15-2027 — 13.5 months out, per Capital IQ). |
| % due within 24 months (through Jun-30-2028) | **5.06%** ($4,250m = $2,750m 2027 tranche, Aug-15-2027, + $1,500m 2028 tranche, May-15-2028 — both confirmed inside the 24-month window by tranche-level dates). |
| % due within 36 months (through Jun-30-2029) | **5.06%–6.25%** ($4,250m–$5,250m). The 2029 bucket ($1,000m) is not dated to the month in the data pool, so whether it falls before or after Jun-30-2029 is unknown; range shown reflects that uncertainty. Conservative reading (all of it inside the window): 6.25%. |
| Largest single **disclosed** maturity year (and amount) | **2030 — $5,000m (6.0% of face debt).** This is the largest of the specifically-broken-out years (2027–2030); it is dwarfed by the un-itemized "Thereafter" bucket ($73,750m, 87.8%), inside which a larger single-year spike cannot be ruled out from available data (see §1 limitation above). |

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | **100%** | All outstanding Notes are fixed-rate; Meta has no revolving credit facility, commercial paper program, term loan, or other floating-rate funded debt disclosed [`01_capital-structure-and-leverage.md` §1]. Finance leases ($1,184m, FY2025 basis) also carry a fixed imputed discount rate (4.1%). |
| Floating-rate share | **0%** | Same as above — no floating-rate instruments exist in the debt stack. |
| Weighted-average coupon (stated rate) | **≈5.04%** — Inference, not from filings. Computed by weighting each series' disclosed stated-rate range midpoint (or, for the 9 itemized tranches, the exact stated coupon) by face value: (2,750×3.500 + 1,500×4.600 + 1,000×4.800 + 3,000×3.850 + 1,750×4.950 + 2,750×4.450 + 2,500×5.600 + 1,500×4.650 + 1,750×5.750 + 10,500×4.925[mid] + 30,000×4.975[mid] + 25,000×5.500[mid]) ÷ 84,000 = 5.039%. | Q2 FY26 10-Q, Note 8 (series-level stated-rate ranges); Capital IQ Capital Structure Details, FY2025 basis (tranche-level coupons for the two itemized series) |
| Weighted-average coupon (effective rate) | **≈5.09%** — Inference, not from filings, same method applied to the 10-Q's disclosed effective-rate ranges (which run 3.63%–4.71%, 4.68%–5.79%, 4.42%–5.60%, 4.27%–5.77%, 4.60%–6.48% by series) using series-level range midpoints (exact tranche-level effective rates not separately disclosed). | Q2 FY26 10-Q, Note 8 |
| Current market refi rate (proxy, not tenor-matched) | **≈5.25%** (ICE BofA AA US Corporate Index effective yield, 2026-08-20) | Web: FRED series BAMLC0A2CAAEY, 2026-08-20 (indicative, unverified). This is a blended index across the AA curve, not matched to META's own ~20-year weighted-average tenor — flagged as a limitation; a purely long-dated (20–30yr) AA new-issue rate would likely run somewhat above this blended figure given the current upward-sloping yield curve (10-year UST ≈4.65%, Web: Trading Economics / FRED DGS10, 2026-08-26). |
| Estimated refi cost step-up (bps) | **≈+21bps** on the stated-coupon basis (5.25% market − 5.04% own coupon); **≈+16bps** on the effective-rate basis (5.25% − 5.09%). Both modest. Cross-checked against the filing's own market signal: the 10-Q discloses the Notes' total estimated fair value at $79.75bn versus $84.0bn face (a Level-2, market-quote-based estimate) as of Jun-30-2026 [Q2 FY26 10-Q, Note 8] — a ~5% discount to par consistent with market yields having risen somewhat above the (largely lower-coupon, earlier-vintage) tranches' stated rates, in the same direction as the step-up estimated above. |

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

| Source of repayment for next-24m maturities ($4,250m through Jun-2028) | Amount | Evidence |
|---|---:|---|
| Cash on hand | $15,462m (Jun-30-2026) — 3.6x the entire next-24-month maturity total, and 1.5x the entire cumulative debt due through 2030 ($10,250m) | Q2 FY26 10-Q, Consolidated Balance Sheets |
| Forecast FCF (recent run-rate, labeled) | TTM company-disclosed FCF = $37,872m, down 20.4% YoY (FY2025 $43,585m; FY2024 $52,103m) — no forward FCF guidance disclosed in the pool, so this is a trailing run-rate, not a forecast | `01_capital-structure-and-leverage.md` §6, sourced from `earnings/01_historical-financials.md` §1–2 |
| Revolver availability | Not applicable — Meta has no revolving credit facility, commercial paper program, or committed line of credit disclosed anywhere in the 10-K or 10-Q | `01_capital-structure-and-leverage.md` §1 |
| Asset-sale proceeds | Unknown — no asset-sale programme announced or authorized against these maturities in the data pool | Not disclosed |
| New debt issuance | Unknown/not committed for future maturities specifically — but the company has demonstrated repeated, ready capital-markets access: five senior unsecured issuances since Aug-2022 totaling $84,000m face value, most recently $25,000m in May-2026 (used to fund the AI-infrastructure capex programme, not to refinance existing debt, since nothing has matured yet) | Q2 FY26 10-Q, Note 8; `01_capital-structure-and-leverage.md` §6 |

Meta's near-term wall is trivially covered by cash alone: $0 is due in the next 12 months, and the entire $4,250m due within 24 months is 3.6x smaller than cash on hand ($15,462m) even before counting the further $74,798m of marketable securities or any of the $37,872m TTM FCF. No financial covenants exist under the Notes ("We are not subject to any financial covenants under the Notes" [Q2 FY26 10-Q, Note 8]), so there is no covenant-triggered acceleration risk tied to leverage or coverage weakening ahead of a maturity. Meta's TTM EBITDA/interest coverage of 55.2x [`04_coverage-and-covenants.md` §1] and an S&P long-term foreign-currency rating of AA- [Capital IQ Credit Health Panel, "Financials Updated" 2026-07-31] both point to strong, proven market access — evidenced directly by five successful bond issuances since Aug-2022, the latest as recently as May-2026. There is 0% floating-rate exposure, so a rate shock (e.g. +200bps) would not reprice any of Meta's existing interest cost — only the coupon on future new issuance would be affected. Conclusion: **self-funded / low refi risk.**

## 5. Refinancing Read

The wall is not a near-term problem: $0 is contractually due in the next 12 months, only 3.3% of face debt ($2,750m) is due in the next ~13.5 months to 24 months (2027), and the weighted-average maturity runs roughly 20 years (Inference) with 87.8% of face debt sitting past 2030. The estimated refinancing cost step-up is modest — roughly +16 to +21bps versus Meta's own ~5.04–5.09% weighted-average coupon, using a web-sourced AA corporate benchmark (≈5.25%, 2026-08-20, indicative) that is not perfectly tenor-matched to Meta's long-dated maturity profile. The single biggest refinancing risk is not the schedule itself but its opacity: 87.8% of face debt ($73,750m) sits in an undifferentiated "Thereafter" bucket with no disclosed year-by-year split, so a genuine single-year concentration decades out cannot be ruled out from available data — though given Meta's currently minimal leverage (net debt/EBITDA 0.61x strict basis, per `01`) and demonstrated market access, even a large single-year spike would likely be manageable when it eventually becomes near-dated. **Meta survives the next 12 months under a "market closure" assumption (no new unsecured issuance) with no adjustment required at all**: there is no contractual maturity in that window, and cash on hand ($15,462m) alone — before any FCF, marketable securities, or new issuance — covers the entire debt stack due through 2030 ($10,250m) 1.5x over.

---

Out-of-scope request received: none. This report stays within maturity-wall and refinancing-exposure scope; liquidity runway, coverage/covenant headroom, and the downside stress test are owned by `03`, `04`, and `06` respectively.



---

## balance-sheet-survival / 03_liquidity-runway.md

_Source: `03_liquidity-runway.md`_

# Liquidity Runway — META

Reporting currency: **USD, in millions** unless stated otherwise. Reporting standard: US GAAP. Balance-sheet date used: June 30, 2026 (Q2 FY2026 10-Q, filed Jul-30-2026), consistent with `01_capital-structure-and-leverage.md` and `02_maturity-wall-and-refinancing.md`. TTM = four quarters ended Jun-30-2026 (Q3 FY25–Q2 FY26), consistent with `04_coverage-and-covenants.md`.

## 1. Liquidity Sources (committed only)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | $15,462 | Y | Unrestricted | Q2 FY26 10-Q, Consolidated Balance Sheets [`01_capital-structure-and-leverage.md` §3] |
| Liquid short-term investments (marketable securities) | $74,798 | Y | Unrestricted; government/agency securities, investment-grade corporate debt, money market funds, marketable equity securities (Level 1/2 fair value); Meta's own MD&A groups this with cash as "principal sources of liquidity" | Q2 FY26 10-Q, Consolidated Balance Sheets; MD&A "Liquidity and Capital Resources," p.33 [`01` §3] |
| Revolver / facilities (commitment) | **None exist** | N — no facility at all | Meta discloses **no** revolving credit facility, commercial paper program, or committed line of credit anywhere in the 10-K or 10-Q — confirmed by direct text search. This is a genuine absence, not an undisclosed-availability gap, so the "availability unknown" partial-data cap does not apply; liquidity is not understated by excluding a facility that does not exist. | `01_capital-structure-and-leverage.md` §1; `04_coverage-and-covenants.md` §2 |
| Revolver availability (if disclosed) | N/A | N/A | N/A — no revolver exists | Same |
| Restricted cash (excluded, flagged) | $13,550 | N — excluded from usable liquidity | Of which $10,800 is escrow-related money market funds tied to multi-year AI-infrastructure purchase agreements; expected release 2028–2030. Classified in "Other assets," not inside the cash line above (no double-count risk), but genuinely unavailable for general corporate use today. | Q2 FY26 10-Q, Note on Restricted Cash Equivalents (referencing Note 9) [`01` §3] |
| **Total usable liquidity** | **$90,260** | | = $15,462 cash + $74,798 marketable securities. Reconciles to the 10-Q's own MD&A statement that "Cash, cash equivalents, and marketable securities were $90.26 billion as of June 30, 2026." | Q2 FY26 10-Q, MD&A [`01` §4] |

No uncommitted lines exist to list separately — META carries no bank lines of any kind (committed or uncommitted). Reporting currency: USD, millions.

## 2. Near-Term Uses (next 12 months)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from 02) | $0 | `02_maturity-wall-and-refinancing.md` §2 — "% due within 12 months (through Jun-30-2027): 0.0% ($0)," confirmed by the 10-Q's "Remainder of 2026" line and the nearest bond tranche maturing Aug-15-2027 (13.5 months out) |
| Cash interest | $2,029 (TTM P&L "interest expense, net of capitalized interest") — flagged: the CF-statement supplemental disclosure of cash interest actually **paid** (net of capitalized) was lower, $696m for full-year FY2025, vs. the $1,165m FY2025 P&L interest-expense line; the gap reflects accrual/discount-accretion timing, not a data error. This report uses the higher, more conservative P&L figure per MODULE_RULES §7 ("assume the more fragile reading"). | `04_coverage-and-covenants.md` §1 (TTM P&L interest expense); `earnings/06_earnings-quality.md` §1 (FY2025 cash interest paid, $696m) |
| Maintenance capex | **Not disclosed separately** — Meta does not break out maintenance vs. growth capex in any filing in the data pool; TTM total capex (PP&E purchases) = $89,325m, +71.2% YoY, overwhelmingly growth-driven (AI-infrastructure buildout). Not used in the headline runway math below (see §3 — the net-of-FCF basis already nets ALL capex inside FCF, so a separate maintenance-capex line is not needed and double-counting must be avoided). | `earnings/01_historical-financials.md` §2; `earnings/06_earnings-quality.md` §1 |
| Committed dividends / buybacks | **$5,398** (annualized) — H1 FY2026 actual cash dividend and dividend-equivalent payments were $2,699m; annualized ×2 to a forward 12-month figure since no dividend-rate change is disclosed in the data pool. **Inference, not from filings** for the annualization step (the H1 figure itself is a filed number). No share buybacks occurred in H1 FY2026 (0 shares repurchased) — repurchases are discretionary, not contractually committed, so $0 is used for the buyback component. | `business-model/11_capital-allocation-governance.md` (H1 2026 dividend row, sourced to Q2 2026 Form 10-Q, Condensed Statements of Cash Flows) |
| **Total near-term uses (gross-obligations tally, for context only)** | **≈$96,752** ($0 maturities + $2,029 interest + $89,325 total capex + $5,398 dividends) | This total mixes items already inside FCF (interest, all capex) with items that are not (maturities, dividends) — it is shown for readability only and is **not** the basis used for the runway calculation in §3, which follows the net-of-FCF method (MODULE_RULES §8) to avoid double-counting cash interest and capex that FCF already nets out. |

## 3. Runway

| Metric | Value |
|---|---:|
| Total committed liquidity | $90,260m (cash $15,462m + marketable securities $74,798m; §1) |
| Annual FCF (company-defined: CFO − PP&E capex − finance-lease principal, TTM) | $37,872m — down 20.4% YoY (FY2025 $43,585m; FY2024 $52,103m) but decisively positive and meaningful | `earnings/01_historical-financials.md` §2 |
| Basis used (net-of-FCF / gross-obligations) | **Net-of-FCF** — TTM FCF is large and positive, so the gross-obligations (FCF-negative) basis does not apply per MODULE_RULES §8 |
| Annual net cash burn (on the stated basis) | **−$32,474m (a surplus, not a burn)** = (12-month debt maturities $0 + committed dividends $5,398m) − FCF $37,872m = $5,398m − $37,872m = −$32,474m. Cash interest and capex are **not** re-added — FCF already carries both (MODULE_RULES §8). |
| Monthly net cash burn (annual burn ÷ 12) | Negative — a monthly surplus of ≈$2,706m ($32,474m ÷ 12) |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **No finite runway applies — FCF alone more than covers all identified 12-month obligations, with an annual surplus of ≈$32,474m even before touching the $90,260m of on-hand liquidity.** |

**Formula and basis, shown explicitly.** Net-of-FCF basis: annual net burn = (12-month debt maturities + committed dividends/buybacks) − FCF = ($0 + $5,398m) − $37,872m = −$32,474m. Because FCF exceeds the 12-month non-FCF obligations by roughly 7x, the company does not draw down liquidity at all on this basis over the next 12 months — it accumulates cash. Stating this as a surplus (per MODULE_RULES §8, "if FCF covers obligations, state the annual surplus instead of a finite runway") rather than forcing a months figure avoids a meaningless division by a negative number.

**Cross-check — liquidity alone, with zero credit given to FCF.** Even if TTM FCF were entirely disregarded (e.g., a severe, unmodeled shock stopped all operating cash generation), the $90,260m of on-hand liquidity divided by the $5,398m of non-FCF obligations (debt maturities + dividends) over 12 months implies coverage of roughly **200 months (≈16.7 years)** at the current 12-month obligation run-rate ($90,260m ÷ ($5,398m ÷ 12) = $90,260m ÷ $449.8m/month ≈ 200.7 months). This is a stress cross-check, not the headline runway (§3's net-of-FCF read is the primary figure), but it shows the in-hand cushion is not fragile to a temporary FCF interruption over any horizon this module tests.

### Seasonality / Peak Liquidity Need (Hard Check)

META's working capital is **not materially seasonal in a way that stresses liquidity**. There is no separate inventory line (advertising is billed and largely collected within the same period; content/hardware costs are expensed, not held as inventory) [`earnings/06_earnings-quality.md` §3]. The disclosed year-over-year working-capital change in the CFO bridge has swung between a $5,683m cash source (FY2022) and an $885m cash use (FY2025) [`earnings/06_earnings-quality.md` §1] — swings under $6bn against $90,260m of liquidity and $37,872m of TTM FCF. Revenue itself is seasonal (Q4 consistently ~29.6% of annual revenue on holiday ad demand, Q1 the trough at ~21.5% [`earnings/01_historical-financials.md` §5]), but this is a revenue-timing pattern, not a disclosed cash-outflow peak, and Meta does not separately disclose a peak intra-year working-capital build or trough liquidity point. **Peak working-capital need not disclosed — runway may be overstated on that specific dimension** — though the modest scale of the historical working-capital swings relative to total liquidity ($90,260m) makes a seasonality-driven liquidity shortfall an unlikely near-term risk on the evidence available.

## 4. Sources & Uses Bridge

Internal sources cover the next 12 months many times over without any external access being required: TTM free cash flow ($37,872m) alone exceeds the entire 12-month non-FCF obligation load ($5,398m of dividends, $0 of debt maturities) by roughly 7x, and that comparison does not even draw on the $90,260m of cash and marketable securities already on the balance sheet. Of the runway, effectively none is dependent on FCF "holding up" in a fragile sense — the $90,260m already-in-hand liquidity alone would cover the identified 12-month obligations for roughly 200 months (§3 cross-check) even with zero FCF, so FCF is a large, welcome cushion on top of an already-ample in-hand liquidity position, not a load-bearing assumption the runway depends on. The one caveat worth naming: Meta's own disclosed non-cancelable AI-infrastructure purchase commitments ($349,310m total, of which $53,520m is due in calendar 2026 and $81,650m in 2027 — `01_capital-structure-and-leverage.md` §2, owned in full by `05_off-balance-sheet-and-contingencies`) are being satisfied through the same capex line that is already compressing FCF (TTM capex $89,325m, +71.2% YoY); if that spend continues to accelerate at the disclosed pace, FCF could fall further or turn negative in future periods, which would then make the in-hand $90,260m liquidity the primary buffer rather than a backstop.

## 5. Liquidity Read

There is no finite liquidity runway to state for META over the next 12 months — free cash flow alone (TTM $37,872m) covers the identified 12-month obligations (zero debt maturities, ~$5,398m of annualized dividends) with an annual surplus of roughly $32,474m, and that is before touching $90,260m of unrestricted cash and marketable securities, which on its own would cover the same 12-month obligations for approximately 200 months. The runway depends almost entirely on already-in-hand liquidity, not on FCF materializing — FCF is currently a large surplus generator, not a load-bearing assumption. The single biggest liquidity risk is not the next 12 months but the trajectory: TTM capex is up 71.2% YoY and TTM FCF is down 20.4% YoY over the same window [`earnings/01_historical-financials.md` §2], and Meta has $349,310m of non-cancelable AI-infrastructure purchase commitments outstanding ($53,520m due in 2026, $81,650m in 2027, per `01_capital-structure-and-leverage.md` §2) funding that same buildout — if capex continues to escalate at the disclosed pace, the FCF cushion measured here could shrink materially or reverse in future periods, at which point the currently ample $90,260m of on-hand liquidity would need to absorb a larger share of the load.

---

Out-of-scope request received: none. This report stays within liquidity-runway scope; the debt stack, maturity wall, covenant headroom, and the downside stress test are owned by `01`, `02`, `04`, and `06` respectively.



---

## balance-sheet-survival / 04_coverage-and-covenants.md

_Source: `04_coverage-and-covenants.md`_

# Coverage & Covenants — META

Reporting currency: USD, in millions unless stated otherwise. Reporting standard: US GAAP. Fiscal year end: December 31. TTM = four quarters ended Jun-30-2026 (Q3 FY25–Q2 FY26), matching `01_capital-structure-and-leverage.md`'s canonical basis. All ratio arithmetic below was executed with Python (shown inline), not done by hand.

## 1. Coverage Ratios

**EBITDA basis:** reported/calculated — Operating Income + D&A (Meta discloses no adjusted or GAAP EBITDA line item) [`01_capital-structure-and-leverage.md` §5; `earnings/01_historical-financials.md` §1–2]. TTM EBITDA = $112,056m; TTM EBIT (Operating Income) = $89,327m; TTM capex (PP&E purchases) = $89,325m [`earnings/01_historical-financials.md` §2].

**Interest basis:** the company's consolidated income statement "Interest expense" line — GROSS in the sense this module cares about (it is **not** netted against Interest income, which sits on a separate line: $2,123m FY2025, $859m Q2'26 alone). It **is** stated by Meta as "net of capitalized interest" — i.e., interest capitalized onto data-center construction-in-progress is excluded from the expensed figure, so the true gross interest cost incurred (before capitalization) is somewhat higher than the P&L line used here; the capitalized amount is not separately quantified in the data pool, so this is flagged, not corrected for [Q2 FY26 10-Q, Note 8 (Long-term Debt), p.19: "We are not subject to any financial covenants under the Notes. Interest expense, net of capitalized interest, recognized on the Notes was $754 million and $1.29 billion for the three and six months ended June 30, 2026..."; FY2025 10-K, Item 7 MD&A, "Interest and other income (expense), net" table].

TTM interest expense is built from the disclosed quarterly/annual income-statement "Interest expense" line (total interest expense, including the small finance-lease component, not just the Notes): FY2025 annual $1,165m − H1 FY2025 $481m + H1 FY2026 $1,345m = **$2,029m** [FY2025 10-K, Item 7 MD&A "Interest and other income (expense), net" table, p.75 (FY2025 $1,165m / FY2024 $715m / FY2023 $446m); Q2 FY26 10-Q, MD&A "Interest and other income (expense), net" table (H1 FY26 $1,345m / H1 FY25 $481m; Q2 FY26 alone $783m / Q2 FY25 alone $241m)].

```
ebitda_ttm = 112056; ebit_ttm = 89327; capex_ttm = 89325
interest_ttm = 1165 - 481 + 1345               # = 2029
EBITDA/interest        = 112056/2029  = 55.23x
EBIT/interest           = 89327/2029  = 44.03x
(EBITDA-capex)/interest = 22731/2029  = 11.20x
lease_fy25 = 2798  # operating lease cost, FY2025 annual (proxy — no TTM lease-cost figure disclosed)
FCC = (EBITDA-capex)/(interest_ttm + 0 scheduled amort. + lease_fy25) = 22731/4827 = 4.71x
```

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest | **55.2x** (TTM) | Calculated: $112,056m / $2,029m |
| EBIT / interest | **44.0x** (TTM) | Calculated: $89,327m / $2,029m |
| (EBITDA − capex) / interest | **11.2x** (TTM) | Calculated: ($112,056m − $89,325m) / $2,029m |
| Fixed-charge coverage | **4.7x** (TTM interest; FY2025-annual lease cost as proxy — flagged, see below) | Calculated: ($112,056m − $89,325m) / ($2,029m + $0 scheduled near-term debt amortization + $2,798m FY2025 operating lease cost) |

**Fixed-charge coverage caveat:** scheduled debt amortization is $0 for the "remainder of 2026" (Meta's bonds carry no near-term maturities — see `01_capital-structure-and-leverage.md` §1) and the next maturity is $2,750m due sometime in calendar 2027, so the true next-12-month figure could be modestly higher than $0 depending on exact 2027 timing (owned in detail by `02_maturity-wall-and-refinancing`). Lease-payment cash cost uses FY2025's annual operating lease cost ($2,798m) as the best available proxy — a TTM-exact lease-cash figure is not separately disclosed in the pool, so this ratio mixes a TTM numerator with an FY2025 lease-cost denominator component; labelled here per §15 hygiene rather than presented as a clean matched-basis ratio.

**Is EBITDA cash-backed?** Yes, and materially more than backed. `earnings/06_earnings-quality.md` §2 shows CFO/EBITDA running 105%–124% every year FY2021–FY2025 (113.6% in FY2025) — cash generated exceeds booked EBITDA every year, the opposite of an "addback illusion" concern. `earnings/06` also flags (§8, severity 60/100) that a January-2025 useful-life extension on servers/network assets cut FY2025 depreciation by $2.92bn, boosting EBIT (not EBITDA — the depreciation change nets out of the EBITDA calculation, since EBITDA adds D&A back) by roughly that amount; this affects the EBIT/interest ratio's comparability to prior years but not the EBITDA/interest ratio.

**Trend — coverage is compressing fast even though the level remains very high.** EBITDA/interest fell from 129.9x (FY2023: $57,929m/$446m) to 118.6x (FY2024: $84,820m/$715m) to 87.5x (FY2025: $101,892m/$1,165m) to 55.2x (TTM). Interest expense has nearly quintupled in under three years (FY2023 $446m → TTM $2,029m) as Meta issued five bond series since Aug-2022 ($84,000m face value cumulative, most recently $30,000m Nov-2025 and $25,000m May-2026) [`01_capital-structure-and-leverage.md` §1, §6], while EBITDA over the same window grew far more slowly (FY2023→TTM: +93%). Only a partial run-rate of the May-2026 $25,000m issuance sits inside the TTM window (roughly two months), so the next 1–2 quarters of reported interest expense are very likely to step up further from the $783m already recognized in the single quarter Q2'26 — an annualized run-rate of that single quarter alone (~$3,132m) would already push EBITDA/interest down to roughly 35.8x on trailing EBITDA, still very strong but a further real compression to flag forward, not a projection this agent is making a forecast call on.

## 2. Covenant Inventory

**No maintenance financial covenants exist — this is an explicit, affirmative disclosure, not a data gap.** Meta's debt note states directly: "We are not subject to any financial covenants under the Notes" [Q2 FY26 10-Q, Note 8 (Long-term Debt), p.19; FY2025 10-K, Note 10 (Long-term Debt), same language]. This is typical of large-cap, investment-grade senior unsecured bond issuance (a "covenant-lite" structure by market convention for issuers at this rating tier), distinct from a leveraged-loan or high-yield credit agreement that would carry maintenance leverage/coverage tests. Meta also has no revolving credit facility, commercial paper program, or committed line of credit disclosed anywhere in the 10-K or 10-Q [`01_capital-structure-and-leverage.md` §1] — so there is no borrowing-base or utilization-triggered springing covenant either, because there is no revolver to spring from.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage | **None — no financial covenants under the Notes** | Net debt/EBITDA (strict, TTM) = 0.61x | N/A — no threshold exists to measure against | Q2 FY26 10-Q, Note 8 (Long-term Debt), p.19 |
| Min interest coverage | **None disclosed** | EBITDA/interest (TTM) = 55.2x | N/A | Same |
| Min liquidity / net worth | **None disclosed** | Cash + marketable securities = $90,260m [`01_capital-structure-and-leverage.md` §3] | N/A | Same |
| Springing covenant trigger (e.g., revolver utilization threshold) | **N/A — no revolver or credit facility exists** | N/A | N/A | `01_capital-structure-and-leverage.md` §1: "no revolving credit facility, commercial paper program, or committed line of credit is disclosed anywhere in the 10-K or 10-Q" |
| Equity cure rights (Y/N, limits) | **N — no covenant package to cure** | N/A | N/A | Same |
| Cross-default / change-of-control put / rating-linked pricing step | **Not disclosed in the data pool** | N/A | N/A | `00_solvency-data-triage.md` §"Structural Priority" line item; the only "change of control" language found in the 10-K/10-Q is a general anti-takeover risk-factor discussion (staggered board, dual-class structure), unrelated to the Notes' terms — confirmed by direct text search, not a bond covenant or put right |

**Illustrative benchmark (labeled assumption, per the partial-data rule — shown for context only, not a real covenant).** Because the effect on the reader is the same as "no covenant to test" whether the cause is non-disclosure or a genuine absence of covenants, a typical market maintenance-covenant package for a comparable (though far more leveraged) corporate credit is shown alongside for scale, explicitly labeled as **Inference, not from filings** and **not applicable to META's actual capital structure**:

| Illustrative typical covenant (labeled assumption) | Typical threshold | META's actual metric | Illustrative headroom (not a real covenant test) |
|---|---:|---:|---:|
| Max net leverage (typical leveraged-loan/HY package) | 4.0x–4.5x | 0.61x net debt/EBITDA (strict, TTM) | +85% to +86% vs. the illustrative ceiling (calc: (4.25−0.61)/4.25 ≈ 86%) — but this is not a threshold META is actually bound by |
| Min interest coverage (typical) | 2.0x–3.0x | 55.2x EBITDA/interest (TTM) | +1,760% to +2,660% vs. the illustrative floor — again, illustrative only |

### Covenant EBITDA Definition & Quality (required if headroom is computed)

Not applicable — no covenant, so no covenant-specific EBITDA definition or addback regime exists to evaluate.

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | N/A — no financial covenants exist under the Notes | Q2 FY26 10-Q, Note 8 |
| Addbacks permitted (types) | N/A | — |
| Addback caps / limits | N/A | — |
| Is covenant EBITDA materially above reported EBITDA? | N/A — there is no separate "covenant EBITDA" concept for META; the only EBITDA figure in use anywhere in this module is the reported/calculated $112,056m TTM figure, which per `earnings/06_earnings-quality.md` §2 is itself materially *below*, not above, cash-generated CFO (113.6% CFO/EBITDA in FY2025) | `01_capital-structure-and-leverage.md` §5; `earnings/06_earnings-quality.md` §2 |

**Headroom quality:** not applicable — there is no "addback illusion" risk here because there is no covenant, and separately no adjusted-EBITDA addback bucket of any kind exists in Meta's non-GAAP disclosure (`earnings/06_earnings-quality.md` §4: "Meta does not disclose an adjusted EBITDA, adjusted EBIT, or adjusted net income measure of any kind").

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | **None exists** — Meta's public bonds carry no maintenance financial covenants and there is no revolver/credit facility to spring a covenant from [Q2 FY26 10-Q, Note 8] |
| Headroom on tightest covenant (%) | **Not assessable** — no covenant threshold exists to measure a headroom against (this is the correct classification per the partial-data rule, even though the underlying reason — an explicit "no covenants" disclosure — is a more favorable fact pattern than a genuine non-disclosure) |
| EBITDA decline that would breach it (approx.) | N/A — no covenant to breach. Illustrative only (not a covenant test): EBITDA would need to fall ~94.6% from the TTM level before EBITDA/interest coverage alone would fall to a typical leveraged-credit floor of 3.0x (calc: 1 − (3.0 × $2,029m)/$112,056m = 94.6%) — an extreme, illustrative bound, not a real threshold this credit is subject to |
| Debt increase that would breach it (approx.) | N/A — no covenant to breach. Illustrative only: even a doubling of gross debt to ~$167bn at a broadly similar average coupon would raise TTM interest expense to roughly $4.0bn (calc: $2,029m × (167,328/83,664) ≈ $4,058m), still leaving EBITDA/interest near 27.6x — coverage headroom against any plausible near-term debt increase is very wide in ratio terms, even as the dollar interest bill keeps climbing off a low base |

## 4. Coverage / Covenant Read

Earnings cover interest by a wide margin today — EBITDA/interest of 55.2x (TTM, $112,056m/$2,029m) and (EBITDA − capex)/interest of 11.2x — but that coverage ratio has compressed from 129.9x (FY2023) to 87.5x (FY2025) to 55.2x (TTM) as interest expense has nearly quintupled on five bond issuances since Aug-2022, most recently $30,000m (Nov-2025) and $25,000m (May-2026), only part of which has yet flowed through the TTM interest line — so further near-term compression toward roughly 36x (the single-quarter Q2'26 interest run-rate annualized) is a real, disclosed forward dynamic, not a speculative call. There is no tightest covenant to name because there is no maintenance financial covenant at all: Meta's Notes are explicitly disclosed as carrying none, and there is no revolver or credit facility to attach a springing covenant to — a genuinely favorable structural fact (zero contractual covenant-breach risk today), which this report distinguishes from the weaker "not disclosed" case the module's partial-data rule is written for. What would actually threaten this credit is not a covenant trip but the trend itself: continued heavy bond issuance funding a capex program (TTM capex $89,325m, +71% YoY) running well ahead of free cash flow (TTM FCF $37,872m, −20% YoY per `earnings/01_historical-financials.md`), which is the mechanism compressing coverage quarter over quarter even from an extremely high starting level.



---

## balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md

_Source: `05_off-balance-sheet-and-contingencies.md`_

# Off-Balance-Sheet & Contingencies — META

Reporting currency: **USD, in millions** unless stated otherwise (EUR-denominated fines are kept in EUR — no filing-stated FX conversion is given for them, and converting without a stated rate would violate the currency-mixing rule). Reporting standard: US GAAP. Balance-sheet date used: June 30, 2026 (Q2 FY2026 10-Q, filed Jul-30-2026), with December 31, 2025 (FY2025 10-K, filed Jan-29-2026) shown for trend. Total stockholders' equity used for ratios: **$261,221m** (Jun 30, 2026) [Q2 FY26 10-Q, Consolidated Balance Sheets, per `01_capital-structure-and-leverage.md` §5].

## 1. Off-Balance-Sheet / Debt-Like Obligations

| Item | Recognized Liability | Maximum / Gross Exposure | Already in 01's debt stack? | Source |
|---|---:|---:|---|---|
| Operating lease liabilities (on-balance sheet, ASC 842) | $28,654m (Jun 30, 2026) | Same — recognized in full, not a contingency | **No** — captured in `01` §2 as an "other debt-like obligation," excluded from `01`'s canonical funded-debt figure ($83,664m); shown here only as context so this report is not read as adding it again | Q2 FY26 10-Q, Consolidated Balance Sheets |
| Finance lease liabilities (on-balance sheet, ASC 842) | $1,184m (Dec 31, 2025, last separately disclosed) | Same | **No** — same treatment as above | FY2025 10-K, Leases note (Note 6) |
| **Leases that have not yet commenced (true off-balance-sheet item — no liability recognized until commencement)** | **$0** | **≈$346,990m** — $278,990m of operating/finance leases not yet commenced as of Jun 30, 2026 (data centers, colocations, network infrastructure; commencing 2026–2036, terms 1–30 years) **plus** $68,000m of additional data-center leases entered into in July 2026 (commencing 2027–2028, terms 18–20 years). Up sharply from $103,770m at Dec 31, 2025 (+236% in six months). | **No** — not yet a lease liability under ASC 842; will land on-balance-sheet only as each lease commences | Q2 FY26 10-Q, Note 9 (Commitments and Contingencies); FY2025 10-K, Leases note |
| Pension / OPEB underfunding | Not material — no defined-benefit pension or OPEB plan disclosed | N/A | N/A | FY2025 10-K (full-text search); Capital IQ Pension-OPEB tab (blank) — confirmed in `01` §2 |
| Securitization / factoring | Not disclosed — no securitization or receivables-factoring program found anywhere in the pool | N/A | N/A | 10-K/10-Q full-text search (no matches) |
| **Non-cancelable purchase commitments** (firm contractual, not contingent — third-party cloud capacity, servers/network/data-center infrastructure, Reality Labs hardware) | $0 | **$349,310m** as of Jun 30, 2026 (up from $131,050m at Dec 31, 2025, +166% in six months); $53,520m due 2026, $81,650m due 2027 | **No** — explicitly excluded from `01`'s debt stack and flagged there as owned by this agent | Q2 FY26 10-Q, Note 9 (Commitments and Contingencies) |
| Contingent cloud-capacity obligation (variable — reduced if the cloud provider resells the capacity) | $0 | **$14,720m** over a 5-year period | No | Q2 FY26 10-Q, Note 9 |
| Renewable-energy purchase agreements | Not quantified — no fixed or minimum volume specified; 9–25 year terms | Not estimable — company states ultimate spend "will be based on actual volume purchased" | No | Q2 FY26 10-Q, Note 9 |

**Note on classification:** the $349,310m purchase-commitment figure and the $346,990m of not-yet-commenced leases are firm forward commitments, not contingent liabilities in the classic sense (they are near-certain to be paid absent a change of plan) — they are shown here per MODULE_RULES' off-balance-sheet scope, but are **kept out of the "contingent exposure" ratio in §4** to avoid mixing a firm-commitment basis with a genuinely-contingent basis (CLAUDE.md §15, aggregates must not mix bases silently). Together they total **≈$696,300m** of forward obligation that sits entirely off the debt stack and off the lease-liability balance today — roughly 8.3x the $83,664m of funded debt in `01`, and the clearest evidence that the AI-infrastructure buildout's real forward cash commitment is far larger than the balance sheet shows at any single date.

## 2. Guarantees & Letters of Credit

No standby letters of credit, financial guarantees to third parties, or surety/performance bonds are disclosed anywhere in the 10-K, 10-Q, or DEF 14A (full-text search: "letter of credit," "surety" return no matches). The only guarantee-type exposure disclosed is a pair of residual-value guarantees (RVGs) tied to unconsolidated data-center joint ventures.

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| RVG — Louisiana data-center Venture (20% JV, co-development, not consolidated) | $0 — "RVG payments are not probable, and therefore no liability has been recorded to date" | $28,000m aggregate threshold, decreasing over time. Max RVG payment = shortfall between fair value and threshold if Meta terminates/does not renew a lease and other conditions are met. This $28,000bn threshold is one component of the Venture's total $46,030m max-exposure figure in the row below (not additive on top of it). | The Venture (unconsolidated VIE, JV counterparty) | Q2 FY26 10-Q, Note 5 (Non-Marketable Equity Investments) |
| RVG — El Paso, Texas data-center Venture (20% JV, pending) | $0 — deal not yet closed as of Jun 30, 2026 | ≈$13,000m maximum aggregate exposure. Exclusivity agreement signed July 2026; closing (expected Q3 2026) is subject to definitive agreements and customary closing conditions. On closing, Meta expects to contribute ≈$2,300m of held-for-sale assets net of liabilities and receive a ≈$1,000m one-time distribution. | The Venture (pending JV counterparty) | Q2 FY26 10-Q, Note 13 (Subsequent Event) |
| Unconsolidated VIE — Louisiana Venture, total max exposure to loss (20% membership interest; Meta is not the primary beneficiary and does not consolidate) | $2,920m — carrying value of the equity-method investment (recognized as an **asset**, not a liability) | $46,030m (Jun 30, 2026), up from $45,950m (Dec 31, 2025) — consists of the $2,920m carrying value + the ≈$12,310m aggregate initial lease commitment + estimated future funding commitments (JV partners committed to fund ≈$27,000m of total estimated development costs pro rata) + the $28,000m RVG threshold | The Venture | Q2 FY26 10-Q, Note 5 |
| Unconsolidated VIE — other VIEs, total max exposure to loss | $6,410m (Jun 30, 2026), up from $5,580m (Dec 31, 2025) — equals carrying value of the investments; no incremental unrecognized gap disclosed | $6,410m — "represents the carrying value of our investments" | Various (not individually named) | Q2 FY26 10-Q, Note 5 |

## 3. Litigation & Tax Contingencies

Meta's own framing (10-Q Part II, Item 1, "Legal Proceedings"): *"The maximum aggregate monetary damages or penalties sought across our various legal proceedings could amount to an aggregate of up to hundreds of billions of dollars and, as a result, could be material to the financial condition of the company."* For the youth-litigation matters specifically, the company states plaintiffs have sought damages, disgorgement, or penalties "in certain cases up to more than a trillion dollars." Both figures are the company's own aggregate characterization across many overlapping and unresolved claims and are **not** itemizable to a single number without double-counting the named matters below — they are shown here as the company's own probability-neutral scale statement, not summed into §4.

| Matter | Recorded Provision | Maximum / Claimed | Status (company's own language) | Source |
|---|---:|---:|---|---|
| New Mexico AG — privacy/content-moderation case (expanded from the original 2018 platform/data-practices litigation) | Not separately disclosed | AG "has indicated that they intend to seek up to **$62,850m** in penalties" | **Active / live** — trial scheduled to begin September 8, 2026 | Q2 FY26 10-Q, Note 9 (Privacy and Related Matters) |
| New Mexico AG — youth social-media-addiction MDL (civil penalty) | Not separately disclosed | Jury verdict March 24, 2026: **$375m** civil penalty ordered | **Active** — appeal/further proceedings ongoing | Q2 FY26 10-Q, Note 9 (Youth-Related Actions) |
| New Mexico AG — youth social-media-addiction MDL (public nuisance / abatement) | Not separately disclosed | AG now seeking **$953m** in abatement costs plus broad injunctive relief | **Active** — bench trial held May 2026, court decision pending | Q2 FY26 10-Q, Note 9 |
| Flo Health / "Meta Pixel" privacy litigation (CIPA §632) | Not separately disclosed | Jury found liability Aug 1, 2025; plaintiffs seek $5,000 statutory damages per class member, up to ≈1.25 million class members → **up to $6,250m** | **Active** — liability established, damages phase / amount uncertain | Q2 FY26 10-Q, Note 9 |
| First user bellwether (social-media-addiction, JCCP 5255) | Recorded within Q2 legal G&A charge (see below) | $6m verdict (70% Meta / 30% YouTube = ≈$4.2m Meta share) | Active — appealed by Meta | Q2 FY26 10-Q, Note 9 |
| AMI et al. v. Meta Ireland (Spain, unfair competition) | Not separately disclosed | Court judgment Nov 19, 2025: **€542m** damages | **Active** — Meta has appealed | Q2 FY26 10-Q, Note 9 (Competition) |
| European Commission — Facebook Marketplace antitrust (Article 102) | Not separately disclosed | Fine imposed Nov 18, 2024: **€798m** | **Active** — Meta appealed Jan 28, 2025 | Q2 FY26 10-Q, Note 9 |
| European Commission — DMA "pay-or-consent" model | Not separately disclosed | Fine imposed Apr 2025: **€200m** | **Active** — Meta appealed Jul 4, 2025; further modifications could still be imposed during appeal | Q2 FY26 10-Q, Note 9 |
| IDPC (Ireland) — GDPR Standard Contractual Clauses decision | "We have accrued significant amounts for loss contingencies related to these inquiries and investigations in Europe" — no specific balance disclosed | Fine imposed May 12, 2023: **€1,200m** plus corrective orders | **Active** — Meta is appealing; decision currently stayed by the Irish High Court | Q2 FY26 10-Q, Note 9; 10-Q Legal Proceedings, Part II Item 1 |
| FTC modified consent order — proposed amendment (board composition, data-use limits, product-launch restrictions) | N/A (non-monetary — behavioral/structural remedy sought) | Not quantified — "substantial changes" sought | **Active** — stayed pending jurisdictional appeal; status update due by the earlier of 30 days after that decision or September 8, 2026 | Q2 FY26 10-Q, Note 9 |
| Mass arbitration demands (Instagram "social media addiction") | Not separately disclosed | Not quantified — "over two hundred thousand individual claimants" | Active | Q2 FY26 10-Q, Note 9 |
| Aggregate Q2 2026 legal-related G&A charge (not matter-specific) | **$2,400m** expensed in Q2 FY26 alone, driving G&A up 111% QoQ — evidence some of the above matters are already being recognized as incurred, though the filing does not break the $2,400m down by case | — | Recorded expense (not a forward-looking maximum) | Q2 FY26 10-Q, MD&A, "General and administrative expenses" |
| **IRS transfer pricing — 2010 tax year (Tax Court, post-trial)** | Included within the $18,740m gross unrecognized tax benefit balance below (not separately broken out) | Tax Court opinion (May 22, 2025) valued the transferred IP at **$7,790m**, $1,480m higher than Meta's reported value; final tax due not yet determined by the Tax Court; both sides retain the right to appeal to the Ninth Circuit | **Active** — awaiting the Tax Court's forthcoming decision on the tax due | Q2 FY26 10-Q, Note 11 (Income Taxes) |
| IRS transfer pricing — 2011–2013 tax years | Included within the $18,740m balance | IRS applied its 2010-year position to 2011–2013 plus new adjustments on other transfer pricing and tax credits; not separately quantified | **Active** — Tax Court petition pending | Q2 FY26 10-Q, Note 11 |
| **IRS transfer pricing — 2017–2019 Notice (Sep 2025)** | Company states "we believe our accrual for unrecognized tax benefits is adequate" as of Jun 30, 2026, but does not disclose how much of the $18,740m specifically covers this Notice | IRS asserts an additional **$15,890m** in tax, plus interest and penalties (does not reflect offsets Meta believes apply) | **Active / live** — Meta filed a Tax Court petition in December 2025 to challenge it | Q2 FY26 10-Q, Note 11 |
| Gross unrecognized tax benefits (recorded balance-sheet liability, ASC 740) | **$18,740m** (Jun 30, 2026), up from $16,450m (Dec 31, 2025); of which $12,730m would flow through the tax provision if realized. Interest/penalties accrued: $2,970m (Jun 30, 2026) vs $2,600m (Dec 31, 2025) | Same figure — this is the recorded exposure, primarily tied to research tax credits and cross-border transfer pricing | Recorded liability; rising | Q2 FY26 10-Q, Note 11 |

**Translation note (CLAUDE.md §27):** the EUR-denominated fines above (AMI €542m, EU Marketplace €798m, EU DMA €200m, IDPC €1,200m) are transcribed verbatim from the filing in their original currency; no FX conversion is applied because the filing does not state one, and applying an unstated rate would be a currency-mixing hygiene defect (§15). These figures are excluded from the USD contingent-exposure total in §4 and shown separately.

## 4. Contingent Exposure Summary

This total covers **genuinely contingent** exposures only — items whose payment depends on an uncertain future event (a guarantee call, a legal loss, a tax redetermination). It **excludes** the $349,310m of firm non-cancelable purchase commitments and the $346,990m of leases not yet commenced from §1 (those are near-certain forward obligations, not contingencies, and mixing the two bases would overstate "contingent" risk — CLAUDE.md §15). It also excludes the EUR-denominated fines (§3 translation note) and the company's own vague "hundreds of billions" / "more than a trillion dollars" aggregate litigation language, which is not itemizable without double-counting the named matters already listed.

| Metric | Value | Build |
|---|---:|---|
| Total recognized contingent liabilities | **$18,740m** | Gross unrecognized tax benefits (the only balance-sheet-recognized contingent liability disclosed; RVGs are explicitly "no liability recorded," and litigation matters are not individually accrued in disclosure) |
| Total maximum / gross exposure (USD-quantified only) | **≈$178,808m** | $46,030m (Louisiana VIE, inclusive of its $28,000m RVG threshold, its $2,920m recognized equity-investment asset, and lease/funding commitments) + $13,000m (El Paso RVG, pending) + $14,720m (contingent cloud capacity) + $18,740m (recorded tax liability) + $15,890m (incremental IRS 2017–2019 Notice, on top of the recorded $18,740m — flagged as possibly partially overlapping with it, since the company does not disclose the Notice-specific coverage within its accrual) + $70,428m (quantified USD litigation: $62,850m NM AG privacy case + $375m NM AG civil penalty + $953m NM AG abatement claim + $6,250m Flo Health maximum) |
| Max exposure ÷ recognized | **≈9.5x** | 178,808 / 18,740 |
| Max exposure ÷ total equity | **≈68.5%** | 178,808 / 261,221 |
| Memo: firm forward commitments excluded from the above (purchase commitments + leases not yet commenced) | $696,300m | $349,310m + $346,990m — shown for scale, not contingent |
| Memo: EUR-denominated fines excluded from the above (not converted) | €2,740m | €1,200m (IDPC) + €798m (EU Marketplace) + €542m (AMI Spain) + €200m (EU DMA) |

## 5. Contingency Read

The single largest live off-balance-sheet exposure is not litigation — it is the AI-infrastructure buildout sitting entirely outside the debt stack and outside the lease-liability balance: $349,310m of non-cancelable purchase commitments (up 166% in six months) plus $346,990m of leases signed but not yet commenced (up 236% in six months), a combined $696,300m of forward obligation against $83,664m of funded debt and $261,221m of equity — none of it contingent, all of it coming due. Within the narrower, genuinely-contingent bucket, the two unconsolidated data-center joint ventures (Louisiana $46,030m max exposure against a $2,920m recognized investment, plus a pending $13,000m-RVG venture in El Paso) and the live IRS transfer-pricing dispute ($15,890m newly asserted for 2017–2019, on top of a rising $18,740m recorded tax-benefit liability, with the 2010-year Tax Court case still awaiting a final dollar figure) are the two structurally largest and most active items; both are live, not remote, by the company's own procedural status (ongoing Tax Court petitions, a venture the company does not consolidate but is contractually exposed to in full). Litigation is extensive and diverse — a September 8, 2026 trial where a state AG is seeking $62,850m, a jury-established liability in Flo Health with damages up to $6,250m still undetermined, and roughly €2,740m of EU fines all under appeal — but no single litigation matter currently rivals the infrastructure commitment or the VIE/tax exposures in size; the company's own "hundreds of billions"/"trillion-dollar" aggregate language signals genuine tail risk across the docket as a whole rather than one dominant claim. If the quantified contingent bucket alone (≈$178,808m, 9.5x the $18,740m recognized and 68.5% of equity) crystallized in full, it would materially impair the balance sheet built out in `01`; the more probable near-term risk is the firm-commitment bucket (§1), which is not contingent at all and is growing faster than free cash flow.

RF-OBS-001 (contingent-liability spike)



---

## balance-sheet-survival / 06_downside-stress-test.md

_Source: `06_downside-stress-test.md`_

# Downside Stress Test — META

## 1. Base Case (today)

Reporting currency: **USD, in millions**. EBITDA basis: **reported/calculated (Operating Income + D&A), TTM through Jun-30-2026** — Meta discloses no adjusted or GAAP EBITDA line item [`01_capital-structure-and-leverage.md` §5]. Net debt basis: **strict (§15)**, designated the module's canonical figure by `01` §4/§7; the broad (investment-inclusive) figure is shown alongside, labelled.

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | $112,056m (TTM). Cash-backed: CFO/EBITDA ran 105%–124% every year FY2021–FY2025 (113.6% FY2025) — cash generation exceeds booked EBITDA every year, not an "addback illusion" concern | `01_capital-structure-and-leverage.md` §5; `earnings/06_earnings-quality.md` §2 |
| Net debt (strict, canonical) | $68,202m (net debt); broad basis (netting marketable securities) = **−$6,596m, i.e. net CASH of $6,596m** — sign-flipping divergence, carried with its label | `01_capital-structure-and-leverage.md` §4, §7 |
| Net debt / EBITDA | 0.61x (strict, canonical); −0.06x (broad, net cash) | `01_capital-structure-and-leverage.md` §5 |
| EBITDA / interest | 55.2x (TTM, $112,056m / $2,029m) | `04_coverage-and-covenants.md` §1 |
| Tightest covenant + threshold | **None exists** — "We are not subject to any financial covenants under the Notes" [Q2 FY26 10-Q, Note 8]; no revolver, so no springing covenant either. Illustrative typical covenants (labelled assumption, NOT real thresholds, per `04`'s own illustrative-benchmark table): max net leverage 4.0x–4.5x, min interest coverage 2.0x–3.0x | `04_coverage-and-covenants.md` §2–3 |
| Next-12m obligations | $5,398m = $0 debt maturities + $5,398m annualized dividends (interest $2,029m and total capex are already netted inside the FCF figure used below — not double-counted per MODULE_RULES §8) | `02_maturity-wall-and-refinancing.md` §2; `03_liquidity-runway.md` §2 |
| Committed liquidity | $90,260m = $15,462m cash & equivalents + $74,798m marketable securities. No revolver/facility exists (a genuine absence, not an "availability unknown" gap) | `03_liquidity-runway.md` §1 |
| Floating-rate debt (gross) | $0 — **100% of Meta's funded debt is fixed-rate** (all five Note series); no revolver, commercial paper, or term loan exists | `02_maturity-wall-and-refinancing.md` §3 |
| Hedge coverage (if any) | Not applicable to debt — there is no floating-rate debt to hedge. Meta uses short-term FX forwards on revenue/cash exposures (unrelated to the debt stack) | `business-model/10_external-dependency.md` §2 |
| Working-capital seasonality / peak build | Not materially seasonal. Disclosed annual working-capital swings run from +$5,683m (FY2022, cash source) to −$885m (FY2025, cash use) — both small relative to $90,260m of liquidity. No disclosed peak intra-year build | `03_liquidity-runway.md` §3 ("Seasonality / Peak Liquidity Need") |

## 2. Stress Scenarios

All dollar figures in USD millions. Every cell below was produced by an executed Python calculation (shown after the table), not by hand.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | 112,056 | 78,439 | 67,234 | 44,822 | 67,234 | 67,234 |
| Net debt / EBITDA (strict) | 0.61x | 0.87x | 1.01x | 1.52x | 1.01x | 1.01x |
| EBITDA / interest | 55.2x | 38.7x | 33.1x | 22.1x | 33.1x | 33.1x (unchanged — see note) |
| Tightest covenant headroom | No real covenant; illustrative max-leverage headroom +85.7% vs 4.25x | +79.5% (illustrative) | +76.1% (illustrative) | +64.2% (illustrative) | +76.1% (illustrative) | +76.1% (illustrative) |
| Covenant breach? (Y/N) | N — no covenant exists | N | N | N | N | N |
| 12-month liquidity gap | Surplus $122,734m (no gap) | Surplus $96,177m | Surplus $87,324m | Surplus $69,619m | Surplus $85,324m | Surplus $87,324m |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

**Rate-shock column, labelled not applicable.** Meta's funded debt is 100% fixed-rate (§1) with no revolver or other floating instrument [`02_maturity-wall-and-refinancing.md` §3]. A +200bp rate shock therefore does not change interest expense on any existing debt — it only raises the coupon on future new issuance, which is not modelled here. The column is shown holding the −40% figures unchanged, labelled "not applicable — 0% floating exposure," per the module's instruction to include the column even where the shock cannot bite.

**Working-capital shock, labelled assumption.** `03_liquidity-runway.md` §3 discloses no peak intra-year working-capital build, so a $2,000m cash outflow is used as a labelled assumption — roughly 2.3x the largest disclosed annual working-capital cash use (FY2025, $885m) — applied on top of the −40% EBITDA haircut. This is a conservative sizing given META's actual disclosed swings are smaller and there is no separate inventory line.

**Illustrative covenant caveat.** META's Notes carry no maintenance financial covenants ("headroom" and "breach" cells above use the labelled, illustrative typical-market thresholds from `04` — 4.25x max net leverage / 2.5x min interest coverage midpoints — solely to give the reader scale; they are not thresholds META is actually bound by. Actual covenant breach risk on the Notes is not assessable because no real covenant exists, and every "N" (breach) cell above is trivially true for that reason as well as on the illustrative math.)

**Executed calculation (Python, run via Bash; command and full output shown):**

```
ebitda_base = 112056.0; net_debt = 68202.0; interest = 2029.0
fcf_base = 37872.0; liquidity = 90260.0; obligations_12m = 5398.0
tax_assumption = 0.21  # labelled assumption: US statutory federal rate — used because
                       # disclosed effective rates (11.8% FY2024, 29.6% FY2025) were
                       # both one-off-distorted and not representative of a marginal rate

def stressed(h):
    ebitda = ebitda_base*(1-h)
    lev = net_debt/ebitda
    cov = ebitda/interest
    fcf = fcf_base - ebitda_base*h*(1-tax_assumption)   # lost EBITDA drops to FCF after tax;
                                                          # cash interest & maintenance capex held fixed
    liq_plus_fcf = liquidity + fcf
    gap = obligations_12m - liq_plus_fcf   # positive = shortfall, negative = surplus
    return ebitda, lev, cov, fcf, liq_plus_fcf, gap

# Results (h, EBITDA, NetDebt/EBITDA, EBITDA/Interest, StressedFCF, Liq+FCF, 12m gap):
# 0.00  112056.0  0.6086  55.227  37872.0   128132.0  -122734.0  (surplus)
# 0.30   78439.2  0.8695  38.659  11314.7   101574.7   -96176.7  (surplus)
# 0.40   67233.6  1.0144  33.136   2462.3    92722.3   -87324.3  (surplus)
# 0.60   44822.4  1.5216  22.091 -15242.5    75017.5   -69619.5  (surplus)

# -40% + WC shock ($2,000m):
# gap = obligations_12m + 2000 - liq_plus_fcf(0.40) = 5398 + 2000 - 92722.3 = -85324.3 (surplus)

# Covenant breach solves (illustrative thresholds, labelled, not real covenants):
# Max net leverage 4.25x:  h = 1 - net_debt/(4.25*ebitda_base) = 1 - 68202/476238.0  = 0.8568
# Min interest coverage 2.5x: h = 1 - (2.5*interest)/ebitda_base = 1 - 5072.5/112056.0 = 0.9547
# Refi-market threshold 6.0x: h = 1 - net_debt/(6.0*ebitda_base) = 1 - 68202/672336.0 = 0.8986

# Liquidity exhaustion solve: 90260 + (37872 - 112056*h*0.79) = 5398
# h = (liquidity + fcf_base - obligations_12m) / (ebitda_base*(1-tax)) = 122734 / 88524.24 = 1.3864
#   -> h > 1: liquidity is not exhausted by any EBITDA decline, even a full wipeout

# Check at h = 1.0 (100% EBITDA loss, the theoretical limit):
# fcf(1.0) = 37872 - 112056*1.0*0.79 = -50652.24
# liquidity + fcf(1.0) = 90260 - 50652.24 = 39607.76
# surplus over 12m obligations ($5,398m) = 39607.76 - 5398 = 34209.76  (still a $34.2bn surplus)
```

**All scenarios assume zero management mitigation — this is a survival bound, not a forecast; the earnings module's realised-offset case (`earnings/07` §2, if produced) is the expected-outcome read.** No price rises, no cost programme, no capex pullback, and no dividend cut are modelled — only the mechanical drop-through of a lower EBITDA at a fixed 21% assumed tax rate, with the debt stack, interest bill, and dividend held constant.

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches | **Not reached on an EBITDA decline alone** — no real covenant exists. On the illustrative-only 4.25x max-net-leverage threshold: h = 85.7%. On the illustrative-only 2.5x min-coverage threshold: h = 95.5%. Both are labelled assumptions, not real thresholds META is bound by, and both sit far beyond the −30/−40/−60% range tested |
| Committed liquidity exhausted within 12 months | **h ≥ 1 — does not breach on an EBITDA decline alone.** Solved h = 1.386 (>100%, i.e. mathematically impossible). Confirmed directly: even a full 100% EBITDA wipeout (h = 1.0) leaves liquidity + stressed FCF at $39,608m against $5,398m of 12-month obligations — a $34,210m surplus |
| Net leverage exceeds 6x (illustrative refi-market threshold) | h = 89.9% (net debt held constant at $68,202m) — far beyond the tested haircut range |

**Formulas used (direction-aware, per MODULE_RULES §11 / step 5):**
- Covenant / leverage-threshold breach (MAX/ceiling form, debt metric = net debt per META's illustrative net-leverage covenant): `h = 1 − net debt ÷ (T · EBITDA)`
- Coverage-covenant breach (MIN/floor form): `h = 1 − (T · interest) ÷ EBITDA`
- Liquidity exhaustion: solved from `liquidity + [FCF_base − EBITDA·h·(1−tax)] = next-12-month obligations`, giving `h = (liquidity + FCF_base − obligations) ÷ [EBITDA·(1−tax)]`

Because every solved `h` exceeds 1 or sits in the mid-to-high-80s/90s percent range against a genuinely non-existent real covenant, **none of the three break points is reached anywhere inside the plausible stress range this test is built to cover (−30% to −60%, or even the extreme −100% liquidity check).** The stress test therefore does not identify a first-to-break factor inside its tested range — this is itself the finding, not an omission (see §4).

## 4. Survival Read

META survives a 30–60% EBITDA decline without a covenant breach, a liquidity gap, or any need for an equity raise, distressed asset sale, or covenant waiver — the structure does not break inside the tested range at all: net leverage rises only to 1.52x (strict basis) even at −60% EBITDA, EBITDA/interest coverage still stands at 22.1x, and the 12-month liquidity surplus stays above $69,600m in every scenario, including the combined −40% EBITDA + working-capital-shock case. The company has no maintenance financial covenant to breach in the first place — its Notes carry none — so the only way to test "covenant breach" here is against illustrative, explicitly labelled market-typical thresholds (4.25x max leverage / 2.5x min coverage), and even those would require an 86–96% EBITDA collapse, a scenario this stress test does not consider plausible and is not attempting to price. Liquidity does not run out even under the most extreme check performed: a full, mechanical 100% EBITDA wipeout for 12 months still leaves a $34.2bn liquidity surplus over the year's obligations ($0 debt maturities + $5,398m dividends), because $90,260m is already sitting in cash and marketable securities today. **Market closure test:** assuming no new unsecured refinancing is available for 12 months, nothing changes — $0 is contractually due in the next 12 months, the entire $4,250m due through 2028 is dwarfed by cash on hand ($15,462m) alone, and no covenant-triggered acceleration exists to force action even if credit markets shut [`02_maturity-wall-and-refinancing.md` §4]. On the module's canonical strict net-debt basis (§15), META is not currently net cash — it carries $68,202m of net debt (0.61x EBITDA) after a real, capex-funded leverage build from a net-cash position every year FY2021–FY2024 [`01_capital-structure-and-leverage.md` §6]; on the broad basis (also netting marketable securities), it remains net cash by $6,596m. Either way, the survival math above holds without qualification: this stress test finds no break point inside a normal-recession-scale decline, and the first constraint that would actually bind — if one exists — sits well outside the range a 30–60% EBITDA stress, or even a full EBITDA wipeout, is capable of reaching from today's starting leverage and liquidity.
