#!/usr/bin/env python3
"""Crash-safe completion authority for paid final audits and derived research outputs.

Final audits are append-only JSON reports, so their own canonical identity and input SHA fields are the
completion receipt.  A first-writer-wins input seal distinguishes the final audit pass from the earlier
diagnostic pass and reserves the minimum eligible version for each audit kind.

Derived LLM memos are outside the immutable idea-admission set.  They therefore use append-only,
content-addressed receipts that bind the exact admission/manifest authority, source bytes, output bytes,
and generator contract.  A present file without such a receipt is not replay authority.

The master and final idea projection are armed before their paid Tasks with unique contained staging
paths.  Durable attempts bind exact source/manifest authority and prior canonical bytes; exact-hash
promotion intents make canonical renames resumable.  Invalid staged projection output becomes a
deterministic fail-closed wrapper.  Unknown canonical bytes always stop.
"""
from __future__ import annotations

import argparse
import contextlib
import datetime as dt
import fcntl
import hashlib
import io
import json
import os
import re
import secrets
import stat
import subprocess
import sys
import tempfile
from typing import Any

from canonical_json import canonical_sha256
from create_idea_projection_manifest import (
    AUDIT_KINDS,
    PAID_COMPLETION_ROLLOUT_DATE,
    VERSIONED,
    file_digest,
    validate_bound_audit,
    validate_decision_identity,
    validate_manifest_or_raise,
)
from freeze_idea_admission import (
    existing_is_valid,
    freeze as validate_frozen_admission,
    validate_json_contract,
)


REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIT_SEAL = "final_audit_inputs.json"
AUDIT_SEAL_SCHEMA = "research-final-audit-inputs/v1"
AUDIT_PLAN_SCHEMA = "research-final-audit-plan/v1"
PROJECTION_AUTHORITY_SCHEMA = "research-projection-paid-authority/v1"
PROJECTION_ATTEMPT_SCHEMA = "research-final-projection-attempt/v1"
PROJECTION_ATTEMPT = "final-projection-attempt.json"
PROJECTION_ATTEMPT_DIR = "final-projection-attempts"
PROJECTION_PROMOTION = "final-projection-promotion.json"
PROJECTION_PROMOTION_SCHEMA = "research-final-projection-promotion/v1"
PROJECTION_COMPLETION = "final-projection-completion.json"
PROJECTION_COMPLETION_SCHEMA = "research-final-projection-completion/v1"
PROJECTION_QUARANTINE_DIR = "quarantine"
PROJECTION_ASSESSMENT = "idea_3_6m.json"
PROJECTION_MANIFEST = "idea_projection_manifest.json"
PROJECTION_PENDING_GAP = "Pending post-audit projection manifest and canonical market evidence."
PROJECTION_FAILURE_GAP = "Final idea re-projection Task emitted an invalid or incomplete assessment."
MASTER_ATTEMPT_SCHEMA = "research-master-synthesis-attempt/v1"
MASTER_ATTEMPT = "master-synthesis-attempt.json"
MASTER_ATTEMPT_DIR = "master-synthesis-attempts"
MASTER_QUARANTINE_DIR = "master-synthesis-quarantine"
MASTER_PROMOTION = "master-synthesis-promotion.json"
MASTER_PROMOTION_SCHEMA = "research-master-synthesis-promotion/v1"
MASTER_COMPLETION_DIR = "master-synthesis-completions"
MASTER_COMPLETION_SCHEMA = "research-master-synthesis-completion/v1"
MASTER_OUTPUTS = ("final_thesis.md", "decision_record.json", "idea_3_6m.json")
DIAGNOSTIC_SEAL = "diagnostic_audit_inputs.json"
DIAGNOSTIC_SEAL_SCHEMA = "research-diagnostic-audit-inputs/v1"
DIAGNOSTIC_PLAN_SCHEMA = "research-diagnostic-audit-plan/v1"
DIAGNOSTIC_CHECKPOINT = "diagnostic_derived_pair.json"
DIAGNOSTIC_CHECKPOINT_SCHEMA = "research-diagnostic-derived-pair/v1"
DIAGNOSTIC_TRANSFORM_INTENT = "diagnostic_transform_intent.json"
DIAGNOSTIC_TRANSFORM_INTENT_SCHEMA = "research-diagnostic-transform-intent/v1"
DIAGNOSTIC_TRANSFORM_VERSION = "full-integrity-derived-pair/v1"
MEMO_RECEIPT_SCHEMA = "research-derived-memo-receipt/v2"
MEMO_PLAN_SCHEMA = "research-derived-memo-plan/v1"
MEMO_ATTEMPT_SCHEMA = "research-derived-memo-attempt/v1"
RECEIPT_PARENT = ".completion_receipts"
MEMO_RECEIPT_DIR = "derived-memos"
MEMO_ATTEMPT_DIR = "derived-memo-attempts"
DIAGNOSTIC_SNAPSHOT_DIR = "diagnostic-inputs"
DIAGNOSTIC_OUTPUT_DIR = "diagnostic-derived-outputs"
HEX64 = re.compile(r"^[a-f0-9]{64}$")
RUN_ROOT_RE = re.compile(r"analyses/([-A-Z0-9.]{1,24})_(\d{4}-\d{2}-\d{2})")
GENERATOR_CONTRACTS = {
    "run_memo": {
        "name": "memo-writer",
        "version": "memo-writer/v1",
        "spec_path": ".claude/agents/memo-writer.md",
    },
    "module_memo": {
        "name": "module-memo-writer",
        "version": "module-memo-writer/v1",
        "spec_path": ".claude/agents/module-memo-writer.md",
    },
}


def _now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def _aware_timestamp(value: Any) -> bool:
    if not isinstance(value, str):
        return False
    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return False
    return parsed.tzinfo is not None


def _timestamp(value: Any) -> dt.datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed if parsed.tzinfo is not None else None


def _regular_file(path: str, *, nonempty: bool = False) -> bool:
    try:
        info = os.lstat(path)
    except OSError:
        return False
    return stat.S_ISREG(info.st_mode) and (not nonempty or info.st_size > 0)


def _read_json(path: str) -> dict[str, Any]:
    if not _regular_file(path, nonempty=True):
        raise ValueError(f"{path} is missing, empty, or not a direct regular file")
    try:
        with open(path, encoding="utf-8") as handle:
            value = json.load(handle)
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ValueError(f"{path} is not readable JSON") from exc
    if not isinstance(value, dict):
        raise ValueError(f"{path} must contain one JSON object")
    return value


def _resolve_run(run_root: str, repo: str) -> tuple[str, str, str]:
    expected_root = run_root.replace(os.sep, "/")
    if expected_root != run_root or not RUN_ROOT_RE.fullmatch(expected_root):
        raise ValueError("RUN_ROOT must be one exact repo-relative analyses/<TICKER>_<YYYY-MM-DD> path")
    repo_abs = os.path.realpath(repo)
    analyses_abs = os.path.realpath(os.path.join(repo_abs, "analyses"))
    run_joined = os.path.join(repo_abs, expected_root)
    if os.path.islink(run_joined) or not os.path.isdir(run_joined):
        raise ValueError("RUN_ROOT is missing, is a symlink, or is not a directory")
    run_abs = os.path.realpath(run_joined)
    if os.path.dirname(run_abs) != analyses_abs:
        raise ValueError("RUN_ROOT escapes the direct analyses/ child boundary")
    return expected_root, run_abs, repo_abs


def _terminal_pair(expected_root: str, run_abs: str) -> tuple[str, str, str]:
    thesis_path = os.path.join(run_abs, "final_thesis.md")
    decision_path = os.path.join(run_abs, "decision_record.json")
    if not _regular_file(thesis_path, nonempty=True):
        raise ValueError("final_thesis.md is missing, empty, or not a direct regular file")
    decision = _read_json(decision_path)
    ticker = validate_decision_identity(decision, expected_root)
    return ticker, file_digest(thesis_path), file_digest(decision_path)


def _fsync_directory(path: str) -> None:
    fd = os.open(path, os.O_RDONLY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def _atomic_json(path: str, value: dict[str, Any], prefix: str) -> None:
    parent = os.path.dirname(path)
    fd, temp = tempfile.mkstemp(prefix=prefix, suffix=".json", dir=parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(value, handle, indent=2, ensure_ascii=False, allow_nan=False)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp, path)
        temp = ""
        _fsync_directory(parent)
    finally:
        if temp and os.path.exists(temp):
            os.unlink(temp)


def _atomic_bytes(path: str, value: bytes, prefix: str) -> None:
    parent = os.path.dirname(path)
    fd, temp = tempfile.mkstemp(prefix=prefix, dir=parent)
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(value)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp, path)
        temp = ""
        _fsync_directory(parent)
    finally:
        if temp and os.path.exists(temp):
            os.unlink(temp)


def _remove_owned_tree(path: str, expected_parent: str) -> None:
    """Remove one exact helper-created staging tree, rejecting links or special files."""
    if os.path.dirname(os.path.realpath(path)) != os.path.realpath(expected_parent):
        raise ValueError("attempt staging cleanup target escapes its exact parent")
    if not os.path.lexists(path):
        return
    if os.path.islink(path) or not os.path.isdir(path):
        raise ValueError("attempt staging cleanup target is unsafe")
    for entry in list(os.scandir(path)):
        if entry.is_symlink():
            raise ValueError("attempt staging contains a symlink and cannot be cleaned")
        if entry.is_dir(follow_symlinks=False):
            _remove_owned_tree(entry.path, path)
        elif entry.is_file(follow_symlinks=False):
            os.unlink(entry.path)
        else:
            raise ValueError("attempt staging contains a special file and cannot be cleaned")
    os.rmdir(path)
    _fsync_directory(expected_parent)


def _audit_rows(run_abs: str, kind: str) -> list[tuple[int, str, str]]:
    pattern = VERSIONED[kind]
    rows: list[tuple[int, str, str]] = []
    for name in os.listdir(run_abs):
        match = pattern.fullmatch(name)
        if match:
            rows.append((int(match.group(1) or 1), name, os.path.join(run_abs, name)))
    return sorted(rows)


def _next_audit_version(rows: list[tuple[int, str, str]]) -> int:
    return (max((row[0] for row in rows), default=0) + 1) if rows else 1


def _audit_filename(kind: str, version: int) -> str:
    stems = {
        "verification": "verification_report",
        "pre_mortem": "pre_mortem",
        "expectations_gap": "expectations_gap",
    }
    return f"{stems[kind]}.json" if version == 1 else f"{stems[kind]}_v{version}.json"


def _diagnostic_snapshot_dir(run_abs: str, *, create: bool) -> str | None:
    return _completion_dir(run_abs, DIAGNOSTIC_SNAPSHOT_DIR, create=create)


def _diagnostic_output_dir(run_abs: str, *, create: bool) -> str | None:
    return _completion_dir(run_abs, DIAGNOSTIC_OUTPUT_DIR, create=create)


def _diagnostic_snapshot_name(kind: str, digest: str) -> str:
    suffix = ".md" if kind == "final_thesis" else ".json"
    return f"{kind}-{digest}{suffix}"


def _diagnostic_snapshot_path(expected_root: str, kind: str, digest: str) -> str:
    return (
        f"{expected_root}/{RECEIPT_PARENT}/{DIAGNOSTIC_SNAPSHOT_DIR}/"
        f"{_diagnostic_snapshot_name(kind, digest)}"
    )


def _validate_diagnostic_seal(
    value: dict[str, Any], expected_root: str, run_abs: str, repo_abs: str
) -> tuple[str, str, str]:
    if set(value) != {
        "schema_version", "run_root", "ticker", "sealed_at", "inputs",
        "minimum_versions", "seal_sha256",
    }:
        raise ValueError("diagnostic audit input seal fields are malformed")
    if value.get("schema_version") != DIAGNOSTIC_SEAL_SCHEMA or value.get("run_root") != expected_root:
        raise ValueError("diagnostic audit input seal identity or schema is invalid")
    if not _aware_timestamp(value.get("sealed_at")):
        raise ValueError("diagnostic audit input seal timestamp is invalid")
    payload = dict(value)
    recorded = payload.pop("seal_sha256", None)
    if not isinstance(recorded, str) or not HEX64.fullmatch(recorded) or recorded != canonical_sha256(payload):
        raise ValueError("diagnostic audit input seal digest is invalid")
    inputs = value.get("inputs")
    if not isinstance(inputs, dict) or set(inputs) != {"final_thesis", "decision_record"}:
        raise ValueError("diagnostic audit input snapshot map is invalid")
    digests: dict[str, str] = {}
    live_names = {"final_thesis": "final_thesis.md", "decision_record": "decision_record.json"}
    for kind, live_name in live_names.items():
        row = inputs.get(kind)
        if not isinstance(row, dict) or set(row) != {"path", "sha256", "snapshot_path"}:
            raise ValueError(f"diagnostic {kind} snapshot binding is malformed")
        digest = row.get("sha256")
        if not isinstance(digest, str) or not HEX64.fullmatch(digest):
            raise ValueError(f"diagnostic {kind} snapshot digest is invalid")
        if row.get("path") != f"{expected_root}/{live_name}":
            raise ValueError(f"diagnostic {kind} live path binding is invalid")
        expected_snapshot = _diagnostic_snapshot_path(expected_root, kind, digest)
        if row.get("snapshot_path") != expected_snapshot:
            raise ValueError(f"diagnostic {kind} snapshot path binding is invalid")
        snapshot_abs = os.path.join(repo_abs, expected_snapshot)
        if not _regular_file(snapshot_abs, nonempty=True) or file_digest(snapshot_abs) != digest:
            raise ValueError(f"diagnostic {kind} snapshot bytes are missing or changed")
        digests[kind] = digest
    decision = _read_json(os.path.join(repo_abs, inputs["decision_record"]["snapshot_path"]))
    ticker = validate_decision_identity(decision, expected_root)
    if value.get("ticker") != ticker:
        raise ValueError("diagnostic audit input seal ticker does not match its decision snapshot")
    minimum = value.get("minimum_versions")
    if (
        not isinstance(minimum, dict)
        or set(minimum) != set(AUDIT_KINDS)
        or any(
            not isinstance(minimum[kind], int)
            or isinstance(minimum[kind], bool)
            or minimum[kind] < 1
            for kind in AUDIT_KINDS
        )
    ):
        raise ValueError("diagnostic audit input seal minimum-version map is invalid")
    return ticker, digests["final_thesis"], digests["decision_record"]


def seal_diagnostic_audit_inputs(run_root: str, repo: str = REPO) -> dict[str, Any]:
    expected_root, run_abs, repo_abs = _resolve_run(run_root, repo)
    target = os.path.join(run_abs, DIAGNOSTIC_SEAL)
    lock_fd = os.open(run_abs, os.O_RDONLY)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        if _regular_file(target, nonempty=True):
            existing = _read_json(target)
            _validate_diagnostic_seal(existing, expected_root, run_abs, repo_abs)
            return {
                "status": "existing",
                "path": f"{expected_root}/{DIAGNOSTIC_SEAL}",
                "seal_sha256": existing["seal_sha256"],
            }
        if os.path.lexists(target):
            raise ValueError("diagnostic audit input seal path exists but is not a valid regular file")
        if any(
            os.path.lexists(os.path.join(run_abs, name))
            for name in (
                AUDIT_SEAL, DIAGNOSTIC_CHECKPOINT, DIAGNOSTIC_TRANSFORM_INTENT,
                "idea_projection_manifest.json", "idea_admission.json",
            )
        ):
            raise ValueError("cannot create diagnostic audit inputs after a later completion boundary")
        ticker, thesis_sha, decision_sha = _terminal_pair(expected_root, run_abs)
        directory = _diagnostic_snapshot_dir(run_abs, create=True)
        assert directory is not None
        bindings: dict[str, Any] = {}
        for kind, live_name, digest in (
            ("final_thesis", "final_thesis.md", thesis_sha),
            ("decision_record", "decision_record.json", decision_sha),
        ):
            source = os.path.join(run_abs, live_name)
            with open(source, "rb") as handle:
                content = handle.read()
            snapshot_name = _diagnostic_snapshot_name(kind, digest)
            snapshot_abs = os.path.join(directory, snapshot_name)
            if os.path.lexists(snapshot_abs):
                if not _regular_file(snapshot_abs, nonempty=True) or file_digest(snapshot_abs) != digest:
                    raise ValueError("content-addressed diagnostic snapshot path has different bytes")
            else:
                _atomic_bytes(snapshot_abs, content, ".diagnostic-input-")
            bindings[kind] = {
                "path": f"{expected_root}/{live_name}",
                "sha256": digest,
                "snapshot_path": _diagnostic_snapshot_path(expected_root, kind, digest),
            }
        payload: dict[str, Any] = {
            "schema_version": DIAGNOSTIC_SEAL_SCHEMA,
            "run_root": expected_root,
            "ticker": ticker,
            "sealed_at": _now(),
            "inputs": bindings,
            "minimum_versions": {
                kind: _next_audit_version(_audit_rows(run_abs, kind)) for kind in AUDIT_KINDS
            },
        }
        payload["seal_sha256"] = canonical_sha256(payload)
        _atomic_json(target, payload, ".diagnostic-audit-inputs-")
        return {
            "status": "created",
            "path": f"{expected_root}/{DIAGNOSTIC_SEAL}",
            "seal_sha256": payload["seal_sha256"],
        }
    finally:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        finally:
            os.close(lock_fd)


def _bound_audit_plan(
    expected_root: str,
    run_abs: str,
    ticker: str,
    thesis_sha: str,
    decision_sha: str,
    minimum_versions: dict[str, int],
    pass_name: str,
) -> dict[str, Any]:
    audits: dict[str, Any] = {}
    for kind in AUDIT_KINDS:
        rows = _audit_rows(run_abs, kind)
        next_version = _next_audit_version(rows)
        action = "run"
        reason = f"canonical {pass_name} audit is missing"
        reusable_path = None
        reusable_version = None
        reusable_sha256 = None
        if rows:
            highest = rows[-1][0]
            top = [row for row in rows if row[0] == highest]
            if len(top) != 1:
                reason = f"latest canonical version {highest} is ambiguous"
            elif highest < minimum_versions[kind]:
                reason = (
                    f"latest canonical version {highest} predates reserved {pass_name} version "
                    f"{minimum_versions[kind]}"
                )
            else:
                version, name, path = top[0]
                if not _regular_file(path, nonempty=True):
                    reason = "latest canonical audit is missing, empty, or not a direct regular file"
                else:
                    try:
                        validate_bound_audit(
                            kind,
                            path,
                            expected_root,
                            ticker,
                            thesis_sha,
                            decision_sha,
                            require_canonical_fields=True,
                        )
                    except (OSError, TypeError, ValueError, json.JSONDecodeError) as exc:
                        reason = str(exc)
                    else:
                        action = "reuse"
                        reason = f"latest canonical audit exactly matches the {pass_name} sealed inputs"
                        reusable_path = f"{expected_root}/{name}"
                        reusable_version = version
                        reusable_sha256 = file_digest(path)
        audits[kind] = {
            "action": action,
            "reason": reason,
            "reusable_path": reusable_path,
            "reusable_version": reusable_version,
            "reusable_sha256": reusable_sha256,
            "next_output_path": (
                None if action == "reuse" else f"{expected_root}/{_audit_filename(kind, next_version)}"
            ),
            "minimum_version": minimum_versions[kind],
        }
    return audits


def _current_pair_state(
    expected_root: str, run_abs: str, thesis_sha: str, decision_sha: str
) -> tuple[str, str]:
    try:
        _, current_thesis, current_decision = _terminal_pair(expected_root, run_abs)
    except ValueError as exc:
        return "unsafe_mismatch", str(exc)
    if current_thesis == thesis_sha and current_decision == decision_sha:
        return "ready", "live terminal pair exactly matches the diagnostic snapshots"
    return "unsafe_mismatch", "live terminal pair has bytes not authorized by a transform intent"


def diagnostic_audit_plan(run_root: str, repo: str = REPO) -> dict[str, Any]:
    expected_root, run_abs, repo_abs = _resolve_run(run_root, repo)
    seal_path = os.path.join(run_abs, DIAGNOSTIC_SEAL)
    if not os.path.lexists(seal_path):
        _terminal_pair(expected_root, run_abs)
        return {
            "schema_version": DIAGNOSTIC_PLAN_SCHEMA,
            "status": "unsealed",
            "run_root": expected_root,
            "all_complete": False,
            "input_state": "unsealed",
            "audits": {},
        }
    seal = _read_json(seal_path)
    ticker, thesis_sha, decision_sha = _validate_diagnostic_seal(
        seal, expected_root, run_abs, repo_abs
    )
    audits = _bound_audit_plan(
        expected_root,
        run_abs,
        ticker,
        thesis_sha,
        decision_sha,
        seal["minimum_versions"],
        "diagnostic",
    )
    checkpoint_path = os.path.join(run_abs, DIAGNOSTIC_CHECKPOINT)
    if os.path.lexists(checkpoint_path):
        checkpoint = _read_json(checkpoint_path)
        _validate_diagnostic_checkpoint(checkpoint, expected_root, run_abs, repo_abs, seal)
        status = "derived_checkpointed"
        input_state = "derived_checkpointed"
        input_reason = "deterministic post-diagnostic pair and prewrite completion are checkpointed"
    else:
        status = "input_sealed"
        intent_path = os.path.join(run_abs, DIAGNOSTIC_TRANSFORM_INTENT)
        if os.path.lexists(intent_path):
            intent = _read_json(intent_path)
            _validate_diagnostic_transform_intent(
                intent, expected_root, run_abs, repo_abs, seal
            )
            input_state, input_reason = _diagnostic_transform_live_state(
                intent, expected_root, run_abs
            )
        else:
            input_state, input_reason = _current_pair_state(
                expected_root, run_abs, thesis_sha, decision_sha
            )
            if input_state != "ready":
                raise ValueError(input_reason + "; preserve the unknown bytes and start a new dated run")
    return {
        "schema_version": DIAGNOSTIC_PLAN_SCHEMA,
        "status": status,
        "run_root": expected_root,
        "seal_path": f"{expected_root}/{DIAGNOSTIC_SEAL}",
        "seal_sha256": seal["seal_sha256"],
        "input_state": input_state,
        "input_reason": input_reason,
        "all_complete": all(row["action"] == "reuse" for row in audits.values()),
        "audits": audits,
    }


def require_diagnostic_audits(run_root: str, repo: str = REPO) -> dict[str, Any]:
    plan = diagnostic_audit_plan(run_root, repo)
    if plan["status"] != "input_sealed" or plan["input_state"] != "ready":
        raise ValueError("diagnostic input pair is not restored and ready for deterministic transforms")
    missing = [kind for kind, row in plan["audits"].items() if row["action"] != "reuse"]
    if missing:
        raise ValueError("diagnostic audit set is incomplete or stale: " + ", ".join(missing))
    return plan


def _json_bytes(value: dict[str, Any]) -> bytes:
    return (json.dumps(value, indent=2, ensure_ascii=False, allow_nan=False) + "\n").encode("utf-8")


def _strip_finish_banner(text: str, drop_tokens: tuple[str, ...]) -> tuple[str, list[str]]:
    mark = "PROVISIONAL — the automated finish-gate"
    lines = text.split("\n")
    index = 0
    while index < len(lines) and not lines[index].strip():
        index += 1
    reasons: list[str] = []
    if index < len(lines) and lines[index].startswith(">") and mark in "\n".join(lines[index:index + 6]):
        block: list[str] = []
        while index < len(lines) and lines[index].startswith(">"):
            block.append(lines[index])
            index += 1
        while index < len(lines) and not lines[index].strip():
            index += 1
        text = "\n".join(lines[index:])
        if len(block) >= 2:
            reasons = [
                row.strip()
                for row in block[1].lstrip("> ").split(";")
                if row.strip() and not any(token in row for token in drop_tokens)
            ]
    return text, reasons


def _render_diagnostic_outputs(
    decision: dict[str, Any], thesis: str, reports: dict[str, dict[str, Any]]
) -> tuple[bytes, bytes, dict[str, str]]:
    pre_mortem = reports["pre_mortem"]
    rec_conf = pre_mortem.get("recommended_confidence")
    verdict = pre_mortem.get("verdict") or ""
    orig_conf = decision.get("confidence_score")
    is_number = lambda value: isinstance(value, (int, float)) and not isinstance(value, bool)
    pm_orig = pre_mortem.get("original_confidence")
    if not is_number(pm_orig):
        pm_orig = orig_conf
    haircut = pre_mortem.get("confidence_haircut")
    if not is_number(haircut):
        haircut = (pm_orig - rec_conf) if is_number(pm_orig) and is_number(rec_conf) else 0
    decision["confidence_haircut"] = haircut
    decision["pre_mortem_verdict"] = verdict
    decision["post_review_confidence_score"] = rec_conf
    terminal = {"Thesis broken", "Does not survive — downgrade"}
    original_decision = decision.get("decision") or ""
    original_basket = decision.get("basket") or ""
    if verdict in terminal and original_basket in {"Selected", "Short"}:
        decision["post_mortem_decision"] = "Watchlist"
        decision["post_mortem_basket"] = "Watchlist"
        rating_line = (
            f"RATING-CAP: terminal pre-mortem '{verdict}' on '{original_decision}' "
            f"({original_basket}) → post_mortem_decision=Watchlist"
        )
    else:
        decision["post_mortem_decision"] = original_decision
        decision["post_mortem_basket"] = original_basket
        rating_line = (
            f"RATING-CAP: non-terminal or already-conservative pre-mortem ('{verdict}') "
            f"— post_mortem_decision={original_decision!r}"
        )
    haircut_line = (
        f"HAIRCUT: confidence {orig_conf} → {rec_conf} (−{haircut}pt) | pre-mortem: '{verdict}'"
        if is_number(haircut) and haircut > 0
        else f"HAIRCUT: no reduction (pre-mortem: '{verdict}'; confidence stays {orig_conf})"
    )

    verification = reports["verification"]
    verification_reason = None
    verification_verdict = str(verification.get("verdict") or "").strip()
    if verification_verdict not in {"Clean", "Minor issues"}:
        verification_reason = (
            f"verify-evidence verdict = {verification_verdict or '(blank/unknown)'} "
            f"(not Clean/Minor — integrity {verification.get('integrity_score')}/100, "
            "see the sealed diagnostic verification report)"
        )
    body, reasons = _strip_finish_banner(
        thesis, ("verify-evidence", "truth-integrity audit", "verification_report")
    )
    if verification_reason and verification_reason not in reasons:
        reasons.append(verification_reason)
    if reasons:
        thesis = (
            "> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**\n> "
            + "; ".join(reasons)
            + "\n>\n> Resolve the flagged items — re-run the synthesizer §14 math and/or the truth-integrity audit "
              "(`/research:verify-evidence`) — and re-publish before relying on these numbers. "
              "(CLAUDE.md §5/§10/§15; finish-gate F01/F17/F30.)\n\n"
            + body
        )
        verify_line = "GATE-VERIFY: PROVISIONAL — " + "; ".join(reasons)
    else:
        thesis = body
        verify_line = "GATE-VERIFY: PASS — truth-integrity audit cleared (verdict Clean/Minor)"

    expectations = reports["expectations_gap"]
    confidence = decision.get("confidence_score")
    quality = str(expectations.get("variant_perception_quality") or "").strip().casefold()
    no_edge = quality in {"", "none", "weak"} or expectations.get("is_exploitable") is False
    expectations_reason = None
    if no_edge and is_number(confidence) and confidence > 60:
        expectations_reason = (
            "expectations-gap audit found "
            f"variant_perception_quality={expectations.get('variant_perception_quality')!r} / "
            f"is_exploitable={expectations.get('is_exploitable')!r} (no independently-proven edge) "
            f"but confidence_score={confidence} > 60 — §7 bans a confident rating on unproven variant perception"
        )
    if expectations_reason:
        body, reasons = _strip_finish_banner(thesis, ("expectations-gap audit",))
        reasons.append(expectations_reason)
        thesis = (
            "> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**\n> "
            + "; ".join(reasons)
            + "\n>\n> Resolve the flagged items before relying on these numbers. "
              "(CLAUDE.md §7; finish-gate F-EG.)\n\n"
            + body
        )
        expectations_line = "GATE-EXPECTATIONS: PROVISIONAL — " + expectations_reason
    else:
        expectations_line = (
            "GATE-EXPECTATIONS: PASS — expectations-gap audit found no confidence/edge contradiction"
        )
    return thesis.encode("utf-8"), _json_bytes(decision), {
        "rating_cap": rating_line,
        "haircut": haircut_line,
        "gate_verify": verify_line,
        "gate_expectations": expectations_line,
    }


def _diagnostic_output_path(expected_root: str, kind: str, digest: str) -> str:
    suffix = ".md" if kind == "final_thesis" else ".json"
    return f"{expected_root}/{RECEIPT_PARENT}/{DIAGNOSTIC_OUTPUT_DIR}/{kind}-{digest}{suffix}"


def _validate_diagnostic_report_bindings(
    bindings: dict[str, Any], seal: dict[str, Any], expected_root: str,
    run_abs: str, repo_abs: str
) -> tuple[dict[str, dict[str, Any]], dict[str, str]]:
    ticker, thesis_sha, decision_sha = _validate_diagnostic_seal(
        seal, expected_root, run_abs, repo_abs
    )
    if not isinstance(bindings, dict) or set(bindings) != set(AUDIT_KINDS):
        raise ValueError("diagnostic report binding map is invalid")
    values: dict[str, dict[str, Any]] = {}
    paths: dict[str, str] = {}
    for kind, row in bindings.items():
        if not isinstance(row, dict) or set(row) != {"path", "sha256", "version"}:
            raise ValueError(f"diagnostic {kind} report binding is malformed")
        version = row.get("version")
        if (
            not isinstance(version, int)
            or isinstance(version, bool)
            or version < seal["minimum_versions"][kind]
            or row.get("path") != f"{expected_root}/{_audit_filename(kind, version)}"
            or not isinstance(row.get("sha256"), str)
            or not HEX64.fullmatch(row["sha256"])
        ):
            raise ValueError(f"diagnostic {kind} report binding identity is invalid")
        path = os.path.join(repo_abs, row["path"])
        if not _regular_file(path, nonempty=True) or file_digest(path) != row["sha256"]:
            raise ValueError(f"diagnostic {kind} report bytes are missing or changed")
        values[kind] = validate_bound_audit(
            kind, path, expected_root, ticker, thesis_sha, decision_sha,
            require_canonical_fields=True,
        )
        paths[kind] = path
    return values, paths


def _validate_diagnostic_transform_intent(
    value: dict[str, Any], expected_root: str, run_abs: str, repo_abs: str,
    seal: dict[str, Any]
) -> dict[str, str]:
    if set(value) != {
        "schema_version", "run_root", "ticker", "prepared_at", "diagnostic_input_seal",
        "diagnostic_reports", "transform", "inputs", "outputs", "messages", "intent_sha256",
    }:
        raise ValueError("diagnostic transform intent fields are malformed")
    if (
        value.get("schema_version") != DIAGNOSTIC_TRANSFORM_INTENT_SCHEMA
        or value.get("run_root") != expected_root
        or not _aware_timestamp(value.get("prepared_at"))
    ):
        raise ValueError("diagnostic transform intent identity or timestamp is invalid")
    payload = dict(value)
    recorded = payload.pop("intent_sha256", None)
    if not isinstance(recorded, str) or not HEX64.fullmatch(recorded) or recorded != canonical_sha256(payload):
        raise ValueError("diagnostic transform intent digest is invalid")
    ticker, input_thesis_sha, input_decision_sha = _validate_diagnostic_seal(
        seal, expected_root, run_abs, repo_abs
    )
    if value.get("ticker") != ticker or value.get("diagnostic_input_seal") != {
        "path": f"{expected_root}/{DIAGNOSTIC_SEAL}", "sha256": seal["seal_sha256"]
    }:
        raise ValueError("diagnostic transform intent does not bind the exact input seal")
    if value.get("transform") != {
        "name": "full-integrity-deterministic-transforms",
        "version": DIAGNOSTIC_TRANSFORM_VERSION,
    }:
        raise ValueError("diagnostic transform intent generator contract is invalid")
    if value.get("inputs") != {
        "final_thesis": {"path": f"{expected_root}/final_thesis.md", "sha256": input_thesis_sha},
        "decision_record": {"path": f"{expected_root}/decision_record.json", "sha256": input_decision_sha},
    }:
        raise ValueError("diagnostic transform intent input bindings are invalid")
    reports, _ = _validate_diagnostic_report_bindings(
        value.get("diagnostic_reports"), seal, expected_root, run_abs, repo_abs
    )
    decision_snapshot = _read_json(os.path.join(repo_abs, seal["inputs"]["decision_record"]["snapshot_path"]))
    with open(os.path.join(repo_abs, seal["inputs"]["final_thesis"]["snapshot_path"]), encoding="utf-8") as handle:
        thesis_snapshot = handle.read()
    expected_thesis, expected_decision, expected_messages = _render_diagnostic_outputs(
        decision_snapshot, thesis_snapshot, reports
    )
    outputs = value.get("outputs")
    if not isinstance(outputs, dict) or set(outputs) != {"final_thesis", "decision_record"}:
        raise ValueError("diagnostic transform intent output bindings are invalid")
    expected_bytes = {"final_thesis": expected_thesis, "decision_record": expected_decision}
    for kind, content in expected_bytes.items():
        row = outputs.get(kind)
        digest = hashlib.sha256(content).hexdigest()
        if row != {
            "path": f"{expected_root}/{'final_thesis.md' if kind == 'final_thesis' else 'decision_record.json'}",
            "sha256": digest,
            "snapshot_path": _diagnostic_output_path(expected_root, kind, digest),
        }:
            raise ValueError(f"diagnostic transform intent {kind} output binding is invalid")
        snapshot = os.path.join(repo_abs, row["snapshot_path"])
        if not _regular_file(snapshot, nonempty=True):
            raise ValueError(f"diagnostic transform {kind} output snapshot is missing")
        with open(snapshot, "rb") as handle:
            if handle.read() != content:
                raise ValueError(f"diagnostic transform {kind} output snapshot bytes changed")
    if value.get("messages") != expected_messages:
        raise ValueError("diagnostic transform intent messages do not match the deterministic result")
    return expected_messages


def _diagnostic_transform_live_state(
    intent: dict[str, Any], expected_root: str, run_abs: str
) -> tuple[str, str]:
    states: list[str] = []
    for kind, live_name in (("final_thesis", "final_thesis.md"), ("decision_record", "decision_record.json")):
        path = os.path.join(run_abs, live_name)
        if not _regular_file(path, nonempty=True):
            raise ValueError(f"diagnostic transform live {live_name} is missing or unsafe; preserve the run")
        digest = file_digest(path)
        if digest == intent["outputs"][kind]["sha256"]:
            states.append("output")
        elif digest == intent["inputs"][kind]["sha256"]:
            states.append("input")
        else:
            raise ValueError(
                f"diagnostic transform found unknown bytes at {expected_root}/{live_name}; "
                "preserve them and start a new dated run"
            )
    if all(state == "output" for state in states):
        return "transformed", "live pair exactly matches the staged deterministic outputs"
    return "transform_incomplete", "live pair is an enumerated input/output crash state"


def apply_diagnostic_transforms(run_root: str, repo: str = REPO) -> dict[str, Any]:
    expected_root, run_abs, repo_abs = _resolve_run(run_root, repo)
    lock_fd = os.open(run_abs, os.O_RDONLY)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        if any(
            os.path.lexists(os.path.join(run_abs, name))
            for name in (AUDIT_SEAL, DIAGNOSTIC_CHECKPOINT, "idea_projection_manifest.json", "idea_admission.json")
        ):
            raise ValueError("cannot apply diagnostic transforms after a later completion boundary")
        seal = _read_json(os.path.join(run_abs, DIAGNOSTIC_SEAL))
        ticker, thesis_sha, decision_sha = _validate_diagnostic_seal(
            seal, expected_root, run_abs, repo_abs
        )
        intent_path = os.path.join(run_abs, DIAGNOSTIC_TRANSFORM_INTENT)
        if _regular_file(intent_path, nonempty=True):
            intent = _read_json(intent_path)
            messages = _validate_diagnostic_transform_intent(
                intent, expected_root, run_abs, repo_abs, seal
            )
        else:
            if os.path.lexists(intent_path):
                raise ValueError("diagnostic transform intent path is unsafe")
            state, reason = _current_pair_state(expected_root, run_abs, thesis_sha, decision_sha)
            if state != "ready":
                raise ValueError(reason + "; refusing to overwrite unknown bytes")
            audits = _bound_audit_plan(
                expected_root, run_abs, ticker, thesis_sha, decision_sha,
                seal["minimum_versions"], "diagnostic",
            )
            missing = [kind for kind, row in audits.items() if row["action"] != "reuse"]
            if missing:
                raise ValueError("cannot transform an incomplete diagnostic audit set: " + ", ".join(missing))
            report_bindings = {
                kind: {
                    "path": row["reusable_path"], "sha256": row["reusable_sha256"],
                    "version": row["reusable_version"],
                }
                for kind, row in audits.items()
            }
            reports, _ = _validate_diagnostic_report_bindings(
                report_bindings, seal, expected_root, run_abs, repo_abs
            )
            decision = _read_json(os.path.join(run_abs, "decision_record.json"))
            with open(os.path.join(run_abs, "final_thesis.md"), encoding="utf-8") as handle:
                thesis = handle.read()
            thesis_bytes, decision_bytes, messages = _render_diagnostic_outputs(decision, thesis, reports)
            directory = _diagnostic_output_dir(run_abs, create=True)
            assert directory is not None
            outputs: dict[str, Any] = {}
            for kind, live_name, content in (
                ("final_thesis", "final_thesis.md", thesis_bytes),
                ("decision_record", "decision_record.json", decision_bytes),
            ):
                digest = hashlib.sha256(content).hexdigest()
                snapshot_path = _diagnostic_output_path(expected_root, kind, digest)
                snapshot_abs = os.path.join(repo_abs, snapshot_path)
                if os.path.lexists(snapshot_abs):
                    if not _regular_file(snapshot_abs, nonempty=True):
                        raise ValueError("diagnostic transform output snapshot path is unsafe")
                    with open(snapshot_abs, "rb") as handle:
                        if handle.read() != content:
                            raise ValueError("diagnostic transform output snapshot path has different bytes")
                else:
                    _atomic_bytes(snapshot_abs, content, ".diagnostic-output-")
                outputs[kind] = {
                    "path": f"{expected_root}/{live_name}", "sha256": digest,
                    "snapshot_path": snapshot_path,
                }
            intent = {
                "schema_version": DIAGNOSTIC_TRANSFORM_INTENT_SCHEMA,
                "run_root": expected_root,
                "ticker": ticker,
                "prepared_at": _now(),
                "diagnostic_input_seal": {
                    "path": f"{expected_root}/{DIAGNOSTIC_SEAL}", "sha256": seal["seal_sha256"],
                },
                "diagnostic_reports": report_bindings,
                "transform": {
                    "name": "full-integrity-deterministic-transforms",
                    "version": DIAGNOSTIC_TRANSFORM_VERSION,
                },
                "inputs": {
                    "final_thesis": {"path": f"{expected_root}/final_thesis.md", "sha256": thesis_sha},
                    "decision_record": {"path": f"{expected_root}/decision_record.json", "sha256": decision_sha},
                },
                "outputs": outputs,
                "messages": messages,
            }
            intent["intent_sha256"] = canonical_sha256(intent)
            _atomic_json(intent_path, intent, ".diagnostic-transform-intent-")
        state, _ = _diagnostic_transform_live_state(intent, expected_root, run_abs)
        if state != "transformed":
            for kind, live_name in (
                ("final_thesis", "final_thesis.md"), ("decision_record", "decision_record.json")
            ):
                live = os.path.join(run_abs, live_name)
                if file_digest(live) == intent["outputs"][kind]["sha256"]:
                    continue
                snapshot = os.path.join(repo_abs, intent["outputs"][kind]["snapshot_path"])
                with open(snapshot, "rb") as handle:
                    _atomic_bytes(live, handle.read(), ".diagnostic-transform-")
        state, reason = _diagnostic_transform_live_state(intent, expected_root, run_abs)
        if state != "transformed":
            raise ValueError("diagnostic transform did not reach its exact staged output pair")
        return {
            "status": "transformed", "run_root": expected_root,
            "intent_path": f"{expected_root}/{DIAGNOSTIC_TRANSFORM_INTENT}",
            "intent_sha256": intent["intent_sha256"], "messages": messages, "reason": reason,
        }
    finally:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        finally:
            os.close(lock_fd)


def _validate_diagnostic_transform_shape(
    run_abs: str, pre_mortem_path: str, expectations_path: str, verification_path: str
) -> None:
    decision = _read_json(os.path.join(run_abs, "decision_record.json"))
    pre_mortem = _read_json(pre_mortem_path)
    expected_fields = {
        "confidence_haircut", "pre_mortem_verdict", "post_review_confidence_score",
        "post_mortem_decision", "post_mortem_basket",
    }
    if not expected_fields.issubset(decision):
        raise ValueError("deterministic diagnostic checkpoint is missing haircut/rating-cap fields")
    if (
        decision.get("pre_mortem_verdict") != pre_mortem.get("verdict")
        or decision.get("post_review_confidence_score") != pre_mortem.get("recommended_confidence")
    ):
        raise ValueError("deterministic diagnostic checkpoint does not reconcile the pre-mortem result")
    terminal = pre_mortem.get("verdict") in {"Thesis broken", "Does not survive — downgrade"}
    original_basket = decision.get("basket") or ""
    expected_decision = (
        "Watchlist" if terminal and original_basket in {"Selected", "Short"}
        else (decision.get("decision") or "")
    )
    expected_basket = (
        "Watchlist" if terminal and original_basket in {"Selected", "Short"}
        else original_basket
    )
    if (
        decision.get("post_mortem_decision") != expected_decision
        or decision.get("post_mortem_basket") != expected_basket
    ):
        raise ValueError("deterministic diagnostic checkpoint does not carry the required rating cap")
    with open(os.path.join(run_abs, "final_thesis.md"), encoding="utf-8") as handle:
        thesis = handle.read()
    verification = _read_json(verification_path)
    if verification.get("verdict") not in {"Clean", "Minor issues"} and not (
        "PROVISIONAL — the automated finish-gate" in thesis
        and ("verify-evidence" in thesis or "truth-integrity" in thesis or "verification_report" in thesis)
    ):
        raise ValueError("deterministic diagnostic checkpoint omitted the required verification banner")
    expectations = _read_json(expectations_path)
    confidence = decision.get("confidence_score")
    no_edge = (
        str(expectations.get("variant_perception_quality") or "").strip().casefold()
        in {"", "none", "weak"}
        or expectations.get("is_exploitable") is False
    )
    if (
        no_edge
        and isinstance(confidence, (int, float))
        and not isinstance(confidence, bool)
        and confidence > 60
        and not (
            "PROVISIONAL — the automated finish-gate" in thesis
            and "expectations-gap audit" in thesis
        )
    ):
        raise ValueError("deterministic diagnostic checkpoint omitted the required expectations banner")


def _validate_diagnostic_checkpoint(
    value: dict[str, Any], expected_root: str, run_abs: str, repo_abs: str,
    seal: dict[str, Any]
) -> tuple[str, str, str]:
    if set(value) != {
        "schema_version", "run_root", "ticker", "completed_at", "diagnostic_input_seal",
        "diagnostic_reports", "transform_intent", "transform", "prewrite", "outputs",
        "checkpoint_sha256",
    }:
        raise ValueError("diagnostic derived-pair checkpoint fields are malformed")
    if (
        value.get("schema_version") != DIAGNOSTIC_CHECKPOINT_SCHEMA
        or value.get("run_root") != expected_root
        or not _aware_timestamp(value.get("completed_at"))
    ):
        raise ValueError("diagnostic derived-pair checkpoint identity or timestamp is invalid")
    payload = dict(value)
    recorded = payload.pop("checkpoint_sha256", None)
    if not isinstance(recorded, str) or not HEX64.fullmatch(recorded) or recorded != canonical_sha256(payload):
        raise ValueError("diagnostic derived-pair checkpoint digest is invalid")
    if value.get("diagnostic_input_seal") != {
        "path": f"{expected_root}/{DIAGNOSTIC_SEAL}",
        "sha256": seal["seal_sha256"],
    }:
        raise ValueError("diagnostic derived-pair checkpoint does not bind the exact input seal")
    intent = _read_json(os.path.join(run_abs, DIAGNOSTIC_TRANSFORM_INTENT))
    _validate_diagnostic_transform_intent(intent, expected_root, run_abs, repo_abs, seal)
    if value.get("transform_intent") != {
        "path": f"{expected_root}/{DIAGNOSTIC_TRANSFORM_INTENT}",
        "sha256": intent["intent_sha256"],
    }:
        raise ValueError("diagnostic derived-pair checkpoint does not bind the exact transform intent")
    state, _ = _diagnostic_transform_live_state(intent, expected_root, run_abs)
    if state != "transformed":
        raise ValueError("diagnostic transform intent has not reached its exact output pair")
    if value.get("transform") != {
        "name": "full-integrity-deterministic-transforms",
        "version": DIAGNOSTIC_TRANSFORM_VERSION,
    }:
        raise ValueError("diagnostic derived-pair transform contract is invalid")
    prewrite = value.get("prewrite")
    if (
        not isinstance(prewrite, dict)
        or set(prewrite) != {
            "validator", "validator_sha256", "decision_record_sha256", "result"
        }
        or prewrite.get("validator") != "scripts/eval.py --data-needs-prewrite"
        or not isinstance(prewrite.get("validator_sha256"), str)
        or not HEX64.fullmatch(prewrite["validator_sha256"])
        or prewrite.get("decision_record_sha256")
        != intent["outputs"]["decision_record"]["sha256"]
        or prewrite.get("result") != "PASS"
    ):
        raise ValueError("diagnostic checkpoint has no exact successful data-needs prewrite receipt")
    ticker, input_thesis_sha, input_decision_sha = _validate_diagnostic_seal(
        seal, expected_root, run_abs, repo_abs
    )
    if value.get("ticker") != ticker:
        raise ValueError("diagnostic derived-pair checkpoint ticker is invalid")
    reports = value.get("diagnostic_reports")
    if not isinstance(reports, dict) or set(reports) != set(AUDIT_KINDS):
        raise ValueError("diagnostic derived-pair report map is invalid")
    report_paths: dict[str, str] = {}
    for kind, row in reports.items():
        if not isinstance(row, dict) or set(row) != {"path", "sha256", "version"}:
            raise ValueError(f"diagnostic derived-pair {kind} report binding is malformed")
        version = row.get("version")
        if (
            not isinstance(version, int)
            or isinstance(version, bool)
            or version < seal["minimum_versions"][kind]
            or row.get("path") != f"{expected_root}/{_audit_filename(kind, version)}"
            or not isinstance(row.get("sha256"), str)
            or not HEX64.fullmatch(row["sha256"])
        ):
            raise ValueError(f"diagnostic derived-pair {kind} report identity is invalid")
        report_abs = os.path.join(repo_abs, row["path"])
        if not _regular_file(report_abs, nonempty=True) or file_digest(report_abs) != row["sha256"]:
            raise ValueError(f"diagnostic derived-pair {kind} report bytes are missing or changed")
        validate_bound_audit(
            kind,
            report_abs,
            expected_root,
            ticker,
            input_thesis_sha,
            input_decision_sha,
            require_canonical_fields=True,
        )
        report_paths[kind] = report_abs
    outputs = value.get("outputs")
    if not isinstance(outputs, dict) or set(outputs) != {"final_thesis", "decision_record"}:
        raise ValueError("diagnostic derived-pair output map is invalid")
    expected_outputs = {
        kind: {"path": row["path"], "sha256": row["sha256"]}
        for kind, row in intent["outputs"].items()
    }
    if outputs != expected_outputs:
        raise ValueError("diagnostic checkpoint outputs do not equal the exact transform-intent outputs")
    _validate_diagnostic_transform_shape(
        run_abs,
        report_paths["pre_mortem"],
        report_paths["expectations_gap"],
        report_paths["verification"],
    )
    return ticker, expected_outputs["final_thesis"]["sha256"], expected_outputs["decision_record"]["sha256"]


def _run_data_needs_prewrite(repo_abs: str, decision_path: str, decision_sha: str) -> dict[str, str]:
    validator = os.path.join(repo_abs, "scripts", "eval.py")
    if not _regular_file(validator, nonempty=True):
        raise ValueError("scripts/eval.py is missing or unsafe for the data-needs prewrite gate")
    completed = subprocess.run(
        [sys.executable, validator, "--data-needs-prewrite", decision_path],
        cwd=repo_abs,
        text=True,
        capture_output=True,
        timeout=120,
        check=False,
    )
    if completed.returncode != 0 or "DATA-NEEDS-PREWRITE: PASS" not in completed.stdout:
        detail = (completed.stderr or completed.stdout or "validator returned no detail").strip()
        raise ValueError("data-needs prewrite failed; refusing completion checkpoint: " + detail[:2000])
    return {
        "validator": "scripts/eval.py --data-needs-prewrite",
        "validator_sha256": file_digest(validator),
        "decision_record_sha256": decision_sha,
        "result": "PASS",
    }


def checkpoint_diagnostic_pair(run_root: str, repo: str = REPO) -> dict[str, Any]:
    expected_root, run_abs, repo_abs = _resolve_run(run_root, repo)
    target = os.path.join(run_abs, DIAGNOSTIC_CHECKPOINT)
    lock_fd = os.open(run_abs, os.O_RDONLY)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        seal = _read_json(os.path.join(run_abs, DIAGNOSTIC_SEAL))
        ticker, input_thesis_sha, input_decision_sha = _validate_diagnostic_seal(
            seal, expected_root, run_abs, repo_abs
        )
        if _regular_file(target, nonempty=True):
            existing = _read_json(target)
            _validate_diagnostic_checkpoint(existing, expected_root, run_abs, repo_abs, seal)
            return {
                "status": "existing",
                "path": f"{expected_root}/{DIAGNOSTIC_CHECKPOINT}",
                "checkpoint_sha256": existing["checkpoint_sha256"],
            }
        if os.path.lexists(target):
            raise ValueError("diagnostic derived-pair checkpoint path is unsafe")
        if any(
            os.path.lexists(os.path.join(run_abs, name))
            for name in (AUDIT_SEAL, "idea_projection_manifest.json", "idea_admission.json")
        ):
            raise ValueError("cannot checkpoint diagnostic transforms after a later completion boundary")
        intent = _read_json(os.path.join(run_abs, DIAGNOSTIC_TRANSFORM_INTENT))
        _validate_diagnostic_transform_intent(intent, expected_root, run_abs, repo_abs, seal)
        state, _ = _diagnostic_transform_live_state(intent, expected_root, run_abs)
        if state != "transformed":
            raise ValueError("cannot checkpoint an incomplete diagnostic transform intent")
        audits = _bound_audit_plan(
            expected_root,
            run_abs,
            ticker,
            input_thesis_sha,
            input_decision_sha,
            seal["minimum_versions"],
            "diagnostic",
        )
        missing = [kind for kind, row in audits.items() if row["action"] != "reuse"]
        if missing:
            raise ValueError("cannot checkpoint an incomplete diagnostic audit set: " + ", ".join(missing))
        _, thesis_sha, decision_sha = _terminal_pair(expected_root, run_abs)
        if (
            thesis_sha != intent["outputs"]["final_thesis"]["sha256"]
            or decision_sha != intent["outputs"]["decision_record"]["sha256"]
        ):
            raise ValueError("live pair does not equal the exact transform-intent outputs")
        prewrite = _run_data_needs_prewrite(
            repo_abs, os.path.join(run_abs, "decision_record.json"), decision_sha
        )
        report_paths = {
            kind: os.path.join(repo_abs, row["reusable_path"]) for kind, row in audits.items()
        }
        _validate_diagnostic_transform_shape(
            run_abs,
            report_paths["pre_mortem"],
            report_paths["expectations_gap"],
            report_paths["verification"],
        )
        payload: dict[str, Any] = {
            "schema_version": DIAGNOSTIC_CHECKPOINT_SCHEMA,
            "run_root": expected_root,
            "ticker": ticker,
            "completed_at": _now(),
            "diagnostic_input_seal": {
                "path": f"{expected_root}/{DIAGNOSTIC_SEAL}",
                "sha256": seal["seal_sha256"],
            },
            "transform_intent": {
                "path": f"{expected_root}/{DIAGNOSTIC_TRANSFORM_INTENT}",
                "sha256": intent["intent_sha256"],
            },
            "diagnostic_reports": {
                kind: {
                    "path": row["reusable_path"],
                    "sha256": row["reusable_sha256"],
                    "version": row["reusable_version"],
                }
                for kind, row in audits.items()
            },
            "transform": {
                "name": "full-integrity-deterministic-transforms",
                "version": DIAGNOSTIC_TRANSFORM_VERSION,
            },
            "prewrite": prewrite,
            "outputs": {
                "final_thesis": {
                    "path": intent["outputs"]["final_thesis"]["path"],
                    "sha256": intent["outputs"]["final_thesis"]["sha256"],
                },
                "decision_record": {
                    "path": intent["outputs"]["decision_record"]["path"],
                    "sha256": intent["outputs"]["decision_record"]["sha256"],
                },
            },
        }
        payload["checkpoint_sha256"] = canonical_sha256(payload)
        _atomic_json(target, payload, ".diagnostic-derived-pair-")
        return {
            "status": "created",
            "path": f"{expected_root}/{DIAGNOSTIC_CHECKPOINT}",
            "checkpoint_sha256": payload["checkpoint_sha256"],
        }
    finally:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        finally:
            os.close(lock_fd)


def _seal_payload(expected_root: str, run_abs: str) -> dict[str, Any]:
    ticker, thesis_sha, decision_sha = _terminal_pair(expected_root, run_abs)
    payload: dict[str, Any] = {
        "schema_version": AUDIT_SEAL_SCHEMA,
        "run_root": expected_root,
        "ticker": ticker,
        "sealed_at": _now(),
        "inputs": {
            "final_thesis": {"path": "final_thesis.md", "sha256": thesis_sha},
            "decision_record": {"path": "decision_record.json", "sha256": decision_sha},
        },
        "minimum_versions": {
            kind: _next_audit_version(_audit_rows(run_abs, kind)) for kind in AUDIT_KINDS
        },
    }
    payload["seal_sha256"] = canonical_sha256(payload)
    return payload


def _validate_audit_seal(
    value: dict[str, Any], expected_root: str, run_abs: str
) -> tuple[str, str, str]:
    if set(value) != {
        "schema_version", "run_root", "ticker", "sealed_at", "inputs",
        "minimum_versions", "seal_sha256",
    }:
        raise ValueError("final audit input seal fields are malformed")
    if value.get("schema_version") != AUDIT_SEAL_SCHEMA or value.get("run_root") != expected_root:
        raise ValueError("final audit input seal identity or schema is invalid")
    if not _aware_timestamp(value.get("sealed_at")):
        raise ValueError("final audit input seal timestamp is invalid")
    payload = dict(value)
    recorded = payload.pop("seal_sha256", None)
    if not isinstance(recorded, str) or not HEX64.fullmatch(recorded) or recorded != canonical_sha256(payload):
        raise ValueError("final audit input seal digest is invalid")
    ticker, thesis_sha, decision_sha = _terminal_pair(expected_root, run_abs)
    if value.get("ticker") != ticker:
        raise ValueError("final audit input seal ticker does not match the terminal pair")
    expected_inputs = {
        "final_thesis": {"path": "final_thesis.md", "sha256": thesis_sha},
        "decision_record": {"path": "decision_record.json", "sha256": decision_sha},
    }
    if value.get("inputs") != expected_inputs:
        raise ValueError("terminal-pair bytes changed after the final audit input seal")
    minimum = value.get("minimum_versions")
    if (
        not isinstance(minimum, dict)
        or set(minimum) != set(AUDIT_KINDS)
        or any(not isinstance(minimum[kind], int) or isinstance(minimum[kind], bool) or minimum[kind] < 1
               for kind in AUDIT_KINDS)
    ):
        raise ValueError("final audit input seal minimum-version map is invalid")
    return ticker, thesis_sha, decision_sha


def seal_final_audit_inputs(run_root: str, repo: str = REPO) -> dict[str, Any]:
    expected_root, run_abs, repo_abs = _resolve_run(run_root, repo)
    target = os.path.join(run_abs, AUDIT_SEAL)
    lock_fd = os.open(run_abs, os.O_RDONLY)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        if _regular_file(target, nonempty=True):
            existing = _read_json(target)
            _validate_audit_seal(existing, expected_root, run_abs)
            return {"status": "existing", "path": expected_root + "/" + AUDIT_SEAL,
                    "seal_sha256": existing["seal_sha256"]}
        if os.path.lexists(target):
            raise ValueError("final audit input seal path exists but is not a valid regular file")
        if os.path.exists(os.path.join(run_abs, "idea_projection_manifest.json")) or os.path.exists(
            os.path.join(run_abs, "idea_admission.json")
        ):
            raise ValueError("cannot create a final audit input seal after projection/admission sealing")
        diagnostic_seal_path = os.path.join(run_abs, DIAGNOSTIC_SEAL)
        run_date = expected_root.rsplit("_", 1)[-1]
        if run_date >= PAID_COMPLETION_ROLLOUT_DATE and not os.path.lexists(diagnostic_seal_path):
            raise ValueError(
                "rollout-date final audit sealing requires diagnostic inputs, transform intent, and prewrite checkpoint"
            )
        if os.path.lexists(diagnostic_seal_path):
            diagnostic_seal = _read_json(diagnostic_seal_path)
            _validate_diagnostic_seal(diagnostic_seal, expected_root, run_abs, repo_abs)
            checkpoint = _read_json(os.path.join(run_abs, DIAGNOSTIC_CHECKPOINT))
            _validate_diagnostic_checkpoint(
                checkpoint, expected_root, run_abs, repo_abs, diagnostic_seal
            )
        payload = _seal_payload(expected_root, run_abs)
        _atomic_json(target, payload, ".final-audit-inputs-")
        return {"status": "created", "path": expected_root + "/" + AUDIT_SEAL,
                "seal_sha256": payload["seal_sha256"]}
    finally:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        finally:
            os.close(lock_fd)


def final_audit_plan(run_root: str, repo: str = REPO) -> dict[str, Any]:
    expected_root, run_abs, _ = _resolve_run(run_root, repo)
    seal_path = os.path.join(run_abs, AUDIT_SEAL)
    if not os.path.lexists(seal_path):
        _terminal_pair(expected_root, run_abs)
        return {
            "schema_version": AUDIT_PLAN_SCHEMA,
            "status": "unsealed",
            "run_root": expected_root,
            "all_complete": False,
            "audits": {},
        }
    seal = _read_json(seal_path)
    ticker, thesis_sha, decision_sha = _validate_audit_seal(seal, expected_root, run_abs)
    audits: dict[str, Any] = {}
    for kind in AUDIT_KINDS:
        rows = _audit_rows(run_abs, kind)
        next_version = _next_audit_version(rows)
        next_path = expected_root + "/" + _audit_filename(kind, next_version)
        action = "run"
        reason = "canonical audit is missing"
        reusable_path = None
        reusable_version = None
        if rows:
            highest = rows[-1][0]
            top = [row for row in rows if row[0] == highest]
            if len(top) != 1:
                reason = f"latest canonical version {highest} is ambiguous"
            elif highest < seal["minimum_versions"][kind]:
                reason = (
                    f"latest canonical version {highest} predates reserved final version "
                    f"{seal['minimum_versions'][kind]}"
                )
            else:
                version, name, path = top[0]
                if not _regular_file(path, nonempty=True):
                    reason = "latest canonical audit is missing, empty, or not a direct regular file"
                else:
                    try:
                        validate_bound_audit(
                            kind, path, expected_root, ticker, thesis_sha, decision_sha,
                            require_canonical_fields=True,
                        )
                    except (OSError, TypeError, ValueError, json.JSONDecodeError) as exc:
                        reason = str(exc)
                    else:
                        action = "reuse"
                        reason = "latest canonical audit exactly matches the final sealed inputs"
                        reusable_path = expected_root + "/" + name
                        reusable_version = version
        audits[kind] = {
            "action": action,
            "reason": reason,
            "reusable_path": reusable_path,
            "reusable_version": reusable_version,
            "next_output_path": None if action == "reuse" else next_path,
            "minimum_final_version": seal["minimum_versions"][kind],
        }
    return {
        "schema_version": AUDIT_PLAN_SCHEMA,
        "status": "sealed",
        "run_root": expected_root,
        "seal_path": expected_root + "/" + AUDIT_SEAL,
        "seal_sha256": seal["seal_sha256"],
        "all_complete": all(row["action"] == "reuse" for row in audits.values()),
        "audits": audits,
    }


def require_final_audits(run_root: str, repo: str = REPO) -> dict[str, Any]:
    plan = final_audit_plan(run_root, repo)
    if plan["status"] != "sealed":
        raise ValueError("final audit inputs are not sealed")
    missing = [kind for kind, row in plan["audits"].items() if row["action"] != "reuse"]
    if missing:
        raise ValueError("final audit set is incomplete or stale: " + ", ".join(missing))
    return plan


def require_projection_paid_completion(run_root: str, repo: str = REPO) -> dict[str, Any]:
    expected_root, run_abs, _ = _resolve_run(run_root, repo)
    diagnostic_path = os.path.join(run_abs, DIAGNOSTIC_SEAL)
    diagnostic_receipt = None
    run_date = expected_root.rsplit("_", 1)[-1]
    if run_date >= PAID_COMPLETION_ROLLOUT_DATE and not os.path.lexists(diagnostic_path):
        raise ValueError("rollout-date projection authority requires diagnostic_audit_inputs.json")
    if os.path.lexists(diagnostic_path):
        diagnostic = diagnostic_audit_plan(run_root, repo)
        if diagnostic.get("status") != "derived_checkpointed":
            raise ValueError("diagnostic transform/prewrite completion is not checkpointed")
        checkpoint = _read_json(os.path.join(run_abs, DIAGNOSTIC_CHECKPOINT))
        diagnostic_receipt = {
            "path": f"{expected_root}/{DIAGNOSTIC_CHECKPOINT}",
            "sha256": checkpoint["checkpoint_sha256"],
        }
    if not os.path.lexists(os.path.join(run_abs, AUDIT_SEAL)):
        raise ValueError("final_audit_inputs.json is missing")
    final = require_final_audits(run_root, repo)
    return {
        "schema_version": PROJECTION_AUTHORITY_SCHEMA,
        "status": "complete",
        "run_root": expected_root,
        "diagnostic_checkpoint": diagnostic_receipt,
        "final_audit_input_seal": {
            "path": final["seal_path"], "sha256": final["seal_sha256"],
        },
        "final_audits": {
            kind: {
                "path": row["reusable_path"],
                "version": row["reusable_version"],
            }
            for kind, row in final["audits"].items()
        },
    }


def _master_receipt_parent(run_abs: str, *, create: bool) -> str:
    parent = os.path.join(run_abs, RECEIPT_PARENT)
    if os.path.lexists(parent):
        if os.path.islink(parent) or not os.path.isdir(parent):
            raise ValueError("master-synthesis completion-receipt directory is unsafe")
    elif create:
        os.mkdir(parent, 0o755)
        _fsync_directory(run_abs)
    return parent


def _master_attempt_path(run_abs: str, *, create_parent: bool) -> str:
    return os.path.join(_master_receipt_parent(run_abs, create=create_parent), MASTER_ATTEMPT)


def _master_promotion_path(run_abs: str) -> str:
    return os.path.join(_master_receipt_parent(run_abs, create=False), MASTER_PROMOTION)


def _sweep_master_nonactive_staging(
    run_abs: str, repo_abs: str, active: dict[str, Any] | None
) -> None:
    """Retire only helper-namespaced attempt dirs not named by the durable active pointer."""
    del repo_abs  # Paths are derived from the already-resolved run root, never from caller input.
    attempts_parent = os.path.join(
        _master_receipt_parent(run_abs, create=False), MASTER_ATTEMPT_DIR
    )
    if not os.path.lexists(attempts_parent):
        return
    if os.path.islink(attempts_parent) or not os.path.isdir(attempts_parent):
        raise ValueError("master-synthesis attempts directory is unsafe")
    active_id = active.get("attempt_id") if isinstance(active, dict) else None
    if active_id is not None and not re.fullmatch(r"[a-f0-9]{32}", active_id):
        raise ValueError("active master-synthesis attempt id is invalid")
    for entry in sorted(os.scandir(attempts_parent), key=lambda row: row.name):
        if entry.name == active_id:
            continue
        if (
            not re.fullmatch(r"[a-f0-9]{32}", entry.name)
            or entry.is_symlink()
            or not entry.is_dir(follow_symlinks=False)
        ):
            raise ValueError("master-synthesis attempts directory contains an unknown entry")
        _remove_owned_tree(entry.path, attempts_parent)


def _master_work(expected_root: str, run_abs: str, repo_abs: str) -> dict[str, Any]:
    sources: list[dict[str, str]] = []
    for entry in sorted(os.scandir(run_abs), key=lambda item: item.name):
        if not entry.is_dir(follow_symlinks=False) or not re.fullmatch(r"[A-Za-z0-9_-]+", entry.name):
            continue
        matches = [
            name for name in sorted(os.listdir(entry.path))
            if re.fullmatch(r"99_.*-synthesis\.md", name)
        ]
        if not matches:
            continue
        if len(matches) != 1:
            raise ValueError(f"module {entry.name} has an ambiguous synthesis input set")
        path = os.path.join(entry.path, matches[0])
        if not _regular_file(path, nonempty=True):
            raise ValueError(f"module {entry.name} synthesis input is not a safe non-empty regular file")
        sources.append({
            "path": os.path.relpath(path, repo_abs).replace(os.sep, "/"),
            "sha256": file_digest(path),
        })
    if not sources:
        raise ValueError("master synthesis cannot be armed without a completed module synthesis")
    # Master-only reruns may change deterministic source authority without changing a module 99 file.
    # Bind that sidecar and every exact scoped intake plan present in this run so stale work cannot reuse
    # a completion from the prior evidence cursor.
    extra_paths = [
        os.path.join(run_abs, "_pool_extracts", "manifest.json"),
        os.path.join(run_abs, "_pool_extracts", "ciq_facts.json"),
    ]
    intake_dir = os.path.join(run_abs, "intake")
    if os.path.isdir(intake_dir) and not os.path.islink(intake_dir):
        extra_paths.extend(
            os.path.join(intake_dir, name)
            for name in sorted(os.listdir(intake_dir))
            if re.fullmatch(r"[A-Za-z0-9_.-]*_intake_plan(?:_v\d+)?\.json", name)
        )
    for path in extra_paths:
        if not os.path.lexists(path):
            continue
        if not _regular_file(path, nonempty=True):
            raise ValueError("master deterministic/scoped source binding is unsafe")
        sources.append({
            "path": os.path.relpath(path, repo_abs).replace(os.sep, "/"),
            "sha256": file_digest(path),
        })
    sources.sort(key=lambda row: row["path"])
    spec_rel = ".claude/agents/synthesizer.md"
    spec_abs = os.path.join(repo_abs, spec_rel)
    if not _regular_file(spec_abs, nonempty=True):
        raise ValueError("master synthesizer contract is missing or unsafe")
    return {
        "run_root": expected_root,
        "sources": sources,
        "generator": {
            "name": "synthesizer",
            "version": "master-synthesizer/v1",
            "spec_path": spec_rel,
            "spec_sha256": file_digest(spec_abs),
        },
        "outputs": [f"{expected_root}/{name}" for name in MASTER_OUTPUTS],
    }


def _validate_master_attempt(
    attempt: dict[str, Any], attempt_path: str, expected_root: str,
    run_abs: str, repo_abs: str, *, require_staging: bool = True,
) -> None:
    if set(attempt) != {
        "schema_version", "armed_at", "attempt_id", "work", "work_sha256", "prior_outputs",
        "staging_dir", "staged_outputs", "attempt_sha256",
    } or attempt.get("schema_version") != MASTER_ATTEMPT_SCHEMA:
        raise ValueError("master-synthesis attempt schema is invalid")
    payload = dict(attempt)
    recorded = payload.pop("attempt_sha256", None)
    if not isinstance(recorded, str) or not HEX64.fullmatch(recorded) or recorded != canonical_sha256(payload):
        raise ValueError("master-synthesis attempt digest is invalid")
    if _timestamp(attempt.get("armed_at")) is None:
        raise ValueError("master-synthesis attempt timestamp is invalid")
    attempt_id = attempt.get("attempt_id")
    if not isinstance(attempt_id, str) or not re.fullmatch(r"[a-f0-9]{32}", attempt_id):
        raise ValueError("master-synthesis attempt id is invalid")
    # Validate the recorded work authority, not today's live sources.  A paid Task remains recoverable
    # across a code deploy or later pool landing; current-work comparison belongs only to a new arm/rerun.
    work = attempt.get("work")
    if not isinstance(work, dict) or set(work) != {"run_root", "sources", "generator", "outputs"}:
        raise ValueError("master-synthesis recorded work schema is invalid")
    sources = work.get("sources")
    generator = work.get("generator")
    if (
        work.get("run_root") != expected_root
        or work.get("outputs") != [f"{expected_root}/{name}" for name in MASTER_OUTPUTS]
        or not isinstance(sources, list) or not sources
        or sources != sorted(sources, key=lambda row: row.get("path", "") if isinstance(row, dict) else "")
        or not isinstance(generator, dict)
        or generator.get("name") != "synthesizer"
        or generator.get("version") != "master-synthesizer/v1"
        or generator.get("spec_path") != ".claude/agents/synthesizer.md"
        or not isinstance(generator.get("spec_sha256"), str)
        or not HEX64.fullmatch(generator["spec_sha256"])
        or attempt.get("work_sha256") != canonical_sha256(work)
    ):
        raise ValueError("master-synthesis recorded work authority is invalid")
    source_paths: list[str] = []
    for row in sources:
        if (
            not isinstance(row, dict) or set(row) != {"path", "sha256"}
            or not isinstance(row.get("path"), str)
            or not row["path"].startswith(expected_root + "/")
            or ".." in row["path"].split("/")
            or not isinstance(row.get("sha256"), str) or not HEX64.fullmatch(row["sha256"])
        ):
            raise ValueError("master-synthesis recorded source binding is invalid")
        source_paths.append(row["path"])
    if len(source_paths) != len(set(source_paths)):
        raise ValueError("master-synthesis recorded source paths are not unique")
    prior = attempt.get("prior_outputs")
    if not isinstance(prior, dict) or set(prior) != set(MASTER_OUTPUTS):
        raise ValueError("master-synthesis prior-output set is invalid")
    for name in MASTER_OUTPUTS:
        row = prior.get(name)
        if (
            not isinstance(row, dict) or set(row) != {"path", "exists", "sha256"}
            or row.get("path") != f"{expected_root}/{name}"
            or not isinstance(row.get("exists"), bool)
            or (row["exists"] and (
                not isinstance(row.get("sha256"), str) or not HEX64.fullmatch(row["sha256"])
            ))
            or (not row["exists"] and row.get("sha256") is not None)
        ):
            raise ValueError("master-synthesis prior-output binding is invalid")
    if len({row["exists"] for row in prior.values()}) != 1:
        raise ValueError("master-synthesis attempt cannot bind a partial canonical trio")
    expected_staging = f"{expected_root}/{RECEIPT_PARENT}/{MASTER_ATTEMPT_DIR}/{attempt_id}"
    expected_staged = {
        name: f"{expected_staging}/{name}"
        for name in MASTER_OUTPUTS
    }
    if attempt.get("staging_dir") != expected_staging or attempt.get("staged_outputs") != expected_staged:
        raise ValueError("master-synthesis attempt staging paths are invalid")
    staging_abs = os.path.join(repo_abs, expected_staging)
    if require_staging and (os.path.islink(staging_abs) or not os.path.isdir(staging_abs)):
        raise ValueError("master-synthesis staging directory is missing or unsafe")
    info = os.lstat(attempt_path)
    if not stat.S_ISREG(info.st_mode):
        raise ValueError("master-synthesis attempt path is unsafe")


def arm_master_synthesis(
    run_root: str, repo: str = REPO, *, allow_existing: bool = False
) -> dict[str, Any]:
    """Arm one master Task with unique attempt-owned staging paths."""
    expected_root, run_abs, repo_abs = _resolve_run(run_root, repo)
    lock_fd = os.open(run_abs, os.O_RDONLY)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        if any(os.path.lexists(os.path.join(run_abs, name)) for name in (
            PROJECTION_MANIFEST, "idea_admission.json", AUDIT_SEAL, DIAGNOSTIC_SEAL
        )):
            raise ValueError("master synthesis cannot be armed after audit/projection/admission sealing")
        occupied = [name for name in MASTER_OUTPUTS if os.path.lexists(os.path.join(run_abs, name))]
        if occupied and not allow_existing:
            raise ValueError(
                "master synthesis cannot be armed over existing live outputs: " + ", ".join(occupied)
            )
        if occupied and (set(occupied) != set(MASTER_OUTPUTS) or not _master_trio_is_valid(
            expected_root, run_abs, repo_abs
        )):
            raise ValueError("master replacement requires one complete valid unsealed canonical trio")
        work = _master_work(expected_root, run_abs, repo_abs)
        attempt_path = _master_attempt_path(run_abs, create_parent=True)
        if os.path.lexists(attempt_path):
            attempt = _read_json(attempt_path)
            _validate_master_attempt(attempt, attempt_path, expected_root, run_abs, repo_abs)
            _sweep_master_nonactive_staging(run_abs, repo_abs, attempt)
            if not _master_prior_matches_live(run_abs, attempt):
                raise ValueError("canonical master outputs changed after the active attempt was armed")
            staged_present = [
                name for name, rel in attempt["staged_outputs"].items()
                if os.path.lexists(os.path.join(repo_abs, rel))
            ]
            if staged_present:
                raise ValueError("existing master attempt has staged outputs; run master-recover first")
            if attempt["work"] != work:
                attempt = _rotate_master_attempt(expected_root, run_abs, repo_abs, attempt)
                return {
                    "status": "rearmed", "run_root": expected_root,
                    "attempt_path": f"{expected_root}/{RECEIPT_PARENT}/{MASTER_ATTEMPT}",
                    "attempt_sha256": attempt["attempt_sha256"],
                    "output_dir": attempt["staging_dir"],
                    "staged_outputs": attempt["staged_outputs"],
                }
            return {
                "status": "existing", "run_root": expected_root,
                "attempt_path": f"{expected_root}/{RECEIPT_PARENT}/{MASTER_ATTEMPT}",
                "attempt_sha256": attempt["attempt_sha256"],
                "output_dir": attempt["staging_dir"],
                "staged_outputs": attempt["staged_outputs"],
            }
        attempt_id = secrets.token_hex(16)
        attempts_parent = os.path.join(
            _master_receipt_parent(run_abs, create=True), MASTER_ATTEMPT_DIR
        )
        if os.path.lexists(attempts_parent):
            if os.path.islink(attempts_parent) or not os.path.isdir(attempts_parent):
                raise ValueError("master-synthesis attempts directory is unsafe")
        else:
            os.mkdir(attempts_parent, 0o755)
            _fsync_directory(os.path.dirname(attempts_parent))
        staging_abs = os.path.join(attempts_parent, attempt_id)
        os.mkdir(staging_abs, 0o755)
        _fsync_directory(attempts_parent)
        staging_rel = f"{expected_root}/{RECEIPT_PARENT}/{MASTER_ATTEMPT_DIR}/{attempt_id}"
        prior = {
            name: {
                "path": f"{expected_root}/{name}",
                "exists": bool(occupied),
                "sha256": file_digest(os.path.join(run_abs, name)) if occupied else None,
            }
            for name in MASTER_OUTPUTS
        }
        payload: dict[str, Any] = {
            "schema_version": MASTER_ATTEMPT_SCHEMA,
            "armed_at": _now(),
            "attempt_id": attempt_id,
            "work": work,
            "work_sha256": canonical_sha256(work),
            "prior_outputs": prior,
            "staging_dir": staging_rel,
            "staged_outputs": {
                name: f"{staging_rel}/{name}"
                for name in MASTER_OUTPUTS
            },
        }
        payload["attempt_sha256"] = canonical_sha256(payload)
        _atomic_json(attempt_path, payload, ".master-synthesis-attempt-")
        _sweep_master_nonactive_staging(run_abs, repo_abs, payload)
        return {
            "status": "armed", "run_root": expected_root,
            "attempt_path": f"{expected_root}/{RECEIPT_PARENT}/{MASTER_ATTEMPT}",
            "attempt_sha256": payload["attempt_sha256"],
            "output_dir": payload["staging_dir"],
            "staged_outputs": payload["staged_outputs"],
        }
    finally:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        finally:
            os.close(lock_fd)


def _master_pair_is_valid(expected_root: str, run_abs: str) -> bool:
    thesis_path = os.path.join(run_abs, "final_thesis.md")
    if not _regular_file(thesis_path, nonempty=True):
        return False
    try:
        with open(thesis_path, encoding="utf-8") as handle:
            if not handle.read(4096).lstrip().startswith("#"):
                return False
    except (OSError, UnicodeError):
        return False
    try:
        decision = _read_json(os.path.join(run_abs, "decision_record.json"))
        validate_decision_identity(decision, expected_root)
    except (OSError, TypeError, ValueError, json.JSONDecodeError):
        return False
    return decision.get("final_thesis_path") == f"{expected_root}/final_thesis.md"


def _master_trio_is_valid(expected_root: str, run_abs: str, repo_abs: str) -> bool:
    return _master_pair_is_valid(expected_root, run_abs) and _master_preliminary_is_valid(
        expected_root, repo_abs, os.path.join(run_abs, "decision_record.json"),
        os.path.join(run_abs, "idea_3_6m.json"),
    )


def _master_prior_matches_live(run_abs: str, attempt: dict[str, Any]) -> bool:
    for name, row in attempt["prior_outputs"].items():
        path = os.path.join(run_abs, name)
        if row["exists"]:
            if not _regular_file(path) or file_digest(path) != row["sha256"]:
                return False
        elif os.path.lexists(path):
            return False
    return True


def _quarantine_staged_master_outputs(
    expected_root: str, repo_abs: str, attempt: dict[str, Any], names: list[str]
) -> list[dict[str, str]]:
    staging_abs = os.path.join(repo_abs, attempt["staging_dir"])
    quarantine_root = os.path.join(staging_abs, MASTER_QUARANTINE_DIR)
    if os.path.lexists(quarantine_root):
        if os.path.islink(quarantine_root) or not os.path.isdir(quarantine_root):
            raise ValueError("master-synthesis quarantine directory is unsafe")
    else:
        os.mkdir(quarantine_root, 0o755)
        _fsync_directory(staging_abs)
    moved: list[dict[str, str]] = []
    for name in names:
        source = os.path.join(repo_abs, attempt["staged_outputs"][name])
        digest = file_digest(source)
        target_name = f"{name}.{digest}.invalid"
        target = os.path.join(quarantine_root, target_name)
        if os.path.lexists(target):
            if not _regular_file(target) or file_digest(target) != digest:
                raise ValueError("master-synthesis quarantine target is occupied by different bytes")
            os.unlink(source)
            _fsync_directory(staging_abs)
        else:
            os.replace(source, target)
            _fsync_directory(staging_abs)
            _fsync_directory(quarantine_root)
        moved.append({
            "path": f"{expected_root}/{name}",
            "sha256": digest,
            "quarantine_path": (
                f"{attempt['staging_dir']}/{MASTER_QUARANTINE_DIR}/{target_name}"
            ),
        })
    return moved


def _rotate_master_attempt(
    expected_root: str, run_abs: str, repo_abs: str, old: dict[str, Any]
) -> dict[str, Any]:
    """Authority-first rotation: durably point at the fresh stage before retiring the old one."""
    old_staging = os.path.join(repo_abs, old["staging_dir"])
    attempts_parent = os.path.dirname(old_staging)
    active = _master_attempt_path(run_abs, create_parent=False)
    if not _regular_file(active, nonempty=True) or _read_json(active) != old:
        raise ValueError("active master attempt changed before retry rotation")
    attempt_id = secrets.token_hex(16)
    staging_abs = os.path.join(attempts_parent, attempt_id)
    os.mkdir(staging_abs, 0o755)
    _fsync_directory(attempts_parent)
    staging_rel = f"{expected_root}/{RECEIPT_PARENT}/{MASTER_ATTEMPT_DIR}/{attempt_id}"
    work = _master_work(expected_root, run_abs, repo_abs)
    payload: dict[str, Any] = {
        "schema_version": MASTER_ATTEMPT_SCHEMA,
        "armed_at": _now(),
        "attempt_id": attempt_id,
        "work": work,
        "work_sha256": canonical_sha256(work),
        "prior_outputs": old["prior_outputs"],
        "staging_dir": staging_rel,
        "staged_outputs": {
            name: f"{staging_rel}/{name}"
            for name in MASTER_OUTPUTS
        },
    }
    payload["attempt_sha256"] = canonical_sha256(payload)
    # `_atomic_json` fsyncs the active pointer's directory.  Thus every crash observes either the old
    # authority with its still-present stage, or the new authority with its already-fsynced stage.  The
    # non-active sweep is safe to repeat after either side of the subsequent cleanup crash window.
    _atomic_json(active, payload, ".master-synthesis-attempt-")
    _sweep_master_nonactive_staging(run_abs, repo_abs, payload)
    return payload


def _master_preliminary_is_valid(
    expected_root: str, repo_abs: str, decision_path: str, assessment_path: str
) -> bool:
    try:
        decision = _read_json(decision_path)
        ticker = validate_decision_identity(decision, expected_root)
    except (OSError, TypeError, ValueError, json.JSONDecodeError):
        return False
    if decision.get("final_thesis_path") != f"{expected_root}/final_thesis.md":
        return False
    value, errors = _assessment_schema(assessment_path, repo_abs)
    if errors or not isinstance(value, dict):
        return False
    run_date = expected_root.rsplit("_", 1)[-1]
    return bool(
        value.get("schema_version") == "idea-assessment/v1"
        and value.get("assessment_id") == f"{ticker}-{run_date}-3-6m"
        and value.get("run_root") == expected_root
        and value.get("ticker") == ticker
        and value.get("status") == "not_assessable"
        and value.get("candidate") is None
        and value.get("gaps") == [PROJECTION_PENDING_GAP]
        and _timestamp(value.get("created_at")) is not None
    )


def _master_staged_set_is_valid(
    expected_root: str, repo_abs: str, attempt: dict[str, Any]
) -> bool:
    paths = {
        name: os.path.join(repo_abs, attempt["staged_outputs"][name])
        for name in MASTER_OUTPUTS
    }
    thesis_ok = False
    if _regular_file(paths["final_thesis.md"], nonempty=True):
        try:
            with open(paths["final_thesis.md"], encoding="utf-8") as handle:
                thesis_ok = handle.read(4096).lstrip().startswith("#")
        except (OSError, UnicodeError):
            thesis_ok = False
    return bool(
        thesis_ok and _master_preliminary_is_valid(
            expected_root, repo_abs, paths["decision_record.json"], paths["idea_3_6m.json"]
        )
    )


def _validate_master_promotion(
    promotion: dict[str, Any], expected_root: str, attempt: dict[str, Any]
) -> None:
    if set(promotion) != {
        "schema_version", "prepared_at", "run_root", "attempt_sha256", "outputs",
        "promotion_sha256",
    } or promotion.get("schema_version") != MASTER_PROMOTION_SCHEMA:
        raise ValueError("master-synthesis promotion schema is invalid")
    payload = dict(promotion)
    recorded = payload.pop("promotion_sha256", None)
    if not isinstance(recorded, str) or not HEX64.fullmatch(recorded) or recorded != canonical_sha256(payload):
        raise ValueError("master-synthesis promotion digest is invalid")
    if (
        promotion.get("run_root") != expected_root
        or promotion.get("attempt_sha256") != attempt.get("attempt_sha256")
        or _timestamp(promotion.get("prepared_at")) is None
    ):
        raise ValueError("master-synthesis promotion authority is invalid")
    outputs = promotion.get("outputs")
    if not isinstance(outputs, dict) or set(outputs) != set(MASTER_OUTPUTS):
        raise ValueError("master-synthesis promotion output set is invalid")
    for name in MASTER_OUTPUTS:
        if outputs.get(name) != {
            "staged_path": attempt["staged_outputs"][name],
            "canonical_path": f"{expected_root}/{name}",
            "sha256": outputs.get(name, {}).get("sha256"),
        } or not isinstance(outputs[name].get("sha256"), str) or not HEX64.fullmatch(outputs[name]["sha256"]):
            raise ValueError("master-synthesis promotion output binding is invalid")


def _prepare_master_promotion(
    expected_root: str, run_abs: str, repo_abs: str, attempt: dict[str, Any]
) -> dict[str, Any]:
    promotion_path = _master_promotion_path(run_abs)
    payload: dict[str, Any] = {
        "schema_version": MASTER_PROMOTION_SCHEMA,
        "prepared_at": _now(),
        "run_root": expected_root,
        "attempt_sha256": attempt["attempt_sha256"],
        "outputs": {
            name: {
                "staged_path": attempt["staged_outputs"][name],
                "canonical_path": f"{expected_root}/{name}",
                "sha256": file_digest(os.path.join(repo_abs, attempt["staged_outputs"][name])),
            }
            for name in MASTER_OUTPUTS
        },
    }
    payload["promotion_sha256"] = canonical_sha256(payload)
    if os.path.lexists(promotion_path):
        existing = _read_json(promotion_path)
        _validate_master_promotion(existing, expected_root, attempt)
        if existing != payload:
            # Timestamp makes independently prepared payloads differ; an existing valid intent is the sole
            # authority and its exact staged hashes are checked during completion.
            return existing
    else:
        _atomic_json(promotion_path, payload, ".master-synthesis-promotion-")
    return payload


def _master_completion_dir(run_abs: str, *, create: bool) -> str:
    parent = _master_receipt_parent(run_abs, create=create)
    directory = os.path.join(parent, MASTER_COMPLETION_DIR)
    if os.path.lexists(directory):
        if os.path.islink(directory) or not os.path.isdir(directory):
            raise ValueError("master-synthesis completion directory is unsafe")
    elif create:
        os.mkdir(directory, 0o755)
        _fsync_directory(parent)
    return directory


def _write_master_completion(
    expected_root: str, run_abs: str, attempt: dict[str, Any]
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "schema_version": MASTER_COMPLETION_SCHEMA,
        "completed_at": _now(),
        "run_root": expected_root,
        "work": attempt["work"],
        "work_sha256": attempt["work_sha256"],
        "prior_outputs": attempt["prior_outputs"],
        "outputs": {
            name: {
                "path": f"{expected_root}/{name}",
                "sha256": file_digest(os.path.join(run_abs, name)),
            }
            for name in MASTER_OUTPUTS
        },
        "attempt_sha256": attempt["attempt_sha256"],
    }
    payload["completion_sha256"] = canonical_sha256(payload)
    directory = _master_completion_dir(run_abs, create=True)
    target = os.path.join(directory, payload["completion_sha256"] + ".json")
    if os.path.lexists(target):
        if not _regular_file(target, nonempty=True) or _read_json(target) != payload:
            raise ValueError("master-synthesis completion path contains different bytes")
    else:
        _atomic_json(target, payload, ".master-synthesis-completion-")
    return payload


def _cleanup_master_ephemeral(run_abs: str, repo_abs: str, attempt: dict[str, Any]) -> None:
    staging = os.path.join(repo_abs, attempt["staging_dir"])
    attempts_parent = os.path.dirname(staging)
    _remove_owned_tree(staging, attempts_parent)
    _sweep_master_nonactive_staging(run_abs, repo_abs, None)
    parent = _master_receipt_parent(run_abs, create=False)
    for path in (_master_promotion_path(run_abs), _master_attempt_path(run_abs, create_parent=False)):
        if os.path.lexists(path):
            if not _regular_file(path):
                raise ValueError("master ephemeral marker is unsafe")
            os.unlink(path)
            _fsync_directory(parent)


def _master_completion_for_attempt(
    expected_root: str, run_abs: str, attempt: dict[str, Any]
) -> dict[str, Any] | None:
    directory = _master_completion_dir(run_abs, create=False)
    if not os.path.isdir(directory):
        return None
    expected_outputs = {
        name: {
            "path": f"{expected_root}/{name}",
            "sha256": file_digest(os.path.join(run_abs, name)),
        }
        for name in MASTER_OUTPUTS
    }
    for name in sorted(os.listdir(directory), reverse=True):
        path = os.path.join(directory, name)
        if not name.endswith(".json") or not _regular_file(path, nonempty=True):
            continue
        try:
            value = _read_json(path)
        except ValueError:
            continue
        if set(value) != {
            "schema_version", "completed_at", "run_root", "work", "work_sha256",
            "prior_outputs", "outputs", "attempt_sha256", "completion_sha256",
        }:
            continue
        payload = dict(value)
        recorded = payload.pop("completion_sha256", None)
        if (
            value.get("schema_version") == MASTER_COMPLETION_SCHEMA
            and _timestamp(value.get("completed_at")) is not None
            and value.get("run_root") == expected_root
            and value.get("work") == attempt.get("work")
            and value.get("work_sha256") == attempt.get("work_sha256")
            and value.get("prior_outputs") == attempt.get("prior_outputs")
            and value.get("attempt_sha256") == attempt.get("attempt_sha256")
            and value.get("outputs") == expected_outputs
            and isinstance(recorded, str) and HEX64.fullmatch(recorded)
            and name == recorded + ".json"
            and recorded == canonical_sha256(payload)
        ):
            return value
    return None


def _master_completion_for_current_work(
    expected_root: str, run_abs: str, repo_abs: str
) -> dict[str, Any] | None:
    directory = _master_completion_dir(run_abs, create=False)
    if not os.path.isdir(directory):
        return None
    work = _master_work(expected_root, run_abs, repo_abs)
    outputs = {
        name: {
            "path": f"{expected_root}/{name}",
            "sha256": file_digest(os.path.join(run_abs, name)),
        }
        for name in MASTER_OUTPUTS
    }
    for name in sorted(os.listdir(directory), reverse=True):
        path = os.path.join(directory, name)
        if not name.endswith(".json") or not _regular_file(path, nonempty=True):
            continue
        try:
            value = _read_json(path)
        except ValueError:
            continue
        if set(value) != {
            "schema_version", "completed_at", "run_root", "work", "work_sha256",
            "prior_outputs", "outputs", "attempt_sha256", "completion_sha256",
        }:
            continue
        payload = dict(value)
        recorded = payload.pop("completion_sha256", None)
        if (
            value.get("schema_version") == MASTER_COMPLETION_SCHEMA
            and _timestamp(value.get("completed_at")) is not None
            and value.get("run_root") == expected_root
            and isinstance(value.get("work"), dict)
            and value["work"].get("run_root") == work["run_root"]
            and value["work"].get("sources") == work["sources"]
            and value["work"].get("outputs") == work["outputs"]
            # Generator digest/version is durable provenance for the paid call, not a reason to buy it
            # again after a code deployment when evidence inputs and canonical output bytes are unchanged.
            and isinstance(value["work"].get("generator"), dict)
            and value.get("work_sha256") == canonical_sha256(value["work"])
            and value.get("outputs") == outputs
            and isinstance(recorded, str) and HEX64.fullmatch(recorded)
            and name == recorded + ".json"
            and recorded == canonical_sha256(payload)
        ):
            return value
    return None


def _finish_master_promotion(
    expected_root: str, run_abs: str, repo_abs: str,
    attempt: dict[str, Any], promotion: dict[str, Any]
) -> dict[str, Any]:
    _validate_master_promotion(promotion, expected_root, attempt)
    staging_abs = os.path.join(repo_abs, attempt["staging_dir"])
    for name in MASTER_OUTPUTS:
        row = promotion["outputs"][name]
        staged = os.path.join(repo_abs, row["staged_path"])
        canonical = os.path.join(repo_abs, row["canonical_path"])
        prior = attempt["prior_outputs"][name]
        if os.path.lexists(canonical):
            if not _regular_file(canonical):
                raise ValueError(f"canonical master output {name} is unsafe")
            canonical_sha = file_digest(canonical)
            if canonical_sha == row["sha256"]:
                if os.path.lexists(staged):
                    if not _regular_file(staged) or file_digest(staged) != row["sha256"]:
                        raise ValueError(f"staged master output {name} conflicts with its promoted bytes")
                    os.unlink(staged)
                    _fsync_directory(staging_abs)
                continue
            if not prior["exists"] or canonical_sha != prior["sha256"]:
                raise ValueError(f"canonical master output {name} is neither its prior nor promoted hash")
        elif prior["exists"]:
            raise ValueError(f"canonical master output {name} disappeared after replacement was armed")
        if not _regular_file(staged) or file_digest(staged) != row["sha256"]:
            raise ValueError(f"staged master output {name} is missing or changed during promotion")
        os.replace(staged, canonical)
        _fsync_directory(staging_abs)
        _fsync_directory(run_abs)
    if not _master_trio_is_valid(expected_root, run_abs, repo_abs):
        raise ValueError("promoted master output set failed canonical identity/content validation")
    completion = _write_master_completion(expected_root, run_abs, attempt)
    _cleanup_master_ephemeral(run_abs, repo_abs, attempt)
    return {
        "status": "promoted", "run_root": expected_root, "action": "continue",
        "attempt_sha256": attempt["attempt_sha256"],
        "promotion_sha256": promotion["promotion_sha256"],
        "completion_sha256": completion["completion_sha256"],
    }


def recover_master_synthesis(
    run_root: str, repo: str = REPO, *, replacement_requested: bool = False
) -> dict[str, Any]:
    """Validate/promote staged outputs; replacement is available only to an explicit rerun."""
    expected_root, run_abs, repo_abs = _resolve_run(run_root, repo)
    lock_fd = os.open(run_abs, os.O_RDONLY)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        attempt_path = _master_attempt_path(run_abs, create_parent=False)
        promotion_path = _master_promotion_path(run_abs)
        canonical_present = [
            name for name in MASTER_OUTPUTS if os.path.lexists(os.path.join(run_abs, name))
        ]
        if os.path.lexists(attempt_path) and _master_trio_is_valid(expected_root, run_abs, repo_abs):
            completed_attempt = _read_json(attempt_path)
            _validate_master_attempt(
                completed_attempt, attempt_path, expected_root, run_abs, repo_abs,
                require_staging=False,
            )
            _sweep_master_nonactive_staging(run_abs, repo_abs, completed_attempt)
            completion = _master_completion_for_attempt(
                expected_root, run_abs, completed_attempt
            )
            if completion is not None:
                _cleanup_master_ephemeral(run_abs, repo_abs, completed_attempt)
                return {
                    "status": "complete_current", "run_root": expected_root, "action": "continue",
                    "completion_sha256": completion["completion_sha256"],
                }
        if os.path.lexists(promotion_path):
            if not os.path.lexists(attempt_path):
                raise ValueError("master promotion exists without its exact attempt")
            attempt = _read_json(attempt_path)
            _validate_master_attempt(attempt, attempt_path, expected_root, run_abs, repo_abs)
            _sweep_master_nonactive_staging(run_abs, repo_abs, attempt)
            promotion = _read_json(promotion_path)
            return _finish_master_promotion(expected_root, run_abs, repo_abs, attempt, promotion)
        if not os.path.lexists(attempt_path):
            _sweep_master_nonactive_staging(run_abs, repo_abs, None)
            if _master_trio_is_valid(expected_root, run_abs, repo_abs):
                completion = _master_completion_for_current_work(
                    expected_root, run_abs, repo_abs
                )
                if completion is not None:
                    return {
                        "status": "complete_current", "run_root": expected_root,
                        "action": "continue", "completion_sha256": completion["completion_sha256"],
                    }
                if replacement_requested:
                    return {
                        "status": "replace_needed", "run_root": expected_root,
                        "action": "arm_replace",
                    }
                # `/research:full` recovery owns a paid canonical trio once it exists.  Later source
                # landings cannot silently turn a crash restart into a newly paid master call; only an
                # explicit `/research:rerun` request may opt into replacement above.  This also preserves
                # a schema-valid legacy trio that predates completion receipts.
                return {
                    "status": "terminal_pair_recovery", "run_root": expected_root,
                    "action": "continue_paid_recovery",
                }
            if canonical_present:
                raise ValueError(
                    "malformed/incomplete canonical master outputs are not attempt staging; preserve bytes"
                )
            return {"status": "unarmed", "run_root": expected_root, "action": "arm_then_run"}
        attempt = _read_json(attempt_path)
        _validate_master_attempt(attempt, attempt_path, expected_root, run_abs, repo_abs)
        _sweep_master_nonactive_staging(run_abs, repo_abs, attempt)
        if _master_trio_is_valid(expected_root, run_abs, repo_abs):
            completion = _master_completion_for_attempt(expected_root, run_abs, attempt)
            if completion is not None:
                _cleanup_master_ephemeral(run_abs, repo_abs, attempt)
                return {
                    "status": "complete_current", "run_root": expected_root, "action": "continue",
                    "completion_sha256": completion["completion_sha256"],
                }
        elif canonical_present:
            raise ValueError(
                "malformed/incomplete canonical master outputs are not attempt staging; preserve bytes"
            )
        if not _master_prior_matches_live(run_abs, attempt):
            raise ValueError("canonical master outputs changed after the active attempt was armed")
        staged_present = [
            name for name in MASTER_OUTPUTS
            if os.path.lexists(os.path.join(repo_abs, attempt["staged_outputs"][name]))
        ]
        if not staged_present:
            current_work = _master_work(expected_root, run_abs, repo_abs)
            staging_abs = os.path.join(repo_abs, attempt["staging_dir"])
            # A kill after invalid bytes were quarantined but before the authority-first swap leaves
            # residue in the still-active old stage.  Finish the unique-dir rotation before returning a
            # Task path; never reuse that retired attempt directory for the retry.
            if os.listdir(staging_abs) or current_work != attempt["work"]:
                retry = _rotate_master_attempt(expected_root, run_abs, repo_abs, attempt)
                return {
                    "status": "retry_ready", "run_root": expected_root, "action": "run",
                    "retired_attempt_sha256": attempt["attempt_sha256"],
                    "attempt_sha256": retry["attempt_sha256"],
                    "output_dir": retry["staging_dir"],
                    "staged_outputs": retry["staged_outputs"],
                }
            return {
                "status": "armed_ready", "run_root": expected_root, "action": "run",
                "attempt_sha256": attempt["attempt_sha256"], "output_dir": attempt["staging_dir"],
                "staged_outputs": attempt["staged_outputs"],
            }
        for name in staged_present:
            path = os.path.join(repo_abs, attempt["staged_outputs"][name])
            if not _regular_file(path):
                raise ValueError(f"staged master output {name} is not a direct regular file")
        if set(staged_present) == set(MASTER_OUTPUTS) and _master_staged_set_is_valid(
            expected_root, repo_abs, attempt
        ):
            promotion = _prepare_master_promotion(expected_root, run_abs, repo_abs, attempt)
            return _finish_master_promotion(expected_root, run_abs, repo_abs, attempt, promotion)
        quarantined = _quarantine_staged_master_outputs(
            expected_root, repo_abs, attempt, staged_present
        )
        retired_outputs = [
            {"path": row["path"], "sha256": row["sha256"]}
            for row in quarantined
        ]
        retry = _rotate_master_attempt(expected_root, run_abs, repo_abs, attempt)
        return {
            "status": "retry_ready", "run_root": expected_root, "action": "run",
            "retired_attempt_sha256": attempt["attempt_sha256"],
            "retired_outputs": retired_outputs,
            "attempt_sha256": retry["attempt_sha256"],
            "output_dir": retry["staging_dir"], "staged_outputs": retry["staged_outputs"],
        }
    finally:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        finally:
            os.close(lock_fd)


def _projection_receipt_parent(run_abs: str, *, create: bool) -> str:
    parent = os.path.join(run_abs, RECEIPT_PARENT)
    if os.path.lexists(parent):
        if os.path.islink(parent) or not os.path.isdir(parent):
            raise ValueError("projection completion-receipt directory is unsafe")
    elif create:
        os.mkdir(parent, 0o755)
        _fsync_directory(run_abs)
    return parent


def _projection_attempt_path(run_abs: str, *, create_parent: bool) -> str:
    return os.path.join(_projection_receipt_parent(run_abs, create=create_parent), PROJECTION_ATTEMPT)


def _projection_promotion_path(run_abs: str) -> str:
    return os.path.join(_projection_receipt_parent(run_abs, create=False), PROJECTION_PROMOTION)


def _sweep_projection_nonactive_staging(
    run_abs: str, active: dict[str, Any] | None
) -> None:
    """Remove only safe helper-namespaced projection stages not named by the active pointer."""
    attempts_parent = os.path.join(
        _projection_receipt_parent(run_abs, create=False), PROJECTION_ATTEMPT_DIR
    )
    if not os.path.lexists(attempts_parent):
        return
    if os.path.islink(attempts_parent) or not os.path.isdir(attempts_parent):
        raise ValueError("final projection attempts directory is unsafe")
    active_id = active.get("attempt_id") if isinstance(active, dict) else None
    if active_id is not None and not re.fullmatch(r"[a-f0-9]{32}", active_id):
        raise ValueError("active final projection attempt id is invalid")
    for entry in sorted(os.scandir(attempts_parent), key=lambda row: row.name):
        if entry.name == active_id:
            continue
        if (
            not re.fullmatch(r"[a-f0-9]{32}", entry.name)
            or entry.is_symlink()
            or not entry.is_dir(follow_symlinks=False)
        ):
            raise ValueError("final projection attempts directory contains an unknown entry")
        _remove_owned_tree(entry.path, attempts_parent)


def _projection_context(
    expected_root: str, run_abs: str, repo_abs: str
) -> tuple[dict[str, Any], dict[str, Any], str, dt.datetime]:
    manifest_path = os.path.join(run_abs, PROJECTION_MANIFEST)
    manifest = _read_json(manifest_path)
    validate_manifest_or_raise(manifest, run_abs, expected_root)
    manifest_created = _timestamp(manifest.get("created_at"))
    if manifest_created is None:
        raise ValueError("projection manifest timestamp is invalid")
    decision = _read_json(os.path.join(run_abs, "decision_record.json"))
    ticker = validate_decision_identity(decision, expected_root)
    if os.path.lexists(os.path.join(run_abs, "idea_admission.json")):
        raise ValueError("projection attempt/recovery is forbidden after immutable admission")
    return manifest, decision, ticker, manifest_created


def _assessment_schema(
    assessment_path: str, repo_abs: str
) -> tuple[dict[str, Any] | None, list[str]]:
    if not _regular_file(assessment_path):
        return None, ["assessment is missing or is not a direct regular file"]
    schema_path = os.path.join(repo_abs, "frameworks", "ideas", "idea-assessment.schema.json")
    try:
        errors = validate_json_contract(schema_path, assessment_path)
        value = _read_json(assessment_path)
    except (OSError, UnicodeError, TypeError, ValueError, json.JSONDecodeError) as exc:
        return None, [f"assessment is not readable schema-valid JSON: {exc}"]
    return value, errors


def _exact_preliminary_assessment(
    value: dict[str, Any] | None,
    expected_root: str,
    ticker: str,
    manifest_created: dt.datetime,
) -> bool:
    if not isinstance(value, dict):
        return False
    run_date = expected_root.rsplit("_", 1)[-1]
    created = _timestamp(value.get("created_at"))
    return bool(
        value.get("schema_version") == "idea-assessment/v1"
        and value.get("assessment_id") == f"{ticker}-{run_date}-3-6m"
        and value.get("run_root") == expected_root
        and value.get("ticker") == ticker
        and value.get("status") == "not_assessable"
        and value.get("candidate") is None
        and value.get("gaps") == [PROJECTION_PENDING_GAP]
        and created is not None
        and created < manifest_created
    )


def _projection_output_state(expected_root: str, path: str) -> dict[str, Any]:
    if not _regular_file(path):
        raise ValueError("idea_3_6m.json is missing or is not a direct regular file")
    return {
        "path": f"{expected_root}/{PROJECTION_ASSESSMENT}",
        "sha256": file_digest(path),
    }


def _validate_projection_attempt(
    attempt: dict[str, Any], attempt_path: str, expected_root: str,
    run_abs: str, manifest: dict[str, Any], manifest_created: dt.datetime,
    *, require_staging: bool = True,
) -> None:
    expected_keys = {
        "schema_version", "armed_at", "attempt_id", "run_root", "manifest",
        "preliminary_output", "staging_dir", "staged_output", "attempt_sha256",
    }
    if set(attempt) != expected_keys or attempt.get("schema_version") != PROJECTION_ATTEMPT_SCHEMA:
        raise ValueError("final projection attempt schema is invalid")
    payload = dict(attempt)
    recorded = payload.pop("attempt_sha256", None)
    if not isinstance(recorded, str) or not HEX64.fullmatch(recorded) or recorded != canonical_sha256(payload):
        raise ValueError("final projection attempt digest is invalid")
    armed = _timestamp(attempt.get("armed_at"))
    if attempt.get("run_root") != expected_root or armed is None or armed < manifest_created:
        raise ValueError("final projection attempt identity/timestamp is invalid")
    attempt_id = attempt.get("attempt_id")
    if not isinstance(attempt_id, str) or not re.fullmatch(r"[a-f0-9]{32}", attempt_id):
        raise ValueError("final projection attempt id is invalid")
    manifest_binding = attempt.get("manifest")
    expected_manifest = {
        "path": f"{expected_root}/{PROJECTION_MANIFEST}",
        "file_sha256": file_digest(os.path.join(run_abs, PROJECTION_MANIFEST)),
        "manifest_sha256": manifest.get("manifest_sha256"),
    }
    if manifest_binding != expected_manifest:
        raise ValueError("final projection attempt does not bind the exact current manifest bytes")
    preliminary = attempt.get("preliminary_output")
    if (
        not isinstance(preliminary, dict)
        or set(preliminary) != {"path", "sha256"}
        or preliminary.get("path") != f"{expected_root}/{PROJECTION_ASSESSMENT}"
        or not isinstance(preliminary.get("sha256"), str)
        or not HEX64.fullmatch(preliminary["sha256"])
    ):
        raise ValueError("final projection attempt preliminary-output binding is invalid")
    expected_staging = f"{expected_root}/{RECEIPT_PARENT}/{PROJECTION_ATTEMPT_DIR}/{attempt_id}"
    expected_output = f"{expected_staging}/{PROJECTION_ASSESSMENT}"
    if attempt.get("staging_dir") != expected_staging or attempt.get("staged_output") != expected_output:
        raise ValueError("final projection attempt staging path is invalid")
    staging_abs = os.path.join(os.path.dirname(os.path.dirname(run_abs)), expected_staging)
    if require_staging and (os.path.islink(staging_abs) or not os.path.isdir(staging_abs)):
        raise ValueError("final projection staging directory is missing or unsafe")
    attempt_info = os.lstat(attempt_path)
    if not stat.S_ISREG(attempt_info.st_mode):
        raise ValueError("final projection attempt path is unsafe")


def arm_final_projection(run_root: str, repo: str = REPO) -> dict[str, Any]:
    """Persist the exact pre-Task projection boundary before buying the final projection call."""
    expected_root, run_abs, repo_abs = _resolve_run(run_root, repo)
    lock_fd = os.open(run_abs, os.O_RDONLY)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        manifest, _, ticker, manifest_created = _projection_context(expected_root, run_abs, repo_abs)
        assessment_path = os.path.join(run_abs, PROJECTION_ASSESSMENT)
        value, errors = _assessment_schema(assessment_path, repo_abs)
        if errors or not _exact_preliminary_assessment(
            value, expected_root, ticker, manifest_created
        ):
            raise ValueError(
                "final projection may be armed only from the exact schema-valid preliminary wrapper"
            )
        current = _projection_output_state(expected_root, assessment_path)
        attempt_path = _projection_attempt_path(run_abs, create_parent=True)
        if os.path.lexists(attempt_path):
            attempt = _read_json(attempt_path)
            _validate_projection_attempt(
                attempt, attempt_path, expected_root, run_abs, manifest, manifest_created
            )
            _sweep_projection_nonactive_staging(run_abs, attempt)
            if attempt["preliminary_output"] != current:
                raise ValueError("existing final projection attempt binds different preliminary bytes")
            staged_abs = os.path.join(repo_abs, attempt["staged_output"])
            if os.path.lexists(staged_abs):
                raise ValueError("existing final projection attempt has staged output; run projection-recover")
            return {
                "status": "existing", "run_root": expected_root,
                "attempt_path": f"{expected_root}/{RECEIPT_PARENT}/{PROJECTION_ATTEMPT}",
                "attempt_sha256": attempt["attempt_sha256"],
                "output_path": attempt["staged_output"],
            }
        attempt_id = secrets.token_hex(16)
        attempts_parent = os.path.join(
            _projection_receipt_parent(run_abs, create=True), PROJECTION_ATTEMPT_DIR
        )
        if os.path.lexists(attempts_parent):
            if os.path.islink(attempts_parent) or not os.path.isdir(attempts_parent):
                raise ValueError("final projection attempts directory is unsafe")
        else:
            os.mkdir(attempts_parent, 0o755)
            _fsync_directory(os.path.dirname(attempts_parent))
        staging_abs = os.path.join(attempts_parent, attempt_id)
        os.mkdir(staging_abs, 0o755)
        _fsync_directory(attempts_parent)
        staging_rel = f"{expected_root}/{RECEIPT_PARENT}/{PROJECTION_ATTEMPT_DIR}/{attempt_id}"
        armed_at = _now()
        if (_timestamp(armed_at) or manifest_created) < manifest_created:
            armed_at = manifest["created_at"]
        payload: dict[str, Any] = {
            "schema_version": PROJECTION_ATTEMPT_SCHEMA,
            "armed_at": armed_at,
            "attempt_id": attempt_id,
            "run_root": expected_root,
            "manifest": {
                "path": f"{expected_root}/{PROJECTION_MANIFEST}",
                "file_sha256": file_digest(os.path.join(run_abs, PROJECTION_MANIFEST)),
                "manifest_sha256": manifest["manifest_sha256"],
            },
            "preliminary_output": current,
            "staging_dir": staging_rel,
            "staged_output": f"{staging_rel}/{PROJECTION_ASSESSMENT}",
        }
        payload["attempt_sha256"] = canonical_sha256(payload)
        _atomic_json(attempt_path, payload, ".final-projection-attempt-")
        _sweep_projection_nonactive_staging(run_abs, payload)
        return {
            "status": "armed", "run_root": expected_root,
            "attempt_path": f"{expected_root}/{RECEIPT_PARENT}/{PROJECTION_ATTEMPT}",
            "attempt_sha256": payload["attempt_sha256"],
            "output_path": payload["staged_output"],
        }
    finally:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        finally:
            os.close(lock_fd)


def _final_projection_shape(
    value: dict[str, Any] | None, expected_root: str, ticker: str,
    manifest_created: dt.datetime,
) -> bool:
    if not isinstance(value, dict):
        return False
    created = _timestamp(value.get("created_at"))
    run_date = expected_root.rsplit("_", 1)[-1]
    if not (
        value.get("assessment_id") == f"{ticker}-{run_date}-3-6m"
        and value.get("run_root") == expected_root
        and value.get("ticker") == ticker
        and created is not None and created >= manifest_created
    ):
        return False
    if value.get("status") == "candidate":
        return value.get("gaps") == [] and isinstance(value.get("candidate"), dict)
    return bool(
        value.get("status") == "not_assessable"
        and value.get("candidate") is None
        and isinstance(value.get("gaps"), list)
        and value.get("gaps") != [PROJECTION_PENDING_GAP]
    )


def _projection_fallback(
    expected_root: str, ticker: str, decision: dict[str, Any], attempt: dict[str, Any]
) -> dict[str, Any]:
    company = decision.get("company_name")
    company = company.strip() if isinstance(company, str) and company.strip() else None
    return {
        "schema_version": "idea-assessment/v1",
        "assessment_id": f"{ticker}-{expected_root.rsplit('_', 1)[-1]}-3-6m",
        "run_root": expected_root,
        "created_at": attempt["armed_at"],
        "ticker": ticker,
        "company": company,
        "status": "not_assessable",
        "gaps": [PROJECTION_FAILURE_GAP],
        "candidate": None,
    }


def _validate_projection_promotion(
    promotion: dict[str, Any], expected_root: str, attempt: dict[str, Any]
) -> None:
    if set(promotion) != {
        "schema_version", "prepared_at", "run_root", "attempt_sha256", "mode",
        "source_output", "target_output", "promotion_sha256",
    } or promotion.get("schema_version") != PROJECTION_PROMOTION_SCHEMA:
        raise ValueError("final projection promotion schema is invalid")
    payload = dict(promotion)
    recorded = payload.pop("promotion_sha256", None)
    if not isinstance(recorded, str) or not HEX64.fullmatch(recorded) or recorded != canonical_sha256(payload):
        raise ValueError("final projection promotion digest is invalid")
    if (
        promotion.get("run_root") != expected_root
        or promotion.get("attempt_sha256") != attempt.get("attempt_sha256")
        or promotion.get("mode") not in {"valid_task_output", "invalid_task_fallback"}
        or _timestamp(promotion.get("prepared_at")) is None
    ):
        raise ValueError("final projection promotion authority is invalid")
    for key in ("source_output", "target_output"):
        row = promotion.get(key)
        if (
            not isinstance(row, dict) or set(row) != {"path", "sha256"}
            or not isinstance(row.get("path"), str)
            or not isinstance(row.get("sha256"), str) or not HEX64.fullmatch(row["sha256"])
        ):
            raise ValueError("final projection promotion output binding is invalid")
    expected_target = (
        attempt["staged_output"] if promotion["mode"] == "valid_task_output"
        else f"{attempt['staging_dir']}/idea_3_6m.fallback.json"
    )
    if (
        promotion["source_output"]["path"] != attempt["staged_output"]
        or promotion["target_output"]["path"] != expected_target
    ):
        raise ValueError("final projection promotion paths do not match the attempt")


def _projection_completion_path(run_abs: str) -> str:
    return os.path.join(_projection_receipt_parent(run_abs, create=False), PROJECTION_COMPLETION)


def _write_projection_completion(
    expected_root: str, run_abs: str, attempt: dict[str, Any], promotion: dict[str, Any]
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "schema_version": PROJECTION_COMPLETION_SCHEMA,
        "completed_at": _now(),
        "run_root": expected_root,
        "manifest": attempt["manifest"],
        "preliminary_output": attempt["preliminary_output"],
        "output": {
            "path": f"{expected_root}/{PROJECTION_ASSESSMENT}",
            "sha256": file_digest(os.path.join(run_abs, PROJECTION_ASSESSMENT)),
        },
        "mode": promotion["mode"],
        "attempt_sha256": attempt["attempt_sha256"],
    }
    payload["completion_sha256"] = canonical_sha256(payload)
    target = _projection_completion_path(run_abs)
    if os.path.lexists(target):
        existing = _read_json(target)
        if existing != payload:
            raise ValueError("final projection completion path contains different bytes")
    else:
        _atomic_json(target, payload, ".final-projection-completion-")
    return payload


def _validate_projection_completion(
    value: dict[str, Any], expected_root: str, run_abs: str,
    manifest: dict[str, Any], attempt: dict[str, Any] | None,
) -> None:
    if set(value) != {
        "schema_version", "completed_at", "run_root", "manifest", "preliminary_output",
        "output", "mode", "attempt_sha256", "completion_sha256",
    } or value.get("schema_version") != PROJECTION_COMPLETION_SCHEMA:
        raise ValueError("final projection completion schema is invalid")
    payload = dict(value)
    recorded = payload.pop("completion_sha256", None)
    if not isinstance(recorded, str) or not HEX64.fullmatch(recorded) or recorded != canonical_sha256(payload):
        raise ValueError("final projection completion digest is invalid")
    expected_manifest = {
        "path": f"{expected_root}/{PROJECTION_MANIFEST}",
        "file_sha256": file_digest(os.path.join(run_abs, PROJECTION_MANIFEST)),
        "manifest_sha256": manifest.get("manifest_sha256"),
    }
    output = value.get("output")
    if (
        value.get("run_root") != expected_root
        or value.get("manifest") != expected_manifest
        or value.get("mode") not in {"valid_task_output", "invalid_task_fallback"}
        or _timestamp(value.get("completed_at")) is None
        or not isinstance(output, dict)
        or output != {
            "path": f"{expected_root}/{PROJECTION_ASSESSMENT}",
            "sha256": file_digest(os.path.join(run_abs, PROJECTION_ASSESSMENT)),
        }
    ):
        raise ValueError("final projection completion no longer binds current authority/output")
    if attempt is not None and (
        value.get("attempt_sha256") != attempt.get("attempt_sha256")
        or value.get("preliminary_output") != attempt.get("preliminary_output")
    ):
        raise ValueError("final projection completion does not match its active attempt")


def _cleanup_projection_ephemeral(run_abs: str, repo_abs: str, attempt: dict[str, Any]) -> None:
    staging = os.path.join(repo_abs, attempt["staging_dir"])
    _remove_owned_tree(staging, os.path.dirname(staging))
    _sweep_projection_nonactive_staging(run_abs, None)
    parent = _projection_receipt_parent(run_abs, create=False)
    for path in (_projection_promotion_path(run_abs), _projection_attempt_path(run_abs, create_parent=False)):
        if os.path.lexists(path):
            if not _regular_file(path):
                raise ValueError("final projection ephemeral marker is unsafe")
            os.unlink(path)
            _fsync_directory(parent)


def _finish_projection_promotion(
    expected_root: str, run_abs: str, repo_abs: str, attempt: dict[str, Any],
    promotion: dict[str, Any], ticker: str, manifest_created: dt.datetime,
) -> dict[str, Any]:
    _validate_projection_promotion(promotion, expected_root, attempt)
    canonical = os.path.join(run_abs, PROJECTION_ASSESSMENT)
    target = os.path.join(repo_abs, promotion["target_output"]["path"])
    canonical_sha = file_digest(canonical) if _regular_file(canonical) else None
    if canonical_sha == promotion["target_output"]["sha256"]:
        if os.path.lexists(target):
            if not _regular_file(target) or file_digest(target) != canonical_sha:
                raise ValueError("staged projection conflicts with already promoted canonical bytes")
            os.unlink(target)
            _fsync_directory(os.path.dirname(target))
    else:
        if canonical_sha != attempt["preliminary_output"]["sha256"]:
            raise ValueError("canonical idea_3_6m.json contains bytes not authorized by projection promotion")
        if not _regular_file(target) or file_digest(target) != promotion["target_output"]["sha256"]:
            raise ValueError("projection promotion target is missing or changed")
        if promotion["mode"] == "invalid_task_fallback":
            source = os.path.join(repo_abs, promotion["source_output"]["path"])
            quarantine = os.path.join(repo_abs, attempt["staging_dir"], PROJECTION_QUARANTINE_DIR)
            if os.path.lexists(quarantine):
                if os.path.islink(quarantine) or not os.path.isdir(quarantine):
                    raise ValueError("projection quarantine path is unsafe")
            else:
                os.mkdir(quarantine, 0o755)
                _fsync_directory(os.path.dirname(quarantine))
            qpath = os.path.join(quarantine, promotion["source_output"]["sha256"] + ".invalid")
            if os.path.lexists(source):
                if not _regular_file(source) or file_digest(source) != promotion["source_output"]["sha256"]:
                    raise ValueError("invalid staged projection changed before quarantine")
                if os.path.lexists(qpath):
                    if not _regular_file(qpath) or file_digest(qpath) != promotion["source_output"]["sha256"]:
                        raise ValueError("projection quarantine contains conflicting bytes")
                    os.unlink(source)
                else:
                    os.replace(source, qpath)
                _fsync_directory(quarantine)
                _fsync_directory(os.path.dirname(source))
            elif not _regular_file(qpath) or file_digest(qpath) != promotion["source_output"]["sha256"]:
                raise ValueError("invalid staged projection and its quarantine proof are both missing")
        os.replace(target, canonical)
        _fsync_directory(os.path.dirname(target))
        _fsync_directory(run_abs)
    value, errors = _assessment_schema(canonical, repo_abs)
    if errors or not _final_projection_shape(value, expected_root, ticker, manifest_created):
        raise ValueError("promoted final projection failed its canonical final shape")
    completion_path = _projection_completion_path(run_abs)
    if os.path.lexists(completion_path):
        completion = _read_json(completion_path)
        _validate_projection_completion(
            completion, expected_root, run_abs,
            _read_json(os.path.join(run_abs, PROJECTION_MANIFEST)), attempt,
        )
    else:
        completion = _write_projection_completion(expected_root, run_abs, attempt, promotion)
    _cleanup_projection_ephemeral(run_abs, repo_abs, attempt)
    return {
        "status": "promoted", "run_root": expected_root, "action": "classify_without_rewrite",
        "attempt_sha256": attempt["attempt_sha256"],
        "promotion_sha256": promotion["promotion_sha256"],
        "completion_sha256": completion["completion_sha256"],
        "output_path": f"{expected_root}/{PROJECTION_ASSESSMENT}",
        "output_sha256": file_digest(canonical),
    }


def recover_final_projection(run_root: str, repo: str = REPO) -> dict[str, Any]:
    """Promote only attempt-owned staged output; canonical unknown bytes are immutable."""
    expected_root, run_abs, repo_abs = _resolve_run(run_root, repo)
    lock_fd = os.open(run_abs, os.O_RDONLY)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        manifest, decision, ticker, manifest_created = _projection_context(
            expected_root, run_abs, repo_abs
        )
        assessment_path = os.path.join(run_abs, PROJECTION_ASSESSMENT)
        value, errors = _assessment_schema(assessment_path, repo_abs)
        attempt_path = _projection_attempt_path(run_abs, create_parent=False)
        attempt_exists = os.path.lexists(attempt_path)
        promotion_path = _projection_promotion_path(run_abs)
        completion_path = _projection_completion_path(run_abs)

        if not attempt_exists:
            _sweep_projection_nonactive_staging(run_abs, None)

        if os.path.lexists(completion_path):
            attempt = None
            if attempt_exists:
                attempt = _read_json(attempt_path)
                _validate_projection_attempt(
                    attempt, attempt_path, expected_root, run_abs, manifest, manifest_created,
                    require_staging=False,
                )
                _sweep_projection_nonactive_staging(run_abs, attempt)
            completion = _read_json(completion_path)
            _validate_projection_completion(
                completion, expected_root, run_abs, manifest, attempt
            )
            if attempt is not None:
                _cleanup_projection_ephemeral(run_abs, repo_abs, attempt)
            return {
                "status": "complete", "run_root": expected_root,
                "action": "classify_without_rewrite",
                "completion_sha256": completion["completion_sha256"],
                "output_path": f"{expected_root}/{PROJECTION_ASSESSMENT}",
                "output_sha256": completion["output"]["sha256"],
            }

        if os.path.lexists(promotion_path):
            if not attempt_exists:
                raise ValueError("final projection promotion exists without its exact attempt")
            attempt = _read_json(attempt_path)
            _validate_projection_attempt(
                attempt, attempt_path, expected_root, run_abs, manifest, manifest_created
            )
            _sweep_projection_nonactive_staging(run_abs, attempt)
            promotion = _read_json(promotion_path)
            return _finish_projection_promotion(
                expected_root, run_abs, repo_abs, attempt, promotion, ticker, manifest_created
            )

        if not errors:
            if _exact_preliminary_assessment(value, expected_root, ticker, manifest_created):
                if not attempt_exists:
                    return {
                        "status": "preliminary_unarmed", "run_root": expected_root,
                        "action": "arm_then_run",
                    }
                attempt = _read_json(attempt_path)
                _validate_projection_attempt(
                    attempt, attempt_path, expected_root, run_abs, manifest, manifest_created
                )
                _sweep_projection_nonactive_staging(run_abs, attempt)
                current = _projection_output_state(expected_root, assessment_path)
                if current != attempt["preliminary_output"]:
                    raise ValueError(
                        "schema-valid preliminary bytes differ from the armed projection input"
                    )
                staged = os.path.join(repo_abs, attempt["staged_output"])
                if not os.path.lexists(staged):
                    return {
                        "status": "preliminary_armed", "run_root": expected_root,
                        "action": "run", "attempt_sha256": attempt["attempt_sha256"],
                        "output_path": attempt["staged_output"],
                    }
                if not _regular_file(staged):
                    raise ValueError("staged final projection is not a direct regular file")
                staged_value, staged_errors = _assessment_schema(staged, repo_abs)
                valid_final = not staged_errors and _final_projection_shape(
                    staged_value, expected_root, ticker, manifest_created
                )
                mode = "valid_task_output" if valid_final else "invalid_task_fallback"
                target_rel = attempt["staged_output"]
                if not valid_final:
                    target_rel = f"{attempt['staging_dir']}/idea_3_6m.fallback.json"
                    target_abs = os.path.join(repo_abs, target_rel)
                    _atomic_json(
                        target_abs, _projection_fallback(expected_root, ticker, decision, attempt),
                        ".final-projection-fallback-",
                    )
                source_sha = file_digest(staged)
                target_sha = file_digest(os.path.join(repo_abs, target_rel))
                promotion: dict[str, Any] = {
                    "schema_version": PROJECTION_PROMOTION_SCHEMA,
                    "prepared_at": _now(),
                    "run_root": expected_root,
                    "attempt_sha256": attempt["attempt_sha256"],
                    "mode": mode,
                    "source_output": {"path": attempt["staged_output"], "sha256": source_sha},
                    "target_output": {"path": target_rel, "sha256": target_sha},
                }
                promotion["promotion_sha256"] = canonical_sha256(promotion)
                _atomic_json(promotion_path, promotion, ".final-projection-promotion-")
                return _finish_projection_promotion(
                    expected_root, run_abs, repo_abs, attempt, promotion, ticker, manifest_created
                )
            if attempt_exists:
                raise ValueError(
                    "canonical final projection changed outside its attempt-owned staging path; preserve bytes"
                )
            return {
                "status": "schema_valid", "run_root": expected_root,
                "action": "classify_without_rewrite",
            }

        raise ValueError(
            "canonical idea_3_6m.json is invalid and is not an attempt-owned staging output; preserve bytes"
        )
    finally:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        finally:
            os.close(lock_fd)


def _authority(expected_root: str, run_abs: str, repo_abs: str) -> dict[str, Any]:
    manifest_path = os.path.join(run_abs, "idea_projection_manifest.json")
    admission_path = os.path.join(run_abs, "idea_admission.json")
    manifest = _read_json(manifest_path)
    validate_manifest_or_raise(manifest, run_abs, expected_root)
    admission = _read_json(admission_path)
    if not existing_is_valid(admission, expected_root):
        raise ValueError("idea_admission.json is not a canonical sealed admission")
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
        admission_result = validate_frozen_admission(expected_root, repo_abs)
    if admission_result not in (0, 3):
        raise ValueError("idea_admission.json did not validate as a completed semantic result")
    if admission.get("projection_manifest_sha256") != manifest.get("manifest_sha256"):
        raise ValueError("admission and projection-manifest authority do not reconcile")
    return {
        "idea_projection_manifest": {
            "path": expected_root + "/idea_projection_manifest.json",
            "sha256": file_digest(manifest_path),
            "manifest_sha256": manifest["manifest_sha256"],
        },
        "idea_admission": {
            "path": expected_root + "/idea_admission.json",
            "sha256": file_digest(admission_path),
            "admission_sha256": admission["admission_sha256"],
            "status": admission["status"],
        },
    }


def _generator(kind: str, repo_abs: str) -> dict[str, Any]:
    contract = dict(GENERATOR_CONTRACTS[kind])
    spec_abs = os.path.join(repo_abs, contract["spec_path"])
    if not _regular_file(spec_abs, nonempty=True):
        raise ValueError(f"generator spec {contract['spec_path']} is missing or unsafe")
    contract["spec_sha256"] = file_digest(spec_abs)
    return contract


def _memo_output_valid(path: str, kind: str, decision: str | None) -> tuple[bool, str]:
    if not _regular_file(path, nonempty=True):
        return False, "output is missing, empty, or not a direct regular file"
    try:
        with open(path, encoding="utf-8") as handle:
            text = handle.read()
    except (OSError, UnicodeError):
        return False, "output is not readable UTF-8 markdown"
    lines = text.splitlines()
    if not lines or not re.match(r"^#(?:\s|$)", lines[0]):
        return False, "output does not start with a top-level markdown header"
    if sum(1 for line in lines if re.match(r"^\s*```", line)) % 2:
        return False, "output ends inside an unclosed code fence"
    tail = lines[-20:]
    for index, line in enumerate(tail):
        if re.fullmatch(r"Agent:\s+\S+\s*", line):
            nearby = tail[index + 1:index + 6]
            labels = ("Output", "Verdict", "Biggest finding")
            if all(any(re.match(rf"^(?:\*\*)?{re.escape(label)}:", row) for row in nearby)
                   for label in labels):
                return False, "output carries a stray chat-confirmation block"
    if kind == "run_memo":
        if not decision:
            return False, "decision_record has no decision for memo reconciliation"
        decision_line = re.compile(
            rf"(?im)^\s*(?:[-*>]\s*)?(?:\*\*)?Decision(?:\*\*)?:\s*"
            rf"(?:\*\*)?{re.escape(decision)}(?:\*\*)?(?:\s*(?:—|-).*)?$"
        )
        if not decision_line.search(text):
            return False, "memo does not carry the exact decision_record decision"
        insufficient = decision == "Insufficient Data — Refuse To Rate"
        minimum_bytes, minimum_words = ((3_000, 500) if insufficient else (15_000, 2_400))
        headings = [match.group(1).strip().casefold() for match in re.finditer(r"(?m)^##+\s+(.+)$", text)]
        required = (
            ("decision at a glance", "what the company does", "variant perception",
             "what is missing and why we will not rate")
            if insufficient
            else (
                "decision at a glance", "what the company does", "variant perception",
                "why it could work", "why it could fail", "avoid-big-risks", "valuation",
                "catalysts", "scenario model", "what would change our mind",
                "second-best bet", "get more confident", "bottom line",
            )
        )
        minimum_headings = 4 if insufficient else 13
    else:
        verdict_match = re.search(
            r"(?im)^\s*(?:[-*>]\s*)?(?:\*\*)?Verdict(?:\*\*)?:?\*{0,2}\s*\S", text
        )
        if not verdict_match:
            return False, "module memo has no substantive Verdict line"
        insufficient = bool(re.search(r"(?i)Verdict[^\n]{0,80}Insufficient(?:\s+data)?", text[:3000]))
        minimum_bytes, minimum_words = ((1_500, 250) if insufficient else (6_000, 900))
        headings = [match.group(1).strip().casefold() for match in re.finditer(r"(?m)^##+\s+(.+)$", text)]
        required = (
            ("scores at a glance", "what this module found", "what is missing")
            if insufficient
            else ("scores at a glance", "what this module found", "specialists",
                  "what would change this read", "bottom line")
        )
        minimum_headings = 3 if insufficient else 5
    encoded_size = len(text.encode("utf-8"))
    word_count = len(re.findall(r"\b\w[\w'’-]*\b", text, flags=re.UNICODE))
    if encoded_size < minimum_bytes or word_count < minimum_words:
        return False, (
            f"output is below the {kind} completeness floor "
            f"({encoded_size} bytes/{word_count} words; need {minimum_bytes}/{minimum_words})"
        )
    if len(headings) < minimum_headings:
        return False, f"output has only {len(headings)} substantive sections; need at least {minimum_headings}"
    missing = [name for name in required if not any(name in heading for heading in headings)]
    if missing:
        return False, "output is missing required memo sections: " + ", ".join(missing)
    last = next((line.strip() for line in reversed(lines) if line.strip()), "")
    if not last or re.match(r"^(?:#+\s|```|---$)", last):
        return False, "output ends at a section/fence boundary rather than with complete content"
    return True, "output passes the persisted memo-content checks"


def _memo_targets(
    expected_root: str, run_abs: str, repo_abs: str, authority: dict[str, Any]
) -> list[dict[str, Any]]:
    decision = _read_json(os.path.join(run_abs, "decision_record.json"))
    targets: list[dict[str, Any]] = []
    for entry in sorted(os.scandir(run_abs), key=lambda item: item.name):
        if not entry.is_dir(follow_symlinks=False) or not re.fullmatch(r"[A-Za-z0-9_-]+", entry.name):
            continue
        syntheses = []
        for name in sorted(os.listdir(entry.path)):
            if re.fullmatch(r"99_.*-synthesis\.md", name):
                syntheses.append(os.path.join(entry.path, name))
        if not syntheses:
            continue
        if len(syntheses) != 1 or not _regular_file(syntheses[0], nonempty=True):
            raise ValueError(f"module {entry.name} does not have one safe canonical synthesis input")
        source_rel = os.path.relpath(syntheses[0], repo_abs).replace(os.sep, "/")
        output_rel = f"{expected_root}/{entry.name}/{entry.name}_memo.md"
        work = {
            "work_kind": "module_memo",
            "target_id": "module:" + entry.name,
            "run_root": expected_root,
            "authority": authority,
            "sources": [{"path": source_rel, "sha256": file_digest(syntheses[0])}],
            "output_path": output_rel,
            "generator": _generator("module_memo", repo_abs),
        }
        targets.append({
            "work": work,
            "work_sha256": canonical_sha256(work),
            "output_abs": os.path.join(repo_abs, output_rel),
            "decision": None,
            "run_abs": run_abs,
            "repo_abs": repo_abs,
        })
    top_work = {
        "work_kind": "run_memo",
        "target_id": "top-level",
        "run_root": expected_root,
        "authority": authority,
        "sources": [
            {"path": expected_root + "/final_thesis.md",
             "sha256": file_digest(os.path.join(run_abs, "final_thesis.md"))},
            {"path": expected_root + "/decision_record.json",
             "sha256": file_digest(os.path.join(run_abs, "decision_record.json"))},
        ],
        "output_path": expected_root + "/memo.md",
        "generator": _generator("run_memo", repo_abs),
    }
    targets.append({
        "work": top_work,
        "work_sha256": canonical_sha256(top_work),
        "output_abs": os.path.join(run_abs, "memo.md"),
        "decision": decision.get("decision"),
        "run_abs": run_abs,
        "repo_abs": repo_abs,
    })
    return targets


def _completion_dir(run_abs: str, leaf: str, *, create: bool) -> str | None:
    parent = os.path.join(run_abs, RECEIPT_PARENT)
    target = os.path.join(parent, leaf)
    if create:
        for path, fsync_parent in ((parent, run_abs), (target, parent)):
            if os.path.lexists(path):
                if os.path.islink(path) or not os.path.isdir(path):
                    raise ValueError("completion-receipt directory is unsafe")
            else:
                os.mkdir(path, 0o755)
                _fsync_directory(fsync_parent)
    elif not os.path.exists(target):
        return None
    if os.path.islink(parent) or not os.path.isdir(parent) or os.path.islink(target) or not os.path.isdir(target):
        raise ValueError("completion-receipt directory is unsafe")
    return target


def _receipt_dir(run_abs: str, *, create: bool) -> str | None:
    return _completion_dir(run_abs, MEMO_RECEIPT_DIR, create=create)


def _attempt_dir(run_abs: str, *, create: bool) -> str | None:
    return _completion_dir(run_abs, MEMO_ATTEMPT_DIR, create=create)


def _output_state(target: dict[str, Any]) -> dict[str, Any]:
    path = target["output_abs"]
    if os.path.lexists(path) and not _regular_file(path):
        raise ValueError(f"memo output path {target['work']['output_path']} is not a direct regular file")
    if not _regular_file(path):
        return {
            "exists": False,
            "path": target["work"]["output_path"],
            "sha256": None,
            "mtime_ns": None,
            "ctime_ns": None,
        }
    info = os.lstat(path)
    return {
        "exists": True,
        "path": target["work"]["output_path"],
        "sha256": file_digest(path),
        # Nanosecond epoch values exceed RFC 8785 / JavaScript's safe-integer range.  Preserve every
        # digit as a canonical decimal string and parse only for the local temporal comparison.
        "mtime_ns": str(info.st_mtime_ns),
        "ctime_ns": str(info.st_ctime_ns),
    }


def _attempt_candidates(run_abs: str) -> list[tuple[str, dict[str, Any], str]]:
    directory = _attempt_dir(run_abs, create=False)
    if directory is None:
        return []
    attempts = []
    for name in sorted(os.listdir(directory)):
        path = os.path.join(directory, name)
        if not name.endswith(".json") or not _regular_file(path, nonempty=True):
            continue
        try:
            attempts.append((name, _read_json(path), path))
        except ValueError:
            continue
    return attempts


def _attempt_matches(name: str, attempt: dict[str, Any], target: dict[str, Any]) -> bool:
    if set(attempt) != {
        "schema_version", "armed_at", "work", "work_sha256", "prior_output", "attempt_sha256"
    }:
        return False
    if attempt.get("schema_version") != MEMO_ATTEMPT_SCHEMA or not _aware_timestamp(attempt.get("armed_at")):
        return False
    payload = dict(attempt)
    recorded = payload.pop("attempt_sha256", None)
    if (
        not isinstance(recorded, str)
        or not HEX64.fullmatch(recorded)
        or name != recorded + ".json"
        or recorded != canonical_sha256(payload)
        or attempt.get("work") != target["work"]
        or attempt.get("work_sha256") != target["work_sha256"]
    ):
        return False
    prior = attempt.get("prior_output")
    return (
        isinstance(prior, dict)
        and set(prior) == {"exists", "path", "sha256", "mtime_ns", "ctime_ns"}
        and isinstance(prior.get("exists"), bool)
        and prior.get("path") == target["work"]["output_path"]
        and ((prior["exists"] and isinstance(prior.get("sha256"), str)
              and HEX64.fullmatch(prior["sha256"])
              and isinstance(prior.get("mtime_ns"), str)
              and prior["mtime_ns"].isdigit()
              and isinstance(prior.get("ctime_ns"), str)
              and prior["ctime_ns"].isdigit())
             or (not prior["exists"] and all(prior.get(key) is None
                                              for key in ("sha256", "mtime_ns", "ctime_ns"))))
    )


def _eligible_attempt(target: dict[str, Any]) -> tuple[dict[str, Any], str] | None:
    valid_output, _ = _memo_output_valid(
        target["output_abs"], target["work"]["work_kind"], target["decision"]
    )
    if not valid_output:
        return None
    current = _output_state(target)
    matches = [
        (attempt.get("armed_at", ""), name, attempt, path)
        for name, attempt, path in _attempt_candidates(target["run_abs"])
        if _attempt_matches(name, attempt, target)
    ]
    for _, name, attempt, path in sorted(matches, reverse=True):
        prior = attempt["prior_output"]
        attempt_mtime_ns = os.lstat(path).st_mtime_ns
        bytes_changed = not prior["exists"] or current["sha256"] != prior["sha256"]
        written_after_arm = max(int(current["mtime_ns"]), int(current["ctime_ns"])) > attempt_mtime_ns
        if bytes_changed or written_after_arm:
            return attempt, name
    return None


def arm_derived_memo(target_id: str, run_root: str, repo: str = REPO) -> dict[str, Any]:
    expected_root, run_abs, repo_abs = _resolve_run(run_root, repo)
    authority = _authority(expected_root, run_abs, repo_abs)
    targets = _memo_targets(expected_root, run_abs, repo_abs, authority)
    matches = [target for target in targets if target["work"]["target_id"] == target_id]
    if len(matches) != 1:
        raise ValueError(f"unknown or ambiguous memo target {target_id!r}")
    target = matches[0]
    lock_fd = os.open(run_abs, os.O_RDONLY)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        payload: dict[str, Any] = {
            "schema_version": MEMO_ATTEMPT_SCHEMA,
            "armed_at": _now(),
            "work": target["work"],
            "work_sha256": target["work_sha256"],
            "prior_output": _output_state(target),
        }
        payload["attempt_sha256"] = canonical_sha256(payload)
        directory = _attempt_dir(run_abs, create=True)
        assert directory is not None
        name = payload["attempt_sha256"] + ".json"
        path = os.path.join(directory, name)
        if os.path.lexists(path):
            if not _regular_file(path, nonempty=True) or _read_json(path) != payload:
                raise ValueError("content-addressed memo attempt path is occupied by different bytes")
        else:
            _atomic_json(path, payload, ".derived-memo-attempt-")
        return {
            "status": "armed",
            "target_id": target_id,
            "attempt_path": f"{expected_root}/{RECEIPT_PARENT}/{MEMO_ATTEMPT_DIR}/{name}",
            "attempt_sha256": payload["attempt_sha256"],
        }
    finally:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        finally:
            os.close(lock_fd)


def _receipt_candidates(run_abs: str) -> tuple[list[tuple[str, dict[str, Any]]], int]:
    directory = _receipt_dir(run_abs, create=False)
    if directory is None:
        return [], 0
    valid_json: list[tuple[str, dict[str, Any]]] = []
    invalid = 0
    for name in sorted(os.listdir(directory)):
        path = os.path.join(directory, name)
        if not name.endswith(".json"):
            continue
        if not _regular_file(path, nonempty=True):
            invalid += 1
            continue
        try:
            valid_json.append((name, _read_json(path)))
        except ValueError:
            invalid += 1
    return valid_json, invalid


def _receipt_matches(
    name: str, receipt: dict[str, Any], target: dict[str, Any]
) -> bool:
    if set(receipt) != {
        "schema_version", "completed_at", "work", "work_sha256", "output",
        "completion_witness", "receipt_sha256"
    }:
        return False
    if receipt.get("schema_version") != MEMO_RECEIPT_SCHEMA or not _aware_timestamp(receipt.get("completed_at")):
        return False
    payload = dict(receipt)
    recorded = payload.pop("receipt_sha256", None)
    if not isinstance(recorded, str) or not HEX64.fullmatch(recorded):
        return False
    if name != recorded + ".json" or recorded != canonical_sha256(payload):
        return False
    if receipt.get("work") != target["work"] or receipt.get("work_sha256") != target["work_sha256"]:
        return False
    witness = receipt.get("completion_witness")
    if not isinstance(witness, dict) or set(witness) != {"mode", "attempt_path", "attempt_sha256"}:
        return False
    if witness.get("mode") not in {"parent_verified", "recovered_armed_output"}:
        return False
    attempt_sha = witness.get("attempt_sha256")
    expected_prefix = f"{target['work']['run_root']}/{RECEIPT_PARENT}/{MEMO_ATTEMPT_DIR}/"
    if (
        not isinstance(attempt_sha, str)
        or not HEX64.fullmatch(attempt_sha)
        or witness.get("attempt_path") != expected_prefix + attempt_sha + ".json"
    ):
        return False
    attempt_abs = os.path.join(target["repo_abs"], witness["attempt_path"])
    try:
        attempt = _read_json(attempt_abs)
    except ValueError:
        return False
    if not _attempt_matches(os.path.basename(attempt_abs), attempt, target):
        return False
    valid, _ = _memo_output_valid(
        target["output_abs"], target["work"]["work_kind"], target["decision"]
    )
    if not valid:
        return False
    output = receipt.get("output")
    return output == {
        "path": target["work"]["output_path"],
        "sha256": file_digest(target["output_abs"]),
    }


def derived_memo_plan(run_root: str, repo: str = REPO) -> dict[str, Any]:
    expected_root, run_abs, repo_abs = _resolve_run(run_root, repo)
    authority = _authority(expected_root, run_abs, repo_abs)
    targets = _memo_targets(expected_root, run_abs, repo_abs, authority)
    receipts, invalid = _receipt_candidates(run_abs)
    rows = []
    for target in targets:
        output_valid, output_reason = _memo_output_valid(
            target["output_abs"], target["work"]["work_kind"], target["decision"]
        )
        matching = [name for name, value in receipts if _receipt_matches(name, value, target)]
        action = "reuse" if output_valid and matching else "run"
        reason = (
            "exact output and content-addressed completion receipt validated"
            if action == "reuse"
            else output_reason if not output_valid
            else "output has no exact completion receipt for the current authority and source bytes"
        )
        rows.append({
            "target_id": target["work"]["target_id"],
            "work_kind": target["work"]["work_kind"],
            "action": action,
            "reason": reason,
            "source_paths": [row["path"] for row in target["work"]["sources"]],
            "output_path": target["work"]["output_path"],
            "work_sha256": target["work_sha256"],
            "receipt_path": (
                f"{expected_root}/{RECEIPT_PARENT}/{MEMO_RECEIPT_DIR}/{matching[-1]}"
                if matching else None
            ),
        })
    return {
        "schema_version": MEMO_PLAN_SCHEMA,
        "run_root": expected_root,
        "authority": authority,
        "all_complete": all(row["action"] == "reuse" for row in rows),
        "invalid_receipts_ignored": invalid,
        "targets": rows,
    }


def _seal_derived_target(
    target: dict[str, Any], expected_root: str, *, witness_mode: str
) -> dict[str, Any]:
    if witness_mode not in {"parent_verified", "recovered_armed_output"}:
        raise ValueError("unknown memo completion-witness mode")
    target_id = target["work"]["target_id"]
    run_abs = target["run_abs"]
    lock_fd = os.open(run_abs, os.O_RDONLY)
    try:
        fcntl.flock(lock_fd, fcntl.LOCK_EX)
        valid, reason = _memo_output_valid(
            target["output_abs"], target["work"]["work_kind"], target["decision"]
        )
        if not valid:
            raise ValueError("refusing to seal an incomplete memo: " + reason)
        receipts, _ = _receipt_candidates(run_abs)
        existing = [name for name, value in receipts if _receipt_matches(name, value, target)]
        if existing:
            return {
                "status": "existing",
                "target_id": target_id,
                "receipt_path": f"{expected_root}/{RECEIPT_PARENT}/{MEMO_RECEIPT_DIR}/{existing[-1]}",
            }
        eligible = _eligible_attempt(target)
        if eligible is None:
            raise ValueError(
                "refusing to seal a memo without an armed Task attempt that predates these output bytes"
            )
        attempt, attempt_name = eligible
        payload: dict[str, Any] = {
            "schema_version": MEMO_RECEIPT_SCHEMA,
            "completed_at": _now(),
            "work": target["work"],
            "work_sha256": target["work_sha256"],
            "output": {
                "path": target["work"]["output_path"],
                "sha256": file_digest(target["output_abs"]),
            },
            "completion_witness": {
                "mode": witness_mode,
                "attempt_path": (
                    f"{expected_root}/{RECEIPT_PARENT}/{MEMO_ATTEMPT_DIR}/{attempt_name}"
                ),
                "attempt_sha256": attempt["attempt_sha256"],
            },
        }
        payload["receipt_sha256"] = canonical_sha256(payload)
        directory = _receipt_dir(run_abs, create=True)
        assert directory is not None
        receipt_name = payload["receipt_sha256"] + ".json"
        receipt_path = os.path.join(directory, receipt_name)
        if os.path.lexists(receipt_path):
            if not _regular_file(receipt_path, nonempty=True) or _read_json(receipt_path) != payload:
                raise ValueError("content-addressed memo receipt path is occupied by different bytes")
        else:
            _atomic_json(receipt_path, payload, ".derived-memo-receipt-")
        return {
            "status": "created",
            "target_id": target_id,
            "receipt_path": f"{expected_root}/{RECEIPT_PARENT}/{MEMO_RECEIPT_DIR}/{receipt_name}",
            "receipt_sha256": payload["receipt_sha256"],
        }
    finally:
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_UN)
        finally:
            os.close(lock_fd)


def seal_derived_memo(target_id: str, run_root: str, repo: str = REPO) -> dict[str, Any]:
    expected_root, run_abs, repo_abs = _resolve_run(run_root, repo)
    authority = _authority(expected_root, run_abs, repo_abs)
    targets = _memo_targets(expected_root, run_abs, repo_abs, authority)
    matches = [target for target in targets if target["work"]["target_id"] == target_id]
    if len(matches) != 1:
        raise ValueError(f"unknown or ambiguous memo target {target_id!r}")
    return _seal_derived_target(matches[0], expected_root, witness_mode="parent_verified")


def promote_derived_memos(run_root: str, repo: str = REPO) -> dict[str, Any]:
    expected_root, run_abs, repo_abs = _resolve_run(run_root, repo)
    authority = _authority(expected_root, run_abs, repo_abs)
    targets = _memo_targets(expected_root, run_abs, repo_abs, authority)
    promoted: list[str] = []
    for target in targets:
        if _eligible_attempt(target) is None:
            continue
        result = _seal_derived_target(
            target, expected_root, witness_mode="recovered_armed_output"
        )
        if result["status"] == "created":
            promoted.append(target["work"]["target_id"])
    return {
        "status": "promoted",
        "run_root": expected_root,
        "promoted": promoted,
        "plan": derived_memo_plan(run_root, repo),
    }


def require_derived_memos(run_root: str, repo: str = REPO) -> dict[str, Any]:
    plan = derived_memo_plan(run_root, repo)
    missing = [row["target_id"] for row in plan["targets"] if row["action"] != "reuse"]
    if missing:
        raise ValueError("derived memo completion set is incomplete or stale: " + ", ".join(missing))
    return plan


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", default=REPO)
    commands = parser.add_subparsers(dest="command", required=True)
    for name in (
        "diagnostic-seal", "diagnostic-plan", "diagnostic-transform",
        "diagnostic-require-complete", "diagnostic-checkpoint",
        "audit-seal", "audit-plan", "audit-require-complete", "projection-require-complete",
        "projection-arm", "projection-recover",
        "memo-promote", "memo-plan", "memo-require-complete",
    ):
        sub = commands.add_parser(name)
        sub.add_argument("run_root")
    for name in ("memo-arm", "memo-seal"):
        memo_command = commands.add_parser(name)
        memo_command.add_argument("run_root")
        memo_command.add_argument("target_id")
    master_arm = commands.add_parser("master-arm")
    master_arm.add_argument("run_root")
    master_arm.add_argument("--allow-existing", action="store_true")
    master_recover = commands.add_parser("master-recover")
    master_recover.add_argument("run_root")
    master_recover.add_argument("--replacement-requested", action="store_true")
    return parser


def main(argv: list[str]) -> int:
    args = _parser().parse_args(argv)
    try:
        if args.command == "diagnostic-seal":
            result = seal_diagnostic_audit_inputs(args.run_root, args.repo_root)
        elif args.command == "diagnostic-plan":
            result = diagnostic_audit_plan(args.run_root, args.repo_root)
        elif args.command == "diagnostic-transform":
            result = apply_diagnostic_transforms(args.run_root, args.repo_root)
        elif args.command == "diagnostic-require-complete":
            result = require_diagnostic_audits(args.run_root, args.repo_root)
        elif args.command == "diagnostic-checkpoint":
            result = checkpoint_diagnostic_pair(args.run_root, args.repo_root)
        elif args.command == "audit-seal":
            result = seal_final_audit_inputs(args.run_root, args.repo_root)
        elif args.command == "audit-plan":
            result = final_audit_plan(args.run_root, args.repo_root)
        elif args.command == "audit-require-complete":
            result = require_final_audits(args.run_root, args.repo_root)
        elif args.command == "projection-require-complete":
            result = require_projection_paid_completion(args.run_root, args.repo_root)
        elif args.command == "projection-arm":
            result = arm_final_projection(args.run_root, args.repo_root)
        elif args.command == "projection-recover":
            result = recover_final_projection(args.run_root, args.repo_root)
        elif args.command == "master-arm":
            result = arm_master_synthesis(
                args.run_root, args.repo_root, allow_existing=args.allow_existing
            )
        elif args.command == "master-recover":
            result = recover_master_synthesis(
                args.run_root, args.repo_root,
                replacement_requested=args.replacement_requested,
            )
        elif args.command == "memo-plan":
            result = derived_memo_plan(args.run_root, args.repo_root)
        elif args.command == "memo-promote":
            result = promote_derived_memos(args.run_root, args.repo_root)
        elif args.command == "memo-arm":
            result = arm_derived_memo(args.target_id, args.run_root, args.repo_root)
        elif args.command == "memo-seal":
            result = seal_derived_memo(args.target_id, args.run_root, args.repo_root)
        elif args.command == "memo-require-complete":
            result = require_derived_memos(args.run_root, args.repo_root)
        else:
            raise ValueError(f"unsupported command {args.command!r}")
        print(json.dumps(result, ensure_ascii=False, sort_keys=True))
        return 0
    except (OSError, TypeError, ValueError, json.JSONDecodeError) as exc:
        print(json.dumps({"status": "error", "error": str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
