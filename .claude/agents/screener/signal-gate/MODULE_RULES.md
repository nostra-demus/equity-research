# MODULE_RULES — signal-gate (Screener swarm, Phase 0.1)

These rules bind every agent in `.claude/agents/screener/signal-gate/`. The root `CLAUDE.md` and the swarm doctrine `.claude/agents/screener/SWARM.md` apply in full; if anything here conflicts, the stricter rule wins.

## What this module is

The ten-step Phase 0.1 gauntlet. It answers ONE question about one signal:

> "Is this a new, high-impact event that should change an investment decision immediately?"

It prioritizes novelty, confirmation, and direct financial impact. It penalizes repetition, incremental updates, and low-information content. It is deterministic: the thresholds, matrices, and penalty tables below are not suggestions — do not override them, do not simplify them, do not skip steps.

## Gate 0 (intake agent)

- The source must be on the swarm manifest's `sources.signal_gate.allowed` list. Grade A = primary newswire / official filing / official agency; Grade B = secondary aggregator citing a Grade A source. Off-list → `Routing: watchlist_no_source`, stop.
- `human_prompt` passes Gate 0 with the verbatim note; the underlying fact must still be verifiable against an on-list source (record what was checked).
- Dedup pre-check: compute `event_id = EVT-<first 12 hex of sha256(normalized_headline + "|" + source_url)>`. If the same `event_id` exists in `screener/ledger/events.ndjson`, this is a resubmission → `Routing: suppress`, stop.

## Strict materiality criteria (Step 1)

An event is `material` ONLY if it can: change revenue, margins, cash flow, or capital structure; alter regulatory, legal, or operational risk; affect management credibility; impact supply/demand dynamics; or shift analyst expectations. Otherwise it is `relevant_non_material` or `irrelevant`.

## Similarity bands (Step 4 — agent-native rubric)

The reference framework uses embedding cosine similarity. This module maps the SAME bands onto a textual-overlap rubric judged against prior ledger events (same issuer(s), last 48–72h; widen to 7 days for slow stories):

| Band | Cosine reference | Rubric meaning |
|---|---|---|
| ≥ 0.965 | duplicate | Same facts, same numbers, same event, near-identical wording |
| 0.93–0.965 | near duplicate | Same event, same facts, rephrased |
| 0.86–0.93 | same event cluster | Same underlying event, partially different details |
| 0.78–0.86 | related | Same storyline/theme, different event |
| < 0.78 | new | No meaningful overlap |

Duplicate logic requires issuer overlap; without issuer overlap require ≥ 0.985-equivalent (verbatim) plus identical headline.

## Fact delta (Step 5)

Extraction fields: `guidance`, `deal_value`, `fine_amount`, `eps`, `revenue`, `counterparty`, `court`, `regulator`. Scoring: **+0.15 per changed field; +0.35 for a confirmation upgrade; +0.10 for a better source; cap 1.0.** Show the arithmetic.

## Confirmation upgrade (Step 6)

True when: the prior record was non-official and the current is official, AND issuer overlap holds, AND (event-type overlap OR similarity ≥ 0.90 band). A confirmation upgrade overrides duplicate penalties.

## Pairwise classification (Step 7 — deterministic, evaluate in this exact order)

```
IF confirmation_upgrade AND fact_delta >= 0.30:        same_event_new_info
ELSE IF similarity >= 0.965:
    IF fact_delta < 0.10:                              duplicate
    ELSE:                                              same_event_new_info
ELSE IF similarity >= 0.93:
    IF event-type overlap:
        IF fact_delta < 0.15:                          same_event_no_new_info
        ELSE:                                          same_event_new_info
    ELSE:
        IF fact_delta < 0.10:                          related_topic
        ELSE:                                          same_event_new_info
ELSE IF similarity >= 0.86:
    IF event-type overlap OR fact_delta >= 0.20:
        IF fact_delta < 0.20:                          same_event_no_new_info
        ELSE:                                          same_event_new_info
    ELSE:                                              related_topic
ELSE IF similarity >= 0.78:                            related_topic
ELSE:                                                  new_event
```

## Novelty (Step 8)

Base by pair label: duplicate 0.02 / same_event_no_new_info 0.10 / same_event_new_info 0.30 / related_topic 0.55 / new_event 0.85. Then **+0.50 × fact_delta + 0.20 if confirmation upgrade. Clamp [0, 1].** Show the arithmetic.

## Canonical handling (Step 9)

Priority for canonical record: official > source tier > fact richness > earlier timestamp. Actions: `replace_canonical`, `suppress`, `keep_linked_low_rank`, `keep_linked`, `keep_separate`.

## Materiality (Step 10)

Inputs: relevance, event severity, computed novelty, source confidence, issuer directness, scope. Penalties: **duplicate −50; same_event_no_new_info −25; same_event_new_info −5.** Overrides: a confirmation upgrade removes the penalties; official filings / enforcement actions / defaults get a positive adjustment. Output: integer 0–100, with the arithmetic visible.

## Promotion bands (the module's Routing)

- `PROMOTE` — materiality ≥ 70 → Phase 1 runs.
- `PARK` — materiality 40–69 → ledger + board only. (`intake.json.override_promote: true` upgrades a PARK to PROMOTE; record the override.)
- `LOG` — materiality < 40, or action `suppress`.
- `watchlist_no_source` / `suppress` — terminal at the intake gate.

## Output and evidence discipline

- Every synthesis report ends with `## Machine Output` (naming the JSON written) and `## Routing` (greppable `Routing: <value>`, `Materiality: <NN>`, `Next module: <module-or-none>` lines).
- `signal_payload.json` must validate against `frameworks/screener/signal_payload.schema.json`.
- §5 citations everywhere; every source row carries `retrieved_at`.
- Banned without a quantified basis (machine check: grep your own draft before saving): "could benefit", "may be impacted", bare "significant", bare "material" outside the relevance label, "market hasn't realized".
