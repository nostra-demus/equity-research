#!/usr/bin/env python3
"""Creation-time gate for newly published terminal research decision records.

One definition, two callers, so they cannot drift:

* ``scripts/commit-run.sh`` applies it to the exact Git index it is about to commit (``--select`` +
  ``--check``). It keeps its own index handling and its own messages; only WHICH staged paths are
  terminal decision publications, and HOW one record's bytes are judged, live here.
* The cockpit supervisor applies it to a frozen publication snapshot BEFORE that snapshot is sealed
  into an immutable ready receipt (``--records``). A sealed record this gate rejects can never
  publish: commit-run.sh reaches the same verdict on the same bytes at every retry.

What is gated: a top-level research decision record, ``analyses/<RUN>/decision_record.json``, and
only when this publication would actually change it. The exact path shape excludes module outputs,
reviews, calibration files, and the commodity swarm's records (``commodity/runs/**`` has its own
pre-archive validator and orb roster and is deliberately not routed through this gate). A record
byte-identical to ``HEAD`` is never regraded: history is immutable, and today's live orb roster must
not retro-fail a decision that was valid when it was published.

How a record is judged: ``python3 scripts/eval.py --data-needs-prewrite <record>`` with the
repository as the working directory (eval.py resolves the live ``.claude/agents`` roster relative to
it). The verdict therefore depends on the record's bytes AND on the checked-out program: a deploy
that renames an orb can change it for the same bytes.

Exit: 0 PASS; 1 a record was rejected; 2 the gate could not reach a verdict (callers refuse on any
non-zero exit: an unjudged record is exactly what must not be committed or sealed).
"""

from __future__ import annotations

import argparse
import os
import pathlib
import re
import subprocess
import sys


# Bytes, not text: this is the byte-exact port of commit-run.sh's former
# `[[ "$STAGED_PATH" =~ ^analyses/[^/]+/decision_record\.json$ ]]`. A byte-level full match is total, so
# selection itself can never fail on an oddly encoded path the way a decode step could.
TERMINAL_DECISION_PATH = re.compile(rb"analyses/[^/]+/decision_record\.json")


class GateError(RuntimeError):
    pass


def is_terminal_decision_path(relative: bytes) -> bool:
    return TERMINAL_DECISION_PATH.fullmatch(relative) is not None


def nul_fields(raw: bytes) -> list[bytes]:
    """Split NUL-separated fields, accepting either a NUL separator or a NUL terminator."""
    if raw.endswith(b"\0"):
        raw = raw[:-1]
    return raw.split(b"\0") if raw else []


def run_validator(repo: pathlib.Path, record: str, capture: bool) -> subprocess.CompletedProcess:
    # `python3` by name and `scripts/eval.py` relative to the repository: the identical invocation
    # commit-run.sh used to spell inline as `(cd "$TOP" && python3 scripts/eval.py --data-needs-prewrite …)`.
    try:
        return subprocess.run(
            ["python3", "scripts/eval.py", "--data-needs-prewrite", os.path.abspath(record)],
            cwd=str(repo), capture_output=capture,
        )
    except OSError as error:
        raise GateError(f"cannot launch the data-needs validator: {error}") from error


def git(repo: pathlib.Path, *args: str) -> bytes:
    try:
        return subprocess.check_output(["git", "-C", str(repo), *args], stderr=subprocess.PIPE)
    except (OSError, subprocess.CalledProcessError) as error:
        detail = ""
        if isinstance(error, subprocess.CalledProcessError):
            detail = error.stderr.decode("utf-8", "replace").strip()
        raise GateError(detail or f"git {' '.join(args)} failed") from error


def differs_from_head(repo: pathlib.Path, relative: bytes, frozen: str) -> bool:
    """Would committing these frozen bytes at this path change HEAD?

    commit-run.sh answers this with `git diff --cached` after staging. A supervisor snapshot is always
    staged as a regular 100644 blob whose OID is `git hash-object -- <frozen file>`, so the staged entry
    differs from HEAD exactly when HEAD's tree entry is anything other than that mode, type and OID.
    """
    oid = git(repo, "hash-object", "--", frozen).strip()
    try:
        path_text = relative.decode("utf-8", "strict")
    except UnicodeError as error:
        raise GateError("publication path is not UTF-8") from error
    listed = git(repo, "--literal-pathspecs", "ls-tree", "-z", "HEAD", "--", path_text)
    return [entry for entry in listed.split(b"\0") if entry] != [b"100644 blob " + oid + b"\t" + relative]


def select(raw: bytes) -> bytes:
    # NUL-TERMINATED on the way out: commit-run.sh reads with `read -r -d ''`, which drops a final
    # field that has no terminator.
    return b"".join(field + b"\0" for field in nul_fields(raw) if is_terminal_decision_path(field))


def check(repo: pathlib.Path, record: str) -> int:
    # Output is inherited, not captured: commit-run.sh's stdout/stderr stay byte-for-byte what the
    # inline eval call produced.
    code = run_validator(repo, record, capture=False).returncode
    return code if 0 <= code <= 255 else 1


def records(repo: pathlib.Path, raw: bytes) -> int:
    fields = nul_fields(raw)
    if not fields or len(fields) % 2 or not all(fields):
        # An empty list would pass vacuously; a malformed one has lost track of which bytes belong to
        # which path. Both are caller bugs and must never become a PASS that can be sealed.
        raise GateError("expected NUL-separated (publication path, frozen bytes file) pairs")
    checked = 0
    for relative, frozen_raw in zip(fields[0::2], fields[1::2]):
        if not is_terminal_decision_path(relative):
            continue
        frozen = os.fsdecode(frozen_raw)
        if not os.path.isfile(frozen):
            raise GateError(f"frozen bytes are not a readable file for {relative.decode('utf-8', 'replace')}")
        if not differs_from_head(repo, relative, frozen):
            continue
        result = run_validator(repo, frozen, capture=True)
        checked += 1
        if result.returncode != 0:
            # Name the record first: a caller that truncates this output must still learn which file.
            print(
                "DECISION-PUBLICATION-GATE: FAIL — data-needs prewrite rejected "
                f"{relative.decode('utf-8', 'replace')}",
                file=sys.stderr,
            )
            sys.stderr.write(result.stderr.decode("utf-8", "replace") or result.stdout.decode("utf-8", "replace"))
            return 1
    print(f"DECISION-PUBLICATION-GATE: PASS — {checked} new terminal decision record(s) validated")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n", 1)[0])
    parser.add_argument("--repo", default=".")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument(
        "--select", action="store_true",
        help="stdin: NUL-separated repository paths; stdout: the gated ones, NUL-terminated, in order",
    )
    mode.add_argument("--check", metavar="RECORD", help="judge one decision record's bytes")
    mode.add_argument(
        "--records", action="store_true",
        help="stdin: NUL-separated (publication path, frozen bytes file) pairs for one whole publication; "
             "judges every gated record whose frozen bytes differ from HEAD",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    repo = pathlib.Path(args.repo).resolve()
    try:
        if args.select:
            sys.stdout.buffer.write(select(sys.stdin.buffer.read()))
            sys.stdout.buffer.flush()
            return 0
        if args.check is not None:
            return check(repo, args.check)
        return records(repo, sys.stdin.buffer.read())
    except GateError as error:
        print(f"DECISION-PUBLICATION-GATE: FAIL — {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
