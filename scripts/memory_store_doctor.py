#!/usr/bin/env python3
"""Read-only, secret-free operational diagnostics for a local memory store."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path
from typing import Any, Mapping, Sequence

try:
    from canonical_json import canonical_json_bytes, canonical_sha256
    from memory_crypto import (
        AESGCMSIVEnvelopeCipher,
        CryptoUnavailableError,
        MemoryCryptoError,
        load_master_key_file,
    )
    from memory_store import (
        AccessDenied,
        AuthenticatedCipher,
        Authorizer,
        Clock,
        EncryptionRequired,
        ExpiredContent,
        InvalidStoreInput,
        MemoryStore,
        MemoryStoreError,
        EventRef,
        ObjectRef,
        StoreCorruption,
        StoreNotFound,
    )
except ImportError:  # pragma: no cover - package-style imports
    from scripts.canonical_json import canonical_json_bytes, canonical_sha256
    from scripts.memory_crypto import (
        AESGCMSIVEnvelopeCipher,
        CryptoUnavailableError,
        MemoryCryptoError,
        load_master_key_file,
    )
    from scripts.memory_store import (
        AccessDenied,
        AuthenticatedCipher,
        Authorizer,
        Clock,
        EncryptionRequired,
        ExpiredContent,
        InvalidStoreInput,
        MemoryStore,
        MemoryStoreError,
        EventRef,
        ObjectRef,
        StoreCorruption,
        StoreNotFound,
    )


DOCTOR_REPORT_SCHEMA = "memory-store-doctor-report/v1"
_SHA256_RE = re.compile(r"^(?:sha256:)?[0-9a-f]{64}$")


class UnanchoredConsistency(InvalidStoreInput):
    """Raised when a self-consistency check has no out-of-band state anchor."""


def _list(value: object, field: str) -> list[Any]:
    if not isinstance(value, list):
        raise StoreCorruption(f"deterministic manifest {field} must be a list")
    return value


def _validate_manifest_digest(manifest: Mapping[str, Any]) -> str:
    supplied = manifest.get("manifest_sha256")
    if not isinstance(supplied, str):
        raise StoreCorruption("deterministic manifest digest is missing")
    body = dict(manifest)
    body.pop("manifest_sha256", None)
    if canonical_sha256(body) != supplied:
        raise StoreCorruption("deterministic manifest digest does not match its body")
    return supplied


def doctor_store(
    store_root: str | os.PathLike[str],
    *,
    authorize: Authorizer,
    source_policy: Authorizer | None = None,
    cipher: AuthenticatedCipher | None = None,
    principal: object | None = None,
    clock: Clock | None = None,
    repository_root: str | os.PathLike[str] | None = None,
    expected_manifest_sha256: str | None = None,
) -> dict[str, Any]:
    """Verify one existing store without writing it or exposing retained content.

    Authorization is intentionally mandatory.  The public manifest export invokes
    authorization, expiry, and source-policy gates for every live and retired exact
    reference.  Protected stores additionally fail closed unless ``cipher`` can
    authenticate every ciphertext/key-envelope pair.  A caller-supplied out-of-band
    manifest digest is also mandatory so coherent deletion cannot self-anchor as a
    smaller healthy store.
    """

    if not callable(authorize):
        raise InvalidStoreInput("store doctor requires an explicit authorization hook")
    if (
        not isinstance(expected_manifest_sha256, str)
        or _SHA256_RE.fullmatch(expected_manifest_sha256) is None
    ):
        raise UnanchoredConsistency(
            "store doctor requires an out-of-band expected manifest SHA-256"
        )
    expected_digest = expected_manifest_sha256.removeprefix("sha256:")
    options: dict[str, Any] = {
        "authorize": authorize,
        "source_policy": source_policy,
        "cipher": cipher,
        "repository_root": repository_root,
    }
    if clock is not None:
        options["clock"] = clock
    store = MemoryStore.open_existing(store_root, **options)

    first = store.rebuild_manifest(principal=principal)
    second = store.rebuild_manifest(principal=principal)
    if first != second:
        raise StoreCorruption("two locked deterministic rebuilds produced different state")
    manifest_digest = _validate_manifest_digest(first)
    if manifest_digest != expected_digest:
        raise StoreCorruption("store manifest differs from its out-of-band expected digest")
    objects = _list(first.get("objects"), "objects")
    events = _list(first.get("events"), "events")

    # Exercise exact public resolution/read paths for every live entry.  The bytes
    # are verified in memory and are intentionally never returned or logged.
    exact_reads = 0
    for row in objects:
        if not isinstance(row, dict) or set(row) != {"ref", "object_manifest"}:
            raise StoreCorruption("deterministic manifest object row is malformed")
        ref = ObjectRef.from_dict(row["ref"])
        resolved = store.find_object(
            ref.acquisition_id,
            ref.source_version_id,
            ref.manifest_sha256,
            object_id=ref.object_id,
            principal=principal,
        )
        if resolved != ref:
            raise StoreCorruption("exact object resolution differs from manifest inventory")
        raw = store.read_object(ref, principal=principal)
        if len(raw) != ref.byte_length or hashlib.sha256(raw).hexdigest() != ref.sha256:
            raise StoreCorruption("exact object read differs from its committed reference")
        exact_reads += 1
    for row in events:
        ref = EventRef.from_dict(row)
        resolved = store.find_event(ref.event_id, principal=principal)
        if resolved != ref:
            raise StoreCorruption("exact event resolution differs from manifest inventory")
        raw = store.read_event_bytes(ref, principal=principal)
        try:
            parsed = json.loads(raw)
        except (UnicodeError, json.JSONDecodeError) as exc:
            raise StoreCorruption("exact event read is not valid JSON") from exc
        if not isinstance(parsed, dict) or canonical_json_bytes(parsed) != raw:
            raise StoreCorruption("exact event read is not canonical JSON")
        exact_reads += 1

    # This is deliberately not emitted.  It exercises public authorization,
    # entitlement, expiry, retired-target, purge, and control-lane validation.
    authorized_manifest_bytes = store.export_manifest(principal=principal)
    if authorized_manifest_bytes != canonical_json_bytes(first):
        raise StoreCorruption("authorized public export differs from deterministic rebuild")
    store.verify_manifest(authorized_manifest_bytes, principal=principal)

    backups = _list(first.get("managed_backups"), "managed_backups")
    retired = _list(first.get("retired_targets"), "retired_targets")
    purges = _list(first.get("purges"), "purges")
    controls = _list(first.get("control_records"), "control_records")
    completed = sum(
        1 for row in purges if isinstance(row, dict) and row.get("completion") is not None
    )
    if completed > len(purges):  # pragma: no cover - defensive arithmetic guard
        raise StoreCorruption("purge completion count is impossible")
    return {
        "schema": DOCTOR_REPORT_SCHEMA,
        "status": "healthy",
        "store_manifest_sha256": "sha256:" + manifest_digest,
        "deterministic_rebuilds": 2,
        "inventory": {
            "objects": len(objects),
            "events": len(events),
            "exact_entries_read": exact_reads,
            "managed_backups": len(backups),
            "retired_targets": len(retired),
            "purges": len(purges),
            "completed_purges": completed,
            "pending_purges": len(purges) - completed,
            "control_records": len(controls),
        },
        "checks": {
            "authorization": "verified",
            "authenticated_storage": "verified",
            "policy_gates": "verified",
            "exact_reads": "verified",
            "purge_state": "verified",
            "deterministic_rebuild": "verified",
            "external_anchor": "verified",
        },
    }


def doctor_report_bytes(report: Mapping[str, Any]) -> bytes:
    """Return canonical JSON for a healthy or refused secret-free report."""

    return canonical_json_bytes(dict(report))


def _refusal_code(exc: BaseException) -> str:
    if isinstance(exc, EncryptionRequired):
        return "missing-cipher"
    if isinstance(exc, UnanchoredConsistency):
        return "unanchored-consistency"
    if isinstance(exc, ExpiredContent):
        return "expired-content"
    if isinstance(exc, AccessDenied):
        return "access-denied"
    if isinstance(exc, StoreNotFound):
        return "store-not-found"
    if isinstance(exc, StoreCorruption):
        return "store-corruption"
    if isinstance(exc, (MemoryCryptoError, CryptoUnavailableError)):
        return "key-unavailable"
    if isinstance(exc, InvalidStoreInput):
        return "invalid-configuration"
    return "doctor-failed"


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Verify an existing permanent-memory local store without writing it."
    )
    parser.add_argument("--store", required=True, help="Existing local store root")
    parser.add_argument(
        "--authorize-local-owner",
        action="store_true",
        help="Explicitly authorize aggregate read-only diagnostics for the local owner",
    )
    parser.add_argument("--master-key-file", help="Private 32-byte KEK file for protected lanes")
    parser.add_argument("--key-id", help="Canonical key ID matching --master-key-file")
    parser.add_argument(
        "--source-policy-status",
        choices=("authorized", "denied"),
        help="Current source-policy entitlement; absence remains unknown and fails closed",
    )
    parser.add_argument("--repository-root", help="Optional Git repository boundary")
    parser.add_argument(
        "--expected-manifest-sha256",
        help="Out-of-band expected deterministic store manifest SHA-256",
    )
    return parser


def main(argv: Sequence[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    principal = "local-owner-store-doctor"

    def authorize(request: object) -> bool:
        return (
            getattr(request, "action", None)
            in {"audit", "export", "read", "resolve"}
            and getattr(request, "principal", None) == principal
        )

    source_policy: Authorizer | None = None
    if args.source_policy_status is not None:
        allowed = args.source_policy_status == "authorized"
        source_policy = lambda _request: allowed

    try:
        if not args.authorize_local_owner:
            raise InvalidStoreInput("--authorize-local-owner is explicitly required")
        if (args.master_key_file is None) != (args.key_id is None):
            raise InvalidStoreInput("--master-key-file and --key-id must be supplied together")
        cipher: AuthenticatedCipher | None = None
        if args.master_key_file is not None:
            cipher = AESGCMSIVEnvelopeCipher(
                load_master_key_file(Path(args.master_key_file)),
                key_id=args.key_id,
            )
        report = doctor_store(
            args.store,
            authorize=authorize,
            source_policy=source_policy,
            cipher=cipher,
            principal=principal,
            repository_root=args.repository_root,
            expected_manifest_sha256=args.expected_manifest_sha256,
        )
        exit_code = 0
    except (
        MemoryStoreError,
        MemoryCryptoError,
        CryptoUnavailableError,
        OSError,
        TypeError,
        ValueError,
    ) as exc:
        report = {
            "schema": DOCTOR_REPORT_SCHEMA,
            "status": "refused",
            "error_code": _refusal_code(exc),
        }
        exit_code = 2
    sys.stdout.buffer.write(doctor_report_bytes(report) + b"\n")
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())


__all__ = [
    "DOCTOR_REPORT_SCHEMA",
    "UnanchoredConsistency",
    "doctor_report_bytes",
    "doctor_store",
    "main",
]
