# Competitive-Intel Data Triage — V

## 0. Subject's Next Filing (the read-through target)

*"Visa files next: FQ4 FY2026 / FY2026 results, standalone three-month basis, covering approximately 2026-07-01 to 2026-09-30, with an estimated earnings-release date of 2026-10-27."* Visa is a U.S. GAAP, USD reporter with a September 30 fiscal year-end; its latest reported quarter was the standalone quarter ended June 30, 2026. The October 27 date is CIQ-derived and explicitly subject to change, not a company-announced date. [data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, cover; data/V/Visa-Fiscal-2025-Annual-Report.pdf, FY2025 Form 10-K cover; data/V/Visa Inc NYSE V Events Calendar.xls, 2026 Events Calendar]

## 1. Peer Transcript Inventory & Reporting Calendar

| Peer | Ticker / venue | Std / currency / FY-end | Language | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap | Source (path) |
|---|---|---|---|---|---|---|---|---|---|

No peer rows: the exact frozen-generation manifest has 23 successful Visa-source files, but no `external: true` source and no competitor transcript or permitted broker paraphrase. Visa's own Q1–Q3 FY2026 calls are not competitor evidence. [Frozen generation manifest, 2026-09-23, sources inventory]

Coverage gaps, not inventory rows: no in-pool call is available for Mastercard (MA / NYSE) or American Express (AXP / NYSE), the two direct, named peers in the anchored competitive map. The map also identifies Discover/Diners Club, JCB and UnionPay as competitors, but the frozen subject snapshot contains no call for any of them. [analyses/V_2026-09-23/business-model/08_competitive-map.md, §§2 and 5; data/V/Visa-Fiscal-2025-Annual-Report.pdf, FY2025 Form 10-K, Competition, p.17]

## 2. Coverage of the Subject's Exposure

Reporting, read-through-eligible peers cover **0%** of Visa's revenue in this run: there are no eligible peer calls to map to the subject. Visa has one reportable Payment Services segment, representing all $40.0bn of FY2025 net revenue, so the entire business is uncovered by a reporting-peer vantage. This is a statement about this frozen evidence set, not an estimate of the wider payment-network market. [Frozen generation manifest, 2026-09-23, sources inventory; data/V/Visa-Fiscal-2025-Annual-Report.pdf, FY2025 Form 10-K, Note 14, p.87; ciq_facts.json, `segments_revenue` — CIQ Financials→Segments vendor cross-check]

## 3. Usability Check

| Requirement | Available? (Y/N) | Detail |
|---|---|---|
| ≥1 usable competitor call (verbatim transcript OR permitted broker paraphrase, G5) | N | No injected `external/**` document or external manifest row; Visa-only calls do not count. [Frozen generation manifest, 2026-09-23, sources inventory] |
| ≥2 distinct peer companies with verbatim transcripts (dispersion possible) | N | Zero distinct competitor companies. Dispersion is Not assessable. |
| ≥1 peer reported the comparable window (read-through possible) | N | No peer call can be date-gated against the July–September 2026 target window. |
| Peer set anchored by competitive-map | Y | Mastercard and American Express are named direct peers in the available competitive map; the peer set was not self-selected. [analyses/V_2026-09-23/business-model/08_competitive-map.md, §2] |
| Subject's next-filing basis known | Y | FQ4 FY2026 is a standalone quarter ending September 30, 2026; the calendar's October 27 release date is CIQ-derived. [data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, cover; data/V/Visa Inc NYSE V Events Calendar.xls, 2026 Events Calendar] |
| Subject segment-map available (for scope-matching) | Y | Payment Services is Visa's only reportable segment and is 100% of FY2025 revenue. [data/V/Visa-Fiscal-2025-Annual-Report.pdf, FY2025 Form 10-K, Note 14, p.87] |

## 4. Caps That Will Bind

| Trigger | Applies? (Y/N) | Cap |
|---|---|---|
| No usable call at all — no verbatim transcript AND no permitted broker paraphrase (G5) | Y | Insufficient — read-through/triangulation Not assessable. (A broker-paraphrase-only pool is Partial, NOT this row — consistent with the sufficiency rule.) |
| Only one peer transcript | N | Not the applicable cap: zero peer transcripts are present, so the no-usable-call cap controls. |
| No peer reported the comparable window | Y | Current-window read-through Not assessable. |
| Dominant subject exposure uncovered by any peer | Y | Payment Services, 100% of FY2025 revenue, has no reporting-peer vantage; its read-through is Not assessable and net weight cannot be assigned. [data/V/Visa-Fiscal-2025-Annual-Report.pdf, FY2025 Form 10-K, Note 14, p.87] |
| Peer set self-selected (no competitive-map) | N | No self-selected-peer cap; the competitive map is available. |
| Broker-paraphrase only (no verbatim) | N | No broker paraphrase is in the snapshot. |

## 5. Sufficiency Verdict

- **Verdict:** Insufficient
- **Reason:** The anchored peer set exists, but the frozen Visa snapshot contains zero usable competitor calls or permitted broker paraphrases; it cannot support a peer benchmark.
- **Coverage of subject:** 0% of revenue is covered by reporting peers; Visa's single Payment Services segment, 100% of FY2025 net revenue, is entirely uncovered in this run. [data/V/Visa-Fiscal-2025-Annual-Report.pdf, FY2025 Form 10-K, Note 14, p.87]
- **Active caps:**
  - Current-window peer read-through and narrative triangulation are Not assessable.
  - Cross-peer dispersion is Not assessable.
  - No net read-through weight can be assigned because the full subject exposure lacks a reporting-peer vantage.
- **Critical gaps:**
  - No verbatim or permitted broker-paraphrase call for Mastercard or American Express has been injected into `data/V/external/**` in this frozen generation.
  - The highest-value next data request is the already-published comparable-window calls and results releases for Mastercard and American Express, force-routed into Visa's external area before the next frozen generation.
