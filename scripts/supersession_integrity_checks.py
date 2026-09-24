#!/usr/bin/env python3
"""§4a supersession-integrity detectors (CLAUDE.md §13 "never averaged away, never silently
absorbed"; DECISION_LEDGER.md §4a — the append-only correction layer) — check AN, plus the release-
gate-eligibility helper that consumes its result.

Side-effect-free, importable, doctrine logic — extracted from `scripts/eval.py` (check AN) so the
SAME detection function can run in TWO places instead of one, mirroring the established pattern
already used for every other check in this family (`rating_caps.py`, `headline_checks.py`,
`scenario_integrity_checks.py`, `calibration_gate_checks.py`):

1. **Retrospective** — `scripts/eval.py` imports these to grade already-committed runs (check AN),
   as it always has.
2. **Live, pre-commit** — `scripts/corrections_prewrite_gate.py`, called from `scripts/commit-run.sh`
   before ANY `analyses/<RUN>/corrections.json` reaches `main`, imports these to check a declared
   `superseded_by` claim BEFORE it commits, instead of relying on a human remembering to run
   `/research:eval` afterward.

WHY THIS MATTERS: a `corrections.json` sidecar is research DATA (CLAUDE.md §25/§28) — it commits
straight to `main` with no PR review, through the same `commit-run.sh` chokepoint as every other
data artifact. `scripts/ledger_records.py`'s `load_standing_records()` is the authoritative resolver
every reader trusts (`/research:track`, `/research:calibrate`, `/research:size`, and the live
cockpit's `GET /api/calls` via `ui/server/src/ledger-corrections.ts`): a `superseded_by` claim it
accepts silently DROPS a run from the standing set. A malformed, incomplete, dangling, or circular
supersession would corrupt the calibration scoreboard — the exact class of failure §13/§19 exist to
prevent — undetected until someone happened to run the retrospective harness. Until now, check AN
was that retrospective-only harness; this module makes the SAME check reachable at the one place
every corrections.json actually passes through before it can do that damage.

`eval_an_supersession_integrity` is a PRESENCE/STRUCTURE + CHAIN-VALIDITY check, not a truth check:
it cannot judge whether a stated `reason` is honest, only that the claimed replacement is a real,
complete, structurally valid publication (matching ticker, a newer `decision_date`, non-empty
terminal artifacts, valid runtime provenance where required) and that the chain of successive
`superseded_by` claims terminates on a genuinely live (non-superseded) record rather than dangling
or cycling.
"""
import json
import os

from ledger_records import supersession_target_violations


def _an_valid_sidecar(run_dir):
    """A run's corrections sidecar, but ONLY if it passes the schema gate the resolver applies
    (schema == 'corrections/v1'); else {} — so AN honors exactly the sidecars ledger_records honors."""
    try:
        with open(os.path.join(run_dir, "corrections.json")) as f:
            c = json.load(f)
        return c if (isinstance(c, dict) and c.get("schema") == "corrections/v1") else {}
    except Exception:
        return {}


def _an_terminal_replacement_violations(run_root, source_run_root=None):
    """Return why a supersession target is not a complete published correction.

    A targeted correction is not a second full run, so it does not invent RUN_METADATA or rebuilt
    module tiers. It must, however, carry every terminal user-facing artifact plus valid runtime
    provenance before it is allowed to retire the prior standing call.
    """
    if not source_run_root:
        return ["supersession source run root is unavailable"]
    return [f"supersession target {run_root!r} is not a valid terminal publication: {error}"
            for error in supersession_target_violations(source_run_root, run_root)]


def eval_an_supersession_integrity(corrections, source_run_root=None):
    """Check AN: an append-only corrections.json that declares `superseded_by` (DECISION_LEDGER §4a)
    must point at a real, existing run folder carrying a decision record, AND the supersession CHAIN
    from it must terminate on a LIVE (non-superseded) record — a dangling, circular (A→B→A), or
    chain-ends-on-another-superseded-run supersession would silently drop every call in the chain
    from the standing set with no live replacement. Returns None (no sidecar / no supersession → N/A)
    or a list of violations (empty = valid)."""
    if not isinstance(corrections, dict):
        return None
    sup = corrections.get("superseded_by")
    if not isinstance(sup, dict):
        return None
    tgt = sup.get("run_root")
    if not (isinstance(tgt, str) and tgt.strip()):
        return ["superseded_by present but carries no run_root"]
    tgt = tgt.strip()
    if not os.path.isdir(tgt):
        return [f"superseded_by.run_root {tgt!r} does not exist"]
    if not os.path.exists(os.path.join(tgt, "decision_record.json")):
        return [f"superseded_by target {tgt!r} has no decision_record.json"]
    # walk the chain to its terminal live record, detecting cycles
    seen, cur = set(), tgt
    while True:
        if cur in seen:
            return [f"supersession chain is circular at {cur!r} — no live replacement record"]
        seen.add(cur)
        nxt_sup = _an_valid_sidecar(cur).get("superseded_by")
        nxt = nxt_sup.get("run_root") if isinstance(nxt_sup, dict) else None
        if not (isinstance(nxt, str) and nxt.strip()):
            return _an_terminal_replacement_violations(cur, source_run_root)
        nxt = nxt.strip()
        if not (os.path.isdir(nxt) and os.path.exists(os.path.join(nxt, "decision_record.json"))):
            return [f"supersession chain: {cur!r} is superseded by {nxt!r} which does not exist"]
        cur = nxt


def eval_release_gate_eligible(has_run_metadata, supersession_result):
    """Only a complete standing run gates releases; valid corrected-away runs remain advisory.

    `supersession_result` is exactly eval_an_supersession_integrity's result: [] means a valid chain,
    None means no supersession, and a non-empty list is malformed authority that must fail closed.
    """
    valid_supersession = isinstance(supersession_result, list) and len(supersession_result) == 0
    return bool(has_run_metadata) and not valid_supersession
