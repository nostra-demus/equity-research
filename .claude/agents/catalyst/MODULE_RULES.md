# Catalyst Module — Operating Rules

This file defines the operating rules specific to the **catalyst module** of the equity research system.

The repo root `CLAUDE.md` contains cross-cutting rules — git policy, global investing standards (especially **§17 Catalyst Discipline** and **§24 Avoid Big Risks**) — that apply to all modules.

Every subagent in this module reads BOTH the repo root `CLAUDE.md` AND this `MODULE_RULES.md` first, then runs its own task.

---

## Scope

This module answers one question:

> "What events, dated or windowed, could move this stock over the next ~12 months — and is the timing proven or vague?"

It is the dedicated, bottom-up implementation of `CLAUDE.md` **§17 Catalyst Discipline**. It runs **last** (after business-model, earnings, balance-sheet-survival, management-governance, and valuation) so it can aggregate catalysts from every module's evidence, not just earnings.

This module DOES:
- build a dated 12-month catalyst calendar across all catalyst categories
- for each catalyst, state the date/window, why it matters, the evidence it exists, the bullish trigger, the bearish trigger, and whether the timing is proven or vague
- score catalyst strength, timing visibility, and (inverted) catalyst risk

This module does NOT:
- value the company, assign scenario probabilities, compute risk/reward, or issue a rating — the **master synthesizer** owns that
- forecast the earnings number itself (that is the earnings module) — it times the *event*, not the print
- re-run any upstream module — it consumes their outputs

**Boundary with the master synthesizer (read this twice).** This module produces the catalyst calendar and the timing read. The master synthesizer's "Catalyst Calendar" section (§7) is instructed to DEFER to this module's synthesis when it is present — so make the calendar, the triggers, and the proven-vs-vague timing explicit and self-contained.

---

## Core Principles

1. **No date or window, no catalyst.** A catalyst without a date or a bounded window is not a catalyst — it is a hope. Record it as "undated / thematic," never as a dated catalyst. Banned: "catalyst soon," "in the coming quarters," "eventually."
2. **Evidence the catalyst exists.** Every catalyst cites the filing, schedule, transcript, or disclosure that proves the event is real and on the calendar. A catalyst nobody has scheduled is an inference, label it.
3. **Both triggers, always.** Every catalyst states BOTH the bullish trigger (what outcome helps) AND the bearish trigger (what outcome hurts). A one-sided catalyst is incomplete.
4. **Proven vs vague timing.** Separate catalysts with a hard date (results date, AGM date, maturity date, scheduled regulatory decision) from those with only a soft window. The score rewards proven timing and penalizes vague timing.
5. **Read catalysts through §24.** A hyped catalyst is not automatically bullish. A serial acquirer's next deal (§24 Filter 4) and a turnaround "inflection" without a delivered record (§24 Filter 2) are not conviction-lifting catalysts — flag them and do not let the calendar override the rejector filters. A fast-changing-industry product launch (§24 Filter 5) is a lower-confidence catalyst.
6. **Be blunt.** If there is no proven catalyst, say "No proven catalyst yet" (consistent with `CLAUDE.md` §17 and §7 variant-perception honesty). Do not manufacture one.

---

## Catalyst Category Checklist (scan every category; skip those that do not apply)

- **Earnings / guidance** — next results date, guidance updates, pre-announcements (from earnings module)
- **Capital allocation** — dividend change, buyback authorization/completion, special dividend, capital-return policy
- **M&A / structure** — acquisition, divestiture, spin-off, demerger, restructuring (read through §24 Filter 4)
- **Refinancing / balance sheet** — debt maturity, refinancing, rating review/action, covenant test (from balance-sheet-survival)
- **Regulatory / legal** — scheduled regulator decision, approval (e.g. USFDA), antitrust clearance, litigation milestone, license renewal
- **Policy / government** — tariff, subsidy, price control, election/budget decision (from external-dependency)
- **Operational** — product launch, capacity addition, project commissioning, major contract award/renewal
- **Governance** — AGM/EGM votes, board/CEO change, promoter action, activist involvement (from management-governance)
- **Market-structure** — index inclusion/exclusion, lock-up expiry, large share-count event, ADR/listing change
- **Cycle inflection** — commodity/rate/demand turn where a dated or near-dated signal exists (from external-dependency)

---

## Source Hierarchy (most → least trusted)

1. Annual / quarterly filings and exchange announcements (scheduled events, maturity tables, AGM notices, results-date calendars)
2. Notes to accounts, debt notes, regulatory-timeline disclosures
3. Upstream module outputs in this run (`analyses/{TICKER}_{DATE}/<module>/`)
4. Earnings transcripts and investor presentations (management-flagged events)
5. Credit-rating calendars / regulator schedules
6. User notes
7. Web sources — only for a scheduled date not in the pool (e.g. an exchange results-date calendar, a regulator hearing date). Label web-sourced dates as unverified, with the date pulled.
8. Your own inference — must be labeled *"Inference, not from filings."*

---

## Evidence Citation Format

Every "Evidence" cell uses `[Source, Period, Page or Section]`. Examples:
- `FY24 10-K, Note 13 (Debt maturities)`
- `AGM Notice, 2026-07-18`
- `Q2 FY26 transcript, prepared remarks (capex commissioning)`
- `analyses/{TICKER}_{DATE}/balance-sheet-survival/02_maturity-wall-and-refinancing.md`
- `Web: exchange results-date calendar, 2026-06-03 (indicative, unverified)`

Do NOT write "company filings" alone. Do NOT cite a date with no source.

---

## Scoring Rules

All scores are out of 100, whole numbers, bands per `CLAUDE.md` §12.

| Score | Direction | What it measures |
|---|---|---|
| Catalyst strength /100 | higher = better | How material, dated, evidenced, and asymmetric the catalyst set is |
| Timing visibility /100 | higher = better | How much of the calendar has proven dates vs vague windows |
| Catalyst risk /100 | **higher = WORSE** (inverted) | Degree to which the dated near-term catalysts skew bearish / downside |
| Data quality /100 | higher = better | Completeness of forward-looking, scheduled-event data |
| Overall usefulness /100 | higher = better | How useful this module is for the master synthesizer |

**Inverted scores are flagged explicitly** in every table header that uses them. Be strict: a high catalyst-strength score requires dated, evidenced, asymmetric catalysts — a thematic story does not qualify.

---

## Catalyst Verdict Categories

The synthesis agent must pick exactly one:

- **Dated, evidenced near-term catalysts** — at least one material catalyst with a proven date inside ~6 months and clear two-sided triggers
- **Catalysts exist but timing vague** — real potential events, but the timing is a soft window, not a date
- **Long-dated / low-visibility catalysts** — the events are real but >12 months out or low-probability of a near-term resolution
- **No proven catalyst yet** — nothing dated and evidenced; the thesis cannot lean on timing (per `CLAUDE.md` §17, this caps conviction at the synthesizer)
- **Insufficient data** — cannot assess the forward calendar from available data

---

## Score Cap Rules

| Missing / Weak Data | Score Cap |
|---|---|
| No scheduled-event data at all (no results date, no maturities, no AGM) | Timing visibility max 40; Overall usefulness max 60 |
| Catalysts are all undated / thematic | Catalyst strength max 50; verdict no better than "Catalysts exist but timing vague" |
| Upstream modules did not run (standalone, raw-data only) | Note the gap; Overall usefulness max 75 |
| A §24-flagged catalyst (serial M&A / unproven turnaround) is the main "bullish" catalyst | Do not let it lift Catalyst strength above 55; flag it |

If multiple caps affect the same score, use the most restrictive.

---

## Cross-Module Inputs

This module runs last under `/research:full` and reads every prior module. The orchestrator passes one `<Dep> cross-module path:` sentence per dependency. Parse the labels for the modules below; if any is absent, proceed on the data pool and say so.

- **earnings** — `05_beat-miss-setup`, `04_guidance-consensus`, `07_earnings-sensitivity` (next results, guidance dates, the variables that swing the print)
- **balance-sheet-survival** — `02_maturity-wall-and-refinancing`, `99` (refinancing events, distress timeline)
- **management-governance** — `05_board-and-shareholder-rights`, `02_capital-allocation-scorecard`, `01` (AGM votes, capital returns, M&A, succession)
- **valuation** — `05_reverse-dcf`, `07_scenario-and-fair-value` (what's priced in; the re-rating trigger)
- **business-model** — `10_external-dependency`, `11_capital-allocation-governance` (policy/regulatory/commodity catalysts; capital-return events)

If a cross-module file is missing, the affected agent proceeds independently and states:
*"{module} cross-module input not available — proceeding on this module's own read of the data pool."*

---

## Style Rules

- Plain English. Short sentences. Numbers and dates beat adjectives.
- Every catalyst → evidence in the same row, in the citation format above.
- Label all inference: *"Inference, not from filings."*

### Banned phrases

These may NOT appear unless paired with a specific date/window and evidence in the same sentence:

- "catalyst soon" / "near-term catalyst" (state the date or window)
- "in the coming quarters" / "eventually" / "in due course"
- "multiple catalysts ahead" (name them with dates)
- "re-rating opportunity" (state the trigger and the date)
- "inflection point" (state the evidence and the date)

---

## Out-of-Scope Requests

If the invocation asks for anything outside this module's scope — a fair value, scenario probabilities, risk/reward, a rating, position sizing — do NOT comply. Produce the standard report and add:
`Out-of-scope request received: [describe]. This belongs to the valuation module or the master synthesizer, not the catalyst module.`

---

## Inputs Every Subagent Receives

- `TICKER` — company ticker
- `DATA_PATH` — `data/{TICKER}/`
- `OUTPUT_PATH` — `analyses/{TICKER}_{DATE}/catalyst/{NN}_{name}.md`
- `DATE` — today's date
- `UPSTREAM_INPUTS` / cross-module context — paths passed in the invocation message (may be empty)

Read these from the invocation message. Never hardcode.

---

## Chat Confirmation Format

Every subagent ends its turn with:

```
Agent: {name}
Output: {path}
Verdict: {agent-specific verdict line}
Biggest finding: {one line}
```

Add lines only if applicable: `Out-of-scope: ...`, `Insufficient data: ...`, `Partial data: ...`.

---

## Subagent List & Execution Layers

Layer 0 (sequential, gate — does NOT fail-fast; "no proven catalyst" is a valid result):
- `00_catalyst-data-triage`

Layer 1 (the specialist):
- `01_catalyst-calendar`

Layer 2 (synthesizer):
- `99_catalyst-synthesis` (depends on all prior)

If an upstream output is missing, the dependent subagent notes it explicitly:
*"Upstream output missing: [name] — proceeding with available data."*
