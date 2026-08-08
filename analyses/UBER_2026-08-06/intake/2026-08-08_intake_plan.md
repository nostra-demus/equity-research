# UBER Document Intake — 2026-08-08

## Verdict
scoped_rerun · Two new Capital IQ vendor exports (Customers.rtf, Suppliers.rtf) fill a data gap the original run explicitly flagged — named customer/supplier relationships were absent from the pool, capping the customer-concentration and supplier-concentration reads in business-model. Scope to business-model/customer-geography and business-model/value-chain plus their downstream cascade. A newly-arrived Q1 2026 earnings-call transcript, a Capital IQ Key Developments feed, a routine price-quote refresh, and two extended CapIQ financials workbooks were all read and judged immaterial or already reflected in the current thesis (below the 60 materiality gate); ten further pool files carry mtimes after the naive watermark check but are already present, byte-unchanged, in this run's own pool-extraction manifest from 2026-08-06 and were excluded as already-read.

## New documents since the last run (analyses/UBER_2026-08-06)

| Document | Provider · type · §4 tier · as-of | Materiality /100 | Bears on (orb) | Re-run? |
|---|---|---|---|---|
| Customers.rtf | Capital IQ · vendor relationship export · tier 5 · rolling 2yr | 65 | business-model/customer-geography, business-model/value-chain | `/research:rerun business-model customer-geography UBER` |
| Suppliers.rtf | Capital IQ · vendor relationship export · tier 5 · rolling 2yr | 65 | business-model/value-chain, business-model/customer-geography | `/research:rerun business-model value-chain UBER` |
| Q1 2026 Earnings Call, May 06 2026.rtf | S&P Capital IQ · earnings transcript · tier 6 · 2026-05-06 | 55 | (none — below gate) | note only |
| Key Developments.rtf | Capital IQ · vendor news feed · tier 5 · 2026-08-05 | 30 | — | note only |
| Public Company Profile.rtf | Capital IQ · vendor quote snapshot · tier 5 · 2026-08-06 | 20 | — | note only |
| Financials_Quarterly.xls | Capital IQ · vendor financials export · tier 5 · 2026-06-30 | 20 | — | note only |
| Financials_Annual.xls | Capital IQ · vendor financials export · tier 5 · 2026-06-30 | 15 | — | note only |
| Q2 2026 Earnings Call, Aug 05 2026.rtf | S&P Capital IQ · earnings transcript · tier 6 · 2026-08-05 | 5 | — | note only (duplicate of already-used PDF) |
| EstimatesReport (1).xls | Capital IQ · vendor estimates export · tier 5 · 2026-08-05 | 0 | — | note only (byte-identical, mtime-only) |
| 10 further pool files (Charting Export, Comparable Analysis x2, Analyst Coverage, Board Members, Financials.xls, Products, Professionals, EstimatesReport.xls, CIQReportLandscape) | Capital IQ · various · tier 5 · 2026-08-05 | 0 each | — | note only (already in this run's own 2026-08-06 pool-extraction manifest, unchanged) |

## Scoped rerun plan

1. `/research:rerun business-model customer-geography UBER` — triggered by Customers.rtf + Suppliers.rtf. These are the first named customer/supplier disclosures to enter the pool; 05_customer-geography.md's own text records that no such disclosure existed ("Uber does not disclose individual named customers anywhere in this pool") and left Freight shipper-concentration untested. Cascades to business-model synthesis, earnings, management-governance, balance-sheet-survival, valuation, and catalyst.
2. `/research:rerun business-model value-chain UBER` — same trigger documents. 06_value-chain.md separately flagged supplier/input concentration as "a genuine gap, not a zero"; the new Suppliers.rtf is direct (if partial — retail/restaurant partners, not driver supply) evidence on that gap. Same cascade as above.

Run customer-geography before value-chain (both are business-model module orbs; numeric/upstream order).

## Watch (note-only)

- **Q1 2026 earnings call transcript** (materiality 55, just under the gate): genuinely unread by the original run (only the Q2 transcript was verbatim-sourced per earnings-data-triage), and it is the only source for management's own framing of the FQ1 GAAP EPS miss (actual $0.13 vs $0.71 consensus). The miss itself is already a known number from the Estimates Report; only the qualitative color is new, and it most likely just reconfirms the GAAP-noise pattern historical-financials already flags (large one-off items distorting headline EPS in FY24/FY25). Watch for a second document that corroborates a genuinely new claim from this call before scoping management-governance/candor-and-disclosure-quality.
- **Key Developments.rtf** (30): a 1-year CapIQ news feed. The two newest items duplicate the already-incorporated Q2 earnings release/call. The one incremental item — Uber/Wayve securing Transport for London Private Hire Vehicle licences (Aug-05-2026) — sits inside the AV-partnership theme already extensively covered (business-identity, business-quality, value-chain, moat, management-and-track-record), all sourced to the Q2 call itself.
- **Public Company Profile.rtf** (20): a routine live-quote refresh one trading day after the run's entry price — $69.48 → $70.74 (~+1.8%), and about 3.8% above the $68.18 entry price used in decision_record.json. An ordinary single-day move, inside CLAUDE.md §10's noise threshold.
- **Financials_Quarterly.xls** (20) / **Financials_Annual.xls** (15): more granular / more extended CapIQ financials workbooks. Spot-checked against 01_historical-financials.md's existing quarterly-trend and seasonality tables (already built through FQ2'26) — no new figure found; the annual workbook's only genuine addition is pre-2019 history the current thesis does not use.
- **Q2 2026 earnings call, RTF version** (5): an RTF re-export of the identical FQ2 2026 call already extracted from the pool's PDF and used as the run's verbatim transcript.
- **EstimatesReport (1).xls** (0): mtime moved to 2026-08-08, but every extracted tab is byte-for-byte identical to the copy already saved in the run's own `_pool_extracts/` — no content change.
- **10 further files** (0 each): Charting Excel Export, both Comparable Analysis files, Analyst Coverage, Board Members, Financials.xls, Products, Professionals, EstimatesReport.xls (no "(1)"), and CIQReportLandscape all carry mtimes inside the original 2026-08-06 ingest window and already appear, unchanged, in this run's own pool-extraction manifest (`_pool_extracts/manifest.md`) — already read by the original run, not new to the engine. (These surfaced as raw candidates only because the run's `final_thesis.md` was legitimately re-touched by a later text-only correction commit on 2026-08-08, which triggered this command's durable-floor fallback to the run-folder date rather than the precise watermark.)
