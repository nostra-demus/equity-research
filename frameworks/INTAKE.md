# Document Intake — the scoped-rerun plan contract

Who reads this: the `/research:intake` command (`.claude/commands/research/intake.md`), the server
intake reader (`ui/server/src/intake.ts`), the cockpit intake surface, and any future swarm that
ships its own `intake` command. It defines how the engine turns **newly-arrived documents** into an
**intelligent, scoped rerun plan** — instead of the blunt "the whole run is stale, re-run
everything" default.

Why this exists: when a new document lands in a ticker's data pool (a filing, a channel-check PDF in
`external/<provider>/`, an expert-call note), the pool's newest-file date jumps and
`completion.ts stalenessOf()` marks **every** earlier-vintage module `stale`. That is safe but
blunt — a single distributor channel check usually bears on one or two orbs, not all six modules.
This contract lets the engine READ the new evidence and say "of the modules the floor flags stale,
here is the minimal set that actually needs re-running, and why." It is a generalisation of
`review-decisions.md` Step 11 (`memo_delta.changed_sections[]`), re-pointed to be **document-first**
and decoupled from the decision-ledger outcome review.

---

## 1. The one inviolable rule — augment the floor, never replace it

The staleness floor (`ui/server/src/completion.ts` `stalenessOf()` / `thesisPlan()`) is a deliberate
over-approximation: any pool file newer than a module's vintage → `stale`. It can over-flag, but it
**cannot** falsely call something fresh — that is its safety property (CLAUDE.md §11, §24).

An LLM document→orb mapper is a **judgment** that can false-negative (miss an orb the new data
actually invalidated). Therefore the intake plan is **advisory only**:

- It NEVER moves a module from `stale` to `done`. The floor's per-module `state` is unchanged and
  the stale badges stay visible.
- It only ever **narrows the human's attention** and **pre-fills** the rerun (drives the default
  selection of the existing `reuseOverride` knowing-keep set), and the "re-run everything stale"
  escape hatch is always present.
- **Fail toward blunt.** Low mapper confidence, an unvalidatable module/agent name, or a
  missing/over-budget analysis → the plan widens to blanket-stale. Never away from it.
- **Reruns cost money and stay human-approved.** The intake *analysis* is cheap and may run
  automatically; a *rerun* is only ever launched by an explicit human click (CLAUDE.md §24).

---

## 2. Where the plan lives

The command writes, into the **latest run root** it is invalidating (append-only, dated):

```
analyses/<TICKER>_<DATE>/intake/<SCAN_DATE>_intake_plan.json     the machine-readable plan
analyses/<TICKER>_<DATE>/intake/<SCAN_DATE>_intake_plan.md       the human-readable twin
```

Mirrors the proven `reviews/` pattern exactly: co-located with the run it is about, **never
overwritten** (`_v2`, `_v3`, … on a same-day collision), and swept into the audit dossier via the
`.md` twin. It is NOT written into the data pool (`data/`) — the pool is input evidence, and writing
engine output there would risk the `.nostradamus_output` recursion the delta scan guards against.

The server reads the latest `intake/*_intake_plan.json` under `findLatestRunRoot(ticker)`,
**re-validates and re-expands it authoritatively** (§4), and serves it at `GET /api/intake/:ticker`.

---

## 3. The `intake_plan.json` schema (v1.0)

```json
{
  "schema_version": "1.0",
  "ticker": "AMZN",
  "run_root": "analyses/AMZN_2026-07-04",
  "scan_date": "2026-07-12",
  "watermark": "analyses/AMZN_2026-07-04/final_thesis.md",
  "new_docs": [
    {
      "path": "data/AMZN/external/yipitdata/panel_q2.xlsx",
      "sha256": "…",
      "provider": "YipitData",
      "source_type": "alt_data_panel",
      "tier": 5,
      "as_of": "2026-06-30",
      "claims_summary": "Q2 NA online-store GMV +11% y/y, decelerating vs Q1 +14%.",
      "materiality_score": 72,
      "impact_direction": "negative",
      "entry_orbs": [
        { "module": "earnings", "agent": "revenue-drivers",
          "why": "The panel is the leading read on NA GMV, which revenue-drivers models directly (its WHAT-TO-READ lists alt-data panels).",
          "confidence": 0.8 }
      ]
    }
  ],
  "rerun_plan": {
    "materiality_gate": 60,
    "entry_orbs": [ { "module": "earnings", "agent": "revenue-drivers" } ],
    "commands": [
      { "command": "/research:rerun earnings revenue-drivers AMZN",
        "module": "earnings", "agent": "revenue-drivers",
        "cascade_modules": ["earnings","balance-sheet-survival","management-governance","valuation","catalyst"],
        "triggered_by": ["data/AMZN/external/yipitdata/panel_q2.xlsx"] }
    ],
    "note_only": [
      { "path": "data/AMZN/external/tegus/call_2026-07-02.txt", "reason": "tier-9 single expert call, colour only, materiality 38 < gate" }
    ]
  },
  "verdict": "scoped_rerun",
  "summary": "One alt-data panel (tier 5) materially decelerates the NA GMV read; scope to earnings/revenue-drivers + downstream. One expert-call note judged immaterial."
}
```

**Field notes**

- `run_root` / `watermark` — the run this plan invalidates and the `-newer` basis (its
  `final_thesis.md`). Both are repo-relative.
- `new_docs[]` — one row per document newer than the watermark. `provider` / `source_type` / `tier`
  / `as_of` come from the doc's `.source.json` sidecar or the extract manifest `provenance`
  (`frameworks/EXTERNAL_DATA.md`); a plain (non-external) filing has `external: false`-style nulls
  and a `tier` inferred from its document type (CLAUDE.md §4).
- `materiality_score` (0–100) + `impact_direction` (`positive | negative | mixed | neutral`) — same
  calibration as `review-decisions` Step 11 / `DECISION_LEDGER.md` §8, so the two surfaces stay
  comparable.
- `entry_orbs[]` — the specific orbs the document's evidence bears on, each with a plain-English
  `why` and a `confidence` (0–1). **Every `module`/`agent` name is discovered from the roster
  (`Glob .claude/agents/*/99_*-synthesis.md` + `[0-9][0-9]_*.md`), never guessed.**
- `rerun_plan.commands[]` — the derived, ordered `/research:rerun` commands. The command *proposes*
  `cascade_modules`, but **the server recomputes them authoritatively** from
  `roster.ts downstreamCascade` at read time (single source of truth — a hand-written cascade can
  never drift from the live DAG).
- `rerun_plan.note_only[]` — documents seen and judged immaterial (below the gate, or a tier-9
  single-source anecdote): recorded honestly, no rerun. `verdict: "note_only"` when nothing clears
  the gate; `"insufficient"` when the run/data can't support a judgment.

---

## 4. How the server consumes it (validation + re-expansion)

`ui/server/src/intake.ts` `readIntakePlan(ticker)` is the authoritative reader. It:

1. Finds the latest `intake/*_intake_plan.json` under `findLatestRunRoot(ticker)`; returns `null`
   when none exists (the cockpit then shows "no plan yet — analyze?").
2. **Validates every name against the discovered roster** (`listModuleNames` /
   `agentNamesForModule`). An `entry_orb` or command naming an unknown module/agent is **dropped**,
   and that document is widened to blanket-stale (a `widened` note), never emitted as a launchable
   bad command (fail-closed — the mapper cannot hallucinate a `/research:rerun badmodule …`).
3. **Recomputes `cascade_modules`** for each surviving command from `downstreamCascade(module,
   agent)` — the same expansion `/research:rerun` and admission use.

The plan the server serves is therefore always roster-consistent, even if the command drifted.

---

## 5. Materiality & tier gating (recap)

- Recommend a rerun only when `materiality_score` ≥ `materiality_gate` (default 60) AND the change
  invalidates inputs the orb relied on — not for every wiggle (identical to `review-decisions`
  Step 11).
- A **tier-9 single-source** anecdote (one channel check / one expert call, N=1) defaults to
  `note_only` — it can *raise a question* against a filing-anchored number but does not by itself
  force a rerun of it (CLAUDE.md §4; `EXTERNAL_DATA.md` §4). It still appears as a `new_doc` and the
  floor still marks the run stale; the *recommended action* is calibrated to the tier.
- A filing (tier 1–3) that changes a number an orb consumes clears the gate readily.

---

## 6. Zero-touch (CLAUDE.md §26)

No module or agent name is hardcoded anywhere in this contract or its server reader — the command
discovers the roster and reads each orb's own `description:` / `WHAT TO READ` / `depends_on`, and the
server validates/expands via `roster.ts`. A future swarm that ships its own `<ns>:intake` command
and writes the same schema into its run root gets the same surface for free.
