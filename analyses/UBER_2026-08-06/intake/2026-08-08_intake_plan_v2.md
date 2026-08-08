# UBER Document Intake — 2026-08-08 (v2)

## Verdict

**scoped_rerun** · The actual FY2025 Form 10-K and both FY2026 Form 10-Qs (Q1 and Q2) landed in the pool during this scan — the primary annual and quarterly filings every one of this run's six module triages explicitly flagged as absent, with all financial, segment, and governance detail sourced only from Capital IQ vendor exports until now. The 10-K resolves items governance-data-triage marked "fully missing" (a clean auditor opinion, three named related-party relationships, driver-misclassification legal proceedings, single-class share confirmation) and gives balance-sheet-survival the exact covenant-compliance and indenture detail its own triage called "the single highest-value missing document." Scope widens to nearly all of business-model, earnings, balance-sheet-survival, and management-governance, plus two valuation orbs and the catalyst calendar — 30 rerun commands in total. Two Capital IQ named-customer/supplier exports (already flagged in the prior 2026-08-08 intake pass, still unexecuted) are carried forward unchanged.

## New documents since the last run (analyses/UBER_2026-08-06)

| Document | Provider · type · §4 tier · as-of | Materiality /100 | Bears on (orb) | Re-run? |
|---|---|---|---|---|
| Form 10-K (Feb-13-2026, FY2025) | SEC EDGAR · annual_report_10k · tier 1 · 2025-12-31 | 95 | 8 business-model + 6 earnings + 7 balance-sheet-survival + 6 management-governance + 2 valuation + 1 catalyst orbs | See commands below (30 total) |
| Form 10-Q (Aug-05-2026, FQ2 2026) | SEC EDGAR · quarterly_report_10q · tier 2 · 2026-06-30 | 85 | 6 earnings + 6 balance-sheet-survival + 2 business-model + 1 management-governance orbs (subset of the 10-K's list) | See commands below |
| Form 10-Q (May-06-2026, FQ1 2026) | SEC EDGAR · quarterly_report_10q · tier 2 · 2026-03-31 | 80 | 6 earnings + 1 balance-sheet-survival + 1 business-model orb (subset of the 10-K's list) | See commands below |
| Customers.rtf | Capital IQ · vendor_relationship_export · tier 5 · n/a | 65 | business-model/customer-geography, business-model/value-chain | `/research:rerun business-model customer-geography UBER` |
| Suppliers.rtf | Capital IQ · vendor_relationship_export · tier 5 · n/a | 65 | business-model/value-chain, business-model/customer-geography | `/research:rerun business-model value-chain UBER` |
| Q1 2026 Earnings Call transcript | S&P Global (CapIQ) · earnings_transcript · tier 6 · 2026-05-06 | 55 | — | note only — superseded by the FQ1 10-Q's MD&A |
| Key Developments.rtf | Capital IQ · vendor_news_feed · tier 5 · 2026-08-05 | 30 | — | note only |
| Events Calendar.xls | Capital IQ · vendor_events_export · tier 5 · 2026-08-05 | 25 | — | note only |
| Public Company Profile.rtf | Capital IQ · vendor_quote_snapshot · tier 5 · 2026-08-06 | 20 | — | note only |
| Financials_Quarterly.xls | Capital IQ · vendor_financials_export · tier 5 · 2026-06-30 | 20 | — | note only |
| Short Iinterest_12m_Uber.xls | Capital IQ · vendor_short_interest_export · tier 5 · 2026-08-08 | 15 | — | note only |
| Financials_Annual.xls | Capital IQ · vendor_financials_export · tier 5 · 2026-06-30 | 15 | — | note only |
| Q2 2026 Earnings Call (RTF re-export) | S&P Global (CapIQ) · earnings_transcript · tier 6 · 2026-08-05 | 5 | — | note only |
| EstimatesReport (1).xls | Capital IQ · vendor_estimates_export · tier 5 · 2026-08-05 | 0 | — | note only |
| 7 further CapIQ exports (comps, analyst coverage, board members, financials, products, professionals, estimates, CIQ landscape report) | Capital IQ · various · tier 5 · 2026-08-05 | 0 | — | note only — byte-identical, already read |

## Scoped rerun plan

**Business-model** (upstream root — reruns cascade to every downstream module):
1. `/research:rerun business-model data-triage UBER`
2. `/research:rerun business-model disqualifier-scan UBER` — the 10-K supplies a clean audit opinion and three named related-party relationships (Lime, Careem, Moove) to test against two of the scan's 8 hard-disqualifier triggers.
3. `/research:rerun business-model segment-map UBER` — Note 13 is now the primary segment source.
4. `/research:rerun business-model customer-geography UBER` — Customers.rtf + the 10-K's own Item 1 read.
5. `/research:rerun business-model value-chain UBER` — Suppliers.rtf + the 10-K's own Item 1 read.
6. `/research:rerun business-model external-dependency UBER` — Item 1A risk factors, primary-sourced.
7. `/research:rerun business-model capital-allocation-governance UBER` — auditor history / RPT now primary-verifiable.
8. `/research:rerun business-model red-flags-sweep UBER` — re-sweep against the newly available primary evidence.

**Earnings:**
9. `/research:rerun earnings earnings-data-triage UBER`
10. `/research:rerun earnings historical-financials UBER` — FY2025 audited + FQ1/FQ2 primary quarterlies.
11. `/research:rerun earnings revenue-drivers UBER` — MD&A driver narrative (CLAUDE.md §15 arithmetic).
12. `/research:rerun earnings margin-drivers UBER` — MD&A margin/cost narrative.
13. `/research:rerun earnings earnings-quality UBER` — primary cash-flow/working-capital notes.
14. `/research:rerun earnings earnings-red-flags UBER` — the FQ1 10-Q's MD&A is the primary-source explanation for the flagged GAAP EPS miss ($0.13 actual vs $0.71 consensus).

**Balance-sheet-survival:**
15. `/research:rerun balance-sheet-survival solvency-data-triage UBER`
16. `/research:rerun balance-sheet-survival capital-structure-and-leverage UBER` — Note 8 is the primary debt-stack source (Senior Notes, Convertible/Exchangeable Notes, Credit Agreement).
17. `/research:rerun balance-sheet-survival maturity-wall-and-refinancing UBER` — named maturity dates per instrument.
18. `/research:rerun balance-sheet-survival liquidity-runway UBER` — Credit Agreement drawn/undrawn detail.
19. `/research:rerun balance-sheet-survival coverage-and-covenants UBER` — the exact document solvency-data-triage called "the single highest-value missing document"; the 10-K states "in compliance with all covenants as of December 31, 2025" and describes each indenture's covenant terms.
20. `/research:rerun balance-sheet-survival off-balance-sheet-and-contingencies UBER` — Note 14 (Commitments and Contingencies).
21. `/research:rerun balance-sheet-survival downside-stress-test UBER` — downstream of 16-20.

**Management-governance:**
22. `/research:rerun management-governance governance-data-triage UBER` — three items this triage marked "Y — fully missing" (related-party, auditor report, legal/regulatory cases) are now resolved.
23. `/research:rerun management-governance management-and-track-record UBER`
24. `/research:rerun management-governance capital-allocation-scorecard UBER`
25. `/research:rerun management-governance ownership-and-insider-behavior UBER` — confirms single-class structure, no dual-class/super-voting.
26. `/research:rerun management-governance board-and-shareholder-rights UBER` — the Lime/Careem/Moove related-party disclosure directly.
27. `/research:rerun management-governance candor-and-disclosure-quality UBER`

**Valuation:**
28. `/research:rerun valuation price-and-capital-structure UBER` — share count, dilution, debt/cash bridge now primary-verifiable.
29. `/research:rerun valuation sum-of-the-parts UBER` — Note 13 segment-level detail.

**Catalyst:**
30. `/research:rerun catalyst catalyst-calendar UBER` — named litigation matters and the 2028 Convertible Notes' conversion-window mechanics.

## Watch (note-only)

- **Q1 2026 Earnings Call transcript** — materiality 55, below gate. Now secondary to the primary FQ1 10-Q that landed in this same scan; the 10-Q's MD&A is the higher-tier source for the same GAAP-EPS-miss explanation.
- **Key Developments.rtf** — materiality 30. The one incremental item (Wayve London PHV licensing) sits inside an already-covered theme.
- **Events Calendar.xls** — materiality 25. Every dated item except the next quarterly earnings date (Nov-03-2026) has already passed; that one is routine and fully expected.
- **Public Company Profile.rtf** — materiality 20. A routine ~3.8% one-day quote drift, inside ordinary noise (CLAUDE.md §10 span check).
- **Financials_Quarterly.xls** — materiality 20. Cross-checked, no new figure; now superseded as a citation source by the primary filings.
- **Short Iinterest_12m_Uber.xls** — materiality 15. Short interest is an unremarkable ~2.1-2.4% of shares outstanding; no orb in this roster consumes a standalone positioning series.
- **Financials_Annual.xls** — materiality 15. Extends history only into pre-2019 periods the thesis doesn't rely on.
- **Q2 2026 Earnings Call (RTF re-export)** — materiality 5. Identical content to the PDF already used.
- **EstimatesReport (1).xls** and 7 further CapIQ exports — materiality 0. Byte-identical to files already in this run's pool-extraction manifest.
