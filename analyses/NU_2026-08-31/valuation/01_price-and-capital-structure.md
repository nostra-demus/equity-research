# Price & Capital Structure — NU

All dollar amounts are US$ millions unless stated otherwise. Nu reports under IFRS Accounting Standards in U.S. dollars and has a 31 December fiscal year. It is a financial institution, so this EV bridge is an informational reconciliation, not an intrinsic-value method; later valuation work should value equity directly (for example, using price-to-book and residual income). [FY2025 Form 20-F, cover page; Business Identity — NU, §3]

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| **Decision line** (ticker · venue · currency) | **NU · NYSE · USD** | [FY2025 Form 20-F, cover page] | 2026-08-29 |
| Current price | **US$14.30** | [Capital IQ Comps → Financial Data, subject row; `ciq_facts.json` `current_price`, authoritative workbook read] | 2026-08-29 |
| Currency | USD | [Capital IQ Comps → Financial Data, header] | 2026-08-29 |
| Price basis (last close / intraday / indicative) | Last close | [Capital IQ Comps → Financial Data, subject row] | 2026-08-29 |

The decision line is Class A ordinary shares on the NYSE. It is the registered primary line and the most liquid disclosed venue (76.82m three-month average daily shares versus 7.11m for the next-largest listed line). All downstream per-share values refer to this line in USD. Class B shares are not separately listed; they have otherwise identical economic rights, convert one-for-one to Class A, but have 20 votes per share versus one for Class A. [FY2025 Form 20-F, Item 10.B; Capital IQ Equity Listings, 2026-08-28]

Capital IQ's detailed listing export labels the NYSE close as 2026-08-28, while the comparable-analysis export is explicitly as of 2026-08-29 and reports the same US$14.30. I use the latter as the price date, as required by the deterministic sidecar. The age is two calendar days, about 1.4 trading days, and therefore below the five-trading-day refresh threshold. No refresh was needed. [Capital IQ Comps → Financial Data, as of 2026-08-29; Capital IQ Equity Listings, trade date 2026-08-28]

| Listed line | Ticker · venue | Currency | Price | As-of | Premium / (discount) vs decision line, same-currency | Notes for a holder of this line |
|---|---|---:|---:|---|---:|---|
| Class A ordinary share | NU · NYSE | USD | 14.30 | 2026-08-29 | 0.0% | **Decision line.** |
| BDR, 6 BDR = 1 ordinary share | ROXO34 · BOVESPA | BRL | 12.33 per BDR | 2026-08-28 | 0.0% mechanically | The price implies BRL 5.1734/US$ from `(12.33 × 6) ÷ 14.30`. This is a price-implied conversion, not an independently sourced FX quote, so it does not establish a tradable premium. |
| CEDEAR, 2 CEDEAR = 1 ordinary share | NU · Buenos Aires | ARS | 11,500 per CEDEAR | 2026-08-28 | 0.0% mechanically | The price implies ARS 1,608.39/US$ from `(11,500 × 2) ÷ 14.30`; it is a price-implied conversion only. |
| Class A ordinary share | NUCO · BVC | COP | 46,200 | 2026-08-28 | 0.0% mechanically | The price implies COP 3,230.77/US$ from `46,200 ÷ 14.30`; it is a price-implied conversion only. |
| CEDEAR, 2 CEDEAR = 1 ordinary share | NUD · Buenos Aires | USD | 7.51 per CEDEAR | 2026-08-28 | **+5.0%** | Two CEDEAR equal US$15.02 per ordinary share: `(7.51 × 2 ÷ 14.30) − 1 = 5.0%`. This USD gap is a real cross-line observation, though liquidity is far lower than NYSE. |
| Class A ordinary share | NU N · BMV | MXN | 243.68 | 2026-08-28 | 0.0% mechanically | The price implies MXN 17.0406/US$ from `243.68 ÷ 14.30`; it is a price-implied conversion only. |
| Class A ordinary share | 1NUH · Borsa Italiana | EUR | 12.45 | 2026-08-28 | 0.0% mechanically | The price implies EUR 0.8706/US$ from `12.45 ÷ 14.30`; it is a price-implied conversion only. |
| Class A ordinary share | M1Z · Deutsche Börse | EUR | 12.32 | 2026-08-28 | 0.0% mechanically | The price implies EUR 0.8615/US$ from `12.32 ÷ 14.30`; it is a price-implied conversion only. |
| Class A ordinary share | M1Z · Börse München | EUR | 12.79 | 2026-08-27 | Not independently assessable | This close is one extra day older than the other cross-lines. The implied EUR 0.8944/US$ mapping from `12.79 ÷ 14.30` is not a matched-date FX comparison. |

The non-USD comparisons use each line's stated ratio and the listed close. The frozen pool has no independent dated FX source for these lines, so the mechanically zero differences above must not be read as evidence of executable parity. The USD CEDEAR line is the exception: it is 5.0% above the NYSE decision line after the disclosed 2:1 ratio. [Capital IQ Equity Listings, 2026-08-28]

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | **4,790.029m** at 2026-06-30 | [H1 FY2026 reviewed interim financial statements, Note 31: 4,830.689m issued less 40.660m treasury shares] |
| Diluted weighted-average shares (period) | 4,908.841m | [H1 FY2026 reviewed interim financial statements, Note 9, six months ended 2026-06-30] |
| Options/RSUs count (if disclosed) | Not separately disclosed at period end; 49.133m incremental diluted shares in H1 EPS | [H1 FY2026 reviewed interim financial statements, Note 9] |
| Convertibles / potential shares (if disclosed) | No convertible debt disclosed; 3.045m business-acquisition incremental shares included in H1 diluted EPS; 26.050m anti-dilutive potential instruments excluded | [H1 FY2026 reviewed interim financial statements, Note 9; Note 24] |
| **Fully diluted shares (TSM + if-converted)** | **4,908.841m** — H1 weighted-average diluted count | [H1 FY2026 reviewed interim financial statements, Note 9] |
| Share count used for market cap | **4,790.029m** — latest issued shares less treasury shares | [H1 FY2026 reviewed interim financial statements, Note 31] |
| Share count used for per-share fair value | **4,908.841m** — diluted weighted average | [H1 FY2026 reviewed interim financial statements, Note 9] |

| Share-count reconciliation | Shares (m) | Source |
|---|---:|---|
| Issued Class A and Class B ordinary shares at 30 June 2026 | 4,830.689 | [H1 FY2026 reviewed interim financial statements, Note 31] |
| Less: Class A treasury shares | (40.660) | [H1 FY2026 reviewed interim financial statements, Note 31] |
| **Basic shares outstanding used for market cap** | **4,790.029** | Analyst calculation from the filing lines above |
| H1 basic weighted-average shares | 4,856.663 | [H1 FY2026 reviewed interim financial statements, Note 9] |
| Plus: share-based payment dilution | 49.133 | [H1 FY2026 reviewed interim financial statements, Note 9] |
| Plus: business-acquisition dilution | 3.045 | [H1 FY2026 reviewed interim financial statements, Note 9] |
| **H1 fully diluted weighted-average shares used for per-share values** | **4,908.841** | [H1 FY2026 reviewed interim financial statements, Note 9] |

The period-end fully diluted count cannot be independently calculated because the interim filing does not provide current option strikes and all relevant vesting or conversion terms. The disclosed diluted EPS count already applies the treasury-stock method (TSM) to instruments that are dilutive; it is therefore the least-assumptive per-share denominator. It is 2.5% above the period-end basic count, so per-share fair-value work must use 4,908.841m rather than the market-cap count. [H1 FY2026 reviewed interim financial statements, Note 9]

**Capital IQ reconciliation.** The deterministic sidecar reports 4,830.7m shares outstanding as of 2026-08-29, matching the workbook's 4,830.689m `Total Shares Out. on Balance Sheet Date` field. That field equals the filing's issued-share total but does not deduct the 40.660m treasury shares the filing says Nu holds. I therefore use the filing-based 4,790.029m external-share count for market cap. The basis difference is 40.660m shares (0.8%) or US$581.6m at US$14.30; it is not silently substituted. [Capital IQ Comps → Financial Data, as of 2026-08-29; `ciq_facts.json` `shares_outstanding_m`, authoritative workbook read; H1 FY2026 reviewed interim financial statements, Note 31]

## 3. Market Capitalization

`Market cap = 4,790.029m shares × US$14.30 = US$68,497.4m`

This is the filing-based, treasury-adjusted equity value on the NYSE decision line. Capital IQ's displayed US$69,078.8m market cap instead uses its 4,830.7m issued-share field; the US$581.4m difference is the treasury-share reconciliation above. [H1 FY2026 reviewed interim financial statements, Note 31; Capital IQ Comps → Financial Data, as of 2026-08-29]

## 4. Enterprise Value Bridge

| Component | Amount | Source |
|---|---:|---|
| Market capitalization | 68,497.4 | 4,790.029m × US$14.30; sources in §§1–3 |
| + Total debt: borrowings and financing | 4,682.3 | [H1 FY2026 reviewed interim financial statements, Note 24] |
| + Repurchase agreements, included as debt-like funding | 1,058.3 | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8] |
| **+ Total debt (canonical)** | **5,740.6** | Analyst calculation: 4,682.3 + 1,058.3 |
| + Minority / non-controlling interest | 2.1 | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8] |
| + Preferred equity | 0.0 — none disclosed | [H1 FY2026 reviewed interim financial statements, Note 31] |
| + Operating lease liabilities (optional adjustment) | 66.4 | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8] |
| + Underfunded pension / other long-term obligations | 0.0 — no separately disclosed underfunded pension item identified | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, pp.7–8] |
| − Cash & equivalents | (13,551.6) | [H1 FY2026 reviewed interim financial statements, Note 11] |
| − Equity-method investments | (93.0) | [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.7] |
| **= Enterprise value (EV), before optional lease adjustment** | **60,595.4** | `68,497.4 + 5,740.6 + 2.1 − 13,551.6 − 93.0` |
| **= EV, including optional lease adjustment** | **60,661.9** | Prior line + 66.4 |

The canonical debt build is US$4,682.3m of financial bills and margin-loan financing plus US$1,058.3m of repurchase agreements. It excludes customer deposits and card-network payables: for a deposit-taking financial group, they are core balance-sheet funding and operating liabilities rather than corporate debt for an EV valuation. It also excludes the US$66.4m lease liability from canonical debt and reports it separately as the optional EV adjustment. [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8; Note 24]

The cash deduction is accounting cash and equivalents, not unrestricted parent-company cash. Its build is US$7,741.9m central-bank deposits, US$3,096.4m overnight reverse repos, US$2,101.7m bank balances and US$611.6m short-term investments. I do not also deduct the US$9,149.1m compulsory and other central-bank deposits or the longer-dated securities portfolio; those are outside the filing's cash-and-equivalents note and may be regulatory or maturity-constrained. [H1 FY2026 reviewed interim financial statements, Note 11; Statement of Financial Position, p.7]

**Vendor reconciliation.** Capital IQ reports total debt of US$5,896.7m and net debt of US$(9,274.2)m for 30 June 2026; the sidecar confirms both as present. The total-debt gap to the US$5,740.6m canonical build is exactly the US$66.4m lease liability plus US$89.7m fair-value derivative liability: `5,740.6 + 66.4 + 89.7 = 5,896.7`. Neither is included in canonical debt; the lease is separately shown above and the derivative is not financing debt. The CIQ net-debt figure implies US$1,463.2m more net cash than this filing-based bridge and cannot be rebuilt from the filing's cash-equivalent definition; the sidecar itself warns that its vendor basis may net liquid investments. It is a cross-check, not the canonical input. [Capital IQ Financials → Balance Sheet, 30 June 2026; `ciq_facts.json` `total_debt_m` and `net_debt_m`, authoritative workbook reads; H1 FY2026 reviewed interim financial statements, Statement of Financial Position, pp.7–8]

`balance-sheet-survival/01_capital-structure-and-leverage.md` is not available in this run root. Accordingly, the filing-based build above is the canonical debt input for this report. The earnings module's narrower US$4,682.3m debt and US$8,869.4m strict net-cash arithmetic exclude the US$1,058.3m repo; that upstream report expressly deferred the repo-scope decision to the balance-sheet-survival module. This report includes the repo as debt-like secured funding and therefore carries US$7,811.0m strict net cash. [Historical Financials — NU, §2; H1 FY2026 reviewed interim financial statements, Note 24; Statement of Financial Position, p.8]

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | 5,740.6 | Filing-based build: Note 24 borrowings 4,682.3 + repurchase agreements 1,058.3 |
| Cash & equivalents | 13,551.6 | [H1 FY2026 reviewed interim financial statements, Note 11] |
| **Net debt (strict, §15: total debt − cash & equivalents)** | **(7,811.0) net cash** | `5,740.6 − 13,551.6`; strict basis |
| − Liquid short-term investments (if netted) | Not applicable — US$611.6m is already within filing cash & equivalents | [H1 FY2026 reviewed interim financial statements, Note 11] |
| **Net debt (broad, incl. investments — only if used)** | Not used | Longer-dated securities and compulsory central-bank deposits are not netted |
| Net debt / latest EBITDA (label GAAP or adjusted) | Not assessable | Nu does not report EBITDA; for this lender, funding cost and interest income are core operations rather than a meaningful EBITDA base. [Historical Financials — NU, §§1–2] |

The strict net-cash result is an accounting bridge, not a claim that US$7,811.0m is freely distributable or available for buybacks. It supports deposits and regulated lending operations. No leverage-to-EBITDA ratio is shown because a reported EBITDA measure is absent and would not be the appropriate balance-sheet-risk measure for this financial institution. [Business Identity — NU, §3; Historical Financials — NU, §§1–2]

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | US$2.70 | `US$13,249.7m parent equity ÷ 4,908.841m diluted shares`; [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.8; Note 9] |
| Tangible book value per share | US$2.46 | `(US$13,249.7m − US$409.4m goodwill − US$747.1m intangibles) ÷ 4,908.841m`; [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, p.7; Note 9] |
| Net cash per share | US$1.59 | `US$7,811.0m strict net cash ÷ 4,908.841m`; filing-based calculation in §5 |

Nu has never declared or paid a cash dividend, has no dividend policy, and says it does not expect to pay dividends in the foreseeable future. No dividend or distribution yield is therefore quoted in this run. [FY2025 Form 20-F, Item 8.A, “Dividend and Dividend Policy”]

## 7. Anchor Summary (canonical numbers for downstream agents)

Use the following figures verbatim. They are in USD and are tied to the NYSE Class A decision line. The company is a financial institution, so the EV and net-cash bridge are informational; later valuation should value equity directly.

- Current price: **US$14.30** (2026-08-29 last close; Capital IQ pool source)
- Share counts used: **4,790.029m** for market cap (30 June 2026 issued shares less treasury shares); **4,908.841m** for per-share fair value (H1 FY2026 diluted weighted average)
- Market cap: **US$68,497.4m**
- Enterprise value: **US$60,595.4m** before the optional US$66.4m lease adjustment; **US$60,661.9m** including it
- Net debt: **US$(7,811.0)m net cash, strict basis** — US$5,740.6m canonical debt less US$13,551.6m cash and equivalents
- Reporting currency: **USD; IFRS Accounting Standards**

The balance-sheet-survival leverage-anchor output is unavailable. The bridge therefore uses the filing-based US$5,740.6m debt definition. Capital IQ's US$5,896.7m total debt includes the US$66.4m lease and US$89.7m derivative liability; its US$(9,274.2)m net debt is a different vendor basis and is not substituted. [H1 FY2026 reviewed interim financial statements, Statement of Financial Position, pp.7–8; Capital IQ Financials → Balance Sheet, 30 June 2026; `ciq_facts.json`]

### Anchor Block (copy-forward)

- Decision line: **NU · NYSE · USD** — every downstream fair value, margin of safety, and yield is on this line.
- Other listed lines: ROXO34 · BOVESPA; NU / NUD · Buenos Aires; NUCO · BVC; NU N · BMV; 1NUH · Borsa Italiana; M1Z · Deutsche Börse / Börse München. The USD NUD CEDEAR was 5.0% above NYSE after its 2:1 ratio on 2026-08-28; non-USD premiums are not independently assessable from the frozen-pool FX evidence.
- Price: **US$14.30** (2026-08-29, last close)
- Price-state: **pool-verified** — the canonical tag `05`/`07`/`99` read.
- Currency: **USD**
- Distribution basis: **none quoted** — no declared cash dividend; no yield is available to a buyer today.
- Shares (market cap): **4,790.029m** (H1 FY2026 interim, Note 31 — issued shares less treasury shares)
- Shares (per-share fair value): **4,908.841m** (H1 FY2026 interim, Note 9 diluted weighted average; detailed point-in-time option terms unavailable)
- Market cap: **US$68,497.4m**
- Net debt: **US$(7,811.0)m net cash** (strict basis: Note 24 borrowings plus repo funding less Note 11 cash; balance-sheet-survival/01 unavailable)
- EV: **US$60,595.4m** before optional leases; US$60,661.9m including the US$66.4m lease liability
- Key caveats: Class A price is pool-verified and current, but Capital IQ's share count is issued rather than treasury-adjusted; cash is predominantly held in regulated financial subsidiaries; the EV bridge is informational for this financial institution.
