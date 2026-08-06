# Catalyst Data Triage — UBER

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | US SEC (NYSE: UBER), Delaware-incorporated | `Uber Technologies Inc NYSE UBER Public Company Profile.rtf`; `management-governance/00_governance-data-triage.md` §0 |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | "Acctg. Standard: US GAAP" [Capital IQ Estimates Report, Consensus tab] |
| Reporting currency (and fiscal year-end) | USD; fiscal year ends December 31 | "Current Fiscal Year End: Dec-31-2026" [Financials.xls, Income Statement tab] |
| Document language(s) | English throughout the pool (no non-English filings present) | Pool manifest, `_pool_extracts/manifest.md` |

Uber is a US domestic filer. US form names (8-K, 10-K, DEF 14A) are the correct native document set here — no local-equivalent substitution is needed. Note: the data pool itself contains **no primary SEC filing** (no 10-K, 10-Q, or 8-K) — only Capital IQ vendor exports, a Q2 FY2026 earnings-call transcript, and RTF company-profile documents. Where the management-governance module needed primary-filing detail (AGM date, DEF 14A content), it retrieved the actual FY2026 DEF 14A from SEC EDGAR directly [`management-governance/05_board-and-shareholder-rights.md`] — this triage relies on that same cross-module retrieval rather than re-pulling filings itself.

## External data (frameworks/EXTERNAL_DATA.md)

`data/UBER/external/` does not exist — no externally sourced research (alt-data panels, expert calls, channel checks, broker notes) is present in this pool. No external-data table is added; nothing here moves (or could move) the sufficiency verdict.

## 1. Scheduled-Event Inventory

Idempotent pool extraction was re-run and reported "fresh — 37 tabs across 5 workbook(s), 45 extract(s)" with 0 failures [`_pool_extracts/manifest.md`]. All tabs across all five workbooks (Financials, Estimates Report ×2 duplicate copies, Company Comparable Analysis, Charting Export) were scanned; none were skipped.

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | Partial (Y for period, N for exact date) | FQ3 2026 (quarter ending Sep-30-2026) is the next reporting period covered by consensus and management's own Adjusted EBITDA / Adjusted EPS guidance issued 2026-08-05; no specific calendar report date (e.g. "early November 2026") appears anywhere in the pool | `earnings/04_guidance-consensus.md` §2 ("FQ3 2026 (quarter ending Sep-30-2026)"); Capital IQ Estimates Report, Guidance tab, Guidance Date 2026-08-05 |
| Debt maturity / refinancing date | Y | Instrument-level maturity table: 2028 Convertible Notes $1,725mm (2028-12-01), 2028 Exchangeable Senior Notes $1,125mm (2028-05-15), 2031 Senior Notes $1,000mm (2031-01-15), 2035 Senior Notes $1,250mm (2035-09-15), plus a 2034 Senior Note $1,500mm and a 2054 Senior Note $1,250mm. First real maturity cluster: ~FY2028, $2,850mm (19.3% of debt) | `balance-sheet-survival/02_maturity-wall-and-refinancing.md`; CIQ export, Capital Structure Details tab |
| AGM / EGM / record date | Y (last one; next one inferred, not dated) | FY2026 Annual Meeting held 2026-05-04, record date 2026-03-23 (already occurred, not forward-looking); no 2027 AGM date is disclosed anywhere in the pool — next AGM is inferred annual-cadence only | `management-governance/05_board-and-shareholder-rights.md` (FY2026 DEF 14A, filed 2026-03-23, retrieved from SEC EDGAR) |
| Scheduled regulatory / legal decision | N | No specific dated regulatory hearing, ruling date, or license-renewal date is disclosed. Driver/worker-classification risk, insurance regulation, and AV-specific rules are discussed as live, ongoing, city-by-city/state-by-state policy questions with no scheduled decision date | `business-model/10_external-dependency.md` §Government policy/Regulation |
| Policy / government decision date | N | Same as above — no dated policy/legislative event on the calendar; the UK "business model change" (a regulatory reclassification that already cut ~400bp of take rate) is a realized past event, not a forward catalyst | `business-model/10_external-dependency.md` |
| Operational event (launch / commissioning / contract) | Partial | Delivery Hero acquisition closing is the dominant operational/structural event — see M&A row below (also functions as an operational integration catalyst). No other dated product launch or capacity event found | `management-governance/02_capital-allocation-scorecard.md` §2 |
| Capital-return event (dividend / buyback) | Partial | No dividend (never paid). Buyback framework ("~50% of FCF") exists but is currently paused/redirected — $4bn of buyback-framework capital was diverted to pre-fund the Delivery Hero stake in Q2 FY2026, with no stated resumption date; this is a soft/undated event ("months, not quarters" per `management-governance/99` synthesis reading), not a scheduled one | `management-governance/02_capital-allocation-scorecard.md` §3–4; `99_management-governance-synthesis.md` |
| Market-structure event (index review / lock-up) | N | No index-inclusion/exclusion, lock-up expiry, or ADR/listing-change event found in the pool | — |
| **M&A / structure (added — largest single catalyst)** | **Y** | Business Combination Agreement signed 2026-07-16 to acquire the remaining ~63.21% of Delivery Hero SE for €41.50/share cash (€12.9bn / $14.8bn equity value), financed by a committed ~€14bn bridge facility; **expected close H2 2027**, subject to 50%+1 acceptance threshold and merger-control/competition/financial-regulatory approvals; termination fees €700mm (Uber) / €200mm (Delivery Hero); a related $1.6bn divestiture of overlapping 14-market businesses to SSW Partners is required to clear antitrust | `balance-sheet-survival/01_capital-structure-and-leverage.md`; `management-governance/02_capital-allocation-scorecard.md` §2; CIQ export, `UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf`, deal-summary text; Q2 FY2026 earnings-call transcript, CFO remarks pp.11-14 |

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | Y (full: `00`–`08`, `99`, dossier) | Next-quarter (FQ3 2026) guidance vs. consensus, revision trend, beat/miss setup |
| balance-sheet-survival | Y (full: `00`–`06`, `99`, dossier) | FY2028 debt maturity cluster; the ~€14bn Delivery Hero bridge facility as an undrawn, pro-forma leverage event; an unidentified $1,997mm short-term debt addition (instrument/tenor undisclosed) |
| management-governance | Y (full: `00`–`06`, `99`, dossier) | Delivery Hero deal terms and closing window (H2 2027); buyback-framework pause/resumption; AGM cadence (last: 2026-05-04); serial-acquirer pattern (§24 Filter 4 flagged, RF-CAP-004 critical) |
| valuation | Y (full: `00`–`07`, `99`, dossier) | Re-rating trigger: base case implies 13.25x NTM EV/EBITDA vs. today's 11.89x, resting on margin/ROIC evidence already delivered, not on the Delivery Hero deal (which is treated as a labelled pro-forma overlay, not yet in the anchor EV) |
| business-model | Y (full: `00`–`12`, `99`, dossier) | Driver/worker-classification regulatory risk (undated, ongoing); FX exposure (~49% of revenue ex-US/Canada, Delivery Hero deal priced in EUR); serial-acquirer disqualifier-scan flag |

All five dependency modules ran and their outputs were read directly (not just via the `<Dep> cross-module path:` sentences) for this triage.

## 3. Triage Verdict

**Partial.**

The calendar will carry ONE genuinely dated, evidenced, material catalyst — the Delivery Hero acquisition (signed 2026-07-16, expected close H2 2027, deal terms, financing, termination fees, and the required $1.6bn antitrust divestiture all disclosed) — plus a real but distant debt maturity wall (first cluster ~FY2028, $2,850mm) and a clear next-quarter guidance/consensus setup (FQ3 2026 Adjusted EBITDA $2,860–2,960mm, Adjusted EPS $0.84–0.88) whose exact report date is not stated in the pool. Beyond those, the rest of the forward calendar is soft: no dated regulatory/legal decision, no dated next AGM, no dated buyback resumption, and no dated policy event — driver-classification and insurance-regulation risk are real but undated, ongoing, city-by-city fights, not scheduled events. The calendar will therefore mix one hard-dated, high-materiality structural catalyst (M&A) with several proven-but-vague-timing items (next results period known, exact date not) and a genuinely thematic regulatory/policy overhang with no scheduled resolution. This does not abort the module — `01_catalyst-calendar` has enough to build a real (if short) dated calendar, not merely a thematic story, but should mark the regulatory/policy and buyback-resumption items explicitly as "undated / thematic" per this module's Core Principle 1.
