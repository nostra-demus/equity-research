# Prompt Audit Checklist (Senior-Analyst Standard)

A reusable checklist for auditing the engine's module/agent prompts against **senior-analyst first principles** — not against the framework's own rules, and not as a QA box-tick. Derived from the valuation deep-dive sweep (DD-01…12), a three-reviewer senior-analyst pass, and a pressure-test that pruned a bloated ~20-item draft down to this.

**Design rule:** "it sounds rigorous" is a reason to *cut*, not keep. Every item below survived a stress-test (steelman the case against it). Items that were only hygiene or only engine-mechanics were demoted to the mechanical tier and labelled honestly. Senior investors are checklist-*skeptical for the thesis* — a checklist exists to avoid dumb mechanical errors, **not** to manufacture judgment. "Checklist complete, thesis still wrong" is the failure mode; the killer risk is never the box that's on the list.

---

## The standard (north star — what the engine as a whole must answer)

A senior analyst's process reduces to ~7 questions. The engine's modules map to them. The per-prompt audit asks: *does this prompt do senior-grade work in service of its question?*

1. **What is it, how does it make money, do I understand it?** → business-model
2. **Is it a good business?** durable returns on capital above the cost of capital, reinvestment runway, moat → business-quality / moat
3. **Are the people honest, capable, aligned, good capital allocators?** → management-governance
4. **Can it survive?** leverage, liquidity, fraud, disruption — *avoid permanent loss first* → balance-sheet-survival + §24 rejector filters
5. **What's it worth, and how bad is the downside?** intrinsic value as a range, **margin of safety to the bear case** (the crux) → valuation
6. **What's priced in vs what I believe?** the edge / variant perception → expectations-gap
7. **Why might I be wrong, and what would change my mind?** killer risk, falsification → disconfirmation

---

## How to run it (method, not items)

1. Read the agent prompt **in full** + its `MODULE_RULES.md` + **2–3 real committed outputs** (different companies / business types). A prompt-only read misses what outputs reveal — and tempts you to defend the framework.
2. **Verify every candidate finding against the actual file** before standing behind it. (Relaying a subagent's claim un-checked is how an audit goes wrong.)
3. **Don't impose imagined gaps.** A gap counts only if a real output exhibits it. If the prompt is already strong, say so — most candidates should come back DON'T-FIX.
4. **Pressure-test the consequence before patching:** does the fix touch doctrine (`CLAUDE.md`), the execution DAG (`layer:` / `depends_on`), or downstream agents? Is the fix actually *sufficient* (a reminder that already failed is not a fix)?
5. Patch → re-run `eval` (must stay PASS) + banned-phrase check → document Issue / Solution / Why-better / Risk.

---

## Per-prompt audit — first-principles items (apply with judgment)

| # | Item | What it catches | Guard / scope |
|---|---|---|---|
| **0** | **Relevance** — does the output advance its module's investor-question, or is it busywork? | the "so what" test; description-without-decision | — |
| **A** | **Right method for the business type** | a bank valued on EV/EBITDA, a cyclical on spot earnings — garbage-in | matched to the Business-Type Method Map / sector overlay |
| **B** | **Cross-agent consistency** — shares canonical inputs; doesn't contradict a sibling or MODULE_RULES | the highest-value, *invisible-to-single-prompt* failure (e.g. a DCF that says overvalued while the reverse-DCF says cheap) | absorbs "scope clarity / no overlap" |
| **C** | **The decisive economic test is mandated** | the one test that matters per domain (moat → return vs cost of capital; balance-sheet → survival under stress; earnings → cash conversion) | **N/A for descriptive agents** (segment-map describes, it doesn't judge) |
| **D** | **Source skepticism / anti-anchoring** | swallowing management-headline numbers (adjusted EBITDA, "net cash", a 72% ROCE) at face value | cross-check *material* headlines against a computed figure — not reflexive distrust of all |
| **E** | **Gaps flagged, not assumed** | fabricating a number instead of saying "not in pool" | "Not assessable" over invention, **+ name the single highest-value missing input** (so it's decision-useful, not a dodge) |
| **F** | **Disconfirmation as a survival test** | confirmation bias; the perfunctory "on the other hand" | require a test the thesis must *survive* — steelman the bear, name the killer risk, state the falsification trigger — not a closing caveat |
| **G** | **Commits to a call** — verdict + downside + the one swing variable | hedged, un-actionable mush | scoped to **evaluative/verdict agents**; N/A for pure descriptive inputs |

---

## Mechanical / hygiene tier (secondary — engine consistency, NOT senior judgment)

Real, worth checking, but they are formatting/engine-safety conventions — do not mistake them for the thesis-level work above.

- **Output unit** — a derived point with dispersion shown as a *separate* exhibit (football field), not a false-precise point and not a vague band wearing a scenario label.
- **Same-basis comparisons** — forward↔forward, adjusted↔adjusted, normalized↔normalized.
- **Citations on load-bearing numbers** — the headline figure shouldn't shed its source one hop up (the synthesis-compression risk).
- **Caps present & propagated** — partial-data / score caps applied and carried downstream.
- **Numbers reproducible** — formula shown / executed snippet, not mental arithmetic.
- **No-invention escape on every mandate** — each "you must compute X" carries a source-priority ladder → "Not assessable" (an LLM-engine safety rule).
- **Plain English / no banned phrases.**

---

## What was deliberately cut or demoted (so future audits don't re-inflate it)

- **"Scope clarity / no overlap"** — cut as standalone; folded into **B**.
- **"Fabrication guardrail on every mandate"** — demoted to the mechanical tier (an LLM-engine safety rule, not an investing principle).
- **"Same-basis", "point-vs-range / output unit", "citations-traceability", "horizon-on-target", "PT bridge"** — demoted to the mechanical tier. These are presentation/hygiene conventions, not pillars of senior judgment.
- **The "two-lens (enforcement vs senior)" meta-framing** — kept as a *method* note, removed as a checklist item.

The original draft over-weighted mechanical hygiene and under-weighted the investing crux (circle of competence, business quality/durability, management honesty+alignment, survival, and price/margin-of-safety as the center). The crux now lives in the 7-question standard; the per-prompt items test whether each prompt serves it.

---

*Provenance: valuation module sweep (`PROMPT_DEEPDIVE_FIXES.md`, DD-01…12), branch `claude/prompt-deepdive`.*
