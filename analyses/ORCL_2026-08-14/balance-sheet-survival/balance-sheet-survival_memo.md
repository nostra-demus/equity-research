# Balance-Sheet-Survival Module Memo — ORCL

**Verdict: Stretched** — Oracle's debt payments survive a shut capital market for 12 months, but the AI-data-centre building program it is actually running does not, without a spending cut or fresh money.

Memo date: 2026-08-14. Source: `99_balance-sheet-survival-synthesis.md` (this module's synthesis). Every number below is carried from that file.

---

## Scores at a Glance

| Score | /100 | What drove it (from the synthesis) |
|---|---|---|
| Solvency strength | **45** | Rising leverage; funded by capex, not covenant-constrained; S&P at BBB−, one notch above junk; $260bn of signed-but-unrecognized lease commitments layered on top |
| Liquidity runway | **42** | Headline 20.1 months is real cash in hand, but the decision-relevant figure once guided capex is included is 5.8–6.9 months |
| Refinancing risk *(inverted — higher is worse)* | **58** | The near-term maturity wall is thin and manageable; the live constraint is continued market access, given a +180bp to +300bp refinancing cost step-up, the BBB− downgrade and an 18-year-high CDS spread |
| Covenant headroom | **55** | Nominal headroom is wide (+166.2% / +121.0%), but its quality is unverified — **capped at max 60** because the credit agreement's own EBITDA-addback definition is not in the data pool |
| Downside resilience | **38** | Debt service and the disclosed covenant survive a 60% EBITDA haircut and a 12-month market closure; the capex program does not survive a shallow, plausible EBITDA decline |
| Data quality | **85** | Full audited debt note, instrument-level maturity schedule, cash flow statement, lease note and contingency note all present; only the covenant-EBITDA addback text is missing |
| Overall usefulness | **85** | A complete, reproducible survival picture with one soft gap |

**Score caps applied:** one. Covenant headroom is capped at max 60/100 because reported EBITDA was used as a stand-in for the credit agreement's own undefined "Consolidated EBITDA" (Exhibit 10.14 is not in the pool). No other hard cap applies; the module's data sufficiency is otherwise uncapped per the `00` triage verdict. The cross-module refresh described below neither introduces nor lifts a cap.

**§24 Avoid-Big-Risks:** the synthesis carried no separate filter-trip list for this module. It raised one red flag — **RF-OBS-001 (contingent-liability spike)**: $260,000mn of additional, not-yet-recognized data-centre lease commitments, roughly 1.9x current all-in gross debt, converting over FY2027–FY2029.

---

## What This Module Found

Oracle owes much more against what it earns than it did two years ago, and the trend is still worsening. Net debt — all borrowings minus cash — is $136,143mn on the strict basis (§15): all-in gross debt of $167,432mn including capitalized operating leases, less $31,289mn of cash and equivalents. Against reported EBITDA of $30,494mn (rough cash profit before interest, tax and depreciation), that is net leverage of 4.46x — years of that cash profit needed to repay the net debt — up from 3.83x in FY2024 and 4.40x in FY2025. On an inferred adjusted EBITDA of ~$37,035mn it is 3.68x, but that adjusted figure is inference, not company-disclosed.

The rise came entirely from borrowing to build AI data centres, not from takeovers or buybacks: FY2026 total debt rose 54% in one year on $42.7bn of new senior notes plus $5.0bn of preferred stock, and management has guided a further ~$70bn of net capex (spending on buildings and equipment) for FY2027. That changes the shape of the risk — the fragility is largely optional, because capex can be cut, rather than structural.

The near-term repayment schedule is not the problem. Only 5.5% ($7,210mn) of the $130,105mn notes-payable-and-term-loan base falls due within 12 months and 13.3% ($17,355mn) within 24 months, covered several times over by cash plus the undrawn $10.0bn revolving credit line, even under a 12-month market-closure test with zero new unsecured issuance.

The problem is the building program measured against the same pot of money. The liquidity runway — how long committed cash covers unavoidable obligations — is ~20.1 months on a maintenance-spending basis (debt maturities, cash interest, a maintenance-capex proxy and committed dividends, with no free-cash-flow netting because free cash flow is negative). Fold the guided ~$70bn FY2027 growth capex back in and the same $41,894mn of committed liquidity lasts ~5.8–6.9 months, and is exhausted at an EBITDA decline of just **−2.2% to −19.6%**, provided capex is not cut. That is inside normal-recession range, not a tail event.

The one contractual guardrail will not stop it. The only maintenance covenant disclosed anywhere in Oracle's debt terms — a promise written into the loan agreement — is the Revolving Credit Agreement's minimum interest coverage: EBITDA of at least 3.0x net interest expense. Actual coverage is 7.98x on the net-interest basis that matches the covenant's wording and 6.63x on the more conservative gross-interest basis, so headroom (the slack before it breaks) is +166.2% / +121.0%, and the covenant does not break until EBITDA falls 62.4% or 54.8% respectively. Coverage after capex tells the opposite story: (EBITDA − capex) / interest is −5.47x, because the build is funded by new debt and preferred issuance, not by operating cash.

Biggest single risk, in one line: committed liquidity is being measured against a maintenance-spending bucket while Oracle actually runs a ~$56–95bn capex program roughly double its EBITDA — so liquidity, not the covenant and not the maturity wall, is the first thing that breaks. The killer version is a capital-markets closure that lands while Oracle keeps spending at the guided pace [`06`, Section 3–4].

Two things cut the other way. Debt service itself survives a full 12-month market closure without default [`02`, Section 5; `06`, Section 4]. And the most plausible fix — a capex retrenchment — sits entirely inside management's control and has already been signalled as available [`06`, Section 4].

---

## The Specialists, Briefly

- **solvency-data-triage** — Sufficient; all six sections ran, no hard caps triggered. One soft flag: the revolver's covenant-EBITDA addback definition (Exhibit 10.14) is not in the pool.
- **capital-structure-and-leverage** — Net debt / EBITDA 4.46x, up from 3.83x two years ago; all-in gross debt $167,432mn. The increase is entirely debt-funded AI-infrastructure capex, not M&A or buybacks; S&P cut to BBB− on 2026-07-09.
- **maturity-wall-and-refinancing** — Exposed, because it depends on open markets. The near-term wall (5.5% / 13.3%) is covered in isolation, but the same liquidity pool must also fund the ~$70bn FY2027 capex program.
- **liquidity-runway** — ~20.1 months on the maintenance basis, ~5.8–6.9 months with guided growth capex. The $31.3bn of cash is freshly raised debt and preferred proceeds — pre-funded capex dry powder, not surplus liquidity.
- **coverage-and-covenants** — EBITDA / interest is wide at 6.63x–7.98x, but (EBITDA − capex) / interest is −5.47x; coverage is negative on every basis once capex is netted.
- **off-balance-sheet-and-contingencies** — RF-OBS-001: $260,000mn of not-yet-recognized data-centre lease commitments dwarf the recognized $167,432mn debt stack — a second wave of debt-like obligations, roughly 1.9x current all-in gross debt, converting over FY2027–FY2029.
- **downside-stress-test** — Marginal and basis-dependent: the covenant survives to −62.4%, but real liquidity breaks at −2.2% to −19.6%. The disclosed covenant is a false comfort signal.

**Disagreements, as the synthesis resolved them.** The most important: Capital IQ's own Capital Structure Summary tab computes total debt / EBITDA of 5.03x, implying an EBITDA base near $33.3bn — about 9% above the $30,494mn this module uses throughout. The synthesis kept $30,494mn, because it traces line-by-line to the 10-K's own operating income and depreciation, and flagged the higher vendor figure as an unexplained internal convention rather than adopting it. It also treated the 2026-07-09 S&P downgrade (BBB− from BBB, A-3 from A-2) as confirmed while leaving the forward outlook unresolved, since the underlying feed carries conflicting "Stable" and "Negative" labels for the same entry; and it read the −60% EBITDA stress case as not a breach under the covenant's literal wording (+6.5% net-interest headroom), while flagging it as marginal and basis-dependent (−11.6% on the gross-interest basis).

**Cross-module refresh, carried for completeness.** The business-model module's capital-allocation-and-governance specialist was re-run after this module's own specialists finished, and its score moved 42→41/100 on new FY25 DEF 14A detail: recurring but dollar-immaterial related-party dealings (~0.02% of revenue) between Oracle and Executive Chair Larry Ellison's own entities, and Ellison's pledging of 346,000,000 shares — 29.9% of his own stake, ~12% of all shares outstanding — as collateral for personal loans. Both were independently reviewed by the Governance Committee and neither trips a §13 disqualifier threshold, and the business-model verdict did not change. The synthesis's ruling: this is a governance-ownership fact about the controlling insider, not a fact about Oracle's debt, cash, EBITDA, covenant terms or contingent liabilities, so it changes no score, no cap, and not the Stretched verdict here.

---

## What Would Change This Read

**Would strengthen it:** a disclosed, executed capex-flexing plan — evidence Oracle can and will cut the ~$70bn FY2027 guide if funding tightens; successful completion of the ~$40bn FY2027 financing plan at reasonable spreads; a stabilized or upgraded credit rating; EBITDA margin holding at or above the FY2026 45.3% high-water mark through a full cycle.

**Would weaken it:** a further S&P or Moody's downgrade into speculative grade; failure to complete the ~$40bn financing plan; the Netherlands GDPR class action or the OCI securities class action resolving adversely with a material damages award; the $260bn of lease commitments converting onto the balance sheet faster than guided; EBITDA margin reverting to the FY2023–FY2025 38–41% band.

**Data needed:** the credit agreement's own "Consolidated EBITDA" and "Consolidated Net Interest Expense" addback definitions (Exhibit 10.14); a standalone Moody's / S&P / Fitch rating-rationale report; management's disclosed capex-flexing commitments, if any, beyond earnings-call commentary.

---

## Bottom Line

- **Verdict: Stretched.** Debt service survives a closed capital market for 12 months; the AI-infrastructure buildout does not, without a capex cut, a fresh capital raise or — least likely — a covenant waiver.
- **Could be better than it looks:** the leverage is discretionary growth capex, not a debt-funded acquisition or an operating deterioration, so the fix is in management's own hands. The $10.0bn revolver is committed, unsecured, non-borrowing-base and $0 drawn as of 2026-05-31, and a ≈$40bn FY2027 financing plan including a $20bn at-the-market equity program is already flagged [`03`, Sections 1 and 4].
- **Could be worse than it looks:** $260,000mn of signed data-centre lease commitments start converting onto the balance sheet from FY2027 — roughly 1.9x the entire current recognized debt stack — and Oracle has no contractual maximum-leverage covenant to slow the borrowing. A further downgrade could itself raise collateral and credit-support requirements.
- **Missing evidence:** the credit agreement's own EBITDA-addback definition — the reason covenant headroom is capped at 60 — and a primary rating-agency rationale; the S&P BBB− read comes from the Capital IQ vendor feed. That is the single highest-value next data request.
- **Watch next:** whether the guided ~$70bn FY2027 capex is actually flexed down or funded with new issuance, because liquidity — not the covenant, not the maturity wall — is what breaks first, at an EBITDA decline as shallow as 2%–20%.

---

## Plain-English Glossary

- **EBITDA** — rough cash profit before interest, tax and depreciation; $30,494mn reported for FY2026.
- **Net debt (strict basis)** — all borrowings minus cash; $136,143mn.
- **Net debt / EBITDA (net leverage)** — years of that cash profit needed to repay net debt; 4.46x.
- **Maturity wall** — how much debt comes due and when; 5.5% within 12 months, 13.3% within 24 months.
- **Revolver (revolving credit line)** — a pre-agreed bank facility a company may draw on; Oracle's $10.0bn is undrawn.
- **Liquidity runway** — how many months committed cash covers unavoidable obligations; ~20.1 months on maintenance spending, ~5.8–6.9 months with guided capex.
- **Capex** — spending on buildings and equipment; guided ~$70bn for FY2027.
- **Covenant / covenant headroom** — a promise written into a loan agreement, and the slack before it is broken; EBITDA must stay at or above 3.0x net interest, with +166.2% / +121.0% slack.
- **Free cash flow** — operating cash left after capex; negative here, which is why no free cash flow is netted against the runway.
- **CDS spread** — the annual cost of insuring a company's debt against default; roughly an 18-year high in August 2026.
- **BBB−** — the lowest investment-grade credit rating, one notch above non-investment grade ("junk").
- **Basis points (bp)** — hundredths of a percentage point; the refinancing cost step-up is +180bp to +300bp.
- **At-the-market equity program** — selling new shares gradually into the open market; $20bn planned.
- **Related-party dealing** — business done between the company and a person who controls or runs it; ~0.02% of revenue here.
- **Share pledging** — an owner posting their own shares as loan collateral; 346,000,000 shares, ~12% of shares outstanding.
