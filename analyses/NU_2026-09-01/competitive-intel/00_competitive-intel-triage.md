# Competitive-Intel Data Triage — NU

## 0. Subject's Next Filing (the read-through target)

*"NU files next: FQ3 2026, standalone basis, covering the ~three months ending 30 September 2026, expected ~12 November 2026."* The date is a Capital IQ calendar field, not a company commitment found in the pool. Nu reports a 31 December year-end and both standalone and cumulative presentations at Q2; the next period is explicitly FQ3, so no reported stub must be added. [Capital IQ Estimates → Consensus, current fiscal-year header, pool export modified 2026-08-29; Nu Q2 2026 Unaudited Interim Condensed Consolidated Financial Statements, pp.3–5]

## 1. Peer Transcript Inventory & Reporting Calendar

No competitor transcript or permitted broker call-summary is present in `data/NU/external/`; that directory is absent, and the subject-pool extraction manifest has no external source record. There are therefore no peer-calendar rows. A missing transcript is a coverage gap, not a `not-yet reported` timing state. [data/NU/ pool inventory; `_pool_extracts/manifest.json`, reviewed 2026-08-30]

| Peer | Ticker / venue | Std / currency / FY-end | Language | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap | Source (path) |
|---|---|---|---|---|---|---|---|---|---|
| No usable peer call in the subject audit corpus | — | — | — | — | — | — | — | — | `data/NU/external/` absent |

The competitive map anchors the intended listed Brazilian bank peers as Itaú Unibanco (BOVESPA: ITUB4), Banco Bradesco (BOVESPA: BBDC4), and Banco Santander (Brasil) (BOVESPA: SANB11). NU’s FY2025 Form 20-F names all three in Brazilian consumer credit, but none has a transcript in the subject pool; no sibling pool or transcript pointer for those tickers was found either. They are coverage gaps, not table rows or read-through evidence. [FY2025 Form 20-F, Item 3.D, “Substantial and increasingly intense competition”; `analyses/NU_2026-08-30/business-model/08_competitive-map.md`; `data/` peer-pool inventory, reviewed 2026-08-30]

## 2. Coverage of the Subject's Exposure

Reporting peers cover **0% of NU's exposure for this run**: there is no usable competitor call, so no part of the single reportable Group can receive a current peer read-through. NU has one reportable digital-retail-financial-services segment, representing 100% of disclosed revenue and profit. [FY2025 Form 20-F, Note 34, F-97]

Brazil is the dominant uncovered economic exposure. The deterministic Capital IQ sidecar reports the FY2025 geographic-revenue subtotal as Brazil **US$11,038m (91%)**, Mexico US$808m (7%), and other countries US$237m (2%), total US$12,084m. [CIQ Financials→Segments (Geographic Segment → Revenues, latest annual column) — vendor export] The FY2025 Form 20-F's Note 34 geographic table matches those figures, but this is a defined-revenue subtotal rather than the US$15,775m consolidated IFRS-revenue denominator and has no country profit; it must not be treated as a 91% consolidated-revenue share. [FY2025 Form 20-F, Consolidated Statements of Income, F-7; Note 34(b), F-98]

Consequently, Brazilian retail credit, deposits, cards and payments—the area the three named banks would overlap—is uncovered, as are Mexico and Colombia. The relationships sidecar covers recently disclosed customers and suppliers only; its counterparties are not competitor transcripts and do not fill this gap. [Capital IQ Suppliers/Customers relationship graph, scope notes — vendor export]

## 3. Usability Check

| Requirement | Available? (Y/N) | Detail |
|---|---|---|
| ≥1 usable competitor call (verbatim transcript OR permitted broker paraphrase, G5) | N | `data/NU/external/` is absent; the subject-pool manifest contains no external peer-call source. |
| ≥2 distinct peer companies with verbatim transcripts (dispersion possible) | N | Zero distinct peer companies. |
| ≥1 peer reported the comparable window (read-through possible) | N | No peer call exists to date-gate against NU's ~July–September 2026 window. |
| Peer set anchored by competitive-map | Y | Itaú, Bradesco and Santander Brasil are the selected competitors named by NU. [FY2025 Form 20-F, Item 3.D; Competitive Map — NU, §2, 2026-08-30] |
| Subject's next-filing basis known | Y | FQ3 2026 is a standalone quarter ending 30 September 2026. [Capital IQ Estimates → Consensus, current fiscal-year header; Nu Q2 2026 Interim Statements, pp.3–5] |
| Subject segment-map available (for scope-matching) | Y | NU is one reportable Group segment; Brazil is the principal geographic exposure but country profit is not disclosed. [FY2025 Form 20-F, Note 34, F-97–F-98] |

## 4. Caps That Will Bind

| Trigger | Applies? (Y/N) | Cap |
|---|---|---|
| No usable call at all — no verbatim transcript AND no permitted broker paraphrase (G5) | Y | Insufficient — read-through/triangulation Not assessable. (A broker-paraphrase-only pool is Partial, NOT this row — consistent with the sufficiency rule.) |
| Only one peer transcript | N | Read-through weight Low; dispersion Not assessable |
| No peer reported the comparable window | Y | Current-window read-through Not assessable |
| Dominant subject exposure uncovered by any peer | Y | That exposure's read-through Not assessable; net weight capped |
| Peer set self-selected (no competitive-map) | N | Net weight capped Medium |
| Broker-paraphrase only (no verbatim) | N | Tone/emphasis Not assessable; flagged paraphrase |

## 5. Sufficiency Verdict

- **Verdict:** Insufficient
- **Reason:** The peer set and NU's next standalone reporting window are known, but there is no verbatim competitor transcript or permitted broker paraphrase in the subject's auditable external corpus.
- **Coverage of subject:** 0% of NU's disclosed Group exposure has a reporting-peer vantage in this run; the Brazil-led retail-credit core is therefore Not assessable from peer calls.
- **Active caps:**
  - Read-through and narrative triangulation are Not assessable.
  - Current-window read-through is Not assessable because no peer has a call to date-gate.
  - The net peer weight is zero; no inference about NU should be drawn from the three named peers' separate results disclosures without a transcript in `data/NU/external/`.
- **Critical gaps:**
  - Add verbatim or permitted broker-paraphrase calls for at least Itaú, Bradesco and Santander Brasil to `data/NU/external/`; peer-pool copies elsewhere would remain pointers, not citable evidence for this run.
  - The uncovered Brazilian core is 91% of NU's defined FY2025 geographic-revenue subtotal, but that subtotal is not a consolidated-revenue or profit weight; country-level profit exposure remains undisclosed.
