# Catalyst Data Triage — ORCL

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | United States — NYSE, SEC filer | 10-K cover page: "Oracle Corporation … Delaware … Austin, Texas … Common Stock … ORCL … New York Stock Exchange" [FY26 10-K, cover page] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | [FY26 10-K, Note 1 (Basis of Presentation)]; confirmed by `earnings/00_earnings-data-triage.md` §0 |
| Reporting currency (and fiscal year-end) | USD; fiscal year ends May 31 (FY2026 = year ended 2026-05-31; FY2027 = year ending 2027-05-31) | [FY26 10-K, cover page and financial statements] |
| Document language(s) | English throughout the pool (10-K, 10-Q, earnings calls, CIQ workbooks) | Own read of `_pool_extracts/manifest.md` — all 21 top-level sources, no non-English filings present |

Standard US SEC filer — 10-K is the audited annual filing, 10-Q/press release is the interim disclosure, 8-K-equivalent role for material events is filled by press releases and Key Developments entries. No jurisdiction-mapping issue. Section 27's local-equivalent document map is not needed here; US form names are used as themselves, not as examples.

## Language is not a data gap (CLAUDE.md §27)

Not applicable — every document in the pool is in English. No language-based gap or downgrade to record.

## External data (frameworks/EXTERNAL_DATA.md)

`data/ORCL/external/` does not exist — no externally sourced research (alt-data panels, expert calls, channel checks, broker notes) is present in this run. No External Data section is added; this has no effect on the sufficiency verdict (external data is enrichment only, never a filing substitute, and its absence is never a gap).

## 1. Scheduled-Event Inventory

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | Y | FQ1 FY2027 earnings release, **2026-09-04** (~3 weeks from this report's date); FQ1 FY2027 revenue guidance +27–29% CC/USD ($18,956M–$19,255M), Non-GAAP EPS $1.72–$1.76; FY2027 full-year guide $90,000M revenue / $8.05 Non-GAAP EPS (reaffirmed/raised) | `Oracle Corporation NYSE ORCL Events Calendar.xls` ("Earnings Release Date," Sep-04-2026 shown as "Estimated Earnings Release Date (CIQ Derived)"); Oracle Q4 FY26 Earnings Press Release, 2026-06-10, "Guidance for Q1 FY 2027" and "Guidance for Full FY 2027"; cross-referenced in `earnings/04_guidance-consensus.md` §1 and `earnings/05_beat-miss-setup.md` |
| Debt maturity / refinancing date | Y | Full instrument-level maturity schedule through FY2032+, e.g. 2.65% Senior Notes due Jul-2026 ($3,000mn), 2.80% Senior Notes due Apr-2027 ($2,250mn), Term Loan Credit Agreement 2 final maturity 2027-08-16; $7,210mn due within 12 months (FY2027), $17,355mn within 24 months; S&P downgraded issuer rating to BBB− on 2026-07-09 (already occurred — sets the trajectory for any further rating action) | `balance-sheet-survival/02_maturity-wall-and-refinancing.md` §1–3, sourced to [FY26 10-K, Note on Debt, "Future principal payments"]; S&P downgrade dated in `Oracle Corporation NYSE ORCL Key Developments.xls`, 2026-07-09 entries |
| AGM / EGM / record date | Y (date proven; underlying proxy document not yet filed) | Annual General Meeting listed **2026-08-25** (~11 days from this report's date) | `Oracle Corporation NYSE ORCL Events Calendar.xls`, "Annual General Meeting" row. Caveat: as of 2026-08-14, no 2026 DEF 14A proxy is in the data pool — the 10-K states it will be filed within 120 days of the 2026-05-31 fiscal year-end [FY26 10-K, Part III]; `management-governance/05_board-and-shareholder-rights.md` flags this as a genuine primary-source gap, not yet resolved |
| Scheduled regulatory / legal decision | Y | Netherlands Privacy Class Action (GDPR / Dutch Telecommunications Act, The Privacy Collective vs. Oracle Nederland B.V. et al.) — Dutch Supreme Court judgment was scheduled for **2026-06-28**; that date has passed as of this report (2026-08-14) with no outcome recorded anywhere in the pool — an overdue, unresolved, live decision that could land at any time. Separately, the OCI-growth securities class action (D. Delaware, filed 2026-02-03) is pre-motion-to-dismiss, timing not yet scheduled | `balance-sheet-survival/05_off-balance-sheet-and-contingencies.md`, sourced to [FY26 10-K, Note 15 (Legal Proceedings), "Netherlands Privacy Class Action"]; `management-governance/red_flags.csv`, RF-MGT-005 (securities class action, no ruling date yet) |
| Policy / government decision date | Y (date not yet fixed — pending) | FERC gas-pipeline order needed for the Doña Ana, New Mexico "Project Jupiter" data-center site — Oracle asked FERC to expedite the order because "the power plant that will generate electricity for the data center campus cannot function" without it; no specific decision date disclosed | `business-model/10_external-dependency.md`, sourced to [FY26 10-K pool — Key Developments, 2026-05-05 FERC filing] |
| Operational event (launch / commissioning / contract) | Y | $260,000mn of additional data-center lease commitments (15–19-year terms) generally commencing **Q1 FY2027 through FY2029**; a $3.3bn direct guarantee of a lessor's borrowing maturing **September 2026** | `balance-sheet-survival/05_off-balance-sheet-and-contingencies.md`, sourced to [FY26 10-K, Note 9] |
| Capital-return event (dividend / buyback) | Y | Quarterly ex-dividend dates recur on a set cadence — 2026-01-09, 2026-04-09, 2026-07-10 already occurred; next ex-div date (~early Oct 2026) not yet listed in the pool's Events Calendar but follows the same ~quarterly pattern. $6.3bn of buyback authorization remained unused as of 2026-05-31 (no forward date attached — RF-CAP-002 flags buybacks as functionally halted). Capital financing plan: ~$40bn debt + equity raise planned for FY2027, including the previously announced $20bn at-the-market equity issuance (no specific date, management states no additional debt expected in calendar 2026) | `Oracle Corporation NYSE ORCL Events Calendar.xls` (Ex-Div Date rows); `management-governance/02_capital-allocation-scorecard.md` §3; `earnings/04_guidance-consensus.md` row 26 (capital financing plan, sourced to Q4 FY26 earnings call, 2026-06-10, CFO prepared remarks) |
| Market-structure event (index review / lock-up) | N | No index-inclusion/exclusion, lock-up expiry, or ADR/listing-change event found in the pool | — |

**Additional dated items outside the checklist categories, worth flagging for the calendar-building agent:**
- $5.0bn Mandatory Convertible Preferred Stock, convertible into common stock by **2029-01-15** [`management-governance/02_capital-allocation-scorecard.md` §3, referencing FY26 10-K].
- Two co-CEOs (Magouyrk, Sicilia) took office **2025-09-22** — already occurred, relevant as a "first full guidance cycle" marker rather than a forward catalyst; the incoming permanent CFO (Hilary Maxson) started **2026-04-06**, so FQ1 FY2027 (2026-09-04) will be her first quarterly print as permanent CFO [`management-governance/01_management-and-track-record.md`, findings 01-004, 01-005].
- FQ2 FY2027 (quarter ending ~Nov-30-2026) will lap FQ2 FY2026's one-time $2,493mn pre-tax Ampere Computing gain — a known year-over-year GAAP comparison distortion for whichever date FQ2 FY2027 is eventually confirmed; no specific FQ2 FY2027 release date is yet in the pool beyond the general quarterly cadence [`earnings/05_beat-miss-setup.md`].

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | Y (`analyses/ORCL_2026-08-14/earnings/`, `99_earnings-synthesis.md` present) | Next-results date (2026-09-04), guidance bands, the specific bull/bear triggers already built in `05_beat-miss-setup.md` (e.g. gross-margin step-down magnitude, RPO conversion pace) |
| balance-sheet-survival | Y (`analyses/ORCL_2026-08-14/balance-sheet-survival/`, `99_balance-sheet-survival-synthesis.md` present) | Full maturity wall, the S&P downgrade trajectory, the ~$40bn FY2027 financing plan, the Netherlands GDPR ruling as a contingent-liability catalyst |
| management-governance | Y (`analyses/ORCL_2026-08-14/management-governance/`, `99_management-governance-synthesis.md` present) | AGM date (2026-08-25, pending proxy), buyback/dividend program status, the securities class action (RF-MGT-005), CFO transition |
| valuation | Y (`analyses/ORCL_2026-08-14/valuation/`, `99_valuation-synthesis.md` present) | Re-rating trigger already framed in `05_reverse-dcf.md` and `07_scenario-and-fair-value.md`: whether the $638bn RPO backlog converts to cash-generative revenue on schedule is the dominant swing factor between the $212.67 Bull and the $31.44 headline Bear |
| business-model | Y (`analyses/ORCL_2026-08-14/business-model/`, `99_business-model-synthesis.md` present) | Policy catalyst (FERC pipeline order for Project Jupiter), commodity/physical-input catalyst (GPU and power supply), capital-return status, the $260bn lease-commencement schedule |

All five upstream modules ran and produced synthesis files in this run — none are missing.

## 3. Triage Verdict

**Sufficient.**

The data pool and upstream modules together carry a genuinely dated, evidenced forward calendar, not just a thematic story. The strongest proven-date items: the next earnings release (2026-09-04, guidance already issued for both the quarter and the full year), the AGM (2026-08-25, though the underlying proxy is not yet filed — a real gap on substance, not on the date itself), a fully disclosed instrument-level debt maturity schedule (specific bonds by month and year through FY2032+), and an overdue, unresolved Dutch Supreme Court ruling (originally scheduled 2026-06-28, still pending as of 2026-08-14) that could land at any time with a real, if unquantified, financial exposure. Several other items are real but carry only a window, not a hard date: the FERC pipeline decision for Project Jupiter, the ~$40bn FY2027 financing plan (including the $20bn ATM equity program), and the $260bn lease-commitment commencement schedule (Q1 FY2027–FY2029, not a single date). The calendar-building agent (`01_catalyst-calendar`) will be able to anchor most of its high-conviction rows on proven dates rather than vague windows, while correctly labeling the FERC decision, the ATM program timing, and the securities-class-action ruling as windowed/vague per the module's proven-vs-vague distinction.

