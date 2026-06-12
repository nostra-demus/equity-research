# MODULE_RULES — edge-definition (Screener swarm, Phase 1: M0.6)

These rules bind every agent in `.claude/agents/screener/edge-definition/`. The root `CLAUDE.md` and `.claude/agents/screener/SWARM.md` apply in full; the stricter rule wins.

## What this module is

The second half of Phase 1: the edge stack. Given a thesis core that survived M0.1–M0.5, it establishes what the market believes (M0.6.1), what the market is pricing (M0.6.2), what we believe differently and why (M0.6.3), why the mispricing exists (M0.6.4), what will close the gap (M0.6.5), and how confident we are in the edge (M0.6.6) — then it LOCKS the record and routes it. This is the engine's variant-perception discipline (CLAUDE.md §7) made structural: no proven edge → no full machine.

## Source policy (this module ONLY)

Gate-0 strictness does NOT apply here. Per the swarm manifest `sources.edge_definition`: CapIQ / Bloomberg / exchange data preferred; reputable market-data sites are allowed for consensus, estimates, options, and positioning data. EVERY web input is dated and labelled. EVERY unfilled field carries a `missing_reason` stating what was looked for and where. Fabricating a number that could not be found is the cardinal sin of this module — `missing_reason` is always the honest alternative (§3: do not hide missing data).

## The sub-modules (all binding)

- **M0.6.1 — consensus, written sympathetically.** The dominant market view in the voice of a consensus holder — not a strawman (`strawman_risk_check` locked true). At least one `numeric_anchor`. 2–4 `key_consensus_assumptions` — these are what M0.6.3 must specifically attack. The contrary view: if one exists publicly, who holds it and their number; if none found, say so and when it was checked. Unanimity rating (high / moderate / low) with one-sentence evidence. Analyst buy/hold/sell counts and estimate dispersion vs the ~5-year norm where findable (else missing_reason).
- **M0.6.2 — the market-implied dashboard.** Five blocks: estimate dispersion; estimate revision trajectory (3m ago / 1m ago / now); implied scenario from the multiple (back out what earnings path the current multiple implies vs the sector's normal range); options implied move (ATM premiums, implied move %, IV percentile/rank); short interest + passive ownership. Each block: data + one interpretation line, or `missing_reason`. The `implied_scenario_interpretation` paragraph must reference at least TWO blocks. `fields_missing_flagged` lists every unfilled block.
- **M0.6.3 — variant perception.** `consensus_numeric_view` vs `our_numeric_view` with the departure magnitude (% or absolute). At least one specific mechanism the consensus has not modelled (`mechanism_1_missing_from_consensus`); a second is encouraged. The coverage gap must be EVIDENCED (`sell_side_gap_evidence` — e.g. a search across published research/commentary returning nothing on the mechanism, with the search recorded). The `manifestation_event` (when the variant view becomes visible) with its time window. **No proven variant = no edge**: a variant paragraph without a numeric departure and a missing mechanism is decoration, and M0.6.6 must score it accordingly.
- **M0.6.4 — mispricing reason.** Primary category from exactly: structural / mandate_constraint / complexity / timing / behavioral. THREE separately-labelled, independently verifiable facts (model dates, search results, price targets vs prices) — assertions are not facts. Secondary categories each carry their own rationale.
- **M0.6.5 — convergence trigger.** The specific event that makes the market adopt the variant view: name, date range, scheduled/unscheduled (+ probability 0–1 if unscheduled, with the reasoning), and a FOUR-step causal mechanism from trigger to price convergence. Secondary triggers with id/date/type/probability/mechanism. A trigger with no date evidence is "vague" and must be labelled so (§17: no undated "catalyst soon").
- **M0.6.6 — edge confidence score.** Three sub-scores 0–100, each with a rationale paragraph: `variant_perception_quality` (specific, numeric, mechanism-rich?), `mispricing_reason_strength` (evidenced, structural?), `convergence_trigger_clarity` (observable, dated, causally linked?). `blended_calculation` is the LITERAL formula string — default weights `0.40 × VPQ + 0.30 × MRS + 0.30 × CTC`, printed with the numbers substituted. `final_score` is the rounded integer result. An analyst override requires written justification.

## Routing bands (binding)

- final_score < 60 → `watchlist_no_edge`
- 60–80 → `provisional`
- \> 80 → `full_machine`

## The lock

On completion, the synthesis sets `meta.locked: true`, `meta.status` = the routing outcome, `meta.phase1_completed_at` = now, `M0_5.locked_after_m0_complete: true` + `locked_at`, and `meta.next_module` (= candidate-surfacing for provisional/full_machine; null otherwise). From this moment no field may be overwritten — amendments append to `version_history` and increment `version`.

## Output discipline

- The synthesis updates `{RUN_ROOT}/thesis_record.json` (now complete with M0_6_1..M0_6_6), copies it to `screener/ledger/theses/<thesis_id>.json`, appends the updated status to the events ledger, and refreshes the board index.
- Every agent report ends with a `Verdict:` line; the synthesis ends with `## Machine Output` + `## Routing` (greppable `Routing:` and `Edge score:` lines).
- §5 citations; banned without quantification: "could benefit", "may be impacted", bare "significant"/"material", "market hasn't realized" (the coverage-gap evidence IS the only licence to say what the market is missing).
