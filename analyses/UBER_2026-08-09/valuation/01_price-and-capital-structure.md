# Price & Capital Structure — UBER

**Reporting standard:** US GAAP. **Reporting currency:** USD, in millions except per-share figures. **Fiscal year end:** December 31. Uber Technologies, Inc. is a US SEC filer (NYSE: UBER); no local-equivalent substitution is needed [FY25 10-K, cover page; Q2 FY26 10-Q (filed 2026-08-05), cover page].

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $68.18 | Capital IQ Comps export, "Financial Data" tab, "Day Close Price Latest" [Company Comparable Analysis Uber Technologies Inc.xls, Financial Data tab, as of 2026-08-06]; corroborated by Capital IQ Financials_Quarterly export, "Key Stats" tab, "Share Price" [Uber Technologies Inc NYSE UBER Financials_Quarterly.xls, Key Stats tab] | 2026-08-06 |
| Currency | USD | Both exports state "US Dollar" / "USD" | — |
| Price basis (last close / intraday / indicative) | Last close | Comps export column header "Day Close Price Latest" | 2026-08-06 |

Both pool sources agree to the cent ($68.18), so this is a **pool-verified** price, not an indicative/web quote. No web quote was attempted or needed.

**Price staleness (quantitative).** Run date is 2026-08-09 (Sunday). Quote as-of date is 2026-08-06 (Thursday). The only trading day that has elapsed since the quote and before the run date is 2026-08-07 (Friday) — **age ≈ 1 trading day**, well inside the 5-trading-day freshness threshold. **Refresh attempt:** the data pool was searched for a fresher IBKR screenshot or user-provided quote; none exists (no `data/UBER/external/` directory and no IBKR file in `data/UBER/`), so the Capital IQ comps price stands as the anchor with no refresh available or needed given its freshness. No staleness cap applies.

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | 2,042,560,121 (2,042.560mm) | Q2 FY26 10-Q cover page: "The number of shares of the registrant's common stock outstanding as of July 31, 2026 was 2,042,560,121." [Q2 FY26 10-Q (filed 2026-08-05), cover page]. Matches Capital IQ Key Stats "Shares Out." exactly (2042.560121) [Financials_Quarterly.xls, Key Stats tab] |
| Shares outstanding at balance-sheet date (Jun-30-2026) | 2,036.458mm | Capital IQ Historical Capitalization tab, "Total Shares Out. on Balance Sheet Date," last column [Financials_Quarterly.xls, Historical Capitalization tab]; ties to the 10-Q's basic weighted-average shares for the three months ended Jun-30-2026 (2,036,458 thousand) [Q2 FY26 10-Q, EPS note] |
| Diluted weighted-average shares — three months ended Jun-30-2026 | 2,050.225mm | Q2 FY26 10-Q, "Diluted weighted-average common stock outstanding" [Q2 FY26 10-Q, EPS note] |
| Diluted weighted-average shares — six months ended Jun-30-2026 | 2,060.763mm | Same note, six-month column [Q2 FY26 10-Q, EPS note] |
| Options outstanding (Jun-30-2026) | 6,099 thousand (~6.1mm), weighted-avg exercise price $51.44, in-the-money at $68.18 | Q2 FY26 10-Q, Note 7 "Stockholders' Equity," Stock Option and SAR Activity table [Q2 FY26 10-Q, Note 7] |
| SARs outstanding (Jun-30-2026) | 10 thousand (negligible) | Same table [Q2 FY26 10-Q, Note 7] |
| Unvested RSUs outstanding (Jun-30-2026) | 71,804 thousand (~71.8mm), weighted-avg grant-date fair value $71.66 | Q2 FY26 10-Q, Note 7, RSU activity table [Q2 FY26 10-Q, Note 7] |
| Convertibles / potential shares (if-converted) | 2028 Convertible Notes: $1,725mm principal, conversion rate 13.7848 shares/$1,000 (≈$72.55 conversion price); 2028 Exchangeable Senior Notes: $1,125mm principal, exchangeable into **Aurora Innovation Class A shares** (not UBER shares) — not dilutive to UBER's own share count | Capital IQ Financials_Quarterly, Capital Structure Details tab (FY2025 detail) [Financials_Quarterly.xls, Capital Structure Details tab]; conversion terms confirmed in Q2 FY26 10-Q Note on debt [Q2 FY26 10-Q, Debt note] |
| **Fully diluted shares (company GAAP TSM + if-converted), Q2 FY26 (3-month weighted avg)** | **2,050.225mm** | Q2 FY26 10-Q EPS note reconciliation: basic 2,036,458 + dilutive equity awards (options/RSUs, TSM) 11,180 + Freight Holding contingently issuable shares 12 + convertible notes (if-converted) 254 + other contingently issuable shares 2,321 = 2,050,225 (thousand) [Q2 FY26 10-Q, EPS note] |
| Share count used for market cap | 2,042.560mm (basic, cover-page, as of Jul-31-2026) | Per Fully Diluted Equity Rules: market-cap count uses the most recent "as of" shares outstanding, not a period weighted-average [Q2 FY26 10-Q, cover page] |
| Share count used for per-share fair value | 2,050.225mm (diluted weighted-average, three months ended Jun-30-2026) | Most recent GAAP-computed fully diluted count (TSM for options/RSUs, if-converted for convertibles) [Q2 FY26 10-Q, EPS note] |

**Share Count Reconciliation Table (Q2 FY26, three months ended Jun-30-2026, in thousands):**

| Step | Shares |
|---|---:|
| Basic weighted-average | 2,036,458 |
| + Dilutive effect of equity awards (options + RSUs, treasury-stock method) | 11,180 |
| + Dilutive effect of Freight Holding contingently issuable shares | 12 |
| + Dilutive effect of Convertible Notes (if-converted) | 254 |
| + Dilutive effect of other contingently issuable shares | 2,321 |
| = Diluted weighted-average shares | 2,050,225 |

Note on gap between the two counts used: the cover-page basic count (2,042.560mm, as of Jul-31-2026) is used for market cap because it is the most current "as of" spot count. The diluted weighted-average (2,050.225mm) is a Q2 FY26 period-average, not a spot count as of Jul-31-2026 — it is used for per-share fair value because it is the company's own GAAP-computed fully diluted figure (treasury-stock method for options/RSUs, if-converted for convertibles) and is more rigorous than a self-derived estimate. This mixes two dates (Jun-30 quarter-average dilution vs. Jul-31 spot basic count); the ~2% gap between the two counts (13.7mm shares, the Q2 net dilution) is immaterial to fair-value-per-share outputs and is disclosed here as a limitation rather than blended into a single inferred number. The 2028 Exchangeable Senior Notes are excluded from UBER's own dilution because they convert into Aurora Innovation shares, not UBER shares [Q2 FY26 10-Q, Debt note].

Uber pays no dividend and has an active buyback program (Q2 FY26 repurchases: $518mm; buybacks ranged $150mm–$3,011mm/quarter over the trailing two years) [Financials_Quarterly.xls, Cash Flow tab, "Repurchase of Common Stock"], which is why basic shares outstanding have trended down from ~2,078mm (mid-2025) to ~2,036–2,043mm (mid-2026) despite ongoing equity issuance from vesting RSUs.

## 3. Market Capitalization

`Market cap = share count × current price = 2,042,560,121 × $68.18 = $139,261.7mm`

This ties exactly to the Capital IQ comps export's own computed "Market Capitalization Latest" of $139,261.749mm [Company Comparable Analysis Uber Technologies Inc.xls, Financial Data tab] and to the Financials_Quarterly Key Stats "Market Capitalization" of $139,261.749mm [Financials_Quarterly.xls, Key Stats tab].

## 4. Enterprise Value Bridge

All figures as of the balance sheet date Jun-30-2026 unless noted; price/share count as stated above.

| Component | Amount ($mm) | Source |
|---|---:|---|
| Market capitalization | 139,261.7 | Section 3 above |
| + Total debt (short + long term) | 14,731 | Financials_Quarterly.xls, Key Stats tab, "Total Debt" [as of Jun-30-2026]; reconciles to balance sheet: Long-Term Debt 10,726 + Long-Term Leases 1,830 + Current Portion LT Debt 1,997 + Current Portion of Leases 178 = 14,731 [Financials_Quarterly.xls, Balance Sheet tab] |
| + Minority / non-controlling interest | 1,083 | Financials_Quarterly.xls, Key Stats tab, "Total Minority Interest"; ties to Balance Sheet "Minority Interest" line [Financials_Quarterly.xls, Balance Sheet tab] |
| + Preferred equity | 0 | Financials_Quarterly.xls, Key Stats tab, "Pref. Equity" = "-"; Balance Sheet shows no preferred stock outstanding in any recent quarter (only a legacy 2018–2019 convertible preferred that had converted by 2020) [Financials_Quarterly.xls, Balance Sheet tab] |
| + Operating lease liabilities (material, but already included above) | 0 (already in Total Debt) | Operating and finance lease liabilities ($1,559mm operating + $222mm finance per the FY2025 tranche detail) are already folded into the CIQ "Total Debt" figure via "Total Lease Liabilities" — not added again [Financials_Quarterly.xls, Capital Structure Summary tab; Capital Structure Details tab] |
| + Underfunded pension / other long-term obligations | Not applicable | No pension/OPEB plan disclosed — "No Data Available" [Financials_Quarterly.xls, Pension OPEB tab] |
| − Cash & equivalents (+ ST investments) | (5,391) | Financials_Quarterly.xls, Balance Sheet tab: Cash and Equivalents 4,870 + Short Term Investments 521 = 5,391 [as of Jun-30-2026]; matches Key Stats "Cash & Short Term Investments" |
| − Equity-method investments (treated separately — NOT netted) | Not netted; disclosed only | See Cash Quality note below |
| **= Enterprise value (EV)** | **149,684.7** | 139,261.7 + 14,731 + 1,083 + 0 − 5,391 = 149,684.7; ties exactly to Capital IQ's own computed "Total Enterprise Value (TEV)" of $149,684.749mm [Financials_Quarterly.xls, Key Stats tab; Company Comparable Analysis, Financial Data tab] |

**Adjustments NOT made, and why:** No separate operating-lease add-back (already embedded in Total Debt per the source, avoiding double-count). No pension adjustment (none exists). No contingent-consideration / earn-out liability add-back beyond what is captured in the "other contingently issuable shares" dilution already reflected in the diluted share count (Section 2) — Uber does not disclose a separate cash earn-out liability material to the EV bridge in the reviewed sources.

**Cash quality — real operating cash only.** The $5,391mm netted above is Cash and Equivalents ($4,870mm) plus Short-Term Investments ($521mm) only [Financials_Quarterly.xls, Balance Sheet tab]. It explicitly **excludes**: Restricted Cash ($661mm, a separate balance-sheet line, not netted) and Long-Term Investments ($12,532mm, a separate balance-sheet line, not netted). Within that $12,532mm Long-Term Investments balance sits $3,773mm of **equity-method investments** — Delivery Hero ($3,502mm, reclassified from marketable securities to an equity-method stake during Q2 FY26 after a stake increase), Careem Technologies ($147mm), and other ($124mm) [Q2 FY26 10-Q, Note 3 — Equity Method Investments]. None of this $3,773mm, nor the remaining ~$8.8bn of long-term investments (public/private equity and debt securities carried at fair value, per the 10-Q's investment-risk disclosure), is netted into the EV bridge above — the canonical bridge matches the vendor's own TEV computation and nets only true cash & ST investments. Flag: a downstream agent building a "core operating EV" excluding these large non-operating financial-asset stakes (equity securities in Aurora, Didi, Grab, Joby, and now Delivery Hero, plus the equity-method book) would show a materially lower EV than the $149,684.7mm canonical figure above; this agent presents the canonical (vendor-consistent) bridge and flags the non-operating asset value here rather than silently netting it.

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt | $14,731mm | Section 4 |
| Cash & equivalents (+ ST investments) | $5,391mm | Section 4 |
| Net debt (total debt − cash, **strict basis**) | $9,340mm | 14,731 − 5,391 = 9,340; ties to Capital IQ Comps "LTM Net Debt" of $9,340mm [Company Comparable Analysis, Financial Data tab] |
| LTM EBITDA (CIQ-computed, GAAP-basis: EBIT + D&A) | $7,474mm | Financials_Quarterly.xls, Key Stats tab, "EBITDA," LTM through Jun-30-2026 [as reported in the Press Release LTM column] |
| Net Debt / LTM EBITDA | 1.25x | 9,340 / 7,474 = 1.25 |
| S&P issuer credit rating (foreign-currency, long-term) | BBB+ (investment grade) | Company Comparable Analysis, Credit Health Panel tab [as of 2026-08-06] |

Label note: the LTM EBITDA figure above is Capital IQ's own GAAP-basis calculation (EBIT + D&A), not a company-defined "Adjusted EBITDA." Uber itself discontinued disclosing a consolidated Adjusted EBITDA measure starting Q1 FY26, replacing segment Adjusted EBITDA with "Segment Operating Income" [Q2 FY26 10-Q, segment note: "Beginning in the first quarter of 2026, we changed our segment operating performance measure from Segment Adjusted EBITDA to Segment Operating Income."]. No consolidated company-adjusted-EBITDA figure was found in the Q2 FY26 10-Q or the Q2 FY26 earnings call transcript. Downstream multiples agents should use the CIQ GAAP-basis EBITDA above (or build their own adjusted figure from disclosed line items) and label the basis explicitly.

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | $13.41 | Total Common Equity $27,316mm ÷ 2,036.458mm shares (balance-sheet-date count) [Financials_Quarterly.xls, Balance Sheet / Historical Capitalization tabs]. Using the market-cap share count (2,042.560mm) instead gives $13.38 — immaterial difference, both bases shown for transparency |
| Tangible book value per share | $8.21 | Tangible Book Value $16,712mm ÷ 2,036.458mm shares [Financials_Quarterly.xls, Historical Capitalization tab]; matches Comps sheet "LTM Tangible Book Value/Share" of $8.21 exactly |
| Net cash (or net debt) per share (strict basis) | $(4.56) net debt/share | Net debt $9,340mm ÷ 2,050.225mm diluted weighted-average shares (per-share fair-value count) = $4.56 net debt per share |

## 7. Anchor Summary (canonical numbers for downstream agents)

Current price $68.18 (as of 2026-08-06, last close, pool-verified — Capital IQ comps export corroborated by the Financials_Quarterly Key Stats export). The price is ~1 trading day old at the run date (2026-08-09); no staleness cap applies. Market cap uses the 10-Q cover-page basic count (2,042.560mm shares, as of Jul-31-2026); per-share fair value should use the diluted weighted-average count (2,050.225mm, three months ended Jun-30-2026). Market cap is $139,261.7mm; enterprise value is $149,684.7mm, built from total debt $14,731mm, minority interest $1,083mm, zero preferred equity, and $5,391mm of true cash & ST investments (restricted cash and $3,773mm of equity-method/financial-asset investments are explicitly excluded from the cash netted, per the Cash Quality note in Section 4). Net debt is $9,340mm (strict basis: total debt − cash & ST investments), or 1.25x LTM EBITDA. Reporting currency is USD; reporting standard is US GAAP. No balance-sheet or price-related caps apply to this module.

### Anchor Block (copy-forward)

- Price: $68.18 (2026-08-06, last close)
- Price-state: pool-verified
- Currency: USD
- Shares (market cap): 2,042.560mm (10-Q cover page, as of 2026-07-31)
- Shares (per-share fair value): 2,050.225mm (diluted weighted-average, three months ended 2026-06-30; GAAP TSM + if-converted)
- Market cap: $139,261.7mm
- Net debt: $9,340mm (strict basis: total debt $14,731mm − cash & ST investments $5,391mm)
- EV: $149,684.7mm
- Key caveats: (1) per-share fair-value share count is a Q2 FY26 weighted-average, not a spot count as of the market-cap date — an immaterial (~0.4%) mismatch, disclosed rather than blended; (2) $3,773mm of equity-method investments (mainly a new $3,502mm Delivery Hero stake reclassified in Q2 FY26) and further financial-asset investments sit inside the $12,532mm Long-Term Investments balance and are NOT netted from EV — the canonical bridge matches the vendor's own TEV computation; a "core operating EV" excluding these would be materially lower and is not computed here; (3) Uber discontinued consolidated Adjusted EBITDA disclosure in Q1 FY26 — the LTM EBITDA cited (Section 5) is Capital IQ's own GAAP-basis calculation, not a company-adjusted figure.
