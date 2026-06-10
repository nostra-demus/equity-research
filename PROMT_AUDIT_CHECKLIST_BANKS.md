# Prompt Audit Checklist (Senior-Analyst Standard)

Audit any module/agent prompt against senior-analyst first principles. Apply with judgment — not as a box-tick.

## How to run it
1. Read the agent prompt in full + its `MODULE_RULES.md` + 2–3 real committed outputs (different companies / business types).
2. Verify every finding against the actual file before asserting it. Do not rely on memory or a summary.
3. Do not invent gaps. A gap counts only if a real output exhibits it. If the prompt is already strong, mark it DON'T-FIX.
4. Before proposing a change, check its consequence: does it touch `CLAUDE.md` doctrine, the execution DAG (`layer` / `depends_on`), or a downstream agent? Is the fix sufficient, or only a reminder that could fail again?
5. After any patch: re-run `eval` (must PASS) + banned-phrase check.

## The standard (what the module ultimately must answer)
1. What is it, how does it make money, do we understand it?
2. Is it a good business? (returns on capital above the cost of capital, reinvestment runway, moat durability)
3. Are the people honest, capable, aligned, good capital allocators?
4. Can it survive? (leverage, liquidity, fraud, disruption — avoid permanent loss first)
5. What is it worth, and how bad is the downside? (value as bull/base/bear levels — points, with dispersion shown separately; margin of safety = discount to base fair value, and downside-to-bear stated as a separate metric)
6. What is priced in vs what we believe? (the edge)
7. Why might we be wrong, and what would change the view?

The per-prompt audit asks: does this prompt do senior-grade work in service of its module's question?

## Per-prompt items (first principles)
| # | Item | Audit question | Scope / guard |
|---|---|---|---|
| 0 | Relevance | Does the output advance the module's question, or is it busywork? | — |
| A | Right method for the business type | Is the method/metric matched to the business type, not a generic default? | per the sector overlay / business-type method map |
| B | Cross-agent consistency | Does it use the canonical shared inputs and not contradict a sibling agent or `MODULE_RULES`? | highest-value check; only visible across agents |
| C | Decisive economic test | Is the one test that most determines the verdict in this domain mandated? | N/A for purely descriptive agents |
| D | Source skepticism | Are material management-headline / adjusted figures cross-checked against a computed or audited figure, not taken at face value? | cross-check material items, not reflexive distrust of all |
| E | Gaps flagged, not assumed | Are missing inputs flagged ("Not assessable") instead of fabricated, and is the single highest-value missing input named? | — |
| F | Disconfirmation | Is there a real two-sided test the verdict must survive (strongest bear, killer risk, falsification trigger)? | a test, not a closing caveat |
| G | Commits to a call | Does the output commit to a verdict + the downside + the main swing variable, not hedge? | evaluative agents only; N/A for descriptive inputs |

## Mechanical / hygiene tier (secondary — engine consistency, not judgment)
- Output unit: a derived point with dispersion shown separately, not false precision and not a vague band.
- Same-basis comparisons (forward↔forward, adjusted↔adjusted, normalized↔normalized).
- Citations on load-bearing numbers.
- Caps present and propagated.
- Numbers reproducible (formula shown / executed).
- Every mandate carries a no-invention escape (source-priority ladder → "Not assessable").
- Plain English; no banned phrases.
