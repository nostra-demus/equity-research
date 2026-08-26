#!/usr/bin/env python3
"""Provision the owner-only, deny-all production boundary used for memory shadow runs.

This command is intentionally narrower than the memory promotion/runtime CLIs. It can create only
``shadow`` configuration, never ``enforced`` configuration, canonical content, active lessons, or
active playbooks. The controlled writer it creates denies every write and recovery request; its sole
purpose is to give projection snapshots a real, immutable genesis owner/head while the live shadow
evidence is collected.
"""
from __future__ import annotations

import argparse
import base64
import contextlib
import datetime as dt
import fcntl
import hashlib
import importlib.util
import json
import os
import re
import secrets
import shutil
import stat
import sys
from pathlib import Path
from typing import Any, Callable, Iterator, Mapping, Sequence

from canonical_json import canonical_json_bytes, canonical_sha256
from memory_controlled_write import ControlledWriter, NdjsonCanonicalSink
from memory_crypto import (
    AESGCMSIVEnvelopeCipher,
    ed25519_sign,
    load_master_key_file,
    require_crypto_backend,
)
from memory_runtime import (
    ProjectionManager,
    authorize_provider,
    ed25519_checkpoint_signer,
    ed25519_checkpoint_verifier,
    ed25519_policy_verifier,
    load_controlled_ledger_events,
    load_protected_store_events,
)
from memory_store import MemoryStore
from memory_three_layer_contract import validate_contract
from research_memory_run import ed25519_contract_signer, ed25519_contract_verifier


SCHEMA = "memory-shadow-bootstrap-manifest/v1"
PROTECTED_KEY_ID = "key:memory-protected-v1"
CHECKPOINT_KEY_ID = "memory-checkpoint-v1"
CONTRACT_KEY_ID = "memory-contract-v1"
POLICY_KEY_ID = "memory-provider-policy-v1"
SERVICE_IDENTITY = "cockpit-runtime"
PROVIDER_MODEL_RE = re.compile(r"^([a-z][a-z0-9._-]{0,63})/(\S{1,256})$")
HASH_RE = re.compile(r"^sha256:[0-9a-f]{64}$")


class BootstrapError(RuntimeError):
    """The private shadow boundary could not be provisioned safely."""


def _utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def _sha_bytes(value: bytes) -> str:
    return "sha256:" + hashlib.sha256(value).hexdigest()


def _safe_directory(path: Path, *, create: bool = False) -> Path:
    path = Path(os.path.abspath(os.fspath(path.expanduser())))
    if create:
        path.mkdir(parents=True, exist_ok=True, mode=0o700)
    try:
        item = path.lstat()
    except OSError as exc:
        raise BootstrapError(f"private directory is unavailable: {path}") from exc
    if (
        stat.S_ISLNK(item.st_mode)
        or not stat.S_ISDIR(item.st_mode)
        or item.st_uid != os.getuid()
    ):
        raise BootstrapError(f"private directory is unsafe: {path}")
    os.chmod(path, 0o700)
    return path


def _safe_file(path: Path, *, exact_size: int | None = None) -> bytes:
    try:
        before = path.lstat()
    except OSError as exc:
        raise BootstrapError(f"private file is unavailable: {path}") from exc
    if (
        stat.S_ISLNK(before.st_mode)
        or not stat.S_ISREG(before.st_mode)
        or before.st_uid != os.getuid()
        or before.st_nlink != 1
        or before.st_mode & 0o077
    ):
        raise BootstrapError(f"private file is unsafe: {path}")
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(descriptor)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            raise BootstrapError(f"private file changed during open: {path}")
        chunks: list[bytes] = []
        remaining = opened.st_size
        while remaining:
            block = os.read(descriptor, min(remaining, 64 * 1024))
            if not block:
                raise BootstrapError(f"private file was truncated during read: {path}")
            chunks.append(block)
            remaining -= len(block)
        if os.read(descriptor, 1):
            raise BootstrapError(f"private file grew during read: {path}")
        after = os.fstat(descriptor)
    finally:
        os.close(descriptor)
    named = path.lstat()
    if (
        (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)
        != (named.st_dev, named.st_ino, named.st_size, named.st_mtime_ns)
    ):
        raise BootstrapError(f"private file changed during read: {path}")
    raw = b"".join(chunks)
    if exact_size is not None and len(raw) != exact_size:
        raise BootstrapError(f"private file has the wrong size: {path}")
    return raw


def _create_private_file(path: Path, data: bytes) -> None:
    _safe_directory(path.parent, create=True)
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(path, flags, 0o600)
    except FileExistsError as exc:
        raise BootstrapError(f"refusing to replace existing private file: {path}") from exc
    try:
        os.fchmod(descriptor, 0o600)
        written = 0
        while written < len(data):
            count = os.write(descriptor, data[written:])
            if count <= 0:
                raise BootstrapError(f"short write while creating: {path}")
            written += count
        os.fsync(descriptor)
    finally:
        os.close(descriptor)
    _safe_file(path, exact_size=len(data))


def _key_pair(directory: Path, name: str) -> tuple[Path, Path]:
    from cryptography.hazmat.primitives import serialization
    from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

    private = Ed25519PrivateKey.generate()
    seed = private.private_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PrivateFormat.Raw,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public = private.public_key().public_bytes(
        encoding=serialization.Encoding.Raw,
        format=serialization.PublicFormat.Raw,
    )
    private_path = directory / f"{name}.seed"
    public_path = directory / f"{name}.pub"
    _create_private_file(private_path, seed)
    _create_private_file(public_path, public)
    return private_path, public_path


def _parse_provider_models(values: Sequence[str]) -> tuple[tuple[str, str], ...]:
    rows: list[tuple[str, str]] = []
    for value in values:
        match = PROVIDER_MODEL_RE.fullmatch(value)
        if match is None:
            raise BootstrapError(f"invalid provider/model approval: {value!r}")
        row = (match.group(1), match.group(2))
        if row not in rows:
            rows.append(row)
    if not rows:
        raise BootstrapError("at least one --provider-model approval is required")
    return tuple(rows)


def _provider_policy(
    rows: Sequence[tuple[str, str]], *, private_key: Path, created_at: str,
) -> dict[str, Any]:
    providers = []
    for provider, model in rows:
        entitlement = {
            "schema": "memory-shadow-bootstrap-entitlement/v1",
            "provider": provider,
            "model": model,
            "service_identity": SERVICE_IDENTITY,
            "classifications": ["public", "internal"],
            "source_tiers": [1, 2, 3, 4, 5],
            "embedding_permitted": False,
        }
        providers.append({
            "provider": provider,
            "model": model,
            "service_identity": SERVICE_IDENTITY,
            "classifications": ["public", "internal"],
            "source_tiers": [1, 2, 3, 4, 5],
            "entitlement_set_sha256": "sha256:" + canonical_sha256(entitlement),
            "embedding_classifications": [],
            "embedding_permitted": False,
        })
    unsigned = {
        "schema": "memory-provider-policy/v1",
        "policy_id": "production-memory-provider-policy",
        "version": 1,
        "providers": providers,
        "default_action": "deny",
        "updated_at": created_at,
    }
    digest = "sha256:" + canonical_sha256(unsigned)
    signature = ed25519_sign(
        load_master_key_file(private_key),
        b"memory-provider-policy/v1\0" + canonical_json_bytes(unsigned),
    )
    value = {
        **unsigned,
        "policy_sha256": digest,
        "signature": {
            "key_id": POLICY_KEY_ID,
            "algorithm": "ed25519",
            "signed_sha256": digest,
            "value": base64.urlsafe_b64encode(signature).decode("ascii").rstrip("="),
        },
    }
    errors = validate_contract(value)
    if errors:
        raise BootstrapError("generated provider policy is invalid: " + "; ".join(errors[:8]))
    return value


def _private_env_module(repository_root: Path):
    helper = repository_root / "scripts" / "ops" / "set-private-env.py"
    if not helper.is_file() or helper.is_symlink():
        raise BootstrapError("private environment updater is unavailable")
    spec = importlib.util.spec_from_file_location("nostra_private_env", helper)
    if spec is None or spec.loader is None:
        raise BootstrapError("private environment updater cannot be loaded")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _environment_updates(paths: Mapping[str, Path], quarantine_token: str) -> dict[str, str]:
    return {
        "NOSTRA_MEMORY_STATE_ROOT": str(paths["state_root"]),
        "NOSTRA_MEMORY_CHECKPOINT": str(paths["checkpoint"]),
        "NOSTRA_MEMORY_WRITER_OWNER_PATH": str(paths["writer_owner"]),
        "NOSTRA_MEMORY_WRITER_HEAD": str(paths["writer_head"]),
        "NOSTRA_MEMORY_CANONICAL_LEDGER": str(paths["canonical_ledger"]),
        "NOSTRA_MEMORY_PROTECTED_STORE": str(paths["protected_store"]),
        "NOSTRA_MEMORY_PROTECTED_MASTER_KEY": str(paths["protected_master_key"]),
        "NOSTRA_MEMORY_PROTECTED_KEY_ID": PROTECTED_KEY_ID,
        "NOSTRA_MEMORY_PROJECTION_SERVICE_IDENTITY": "memory-projection-reader",
        "NOSTRA_MEMORY_CHECKPOINT_PRIVATE_KEY": str(paths["checkpoint_private_key"]),
        "NOSTRA_MEMORY_CHECKPOINT_PUBLIC_KEY": str(paths["checkpoint_public_key"]),
        "NOSTRA_MEMORY_CHECKPOINT_KEY_ID": CHECKPOINT_KEY_ID,
        "NOSTRA_MEMORY_CONTRACT_PRIVATE_KEY": str(paths["contract_private_key"]),
        "NOSTRA_MEMORY_CONTRACT_PUBLIC_KEY": str(paths["contract_public_key"]),
        "NOSTRA_MEMORY_CONTRACT_KEY_ID": CONTRACT_KEY_ID,
        "NOSTRA_MEMORY_PROVIDER_POLICY": str(paths["provider_policy"]),
        "NOSTRA_MEMORY_POLICY_PUBLIC_KEY": str(paths["policy_public_key"]),
        "NOSTRA_MEMORY_POLICY_KEY_ID": POLICY_KEY_ID,
        "NOSTRA_MEMORY_SERVICE_IDENTITY": SERVICE_IDENTITY,
        "NOSTRA_MEMORY_CANDIDATE_INTAKE_IDENTITY": "memory-candidate-intake",
        "NOSTRA_MEMORY_VERIFIER_IDENTITY": "memory-independent-verifier",
        "NOSTRA_MEMORY_WRITER_OWNER": "memory-canonical-writer",
        "NOSTRA_MEMORY_PROMOTION_SERVICE_IDENTITY": "memory-promotion-pr",
        "NOSTRA_MEMORY_QUARANTINE_SERVICE_IDENTITY": "memory-emergency-quarantine",
        "NOSTRA_MEMORY_RESTORE_SERVICE_IDENTITY": "memory-restore-retirement",
        "NOSTRA_MEMORY_QUARANTINE_TOKEN": quarantine_token,
        # This is deliberately last: one atomic providers.env replace makes the complete configuration
        # visible together, after every key, policy, writer anchor, and projection proof exists.
        "NOSTRA_MEMORY_MODE": "shadow",
    }


def _write_environment(repository_root: Path, environment_file: Path, updates: Mapping[str, str]) -> None:
    helper = _private_env_module(repository_root)
    helper.private_dir(environment_file.parent)
    text, _identity = helper.secure_read(environment_file)
    for key, expected in updates.items():
        actual = helper.current_value(text, key)
        if actual is not None and actual != expected:
            raise BootstrapError(f"existing {key} conflicts with the requested shadow boundary")
    helper.set_values(environment_file, dict(updates))


def _verify_environment(
    repository_root: Path, environment_file: Path, updates: Mapping[str, str],
) -> None:
    helper = _private_env_module(repository_root)
    helper.private_dir(environment_file.parent)
    text, _identity = helper.secure_read(environment_file)
    for key, expected in updates.items():
        if helper.current_value(text, key) != expected:
            raise BootstrapError(f"{key} does not match the verified shadow boundary")


def _require_unconfigured_environment(repository_root: Path, environment_file: Path) -> None:
    helper = _private_env_module(repository_root)
    helper.private_dir(environment_file.parent)
    text, _identity = helper.secure_read(environment_file)
    configured = {
        match.group(1)
        for line in text.splitlines()
        if (match := helper.LINE_RE.match(line.strip()))
        and match.group(1).startswith("NOSTRA_MEMORY_")
    }
    if configured:
        raise BootstrapError(
            "providers.env already contains memory configuration but no matching bootstrap manifest"
        )


@contextlib.contextmanager
def _bootstrap_lock(base_root: Path) -> Iterator[None]:
    parent = _safe_directory(base_root.parent, create=True)
    lock_path = parent / f".{base_root.name}.bootstrap.lock"
    descriptor = os.open(
        lock_path,
        os.O_RDWR | os.O_CREAT | getattr(os, "O_NOFOLLOW", 0),
        0o600,
    )
    try:
        info = os.fstat(descriptor)
        named = lock_path.lstat()
        if (
            not stat.S_ISREG(info.st_mode)
            or info.st_uid != os.getuid()
            or info.st_nlink != 1
            or lock_path.is_symlink()
            or (info.st_dev, info.st_ino) != (named.st_dev, named.st_ino)
        ):
            raise BootstrapError("shadow bootstrap lock is unsafe")
        os.fchmod(descriptor, 0o600)
        fcntl.flock(descriptor, fcntl.LOCK_EX)
        yield
    finally:
        os.close(descriptor)


def _paths(base_root: Path) -> dict[str, Path]:
    canonical_ledger = base_root / "canonical" / "canonical-ledger.ndjson"
    return {
        "base_root": base_root,
        "state_root": base_root / "runtime",
        "checkpoint": base_root / "external" / "projection-checkpoint.json",
        "canonical_ledger": canonical_ledger,
        "writer_owner": canonical_ledger.with_name(
            canonical_ledger.name + ".controlled-writer-owner.json"
        ),
        "writer_head": canonical_ledger.with_name(
            canonical_ledger.name + ".controlled-writer-head.json"
        ),
        "writer_state": base_root / "writer-state",
        "protected_store": base_root / "protected-store",
        "protected_master_key": base_root / "keys" / "protected-master.key",
        "checkpoint_private_key": base_root / "keys" / "checkpoint.seed",
        "checkpoint_public_key": base_root / "keys" / "checkpoint.pub",
        "contract_private_key": base_root / "keys" / "contract.seed",
        "contract_public_key": base_root / "keys" / "contract.pub",
        "policy_private_key": base_root / "keys" / "provider-policy.seed",
        "policy_public_key": base_root / "keys" / "provider-policy.pub",
        "provider_policy": base_root / "policy" / "provider-policy.json",
        "quarantine_token": base_root / "keys" / "quarantine.token",
        "manifest": base_root / "bootstrap-manifest.json",
    }


def _artifact_hashes(paths: Mapping[str, Path]) -> dict[str, str]:
    static = (
        "protected_master_key", "checkpoint_private_key", "checkpoint_public_key",
        "contract_private_key", "contract_public_key", "policy_private_key",
        "policy_public_key", "provider_policy", "quarantine_token", "writer_owner",
    )
    return {name: _sha_bytes(_safe_file(paths[name])) for name in static}


def _load_manifest(path: Path) -> dict[str, Any]:
    try:
        value = json.loads(_safe_file(path))
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise BootstrapError("shadow bootstrap manifest is invalid") from exc
    fields = {
        "schema", "created_at", "repository_root", "environment_file", "provider_models",
        "paths", "artifact_sha256", "manifest_sha256",
    }
    if not isinstance(value, dict) or set(value) != fields or value.get("schema") != SCHEMA:
        raise BootstrapError("shadow bootstrap manifest has an unsupported shape")
    unsigned = {key: item for key, item in value.items() if key != "manifest_sha256"}
    expected = "sha256:" + canonical_sha256(unsigned)
    if value.get("manifest_sha256") != expected:
        raise BootstrapError("shadow bootstrap manifest failed integrity verification")
    return value


def _verify_manifest(
    manifest: Mapping[str, Any], *, provider_models: Sequence[tuple[str, str]] | None = None,
) -> tuple[dict[str, Path], Path]:
    raw_paths = manifest.get("paths")
    hashes = manifest.get("artifact_sha256")
    if not isinstance(raw_paths, dict) or not isinstance(hashes, dict):
        raise BootstrapError("shadow bootstrap manifest paths are invalid")
    paths = {name: Path(str(value)) for name, value in raw_paths.items()}
    required = set(_paths(Path(str(manifest.get("paths", {}).get("base_root", "/invalid")))))
    if set(paths) != required or any(not path.is_absolute() for path in paths.values()):
        raise BootstrapError("shadow bootstrap manifest path set is invalid")
    if paths != _paths(paths["base_root"]):
        raise BootstrapError("shadow bootstrap manifest paths do not match the closed layout")
    actual_hashes = _artifact_hashes(paths)
    if hashes != actual_hashes:
        raise BootstrapError("shadow bootstrap static artifacts changed")
    raw_models = manifest.get("provider_models")
    if (
        not isinstance(raw_models, list)
        or not raw_models
        or any(not isinstance(row, dict) or set(row) != {"provider", "model"} for row in raw_models)
    ):
        raise BootstrapError("shadow bootstrap provider/model policy is invalid")
    stored_models = _parse_provider_models([
        f"{row['provider']}/{row['model']}" for row in raw_models
    ])
    if len(stored_models) != len(raw_models):
        raise BootstrapError("shadow bootstrap provider/model policy contains duplicates")
    if provider_models is not None and stored_models != tuple(provider_models):
        raise BootstrapError("existing shadow boundary has a different provider/model policy")
    environment_file = Path(str(manifest.get("environment_file")))
    if not environment_file.is_absolute():
        raise BootstrapError("shadow bootstrap environment path is invalid")
    repository_root = Path(str(manifest.get("repository_root")))
    if not repository_root.is_absolute():
        raise BootstrapError("shadow bootstrap repository path is invalid")
    policy = json.loads(_safe_file(paths["provider_policy"]))
    for provider, model in stored_models:
        authorize_provider(
            policy,
            provider=provider,
            model=model,
            service_identity=SERVICE_IDENTITY,
            requested_classifications=["public", "internal"],
            requested_source_tiers=[1, 2, 3, 4, 5],
            verifier=ed25519_policy_verifier(paths["policy_public_key"], key_id=POLICY_KEY_ID),
        )
    load_controlled_ledger_events(
        paths["canonical_ledger"], writer_head_path=paths["writer_head"],
    )
    load_protected_store_events(
        paths["protected_store"],
        master_key_path=paths["protected_master_key"],
        key_id=PROTECTED_KEY_ID,
        service_identity="memory-projection-reader",
    )
    checkpoint_message = b"memory-shadow-bootstrap-checkpoint-key-check/v1"
    checkpoint_signature = ed25519_checkpoint_signer(
        paths["checkpoint_private_key"], key_id=CHECKPOINT_KEY_ID,
    )(checkpoint_message)
    if not ed25519_checkpoint_verifier(
        paths["checkpoint_public_key"], key_id=CHECKPOINT_KEY_ID,
    )(checkpoint_message, checkpoint_signature):
        raise BootstrapError("checkpoint signing key pair did not verify")
    contract_message = b"memory-shadow-bootstrap-contract-key-check/v1"
    contract_signature = ed25519_contract_signer(
        paths["contract_private_key"], key_id=CONTRACT_KEY_ID,
    )(contract_message)
    if not ed25519_contract_verifier(
        paths["contract_public_key"], key_id=CONTRACT_KEY_ID,
    )(contract_message, contract_signature):
        raise BootstrapError("contract signing key pair did not verify")
    return paths, environment_file


def _deny(*_args: object, **_kwargs: object) -> bool:
    return False


def _provenance_denied(**_kwargs: object) -> Mapping[str, object]:
    raise BootstrapError("shadow bootstrap controlled writer denies canonical writes")


def _empty_authority(_event_id: str, _principal: object) -> None:
    return None


def _prepare_projection(repository_root: Path, paths: Mapping[str, Path]) -> Mapping[str, Any]:
    manager = ProjectionManager(
        repository_root,
        paths["state_root"],
        checkpoint_path=paths["checkpoint"],
        writer_owner_path=paths["writer_owner"],
        writer_head_path=paths["writer_head"],
        canonical_ledger_path=paths["canonical_ledger"],
        protected_store_root=paths["protected_store"],
        protected_master_key_path=paths["protected_master_key"],
        protected_key_id=PROTECTED_KEY_ID,
        projection_service_identity="memory-projection-reader",
        signer=ed25519_checkpoint_signer(
            paths["checkpoint_private_key"], key_id=CHECKPOINT_KEY_ID,
        ),
        verifier=ed25519_checkpoint_verifier(
            paths["checkpoint_public_key"], key_id=CHECKPOINT_KEY_ID,
        ),
    )
    snapshot = manager.prepare(force_rebuild=True)
    return {
        "source": snapshot.source,
        "repository_sha": snapshot.repository_sha,
        "projection_digest": snapshot.projection_digest,
        "event_count": snapshot.event_count,
        "checkpoint_sha256": snapshot.checkpoint_sha256,
    }


def _new_boundary(
    repository_root: Path,
    paths: Mapping[str, Path],
    provider_models: Sequence[tuple[str, str]],
    *,
    projection_preparer: Callable[[Path, Mapping[str, Path]], Mapping[str, Any]],
) -> Mapping[str, Any]:
    base_root = paths["base_root"]
    if base_root.exists() or base_root.is_symlink():
        raise BootstrapError("shadow state root exists without a verified bootstrap manifest")
    base_root.mkdir(mode=0o700)
    os.chmod(base_root, 0o700)
    created_identity = (base_root.stat().st_dev, base_root.stat().st_ino)
    try:
        for name in ("runtime", "external", "canonical", "keys", "policy"):
            _safe_directory(base_root / name, create=True)
        _create_private_file(paths["protected_master_key"], secrets.token_bytes(32))
        _create_private_file(paths["quarantine_token"], secrets.token_urlsafe(48).encode("ascii"))
        checkpoint_private, checkpoint_public = _key_pair(base_root / "keys", "checkpoint")
        contract_private, contract_public = _key_pair(base_root / "keys", "contract")
        policy_private, policy_public = _key_pair(base_root / "keys", "provider-policy")
        expected_pairs = (
            (checkpoint_private, paths["checkpoint_private_key"]),
            (checkpoint_public, paths["checkpoint_public_key"]),
            (contract_private, paths["contract_private_key"]),
            (contract_public, paths["contract_public_key"]),
            (policy_private, paths["policy_private_key"]),
            (policy_public, paths["policy_public_key"]),
        )
        if any(actual != expected for actual, expected in expected_pairs):
            raise BootstrapError("generated key paths do not match the closed layout")
        master = load_master_key_file(paths["protected_master_key"])
        store = MemoryStore(
            paths["protected_store"],
            authorize=lambda _request: True,
            source_policy=lambda _request: True,
            cipher=AESGCMSIVEnvelopeCipher(master, key_id=PROTECTED_KEY_ID),
        )
        sink = NdjsonCanonicalSink(paths["canonical_ledger"])
        writer = ControlledWriter(
            paths["writer_state"],
            sink,
            authorize_write=_deny,
            authorize_recovery=_deny,
            candidate_provenance_verifier=_provenance_denied,
            candidate_provenance_verifier_id="shadow-bootstrap-deny-provenance-v1",
            authoritative_event_resolver=_empty_authority,
            authoritative_event_resolver_id="shadow-bootstrap-empty-authority-v1",
            memory_store=store,
            journal_cipher=AESGCMSIVEnvelopeCipher(
                master, key_id="key:memory-shadow-journal-v1",
            ),
            repository_root=repository_root,
        )
        if not HASH_RE.fullmatch(writer.current_head()):
            raise BootstrapError("shadow controlled-writer genesis head is invalid")
        created_at = _utc_now()
        policy = _provider_policy(
            provider_models,
            private_key=paths["policy_private_key"],
            created_at=created_at,
        )
        from memory_runtime import _atomic_private_write
        _atomic_private_write(paths["provider_policy"], policy)
        sample = b"memory-shadow-bootstrap-contract-key-check/v1"
        signature = ed25519_contract_signer(
            paths["contract_private_key"], key_id=CONTRACT_KEY_ID,
        )(sample)
        if not ed25519_contract_verifier(
            paths["contract_public_key"], key_id=CONTRACT_KEY_ID,
        )(sample, signature):
            raise BootstrapError("contract signing key pair did not verify")
        snapshot = projection_preparer(repository_root, paths)
        manifest_unsigned = {
            "schema": SCHEMA,
            "created_at": created_at,
            "repository_root": str(repository_root),
            "environment_file": "",
            "provider_models": [
                {"provider": provider, "model": model}
                for provider, model in provider_models
            ],
            "paths": {name: str(path) for name, path in paths.items()},
            "artifact_sha256": _artifact_hashes(paths),
        }
        return {"manifest_unsigned": manifest_unsigned, "snapshot": dict(snapshot)}
    except BaseException:
        try:
            current = base_root.lstat()
            if (
                not base_root.is_symlink()
                and stat.S_ISDIR(current.st_mode)
                and (current.st_dev, current.st_ino) == created_identity
            ):
                shutil.rmtree(base_root)
        except OSError:
            pass
        raise


def provision(
    *,
    repository_root: Path,
    base_root: Path,
    environment_file: Path,
    provider_models: Sequence[tuple[str, str]],
    projection_preparer: Callable[[Path, Mapping[str, Path]], Mapping[str, Any]] = _prepare_projection,
) -> dict[str, Any]:
    require_crypto_backend()
    repository_root = Path(os.path.abspath(os.fspath(repository_root.expanduser())))
    if not (repository_root / ".git").exists() and not (
        repository_root / ".git"
    ).is_file():
        raise BootstrapError("repository root is not a Git checkout")
    base_root = Path(os.path.abspath(os.fspath(base_root.expanduser())))
    environment_file = Path(os.path.abspath(os.fspath(environment_file.expanduser())))
    paths = _paths(base_root)
    with _bootstrap_lock(base_root):
        if paths["manifest"].exists() or paths["manifest"].is_symlink():
            manifest = _load_manifest(paths["manifest"])
            verified_paths, stored_environment = _verify_manifest(
                manifest, provider_models=provider_models,
            )
            if Path(str(manifest["repository_root"])) != repository_root:
                raise BootstrapError("existing shadow boundary belongs to a different repository")
            if stored_environment != environment_file:
                raise BootstrapError("existing shadow boundary uses a different environment file")
            token = _safe_file(verified_paths["quarantine_token"]).decode("ascii")
            updates = _environment_updates(verified_paths, token)
            _write_environment(
                repository_root,
                environment_file,
                updates,
            )
            _verify_environment(repository_root, environment_file, updates)
            return {
                "schema": "memory-shadow-bootstrap-result/v1",
                "ok": True,
                "created": False,
                "mode": "shadow",
                "manifest_sha256": manifest["manifest_sha256"],
                "provider_models": manifest["provider_models"],
                "state_root": str(verified_paths["state_root"]),
                "environment_file": str(environment_file),
                "restart_required": True,
            }
        _require_unconfigured_environment(repository_root, environment_file)
        created = _new_boundary(
            repository_root,
            paths,
            provider_models,
            projection_preparer=projection_preparer,
        )
        manifest_unsigned = dict(created["manifest_unsigned"])
        manifest_unsigned["environment_file"] = str(environment_file)
        manifest = {
            **manifest_unsigned,
            "manifest_sha256": "sha256:" + canonical_sha256(manifest_unsigned),
        }
        from memory_runtime import _atomic_private_write
        _atomic_private_write(paths["manifest"], manifest)
        token = _safe_file(paths["quarantine_token"]).decode("ascii")
        updates = _environment_updates(paths, token)
        _write_environment(
            repository_root,
            environment_file,
            updates,
        )
        _verify_environment(repository_root, environment_file, updates)
        return {
            "schema": "memory-shadow-bootstrap-result/v1",
            "ok": True,
            "created": True,
            "mode": "shadow",
            "manifest_sha256": manifest["manifest_sha256"],
            "provider_models": manifest["provider_models"],
            "state_root": str(paths["state_root"]),
            "environment_file": str(environment_file),
            "snapshot": created["snapshot"],
            "restart_required": True,
        }


def status(*, base_root: Path) -> dict[str, Any]:
    paths = _paths(Path(os.path.abspath(os.fspath(base_root.expanduser()))))
    manifest = _load_manifest(paths["manifest"])
    verified_paths, environment_file = _verify_manifest(manifest)
    repository_root = Path(str(manifest["repository_root"]))
    token = _safe_file(verified_paths["quarantine_token"]).decode("ascii")
    _verify_environment(
        repository_root,
        environment_file,
        _environment_updates(verified_paths, token),
    )
    return {
        "schema": "memory-shadow-bootstrap-status/v1",
        "ok": True,
        "mode": "shadow",
        "manifest_sha256": manifest["manifest_sha256"],
        "provider_models": manifest["provider_models"],
        "state_root": str(verified_paths["state_root"]),
        "environment_file": str(environment_file),
    }


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(prog="memory-shadow-bootstrap")
    commands = root.add_subparsers(dest="command", required=True)
    default_base = Path.home() / ".local" / "share" / "nostra-memory"
    provision_command = commands.add_parser("provision")
    provision_command.add_argument("--root", default=".")
    provision_command.add_argument("--base-root", default=str(default_base))
    provision_command.add_argument(
        "--environment-file",
        default=str(Path.home() / ".config" / "nostra-engine" / "providers.env"),
    )
    provision_command.add_argument("--provider-model", action="append", required=True)
    status_command = commands.add_parser("status")
    status_command.add_argument("--base-root", default=str(default_base))
    return root


def main(argv: Sequence[str] | None = None) -> int:
    args = parser().parse_args(argv)
    try:
        if args.command == "provision":
            result = provision(
                repository_root=Path(args.root),
                base_root=Path(args.base_root),
                environment_file=Path(args.environment_file),
                provider_models=_parse_provider_models(args.provider_model),
            )
        else:
            result = status(base_root=Path(args.base_root))
    except (OSError, ValueError, RuntimeError) as exc:
        result = {
            "schema": "memory-shadow-bootstrap-error/v1",
            "ok": False,
            "code": str(exc),
        }
        sys.stdout.write(json.dumps(result, sort_keys=True, separators=(",", ":")) + "\n")
        return 1
    sys.stdout.write(json.dumps(result, sort_keys=True, separators=(",", ":")) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
