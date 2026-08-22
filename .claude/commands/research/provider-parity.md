---
description: Run the frozen-input Claude/Codex analytical-parity release gate and evidence adjudication
argument-hint: <CLAUDE_RUN_ROOT> <CODEX_RUN_ROOT> <FREEZE_MANIFEST> <OUTPUT_DIR>
allowed-tools: Read, Glob, Grep, Bash, Write, Task
---

# Claude/Codex provider parity gate

Arguments: `$ARGUMENTS`

Require exactly four paths: an isolated Claude run root, an isolated Codex run root, the external
frozen-input receipt, and an output directory. Resolve them without changing either run root. Never use a
current/live data folder in place of the receipt. Never edit a decision record, research artifact, or
frozen source. Do not commit or push.

1. Read all four contracts and this whole command:
   - `frameworks/provider_parity_freeze.schema.json`
   - `frameworks/provider_parity_run_binding.schema.json`
   - `frameworks/provider_parity_execution_receipt.schema.json`
   - `frameworks/provider_parity_adjudication.schema.json`
   The freeze receipt must already have been created by `scripts/provider_parity_freeze.py` while both
   run roots were empty. A receipt reconstructed after either run is not admissible.
2. Require `<OUTPUT_DIR>` to be an existing real research-data directory. Run the deterministic
   comparison in release mode, saving the original comparison and asking the live cockpit supervisor to
   issue the adjudication capability at the same immutable boundary:

   `python3 scripts/compare_provider_runs.py <CLAUDE_RUN_ROOT> <CODEX_RUN_ROOT> --label-a Claude --label-b Codex --freeze-manifest <FREEZE_MANIFEST> --release-gate --live-supervisor-receipts --pretty --output <OUTPUT_DIR>/comparison.json --issue-adjudication-receipt <OUTPUT_DIR>/adjudication-execution.json --adjudication-template <OUTPUT_DIR>/adjudication-template.json`

   All three paths are create-only. Never replace, edit, copy over, or regenerate any of them. The
   supervisor derives the execution receipt from the current live attempt and binds the exact bytes of
   `comparison.json` and the freeze receipt. A child-authored provenance file or environment value is not
   release authority.

3. Interpret the exit code exactly:
   - `0`: the frozen-input and analytical gates pass and the live supervisor verified the no-difference
     receipt; report the saved comparison and execution-receipt paths.
   - `4`: the input binding is malformed or unproven; stop. Do not adjudicate.
   - `3`: a required analytical surface or deterministic scenario/return/target-math rule is defective;
     stop and report every `deterministic_blockers[]` row. These blockers cannot be adjudicated away.
   - `2`: material triggers require evidence adjudication; continue.
4. Spawn `Task(subagent_type="provider-parity-adjudicator")`. Give it the exact immutable
   `<OUTPUT_DIR>/comparison.json`, `<OUTPUT_DIR>/adjudication-execution.json`,
   `<OUTPUT_DIR>/adjudication-template.json`, freeze receipt, Claude root, Codex root, and the new output
   path `<OUTPUT_DIR>/adjudication.json`. The adjudicator must not rerun the comparator, select a different
   comparison, issue a second receipt, or alter any input. Wait for that one new adjudication file.
5. Re-run the deterministic command without overwriting the initial comparison:

   `python3 scripts/compare_provider_runs.py <CLAUDE_RUN_ROOT> <CODEX_RUN_ROOT> --label-a Claude --label-b Codex --freeze-manifest <FREEZE_MANIFEST> --release-gate --live-supervisor-receipts --comparison-artifact <OUTPUT_DIR>/comparison.json --adjudication <OUTPUT_DIR>/adjudication.json --pretty --output <OUTPUT_DIR>/release-result.json`

   `release-result.json` is also create-only. This asks the same live supervisor to verify its issued
   attestation, including the unchanged original comparison, freeze receipt, canonical supervisor
   manifest and attempt row, then verifies every evidence artifact's exact path, SHA-256, and locator.
6. Exit `0` only when every material trigger is source-supported. Exit `3` for any provider defect, `2`
   for any missing classification, and `4` for malformed or stale evidence. Any missed instruction,
   source, hard cap, Critical/High red flag, scenario-math rule, or required tool step blocks release.

The final response states the comparison id, result, every exact output path actually created (the
comparison, execution receipt, and adjudication template for a no-difference exit `0`; all five artifacts
after evidence adjudication), and every blocking trigger.
A supported material disagreement is not silently averaged away: if this was the first paired ticker, the
rollout still requires a second frozen paired ticker before Codex is enabled.
