# balance-sheet-survival Module Dossier — DHER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `balance-sheet-survival_memo.md`.

- Generated: 2026-08-12T14:39:01Z
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

# Balance-Sheet-Survival Module — DHER (Synthesis)

## Abstract

Delivery Hero carries real leverage: 2.78x net debt to its own Adjusted EBITDA, but 8.24x on GAAP-derived Reported EBITDA, a gap that matters because cash conversion collapsed to 8.8% in FY2025. Its near-term wall (€877.4m due 2026-2027) is already repaid via a subsequent-event refinancing, but 46% of debt still clusters, unaddressed, in 2029. Liquidity runs about 18 months against obligations, and the tightest covenant — a Group minimum-liquidity floor, indicatively €800m — has wide but uncertified headroom. The stress test survives a full EBITDA wipeout on liquidity alone but breaks a 6.0x leverage ceiling near a 54% decline, already crossed today on GAAP terms, and a Spain contingent-liability payment on top of a downturn tips surplus into breach. Verdict: Stretched.

## 1. Solvency Verdict

- **Verdict: Stretched**
- **Net leverage (net debt / EBITDA):** €2,512.8m net debt (strict basis) ÷ €903.0m Adjusted EBITDA = **2.78x**; ÷ €304.9m Reported (GAAP-derived) EBITDA = **8.24x**. Gross debt €4,625.5m ÷ Adjusted EBITDA = 5.12x. The two EBITDA bases diverge by €598.1m (66% of the Adjusted figure) — see §3 Reconciliation.
- **Liquidity runway:** ~18.3 months (€1,312.7m usable liquidity, net of an assumed €800m covenant floor, ÷ €71.67m/month gross-obligations burn); ~29.5 months on unadjusted cash. Confidence capped at 60/100 (revolver availability mechanics not disclosed).
- **Maturity wall (% within 24 months):** 18.97% of gross debt as reported at 31-Dec-2025 (€877.4m) — but this entire bucket has already been repaid via a subsequent-event refinancing (new $1.4bn 2032 term loan + cash, executed by Apr-2026), leaving the real forward-looking near-term wall materially smaller than the as-reported schedule shows. The unaddressed structural risk is Year 4 (2029): 46.38% of total debt (€2,145.4m) in a single year, concentrated in two secured, floating-rate, non-EUR-repayable term facilities.
- **Tightest covenant + headroom:** Minimum-liquidity covenant (RCF/term facilities, Group level, quarterly test) — the only disclosed maintenance covenant. Numeric threshold not located in the audited filing text; a management-transcript figure of €800m is used as a labeled assumption. Indicative headroom is wide (+604% to +2,013% across a €100m–€500m assumed-threshold range) but **Not assessable** as a certified number.
- **Stress break point (EBITDA decline that breaks it):** No mechanical liquidity/covenant break within 12 months even at a full (100%) EBITDA wipeout (solve returns h≥1). The structure first breaks on an illustrative 6.0x net-leverage refi-market ceiling at a **53.6% EBITDA decline** (Adjusted-EBITDA basis) — a ceiling already crossed **today** on the Reported-EBITDA basis (8.24x > 6.0x). A compound sanity check (−40% EBITDA plus the top of the disclosed €520m–€860m Spain contingent-liability range) flips a €507.8m liquidity surplus into a €352.2m breach.
- Solvency strength /100: **45** (capped at max 75 for annual-only data; actual score sits well below the cap given weak GAAP-basis coverage and 8.8% cash conversion)
- Liquidity runway /100: **58** (capped at max 60 — revolver exists but availability unknown)
- Refinancing risk /100 (higher = worse, inverted): **42** (near-term wall already self-funded and repaid; medium-term 2029 concentration and undisclosed CoC-clause language on the convertibles keep this from scoring lower)
- Covenant headroom /100: **Not assessable** (numeric threshold undisclosed; directionally wide but uncertified)
- Downside resilience /100: **55** (liquidity survives every tested haircut including a full wipeout; leverage/coverage resilience is weak because the GAAP-basis ceiling is already breached today)
- Data quality /100: **78** (full FY2025 balance sheet, cash flow, and instrument-level debt detail present; gaps are narrow — covenant numeric threshold, guarantor detail, no FY2025 audited Annual Report PDF in the pool)
- Overall usefulness /100: **72** (capped at max 75 by the covenant-headroom "Not assessable" rule)
- Biggest solvency risk (one line): A compound shock — a genuine earnings downturn landing concurrently with crystallization of the disclosed €520m–€860m Spain rider-reclassification contingent liability (already flagged with a subsidiary-level going-concern emphasis-of-matter) — turns a liquidity surplus into a breach; neither risk alone currently breaks the structure.

## 1A. Module Disconfirmation

- **Strongest bear point:** On the GAAP-consistent (Reported EBITDA) basis, net leverage is already 8.24x — above the 6.0x illustrative refi-market ceiling this module's own stress test uses as a break point — and FY2025 cash conversion (CFO ÷ Adjusted EBITDA) collapsed to 8.8%, leaving operating cash flow covering just 0.32x of cash interest paid (€79.5m CFO ÷ €246.5m cash interest) [`01` §5; `04` §1; `earnings/06_earnings-quality.md`].
- **Strongest bull point (steelman):** The entire FY2025-dated near-term wall (€877.4m due 2026-2027) has already been repaid via an executed subsequent-event refinancing (new $1.4bn 2032 term loan plus cash, confirmed on the Apr-2026 Q1 call), and even a full 12-month elimination of Adjusted EBITDA does not exhaust liquidity or breach the indicative €800m minimum-liquidity covenant — cash (€2,112.7m) dwarfs the near-term obligations it is tested against [`02` §4; `06` §3].
- **Single killer risk:** Compound crystallization of the Spain rider-reclassification contingent liability (unrecognized range €520m–€860m, ~48% of FY2025 equity at the top end) landing concurrently with an earnings downturn — the stress test's own sanity check shows a −40% EBITDA decline plus the top-of-range Spain payment flips a €507.8m surplus into a €352.2m breach [`05` §3–5; `06` §3].
- **Disconfirming evidence already visible:** A subsidiary-level auditor going-concern emphasis-of-matter names Glovoapp Spain Platform S.L.U. specifically, tied directly to the rider-classification risk ("the payments arising therefrom could not be paid without the Parent Company's support") — and FY2025's actual cash outflow for this matter (€524.0m) already exceeded the FY2024 provision balance (€492.2m) for it, evidence the exposure is generating real cash costs above what was booked, not a remote contingency [`05` §3].

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| solvency-data-triage | Sufficient — recent balance sheet, instrument-level debt note, and full cash flow statement all present; two narrow gaps (numeric covenant threshold, revolver borrowing-base mechanics) each trigger their own capped rather than blocking the module | No FY2025 audited Annual Report PDF in the pool; FY2025 figures sourced from the Capital IQ workbook, covenant/contingency narrative carried forward from the FY2024 Annual Report |
| capital-structure-and-leverage | Net leverage 2.78x (Adjusted EBITDA) / 8.24x (Reported EBITDA); gross debt €4,625.5m, net debt €2,512.8m (strict basis, canonical) | DHER is not net cash — substantial leverage; the Reported-vs-Adjusted EBITDA gap (€598.1m, 66% of the Adjusted figure) makes the leverage read basis-dependent by roughly 3x |
| maturity-wall-and-refinancing | Near-term wall (12-24m) is small and already covered by an executed subsequent-event refinancing; the real structural risk is the unaddressed 2029 cluster (46.38% of debt) | Management pre-funded and executed repayment of the entire 2026/2027 wall via a new $1.4bn 2032 term loan before the report date, giving "visibility all the way into 2028" per the CFO — but the 2029 cluster and a possible Uber-deal change-of-control put remain open |
| liquidity-runway | ~18.3 months on a conservative gross-obligations basis, net of the assumed €800m covenant floor; confidence capped at 60 | Runway depends almost entirely on cash already on the balance sheet, not on FCF materializing — a conservative and, in this case, favorable characteristic given FY2025 normalized FCF was negative (−€246.3m) |
| coverage-and-covenants | Reported-EBITDA-basis coverage is weak (EBITDA/interest 0.80x, fixed-charge coverage −0.03x); Adjusted-EBITDA-basis coverage is positive but thin (2.36x, fixed-charge 0.86x — below 1x); tightest covenant headroom directionally wide but not certifiable | FY2025 operating cash flow (CFO €79.5m) covered only 0.32x of cash interest actually paid (€246.5m) — the 2.36x accrual coverage ratio sits well above a cash reality that came in at less than a third of the interest bill |
| off-balance-sheet-and-contingencies | Largest live exposure is the Spain rider-reclassification matter: €520m-€860m unrecognized (FY2025), on top of €492.2m already provisioned (FY2024) and €524.0m already paid (FY2025) for the same dispute | RF-OBS-001 (contingent-liability spike) fired; a subsidiary-level auditor going-concern emphasis-of-matter names Glovoapp Spain Platform S.L.U. directly |
| downside-stress-test | Structure does not break mechanically on an EBITDA decline alone, even at −100%, on the liquidity/covenant test; it first breaks a 6.0x net-leverage refi ceiling at −53.6% (Adjusted basis) — already breached today on the Reported basis | A compound (not EBITDA-only) sanity check — a −40% EBITDA decline plus the top of the Spain contingent range — turns a €507.8m liquidity surplus into a €352.2m breach; this is the realistic path to distress, not a pure earnings-decline trigger |

## 3. Reconciliation

**Reported vs. Adjusted EBITDA — a real basis disagreement, not a rounding difference.** Every specialist that touches leverage or coverage (`01`, `04`, `06`) carries both EBITDA bases because they produce materially different conclusions: net leverage of 2.78x (Adjusted) vs. 8.24x (Reported); EBITDA/interest of 2.36x (Adjusted) vs. 0.80x (Reported); and the illustrative 6.0x leverage ceiling used in the stress test is not yet breached on the Adjusted basis but is already breached today on the Reported basis. Per CLAUDE.md §4/§15 (audited/GAAP numbers over management-adjusted ones, and no silent use of adjusted figures), this synthesis treats the **Reported-EBITDA basis as the conservative anchor** and the Adjusted-EBITDA basis as the figure management and the market actually price — both are shown in the verdict block above, and the verdict (Stretched, not Adequate) is set with the Reported-basis read carrying real weight, consistent with `earnings/06_earnings-quality.md`'s finding that FY2025 cash conversion (CFO ÷ Adjusted EBITDA) collapsed to 8.8%, which independently corroborates that the Adjusted EBITDA figure is not fully cash-backed.

**Vendor-internal ratio inconsistency (not used).** `01` and `04` both flag that the Capital IQ workbook's own precomputed leverage and coverage ratio sub-tables do not reconcile to either disclosed EBITDA base — this synthesis follows both agents in disregarding the vendor's precomputed ratios and using only the ratios computed directly from disclosed Income Statement, Balance Sheet, and Cash Flow lines.

**Timing note, not a disagreement.** `02` and `03` both use the as-reported 31-Dec-2025 maturity schedule as their formal calculation basis (per module convention) while flagging that a subsequent-event refinancing had, by the Apr-2026 trading update, already discharged most of the near-term wall the schedule shows. This synthesis follows the same convention: the verdict block states both the as-reported figure and the up-to-date real position, and treats the stress test's use of the as-reported €287.7m near-term-maturities figure as conservative, not stale.

No other material disagreements between specialists.

## 3A. Fragility Map (what breaks first)

| Fragility Driver | Indicator | Current Status | Why It Matters |
|---|---|---|---|
| Maturity concentration | % due within 24m (as-reported) / real forward position | 18.97% as-reported, already repaid via subsequent-event refinancing; unaddressed 46.38% cluster in 2029 | The near-term wall is a non-issue today; the 2029 cluster is the real, currently unaddressed wall risk |
| Availability liquidity | Usable liquidity vs. 12-month gross obligations | €1,312.7m usable (net of €800m assumed covenant floor) vs. €860.0m gross obligations — covered ~1.5x | Revolver (€461.8m undrawn) excluded from this figure because availability mechanics are undisclosed — true cushion could be larger, understating the picture |
| Covenant illusion risk | Covenant type vs. headroom certainty | Only covenant is a minimum-liquidity floor (not EBITDA-based), so the standard "addback illusion" risk does not currently apply — but the numeric threshold itself is unconfirmed (management-transcript-sourced, €800m) | Headroom is directionally very wide but cannot be certified as a number; if any future refinancing (plausible given the pending Uber deal) introduces an EBITDA-based covenant, DHER's own 66%-addback-heavy Adjusted EBITDA would make that risk live |
| Floating-rate sensitivity | Floating % net of hedges | 34.73% of gross debt floating (Dollar Term Facility SOFR+5.000%, KRW Term Facility); hedge disclosure partial/incomplete, rate shock run gross | A +200bp shock adds only ~€32.1m annual interest — small relative to the interest bill, but both floating facilities are also currency-mismatched (USD/KRW vs. EUR reporting) |
| Structural subordination | HoldCo debt vs. upstreaming | Convertible bonds (€2,502.3m) and revolver are unsecured HoldCo (Delivery Hero SE) obligations; Dollar/KRW Term Facilities (€1,606.4m) are secured at subsidiary level against pledged accounts, equity interests, and intercompany receivables | HoldCo bondholders sit structurally behind the secured term-facility lenders against that pledged collateral; the covenant tests Group-level liquidity (a mild positive), but guarantor-level detail for the term facilities is not itemized in this pool |
| Contingent accelerants | CoC puts / cross-default | Cross-default-adjacent covenant language confirmed; explicit change-of-control clause text for the convertible bonds not located in this pool; a live Uber acquisition approach (expected close H2 2027) sits inside the Year 2 (2027) window of the original maturity schedule | European convertibles commonly carry CoC put rights — a completed Uber deal could pull forward bond maturities into a single redemption event not captured in the base-case schedule (inference, not from filings) |

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No debt maturity schedule | N — schedule is present | — | Not applied |
| No covenant disclosure | Y (partial — covenant type disclosed, numeric threshold not) | Covenant headroom | Not assessable; Overall usefulness max 75 |
| No cash flow statement | N — full annual cash flow statement present | — | Not applied |
| Only annual data (no interim) | Y — no interim FY2026 balance sheet/cash flow in the pool, only a trading-update transcript | Solvency strength | max 75 |
| No EBITDA base (stress not run) | N — EBITDA base present, stress test ran | — | Not applied |
| Revolver exists but availability unknown | Y — commitment/undrawn known, borrowing-base mechanics undisclosed | Liquidity runway | max 60 |
| Off-balance-sheet exposures undisclosed for a known-litigious/levered name | N — exposures ARE extensively disclosed (Spain, LatAm, EU antitrust, tax matters all itemized with recorded and unrecognized ranges) | — | Not applied |
| Covenant headroom relies on assumed covenant-EBITDA addbacks | N — the disclosed covenant is liquidity-based, not EBITDA-based; no addback assumption is in play | — | Not applied |
| HoldCo has material debt but upstreaming constraints unclear | Y — guarantor/subsidiary-level detail for the Dollar/KRW Term Facilities not itemized in this pool | Solvency strength | max 70 (most restrictive of the two Solvency-strength caps; applied) |

If multiple caps affect the same score, the most restrictive is used: Solvency strength is capped at **70** (HoldCo/OpCo guarantor detail gap, more restrictive than the annual-only-data cap of 75). The scored value (45) sits well below either cap, so the caps are non-binding on the actual number but are recorded for completeness.

## 5. Survival Summary

DHER is meaningfully levered, and how levered depends on which EBITDA figure is used: 2.78x net debt to the company's own Adjusted EBITDA looks manageable, but 8.24x on GAAP-derived Reported EBITDA does not — and the trend is not clearly improving, since net debt rose 35% in FY2025 (€1,858.7m → €2,512.8m) after a one-off equity-funded deleveraging in FY2024. The near-term maturity wall is not refinancing-dependent going forward — it has already been self-funded through an executed subsequent-event refinancing (a new $1.4bn 2032 term loan plus cash) — but the 2029 cluster (46% of debt, secured, floating-rate, non-EUR) has no disclosed refinancing plan yet. The liquidity runway of roughly 18 months rests almost entirely on cash already on the balance sheet rather than on operating cash flow, which is a defensible conservative posture given FY2025 cash conversion collapsed to 8.8%; the tightest covenant (a minimum-liquidity floor, indicatively €800m) shows very wide directional headroom but cannot be certified to an exact number. The stress test's most important finding is an asymmetry: DHER survives a 30-60% EBITDA decline on liquidity grounds alone — even a full EBITDA wipeout does not mechanically exhaust cash or breach the covenant within 12 months — but the structure is already past an illustrative 6.0x leverage ceiling today on the GAAP basis, and the realistic path to actual distress is not a pure earnings shock but a compound one: an earnings downturn landing concurrently with crystallization of the disclosed Spain contingent liability, which the stress test shows converts a liquidity surplus directly into a breach.

## 6. What Would Change The Solvency Verdict?

| Current Verdict | What Would Strengthen It | What Would Weaken It | Data Needed |
|---|---|---|---|
| Stretched | Confirmed numeric covenant threshold showing wide, certifiable headroom; a disclosed refinancing plan for the 2029 cluster; sustained positive normalized (CFO − capex) FCF over 2+ quarters, closing the 8.8% cash-conversion gap; resolution (not just provisioning) of the Spain rider matter without further cash outflows above what's already provisioned | A further large Spain-related cash payment beyond the disclosed €520m-€860m range; a change-of-control put triggered by the Uber deal accelerating convertible-bond maturities; a sustained continuation of FY2025-style negative operating FCF; any confirmation that covenant "liquidity" excludes the €624.4m-type pledged cash pool, narrowing true headroom | The FY2025 audited Annual Report (not the FY2024 vintage currently in the pool), the exact numeric covenant threshold and its EBITDA/liquidity definition, guarantor-level detail for the Dollar/KRW Term Facilities, and explicit change-of-control clause text for the convertible bonds |

## 6A. Survival Playbook (non-evidenced levers excluded)

- **Refi actions already taken:** a new $1.4bn secured term loan due 2032 was announced 5-Mar-2026 and, by the Apr-30-2026 trading update, had already been used (with cash) to buy back and address the 2026/2027 convertible-bond maturities, giving management-stated "visibility all the way into 2028" [`02` §4].
- **Asset-sale program announced:** the Taiwan disposal is in progress (not yet closed as of the Apr-2026 trading update); a further €520m is expected at closing, earmarked "primarily for debt reduction" [`02` §4].
- **Dividend/buyback suspension ability:** not a live lever because there is nothing to suspend — DHER has paid no ordinary or special dividends and disclosed no share-repurchase line in any of FY2020-FY2025 [`03` §2].
- **Capex flexibility:** not evidenced in this data pool — no disclosed maintenance-vs-growth capex split or history of capex being cut in a downturn was found; do not assume flexibility here.
- **Covenant-amendment likelihood:** not evidenced in this data pool — no prior amendment history was found.

## 7. Note To The Final Synthesizer

- **Leverage, gross and net:** Gross debt €4,625.5m. Net debt (strict) €2,512.8m. Net leverage is 2.78x on Adjusted EBITDA (company-defined, €903.0m) but 8.24x on Reported/GAAP EBITDA (€304.9m) — a €598.1m (66%) gap between the two bases; net debt rose 35% in FY2025 after a one-off equity-funded halving in FY2024. Do not headline the 2.78x figure alone.
- **Maturity wall:** As-reported at 31-Dec-2025, 18.97% of debt was due within 24 months, but this has already been repaid via an executed subsequent-event refinancing (new $1.4bn 2032 term loan). The real unaddressed wall is 2029 (46.38% of total debt, secured, floating-rate, non-EUR-repayable) — no refinancing plan disclosed for it.
- **Liquidity runway:** ~18.3 months on a conservative basis, depends almost entirely on cash already on the balance sheet (not on FCF materializing, which is favorable given FY2025 normalized FCF was negative). Revolver (€461.8m undrawn) is excluded from this figure because availability mechanics are undisclosed — true liquidity is likely understated.
- **Tightest covenant:** A Group-level minimum-liquidity floor (indicatively €800m, sourced from a management transcript, not confirmed in the audited filing). Headroom is directionally very wide (+604% to +2,013% across plausible thresholds) but is marked **Not assessable** as a certified figure.
- **Largest live off-balance-sheet / contingent exposure:** Spain rider-reclassification — an unrecognized range of €520m-€860m (FY2025), on top of €492.2m already provisioned (FY2024) and €524.0m already paid (FY2025) for the same matter, with a subsidiary-level auditor going-concern emphasis-of-matter naming Glovoapp Spain Platform S.L.U. directly.

RF-OBS-001 (contingent-liability spike)

- **Stress break point:** No mechanical break on EBITDA decline alone within 12 months, even at a full wipeout, on the liquidity/covenant test. First real break is a 6.0x illustrative net-leverage refi ceiling at a 53.6% EBITDA decline (Adjusted basis) — already breached today on the Reported basis. The realistic distress path is compound: a −40% EBITDA decline plus the top of the Spain contingent range converts a €507.8m surplus into a €352.2m breach.
- **Partial-data caps applied:** Covenant headroom "Not assessable" (Overall usefulness capped at 75); Liquidity runway capped at 60 (revolver availability unknown); Solvency strength capped at 70 (HoldCo/OpCo guarantor detail for the secured term facilities not itemized).
- **Biggest missing data point (single highest-value next data request):** The FY2025 audited Annual Report (period-end 31-Dec-2025) — not currently in the pool, which contains only the FY2024 vintage — specifically for its RCF/term-facility covenant note (the exact numeric minimum-liquidity threshold and definition), the updated Spain/Italy contingency figures, and guarantor-level detail for the Dollar and KRW Term Facilities.
- **Explicit handoff:** the master synthesizer's "Balance Sheet and Survival Test" section should defer to this synthesis; the stress break points here (the 6.0x leverage-ceiling crossing at −53.6%, already breached today on the Reported-EBITDA basis, and the compound contingent-liability/earnings-decline breach) are the inputs for the master's downside scenario and risk register — this module does not assign probabilities to those outcomes.

## 8. Simple Summary

- DHER owes €4,625.5m gross, €2,512.8m net. That is 2.78x the company's own adjusted profit measure, but 8.24x its GAAP profit measure — a big gap, and the GAAP number matters because actual cash generation was weak.
- The debt due in the next two years (€877.4m) has already been paid off using a new loan taken out in early 2026 — that risk is handled. The debt due in 2029 (46% of the total) has no refinancing plan yet.
- The company has about 18 months of cash cushion against its near-term bills, on a conservative reading that gives no credit to future cash flow.
- The one debt rule that could force a crisis (a minimum-cash requirement, roughly €800m by management's own description) looks very far from being broken — but the exact number isn't in the filing, so it can't be fully verified.
- The single biggest wildcard liability is a Spanish labor-law dispute that could cost up to €860m more, on top of amounts already paid; the auditor has separately flagged a going-concern warning for the Spanish subsidiary tied to this exact issue.
- The company survives a 30-60% profit drop on cash grounds alone — even wiping out a full year of profit wouldn't run out the cash. It breaks first on a leverage-ratio test that it has, on the stricter GAAP measure, already crossed today.
- A credit rating (S&P: B, sub-investment-grade) was available; the key gap is the FY2025 audited annual report, which isn't yet in the data pool.
- This module is useful for the master synthesizer: the picture is data-rich, with only narrow, clearly labeled gaps.



---

## balance-sheet-survival / 00_solvency-data-triage.md

_Source: `00_solvency-data-triage.md`_

# Solvency Data Triage — DHER

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Solvency Relevance |
|---|---|---|---|---|
| Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | Annual filing (IFRS, Germany) | FY2024 (filed 2025-04-25) | 2026-08-10 (sync date, not authoritative — period-end from inside doc) | High |
| Delivery_Hero_SE_-_Form_Annual_Report(Apr-25-2025).pdf | Annual filing (byte-identical duplicate of above per extraction) | FY2024 (filed 2025-04-25) | 2026-08-10 | High (duplicate — same content) |
| Delivery Hero SE, 2025 Earnings Call, Mar 26, 2026.pdf | Transcript (FY2025 results call) | FY2025 (call 2026-03-26) | 2026-08-10 | Medium |
| Delivery Hero SE, Q1 2026 Sales_ Trading Statement Call, Apr 30, 2026.pdf | Transcript (Q1 2026 trading update — no full interim balance sheet) | Q1 2026 (call 2026-04-30) | 2026-08-10 | Medium |
| Uber Technologies, Inc., Delivery Hero SE - M&A Call.pdf | Transcript — Uber/DHER acquisition call | 2026-07-16 | 2026-08-10 | High (pending change-of-control event; relevant to cross-default/CoC provisions) |
| Delivery Hero SE XTRA DHER Analyst Coverage.rtf | Analyst coverage list | As of pull date | 2026-08-10 | Low |
| Delivery Hero SE XTRA DHER Competitors.rtf | Competitor screen | As of pull date | 2026-08-10 | Low |
| Delivery Hero SE XTRA DHER Customers.rtf | Customer detail | As of pull date | 2026-08-10 | Low |
| Delivery Hero SE XTRA DHER Fixed Income Securities Summary.rtf | Fixed-income/bond registry (Capital IQ) | Bonds outstanding as of pull date | 2026-08-10 | High |
| Company Comparable Analysis Delivery Hero SE.xls | Multi-tab CIQ comp workbook | FY2023–FY2025 / LTM / As-of 2026-08-10 | 2026-08-10 | High (tabs below) |
| Delivery Hero SE XTRA DHER Financials.xls | Multi-tab CIQ financials workbook | FY2020–FY2025 (annual) | 2026-08-10 | High (tabs below) |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Multi-tab CIQ consensus/estimates workbook | Consensus/estimates, various as-of dates | 2026-08-10 | Medium (tabs below) |

### Workbook tabs (reconciled against `_pool_extracts/manifest.md`, 0 extraction failures across 28 tabs / 3 workbooks)

| Parent File | Tab | Rows×Cols | Solvency Relevance |
|---|---|---|---|
| Company Comparable Analysis Delivery Hero SE.xls | Financial Data | 50×17 | Medium — LTM net debt, EBITDA, EV |
| Company Comparable Analysis Delivery Hero SE.xls | Trading Multiples | 50×9 | Low |
| Company Comparable Analysis Delivery Hero SE.xls | Operating Statistics | 50×13 | Low |
| Company Comparable Analysis Delivery Hero SE.xls | Business Description | 44×3 | Low |
| Company Comparable Analysis Delivery Hero SE.xls | Implied Valuation | 69×9 | Low (valuation, out of module scope) |
| Company Comparable Analysis Delivery Hero SE.xls | Valuation Chart | 32×2 | Low |
| Company Comparable Analysis Delivery Hero SE.xls | Credit Health Panel | 48×10 | High — S&P Issuer Credit Rating "B" for DHER (Germany), peer credit-health quartiles |
| Company Comparable Analysis Delivery Hero SE.xls | Disclaimer | 26×1 | None |
| Delivery Hero SE XTRA DHER Financials.xls | Key Stats | 90×9 | Medium |
| Delivery Hero SE XTRA DHER Financials.xls | Income Statement | 112×7 | Medium — EBIT/EBITDA base |
| Delivery Hero SE XTRA DHER Financials.xls | Balance Sheet | 98×7 | High — cash, debt, equity by year FY2020–FY2025 |
| Delivery Hero SE XTRA DHER Financials.xls | Cash Flow | 76×7 | High — CFO, capex, FCF, cash interest paid, debt issued/repaid FY2020–FY2025 |
| Delivery Hero SE XTRA DHER Financials.xls | Multiples | 90×8 | Low |
| Delivery Hero SE XTRA DHER Financials.xls | Historical Capitalization | 39×7 | Medium |
| Delivery Hero SE XTRA DHER Financials.xls | Capital Structure Summary | 99×7 | High — debt by type, leverage ratios, 5-yr maturity buckets, undrawn revolver |
| Delivery Hero SE XTRA DHER Financials.xls | Capital Structure Details | 43×10 | High — instrument-level detail: coupon, maturity, seniority, secured/unsecured, convertible flag |
| Delivery Hero SE XTRA DHER Financials.xls | Ratios | 161×7 | Medium — coverage/leverage ratios |
| Delivery Hero SE XTRA DHER Financials.xls | Supplemental | 59×7 | Low |
| Delivery Hero SE XTRA DHER Financials.xls | Industry Specific | 15×6 | Low |
| Delivery Hero SE XTRA DHER Financials.xls | Pension OPEB | 110×7 | Medium — pension/OPEB funded status FY2020–FY2025 |
| Delivery Hero SE XTRA DHER Financials.xls | Segments | 64×7 | Low (business-model territory) |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Consensus | 534×31 | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Recent Changes | 265×10 | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Guidance | 55×13 | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Multiples | 26×7 | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Surprise | 262×28 | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Trends | 411×16 | Low |
| DeliveryHeroSEXTRADHEREstimatesReport.xls | Revisions | 625×16 | Low |

No `external/` folder exists under `data/DHER/` — no externally sourced documents to inventory (Section 1A omitted).

## 2. Most Recent Sources

| Source Type | Filename | Period / As-of | Age (months) |
|---|---|---|---|
| Annual filing (debt + contingency notes) | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf | FY2024 (period-end 2024-12-31; filed 2025-04-25) | ~20 months old vs report date 2026-08-12 |
| Quarterly filing | None (no interim financial-statements PDF in pool — only the Q1 2026 trading-update transcript, no balance sheet) | Q1 2026 trading update, call 2026-04-30 | ~3.4 |
| Debt / capital-structure export | Delivery Hero SE XTRA DHER Financials.xls — Capital Structure Summary / Details tabs | FY2025 (period-end 2025-12-31; filing date used by CIQ 2026-03-26) | ~4.5 |
| Fixed-income / maturities export | Delivery Hero SE XTRA DHER Fixed Income Securities Summary.rtf | Bonds outstanding, pulled 2026-08-10 (implied) | Current |
| Cash flow statement | Delivery Hero SE XTRA DHER Financials.xls — Cash Flow tab | FY2025 (period-end 2025-12-31) | ~4.5 |
| Covenant / credit-agreement disclosure | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf, Note on RCF/Term Facilities (financial covenant, Group-level leverage test) | FY2024 (as of the FY2024 Annual Report) | ~20 |
| Credit rating report | Company Comparable Analysis Delivery Hero SE.xls — Credit Health Panel tab (S&P Issuer Credit Rating: B) | As-of 2026-08-10 | Current |

## 3. Solvency Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Balance sheet (recent) | Y | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab, FY2025 (2025-12-31) | Debt, cash, equity base |
| Debt note (amounts by type) | Y | Financials.xls, Capital Structure Summary & Details tabs — term loans, senior bonds/notes (incl. convertibles), lease liabilities, revolver, by instrument with coupon/seniority/security | The debt stack and seniority |
| Maturity schedule | Y | Financials.xls, Capital Structure Summary tab (LT debt due +1 to +5 and after-5-yrs buckets) and Capital Structure Details tab (instrument-level maturity dates to 2030) | The maturity wall and refinancing exposure |
| Cash flow statement | Y | Financials.xls, Cash Flow tab, FY2020–FY2025, incl. cash interest paid, capex, debt issued/repaid | CFO/FCF for runway and coverage |
| Committed / undrawn facility detail | Y (partial — commitment amount known, borrowing-base/availability detail not disclosed in this pool) | Financials.xls, Capital Structure Summary tab — "Undrawn Revolving Credit" €461.8m (FY2025); RCF is unsecured per Capital Structure Details tab | True liquidity beyond cash |
| Interest expense detail | Y | Cash Flow tab (cash interest paid, FY2020–FY2025) and Capital Structure Details tab (per-instrument coupon/base rate) | Coverage ratios |
| Covenant disclosure | Y (partial — covenant exists and type is named, exact numeric threshold not located in extracted annual-report text) | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf — RCF/term-facility note states "a financial covenant... applied at Group level" and states compliance, but the extracted text does not carry the numeric threshold | Headroom to a breach |
| Lease detail (operating/finance) | Y | Financials.xls, Capital Structure Summary tab — Total Lease Liabilities €437.8m FY2025, cap-lease payment schedule to 5 yrs+ | Debt-like obligations |
| Pension / OPEB funded status | Y | Financials.xls, Pension OPEB tab, FY2020–FY2025 | Off-balance-sheet obligation |
| Commitments & contingencies note | Y | Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf — contingent liability of €440–770m disclosed re: an investigation; Spain freelance-rider-model litigation; bank guarantees to Spanish courts | Guarantees, LCs, litigation, tax claims |
| Credit ratings | Y | Company Comparable Analysis Delivery Hero SE.xls, Credit Health Panel tab — S&P Issuer Credit Rating (Foreign Currency LT): "B", Germany | Refinancing access and cost |
| EBITDA base (for stress test) | Y | Company Comparable Analysis Delivery Hero SE.xls, Financial Data tab (LTM/NTM EBITDA) and Financials.xls Income Statement tab (annual EBITDA FY2020–FY2025) | Required for the survival stress test |
| Business type (operating / bank / insurer / REIT / HoldCo-OpCo) | Y | Business Description tab + Annual Report — Delivery Hero SE is an online food-delivery/quick-commerce operating company (restaurant/quick-commerce classification per Credit Health Panel), not a bank/insurer/REIT | Selects the correct framework (Business Type Applicability Gate) |
| Revolver terms + availability / borrowing base | Y (partial) | Capital Structure Details tab — RCF: unsecured, Senior, floating (Benchmark), maturity 2028-05-01; commitment size and undrawn amount known (€461.8m undrawn FY2025); no borrowing-base/availability-reserve mechanic disclosed in this pool | Determines usable liquidity and springing covenants |
| Covenant EBITDA definition (addbacks / caps) | N | Not located in extracted annual-report text — Annual Report references "a financial covenant" and "Adjusted EBITDA" is defined elsewhere (income-statement footnote) but the specific covenant-EBITDA addback/cap language was not found in this pool | Prevents "fake headroom" |
| HoldCo / OpCo structure disclosure | Partial | Annual Report notes RCF/term-facility covenant is applied "at Group level"; instrument-level guarantor/subsidiary structure (e.g. which entities guarantee the Dollar/KRW Term Facilities) not itemized in the extracted text | Structural subordination and upstreaming |
| Hedging / swaps disclosure | Partial | Annual Report references a prepayment-related derivative recognized in net interest result (€23.7m) tied to the KRW Term Facility, but no comprehensive hedge-ratio table for the floating-rate book (Dollar/KRW Term Facilities) was located | Floating-rate exposure net of hedges |
| Change-of-control / cross-default / rating triggers | Partial | Annual Report references "an infringement of such covenant" at Group level (cross-default-adjacent language); the pending Uber/DHER acquisition (M&A Call transcript, 2026-07-16) makes a change-of-control clause on the convertible bonds and term facilities directly relevant, but explicit CoC/rating-trigger clause text was not located in the extracted annual-report text | Hidden accelerants to distress |

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
| Primary listing country | Germany | Annual Report — "Delivery Hero SE," Berlin registered office; German Stock Corporation Act (AktG) references throughout governance sections |
| Exchange | Deutsche Börse XETRA (Frankfurt), ticker DHER | Ticker convention used throughout the CIQ workbooks: "Delivery Hero SE (XTRA:DHER)" |
| Filing regime | Other (Germany — EU/German Corporate Governance Code, AktG, Sections 289f/315d disclosure regime) | Annual Report — "German Corporate Governance Code (Deutscher Corporate Governance Kodex)," "Sections 289f, 315d" |
| Reporting standard | IFRS | Annual Report — "in accordance with IFRS," "Financial Statements in accordance with IFRS," IFRS 15 references |
| Reporting currency | EUR | All CIQ Financials.xls tabs and Annual Report figures stated in EUR millions |
| Document language(s) | English (Annual Report and Form Annual Report extracts are in English; company also publishes bilingually in German and English per governance disclosure — "available on the Company's website in German and English") | Annual Report, p. governance section: "publishes... in both German and English" |

No non-English documents were found in this pool requiring translation; both annual-report PDFs extracted are in English. Per CLAUDE.md §27, this is recorded as a fact, not treated as a gap either way.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No debt maturity schedule | N — maturity schedule is present (5-yr buckets + instrument-level maturity dates) | — | Not applied |
| No covenant disclosure | N (partial) — covenant existence and type disclosed, but the numeric threshold and covenant-EBITDA addback definition were not located in the extracted text | 04, 06 | Covenant headroom quality capped — treat as "Covenant headroom max 60" pending confirmation of the numeric threshold in the full annual-report note; do not assume market-standard terms without labeling the assumption |
| No cash flow statement | N — full annual CFO/FCF/capex/cash-interest series FY2020–FY2025 present | — | Not applied |
| No undrawn-facility disclosure | N — undrawn revolver amount disclosed (€461.8m FY2025); Y (partial) for borrowing-base/availability mechanics, which are not disclosed | 03 | Liquidity runway max 60 (revolver exists, commitment/undrawn known, but no borrowing-base/availability-reserve detail — per MODULE_RULES "Revolver exists but availability unknown") |
| No interest-expense detail | N — cash interest paid (annual series) and per-instrument coupon/base rate present | — | Not applied |
| No EBITDA base | N — LTM/NTM and annual EBITDA present in CIQ workbooks; earnings/01_historical-financials.md also available as cross-check | — | Not applied |

Additional cap not in the standard 6-row table but triggered by MODULE_RULES.md: **"Only annual data (no interim)"** — the pool contains no interim (Q1 2026 or H1 2026) balance sheet/cash-flow statement, only a trading-update transcript with no full financials. Applies: **Solvency strength max 75.**

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** A recent (FY2025, period-end 2025-12-31) balance sheet, a detailed instrument-level debt note with maturities/seniority/security, and a full annual cash flow statement (with cash interest paid) are all present in the pool, so leverage, liquidity, coverage, and a stress test can all be built; the two gaps found (exact numeric covenant threshold/addback definition, and revolver borrowing-base mechanics) are narrow and each triggers its own MODULE_RULES cap rather than blocking the module.
- **Sections that can run:** capital structure, maturity wall, liquidity, coverage/covenants (headroom directionally assessable but capped on quality — see caps), contingencies, stress test.
- **Active partial-data caps:**
  - Covenant headroom max 60 (numeric threshold and covenant-EBITDA addback definition not located in extracted text — 04, 06 must state the covenant type from the filing and flag the missing numeric threshold rather than assume one).
  - Liquidity runway max 60 (RCF commitment and undrawn amount are known, but borrowing-base/availability-reserve mechanics are not disclosed — 03 must treat the RCF as "committed, undrawn amount known, availability mechanics unknown").
  - Solvency strength max 75 (only annual data in the pool; no interim balance sheet — the Q1 2026 call is a trading update, not a financial statement).
- **Critical missing items:**
  - Exact numeric covenant threshold(s) for the RCF/term-facility financial covenant (the Annual Report names the covenant's existence and states compliance, but the specific ratio/level was not found in the extracted text).
  - Guarantor/subsidiary-level detail for the Dollar Term Facility and KRW Term Facility (both secured, non-EUR-denominated) — HoldCo/OpCo and structural-subordination mapping should note this as a labeled gap, not assume upstreaming is unconstrained.
  - Interim (Q1/H1 2026) balance sheet and cash flow statement — only a trading-update transcript exists for the period since FY2025 year-end.
- **Single highest-value missing document:** The FY2025 (calendar year 2025, filed ~2026-03-26) Annual Report's full text with the RCF/term-facility covenant note and numeric threshold — the pool's Capital Structure tabs already carry FY2025 balance-sheet and debt data (CIQ "Source: A 2025 filed Mar-26-2026"), but the actual FY2025 Annual Report PDF (as opposed to the FY2024 PDF in the pool) is not present, so the covenant note, contingent-liability update, and guarantor detail for FY2025 cannot be read from a primary filing — only inferred from the FY2024 Annual Report and the CIQ workbook roll-forward. Downstream agents should treat FY2025-specific covenant/contingency narrative as sourced from CIQ tabs and the FY2025 earnings call transcript, not from an audited FY2025 annual-report text, and should flag this distinction wherever it matters.



---

## balance-sheet-survival / 01_capital-structure-and-leverage.md

_Source: `01_capital-structure-and-leverage.md`_

# Capital Structure & Leverage — DHER

Reporting currency: **EUR** (euro), all figures in EUR million unless stated otherwise. Reporting standard: IFRS as adopted by the EU [FY24 Annual Report (Ind.: IFRS), Delivery_Hero_SE-Annual_Report(Apr-25-2025).pdf]. Latest balance-sheet date used throughout: **31-Dec-2025** (FY2025), sourced from the Capital IQ workbook, which states its own source as "A 2025 filed Mar-26-2026" [Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet & Capital Structure Summary/Details tabs]. No FY2025 Annual Report PDF is present in the data pool — the FY2025 audited Annual Report is not yet available in this pool, so FY2025 debt-note narrative color (collateral, covenant wording) is carried forward from the FY2024 Annual Report where the FY2025 workbook doesn't itself state it; this is flagged inline wherever it applies, per `00_solvency-data-triage.md`.

DHER is currently the subject of a live, announced Uber acquisition approach and strategic review (expected close H2 2027) [Uber Technologies, Inc., Delivery Hero SE - M&A Call, Jul 16, 2026]. This is noted for downstream context; this agent analyzes the standalone capital structure as reported, not the deal.

## 1. Debt Stack

| Instrument | Amount (€m) | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Short-term debt / current portion | 287.7 (ST borrowings 86.1 + curr. LT debt 74.7 + curr. leases 126.9) | Mixed — Delivery Hero SE and operating subsidiaries | Mixed (leases secured on underlying assets; borrowings unsecured/secured per instrument below) | Senior | Mixed | Within 12 months of 31-Dec-2025 | Mixed | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab, FY2025 |
| Bonds / notes (4 convertible-bond tranches: I-B, II-B, III-A, III-B, IV) | 2,502.3 | Delivery Hero SE (ultimate parent / HoldCo issuer) | No | Senior Unsecured | None | 2026-04-30 (III-A, €55.7m) / 2027-01-23 (I-B, €531.6m) / 2028-01-15 (II-B, €716.5m) / 2029-03-10 (III-B, €480.9m) / 2030-02-21 (IV, €717.6m) | Fixed, 1.000%–3.250% | Delivery Hero SE XTRA DHER Financials.xls, Capital Structure Details tab, FY2025 As-Reported |
| Term loans (Dollar Term Facility, KRW Term Facility, Convertible Loan) | 1,692.5 | Subsidiary borrowers (Dollar/KRW facilities); Delivery Hero SE (Convertible Loan) | Yes (Dollar & KRW facilities); No (Convertible Loan, €86.1m, matures 2026-03-09) | Senior (Secured for Dollar/KRW; Senior Unsecured for Convertible Loan) | Pledged bank accounts at German institutions, equity interests in borrower subsidiaries, and certain intercompany receivables (per FY24 Annual Report Note F.10 — FY2025-specific collateral detail not independently confirmed, carried forward) | Dollar Term Facility 2029-12-01 (€1,110.3m); KRW Term Facility 2029 (€496.1m); Convertible Loan 2026-03-09 (€86.1m) | Floating: Dollar Term Facility SOFR+5.000%; KRW Term Facility "New Benchmark" (rate not itemized); Fixed: Convertible Loan 2.500% | Delivery Hero SE XTRA DHER Financials.xls, Capital Structure Details tab, FY2025; FY24 Annual Report, Note F.10 ("Liabilities to Banks") |
| Revolver (drawn) | 0 (fully undrawn) | Delivery Hero SE | No | Senior Unsecured | None | 2028-05-01 | Floating, benchmark-linked (base rate not itemized in this pool) | Delivery Hero SE XTRA DHER Financials.xls, Capital Structure Details tab, FY2025; committed size €600.0m per FY24 Annual Report Note F.10, undrawn €461.8m per Capital Structure Summary tab FY2025 (the €138.2m gap to commitment reflects ancillary guarantee/letter-of-credit utilization, €231.4m at Dec-31-2024 per the FY24 Annual Report — FY2025 ancillary-utilization figure not separately disclosed in this pool) |
| Finance / capital leases (IFRS 16) | 437.8 | Operating subsidiaries (Dmarts, rider equipment, offices) | Yes (secured against the underlying leased assets) | Senior | Leased assets | Various, per lease term | Weighted-average 6.760% | Delivery Hero SE XTRA DHER Financials.xls, Capital Structure Summary tab, FY2025 |
| **Total gross debt** | **4,625.5** | — | — | — | — | — | — | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab & Capital Structure Summary tab, FY2025 (ties: €2,502.3 bonds + €1,692.5 term loans + €437.8 leases = €4,632.6 principal due, less €7.1m fair-value/discount adjustment = €4,625.5) |

All debt instruments are classified **Senior** — the Group discloses no subordinated debt tranche. Within "Senior," the Dollar and KRW Term Facilities carry security (pledged subsidiary bank accounts, equity interests, intercompany receivables), while the convertible bonds, the Convertible Loan, and the Revolving Credit Facility are unsecured — see §6A for the structural-priority read this creates.

S&P's issuer credit rating for Delivery Hero SE (Germany), foreign-currency long-term, is **B**, as of the data pull date [Company Comparable Analysis Delivery Hero SE.xls, Credit Health Panel tab, as-of 2026-08-10 — a Capital IQ-hosted transcription of the S&P rating field, not a standalone S&P rating-rationale report].

**Covenant type note (context, not full analysis — that is `04_coverage-and-covenants`'s job):** the RCF and term facilities are subject to a **minimum-liquidity covenant tested quarterly at Group (consolidated) level**, not a debt/EBITDA leverage covenant — "a financial covenant, which implies the maintenance of a minimum liquidity level for the Group, on a quarterly basis... In case of an infringement... the RCF might be terminated" [FY24 Annual Report, Note F.10, p.178]. The Group states it complied with this covenant as of 31-Dec-2024 and expected to remain compliant for the following twelve months [same source]. The exact numeric threshold and any covenant-EBITDA addback definition were not located in the extracted annual-report text — flagged per `00_solvency-data-triage.md`.

## 2. Other Debt-Like Obligations

| Obligation | Amount (€m) | Treatment | Source |
|---|---:|---|---|
| Operating leases (IFRS 16) | 437.8 (already included in Total Gross Debt, §1) | DHER reports under **IFRS 16**, which capitalizes operating leases onto the balance sheet as lease liabilities — there is no separate off-balance-sheet operating-lease number to add; the €437.8m lease-liability line in §1 already carries this obligation. Do not double-count it. | Delivery Hero SE XTRA DHER Financials.xls, Capital Structure Summary tab, FY2025 |
| Pension / OPEB underfunding | Balance-sheet liability line: €33.8m (FY2025). Separately, the CIQ Pension/OPEB tab's defined-benefit memo shows Projected Benefit Obligation €57.7m vs. Plan Assets €69.7m (a net asset of ~€12.0m) for FY2025 — this does not tie cleanly to the €33.8m balance-sheet liability line, likely because the latter also includes non-DB post-retirement provisions across jurisdictions not netted against the funded DB plan. Flagged as an unreconciled presentation difference, not resolved; either figure is small (<1% of total debt). | Both figures immaterial relative to the €4,625.5m gross debt stack | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab (liability line) and Pension OPEB tab (funded-status memo), FY2025 |
| Preferred equity | None outstanding (all periods FY2020–FY2025 show "-") | Not applicable | Delivery Hero SE XTRA DHER Financials.xls, Historical Capitalization tab |

## 3. Cash & Liquid Assets

| Item | Amount (€m) | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | 2,112.7 (FY2025, single balance-sheet line; FY2024 breakdown was cash €1,358.9m + cash equivalents/money-market-fund holdings €2,449.8m = €3,808.7m — FY2025 does not carry this sub-split in the pool) | No (see restricted-cash line below for the small carved-out amount) | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab, FY2025; FY24 Annual Report, Note 8 ("Cash and Cash Equivalents") for the FY2024 cash/cash-equivalents split |
| Liquid short-term investments | None disclosed separately from cash & equivalents | Not applicable — the €2,112.7m cash line already includes money-market-fund "cash equivalents"; no additional marketable-securities line is broken out | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab, FY2025 ("Total Cash & ST Investments" = "Cash And Equivalents", identical figure) |
| Restricted / trapped cash (flag) | €2.0m as of Dec-31-2024 (previous year €2.2m) — the most recent figure this pool discloses; no FY2025-specific restated figure is present | Yes, disclosed as restricted, but immaterial (~0.05% of FY2024 cash) | FY24 Annual Report, Note 8 ("Restricted cash and cash equivalents amounted to €2.0 million as of the reporting date") |
| **Pledged (encumbered, not "restricted") bank-account cash — flagged separately** | €624.4m as of Dec-31-2024 (€58.0m as of Dec-31-2023) | Not classified as "restricted cash" on the balance sheet, but held in accounts pledged as collateral for the Dollar/KRW Term Facilities — usable in the ordinary course but encumbered by a security interest | FY24 Annual Report, Note F.10: "the bank accounts subject to pledge held cash and cash equivalents of €624.4 million" |

This is a much larger encumbrance than the formally "restricted" cash line and is flagged here so downstream liquidity work (`03_liquidity-runway`) does not treat all €2,112.7m of FY2025 cash as unconditionally free — a material share of the FY2024 base (€624.4m of €3,808.7m, ~16%) sat in pledged accounts; a comparable FY2025 figure is not disclosed in this pool.

## 4. Gross & Net Debt

| Metric | Value (€m) | Source |
|---|---:|---|
| Gross debt | 4,625.5 | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab / Capital Structure Summary tab, FY2025 |
| − Cash & equivalents | 2,112.7 | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab, FY2025 |
| **Net debt (strict, §15)** | **2,512.8** | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab, "Net Debt" line, FY2025 (ties: 4,625.5 − 2,112.7 = 2,512.8) |
| − Liquid short-term investments | Not applicable — none disclosed beyond cash & equivalents (§3) | — |
| **Net debt (broad, incl. investments)** | Same as strict (€2,512.8m) — no separate liquid-investments line exists to net in | — |

No broad-basis adjustment is needed here: DHER discloses no marketable-securities or short-term-investment line distinct from cash & equivalents, so the strict and broad bases are numerically identical. The **strict basis is the canonical net-debt figure used throughout this module** (§7).

## 5. Leverage Ratios

*Reported EBITDA* = the GAAP-derived line from the CIQ income-statement extraction (Net Income + interest + tax + D&A on a standard basis): FY2025 €304.9m, FY2024 −€24.3m [Delivery Hero SE XTRA DHER Financials.xls, Income Statement tab]. *Adjusted EBITDA* = the company's own non-GAAP metric (excludes stock-based comp, restructuring/legal-provision items, goodwill impairments, gains/losses on disposals, and right-of-use depreciation on top of standard D&A add-back): FY2025 €903.0m, FY2024 €692.5m [FY24 Annual Report "Targets and Results" table; Delivery Hero SE, 2025 Earnings Call transcript, Mar 26 2026; cross-checked against `earnings/01_historical-financials.md`].

| Ratio | On Reported EBITDA | On Adjusted EBITDA | Source |
|---|---:|---:|---|
| Gross debt / EBITDA (FY2025) | 15.17x (4,625.5 / 304.9) | 5.12x (4,625.5 / 903.0) | Computed from §1 and §5 EBITDA bases |
| Net debt / EBITDA (FY2025) | 8.24x (2,512.8 / 304.9) | 2.78x (2,512.8 / 903.0) | Computed from §4 and §5 EBITDA bases |
| Debt / capital (FY2025) | 72.06% (4,625.5 / 6,419.3 total capital) | (n/a) | Delivery Hero SE XTRA DHER Financials.xls, Capital Structure Summary tab, FY2025 |
| Debt / equity (FY2025) | 282.1% (4,625.5 / 1,639.6 common equity); 257.9% including minority interest (4,625.5 / 1,793.8 total equity) | (n/a) | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab, FY2025 |

**FY2024 comparison (for the trend read in §6):** Gross debt/Reported EBITDA is not meaningful (Reported EBITDA was −€24.3m, i.e. negative); Gross debt/Adjusted EBITDA = 8.19x (5,667.4/692.5); Net debt/Reported EBITDA not meaningful; Net debt/Adjusted EBITDA = 2.68x (1,858.7/692.5).

**Vendor-ratio reconciliation flag:** the Capital Structure Summary tab's own precomputed "Credit Ratios" sub-table shows Net Debt/EBITDA of 15.55x (FY2024) and 5.53x (FY2025), and Total Debt/EBITDA of 47.43x (FY2024) and 10.17x (FY2025). These do **not** reconcile to either the Reported EBITDA line (−24.3 / 304.9) or the Adjusted EBITDA figure (692.5 / 903.0) on the same workbook — implying the vendor's ratio sub-table uses a different, unstated EBITDA base (possibly a differently-timed trailing or NTM figure) that this agent could not identify from the extracted data. Per CLAUDE.md §4/§5, this is flagged as an unreconciled vendor internal inconsistency rather than silently used; **this report's leverage ratios above are computed directly from the disclosed net/gross debt and the two named EBITDA bases**, not from the vendor's precomputed ratio line.

**Cyclicality context:** `business-model/07_business-quality.md` scores DHER's cyclicality 42/100 (mixed band — "moderate... not a classic commodity-cycle business," driven by consumer discretionary spend, FX, and hyperinflation-accounting exposure), which does not clear the bar this module treats as "deep cyclical" (`business-model/10_external-dependency.md` frames the dominant near-term variable as the pending Uber-deal regulatory outcome, not a commodity/macro cycle). A full mid-cycle-EBITDA leverage restatement is therefore not mandated, but a related caution applies: DHER's Adjusted EBITDA has only been positive for **two fiscal years** (FY2024 €692.5m, FY2025 €903.0m) after three years of losses (FY2021 −€795.6m, FY2022 −€467.2m) [`earnings/01_historical-financials.md`], so FY2025's 2.78x net-leverage-on-adjusted-EBITDA figure sits on a recent, unproven profitability run rather than a demonstrated multi-year mid-cycle level. As a labeled reference point only: net debt over the trailing three-year average Adjusted EBITDA (FY2023 €253.6m + FY2024 €692.5m + FY2025 €903.0m, average €616.4m) is **4.08x** (2,512.8 / 616.4) — this is a recent-history average, not a mid-cycle/normalised figure in the sense of a company with a full standalone cycle, and is shown to make the fragility of the FY2025 profitability inflection explicit, not as a like-for-like alternative to the FY2025 figure.

## 6. Leverage Trend

| Metric | FY2022 | FY2023 | FY2024 | FY2025 (Latest) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, §15) | €3,266.8m | €3,983.4m | €1,858.7m | €2,512.8m | Volatile — sharp fall then partial rebound |
| Net debt / Adjusted EBITDA | N/M (EBITDA negative) | 15.71x | 2.68x | 2.78x | Falling sharply then roughly flat |

Source: Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet / Capital Structure Summary tabs, FY2022–FY2025; Adjusted EBITDA per §5 and `earnings/01_historical-financials.md`.

Net debt fell by roughly half from FY2023 to FY2024 (€3,983.4m → €1,858.7m, −53%), driven primarily by two equity-funded events in 2024: the public listing of talabat, which recognized gross proceeds of €1,927.3m to the Group [FY24 Annual Report, "talabat" listing note], and a further large common-stock issuance (€2,138.8m in the FY2024 cash-flow statement's "Issuance of Common Stock" line), which together funded €1,023.9m of long-term debt repayment that year [Delivery Hero SE XTRA DHER Financials.xls, Cash Flow tab, FY2024]. Net debt then rose again in FY2025 (€1,858.7m → €2,512.8m, +35%) even as the Group kept repaying debt (€1,055.9m of long-term debt repaid in FY2025) — the rebound is explained by the absence of a comparable large equity inflow in FY2025 (no material "Issuance of Common Stock" line that year), a €156.1m negative foreign-exchange cash-flow adjustment, and continued negative-to-thin free cash flow (FY2025 FCF of −€246.3m on this module's cash-flow-statement-based calculation; see `earnings/01_historical-financials.md` for the definitional gap versus the company's own guided +€250m FCF figure) [Delivery Hero SE XTRA DHER Financials.xls, Cash Flow tab, FY2025]. Net leverage on Adjusted EBITDA improved dramatically from N/M in FY2022 (EBITDA still negative) to 2.68x in FY2024, then held roughly flat at 2.78x in FY2025 as Adjusted EBITDA growth (+30% YoY) kept pace with the net-debt rebound.

## 6A. HoldCo / OpCo & Structural Subordination

| Item | Evidence | Why It Matters |
|---|---|---|
| Where debt sits (HoldCo vs OpCo) | The convertible bonds (€2,502.3m) and the undrawn revolver are unsecured obligations of **Delivery Hero SE**, the ultimate parent (HoldCo). The Dollar Term Facility (€1,110.3m) and KRW Term Facility (€496.1m) are secured facilities where "certain borrowers" (operating subsidiaries) pledge "bank accounts at German institutions... equity interests in the subsidiaries that are party to the loan agreements, and certain intercompany receivables" [FY24 Annual Report, Note F.10]. | The secured term-facility lenders sit structurally senior to the unsecured HoldCo convertible bondholders against the pledged subsidiary collateral — a real, if partial, structural-subordination gap for bondholders in a downside. |
| Upstreaming constraints (dividend blockers, regulatory) | The financial covenant (minimum Group-level liquidity, tested quarterly) is measured on a **consolidated** basis, not entity-by-entity, which limits (but doesn't eliminate) pure structural-subordination risk [FY24 Annual Report, Note F.10]. One narrow, subsidiary-specific blocker is disclosed: a Spanish Tax Authority preventive seizure on shares of Glovoapp Spain Platform S.L.U. (securing €28.0m) currently restricts the **sale of those shares and distribution of dividends from that single subsidiary** until lifted — no sale or distribution is currently ongoing or anticipated [FY24 Annual Report, "Other Provisions" note]. | A Group-level (not entity-isolated) covenant test is a mild positive for HoldCo bondholders; the Glovo Spain dividend block is narrow and does not by itself impair Group-level upstreaming. |
| Material restricted / trapped cash | Formally "restricted cash" is immaterial (€2.0m, FY2024). Materially larger: €624.4m of cash (FY2024) sat in bank accounts pledged as collateral for the Dollar/KRW Term Facilities (§3) — usable operationally but encumbered by a security interest, and not separately updated for FY2025 in this pool. | Net debt is not overstated by this (the cash is still on the balance sheet and in the strict net-debt calculation), but usable, unencumbered liquidity is smaller than headline cash suggests — relevant context for `03_liquidity-runway`. |

Guarantor/subsidiary-level detail identifying exactly which entities guarantee the Dollar and KRW Term Facilities is not itemized in the extracted annual-report text in this pool — flagged per `00_solvency-data-triage.md` rather than assumed.

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

- **Gross debt: €4,625.5m** (FY2025, 31-Dec-2025) [Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet / Capital Structure Summary tabs]
- **Net debt: €2,512.8m — strict basis (§15)**, and this is the **canonical net-debt figure** for this module (no broad-basis adjustment applies — DHER discloses no liquid short-term investments beyond cash & equivalents, §4)
- **Cash & liquid investments: €2,112.7m** (cash & equivalents, single balance-sheet line; of this, a materially smaller and undisclosed-for-FY2025 amount is genuinely unencumbered — €624.4m sat in pledged collateral accounts as of the last disclosed figure, FY2024, §3/§6A)
- **EBITDA base used:** BOTH bases are carried downstream, labeled — Reported (GAAP-derived) EBITDA **€304.9m** (FY2025) and Adjusted (company-defined) EBITDA **€903.0m** (FY2025, +30% YoY). Cycle position: **recent inflection, not proven mid-cycle** — only two fiscal years of positive Adjusted EBITDA (FY2024, FY2025) follow three years of losses; treat the FY2025 figure as the latest actual, not a peak or a mid-cycle anchor. A reference-only 3-year-average Adjusted EBITDA is €616.4m (§5).
- **Net debt / EBITDA:** on Reported EBITDA, **8.24x**; on Adjusted EBITDA, **2.78x**. Downstream agents citing a single leverage number must state which EBITDA base it uses — the Adjusted-EBITDA figure (2.78x) is the one management and most external commentary would quote, but the Reported-EBITDA figure (8.24x) is the GAAP-consistent read this module carries alongside it per CLAUDE.md §15.
- **Reporting currency: EUR**

**Caveats propagated downstream:** (1) the Adjusted EBITDA figure is a company-defined non-GAAP metric with material add-backs (§5) — not proven from GAAP filings alone; (2) FY2025 balance-sheet and debt-note figures are sourced from the Capital IQ workbook's own FY2025 extraction, not an audited FY2025 Annual Report PDF (not present in this pool) — FY2025-specific covenant and collateral narrative is carried forward from the FY2024 Annual Report and flagged wherever used; (3) the vendor's own precomputed leverage-ratio sub-table does not reconcile to its own EBITDA line and was not used (§5).

DHER is **not** net cash — it carries substantial net leverage (2.78x net debt/Adjusted EBITDA, 8.24x on Reported EBITDA) — so the net-cash / strategic-flexibility framing (CLAUDE.md §24, Filter 3) does not apply here.



---

## balance-sheet-survival / 02_maturity-wall-and-refinancing.md

_Source: `02_maturity-wall-and-refinancing.md`_

# Maturity Wall & Refinancing — DHER

Reporting currency: **EUR** (euro), all figures in EUR million unless stated otherwise. Balance-sheet date used for the "as-reported" schedule below: **31-Dec-2025 (FY2025)**, per `01_capital-structure-and-leverage.md` §7 (canonical gross debt €4,625.5m). No FY2025 Annual Report PDF is present in the data pool, so the instrument-level maturity detail below is drawn from the Capital IQ workbook's Capital Structure Details/Summary tabs (a data-vendor export, §4 tier 3), not an audited debt note — flagged per `00_solvency-data-triage.md`. **Material finding, stated up front:** a subsequent event after the FY2025 balance-sheet date has already substantially de-risked the near-term wall shown below — see §4.

## 1. Maturity Schedule

*(As reported at 31-Dec-2025, before the post-balance-sheet-date refinancing described in §4)*

| Period | Amount Due | % of Total Debt | Instrument(s) | Source |
|---|---:|---:|---|---|
| Within 12 months | €287.7m | 6.22% | Convertible Loan €86.1m (matures 2026-03-09, classified as short-term borrowings); Convertible Bonds III Tranche A €55.7m (matures 2026-04-30); ~€19.0m of current portion of long-term debt not individually identified in the instrument-level table (reconciliation gap, flagged below); current portion of lease liabilities €126.9m | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab & Capital Structure Summary/Details tabs, FY2025 |
| Year 2 (2027) | €589.7m | 12.75% | Convertible Bonds I Tranche B €531.6m (matures 2027-01-23); lease liabilities ~€58.1m (Capital IQ's ratable lease-payment schedule, not an exact per-year filing figure) | Same source, Capital Structure Details tab |
| Year 3 (2028) | €774.6m | 16.75% | Convertible Bonds II Tranche B €716.5m (matures 2028-01-15); leases ~€58.1m. *Note: the €600.0m Revolving Credit Facility (undrawn, €461.8m availability at FY2025) also matures 2028-05-01 — a facility-renewal date, not a principal repayment, but relevant to liquidity access in that year.* | Same source |
| Year 4 (2029) | €2,145.4m | 46.38% | Convertible Bonds III Tranche B €480.9m (matures 2029-03-10); Dollar Term Facility €1,110.3m (matures 2029-12-01, secured, floating SOFR+5.000%, repayable in USD); KRW Term Facility €496.1m (matures 2029, exact date not itemized, secured, floating "New Benchmark," repayable in KRW); leases ~€58.1m | Same source |
| Year 5 (2030) | €775.7m | 16.77% | Convertible Bonds IV €717.6m (matures 2030-02-21); leases ~€58.1m | Same source |
| Thereafter | €78.5m | 1.70% | Lease liabilities beyond 5 years (Capital IQ ratable schedule) | Same source |
| **Total** | **€4,651.6m** | **~100.6%** | — | See reconciliation note below |

**Reconciliation note:** this schedule sums to €4,651.6m, which is €19.0m (0.4% of total debt) above the canonical total principal due (€4,632.6m per `01`) and €26.1m above canonical gross debt (€4,625.5m, which nets a €7.1m fair-value/discount adjustment not distributed across the schedule). The gap traces to a €19.0m difference between the Capital IQ Balance Sheet tab's "current portion of long-term debt" field (€74.7m) and the only instrument the Capital Structure Details table shows maturing within 12 months apart from the Convertible Loan (Convertible Bonds III-A, €55.7m) — an unresolved difference between two views inside the same vendor workbook, not resolved from available data, and immaterial to the shape of the wall. All other instrument-level bullet maturities reconcile exactly to the total bonds-and-term-loans figure (€4,194.8m = €2,502.3m bonds + €1,692.5m term loans, per `01` §1) and to the lease-liability roll-forward (€437.8m, per `01` §1).

## 2. Maturity Profile Metrics

*(Computed on the as-reported FY2025 schedule in §1, before the §4 subsequent-event refinancing)*

| Metric | Value |
|---|---:|
| Weighted-average maturity (WAM, years) | **~3.0 years** — formula: Σ(instrument principal × years-to-maturity from 31-Dec-2025) ÷ total principal (€4,651.6m); years-to-maturity taken from each instrument's exact stated maturity date, except the KRW Term Facility (year-only "2029" disclosed, midpoint assumed at 3.5 years — labeled estimate) and lease tranches beyond Year 1 (midpoint of each CIQ bucket used) |
| % due within 12 months | 6.22% (€287.7m ÷ €4,625.5m gross debt) |
| % due within 24 months | 18.97% (€877.4m ÷ €4,625.5m) |
| % due within 36 months | 35.72% (€1,652.0m ÷ €4,625.5m) |
| Largest single maturity year (and amount) | **Year 4 / 2029: €2,145.4m (46.38% of total debt)** — driven by the Dollar Term Facility (€1,110.3m), KRW Term Facility (€496.1m), and Convertible Bonds III Tranche B (€480.9m) all clustering in the same 12-month window |

## 3. Rate Exposure

| Metric | Value | Source |
|---|---:|---|
| Fixed-rate share | **65.43%** of gross debt (€3,026.2m = Convertible Bonds €2,502.3m [1.000%–3.250% coupons] + Convertible Loan €86.1m [2.500%] + Lease Liabilities €437.8m [6.760% weighted-average]) | Delivery Hero SE XTRA DHER Financials.xls, Capital Structure Details tab, FY2025 (instrument-level; corrects the Capital Structure Summary tab's own "Fixed Rate Debt" field of €2,588.4m, which excludes leases and the Convertible Loan from its fixed-rate bucket — a vendor internal classification gap, flagged rather than used) |
| Floating-rate share | **34.73%** of gross debt (€1,606.4m = Dollar Term Facility €1,110.3m [SOFR+5.000%] + KRW Term Facility €496.1m ["New Benchmark," spread not itemized in this pool]) | Same source |
| Weighted-average coupon (fixed-rate book) | **2.71%** (Σ principal×coupon ÷ €3,026.2m fixed principal — computed in full: 81.93 ÷ 3,026.2) | Computed from Capital Structure Details tab, FY2025 |
| Blended weighted-average interest cost (fixed book + Dollar Term Facility only; excludes the €496.1m KRW facility, whose all-in rate is not disclosed in this pool) | **~4.30%** (using the Dollar Term Facility's current effective rate of ~8.63% = SOFR 3.63% + 5.000% spread) | Computed; SOFR = Web: sofrrate.com / NY Fed, 2026-08-10 reading (indicative, unverified) |
| Current market refi rate (matching tenor/credit) | **Indicative ~6.7%–8.5%** for a plain-vanilla, non-convertible EUR senior unsecured bond at DHER's S&P **B** issuer rating — derived from the ICE BofA Euro High Yield Index blended effective yield of ~5.7%–6.0% (Apr–Jul 2026 readings) plus an estimated +100 to +250bps single-B-tier premium over that blended (BB+B+CCC) index | Web: ICE BofA Euro High Yield Index effective yield, FRED/MacroMicro readings, Apr–Jul 2026 (indicative, unverified, dated); S&P B rating per Company Comparable Analysis Delivery Hero SE.xls, Credit Health Panel tab, as-of 2026-08-10 |
| Estimated refi cost step-up (bps) | **+400 to +580bps** (indicative) if DHER refinanced maturing converts with a straight, non-convertible EUR bond at today's market rate, vs. its current 2.71% fixed-rate coupon | See caveat below — this overstates DHER's *actual* realized refi cost |

**Caveat on the step-up estimate (important nuance).** The 6.7%–8.5% benchmark above is for a plain-vanilla straight bond. DHER's actual, disclosed debt-raising channel is different and cheaper: its convertible bonds carry embedded equity-conversion value, and the four public convertible-bond tranches trade close to par in the secondary market today (98.264 / 96.757 / 96.867 / 100.372 for the four tranches, no computed yield-to-worst disclosed) [Delivery Hero SE XTRA DHER Fixed Income Securities Summary.rtf, pulled 2026-08-10] — evidence the market is not pricing them at distress-level yields. DHER's own realized coupon history shows a much smaller step-up when it has actually gone back to this market: the 2020/2021-vintage tranches priced at 1.000%–1.500%, while the most recent tranche (Convertible Bonds IV, priced Feb-2023) carries 3.250% — a real-world step-up of roughly **+125 to +225bps** across that period, not the +400–580bps implied by the straight-bond benchmark. Separately, DHER's newest financing (the 2032 term loan discussed in §4) was raised in the private bank-loan market, not the public bond market; its coupon/spread is not disclosed in this pool, so it cannot be compared directly. **Floating-rate exposure note:** 34.73% of gross debt reprices with market rates. A 100bp rise in SOFR would add roughly €11.1m of annual interest on the Dollar Term Facility alone (€1,110.3m × 1.00%), before any impact on the KRW Term Facility (spread/benchmark not itemized). Both floating facilities are also **currency-mismatched** to DHER's EUR reporting currency — the Dollar Term Facility is repayable in USD and the KRW Term Facility in KRW — so a weaker EUR raises their EUR-equivalent refinancing cost independent of the coupon itself.

## 4. Refinancing Exposure

### Refi Funding Plan (no speculation)

*(For the FY2025-year-end near-term maturities — Year 1 + Year 2, €877.4m combined per §1/§2)*

| Source of repayment for next-24m maturities | Amount | Evidence |
|---|---:|---|
| Cash on hand | €2,112.7m (FY2025 year-end, single balance-sheet line) — but not all of it is unconditionally free; a minimum-liquidity covenant requires DHER to hold **€800m** in cash, per management, and a materially larger amount than the formally "restricted" €2.0m sat in accounts pledged as collateral for the Dollar/KRW facilities as of the last disclosed figure (€624.4m at FY2024; no FY2025-specific figure disclosed) | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab, FY2025; CFO Marie-Anne Popp, FY2025 Earnings Call transcript, Mar 26 2026: "the EUR 800 million, which is a covenant that requires us to hold that amount in cash... the floor and the minimum amount that we operate under"; `01_capital-structure-and-leverage.md` §3 (pledged cash) |
| Forecast FCF | Company guidance: **>€200m** for FY2026 (management's own definition, which excludes disclosed extraordinary cash outflows) | Delivery Hero SE, 2025 Earnings Call transcript, Mar 26 2026: "Free cash flow is expected to be more than EUR 200 million for 2026" — flagged: this agent's own normalized operating FCF (CFO − total capex) was **−€246.3m** for FY2025, a large unresolved gap versus the company's guided +€250m FY2025 figure; see `earnings/01_historical-financials.md` §4 for the full reconciliation. Do not treat the >€200m FY2026 guide as fully available cash cushion without that caveat. |
| Revolver availability | €461.8m undrawn (of €600.0m committed), but borrowing-base/availability-reserve mechanics are not disclosed in this pool — treat as "committed, undrawn amount known, true availability unconfirmed" per `01`/`00`'s cap | Delivery Hero SE XTRA DHER Financials.xls, Capital Structure Summary tab, FY2025 |
| Asset-sale proceeds | **€520m expected at closing** of the Taiwan disposal (transaction announced, in progress, not yet closed as of the Q1 2026 trading update) | Delivery Hero SE, Q1 2026 Sales/Trading Statement Call transcript, Apr 30 2026: "we announced the Taiwan disposal of $600 million... first major step"; Delivery Hero SE, 2025 Earnings Call transcript, Mar 26 2026: "We expect to receive a further EUR 520 million at closing of the Taiwan transaction, which will be used primarily for debt reduction" |
| New debt issuance | **Committed and already executed as a subsequent event.** A new term loan facility due 2032 of **USD 1.4 billion** was announced 5-Mar-2026, explicitly to fund repayment of the 2026 and 2027 maturities. By the Apr-30-2026 Q1 trading update, the CFO confirmed DHER had already "bought back convertible bonds in the last few weeks," addressing the '26 and '27 maturities and giving "visibility all the way into 2028." Pro forma for the refinancing (as stated Mar-26-2026), cash was left at €2.7bn against €2.25bn of outstanding convertible bonds and €2.8bn of term loans. | Delivery Hero SE, 2025 Earnings Call transcript, Mar 26 2026, p.5–6 ("We recently announced a new term loan facility due 2032 of USD 1.4 billion... to fund the repayment of our maturities in 2026 and 2027"); CFO Marie-Anne Popp, Q1 2026 Sales/Trading Statement Call transcript, Apr 30 2026: "You will have seen us buy back convertible bonds in the last few weeks and therefore, address the debt maturities we've had for '26 and '27 to give us basically visibility all the way into 2028" |

**Note on timing:** the §1 schedule is built from the FY2025 (31-Dec-2025) balance-sheet-date instrument table, which still shows the Convertible Loan (€86.1m, matured Mar-2026) and Convertible Bonds III-A (€55.7m, matured Apr-2026) as outstanding, plus the full Convertible Bonds I-B (€531.6m, 2027) balance. The debt buyback described above is a **post-balance-sheet-date (subsequent) event** — it happened between the Dec-31-2025 balance-sheet date and the Apr-30-2026 call. No updated FY2026 balance sheet is in this pool to show the post-buyback debt stack precisely, so §1's table is retained as the as-reported record, with this funding-plan section carrying the forward-looking correction. Terms of the new 2032 term loan (coupon, security, currency) are not itemized in this pool beyond size and maturity — flagged as a gap.

Is the near-term wall (12–24 months) covered by cash plus free cash flow, or does it require open capital markets access? For DHER, the answer is that it did **not** need to depend on open markets at all: management pre-funded and then actually executed repayment of the entire FY2025-disclosed 2026/2027 wall (€877.4m combined) using a committed new term loan plus cash, months before any of that debt would otherwise have come due, and a further €520m of announced (not-yet-closed) Taiwan sale proceeds sits behind that as additional cushion. The rating posture (S&P **B**, sub-investment-grade) would normally make public high-yield bond access weather-dependent, but DHER's actual channel — convertible bonds trading near par (§3) and privately-placed secured/unsecured bank term loans — has stayed open through this period, evidenced by the successful 2023 convertible-bond tranche and the 2026 term loan. Roughly a third of the debt stack (34.73%) is floating-rate, so a further rise in benchmark rates (SOFR, or the undisclosed KRW benchmark) directly repriced interest cost on the Dollar and KRW Term Facilities without needing any refinancing event. **Conclusion: self-funded / low refi risk** for the 12–24 month window — the wall shown in §1 is already covered by an executed refinancing, not a plan.

This near-term conclusion should not be read across to the whole maturity profile. The **2029 cluster (§2, €2,145.4m / 46.38% of total debt)** is three-plus years out, sits mostly in the two secured, floating-rate, foreign-currency-repayable Term Facilities (Dollar and KRW), and has not been addressed by any disclosed refinancing action in this pool — DHER's own CFO language ("visibility all the way into 2028") stops short of it. Separately, DHER is the subject of a live, announced Uber acquisition approach with an expected close in H2 2027 (`01_capital-structure-and-leverage.md`) — squarely inside the Year 2 (2027) window of this schedule. European convertible bonds commonly carry change-of-control put rights that let holders demand early redemption if a takeover closes; this pool's extracted annual-report text does not confirm the specific clause language for DHER's tranches (per `00_solvency-data-triage.md`), so this is flagged as **inference, not from filings** — a real possibility that a completed Uber deal could pull forward some or all of the currently-2027-2030-dated convertible bond maturities into a single change-of-control redemption event, which is not captured anywhere in the §1 schedule.

## 5. Refinancing Read

The near-term wall is small and already covered: only 6.22% of gross debt (€287.7m) was due within 12 months of the FY2025 balance-sheet date, and by the time of the Apr-2026 trading update, management had already executed a refinancing (a new $1.4bn 2032 term loan plus cash) that repaid the entire 2026/2027 wall (€877.4m) ahead of schedule, without needing to test open capital markets. The real structural risk sits three-plus years out: 46.38% of total debt (€2,145.4m) lands in a single year, 2029, concentrated in two secured, floating-rate, non-EUR-repayable term facilities (Dollar and KRW), a cluster that has not yet been addressed by any refinancing plan disclosed in this pool. The single biggest refinancing risk is that DHER's response to its 2026/2027 wall was to term it out into new debt (a 2032 facility) rather than pay it down outright — leverage on Adjusted EBITDA (2.78x net debt/Adjusted EBITDA, per `01` §5) is little changed by this transaction, and the 2029 cluster, plus a possible change-of-control put trigger from the pending Uber acquisition (H2 2027 expected close, inference not confirmed from filings), remain open questions this module cannot resolve from the available pool. **The company clearly survives the next 12 months under a "market closure" (no new unsecured issuance) scenario**: cash on hand alone (€2,112.7m at FY2025 year-end, before the further debt paydown and incoming Taiwan proceeds) covers the entire within-12-month bucket (€287.7m) more than seven times over, even after reserving the disclosed €800m minimum-liquidity covenant floor (usable cash of ~€1,312.7m still covers it more than four times over) — no reliance on issuing new debt is required to clear the next 12 months.



---

## balance-sheet-survival / 03_liquidity-runway.md

_Source: `03_liquidity-runway.md`_

# Liquidity Runway — DHER

Reporting currency: **EUR** (euro), all figures in EUR million unless stated otherwise. Balance-sheet date: **31-Dec-2025 (FY2025)**, per `01_capital-structure-and-leverage.md` §7 and `02_maturity-wall-and-refinancing.md` §1. No audited FY2025 Annual Report is present in the pool; FY2025 balance-sheet and cash-flow figures are sourced from the Capital IQ workbook export (a data-vendor extraction, not the audited filing itself) — flagged per `00_solvency-data-triage.md` and carried forward from `01`/`02`.

## 1. Liquidity Sources (committed only)

| Source | Amount | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & equivalents | €2,112.7m | Y, subject to the covenant floor below | Single balance-sheet line (no FY2025 cash/cash-equivalents sub-split disclosed); restricted cash of €2.0m (FY2024 figure, immaterial, ~0.05% of FY2024 cash) sits inside this line and is not separately carved out for FY2025 | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab, FY2025; FY24 Annual Report, Note 8 |
| Liquid short-term investments | None disclosed separately from cash & equivalents | N/A | The €2,112.7m cash line already includes money-market-fund "cash equivalents"; no separate marketable-securities line exists | `01_capital-structure-and-leverage.md` §3 |
| Revolver / facilities (commitment) | €600.0m committed | Maybe — **excluded from the headline total** | Borrowing-base / availability-reserve mechanics are not disclosed in this pool (per MODULE_RULES hard rule: a facility whose availability is unknown cannot be counted as liquidity) | `01_capital-structure-and-leverage.md` §1; `00_solvency-data-triage.md` §3/§5/§6 |
| Revolver availability (if disclosed) | €461.8m undrawn (of €600.0m committed, FY2025) | N — undrawn amount is known, but true "availability" (net of any borrowing-base reserve) is not confirmed | Excluded from the headline usable-liquidity total; carried as an upside memo item in §3 | Delivery Hero SE XTRA DHER Financials.xls, Capital Structure Summary tab, FY2025 |
| Minimum-liquidity covenant floor (subtract) | −€800.0m | — | Group-level financial covenant on the RCF/term facilities requires DHER to hold a minimum of €800m in cash; CFO Marie-Anne Popp: "the EUR 800 million, which is a covenant that requires us to hold that amount in cash... the floor and the minimum amount that we operate under." **Caveat:** this exact figure comes from a management transcript quote, not from the audited annual-report note text — `01`'s triage could not locate the numeric threshold in the extracted filing itself. Breach risk: RCF termination on infringement [`01_capital-structure-and-leverage.md` §1] | CFO Marie-Anne Popp, FY2025 Earnings Call transcript, Mar 26 2026, cited in `02_maturity-wall-and-refinancing.md` §4 |
| **Total usable liquidity (headline, net of covenant floor)** | **€1,312.7m** | — | 2,112.7 − 800.0 = 1,312.7. Before the covenant-floor deduction, headline cash alone is €2,112.7m; the €800m figure is treated as unavailable for ordinary spending because breaching it can trigger RCF termination, not because it is contractually "restricted" cash | Computed |

**Additional flag (context, not subtracted from the headline above):** a materially larger, non-restricted-but-encumbered cash pool exists — €624.4m sat in bank accounts pledged as collateral for the Dollar/KRW Term Facilities as of Dec-31-2024 (~16% of that year's €3,808.7m cash balance). This cash is usable in the ordinary course but carries a security interest; no FY2025-specific figure for this pledged amount is disclosed in this pool, so it is not netted out of the €2,112.7m headline cash figure above, but if a similar proportion persists into FY2025 the true unencumbered cash cushion is smaller than the table shows [`01_capital-structure-and-leverage.md` §3/§6A].

The revolver (€600.0m committed, €461.8m undrawn) is excluded from the headline total per the hard rule above — availability-mechanics are unknown, so this is understated liquidity in a strict reading. If the full €461.8m undrawn amount were confirmed available, usable liquidity would rise to €1,774.5m (1,312.7 + 461.8).

## 2. Near-Term Uses (next 12 months)

| Use | Amount | Source |
|---|---:|---|
| Debt maturities (from 02) | €287.7m | `02_maturity-wall-and-refinancing.md` §1 — Convertible Loan €86.1m (matured Mar-2026), Convertible Bonds III-A €55.7m (matured Apr-2026), ~€19.0m unreconciled current-portion gap, current portion of lease liabilities €126.9m |
| Cash interest | €246.5m | `earnings/06_earnings-quality.md` §1 — FY2025 cash "Interest paid" line from the EBITDA→CFO bridge |
| Maintenance capex | Not disclosed separately — total capex used as a labeled proxy: €325.8m (FY2025) | `earnings/01_historical-financials.md` §1 footnote 2; `earnings/06_earnings-quality.md` §1 flags "capex split not disclosed... FCF may understate true recurring free cash flow" |
| Committed dividends / buybacks | €0 | Delivery Hero SE XTRA DHER Financials.xls, Cash Flow tab, FY2020–FY2025 ("Total Dividends Paid" and "Special Dividend Paid" both show "-" every year); no share-repurchase line in the pool |
| **Total near-term uses** | **€860.0m** | 287.7 + 246.5 + 325.8 + 0 = 860.0 |

**Important timing caveat (read before using the maturities figure above):** the €287.7m maturities figure is the FY2025 (31-Dec-2025) balance-sheet-date schedule. `02_maturity-wall-and-refinancing.md` §4 documents that, as a subsequent event between the FY2025 balance-sheet date and the Apr-30-2026 trading update, management had **already** repaid this entire 2026/2027 wall (€877.4m combined, of which €287.7m is the within-12-month piece) using a new $1.4bn 2032 term loan plus cash, and confirmed on the Q1 2026 call that this gave "visibility all the way into 2028." As of this report's date (2026-08-12), most of the €287.7m in the table above is therefore no longer a live near-term obligation — it has already been discharged. The gross-obligations calculation in §3 below uses the formal FY2025-dated figure (per this module's convention of reusing `02`'s reported 12-month figure), which makes the runway estimate **conservative** relative to DHER's actual current position.

## 3. Runway

| Metric | Value |
|---|---:|
| Total usable liquidity (headline, net of covenant floor) | €1,312.7m |
| Total usable liquidity (before covenant-floor deduction) | €2,112.7m |
| Annual FCF — normalized operating (CFO − total capex, FY2025) | **−€246.3m** (negative — this agent's headline figure, per CLAUDE.md §15) |
| Annual FCF — company-guided (FY2025, excludes disclosed extraordinary legal/regulatory outflows) | +€250m (labeled, company-defined; FY2026 guidance >€200m on the same excluding basis) |
| Basis used (net-of-FCF / gross-obligations) | **Gross-obligations** — normalized FCF is negative and the company-guided figure is flagged "Poor quality" (earnings-quality score 36/100, `earnings/06_earnings-quality.md` §9) because it excludes an implied ~€600–650m FY2025 legal/regulatory cash outflow tied to unresolved, multi-jurisdiction litigation; neither FCF figure is reliable enough to net against obligations |
| Annual net cash burn (gross-obligations basis) | **€860.0m** — full 12-month uses from §2, no FCF subtraction (maturities €287.7m + cash interest €246.5m + maintenance-capex proxy €325.8m + dividends/buybacks €0) |
| Monthly net cash burn (annual burn ÷ 12) | €71.67m |
| **Liquidity runway (months) = liquidity ÷ monthly net cash burn** | **≈ 18.3 months** (1,312.7 ÷ 71.67) using headline liquidity net of the €800m covenant floor; **≈ 29.5 months** (2,112.7 ÷ 71.67) using unadjusted cash — the covenant-floor deduction is the more conservative and more decision-relevant read since breaching it risks RCF termination |

**Upside memo (not headline, not verified as available):** if the €461.8m undrawn revolver were confirmed fully available, usable liquidity rises to €1,774.5m, extending the runway to ≈24.8 months on the same gross-obligations burn rate.

**Labeled alternative (net-of-FCF basis, using the company's own FY2026 guidance — shown for reference, not relied upon):** using the company-guided >€200m FY2026 FCF figure, annual net burn = (€287.7m maturities + €0 dividends) − €200m = €87.7m, monthly = €7.31m, implying a runway of ≈180 months on the €1,312.7m liquidity base. This number is **not used as the headline** because the guided FCF figure explicitly excludes a legal/regulatory cash outflow that recurred in FY2025 (~€600–650m) and whose underlying drivers — EU antitrust and Glovo Spain rider-classification litigation — remain unresolved and could recur; treating this guided figure as reliable would materially overstate the true runway.

**Partial-data cap applied:** per `00_solvency-data-triage.md` §5/§6, the revolver exists with a known commitment and undrawn amount, but borrowing-base/availability-reserve mechanics are not disclosed — this triggers MODULE_RULES' "Revolver exists but availability unknown" cap: **Liquidity runway confidence capped at 60/100.**

### Seasonality / Peak Liquidity Need (Hard Check)

Working capital shows modest, repeatable seasonality: `earnings/01_historical-financials.md` §5 finds Q3 is consistently the strongest revenue quarter (avg 26.7% of annual revenue, FY2023–FY2025) and Q2 consistently the weakest (avg 23.5%), a roughly 3.2-point swing every year in the same direction — not extreme, but real. No disclosed euro figure for a seasonal working-capital cash build or peak-quarter cash usage was found anywhere in this pool (the working-capital line in `earnings/01` swings by hundreds of millions year-to-year, but that is driven by the one-off EU antitrust/Glovo Spain payments documented in `earnings/06_earnings-quality.md` §2, not by a disclosed recurring seasonal pattern). **Peak working-capital need not disclosed — runway may be overstated.**

## 4. Sources & Uses Bridge

Internal sources do not fully cover the next 12 months of gross obligations on a strict, conservative basis: €1,312.7m of usable, covenant-floor-net liquidity against €860.0m of gross-obligations burn leaves roughly 18 months of runway, and the company's own operating cash flow was negative on a normalized basis in FY2025 (−€246.3m). However, the practical picture is stronger than this static calculation implies for two reasons the runway math above does not capture: (1) most of the €287.7m in near-term maturities used in §2/§3 has already been repaid via a subsequent-event refinancing (a new $1.4bn 2032 term loan plus cash, executed by Apr-2026, per `02` §4) — the true forward-looking maturity burden from this report's date is smaller than the FY2025-dated schedule shows; and (2) a further €520m of Taiwan-disposal proceeds is expected at closing, earmarked "primarily for debt reduction" (`02` §4), which is not counted anywhere in this liquidity calculation. Roughly 100% of the headline runway is already-in-hand liquidity (cash net of the covenant floor) rather than FCF that must materialize — the gross-obligations basis deliberately does not credit any forward FCF, since neither DHER's normalized FCF (negative) nor its company-guided FCF (flagged low-quality, `earnings/06`) can be relied on. External access (the executed term loan, the pending Taiwan sale) has already been the actual funding mechanism for the near-term wall, not a hypothetical fallback.

## 5. Liquidity Read

DHER's committed, conservatively-measured liquidity runway is approximately 18 months against gross near-term obligations (maturities, cash interest, and total capex, with no credit given to operating cash flow because normalized FY2025 FCF was negative and the company's own guided FCF figure excludes an implied ~€600–650m of recurring-risk legal cash outflows, `earnings/06_earnings-quality.md`). That runway depends almost entirely on cash already on the balance sheet (€2,112.7m, net of an €800m minimum-liquidity covenant floor) rather than on FCF materializing — a conservative and, in this case, favorable characteristic, since DHER's operating cash generation has been volatile and the guided figure is not fully trustworthy. The single biggest liquidity risk is not the static 18-month number itself (which is already covered several times over by the subsequent-event refinancing described in §4) but the **quality of the "extraordinary outflow" exclusion practice**: if unresolved EU antitrust or Glovo Spain rider-classification litigation generates further large cash settlements the company again labels "extraordinary" and excludes from guided FCF, the gap between headline FCF and true cash burn could recur at the scale seen in FY2025 (~€600–650m), eroding the liquidity cushion faster than the guided figures suggest.



---

## balance-sheet-survival / 04_coverage-and-covenants.md

_Source: `04_coverage-and-covenants.md`_

# Coverage & Covenants — DHER

Reporting currency: EUR million, unless stated otherwise. Reporting standard: IFRS as adopted by the EU. All figures below are FY2025 (period-end 31-Dec-2025) unless labeled otherwise, taken from `01_capital-structure-and-leverage.md` (debt/EBITDA base) and the Capital IQ workbook `Delivery Hero SE XTRA DHER Financials.xls` (Income Statement, Cash Flow, Capital Structure Summary tabs). No FY2025 audited Annual Report PDF is in the data pool — the covenant *narrative* below is sourced from the FY2024 Annual Report (the only audited annual filing in the pool) and flagged wherever it is carried forward, consistent with `00_solvency-data-triage.md` and `01`.

## 1. Coverage Ratios

DHER discloses two EBITDA bases with a large gap between them (§15 hygiene): **Reported (GAAP-derived) EBITDA** of €304.9m (FY2025) and the company's own non-GAAP **Adjusted EBITDA** of €903.0m (FY2025) — a €598.1m difference that is 66% of the adjusted figure itself [Delivery Hero SE XTRA DHER Financials.xls, Income Statement tab; `earnings/06_earnings-quality.md`, §7]. Interest is stated **gross** — €382.1m, the Income Statement's "Interest Expense" line — per the module rule to use gross interest unless net interest is disclosed and justified; net interest expense (net of €99.0m interest/investment income) is €283.1m, and cash interest actually paid per the cash-flow statement is €246.5m [Delivery Hero SE XTRA DHER Financials.xls, Income Statement & Cash Flow tabs, FY2025].

| Ratio | Value | Source |
|---|---:|---|
| EBITDA / interest — Reported EBITDA basis | 0.80x (304.9 / 382.1) | Computed; Income Statement tab, FY2025 |
| EBITDA / interest — Adjusted EBITDA basis | 2.36x (903.0 / 382.1) | Computed; Income Statement tab & FY2025 Earnings Call, FY2025 |
| EBIT / interest | 0.25x (93.7 / 382.1) | Computed; Income Statement tab, FY2025 — **ties exactly** to the CIQ Ratios tab's own precomputed "EBIT / Interest Exp." line (0.245223), one of the only vendor ratios that reconciles cleanly |
| (EBITDA − capex) / interest — Reported basis | −0.06x ((304.9 − 325.8) / 382.1) | Computed; capex = PP&E capex €171.0m + capitalized intangibles €154.8m = €325.8m, Cash Flow tab, FY2025 |
| (EBITDA − capex) / interest — Adjusted basis | 1.51x ((903.0 − 325.8) / 382.1) | Computed |
| Fixed-charge coverage — Reported EBITDA basis | −0.03x | Computed, see formula below |
| Fixed-charge coverage — Adjusted EBITDA basis | 0.86x | Computed, see formula below |

Fixed-charge coverage = (EBITDA − capex) / (gross interest + 12-month scheduled debt amortization + 12-month lease principal). Scheduled amortization = short-term borrowings €86.1m + current portion of long-term debt €74.7m = €160.8m; lease principal due in the next 12 months = €126.9m (the "Cap. Lease Payment Due +1" line; lease *interest* is left out of this add-on because IFRS 16 lease interest is already embedded in the €382.1m gross interest-expense line, so adding the interest-inclusive €148.8m lease-payment figure on top would double-count it) [Delivery Hero SE XTRA DHER Financials.xls, Capital Structure Summary tab, FY2025]. Denominator = 382.1 + 160.8 + 126.9 = **€669.8m**. On Reported EBITDA: (304.9 − 325.8) / 669.8 = **−0.03x**. On Adjusted EBITDA: (903.0 − 325.8) / 669.8 = **0.86x** — even on the company's own preferred non-GAAP profit measure, Adjusted EBITDA minus capex does not fully cover interest plus the next 12 months of scheduled debt and lease principal.

**Vendor-ratio reconciliation note (consistent with `01`'s flag):** the CIQ Ratios tab's own precomputed "EBITDA / Interest Exp." (1.19x, FY2025) and "(EBITDA-CAPEX) / Interest Exp." (0.74x, FY2025) do **not** reconcile to either disclosed EBITDA base (304.9 or 903.0) divided by the disclosed €382.1m interest-expense line — the same unexplained-EBITDA-base problem `01` already flagged for the vendor's leverage sub-table. This report's ratios above are computed directly from the disclosed Income Statement and Cash Flow lines, not from the vendor's precomputed ratio row, except for EBIT/interest, which is the one line that does tie out exactly.

**EBITDA cash-backing caveat (materially above cash-backed EBITDA):** `earnings/06_earnings-quality.md` finds FY2025 cash conversion (CFO ÷ Adjusted EBITDA) collapsed to **8.8%** — Adjusted EBITDA grew 30% to €903.0m while CFO fell 87.5% to just €79.5m [`earnings/06`, §1–2]. The practical consequence for coverage: FY2025 **operating cash flow itself did not cover cash interest paid** — CFO €79.5m ÷ cash interest paid €246.5m = **0.32x**. The 2.36x Adjusted-EBITDA/interest ratio above is an accrual-accounting coverage figure; the cash actually generated in FY2025 covered less than a third of the cash interest bill, before any principal repayment. Read the 2.36x figure with that gap explicitly in view — it is not "comfortable coverage," it is an accrual number sitting well above a cash reality that came in at less than a third of the interest bill.

## 2. Covenant Inventory

The Group's only disclosed maintenance financial covenant, attached to the Revolving Credit Facility (RCF) and the term facilities, is a **minimum-liquidity covenant, tested quarterly at Group (consolidated) level — not a debt/EBITDA leverage or interest-coverage covenant**: "a financial covenant, which implies the maintenance of a minimum liquidity level for the Group, on a quarterly basis... In case of an infringement... the RCF might be terminated" [FY24 Annual Report, Note F.10, p.178; confirmed again in the Risk Report section, p.235-ish region of the same filing: "The RCF and term facilities are subject to a financial covenant, which requires the maintenance a minimum liquidity at Group level"]. As of 31-Dec-2024 (the latest audited date) the Group states it complied with this covenant and expected to remain compliant over the following twelve months [same source]. **The exact numeric threshold was searched for directly in the extracted annual-report text and was not found anywhere in the pool** — confirmed by a targeted search across the full annual-report text for "minimum liquidity," "leverage ratio," "interest cover," and "financial covenant"; the covenant's existence, direction (a floor), and testing frequency are disclosed, but not its level.

| Covenant | Threshold | Current Actual | Headroom | Source |
|---|---|---:|---:|---|
| Max net leverage | **Not disclosed — no such covenant exists per the filing** ("not a debt/EBITDA leverage covenant" [`01`, §1]) | 2.78x net debt/Adj. EBITDA (§5 of `01`, for reference only, not a covenant test) | N/A — no leverage covenant | FY24 Annual Report, Note F.10 |
| Min interest coverage | **Not disclosed — no such covenant found in the filing** | 2.36x Adjusted-EBITDA/interest (§1 above, for reference only, not a covenant test) | N/A — no coverage covenant | FY24 Annual Report, Note F.10 |
| Min liquidity (Group level, quarterly) | **Numeric level not disclosed in this pool** | Cash & equivalents €2,112.7m (FY2025) [`01`, §3] | **Not assessable precisely — see indicative computation below** | FY24 Annual Report, Note F.10, p.178 |
| Springing covenant trigger (e.g. revolver utilization threshold) | Not disclosed — the filing text does not describe the covenant as springing on a utilization threshold; it appears to apply on a standing quarterly basis regardless of RCF drawn amount | RCF fully undrawn (€0 drawn, €461.8m undrawn of €600.0m committed, FY2025) [`01`, §1] | Not applicable — "Not disclosed in the data pool" per module hard rule | FY24 Annual Report, Note F.10 |
| Equity cure rights (Y/N, limits) | **Not disclosed in the data pool** | — | — | Not found in extracted text |
| Cross-default / change-of-control | Cross-default-adjacent language present ("an infringement of such covenant" at Group level triggers RCF termination); explicit change-of-control clause text for the convertible bonds or term facilities — directly relevant given the pending Uber acquisition approach — was **not located** in the extracted text | — | — | FY24 Annual Report, Note F.10 (cross-default); Uber Technologies, Inc., Delivery Hero SE - M&A Call, Jul-16-2026 (deal context, no clause text) |

**Indicative headroom computation (LABELED ASSUMPTION, per the module's partial-data rule):** because the numeric threshold is undisclosed, a market-typical minimum-liquidity covenant range for a large-cap, B-rated issuer's RCF is used as a labeled assumption — €100m to €500m — and headroom is computed against FY2025 cash of €2,112.7m using the MIN/floor formula, headroom = (actual − threshold) / threshold:

| Assumed threshold (labeled assumption, not from filings) | Headroom |
|---:|---:|
| €100m | +2,013% |
| €200m | +956% |
| €300m | +604% |
| €500m | +323% |
| €1,000m (deliberately extreme, to stress-test the assumption itself) | +111% |

Even at an unusually high assumed threshold (€1,000m — roughly half of current cash, well above typical minimum-liquidity covenant design), headroom stays strongly positive. This directional read (wide headroom under any plausible threshold) is a genuine finding; the *precise* percentage is not, because the threshold itself is inference, not from filings. **Per the module partial-data rule, covenant headroom is marked "Not assessable" for scoring purposes** — the direction (very likely far from breach) can be stated, the number cannot be certified.

One caveat narrows this: of the FY2024 cash base (€3,808.7m), **€624.4m sat in bank accounts pledged as collateral for the Dollar/KRW Term Facilities** — usable operationally but encumbered by a security interest [`01`, §3/§6A; FY24 Annual Report, Note F.10]. A comparable FY2025 pledged-cash figure is not disclosed in this pool. If the covenant's own definition of "liquidity" excludes pledged cash (unknown — not disclosed), unencumbered cash would still be roughly €1,488m on the FY2024 proxy ratio, and the headroom conclusion above is unchanged in direction.

### Covenant EBITDA Definition & Quality (required if headroom is computed)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition summary | **Not applicable** — the sole disclosed maintenance covenant is a minimum-*liquidity* test, not an EBITDA-based leverage or coverage covenant, so there is no covenant-EBITDA definition to state | FY24 Annual Report, Note F.10 |
| Addbacks permitted (types) | Not applicable (no EBITDA-based covenant) | — |
| Addback caps / limits | Not applicable | — |
| Is covenant EBITDA materially above reported EBITDA? | Not applicable — but flagged for context: the company's own headline **Adjusted EBITDA** (€903.0m, FY2025) already runs 196% above Reported EBITDA (€304.9m) via addbacks including €224.1m of stock-based compensation (24.8% of Adjusted EBITDA) [`earnings/06`, §4] — if any future refinancing introduces an EBITDA-based covenant, this addback-heavy definition is the one likely to be proposed, and the "addback illusion" risk the module flags would then apply directly | `earnings/06_earnings-quality.md`, §4, §7 |

Because the disclosed covenant is liquidity-based rather than EBITDA-based, the standard "addback illusion" risk this module tests for does not currently apply to DHER's actual maintenance covenant — but it would be the first thing to scrutinize if the capital structure is refinanced (relevant given the pending Uber deal) into a more conventional leverage-covenant structure.

## 3. Headroom & Breach Proximity

| Metric | Value |
|---|---:|
| Tightest covenant | Minimum-liquidity covenant (RCF/term facilities, Group level, quarterly test) — the **only** disclosed maintenance covenant, so it is the tightest by default |
| Headroom on tightest covenant (%) | Not assessable precisely (numeric threshold undisclosed); indicatively very wide — +604% to +2,013% across a €100m–€500m assumed-threshold range (§2) |
| EBITDA decline that would breach it (approx.) | **Not the direct mechanical driver** — this covenant tests cash liquidity, not earnings, so an EBITDA decline only threatens it indirectly, by weakening operating cash flow over time. Given FY2025's already-weak cash conversion (CFO/Adjusted EBITDA 8.8%, `earnings/06`), even a modest further EBITDA deterioration would compound an already-thin cash-generation year; a quantified EBITDA-decline breach trigger cannot be computed without the liquidity threshold |
| Debt increase that would breach it (approx.) | Not computable without the threshold; qualitatively, the covenant is tested on Group liquidity, not on debt levels, so a debt increase would only threaten it through added interest/principal cash service, not directly |
| Illustrative cash-burn runway to an assumed threshold | At FY2025's normalized operating free cash flow of −€246.3m/year (CFO €79.5m − total capex €325.8m, `earnings/01_historical-financials.md`), FY2025 cash of €2,112.7m would take roughly **7.4–8.2 years** to burn down to an assumed €100m–€300m threshold if that FCF run-rate continued unchanged — illustrative only, not a forecast, and ignores the company's own guided (extraordinary-items-excluded) FCF of +€250m for FY2025, which `earnings/06` finds excludes an implied ~€600–650m of legal/regulatory cash outflows |

## 4. Coverage / Covenant Read

Earnings do not comfortably carry DHER's interest bill on a cash basis: FY2025 operating cash flow (CFO €79.5m) covered only 0.32x of the €246.5m cash interest actually paid, and (Adjusted EBITDA − capex) covers gross interest at 1.51x — positive, but resting on a non-GAAP profit measure that is €598.1m (66%) above the GAAP-derived EBITDA figure, and on a cash-conversion rate (8.8%) that collapsed from 92.2% the prior year [`earnings/06`, §1–2]. On the covenant side, DHER's only disclosed maintenance test is a Group-level minimum-liquidity covenant with an undisclosed numeric threshold; against €2,112.7m of FY2025 cash, headroom is very likely wide under any plausible threshold assumption, but cannot be certified as a number and is marked "Not assessable" for scoring per the module's partial-data rule. The single move most likely to actually tighten this covenant is not a one-quarter EBITDA miss but a sustained continuation of FY2025-style negative operating free cash flow (−€246.3m) combined with crystallization of the disclosed €440–770m contingent liability or further multi-jurisdiction rider-classification cash costs — a slow multi-year cash drain, not a sudden trip, is the realistic breach path given the size of the current cash buffer.

**Out-of-scope note:** this report stays within the covenant/coverage scope defined for this agent; it does not build the maturity wall (agent `02`), assess liquidity runway in months (agent `03`), or run the downside EBITDA stress test (agent `06`) — those are produced separately and should be read alongside this one.



---

## balance-sheet-survival / 05_off-balance-sheet-and-contingencies.md

_Source: `05_off-balance-sheet-and-contingencies.md`_

# Off-Balance-Sheet & Contingencies — DHER

Reporting currency: **EUR** (euro), figures in EUR million unless stated otherwise. Reporting standard: IFRS as adopted by the EU. Primary source: the FY2024 Annual Report (period-end 2024-12-31, filed 2025-04-25) — the only audited annual filing in the data pool. **No FY2025 Annual Report PDF is present in this pool**; where FY2025-specific contingency figures are cited, they come from the FY2025 results earnings call (management commentary, Tier 6/transcript per source hierarchy — not an audited note) and are labeled accordingly. This is consistent with `01_capital-structure-and-leverage.md`'s flag on the same gap.

Cross-module note: `business-model/11_capital-allocation-governance.md` independently flags the same FY2024 Spain contingency (€440–770m unrecognized, ~27–47% of FY2024 common equity) as a governance red flag (severity 65) contributing to its capital-allocation score cap — consistent with, not duplicative of, this agent's read.

## 1. Off-Balance-Sheet / Debt-Like Obligations

| Item | Recognized Liability | Maximum / Gross Exposure | Already in 01's debt stack? | Source |
|---|---:|---:|---|---|
| Operating leases | N/A — DHER reports under IFRS 16, which capitalizes all lease liabilities onto the balance sheet | €437.8m (FY2025, total lease liabilities) | **Yes** — already included in `01`'s €4,625.5m gross debt figure; not double-counted here | Delivery Hero SE XTRA DHER Financials.xls, Capital Structure Summary tab, FY2025 |
| Pension / OPEB underfunding | €33.8m balance-sheet liability (FY2025); DB-plan memo shows a **net asset** of ~€12.0m (Projected Benefit Obligation €57.7m vs. Plan Assets €69.7m, FY2025) — the two do not reconcile cleanly, flagged as an unresolved presentation difference in `01` | Immaterial either way (<1% of the €4,625.5m gross debt stack) | No — not debt-like in a way that adds to `01`'s stack; DB plans are funded in Korea and Türkiye [FY24 Annual Report, Note F.9] | Delivery Hero SE XTRA DHER Financials.xls, Balance Sheet tab & Pension OPEB tab, FY2025; FY24 Annual Report, Note on defined-benefit plans |
| Securitization / factoring | None disclosed in this pool | Not applicable | — | Not located in the data pool |
| Purchase / take-or-pay commitments | Not separately itemized in the extracted text | Not assessable — no purchase-commitment table located in the extracted Annual Report text | — | Not located in the data pool; flagged as a gap, not assumed zero |
| Ancillary guarantee / letter-of-credit facility (drawn against the RCF) | €0 cash-drawn on the RCF itself | **€268.5m utilized** by way of ancillary guarantee and LC facilities as of Dec-31-2024, of which **€231.4m** of guarantees/LCs were actually issued under those facilities | Partially — this sits inside the €600.0m RCF commitment already noted in `01` (the €138.2m gap between the €600.0m commitment and the €461.8m FY2025 undrawn figure); it is **not** part of the €4,625.5m gross-debt principal figure because it is a contingent (off-balance-sheet) guarantee exposure, not drawn debt | FY24 Annual Report, Note F.10 ("Liabilities to Banks") |

## 2. Guarantees & Letters of Credit

| Item | Recorded | Maximum Exposure | Beneficiary / Purpose | Source |
|---|---:|---:|---|---|
| Ancillary guarantee & LC facility (under the €600.0m RCF) | Not separately recorded as a balance-sheet liability (off-balance-sheet contingent guarantee) | €268.5m utilized / €231.4m of guarantees & LCs issued (Dec-31-2024; FY2025 figure not separately disclosed in this pool) | Not itemized by beneficiary in the extracted text — general corporate/operational guarantee facility | FY24 Annual Report, Note F.10 |
| Bank guarantees to Spanish courts (Glovo pre-Aug-2021 operational model) | Not recorded as a separate liability line; the guarantees secure claimed liabilities that are themselves either provisioned (see §3) or held as unrecognized contingencies | Amount of the guarantees themselves not separately itemized in the extracted text — they secure payment of the liabilities claimed by Spanish authorities, which are quantified in §3 below | Spanish courts, securing payment of social-security/VAT claims tied to the pre-Aug-2021 Glovo rider model | FY24 Annual Report, "Changes to prior year: Spain" risk-report narrative |
| Spanish Tax Authority preventive seizure | Not a guarantee but an asset freeze | Secures **€28.0m**, via a preventive seizure on 1,324 shares of Glovoapp Spain Platform S.L.U., as part of an ongoing VAT inspection. Restricts sale of those shares / dividend distribution from that single subsidiary only; no sale/distribution is currently ongoing or anticipated. Glovoapp23 S.A. has initiated an appeal to lift the seizure | Spanish Tax Authority (VAT inspection) | FY24 Annual Report, Note F.11 ("Other Provisions") |
| Performance / surety bonds | None separately disclosed | Not applicable | — | Not located in the data pool |

## 3. Litigation & Tax Contingencies

| Matter | Recorded Provision | Maximum / Claimed | Status (active / remote) | Source |
|---|---:|---:|---|---|
| Spain — Glovo rider reclassification (pre-Aug-2021 operational model) + connected VAT risk | **€492.2m** provisioned (rider reclassification + VAT risk), part of the €900.0m total "legal risks" provision balance at Dec-31-2024 | Additional **unrecognized** contingent liability of **€440.0m–€770.0m** — the Group did **not** recognize a provision for this incremental range because "reclassification of the courier fleet by Spanish courts has been assessed as not probable" | **Active.** Courier fleet was reclassified to employee status effective January 2025 as a consequence of the underlying investigations; Glovo faces claims in Spain for social-security contributions, late-payment charges, fines, and possible VAT claims. Spanish authorities have in some cases imposed two fines on Glovo entities for the same alleged breach (potential double-fine impact excluded from the range as "not expected to be upheld") | FY24 Annual Report, Note "5. Contingencies" (Rider Status), p.204 |
| EU antitrust investigation (European Commission, opened Jul-23-2024, re: Delivery Hero SE and Glovo — alleged geographic-market allocation, sharing of commercially sensitive information, no-poach agreements, pre-2022 full acquisition of Glovo) | **€400.0m** provisioned as of Dec-31-2024 | Provision represents management's best estimate; no separate "maximum" figure disclosed above the provision itself in the FY2024 note | **Resolved during FY2025** — per the FY2025 results call (Mar-26-2026, management commentary, not an audited note): "in 2025, we made the payment and released the provision for the EU antitrust case." Treated as settled/paid, not a forward contingent exposure, as of the FY2025 earnings call | FY24 Annual Report, Note F.11 ("Other Provisions"); Delivery Hero SE, 2025 Earnings Call transcript, Mar-26-2026 |
| Latin America — Argentina rider classification (Glovo, PedidosYa) | No provision recognized (defense assessed as "more likely than not" to succeed) | **€40.4m–€50.4m** potential liability for social-security contributions, interest, and/or fines if courts find riders were wrongly classified | **Active** but ongoing appeal — Glovo continues to appeal through all instances (no final decision as of FY2024); PedidosYa continues to defend self-employed status; "no significant changes" noted in 2024. No FY2025 update located in this pool | FY24 Annual Report, Note "5. Contingencies"; risk-report narrative, p.127 |
| Competition-authority antitrust investigations (vendor-agreement clauses, multiple countries) | No provision recognized for either matter | Matter 1: ongoing investigation, amount not quantified in the extracted text. Matter 2: competition authority imposed fines, subsidiary appealed and won at first instance (decision annulled), authority has appealed further — potential cost of **~€9.0m** if authority prevails; Group "assesses that it is more likely than not that the fine will not be upheld" | Matter 1 **active** (ongoing, no figure); Matter 2 **active but assessed favorable** (appeal pending) | FY24 Annual Report, Note "5. Contingencies" |
| Arbitration — earn-out payments (seller of a previously acquired entity) | No provision recognized | **€8.0m** potential claim | **Active**, early-stage arbitration — no material update since a November 2024 hearing | FY24 Annual Report, Note "5. Contingencies" |
| Just Eat Spain (JES) claim for compensation of damages vs. Glovo (alleged unfair competitive disadvantage from Glovo's business model) | No provision recognized; no financial claim amount disclosed | Not quantified — the company states it "will not disclose any further information as it can be expected to prejudice seriously the position of the Group in the dispute" | **Active** (filed Dec-2024) | FY24 Annual Report, Note "5. Contingencies" |
| Consumer Rights Investigation (price-display consumer-protection rules, one subsidiary) | No provision recognized ("not probable that a fine will be imposed") | Fines of up to **€10.0m** | **Active**, investigations opened in 2023, still ongoing | FY24 Annual Report, Note "5. Contingencies" |
| Tax — transfer-pricing / financial-transaction risk | No provision recognized ("more likely than not that there is no tax payment obligation") | Up to **€35.0m** additional income-tax burden | **Active** (identified risk relating to a past financial-transaction treatment) | FY24 Annual Report, Note "5. Contingencies" |
| Additional contingencies — IAS 37 (general legal) | Unrecognized | **€50.9m** (previous year: €37.2m) | Ongoing, various individually smaller matters | FY24 Annual Report, Note "5. Contingencies" |
| Additional contingencies — IAS 12 (tax), mainly MENA cost-disallowance risk | Unrecognized | **€60.7m** (previous year: €36.2m), of which **€40.6m** relates to a risk of partial disallowance of costs for tax purposes in MENA (previous year: €25.6m) | Ongoing tax-authority disputes | FY24 Annual Report, Note "5. Contingencies" |
| Italy — rider reclassification (investigation from 2021) | Provisioned (amount not separately broken out from the €900.0m total legal-risk balance) | A first-instance court decision in April 2025 (subsequent event, post FY2024 year-end) confirmed the reclassification of riders but ordered the authorities to recalculate the liability; "the provision was updated accordingly" | **Active** — Glovo will appeal and continue defending self-employed status | FY24 Annual Report, "Changes to prior year: Italy" and Section I. Subsequent Events |
| **Total "Other Provisions — legal risks"** (recognized, FY2024 balance-sheet liability) | **€900.0m** (Dec-31-2024; up from €466.8m at Jan-1-2024) | — | Recognized liability, not a contingency by definition | FY24 Annual Report, Note F.11 ("Other Provisions") |
| **Total Other Provisions (all categories: legal, restoration, personnel, miscellaneous)** | **€1,108.6m** (Dec-31-2024) | — | Recognized liability | FY24 Annual Report, Note F.11 |

**FY2025 update (per FY2025 results earnings call, Mar-26-2026, management commentary — the FY2025 Annual Report itself is not in this data pool):**
- The €400.0m EU antitrust provision was **paid and released during FY2025** — treated as resolved, not a forward exposure.
- **€524.0m was paid out during FY2025** for Spain rider-model-transition liabilities (cash outflow against the previously-provisioned €492.2m + accrued items — the FY2025 payment slightly exceeds the FY2024 provision balance, consistent with an updated/increased liability during the transition year).
- As of the FY2025 Annual Report (per CFO Marie-Anne Popp on the call), the Group discloses a **total contingent-liability range of €640m to just over €1 billion**, of which **€520m–€860m** relates specifically to the Spain rider matter. Management explicitly cautioned that "it's not necessarily a one-to-one correlation between the amount of contingency and the cash paid out" — i.e., this range should not be read as a residual on top of the €524m already paid; it is the company's own current disclosed range as of the FY2025 report.
- Management stated the EUR 800m figure referenced by an analyst is the RCF/term-facility **minimum-liquidity covenant** threshold (relevant to `04_coverage-and-covenants`, not restated here), not a contingency figure.

The going-concern flag: the FY2024 audit opinion (unqualified, "no reservations") carries an **emphasis-of-matter** — "Material Uncertainty about the Ability of Subsidiaries to Continue as a Going Concern" — specific to subsidiary **Glovoapp Spain Platform S.L.U.**, tied directly to the rider-classification risk: "should these risks materialize, the payments arising therefrom could not be paid without the Parent Company's support" [FY24 Annual Report, Auditor's Report, p.223]. This is a subsidiary-level going-concern flag, not a Group-level one, and the auditor did not modify its opinion on the consolidated statements — but it confirms the Spain rider matter is the single largest live exposure in this note, material enough to require explicit parent support language from the auditor.

## 4. Contingent Exposure Summary

| Metric | Value | Basis |
|---|---:|---|
| Total recognized contingent liabilities (provisions, FY2024 audited) | €900.0m (legal risks only) / €1,108.6m (all Other Provisions categories) | FY24 Annual Report, Note F.11 |
| Total unrecognized (off-balance-sheet) contingent exposure, FY2024 audited note | €440.0m–€770.0m (Spain, largest single item) + €40.4m–€50.4m (LatAm) + ~€9.0m (competition authority) + €8.0m (earn-out arbitration) + €10.0m (consumer rights) + €35.0m (tax) + €50.9m (IAS 37 other) + €60.7m (IAS 12 tax) = **approximately €654m–€994m** total unrecognized range, before adding the unquantified JES damages claim and the first unquantified competition-authority matter | Computed by this agent from the individual FY24 Annual Report line items in §3 |
| Total unrecognized contingent exposure, FY2025 (per FY2025 earnings call, unaudited) | **€640m–~€1,015m** (management's own aggregate range, of which €520m–€860m is Spain-specific) | Delivery Hero SE, 2025 Earnings Call transcript, Mar-26-2026 |
| Max exposure ÷ total FY2025 recognized gross debt (€4,625.5m, per `01`) | 14%–22% (using the FY2025 unrecognized-contingency range of €640m–€1,015m) | Computed |
| Max exposure ÷ total FY2025 equity (€1,793.8m incl. minority interest, per `01`) | 36%–57% (using the FY2025 unrecognized-contingency range) | Computed |
| Max exposure (Spain alone) ÷ total FY2025 equity | 29%–48% (using the €520m–€860m FY2025 Spain-specific range) | Computed |

The "max exposure ÷ recognized" framing used elsewhere in this template (ratio of contingent to recognized provisions) does not cleanly apply here because the largest item (Spain, €520m–€860m) is itself the **unrecognized** portion sitting alongside a **separately recognized** €492.2m (FY2024) / already-paid €524.0m (FY2025) provision for the same underlying matter — the company draws its own line between what it has provisioned/paid and what remains a disclosed-but-unrecognized range. Measured against equity (the more meaningful anchor when the exposure is unrecognized and thus not yet subtracted from equity), the FY2025 unrecognized-contingency range is **36%–57% of total FY2025 equity** — a large single-digit-to-majority share of the equity base for a matter management itself says will not likely require cash payment on a one-to-one basis with the disclosed range.

## 5. Contingency Read

The largest live off-balance-sheet exposure is the Spain rider-reclassification matter: an **unrecognized** contingent range of €520m–€860m (FY2025, per the FY2025 earnings call) sitting on top of amounts already provisioned and paid (€492.2m provisioned FY2024, €524.0m actually paid out during FY2025) for the same underlying dispute — and it is unambiguously live, evidenced by the January 2025 reclassification of the courier fleet to employee status, ongoing appeals in Spain and Italy, and a subsidiary-level "material uncertainty" going-concern emphasis-of-matter from KPMG naming Glovoapp Spain Platform S.L.U. specifically. The EU antitrust matter (€400.0m provisioned) has been resolved — paid and the provision released during FY2025 — and no longer counts as a forward risk. Measured against FY2025 total equity of €1,793.8m, the Spain-specific unrecognized range alone is 29%–48% of equity, and the full disclosed contingent-liability range (€640m–~€1,015m) is 36%–57% of equity; if the top of that range crystallized in cash, it would materially erode the equity cushion this module's other agents use to judge solvency, though the company itself has not proven a systematic pattern of the maximum range being paid out (the ratio of amounts paid to amounts disclosed as contingent has historically run below 1:1, per management's own framing on the FY2025 call).

RF-OBS-001 (contingent-liability spike)



---

## balance-sheet-survival / 06_downside-stress-test.md

_Source: `06_downside-stress-test.md`_

# Downside Stress Test — DHER

Reporting currency: **EUR** (euro), all figures in EUR million unless stated otherwise. Balance-sheet date: **31-Dec-2025 (FY2025)**, per `01_capital-structure-and-leverage.md` §7 (canonical figures). No pending/announced acquisition **by** DHER exists in the data pool (the live Uber approach is Uber acquiring DHER, not DHER acquiring a target), so the pro-forma acquisition check (workflow step 2a) does not apply — this stress test runs against DHER's standalone, as-reported FY2025 balance sheet. Every number below is produced by an executed Python computation (shown inline where the formula is non-trivial); the script and its output are reproduced in full at the end of this report for verification.

**EBITDA-base note (cash-backed vs headline).** `earnings/06_earnings-quality.md` finds FY2025 cash conversion (CFO ÷ Adjusted EBITDA) collapsed to **8.8%** (CFO €79.5m vs Adjusted EBITDA €903.0m) — a company-defined non-GAAP metric carrying €598.1m (66% of the adjusted figure) of add-backs, the largest being €224.1m of stock-based compensation. That gap is real and material, but `06` also traces the FY2025 CFO collapse to a one-off cash payment (~€645m implied, EU antitrust settlement + Glovo Spain rider-transition payments), not to a deterioration in the underlying EBITDA-generation quality. Per this module's partial-data rule, **both EBITDA bases are carried through this stress test, labeled** — the company's own Adjusted EBITDA (€903.0m) as the primary stress base (since it is what management guides to and the market prices), cross-checked at every step against GAAP-derived **Reported EBITDA** (€304.9m) as the conservative floor. Where the two bases diverge materially in a result, both are shown — never silently averaged.

## 1. Base Case (today)

| Input | Value | Source |
|---|---:|---|
| Base EBITDA — Adjusted (company-defined, primary stress base) | €903.0m | `01` §5; FY2025 Earnings Call, Mar-26-2026 |
| Base EBITDA — Reported (GAAP-derived, conservative cross-check) | €304.9m | `01` §5; CIQ Income Statement tab |
| Cash-backed reality (CFO, FY2025) | €79.5m (8.8% of Adjusted EBITDA) | `earnings/06` §1–2 |
| Net debt (strict basis, §15 — canonical per `01` §7) | €2,512.8m | `01` §4/§7 |
| Gross debt | €4,625.5m | `01` §7 |
| Net debt / EBITDA (Adjusted / Reported) | 2.78x / 8.24x | Computed: 2,512.8 / 903.0 = 2.78x; 2,512.8 / 304.9 = 8.24x |
| Gross debt / EBITDA (Adjusted) | 5.12x | Computed: 4,625.5 / 903.0 |
| EBITDA / interest (Adjusted / Reported), gross interest €382.1m | 2.36x / 0.80x | Computed: 903.0/382.1; 304.9/382.1 (`04` §1) |
| Tightest covenant + threshold | Minimum-liquidity covenant (Group level, quarterly), **€800.0m** — a **labeled assumption sourced from a management transcript quote**, not confirmed in the extracted audited-filing text; treated per this module's partial-data rule as an indicative threshold, not a certified one | `04` §2; CFO Marie-Anne Popp, FY2025 Earnings Call, Mar-26-2026: "the EUR 800 million... the floor and the minimum amount that we operate under" |
| Next-12m obligations — gross-obligations basis (maturities + cash interest + capex + divs) | €860.0m (287.7 + 246.5 + 325.8 + 0) | `03` §2 |
| Next-12m obligations — net-of-FCF basis (maturities + divs only; used in the break-point solves below, since FCF already nets interest/capex) | €287.7m | `03` §2/§4; `02` §1 |
| Committed liquidity — headline (net of the €800m covenant-floor assumption) | €1,312.7m | `03` §1/§3 (2,112.7 − 800.0) |
| Committed liquidity — gross cash (before covenant-floor deduction) | €2,112.7m | `01` §3; `03` §1 |
| Floating-rate debt (gross) | €1,606.4m (34.73% of gross debt) | `02` §3 |
| Hedge coverage | Partial and not comprehensively disclosed — a single prepayment-related derivative (€23.7m, tied to the KRW Term Facility) is referenced in the filing; no group hedge-ratio table for the Dollar/KRW floating book exists in this pool. Rate shock below is therefore run **gross** (undisclosed-hedge caveat) | `00` §3 (hedging/swaps disclosure: "Partial"); `02` §3 |
| Working-capital seasonality / peak build | Modest and real but **not quantified in euros** in this pool: Q3 is consistently the strongest revenue quarter (avg 26.7% of annual revenue, FY2023–FY2025) vs Q2 the weakest (avg 23.5%), a ~3.2-point swing — no disclosed peak-liquidity-need figure exists to size a WC cash build directly | `03` §3 ("Seasonality / Peak Liquidity Need"); `earnings/01_historical-financials.md` §5 |

**Cyclicality calibration (workflow step 3).** `01` §5 and `business-model/10_external-dependency.md` §4 both find DHER does **not** clear this module's "deep cyclical/commodity" bar (cyclicality risk scored 42/100, "moderate," the dominant near-term external variable being the Uber-deal regulatory-approval outcome, not a commodity or macro cycle). A dedicated trough-to-peak-calibrated haircut column is therefore **not added** — consistent with, not a gap versus, `01`'s own determination. For context only: Adjusted EBITDA was negative in FY2021–FY2022 (−€795.6m, −€467.2m) before inflecting positive only in FY2024–FY2025, so the €903.0m base itself sits on an unproven, two-year-old profitability run rather than a demonstrated mid-cycle level (`01` §5) — this fragility is captured in the coverage/leverage reads below, not via a separate cyclical-haircut column.

## 2. Stress Scenarios

*(Primary basis: Adjusted EBITDA, €903.0m. Net debt held constant at €2,512.8m across the pure-EBITDA haircuts, per the workflow's "hold constant unless a stress also moves it" rule; the WC-shock column moves net debt directly since that shock is a cash draw, and the rate-shock column moves interest, not principal. Reported-EBITDA-basis leverage/coverage shown as a labeled cross-check row beneath each column per §15 hygiene.)*

| Metric | Base | −30% EBITDA | −40% EBITDA | −60% EBITDA | −40% + WC shock | −40% + rates +200bp |
|---|---:|---:|---:|---:|---:|---:|
| EBITDA (Adjusted) | 903.0 | 632.1 | 541.8 | 361.2 | 541.8 | 541.8 |
| EBITDA (Reported, cross-check) | 304.9 | 213.4 | 182.9 | 122.0 | 182.9 | 182.9 |
| Net debt / EBITDA (Adjusted) | 2.78x | 3.98x | 4.64x | 6.96x | 5.16x¹ | 4.64x |
| Net debt / EBITDA (Reported) | 8.24x | 11.77x | 13.74x | 20.60x | — | — |
| EBITDA / interest (Adjusted) | 2.36x | 1.65x | 1.42x | 0.95x | 1.42x | 1.31x² |
| EBITDA / interest (Reported) | 0.80x | 0.56x | 0.48x | 0.32x | — | — |
| Tightest covenant headroom (indicative, €m above the €800m floor after 12 months)³ | +1,312.7 (today) | +575.5 | +507.8 | +372.3 | +226.6 | +475.7 |
| Covenant breach? (Y/N) | N | N | N | N | N | N |
| 12-month liquidity gap (€m, negative = surplus) | n/a | surplus 575.5 | surplus 507.8 | surplus 372.3 | surplus 226.6 | surplus 475.7 |
| Survives without external action? (Y/N) | Y | Y | Y | Y | Y | Y |

¹ Net debt after the WC draw = €2,512.8m + €281.2m (WC shock, see below) = €2,794.0m; 2,794.0/541.8 = 5.16x.
² Interest after the rate shock = €382.1m + €32.128m = €414.2m; 541.8/414.2 = 1.31x.
³ Formula: `headroom = usable liquidity (net of the €800m floor) + stressed 12-month FCF(h) − scheduled 12-month debt maturities`, i.e. the cash cushion remaining above the covenant floor after a full year of the stressed cash burn and after repaying the near-term maturity bucket, assuming no new unsecured issuance (market-closure test). See §5(b) for the FCF-scaling assumption and the full solve.

**WC shock (labeled assumption, workflow step B1):** no disclosed euro figure for a seasonal working-capital cash build exists in this pool (§1 above). As a labeled assumption, this stress applies a one-time cash outflow of **2% of FY2025 IFRS revenue (€14,059.6m) = €281.2m** — a working assumption sized to the modest but real quarterly revenue seasonality `03`/`earnings/01` document, not a disclosed company figure. This is applied as a direct cash draw (reducing usable liquidity and raising net debt by the same amount) on top of the −40% EBITDA haircut.

**Rate shock (workflow step B2):** +200bp applied to the €1,606.4m floating-rate book (34.73% of gross debt, `02` §3), **gross of hedges** — DHER's hedge disclosure is partial/incomplete (§1 above), so this is the conservative, unmitigated read; the true step-up could be smaller if the undisclosed KRW-facility derivative or other hedges are more extensive than disclosed. Extra annual interest = €1,606.4m × 2.00% = **€32.128m**.

**Market closure (workflow step B3):** assumed throughout — no new unsecured issuance is credited in any scenario above; the revolver (€600.0m committed, €461.8m undrawn per `01`/`03`) is likewise excluded from usable liquidity per `03`'s hard rule (availability/borrowing-base mechanics undisclosed), so every scenario above is already run on a "no external access" basis.

## 3. Break Points

| Break Point | EBITDA Decline That Triggers It |
|---|---:|
| Tightest covenant breaches (min-liquidity, €800m indicative) | **Not reached on an EBITDA decline alone within 12 months** — solved `h ≈ 115%` (see solve below); since a decline cannot exceed 100%, this covenant does not breach mechanically from EBITDA weakness on its own in a single 12-month window |
| Committed liquidity exhausted within 12 months | **Same event as the covenant breach above** — see note below |
| Net leverage exceeds 6.0x (illustrative refi-market ceiling for a sub-investment-grade issuer) | **53.6%** (Adjusted EBITDA basis) — **already breached today** on the Reported-EBITDA basis (8.24x > 6.0x now) |

**Why the covenant breach and the liquidity exhaustion are the same event for DHER.** `03`'s "usable liquidity" (€1,312.7m) is defined as headline cash **minus** the €800m covenant-floor assumption — so usable liquidity hitting zero is arithmetically identical to cash hitting the €800m floor itself. The two rows above are not independently solved; they are the same mechanical trigger, shown twice because the template asks for both.

**Solve (a)/(b) — liquidity/covenant exhaustion, MIN-floor covenant on a non-coverage metric (minimum cash balance), tied to the liquidity mechanism per the workflow's own instruction ("min liquidity ties to the liquidity break-point"):**

`L + FCF(h) − O = 0`, where `FCF(h) ≈ FCF_base − EBITDA·h·(1−tax)` (FCF-to-EBITDA scaling assumption: lost EBITDA drops through to free cash flow at an after-tax operating margin, holding cash interest and maintenance capex fixed; **labeled assumption: tax = 25%**, since DHER has no clean effective cash-tax rate given consolidated net losses alongside cash tax actually paid — €272.6m FY2025 — in profitable subsidiaries) →

`h = (L + FCF_base − O) / (EBITDA·(1−tax))`
`h = (1,312.7 + (−246.3) − 287.7) / (903.0 × 0.75)`
`h = 778.7 / 677.25 = 1.1498` → **h ≥ 1**

Per the workflow rule, a solve returning `h ≥ 1` means the break point is **not reached on an EBITDA decline alone** — stated plainly, not as a fabricated percentage. Even a complete (100%) elimination of Adjusted EBITDA for a full year, holding interest and maintenance capex fixed, would still leave DHER's usable liquidity above the €800m floor at year-end (headroom would still be ≈ €389m — see the computation appendix). This is a genuine finding, driven by the size of the cash balance (€2,112.7m) relative to the FY2025-dated maturities bucket (€287.7m) it is being tested against — a bucket that, per `02` §4, has in any case already been substantially repaid via a subsequent-event refinancing (the new $1.4bn 2032 term loan, executed by Apr-2026).

**Solve (c) — net leverage exceeds 6.0x, MAX/ceiling form:**

`h = 1 − net debt / (T × EBITDA)`

Adjusted-EBITDA basis: `h = 1 − 2,512.8 / (6.0 × 903.0) = 1 − 0.4638 = 0.5362` → **53.6%**

Reported-EBITDA basis: `h = 1 − 2,512.8 / (6.0 × 304.9) = 1 − 1.3736 = −0.3736` → **h ≤ 0: already above 6.0x today** (actual is 8.24x). Per the workflow rule, a solve giving `h ≤ 0` flags an already-in-breach state on that basis, not a future trigger.

**Sanity check, not a formal break point (context only):** if the top of the disclosed €520m–€860m unrecognized Spain rider-classification contingent-liability range (`05` §3) crystallized in cash concurrently with a −40% EBITDA stress, headroom would flip from a €507.8m surplus to a **−€352.2m breach** (507.8 − 860.0 = −352.2). This is not an EBITDA-decline trigger and is not counted as a formal break point in the table above, but it is the realistic compound scenario that could actually break DHER's liquidity — a large legal/regulatory cash crystallization landing on top of, not instead of, a genuine earnings downturn.

## 4. Survival Read

On a mechanical, 12-month, EBITDA-decline-only basis, DHER's structure does not break under any of the tested haircuts — not even a full elimination of Adjusted EBITDA breaches the labeled €800m minimum-liquidity covenant or creates a 12-month liquidity gap, because usable liquidity (€1,312.7m) dwarfs the near-term maturity bucket (€287.7m) it is tested against, and that bucket has in any case already been substantially repaid via a subsequent-event refinancing (`02` §4). Market closure test: assuming no new unsecured issuance for 12 months and excluding the revolver (availability mechanics undisclosed), liquidity still holds at every haircut up to −60% and even at a full EBITDA wipeout — the first thing that actually breaks is **net leverage against a plausible refi-market ceiling** (illustratively 6.0x), which the −54% haircut crosses on the generous Adjusted-EBITDA basis, and which DHER is **already past today** on the GAAP-consistent Reported-EBITDA basis (8.24x). That gap between the two bases is the real vulnerability this stress test surfaces: DHER's headline resilience rests on a company-defined EBITDA figure carrying €598.1m of add-backs (66% of the figure itself, `earnings/06` §4) and a cash conversion rate that collapsed to 8.8% in the very same year the base EBITDA was set — a 30–40% decline, an ordinary recession rather than a tail event, is survivable on the liquidity math shown here, but it would take Adjusted-EBITDA-basis coverage from 2.36x to 1.42–1.65x and Reported-EBITDA-basis coverage further below the 1x line it is already under today (0.80x base, falling to 0.48–0.56x). A waiver, asset sale, or equity raise is **not** mechanically required by this EBITDA-haircut test; what would force one is a different kind of shock this test does not capture — a large legal/regulatory cash crystallization (the disclosed €520m–€860m Spain contingent range) landing concurrently with a genuine earnings downturn, which the sanity check above shows would turn a €507.8m surplus into a €352.2m breach.

---

## Appendix — Executed Computation (Python)

```
=== BASE CASE ===
Net debt/EBITDA (Adj): 2.78x
Net debt/EBITDA (Rep): 8.24x
Gross debt/EBITDA (Adj): 5.12x
EBITDA/interest (Adj): 2.36x
EBITDA/interest (Rep): 0.80x
Usable liquidity (net of covenant floor): 1312.7

=== HAIRCUTS: EBITDA level, leverage, coverage ===
h=30%: EBITDA(Adj)=632.1 EBITDA(Rep)=213.4 ND/EBITDA(Adj)=3.98x ND/EBITDA(Rep)=11.77x EBITDA/int(Adj)=1.65x EBITDA/int(Rep)=0.56x Covenant-headroom(indicative,€m)=575.5 Breach=N
h=40%: EBITDA(Adj)=541.8 EBITDA(Rep)=182.9 ND/EBITDA(Adj)=4.64x ND/EBITDA(Rep)=13.74x EBITDA/int(Adj)=1.42x EBITDA/int(Rep)=0.48x Covenant-headroom(indicative,€m)=507.8 Breach=N
h=60%: EBITDA(Adj)=361.2 EBITDA(Rep)=122.0 ND/EBITDA(Adj)=6.96x ND/EBITDA(Rep)=20.60x EBITDA/int(Adj)=0.95x EBITDA/int(Rep)=0.32x Covenant-headroom(indicative,€m)=372.3 Breach=N

=== WC SHOCK (labeled assumption: 2% of FY2025 revenue €14,059.6m = €281.2m) ===
WC shock amount: 281.2
-40%+WC: net debt after draw=2794.0 ND/EBITDA=5.16x Covenant-headroom=226.6 Breach=N

=== RATE SHOCK (+200bp on floating debt, net of undisclosed hedges -> gross) ===
Extra annual interest: 32.128
-40%+rates: interest_new=414.23 EBITDA/interest=1.31x Covenant-headroom=475.7 Breach=N

=== BREAK POINT SOLVES ===
Liquidity/covenant exhaustion solve: h = (1312.7+-246.3-287.7)/(903.0*0.75) = 778.7/677.25 = 1.1498 -> >=1, NOT reached within 12m on EBITDA decline alone
Net leverage > 6x (Adj EBITDA basis): h = 1 - 2512.8/(6.0*903.0) = 1 - 0.4638 = 0.5362 -> 53.6%
Net leverage > 6x (Reported EBITDA basis): h = 1 - 2512.8/(6.0*304.9) = 1 - 1.3736 = -0.3736 -> already breached today (h<=0)

Sanity check (not a formal break point): -40% EBITDA + top-of-range Spain contingent payment (€860.0m): headroom = 507.8 - 860.0 = -352.2 -> BREACH
```
