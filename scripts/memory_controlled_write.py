#!/usr/bin/env python3
"""Fail-closed, crash-recoverable coordinator for controlled memory writes.

The coordinator owns only a private service-account journal.  Canonical event bytes are
written through an injected append-only sink; protected or purgeable events are written
through :class:`memory_store.MemoryStore`.  Validation and out-of-band authorization happen
before prepare, and every external-route prepare body is encrypted with caller-independent AAD.
"""
from __future__ import annotations

import base64
import copy
import datetime as dt
import hashlib
import json
import os
import re
import secrets
import stat
import subprocess
import threading
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping, Protocol, Sequence

try:  # pragma: no cover - selected by platform
    import fcntl
except ImportError:  # pragma: no cover - reference implementation is POSIX-only
    fcntl = None  # type: ignore[assignment]

try:
    from canonical_json import canonical_json_bytes, canonical_sha256
    from memory_contract import parse_aware_datetime, validate_event
    from memory_crypto import EncryptedObject, MemoryCryptoError
    from memory_phase5_contract import (
        Phase5ContractError,
        effective_phase5_event,
        request_event,
        validate_dead_letter,
        validate_write_request,
        validate_write_result,
    )
    from memory_shadow import ShadowError, parse_closed_json
    from memory_projection import (
        event_artifact_assertions,
        event_artifact_locator_assertions,
    )
    from memory_store import (
        AuthenticatedCipher,
        EventRef,
        MemoryStore,
        MemoryStoreError,
        ObjectRef,
        PurgeReceipt,
        StoreConflict,
        StoreNotFound,
        StoragePolicy,
    )
except ImportError:  # pragma: no cover - package-style imports
    from scripts.canonical_json import canonical_json_bytes, canonical_sha256
    from scripts.memory_contract import parse_aware_datetime, validate_event
    from scripts.memory_crypto import EncryptedObject, MemoryCryptoError
    from scripts.memory_phase5_contract import (
        Phase5ContractError,
        effective_phase5_event,
        request_event,
        validate_dead_letter,
        validate_write_request,
        validate_write_result,
    )
    from scripts.memory_shadow import ShadowError, parse_closed_json
    from scripts.memory_projection import (
        event_artifact_assertions,
        event_artifact_locator_assertions,
    )
    from scripts.memory_store import (
        AuthenticatedCipher,
        EventRef,
        MemoryStore,
        MemoryStoreError,
        ObjectRef,
        PurgeReceipt,
        StoreConflict,
        StoreNotFound,
        StoragePolicy,
    )


GENESIS_HEAD = "sha256:" + "0" * 64
JOURNAL_SCHEMA = "memory-controlled-write-journal/v1"
RETIREMENT_JOURNAL_SCHEMA = "memory-controlled-retirement-journal/v1"
JOURNAL_AAD_SCHEMA = "memory-controlled-write-journal-aad/v1"
STATE_SCHEMA = "memory-controlled-writer-state/v1"
SINK_IDENTITY_SCHEMA = "memory-canonical-sink-identity/v1"
SINK_OWNER_SCHEMA = "memory-canonical-sink-owner/v1"
RESULT_SCHEMA = "memory-controlled-write-result/v1"
DEAD_LETTER_SCHEMA = "memory-controlled-write-dead-letter/v1"
_HASH_RE = re.compile(r"sha256:[0-9a-f]{64}")
_EVENT_RE = re.compile(
    r"evt_[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}"
)
_REQUEST_RE = re.compile(
    r"write-request_[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}"
)
_RETIREMENT_RE = re.compile(r"retirement_[0-9a-f]{64}")
_KEY_NAME_RE = re.compile(r"journal-key_[0-9a-f]{64}\.json")
_B64URL_RE = re.compile(r"[A-Za-z0-9_-]*")
_IDEMPOTENCY_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._:/+-]{7,127}")
_INSTANCE_RE = re.compile(r"(?:sink|state)-instance_[0-9a-f]{64}")
_VERIFIER_ID_RE = re.compile(r"[A-Za-z0-9][A-Za-z0-9._/-]{0,127}")
_EVIDENCE_DIGEST_RE = re.compile(r"evidence:sha256:([0-9a-f]{64})#.+")
_CONTROL_TEMP_RE = re.compile(
    r"\.controlled-temp-v1-([0-9a-f]{64})-([0-9a-f]{64})-([0-9a-f]{32})"
)
_DEAD_LETTER_REASONS = {
    "invalid-contract": "request failed the closed controlled-write contract",
    "invalid-event": "event failed canonical controlled-write validation",
    "unsupported-operation": "operation is not supported by the controlled writer",
    "policy-route-invalid": "event policy has no configured controlled-write route",
    "expected-head-conflict": "expected head differs from the committed writer head",
    "idempotency-conflict": "idempotency key already committed different request bytes",
    "event-id-conflict": "event ID is already committed under another request",
    "correction-invalid": "correction failed target or replacement validation",
    "feedback-unreviewed": "feedback lacks an authorized exact-artifact review",
    "authority-denied": "out-of-band authority denied the operation",
    "store-binding-invalid": "store bindings do not satisfy the selected route",
    "journal-protection-required": "protected-route recovery journal encryption is unavailable",
    "sink-conflict": "sink identity already names different bytes",
    "recovery-required": "a durable prepared write requires recovery",
    "provenance-invalid": "candidate evidence or lineage provenance did not verify",
}
_JOURNAL_KEYS = frozenset(
    {
        "schema",
        "journal_id",
        "phase",
        "request_id",
        "idempotency_key",
        "request_sha256",
        "configuration_sha256",
        "candidate_provenance_sha256",
        "candidate_provenance_canonical_json",
        "route",
        "sequence",
        "prior_head",
        "prior_canonical_ledger_sha256",
        "event_id",
        "event_sha256",
        "event_supersedes",
        "body_encoding",
        "body_sha256",
        "body_canonical_json",
        "body_ciphertext",
        "key_ref",
        "aad_sha256",
        "sink_receipt_sha256",
        "sink_receipt_canonical_json",
        "result_canonical_json",
        "result_sha256",
        "recorded_at",
    }
)
_RETIREMENT_JOURNAL_KEYS = frozenset(
    {
        "schema",
        "journal_id",
        "phase",
        "transition_id",
        "configuration_sha256",
        "sequence",
        "prior_head",
        "prior_canonical_ledger_sha256",
        "request_sha256",
        "request_canonical_json",
        "event_sha256",
        "candidate_provenance_sha256",
        "candidate_provenance_canonical_json",
        "sink_receipt_sha256",
        "sink_receipt_canonical_json",
        "new_head",
        "result_canonical_json",
        "result_sha256",
        "recorded_at",
    }
)


class ControlledWriteError(RuntimeError):
    """Base class for controlled-write failures."""


class AuthorizationDenied(ControlledWriteError, PermissionError):
    """The injected out-of-band authority denied a write without persistence."""


class RecoveryRequired(ControlledWriteError):
    """A durable prepare exists and must be recovered before another submission."""


class ControlledWriteCorruption(ControlledWriteError):
    """Private state, journal, or sink bytes violate their immutable contract."""


class SinkConflict(ControlledWriteError):
    """A canonical event identity already names different bytes."""


class CanonicalSink(Protocol):
    """Minimal append-only canonical sink used by :class:`ControlledWriter`."""

    def append(
        self, event: Mapping[str, Any], *, idempotency_key: str
    ) -> Mapping[str, Any]: ...

    def find_event(self, event_id: str) -> Mapping[str, Any] | None: ...

    def identity(self) -> Mapping[str, Any]: ...

    def bind_coordinator(
        self, coordinator_id: str, configuration_sha256: str
    ) -> None: ...

    def coordinated(
        self, coordinator_id: str, configuration_sha256: str
    ) -> Iterable[None]: ...

    def controlled_head(self) -> Mapping[str, Any]: ...

    def advance_head(self, transition: Mapping[str, Any]) -> Mapping[str, Any]: ...

    def content_sha256(self) -> str: ...

    def validate_pending_content(
        self,
        event: Mapping[str, Any],
        *,
        route: str,
        prior_ledger_sha256: str,
    ) -> str: ...


Authorizer = Callable[[Mapping[str, Any], Any], bool]
CandidateProvenanceVerifier = Callable[..., Mapping[str, Any]]
AuthoritativeEventResolver = Callable[[str, Any], Any]
Clock = Callable[[], dt.datetime]
FaultInjector = Callable[[str], None]
RetirementProofVerifier = Callable[..., Mapping[str, Any]]


def _utc_now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def _now_text(clock: Clock) -> str:
    value = clock()
    if not isinstance(value, dt.datetime) or value.tzinfo is None:
        raise ControlledWriteCorruption("clock must return a timezone-aware datetime")
    return value.astimezone(dt.timezone.utc).isoformat(timespec="microseconds").replace(
        "+00:00", "Z"
    )


def _canonical_instant_text(value: Any) -> str:
    try:
        instant = parse_aware_datetime(value).astimezone(dt.timezone.utc)
    except (TypeError, ValueError) as exc:
        raise Phase5ContractError("temporal commitment is not timezone-aware") from exc
    return instant.isoformat(timespec="auto").replace("+00:00", "Z")


def _sha(value: Any) -> str:
    return "sha256:" + canonical_sha256(value)


def _b64url(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("ascii").rstrip("=")


def _b64url_decode(value: object) -> bytes:
    if not isinstance(value, str) or _B64URL_RE.fullmatch(value) is None:
        raise ControlledWriteCorruption("journal ciphertext is not unpadded base64url")
    try:
        decoded = base64.b64decode(
            value + "=" * (-len(value) % 4), altchars=b"-_", validate=True
        )
    except (ValueError, TypeError) as exc:
        raise ControlledWriteCorruption("journal ciphertext is not base64url") from exc
    if _b64url(decoded) != value:
        raise ControlledWriteCorruption("journal ciphertext base64url is non-canonical")
    return decoded


def _validate_regular(path: Path, label: str) -> os.stat_result:
    try:
        status = path.lstat()
    except OSError as exc:
        raise ControlledWriteCorruption(f"cannot inspect {label}: {exc}") from exc
    if stat.S_ISLNK(status.st_mode) or not stat.S_ISREG(status.st_mode):
        raise ControlledWriteCorruption(f"{label} must be a regular file")
    if status.st_nlink != 1:
        raise ControlledWriteCorruption(f"{label} must not have hard-link aliases")
    if os.name == "posix" and stat.S_IMODE(status.st_mode) != 0o600:
        raise ControlledWriteCorruption(f"{label} must have mode 0600")
    if hasattr(os, "geteuid") and status.st_uid != os.geteuid():
        raise ControlledWriteCorruption(f"{label} must be owned by the service identity")
    return status


def _validate_directory(path: Path, label: str) -> os.stat_result:
    try:
        status = path.lstat()
    except OSError as exc:
        raise ControlledWriteCorruption(f"cannot inspect {label}: {exc}") from exc
    if stat.S_ISLNK(status.st_mode) or not stat.S_ISDIR(status.st_mode):
        raise ControlledWriteCorruption(f"{label} must be a real directory")
    if os.name == "posix" and stat.S_IMODE(status.st_mode) != 0o700:
        raise ControlledWriteCorruption(f"{label} must have mode 0700")
    if hasattr(os, "geteuid") and status.st_uid != os.geteuid():
        raise ControlledWriteCorruption(f"{label} must be owned by the service identity")
    return status


def _create_regular(path: Path, data: bytes = b"") -> None:
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
    descriptor = os.open(path, flags, 0o600)
    try:
        if os.name == "posix":
            os.fchmod(descriptor, 0o600)
        view = memoryview(data)
        while view:
            written = os.write(descriptor, view)
            if written <= 0:
                raise OSError("short write")
            view = view[written:]
        os.fsync(descriptor)
    finally:
        os.close(descriptor)
    parent_fd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(parent_fd)
    finally:
        os.close(parent_fd)


def _replace_regular(path: Path, data: bytes) -> None:
    """Atomically replace one validated private control file and fsync its directory."""

    _validate_regular(path, path.name)
    destination_sha256 = hashlib.sha256(path.name.encode("utf-8")).hexdigest()
    prefix = ".controlled-temp-v1-" + destination_sha256 + "-"
    for candidate in sorted(path.parent.iterdir(), key=lambda item: item.name):
        if not candidate.name.startswith(prefix):
            continue
        match = _CONTROL_TEMP_RE.fullmatch(candidate.name)
        if match is None or match.group(1) != destination_sha256:
            raise ControlledWriteCorruption(
                "controlled-head temporary has an invalid self-bound name"
            )
        _validate_regular(candidate, "controlled-head temporary")
        if hashlib.sha256(candidate.read_bytes()).hexdigest() != match.group(2):
            raise ControlledWriteCorruption(
                "controlled-head temporary bytes do not match their name"
            )
        candidate.unlink()
    temporary = path.with_name(
        prefix + hashlib.sha256(data).hexdigest() + "-" + secrets.token_hex(16)
    )
    _create_regular(temporary, data)
    try:
        os.replace(temporary, path)
        if os.name == "posix":
            os.chmod(path, 0o600)
        parent_fd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
        try:
            os.fsync(parent_fd)
        finally:
            os.close(parent_fd)
    finally:
        if temporary.exists() or temporary.is_symlink():
            _validate_regular(temporary, "control-file temporary")
            temporary.unlink()


def _strict_object(text: str, *, label: str) -> Mapping[str, Any]:
    try:
        value = parse_closed_json(text)
    except (ShadowError, TypeError, RecursionError) as exc:
        raise ControlledWriteCorruption(f"{label} is not strict JSON: {exc}") from exc
    if not isinstance(value, Mapping):
        raise ControlledWriteCorruption(f"{label} must be a JSON object")
    try:
        if canonical_json_bytes(value).decode("utf-8") != text:
            raise ControlledWriteCorruption(f"{label} is not canonical JSON")
    except (TypeError, ValueError, UnicodeError, RecursionError) as exc:
        if isinstance(exc, ControlledWriteCorruption):
            raise
        raise ControlledWriteCorruption(f"{label} cannot be canonicalized") from exc
    return value


def _closed_sink_identity(value: Any) -> dict[str, str]:
    fields = {"schema", "kind", "identity_sha256"}
    if not isinstance(value, Mapping) or set(value) != fields:
        raise ControlledWriteCorruption("canonical sink returned an open identity")
    if value.get("schema") != SINK_IDENTITY_SCHEMA:
        raise ControlledWriteCorruption("canonical sink identity schema is unsupported")
    kind = value.get("kind")
    digest = value.get("identity_sha256")
    if (
        not isinstance(kind, str)
        or re.fullmatch(r"[a-z][a-z0-9-]{0,63}", kind) is None
        or not isinstance(digest, str)
        or _HASH_RE.fullmatch(digest) is None
    ):
        raise ControlledWriteCorruption("canonical sink identity is invalid")
    return {"schema": SINK_IDENTITY_SCHEMA, "kind": kind, "identity_sha256": digest}


class NdjsonCanonicalSink:
    """Tempdir-friendly append-only sink backed by the repository's safe NDJSON helper."""

    def __init__(
        self,
        ledger_path: str | os.PathLike[str],
        *,
        append_script: str | os.PathLike[str] | None = None,
    ) -> None:
        self.path = Path(os.path.abspath(os.fspath(ledger_path)))
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if self.path.exists() or self.path.is_symlink():
            _validate_regular(self.path, "canonical sink ledger")
        else:
            _create_regular(self.path)
        self._coordinator_lock = self.path.with_name(
            self.path.name + ".controlled-writer.lock"
        )
        self._coordinator_owner = self.path.with_name(
            self.path.name + ".controlled-writer-owner.json"
        )
        self._instance_path = self.path.with_name(
            self.path.name + ".controlled-writer-instance.json"
        )
        self._controlled_head_path = self.path.with_name(
            self.path.name + ".controlled-writer-head.json"
        )
        self._coord_local = threading.local()
        if self._coordinator_lock.exists() or self._coordinator_lock.is_symlink():
            _validate_regular(self._coordinator_lock, "canonical sink coordinator lock")
        else:
            try:
                _create_regular(self._coordinator_lock)
            except FileExistsError:  # pragma: no cover - concurrent constructor
                _validate_regular(self._coordinator_lock, "canonical sink coordinator lock")
        default_script = Path(__file__).resolve().with_name("append-ndjson.sh")
        self.append_script = Path(append_script) if append_script else default_script
        if not self.append_script.is_file() or not os.access(self.append_script, os.X_OK):
            raise ControlledWriteCorruption("append-ndjson helper is absent or not executable")
        with self._ownership_lock():
            current_identity = self._ledger_file_identity()
            if self._instance_path.exists() or self._instance_path.is_symlink():
                _validate_regular(self._instance_path, "canonical sink instance")
                instance = _strict_object(
                    self._instance_path.read_text("utf-8"),
                    label="canonical sink instance",
                )
                if (
                    set(instance)
                    != {"schema", "instance_id", "ledger_file_identity_sha256"}
                    or instance.get("schema")
                    != "memory-ndjson-sink-instance/v1"
                    or not isinstance(instance.get("instance_id"), str)
                    or _INSTANCE_RE.fullmatch(instance["instance_id"]) is None
                    or not instance["instance_id"].startswith("sink-instance_")
                    or instance.get("ledger_file_identity_sha256") != current_identity
                ):
                    raise ControlledWriteCorruption(
                        "canonical sink instance does not match the ledger file"
                    )
            else:
                if self.path.stat().st_size:
                    raise ControlledWriteCorruption(
                        "non-empty canonical sink lacks an immutable instance identity"
                    )
                _create_regular(
                    self._instance_path,
                    canonical_json_bytes(
                        {
                            "schema": "memory-ndjson-sink-instance/v1",
                            "instance_id": "sink-instance_" + secrets.token_hex(32),
                            "ledger_file_identity_sha256": current_identity,
                        }
                    ),
                )

    def _ledger_file_identity(self) -> str:
        status = _validate_regular(self.path, "canonical sink ledger")
        return _sha(
            {
                "schema": "memory-local-file-identity/v1",
                "device": status.st_dev,
                "inode": status.st_ino,
            }
        )

    def identity(self) -> Mapping[str, Any]:
        _validate_regular(self._instance_path, "canonical sink instance")
        instance = _strict_object(
            self._instance_path.read_text("utf-8"), label="canonical sink instance"
        )
        if (
            set(instance) != {"schema", "instance_id", "ledger_file_identity_sha256"}
            or instance.get("schema") != "memory-ndjson-sink-instance/v1"
            or instance.get("ledger_file_identity_sha256")
            != self._ledger_file_identity()
        ):
            raise ControlledWriteCorruption("canonical sink instance identity changed")
        return {
            "schema": SINK_IDENTITY_SCHEMA,
            "kind": "ndjson",
            "identity_sha256": _sha(instance),
        }

    @contextmanager
    def _ownership_lock(self) -> Iterable[None]:
        if fcntl is None:
            raise ControlledWriteCorruption("canonical sink ownership requires POSIX flock")
        _validate_regular(self._coordinator_lock, "canonical sink coordinator lock")
        descriptor = os.open(
            self._coordinator_lock,
            os.O_RDWR | getattr(os, "O_NOFOLLOW", 0),
        )
        try:
            fcntl.flock(descriptor, fcntl.LOCK_EX)
            _validate_regular(self._coordinator_lock, "canonical sink coordinator lock")
            yield
        finally:
            os.close(descriptor)

    def _owner_record(
        self, coordinator_id: str, configuration_sha256: str
    ) -> dict[str, Any]:
        if not isinstance(coordinator_id, str) or _HASH_RE.fullmatch(coordinator_id) is None:
            raise ControlledWriteCorruption("coordinator identity is invalid")
        if (
            not isinstance(configuration_sha256, str)
            or _HASH_RE.fullmatch(configuration_sha256) is None
        ):
            raise ControlledWriteCorruption("writer configuration identity is invalid")
        identity = _closed_sink_identity(self.identity())
        return {
            "schema": SINK_OWNER_SCHEMA,
            "coordinator_id": coordinator_id,
            "configuration_sha256": configuration_sha256,
            "sink_identity_sha256": _sha(identity),
        }

    def bind_coordinator(
        self, coordinator_id: str, configuration_sha256: str
    ) -> None:
        expected = self._owner_record(coordinator_id, configuration_sha256)
        data = canonical_json_bytes(expected)
        with self._ownership_lock():
            if self._coordinator_owner.exists() or self._coordinator_owner.is_symlink():
                _validate_regular(
                    self._coordinator_owner, "canonical sink coordinator owner"
                )
                if self._coordinator_owner.read_bytes() != data:
                    raise ControlledWriteCorruption(
                        "canonical sink is already bound to another writer state"
                    )
            else:
                try:
                    _create_regular(self._coordinator_owner, data)
                except FileExistsError:  # pragma: no cover - concurrent constructor
                    _validate_regular(
                        self._coordinator_owner, "canonical sink coordinator owner"
                    )
                    if self._coordinator_owner.read_bytes() != data:
                        raise ControlledWriteCorruption(
                            "canonical sink is already bound to another writer state"
                        )
            genesis = {
                "schema": "memory-controlled-sink-head/v1",
                "coordinator_id": coordinator_id,
                "configuration_sha256": configuration_sha256,
                "sequence": 0,
                "head": GENESIS_HEAD,
                "canonical_ledger_sha256": self._content_commitment(),
                "transition": None,
            }
            if self._controlled_head_path.exists() or self._controlled_head_path.is_symlink():
                _validate_regular(self._controlled_head_path, "canonical sink controlled head")
                self._validate_controlled_head(
                    _strict_object(
                        self._controlled_head_path.read_text("utf-8"),
                        label="canonical sink controlled head",
                    ),
                    expected_owner=expected,
                )
            else:
                _create_regular(
                    self._controlled_head_path, canonical_json_bytes(genesis)
                )

    @contextmanager
    def coordinated(
        self, coordinator_id: str, configuration_sha256: str
    ) -> Iterable[None]:
        expected_record = self._owner_record(coordinator_id, configuration_sha256)
        expected = canonical_json_bytes(expected_record)
        with self._ownership_lock():
            _validate_regular(
                self._coordinator_owner, "canonical sink coordinator owner"
            )
            if self._coordinator_owner.read_bytes() != expected:
                raise ControlledWriteCorruption(
                    "canonical sink coordinator ownership changed"
                )
            self._validate_controlled_head(
                _strict_object(
                    self._controlled_head_path.read_text("utf-8"),
                    label="canonical sink controlled head",
                ),
                expected_owner=expected_record,
            )
            self._coord_local.active = (coordinator_id, configuration_sha256)
            try:
                yield
            finally:
                self._coord_local.active = None

    @staticmethod
    def _validate_transition(transition: Any) -> None:
        fields = {
            "schema",
            "coordinator_id",
            "configuration_sha256",
            "sequence",
            "prior_head",
            "prior_canonical_ledger_sha256",
            "new_head",
            "request_sha256",
            "event_sha256",
            "sink_receipt_sha256",
            "candidate_provenance_sha256",
            "canonical_ledger_sha256",
        }
        if not isinstance(transition, Mapping) or set(transition) != fields:
            raise ControlledWriteCorruption("controlled-head transition has an open shape")
        if transition.get("schema") != "memory-controlled-head-transition/v1":
            raise ControlledWriteCorruption("controlled-head transition schema is invalid")
        if type(transition.get("sequence")) is not int or transition["sequence"] < 1:
            raise ControlledWriteCorruption("controlled-head transition sequence is invalid")
        for field in fields - {"schema", "sequence"}:
            if not isinstance(transition.get(field), str) or _HASH_RE.fullmatch(
                transition[field]
            ) is None:
                raise ControlledWriteCorruption(
                    f"controlled-head transition {field} is invalid"
                )
        expected_head = _sha(
            {
                "schema": "memory-controlled-write-head/v1",
                "sequence": transition["sequence"],
                "prior_head": transition["prior_head"],
                "prior_canonical_ledger_sha256": transition[
                    "prior_canonical_ledger_sha256"
                ],
                "configuration_sha256": transition["configuration_sha256"],
                "candidate_provenance_sha256": transition[
                    "candidate_provenance_sha256"
                ],
                "request_sha256": transition["request_sha256"],
                "event_sha256": transition["event_sha256"],
                "sink_receipt_sha256": transition["sink_receipt_sha256"],
                "canonical_ledger_sha256": transition[
                    "canonical_ledger_sha256"
                ],
            }
        )
        if transition["new_head"] != expected_head:
            raise ControlledWriteCorruption("controlled-head transition digest is stale")

    @classmethod
    def _validate_controlled_head(
        cls, head: Any, *, expected_owner: Mapping[str, Any]
    ) -> None:
        if (
            not isinstance(head, Mapping)
            or set(head)
            != {
                "schema",
                "coordinator_id",
                "configuration_sha256",
                "sequence",
                "head",
                "canonical_ledger_sha256",
                "transition",
            }
            or head.get("schema") != "memory-controlled-sink-head/v1"
            or head.get("coordinator_id") != expected_owner.get("coordinator_id")
            or head.get("configuration_sha256")
            != expected_owner.get("configuration_sha256")
            or type(head.get("sequence")) is not int
            or head["sequence"] < 0
            or not isinstance(head.get("head"), str)
            or _HASH_RE.fullmatch(head["head"]) is None
            or not isinstance(head.get("canonical_ledger_sha256"), str)
            or _HASH_RE.fullmatch(head["canonical_ledger_sha256"]) is None
        ):
            raise ControlledWriteCorruption("canonical sink controlled head is invalid")
        transition = head.get("transition")
        if head["sequence"] == 0:
            if head["head"] != GENESIS_HEAD or transition is not None:
                raise ControlledWriteCorruption("canonical sink genesis head is invalid")
            return
        cls._validate_transition(transition)
        if (
            transition.get("sequence") != head["sequence"]
            or transition.get("new_head") != head["head"]
            or transition.get("coordinator_id") != head["coordinator_id"]
            or transition.get("configuration_sha256")
            != head["configuration_sha256"]
            or transition.get("canonical_ledger_sha256")
            != head["canonical_ledger_sha256"]
        ):
            raise ControlledWriteCorruption("canonical sink head/transition mismatch")

    def _require_active_owner(self) -> tuple[str, str]:
        active = getattr(self._coord_local, "active", None)
        if (
            not isinstance(active, tuple)
            or len(active) != 2
            or not all(isinstance(item, str) for item in active)
        ):
            raise ControlledWriteCorruption(
                "controlled head may only be used inside the sink coordinator lock"
            )
        return active

    def controlled_head(self) -> Mapping[str, Any]:
        coordinator_id, configuration_sha256 = self._require_active_owner()
        head = _strict_object(
            self._controlled_head_path.read_text("utf-8"),
            label="canonical sink controlled head",
        )
        self._validate_controlled_head(
            head,
            expected_owner=self._owner_record(coordinator_id, configuration_sha256),
        )
        return copy.deepcopy(dict(head))

    def advance_head(self, transition: Mapping[str, Any]) -> Mapping[str, Any]:
        coordinator_id, configuration_sha256 = self._require_active_owner()
        self._validate_transition(transition)
        if (
            transition.get("coordinator_id") != coordinator_id
            or transition.get("configuration_sha256") != configuration_sha256
        ):
            raise ControlledWriteCorruption(
                "controlled-head transition belongs to another coordinator"
            )
        if transition.get("canonical_ledger_sha256") != self._content_commitment():
            raise ControlledWriteCorruption(
                "controlled-head transition does not bind current canonical ledger bytes"
            )
        current = self.controlled_head()
        if (
            current["sequence"] == transition["sequence"]
            and current["head"] == transition["new_head"]
            and current["transition"] == transition
        ):
            return current
        if (
            transition["sequence"] != current["sequence"] + 1
            or transition["prior_head"] != current["head"]
            or transition["prior_canonical_ledger_sha256"]
            != current["canonical_ledger_sha256"]
        ):
            raise ControlledWriteCorruption(
                "controlled-head compare-and-swap predecessor differs"
            )
        advanced = {
            "schema": "memory-controlled-sink-head/v1",
            "coordinator_id": coordinator_id,
            "configuration_sha256": configuration_sha256,
            "sequence": transition["sequence"],
            "head": transition["new_head"],
            "canonical_ledger_sha256": transition["canonical_ledger_sha256"],
            "transition": copy.deepcopy(dict(transition)),
        }
        _replace_regular(self._controlled_head_path, canonical_json_bytes(advanced))
        return copy.deepcopy(advanced)

    def _rows(self) -> list[Mapping[str, Any]]:
        _validate_regular(self.path, "canonical sink ledger")
        descriptor = os.open(self.path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
        try:
            if fcntl is not None:
                fcntl.flock(descriptor, fcntl.LOCK_SH)
            raw = b""
            while True:
                chunk = os.read(descriptor, 1024 * 1024)
                if not chunk:
                    break
                raw += chunk
        finally:
            os.close(descriptor)
        if raw and not raw.endswith(b"\n"):
            raise ControlledWriteCorruption("canonical sink has an unterminated record")
        rows: list[Mapping[str, Any]] = []
        for line_number, raw_line in enumerate(raw.splitlines(), 1):
            try:
                line = raw_line.decode("utf-8")
            except UnicodeDecodeError as exc:
                raise ControlledWriteCorruption(
                    f"canonical sink line {line_number} is not UTF-8"
                ) from exc
            rows.append(_strict_object(line, label=f"canonical sink line {line_number}"))
        return rows

    def _content_commitment(self) -> str:
        return _sha(self._rows())

    def content_sha256(self) -> str:
        self._require_active_owner()
        return self._content_commitment()

    def validate_pending_content(
        self,
        event: Mapping[str, Any],
        *,
        route: str,
        prior_ledger_sha256: str,
    ) -> str:
        self._require_active_owner()
        if not isinstance(prior_ledger_sha256, str) or _HASH_RE.fullmatch(
            prior_ledger_sha256
        ) is None:
            raise ControlledWriteCorruption("prior canonical ledger commitment is invalid")
        rows = self._rows()
        current = _sha(rows)
        if current == prior_ledger_sha256:
            return current
        if (
            route == "canonical"
            and rows
            and _sha(rows[:-1]) == prior_ledger_sha256
            and canonical_json_bytes(rows[-1]) == canonical_json_bytes(event)
            and sum(row.get("event_id") == event.get("event_id") for row in rows) == 1
        ):
            return current
        raise ControlledWriteCorruption(
            "pending write cannot explain the exact canonical ledger delta"
        )

    def find_event(self, event_id: str) -> Mapping[str, Any] | None:
        if not isinstance(event_id, str) or _EVENT_RE.fullmatch(event_id) is None:
            raise ControlledWriteCorruption("event_id is not canonical")
        found = [row for row in self._rows() if row.get("event_id") == event_id]
        if not found:
            return None
        first = canonical_json_bytes(found[0])
        if len(found) != 1 and any(canonical_json_bytes(row) != first for row in found[1:]):
            raise ControlledWriteCorruption("canonical sink has conflicting duplicate event IDs")
        return copy.deepcopy(dict(found[0]))

    def append(
        self, event: Mapping[str, Any], *, idempotency_key: str
    ) -> Mapping[str, Any]:
        event_text = canonical_json_bytes(event).decode("utf-8")
        event_sha256 = _sha(event)
        existing = self.find_event(str(event.get("event_id")))
        if existing is not None:
            if canonical_json_bytes(existing) != event_text.encode("utf-8"):
                raise SinkConflict("event_id already names different canonical bytes")
            duplicate = True
        else:
            result = subprocess.run(
                [
                    os.fspath(self.append_script),
                    os.fspath(self.path),
                    event_text,
                    "event_id",
                    str(event["event_id"]),
                ],
                check=False,
                capture_output=True,
                text=True,
            )
            if result.returncode != 0:
                raise ControlledWriteError(
                    f"canonical append helper failed with exit {result.returncode}"
                )
            duplicate = "DUPLICATE=1" in result.stdout
            stored = self.find_event(str(event["event_id"]))
            if stored is None or canonical_json_bytes(stored) != event_text.encode("utf-8"):
                raise SinkConflict("canonical sink event ID resolved to different bytes")
        return {
            "schema": "memory-canonical-sink-receipt/v1",
            "event_id": event["event_id"],
            "event_sha256": event_sha256,
            "idempotency_key": idempotency_key,
            "disposition": "present",
            "sink_identity_sha256": _sha(_closed_sink_identity(self.identity())),
            "canonical_ledger_sha256": self._content_commitment(),
        }


class _PrivateState:
    _LANES = frozenset({"journal", "keys", "quarantine", "locks"})

    def __init__(
        self,
        root: str | os.PathLike[str],
        *,
        append_script: Path,
        repository_root: str | os.PathLike[str] | None,
        configuration: Mapping[str, Any],
    ) -> None:
        raw = Path(os.path.abspath(os.fspath(root)))
        if repository_root is not None:
            repository = Path(repository_root).resolve(strict=False)
            try:
                raw.resolve(strict=False).relative_to(repository)
            except ValueError:
                pass
            else:
                raise ControlledWriteCorruption(
                    "controlled-write journal must live outside the Git repository"
                )
        if raw.exists() or raw.is_symlink():
            _validate_directory(raw, "controlled-write state root")
        else:
            if not raw.parent.is_dir():
                raise ControlledWriteCorruption("state-root parent must already exist")
            raw.mkdir(mode=0o700)
            if os.name == "posix":
                os.chmod(raw, 0o700)
            _validate_directory(raw, "controlled-write state root")
        self.root = raw
        self.root_identity = (self.root.stat().st_dev, self.root.stat().st_ino)
        self.append_script = append_script
        if not append_script.is_file() or not os.access(append_script, os.X_OK):
            raise ControlledWriteCorruption("append-ndjson helper is absent or not executable")
        actual = {item.name for item in self.root.iterdir()}
        if actual - self._LANES:
            raise ControlledWriteCorruption("state root contains unsupported top-level entries")
        for lane in sorted(self._LANES):
            path = self.root / lane
            if path.exists() or path.is_symlink():
                _validate_directory(path, f"state lane {lane}")
            else:
                path.mkdir(mode=0o700)
                if os.name == "posix":
                    os.chmod(path, 0o700)
        self.journal = self.root / "journal" / "writes.ndjson"
        self.configuration_path = self.root / "journal" / "configuration.json"
        self.dead_letters = self.root / "quarantine" / "dead-letters.ndjson"
        self.lock_path = self.root / "locks" / "writer.lock"
        for path in (self.journal, self.dead_letters, self.lock_path):
            if path.exists() or path.is_symlink():
                _validate_regular(path, path.name)
            else:
                _create_regular(path)
        configuration_copy = copy.deepcopy(dict(configuration))
        configuration_sha256 = _sha(configuration_copy)
        if self.configuration_path.exists() or self.configuration_path.is_symlink():
            _validate_regular(self.configuration_path, "writer configuration")
            try:
                stored_configuration = _strict_object(
                    self.configuration_path.read_text("utf-8"),
                    label="writer configuration",
                )
            except UnicodeDecodeError as exc:
                raise ControlledWriteCorruption(
                    "writer configuration is not UTF-8"
                ) from exc
            if (
                set(stored_configuration)
                != {"schema", "state_instance_id", "configuration_sha256", "configuration"}
                or stored_configuration.get("schema") != STATE_SCHEMA
                or not isinstance(stored_configuration.get("state_instance_id"), str)
                or _INSTANCE_RE.fullmatch(stored_configuration["state_instance_id"])
                is None
                or not stored_configuration["state_instance_id"].startswith(
                    "state-instance_"
                )
                or stored_configuration.get("configuration_sha256")
                != configuration_sha256
                or stored_configuration.get("configuration") != configuration_copy
            ):
                raise ControlledWriteCorruption(
                    "writer state configuration does not match the injected sink/store identities"
                )
        else:
            if (
                self.journal.stat().st_size
                or self.dead_letters.stat().st_size
                or any((self.root / "keys").iterdir())
            ):
                raise ControlledWriteCorruption(
                    "non-empty legacy writer state has no immutable configuration binding"
                )
            stored_configuration = {
                "schema": STATE_SCHEMA,
                "state_instance_id": "state-instance_" + secrets.token_hex(32),
                "configuration_sha256": configuration_sha256,
                "configuration": configuration_copy,
            }
            expected_bytes = canonical_json_bytes(stored_configuration)
            _create_regular(self.configuration_path, expected_bytes)
        self.configuration = stored_configuration["configuration"]
        self.configuration_sha256 = stored_configuration["configuration_sha256"]
        self.coordinator_id = _sha(
            {
                "schema": "memory-controlled-writer-coordinator/v1",
                "state_instance_id": stored_configuration["state_instance_id"],
                "state_root_sha256": self.configuration["state_root_sha256"],
            }
        )
        self._configuration_bytes = canonical_json_bytes(stored_configuration)
        self._verify()

    def _verify(self) -> None:
        status = _validate_directory(self.root, "controlled-write state root")
        if (status.st_dev, status.st_ino) != self.root_identity:
            raise ControlledWriteCorruption("state-root identity changed")
        actual = {item.name for item in self.root.iterdir()}
        if actual != self._LANES:
            raise ControlledWriteCorruption("state-root layout changed")
        for lane in sorted(self._LANES):
            _validate_directory(self.root / lane, f"state lane {lane}")
        _validate_regular(self.journal, "write journal")
        _validate_regular(self.configuration_path, "writer configuration")
        if self.configuration_path.read_bytes() != self._configuration_bytes:
            raise ControlledWriteCorruption("writer configuration bytes changed")
        _validate_regular(self.dead_letters, "dead-letter ledger")
        _validate_regular(self.lock_path, "writer lock")
        allowed = {
            self.journal,
            self.configuration_path,
            self.dead_letters,
            self.lock_path,
        }
        for lane in (self.root / "journal", self.root / "quarantine", self.root / "locks"):
            for child in lane.iterdir():
                if child not in allowed:
                    raise ControlledWriteCorruption(f"unsupported state entry: {child.name}")
        for child in (self.root / "keys").iterdir():
            if _KEY_NAME_RE.fullmatch(child.name) is None:
                raise ControlledWriteCorruption("key lane contains an unsupported entry")
            _validate_regular(child, "journal key envelope")

    @contextmanager
    def locked(self) -> Iterable[None]:
        if fcntl is None:
            raise ControlledWriteCorruption("controlled writer requires POSIX flock")
        self._verify()
        descriptor = os.open(
            self.lock_path,
            os.O_RDWR | getattr(os, "O_NOFOLLOW", 0),
        )
        try:
            _validate_regular(self.lock_path, "writer lock")
            fcntl.flock(descriptor, fcntl.LOCK_EX)
            self._verify()
            yield
        finally:
            os.close(descriptor)

    def append(self, path: Path, row: Mapping[str, Any], *, key: str, value: str) -> None:
        self._verify()
        text = canonical_json_bytes(row).decode("utf-8")
        result = subprocess.run(
            [os.fspath(self.append_script), os.fspath(path), text, key, value],
            check=False,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            raise ControlledWriteCorruption(
                f"append-ndjson helper failed with exit {result.returncode}"
            )
        self._verify()

    def _repair_partial_tail(self, path: Path) -> None:
        descriptor = os.open(path, os.O_RDWR | getattr(os, "O_NOFOLLOW", 0))
        try:
            _validate_regular(path, path.name)
            size = os.fstat(descriptor).st_size
            if not size:
                return
            os.lseek(descriptor, size - 1, os.SEEK_SET)
            if os.read(descriptor, 1) == b"\n":
                return
            os.lseek(descriptor, 0, os.SEEK_SET)
            raw = b""
            while True:
                chunk = os.read(descriptor, 1024 * 1024)
                if not chunk:
                    break
                raw += chunk
            boundary = raw.rfind(b"\n")
            os.ftruncate(descriptor, boundary + 1 if boundary >= 0 else 0)
            os.fsync(descriptor)
        finally:
            os.close(descriptor)

    def rows(self, path: Path, *, repair: bool = False) -> list[Mapping[str, Any]]:
        self._verify()
        if repair:
            self._repair_partial_tail(path)
        raw = path.read_bytes()
        if raw and not raw.endswith(b"\n"):
            raise ControlledWriteCorruption(f"{path.name} has an unterminated record")
        result: list[Mapping[str, Any]] = []
        for number, raw_line in enumerate(raw.splitlines(), 1):
            try:
                line = raw_line.decode("utf-8")
            except UnicodeDecodeError as exc:
                raise ControlledWriteCorruption(f"{path.name} line {number} is not UTF-8") from exc
            result.append(_strict_object(line, label=f"{path.name} line {number}"))
        return result

    def write_key(self, name: str, envelope: Mapping[str, Any]) -> None:
        if _KEY_NAME_RE.fullmatch(name) is None:
            raise ControlledWriteCorruption("internally constructed key name is invalid")
        path = self.root / "keys" / name
        data = canonical_json_bytes(envelope)
        if path.exists() or path.is_symlink():
            if path.read_bytes() != data:
                raise ControlledWriteCorruption("journal key address contains different bytes")
            return
        _create_regular(path, data)

    def read_key(self, name: str) -> Mapping[str, Any]:
        if _KEY_NAME_RE.fullmatch(name) is None:
            raise ControlledWriteCorruption("journal key reference is invalid")
        path = self.root / "keys" / name
        _validate_regular(path, "journal key envelope")
        try:
            return _strict_object(path.read_text("utf-8"), label="journal key envelope")
        except UnicodeDecodeError as exc:
            raise ControlledWriteCorruption("journal key envelope is not UTF-8") from exc

    def delete_key(self, name: str) -> None:
        if _KEY_NAME_RE.fullmatch(name) is None:
            raise ControlledWriteCorruption("journal key reference is invalid")
        path = self.root / "keys" / name
        if not path.exists() and not path.is_symlink():
            return
        opened = _validate_regular(path, "journal key envelope")
        current = path.lstat()
        if (opened.st_dev, opened.st_ino) != (current.st_dev, current.st_ino):
            raise ControlledWriteCorruption("journal key changed before delete")
        path.unlink()
        descriptor = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
        try:
            os.fsync(descriptor)
        finally:
            os.close(descriptor)


class ControlledWriter:
    """Coordinate authorized, idempotent, append-only memory writes."""

    _process_guard = threading.RLock()

    def __init__(
        self,
        state_root: str | os.PathLike[str],
        canonical_sink: CanonicalSink,
        *,
        authorize_write: Authorizer,
        authorize_recovery: Authorizer,
        candidate_provenance_verifier: CandidateProvenanceVerifier,
        candidate_provenance_verifier_id: str,
        authoritative_event_resolver: AuthoritativeEventResolver,
        authoritative_event_resolver_id: str,
        memory_store: MemoryStore | None = None,
        journal_cipher: AuthenticatedCipher | None = None,
        review_authorizer: Authorizer | None = None,
        authorize_retirement: Authorizer | None = None,
        retirement_proof_verifier: RetirementProofVerifier | None = None,
        retirement_proof_verifier_id: str | None = None,
        repository_root: str | os.PathLike[str] | None = None,
        append_script: str | os.PathLike[str] | None = None,
        clock: Clock = _utc_now,
        fault_injector: FaultInjector | None = None,
    ) -> None:
        if not callable(authorize_write):
            raise ControlledWriteCorruption("authorize_write must be an injected callable")
        if not callable(authorize_recovery):
            raise ControlledWriteCorruption("authorize_recovery must be an injected callable")
        if not callable(candidate_provenance_verifier):
            raise ControlledWriteCorruption(
                "candidate_provenance_verifier must be an injected callable"
            )
        if (
            not isinstance(candidate_provenance_verifier_id, str)
            or _VERIFIER_ID_RE.fullmatch(candidate_provenance_verifier_id) is None
        ):
            raise ControlledWriteCorruption(
                "candidate_provenance_verifier_id is invalid"
            )
        if not callable(authoritative_event_resolver):
            raise ControlledWriteCorruption(
                "authoritative_event_resolver must be an injected callable"
            )
        if (
            not isinstance(authoritative_event_resolver_id, str)
            or _VERIFIER_ID_RE.fullmatch(authoritative_event_resolver_id) is None
        ):
            raise ControlledWriteCorruption(
                "authoritative_event_resolver_id is invalid"
            )
        if review_authorizer is not None and not callable(review_authorizer):
            raise ControlledWriteCorruption("review_authorizer must be callable")
        retirement_options = (
            authorize_retirement,
            retirement_proof_verifier,
            retirement_proof_verifier_id,
        )
        if any(value is not None for value in retirement_options):
            if (
                not callable(authorize_retirement)
                or not callable(retirement_proof_verifier)
                or not isinstance(retirement_proof_verifier_id, str)
                or _VERIFIER_ID_RE.fullmatch(retirement_proof_verifier_id) is None
            ):
                raise ControlledWriteCorruption(
                    "retirement authorization, proof verifier, and verifier ID must be configured together"
                )
        if not callable(clock):
            raise ControlledWriteCorruption("clock must be callable")
        if not all(
            hasattr(canonical_sink, name)
            for name in (
                "append",
                "find_event",
                "identity",
                "bind_coordinator",
                "coordinated",
                "controlled_head",
                "advance_head",
                "content_sha256",
                "validate_pending_content",
            )
        ):
            raise ControlledWriteCorruption("canonical_sink does not implement the closed protocol")
        sink_identity = _closed_sink_identity(canonical_sink.identity())
        state_path = Path(os.path.abspath(os.fspath(state_root)))
        store_identity_sha256: str | None = None
        if memory_store is not None:
            store_root = Path(memory_store.root).resolve(strict=True)
            store_status = store_root.stat()
            store_lock = store_root / "locks" / "store.lock"
            store_lock_status = _validate_regular(
                store_lock, "protected store transaction lock"
            )
            store_identity_sha256 = _sha(
                {
                    "schema": "memory-protected-store-instance/v1",
                    "root_path_sha256": "sha256:"
                    + hashlib.sha256(os.fsencode(store_root)).hexdigest(),
                    "root_file_identity_sha256": _sha(
                        {"device": store_status.st_dev, "inode": store_status.st_ino}
                    ),
                    "lock_file_identity_sha256": _sha(
                        {
                            "device": store_lock_status.st_dev,
                            "inode": store_lock_status.st_ino,
                        }
                    ),
                }
            )
        journal_cipher_key_id_sha256: str | None = None
        if journal_cipher is not None:
            key_id = getattr(journal_cipher, "key_id", None)
            if not isinstance(key_id, str) or not key_id:
                raise ControlledWriteCorruption(
                    "journal cipher must expose a stable non-empty key_id"
                )
            journal_cipher_key_id_sha256 = "sha256:" + hashlib.sha256(
                key_id.encode("utf-8")
            ).hexdigest()
        configuration = {
            "schema": "memory-controlled-writer-configuration/v1",
            "state_root_sha256": "sha256:"
            + hashlib.sha256(os.fsencode(state_path)).hexdigest(),
            "canonical_sink_identity": sink_identity,
            "canonical_sink_identity_sha256": _sha(sink_identity),
            "protected_store_identity_sha256": store_identity_sha256,
            "journal_cipher_key_id_sha256": journal_cipher_key_id_sha256,
            "candidate_provenance_verifier_id": candidate_provenance_verifier_id,
            "authoritative_event_resolver_id": authoritative_event_resolver_id,
            "retirement_proof_verifier_id": retirement_proof_verifier_id,
        }
        helper = Path(append_script) if append_script else Path(__file__).with_name("append-ndjson.sh")
        self._state = _PrivateState(
            state_root,
            append_script=helper,
            repository_root=repository_root,
            configuration=configuration,
        )
        self._canonical_sink = canonical_sink
        self._memory_store = memory_store
        self._journal_cipher = journal_cipher
        self._authorize_write = authorize_write
        self._authorize_recovery = authorize_recovery
        self._review_authorizer = review_authorizer
        self._authorize_retirement = authorize_retirement
        self._retirement_proof_verifier = retirement_proof_verifier
        self._retirement_proof_verifier_id = retirement_proof_verifier_id
        self._candidate_provenance_verifier = candidate_provenance_verifier
        self._candidate_provenance_verifier_id = candidate_provenance_verifier_id
        self._authoritative_event_resolver = authoritative_event_resolver
        self._authoritative_event_resolver_id = authoritative_event_resolver_id
        self._clock = clock
        self._fault_injector = fault_injector
        self._canonical_sink.bind_coordinator(
            self._state.coordinator_id, self._state.configuration_sha256
        )
        if self._memory_store is not None:
            try:
                self._memory_store.bind_controlled_writer(
                    self._state.coordinator_id,
                    self._state.configuration_sha256,
                )
            except MemoryStoreError as exc:
                raise ControlledWriteCorruption(
                    "protected store is bound to another writer configuration"
                ) from exc

    @contextmanager
    def _store_coordinated(self) -> Iterable[None]:
        if self._memory_store is None:
            yield
            return
        with self._memory_store.controlled_writer(
            self._state.coordinator_id, self._state.configuration_sha256
        ):
            yield

    def _fault(self, point: str) -> None:
        if self._fault_injector is not None:
            self._fault_injector(point)

    @staticmethod
    def _request_sha(request: Any) -> str:
        try:
            return _sha(request)
        except (TypeError, ValueError, UnicodeError, RecursionError):
            marker = (type(request).__module__ + "." + type(request).__qualname__).encode("utf-8")
            return "sha256:" + hashlib.sha256(b"noncanonical-request/v1\0" + marker).hexdigest()

    @staticmethod
    def _route(event: Mapping[str, Any]) -> str:
        try:
            policy = StoragePolicy.from_event(event)
        except MemoryStoreError as exc:
            raise Phase5ContractError(f"event policy cannot be routed: {exc}") from exc
        if (
            policy.classification in {"public", "internal"}
            and policy.retention == "permanent"
        ):
            return "canonical"
        if policy.requires_external_store:
            return "protected-store"
        raise Phase5ContractError("event policy has no controlled-write route")

    def _authorized(self, request: Mapping[str, Any], principal: object | None) -> bool:
        try:
            allowed = self._authorize_write(request, principal)
        except Exception:
            return False
        return allowed is True

    def _review_authorized(
        self, request: Mapping[str, Any], principal: object | None
    ) -> bool:
        if request.get("operation") == "claim-append":
            return True
        if self._review_authorizer is None:
            return False
        try:
            return self._review_authorizer(request, principal) is True
        except Exception:
            return False

    def _recovery_authorized(self, principal: object | None) -> bool:
        descriptor = {
            "schema": "memory-controlled-recovery-authorization/v1",
            "operation": "recover",
        }
        try:
            return self._authorize_recovery(descriptor, principal) is True
        except Exception:
            return False

    def _validate_journal_row(self, row: Mapping[str, Any]) -> None:
        if set(row) != _JOURNAL_KEYS or row.get("schema") != JOURNAL_SCHEMA:
            raise ControlledWriteCorruption("journal row has an open or unsupported shape")
        phase = row.get("phase")
        if phase not in {"prepare", "commit", "abort"}:
            raise ControlledWriteCorruption("journal phase is unsupported")
        for field in (
            "request_sha256",
            "configuration_sha256",
            "candidate_provenance_sha256",
            "prior_head",
            "prior_canonical_ledger_sha256",
            "event_sha256",
        ):
            if not isinstance(row.get(field), str) or _HASH_RE.fullmatch(row[field]) is None:
                raise ControlledWriteCorruption(f"journal {field} is invalid")
        if row.get("route") not in {"canonical", "protected-store"}:
            raise ControlledWriteCorruption("journal route is invalid")
        supersedes = row.get("event_supersedes")
        if (
            not isinstance(supersedes, list)
            or len(supersedes) != len(set(supersedes))
            or any(
                not isinstance(item, str) or _EVENT_RE.fullmatch(item) is None
                for item in supersedes
            )
        ):
            raise ControlledWriteCorruption("journal event_supersedes is invalid")
        if row.get("configuration_sha256") != self._state.configuration_sha256:
            raise ControlledWriteCorruption(
                "journal row belongs to another writer configuration"
            )
        if not isinstance(row.get("sequence"), int) or isinstance(row.get("sequence"), bool):
            raise ControlledWriteCorruption("journal sequence is invalid")
        if not isinstance(row.get("candidate_provenance_canonical_json"), str):
            raise ControlledWriteCorruption("journal candidate provenance is absent")
        provenance = _strict_object(
            row["candidate_provenance_canonical_json"],
            label="journal candidate provenance",
        )
        if _sha(provenance) != row["candidate_provenance_sha256"]:
            raise ControlledWriteCorruption(
                "journal candidate provenance commitment is stale"
            )
        if phase == "prepare":
            encoding = row.get("body_encoding")
            if encoding not in {"plaintext", "ciphertext"}:
                raise ControlledWriteCorruption("prepare body encoding is invalid")
            if row.get("body_sha256") != row.get("request_sha256"):
                raise ControlledWriteCorruption("prepare body is not request-bound")
            if any(row.get(field) is not None for field in (
                "sink_receipt_sha256", "sink_receipt_canonical_json",
                "result_canonical_json", "result_sha256"
            )):
                raise ControlledWriteCorruption("prepare contains terminal fields")
            if encoding == "plaintext":
                if not isinstance(row.get("body_canonical_json"), str) or any(
                    row.get(field) is not None
                    for field in ("body_ciphertext", "key_ref", "aad_sha256")
                ):
                    raise ControlledWriteCorruption("plaintext prepare fields are inconsistent")
            else:
                if not isinstance(row.get("body_ciphertext"), str) or not isinstance(
                    row.get("key_ref"), str
                ) or not isinstance(row.get("aad_sha256"), str) or row.get(
                    "body_canonical_json"
                ) is not None:
                    raise ControlledWriteCorruption("ciphertext prepare fields are inconsistent")
        elif phase == "commit":
            if any(row.get(field) is not None for field in (
                "body_encoding", "body_sha256", "body_canonical_json", "body_ciphertext",
                "key_ref", "aad_sha256"
            )):
                raise ControlledWriteCorruption("commit retains prepare body fields")
            if not all(isinstance(row.get(field), str) for field in (
                "sink_receipt_sha256", "sink_receipt_canonical_json",
                "result_canonical_json", "result_sha256"
            )):
                raise ControlledWriteCorruption("commit lacks result commitments")
            receipt = _strict_object(
                row["sink_receipt_canonical_json"], label="journal sink receipt"
            )
            self._validate_committed_receipt(row, receipt)
            if _sha(receipt) != row["sink_receipt_sha256"]:
                raise ControlledWriteCorruption(
                    "journal sink receipt commitment is invalid"
                )
            result = _strict_object(row["result_canonical_json"], label="journal result")
            if _sha(result) != row["result_sha256"] or validate_write_result(result):
                raise ControlledWriteCorruption("journal result commitment is invalid")
        else:
            if any(row.get(field) is not None for field in (
                "body_encoding", "body_sha256", "body_canonical_json", "body_ciphertext",
                "key_ref", "aad_sha256", "sink_receipt_sha256",
                "sink_receipt_canonical_json", "result_canonical_json", "result_sha256"
            )):
                raise ControlledWriteCorruption("abort contains body or result fields")

    def _validate_committed_receipt(
        self, row: Mapping[str, Any], receipt: Mapping[str, Any]
    ) -> None:
        common = {
            "idempotency_key": row.get("idempotency_key"),
            "configuration_sha256": row.get("configuration_sha256"),
            "candidate_provenance_sha256": row.get(
                "candidate_provenance_sha256"
            ),
        }
        if row.get("route") == "canonical":
            fields = {
                "schema", "event_id", "event_sha256", "idempotency_key",
                "disposition", "sink_identity_sha256", "canonical_ledger_sha256",
                "configuration_sha256", "candidate_provenance_sha256",
            }
            if (
                set(receipt) != fields
                or receipt.get("schema") != "memory-canonical-sink-receipt/v1"
                or receipt.get("event_id") != row.get("event_id")
                or receipt.get("event_sha256") != row.get("event_sha256")
                or receipt.get("disposition") != "present"
                or receipt.get("sink_identity_sha256")
                != self._state.configuration.get("canonical_sink_identity_sha256")
                or any(receipt.get(field) != value for field, value in common.items())
            ):
                raise ControlledWriteCorruption(
                    "journal canonical sink receipt is stale"
                )
        else:
            fields = {
                "schema", "event_ref", "idempotency_key", "sink_identity_sha256",
                "configuration_sha256", "candidate_provenance_sha256",
                "canonical_ledger_sha256",
            }
            if (
                set(receipt) != fields
                or receipt.get("schema") != "memory-protected-store-receipt/v1"
                or receipt.get("sink_identity_sha256")
                != self._state.configuration.get("protected_store_identity_sha256")
                or any(receipt.get(field) != value for field, value in common.items())
            ):
                raise ControlledWriteCorruption(
                    "journal protected-store receipt is stale"
                )
            try:
                ref = EventRef.from_dict(receipt.get("event_ref"))
            except MemoryStoreError as exc:
                raise ControlledWriteCorruption(
                    "journal protected-store receipt has an invalid event reference"
                ) from exc
            if ref.event_id != row.get("event_id"):
                raise ControlledWriteCorruption(
                    "journal protected-store receipt names another event"
                )

    @staticmethod
    def _retirement_request(value: Any) -> tuple[dict[str, Any], list[EventRef]]:
        fields = {
            "schema",
            "transition_id",
            "expected_head",
            "reason",
            "submitted_at",
            "retired_events",
            "proof_sha256",
            "proof_canonical_json",
        }
        if not isinstance(value, Mapping) or set(value) != fields:
            raise ControlledWriteCorruption("retirement request has an open shape")
        request = copy.deepcopy(dict(value))
        if (
            request.get("schema") != "memory-controlled-retirement-request/v1"
            or not isinstance(request.get("transition_id"), str)
            or _RETIREMENT_RE.fullmatch(request["transition_id"]) is None
            or not isinstance(request.get("expected_head"), str)
            or _HASH_RE.fullmatch(request["expected_head"]) is None
            or request.get("reason") not in {"purged", "expired"}
            or not isinstance(request.get("submitted_at"), str)
        ):
            raise ControlledWriteCorruption("retirement request identity is invalid")
        try:
            parse_aware_datetime(request["submitted_at"])
        except Exception as exc:
            raise ControlledWriteCorruption("retirement submitted_at is invalid") from exc
        proof_text = request.get("proof_canonical_json")
        if not isinstance(proof_text, str):
            raise ControlledWriteCorruption("retirement proof is absent")
        proof = _strict_object(proof_text, label="retirement proof")
        if (
            not isinstance(request.get("proof_sha256"), str)
            or _HASH_RE.fullmatch(request["proof_sha256"]) is None
            or _sha(proof) != request["proof_sha256"]
        ):
            raise ControlledWriteCorruption("retirement proof commitment is stale")
        rows = request.get("retired_events")
        if not isinstance(rows, list) or not rows:
            raise ControlledWriteCorruption("retirement scope must be non-empty")
        refs: list[EventRef] = []
        normalized: list[dict[str, Any]] = []
        for row in rows:
            if not isinstance(row, Mapping) or set(row) != {
                "event_id",
                "event_sha256",
                "event_ref",
            }:
                raise ControlledWriteCorruption("retirement event pointer is invalid")
            try:
                ref = EventRef.from_dict(row["event_ref"])
            except MemoryStoreError as exc:
                raise ControlledWriteCorruption(
                    "retirement event reference is invalid"
                ) from exc
            if (
                row.get("event_id") != ref.event_id
                or not isinstance(row.get("event_sha256"), str)
                or _HASH_RE.fullmatch(row["event_sha256"]) is None
            ):
                raise ControlledWriteCorruption(
                    "retirement event identity does not match its exact reference"
                )
            refs.append(ref)
            normalized.append(copy.deepcopy(dict(row)))
        if normalized != sorted(normalized, key=lambda item: item["event_id"]) or len(
            {item["event_id"] for item in normalized}
        ) != len(normalized):
            raise ControlledWriteCorruption(
                "retirement event pointers must be sorted and unique"
            )
        return request, refs

    def _retirement_attestation(
        self, request: Mapping[str, Any], *, principal: object | None
    ) -> dict[str, Any]:
        if (
            self._retirement_proof_verifier is None
            or self._retirement_proof_verifier_id is None
        ):
            raise AuthorizationDenied("retirement proof verification is not configured")
        try:
            value = self._retirement_proof_verifier(
                request=copy.deepcopy(dict(request)), principal=principal
            )
        except Exception as exc:
            raise AuthorizationDenied("retirement proof verification failed") from exc
        fields = {
            "schema",
            "verifier_id",
            "request_sha256",
            "retired_scope_sha256",
            "proof_sha256",
            "status",
            "verified_at",
            "signature",
        }
        if not isinstance(value, Mapping) or set(value) != fields:
            raise ControlledWriteCorruption("retirement attestation has an open shape")
        attestation = copy.deepcopy(dict(value))
        scope_sha = _sha(request["retired_events"])
        if (
            attestation.get("schema")
            != "memory-retirement-proof-attestation/v1"
            or attestation.get("verifier_id") != self._retirement_proof_verifier_id
            or attestation.get("request_sha256") != _sha(request)
            or attestation.get("retired_scope_sha256") != scope_sha
            or attestation.get("proof_sha256") != request.get("proof_sha256")
            or attestation.get("status") != "verified"
            or not isinstance(attestation.get("verified_at"), str)
            or not isinstance(attestation.get("signature"), str)
            or not (16 <= len(attestation["signature"]) <= 8192)
        ):
            raise ControlledWriteCorruption("retirement attestation is invalid or stale")
        try:
            parse_aware_datetime(attestation["verified_at"])
        except Exception as exc:
            raise ControlledWriteCorruption(
                "retirement attestation verified_at is invalid"
            ) from exc
        return attestation

    def _retirement_authorized(
        self, request: Mapping[str, Any], principal: object | None
    ) -> bool:
        if self._authorize_retirement is None:
            return False
        try:
            return self._authorize_retirement(request, principal) is True
        except Exception:
            return False

    def _validate_retirement_row(self, row: Mapping[str, Any]) -> None:
        if (
            set(row) != _RETIREMENT_JOURNAL_KEYS
            or row.get("schema") != RETIREMENT_JOURNAL_SCHEMA
            or row.get("phase") not in {"prepare", "commit"}
            or not isinstance(row.get("transition_id"), str)
            or _RETIREMENT_RE.fullmatch(row["transition_id"]) is None
            or row.get("configuration_sha256") != self._state.configuration_sha256
            or type(row.get("sequence")) is not int
            or row["sequence"] < 1
        ):
            raise ControlledWriteCorruption("retirement journal row is invalid")
        for field in (
            "prior_head",
            "prior_canonical_ledger_sha256",
            "request_sha256",
            "event_sha256",
            "candidate_provenance_sha256",
        ):
            if not isinstance(row.get(field), str) or _HASH_RE.fullmatch(row[field]) is None:
                raise ControlledWriteCorruption(
                    f"retirement journal {field} is invalid"
                )
        request_text = row.get("request_canonical_json")
        attestation_text = row.get("candidate_provenance_canonical_json")
        if not isinstance(request_text, str) or not isinstance(attestation_text, str):
            raise ControlledWriteCorruption("retirement journal evidence is absent")
        request, _refs = self._retirement_request(
            _strict_object(request_text, label="journal retirement request")
        )
        attestation = _strict_object(
            attestation_text, label="journal retirement attestation"
        )
        if (
            request["transition_id"] != row["transition_id"]
            or _sha(request) != row["request_sha256"]
            or _sha(request["retired_events"]) != row["event_sha256"]
            or _sha(attestation) != row["candidate_provenance_sha256"]
            or attestation.get("request_sha256") != row["request_sha256"]
            or attestation.get("retired_scope_sha256") != row["event_sha256"]
            or attestation.get("proof_sha256") != request["proof_sha256"]
            or attestation.get("verifier_id") != self._retirement_proof_verifier_id
            or attestation.get("status") != "verified"
        ):
            raise ControlledWriteCorruption(
                "retirement journal commitments are stale"
            )
        if row["phase"] == "prepare":
            if any(
                row.get(field) is not None
                for field in (
                    "sink_receipt_sha256",
                    "sink_receipt_canonical_json",
                    "new_head",
                    "result_canonical_json",
                    "result_sha256",
                )
            ):
                raise ControlledWriteCorruption(
                    "retirement prepare contains terminal fields"
                )
            return
        for field in (
            "sink_receipt_sha256",
            "new_head",
            "result_sha256",
        ):
            if not isinstance(row.get(field), str) or _HASH_RE.fullmatch(row[field]) is None:
                raise ControlledWriteCorruption(
                    f"retirement commit {field} is invalid"
                )
        receipt_text = row.get("sink_receipt_canonical_json")
        result_text = row.get("result_canonical_json")
        if not isinstance(receipt_text, str) or not isinstance(result_text, str):
            raise ControlledWriteCorruption("retirement commit body is absent")
        receipt = _strict_object(receipt_text, label="retirement sink receipt")
        result = _strict_object(result_text, label="retirement result")
        expected_receipt = {
            "schema": "memory-controlled-retirement-receipt/v1",
            "transition_id": row["transition_id"],
            "request_sha256": row["request_sha256"],
            "retired_scope_sha256": row["event_sha256"],
            "attestation_sha256": row["candidate_provenance_sha256"],
            "configuration_sha256": row["configuration_sha256"],
            "canonical_ledger_sha256": receipt.get("canonical_ledger_sha256"),
        }
        expected_transition = self._head_transition(row, receipt)
        result_fields = {
            "schema",
            "transition_id",
            "request_sha256",
            "reason",
            "disposition",
            "sequence",
            "prior_head",
            "new_head",
            "retired_events",
            "proof_sha256",
            "attestation_sha256",
            "completed_at",
        }
        if (
            receipt != expected_receipt
            or _sha(receipt) != row["sink_receipt_sha256"]
            or _sha(result) != row["result_sha256"]
            or set(result) != result_fields
            or result.get("schema") != "memory-controlled-retirement-result/v1"
            or result.get("new_head") != row["new_head"]
            or row["new_head"] != expected_transition["new_head"]
            or result.get("transition_id") != row["transition_id"]
            or result.get("request_sha256") != row["request_sha256"]
            or result.get("reason") != request["reason"]
            or result.get("disposition") not in {"committed", "recovered"}
            or result.get("sequence") != row["sequence"]
            or result.get("prior_head") != row["prior_head"]
            or result.get("retired_events") != request["retired_events"]
            or result.get("proof_sha256") != request["proof_sha256"]
            or result.get("attestation_sha256")
            != row["candidate_provenance_sha256"]
            or not isinstance(result.get("completed_at"), str)
        ):
            raise ControlledWriteCorruption("retirement terminal commitment is stale")

    def _journal_state(self, *, repair: bool = False) -> dict[str, Any]:
        rows = self._state.rows(self._state.journal, repair=repair)
        prepares: dict[str, Mapping[str, Any]] = {}
        terminal: dict[str, Mapping[str, Any]] = {}
        commits: list[Mapping[str, Any]] = []
        chain_commits: list[Mapping[str, Any]] = []
        seen_ids: set[str] = set()
        for row in rows:
            schema = row.get("schema")
            if schema == JOURNAL_SCHEMA:
                self._validate_journal_row(row)
                identity = "write:" + str(row.get("request_id"))
                is_prepare = row["phase"] == "prepare"
                advances = row["phase"] == "commit"
            elif schema == RETIREMENT_JOURNAL_SCHEMA:
                self._validate_retirement_row(row)
                identity = "retirement:" + str(row.get("transition_id"))
                is_prepare = row["phase"] == "prepare"
                advances = row["phase"] == "commit"
            else:
                raise ControlledWriteCorruption("journal row schema is unsupported")
            journal_id = row.get("journal_id")
            if not isinstance(journal_id, str) or journal_id in seen_ids:
                raise ControlledWriteCorruption("journal_id is absent or duplicated")
            seen_ids.add(journal_id)
            if is_prepare:
                if identity in prepares:
                    raise ControlledWriteCorruption("journal operation has multiple prepares")
                prepares[identity] = row
            else:
                if identity not in prepares or identity in terminal:
                    raise ControlledWriteCorruption("journal terminal has no unique prepare")
                terminal[identity] = row
                if advances:
                    chain_commits.append(row)
                if schema == JOURNAL_SCHEMA and row["phase"] == "commit":
                    commits.append(row)
        head = GENESIS_HEAD
        sequence = 0
        idempotency: dict[str, tuple[str, Mapping[str, Any]]] = {}
        event_ids: dict[str, str] = {}
        retirements: dict[str, Mapping[str, Any]] = {}
        retirement_transitions: dict[str, tuple[str, Mapping[str, Any]]] = {}
        for row in chain_commits:
            sequence += 1
            if row["sequence"] != sequence or row["prior_head"] != head:
                raise ControlledWriteCorruption("commit chain sequence/head is discontinuous")
            result = _strict_object(
                row["result_canonical_json"], label="journal result"
            )
            if result.get("sequence") != sequence or result.get("prior_head") != head:
                raise ControlledWriteCorruption("journal result does not match its commit")
            head = result["new_head"]
            if row["schema"] == RETIREMENT_JOURNAL_SCHEMA:
                request = _strict_object(
                    row["request_canonical_json"], label="journal retirement request"
                )
                for retired in request["retired_events"]:
                    event_id = retired["event_id"]
                    if event_ids.get(event_id) != retired["event_sha256"]:
                        raise ControlledWriteCorruption(
                            "retirement does not name an exact earlier controlled commit"
                        )
                    if event_id in retirements:
                        raise ControlledWriteCorruption(
                            "controlled event has multiple retirement transitions"
                        )
                    retirements[event_id] = copy.deepcopy(dict(retired))
                transition_id = row["transition_id"]
                if transition_id in retirement_transitions:
                    raise ControlledWriteCorruption(
                        "retirement transition has multiple commits"
                    )
                retirement_transitions[transition_id] = (
                    row["request_sha256"],
                    result,
                )
                continue
            key = row["idempotency_key"]
            if key in idempotency:
                raise ControlledWriteCorruption("idempotency key has multiple commits")
            idempotency[key] = (row["request_sha256"], result)
            event_id = row["event_id"]
            if event_id in event_ids and event_ids[event_id] != row["event_sha256"]:
                raise ControlledWriteCorruption("event ID has conflicting committed hashes")
            event_ids[event_id] = row["event_sha256"]
        pending = [row for identity, row in prepares.items() if identity not in terminal]
        return {
            "rows": rows,
            "prepares": prepares,
            "terminal": terminal,
            "pending": sorted(pending, key=lambda row: row["sequence"]),
            "commits": commits,
            "chain_commits": chain_commits,
            "head": head,
            "sequence": sequence,
            "idempotency": idempotency,
            "event_ids": event_ids,
            "retirements": retirements,
            "retirement_transitions": retirement_transitions,
        }

    def _assert_anchor_state(
        self,
        state: Mapping[str, Any],
        *,
        allow_advanced_pending: bool,
        principal: object | None = None,
        retired_overrides: Mapping[str, str] | None = None,
    ) -> Mapping[str, Any]:
        anchor = self._canonical_sink.controlled_head()
        current_ledger_sha256 = self._canonical_sink.content_sha256()
        if (
            anchor.get("sequence") == state.get("sequence")
            and anchor.get("head") == state.get("head")
        ):
            if not state.get("pending") and anchor.get(
                "canonical_ledger_sha256"
            ) != current_ledger_sha256:
                raise ControlledWriteCorruption(
                    "canonical sink ledger bytes differ from the durable head"
                )
            self._verify_committed_sink_refs(
                state,
                principal=principal,
                retired_overrides=retired_overrides,
            )
            return anchor
        pending = state.get("pending")
        if (
            allow_advanced_pending
            and isinstance(pending, list)
            and len(pending) == 1
            and isinstance(anchor.get("transition"), Mapping)
        ):
            prepare = pending[0]
            transition = anchor["transition"]
            exact = {
                "coordinator_id": self._state.coordinator_id,
                "configuration_sha256": prepare["configuration_sha256"],
                "sequence": prepare["sequence"],
                "prior_head": prepare["prior_head"],
                "prior_canonical_ledger_sha256": prepare[
                    "prior_canonical_ledger_sha256"
                ],
                "request_sha256": prepare["request_sha256"],
                "event_sha256": prepare["event_sha256"],
                "candidate_provenance_sha256": prepare[
                    "candidate_provenance_sha256"
                ],
            }
            if (
                anchor.get("sequence") == state.get("sequence", 0) + 1
                and anchor.get("canonical_ledger_sha256")
                == current_ledger_sha256
                and all(transition.get(field) == value for field, value in exact.items())
            ):
                self._verify_committed_sink_refs(
                    state,
                    principal=principal,
                    retired_overrides=retired_overrides,
                )
                return anchor
        raise ControlledWriteCorruption(
            "writer journal head differs from the durable sink controlled-head anchor"
        )

    def _verify_committed_sink_refs(
        self,
        state: Mapping[str, Any],
        *,
        principal: object | None,
        retired_overrides: Mapping[str, str] | None = None,
    ) -> None:
        retired = {
            event_id: item["event_sha256"]
            for event_id, item in state.get("retirements", {}).items()
        }
        if retired_overrides:
            for event_id, event_sha in retired_overrides.items():
                prior = retired.get(event_id)
                if prior is not None and prior != event_sha:
                    raise ControlledWriteCorruption(
                        "retirement override conflicts with committed history"
                    )
                retired[event_id] = event_sha
        for row in state.get("commits", []):
            if retired.get(row["event_id"]) == row["event_sha256"]:
                continue
            self._committed_event(row, principal=principal)

    def _committed_event(
        self, row: Mapping[str, Any], *, principal: object | None
    ) -> Mapping[str, Any]:
        receipt = _strict_object(
            row["sink_receipt_canonical_json"], label="journal sink receipt"
        )
        if row.get("route") == "canonical":
            stored = self._canonical_sink.find_event(row["event_id"])
            if stored is None or _sha(stored) != row["event_sha256"]:
                raise ControlledWriteCorruption(
                    "committed canonical event is no longer exactly resolvable"
                )
            return stored
        if self._memory_store is None:
            raise ControlledWriteCorruption(
                "committed protected event has no configured store"
            )
        try:
            ref = EventRef.from_dict(receipt["event_ref"])
            stored = self._memory_store.read_event(ref, principal=principal)
        except MemoryStoreError as exc:
            raise ControlledWriteCorruption(
                "committed protected event is no longer exactly resolvable"
            ) from exc
        if _sha(stored) != row["event_sha256"]:
            raise ControlledWriteCorruption(
                "committed protected event bytes differ from the journal"
            )
        return stored

    def _controlled_branch_errors(
        self,
        event: Mapping[str, Any],
        state: Mapping[str, Any],
        *,
        principal: object | None,
    ) -> list[str]:
        targets = set(event.get("supersedes", []))
        if not targets:
            return []
        for row in state.get("commits", []):
            if targets.intersection(row.get("event_supersedes", [])):
                return [
                    "supersedes — target already has a controlled successor"
                ]
        return []

    def _validate_retirement_scope(
        self,
        request: Mapping[str, Any],
        refs: Sequence[EventRef],
        state: Mapping[str, Any],
    ) -> dict[str, str]:
        commits = {row["event_id"]: row for row in state.get("commits", [])}
        scope: dict[str, str] = {}
        for pointer, ref in zip(request["retired_events"], refs):
            row = commits.get(ref.event_id)
            if (
                row is None
                or row.get("route") != "protected-store"
                or row.get("event_sha256") != pointer["event_sha256"]
            ):
                raise ControlledWriteCorruption(
                    "retirement scope is not an exact protected controlled commit"
                )
            receipt = _strict_object(
                row["sink_receipt_canonical_json"],
                label="committed protected-store receipt",
            )
            try:
                committed_ref = EventRef.from_dict(receipt["event_ref"])
            except (KeyError, MemoryStoreError) as exc:
                raise ControlledWriteCorruption(
                    "committed protected-store reference is invalid"
                ) from exc
            if committed_ref != ref:
                raise ControlledWriteCorruption(
                    "retirement scope differs from the committed exact reference"
                )
            if ref.event_id in state.get("retirements", {}):
                raise ControlledWriteCorruption(
                    "controlled event is already retired by another transition"
                )
            scope[ref.event_id] = pointer["event_sha256"]

        proof = _strict_object(
            request["proof_canonical_json"], label="retirement proof"
        )
        if request["reason"] == "purged":
            if set(proof) != {"schema", "purge_receipt"} or proof.get(
                "schema"
            ) != "memory-purge-retirement-proof/v1":
                raise ControlledWriteCorruption("purge retirement proof is invalid")
            receipt = proof.get("purge_receipt")
            try:
                parsed_receipt = PurgeReceipt.from_dict(receipt)
            except MemoryStoreError as exc:
                raise ControlledWriteCorruption(
                    "purge retirement receipt is invalid"
                ) from exc
            removed_scope = dict(parsed_receipt.removed_events)
            if removed_scope != scope:
                raise ControlledWriteCorruption(
                    "purge receipt does not exactly cover the retirement scope"
                )
            if not parsed_receipt.tombstones:
                raise ControlledWriteCorruption(
                    "purge retirement proof has no policy-safe tombstone"
                )
        else:
            if set(proof) != {
                "schema",
                "expired_at",
                "retain_until_by_event",
            } or proof.get("schema") != "memory-expiry-retirement-proof/v1":
                raise ControlledWriteCorruption("expiry retirement proof is invalid")
            expired_at = proof.get("expired_at")
            try:
                expiry_proven_at = parse_aware_datetime(expired_at)
            except Exception as exc:
                raise ControlledWriteCorruption(
                    "expiry proof timestamp is invalid"
                ) from exc
            now = self._clock()
            if not isinstance(now, dt.datetime) or now.tzinfo is None:
                raise ControlledWriteCorruption(
                    "clock must return a timezone-aware datetime"
                )
            now_utc = now.astimezone(dt.timezone.utc)
            if expiry_proven_at > now_utc:
                raise ControlledWriteCorruption("expiry proof is from the future")
            expected_expiries: list[dict[str, str]] = []
            for ref in refs:
                if ref.policy.retention != "expires" or ref.policy.retain_until is None:
                    raise ControlledWriteCorruption(
                        "expiry transition names a non-expiring event"
                    )
                retain_until = parse_aware_datetime(ref.policy.retain_until)
                if now_utc < retain_until or expiry_proven_at < retain_until:
                    raise ControlledWriteCorruption(
                        "expiry transition was requested before retain_until"
                    )
                expected_expiries.append(
                    {
                        "event_id": ref.event_id,
                        "retain_until": ref.policy.retain_until,
                    }
                )
            if proof.get("retain_until_by_event") != expected_expiries:
                raise ControlledWriteCorruption(
                    "expiry proof does not exactly cover the retirement scope"
                )
        return scope

    def _retirement_prepare(
        self,
        request: Mapping[str, Any],
        attestation: Mapping[str, Any],
        state: Mapping[str, Any],
    ) -> dict[str, Any]:
        return {
            "schema": RETIREMENT_JOURNAL_SCHEMA,
            "journal_id": "retirement-prepare:" + request["transition_id"],
            "phase": "prepare",
            "transition_id": request["transition_id"],
            "configuration_sha256": self._state.configuration_sha256,
            "sequence": int(state["sequence"]) + 1,
            "prior_head": state["head"],
            "prior_canonical_ledger_sha256": self._canonical_sink.content_sha256(),
            "request_sha256": _sha(request),
            "request_canonical_json": canonical_json_bytes(request).decode("utf-8"),
            "event_sha256": _sha(request["retired_events"]),
            "candidate_provenance_sha256": _sha(attestation),
            "candidate_provenance_canonical_json": canonical_json_bytes(
                attestation
            ).decode("utf-8"),
            "sink_receipt_sha256": None,
            "sink_receipt_canonical_json": None,
            "new_head": None,
            "result_canonical_json": None,
            "result_sha256": None,
            "recorded_at": _now_text(self._clock),
        }

    def _retirement_sink_receipt(
        self, prepare: Mapping[str, Any]
    ) -> dict[str, Any]:
        return {
            "schema": "memory-controlled-retirement-receipt/v1",
            "transition_id": prepare["transition_id"],
            "request_sha256": prepare["request_sha256"],
            "retired_scope_sha256": prepare["event_sha256"],
            "attestation_sha256": prepare["candidate_provenance_sha256"],
            "configuration_sha256": prepare["configuration_sha256"],
            "canonical_ledger_sha256": self._canonical_sink.content_sha256(),
        }

    def _retirement_commit(
        self,
        prepare: Mapping[str, Any],
        receipt: Mapping[str, Any],
        transition: Mapping[str, Any],
        *,
        disposition: str,
    ) -> dict[str, Any]:
        expected = self._head_transition(prepare, receipt)
        if transition != expected:
            raise ControlledWriteCorruption(
                "retirement commit transition differs from the sink head"
            )
        request = _strict_object(
            prepare["request_canonical_json"], label="prepared retirement request"
        )
        result = {
            "schema": "memory-controlled-retirement-result/v1",
            "transition_id": prepare["transition_id"],
            "request_sha256": prepare["request_sha256"],
            "reason": request["reason"],
            "disposition": disposition,
            "sequence": prepare["sequence"],
            "prior_head": prepare["prior_head"],
            "new_head": transition["new_head"],
            "retired_events": copy.deepcopy(request["retired_events"]),
            "proof_sha256": request["proof_sha256"],
            "attestation_sha256": prepare["candidate_provenance_sha256"],
            "completed_at": _now_text(self._clock),
        }
        row = {
            **dict(prepare),
            "journal_id": "retirement-commit:" + prepare["transition_id"],
            "phase": "commit",
            "sink_receipt_sha256": _sha(receipt),
            "sink_receipt_canonical_json": canonical_json_bytes(receipt).decode(
                "utf-8"
            ),
            "new_head": transition["new_head"],
            "result_canonical_json": canonical_json_bytes(result).decode("utf-8"),
            "result_sha256": _sha(result),
            "recorded_at": _now_text(self._clock),
        }
        self._validate_retirement_row(row)
        self._state.append(
            self._state.journal,
            row,
            key="journal_id",
            value=row["journal_id"],
        )
        return result

    def reconcile_retirement(
        self, request: Mapping[str, Any], *, principal: object | None = None
    ) -> dict[str, Any]:
        """Advance the controlled head over a verified purge or elapsed expiry.

        The proof verifier is the signed-checkpoint trust boundary. The writer binds its
        attestation to exact earlier protected-store refs and never treats an unexplained
        missing ref as retired.
        """

        request_copy, refs = self._retirement_request(request)
        if not self._retirement_authorized(request_copy, principal):
            raise AuthorizationDenied(
                "retirement authorization denied before state or store access"
            )
        with (
            self._process_guard,
            self._canonical_sink.coordinated(
                self._state.coordinator_id, self._state.configuration_sha256
            ),
            self._store_coordinated(),
            self._state.locked(),
        ):
            state = self._journal_state()
            prior = state["retirement_transitions"].get(request_copy["transition_id"])
            if prior is not None:
                if prior[0] != _sha(request_copy):
                    raise ControlledWriteCorruption(
                        "retirement transition ID already committed different bytes"
                    )
                replay = copy.deepcopy(dict(prior[1]))
                replay["disposition"] = "replayed"
                replay["completed_at"] = _now_text(self._clock)
                return replay
            if state["pending"]:
                raise RecoveryRequired(
                    "a prepared write or retirement must be recovered first"
                )
            if request_copy["expected_head"] != state["head"]:
                raise ControlledWriteCorruption(
                    "retirement expected_head differs from the committed head"
                )
            scope = self._validate_retirement_scope(request_copy, refs, state)
            attestation = self._retirement_attestation(
                request_copy, principal=principal
            )
            self._assert_anchor_state(
                state,
                allow_advanced_pending=False,
                principal=principal,
                retired_overrides=scope,
            )
            prepare = self._retirement_prepare(request_copy, attestation, state)
            self._validate_retirement_row(prepare)
            self._state.append(
                self._state.journal,
                prepare,
                key="journal_id",
                value=prepare["journal_id"],
            )
            self._fault("after_retirement_prepare")
            receipt = self._retirement_sink_receipt(prepare)
            transition = self._head_transition(prepare, receipt)
            self._canonical_sink.advance_head(transition)
            self._fault("after_retirement_head_advance")
            result = self._retirement_commit(
                prepare,
                receipt,
                transition,
                disposition="committed",
            )
            self._fault("after_retirement_commit")
            return result

    def current_head(self, *, principal: object | None = None) -> str:
        with (
            self._process_guard,
            self._canonical_sink.coordinated(
                self._state.coordinator_id, self._state.configuration_sha256
            ),
            self._store_coordinated(),
            self._state.locked(),
        ):
            state = self._journal_state()
            if any(
                row.get("schema") == RETIREMENT_JOURNAL_SCHEMA
                for row in state["pending"]
            ):
                raise RecoveryRequired(
                    "a retirement transition requires authorized recovery"
                )
            anchor = self._assert_anchor_state(
                state, allow_advanced_pending=True, principal=principal
            )
            if state["pending"] or anchor["sequence"] != state["sequence"]:
                raise RecoveryRequired(
                    "controlled head advanced but its journal commit requires recovery"
                )
            return str(state["head"])

    def _result(
        self,
        *,
        request: Mapping[str, Any],
        request_sha256: str,
        disposition: str,
        route: str,
        sequence: int,
        prior_head: str,
        new_head: str,
        event: Mapping[str, Any] | None,
        sink_receipt_sha256: str | None,
        dead_letter_id: str | None,
        candidate_provenance_sha256: str | None = None,
        candidate_provenance: Mapping[str, Any] | None = None,
        original_result_sha256: str | None = None,
    ) -> dict[str, Any]:
        request_id = request.get("request_id")
        idempotency_key = request.get("idempotency_key")
        operation = request.get("operation")
        event_id = event.get("event_id") if isinstance(event, Mapping) else None
        event_is_named = isinstance(event_id, str) and _EVENT_RE.fullmatch(event_id) is not None
        result = {
            "schema": RESULT_SCHEMA,
            "request_id": (
                request_id
                if isinstance(request_id, str) and _REQUEST_RE.fullmatch(request_id)
                else None
            ),
            "idempotency_key": (
                idempotency_key
                if isinstance(idempotency_key, str) and 8 <= len(idempotency_key) <= 128
                else None
            ),
            "request_sha256": request_sha256,
            "operation": operation if operation in {
                "claim-append", "claim-correction", "feedback-promotion", "feedback-correction"
            } else "unknown",
            "disposition": disposition,
            "route": route,
            "sequence": sequence,
            "prior_head": prior_head,
            "new_head": new_head,
            "event_id": event_id if event_is_named else None,
            "event_sha256": _sha(event) if event_is_named else None,
            "sink_receipt_sha256": sink_receipt_sha256,
            "candidate_provenance_sha256": candidate_provenance_sha256,
            "candidate_provenance": (
                copy.deepcopy(dict(candidate_provenance))
                if isinstance(candidate_provenance, Mapping)
                else None
            ),
            "dead_letter_id": dead_letter_id,
            "original_result_sha256": original_result_sha256,
            "completed_at": _now_text(self._clock),
        }
        errors = validate_write_result(result)
        if errors:
            raise ControlledWriteCorruption("constructed result is invalid: " + "; ".join(errors[:8]))
        return result

    def _denied_result(
        self,
        request: Mapping[str, Any],
        request_sha256: str,
        event: Mapping[str, Any] | None,
        route: str,
        state: Mapping[str, Any],
    ) -> dict[str, Any]:
        return self._result(
            request=request,
            request_sha256=request_sha256,
            disposition="rejected",
            route=route,
            sequence=int(state["sequence"]),
            prior_head=str(state["head"]),
            new_head=str(state["head"]),
            event=event,
            sink_receipt_sha256=None,
            dead_letter_id=None,
        )

    def _dead_letter(
        self,
        request: Mapping[str, Any],
        *,
        request_sha256: str,
        event: Mapping[str, Any] | None,
        route: str,
        reason_code: str,
        reason: str,
        retryable: bool,
        disposition: str,
        state: Mapping[str, Any],
    ) -> dict[str, Any]:
        dead_id = "dead-letter_" + canonical_sha256(
            {
                "request_sha256": request_sha256,
                "reason_code": reason_code,
                "head": state["head"],
            }
        )[:32]
        del reason  # persisted diagnostics are closed code-derived summaries, never caller text
        if reason_code not in _DEAD_LETTER_REASONS:
            raise ControlledWriteCorruption("dead-letter reason code has no sanitized summary")
        request_id = request.get("request_id")
        idempotency_key = request.get("idempotency_key")
        event_id = event.get("event_id") if isinstance(event, Mapping) else None
        row = {
            "schema": DEAD_LETTER_SCHEMA,
            "dead_letter_id": dead_id,
            "request_id": (
                request_id
                if isinstance(request_id, str) and _REQUEST_RE.fullmatch(request_id)
                else None
            ),
            "idempotency_key": (
                idempotency_key
                if isinstance(idempotency_key, str) and _IDEMPOTENCY_RE.fullmatch(idempotency_key)
                else None
            ),
            "request_sha256": request_sha256,
            "event_id": (
                event_id
                if isinstance(event_id, str) and _EVENT_RE.fullmatch(event_id)
                else None
            ),
            "route": route,
            "reason_code": reason_code,
            "reason": _DEAD_LETTER_REASONS[reason_code],
            "retryable": retryable,
            "quarantined": True,
            "payload_retained": False,
            "received_at": _now_text(self._clock),
        }
        errors = validate_dead_letter(row)
        if errors:
            raise ControlledWriteCorruption(
                "constructed dead letter is invalid: " + "; ".join(errors[:8])
            )
        self._state.append(
            self._state.dead_letters, row, key="dead_letter_id", value=dead_id
        )
        return self._result(
            request=request,
            request_sha256=request_sha256,
            disposition=disposition,
            route=route,
            sequence=int(state["sequence"]),
            prior_head=str(state["head"]),
            new_head=str(state["head"]),
            event=event,
            sink_receipt_sha256=None,
            dead_letter_id=dead_id,
        )

    @staticmethod
    def _aad(prepare: Mapping[str, Any]) -> bytes:
        return canonical_json_bytes(
            {
                "schema": JOURNAL_AAD_SCHEMA,
                "request_id": prepare["request_id"],
                "idempotency_key": prepare["idempotency_key"],
                "request_sha256": prepare["request_sha256"],
                "configuration_sha256": prepare["configuration_sha256"],
                "candidate_provenance_sha256": prepare[
                    "candidate_provenance_sha256"
                ],
                "route": prepare["route"],
                "sequence": prepare["sequence"],
                "prior_head": prepare["prior_head"],
                "prior_canonical_ledger_sha256": prepare[
                    "prior_canonical_ledger_sha256"
                ],
                "event_id": prepare["event_id"],
                "event_sha256": prepare["event_sha256"],
            }
        )

    def _prepare_row(
        self,
        request: Mapping[str, Any],
        *,
        request_sha256: str,
        event: Mapping[str, Any],
        route: str,
        state: Mapping[str, Any],
        candidate_provenance: Mapping[str, Any],
        candidate_provenance_sha256: str,
    ) -> Mapping[str, Any]:
        sequence = int(state["sequence"]) + 1
        base: dict[str, Any] = {
            "schema": JOURNAL_SCHEMA,
            "journal_id": "prepare:" + str(request["request_id"]),
            "phase": "prepare",
            "request_id": request["request_id"],
            "idempotency_key": request["idempotency_key"],
            "request_sha256": request_sha256,
            "configuration_sha256": self._state.configuration_sha256,
            "candidate_provenance_sha256": candidate_provenance_sha256,
            "candidate_provenance_canonical_json": canonical_json_bytes(
                candidate_provenance
            ).decode("utf-8"),
            "route": route,
            "sequence": sequence,
            "prior_head": state["head"],
            "prior_canonical_ledger_sha256": self._canonical_sink.content_sha256(),
            "event_id": event["event_id"],
            "event_sha256": _sha(event),
            "event_supersedes": list(event.get("supersedes", [])),
            "body_encoding": None,
            "body_sha256": request_sha256,
            "body_canonical_json": None,
            "body_ciphertext": None,
            "key_ref": None,
            "aad_sha256": None,
            "sink_receipt_sha256": None,
            "sink_receipt_canonical_json": None,
            "result_canonical_json": None,
            "result_sha256": None,
            "recorded_at": _now_text(self._clock),
        }
        body = canonical_json_bytes(request)
        if route == "canonical":
            base["body_encoding"] = "plaintext"
            base["body_canonical_json"] = body.decode("utf-8")
        else:
            if self._journal_cipher is None:
                raise Phase5ContractError(
                    "external-route recovery journal requires an authenticated cipher"
                )
            base["body_encoding"] = "ciphertext"
            key_ref = "journal-key_" + request_sha256[7:] + ".json"
            base["key_ref"] = key_ref
            aad = self._aad(base)
            try:
                sealed = self._journal_cipher.encrypt(body, associated_data=aad)
            except (MemoryCryptoError, TypeError, ValueError) as exc:
                raise ControlledWriteCorruption("journal encryption failed") from exc
            if not isinstance(sealed, EncryptedObject) or not isinstance(sealed.ciphertext, bytes):
                raise ControlledWriteCorruption("journal cipher returned an unsupported object")
            base["body_ciphertext"] = _b64url(sealed.ciphertext)
            base["aad_sha256"] = _sha(json.loads(aad.decode("utf-8")))
            self._state.write_key(key_ref, sealed.key_envelope)
        try:
            self._validate_journal_row(base)
        except BaseException:
            if base.get("key_ref") is not None:
                self._state.delete_key(base["key_ref"])
            raise
        return base

    def _load_prepared_request(self, prepare: Mapping[str, Any]) -> Mapping[str, Any]:
        if prepare["body_encoding"] == "plaintext":
            body = prepare["body_canonical_json"].encode("utf-8")
        else:
            if self._journal_cipher is None:
                raise RecoveryRequired("journal cipher is required to recover external write")
            envelope = dict(self._state.read_key(prepare["key_ref"]))
            aad = self._aad(prepare)
            if _sha(json.loads(aad.decode("utf-8"))) != prepare["aad_sha256"]:
                raise ControlledWriteCorruption("journal AAD commitment is stale")
            try:
                body = self._journal_cipher.decrypt(
                    _b64url_decode(prepare["body_ciphertext"]),
                    envelope,
                    associated_data=aad,
                )
            except (MemoryCryptoError, TypeError, ValueError) as exc:
                raise ControlledWriteCorruption("journal recovery authentication failed") from exc
        try:
            text = body.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise ControlledWriteCorruption("prepared request is not UTF-8") from exc
        request = _strict_object(text, label="prepared request")
        if _sha(request) != prepare["request_sha256"]:
            raise ControlledWriteCorruption("prepared request digest is stale")
        return request

    def _resolve_event_id(
        self, event_id: str, *, principal: object | None
    ) -> Mapping[str, Any]:
        candidates: list[Mapping[str, Any]] = []
        canonical = self._canonical_sink.find_event(event_id)
        if canonical is not None:
            candidates.append(canonical)
        if self._memory_store is not None:
            try:
                ref = self._memory_store.find_event(event_id, principal=principal)
            except StoreNotFound:
                pass
            else:
                candidates.append(self._memory_store.read_event(ref, principal=principal))
        try:
            resolved = self._authoritative_event_resolver(event_id, principal)
        except Exception as exc:
            raise Phase5ContractError(
                "authoritative event resolver failed closed"
            ) from exc
        if resolved is not None:
            if not isinstance(resolved, Mapping):
                raise Phase5ContractError(
                    "authoritative event resolver returned a non-event"
                )
            candidates.append(copy.deepcopy(dict(resolved)))
        if len(candidates) != 1:
            raise Phase5ContractError(
                f"event {event_id} is absent or ambiguous across storage lanes"
            )
        candidate = candidates[0]
        if candidate.get("event_id") != event_id or validate_event(candidate):
            raise Phase5ContractError(
                "authoritative event resolver returned invalid canonical event bytes"
            )
        return candidate

    def _target_index(
        self, event: Mapping[str, Any], *, principal: object | None
    ) -> dict[str, Mapping[str, Any]]:
        target_ids = dict.fromkeys(
            [*event.get("derived_from", []), *event.get("supersedes", [])]
        )
        return {
            target_id: self._resolve_event_id(target_id, principal=principal)
            for target_id in target_ids
        }

    @staticmethod
    def _lineage_policy_errors(
        event: Mapping[str, Any], event_index: Mapping[str, Mapping[str, Any]]
    ) -> list[str]:
        errors: list[str] = []
        try:
            child = StoragePolicy.from_event(event)
        except MemoryStoreError:
            return ["candidate policy is invalid"]
        for position, target_id in enumerate(event.get("derived_from", [])):
            target = event_index.get(target_id)
            if not isinstance(target, Mapping):
                errors.append(f"derived_from[{position}] target is absent")
                continue
            try:
                parent = StoragePolicy.from_event(target)
            except MemoryStoreError:
                errors.append(f"derived_from[{position}] target policy is invalid")
                continue
            # V1 deliberately requires equality. Classifications such as licensed and
            # restricted are incomparable entitlements, and source-policy/prohibited-
            # derivative obligations cannot safely be inferred from an ordinal rank.
            if child != parent:
                errors.append(
                    f"derived_from[{position}] must retain the exact parent policy"
                )
        return errors

    def _candidate_provenance(
        self,
        event: Mapping[str, Any],
        event_index: Mapping[str, Mapping[str, Any]],
        *,
        principal: object | None,
    ) -> tuple[dict[str, Any], str]:
        policy_errors = self._lineage_policy_errors(event, event_index)
        if policy_errors:
            raise Phase5ContractError("candidate lineage policy is not admissible")

        evidence_expected: list[tuple[dict[str, str], str]] = []
        for evidence_ref in event.get("evidence_refs", []):
            match = (
                _EVIDENCE_DIGEST_RE.fullmatch(evidence_ref)
                if isinstance(evidence_ref, str)
                else None
            )
            if match is None:
                raise Phase5ContractError("candidate evidence reference is invalid")
            evidence_expected.append(
                ({
                    "evidence_ref_sha256": "sha256:"
                    + hashlib.sha256(evidence_ref.encode("utf-8")).hexdigest(),
                    "content_sha256": "sha256:" + match.group(1),
                }, evidence_ref.split("#", 1)[1])
            )
        evidence_expected.sort(key=lambda item: item[0]["evidence_ref_sha256"])

        lineage_expected: list[dict[str, Any]] = []
        for relation in ("derived_from", "supersedes"):
            for target_id in event.get(relation, []):
                target = event_index.get(target_id)
                if not isinstance(target, Mapping):
                    raise Phase5ContractError("candidate lineage target is absent")
                lineage_expected.append(
                    {
                        "relation": relation,
                        "event_id": target_id,
                        "event_sha256": _sha(target),
                        "policy_sha256": _sha(target.get("policy")),
                        "system_time": _canonical_instant_text(
                            target.get("system_time")
                        ),
                    }
                )
        lineage_expected.sort(key=lambda item: (item["relation"], item["event_id"]))

        domain_lineage_expected: list[dict[str, Any]] = []
        try:
            effective = effective_phase5_event(event, event_index=event_index)
        except Phase5ContractError as exc:
            raise Phase5ContractError("candidate effective payload is invalid") from exc
        effective_payload = effective.get("payload")
        if (
            isinstance(effective_payload, Mapping)
            and effective_payload.get("schema") == "memory-claim/v1"
        ):
            for logical_id in effective_payload.get("derived_from_claims", []):
                candidates: list[tuple[str, Mapping[str, Any]]] = []
                for target_id in event.get("derived_from", []):
                    target = event_index.get(target_id)
                    if not isinstance(target, Mapping):
                        continue
                    try:
                        target_effective = effective_phase5_event(target)
                    except Phase5ContractError:
                        continue
                    target_payload = target_effective.get("payload")
                    if (
                        isinstance(target_payload, Mapping)
                        and target_payload.get("schema") == "memory-claim/v1"
                        and target_payload.get("claim_id") == logical_id
                    ):
                        candidates.append((target_id, target))
                if len(candidates) != 1:
                    raise Phase5ContractError(
                        "claim domain lineage must resolve to exactly one envelope-derived event"
                    )
                target_id, target = candidates[0]
                domain_lineage_expected.append(
                    {
                        "field": "claim.derived_from_claims",
                        "logical_id_sha256": "sha256:"
                        + hashlib.sha256(logical_id.encode("utf-8")).hexdigest(),
                        "target_event_id": target_id,
                        "target_event_sha256": _sha(target),
                        "target_policy_sha256": _sha(target.get("policy")),
                        "target_system_time": _canonical_instant_text(
                            target.get("system_time")
                        ),
                    }
                )
            domain_lineage_expected.sort(
                key=lambda item: (item["field"], item["logical_id_sha256"])
            )
        try:
            attestation = self._candidate_provenance_verifier(
                event=copy.deepcopy(dict(event)),
                event_index=copy.deepcopy(dict(event_index)),
                principal=principal,
            )
        except Exception as exc:
            raise Phase5ContractError(
                "candidate provenance verifier failed closed"
            ) from exc
        fields = {
            "schema",
            "verifier_id",
            "event_sha256",
            "policy_sha256",
            "valid_time_sha256",
            "evidence_refs_sha256",
            "evidence_commitments",
            "lineage_commitments",
            "domain_lineage_commitments",
            "derivative_use_status",
            "status",
        }
        if not isinstance(attestation, Mapping) or set(attestation) != fields:
            raise Phase5ContractError(
                "candidate provenance verifier returned an open attestation"
            )
        if (
            attestation.get("schema")
            != "memory-candidate-provenance-attestation/v1"
            or attestation.get("verifier_id")
            != self._candidate_provenance_verifier_id
            or attestation.get("status") != "verified"
            or attestation.get("derivative_use_status") != "allowed"
            or attestation.get("event_sha256") != _sha(event)
            or attestation.get("policy_sha256") != _sha(event.get("policy"))
            or attestation.get("valid_time_sha256")
            != _sha(event.get("valid_time"))
            or attestation.get("evidence_refs_sha256")
            != _sha(sorted(event.get("evidence_refs", [])))
            or attestation.get("lineage_commitments") != lineage_expected
            or attestation.get("domain_lineage_commitments")
            != domain_lineage_expected
        ):
            raise Phase5ContractError(
                "candidate provenance attestation does not bind the exact event and lineage"
            )
        commitments = attestation.get("evidence_commitments")
        if not isinstance(commitments, list) or len(commitments) != len(
            evidence_expected
        ):
            raise Phase5ContractError(
                "candidate provenance attestation has incomplete evidence commitments"
            )
        normalized_commitments: list[dict[str, Any]] = []
        for item in commitments:
            if (
                not isinstance(item, Mapping)
                or set(item)
                != {
                    "evidence_ref_sha256",
                    "content_sha256",
                    "artifact_provider",
                    "locator_provider",
                }
            ):
                raise Phase5ContractError(
                    "candidate provenance evidence commitment is invalid"
                )
            normalized_commitments.append(dict(item))
        normalized_commitments.sort(key=lambda item: item["evidence_ref_sha256"])
        provider_fields = {
            "event_id",
            "event_sha256",
            "policy_sha256",
            "system_time",
        }
        for (expected, locator), actual in zip(
            evidence_expected, normalized_commitments
        ):
            if any(actual.get(field) != value for field, value in expected.items()):
                raise Phase5ContractError(
                    "candidate provenance evidence commitment does not bind the exact digest"
                )
            digest = expected["content_sha256"].removeprefix("sha256:")
            for role, role_field in (
                ("artifact", "artifact_provider"),
                ("locator", "locator_provider"),
            ):
                provider_commitment = actual.get(role_field)
                if (
                    not isinstance(provider_commitment, Mapping)
                    or set(provider_commitment) != provider_fields
                    or not isinstance(provider_commitment.get("event_id"), str)
                ):
                    raise Phase5ContractError(
                        "candidate provenance provider commitment is invalid"
                    )
                provider = self._resolve_event_id(
                    provider_commitment["event_id"], principal=principal
                )
                try:
                    provider_time = parse_aware_datetime(provider.get("system_time"))
                    consumer_time = parse_aware_datetime(event.get("system_time"))
                except (TypeError, ValueError) as exc:
                    raise Phase5ContractError(
                        "candidate evidence provider has an invalid temporal commitment"
                    ) from exc
                exact_provider = {
                    "event_id": provider["event_id"],
                    "event_sha256": _sha(provider),
                    "policy_sha256": _sha(provider.get("policy")),
                    "system_time": _canonical_instant_text(
                        provider.get("system_time")
                    ),
                }
                if provider_commitment != exact_provider:
                    raise Phase5ContractError(
                        "candidate provenance provider does not bind authoritative bytes"
                    )
                if provider.get("policy") != event.get("policy"):
                    raise Phase5ContractError(
                        "candidate evidence provider policy differs from the consumer"
                    )
                if provider_time > consumer_time:
                    raise Phase5ContractError(
                        "candidate evidence provider is later than the consumer"
                    )
                if role == "artifact":
                    assertions = {row[0] for row in event_artifact_assertions(dict(provider))}
                    if digest not in assertions:
                        raise Phase5ContractError(
                            "candidate artifact provider does not assert the exact digest"
                        )
                else:
                    assertions = set(
                        event_artifact_locator_assertions(dict(provider))
                    )
                    if (digest, locator) not in assertions:
                        raise Phase5ContractError(
                            "candidate locator provider does not assert the exact locator"
                        )
        try:
            sealed = copy.deepcopy(dict(attestation))
            return sealed, _sha(sealed)
        except (TypeError, ValueError, UnicodeError, RecursionError) as exc:
            raise Phase5ContractError(
                "candidate provenance attestation is not canonical JSON"
            ) from exc

    @staticmethod
    def _bindings(request: Mapping[str, Any]) -> tuple[ObjectRef, ...]:
        raw = request.get("store_bindings")
        if not isinstance(raw, list):
            raise Phase5ContractError("store_bindings must be a list")
        try:
            return tuple(ObjectRef.from_dict(item) for item in raw)
        except MemoryStoreError as exc:
            raise Phase5ContractError(f"store binding is invalid: {exc}") from exc

    def _route_preflight(
        self,
        request: Mapping[str, Any],
        event: Mapping[str, Any],
        route: str,
        *,
        principal: object | None,
    ) -> str | None:
        """Return a sanitized failure code before any durable prepare or sink access."""

        try:
            bindings = self._bindings(request)
            policy = StoragePolicy.from_event(event)
        except (Phase5ContractError, MemoryStoreError):
            return "store-binding-invalid"
        if route == "canonical":
            return "store-binding-invalid" if bindings else None
        if route != "protected-store" or self._memory_store is None:
            return "policy-route-invalid"
        if self._journal_cipher is None:
            return "journal-protection-required"
        if not bindings or any(binding.policy != policy for binding in bindings):
            return "store-binding-invalid"
        try:
            descriptor = self._memory_store.preflight_event(
                event, objects=bindings, principal=principal
            )
        except StoreConflict:
            return "sink-conflict"
        except MemoryStoreError:
            return "store-binding-invalid"
        if (
            not isinstance(descriptor, Mapping)
            or set(descriptor)
            != {
                "schema",
                "status",
                "disposition",
                "event_id",
                "record_sha256",
                "record_byte_length",
                "object_count",
            }
            or descriptor.get("schema") != "memory-local-event-preflight/v1"
            or descriptor.get("status") != "ready"
            or descriptor.get("event_id") != event.get("event_id")
        ):
            return "store-binding-invalid"
        return None

    def _sink_write(
        self,
        request: Mapping[str, Any],
        event: Mapping[str, Any],
        route: str,
        *,
        principal: object | None,
        candidate_provenance_sha256: str,
    ) -> Mapping[str, Any]:
        bindings = self._bindings(request)
        policy = StoragePolicy.from_event(event)
        if route == "canonical":
            if bindings:
                raise Phase5ContractError("canonical-route requests must not carry store bindings")
            receipt = self._canonical_sink.append(
                event, idempotency_key=request["idempotency_key"]
            )
            required = {
                "schema",
                "event_id",
                "event_sha256",
                "idempotency_key",
                "disposition",
                "sink_identity_sha256",
                "canonical_ledger_sha256",
            }
            expected_sink_identity = self._state.configuration[
                "canonical_sink_identity_sha256"
            ]
            if (
                not isinstance(receipt, Mapping)
                or set(receipt) != required
                or receipt.get("schema") != "memory-canonical-sink-receipt/v1"
                or receipt.get("event_id") != event.get("event_id")
                or receipt.get("event_sha256") != _sha(event)
                or receipt.get("idempotency_key") != request.get("idempotency_key")
                or receipt.get("disposition") != "present"
                or receipt.get("sink_identity_sha256") != expected_sink_identity
                or receipt.get("canonical_ledger_sha256")
                != self._canonical_sink.content_sha256()
            ):
                raise SinkConflict("canonical sink receipt does not bind the configured sink")
            return {
                **copy.deepcopy(dict(receipt)),
                "configuration_sha256": self._state.configuration_sha256,
                "candidate_provenance_sha256": candidate_provenance_sha256,
            }
        if self._memory_store is None:
            raise Phase5ContractError("protected-store route is not configured")
        if not bindings:
            raise Phase5ContractError("protected-store route requires object bindings")
        if any(binding.policy != policy for binding in bindings):
            raise Phase5ContractError("every store binding must exactly match event policy")
        ref = self._memory_store.put_event(event, objects=bindings, principal=principal)
        return {
            "schema": "memory-protected-store-receipt/v1",
            "event_ref": ref.to_dict(),
            "idempotency_key": request["idempotency_key"],
            "sink_identity_sha256": self._state.configuration[
                "protected_store_identity_sha256"
            ],
            "configuration_sha256": self._state.configuration_sha256,
            "candidate_provenance_sha256": candidate_provenance_sha256,
            "canonical_ledger_sha256": self._canonical_sink.content_sha256(),
        }

    @staticmethod
    def _next_head(
        prepare: Mapping[str, Any], sink_receipt_sha256: str,
        canonical_ledger_sha256: str,
    ) -> str:
        return _sha(
            {
                "schema": "memory-controlled-write-head/v1",
                "sequence": prepare["sequence"],
                "prior_head": prepare["prior_head"],
                "prior_canonical_ledger_sha256": prepare[
                    "prior_canonical_ledger_sha256"
                ],
                "configuration_sha256": prepare["configuration_sha256"],
                "candidate_provenance_sha256": prepare[
                    "candidate_provenance_sha256"
                ],
                "request_sha256": prepare["request_sha256"],
                "event_sha256": prepare["event_sha256"],
                "sink_receipt_sha256": sink_receipt_sha256,
                "canonical_ledger_sha256": canonical_ledger_sha256,
            }
        )

    def _head_transition(
        self,
        prepare: Mapping[str, Any],
        sink_receipt: Mapping[str, Any],
    ) -> dict[str, Any]:
        receipt_sha256 = _sha(sink_receipt)
        canonical_ledger_sha256 = sink_receipt.get("canonical_ledger_sha256")
        if (
            not isinstance(canonical_ledger_sha256, str)
            or _HASH_RE.fullmatch(canonical_ledger_sha256) is None
        ):
            raise ControlledWriteCorruption(
                "sink receipt lacks canonical ledger commitment"
            )
        return {
            "schema": "memory-controlled-head-transition/v1",
            "coordinator_id": self._state.coordinator_id,
            "configuration_sha256": prepare["configuration_sha256"],
            "sequence": prepare["sequence"],
            "prior_head": prepare["prior_head"],
            "prior_canonical_ledger_sha256": prepare[
                "prior_canonical_ledger_sha256"
            ],
            "new_head": self._next_head(
                prepare, receipt_sha256, canonical_ledger_sha256
            ),
            "request_sha256": prepare["request_sha256"],
            "event_sha256": prepare["event_sha256"],
            "sink_receipt_sha256": receipt_sha256,
            "candidate_provenance_sha256": prepare[
                "candidate_provenance_sha256"
            ],
            "canonical_ledger_sha256": canonical_ledger_sha256,
        }

    def _commit(
        self,
        request: Mapping[str, Any],
        event: Mapping[str, Any],
        prepare: Mapping[str, Any],
        sink_receipt: Mapping[str, Any],
        *,
        disposition: str,
        transition: Mapping[str, Any],
    ) -> dict[str, Any]:
        receipt_sha = _sha(sink_receipt)
        expected_transition = self._head_transition(prepare, sink_receipt)
        if transition != expected_transition:
            raise ControlledWriteCorruption(
                "journal commit transition differs from the sink head"
            )
        new_head = transition["new_head"]
        result = self._result(
            request=request,
            request_sha256=prepare["request_sha256"],
            disposition=disposition,
            route=prepare["route"],
            sequence=prepare["sequence"],
            prior_head=prepare["prior_head"],
            new_head=new_head,
            event=event,
            sink_receipt_sha256=receipt_sha,
            dead_letter_id=None,
            candidate_provenance_sha256=prepare[
                "candidate_provenance_sha256"
            ],
            candidate_provenance=_strict_object(
                prepare["candidate_provenance_canonical_json"],
                label="prepared candidate provenance",
            ),
        )
        result_text = canonical_json_bytes(result).decode("utf-8")
        row = {
            **{key: prepare[key] for key in (
                "request_id", "idempotency_key", "request_sha256",
                "configuration_sha256", "candidate_provenance_sha256",
                "candidate_provenance_canonical_json",
                "route", "sequence", "prior_head",
                "prior_canonical_ledger_sha256",
                "event_id", "event_sha256", "event_supersedes"
            )},
            "schema": JOURNAL_SCHEMA,
            "journal_id": "commit:" + prepare["request_id"],
            "phase": "commit",
            "body_encoding": None,
            "body_sha256": None,
            "body_canonical_json": None,
            "body_ciphertext": None,
            "key_ref": None,
            "aad_sha256": None,
            "sink_receipt_sha256": receipt_sha,
            "sink_receipt_canonical_json": canonical_json_bytes(
                sink_receipt
            ).decode("utf-8"),
            "result_canonical_json": result_text,
            "result_sha256": _sha(result),
            "recorded_at": _now_text(self._clock),
        }
        self._validate_journal_row(row)
        self._state.append(
            self._state.journal, row, key="journal_id", value=row["journal_id"]
        )
        return result

    def _abort(self, prepare: Mapping[str, Any]) -> None:
        row = {
            **{key: prepare[key] for key in (
                "request_id", "idempotency_key", "request_sha256",
                "configuration_sha256", "candidate_provenance_sha256",
                "candidate_provenance_canonical_json",
                "route", "sequence", "prior_head",
                "prior_canonical_ledger_sha256",
                "event_id", "event_sha256", "event_supersedes"
            )},
            "schema": JOURNAL_SCHEMA,
            "journal_id": "abort:" + prepare["request_id"],
            "phase": "abort",
            "body_encoding": None,
            "body_sha256": None,
            "body_canonical_json": None,
            "body_ciphertext": None,
            "key_ref": None,
            "aad_sha256": None,
            "sink_receipt_sha256": None,
            "sink_receipt_canonical_json": None,
            "result_canonical_json": None,
            "result_sha256": None,
            "recorded_at": _now_text(self._clock),
        }
        self._validate_journal_row(row)
        self._state.append(
            self._state.journal, row, key="journal_id", value=row["journal_id"]
        )
        if prepare.get("key_ref") is not None:
            self._state.delete_key(prepare["key_ref"])

    def submit(
        self, request: Mapping[str, Any], *, principal: object | None = None
    ) -> dict[str, Any]:
        if not isinstance(request, Mapping):
            request = {}  # type: ignore[assignment]
        request_sha = self._request_sha(request)
        event: Mapping[str, Any] | None = None
        route = "unknown"
        local_errors = validate_write_request(request)
        if not local_errors:
            try:
                event = request_event(request)
                route = self._route(event)
                self._bindings(request)
            except (Phase5ContractError, MemoryStoreError) as exc:
                local_errors.append(str(exc))

        # Both gates run before state, coordinator, sink, or store access. A denial is
        # deliberately ephemeral and returns a non-authoritative genesis descriptor.
        if not self._authorized(request, principal) or not self._review_authorized(
            request, principal
        ):
            return self._denied_result(
                request,
                request_sha,
                event,
                route,
                {"sequence": 0, "head": GENESIS_HEAD},
            )

        with (
            self._process_guard,
            self._canonical_sink.coordinated(
                self._state.coordinator_id, self._state.configuration_sha256
            ),
            self._store_coordinated(),
            self._state.locked(),
        ):
            state = self._journal_state()
            if any(
                row.get("schema") == RETIREMENT_JOURNAL_SCHEMA
                for row in state["pending"]
            ):
                raise RecoveryRequired(
                    "a retirement transition requires authorized recovery"
                )
            self._assert_anchor_state(
                state, allow_advanced_pending=True, principal=principal
            )
            if local_errors:
                return self._dead_letter(
                    request,
                    request_sha256=request_sha,
                    event=event,
                    route=route,
                    reason_code="invalid-contract",
                    reason="; ".join(local_errors[:8]),
                    retryable=False,
                    disposition="rejected",
                    state=state,
                )
            assert event is not None
            if state["pending"]:
                raise RecoveryRequired("a prepared write must be recovered before new submission")

            idem = request["idempotency_key"]
            previous = state["idempotency"].get(idem)
            if previous is not None:
                previous_sha, previous_result = previous
                if previous_sha != request_sha:
                    return self._dead_letter(
                        request,
                        request_sha256=request_sha,
                        event=event,
                        route=route,
                        reason_code="idempotency-conflict",
                        reason="idempotency key already committed different request bytes",
                        retryable=False,
                        disposition="quarantined",
                        state=state,
                    )
                original_sha = _sha(previous_result)
                replay = copy.deepcopy(dict(previous_result))
                replay["disposition"] = "replayed"
                replay["original_result_sha256"] = original_sha
                replay["completed_at"] = _now_text(self._clock)
                errors = validate_write_result(replay)
                if errors:
                    raise ControlledWriteCorruption("replay result is invalid")
                return replay

            if request["expected_head"] != state["head"]:
                return self._dead_letter(
                    request,
                    request_sha256=request_sha,
                    event=event,
                    route=route,
                    reason_code="expected-head-conflict",
                    reason="expected_head does not equal the current committed head",
                    retryable=True,
                    disposition="quarantined",
                    state=state,
                )
            prior_event_sha = state["event_ids"].get(event["event_id"])
            if prior_event_sha is not None:
                return self._dead_letter(
                    request,
                    request_sha256=request_sha,
                    event=event,
                    route=route,
                    reason_code="event-id-conflict",
                    reason="event_id was already committed under a different idempotency key",
                    retryable=False,
                    disposition="quarantined",
                    state=state,
                )

            preflight_code = self._route_preflight(
                request, event, route, principal=principal
            )
            if preflight_code is not None:
                return self._dead_letter(
                    request,
                    request_sha256=request_sha,
                    event=event,
                    route=route,
                    reason_code=preflight_code,
                    reason="",
                    retryable=False,
                    disposition="quarantined",
                    state=state,
                )

            # This is the first sink/store read. Both authorization gates have already passed.
            try:
                event_index = self._target_index(event, principal=principal)
                full_errors = validate_write_request(request, event_index=event_index)
                full_errors.extend(
                    self._controlled_branch_errors(
                        event, state, principal=principal
                    )
                )
            except (Phase5ContractError, MemoryStoreError) as exc:
                full_errors = [str(exc)]
            if full_errors:
                return self._dead_letter(
                    request,
                    request_sha256=request_sha,
                    event=event,
                    route=route,
                    reason_code="correction-invalid" if event.get("supersedes") else "invalid-event",
                    reason="; ".join(full_errors[:8]),
                    retryable=False,
                    disposition="quarantined",
                    state=state,
                )

            try:
                (
                    candidate_provenance,
                    candidate_provenance_sha256,
                ) = self._candidate_provenance(
                    event, event_index, principal=principal
                )
            except Phase5ContractError:
                return self._dead_letter(
                    request,
                    request_sha256=request_sha,
                    event=event,
                    route=route,
                    reason_code="provenance-invalid",
                    reason="",
                    retryable=False,
                    disposition="quarantined",
                    state=state,
                )

            prepare = self._prepare_row(
                request,
                request_sha256=request_sha,
                event=event,
                route=route,
                state=state,
                candidate_provenance=candidate_provenance,
                candidate_provenance_sha256=candidate_provenance_sha256,
            )
            try:
                self._state.append(
                    self._state.journal,
                    prepare,
                    key="journal_id",
                    value=prepare["journal_id"],
                )
            except BaseException:
                # The helper promises a newline-terminated fsynced row on success.
                # Repair a possible killed partial tail, then retain the key only if
                # the corresponding prepare is in fact durable.
                if prepare.get("key_ref") is not None:
                    try:
                        durable = any(
                            row.get("journal_id") == prepare["journal_id"]
                            for row in self._state.rows(self._state.journal, repair=True)
                        )
                    except BaseException:
                        durable = True  # fail closed: never destroy a possibly live key
                    if not durable:
                        self._state.delete_key(prepare["key_ref"])
                raise
            self._fault("after_prepare")
            try:
                receipt = self._sink_write(
                    request,
                    event,
                    route,
                    principal=principal,
                    candidate_provenance_sha256=candidate_provenance_sha256,
                )
            except (MemoryStoreError, ControlledWriteError, OSError) as exc:
                raise RecoveryRequired("prepared write requires recovery") from exc
            self._fault("after_sink")
            try:
                transition = self._head_transition(prepare, receipt)
                self._canonical_sink.advance_head(transition)
            except (MemoryStoreError, ControlledWriteError, OSError) as exc:
                raise RecoveryRequired(
                    "prepared write requires controlled-head recovery"
                ) from exc
            self._fault("after_head_advance")
            try:
                result = self._commit(
                    request,
                    event,
                    prepare,
                    receipt,
                    disposition="committed",
                    transition=transition,
                )
            except (MemoryStoreError, ControlledWriteError, OSError) as exc:
                raise RecoveryRequired(
                    "advanced controlled head requires journal recovery"
                ) from exc
            self._fault("after_commit")
            if prepare.get("key_ref") is not None:
                self._state.delete_key(prepare["key_ref"])
            self._fault("after_key_delete")
            return result

    def _clean_keys(self, state: Mapping[str, Any]) -> None:
        live = {
            row["key_ref"]
            for row in state["pending"]
            if isinstance(row.get("key_ref"), str)
        }
        for path in sorted((self._state.root / "keys").iterdir(), key=lambda item: item.name):
            if path.name not in live:
                self._state.delete_key(path.name)

    def recover(self, *, principal: object | None = None) -> list[dict[str, Any]]:
        """Recover every durable prepare, idempotently, then destroy obsolete journal keys."""

        recovered: list[dict[str, Any]] = []
        if not self._recovery_authorized(principal):
            raise AuthorizationDenied(
                "recovery authorization denied before repair, cleanup, or decryption"
            )
        with (
            self._process_guard,
            self._canonical_sink.coordinated(
                self._state.coordinator_id, self._state.configuration_sha256
            ),
            self._store_coordinated(),
            self._state.locked(),
        ):
            state = self._journal_state(repair=True)
            pending_retired: dict[str, str] = {}
            for pending in state["pending"]:
                if pending.get("schema") != RETIREMENT_JOURNAL_SCHEMA:
                    continue
                request, refs = self._retirement_request(
                    _strict_object(
                        pending["request_canonical_json"],
                        label="prepared retirement request",
                    )
                )
                if not self._retirement_authorized(request, principal):
                    raise AuthorizationDenied(
                        "retirement recovery authorization denied"
                    )
                scope = self._validate_retirement_scope(request, refs, state)
                attestation = self._retirement_attestation(
                    request, principal=principal
                )
                if (
                    canonical_json_bytes(attestation).decode("utf-8")
                    != pending["candidate_provenance_canonical_json"]
                    or _sha(attestation)
                    != pending["candidate_provenance_sha256"]
                ):
                    raise ControlledWriteCorruption(
                        "prepared retirement attestation changed during recovery"
                    )
                pending_retired.update(scope)
            self._assert_anchor_state(
                state,
                allow_advanced_pending=True,
                principal=principal,
                retired_overrides=pending_retired,
            )
            self._clean_keys(state)
            for prepare in state["pending"]:
                if prepare["prior_head"] != state["head"] or prepare["sequence"] != state["sequence"] + 1:
                    raise ControlledWriteCorruption("pending prepare does not extend current head")
                if prepare.get("schema") == RETIREMENT_JOURNAL_SCHEMA:
                    receipt = self._retirement_sink_receipt(prepare)
                    result = self._retirement_commit(
                        prepare,
                        receipt,
                        self._canonical_sink.advance_head(
                            self._head_transition(prepare, receipt)
                        )["transition"],
                        disposition="recovered",
                    )
                    recovered.append(result)
                    state = self._journal_state()
                    self._assert_anchor_state(
                        state,
                        allow_advanced_pending=False,
                        principal=principal,
                    )
                    continue
                request = self._load_prepared_request(prepare)
                if not self._authorized(request, principal) or not self._review_authorized(
                    request, principal
                ):
                    raise AuthorizationDenied(
                        "recovery authorization denied; prepared write remains untouched"
                    )
                event = request_event(request)
                if self._route(event) != prepare["route"] or _sha(event) != prepare["event_sha256"]:
                    raise ControlledWriteCorruption("prepared route/event commitment is stale")
                event_index = self._target_index(event, principal=principal)
                errors = validate_write_request(request, event_index=event_index)
                errors.extend(
                    self._controlled_branch_errors(
                        event, state, principal=principal
                    )
                )
                if errors:
                    raise ControlledWriteCorruption(
                        "prepared request no longer validates: " + "; ".join(errors[:8])
                    )
                try:
                    (
                        recovered_provenance,
                        recovered_provenance_sha256,
                    ) = self._candidate_provenance(
                        event, event_index, principal=principal
                    )
                except Phase5ContractError as exc:
                    raise ControlledWriteCorruption(
                        "prepared candidate provenance no longer verifies"
                    ) from exc
                if (
                    recovered_provenance_sha256
                    != prepare["candidate_provenance_sha256"]
                    or canonical_json_bytes(recovered_provenance).decode("utf-8")
                    != prepare["candidate_provenance_canonical_json"]
                ):
                    raise ControlledWriteCorruption(
                        "prepared candidate provenance attestation changed"
                    )
                self._canonical_sink.validate_pending_content(
                    event,
                    route=prepare["route"],
                    prior_ledger_sha256=prepare[
                        "prior_canonical_ledger_sha256"
                    ],
                )
                try:
                    receipt = self._sink_write(
                        request,
                        event,
                        prepare["route"],
                        principal=principal,
                        candidate_provenance_sha256=recovered_provenance_sha256,
                    )
                except (MemoryStoreError, ControlledWriteError, OSError) as exc:
                    raise RecoveryRequired("prepared write still requires recovery") from exc
                result = self._commit(
                    request,
                    event,
                    prepare,
                    receipt,
                    disposition="recovered",
                    transition=self._canonical_sink.advance_head(
                        self._head_transition(prepare, receipt)
                    )["transition"],
                )
                if prepare.get("key_ref") is not None:
                    self._state.delete_key(prepare["key_ref"])
                recovered.append(result)
                state = self._journal_state()
                self._assert_anchor_state(
                    state, allow_advanced_pending=False, principal=principal
                )
            self._clean_keys(state)
        return recovered


__all__ = [
    "AuthorizationDenied",
    "CanonicalSink",
    "ControlledWriteCorruption",
    "ControlledWriteError",
    "ControlledWriter",
    "GENESIS_HEAD",
    "NdjsonCanonicalSink",
    "RecoveryRequired",
    "SinkConflict",
]
