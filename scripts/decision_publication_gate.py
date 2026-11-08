#!/usr/bin/env python3
"""Creation-time gate for terminal research records and declared swarm JSON contracts.

One definition for publication and deterministic prewrite admission:

* ``scripts/commit-run.sh`` applies it to the exact Git index it is about to commit (``--select`` +
  ``--check``). It keeps its own index handling and its own messages; only WHICH staged paths are
  terminal decision publications, and HOW one record's bytes are judged, live here.
* The cockpit supervisor applies it to a frozen publication snapshot BEFORE that snapshot is sealed
  into an immutable ready receipt (``--records``). A sealed record this gate rejects can never
  publish: commit-run.sh reaches the same verdict on the same bytes at every retry.
* Deterministic writers call ``admit_schema_records`` while holding their repository mutation lease.
  It judges exact consumed bytes and strict proposed state bytes before the first domain write,
  then rechecks consumed files, the schema contract and HEAD before returning.

The research data-needs gate judges a top-level ``analyses/<RUN>/decision_record.json``, and
only when this publication would actually change it. The exact path shape excludes module outputs,
reviews, calibration files, and the commodity swarm's records (``commodity/runs/**`` has its own
pre-archive validator and orb roster and is deliberately not routed through this gate). A record
this publication would not change (the same bytes as ``HEAD``'s regular 100644 entry) is never
regraded: history is immutable, and today's live orb roster must not retro-fail a decision that was
valid when it was published.

How a record is judged: ``python3 scripts/eval.py --data-needs-prewrite <record>`` with the
repository as the working directory (eval.py resolves the live ``.claude/agents`` roster relative to
it). The verdict therefore depends on the record's bytes AND on the checked-out program: a deploy
that renames an orb can change it for the same bytes. (eval.py also reads today's date, but only to
require the v2 contract from 2026-08-14 on; that date has passed, so it can no longer flip a verdict.)

Swarm JSON admission is additive. A trusted SWARM.md may declare ``publication_schemas`` entries
``run:<artifact pattern>=<schema file>`` or ``ledger:<artifact pattern>=<schema file>`` beneath its
``schemas_root``. The existing schema checker judges those exact frozen/index bytes. Shared derived
boards are intentionally not declared: a new publication never regrades unchanged historical rows.
``--schema-contract`` describes run artifacts for the supervisor's freshness selection, and
``--schema-records`` judges every explicitly supplied pair before any durable mutation, without a
HEAD exemption. The later ``--records``/staged gate retains its unchanged-history exemption.
Declared auxiliary execution roots require trusted parent/kind/display-unit context; canonical roots
always retain their schema contract regardless of that execution kind.

Exit codes. Callers refuse on ANY non-zero exit: an unjudged record is exactly what must not be
committed or sealed, so the distinctions below are for the reader of a log, not for control flow.
``--records``: 0 PASS; 1 the validator did not accept a record (including a validator that could not
start); 2 the gate itself could not reach a verdict (malformed input, unreadable ``HEAD``).
``--check``: the validator's exit code (a validator killed by a signal is reported as 1); 2 if it
could not be launched. ``--select``: 0.
"""

from __future__ import annotations

import argparse
from collections.abc import Sequence
import json
import os
import pathlib
import re
import stat
import subprocess
import sys
import tempfile

from execution_provenance import ProvenanceError, discover_swarm_contracts, read_program_bytes


# Bytes, not text: this is the byte-exact port of commit-run.sh's former
# `[[ "$STAGED_PATH" =~ ^analyses/[^/]+/decision_record\.json$ ]]`. A byte-level full match is total, so
# selection itself can never fail on an oddly encoded path the way a decode step could.
TERMINAL_DECISION_PATH = re.compile(rb"analyses/[^/]+/decision_record\.json")


class GateError(RuntimeError):
    pass


def canonical_relative(value: str, label: str) -> str:
    if (not isinstance(value, str) or not value or value.startswith("/") or "\\" in value
            or any(part in {"", ".", ".."} for part in value.split("/"))):
        raise GateError(f"{label} must be a canonical repository-relative path")
    return value


def read_beneath(repo: pathlib.Path, relative: str, directory: bool = False) -> bytes:
    """Use the same no-follow program reader as trusted manifest discovery."""
    try:
        return read_program_bytes(repo, relative, directory)
    except (OSError, ProvenanceError) as error:
        raise GateError(str(error)) from error


def pattern_regex(pattern: str) -> re.Pattern:
    canonical_relative(pattern, "publication artifact pattern")
    # Wildcards apply within a path component, never across a run or ledger boundary.
    return re.compile("^" + re.escape(pattern).replace(r"\*", "[^/]*").replace(r"\?", "[^/]") + "$")


def existing_root_directories(repo: pathlib.Path, relative: str, pattern: bool = False) -> None:
    """Refuse linked/non-directory ancestors even when the requested leaf does not exist yet."""
    parts = canonical_relative(relative, "run root").split("/")
    for index, part in enumerate(parts):
        if pattern and any(character in part for character in "*?"):
            break
        prefix = "/".join(parts[:index + 1])
        try:
            os.lstat(repo / prefix)
        except FileNotFoundError:
            break
        except OSError as error:
            raise GateError(f"run root ancestor is unreadable: {prefix}: {error}") from error
        read_beneath(repo, prefix, directory=True)


def swarm_contracts(repo: pathlib.Path) -> tuple[dict, ...]:
    try:
        return discover_swarm_contracts(repo)
    except (OSError, ValueError, ProvenanceError) as error:
        raise GateError(f"cannot discover publication contracts: {error}") from error


def schema_bindings(repo: pathlib.Path, contracts: tuple[dict, ...] | None = None) -> list[dict]:
    """Resolve only trusted manifest mappings; payloads never select their own schema."""
    if contracts is None:
        contracts = swarm_contracts(repo)
    bindings = []
    patterns = set()
    for contract in contracts:
        for auxiliary in contract["publication_auxiliary_roots"]:
            existing_root_directories(repo, auxiliary["pattern"], pattern=True)
        mappings = contract.get("publication_schemas")
        if mappings is None and not contract.get("schemas_root"):
            continue
        if not isinstance(mappings, list) or any(not isinstance(row, str) for row in mappings):
            raise GateError(f"malformed publication_schemas: {contract['manifest']}")
        read_beneath(repo, contract["manifest"])
        schema_root = canonical_relative(contract.get("schemas_root"), "schemas_root")
        read_beneath(repo, schema_root, directory=True)
        # An explicit empty list delegates to the swarm's existing stronger specialized validator.
        # Omitting a mapping on a schema-bearing manifest is an error, never an inferred opt-out.
        for row in mappings:
            scope, separator, rest = row.partition(":")
            artifact, equal, schema = rest.partition("=")
            if not separator or not equal or scope not in {"run", "ledger"}:
                raise GateError(f"malformed publication schema mapping: {row}")
            canonical_relative(artifact, "publication artifact")
            canonical_relative(schema, "publication schema")
            if not artifact.endswith(".json") or not schema.endswith(".schema.json") or any(x in schema for x in "*?"):
                raise GateError(f"malformed publication schema mapping: {row}")
            prefix = contract["run_glob"] if scope == "run" else contract.get("ledger_root")
            if not prefix:
                raise GateError(f"publication schema mapping has no {scope} root: {row}")
            canonical_relative(prefix, "publication root")
            pattern = prefix + "/" + artifact
            if pattern in patterns:
                raise GateError(f"ambiguous publication schema mapping: {pattern}")
            patterns.add(pattern)
            schema_relative = schema_root + "/" + schema
            schema_bytes = read_beneath(repo, schema_relative)
            try:
                schema_value = json.loads(schema_bytes)
            except (UnicodeError, ValueError) as error:
                raise GateError(f"invalid publication schema: {schema_relative}") from error
            if not isinstance(schema_value, dict):
                raise GateError(f"publication schema is not an object: {schema_relative}")

            def check_refs(value):
                if isinstance(value, dict):
                    if "$ref" in value and (not isinstance(value["$ref"], str)
                                            or (value["$ref"] != "#" and not value["$ref"].startswith("#/"))):
                        raise GateError(f"publication schema has an unsupported external reference: {schema_relative}")
                    for child in value.values():
                        check_refs(child)
                elif isinstance(value, list):
                    for child in value:
                        check_refs(child)
            check_refs(schema_value)
            bindings.append({"scope": scope, "artifact": artifact, "pattern": pattern,
                             "regex": pattern_regex(pattern), "schema": schema_relative,
                             "schema_bytes": schema_bytes, "contract": contract})
    return bindings


def binding_for(relative: bytes, bindings: list[dict]) -> dict | None:
    path = os.fsdecode(relative)
    matches = [row for row in bindings if row["regex"].fullmatch(path)]
    if len(matches) > 1:
        raise GateError(f"ambiguous publication schema for {path}")
    return matches[0] if matches else None


def schema_contract(repo: pathlib.Path, run_root: str, owner: str | None = None,
                    kind: str | None = None, unit: str | None = None) -> dict:
    context = (owner, kind, unit)
    if any(value is not None for value in context) and not all(
        isinstance(value, str) and value.strip() == value and value for value in context
    ):
        raise GateError("schema contract context requires owner, kind, and unit together")
    existing_root_directories(repo, run_root)
    contracts = swarm_contracts(repo)
    bindings = schema_bindings(repo, contracts)
    canonical = [row for row in contracts if pattern_regex(row["run_glob"]).fullmatch(run_root)]
    research = not canonical and is_terminal_decision_path(os.fsencode(run_root + "/decision_record.json"))
    if not canonical and not research:
        # Only trusted exact execution context can select a declared auxiliary root. An arbitrary
        # unknown root remains an error, and canonical roots always take precedence over this branch.
        parents = [row for row in contracts if row["id"] == owner]
        if len(parents) != 1 or unit != parents[0].get("unit"):
            raise GateError(f"expected exactly one declared schema contract for run root: {run_root}")
        auxiliary = [row for row in parents[0]["publication_auxiliary_roots"]
                     if row["kind"] == kind and pattern_regex(row["pattern"]).fullmatch(run_root)]
        if len(auxiliary) != 1:
            raise GateError(f"expected exactly one declared auxiliary kind/root contract: {run_root}")
        return {"swarm_id": owner, "run_root": run_root, "classification": "auxiliary",
                "declared": False, "artifacts": []}
    if research:
        if owner is not None and owner != "research":
            raise GateError(f"schema contract owner does not match canonical run root: {run_root}")
        return {"swarm_id": "research", "run_root": run_root, "classification": "canonical",
                "declared": False, "artifacts": []}
    if len(canonical) != 1:
        raise GateError(f"expected exactly one declared schema contract for run root: {run_root}")
    contract = canonical[0]
    if owner is not None and (owner != contract["id"]
                              or (contract.get("unit") is not None and unit != contract["unit"])):
        raise GateError(f"schema contract context does not match canonical run root: {run_root}")
    artifacts = {}
    for row in bindings:
        if row["contract"]["id"] != contract["id"] or row["scope"] != "run":
            continue
        artifact = row["artifact"]
        # Literal declarations are retained even if absent. Version globs enumerate only existing files;
        # the supervisor separately decides which ones this exact attempt authored.
        if any(character in artifact for character in "*?"):
            paths = [str(path.relative_to(repo)).replace("\\", "/") for path in (repo / run_root).glob(artifact)]
        else:
            paths = [run_root + "/" + artifact]
        for path in paths:
            if binding_for(os.fsencode(path), bindings) is None:
                raise GateError(f"unmapped publication schema artifact: {path}")
            artifacts[path] = {"path": path, "relative": path[len(run_root) + 1:]}
    return {"swarm_id": contract["id"], "run_root": run_root,
            "classification": "canonical",
            "declared": bool(contract.get("publication_schemas")),
            "artifacts": [artifacts[path] for path in sorted(artifacts)]}


def validate_schema_document(binding: dict, document: bytes) -> list[str]:
    """Judge pinned program/document bytes with the existing canonical schema checker."""
    from validate_screener_json import validate
    try:
        # Pin both inputs before the existing canonical checker opens them. Program or provider writes
        # cannot make this check judge a different schema/doc from the bytes selected above.
        with tempfile.TemporaryDirectory(prefix="publication-schema-") as directory:
            schema_file = pathlib.Path(directory) / "schema.json"
            document_file = pathlib.Path(directory) / "document.json"
            schema_file.write_bytes(binding["schema_bytes"])
            document_file.write_bytes(document)
            return validate(str(schema_file), str(document_file))
    except (OSError, ValueError, KeyError, TypeError, RecursionError) as error:
        raise GateError(f"cannot validate declared publication schema {binding['schema']}: {error}") from error


def validate_schema_bytes(binding: dict, frozen: str) -> list[str]:
    try:
        descriptor = os.open(frozen, os.O_RDONLY | os.O_NOFOLLOW)
        with os.fdopen(descriptor, "rb") as handle:
            if not stat.S_ISREG(os.fstat(handle.fileno()).st_mode):
                raise GateError("frozen schema artifact is not a regular file")
            document = handle.read()
    except OSError as error:
        raise GateError(f"cannot read frozen schema artifact: {frozen}: {error}") from error
    return validate_schema_document(binding, document)


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


def git(repo: pathlib.Path, *args: "str | bytes", input: bytes | None = None) -> bytes:
    try:
        return subprocess.check_output(["git", "-C", str(repo), *args], input=input, stderr=subprocess.PIPE)
    except (OSError, subprocess.CalledProcessError) as error:
        detail = ""
        if isinstance(error, subprocess.CalledProcessError):
            detail = error.stderr.decode("utf-8", "replace").strip()
        raise GateError(detail or f"git {' '.join(os.fsdecode(arg) for arg in args)} failed") from error


def differs_from_head(repo: pathlib.Path, relative: bytes, frozen: str) -> bool:
    """Would committing these frozen bytes at this path change HEAD?

    commit-run.sh answers this with `git diff --cached` after staging. A supervisor snapshot is always
    staged as a regular 100644 blob whose OID is `git hash-object -- <frozen file>`, so the staged entry
    differs from HEAD exactly when HEAD's tree entry is anything other than that mode, type and OID.
    """
    oid = git(repo, "hash-object", "--", frozen).strip()
    return differs_from_head_oid(repo, relative, oid)


def differs_from_head_oid(repo: pathlib.Path, relative: bytes, oid: bytes, head: str = "HEAD") -> bool:
    # The path goes to git as the bytes it arrived as: no decode, so no locale can change which entry is read.
    listed = git(repo, "--literal-pathspecs", "ls-tree", "-z", head, "--", relative)
    return [entry for entry in listed.split(b"\0") if entry] != [b"100644 blob " + oid + b"\t" + relative]


def admit_schema_records(repo: pathlib.Path, consumed: Sequence[tuple[str, bytes]], *,
                         proposed: Sequence[tuple[str, bytes]] = ()) -> dict[str, int]:
    """Admit a deterministic transaction before its first write, while its caller holds the lease.

    Consumed bytes must be exactly those parsed by the caller. Only regular 100644 HEAD-identical inputs
    retain the publication gate's history exemption. Proposed mapped outputs are always checked strictly,
    including recovery images. Explicit unmapped pairs and empty calls are errors, never schema approval.
    The caller keeps its repository mutation lease from reading/planning through this call and writing.
    """
    repo = pathlib.Path(repo).resolve()
    try:
        groups = (list(consumed), list(proposed))
    except TypeError as error:
        raise GateError("expected consumed/proposed (logical path, exact bytes) pairs") from error
    if not any(groups):
        raise GateError("schema admission requires consumed or proposed mapped records")
    head = git(repo, "rev-parse", "--verify", "HEAD^{commit}").strip().decode("ascii")
    bindings = schema_bindings(repo)
    normalized = []
    for label, pairs in zip(("consumed input", "proposed output"), groups):
        seen = set()
        rows = []
        for pair in pairs:
            if not isinstance(pair, (tuple, list)) or len(pair) != 2:
                raise GateError(f"expected {label} (logical path, exact bytes) pair")
            relative, document = pair
            canonical_relative(relative, label)
            if not isinstance(document, bytes):
                raise GateError(f"{label} must supply exact bytes: {relative}")
            if relative in seen:
                raise GateError(f"duplicate {label}: {relative}")
            seen.add(relative)
            binding = binding_for(os.fsencode(relative), bindings)
            if binding is None:
                raise GateError(f"no declared publication schema for {label}: {relative}")
            rows.append((relative, document, binding))
        normalized.append(rows)

    def verify_consumed_and_targets() -> None:
        for relative, document, _ in normalized[0]:
            if read_beneath(repo, relative) != document:
                raise GateError(f"consumed schema input changed before mutation: {relative}")
        for relative, _, _ in normalized[1]:
            parent = relative.rpartition("/")[0]
            if parent:
                existing_root_directories(repo, parent)
            try:
                os.lstat(repo / relative)
            except FileNotFoundError:
                continue
            except OSError as error:
                raise GateError(f"proposed schema target is unreadable: {relative}: {error}") from error
            read_beneath(repo, relative)  # existing target must remain a contained non-linked regular file

    verify_consumed_and_targets()
    counts = {"checked_inputs": 0, "unchanged_inputs": 0, "checked_outputs": 0}
    for index, rows in enumerate(normalized):
        for relative, document, binding in rows:
            if index == 0:
                oid = git(repo, "hash-object", "--stdin", input=document).strip()
                if not differs_from_head_oid(repo, os.fsencode(relative), oid, head):
                    counts["unchanged_inputs"] += 1
                    continue
            try:
                errors = validate_schema_document(binding, document)
            except GateError as error:
                raise GateError(f"cannot judge schema record {relative}: {error}") from error
            if errors:
                raise GateError(f"schema rejected {'consumed input' if index == 0 else 'proposed output'} "
                                f"{relative}\n" + "\n".join(errors))
            counts["checked_inputs" if index == 0 else "checked_outputs"] += 1
    if schema_bindings(repo) != bindings:
        raise GateError("publication schema contract changed before mutation")
    if git(repo, "rev-parse", "--verify", "HEAD^{commit}").strip().decode("ascii") != head:
        raise GateError("repository HEAD changed during schema admission")
    verify_consumed_and_targets()
    return counts


def select(raw: bytes, repo: pathlib.Path | None = None) -> bytes:
    # NUL-TERMINATED on the way out: commit-run.sh reads with `read -r -d ''`, which drops a final
    # field that has no terminator.
    bindings = schema_bindings(repo) if repo is not None else []
    return b"".join(field + b"\0" for field in nul_fields(raw)
                    if is_terminal_decision_path(field) or binding_for(field, bindings))


def check(repo: pathlib.Path, record: str, publication_path: str | None = None) -> int:
    if publication_path is not None:
        relative = os.fsencode(canonical_relative(publication_path, "publication path"))
        binding = binding_for(relative, schema_bindings(repo))
        if binding is not None:
            errors = validate_schema_bytes(binding, record)
            if errors:
                print(f"DECISION-PUBLICATION-GATE: FAIL — schema rejected {publication_path}", file=sys.stderr)
                sys.stderr.write("\n".join(errors) + "\n")
                return 1
            return 0
        if not is_terminal_decision_path(relative):
            raise GateError(f"no declared validator for publication path: {publication_path}")
    # Output is inherited, not captured: commit-run.sh's stdout/stderr stay byte-for-byte what the
    # inline eval call produced.
    code = run_validator(repo, record, capture=False).returncode
    return code if 0 <= code <= 255 else 1


def records(repo: pathlib.Path, raw: bytes, schema_only: bool = False) -> int:
    fields = nul_fields(raw)
    if not fields or len(fields) % 2 or not all(fields):
        # An empty list would pass vacuously; a malformed one has lost track of which bytes belong to
        # which path. Both are caller bugs and must never become a PASS that can be sealed.
        raise GateError("expected NUL-separated (publication path, frozen bytes file) pairs")
    pairs = [(relative, os.fsdecode(frozen_raw)) for relative, frozen_raw in zip(fields[0::2], fields[1::2])]
    # Judge the SHAPE of every pair before gating any of them, gated or not. A list shifted by one field
    # puts a record's path where a bytes file belongs, where it would never be recognised as a record; and
    # a relative bytes file would be read from this process's directory but hashed from the repository's.
    # Either way the answer would be a PASS about bytes nobody judged.
    for relative, frozen in pairs:
        shown = relative.decode("utf-8", "replace")
        canonical_relative(os.fsdecode(relative), "publication path")
        if not os.path.isabs(frozen) or not os.path.isfile(frozen) or os.path.islink(frozen):
            raise GateError(f"frozen bytes must be an absolute path to an existing file for {shown}")
    bindings = schema_bindings(repo)
    checked = 0
    schema_checked = 0
    for relative, frozen in pairs:
        binding = binding_for(relative, bindings)
        if schema_only and binding is None:
            raise GateError(f"no declared publication schema for {os.fsdecode(relative)}")
        if binding is None and not is_terminal_decision_path(relative):
            continue
        if not schema_only and not differs_from_head(repo, relative, frozen):
            continue
        checked += 1
        if binding is not None:
            schema_checked += 1
            errors = validate_schema_bytes(binding, frozen)
            if errors:
                print(f"DECISION-PUBLICATION-GATE: FAIL — schema rejected {os.fsdecode(relative)}", file=sys.stderr)
                sys.stderr.write("\n".join(errors) + "\n")
                return 1
            continue
        result = run_validator(repo, frozen, capture=True)
        if result.returncode != 0:
            # Name the record first: a caller that truncates this output must still learn which file.
            print(
                "DECISION-PUBLICATION-GATE: FAIL — data-needs prewrite rejected "
                f"{relative.decode('utf-8', 'replace')}",
                file=sys.stderr,
            )
            sys.stderr.write(result.stderr.decode("utf-8", "replace") or result.stdout.decode("utf-8", "replace"))
            return 1
    if schema_only:
        print(f"DECISION-PUBLICATION-GATE: PASS — {checked} declared schema artifact(s) validated")
    else:
        print(f"DECISION-PUBLICATION-GATE: PASS — {checked - schema_checked} new terminal decision record(s) validated; "
              f"{schema_checked} declared schema artifact(s) validated")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n", 1)[0])
    parser.add_argument("--repo", default=".")
    parser.add_argument("--publication-path", help="repository path whose exact staged bytes --check judges")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument(
        "--select", action="store_true",
        help="stdin: NUL-separated repository paths; stdout: the gated ones, NUL-terminated, in order",
    )
    mode.add_argument("--check", metavar="RECORD", help="judge one decision record's bytes")
    mode.add_argument("--schema-contract", metavar="RUN_ROOT", help="describe trusted schema-bearing run artifacts as JSON")
    parser.add_argument("--schema-swarm", help="trusted parent swarm for an execution-scoped schema contract")
    parser.add_argument("--schema-kind", help="trusted execution kind; supplied with --schema-swarm and --schema-unit")
    parser.add_argument("--schema-unit", help="trusted manifest display unit, never a primary/auxiliary kind discriminator")
    mode.add_argument("--schema-records", action="store_true", help="validate every explicitly supplied mapped (path, bytes file) pair before durable mutation")
    mode.add_argument(
        "--records", action="store_true",
        help="stdin: NUL-separated (publication path, frozen bytes file) pairs for one whole publication; "
             "judges every gated record whose frozen bytes differ from HEAD",
    )
    return parser.parse_args()


def main() -> int:
    # A verdict must never depend on whether this process's locale can print an em dash or a run name.
    for stream in (sys.stdout, sys.stderr):
        stream.reconfigure(errors="backslashreplace")
    args = parse_args()
    repo = pathlib.Path(args.repo).resolve()
    try:
        if args.schema_contract is None and any(
            value is not None for value in (args.schema_swarm, args.schema_kind, args.schema_unit)
        ):
            raise GateError("schema execution context is only valid with --schema-contract")
        if args.select:
            sys.stdout.buffer.write(select(sys.stdin.buffer.read(), repo))
            sys.stdout.buffer.flush()
            return 0
        if args.check is not None:
            return check(repo, args.check, args.publication_path)
        if args.schema_contract is not None:
            print(json.dumps(schema_contract(repo, args.schema_contract, args.schema_swarm,
                                             args.schema_kind, args.schema_unit)))
            return 0
        return records(repo, sys.stdin.buffer.read(), schema_only=args.schema_records)
    except GateError as error:
        print(f"DECISION-PUBLICATION-GATE: FAIL — {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
