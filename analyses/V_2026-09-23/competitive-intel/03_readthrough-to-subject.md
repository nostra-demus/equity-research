# Peer Read-Through — V

## 0. Peer Set & Reporting Calendar

*"Visa files next: FQ4 FY2026 / FY2026 results, standalone three-month basis, covering approximately 2026-07-01 to 2026-09-30."* Visa is a U.S. GAAP, USD reporter with a September 30 year-end; the CIQ events calendar shows an estimated 2026-10-27 release date, which is not a company-announced date. [data/V/Visa_Inc_-_Form_10-Q(Jul-29-2026).doc, cover; data/V/Visa Inc NYSE V Events Calendar.xls, 2026 Events Calendar]

| Peer | Ticker / venue | Std / currency | Most-recent call (native label) | Normalised window | Interim basis | Timing vs subject window | Scope overlap with subject | Source |
|---|---|---|---|---|---|---|---|---|

No peer row can be populated. The immutable generation has 23 successful Visa-source documents, no `external: true` manifest row, and no `data/V/external/**` directory. Visa's own FY2026 calls are not competitor evidence. [Frozen generation manifest, 2026-09-23, sources inventory]

- **Read-through-eligible peers:** none. **Context-only peers:** none. There is no usable competitor call to date-gate; Mastercard and American Express are coverage gaps, not timing states. [analyses/V_2026-09-23/business-model/08_competitive-map.md, §2; Frozen generation manifest, 2026-09-23, sources inventory]
- **Coverage of the subject's exposure:** reporting peers cover 0% of Visa revenue in this frozen run. Payment Services is Visa's sole reportable segment and accounted for $40.0bn, or 100%, of FY2025 net revenue. The entire segment is therefore uncovered by a reporting-peer vantage and its read-through is Not assessable. [data/V/Visa-Fiscal-2025-Annual-Report.pdf, FY2025 Form 10-K, Note 14, p.87; ciq_facts.json, `segments_revenue`, CIQ Financials→Segments — vendor cross-check]
- The tier-5 Capital IQ relationship graph is not a substitute for a competitor transcript: it covers only recently disclosed customers and suppliers, does not state Visa exposure amounts, and supplies no peer management commentary. [relationships.json, `scope_notes`; `counterparties`]

## 1. Peer Management Signals (already-reported peers only)

| Dimension | Peer | What management said | Scope (geo / segment / tier) | Number (currency, period) | Citation |
|---|---|---|---|---|---|

There are no eligible-peer management signals. No statement by Mastercard, American Express, Discover/Diners Club, JCB, or UnionPay management is in the frozen Visa audit corpus. Visa-only calls are excluded under G5. [Frozen generation manifest, 2026-09-23, sources inventory; analyses/V_2026-09-23/competitive-intel/01_peer-claim-extraction.md, Per-Peer Claim Blocks]

**Scope-mismatch note:** none. The defect is absent peer evidence, not a peer claim with non-overlapping geography, business line, or product tier.

## 2. Read-Through to V

*Every row below is inference from peer read-through — NOT a filing fact about V (§6 Level 1, Guardrail G2).*

| Peer evidence | Transmission mechanism | Implication for V (named metric, direction) | Direction confidence (§10 band + basis) | Weight (H/M/L + why) | Confirms if / Falsifies if (line-item · boundary · comparable · basis) |
|---|---|---|---|---|---|

No inference rows are permitted. With zero usable competitor calls, there is neither a peer signal nor a transmission mechanism from which to set a directional confidence, weight, or testable Visa confirm/falsify boundary. The sourced Visa bar does not cure this gap: FQ4 FY2026 vendor consensus is $12.097bn revenue and $3.42986 normalized EPS on a standalone-quarter basis, but it cannot turn missing peer conditions into a read-through. [analyses/V_2026-09-23/earnings/05_beat-miss-setup.md, §§1 and 4; Frozen generation manifest, 2026-09-23, sources inventory]

## 3. Cross-Sectional Dispersion

Not assessable — fewer than two already-reported peers. In fact, zero competitor management calls are available, so there is no peer consensus, named outlier, quote, or number for any benchmark dimension. [Frozen generation manifest, 2026-09-23, sources inventory; analyses/V_2026-09-23/competitive-intel/02_dimension-matrix.md, §§1–2]

## 4. Net Read-Through Verdict

**Verdict: Insufficient data — no usable competitor call in the pool.** The current-window read-through is **Not assessable**: no already-reported peer with overlapping scope is in the frozen corpus. A sourced subject bar exists, but peer conditions cannot establish whether Visa will clear it without a usable peer call. [analyses/V_2026-09-23/earnings/05_beat-miss-setup.md, §1; Frozen generation manifest, 2026-09-23, sources inventory]

There is no peer signal to rank as most important. The only change that could make this analysis possible is an admitted, attributable competitor management call covering a comparable calendar window; that would enable a new frozen-generation read-through, not retrospectively validate a direction in this run. This is inference feeding the beat/miss setup and the candor cross-check — it does not set a rating (G2).

## 5. What Would Change This

There is no material peer read-through to confirm or falsify against Visa's coming standalone FQ4 FY2026 print. Accordingly, no line-item boundary is scoreable: a Visa result above or below its own revenue or normalized-EPS bar would describe Visa's result, not validate an absent peer signal.

The required new evidence is a verbatim competitor call (and, for reported figures, its accompanying results release) that covers all or part of 2026-07-01 to 2026-09-30 and is admitted under `data/V/external/**` in a new immutable generation. If it covers only a sub-window, any resulting Visa test must explicitly identify the uncovered portion; Visa's standalone FQ4 result would otherwise blend the peer-covered and uncovered periods.

## 6. Data Gaps & Caps

- No verbatim competitor transcript or permitted broker paraphrase is present for Mastercard or American Express, the direct named peers. No peer results release is present in `data/V/external/**` either. [analyses/V_2026-09-23/business-model/08_competitive-map.md, §2; Frozen generation manifest, 2026-09-23, sources inventory]
- No peer can be normalised to Visa's July–September 2026 target window; no reporting standard, currency, native call label, interim basis, or scope tag can be established from an in-pool peer document.
- Active caps: the no-usable-call cap controls; the current-window read-through and cross-sectional dispersion are Not assessable. Payment Services, 100% of FY2025 revenue, has no reporting-peer vantage, so no net read-through weight can be assigned. [analyses/V_2026-09-23/competitive-intel/00_competitive-intel-triage.md, §§2–5]
- This is a missing-evidence gap, not an extraction or language failure. The peer set was independently anchored by the competitive map, so the self-selected-peer cap does not apply. [analyses/V_2026-09-23/competitive-intel/00_competitive-intel-triage.md, §§3–4]
- Highest-value data request: admit the direct peers' verbatim comparable-window calls and results releases for Mastercard and American Express into `data/V/external/**` before creating a new frozen generation.
