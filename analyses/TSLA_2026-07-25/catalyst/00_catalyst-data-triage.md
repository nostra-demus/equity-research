# Catalyst Data Triage — TSLA

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | US SEC (NasdaqGS:TSLA), incorporated in Texas (reincorporated from Delaware, effective Jun-13-2024) | `Tesla_Inc_-_Form_10-KA(Apr-30-2026).doc` (10-K/A, Part III); Q2 FY26 10-Q, Note (Legal Proceedings) |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | Q2 FY26 10-Q, Note 8 (Debt, ASC 470-10-45 classification language); Annual Report FY2024/FY2025 PDFs |
| Reporting currency (and fiscal year-end) | US Dollar (USD); fiscal year ends December 31 | Q2 FY26 10-Q, Consolidated Balance Sheets; Events Calendar (Q4/full-year results reported Jan-28-2026 for FYE Dec-31-2025) |
| Document language(s) | English (all pool documents) | All extracts in `_pool_extracts/` |

No local-equivalent substitution is needed here — this is a standard US SEC filer. Downstream catalyst agents should read US-form scheduled-event documents (8-K material-event disclosures, DEF 14A / 10-K Part III proxy-equivalent for AGM matters, 10-Q Note 8 for debt maturities) as the canonical local map for this jurisdiction.

## Language is not a data gap (CLAUDE.md §27)

All documents in the pool are in English; no translation issue arises for this run. Noted for completeness per the required self-check.

## External data (frameworks/EXTERNAL_DATA.md)

`data/TSLA/external/` does not exist in this data pool (checked directly and via the extraction manifest — 11 workbooks / 2 PDFs / 2 RTF earnings-call transcripts / 2 mhtml filings, 0 files flagged `external: true`, 0 failures). There is no external-data section to add, and no external document contributes to or could distort the sufficiency verdict below.

## 1. Scheduled-Event Inventory

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | **Y (vendor-estimated, not yet company-confirmed)** | Q3 FY2026 earnings release, estimated **Oct-21-2026** — labeled "Estimated Earnings Release Date (CIQ Derived)" in the events calendar, i.e. a vendor pattern-projection, not a company announcement (contrast the three prior 2026 dates in the same file, which are labeled plain "Earnings Release Date" — company-confirmed, all now in the past relative to 2026-07-25) | `Tesla Inc NasdaqGS TSLA Events Calendar.xls` (`_pool_extracts/Tesla-Inc-NasdaqGS-TSLA-Events-Calendar__Events-Calendar.txt`); corroborated in `analyses/TSLA_2026-07-24/earnings/05_beat-miss-setup.md` §1 and `04_guidance-consensus.md` §1 |
| Debt maturity / refinancing date | **Y** | China Working Capital Facility ($5,888M net carrying value, 63.0% of total gross debt): contractual maturity **Sep-2026 – Mar-2027**, reclassified long-term on the balance sheet under ASC 470-10-45 with no disclosed binding replacement facility. Separately: RCF Credit Agreement ($5,000M committed, undrawn) matures **Jan-2028**; Warehouse Agreement draw-down ability expires **Mar-2027** (loan/lease maturities to 2034) | Q2 FY26 10-Q, Note 8 (Debt); `analyses/TSLA_2026-07-24/balance-sheet-survival/02_maturity-wall-and-refinancing.md` §1b, §4 |
| AGM / EGM / record date | **Partial — event certain, date not yet set** | The 10-K/A (filed Apr-30-2026) states: "Board of Directors has not yet established the date of the 2026 annual meeting of shareholders. When the date is established, the Company will announce it in its filings" and the definitive proxy is expected "later than the 120 [days]" after fiscal year-end. An AGM will occur (statutory requirement); no date/window exists yet in the pool | `Tesla_Inc_-_Form_10-KA(Apr-30-2026).doc`, lines ~953–955 |
| Scheduled regulatory / legal decision | **Partial — pending, undated** | Three Delaware Court of Chancery derivative suits (fiduciary-duty allegations tied to X Corp./xAI dealings), dismissed by the trial court Apr-13-2026, appealed to the Delaware Supreme Court May-2026 — unresolved, **no briefing/hearing/decision date disclosed** in the pool. (Separately, a Feb-2026 US Supreme Court IEEPA-tariff ruling already occurred and is not a forward catalyst — it opens a possible tariff-refund claim, undated) | Q2 FY26 10-Q, Note (Legal Proceedings), "Certain Derivative Lawsuits in Delaware"; `analyses/TSLA_2026-07-24/management-governance/05_board-and-shareholder-rights.md` §3 |
| Policy / government decision date | **N** | Regulatory-credit rollback and OBBBA tariff provisions are already-enacted policy pressures (automotive regulatory-credit revenue down 67% YoY in Q2 FY26), not forward-dated decisions. No specific future policy vote, hearing, or rule-effective date is disclosed in the pool | Q2 FY26 10-Q, Item 2 MD&A; `analyses/TSLA_2026-07-24/business-model/10_external-dependency.md` §1 |
| Operational event (launch / commissioning / contract) | **Partial — real but all soft windows, no hard dates** | Cybercab: production started, ramp ongoing (undated pace). Optimus: production "will soon start" (Q2 FY26 call, undated). Terafab (AI chip complex, Austin): "we expect to announce the location soon" — undated. Next-gen AI chip / AI5: "probably reaches production around the middle of next year [2027]" / AI5 "hopefully...volume production around the middle of next year" — both hedged, soft-window management commentary. Tesla Semi self-driving: "probably around the end of this year or early next year" — soft window. Robotaxi: expanded to 7 US markets, fleet ramp "expected to accelerate throughout the year" — no dated milestone | Q2 FY26 earnings call transcript (`Tesla-Inc.-Q2-2026-Earnings-Call-Jul-22-2026.txt`), prepared remarks and Q&A |
| Capital-return event (dividend / buyback) | **N** | Tesla has paid $0 in dividends and recorded $0 share buybacks every year since at least 2017; no announced or signaled change in policy | `analyses/TSLA_2026-07-24/business-model/11_capital-allocation-governance.md` (row: "Dividend policy & coverage") |
| Market-structure event (index review / lock-up) | **N** | No index-inclusion/exclusion review, lock-up expiry, or other market-structure event found anywhere in the pool or upstream modules | — |

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | Y (`analyses/TSLA_2026-07-24/earnings/`) | Next-results date context (Oct-21-2026, vendor-estimated), Q3 FY26 consensus setup, seasonality read tied to the Sep-30-2025 EV tax-credit cliff base effect — all inform the timing/magnitude of the next print but do not add a new dated event beyond §1 |
| balance-sheet-survival | Y (`analyses/TSLA_2026-07-24/balance-sheet-survival/`) | China Working Capital Facility refinancing window (Sep-2026–Mar-2027), RCF maturity (Jan-2028), Warehouse Agreement draw expiry (Mar-2027) — the single most concrete dated financial catalyst set in this pool |
| management-governance | Y (`analyses/TSLA_2026-07-24/management-governance/`) | 2026 AGM (event certain, date not yet set), Delaware Supreme Court derivative-suit appeal (pending, undated), classified-board/entrenchment structure (not itself a dated catalyst, but relevant context if a future proxy contest or declassification vote is scheduled) |
| valuation | Y (`analyses/TSLA_2026-07-24/valuation/`) | No dated re-rating trigger identified — `07_scenario-and-fair-value.md` frames the bull/bear split as "whether the market continues to price [unmonetized robotaxi/Optimus/FSD] optionality... or re-prices toward filed segment economics," explicitly calling this "a binary sentiment/narrative question this valuation module cannot resolve, only frame" — i.e., no proven date, only a thematic swing factor |
| business-model | Y (`analyses/TSLA_2026-07-24/business-model/`) | Policy/regulatory dependency detail (regulatory-credit rollback, tariffs — already-enacted, not forward-dated), external-dependency risk factors; no dated capital-return or M&A event found (`11_capital-allocation-governance.md` confirms zero buybacks/dividends, no signaled change) |

## 3. Triage Verdict

**Partial.**

The calendar can carry a small number of genuinely dated, evidenced financial events — the China Working Capital Facility's Sep-2026–Mar-2027 contractual refinancing window (63% of total debt, no disclosed binding replacement), the RCF's Jan-2028 maturity, and the Warehouse Agreement's Mar-2027 draw-expiry — plus one vendor-estimated (not yet company-confirmed) next-earnings date of Oct-21-2026. Beyond that, the pool is rich in real, evidenced forward-looking activity — Optimus and Cybercab production ramps, robotaxi city expansion, the Terafab chip-complex plan, Tesla Semi self-driving, next-gen AI chip timing, the 2026 AGM, and the Delaware Supreme Court derivative-suit appeal — but every one of these is a soft window or an event certain-to-occur-but-undated, not a hard date. Management's own language on the operational items ("we expect to announce...soon," "probably reaches production around the middle of next year," "hopefully," "end of this year or early next year") is explicitly hedged and should be recorded as vague timing, not proven. There is no capital-return event and no market-structure event in the pool at all. The 01_catalyst-calendar agent will be able to build a real (if short) table of proven-date financial catalysts, but the bulk of what makes this stock's narrative — robotaxi/Optimus/FSD scale-up — will read as thematic, not dated, and should be labeled accordingly rather than dressed up with false precision.

