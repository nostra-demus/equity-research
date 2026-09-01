# Sum-of-the-Parts — NU

## 1. Segment Inventory

Nu reports under IFRS Accounting Standards in U.S. dollars and has a 31 December year-end. All amounts are US$ millions unless stated otherwise. The `% of Total EBIT` denominator would normally be reportable-segment EBIT. Nu does not disclose segment EBIT or EBITDA, so that percentage is not calculable; its sole reportable segment represents 100% of disclosed consolidated profit instead.

| Segment | Revenue | EBIT (or EBITDA) | Margin | % of Total EBIT | Source |
|---|---:|---:|---:|---:|---|
| Nu Group — Banking (sole reportable segment) | 15,774.7 | N/A — no segment EBIT/EBITDA; FY2025 IFRS net income was 2,868.9 | N/A — no segment EBIT/EBITDA disclosed | N/A — 100% of disclosed consolidated profit | [FY2025 Form 20-F, Consolidated Statements of Income, F-7; Note 34, F-97] |

**Effectively single-segment — SOTP collapses to the consolidated read.** The CEO reviews and allocates capital for the whole Group as one reportable banking segment. A bank should be valued directly on equity earnings or book value, rather than by applying an EV multiple and then adding back operating cash. The geographic table is not a substitute: it reports revenue but no country profit, and it uses a US$12,083.8m product-scope subtotal rather than the US$15,774.7m IFRS total revenue. [FY2025 Form 20-F, Note 34 (Segment information), F-97; Note 34(b), F-98; Valuation Module Rules, Business-Type Method Map]

The Capital IQ sidecar's present `segments_revenue` fact is US$6,991.185m for `Banking` (100%), from the FY2025 segment workbook. That is the authoritative vendor read, not the audited IFRS revenue line. It reconciles exactly to a bank-template subtotal: US$15,774.741m total revenue less US$4,578.680m interest and other financial expenses less US$4,204.876m expected credit loss = US$6,991.185m. I use the audited US$15,774.7m revenue above because it is the filing's stated total-revenue line; there is no conflict once the definitions are matched. [Capital IQ Financials → Segments, FY2025 annual column; `ciq_facts.json` `segments_revenue`, authoritative workbook read; FY2025 Form 20-F, Consolidated Statements of Income, F-7]

No unallocated or corporate segment is disclosed. The sole segment is the consolidated Group, so any corporate costs are already inside consolidated earnings; no cost bucket can be capitalized or removed without double counting. [FY2025 Form 20-F, Note 34, F-97] The tier-5 relationship graph also identifies Nu Pagamentos, Nu BN México and Nu Colombia as Group entities, not external businesses to value separately; its view is limited to recently disclosed counterparties. [Capital IQ Suppliers/Customers relationship graph, scope notes and entity affiliation, frozen export]

## 2. Segment Multiples & Comparables

The only useful collapsed-SOTP check is equity-direct: forward P/E, not EV/EBITDA or EV/EBIT. The metric is Capital IQ's NTM GAAP EPS of US$0.970 per share; its matching NTM P/E uses the same forward basis. The vendor displays the estimate on a basic-dilution convention, so the result below is a sanity check rather than a stand-alone fair-value input. [Capital IQ Company Comparable Analysis, Financial Data / Trading Multiples, data as of 2026-08-29; Capital IQ Estimates → Multiples, current export]

| Segment | Metric Used | Multiple Applied | Named Comparable | Comparable's Multiple | Source |
|---|---|---:|---|---:|---|
| Nu Group — Banking (collapsed check) | NTM GAAP EPS: US$0.970/share (vendor, basic-dilution convention) | 7.61x NTM P/E | Banco Santander (Brasil) S.A. | 7.61x NTM P/E | [Capital IQ Company Comparable Analysis, Financial Data / Trading Multiples, data as of 2026-08-29] |

Santander Brasil is a named Nu competitor with Brazilian retail lending, cards, deposits, payments, investments and insurance, so its capital intensity, funding and credit-risk economics are a closer match than a generic fintech or software peer. [FY2025 Form 20-F, Item 3.D, “Substantial and increasingly intense competition”] It is not a full valuation answer: Nu's 44.33% LTM vendor-basis revenue growth was far above Santander Brasil's 8.47%, so applying Santander's multiple mechanically is deliberately a conservative cross-check, not evidence that Nu warrants identical valuation. [Capital IQ Company Comparable Analysis, Operating Statistics, data as of 2026-08-29]

For multiple-driven dispersion only, the other named Brazilian bank checks are Banco Bradesco at 6.08x NTM P/E (US$5.90/share) and Itaú at 8.16x (US$7.92/share); Santander gives US$7.38/share. Those figures are not a forward SOTP range feeding `07`; all are the same single-bank P/E lens. [Capital IQ Company Comparable Analysis, Trading Multiples / Financial Data, data as of 2026-08-29]

## 3. Segment Valuation

The normal SOTP output would be segment enterprise values. That is not valid for a deposit-taking financial group: the P/E check produces an equity value directly. The arithmetic is `US$0.970 NTM EPS × 7.61x × 4,908.841m diluted shares = US$36,235.6m`; the vendor EPS is rounded, so the equity-value arithmetic is illustrative to the shown precision. [Capital IQ Company Comparable Analysis, Financial Data / Trading Multiples, data as of 2026-08-29; H1 FY2026 reviewed interim financial statements, Note 9]

| Segment | Metric Value | Multiple | Segment EV |
|---|---:|---:|---:|
| Nu Group — Banking | US$0.970 NTM GAAP EPS/share | 7.61x NTM P/E | N/A — financial equity method; US$36,235.6m direct-equity sanity value |
| **Gross enterprise value (sum)** |  |  | **N/A — an EV SOTP is not valid for this financial issuer** |

## 4. Equity Bridge

The equity-only check does **not** use an EV bridge. In particular, the US$(7,811.0)m strict net-cash figure is not added: it supports regulated lending and funding operations and is already part of the financial group's equity economics. Adding it after applying P/E would double count. [H1 FY2026 reviewed interim financial statements, Note 11 and Note 24; Price & Capital Structure — NU, §§4–5]

| Step | Value |
|---|---:|
| Gross enterprise value | N/A — financial issuer valued directly on equity |
| − Capitalized unallocated corporate costs | N/A — sole segment's consolidated EPS already includes all Group costs; no unallocated bucket disclosed |
| − Net debt | N/A — not applied; US$(7,811.0)m strict net cash is operating/regulatory financial-group cash, not surplus cash to add |
| − Minority / preferred | N/A — P/E uses the parent-share EPS; no separate deduction in this equity method |
| + Equity-method investments | N/A — not separately added in this equity method |
| − Conglomerate / holdco discount (if any) | US$0 — no separate holding-company or multi-business structure disclosed |
| **= Equity value** | **US$36,235.6m — single-bank P/E sanity check, not a formal SOTP bridge** |
| ÷ Diluted shares | 4,908.841m [H1 FY2026 reviewed interim financial statements, Note 9] |
| **= SOTP value per share** | **US$7.38 — collapsed-P/E sanity check only** |
| vs current price | US$14.30 at 2026-08-29; check is US$6.92 lower, or (48.4%) versus price [Capital IQ Comps → Financial Data, 2026-08-29; `ciq_facts.json` `current_price`, authoritative workbook read] |

No conglomerate or holding-company discount is warranted because there is no separately disclosed holding-company asset or second reportable business. This is not a conclusion that the share price should equal US$7.38: a one-segment P/E check cannot substitute for the peer and residual-income valuation work needed for a financial institution.

## 5. SOTP Read

There is no hidden segment value: Banking is the entire disclosed business, so a breakup adds no information beyond consolidated equity valuation. The only direct check is US$7.38 per share using Santander Brasil's 7.61x NTM P/E, with US$5.90–US$7.92 across the three named Brazilian-bank multiples, versus NU's US$14.30 price. [Capital IQ Company Comparable Analysis, Trading Multiples / Financial Data, data as of 2026-08-29]

The segment that carries the value is therefore the whole Banking Group. It is not being masked by a consolidated multiple; the relevant question is whether Nu's materially higher growth and return profile warrants its 14.76x NTM P/E rather than the 6.08x–8.16x direct-bank comparison range. This collapsed check is not a weighted fair-value method for `07`.
