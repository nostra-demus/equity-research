# Earnings Module — Operating Rules

This file defines the operating rules specific to the **earnings module** of the equity research system.

The repo root `CLAUDE.md` contains cross-cutting rules — git policy, global investing standards — that apply to all modules.

Every subagent in this module reads BOTH the repo root `CLAUDE.md` AND this `MODULE_RULES.md` first, then runs its own task.

---

## Scope

This module answers one question:

> "What is the earnings setup for the next 3–12 months — is it accelerating, stable, decelerating, inflecting, or unclear?"

This module does NOT:
- produce valuation, price targets, or fair-value estimates
- give a Buy/Sell/Hold rating
- size a position or produce portfolio weights
- build bull/base/bear financial models

---

## Core Principles

1. **No source = no claim.** If something cannot be verified from the data pool, write: *"Not proven from available data."*
2. **Drivers, not descriptions.** Don't describe what earnings were — identify what MOVES them.
3. **Segment-level where possible.** Consolidated numbers hide mix effects. Decompose by segment when disclosure allows.
4. **Filings beat decks.** When sources disagree, the more conservative regulated filing wins.
5. **Be blunt.** No vague positives without evidence in the same sentence.

---

## Source Hierarchy (most → least trusted)

1. Audited annual filing (10-K / 20-F for US; Annual Report for India; local annual report elsewhere)
2. Interim / quarterly filing (10-Q / 6-K for US; quarterly financial results filed to NSE/BSE for India; local equivalent)
3. Earnings transcripts
4. Investor presentations
5. Capital IQ / Bloomberg / FactSet exports
6. User notes
7. Web sources (only if filings missing)
8. Your own inference — must be labeled *"Inference, not from filings."*

When the deck is bullish and the filing is cautious, trust the filing.

---

## Transcript Sourcing & Fallback (Hard Rule — the management-commentary source)

The "earnings transcript" role (management driver detail, guidance nuance, Q&A colour) is filled by the BEST available call-derived source. These candidates are NOT one linear tier — **route by ROLE**, because they are strong at opposite things:

- **Numbers / reported figures / official guidance figures** — anchor to the PRIMARY document: the audited filing, then the quarterly filing, then the company's own **earnings press release / results intimation** (SEBI LODR Reg 30 in India; 8-K/6-K in the US; RNS elsewhere). A number is cited from — and verified against — the primary doc, NEVER published on a third party's authority (§5).
- **Management commentary / drivers / qualitative guidance** — use the richest CALL-derived source, in this order:
  1. **Verbatim transcript** (CIQ / company earnings-call transcript) — the primary record of the call, incl. Q&A. Full trust.
  2. **Sell-side / analyst earnings note used as a transcript proxy** (a broker "Earnings Call Insight / Summary") — a *paraphrase of the actual call*, so for driver/commentary colour it is DIRECTIONALLY BETTER than a press release (which is management's positive-outlook spin and thin on driver detail). Use it — as an unverified, verdict-stripped, secondary paraphrase (rules below).
  3. **Company earnings press-release outlook** — the primary-but-curated fallback when no call-derived source exists.
- **Tone / candor** (owning misses, Q&A evasiveness, promotional vs conservative) — **verbatim transcript ONLY.** NEVER read tone or candor from a paraphrase or a press release: an analyst's summary reflects the analyst's selection, not management's words. If only a proxy / press-release exists, tone/candor is *Not assessable* and the candor read is capped (management-governance `06`).

### Using a sell-side / analyst note as a transcript proxy

A sell-side earnings note is a HYBRID: a **directional verdict block** bundled with a **paraphrase of the call**. Handle the two parts oppositely:

- **STRIP the verdict — never ingest or cite it (§24).** Drop and never carry forward the analyst's Rating (BUY/SELL/HOLD), Target Price, Upside/Downside, and their beat/miss framing ("vs *our* estimate of X"). The engine forms its own verdict; a sell-side recommendation is banned marketer input (§21/§24), not evidence. (Extraction stays verbatim per §27 — the note is transcribed whole; the STRIP happens here, at the reading layer, not in the extractor.)
  - *Worked example (illustrative and FICTIONAL — invented broker, company, and figures; a teaching placeholder that must NEVER be cited or carried into any analysis as evidence):* a note "Acme Securities — Equity Research, Acme Developers Q4" quotes `Current Price 100 / Target Price 120 / Upside +20% / Rating BUY` and "net profit … *higher than our estimate of 900 Mn*". STRIP all of that. KEEP the note's **"Earnings Call Summary"** bullets *from that same Q4 note* — e.g. property sales up mid-teens YoY, order backlog up ~40%, a units-under-construction count — as *management commentary via the call*, each cross-checked against the actual results. (Do NOT pull a detail from a different quarter's note into this one — that would be the §15 period-mix the whole rule guards against. These placeholder numbers are not real data; they exist only to show the STRIP-vs-KEEP split and may never appear as evidence.)
- **Label provenance honestly (§5).** Cite as `<Broker> "Earnings Call Insight", 4Q25 (paraphrasing the earnings call; unverified)` — NEVER as a verbatim transcript (we do not have the words) and NEVER under a filing's name. A NUMBER is cited from the filing / press release where it was verified.
- **Flag the selection bias.** A sell-side summary foregrounds what supports its own (stripped) call — corroborate any material commentary against the filing / MD&A before it lifts a conclusion.

**A sell-side proxy is NOT a verbatim transcript for sufficiency or caps:** it fills the *commentary* role (verdict-stripped) but is weaker than a real transcript — see the score cap below. It does NOT satisfy the tone/candor requirement.

---

## Evidence Citation Format

Every "Evidence" cell uses this format:

`[Source, Period, Page or Section]`

Examples:
- `FY24 10-K, p.42`
- `Q2 FY26 transcript, prepared remarks`
- `FY24 Annual Report, Note 18`
- `Q3 FY26 investor deck, slide 12`
- `Capital IQ export, FY23 consensus`
- `BSE filing, Oct 2025`

Do NOT write "company filings" or "annual report" alone — those are not citations.

---

## Jurisdiction-Aware Sourcing (Hard Rule)

This module follows CLAUDE.md §27. The US form names in this file and its agents (10-K, 10-Q, 8-K, 20-F/6-K, Form 4) are EXAMPLES, not requirements. Detect the listing jurisdiction from triage `00` and read/cite the local equivalent. An Indian company is the default-likely case, not an edge case.

- **India / SEBI-LODR equivalents for THIS module:** the quarterly trend comes from the **quarterly financial results** (SEBI LODR Reg 33, limited-review) filed to NSE/BSE; the full-year financials come from the **Annual Report** (Board's Report + audited financials + Auditor's Report + Notes); guidance comes from **stock-exchange intimations (SEBI LODR Reg 30) and results/investor presentations**; management tone and driver detail come from **earnings-call transcripts**.
- **Other jurisdictions:** use the local annual report, the local interim/quarterly report (e.g. UK interim via RNS), local exchange announcements, and the earnings call.
- **State the reporting standard** (US GAAP / IFRS / Ind AS) on the numbers — it changes how revenue, leases, and provisions read, so never compare across standards silently. Report in the company's own currency; any cross-currency figure carries its FX date and rate.
- **Never mark a non-US company's data "missing"** because a US form is absent when the local equivalent exists — that is a bad-extraction error (§20), not a real data gap.

---

## Calculation Standards

1. Always state the reporting currency.
2. Always state whether numbers are reported, adjusted, or company-defined.
3. Never mix reported EBITDA and adjusted EBITDA without labeling.
4. Growth rates must be computed as: `(current period − prior period) / prior period`.
5. Margin change must be shown in basis points where possible.
6. FCF must be defined as: `CFO − total capex` unless the company provides a better disclosed definition.
7. Capex sign convention: if capex is shown as negative cash flow, use absolute value when calculating FCF.
8. Net debt must be: `total debt − cash and equivalents` unless the company defines it differently.
9. If fiscal calendars differ across data sources, explicitly reconcile them.
10. If a metric comes from Capital IQ, Bloomberg, or FactSet, label the source and "data as of" date.
11. Every bridge/decomposition table (the margin bridge, the revenue growth decomposition) is a
    driver-attribution claim and follows the rule below — it is not exempt because the number lives in a
    table instead of a sentence.

---

## Driver Attribution — Show the Arithmetic, Name the Residual (§15)

Margin and revenue bridges are driver stories, so this is where the module is most likely to assert a
cause it never computed. Root `CLAUDE.md` §15 requires any driver-attribution claim — a move explained by
a driver AND a sensitivity — to print its own arithmetic, carry the sensitivity's own basis, and state the
unexplained residual. In this module that means the Margin Bridge (`03_margin-drivers` §7) and the Revenue
Growth Decomposition (`02_revenue-drivers` §6):

- **Show the derivation, not just the bps/pp figure.** Where a component's contribution is derived from a
  quoted sensitivity (e.g. "COGS is ~60% of revenue, so an 8% input-cost rise costs ~480bps of gross
  margin"), print that multiplication in the table or the line beneath it — do not assert the bps number
  on its own authority.
- **A sensitivity carries its basis like a currency figure carries its FX rate.** A cost ratio, pass-through
  lag, or elasticity is measured against a specific base (last period's mix, this period's mix, consolidated
  vs segment-level) — name which, and refuse to apply a ratio measured on one base to a different one
  (e.g. using last year's revenue mix to weight this year's cost change).
- **Reconcile the bridge to its own Total row.** Sum the listed components and compare to the stated Total
  margin/revenue change. Whatever gap exists is the residual — it belongs in the table (the "Other" row,
  quantified) or a stated line beneath it, never rounded away into a component it doesn't belong to.
- **The adjective must match the number.** "Largely driven by", "the main driver", "explains the bulk of"
  require the printed arithmetic to clear roughly half the observed change. Below that, say what the driver
  actually explains and flag the rest as unexplained.
- **A large residual is the finding, not a caveat.** A bridge that is mostly "Other" means the module does
  not yet know what moved the number — say so plainly in Section 8's single-biggest-driver paragraph
  (`03_margin-drivers`) or Section 7 (`02_revenue-drivers`), since a "biggest driver" claim resting on a
  bridge that doesn't reconcile is exactly the false-confidence defect §15 exists to prevent.

*The miss this rule exists for (`CLAUDE.md` §15):* a GOLD dossier explained a 25.1% price correction with a
50bp real-yield move at a nominal-yield sensitivity — the wrong basis made the coefficient applicable, and
the arithmetic it never performed (2 × 1.75% ≈ $196, ~14% of the fall) would have shown "accounts for the
bulk of" was false by a factor of seven. A margin or revenue bridge that quotes a cost ratio or elasticity
without doing the multiplication, or that lets "Other" absorb a large gap silently, is the same error in a
different table.

**Mechanical check (`scripts/eval.py` check BE).** The reconciliation above is enforced, not merely
instructed: `02_revenue-drivers` §6a closes with a standalone `RF-EARN-001` tag line, and
`03_margin-drivers` §7a closes with a standalone `RF-EARN-002` tag line, each in one of exactly two
forms — `RF-EARN-00N: {label} reconciled — explained {N}{unit}, residual {M}{unit}, total {T}{unit}` or
`RF-EARN-00N: {label} not attempted — {reason}`. Check BE (`scripts/rating_caps.py`,
`eval_be_driver_attribution_residual`) verifies the tag is present whenever the specialist ran at all —
unlike a conditional-trigger cap, Section 6/6a and 7/7a are standard parts of every run, so tag absence
is itself a violation — and, for the reconciled form, arithmetically re-derives that explained + residual
equals the stated total (a 1.0-unit rounding tolerance). It runs both retrospectively (`eval.py all`) and
live, pre-publish, in `/research:full` Step 10B.1, mirroring how check BB already mechanizes the sibling
§16 Sector Cycle Reality Test. This closes the exact hole the rule above existed to prevent: a residual
silently omitted, or a "biggest driver" claim shipped over a bridge that never reconciled, with nothing in
the pipeline to catch it before the thesis published.

---

## TTM Rule

If quarterly data is available, agents should calculate or extract TTM revenue, EBITDA, EBIT, EPS, CFO, capex, and FCF where useful.

TTM = latest four reported quarters.

If quarterly data is not available, state: *"TTM not available from current data."*

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

### Earnings Module Scores

| Score | Direction | What it measures |
|---|---|---|
| Earnings clarity /100 | higher = better | How clearly we can model the next 12 months |
| Earnings quality /100 | higher = better | How clean, repeatable, and cash-backed the earnings are |
| Consensus setup /100 | higher = more beatable | Whether the market's bar is set low enough to beat |
| Earnings volatility /100 | **higher = WORSE** (inverted) | How sensitive earnings are to small input changes |
| Data quality /100 | higher = better | Completeness of earnings-relevant data |
| Overall usefulness /100 | higher = better | How useful this module is for the final synthesizer |

**Inverted scores are flagged explicitly** in every table header that uses them.

Be strict. High scores require evidence. Default to the middle band when uncertain. The synthesis verdict-block scores aggregate the underlying section tables — use judgment, do not blindly average.

---

## Earnings Verdict Categories

The synthesis agent must pick exactly one:

- **Earnings accelerating** — drivers support beat risk, consensus bar looks beatable
- **Earnings stable** — no major change in trajectory, consensus roughly right
- **Earnings decelerating** — drivers weakening, miss risk elevated
- **Earnings inflecting — positive** — direction change from decline to growth; specify the driver
- **Earnings inflecting — negative** — direction change from growth to decline; specify the driver
- **Mixed earnings setup** — conflicting signals across revenue, margins, and quality
- **Insufficient data** — can't form a view

---

## Partial-Data Rules

When specific data is missing, the affected agents must cap their output as described:

| Missing Data | Affected Agents | Rule |
|---|---|---|
| No consensus / estimate data | 04, 05, 99 | 04 produces guidance-only read; 05 caps beat/miss setup at "Unclear"; 99 caps consensus setup score |
| No quarterly data (only annual) | 01, 02, 03, 06 | Skip seasonality and QoQ analysis; mark QoQ trends as "Not available" |
| No VERBATIM transcript, but a sell-side / analyst earnings note IS present | 02, 03, 04 | Use the note as a VERDICT-STRIPPED transcript proxy for commentary (Transcript Sourcing & Fallback rule): drivers/guidance colour from its call-summary, numbers from the primary doc, tone/candor NOT assessable. The tone/candor limitation caps the candor read in management-governance `06`, NOT earnings `06` (cash conversion / accruals / non-GAAP), which a paraphrase does not touch |
| No call-derived source at all (no transcript AND no sell-side proxy) | 02, 03, 04 | Management commentary unavailable; work from the earnings press release / filings and flag the limitation |
| No segment-level P&L | 02, 03, 99 | Segment decomposition skipped; consolidated-only read with limitation flagged |
| No cash flow statement | 06, 99 | Earnings quality capped; cash conversion marked "Unavailable" |
| No current price | 99 | Do not discuss stock reaction precision; earnings-only verdict |

---

## Score Cap Rules

When data is missing or weak, these hard caps override the agent's own scoring. The synthesis agent applies all applicable caps.

| Missing / Weak Data | Score Cap |
|---|---|
| No quarterly data | Earnings clarity max 60 |
| No consensus / estimate data (genuinely absent — NOT merely stale) | Consensus setup max 30 |
| Consensus present but stale (data-as-of predates the latest reported quarter) | Cap via the named triggers (e.g. no-revision-history) plus an explicitly-labeled discretionary staleness haircut — do NOT borrow the no-consensus max-30 value, which would read as "consensus absent" |
| No cash flow statement | Earnings quality max 45 |
| No earnings transcript AND no sell-side proxy | Earnings clarity max 70 |
| Transcript role filled ONLY by a sell-side proxy (no verbatim) | Earnings clarity max 70 — equal to the no-call/press-release cap above, NEVER below it (the proxy is directionally better than a press release and every NUMBER is still anchored to the primary doc, so it cannot make the read *less* clear than having no call colour at all); still capped below a verbatim transcript. Every guidance/driver read from it flagged "via unverified sell-side paraphrase" and cross-checked to the primary doc |
| No segment-level P&L for multi-segment business | Earnings clarity max 70 |
| No revision history | Consensus setup max 60 |
| No sensitivity disclosures and only inferred sensitivities | Earnings volatility confidence must be Low |
| Conflicting sources not reconcilable | Overall usefulness max 65 |

---

## Cross-Module Inputs

The earnings module optionally reads outputs from previously-run modules:

- `analyses/{TICKER}_{DATE}/business-model/03_segment-map.md` — segment structure
- `analyses/{TICKER}_{DATE}/business-model/06_value-chain.md` — pricing power context
- `analyses/{TICKER}_{DATE}/business-model/10_external-dependency.md` — external variable identification

If these files are missing, the earnings module proceeds independently and each affected agent states:
*"Business-model module not available — segment decomposition and external variable identification based on this module's own read."*

---

## Segment-Level Rule

Do NOT add a separate segment-earnings agent. Instead, mandate inside `02_revenue-drivers` and `03_margin-drivers`:

- If business-model `03_segment-map.md` exists, read it and decompose revenue/margin drivers by segment.
- If the company is single-segment (>85% from one segment), state that and proceed at consolidated level.
- If segment-level P&L is not disclosed, say so explicitly and do not guess.

---

## Cycle-Position Rule (Hard Rule)

For any business with a demand or margin cycle (auto/CV, commodities, capital goods, lenders, real estate, or anything the business-model `10_external-dependency` output flags as cyclical/policy-driven — or, if that output is unavailable, by inference), `02_revenue-drivers` and `03_margin-drivers` must each state **where in the cycle the latest reported period sits — peak / mid / trough — with evidence** (e.g. volumes or margins vs the prior peak and prior trough, a decade-high market share, replacement-cycle front-loading). Any one-time policy or macro tailwind in the latest period (a GST/tax-rate change, a rate-cut-driven demand pull-forward, a subsidy) must be **labelled as a one-time tailwind, not run-rate**, and the driver's direction must reflect that it can reverse. State plainly when the latest volumes/margins are NOT a normalised run-rate.

- **Why this matters (downstream):** the DCF terminal margin, the valuation bear case, the leverage denominator, and the moat all inherit this read — if the cycle position is not stated here, those modules treat a peak as a baseline.
- **Reconcile, don't diverge:** this read should agree with the business-model `10_external-dependency` cyclicality assessment; if they differ, flag it.
- **Young entity:** if the company has less than one full cycle of standalone history (e.g. a recent demerger/IPO), infer the cycle position from the predecessor entity, the segment, or industry history, and say which.
- **Evidence-based only:** cite the cycle position from the data; do not manufacture a downturn the history does not show.

---

## Style Rules

- Plain English. Short sentences.
- Plain enough for a non-finance reader (CLAUDE.md §21): use the simplest word that keeps the meaning, and the first time a finance term appears (e.g. EBITDA, FCF, basis points, cash conversion) keep the term and its number but add a short plain meaning in a clause. Plain is not vague — never drop a number or a citation.
- Every important claim → evidence in the same paragraph or table row, in the citation format above.
- Numbers beat adjectives. If you can quote a number from a filing, do.
- Label all inference: *"Inference, not from filings."*

### Banned phrases

These phrases may NOT appear unless paired with specific evidence in the same sentence:

- "strong fundamentals"
- "well positioned"
- "robust growth"
- "attractive opportunity"
- "monitor closely"
- "best-in-class"
- "industry-leading"
- "on track"
- "broadly in line"
- "comfortable with estimates"

---

## Out-of-Scope Requests

If the invocation message asks for anything outside a subagent's specific scope — valuation, target price, scenarios, ratings, forecasts, trade ideas — do NOT comply. Produce the standard report and add:
`Out-of-scope request received: [describe]. Route to the appropriate specialist.`

---

## Inputs Every Subagent Receives

- `TICKER` — company ticker
- `DATA_PATH` — exact filesystem evidence root injected by `MODULE_PIPELINE`; cite files under it with the logical label `data/{TICKER}/...`
- `GENERATION_ROOT` — exact immutable extraction generation injected by `MODULE_PIPELINE`; all manifest, corpus, CIQ, relationship, and extract reads stay inside it
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/earnings/{NN}_{name}.md`
- `DATE` — today's date
- `UPSTREAM_INPUTS` — paths to outputs from agents this one depends on (may be empty)

Read these from the invocation message. Never hardcode.

---

## Output Path Convention

`analyses/{TICKER}_{DATE}/earnings/{NN}_{agent-name}.md`

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

Each subagent reads `DATA_PATH` independently and extracts what it needs from the same admitted evidence snapshot.
Subagents share one authoritative immutable `GENERATION_ROOT` manifest but reach their analytical conclusions independently.
The synthesizer reconciles disagreements at the end.

---

## What Good Looks Like

A good Earnings module output should let the master synthesizer answer five questions quickly:

1. Are earnings accelerating, stable, decelerating, or inflecting?
2. What is the single biggest driver of the next 3–12 months?
3. Is consensus easy or hard to beat?
4. Are earnings backed by cash?
5. Which one variable can break the setup?

---

## Subagent List & Execution Layers

Layer 0 (sequential, fail-fast):
- `00_earnings-data-triage`

Layer 1 (parallel):
- `01_historical-financials`
- `04_guidance-consensus`

Layer 2 (parallel, all depend on `01_historical-financials`):
- `02_revenue-drivers`
- `03_margin-drivers`
- `06_earnings-quality`

Layer 3 (parallel):
- `05_beat-miss-setup` (depends on 01, 02, 03, 04)
- `07_earnings-sensitivity` (depends on 01, 02, 03)

Layer 4 (reviews the specialist layer — depends on 05/06/07):
- `08_earnings-red-flags` (reviews ALL upstream earnings outputs and requires 05 and 07 as inputs, so it must run AFTER them — not alongside them in Layer 3)

Layer 5 (sequential, synthesizer):
- `99_earnings-synthesis` (depends on all prior)

If an upstream output is missing, the dependent subagent notes it explicitly:
*"Upstream output missing: [name] — proceeding with available data."*
