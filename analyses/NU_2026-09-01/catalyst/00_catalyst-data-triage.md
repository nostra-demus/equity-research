# Catalyst Data Triage — NU

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | US SEC foreign private issuer; Cayman Islands-incorporated, with Class A ordinary shares listed on the NYSE as `NU`. | [FY2025 Form 20-F, cover; Item 3 (Presentation of Financial Information)] |
| Reporting standard (US GAAP / IFRS / Ind AS) | IFRS Accounting Standards as issued by the IASB. | [FY2025 Form 20-F, Item 3 (Presentation of Financial Information)] |
| Reporting currency (and fiscal year-end) | U.S. dollars; fiscal year ends 31 December. | [FY2025 Form 20-F, Item 3 (Presentation of Financial Information); Capital IQ Estimates — Consensus, header] |
| Document language(s) | English. | [FY2025 Form 20-F, cover and Item 3; H1 FY2026 Unaudited Interim Condensed Consolidated Financial Statements, cover] |

NU uses the foreign-private-issuer Form 20-F and interim-report regime. Later agents should not look for US domestic 10-Q, 8-K, or DEF 14A forms when the applicable 20-F, interim report, annual general meeting notice, or Form 6-K-equivalent disclosure is in the pool.

## Language is not a data gap (CLAUDE.md §27)

The issuer documents examined are in English. The frozen generation has no failed extraction: its manifest records 115 sources, 48 workbooks, 109 workbook tabs, and 174 extracts. Language neither raises nor lowers source quality; a non-English filing would count at its normal source tier and be translated for analysis. [Pool extraction manifest, generation `38e027225240f17d145268c600ace959f976f684b6abf6a5cd9e6f3d90a02bd8`, totals]

## 1. Scheduled-Event Inventory

The manifest's 109 workbook tabs were reconciled to the exact-generation extract inventory; the scheduled-event scan used the full corpus and the relevant filing, transcript, and workbook extracts. No source is marked `external: true`, so there are no external-data rows and no external research changes this triage verdict. [Pool extraction manifest, generation `38e027225240f17d145268c600ace959f976f684b6abf6a5cd9e6f3d90a02bd8`, sources and totals]

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | Y | FQ3 2026 standalone results and call are shown for **12 November 2026**. This is a Capital IQ calendar field, not a company commitment, and the calendar says future events may change. The reported quarter ends 30 September 2026; management gave no formal revenue or GAAP-EPS guide. | [Capital IQ Estimates — Consensus, header: “FQ3 2026 Earnings Release Date: Nov-12-2026”; Capital IQ Events Calendar, 2026; Q2 2026 earnings call, Q&A, 2026-08-13, pp. 8–11] |
| Debt maturity / refinancing date | Y | Nearest vendor-dated principal maturity is **1 June 2027**: US$1.864bn in 2027 and US$2.162bn in 2029, out of US$4.026bn of principal with parsed dates. This is a maturity anchor, not evidence that refinancing is required or scheduled. | [Capital IQ Financials → Capital Structure Details, latest as-reported maturity block; `ciq_facts.json`, `debt_maturity_wall`] |
| AGM / EGM / record date | N | The 2026 AGM occurred on 6 August 2026 and has passed. The pool contains no future AGM, EGM, or shareholder record date. | [Capital IQ Events Calendar, 2026; FY2025 Form 20-F, Item 10.B (annual-meeting provisions)] |
| Scheduled regulatory / legal decision | Y | Nu's acquisition of Banco Porto Real requires Brazilian Central Bank approval. The approval condition is evidenced, but no regulator decision date or outside window is disclosed. | [H1 FY2026 Unaudited Interim Condensed Consolidated Financial Statements, Note 35(b) (Subsequent Events), p. 43] |
| Policy / government decision date | Y | Brazil's financial-services specific IBS/CBS tax regime starts **1 January 2027**. The filing also identifies Brazil's presidential election as an October 2026 policy-risk window. NU says the tax impact is under assessment, so neither item proves an earnings effect. | [H1 FY2026 Unaudited Interim Condensed Consolidated Financial Statements, Note 1.1, p. 12; FY2025 Form 20-F, Item 3.D] |
| Operational event (launch / commissioning / contract) | N | No future dated launch, commissioning, or contract milestone is disclosed. Nubank Mexico began operating as a bank on 6 August 2026, which is already past as of this triage date; Banco Porto Real remains an undated approval condition rather than a dated operational milestone. | [H1 FY2026 Unaudited Interim Condensed Consolidated Financial Statements, Note 35(a)–(b), p. 43] |
| Capital-return event (dividend / buyback) | Y | The Board's US$1.0bn Class A buyback window runs from 4 June 2026 through **3 June 2027**. It is discretionary: NU is not obliged to repurchase a set amount; US$499.607m remained available at 30 June 2026. No dividend policy or scheduled dividend is disclosed. | [H1 FY2026 Unaudited Interim Condensed Consolidated Financial Statements, Note 31(e), p. 39; FY2025 Form 20-F, Item 8.A (Dividend and Dividend Policy)] |
| Market-structure event (index review / lock-up) | N | No future index review, lock-up expiry, listing change, or comparable market-structure event is scheduled in the pool. | [Capital IQ Events Calendar, 2026; Capital IQ Equity Listings, as of 2026-08-28] |

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | Y | The 12 November FQ3 date, the standalone US$5,936.74m revenue and US$0.22164 GAAP-EPS consensus bars, and the non-numeric FY2026 efficiency-ratio objective. [analyses/NU_2026-08-31/earnings/04_guidance-consensus.md; analyses/NU_2026-08-31/earnings/05_beat-miss-setup.md] |
| balance-sheet-survival | Y | `00_solvency-data-triage.md` is present. It identifies a financial-institution applicability gap in the corporate-debt framework, so the calendar should treat the 2027 maturity as a monitoring event rather than a proven refinancing stress. [analyses/NU_2026-08-31/balance-sheet-survival/00_solvency-data-triage.md] |
| management-governance | Y | The completed governance outputs can feed monitoring of the July 2026 CFO transition, founder-control decisions, buybacks, and the Porto Real acquisition. [analyses/NU_2026-08-31/management-governance/01_management-and-track-record.md; analyses/NU_2026-08-31/management-governance/02_capital-allocation-scorecard.md; analyses/NU_2026-08-31/management-governance/05_board-and-shareholder-rights.md] |
| valuation | Y | The valuation synthesis is present and frames a re-rating trigger as delivery of credit quality and returns sufficient to support the valuation, rather than a dated price event. [analyses/NU_2026-08-31/valuation/99_valuation-synthesis.md] |
| business-model | Y | The completed outputs identify the 1 January 2027 Brazilian tax change, October 2026 Brazil election window, regulation, and credit conditions as externally driven variables. [analyses/NU_2026-08-31/business-model/10_external-dependency.md; analyses/NU_2026-08-31/business-model/11_capital-allocation-governance.md] |

## 3. Triage Verdict

**Sufficient.** The calendar can carry multiple dated, evidenced events: the vendor-scheduled 12 November 2026 FQ3 result, the 1 January 2027 tax-regime start, the 1 June 2027 nearest dated debt maturity, and the 3 June 2027 end of the buyback authorization. The FQ3 date is a vendor field rather than a company commitment, and the Banco Porto Real approval is real but undated; the downstream calendar must preserve both qualifiers. No future AGM, operational-launch, or market-structure date is proven in the pool.
