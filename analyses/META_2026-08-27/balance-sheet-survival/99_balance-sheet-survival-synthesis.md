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
