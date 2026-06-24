# MODULE_RULES — candidate-surfacing (Screener swarm)

These rules bind every agent in `.claude/agents/screener/candidate-surfacing/`. The root `CLAUDE.md` and `.claude/agents/screener/SWARM.md` apply in full; the stricter rule wins.

## What this module is

The first place in the entire pipeline where tickers are allowed. Given a LOCKED thesis routed `provisional` or `full_machine`, it maps the carry-forward industries (M0.3 primary + secondary tiers) to actual listed companies, ranks how purely each expresses the thesis, and produces the shortlist deck a human picks from to hand off into the research swarm.

## Preconditions (binding)

- `thesis_record.json` exists, `meta.locked: true`, and `M0_6_6.routing_outcome` ∈ {provisional, full_machine}. Any other state → this module must not run (the orchestrator enforces it; if invoked anyway, stop and report).
- Only parties with `carry_forward: true` (primary/secondary tiers) are mapped. Parked parties stay parked.

## Mapping discipline

- Listings on recognised exchanges per the swarm manifest (`sources.candidate_surfacing.exchanges_and_listings`). Note the exchange and that the line is investable (not suspended/delisted/illiquid microcap — flag liquidity concerns honestly).
- Geography follows the blast radius: an India-shaped event maps NSE/BSE names first; a global commodity event maps the most-exposed listings wherever they trade. The engine's default-likely case includes India (CLAUDE.md §27) — do not default to US names out of habit.
- **Exposure score 0–100** per candidate: how purely this company expresses the thesis mechanism. Quantify where findable (segment revenue/EBITDA share tied to the affected industry, capacity share, contract exposure — cite filings/IR). A conglomerate with a sliver of exposure scores low no matter how famous it is.
- Side: `long` (beneficiary tiers), `short` (harmed tiers), or pair legs per the M0.3 `pair_trade_notes`.
- Every candidate carries `beneficiary_ref` — the M0.3 party id (DIR/IND/HARM-NNN) it expresses. A candidate with no party reference is unmapped and not allowed.
- Prior engine coverage is checked, not guessed: grep `analyses/*/decision_record.json` for the ticker (latest decision + run root) and check `data/<TICKER>/` existence. Surface both on the card — they change what "send to research" costs.

## Ranking discipline

- Rank by: exposure purity first, then liquidity/investability, then prior-coverage convenience (a name with a fresh data pool is cheaper to research). State the ordering rationale — never present an unordered list.
- 3–8 candidates total is the useful shortlist size. More than 8 = the map was too loose; fewer than 3 deserves an explanation (e.g. the industry has two listed pure plays).
- Caveats are mandatory where real: FX/listing-access constraints, pending corporate actions, controlling-shareholder structures (§24 filter 6 awareness — flag, don't analyze deeply; the research swarm owns that).

## News-impact sizing discipline (`screener-news-impact-sizing`)

Governs the layer-3 agent that sizes the move the originating news justifies. The full method is `frameworks/screener/NEWS_IMPACT.md` (read it in full); the binding rules here:

- **Recurrence is the swing input.** Classify every sized event as one-off / permanent step-change / finite-life and convert accordingly: after-tax cash (one-off) / capitalise at the company's OWN forward multiple (permanent) / NPV at the cost of equity (finite). The same headline differs by an order of magnitude across that boundary (NEWS_IMPACT.md §2, §8).
- **The duration trap is a hard error.** Never capitalise a finite-life stream at the earnings multiple — NPV it. Show the trap check (what capitalising would wrongly give, and the overstatement multiple) on every finite-life event.
- **Revenue and margin discipline (§15).** Strip pass-through taxes (GST and the like) before counting revenue; apply the business's actual after-tax margin (reported vs adjusted separated, basis points). Market cap is fully-diluted and dated; cross-currency figures carry an FX date+rate (§27) — a filing's stated ₹ equivalent is used verbatim.
- **A fundamentals floor, not a verdict.** The output never changes `M0_6_6.routing_outcome`, the exposure score, or the ranking, and issues no price target (CLAUDE.md §16). Observed ≫ implied is a re-rate handed to the human/research swarm, not a Buy.
- **Honest mode + applicability.** Record `primary` vs `fallback` and name the missing feed; a diffuse macro/policy/commodity signal with no single issuer to size is `not_applicable` with a reason — not a forced number.
- **§5 citations** on every quantification; banned: "the move is justified/unjustified" stated as fact without the implied-vs-observed numbers beside it.

## Output discipline

- `candidates.json` per `frameworks/screener/candidates.schema.json`, copied to `screener/ledger/candidates/<thesis_id>.json`; board index refreshed.
- The synthesis report ends with `## Machine Output` + `## Routing` (the routing here restates the thesis routing — this module never changes it).
- §5 citations on exposure claims. Banned: "well positioned", "best play", "pure play" without the number that makes it pure.

## Writing Standard

SWARM.md §8 plain-English rules apply to every prose section in this module's output files. Machine-facing fields (JSON field names, party IDs like DIR-001, routing lines, `## Machine Output`) stay technical.

- **Candidate cards** in the synthesis deck: the "Why" line is one plain sentence explaining how this company makes money from the thesis mechanism. "Flex LNG earns a daily charter rate for renting its LNG tankers; those rates just tripled" is right. "FLNG captures spot-rate uplift through contracted and market-rate voyages on its 174,000 cbm vessels" is not.
- **Ranking Rationale paragraph**: 3–4 sentences. Why this order, what separates #1 from #2 — in plain English.
- **Synthesis Abstract**: 2–4 sentences. The thesis in a phrase, how many names express it, the top pick and why, and what the human should do next.
- **Caveats**: one plain sentence per caveat. What the risk is and why it matters — no acronyms without expansion on first use.
