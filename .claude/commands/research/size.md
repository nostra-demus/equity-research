---
description: Build an illustrative MODEL paper-portfolio from the decision ledger — size selected ideas by conviction × edge × downside (fractional-Kelly style, data-sufficiency-capped), surface size-in watch triggers for non-held names, and flag concentration/correlation. Model / process-tracking only — not investment advice, not real orders. Writes a dated portfolio summary + sizing JSON.
argument-hint: [SCOPE]
allowed-tools: Read, Glob, Bash, Write
---

You build the **model paper-portfolio** for the research ledger — the step the best investors say actually makes the money: not *whether* you're right, but *how much* you have on when right vs wrong (Druckenmiller), sized by edge (Kelly), diversified across uncorrelated bets (Dalio). This is the book-level extension of `frameworks/DECISION_LEDGER.md`'s paper-trade doctrine.

**Scope & disclaimer (read first).** This produces an **illustrative model paper-portfolio for the engine's own process-feedback tracking** — the same "simulated, not real orders" basis as the decision ledger's paper trades (`DECISION_LEDGER` §4). It is **NOT investment advice and NOT a recommendation to any person to buy or sell**, and it places no orders. Every output is labeled model/illustrative. You are READ-ONLY on all records; you write only a dated portfolio summary + sizing JSON (derived/regenerable). Arguments: `$ARGUMENTS`.

---

## 1. Gather the ledger

`$ARGUMENTS`: empty/`all` → every `decision_record.json`; a ticker → that name. For each, read the decision record + the **latest-version** audit reports (`expectations_gap*.json` → edge; `pre_mortem*.json` → confidence haircut & verdict; `verification_report*.json` → integrity verdict). Resolve "latest" by highest `_vN` (base = first).

## 2. Eligibility (what may carry model weight)

- **Long-eligible** only if ALL hold: basket = **Selected** (Strong Buy / Buy / Starter); probability-weighted `expected_return_pct` > 0; an **evidence-backed edge** (`expectations_gap.is_exploitable` true, or `edge_score` ≥ ~50 with variant-perception ≥ Moderate); no rating cap below Buy; verification verdict ∉ {Failed, Material issues}; pre-mortem verdict ∉ {Does not survive, Thesis broken}.
- **Short Candidate** → paper short (symmetric logic), only if the thesis explicitly supports it.
- Everything else (**Avoid / Watchlist / Pair-only-without-leg / Insufficient Data**, or negative expected return, or no edge) → **no position**, and it goes on the **watch list** (Step 5).

A name with negative probability-weighted expected return or no proven variant perception is **never** sized — the math self-zeroes it (this is the discipline that keeps "interesting but not cheap" names out of the book).

## 3. Size the eligible names (illustrative, fractional-Kelly style)

For each long-eligible name, derive a model weight from **edge and asymmetry**, not conviction alone:
- Use the scenario distribution (bull/base/bear probabilities, returns) to get a Kelly-style raw fraction — e.g., a **half-Kelly** on `expected_return` vs `downside_risk` (cap the implied odds; never full Kelly).
- Scale by **conviction**: `(pre-mortem-adjusted confidence / 100) × (data_sufficiency / 100)`. (Use the pre-mortem `recommended_confidence` if present, else `confidence_score`.)
- **Caps:** per-name max ~8% (Starter rating → cap at ~1/3 of that, ~2.5%); a thin `data_sufficiency` (< 50) caps the name hard or excludes it; round to sane increments.
- Negative expected return ⇒ weight 0.

State the rationale and what capped each weight.

## 4. Book-level construction

- `gross_pct` = Σ weights; `cash_pct` = 100 − gross (cash is a position).
- **Concentration:** largest name, top-3 concentration; flag if any single name > the per-name cap.
- **Correlation / thesis-vector:** group names by shared driver (same commodity/policy/sector vector from `thesis_type` + the thesis); if two names share a vector, treat them as correlated and **haircut the combined weight** (Dalio: uncorrelated bets, not repeated ones). Note the diversification (or lack of it).
- Keep gross within a sane model cap (e.g., ≤ 60–70% with the rest cash) unless many uncorrelated high-edge names justify more.

## 5. Watch list (the size-in triggers)

For every non-held name, record the **explicit size-in trigger** from its `suggested_action` (e.g., BG: a pool price < ~$100; HCG: re-underwrite at ≤ ₹520) and the next `review_schedule` date. This is the Lynch/Marks sell-and-buy-discipline layer: what would move a watched name into the book.

## 6. Write the outputs (dated, derived)

Write `analyses/portfolio/<TODAY>_portfolio.md` (human) and `analyses/portfolio/<TODAY>_sizing.json` (machine), `<TODAY>` = `date +%F` (create `analyses/portfolio/`; `_v2` suffix if today's already exists). `sizing.json` schema:

```
{
  "schema_version": "1.0",
  "generated_at": "",
  "scope": "",
  "disclaimer": "Illustrative model paper-portfolio for research process-tracking — not investment advice, not real orders.",
  "n_decisions": null,
  "positions": [],
  "watch": [],
  "book": {},
  "notes": ""
}
```
`positions[]`: `{ "ticker","decision","model_weight_pct","rationale","capped_by" }` · `watch[]`: `{ "ticker","decision","size_in_trigger","next_review" }` · `book`: `{ "gross_pct","cash_pct","max_name_pct","concentration_note","correlation_flags" }`. Conventions: valid JSON; `null`/`""`/`[]`/`{}` for unknowns; never fabricate. Validate: `python3 -m json.tool "<file>"`.

## 7. Human summary + git

Print: the model book (positions + weights, or "no positions — N names on watch"), gross/cash, concentration/correlation flags, the watch list with triggers, and the model-only disclaimer. Commit straight to `main` (add only `analyses/portfolio/<TODAY>_*`), message `Model portfolio: <scope> — <gross_pct>% invested, <n> on watch (<DATE>)`, push, report the SHA.

---

## Hard rules

- **Model / illustrative only — not investment advice, not real orders.** Same simulated basis as the ledger's paper trades. Place no orders; recommend no person buy/sell.
- **Never size a name with negative expected return or no evidence-backed edge** — the discipline that keeps the book honest. Data-sufficiency caps or excludes thin names.
- **Asymmetry over conviction:** size on edge × downside (fractional-Kelly), then scale by conviction — not the reverse. Never full Kelly.
- **Read-only on records;** writes only the dated `analyses/portfolio/` summary. Grounded in `CLAUDE.md` §16 and `DECISION_LEDGER.md` §3/§4; spawns no subagents.
