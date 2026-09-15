# Catalyst Data Triage — AKAM

Frozen-pool scan: 16 source documents, all with `status: ok`, and all 49 file/tab extracts were scanned. The pool includes the FY2025 Form 10-K, Q2 2026 Form 10-Q, Q2 release and call, recent conference transcripts, and Capital IQ workbooks. No manifest row is external, and the relationship graph is empty; neither affected this triage verdict. [Frozen generation manifest, 2026-09-14, sources and sheets; relationships graph, 2026-09-14]

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Listing jurisdiction (US SEC / India SEBI-LODR / UK / Other) | US SEC; common stock trades on Nasdaq Global Select Market as AKAM. | [FY2025 Form 10-K, cover page and Item 5] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP. | [Q2 2026 Form 10-Q, cover page; Q2 2026 earnings release, Use of Non-GAAP Financial Measures] |
| Reporting currency (and fiscal year-end) | USD; calendar fiscal year ending 31 December. | [FY2025 Form 10-K, cover page; Q2 2026 earnings release, Financial guidance, p.2] |
| Document language(s) | English. | [Frozen generation manifest, 2026-09-14, sources and extracts] |

## Language is not a data gap (CLAUDE.md §27)

All 16 source documents and 49 exact file/tab extracts in the frozen generation are English and extracted successfully. This is a descriptive record, not a source-tier adjustment: a non-English filing would remain present at its full source tier. No extraction failure was recorded. [Frozen generation manifest, 2026-09-14, `sources[].status`]

## 1. Scheduled-Event Inventory

| Category | Present? (Y/N) | What / When | Source |
|---|---|---|---|
| Next results / guidance date | Y | Q3 2026 ends **30 Sep 2026**. Capital IQ lists the expected Q3 earnings release / Form 10-Q date as **3 Nov 2026**; this is a tier-5 vendor calendar date, not a company-confirmed publication date. Company guidance is Q3 revenue of $1.105bn–$1.130bn and non-GAAP EPS of $1.60–$1.80. | [Q2 2026 earnings release, Financial guidance, p.2; Capital IQ Estimates Report, Consensus worksheet header, frozen 2026-09-14 — vendor] |
| Debt maturity / refinancing date | Y | **$1.150bn** principal of 0.375% 2027 convertible notes matures **1 Sep 2027** (within 12 months of the run date). The CIQ vendor read is $1.1469bn; the $3.1m difference is immaterial and reconciles to the filing’s $1.147874bn carrying amount net of issuance costs, while the filing’s contractual principal controls. | [Q2 2026 Form 10-Q, Note 7 (Debt), pp.17–20; CIQ Financials→Capital Structure Details, latest as-reported block — vendor, source-bound `ciq_facts.json`] |
| AGM / EGM / record date | N | No 2026 proxy, annual-meeting notice, EGM notice, or future record date appears in the frozen pool. The FY2025 10-K incorporates the 2026 proxy for some governance disclosure, but that proxy is absent. | [FY2025 Form 10-K, Items 12–13, p.95; Frozen generation manifest, 2026-09-14, source inventory] |
| Scheduled regulatory / legal decision | N | No dated hearing, approval, enforcement decision, or litigation milestone was identified. The Q2 filing describes routine matters and does not expect them to be material. | [Q2 2026 Form 10-Q, Item 1 (Legal Proceedings), p.45] |
| Policy / government decision date | N | The FY2025 filing cited significant EU AI Act provisions scheduled for August 2026, but that date has passed and the frozen pool has no post-August primary update or future policy-decision date. | [FY2025 Form 10-K, filed 2026-02-20, Risk Factors—Other regulatory developments, p.22; business-model/10_external-dependency.md, §1A] |
| Operational event (launch / commissioning / contract) | Y | As disclosed on **6 Aug 2026**, year-to-date Cloud Infrastructure Services contracts exceeded $2.8bn, including a new-customer contract worth more than $600m over four years. This supports a future delivery/ramp watchpoint, but no contract start, deployment, launch, or commissioning date is disclosed. | [Q2 2026 earnings release, p.1] |
| Capital-return event (dividend / buyback) | Y | The $2.0bn share-repurchase authorization runs through **June 2027**; $564.8m remained at 30 Jun 2026. This is an authorization end date, not a commitment to buy a stated amount on a stated date. Akamai does not expect a cash dividend in the foreseeable future. | [Q2 2026 Form 10-Q, Note 9 (Stockholders’ Equity), p.22; FY2025 Form 10-K, Item 5 and Risk Factors—Dividends] |
| Market-structure event (index review / lock-up) | Y | The 2027 notes’ contractual conversion date is **1 May 2027**, ahead of the **1 Sep 2027** maturity; holders may convert at any time on or after that date until shortly before maturity. This is not a scheduled equity issuance—settlement and conversion remain subject to the note terms. No index-review or lock-up date was found. | [Q2 2026 Form 10-Q, Note 7 (Conversion Rights of the Notes), pp.17–18] |

## 2. Upstream Modules Available

| Module | Output present? (Y/N) | Catalyst it can feed |
|---|---|---|
| earnings | Y | Q3 results date and guide, consensus bar, GPU/CIS deployment timing, and Q4 CIS-ramp commentary. [earnings/04_guidance-consensus.md; earnings/05_beat-miss-setup.md; earnings/07_earnings-sensitivity.md] |
| balance-sheet-survival | Y | September 2027 maturity, conversion terms, refinancing and liquidity implications. [balance-sheet-survival/02_maturity-wall-and-refinancing.md; balance-sheet-survival/99_balance-sheet-survival-synthesis.md] |
| management-governance | Y | Buyback authorization, no-dividend policy, and absence of the 2026 proxy/AGM notice. [management-governance/02_capital-allocation-scorecard.md; management-governance/05_board-and-shareholder-rights.md; management-governance/99_management-governance-synthesis.md] |
| valuation | Y | Cash-conversion and margin-recovery conditions that would support or undermine a market re-rating; no filing-proven re-rating date. [valuation/05_reverse-dcf.md; valuation/07_scenario-and-fair-value.md; valuation/99_valuation-synthesis.md] |
| business-model | Y | CIS contract/ramp visibility, data-centre-input risk, and policy/regulatory exposure. [business-model/10_external-dependency.md; business-model/11_capital-allocation-governance.md; business-model/99_business-model-synthesis.md] |

## 3. Triage Verdict

**Sufficient.** The calendar can carry several evidenced dates: the Q3 reporting period ends 30 September 2026, Capital IQ lists 3 November 2026 for results, the 2027-note conversion date is 1 May 2027, the $1.150bn note matures 1 September 2027, and the buyback authorization expires in June 2027. The Q3 period, conversion, maturity, and authorization dates are company-disclosed; the 3 November results date remains vendor-listed and should be rechecked against an issuer announcement before it is treated as a hard company date. The contract ramp, Q4 CIS acceleration, policy, regulation, and AGM are not dated in the available evidence, so the calendar must not turn them into fixed events.

No external documents were present and no external evidence moved this verdict. The empty relationship graph is not evidence of a complete customer or supplier list; it only means no Capital IQ relationship export was supplied. [Frozen generation manifest, 2026-09-14, source inventory; relationships graph, 2026-09-14, `sources` and `edges`]
