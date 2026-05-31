# Management-Governance Module — Operating Rules

This file defines the operating rules specific to the **management-governance module** of the equity research system.

The repo root `CLAUDE.md` contains cross-cutting rules — git policy, global investing standards — that apply to all modules.

Every subagent in this module reads BOTH the repo root `CLAUDE.md` AND this `MODULE_RULES.md` first, then runs its own task.

---

## Scope

This module answers one question:

> "Are the people running this company competent stewards of shareholder capital, and are their incentives and governance aligned with minority shareholders?"

It is the deep-dive behind the single `business-model/11_capital-allocation-governance` quick-read: management quality and track record, the capital-allocation scorecard, incentive/compensation alignment, ownership and insider behavior, board quality and shareholder rights, and disclosure candor.

This module DOES:
- judge management's track record — have they delivered on what they promised?
- score the historical capital-allocation record (M&A, buybacks, dividends, reinvestment, debt)
- assess whether incentives/compensation reward per-share value or empire-building
- map ownership, insider buying/selling, and control structure
- assess board independence, shareholder rights, and minority-shareholder protection
- judge disclosure candor — do they tell the truth in good times and bad?

This module does NOT:
- value the company or produce a fair value / price target — the **valuation module** owns that
- assign scenario probabilities, compute risk/reward, size positions, or issue a Buy/Sell rating — the **master synthesizer** owns that
- re-adjudicate the hard disqualifiers — those live in `business-model/01_disqualifier-scan` (audit qualification, going concern, promoter pledging >50%, related-party >25%, repeated auditor changes, material restatements, regulatory enforcement). This module references them and goes deeper on the spectrum.

**Relationship to `business-model/11_capital-allocation-governance` (read this twice).** That agent is a single quick-read inside the business-model module. THIS module is the dedicated deep-dive and **supersedes** it where they overlap. The synthesis tells the master synthesizer to treat this module's governance verdict and scores as the primary governance read.

**Boundary with the master synthesizer.** This module produces the stewardship read — scores, a verdict, and red flags at stated severity. The master synthesizer folds that into its verdict and risk register. Produce the read; stop there. No valuation, no probabilities, no rating, no sizing.

---

## Core Principles

1. **Judge actions, not words.** A mission statement is not evidence. Capital deployed, shares bought at what price, insiders buying or selling, promises kept or missed — those are evidence.
2. **Follow the incentives.** People do what they are paid to do. If comp pays on revenue or EPS growth, expect acquisitions and buybacks regardless of returns. State what the metrics actually reward.
3. **Per-share, always.** Growth that dilutes per-share value is value destruction dressed as ambition. Judge capital allocation on per-share outcomes, not absolute size.
4. **Alignment over charisma.** Skin in the game (meaningful ownership, bought not just granted) beats a good narrative.
5. **Candor in bad times is the tell.** Anyone is candid when results are good. Did they own the misses, or bury them in adjusted numbers and "headwinds"?
6. **Be blunt and conservative.** When evidence is thin, say "Not proven from available data" — do not give the benefit of the doubt.

---

## Source Hierarchy (most → least trusted)

1. Proxy statement / DEF 14A (compensation, ownership, board, related-party) and annual filings
2. Quarterly filings (10-Q, 6-K) and 8-K (management changes, departures)
3. Shareholder letters and the CEO's own prior-year statements (to check promises vs delivery)
4. Capital IQ / Bloomberg — ownership, insider transactions, compensation benchmarking
5. Earnings transcripts (tone, candor, ownership of misses)
6. User notes
7. Web sources — only for inputs not in the pool (executive background, board affiliations, insider-transaction filings, comp benchmarks). Label web-sourced numbers, with the date, as unverified.
8. Your own inference — must be labeled *"Inference, not from filings."*

When the shareholder letter is upbeat and the proxy shows misaligned pay, trust the proxy.

---

## Evidence Citation Format

Every "Evidence" cell uses this format:

`[Source, Period, Page or Section]`

Examples:
- `FY24 DEF 14A, Compensation Discussion & Analysis`
- `FY24 DEF 14A, Beneficial Ownership table`
- `FY24 10-K, Note 19 (Related Party)`
- `FY23 Shareholder Letter (promise)` vs `FY24 10-K (outcome)`
- `Capital IQ Insider Transactions, data as of 2026-05-09`
- `Web: Form 4 filing, 2026-04-15 (unverified)`

Do NOT write "company filings" or "the proxy" alone — those are not citations.

---

## Calculation & Assessment Standards

1. Always state the reporting currency and the period.
2. **Capital-allocation scorecard:** for each use of capital over 3–5 years, state the amount and the per-share outcome:
   - M&A: price paid, what it added, and whether disclosed returns/synergies materialized.
   - Buybacks: dollars spent, average price paid, and whether that price was below a defensible value (buying low vs buying high).
   - Dividends: payout ratio, coverage, growth, and whether sustainable.
   - Organic reinvestment: incremental ROIC (`Δ NOPAT / Δ invested capital`) where computable.
   - Debt: raised/repaid and to what end.
3. **Incentive alignment:** state the actual performance metrics in the bonus/LTIP, their weights, and whether they are per-share/returns-based (ROIC, EPS, TSR) or size-based (revenue, absolute EBITDA, deal count). Note pay magnitude vs performance and vs peers where data allows.
4. **Ownership:** state insider/promoter ownership %, whether shares were bought or merely granted, recent net insider buying/selling (12 months), and any pledging.
5. **Control structure:** flag dual-class / super-voting, controlled-company status, and any shareholder bloc with board-nomination or veto rights.
6. **Candor:** compare specific prior-period promises/guidance to actual outcomes; note non-GAAP aggressiveness (cross-check `earnings/06_earnings-quality`) and whether misses were owned or obscured.
7. Show the basis for every judgment. A reader must be able to trace each score to evidence.

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

### Management-Governance Module Scores

| Score | Direction | What it measures |
|---|---|---|
| Management quality /100 | higher = better | Track record and execution vs stated plans |
| Capital allocation /100 | higher = better | Historical per-share value creation from capital deployed |
| Incentive alignment /100 | higher = better | Whether pay rewards per-share value vs size/empire-building |
| Shareholder friendliness /100 | higher = better | Board independence, voting rights, minority-shareholder protection |
| Disclosure candor /100 | higher = better | Truth-telling in good and bad times |
| Governance risk /100 | **higher = WORSE** (inverted) | Red flags: control abuse, related-party, pledging, restatements, entrenchment |
| Data quality /100 | higher = better | Completeness of governance-relevant data (proxy, ownership, comp) |
| Overall usefulness /100 | higher = better | How useful this module is for the master synthesizer |

**Inverted scores are flagged explicitly** in every table header that uses them.

Be strict. High scores require evidence of action, not narrative. Default to the middle band when uncertain.

---

## Stewardship Verdict Categories

The synthesis agent must pick exactly one:

- **Owner-operator / exemplary stewards** — meaningful insider ownership, a record of per-share value creation, returns-based incentives, clean governance, candid in bad times
- **Aligned & competent** — generally shareholder-aligned with a solid record and acceptable governance; minor flags
- **Standard / mixed** — neither a clear positive nor a clear negative; conventional comp and governance, an unremarkable record
- **Misaligned or weak stewardship** — size-based incentives, value-destructive capital allocation, thin alignment, or weak candor
- **Serious governance concerns** — control abuse, related-party leakage, entrenchment, or a pattern of misleading disclosure (note any hard disqualifier flagged by `business-model/01_disqualifier-scan`)
- **Insufficient data** — cannot assess stewardship (e.g., no proxy / no ownership / no comp data)

---

## Partial-Data Rules

When specific data is missing, the affected agents must cap their output as described:

| Missing Data | Affected Agents | Rule |
|---|---|---|
| No proxy / compensation disclosure | 03, 99 | Incentive alignment not assessable; cap and flag |
| No ownership / insider-transaction data | 04, 99 | Ownership and insider-behavior read limited; cap |
| No board disclosure | 05, 99 | Board independence/rights not assessable; cap |
| No multi-year history | 02 | Capital-allocation scorecard limited to the latest period; flag |
| No transcripts or prior letters | 01, 06 | Promise-vs-delivery and candor read limited to filings |

---

## Score Cap Rules

When data is missing or weak, these hard caps override an agent's own scoring. The synthesis agent applies all applicable caps.

| Missing / Weak Data | Score Cap |
|---|---|
| No proxy / compensation disclosure | Incentive alignment max 50; Overall usefulness max 70 |
| No ownership / insider-transaction data | Shareholder friendliness max 60 |
| No multi-year capital-allocation history | Capital allocation max 65 |
| No prior promises/guidance to check against | Disclosure candor max 65 |
| A hard disqualifier is flagged by `business-model/01_disqualifier-scan` | Governance risk floor 80 (i.e., score ≥80); Overall verdict cannot exceed "Serious governance concerns" |

If multiple caps affect the same score, use the most restrictive.

---

## Cross-Module Inputs

The management-governance module reads outputs from previously-run modules. Under `/research:full` it runs after business-model and earnings.

**From business-model (`analyses/{TICKER}_{DATE}/business-model/`):**
- `11_capital-allocation-governance.md` — the quick-read this module deepens and supersedes
- `01_disqualifier-scan.md` — hard governance disqualifiers (audit, pledging, related-party, restatements, enforcement) — reference, do not re-adjudicate
- `12_red-flags-sweep.md` — any governance/quality flags already surfaced
- `02_business-identity.md` — who the company is and its control context

**From earnings (`analyses/{TICKER}_{DATE}/earnings/`):**
- `06_earnings-quality.md` — non-GAAP aggressiveness and accrual quality (a candor signal)
- `04_guidance-consensus.md` — the guidance/beat-miss track record (a candor and competence signal)

If a cross-module file is missing, the affected agent proceeds independently and states:
*"{module} cross-module input not available — proceeding on this module's own read of the data pool."*

---

## Disqualifier Deference (Hard Rule)

The hard, binary disqualifiers are owned by `business-model/01_disqualifier-scan`. This module does NOT re-decide them. If that scan flagged any disqualifier, this module's synthesis must: (a) report it verbatim, (b) apply the Governance-risk floor from the Score Cap Rules, and (c) cap the stewardship verdict at "Serious governance concerns." This module's job is the richer spectrum BELOW the hard lock — competence, alignment, and candor — not a second opinion on the lock itself.

---

## Style Rules

- Plain English. Short sentences.
- Every important claim → evidence in the same paragraph or table row, in the citation format above.
- Actions and numbers beat adjectives. Quote the comp metric, the buyback price, the ownership %.
- Label all inference: *"Inference, not from filings."*

### Banned phrases

These may NOT appear unless paired with specific evidence in the same sentence:

- "strong management" / "experienced team" (state the track-record evidence)
- "aligned with shareholders" (state the ownership % or the incentive metric)
- "shareholder-friendly" (state the action — buyback price, dividend, rights)
- "disciplined capital allocation" (state the per-share outcome)
- "best-in-class governance" / "high-quality board"
- "proven track record" (prove it with a kept promise)
- "committed to creating value"

---

## Out-of-Scope Requests

If the invocation message asks for anything outside a subagent's specific scope — a fair value / price target, scenario probabilities, risk/reward, a Buy/Sell rating, position sizing — do NOT comply. Produce the standard report and add:
`Out-of-scope request received: [describe]. This belongs to the valuation module or the master synthesizer, not the management-governance module.`

---

## Inputs Every Subagent Receives

- `TICKER` — company ticker
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/management-governance/{NN}_{name}.md`
- `DATE` — today's date
- `UPSTREAM_INPUTS` — paths to outputs from agents this one depends on (in-module and cross-module; may be empty)

Read these from the invocation message. Never hardcode.

---

## Output Path Convention

`analyses/{TICKER}_{DATE}/management-governance/{NN}_{agent-name}.md`

---

## Chat Confirmation Format

Every subagent ends its turn with:

```
Agent: {name}
Output: {path}
Verdict: {agent-specific verdict line}
Biggest finding: {one line}
```

Add lines only if applicable:
- `Out-of-scope: ...`
- `Insufficient data: ...`
- `Partial data: ...` (name which data is missing and which cap was applied)

---

## Independent Reads

Each subagent reads `DATA_PATH` independently and extracts what it needs.
Subagents do NOT share an authoritative manifest.
The synthesizer reconciles disagreements at the end.

---

## What Good Looks Like

A good Management-Governance module output should let the master synthesizer answer five questions quickly:

1. Have these people delivered on what they promised?
2. Has capital been allocated to create per-share value, or to grow for its own sake?
3. Do incentives reward per-share value or empire-building?
4. Do insiders own meaningful stock, and are they buying or selling?
5. Are minority shareholders protected, and is management candid when results are bad?

---

## Subagent List & Execution Layers

Layer 0 (sequential, fail-fast):
- `00_governance-data-triage`

Layer 1 (sequential — the foundation):
- `01_management-and-track-record`

Layer 2 (parallel, all depend on `01`):
- `02_capital-allocation-scorecard`
- `03_incentives-and-compensation`
- `04_ownership-and-insider-behavior`
- `05_board-and-shareholder-rights`
- `06_candor-and-disclosure-quality`

Layer 3 (sequential, synthesizer):
- `99_management-governance-synthesis` (depends on all prior)

If an upstream output is missing, the dependent subagent notes it explicitly:
*"Upstream output missing: [name] — proceeding with available data."*
