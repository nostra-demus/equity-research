# Price & Capital Structure — GOOGL

Alphabet reports under U.S. GAAP and in USD. Amounts below are USD millions unless stated otherwise. This is an operating company; the enterprise-value (EV) bridge is therefore a valuation input, not a valuation conclusion.

## 1. Current Price

| Field | Value | Source | As-of Date |
|---|---|---|---|
| **Decision line** (ticker · venue · currency) | **GOOGL · Nasdaq Global Select Market · USD** | [Q3 FY2026 Form 10-Q, cover] | 2026-11-03 |
| Current price | **$278.99** | [Capital IQ Comps → Financial Data, subject row; deterministic `ciq_facts.json` `current_price` read] | 2026-11-03 |
| Currency | USD | [Capital IQ Comps → Financial Data, subject row] | 2026-11-03 |
| Price basis | Vendor “Day Close Price Latest”; the price-chart export also shows $278.99 for its latest 2026-11-02 close | [Capital IQ Comps → Financial Data, subject row; Price Charting → Pane 1] | 2026-11-03 / 2026-11-02 |

The decision line is GOOGL, the Class A common stock named in this run. It is the ticker supplied for the analysis and has a pool-verified USD quote. The deterministic sidecar's authoritative read of the Comps workbook is $278.99 and 12,294 million shares outstanding; the independently extracted price chart corroborates the prior trading day's $278.99 close. [Capital IQ Comps → Financial Data, subject row; deterministic `ciq_facts.json` `current_price` and `shares_outstanding_m`; Price Charting → Pane 1]

The quote's stated as-of date is the run date, so its age is 0 trading days. No refresh is required and no price-staleness cap applies. `Price-state: pool-verified`.

| Listed line | Ticker · venue | Currency | Price | As-of | Premium / (discount) vs decision line, same-currency | Notes for a holder of this line |
|---|---|---:|---:|---|---:|---|
| Class C capital stock | GOOG · Nasdaq Global Select Market | USD | $278.04 | 2026-11-03 | (0.34%) | The common-stock economic rights are the same as Class A except voting rights; the price is $0.95 below GOOGL. [Capital IQ Comps → Financial Data, subject row; Q3 FY2026 Form 10-Q, Note 12 (Net Income per Common Share)] |
| Series A mandatory-convertible preferred depositary share | GOOGM · Nasdaq Global Select Market | USD | Not available in pool | Not available | Not comparable | Each depositary share is 1/20 of a Series A 6.25% mandatory-convertible preferred share; it is not one Class A common share. [Q3 FY2026 Form 10-Q, cover; Note 11 (Stockholders' Equity)] |
| Series B mandatory-convertible preferred depositary share | GOOGN · Nasdaq Global Select Market | USD | Not available in pool | Not available | Not comparable | Each depositary share is 1/20 of a Series B 6.25% mandatory-convertible preferred share; it is not one Class C common share. [Q3 FY2026 Form 10-Q, cover; Note 11 (Stockholders' Equity)] |

Class B common stock is included in Alphabet's issued-share count but is not a separately quoted decision line in the reviewed pool. It has 827 million shares outstanding as of 21 October 2026. [Q3 FY2026 Form 10-Q, cover]

## 2. Share Count

| Field | Value | Source |
|---|---:|---|
| Basic shares outstanding (as-of) | **12,294m** — 5,888m Class A + 827m Class B + 5,579m Class C | [Q3 FY2026 Form 10-Q, cover, 2026-10-21; deterministic `ciq_facts.json` `shares_outstanding_m`, source ref: CIQ Comps → Financial Data] |
| Diluted weighted-average shares (period) | **12,368m** for Q3 FY2026 | [Q3 FY2026 Form 10-Q, Note 12 (Net Income per Common Share)] |
| Options/RSUs count (if disclosed) | **112m incremental shares** from RSUs and other contingently issuable shares under the treasury-stock method in Q3 FY2026; this is dilution used in EPS, not the count of unvested awards | [Q3 FY2026 Form 10-Q, Note 12 (Net Income per Common Share)] |
| Convertibles / potential shares (if disclosed) | **0 incremental shares** in Q3 diluted EPS from preferred conversion. The 19m mandatory-convertible preferred shares could convert into roughly 43.0m–53.8m common shares in May 2029, before any benefit from capped-call transactions. | [Q3 FY2026 Form 10-Q, Notes 11 and 12] |
| **Fully diluted shares (TSM + if-converted)** | **12,368m** | 12,256m Q3 weighted-average basic shares + 112m RSU/contingent-share dilution + 0 preferred-conversion dilution. [Q3 FY2026 Form 10-Q, Note 12] |
| Share count used for market cap | **12,294m current issued common shares**, priced by class | [Q3 FY2026 Form 10-Q, cover; Capital IQ Comps → Financial Data, 2026-11-03] |
| Share count used for per-share fair value | **12,368m fully diluted weighted-average shares** | [Q3 FY2026 Form 10-Q, Note 12] |

### Share Count Reconciliation

| Q3 FY2026 weighted-average common shares | Shares (m) | Treatment |
|---|---:|---|
| Basic common shares | 12,256 | Consolidated Class A, B and C weighted average. |
| + RSUs and other contingently issuable shares | 112 | Treasury-stock method. |
| + Mandatory-convertible preferred shares | 0 | If-converted effect was anti-dilutive in the Q3 EPS calculation. |
| **= Fully diluted shares used for per-share fair value** | **12,368** | The count downstream valuation work should use. |

The current issued count is 74m below the Q3 diluted weighted average because the two measures have different dates and bases; it is not an unexplained arithmetic difference. The mandatory preferred stock remains a separate preferred-equity claim in the EV bridge rather than being both deducted as preferred and added as common shares. Its final conversion ratio is share-price dependent, and the filing says capped calls are intended to reduce dilution. [Q3 FY2026 Form 10-Q, cover; Note 11; Note 12]

## 3. Market Capitalization

`Market cap = sum of each common class's issued shares × its own quoted price`

`= (5,888m × $278.99) + (827m × $278.99) + (5,579m × $278.04)`

`= $1,642,693m + $230,725m + $1,551,185m = $3,424,603m`

The class-by-class calculation is required because Class C (GOOG) closed $0.95 below Class A (GOOGL). Applying the GOOGL price to every 12,294m share would give $3,429,903m, $5,300m too high. This report therefore uses **$3,424,603m**. [Q3 FY2026 Form 10-Q, cover; Capital IQ Comps → Financial Data, subject row, 2026-11-03]

## 4. Enterprise Value Bridge

| Component | Amount | Source |
|---|---:|---|
| Market capitalization | 3,424,603 | Section 3 class-by-class calculation. [Q3 FY2026 Form 10-Q, cover; Capital IQ Comps → Financial Data, 2026-11-03] |
| + Total debt (short + long term) | 129,823 | **Canonical filing-based total:** $125,102m long-term debt + $1,016m current portion + $3,705m finance-lease liabilities. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Notes 4 and 6; `balance-sheet-survival/01_capital-structure-and-leverage.md`, Leverage Anchor Summary] |
| + Minority / non-controlling interest | 6,900 | Total NCI in consolidated subsidiaries; $825m is redeemable NCI. The filing reports NCI/RNCI within common stock and APIC, so it is separated here before valuing the common line. [Q3 FY2026 Form 10-Q, Note 7 (Noncontrolling Interests)] |
| + Preferred equity | 18,023 | Carrying value of the 19m mandatory-convertible preferred shares; liquidation preference is $19,000m. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 11] |
| + Operating lease liabilities (optional adjustment) | — canonical; 20,508 lease-inclusive sensitivity | Operating leases are excluded from canonical debt. The optional lease-inclusive EV is shown below. [Q3 FY2026 Form 10-Q, Note 4 (Leases)] |
| + Underfunded pension / other long-term obligations | Not separately quantified | No separate defined-benefit underfunding amount was identified in the latest filing; no adjustment made. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| − Cash & equivalents | (56,334) | Cash only; no separately reported restricted-cash amount. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| − Equity-method investments | — | Not separately quantified from non-marketable securities; no deduction made. [Q3 FY2026 Form 10-Q, Note 3 (Debt and Equity Securities)] |
| **= Enterprise value (EV)** | **3,523,015** | $3,424,603 + $129,823 + $6,900 + $18,023 − $56,334. |

The canonical EV is **$3,523,015m**. Adding the $20,508m operating-lease liability produces a clearly labelled lease-inclusive EV of **$3,543,523m**; it is not the canonical bridge.

Cash quality matters here. The canonical bridge nets only $56,334m of cash and equivalents. It does not net the $208,764m marketable-securities portfolio, which includes money-market funds, deposits, government and corporate debt securities, asset-backed securities and marketable equity securities. There is no separately disclosed restricted-cash balance, but the pool does not establish that every marketable security is an immediate operating-cash equivalent. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 3; `balance-sheet-survival/01_capital-structure-and-leverage.md`, §3]

The deterministic CIQ read is $150,331m total debt and $114,767m net cash on its vendor basis. The $20,508m difference from filing-based gross debt is the operating-lease liability CIQ includes; its net-debt field also nets $265,098m of cash plus marketable securities. The canonical bridge does not silently substitute either vendor convention. [CIQ Financials → Balance Sheet, Q3 ended 2026-09-30; deterministic `ciq_facts.json` `total_debt_m` and `net_debt_m`; Q3 FY2026 Form 10-Q, Notes 3, 4 and 6]

## 5. Net Debt & Leverage Snapshot

| Metric | Value | Source |
|---|---:|---|
| Total debt (canonical — §4 above) | 129,823 | Filing debt plus finance leases; operating leases excluded. [Q3 FY2026 Form 10-Q, Notes 4 and 6; `balance-sheet-survival/01_capital-structure-and-leverage.md`, Leverage Anchor Summary] |
| Cash & equivalents | (56,334) | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets] |
| **Net debt (strict, §15: total debt − cash & equivalents)** | **73,489** | **$129,823 − $56,334. Canonical downstream basis.** |
| − Marketable securities (if netted) | (208,764) | [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 3] |
| **Net debt (broad, incl. investments — only if used)** | **(135,275) net cash** | $129,823 − $56,334 − $208,764. Broad basis only; not canonical. |
| Net debt / latest EBITDA | **0.40x** | $73,489 ÷ $185,516m LTM EBITDA. EBITDA is Capital IQ's calculated, GAAP-derived measure, not management-reported adjusted EBITDA. [CIQ Financials → Income Statement, LTM ended 2026-09-30; deterministic `ciq_facts.json` `ltm_ebitda_m`] |

The strict $73,489m figure agrees with this run's balance-sheet-survival Leverage Anchor Summary. It differs from the earnings module's $69,784m strict figure only because that earlier build excludes $3,705m of finance-lease liabilities; the canonical valuation bridge includes those leases under the balance-sheet module definition. [Q3 FY2026 Form 10-Q, Notes 4 and 6; `balance-sheet-survival/01_capital-structure-and-leverage.md`, §§4 and 7; `earnings/01_historical-financials.md`, §2]

## 6. Per-Share Reference Values

| Metric | Per Share | Source |
|---|---:|---|
| Book value per share | **$52.77** | ($659,526m reported common equity − $6,900m NCI) ÷ 12,368m fully diluted shares. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Note 7; Note 12] |
| Tangible book value per share | **$47.36** | ($652,626m common equity attributable to Alphabet holders − $58,117m goodwill − $8,817m net intangibles) ÷ 12,368m. [Q3 FY2026 Form 10-Q, Consolidated Balance Sheets; Notes 7, 9 and 12] |
| Net debt per share | **$5.94 net debt, strict basis** | $73,489m ÷ 12,368m. [Q3 FY2026 Form 10-Q, Notes 4 and 6; Note 12] |

For context only, broad-basis net cash is $10.94 per diluted share ($135,275m ÷ 12,368m); it is not labelled or used as strict net cash.

## 7. Anchor Summary (canonical numbers for downstream agents)

- Current price: **$278.99** on **2026-11-03**, vendor Day Close Price Latest; pool-verified. [Capital IQ Comps → Financial Data, subject row; deterministic `ciq_facts.json` `current_price`]
- Market-cap shares: **12,294m** current issued common shares, priced by class; per-share fair-value shares: **12,368m** Q3 fully diluted weighted-average shares. [Q3 FY2026 Form 10-Q, cover; Note 12]
- Market capitalization: **$3,424,603m**.
- Enterprise value: **$3,523,015m** canonical; **$3,543,523m** including operating-lease liabilities.
- Net debt: **$73,489m, strict basis** — $129,823m filing debt plus finance leases less $56,334m cash and equivalents. This is the filing-based figure from `balance-sheet-survival/01`; it is used instead of CIQ's broad, lease-inclusive $114,767m net-cash field.
- Reporting currency: **USD**.

### Anchor Block (copy-forward)

- Decision line: **GOOGL · Nasdaq Global Select Market · USD** — every downstream fair value, margin of safety, and yield is on this line.
- Other listed lines: **GOOG · Nasdaq Global Select Market · (0.34%) vs GOOGL on 2026-11-03**; **GOOGM / GOOGN · Nasdaq Global Select Market · preferred depositary shares, not price-comparable; pool prices unavailable**.
- Price: **$278.99** (2026-11-03, vendor Day Close Price Latest; pool-verified).
- Price-state: **pool-verified** — the canonical tag `05`/`07`/`99` read.
- Currency: **USD**.
- Distribution basis: **none quoted**.
- Shares (market cap): **12,294m** (Q3 FY2026 Form 10-Q cover; deterministic CIQ sidecar confirms the Comps-workbook read).
- Shares (per-share fair value): **12,368m** (Q3 FY2026 Form 10-Q, Note 12; 112m treasury-stock-method RSU/contingent-share dilution, preferred conversion 0 in Q3 diluted EPS).
- Market cap: **$3,424,603m** (Class A + Class B + Class C class-specific-price build).
- Net debt: **$73,489m** (strict basis; Q3 FY2026 Form 10-Q Notes 4 and 6; agrees with `balance-sheet-survival/01` canonical figure; CIQ's $114,767m is broad net cash on a lease-inclusive, investment-netted basis).
- EV: **$3,523,015m** (canonical; operating leases excluded; $3,543,523m lease-inclusive sensitivity).
- Key caveats: **$18,023m mandatory-convertible preferred equity stays in the EV bridge because its Q3 if-converted EPS effect was zero; final 2029 common-share conversion is price dependent. Marketable securities are not netted in strict net debt.**
