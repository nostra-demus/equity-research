# MODULE_RULES — signal-gate (Screener swarm, Phase 0.1)

These rules bind every agent in `.claude/agents/screener/signal-gate/`. The root `CLAUDE.md` and the swarm doctrine `.claude/agents/screener/SWARM.md` apply in full; if anything here conflicts, the stricter rule wins.

## What this module is

The ten-step Phase 0.1 gauntlet, plus a parallel generic-media check that runs alongside Steps 4-8. It answers ONE question about one signal:

> "Is this a new, high-impact event that should change an investment decision immediately?"

It prioritizes novelty, confirmation, and direct financial impact. It penalizes repetition, incremental updates, low-information content, routine procedural filings dressed up in event-sounding language (see "Filing-Type Classification & Derating" below), and generic market-wide commentary with no company-specific, quantified insight. It is deterministic: the thresholds, matrices, and penalty tables below are not suggestions — do not override them, do not simplify them, do not skip steps.

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

## Generic media detection (parallel check, alongside Steps 4-8)

`screener-generic-media-detector` runs in parallel with `screener-novelty` (both consume only Gate 0 + relevance). It answers: "Is this generic market commentary, or does it carry a specific, investable fact?"

Detect (multilabel, one line of evidence per tagged category):

| Category | Meaning |
|---|---|
| `market_cap_roundup` | Aggregate market-cap change across 3+ companies or an index, no single causal driver. |
| `index_movement_summary` | The subject is an index level/points/% move (Nifty, Sensex, S&P 500, Dow, etc.), not a company event. |
| `top_gainers_losers` | A ranked gainers/losers list with no causal explanation per name. |
| `generic_market_close` | "Markets closed higher/lower" daily-wrap framing, no specific causal event. |
| `many_companies_no_thesis` | 4+ companies named in one undifferentiated list, no firm-specific causal claim. |
| `lacks_specificity_quantifiability` | Generic descriptive language, no checkable number/date/cause, regardless of company count. |

An article with ONE clear, attributable, quantified driver does NOT match `many_companies_no_thesis` or `lacks_specificity_quantifiability` merely because it spans a sector or several names — those two categories require the ABSENCE of an attributable, quantified driver, not a high company count by itself.

Score (0-100 each, evidence-cited):

- **specificity_score** — 0 = applies to the whole market/an index/10+ names with no distinguishable thesis; 100 = one company, one distinct, attributable event.
- **quantifiability_score** — 0 = adjectives only ("markets rallied"); 100 = a precise, checkable figure tied to a clear causal driver. An aggregate tally across many names scores LOW here even with a real number — the figure must attach to ONE attributable cause, not a sum.
- **investability_score** — 0 = a PM could not change a single position on this fact alone; 100 = the fact alone would change a PM's view of a specific name or thesis (a guidance cut, an import ban, a contract win, a regulatory action).

Decide:

- **is_generic_media** — true if ANY category above is tagged (a format/content judgment, independent of investability). False only when none of the 6 categories match. A loose stylistic "roundup" tone with no real loss of company-specific, quantified content is NOT sufficient on its own to set this true — that is a source-style observation, not a content derating trigger; reserve true for when the underlying event content itself is generic.
- **generic_media_reason** — one plain sentence naming the matched categories (or "none matched") and the evidence.

## Canonical handling (Step 9)

Priority for canonical record: official > source tier > fact richness > earlier timestamp. Actions: `replace_canonical`, `suppress`, `keep_linked_low_rank`, `keep_linked`, `keep_separate`.

## Materiality (Step 10)

Inputs: relevance, event severity, computed novelty, source confidence, issuer directness, scope. Penalties: **duplicate −50; same_event_no_new_info −25; same_event_new_info −5.** Overrides: a confirmation upgrade removes the penalties; official filings / enforcement actions / defaults get a positive adjustment. Output: integer 0–100, with the arithmetic visible.

**Generic-media cap.** After computing the score above, apply a ceiling from the generic-media check:

- `is_generic_media = false` → no ceiling. Proceed exactly as above; the genericness scores are carried in `signal_payload.json` for transparency only and are never silently subtracted elsewhere.
- `is_generic_media = true` →
  ```
  avg_sq = (specificity_score + quantifiability_score) / 2
  IF investability_score < 30:
      ceiling = clamp(30 + round(avg_sq / 10), 30, 40)                              # no specific impact
  ELSE:
      ceiling = clamp(50 + round((investability_score - 30) / 70 * 10), 50, 60)      # specific anomaly present
  materiality_score = min(<score from the formula above>, ceiling)
  ```
  Show the ceiling and the `min()` explicitly in the materiality arithmetic line, e.g. `... = 72/100, generic media (market_cap_roundup, investability 12) → ceiling 33 → capped to 33/100`.

The generic-media ceiling is applied ONCE, as a cap via `min()` — never stacked as an additional subtraction on top of the penalty table above. It is the in-Step-10 cap; the routine-filing ceiling below (Step 10b) is a separate, later cap on the finished number, and the two compose as nested `min()` caps (each only ever lowers the score, never raises it).

## Filing-Type Classification & Derating (Step 2b / Step 10b)

This is an EXTENSION of Steps 2 and 10, not an 11th step — the gauntlet stays the ten-step Phase 0.1 gauntlet. It exists because a routine listed-company filing (a board-meeting notice, a trading-window closure, a generic compliance disclosure, a results-date intimation) can otherwise pick up a real `event_type` tag and a large first-seen novelty bonus and land near 80 with no real valuation-moving content. Both the classification and the derate are deterministic code (`scripts/screener_filing_classifier.py`), never agent judgment — CLAUDE.md §12: every move explainable from a matched pattern, not vibes.

**Filing-type labels** (Step 2b, run by `screener-relevance` immediately after Step 2):

| filing_type | Meaning |
|---|---|
| `routine_board_meeting` | Notice that a board meeting will be held / was held to consider a routine agenda item (results, dividend, etc.) — the notice itself, not the outcome. |
| `trading_window_closure` | Trading-window-closure / blackout-period notice for designated persons. |
| `financial_results_notice` | Results-date intimation ("date of financial results") with no results content. |
| `procedural_exchange_filing` | Generic compliance/regulatory-disclosure filing (shareholding pattern, compliance certificate, newspaper publication, record-date intimation, etc.) with no event content. |
| `material_exchange_filing` | An override keyword (table below) fired — treat as a real event regardless of routine-sounding wrapper text. |
| `unknown_filing` | Neither a routine pattern nor an override keyword matched. Abstain — no ceiling applied (a filing type the classifier does not recognize must never be silently suppressed). |

**Override categories** (any one match anywhere in headline+body lifts a routine filing to `material_exchange_filing`, no ceiling): resignation of key management, fraud / regulatory investigation, M&A (acquisition/disposal/merger/demerger), guidance change, profit warning / expected loss, capital raise (QIP/rights/preferential/FPO), debt default / rating downgrade, litigation, auditor issue (qualified opinion/going concern/auditor resignation), material order win/loss, buyback/dividend/split WITH a stated financial term (amount, per-share price, or ratio — a bare mention with no number stays routine).

**Derate ceilings** (Step 10b — applied to the FINISHED Step 10 score, after penalties and overrides; the Step 10 arithmetic itself is never altered):

| filing_type | Ceiling |
|---|---|
| `trading_window_closure` | 30 |
| `procedural_exchange_filing` | 30 |
| `routine_board_meeting` | 50 |
| `financial_results_notice` | 50 |
| `material_exchange_filing` | none (pass through) |
| `unknown_filing` | none (pass through) |

A ceiling caps the score DOWN only — it never raises a score that already computed lower. `signal_payload.json` carries `filing_type` and `filing_type_rationale` (both optional fields, not required, so pre-existing payloads stay valid) so the derate is auditable from the JSON alone, not just the prose report.

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

## Writing Standard

SWARM.md §8 plain-English rules apply to every prose section in this module's output files. Machine-facing fields (routing-value lines, JSON field names, section-header codes like `Gate 0`, `## Machine Output`) stay technical.

- **Abstract**: 2–4 sentences. What the event is, how new it is, the score, and where it goes — in plain English. No internal code names ("gauntlet", "Phase 0.1", "pairwise classification").
- **Decision paragraph** (Step 10): 2–3 sentences. The routing decision and the one most important reason for it.
- **Table cells** in the Gauntlet Summary: one plain phrase per cell — no multi-clause explanations inside a table cell.
- **Materiality arithmetic line**: state the math in one line (`Base 70 (major filing, direct issuer) + novelty 10 − no penalties = 80/100`) — do not add surrounding paragraphs explaining the arithmetic.
