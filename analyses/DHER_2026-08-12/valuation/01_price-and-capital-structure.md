# Price & Capital Structure — DHER (Delivery Hero SE)

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | €37.20 | Capital IQ, Delivery Hero SE XTRA:DHER Financials.xls, "Key Stats" tab (Latest Capitalization) and "Multiples" tab (quarter-to-date column) | 2026-08-07 |
| Cross-check (USD-converted) | $43.01 | Capital IQ, Company Comparable Analysis Delivery Hero SE.xls, "Financial Data" tab (Day Close Price Latest, currency = USD) | 2026-08-10 |
| Currency | EUR (company's trading and reporting currency; Frankfurt Xetra listing) | — | — |
| Price basis | Last close (Capital IQ; "Historical Equity Pricing Data supplied by Interactive Data Pricing and Reference Data LLC") | — | — |

**Price-state: pool-verified.** The current price is present directly in the data pool from two independent Capital IQ exports pulled three days apart (2026-08-07 and 2026-08-10), and they reconcile: $43.01 ÷ €37.20 implies an EUR/USD rate of ~1.156, a plausible spot rate — the two figures are the same underlying quote in two currencies, not a discrepancy. The €37.20 figure is also internally consistent with the vendor's own downstream math: Market Cap = 303.744978m shares × €37.20 = €11,299.3m, which is exactly the "Market Capitalization" line the workbook itself reports (Key Stats tab) — confirming the price, share count, and market cap tie together as of the same pricing date.

**Deal contamination — read this before using the price anywhere downstream.** Per the valuation-data-triage note, Uber Technologies announced an acquisition offer for Delivery Hero on 2026-07-16 (M&A Call transcript, Uber Technologies, Inc., Delivery Hero SE — M&A Call, 2026-07-16). On that call, Uber's CFO stated Prosus N.V. — a major DHER shareholder — has "irrevocably committed to tender its stake," which alone would bring the acquirer's economic ownership "to over 50% following a successful offer" [Uber-DHER M&A Call, 2026-07-16, Q&A]. The current €37.20 price is therefore **not a clean read of standalone fundamentals** — it embeds the market's assessment of deal completion odds, timing, and (absent a disclosed fixed offer price in the documents reviewed) some estimate of deal terms. For scale: Capital IQ's own quarterly price series shows DHER at €15.73 as of 2026-03-26 (the FY2025 results filing date, pre-announcement) versus €37.20 now — a >130% increase, consistent with the stock re-rating on deal news rather than organic operating improvement [Delivery Hero SE XTRA DHER Financials.xls, "Historical Capitalization" tab]. **Every downstream valuation agent using this price (multiples, relative valuation, DCF-implied read, margin of safety) must carry this flag: the current price is arbitrage/deal-priced, not a standalone-fundamentals price, and any "cheap/expensive" or margin-of-safety read is really a read on deal-completion risk, not on DHER as a standalone business.** No specific fixed per-share offer consideration (cash, stock, or mix) was found in the M&A call transcript or elsewhere in the pool — the call discusses synergies (>$1bn) and EPS accretion but not a disclosed offer price; this is itself a gap this agent flags rather than estimates.

**Price staleness.** Run date 2026-08-12 minus quote date 2026-08-07 = 5 calendar days ≈ 3 trading days (Fri 08-07 close → Mon 08-10, Tue 08-11, Wed 08-12). This is well under the 5-trading-day threshold, so no refresh attempt or staleness cap applies. The price is fresh.

## 2. Share Count

| Field | Value | Source |
|---:|---:|---|
| Basic shares outstanding (latest) | 303,744,978 | Capital IQ, Financials.xls, Key Stats tab ("Latest Capitalization," implicitly as of 2026-08-07 — ties to market cap arithmetic) |
| Basic shares outstanding (FY2025 balance-sheet date, Dec-31-2025) | 298,227,538 | Capital IQ, Financials.xls, Balance Sheet tab, "Total Shares Out. on Filing Date" |
| Registered/subscribed share capital (Dec-31-2024, prior fiscal year) | 287,385,940 no-par registered shares (€287,385,940.00 subscribed capital) | Delivery Hero SE Annual Report 2024 (IFRS), "Composition of subscribed capital" |
| Weighted-average diluted shares out (FY2025) | 298.647 million | Capital IQ, Financials.xls, Income Statement tab |
| Weighted-average basic shares out (FY2025) | 298.647 million (identical to diluted) | Capital IQ, Financials.xls, Income Statement tab |
| Woowa share-option program outstanding | 905,442 options (wtd. avg. strike €44.09), FY2024 year-end | Delivery Hero SE Annual Report 2024, Note H.2 (Share-Based Payments) |
| RSUs granted in FY2024 | 2,382,976 RSUs granted during the year (cumulative outstanding not separately totalled in extract) | Delivery Hero SE Annual Report 2024, Note H.2 |
| Convertible bonds outstanding (face, FY2025) | €2,588.4 million across 6 tranches (Conv. Bonds I–IV + Convertible Loan), maturities 2026–2030, coupons 0.875%–3.25% | Capital IQ, Financials.xls, Capital Structure Summary / Capital Structure Details tabs |
| **Fully diluted shares (TSM + if-converted)** | Not computable from available extracts | See limitation below |
| Share count used for market cap | 303,744,978 (latest basic) | Capital IQ Key Stats — ties to the vendor's own market-cap arithmetic |
| Share count used for per-share fair value | 303,744,978 (latest basic), flagged as a limitation | See below |

**Limitation — fully diluted count not computable.** DHER is loss-making at the net-income level (FY2025 net loss €782.9m), so under IFRS diluted EPS = basic EPS and all potentially dilutive instruments (stock options, RSUs, and the €2,588.4m of convertible bonds) are excluded from the diluted weighted-average share count as anti-dilutive [Capital IQ Income Statement tab; Annual Report 2024 Note H.2]. That EPS treatment is not the same question as balance-sheet dilution risk: none of the six convertible-bond tranches' conversion prices or conversion ratios were extracted from the documents in the pool (the Annual Report references "conversion price or option price to be determined" only in the context of authorized/conditional share-capital resolutions, not the specific outstanding tranches' strikes). The Woowa option pool (905,442 options, ~0.3% of shares) is immaterial. The convertible-bond overhang (€2,588.4m face, ~23% of market cap) is NOT immaterial and could be dilutive if the bonds are in or near the money — most were issued in 2020–2023 when DHER traded well above its recent lows, so historical strikes are plausibly still above €37.20, but this is inference, not confirmed from filings, and is flagged rather than assumed. Downstream agents should treat the basic/latest count (303.7m) as the best available figure for both market cap and per-share fair value, with this convertible-dilution overhang carried as an explicit caveat, not netted in.

## 3. Market Capitalization

`Market cap = share count × current price = 303,744,978 × €37.20 = €11,299.3 million`

This matches the vendor's own computed figure exactly (Capital IQ Key Stats tab, "Market Capitalization" = 11,299.313181), confirming price/share-count/date alignment.

**Flag: this market cap is deal-contaminated (see §1) — it is not a clean read of DHER's standalone equity value.**

## 4. Enterprise Value Bridge

| Component | Amount (€m) | Source |
|---|---:|---|
| Market capitalization | 11,299.3 | §3 above |
| + Total debt (short + long term) | 4,625.5 | Capital IQ, Financials.xls, Balance Sheet / Capital Structure Summary tabs (FY2025) |
| + Minority / non-controlling interest | 154.2 | Capital IQ, Financials.xls, Balance Sheet tab (FY2025) |
| + Preferred equity | 0.0 (none disclosed) | Capital IQ, Financials.xls, Key Stats tab |
| + Operating lease liabilities | Not added separately — already embedded in Total Debt ("Total Lease Liabilities" €437.8m is a sub-component of the €4,625.5m debt figure, per Capital Structure Summary "Debt Summary Data") | Capital IQ, Financials.xls, Capital Structure Summary tab |
| + Underfunded pension / other LT obligations | Not added — Pension & Other Post-Retirement Benefits liability is €33.8m (FY2025), immaterial (<0.3% of EV) and not separately added to avoid double-counting a liability already in Total Liabilities | Capital IQ, Financials.xls, Balance Sheet tab |
| − Cash & equivalents (+ ST investments) | (2,112.7) | Capital IQ, Financials.xls, Balance Sheet tab (FY2025) = "Cash And Equivalents," identical to "Total Cash & ST Investments" — no separate ST-investments line exists, so no double-count risk |
| − Equity-method investments | Not netted separately — DHER's equity-method investments are €9.8m (FY2025), immaterial | Capital IQ, Financials.xls, Balance Sheet tab (Supplemental Items) |
| **= Enterprise value (EV)** | **13,966.3** | Sum of above; ties exactly to Capital IQ's own "Total Enterprise Value (TEV)" figure (Key Stats tab) |

**Adjustments NOT made, and why:** operating leases are not added on top of Total Debt because Capital IQ's Total Debt figure already includes €437.8m of lease liabilities as a debt sub-component (adding again would double-count); pension obligations (€33.8m) and equity-method investments (€9.8m) are each under 0.3% of EV and are left inside their respective balance-sheet buckets rather than pulled out, given their immateriality; no contingent-liability or litigation-reserve adjustment is made because none was quantified as material in the extracts reviewed.

**Cash quality.** DHER's "Cash & Equivalents" (€2,112.7m, FY2025) is composed of ordinary bank balances, cash on hand, and short-term liquid deposits — there is no financial-subsidiary investment book, no disclosed margin/restricted balance of any size (the FY2024 Annual Report discloses restricted cash of only €2.0 million, i.e., 0.05% of that year's cash balance — immaterial), and no long-tenor mark-to-market securities folded into the headline cash line. The vendor's "cash" definition is adopted as-is here because it is not inflated by any of the items §4 of the operating rules warns against. **EV is therefore shown on a single basis (no with/without split needed).**

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---:|---:|---|
| Total debt (FY2025) | €4,625.5m | Capital IQ, Financials.xls, Balance Sheet / Capital Structure Summary |
| Cash & equivalents (FY2025) | €2,112.7m | Capital IQ, Financials.xls, Balance Sheet |
| **Net debt (strict: total debt − cash) (FY2025)** | **€2,512.8m** | Capital IQ, Financials.xls, Balance Sheet, "Supplemental Items" (matches Capital Structure Summary tab exactly) |
| Net debt / EBITDA (GAAP EBITDA €304.9m, FY2025) | ≈8.24x | GAAP EBITDA per Capital IQ Key Stats tab (FY2025A) |
| Net debt / Adjusted EBITDA (company-defined, €903m, FY2025) | ≈2.78x | Company-reported Adjusted EBITDA, Delivery Hero SE 2025 Earnings Call transcript, Mar-26-2026 ("Adjusted EBITDA grew by a strong 30% year-over-year, reaching EUR 903 million") |

**Reported-vs-adjusted flag (§15 hygiene).** GAAP EBITDA (€304.9m) and the company's own non-GAAP "Adjusted EBITDA" (€903m) differ by roughly €600m — a large gap, not disclosed in granular bridge form in the extracts reviewed, presumably driven by stock-based compensation and one-off items. Both are shown, separately labeled; neither is silently substituted for the other. **Separately, Capital IQ's own "Capital Structure Summary" and "Ratios" tabs report Net Debt/EBITDA = 5.53x for FY2025 (and 15.55x for FY2024) — this reconciles to neither the GAAP EBITDA figure (€304.9m → 8.24x) nor the company's Adjusted EBITDA figure (€903m → 2.78x) found elsewhere in the pool.** This is flagged as an unreconciled vendor computation (implied EBITDA base of ≈€454.6m for FY2025) rather than silently adopted or averaged away; downstream agents citing a leverage ratio should use the GAAP or company-Adjusted figures above (both traceable to a named EBITDA basis) and treat the vendor's pre-computed ratio as unverified.

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---:|---:|---|
| Book value per share (FY2025, basic shares on filing date) | €5.50 | Capital IQ, Financials.xls, Balance Sheet, "Book Value/Share" (= €1,639.6m equity ÷ 298.227538m shares) |
| Tangible book value per share (FY2025) | −€11.84 | Capital IQ, Financials.xls, Balance Sheet, "Tangible Book Value/Share" (tangible book value is negative: −€3,530.5m, driven by €4,424.3m of goodwill and €745.8m of other intangibles) |
| Net debt per share (latest shares, 303,744,978) | €8.27 | Calculated: €2,512.8m ÷ 303,744,978 shares |

## 7. Anchor Summary (canonical numbers for downstream agents)

Current price is pool-verified and internally consistent (§1), but is **deal-contaminated** by Uber's pending acquisition offer for Delivery Hero (announced 2026-07-16) — it reflects deal-completion odds and an assumed (undisclosed) offer premium, not a standalone-fundamentals price. Every downstream price-relative read (margin of safety, multiples, DCF-implied, reverse-DCF) must carry this flag explicitly. Separately, the fully diluted share count is not computable from available extracts because convertible-bond conversion terms were not found in the pool; the €2,588.4m convertible-bond overhang (~23% of market cap) is a real, unquantified dilution risk that basic-share-count valuation work does not capture.

### Anchor Block (copy-forward)

- Price: €37.20 (2026-08-07, Capital IQ last close; cross-checked to $43.01 as of 2026-08-10, same underlying quote)
- Price-state: pool-verified — **but deal-contaminated (Uber acquisition offer, announced 2026-07-16); not a standalone-fundamentals price**
- Currency: EUR (Delivery Hero SE reports under IFRS; Frankfurt Xetra primary listing)
- Shares (market cap): 303,744,978 (Capital IQ Key Stats, latest — ties exactly to vendor market-cap arithmetic)
- Shares (per-share fair value): 303,744,978 (same as above; fully diluted count not computable — convertible-bond conversion terms not in pool, flagged as limitation, not netted)
- Market cap: €11,299.3 million
- Net debt: €2,512.8 million (strict basis: total debt €4,625.5m − cash & equivalents €2,112.7m, FY2025)
- EV: €13,966.3 million
- Key caveats: (1) current price and any price-relative read is deal-contaminated by the pending Uber tender offer and does not reflect standalone fundamentals; no fixed offer price was disclosed in the M&A call transcript reviewed; (2) fully diluted share count excludes €2,588.4m of convertible bonds whose conversion terms were not extracted from the pool — a real, unquantified dilution risk; (3) GAAP EBITDA (€304.9m) vs. company Adjusted EBITDA (€903m) diverge sharply, and Capital IQ's own pre-computed Net Debt/EBITDA ratio (5.53x) reconciles to neither and is treated as unverified; (4) the FY2025 Annual Report filing (filed ~2026-03-26 per Capital IQ) is not present in the data pool — FY2025 balance-sheet figures here are Capital IQ vendor extracts (Tier 5), not cross-checked against the primary filing; the FY2024 Annual Report (filed Apr-25-2025) is the only primary filing available in the pool.
