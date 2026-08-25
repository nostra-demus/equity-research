#!/usr/bin/env python3
"""Production projection, identity, authorization, and lifecycle boundary for memory.

This module deliberately composes the existing lossless adapters, deterministic SQLite
projection, policy-partitioned store, and controlled writer.  It does not create another
canonical database.  The only files it owns are disposable runtime projections, identity
indexes, lifecycle registries, and content-free signed checkpoints.
"""
from __future__ import annotations

import datetime as dt
import base64
import hashlib
import json
import os
import re
import sqlite3
import stat
import subprocess
import tempfile
import uuid
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping, Sequence

try:
    from canonical_json import canonical_json_bytes, canonical_sha256
    from memory_adapters import adapt_repository
    from memory_projection import ProjectionError, ProjectionResult, build_projection, verify_projection
    from memory_crypto import ed25519_sign, ed25519_verify, load_master_key_file
    from memory_three_layer_contract import validate_contract
except ImportError:  # pragma: no cover - package-style imports
    from scripts.canonical_json import canonical_json_bytes, canonical_sha256
    from scripts.memory_adapters import adapt_repository
    from scripts.memory_projection import ProjectionError, ProjectionResult, build_projection, verify_projection
    from scripts.memory_crypto import ed25519_sign, ed25519_verify, load_master_key_file
    from scripts.memory_three_layer_contract import validate_contract


RUNTIME_SCHEMA = "memory-runtime-state/v1"
IDENTITY_SCHEMA = "research-identity-registry/v1"
CHECKPOINT_SCHEMA = "memory-projection-checkpoint/v1"
LIFECYCLE_SCHEMA = "memory-runtime-lifecycle/v1"
CLASSIFICATIONS = ("public", "internal", "licensed", "confidential", "restricted")
_HASH_RE = re.compile(r"^sha256:[0-9a-f]{64}$")
_GIT_RE = re.compile(r"^[0-9a-f]{40}(?:[0-9a-f]{24})?$")
_SAFE_EVENT_RE = re.compile(r"^evt_[0-9a-f-]{36}$")
_IDENTIFIER_RE = re.compile(
    r"^(?:issuer:lei:[A-Z0-9]{20}|security:figi:[A-Z0-9]{12}|"
    r"security:isin:[A-Z]{2}[A-Z0-9]{9}[0-9])$"
)
_SAFE_LANES = frozenset(
    {"projection", "packet-cache", "candidates", "resumes", "execution-receipts", "backups"}
)

# Only exact venue labels already emitted by structured decision records are accepted.  A
# parenthetical secondary venue is intentionally absent: it must be resolved by authoritative
# identifiers rather than guessed from prose.
EXCHANGE_MICS = {
    "NYSE": "XNYS",
    "NasdaqGS": "XNAS",
    "NasdaqCM": "XNAS",
    "NasdaqGM": "XNAS",
    "NSE": "XNSE",
    "DFM": "XDFM",
    "XTRA": "XETR",
    "Oslo Børs": "XOSL",
    "SHSE": "XSHG",
    "HKEX": "XHKG",
    "LSE": "XLON",
}


class MemoryRuntimeError(RuntimeError):
    """The runtime cannot prove a safe memory snapshot or lifecycle transition."""


class IdentityResolutionError(MemoryRuntimeError):
    """Issuer/listing identity is absent or ambiguous."""


class ProviderAuthorizationError(MemoryRuntimeError, PermissionError):
    """The requested provider scope is not authorized."""


@dataclass(frozen=True)
class ProjectionSnapshot:
    source: str
    repository_sha: str
    projection_digest: str
    event_count: int
    identity_registry_sha256: str
    checkpoint_sha256: str
    diagnostics: tuple[dict[str, Any], ...]


def _utc(value: dt.datetime | None = None) -> str:
    current = value or dt.datetime.now(dt.timezone.utc)
    if current.tzinfo is None:
        raise MemoryRuntimeError("runtime clock must be timezone-aware")
    return current.astimezone(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def _parse_aware(value: str, *, field: str) -> dt.datetime:
    try:
        parsed = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (AttributeError, ValueError) as exc:
        raise MemoryRuntimeError(f"{field}-invalid") from exc
    if parsed.tzinfo is None:
        raise MemoryRuntimeError(f"{field}-invalid")
    return parsed


def _normal_name(value: str) -> str:
    return " ".join(value.casefold().split())


def _hash_id(prefix: str, value: str) -> str:
    return f"{prefix}-{hashlib.sha256(value.encode('utf-8')).hexdigest()[:24]}"


def _safe_directory(path: Path, *, create: bool) -> Path:
    raw = Path(os.path.abspath(os.fspath(path)))
    if raw.exists() or raw.is_symlink():
        info = raw.lstat()
        if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
            raise MemoryRuntimeError("runtime state root must be a real directory")
    elif create:
        raw.mkdir(parents=True, mode=0o700)
        if os.name == "posix":
            os.chmod(raw, 0o700)
    else:
        raise MemoryRuntimeError("runtime state root is absent")
    info = raw.stat()
    if hasattr(os, "geteuid") and info.st_uid != os.geteuid():
        raise MemoryRuntimeError("runtime state root has the wrong owner")
    if os.name == "posix" and stat.S_IMODE(info.st_mode) & 0o077:
        raise MemoryRuntimeError("runtime state root must be owner-only (0700)")
    return raw.resolve(strict=True)


def _safe_regular(path: Path, *, owner_only: bool = True) -> bytes:
    before = path.lstat()
    if stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode) or before.st_nlink != 1:
        raise MemoryRuntimeError("runtime control file must be a single-link regular file")
    if hasattr(os, "geteuid") and before.st_uid != os.geteuid():
        raise MemoryRuntimeError("runtime control file has the wrong owner")
    if owner_only and os.name == "posix" and stat.S_IMODE(before.st_mode) & 0o077:
        raise MemoryRuntimeError("runtime control file must be owner-only (0600)")
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(descriptor)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            raise MemoryRuntimeError("runtime control file changed during open")
        chunks: list[bytes] = []
        while True:
            chunk = os.read(descriptor, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
        after = os.fstat(descriptor)
    finally:
        os.close(descriptor)
    try:
        named_after = path.lstat()
    except OSError as exc:
        raise MemoryRuntimeError("runtime control file changed during read") from exc
    stable = (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns, before.st_ctime_ns)
    if any(
        (item.st_dev, item.st_ino, item.st_size, item.st_mtime_ns, item.st_ctime_ns) != stable
        for item in (opened, after, named_after)
    ):
        raise MemoryRuntimeError("runtime control file changed during read")
    return b"".join(chunks)


def _atomic_private_write(path: Path, value: Mapping[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    if os.name == "posix":
        os.chmod(path.parent, 0o700)
    descriptor, temporary_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    temporary = Path(temporary_name)
    try:
        if hasattr(os, "fchmod"):
            os.fchmod(descriptor, 0o600)
        payload = canonical_json_bytes(dict(value))
        view = memoryview(payload)
        while view:
            written = os.write(descriptor, view)
            if written <= 0:
                raise MemoryRuntimeError("runtime control file write made no progress")
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


def _git_sha(repo_root: Path) -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"], cwd=repo_root, check=False, capture_output=True, text=True
        )
    except OSError as exc:
        raise MemoryRuntimeError("repository HEAD cannot be resolved to an immutable commit") from exc
    value = result.stdout.strip()
    if result.returncode or _GIT_RE.fullmatch(value) is None:
        raise MemoryRuntimeError("repository HEAD cannot be resolved to an immutable commit")
    return value


def _decision_sources(repo_root: Path) -> list[Path]:
    return sorted(repo_root.glob("analyses/*/decision_record.json"), key=lambda path: path.as_posix())


def build_identity_registry(repo_root: str | Path, *, as_of_system_time: str) -> dict[str, Any]:
    """Conservatively index only exact, internally consistent structured listings."""
    _parse_aware(as_of_system_time, field="identity-as-of")
    root = Path(repo_root).resolve()
    candidates: list[dict[str, Any]] = []
    diagnostics: list[dict[str, str]] = []
    for path in _decision_sources(root):
        relative = path.relative_to(root).as_posix()
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeError, json.JSONDecodeError):
            diagnostics.append({"source_path": relative, "code": "invalid-json", "status": "excluded"})
            continue
        if not isinstance(record, dict):
            diagnostics.append({"source_path": relative, "code": "invalid-record", "status": "excluded"})
            continue
        required = {key: record.get(key) for key in ("company_name", "exchange", "ticker", "currency")}
        if not all(isinstance(item, str) and item.strip() for item in required.values()):
            diagnostics.append({"source_path": relative, "code": "missing-identity-field", "status": "excluded"})
            continue
        exchange = required["exchange"].strip()
        mic = EXCHANGE_MICS.get(exchange)
        if mic is None:
            diagnostics.append({"source_path": relative, "code": "unresolved-venue", "status": "excluded"})
            continue
        legal_name = " ".join(required["company_name"].split())
        ticker = required["ticker"].strip().upper()
        currency = required["currency"].strip().upper()
        identifiers: list[str] = []
        for field, prefix in (("lei", "issuer:lei:"), ("figi", "security:figi:"), ("isin", "security:isin:")):
            raw = record.get(field)
            if isinstance(raw, str) and raw.strip():
                identifiers.append(prefix + raw.strip().upper())
        issuer_id = "entity:internal:" + _hash_id("issuer", _normal_name(legal_name))
        listing_id = f"security:mic-ticker:{mic}:{ticker}"
        candidates.append(
            {
                "legal_name": legal_name,
                "legal_name_key": _normal_name(legal_name),
                "issuer_id": issuer_id,
                "listing_id": listing_id,
                "mic": mic,
                "venue": exchange,
                "ticker": ticker,
                "currency": currency,
                "identifiers": sorted(set(identifiers)),
                "source_paths": [relative],
            }
        )

    grouped: dict[tuple[str, str, str], list[dict[str, Any]]] = {}
    for item in candidates:
        grouped.setdefault((item["listing_id"], item["legal_name_key"], item["currency"]), []).append(item)
    conflicts: set[str] = set()
    listing_claims: dict[str, set[tuple[str, str]]] = {}
    for listing_id, legal_key, currency in grouped:
        listing_claims.setdefault(listing_id, set()).add((legal_key, currency))
    for listing_id, claims in listing_claims.items():
        if len(claims) > 1:
            conflicts.add(listing_id)

    listings: list[dict[str, Any]] = []
    for key, rows in sorted(grouped.items()):
        if key[0] in conflicts:
            diagnostics.extend(
                {"source_path": source, "code": "listing-collision", "status": "ambiguous"}
                for row in rows for source in row["source_paths"]
            )
            continue
        first = rows[0]
        merged = {
            field: first[field]
            for field in ("legal_name", "legal_name_key", "issuer_id", "listing_id", "mic", "venue", "ticker", "currency")
        }
        merged["identifiers"] = sorted({value for row in rows for value in row["identifiers"]})
        merged["source_paths"] = sorted({value for row in rows for value in row["source_paths"]})
        listings.append(merged)
    body: dict[str, Any] = {
        "schema": IDENTITY_SCHEMA,
        "as_of_system_time": as_of_system_time,
        "listings": listings,
        "diagnostics": sorted(diagnostics, key=lambda row: (row["source_path"], row["code"])),
    }
    body["registry_sha256"] = "sha256:" + canonical_sha256(body)
    return body


def resolve_identity(
    registry: Mapping[str, Any], *, legal_name: str, venue: str, currency: str,
    ticker: str, identifiers: Sequence[str] = (),
) -> dict[str, Any]:
    """Resolve an existing listing or bind an unambiguous explicit first-run legal tuple."""
    normalized_name = " ".join(legal_name.split()) if isinstance(legal_name, str) else ""
    normalized_ticker = ticker.upper() if isinstance(ticker, str) else ""
    normalized_currency = currency.upper() if isinstance(currency, str) else ""
    if (
        not normalized_name or len(normalized_name) > 256
        or re.fullmatch(r"[A-Z0-9][A-Z0-9.-]{0,31}", normalized_ticker) is None
        or re.fullmatch(r"[A-Z]{3}", normalized_currency) is None
    ):
        raise IdentityResolutionError("identity-unresolved")
    required_ids = {
        ":".join(
            [part.lower() for part in item.strip().split(":")[:-1]]
            + [item.strip().split(":")[-1].upper()]
        )
        for item in identifiers if isinstance(item, str) and item.strip()
    }
    if any(_IDENTIFIER_RE.fullmatch(item) is None for item in required_ids):
        raise IdentityResolutionError("identity-unresolved")
    mic = EXCHANGE_MICS.get(venue)
    if mic is None:
        raise IdentityResolutionError("identity-unresolved")
    listings = registry.get("listings", [])
    if not isinstance(listings, list):
        raise IdentityResolutionError("identity-unresolved")
    matches = [
        item for item in listings
        if isinstance(item, Mapping)
        and item.get("legal_name_key") == _normal_name(normalized_name)
        and item.get("mic") == mic
        and item.get("currency") == normalized_currency
        and item.get("ticker") == normalized_ticker
        and required_ids.issubset(set(item.get("identifiers", [])))
    ]
    if len(matches) > 1:
        raise IdentityResolutionError("identity-ambiguous")
    if len(matches) == 1:
        item = matches[0]
    else:
        same_listing = [
            item for item in listings
            if isinstance(item, Mapping)
            and item.get("mic") == mic and item.get("ticker") == normalized_ticker
        ]
        security_ids = {item for item in required_ids if item.startswith("security:")}
        reused_security = [
            item for item in listings
            if isinstance(item, Mapping)
            and security_ids.intersection(set(item.get("identifiers", [])))
        ]
        lei_ids = {item for item in required_ids if item.startswith("issuer:lei:")}
        lei_listings = [
            item for item in listings
            if isinstance(item, Mapping)
            and lei_ids.intersection(set(item.get("identifiers", [])))
        ]
        if (
            same_listing or reused_security
            or any(item.get("legal_name_key") != _normal_name(normalized_name) for item in lei_listings)
        ):
            raise IdentityResolutionError("identity-ambiguous")
        lei = next((item.removeprefix("issuer:lei:") for item in required_ids if item.startswith("issuer:lei:")), None)
        item = {
            "legal_name": normalized_name,
            "issuer_id": (
                str(lei_listings[0]["issuer_id"]) if lei_listings
                else f"issuer:lei:{lei}" if lei
                else "entity:internal:" + _hash_id("issuer", _normal_name(normalized_name))
            ),
            "listing_id": f"security:mic-ticker:{mic}:{normalized_ticker}",
            "mic": mic,
            "ticker": normalized_ticker,
            "currency": normalized_currency,
        }
    return {
        "legal_name": item["legal_name"],
        "issuer_id": item["issuer_id"],
        "listing_id": item["listing_id"],
        "mic": item["mic"],
        "ticker": item["ticker"],
        "currency": item["currency"],
        "resolution_status": "exact",
    }


def authorize_provider(
    policy: Mapping[str, Any], *, provider: str, model: str, service_identity: str,
    requested_classifications: Sequence[str], requested_source_tiers: Sequence[int],
    verifier: "CheckpointVerifier",
) -> dict[str, Any]:
    errors = validate_contract(policy)
    if errors:
        raise ProviderAuthorizationError("provider-policy-invalid")
    unsigned = {key: item for key, item in policy.items() if key not in {"policy_sha256", "signature"}}
    expected = "sha256:" + canonical_sha256(unsigned)
    signature = policy.get("signature")
    if (
        policy.get("policy_sha256") != expected
        or not isinstance(signature, Mapping)
        or signature.get("signed_sha256") != expected
        or verifier(canonical_json_bytes(unsigned), signature) is not True
    ):
        raise ProviderAuthorizationError("provider-policy-signature-invalid")
    providers = policy.get("providers")
    if not isinstance(providers, list):
        raise ProviderAuthorizationError("provider-policy-invalid")
    matches = [
        item for item in providers
        if isinstance(item, dict)
        and item.get("provider") == provider
        and item.get("model") == model
        and item.get("service_identity") == service_identity
    ]
    if len(matches) != 1:
        raise ProviderAuthorizationError("provider-scope-denied")
    trusted = matches[0]
    classes = set(requested_classifications)
    tiers = set(requested_source_tiers)
    classifications = trusted.get("classifications")
    source_tiers = trusted.get("source_tiers")
    embedding_classifications = trusted.get("embedding_classifications")
    if (
        not isinstance(classifications, list)
        or not isinstance(source_tiers, list)
        or not isinstance(embedding_classifications, list)
        or not classes.issubset(set(classifications))
        or not tiers.issubset(set(source_tiers))
    ):
        raise ProviderAuthorizationError("provider-scope-denied")
    return {
        **trusted,
        "classifications": sorted(classes, key=CLASSIFICATIONS.index),
        "source_tiers": sorted(tiers),
        "embedding_classifications": [
            item for item in embedding_classifications if item in classes
        ],
    }


def controlled_writer_owner_sha256(owner_path: str | Path) -> str:
    raw = _safe_regular(Path(owner_path))
    try:
        value = json.loads(raw)
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise MemoryRuntimeError("controlled-writer owner is invalid") from exc
    allowed = {
        "memory-canonical-sink-owner/v1": {"schema", "coordinator_id", "configuration_sha256", "sink_identity_sha256"},
        "memory-local-controlled-writer-owner/v1": {"schema", "coordinator_id", "configuration_sha256", "store_identity_sha256"},
    }
    if not isinstance(value, dict) or value.get("schema") not in allowed or set(value) != allowed[value["schema"]]:
        raise MemoryRuntimeError("controlled-writer owner has an unsupported shape")
    if any(not isinstance(value[key], str) or _HASH_RE.fullmatch(value[key]) is None for key in set(value) - {"schema"}):
        raise MemoryRuntimeError("controlled-writer owner contains an invalid commitment")
    return "sha256:" + canonical_sha256(value)


def controlled_writer_head_sha256(head_path: str | Path) -> str:
    raw = _safe_regular(Path(head_path))
    try:
        value = json.loads(raw)
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise MemoryRuntimeError("controlled-writer head is invalid") from exc
    fields = {
        "schema", "coordinator_id", "configuration_sha256", "sequence", "head",
        "canonical_ledger_sha256", "transition",
    }
    if (
        not isinstance(value, dict)
        or set(value) != fields
        or value.get("schema") != "memory-controlled-sink-head/v1"
        or type(value.get("sequence")) is not int
        or value["sequence"] < 0
        or any(
            not isinstance(value.get(key), str) or _HASH_RE.fullmatch(value[key]) is None
            for key in ("coordinator_id", "configuration_sha256", "head", "canonical_ledger_sha256")
        )
    ):
        raise MemoryRuntimeError("controlled-writer head has an unsupported shape")
    if value["sequence"] == 0 and (value["head"] != "sha256:" + "0" * 64 or value["transition"] is not None):
        raise MemoryRuntimeError("controlled-writer genesis head is invalid")
    if value["sequence"] > 0 and not isinstance(value["transition"], dict):
        raise MemoryRuntimeError("controlled-writer advanced head lacks its transition")
    return "sha256:" + canonical_sha256(value)


CheckpointSigner = Callable[[bytes], Mapping[str, str]]
CheckpointVerifier = Callable[[bytes, Mapping[str, str]], bool]
RepositoryEventLoader = Callable[[Path], tuple[list[dict[str, Any]], list[dict[str, Any]]]]


def load_production_events(repo_root: Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Use the CLI's reviewed repository loader, canonical lane, and shrink sentinels."""
    try:
        from memory import (
            _adapt,
            _legacy_event_count,
            _repository_preflight_errors,
            _source_integrity_errors,
            _validate_events,
        )
    except ImportError:  # pragma: no cover - package-style imports
        from scripts.memory import (
            _adapt,
            _legacy_event_count,
            _repository_preflight_errors,
            _source_integrity_errors,
            _validate_events,
        )
    errors = _repository_preflight_errors(repo_root)
    events, diagnostics = _adapt(repo_root)
    errors.extend(_repository_preflight_errors(repo_root, legacy_event_count=_legacy_event_count(events)))
    errors.extend(_validate_events(events))
    errors.extend(_source_integrity_errors(repo_root, events))
    errors.extend(
        item.get("message", "adapter error")
        for item in diagnostics
        if item.get("severity") == "error"
    )
    if errors:
        raise MemoryRuntimeError("production-event-load-failed")
    return events, diagnostics


def ed25519_checkpoint_signer(key_path: str | Path, *, key_id: str) -> CheckpointSigner:
    """Load a private 0600 raw seed for each signature; never retain it in runtime state."""
    if not isinstance(key_id, str) or re.fullmatch(r"[a-z0-9][a-z0-9._-]{0,127}", key_id) is None:
        raise MemoryRuntimeError("checkpoint key ID is invalid")

    def sign(message: bytes) -> Mapping[str, str]:
        signature = ed25519_sign(load_master_key_file(key_path), b"memory-projection-checkpoint/v1\0" + message)
        return {
            "key_id": key_id,
            "algorithm": "ed25519",
            "value": base64.urlsafe_b64encode(signature).decode("ascii").rstrip("="),
        }

    return sign


def ed25519_checkpoint_verifier(public_key_path: str | Path, *, key_id: str) -> CheckpointVerifier:
    if not isinstance(key_id, str) or re.fullmatch(r"[a-z0-9][a-z0-9._-]{0,127}", key_id) is None:
        raise MemoryRuntimeError("checkpoint key ID is invalid")

    def verify(message: bytes, signature: Mapping[str, str]) -> bool:
        if signature.get("key_id") != key_id or signature.get("algorithm") != "ed25519":
            return False
        try:
            public_key = _safe_regular(Path(public_key_path))
            encoded = signature.get("value")
            if not isinstance(encoded, str):
                return False
            raw = base64.b64decode(encoded + "=" * (-len(encoded) % 4), altchars=b"-_", validate=True)
        except (OSError, ValueError, MemoryRuntimeError):
            return False
        return ed25519_verify(public_key, b"memory-projection-checkpoint/v1\0" + message, raw)

    return verify


def ed25519_policy_verifier(public_key_path: str | Path, *, key_id: str) -> CheckpointVerifier:
    if not isinstance(key_id, str) or re.fullmatch(r"[a-z0-9][a-z0-9._-]{0,127}", key_id) is None:
        raise MemoryRuntimeError("provider-policy key ID is invalid")

    def verify(message: bytes, signature: Mapping[str, str]) -> bool:
        if signature.get("key_id") != key_id or signature.get("algorithm") != "ed25519":
            return False
        try:
            public_key = _safe_regular(Path(public_key_path))
            encoded = signature.get("value")
            if not isinstance(encoded, str):
                return False
            raw = base64.b64decode(encoded + "=" * (-len(encoded) % 4), altchars=b"-_", validate=True)
        except (OSError, ValueError, MemoryRuntimeError):
            return False
        return ed25519_verify(public_key, b"memory-provider-policy/v1\0" + message, raw)

    return verify


def _checkpoint_unsigned(value: Mapping[str, Any]) -> dict[str, Any]:
    return {key: item for key, item in value.items() if key not in {"signature", "checkpoint_sha256"}}


def verify_external_checkpoint(
    path: str | Path, *, verifier: CheckpointVerifier, repository_sha: str,
    writer_owner_sha256: str, writer_head_sha256: str,
) -> dict[str, Any]:
    try:
        value = json.loads(_safe_regular(Path(path)))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise MemoryRuntimeError("external-checkpoint-unavailable") from exc
    required = {
        "schema", "repository_sha", "projection_digest", "identity_registry_sha256",
        "writer_owner_sha256", "writer_head_sha256", "event_count", "created_at", "signature", "checkpoint_sha256",
    }
    if not isinstance(value, dict) or set(value) != required or value.get("schema") != CHECKPOINT_SCHEMA:
        raise MemoryRuntimeError("external-checkpoint-invalid")
    unsigned = _checkpoint_unsigned(value)
    if value.get("checkpoint_sha256") != "sha256:" + canonical_sha256(unsigned):
        raise MemoryRuntimeError("external-checkpoint-invalid")
    if (
        value.get("repository_sha") != repository_sha
        or value.get("writer_owner_sha256") != writer_owner_sha256
        or value.get("writer_head_sha256") != writer_head_sha256
    ):
        raise MemoryRuntimeError("external-checkpoint-stale")
    signature = value.get("signature")
    if not isinstance(signature, Mapping) or verifier(canonical_json_bytes(unsigned), signature) is not True:
        raise MemoryRuntimeError("external-checkpoint-signature-invalid")
    return value


def publish_external_checkpoint(
    path: str | Path, *, signer: CheckpointSigner, repository_sha: str,
    projection: ProjectionResult, identity_registry_sha256: str, writer_owner_sha256: str,
    writer_head_sha256: str, created_at: str,
) -> dict[str, Any]:
    unsigned: dict[str, Any] = {
        "schema": CHECKPOINT_SCHEMA,
        "repository_sha": repository_sha,
        "projection_digest": "sha256:" + projection.digest,
        "identity_registry_sha256": identity_registry_sha256,
        "writer_owner_sha256": writer_owner_sha256,
        "writer_head_sha256": writer_head_sha256,
        "event_count": projection.event_count,
        "created_at": created_at,
    }
    signature = dict(signer(canonical_json_bytes(unsigned)))
    if set(signature) != {"key_id", "algorithm", "value"}:
        raise MemoryRuntimeError("checkpoint signer returned an open signature shape")
    value = {**unsigned, "signature": signature, "checkpoint_sha256": "sha256:" + canonical_sha256(unsigned)}
    _atomic_private_write(Path(path), value)
    return value


class ProjectionManager:
    """Verify the shared production projection or perform exactly one clean rebuild."""

    def __init__(
        self, repo_root: str | Path, state_root: str | Path, *, checkpoint_path: str | Path,
        writer_owner_path: str | Path, writer_head_path: str | Path,
        signer: CheckpointSigner, verifier: CheckpointVerifier,
        event_loader: RepositoryEventLoader = load_production_events,
    ) -> None:
        self.repo_root = Path(repo_root).resolve()
        self.state_root = _safe_directory(Path(state_root), create=True)
        self.database = self.state_root / "projection.sqlite"
        self.identity_path = self.state_root / "identity-registry.json"
        self.checkpoint_path = Path(checkpoint_path).resolve()
        if self.checkpoint_path == self.state_root or self.state_root in self.checkpoint_path.parents:
            raise MemoryRuntimeError("external checkpoint must live outside writer-mutable runtime state")
        self.writer_owner_path = Path(writer_owner_path)
        self.writer_head_path = Path(writer_head_path)
        self.signer = signer
        self.verifier = verifier
        if not callable(event_loader):
            raise MemoryRuntimeError("repository event loader must be callable")
        self.event_loader = event_loader

    def _identity(self, as_of: str) -> dict[str, Any]:
        registry = build_identity_registry(self.repo_root, as_of_system_time=as_of)
        _atomic_private_write(self.identity_path, registry)
        return registry

    def prepare(self, *, now: dt.datetime | None = None) -> ProjectionSnapshot:
        repository_sha = _git_sha(self.repo_root)
        writer_owner = controlled_writer_owner_sha256(self.writer_owner_path)
        writer_head = controlled_writer_head_sha256(self.writer_head_path)
        as_of = _utc(now)
        registry = self._identity(as_of)
        diagnostics: tuple[dict[str, Any], ...] = ()
        try:
            checkpoint = verify_external_checkpoint(
                self.checkpoint_path, verifier=self.verifier, repository_sha=repository_sha,
                writer_owner_sha256=writer_owner, writer_head_sha256=writer_head,
            )
            projection = verify_projection(
                self.database, expected_digest=checkpoint["projection_digest"].removeprefix("sha256:")
            )
            if checkpoint["identity_registry_sha256"] != registry["registry_sha256"]:
                raise MemoryRuntimeError("external-checkpoint-identity-stale")
            if checkpoint["event_count"] != projection.event_count:
                raise MemoryRuntimeError("external-checkpoint-count-stale")
            source = "production-projection"
        except (OSError, sqlite3.Error, ProjectionError, MemoryRuntimeError):
            events, adapter_diagnostics = self.event_loader(self.repo_root)
            hard_errors = [item for item in adapter_diagnostics if item.get("severity") == "error"]
            if hard_errors:
                raise MemoryRuntimeError("deterministic-rebuild-adapter-failed")
            try:
                projection = build_projection(events, self.database)
                projection = verify_projection(self.database, expected_digest=projection.digest)
            except (OSError, sqlite3.Error, ProjectionError) as exc:
                raise MemoryRuntimeError("deterministic-rebuild-failed") from exc
            checkpoint = publish_external_checkpoint(
                self.checkpoint_path, signer=self.signer, repository_sha=repository_sha,
                projection=projection, identity_registry_sha256=registry["registry_sha256"],
                writer_owner_sha256=writer_owner, writer_head_sha256=writer_head, created_at=as_of,
            )
            # Verify the bytes written outside mutable state before returning them to dispatch.
            verify_external_checkpoint(
                self.checkpoint_path, verifier=self.verifier, repository_sha=repository_sha,
                writer_owner_sha256=writer_owner, writer_head_sha256=writer_head,
            )
            source = "deterministic-local-rebuild"
            diagnostics = tuple(adapter_diagnostics)
        if controlled_writer_owner_sha256(self.writer_owner_path) != writer_owner:
            raise MemoryRuntimeError("controlled-writer-owner-changed-during-snapshot")
        if controlled_writer_head_sha256(self.writer_head_path) != writer_head:
            raise MemoryRuntimeError("controlled-writer-head-changed-during-snapshot")
        return ProjectionSnapshot(
            source=source,
            repository_sha=repository_sha,
            projection_digest="sha256:" + projection.digest,
            event_count=projection.event_count,
            identity_registry_sha256=registry["registry_sha256"],
            checkpoint_sha256=checkpoint["checkpoint_sha256"],
            diagnostics=diagnostics,
        )


class RuntimeLifecycle:
    """Registry-backed transitive purge for every disposable runtime derivative lane."""

    def __init__(self, state_root: str | Path) -> None:
        self.root = _safe_directory(Path(state_root), create=True)
        self.path = self.root / "lifecycle.json"
        if self.path.exists():
            self._load()
        else:
            _atomic_private_write(self.path, {"schema": LIFECYCLE_SCHEMA, "entries": {}, "tombstones": {}})

    def _load(self) -> dict[str, Any]:
        try:
            value = json.loads(_safe_regular(self.path))
        except (OSError, UnicodeError, json.JSONDecodeError) as exc:
            raise MemoryRuntimeError("runtime lifecycle registry is corrupt") from exc
        if not isinstance(value, dict) or set(value) != {"schema", "entries", "tombstones"} or value.get("schema") != LIFECYCLE_SCHEMA:
            raise MemoryRuntimeError("runtime lifecycle registry has an open shape")
        if not isinstance(value["entries"], dict) or not isinstance(value["tombstones"], dict):
            raise MemoryRuntimeError("runtime lifecycle registry is corrupt")
        return value

    def _relative(self, lane: str, path: str | Path) -> str:
        if lane not in _SAFE_LANES:
            raise MemoryRuntimeError("unsupported runtime derivative lane")
        absolute = Path(path).resolve(strict=False)
        try:
            relative = absolute.relative_to(self.root)
        except ValueError as exc:
            raise MemoryRuntimeError("runtime derivative is outside the managed root") from exc
        if not relative.parts or relative.parts[0] != lane or any(part in {"", ".", ".."} for part in relative.parts):
            raise MemoryRuntimeError("runtime derivative path does not match its lane")
        return relative.as_posix()

    def register(self, event_id: str, lane: str, path: str | Path) -> None:
        if _SAFE_EVENT_RE.fullmatch(event_id) is None:
            raise MemoryRuntimeError("runtime lifecycle event ID is invalid")
        value = self._load()
        if event_id in value["tombstones"]:
            raise MemoryRuntimeError("retired content cannot be registered or restored")
        relative = self._relative(lane, path)
        _safe_regular(self.root / relative)
        item = {"lane": lane, "path": relative}
        entries = value["entries"].setdefault(event_id, [])
        if item not in entries:
            entries.append(item)
            entries.sort(key=lambda row: (row["lane"], row["path"]))
        _atomic_private_write(self.path, value)

    def purge_event(self, ref: Any) -> tuple[str, ...]:
        event_id = ref.event_id if hasattr(ref, "event_id") else ref
        if not isinstance(event_id, str) or _SAFE_EVENT_RE.fullmatch(event_id) is None:
            raise MemoryRuntimeError("runtime lifecycle event ID is invalid")
        value = self._load()
        rows = value["entries"].pop(event_id, [])
        shared_items = {
            (row.get("lane"), row.get("path"))
            for row in rows
            if isinstance(row, dict)
        }
        # A compiled packet can depend on several canonical events. Removing one
        # invalidates the shared derivative for all of them; no registry entry may
        # continue to point at the now-absent file.
        for other_event_id, other_rows in list(value["entries"].items()):
            if not isinstance(other_rows, list):
                raise MemoryRuntimeError("runtime lifecycle registry is corrupt")
            retained = [
                row for row in other_rows
                if not isinstance(row, dict) or (row.get("lane"), row.get("path")) not in shared_items
            ]
            if retained:
                value["entries"][other_event_id] = retained
            else:
                value["entries"].pop(other_event_id)
        removed: list[str] = []
        for row in rows:
            relative = self._relative(row.get("lane"), self.root / str(row.get("path")))
            target = self.root / relative
            if target.exists() or target.is_symlink():
                before = target.lstat()
                if stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode) or before.st_nlink != 1:
                    raise MemoryRuntimeError("runtime derivative changed type before purge")
                if hasattr(os, "geteuid") and before.st_uid != os.geteuid():
                    raise MemoryRuntimeError("runtime derivative changed owner before purge")
                if os.name == "posix" and stat.S_IMODE(before.st_mode) & 0o077:
                    raise MemoryRuntimeError("runtime derivative permissions widened before purge")
                target.unlink()
                removed.append(relative)
        value["tombstones"][event_id] = {
            "retired_at": _utc(),
            "removed_path_commitments": ["sha256:" + hashlib.sha256(item.encode()).hexdigest() for item in sorted(removed)],
        }
        _atomic_private_write(self.path, value)
        return tuple(sorted(removed))

    def event_absent(self, ref: Any) -> bool:
        event_id = ref.event_id if hasattr(ref, "event_id") else ref
        value = self._load()
        return event_id not in value["entries"] and event_id in value["tombstones"]


__all__ = [
    "EXCHANGE_MICS", "IdentityResolutionError", "MemoryRuntimeError", "ProjectionManager",
    "ProjectionSnapshot", "ProviderAuthorizationError", "RuntimeLifecycle", "authorize_provider",
    "build_identity_registry", "controlled_writer_head_sha256", "controlled_writer_owner_sha256",
    "publish_external_checkpoint",
    "ed25519_checkpoint_signer", "ed25519_checkpoint_verifier", "ed25519_policy_verifier",
    "resolve_identity",
    "load_production_events", "verify_external_checkpoint",
]
