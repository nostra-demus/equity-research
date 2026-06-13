---
description: Run ONE signal through the screener gauntlet — Gate 0 + Phase 0.1 (signal-gate), then Phase 1 (thesis-structure, edge-definition) and candidate-surfacing, gated by the routing contract. Self-discovers modules from .claude/agents/screener/*/99_*-synthesis.md.
argument-hint: SIG_ID — or a quoted headline/URL (an intake will be materialized)
allowed-tools: Read, Write, Glob, Grep, Bash, Task, WebSearch
---

You are the orchestrator for the screener swarm's signal pipeline. The argument is `$ARGUMENTS`.

Execute the steps below in order. Do not skip any.

---

## 1. Resolve today's date

Run `date +%Y-%m-%d` via Bash and capture as `<DATE>` (and `date -u +%Y-%m-%dT%H:%M:%SZ` as `<NOW>`).

## 2. Resolve the signal and its intake

Two argument shapes:

**A. An existing SIG_ID** (matches `^SIG-[0-9]{8}-[a-f0-9]{8}$`): verify `screener/runs/<SIG_ID>/intake.json` exists (`test -s`). If missing, STOP: "No intake.json for <SIG_ID> — launch from the cockpit, or pass a headline/URL so I can materialize one."

**B. A headline / URL / observation** (anything else): materialize the signal yourself:

1. Normalize the HEADLINE ONLY: lowercase, collapse whitespace, trim. Use the source URL **byte-for-byte as given** — do NOT lowercase, trim, or rewrite it (URL paths/queries are case-sensitive). Compute the id hash via Bash over THREE pipe-separated fields — normalized headline, verbatim source URL, date — leaving the middle field EMPTY when there is no source URL (two pipes still present). This must byte-match the cockpit's `sigIdFor()` in `ui/server/src/launcher.ts`, or the same event gets two SIG folders:
   `printf '%s' "<normalized>|<source_url or empty>|<DATE>" | shasum -a 256 | cut -c1-8`
   → `<SIG_ID>` = `SIG-<YYYYMMDD of DATE>-<8hex>`.
2. `mkdir -p screener/runs/<SIG_ID>`
3. Write `screener/runs/<SIG_ID>/intake.json` per `frameworks/screener/intake.schema.json`: signal_id; input_nature (`news_headline` for a headline, `human_prompt` for an observation with no source — set `human_prompt_note` verbatim); input_datetime `<NOW>`; headline; source_name + source_url when given (a bare URL: fetch nothing here — Gate 0 owns source checks; record the URL's domain as source_name candidate); requested_by `cli`.

Capture `<RUN_ROOT>` = `screener/runs/<SIG_ID>`.

## 3. Discover the screener modules and their order

Glob `.claude/agents/screener/*/99_*-synthesis.md`. Parse each `depends_on` from frontmatter; topo-sort (alphabetical tiebreak) exactly as `/research:full` does. Do NOT hardcode module names — today this yields signal-gate → thesis-structure → edge-definition → candidate-surfacing, derived.

## 4. Run each module via the screener pipeline, gated by the routing contract

**This step is RESUMABLE.** A re-launched run reuses everything a prior run already finished, so a human "Continue" after a stop picks up where it left off instead of redoing paid work. A fresh signal has an empty run root, so nothing is skipped and the full gauntlet runs.

For each module in order:

- **Already finished? Skip it.** If `<RUN_ROOT>/<MODULE>/99_<MODULE>-synthesis.md` exists and is non-empty (`test -s`), this module completed in a prior run — do NOT re-dispatch it. Still read its synthesis to extract the routing (below), so the gate decision is honored exactly as if it had just run, then move to the next module.
- **Otherwise, run it** via `frameworks/screener/SCREENER_PIPELINE.md` (which adapts `frameworks/MODULE_PIPELINE.md` — same dispatch/persist/verify mechanics, screener substitutions) with:
  - `<SIG_ID>`, `<DATE>`, `<MODULE>`, `<RUN_ROOT>`
  - `<CROSS_MODULE_CONTEXT>` — one sentence per completed upstream module: `<Dep> cross-module path: <RUN_ROOT>/<dep>/.` (first letter capitalized), or `none`.
  - Within an incomplete module you MAY skip an individual agent whose output file already exists AND is complete/well-formed (open it and confirm) — but when in ANY doubt, re-run it; and NEVER skip the module synthesis (99) of an incomplete module. (A partial file left by a killed prior run must be re-run, not trusted.)

After each module (whether just run or reused from disk), extract its routing (the SCREENER_PIPELINE grep on the synthesis — and for signal-gate ALSO check the 00 intake output first, which can terminate at Gate 0):

- Routing in the manifest's `routing.terminal` list → STOP the pipeline here. This is a recorded, valid outcome.
- Routing in `routing.continue` → next module.
- `candidate-surfacing` runs ONLY if edge-definition routed `provisional` or `full_machine`.
- Unknown routing → STOP, flag loudly in the report.

## 5. Write RUN_METADATA.md

At `<RUN_ROOT>/RUN_METADATA.md`: signal id, date, started/finished timestamps, repo SHA (`git rev-parse HEAD`), modules planned / completed / stopped-at, final routing, thesis_id (if Phase 1 ran), candidate count (if surfaced).

## 6. Verify state files

- `test -s <RUN_ROOT>/signal_payload.json` (whenever signal-gate completed its synthesis).
- If edge-definition ran: `test -s <RUN_ROOT>/thesis_record.json` AND `python3 -c "import json;assert json.load(open('<RUN_ROOT>/thesis_record.json'))['meta']['locked']"` — a completed edge-definition MUST leave a locked record.
- If candidate-surfacing ran: `test -s <RUN_ROOT>/candidates.json`.
- Always: `python3 scripts/update_board_index.py` (idempotent — ensures the board reflects the final state even after an early stop).

## 7. Commit and push to main

Per repo `CLAUDE.md` §25 git policy, through the serialized helper:

```
bash scripts/commit-run.sh "Screener signal: <SIG_ID> — <final routing>" -- "screener/runs/<SIG_ID>/" "screener/ledger/" "screener/board/"
```

Capture the SHA from `git rev-parse HEAD`.

## 8. Report

Print: the SIG_ID and headline; per-module outcome (completed / stopped, with each Routing line); the final routing + status_reason; materiality and edge scores where produced; thesis_id; candidates (rank, ticker, exposure) if surfaced; paths to the run folder and the synthesis files; the commit SHA.

---

## Hard rules

- Never hardcode module or agent names — discovery + frontmatter only.
- A terminal routing (watchlist_*, PARK, LOG, suppress, return_to_m0_2) is a SUCCESS of the system, not an error. Report it as the result.
- Never edit a locked thesis record. Never write outside `<RUN_ROOT>/`, `screener/ledger/`, `screener/board/`.
