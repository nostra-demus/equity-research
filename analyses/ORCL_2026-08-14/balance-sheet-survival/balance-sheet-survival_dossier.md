# balance-sheet-survival Module Dossier — ORCL

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `balance-sheet-survival_memo.md`.

- Generated: 2026-08-14T07:02:02Z
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

# Balance-Sheet-Survival Module — ORCL (Synthesis)

## Abstract

Oracle's net leverage (net debt / EBITDA) has risen from 3.83x (FY2024) to 4.46x (FY2026), all of it debt-funded AI-data-center capex rather than acquisitions, and S&P cut the issuer rating to BBB- on 2026-07-09, one notch above non-investment grade. The maturity wall itself is small — 5.5% of notes-payable debt due within 12 months, 13.3% within 24 months — and is not the risk. The 20.1-month liquidity runway calculated on maintenance-level spending is real cash in hand, and the one disclosed covenant (3.0x minimum interest coverage) has +166% headroom, but both readings exclude Oracle's guided ~$70bn FY2027 growth capex; folded back in, committed liquidity is exhausted at an EBITDA decline of roughly 2%–20%, inside a normal recession, provided capex is not cut. The verdict is Stretched: debt service survives a closed capital market for 12 months, but the AI-infrastructure buildout does not, without a capex cut, a fresh capital raise, or (least likely) a covenant waiver.

## 1. Solvency Verdict

- **Verdict:** Stretched
- **Net leverage (net debt / EBITDA):** 4.46x — net debt $136,143mn (strict basis, §15: all-in gross debt $167,432mn incl. capitalized operating leases − cash & equivalents $31,289mn) ÷ reported EBITDA $30,494mn (GAAP operating income + D&A). On inferred adjusted EBITDA (~$37,035mn, Inference — not company-disclosed), 3.68x.
- **Liquidity runway:** ~20.1 months on the near-term "hard obligations" basis (debt maturities + cash interest + maintenance-capex proxy + committed dividends, no FCF netting because FCF is negative); collapses to ~5.8–6.9 months once Oracle's guided ~$70bn FY2027 growth capex is included in the uses bucket.
- **Maturity wall (% within 24 months):** 13.3% of the $130,105mn notes-payable-and-term-loan base ($17,355mn); 5.5% within 12 months ($7,210mn).
- **Tightest covenant + headroom:** Revolving Credit Agreement, min. Consolidated EBITDA / Consolidated Net Interest Expense ≥ 3.0x — the only maintenance covenant disclosed anywhere in Oracle's debt terms. Actual 7.98x (net-interest basis, matches covenant wording) / 6.63x (gross-interest, conservative alternative). Headroom +166.2% / +121.0% — but confidence is capped at 60/100 because the credit agreement's own "Consolidated EBITDA" addback definition (Exhibit 10.14) is not reproduced in the pool.
- **Stress break point (EBITDA decline that breaks it):** The covenant itself does not break until -62.4% (net-interest basis) / -54.8% (gross-interest basis) — well beyond a normal recession. But committed liquidity, measured against Oracle's actual capex-inclusive free cash flow rather than the narrow maintenance-only bucket, is exhausted at just -2.2% to -19.6% EBITDA decline, provided capex is not cut. Net leverage crosses an illustrative 6.0x refi-sensitive threshold (Oracle has no contractual max-leverage covenant) at -25.6%.
- Solvency strength /100: 45 — mixed/weak. Rising leverage trend, capex-funded not covenant-constrained, BBB- rating one notch above junk, $260bn of signed-but-unrecognized lease commitments layered on top.
- Liquidity runway /100: 42 — mixed. Headline 20.1 months is real cash in hand, but the decision-relevant figure (once actual guided capex is included) is 5.8–6.9 months.
- Refinancing risk /100 (higher = worse): 58 — the near-term wall itself is thin and manageable, but the +180bp to +300bp refi cost step-up, the BBB- downgrade, and an 18-year-high CDS spread mean continued capital-markets access — not any single maturity — is the live constraint.
- Covenant headroom /100: 55 (capped at max 60 per MODULE_RULES — addback definition undisclosed). Nominal headroom is wide; quality is unverified.
- Downside resilience /100: 38 — weak. Debt service and the disclosed covenant survive even a 60% EBITDA haircut and a 12-month market closure, but the capex program Oracle is actually running does not survive a shallow, plausible EBITDA decline without external funding or a capex cut.
- Data quality /100: 85 — a full audited debt note, instrument-level maturity schedule, cash flow statement, lease note, and contingency note are all present; only the credit agreement's own covenant-EBITDA addback text is missing.
- Overall usefulness /100: 85 — this module gives the master synthesizer a complete, reproducible survival picture with only one soft gap.
- Biggest solvency risk (one line): Committed liquidity is being measured against a maintenance-spending bucket while Oracle is actually running a ~$56–95bn capex program roughly double its EBITDA — on the real-spending basis, liquidity (not the covenant or the maturity wall) is the first thing that breaks, at an EBITDA decline as shallow as 2%–20%.

## 1A. Module Disconfirmation

- **Strongest bear point:** On the real-spending (capex-inclusive) FCF basis, Oracle's committed liquidity ($41,894mn) is exhausted by an EBITDA decline of just -2.2% to -19.6% — inside normal-recession range, not a tail event — while S&P has already cut the rating to BBB- (2026-07-09, one notch above non-investment grade) and Oracle's CDS spread widened to roughly an 18-year high in August 2026 [`06`, Section 3; `02`, Section 5].
- **Strongest bull point (steelman):** The one disclosed maintenance covenant is nowhere close to breach (needs a 55–62% EBITDA collapse), the near-term wall is small and fully covered several times over by cash plus the undrawn revolver even under a 12-month market-closure test with zero new unsecured issuance, and the entire leverage increase is discretionary growth capex — not a debt-funded acquisition or an operating deterioration — so the single most plausible fix (a capex retrenchment) is entirely within management's own control and has already been signaled as available [`02`, Section 5; `06`, Section 4].
- **Single killer risk:** A capital-markets closure that coincides with Oracle continuing its guided ~$70bn FY2027 net capex pace rather than cutting it — that combination, not any covenant test or bond maturity, is what exhausts liquidity within 12 months [`06`, Section 3–4].
- **Disconfirming evidence already visible:** None that overturns the bear case — the S&P downgrade and the CDS widening corroborate the fragility rather than disconfirm it. The one piece of evidence that meaningfully offsets the risk is that debt service itself (not the capex program) survives a full 12-month market closure without default [`02`, Section 5; `06`, Section 4].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| solvency-data-triage | Sufficient — all six sections could run, no hard MODULE_RULES caps triggered | Only a soft flag: the revolver's covenant-EBITDA addback definition (Exhibit 10.14) is not reproduced in the pool |
| capital-structure-and-leverage | Net debt/EBITDA 4.46x, rising from 3.83x two years ago; gross debt $167,432mn (all-in) | Leverage more than doubled on a strict net-debt basis in two years, entirely on debt-funded AI-infrastructure capex, not M&A or buybacks; S&P downgraded to BBB- on 2026-07-09 |
| maturity-wall-and-refinancing | Exposed — depends on open markets | The near-term wall (5.5%/12mo, 13.3%/24mo) is technically covered by cash + revolver in isolation, but that same liquidity pool must also fund a guided ~$70bn FY2027 capex program |
| liquidity-runway | ~20.1 months on maintenance basis; ~5.8–6.9 months once guided growth capex is included | The $31.3bn cash balance is freshly raised debt/preferred proceeds, not retained operating cash — it is pre-funded capex dry powder, not surplus liquidity |
| coverage-and-covenants | EBITDA/interest 6.63x–7.98x (wide); (EBITDA−capex)/interest is -5.47x | Coverage is negative on every basis once capex is netted — the AI build is funded by new debt/preferred issuance, not operating cash flow |
| off-balance-sheet-and-contingencies | $260,000mn of additional, not-yet-recognized data-center lease commitments dwarf the recognized $167,432mn debt stack | RF-OBS-001 (contingent-liability spike) — a second wave of debt-like obligations roughly 1.9x current all-in gross debt is set to convert onto the balance sheet over FY2027–FY2029 |
| downside-stress-test | Marginal / basis-dependent — covenant survives to -62.4%, but real liquidity breaks at -2.2% to -19.6% | The disclosed covenant is a false comfort signal; the actual break point is liquidity exhaustion driven by capex, not EBITDA collapse against the covenant |

## 3. Reconciliation

Two items surfaced in the specialist outputs deserve explicit reconciliation rather than silent averaging:

1. **EBITDA basis discrepancy inside Capital IQ itself.** `01` flags that CIQ's own Capital Structure Summary tab computes "Total Debt/EBITDA" of 5.03x (implying an EBITDA base near $33.3bn), about 9% above the $30,494mn reported-EBITDA figure this module uses throughout (sourced and cross-checked directly against the audited income statement, and matching `earnings/01_historical-financials.md`'s independent build). **Reconciled view: use $30,494mn** — it is the figure traceable line-by-line to the 10-K's own operating income and D&A, consistent with CLAUDE.md §5's rule to cite the source a number actually came from; the CIQ Capital Structure Summary tab's higher figure is flagged as an unexplained internal CIQ convention, not adopted.
2. **S&P outlook label inconsistency.** `01` notes the underlying Key Developments feed carries conflicting "Stable" and "Negative" outlook labels for the same 2026-07-09 downgrade entry. **Reconciled view: the downgrade itself (BBB- from BBB, A-3 from A-2) is treated as confirmed; the forward outlook is treated as unresolved** per the conservative default (CLAUDE.md §4) rather than asserted either way.
3. **Covenant breach at the -60% haircut.** `06`'s stress table shows the -60% EBITDA scenario as a breach on the gross-interest basis (-11.6% headroom) but not on the net-interest basis that matches the covenant's literal wording (+6.5% headroom). **Reconciled view: not a breach under the covenant's own terms, but flagged as marginal and basis-dependent** — the more conservative reading is carried forward into the verdict block above.

No other material disagreements between specialists.

## 3A. Fragility Map (what breaks first)

| Fragility Driver | Indicator | Current Status | Why It Matters |
|---|---|---|---|
| Maturity concentration | % due within 24m | 13.3% ($17,355mn of $130,105mn notes-payable base) | Small in isolation; not the acute risk |
| Availability liquidity | usable liquidity vs uses | $41,894mn vs $24,978mn (maintenance basis, 1.68x) — but vs actual capex-inclusive burn, exhausted at -2% to -20% EBITDA decline | Revolver reality: the $10bn commitment is fully available and non-borrowing-base, but the real liquidity draw is the capex program, not the debt/interest/dividend bucket |
| Covenant illusion risk | covenant EBITDA vs reported | Headroom computed on reported EBITDA as a proxy; true credit-agreement "Consolidated EBITDA" definition (addbacks) not disclosed | Addback risk: true contractual headroom is unverified, though the conservative proxy already shows it is not the binding constraint |
| Floating-rate sensitivity | floating % net of hedges | ~1.0% of the debt book (~$1,437mn) after the Term Loan's $4,700mn swap to 4.74% fixed | Rate shock: a +200bp move adds only ~$28.7mn of annual interest — immaterial |
| Structural subordination | HoldCo debt vs upstreaming | None — all debt issued directly by the NYSE-listed parent; only standard subsidiary-liability-seniority boilerplate | Trapped value: not a distinct risk layer here |
| Contingent accelerants | CoC puts / cross-default | No explicit change-of-control put or cross-default clause located in the extracted text; a $3.3bn lessor-borrowing guarantee matures Sep-2026; a ratings downgrade could trigger higher collateral/LC requirements per risk-factor language | Fast failure: the clearest disclosed accelerant is a further rating downgrade raising collateral/credit-support requirements, not a bond covenant trip |

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No debt maturity schedule | N — full instrument-level schedule disclosed | Solvency strength | Not applicable |
| No covenant disclosure | N — the 3.0x threshold and a compliance attestation are disclosed; only the addback definition is missing (soft flag) | Covenant headroom | Not the "Not assessable" cap; the narrower "assumed addback" cap below applies instead |
| No cash flow statement | N — full Consolidated Statements of Cash Flows present | Liquidity runway | Not applicable |
| Only annual data (no interim) | N — FY2026 10-K is the latest filed period; a Q3 FY2026 10-Q is also in the pool | Solvency strength | Not applicable |
| No EBITDA base (stress not run) | N — stress test ran fully | Downside resilience | Not applicable |
| Covenant headroom relies on assumed covenant-EBITDA addbacks | **Y** — reported EBITDA used as a proxy for the credit agreement's own undefined "Consolidated EBITDA" | Covenant headroom | Max 60 |
| Off-balance-sheet exposures undisclosed for a known-litigious/levered name | N — the $260bn lease-commitment pool and the litigation matters are all disclosed with figures and status, not undisclosed | Solvency strength | Not applicable |
| Revolver exists but availability unknown (borrowing base) | N — the $10.0bn facility is not borrowing-base structured; full commitment is confirmed usable | Liquidity runway | Not applicable |

Most restrictive cap in effect: **Covenant headroom capped at 60/100.** No other hard caps apply; the module's data sufficiency is otherwise uncapped per `00`'s triage verdict.

## 5. Survival Summary

Oracle is materially more levered than it was two years ago — net debt/EBITDA rose from 3.83x (FY2024) to 4.46x (FY2026) — and the direction is worsening, not stabilizing: FY2026 total debt rose 54% in a single year on $42.7bn of new senior notes plus $5.0bn of preferred stock, and management has guided a further ~$70bn of net capex for FY2027, meaning the debt-funding need is not a one-off. The near-term maturity wall is not the wall this company should worry about — only 5.5% of the notes-payable book is due within 12 months and 13.3% within 24 months — and that portion is refinanced or repaid from cash on hand, not dependent on fresh issuance. The liquidity runway is where the two readings genuinely diverge: measured against maintenance-level spending it is a comfortable 20.1 months, but measured against what Oracle is actually spending (the guided AI-infrastructure capex program), the same $41.9bn of committed liquidity is exhausted within 6–20 months, and the covenant — the one contractual guardrail Oracle has — sits so far from breach (+166% headroom, requiring a 62.4% EBITDA collapse) that it will not be the thing that stops the spending. A normal recession (-30% to -40% EBITDA) is fully survivable for debt service and covenant compliance, including under a hypothetical 12-month closure of the unsecured debt market, but it is not survivable for the capital program at its current pace without one of: a capex cut, a fresh debt/equity raise (the ~$40bn financing plan management has already flagged), or, in the least likely case, a covenant waiver.

## 6. What Would Change The Solvency Verdict?

| Current Verdict | What Would Strengthen It | What Would Weaken It | Data Needed |
|---|---|---|---|
| Stretched | A disclosed, executed capex-flexing plan (evidence that Oracle can and will cut the ~$70bn FY2027 guide if funding tightens); successful completion of the ~$40bn FY2027 financing plan at reasonable spreads; a stabilized or upgraded credit rating; EBITDA margin holding at or above the FY2026 45.3% high-water mark through a full cycle | A further S&P/Moody's downgrade into speculative grade; failure to complete the ~$40bn financing plan; the Netherlands GDPR class action or the OCI securities class action resolving adversely with a material damages award; the $260bn of additional lease commitments beginning to convert to on-balance-sheet liabilities faster than guided; EBITDA margin reverting to the FY2023–FY2025 38–41% band | The credit agreement's own "Consolidated EBITDA" / "Consolidated Net Interest Expense" addback definitions (Exhibit 10.14); a standalone Moody's/S&P/Fitch rating-rationale report; management's disclosed capex-flexing commitments, if any, beyond earnings-call commentary |

## 6A. Survival Playbook (non-speculative levers)

- **Capex flexibility:** management has guided ~$70bn of FY2027 net capex and the specialists note this is the single most plausible lever if funding tightens — `06` states "the single most plausible, and most likely, exit is a capex retrenchment — management itself has signaled that lever is available" [`06`, Section 4]. This is the clearest evidenced lever in the data pool.
- **Undrawn revolver:** $10.0bn committed, unsecured, non-borrowing-base facility, $0 drawn as of 2026-05-31, available as a bridge if market issuance stalls [`03`, Section 1].
- **Planned capital raise:** an already-flagged ≈$40bn FY2027 financing plan, including a previously announced $20bn at-the-market equity program [`03`, Section 4, citing `earnings/04_guidance-consensus.md`].
- Dividend suspension: not evidenced as a lever Oracle has signaled — dividends ($5.7bn common + $63mn preferred, FY2026) are described as "committed" in this module's own liquidity-use bucket, and no suspension plan is disclosed.
- Asset-sale program: no evidenced program in the data pool ("Unknown — no asset-sale program announced or authorized in the data pool" [`02`, Section 4]).

## 7. Note To The Final Synthesizer

- Net leverage is rising, not stable: net debt/EBITDA 3.83x (FY2024) → 4.40x (FY2025) → 4.46x (FY2026), strict basis; gross debt/EBITDA is 5.49x on the all-in (lease-inclusive) basis, 4.50x on the narrower interest-bearing-only basis — show both, not net alone.
- The maturity wall (5.5% within 12 months, 13.3% within 24 months) is small and is not the binding constraint; refinancing is effectively secured for that window by cash + the undrawn revolver on a standalone basis.
- The liquidity runway is bimodal: 20.1 months against maintenance-level spending, but only 5.8–6.9 months once Oracle's actual guided AI-capex spend is included — the runway depends entirely on continued, open access to the unsecured debt and equity markets for the ~$40bn FY2027 financing plan, not on cash already in hand.
- The tightest (and only) disclosed covenant — Revolving Credit Agreement min. EBITDA/net-interest coverage ≥ 3.0x — has wide nominal headroom (+166.2%/+121.0%) but its quality is unverified because the credit agreement's own addback definition is not in the data pool; headroom confidence is capped at 60/100.
- The largest live off-balance-sheet / contingent exposure is $260,000mn of additional, not-yet-recognized data-center lease commitments (15–19-year terms, commencing FY2027–FY2029), roughly 1.9x Oracle's current all-in recognized gross debt.
- RF-OBS-001 (contingent-liability spike)
- Oracle is not net cash and does not earn this module's strongest survival read (net debt $136,143mn, strict basis) — the leverage increase is entirely growth-capex-funded, not acquisition- or buyback-funded, which is a materially different risk profile: the fragility is largely optional (capex can be cut) rather than structural.
- One partial-data cap applied: covenant headroom is capped at max 60/100 because the revolver's own "Consolidated EBITDA" addback definition (credit-agreement Exhibit 10.14) is not reproduced in the pool. No other hard caps apply — data sufficiency for this module is otherwise uncapped.
- Biggest missing data point (single highest-value next data request): the full text of the Revolving Credit Agreement (Exhibit 10.14) or a standalone Moody's/S&P/Fitch rating-rationale report — either would confirm the exact covenant-EBITDA addback definition and give a primary-source credit rating instead of the Capital IQ vendor read (S&P Foreign Currency LT: BBB-).
- **Explicit handoff:** the master synthesizer's "Balance Sheet and Survival Test" section should defer to this synthesis; the stress break points here (covenant breach at -54.8%/-62.4% EBITDA decline; liquidity exhaustion at -2.2% to -19.6% EBITDA decline on the real-spending basis; illustrative 6.0x leverage threshold at -25.6%) are the inputs for the master's downside scenario and risk register — this module does not assign probabilities to them.

## 8. Simple Summary

- Total debt is $167,432mn all-in (incl. capitalized operating leases) — $105,953mn net of cash on the narrowest basis, $136,143mn net of cash on the all-in basis; net debt/EBITDA is 4.46x and rising (was 3.83x two years ago).
- The debt due soon is small — only 5.5% within 12 months and 13.3% within 24 months — and cash plus the undrawn $10bn revolver cover it several times over on their own.
- The company has about 20 months of cash cushion against its normal bills (debt payments, interest, basic maintenance spending, dividends) — but only about 6–7 months once its actual huge AI-data-center building spree is counted in.
- The one debt rule Oracle has to follow (interest coverage above 3.0x) is not close to being broken — earnings would need to fall by more than half — but the exact fine print behind that rule was not in the data pool.
- The biggest hidden risk is $260 billion of already-signed data-center lease commitments not yet on the balance sheet, about 1.9 times the size of all its current recognized debt.
- It survives a 30–40% drop in earnings for paying its debts, even if bond markets shut for a year — but it cannot keep building at its current pace through that drop without cutting spending, raising more money, or getting a waiver.
- A current credit rating was available (S&P cut it to BBB-, one notch above junk, on 2026-07-09), but the exact loan-covenant fine print (Exhibit 10.14) was not — that is the key gap.
- This module is useful for the master synthesizer: the data is comprehensive and the numbers reconcile cleanly across specialists, with only one narrow, clearly-flagged gap.



---

## balance-sheet-survival / 00_solvency-data-triage.md

_Source: `00_solvency-data-triage.md`_

# Solvency Data Triage — ORCL

## 1. File Inventory

Pool pre-extracted via `extract_pool.py` — 11 workbooks → 56 tabs, plus 10 single-stream documents (rtf/doc/pdf), 66 extract files total, **0 extraction failures** (manifest.json: 21/21 sources `status: ok`). Every workbook tab is listed below as its own row, reconciled against `_pool_extracts/manifest.md`.

| Filename | Type / Tab | Period Covered | Last Modified (sync date, not period) | Solvency Relevance |
|---|---|---|---|---|
| Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | Annual filing (10-K, mhtml) | FY2026, year ended May-31-2026 (filed Jun-22-2026) | Aug 13 19:32 | High |
| Oracle_Corporation_-_Form_10-Q(Mar-11-2026).doc | Quarterly filing (10-Q, mhtml) | Q3 FY2026, quarter ended Feb-28-2026 (filed Mar-11-2026) | Aug 13 19:32 | High |
| Oracle_Earnings Press Release Q4FY26.pdf | Earnings release | Q4 FY2026, quarter/year ended May-31-2026 | Aug 13 19:33 | Medium |
| Oracle_Latest_Earnings_Presentation-Slides-Q4-26.pdf | Investor deck | Q4 FY2026 | Aug 13 19:33 | Medium |
| Oracle Corporation, Q3 2026 Earnings Call, Mar 10, 2026.rtf | Transcript | Q3 FY2026 (Mar-10-2026) | Aug 13 19:31 | Medium |
| Oracle Corporation, Q4 2026 Earnings Call, Jun 10, 2026.rtf | Transcript | Q4 FY2026 (Jun-10-2026) | Aug 13 19:25 | Medium |
| Oracle Corporation NYSE ORCL Financials_Annual.xls — Key Stats | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Medium |
| … — Income Statement | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Medium |
| … — Balance Sheet | CIQ export tab | Annual, FY2017–FY2026 (as of May-31-2026) | Aug 13 19:24 | High |
| … — Cash Flow | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | High |
| … — Multiples | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Low |
| … — Historical Capitalization | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | High |
| … — Capital Structure Summary | CIQ export tab | Annual, FY2017–FY2026, incl. operating-lease commitment schedule (yrs 1–5, thereafter) | Aug 13 19:24 | High |
| … — Capital Structure Details | CIQ export tab | "FY2026 (May-31-2026) Capital Structure As Reported Details" — instrument-level debt table (type, principal, coupon, floating flag, maturity date, seniority, secured, currency) | Aug 13 19:24 | High |
| … — Ratios | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Medium |
| … — Supplemental | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Medium |
| … — Industry Specific | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Low |
| … — Pension OPEB | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Medium |
| … — Segments | CIQ export tab | Annual, FY2017–FY2026 | Aug 13 19:24 | Low |
| Oracle Corporation NYSE ORCL Financials_Quarterly.xls — Key Stats | CIQ export tab | Quarterly, FQ Aug-2016–FQ May-2026 (~41 quarters) | Aug 13 17:05 | Medium |
| … — Income Statement | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | Medium |
| … — Balance Sheet | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | High |
| … — Cash Flow | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | High |
| … — Multiples | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | Low |
| … — Historical Capitalization | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | High |
| … — Capital Structure Summary | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | High |
| … — Capital Structure Details | CIQ export tab | Quarterly, latest capital structure detail | Aug 13 17:05 | High |
| … — Ratios | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | Medium |
| … — Supplemental | CIQ export tab | Quarterly, ~41 quarters | Aug 13 17:05 | Medium |
| … — Industry Specific | CIQ export tab | Quarterly | Aug 13 17:05 | Low |
| … — Pension OPEB | CIQ export tab | Quarterly | Aug 13 17:05 | Medium |
| … — Segments | CIQ export tab | Quarterly | Aug 13 17:05 | Low |
| Oracle Corporation NYSE ORCL Credit Health Panel.xls — Summary | CIQ export tab | LTM ending 2026-05-31, financials updated 2026-06-23; peer set of 22 | Aug 14 00:14 | High |
| … — Financials | CIQ export tab | LTM 2022-05-31 through 2026-05-31; Operational/Solvency/Liquidity ratio panel vs 22-name peer mean | Aug 14 00:14 | High |
| … — Operational Metrics Charts | CIQ export tab | Same LTM series | Aug 14 00:14 | Low |
| … — Solvency Metrics Charts | CIQ export tab | Same LTM series | Aug 14 00:14 | Medium |
| … — Liquidity Metrics Charts | CIQ export tab | Same LTM series | Aug 14 00:14 | Medium |
| … — Disclaimer | CIQ export tab | n/a (methodology/legal) | Aug 14 00:14 | Low |
| Company Comparable Analysis Oracle Corporation.xls — Financial Data | CIQ export tab | As-of 2026-08-13 | Aug 13 16:48 | Low |
| … — Trading Multiples | CIQ export tab | As-of 2026-08-13 | Aug 13 16:48 | Low |
| … — Operating Statistics | CIQ export tab | As-of 2026-08-13 | Aug 13 16:48 | Low |
| … — Business Description | CIQ export tab | As-of 2026-08-13 | Aug 13 16:48 | Low |
| … — Implied Valuation | CIQ export tab | As-of 2026-08-13 | Aug 13 16:48 | Low |
| … — Valuation Chart | CIQ export tab | As-of 2026-08-13 | Aug 13 16:48 | Low |
| … — Credit Health Panel | CIQ export tab | As-of 2026-08-13 (comp-set solvency/liquidity scores) | Aug 13 16:48 | Medium |
| … — Disclaimer | CIQ export tab | n/a | Aug 13 16:48 | Low |
| ORCL_Charting Excel Export - Aug 13th 2026 4_48_01 pm.xls — Pane 1 | CIQ export tab | Price/volume time series | Aug 13 16:48 | Low |
| … — Raw | CIQ export tab | Empty (0×0) | Aug 13 16:48 | Low |
| … — Attributions | CIQ export tab | n/a | Aug 13 16:48 | Low |
| Oracle Corporation NYSE ORCL Events Calendar.xls — Events Calendar | CIQ export tab | Calendar year 2026 | Aug 14 00:13 | Low |
| Oracle Corporation NYSE ORCL Key Developments.xls — Key Developments | CIQ export tab | Trailing 1 year (incl. "Potential Red Flags/Distress Indicators", "Bankruptcy Updates", "Company Forecasts and Ratings" categories) | Aug 13 19:37 | Medium |
| Oracle Corporation NYSE ORCL Public Ownership History.xls — History | CIQ export tab | Quarterly, all history | Aug 14 00:15 | Low |
| Oracle Corporation NYSE ORCL Public Ownership Insider Trading.xls — Insider Trading | CIQ export tab | All history | Aug 13 19:38 | Low |
| OracleCorporationNYSEORCLEstimatesReport.xls — Consensus | CIQ export tab | Consensus estimates, US GAAP basis | Aug 13 16:48 | Low |
| … — Recent Changes | CIQ export tab | Recent estimate revisions | Aug 13 16:48 | Low |
| … — Guidance | CIQ export tab | Company guidance history | Aug 13 16:48 | Low |
| … — Multiples | CIQ export tab | Consensus-based multiples | Aug 13 16:48 | Low |
| … — Surprise | CIQ export tab | Earnings-surprise history | Aug 13 16:48 | Low |
| … — Trends | CIQ export tab | Estimate trend history | Aug 13 16:48 | Low |
| … — Revisions | CIQ export tab | Estimate revision history | Aug 13 16:48 | Low |
| Oracle_Short_Interest_Charting Excel Export Aug-13-2026 10_07 AM.xls — Chart 1 with Data | CIQ export tab | Short-interest time series | Aug 13 19:37 | Low |
| … — Attributions | CIQ export tab | n/a | Aug 13 19:37 | Low |
| Oracle Corporation NYSE ORCL Customers.rtf | Document (customer list) | n/a | Aug 14 00:13 | Low |
| Oracle Corporation NYSE ORCL Public Company Profile.rtf | Document (profile) | As of pool date | Aug 14 00:13 | Low |
| Oracle Corporation NYSE ORCL Public Ownership Summary.rtf | Document (ownership summary) | As of pool date | Aug 13 19:37 | Low |
| Oracle Corporation NYSE ORCL Suppliers.rtf | Document (supplier list) | n/a | Aug 14 00:13 | Low |

No documents under `data/ORCL/external/` — the directory does not exist in the pool. No external-data row or §1A table is required.

## 1A. External Data

Not applicable — `data/ORCL/external/` does not exist in the pool. No externally sourced research to inventory.

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months, vs. 2026-08-14) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Oracle_Corporation_-_Form_10-K(Jun-22-2026).doc | FY2026, year ended 2026-05-31 (filed 2026-06-22) | ~1.7 |
| Quarterly filing | Oracle_Corporation_-_Form_10-Q(Mar-11-2026).doc | Q3 FY2026, quarter ended 2026-02-28 (filed 2026-03-11) | ~5.5 (superseded for FY-end balance-sheet items by the FY26 10-K, above) |
| Debt / capital-structure export | Financials_Annual.xls — Capital Structure Details | FY2026 (as of 2026-05-31) | ~2.5 |
| Fixed-income / maturities export | Financials_Annual.xls — Capital Structure Details (Principal Due, Maturity, Coupon by instrument) | FY2026 (as of 2026-05-31) | ~2.5 |
| Cash flow statement | 10-K Consolidated Statements of Cash Flows / Financials_Annual.xls — Cash Flow | FY2026 (year ended 2026-05-31) | ~1.7 / ~2.5 |
| Covenant / credit-agreement disclosure | 10-K, Note on debt (Revolving Credit Agreement — min. 3.0x Consolidated EBITDA/Consolidated Net Interest Expense) | As of 2026-05-31 ("in compliance with all debt-related covenants") | ~1.7 |
| Credit rating report | Oracle Corporation NYSE ORCL Credit Health Panel.xls — Summary (S&P Foreign Currency LT: BBB-) | LTM ending 2026-05-31, financials updated 2026-06-23 | ~1.7 (Capital IQ vendor read of the S&P rating; no standalone Moody's/S&P/Fitch rationale report in the pool) |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | FY26 10-K, Consolidated Balance Sheets (May-31-2026 & 2025); Financials_Annual.xls — Balance Sheet | Debt, cash, equity base |
| Debt note (amounts by type) | Y | FY26 10-K, debt note (commercial paper, term loan, revolving credit, senior notes by series); Financials_Annual.xls — Capital Structure Details | The debt stack and seniority |
| Maturity schedule | Y | FY26 10-K debt note (maturity date per senior-note series, 2026–2066); Capital Structure Details tab (Maturity column, instrument-level) | The maturity wall and refinancing exposure |
| Cash flow statement | Y | FY26 10-K, Consolidated Statements of Cash Flows; Financials_Annual.xls — Cash Flow | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y | FY26 10-K: $10.0bn 5-year Revolving Credit Agreement (Mar-2026), $0 drawn as of 2026-05-31; not borrowing-base structured | True liquidity beyond cash |
| Interest expense detail | Y | FY26 10-K income statement / debt note (coupon by series); Credit Health Panel — EBITDA/Interest 7.24x | Coverage ratios |
| Covenant disclosure | Y (threshold known; full addback definition not reproduced) | FY26 10-K: Revolving Credit Agreement requires Consolidated EBITDA/Consolidated Net Interest Expense ≥ 3.0x at each fiscal quarter-end; "we were in compliance with all debt-related covenants at May 31, 2026" | Headroom to a breach |
| Lease detail (operating/finance) | Y | FY26 10-K, lease note (ASC 842) — operating and finance lease ROU assets/liabilities, 5-yr commitment schedule; Capital Structure Summary — Operating Lease Commitment Due +1…+5, After 5 Yrs | Debt-like obligations |
| Pension / OPEB funded status | Y | FY26 10-K: "certain defined benefit pension plans...offered primarily by certain of our foreign subsidiaries," aggregate projected benefit obligation and funded status disclosed; Financials_Annual/Quarterly.xls — Pension OPEB tab | Off-balance-sheet obligation |
| Commitments & contingencies note | Y | FY26 10-K, "Commitments and contingencies" note and Note 15 (litigation); risk-factor cross-reference at line ~6722 | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Partial | Capital IQ Credit Health Panel — S&P Foreign Currency LT: BBB-, as of 2026-06-23; no standalone Moody's/S&P/Fitch rating-rationale report in the pool | Refinancing access and cost |
| EBITDA base (for stress test) | Y | 10-K income statement (operating income + D&A); Financials_Annual.xls — Income Statement / Cash Flow (D&A); Credit Health Panel — EBITDA Margin 45.27% | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | 10-K cover page / business description: Systems Software, operating company (not a bank/insurer/REIT); parent-level unsecured debt structurally junior to subsidiary liabilities per debt note | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | Y | FY26 10-K: $10.0bn committed, unsecured, working-capital/general-corporate purpose, $0 drawn as of 2026-05-31 — not a borrowing-base facility, so full commitment is usable liquidity | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | Partial | 10-K states the ratio and the 3.0x threshold but references "Consolidated EBITDA" and "Consolidated Net Interest Expense" "as defined in the Revolving Credit Agreement" (Exhibit 10.14) — the full addback definition is not reproduced in the 10-K body and the exhibit's own text is not in the pool | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | Y | FY26 10-K debt note: "All existing and future liabilities of the subsidiaries of Oracle Corporation are or will be effectively senior to the senior notes and Commercial Paper Notes" — parent-issued unsecured debt is structurally subordinated to subsidiary liabilities | Structural subordination and upstreaming |
| Hedging / swaps disclosure | Y | FY26 10-K: cross-currency interest rate swaps (EUR fixed → USD variable, entered fiscal 2018) and interest rate swaps converting Term Loan floating-rate borrowings to fixed; ASC 815 derivatives note | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | Partial | 10-K risk factors note a downgrade "could reduce our access to, or increase the cost of, commercial paper...affect the terms or availability of certain long-term commitments...increase collateral, letter of credit or other credit support requirements"; Revolving Credit Agreement has standard events-of-default language; no explicit "Change of Control" put or cross-default clause text located in the extracted 10-K body (full indentures/Exhibit 10.14 not in pool as standalone text) | Hidden accelerants to distress |

## 4. Cross-Module Availability

| Cross-Module Output | Available? (Y/N) |
|---|---|
| business-model/10_external-dependency.md | Y |
| business-model/11_capital-allocation-governance.md | Y |
| business-model/03_segment-map.md | Y |
| earnings/01_historical-financials.md | Y |
| earnings/06_earnings-quality.md | Y |
| earnings/03_margin-drivers.md | Y |

All six business-model and earnings module files exist under `analyses/ORCL_2026-08-14/`. The full business-model (`00`–`12`, `99`, dossier) and earnings (`00`–`08`, `99`, dossier) sets have already run and completed.

## 4A. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | 10-K cover page; Public Company Profile ("Primary Office Location: 2300 Oracle Way, Austin, TX") |
| Exchange | NYSE (ticker ORCL) | 10-K cover page; CIQ workbook headers throughout ("Oracle Corporation (NYSE:ORCL)") |
| Filing regime | US SEC | 10-K "ANNUAL REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934"; 10-Q under the same Act |
| Reporting standard | US GAAP | CIQ Estimates Report header ("Acctg. Standard: US GAAP"); 10-K accounting-policy notes (ASC 842 leases, ASC 815 derivatives, ASC 740 taxes) |
| Reporting currency | USD | 10-K financial statements; CIQ Financials_Annual/Quarterly headers ("Currency: USD"); one EUR-denominated senior note tranche noted separately in Capital Structure Details with its own "Repayment Currency: EUR" tag |
| Document language(s) | English (all documents) | 10-K, 10-Q, earnings calls, press release, deck, and all CIQ exports are in English — no non-English filings in this pool |

No non-US filing-regime mapping is needed — ORCL is a US domestic filer. US GAAP applies throughout; leases are capitalized under ASC 842 (both operating and finance lease ROU assets/liabilities appear on the balance sheet), so the debt-like-obligation view already reflects lease capitalization. Downstream agents should state "US GAAP" and "USD" on every figure per module convention, and flag the one EUR-denominated note tranche (3.125% due Jul-2025, now matured) separately if it recurs in FY27 detail.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N — instrument-level maturity dates are disclosed in both the 10-K debt note and the CIQ Capital Structure Details tab | 02, 06 | Not applicable |
| No covenant disclosure | N — the Revolving Credit Agreement's 3.0x min. EBITDA/interest covenant and compliance statement are disclosed; only the granular EBITDA-addback wording (Exhibit 10.14 text) is absent | 04, 06 | Not applicable (see note below on addback quality) |
| No cash flow statement | N — full Consolidated Statements of Cash Flows are in the 10-K and CIQ Cash Flow tabs (annual and quarterly) | 03, 04, 06 | Not applicable |
| No undrawn-facility disclosure | N — $10.0bn committed Revolving Credit Agreement, $0 drawn as of 2026-05-31, explicitly disclosed | 03 | Not applicable |
| No interest-expense detail | N — coupon-by-series and consolidated interest expense are disclosed | 04 | Not applicable |
| No EBITDA base | N — income statement and D&A detail support an EBITDA build for the stress test | 06 | Not applicable |

**One soft flag for downstream agent 04/06 (not a hard cap):** the Revolving Credit Agreement's covenant EBITDA and Net Interest Expense definitions are referenced but not reproduced verbatim in the 10-K body (the governing text sits in Exhibit 10.14, which is not itself extracted as standalone text in this pool). Agent 04 should compute headroom against the disclosed 3.0x threshold using GAAP-reported EBITDA/interest as the best available proxy, state that the covenant's own addback definition is unconfirmed, and flag the headroom read as "threshold known, addback quality unconfirmed" rather than applying the MODULE_RULES "assumed addback" cap outright (that cap is for cases with no known threshold at all).

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent, audited balance sheet (FY2026 10-K, year ended 2026-05-31), a full debt note with instrument-level amounts, coupons, seniority, and maturity dates, and a full cash flow statement are all present in both the primary filing and the Capital IQ workbook exports — so leverage, liquidity, coverage, and a stress test can all be built. Lease, pension, commitments-and-contingencies, hedging, and structural-subordination disclosures are also present, and the company is a US operating company (Systems Software), not a bank/insurer/REIT, so the module's standard debt/EBITDA framework applies without the Business Type Applicability Gate override.
- **Sections that can run:** capital structure, maturity wall, liquidity, coverage/covenants, contingencies, stress test — all six.
- **Active partial-data caps:** None triggered from the MODULE_RULES Score Cap Rules table. One soft flag only: covenant-EBITDA addback definition not fully reproduced in the extracted text (see §5 note) — agent 04 should note this explicitly when stating covenant-headroom confidence, but it does not meet the bar for the "assumed covenant-EBITDA addbacks" hard cap (Covenant headroom max 60), because the threshold itself (3.0x) and a compliance attestation are both disclosed.
- **Critical missing items:** None.
- **Single highest-value missing document:** The full text of Exhibit 10.14 (the Revolving Credit Agreement itself) or a standalone Moody's/S&P/Fitch rating-rationale report — either would let agent 04 confirm the exact covenant-EBITDA addback definition and give agent 99 a primary-source credit rating instead of relying on the Capital IQ vendor read (S&P Foreign Currency LT: BBB-).



---

## balance-sheet-survival / 01_capital-structure-and-leverage.md

_Source: `01_capital-structure-and-leverage.md`_

# Capital Structure & Leverage — ORCL

Reporting currency: USD. Reporting standard: US GAAP. Fiscal year ends May 31 ("FY2026" = year ended May-31-2026). All figures below are from Oracle's audited FY2026 Form 10-K (filed 2026-06-22) and Capital IQ financial-data exports (data as of 2026-08-13) unless otherwise cited. No `ciq_facts.json` sidecar was found in `_pool_extracts/` for this run; all figures below are this agent's own sourced read of the filing and CIQ workbooks, cross-checked line-by-line against the audited balance sheet.

## 1. Debt Stack

Oracle Corporation (the NYSE-listed parent) is the sole issuer of every instrument below — no subsidiary or separate HoldCo issuer is disclosed. All debt is unsecured except the finance-lease and operating-lease liabilities, which are secured by the leased assets themselves.

| Instrument | Amount (FY2026, USD mn) | Entity | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Commercial Paper Notes | 1,468 | Oracle Corporation | No | Senior unsecured | None | Rolling, program to 2027-05-31 | Fixed, ~4.35% wtd. avg | [FY26 10-K, Note on Debt — Commercial Paper Program; CIQ Financials_Annual.xls, Capital Structure Details tab] |
| Curr. portion of long-term notes payable | 5,731 | Oracle Corporation | No | Senior unsecured | None | Within 12 months of FY26 year-end | Fixed (mix of matured/maturing tranches) | [FY26 10-K, Consolidated Balance Sheet, "Notes payable and other borrowings, current" = $7,199mn = $1,468mn CP + $5,731mn curr. LT notes] |
| Senior Notes (fixed, ~48 tranches, 2026–2066) | 122,000 (123,500 par less 2 floating tranches below) | Oracle Corporation | No | Senior unsecured, pari passu with CP and revolver | None | Laddered 2026–2066 | Fixed, 1.65%–6.90% | [FY26 10-K, Note on Debt, Notes Payable schedule; CIQ Capital Structure Details tab] |
| Senior Notes (floating, 2 tranches) | 1,000 | Oracle Corporation | No | Senior unsecured, pari passu with fixed notes | None | Aug 2028 / Feb 2029 | Floating, SOFR+0.76% / SOFR+1.11% | [FY26 10-K, Note on Debt; CIQ Capital Structure Details tab] |
| Term Loan Credit Agreement 2 | 5,137 | Oracle Corporation | No | Senior unsecured, pari passu with senior notes | None | Final maturity 2027-08-16; quarterly amortization 1.25%–2.50% of principal from Sep-2024 | Floating, SOFR + 112.5–162.5bps (one portion swapped to fixed via cash-flow hedge) | [FY26 10-K, Note on Debt — Term Loan Credit Agreements] |
| Revolving Credit Agreement ($10.0bn commitment) | 0 drawn | Oracle Corporation | No | Senior unsecured, pari passu with senior notes | None | 2031-03-06 | Floating (SOFR-based, undrawn) | [FY26 10-K, Note on Debt — Revolving Credit Agreement; entered March 2026, replacing a $6.0bn facility] |
| Finance lease liabilities | 7,701 (620 current + 7,081 non-current) | Oracle Corporation | Yes | Effectively secured by leased assets | Leased data-center/equipment assets | Various | Fixed, ~5.70% wtd. avg (imputed discount rate) | [FY26 10-K, Leases note, "Finance lease liabilities, current/non-current"] |
| **Total notes payable + finance leases (interest-bearing debt)** | **137,242** | — | — | — | — | — | — | Sum of rows above |
| Memo: Operating lease liabilities (not GAAP "debt") | 30,190 (3,542 current + 26,648 non-current) | Oracle Corporation | Effectively secured by leased assets | n/a (ASC 842 lease liability, not a debt instrument) | Data-center and real-estate leases | Various | Fixed, ~5.70% wtd. avg (imputed discount rate) | [FY26 10-K, Leases note, "Operating lease liabilities, current/non-current"] |
| **Total gross debt incl. operating leases (CIQ / IFRS16-style all-in basis)** | **167,432** | — | — | — | — | — | — | [CIQ Financials_Annual.xls, Balance Sheet & Capital Structure Summary tabs — ties to audited B/S: ST borrowings 1,468 + curr. LT debt 5,731 + curr. leases 4,162 + LT debt 122,342 + LT leases 33,729 = 167,432] |

**Three debt bases, all material — used differently below:**
1. **Notes payable & other borrowings only** (Oracle's own "aggregate indebtedness" definition used in its Risk Factors) = **$129,541mn** ($7,199mn current + $122,342mn non-current) — the 10-K states "As of May 31, 2026, we had an aggregate of $129.5 billion of outstanding indebtedness" [FY26 10-K, Item 1A, p.19]. This is CP + Term Loan + Senior Notes ($1,468 + $5,137 + $123,500 = $130,105mn) less a $564mn unamortized discount/issuance-cost adjustment.
2. **Notes payable + finance leases** (GAAP interest-bearing debt, excludes operating leases) = **$137,242mn**.
3. **All-in, incl. operating lease liabilities** (CIQ's standardized "Total Debt," an IFRS16-style convention that capitalizes operating leases even though US GAAP under ASC 842 does not label them "debt") = **$167,432mn**.

The $30,190mn gap between basis 2 and basis 3 is entirely the operating-lease liability, which grew from $13,450mn (FY2025) to $30,190mn (FY2026, +125%) as Oracle signs long-dated data-center leases for its AI-infrastructure build-out — this is a fast-growing, real fixed obligation, not a rounding item. **Both views are shown throughout this report; Section 7 designates the canonical figure for downstream agents.**

The revolver's maintenance covenant: Consolidated EBITDA / Consolidated Net Interest Expense must not be less than 3.0x at each fiscal quarter-end while the Revolving Credit Agreement is effective [FY26 10-K, Note on Debt — Revolving Credit Agreement]. Oracle states it "was in compliance with all debt-related covenants at May 31, 2026" [FY26 10-K, Note on Debt]. (Full covenant-headroom computation is `04_coverage-and-covenants`'s job, not this agent's — this is noted here because it is disclosed alongside the debt stack.)

No change-of-control put, cross-default trigger, or rating-linked pricing step is separately disclosed beyond the Term Loan / Revolver interest-rate grids referencing "the credit rating assigned to our long-term senior unsecured debt" (i.e., the margin over SOFR moves with the rating, but no acceleration trigger is stated) — **not disclosed in the data pool** beyond that pricing-grid mechanism.

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Operating lease liabilities (US GAAP ASC 842) | $30,190mn ($3,542mn current + $26,648mn non-current) | On-balance-sheet lease liability under US GAAP; not classified as "debt" by Oracle or by GAAP, but capitalized into "Total Debt" by Capital IQ (an IFRS16-style convention). Shown here and in Section 1. | [FY26 10-K, Leases note] |
| Pension / OPEB underfunding | $1,656mn net liability recognized on the balance sheet (projected benefit obligation $2,500mn vs. plan assets) | Recorded within Other Non-Current Liabilities; small relative to the balance sheet ($261.8bn total assets) | [CIQ Financials_Annual.xls, Pension/OPEB tab, FY2026 column] |
| Preferred equity — 6.50% Series D Mandatory Convertible Preferred Stock | $5.0bn gross proceeds / $4,954mn carrying value | Classified as equity, not debt, but carries a fixed 6.50% dividend ($63mn paid FY26, first partial year; quarterly dividend of $1,625/share declared Jun-2026), ranks senior to common stock for dividends and liquidation ($100,000/share liquidation preference), and mandatorily converts to common stock by 2029-01-15 (or earlier on a fundamental change) | [FY26 10-K, Note 10 (Stockholders' Equity) — Mandatory Convertible Preferred Stock terms; issued 2026-02-05] |
| Unconditional purchase obligations (data-center power, capacity) | $13,309mn recorded (Note 14) + a further $19bn of unconditional 5-year purchase commitments entered into after FY26 year-end (not yet recorded on the balance sheet) | Off-balance-sheet contractual commitment, not debt; additive to the capex/debt buildout already underway | [FY26 10-K, Note 14 (Commitments and Contingencies)] |
| Gross unrecognized income tax benefits | $13.2bn | Contingent tax liability recorded on the consolidated balance sheet; not classified as debt | [FY26 10-K, Item 1A (Risk Factors, Income Taxes)] |

## 3. Cash & Liquid Assets

| Item | Amount (FY2026, USD mn) | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | 31,289 | No — restricted cash included within cash & equivalents is disclosed as "immaterial" | [FY26 10-K, Consolidated Balance Sheet; FY26 10-K, Cash & Cash Equivalents note] |
| Liquid short-term investments | 605 | No | [FY26 10-K, Consolidated Balance Sheet, "Short-term investments"] |
| Restricted / trapped cash (flag) | Immaterial (not separately quantified) | Confirmed immaterial by the filing itself | [FY26 10-K, Cash & Cash Equivalents note: "Restricted cash... was immaterial"] |
| **Total cash & liquid short-term investments** | **31,894** | — | [CIQ Financials_Annual.xls, Balance Sheet tab, "Total Cash & ST Investments"] |

Cash & equivalents jumped from $10,786mn (FY2025) to $31,289mn (FY2026, +190%) — this is a stock of freshly-raised debt and preferred proceeds sitting on the balance sheet (Oracle raised $42.7bn of senior notes and $5.0bn of preferred stock during FY2026 [FY26 10-K, MD&A, Liquidity and Capital Resources]), not retained operating cash; FY2026 levered free cash flow was −$23,686mn (Section 6, and `earnings/01_historical-financials.md`). The cash balance should be read as pre-funded capex dry powder, not as surplus liquidity.

## 4. Gross & Net Debt

| Metric | Value (USD mn) | Source |
|---|---:|---|
| Gross debt (all-in, incl. operating leases — canonical basis, see Section 7) | 167,432 | Section 1 |
| − Cash & equivalents | (31,289) | Section 3 |
| **Net debt (strict, §15)** | **136,143** | 167,432 − 31,289 = 136,143 |
| − Liquid short-term investments | (605) | Section 3 |
| **Net debt (broad, incl. investments)** | **135,538** | 136,143 − 605 = 135,538; ties to CIQ's own "Net Debt" field of $135,538mn [CIQ Financials_Annual.xls, Balance Sheet tab] |

Memo — net debt on the narrower, GAAP interest-bearing-debt-only basis (excludes operating leases): $137,242mn gross debt − $31,289mn cash = **$105,953mn** (strict). This is a full turn of leverage lower than the all-in basis (Section 5) — the choice of debt basis is not a rounding issue here and is why both are shown.

The gap between strict and broad is small ($605mn of short-term investments), so the strict basis is used as the canonical net-debt figure throughout (Section 7), consistent with CLAUDE.md §15's default.

## 5. Leverage Ratios

*Higher = worse for all rows below (standard leverage-ratio convention; not separately flagged as inverted since this is the expected direction for a leverage table, per MODULE_RULES.md).*

Reported EBITDA (FY2026) = $30,494mn (GAAP operating income of $22,385mn, per Capital IQ's EBIT convention which excludes restructuring charges — see reconciliation note below — plus $8,109mn of D&A) [`earnings/01_historical-financials.md`, Section 1 & 4]. Oracle does not disclose a company-defined non-GAAP EBITDA; it only reconciles non-GAAP operating income and EPS. An implied adjusted EBITDA of **~$37,035mn** (non-GAAP operating income $28,926mn + D&A $8,109mn) can be derived but is **not a company-disclosed figure — Inference, not from filings** [`earnings/01_historical-financials.md`, Section 4].

Note on GAAP operating income vs. the EBIT figure used for EBITDA: Oracle's own GAAP operating income for FY2026 was $20,606mn; the $22,385mn CIQ "EBIT" figure used above excludes $1,779mn of restructuring & other charges that CIQ classifies outside operating income. Using GAAP operating income directly ($20,606mn + $8,109mn D&A = $28,715mn) would lower reported EBITDA and raise every ratio below by roughly 6%; both readings are flagged so the master synthesizer can see the sensitivity [`earnings/01_historical-financials.md`, Section 1, EBIT sourcing note].

| Ratio | On Reported EBITDA ($30,494mn) | On Inferred Adjusted EBITDA (~$37,035mn, Inference — not company-disclosed) | Source |
|---|---:|---:|---|
| Gross debt / EBITDA (all-in basis, $167,432mn) | 5.49x | 4.52x | Calc: 167,432 / 30,494 = 5.49; 167,432 / 37,035 = 4.52 |
| Gross debt / EBITDA (narrower, interest-bearing-only, $137,242mn) | 4.50x | 3.71x | Calc: 137,242 / 30,494 = 4.50 |
| Net debt (strict, $136,143mn) / EBITDA | 4.46x | 3.68x | Calc: 136,143 / 30,494 = 4.46; matches `earnings/01_historical-financials.md`'s independently computed 4.46x |
| Net debt (strict, narrower basis, $105,953mn) / EBITDA | 3.47x | 2.86x | Calc: 105,953 / 30,494 = 3.47 |
| Debt / capital (all-in debt $167,432mn ÷ total capital $210,488mn) | 79.5% | (n/a) | [CIQ Financials_Annual.xls, Capital Structure Summary tab, "Total Debt" % of Total = 0.7954] |
| Debt / equity (all-in debt $167,432mn ÷ total equity $43,056mn, incl. preferred + minority interest) | 3.89x | (n/a) | Calc: 167,432 / 43,056 = 3.89 |
| Debt / equity (common equity only, $37,554mn) | 4.46x | (n/a) | Calc: 167,432 / 37,554 = 4.46 |

**Reconciliation flag:** Capital IQ's own Capital Structure Summary tab computes a separately-derived "Total Debt/EBITDA" of 5.03x for FY2026 (implying an EBITDA base of roughly $33.3bn) — about 9% higher than the $30,494mn reported-EBITDA figure used above, which is the same figure `earnings/01_historical-financials.md` uses and cross-checks against the 10-K's own operating-income and D&A lines. This is a definitional variance between two different Capital IQ tabs (the Capital Structure Summary tab appears to use a different, unexplained EBITDA convention than the Financials_Annual Income Statement tab), not a data error. This report uses the $30,494mn figure — sourced and cross-checked directly against the audited income statement — as the reported-EBITDA base for every ratio above, and flags the CIQ tab-to-tab discrepancy rather than silently picking a number [CLAUDE.md §5].

**Cycle-position note:** `business-model/07_business-quality.md` scores Oracle's cyclicality at 38/100 (mid-band, "shifting from a low-cyclicality software annuity toward a lumpier, large-contract-driven infrastructure business") — not a classic commodity/cyclical business, so a full normalised/mid-cycle EBITDA table is not triggered under this module's hard rule. However, `business-model/10_external-dependency.md` scores the AI-infrastructure industrial-cycle dependency at High (inverted 72/100 risk score) and FY2026's reported EBITDA margin (45.3%) is the highest of the five-year window shown in `earnings/01_historical-financials.md`, boosted by a record Q4 seasonal margin (49.5%, vs. 40.6% in Q4 FY2025). The leverage ratios above use the latest (FY2026) EBITDA, not a normalised figure — if AI-infrastructure demand decelerates and margins revert toward the 38–41% range seen in FY2023–FY2025, every leverage ratio in this table would move higher. This is a caution flag for the downside stress test (`06`), not a computed normalised-EBITDA leverage ratio, because no clean mid-cycle EBITDA base exists for a business this early in its infrastructure buildout.

## 6. Leverage Trend

| Metric | FY2024 | FY2025 | FY2026 | Latest | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, §15) | $83,960mn | $98,166mn | $136,143mn | $136,143mn (FY2026 = latest filed period; no subsequent interim in the pool) | Rising |
| Net debt / EBITDA (reported) | 3.83x | 4.40x | 4.46x | 4.46x | Rising |

Leverage is rising, and the driver is unambiguous: capital expenditure exploded from $6,866mn (FY2024) to $21,215mn (FY2025) to $55,663mn (FY2026, +162% y/y) as Oracle builds AI-infrastructure data-center capacity, and this capex now exceeds all of FY2026's operating cash flow ($31,977mn) and EBITDA ($30,494mn) combined-with-headroom terms — net debt/(EBITDA−capex) is no longer a computable ratio because capex alone exceeds EBITDA [`business-model/11_capital-allocation-governance.md`, Section 1, "Debt level and trajectory" row]. Total debt rose 54% in a single fiscal year (FY2025 $108,952mn → FY2026 $167,432mn) on $42.7bn of new senior-note issuance plus $5.0bn of Mandatory Convertible Preferred Stock proceeds [`business-model/11_capital-allocation-governance.md`]. This is not an acquisition-funded or buyback-funded leverage increase (M&A cash outflow was $0 in FY2024–FY2026, and buybacks fell to $93–95mn) — it is a growth-capex-funded increase, and management has guided a further ~$70bn of net capex for FY2027, meaning the trajectory is not a one-off [`business-model/11_capital-allocation-governance.md`, Section 3]. S&P downgraded Oracle's long-term issuer credit rating to BBB- from BBB (and short-term rating to A-3 from A-2) on 2026-07-09, one notch above non-investment grade [Key Developments, 2026-07-09]; the source feed's outlook label is internally inconsistent between "Stable" and "Negative" in the same entry, so this report does not assert a specific outlook — **flagged, not resolved, per the conservative default (CLAUDE.md §4)**.

## 6A. HoldCo / OpCo & Structural Subordination

| Item | Evidence | Why It Matters |
|---|---|---|
| Where debt sits | All debt (senior notes, commercial paper, term loan, revolver) is issued directly by Oracle Corporation, the NYSE-listed ultimate parent — no separate financing subsidiary or intermediate HoldCo is disclosed in the pool. | No distinct HoldCo/OpCo leverage layer to map. |
| Structural subordination (standard, not elevated) | "All existing and future liabilities of the subsidiaries of Oracle Corporation are or will be effectively senior to the senior notes and Commercial Paper Notes" [FY26 10-K, Note on Debt — Senior Notes]. | This is standard boilerplate for a US corporate bond issuer with operating subsidiaries (the parent's unsecured creditors rank behind subsidiary-level liabilities in a subsidiary's own insolvency) — not a distinctive risk signal here since Oracle has no separate leveraged HoldCo layer, but it is disclosed and recorded per this module's mandatory HoldCo/OpCo scan. |
| Upstreaming constraints | Not disclosed in the data pool — no dividend-blocker or regulatory upstreaming restriction identified for any Oracle subsidiary in the FY26 10-K. | n/a given the single-issuer structure above. |
| Material restricted / trapped cash | None — restricted cash is disclosed as immaterial (Section 3). | Net debt figures in this report are not overstated or understated by trapped cash. |

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Gross debt: $167,432mn** — the all-in, IFRS16-style basis (notes payable $129,541mn + finance leases $7,701mn + operating leases $30,190mn), which ties directly to the audited FY2026 balance sheet's debt-and-lease line items. **This is the designated canonical gross-debt figure for this module**, because (a) it ties exactly to audited balance-sheet captions, and (b) `earnings/01_historical-financials.md` already uses this basis for its net-debt series, so using the same basis here avoids a cross-module contradiction. Downstream agents should also be aware of the narrower $137,242mn (excl. operating leases) and $129,541mn (notes payable only, Oracle's own "indebtedness" definition) bases shown in Section 1 — material for interest-coverage and covenant work in `04`, since the revolver's covenant references "Consolidated EBITDA to Consolidated Net Interest Expense," a cash-interest-based test, not a lease-inclusive debt test.
- **Net debt: $136,143mn — strict basis (§15): gross debt $167,432mn − cash & equivalents $31,289mn.** This is the designated canonical net-debt figure. Broad basis (netting in $605mn of short-term investments) = $135,538mn — shown for completeness but not used as canonical, since the gap is immaterial.
- **Cash & liquid investments: $31,894mn** ($31,289mn cash & equivalents + $605mn short-term investments); no material restricted/trapped cash.
- **EBITDA base: $30,494mn, reported/GAAP-based, latest (FY2026, not normalised/mid-cycle)** — cross-checked against the 10-K's GAAP operating income ($22,385mn per CIQ's EBIT convention, or $20,606mn on Oracle's own GAAP operating-income line) plus $8,109mn of D&A. Oracle discloses no company-defined adjusted EBITDA; an implied ~$37,035mn adjusted figure is inference only, not from filings. Oracle is not formally flagged as a cyclical name by `business-model/07_business-quality.md` (cyclicality score 38/100), so no normalised/mid-cycle EBITDA base is computed here — but downstream agents should treat the FY2026 EBITDA margin (45.3%, the highest of the last five years, aided by a record 49.5% Q4 margin) as a high-water mark, not a conservative base, given the High industrial-cycle dependency flagged in `business-model/10_external-dependency.md`.
- **Net debt / EBITDA: 4.46x on reported EBITDA ($30,494mn); 3.68x on inferred adjusted EBITDA (~$37,035mn, Inference — not from filings)** — both using the canonical $136,143mn net-debt figure.
- **Reporting currency: USD.**

Leverage more than doubled on the strict net-debt basis in two years (FY2024 $83,960mn / 3.83x → FY2026 $136,143mn / 4.46x) on a debt-funded AI-infrastructure capex program, not an acquisition or buyback. S&P has already downgraded Oracle one notch above non-investment grade (BBB-, 2026-07-09). Every figure in this Anchor Summary that departs from Oracle's own narrowest "$129.5bn of outstanding indebtedness" disclosure is flagged with its basis inline — downstream agents should propagate the basis label, not just the number.



---

## balance-sheet-survival / 02_maturity-wall-and-refinancing.md

_Source: `02_maturity-wall-and-refinancing.md`_

# Maturity Wall & Refinancing — ORCL

Reporting currency: USD. Reporting standard: US GAAP. Fiscal year ends May 31 ("FY2027" = year ending 2027-05-31). Figures below are Oracle's audited FY2026 Form 10-K (year ended 2026-05-31, filed 2026-06-22) — specifically the 10-K's own "Future principal payments for all of our borrowings" table and its lease-maturity table — cross-checked against the Capital IQ Capital Structure Details instrument-level export (as of 2026-05-31). No `ciq_facts.json` sidecar exists for this run; the figures below are this agent's own sourced read, reconciled line-by-line to `01_capital-structure-and-leverage.md`. A full maturity schedule IS disclosed (10-K debt note + CIQ instrument list), so the Partial-Data Rule for "no maturity schedule" does **not** apply and no confidence cap is triggered on that basis.

## 1. Maturity Schedule

The debt that is actually rolled over or repaid through capital markets — commercial paper, senior notes, and the term loan ("notes payable and other borrowings," Oracle's own "aggregate indebtedness" definition) — totals **$130,105mn face value** ($129,541mn carrying value after a $564mn unamortized discount/issuance-cost adjustment) [FY26 10-K, Note on Debt, "Future principal payments for all of our borrowings at May 31, 2026"]. This is the primary refinancing wall and is used as the 100% base below. Finance leases ($7,701mn liability) and operating leases ($30,190mn liability) are real, growing cash obligations but are not "refinanced" in capital markets — they are shown as memo rows and reconciled to the canonical $167,432mn all-in gross-debt figure from `01`.

| Period | Amount Due | % of Total Debt (of $130,105mn) | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months (FY2027, year ending 2027-05-31) | $7,210mn | 5.5% | Commercial Paper Notes ($1,468mn, rolling program to 2027-05-31), 2.65% Senior Notes due Jul-2026 ($3,000mn), 2.80% Senior Notes due Apr-2027 ($2,250mn), plus ~$492mn of scheduled FY2027 Term Loan Credit Agreement 2 amortization (1.25%–2.50% of principal per quarter) | [FY26 10-K, Note on Debt, "Future principal payments"; CIQ Financials_Annual.xls, Capital Structure Details tab] |
| Year 2 (FY2028) | $10,145mn | 7.8% | 3.25% Senior Notes due Nov-2027 ($2,750mn), 2.30% Senior Notes due Mar-2028 ($2,000mn), 4.50% Senior Notes due May-2028 ($750mn), remaining Term Loan Credit Agreement 2 balance (final maturity 2027-08-16, ~$4,645mn after FY2027 amortization) | [same] |
| Year 3 (FY2029) | $5,500mn | 4.2% | 4.80% Senior Notes due Aug-2028 ($1,500mn), Floating-Rate Senior Notes due Aug-2028 ($500mn, SOFR+0.76%), 4.55% Senior Notes due Feb-2029 ($3,000mn), Floating-Rate Senior Notes due Feb-2029 ($500mn, SOFR+1.11%) | [same] |
| Year 4 (FY2030) | $7,250mn | 5.6% | 4.20% Senior Notes due Sep-2029 ($1,500mn), 6.15% Senior Notes due Nov-2029 ($1,250mn), 2.95% Senior Notes due Apr-2030 ($3,250mn), 3.25% Senior Notes due May-2030 ($500mn), 4.65% Senior Notes due May-2030 ($750mn) | [same] |
| Year 5 (FY2031) | $9,750mn | 7.5% | 4.45% Senior Notes due Sep-2030 ($3,000mn), 2.875% Senior Notes due Mar-2031 ($3,250mn), 4.95% Senior Notes due Feb-2031 ($3,500mn) | [same] |
| Thereafter (FY2032 onward) | $90,250mn | 69.4% | ~40 remaining senior-note tranches maturing 2032–2066, including a large block of 20–40-year paper (e.g., $5,000mn 5.70% due Feb-2036, $5,000mn 6.70% due Feb-2056, $4,500mn 3.60% due Apr-2050) issued mostly in FY2026's $42.7bn debt raise for the AI-infrastructure build-out | [same] |
| **Total** | **$130,105mn** | **100%** | Commercial Paper + Senior Notes + Term Loan Credit Agreement 2 | Sum of rows above; ties to [FY26 10-K, Item 1A, "aggregate of $129.5 billion of outstanding indebtedness" (net of the $564mn discount)] |

**Memo — lease obligations (not part of the 100% base above, shown for completeness):**

| Period | Finance Lease Payments (undiscounted) | Operating Lease Payments (undiscounted) | Source |
|---|---:|---:|---|
| FY2027 | $656mn | $3,712mn | [FY26 10-K, Leases note, "Maturities of lease liabilities"] |
| FY2028 | $676mn | $3,603mn | [same] |
| FY2029 | $697mn | $3,550mn | [same] |
| FY2030 | $718mn | $3,550mn | [same] |
| FY2031 | $740mn | $3,519mn | [same] |
| Thereafter | $7,973mn | $23,933mn | [same] |
| Total lease payments (undiscounted) | $11,460mn | $41,867mn | [same] |
| Less: imputed interest | ($3,759mn) | ($11,677mn) | [same] |
| **Lease liability (discounted, on balance sheet)** | **$7,701mn** | **$30,190mn** | [same; ties to `01` Section 1] |

**Reconciliation to `01`'s canonical all-in gross debt:** $129,541mn (notes payable, net of discount) + $7,701mn (finance lease liability) + $30,190mn (operating lease liability) = **$167,432mn**, an exact match to `01_capital-structure-and-leverage.md`'s canonical figure. No reconciling gap.

Reporting currency: USD throughout.

## 2. Maturity Profile Metrics

Computed on the $130,105mn notes-payable-and-term-loan base (the debt actually subject to refinancing), using instrument-level maturity dates from the Capital IQ Capital Structure Details export, reference date 2026-08-14 (today) unless noted.

| Metric | Value |
|---|---:|
| Weighted-average maturity (years, from today 2026-08-14) | 14.3 years |
| Weighted-average maturity (years, from FY2026 balance-sheet date 2026-05-31) | 14.6 years |
| % due within 12 months (FY2027) | 5.5% ($7,210mn) |
| % due within 24 months (FY2027+FY2028) | 13.3% ($17,355mn) |
| % due within 36 months (FY2027+FY2028+FY2029) | 17.6% ($22,855mn) |
| Largest single disclosed year (within the 5-year table) | FY2028, $10,145mn (7.8%) — driven by the Term Loan's Aug-2027 final maturity landing in fiscal 2028 plus $5.5bn of senior notes |

**Reading the long WAM correctly — it is not a laddered, low-risk profile.** A 14+ year weighted-average maturity looks reassuring on its own, but it is almost entirely a mechanical artifact of the $42.7bn senior-note raise in FY2026, much of which was placed in very long tenors (20–40 years) to fund the AI-infrastructure build-out [`01`, Section 6; FY26 10-K MD&A]. It is not evidence of a mature, laddered structure built up over many years of disciplined issuance — it is the product of one enormous debt-funded capex year. The near-term wall is smaller in dollar terms than the "thereafter" bucket, but it is still real: **$22.9bn (17.6% of the notes-payable book) comes due within 36 months**, against a company whose FY2026 levered free cash flow was **−$23,686mn** and whose FY2027 guided net capex is **~$70bn** [`business-model/11_capital-allocation-governance.md`, Section 3; `earnings/01_historical-financials.md`, Section 1].

**Inference, not from filings:** the CIQ instrument-level list shows two later single-year concentrations of $5,000mn each within the "Thereafter" bucket (5.70% notes due Feb-2036 and 6.70% notes due Feb-2056) — larger in dollar terms than any of the five disclosed near-term years — but the 10-K itself only discloses the 5-year-plus-thereafter format, so this finer detail is Capital IQ-derived, not filing-disclosed at that granularity.

## 3. Rate Exposure

Computed on the combined notes-payable + finance-lease face-value base ($137,806mn: $130,105mn notes payable + $7,701mn finance leases), since finance leases carry a real, disclosed imputed rate (5.70%) and are debt-like secured obligations; operating leases are excluded from the rate-exposure calc (they are lease commitments, not instruments with a market-quoted refinancing rate).

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share (gross, by stated coupon type) | 95.5% ($131,669mn) | Calc from CIQ Capital Structure Details, per-instrument coupon-type flag |
| Floating-rate share (gross, by stated coupon type) | 4.5% ($6,137mn: $5,137mn Term Loan SOFR+1.35% + $1,000mn floating senior notes, SOFR+0.76%/+1.11%) | [same] |
| **Floating-rate share, net of hedges** | **~1.0% (~$1,437mn)** — Oracle has interest-rate swaps converting **$4,700mn** of the Term Loan's floating-rate balance to an effective fixed rate of **4.74%** (fiscal 2026 and 2025); only the ~$437mn unswapped Term Loan residual plus the $1,000mn floating senior notes remain genuinely floating | [FY26 10-K, Note on Debt, "we entered into certain interest rate swap agreements that have the economic effect of converting our $4.7 billion of floating-rate borrowings... to fixed-rate borrowings with a fixed annual interest rate of 3.07%... effective interest rates after consideration of the interest rate swap agreements were 4.74% for each of fiscal 2026 and 2025"] |
| Weighted-average coupon (notes payable only, $130,105mn face) | 4.77% | Calc from CIQ per-instrument coupons, principal-weighted |
| Weighted-average coupon (notes payable + finance leases, $137,806mn face) | 4.82% | Calc, same method, blending in the 5.70% finance-lease imputed rate |
| Current market refi rate — near/mid tenor (indicative proxy) | ~6.5%–6.7% (10-Year US Treasury yield 4.65% [2026-08-13] + an Oracle-specific credit spread proxy of ~200bp, based on Oracle's 5-year CDS spread, which exceeded 198bp / traded near its widest level ever in August 2026, above 2008 financial-crisis levels) | Web: 10Y UST yield via Trading Economics, 2026-08-13 (indicative, unverified); Oracle 5Y CDS spread via BondbloX / Seeking Alpha, Aug-2026 (indicative, unverified) |
| Current market refi rate — long tenor (directly observed) | 7.2%–7.8% (Oracle's own dollar bonds trading in the secondary market: the 4.125% notes due 2045 yielding ~7.2%; the 6.90% notes due 2052 at a yield-to-call of ~7.78%, Z-spread ~325bp) | Web: BondbloX (Oracle Corp bond pages), Aug-2026 (indicative, unverified) |
| Estimated refi cost step-up (bps) | **+180bps to +300bps** versus the 4.77% notes-payable weighted-average coupon — the low end applies to near-term refinancing, the high end to the long-dated paper that dominates the "thereafter" bucket | Calc: 6.65% − 4.77% ≈ +188bps (near/mid tenor); 7.2%–7.8% − 4.77% ≈ +243bps to +301bps (long tenor) |

The practical read: Oracle's *rate* exposure (floating-rate debt repricing with market rates) is small — about 1% of the debt book net of the Term Loan swap. The much larger exposure is *rollover* risk: fixed-rate debt maturing and having to be reissued at a materially higher coupon, because credit spreads — not just base rates — have widened sharply since Oracle's own notes were priced.

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

Next-24-month refinancing-relevant maturities (FY2027 + FY2028, notes-payable basis) = **$17,355mn**.

| Source of repayment for next-24m maturities | Amount | Evidence |
|---|---:|---|
| Cash on hand | $31,289mn (FY2026 year-end cash & equivalents) | [FY26 10-K, Consolidated Balance Sheet]. Nominally covers the $17,355mn wall more than 1.8x over, **but** this cash is disclosed as freshly raised from FY2026's $42.7bn note issuance and $5.0bn preferred issuance, not retained operating cash — FY2026 levered free cash flow was −$23,686mn [`01`, Section 3; `earnings/01_historical-financials.md`]. It should be read as pre-funded capex dry powder that competes with debt repayment for the same dollars, not as surplus liquidity sitting idle. |
| Forecast FCF (or recent run-rate, labeled) | **Negative — not a source of repayment.** FY2026 levered FCF (CFO − total capex) = −$23,686mn; management has guided FY2027 net capex of roughly $70bn, higher than FY2026's ~$48bn net outlay, against FY2026 CFO of $31,977mn | [`business-model/11_capital-allocation-governance.md`, Section 3, Q4 FY26 earnings call, 2026-06-10; `earnings/01_historical-financials.md`, Section 1]. FCF is a net **user** of cash over the next 24 months on the current guidance, not a funding source for maturities. |
| Revolver availability | $10,000mn committed, $0 drawn as of 2026-05-31, unsecured, not a borrowing-base facility (so full commitment is usable) | [FY26 10-K, Note on Debt — Revolving Credit Agreement, entered 2026-03-06, 5-year term to 2031-03-06] |
| Asset-sale proceeds | Unknown — no asset-sale program announced or authorized in the data pool | Not disclosed. Stated as unknown per this module's hard rule; do not assume. |
| New debt issuance | Unknown / not specifically committed for these maturities — Oracle's FY2026 $42.7bn senior-note issuance was for "general corporate purposes, which may include capital expenditures, repayment of indebtedness, future investments or acquisitions and payment of cash dividends" [FY26 10-K, Note on Debt], i.e. broad authority, not an earmarked refinancing plan for the FY2027/FY2028 maturities specifically | No specific forward issuance plan for these tranches is disclosed in the pool. |

Cash ($31.3bn) plus the undrawn revolver ($10.0bn) — $41.3bn of committed liquidity — comfortably exceeds the $17.4bn next-24-month notes-payable wall on a standalone, static basis. The problem is that this same liquidity pool is also the funding source management has guided toward ~$70bn of FY2027 net capex; it cannot cover both the maturity wall and the capex program without either curtailing capex, drawing the revolver, or returning to the debt and/or equity markets. Rating posture is negative: S&P downgraded Oracle's issuer credit rating to BBB− from BBB (and short-term rating to A-3 from A-2) on 2026-07-09, one notch above speculative grade [`01`, Section 6; Key Developments, 2026-07-09], and Oracle's 5-year CDS spread widened to its highest level in roughly 18 years in August 2026, exceeding levels seen in the 2008 financial crisis (Web: BondbloX, Seeking Alpha, Aug-2026, indicative/unverified) — both signal the market is pricing meaningful further-downgrade risk, which would raise the cost (and could narrow the buyer base) for the next refinancing round. Floating-rate exposure itself is small (≈1% of the debt book net of the Term Loan swap), so a Fed rate move does not directly reprice much of Oracle's interest bill — the live risk is the coupon step-up on rollover, not floating-rate repricing. **Conclusion: exposed — depends on open markets.** The near-term (24-month) wall is technically covered by cash + the undrawn revolver in isolation, but Oracle's simultaneous ~$70bn capex commitment means it is not self-funded in practice — continued, open access to unsecured debt markets is required to run both programs at once, at a moment when the company's own rating and CDS trajectory are both moving the wrong way.

## 5. Refinancing Read

The maturity wall itself is not the acute problem: only 5.5% of the notes-payable book ($7.2bn) is due within 12 months and 17.6% ($22.9bn) within 36 months, against a headline 14+ year weighted-average maturity — but that long WAM is a product of the single largest debt-funded capex year in the company's history (FY2026's $42.7bn issuance, much of it 20–40-year paper), not evidence of a seasoned, low-risk ladder. Refinancing today's maturing debt at current market levels would add roughly **+180bps to +300bps** versus the existing 4.77% weighted-average coupon (6.5%–6.7% at the near/mid tenor via a Treasury-plus-CDS-spread proxy, versus 7.2%–7.8% directly observed on Oracle's own long-dated secondary bonds) — a real, quantifiable cost step-up, not a rounding issue, on a book this large. The single biggest refinancing risk is not any one maturity date; it is that Oracle must simultaneously roll ~$17.4bn of FY2027–FY2028 debt AND fund a guided ~$70bn of FY2027 net capex, almost entirely from the same $31.3bn cash pile, $10.0bn undrawn revolver, and continued market access — at the exact moment S&P has cut the rating to one notch above junk (2026-07-09) and Oracle's CDS spreads have widened to their highest level in roughly 18 years. **Survival under a 12-month "market closure" (no new unsecured issuance):** cash ($31.3bn) plus the undrawn revolver ($10.0bn) = $41.3bn would cover the FY2027 notes-payable maturity ($7.2bn) plus the FY2027 finance- and operating-lease payments (~$4.4bn combined) several times over, so Oracle would **not** default on its FY2027 debt-service obligations even with zero new unsecured issuance — but it could not simultaneously fund anything close to the guided ~$70bn FY2027 net capex program from that same liquidity pool, so a genuine market closure would force a sharp capex retrenchment, not a default, within the next 12 months. This is **inference, not from filings** — the 10-K does not model a market-closure scenario; it is this agent's own synthesis of the disclosed cash, revolver, and capex-guidance figures.



---

## balance-sheet-survival / 03_liquidity-runway.md

_Source: `03_liquidity-runway.md`_

# Liquidity Runway — ORCL

Reporting currency: USD. Reporting standard: US GAAP. Fiscal year ends May 31 ("FY2026" = year ended 2026-05-31; "FY2027" = year ending 2027-05-31). Figures are Oracle's audited FY2026 Form 10-K (filed 2026-06-22), cross-checked against `01_capital-structure-and-leverage.md`, `02_maturity-wall-and-refinancing.md`, `earnings/01_historical-financials.md`, and `earnings/06_earnings-quality.md`. No `ciq_facts.json` sidecar exists in `_pool_extracts/` for this run; all figures are this agent's own sourced read, reconciled to the upstream module outputs where overlapping.

## 1. Liquidity Sources (committed only)

| Source | Amount (USD mn) | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | 31,289 | Y | Restricted cash is disclosed as "immaterial" and included within the cash balance — not separately carved out | [FY26 10-K, Consolidated Balance Sheet; Cash & Cash Equivalents note; `01`, Section 3] |
| Liquid short-term investments | 605 | Y | No restrictions disclosed | [FY26 10-K, Consolidated Balance Sheet, "Short-term investments"; `01`, Section 3] |
| Revolver / facilities (commitment) | 10,000 | — | $10.0bn Revolving Credit Agreement, entered 2026-03-06, matures 2031-03-06, $0 drawn as of 2026-05-31 | [FY26 10-K, Note on Debt — Revolving Credit Agreement; `01`, Section 1; `02`, Section 4] |
| Revolver availability (disclosed) | 10,000 | Y | Unsecured, general-corporate-purpose facility — **not** a borrowing-base structure, so the full $10.0bn commitment is usable liquidity, not just a headline number. No minimum-liquidity or springing covenant reduces it (`04_coverage-and-covenants.md`, Section 2 finds no such covenant disclosed) | [FY26 10-K, Note on Debt; `02`, Section 4] |
| **Total usable liquidity** | **41,894** | — | Cash + short-term investments + full disclosed revolver availability | Sum of rows above |

No uncommitted credit lines are disclosed in the pool, so none are excluded from the figure above (there is nothing to exclude). Oracle's $1,468mn of outstanding Commercial Paper Notes is **not** a liquidity source — it is already-drawn debt (counted in the debt stack in `01`, not here). Reporting currency: USD throughout.

## 2. Near-Term Uses (next 12 months, FY2027)

| Use | Amount (USD mn) | Source |
|---|---:|---|
| Debt maturities (from `02`, notes-payable-and-term-loan basis) | 7,210 | [`02_maturity-wall-and-refinancing.md`, Section 1 — Commercial Paper $1,468mn + 2.65% Senior Notes due Jul-2026 $3,000mn + 2.80% Senior Notes due Apr-2027 $2,250mn + ~$492mn of scheduled Term Loan amortization] |
| Cash interest (FY2026 actual, cash-paid basis) | 3,896 | [`earnings/06_earnings-quality.md`, Section 1, "Interest paid (cash)" row]. This is a FY2026 actual figure; because total debt rose 54% during FY2026 on the $42.7bn note issuance, FY2027's full-year cash interest bill will likely run **higher** than this figure once the new debt is outstanding for a full 12 months (FY2026 GAAP interest expense was already $4,599mn gross per `04`, Section 1) — this line is therefore a conservative-to-the-downside (i.e., understated) input, flagged rather than adjusted |
| Maintenance capex (proxy — see note) | 8,109 | **Inference, not from filings.** Oracle does not disclose a maintenance-vs-growth capex split (`earnings/06_earnings-quality.md`, Section 1: "Capex split not disclosed — total capex used"). FY2026 depreciation & amortization ($8,109mn, [`earnings/01_historical-financials.md`, Section 4]) is used here as a standard proxy for the capital spend needed to sustain the existing asset base, distinct from the AI-datacenter growth capex discussed in Section 4 below |
| Committed dividends (common + preferred, FY2026 declared/paid rate) | 5,763 | Common $5,700mn + preferred $63mn = $5,763mn [FY26 10-K, "Cash Dividends," "we declared and paid aggregate cash dividends of ... $2.00 per share of outstanding common stock that totaled $5.7 billion"; `business-model/11_capital-allocation-governance.md`, Section 1]. Buybacks are **excluded** here: FY2026 buybacks were only $93mn, board-authorized but not contractually committed, so they are not a "committed" use |
| **Total near-term uses** | **24,978** | Sum of rows above |

**Memo (not included in the total above — see Section 4):** disclosed FY2027 finance- and operating-lease cash payments total ~$4,368mn ($656mn finance + $3,712mn operating) [`02_maturity-wall-and-refinancing.md`, Section 1, lease-maturity memo table]. These are real, contractual cash obligations but sit outside the four categories this module's runway formula specifies (debt maturities, cash interest, maintenance capex, committed dividends/buybacks); including them would push total near-term uses to ~$29,346mn.

## 3. Runway

FY2026 free cash flow (CFO − total capex) was **−$23,686mn reported** (−$28,328mn on a normalised basis, net of a one-off $4,642mn customer-prepayment cash surge tied to AI-GPU contracts) [`earnings/06_earnings-quality.md`, Section 1]. This is deeply negative and, per management's own FY2027 guidance (≈$70bn net capex outlay against CFO that grew to $31,977mn in FY2026 — [`earnings/04_guidance-consensus.md`, Section 2]), is guided to remain deeply negative in FY2027. FCF is therefore **not meaningful/reliable** as a source of repayment, so this report uses the **gross-obligations basis** (MODULE_RULES §8) — the full near-term uses bucket with no FCF subtraction — rather than the net-of-FCF basis.

| Metric | Value |
|---|---:|
| Total committed liquidity | $41,894mn |
| Annual FCF (reported / normalised) | −$23,686mn / −$28,328mn (both negative — not usable as an offset) |
| Basis used | **Gross-obligations basis** (FCF negative/unreliable — MODULE_RULES §8) |
| Annual net cash burn (= Section 2 total, no FCF subtraction) | $24,978mn |
| Monthly net cash burn (= annual burn ÷ 12) | $2,081.5mn |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **41,894 ÷ 2,081.5 ≈ 20.1 months** |

Formula: runway = $41,894mn ÷ ($24,978mn ÷ 12) = $41,894mn ÷ $2,081.5mn ≈ **20.1 months**. On an annualised basis this is a $41,894mn ÷ $24,978mn ≈ **1.68× coverage multiple** of the stated obligations bucket (1.68 × 12 ≈ 20.1 months — the same figure, shown both ways per MODULE_RULES §8's units-matter warning).

**This 20.1-month figure explicitly excludes Oracle's guided AI-infrastructure growth capex** (management guides ≈$70bn net cash capex for FY2027, [`earnings/04_guidance-consensus.md`, Section 2]) — only the D&A-proxied maintenance-capex component ($8,109mn) is in the uses bucket, consistent with this module's formula (which asks for maintenance, not total, capex). That exclusion is deliberate but must be read alongside Section 4: if Oracle actually spends the guided ~$70bn of net capex from the same $41,894mn liquidity pool without securing the ~$40bn of new debt/equity financing management has said it plans to raise [`earnings/04_guidance-consensus.md`, Section 2, "Capital financing plan"], the effective runway collapses to roughly **5.8 months** (annual burn $86,869mn = $24,978mn − $8,109mn proxy + $70,000mn guided net capex; monthly burn $7,239mn; $41,894mn ÷ $7,239mn ≈ 5.8 months). Using FY2026's actual total capex ($55,663mn) instead of the FY2027 guidance figure gives an intermediate **~6.9 months**. These are stress illustrations, not the headline runway, but they are the more decision-relevant numbers for judging whether Oracle can fund its AI buildout without returning to the capital markets (see Section 4).

### Seasonality / Peak Liquidity Need (Hard Check)

Oracle's revenue and EBITDA margin are seasonal — fiscal Q4 (the May quarter-end) has been the largest revenue quarter and carried the highest EBITDA margin in each of the last three fiscal years, with Q4's revenue share rising each year (27.0% FY2024 → 27.7% FY2025 → 28.5% FY2026) [`earnings/01_historical-financials.md`, Section 5]. However, **no disclosed quarter-level working-capital cash-build figure** (e.g., a stated peak intra-year cash draw tied to this seasonality) exists in the data pool. Per the hard-check rule: **peak working-capital need not disclosed — runway may be overstated** on that dimension specifically. Separately — and more materially for Oracle — the real "peak need" risk here is not seasonal working capital but the AI-infrastructure capex ramp itself, which is structural rather than seasonal and is addressed directly in Section 4.

## 4. Sources & Uses Bridge

Internal sources do **not** cover the next 12 months on a standalone operating basis: FY2026 CFO ($31,977mn) fell far short of FY2026 capex ($55,663mn), and FY2027 is guided to widen that gap further (≈$70bn guided net capex against a CFO base that would need to grow roughly 30%+ just to keep pace). Against the narrower "true obligations" bucket used in Section 3 (debt maturities + interest + proxy maintenance capex + dividends, $24,978mn), Oracle's $41,894mn of already-in-hand committed liquidity (cash, short-term investments, and the fully available undrawn revolver) covers those obligations with a ~20-month runway — this portion is genuinely already-in-hand, not something that must materialize. But that comfort evaporates once the AI-infrastructure growth-capex program is added back in: management's own ≈$70bn FY2027 net capex guidance, funded mainly by a planned ≈$40bn of new debt and equity issuance (including a previously announced $20bn at-the-market equity program) [`earnings/04_guidance-consensus.md`, Section 2], means the bulk of Oracle's FY2027 liquidity need depends on **continued, open access to the capital markets**, not on cash already in hand or on FCF that must merely "hold up" — FCF is already guided to stay deeply negative regardless. The $31,289mn cash balance itself is a further caution: it is FY2026's freshly raised note and preferred-stock proceeds sitting on the balance sheet (Oracle raised $42.7bn of senior notes and $5.0bn of preferred stock during FY2026), not retained operating cash, so it is pre-funded capex dry powder that competes directly with the FY2027 capex program for the same dollars [`01`, Section 3].

## 5. Liquidity Read

On the true near-term-obligations basis (debt maturities, interest, a maintenance-capex proxy, and dividends), Oracle's runway is **≈20.1 months** — cash ($31.3bn), short-term investments ($0.6bn), and a fully available, non-borrowing-base $10.0bn revolver comfortably cover that $25.0bn annual bucket, and that cushion is already in hand today, not contingent on future cash generation. But this reading understates the real liquidity picture, because it deliberately excludes the ~$70bn of FY2027 net AI-infrastructure capex Oracle has guided to spend — folding that in collapses the effective runway to roughly **5.8–6.9 months**, and FCF (−$23.7bn reported / −$28.3bn normalised in FY2026, guided to stay deeply negative in FY2027) cannot bridge that gap; it is a net **user** of cash, not a source. The single biggest liquidity risk is not a near-term maturity default — it is that Oracle's capex program is now larger than its committed liquidity pool, so survival of the current spending pace depends on continued, open access to unsecured debt and equity markets (management's own ≈$40bn FY2027 financing plan) at the exact moment S&P has downgraded the issuer rating to BBB− (2026-07-09, one notch above non-investment grade) and Oracle's CDS spreads have widened to roughly an 18-year high [`02`, Section 5] — a market closure would not trigger a near-term default, but it would force a sharp, involuntary capex retrenchment within the next 12 months.



---

## balance-sheet-survival / 04_coverage-and-covenants.md

_Source: `04_coverage-and-covenants.md`_

# Coverage & Covenants — ORCL

Reporting currency: USD. Reporting standard: US GAAP. Fiscal year ended May-31-2026 ("FY2026"). All figures are FY2026 unless stated, sourced from Oracle's audited FY2026 Form 10-K (filed 2026-06-22) and Capital IQ Financials_Annual.xls, cross-checked against `01_capital-structure-and-leverage.md` and `earnings/01_historical-financials.md`. No `ciq_facts.json` sidecar exists for this run (checked in `_pool_extracts/`) — all figures below are this agent's own sourced read, computed and shown via an executed Python snippet (below each ratio's source note).

## 1. Coverage Ratios

Gross interest expense (FY2026) = **$4,599mn** [FY26 10-K, MD&A "Interest Expense"; CIQ Financials_Annual.xls Income Statement, "Interest Expense" row, FY26 column — up 29% y/y "primarily due to higher average borrowings from the issuances of $43.0 billion of senior notes in fiscal 2026"]. Interest income = $780mn, giving net interest expense = **$3,819mn** [CIQ Financials_Annual.xls Income Statement, "Interest and Invest. Income" / "Net Interest Exp." rows, FY26 column]. The revolver's own covenant is written on **net** interest expense ("Consolidated Net Interest Expense" — see Section 2), so both gross and net bases are shown throughout.

EBITDA basis: **$30,494mn, reported/GAAP-derived** (CIQ operating income $22,385mn + D&A $8,109mn) — the same canonical figure `01_capital-structure-and-leverage.md` Section 7 designates. Oracle discloses no company-defined non-GAAP EBITDA; an inferred adjusted figure (~$37,035mn, non-GAAP operating income $28,926mn + D&A) is shown as a memo only and labeled **Inference, not from filings** [`01_capital-structure-and-leverage.md` §5; `earnings/01_historical-financials.md` §4]. Per `earnings/06_earnings-quality.md`, this EBITDA is genuinely **cash-backed**: CFO/EBITDA was 104.9% reported (≈89.6% normalised, excluding a one-off customer-prepayment surge) in FY2026 and has exceeded 85% in every year since FY2023 — so the coverage ratios below are not being inflated by non-cash EBITDA.

Calculation run (Python, all figures USD mn):
```
EBITDA_reported=30494; EBIT_ciq=22385; EBIT_gaap=20606
gross_interest=4599; interest_income=780; net_interest=3819; capex=55663
EBITDA/gross interest = 30494/4599 = 6.63x
EBITDA/net interest   = 30494/3819 = 7.98x
EBIT(CIQ)/gross interest  = 22385/4599 = 4.87x
EBIT(GAAP)/gross interest = 20606/4599 = 4.48x
(EBITDA-capex)/gross interest = (30494-55663)/4599 = -5.47x
Fixed charges = gross_interest(4599) + sched. debt amort. next-12mo (5731) + lease cash paid (2548 op + 452 fin = 3000) = 13330
Fixed-charge coverage = (30494-55663)/13330 = -1.89x
```

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest (gross) | 6.63x | 30,494 / 4,599; [FY26 10-K, MD&A; CIQ Income Statement] |
| EBITDA / interest (net) | 7.98x | 30,494 / 3,819 — matches the covenant's own basis (Section 2) |
| EBIT / interest (CIQ EBIT convention, gross) | 4.87x | 22,385 / 4,599; CIQ EBIT excludes $1,779mn restructuring — see `01`'s note |
| EBIT / interest (GAAP operating income, gross) | 4.48x | 20,606 / 4,599; [FY26 10-K income statement] |
| (EBITDA − capex) / interest (gross) | **−5.47x** | (30,494 − 55,663) / 4,599 |
| Fixed-charge coverage: (EBITDA − capex) / (interest + next-12mo scheduled debt amortization $5,731mn + lease cash paid $3,000mn) | **−1.89x** | (30,494 − 55,663) / 13,330 |

**The headline finding is the last two rows, not the first two.** On EBITDA alone, interest is covered 6.6–8.0x — a wide multiple. But FY2026 capital expenditure ($55,663mn, +162% y/y, funding the AI-infrastructure data-center build-out) exceeds EBITDA by $25,169mn, so once capex is netted, coverage of interest and debt-like fixed charges is **negative on every basis computed**. Oracle is not generating enough operating profit to fund both its capex program and its interest bill — the FY2026 gap is being bridged by $42.7bn of new senior-note issuance and $5.0bn of preferred-stock proceeds [`01_capital-structure-and-leverage.md` §6], not by internally generated cash. This is consistent with FY2026 free cash flow of −$23,686mn reported (−$28,328mn normalised, excluding a customer-prepayment cash inflow) [`earnings/06_earnings-quality.md` §1].

## 2. Covenant Inventory

Only **one** maintenance financial covenant is disclosed anywhere in the FY26 10-K's debt note: the Revolving Credit Agreement's minimum interest-coverage test. No maximum-leverage covenant, no minimum-liquidity/net-worth covenant, and no other maintenance test is disclosed for any of Oracle's debt instruments (senior notes, commercial paper, term loan, or revolver) [FY26 10-K, Note on Debt — Revolving Credit Agreement, Term Loan Credit Agreements, Senior Notes]. This absence is itself informative, not a data gap to be filled with an assumed threshold: large unsecured investment-grade-style bond issuers typically carry negative covenants (liens, sale-leaseback limits) rather than maintenance financial covenants, and that pattern holds here. The partial-data "typical market covenant" assumption is therefore **not invoked** for a max-leverage test — none is contractually present per the disclosed terms — but see the labeled sensitivity note at the end of Section 3.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage | **Not present** — no such covenant disclosed for any Oracle debt instrument | n/a | n/a — not a contractual test | [FY26 10-K, Note on Debt, full instrument-by-instrument review] |
| Min interest coverage (Revolving Credit Agreement) | Consolidated EBITDA / Consolidated Net Interest Expense **≥ 3.0x**, tested at each fiscal quarter-end | 7.98x (net-interest basis, using reported EBITDA $30,494mn / net interest $3,819mn as a proxy for the credit agreement's defined terms — see quality note below); 6.63x on a conservative gross-interest basis | **+166.2%** (net-interest basis) / **+121.0%** (gross-interest, conservative alt.) | [FY26 10-K, Note on Debt — Revolving Credit Agreement: "ratio of 'Consolidated EBITDA' to 'Consolidated Net Interest Expense'... shall not be less than 3.0 to 1.0 at the end of any fiscal quarter"] |
| Min liquidity / net worth | Not disclosed | n/a | n/a | [FY26 10-K, Note on Debt] |
| Springing covenant trigger | **None** — the 3.0x coverage test is NOT springing; it applies continuously "at the end of any fiscal quarter during the period that the Revolving Credit Agreement is effective" | Active (always-on, not conditional on utilization) | n/a | [FY26 10-K, Note on Debt — Revolving Credit Agreement] |
| Equity cure rights | Not disclosed in the data pool | n/a | n/a | — |
| Other — Term Loan Credit Agreement 2 | Oracle states it "was in compliance with all debt-related covenants at May 31, 2026," which by its wording covers the Term Loan Credit Agreement 2 alongside the revolver, but the Term Loan's own covenant terms (if any beyond scheduled amortization) are **not itemized separately** in the filing text extracted | Unknown | Not assessable | [FY26 10-K, Note on Debt, p. covering both facilities] |

### Covenant EBITDA Definition & Quality (required — headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | The credit agreement defines "Consolidated EBITDA" and "Consolidated Net Interest Expense" as defined terms in the Revolving Credit Agreement itself; the 10-K states the covenant threshold but does **not** reproduce the definitions' addback schedule (the credit agreement exhibit is not in this data pool) | [FY26 10-K, Note on Debt] |
| Addbacks permitted (types) | **Not disclosed** in the pool | — |
| Addback caps / limits | **Not disclosed** in the pool | — |
| Is covenant EBITDA materially above reported EBITDA? | **Unknown — cannot be determined from available data.** This report uses reported EBITDA ($30,494mn) as a conservative proxy for "Consolidated EBITDA." Credit-agreement EBITDA definitions typically permit further addbacks (e.g., non-cash items, one-off restructuring beyond what's already excluded, pro forma synergies) that reported EBITDA may not fully capture — so the true covenant-defined ratio is more likely to be **higher** than the 6.63x–7.98x computed here, meaning the computed headroom is probably a **floor**, not a ceiling, on the company's true contractual headroom. This is the conservative-default reading (CLAUDE.md §4): use the disclosed, unadjusted figure rather than assume favorable addbacks not evidenced in the filing. | Inference, not from filings |

Per the module's hard rule, because headroom here is computed using an assumed/undisclosed EBITDA definition rather than the credit agreement's own defined term, **covenant-headroom confidence is capped** (MODULE_RULES.md, "Covenant headroom relies on assumed covenant-EBITDA addbacks → Covenant headroom max 60") even though the raw computed number (+121% to +166%) looks wide.

## 3. Headroom & Breach Proximity

Calculation run (Python):
```
threshold=3.0
EBITDA floor to breach (net-interest basis)  = 3.0 * 3,819 = 11,457mn -> decline of (30,494-11,457)/30,494 = 62.4%
EBITDA floor to breach (gross-interest basis) = 3.0 * 4,599 = 13,797mn -> decline of (30,494-13,797)/30,494 = 54.8%
Net interest could rise to 30,494/3.0 = 10,165mn (+6,346mn, +166%) before breach, EBITDA held flat
Implied incremental debt at an assumed 5.5% blended rate (labeled, mid-point of Oracle's disclosed 1.65%-6.90% senior-note range and its ~4.35% CP rate) = 6,346/0.055 ≈ $115,376mn — Inference, not from filings
```

| Metric | Value |
|---|---:|
| Tightest covenant | Min interest coverage (Revolving Credit Agreement), Consolidated EBITDA / Consolidated Net Interest Expense ≥ 3.0x — the ONLY maintenance covenant disclosed, so it is tightest by default |
| Headroom on tightest covenant (%) | +166.2% (net-interest basis, literal covenant definition) / +121.0% (gross-interest, conservative alt.) — both wide, but of **unknown definitional quality** (Section 2) |
| EBITDA decline that would breach it (approx.) | **−62.4%** (net-interest basis) to **−54.8%** (gross-interest basis) — EBITDA would need to fall from $30,494mn to roughly $11,457mn–$13,797mn, holding interest expense flat |
| Debt increase that would breach it (approx.) | Net interest expense would need to rise from $3,819mn to $10,165mn (+$6,346mn, +166%), holding EBITDA flat. At an assumed ~5.5% blended rate (labeled assumption, not from filings), that implies roughly **$115bn of incremental debt** — more than Oracle's entire current gross debt stack ($167,432mn all-in) — so this covenant is very unlikely to be tripped by debt growth alone; an EBITDA decline is the far more plausible breach path |

**A useful sensitivity, not a contractual test:** no max-leverage covenant exists in Oracle's disclosed debt terms (Section 2), but if one existed at a typical leveraged-borrower level of 4.0x–4.5x net debt/EBITDA (a labeled illustrative benchmark, not a covenant Oracle actually has), Oracle's own **net debt/EBITDA of 4.46x** (strict basis, reported EBITDA) [`01_capital-structure-and-leverage.md` §5] would already sit at or above that range. The absence of a leverage covenant — not distance from one — is what currently shields Oracle from a leverage-based default as it funds a debt-heavy capex program; this is flagged for `06_downside-stress-test`, not scored here.

## 4. Coverage / Covenant Read

Earnings comfortably cover interest on an EBITDA basis (6.63x gross / 7.98x net interest) and cash quality is not the problem — CFO/EBITDA of ~90–105% confirms the EBITDA is cash-backed, not accounting fiction (`earnings/06_earnings-quality.md`). But that comfort disappears the moment capex is netted: (EBITDA − capex)/interest is **−5.47x** and full fixed-charge coverage is **−1.89x**, because FY2026 capex ($55,663mn) exceeds EBITDA ($30,494mn) by $25,169mn — the AI-infrastructure build is being funded by new debt ($42.7bn of senior notes plus $5.0bn of preferred issued in FY2026), not by operating cash flow. Only one maintenance covenant is disclosed — a 3.0x minimum EBITDA/net-interest-expense test on the revolver — and Oracle sits at 7.98x, a computed headroom of +166.2% that would need a 62.4% EBITDA decline or a roughly $115bn debt-funded increase in interest expense to breach; but that headroom is calculated using reported EBITDA as a proxy for the credit agreement's own undisclosed "Consolidated EBITDA" definition, so its true quality is unverified and its confidence is capped per this module's addback-illusion rule. No maximum-leverage covenant exists to check the debt-funded capex ramp — the coverage test only bites if EBITDA collapses or interest expense balloons, neither of which is imminent, but that also means Oracle's growing leverage (net debt/EBITDA 4.46x, up from 3.83x two years ago) is not contractually constrained by any of its own disclosed debt terms.



---

## balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md

_Source: `05_off-balance-sheet-and-contingencies.md`_

# Off-Balance-Sheet & Contingencies — ORCL

Reporting currency: USD. Reporting standard: US GAAP. Fiscal year ends May 31 ("FY2026" = year ended May-31-2026). All figures are from Oracle's audited FY2026 Form 10-K (filed 2026-06-22) unless otherwise cited; cross-checked against `balance-sheet-survival/01_capital-structure-and-leverage.md` (canonical gross debt $167,432mn; net debt $136,143mn strict; total equity $43,056mn incl. preferred + noncontrolling interest, $37,554mn common-only) to avoid double-counting.

## 1. Off-Balance-Sheet / Debt-Like Obligations

| Item | Recognized Liability | Maximum / Gross Exposure | Already in 01's debt? | Source |
|---|---:|---:|---|---|
| Additional data-center lease commitments not yet commenced | $0 (not yet on balance sheet) | **$260,000mn** — undiscounted future lease payments, terms of 15–19 years, generally expected to commence Q1 FY2027 through FY2029 | **No.** 01's canonical gross-debt figure ($167,432mn) includes only the $30,190mn of operating-lease liabilities and $7,701mn of finance-lease liabilities already recognized on the balance sheet as of 31-May-2026. This $260,000mn is entirely incremental and is not captured anywhere in 01. | [FY26 10-K, Note 9 (Leases, Other Commitments and Certain Contingencies) — Leases: "As of May 31, 2026, we had $260 billion of additional lease commitments, substantially all related to data center arrangements, that are generally expected to commence between the first quarter of fiscal 2027 and fiscal 2029 and for terms of fifteen to nineteen years that were not reflected on our consolidated balance sheet"] |
| Operating & finance leases already recognized (for reference — not double-counted below) | $30,190mn operating + $7,701mn finance = $37,891mn | Same (recognized = fully on balance sheet) | Yes — already inside 01's $167,432mn canonical gross-debt figure | [FY26 10-K, Note 9, Supplemental Balance Sheet Information] |
| Pension / OPEB underfunding | $1,656mn net liability recognized in Long-Term Liabilities (projected benefit obligation $2,500mn vs. recognized net liability, i.e. plan is materially unfunded) | $1,656mn — fully recognized; no incremental off-balance-sheet exposure beyond the recorded amount | Noted in 01 Section 2 (not part of 01's canonical gross-debt total) | [CIQ Financials_Annual.xls, Pension/OPEB tab, FY2026 column: PBO $2,500mn; Net Asset/Liability Recognized on Balance Sheet −$1,656mn]. Note: the FY26 10-K itself carries no dedicated pension/OPEB note beyond an AOCL line ("Unrealized gains on defined benefit plans, net $150mn") — this plan is small relative to the $261.8bn balance sheet. |
| Unconditional purchase obligations (data-center power/infrastructure) | $0 recorded as a liability (disclosed as a future commitment, not a recognized liability, until goods/services are received) | $13,309mn (FY2027 $1,841mn / FY2028 $1,034mn / FY2029 $1,053mn / FY2030 $952mn / FY2031 $896mn / thereafter $7,533mn) **plus** a further $19,000mn of unconditional five-year purchase commitments for cloud-infrastructure assets entered into after FY26 year-end (subsequent event, also not recorded) | Noted in 01 Section 2 (not part of 01's canonical gross-debt total) | [FY26 10-K, Note 9 — Unconditional Obligations, maturities table, "Total $13,309" million; and "Subsequent to May 31, 2026, we entered into an additional $19 billion of unconditional purchase commitments for cloud infrastructure assets that commence in fiscal 2027 and have a term of five years"] |

State of the reporting currency: all figures above are in USD, Oracle's sole reporting currency (no material foreign-currency-denominated off-balance-sheet item requiring a separate FX conversion).

## 2. Guarantees & Letters of Credit

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| Data-center lessor-borrowing guarantee | $0 recorded as a liability (no accrued loss) | **$3.3bn** — Oracle has guaranteed up to $3.3bn of the lessor's borrowing on one data-center lease, maturing September 2026 | Third-party lessor / lender on a data-center lease within the $260,000mn additional-lease-commitment pool (Section 1) — a subset, not additive to it | [FY26 10-K, Note 9 — Leases: "These additional lease commitments include a lease for which we have guaranteed up to $3.3 billion of the lessor's borrowing, which matures in September 2026"] |
| IP-infringement / confidentiality / service-level indemnification (customer contracts) | $0 — "we have not incurred any material costs as a result of such indemnifications and have not accrued any material liabilities" | Indeterminate — Oracle states "It is not possible to determine the maximum potential amount under these indemnification agreements due to our limited and infrequent history of prior indemnification claims and the unique facts and circumstances involved in each particular agreement" | Cloud/software/hardware customers, contractually | [FY26 10-K, Note 9 — Guarantees] |
| Standby letters of credit / surety / performance bonds | Not disclosed | Not disclosed — the only related mention is a risk-factor sentence that a ratings downgrade "could... increase collateral, letter of credit or other credit support requirements under certain contractual arrangements," with no LC program, facility size, or outstanding balance quantified anywhere in the pool | n/a | [FY26 10-K, Item 1A (Risk Factors), credit-rating-downgrade risk factor] — **not disclosed in the data pool** beyond this contingent-trigger language |

## 3. Litigation & Tax Contingencies

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) | Source |
|---|---:|---:|---|---|
| Netherlands Privacy Class Action (The Privacy Collective vs. Oracle Nederland B.V., Oracle Corporation, Oracle America, Inc. and Salesforce) — GDPR / Dutch Telecommunications Act claims re: Data Management Platform | Not separately disclosed (Oracle accrues a liability only "if the potential loss... is considered probable, and the amount can be reasonably estimated"; no matter-specific accrual is quantified) | Not aggregated by Oracle — claim basis is €500/Dutch-internet-user "immaterial damages" + €100/Dutch-internet-user data-breach damages + a 10–25% litigation-funder cut of any award, i.e. a per-capita formula against an unstated but potentially large class; Oracle states it does not believe the matter "will have a material impact" | **Active / live.** On 30-Jan-2026 the Advocate General issued a non-binding opinion advising the Dutch Supreme Court to dismiss Oracle's grounds of appeal and to uphold the claimant's appeal in part; the Supreme Court's judgment was scheduled for 28-Jun-2026 — a date that has already passed as of this report's 14-Aug-2026 date, and no outcome is recorded anywhere in the data pool (10-K filed 22-Jun-2026, before the scheduled ruling; no subsequent Key Developments entry found). **Flagged as unresolved status, not dormant — conservative default applied (CLAUDE.md §4).** | [FY26 10-K, Note 15 (Legal Proceedings) — "Netherlands Privacy Class Action"] |
| Securities Class Action Regarding Oracle Cloud Infrastructure (D. Del., filed 3-Feb-2026, against Oracle, its CTO, both Co-CEOs, two other executives, and one board member) | Not disclosed / no accrual quantified | Not quantified — plaintiff "seeks damages and attorneys' fees and costs," no dollar figure stated; case is pre-amended-complaint (amended complaint due 14-Jul-2026, defendants' response due 16-Sep-2026) | **Active / live, early stage.** Company states it does not believe the matter "will have a material impact on our financial position or results of operations," but the case is still in its pleading stage with key deadlines (Sep/Dec 2026) still ahead. | [FY26 10-K, Note 15 (Legal Proceedings) — "Securities Class Action Regarding Oracle Cloud Infrastructure"]; corroborated by [Key Developments.xls, row 167: "Law Offices of Howard G. Smith Announces Filing of Class Action Lawsuit... on behalf of investors who purchased Oracle Corporation securities between June 12, 2025 and December 16, 2025"] |
| Other litigation (ordinary-course claims, including acquisition-related proceedings) | Not disclosed / no accrual quantified | Not quantified; Oracle states it does not believe outcomes "individually or in the aggregate, will result in losses that are materially in excess of amounts already recognized, if any" | Ongoing / routine — company's own language treats this bucket as immaterial | [FY26 10-K, Note 15 (Legal Proceedings) — "Other Litigation"] |
| Gross unrecognized income tax benefits (uncertain tax positions across multiple jurisdictions, incl. transfer pricing, transition tax, foreign tax credits, R&D credits under active US federal/state examination) | **$10,126mn** gross unrecognized tax benefit recorded within current/non-current income taxes payable, **+$2,706mn** of accrued interest & penalties (accrued as of 31-May-2026) = **~$13.2bn total recorded on the balance sheet** ($4.9bn of the $10,126mn would affect the effective tax rate if released) | Same as recorded — Oracle discloses no separate "maximum claimed by tax authorities" figure beyond the recognized reserve itself; this is a **recognized** contingent liability, not an incremental off-balance-sheet exposure | **Active** — US federal/state authorities are "currently examining income tax returns of Oracle and various acquired entities for years through fiscal 2024," with several issues "at an advanced stage in the examination process" | [FY26 10-K, Note 12 (Income Taxes) — Unrecognized Tax Benefits roll-forward table; FY26 10-K, Item 7 MD&A "Contractual Obligations" — "we had $13.2 billion of gross unrecognized income tax benefits, including related interest and penalties, recorded on our consolidated balance sheet"] |

Related-party context: `business-model/11_capital-allocation-governance.md` finds no related-party guarantees or controller-linked commercial contracts disclosed beyond the standard ASC 850 equity-method-investee note (Ampere Computing, divested Nov-2025) — no related-party contingent exposure identified [`business-model/11_capital-allocation-governance.md`, "Related-party transactions" row]. `business-model/12_red-flags-sweep.md` independently flags the Netherlands GDPR matter's adverse Advocate-General recommendation as under-surfaced upstream, consistent with the live status recorded above [`business-model/12_red-flags-sweep.md`].

## 4. Contingent Exposure Summary

| Metric | Value |
|---|---:|
| Total recognized contingent liabilities (pension underfunding $1,656mn + gross unrecognized tax benefits incl. interest/penalties $13,200mn) | **$14,856mn** |
| Total maximum / gross exposure (additional lease commitments $260,000mn + unconditional purchase commitments $13,309mn + subsequent purchase commitments $19,000mn + pension $1,656mn + tax $13,200mn; excludes the indeterminate IP-indemnification and litigation items, which cannot be quantified) | **$307,165mn** |
| Max exposure ÷ recognized | **20.7x** (307,165 / 14,856) |
| Max exposure ÷ total equity ($43,056mn, incl. preferred + NCI, per 01) | **7.13x (713%)** — or 8.18x (818%) against common equity only ($37,554mn) |

The $3.3bn lessor-borrowing guarantee (Section 2) is a subset of the $260,000mn lease-commitment pool and is not added separately to avoid double-counting.

## 5. Contingency Read

The single largest off-balance-sheet exposure by a wide margin is the **$260,000mn of additional data-center lease commitments** Oracle has already signed but not yet reflected on its balance sheet — commitments generally expected to start between Q1 FY2027 and FY2029, running 15–19 years, and including a $3.3bn direct guarantee of a lessor's borrowing that matures September 2026 [FY26 10-K, Note 9]. This is live, not remote: it is contracted capacity for the AI-infrastructure buildout that `01_capital-structure-and-leverage.md` already shows is pushing net debt from $83,960mn (FY2024) to $136,143mn (FY2026) and consuming more cash than EBITDA generates (FY2026 levered free cash flow was −$23,686mn per 01). As these leases commence over the next one to three years, they will convert from an off-balance-sheet commitment into recognized lease liabilities layered on top of an already-rising, S&P-downgraded (BBB-, 2026-07-09) debt stack — a second wave of debt-like obligations roughly 1.9x the size of Oracle's current all-in gross debt ($167,432mn). If even the FY2027–FY2029 tranche of this commitment (commencing in the near term) converts to on-balance-sheet liabilities as scheduled, it would materially compound the leverage trajectory 01 already flags as rising, independent of how the two active litigation matters (the Netherlands GDPR class action, now carrying an adverse non-binding Advocate-General recommendation with an unresolved Supreme Court ruling scheduled for a date that has already passed with no outcome in the data pool, and the early-stage Oracle Cloud Infrastructure securities class action) resolve.

RF-OBS-001 (contingent-liability spike)



---

## balance-sheet-survival / 06_downside-stress-test.md

_Source: `06_downside-stress-test.md`_

# Downside Stress Test — ORCL

Reporting currency: USD throughout. Reporting standard: US GAAP. Fiscal year ends May 31 ("FY2026" = year ended 2026-05-31). All figures are drawn from `01_capital-structure-and-leverage.md`, `02_maturity-wall-and-refinancing.md`, `03_liquidity-runway.md`, and `04_coverage-and-covenants.md` (all sourced to Oracle's audited FY2026 Form 10-K, filed 2026-06-22, and Capital IQ exports as of 2026-08-13), cross-checked against `earnings/06_earnings-quality.md` and `earnings/03_margin-drivers.md`. No pending or recently-announced material acquisition is disclosed anywhere in the data pool (`business-model/11_capital-allocation-governance.md` records $0 M&A cash outflow in FY2024–FY2026), so the pro-forma acquisition check in this agent's workflow (step 2a) does not apply — this stress test runs against Oracle's actual, reported FY2026 balance sheet. Every stressed figure below was produced by an executed Python snippet; the snippet and its output are shown inline.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA (cash-backed) | $30,494mn (reported/GAAP-based: CIQ operating income $22,385mn + D&A $8,109mn) | [`01` §5, §7; `04` §1] |
| Net debt | $136,143mn (strict basis, §15; all-in gross debt $167,432mn − cash $31,289mn) — the basis `01` §7 designates as canonical for this module | [`01` §4, §7] |
| Net debt / EBITDA | 4.46x | [`01` §5] |
| EBITDA / interest | 6.63x (gross interest $4,599mn) / 7.98x (net interest $3,819mn) | [`04` §1] |
| Tightest covenant + threshold | Only one maintenance covenant disclosed anywhere in Oracle's debt terms: Revolving Credit Agreement, Consolidated EBITDA ÷ Consolidated Net Interest Expense **≥ 3.0x**, tested every fiscal quarter-end (MIN/floor covenant) | [`04` §2] |
| Next-12m obligations | $24,978mn = debt maturities $7,210mn + cash interest $3,896mn + maintenance-capex proxy (D&A) $8,109mn + committed dividends (common + preferred) $5,763mn | [`03` §2] |
| Committed liquidity | $41,894mn = cash & equivalents $31,289mn + short-term investments $605mn + fully available, non-borrowing-base undrawn revolver $10,000mn | [`03` §1] |
| Floating-rate debt (gross) | $6,137mn (4.5% of the notes-payable + finance-lease book) | [`02` §3] |
| Hedge coverage | $4,700mn of the Term Loan's floating balance swapped to an effective 4.74% fixed rate; floating exposure net of hedges ≈ $1,437mn (≈1.0% of the debt book) | [`02` §3] |
| Working-capital seasonality / peak build | No disclosed quarterly peak working-capital draw (`03` flags this as a hard-check gap). Separately, accounts-payable days (DPO) stretched from 42.9 to 127.6 days over FY2024–FY2026 as Oracle extends vendor terms to help fund the capex ramp — a real reversal risk, used below as the labeled working-capital shock | [`03` §"Seasonality"; `earnings/06_earnings-quality.md` §3] |

Reporting currency: USD. EBITDA basis: **reported/GAAP EBITDA ($30,494mn)**, not the inferred ~$37,035mn adjusted figure — Oracle discloses no company-defined adjusted EBITDA, and `earnings/06_earnings-quality.md` confirms the reported figure is genuinely cash-backed (CFO/EBITDA = 104.9% reported, ≈89.6% normalised for a one-off customer-prepayment surge, and has exceeded 85% in every year since FY2023), so this is the correct base per this agent's instruction to use cash-backed EBITDA over headline-adjusted EBITDA. `business-model/07_business-quality.md` scores Oracle's cyclicality at 38/100 (mid-band) — the hard rule requiring a history-calibrated trough scenario for a "deep cyclical/commodity name" is **not triggered**. That said, `business-model/10_external-dependency.md` scores AI-infrastructure industrial-cycle dependency at 72/100 (High, inverted), and FY2026's reported EBITDA margin (45.3%) is the highest of the last five years, aided by a record 49.5% Q4 margin — this base EBITDA is a high-water mark, not a normalised figure, and that caution carries into the haircuts below.

## 2. Stress Scenarios

Calculation run (Python):
```
EBITDA=30494.0; net_debt=136143.0; gross_interest=4599.0; net_interest=3819.0; threshold=3.0
for h in [0, 0.30, 0.40, 0.60]:
    e = EBITDA*(1-h)
    lev = net_debt/e
    cov_g = e/gross_interest; cov_n = e/net_interest
    hr_n = (cov_n-threshold)/threshold; hr_g = (cov_g-threshold)/threshold

Result:
h=0%:  EBITDA=30,494  net_lev=4.46x  cov_gross=6.63x  cov_net=7.98x  headroom_net=+166.2%  headroom_gross=+121.0%
h=30%: EBITDA=21,346  net_lev=6.38x  cov_gross=4.64x  cov_net=5.59x  headroom_net=+86.3%   headroom_gross=+54.7%
h=40%: EBITDA=18,296  net_lev=7.44x  cov_gross=3.98x  cov_net=4.79x  headroom_net=+59.7%   headroom_gross=+32.6%
h=60%: EBITDA=12,198  net_lev=11.16x cov_gross=2.65x  cov_net=3.19x  headroom_net=+6.5%    headroom_gross=-11.6% (BREACH on gross basis)
```
Net debt is held constant across haircuts (no offsetting paydown or draw assumed) — this is the conservative, standard convention for an EBITDA-only stress. The −40%+WC-shock and −40%+rates scenarios below layer a labeled liquidity/rate shock onto the −40% EBITDA case.

**Working-capital shock (labeled assumption):** accounts payable reverting from FY2026's stretched 127.6-day DPO back to FY2025's 80.5-day level, at FY2026 cost-of-revenue ($23,021mn), implies AP falling from $10,977mn to ≈$5,077mn — a **$5,900mn cash outflow** [`earnings/06_earnings-quality.md` §3]. This is used in place of an undisclosed seasonal-build figure (MODULE_RULES §B1), since no quarterly working-capital peak is disclosed.

**Rate shock:** +200bps applied to the ≈$1,437mn of floating-rate debt net of hedges → **+$28.7mn** of additional annual interest [Calc: 1,437 × 0.02 = 28.7]. This is immaterial relative to Oracle's $4,599mn gross interest bill because only ≈1% of the debt book is genuinely floating net of the Term Loan swap [`02` §3] — shown in the table for completeness, but it moves coverage by only ~0.03x.

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA | $30,494mn | $21,346mn | $18,296mn | $12,198mn | $18,296mn | $18,296mn |
| Net debt / EBITDA | 4.46x | 6.38x | 7.44x | 11.16x | 7.44x | 7.44x |
| EBITDA / interest (net-interest basis, matches covenant) | 7.98x | 5.59x | 4.79x | 3.19x | 4.79x | 4.76x |
| EBITDA / interest (gross-interest, conservative alt.) | 6.63x | 4.64x | 3.98x | 2.65x | 3.98x | 3.95x |
| Tightest covenant headroom (net-interest basis; MIN/floor: (actual−3.0)/3.0) | +166.2% | +86.3% | +59.7% | **+6.5%** | +59.7% | +58.5% |
| Covenant breach? (Y/N) | N | N | N | **N (net-int.) / Y (gross-int., conservative alt.) — marginal, basis-dependent** | N | N |
| 12-month liquidity gap (uses − committed liquidity; negative = surplus) | −$16,916mn | −$16,916mn | −$16,916mn | −$16,916mn (or −$6,916mn if revolver access is lost on a covenant breach) | −$11,016mn | −$16,887mn |
| Survives without external action? (Y/N) | Y | Y | Y | **Marginal — Y on the covenant's own literal (net-interest) basis, N on the conservative gross-interest alt.** | Y | Y |

**Why the liquidity-gap row barely moves with EBITDA alone:** the $24,978mn near-term uses bucket (debt maturities, cash interest, a maintenance-capex proxy, dividends) is contractual/discretionary, not EBITDA-linked in the next 12 months — so an EBITDA haircut alone does not mechanically widen it. This is a real finding, not an oversight: it means the covenant, not this narrow liquidity bucket, is the first thing an EBITDA-only shock threatens. But this narrow bucket **deliberately excludes** Oracle's guided ≈$70bn of FY2027 growth capex (per `03` §3) — Section 3 below shows what happens once that capex is put back in.

**Deep-cyclical calibration:** not triggered (see Section 1) — no additional history-calibrated haircut is added. As a substitute caution, note that FY2026's 45.3% EBITDA margin is a five-year high; a reversion toward the 38–41% margin band seen in FY2023–FY2025 (`01` §5) would itself act like an EBITDA haircut of roughly 9–15% even before any further AI-demand shock, tightening every ratio above.

## 3. Break Points

Calculation run (Python):
```
# (a) Covenant breach — MIN/floor coverage covenant, T=3.0x, interest held constant
h_net   = 1 - (3.0*3819.0)/30494.0   = 0.6243  -> 62.4%
h_gross = 1 - (3.0*4599.0)/30494.0   = 0.5476  -> 54.8%

# net leverage vs illustrative refi threshold, T=6.0x (labeled illustrative — Oracle has no max-leverage covenant; see 04 §3)
h_lev = 1 - 136143.0/(6.0*30494.0) = 0.2559 -> 25.6%

# (b) Liquidity exhaustion — narrow "hard obligations" basis (debt maturities + dividends only;
#     interest & capex already sit inside FCF, so they are NOT added again, per MODULE_RULES §8)
usable_liquidity = 41894.0
obligations_narrow = 7210.0 + 5763.0 = 12973.0   # debt maturities + committed dividends
FCF_base(reported, FY26)    = -23686.0
FCF_base(normalised, FY26)  = -28328.0
tax = 0.126  (FY26 GAAP effective tax rate, earnings/06 §8)
stressed_FCF(h) ≈ FCF_base − EBITDA·h·(1−tax)
Solve usable_liquidity + stressed_FCF(h) = obligations_narrow:
  reported basis:    h = 0.1964 -> 19.6%
  normalised basis:  h = 0.0222 -> 2.2%
# Alternate: narrow "hard-obligations-only" basis used by 03 (uses=$24,978mn incl. only maintenance-capex
# proxy, no FCF subtraction) is NOT EBITDA-linked -> does not breach on EBITDA decline alone (h>=1)
```

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches | **−62.4%** on the covenant's own literal net-interest-expense basis (EBITDA would need to fall from $30,494mn to $11,457mn, interest held flat); **−54.8%** on the conservative gross-interest alternative (used because the exact covenant-EBITDA addback definition is undisclosed — `04` §2 flags this and caps headroom confidence at 60/100). Both are well beyond the standard −60% haircut in Section 2, which is why the −60% row shows only a marginal, basis-dependent breach. |
| Committed liquidity exhausted within 12 months | **Basis-dependent, and this is the single most important number in this report.** On the narrow "hard obligations only" basis (maintenance capex proxied by D&A, no FCF netting — the basis `03` itself uses, because reported FCF is dominated by discretionary growth capex) this does **not** breach on EBITDA decline alone (h ≥ 1). But once actual free cash flow (which nets Oracle's real, guided capex spend) is used instead, the picture flips sharply: solving `usable liquidity + stressed FCF(h) = debt maturities + dividends` gives **h ≈ +19.6%** using FY2026's reported FCF (−$23,686mn) as the base, or **h ≈ +2.2%** using the §15-normalised FCF (−$28,328mn, which strips out a one-off customer-prepayment surge that management guides will actually *recur* into FY2027 — so the reported-FCF figure is arguably the better forward base here, labeled: Inference, not from filings). **Under this reading, a decline as shallow as 2–20% in EBITDA — well inside a normal-recession range, not a tail scenario — could exhaust Oracle's committed liquidity within 12 months, PROVIDED capex is held at its current pace and is not cut back.** That proviso is the load-bearing assumption; see Section 4. |
| Net leverage exceeds 6.0x (illustrative refi-market threshold — Oracle has no max-leverage covenant of its own; `04` §3 notes a typical leveraged-borrower band of 4.0x–4.5x, and Oracle's own current net debt/EBITDA of 4.46x already sits at the low end of that band) | **−25.6%** — shallower than the standard −30% haircut. At −30% EBITDA alone, net leverage is already 6.38x. |

## 4. Survival Read

The one disclosed covenant is wide and does not break inside the standard 30–60% haircut range on its own literal terms (breaches only past a 62.4% EBITDA decline), but that headline masks two more binding constraints: net leverage crosses a typical refinancing-sensitive threshold (6.0x) at just a 25.6% decline — shallower than a normal-recession −30% haircut — and, more importantly, Oracle's committed liquidity ($41.9bn) is not actually being tested against maintenance-level spending; it is being run down by a ≈$56bn (FY2026 actual) to ≈$70–95bn (FY2027 guided) capex program that is roughly double the size of the EBITDA it is meant to be measured against. On that real-spending basis, the liquidity break point falls to somewhere between a 2% and 20% EBITDA decline — inside normal-recession territory, not a tail event — **provided capex is not cut**. A 30–40% EBITDA decline is not mechanically survivable if Oracle keeps building at its current pace: it would need to draw the revolver, delay or cancel data-center commitments (a portion of the disclosed $260bn of additional, not-yet-commenced lease commitments — `05` §1), issue new debt or equity into a market where S&P has already cut the issuer rating to BBB− (2026-07-09, one notch above non-investment grade) and CDS spreads sit near an 18-year high [`02` §5], or seek a covenant waiver if the coverage test is later read on the conservative gross-interest basis. The single most plausible, and most likely, exit is a **capex retrenchment** — management itself has signaled that lever is available. **Market closure test (no new unsecured issuance for 12 months):** cash ($31.3bn) plus the undrawn revolver ($10.0bn) — $41.3bn — would still cover the FY2027 notes-payable maturity ($7.2bn) plus lease payments (≈$4.4bn) several times over [`02` §5], so Oracle does **not** default on its debt service under closed markets; what breaks is the AI-infrastructure buildout itself, which depends on ≈$40bn of planned new debt and equity issuance that a closed market removes. Oracle is **not** net cash (net debt $136,143mn, strict basis) and does not earn the module's strongest survival read; a normal 30–40% EBITDA decline is survivable for debt service, but not survivable for the capital program as currently guided, without one of a capex cut, a fresh capital raise, or (in the deepest, least likely case) a covenant waiver.
