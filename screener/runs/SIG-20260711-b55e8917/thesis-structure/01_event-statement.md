# M0.1 Event Statement — SIG-20260711-b55e8917

## 1. Event Statement (sterile)

> In July 2026, Carvana completed the acquisition of seven Stellantis dealerships for $171 million and began operating them as new-car retail locations. The Casa Grande, Arizona dealership recorded sales of over 700 new vehicles in May 2026, compared to a prior monthly average of 30 to 50 units under the previous operator. Carvana's online-only model — with no in-person haggling and no commission-based salespeople — was applied to the acquired sites, which retained operational service bays. The total U.S. new-car retail market spans 16,990 dealerships and approximately $1.3 trillion in annual sales.

- **sentence_count:** 4
- **character_count:** 598 (≥ 50)

## 2. Sources

| Role | Source | URL | Grade | Rationale |
|---|---|---|---|---|
| Primary | The Motley Fool, July 11 2026 | https://www.fool.com/investing/2026/07/11/prediction-carvanas-new-car-business-will-work/?source=iedfolrf0000001 | B | The Motley Fool is on the approved source list (SWARM.md signal_gate.allowed) but is a secondary retail-investment publication, not a primary newswire or official filing; Gate 0 assigned Grade B. |

## 3. Causal-Language Gate

- **Phrases checked/repaired:**
  - "completed the acquisition" — transactional descriptor, not causal; retained
  - "recorded sales of" — factual observation; retained
  - "compared to a prior monthly average" — comparative reference, not causal; retained
  - "was applied to" — descriptive; retained
  - "retained operational service bays" — factual; retained
  - No instances of: because, due to, driven by, as a result, leading to, signals, suggests, implies, panic, crisis, soaring, plunging, aggressively, inevitably, or synonyms doing causal work
- **causal_language_check:** PASS

## 4. Source Confirmation

- **primary_read_quality:** full
- **paywall_detected:** false
- **What was checked on the primary:** WebFetch of https://www.fool.com/investing/2026/07/11/prediction-carvanas-new-car-business-will-work/?source=iedfolrf0000001 retrieved at 2026-07-12T00:00:00Z. Full article body was accessible with no paywall or sign-in barrier. All key figures were confirmed: $171 million acquisition price, seven Stellantis dealerships, Casa Grande 700+ new vehicles in May vs prior 30–50 average, AutoNation Q1 2026 gross-profit split (22% new/used, 78% parts/service/F&I), 16,990 U.S. dealerships, $1.3 trillion market.

**Alternate Sources Checked** (only populated when `primary_read_quality != full`):

N/A — primary source read in full; fallback search was not required.

| Tier | Source | URL | Confirms | Retrieved At |
|---|---|---|---|---|
| — | — | — | — | — |

- **Coverage-gap summary:** The primary article was fully accessible and provided all facts in the event statement. No fallback search was initiated because the primary source body was complete and readable. No alternate source was needed to verify the stated figures.
- **scripts/screener_confirmation_score.py output (copied verbatim):** `confirmation_status=confirmed extraction_confidence=70 gate_pass=True`
- **confirmation_status:** confirmed
- **extraction_confidence:** 70
- **60_second_source_check:** True — PASS

<details><summary>Fallback Search Log (machine-facing — developer debugging only, never summarized as user-facing prose elsewhere)</summary>

| # | Tool | Query / Target | Result | At |
|---|---|---|---|---|
| 1 | WebFetch | https://www.fool.com/investing/2026/07/11/prediction-carvanas-new-car-business-will-work/?source=iedfolrf0000001 | corroboration_found — full article body returned, all figures confirmed | 2026-07-12T00:00:00Z |

</details>

## 5. Verdict

Verdict: M0.1 complete
