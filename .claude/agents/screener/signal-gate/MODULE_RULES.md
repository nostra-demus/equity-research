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

The materiality score is a transparent, named 100-point breakdown, computed by
`scripts/screener_score_breakdown.py` — **not** by LLM arithmetic in prose. The agent supplies one
JSON object of judgments (relevance/event-types/issuer-linkage inherited from Steps 1–3; pair_label
and confirmation_upgrade inherited from Steps 4–8; plus fresh judgments — source tier inputs,
paywall/corroboration, routine-filing severity, media genericness, private/unlisted status and
linkage, specificity/estimate-impact sub-signals, theme/macro signals, portfolio-position) and the
script returns the full `score_breakdown` + `final_score` + `materiality_math` + `source_tier` +
`source_quality_score` + `source_quality_reason`. **The script is the canonical source of truth for
the arithmetic; this file is the canonical source of truth for the point tables it implements — a
change to any weight or penalty cap must edit both in the same PR, or they will silently diverge.**

### Components (sum to exactly 100 pre-penalty)

| # | Component | Max |
|---|---|---|
| 1 | `source_quality` | 20 |
| 2 | `event_materiality` | 20 |
| 3 | `company_relevance` | 20 |
| 4 | `specificity` | 15 |
| 5 | `estimate_impact` | 15 |
| 6 | `theme_macro` | 10 |

**1. `source_quality`** — see "Source-quality tiers" below; this component *is* `source_quality_score`.

**2. `event_materiality`** — base by `relevance_label` (irrelevant 0 / relevant_non_material 4 /
material 14) + a severity add-on summing each tagged `event_type`'s weight (guidance_change/mna/
debt_credit/litigation_enforcement 6, regulatory/earnings_revenue_margin/capital_actions 5,
management/cybersecurity 4, product/commercial/operations/macro_sector 3, rumor 1), **capped at +6**.
Never looks at whether a filing is routine — that is penalty 7a, kept independent so a maxed
source/official filing and a low-materiality event can coexist truthfully.

**3. `company_relevance`** — selected by `issuer_public_status` (`public` / `private_unlisted`) of the
**primary issuer**. Public: `issuer_linkage` base (primary_issuer 16 / secondary_issuer 10 /
sector_only 5 / macro_only 2) + 4 if an open/locked thesis already exists on this issuer
(`portfolio_position`). Private/unlisted: scored on the **single best** evidenced
`private_linkage_tags` entry (never summed) — acquisition_target_of_public_acquirer 16,
supplier_or_customer_of_public_company 14, commodity_sector_bottleneck / ai_datacenter_supply_chain
13, competitor_informative_to_public_company 11, plausible_future_private_secondary_opportunity 6 —
plus the same +4 portfolio bonus if the linked public company has an open thesis. No tag → 0 here
(see the private/unlisted escape hatch below for why this does not mean "irrelevant").

**4. `specificity`** — hard_number_cited +5, corroborating_second_number +4,
named_counterparty_or_instrument +3, effective_date_stated +3 (cap 15 by construction).

**5. `estimate_impact`** — moves_consensus_estimate +6, traceable_to_valuation_driver +5,
material_relative_to_size +4 (cap 15).

Both 4 and 5 are **hard-capped at 6** whenever the claim is uncorroborated AND (paywalled OR the
source is Tier 3/4) — see the paywall rule below.

**6. `theme_macro`** — sector_wide_move +5, live_theme_match (matches a live screener theme/board tag)
+4, commodity_rate_transmission +1 (cap 10). A purely idiosyncratic single-name event scoring 0 here
is correct, not a defect.

### Penalties (subtract from the 100-pt subtotal; independently capped; never double-counted)

| Penalty | Cap | Rule |
|---|---|---|
| `routine_filing_penalty` | −20 | 0 / mild −8 / moderate −15 / total −20, by `routine_severity`, only if `is_routine_filing`. **Never** mark an enforcement action, default, or breach as routine. |
| `generic_media_penalty` | −15 | 0 / roundup −6 / republished −12 / content_farm −15, by `media_genericness`. |
| `private_unlisted_irrelevance_penalty` | −15 | See the escape hatch below. |
| `duplicate_stale_penalty` | −25 | duplicate −25 / same_event_no_new_info −12 / same_event_new_info −3 / related_topic / new_event 0, by `pair_label` — forced to 0 if `confirmation_upgrade`. |
| `low_confidence_extraction_penalty` | −10 | Ordered, first match wins: confidence < 0.50 → −10; Tier 4 + uncorroborated + sensational → −10; confidence < 0.80 → −5; Tier 3/4 + uncorroborated → −5; else 0. |

`final_score = max(0, min(100, subtotal − penalties))`.

### Source-quality tiers

Gate 0's `A`/`B` grade is the firewall (pass/fail) and stays untouched. Tier 1–4 is a refinement that
only runs on sources that already cleared Gate 0 — it subdivides what Grade B today flattens into one
bucket (everything from respected secondary press to content farms):

- **Tier 1** — official company announcement, exchange filing, regulator filing, Reuters, Bloomberg,
  FT, WSJ, company investor relations, government/statistical agencies.
- **Tier 2** — respected business press, Simply Wall St, MarketWatch, CNBC, sector-specific credible
  publications, reputable local business publications.
- **Tier 3** — generic news aggregators, low-context blogs, republished PR, content farms.
- **Tier 4** — unknown/random/low-quality source (the deliberate fallback for anything unrecognized).

`source_quality` value: Tier 1 → 20 (15 if paywalled and uncorroborated); Tier 2 → 13 (9); Tier 3 → 6
(3); Tier 4 → 2 (0). **Source quality alone cannot reach even the PARK/LOG boundary (40), let alone
PROMOTE (70)** — its 20-point cap is 20% of the budget, by construction. A high-quality source on a
low-materiality event still scores low/moderate overall (`event_materiality`/`company_relevance` are
scored independently of `source_quality`).

**Paywall / corroboration rule:** a Tier-1 wire headline (Reuters/Bloomberg-class) with a paywalled,
unconfirmed body still scores `source_quality=15`, not 0 — the headline and the brand's track record
are real evidence. But `specificity` and `estimate_impact` are hard-capped at 6 each until a **second**
on-list source corroborates the body-level facts; the same cap applies to any uncorroborated Tier-3/4
claim even without a paywall. Once corroborated, the caps lift entirely.

### Private/unlisted escape hatch

**Do not auto-zero or auto-penalize a private/unlisted company.** The full −15
`private_unlisted_irrelevance_penalty` applies **only** when `private_linkage_tags` is empty — no
evidenced link to any public company. If the agent can evidence ANY of: supplier/customer of a public
company, acquisition target of a public acquirer, competitor informative to a public company, a
commodity/sector bottleneck, AI/data-center supply-chain relevance, or a plausible future
private-secondary-market opportunity — the penalty drops to 0 (or −4 if the *only* evidenced tag is
the speculative "future secondary opportunity" one), and `company_relevance` instead scores the event
on the strength of that linkage. A private company that's merely a secondary issuer/counterparty to a
public **primary** issuer never engages this machinery at all — the event is scored normally via the
public primary issuer.

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
- **Materiality breakdown table**: one row per component/penalty (value, max, one-line reason) — copied verbatim from `scripts/screener_score_breakdown.py`'s output, never hand-edited. Follow it with the `materiality_math` one-liner and a `final_score_reason` of 1-2 plain-English sentences citing the single largest positive driver and the single largest penalty (if any) — do not pad with extra paragraphs.
