# Edge Definition Synthesis — SIG-20260615-71775d0a

## Abstract

The variant here is that the market is valuing Honeywell Aerospace (HONA) at the peer-median multiple for pure-play aerospace suppliers (~29x EV/EBITDA, implying ~$207/share) without adjusting for the fact that HONA grows organic revenue at only 3% — putting it in the same pricing bucket as HEICO and TransDigm, which grow at 8–13% and earn their premium multiples because of it. A growth-adjusted multiple of 18–20x implies ~$144–160/share, roughly 27% below consensus. Four independent searches confirmed no published research has built this growth-filtered comp set. The mispricing is best explained by analytical complexity — the required work cuts across comp selection, growth analytics, and cash-flow modelling — reinforced by structural forced-seller mechanics and the timing constraint that HONA has no standalone trading history yet. The primary convergence trigger is HONA's first standalone quarterly earnings release, legally required by August 9, 2026, which is a hard date well inside the thesis horizon. The edge scores 71 (provisional band). The weakest link is that the organic growth mechanism remains pre-confirmation: HONA's Q1 2026 data came from a combined company filing, and no standalone report exists yet. Next step is candidate surfacing.

---

## 1. Sub-Scores (§12-calibrated)

### variant_perception_quality — 72/100

The variant has a specific numeric departure: consensus values HONA at ~$207/share (29x EV/EBITDA on ~$4.75B EBITDA), while the growth-adjusted view yields ~$144–160/share (18–20x), a gap of $47–63 or roughly 27%. The mechanism is concrete — HONA delivered 3% organic revenue growth in Q1 2026 [Honeywell Q1 FY2026 8-K, SEC EDGAR, April 24, 2026], while the high-multiple comparables that anchor the 29x peer-median (HEICO, TransDigm) deliver 13%+ and 8%+ organic growth respectively, and a second mechanism (FCF conversion deficit — Q1 2026 FCF of $56M versus $191M in Q1 2025, with negative operating cash flow from continuing operations of -$650M [same 8-K]) is documented. The coverage gap is evidenced: four searches run June 15, 2026 found no published research that disaggregates the aerospace peer set by organic growth quartile and applies an HONA-specific sub-group multiple. Barclays and Wells Fargo have each noted directional concern without publishing the specific model. The score stops at 72 rather than reaching the 80s because the variant is pre-confirmation: the mechanism rests on one quarter of combined-company data (not yet standalone HONA-reported figures), and the share of Hold ratings among covering analysts (41%) shows the concern is partially public, which limits the novelty ceiling.

### mispricing_reason_strength — 74/100

The primary category is complexity, which is the right fit: the multi-step cross-domain work (comp selection → growth quartile segmentation → FCF modelling with $225M/year trademark licence fee and stranded overhead costs) is documented and the absence of any published piece doing this work is verified by four independent searches. All three required verifiable facts are grounded in primary or independently checkable sources: (1) HONA's 3% Q1 2026 organic growth is in the Honeywell Q1 FY2026 8-K filed with the SEC on April 24, 2026; (2) TransDigm and HEICO organic growth rates and trading multiples are checkable from their 10-K filings and any financial data aggregator; (3) the absence of published growth-adjusted comps is replicable by running the same four search strings. Two secondary categories reinforce the primary: structural (forced sellers — yield-focused generalists, ESG-screened defense funds — face a passive-heavy holder base that will not absorb supply discretionarily) and timing (HONA has no standalone trading history and no standalone estimate consensus before June 29). The score stays at 74 rather than higher because the structural secondary category relies partly on web-unverified ownership data (wallstreetzen.com), and the complexity argument depends on the proposition that the work "hasn't been done" — a falsifiable but not filed-source claim.

### convergence_trigger_clarity — 68/100

The primary trigger — HONA's first standalone quarterly earnings release — has a hard outer deadline of August 9, 2026 (the SEC 40-day filing rule for large accelerated filers after a June 30 quarter-end), confirmed by the Module 5 horizon expiry of September 7, 2026. The trigger is inside the window. The four-step causal mechanism names specific actors at each step: the earnings data makes organic growth and FCF conversion observable as separated figures (step 1); Barclays and Wells Fargo (named) must reconcile their models against the first standalone figure and may publish revised targets applying a growth-adjusted multiple (step 2); event-driven funds and forced sellers (named populations) reallocate (step 3); price converges toward the $144–160 range (step 4). Pre-trigger partial convergence checkpoints exist: the June 29 day-one price (scheduled) and a possible analyst initiation note (unscheduled, P=0.45). The score is 68 rather than higher for two reasons: the exact earnings date within the late-July to August 9 window is not yet announced, which is acceptable but not fully pinned; and step 2 of the mechanism depends on two specific banks choosing to publish the growth-adjusted framework — a necessary but not certain step that the P=0.45 secondary trigger probability partially acknowledges.

---

## 2. The Blend (visible math)

blended_calculation: 0.40 × 72 + 0.30 × 74 + 0.30 × 68 = **28.8 + 22.2 + 20.4 = 71.4 → final_score 71**

- justification_sentence_1: The variant has a 27% numeric departure with two evidenced mechanisms and a confirmed coverage gap, but it rests on pre-confirmation combined-company data, which keeps the VPQ below the 80s and holds the blend in the provisional range.
- justification_sentence_2: The convergence trigger has a legally mandated hard deadline and a four-step mechanism with named actors, but the exact earnings date is not yet pinned and the key model-revision step depends on specific sell-side banks acting — sufficient for provisional, not the standard for full_machine.

---

## 3. Routing

- **routing_outcome:** provisional
- **routing_logic:** final_score 71 falls in the 60–80 band → provisional
- **routing_reason:** The variant perception and mispricing reason are both well-evidenced and grounded in filed primary sources, but HONA has no standalone trading or reporting history yet — the full mechanism cannot be confirmed until the first standalone quarterly earnings release (August 9, 2026 outer bound). The edge is real enough to surface candidates at moderate resource deployment; it is not strong enough to warrant the full machine before standalone data appears.

---

## 4. Record State

- locked: true · version: 1 · phase1_completed_at: 2026-06-15T19:00:00Z · falsifiers locked at: 2026-06-15T19:00:00Z
- next_module: candidate-surfacing

---

## Machine Output

Wrote: `screener/runs/SIG-20260615-71775d0a/thesis_record.json` (complete, LOCKED, validates against frameworks/screener/thesis_record.schema.json)
Filed: `screener/ledger/theses/THS-SIG-20260615-71775d0a-v1.json`; events ledger status line appended; board index refreshed.

---

## Routing

Routing: provisional
Edge score: 71
Next module: candidate-surfacing
