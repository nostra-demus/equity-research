# Historical Financials — TSLA

**Jurisdiction / regime:** United States, Nasdaq Global Select Market, US SEC filer (10-K/10-Q/8-K regime). **Reporting standard:** US GAAP. **Reporting currency:** US Dollar (USD), figures in millions unless stated as per-share. **Fiscal year end:** December 31. [Form 10-Q, Jul-23-2026, cover page; Financials_Annual.xls, Income Statement tab]

**Source note (hard constraint from triage):** The standalone audited FY2025 10-K (Item 8 financial statements) is NOT in this pool — only its Part III-only amendment (10-K/A, Apr-30-2026) and the company's own unaudited shareholder "Update" letters. All FY2025 and quarterly annual-letter figures below are cited to the specific unaudited Update letter (labelled "(Unaudited)" by the company itself) or to the Capital IQ (CIQ) vendor export — never mislabeled as "10-K." [Earnings Data Triage, §5]

**Reconciliation flag:** For Q1, Q3, and Q4 2025, the CIQ Financials_Quarterly.xls "Operating Income" figures (e.g., Q3 2025 = $1,862M, Q4 2025 = $1,171M) do not match the company's own reported "Income from operations" in three separate shareholder Update letters, all of which consistently show Q3 2025 = $1,624M and Q4 2025 = $1,409M [Annual_Report_TSLA-Q4-2025.pdf, p.4; TSLA-Q1-2026-Update.pdf, p.4; TSLA-Q2-2026-Update.pdf, p.3 — all three agree]. Per the earnings-module source hierarchy (interim filing/company primary disclosure ranks above a CIQ export), this report uses the company-reported figures for all quarterly operating-income, revenue, gross-profit and EPS data points and flags this gap rather than silently overriding it. Revenue, gross profit, and full-year totals reconcile exactly between CIQ and the company letters; only these two quarters' operating income lines diverge.

---

## 1. Annual Financial Table (3–5 years)

Currency: USD millions except per-share and margin/ratio rows. Fiscal year ended Dec-31. Figures sourced from Capital IQ Financials_Annual.xls (Income Statement / Balance Sheet / Cash Flow tabs) [5], cross-checked line-by-line against the company's own FY2021–FY2025 "Financial Summary" table in the FY2025 Update letter [1] — revenue, gross profit, operating income, CFO, capex and FCF match exactly between the two sources for every year shown.

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 53,823 | 81,462 | 96,773 | 97,690 | 94,827 | Inflecting |
| Revenue YoY % | +70.7%¹ | +51.4% | +18.8% | +0.9% | −2.9% | Inflecting |
| Gross Profit | 13,606 | 20,853 | 17,660 | 17,450 | 17,094 | Inflecting |
| Gross Margin % | 25.3% | 25.6% | 18.3% | 17.9% | 18.0% | Inflecting |
| EBITDA (GAAP, Op. Income + D&A) | 9,434 | 17,235 | 13,558 | 13,027 | 10,503 | Decelerating |
| EBITDA Margin % | 17.5% | 21.2% | 14.0% | 13.3% | 11.1% | Decelerating |
| EBIT (Operating Income) | 6,523 | 13,692 | 8,891 | 7,659 | 4,355 | Decelerating |
| EBIT Margin % | 12.1% | 16.8% | 9.2% | 7.8% | 4.6% | Decelerating |
| EPS (diluted, GAAP) | 1.63 | 3.62 | 4.30 | 2.04 | 1.08 | Decelerating |
| CFO | 11,497 | 14,724 | 13,256 | 14,923 | 14,747 | Stable |
| Capex (abs.) | 6,514 | 7,163 | 8,899 | 11,342 | 8,527 | Volatile |
| FCF (CFO − Capex) | 4,983 | 7,561 | 4,357 | 3,581 | 6,220 | Volatile |
| Working Capital (Curr. Assets − Curr. Liabs.) | 7,395 | 14,208 | 20,868 | 29,539 | 36,928 | Stable |
| Net Debt (strict: Total Debt − Cash & Equiv.) | (8,703) | (10,505) | (6,825) | (2,516) | (1,794) | Inflecting |
| Net Debt / EBITDA (strict) | (0.92x) | (0.61x) | (0.50x) | (0.19x) | (0.17x) | Inflecting |

¹ FY2021 YoY uses FY2020 revenue of $31,536M as the base [Financials_Annual.xls, Income Statement tab] [5].

**Basis labels (CLAUDE.md §15):** Net Debt above is the **strict** basis (Total Debt − Cash & Equivalents only, excluding short-term investments). On the **broad** basis (netting in short-term investments, which CIQ's own "Net Debt" field uses), net debt is far more negative (more net cash): FY2021 (8,834), FY2022 (16,437), FY2023 (19,521), FY2024 (22,940), FY2025 (29,340) [Financials_Annual.xls, Balance Sheet tab, "Net Debt" row] [5]. The gap between the two bases has widened every year because Tesla has shifted a growing share of its liquid balance sheet into short-term investments (from $131M in FY2021 to $27,546M in FY2025) while cash & equivalents alone has stayed roughly flat (~$16–17.6B). Both bases are shown so the direction is not misread — see §6.

**Total Debt** used above (includes finance/operating lease obligations per CIQ's definition): FY2021 $8,873M; FY2022 $5,748M; FY2023 $9,573M; FY2024 $13,623M; FY2025 $14,719M [Financials_Annual.xls, Balance Sheet tab] [5].

**FCF definition (stated per CLAUDE.md §15 / module Calculation Standard #6):** FCF = CFO − total capex (absolute value). This matches the company's own disclosed "Free cash flow" definition — "Free cash flow = operating cash flow less capital expenditures" [TSLA-Q2-2026-Update.pdf, p.24 non-GAAP definitions] [4] — so no adjustment to the company's own figure is needed; the FY2021–FY2025 figures above tie out exactly to the company's own reported Free Cash Flow line [Annual_Report_TSLA-Q4-2025.pdf, p.4] [1].

**Capex definitional note:** Beginning Q1 2025, the company redefined capex to include purchases of energy generation and storage systems, and restated all prior periods on this new basis [TSLA-Q1-2026-Update.pdf, p.4, footnote 4; TSLA-Q2-2026-Update.pdf, p.3, footnote (1)] [3][4]. The FY2024 and FY2025 capex and FCF figures above are on this restated (post-Q1'25) basis, sourced from the FY2025 Update letter's annual table [1], which is internally consistent — this is a company-level accounting-presentation change, not a quarter-to-quarter mixing of definitions.

---

## 2. TTM Snapshot

TTM = latest four reported quarters (Q3 2025 + Q4 2025 + Q1 2026 + Q2 2026, i.e. period ended Jun-30-2026). Prior TTM = Q3 2024 + Q4 2024 + Q1 2025 + Q2 2025.

| Metric | Latest TTM | Prior TTM | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 103,619 | 92,720 | +11.8% | Sum of quarterly revenue from company Update letters [1][2][3][4]; ties out exactly to CIQ's own LTM Jun-30-2026 column (103,619) [Financials_Annual.xls, Income Statement tab, "LTM 12 months Jun-30-2026"] [5] |
| EBITDA (GAAP, Op. Income + D&A) | 10,849 | 11,346 | −4.4% | Company-reported quarterly operating income [1][2][3][4] + CIQ quarterly D&A [Financials_Quarterly.xls, Cash Flow tab] [6]. CIQ's own LTM EBITDA field shows 10,755 — a ~1% gap explained by the Q3/Q4 2025 operating-income reconciliation flag noted above |
| EBIT (Operating Income) | 4,372 | 5,622 | −22.2% | Company Update letters, "Income from operations" row [1][2][3][4] |
| EPS diluted (GAAP) | 1.08 | 1.67 | −35.3% | Sum of quarterly GAAP diluted EPS from company Update letters [1][2][3][4]; ties out exactly to CIQ's own LTM diluted EPS of 1.08 [Financials_Annual.xls, Income Statement tab] [5] |
| CFO | 18,685 | 15,765 | +18.5% | Sum of quarterly CFO from company Update letters [1][2][3][4]; ties out exactly to CIQ's LTM CFO of 18,685 [Financials_Annual.xls, Cash Flow tab] [5] |
| Capex (abs.) | 12,923 | 10,179 | +27.0% | Sum of quarterly capex from company Update letters [1][2][3][4]; ties out exactly to CIQ's LTM capex of 12,923 [5] |
| FCF | 5,762 | 5,586 | +3.2% | TTM CFO − TTM Capex above; also ties out to the sum of the company's own quarterly "Free cash flow" line: 3,990 + 1,420 + 1,444 + (1,092) = 5,762 [TSLA-Q2-2026-Update.pdf, p.3] [4] |
| Net debt at latest period-end (Jun-30-2026) | Strict: $861M (net debt); Broad (incl. ST investments): $(27,444)M (net cash) | — | Point-in-time balance-sheet figure, not a flow. Total Debt $16,080M − Cash & Equivalents $15,219M = $861M net debt (strict). Netting in $28,305M of short-term investments gives $(27,444)M net cash (broad) [Financials_Quarterly.xls, Balance Sheet tab, Jun-30-2026 column] [6]; also disclosed by the company as "Cash, cash equivalents and short-term investments" of $43,524M against total debt [TSLA-Q2-2026-Update.pdf, p.3] [4] |

Note: Net debt is a point-in-time balance-sheet metric, not a TTM flow metric, per module convention.

---

## 3. Latest Quarterly Trend Table (8 quarters)

Figures sourced from the company's own shareholder "Update" letters (each an unaudited GAAP financial summary functioning as the earnings-release equivalent) [2][3][4], with GAAP EBITDA calculated as Operating Income + D&A (D&A from CIQ's Financials_Quarterly.xls Cash Flow tab [6]). All figures GAAP unless noted; Adjusted EBITDA (non-GAAP) is shown separately in Section 4.

| Metric | Q3'24 | Q4'24 | Q1'25 | Q2'25 | Q3'25 | Q4'25 | Q1'26 | Q2'26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 25,182 | 25,707 | 19,335 | 22,496 | 28,095 | 24,901 | 22,387 | 28,236 | Volatile (seasonal; Q2'26 QoQ +26.1%) | +25.5% (Q2'26 vs Q2'25) |
| Gross Margin % | 19.8% | 16.3% | 16.3% | 17.2% | 18.0% | 20.1% | 21.1% | 16.8% | Volatile | −41 bps (Q2'26 vs Q2'25)² |
| EBITDA (GAAP, calc.) | 4,065 | 3,079 | 1,846 | 2,356 | 3,249 | 3,052 | 2,531 | 2,017 | Decelerating (down from Q3'24 peak) | −14.4% (Q2'26 vs Q2'25) |
| EBITDA Margin % | 16.1% | 12.0% | 9.6% | 10.5% | 11.6% | 12.3% | 11.3% | 7.1% | Decelerating | −333 bps (Q2'26 vs Q2'25) |
| EPS (diluted, GAAP) | 0.62 | 0.60³ | 0.12 | 0.33 | 0.39 | 0.24 | 0.13 | 0.32 | Volatile | −3.0% (Q2'26 vs Q2'25) |

² Company-stated figure, "Total GAAP gross margin ... −41 bp" [TSLA-Q2-2026-Update.pdf, p.3] [4].
³ Q4'24 EPS is the recast figure per the FY2025 Update letter after adoption of the new crypto-assets accounting standard (ASU 2023-08); the originally reported Q4'24 figure was $0.66 [Annual_Report_TSLA-Q4-2024.pdf, p.4, vs Annual_Report_TSLA-Q4-2025.pdf, p.4, footnote 1] [2][1]. This recast also moved Q4'24 GAAP net income from $2,317M (as originally reported) to $2,128M and non-GAAP net income from $2,566M to $2,107M — revenue, gross profit and operating income for that quarter are unaffected by the recast (both letters show operating income $1,583M).

---

## 4. Reported vs Adjusted Metrics

Basis: FY2025 (full year). The company discloses "Adjusted EBITDA (non-GAAP)" and "Net income attributable to common stockholders (non-GAAP)" / non-GAAP diluted EPS; it does not disclose a separate adjusted EBIT.

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA | 10,503 (GAAP: Op. Income + D&A) | 14,596 (Adjusted EBITDA, non-GAAP) | +4,093 | Company definition: net income before interest, taxes, D&A, stock-based compensation expense ($2,825M FY2025 SBC [Financials_Annual.xls, Income Statement tab, "Stock-Based Comp., Total"] [5]), digital-assets unrealized gain/loss, and SpaceX equity-investment unrealized gain | [Annual_Report_TSLA-Q4-2025.pdf, p.4, "Adjusted EBITDA" + footnote definitions p.24] [1] |
| EBIT | 4,355 (GAAP Operating Income) | Not disclosed | N/A | Company does not disclose a separate adjusted EBIT metric — only Adjusted EBITDA and non-GAAP net income/EPS | [Annual_Report_TSLA-Q4-2025.pdf, p.4] [1] |
| EPS (diluted) | 1.08 (GAAP) | 1.66 (non-GAAP) | +0.58 | Same non-GAAP exclusions as Adjusted EBITDA (SBC, digital-assets gain/loss, SpaceX equity gain, certain tax items), net of tax, per share | [Annual_Report_TSLA-Q4-2025.pdf, p.4] [1] |

Net income (GAAP) FY2025 $3,794M vs non-GAAP $5,858M — same reconciling items [1].

---

## 5. Quarterly Seasonality Table (last 3 fiscal years)

Revenue share = quarterly revenue ÷ that fiscal year's total revenue. EBITDA margin is the GAAP-basis figure (Op. Income + D&A ÷ revenue), computed from company-reported operating income [1][2][3] and CIQ D&A [6] for consistency across all three years.

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 EBITDA Margin | FY2024 EBITDA Margin | FY2025 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 24.1% | 21.8% | 20.4% | 22.1% | 15.9% | 11.4% | 9.6% |
| Q2 | 25.8% | 26.1% | 23.7% | 25.2% | 14.3% | 11.3% | 10.5% |
| Q3 | 24.1% | 25.8% | 29.6% | 26.5% | 12.8% | 16.1% | 11.6% |
| Q4 | 26.0% | 26.3% | 26.3% | 26.2% | 13.1% | 12.0% | 12.3% |

No quarter breaches the >30% / <20% flag threshold on a 3-year-average basis. Two things worth flagging for downstream (02_revenue-drivers) rather than explained here, since driver attribution is out of this agent's scope:
- **Q1 is consistently the seasonal low** and its revenue share has fallen each year (24.1% → 21.8% → 20.4%), now within 0.4 points of the 20% flag line.
- **Q3 2025's 29.6% share is a clear outlier** against Q3 2023 (24.1%) and Q3 2024 (25.8%), followed by a revenue pullback in Q4 2025 and Q1 2026 (see Section 3). No cause for this deviation was found in the pool's earnings-call transcripts (searched for tax-credit / pull-forward language; none present) — **not proven from available data**; flagged for 02_revenue-drivers to investigate.

[Sources: Annual_Report_TSLA-Q4-2024.pdf p.4 (FY2023, FY2024 Q3/Q4 quarterly detail) [2]; Annual_Report_TSLA-Q4-2025.pdf p.4 (FY2025 quarterly detail, FY2021–2025 annual table) [1]; TSLA-Q1-2026-Update.pdf p.4 [3]; Financials_Quarterly.xls Income Statement / Cash Flow tabs (D&A, and FY2023 quarters not covered by a company letter in this pool) [6]]

---

## 6. Key Trend Summary

Revenue growth has decelerated every year since the 51% jump in FY2022, turned negative in FY2025 (−2.9%, to $94,827M) [1][5] — a clear inflection from growth to decline — though the most recent quarter (Q2 2026, $28,236M) posted +25.5% YoY growth, helped by a 50% YoY jump in services-and-other revenue and continued growth in energy storage [TSLA-Q2-2026-Update.pdf, p.3] [4]; whether this is a genuine re-acceleration or a seasonal/one-quarter bounce is not resolved by this agent and is flagged for 02_revenue-drivers. Margins are compressing on every profitability line: gross margin stepped down sharply from ~25.6% (FY2022) to ~18% (FY2023–FY2025, a ~735 bps one-time drop rather than a gradual slide) [5], while EBIT margin has fallen every year since its FY2022 peak of 16.8% to 4.6% in FY2025 (−1,222 bps over three years) [1][5]. Seasonality is real and consistent: Q1 is the weakest quarter every year shown (20–24% of annual revenue) and its share has been shrinking further each year, while Q3 2025's 29.6% share was an outlier versus the prior two years' Q3 pattern, followed by a pullback in Q4 2025 and Q1 2026 — the cause is not proven from available data (Section 5). The clearest balance-sheet inflection: on the strict net-debt basis (total debt less cash & equivalents only), Tesla's net-cash cushion has shrunk every year from $8.7B (FY2021) to $1.8B (FY2025) and flipped to a small $861M of net debt by Jun-30-2026 [5][6] — even though the broad basis (netting in $28.3B of short-term investments) still shows roughly $27.4B of net cash, because Tesla has parked a growing share of its liquidity in short-term investments rather than cash & equivalents. The other visible inflection is capex and free cash flow: quarterly capex jumped to $5,789M in Q2 2026 (+142% QoQ, on the company's own post-Q1'25 capex definition that includes energy-storage-system purchases), which pushed quarterly free cash flow negative (−$1,092M) for the first time in the eight quarters shown [TSLA-Q2-2026-Update.pdf, p.3] [4] — a capex ramp whose driver and durability are also flagged for the downstream revenue/margin-driver agents rather than assessed here.

---

## 7. Citations

[1] Tesla Q4 2025 & FY2025 Update letter (Unaudited shareholder update; company's own GAAP financial summary, functioning as the earnings-release equivalent) — `Annual_Report_TSLA-Q4-2025.pdf`, "Financial Summary" p.4 (quarterly Q4'24–Q4'25 table and annual FY2021–FY2025 table, non-GAAP definitions p.24)
[2] Tesla Q4 2024 & FY2024 Update letter (Unaudited) — `Annual_Report_TSLA-Q4-2024.pdf`, "Financial Summary" p.4 (quarterly Q4'23–Q4'24 table, pre-crypto-standard-recast figures)
[3] Tesla Q1 2026 Update letter (Unaudited) — `TSLA-Q1-2026-Update.pdf`, "Financial Summary" p.4 (quarterly Q1'25–Q1'26 table)
[4] Tesla Q2 2026 Update letter (Unaudited) — `TSLA-Q2-2026-Update.pdf`, "Financial Summary" p.3 (quarterly Q2'25–Q2'26 table) and p.24 (non-GAAP definitions: Adjusted EBITDA, non-GAAP net income, free cash flow)
[5] Capital IQ export, Tesla Inc NasdaqGS TSLA Financials_Annual.xls — Income Statement, Balance Sheet, and Cash Flow tabs (annual FY2017–FY2025 plus LTM Jun-30-2026 column; data as of 2026-07-24 extraction)
[6] Capital IQ export, Tesla Inc NasdaqGS TSLA Financials_Quarterly.xls — Income Statement, Balance Sheet, and Cash Flow tabs (quarterly Q1 2017–Q2 2026; data as of 2026-07-24 extraction)
[7] Form 10-Q, Jul-23-2026, Item 1 (Financial Statements, quarter ended Jun-30-2026) — used to confirm the quarter is the latest filed period; line items cross-checked against the CIQ quarterly export and the Q2 2026 Update letter
