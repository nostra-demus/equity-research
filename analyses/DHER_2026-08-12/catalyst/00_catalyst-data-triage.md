# Catalyst Data Triage — DHER

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | **Other — Germany.** Delivery Hero SE, a German Societas Europaea (SE), listed on the Frankfurt Stock Exchange Prime Standard (XTRA:DHER). Governed by German takeover law (WpÜG) and stock-corporation law (AktG) for the pending Uber tender offer. | FY24 Annual Report, cover/legal-entity data; `management-governance/05_board-and-shareholder-rights.md` (WpÜG Section 33 board-neutrality, AktG Section 118a virtual AGM, AktG Section 122, Section 327a squeeze-out) |
| Reporting standard (US GAAP / IFRS / Ind AS) | **IFRS as adopted by the EU** | FY24 Annual Report; `valuation/00_valuation-data-triage.md` |
| Reporting currency (and fiscal year-end) | **EUR**; fiscal year end **31-Dec** | FY24 Annual Report; Capital IQ workbook headers |
| Document language(s) | English (Annual Report, transcripts, Capital IQ exports all in English in this pool — no translation gap encountered) | Pool inspection |

Document map used: German takeover-offer mechanics (WpÜG tender offer, BaFin/EU merger-control review) and AktG general-meeting mechanics (AGM/EGM under Section 118a, squeeze-out under Section 327a, domination agreement ~75% threshold) stand in for US 8-K/DEF 14A-style scheduled-event documents. No US SEC forms apply to DHER itself; Uber Technologies (the acquirer) is a US SEC filer and its own M&A-call materials reference its Form 10-K, but that is Uber's disclosure regime, not DHER's.

## Language is not a data gap (CLAUDE.md §27)

All documents in the pool are in English; no translation issue arose. Not applicable beyond the note above.

## External data (frameworks/EXTERNAL_DATA.md)

No `data/DHER/external/` directory exists in this pool. No external documents to inventory. This does not affect the sufficiency verdict (external data never moves it in either direction).

## 1. Scheduled-Event Inventory

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | Y | FQ2 2026 (Apr–Jun 2026) earnings release, hard-dated **2026-08-27** (15 days from this report's date). FY2026 Adjusted EBITDA guidance range €910m–€960m, management steering to the upper half as of 2026-04-30. | `DeliveryHeroSEXTRADHEREstimatesReport.xls`, Guidance tab, header ("FQ2 2026 Earnings Release Date: Aug-27-2026"); `earnings/04_guidance-consensus.md §1`, `earnings/05_beat-miss-setup.md` |
| Debt maturity / refinancing date | Y | As-reported FY2025 schedule shows the 2026/2027 wall (Convertible Loan €86.1m matured 2026-03-09; Convertible Bonds III-A €55.7m matured 2026-04-30; Convertible Bonds I Tranche B €531.6m due 2027-01-23) — but this wall was **already pre-funded and repaid as a subsequent event** via a new USD 1.4bn term loan due 2032 (announced 2026-03-05, buybacks executed by 2026-04-30). Remaining dated maturities: Convertible Bonds II Tranche B €716.5m due 2028-01-15; Revolving Credit Facility (undrawn) matures 2028-05-01; Convertible Bonds III-B €480.9m due 2029-03-10; Dollar Term Facility €1,110.3m due 2029-12-01; KRW Term Facility €496.1m due 2029 (year-only, exact date not itemized); Convertible Bonds IV €717.6m due 2030-02-21. | `Delivery Hero SE XTRA DHER Financials.xls`, Capital Structure Details tab, FY2025 and FY2024 blocks; `balance-sheet-survival/02_maturity-wall-and-refinancing.md §1, §4` |
| AGM / EGM / record date | Partial | Last disclosed AGM: 19-Jun-2024 (say-on-pay 93.05% approval; board size increased 6→8). No 2025 or 2026 AGM date/agenda is in this pool. A future EGM/shareholder-vote event tied to the Uber tender offer is highly likely under German takeover procedure but no specific date is disclosed. | `management-governance/05_board-and-shareholder-rights.md §Findings (05-018, 05-019)`, FY24 Annual Report p.41 |
| Scheduled regulatory / legal decision | Y (window, not a hard date) | Uber's acquisition of DHER is explicitly conditioned on multi-jurisdiction merger-control approvals; Uber's CFO called the German takeover process "complex" with "several well-defined steps." No specific hearing/decision date disclosed — only the guided **close in H2 2027**. Separately, the EU Platform Work Directive (adopted Nov-2024) gives EU member states 24 months to transpose into national law — a policy deadline falling around **Nov-2026**, relevant to the €440m–€770m Spain rider-classification contingent liability. | `Uber Technologies, Inc., Delivery Hero SE – M&A Call, 2026-07-16` transcript, Q&A; `business-model/10_external-dependency.md §Government policy, §Regulation, §5` |
| Policy / government decision date | Y (window) | Same EU Platform Work Directive transposition deadline (~Nov-2026) as above; no single national vote/decision date disclosed. | `business-model/10_external-dependency.md §Regulation` |
| Operational event (launch / commissioning / contract) | Y (window) | Taiwan business disposal (agreed for **USD 600m**, per the Q1 2026 trading-statement call) guided to close in **H2 2026** — exact date within H2 not disclosed. Separately, management explicitly expects the Spain rider-employment transition to be fully annualized and to "translate into accelerated top-line growth in H2 2026" for the Europe segment (a stated management expectation, not a dated event). | `Delivery Hero SE, Q1 2026 Sales/Trading Statement Call, 2026-04-30`; `earnings/05_beat-miss-setup.md §FQ3 2026 setup`; `earnings/02_revenue-drivers.md §4` |
| Capital-return event (dividend / buyback) | N | Zero dividends and zero equity buybacks in every year FY2020–FY2025; no capital-return policy or schedule disclosed. (Talabat, an 80%-owned subsidiary, separately runs its own buyback of Talabat shares — a subsidiary-level, not DHER-level, event.) | `management-governance/02_capital-allocation-scorecard.md §3, §4` |
| Market-structure event (index review / lock-up) | Partial | Prosus/Naspers "irrevocably committed to tender its stake" into the Uber offer — a scheduled tender-mechanics event tied to the (undated) tender-offer document once launched, which would push Uber's economic ownership "to over 50%." No specific tender-launch or expiry date disclosed in this pool. Potential post-closing squeeze-out (AktG Section 327a, 95% threshold) or domination agreement (~75% AGM threshold) flagged as a live possibility, undated. | `Uber Technologies, Inc., Delivery Hero SE – M&A Call, 2026-07-16` transcript, Q&A; `management-governance/05_board-and-shareholder-rights.md §Verdict` |

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | Y | FQ2 2026 results date (2026-08-27, hard-dated), FY2026 guidance range, FQ3 2026 setup (Taiwan close, Spain rider-cost annualization) |
| balance-sheet-survival | Y | 2028–2030 maturity dates, already-executed 2026/2027 refinancing (subsequent event), 2029 maturity cluster flagged as unaddressed |
| management-governance | Y | 2024 AGM precedent (no 2025/2026 date disclosed), potential post-deal squeeze-out/domination-agreement mechanics, zero capital-return program |
| valuation | Y | Deal-contaminated current price flagged explicitly; no disclosed fixed offer price; base/bull/bear fair-value levels for the re-rating/de-rating trigger if the deal breaks or a price is disclosed |
| business-model | Y | Uber deal regulatory-approval dependency (H2 2027 guided close), EU Platform Work Directive transposition deadline (~Nov-2026), rider-classification litigation exposure |

## 3. Triage Verdict

**Sufficient.**

This pool carries an unusually rich, evidenced forward calendar, anchored by one dominant, live event: Uber Technologies' announced acquisition offer for Delivery Hero (disclosed 2026-07-16), with a guided close in H2 2027, Prosus/Naspers irrevocably committed to tender, and a >130% run-up in the stock (€15.73 pre-announcement to €37.20 current) that the valuation module has already flagged as deal-contaminated. Layered under that are: a hard-dated next earnings print (2026-08-27, 15 days out), a maturity schedule with exact dates out to 2030 (with the near-term 2026/2027 wall already refinanced as a disclosed subsequent event), a guided-but-undated Taiwan divestiture close (H2 2026, USD 600m), and a policy deadline (EU Platform Work Directive transposition, ~Nov-2026) tied to a real contingent liability (€440m–€770m Spain rider reclassification).

What is NOT proven: no fixed per-share offer price or tender-document timeline for the Uber deal was found anywhere in this pool; no 2025/2026 AGM date; no specific merger-control hearing/decision dates (only the guided H2 2027 close window); no exact date within H2 2026 for the Taiwan close; no exact 2029 date for the KRW Term Facility maturity. The calendar the next agent builds will therefore carry a mix of hard, proven dates (earnings, most bond maturities) and real-but-windowed events (deal close, Taiwan close, EU policy deadline) — it will not be purely thematic, but the single largest catalyst (the Uber deal itself) lacks a hard closing date and a disclosed offer price, which the calendar and synthesis agents must treat as "evidenced but timing partly vague," not manufacture false precision around.
