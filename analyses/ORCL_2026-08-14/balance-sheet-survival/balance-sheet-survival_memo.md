# Balance-Sheet-Survival Module Memo — ORCL

**Verdict: Stretched** — Oracle can pay its debts, but its ~$70bn FY2027 building program cannot be funded from money already in hand if profits dip even slightly.

Memo date: 2026-08-14. Source: `99_balance-sheet-survival-synthesis.md` (this module's synthesis). Every number below is carried from that file.

---

## Scores at a Glance

| Score | /100 | What drove it (from the synthesis) |
|---|---|---|
| Solvency strength | **38** | Net debt / EBITDA up from 3.83x to 4.46x in two years; debt raised to fund capex; S&P cut to BBB− on 2026-07-09; CDS spreads near an 18-year high |
| Liquidity runway | **42** | ~20.1 months on the narrow module formula, but ~5.8–6.9 months once guided capex is counted |
| Refinancing risk *(inverted — higher is worse)* | **58** | Near-term wall is small, but the ~$70bn FY2027 program needs open debt/equity markets during active rating deterioration |
| Covenant headroom | **55** | Wide computed headroom (+166.2% / +121.0%), but **capped at max 60** because the credit agreement's own EBITDA-addback definition is not in the pool |
| Downside resilience | **45** | Debt service and the covenant survive a 12-month market closure; the capital program does not survive a normal 2–20% EBITDA decline |
| Data quality | **92** | `00` triage verdict "Sufficient" — debt note, maturity schedule, cash flow statement, revolver terms and contingencies all present |
| Overall usefulness | **88** | All six sections ran on primary filing data |

**Score caps applied:** one — covenant headroom capped at max 60 (`04` §2: reported EBITDA used as a stand-in for the credit agreement's own undisclosed "Consolidated EBITDA"). No other MODULE_RULES cap fired; no data-sufficiency cap applies.

**§24 Avoid-Big-Risks:** the synthesis carried no separate filter-trip list for this module. It did raise one red flag: **RF-OBS-001 (contingent-liability spike)** — $260,000mn of signed but not-yet-recorded data-centre lease commitments [`05` §1].

---

## What This Module Found

Oracle owes more, relative to what it earns, than at any recent point, and the direction is still worsening. Net debt (all borrowings minus cash) is $136,143mn — gross debt of $167,432mn including leases, less $31,289mn of cash — against FY2026 EBITDA (rough cash profit before interest, tax and depreciation) of $30,494mn. That is 4.46x, up from 3.83x in FY2024 and 4.40x in FY2025 [`01` §4, §5, §6, §7]. The rise came entirely from borrowing to build AI data centres, not from takeovers or share buybacks: total debt rose 54% in FY2026 alone on $42.7bn of new senior notes plus $5.0bn of preferred stock [`01` §6].

The near-term repayment schedule is not the problem. Only 5.5% of the notes-payable book ($7,210mn) falls due within 12 months and 13.3% ($17,355mn) within 24 months, covered several times over by cash plus a fully available, undrawn $10.0bn revolving credit line [`02` §2, §4].

The problem is the building program. The headline ~20.1-month liquidity runway (how long committed cash covers hard obligations) assumes only maintenance-level spending. Substitute Oracle's guided ~$70bn FY2027 capex — roughly 2.3x FY2026 EBITDA — and the runway falls to ~5.8–6.9 months [`03` §3]. On that basis, committed money runs out at an EBITDA decline of roughly **2%–20%** (~2.2% on §15-normalised FY2026 free cash flow, ~19.6% on reported free cash flow) [`06` §3]. That is inside ordinary recession range, not a tail case. Meanwhile the one disclosed maintenance covenant — a promise to keep EBITDA at 3.0x or more of net interest, tested each quarter — does not break until EBITDA falls 54.8% (gross-interest basis) to 62.4% (net-interest basis) [`04` §2, §3; `06` §3].

The single biggest risk in one line: the ~$70bn FY2027 spend depends on continued access to debt and equity markets at the exact moment S&P has cut Oracle to BBB− (one notch above junk, 2026-07-09) and CDS spreads — the cost of insuring Oracle's debt — sit near an 18-year high, above 2008 levels [`01` §6; `02` §5].

Two things cut the other way. The $31.3bn of cash plus the undrawn revolver cover debt service even through a 12-month market shutdown, and the EBITDA behind the coverage ratios is genuinely cash-backed (cash from operations was ~90%–105% of EBITDA in FY2026) [`06` §4; `04` §1]. And the capex figure is a plan, not a contract — the liquidity break is a discretionary-spending outcome, not a forced default path [`06` §4].

---

## The Specialists, Briefly

- **solvency-data-triage** — Sufficient; all six sections can run, no hard caps triggered. Only the credit agreement's EBITDA-addback definition (Exhibit 10.14) and a standalone rating-rationale report are missing.
- **capital-structure-and-leverage** — Net debt / EBITDA 4.46x strict, up from 3.83x; net debt went from $83,960mn to $136,143mn in two years, all capex-funded; S&P downgrade to BBB−.
- **maturity-wall-and-refinancing** — Exposed; the small wall is covered only in isolation from the ~$70bn capex program drawing on the same $41.3bn liquidity pool.
- **liquidity-runway** — ~20.1 months narrow basis, ~5.8–6.9 months with real capex; the $31.3bn cash is freshly-raised debt and preferred proceeds, not retained operating cash (FY2026 levered free cash flow was −$23,686mn).
- **coverage-and-covenants** — EBITDA/interest wide at 6.63x–7.98x, but after capex it is −5.47x and fixed-charge coverage is −1.89x; no maximum-leverage covenant exists to restrain the debt-funded ramp.
- **off-balance-sheet-and-contingencies** — RF-OBS-001: $260,000mn of additional data-centre lease commitments (15–19 years, mostly starting FY2027–FY2029), about 1.9x the entire current gross debt stack; maximum contingent exposure is 7.13x total equity.
- **downside-stress-test** — Marginal survival: debt service holds, the capital program does not; real break at a 2%–20% EBITDA decline.

**Main disagreement, as resolved by the synthesis:** the triage agent treated the missing covenant-EBITDA addback definition as a soft flag, while the covenant specialist applied the hard cap. The synthesis applied the cap (covenant headroom max 60) as the more conservative reading. It also kept the filing-anchored EBITDA of $30,494mn over a Capital IQ tab implying ~$33.3bn (which makes leverage look higher, not lower), and treated a −60% EBITDA case as a marginal covenant breach rather than a clean pass.

---

## What Would Change This Read

**Would strengthen it:** a disclosed, executed capex-flexibility plan (for example, a stated ability to defer or cancel a specific part of the $260,000mn of lease commitments without penalty); a rating stabilisation or upgrade; net debt / EBITDA trending back toward 3.5x–4.0x; the full Exhibit 10.14 text confirming the covenant's EBITDA addbacks are not aggressive.

**Would weaken it:** a further S&P, Moody's or Fitch downgrade; the Netherlands GDPR Supreme Court ruling (already overdue as of this report's date) landing as a material loss; the $20bn at-the-market equity program failing to price on reasonable terms; any sign the FY2027 capex is being funded by drawing the revolver instead of new issuance.

**Data needed:** Exhibit 10.14 (the Revolving Credit Agreement) in full; a standalone Moody's/S&P/Fitch rating-rationale report; a disclosed capex-deferral plan; the Netherlands GDPR outcome.

---

## Bottom Line

- **Verdict: Stretched** — solvent on debt service alone, but the capital program depends on capital markets staying open while S&P holds Oracle one notch above junk.
- **Could be better than it looks:** the capex number is guidance, not a contract. Management has signalled capex retrenchment as the lever, the $10.0bn revolver is undrawn and available to 2031-03-06, and a ~$40bn FY2027 financing plan (including a $20bn at-the-market equity program) is already disclosed [`03` §1, §4; `06` §4].
- **Could be worse than it looks:** $260,000mn of signed data-centre leases start converting onto the balance sheet from FY2027 — nearly double the entire current debt stack — and no maximum-leverage covenant exists to slow any of it.
- **Missing evidence:** the credit agreement's own EBITDA-addback definition (which is why covenant headroom is capped at 60) and a primary rating-agency rationale; the S&P BBB− is a Capital IQ vendor read.
- **Watch next:** whether guided capex is funded by new issuance or by drawing the revolver — the second would be the early sign the 2%–20% break point is arriving.

---

## Plain-English Glossary

- **EBITDA** — rough cash profit before interest, tax and depreciation; here $30,494mn for FY2026.
- **Net debt** — all borrowings minus cash; $136,143mn on the strict basis.
- **Net debt / EBITDA (net leverage)** — years of that cash profit needed to repay net debt; 4.46x.
- **Maturity wall** — how much debt comes due, and when; 5.5% within 12 months.
- **Revolver (revolving credit line)** — a pre-agreed bank facility a company can draw on; Oracle's $10.0bn is undrawn.
- **Liquidity runway** — how many months committed cash covers unavoidable obligations; ~20.1 months narrow, ~5.8–6.9 months with real capex.
- **Capex** — spending on buildings and equipment; guided ~$70bn for FY2027.
- **Covenant / covenant headroom** — a promise in a loan agreement and the slack before it is broken; here EBITDA must stay at 3.0x net interest, with +166.2% / +121.0% slack.
- **Free cash flow (FCF)** — operating cash left after capex; FY2026 levered FCF was −$23,686mn.
- **CDS spread** — the annual cost of insuring a company's debt against default; near an 18-year high.
- **BBB−** — the lowest investment-grade credit rating, one notch above junk.
- **At-the-market (ATM) equity program** — selling new shares gradually into the open market; $20bn planned.
- **Fixed-charge coverage** — profit measured against all fixed payments due; −1.89x.
