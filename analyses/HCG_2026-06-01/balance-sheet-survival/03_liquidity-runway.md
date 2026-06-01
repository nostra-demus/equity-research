# Liquidity Runway — HCG

HealthCare Global Enterprises Limited (NSE: HCG / BSE: 539787). Report date: 2026-06-01. Cancer-care and multispecialty hospital network operator (India + one centre in Kenya). **Reporting currency: INR million (₹ Mn), consolidated, Ind AS**, as at 31 March 2026 (FY26) unless a date is stated. Fiscal year ends 31 March.

**Cross-module inputs read:** `balance-sheet-survival/01_capital-structure-and-leverage.md` (cash, debt, near-term cash claims), `balance-sheet-survival/00_solvency-data-triage.md` (data gaps and caps), `earnings/01_historical-financials.md` (CFO, capex, FCF), `earnings/06_earnings-quality.md` (is CFO cash-backed?).

**Upstream output missing:** `02_maturity-wall-and-refinancing.md` is not yet in the folder — this agent runs in Layer 2 in parallel with `02`. Per the module rule, I proceed with available data and build the 12-month maturity figure directly from the FY26 current/non-current borrowings split in `01` (the same source `02` will use), flagged as a current-portion figure rather than a clean year-by-year wall. When `02` lands, its 12-month maturity figure should replace the figure used here if it differs.

**Partial-data rule applied (two binds):**
1. **No committed undrawn-facility disclosure.** HCG references a working-capital / cash-credit facility (the parent gives a corporate guarantee for "bank guarantee and cash credit facility"), but commitment size, drawings, availability and borrowing base are **not disclosed in the pool** [00_solvency-data-triage, §3; FY24-25 AR, Note 46(c)]. Per `MODULE_RULES.md`, the revolver is excluded from usable liquidity, headline liquidity = **cash + liquid investments only**, and **liquidity is understated** to the extent any undrawn committed capacity exists. **Liquidity runway score capped at 60.**
2. **Cash flow statement is present** (FY23–FY25 audited; FY26 from board-approved audited results deck), so FCF is **not** proxied — the "no cash flow statement" cap does **not** bind. CFO/FCF are used directly.

---

## 1. Liquidity Sources (committed only)

FY26 (31 March 2026), consolidated, ₹ Mn.

| Source | Amount (₹ Mn) | Usable? | Notes | Source |
|---|---:|---|---|---|
| Cash & cash equivalents (balance-sheet line) | 5,360.5 | Y | Includes ~₹21 Mn liquid mutual funds (treated as cash-like) | FY26 results deck, Consolidated Balance Sheet p.~28; net-debt note p.~14 |
| Liquid short-term investments | (included above) | Y | The ~₹21 Mn mutual-fund holding is the only liquid investment; already inside the cash line | FY26 results deck, net-debt note p.~14 |
| Bank balance held as margin money | ~287 | **N** | **Restricted** — pledged as margin money against bank guarantees / facilities; the company nets it *out of borrowings*, not into cash. Not freely available. | FY26 results deck, net-debt note footnote 1, p.~14; 01 §3 |
| Revolver / cash-credit facility (commitment) | Not disclosed | **N — availability unknown** | A working-capital / cash-credit line exists (parent corporate guarantee given), but commitment, drawings and availability are not in the pool. Excluded per the True-Liquidity-Availability rule. | 00 §3; FY24-25 AR, Note 46(c) |
| Revolver availability (if disclosed) | Not disclosed | N | Borrowing base / drawings not disclosed | 00 §3 |
| **Total usable liquidity (committed)** | **5,360.5** | | Cash only. Excludes ~₹287 Mn restricted margin money and the undrawn (availability-unknown) cash-credit line. | Derived |

**Notes on this table:**
- **Reporting currency: ₹ Mn, consolidated, Ind AS.** Cash is substantially INR; the Kenya operation is small and not separately quantified for cash-trapping in the pool [01 §6A].
- **Headline usable liquidity = cash only (₹5,360.5 Mn)** because no committed-facility availability is disclosed. To the extent HCG holds undrawn committed cash-credit capacity, **this figure understates true liquidity** — but the rule (and the conservative default) require excluding it until availability is shown.
- The short-term working-capital / bank-overdraft borrowings (₹2,829.3 Mn at FY25, "repayable on demand") are *drawn* and sit inside the debt stack [01 §1] — they are not undrawn capacity and add nothing to liquidity.
- **Restricted-cash flag:** ~₹287 Mn margin money is not usable liquidity and is excluded. No other restricted/offshore/trapped cash is quantified in the pool.
- **Note on the company-defined ₹5,430 Mn cash figure:** management's net-debt slide uses cash "including mutual funds" of ~₹5,430 Mn [FY26 deck, p.~14]. The ₹5,360.5 Mn balance-sheet "cash & cash equivalents" line is the conservative figure used here; the gap is other bank balances the company chooses to count. Using the strict line avoids overstating usable cash.

---

## 2. Near-Term Uses (next 12 months)

FY27 (year to 31 March 2027) cash obligations, ₹ Mn. Debt and lease maturities are the **principal** current portions from the FY26 balance-sheet split. Cash interest and maintenance capex are FY26 actuals used as the forward run-rate (HCG is growing, so these are if anything light).

| Use | Amount (₹ Mn) | Source |
|---|---:|---|
| Debt maturities — current portion of borrowings (principal) | 3,112.2 | FY26 results deck, Balance Sheet p.~28 (current borrowings); 01 §1, §7. **Includes the ~₹2.8 Bn on-demand working-capital / overdraft line, which is typically rolled — see note below.** |
| Lease liabilities — current portion (principal) | 649.7 | FY26 results deck, Balance Sheet p.~28; 01 §1, §2 |
| Cash interest — borrowings (~8% avg cost) | ~762 | FY24-25 AR, Consolidated Cash Flow ("Interest and other borrowing cost paid" ₹761.62 Mn FY25); avg cost ~8% [Q4/FY26 transcript, 20 May 2026]; 01 §5 |
| Cash interest — lease liabilities (Ind AS 116) | ~820 | FY24-25 AR, Consolidated Cash Flow ("Interest paid on lease liability" ₹819.95 Mn FY25); 01 §5 |
| Maintenance capex (recurring) | 1,189 | FY26 results deck, "Net Debt (Pre Ind-AS)" slide (maintenance ₹1,189 Mn vs growth ₹1,696 Mn); earnings/06 §1 |
| Committed dividends | 0 | No dividend ever paid; negative consolidated retained earnings (₹(4,092) Mn FY25) legally preclude dividends [01 §6A; FY24-25 AR, Note 16] |
| Committed buybacks | 0 | None disclosed |
| **Total near-term uses (with growth capex excluded)** | **6,532.9** | Derived (3,112.2 + 649.7 + 762 + 820 + 1,189) |
| Memo: Vizag 2nd-tranche deferred consideration (**paid Apr-2026**) | 1,543 | FY26 results deck, net-debt bridge p.~14, p.~16; 01 §2. A real near-term cash call already settled in the FY27 window. |
| Memo: residual Vizag put/forward acquisition liabilities | ~600–1,347 | FY24-25 AR, Note 45.1; 01 §2. Future (mostly >12-month) cash claims; the put (₹634 Mn at FY25) sits in the >4-year bucket [FY24-25 AR, Note 40, consolidated]. |
| **Total near-term uses including the Apr-2026 Vizag payment** | **8,075.9** | Derived (6,532.9 + 1,543) |

**Critical notes on near-term uses:**
- **The ₹3,112.2 Mn "current borrowings" is dominated by the on-demand working-capital/overdraft line (~₹2.8 Bn).** Classified current because it is repayable on demand, but in practice it is a continuously-rolled secured working-capital facility, not a hard amortising maturity. **Treating the full ₹3,112.2 Mn as a 12-month repayment is the conservative reading** and overstates the genuine refinancing call; the true hard-amortisation portion (term-loan current maturities) was only ~₹917 Mn of principal at FY25 [01 §1]. Both readings are shown in §3.
- **Cross-check against the FY25 consolidated contractual-maturity table** (the closest thing to a wall in the pool): <1-year **borrowings** contractual cash outflow = ₹4,020.81 Mn and **lease** = ₹1,341.86 Mn — but these are *contractual outflows including future interest*, not principal, so they are not additive to the separate interest lines above [FY24-25 AR, Note 40 (consolidated), 31 Mar 2025]. The FY26 balance-sheet principal split (₹3,112.2 / ₹649.7) is the cleaner basis for the uses table; the contractual table is shown only to corroborate the order of magnitude.
- **Vizag (₹1,543 Mn) is a one-off acquisition cash call already paid in April 2026.** It is not a recurring obligation, so it is held as a memo and shown as a sensitivity rather than baked into the base near-term-uses run-rate; but because it falls inside the FY27 window it is a real first-quarter draw on the ₹5,360.5 Mn cash balance.

---

## 3. Runway

EBITDA basis: Reported EBITDA ₹4,657.9 Mn (FY26). FCF = CFO − total capex per CLAUDE.md; HCG publishes no own FCF figure. CFO is cash-backed (CFO/Reported EBITDA = 74.5% FY26, above the 70% healthy line for four straight years) [earnings/06 §1-2].

| Metric | Value (₹ Mn) |
|---|---:|
| Total committed liquidity (cash only) | 5,360.5 |
| Annual CFO (FY26) | 3,471 |
| Annual FCF — headline (CFO − total capex 2,885) | 586 |
| Annual FCF — on maintenance capex only (CFO − maint capex 1,189) | 2,282 |
| Total near-term uses, **ex-Vizag, ex-growth capex** (from §2) | 6,532.9 |
| Net near-term obligations = uses − headline FCF | 5,946.9 |
| Net near-term obligations = uses − maintenance-capex FCF | 4,250.9 |

**Runway formula:** Liquidity runway (months) = Total committed liquidity ÷ (net near-term cash burn ÷ 12), where net near-term cash burn = near-term uses − annual FCF.

**Two runway reads (the FCF definition drives the answer):**

1. **On headline FCF (₹586 Mn — i.e. assuming HCG keeps spending ₹1,696 Mn/yr of discretionary growth capex):**
   - Net burn = 6,532.9 − 586 = ₹5,946.9 Mn/yr.
   - Runway = 5,360.5 ÷ (5,946.9 ÷ 12) = 5,360.5 ÷ 495.6 = **~10.8 months.**

2. **On maintenance-capex FCF (₹2,282 Mn — i.e. growth capex paused, the right basis for a survival/runway test):**
   - Net burn = 6,532.9 − 2,282 = ₹4,250.9 Mn/yr.
   - Runway = 5,360.5 ÷ (4,250.9 ÷ 12) = 5,360.5 ÷ 354.2 = **~15.1 months.**

**Stripping the rolled working-capital line (the more economically accurate read).** If the ~₹2.8 Bn on-demand overdraft is rolled (its normal behaviour) rather than repaid, the genuine hard 12-month uses fall to roughly: term-loan principal ~₹917 Mn + lease principal ₹649.7 Mn + cash interest ~₹1,582 Mn + maintenance capex ₹1,189 Mn = **~₹4,338 Mn**. Against maintenance-capex FCF of ₹2,282 Mn, net burn ≈ ₹2,056 Mn/yr → **cash alone covers ~31 months**, and FCF on a maintenance basis (₹2,282 Mn) covers ~53% of these uses outright, so the position is **internally fundable with a wide margin** on this basis.

**Headline runway selected: ~15 months on a maintenance-capex basis (committed cash ₹5,360.5 Mn against net burn of ₹4,250.9 Mn/yr), and effectively open-ended (~31 months on cash, FCF-covered) once the rolled working-capital line is treated as rolled rather than repaid.** The ~10.8-month figure is the conservative outer bound that assumes both (a) the full overdraft is repaid and (b) HCG keeps spending all of its discretionary growth capex — two things that do not both happen in a genuine liquidity squeeze.

**Vizag overlay (Apr-2026, ₹1,543 Mn):** this one-off acquisition payment, made in the first month of FY27, reduces opening cash from ₹5,360.5 Mn to ~₹3,818 Mn. On the maintenance-capex net-burn of ₹4,250.9 Mn/yr that shortens the conservative runway to ~10.8 months; on the rolled-overdraft basis (~₹2,056 Mn net burn) it still leaves ~22 months of cash and remains FCF-covered. The Vizag payment is a known, funded, one-off — not a recurring drain — but it is the single biggest discrete first-half-FY27 call on cash.

### Seasonality / Peak Liquidity Need (Hard Check)

Working capital is **not materially seasonal**: each fiscal quarter is ~24–26% of annual revenue, with only a mild back-half tilt (Q4 ~26%, Q1 ~24%) and no quarter breaching the 30%/20% thresholds [earnings/01 §5]. There is therefore no large intra-year seasonal working-capital build that would create a peak-quarter cash trough materially above the annual-average run-rate.

The relevant non-seasonal swing is the **structural working-capital drain**: working capital has absorbed cash every year (−₹272 Mn to −₹765 Mn; FY26 −₹426 Mn), driven by receivable build (government-scheme / insurance / corporate oncology billing; DSO 56→66→60 days FY24–FY26) [earnings/06 §1, §3]. This is already inside CFO and the FCF figures above, so it is captured, not additive. **A specific peak-quarter working-capital cash requirement is not separately disclosed in the pool — to that extent the runway may be modestly overstated if a single quarter (e.g. a state-scheme collection delay like the Q3FY26 Andhra Pradesh disruption) draws cash ahead of the annual average.** Given the absence of seasonality, the overstatement risk is low.

---

## 4. Sources & Uses Bridge

On a maintenance-capex basis, **internal sources cover the next 12 months without needing the capital markets**: opening cash of ₹5,360.5 Mn plus maintenance-FCF of ~₹2,282 Mn (≈₹7.6 Bn of internal liquidity) exceeds genuine hard 12-month uses of ~₹4.3 Bn (term-loan principal + lease principal + cash interest + maintenance capex), even after the ₹1,543 Mn Vizag payment — *provided the ~₹2.8 Bn on-demand working-capital line is rolled, which is its normal behaviour and which depends on the secured lenders continuing to extend it.* External access (refinancing, asset sale, or a drawdown) is therefore **not required to survive**, but it **is required to keep growing**: HCG's ₹1,696 Mn/yr discretionary growth capex and any further M&A are funded out of the same cash that the rights issue just topped up, not out of free cash flow (headline FCF is only ₹586 Mn).

On the split between in-hand vs must-materialise: **the runway is predominantly in-hand.** Of the ~₹7.6 Bn of internal liquidity, ₹5,360.5 Mn (~70%) is cash already on the balance sheet from the Q4 FY26 ₹4,250 Mn rights issue, and only ~₹2.3 Bn (~30%) is maintenance-basis FCF that must still be generated over FY27. The cash cushion is real and recently funded; the FCF that must materialise is well-supported (74.5% cash conversion, four-year track record), so the must-materialise portion is lower-risk than the in-hand portion is large. The genuine dependency is **not** FCF holding up — it is **the secured working-capital line continuing to roll** (availability undisclosed) and **lenders refinancing the ~₹917 Mn of term-loan amortisation**, neither of which is contractually committed in the pool.

---

## 5. Liquidity Read

On a maintenance-capex basis the runway is **~15 months of committed cash against net cash burn, and effectively open-ended (FCF-covered, ~31 months on cash) once the ~₹2.8 Bn on-demand working-capital line is treated as rolled rather than repaid** — HCG can meet hard near-term obligations from the ₹5,360.5 Mn cash pile (raised in the Q4 FY26 ₹4,250 Mn rights issue) plus ~₹2.3 Bn of maintenance FCF without tapping the capital markets, even after the ₹1,543 Mn Vizag payment made in April 2026. The runway is mostly **already-in-hand** (~70% cash, ~30% must-materialise FCF that is well-supported by 74.5% cash conversion), so survival does not hinge on FCF; it hinges on the rolled working-capital facility continuing to roll and on ~₹917 Mn of annual term-loan amortisation being refinanced. **The single biggest liquidity risk is the undisclosed committed-facility availability:** because no undrawn-revolver capacity is disclosed, usable liquidity is pinned to cash only, and the largest "current" obligation (the ~₹2.8 Bn on-demand overdraft) could in principle be pulled exactly when needed — so the headline runway is conservative on uses but blind on the backstop.

---

### Self-Check
- Liquidity uses **committed facilities only**; the cash-credit/revolver is excluded (availability unknown) and noted; uncommitted/undrawn lines are not counted. ✓
- Restricted cash (~₹287 Mn margin money) flagged and excluded. ✓
- Near-term uses pull the 12-month maturity figure from the FY26 current/non-current split (the source `02` will use); `02` not yet available — noted, and the contractual-maturity table used as a cross-check. ✓
- Runway expressed in months with the formula shown; two FCF bases and a rolled-overdraft read given; the FCF-surplus case (rolled overdraft) stated. ✓
- Split between in-hand liquidity (~70%) and must-materialise FCF (~30%) stated. ✓
- Partial-data rule applied: **no undrawn-facility disclosure → liquidity = cash only, understated, Liquidity runway score capped at 60.** Cash-flow statement present → FCF not proxied, that cap not triggered. ✓
- No banned phrases (no naked "adequate liquidity" / "comfortable" / "strong balance sheet"). ✓
