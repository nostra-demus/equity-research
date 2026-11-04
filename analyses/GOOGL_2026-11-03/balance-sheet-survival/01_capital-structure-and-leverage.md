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
