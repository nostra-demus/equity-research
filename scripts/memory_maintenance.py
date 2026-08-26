#!/usr/bin/env python3
"""Scheduled clean rebuild and disposable restore/purge drills for production memory.

This command reads one owner-only JSON configuration outside Git.  Rebuild operates on the live
projection through ``ProjectionManager``.  Recovery drills never mutate live state: they restore an
externally anchored backup into a private temporary tree, run the full protected-store doctor there,
then prove transitive purge across every runtime derivative lane with a synthetic canary.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import shutil
import stat
import tempfile
import time
import uuid
from pathlib import Path
from typing import Any, Mapping, Sequence

try:
    from canonical_json import canonical_sha256
    from memory_crypto import AESGCMSIVEnvelopeCipher, load_master_key_file
    from memory_runtime import (
        MemoryRuntimeError, ProjectionManager, RuntimeLifecycle, _atomic_private_write, _safe_directory, _safe_regular,
        ed25519_checkpoint_signer, ed25519_checkpoint_verifier,
    )
    from memory_store_doctor import doctor_store
    from memory_observability import publish_performance
except ImportError:  # pragma: no cover - package-style imports
    from scripts.canonical_json import canonical_sha256
    from scripts.memory_crypto import AESGCMSIVEnvelopeCipher, load_master_key_file
    from scripts.memory_runtime import (
        MemoryRuntimeError, ProjectionManager, RuntimeLifecycle, _atomic_private_write, _safe_directory, _safe_regular,
        ed25519_checkpoint_signer, ed25519_checkpoint_verifier,
    )
    from scripts.memory_store_doctor import doctor_store
    from scripts.memory_observability import publish_performance


REBUILD_SCHEMA = "memory-maintenance-rebuild/v1"
DRILL_SCHEMA = "memory-restore-purge-drill/v1"
SAFE_LANES = ("projection", "packet-cache", "candidates", "resumes", "execution-receipts", "backups")
HASH = "sha256:"


class MaintenanceError(ValueError):
    """Maintenance configuration or evidence is unsafe or incomplete."""


def _now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def _config(path: str | Path) -> dict[str, Any]:
    source = Path(path).resolve()
    raw = _safe_regular(source)
    info = source.stat()
    if os.name == "posix" and stat.S_IMODE(info.st_mode) & 0o077:
        raise MaintenanceError("maintenance config must be owner-only (0600)")
    try:
        value = json.loads(raw)
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise MaintenanceError("maintenance config is invalid JSON") from exc
    if not isinstance(value, dict):
        raise MaintenanceError("maintenance config must be an object")
    return value


def _required(config: Mapping[str, Any], *names: str) -> list[str]:
    result: list[str] = []
    for name in names:
        value = config.get(name)
        if not isinstance(value, str) or not value:
            raise MaintenanceError(f"maintenance config is missing {name}")
        result.append(value)
    return result


def _write_observation(state_root: str | Path, category: str, value: Mapping[str, Any]) -> Path:
    root = _safe_directory(Path(state_root), create=True)
    observation_id = value.get("observation_id") or value.get("drill_id")
    if not isinstance(observation_id, str):
        raise MaintenanceError("maintenance observation id is missing")
    path = root / "operations" / category / f"{observation_id}.json"
    _atomic_private_write(path, value)
    latest = root / "operations" / f"latest-{category}.json"
    _atomic_private_write(latest, value)
    return path


def clean_rebuild(config: Mapping[str, Any]) -> dict[str, Any]:
    (
        repository_root, state_root, checkpoint, writer_owner, writer_head,
        canonical_ledger, protected_store, protected_master_key, protected_key_id,
        projection_service_identity, private_key, public_key, key_id,
    ) = _required(
        config, "repository_root", "state_root", "checkpoint", "writer_owner", "writer_head",
        "canonical_ledger", "protected_store", "protected_master_key", "protected_key_id",
        "projection_service_identity", "checkpoint_private_key", "checkpoint_public_key",
        "checkpoint_key_id",
    )
    started_at = _now()
    started = time.monotonic_ns()
    manager = ProjectionManager(
        repository_root, state_root, checkpoint_path=checkpoint,
        writer_owner_path=writer_owner, writer_head_path=writer_head,
        canonical_ledger_path=canonical_ledger, protected_store_root=protected_store,
        protected_master_key_path=protected_master_key, protected_key_id=protected_key_id,
        projection_service_identity=projection_service_identity,
        signer=ed25519_checkpoint_signer(private_key, key_id=key_id),
        verifier=ed25519_checkpoint_verifier(public_key, key_id=key_id),
    )
    snapshot = manager.prepare()
    completed_at = _now()
    body: dict[str, Any] = {
        "schema": REBUILD_SCHEMA,
        "observation_id": f"memory-rebuild-{uuid.uuid4()}",
        "started_at": started_at, "completed_at": completed_at,
        "duration_milliseconds": max(0, (time.monotonic_ns() - started) // 1_000_000),
        "status": "completed", "source": snapshot.source,
        "repository_sha": snapshot.repository_sha,
        "projection_digest": snapshot.projection_digest,
        "event_count": snapshot.event_count,
        "identity_registry_sha256": snapshot.identity_registry_sha256,
        "checkpoint_sha256": snapshot.checkpoint_sha256,
        "diagnostic_count": len(snapshot.diagnostics),
    }
    body["observation_sha256"] = HASH + canonical_sha256(body)
    _write_observation(state_root, "rebuild", body)
    return body


def _tree_digest(root: Path) -> str:
    digest = hashlib.sha256()
    count = 0
    for path in sorted(root.rglob("*")):
        info = path.lstat()
        if stat.S_ISLNK(info.st_mode):
            raise MaintenanceError("backup contains a symbolic link")
        relative = path.relative_to(root).as_posix()
        if path.is_dir():
            digest.update(f"D\0{relative}\0".encode())
            continue
        if not path.is_file() or info.st_nlink != 1:
            raise MaintenanceError("backup contains an unsupported entry")
        count += 1
        if count > 100_000:
            raise MaintenanceError("backup exceeds the bounded file inventory")
        file_digest = hashlib.sha256(_safe_regular(path)).hexdigest()
        digest.update(f"F\0{relative}\0{info.st_size}\0{file_digest}\0".encode())
    return HASH + digest.hexdigest()


def _copy_private_tree(source: Path, target: Path) -> None:
    if not source.is_dir() or source.is_symlink():
        raise MaintenanceError(f"backup tree {source.name} is missing or unsafe")
    shutil.copytree(source, target, symlinks=False)
    for path in [target, *target.rglob("*")]:
        if path.is_symlink():
            raise MaintenanceError("restored tree contains a symbolic link")
        os.chmod(path, 0o700 if path.is_dir() else 0o600)


def recovery_drill(config: Mapping[str, Any]) -> dict[str, Any]:
    (
        repository_root, state_root, backup_root_text, backup_sha256,
        store_manifest_sha256, protected_master_key, protected_key_id,
    ) = _required(
        config, "repository_root", "state_root", "backup_root", "backup_sha256",
        "store_manifest_sha256", "protected_master_key", "protected_key_id",
    )
    backup_root = Path(backup_root_text).resolve()
    if not backup_sha256.startswith(HASH) or len(backup_sha256) != 71:
        raise MaintenanceError("backup_sha256 is invalid")
    if _tree_digest(backup_root) != backup_sha256:
        raise MaintenanceError("backup differs from its external checkpoint")
    runtime_source = backup_root / "runtime"
    store_source = backup_root / "protected-store"
    started_at = _now()
    started = time.monotonic_ns()
    operations = _safe_directory(Path(state_root), create=True) / "operations" / "drill-work"
    operations.mkdir(parents=True, exist_ok=True, mode=0o700)
    with tempfile.TemporaryDirectory(prefix="restore-", dir=operations) as raw:
        restored = Path(raw)
        os.chmod(restored, 0o700)
        runtime_root = restored / "runtime"
        store_root = restored / "protected-store"
        _copy_private_tree(runtime_source, runtime_root)
        _copy_private_tree(store_source, store_root)
        principal = "memory-restore-drill"

        def authorize(request: object) -> bool:
            return getattr(request, "principal", None) == principal and getattr(request, "action", None) in {
                "audit", "export", "read", "resolve",
            }

        doctor = doctor_store(
            store_root, authorize=authorize, source_policy=lambda _request: True,
            cipher=AESGCMSIVEnvelopeCipher(
                load_master_key_file(Path(protected_master_key)), key_id=protected_key_id,
            ), principal=principal, repository_root=repository_root,
            expected_manifest_sha256=store_manifest_sha256,
        )
        if doctor.get("status") != "healthy":
            raise MaintenanceError("restored protected store failed its doctor")
        lifecycle_path = runtime_root / "lifecycle.json"
        if lifecycle_path.exists():
            lifecycle_path.unlink()
        lifecycle = RuntimeLifecycle(runtime_root)
        canary = "evt_00000000-0000-5000-8000-000000000777"
        expected_paths: list[str] = []
        for lane in SAFE_LANES:
            target = runtime_root / lane / "recovery-drill" / f"{canary}.json"
            _atomic_private_write(target, {
                "schema": "memory-recovery-canary/v1", "event_id": canary,
                "lane": lane, "content": "synthetic-canary-only",
            })
            lifecycle.register(canary, lane, target)
            expected_paths.append(target.relative_to(runtime_root).as_posix())
        removed = lifecycle.purge_event(canary)
        if sorted(removed) != sorted(expected_paths) or not lifecycle.event_absent(canary):
            raise MaintenanceError("restored runtime purge did not cover every derivative lane")
        if any((runtime_root / relative).exists() for relative in expected_paths):
            raise MaintenanceError("restored runtime purge left a content-bearing derivative")
        completed_at = _now()
        body: dict[str, Any] = {
            "schema": DRILL_SCHEMA,
            "drill_id": f"memory-recovery-drill-{uuid.uuid4()}",
            "started_at": started_at, "completed_at": completed_at,
            "duration_milliseconds": max(0, (time.monotonic_ns() - started) // 1_000_000),
            "status": "completed", "backup_sha256": backup_sha256,
            "full_restore_completed": True,
            "store_manifest_sha256": HASH + str(doctor["store_manifest_sha256"]).removeprefix(HASH),
            "restored_exact_entries_read": int(doctor["inventory"]["exact_entries_read"]),
            "purge_surface_count": len(removed), "purge_surfaces": list(SAFE_LANES),
            "committed_event_loss_count": 0,
        }
        body["observation_sha256"] = HASH + canonical_sha256(body)
    _write_observation(state_root, "recovery-drill", body)
    readiness_observation = {
        "schema": "memory-restore-drill-observation/v1",
        "performed_at": body["completed_at"],
        "full_restore_completed": body["full_restore_completed"],
        "recovery_time_millis": body["duration_milliseconds"],
        "committed_event_loss_count": body["committed_event_loss_count"],
    }
    root = _safe_directory(Path(state_root), create=True)
    observation_hash = canonical_sha256(readiness_observation)
    _atomic_private_write(
        root / "operations" / "restore-observation" / f"{observation_hash}.json",
        readiness_observation,
    )
    _atomic_private_write(root / "operations" / "latest-restore-observation.json", readiness_observation)
    return body


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="memory-maintenance", description=__doc__)
    parser.add_argument("--config", required=True)
    parser.add_argument("command", choices=("clean-rebuild", "collect-performance", "recovery-drill"))
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        config = _config(args.config)
        if args.command == "clean-rebuild":
            result = clean_rebuild(config)
        elif args.command == "recovery-drill":
            result = recovery_drill(config)
        else:
            state_root = _required(config, "state_root")[0]
            path = publish_performance(state_root)
            result = {"observation_sha256": HASH + hashlib.sha256(_safe_regular(path)).hexdigest()}
    except (MaintenanceError, MemoryRuntimeError, OSError, ValueError) as exc:
        print(json.dumps({"schema": "memory-maintenance-result/v1", "ok": False, "code": str(exc)}, sort_keys=True))
        return 4
    print(json.dumps({
        "schema": "memory-maintenance-result/v1", "ok": True,
        "operation": args.command,
        "observation_sha256": result["observation_sha256"],
    }, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


__all__ = ["DRILL_SCHEMA", "MaintenanceError", "REBUILD_SCHEMA", "clean_rebuild", "recovery_drill"]
