# Catalyst Data Triage — SMPL

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | US SEC — Nasdaq (NasdaqCM: SMPL) | Annual Report on Form 10-K_2025.pdf; Form 10-Q filings; CIQ Public Company Profile |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | FY2025 10-K, financial statements and notes throughout |
| Reporting currency (and fiscal year-end) | USD; fiscal year ends the last Saturday in August (FY2025 ended Aug-30-2025; FY2024 was a 53-week year) | FY2025 10-K; `management-governance/02_capital-allocation-scorecard.md` §1; `earnings/04_guidance-consensus.md` (Estimates Report.xls, Consensus tab header: "Current Fiscal Year End: Aug-31-2026") |
| Document language(s) | English throughout — all filings, transcripts, and vendor exports are native English | Pool-wide; no non-English source in `_pool_extracts/manifest.md` |

The document map for a US SEC filer applies directly: 10-K (audited annual), 10-Q (quarterly), DEF 14A-equivalent proxy (here, the "Annual Meeting Proxy Statement_2026"), 8-K-equivalent material events (captured in this pool via the CIQ Key Developments export, which logs the same disclosures). No local-equivalent substitution is needed.

## External data (frameworks/EXTERNAL_DATA.md)

No `data/SMPL/external/` folder exists in this pool — confirmed by directory listing. All 11 workbooks/documents in `data/SMPL/` are either SEC filings (10-K, two 10-Qs, proxy statement, transcripts) or Capital IQ vendor exports (Financials, Estimates, Credit Health, Ownership, Comparable Analysis, Short Interest, Suppliers/Customers, Events Calendar, Key Developments, Public Company Profile) — none carry an `external: true` manifest tag or a `.source.json` provenance sidecar. There is therefore no §1A External Data table to add, and no external-data freshness flag to raise.

## 1. Scheduled-Event Inventory

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | Y | FQ4 FY2026 earnings release estimated Oct-23-2026 12:30 PM ("Estimated Earnings Release Date (CIQ Derived)"); management has already given a specific numeric FQ4 FY26 guide ($322M–$332M net sales, $52M–$57M Adjusted EBITDA) on the Jul-9-2026 call | CIQ Events Calendar.xls, "Estimated Earnings Release Date" entry, Oct-23-2026; `earnings/04_guidance-consensus.md` §2 (Q3 FY26 transcript, Jul-9-2026) |
| Debt maturity / refinancing date | Y (but far-dated, low near-term relevance) | Single bullet Term Facility, $400.0M face, matures **Mar-17-2030** (extended from Mar-17-2027 by the Nov-19-2025 Amendment No. 8); $0 due in the next 24 months. Revolver ($75.0M, undrawn) expires the earlier of 91 days pre-Term-Facility-maturity or Dec-16-2029 | `balance-sheet-survival/02_maturity-wall-and-refinancing.md` §1 (Q3 FY2026 10-Q, Note 5) |
| AGM / EGM / record date | Y (past this year; next one inferred) | 2026 Annual General Meeting already held Jan-28-2026, 1:00 PM. No 2027 AGM date is yet scheduled/disclosed in this pool — the company's historical pattern (results release + AGM/shareholder call same week in January) implies a next AGM around late Jan-2027, but that specific date is not itself filed | CIQ Events Calendar.xls, "Annual General Meeting," Jan-28-2026; Annual Meeting Proxy Statement_2026.pdf (2026 AGM only — no 2027 notice in pool) — the ~Jan-2027 date is **Inference, not from filings** |
| Scheduled regulatory / legal decision | N | FY2025 10-K, Item 3 (Legal Proceedings): "not presently a party to any litigation that we believe to be material" — no pending regulatory decision, hearing, or enforcement action with a date is disclosed anywhere in the pool | `business-model/01_disqualifier-scan.md` item 6 (FY2025 10-K, Item 3, p.35) |
| Policy / government decision date | N (exposure exists, no dated decision) | 2025 US tariffs on EU/Canada/Mexico/China imports are already-enacted policy (not a forward decision date); GLP-1 drug adoption is a structural regulatory/consumer-cycle risk with no scheduled decision point | `business-model/10_external-dependency.md` rows "Government policy," "Regulation" (FY2025 10-K, p.18–19, 22–23) |
| Operational event (launch / commissioning / contract) | Y | High-single-digit price increase across most of the portfolio, **effective September 2026** (i.e., FQ1 FY2027), specifically to offset commodity/tariff inflation | `management-governance/01_management-and-track-record.md` §... (Q3 FY26 earnings call, Jul-9-2026, prepared remarks — CEO Scalzo); `business-model/10_external-dependency.md` row "Commodity prices" |
| Capital-return event (dividend / buyback) | Y (buyback only — no dividend) | No dividend, ever, and none planned ("does not expect to declare any dividends in the foreseeable future"). Buyback authorization was increased by $200.0M on Jan-6-2026 (on top of the pre-existing authorization); $213.2M was actually spent in the 39 weeks to May-30-2026. Remaining authorization headroom / expiry date is not itself disclosed in the extracted text | `management-governance/02_capital-allocation-scorecard.md` §1, §3 (FY2025 10-K, p.32; FY26 Q3 10-Q, p.15, 31–32) |
| Market-structure event (index review / lock-up) | Y (already passed, informational only) | Multiple "Index Constituent Drop" entries and one "Index Constituent Add" all dated 2026-06-29 — already in the past relative to today (2026-08-06); no forward index-review date disclosed | CIQ Events Calendar.xls, entries dated 2026-06-29 |

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | Y (00 through 99, full run) | FQ4 FY26 results date (Oct-23-2026), the specific numeric guide already given for that quarter, and the falling-estimate-revision trend into it |
| balance-sheet-survival | Y (00 through 99, full run) | 2030 bullet-maturity refinancing event (far-dated); confirms $0 due in 12–24 months, so no near-term refinancing catalyst |
| management-governance | Y (00 through 99, full run) | Buyback-authorization increase (Jan-6-2026, $200M), no-dividend policy, CEO-transition/succession context (Scalzo returned Jan-19-2026), Sept-2026 price increase as management-flagged operational event |
| valuation | Y (00 through 99, full run) | Explicit "what's priced in" read and named bull/bear triggers: FQ4 FY26 results (price-increase volume response), FY2027 guidance (first full post-impairment year), confirmation of whether leadership turnover stabilizes |
| business-model | Y (00 through 99, full run) | Tariff/commodity/GLP-1 exposure (all undated, structural — no scheduled decision points); confirms no active litigation or regulatory enforcement |

## 3. Triage Verdict

**Partial.**

There is one genuinely dated, evidenced, near-term event: the FQ4 FY2026 earnings release, estimated Oct-23-2026, for which management has already issued a specific numeric range on both net sales and Adjusted EBITDA (Jul-9-2026 call) — this is a real, proven-date catalyst the calendar agent can build around, including the September-2026 price increase whose volume response that print will reveal. Beyond that one hard date, the calendar has only soft, structurally distant, or undated material: the $400.0M debt maturity is proven and evidenced but sits more than three years out (Mar-2030) with nothing due in the next 24 months; the buyback-authorization increase is evidenced but has no stated expiry/completion date; the next AGM date is inferred from a pattern, not filed; and the tariff/commodity/GLP-1 exposures are real and cited but carry no scheduled decision date. No litigation, no pending regulatory action, no announced M&A, and no confirmed forward AGM/proxy date exist in this pool.

The calendar will carry one proven near-term date (FQ4 FY26 results, Oct-23-2026) with clear two-sided triggers (price-increase elasticity, Quest/Atkins/OWYN brand trends versus a Street revision cycle that has been falling for 90 days), plus several longer-horizon or vaguely-dated items (2030 refinancing, next AGM, tariff/GLP-1 structural risk) that are evidenced but not "dated" in the §17 sense. This is not a thematic-only story — the next-quarter catalyst is real and specific — but it is also not a calendar rich in multiple near-term proven dates.
