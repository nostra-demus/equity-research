# Catalyst Data Triage — GOOGL

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | United States SEC; GOOGL Class A common stock is listed on Nasdaq Global Select Market. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026, cover, filed 2026-10-29] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026, Note 1] |
| Reporting currency (and fiscal year-end) | USD; fiscal year ends 31 December. The next annual release concerns FY2026. | [data/GOOGL/Alphabet_Inc_-_Form_10-Q(Oct-29-2026).doc, Q3 FY2026, Note 1]; [Capital IQ Estimates Report — Consensus, data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls, header, frozen 2026-11-03] |
| Document language(s) | English for the filings, proxy material, transcripts, and vendor extracts reviewed. | [Frozen evidence generation manifest, source inventory, 2026-11-03] |

## Language is not a data gap (CLAUDE.md §27)

All reviewed catalyst documents are in English. The frozen generation contains 27 source files and 72 manifest-indexed extracted documents or workbook tabs; every source is marked `ok`, and the scheduled-event scan covered every indexed extract. No extraction failure is recorded. There are no documents under `data/GOOGL/external/`, so no external-data row or freshness comparison applies and external research did not affect this verdict. [Frozen evidence generation manifest, source inventory, 2026-11-03]

## 1. Scheduled-Event Inventory

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | Y | FY2026 results release is scheduled for **2 February 2027**. This is a Capital IQ calendar field, not an issuer-announced date in the supplied filing; it is a vendor-scheduled date. The event will include the standalone Q4 2026 result and full-year FY2026 reporting. | [Capital IQ Estimates Report — Consensus, data/GOOGL/AlphabetIncNasdaqGSGOOGLEstimatesReport.xls, header, frozen 2026-11-03] |
| Debt maturity / refinancing date | Y | **April 2027**: $4.0bn of undrawn revolving credit facilities expires. The filing also shows a $1.016bn current note portion, but does not give its payment date; it is not presented as a separate dated event. | [Q3 FY2026 Form 10-Q, Note 6 (Credit Facility), pp. 26–27]; [analyses/GOOGL_2026-11-03/balance-sheet-survival/02_maturity-wall-and-refinancing.md, §§1–2] |
| AGM / EGM / record date | N | No future AGM/EGM or shareholder-meeting record date is in the frozen pool. The June 2026 DEFA14A is additional material, not a definitive proxy or a future meeting notice. | [Frozen evidence generation manifest, source inventory, 2026-11-03]; [analyses/GOOGL_2026-11-03/management-governance/05_board-and-shareholder-rights.md, §4B] |
| Scheduled regulatory / legal decision | N | Search, ad-tech, EC ad-tech, and DMA appeals or remedies are active, but the filing gives no future hearing or decision date. The state-attorneys-general ad-tech trial follows the DOJ remedies proceedings, with no date supplied. | [Q3 FY2026 Form 10-Q, Note 10 (Legal Matters)]; [analyses/GOOGL_2026-11-03/management-governance/12_regulatory-legal-and-compliance.md, §1] |
| Policy / government decision date | N | No dated, programme-specific policy or government decision is established. The available disclosures describe exposure to tariffs, export controls, and market-access rules, not a scheduled policy event. | [analyses/GOOGL_2026-11-03/business-model/10_external-dependency.md, §§1 and 1A] |
| Operational event (launch / commissioning / contract) | Y | Google TPU availability through Oracle Cloud Infrastructure is stated as **calendar 2027**, with multi-year ramping; this is a window, not a launch date. Management also said TPU-system revenue should scale through Q4 and ramp more meaningfully in 2027. | [Capital IQ Key Developments — 2026-10-27, data/GOOGL/Alphabet Inc NasdaqGS GOOGL Key Developments.xls — vendor export]; [Q3 FY2026 earnings call, Q&A, 2026-10-28] |
| Capital-return event (dividend / buyback) | Y | Preferred-stock dividend of $15.63 per preferred share (about $0.78 per depositary share) is payable **15 November 2026**; its 1 November record date has passed. Common dividend of $0.22 per Class A/B/C share has a **7 December 2026** record date and is payable **14 December 2026**. The $69.5bn remaining buyback authorization has no expiry or execution date, so it is not a scheduled event. | [Q3 FY2026 Form 10-Q, Note 11 (Preferred and Common Dividends; Share Repurchases), p. 37] |
| Market-structure event (index review / lock-up) | N | No index review, lock-up expiry, listing change, or other dated market-structure event is identified. The at-the-market programme may be used from time to time, so it does not supply a testable date. | [Q3 FY2026 Form 10-Q, Note 11 (At-the-Market Program)] |

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | Y | 2 February 2027 results event; Q4 consensus revenue of $142.319bn and qualitative management guidance identify the print's key tests. | [analyses/GOOGL_2026-11-03/earnings/04_guidance-consensus.md, §§1A–3]; [analyses/GOOGL_2026-11-03/earnings/99_earnings-synthesis.md, §§5 and 7] |
| balance-sheet-survival | Y | April 2027 revolver expiry and the unpriced current debt portion. It also establishes that the filing does not disclose a usable annual 2027 maturity wall. | [analyses/GOOGL_2026-11-03/balance-sheet-survival/02_maturity-wall-and-refinancing.md, §§1–4] |
| management-governance | Y | Legal-remedy and appeal monitoring, capital-allocation checks, and the absence of a supplied future shareholder-meeting notice. | [analyses/GOOGL_2026-11-03/management-governance/12_regulatory-legal-and-compliance.md, §1]; [analyses/GOOGL_2026-11-03/management-governance/05_board-and-shareholder-rights.md, §4B] |
| valuation | Y | Re-pricing test: evidence that AI capacity converts to post-build free cash flow, or evidence that it does not. This is a condition, not a dated event. | [analyses/GOOGL_2026-11-03/valuation/05_reverse-dcf.md, §§3–5]; [analyses/GOOGL_2026-11-03/valuation/07_scenario-and-fair-value.md, §§3–6] |
| business-model | Y | Regulatory, policy, AI-capacity, and commitment-return monitoring. The input identifies no dated policy decision. | [analyses/GOOGL_2026-11-03/business-model/10_external-dependency.md, §§1–3]; [analyses/GOOGL_2026-11-03/business-model/99_business-model-synthesis.md, §§1 and 4] |

## 3. Triage Verdict

**Sufficient.** The calendar can carry several evidenced dates or bounded windows: 15 November and 14 December 2026 dividends, the vendor-scheduled 2 February 2027 FY2026 results release, the April 2027 revolver expiry, and a calendar-2027 TPU deployment window. The first two and the revolver expiry are filing-supported; the results date and Oracle TPU timing are vendor-supplied and must retain that qualifier. There is no dated AGM, regulatory decision, policy action, or market-structure event in the available evidence. The downstream calendar should therefore distinguish proven filing dates from the vendor date and soft 2027 operational window; it will not be merely thematic.
