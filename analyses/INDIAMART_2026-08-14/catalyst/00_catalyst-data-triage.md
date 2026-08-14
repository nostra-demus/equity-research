# Catalyst Data Triage — INDIAMART

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | India — SEBI-LODR regime, listed NSE (INDIAMART) and BSE (542726) | `analyses/INDIAMART_2026-08-13/balance-sheet-survival/02_maturity-wall-and-refinancing.md`, header line; CIQ Public Company Profile extract, "Ticker: INDIAMART (NSEI)" |
| Reporting standard (US GAAP / IFRS / Ind AS) | Ind AS (Indian Accounting Standards, Companies Act 2013 Sec. 133), consolidated | `analyses/INDIAMART_2026-08-13/balance-sheet-survival/02_maturity-wall-and-refinancing.md`, header line |
| Reporting currency (and fiscal year-end) | INR; fiscal year ends 31 March (FY26 = year ended 31-Mar-2026) | Key Developments extract, "full year… ended March 31, 2026"; AGM Notice text, "financial year ended March 31, 2026" |
| Document language(s) | English throughout the pool (annual reports, interim reports, transcripts, CIQ exports, AGM/board-meeting notices) | Direct read of extracted filings and transcripts; no non-English source encountered in this pool |

For India / SEBI-LODR companies the local-equivalent scheduled-event documents are: board-meeting & results intimations to NSE/BSE (LODR Reg 29/33), AGM Notice + postal-ballot results, and Reg. 30 material-event disclosures (Key Developments). No US-form absence (8-K/10-K/DEF 14A) is treated as a gap — the local equivalents are present and used throughout this triage.

## Language is not a data gap (CLAUDE.md §27)

Not applicable here — every document in this pool is in English. No downgrade or flag required.

## External data (frameworks/EXTERNAL_DATA.md)

`data/INDIAMART/external/` does not exist in this pool — there are no externally sourced research documents (no alt-data panels, expert-call notes, channel checks, or broker research carrying a `provenance` sidecar). No `## 1A. External Data` table is added. This absence is not a gap: external data is enrichment only and never moves the sufficiency verdict (per instructions), and none was available to enrich this run either way.

No `_pool_extracts/ciq_facts.json` sidecar exists for this pool run (confirmed by direct listing) — all figures below are this agent's own sourced read of the CIQ workbook extracts and filings, consistent with the note already carried in the balance-sheet-survival module's maturity-wall agent.

## 1. Scheduled-Event Inventory

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | Partial (Y, but vendor-estimated, not yet company-confirmed) | Next quarter (FQ2 FY27, quarter ending 30-Sep-2026) earnings release is CIQ-modeled for **21-Oct-2026** based on the company's consistent quarterly cadence (results have landed within a few days of the 18th–30th of the month-after-quarter-end in every one of the last 5 years: Jul-21-2026, Apr-30-2026, Jan-20-2026, Oct-17-2025 actuals). No NSE/BSE board-meeting intimation for the Q2 FY27 results date has yet been filed as of 14-Aug-2026 — this is a strong pattern-based estimate, not yet a filed date. | `Events Calendar.xls` ("Estimated Earnings Release Date (CIQ Derived)," Jul-17-2026 row shows the same estimate class used for the just-reported quarter, confirming the method); `earnings/04_guidance-consensus.md` §1, "the 'Current Quarter' column in the Consensus tab is FQ2 2027… release date Oct-21-2026" |
| Debt maturity / refinancing date | N | IndiaMART carries **zero bank borrowings, bonds, term loans, or revolver** — its only "debt" is Ind AS 116 lease liabilities (₹231.02mn at FY26-end), a trivial, non-market-facing schedule. No refinancing event of any real size exists on the calendar. | `analyses/INDIAMART_2026-08-13/balance-sheet-survival/02_maturity-wall-and-refinancing.md` §1, §4, §5 |
| AGM / EGM / record date | Partial (Y for the just-completed FY26 cycle; N for a forward date) | The FY26 AGM was held 29-Jun-2026 (already in the past relative to today, 14-Aug-2026); record date for the FY26 dividends was 19-Jun-2026 (also past). No FY27 AGM date has yet been announced — under the Companies Act, the next AGM must occur within 6 months of FY27 year-end (31-Mar-2027), i.e. by ~Sep-2027, but no specific date is filed yet. | `Key Developments.xls` — "Annual General Meeting, Jun 29, 2026… to consider declaration of a final dividend of INR 30… and a special dividend of INR 30"; no forward AGM-date filing found in the pool |
| Scheduled regulatory / legal decision | Partial (Y, event exists; N, no date) | Board approved incorporation of a wholly-owned NBFC-adjacent subsidiary, **IndiaMART Finance Limited**, on 21-Jul-2026, "subject to necessary approvals" from the Ministry of Corporate Affairs and other statutory/regulatory authorities. No completion date is disclosed. | `Key Developments.xls`, "Business Expansions" entry dated 2026-07-21 |
| Policy / government decision date | N | Government MSME/GST/Udyam policy is cited by management as a demand tailwind (and, symmetrically, a risk if it reverses), but this is a standing thematic dependency, not a dated scheduled decision (no budget date, no scheduled GST Council ruling tied to this name). | `analyses/INDIAMART_2026-08-13/business-model/10_external-dependency.md`, rows on Government policy and Regulation |
| Operational event (launch / commissioning / contract) | Partial (Y, qualitative windows only) | Busy Infotech segment: management targets "27% to 30%" revenue CAGR over the "next couple of years" and 15–20% license-count growth over the "immediate year or 2" — both qualitative, undated windows, not fixed milestones. Core-platform supplier net-adds are expected to keep declining for "2, 3 quarters" before recovering. | `analyses/INDIAMART_2026-08-13/earnings/04_guidance-consensus.md` §2 |
| Capital-return event (dividend / buyback) | Partial (Y for the just-completed FY26 cycle; N forward) | FY26 final dividend (₹30/share) + special dividend (₹30/share) = ₹60/share, ex-date/record date 19-Jun-2026, paid 29-Jul-2026 — already executed. No buyback has run since Sep-2023 despite the treasury book growing ~₹8.6bn since. No forward-dated capital-return event is scheduled; the next dividend decision is tied to the (not-yet-scheduled) Q4 FY27 board meeting, expected on the same annual cadence (~late Apr-2027) as a base-rate inference, not a filed date. | `Key Developments.xls`, "Special Dividend Announced… Apr 30, 2026"; `analyses/INDIAMART_2026-08-13/management-governance/02_capital-allocation-scorecard.md` §4, row 02-010 |
| Market-structure event (index review / lock-up) | N | No index-inclusion/exclusion review, lock-up expiry, or ADR/listing-change event found in the pool. | Absence confirmed across `Public Ownership Summary.rtf`, `Public Company Profile.rtf`, `Events Calendar.xls` |

## 1A. Recurring investor-conference calendar (context, not a catalyst in itself)

The Events Calendar shows a dense forward schedule of sell-side investor-conference presentations (Kotak Chasing Growth, IIFL Enterprising India, 360 ONE/B&K Trinity India, ICICI Securities, InsightX, Equirus Annual India Conference, Aug-12-2026 with a company presentation Aug-14-2026) running through the second half of 2026 [`Events Calendar.xls`]. These are recurring management-visibility events, not catalysts in the CLAUDE.md §17 sense (no new information is scheduled to be disclosed there beyond what is already public) — flagged here for completeness, not counted as a scheduled catalyst.

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | Y (`analyses/INDIAMART_2026-08-13/earnings/`, full 00–99 set) | Next-results timing (FQ2 FY27, ~21-Oct-2026 estimated), consensus revision momentum, no formal company guidance to anchor a guidance-vs-consensus catalyst |
| balance-sheet-survival | Y (`analyses/INDIAMART_2026-08-13/balance-sheet-survival/`, full 00–99 set) | Confirms no refinancing/rating/covenant catalyst exists — the company is debt-free apart from trivial lease liabilities |
| management-governance | Y (`analyses/INDIAMART_2026-08-13/management-governance/`, full 00–99 set) | Completed FY26 AGM/capital-return cycle, board-refreshment history, one high-dissent postal-ballot resolution (RF-SHR-001, 21.7% against on an RPT appointment) — governance signal, not a forward-dated catalyst |
| valuation | Y (`analyses/INDIAMART_2026-08-14/valuation/`, full 00–99 set) | Reverse-DCF anchors an implied steady-state margin (25.76%) against peer/trough ranges — a valuation reference point, not itself a dated re-rating trigger; no dated re-rating event identified in `05_reverse-dcf.md` |
| business-model | Y (`analyses/INDIAMART_2026-08-13/business-model/`, full 00–99 set) | Government MSME/GST policy tailwind (thematic, undated), supplier-churn recovery window ("2–3 quarters," qualitative), Busy Infotech segment CAGR targets (qualitative, undated) |

## 3. Triage Verdict

**Partial.**

The data pool contains a genuinely dense, well-evidenced record of *past* scheduled events (five years of board meetings, earnings calls, an AGM, ex-dividend/record dates, and buybacks, all dated and sourced) — but almost all of that record sits behind today's date (14-Aug-2026). Looking forward from today, exactly one dated item exists with real evidentiary weight: the next earnings release, and even that is a CIQ-modeled estimate (~21-Oct-2026) built from a consistent historical cadence rather than a company- or exchange-filed board-meeting intimation, which has not yet been issued for this quarter. Every other forward-looking item found — the pending MCA approval for the new IndiaMART Finance Limited subsidiary, the Busy Infotech segment growth targets, the supplier-churn recovery timeline, the next AGM/dividend cycle — carries a real, evidenced basis but only a soft, qualitative window ("next couple of years," "2–3 quarters," "subject to necessary approvals"), not a hard date. There is no refinancing catalyst (the company is debt-free) and no scheduled regulatory/policy decision date.

The calendar-builder agent (`01_catalyst-calendar`) will be able to carry one semi-proven near-term date (the estimated next-results window) plus several honestly-labelled soft-window catalysts (subsidiary approval, segment growth targets, churn-recovery timing, the annual capital-return cycle) — it should not manufacture proven dates where the pool only supports vendor-derived estimates or qualitative management commentary. This is a data set that supports a real but mostly-soft-window calendar, not a set of hard, exchange-confirmed dated triggers beyond the single next-earnings estimate.
