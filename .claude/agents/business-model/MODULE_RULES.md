# Business-Model Module — Operating Rules

This file defines the operating rules specific to the **business-model module** of the equity research system.

The repo root `CLAUDE.md` contains cross-cutting rules — git policy, global investing standards — that apply to all modules.

Every subagent in this module reads BOTH the repo root `CLAUDE.md` AND this `MODULE_RULES.md` first, then runs its own task.

---

## Core Principles

1. **No source = no claim.** If something cannot be verified from the data pool, write: *"Not proven from available data."*
2. **Segment-first.** A multi-business company is not one company. Break it apart. If one segment drives the value, say so.
3. **Strip the marketing layer.** If the company is mostly a disguised commodity, macro, policy, FX, or rate bet, say so.
4. **Filings beat decks.** When sources disagree, the more conservative regulated filing wins.
5. **Be blunt.** No vague positives without evidence in the same sentence.

---

## Source Hierarchy (most → least trusted)

1. Annual filings (10-K, 20-F, annual report)
2. Quarterly filings (10-Q, 6-K)
3. Earnings transcripts
4. Investor presentations
5. Capital IQ / Bloomberg / FactSet exports
6. User notes
7. Web sources (only if filings missing)
8. Your own inference — must be labeled *"Inference, not from filings."*

When the deck is bullish and the filing is cautious, trust the filing.

---

## Evidence Citation Format

Every "Evidence" cell uses this format:

`[Source, Period, Page or Section]`

Examples:
- `FY24 10-K, p.42`
- `Q2 FY26 transcript, prepared remarks`
- `FY24 Annual Report, Note 18`
- `Q3 FY26 investor deck, slide 12`
- `Capital IQ export, FY23 segment data`
- `BSE filing, Oct 2025`

Do NOT write "company filings" or "annual report" alone — those are not citations.

---

## Scoring Rules

All scores are out of 100, whole numbers. Bands:

| Band | Meaning |
|---|---|
| 0–20 | Very weak / very high risk / unknown |
| 21–40 | Weak / high risk |
| 41–60 | Mixed / average |
| 61–80 | Strong / low risk |
| 81–100 | Very strong / very low risk / very clear |

**Default direction: higher = better.**

**Inverted scores (higher = WORSE)** are flagged in each subagent that uses them. The most common cases:
- External dependency risk (in the external-dependency agent and the synthesizer's verdict block)
- Severity columns inside Red Flags and Capital Allocation tables

Always flag the inversion in the subagent's table header.

Be strict. High scores require evidence. Default to the middle band when uncertain.

---

## Rejector-Filter Penalties & Caps (CLAUDE.md §24)

This module owns three of the six "Avoid Big Risks" filters. Each trips on cited evidence and applies a score penalty plus a conviction cap carried to `99_business-model-synthesis`. Penalties scale with the strength of evidence; a tripped filter is never averaged away.

| Filter (§24) | Owning agent / signal | Trip condition (evidence-based) | Penalty / Cap |
|---|---|---|---|
| 1 — Crooks / integrity | `disqualifier-scan`; routed to management-governance | Proven fraud / defrauding of stakeholders by controller or senior management | Hard verdict-lock (via #6 / §13). Unverified adverse "buzz" → no lock; flag and route to management-governance to cap conviction |
| 4 — Serial acquirers | `capital-allocation-governance`, acquisition-pattern row | Multiple material deals over the period (serial acquirer), especially debt-funded deals near or above the company's own value | Acquisition-pattern severity ≥70; Capital Allocation Score max 50; Overall usefulness max 70 |
| 5 — Fast-changing industry | `business-quality`, rate-of-change row; cross-checked in `moat` | Industry rate-of-change / disruption row scores ≤40 (winners not knowable in advance) | Business quality aggregate max 65; flag thesis as a sector / technology-cycle bet; moat durability discounted |

If multiple caps affect the same score, use the most restrictive. State explicitly in the report when a cap is applied and why.

---

## Style Rules

- Plain English. Short sentences.
- Plain enough for a non-finance reader (CLAUDE.md §21): use the simplest word that keeps the meaning, and the first time a finance term appears (e.g. EBITDA margin, ROIC/ROCE, unit economics) keep the term and its number but add a short plain meaning in a clause. Plain is not vague — never drop a number or a citation.
- Every important claim → evidence in the same paragraph or table row, in the citation format above.
- Numbers beat adjectives. If you can quote a number from a filing, do.
- Label all inference: *"Inference, not from filings."*

### Banned phrases

These phrases may NOT appear unless paired with specific evidence in the same sentence:

- "strong fundamentals"
- "well positioned"
- "robust platform"
- "attractive opportunity"
- "monitor closely"
- "best-in-class"
- "industry-leading"
- "diversified business"
- "shareholder-friendly"
- "disciplined acquirer"
- "prudent capital allocation"

---

## Out-of-Scope Requests

If the invocation message asks for anything outside a subagent's specific scope — valuation, target price, scenarios, ratings, forecasts, trade ideas, anything assigned to a different specialist — do NOT comply. Instead:

1. Produce the standard report for this subagent.
2. Add a line to the chat confirmation:
   `Out-of-scope request received: [describe]. Route to the appropriate specialist.`

Never silently expand scope.

---

## Inputs Every Subagent Receives

Every subagent invocation passes:

- `TICKER` — company ticker
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/business-model/{NN}_{name}.md`
- `DATE` — today's date
- `UPSTREAM_INPUTS` — paths to outputs from agents this one depends on (may be empty)

Read these from the invocation message. Never hardcode.

---

## Output Path Convention

`analyses/{TICKER}_{DATE}/business-model/{NN}_{agent-name}.md`

The two-digit prefix preserves execution order in directory listings.

---

## Chat Confirmation Format

Every subagent ends its turn with this confirmation block:

```
Agent: {name}
Output: {path}
Verdict: {agent-specific verdict line}
Biggest finding: {one line}
```

Add lines only if applicable:
- `Out-of-scope: ...` (if an out-of-scope request was received)
- `Disqualifier triggered: ...` (only the disqualifier-scan agent)
- `Insufficient data: ...` (if the data pool was inadequate for this agent's task)

---

## Independent Reads

Each subagent reads `DATA_PATH` independently and extracts what it needs.
Subagents do NOT share an authoritative manifest.
This means the same number may be cited slightly differently across reports — that's fine.
The synthesizer reconciles disagreements at the end.

---

## Subagent List & Execution Layers

Layer 0 (sequential, fail-fast):
- `data-triage`

Layer 1 (parallel, no upstream dependencies):
- `disqualifier-scan`
- `business-identity`
- `segment-map`
- `customer-geography`
- `external-dependency`
- `capital-allocation-governance`

Layer 2 (parallel, depend on Layer 1):
- `unit-economics` (depends on segment-map)
- `value-chain` (depends on business-identity)
- `competitive-map` (depends on business-identity, segment-map)
- `business-quality` (depends on segment-map, customer-geography)

Layer 3 (parallel, depend on Layer 2):
- `moat` (depends on competitive-map)

Layer 4 (sequential, depends on most prior):
- `red-flags-sweep`

Layer 5 (sequential, synthesizer):
- `business-model-synthesis`

If an upstream output is missing, the dependent subagent notes it explicitly:
*"Upstream output missing: [name] — proceeding with available data."*
