#!/usr/bin/env python3
"""Creation-time gate for a newly staged append-only correction sidecar (DECISION_LEDGER.md §4a).

One definition, called from one place, so detection logic and enforcement cannot drift apart:

* ``scripts/commit-run.sh`` applies it to the exact Git index it is about to commit (``--select`` +
  ``--check``), the same two-step shape ``scripts/decision_publication_gate.py`` already uses for
  ``decision_record.json`` immediately above it in that script. Only WHICH staged paths are
  correction sidecars, and HOW one sidecar's declared ``superseded_by`` claim is judged, live here.

What is gated: ``analyses/<RUN>/corrections.json``, and only the ``superseded_by`` claim — the
sidecar's other fields (``errata``, ``metadata_recovery``) are read-time transforms with no chain to
walk and are not this gate's concern. This closes the gap PR #690 named as the next-most-valuable
target: check AN (§4a supersession integrity, ``scripts/supersession_integrity_checks.py``) already
validates that a ``superseded_by`` claim points at a real, complete, structurally valid replacement
— same ticker, a newer ``decision_date``, complete non-empty terminal artifacts, valid runtime
provenance where required — and that the chain of successive claims terminates on a genuinely live
record rather than dangling or cycling. Until now AN ran ONLY inside ``scripts/eval.py``, a post-hoc
grading pass nobody is required to run before a correction lands. A ``corrections.json`` is research
DATA (CLAUDE.md §25/§28): it commits straight to ``main`` through ``commit-run.sh`` with no PR
review, and a malformed sidecar would silently drop a run — or a whole chain of runs — from the
standing set every reader trusts (``scripts/ledger_records.py``'s ``load_standing_records()``,
``/research:track``, ``/research:calibrate``, ``/research:size``, and the live cockpit's
``GET /api/calls``), undetected until someone happened to run ``/research:eval`` afterward. Unlike
``decision_publication_gate.py``, a correction is never produced by an agent workflow and never
reaches the cockpit's sealed-publication path (no ``ui/server`` code writes ``corrections.json`` —
confirmed by inspection: it is authored by a human operator, or a future skill, and committed
through this same ``commit-run.sh`` chokepoint, since the branch ruleset makes that the only route
any data reaches protected ``main``). So there is no ``--records`` pre-seal mode and no
``launcher.ts`` twin to keep in sync — this gate is exercised only by the plain ``git add`` path.

Exit codes. The caller refuses on ANY non-zero exit: an unjudged sidecar is exactly what must not be
committed. ``--check``: 0 PASS (no sidecar / no supersession claim / a validated chain); 1 the
declared supersession is invalid (dangling, wrong ticker, not newer, incomplete replacement,
circular, or terminates on another unresolved supersession). ``--select``: 0.
"""

from __future__ import annotations

import argparse
import json
import os
import pathlib
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from supersession_integrity_checks import eval_an_supersession_integrity  # noqa: E402

# Byte-level full match, mirroring decision_publication_gate.py's TERMINAL_DECISION_PATH: selection
# can never fail on an oddly encoded path the way a decode step could.
CORRECTIONS_SIDECAR_PATH = re.compile(rb"analyses/([^/]+)/corrections\.json")


class GateError(RuntimeError):
    pass


def nul_fields(raw: bytes) -> list[bytes]:
    """Split NUL-separated fields, accepting either a NUL separator or a NUL terminator."""
    if raw.endswith(b"\0"):
        raw = raw[:-1]
    return raw.split(b"\0") if raw else []


def run_root_for(relative: bytes) -> str | None:
    m = CORRECTIONS_SIDECAR_PATH.fullmatch(relative)
    return f"analyses/{os.fsdecode(m.group(1))}" if m else None


def select(raw: bytes) -> bytes:
    # NUL-TERMINATED on the way out: commit-run.sh reads with `read -r -d ''`, which drops a final
    # field that has no terminator (matches decision_publication_gate.py's own select()).
    return b"".join(field + b"\0" for field in nul_fields(raw) if run_root_for(field) is not None)


def check(repo: pathlib.Path, staged_path: str, blob_file: str) -> int:
    run_root = run_root_for(staged_path.encode())
    if run_root is None:
        raise GateError(f"not a corrections.json sidecar path: {staged_path}")
    try:
        with open(blob_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError, ValueError) as error:
        # A malformed sidecar is tolerated everywhere else in this doctrine (ledger_records.py:
        # "a missing/malformed corrections.json is treated as 'no corrections' ... its absence never
        # changes a record") — it just never gets to claim a supersession. Refusing the COMMIT here
        # instead would make an author's typo unrecoverable without editing history, which §4a
        # forbids. Report and pass; only a validly-schemad, actually-declared supersession is judged.
        print(f"CORRECTIONS-PREWRITE-GATE: PASS — {staged_path} is not readable as JSON ({error}); "
              f"treated as no corrections, matching ledger_records.py's own tolerant read")
        return 0
    if not isinstance(data, dict) or data.get("schema") != "corrections/v1":
        print(f"CORRECTIONS-PREWRITE-GATE: PASS — {staged_path} is not a recognised corrections/v1 "
              f"sidecar — no supersession claim to check")
        return 0
    if not isinstance(data.get("superseded_by"), dict):
        print(f"CORRECTIONS-PREWRITE-GATE: PASS — {staged_path} declares no supersession")
        return 0
    # eval_an_supersession_integrity walks the chain via relative os.path lookups (ledger_records.py
    # does the same) — resolve against --repo so the verdict never depends on the caller's own CWD.
    os.chdir(repo)
    violations = eval_an_supersession_integrity(data, run_root)
    if violations:
        print(f"CORRECTIONS-PREWRITE-GATE: FAIL — {staged_path}: " + "; ".join(violations),
              file=sys.stderr)
        return 1
    target = data["superseded_by"].get("run_root")
    print(f"CORRECTIONS-PREWRITE-GATE: PASS — {staged_path}: superseded_by → {target!r} "
          f"validated (exists, complete terminal publication, chain terminates on a live record)")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n", 1)[0])
    parser.add_argument("--repo", default=".")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument(
        "--select", action="store_true",
        help="stdin: NUL-separated repository paths; stdout: the gated ones, NUL-terminated, in order",
    )
    mode.add_argument(
        "--check", nargs=2, metavar=("STAGED_PATH", "BLOB_FILE"),
        help="judge one staged corrections.json — its repo-relative path, and a file holding the "
             "exact staged blob bytes (never the mutable worktree file)",
    )
    return parser.parse_args()


def main() -> int:
    for stream in (sys.stdout, sys.stderr):
        stream.reconfigure(errors="backslashreplace")
    args = parse_args()
    repo = pathlib.Path(args.repo).resolve()
    try:
        if args.select:
            sys.stdout.buffer.write(select(sys.stdin.buffer.read()))
            sys.stdout.buffer.flush()
            return 0
        return check(repo, args.check[0], args.check[1])
    except GateError as error:
        print(f"CORRECTIONS-PREWRITE-GATE: FAIL — {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
