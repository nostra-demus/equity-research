# earnings Module Dossier — UBER

> Deterministic, lossless concatenation of every artifact in this module — the module synthesis and every specialist output, in order. Generated mechanically (no LLM rewriting), so nothing is omitted or paraphrased. This is the module's "see everything" tier; the module's decision lives in `99_*-synthesis.md` and the short read in `earnings_memo.md`.

- Generated: 2026-08-08T18:14:05Z
- Module folder: `earnings`
- Contents: 1 module synthesis + 9 specialist outputs = 10 files

## Table of Contents

- [earnings — module synthesis](#earnings-module-synthesis) — `99_earnings-synthesis.md`
- [earnings / 00_earnings-data-triage.md](#earnings-00-earnings-data-triage-md) — `00_earnings-data-triage.md`
- [earnings / 01_historical-financials.md](#earnings-01-historical-financials-md) — `01_historical-financials.md`
- [earnings / 02_revenue-drivers.md](#earnings-02-revenue-drivers-md) — `02_revenue-drivers.md`
- [earnings / 03_margin-drivers.md](#earnings-03-margin-drivers-md) — `03_margin-drivers.md`
- [earnings / 04_guidance-consensus.md](#earnings-04-guidance-consensus-md) — `04_guidance-consensus.md`
- [earnings / 05_beat-miss-setup.md](#earnings-05-beat-miss-setup-md) — `05_beat-miss-setup.md`
- [earnings / 06_earnings-quality.md](#earnings-06-earnings-quality-md) — `06_earnings-quality.md`
- [earnings / 07_earnings-sensitivity.md](#earnings-07-earnings-sensitivity-md) — `07_earnings-sensitivity.md`
- [earnings / 08_earnings-red-flags.md](#earnings-08-earnings-red-flags-md) — `08_earnings-red-flags.md`


---

## earnings — module synthesis

_Source: `99_earnings-synthesis.md`_

# Earnings Module — UBER (Synthesis)

## Abstract

Uber's earnings trend reads as mixed, not cleanly accelerating: headline revenue growth cooled from 18% to 12.2% over the last two quarters, but that is mostly a one-time UK accounting reclassification, not weaker demand — trip volume kept growing above 20% for a fourth straight quarter. Genuine cost-of-revenue leverage, not one-off items, is the biggest driver of the margin gain. The consensus bar for EBITDA and EPS sits within 0.4% of guidance, a fair bar. The biggest risk: the "beat guidance" streak behind the bullish case rests on a guided EBITDA figure this pool cannot reconcile to its own GAAP-basis EBITDA, a $734 million, 35.2% gap. Verdict: mixed, not accelerating, until that gap is resolved.

## 1. Earnings Verdict

- **Verdict: Mixed earnings setup**
- Earnings quality /100: **68** *(from `06_earnings-quality`)*
- Consensus setup /100 *(higher = more beatable)*: **58**, capped at 65 *(discretionary cap; see Section 4)*
- Earnings volatility /100 *(higher = WORSE, inverted)*: **60** *(from `07_earnings-sensitivity`)*
- Next-quarter setup: **Favors beat** on the guided EBITDA/EPS-Normalized metrics, but flagged — the specific "beat guidance streak" evidence rests on an unreconciled EBITDA figure (see Section 4); revenue itself carries a **Balanced-to-miss** tilt (from `05_beat-miss-setup`)
- Biggest earnings driver (one line): Trip/Gross Bookings volume (revenue side, +22% constant-currency, four straight quarters above 20%) and Driver/Courier/Carrier variable payments (margin side, the largest cost line at 55–61% of revenue, contributing +377bps of genuine ex-UK EBIT-margin gain in Q2 FY26)
- Biggest earnings risk (one line): The guided/consensus "EBITDA" figure anchoring the "favors beat" read cannot be reconciled to the GAAP-basis EBITDA computed elsewhere in this pool ($2,819M guided-comparison vs $2,085M GAAP-basis in Q2 FY26, a $734M / 35.2% gap), because Uber discontinued its consolidated non-GAAP reconciliation after FY2025 and no earnings press release is in the data pool to confirm the current definition
- **Red-flag severity verdict (from `08_earnings-red-flags`, reported verbatim): Material concerns**

## 1A. Module Disconfirmation

- **Strongest bear point:** The evidentiary chain behind "setup favors beat" is compromised at its root — the guided/consensus EBITDA figure that management and consensus have beaten in 4/4 quarters ($2,819M in Q2 FY26) does not match this same module's own GAAP-basis EBITDA for the identical quarter ($2,085M), a 35.2% gap with no primary-source reconciliation available in this pool [`08_earnings-red-flags.md` §2.5, §2.9]. Layered on top: GAAP net income was inflated by one-off, non-cash deferred-tax releases in BOTH FY2024 ($6.4bn) and FY2025 ($5.0bn, Netherlands) [`business-model/12_red-flags-sweep.md` §2, via `08` §1].
- **Strongest bull point (steelman):** Stripped of the mechanical UK reclassification and FX, underlying trip volume/Gross Bookings growth is ~19.9% year-on-year — stable-to-accelerating versus the FY2023–2025 17–18% base rate, not decelerating [`02_revenue-drivers.md` §6a]. The margin improvement backing this is independently GAAP-reconciled: +377bps of genuine (ex-UK) cost-of-revenue leverage in Q2 FY26 versus a total +186bps EBIT-margin gain, meaning the core driver-payment economics are moving favorably on a fully verified basis [`03_margin-drivers.md` §8a].
- **Single killer risk specific to earnings quality & beat/miss setup:** A driver-classification/labor-regulation ruling in a large market is an unquantifiable, binary tail risk that the business-model module rates the primary driver of a 48/100 (inverted) External Dependency Risk Score and names "the single item that could force a structural change to the business model" [`07_earnings-sensitivity.md` §3, §6; `business-model/10_external-dependency.md` §5] — it is excluded from every numeric sensitivity ranking in this module only because no dollar figure is disclosed, not because it is small.
- **Disconfirming evidence already visible:** Revenue has missed consensus narrowly in the last two reported quarters (−0.45%, −0.52%), FQ3 2026 revenue consensus was cut 1.04% in the three trading days after the Q2 print, and net revision breadth is −11 at the FQ3 level (8 up / 19 down) [`04_guidance-consensus.md` §3, §5] — a live, current-quarter data point working against the "favors beat" framing, independent of the EBITDA-definition problem.

## 2. Specialist Roll-Up

| Specialist | Verdict Line | Biggest Finding |
|---|---|---|
| earnings-data-triage | Sufficiency verdict: Sufficient; no hard score caps triggered | Full annual/quarterly filings, two verbatim transcripts, current consensus/guidance/revisions all present; only soft gap is no dated spot-price file |
| historical-financials | Revenue growth decelerating (headline), margins accelerating for 5 straight years | TTM diluted EPS fell 22.5% even as TTM EBITDA (+42.9%), EBIT (+48.6%), and FCF (+18.5%) all grew double digits — GAAP EPS is not a usable trend signal |
| revenue-drivers | Trip/Gross Bookings volume is the single biggest revenue driver and is improving | The UK Mobility reclassification, not demand, explains −8.7pp of Q2's +12.2pp headline growth; ex-UK/ex-FX growth is ~19.9%, stable-to-accelerating |
| margin-drivers | GAAP EBIT margin is the most useful metric going forward; Driver/Courier payments are the single biggest margin lever | Genuine (ex-UK) cost-of-revenue leverage of +377bps explains more than the entire +186bps Q2 FY26 EBIT-margin gain; G&A/legal-accrual line swung +106bps favorable (FY25) then −97bps unfavorable (Q2'26), the most unpredictable line in the cost stack |
| guidance-consensus | Bar is fair | EBITDA/EPS-Normalized consensus sits within 0.3–0.4% of guidance midpoint; revenue consensus cut 1.04% in 3 days post-print with net revision breadth −11 |
| beat-miss-setup | Setup favors beat | EBITDA has beaten its own guidance 4/4 quarters, above the guided high end the last 2 by ~2.5% each — but this is a short 2-quarter "above high end" sample, and revenue is the named single biggest miss risk |
| earnings-quality | Score 68/100 — mostly clean, some adjustment noise | CFO exceeded reported EBITDA by 150–200% every profitable year FY2023–2025 and 0/6 accrual-quality flags triggered, but Adjusted EBITDA add-backs (SBC $1,826M, a recurring "legal/regulatory" charge >$500M in both years shown) and GAAP net income (distorted by a one-off $6.0bn FY2024 tax-valuation-allowance release) both require real interpretive work |
| earnings-sensitivity | Volatility score 60/100 (inverted, "Material sensitivity") | Driver/Courier/Carrier payments is the single highest-quantifiable-sensitivity variable (±$1,105M EBIT on a ±2pp move); driver-classification/labor risk is excluded from the ranking only because it is unquantifiable, not because it is small |

## 3. Reconciliation

Three disagreements surfaced by `08_earnings-red-flags` require explicit reconciliation here:

1. **GAAP-basis EBITDA (`01`) vs. guided/consensus "EBITDA" (`04`/`05`).** `01_historical-financials` computes Q2 FY26 EBITDA (GAAP Income from operations + D&A) at $2,085M; `04_guidance-consensus`/`05_beat-miss-setup` report the guided/consensus figure Uber beat as $2,819M — a $734M (35.2%) gap that cannot be bridged from any primary source in this pool, because Uber's 10-Q no longer discloses a consolidated Adjusted EBITDA reconciliation for FY2026. **Reconciled view (conservative default per CLAUDE.md §4):** neither figure is "wrong" on its own terms, but the "beat guidance streak" claim behind the bull case is anchored to the unverified figure, so this synthesis treats that claim as directionally suggestive, not fully verified, and applies the cap in Section 4.
2. **"Revenue growth decelerating" (`01`/`05`) vs. underlying trip-volume/Gross-Bookings growth stable-to-accelerating (`02`).** `01`'s headline description of reported revenue growth (18% → 12.2%) is factually accurate, but `05`'s pre-mortem language attributes revenue-miss risk partly to "trip-volume deceleration," which `02`'s own decomposition — reconciling to a 0.0pp residual — does not support once the UK reclassification (−8.7pp) and FX (+1.0pp) are stripped out (ex-UK/ex-FX growth ≈19.9%). **Reconciled view:** this synthesis adopts `02`'s decomposed read for characterizing demand — trip volume is stable-to-accelerating — while retaining `01`'s reported-revenue figures as the number consensus and the market actually see and react to.
3. **`06`'s "smaller" characterization of the FY2025 tax benefit vs. `business-model/12_red-flags-sweep`'s identification of a discrete $5.0bn Netherlands one-off.** `06_earnings-quality` treats the FY2025 tax benefit only as smaller than FY2024's ~$6.0bn release; the business-model red-flag sweep identifies it as its own discrete ~$5.0bn deferred-tax valuation-allowance release (Netherlands), comparable in scale to FY2024's item. **Reconciled view:** the business-model finding is the more complete one and is adopted — GAAP net income was materially tax-benefit-inflated in BOTH FY2024 and FY2025, not just FY2024.

No conflict exists between this synthesis's "Mixed earnings setup" verdict and `08`'s "Material concerns" red-flag severity verdict — they answer different questions (trajectory vs. evidentiary cleanliness) and point the same direction: the operating trend has real positives (genuine margin leverage, stable underlying volume growth) but the evidence chain behind the more bullish upstream framing has specific, cited weaknesses that argue against adopting "Earnings accelerating" outright.

## 4. Score Cap Application

| Cap Trigger | Applied? (Y/N) | Affected Score | Final Cap |
|---|---|---|---|
| No consensus / estimate data | N — consensus, guidance, revisions, surprise, and trends data are all present and current as of Aug-05-2026 [`00_earnings-data-triage.md` §5] | Consensus setup | Not applied |
| No cash flow statement | N — full CFO/capex/FCF series present through Jun-30-2026 [`00_earnings-data-triage.md` §5] | Earnings quality | Not applied |
| No revision history | N — Revisions, Recent Changes, and Trends tabs all present [`04_guidance-consensus.md` §1, §4–5] | Consensus setup | Not applied |
| No verbatim transcript AND no sell-side proxy | N — verbatim CIQ transcripts present for both Q1 FY26 and Q2 FY26 [`00_earnings-data-triage.md` §3] | Earnings clarity | Not applied |
| Transcript role filled ONLY by a sell-side proxy (no verbatim) | N — same as above | Earnings clarity | Not applied |
| Only inferred sensitivities | N — most `07` sensitivities are company-disclosed dollar swings (High/Medium confidence); only the EBIT-equivalent dollarization of FX and the volume-coefficient magnitude are Low-confidence/inferred, not the full set | Earnings volatility confidence | Not forced to Low as a blanket rule; individual rows retain their own stated confidence |
| Conflicting sources not reconcilable (GAAP-basis EBITDA vs. guided/consensus EBITDA, $734M / 35.2% gap, Q2 FY26) | **Y** — flagged explicitly by `08_earnings-red-flags.md` §2.5, §2.9, §3 as unresolved within this data pool | Overall usefulness; discretionarily extended to Consensus setup per `08`'s explicit recommendation ("This should cap the Consensus setup score component") | Overall usefulness max 65; Consensus setup capped at 65 (assigned 58, below the cap) |

## 5. Earnings Setup Summary

### Revenue Setup

The current revenue trajectory is sustainable at the demand level but not at the reported-growth level for another two to three quarters. The mechanical UK Mobility reclassification recurs every quarter until it laps in Q1 FY2027, so reported year-on-year revenue growth will keep printing well below the underlying trend until then — this is a known, bounded, non-repeatable accounting effect, not evidence the business is slowing. The single factor that would actually flip the revenue direction is a genuine deceleration in trip volume or Gross Bookings below the >20% constant-currency streak that has now held for four consecutive quarters — that is the variable the market should watch, not the headline revenue print. The gap between reported and underlying revenue is explicit and sizeable: Q2 FY26 reported growth was +12.2% year-on-year while ex-UK, ex-FX growth was ~19.9% — a ~7.7-point gap, with the UK effect alone worth −8.7pp and a smaller, unverified take-rate/mix residual of −2.1pp (a derived plug, not an independently confirmed company figure — `02_revenue-drivers.md` §6a). Consensus itself has already been trimmed 1.04% in the three trading days after the Q2 print with a net revision breadth of −11, meaning the Street is currently weighting the reported-growth optics more than the underlying decomposition — a live disconnect worth carrying into the next print.

### Margin Setup

Current EBIT margins are not fully at a sustainable run-rate — a meaningful share of the latest quarter's improvement is one-off or optical rather than structural. Of the +186bps Q2 FY26 EBIT-margin gain, +132bps came from the UK reclassification (an accounting optic, not real cost discipline) and the G&A line alone swung −97bps unfavorably after having swung +106bps favorably in FY2025 on the identical legal-accrual line item — a genuinely two-way, unpredictable swing that should not be extrapolated in either direction. The durable piece is the +377bps of genuine (ex-UK) cost-of-revenue leverage, larger than the entire net margin gain on its own. If Driver/Courier/Carrier variable payments — 55–61% of revenue, the single largest cost line — move adversely by even a 2-percentage-point swing, that alone is worth roughly ±$1,105M against a $6,700M TTM EBIT base, more than any other single lever in the cost stack. Uber has no contractual or structural margin-protection mechanism: fares and fees reset at the company's own discretion, and the one clear evidence of pass-through behavior (the insurance-cost cycle) is explicitly asymmetric — cost increases have historically flowed close to fully into the P&L, while cost decreases are largely reinvested into fares rather than banked as margin, per management's own stated philosophy of "return[ing] that goodness back to the market."

### Quality Check

The largest gap between reported and economic earnings is not in cash flow — CFO has exceeded reported EBITDA by 150–200% in every profitable year and cash conversion shows no red flags — it is in the two headline profitability numbers investors actually quote. Adjusted EBITDA sits $2,446M (38.9%) above GAAP EBIT for FY2025, propped up by a recurring "legal, non-income-tax and regulatory reserve" add-back that has exceeded $500M in both years disclosed despite its "adjustment" framing, and GAAP net income was inflated by one-off, non-cash deferred-tax valuation-allowance releases in BOTH FY2024 (~$6.4bn combined) and FY2025 (~$5.0bn, Netherlands) — a gap that is not narrowing as cleanly as `06_earnings-quality`'s own framing suggests once the FY2025 item is treated on equal footing with FY2024's. The recurring legal-accrual add-back is not genuinely one-time by its own repetition; SBC (~$1.8bn/year, 20.9% of Adjusted EBITDA) never was. To model normalized earnings for next year, this synthesis would start from GAAP EBIT, not Adjusted EBITDA — both because Uber itself no longer discloses a consolidated Adjusted EBITDA reconciliation for FY2026 and because GAAP EBIT is unaffected by the below-the-line mark-to-market swings and one-off tax items that make GAAP net income and EPS unusable as a standalone trend signal.

### Consensus Bar

For the two metrics Uber actually guides, the bar looks correctly priced, not mis-set — consensus sits within 0.3–0.4% of the guidance midpoint on both EBITDA and EPS Normalized, the textbook definition of a fair bar rather than a sandbagged or stretched one. For Uber to beat that bar by a material margin, the genuine ex-UK cost-of-revenue leverage (+377bps in Q2 FY26) would need to repeat for a third straight quarter with no offsetting G&A/legal-accrual reversal — a plausible but not proven pattern, since the "above guided high end" streak is only two quarters long. The bar is most likely mis-set, if anywhere, on revenue: there is no formal guidance to anchor it, and the freshest revision data (post-print cuts, −11 net breadth) argues the Street may still be too optimistic on reported revenue even after the recent trim. A real share of the current consensus optimism on the profitability line is anchored to a short, two-quarter above-guidance-high-end streak measured on a guided EBITDA figure this module cannot independently verify (Section 4) — a one-off-adjacent risk to the bar's reliability that is separate from, and larger than, ordinary seasonal noise.

## 5b. Leverage & Capital Structure

Leverage is within normal range and did not change materially during the period — no dedicated treatment required.

*(Supporting arithmetic, checked against both triggers: net debt/Adjusted-EBITDA-equivalent — using LTM GAAP-basis EBITDA — was 1.32x at Jun-30-2026 [`01_historical-financials.md` §2], well below the 3.0x Trigger-A threshold. Year-over-year: net debt rose $5,904M → $9,861M (+67.0%, not >2x), total debt rose $12,342M → $14,731M (+19.4%, not >50%), and the leverage ratio moved 1.13x → 1.32x (+0.19x, not >1.0x) — none of the Trigger-B conditions are met on a like-for-like YoY basis. This module's own leverage read is therefore backward-looking only; the pending ~$14.8bn Delivery Hero acquisition, funded mainly via a new €14.2bn bridge facility and expected to close H2 2027, is not yet reflected in these balance-sheet figures and is out of this module's scope — see Section 8.)*

## 6. Key Numbers

- Revenue growth rate: reported +12.2% YoY (Q2 FY26); underlying ex-UK/ex-FX ~+19.9% YoY [`02_revenue-drivers.md` §6a]
- EBITDA margin: GAAP-basis EBITDA margin 14.7% (Q2 FY26), 12.1% FY2025 annual; Adjusted EBITDA margin 16.8% FY2025 (last disclosed consolidated figure) [`01_historical-financials.md` §1, §3; `06_earnings-quality.md` §7]
- EPS: GAAP diluted $1.17 (Q2 FY26, volatile — mark-to-market driven); EPS Normalized $0.81 (Q2 FY26) vs. FQ3 2026 guide $0.84–0.88 [`01_historical-financials.md` §3; `04_guidance-consensus.md` §2]
- CFO / EBITDA: 160.0% (FY2025, GAAP-basis EBITDA denominator) — well above the 70% healthy threshold, but a real share of the gap is SBC add-back and self-insurance-reserve build, not pure organic collection [`06_earnings-quality.md` §1–2]
- Biggest driver current level: Driver/Courier/Carrier variable payments 55.1% (reported) / 56.4% (ex-UK) of revenue, Q2 FY26 [`03_margin-drivers.md` §8a]
- Consensus gap: EBITDA guided midpoint $2,910mm vs. consensus $2,918.95mm (+0.31%); GAAP-basis EBITDA for the same quarter computed at $2,085M elsewhere in this module — a $734M / 35.2% unreconciled gap [`04_guidance-consensus.md` §3; `01_historical-financials.md` §3; `08_earnings-red-flags.md` §2.5]
- Estimate revision direction: Revenue falling (net breadth −11, last month, FQ3 2026); EBITDA/profitability rising (net breadth +6 to +14, same window) [`04_guidance-consensus.md` §4–5]
- Earnings volatility score: 60/100 (inverted, higher = worse — "Material sensitivity" band) [`07_earnings-sensitivity.md` §7]

## 7. What Would Change The Earnings Verdict?

| Current Verdict | What Would Upgrade It | What Would Downgrade It | Data Needed |
|---|---|---|---|
| Mixed earnings setup | (1) An FQ1/FQ2 2026 earnings press release confirming the guided/consensus EBITDA definition reconciles to the GAAP-basis figure computed here, resolving the single biggest red flag; (2) a third straight quarter of genuine (ex-UK) cost-of-revenue leverage without a G&A/legal-accrual reversal; (3) Gross Bookings growth sustaining >20% constant-currency for a fifth straight quarter | (1) A material Q3 revenue miss beyond the ±0.6% range of the last two quarters; (2) the first quantified AV-investment P&L cost figure landing materially negative in the Q4 FY26 guide; (3) a driver-classification/labor-reclassification ruling in a large market; (4) leverage crossing 3.0x net debt/EBITDA once the Delivery Hero deal closes and consolidates | Uber's FQ1/FQ2 2026 earnings press releases or shareholder letters (to confirm the EBITDA definitional basis); the numeric FQ4 2026 guide (for the AV cost signal and seasonal confirmation) |

## 8. Note To The Final Synthesizer

- Dominant earnings trend: mixed — reported revenue growth is decelerating, but underlying trip-volume/Gross-Bookings growth (ex the UK accounting reclassification) is stable-to-accelerating; margins are expanding, but a meaningful share of the latest expansion is one-off (UK optics, a reversing G&A/legal-accrual swing) rather than structural.
- **Red-flag severity verdict (verbatim, from `08_earnings-red-flags.md` §5): "Material concerns" — high-severity flags present; the earnings setup may be overstated in specific places and should not be taken purely at face value.**
- **Mandatory High-severity flag propagation (all 6 flags rated High by `08_earnings-red-flags.md` §4, none rated Critical):**
  1. The guided/consensus "EBITDA" figure does not match this module's own GAAP-basis EBITDA for FY2026 quarters ($2,819M vs $2,085M, Q2 FY26, a 35.2% gap) and cannot be reconciled to a primary source in this pool — the single most dangerous flag; it underlies the "favors beat" verdict.
  2. The "revenue growth decelerating" narrative is materially overstated once the UK reclassification is stripped out; underlying trip-volume/Gross-Bookings growth is stable-to-accelerating, not decelerating.
  3. GAAP net income was inflated by one-off, non-cash deferred-tax valuation-allowance releases in BOTH FY2024 (~$6.4bn) and FY2025 (~$5.0bn, Netherlands) — a forward EPS/net-income model must strip both years, not just FY2024.
  4. The pending ~$14.8bn Delivery Hero acquisition is funded mainly via a new €14.2bn bridge facility inside an already-flagged serial-acquirer pattern (business-model Filter 4, CLAUDE.md §24); net debt already rose from $5,197M (FY25) to $9,861M (Jun-30-2026) before this deal even closes — a capital-structure risk this module's clean-cash-generation narrative does not incorporate (out of this module's scope to score; carried here per the propagation rule since it did not independently cross the Section 5b leverage triggers on a backward-looking basis).
  5. Driver-classification/labor-regulation risk is an unquantifiable, binary tail risk that the business-model module rates the primary driver of a 48/100 (inverted) External Dependency Risk Score — excluded from every numeric sensitivity ranking here only for lack of a disclosed dollar figure, not because it is small.
  6. `05_beat-miss-setup`'s revenue-miss pre-mortem attributes risk partly to "trip-volume deceleration" that `02_revenue-drivers`'s own decomposition does not support — a mischaracterization risk the master synthesizer should not inherit uncorrected.
- Forensic tags: `06_earnings-quality.md` did NOT fire either RF-EQ-001 (rising accruals divergent from cash earnings — 0 of 6 accrual flags triggered) or RF-EQ-002 (cash-conversion breakdown — CFO/EBITDA never fell below ~150% in the profitable years shown). Nothing to propagate under CLAUDE.md §13.
- Whether earnings are clean and cash-backed: cash generation itself is genuinely strong (CFO 150–200% of reported EBITDA every profitable year, 0/6 accrual flags), but the two headline profitability numbers (Adjusted EBITDA, GAAP net income) both require real interpretive adjustment before they can be trusted at face value.
- Consensus bar assessment: fair for the guided metrics (EBITDA, EPS Normalized — within 0.4% of guidance midpoint); the revenue bar carries a modest miss tilt given post-print downward revisions.
- Next-quarter setup and second-quarter look-ahead: FQ3 2026 favors a profitability beat but a possible revenue miss; FQ4 2026 is seasonally the strongest quarter of the year and should help mechanically, but the AV-investment P&L cost — not yet quantified anywhere in this pool — is the wildcard that could first surface in that guide.
- Top sensitivity variable and its current direction: Driver/Courier/Carrier variable payments (cost of revenue), currently a tailwind (+377bps genuine ex-UK improvement in Q2 FY26), but the single largest lever if it reverses (±$1,105M EBIT on a ±2pp swing).
- Whether any partial-data cap applied and what it limits: no MODULE_RULES missing-data cap applied (data sufficiency verdict was "Sufficient"); one discretionary cap applied — Consensus setup capped at 65 (assigned 58) because the guided/consensus EBITDA figure behind the beat-streak claim is unreconciled to GAAP-basis EBITDA within this pool.
- Biggest missing data point: Uber's FQ1/FQ2 2026 earnings press releases or shareholder letters, needed to confirm the definitional basis of the guided/consensus "EBITDA" figure now that the 10-Q no longer discloses a consolidated non-GAAP reconciliation.
- What would change the earnings verdict: see Section 7 — primarily, resolution of the EBITDA-definition gap and confirmation that the genuine cost-of-revenue leverage and >20% Gross-Bookings growth streak both continue for a third consecutive quarter.

## 9. Simple Summary

- Revenue is growing more slowly on paper (18% down to 12%), but that's mostly a UK accounting rule change, not fewer riders or orders — actual trip volume kept growing over 20% for a fourth straight quarter.
- Margins are expanding, but part of the latest gain is one-off (an accounting optic plus a legal-cost line that swings both ways, not a repeatable trend); the real, durable piece is the company keeping driver and courier payment costs in check.
- Earnings are mostly clean on a cash basis — the company generates far more cash than its reported profit — but the two "adjusted" profit numbers investors quote both lean on add-backs (stock pay, a recurring "one-time" legal charge, one-off tax benefits two years running) that make the headline numbers look better than the underlying business.
- The market's profit bar (EBITDA, EPS) looks fair, set right at what management guided — not sandbagged, not stretched.
- Next quarter likely beats on profit but could miss again on reported revenue; the profit-beat streak itself is measured against a number this module could not verify against Uber's own audited figures.
- The single biggest lever if things go wrong is driver/courier payment costs rising to defend supply — that alone could move profit more than any other single item.
- Earnings volatility is moderate-to-elevated (60/100, worse is higher) — several levers can each swing profit 8–17% on realistic moves, plus an unquantifiable labor-reclassification tail risk.
- This module is useful for the master synthesizer, but with a specific caveat attached: don't adopt the "favors beat" and "revenue decelerating" framings at face value — both need the corrections documented in Sections 3 and 8 first.



---

## earnings / 00_earnings-data-triage.md

_Source: `00_earnings-data-triage.md`_

# Earnings Data Triage — UBER

## 0. Jurisdiction & Reporting Regime

| Item | Detected Value | Evidence |
|---|---|---|
| Primary listing country | United States | 10-K cover page: "UNITED STATES", Delaware incorporation [FY25 10-K, p.1] |
| Exchange | New York Stock Exchange (NYSE: UBER) | [FY25 10-K, p.1] |
| Filing regime (US SEC / India SEBI-LODR / UK / Other) | US SEC | Form 10-K / Form 10-Q filings present [FY25 10-K; Q1 FY26 10-Q; Q2 FY26 10-Q] |
| Reporting standard (US GAAP / IFRS / Ind AS) | US GAAP | "Acctg. Standard: US GAAP" [Capital IQ Estimates Report, Consensus tab] and 10-K financial statements |
| Reporting currency | USD | [FY25 10-K financial statements]; Capital IQ exports state "Currency: Reported Currency" (USD) |
| Fiscal-year end | December 31 | "fiscal year ended December 31, 2025" [FY25 10-K, p.1] |
| Document language(s) | English | All filings, transcripts, and CIQ exports are in English |

Uber is a US domestic filer (Delaware corporation, NYSE-listed). US SEC form names (10-K, 10-Q) are the correct primary documents here, not merely examples — no jurisdiction substitution is needed.

## 1. File Inventory

| Filename | Type | Period Covered | Last Modified | Earnings Relevance |
|---|---|---|---|---|
| Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | Annual filing (10-K) | FY2025 (ended Dec-31-2025), filed Feb-13-2026 | Aug 8 21:42 (Drive sync date, not period date — F23) | High |
| Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Quarterly filing (10-Q) | Q2 FY2026 (ended Jun-30-2026), filed Aug-05-2026 | Aug 8 21:42 (sync date) | High |
| Uber_Technologies_Inc_-_Form_10-Q(May-06-2026).doc | Quarterly filing (10-Q) | Q1 FY2026 (ended Mar-31-2026), filed May-06-2026 | Aug 8 21:42 (sync date) | High |
| Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | Earnings transcript — VERBATIM (CIQ transcript: Call Participants / Presentation / Q&A) | FQ2 2026 call, Aug-05-2026 | Aug 8 21:43 (sync date) | High |
| Uber Technologies, Inc., Q1 2026 Earnings Call, May 06, 2026.rtf | Earnings transcript — VERBATIM (CIQ transcript: Call Participants / Presentation / Q&A) | FQ1 2026 call, May-06-2026 | Aug 6 20:27 (sync date) | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Key Stats | Data export (CIQ workbook tab) | Quarterly series through Jun-30-2026 | Aug 7 00:23 | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Income Statement | Data export (CIQ workbook tab) | Quarterly series through Jun-30-2026 | Aug 7 00:23 | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Balance Sheet | Data export (CIQ workbook tab) | Quarterly series through Jun-30-2026 | Aug 7 00:23 | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Cash Flow | Data export (CIQ workbook tab) | Quarterly series through Jun-30-2026 | Aug 7 00:23 | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Segments | Data export (CIQ workbook tab) | Quarterly segment P&L through Jun-30-2026 | Aug 7 00:23 | High |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Multiples | Data export (CIQ workbook tab) | Quarterly series | Aug 7 00:23 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Ratios | Data export (CIQ workbook tab) | Quarterly series | Aug 7 00:23 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Supplemental | Data export (CIQ workbook tab) | Quarterly series | Aug 7 00:23 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Capital Structure Summary | Data export (CIQ workbook tab) | Quarterly series | Aug 7 00:23 | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Capital Structure Details | Data export (CIQ workbook tab) | Quarterly series | Aug 7 00:23 | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Historical Capitalization | Data export (CIQ workbook tab) | Quarterly series | Aug 7 00:23 | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Industry Specific | Data export (CIQ workbook tab) | Quarterly series | Aug 7 00:23 | Low |
| Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Pension OPEB | Data export (CIQ workbook tab) | Quarterly series | Aug 7 00:23 | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Key Stats | Data export (CIQ workbook tab) | Annual series FY2016–FY2025 | Aug 7 00:25 | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Income Statement | Data export (CIQ workbook tab) | Annual series FY2016–FY2025 | Aug 7 00:25 | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Balance Sheet | Data export (CIQ workbook tab) | Annual series FY2016–FY2025 | Aug 7 00:25 | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Cash Flow | Data export (CIQ workbook tab) | Annual series FY2016–FY2025 | Aug 7 00:25 | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Segments | Data export (CIQ workbook tab) | Annual segment P&L FY2016–FY2025 | Aug 7 00:25 | High |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Multiples | Data export (CIQ workbook tab) | Annual series | Aug 7 00:25 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Ratios | Data export (CIQ workbook tab) | Annual series | Aug 7 00:25 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Supplemental | Data export (CIQ workbook tab) | Annual series | Aug 7 00:25 | Medium |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Capital Structure Summary | Data export (CIQ workbook tab) | Annual series | Aug 7 00:25 | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Capital Structure Details | Data export (CIQ workbook tab) | Annual series | Aug 7 00:25 | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Historical Capitalization | Data export (CIQ workbook tab) | Annual series | Aug 7 00:25 | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Industry Specific | Data export (CIQ workbook tab) | Annual series | Aug 7 00:25 | Low |
| Uber Technologies Inc NYSE UBER Financials_Annual.xls → Pension OPEB | Data export (CIQ workbook tab) | Annual series | Aug 7 00:25 | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls → Consensus | Consensus/estimate export (CIQ) | As of Aug-05-2026 (post Q2 FY26 print) | Aug 6 20:23 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls → Guidance | Guidance data export (CIQ) | Latest entry FQ3 2026 guidance, dated 2026-08-05 | Aug 6 20:23 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls → Surprise | Estimate-surprise history export (CIQ) | Historical EPS/rev surprise through FQ2 2026 | Aug 6 20:23 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls → Trends | Estimate-trend export (CIQ) | Consensus trend series | Aug 6 20:23 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls → Revisions | Estimate-revisions export (CIQ) | Revision history | Aug 6 20:23 | High |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls → Recent Changes | Estimate revision export (CIQ) | Recent changes | Aug 6 20:23 | Medium |
| UberTechnologies,IncNYSEUBEREstimatesReport.xls → Multiples | Valuation multiples export (CIQ) | Current multiples | Aug 6 20:23 | Low |
| UberTechnologies,IncNYSEUBEREstimatesReport (1).xls → (all 7 tabs) | **Duplicate** of the file above — byte-identical Consensus tab content, same workbook structure | Same as above | Aug 8 21:40 | Duplicate — no incremental data |
| Company Comparable Analysis Uber Technologies Inc.xls → Financial Data | Data export (comps) | Peer comparison snapshot | Aug 6 20:24 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls → Trading Multiples | Data export (comps) | Peer comparison snapshot | Aug 6 20:24 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls → Operating Statistics | Data export (comps) | Peer comparison snapshot | Aug 6 20:24 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls → Business Description | Data export (comps) | Snapshot | Aug 6 20:24 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls → Implied Valuation | Data export (comps) | Snapshot | Aug 6 20:24 | Low (valuation — out of module scope) |
| Company Comparable Analysis Uber Technologies Inc.xls → Valuation Chart | Data export (comps) | Snapshot | Aug 6 20:24 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls → Credit Health Panel | Data export (comps) | Snapshot | Aug 6 20:24 | Low |
| Company Comparable Analysis Uber Technologies Inc.xls → Disclaimer | Data export (boilerplate) | — | Aug 6 20:24 | Low |
| Short Iinterest_12m_Uber.xls → Chart 1 with Data | Data export (trading/positioning) | Trailing 12 months | Aug 8 22:00 | Low |
| Short Iinterest_12m_Uber.xls → Attributions | Data export (boilerplate) | — | Aug 8 22:00 | Low |
| Uber Technologies Inc NYSE UBER Events Calendar.xls → Events Calendar | Data export (event dates) | Forward calendar incl. next earnings date | Aug 6 20:27 | Medium |
| Uber Technologies Inc NYSE UBER Analyst Coverage.rtf | Data export (sell-side coverage list) | Current | Aug 6 20:27 | Low |
| Uber Technologies Inc NYSE UBER Board Members.rtf | Data export (governance) | Current | Aug 6 20:27 | Low — not earnings |
| Uber Technologies Inc NYSE UBER Customers.rtf | Data export (relationships) | Current | Aug 6 20:27 | Low |
| Uber Technologies Inc NYSE UBER Key Developments.rtf | Data export (news/events log) | Historical event log | Aug 6 20:27 | Medium |
| Uber Technologies Inc NYSE UBER Products.rtf | Data export (product list) | Current | Aug 6 20:27 | Low |
| Uber Technologies Inc NYSE UBER Professionals.rtf | Data export (management list) | Current | Aug 6 20:27 | Low |
| Uber Technologies Inc NYSE UBER Public Company Profile.rtf | Data export (company profile) | Current | Aug 6 20:27 | Low |
| Uber Technologies Inc NYSE UBER Suppliers.rtf | Data export (relationships) | Current | Aug 6 20:27 | Low |
| UberTechnologiesIncNYSEUBER_CIQReportLandscape.rtf | Data export (company snapshot / key financials summary) | Snapshot, key financials table | Aug 6 20:28 | Medium |

No files under `data/UBER/external/` — the folder does not exist. Section 1A is therefore omitted (no external documents to inventory).

Extraction check: `_pool_extracts/manifest.json` reports `"failures": 0` across all 21 source documents / 65 extracts (7 workbooks → 51 tabs, plus 14 single-stream documents). Every source has `status: "ok"`. No source is treated as missing for this triage. No `ciq_facts.json` sidecar exists in `_pool_extracts/` for this run, so headline figures below are triage's own read of the workbooks/filings, to be reconciled by downstream agents against filings per §4/§5.

## 2. Most Recent Sources

| Source Type | Filename | Period | Age (months) |
|---|---|---|---|
| Annual filing | Uber_Technologies_Inc_-_Form_10-K(Feb-13-2026).doc | FY2025 (ended Dec-31-2025), filed Feb-13-2026 | ~5.8 months |
| Quarterly filing | Uber_Technologies_Inc_-_Form_10-Q(Aug-05-2026).doc | Q2 FY2026 (ended Jun-30-2026), filed Aug-05-2026 | ~0.1 months (3 days) |
| Earnings transcript | Uber Technologies, Inc., Q2 2026 Earnings Call, Aug 05, 2026.rtf | FQ2 2026 call | ~0.1 months (3 days) |
| Investor deck | Not present in pool | — | — |
| Consensus / estimate export | UberTechnologies,IncNYSEUBEREstimatesReport.xls → Consensus | As of Aug-05-2026 | ~0.1 months (3 days) |
| Cash flow data | Uber Technologies Inc NYSE UBER Financials_Quarterly.xls → Cash Flow | Through Jun-30-2026 | ~0.1 months (3 days) |
| Guidance data | UberTechnologies,IncNYSEUBEREstimatesReport.xls → Guidance | FQ3 2026 guidance, dated 2026-08-05 | ~0.1 months (3 days) |

No investor-presentation / investor-deck file is in the pool; that "requirement" component is filled by the CIQ Report Landscape snapshot and the Events Calendar, both of Medium relevance, and does not affect the sufficiency verdict below (a deck is not a required input under the sufficiency rule).

## 3. Earnings Usability Check

| Requirement | Available? (Y/N) | Source | Why It Matters |
|---|---|---|---|
| Income statement | Y | FY25 10-K financial statements; CIQ Financials_Annual/Quarterly → Income Statement | Needed for revenue, margin, EPS |
| Balance sheet | Y | FY25 10-K financial statements; CIQ Financials_Annual/Quarterly → Balance Sheet | Needed for working capital and leverage |
| Cash flow statement | Y | FY25 10-K financial statements; CIQ Financials_Annual/Quarterly → Cash Flow (CFO and capex through Jun-30-2026) | Needed for CFO, FCF, earnings quality |
| Latest quarter | Y | Q2 FY26 10-Q (period ended Jun-30-2026, filed Aug-05-2026); CIQ Financials_Quarterly through Jun-30-2026 | Needed for trend and setup |
| Last 8 quarters | Y | CIQ Financials_Quarterly workbook carries a multi-year quarterly series (34 quarterly columns in the Cash Flow tab alone) through Jun-30-2026 | Needed for seasonality and inflection |
| Consensus estimates | Y | CIQ Estimates Report → Consensus (as of Aug-05-2026); target price, EPS/revenue consensus with No. of Estimates | Needed for market bar |
| Estimate revisions | Y | CIQ Estimates Report → Revisions, Recent Changes, Trends tabs | Needed for revision momentum |
| Earnings transcript | Y — VERBATIM | Q1 FY26 call (May-06-2026) and Q2 FY26 call (Aug-05-2026), both full CIQ transcripts (Call Participants / Presentation / Q&A) | Needed for management tone and driver detail |
| Segment P&L | Y | CIQ Financials_Annual/Quarterly → Segments tab (Mobility / Delivery / Freight); 10-K segment note | Needed for mix shift |
| Current price | Partial — not a standalone quote file, but implied via CIQ Estimates (Target Price mean $102.03) and Comparable Analysis workbook; no dated spot-price screenshot in pool | Needed only for master-level stock reaction context |

## 4. Cross-Module Availability

| Business-Model Output | Available? (Y/N) |
|---|---|
| 03_segment-map.md | Y — `analyses/UBER_2026-08-08/business-model/03_segment-map.md` exists |
| 06_value-chain.md | Y — `analyses/UBER_2026-08-08/business-model/06_value-chain.md` exists |
| 10_external-dependency.md | Y — `analyses/UBER_2026-08-08/business-model/10_external-dependency.md` exists |

The full business-model module (00 through 99, plus the consolidated dossier) has completed for this run, so downstream earnings agents can read segment structure, value-chain/pricing-power context, and external-dependency findings directly rather than re-deriving them.

## 5. Partial-Data Flags

| Missing Data | Applies? (Y/N) | Affected Agents | Cap Applied |
|---|---|---|---|
| No consensus / estimate data | N — consensus, guidance, surprise, trends, and revisions are all present and current (as of Aug-05-2026) | 04, 05, 99 | None |
| No quarterly data | N — quarterly income statement, balance sheet, cash flow, and segments run through Jun-30-2026 | 01, 02, 03, 06 | None |
| No VERBATIM transcript, sell-side proxy present | N — both available call sources (Q1 FY26, Q2 FY26) are VERBATIM CIQ transcripts, not sell-side proxies | 02, 03, 04 | None |
| No transcript AND no sell-side proxy | N — two verbatim transcripts present | 02, 03, 04 | None |
| No segment-level P&L | N — Segments tab present in both annual and quarterly CIQ workbooks, and in the 10-K segment note | 02, 03, 99 | None |
| No cash flow statement | N — full CFO/capex/FCF series present through Jun-30-2026 | 06, 99 | None |
| No current price | Partial — no dated spot-price screenshot; a target-price/consensus proxy exists but not a standalone quote | 99 | Master-level stock-reaction commentary should note the price is sourced from the CIQ consensus/comps exports, not a dated quote, and should request a current-price confirmation before precision statements about "stock reaction" |

## 6. Sufficiency Verdict

- **Verdict:** Sufficient
- **Reason:** The pool has the most recent annual filing (FY2025 10-K), the latest quarterly filing (Q2 FY2026 10-Q, filed 3 days before this triage) with a verbatim earnings-call transcript for the same quarter, and a complete income statement, balance sheet, and cash flow statement (both annual and quarterly, through Jun-30-2026) plus current consensus, guidance, and revision data — clearing the Sufficient bar on every required leg.
- **Active partial-data caps:** None of the hard score caps in `MODULE_RULES.md` are triggered. The only soft note is the absence of a dated spot-price file, which limits only the master-level "stock reaction" framing (99) and does not cap any earnings-module score.
- **Critical missing items:** None. (Two minor, non-blocking observations: (1) the two `EstimatesReport` workbooks are duplicates — byte-identical Consensus-tab content — so downstream agents should treat them as one source, not two independent confirmations; (2) no dedicated investor-deck file is in the pool, but this is not a sufficiency requirement and is covered adequately by the CIQ Report Landscape snapshot and filings.)



---

## earnings / 01_historical-financials.md

_Source: `01_historical-financials.md`_

# Historical Financials — UBER

Reporting standard: US GAAP. Reporting currency: USD (millions, except per-share items). Fiscal year end: December 31. Uber is a Delaware corporation listed on the NYSE (US SEC filer) — US form names below (10-K, 10-Q) are the company's actual primary documents, not jurisdiction placeholders [FY25 10-K, p.1].

## 1. Annual Financial Table (3–5 years)

All figures in USD millions except EPS. FY0 = FY2025 (year ended Dec-31-2025), the latest audited annual filing [FY25 10-K].

| Metric | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| Revenue | 17,455 | 31,877 | 37,281 | 43,978 | 52,017 | Decelerating |
| Revenue YoY % | — | +82.6% | +17.0% | +18.0% | +18.3% | Decelerating |
| Gross Profit [a] | 6,227 | 9,805 | 13,835 | 16,495 | 20,025 | Volatile |
| Gross Margin % | 35.7% | 30.8% | 37.1% | 37.5% | 38.5% | Volatile |
| EBITDA (reported) [b] | (2,932) | (885) | 1,933 | 3,536 | 6,312 | Accelerating |
| EBITDA Margin % | (16.8%) | (2.8%) | 5.2% | 8.0% | 12.1% | Accelerating |
| EBIT | (3,834) | (1,832) | 1,110 | 2,799 | 5,565 | Accelerating |
| EBIT Margin % | (22.0%) | (5.7%) | 3.0% | 6.4% | 10.7% | Accelerating |
| EPS (diluted) | $(0.28) | $(4.65) | $0.87 | $4.56 | $4.73 | Volatile |
| CFO | (445) | 642 | 3,585 | 7,137 | 10,099 | Decelerating |
| Capex | (298) | (252) | (223) | (242) | (336) | Stable |
| FCF (CFO − \|Capex\|) [c] | (743) | 390 | 3,362 | 6,895 | 9,763 | Decelerating |
| Working Capital [d] | (205) | 396 | 1,843 | 769 | 1,673 | Volatile |
| Net Debt (strict) [e] | 7,309 | 7,509 | 7,022 | 5,543 | 5,197 | Stable (declining) |
| Net Debt / EBITDA | NM (neg. EBITDA) | NM (neg. EBITDA) | 3.63x | 1.57x | 0.82x | Stable (declining) |

[a] "Gross Profit" is not a GAAP line item Uber discloses — it is Capital IQ's standardized Total Revenue minus its standardized Cost of Goods Sold [CIQ Financials_Annual.xls → Income Statement]. See §3 note on a data-quality artifact in the quarterly breakout of this line.
[b] "EBITDA (reported)" = GAAP Income from operations + D&A, Capital IQ standardized [CIQ Financials_Annual.xls → Income Statement]. This is NOT the company's own non-GAAP "Adjusted EBITDA" (see §4) — the two differ by ~$2.4bn in FY2025 because Adjusted EBITDA also adds back stock-based compensation and other items.
[c] FCF = CFO − |Capex|, per module standard (capex convention: absolute value of a negative cash-flow-statement figure) [MODULE_RULES.md §Calculation Standards].
[d] Working Capital = Total Current Assets − Total Current Liabilities [CIQ Financials_Annual.xls → Balance Sheet].
[e] Net Debt (strict) = Total Debt − Cash and Equivalents only (excludes short-term/long-term investments), computed by this agent per the module's strict definition, using Total Debt and Cash and Equivalents as they appear in [CIQ Financials_Annual.xls → Balance Sheet]. Capital IQ's own "Net Debt" field nets a broader, not-fully-decomposable cash/investment base and is NOT used here to avoid mixing bases — see CLAUDE §15 basis-labeling requirement.

Growth-rate and margin-delta arithmetic (computed via Python, shown for verification): Revenue YoY 2022 = (31,877−17,455)/17,455 = +82.6%; 2023 = (37,281−31,877)/31,877 = +17.0%; 2024 = (43,978−37,281)/37,281 = +18.0%; 2025 = (52,017−43,978)/43,978 = +18.3%. EBITDA margin bps change: 2022 +1,402bps; 2023 +796bps; 2024 +286bps; 2025 +409bps. EBIT margin bps change: 2022 +1,630bps; 2023 +870bps; 2024 +340bps; 2025 +430bps. Gross margin bps change: 2022 −492bps; 2023 +635bps; 2024 +40bps; 2025 +99bps.

FY2022's revenue jump (+82.6%) reflects post-pandemic Mobility-demand recovery plus a revenue-recognition/gross-vs-net presentation change in certain markets disclosed in that period's filings — it is a base-effect/classification event, not a repeatable growth rate; FY2023–FY2025 (+17.0% to +18.3%) is the more representative recent run-rate. FY2022's Gross Margin dip (30.8%, from 35.7% in FY2021) coincides with the same reclassification and is why the Gross Profit/Gross Margin row is marked Volatile rather than a clean trend.

## 2. TTM Snapshot

Latest TTM = twelve months ended Jun-30-2026 (Q3 FY25 + Q4 FY25 + Q1 FY26 + Q2 FY26). Prior TTM = twelve months ended Jun-30-2025 (Q3 FY24 + Q4 FY24 + Q1 FY25 + Q2 FY25). Figures computed by summing the four constituent quarters from the CIQ quarterly workbook; the latest-TTM revenue/EBITDA/EBIT figures independently tie out to the CIQ Annual workbook's own "LTM Jun-30-2026" column.

| Metric | Latest TTM | Prior TTM | Change | Evidence |
|---|---:|---:|---:|---|
| Revenue | 55,227 | 47,331 | +16.7% | [CIQ Financials_Quarterly.xls → Income Statement; cross-checked to CIQ Financials_Annual.xls → Income Statement, "LTM Jun-30-2026" column = 55,227] |
| EBITDA (reported) | 7,474 | 5,230 | +42.9% | [CIQ Financials_Quarterly.xls → Income Statement; cross-checked to CIQ Financials_Annual.xls "LTM" EBITDA = 7,474] |
| EBIT | 6,700 | 4,509 | +48.6% | [CIQ Financials_Quarterly.xls → Income Statement; cross-checked to CIQ Financials_Annual.xls "LTM" EBIT = 6,700] |
| EPS diluted | $4.58 | $5.91 [f] | −22.5% | [CIQ Financials_Annual.xls → Income Statement, "LTM" column = 4.58; prior-TTM computed from CIQ Financials_Quarterly.xls → Income Statement (NI to Common $12,626M ÷ average diluted shares 2,136.0M)] |
| CFO | 10,424 | 8,789 | +18.6% | [CIQ Financials_Quarterly.xls → Cash Flow; cross-checked to CIQ Financials_Annual.xls "LTM" CFO = 10,424] |
| Capex | (308) | (249) | +23.7% (higher spend) | [CIQ Financials_Quarterly.xls → Cash Flow; cross-checked to CIQ Financials_Annual.xls "LTM" capex = (308)] |
| FCF | 10,116 | 8,540 | +18.5% | Computed: CFO − \|Capex\| for each TTM period |
| Net debt at latest period-end [e] | $9,861M (as of Jun-30-2026) | $5,904M (as of Jun-30-2025) | +$3,957M | [CIQ Financials_Quarterly.xls → Balance Sheet: Total Debt 14,731 − Cash and Equivalents 4,870 (Jun-30-2026); Total Debt 12,342 − Cash and Equivalents 6,438 (Jun-30-2025)] |

[f] Prior-TTM diluted EPS is a computed figure (NI to Common ÷ average diluted share count across the four constituent quarters), not a number that appears verbatim in any single source, since Capital IQ only publishes one "LTM" column (for the most recent period). The simple sum of the four quarterly diluted-EPS figures gives $5.87, close to the $5.91 share-weighted figure; the small gap is the effect of quarter-to-quarter share-count changes on a simple sum. Both math paths point to the same conclusion: TTM diluted EPS fell materially even as EBITDA, EBIT, CFO, and FCF all grew double-digits — see §6.

Net debt is a point-in-time balance-sheet figure, not a TTM flow — the "change" column above compares two balance-sheet dates a year apart, not two summed TTM flows.

## 3. Latest Quarterly Trend Table (8 quarters)

Figures in USD millions except EPS and margins. Source: CIQ Financials_Quarterly.xls tabs (Income Statement, Cash Flow), cross-checked against the Q1 FY26 and Q2 FY26 10-Qs for the two most recent quarters.

| Metric | Q3'24 | Q4'24 | Q1'25 | Q2'25 | Q3'25 | Q4'25 | Q1'26 | Q2'26 | QoQ Trend | YoY vs Same Q |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| Revenue | 11,188 | 11,959 | 11,533 | 12,651 | 13,467 | 14,366 | 13,203 | 14,191 | Decelerating | +12.2% (Q2'26 vs Q2'25) |
| Gross Margin % [g] | 33.4% | 49.7%† | 34.1% | 34.3% | 34.3% | 49.6%† | 39.2% | 39.3% | Volatile | +492bps (Q2'26 vs Q2'25) |
| EBITDA (reported) | 1,247 | 946 | 1,406 | 1,631 | 1,308 | 1,967 | 2,114 | 2,085 | Accelerating | +27.8% (Q2'26 vs Q2'25) |
| EBITDA Margin % | 11.1% | 7.9% | 12.2% | 12.9% | 9.7% | 13.7% | 16.0% | 14.7% | Accelerating | +180bps (Q2'26 vs Q2'25) |
| EPS (diluted) | $1.20 | $3.21 | $0.83 | $0.63 | $3.11 | $0.14 | $0.13 | $1.17 | Volatile | +85.7% (Q2'26 vs Q2'25) |

† **Data-quality flag on the two Q4 columns (Q4'24, Q4'25):** US filers do not report a standalone Q4 10-Q — Capital IQ derives Q4 as (audited full-year 10-K total) minus (sum of the three reported 10-Q quarters), which is standard practice and does not distort line items that are consistent between the annual and quarterly templates (confirmed: summed quarterly Operating Income exactly ties to each year's reported annual Operating Income). However, Capital IQ's "Cost of Goods Sold" field is built on a different cost-line classification in its "Reclassified" annual template than in its quarterly template (verified against the Q2 FY26 10-Q: GAAP "Cost of revenue" $7,815M + "Operations and support" $805M = CIQ's quarterly COGS of $8,620M for Q2'26 exactly, but the annual-template COGS does not reconcile the same way). Because Q4 is a plug (Annual − 9 months), this classification gap concentrates entirely into the Q4 column, producing an artificially elevated Q4 gross margin (≈49.6–49.7%) that does not reflect an actual quarterly step-change — it is a vendor-classification artifact, not a real one-quarter margin swing. EBITDA, EBIT, and EPS do not have this problem (their quarterly sums tie exactly to audited annual totals), so they are the more reliable margin/profitability read across quarters.

[g] Gross Margin % here uses the same CIQ-standardized Gross Profit definition as §1[a].

**Q1 FY2026 revenue deceleration:** Revenue fell 8.1% quarter-on-quarter from Q4'25 to Q1'26 — this is the normal seasonal Q4→Q1 pattern (see §5) and is not itself an alarm; the more relevant signal is that YoY growth cooled to +14.5% (Q1'26) and +12.2% (Q2'26), down from the +18–20% band that held through all of FY2025 — see §6.

**GAAP EPS volatility is driven by items below the operating line, not by operations:** Q3'25's $3.11 and Q2'26's $1.17 diluted EPS both include large unrealized mark-to-market gains on Uber's minority equity stakes (Gain (Loss) On Sale Of Invest. was +$1,471M in Q3'25 and +$1,612M in Q2'26 [CIQ Financials_Quarterly.xls → Income Statement]); Q4'25 and Q1'26's low EPS ($0.14, $0.13) reflect the same line item swinging to losses of $(1,602)M and $(1,474)M in those quarters. EBITDA and EBIT do not include this line item and show a much steadier climb across the same eight quarters.

## 4. Reported vs Adjusted Metrics

| Metric | Reported Value | Adjusted Value | Adjustment Amount | Adjustment Reason | Evidence |
|---|---:|---:|---:|---|---|
| EBITDA (FY2025) | $6,284M (GAAP Income from operations $5,565M + D&A $719M, per the company's own reconciliation table) | $8,730M (company-disclosed "Adjusted EBITDA") | +$2,446M | Adds back stock-based compensation $1,826M; legal, non-income-tax and regulatory reserve changes/settlements $564M; acquisition, financing and divestiture-related expenses $43M; restructuring and related charges $9M; loss on lease arrangement, net $2M; goodwill and asset impairments/loss on sale of assets, net $2M (sums to $2,446M, reconciling exactly to $6,284M + $2,446M = $8,730M) | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| EBIT (FY2025) | $5,565M (GAAP Income from operations) | Not separately disclosed | n/a | Uber's disclosed non-GAAP measures are Adjusted EBITDA and Free Cash Flow; it does not present a distinct non-GAAP operating-income/EBIT figure | [FY25 10-K, Consolidated Statements of Operations; FY25 10-K Non-GAAP Measures section] |
| EPS (FY2025) | $4.73 diluted (GAAP) | Not disclosed | n/a | Company does not disclose an adjusted/non-GAAP EPS measure | [FY25 10-K, Consolidated Statements of Operations] |

**Material disclosure change flagged for downstream agents:** Beginning Q1 FY2026, Uber discontinued its segment-level "Segment Adjusted EBITDA" non-GAAP measure and replaced it with "Segment Operating Income" [Q1 FY26 10-Q; Q2 FY26 10-Q, both stating: "Beginning in the first quarter of 2026, we changed our segment operating performance measure from Segment Adjusted EBITDA to Segment Operating Income... Segment results for the comparable prior period have been recast to reflect these changes"]. At the consolidated level, the term "EBITDA" does not appear anywhere in the Q2 FY2026 10-Q outside that one segment-methodology sentence, and does not appear at all in either the Q1 FY2026 or Q2 FY2026 earnings-call transcripts in this data pool [Q1 FY26 10-Q; Q2 FY26 10-Q; Q1 FY26 earnings call, May-06-2026; Q2 FY26 earnings call, Aug-05-2026 — reviewed and confirmed absent]. FY2025's $8,730M Adjusted EBITDA [FY25 10-K] is therefore the last disclosed figure of its kind in this data pool; no consolidated non-GAAP profitability reconciliation is available for Q1 or Q2 FY2026. This is a comparability break, not a data gap this agent can fill — the `03_margin-drivers` and `06_earnings-quality` agents should treat any FY2026 "Adjusted EBITDA" figure quoted elsewhere (e.g., a sell-side note or press release not in this pool) with caution until its definition is confirmed against a primary source.

## 5. Quarterly Seasonality Table (last 3 fiscal years)

| Quarter | FY2023 Rev Share | FY2024 Rev Share | FY2025 Rev Share | Avg Rev Share | FY2023 EBITDA Margin | FY2024 EBITDA Margin | FY2025 EBITDA Margin |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q1 | 23.7% | 23.0% | 22.2% | 23.0% | (0.6%) | 3.6% | 12.2% |
| Q2 | 24.8% | 24.3% | 24.3% | 24.5% | 5.8% | 9.1% | 12.9% |
| Q3 | 24.9% | 25.4% | 25.9% | 25.4% | 6.4% | 11.1% | 9.7% |
| Q4 | 26.7% | 27.2% | 27.6% | 27.2% | 8.6% | 7.9%‡ | 13.7%‡ |

No quarter breaches the >30% or <20% flag threshold, so this is not classified as a hard seasonality flag — but there is a consistent, real pattern: Q1 is the smallest revenue quarter and Q4 the largest in all three fiscal years shown (a ~4.2-point spread between Q1's 23.0% average share and Q4's 27.2% average share), consistent with Mobility/Delivery demand being seasonally lower in Q1 (post-holiday) and higher in Q4 (holiday season, year-end travel). ‡ Q4 EBITDA margin figures should be read alongside the §3 Q4 gross-margin caveat — EBITDA itself is not subject to the same classification-plug artifact (its quarterly sums tie exactly to audited annual totals), so the Q4 EBITDA margin figures above are usable as reported, unlike Q4 gross margin.

## 6. Key Trend Summary

Revenue growth is decelerating from a stable ~17–18% annual run-rate in FY2023–FY2025 to +14.5% (Q1 FY2026) and +12.2% (Q2 FY2026) year-on-year in the two most recent quarters [CIQ Financials_Quarterly.xls → Income Statement] — FY2022's +82.6% print was a post-pandemic recovery and revenue-recognition-classification event, not a repeatable base rate. Margins are expanding: EBITDA margin has risen every year for five straight years, from (16.8%) in FY2021 to 12.1% in FY2025 (+409bps in FY2025 alone) [FY25 10-K; CIQ Financials_Annual.xls], and the two most recent quarters (16.0% and 14.7% EBITDA margin) sit 310–180bps above their year-ago comparators — profitability is expanding faster than revenue is decelerating so far. There is real but moderate seasonality: Q1 is consistently the smallest revenue quarter (~23.0% of the year) and Q4 the largest (~27.2%), a pattern that has held in all three fiscal years examined, though it does not cross the module's >30%/<20% hard-flag threshold. The clearest inflection points in the last five years are: (1) FY2022→FY2023, when Uber's cash flow from operations turned durably positive (from $(445)M to $642M, then to $3,585M in FY2023) and free cash flow followed the same path — a structural shift from cash-burn to cash-generation; and (2) a leverage reversal after Jun-30-2025: net debt (strict basis) had declined every year from FY2022's $7,509M to FY2025's $5,197M (Net Debt/EBITDA falling from 3.63x to 0.82x), but then rose to $9,861M by Jun-30-2026 (Net Debt/EBITDA back up to ~1.32x on an LTM EBITDA basis), driven by $6,904M of trailing-twelve-month share buybacks against $10,424M of trailing CFO [CIQ Financials_Quarterly.xls → Cash Flow, Balance Sheet] — a capital-allocation shift toward returning cash to shareholders that downstream balance-sheet/survival work should pick up. A third, non-obvious finding: GAAP diluted EPS is not tracking the operating trend at all — TTM diluted EPS actually fell 22.5% (from $5.91 to $4.58) even as TTM EBITDA rose 42.9%, TTM EBIT rose 48.6%, and TTM FCF rose 18.5% [see §2], because GAAP net income is dominated in several recent quarters by large, non-operating mark-to-market swings on Uber's minority equity stakes (e.g., +$1,612M in Q2'26, −$1,602M in Q4'25) and, in FY2024, a one-off $6.0B deferred-tax valuation-allowance release [FY25 10-K; CIQ Financials_Quarterly.xls → Income Statement] — the operating-earnings trend (revenue, EBITDA, EBIT, FCF) is the more representative read of the business than the reported EPS line.

## 7. Citations

[1] Uber Technologies, Inc. Form 10-K, filed Feb-13-2026 (fiscal year ended Dec-31-2025) — Consolidated Statements of Operations, Balance Sheets, Statements of Cash Flows, and "Adjusted EBITDA reconciliation" table in the Non-GAAP Financial Measures section
[2] Uber Technologies Inc NYSE:UBER Financials_Annual.xls (Capital IQ export) → Income Statement tab, annual series FY2016–FY2025 + LTM Jun-30-2026 column
[3] Uber Technologies Inc NYSE:UBER Financials_Annual.xls → Balance Sheet tab, annual series FY2016–FY2025 + Jun-30-2026 column
[4] Uber Technologies Inc NYSE:UBER Financials_Annual.xls → Cash Flow tab, annual series FY2016–FY2025 + LTM Jun-30-2026 column
[5] Uber Technologies Inc NYSE:UBER Financials_Quarterly.xls → Income Statement tab, quarterly series Q1 FY2018–Q2 FY2026
[6] Uber Technologies Inc NYSE:UBER Financials_Quarterly.xls → Cash Flow tab, quarterly series Q1 FY2018–Q2 FY2026
[7] Uber Technologies Inc NYSE:UBER Financials_Quarterly.xls → Balance Sheet tab, quarterly series Q1 FY2018–Q2 FY2026
[8] Uber Technologies, Inc. Form 10-Q, filed May-06-2026 (Q1 FY2026, period ended Mar-31-2026)
[9] Uber Technologies, Inc. Form 10-Q, filed Aug-05-2026 (Q2 FY2026, period ended Jun-30-2026)
[10] Uber Technologies, Inc., Q1 2026 Earnings Call transcript, May-06-2026 (verbatim CIQ transcript)
[11] Uber Technologies, Inc., Q2 2026 Earnings Call transcript, Aug-05-2026 (verbatim CIQ transcript)

All annual and quarterly growth rates, margin percentages, basis-point deltas, TTM sums, FCF, and Net Debt/EBITDA figures in this report were computed by an executed Python script from the source figures cited above (not derived mentally); the script and its output were reviewed before being transcribed into these tables.



---

## earnings / 02_revenue-drivers.md

_Source: `02_revenue-drivers.md`_

# Revenue Drivers — UBER

Reporting standard: US GAAP. Reporting currency: USD. Uber is a Delaware corporation listed on the NYSE (US SEC filer); US form names below (10-K, 10-Q) are the company's actual primary documents [FY25 10-K, p.1]. A verbatim earnings-call transcript exists for the two most recent quarters (Q1 FY26, Q2 FY26), so management commentary below is cited to the call directly, not a sell-side proxy.

## 1. Segment Decomposition Status

Segment decomposition applied — 3 segments (Mobility, Delivery, Freight) from the business-model module's `03_segment-map.md`. Mobility is 51.9% of Q2 FY26 quarterly revenue (down from 57.0% of FY25 full-year revenue), Delivery 37.0% (up from 33.2%), Freight 11.2% (up from 9.8%) [Q2 FY26 10-Q, MD&A "Segment Results of Operations"; business-model `03_segment-map.md` §1]. Mobility remains below the module's 85% single-segment threshold, so this report decomposes drivers at both the consolidated and segment level.

## 2. Revenue Driver Tree

| Business Type | Revenue Formula |
|---|---|
| Marketplace | GMV × take rate |

Uber discloses this exact chain as its own operating framework: **MAPCs (Monthly Active Platform Consumers) × Trips per MAPC = Trips; Trips × average booking value per Trip = Gross Bookings; Gross Bookings × Revenue Margin (revenue as a % of Gross Bookings) = Revenue** [Q2 FY26 10-Q, Item 2 "Certain Key Metrics"; Q2 FY26 10-Q, p.923 non-GAAP/KPI definitions]. Revenue Margin is not a fixed take rate — it moves with segment mix (Mobility, Delivery, Freight all carry different margins), pricing/incentive decisions, and — as of Q1 FY2026 — a one-off accounting reclassification in the UK described in Section 4 below.

## 3. Market / Share / Price / Mix Split

| Driver Bucket | Current Direction | Evidence | Importance /100 |
|---|---|---|---:|
| End-market demand | Improving | Trips grew 18% YoY to 3.9 billion in Q2 FY26, the fourth consecutive quarter of Gross Bookings growth above 20%; MAPCs +16% YoY [Q2 FY26 10-Q, MD&A Highlights; Q2 FY26 transcript, CEO prepared remarks] | 80 |
| Company market share | Improving (company-reported, not independently verified) | CFO: "our category position in these markets is actually higher today than it was a year ago" (US Mobility); management also states Delivery "gained category position in all of our large markets" [Q2 FY26 transcript, CFO Q&A]. No independent third-party market-share data is in this pool — these are Uber's own internal estimates, not audited or externally sourced | 40 |
| Price / realization | Mixed | Consolidated Revenue Margin (revenue ÷ Gross Bookings) fell from 27.06% (Q2 FY25: $12,651M / $46,756M) to 24.46% (Q2 FY26: $14,191M / $58,022M) — a ~260bp YoY decline, computed by this agent, but this is dominated by the UK reclassification (Section 4), not a broad fare cut; management also describes deliberately lower Mobility fares in California, funded by an insurance-cost tailwind being "reinvested… back into the market" [Q2 FY26 transcript, CFO Q&A]; Freight revenue rose on both trip volume and revenue per load [Q2 FY26 10-Q, MD&A Freight Segment] | 60 |
| Product / customer / geography mix | Deteriorating for consolidated take rate | Delivery's revenue share rose from 33.2% (FY25) to 37.0% (Q2 FY26), Freight from 9.8% to 11.2%, while Mobility fell from 57.0% to 51.9% [`03_segment-map.md` §1; Q2 FY26 10-Q]. Because Delivery and Freight structurally carry different Revenue Margins than Mobility, this mix shift alone changes the consolidated blended take rate | 35 |
| FX translation | Tailwind | Q2 FY26 revenue grew 12% reported vs. 11% constant-currency (≈+1pp FX tailwind); Gross Bookings grew 24% reported vs. 22% constant-currency (≈+2pp FX tailwind) [Q2 FY26 10-Q, MD&A Financial and Operational Highlights table] | 20 |
| M&A / divestitures | Net headwind today; large positive optionality pending | Delivery's reported growth is currently being held back on a net basis: Trendyol Go (closed back-half June 2025, a large Turkey delivery acquisition) is fully lapping in Q3 FY26, only partly replaced by the smaller Getir acquisition and a Careem reconsolidation — CFO: "on the whole, it is a headwind to delivery reported growth on a net basis" [Q2 FY26 transcript, CFO Q&A]. Separately, Uber signed a binding agreement (Jul-16-2026) to acquire Delivery Hero for €41.50/share cash (~$14.8bn implied equity value for 100%), expected to close in H2 2027 — not yet consolidated, and Uber is funding it partly via a €14.2bn bridge facility executed the same day [Q2 FY26 10-Q, Note — "Pending Acquisition of Delivery Hero"]. A smaller pending deal, Blacklane (chauffeur service, ~$550M cash), is expected to close in 2026 [Q2 FY26 10-Q, same Note] | 45 (rising toward High once Delivery Hero closes) |

## 4. Revenue Driver Table (consolidated)

Magnitude: High = >5% revenue impact from a reasonable move; Mid = 2–5%; Low = <2%.

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Trip / Gross Bookings volume | Trips +18% YoY (3.9bn, Q2 FY26); Gross Bookings +22% YoY constant currency ($58.0bn) | Improving | High | [Q2 FY26 10-Q, MD&A Highlights] |
| MAPC growth (new/returning users) | 208 million MAPCs, +16% YoY | Improving | High | [Q2 FY26 10-Q, MD&A Highlights] |
| Trip frequency (Trips per MAPC) | +2% YoY | Stable/Improving (modest) | Low | [Q2 FY26 10-Q, MD&A Highlights] |
| UK Mobility business-model reclassification | Reduced Q2 FY26 revenue by $1.1bn (six-month impact: $2.1bn); effective Jan-2-2026, driver payments moved from cost of revenue to a reduction of revenue after the VAT Order 1987 ceased applying to Uber UK | Deteriorating (reported-revenue optics only; recurs each quarter until lapped ~Jan 2027) | High | [Q2 FY26 10-Q, MD&A Highlights and "Components of Results of Operations"; Q2 FY26 10-Q, Note 11 "United Kingdom"] |
| Segment mix (Delivery/Freight vs. Mobility) | Delivery 37.0%, Freight 11.2%, Mobility 51.9% of Q2 FY26 revenue, vs. 33.2%/9.8%/57.0% in FY25 | Deteriorating for blended take rate | Mid | [`03_segment-map.md` §1; Q2 FY26 10-Q] |
| FX translation | +1pp revenue tailwind, +2pp Gross Bookings tailwind (Q2 FY26 reported vs. constant currency) | Improving (tailwind; historically has swung both ways — FY2025 was a ~1pp FX headwind on Gross Bookings) | Low–Mid | [Q2 FY26 10-Q; FY25 10-K, MD&A] |
| M&A (Delivery segment, near-term) | Trendyol Go lapping Q3 FY26 (net headwind), partly offset by Getir and Careem reconsolidation | Deteriorating (near-term reported growth), turning neutral by Q4 FY26 | Mid | [Q2 FY26 transcript, CFO Q&A] |
| M&A (Delivery Hero, pending) | ~$14.8bn implied equity value, ~100 combined markets, expected close H2 2027 | Not yet in the base — future positive optionality | High (once closed) / None today | [Q2 FY26 10-Q, Note — "Pending Acquisition of Delivery Hero"] |
| Insurance-cost tailwind reinvested into US pricing | Cited as a driver of US Mobility acceleration, particularly California | Improving (tailwind, stated for "this year" only) | Mid | [Q2 FY26 transcript, CFO Q&A] |
| Product innovation (Reserve, U4B, Black, Wait & Save) | U4B (Uber for Business) +40% YoY; Uber Health "growing even faster" | Improving | Low–Mid | [Q2 FY26 transcript, CFO Q&A] |
| Sparse-market penetration (US) | <10% of eligible consumers in US sparse markets used Uber in the past 12 months, vs. >50% in dense markets | Improving (long runway, early stage) | Mid (over multiple years) | [Q2 FY26 transcript, CFO Q&A] |
| World Cup 2026 (US/Mexico/Canada, Jun–Jul 2026) | CFO: "the World Cup definitely was a benefit, but it was as expected to a large extent" | One-time, non-run-rate; boosts Q2/Q3 FY26 US Mobility comps only | Low (company describes it as within expectations, not the primary driver) | [Q2 FY26 transcript, CFO Q&A] |
| Freight market cycle | FY2025 Gross Bookings -1% constant currency ("challenging freight market cycle"); Q2 FY26 Gross Bookings +25% constant currency, "due to an increase in gross booking per trip and trip volume" | Improving (inflecting from trough — see cycle note below) | Low (Freight is 11.2% of revenue and still loss-making) | [FY25 10-K, MD&A; Q2 FY26 10-Q, MD&A Freight Segment] |
| Driver-classification / labor regulation | Ongoing litigation and legislation in the US and abroad; city/state cost items already imposed (Chicago per-trip surcharge, SF surcharge, Washington state minimum-pay law, California Prop 22) | Stable-to-deteriorating (persistent, unresolved) | High if a large-market reclassification ruling occurs; currently priced as a background risk | [`10_external-dependency.md` §1, §5; FY25 10-K, Item 1A] |

## 5. Revenue Drivers By Segment

### Segment: Mobility (51.9% of Q2 FY26 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Gross Bookings (trip volume) | +22% YoY constant currency, "primarily due to an increase in Mobility Trip volumes" | Improving | High | [Q2 FY26 10-Q, MD&A Highlights] |
| Reported revenue growth (post-UK effect) | Mobility revenue +$75M, or +1%, Q2 FY26 vs. Q2 FY25 — ex the $1.1bn UK effect, revenue would have grown ≈+16% (computed: ($7,363M+$1,100M−$7,288M)/$7,288M) | Deteriorating on reported basis / Improving on an ex-UK basis | High | [Q2 FY26 10-Q, MD&A "Mobility Segment"; UK effect from same source, growth computed by this agent] |
| UK business-model reclassification | -$1.1bn Q2 FY26 revenue impact; Segment Operating Income helped by an $813M decrease in Driver payments and incentives from the same change | Deteriorating (revenue optics); roughly margin-neutral to Segment Operating Income dollars | High | [Q2 FY26 10-Q, MD&A "Mobility Segment"] |
| Insurance-cost tailwind / US pricing reinvestment | Explicit driver of California trip-growth "inflection"; SF/LA trip growth "meaningfully outpaced the rest of the country" | Improving | Mid | [Q2 FY26 transcript, CFO Q&A] |
| Product mix (premium and affordable tiers) | Reserve, U4B (+40% YoY), Black on premium; Wait & Save on affordable | Improving | Low–Mid | [Q2 FY26 transcript, CFO Q&A] |
| Sparse-market penetration | <10% used in past 12 months vs. >50% in dense US markets | Improving (multi-year runway) | Mid | [Q2 FY26 transcript, CFO Q&A] |
| Autonomous vehicles | Management calls AV "one of the largest opportunities in Uber's history" but "the numbers are small at this point" | Not a current revenue driver; future optionality | Low today | [Q2 FY26 transcript, CEO prepared remarks and Q&A] |
| Pending Blacklane acquisition | ~$550M cash, chauffeur service, expected close 2026 | Not yet consolidated | Low (small relative to segment) | [Q2 FY26 10-Q, Note — "Pending Acquisition of Blacklane"] |
| Airport / large-metro concentration | 15% of FY25 Mobility Gross Bookings from airport trips | Risk factor, not a current negative signal | Mid (concentration risk) | [`03_segment-map.md` §1; FY25 10-K, p.3275] |

### Segment: Delivery (37.0% of Q2 FY26 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Gross Bookings (trip volume) | +25% (Q2, reported YoY) / +26% constant currency ($1.1bn revenue increase), "driven by an increase in Delivery Trip volumes" | Improving | High | [Q2 FY26 10-Q, MD&A Highlights and "Delivery Segment"] |
| Advertising revenue | +$182M contribution to the Q2 YoY revenue increase (+$362M for six months) | Improving | Low–Mid | [Q2 FY26 10-Q, MD&A "Delivery Segment"] |
| M&A roll-off (Trendyol Go) | Closed back-half June 2025; fully lapping in Q3 FY26; partly replaced by Getir (closed Aug 2026) and Careem reconsolidation | Deteriorating near-term (net headwind to reported growth), normalizing by Q4 FY26 | Mid | [Q2 FY26 transcript, CFO Q&A: "on the whole, it is a headwind to delivery reported growth on a net basis"] |
| Organic delivery growth (ex-M&A) | CFO: "organic delivery business is accelerating quite nicely," strong in the US and internationally, "gained category position in all of our large markets" | Improving | High | [Q2 FY26 transcript, CFO Q&A] |
| Pending Delivery Hero acquisition | ~$14.8bn implied equity value; combination expands reach to ~100 markets, "roughly doubling" the number of markets with combined Mobility+Delivery; expected close H2 2027 | Not yet consolidated — largest single future driver in this segment | High (once closed) / None today | [Q2 FY26 10-Q, Note — "Pending Acquisition of Delivery Hero"; Q2 FY26 transcript, CEO prepared remarks] |
| Merchant concentration | A significant share of Delivery Gross Bookings from a concentrated set of large restaurant/merchant groups (named risk factor) | Stable risk, not a current negative signal | Mid (concentration risk) | [`03_segment-map.md` §1; FY25 10-K, p.2629] |

### Segment: Freight (11.2% of Q2 FY26 revenue)

| Driver | Current Level | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Gross Bookings (volume + price) | Q2 FY26 +25% constant currency, "due to an increase in gross booking per trip AND trip volume" — both price and volume improving together | Improving (cyclical inflection) | Low (small segment, 11.2% of revenue) | [Q2 FY26 10-Q, MD&A "Freight Segment"] |
| Industrial / trucking freight cycle | FY2025 Gross Bookings -1% constant currency ("challenging freight market cycle"); six-month FY26 Gross Bookings only +16% vs. quarterly +25% — Q1 FY26 was materially weaker than Q2, meaning the inflection is recent and not yet a full two-quarter confirmed trend | Improving from a cyclical trough (not yet at a prior peak) | Low | [FY25 10-K, MD&A; Q2 FY26 10-Q, MD&A "Freight Segment"] |
| Segment profitability | Segment Operating Loss narrowed 8% YoY in Q2 FY26 (-$24M vs. -$26M) but the segment remains loss-making | Improving but still negative | Low | [Q2 FY26 10-Q, MD&A "Freight Segment"] |

## 6. Revenue Growth Decomposition

Most recent quarter (Q2 FY2026 vs. Q2 FY2025): Revenue grew from $12,651M to $14,191M, +$1,540M, +12.2% YoY [Q2 FY26 10-Q, MD&A Highlights table]. The table below decomposes that growth; see §6a for the arithmetic behind each pp figure.

| Component | Contribution to Growth (pp) | Evidence |
|---|---:|---|
| Volume (Gross Bookings, constant-currency, trip-driven) | +22.0pp | [Q2 FY26 10-Q, MD&A Highlights: "Overall Gross Bookings increased… up 22% on a constant currency basis… primarily driven by an increase in Trip volumes"] |
| FX | +1.0pp | [Q2 FY26 10-Q, MD&A Highlights: reported revenue growth 12% vs. constant-currency growth 11%] |
| UK Mobility reclassification | -8.7pp | [Q2 FY26 10-Q, MD&A Highlights: "-$1.1 billion" revenue impact; pp figure computed by this agent, see §6a] |
| Take-rate / mix (residual, ex-UK, ex-FX) | -2.1pp | Computed residual — see §6a; not separately quantified by the company |
| Total revenue growth | **12.2pp** | [Q2 FY26 10-Q, MD&A Highlights] |

Sum of components: 22.0 + 1.0 − 8.7 − 2.1 = 12.2pp — reconciles exactly to the stated total (the residual line was solved as a plug to close the gap, so this reconciliation is definitional, not an independent check; see §6a for what is and is not independently verified).

## 6a. Decomposition Attribution and Residual

```
UK Mobility reclassification: $1,100M direct dollar impact [Q2 FY26 10-Q, MD&A Highlights]
  Ex-UK revenue = $14,191M + $1,100M = $15,291M
  Ex-UK growth  = ($15,291M − $12,651M) / $12,651M = +20.87%
  UK effect (pp of growth) = 20.87% − 12.17% (actual reported growth) = 8.70pp
  → Direct dollar subtraction on the same revenue base, disclosed by the company for this
    specific quarter. Not a ratio applied across a different basis — refused to extend
    this exact $1.1bn figure to other quarters without company guidance, though the
    underlying accounting change is structural and will recur each quarter until the
    UK comparison laps in Q1 FY2027 [Q2 FY26 10-Q, Note 11 "United Kingdom"].

FX: reported growth 12% vs. constant-currency growth 11% [Q2 FY26 10-Q, MD&A Highlights]
  → Company-disclosed directly on the same revenue base (not derived by this agent).
    = ~1.0pp of the 12.2pp observed growth.

Volume: Gross Bookings constant-currency growth of 22%, "primarily driven by an increase
in Trip volumes" (Trips +18% YoY, MAPCs +16% YoY, Trips/MAPC +2% YoY) [Q2 FY26 10-Q].
  Basis for treating GB growth ≈ revenue growth driver: FY2025's Gross Bookings growth
  (19% reported / 20% constant currency) tracked FY2025 revenue growth (18%) almost
  exactly [FY25 10-K, MD&A "Highlights for 2025"] — i.e., before the UK reclassification
  existed, GB growth was a reliable one-to-one proxy for revenue growth. Applying that
  same GB-to-revenue linkage to Q2 FY26 is valid ONLY after the UK and FX effects are
  stripped out first (done above) — using the raw 22% GB figure against RAW reported
  revenue growth (12.2%) without removing the UK effect would misapply a pre-2026 basis
  to a post-2026 quarter, which is exactly what this agent refuses to do.
  = 22.0pp of the 12.2pp observed growth (before netting against the other components).

Take-rate / mix residual (ex-UK, ex-FX):
  Ex-UK, ex-FX growth implied = 12.17% − 1.0pp(FX) − (−8.7pp)(UK) = 19.9%
  Gap vs. Gross Bookings constant-currency growth (22.0%) = 19.9% − 22.0% = −2.1pp
  → This is a derived plug, not an independently quoted company ratio. It is consistent
    with (but not proven by) two qualitative facts on record: Delivery and Freight — both
    carrying a different Revenue Margin than Mobility — grew from 43.0% to 48.2% of
    combined segment revenue share YoY [`03_segment-map.md` §1], and management describes
    deliberately lower Mobility fares in California funded by insurance savings [Q2 FY26
    transcript, CFO Q&A]. Labelled as unverified inference, not from filings, beyond the
    arithmetic gap itself.
```

**Reconciliation: 22.0 + 1.0 − 8.7 − 2.1 = 12.2pp reconciled, 0.0pp unassigned residual** — but this "clean" reconciliation is achieved because the take-rate/mix line was solved as the plug that closes the gap, not independently measured. The two directly disclosed, company-sourced components (Volume +22.0pp from Gross Bookings, and the UK reclassification -8.7pp derived from a company-quoted dollar figure) net to +13.3pp on their own — already close to the +12.2pp actual — which means Volume and the UK reclassification together explain the overwhelming majority of the quarter's growth story; FX (+1.0pp, company-disclosed) and the -2.1pp mix/take-rate residual (undisclosed, inferred) are the two smaller, less certain pieces.

## 7. The Single Biggest Revenue Driver

**Trip volume (Gross Bookings), not the UK reclassification, is the single biggest revenue driver going forward.** A 10–20% move in Trips/Gross Bookings growth would swing revenue by a broadly proportional amount once the UK effect fully laps in Q1 FY2027 — Section 6a shows this line alone (+22.0pp of Gross Bookings growth) is larger than the entire 12.2pp of reported revenue growth this quarter, and it is currently improving: four consecutive quarters of Gross Bookings growth above 20%, MAPCs +16% YoY, and management naming three specific, evidenced growth levers (insurance-cost reinvestment into US pricing, product innovation including 40% YoY U4B growth, and under-10%-penetrated US sparse markets) [Q2 FY26 transcript, CFO Q&A]. The UK reclassification (-8.7pp this quarter) is real and large, but it is a mechanical, recurring-but-bounded accounting effect that resolves itself by Q1 FY2027 once both comparison quarters use the same (net) presentation — it does not scale with a "10–20% move" the way trip demand does, and it is not a signal about underlying consumer demand or driver supply. The Street consensus revenue cut concentrated in the days after the Q2 print (FQ3 2026 revenue consensus fell 1.04% in three trading days per `04_guidance-consensus.md` §3) is consistent with the market currently pricing continued UK-driven reported-growth suppression through Q4 FY26, not a Trip-volume deceleration — Trips and Gross Bookings are the variable that would actually move the business, and its current direction is improving.



---

## earnings / 03_margin-drivers.md

_Source: `03_margin-drivers.md`_

# Margin Drivers — UBER

Reporting standard: US GAAP. Reporting currency: USD (millions). Fiscal year end: December 31. All dollar and percentage figures below are transcribed from the FY2025 10-K (filed Feb-13-2026), the Q1 FY2026 10-Q (filed May-06-2026), and the Q2 FY2026 10-Q (filed Aug-05-2026), unless otherwise cited. Basis-point (bps) math is shown inline where a ratio is derived rather than directly disclosed.

## 1. Segment Decomposition Status

`business-model/03_segment-map.md` is available and is used throughout this report. Uber is **not** a single-segment business under the module's >85% threshold: Mobility is 57.0% of FY2025 revenue and 69.1% of FY2025 total segment profit ($7,899M of $11,438M segment Adjusted EBITDA), Delivery is 33.2% of revenue / 31.2% of profit, and Freight is 9.8% of revenue / a small loss (-0.3% of segment profit) [FY25 10-K, Note 13, p.114]. Segment-level profit IS disclosed (not just revenue), so full segment decomposition is possible below.

Two disclosure-quality caveats carry into this report:
- **Segment profit-measure change (comparability break).** Beginning Q1 FY2026, Uber switched its segment operating-performance measure from "Segment Adjusted EBITDA" to "Segment Operating Income" and recast the FY2025 comparable prior-year period on the new basis [Q2 FY26 10-Q, Note 10]. The two measures are not identical (Segment Operating Income includes D&A and other items Adjusted EBITDA excluded), so this report does NOT compare FY2025 segment Adjusted EBITDA margins directly against FY2026 Segment Operating Income margins. All FY2026 segment margin figures below use the recast, comparable Q2'25-vs-Q2'26 Segment Operating Income basis disclosed in the Q2 FY26 10-Q.
- **Consolidated non-GAAP profitability disclosure gap.** FY2025's $8,730M Adjusted EBITDA [FY25 10-K, "Adjusted EBITDA reconciliation" table] is the last disclosed consolidated non-GAAP profitability figure in this data pool. The term "EBITDA" does not appear anywhere in the Q1 or Q2 FY2026 10-Qs or transcripts outside the one segment-methodology sentence [Q1 FY26 10-Q; Q2 FY26 10-Q; Q1 FY26 and Q2 FY26 earnings calls — confirmed absent]. This has a direct consequence for Section 4 below: GAAP operating income (EBIT) margin, not Adjusted EBITDA margin, is now the only consistently disclosed consolidated profitability metric across the FY2025→FY2026 comparison window.

## 2. Sector Overlay

Per `business-model/02_business-identity.md` §3a: *"No row in `frameworks/SECTOR_OVERLAYS.md` matches an on-demand, multi-sided mobility/delivery/freight marketplace platform... No sector overlay for two-sided on-demand mobility/delivery/freight marketplace platform — generic read."* This agent independently re-checked `frameworks/SECTOR_OVERLAYS.md` and found no matching row (not a bank, REIT, SaaS, miner, insurer, E&P, retailer, telecom, asset manager, or pharma). **No sector overlay for UBER — the generic operating-company cost stack applies below, refined by the platform-specific Gross Bookings / take-rate grammar Uber itself discloses** (Revenue = Gross Bookings × take rate for Mobility/Delivery; Revenue ≈ Gross Bookings for Freight, which books on a principal basis) [`business-model/02_business-identity.md` §2].

## 3. Cost Stack

FY2025 vs FY2024, GAAP lines exactly as reported in the 10-K MD&A [FY25 10-K, Item 7, "Results of Operations"]. Percentage-of-revenue columns are the company's own disclosed rounding; the bps-change column is this agent's own precise calculation shown for verification.

| Cost Line | FY2024 ($M / % of rev) | FY2025 ($M / % of rev) | $ Change | Precise bps Change | Direction | Evidence | Margin Risk |
|---|---:|---:|---:|---:|---|---|---|
| Cost of revenue, excl. D&A | $26,651M / 61% | $31,338M / 60% | +$4,684M (+18%) | −35bps (margin-favorable) | Tailwind (mild) | +$1.6bn Driver payments/incentives, +$1.6bn Courier payments/incentives (both scaling with Gross Bookings), +$851M insurance expense "primarily due to an increase in insurance rate per mile and miles driven in our Mobility business" [FY25 10-K, Item 7] | High — this is 60% of revenue, by far the largest cost line; a swing in driver-incentive intensity moves margin more than any other single line |
| Operations and support | $2,732M / 6% | $2,854M / 5% | +$122M (+4%) | −73bps | Tailwind | +$138M headcount costs, partially offset by −$30M contractor expense [FY25 10-K, Item 7] | Low |
| Sales and marketing | $4,337M / 10% | $4,898M / 9% | +$561M (+13%) | −45bps | Tailwind | +$221M indirect advertising/marketing, +$207M consumer discounts/promotions/credits/refunds, +$129M headcount [FY25 10-K, Item 7] | Mid |
| Research and development | $3,109M / 7% | $3,402M / 7% | +$293M (+9%) | −53bps | Tailwind | +$313M headcount costs [FY25 10-K, Item 7] | Low |
| General and administrative | $3,639M / 8% | $3,241M / 6% | −$398M (−11%) | −204bps | Tailwind, but flagged as a lumpy, non-repeatable one-off (see §7a) | −$549M decrease in legal-related accruals and expenses, partially offset by +$65M headcount and +$47M other corporate expenses [FY25 10-K, Item 7] | High — this is the single largest FY2025 margin-driver line, and it reversed direction the very next quarter (see §7) |
| Depreciation and amortization | $711M / 2% | $719M / 1% | +$8M (+1%) | −24bps | Neutral ("not material" per company) | "The change in depreciation and amortization expenses was not material." [FY25 10-K, Item 7] | Low today; rises if AV vehicle fleet/infrastructure investment is capitalized (see §9) |
| Interest expense | Not decomposed | Not decomposed | — | — | — | Below the operating-income (EBIT) line — out of scope for a gross/EBITDA/EBIT margin-drivers report. See `01_historical-financials.md` §3 for how below-the-line items (equity-stake mark-to-market, one-off tax items) drive large GAAP EPS swings unrelated to operating margin. | n/a |

Sum of the six operating-line bps changes above = −434bps (i.e., total operating costs fell 434bps as a share of revenue). This reconciles to the stated FY2025 EBIT margin change of +430bps (`01_historical-financials.md` §1) within 4bps — full reconciliation, no meaningful residual.

## 4. Gross Margin → EBITDA Margin → EBIT Margin Walk

| Margin Level | FY2024 | FY2025 | Change (bps) | Main Reason | Evidence |
|---|---:|---:|---:|---|---|
| Gross margin (CIQ-standardized: Revenue − [Cost of revenue + Operations and support]) | 37.5% | 38.5% | +99bps | Cost-of-revenue leverage (−35bps) plus Operations and support leverage (−73bps); flagged in `01_historical-financials` §1/§3 as a "Volatile" line because of a CIQ Q4-classification artifact — treat the annual figure, not any single quarter, as reliable | `01_historical-financials.md` §1 |
| EBITDA margin (GAAP operating income + D&A, NOT the company's own "Adjusted EBITDA") | 8.0% | 12.1% | +409bps | Broad-based operating leverage across every cost line (§3) | `01_historical-financials.md` §1 |
| EBIT margin (GAAP Income from operations) | 6.4% | 10.7% | +430bps | Same as above, plus the D&A line itself | `01_historical-financials.md` §1; reconciled independently in §3 above |

**Pass-through lag.** `business-model/06_value-chain.md` §2 finds no automatic cost-escalator or indexed-pricing clause: Uber resets its algorithmic fare/fee schedule at its own discretion. The clearest evidence of an actual lag comes from the insurance-cost cycle: Mobility insurance expense rose $851M in FY2025 as "insurance rate per mile" rose [FY25 10-K, Item 7], and management chose NOT to pass this straight through to riders; instead, when March-2026 insurance renewals delivered savings, CFO Krishnamurthy said Uber's "philosophy has been to return that goodness back to the market" via fare cuts in Los Angeles and San Francisco, which "translate[d] to acceleration in trip growth" within the same reporting quarter [Q1 FY26 earnings call, Q&A]. **Pass-through, when it happens, runs same-quarter-to-next-quarter and in the DIRECTION of buying volume (price cuts), not extracting margin (price increases)** — this is the opposite of a typical manufacturer's cost pass-through and is central to how Uber actually uses cost tailwinds (see §5, driver 3).

## 5. Margin Walk — Which Margin Level Matters Most?

**GAAP operating income (EBIT) margin, at both consolidated and segment level, is the most useful metric for Uber going forward — not Adjusted EBITDA.** Three reasons. First, Uber itself stopped disclosing a consolidated non-GAAP Adjusted EBITDA reconciliation after FY2025 (§1) — there is no FY2026 apples-to-apples Adjusted EBITDA figure to track even if an analyst wanted one. Second, the company's own new segment metric is "Segment Operating Income," an EBIT-level measure, not an EBITDA-level one [Q2 FY26 10-Q, Note 10] — management itself has moved the goalposts to EBIT. Third, D&A is a small, non-material swing factor for Uber (1–2% of revenue, §3) precisely because it is an asset-light marketplace that owns no vehicles or trucks (`business-model/06_value-chain.md` §1) — the EBITDA-vs-EBIT gap that matters enormously for a capital-intensive manufacturer barely matters here. Gross margin is a secondary, supporting read only: it is distorted by a known CIQ Q4-classification artifact (`01_historical-financials.md` §3) and is not itself a GAAP-disclosed line (Uber discloses cost of revenue and operating expenses separately, not a "gross profit" subtotal).

## 6. Margin Driver Table (Consolidated)

| Driver | Impact on Margins | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Driver/Courier/Carrier variable payments (cost of revenue) | Largest cost line (55–61% of revenue); scales with Gross Bookings growth but is also where genuine cost discipline shows up | Tailwind (currently — genuine ex-reclassification improvement of ~377bps in Q2'26, see §7a) | High | [FY25 10-K, Item 7; Q2 FY26 10-Q, MD&A Cost of Revenue] |
| Mobility insurance costs | Rose $851M in FY2025 (headwind); March-2026 renewals delivered "hundreds of millions" in savings, but management reinvests the savings into fare cuts rather than banking them as margin | Neutral-to-Tailwind on margin (the cost relief is being spent on volume, not kept as profit) | High on the cost line itself; Low-to-Mid on realized margin because it is given back | [FY25 10-K, Item 7; Q1 FY26 earnings call, Q&A] |
| G&A / legal-accrual swings | A single line item (legal-related accruals) improved FY2025 G&A by ~106bps of the 204bps total G&A leverage, then worsened Q2 FY26 G&A by 97bps of the 130bps deterioration — same line, opposite direction, two periods in a row | Unknown / volatile (genuinely two-way, not a repeatable trend) | High — the single most unpredictable swing item in the cost stack | [FY25 10-K, Item 7; Q2 FY26 10-Q, MD&A G&A — see §7a derivation] |
| UK Mobility revenue/cost reclassification | Cuts both revenue (−$1.1bn in Q2'26 alone) and cost of revenue (−$808M Driver payments) together; CFO calls it "an optical impact" | Distorting, not a real margin driver — Unknown net effect on reported ratios depending on which ratio is read | High on reported optics; effectively zero on underlying cash economics | [Q2 FY26 10-Q, MD&A; Q2 FY26 earnings call, CFO Q&A] |
| Segment mix (Delivery revenue share rising, Mobility share falling) | Delivery's revenue share rose from 33.2% (FY2025) to 37.0% (Q2 FY26); Delivery's take rate (~19%) is structurally lower than Mobility's (~30%) | Headwind on blended take rate, but NOT a headwind on blended EBIT margin — Delivery's Segment Operating Income grew faster (+38% Q2'26 YoY) than its revenue (+28%), i.e. margin in the mix-shifting segment is itself expanding | Mid | [`business-model/03_segment-map.md` §1; `business-model/02_business-identity.md` §4; Q2 FY26 10-Q, MD&A Segment Results] |
| SG&A headcount discipline / AI productivity | CFO: "a track record of being disciplined on headcount addition," "a doubling in the code output per engineer," and "surgically... cut headcount by about 10% to 20%" in select organizations during Q2 FY26 | Tailwind (early-stage, modest — CFO calls the savings "modest in the grand scheme of things") | Low-to-Mid today; could become Mid-to-High if AI productivity claims compound | [Q2 FY26 earnings call, Q&A] |
| Driver-classification / labor-regulation risk | Not currently in the numbers; a reclassification ruling in a major market would force Uber to "incur significant additional expenses" for wages, benefits, and taxes | Headwind risk (contingent, not current) | High if triggered, currently Low probability of near-term realization based on disclosed litigation status | [`business-model/10_external-dependency.md` §1, §5; FY25 10-K, Item 1A] |
| Freight segment cyclicality | FY2025 Gross Bookings −1% (constant currency) on a "challenging freight market cycle"; Q2 FY26 Freight revenue +26% and Gross Bookings +25% (constant currency) — signs of a cyclical turn | Currently a small headwind (Freight Segment Operating Loss persists at ~−1.5% to −2% of segment revenue) but Direction is improving | Low at consolidated level (Freight is 9.8–11.2% of revenue and near-breakeven) | [`business-model/03_segment-map.md` §1; Q2 FY26 10-Q, MD&A Freight Segment] |
| Uber One subscription mix | 46 million members at FY2025 year-end; subscription fees "add to Revenue Margin without adding to Gross Bookings volume" | Tailwind (directionally, high-margin recurring revenue) | Not independently quantified in filings — Not proven from available data at what bps this specifically contributes | [`business-model/02_business-identity.md` §1, §2] |
| AV / autonomous-vehicle investment | $10bn of multiyear AV investment disclosed on the Q2 FY26 call; not yet flowing through GAAP capex (TTM capex is only $308M, `01_historical-financials.md` §2) | Unknown — see §9 for the full both-signs treatment | Currently Low P&L impact (CFO: "there will be a P&L impact, and we'll size that for investors clearly as we go" — i.e., not yet landed); potentially High once it lands | [Q2 FY26 earnings call, Q&A] |

## 7. Margin Drivers By Segment

### Segment: Mobility (57.0% of FY2025 revenue, 51.9% of Q2 FY26 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Driver payments/incentives | Fell $813M YoY in Q2 FY26 Segment Operating Income build, but $808M of that decrease is the UK reclassification, not underlying cost discipline (see §7a) | Mixed — mostly optical this quarter | High | [Q2 FY26 10-Q, MD&A Mobility Segment] |
| Insurance rate per mile | +$851M FY2025 headwind, turning to savings from March-2026 renewals, but savings are being reinvested into fare cuts in California, not kept as margin | Neutral-to-Tailwind on realized margin | High on the cost line; Low-Mid on margin (given back) | [FY25 10-K, Item 7; Q1 FY26 earnings call] |
| Revenue take rate (Revenue ÷ Gross Bookings) | CFO: "nearly 500 basis points decline year-on-year. Of that 500 basis points, about 400 basis points is entirely related to this U.K. business model change, and it's an optical impact... And other than that, it's really deliberate investments... largely a function of some investments in our lower-cost offerings" (Moto in Brazil) | Headwind — ~100bps of genuine, deliberate take-rate compression (a strategic choice, not a competitive loss), separate from the ~400bps optical UK effect | Mid (genuine portion); High (optical portion, but not real) | [Q2 FY26 earnings call, CFO Q&A] — **Note: this take-rate figure is measured on Revenue ÷ Gross Bookings, a different base than the Segment Operating Income margin figures elsewhere in this table (Segment Operating Income ÷ Revenue); the two are not combined to avoid a basis mismatch (see §7a).** |
| Segment Operating Income margin (Segment Operating Income ÷ Mobility revenue) | Q2'25: $1,729M / $7,288M = 23.72%. Q2'26: $2,215M / $7,363M = 30.08%. Change = +636bps | Tailwind, but see §7a for how much of this is genuine vs. UK-reclassification-driven | High | Computed from [Q2 FY26 10-Q, MD&A Segment Results, Note 10] |
| Segment Operating Income margin, ex-Gross-Bookings basis (CFO's preferred lens) | CFO cites Mobility "operating income margin remains very strong at 7.6%" measured against Gross Bookings, not revenue — a materially different denominator that is unaffected by the UK revenue reclassification | Informational — management's own preferred, reclassification-immune metric | High relevance for tracking real margin through further accounting changes | [Q2 FY26 earnings call, CFO Q&A] |
| Airport/large-metro concentration; driver-classification regulation | ~15% of FY2025 Mobility Gross Bookings from airport trips; NYC and Washington State minimum-pay rules already bind | Headwind risk, not currently realized in the numbers | Mid | [`business-model/03_segment-map.md` §1] |

### Segment: Delivery (33.2% of FY2025 revenue, 37.0% of Q2 FY26 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Courier payments/incentives | +$545M YoY in Q2 FY26, scaling with a 26% Delivery Gross Bookings increase | Neutral (proportionate to growth, not a leverage story on its own) | High (largest Delivery cost line) | [Q2 FY26 10-Q, MD&A Delivery Segment] |
| Advertising revenue growth | +$182M YoY in Q2 FY26 — high-margin revenue that grows without a matching Gross-Bookings increase | Tailwind | Mid | [Q2 FY26 10-Q, MD&A Delivery Segment] |
| Segment Operating Income growth vs. revenue growth | Segment Operating Income +38% ($766M→$1,055M) vs. revenue +28% in Q2 FY26 — margin expanding, not just scaling | Tailwind | Mid-High | [Q2 FY26 10-Q, MD&A Delivery Segment] |
| Revenue take rate | CFO: Delivery's "revenue margin... is largely stable" — unlike Mobility, no material take-rate compression | Neutral | Low | [Q2 FY26 earnings call, CFO Q&A] |
| Merchant concentration | "A significant amount of our Delivery Gross Bookings come from a limited number of large restaurant groups and other merchants" | Headwind risk, not currently realized | Low-Mid | [`business-model/03_segment-map.md` §1; FY25 10-K, Item 1A] |

### Segment: Freight (9.8% of FY2025 revenue, 11.2% of Q2 FY26 revenue)

| Driver | Impact | Direction | Magnitude | Evidence |
|---|---|---|---|---|
| Industrial/freight-rate cycle | FY2025 Gross Bookings −1% (constant currency) on a "challenging freight market cycle"; Q2 FY26 Gross Bookings +25% (constant currency), revenue +26% — a cyclical turn, tentative | Was Headwind (FY2025); now Tailwind (Q2 FY26) — see Cycle-Position note below | Low at consolidated level (9.8–11.2% of revenue); High within the segment itself | [`business-model/03_segment-map.md` §1; Q2 FY26 10-Q, MD&A Freight Segment] |
| Carrier payments | +$320M YoY in Q2 FY26, tracking the Gross Bookings recovery | Headwind on segment profit dollars, proportionate to the revenue recovery | Low at consolidated level | [Q2 FY26 10-Q, MD&A Freight Segment] |
| Segment Operating Loss | −$26M (Q2'25) → −$24M (Q2'26), a modest 8% improvement; still a loss | Mild tailwind, still negative | Low | [Q2 FY26 10-Q, MD&A Freight Segment] |

**Cycle-Position Rule note (Freight).** Freight is the one segment with clear cyclicality evidence in this pool. FY2025 sat in what management itself called a "challenging freight market cycle" (Gross Bookings −1% CC) [FY25 10-K, MD&A] — closer to a cyclical trough than a mid-cycle reading, given the segment had never posted a positive Adjusted EBITDA margin in any disclosed year (`business-model/03_segment-map.md` §1). Q2 FY26's +25% CC Gross Bookings growth and a narrowing Segment Operating Loss are the first hard evidence of a turn, but one quarter of data is not proof of a durable freight-cycle recovery — the reader should not treat Q2 FY26's Freight growth rate as a new run-rate. Mobility and Delivery show no comparable cyclical peak/trough evidence; both have grown Gross Bookings above 20% (constant currency) for four consecutive quarters [`earnings/04_guidance-consensus.md` §6], which reads as steady expansion, not a cycle extreme, based on the evidence available in this pool.

## 8. Margin Bridge — Latest Period (Q2 FY26 vs. Q2 FY25)

Consolidated EBIT margin (GAAP Income from operations ÷ revenue): Q2'25 = $1,450M / $12,651M = 11.46%. Q2'26 = $1,890M / $14,191M = 13.32%. **Total margin change = +186bps.** [Q2 FY26 10-Q, Condensed Consolidated Statements of Operations]

| Component | Margin Impact (bps) | Evidence |
|---|---:|---|
| Cost of revenue — genuine improvement (ex-UK-reclassification) | +377 | [Q2 FY26 10-Q, MD&A Cost of Revenue] — see §7a for the derivation |
| Cost of revenue — UK reclassification (optical, one-off) | +132 | [Q2 FY26 10-Q, MD&A; Q2 FY26 earnings call, CFO Q&A] — see §7a |
| G&A — legal-accrual swing (one-off) | −97 | [Q2 FY26 10-Q, MD&A G&A] — see §7a |
| SG&A ex-one-off (Operations & support + Sales & marketing + R&D + G&A-ex-legal: headcount/AI investment, marketing spend, consumer discounts, credit-card processing) | −232 | [Q2 FY26 10-Q, MD&A, each expense-line table] |
| Depreciation and amortization | +6 | [Q2 FY26 10-Q, MD&A D&A] |
| Price / take-rate effect (Mobility, ex-UK) | Not integrated into this bps table — see basis-mismatch note below | [Q2 FY26 earnings call, CFO Q&A] |
| Segment mix (Delivery share rising) | Not separately quantified in EBIT-margin bps terms from current disclosure | [`business-model/03_segment-map.md` §1] |
| FX | Not quantified for cost ratios; disclosed only for Gross Bookings/revenue growth rates (+2pp / +1pp tailwind respectively, a different base — see basis-mismatch note) | [`business-model/10_external-dependency.md` §2] |
| **Total margin change** | **+186** | Computed directly from GAAP Income from operations, both periods |

**Basis-mismatch note (required by CLAUDE.md §15 / MODULE_RULES "Driver Attribution"):** the CFO's ~100bps "genuine take-rate compression" figure and the ~400bps "optical UK impact" figure are both measured on **Revenue ÷ Gross Bookings** (a Mobility-segment-only ratio). This bridge is measured on **Cost of revenue ÷ Total company revenue** (a different ratio, a different base, consolidated across three segments). The two figures are directionally consistent (both point to the UK reclassification being the majority driver of any Mobility-specific ratio move) but are NOT numerically interchangeable, and are not summed together in the table above — doing so would apply a segment-level, revenue-based sensitivity to a consolidated, cost-based bridge it was never measured on.

## 8a. Bridge Attribution and Residual

**Cost of revenue — UK reclassification derivation:**
```
Reported cost-of-revenue ratio: $7,815M / $14,191M = 55.07%
Ex-UK ratio: ($7,815M + $808M) / ($14,191M + $1,100M) = $8,623M / $15,291M = 56.40%
  [$808M Driver-payment decrease and $1,100M revenue decrease both attributed to "Mobility business
  model changes in the UK" — Q2 FY26 10-Q, MD&A Cost of Revenue and Revenue sections]
Difference: 55.07% − 56.40% = −1.32pp = −132bps of the total −509bps cost-of-revenue ratio move
  → 132bps of the 509bps (26%) is the UK reclassification; 377bps (74%) is genuine.
```

**G&A — legal-accrual-swing derivation:**
```
Q2 FY26 G&A increase from legal-related accruals: $138M
÷ Q2 FY26 revenue: $14,191M = 0.97% ≈ 97bps
Total G&A ratio deterioration Q2'25→Q2'26: 5.29% → 6.59% = +130bps
  → 97bps of the 130bps (75%) is a single lumpy legal-accrual line; 33bps (25%) is other G&A growth
  (headcount, contractor/professional services).
```
This is the mirror image of what happened in FY2025, where a **$549M decrease** in the same legal-related-accruals line drove ~106bps of the annual 204bps G&A improvement [FY25 10-K, Item 7] — the identical line item moved margin favorably by ~106bps in FY2025 and unfavorably by ~97bps in the very next comparable quarter. **This is the clearest evidence in the whole cost stack that a G&A/legal-accrual driver is a two-way swing item, not a repeatable trend, and should not be extrapolated in either direction.**

**Reconciliation:** Sum of quantified components (+377 + 132 − 97 − 232 + 6) = **+186bps**, against the stated Total row of **+186bps. Residual = 0bps** (full reconciliation, computed directly from the same GAAP Income-from-operations figures used for the Total row, not estimated). The two components explicitly NOT integrated into the bps sum (Price/take-rate and FX) are flagged, not silently dropped, because they are measured on a different base than this bridge (see basis-mismatch note above) — their omission is a scope choice, not a gap.

## 9. The Single Biggest Margin Driver

**Driver/Courier/Carrier variable payments within cost of revenue** — the single largest cost line at 55–61% of revenue (§3) — is the biggest lever on Uber's margin if it moves adversely. The reconciled Q2 FY26 bridge (§8a) shows the genuine (ex-reclassification) improvement in this line contributed +377bps of the +186bps total EBIT-margin gain — more than the entire net margin change on its own, meaning every other driver in the bridge (SG&A investment, the G&A swing, D&A) is currently a net drag against it. A reversal of this driver — competitive pressure forcing higher driver/courier incentives to defend supply, which `business-model/06_value-chain.md` §1 flags as an active risk ("we may need to increase or may not be able to reduce the Driver incentives that we offer without adversely affecting the supply liquidity") — would compress margin by a larger amount than any other single item in this report, because it is both the largest cost line and the one growing structurally with Gross Bookings. The G&A/legal-accrual line (§8a) is the single most VOLATILE and LEAST PREDICTABLE driver (it has swung ~100–200bps in opposite directions across two consecutive comparable periods), but it is smaller in absolute size than the driver-payment line and should not be confused with "biggest" — biggest and most volatile are two different drivers here, and this report names them separately rather than picking one label for both.

## 10. Investment Spend — Both Signs

Uber's disclosed GAAP capex line is small and stable (TTM capex $308M, historically $242M–$336M annually, `01_historical-financials.md` §1–§2) — there is no capex wave visible in the reported capital-expenditure line. However, on the Q2 FY26 call management disclosed a **$10 billion multiyear autonomous-vehicle (AV) investment program**, large enough relative to Uber's ~$9.8–10.1bn of TTM free cash flow (`01_historical-financials.md` §2) to warrant the same both-signs treatment even though it has not yet appeared as reported capex.

| Reading | What it would show | Evidence here |
|---|---|---|
| Spend as a future COST | The $10bn breaks into (a) equity investments in AV software partners (Lucid, Nuro, Waymo, Wayve, and others) with "clear milestones," and (b) balance-sheet support for "fleet ops, real estate," and OEM offtake — including 120,000 vehicle-purchase commitments over the next few years. CFO: "In terms of the P&L versus cash flow impacts... The closer we get to deployment and scale out, there will be a P&L impact, and we'll size that for investors clearly as we go" — i.e., a future depreciation/lease-cost charge is coming but has NOT yet landed in the D&A line (§3 shows D&A still "not material," +1% YoY) [Q2 FY26 earnings call, CFO Q&A]. No dollar sensitivity for the eventual P&L impact is disclosed anywhere in this pool. |
| Spend as a DEMAND signal | Management frames the spend explicitly as positioning "front of the line for commercialization" and states that "for every dollar that we have invested, our partners have been able to raise an additional $2.50 from other investors" — an external capital-markets confirmation that AV partners see the anchor investment as de-risking, not merely as Uber absorbing cost. The CEO separately states AVs are "doing kind of hundreds of thousands of trips per week" today across a 15-market footprint expanding to "many, many more markets" next year, and that industry structure is shifting from "whether the technology can deliver a compelling service to how broadly, reliably and economically it can scale" [Q2 FY26 earnings call, prepared remarks and Q&A]. |

**Current read:** the evidence favors the DEMAND reading over the COST reading for now, because the disclosed facts are asymmetric — the demand-side evidence (external co-investment ratio, live trip volume, market-count expansion, management's own "front of the line" framing) is quantified and already observable, while the cost-side evidence is explicitly NOT yet quantified ("we'll size that for investors... as we go," no dollar or bps figure disclosed for the future P&L impact, and current D&A remains flat). **The one observable that would flip this read:** the first quarter Uber discloses a material AV-related step-up in the D&A line, or a specific dollar sensitivity for the future P&L impact of the vehicle-purchase commitments — at that point the cost side becomes measurable and this report's current demand-leaning read should be revisited against the actual number, not the framing.

## 11. Citations

[1] Uber Technologies, Inc. Form 10-K, filed Feb-13-2026 (fiscal year ended Dec-31-2025) — Item 7 MD&A "Results of Operations," Item 1A Risk Factors, Item 7A, Note 13 (Segment Information)
[2] Uber Technologies, Inc. Form 10-Q, filed May-06-2026 (Q1 FY2026, period ended Mar-31-2026)
[3] Uber Technologies, Inc. Form 10-Q, filed Aug-05-2026 (Q2 FY2026, period ended Jun-30-2026) — MD&A "Results of Operations," "Segment Results of Operations," Note 10 (Segment Information)
[4] Uber Technologies, Inc., Q1 2026 Earnings Call transcript, May-06-2026 (verbatim CIQ transcript)
[5] Uber Technologies, Inc., Q2 2026 Earnings Call transcript, Aug-05-2026 (verbatim CIQ transcript)
[6] `analyses/UBER_2026-08-08/earnings/01_historical-financials.md`
[7] `analyses/UBER_2026-08-08/earnings/04_guidance-consensus.md`
[8] `analyses/UBER_2026-08-08/business-model/02_business-identity.md`, `03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`
[9] `frameworks/SECTOR_OVERLAYS.md` — checked directly, no matching row for a multi-sided mobility/delivery/freight marketplace

All bps deltas, cost-ratio derivations, and bridge reconciliations in this report were computed by this agent directly from the $ figures cited above (cost of revenue, each operating-expense line, Income from operations, and segment revenue/Segment Operating Income), shown inline for verification, not asserted from a vendor-standardized figure.



---

## earnings / 04_guidance-consensus.md

_Source: `04_guidance-consensus.md`_

# Guidance & Consensus — UBER

## 1. Consensus Data Metadata

| Field | Value |
|---|---|
| Source | Capital IQ Estimates Report (`UberTechnologies,IncNYSEUBEREstimatesReport.xls` — Consensus, Guidance, Surprise, Trends, Revisions, Recent Changes tabs) [Capital IQ Estimates export, data as of 2026-08-05 through 2026-08-08] |
| Data as of date | 2026-08-05 (initial post-print snapshot, embedded in the FQ2 2026 transcript header as "Consensus as of Aug-05-2026 10:04 AM GMT" [Q2 FY26 transcript, S&P Global Market Intelligence Estimates header]) through 2026-08-08 (continued intraday revisions captured in the Recent Changes tab) |
| Fiscal year basis | US GAAP, fiscal year end Dec-31 (calendar year) [Capital IQ Estimates export, Consensus tab: "Acctg. Standard: US GAAP", "Current Fiscal Year End: Dec-31-2026"] |
| Analyst count | Varies by metric: Target Price 47/47; Revenue (FQ3 2026) 36–39; EBITDA (FQ3 2026) 28–49; EPS Normalized (FQ3 2026) 28–39; EPS (GAAP, FQ3 2026) 24–31 [Capital IQ Estimates export, Consensus tab and Revisions tab] |
| Currency | USD [Capital IQ Estimates export, Consensus tab: "Currency: Reported Currency"] |
| Calendarization issue? | N — fiscal year end Dec-31 matches calendar year, no reconciliation needed |

The two `EstimatesReport.xls` files in the data pool are byte-identical duplicates (confirmed in `00_earnings-data-triage.md`); this agent treats them as one source. Two verbatim earnings-call transcripts are also in the pool (FQ1 2026, FQ2 2026), both used for management-guidance colour per Section 2.

## 2. Management Guidance

Uber's formal, numeric quarterly guidance currently covers two metrics: (adjusted) EBITDA — guided continuously since 2019 — and EPS Normalized, which the company began guiding as a distinct range only starting FQ1 2026 (no guidance values appear for this line in any prior quarter in the pool's Guidance tab). Uber does not issue formal revenue guidance; the CIQ Guidance tab's Revenue row has been blank for every quarter since FQ2 2020, consistent with the transcript record. The company also stopped issuing EBIT, Net Income (GAAP), Capex, and Free Cash Flow guidance ranges years ago (last guided in 2019, 2019, 2021, and 2023 respectively) — none of those rows carry current values.

| Metric | Period | Guidance | Type (Point / Range / Qualitative) | Source |
|---|---|---|---|---|
| EBITDA (Uber's guided metric, understood to be company-defined Adjusted EBITDA; the CIQ export line is simply labelled "EBITDA" and its definition is not independently re-stated in this pool extract — flagged per hygiene rule) | FQ3 2026 (quarter ending Sep-2026) | $2,860mm – $2,960mm (midpoint $2,910mm) | Range | [Capital IQ Estimates export, Guidance tab, guidance issued 2026-08-05] |
| EPS Normalized | FQ3 2026 | $0.84 – $0.88 (midpoint $0.86) | Range | [Capital IQ Estimates export, Guidance tab, guidance issued 2026-08-05] |
| Revenue | FQ3 2026 | Not guided | — | No formal revenue guidance issued; CIQ Guidance tab shows no revenue range for any quarter since FQ2 2020 |
| Capex | — | Not guided | — | No Capex guidance range since FY2020 (last: "$550mm–$600mm" outflow, guided 2020-05-07) |
| Free Cash Flow | — | Not guided as a range | — | No FCF guidance range since FY2022 (last guide was "0", i.e. a floor/breakeven signal, guided 2022-05-04) |
| Gross Bookings (qualitative) | FQ3 2026 | "Relatively healthy trends for delivery in the third quarter"; continued expectation the U.S. business "accelerate[s] through this year," attributed to three items: an insurance-cost tailwind being reinvested into pricing, product-innovation velocity (Reserve, U4B, Black, Wait & Save), and AV rollout | Qualitative | [Q2 FY26 transcript, prepared remarks — Dara Khosrowshahi, CEO; Balaji Krishnamurthy, CFO, Q&A] |

No specific numeric Gross Bookings guidance figure for FQ3 2026 is present anywhere in the extracted CIQ Guidance tab (it tracks EPS Normalized, Revenue, EBITDA, EBIT, Net Income GAAP, Capex, and FCF only — not Gross Bookings). Management's own historical framing is useful context: on the Q2 2026 call, the CEO stated Q2 gross bookings "grew 22% year-on-year to more than $58 billion, above the high end of our guidance and marking our fourth consecutive quarter above 20% growth" [Q2 FY26 transcript, prepared remarks]. That confirms Uber does guide gross bookings internally (and beat that guide in Q2), but the specific FQ3 2026 gross-bookings range itself is not captured in this pool's structured data — a genuine gap, not treated as "not proven," but flagged as unavailable for the guidance-vs-consensus comparison below.

## 3. Guidance vs Consensus Table

| Metric | Period | Management Guidance | Street Consensus | Gap | Gap Direction |
|---|---|---|---|---:|---|
| EBITDA | FQ3 2026 | $2,860mm – $2,960mm (midpoint $2,910mm) | $2,918.95mm (32–49 analysts) [Capital IQ Estimates export, Consensus tab, Market Summary] | +$8.95mm (+0.31% vs midpoint) | In-line — consensus sits essentially at the guidance midpoint |
| EPS Normalized | FQ3 2026 | $0.84 – $0.88 (midpoint $0.86) | $0.8632 (28–39 analysts) [Capital IQ Estimates export, Consensus tab, fiscal-quarters section] | +$0.0032 (+0.37% vs midpoint) | In-line — consensus sits essentially at the guidance midpoint |
| Revenue | FQ3 2026 | Not guided | $14,694.75mm (36–39 analysts) [Capital IQ Estimates export, Consensus tab, Market Summary] | N/A (no guidance to compare against) | No formal guidance issued |

Gap = Consensus minus Guidance midpoint. For the two metrics Uber actually guides, consensus has converged almost exactly onto the guidance midpoint (both gaps under 0.4%) — this is the literal definition of a "fair" bar for those two lines, not a stretched or discounted one.

**A material post-print drift on Revenue is worth flagging separately.** The FQ2 2026 transcript's own embedded consensus snapshot — captured at "Aug-05-2026 10:04 AM GMT," i.e. the morning of the print — showed FQ3 2026 Revenue consensus at $14,849.61mm [Q2 FY26 transcript, S&P Global Market Intelligence Estimates header]. By the time of this pool's most current pull (Aug-08-2026), that figure had fallen to $14,694.75mm — a $154.86mm (−1.04%) cut in three trading days, consistent with the Revisions-tab pattern in Section 5 below (heavy net-downward revenue revisions in the days right after the print). Since Revenue carries no formal guidance to anchor against, this drift is a pure Street sentiment signal, not a guidance gap — but it is the single largest, freshest move in the whole estimate set.

## 3A. Alt-Data Cross-Check

No external alt-data panel exists for this ticker — `data/UBER/external/` does not exist in the data pool (confirmed in `00_earnings-data-triage.md`, Section 1A). This section is omitted; its absence is not a data gap.

## 4. Estimate Revision Momentum Table

| Estimate | 3 Months Ago | 2 Months Ago | 1 Month Ago | Current | Direction |
|---|---:|---:|---:|---:|---|
| Revenue (next Q, FQ3 2026, $mm) | 14,795.07 | 14,789.07 | 14,846.89 | 14,697.36 | Falling (recent) |
| EPS Normalized (next Q, FQ3 2026, $) | 0.86 | 0.87 | 0.87 | 0.86 | Flat |
| Revenue (current FY, FY2026, $mm) | 58,308.00 | 58,132.30 | 58,181.97 | 57,834.88 | Falling |
| EPS Normalized (current FY, FY2026, $) | 3.33 | 3.35 | 3.34 | 3.37 | Rising (modest) |
| Revenue (next FY, FY2027, $mm) — supplemental | 66,705.07 | 67,042.58 | 67,043.88 | 67,028.29 | Roughly flat |
| EPS Normalized (next FY, FY2027, $) — supplemental | 4.31 | 4.37 | 4.42 | 4.42 | Rising |
| EBITDA (current FY, FY2026, $mm) — supplemental | 11,033.97 | 11,261.16 | 11,272.84 | 11,365.18 | Rising |

[Capital IQ Estimates export, Trends tab — "1 month ago" / "2 months ago" / "3 months ago" columns, current as of the pool pull]

Revenue estimates have been cut at both the next-quarter and current-year horizon over the last three months, with the cut concentrated in the days right after the Q2 print (see Section 3). Profitability estimates (EBITDA, EPS Normalized) have moved the opposite way — modestly higher over the same window, most clearly for EBITDA (+3.0% over three months at the FY2026 level). This is a genuine divergence, not noise: the Street is trimming the top line while raising the profit line for the same company over the same period.

## 5. Revision Breadth

| Metric | Up Revisions | Down Revisions | Net Revision Breadth | Period |
|---|---:|---:|---:|---|
| Revenue, FQ3 2026 (next Q) | 8 | 19 | −11 | Last Month (≈ Aug 5–8, 2026, the post-Q2-print / Q3-guide window) |
| Revenue, FY 2026 (current FY) | 11 | 20 | −9 | Last Month |
| EBITDA, FQ3 2026 (next Q) | 13 | 7 | +6 | Last Month |
| EBITDA, FY 2026 (current FY) | 19 | 5 | +14 | Last Month |
| EPS Normalized, FQ3 2026 (next Q) | 9 | 7 | +2 | Last Month |
| EPS Normalized, FY 2026 (current FY) | 12 | 9 | +3 | Last Month |

[Capital IQ Estimates export, Revisions tab, "Last Month" section]

Over the slightly longer "Last 3 Months" window the pattern is similar but less lopsided on Revenue (FQ3 2026: 16 up / 18 down; FY2026: 24 up / 19 down) and more strongly positive on EBITDA (FQ3 2026: 20 up / 3 down; FY2026: 28 up / 0 down) [Capital IQ Estimates export, Revisions tab, "Last 3 Months" section]. The direction is consistent across both windows: Revenue revisions skew negative, profitability revisions skew positive, and the skew is sharpest in the freshest (Last Month) window — i.e. it intensified right around this print, it did not fade.

One likely structural driver of the EPS-specific (though not EBITDA-specific) softness in upward breadth: the Street's Effective Tax Rate assumption for FQ3 2026 has risen from 16.77% three months ago to 18.94% currently, and the FY2026 assumption has risen from 9.5% twelve months ago to 20.77% currently [Capital IQ Estimates export, Trends tab and Consensus tab, Effective Tax Rate % row]. A rising tax-rate assumption eats into EPS upside even where EBITDA estimates are being raised — consistent with EPS Normalized revision breadth (+2 to +3, barely positive) being far weaker than EBITDA revision breadth (+6 to +14) over the identical window.

## 6. Historical Beat / Miss Pattern

| Period | Revenue Beat/Miss | EPS (Normalized) Beat/Miss | Magnitude | Notes |
|---|---|---|---:|---|
| Q3 FY25 (Sep-2025) | Beat | Miss | Rev +1.55% ($13,467mm vs $13,261.49mm est.); EPS Norm. −25.4% ($0.6468 vs $0.8676 est.) | EBITDA landed inside its own guided range ($2,190–2,290mm; actual $2,256mm, +0.71% vs midpoint). GAAP EPS beat by +350.7% (one-off equity-stake gain) — the Normalized-EPS miss was driven by items below the EBITDA line, not core operating execution [Capital IQ Estimates export, Surprise tab; Q2 FY26 transcript, embedded S&P estimates table] |
| Q4 FY25 (Dec-2025) | Beat | Miss | Rev +0.30% ($14,366mm vs $14,322.67mm est.); EPS Norm. −10.1% ($0.71 vs $0.7854 est.) | EBITDA landed inside its own guided range ($2,410–2,510mm; actual $2,487mm, +1.10% vs midpoint), near the high end. GAAP EPS missed by −82.1% (one-off item), the mirror image of Q3's pattern [Capital IQ Estimates export, Surprise tab; Q2 FY26 transcript, embedded S&P estimates table] |
| Q1 FY26 (Mar-2026) | Miss | Beat | Rev −0.45% ($13,203mm vs $13,262.69mm est.); EPS Norm. +4.31% ($0.72 vs $0.6933 est.) | First quarter EBITDA cleared ABOVE the top of its own guided range ($2,370–2,470mm; actual $2,481mm, +2.52% vs midpoint, +$11mm above the high end). This is also the first quarter Uber issued a formal EPS Normalized guide (0.65–0.72) — actual landed exactly at the top of that range. GAAP EPS missed −81.7% (one-off item) [Capital IQ Estimates export, Surprise tab and Guidance tab; Q2 FY26 transcript, embedded S&P estimates table] |
| Q2 FY26 (Jun-2026) | Miss | Beat | Rev −0.52% ($14,191mm vs $14,265.78mm est.); EPS Norm. +1.25% ($0.81 vs $0.8046 est.) | Second straight quarter EBITDA cleared ABOVE the top of its own guided range ($2,700–2,800mm; actual $2,819mm, +2.51% vs midpoint, +$19mm above the high end). GAAP EPS beat +41.0% this quarter (favourable one-off) [Capital IQ Estimates export, Surprise tab and Guidance tab; Q2 FY26 transcript, prepared remarks: "Gross bookings grew 22% year-on-year... above the high end of our guidance"] |

**Reported (GAAP) EPS is not usable for a beat/miss read on its own** — it has swung from +350.7% to −82.1% to −81.7% to +41.0% over these four quarters, almost certainly driven by mark-to-market movements in Uber's equity stakes (Aurora, Didi, Grab, Joby, and similar), which the company itself separates out in its non-GAAP reconciliation. EPS Normalized is the cleaner series and is used for the beat/miss and bar calls in this report.

**The pattern that matters for the bar going forward:** EBITDA has beaten its own guidance in all four of the last four quarters, and — critically — has beaten ABOVE the guided high end in each of the last two (Q1 and Q2 FY26), by a consistent ~2.5% over the guided midpoint both times. Revenue has flipped from small beats (Q3/Q4 FY25, +0.3% to +1.6%) to small misses (Q1/Q2 FY26, −0.5%) against consensus (there being no formal revenue guide to measure against). EPS Normalized has flipped from large misses (driven by below-the-line items, not core execution) to small beats over the same window, coinciding with Uber's decision to start guiding EPS Normalized as its own range beginning Q1 FY26.

## 7. Bar Assessment

**Bar is fair.**

For the two metrics Uber actually guides — EBITDA and EPS Normalized — the current Street consensus for FQ3 2026 sits within roughly 0.3–0.4% of the guidance midpoint in both cases (Section 3). That is the textbook definition of an in-line bar: analysts have simply adopted management's own guided range as their base case, neither discounting it (bar low) nor stretching above it (bar high).

Two secondary signals complicate a pure "fair" call and are worth weighing directly, because they point in opposite directions and neither is decisive on its own:

- **A tailwind for beat odds on EBITDA/EPS:** the company has now beaten its own EBITDA guidance in four straight quarters, and beaten ABOVE the guided high end in the last two by a near-identical ~2.5% margin each time (Section 6). Consensus is set at the guidance midpoint, not at a "beat-adjusted" level that reflects this streak — so if the pattern holds a third straight quarter, the guided range itself, not just consensus, would likely be cleared again. This is evidence-based streak continuation, not a guarantee (a two-quarter streak is a short base rate), but it tilts the odds toward another EBITDA/EPS beat rather than a miss.
- **A headwind for beat odds on Revenue:** Revenue carries no formal guidance to anchor against, and the freshest revision data (the three days immediately following the Q2 print and Q3 guide) shows a clear net-downward skew — 8 up vs. 19 down at the FQ3 2026 level, 11 up vs. 20 down at the FY2026 level (Section 5) — alongside a −1.04% cut in the specific FQ3 2026 revenue consensus number itself since the morning of the print (Section 3). Revenue has also missed (very narrowly, under 0.6%) consensus in each of the last two reported quarters. None of this points to a stretched ("high") bar in the sense of consensus sitting meaningfully above where the company is likely to land — the misses have been small — but it does argue against calling the revenue bar "low."

Net: this is not a single clean signal in one direction, so "fair" is the correct call for the guided metrics that anchor this section, with the qualifier that the profitability line (EBITDA/EPS) carries a modest continuation-of-streak beat tilt while the revenue line carries a modest continuation-of-trend miss tilt (both small, single-digit-percent in magnitude, not the kind of gap that would justify "low" or "high" outright).



---

## earnings / 05_beat-miss-setup.md

_Source: `05_beat-miss-setup.md`_

# Beat / Miss Setup — UBER

## 1. Next Quarter Context

The next print covers FQ3 2026 (quarter ended Sep-30-2026), expected to report in early November 2026. Q3 is a moderate seasonal quarter — third-largest of four (25.4–25.9% of annual revenue over the last three fiscal years, behind Q4's 27.2% average) [`01_historical-financials.md` §5]. Consensus is essentially pinned to management's own guidance for the two metrics Uber formally guides: EBITDA consensus $2,918.95mm vs guided midpoint $2,910mm (+0.31%), and EPS Normalized consensus $0.8632 vs guided midpoint $0.86 (+0.37%) — both within 0.4% of the guide, the textbook definition of a "fair" bar [`04_guidance-consensus.md` §3, §7]. Revenue carries no formal guidance; consensus is $14,694.75mm, down 1.04% in the three trading days after the Q2 print [`04_guidance-consensus.md` §3].

## 2. Beat Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| EBITDA / EPS Normalized clears the guided high end for a third straight quarter | Driver/Courier/Carrier payments (cost of revenue), the largest cost line at 55–61% of revenue | Genuine (ex-UK-reclassification) cost-of-revenue leverage repeats the +377bps Q2 pattern; no offsetting G&A/legal-accrual reversal | Mid | EBITDA has beaten its own guidance 4/4 quarters and cleared ABOVE the guided high end in the last two (Q1, Q2 FY26) by a near-identical ~2.5% each time; the two quarters before that were smaller within-range beats (+0.71%, +1.10%), so the "above high end" pattern is a short, 2-quarter base rate [`04_guidance-consensus.md` §6; `03_margin-drivers.md` §8a] |
| Gross Bookings / trip volume sustains >20% constant-currency growth | Trip volume (Gross Bookings) — the single biggest revenue driver per `02_revenue-drivers.md` §7 | US sparse-market penetration, insurance-cost tailwind reinvested into fares, and product innovation (U4B +40% YoY) continue converting into trip growth | Mid | Four consecutive quarters of Gross Bookings growth above 20% constant currency; MAPCs +16% YoY; management's own qualitative FQ3 framing reaffirms the US business "accelerate[s] through this year" [`02_revenue-drivers.md` §4; `04_guidance-consensus.md` §2] |
| Freight segment cyclical inflection continues, narrowing the segment loss further | Freight market cycle | Gross booking per trip AND trip volume both keep improving off the FY2025 trough | Low–Mid | Q2 FY26 Freight Gross Bookings +25% constant currency after FY2025's −1% ("challenging freight market cycle"); only one quarter of confirmed inflection, and Freight is 11.2% of revenue — small consolidated impact even if it beats [`02_revenue-drivers.md` §5 Freight; `03_margin-drivers.md` §7 Freight] |
| Delivery organic growth and high-margin advertising revenue outrun the M&A drag | Delivery segment — organic growth + advertising | Advertising revenue keeps growing without a matching Gross Bookings increase (+$182M in Q2 alone) and organic delivery growth (ex-M&A) stays "accelerating" as management describes it, offsetting the Trendyol Go lap | Mid | Delivery Segment Operating Income grew faster than revenue in Q2 (+38% vs +28%); CFO says the company "gained category position in all of our large markets" — a company-reported, not independently verified, claim [`02_revenue-drivers.md` §5 Delivery; `03_margin-drivers.md` §7 Delivery] |

## 3. Miss Scenarios

| Scenario | Driver | What Would Need To Happen | Likelihood (High / Mid / Low) | Evidence |
|---|---|---|---|---|
| Revenue misses consensus for a third straight quarter | UK Mobility business-model reclassification + take-rate/mix compression | The recurring ~$1.1bn/quarter UK revenue drag (persists until it laps Q1 FY27) combines with continued Delivery/Freight mix shift toward lower-take-rate revenue, and underlying trip growth cools faster than the recent >20% streak suggests | Mid–High | Revenue missed consensus narrowly in the last two quarters (−0.45%, −0.52%); FQ3 2026 revenue consensus itself was cut 1.04% in the three trading days after the Q2 print; net revision breadth over the last month is −11 at the FQ3 level (8 up / 19 down) [`04_guidance-consensus.md` §3, §4, §5] |
| G&A / legal-accrual line swings unfavorably again | G&A cost line | A new or larger legal-related accrual/settlement lands in Q3, mirroring the Q2 FY26 swing (which cost 97bps of EBIT margin after helping FY2025 by 106bps) | Mid | Flagged in `03_margin-drivers.md` §8a as "the single most unpredictable swing item in the cost stack" — the identical line item moved margin favorably by ~106bps in FY2025 and unfavorably by ~97bps the very next comparable quarter, and should not be extrapolated in either direction |
| Driver/Courier incentive costs rise to defend supply | Cost of revenue — the largest single cost line | Competitive pressure forces Uber to raise driver/courier incentives, reversing the genuine ex-UK cost improvement seen in Q2 (+377bps) | Low–Mid | `business-model/06_value-chain.md` flags this as an active risk ("we may need to increase… Driver incentives… without adversely affecting… supply liquidity"); currently a tailwind, but this is the single largest lever if it reverses [`03_margin-drivers.md` §9] |
| Rising tax-rate assumption compresses EPS Normalized even if EBITDA holds | Effective tax rate (below EBITDA, above EPS Normalized) | Consensus tax-rate assumption keeps climbing, as it has for three straight months | Mid | Street's FQ3 2026 effective tax rate assumption rose from 16.77% three months ago to 18.94% currently; EPS Normalized revision breadth (+2 to +3) is far weaker than EBITDA revision breadth (+6 to +14) over the same window — a structural EPS-specific headwind even where EBITDA is being raised [`04_guidance-consensus.md` §5] |

## 4. What Magnitude Matters?

| Metric | Consensus / Bar | Material Beat Threshold | Material Miss Threshold | Why |
|---|---:|---:|---:|---|
| Revenue | $14,694.75mm (no formal guidance) | >+2% vs consensus (>$14,988.6mm) | >−2% vs consensus (<$14,400.8mm) | The last four quarters' surprises ranged from −0.52% to +1.55% — a move beyond ±2% would exceed the entire recent observed range and signal a genuine change in trip-volume trend, not just the known UK-reclassification optical drag [`04_guidance-consensus.md` §6] |
| EBITDA | Guided $2,860–2,960mm (midpoint $2,910mm); consensus $2,918.95mm | >$2,960mm (above guided high end, continuing the 3rd straight above-high-end quarter) | <$2,860mm (below guided low end, breaking the 4-quarter guidance-beat streak) | Clearing the guided range's own high end is now the market's revealed bar after two straight quarters of doing so by ~2.5%; falling below the low end would be a first in the trailing four quarters [`04_guidance-consensus.md` §6] |
| EPS (Normalized) | Guided $0.84–0.88 (midpoint $0.86); consensus $0.8632 | >$0.88 (above guided high end) | <$0.84 (below guided low end) | Same guided-range logic as EBITDA; GAAP EPS is excluded from this test because it is dominated by non-operating equity-stake mark-to-market swings, not operating results [`01_historical-financials.md` §3; `04_guidance-consensus.md` §6] |
| Guidance (forward, i.e. the Q4 FY26 guide issued alongside this print) | No FQ4 numeric guide exists yet | A Q4 EBITDA guide implying a margin step-up consistent with Q4's historical seasonal strength (FY2025 Q4 EBITDA margin 13.7%) | A Q4 guide flat-to-down vs Q3, or one that introduces a specific, negative AV-investment P&L dollar figure for the first time | Q4 is seasonally the largest and highest-margin quarter in three years of data; a guide that fails to reflect that pattern, or that lands the first quantified AV cost hit flagged in `03_margin-drivers.md` §10, would be read as a genuine deceleration signal, not noise |

## 5. In-Line Print But Bad Guidance Risk

| Risk | Evidence | Why It Matters |
|---|---|---|
| In-line or beat current quarter but Q4 guide fails to show normal seasonal step-up | Q4 has averaged 27.2% of annual revenue and the highest EBITDA margin of any quarter (13.7% in FY2025) over the last three fiscal years [`01_historical-financials.md` §5] | A flat-to-Q3 Q4 guide would break a consistent three-year seasonal pattern and would likely be read as a genuine slowdown, not seasonality |
| Beat EBITDA/EPS but the forward guide embeds the first quantified AV-investment P&L cost | CFO on the $10bn AV program: "the closer we get to deployment and scale out, there will be a P&L impact, and we'll size that for investors clearly as we go" — no dollar or bps figure disclosed yet [`03_margin-drivers.md` §10] | The market currently reads the AV spend as a demand signal (external co-investment, live trip volume) rather than a cost; the first quantified cost figure would flip that read and could depress the forward margin outlook even on a beat quarter |
| Beat GAAP EPS due to one-off equity-stake mark-to-market gains, not operating quality | GAAP EPS swung +350.7%, −82.1%, −81.7%, +41.0% surprise over the last four quarters, driven by non-operating equity-stake gains/losses (Aurora, Didi, Grab, Joby); EPS Normalized is the cleaner series [`01_historical-financials.md` §3; `04_guidance-consensus.md` §6] | A GAAP EPS "beat" read at face value without separating out the mark-to-market swing would be a false-quality signal — the operating trend is better read from EBITDA/EBIT/EPS Normalized |
| Beat on the guided metrics but G&A/legal-accrual line reverses in the forward guide | The identical G&A legal-accrual line swung +106bps favorable in FY2025 then −97bps unfavorable in Q2 FY26 — "should not be extrapolated in either direction" [`03_margin-drivers.md` §8a] | A beat this quarter says nothing about whether the next quarter's G&A line repeats or reverses; the forward guide could embed a fresh negative swing even after a clean Q3 beat |

## 6. Seasonality Read

Q3 is a moderate, not a peak, seasonal quarter: it has averaged 25.4% of annual revenue over the last three fiscal years, ahead of Q1 (23.0%) and Q2 (24.5%) but behind Q4 (27.2%) [`01_historical-financials.md` §5]. Margin seasonality within Q3 has actually been softer than Q2 in the one comparable year with clean data: FY2025 Q3 EBITDA margin was 9.7%, down from Q2 FY2025's 12.9%, before recovering to 13.7% in Q4 [`01_historical-financials.md` §5]. Uber's own FQ3 2026 guided EBITDA range ($2,860–2,960mm) is roughly flat to modestly up versus the actual Q2 FY2026 print ($2,819mm) rather than assuming a big sequential step-up, which is broadly consistent with this softer historical Q3 seasonal pattern already being reflected in the guide. Net: seasonality is a mild, already-priced-in factor here — it neither meaningfully helps nor hurts the setup, since the guided range appears to already account for the typical Q3 softening.

## 7. Historical Pattern

Uber has beaten its own EBITDA guidance in all four of the last four quarters, and cleared ABOVE the guided high end in the last two (Q1, Q2 FY26) by a nearly identical ~2.5% each time — a real but short (two-quarter) pattern, following two more modest within-range beats in Q3/Q4 FY25 (+0.71%, +1.10%) [`04_guidance-consensus.md` §6]. Revenue has flipped from small beats against consensus in Q3/Q4 FY25 (+0.3% to +1.6%) to small misses in Q1/Q2 FY26 (around −0.5%), a trend partly explained by the known, mechanical UK reclassification but reinforced by the post-print downward revision skew this quarter [`04_guidance-consensus.md` §6]. EPS Normalized flipped from large misses (driven by below-the-EBITDA-line items) to small beats, coinciding with Uber starting to guide the metric as its own range in Q1 FY26. GAAP EPS is not usable as a pattern at all given its non-operating mark-to-market swings. The synthesizer should weight the EBITDA/EPS Normalized beat pattern moderately-to-highly (it is mechanistically explained by a genuine, quantified cost-of-revenue improvement, not just noise) but should weight the "above guided high end" magnitude specifically as a short, two-quarter sample, not yet a fully proven new normal.

## 8. Setup Verdict

**Setup favors beat.**

The single most important factor is the EBITDA/EPS Normalized guidance-beat streak: Uber has beaten its own guidance in 4 of the last 4 quarters and cleared the guided high end in the last 2 by a near-identical ~2.5%, backed by a genuine, quantified cost-of-revenue improvement (+377bps ex-UK in Q2 FY26) rather than a one-off [`03_margin-drivers.md` §8a; `04_guidance-consensus.md` §6]. The single biggest risk that could flip this verdict is a third straight revenue miss against consensus — revenue estimates were cut 1.04% in the three trading days after the Q2 print with net revision breadth of −11, and a wider-than-expected miss (beyond the ±0.5% range of the last two quarters) would likely dominate headline market reaction even if EBITDA/EPS clear their guided ranges again [`04_guidance-consensus.md` §3, §5].

## 9. Second-Quarter Look-Ahead

The quarter after next, Q4 FY2026, is seasonally the strongest of the year (27.2% average revenue share, historically the highest EBITDA margin quarter) [`01_historical-financials.md` §5], which should help the setup mechanically. Two offsetting factors are already visible: the UK reclassification drag will still be in the year-over-year comparison (it does not lap until Q1 FY27), so reported revenue optics stay suppressed, while the Trendyol Go M&A headwind to Delivery should normalize by Q4 per management [`02_revenue-drivers.md` §4]. There is no visibility yet on the specific numeric Q4 guide (Uber guides only one quarter forward at a time), and the AV-investment P&L cost — not yet quantified — is the wildcard that could first surface in that guide.

## 10. Pre-Mortem

If this "favors beat" setup fails, the most likely reason is that the revenue miss widened materially beyond the narrow (under 0.6%) misses of the last two quarters — either because the UK reclassification effect or the underlying trip-volume deceleration (YoY growth already cooled from the high-teens FY2023–2025 run-rate to +14.5% and +12.2% in the last two quarters, per `01_historical-financials.md` §6) proved larger than the guided-metric beat streak could offset in the market's read, or because the volatile G&A/legal-accrual line swung unfavorably again and ate into the EBITDA beat itself.



---

## earnings / 06_earnings-quality.md

_Source: `06_earnings-quality.md`_

# Earnings Quality — UBER

Reporting standard: US GAAP. Reporting currency: USD millions unless stated. FY0 = FY2025 (year ended Dec-31-2025). Uber is a US SEC filer (10-K/10-Q); US form names below are its actual primary documents [FY25 10-K, p.1].

## 1. EBITDA → CFO → FCF Bridge (5 years)

All figures USD millions. EBITDA = GAAP Income from operations + total D&A (Capital IQ-standardized, matching `01_historical-financials` §1) — this is the reported/GAAP-basis EBITDA, distinct from the company's own non-GAAP "Adjusted EBITDA" shown in §7 below. "Working capital change" = Δ Accounts Receivable + Δ Accounts Payable + Δ Other Net Operating Assets (the latter includes the buildup of Uber's self-insurance reserves — see the note beneath the table). "Other operating items" is the reconciling balance needed to tie EBITDA to CFO once cash tax, cash interest, and the working-capital line are removed; it is mostly the non-cash stock-based-compensation (SBC) add-back plus deferred-tax and other non-cash reconciling items. All figures traced to and independently re-summed from [CIQ Financials_Annual.xls → Cash Flow, Income Statement; FY25 10-K].

| Item | FY2021 | FY2022 | FY2023 | FY2024 | FY2025 | Trend |
|---|---:|---:|---:|---:|---:|---|
| EBITDA (reported/GAAP-basis) | (2,932) | (885) | 1,933 | 3,536 | 6,312 | Accelerating |
| Working capital change | +1,682 | +335 | +165 | +2,374 | +2,227 | Volatile (large, insurance-reserve-driven) |
| Tax paid (cash) | (87) | (175) | (234) | (324) | (345) | Rising with profitability |
| Interest paid (cash) | (449) | (513) | (629) | (475) | (386) | Declining (lower gross debt cost) |
| Other operating items (mainly SBC add-back + non-cash reconciling items) | +1,341 | +1,880 | +2,350 | +2,026 | +2,291 | Stable, large |
| **CFO** | **(445)** | **642** | **3,585** | **7,137** | **10,099** | Decelerating (still growing, but slower than FY23→24) |
| Total capex (maintenance/growth not split — see note) | (298) | (252) | (223) | (242) | (336) | Stable, small (<1% of revenue) |
| **FCF (CFO − Total Capex)** | **(743)** | **390** | **3,362** | **6,895** | **9,763** | Decelerating (still growing) |
| **CFO / EBITDA %** | NM (neg. EBITDA) | NM (neg. EBITDA) | 185.5% | 201.8% | 160.0% | Consistently well above 100% |

Capex split not disclosed — total capex used. FCF may understate true recurring free cash flow if a material share of the $298–336M/year is growth rather than maintenance capex; however, total capex is under 1% of revenue in every year shown, so the split matters far less here than in a capital-intensive business [CIQ Financials_Annual.xls → Cash Flow].

**Lead figure is the reported FCF above — it is not inflated by a one-off cash item or a company-defined add-back.** Uber's own free-cash-flow reconciliation table is identical to the module standard: "Net cash provided by operating activities" minus "Purchases of property and equipment," with no interest/dividend add-back or other adjustment [FY25 10-K, "Free cash flow reconciliation" table: FY2024 $7,137M − $242M = $6,895M; FY2025 $10,099M − $336M = $9,763M — both tie exactly to the bridge above]. No normalisation adjustment is required under §15.

**Bridge reconciles exactly** in every year shown (EBITDA + WC change − tax paid − interest paid + other operating items = CFO, verified by direct recomputation from the cited cash-flow-statement lines).

**Note on "Other operating items" and "Working capital change":** these two lines are large relative to reported EBITDA, mainly because (i) SBC of $1.8–1.9bn/year is expensed in GAAP operating income (lowering EBITDA) but added back as non-cash in the CFO build, and (ii) Uber's self-insurance reserves (auto liability, workers' comp — $12.5bn total balance at Dec-31-2025) have grown every year, and that growth shows up as a non-cash increase in operating liabilities within "Change in Other Net Operating Assets" [FY25 10-K, p. re "Valuation of Insurance Reserves" critical audit matter and Note 1; FY25 10-K MD&A: "the increase in cash from working capital was primarily driven by an increase in our accrued insurance reserves … liabilities recorded during the period exceeding claims paid out"]. Growing insurance reserves are a real, cited, long-tail liability — not a fabricated item — but they mean a meaningful share of the CFO-over-EBITDA gap is a deferred cash outflow (future claims payments) rather than pure organic operating cash generation. See §2.

## 2. Cash Conversion Assessment

CFO has tracked and in every profitable year exceeded reported EBITDA by a wide margin: 185.5% in FY2023, 201.8% in FY2024, and 160.0% in FY2025 [computed above from CIQ Financials_Annual.xls]. This is well above the 70% "healthy" threshold and is not a cash-conversion concern in the mechanical sense the module tests for — but the ratio being this far above 100% is itself informative rather than simply "good": a large part of the gap is the SBC add-back (a real, recurring, dilutive cost that EBITDA already deducts but CFO does not) and the buildup of self-insurance reserves (a liability that will eventually require cash to settle claims, even if the exact timing is actuarially uncertain). The trajectory is decelerating in ratio terms (201.8% → 160.0% FY24→FY25) even as absolute CFO keeps growing, because EBITDA itself is growing faster than the non-cash addback base. Net: cash conversion is not a red flag — CFO/EBITDA has never fallen below ~150% in the profitable years shown — but the composition of that conversion (SBC + insurance-reserve build, not pure receivables/payables efficiency) should temper how "clean" the headline ratio looks.

CFO/EBITDA was not below 50% in any of the last 3 years (185.5%, 201.8%, 160.0%), so the cash-conversion-breakdown trigger does not apply; no RF-EQ-002 tag is emitted.

## 3. Working Capital Trends

Uber is an asset-light, on-demand marketplace and does not report an inventory line [CIQ Financials_Annual.xls → Balance Sheet, "Inventory Method: NA" in all periods] — DIO ("inventory days") is Not Applicable, and the cash conversion cycle below uses DSO and DPO only. DSO uses revenue as the denominator; DPO uses COGS. Balances are period-end averages ((opening + closing)/2).

| Metric | FY2023 | FY2024 | FY2025 | Direction | Risk |
|---|---:|---:|---:|---|---|
| Receivable days (DSO = 365 × avg AR ÷ revenue) | 30.3 | 28.0 | 25.1 | Falling | Low — faster collection, not a red flag |
| Inventory days (DIO) | N/A | N/A | N/A | N/A | Not applicable — no inventory (marketplace model) |
| Payable days (DPO = 365 × avg AP ÷ COGS) | 11.8 | 10.9 | 10.7 | Roughly stable, slightly falling | Low — no evidence of stretching suppliers/drivers for cash |
| Cash conversion cycle (DSO + DIO − DPO) | 18.5 | 17.0 | 14.4 | Shortening | Low — favourable trend |

Evidence: Accounts Receivable FY2022 $2,779M / FY2023 $3,404M / FY2024 $3,333M / FY2025 $3,827M; Accounts Payable FY2022 $728M / FY2023 $790M / FY2024 $858M / FY2025 $1,013M; COGS FY2023 $23,446M / FY2024 $27,483M / FY2025 $31,992M; Revenue FY2023 $37,281M / FY2024 $43,978M / FY2025 $52,017M [all CIQ Financials_Annual.xls → Balance Sheet, Income Statement].

None of the three hard-flag conditions trigger: DSO fell (not rose) in both FY2024 and FY2025; DIO is not applicable; DPO is roughly flat, not sharply rising. AR growth (FY2024: −2.1% YoY; FY2025: +14.8% YoY) has run below revenue growth (+18.0% FY2024; +18.3% FY2025) in both years, consistent with the falling DSO — no receivables-growing-faster-than-revenue concern (see §6).

## 4. Non-GAAP Adjustments

| Adjustment | Amount (FY2025) | Recurring? (Y/N) | Concern Level (Low/Mid/High) | Evidence |
|---|---:|---|---|---|
| Stock-based compensation add-back | $1,826M | Y — every year, rising in dollar terms | High | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Legal, non-income tax, and regulatory reserve changes and settlements | $564M (FY2024: $1,123M) | Y — appears in both years shown despite being an "adjustment" item | High | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Depreciation and amortization | $719M | Y (standard EBITDA add-back, not a quality concern on its own) | Low | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Acquisition, financing and divestitures related expenses | $43M (FY2024: $25M) | Y — present both years | Mid | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Restructuring and related charges | $9M (FY2024: $25M) | Y — present both years, small | Low | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Goodwill and asset impairments/loss on sale of assets, net | $2M (FY2024: $3M) | Y — small, present both years | Low | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Loss on lease arrangement, net | $2M (FY2024: $2M) | Y — small | Low | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |

Total FY2025 add-backs from Income from operations ($5,565M) to Adjusted EBITDA ($8,730M) = $3,165M, i.e. Adjusted EBITDA is 56.9% above GAAP operating income — a large gap. SBC ($1,826M) is the single largest component and is excluded from "adjusted" earnings every year despite being a real, recurring, dilutive cost — this is the classic quality flag the module tests for. The "legal, non-income tax, and regulatory reserve changes and settlements" line ($564M FY2025, $1,123M FY2024) is presented as an adjustment but recurs in both years shown at material size (6.5–17% of the total add-back), which by the module's own test ("Recur every period → then they're not one-off") is a genuine earnings-quality concern, addressed further in §5 and §8.

## 5. One-Off Items (last 3 years)

| Item | Period | Amount | Classification (Genuine / Suspicious / Recurring "one-off") | Evidence |
|---|---|---:|---|---|
| Legal, non-income tax, and regulatory reserve changes and settlements | FY2024–FY2025 | $1,123M (FY24), $564M (FY25) | **Recurring "one-off"** — appears in the non-GAAP add-back every year shown; FY2023 figure not disclosed in this filing's two-year comparison table, so the full multi-year pattern cannot be confirmed beyond FY2024–FY2025, but two consecutive years at >$500M each is enough to flag | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Restructuring and related charges | FY2024–FY2025 | $25M (FY24), $9M (FY25) | Recurring "one-off" — small dollar amount, low concern | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| Deferred-tax valuation-allowance release | FY2024 | ~$6.0bn (non-cash, embedded in the $9,856M FY2024 net income and the $(5,758)M FY2024 tax "provision" (i.e., benefit) shown in §7 below) | Genuine one-off — a discrete tax-accounting event, does not recur at this scale in FY2025 (FY2025 tax benefit was smaller, $(4,346)M, but still a benefit — see §8) | [FY25 10-K MD&A: "primarily consisting of $9.8 billion of net income … which primarily included $6.0 billion of deferred income taxes" for FY2024 CFO build; `01_historical-financials` §6] |
| Gain/(loss) on sale of/mark-to-market on minority equity investments (Didi, Aurora, Grab and others) | Every quarter, FY2023–Q2 FY2026 | Swings from +$1,612M (Q2'26) to −$1,602M (Q4'25) to +$1,471M (Q3'25); FY2025 full-year net −$61M (small net, large gross swings) | **Recurring — not a one-off at all.** This line item appears in every quarter and is a permanent structural feature of GAAP net income given Uber's large minority equity stakes are marked at fair value through P&L | [CIQ Financials_Annual.xls → Cash Flow, "(Gain) Loss On Sale Of Invest." row; `01_historical-financials` §3] |

## 6. Accrual Quality Flags

| Flag | Triggered (Y/N) | Evidence |
|---|---|---|
| Revenue growing faster than CFO for 2+ years | N | Revenue grew +18.0% (FY24) and +18.3% (FY25); CFO grew +99.1% (FY24) and +41.5% (FY25) — CFO has grown far faster than revenue in both years [CIQ Financials_Annual.xls] |
| Receivables growing faster than revenue | N | AR fell −2.1% YoY in FY2024 (vs +18.0% revenue growth) and rose +14.8% YoY in FY2025 (vs +18.3% revenue growth) — AR growth trails revenue growth in both years [CIQ Financials_Annual.xls → Balance Sheet] |
| Inventory growing faster than COGS | N | Not applicable — Uber carries no inventory (marketplace model) [CIQ Financials_Annual.xls → Balance Sheet, "Inventory Method: NA"] |
| Deferred revenue declining (if subscription/contract business) | N/A — not disclosed | Uber does not report a separate "Unearned Revenue" balance-sheet line from FY2020 onward [CIQ Financials_Annual.xls → Balance Sheet]; Uber One membership fees exist but a standalone deferred-revenue/contract-liability balance is not broken out in the data available here. Not proven from available data — cannot confirm trend either way |
| Capitalized costs growing as % of revenue | N (proxy only) | No standalone capitalized-software-cost disclosure found in the reviewed 10-K sections; total capex (a partial proxy, since some capitalized software sits in capex) has been stable at 0.55–0.65% of revenue in FY2023–FY2025, showing no rising trend [CIQ Financials_Annual.xls → Cash Flow, Income Statement] |
| Frequent accounting policy changes | N | One disclosure-methodology change identified — the segment non-GAAP measure moved from "Segment Adjusted EBITDA" to "Segment Operating Income" beginning Q1 FY2026 [Q1 FY26 10-Q; Q2 FY26 10-Q] — a single change, not evidence of a pattern of "frequent" changes, but flagged for downstream awareness (see §7 comparability note) |

0 of 6 flags triggered Y (the "N/A — not disclosed" and "N (proxy only)" rows are not counted as triggers). Because fewer than 2 rows are triggered Y, no `RF-EQ-001` tag is emitted.

## 7. Reported vs Adjusted Reconciliation

| Metric | Reported | Adjusted | Difference | % of Reported | Recurring? | Evidence |
|---|---:|---:|---:|---:|---|---|
| EBITDA (FY2025) | $6,284M (GAAP Income from operations $5,565M + D&A $719M, per the company's own reconciliation table) | $8,730M ("Adjusted EBITDA") | +$2,446M | +38.9% | Y — SBC and legal/regulatory reserve add-backs recur every year | [FY25 10-K, "Adjusted EBITDA reconciliation" table] |
| EBIT (FY2025) | $5,565M (GAAP Income from operations) | Not separately disclosed | n/a | n/a | n/a — Uber presents only Adjusted EBITDA and Free Cash Flow as non-GAAP measures | [FY25 10-K, Non-GAAP Measures section] |
| Net income (FY2025) | $10,053M (incl. non-controlling interests) / $10,053M attributable... $9,856M and $10,053M figures per period — see note | Not disclosed | n/a | n/a | n/a — no adjusted net income measure disclosed | [FY25 10-K, Consolidated Statements of Operations] |
| EPS (FY2025) | $4.73 diluted (GAAP) | Not disclosed | n/a | n/a | n/a — no adjusted EPS measure disclosed | [FY25 10-K, Consolidated Statements of Operations] |

**Material comparability break flagged for downstream:** Beginning Q1 FY2026 Uber discontinued its segment-level "Segment Adjusted EBITDA" non-GAAP measure in favour of "Segment Operating Income," and the term "EBITDA" does not appear anywhere in the Q2 FY2026 10-Q outside that one segment-methodology sentence, nor in either the Q1 or Q2 FY2026 earnings-call transcripts [Q1 FY26 10-Q; Q2 FY26 10-Q; Q1 FY26 call, May-06-2026; Q2 FY26 call, Aug-05-2026]. FY2025's $8,730M Adjusted EBITDA is the last disclosed figure of its kind in this data pool — no consolidated non-GAAP profitability reconciliation exists for Q1 or Q2 FY2026. Any FY2026 "Adjusted EBITDA" figure quoted by a third party (sell-side note, press summary) not in this pool should be treated with caution until its definition is confirmed against a primary source [carried forward from `01_historical-financials` §4].

**GAAP net income/EPS is not a clean quality signal independent of the two items below (already documented in `01_historical-financials` §6, restated here for the earnings-quality read):** FY2024's $9,856M net income included a ~$6.0bn non-cash deferred-tax valuation-allowance release, and both FY2024 and FY2025 recorded large non-operating tax *benefits* (provision for income taxes of $(5,758)M and $(4,346)M respectively — i.e., negative tax expense) [FY25 10-K, "Adjusted EBITDA reconciliation" table]. On top of that, quarterly GAAP EPS swings 5–10x quarter to quarter on unrealized mark-to-market gains/losses on minority equity stakes unrelated to operations (e.g., +$1,612M in Q2 FY2026, −$1,602M in Q4 FY2025) [`01_historical-financials` §3]. Neither of these affects EBITDA, CFO, or FCF — but they mean GAAP net income and diluted EPS materially overstate the stability of underlying earnings, and TTM diluted EPS actually fell 22.5% (Jun-30-2025 to Jun-30-2026) even as TTM EBITDA rose 42.9%, EBIT rose 48.6%, and FCF rose 18.5% [`01_historical-financials` §2].

## 8. Accounting Trap Checklist

| Trap | Triggered? (Y/N) | Evidence | Severity /100 *(higher = WORSE — inverted)* |
|---|---|---|---:|
| Stock-based compensation excluded from adjusted earnings | Y | SBC $1,826M FY2025 (3.5% of revenue, 20.9% of Adjusted EBITDA) added back every year in the Adjusted EBITDA reconciliation [FY25 10-K] | 55 |
| Restructuring costs recur every year | Y | $25M (FY24), $9M (FY25) both added back as "non-recurring" — small absolute size limits the concern | 20 |
| Capitalized costs rising faster than revenue | N (insufficient data) | No standalone capitalized-software disclosure found; capex/revenue stable at 0.55–0.65% FY2023–FY2025 (partial proxy only) [CIQ Financials_Annual.xls] | 10 |
| Receivable factoring / supplier finance disclosed | N | No factoring, receivables-sale, or supply-chain-finance disclosure found in the reviewed 10-K sections | 5 |
| Inventory write-downs or reserve releases | N/A | No inventory (marketplace model) [CIQ Financials_Annual.xls → Balance Sheet] | 0 |
| Revenue recognized before cash collection risk is clear | N | DSO is falling, not rising (§3); no evidence of premature recognition beyond the already-flagged FY2022 gross/net presentation reclassification, which is a presentation issue, not a collectability issue [`01_historical-financials` §1] | 10 |
| Change in useful life / depreciation assumptions | N (not identified) | No disclosed change in useful-life assumptions found in the reviewed sections | 5 |
| Tax rate unusually low or boosted by one-off | Y | FY2024: ~$6.0bn non-cash deferred-tax valuation-allowance release; FY2024 and FY2025 both show a net tax *benefit* (negative provision) rather than an expense [FY25 10-K, Adjusted EBITDA reconciliation table] | 65 |
| Large fair-value / mark-to-market gains | Y | Unrealized gains/losses on minority equity stakes (Didi, Aurora, Grab) swing GAAP net income by $1.4–1.6bn in single quarters, unrelated to operating performance [`01_historical-financials` §3] | 60 |

## 9. Earnings Quality Score

**Score: 68/100** (band: 61–80, "Mostly clean but some working capital or adjustment noise").

The single most important reason: underlying operating cash generation is genuinely strong and improving — CFO has exceeded reported EBITDA by 150–200% in every profitable year (FY2023–FY2025), FCF matches the company's own straightforward CFO-minus-capex definition with no inflating add-back, and the cash conversion cycle is shortening (18.5 → 14.4 days) with no accrual-quality flags triggered (0 of 6). That keeps the score in the upper-middle band rather than lower. It is capped below the 81–100 "very strong, minimal adjustments" band by three real and cited concerns: (1) a recurring "legal, non-income tax, and regulatory reserve changes and settlements" add-back ($564M–$1,123M in the two years shown) that by its own repetition contradicts its "adjustment" framing; (2) SBC of ~$1.8bn/year (20.9% of Adjusted EBITDA) permanently excluded from the company's headline non-GAAP profitability measure; and (3) GAAP net income and EPS — the metric most investors quote — being materially distorted by a one-off $6.0bn deferred-tax valuation-allowance release (FY2024) and recurring large mark-to-market swings on minority equity stakes, none of which touch EBITDA, CFO, or FCF but all of which mean the headline earnings numbers require real interpretive work to use.

## 10. The Single Biggest Quality Concern

The cash economics of Uber's business are not in question here — CFO and FCF are large, growing, and well in excess of reported EBITDA, and no accrual-quality red flag (receivables outrunning revenue, inventory build, deferred-revenue erosion) is present. The single biggest quality concern is that the two metrics most commonly quoted for Uber — Adjusted EBITDA and GAAP EPS — are each distorted in ways that are disclosed but easy to miss. Adjusted EBITDA excludes a real, recurring, dilutive cost (SBC, ~21% of the FY2025 adjusted figure) and a "legal, non-income tax, and regulatory reserve" charge that has recurred at material size (>$500M) in both years this filing discloses, meaning the "clean" $8,730M FY2025 Adjusted EBITDA is $2,446M above a GAAP-basis figure that already excludes cash tax and cash interest. Separately, GAAP net income and diluted EPS — which fell 22.5% on a TTM basis even as EBITDA, EBIT, and FCF all grew double digits — are dominated by a one-off $6.0bn deferred-tax benefit (FY2024) and by unrealized mark-to-market swings of $1.4–1.6bn per quarter on minority equity stakes that have nothing to do with the ride-hailing and delivery business. An investor relying on either headline number without adjusting for these items would materially mis-read the trajectory of the business in either direction depending on which quarter they looked at.



---

## earnings / 07_earnings-sensitivity.md

_Source: `07_earnings-sensitivity.md`_

# Earnings Sensitivity — UBER

Reporting standard: US GAAP. Reporting currency: USD (millions). All figures below use GAAP operating income (EBIT), not Adjusted EBITDA — `03_margin-drivers.md` §1 and §5 flag that Uber stopped disclosing a comparable consolidated Adjusted EBITDA reconciliation after FY2025 (the term does not appear in the Q1 or Q2 FY2026 10-Qs or transcripts) and itself now recommends EBIT as "the most useful metric for Uber going forward." Using EBIT keeps this report on a basis that is (a) consistently disclosed across every period cited, and (b) not distorted by the below-the-line, non-operating mark-to-market swings that make GAAP diluted EPS an unreliable earnings-sensitivity metric for Uber (TTM diluted EPS fell 22.5% even as TTM EBIT rose 48.6% — `01_historical-financials.md` §2, §6). Where a variable's impact is genuinely revenue-level only (FX), that is stated explicitly rather than forced into an EBIT figure that isn't disclosed.

Base period used throughout: **TTM ended Jun-30-2026** — Revenue $55,227M, EBIT $6,700M (12.1% margin) [`01_historical-financials.md` §2].

## 1. Variable Selection

Six variables were selected from the upstream driver tables and the business-model external-dependency output, prioritizing the highest magnitude ratings in each: (1) **Trip / Gross Bookings volume growth** (Revenue Driver Table, Magnitude High), the single biggest revenue driver per `02_revenue-drivers.md` §7; (2) **Driver/Courier/Carrier variable payments** (cost of revenue, Margin Driver Table, Magnitude High), the single biggest margin driver per `03_margin-drivers.md` §9; (3) **G&A / legal-accrual swings** (Margin Driver Table, Magnitude High), flagged as the single most unpredictable driver in the cost stack; (4) **Mobility insurance cost / fare pass-through** (Margin Driver Table, Magnitude High on the cost line), included for its disclosed asymmetric behavior (see §6); (5) **FX translation** (Revenue Driver Table, Magnitude Low–Mid, but the only variable besides interest rates with an exact company-disclosed sensitivity); and (6) **Driver classification / labor regulation** (External Dependency Table, Dependency Level High), pulled directly from `business-model/10_external-dependency.md` §1 and §5, which names it "the single item that could force a structural change to the business model." The UK Mobility revenue/cost reclassification (High magnitude in both upstream tables) was deliberately excluded as a core sensitivity variable — it is a known, mechanical, already-quantified accounting effect with a fixed lapse date (Q1 FY2027), not a variable with genuine forward uncertainty in its size or direction; it is referenced only as context. Interest-rate risk was excluded despite a company-disclosed sensitivity because its Magnitude is rated Low (a $538M fair-value mark against fixed-rate notes, not a cash-earnings effect) [`business-model/10_external-dependency.md` §1–§2].

## 2. Sensitivity Table

All "EBIT Impact" figures are in USD millions, GAAP operating income basis, applied to the $55,227M TTM revenue base unless noted. Inverted-metric note: none of the impact columns below are inverted — positive = favorable to EBIT, negative = unfavorable.

| Variable | Base Case | Move Basis | Bull Case | EBIT Impact (bull) | Bear Case | EBIT Impact (bear) | Confidence | Evidence |
|---|---|---|---|---:|---|---:|---|---|
| Trip / Gross Bookings volume (proxied by ex-UK YoY revenue growth) | ~19.9% ex-UK, ex-FX YoY growth (Q2 FY26) | Historical observed range: headline YoY revenue growth ranged +12.2% to +18.3% over the last 5 reported periods; Gross Bookings constant-currency growth has stayed above 20% for 4 consecutive quarters | Accelerates to ~25% YoY | +$828M | Decelerates to ~15% YoY | −$828M | Medium (move size historical; ~30% incremental-EBIT-margin coefficient is inferred, not disclosed) | [`02_revenue-drivers.md` §6a, §7; `01_historical-financials.md` §1, §3] |
| Driver/Courier/Carrier variable payments (cost of revenue, % of revenue) | 55.1% reported / 56.4% ex-UK (Q2 FY26) | Historical observed range: this ratio swung −132bps (UK optical effect) to +377bps (genuine improvement) within one YoY quarterly comparison; −35bps for FY2025 full year | Improves 2pp, to ~53.1% | +$1,105M | Worsens 2pp, to ~57.1% | −$1,105M | Medium (move size is a historical-range inference; the dollar conversion itself is a direct, non-inferred calculation) | [`03_margin-drivers.md` §3, §8a; `business-model/06_value-chain.md` §1 (competitive-incentive risk)] |
| G&A / legal-accrual swings | FY2025: +$549M favorable swing (~106bps); Q2 FY26 alone: −$138M unfavorable swing (~97bps) | Company-disclosed historical swings — the identical line item moved margin favorably then unfavorably in consecutive periods | Repeat of FY2025's favorable swing | +$549M | Q2 FY26's unfavorable swing sustained across 4 quarters | −$552M | Medium (the disclosed dollar swings are High confidence; annualizing the bear case is Inference, not from filings) | [`03_margin-drivers.md` §3, §8a] |
| Mobility insurance cost / fare pass-through | FY2025: +$851M cost-line headwind; March-2026 renewals delivered "hundreds of millions" in savings, reinvested into fares | Company-disclosed historical dollar swing plus management's own stated reinvestment philosophy ("return that goodness back to the market") | Costs fall ~$850M, but per management's stated philosophy most is reinvested into fares — only a fraction estimated to reach EBIT | +$150M (≈18% retention — Inference, not from filings; no disclosed retention ratio) | Costs rise ~$850M again (repeat of FY2025's disclosed pattern) with no offsetting fare increase | −$850M | Medium (bear case is a direct historical dollar swing); Low (bull case retention fraction is inferred) | [`03_margin-drivers.md` §4, §6; Q1 FY26 earnings call, Q&A] |
| FX translation | Q2 FY26: +1pp revenue tailwind (12% reported vs. 11% constant-currency) | Company-disclosed range: FY2025 full year was a ~−1pp Gross Bookings headwind; Q2 FY26 was a +1–2pp tailwind — a ~2–3pp directional swing within about two quarters | Widens to +2pp revenue growth | +$1,105M revenue (EBIT-equivalent ≈ +$134M, inferred using the 12.1% consolidated EBIT margin — not company-disclosed at the EBIT level) | Reverts to −2pp revenue growth | −$1,105M revenue (EBIT-equivalent ≈ −$134M, inferred) | High for the revenue-level pp figure (company-disclosed); Low for the EBIT-level dollarization (inferred, no disclosed FX-to-EBIT sensitivity) | [`02_revenue-drivers.md` §3; `business-model/10_external-dependency.md` §2] |
| Driver classification / labor regulation | Independent-contractor status currently upheld in all major operating markets; no active adverse ruling forcing reclassification | No company-disclosed dollar or bps sensitivity exists | Continued favorable/status-quo rulings — removes tail risk but adds no incremental EBIT beyond the base case | Impact: not quantifiable | A reclassification ruling/law in a large market (most consequentially the US) forcing employee status | Impact: not quantifiable — 10-K states only that Uber "would incur significant additional expenses" without a dollar figure, and might not retain "a majority of the Drivers currently using our platform" | Low (no disclosed sensitivity; qualitative severity assessment only) | [`business-model/10_external-dependency.md` §1, §5; FY25 10-K, Item 1A] |

## 3. Sensitivity Ranking

Ranked by absolute EBIT impact (average of |bull| and |bear|, USD millions). Driver classification / labor regulation is excluded from the ranked list because its impact is not quantifiable — see the note beneath the table.

| Rank | Variable | Absolute Impact (avg of bull + bear) | Direction of Current Trend |
|---:|---|---:|---|
| 1 | Driver/Courier/Carrier variable payments (cost of revenue ratio) | $1,105M | Improving (genuine ex-UK ratio improved 377bps in Q2 FY26) |
| 2 | Trip / Gross Bookings volume growth | $828M | Improving but decelerating (ex-UK growth ~19.9% vs. FY23–25's ~17–18% trend) |
| 3 | G&A / legal-accrual swings | $552M | Currently a headwind (Q2 FY26 swung unfavorable after FY2025's favorable swing) — direction is genuinely unpredictable, not trending |
| 4 | Mobility insurance cost / fare pass-through | $500M | Currently a cost-line tailwind (March-2026 renewal savings), but reinvested into fares, so near-zero realized EBIT benefit today |
| 5 | FX translation (EBIT-equivalent, inferred) | $134M | Tailwind (+1pp, Q2 FY26) — has swung to a headwind as recently as FY2025 |

**Not ranked (impact not quantifiable): Driver classification / labor regulation.** This is a critical omission from the numeric ranking, not a signal that it is unimportant — `business-model/10_external-dependency.md` §4 rates it the primary driver of a 48/100 External Dependency Risk Score (higher = worse) and §5 names it "the single item that could force a structural change to the business model." If it were quantifiable, it would plausibly rank above every variable in the table above; it is excluded from the numeric ranking specifically because no company-disclosed or reliably inferable dollar figure exists, and inventing one would violate this module's no-source-no-claim standard.

## 4. The Single Highest-Sensitivity Variable

Among the variables that can be quantified, **Driver/Courier/Carrier variable payments (the cost-of-revenue line, 55–61% of revenue)** moves EBIT the most — a plausible ±2 percentage-point swing in this ratio is worth ±$1,105M against a $6,700M TTM EBIT base, roughly ±17%. Its current direction is favorable: the genuine, ex-UK-reclassification improvement in this line was +377bps in Q2 FY26 alone, larger than the entire +186bps net EBIT-margin gain that quarter (`03_margin-drivers.md` §8a) — every other driver in the bridge is currently a net drag against it. This variable is largely company-controlled (an operating decision on incentive intensity) but not fully — `business-model/06_value-chain.md` §1 flags that Uber "may need to increase or may not be able to reduce the Driver incentives that we offer without adversely affecting the supply liquidity," meaning competitive pressure from rivals (Lyft, DoorDash, and local operators) to defend driver and courier supply is what would force the adverse case. A caveat belongs alongside this finding: if the unquantifiable driver-classification/labor-regulation risk (§3) were to crystallize in a large market, it would very plausibly dwarf this variable's impact — it is excluded from the ranking only because it carries no company-disclosed dollar sensitivity, not because it is smaller.

## 5. Interaction Effects

Several of these variables move together rather than independently. First, **Driver/Courier incentive payments and Trip/Gross Bookings volume are mechanically linked**: both cost of revenue and revenue scale with Gross Bookings, so an acceleration in trip volume (the #2-ranked variable) tends to also increase absolute driver/courier payments (the #1-ranked variable) — the two rarely move in isolation, and the net EBIT effect depends on whether incentive intensity (cost per trip) rises, falls, or holds steady alongside volume, which is a separate, largely company-controlled decision. Second, **FX translation and reported Gross Bookings/revenue growth compound rather than offset**: Q2 FY26's headline Gross Bookings growth of 24% included a +2pp FX tailwind on top of 22% constant-currency growth [`02_revenue-drivers.md` §3] — if FX reverses to the ~−1pp headwind seen in FY2025 at the same time organic volume growth decelerates (the bear case in row 1), the two effects would compound into a larger-than-either-alone deceleration in headline reported growth, even though the underlying organic trend and the FX effect are unrelated. Third, per the external-dependency table, a **fuel-price spike (Mid dependency) could simultaneously raise insurance-adjacent driver costs and force higher incentive payments** to retain drivers on the platform [`business-model/10_external-dependency.md` §1] — meaning the insurance and driver-incentive rows in §2 are not fully independent; a single commodity shock could hit both at once. The G&A/legal-accrual line is the one variable in this table that appears genuinely idiosyncratic — it has swung in opposite directions in consecutive periods with no evident correlation to the other five variables (`03_margin-drivers.md` §8a).

## 6. Non-Linear Or Asymmetric Risks

Two clear asymmetries are visible in the evidence, plus one likely-but-unproven non-linearity:

- **Insurance cost pass-through is explicitly asymmetric by management's own stated philosophy.** A cost increase (bear case, §2) risks a close-to-full pass-through to the P&L (−$850M EBIT if not offset), while a cost decrease (bull case) is largely reinvested into fares rather than kept as margin (management: "our philosophy has been to return that goodness back to the market") — the disclosed evidence supports an estimated ~18% retention on the upside versus effectively 100% exposure on the downside. This is a real, cited asymmetry, not a modeling assumption.
- **Driver classification / labor regulation is a binary, non-linear tail risk.** Unlike every other variable in this table, which moves earnings along a roughly continuous range, an adverse reclassification ruling in a large market would not scale gradually — it would trigger a step-change in cost structure (wages, benefits, taxes) and a risk to driver retention itself, which the 10-K frames as potentially forcing a structural change to the business model, not a marginal cost increase [`business-model/10_external-dependency.md` §5].
- **Operating deleverage risk in the volume bear case (likely, not company-quantified).** The Trip/Gross Bookings volume row (§2) assumes a ~30% incremental EBIT margin applies symmetrically in both directions, but this is an inference drawn from a period of accelerating growth (FY2024→FY2025, Q2'25→Q2'26). In a genuine volume slowdown, Uber may still need to sustain driver/courier incentive spending to protect supply liquidity (per `business-model/06_value-chain.md` §1) even as revenue growth cools — meaning the bear case for volume could compress EBIT by more than the symmetric −$828M shown in §2, because the cost side would not necessarily de-lever at the same rate revenue decelerated. This is flagged as a plausible non-linearity, not confirmed by any disclosed period of an actual Uber volume downturn in this data pool.

## 7. Earnings Volatility Score

**60/100** (inverted: higher = WORSE / more sensitive to small input changes).

One-line reason: five separately quantifiable variables can each move EBIT by roughly 8–17% of the $6,700M TTM base (a $134M–$1,105M range) on realistic near-term move sizes, plus one unquantifiable structural tail risk (driver classification) that the business-model module itself rates as the primary driver of a 48/100 External Dependency Risk Score — placing this in the "Material sensitivity" band, not "Very stable," even though the underlying operating trend (EBITDA, EBIT, FCF) has shown consistent multi-year improvement rather than volatility on its own (`01_historical-financials.md` §6).



---

## earnings / 08_earnings-red-flags.md

_Source: `08_earnings-red-flags.md`_

# Earnings Red Flags — UBER

Business-model module is available (`analyses/UBER_2026-08-08/business-model/`); this scan uses `03_segment-map.md`, `06_value-chain.md`, `10_external-dependency.md`, `12_red-flags-sweep.md`, and `99_business-model-synthesis.md` as cross-module inputs alongside all eight earnings-module outputs (`00`–`07`). No upstream output is missing.

## 1. Upstream Evidence Map

### Bullish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| `05_beat-miss-setup` | "Setup favors beat" for FQ3 2026 | EBITDA has beaten its own guidance in 4 of the last 4 quarters, above the guided high end in the last 2 by ~2.5% each [`05_beat-miss-setup.md` §7–8; `04_guidance-consensus.md` §6] | Medium — see the EBITDA-definition red flag in §2.9/§2.5 below, which weakens the specific evidentiary basis |
| `02_revenue-drivers` | Trip / Gross Bookings volume is strong and improving | Trips +18% YoY, Gross Bookings +22% constant-currency, four consecutive quarters above 20% CC growth, MAPCs +16% YoY [Q2 FY26 10-Q, MD&A Highlights] | High |
| `03_margin-drivers` | Genuine (ex-reclassification) cost-of-revenue leverage | +377bps of the +186bps total Q2 FY26 EBIT-margin gain came from genuine driver/courier-payment leverage, independently reconciled to GAAP figures [`03_margin-drivers.md` §8a] | High |
| `06_earnings-quality` | Cash generation is genuinely strong | CFO exceeded reported EBITDA by 150–200% in every profitable year FY2023–FY2025; 0 of 6 accrual-quality flags triggered; DSO/DPO trends favorable [`06_earnings-quality.md` §2–3, §6] | High |
| `01_historical-financials` | EBITDA/EBIT margin expanding every year for 5 straight years | EBITDA margin (16.8%) → 12.1%, EBIT margin (22.0%) → 10.7%, FY2021–FY2025 [`01_historical-financials.md` §1] | High |
| `03_margin-drivers` | Delivery segment margin expanding faster than revenue | Segment Operating Income +38% vs revenue +28% in Q2 FY26 [`03_margin-drivers.md` §7] | Medium-High |

### Bearish Evidence

| Source Agent | Claim | Evidence | Confidence |
|---|---|---|---|
| `04_guidance-consensus` | Revenue estimates are being cut, not raised, right after the print | FQ3 2026 revenue consensus fell 1.04% in 3 trading days post-print; net revision breadth −11 (8 up / 19 down) at the FQ3 level [`04_guidance-consensus.md` §3, §5] | High |
| `business-model/12_red-flags-sweep` | GAAP net income inflated 2 straight years by one-off, non-cash tax items | $6.4bn combined FY24 federal/state deferred-tax valuation-allowance release; $5.0bn Netherlands valuation-allowance release in FY25 — reported net income ran roughly double pretax income in both years [`12_red-flags-sweep.md` §2, RF-RFS-001] | High |
| `business-model/12_red-flags-sweep` | $12.5bn self-insurance reserve (Critical Audit Matter) is a real driver of the CFO/FCF growth story | Reserve grew 27% YoY (FY24 $9.8bn → FY25 $12.5bn); MD&A attributes FY24/FY25 working-capital cash gains "primarily" to this reserve build [`12_red-flags-sweep.md` §2] | High |
| `business-model/11_capital-allocation-governance` (via `99_business-model-synthesis`) | Serial-acquirer pattern culminating in a large debt-funded deal | ~12 deals since 2019; pending $14.8bn Delivery Hero takeover funded mainly via a new €14.2bn bridge facility; Filter 4 (CLAUDE.md §24) capped the business-model capital-allocation score at 50/100 [`99_business-model-synthesis.md` §1, §4] | High |
| `06_earnings-quality` | Adjusted EBITDA excludes real, recurring costs | SBC $1,826M (20.9% of Adjusted EBITDA) and a "legal, non-income-tax and regulatory reserve" add-back ($564M FY25, $1,123M FY24) both recur every year shown [`06_earnings-quality.md` §4, §8] | High |
| `07_earnings-sensitivity` / `business-model/10_external-dependency` | Driver-classification / labor-regulation risk is an unquantifiable, binary tail risk | 10-K states a reclassification "would incur significant additional expenses" with no dollar figure; `10_external-dependency.md` names it "the single item that could force a structural change to the business model" | Medium — severity is High if triggered, but probability is currently rated Low near-term |
| `03_margin-drivers` | G&A/legal-accrual line is genuinely unpredictable | Same line swung +106bps favorable in FY2025, then −97bps unfavorable in Q2 FY26 — "should not be extrapolated in either direction" [`03_margin-drivers.md` §8a] | High |

### Missing Evidence

| What Is Missing | Which Agent Flagged It | Impact On Setup |
|---|---|---|
| No earnings press release / non-GAAP reconciliation document in the data pool for FQ1/FQ2 FY2026 | Not explicitly named by any single upstream agent, but implied by `01`/`03`/`06`'s joint finding that the 10-Q body no longer discloses a consolidated Adjusted EBITDA reconciliation | Cannot verify the definitional basis of the "EBITDA" figure that `04`/`05` use for the guidance-beat-streak narrative — see §2.5/§2.9 below |
| No dated current-price / spot-quote file | `00_earnings-data-triage.md` §3, §5 | Limits only master-level "stock reaction" framing; does not cap any earnings-module score |
| No AV-investment P&L cost quantification (dollar or bps figure) | `03_margin-drivers.md` §10; `05_beat-miss-setup.md` §5, §9 | The $10bn multiyear AV program's cost side is unmeasured; current bullish "demand" read rests on asymmetric disclosure |
| No numeric FQ4 2026 guide yet | `05_beat-miss-setup.md` §9 | Normal one-quarter-ahead guidance cadence — not itself a red flag, but the AV cost figure could first surface there |
| No Mobility-only Trip count or per-Driver acquisition cost (business-model-level gap) | `business-model/99_business-model-synthesis.md` §4 | Does not block the earnings-module verdict; relevant mainly to a unit-economics/valuation read outside this module's scope |

### Contradictions Between Agents

| Agent A | Agent A Says | Agent B | Agent B Says | Reconcilable? (Y/N) | Which Is More Credible |
|---|---|---|---|---|---|
| `01_historical-financials` (§3, quarterly trend table) | Q2 FY26 "EBITDA (reported)" = $2,085M (GAAP Income from operations + D&A) | `04_guidance-consensus` (§6) / `05_beat-miss-setup` (§7–8) | Q2 FY26 "actual EBITDA" = $2,819M, cleared above the $2,700–2,800mm guided range | N within this data pool — the two figures differ by $734M (35.2%) and cannot be bridged from any primary source available here, because Uber's 10-Q no longer discloses a consolidated Adjusted-EBITDA reconciliation for FY2026 (`01`/`03`/`06` all independently flag this disclosure change) | Neither is "wrong" on its own terms — `01`'s figure is GAAP-basis (transparently derived, reconcilable to the 10-K/10-Q); `04`/`05`'s figure is a Street/CIQ-sourced, Adjusted-EBITDA-like figure that cannot be independently verified for FY2026 in this pool. The GAAP figure (`01`) is more credible as an audited-basis number; the guided/consensus figure (`04`/`05`) is more credible as the actual bar the market is using, but its precise definition is unverified. See §2.5/§2.9 for the full analysis. |
| `01_historical-financials` (§6) / `05_beat-miss-setup` (§10, Pre-Mortem) | "Revenue growth is decelerating" — YoY cooled from ~17–18% (FY23–25) to +14.5% (Q1'26) and +12.2% (Q2'26); `05`'s pre-mortem calls this "underlying trip-volume deceleration" | `02_revenue-drivers` (§4, §6, §6a) | Trips +18% YoY, Gross Bookings +22% constant-currency (4 consecutive quarters above 20% CC); the UK Mobility reclassification alone accounts for −8.7pp of Q2's 12.2pp headline growth, and ex-UK/ex-FX growth is ~19.9% — i.e., NOT decelerating versus the 17–18% FY23–25 base rate | Y — the underlying arithmetic reconciles cleanly in `02`'s own decomposition | `02_revenue-drivers` is more credible on what is actually happening to demand: it explicitly separates the mechanical UK accounting effect from organic trip volume, and its residual reconciles to 0.0pp. `01`'s headline revenue-growth trend is factually accurate as a description of reported revenue, but `05`'s pre-mortem language conflates "revenue growth deceleration" with "trip-volume deceleration" — these are not the same thing once the UK effect is stripped out. See §2.2/§2.10 below. |
| `06_earnings-quality` (§5, §7) | FY2025's tax benefit is "smaller" than FY2024's ~$6.0bn release and "does not recur at this scale" | `business-model/12_red-flags-sweep` (§2) | FY2025 carried its OWN large, discrete one-off: a $5.0bn Netherlands deferred-tax valuation-allowance release, on top of FY2024's $6.4bn combined federal/state release — both years show reported net income running roughly double pretax income | Y — both cite the same 10-K, just at different granularity | `12_red-flags-sweep`'s figure is more complete: it identifies a *second, comparably large* one-off item in FY2025 that `06_earnings-quality` characterized only as a smaller residual rather than its own discrete event. See §2.7/§2.9 below. |

## 2. Red-Flag Scan — Category By Category

### 2.1 Data Completeness

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| No earnings press release / non-GAAP reconciliation in the pool for FQ1/FQ2 FY2026 | Triggered | High | High | The 10-Q body does not mention "EBITDA" outside one segment-methodology sentence [`01_historical-financials.md` §4; `03_margin-drivers.md` §1; `06_earnings-quality.md` §1, §7]; no press-release file is inventoried in `00_earnings-data-triage.md` §1 | The guided/consensus "EBITDA" figure that anchors `05`'s "favors beat" verdict cannot be verified against a primary source for FY2026 — see §2.5/§2.9 |
| No dated current-price / spot-quote file | Triggered | Low | High | [`00_earnings-data-triage.md` §3, §5] | Limits only master-level stock-reaction commentary; no earnings-module score impact |
| AV-investment P&L cost not yet quantified anywhere in the pool | Triggered | Medium | Medium | CFO: "we'll size that for investors clearly as we go" — no dollar or bps figure disclosed [`03_margin-drivers.md` §10] | Forward guide (Q4 FY26 or later) is a wildcard that could reprice the "demand not cost" reading |
| Two `EstimatesReport.xls` files are byte-identical duplicates | Not Triggered | Low | High | Correctly identified and treated as one source by `00`/`04` [`00_earnings-data-triage.md` §1; `04_guidance-consensus.md` §1] | None — already handled correctly upstream |
| No numeric FQ4 2026 guide yet | Not Triggered | Low | High | Normal one-quarter-ahead guidance cadence [`05_beat-miss-setup.md` §9] | Not a red flag on its own; the AV cost figure could first surface there |

### 2.2 Historical Trend

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Headline "revenue growth decelerating" narrative is materially overstated once the UK Mobility reclassification is stripped out | Triggered | High | High | Q2 FY26 headline growth +12.2% vs ex-UK/ex-FX growth ~19.9% [`02_revenue-drivers.md` §6a]; the UK effect alone is −8.7pp of the 12.2pp reported growth | If uncorrected, the master synthesizer could read "decelerating" as a genuine demand slowdown when the evidence shows trip volume/Gross Bookings growth stable-to-accelerating (4 straight quarters >20% CC) |
| GAAP diluted EPS fell 22.5% TTM even as EBITDA (+42.9%), EBIT (+48.6%), and FCF (+18.5%) all grew double-digits | Triggered | Medium | High | [`01_historical-financials.md` §2, §6; `06_earnings-quality.md` §7] — driven by non-operating equity-stake mark-to-market swings and a one-off tax benefit, not operations | Well flagged upstream already; real trap for a reader who quotes headline GAAP EPS as the earnings trend |
| Q4 gross-margin figures (49.6–49.7%) are a Capital IQ classification artifact, not a real quarterly step-change | Triggered | Low | High | Verified and fully explained: Q4 is a plug (Annual − 9 months) that concentrates a COGS-classification gap into one column [`01_historical-financials.md` §3] | Already correctly caveated upstream; no unaddressed residual risk |

### 2.3 Revenue

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| UK Mobility business-model reclassification recurs every quarter until it laps Q1 FY2027, mechanically suppressing reported revenue growth | Triggered | Medium | High | −$1.1bn Q2 FY26 revenue impact, −$2.1bn six-month impact [`02_revenue-drivers.md` §4] | Already well quantified and disclosed; risk is a reader treating this as demand weakness (see §2.2/§2.10) |
| FQ3 2026 revenue consensus cut 1.04% in 3 trading days post-print; net revision breadth −11 (8 up / 19 down) | Triggered | Medium | High | [`04_guidance-consensus.md` §3, §5] | Revenue has missed consensus narrowly in the last 2 quarters; this is the single biggest near-term threat `05` itself identifies to its own "favors beat" call |
| Company-reported market-share gains are self-reported, not independently verified | Triggered | Low-Medium | Medium | CFO: "our category position... is actually higher today than it was a year ago"; no third-party market-share data in the pool [`02_revenue-drivers.md` §3] | Modest — the underlying volume metrics (Trips, Gross Bookings, MAPCs) are independently disclosed and don't depend on this claim |
| Take-rate/mix residual (−2.1pp) in the Q2 revenue decomposition is a derived plug, not an independently confirmed company figure | Triggered | Low | Medium | Explicitly self-flagged: "a derived plug, not an independently quoted company ratio" [`02_revenue-drivers.md` §6a] | Low — already labeled as inference by the source agent; does not change the overall reconciliation |
| Freight's cyclical inflection (+25% CC Q2 FY26) is based on a single quarter of confirmed data | Triggered | Low | Medium | "one quarter of data is not proof of a durable freight-cycle recovery" [`03_margin-drivers.md` §7, Cycle-Position note] | Low at the consolidated level (Freight is 11.2% of revenue); already well caveated |

### 2.4 Margins

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| G&A/legal-accrual line is genuinely unpredictable and could swing unfavorably again in Q3 | Triggered | Medium | Medium | Same line item moved margin +106bps favorable in FY2025, then −97bps unfavorable in Q2 FY26 [`03_margin-drivers.md` §8a] | Named directly by `05` §3 as a miss scenario; the single most volatile line in the whole cost stack |
| ~132bps (26%) of Q2 FY26's cost-of-revenue-ratio "improvement" is the UK reclassification, not genuine cost discipline | Triggered | Low | High | [`03_margin-drivers.md` §8a] — already separated from the genuine +377bps improvement | Low — fully reconciled and disclosed; risk only if a reader takes the unadjusted total at face value |
| Insurance-cost pass-through is explicitly asymmetric — near-100% downside exposure vs an inferred ~18% upside retention | Triggered | Medium | Medium | Management: "our philosophy has been to return that goodness back to the market" on cost decreases, but a cost increase historically flowed close to fully to the P&L [`07_earnings-sensitivity.md` §6] | A future insurance-cost spike would not be offset the way a decrease is "given back" — an asymmetric bear case |

### 2.5 Guidance / Consensus

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| The guided/consensus "EBITDA" figure for FY2026 quarters does not match the GAAP-basis EBITDA computed elsewhere in this same module, and no primary-source reconciliation is available to confirm its definition | Triggered | High | High | Q2 FY26: $2,085M (GAAP-basis, `01_historical-financials.md` §3) vs $2,819M ("actual EBITDA," cleared above the guided high end, `04_guidance-consensus.md` §6) — a $734M (35.2%) gap; Q1 FY26 shows the same pattern ($2,114M GAAP-basis vs $2,481M guided-comparison figure); Uber's 10-Q no longer discloses a consolidated Adjusted EBITDA reconciliation for FY2026 [`01`/`03`/`06`, cross-referenced above] | This is the primary evidentiary chain behind `05`'s "Setup favors beat" verdict (the "beat guided EBITDA range 4/4 quarters, above high end 2 straight" claim) — that specific claim rests on a figure that cannot be verified from a primary source in this pool. Triggers the MODULE_RULES "Conflicting sources not reconcilable → Overall usefulness max 65" cap. See §2.9 |
| Rising Street effective-tax-rate assumption compresses EPS Normalized even as EBITDA estimates are being raised | Triggered | Medium | Medium-High | FY2026 ETR assumption rose from 9.5% (12 months ago) to 20.77% (currently); EPS Normalized revision breadth (+2 to +3) is far weaker than EBITDA revision breadth (+6 to +14) over the same window [`04_guidance-consensus.md` §5] | A structural EPS-specific headwind that could produce an EPS miss even on an EBITDA beat |
| No formal revenue guidance issued by the company | Not Triggered (structural, not new) | Low | High | Uber has not guided revenue since FQ2 2020 [`04_guidance-consensus.md` §2] | Long-standing practice, not a new or worsening disclosure gap |

### 2.6 Beat / Miss Setup

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| "Above guided high end" streak that anchors the bull case is only a 2-quarter sample | Triggered | Medium | Medium | `05` itself: "a real but short (two-quarter) pattern" [`05_beat-miss-setup.md` §7] | Base-rate discipline concern (CLAUDE.md §9) — a 2-quarter streak is a thin foundation for the module's central verdict, compounded by the EBITDA-definition gap in §2.5 |
| Revenue miss risk (a 3rd straight quarter) is `05`'s own named single biggest threat to "favors beat," but its pre-mortem language attributes the risk partly to "underlying trip-volume deceleration" that `02`'s own decomposition does not support | Triggered | High | High | [`05_beat-miss-setup.md` §10; contradicted by `02_revenue-drivers.md` §6a — see §2.2/§2.9/§2.10] | Mischaracterizes the nature of the revenue risk: the real risk is the bounded, mechanical UK reclassification (lapses Q1 FY27) plus modest take-rate/mix compression, not an open-ended demand slowdown |

### 2.7 Earnings Quality / Accounting

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| GAAP net income inflated in BOTH FY2024 and FY2025 by large, one-off, non-cash deferred-tax valuation-allowance releases, with no non-recurring caveat on the headline highlights table | Triggered | High | High | $6.4bn combined FY24 federal/state release; $5.0bn Netherlands release in FY25; reported net income ran roughly double pretax income in both years [`business-model/12_red-flags-sweep.md` §2, RF-RFS-001, severity 60] — a more complete finding than `06_earnings-quality.md` §5/§7, which characterized the FY2025 item only as "smaller" without identifying it as its own discrete ~$5bn one-off | Any forward EPS/net-income model that anchors on the FY24→FY25 net-income trend ("up 2%") needs to strip this out first — the underlying pretax operating income actually grew 41% while a shrinking tax benefit masked the acceleration |
| $12.5bn self-insurance reserve (Critical Audit Matter, +27% YoY) is a material, disclosed driver of the touted CFO/FCF growth, beyond what `06`'s own caveat conveys | Triggered | Medium-High | High | MD&A: FY24/FY25 working-capital cash gains "primarily driven by an increase in our accrued insurance reserves ... liabilities recorded during the period exceeding claims paid out" [`business-model/12_red-flags-sweep.md` §2, severity 45; corroborated in `06_earnings-quality.md` §1, §2] | A real share of the FY24→FY25 CFO growth ($7.1bn→$10.1bn) and FCF growth ($6.9bn→$9.8bn) is reserve-build timing, not pure organic collection improvement — this tailwind reverses when claims catch up to accruals |
| Stock-based compensation ($1.8bn, 20.9% of Adjusted EBITDA) permanently excluded from headline non-GAAP profitability | Triggered | Medium | High | [`06_earnings-quality.md` §4, §8 — trap severity 55] | Already comprehensively flagged upstream; a real, recurring, dilutive cost not reflected in the "clean" Adjusted EBITDA number |
| "Legal, non-income tax and regulatory reserve" add-back recurs at material size (>$500M) in both years shown despite being framed as an adjustment | Triggered | Medium | High | $564M FY25, $1,123M FY24 [`06_earnings-quality.md` §4, §5] | Contradicts its own "non-recurring" framing by its own repetition |
| Large fair-value / mark-to-market gains on minority equity stakes swing GAAP net income by $1.4–1.6bn in single quarters | Triggered | Medium | High | [`01_historical-financials.md` §3; `06_earnings-quality.md` §8 — trap severity 60] | Already flagged; makes GAAP EPS unusable as a standalone quality signal (already correctly excluded from `05`'s beat/miss read) |

### 2.8 Sensitivity / External Variables

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| Driver classification / labor-regulation risk is an unquantifiable, binary tail risk excluded from the numeric sensitivity ranking | Triggered | High | Low (near-term) | "would incur significant additional expenses," no dollar figure; rated the primary driver of a 48/100 (inverted) External Dependency Risk Score [`07_earnings-sensitivity.md` §3, §6; `business-model/10_external-dependency.md` §5] | Would very plausibly dwarf every other quantified sensitivity if triggered in a large market — excluded from ranking only for lack of a disclosed dollar figure, not because it is smaller |
| Pending $14.8bn Delivery Hero acquisition, funded mainly via a new €14.2bn bridge facility, sits inside a ~12-deal serial-acquirer pattern already capped at business-model Filter 4 (severity 78) | Triggered | High | High | Net debt (strict) already rose from $5,197M (FY25) to $9,861M (Jun-30-2026), Net Debt/EBITDA from 0.82x to ~1.32x, BEFORE this deal closes [`01_historical-financials.md` §6; `business-model/99_business-model-synthesis.md` §1, §4] | Outside this module's scope to score, but the earnings module's cash-generation/"beat" narrative does not incorporate the leverage and integration risk building in parallel — a scope blind spot the synthesis layer should not silently inherit |
| AV $10bn multiyear investment — cost side explicitly "not yet sized"; current read leans on asymmetric (demand-only) disclosure | Triggered | Medium | Medium | CFO: "the closer we get to deployment and scale out, there will be a P&L impact, and we'll size that for investors clearly as we go" [`03_margin-drivers.md` §10] | The first quantified AV cost figure (plausibly in the Q4 FY26 guide) could flip the current bullish "demand signal" framing |
| Insurance cost pass-through and driver-incentive costs could both be hit simultaneously by a single fuel-price shock | Triggered | Medium | Medium | [`07_earnings-sensitivity.md` §5; `business-model/10_external-dependency.md` §1] | Two of the largest cost-line sensitivities are not fully independent — a correlated downside scenario is understated if modeled as two separate risks |
| Sole-source, no-fallback dependency on Google Maps, with redacted forward pricing, from the same corporate parent (Alphabet) that owns a direct AV competitor (Waymo) | Triggered | Low-Medium | Low (near-term) | 4th amendment to the Google Maps agreement (Apr-19-2026) has redacted "Year 4-5 Pricing" terms [`business-model/12_red-flags-sweep.md` §2, severity 40] | More a moat/strategic risk than a near-term earnings risk; the actual cost trajectory of this dependency is not knowable from the filing |

### 2.9 Source Conflicts

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| `01_historical-financials`'s GAAP-basis EBITDA vs `04_guidance-consensus`/`05_beat-miss-setup`'s guided/consensus "EBITDA" — same label, different (unreconciled) figures | Triggered | High | High | $2,085M vs $2,819M for Q2 FY26 (35.2% gap); same pattern in Q1 FY26 ($2,114M vs $2,481M) — see §1 Contradictions table and §2.5 | Triggers MODULE_RULES "Conflicting sources not reconcilable → Overall usefulness max 65" |
| `01`/`05`'s "revenue growth decelerating" framing vs `02`'s decomposition showing trip-volume/Gross-Bookings growth stable-to-accelerating once the UK reclassification is stripped out | Triggered | High | High | See §1 Contradictions table and §2.2/§2.10 | Master synthesizer should use `02`'s decomposed read, not the unadjusted headline, when characterizing demand trend |
| `06_earnings-quality`'s treatment of the FY2025 tax benefit as merely "smaller" vs `business-model/12_red-flags-sweep`'s identification of a discrete $5.0bn Netherlands one-off | Triggered | Medium-High | High | See §1 Contradictions table and §2.7 | The earnings module's own quality read understates how much of FY2025's net income is one-off relative to the business-model module's more granular finding |

### 2.10 Narrative / Framing

| Red Flag | Status | Severity | Probability | Evidence | Impact On Earnings Setup |
|---|---|---|---|---|---|
| "Setup favors beat" leans on a short (2-quarter) above-guidance-high-end streak measured on an unreconciled Street-EBITDA figure — two separate weaknesses compounding into one headline verdict | Triggered | High | High | Combines §2.5/§2.6/§2.9 findings [`05_beat-miss-setup.md` §7–8; `04_guidance-consensus.md` §6] | The synthesis agent should treat "favors beat" as directionally supported by the independently-verified GAAP EBIT-margin bridge (`03`/`07`), but should not lean on the specific "beat guided EBITDA range" claim without flagging the definitional gap |
| Revenue "deceleration" language is used interchangeably with "trip-volume deceleration" in `05`'s pre-mortem, when `02`'s own decomposition shows the opposite for the volume component specifically | Triggered | High | High | See §1 Contradictions table and §2.2 | Could lead the master synthesizer to overweight a demand-slowdown narrative that the evidence does not support |
| AV $10bn spend is read as a "demand signal" based on asymmetric disclosure (demand side quantified and observable; cost side explicitly not yet sized) | Triggered | Medium | Medium | `03_margin-drivers.md` §10 itself flags this explicitly: "the evidence favors the DEMAND reading... because the cost-side evidence is explicitly NOT yet quantified" | Already self-aware upstream; worth carrying forward as a live risk to the synthesis, not a settled conclusion |
| The earnings module's overall bullish tilt (margin expansion, cash generation, beat streak) does not incorporate the parallel capital-structure/M&A risk the business-model module already capped (Filter 4, serial acquirer) | Triggered | Medium | High | `99_business-model-synthesis.md` §1, §4 vs the earnings module's scope, which excludes valuation/capital allocation by design (`MODULE_RULES.md`, Scope) | A scope boundary, not a module error — but the synthesis layer must not let the earnings module's clean read imply the whole investment case is clean |

## 3. Red-Flag Summary Table

| # | Category | Red Flag | Status | Severity | Probability | One-Line Impact |
|---:|---|---|---|---|---|---|
| 1 | Source Conflicts / Guidance-Consensus | Guided/consensus "EBITDA" ≠ GAAP-basis EBITDA for FY2026 quarters; no primary-source reconciliation available ($2,085M vs $2,819M, Q2 FY26) | Triggered | High | High | Undermines the specific evidentiary chain behind `05`'s "favors beat" verdict; triggers a MODULE_RULES usefulness cap |
| 2 | Narrative/Framing / Historical Trend | "Revenue growth decelerating" narrative conflated with "trip-volume deceleration"; underlying volume is stable-to-accelerating once UK reclassification is stripped out | Triggered | High | High | Risk of mischaracterizing the demand trend in the master synthesis |
| 3 | Earnings Quality | GAAP net income inflated in BOTH FY2024 ($6.4bn) and FY2025 ($5.0bn) by one-off deferred-tax valuation-allowance releases | Triggered | High | High | Any forward EPS/net-income trend model must strip both years, not just FY2024 |
| 4 | Sensitivity/External | Pending $14.8bn Delivery Hero deal, funded via €14.2bn bridge facility, inside an already-capped serial-acquirer pattern; net debt/EBITDA already rose 0.82x→~1.32x before the deal closes | Triggered | High | High | Leverage/integration risk building in parallel to the "clean earnings" narrative, outside this module's scope to score |
| 5 | Sensitivity/External | Driver classification / labor-regulation risk is unquantifiable and excluded from the numeric sensitivity ranking | Triggered | High | Low (near-term) | Would dwarf every quantified sensitivity if triggered in a large market |
| 6 | Beat/Miss Setup | Revenue-miss pre-mortem attributes risk partly to "trip-volume deceleration" not supported by `02`'s decomposition | Triggered | High | High | Mischaracterizes the nature of the single biggest named risk to the "favors beat" call |
| 7 | Earnings Quality | $12.5bn self-insurance reserve (Critical Audit Matter, +27% YoY) is a material, underweighted driver of CFO/FCF growth | Triggered | Medium-High | High | Reserve-build timing, not pure organic cash-collection improvement; reverses when claims catch up |
| 8 | Source Conflicts | `06`'s "smaller" characterization of the FY2025 tax benefit understates a discrete, comparably-sized $5.0bn one-off found by the business-model module | Triggered | Medium-High | High | Earnings-quality read should treat FY2025, not just FY2024, as tax-benefit-distorted |
| 9 | Beat/Miss Setup | "Above guided high end" streak anchoring the bull case is only 2 quarters | Triggered | Medium | Medium | Thin base rate for the module's central verdict (CLAUDE.md §9) |
| 10 | Margins | G&A/legal-accrual line is genuinely unpredictable, could swing unfavorably again in Q3 | Triggered | Medium | Medium | Named directly as `05`'s own miss scenario |
| 11 | Revenue / Guidance-Consensus | FQ3 2026 revenue consensus cut 1.04% in 3 days post-print; net revision breadth −11 | Triggered | Medium | High | Single biggest near-term threat to the revenue side of the setup |
| 12 | Sensitivity/External | Insurance-cost pass-through is asymmetric (~100% downside exposure vs ~18% inferred upside retention) | Triggered | Medium | Medium | A future cost spike would not be offset the way a decrease is "given back" |
| 13 | Guidance/Consensus | Rising Street tax-rate assumption (9.5%→20.77% FY2026) compresses EPS Normalized even as EBITDA estimates rise | Triggered | Medium | Medium-High | Structural EPS-specific headwind independent of operating performance |
| 14 | Sensitivity/External | AV $10bn investment cost side explicitly not yet sized; current bullish read rests on asymmetric disclosure | Triggered | Medium | Medium | First quantified AV cost figure could flip the current "demand" framing |
| 15 | Earnings Quality | SBC ($1.8bn, 20.9% of Adjusted EBITDA) and a recurring "legal/regulatory" add-back excluded from headline non-GAAP profitability | Triggered | Medium | High | Real, recurring, dilutive costs not reflected in the "clean" Adjusted EBITDA figure |
| 16 | Historical Trend | GAAP diluted EPS fell 22.5% TTM even as EBITDA/EBIT/FCF grew double-digit | Triggered | Medium | High | Real trap for a reader quoting headline GAAP EPS as the earnings trend (already well-flagged upstream) |
| 17 | Sensitivity/External | Sole-source Google Maps dependency, redacted pricing, same parent as AV competitor Waymo | Triggered | Low-Medium | Low (near-term) | Cost trajectory of this dependency is not knowable from the filing; more moat-relevant than near-term-earnings-relevant |
| 18 | Margins | ~132bps (26%) of Q2 FY26's cost-of-revenue-ratio "improvement" is the UK reclassification, not genuine cost discipline | Triggered | Low | High | Fully reconciled and disclosed already; risk only if unadjusted total is taken at face value |
| 19 | Revenue | Company-reported market-share gains are self-reported, not independently verified | Triggered | Low-Medium | Medium | Underlying volume metrics don't depend on this claim |
| 20 | Revenue | Take-rate/mix residual (−2.1pp) in the Q2 decomposition is a derived plug, not independently confirmed | Triggered | Low | Medium | Already labeled as inference by the source agent |
| 21 | Revenue | Freight's cyclical inflection is based on a single quarter of confirmed data | Triggered | Low | Medium | Small consolidated impact (Freight is 11.2% of revenue); already well caveated |
| 22 | Historical Trend | Q4 gross-margin figures (49.6–49.7%) are a Capital IQ classification artifact | Triggered | Low | High | Already correctly explained upstream; no unaddressed residual risk |

## 4. Red-Flag Score

| Metric | Value |
|---|---|
| Total flags triggered | 22 |
| Critical flags | 0 |
| High flags | 6 |
| Medium flags | 10 |
| Low flags | 6 |
| Unclear flags | 0 |
| Unavailable checks (data missing) | 0 |

## 5. Red-Flag Severity Verdict

**Material concerns** — high-severity flags present; the earnings setup may be overstated in specific places and should not be taken purely at face value.

No flag rises to Critical (nothing here invalidates the earnings setup outright, and there is no fraud, going-concern, or hard disqualifier signal), but six High-severity flags cluster around the same weak point: the specific evidence chain behind `05`'s "Setup favors beat" verdict — a short, 2-quarter, above-guided-high-end EBITDA streak — is measured on a "EBITDA" figure that does not match the GAAP-basis EBITDA this same module computes elsewhere, and cannot be reconciled to a primary source for FY2026 within this data pool. The single most dangerous red flag is #1 (the EBITDA-definition gap): it would be resolved by pulling Uber's FQ1/FQ2 2026 earnings press releases (or shareholder letters) into the data pool and confirming whether the guided/consensus "EBITDA" figure is still Adjusted EBITDA on the same basis as FY2025's disclosed reconciliation.

## 6. What The Synthesis Agent Should Know

- 22 red flags triggered: 0 Critical, 6 High, 10 Medium, 6 Low, 0 Unclear, 0 Unavailable.
- The single most dangerous red flag: the guided/consensus "EBITDA" figure for FQ1/FQ2 2026 does not match this module's own GAAP-basis EBITDA calculation (a 35.2% gap in Q2 FY26 alone), and Uber's 10-Q no longer discloses a consolidated non-GAAP reconciliation to verify it — this is the primary evidence behind the "favors beat" verdict. Resolve by pulling the FQ1/FQ2 2026 earnings press releases into the data pool.
- This should cap the **Consensus setup** score component under MODULE_RULES's "Conflicting sources not reconcilable → Overall usefulness max 65" rule — the earnings-quality/beat-streak evidence chain built on the disputed EBITDA figure should not receive full weight.
- The "Earnings decelerating" framing implied by headline revenue growth (18% → 12%) should NOT be adopted as-is: `02_revenue-drivers`'s own decomposition shows trip volume and Gross Bookings growth is stable-to-accelerating once the UK Mobility reclassification (−8.7pp of Q2's growth) is stripped out. If the synthesis needs one label, "Earnings stable to inflecting-positive on an underlying basis, obscured by a mechanical accounting reclassification" is closer to the evidence than "decelerating."
- Two contradictions require explicit reconciliation in the synthesis: (1) `01`'s GAAP-basis EBITDA vs `04`/`05`'s guided-basis "EBITDA" (unreconcilable within this pool); (2) `06`'s treatment of the FY2025 tax benefit as a lesser residual vs `business-model/12_red-flags-sweep`'s identification of a discrete $5.0bn Netherlands one-off comparable in scale to FY2024's $6.4bn item.
- Missing data that prevented a full scan: none of the module's hard score caps were triggered (data-triage verdict was "Sufficient"), but the absence of any earnings press release in the pool is a real, uncapped gap that specifically prevents verification of the FY2026 EBITDA-guidance basis.
- Net: the setup is dirtier than the upstream module's own "favors beat" / "mostly clean" framing suggests in two specific places — the EBITDA-guidance evidentiary basis, and the extent to which FY2024–FY2025 GAAP earnings quality was propped up by one-off tax items (both years, not just one) — but cleaner than a naive reading of "revenue growth decelerating" would suggest, since the underlying trip-volume trend is not actually slowing once the accounting reclassification is removed.

## 7. Pre-Mortem — If The Earnings Setup Fails

If this earnings setup turns out to be wrong, the most likely reason is that the "favors beat" verdict was built on a "beat guided EBITDA range" streak measured against a Street/CIQ-sourced "EBITDA" figure whose exact definition could not be verified against any primary source in this data pool — because Uber discontinued its consolidated Adjusted EBITDA reconciliation in the 10-Q starting Q1 FY2026 and no earnings press release was in the pool to fill that gap. If that guided metric's basis has shifted in a way this module could not detect (a different set of add-backs, a different treatment of the UK reclassification, or simply a definitional drift the company has not re-anchored since dropping the reconciliation table), a future "beat" or "miss" against it would be measured against the wrong yardstick, and the true GAAP-operating-income trend — which this module's own sensitivity work (`07`) correctly treats as the cleaner basis — could tell a different story than the guidance-beat streak implies.
