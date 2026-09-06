# Segment Map — NU

**Company:** Nu Holdings Ltd. (NYSE: NU, Class A ordinary shares). Cayman Islands incorporation, operations run from São Paulo. Reporting standard **IFRS as issued by the IASB**; reporting currency **US dollars, presented in thousands**; fiscal year ends **31 December**. Filing regime: **US SEC foreign private issuer** — the annual filing is Form 20-F, not a 10-K. `[FY25 Form 20-F (filed 8 Apr 2026), cover page]`

All figures below are in **US$ thousands** unless marked "million" or "billion".

---

## 1. Segment Table

### 1a. Reportable segments as the company actually defines them (IFRS 8)

Nu reports **one** operating and reportable segment. This is not an omission by the engine — it is the company's stated position: *"The CODM considers the whole Group as a single operating and reportable segment… The CODM reviews relevant financial data on a combined basis for all subsidiaries."* The CODM (Chief Operating Decision Maker — the person whose reviews define what a segment is under IFRS 8) is the CEO, and what he reviews is the consolidated income statement. `[FY25 Form 20-F, Note 34 (Segment information), p.F-97]` The same wording appears verbatim in the latest interim statements. `[Q2 FY26 Interim Report (14 Aug 2026), Note 34 — three and six months ended 30 Jun 2026, p.43]`

| Segment | What It Does | Revenue Share | Profit Share | Margin Quality | Capital Intensity | Cyclicality | Main Risk |
|---|---|---:|---:|---|---|---|---|
| Banking (whole Group) | Digital retail bank and lender in Latin America: credit cards, unsecured and secured personal loans, deposit accounts, payments, investments, insurance broking, SME accounts | 100% | 100% | **High**, but on a three-year record only — FY2025 net income US$2,871.7m on Note-34 revenue of US$12,083,766, a 23.8% net margin (profit left after every cost, including credit losses and tax); FY2023 and FY2024 also positive, FY2022 was a net loss of US$364.6m | **High on regulatory capital, Low on physical assets.** The Brazil prudential conglomerate carried US$5,597,604 of regulatory capital against US$35,710,139 of risk-weighted assets (RWA — assets scaled by how risky the regulator judges them) at 30 Jun 2026, a 15.7% capital adequacy ratio. Property, plant, right-of-use and intangibles across the whole group were only US$1,060,834 at 31 Dec 2025 | **High.** FY2025 expected credit loss (the charge for loans management expects to go bad) was US$4,204.9m — 34.8% of Note-34 revenue — and up 32.7% year on year from US$3,169.0m | Credit losses in an unsecured consumer book concentrated in one country. Coverage was 244% of 90-plus-day non-performing loans at Q2'26, but 90-plus delinquency rose 35 basis points in the quarter |

Sources for the row: net income and ECL `[FY25 Form 20-F, Item 5 (Operating and Financial Review)]`; Note-34 revenue `[FY25 Form 20-F, Note 34(b), p.F-97]`; FY2022 net loss `[Capital IQ Financials → Income Statement export (NU), data to FY2025 — vendor export]`; Brazil regulatory capital and RWA `[Q2 FY26 Interim Report (14 Aug 2026), Note 33(a) — prudential conglomerate table, p.42]`; non-current assets `[FY25 Form 20-F, Note 34(b), p.F-97]`; coverage and delinquency `[Q2 FY26 earnings call transcript, 13 Aug 2026, prepared remarks]`.

**Reconciliation to the vendor sidecar.** `ciq_facts.json` reports `segments_revenue` as "Banking 6,991 (100%) of Total 6,991" for the 12 months to 31 Dec 2025. The 100% share matches my read exactly. The **level** does not, and the difference is definitional, not a disagreement about facts: Capital IQ's "Total Revenue" of US$6,991.2m is revenue *after* deducting interest expense (US$4,578.7m) and loan-loss provisions (US$4,204.9m) from revenue before losses of US$11,196.1m. `[Capital IQ Financials → Income Statement export (NU) — vendor export]` The 20-F's own Note 34 revenue base is US$12,083,766 on a different, gross definition (see 1b). Both are correct on their own basis; they are not interchangeable, and I use the filing's figure throughout.

### 1b. Geography — the only quantified breakdown the filing gives (Note 34b)

This is a **disaggregation disclosure**, not a reportable segment. Note 34(b) defines its revenue base narrowly: *"Includes interest income (credit card, loan and other receivables), credit and prepaid card income, late fees, insurance commission and other fees and commission income."* `[FY25 Form 20-F, Note 34(b) footnote (i), p.F-97]`

| Geography | What It Does | Revenue Share FY2025 | Revenue Share H1 FY2026 | Profit Share | Margin Quality | Capital Intensity | Cyclicality | Main Risk |
|---|---|---:|---:|---:|---|---|---|---|
| Brazil | The mature business: 118m customers, US$36.4bn deposits at Q2'26; holds the Payment Institution, credit/financing and brokerage licences | **91.4%** (11,038,313) | **90.9%** (7,576,852) | Not disclosed | Not disclosed at country level | High regulatory capital: US$5,597,604 held, 15.7% capital adequacy ratio at 30 Jun 2026 | High — unsecured consumer credit | Single-country concentration; Brazilian interest-rate and credit cycle |
| Mexico | 16.5m customers; became a full multiple bank on 6 Aug 2026 after CNBV operations authorisation; US$5.7bn deposits at Q2'26 | **6.7%** (808,113) | **7.2%** (603,629) | Not disclosed | Not disclosed at country level | US$427,572 regulatory capital, 14.9% ratio at 30 Jun 2026 | High | Early-stage book; deposits fell again in Q2'26 on a deliberate funding-cost strategy |
| Other countries (includes Colombia and the United States) | Colombia: 5m+ customers, US$3.3bn deposits at Q2'26. United States: Nubank N.A. received conditional OCC approval 29 Jan 2026, not yet operating | **2.0%** (237,340) | **1.8%** (152,785) | Not disclosed | Not disclosed at country level | Colombia US$179,741 regulatory capital, 15.3% ratio at 30 Jun 2026 | High | The bucket is small in revenue but holds 13.9% of group non-current assets (147,761 of 1,060,834) — the mix inside it is not broken out |
| **Total** | | **100.0%** (12,083,766) | **100.0%** (8,333,266) | — | — | — | — | — |

Sources: FY2025 and H1'26 revenue and non-current assets `[FY25 Form 20-F, Note 34(b), p.F-97]` and `[Q2 FY26 Interim Report (14 Aug 2026), Note 34(b), p.43]`; regulatory capital by entity `[Q2 FY26 Interim Report (14 Aug 2026), Note 33(a)(b)(c), pp.42–43]`; customer counts and deposits by country `[Q2 FY26 earnings call transcript, 13 Aug 2026, prepared remarks]`; Mexico banking authorisation and Nubank N.A. `[Q2 FY26 Interim Report (14 Aug 2026), Note 35 (Subsequent events), p.44]` and `[FY25 Form 20-F, Note 35(a), p.F-98]`.

Three-year consistency of the geographic mix, same source and same basis: Brazil 93.0% (FY2023) → 92.9% (FY2024) → 91.4% (FY2025) → 90.9% (H1'26); Mexico 5.8% → 5.8% → 6.7% → 7.2%. `[FY25 Form 20-F, Note 34(b), p.F-97; Q2 FY26 Interim Report, Note 34(b), p.43]` Brazil's share is falling, but at roughly half a percentage point a year.

### 1c. Product / income type — Note 6, on the same revenue base as Note 34

Also a disaggregation, not a segment. Note 34(a) explicitly points to Note 6 for product information. `[FY25 Form 20-F, Note 34(a), p.F-97]`

| Income line | What It Is | FY2025 | Share | H1 FY2026 | Share | Profit Share |
|---|---|---:|---:|---:|---:|---:|
| Interest income – loan | Interest on unsecured and secured personal loans | 4,784,263 | 39.6% | 3,337,330 | 40.0% | Not disclosed |
| Interest income – credit card | Interest on revolving and instalment card balances | 4,597,770 | 38.0% | 3,361,620 | 40.3% | Not disclosed |
| Credit and prepaid card income | Interchange — the fee the merchant's bank pays Nu on each card purchase | 1,720,278 | 14.2% | 1,021,166 | 12.3% | Not disclosed |
| Late fees | Penalty fees on overdue balances | 385,005 | 3.2% | 261,679 | 3.1% | Not disclosed |
| Interest income – other receivables | Interest on other amounts owed to Nu | 361,675 | 3.0% | 189,027 | 2.3% | Not disclosed |
| Other fee and commission income | Brokerage, marketplace and other fees | 199,245 | 1.6% | 142,291 | 1.7% | Not disclosed |
| Insurance commission | Commission on policies sold as a broker | 35,530 | 0.3% | 20,153 | 0.2% | Not disclosed |
| **Total (Note 34 revenue base)** | | **12,083,766** | **100.0%** | **8,333,266** | **100.0%** | — |

Source: `[FY25 Form 20-F, Note 6(a) and 6(b), pp.F-30–F-31]`; `[Q2 FY26 Interim Report (14 Aug 2026), Note 6(a) and 6(b), p.16]`. Shares are my arithmetic on the filing's own figures; components sum exactly to the stated total in both periods.

**Income the geography and product tables leave out.** Note 34's revenue base excludes three treasury income lines that Note 6 does disclose: interest on other assets at amortised cost (FY2025 2,284,594), interest and gains on instruments carried at fair value (1,359,548), and other fair-value income (46,833) — together **3,690,975**, or **23.4%** of the group's US$15,774,741 of total interest and fee income for FY2025. `[FY25 Form 20-F, Note 6(a) and Note 34(b), pp.F-30, F-97]` On the H1'26 numbers the excluded amount is 2,147,909 of 10,481,175, or **20.5%**. `[Q2 FY26 Interim Report, Note 6(a) and Note 34(b), pp.16, 43]` So roughly a fifth to a quarter of what the group earns is nowhere in the geographic split. That is a real gap for anyone trying to size Brazil against Mexico on total earnings power.

---

## 2. Dominant Segment

**Nu is a single-segment business, and the company says so.** One operating and reportable segment — Banking, meaning the whole Group — with 100% of revenue and 100% of profit. `[FY25 Form 20-F, Note 34, p.F-97]` The `>85% from one segment` test in this agent's brief is met at 100%. I am not manufacturing sub-segments.

Within that single segment, the only quantified split the filing offers is geographic, and **Brazil dominates it: 91.4% of Note-34 revenue in FY2025 and 90.9% in H1 FY2026.** `[FY25 Form 20-F, Note 34(b), p.F-97; Q2 FY26 Interim Report, Note 34(b), p.43]` **Profit by country is not disclosed at all**, so this dominance read falls back to revenue — the limitation the brief asks me to name. Two independent reads point the same way and neither is a profit measure: Brazil holds 90.2% of the regulatory capital sitting inside the three regulated operating entities (5,597,604 of 6,204,917 at 30 Jun 2026) `[Q2 FY26 Interim Report, Note 33, pp.42–43]`, and 80.2% of group deposits (US$36.4bn of US$45.3bn at Q2'26) `[Q2 FY26 earnings call transcript, 13 Aug 2026, prepared remarks]`.

On product, the business is a **lender first and a payments business second**: interest on loans and cards together made 77.6% of Note-34 revenue in FY2025 and 80.3% in H1'26, against 14.2% and 12.3% from card interchange. `[FY25 Form 20-F, Note 6, pp.F-30–F-31; Q2 FY26 Interim Report, Note 6, p.16]` That share is rising, not falling. The economics of this company are the economics of a Brazilian consumer credit book, and any analysis that treats it primarily as a payments or app platform is looking at the smaller quarter of the revenue.

---

## 3. Segment Disclosure Quality

**Segments are defined consistently, because there is only one and the definition has not moved.** The single-reportable-segment language is word-for-word identical in the FY2023, FY2024 and FY2025 20-Fs and in the Q2 FY26 interim statements. `[FY23 Form 20-F (filed 19 Apr 2024), Note on Segment information; FY24 Form 20-F (filed 16 Apr 2025), Segment information note; FY25 Form 20-F, Note 34, p.F-97; Q2 FY26 Interim Report, Note 34, p.43]` **There is no segment profit disclosure of any kind** — no country margin, no product margin, no country net income. Everything below the consolidated line is revenue and, for geography, non-current assets. Downstream agents (`unit-economics`, `competitive-map`) should treat all segment-level profitability as **Not disclosed** and must not construct it from revenue shares.

Four specific gaps, in order of how much they matter:

1. **A fifth to a quarter of group income is outside the geographic table.** Note 34(b) excludes treasury income: 23.4% of total interest and fee income in FY2025, 20.5% in H1'26 (arithmetic shown in §1c). The geographic split is therefore a split of *customer-facing* revenue, not of the group's earnings.
2. **The geographic breakdown narrowed.** The FY2023 20-F named Brazil, Mexico, Colombia, Cayman Islands, the United States, Germany and Argentina separately. From the FY2024 20-F onward, everything except Brazil and Mexico is collapsed into "Other countries." `[FY23 Form 20-F (filed 19 Apr 2024), Segment information note; FY25 Form 20-F, Note 34(b), p.F-97]` The bucket is only 2.0% of revenue, which is well inside any materiality bar — but it is **13.9% of group non-current assets** (147,761 of 1,060,834), and it now conceals Colombia, an operating bank with 5m+ customers and US$3.3bn of deposits, plus the new US entity. That is a genuine disclosure loss in the last three years.
3. **The Managerial P&L does not fix this.** Nu introduced a "Managerial P&L" in Q4'25 explicitly framed as explaining value creation *"across products, segments, and geographies."* `[FY25 Form 20-F, Item 5 (Key Business Metrics); Q2'26 investor deck (13 Aug 2026), Non-IFRS Financial Measures and Reconciliations, p.31]` As published in the pool, it is presented **only at Nu Holdings consolidated level** — the deck slide is titled "Nu Holdings consolidated," and no product-level or country-level Managerial P&L appears in the 20-F, the interim statements or the deck. It is a re-cut of the same single consolidated number, non-audited and non-IFRS. It adds no segment visibility.
4. **A vendor figure does not tie to the filing for FY2024 and must not be used.** The Capital IQ Segments export shows FY2024 geographic revenue of Brazil 9,478.5 / total 10,330.2. `[Capital IQ Financials → Segments export (NU), Geographic Segments, filing date 2026-02-25 — vendor export]` Both the FY2024 and FY2025 20-Fs report FY2024 as Brazil 8,409,961 / total 9,051,257. `[FY24 Form 20-F (filed 16 Apr 2025), Segment information note; FY25 Form 20-F, Note 34(b), p.F-97]` The gap of 1,278,980 is exactly the FY2024 "interest income – other assets at amortized cost" line from Note 6 — the vendor put treasury income into the FY2024 geographic total and did not do so for FY2023 or FY2025. Use the filing. The vendor's FY2025 and FY2023 columns do tie to the filing exactly.

One positive, stated with its number: **no single customer was 10% or more of group revenue** in FY2023, FY2024, FY2025, or the six months to 30 Jun 2026. `[FY25 Form 20-F, Note 34(b), p.F-97; Q2 FY26 Interim Report, Note 34(b), p.43]`

**Management's one qualitative claim about relative country economics carries no numbers.** On the Q2'26 call the CEO said Nu *"broke even in six years in Mexico compared with 8 years in Brazil"* and that average revenue per active customer in Mexico is US$12.3 against US$5.6 in Brazil. `[Q2 FY26 earnings call transcript, 13 Aug 2026, prepared remarks]` That is a tier-3 transcript statement with no supporting country income statement anywhere in the filings. It is not proof that Mexico is profitable, and it must not be converted into a profit share.

---

## 4. Citations

Every share figure above, with its source:

| Claim | Figure | Citation |
|---|---|---|
| One operating and reportable segment; CODM is the CEO | 1 segment, 100% | `FY25 Form 20-F (filed 8 Apr 2026), Note 34 (Segment information), p.F-97` |
| Same, restated at the latest interim date | 1 segment | `Q2 FY26 Interim Report (14 Aug 2026), Note 34, p.43` |
| Geographic revenue FY2025 / FY2024 / FY2023 | Brazil 11,038,313 / 8,409,961 / 5,728,748; Mexico 808,113 / 523,112 / 354,884; Other 237,340 / 118,184 / 76,382; totals 12,083,766 / 9,051,257 / 6,160,014 | `FY25 Form 20-F, Note 34(b), p.F-97` |
| Geographic revenue H1 FY2026 and Q2'26 | Brazil 7,576,852 (3,990,286); Mexico 603,629 (314,603); Other 152,785 (76,038); total 8,333,266 (4,380,927) | `Q2 FY26 Interim Report (14 Aug 2026), Note 34(b), p.43` |
| Definition of the Note-34 revenue base | footnote (i) | `FY25 Form 20-F, Note 34(b) footnote (i), p.F-97` |
| Non-current assets by geography | Brazil 852,770; Mexico 60,303; Other 147,761; total 1,060,834 (31 Dec 2025) | `FY25 Form 20-F, Note 34(b), p.F-97` |
| Product/income-type revenue FY2025 | credit-card interest 4,597,770; loan interest 4,784,263; other assets at amortised cost 2,284,594; other receivables 361,675; fair-value instruments 1,359,548; other fair value 46,833; total interest income 13,434,683. Credit and prepaid card income 1,720,278; late fees 385,005; insurance commission 35,530; other fee and commission 199,245; total fees 2,340,058 | `FY25 Form 20-F, Note 6(a) and 6(b), pp.F-30–F-31` |
| Product/income-type revenue H1 FY2026 | credit-card interest 3,361,620; loan interest 3,337,330; other assets at amortised cost 1,414,857; other receivables 189,027; fair-value instruments 703,408; other fair value 29,644; total 9,035,886. Credit and prepaid card 1,021,166; late fees 261,679; insurance commission 20,153; other fees 142,291; total fees 1,445,289 | `Q2 FY26 Interim Report (14 Aug 2026), Note 6(a) and 6(b), p.16` |
| Group net income FY2025 and ECL FY2025 | US$2,871.7m net income (+45.6% from US$1,972.1m); expected credit loss US$4,204.9m (+32.7% from US$3,169.0m) | `FY25 Form 20-F, Item 5 (Operating and Financial Review)` |
| Group net income H1 FY2026 | 1,932,520 (Q2 alone 1,061,089) | `Q2 FY26 Interim Report (14 Aug 2026), Consolidated Statements of Income, p.6` |
| Brazil regulatory capital, RWA, ratios | Regulatory capital 5,597,604; RWA 35,710,139; CET1 11.9%, Tier 1 13.4%, CAR 15.7% (30 Jun 2026) | `Q2 FY26 Interim Report (14 Aug 2026), Note 33(a), p.42` |
| Mexico and Colombia regulatory capital | Mexico US$427,572, ratio 14.9%; Colombia US$179,741, ratio 15.3% (30 Jun 2026) | `Q2 FY26 Interim Report (14 Aug 2026), Note 33(b) and 33(c), pp.42–43` |
| Deposits and customers by country; delinquency and coverage; Mexico ARPAC and break-even comment | Brazil US$36.4bn / 118m; Mexico US$5.7bn / 16.5m; Colombia US$3.3bn / 5m+; total deposits US$45.3bn; coverage 244% of NPL 90+; 90-plus up 35bp; ARPAC US$12.3 Mexico vs US$5.6 Brazil | `Q2 FY26 earnings call transcript, 13 Aug 2026, prepared remarks` |
| Mexico multiple-bank authorisation; Banco Porto Real purchase agreement | CNBV authorisation 9 Jul 2026, began operating as a bank 6 Aug 2026; share purchase agreement announced 20 Jul 2026 | `Q2 FY26 Interim Report (14 Aug 2026), Note 35, p.44` |
| Nubank N.A. conditional OCC approval | 29 Jan 2026 (application filed 30 Sep 2025) | `FY25 Form 20-F, Note 35(a), p.F-98` |
| Managerial P&L is consolidated-only | "Managerial P&L — Q2'2026 · Nu Holdings consolidated"; framework described as supplemental, non-audited, non-IFRS | `Q2'26 investor deck (13 Aug 2026), Non-IFRS Financial Measures and Reconciliations, pp.30–33`; `FY25 Form 20-F, Item 5 (Key Business Metrics)` |
| FY2023 geographic detail (Colombia, US, Cayman, Germany named separately) | Colombia 75,405; United States 977; total 6,160,014 | `FY23 Form 20-F (filed 19 Apr 2024), Segment information note` |
| FY2024 filing confirms Brazil 8,409,961 (contradicting the vendor's 9,478.5) | 8,409,961 | `FY24 Form 20-F (filed 16 Apr 2025), Segment information note` |
| Vendor segment and geographic shares (reconciliation only) | Banking 6,991 (100%); Brazil 11,038 (91%) / Mexico 808 (7%) / Other 237 (2%) of 12,084; FY2024 geographic total 10,330.2 | `Capital IQ Financials → Segments export (NU), data to Dec-31-2025 — vendor export`; `ciq_facts.json` `segments_revenue` and `geographic` |
| Vendor income-statement definitions used in the reconciliation | Revenue before loan losses 11,196.061; provision for loan losses 4,204.876; Total Revenue 6,991.185; FY2022 net loss −364.6 | `Capital IQ Financials → Income Statement export (NU), data to FY2025 and LTM Jun-30-2026 — vendor export` |
| Filing regime, standard, currency, fiscal year | US SEC foreign private issuer; IFRS as issued by the IASB; US dollars; year ended 31 Dec 2025 | `FY25 Form 20-F (filed 8 Apr 2026), cover page` |

**Not used as evidence:** `data/NU/NU_Holdings_Deep_Dive_15_Page_Memo_30_Aug_2026.pdf` is a prior engine output carrying its own verdict, treated as a §4 tier-9 user note per the triage caveat. It was not read for, and did not inform, any conclusion in this report. Duplicate copies in the pool (`Filings 2/`, the "(1)" workbook twins, the `.doc` mirrors of the 20-Fs) were not counted as independent corroboration.
