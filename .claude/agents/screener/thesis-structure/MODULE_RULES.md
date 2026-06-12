# MODULE_RULES — thesis-structure (Screener swarm, Phase 1: M0.1–M0.5)

These rules bind every agent in `.claude/agents/screener/thesis-structure/`. The root `CLAUDE.md` and `.claude/agents/screener/SWARM.md` apply in full; the stricter rule wins.

## What this module is

The first half of the Phase 1 assembly line. It turns a PROMOTED signal into the objective core of a thesis record: a sterile event statement (M0.1), quantified world changes (M0.2), a no-tickers beneficiary map (M0.3), a clock (M0.4), and a kill switch (M0.5). It is a hostile environment for weak ideas: raw input is systematically stripped of human bias, quantified, defended, and gated.

## The gates (all binding)

- **M0.1 — causal-language gate.** The event statement contains who did what, when, where, and the immediate observable consequence — and ZERO causal or interpretive language. Banned inside the statement: because, due to, driven by, as a result, leading to, signals, suggests, implies, panic, crisis, soaring, plunging, aggressively, inevitably — and any synonym doing causal work. 2–4 sentences, minimum 50 characters. The check is performed and quoted (`causal_language_review` names the exact phrases checked).
- **M0.1 — 60-second source check.** The statement's facts are verified against an on-list source within the agent's first action (record what was checked and when). A `human_prompt` signal whose facts cannot be matched to an on-list source FAILS here → `watchlist_no_source`.
- **M0.2 — reality lock.** Each world change states `quantitative_magnitude` (a number) against `baseline_reference` (the pre-event number) with `date_confirmed`. `already_occurred` is locked true; `hypothetical_flag` locked false. A change that has not already happened does not belong in the array — it goes to `watchlist_deferred_items`. Minimum 2 items, maximum 6. Fewer than 2 quantified, already-occurred changes → `gate_result: watchlist_no_world_change`.
- **M0.3 — the 100-point impact matrix.** Each party (direct beneficiary / indirect beneficiary / harmed party) is an INDUSTRY or business model with a GICS classification — never a company, never a ticker. Sub-scores, each 0–25: mechanism_directness (1-step = 25, 2-step = 15, 3-step/vague = 5), magnitude (quantified & large = 25, estimated = 15, directional only = 5), speed (impact within the M0.4 horizon = 25, lagged = 15, uncertain = 5), reversibility (hard to reverse = 25, partially reversible = 15, easily hedged/substituted = 5). Composite = sum. Tier: primary ≥ 75 (carries to candidate-surfacing AND deep work), secondary 60–74 (carries), parked < 60 (logged only). The single invalid state: all three lists empty. Zero carry-forward → `return_to_m0_2`.
- **M0.3 — ticker check.** Machine-checkable: grep the draft for ticker-like tokens (uppercase 1–6 char symbols attached to exchange suffixes, $-prefixed cashtags, "NSE:"/"NYSE:" prefixes) and company names; record `ticker_check_detail {performed, violations, repair_action}`. Violations are repaired before saving, or the gate fails.
- **M0.4 — observable expiry.** The horizon is one of: short_days_weeks / medium_weeks_3months / medium_long_3_6months / long_6months_plus. The expiry condition must be checkable tomorrow against a verifiable market signal (`expiry_condition_is_observable` locked true; `expiry_condition_is_opinion` locked false). "Sentiment improves" is an opinion, not an expiry.
- **M0.5 — the kill switch.** One falsification sentence (≥ 20 chars), specific enough to monitor tomorrow: two monitorable metrics, a numeric threshold with units, and a date by which crossing the threshold confirms falsification. The `uncomfortable_check` is locked true: the falsifier must genuinely threaten the thesis — a soft, easily-dismissible condition fails the gate. Secondary falsifiers each carry a metric and a probability estimate. Once Phase 1 locks (edge-definition), these criteria CANNOT be moved.

## Routing (module synthesis)

- `Proceed` — all gates pass → edge-definition runs.
- `watchlist_no_world_change` — M0.2 gate failed (terminal; record why and what was deferred).
- `return_to_m0_2` — M0.3 produced zero carry-forward parties (terminal in this run; the record keeps the rationale so a human can revise and relaunch).
- (`watchlist_no_source` — only via the M0.1 60-second check failing on a human_prompt.)

## Output discipline

- The synthesis assembles the DRAFT thesis record (meta + M0_1..M0_5) at `{RUN_ROOT}/thesis_record.json` with `locked: false`, `status: active` (or the terminal status), and `version: 1`. Field names follow `frameworks/screener/thesis_record.schema.json` exactly.
- Every agent report ends with a labelled `Verdict:` line; the synthesis ends with `## Machine Output` + `## Routing` (greppable `Routing:` line).
- §5 citations on every fact: `[Source, Date, Section]`. Every magnitude has a baseline. Banned without quantification: "could benefit", "may be impacted", bare "significant"/"material", "market hasn't realized".
