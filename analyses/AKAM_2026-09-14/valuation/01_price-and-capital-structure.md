# Price & Capital Structure — AKAM

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| **Decision line** (ticker · venue · currency) | **AKAM · Nasdaq Global Select Market · USD** | [Q2 FY2026 Form 10-Q, cover] | 2026-09-14 |
| Current price | **$106.79** | [CIQ Comps → Financial Data, “Day Close Price Latest” (subject row), data as of 2026-09-14; `ciq_facts.json`, `current_price`, present] | 2026-09-14 |
| Currency | USD | [CIQ Comps → Financial Data, “Day Close Price Latest” (subject row), data as of 2026-09-14] | 2026-09-14 |
| Price basis | Day close | [CIQ Comps → Financial Data, “Day Close Price Latest” (subject row), data as of 2026-09-14] | 2026-09-14 |

Akamai reports under U.S. GAAP in USD and has a 31 December fiscal year. The price and market-capitalization date is 14 September 2026, while the latest filed balance-sheet date is 30 June 2026; the EV bridge is therefore a current-market/last-filed-balance-sheet bridge, not a same-day balance-sheet snapshot. [Q2 FY2026 Form 10-Q, cover and Note 1; Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; CIQ Comps → Financial Data, data as of 2026-09-14]

AKAM common stock on Nasdaq is the decision line: it is the primary listed common stock disclosed in the Q2 filing. Single listed line — no cross-line issue. [Q2 FY2026 Form 10-Q, cover]

| Listed line | Ticker · venue | Currency | Price | As-of | Premium / (discount) vs decision line, same-currency | Notes for a holder of this line |
|---|---|---:|---:|---|---:|---|
| Decision line only | AKAM · Nasdaq Global Select Market | USD | $106.79 | 2026-09-14 | 0.0% | Single listed line — no cross-line issue. |

The quote is zero trading days old on the run date. No refresh was required or attempted. It is pool-sourced and dated; it is not a web-indicative quote.

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | 143.7166m | [Q2 FY2026 Form 10-Q, cover — 143,716,609 common shares outstanding at 2026-08-03; CIQ Comps → Financial Data, “Shares Outstanding Latest,” 143.7m as of 2026-09-14; `ciq_facts.json`, `shares_outstanding_m`, present] |
| Diluted weighted-average shares (period) | 153.686m | [Q2 FY2026 Form 10-Q, Note 13 (Net Income per Share), p.24 — Q2 FY2026] |
| Options/RSUs count (if disclosed) | 3.673m incremental shares in Q2 diluted EPS, using the treasury-stock method; the current award population and average strike were not disclosed in the Q2 filing | [Q2 FY2026 Form 10-Q, Note 13, p.24] |
| Convertibles / potential shares (if disclosed) | 5.353m incremental shares in Q2 diluted EPS, using the if-converted method; warrants contributed 0.0m in the quarter | [Q2 FY2026 Form 10-Q, Note 13, p.24] |
| **Fully diluted shares (TSM + if-converted)** | **153.686m — latest disclosed Q2 diluted weighted-average, not a point-in-time count** | [Q2 FY2026 Form 10-Q, Note 13, p.24: 144.660m basic weighted average + 3.673m stock awards + 5.353m convertibles = 153.686m] |
| Share count used for market cap | **143.700m** | [CIQ Comps → Financial Data, “Shares Outstanding Latest,” data as of 2026-09-14; `ciq_facts.json`, `shares_outstanding_m`, present] |
| Share count used for per-share fair value | **153.686m** | [Q2 FY2026 Form 10-Q, Note 13, p.24] |

The market-cap count is the current outstanding-share count, as required for capitalization. The per-share working count is the latest disclosed diluted weighted-average count. A current fully diluted count cannot be rebuilt exactly because the Q2 filing provides the treasury-stock-method and if-converted *incremental result*, not a same-date award population, weighted-average exercise prices, and conversion treatment as of 14 September. The 153.686m count is consequently a disclosed period-average limitation, not an assertion that that number was outstanding on 14 September. It includes 9.026m Q2 incremental diluted shares: 3.673m stock awards plus 5.353m convertibles. [Q2 FY2026 Form 10-Q, Note 13, p.24]

The Q2 filing also excluded 58.480m potential shares from Q2 diluted EPS, including 56.320m warrants, because they were anti-dilutive or performance conditions were not met. These are not added to the fair-value denominator without evidence that they are dilutive. [Q2 FY2026 Form 10-Q, Note 13, p.24]

## 3. Market Capitalization

`Market cap = 143.700m shares × $106.79 = $15,345.7m`

The calculation uses the same CIQ current-share and current-price reads pinned by the facts sidecar. [CIQ Comps → Financial Data, “Shares Outstanding Latest” and “Day Close Price Latest,” data as of 2026-09-14; `ciq_facts.json`, `shares_outstanding_m` and `current_price`, present]

## 4. Enterprise Value Bridge

| Component | Amount | Source |
|---|---:|---|
| Market capitalization | $15,345.7m | $106.79 × 143.700m; [CIQ Comps → Financial Data, data as of 2026-09-14; `ciq_facts.json`, `current_price` and `shares_outstanding_m`, present] |
| + Total debt | $7,562.8m carrying value | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Note 7 (Debt), pp.17–20] |
| + Minority / non-controlling interest | $0.0m — no separate non-controlling-interest balance disclosed | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4] |
| + Preferred equity | $0.0m — no preferred shares issued or outstanding | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.4] |
| + Operating lease liabilities (optional adjustment) | Not in canonical EV; $1,776.2m if treated as debt-like | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4] |
| + Underfunded pension / other long-term obligations | Not added — defined-benefit/OPEB underfunding not proven from available data | [FY2025 Form 10-K, Note 17 (Employee Benefit Plans)] |
| − Cash & equivalents | $(1,480.3)m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3] |
| − Equity-method investments | $0.0m — none separately disclosed | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3] |
| **= Enterprise value (EV)** | **$21,428.3m** | $15,345.7m + $7,562.8m − $1,480.3m |

The canonical EV excludes operating-lease liabilities so it stays on the filing debt-note basis used by the balance-sheet-survival module. A lease-adjusted EV is $23,204.5m = $21,428.3m + $1,776.2m, shown only as a sensitivity. No pension adjustment is made because a defined-benefit or OPEB deficit is not proven, and no separately identified equity-method investment is deducted. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; FY2025 Form 10-K, Note 17]

**Canonical debt source.** The balance-sheet-survival Leverage Anchor Summary supplies the filing-based $7,562.8m gross debt and $6,082.6m strict net debt used here. It is $1,705.6m current convertible notes plus $5,857.3m non-current convertible notes; the related contractual principal is $7,640.0m. The current classification of the $1,705.6m 2033 notes reflects conversion rights during Q3 FY2026, not a stated FY2026 contractual maturity. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Note 7 (Debt), pp.17–20; balance-sheet-survival/01_capital-structure-and-leverage.md, Leverage Anchor Summary]

**CIQ reconciliation.** The facts sidecar reports CIQ vendor total debt of $9,339.0m and net debt of $4,722.7m, both present reads. The $1,776.2m gap to filing-based gross debt is operating-lease liabilities. CIQ’s net-debt figure additionally nets $4,616.3m of cash plus all marketable securities, rather than only cash equivalents. It is therefore a lease-inclusive, investment-inclusive broad figure, not strict net debt, and is not used in the canonical bridge. [CIQ Financials → Balance Sheet, period-end 2026-06-30; `ciq_facts.json`, `total_debt_m` and `net_debt_m`, present; Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4]

**Cash quality.** The canonical bridge nets only $1,480.3m of cash and equivalents. It excludes $1.5m restricted cash, $1,875.1m of current marketable securities, and $1,260.9m of non-current marketable securities. The filing reports the marketable securities separately; its investment note says the securities use Level 1 or Level 2 inputs, but $1,231.6m of the non-current available-for-sale securities are contractually due after one through five years. They may support a labelled broad liquidity sensitivity, not an unlabelled cash offset in EV. [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3; Statements of Cash Flows, p.8; Note 2 (Investments and Fair Value Measurements), pp.13–15]

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | $7,562.8m carrying value | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Note 7, pp.17–20] |
| Cash & equivalents | $(1,480.3)m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3] |
| **Net debt (strict, §15: total debt − cash & equivalents)** | **$6,082.6m = $7,562.8m − $1,480.3m** | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; balance-sheet-survival/01_capital-structure-and-leverage.md, Leverage Anchor Summary] |
| − Liquid short-term marketable securities (broad basis only) | $(1,875.1)m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3] |
| Net debt (broad, cash plus current marketable securities) | $4,207.4m | $7,562.8m − $1,480.3m − $1,875.1m; [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3] |
| − Non-current marketable securities (broad basis only) | $(1,260.9)m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3; Note 2, pp.13–15] |
| Net debt (broad, cash plus all marketable securities) | $2,946.5m | $7,562.8m − $1,480.3m − $1,875.1m − $1,260.9m; [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, p.3] |
| Net debt / latest EBITDA | **5.14x strict-basis / LTM GAAP-derived EBITDA** = $6,082.6m / $1,184.1m | [FY2025 Form 10-K, Consolidated Statements of Income, pp.54–56; Q2 FY2026 Form 10-Q, Statements of Income, p.5; Q2 2026 Supplemental Financial Information, Supplemental Metrics sheet; balance-sheet-survival/01_capital-structure-and-leverage.md, Leverage Anchor Summary] |

The $1,184.1m denominator is GAAP-derived EBITDA — income from operations plus depreciation and amortization — and not company-defined adjusted EBITDA. The pool does not provide a matching LTM company-defined adjusted-EBITDA series, so an adjusted-EBITDA leverage ratio is not assessable. [balance-sheet-survival/01_capital-structure-and-leverage.md, Leverage Anchor Summary]

CIQ instead reports $1,079.9m LTM EBITDA and 4.37x net debt/EBITDA, both present reads in the facts sidecar. That is not a contradiction in arithmetic: it combines CIQ’s $4,722.7m lease-inclusive, investment-inclusive net debt with CIQ’s different EBITDA definition. It must not replace the 5.14x strict-basis, GAAP-derived figure. [CIQ Financials → Income Statement and Balance Sheet, LTM/period-end 2026-06-30; `ciq_facts.json`, `ltm_ebitda_m` and `net_debt_ebitda_x`, present]

## 6. Per-Share Reference Values

The closest matched-basis references divide the 30 June point-in-time balance sheet by 143.591m shares outstanding at 30 June. The diluted working references divide the same point-in-time balance by the Q2 period-average diluted count of 153.686m; they are useful for fair-value work but are explicitly a mixed point-in-time/period-average basis.

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share — matched June 30 basic point-in-time basis | $33.07 = $4,748.5m / 143.591m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4] |
| Book value per share — diluted working reference, mixed basis | $30.90 = $4,748.5m / 153.686m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Note 13, p.24] |
| Tangible book value per share — matched June 30 basic point-in-time basis | $6.83 = ($4,748.5m − $3,202.9m goodwill − $564.3m acquired intangibles) / 143.591m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4] |
| Tangible book value per share — diluted working reference, mixed basis | $6.39 = ($4,748.5m − $3,202.9m − $564.3m) / 153.686m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Note 13, p.24] |
| Net debt per share — strict, matched June 30 basic point-in-time basis | $42.36 = $6,082.6m / 143.591m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4] |
| Net debt per share — strict, diluted working reference, mixed basis | $39.58 = $6,082.6m / 153.686m | [Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; Note 13, p.24] |

## 7. Anchor Summary (canonical numbers for downstream agents)

The downstream capitalization anchor is: $106.79 price at 14 September 2026; 143.700m current shares for market capitalization; 153.686m latest disclosed diluted weighted-average shares for per-share fair values; $15,345.7m market capitalization; $6,082.6m strict net debt; and $21,428.3m canonical EV. The $7,562.8m debt and $6,082.6m strict net debt are the balance-sheet-survival module’s filing-based canonical figures. The CIQ vendor values of $9,339.0m total debt and $4,722.7m net debt are reconciled, not substituted: they include operating leases and net all marketable securities. [CIQ Comps → Financial Data, data as of 2026-09-14; `ciq_facts.json`, `current_price` and `shares_outstanding_m`, present; Q2 FY2026 Form 10-Q, Condensed Consolidated Balance Sheets, pp.3–4; balance-sheet-survival/01_capital-structure-and-leverage.md, Leverage Anchor Summary]

### Anchor Block (copy-forward)

- Decision line: **AKAM · Nasdaq Global Select Market · USD** — every downstream fair value, margin of safety, and yield is on this line. Single listed line.
- Other listed lines: **None**.
- Price: **$106.79** (2026-09-14, day close; [CIQ Comps → Financial Data, data as of 2026-09-14; `ciq_facts.json`, `current_price`, present]).
- Price-state: **pool-verified** — the canonical tag `05`/`07`/`99` read.
- Currency: **USD**.
- Distribution basis: **none quoted**.
- Shares (market cap): **143.700m** ([CIQ Comps → Financial Data, data as of 2026-09-14; `ciq_facts.json`, `shares_outstanding_m`, present]).
- Shares (per-share fair value): **153.686m** ([Q2 FY2026 Form 10-Q, Note 13, p.24] — latest diluted weighted-average; exact current fully diluted count not computable from disclosed award-strike and conversion terms).
- Market cap: **$15,345.7m** ($106.79 × 143.700m).
- Net debt: **$6,082.6m, strict basis** = $7,562.8m gross debt − $1,480.3m cash and equivalents ([Q2 FY2026 Form 10-Q, pp.3–4]; agrees with balance-sheet-survival/01’s canonical filing-based figure).
- EV: **$21,428.3m** = $15,345.7m + $7,562.8m − $1,480.3m; operating leases excluded from canonical EV. Lease-adjusted sensitivity: $23,204.5m.
- Key caveats: market price is 2026-09-14 but balance-sheet inputs are 2026-06-30; per-share fair-value count is a Q2 diluted weighted average, not an exact 2026-09-14 fully diluted share count; CIQ’s debt and net-debt fields use a different lease- and investment-inclusive vendor basis.
