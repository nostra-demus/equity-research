#!/usr/bin/env python3
"""Owner-only local incident controls for production research memory.

The control plane is deliberately smaller than canonical memory.  It can stop reads, disable a
layer, quarantine one playbook locally, or pin one playbook version while a governed canonical
status change is prepared.  It cannot activate memory, edit a canonical object, or relax a rule.
Every mutation is an atomic 0600 write plus an append-only, content-free audit receipt.
"""
from __future__ import annotations

import argparse
import contextlib
import datetime as dt
import json
import os
import re
import stat
import uuid
from pathlib import Path
from typing import Any, Mapping, Sequence

try:
    import fcntl
except ImportError:  # pragma: no cover - exercised on non-POSIX hosts
    fcntl = None  # type: ignore[assignment]

try:
    from canonical_json import canonical_json_bytes, canonical_sha256
    from memory_runtime import _safe_directory, _safe_regular
except ImportError:  # pragma: no cover - package-style imports
    from scripts.canonical_json import canonical_json_bytes, canonical_sha256
    from scripts.memory_runtime import _safe_directory, _safe_regular


CONTROL_SCHEMA = "memory-runtime-controls/v1"
AUDIT_SCHEMA = "memory-runtime-control-audit/v1"
SAFE_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9._/-]{0,127}")
HASH = re.compile(r"sha256:[0-9a-f]{64}")
LAYERS = ("episodic", "semantic", "procedural")
REASONS = (
    "policy-leak", "stale-fact", "prompt-injection", "serious-evidence-error",
    "operator-emergency", "provider-incident", "purge-pending",
)
MAX_PENDING_CANDIDATES = 1_000
MAX_CANDIDATE_BATCHES_PER_MINUTE = 30


class IncidentControlError(ValueError):
    """A control mutation is malformed, unsafe, or conflicts with current state."""


def _now(value: str | None = None) -> str:
    moment = dt.datetime.fromisoformat(value.replace("Z", "+00:00")) if value else dt.datetime.now(dt.timezone.utc)
    if moment.tzinfo is None:
        raise IncidentControlError("control timestamp must be timezone-aware")
    return moment.astimezone(dt.timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def _safe_id(value: str, label: str) -> str:
    if SAFE_ID.fullmatch(value) is None:
        raise IncidentControlError(f"{label} is invalid")
    return value


def _atomic_private(path: Path, value: Mapping[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    if os.name == "posix":
        os.chmod(path.parent, 0o700)
    temporary = path.parent / f".{path.name}.{uuid.uuid4().hex}"
    descriptor = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        raw = canonical_json_bytes(dict(value))
        view = memoryview(raw)
        while view:
            written = os.write(descriptor, view)
            if written <= 0:
                raise IncidentControlError("control write made no progress")
            view = view[written:]
        os.fsync(descriptor)
        os.close(descriptor)
        descriptor = -1
        os.replace(temporary, path)
        if os.name == "posix":
            directory = os.open(path.parent, os.O_RDONLY)
            try:
                os.fsync(directory)
            finally:
                os.close(directory)
    finally:
        if descriptor >= 0:
            os.close(descriptor)
        if temporary.exists():
            temporary.unlink()


@contextlib.contextmanager
def _owner_lock(root: Path, name: str):
    if (
        os.name != "posix" or fcntl is None
        or not all(hasattr(os, capability) for capability in ("fchmod", "getuid"))
    ):
        raise IncidentControlError("incident control requires POSIX owner-lock primitives")
    controls = root / "controls"
    controls.mkdir(parents=True, exist_ok=True, mode=0o700)
    if os.name == "posix":
        os.chmod(controls, 0o700)
    path = controls / name
    descriptor = os.open(
        path, os.O_RDWR | os.O_CREAT | getattr(os, "O_NOFOLLOW", 0), 0o600,
    )
    try:
        os.fchmod(descriptor, 0o600)
        opened = os.fstat(descriptor)
        named = path.lstat()
        if (
            not stat.S_ISREG(opened.st_mode) or stat.S_ISLNK(named.st_mode)
            or opened.st_uid != os.getuid() or opened.st_nlink != 1
            or (opened.st_dev, opened.st_ino) != (named.st_dev, named.st_ino)
        ):
            raise IncidentControlError("incident control lock is unsafe")
        fcntl.flock(descriptor, fcntl.LOCK_EX)
        locked = os.fstat(descriptor)
        named = path.lstat()
        if (
            not stat.S_ISREG(locked.st_mode) or stat.S_ISLNK(named.st_mode)
            or locked.st_uid != os.getuid() or locked.st_nlink != 1
            or (locked.st_dev, locked.st_ino) != (named.st_dev, named.st_ino)
        ):
            raise IncidentControlError("incident control lock changed during acquisition")
        yield
    finally:
        try:
            fcntl.flock(descriptor, fcntl.LOCK_UN)
        finally:
            os.close(descriptor)


def default_controls(*, updated_at: str, actor: str) -> dict[str, Any]:
    body: dict[str, Any] = {
        "schema": CONTROL_SCHEMA,
        "revision": 0,
        "updated_at": updated_at,
        "updated_by": actor,
        "global_disabled": False,
        "disabled_layers": [],
        "disabled_playbooks": [],
        "pinned_playbooks": [],
        "candidate_intake_disabled": False,
        "control_sha256": "sha256:" + "0" * 64,
    }
    body["control_sha256"] = "sha256:" + canonical_sha256({k: v for k, v in body.items() if k != "control_sha256"})
    return body


def verify_controls(value: Mapping[str, Any]) -> dict[str, Any]:
    fields = {
        "schema", "revision", "updated_at", "updated_by", "global_disabled",
        "disabled_layers", "disabled_playbooks", "pinned_playbooks",
        "candidate_intake_disabled", "control_sha256",
    }
    if not isinstance(value, Mapping) or set(value) != fields or value.get("schema") != CONTROL_SCHEMA:
        raise IncidentControlError("control file has an invalid closed shape")
    if type(value.get("revision")) is not int or value["revision"] < 0:
        raise IncidentControlError("control revision is invalid")
    _now(str(value.get("updated_at")))
    _safe_id(str(value.get("updated_by")), "control actor")
    if type(value.get("global_disabled")) is not bool or type(value.get("candidate_intake_disabled")) is not bool:
        raise IncidentControlError("control booleans are invalid")
    layers = value.get("disabled_layers")
    if not isinstance(layers, list) or layers != sorted(set(layers)) or any(item not in LAYERS for item in layers):
        raise IncidentControlError("disabled layers are invalid")
    disabled = value.get("disabled_playbooks")
    if not isinstance(disabled, list) or len(disabled) > 512:
        raise IncidentControlError("disabled playbooks are invalid")
    seen: set[tuple[str, int | None]] = set()
    for row in disabled:
        if not isinstance(row, Mapping) or set(row) != {"playbook_id", "version", "reason", "disabled_at"}:
            raise IncidentControlError("disabled playbook entry is invalid")
        playbook_id = _safe_id(str(row.get("playbook_id")), "playbook id")
        version = row.get("version")
        if version is not None and (type(version) is not int or version < 1):
            raise IncidentControlError("disabled playbook version is invalid")
        if row.get("reason") not in REASONS:
            raise IncidentControlError("disabled playbook reason is invalid")
        _now(str(row.get("disabled_at")))
        if (playbook_id, version) in seen:
            raise IncidentControlError("duplicate disabled playbook")
        seen.add((playbook_id, version))
    pinned = value.get("pinned_playbooks")
    if not isinstance(pinned, list) or len(pinned) > 512:
        raise IncidentControlError("pinned playbooks are invalid")
    pin_ids: set[str] = set()
    for row in pinned:
        if not isinstance(row, Mapping) or set(row) != {"playbook_id", "version", "pinned_at"}:
            raise IncidentControlError("pinned playbook entry is invalid")
        playbook_id = _safe_id(str(row.get("playbook_id")), "playbook id")
        if playbook_id in pin_ids or type(row.get("version")) is not int or row["version"] < 1:
            raise IncidentControlError("pinned playbook is invalid")
        _now(str(row.get("pinned_at")))
        pin_ids.add(playbook_id)
    supplied = value.get("control_sha256")
    if not isinstance(supplied, str) or HASH.fullmatch(supplied) is None:
        raise IncidentControlError("control hash is invalid")
    expected = "sha256:" + canonical_sha256({k: v for k, v in value.items() if k != "control_sha256"})
    if supplied != expected:
        raise IncidentControlError("control hash does not match")
    return dict(value)


def load_controls(state_root: str | Path, *, actor: str = "memory-control-reader") -> dict[str, Any]:
    root = _safe_directory(Path(state_root), create=True)
    path = root / "controls" / "runtime-controls.json"
    if not path.exists():
        return default_controls(updated_at="1970-01-01T00:00:00.000000Z", actor=_safe_id(actor, "control actor"))
    try:
        value = json.loads(_safe_regular(path))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise IncidentControlError("control file is unreadable") from exc
    return verify_controls(value)


def _write_audit(root: Path, before: Mapping[str, Any], after: Mapping[str, Any], *, operation: str) -> Path:
    audit = {
        "schema": AUDIT_SCHEMA,
        "audit_id": f"control-audit-{uuid.uuid4()}",
        "operation": operation,
        "revision_before": before["revision"],
        "revision_after": after["revision"],
        "before_sha256": before["control_sha256"],
        "after_sha256": after["control_sha256"],
        "actor": after["updated_by"],
        "recorded_at": after["updated_at"],
    }
    audit["audit_sha256"] = "sha256:" + canonical_sha256(audit)
    path = root / "controls" / "audit" / f"{after['revision']:020d}-{audit['audit_id']}.json"
    _atomic_private(path, audit)
    return path


def _mutate_controls_unlocked(
    state_root: str | Path, *, operation: str, actor: str, reason: str | None = None,
    layer: str | None = None, playbook_id: str | None = None, version: int | None = None,
    now: str | None = None,
) -> tuple[dict[str, Any], Path]:
    root = _safe_directory(Path(state_root), create=True)
    actor = _safe_id(actor, "control actor")
    before = load_controls(root, actor=actor)
    at = _now(now)
    after = {**before, "revision": before["revision"] + 1, "updated_at": at, "updated_by": actor}
    disabled_layers = list(before["disabled_layers"])
    disabled = [dict(item) for item in before["disabled_playbooks"]]
    pinned = [dict(item) for item in before["pinned_playbooks"]]
    if operation in {"global-disable", "global-enable", "candidate-intake-disable", "candidate-intake-enable"}:
        field = "global_disabled" if operation.startswith("global-") else "candidate_intake_disabled"
        after[field] = operation.endswith("disable")
    elif operation in {"layer-disable", "layer-enable"}:
        if layer not in LAYERS:
            raise IncidentControlError("layer is invalid")
        if operation == "layer-disable":
            disabled_layers = sorted(set(disabled_layers) | {layer})
        else:
            disabled_layers = [item for item in disabled_layers if item != layer]
    elif operation == "playbook-quarantine":
        if reason not in REASONS:
            raise IncidentControlError("quarantine reason is invalid")
        playbook_id = _safe_id(str(playbook_id), "playbook id")
        if version is not None and (type(version) is not int or version < 1):
            raise IncidentControlError("playbook version is invalid")
        disabled = [row for row in disabled if not (row["playbook_id"] == playbook_id and row["version"] == version)]
        disabled.append({"playbook_id": playbook_id, "version": version, "reason": reason, "disabled_at": at})
        disabled.sort(key=lambda row: (row["playbook_id"], row["version"] or 0))
    elif operation == "playbook-restore":
        playbook_id = _safe_id(str(playbook_id), "playbook id")
        disabled = [row for row in disabled if not (row["playbook_id"] == playbook_id and (version is None or row["version"] == version))]
    elif operation == "playbook-pin":
        playbook_id = _safe_id(str(playbook_id), "playbook id")
        if type(version) is not int or version < 1:
            raise IncidentControlError("pinned version is invalid")
        pinned = [row for row in pinned if row["playbook_id"] != playbook_id]
        pinned.append({"playbook_id": playbook_id, "version": version, "pinned_at": at})
        pinned.sort(key=lambda row: row["playbook_id"])
    elif operation == "playbook-unpin":
        playbook_id = _safe_id(str(playbook_id), "playbook id")
        pinned = [row for row in pinned if row["playbook_id"] != playbook_id]
    else:
        raise IncidentControlError("control operation is unsupported")
    after["disabled_layers"] = disabled_layers
    after["disabled_playbooks"] = disabled
    after["pinned_playbooks"] = pinned
    after["control_sha256"] = "sha256:" + canonical_sha256({k: v for k, v in after.items() if k != "control_sha256"})
    after = verify_controls(after)
    control_path = root / "controls" / "runtime-controls.json"
    _atomic_private(control_path, after)
    audit = _write_audit(root, before, after, operation=operation)
    return after, audit


def mutate_controls(
    state_root: str | Path, *, operation: str, actor: str, reason: str | None = None,
    layer: str | None = None, playbook_id: str | None = None, version: int | None = None,
    now: str | None = None,
) -> tuple[dict[str, Any], Path]:
    root = _safe_directory(Path(state_root), create=True)
    with _owner_lock(root, "runtime-controls.lock"):
        return _mutate_controls_unlocked(
            root, operation=operation, actor=actor, reason=reason, layer=layer,
            playbook_id=playbook_id, version=version, now=now,
        )


@contextlib.contextmanager
def candidate_intake_guard(state_root: str | Path):
    """Serialize and bound candidate batches across semantic and procedural writers."""

    root = _safe_directory(Path(state_root), create=True)
    controls = root / "controls"
    with _owner_lock(root, "candidate-intake.lock"):
        if load_controls(root).get("candidate_intake_disabled") is True:
            raise IncidentControlError("candidate intake is disabled")
        candidate_root = root / "candidates"
        files: list[Path] = []
        if candidate_root.is_dir() and not candidate_root.is_symlink():
            files = [
                candidate for candidate in candidate_root.rglob("*")
                if candidate.is_file() and not candidate.is_symlink()
                and (candidate.name.endswith(".json") or candidate.name.endswith(".sealed.json"))
            ]
        if len(files) >= MAX_PENDING_CANDIDATES:
            raise IncidentControlError("candidate backlog limit reached")
        now_seconds = dt.datetime.now(dt.timezone.utc).timestamp()
        recent_batches = [
            candidate for candidate in (controls / "candidate-batches").glob("*.json")
            if candidate.is_file() and not candidate.is_symlink()
            and now_seconds - candidate.stat().st_mtime <= 60
        ] if (controls / "candidate-batches").is_dir() else []
        if len(recent_batches) >= MAX_CANDIDATE_BATCHES_PER_MINUTE:
            raise IncidentControlError("candidate intake rate limit reached")
        receipt = {
            "schema": "memory-candidate-batch-receipt/v1",
            "batch_id": f"candidate-batch-{uuid.uuid4()}",
            "started_at": _now(),
        }
        receipt["receipt_sha256"] = "sha256:" + canonical_sha256(receipt)
        _atomic_private(
            controls / "candidate-batches" / f"{receipt['started_at'].replace(':', '')}-{receipt['batch_id']}.json",
            receipt,
        )
        yield


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="memory-incident-control", description=__doc__)
    parser.add_argument("--state-root", required=True)
    parser.add_argument("--actor", required=True)
    parser.add_argument("--now")
    sub = parser.add_subparsers(dest="operation", required=True)
    for name in ("global-disable", "global-enable", "candidate-intake-disable", "candidate-intake-enable"):
        sub.add_parser(name)
    for name in ("layer-disable", "layer-enable"):
        command = sub.add_parser(name)
        command.add_argument("--layer", choices=LAYERS, required=True)
    quarantine = sub.add_parser("playbook-quarantine")
    quarantine.add_argument("--playbook-id", required=True)
    quarantine.add_argument("--version", type=int)
    quarantine.add_argument("--reason", choices=REASONS, required=True)
    restore = sub.add_parser("playbook-restore")
    restore.add_argument("--playbook-id", required=True)
    restore.add_argument("--version", type=int)
    pin = sub.add_parser("playbook-pin")
    pin.add_argument("--playbook-id", required=True)
    pin.add_argument("--version", type=int, required=True)
    unpin = sub.add_parser("playbook-unpin")
    unpin.add_argument("--playbook-id", required=True)
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        controls, audit = mutate_controls(
            args.state_root, operation=args.operation, actor=args.actor,
            reason=getattr(args, "reason", None), layer=getattr(args, "layer", None),
            playbook_id=getattr(args, "playbook_id", None), version=getattr(args, "version", None),
            now=args.now,
        )
    except (IncidentControlError, OSError, ValueError) as exc:
        print(json.dumps({"schema": "memory-runtime-control-result/v1", "ok": False, "code": str(exc)}, sort_keys=True))
        return 4
    print(json.dumps({
        "schema": "memory-runtime-control-result/v1", "ok": True,
        "revision": controls["revision"], "control_sha256": controls["control_sha256"],
        "audit_path": str(audit),
    }, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


__all__ = [
    "AUDIT_SCHEMA", "CONTROL_SCHEMA", "IncidentControlError", "default_controls",
    "candidate_intake_guard", "load_controls", "mutate_controls", "verify_controls",
]
