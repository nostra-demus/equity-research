# Price & Capital Structure — UBER

Reporting standard: US GAAP. Reporting currency: USD (millions, except per-share figures, which are whole dollars). Fiscal year end: December 31. Listing: NYSE:UBER (US SEC filer — 10-K/10-Q are the correct native filings; no local-equivalent substitution needed) [FY25 10-K cover page; Q2 FY26 10-Q cover page].

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $68.18 | Capital IQ Comps export, "Financial Data" tab (Day Close Price Latest) [Company Comparable Analysis Uber Technologies Inc.xls, data as of 2026-08-06]; independently corroborated by [Uber Technologies Inc NYSE UBER Financials_Quarterly.xls, Key Stats tab, "Share Price"] | 2026-08-06 |
| Currency | USD | Both sources above | — |
| Price basis | Last close | Comps tab header: "Day Close Price Latest" | 2026-08-06 |

Two independent Capital IQ exports — the standalone comps workbook and the Financials_Quarterly workbook — both show $68.18 for the same as-of date, so this is a pool-verified, corroborated price (not merely single-sourced).

**Price staleness.** Run date 2026-08-09 minus quote as-of date 2026-08-06 = 3 calendar days. The only intervening trading day is Friday 2026-08-07 (2026-08-08/09 are a weekend), so the price is roughly 1 trading day old — well inside the 5-trading-day freshness threshold. No refresh attempt was needed and no staleness cap applies.

**Price-state tag: `pool-verified`.**

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of Jul-31-2026) | 2,042,560,121 | Q2 FY26 10-Q cover page, filed 2026-08-05: "The number of shares of the registrant's common stock outstanding as of July 31, 2026 was 2,042,560,121" — matches Capital IQ Key Stats "Shares Out." 2,042.560121mm exactly |
| Basic weighted-average shares (3 months ended Jun-30-2026) | 2,036,458,000 | Q2 FY26 10-Q, EPS note |
| Diluted weighted-average shares (3 months ended Jun-30-2026) | 2,050,225,000 | Q2 FY26 10-Q, EPS note (GAAP, treasury-stock method for awards, if-converted for convertibles) |
| Dilutive effect of equity awards (options/RSUs, TSM) | 11,180,000 | Q2 FY26 10-Q, EPS note |
| Dilutive effect of Convertible Notes (if-converted, GAAP quarterly calc) | 254,000 | Q2 FY26 10-Q, EPS note |
| Dilutive effect of Freight Holding contingently issuable shares | 12,000 | Q2 FY26 10-Q, EPS note |
| Dilutive effect of other contingently issuable shares | 2,321,000 | Q2 FY26 10-Q, EPS note |
| **Fully diluted shares (derived, current)** | **≈2,056,327,000 (~2,056.3M)** | Derived: cover-page basic (2,042,560,121, as of Jul-31-2026) + the Q2 FY26 disclosed dilutive add-on (13,767,000 = 11,180k awards + 254k converts + 12k Freight Holding + 2,321k other) — *Inference, not from filings*: assumes the dilution rate is stable between Jun-30 and Jul-31, 2026 |
| Share count used for market cap | 2,042,560,121 (basic, cover-page) | Per Fully Diluted Equity Rule #1 — most recent "as of" count, not a weighted-average |
| Share count used for per-share fair value | ≈2,056.3M (fully diluted, derived above) | Per Fully Diluted Equity Rule #2 |

**Convertible/exchangeable notes and dilution.** The 2028 Convertible Notes carry an initial conversion rate of 13.7848 shares per $1,000 principal, equivalent to an initial conversion price of roughly $72.5/share [Q2 FY26 10-Q, Debt note]. At the current price of $68.18 this is out-of-the-money, so the notes are correctly treated as debt (already inside Total Debt below) rather than as additional equity dilution beyond the small GAAP quarterly if-converted add-on (254,000 shares) shown above. The separate 2028 Exchangeable Senior Notes are exchangeable into shares of **Aurora** (a company Uber holds a stake in), not into Uber's own stock, so they do not dilute Uber's share count at all [Q2 FY26 10-Q, Debt note].

**Limitation.** The pool does not itemize individual option strike prices or an outstanding-options count separate from the aggregate GAAP TSM add-on, so the fully diluted figure above is built by adding the disclosed quarterly dilution amount to the more current cover-page basic count rather than an independent bottom-up TSM build. This is a reasonable approximation given the small size of the dilutive adjustment (~0.67% of basic shares) but is flagged as a limitation for downstream per-share sensitivity.

## 3. Market Capitalization

`Market cap = share count × current price = 2,042,560,121 × $68.18 = $139,261.7M`

This ties exactly to the Capital IQ figure in both source tabs ($139,261.749049M) [Financials_Quarterly Key Stats tab; Comps "Financial Data" tab, both as of 2026-08-06] — no rounding discrepancy.

## 4. Enterprise Value Bridge

| Component | Amount ($M) | Source |
|---|---:|---|
| Market capitalization | 139,261.7 | Section 3 above |
| + Total debt (short + long term, incl. finance & operating lease liabilities) | 14,731 | [Uber Financials_Quarterly.xls, Balance Sheet & Key Stats tabs, Jun-30-2026: LT Debt 10,726 + LT Leases 1,830 + Curr. Port. LT Debt 1,997 + Curr. Port. Leases 178 = 14,731] |
| + Minority / non-controlling interest | 1,083 | [Uber Financials_Quarterly.xls, Balance Sheet, Jun-30-2026] |
| + Preferred equity | 0 (nil) | [Uber Financials_Quarterly.xls, Balance Sheet — no preferred equity line since FY2019] |
| + Operating lease liabilities | Already included above | CIQ classifies Uber's Operating Lease Liabilities (FY2025: $1,559M principal, 6.6% imputed rate) as a lease-type debt instrument inside Total Debt [Financials_Quarterly.xls, Capital Structure Details]; adding them again would double-count |
| + Underfunded pension / other LT obligations | None | Pension/OPEB tab: not applicable — Uber has no defined-benefit pension |
| − Cash & equivalents (+ ST investments) | 5,391 | [Balance Sheet, Jun-30-2026: Cash and equivalents 4,870 + ST investments 521 = 5,391] |
| − Equity-method investments (treated separately) | Not netted | See cash-quality note below |
| **= Enterprise value (EV)** | **149,684.7** | Ties exactly to CIQ TEV ($149,684.749049M) — no plug |

**Cash quality.** The $5,391M netted above is genuine cash and short-term equivalents/investments — Cash and equivalents ($4,870M) plus short-term investments ($521M) [Balance Sheet, Jun-30-2026]. Restricted cash ($661M) is a separate balance-sheet line and is correctly **not** included in this figure. Uber's $12,532M of **long-term investments** (Jun-30-2026) is **not** netted here — this pool includes Uber's marked-to-market minority equity stakes (Aurora, Grab, Didi, Delivery Hero, Joby, and others), which swing materially with market prices (e.g., a $1.6B net unrealized gain on securities in Q2 FY26 alone, including a $1.1B gain on the Delivery Hero stake and a $899M gain on Aurora, partly offset by a $437M loss on Didi) [Q2 FY26 10-Q, Other Income note]. Netting a volatile, non-cash, mark-to-market portfolio like this into "cash" would understate EV and flatter net debt — it is deliberately excluded. Equity-method investments jumped from $268M (Mar-31-2026) to $3,773M (Jun-30-2026) [Balance Sheet], which the 10-Q explains is driven by Uber's enlarged Delivery Hero stake moving to equity-method accounting (see subsequent-event note below) — also not netted.

**Adjustment NOT made:** operating leases (already embedded in CIQ's Total Debt figure, see above — separately adding them would double-count, so no further adjustment is made). No pension exists. No contingent-claims adjustment is made; the pending Delivery Hero acquisition (below) is disclosed but not yet incorporated into any balance-sheet figure.

**Filing-vs-vendor debt reconciliation.** The 10-Q's own risk-factor language states "we had total outstanding indebtedness of $12.6 billion aggregate principal amount" as of Jun-30-2026 [Q2 FY26 10-Q, Risk Factors]. This is narrower than the CIQ Total Debt figure of $14,731M used above because the filing's $12.6B figure appears to exclude lease liabilities: $14,731M − ($1,830M LT leases + $178M current leases) = $12,723M, close to (not exact — residual ~$120M likely debt discount/premium/issuance-cost adjustments) the filed $12.6B. Both numbers are cited to their own source per §5 — the CIQ figure (incl. leases) is used for the EV bridge above because it reconciles cleanly to the CIQ TEV figure with no plug; the filing's narrower principal-only figure is noted for transparency.

**Material subsequent event — NOT reflected in the figures above.** On 2026-07-16 (after the Jun-30-2026 balance-sheet date, but before this report's run date), Uber signed a Business Combination Agreement to acquire **Delivery Hero SE** via a voluntary public takeover offer at €41.50/share — an implied equity value of ~$14.8 billion for 100% of Delivery Hero — subject to a 50%+1-share minimum acceptance threshold and regulatory clearances, expected to close in H2 2027 [Q2 FY26 10-Q, "Pending Acquisition of Delivery Hero" note]. Uber will fund the offer with existing cash plus new debt: it executed a **€14.2 billion bridge credit agreement** (senior unsecured loans, Morgan Stanley Senior Funding as administrative agent) on the same date [Q2 FY26 10-Q, same note; 10-Q exhibit index]. None of this — the offer consideration, the bridge facility, or any drawn debt — appears in the Jun-30-2026 balance sheet used for the EV bridge above. If the bridge facility is drawn, Total Debt could rise materially (on the order of $15–16B at spot EUR/USD) beyond the $14,731M shown here. This is the single largest near-term capital-structure risk not captured in this anchor and should be flagged explicitly by every downstream valuation agent (04 DCF, 06 SOTP, 07 scenarios) as a pending, pre-close item.

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt | $14,731M | Section 4 |
| Cash & equivalents only (strict basis) | $4,870M | [Balance Sheet, Jun-30-2026] |
| Cash & ST investments (broad basis) | $5,391M | [Balance Sheet, Jun-30-2026] |
| **Net debt — strict basis** (total debt − cash & equivalents only) | **$9,861M** | Computed here; matches `earnings/01_historical-financials.md`'s independent cross-check figure of $9,861M as of Jun-30-2026 exactly |
| **Net debt — broad basis** (total debt − cash & ST investments) | **$9,340M** | Matches CIQ's own "Net Debt" field and ties the EV bridge above with no plug |
| Net debt/EBITDA — broad basis | 1.25x | $9,340M / $7,474M LTM EBITDA |
| Net debt/EBITDA — strict basis | 1.32x | $9,861M / $7,474M LTM EBITDA |
| EBITDA basis used | $7,474M | CIQ-computed EBITDA (LTM through Jun-30-2026, reported/GAAP-derived, not a company-defined "Adjusted EBITDA") [Financials_Quarterly.xls, Key Stats] |
| S&P issuer credit rating (foreign-currency LT) | BBB+ | [Comps "Credit Health Panel" tab, financials updated 2026-08-05] |

**Canonical basis for this module.** Per CLAUDE.md §15 the strict basis (debt − cash & equivalents only) is the default net-debt definition, and it is shown above and matches the earnings module's independent figure exactly — a useful cross-check. However, the **broad basis ($9,340M) is designated canonical for this valuation module's downstream agents (02/03/04/06/07)**, because it is the figure that ties the EV bridge (Section 4) to the market cap with no plug (Reconciliation Gate 2). Any downstream agent using the strict $9,861M figure instead must state the one-line reason per the Reconciliation Gate.

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | $13.41 | Common equity $27,316M / 2,036.458M period-end basic shares [Balance Sheet, Jun-30-2026] |
| Tangible book value per share | $8.21 | Tangible book value $16,712M / 2,036.458M period-end basic shares [Balance Sheet, Jun-30-2026] |
| Net debt per share — broad basis (canonical) | $4.57 | $9,340M / 2,042.560121M market-cap share count |
| Net debt per share — strict basis | $4.83 | $9,861M / 2,042.560121M market-cap share count |

## 7. Anchor Summary (canonical numbers for downstream agents)

- **Current price:** $68.18, as of 2026-08-06 (last close, pool-verified, corroborated by two independent Capital IQ exports; ~1 trading day old at the 2026-08-09 run date — not stale).
- **Share counts:** 2,042,560,121 (basic, cover-page) for market cap; ~2,056.3M (fully diluted, derived — see limitation in §2) for per-share fair value.
- **Market cap:** $139,261.7M.
- **Net debt:** $9,340M (broad basis, canonical for this module) / $9,861M (strict basis, cross-checked against `earnings/01`).
- **EV:** $149,684.7M (ties with no plug).
- **Reporting currency:** USD.
- **Key caveats:** (1) A material subsequent event — the pending Delivery Hero acquisition (~$14.8B implied equity value, funded partly by a new €14.2B bridge credit facility signed 2026-07-16) — is NOT reflected in any figure above; downstream agents must flag it as a pre-close item that could materially raise Total Debt. (2) The fully diluted share count for per-share fair value is a derived estimate (basic cover-page count + the most recent quarter's disclosed dilution add-on), not an independently rebuilt TSM figure — flagged as a limitation. (3) $12,532M of long-term investments (including volatile, mark-to-market minority equity stakes in Aurora, Grab, Didi, Delivery Hero, and others) sits inside EV and is not netted as cash — downstream DCF/SOTP agents should consider whether to value this portfolio separately.

### Anchor Block (copy-forward)

- Price: $68.18 (2026-08-06, last close)
- Price-state: pool-verified
- Currency: USD
- Shares (market cap): 2,042,560,121 (10-Q cover page, as of 2026-07-31-2026)
- Shares (per-share fair value): ~2,056,327,000 (derived — cover-page basic + Q2 FY26 disclosed dilution add-on; limitation noted in §2)
- Market cap: $139,261.7M
- Net debt: $9,340M (broad basis, canonical) / $9,861M (strict basis, cross-check)
- EV: $149,684.7M
- Key caveats: pending Delivery Hero acquisition and €14.2B bridge facility (signed 2026-07-16) not reflected in any figure above; derived (not bottom-up) fully diluted share count; $12.5B of mark-to-market minority equity stakes sit inside EV unadjusted.
