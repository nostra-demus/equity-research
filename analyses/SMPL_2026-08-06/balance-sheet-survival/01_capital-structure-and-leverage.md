# Capital Structure & Leverage — SMPL

**Reporting currency:** US dollars (USD). Figures below are stated in $ millions unless a filing table is quoted directly, in which case the filing's own $ thousands are shown and converted. **Fiscal year:** ends the last Saturday in August (FY2025 ended Aug 30, 2025); interim periods do not track calendar quarters (Q3 FY2026 ended May 30, 2026). **Standard:** US GAAP.

**Time-sensitivity note (per `00_solvency-data-triage.md`):** the FY2025 10-K's debt note is stale. On November 19, 2025 the Company executed an eighth amendment (the "2026 Incremental Facility Amendment") that raised the Term Facility from $250.0 million to $400.0 million and pushed its maturity from March 2027 to March 17, 2030. This report uses the Q3 FY2026 10-Q (period ended May 30, 2026, filed Jul-09-2026) as the current capital structure and cites the FY2025 10-K only for point-in-time comparison. The S&P BB- issuer rating carried in the data pool is dated Jul-14-2022 — more than four years old, predating both the OWYN acquisition financing and the 2026 Incremental Facility Amendment — and is flagged as outdated, not a current read of credit quality [Credit Health Panel, Summary tab; `00_solvency-data-triage.md`].

---

## 1. Debt Stack

All disclosed interest-bearing debt sits under a single syndicated Credit Agreement (originally dated July 7, 2017, amended eight times through the Nov-19-2025 "2026 Incremental Facility Amendment"). There are no public bonds or notes — the entire funded-debt stack is one term loan plus an undrawn revolver.

| Instrument | Amount | Entity (HoldCo/OpCo) | Secured? | Seniority | Collateral | Maturity | Rate (fixed/floating) | Source |
|---|---:|---|---|---|---|---|---|---|
| Short-term debt / current portion | $0.0M | — | — | — | — | — | — | No principal payments are due on the Term Facility in the 12 months following May 30, 2026; entire balance is classified long-term. [Q3 FY2026 10-Q, Note 5 (Long-Term Debt and Line of Credit)] |
| Bonds / notes | None disclosed | — | — | — | — | — | — | No public bonds or notes found in the pool; all funded debt is bank/syndicated. |
| Term loan ("Term Facility") | $400.0M (face); $397.0M net of $3.0M deferred financing fees | OpCo — administrative borrower is Simply Good Foods USA, Inc.; certain subsidiary holding companies are co-borrowers. **The Simply Good Foods Company (the parent, i.e. the NASDAQ-listed entity) is NOT a borrower and has not guaranteed the Credit Agreement.** | Secured | Senior secured (single tranche; the extracted text does not label a separate 1st/2nd-lien split — treat as one senior secured facility) | Pledged equity interests in subsidiaries + a security interest in "substantially all" of the borrowers' and guarantors' domestic assets | March 17, 2030 (extended from March 17, 2027 by the Nov-19-2025 amendment) | Floating — SOFR (0.00% floor) + 2.00% margin, or a base-rate alternative; effective rate 5.7% at May 30, 2026 (down from 6.3% at May 31, 2025). No interest-rate swap or hedge is disclosed in the extracted 10-K/10-Q text — the exposure appears unhedged; to be confirmed by `04_coverage-and-covenants`. | [Q3 FY2026 10-Q, Note 5] |
| Revolver (drawn) | $0.0M drawn of $75.0M committed | Same OpCo borrower/guarantor group as the Term Facility | Secured (same collateral package) | Senior secured, pari passu with the Term Facility (same Credit Agreement) | Same domestic-asset pledge, shared with the Term Facility | Earlier of 91 days pre-Term-Facility-maturity or Dec 16, 2029 (extended by the Nov-19-2025 amendment) | Floating — SOFR + 2.00% margin (or base-rate alternative) | [Q3 FY2026 10-Q, Note 5]. $1.1M of letters of credit are issued against the facility (to support two leased buildings); no cash has ever been drawn as of May 30, 2026. |
| Finance / capital leases | $0.0M | — | — | — | — | — | — | "As of May 30, 2026, the Company had no finance lease agreements." [Q3 FY2026 10-Q, Note 8 (Leases)] |
| **Total gross debt** | **$400.0M** (face) / **$397.0M** (balance-sheet carrying value, net of deferred financing fees) | | | | | | | Sum of the above; ties to "Long-term debt, less current maturities" of $397,037 thousand on the May 30, 2026 consolidated balance sheet. [Q3 FY2026 10-Q, Consolidated Balance Sheets] |

**Covenant on file (for context, detailed in `04_coverage-and-covenants`):** the Revolving Credit Facility carries a maximum total net leverage ratio of ≤6.00:1.00, springing only when revolver draws exceed 30% of total commitments. The Company states it was in compliance with all covenants as of both May 30, 2026 and August 30, 2025. The covenant-EBITDA addback definition is not reproduced in the extracted filing text — flagged per `00_solvency-data-triage.md` as unconfirmed, for `04` to resolve. [Q3 FY2026 10-Q, Note 5]

---

## 2. Other Debt-Like Obligations

| Obligation | Amount | Treatment | Source |
|---|---:|---|---|
| Operating leases (US GAAP, ASC 842) | Total lease liabilities $51.4M (current $8.0M + long-term $43.5M); undiscounted future lease payments $61.1M through the leases' remaining terms (up to 6 years) | Capitalized on-balance-sheet under ASC 842 as a right-of-use asset and a separate lease-liability line (inside "Accrued expenses and other current liabilities" and "Other long-term liabilities" — not on the debt line). **US GAAP does not classify operating leases as debt**; they are shown here as a debt-like obligation but excluded from "gross debt" in Sections 1 and 4 above/below. Real estate and distribution-center leases; no finance leases exist. | [Q3 FY2026 10-Q, Note 8 (Leases)] |
| Pension / OPEB underfunding | None material | The Company sponsors only defined-contribution plans (401(k) and non-US equivalents); no defined-benefit pension or OPEB liability is disclosed. | [FY2025 10-K, Note (Employee Benefit Plans): "The Company sponsors defined contribution plans... All matching contributions are made in cash."] |
| Preferred equity | $0 | 100,000,000 preferred shares authorized, $0.01 par value; none issued or outstanding. | [Q3 FY2026 10-Q, Consolidated Balance Sheets] |

---

## 3. Cash & Liquid Assets

| Item | Amount | Restricted? | Source |
|---|---:|---|---|
| Cash & equivalents | $123.9M (May 30, 2026); $98.5M (Aug 30, 2025) | No restricted-cash line item is disclosed anywhere in the balance sheet or notes; treated as fully unrestricted. | [Q3 FY2026 10-Q, Consolidated Balance Sheets] |
| Liquid short-term investments | None disclosed | n/a — the balance sheet carries a single "Cash" line; Capital IQ's own "Total Cash & ST Investments" export line equals the "Cash And Equivalents" line exactly in every fiscal year shown, confirming no separate short-term-investments balance exists. | [Financials_Annual.xls, Balance Sheet tab] |
| Restricted / trapped cash (flag) | None disclosed | Not flagged in any filing in the pool; no offshore/trapped-cash language found. This is a US domestic company with no material foreign-subsidiary cash-repatriation disclosure in the extracted text. | [Q3 FY2026 10-Q; FY2025 10-K] |

Because there is no separate liquid short-term-investments balance, the CLAUDE.md §15 **strict** basis (gross debt − cash & equivalents) and **broad** basis (also netting short-term investments) are numerically identical here — there is nothing further to net.

---

## 4. Gross & Net Debt

All figures as of the most recent balance-sheet date, **May 30, 2026** (Q3 FY2026 10-Q), unless noted.

| Metric | Value | Source |
|---|---:|---|
| Gross debt (funded debt, face value) | $400.0M | [Q3 FY2026 10-Q, Note 5] |
| − Cash & equivalents | $123.9M | [Q3 FY2026 10-Q, Consolidated Balance Sheets] |
| **Net debt (strict, §15) — CANONICAL** | **$276.1M** | $400.0M − $123.9M = $276.1M |
| − Liquid short-term investments | $0.0M (none disclosed) | See Section 3 |
| **Net debt (broad, incl. investments)** | **$276.1M** (identical to strict — no investments to net) | Same as above |

**Supplemental view — operating leases included (not the §15 broad/investments basis; shown to reconcile against cross-module and vendor figures that bundle lease liabilities into "total debt"):** funded debt net of deferred financing fees ($397.0M) + operating lease liabilities ($51.4M) − cash ($123.9M) = **$324.6M**. This reconciles exactly to the $324.6M net-debt figure in `earnings/01_historical-financials.md` and to the Capital IQ "Total Debt Outstanding" figure of $448.5M (= $397.0M term loan + $51.4M lease liabilities) cited in `business-model/11_capital-allocation-governance.md`. **This lease-inclusive figure is NOT the canonical net-debt figure for this module** — the canonical figure is the $276.1M strict, funded-debt-only figure above, per the module default (MODULE_RULES.md, Calculation Standard 3). Downstream agents (`02`–`06`) should use $276.1M unless they have a specific, stated reason to include leases.

---

## 5. Leverage Ratios

**EBITDA basis used:** the Company discloses both GAAP ("reported") EBITDA and a company-defined non-GAAP "Adjusted EBITDA" (which excludes loss on impairment, stock-based compensation, business-transaction/integration costs, inventory step-up, and term-loan financing fees) every quarter and fiscal year. Reported EBITDA is shown first in every row below; Adjusted EBITDA is never shown without it.

| Ratio | On Reported (GAAP) EBITDA | On Adjusted EBITDA | Source |
|---|---:|---:|---|
| Gross debt / EBITDA — **FY2025** (face debt $250.0M; last full fiscal year) | $250.0M / $177.9M = **1.41x** | $250.0M / $278.2M = **0.90x** | [FY2025 10-K, MD&A "Reconciliation of EBITDA and Adjusted EBITDA"; Q3 FY2026 10-Q, Note 5 (FY2025 comparative face value)] |
| Gross debt / EBITDA — **Latest TTM** (face debt $400.0M, through May 30, 2026) | $400.0M / $(213.1)M = **not meaningful** (negative denominator) | $400.0M / $234.6M = **1.70x** | [`earnings/01_historical-financials.md`, Section 4 TTM table, sourced to Q3 FY2026 10-Q + Q2 FY2026 10-Q MD&A reconciliations] |
| Net debt / EBITDA — **FY2025** (net debt $151.5M = $250.0M − $98.5M cash) | $151.5M / $177.9M = **0.85x** | $151.5M / $278.2M = **0.54x** | Same sources as above |
| Net debt / EBITDA — **Latest TTM** (canonical net debt $276.1M) | $276.1M / $(213.1)M = **not meaningful** | $276.1M / $234.6M = **1.18x** | Same sources as above |
| Debt / capital — **FY2025** | $250.0M / ($250.0M + $1,806.8M equity) = **12.2%** | (n/a) | [Q3 FY2026 10-Q, Consolidated Balance Sheets (Aug 30, 2025 comparative column)] |
| Debt / capital — **Latest** | $400.0M / ($400.0M + $1,418.1M equity) = **22.0%** | (n/a) | [Q3 FY2026 10-Q, Consolidated Balance Sheets] |
| Debt / equity — **FY2025** | $250.0M / $1,806.8M = **13.8%** | (n/a) | Same as above |
| Debt / equity — **Latest** | $400.0M / $1,418.1M = **28.2%** | (n/a) | Same as above |

**Net leverage basis used above: strict (§15).** There is no broad (investment-inclusive) basis to distinguish here (Section 4). If the lease-inclusive supplemental net debt of $324.6M were used instead, the Latest-TTM net leverage on Adjusted EBITDA would read $324.6M / $234.6M = **1.38x** (this is the figure `earnings/01_historical-financials.md` headlines) — 20 basis points of leverage higher than the canonical $276.1M / $234.6M = 1.18x strict reading. Both figures are shown so downstream agents can see the basis gap explicitly.

**Cyclicality check:** SMPL is not flagged as a deep cyclical name. `business-model/07_business-quality.md` scores cyclicality 65/100 (higher = less cyclical) and describes packaged/branded snack food as "a historically defensive, low-macro-cyclicality category," noting the current TTM revenue decline is attributed by management to brand-specific (Atkins) distribution losses, not a broad consumer-spending downturn. The mandatory normalized/mid-cycle EBITDA row for cyclicals is therefore not triggered. That said, the same source flags that Adjusted EBITDA margin (16.9% TTM) is at a **multi-year trough** versus 19–20% in FY2024–FY2025 — a real, still-unfolding decline, not a cyclical low the reader should discount. Leverage computed on the Latest TTM Adjusted EBITDA of $234.6M is therefore not a "peak-earnings" reading that flatters leverage — if anything, the denominator is currently depressed versus the FY2024–FY2025 run-rate, which would make leverage on a normalized EBITDA lower, not higher, than the 1.18–1.70x range shown above. [`business-model/07_business-quality.md`]

---

## 6. Leverage Trend

| Metric | FY2023 | FY2024 | FY2025 | Latest (TTM, May 30, 2026) | Direction |
|---|---:|---:|---:|---:|---|
| Net debt (strict, §15 basis — funded debt only − cash) | ~$197.3M | ~$265.0M | $151.5M | $276.1M | Fell FY23→FY25, then rose sharply |
| Net debt / EBITDA (reported/GAAP EBITDA) | ~0.88x | 1.16x | 0.85x | n/m (negative EBITDA) | Volatile, distorted by impairments |
| Net debt / EBITDA (Adjusted EBITDA) | n/a (Adjusted EBITDA not separately reconciled for FY2023 in this pool) | 0.98x | 0.54x | 1.18x | Rising over the last 12 months |

FY2023 and FY2024 funded-debt figures are sourced from the Capital IQ "Total Term Loans" line (a vendor-computed net-of-financing-fee balance), because no FY2023/FY2024 10-K is present in this data pool to confirm the exact face value directly; FY2025 and Latest figures are confirmed directly from the Q3 FY2026 10-Q's own comparative debt-note table (both periods shown in the same table). [Financials_Annual.xls, Capital Structure Summary tab; Q3 FY2026 10-Q, Note 5]

**Is leverage rising or falling, and why:** Net debt fell over FY2023–FY2025 as the Company paid down "essentially all" of the $250.0M term loan drawn in June 2024 to fund the OWYN acquisition, reaching a low of $151.5M (0.54x Adjusted EBITDA) at FY2025 year-end. It has since reversed sharply: the November 19, 2025 amendment added a fresh $150.0M to the Term Facility (face value $250.0M → $400.0M), and the Company used $213.2M of cash for share repurchases in the 39 weeks ended May 30, 2026 (financing-activities detail: "$150.0 million in proceeds from issuance of long-term debt" and "$213.2 million in repurchases of common stock"). At the same time, Adjusted EBITDA fell from $278.2M (FY2025) to $234.6M (Latest TTM) — a genuine, non-impairment-related margin decline of roughly 330 basis points, not just an accounting artifact — so the leverage increase is a double-move: more debt on a smaller earnings base. Net leverage on Adjusted EBITDA rose from 0.54x (FY2025) to 1.18x strict / 1.38x lease-inclusive (Latest TTM). [Q3 FY2026 10-Q, Note 5 and Consolidated Statements of Cash Flows; `earnings/01_historical-financials.md`; `business-model/11_capital-allocation-governance.md`]

---

## 6A. HoldCo / OpCo & Structural Subordination

| Item | Evidence | Why It Matters |
|---|---|---|
| Where debt sits (HoldCo vs OpCo) | The parent, **The Simply Good Foods Company** (the NASDAQ-listed entity investors hold shares in), **is not a borrower under the Credit Agreement and has not provided a guarantee of it.** Simply Good Foods USA, Inc. is the administrative borrower; certain subsidiary holding companies are co-borrowers; each domestic subsidiary that is not a named borrower has guaranteed the debt on a secured basis. [Q3 FY2026 10-Q, Note 5] | All funded debt sits at the operating-subsidiary level, secured by those subsidiaries' own assets — the standard structure for a syndicated senior secured credit facility. The parent carries no debt of its own to be structurally subordinated to anything. |
| Upstreaming constraints (dividend blockers, regulatory) | Not disclosed in the extracted text as a distinct constraint; the Credit Agreement's covenants generally restrict "payment of dividends and other distributions to equity and warrant holders," which is a constraint ON the OpCo group's ability to upstream cash to the parent, not evidence the parent itself is levered. [Q3 FY2026 10-Q, Note 5] | Matters for `03_liquidity-runway` and `04_coverage-and-covenants` if the parent ever needed to fund something independently of the OpCo group — but the parent has no debt service of its own to fund. |
| Material restricted / trapped cash | None disclosed (Section 3). | n/a |

**Conclusion: Not applicable — no material HoldCo-level debt indicated.** The parent carries zero debt and no guarantee obligation; the entire funded-debt stack sits at the operating-company borrower/guarantor group, secured by that group's own domestic assets. This is not a structural-subordination risk case in the sense this section is designed to catch (there is no separate HoldCo debt layer ranking behind OpCo creditors) — it is the ordinary position of any secured lender ranking ahead of equity.

---

## 7. Leverage Anchor Summary (canonical numbers for downstream agents)

Use these numbers verbatim unless a specific, stated reason exists to deviate:

- **Gross debt (canonical):** $400.0M (face value of the Term Facility; $397.0M net of deferred financing fees on the balance sheet). Revolver undrawn ($0.0M of $75.0M committed; $1.1M of letters of credit issued against it). No finance leases. [Q3 FY2026 10-Q, Note 5]
- **Net debt (canonical): $276.1M — strict basis (§15).** No liquid short-term investments exist to distinguish a broad basis; strict = broad here. A lease-inclusive supplemental figure of $324.6M also exists (used by `earnings/01_historical-financials.md`) — flagged, but **not** the figure to carry forward by default.
- **Cash & liquid investments:** $123.9M cash & equivalents; $0.0M short-term investments; no restricted/trapped cash disclosed. [Q3 FY2026 10-Q, Consolidated Balance Sheets]
- **EBITDA base used:** dual-tracked. Reported (GAAP) EBITDA, Latest TTM (through May 30, 2026) = **$(213.1)M — negative**, driven by ~$392M of non-cash goodwill/intangible impairment recognized across the trailing four quarters (detailed in `earnings/01_historical-financials.md`), so not usable as a leverage denominator. Company-defined **Adjusted EBITDA, Latest TTM = $234.6M** (excludes the impairment, SBC, integration costs, term-loan fees). Not a cyclical name (Section 5) — no peak-vs-mid-cycle split required — but Adjusted EBITDA margin (16.9% TTM) is at a multi-year trough versus FY2024–FY2025 (19–20%), a genuine operating decline, not an accounting artifact.
- **Net debt / EBITDA, Latest TTM:** on Reported (GAAP) EBITDA — **not meaningful** (negative denominator). On Adjusted EBITDA — **1.18x** (canonical, strict net debt $276.1M / $234.6M), or **1.38x** if the lease-inclusive $324.6M net-debt figure is used instead (flag the basis whichever is quoted downstream).
- **Reporting currency:** USD.
- **Caveats to propagate downstream:** (1) leverage on Adjusted EBITDA is quoted here alongside the GAAP-EBITDA ratio, which is currently not meaningful because GAAP EBITDA is negative — do not drop this caveat when citing 1.18x/1.38x. (2) The FY2023/FY2024 funded-debt figures in the trend table are Capital-IQ-sourced (vendor), not directly filing-confirmed, because no FY2023/FY2024 10-K sits in this data pool. (3) The covenant-EBITDA addback definition is unconfirmed (Section 1) — `04_coverage-and-covenants` should treat covenant headroom quality as unconfirmed, not assumed favorable, even though the maximum 6.00x net-leverage covenant carries wide headroom against the 1.18–1.38x actual leverage shown here. (4) The pool's S&P BB- rating is stale (dated Jul-14-2022) and should not be read as a current credit-quality signal.

**Net cash / net leverage framing:** SMPL is **not** net cash — it carries $276.1M of net debt (strict basis) against $234.6M of TTM Adjusted EBITDA (1.18x). This is a real, if still modest by leveraged-finance standards, leverage position, not a cash-rich balance sheet; no "net cash" framing applies here.

