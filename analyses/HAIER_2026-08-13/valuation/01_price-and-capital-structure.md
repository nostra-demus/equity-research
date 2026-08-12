# Price & Capital Structure — HAIER (Haier Smart Home Co., Ltd., SHSE:600690)

**Jurisdiction and reporting basis:** Mainland-China-incorporated, dual-primary-listed on the Shanghai Stock Exchange (A-shares, SHSE:600690) and the Hong Kong Stock Exchange (H-shares, SEHK:6690), plus a Frankfurt-listed D-share line (XTRA:690D and related venues) and an unsponsored Level-I ADR (OTC Pink: HSHC.Y). A-share filings are prepared under China Accounting Standards for Business Enterprises (CAS/ASBE); the H-share annual report restates to IFRS, and the company states net profit/equity attributable to owners are not materially different between the two bases. All figures below are in RMB (CNY) millions unless stated otherwise, fiscal year ending 31 December. Source: `Haier_Smart_Home_Co_Ltd_-_Form_Annual_Report(Apr-27-2026).pdf` (H-share/IFRS), contents page; `earnings/01_historical-financials.md` §1A (jurisdiction cross-check).

No `ciq_facts.json` sidecar exists for this ticker (confirmed absent in `analyses/HAIER_2026-08-13/_pool_extracts/`). All figures below are this agent's own sourced read of the Capital IQ workbook exports and the balance sheet, cross-checked against the earnings module's independently-computed net-debt figures (`earnings/01_historical-financials.md`), which reconcile exactly (see §5).

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | CNY 21.75 (A-shares / Domestic Shares, SHSE:600690 — primary listing) | Haier Smart Home Co Ltd SHSE 600690 Equity Listings.xls, Equity Listings tab | 2026-08-12 (last close, trade date stated in export) |
| Currency | CNY (RMB) | — | — |
| Price basis | Last close | Equity Listings tab, "Last Close Price" field | 2026-08-12 |

**Other listing venues, same trade date (context, not the anchor):** H-shares (SEHK:6690) HKD 21.08; H-shares via Shanghai-HK Stock Connect (SHSC:6690) HKD 21.08; D-shares (XTRA:690D, Xetra) EUR 1.87; D-shares (Deutsche Boerse, DB:690D) EUR 1.89; D-shares (Wiener Boerse, WBAG:690D) EUR 1.87 — all dated 2026-08-12. Unsponsored ADR (OTC Pink: HSHC.Y, 4 ordinary shares per ADR) USD 10.85, dated 2026-08-11 (one day older). [Equity Listings.xls, Equity Listings tab]

**Price staleness (quantitative).** Age = run date (2026-08-13) − quote as-of date (2026-08-12) = 1 calendar day ≈ 1 trading day. This is well under the 5-trading-day threshold — no refresh attempt was needed and none of the staleness score caps apply. The quote carries its own trade date (not merely a file-download date), so this is a genuine as-of date, not an "unconfirmed" vendor-export case.

**Cross-vendor-snapshot note (pool-internal, not a partial-data trigger):** A separate Capital IQ sheet in the same workbook family — "Financials.xls," Key Stats tab, "Latest Capitalization" section — carries an undated domestic-share price cell of CNY 22.00, about 1.1% above the trade-dated CNY 21.75 close used here. The same sheet's H-share (CNY-equivalent 18.504759) and D-share (CNY-equivalent 14.511014) price cells reconcile almost exactly to the 2026-08-12 HKD 21.08 and EUR 1.87 closes shown above (implied cross-rates ≈0.8776 CNY/HKD and ≈7.760 CNY/EUR), indicating those two cells were refreshed to 2026-08-12 while the domestic cell was not. This is a same-day vendor-snapshot timing artifact, not a stale price or a corroborated-but-conflicting web quote (the Partial-Data Rule's "two web sources" case does not apply — both figures are pool data). Per the same discipline (anchor on the more precisely-dated, lower figure), this report anchors on CNY 21.75 for the primary listing and recomputes the multi-class market cap accordingly (§3), while showing the Key-Stats snapshot value as a labelled cross-check.

**Price-state: `pool-verified`.**

## 2. Share Count

| Field | Value | Source |
|---:|---:|---|
| Basic shares outstanding (as-of Mar-31-2026, balance sheet date) | 9,303.218356 million | Balance Sheet tab, "Total Shares Out. on Balance Sheet Date," filing date 2026-04-27 |
| Basic shares outstanding (as-of Mar-31-2026, filing date) | 9,303.207356 million | Balance Sheet tab, "Total Shares Out. on Filing Date" |
| Shares outstanding — latest CapIQ snapshot (post-buyback, ~2026-08-12) | 9,255.610366 million | Key Stats tab, "Latest Capitalization" (Domestic 6,131.874725m + H-shares 2,853.587266m + D-shares 270.148375m); independently cross-validated at 9,255.6m in Company Comparable Analysis, Financial Data tab, "Shares Outstanding Latest," As-Of Date 2026-08-12 |
| Weighted Avg. Basic Shares Out. (LTM ended Mar-31-2026) | 9,223.987581 million | Income Statement tab |
| Weighted Avg. Diluted Shares Out. (LTM ended Mar-31-2026) | 9,311.825848 million | Income Statement tab |
| Options/RSUs count (if disclosed) | Not disclosed in the pool | — |
| Convertibles / potential shares (if disclosed) | Not disclosed in the pool | — |
| **Fully diluted shares (TSM + if-converted)** | **Not computable — no strike/conversion detail available** | See limitation below |
| Share count used for market cap | 9,255.610366 million (latest "as of" count, split by class) | Fully Diluted Equity Rules Hard Rule #1 |
| Share count used for per-share fair value | 9,311.825848 million (diluted weighted-average, LTM ended Mar-2026) | Fully Diluted Equity Rules Hard Rule #2, fallback provision |

**Share Count Reconciliation Table**

| Step | Shares (million) |
|---|---:|
| Basic shares outstanding (balance sheet date, Mar-31-2026) | 9,303.218356 |
| Latest CapIQ snapshot (~2026-08-12, net of buyback since Mar-31) | 9,255.610366 |
| + Dilutive effect embedded in the diluted weighted-average (LTM) vs. the LTM basic weighted-average | +87.838267 (9,311.825848 − 9,223.987581) |
| = Diluted weighted-average shares used for per-share fair value | 9,311.825848 |

**Limitation.** CapIQ's Key Stats, Historical Capitalization, and Capital Structure tabs all default to "Dilution: Basic" and no options/RSU/convertible schedule (strike prices, vesting, conversion terms) was located anywhere in the pool — not in the Financials workbook, the Capital Structure Details tab, nor the annual/interim filing excerpts reviewed by the earnings module (`earnings/00_earnings-data-triage.md` §5, same finding). A true treasury-stock-method fully diluted count cannot be built. This report falls back to the diluted weighted-average shares from the income statement (9,311.825848m, LTM ended Mar-2026) as the best available proxy for per-share fair-value work, labeled as a limitation per Fully Diluted Equity Rules Hard Rule #2. Note the counter-intuitive direction: this diluted weighted-average is *higher* than the latest point-in-time shares-out snapshot (9,255.61m) — it partly reflects an earlier, higher share count before the company's ongoing buyback (Treasury Stock rose from CNY −4,261.1m at FY2025-end to CNY −4,731.6m at Mar-31-2026, confirming active repurchases) plus a modest dilutive effect from unidentified instruments. Downstream per-share fair-value agents should treat this as a mild upside bias risk until a genuine options/converts schedule can be sourced from the annual report's equity notes.

## 3. Market Capitalization

Haier is a multi-class issuer (Domestic A-shares, H-shares, D-shares each trade at different prices in different currencies). Market cap is built per-class, consistent with Capital IQ's own methodology, using the 2026-08-12-dated closes from §1:

```
Domestic Shares:  6,131.874725m × CNY 21.75      = CNY 133,368.275269m
H-Shares:         2,853.587266m × CNY 18.504759*  = CNY  52,804.944849m
D-Shares:           270.148375m × CNY 14.511014*  = CNY   3,920.126929m
                                                     ─────────────────
Market Capitalization                             = CNY 190,093.347047m
```
\* H-share and D-share prices are the CNY-equivalent cells from the Key Stats tab, which already reconcile to the 2026-08-12 HKD 21.08 and EUR 1.87 closes (§1); no separate FX conversion was performed by this agent — the CNY-denominated cells were used as provided.

**Cross-check (CIQ Key-Stats snapshot, domestic cell undated/CNY 22.00):** CNY 191,626.341744m — about CNY 1,532.99m (0.81%) higher, entirely attributable to the CNY 22.00 vs. CNY 21.75 domestic-share price cell discussed in §1. Both figures are shown; **CNY 190,093.3m (using the trade-dated 21.75 close) is the canonical figure carried forward.**

**Rejected approach (flagged so downstream agents do not use it):** multiplying total shares outstanding (9,255.610366m) by the single domestic price (21.75) alone would give CNY 201,309.5m — this overstates market cap by ~5.9% because it ignores the H-share and D-share discount to the domestic A-share price (the "AH premium"). This single-price shortcut is NOT used.

## 4. Enterprise Value Bridge

Balance-sheet date used: **31-March-2026** (latest available quarterly balance sheet, filed 2026-04-27) — the most recent capital-structure snapshot in the pool.

| Component | Amount (CNY m) | Source |
|---|---:|---|
| Market capitalization | 190,093.35 | §3 above |
| + Total debt (short + long term) | 42,076.81 | Balance Sheet / Capital Structure Summary tab, Mar-31-2026 |
| + Minority / non-controlling interest | 9,606.03 | Balance Sheet tab, Mar-31-2026 |
| + Preferred equity | 0.00 (none disclosed) | Balance Sheet / Capital Structure Summary tab |
| + Operating lease liabilities | Not added separately — already inside Total Debt (CNY 6,182.66m of "Total Lease Liabilities" is a Capital Structure Summary sub-component of the CNY 42,076.81m Total Debt figure) | Capital Structure Details tab |
| + Underfunded pension / other LT obligations | Not added — immaterial (Pension & Other Post-Retire. Benefits was CNY 1,587.46m at FY2025-end, <1% of EV; line is blank/not reported at Mar-31-2026) | Balance Sheet tab |
| − Cash & equivalents (+ ST investments) — **canonical, broad basis** | 66,675.48 | Balance Sheet / Capital Structure Summary tab, Mar-31-2026 |
| − Equity-method investments | Not netted — shown separately, informational only (CNY 21,697.25m at Mar-31-2026; JV/associate stakes, not a bridge adjustment) | Balance Sheet tab, "Equity Method Investments" |
| **= Enterprise value (EV) — broad cash basis** | **175,100.70** | Computed: 190,093.35 + 42,076.81 + 9,606.03 + 0 − 66,675.48 |

**Cross-check (CIQ Key-Stats snapshot TEV, using its own CNY 22.00 domestic price):** CNY 176,633.70m — reconciles to within 0.9% of the canonical figure above, the gap fully explained by the market-cap difference in §3. An independent third cross-check — the USD-denominated Company Comparable Analysis workbook (Implied Valuation tab, as-of 2026-08-12) — reports Haier's "Total Enterprise Value Latest" as USD 25,802.9m; the implied CNY/USD conversion rate backed out from that same workbook's LTM revenue line (CNY 296,915.33m ÷ USD 44,028.5m ≈ 6.743) converts this to ≈ CNY 174,000m, within ~0.6% of the canonical CNY 175,100.7m figure — a third, independently-computed source supporting the same EV.

**Adjustments NOT made, stated explicitly:**
- Operating leases: not a separate add-on — already capitalized inside Total Debt via "Total Lease Liabilities" (CNY 6,182.66m), consistent with lease-capitalization accounting already reflected on the balance sheet.
- Pension: immaterial (<1% of EV), not adjusted.
- Contingent liabilities / guarantees: no disclosure reviewed in this pool pull; not adjusted, not a EV bridge line item by convention.
- Equity-method investments (CNY 21,697.25m): kept outside the bridge as an asset-side item, per standard CIQ convention — not subtracted from EV as if it were cash, and not added as if it were an operating asset requiring a separate multiple (that judgment belongs to `06_sum-of-the-parts` if material to segment economics).

### Cash quality — net only real, operating cash

Total Cash & ST Investments (CNY 66,675.48m) breaks into three balance-sheet lines:

| Line | Amount (CNY m, Mar-31-2026) | Nature |
|---|---:|---|
| Cash And Equivalents | 50,580.31 | Operating cash — strict basis |
| Short Term Investments | 11,011.21 | Conventional short-duration instruments |
| Trading Asset Securities | 5,083.96 | Fair-value-through-P&L instruments — carries mark-to-market exposure by classification |

"Trading Asset Securities" is, by its own accounting classification, exactly the kind of item CLAUDE.md §4/§15 and this module's cash-quality test flag for exclusion by default — a fair-value-through-P&L security carrying mark-to-market P&L, not confirmed as short-tenor operating cash from any note-level disclosure available to this agent in the current pool pull (the granular financial-instruments note inside the full annual report PDF was not parsed at line-item detail for this agent's task). No evidence was found that it is restricted, margin, or held by a financial subsidiary either — so this is a data-quality caveat, not a confirmed exclusion.

**EV shown three ways:**

| Basis | Cash netted (CNY m) | EV (CNY m) |
|---|---:|---:|
| Strict (Cash & Equivalents only) | 50,580.31 | 191,195.88 |
| **Broad (Cash & Equiv. + ST Investments + Trading Securities) — canonical, matches company's own filed Net Debt and CapIQ's headline convention** | 66,675.48 | **175,100.70** |
| Memo: excl. Trading Securities only (Cash & Equiv. + ST Investments) | 61,591.52 | 180,184.66 |

**Canonical choice and why:** the broad basis is used as the headline EV because it matches (a) the company's own reported balance-sheet "Net Debt" line, which nets all three components, and (b) the earnings module's independent cross-check (`earnings/01_historical-financials.md` §1, footnote 1), which reconciles to the identical CNY −24,598.7m broad net-debt figure at Mar-31-2026. Netting the Trading Asset Securities line into cash without note-level confirmation is a known way to understate EV and flatter net debt — flagged here explicitly, and the strict/excl.-trading-securities figures above let a downstream agent substitute a more conservative basis if warranted.

## 5. Net Debt & Leverage Snapshot

| Metric | Value (CNY m, Mar-31-2026) | Source |
|---|---:|---|
| Total debt | 42,076.81 | Balance Sheet / Capital Structure Summary tab |
| Cash & equivalents (strict) | 50,580.31 | Balance Sheet tab |
| Cash & ST investments (broad) | 66,675.48 | Balance Sheet / Capital Structure Summary tab |
| **Net debt (strict) = Total debt − Cash & equivalents only** | **−8,503.50 (net CASH)** | Computed; matches `earnings/01_historical-financials.md` §2 exactly (CNY −8,503.5m at Mar-31-2026) |
| **Net debt (broad) = Total debt − Cash & ST investments** | **−24,598.67 (net CASH)** | Balance Sheet tab, "Net Debt" line; matches `earnings/01_historical-financials.md` §1 footnote 1 exactly |
| Net debt (strict) / LTM EBITDA | −0.33x | Computed: −8,503.50 ÷ 25,950.21 (LTM EBITDA ended Mar-2026, Income Statement tab) |
| Net debt (broad) / LTM EBITDA | −0.95x | Computed: −24,598.67 ÷ 25,950.21 |
| Total debt / LTM EBITDA | 1.62x | Computed: 42,076.81 ÷ 25,950.21 (Capital Structure Summary tab shows 1.40x on a FY-2025-based EBITDA denominator; the LTM-based figure here uses the Mar-2026 LTM EBITDA) |

Both bases show Haier in a net-cash position (negative net debt) as of the latest quarter — consistent with `earnings/01_historical-financials.md`'s finding that the net-cash cushion has shrunk every year since FY2022 (broad net debt/EBITDA moved from about −1.24x in FY2022 toward roughly flat by FY2025) but remains net-cash through Q1 2026 on both measures. Capital Structure Summary tab shows CapIQ's own convention marking "Net Debt/EBITDA" as "NM" for negative net debt — the computed ratios above are shown instead of relying on that "NM" label.

## 6. Per-Share Reference Values

| Metric | Per Share (CNY) | Source |
|---|---:|---|
| Book value per share | 13.46 | Balance Sheet tab: Total Common Equity CNY 125,187.73m ÷ 9,303.218356m shares (balance sheet date, Mar-31-2026); matches CapIQ's own "Book Value/Share" cell |
| Tangible book value per share | 9.10 | Balance Sheet tab: Tangible Book Value CNY 84,651.27m ÷ 9,303.218356m shares; matches CapIQ's own "Tangible Book Value/Share" cell |
| Net cash per share (strict) | 0.91 | CNY 8,503.50m ÷ 9,303.218356m shares |
| Net cash per share (broad) | 2.64 | CNY 24,598.67m ÷ 9,303.218356m shares |

Per-share figures above use the balance-sheet-date share count (9,303.218356m, matching CapIQ's own book-value-per-share denominator) rather than the later ~2026-08-12 buyback-adjusted count (9,255.61m), consistent with pairing a balance-sheet-date metric with its own balance-sheet-date share count.

## 7. Anchor Summary (canonical numbers for downstream agents)

- **Current price:** CNY 21.75 (A-shares, SHSE:600690, primary listing), as of 2026-08-12, last close. 1 calendar day old at run date — no staleness cap.
- **Share counts used:** market cap → 9,255.610366m (latest CapIQ snapshot, ~2026-08-12, multi-class total); per-share fair value → 9,311.825848m (diluted weighted-average, LTM ended Mar-2026 — a labeled limitation, see §2).
- **Market cap:** CNY 190,093.3m (multi-class bridge; CIQ snapshot cross-check CNY 191,626.3m, within 0.8%).
- **Net debt:** broad basis (canonical) CNY −24,598.7m (net cash); strict basis CNY −8,503.5m (net cash) — both as of 31-Mar-2026. Use the broad basis unless a downstream agent states a specific reason to switch (Reconciliation Gate 1).
- **Enterprise value (EV):** CNY 175,100.7m (broad cash basis, canonical); CNY 191,195.9m (strict cash basis); CNY 180,184.7m (excl.-trading-securities memo basis). See §4 for the full three-way table and cash-quality caveat.
- **Reporting currency:** CNY (RMB), millions.

### Anchor Block (copy-forward)

- Price: CNY 21.75 (2026-08-12, last close — SHSE:600690 primary listing)
- Price-state: pool-verified
- Currency: CNY (RMB)
- Shares (market cap): 9,255.610366 million (CapIQ latest snapshot, ~2026-08-12, multi-class total — source: Key Stats tab, cross-validated vs. Company Comparable Analysis Financial Data tab)
- Shares (per-share fair value): 9,311.825848 million (diluted weighted-average, LTM ended Mar-2026 — limitation: no options/convertibles schedule found, so this is not a true fully-diluted TSM count)
- Market cap: CNY 190,093.3 million
- Net debt: CNY −24,598.7 million (broad, canonical) / CNY −8,503.5 million (strict) — both net cash
- EV: CNY 175,100.7 million (broad cash basis, canonical)
- Key caveats: (1) no options/RSU/convertible dilution schedule in the pool — per-share fair value uses diluted weighted-average as a fallback, not a true fully-diluted TSM count; (2) CNY 5,083.96m of "Trading Asset Securities" inside the broad cash figure carries mark-to-market P&L exposure by classification and is not confirmed as pure liquid operating cash from note-level detail available to this agent — shown as a three-way EV table in §4, broad basis used as canonical; (3) a same-day vendor-snapshot timing mismatch between two CapIQ sheets (CNY 22.00 vs. the trade-dated CNY 21.75 domestic close) is resolved in favor of the more precisely-dated figure, with the ~0.8-0.9% alternative shown as a cross-check throughout.
