# Coverage & Covenants — TMCV

**Company:** Tata Motors Limited (formerly TML Commercial Vehicles Limited), NSEI: TMCV
**Reporting regime:** India / SEBI-LODR. Reporting standard: Ind AS. Currency: INR crore.
**Fiscal year:** April–March. FY26 = full year ended March 31, 2026 (first complete audited year as a standalone consolidated entity).
**Upstream inputs used:** `01_capital-structure-and-leverage.md` (debt stack, EBITDA bases, net-cash position); `earnings/01_historical-financials.md` (EBIT, EBITDA, capex, interest); `earnings/06_earnings-quality.md` (cash conversion quality of EBITDA).

---

## 1. Coverage Ratios

**EBITDA basis:** Two bases are used throughout. Reported EBITDA (~₹8,641 crore) is computed from the P&L (operating profit before exceptional items ₹5,922 cr + D&A ₹1,945 cr + finance costs ₹874 cr − FX gain ₹100 cr). Underlying EBITDA (₹10,314 crore, 12.3% margin) is management's primary disclosed metric — it strips out the FVTPL fair-value loss on subsidiary equity investments (₹2,418 cr, non-cash, non-deductible) and MTM hedges but retains SBC. Both are shown. The Underlying EBITDA basis is more representative of operating cash generation; the reported basis is lower because of the recurring but volatile FVTPL item.

**Interest basis:** Gross finance costs of ₹874 crore as disclosed on the P&L (SEBI LODR Consolidated Audited Results, year ended March 31, 2026, filed May 13, 2026). Cash interest paid was ₹884 crore (Cash Flow Statement, same filing) — the small difference reflects discount amortization on lease liabilities. All ratios use gross finance costs of ₹874 crore unless stated.

**Capex:** Total gross capex ₹2,248 crore (PPE ₹1,321 cr + intangibles ₹927 cr) from the Cash Flow Statement. Maintenance vs. growth split is not disclosed; total capex is used, which makes the (EBITDA − capex) / interest ratio conservative.

**Formulas:**
- EBITDA / interest = EBITDA ÷ ₹874 cr
- EBIT / interest = EBIT ÷ ₹874 cr
- (EBITDA − capex) / interest = (EBITDA − ₹2,248 cr) ÷ ₹874 cr
- Fixed-charge coverage = (EBITDA − capex) ÷ (finance costs + scheduled principal repayments + lease payments). Lease payments (principal + interest) approximated from Cash Flow Statement: lease liability repayment ₹226 cr (financing activities); interest component included in finance costs ₹874 cr. Scheduled principal repayment due within one year: ₹3,657 cr (MD&A maturity table, includes NCDs and term loans due within 12 months of March 31, 2026).

| Ratio | On Reported EBITDA (~₹8,641 cr) | On Underlying EBITDA (₹10,314 cr) | Formula | Source |
|---|---:|---:|---|---|
| EBITDA / interest (interest coverage) | 9.9x | 11.8x | EBITDA ÷ ₹874 cr | SEBI LODR results filing, May 13, 2026 — P&L and Cash Flow; FY26 Annual Report (Ind AS), MD&A p.215, p.217 |
| EBIT / interest | 7.0x | 9.8x | EBIT ÷ ₹874 cr (Reported EBIT ~₹6,091 cr; Underlying EBIT ₹8,538 cr) | Same; company also discloses 10.65x interest service coverage ratio using a slightly different EBIT definition per SEBI LODR Key Financial Ratios row (c) — see note below |
| (EBITDA − capex) / interest | 7.3x | 9.2x | (EBITDA − ₹2,248 cr) ÷ ₹874 cr | Capex from SEBI LODR Cash Flow Statement, May 13, 2026 |
| Fixed-charge coverage | 1.2x | 1.4x | (EBITDA − ₹2,248 cr) ÷ (₹874 cr finance costs + ₹3,657 cr due within 1 year + ₹226 cr lease repayment) = (EBITDA − ₹2,248 cr) ÷ ₹4,757 cr | MD&A p.220 maturity table; SEBI LODR Cash Flow Statement |

**Note on disclosed interest coverage ratio:** The SEBI LODR Key Financial Ratios (row c) states interest service coverage of 10.65x for FY26, computed as "(Profit/loss from ordinary activities before tax + Interest on borrowings) / Interest on borrowings." This is essentially (PBT before exceptional items + finance costs) / finance costs = (₹6,091 cr + ₹874 cr) / ₹874 cr = 7.97x on reported numbers, but the disclosed ratio uses a definition that includes profit from equity-accounted investees. The 10.65x figure as disclosed is used for reference in Section 2 but the agent's own computation (EBIT/interest) above is the primary measure.

**EBITDA cash quality caveat:** Per `earnings/06_earnings-quality.md`, CFO/Underlying EBITDA was 145% in FY26, meaning operating cash generation materially exceeds EBITDA. The EBITDA used for coverage is therefore cash-backed — in fact, the EBITDA measure understates actual cash generation. The ₹6,657 crore working capital inflow in FY26 (of which ₹4,088 crore was from other liabilities including customer advances) is partly timing-driven and may not recur at the same scale in FY27. Even adjusting for a normalised working capital build, CFO/Underlying EBITDA of 100–110% is structurally supported by the negative 54-day cash conversion cycle. Coverage ratios using EBITDA are therefore conservative, not optimistic, relative to actual cash generation. No caveat on coverage quality is required on this ground — the opposite is true.

**Key finding:** At 9.9x–11.8x EBITDA interest coverage and 7.0x–9.8x EBIT interest coverage, earnings carry the interest charge by a large margin. The fixed-charge coverage of 1.2x–1.4x is low on the surface but reflects the front-loaded repayment of ₹3,657 crore of debt due within 12 months — this is a maturity concentration issue, not a structural cash-flow gap. With ₹13,048 crore of liquid assets versus ₹4,817 crore of total borrowings, TMCV can repay all existing debt outright and still have net cash of ₹8,231 crore.

---

## 2. Covenant Inventory

### Covenant Disclosure Quality

The FY26 Annual Report (Ind AS), MD&A p.221, "Loan Covenants" section states:

> "Some of our existing financing arrangements require prior lender consent beyond specified thresholds for, among other things, undertaking new projects, issuing new securities, changes in management, mergers, sales of undertakings, material impairments and investments in subsidiaries. In addition, certain negative covenants may limit our ability to borrow additional funds or to incur additional liens, and/or provide for increased costs in case of breach. Certain financing arrangements also include financial covenants to maintain certain net-worth, liability and debt related ratios. We monitor compliance with our financial covenants on an ongoing basis. We also review our refinancing strategy and continue to plan for deployment of long-term funds to address any potential non-compliance and seek any waivers, if required. **For FY26, the Company is in compliance with all the covenants.**"

This discloses: (a) the existence of financial maintenance covenants on net-worth, liability, and debt ratios; (b) compliance as of FY26. It does NOT disclose: the specific thresholds, the actual measured metrics, or individual covenant headroom. The partial-data rule from MODULE_RULES.md therefore applies: actual headroom is not assessable from the data pool.

**Labeled assumption approach:** For a large Indian investment-grade corporate (AA+/BBB rated, operating company debt at low leverage), typical financial maintenance covenants in bilateral bank facilities and NCD trust deeds include:
- Minimum net-worth covenant: typically set at a floor of ~50–70% of the net-worth at facility inception (here, the Company had equity of ~₹10,533 crore at FY25 and ₹12,734 crore at FY26 — a floor of ~₹6,000–7,000 crore is a labeled assumption for indicative purposes).
- Maximum total debt / net-worth or debt / EBITDA: typically 2.0–3.0x debt/equity or 3.0–4.0x debt/EBITDA for an investment-grade CV OEM borrower.
- Minimum interest coverage (EBIT / interest): typically 2.0–3.0x for bank facilities.
These are LABELED ASSUMPTIONS, not disclosed thresholds. They are used only to give an indicative sense of the distance from breach.

| Covenant | Threshold | Current Actual | Headroom | Basis |
|---|---|---:|---:|---|
| Max total debt / net-worth | Not disclosed. Assumed ≤ 2.0x for investment-grade (labeled assumption) | 0.38x (FY26 Key Financial Ratios row a: debt/equity = ₹4,817 cr / ₹12,734 cr) | ~81% indicative headroom vs. 2.0x threshold (actual 0.38x vs. assumed max 2.0x) | Partial-data assumption; actual threshold not disclosed. FY26 Annual Report (Ind AS), MD&A p.221; Key Financial Ratios row (a) |
| Min interest service coverage | Not disclosed. Assumed ≥ 2.0x–3.0x for bank facilities (labeled assumption) | 10.65x (SEBI LODR Key Financial Ratios row c, FY26) | If threshold 2.0x: ~81% headroom. If threshold 3.0x: ~72% headroom | Partial-data assumption; actual threshold not disclosed. SEBI LODR Key Financial Ratios, May 13, 2026 |
| Min net-worth | Not disclosed. Assumed floor ~₹6,000–7,000 crore (labeled assumption) | ₹12,734 crore (FY26 balance sheet equity) | ~45–53% headroom vs. assumed floor | Partial-data assumption; actual floor not disclosed. SEBI LODR Balance Sheet, May 13, 2026 |
| Springing covenant (revolver utilisation trigger) | Fund-based limit ₹4,000 crore; ₹3,750 crore unutilised. No springing covenant disclosed. | N/A — revolver is largely undrawn | N/A | FY26 Annual Report (Ind AS), MD&A p.220–221 |
| Equity cure rights | Not disclosed. Standard Indian NCD trust deeds typically do not include equity cure provisions; bank facilities may. | N/A — no breach; cure rights academic at current metrics | Not assessable | Not disclosed in data pool |
| Negative covenants (incurrence-style) | Prior lender consent required for: new projects, issuing securities, management changes, mergers, sales of undertakings | Compliance confirmed for FY26 | Qualitative — no metric | FY26 Annual Report (Ind AS), MD&A p.221 |

**Partial-data flag:** Covenant headroom is marked "Not assessable" for scoring purposes because specific financial thresholds are not disclosed. The indicative headroom numbers above are computed against labeled assumptions and must not be relied upon as factual outputs. The actual headrooms could be wider or narrower depending on the true threshold.

**Change-of-control / cross-default / rating-trigger scan:** Not individually disclosed in the data pool. The Board's Report (FY26 Annual Report, p.118) notes that the Iveco acquisition required and obtained lender approvals ("All approvals required so far have been timely received"), which implies change-of-control or material transaction consent requirements exist in at least some facilities. No rating-trigger pricing step-ups are disclosed.

### Covenant EBITDA Definition & Quality (required since headroom is computed on labeled assumptions)

| Item | Value / Description | Source |
|---|---|---|
| Covenant EBITDA definition | Not disclosed. Indian NCD trust deeds for AA+ issuers typically use EBITDA as defined in the Ind AS financial statements, without addbacks for exceptional items or FVTPL losses. Working capital limit lenders typically use reported EBIT / EBITDA. | Not disclosed in data pool. |
| Addbacks permitted (types) | Not disclosed. Based on typical Indian bank facility practice, exceptional items (e.g. stamp duty ₹962 cr) may or may not be added back depending on the facility agreement. FVTPL losses (₹2,418 cr) are very unlikely to be added back in standard Indian facilities. | Not proven from available data. Labeled assumption. |
| Addback caps / limits | Not disclosed. | Not disclosed in data pool. |
| Is covenant EBITDA materially above reported EBITDA? | Risk: if covenant definition follows reported Ind AS EBITDA (~₹8,641 cr) rather than Underlying EBITDA (₹10,314 cr), then the relevant denominator for any coverage covenant is ~16% lower. At current metrics this makes no material difference to compliance, but it narrows the stated headroom gap somewhat. | Labeled assumption — actual definition unknown. Flag: "addback illusion" risk cannot be ruled out, but is low at current leverage levels. |

**Conclusion on EBITDA quality for covenants:** Even on the more conservative reported EBITDA basis of ~₹8,641 crore, TMCV's coverage ratios are so far above plausible minimum thresholds that the difference between reported and Underlying EBITDA is immaterial to covenant compliance. This changes materially if the Iveco acquisition closes and introduces EUR 3.8 billion of debt — at that point the EBITDA definition becomes critical.

---

## 3. Headroom & Breach Proximity

**Current balance sheet (pre-Iveco):**

| Metric | Value |
|---|---:|
| Tightest covenant (on labeled assumptions) | Min interest coverage — most likely to be a binding maintenance test in standard Indian facilities |
| Current interest coverage (EBIT/interest, disclosed basis) | 10.65x |
| Labeled minimum threshold (assumed) | 2.0–3.0x |
| Headroom on tightest covenant — indicative only, against assumed threshold (not assessable from filings) | ~72–81% indicative |
| EBITDA decline that would breach min coverage (2.0x threshold, Underlying EBITDA) | EBITDA would need to fall from ₹10,314 cr to ≤₹1,748 cr — a ~83% collapse — before breaching a 2.0x interest coverage floor. At a 3.0x threshold: to ≤₹2,622 cr — a ~75% collapse. Both are remote under any realistic operating scenario. |
| EBITDA decline that would breach min coverage (2.0x threshold, Reported EBITDA) | Reported EBITDA ₹8,641 cr would need to fall to ≤₹1,748 cr — an ~80% collapse. |
| Debt increase that would breach max leverage (2.0x debt/equity threshold, labeled) | Total debt would need to increase from ₹4,817 cr to ₹25,468 cr (2.0x × equity ₹12,734 cr) — additional debt of ~₹20,651 cr — before breaching the assumed threshold. |
| Iveco scenario — the dominant binary event | If the EUR 3.8 bn acquisition (~₹41,691 cr) closes, TMCV would draw the committed EUR 3.8 bn loan (arranged at HoldCo level). TMCV has provided a EUR 1.9 bn (~₹20,846 cr) corporate guarantee. The impact on TMCV's standalone consolidated ratios depends on the ultimate debt allocation and consolidation treatment — this cannot be computed without the final deal structure. However, the guarantee alone would consume all existing net-cash headroom and potentially trigger lender consent requirements. Management confirmed (FQ4 FY26 Earnings Call, May 13, 2026) that all required approvals have so far been obtained. |

**Note on debt service coverage ratio of 1.05x:** The SEBI LODR Key Financial Ratios (row b) discloses a debt service coverage ratio of 1.05x for FY26. This is computed including scheduled principal repayments of ₹3,657 crore due within one year (predominantly NCD maturities). The low ratio reflects a maturity concentration in FY27, not a structural inability to service the debt — the full ₹13,048 crore liquid pool is available to repay these obligations without any refinancing.

**Forward covenant risk — Iveco scenario:** This is the material covenant risk. The transaction would convert TMCV from a net-cash entity into a heavily net-debt entity. Lender consent rights on the acquisition have been exercised — approvals are being obtained. Post-closing, new covenant thresholds in the EUR 3.8 bn acquisition facility (arranged at HoldCo level via TMLCV Holdings B.V.) will apply. Those covenant terms are not disclosed. This agent marks forward covenant risk as significant and not assessable from the current data pool.

---

## 4. Coverage / Covenant Read

TMCV's earnings carry the interest charge by a very large margin on the current balance sheet. At 10.65x interest service coverage (as disclosed in the SEBI LODR Key Financial Ratios) and an EBITDA base that is 145% cash-backed, there is no coverage concern for the existing ₹4,817 crore of borrowings. The fixed-charge coverage ratio of 1.2x–1.4x looks tight but is shaped by a ₹3,657 crore debt maturity due within 12 months of March 31, 2026 — an obligation that is more than covered by the ₹13,048 crore liquid pool without needing to refinance or draw on operating cash flow.

Specific financial covenant thresholds are not disclosed in the Annual Report, so precise headroom is not assessable. The company confirms compliance with all covenants for FY26, and at current leverage (0.38x debt/equity, net-cash position), breach of any plausible minimum coverage or maximum leverage threshold would require an EBITDA collapse of 75–83% or a debt increase of ~5x from current levels — neither of which is remotely credible on a standalone basis.

The one situation that changes this picture entirely is the pending Iveco acquisition (EUR 3.8 bn, ~₹41,691 crore). Closing this deal would erase the net-cash position and introduce substantial new debt at the HoldCo level, with TMCV guaranteeing EUR 1.9 bn. At that point, coverage ratios tighten materially and covenant terms in the new acquisition facility — not yet disclosed — become the binding constraint. The current coverage read is therefore valid only for the pre-Iveco balance sheet; forward coverage assessment requires the deal terms.

---

## Partial Data Applied

- **No specific covenant thresholds disclosed:** The Annual Report (Ind AS), MD&A p.221 confirms the existence of financial maintenance covenants on net-worth, liability, and debt ratios and confirms compliance for FY26, but does not state specific thresholds. Covenant headroom is "Not assessable" for scoring purposes. Labeled assumptions (max debt/equity ≤ 2.0x, min interest coverage ≥ 2.0–3.0x, min net-worth floor ~₹6,000–7,000 crore) are used for indicative breach-distance calculation only and are clearly marked as assumptions throughout.
- **No covenant EBITDA definition disclosed:** The addback policy and definition used in covenant calculations are unknown. The "addback illusion" risk is flagged but assessed as low at current leverage.
- **Pension / OPEB underfunding:** Not determinable from the data pool; not included in fixed-charge denominator.
- **Individual NCD coupon rates:** Not individually disclosed; gross finance costs of ₹874 crore from the P&L used directly.
- **Post-Iveco covenant terms:** Not disclosed; marked not assessable.
