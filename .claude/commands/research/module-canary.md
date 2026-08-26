---
description: Operator-only frozen-input module stage for the provider-parity full-run scheduler
argument-hint: MODULE TICKER RUN_ROOT FREEZE_RECEIPT
allowed-tools: Read, Write, Glob, Grep, Bash, Task
---

# Frozen provider-parity module stage

Arguments: `$ARGUMENTS`

This is a thin compatibility loader, not a second module prompt. It may run only when
`NOSTRA_COCKPIT_RUN=1` and the live cockpit supervisor supplied its publication capability. Require
exactly four whitespace-free arguments: `<MODULE> <TICKER> <RUN_ROOT> <FREEZE_RECEIPT>`. Require
`<MODULE>` to be a discovered research module with a canonical command at
`.claude/commands/research/<MODULE>.md`; never infer or hardcode a module roster.

Read the entire canonical module command, `frameworks/MODULE_PIPELINE.md`, the exact
`<RUN_ROOT>/.provider-parity-input.json`, and `<FREEZE_RECEIPT>`. Validate both JSON contracts with
`scripts/provider_parity_freeze.py`'s checked-in schemas. Require the binding to name this exact ticker,
run root, freeze receipt, provider runtime profile, and frozen decision date. Require the receipt's data
snapshot root to be the exact `data/<TICKER>` directory. Preserve the binding and all supervisor-owned
support paths byte-for-byte.

Execute the complete canonical module command with only these frozen-run substitutions, which take
precedence wherever the canonical command constructs a date, run root, input pool, context fallback, or
publication step:

- `<TICKER>` is the second argument. `<RUN_ROOT>` is the exact third argument. Never construct or write
  `analyses/<TICKER>_<today>`. The run date is the binding's frozen `decision_date`.
- Use only the receipt-bound frozen `data/<TICKER>` snapshot and its exact price anchor. Do not use web
  search, web fetch, a newer quote, a different data directory, or evidence from another analysis root.
- Cross-module context may use only completed declared dependencies already under this exact `<RUN_ROOT>`.
  Never fall back to a prior dated run. A missing input stays missing and the module's normal sufficiency
  and verdict-cap rules apply.
- Write only this canonical module's normal outputs under `<RUN_ROOT>/<MODULE>/` plus the shared
  deterministic `<RUN_ROOT>/_pool_extracts/` cache. The scheduler's `.defer_module_memos` marker means the
  module memo remains deferred to the terminal full-canary stage exactly as in a normal chained full run.
- Do not run git. Skip the canonical module command's commit step completely. Do not call
  `scripts/commit-run.sh` or the supervisor publication endpoint: intermediate module stages cannot publish.

Apply every evidence, math, rejection, sufficiency, layer-order, fail-fast, persistence, and post-write
validation rule from the canonical module command and shared pipeline unchanged. Do not return success
until every required specialist and synthesis artifact for this discovered module exists and passes the
canonical artifact validator. Report only the module, exact run root, and its validated synthesis path.
