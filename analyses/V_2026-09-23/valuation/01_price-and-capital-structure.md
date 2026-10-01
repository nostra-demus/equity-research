# Price & Capital Structure — V

Visa Inc. is a U.S. GAAP issuer, reports in USD, and has a September fiscal year-end. Amounts below are USD millions unless stated otherwise. The decision line is Visa Class A common stock on the NYSE.

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---:|---|---|
| **Decision line** (ticker · venue · currency) | V · NYSE · USD | [Visa Q3 FY2026 Form 10-Q, cover; Capital IQ Comps → Financial Data] | 2026-08-17 price export |
| Current price | **$364.15** | [Capital IQ Comps → Financial Data, Visa subject row, `Day Close Price Latest`; `ciq_facts.json` `current_price`] | 2026-08-17 |
| Currency | USD | [Capital IQ Comps → Financial Data, 2026-08-17] | 2026-08-17 |
| Price basis | Day close | [Capital IQ Comps → Financial Data, 2026-08-17] | 2026-08-17 |

The NYSE Class A common share is the primary, liquid decision line. Single listed line — no cross-line issue. Visa also has Class B-1, B-2, B-3 and C common shares, but the admitted documents provide no separate exchange quotation for them; they are not a second tradable decision line. `[Visa Q3 FY2026 Form 10-Q, cover and Note 11 (Stockholders’ Equity)]`

| Listed line | Ticker · venue | Currency | Price | As-of | Premium / (discount) vs decision line, same-currency | Notes for a holder of this line |
|---|---|---|---:|---|---:|---|
| Other listed line | None identified in the admitted pool | — | — | — | — | Single listed decision line |

**Price freshness.** The pool quote is 37 calendar days old at the 2026-09-23 run date, or about 26 U.S. trading days (`37 × 5/7`). I searched the price-bearing pool exports; the latest dated pool quote remains the Capital IQ 2026-08-17 close, so no fresher pool or user quote was available. The pool price remains `pool-verified`, but it exceeds the 15-trading-day threshold: downstream valuation confidence is capped at 60 and any price-relative calculation must show the stale-anchor caveat. `[Capital IQ Comps → Financial Data, 2026-08-17; Valuation MODULE_RULES, Score Cap Rules]`

**Indicative price, web-sourced as of 2026-09-23, not from data pool — unverified:** Visa Investor Relations and StockAnalysis each report a $361.52 NYSE close for 2026-09-23, a 0.00% cross-source difference and $2.63 (0.72%) below the pool anchor. This is a refresh cross-check, not a replacement for the pool anchor. `[Web: Visa Investor Relations, NYSE quote, 2026-09-23 close (indicative, unverified); Web: StockAnalysis, Visa price history, 2026-09-23 close (indicative, unverified)]`

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | 1,784.429m actual common shares: 1,704.113m Class A + 2.180m B-1 + 0.487m B-2 + 60.590m B-3 + 17.059m C | [Visa Q3 FY2026 Form 10-Q, cover, as of 2026-07-21] |
| Diluted weighted-average shares (period) | 1,898m Class A-equivalent shares, three months ended 2026-06-30 | [Visa Q3 FY2026 Form 10-Q, Note 12 (Earnings per Share)] |
| Options / RSUs count (if disclosed) | 0.714m options; 2.629m RSUs; 0.381m maximum performance shares | [Visa Q3 FY2026 Form 10-Q, employee stock-plan disclosure] |
| Convertibles / potential shares (if disclosed) | No convertible debt reported. Preferred stock has separate conversion/recovery terms and remains a separate EV-bridge item. | [Visa Q3 FY2026 Form 10-Q, Notes 8 and 11] |
| **Fully diluted shares (TSM + if-converted)** | **1,898m** reported Q3 diluted weighted-average Class A equivalents | [Visa Q3 FY2026 Form 10-Q, Note 12 (Earnings per Share)] |
| Share count used for market cap | 1,835.606m point-in-time primary-Class-A-equivalent shares | [Capital IQ Comps → Financial Data, Visa subject row, `Shares Outstanding Latest`, 2026-08-17; `ciq_facts.json` `shares_outstanding_m`] |
| Share count used for per-share fair value | 1,898m | [Visa Q3 FY2026 Form 10-Q, Note 12 (Earnings per Share)] |

### Share Count Reconciliation

| Three months ended 2026-06-30 | Class A-equivalent shares (m) | Source |
|---|---:|---|
| Basic weighted-average Class A shares | 1,673 | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| + Class B-1 common stock, as converted | 5 | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| + Class B-2 common stock, as converted | 80 | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| + Class B-3 common stock, as converted | 51 | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| + Class C common stock, as converted | 71 | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| + Participating securities | 15 | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| + Employee-plan common equivalents / rounding | Not material; the filing does not give an exact line-item bridge | [Visa Q3 FY2026 Form 10-Q, Note 12] |
| **= Reported diluted weighted-average shares** | **1,898** | [Visa Q3 FY2026 Form 10-Q, Note 12] |

The market-cap count is a point-in-time vendor count; the 1,898m per-share count is the latest reported diluted weighted average. The 62.394m (3.4%) difference is material enough to keep the bases separate. The filing says employee-plan equivalents were not material to diluted EPS, so I use the reported diluted figure rather than inventing a separate treasury-stock-method calculation from gross awards.

## 3. Market Capitalization

`Market cap = share count × current price`

`$668,435.9m = 1,835.60599m × $364.15`

The calculation ties to Capital IQ's stated $668,435.9m market capitalization; the sidecar confirms the $364.15 price and 1,835.6m rounded share count. `[Capital IQ Comps → Financial Data, Visa subject row, 2026-08-17; `ciq_facts.json` `current_price` and `shares_outstanding_m`]`

For freshness context only, the corroborated $361.52 web close × the same 1,835.60599m shares equals about $663.608bn. It is not a canonical pool market cap. `[Web: Visa Investor Relations and StockAnalysis, 2026-09-23 close (indicative, unverified)]`

## 4. Enterprise Value Bridge

| Component | Amount | Source |
|---|---:|---|
| Market capitalization | $668,435.9 | [Capital IQ Comps → Financial Data, 2026-08-17; calculation above] |
| + Total debt (short + long term) | $23,858 | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 8 (Debt), pp. 4, 17–18] |
| + Minority / non-controlling interest | $0 — no separately reported NCI balance | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, p. 4] |
| + Preferred equity | $514 book value | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 11 (Stockholders’ Equity), pp. 4, 22–23] |
| + Operating lease liabilities (optional adjustment) | $0 added; $913 was the FY2025 recorded liability, not refreshed in Q3 | [Visa FY2025 Form 10-K, Note 9 (Leases), p. 82; Visa Q3 FY2026 Form 10-Q, Note 7] |
| + Underfunded pension / other long-term obligations | $0 added; FY2025 aggregate pension/OPEB position was a $624 funded surplus | [Visa FY2025 Form 10-K, Note 11 (Pension and Other Postretirement Benefits), pp. 85–86] |
| − Cash & equivalents | ($12,359) | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 4, pp. 4, 14] |
| − Equity-method investments | $0 — none separately disclosed for EV treatment | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, p. 4] |
| **= Enterprise value (EV)** | **$680,448.9** | **Calculation** |

The canonical EV uses debt from the filing-based balance-sheet-survival anchor and nets only cash and equivalents: `$668,435.9 + $23,858 + $514 − $12,359 = $680,448.9m`. Operating leases are not added because the latest quantified $913 is from FY2025 and is outside the canonical debt line; pension is not added because the disclosed position is a surplus. `[analyses/V_2026-09-23/balance-sheet-survival/01_capital-structure-and-leverage.md, Leverage Anchor Summary]`

Cash quality is material. The strict bridge nets $12,359m of cash and equivalents only. It excludes $6,409m of restricted cash, litigation escrow and customer collateral, and it does not net $150m of non-current investment securities. The $1,433m current investment-security balance is shown only in the broad bridge below. `[Visa Q3 FY2026 Form 10-Q, Note 4, p. 14; Note 6 (Debt Securities), p. 15]`

Capital IQ's $679,015.9m TEV is a cross-check, not the canonical EV: it uses the same $23,858m debt and $514m preferred equity but nets the additional $1,433m current investment securities. The $1,433m gap reconciles exactly to the broad cash basis. `[Capital IQ Comps → Financial Data, Visa subject row, 2026-08-17; `ciq_facts.json` `total_debt_m` and `net_debt_m`]`

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | $23,858 | [Visa Q3 FY2026 Form 10-Q, pp. 4, 17–18] |
| Cash & equivalents | $12,359 | [Visa Q3 FY2026 Form 10-Q, pp. 4, 14] |
| **Net debt (strict, §15: total debt − cash & equivalents)** | **$11,499 = $23,858 − $12,359** | [Visa Q3 FY2026 Form 10-Q, pp. 4, 14, 17–18; calculation] |
| − Liquid short-term investments (if netted) | ($1,433) current investment securities | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets and Note 6, pp. 4, 15] |
| **Net debt (broad, incl. investments — only if used)** | **$10,066 = $23,858 − $12,359 − $1,433** | [`ciq_facts.json` `net_debt_m`, Jun-30-2026 — CIQ vendor basis; reconciled to the Form 10-Q] |
| Net debt / latest EBITDA (GAAP-derived) | 0.41x strict = $11,499 / $28,338 | [Visa Q3 FY2026 Form 10-Q, pp. 4, 17–18; Visa FY2025 Form 10-K, pp. 60, 65; analyses/V_2026-09-23/earnings/01_historical-financials.md, TTM Snapshot; calculation] |

The strict $11,499m number is canonical. It agrees with the balance-sheet-survival report. The source-bound CIQ sidecar's present $10,066m net-debt fact is not a conflicting debt amount; it is the broad basis that adds $1,433m of current investment securities to cash. `[analyses/V_2026-09-23/balance-sheet-survival/01_capital-structure-and-leverage.md, Sections 4 and 7; `ciq_facts.json` `net_debt_m`]`

Visa does not report company-defined EBITDA. The $28,338m denominator is GAAP-derived EBITDA — reported operating income plus depreciation and amortization — for the LTM ended 2026-06-30. Capital IQ's $31,094m special-item-excluding vendor EBITDA gives 0.32x **broad** net debt / EBITDA, but it does not replace the GAAP-derived leverage measure. `[analyses/V_2026-09-23/earnings/01_historical-financials.md, TTM Snapshot; `ciq_facts.json` `ltm_ebitda_m` and `net_debt_ebitda_x`]`

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | $18.53 = $35,178m total equity / 1,898m diluted shares | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, p. 4; Note 12; calculation] |
| Tangible book value per share | ($6.94) = ($35,178m − $20,825m goodwill − $27,532m intangibles) / 1,898m | [Visa Q3 FY2026 Form 10-Q, Consolidated Balance Sheets, p. 4; calculation] |
| Net debt per share | $6.06 strict = $11,499m / 1,898m | [Visa Q3 FY2026 Form 10-Q, pp. 4, 14, 17–18; calculation] |

These values use total equity and the same 1,898m diluted share basis as downstream per-share fair-value work. They are balance-sheet reference values, not an estimate of intrinsic value. The $514m preferred-stock book value is included in total equity here and is also shown separately in the EV bridge, so downstream agents must keep their equity-bridge basis explicit.

## 6A. Distribution Basis

| Field | Value | Source |
|---|---|---|
| Yield basis | Trailing / annualized run-rate from the latest declared quarterly dividend; not forward-declared | [Visa Q3 FY2026 Form 10-Q, Note 11, pp. 22–23] |
| Amount per share and period it covers | $0.67 per Class A share quarterly; $2.68 annualized run-rate | [Visa Q3 FY2026 Form 10-Q, Note 11, pp. 22–23; calculation] |
| Ex-date and record date of the most recent distribution | Ex-date not stated in the admitted data; record date 2026-08-11; payable 2026-09-01 | [Visa Q3 FY2026 Form 10-Q, Note 11, pp. 22–23] |
| Is the next distribution still available to a buyer today? | N — the stated record date has passed | [Visa Q3 FY2026 Form 10-Q, Note 11, pp. 22–23] |
| Gross or net | Gross; decision line is U.S. Class A common stock, with no ADR fee. Holder-specific tax is not calculated. | [Visa Q3 FY2026 Form 10-Q, Note 11] |
| Yield on the **decision line** at the decision-line price | 0.74% gross trailing annualized = $2.68 / $364.15 | [Visa Q3 FY2026 Form 10-Q, Note 11; Capital IQ Comps → Financial Data, 2026-08-17; calculation] |

The stated $0.67 payment cannot be presented as income a buyer on 2026-09-23 can still receive, because its August 11 record date has passed.

## 7. Anchor Summary (canonical numbers for downstream agents)

- Current price: **$364.15** pool close, as of 2026-08-17; 26 trading days stale at the 2026-09-23 run date. The fresh web cross-check is $361.52 on 2026-09-23, indicative and unverified.
- Share counts used: **1,835.606m** for market cap; **1,898m** Q3 FY2026 diluted weighted-average Class A equivalents for per-share fair value.
- Market cap: **$668,435.9m** at the pool price.
- Enterprise value: **$680,448.9m**, using the strict cash basis.
- Net debt: **$11,499m strict**; broad, investment-inclusive cross-check **$10,066m**.
- Reporting currency: **USD**.

### Anchor Block (copy-forward)

- Decision line: **V · NYSE · USD** — every downstream fair value, margin of safety, and yield is on this line (Single listed line)
- Other listed lines: **None identified**
- Price: **$364.15** (2026-08-17, day close; pool-sourced and 26 trading days stale)
- Price-state: **pool-verified** — the canonical tag `05`/`07`/`99` read
- Currency: **USD**
- Distribution basis: **trailing / annualized run-rate** — $0.67 quarterly ($2.68 annualized); record date 2026-08-11, still available to a buyer today: **N**, gross
- Shares (market cap): **1,835.606m** [Capital IQ Comps → Financial Data, 2026-08-17]
- Shares (per-share fair value): **1,898m** [Visa Q3 FY2026 Form 10-Q, Note 12; diluted weighted-average limitation]
- Market cap: **$668,435.9m**
- Net debt: **$11,499m strict basis** [Visa Q3 FY2026 Form 10-Q, pp. 4, 14, 17–18]; agrees with `balance-sheet-survival/01`'s canonical figure. CIQ's **$10,066m broad basis** additionally nets $1,433m of current investment securities.
- EV: **$680,448.9m strict-cash basis**
- Key caveats: The verified pool anchor is 26 trading days stale, which imposes the valuation-confidence maximum of 60. A corroborated $361.52 web close is context only; it does not change the `pool-verified` tag or replace the canonical price.
