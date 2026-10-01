# Catalyst Data Triage — BURL

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | US SEC; NYSE-listed common stock (BURL) | [Q2 FY2026 Form 10-Q, cover, filed 2026-08-27] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | [Q2 FY2026 Form 10-Q, Note 1 — Basis of Presentation, filed 2026-08-27] |
| Reporting currency (and fiscal year-end) | USD; fiscal year is the 52- or 53-week period ending on the Saturday closest to January 31. Fiscal 2026 ends January 30, 2027. | [Q2 FY2026 Form 10-Q, Note 1 — Fiscal Year, filed 2026-08-27] |
| Document language(s) | English | [Q2 FY2026 Form 10-Q, cover and Note 1, filed 2026-08-27] |

Set these so later agents read US SEC documents and NYSE disclosures, rather than treating local-equivalent documents as absent.

## Language is not a data gap (CLAUDE.md §27)

All reviewed primary disclosures and transcripts are in English. The frozen generation contains 30 source documents, 58 workbook tabs, and 13 non-workbook extracts; every manifest-listed extract resolves inside the immutable generation and none is marked failed. There are no `external: true` documents. Language therefore creates no evidence gap, and no external research changes this triage verdict. [Frozen evidence generation manifest, generation `fc90a997…b26f766`, sources and sheets inventory]

## 1. Scheduled-Event Inventory

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | Y | Company Q3 FY2026 is a standalone 13-week period ending October 31, 2026. Management said it expects to discuss Q3 results in November; the CIQ calendar lists November 25, 2026 only as an **estimated / derived** release date, not a company-confirmed date. Q3 guidance is sales +9% to +11%, comparable-store sales +1% to +3%, and Adjusted EPS $1.60–$1.70 versus $1.80 a year earlier. | [Q2 FY2026 earnings release, Outlook, 2026-08-27] [Q2 FY2026 earnings call, closing remarks, 2026-08-27] [Capital IQ Events Calendar export, Events Calendar sheet, 2026 — estimated date] |
| Debt maturity / refinancing date | Y | $186.1m of 1.25% convertible notes mature December 15, 2027; the ABL commitments mature July 25, 2030 and the $1,721.8m Term Loan Facility matures September 24, 2031. No refinancing, tender, or rating-action date is announced. | [Q2 FY2026 Form 10-Q, Note 4 — Long-Term Debt, pp. 12–14] |
| AGM / EGM / record date | Y | The May 19, 2026 AGM and March 25 record date are past. The proxy does not set a 2027 AGM date, but it sets forward shareholder deadlines: November 3–December 3, 2026 for proxy-access nominations, December 3 for Rule 14a-8 proposals, January 19–February 18, 2027 for other meeting business, and March 20, 2027 for universal-proxy notice. These are governance filing deadlines, not a confirmed meeting date. | [FY2026 DEF 14A, Notice of Annual Meeting; Stockholder Proposals and Nominations for 2027 Annual Meeting] |
| Scheduled regulatory / legal decision | N | Legal and regulatory matters are disclosed as being at various procedural stages; no hearing, judgment, licence, or regulator-decision date is supplied. | [Q2 FY2026 Form 10-Q, Item 1 — Legal Proceedings] |
| Policy / government decision date | N | The filings disclose past IEEPA tariff refunds and a historical 150-day Section 122 tariff reference, but do not establish a current government decision, hearing, rate, exemption, or effective date as of September 29, 2026. | [FY2025 Form 10-K, Note 15 — Subsequent Events] [Q2 FY2026 Form 10-Q, Tariff Refunds] |
| Operational event (launch / commissioning / contract) | Y | The company plans approximately 115 net new stores and about $875m of net capital expenditure in FY2026, ending January 30, 2027. The 115-store target is a fiscal-year window; individual opening, Savannah distribution-centre ramp, and marketing-programme dates are not disclosed. | [Q2 FY2026 earnings release, Outlook, 2026-08-27] [Q2 FY2026 earnings call, prepared remarks and Q&A, 2026-08-27] |
| Capital-return event (dividend / buyback) | Y | $218m remained under the share-repurchase authorization at August 1, 2026; the authorization runs through May 20, 2027. The company disclosed no scheduled repurchase tranche and does not expect a dividend in the near term. | [Q2 FY2026 Form 10-Q, Item 2 — Share Repurchase Program and Dividends, pp. 30–31] |
| Market-structure event (index review / lock-up) | N | No index review, lock-up expiry, listing change, or dated share-count event appears in the frozen pool. The short-interest workbook is an observation, not a scheduled event. | [Frozen evidence generation manifest, generation `fc90a997…b26f766`, complete source and tab inventory] |

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | Y | November Q3 results window, Q3 guidance, tariff-refund reinvestment, weather and margin tests. [analyses/BURL_2026-09-29/earnings/04_guidance-consensus.md, §§0–2] [analyses/BURL_2026-09-29/earnings/05_beat-miss-setup.md, §§1–5] |
| balance-sheet-survival | Y | December 2027 convert maturity and the absence of an announced refinancing event. [analyses/BURL_2026-09-29/balance-sheet-survival/02_maturity-wall-and-refinancing.md, §§1–5] |
| management-governance | Y | 2027 annual-meeting submission deadlines, board declassification completion, buyback and dividend-policy monitoring. [analyses/BURL_2026-09-29/management-governance/05_board-and-shareholder-rights.md, §§1–4] [analyses/BURL_2026-09-29/management-governance/02_capital-allocation-scorecard.md, capital-return sections] |
| valuation | Y | Whether Q3 and second-half execution validates the cash-flow and margin assumptions implicit in the share price. [analyses/BURL_2026-09-29/valuation/05_reverse-dcf.md, §§2–5] [analyses/BURL_2026-09-29/valuation/07_scenario-and-fair-value.md, scenarios] |
| business-model | Y | Late-September-through-fall weather, tariff-policy exposure, and store-rollout execution. [analyses/BURL_2026-09-29/business-model/10_external-dependency.md, §§1–5] [analyses/BURL_2026-09-29/business-model/11_capital-allocation-governance.md, capital-allocation table] |

## 3. Triage Verdict

**Partial.** The calendar can carry a defined Q3 reporting period (ending October 31) and a management-confirmed November results window, quantified Q3 and full-year guidance, a FY2026 store-rollout window, a buyback authorization through May 2027, and dated debt maturities. It cannot treat November 25 as a proven company release date: it is vendor-derived. There is also no scheduled regulatory or policy decision, no confirmed 2027 AGM date, no announced buyback execution date, and no announced refinancing timetable. The downstream calendar should distinguish proven dates from soft windows and must not elevate an undated thematic risk into a catalyst.
