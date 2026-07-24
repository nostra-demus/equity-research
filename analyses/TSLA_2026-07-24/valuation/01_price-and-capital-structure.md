# Price & Capital Structure — TSLA

**Reporting standard:** US GAAP. **Reporting currency:** US Dollar (USD), figures in millions except per-share items. **Fiscal year end:** December 31. **Jurisdiction:** US SEC domestic filer (NasdaqGS:TSLA) — standard US form names apply directly [Form 10-Q, Jul-23-2026, cover page; valuation/00_valuation-data-triage.md §1A].

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| Current price | $319.69 | Company Comparable Analysis Tesla Inc .xls, Financial Data tab ("Day Close Price Latest") — cross-checked against Financials_Annual.xls, Historical Capitalization tab ("Pricing as of" column, last close = $319.69) | 2026-07-23 |
| Currency | USD | Same sources | — |
| Price basis | Last close (exchange close price, not intraday) | Company Comparable Analysis Tesla Inc .xls, Financial Data tab header ("Day Close Price Latest") | 2026-07-23 |

**Price state: `pool-verified`.** This price is a Capital IQ comparable-analysis export figure, cross-confirmed by a second independent CIQ tab (Historical Capitalization) showing the identical $319.69 close for the identical date. It is not a web quote and is not indicative.

**Price staleness (quantitative).** Run date is 2026-07-24; price as-of date is 2026-07-23. Age = 1 calendar day ≈ 1 trading day — well inside the 5-trading-day threshold. No refresh was needed and none was attempted; the price is fresh. No staleness cap applies to valuation confidence.

The export's own "As-Of Date" field (2026-07-24T00:00:00, i.e., the export/template date) is distinct from the quote's own dated close (2026-07-23) — the quote carries its own explicit as-of date, so this is not the "download-date-only" case; the price is `pool-verified` with a confirmed, dated as-of, not merely "unconfirmed."

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | 3,949,547,394 (≈3,949.5mm) | Form 10-Q (Jul-23-2026) cover page: "As of July 16, 2026, there were 3,949,547,394 shares of the registrant's common stock outstanding" — cross-confirmed by (a) the same 10-Q's balance sheet, "Common stock ... 3,949 ... shares issued and outstanding" as of June 30, 2026; (b) Tesla Inc NasdaqGS TSLA Public Ownership Summary.rtf, "Total ... 3,949,547,394"; (c) Company Comparable Analysis Tesla Inc .xls, Financial Data tab, "Shares Outstanding Latest" = 3,949.5mm |
| Diluted weighted-average shares (period) | 3,540mm (Q2 2026, three months ended Jun-30-2026); 3,538mm (six months ended Jun-30-2026) | Form 10-Q (Jul-23-2026), EPS reconciliation note: basic weighted-average 3,237mm (Q2) / 3,235mm (H1) + stock-based-awards dilution add of 303mm (Q2) / 303mm (H1) = diluted 3,540mm / 3,538mm |
| Options/RSUs count (if disclosed) | Not separately disclosed in this pool's extract | 10-Q references an "Equity Incentive Plans" note, but a detailed options/RSU-outstanding schedule with strike prices was not found in the extracted text; only the anti-dilutive-exclusion count (12mm, Q2 2026) and the basic-to-diluted weighted-average gap (303mm) are disclosed |
| Convertibles / potential shares (if disclosed) | $0 outstanding | Tesla Inc NasdaqGS TSLA Financials_Annual.xls, Capital Structure Summary tab — "Total Convertible Debt" = 0 for FY2024 and FY2025 (last convertible debt was $37mm in FY2023, now fully retired/converted) |
| **Fully diluted shares (approx., TSM proxy)** | **≈4,252.5mm** | Basic O/S (3,949.5mm) + a flat dilution addback of 303mm (the Q2 2026 income-statement basic-to-diluted weighted-average gap, applied as a proxy since no options/RSU strike schedule is available) + 0 convertibles. **Inference, not from filings** — see limitation below |
| Share count used for market cap | 3,949,547,394 (3,949.5mm) | Cover-page/balance-sheet count, per Fully Diluted Equity Rule 1 (most recent "as of" count, not the period weighted-average) |
| Share count used for per-share fair value | ≈4,252.5mm (approx. fully diluted) — limitation labeled | See note below |

**Material finding — CIQ's own "Historical Capitalization" tab is stale for the latest quarter.** That tab's Jun-30-2026 "Shares Out." column reads 3,755.723871mm (labeled "Dilution: Basic"), which is inconsistent with the 10-Q's own balance sheet figure for the identical date (3,949mm issued and outstanding) and with the cover page, Public Ownership Summary, and the Financial Data tab (all 3,949.5mm). The 10-Q's own statement of stockholders' equity explains the gap: shares outstanding rose from 3,755mm (Mar-31-2026) to 3,949mm (Jun-30-2026) — a 194mm-share increase in one quarter from "issuance of common stock for equity incentive awards and acquisitions, net of transaction costs" [Form 10-Q, Jul-23-2026, Condensed Consolidated Statement of Stockholders' Equity]. The Historical Capitalization tab's Jun-30-2026 column appears to have carried forward a prior-period share count rather than the quarter's actual balance-sheet figure — a vendor data-lag/bad-extraction issue on CIQ's side (not a real data gap; §20). **This report does not use the Historical Capitalization tab's Jun-30-2026 share count** for that reason; the 10-Q's own primary-source count (3,949.5mm), independently confirmed by three other sources, is used instead.

**Basic vs. fully diluted gap and its cause.** The 194mm-share increase concentrated late in Q2 2026 (tied to "equity incentive awards and acquisitions" per the filing) means the quarter's diluted weighted-average (3,540mm) sits BELOW the current point-in-time basic count (3,949.5mm) — a weighted average necessarily lags a large, back-loaded increase in the share base. Using the disclosed diluted weighted-average directly as the per-share-fair-value count would understate the current share base (a diluted count cannot legitimately be lower than the current basic count). This report therefore uses basic O/S plus a flat TSM-style dilution addback (303mm, the quarter's own basic-to-diluted gap) as the per-share-fair-value proxy (≈4,252.5mm), labeled **Inference, not from filings** — a genuine limitation, since no options/RSU outstanding-and-strike schedule was found in this pool to build a rules-based treasury-stock-method count. Downstream agents should treat the true fully diluted count as lying in the 3,950mm–4,300mm range pending that schedule, and should flag if a later filing's 10-K options/RSU note narrows it.

Only 12mm stock-based-award shares were anti-dilutive (excluded) in Q2 2026 — immaterial to the overall count.

## 3. Market Capitalization

`Market cap = share count × current price = 3,949,547,394 × $319.69 = $1,262,630.8mm (≈$1.263 trillion)`

This ties out exactly to Company Comparable Analysis Tesla Inc .xls, Financial Data tab, "Market Capitalization Latest" = $1,262,630.8mm [same source as price and share count above], confirming CIQ used the identical 3,949.5mm share count (not the stale Historical Capitalization figure).

## 4. Enterprise Value Bridge

| Component | Amount ($mm) | Source |
|---|---:|---|
| Market capitalization | 1,262,630.8 | Section 3 above |
| + Total debt (see breakdown below) | 16,080 | Tesla Inc NasdaqGS TSLA Financials_Annual.xls, Capital Structure Summary tab, "Total Debt Outstanding," period ended Jun-30-2026 |
| + Minority / non-controlling interest | 661 | Same source, "Total Minority Interest," Jun-30-2026 |
| + Preferred equity | 0 (none outstanding) | Same source ("Pref. Equity" = "-" every period shown); confirmed no preferred stock on the 10-Q balance sheet |
| + Operating lease liabilities | *(already included in Total Debt above — see breakdown)* | — |
| + Underfunded pension / other long-term obligations | Not applicable — no pension/OPEB disclosed | Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls, Pension/OPEB tab: "No Data Available" |
| − Cash & equivalents + ST investments (broad, canonical — see cash-quality test below) | (43,524) | Same Capital Structure Summary tab, "Total Cash & ST Investments," Jun-30-2026; also 10-Q, "we had $15.22 billion and $28.31 billion of cash and cash equivalents and short-term investments, respectively" |
| − Equity-method / strategic investments (NOT netted — see note) | — | See note below (SpaceX stake) |
| **= Enterprise value (EV)** | **1,235,847.8** | Ties exactly to Company Comparable Analysis Tesla Inc .xls, Financial Data tab, "Total Enterprise Value Latest" = 1,235,847.8 |

**Total debt breakdown (material disclosure — Total Debt is NOT "debt and finance leases" alone).** Tesla's own 10-Q balance sheet reports "Current portion of debt and finance leases" ($1,418mm) + "Debt and finance leases, net of current portion" ($7,924mm) = **$9,342mm** of debt and finance leases (the company's own filed line items). The CIQ $16,080mm "Total Debt" figure used above additionally folds in on-balance-sheet **operating lease liabilities** — "Operating lease liabilities, current portion" ($1,022mm) + "Operating lease liabilities" non-current ($5,716mm) = **$6,738mm** [Form 10-Q, Jul-23-2026, Condensed Consolidated Balance Sheet]. $9,342mm + $6,738mm = $16,080mm, reconciling exactly to the CIQ figure (also matching CIQ's own "Total Lease Liabilities" line of $7,019mm = $6,738mm operating + $281mm finance leases). **This report uses the $16,080mm figure (debt + finance leases + operating leases) as canonical**, for consistency with earnings/01_historical-financials.md's own net-debt figures (see Reconciliation Gate 1) — but the $9,342mm debt-and-finance-leases-only figure is the stricter filing-basis alternative and should be used instead if a downstream agent needs a leverage view that excludes capitalized operating leases. This is a disclosed, deliberate treatment, not a silent inflation.

**Cash quality check (before netting).** Of the $43,524mm "Cash & ST Investments" netted above: cash & equivalents ($15,219mm) consists of cash, CDs/time deposits, US government securities, commercial paper, and money-market funds — all disclosed by security type in the 10-Q's fair-value note, none of which are financial-subsidiary loan-book assets or long-tenor mark-to-market securities. Of the $28,305mm in short-term investments, $286mm (0.66% of the total, at Jun-30-2026) is disclosed as "held and restricted for our insurance business" [Form 10-Q, Jul-23-2026] — immaterial in size, so it is not carved out separately; EV is not shown "both ways" for this item because the restricted piece would move EV by <0.03%. Tesla's separate "Digital assets" line ($674mm, mostly Bitcoin) and its new $2.0 billion SpaceX equity stake (booked under "Long-term Investments," ~$3,007mm balance at Jun-30-2026, subject to sales restrictions until Dec-2026) are **NOT** part of "Cash & ST Investments" and are **NOT netted** into this EV bridge — they remain un-adjusted, non-operating assets sitting inside the equity side of the balance sheet. This is a disclosed adjustment NOT made; a downstream agent choosing to treat the SpaceX stake as a separately-valued non-operating asset should net it out of EV explicitly and cite this paragraph.

**Adjustments NOT made:** pensions/OPEB (none disclosed — not applicable, not merely omitted); the SpaceX equity-method-like investment and Bitcoin holding (named above, left inside the balance sheet rather than carved out of EV).

## 5. Net Debt & Leverage Snapshot

| Metric | Value ($mm) | Source |
|---|---:|---|
| Total debt (canonical, incl. finance + operating leases) | 16,080 | Capital Structure Summary tab, Jun-30-2026 |
| Total debt (filing-basis, debt + finance leases only, excl. operating leases) | 9,342 | Form 10-Q balance sheet, Jun-30-2026 |
| Cash & equivalents only | 15,219 | Form 10-Q balance sheet / Capital Structure Summary tab |
| Cash & ST investments (broad) | 43,524 | Same |
| **Net debt — strict basis** (Total debt canonical − cash & equiv. only) | **861** (net debt) | 16,080 − 15,219 = 861; matches earnings/01_historical-financials.md's own strict figure exactly |
| **Net debt — broad basis** (Total debt canonical − cash & ST investments) | **(27,444)** (net cash) | 16,080 − 43,524 = −27,444; matches CIQ's own "LTM Net Debt" field and earnings/01's broad figure |
| Net debt (strict) / LTM EBITDA | 0.08x | 861 / 10,755 (LTM EBITDA, GAAP-basis: Op. Income + D&A, per CIQ) [Company Comparable Analysis Tesla Inc .xls, Financial Data tab, "LTM EBITDA," period through Jun-30-2026] |
| Net debt (broad) / LTM EBITDA | (2.55x) (net cash position) | −27,444 / 10,755 |

Both bases are shown per CLAUDE.md §15 hygiene: the **strict** basis nets only cash & equivalents; the **broad** basis also nets short-term investments. Given the cash-quality check above (the ST-investment book is genuine, short-maturity, investment-grade paper with only a 0.66% restricted sliver), the broad basis is a reasonable reflection of true liquidity, but the strict basis is shown alongside per the hard rule and is the more conservative read — under the strict basis Tesla has flipped to a small net-debt position ($861mm) as of Jun-30-2026, a reversal from net cash in every prior year shown in the Historical Capitalization tab back to FY2021.

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | $21.99 | Total Common Equity $86,858mm ÷ 3,949mm basic shares (Jun-30-2026) [Capital Structure Summary tab / Form 10-Q balance sheet] — ties exactly to CIQ's own "LTM Tangible Book Value/Share" of $21.99 |
| Tangible book value per share | $21.99 (≈ book value per share) | Goodwill and other intangibles are effectively zero/not separately disclosed on Tesla's recent balance sheet, so tangible book value ≈ book value here [Financials_Quarterly.xls, Balance Sheet tab] |
| Net cash per share (broad basis) | $6.95 | $27,444mm net cash ÷ 3,949.5mm shares |
| Net debt per share (strict basis) | $0.22 (net debt) | $861mm net debt ÷ 3,949.5mm shares |

## 7. Anchor Summary (canonical numbers for downstream agents)

- **Current price: $319.69, as-of 2026-07-23 (last close), `pool-verified`.** Fresh (1 calendar day old); no staleness cap applies.
- **Share counts:** market-cap count = 3,949,547,394 (cover-page/balance-sheet, confirmed by three independent sources); per-share fair-value count = ≈4,252.5mm (approximate fully diluted, TSM-proxy, labeled inference — no options/RSU strike schedule was found in this pool).
- **Market cap: $1,262,630.8mm** (≈$1.263 trillion).
- **Enterprise value: $1,235,847.8mm** (broad cash basis, canonical) — or **$1,264,152.8mm** if only cash & equivalents (not short-term investments) are netted (strict basis).
- **Net debt: $861mm (strict basis, net debt) / −$27,444mm (broad basis, net cash)** — both at Jun-30-2026.
- **Reporting currency: USD.**
- **Key caveats:** (1) per-share fair-value share count is an approximation pending a full options/RSU outstanding-and-strike schedule; (2) CIQ's Historical Capitalization tab is stale for the latest quarter and must not be used for Jun-30-2026 share count; (3) Total Debt of $16,080mm includes $6,738mm of on-balance-sheet operating lease liabilities — the filing's own "debt and finance leases" line is $9,342mm; (4) the SpaceX equity stake (~$3,007mm) and Bitcoin holding ($674mm) are not netted into EV.

### Anchor Block (copy-forward)

- Price: $319.69 (2026-07-23, last close)
- Price-state: pool-verified
- Currency: USD
- Shares (market cap): 3,949,547,394 (Form 10-Q cover page, Jul-16-2026, cross-confirmed by balance sheet, Public Ownership Summary, and CIQ Financial Data tab)
- Shares (per-share fair value): ≈4,252.5mm (approximate fully diluted — basic O/S + 303mm TSM-proxy dilution addback; limitation: no options/RSU strike schedule found in pool — Inference, not from filings)
- Market cap: $1,262,630.8mm
- Net debt: $861mm (strict basis) / −$27,444mm (broad basis, net cash) — both at Jun-30-2026; canonical Total Debt of $16,080mm includes $6,738mm of operating lease liabilities (filing-only debt + finance leases = $9,342mm)
- EV: $1,235,847.8mm (broad cash basis, canonical) / $1,264,152.8mm (strict cash basis)
- Key caveats: approximate (not schedule-based) fully diluted share count; CIQ Historical Capitalization tab's Jun-30-2026 share count (3,755.7mm) is stale/wrong and was not used; Total Debt figure bundles operating lease liabilities — shown separately above; SpaceX stake and Bitcoin holding not netted into EV.
