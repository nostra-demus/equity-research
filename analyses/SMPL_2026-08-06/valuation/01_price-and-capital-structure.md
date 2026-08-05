# Price & Capital Structure — SMPL

Reporting standard: US GAAP. Reporting currency: USD (in millions unless stated otherwise; per-share items in whole dollars). Fiscal year ends the last Saturday in August (FY2025 ended August 30, 2025). Jurisdiction: US domestic SEC filer (Delaware incorporation, Nasdaq: SMPL) — 10-K / 10-Q / proxy are the correct primary documents; no local-equivalent substitution issue arises. [FY2025 10-K, cover page; `valuation/00_valuation-data-triage.md` §1A]

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $11.33 (close) | Capital IQ Public Company Profile [TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf, "Share Price as of Aug-04-2026" / "Previous Close 11.33"] | Aug-04-2026 |
| Currency | USD | Same source | — |
| Price basis (last close / intraday / indicative) | Last close ($11.33); a "Last (Delayed)" quote of $11.34 is also shown on the same page | Same source | Aug-04-2026 (close) / delayed intraday quote undated to the minute |

**Cross-check (two independent pool sources agree exactly):** `TheSimplyGoodFoodsCompanyNasdaqCMSMPLEstimatesReport.xls`, Consensus tab, "Latest Price/Last Close Price: 11.34/11.33" [EstimatesReport.xls, Consensus tab, file current to run window 2026-08-06] matches the Public Company Profile PDF's $11.34 delayed / $11.33 close exactly. Both are Capital IQ-sourced pool exports (not two independently-owned data providers), so this is an internal-consistency cross-check within the data pool, not the "two independent web sources" corroboration test — it is not needed here because a genuine pool-verified quote already exists (Source Hierarchy tier 3, `MODULE_RULES.md`), which takes priority over any web quote.

**Stale duplicate flagged (not used):** `The Simply Good Foods Company NasdaqCM SMPL Financials_Annual.xls`, Key Stats tab, "Current Capitalization" box shows a stale embedded price of $10.28 with Shares Out. 88.460545 and Market Cap 909.37 — an older snapshot baked into that workbook export at a prior refresh. This is NOT used as the anchor; it is superseded by the fresher Public Company Profile PDF and the Consensus tab, both of which agree at $11.33/$11.34. Flagged here so downstream agents do not pick up the stale $10.28 figure by mistake.

**Price staleness (quantitative):** Run date 2026-08-06 (Thursday) − quote as-of 2026-08-04 (Tuesday close) = 2 calendar days ≈ 1–2 trading days. This is well inside the 5-trading-day freshness threshold — **no refresh attempt required, no staleness cap applies.**

**Price-state tag: `pool-verified`.**

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | 88,460,545 (Jul-02-2026) | FQ3 FY2026 10-Q cover page: "As of July 2, 2026, there were 88,460,545 shares of common stock, par value $0.01 per share, issued and outstanding." [Form 10-Q (Jul-09-2026), cover page] — cross-checked to Capital IQ Public Company Profile "Shares Out. 88.46" [TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf] |
| Diluted weighted-average shares (period) | 89,940,680 (13 weeks ended May-30-2026) | Form 10-Q (Jul-09-2026), Consolidated Statements of Operations — basic = diluted for this period because the Company reported a net loss, making all potentially dilutive securities antidilutive |
| Options/RSUs count (if disclosed) | Options: 3,429,580 outstanding, wtd-avg strike $23.02, wtd-avg remaining life 6.22 yrs. RSUs (non-vested): 1,121,300, wtd-avg grant-date fair value $22.04. PSUs (non-vested): 353,039, wtd-avg grant-date fair value $34.32. SARs: 150,000 outstanding, wtd-avg strike $37.67 | Form 10-Q (Jul-09-2026), Note on Stock-Based Compensation, all "as of May 30, 2026" |
| Convertibles / potential shares (if disclosed) | None — both the Term Loan and the Revolving Credit Facility are explicitly marked "Convertible: No" | Financials_Quarterly.xls, Capital Structure Details tab, "FY 2025 Capital Structure As Reported Details" |
| **Fully diluted shares (TSM + if-converted)** | **89,934,884** | Agent calculation: 88,460,545 (basic, cover-page) + 1,121,300 (non-vested RSUs, full add) + 353,039 (non-vested PSUs at target, full add) = 89,934,884. Options (3,429,580 @ $23.02) and SARs (150,000 @ $37.67) are excluded entirely — both are out-of-the-money at the $11.33 current price (strike > price), so the treasury-stock method yields zero incremental shares for both |
| Share count used for market cap | 88,460,545 | Cover-page "as of" count, per Fully Diluted Equity Rules Hard Rule 1 |
| Share count used for per-share fair value | 89,934,884 | Fully diluted count above |

**Limitation / simplification stated:** the fully diluted count above adds the full non-vested RSU/PSU count rather than netting each award against its disclosed unrecognized compensation cost (a stricter treasury-stock-method refinement GAAP diluted EPS applies for share-settled awards). Because RSUs/PSUs carry no cash exercise price, the simplification's error is small relative to the options/SARs exclusion, which is unambiguous (both strikes are roughly double the current price). This is a simplified TSM, not the diluted weighted-average of 89,940,680 — the two happen to be close (a coincidence of this being a net-loss quarter where GAAP diluted = basic).

**Material gap noted:** the FY2025 10-K (fiscal year ended Aug-30-2025) reports a full-year diluted weighted-average of 101,510,772 shares (basic 100,695,181 + options 629,800 + non-vested units 185,791) [FY2025 10-K, EPS note]. That count is ~13% higher than the current 88,460,545 cover-page count — the gap reflects roughly 12 million shares repurchased since FY2025 began (buybacks of $213.2 million in the thirty-nine weeks ended May-30-2026 alone [Form 10-Q (Jul-09-2026), cash flow MD&A]). The FY2025 10-K's diluted weighted-average is NOT used for market cap or current per-share fair value — it is a stale, pre-buyback count, shown here only to explain why FY2025-vintage per-share figures elsewhere in the pool run higher share counts than this report's anchor.

## 3. Market Capitalization

`Market cap = share count × current price = 88,460,545 × $11.33 = $1,002.26 million`

Cross-checked exactly to Capital IQ's own computed figure: "Market Capitalization 1,002.26" [TheSimplyGoodFoodsCompanyNasdaqCMSMPL_PublicCompany.pdf, Capitalization box].

## 4. Enterprise Value Bridge

| Component | Amount (USD mm) | Source |
|---|---:|---|
| Market capitalization | 1,002.26 | Section 3 above |
| + Funded debt (Term Loan, net carrying value) | 397.04 | Financials_Quarterly.xls, Balance Sheet tab, "Long-Term Debt" as of May-30-2026 ($397.037M net of unamortized deferred financing fees); gross principal outstanding was $400.0 million [Form 10-Q (Jul-09-2026), Note 5 (Long-Term Debt and Line of Credit): "As of May 30, 2026, the outstanding balance of the Term Facility was $400.0 million... there were no amounts drawn against the Revolving Credit Facility"] |
| + Operating lease liabilities (current + long-term) | 51.43 | Financials_Quarterly.xls, Balance Sheet tab: Curr. Port. of Leases $7.975M + Long-Term Leases $43.452M, as of May-30-2026. The Company had no finance leases as of that date [Form 10-Q (Jul-09-2026), Note 8 (Leases): "As of May 30, 2026, the Company had no finance lease agreements"] |
| + Minority / non-controlling interest | 0 | Financials_Annual.xls, Key Stats tab: "+ Total Minority Interest —" |
| + Preferred equity | 0 | Same source: "+ Pref. Equity —" |
| − Cash & equivalents | (123.88) | Financials_Quarterly.xls, Balance Sheet tab, "Cash And Equivalents" as of May-30-2026 |
| **= Enterprise value (EV)** | **1,326.84** | Sum of the above |

Arithmetic: 1,002.26 + 397.04 + 51.43 + 0 + 0 − 123.88 = 1,326.85 (rounding; ties to Capital IQ's own headline TEV of $1,326.84 in the Public Company Profile bridge, which bundles funded debt and operating lease liabilities into one "Total Debt" line of $448.46M — this report splits that line into its two components for transparency, per the report structure's requirement to state operating-lease treatment explicitly, and the two presentations reconcile exactly: $397.04M + $51.43M = $448.46M).

**Cash quality check:** the $123.88M "Cash and Equivalents" line is genuine operating cash — no restricted cash, margin balances, or long-tenor mark-to-market securities are disclosed anywhere in the FQ3 FY2026 10-Q (searched: no "restricted cash," "short-term investments," or "marketable securities" line items appear in the balance sheet or notes). SMPL has no financial subsidiary and no equity-method investments. No adjustment to the CIQ "cash" figure was needed — it is adopted as-is because it already represents only real, unrestricted operating cash. [Form 10-Q (Jul-09-2026), Consolidated Balance Sheets and Notes]

**Adjustments NOT made, and why:**
- **Pension / OPEB:** no adjustment — SMPL carries no material pension or other post-employment benefit obligation [Financials_Annual.xls, Pension OPEB tab: no material balances; `valuation/00_valuation-data-triage.md` §1, row "Pension OPEB... not material"].
- **Contingent liabilities / litigation reserves:** not incorporated into this bridge — that is `balance-sheet-survival/05_off-balance-sheet-and-contingencies.md`'s scope, not this agent's.
- **Equity-method investments:** none disclosed; no adjustment needed.

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt (funded debt + operating lease liabilities, per CIQ's bundled definition) | $448.46M | Section 4 bridge above |
| Cash & equivalents | $123.88M | Section 4 bridge above |
| **Net debt (total debt − cash)** | **$324.58M** | Agent calculation: 448.46 − 123.88 = 324.58. Cross-checked to `earnings/01_historical-financials.md` §2, which independently states "Net debt at latest period-end (May-30-26): $324.6M" [7]. The two reconcile to rounding — no gap. |
| Net debt / EBITDA — **GAAP basis, LTM (May-30-2026)** | **Not meaningful** | `earnings/01_historical-financials.md` §2 computes LTM GAAP EBITDA at **$(213.1)M** (negative) — the company's own quarterly GAAP-to-Adjusted-EBITDA reconciliation tables [Form 10-Q (Jul-09-2026) and Form 10-Q (Apr-09-2026)] show LTM EBITDA turned deeply negative because of a $391.9M non-cash goodwill/brand impairment recognized across FQ4 FY2025–FQ3 FY2026. A leverage ratio on a negative EBITDA denominator is not meaningful and is not shown. |
| Net debt / **Adjusted** EBITDA — LTM (May-30-2026), company-defined non-GAAP measure | **1.38x** ($324.58M / $234.6M) | Adjusted EBITDA of $234.6M (LTM) is sourced from `earnings/01_historical-financials.md` §2, built from the company's own quarterly Adjusted EBITDA disclosures (excludes loss on impairment, stock-based comp, business-transaction costs, inventory step-up, integration expense, term-loan fees, and restructuring, per the company's own non-GAAP definition) [Form 10-Q (Jul-09-2026) and Form 10-Q (Apr-09-2026), "Reconciliation of EBITDA and Adjusted EBITDA"]. Cross-checked against Capital IQ's independently-computed Credit Health Panel: "Net Debt/EBITDA (x)" = **1.4x** for the same LTM period [Credit Health Panel.xls, Financials tab, LTM 2026-05-30 column] — the two agree within rounding. |

**Data-quality flag (source-hierarchy note):** Capital IQ's own "EBITDA" line in the Financials_Annual.xls Key Stats tab shows LTM (May-30-2026) EBITDA as **+$217.5M**, which is neither the GAAP-reported figure (−$213.1M, per the company's own 10-Q reconciliation tables) nor the company's own disclosed Adjusted EBITDA ($234.6M) — it sits between the two, evidence that CIQ's standardized "EBITDA" field applies its own partial normalization that does not match either of the company's own disclosed bases. Per the source hierarchy (filings beat vendor exports), this report uses the company's own GAAP and Adjusted EBITDA figures (via `earnings/01_historical-financials.md`, which built them directly from the 10-K/10-Q reconciliation tables) for the leverage ratio above, not the CIQ Key Stats "EBITDA" line. This divergence is analyzed in full in `earnings/01_historical-financials.md` §4/§6 and is the single biggest data-quality issue in the SMPL pool.

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | $16.03 | Financials_Quarterly.xls, Balance Sheet tab: Total Common Equity $1,418.12M ÷ 88.460545M shares (as of May-30-2026), matches the tab's own disclosed "Book Value/Share" of 16.03 |
| Tangible book value per share | $(1.03) | Same source: Tangible Book Value $(90.7)M ÷ shares outstanding — negative because Goodwill ($552.0M) + Other Intangibles ($956.9M) exceed total common equity even after the FY2026 impairments |
| Net debt per share | $3.67 | $324.58M net debt (Section 5) ÷ 88.460545M basic shares |

## 7. Anchor Summary (canonical numbers for downstream agents)

Current price is pool-verified at $11.33 (close, Aug-04-2026), corroborated exactly by two independent Capital IQ exports within the pool (Public Company Profile PDF and the Estimates Report Consensus tab). It is fresh (≈1–2 trading days old at the 2026-08-06 run date) — no staleness cap applies. Basic shares outstanding for market cap (88,460,545, as of Jul-02-2026) and fully diluted shares for per-share fair value (89,934,884, simplified TSM — options and SARs excluded as out-of-the-money) are each sourced from the FQ3 FY2026 10-Q. Market cap is $1,002.26M and enterprise value is $1,326.84M, bridged from funded debt ($397.04M, a single non-convertible Term Loan, undrawn revolver) plus operating lease liabilities ($51.43M) less genuine operating cash ($123.88M) — no preferred equity, no minority interest, no equity-method investments. Net debt is $324.58M, cross-checked to the earnings module's independently-computed $324.6M. Leverage on a GAAP-EBITDA basis is not meaningful (LTM GAAP EBITDA is negative, driven by a $391.9M non-cash goodwill/brand impairment); on the company's own Adjusted EBITDA basis, net debt / Adjusted EBITDA (LTM) is 1.38x — corroborated independently by Capital IQ's Credit Health Panel at 1.4x. Reporting currency is USD throughout.

### Anchor Block (copy-forward)

- Price: $11.33 (Aug-04-2026, last close)
- Price-state: pool-verified
- Currency: USD
- Shares (market cap): 88,460,545 (FQ3 FY2026 10-Q cover page, "as of" Jul-02-2026)
- Shares (per-share fair value): 89,934,884 (fully diluted — simplified TSM; RSUs/PSUs added in full, options and SARs excluded as out-of-the-money at current price)
- Market cap: $1,002.26M
- Net debt: $324.58M (total debt $448.46M [funded debt $397.04M + operating lease liabilities $51.43M] − cash $123.88M)
- EV: $1,326.84M
- Key caveats: (1) GAAP LTM EBITDA is negative (impairment-driven) — any net debt/EBITDA ratio downstream must use the company's own Adjusted EBITDA ($234.6M LTM, net debt/Adj. EBITDA = 1.38x) or state explicitly that the GAAP ratio is not meaningful; (2) Capital IQ's own Key Stats "EBITDA" field does not match either the GAAP or the company-defined Adjusted EBITDA figure for the LTM period — do not cite it as either; (3) fully diluted share count uses a simplified (non-netted) RSU/PSU add rather than the strict unrecognized-compensation-cost treasury-stock refinement — a small-magnitude limitation, stated for transparency; (4) FY2025-vintage per-share/EPS figures elsewhere in the pool use a materially higher diluted weighted-average share count (101,510,772) that predates ~12 million shares of subsequent buybacks — do not mix that count with this report's current 88,460,545 / 89,934,884 counts.
