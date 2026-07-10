# Price & Capital Structure — AMZN

**Reporting standard:** US GAAP. **Currency:** USD (millions unless noted). **Listing:** Nasdaq Global Select Market (NasdaqGS). **Fiscal year end:** December 31. **Business type:** Operating company (three reportable segments: North America, International, AWS). **Data pool extraction status:** 0 failures across 44 sources.

---

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $238.34 | Capital IQ Financials.xls — Key Stats tab, "Latest Capitalization" row "Share Price"; cross-confirmed by Capital IQ Financials.xls — Multiples tab, Jul-1-2026 P/LTM EPS close (28.505 × LTM EPS $8.361 = $238.34 implied) | July 1, 2026 close (pool-sourced) |
| Intraday / latest price at export | $239.75 | Capital IQ Estimates Report.xls — Consensus tab, Market Summary, "Latest Price" field (NasdaqGS:AMZN USD) | Intraday at export time, ~Jul 1–2, 2026 |
| Currency | USD | All Capital IQ exports; all filings | — |
| Price basis | Last close (Jul 1, 2026) | Capital IQ Key Stats + Multiples cross-confirmation | July 1, 2026 |

**Price confirmation note.** The Key Stats tab states $238.34 as the share price. The Estimates Report Consensus tab states "Latest Price / Last Close Price: 239.75 / 238.34." The Multiples tab includes a column ending "2026-07-01" whose P/LTM EPS Close of 28.505 × LTM EPS $8.361 = $238.34 — a three-way cross-confirmation within the same pool export. The canonical anchor is $238.34 (July 1, 2026 last close). The $239.75 is an intraday quote embedded in the same export; it is shown for transparency and carries no incremental precision.

**Vendor-export freshness.** The Capital IQ data export's own as-of date is not stamped explicitly in any tab header. The export includes Multiples data through a column marked "2026-07-01" (a single-day column), which firmly places the pull date at or after July 1, 2026. This puts the export within 9 days of the valuation date of July 10, 2026. The quote's own as-of date is confirmed as July 1, 2026 by the Multiples cross-check. Price-state: **pool-verified**.

---

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as of Apr 22, 2026) | 10,757.1M | Form 10-Q, Q1 2026 (Apr-30-2026), XBRL tag `dei:EntityCommonStockSharesOutstanding`, cover page; as of Apr 22, 2026 |
| Basic shares outstanding (balance sheet date, Mar 31, 2026) | 10,754.0M | Form 10-Q, Q1 2026 — Consolidated Balance Sheet; Capital IQ Balance Sheet tab, "Total Shares Out. on Balance Sheet Date" = 10,754M at Mar-31-2026 |
| Basic shares outstanding (as of Jan 28, 2026; FY2025 10-K cover) | 10,734.9M | FY2025 Annual Report (10-K, Apr-9-2026), cover page |
| **Basic shares outstanding used for market cap** | **10,757.1M** | **Form 10-Q, Q1 2026, cover page (most recent as-of date: Apr 22, 2026); confirmed by Capital IQ Key Stats tab: 10,757.109M** |
| Basic weighted-average (Q1 2026, for diluted calc) | 10,743.0M | Form 10-Q Q1 2026, XBRL tag `us-gaap:WeightedAverageNumberOfSharesOutstandingBasic` (Q1 2026) |
| Diluted weighted-average (Q1 2026) | 10,874.0M | Form 10-Q Q1 2026, XBRL tag `us-gaap:WeightedAverageNumberOfDilutedSharesOutstanding` (Q1 2026) |
| Diluted weighted-average (FY2025) | 10,827.0M | FY2025 Annual Report (10-K, Apr-9-2026), Consolidated Statements of Operations, diluted EPS computation table |
| Total dilutive effect of outstanding stock awards (FY2025) | 171.0M | FY2025 Annual Report (10-K, Apr-9-2026), diluted shares computation table: basic 10,656M + dilutive stock awards 171M = diluted 10,827M |
| Total dilutive effect of outstanding stock awards (FY2024) | 248.0M | FY2025 Annual Report (10-K), same table: FY2024 basic 10,473M + 248M = diluted 10,721M |
| Convertibles / potential shares from convertibles | Nil | Amazon has no outstanding convertible bonds — all financial debt is senior unsecured notes or revolving credit (Capital IQ Capital Structure Details tab, FY2025 and Q1 2026) |
| **Fully diluted shares used for per-share fair value** | **10,874.0M** | **Q1 2026 10-Q diluted weighted-average (most recent period); treasury stock method applied to RSUs/stock awards** |

**Share Count Reconciliation Table:**

| Component | Shares (M) | Basis |
|---|---:|---|
| Basic weighted-average (Q1 2026) | 10,743 | Q1 2026 10-Q XBRL |
| + Dilutive effect of stock awards (Q1 2026) | 131 | Q1 2026 10-Q (10,874 − 10,743 = 131M dilutive) |
| = Diluted weighted-average (Q1 2026) | 10,874 | Q1 2026 10-Q XBRL — used for per-share fair value |
| Basic shares outstanding (cover page) | 10,757 | Q1 2026 10-Q cover, Apr 22, 2026 — used for market cap |

**Gap and methodology note.** The 117M gap between the basic shares outstanding (10,757M, used for market cap) and the diluted weighted-average (10,874M, used for per-share fair value) arises entirely from outstanding RSU/stock-award dilution under the treasury stock method. Amazon has no convertible securities outstanding. The dilutive count used for market cap is the cover-page "as-of" share count (the most recent actual count); the diluted weighted-average is used for per-share fair value outputs to avoid overstating fair value per share. The dilutive effect has declined from 248M (FY2024) to 171M (FY2025) to 131M (Q1 2026), consistent with fewer RSU awards relative to the share base.

---

## 3. Market Capitalization

**Market cap = share count × current price**

`Market cap = 10,757.1M shares × $238.34 = $2,563,849M ≈ $2.564 trillion`

Cross-check: Capital IQ Key Stats tab "Latest Capitalization" row "Market Capitalization" = $2,563,849.46M — zero discrepancy to rounding.

| Component | Value |
|---|---:|
| Shares used (basic, Apr 22, 2026) | 10,757.1M |
| Price (Jul 1, 2026 last close) | $238.34 |
| **Market capitalization** | **$2,563,849M ($2.564 trillion)** |

Note: capital IQ uses basic shares outstanding for market cap (per "Dilution: Basic" disclosure on the Historical Capitalization and Multiples tabs). This is appropriate for market cap; per-share fair value uses diluted shares (10,874M — see §2).

---

## 4. Enterprise Value Bridge

| Component | Amount (USD M) | Source |
|---|---:|---|
| Market capitalization | $2,563,849 | 10,757.1M shares × $238.34 (Jul 1, 2026 close); confirmed by Capital IQ Key Stats tab |
| + Total debt (short + long term) | $235,540 | Capital IQ Capital Structure Summary tab, Mar-31-2026: includes financial bonds/notes ($121,782M), short-term revolving credit ($152M), financing/other borrowings ($9,390M), and lease liabilities ($104,942M = operating $89,252M + finance $12,286M + other ~$3,404M). Total Debt Outstanding $235,540M after adjustments of $(726M). |
| + Minority / non-controlling interest | Nil | Capital IQ Historical Capitalization and Key Stats: "Total Minority Interest: —". FY2025 10-K and Q1 2026 10-Q balance sheets: no minority interest line. Amazon is wholly owned; no material NCI. |
| + Preferred equity | Nil | Capital IQ: "Pref. Equity: —". No preferred stock outstanding (FY2025 10-K, Item 8, balance sheet). |
| + Operating lease liabilities | (included in Total Debt above) | Capital IQ includes operating lease liabilities ($89,252M at FY2025 per Capital Structure Details; $104,942M total leases at Q1 2026 per Summary) within its Total Debt figure. No separate addition needed. The lease amount is shown explicitly above for transparency. |
| + Underfunded pension / OPEB | Nil | Amazon does not offer a defined-benefit pension plan to US employees. Capital IQ Pension OPEB tab shows no material defined-benefit obligation. No adjustment needed. |
| − Cash & equivalents (+ ST investments) | $(143,089) | Capital IQ Capital Structure Summary tab, Mar-31-2026: "Total Cash & ST Investments $143,089M" = cash & equivalents $101,816M + short-term investments $41,273M. This figure ALREADY nets out restricted cash (~$3.3B at FY2025 was restricted; the transition from FY2025 $123,029M to Q1 2026 $143,089M is net of restricted amounts, confirmed by the FY2025 10-K Note 2 reconciliation: gross $126,325M less restricted $3,296M = net $123,029M). |
| − Equity-method investments | Not deducted | Amazon's $51,423M in long-term investments (Balance Sheet Mar-31-2026) consists primarily of Anthropic preferred stock, Rivian equity, and other strategic/private-company investments. These are strategic operating investments, not financial equivalents, and are not netted from EV under either the CIQ methodology or standard practice for operating companies. They are NOT netted here (see §15 note below). |
| **= Enterprise value (EV)** | **$2,656,300M ($2.656 trillion)** | $2,563,849 + $235,540 + 0 + 0 − $143,089 = **$2,656,300M**. Cross-check: Capital IQ Key Stats "Total Enterprise Value (TEV)" = $2,656,300.46M — zero discrepancy. |

**EV bridge arithmetic verification:** $2,563,849 + $235,540 − $143,089 = $2,656,300M ✓

**Cash quality note (§15 compliance).** The $143,089M netted as cash is operating cash and genuine short-term equivalents, net of restricted amounts. The Capital IQ figure has already excluded restricted/pledged cash (confirmed by the FY2025 10-K Note 2 reconciliation above). What is NOT netted: (a) $51,423M in long-term investments (Anthropic preferred stock ~$19–20B, Rivian equity ~$5B, other private-company equity/warrants) — these are strategic, carry mark-to-market volatility recorded in Other income/expense, and are not cash equivalents; (b) $41,273M in short-term investments — these ARE included in the netted figure per CIQ's standard treatment (money market funds, US government and agency securities, corporate debt at Level 1/2 — all liquid, short-duration, and equivalent to cash). The $41,273M in ST investments passes the cash-quality test: they are classified as Level 1 or Level 2 securities with maturities consistent with cash equivalents and do not include equity or long-tenor fair-value instruments (FY2025 10-K, Note 2, cash and investments table).

**Net debt / cash basis labeling (§15 strict / broad).** Two bases are carried forward:
- **Strict basis** (financial debt only, no lease liabilities): financial bonds + revolving credit + other borrowings = $130,598M (BS: $152M revolving + $3,172M current LTD + $127,274M LT debt); strict net cash = $143,089M − $130,598M = **$12,491M net cash**. [Balance Sheet, Form 10-Q Q1 2026 (Apr-30-2026)]
- **Broad basis** (CIQ definition — total debt including lease liabilities): $235,540M total debt; broad net debt = $235,540M − $143,089M = **$92,451M net debt**. [Capital IQ Capital Structure Summary, Mar-31-2026]

The broad basis is the CIQ-computed figure ($92,451M) and is the canonical net-debt figure for leverage ratios, consistent with the earnings module. The strict basis ($12,491M net cash) is provided for financial-covenant and credit analysis where leases are excluded.

**Adjustments NOT made and why:**
- Operating lease liabilities: already included in Total Debt ($104,942M in CIQ's Total Debt). This is the canonical treatment for Amazon given the economic substance of its lease obligations (the 10-K states 3.8% weighted-average discount rate on operating leases with ~10-year average remaining term).
- Pensions / OPEB: Amazon has no US defined-benefit pension; immaterial foreign obligations exist but are not disclosed as material liabilities.
- Contingent claims: various legal proceedings but no accrued liability material enough to adjust EV (FY2025 10-K, Note 7 — Commitments and Contingencies).
- Long-term equity investments: not netted per operating-company standard (see cash quality note above).

---

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total financial debt (strict — no leases) | $130,598M | Q1 2026 10-Q Balance Sheet: short-term revolving $152M + current LT debt $3,172M + long-term debt $127,274M |
| Total lease liabilities | $104,942M | Capital IQ Capital Structure Summary, Mar-31-2026 |
| Total debt (broad — incl. leases, CIQ) | $235,540M | Capital IQ Capital Structure Summary, Mar-31-2026 |
| Cash & equivalents | $101,816M | Q1 2026 Balance Sheet; Capital IQ Balance Sheet tab, Mar-31-2026 |
| Short-term investments | $41,273M | Q1 2026 Balance Sheet; Capital IQ Balance Sheet tab, Mar-31-2026 |
| Total cash & ST investments | $143,089M | Capital IQ Capital Structure Summary, Mar-31-2026 |
| **Net debt — broad basis (CIQ; labeled "broad")** | **$92,451M** | Capital IQ Capital Structure Summary, Mar-31-2026: "Net Debt $92,451M" |
| **Net cash — strict basis (labeled "strict")** | **$12,491M net cash** | Computed: $143,089M − $130,598M = $12,491M (positive = net cash position) |
| LTM EBITDA (LTM Mar-31-2026) | $155,861M | Capital IQ Key Stats tab, LTM Mar-31-2026 |
| **Net debt / LTM EBITDA (broad basis, reported GAAP)** | **0.59x** | $92,451M / $155,861M = 0.59x; note CIQ Capital Structure Summary reports 0.487x based on its own EBITDA definition vs the Key Stats EBITDA — difference is definitional. Using Key Stats LTM EBITDA $155,861M gives 0.59x. |
| Available undrawn credit | $59,400M | Capital IQ Capital Structure Summary, Mar-31-2026: $30,000M undrawn commercial paper + $29,400M undrawn revolving credit |

**Leverage note.** On the broad basis (including $104.9B in lease liabilities), net debt is $92.5B, giving a 0.59× EBITDA ratio — very low leverage for a company of this scale. On the strict basis (financial bonds only), Amazon is in a net cash position of $12.5B. The large Q1 2026 increase in financial debt (bonds rose from $68B at FY2025 to $121.8B at Q1 2026, a $53.8B increase) reflects new senior note issuances to pre-fund the $151B annualized capex run-rate for AWS AI infrastructure. Even at the elevated Q1 2026 debt level, leverage is modest given $155.9B in LTM EBITDA.

---

## 6. Per-Share Reference Values

All per-share values computed using basic shares outstanding (10,757.1M) for balance-sheet items unless otherwise noted, consistent with how book value per share is disclosed in Capital IQ and SEC filings.

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share (basic, 10,757M shares) | $41.08 | Total Common Equity $441,914M ÷ 10,757.1M = $41.08; Capital IQ Balance Sheet tab Mar-31-2026 reports $41.09 (rounding). [Capital IQ Balance Sheet tab, Mar-31-2026] |
| Book value per share (diluted, 10,874M shares) | $40.64 | $441,914M ÷ 10,874M = $40.64. Use for per-share fair value comparisons. |
| Tangible book value per share (basic) | $38.90 | Tangible Book Value $418,465M ÷ 10,757.1M = $38.90; Capital IQ Balance Sheet tab reports $38.91. Goodwill $23,449M + Other Intangibles (N/A at Mar-31-2026 in CIQ; ~$9,197M at FY2025) deducted from book equity. [Capital IQ Balance Sheet tab, Mar-31-2026] |
| Net cash per share — strict basis (basic shares) | $1.16 | Net cash $12,491M ÷ 10,757.1M = $1.16 per share. Positive = net cash. |
| Net debt per share — broad basis (basic shares) | $(8.59) | Net debt $92,451M ÷ 10,757.1M = $(8.59) per share (negative = net debt burden). |

---

## 7. Anchor Summary (canonical numbers for downstream agents)

Every downstream valuation agent must use these numbers verbatim. Any deviation requires an explicit one-line reason per MODULE_RULES Reconciliation Gate 1.

### Anchor Block (copy-forward)

- **Price:** $238.34 (July 1, 2026 last close, NasdaqGS:AMZN)
- **Price-state:** `pool-verified` — the canonical tag `05`/`07`/`99` read. Price is from the Capital IQ data pool export, confirmed by three independent internal cross-checks (Key Stats tab, Estimates Consensus tab, Multiples tab P/LTM EPS × LTM EPS). All price-relative scoring is unlocked: margin of safety, downside-to-bear, observed up/down, and valuation attractiveness may be computed.
- **Currency:** USD
- **Shares (market cap):** 10,757.1M basic shares outstanding as of April 22, 2026 [Form 10-Q Q1 2026, cover page; Capital IQ Key Stats tab]
- **Shares (per-share fair value):** 10,874M diluted weighted-average for Q1 2026 [Form 10-Q Q1 2026, XBRL `us-gaap:WeightedAverageNumberOfDilutedSharesOutstanding`]. Treasury stock method; no convertibles. Dilutive stock awards: 131M for Q1 2026 (171M for FY2025).
- **Market cap:** $2,563,849M ($2.564 trillion) at $238.34
- **Net debt — strict basis (financial debt minus cash; labeled "strict"):** ($12,491M) — i.e., net cash of $12,491M. Financial debt $130,598M; cash & ST investments $143,089M.
- **Net debt — broad basis (total debt incl. leases minus cash; labeled "broad"; CIQ canonical):** $92,451M. Total debt $235,540M; cash & ST investments $143,089M. This is the canonical figure for leverage ratios, consistent with the earnings module.
- **EV:** $2,656,300M ($2.656 trillion) = market cap $2,563,849M + total debt (broad) $235,540M − cash $143,089M. Zero discrepancy vs Capital IQ Key Stats TEV.
- **Reporting currency:** USD. US GAAP. Fiscal year ends December 31. All balance-sheet figures as of March 31, 2026 (latest available). Price as of July 1, 2026.
- **Key caveats:**
  1. Balance sheet data is dated March 31, 2026 (Q1 2026); price is dated July 1, 2026. No balance-sheet update since April 30, 2026 (10-Q filing). Net debt and EV reflect a ~10-week-old balance sheet at the time of this analysis.
  2. Q1 2026 saw a large increase in financial debt (bonds rose ~$53.8B vs FY2025), related to new senior note issuances for AI capex financing. This elevated the broad-basis net debt from $55,518M at FY2025 to $92,451M at Q1 2026.
  3. Amazon holds $51.4B in long-term equity/debt investments (Anthropic, Rivian, others) that are NOT netted from EV. These carry mark-to-market risk but are strategic, not financial equivalents.
  4. The strict-basis net cash ($12,491M) and broad-basis net debt ($92,451M) represent very different pictures of leverage — downstream agents must specify which basis they use and label it "strict" or "broad" per §15.
