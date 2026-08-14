# Price & Capital Structure — ORCL

Reporting standard: US GAAP. Currency: USD (millions unless stated per-share). Fiscal year end: May 31 (FY2026 = year ended May-31-2026). Listing: NYSE, US SEC domestic filer (Delaware-incorporated, HQ Austin, TX) [FY26 10-K cover page; `Oracle Corporation NYSE ORCL Public Company Profile.rtf`].

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $153.94 | `Oracle Corporation NYSE ORCL Public Company Profile.rtf` — delayed quote | Aug-13-2026, 02:26 PM (GMT-5) |
| Currency | USD | Same source | — |
| Price basis (last close / intraday / indicative) | Delayed intraday quote (≥20-minute delay), NYSE:ORCL common stock | Same source | Aug-13-2026 |

**Price-state: `pool-verified`.** The price is a Capital IQ delayed-quote export sitting in the data pool, not a web-sourced figure — it does not need independent web corroboration under the partial-data rule (that rule governs only web-sourced prices used when no pool price exists).

**Corroboration.** The prior trading day's close, Aug-12-2026, was $153.28 [`ORCL_Charting Excel Export - Aug 13th 2026 4_48_01 pm.xls`, Pane 1 tab, daily series, last row: 2026-08-12, close 153.28]. This matches the "Previous Close" field on the Public Company Profile ($153.28) and the "Change on Day" arithmetic (+$0.66 / +0.4% → $153.28 + $0.66 = $153.94), so the two pool exports are internally consistent. Both are Capital IQ-sourced (a single vendor, not two independent providers), but because a pool price exists this is not the no-pool-price case requiring two-source corroboration.

**Vendor's own EV snapshot used a different, older price.** The "Financial Information" box on the same Public Company Profile document states market cap of $441,518.6M and EV of $582,558.6M, but its own footnote says: *"TEV and Market Cap are calculated using a close price as of Aug-12-2026"* — i.e., the **prior day's close ($153.28)**, not the $153.94 delayed quote dated Aug-13. This report uses the more current $153.94 quote as the canonical price and rebuilds the bridge below rather than reusing the vendor's pre-computed (stale-by-one-day) box; the vendor's own bridge is shown as a cross-check in §4.

**Price staleness.** Run date 2026-08-14; quote as-of Aug-13-2026 02:26 PM (GMT-5) — age ≈ 1 trading day, well inside the 5-trading-day freshness threshold. No refresh needed; no staleness cap applies.

## 2. Share Count

| Field | Value | Source |
|---:|---:|---|
| Basic shares outstanding (as-of filing date) | 2,880.471M (≈2,880.5M) | `Financials_Annual.xls`, Balance Sheet tab, "Total Shares Out. on Filing Date," FY2026 column; matches `Public Company Profile.rtf` "Shares Out. (mm) 2,880.5" |
| Diluted weighted-average shares (FY2026) | 2,914M | `Financials_Annual.xls`, Income Statement tab, "Weighted Avg. Diluted Shares Out.," FY2026 |
| Options/RSUs (treasury-stock-method increment, implied) | ≈54M (FY2026 weighted-average diluted 2,914M − weighted-average basic 2,860M) | Inference, not from filings — derived from the FY2026 basic/diluted weighted-average gap in `Financials_Annual.xls`, Income Statement tab; the pool does not carry a separate options/RSU count with strikes |
| Convertibles / potential shares (Mandatory Convertible Preferred) | 50,000 preferred shares (100,000,000 depositary shares, 1/2,000th interest each); converts into 24.99M–31.24M common shares depending on price at conversion | FY26 10-K, Notes to Consolidated Financial Statements (Preferred Stock financing) and MD&A |
| **Fully diluted shares (TSM + if-converted, estimate)** | **≈2,965.7M** | Built as: 2,880.5M basic + ≈54M RSU/option TSM increment (proxied, see limitation) + ≈31.2M Mandatory Convertible Preferred if-converted at the maximum ratio (see below) |
| Share count used for market cap | 2,880.5M (basic, current) | Per Fully Diluted Equity Rule 1 — most recent shares outstanding, not a weighted average |
| Share count used for per-share fair value | ≈2,965.7M (fully diluted estimate); GAAP diluted weighted-average of 2,914M shown as the disclosure-clean fallback | See limitation below |

**Mandatory Convertible Preferred Stock — detail.** Oracle issued 100,000,000 depositary shares (representing 50,000 shares of 6.50% Series D Mandatory Convertible Preferred Stock) on Feb-5-2026 for $5.0bn net proceeds, $100,000 liquidation preference per preferred share [FY26 10-K]. It mandatorily converts on Jan-15-2029 into between **499.8126** (minimum, if the stock is high) and **624.7657** (maximum, if the stock is low) common shares per preferred share, i.e. an implied conversion-price floor near $100,000 / 624.7657 ≈ $160 and a cap near $100,000 / 499.8126 ≈ $200 [FY26 10-K, Preferred Stock note]. At the current price ($153.94), which sits **below** the ≈$160 floor, an if-converted calculation today would use the **maximum** ratio: 50,000 × 624.7657 ≈ **31.24M shares** (≈1.1% of basic shares). For FY2026 GAAP diluted EPS, the 10-K states the Mandatory Convertible Preferred was **excluded** as anti-dilutive under the if-converted test [FY26 10-K: "anti-dilutive Mandatory Convertible Preferred Stock as calculated using the if-converted method... could be dilutive in the future"] — so the 2,914M diluted weighted-average shares does **not** include it. Preferred dividends of $103M (partial-year, since issued Feb-2026) were instead deducted from net income to arrive at NI-to-common [`Financials_Annual.xls`, Income Statement tab].

**Limitation.** The pool does not carry a strike-level options/RSU table or a period-end (rather than weighted-average) TSM add-back, so the ≈54M RSU/option increment above is proxied from the FY2026 weighted-average basic-to-diluted gap — labelled as a limitation, not a filing-sourced figure. Downstream agents needing a single defensible per-share count with no estimation should default to the GAAP diluted weighted-average of **2,914M shares**, which already reflects the actual FY2026 RSU/option TSM dilution (excludes the preferred, which was anti-dilutive over the year but is economically real and would add ≈25–31M shares on a forward, current-price basis).

## 3. Market Capitalization

`Market cap = share count × current price = 2,880.5M × $153.94 = $443,424.2M`

## 4. Enterprise Value Bridge

| Component | Amount ($M) | Source |
|---|---:|---|
| Market capitalization | 443,424.2 | §3 above |
| + Total debt (short + long term, incl. lease liabilities) | 167,432.0 | `Financials_Annual.xls`, Capital Structure Summary / Balance Sheet tabs, FY2026 |
| + Minority / non-controlling interest | 548.0 | `Financials_Annual.xls`, Balance Sheet tab, FY2026 ("Minority Interest") |
| + Preferred equity (Mandatory Convertible Preferred, carrying value) | 4,954.0 | `Financials_Annual.xls`, Balance Sheet tab, FY2026 ("Total Pref. Equity") |
| − Cash & equivalents (+ ST investments) | (31,894.0) | `Financials_Annual.xls`, Balance Sheet tab, FY2026 ("Total Cash & ST Investments" = $31,289M cash & equivalents + $605M ST investments) |
| **= Enterprise value (EV)** | **584,464.2** | Computed |

**Cross-check against the vendor's own bridge.** The Public Company Profile's pre-computed box shows Market Cap $441,518.6M and EV $582,558.6M, built off the Aug-12-2026 close ($153.28) rather than the $153.94 quote used here; its own component math ties out exactly (441,518.6 + 167,432.0 + 4,954.0 + 548.0 − 31,894.0 = 582,558.6). The $1,905.6M EV gap between the two bridges is entirely attributable to the one-day price difference ($153.94 vs $153.28 × 2,880.5M shares ≈ $1,901M), not a data discrepancy — both bridges use identical debt/cash/preferred/minority inputs.

**Lease liabilities are embedded in "Total Debt," not added separately.** Of the $167,432M total debt, $37,891M is lease liabilities ($30,190M operating + $7,701M finance/capital leases) recognized on the balance sheet under ASC 842 [`Financials_Annual.xls`, Capital Structure Summary tab, "Total Lease Liabilities," and Capital Structure Details tab, FY2026 instrument list]. This report treats the as-reported (lease-inclusive) total debt as canonical, consistent with US GAAP balance-sheet recognition — no separate "+ Operating lease liabilities" adjustment is layered on top (that would double-count). For readers who want a leverage view excluding capitalized leases, ex-lease ("financial") debt is $167,432M − $37,891M = **$129,541M**, which would produce an EV of $443,424.2 + 129,541.0 + 548.0 + 4,954.0 − 31,894.0 = **$546,573.2M**. Both figures are shown; the lease-inclusive $584,464.2M is the canonical EV this report anchors on.

**Adjustments NOT made:** no separate pension/OPEB add-back (Oracle's unfunded projected-benefit-obligation debt-equivalent is $2,500M per `Financials_Annual.xls`, Balance Sheet tab, "Debt Equiv. of Unfunded Proj. Benefit Obligation" — small relative to the ~$584bn EV and not layered in, since it is a supplemental CIQ estimate rather than a balance-sheet liability); no equity-method-investment carve-out (Oracle discloses equity-method investments in non-operating income but does not break out their balance-sheet carrying value separately from "Other Long-Term Assets" in this export, so none is excluded from EV).

**Cash quality — checked, no adjustment needed.** The $31,894M cash & ST investments line is genuine operating cash and short-term equivalents: restricted cash included within cash and cash equivalents was disclosed as **"immaterial"** [FY26 10-K, Note 2/Fair Value section], and all marketable debt securities held mature within one year and are limited to investment-grade issuers [FY26 10-K, same note]. There is no financial-subsidiary trapped-cash pool comparable to a captive-finance arm — the disclosed minority-interest subsidiaries (Oracle Financial Services Software Limited, Oracle Corporation Japan) are operating businesses, not financing vehicles. No cash-quality haircut applied; the $31,894M figure is used as-is.

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Basis | Source |
|---|---:|---|---|
| Total debt | $167,432M | — | `Financials_Annual.xls`, Balance Sheet tab, FY2026 |
| Cash & equivalents (strict) | $31,289M | Cash & equivalents only | `Financials_Annual.xls`, Balance Sheet tab, FY2026 |
| Cash & ST investments (broad) | $31,894M | + $605M ST investments | Same |
| Net debt (strict — total debt − cash & equivalents only) | **$136,143M** | §15 default | Computed: 167,432 − 31,289; cross-checked against `earnings/01_historical-financials.md` §1, which independently computes the identical $136,143M figure |
| Net debt (broad — nets ST investments too) | $135,538M | §15 broad basis | `Financials_Annual.xls`, Balance Sheet tab, FY2026 "Net Debt" row |
| Net debt / EBITDA (GAAP-reported EBITDA, strict net-debt basis) | **4.46x** | Strict net debt / GAAP EBITDA | Computed: 136,143 / 30,494 (EBITDA from `Financials_Annual.xls`, Income Statement tab, FY2026) |
| Net debt / EBITDA (GAAP-reported EBITDA, broad net-debt basis) | 4.44x | Broad net debt / GAAP EBITDA | Computed: 135,538 / 30,494 |

**Basis flag — the canonical net-debt figure for this module is the STRICT basis, $136,143M**, per CLAUDE.md §15 default (total debt − cash & equivalents only). Every downstream equity bridge in this module should use $136,143M unless it states an explicit one-line reason to use the broad ($135,538M) figure instead.

**A vendor-ratio discrepancy, reconciled, not silently overridden.** `Financials_Annual.xls`'s own Capital Structure Summary tab prints "Total Debt/EBITDA" = 5.03x and "Net Debt/EBITDA" = 4.07x for FY2026 — both lower than the 5.49x and 4.46x computed above using plain GAAP EBITDA ($30,494M). Tracing the arithmetic: 167,432 / 33,288 = 5.030x and 135,538 / 33,288 = 4.072x — i.e., the vendor's printed ratios use **EBITDAR** ($33,288M = EBITDA + total rent expense, `Financials_Annual.xls` Income Statement tab, "EBITDAR" row), not plain EBITDA, in the denominator, evidently to stay consistent with a lease-inclusive Total Debt numerator. This report uses plain GAAP EBITDA ($30,494M) as the labelled denominator throughout and flags the vendor ratio as EBITDAR-based rather than silently adopting the lower-looking 4.07x figure under an unqualified "Net Debt/EBITDA" label.

## 6. Per-Share Reference Values

| Metric | Per Share | Basis (shares) | Source |
|---|---:|---|---|
| Book value per share | $13.04 | 2,880.5M basic | `Financials_Annual.xls`, Balance Sheet tab, FY2026 ("Book Value/Share"); ties to $37,554M total common equity ÷ 2,880.5M |
| Tangible book value per share | −$9.70 | 2,880.5M basic | `Financials_Annual.xls`, Balance Sheet tab, FY2026 ("Tangible Book Value/Share"); tangible book value is −$27,936M (total common equity $37,554M less $62,261M goodwill and $3,229M other intangibles) |
| Net debt per share (strict) | $47.27 | 2,880.5M basic | Computed: $136,143M / 2,880.5M |
| Net debt per share (broad) | $47.06 | 2,880.5M basic | Computed: $135,538M / 2,880.5M |

Tangible book value is negative — Oracle's balance sheet carries $62,261M of goodwill and $3,229M of other intangibles (mostly from the Cerner and earlier acquisitions) against $37,554M of total common equity, so tangible net worth is a $27,936M deficit. This is a capital-structure fact, not a valuation judgment — it is left for the multiples/DCF agents to interpret.

## 7. Anchor Summary (canonical numbers for downstream agents)

- **Current price:** $153.94, as of Aug-13-2026 02:26 PM (GMT-5), delayed NYSE quote, pool-sourced (Capital IQ). Prior-day close (Aug-12-2026) was $153.28, internally consistent with the delayed quote's stated day-change.
- **Share counts:** market cap uses 2,880.5M basic shares (as-of the FY26 10-K filing date); per-share fair value should use the GAAP diluted weighted-average of 2,914M as the disclosure-clean default, or the ≈2,965.7M fully-diluted estimate (basic + RSU/option TSM proxy + Mandatory Convertible Preferred if-converted at the current-price-applicable maximum ratio) where a downstream agent wants the more complete, but partly-inferred, count — the choice and its basis must be stated wherever it is used.
- **Market cap:** $443,424.2M.
- **Enterprise value:** $584,464.2M (lease-inclusive, canonical); $546,573.2M if operating/finance lease liabilities are excluded from debt.
- **Net debt (canonical, strict basis):** $136,143M (total debt $167,432M − cash & equivalents $31,289M). Broad basis (nets in $605M ST investments too): $135,538M.
- **Reporting currency:** USD (US GAAP, FYE May 31).

### Anchor Block (copy-forward)

- Price: $153.94 (Aug-13-2026, 02:26 PM GMT-5, delayed intraday quote)
- Price-state: pool-verified
- Currency: USD
- Shares (market cap): 2,880.5M (basic, as-of FY26 10-K filing date — `Financials_Annual.xls` Balance Sheet tab / `Public Company Profile.rtf`)
- Shares (per-share fair value): 2,914M (GAAP diluted weighted-average, FY2026 — disclosure-clean default) OR ≈2,965.7M (fully-diluted estimate incl. Mandatory Convertible Preferred if-converted at current-price-applicable max ratio — partly inferred, see §2 limitation)
- Market cap: $443,424.2M
- Net debt: $136,143M (strict basis — total debt minus cash & equivalents only; broad basis incl. ST investments = $135,538M)
- EV: $584,464.2M (lease-inclusive, canonical); $546,573.2M ex-lease-liabilities
- Key caveats: (1) RSU/option TSM increment for the fully-diluted per-share count is proxied from the FY2026 weighted-average basic/diluted gap, not a filing-disclosed strike-level table — a labelled limitation; (2) Total Debt as reported includes $37,891M of lease liabilities (operating + finance), so the canonical EV is lease-inclusive — an ex-lease EV is shown alongside for leverage-focused readers; (3) Capital IQ's own printed "Net Debt/EBITDA" (4.07x) and "Total Debt/EBITDA" (5.03x) use EBITDAR, not plain EBITDA, as the denominator — this report's 4.46x / 5.49x figures use plain GAAP EBITDA and are the ones downstream agents should cite unless EBITDAR is explicitly intended; (4) tangible book value per share is negative (−$9.70) due to $65,490M of goodwill and other intangibles.
