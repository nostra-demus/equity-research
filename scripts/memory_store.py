#!/usr/bin/env python3
"""Policy-partitioned, content-addressed local storage for permanent memory.

The store is intentionally independent of the CLI and projection implementation.  It
keeps exact source bytes and canonical event records in immutable SHA-256 addressed
files, with acquisition/version identity and policy kept distinct from content identity.
Protected partitions use the reviewed authenticated cipher in ``memory_crypto`` and
persist wrapped DEK envelopes separately so purge can cryptographically delete keys
before removing ciphertext.

The local reference store is a private ``0700`` tree owned by one trusted service
identity.  POSIX file operations hold no-follow directory descriptors so an ancestor
pathname swap cannot redirect a read/write/delete outside that tree.  This is not a
claim of resistance to a malicious process running as the same UID, which can access
the store and its local key material directly.
"""
from __future__ import annotations

import datetime as dt
import functools
import hashlib
import json
import os
import re
import secrets
import stat
import threading
from contextlib import contextmanager
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping, Protocol, Sequence, Union

try:  # pragma: no cover - selected by platform
    import fcntl
except ImportError:  # pragma: no cover - Windows fallback
    fcntl = None  # type: ignore[assignment]
try:  # pragma: no cover - selected by platform
    import msvcrt
except ImportError:  # pragma: no cover - POSIX path
    msvcrt = None  # type: ignore[assignment]

try:
    from canonical_json import canonical_json_bytes, canonical_sha256
    from memory_contract import (
        CLASSIFICATIONS,
        RETENTIONS,
        object_manifest_sha256,
        parse_aware_datetime,
        validate_event,
        validate_object_manifest,
        validate_phase2_event_bindings,
        verify_object_content,
    )
    from memory_crypto import EncryptedObject, MemoryCryptoError
except ImportError:  # pragma: no cover - package-style imports
    from scripts.canonical_json import canonical_json_bytes, canonical_sha256
    from scripts.memory_contract import (
        CLASSIFICATIONS,
        RETENTIONS,
        object_manifest_sha256,
        parse_aware_datetime,
        validate_event,
        validate_object_manifest,
        validate_phase2_event_bindings,
        verify_object_content,
    )
    from scripts.memory_crypto import EncryptedObject, MemoryCryptoError


STORE_MANIFEST_SCHEMA = "memory-local-store-manifest/v1"
EVENT_RECORD_SCHEMA = "memory-local-event-record/v1"
DESCRIPTOR_SCHEMA = "memory-local-store-descriptor/v1"
AAD_SCHEMA = "memory-local-store-aad/v1"
PROTECTED_CLASSIFICATIONS = frozenset({"licensed", "confidential", "restricted"})

_SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
_UUID_RE = r"[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}"
_ACQUISITION_RE = re.compile(rf"^acquisition_{_UUID_RE}$")
_SOURCE_VERSION_RE = re.compile(rf"^source-version_{_UUID_RE}$")
_EVENT_ID_RE = re.compile(rf"^evt_{_UUID_RE}$")
_BACKUP_ID_RE = re.compile(r"^[a-z0-9][a-z0-9._-]{0,63}$")
_DEK_ID_RE = re.compile(r"^dek_[0-9a-f]{32}$")
_SAFE_RETURNED_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._/-]{0,1023}$")
_LOCK_BYTES = b"memory-local-store-lock/v1\n"


class _ProcessLockState:
    def __init__(self) -> None:
        self.lock = threading.RLock()
        self.local = threading.local()


_LOCK_REGISTRY_GUARD = threading.Lock()
_LOCK_REGISTRY: dict[str, _ProcessLockState] = {}


def _transactional(method: Callable[..., Any]) -> Callable[..., Any]:
    @functools.wraps(method)
    def wrapped(self: "MemoryStore", *args: Any, **kwargs: Any) -> Any:
        with self._transaction():
            return method(self, *args, **kwargs)

    return wrapped


class MemoryStoreError(RuntimeError):
    """Base class for local-store failures."""


class InvalidStoreInput(MemoryStoreError, ValueError):
    """Raised when an API value is outside the closed storage contract."""


class AccessDenied(MemoryStoreError, PermissionError):
    """Raised when policy or caller authorization denies an operation."""


class ExpiredContent(AccessDenied):
    """Raised when an expiring entry is no longer readable."""


class StoreNotFound(MemoryStoreError, FileNotFoundError):
    """Raised when a requested immutable entry is absent."""


class StoreConflict(MemoryStoreError):
    """Raised when an immutable address already contains different bytes."""


class StoreCorruption(MemoryStoreError):
    """Raised for digest, mode, symlink, layout, or authenticated-data corruption."""


class EncryptionRequired(MemoryStoreError):
    """Raised when a protected partition has no authenticated cipher."""


class PurgeIncomplete(MemoryStoreError):
    """Raised when purge cannot prove all managed derivatives are gone."""


class AuthenticatedCipher(Protocol):
    """The reviewed authenticated-encryption boundary supplied by memory_crypto."""

    def encrypt(self, plaintext: bytes, *, associated_data: bytes) -> EncryptedObject: ...

    def decrypt(
        self,
        ciphertext: bytes,
        key_envelope: dict[str, str],
        *,
        associated_data: bytes,
    ) -> bytes: ...


@dataclass(frozen=True)
class StoragePolicy:
    classification: str
    retention: str
    retain_until: str | None = None

    def __post_init__(self) -> None:
        if self.classification not in CLASSIFICATIONS:
            raise InvalidStoreInput(f"unknown classification {self.classification!r}")
        if self.retention not in RETENTIONS:
            raise InvalidStoreInput(f"unknown retention {self.retention!r}")
        if self.retention == "expires":
            if self.retain_until is None:
                raise InvalidStoreInput("expires retention requires retain_until")
            try:
                parse_aware_datetime(self.retain_until)
            except ValueError as exc:
                raise InvalidStoreInput("retain_until must be a canonical aware date-time") from exc
        elif self.retain_until is not None:
            raise InvalidStoreInput("retain_until must be null unless retention is expires")

    @property
    def protected(self) -> bool:
        return self.classification in PROTECTED_CLASSIFICATIONS

    @property
    def requires_external_store(self) -> bool:
        return self.protected or self.retention in {"expires", "source-policy"}

    @property
    def partition_sha256(self) -> str:
        return canonical_sha256(self.to_dict())

    def to_dict(self) -> dict[str, Any]:
        return {
            "classification": self.classification,
            "retention": self.retention,
            "retain_until": self.retain_until,
        }

    @classmethod
    def from_dict(cls, value: object) -> "StoragePolicy":
        if not isinstance(value, dict) or set(value) != {
            "classification",
            "retention",
            "retain_until",
        }:
            raise InvalidStoreInput("policy must contain exactly classification, retention, retain_until")
        return cls(
            classification=value.get("classification"),  # type: ignore[arg-type]
            retention=value.get("retention"),  # type: ignore[arg-type]
            retain_until=value.get("retain_until"),  # type: ignore[arg-type]
        )

    @classmethod
    def from_event(cls, event: Mapping[str, Any]) -> "StoragePolicy":
        return cls.from_dict(event.get("policy"))


def _validate_identity(acquisition_id: str, source_version_id: str) -> None:
    if not isinstance(acquisition_id, str) or _ACQUISITION_RE.fullmatch(acquisition_id) is None:
        raise InvalidStoreInput("acquisition_id must be a canonical acquisition UUID")
    if not isinstance(source_version_id, str) or _SOURCE_VERSION_RE.fullmatch(source_version_id) is None:
        raise InvalidStoreInput("source_version_id must be a canonical source-version UUID")


def _validate_digest(value: str) -> None:
    if not isinstance(value, str) or _SHA256_RE.fullmatch(value) is None:
        raise InvalidStoreInput("digest must be 64 lowercase hexadecimal characters")


def _validate_size(value: int, field: str) -> None:
    if type(value) is not int or value < 0:
        raise InvalidStoreInput(f"{field} must be a non-negative integer")


@dataclass(frozen=True)
class ObjectRef:
    acquisition_id: str
    source_version_id: str
    policy: StoragePolicy
    manifest_sha256: str
    sha256: str
    byte_length: int
    encrypted: bool

    def __post_init__(self) -> None:
        _validate_identity(self.acquisition_id, self.source_version_id)
        if not isinstance(self.policy, StoragePolicy):
            raise InvalidStoreInput("object policy must be StoragePolicy")
        if self.policy.retention == "tombstone-only":
            raise InvalidStoreInput("objects cannot use tombstone-only retention")
        _validate_digest(self.manifest_sha256)
        _validate_digest(self.sha256)
        _validate_size(self.byte_length, "byte_length")
        if type(self.encrypted) is not bool or self.encrypted != self.policy.protected:
            raise InvalidStoreInput("encrypted must exactly match protected classification")

    @property
    def object_id(self) -> str:
        return f"object:sha256:{self.sha256}"

    def to_dict(self) -> dict[str, Any]:
        return {
            "acquisition_id": self.acquisition_id,
            "source_version_id": self.source_version_id,
            "policy": self.policy.to_dict(),
            "manifest_sha256": self.manifest_sha256,
            "sha256": self.sha256,
            "byte_length": self.byte_length,
            "encrypted": self.encrypted,
        }

    @classmethod
    def from_dict(cls, value: object) -> "ObjectRef":
        required = {
            "acquisition_id",
            "source_version_id",
            "policy",
            "manifest_sha256",
            "sha256",
            "byte_length",
            "encrypted",
        }
        if not isinstance(value, dict) or set(value) != required:
            raise InvalidStoreInput("object ref has unsupported or missing fields")
        return cls(
            acquisition_id=value["acquisition_id"],
            source_version_id=value["source_version_id"],
            policy=StoragePolicy.from_dict(value["policy"]),
            manifest_sha256=value["manifest_sha256"],
            sha256=value["sha256"],
            byte_length=value["byte_length"],
            encrypted=value["encrypted"],
        )


@dataclass(frozen=True)
class EventRef:
    acquisition_id: str
    source_version_id: str
    policy: StoragePolicy
    event_id: str
    record_sha256: str
    record_byte_length: int
    objects: tuple[ObjectRef, ...]
    encrypted: bool

    def __post_init__(self) -> None:
        _validate_identity(self.acquisition_id, self.source_version_id)
        if not isinstance(self.policy, StoragePolicy):
            raise InvalidStoreInput("event policy must be StoragePolicy")
        if not isinstance(self.event_id, str) or _EVENT_ID_RE.fullmatch(self.event_id) is None:
            raise InvalidStoreInput("event_id must be a canonical event UUID")
        _validate_digest(self.record_sha256)
        _validate_size(self.record_byte_length, "record_byte_length")
        if not isinstance(self.objects, tuple) or not all(
            isinstance(item, ObjectRef) for item in self.objects
        ):
            raise InvalidStoreInput("event objects must be a tuple of ObjectRef values")
        if len(
            {
                (
                    item.acquisition_id,
                    item.source_version_id,
                    item.manifest_sha256,
                    item.sha256,
                )
                for item in self.objects
            }
        ) != len(self.objects):
            raise InvalidStoreInput("event objects must be unique")
        if any(item.policy != self.policy for item in self.objects):
            raise InvalidStoreInput("bound objects must use exactly the event policy")
        if self.policy.retention == "tombstone-only" and self.objects:
            raise InvalidStoreInput("tombstone events cannot bind content objects")
        if type(self.encrypted) is not bool or self.encrypted != self.policy.protected:
            raise InvalidStoreInput("encrypted must exactly match protected classification")

    def to_dict(self) -> dict[str, Any]:
        return {
            "acquisition_id": self.acquisition_id,
            "source_version_id": self.source_version_id,
            "policy": self.policy.to_dict(),
            "event_id": self.event_id,
            "record_sha256": self.record_sha256,
            "record_byte_length": self.record_byte_length,
            "objects": [item.to_dict() for item in self.objects],
            "encrypted": self.encrypted,
        }

    @classmethod
    def from_dict(cls, value: object) -> "EventRef":
        required = {
            "acquisition_id",
            "source_version_id",
            "policy",
            "event_id",
            "record_sha256",
            "record_byte_length",
            "objects",
            "encrypted",
        }
        if not isinstance(value, dict) or set(value) != required:
            raise InvalidStoreInput("event ref has unsupported or missing fields")
        objects = value["objects"]
        if not isinstance(objects, list):
            raise InvalidStoreInput("event ref objects must be a list")
        return cls(
            acquisition_id=value["acquisition_id"],
            source_version_id=value["source_version_id"],
            policy=StoragePolicy.from_dict(value["policy"]),
            event_id=value["event_id"],
            record_sha256=value["record_sha256"],
            record_byte_length=value["record_byte_length"],
            objects=tuple(ObjectRef.from_dict(item) for item in objects),
            encrypted=value["encrypted"],
        )


EntryRef = Union[ObjectRef, EventRef]


@dataclass(frozen=True)
class AccessRequest:
    action: str
    kind: str
    acquisition_id: str
    source_version_id: str
    policy: StoragePolicy
    digest: str
    event_id: str | None
    principal: object | None


@dataclass(frozen=True)
class BackupReceipt:
    content_path: str
    key_path: str | None


@dataclass(frozen=True)
class PurgeReceipt:
    target_event_id: str
    tombstones: tuple[EventRef, ...]
    removed_events: tuple[tuple[str, str], ...]
    removed_objects: tuple[tuple[str, str, str], ...]
    transitive_objects: tuple[tuple[str, str, str], ...]
    key_envelopes_removed: int
    backups_removed: int
    projections_removed: int
    verification_sha256: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "target_event_id": self.target_event_id,
            "tombstones": [item.to_dict() for item in self.tombstones],
            "removed_events": [
                {"event_id": event_id, "event_sha256": digest}
                for event_id, digest in self.removed_events
            ],
            "removed_objects": [
                {
                    "object_id": object_id,
                    "content_sha256": content_sha,
                    "manifest_sha256": manifest_sha,
                }
                for object_id, content_sha, manifest_sha in self.removed_objects
            ],
            "transitive_objects": [
                {
                    "object_id": object_id,
                    "content_sha256": content_sha,
                    "manifest_sha256": manifest_sha,
                }
                for object_id, content_sha, manifest_sha in self.transitive_objects
            ],
            "erasure_surfaces": {
                "key_envelopes_removed": self.key_envelopes_removed,
                "backups_removed": self.backups_removed,
                "projections_removed": self.projections_removed,
            },
            "verification_sha256": self.verification_sha256,
        }

    @classmethod
    def from_dict(cls, value: object) -> "PurgeReceipt":
        if not isinstance(value, dict):
            raise StoreCorruption("stored purge completion must be an object")
        required = {
            "target_event_id",
            "tombstones",
            "removed_events",
            "removed_objects",
            "transitive_objects",
            "erasure_surfaces",
            "verification_sha256",
        }
        if set(value) != required:
            raise StoreCorruption("stored purge completion has unsupported fields")
        surfaces = value.get("erasure_surfaces")
        if not isinstance(surfaces, dict) or set(surfaces) != {
            "key_envelopes_removed",
            "backups_removed",
            "projections_removed",
        }:
            raise StoreCorruption("stored purge completion has invalid erasure surfaces")

        def event_pointer(item: object) -> tuple[str, str]:
            if not isinstance(item, dict) or set(item) != {"event_id", "event_sha256"}:
                raise StoreCorruption("stored purge event pointer is invalid")
            event_id = item["event_id"]
            event_sha = item["event_sha256"]
            if (
                not isinstance(event_id, str)
                or _EVENT_ID_RE.fullmatch(event_id) is None
                or not isinstance(event_sha, str)
                or not event_sha.startswith("sha256:")
                or _SHA256_RE.fullmatch(event_sha[7:]) is None
            ):
                raise StoreCorruption("stored purge event pointer identity is invalid")
            return event_id, event_sha

        def object_pointer(item: object) -> tuple[str, str, str]:
            if not isinstance(item, dict) or set(item) != {
                "object_id",
                "content_sha256",
                "manifest_sha256",
            }:
                raise StoreCorruption("stored purge object pointer is invalid")
            object_id = item["object_id"]
            content_sha = item["content_sha256"]
            manifest_sha = item["manifest_sha256"]
            if (
                not isinstance(object_id, str)
                or re.fullmatch(r"object:sha256:[0-9a-f]{64}", object_id) is None
                or not isinstance(content_sha, str)
                or not content_sha.startswith("sha256:")
                or _SHA256_RE.fullmatch(content_sha[7:]) is None
                or object_id.removeprefix("object:sha256:") != content_sha[7:]
                or not isinstance(manifest_sha, str)
                or not manifest_sha.startswith("sha256:")
                or _SHA256_RE.fullmatch(manifest_sha[7:]) is None
            ):
                raise StoreCorruption("stored purge object pointer identity is invalid")
            return object_id, content_sha, manifest_sha

        for field in ("tombstones", "removed_events", "removed_objects", "transitive_objects"):
            if not isinstance(value.get(field), list):
                raise StoreCorruption(f"stored purge completion {field} must be a list")

        try:
            receipt = cls(
                target_event_id=value["target_event_id"],
                tombstones=tuple(EventRef.from_dict(item) for item in value["tombstones"]),
                removed_events=tuple(event_pointer(item) for item in value["removed_events"]),
                removed_objects=tuple(object_pointer(item) for item in value["removed_objects"]),
                transitive_objects=tuple(
                    object_pointer(item) for item in value["transitive_objects"]
                ),
                key_envelopes_removed=surfaces["key_envelopes_removed"],
                backups_removed=surfaces["backups_removed"],
                projections_removed=surfaces["projections_removed"],
                verification_sha256=value["verification_sha256"],
            )
        except (KeyError, TypeError, InvalidStoreInput) as exc:
            raise StoreCorruption(f"stored purge completion is invalid: {exc}") from exc
        if (
            not isinstance(receipt.target_event_id, str)
            or _EVENT_ID_RE.fullmatch(receipt.target_event_id) is None
        ):
            raise StoreCorruption("stored purge target_event_id is invalid")
        for count in (
            receipt.key_envelopes_removed,
            receipt.backups_removed,
            receipt.projections_removed,
        ):
            try:
                _validate_size(count, "purge surface count")
            except InvalidStoreInput as exc:
                raise StoreCorruption("stored purge surface count is invalid") from exc
        if (
            not isinstance(receipt.verification_sha256, str)
            or not receipt.verification_sha256.startswith("sha256:")
            or _SHA256_RE.fullmatch(receipt.verification_sha256[7:]) is None
        ):
            raise StoreCorruption("stored purge verification digest is invalid")
        return receipt


Authorizer = Callable[[AccessRequest], bool]
ProjectionPurger = Callable[[EventRef], Iterable[str]]
ProjectionVerifier = Callable[[EventRef], bool]
Clock = Callable[[], dt.datetime]


def require_protected_store_outside_repository(
    store_root: str | os.PathLike[str],
    repository_root: str | os.PathLike[str],
) -> None:
    """Fail if a purgeable store would live inside a Git working tree.

    The helper takes an explicit repository root so CLI callers do not depend on the
    current working directory or an ambient ``git`` executable.
    """

    store = Path(store_root).expanduser().resolve(strict=False)
    repository = Path(repository_root).expanduser().resolve(strict=False)
    try:
        store.relative_to(repository)
    except ValueError:
        return
    raise InvalidStoreInput("purgeable memory stores must be outside the Git repository")


def _deny(_: AccessRequest) -> bool:
    return False


def _utc_now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


class MemoryStore:
    """One local, immutable, policy-partitioned object and event lane."""

    _TOP_LEVEL = (
        "objects",
        "events",
        "descriptors",
        "keys",
        "backups",
        "retired",
        "purges",
        "receipts",
        "checkpoints",
        "locks",
    )

    def __init__(
        self,
        root: str | os.PathLike[str],
        *,
        clock: Clock = _utc_now,
        authorize: Authorizer | None = None,
        source_policy: Authorizer | None = None,
        cipher: AuthenticatedCipher | None = None,
        projection_purger: ProjectionPurger | None = None,
        projection_absent: ProjectionVerifier | None = None,
        repository_root: str | os.PathLike[str] | None = None,
        create: bool = True,
    ) -> None:
        if type(create) is not bool:
            raise InvalidStoreInput("create must be a boolean")
        if not callable(clock):
            raise InvalidStoreInput("clock must be callable")
        if authorize is not None and not callable(authorize):
            raise InvalidStoreInput("authorize must be callable")
        if source_policy is not None and not callable(source_policy):
            raise InvalidStoreInput("source_policy must be callable")
        if (projection_purger is None) != (projection_absent is None):
            raise InvalidStoreInput("projection purge and absence hooks must be configured together")
        raw_root = Path(root).expanduser()
        try:
            raw_root_status = raw_root.lstat()
        except FileNotFoundError:
            raw_root_status = None
        except OSError as exc:
            raise StoreCorruption(f"cannot inspect store root: {exc}") from exc
        if raw_root_status is not None and stat.S_ISLNK(raw_root_status.st_mode):
            raise StoreCorruption("store root must not be a symlink")
        self.root = Path(os.path.abspath(os.fspath(raw_root)))
        if not self.root.exists():
            if not create:
                raise StoreNotFound("existing memory store root is absent")
            self.root.mkdir(parents=True, mode=0o700)
            if os.name == "posix":
                os.chmod(self.root, 0o700)
        self._assert_directory(self.root, "store root")
        root_status = self.root.stat()
        if hasattr(os, "geteuid") and root_status.st_uid != os.geteuid():
            raise StoreCorruption("store root must be owned by the current service identity")
        self._root_identity = (root_status.st_dev, root_status.st_ino)
        self._root_real = self.root.resolve(strict=True)
        self._clock = clock
        self._authorize_hook = authorize or _deny
        self._source_policy_hook = source_policy
        self._cipher = cipher
        self._projection_purger = projection_purger
        self._projection_absent = projection_absent
        self._repository_root = (
            Path(repository_root).expanduser().resolve(strict=False)
            if repository_root is not None
            else None
        )
        self._verify_top_level_layout(allow_missing=create)
        if create:
            for name in self._TOP_LEVEL:
                self._ensure_directory(Path(name))
        self._verify_top_level_layout(allow_missing=False)
        self._lock_path = self._relative_path("locks", "store.lock")
        if create:
            self._atomic_create(self._lock_path, _LOCK_BYTES)
        self._verify_lock_layout()
        lock_key = os.fspath(self._root_real)
        with _LOCK_REGISTRY_GUARD:
            self._lock_state = _LOCK_REGISTRY.setdefault(lock_key, _ProcessLockState())

    @classmethod
    def open_existing(
        cls,
        root: str | os.PathLike[str],
        **kwargs: Any,
    ) -> "MemoryStore":
        """Open and verify an existing layout without creating or repairing files."""

        if "create" in kwargs:
            raise InvalidStoreInput("open_existing does not accept a create override")
        return cls(root, create=False, **kwargs)

    def _verify_top_level_layout(self, *, allow_missing: bool) -> None:
        try:
            children = sorted(self.root.iterdir(), key=lambda item: item.name)
        except OSError as exc:
            raise StoreCorruption(f"cannot enumerate store root: {exc}") from exc
        actual = {item.name for item in children}
        unexpected = actual - set(self._TOP_LEVEL)
        if unexpected:
            raise StoreCorruption(
                f"store root contains unsupported top-level entries: {sorted(unexpected)}"
            )
        if not allow_missing and actual != set(self._TOP_LEVEL):
            raise StoreCorruption(
                f"store root is missing required lanes: {sorted(set(self._TOP_LEVEL) - actual)}"
            )
        for item in children:
            self._assert_directory(item, f"top-level store lane {item.name}")

    def _verify_lock_layout(self) -> None:
        paths = self._walk_regular(Path("locks"))
        if paths != [self._lock_path] or self._read_regular(self._lock_path) != _LOCK_BYTES:
            raise StoreCorruption("store lock lane is missing or contains unsupported entries")

    @contextmanager
    def _transaction(self) -> Iterable[None]:
        state = self._lock_state
        with state.lock:
            depth = getattr(state.local, "depth", 0)
            if depth:
                state.local.depth = depth + 1
                try:
                    yield
                finally:
                    state.local.depth = depth
                return

            self._verify_lock_layout()
            with self._parent_fd(self._lock_path, create=False) as (parent_fd, name):
                flags = os.O_RDWR | getattr(os, "O_NOFOLLOW", 0)
                try:
                    descriptor = os.open(name, flags, dir_fd=parent_fd)
                except OSError as exc:
                    raise StoreCorruption(f"cannot open store transaction lock: {exc}") from exc
                locked = False
                try:
                    opened = self._validate_open_file(descriptor, self._lock_path)
                    if fcntl is not None:
                        fcntl.flock(descriptor, fcntl.LOCK_EX)
                        locked = True
                    elif msvcrt is not None:  # pragma: no cover - Windows fallback
                        os.lseek(descriptor, 0, os.SEEK_SET)
                        msvcrt.locking(descriptor, msvcrt.LK_LOCK, 1)
                        locked = True
                    else:  # pragma: no cover - unsupported platform
                        raise StoreCorruption(
                            "cross-process store transactions are unavailable on this platform"
                        )
                    current = os.stat(name, dir_fd=parent_fd, follow_symlinks=False)
                    if (current.st_dev, current.st_ino) != (opened.st_dev, opened.st_ino):
                        raise StoreCorruption("store transaction lock was replaced while acquiring")
                    state.local.depth = 1
                    try:
                        yield
                    finally:
                        state.local.depth = 0
                finally:
                    if locked:
                        if fcntl is not None:
                            fcntl.flock(descriptor, fcntl.LOCK_UN)
                        elif msvcrt is not None:  # pragma: no cover - Windows fallback
                            os.lseek(descriptor, 0, os.SEEK_SET)
                            msvcrt.locking(descriptor, msvcrt.LK_UNLCK, 1)
                    os.close(descriptor)

    def _ensure_protected_location(self) -> None:
        if self._repository_root is not None:
            require_protected_store_outside_repository(self.root, self._repository_root)
        # Inspect the resolved location as well as the lexical path.  A symlinked
        # ancestor must not be able to hide that purgeable bytes are inside Git.
        resolved = self._root_real
        candidates = dict.fromkeys(
            (self.root, *self.root.parents, resolved, *resolved.parents)
        )
        for candidate in candidates:
            git_marker = candidate / ".git"
            try:
                git_marker.lstat()
            except FileNotFoundError:
                continue
            except OSError as exc:
                raise StoreCorruption(f"cannot inspect Git boundary {git_marker}: {exc}") from exc
            raise InvalidStoreInput(
                f"purgeable memory stores must not be inside Git worktree {candidate}"
            )

    # ---------- closed paths and durable filesystem operations ----------

    @staticmethod
    def _assert_private_mode(path: Path, expected: int, label: str) -> None:
        if os.name != "posix":  # pragma: no cover - POSIX is exercised in CI
            return
        actual = stat.S_IMODE(path.lstat().st_mode)
        if actual != expected:
            raise StoreCorruption(f"{label} must have mode {expected:04o}, found {actual:04o}: {path}")

    def _assert_directory(self, path: Path, label: str) -> None:
        try:
            status = path.lstat()
        except OSError as exc:
            raise StoreCorruption(f"cannot inspect {label}: {path}: {exc}") from exc
        if stat.S_ISLNK(status.st_mode) or not stat.S_ISDIR(status.st_mode):
            raise StoreCorruption(f"{label} must be a real directory: {path}")
        self._assert_private_mode(path, 0o700, label)

    @staticmethod
    def _safe_component(value: str) -> None:
        if (
            not isinstance(value, str)
            or not value
            or value in {".", ".."}
            or "/" in value
            or "\\" in value
            or "\x00" in value
        ):
            raise InvalidStoreInput(f"unsafe store path component {value!r}")

    def _relative_path(self, *parts: str) -> Path:
        for part in parts:
            self._safe_component(part)
        return Path(*parts)

    def _absolute(self, relative: Path) -> Path:
        if relative.is_absolute() or any(part in {"", ".", ".."} for part in relative.parts):
            raise InvalidStoreInput(f"unsafe relative store path {relative}")
        candidate = self.root.joinpath(relative)
        try:
            candidate.relative_to(self.root)
        except ValueError as exc:  # defensive; relative is already closed above
            raise InvalidStoreInput("store path escapes root") from exc
        return candidate

    def _open_root_fd(self) -> int:
        if os.name != "posix":  # pragma: no cover - Phase 2 reference is POSIX-only
            raise StoreCorruption(
                "secure directory-descriptor store operations require POSIX"
            )
        flags = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0)
        try:
            descriptor = os.open(self.root, flags)
        except OSError as exc:
            raise StoreCorruption(f"cannot open store root securely: {exc}") from exc
        status = os.fstat(descriptor)
        if (
            not stat.S_ISDIR(status.st_mode)
            or (status.st_dev, status.st_ino) != self._root_identity
            or stat.S_IMODE(status.st_mode) != 0o700
            or (hasattr(os, "geteuid") and status.st_uid != os.geteuid())
        ):
            os.close(descriptor)
            raise StoreCorruption("store root identity, owner, type, or mode changed")
        return descriptor

    @contextmanager
    def _parent_fd(self, relative: Path, *, create: bool) -> Iterable[tuple[int, str]]:
        self._absolute(relative)
        if not relative.parts:
            raise InvalidStoreInput("store operation requires a file path")
        for part in relative.parts:
            self._safe_component(part)
        current_fd = self._open_root_fd()
        flags = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0)
        try:
            for part in relative.parent.parts:
                if create:
                    created = False
                    try:
                        os.mkdir(part, mode=0o700, dir_fd=current_fd)
                        created = True
                    except FileExistsError:
                        pass
                    except OSError as exc:
                        raise StoreCorruption(
                            f"cannot create store directory component {part}: {exc}"
                        ) from exc
                    if created:
                        os.fsync(current_fd)
                try:
                    next_fd = os.open(part, flags, dir_fd=current_fd)
                except FileNotFoundError as exc:
                    raise StoreNotFound(
                        f"store entry parent is absent: {relative.as_posix()}"
                    ) from exc
                except OSError as exc:
                    raise StoreCorruption(
                        f"cannot traverse store directory component {part}: {exc}"
                    ) from exc
                status = os.fstat(next_fd)
                if (
                    not stat.S_ISDIR(status.st_mode)
                    or stat.S_IMODE(status.st_mode) != 0o700
                    or (hasattr(os, "geteuid") and status.st_uid != os.geteuid())
                ):
                    os.close(next_fd)
                    raise StoreCorruption(
                        f"store directory component {part} has unsafe type, owner, or mode"
                    )
                os.close(current_fd)
                current_fd = next_fd
            yield current_fd, relative.name
        finally:
            os.close(current_fd)

    @staticmethod
    def _validate_open_file(descriptor: int, relative: Path) -> os.stat_result:
        status = os.fstat(descriptor)
        if not stat.S_ISREG(status.st_mode):
            raise StoreCorruption(
                f"store entry must be a regular file: {relative.as_posix()}"
            )
        if status.st_nlink != 1:
            raise StoreCorruption(
                f"store entry must not have external hard links: {relative.as_posix()}"
            )
        if stat.S_IMODE(status.st_mode) != 0o600:
            raise StoreCorruption(
                f"store file must have mode 0600: {relative.as_posix()}"
            )
        if hasattr(os, "geteuid") and status.st_uid != os.geteuid():
            raise StoreCorruption(
                f"store file must be owned by the current service identity: {relative.as_posix()}"
            )
        return status

    def _read_regular_at(self, parent_fd: int, name: str, relative: Path) -> bytes:
        flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
        try:
            descriptor = os.open(name, flags, dir_fd=parent_fd)
        except FileNotFoundError as exc:
            raise StoreNotFound(f"store entry is absent: {relative.as_posix()}") from exc
        except OSError as exc:
            raise StoreCorruption(f"cannot open store entry {relative}: {exc}") from exc
        try:
            self._validate_open_file(descriptor, relative)
            chunks: list[bytes] = []
            while True:
                chunk = os.read(descriptor, 1024 * 1024)
                if not chunk:
                    break
                chunks.append(chunk)
            return b"".join(chunks)
        finally:
            os.close(descriptor)

    def _ensure_directory(self, relative: Path) -> Path:
        marker = relative / ".directory-fd-marker"
        with self._parent_fd(marker, create=True):
            pass
        return self._absolute(relative)

    def _read_regular(self, relative: Path) -> bytes:
        with self._parent_fd(relative, create=False) as (parent_fd, name):
            return self._read_regular_at(parent_fd, name, relative)

    @staticmethod
    def _write_all(descriptor: int, data: bytes) -> None:
        view = memoryview(data)
        while view:
            written = os.write(descriptor, view)
            if written <= 0:  # pragma: no cover - defensive kernel failure
                raise OSError("short write")
            view = view[written:]

    def _temporary_file_at(self, parent_fd: int, data: bytes) -> str:
        name = ".tmp-" + secrets.token_hex(16)
        flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
        descriptor = os.open(name, flags, 0o600, dir_fd=parent_fd)
        try:
            os.fchmod(descriptor, 0o600)
            self._write_all(descriptor, data)
            os.fsync(descriptor)
        except BaseException:
            os.close(descriptor)
            try:
                os.unlink(name, dir_fd=parent_fd)
            except OSError:
                pass
            raise
        os.close(descriptor)
        return name

    def _atomic_create(self, relative: Path, data: bytes) -> bool:
        with self._parent_fd(relative, create=True) as (parent_fd, destination):
            try:
                existing = self._read_regular_at(parent_fd, destination, relative)
            except StoreNotFound:
                existing = None
            if existing is not None:
                if existing != data:
                    raise StoreConflict(f"immutable address already contains different bytes: {relative}")
                return False
            temporary = self._temporary_file_at(parent_fd, data)
            try:
                try:
                    os.link(
                        temporary,
                        destination,
                        src_dir_fd=parent_fd,
                        dst_dir_fd=parent_fd,
                        follow_symlinks=False,
                    )
                except FileExistsError:
                    existing = self._read_regular_at(parent_fd, destination, relative)
                    if existing != data:
                        raise StoreConflict(
                            f"concurrent writer stored different bytes at immutable address: {relative}"
                        )
                    return False
                os.fsync(parent_fd)
                return True
            finally:
                try:
                    os.unlink(temporary, dir_fd=parent_fd)
                except FileNotFoundError:
                    pass
                os.fsync(parent_fd)

    def _atomic_replace(self, relative: Path, data: bytes) -> None:
        with self._parent_fd(relative, create=True) as (parent_fd, destination):
            try:
                self._read_regular_at(parent_fd, destination, relative)
            except StoreNotFound:
                pass
            temporary = self._temporary_file_at(parent_fd, data)
            try:
                os.replace(
                    temporary,
                    destination,
                    src_dir_fd=parent_fd,
                    dst_dir_fd=parent_fd,
                )
                os.fsync(parent_fd)
            finally:
                try:
                    os.unlink(temporary, dir_fd=parent_fd)
                except FileNotFoundError:
                    pass

    def _delete_regular(self, relative: Path) -> str | None:
        try:
            parent_context = self._parent_fd(relative, create=False)
            parent_fd, name = parent_context.__enter__()
        except StoreNotFound:
            return None
        try:
            flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
            try:
                descriptor = os.open(name, flags, dir_fd=parent_fd)
            except FileNotFoundError:
                return None
            except OSError as exc:
                raise StoreCorruption(f"cannot open store entry {relative}: {exc}") from exc
            try:
                opened = self._validate_open_file(descriptor, relative)
            finally:
                os.close(descriptor)
            try:
                current = os.stat(name, dir_fd=parent_fd, follow_symlinks=False)
            except FileNotFoundError:
                return None
            if (current.st_dev, current.st_ino) != (opened.st_dev, opened.st_ino):
                raise StoreCorruption(
                    f"store entry changed immediately before delete: {relative.as_posix()}"
                )
            os.unlink(name, dir_fd=parent_fd)
            os.fsync(parent_fd)
            return relative.as_posix()
        finally:
            parent_context.__exit__(None, None, None)

    def _walk_regular(self, relative: Path) -> list[Path]:
        base = self._absolute(relative)
        try:
            base.lstat()
        except FileNotFoundError:
            return []
        except OSError as exc:
            raise StoreCorruption(f"cannot inspect store tree {base}: {exc}") from exc
        self._assert_directory(base, "store directory")
        result: list[Path] = []
        for current_text, directories, files in os.walk(base, topdown=True, followlinks=False):
            current = Path(current_text)
            self._assert_directory(current, "store directory")
            directories.sort()
            files.sort()
            for name in directories:
                child = current / name
                status = child.lstat()
                if stat.S_ISLNK(status.st_mode) or not stat.S_ISDIR(status.st_mode):
                    raise StoreCorruption(f"symlink or non-directory in store tree: {child}")
                self._assert_private_mode(child, 0o700, "store directory")
            for name in files:
                child = current / name
                child_relative = child.relative_to(self.root)
                self._read_regular(child_relative)
                result.append(child_relative)
        return sorted(result, key=lambda item: item.as_posix())

    # ---------- partitions, descriptors, and encryption ----------

    @staticmethod
    def _entry_kind(ref: EntryRef) -> str:
        return "object" if isinstance(ref, ObjectRef) else "event"

    @staticmethod
    def _entry_digest(ref: EntryRef) -> str:
        return ref.sha256 if isinstance(ref, ObjectRef) else ref.record_sha256

    def _partition_parts(self, ref: EntryRef) -> tuple[str, ...]:
        return (
            ref.policy.classification,
            ref.policy.retention,
            ref.policy.partition_sha256,
            ref.acquisition_id,
            ref.source_version_id,
            self._entry_digest(ref)[:2],
        )

    def _content_path(self, ref: EntryRef) -> Path:
        kind = self._entry_kind(ref)
        suffix = ".blob" if kind == "object" else ".event"
        return self._relative_path(
            kind + "s", *self._partition_parts(ref), self._entry_digest(ref) + suffix
        )

    def _descriptor_path(self, ref: EntryRef) -> Path:
        kind = self._entry_kind(ref)
        return self._relative_path(
            "descriptors",
            kind,
            *self._partition_parts(ref),
            self._entry_digest(ref) + ".json",
        )

    def _key_path(self, ref: EntryRef) -> Path:
        kind = self._entry_kind(ref)
        return self._relative_path(
            "keys", kind, *self._partition_parts(ref), self._entry_digest(ref) + ".key.json"
        )

    def _retired_path(self, ref: EntryRef) -> Path:
        kind = self._entry_kind(ref)
        return self._relative_path(
            "retired",
            kind,
            *self._partition_parts(ref),
            self._entry_digest(ref) + ".retired.json",
        )

    def _retired_bytes(self, ref: EntryRef, tombstone_event_ids: Sequence[str]) -> bytes:
        identifiers = sorted(set(tombstone_event_ids))
        if not identifiers or any(_EVENT_ID_RE.fullmatch(item) is None for item in identifiers):
            raise InvalidStoreInput("retired markers require canonical tombstone event IDs")
        return canonical_json_bytes(
            {
                "schema": "memory-local-retired-target/v1",
                "kind": self._entry_kind(ref),
                "ref": ref.to_dict(),
                "ref_sha256": canonical_sha256(ref.to_dict()),
                "tombstone_event_ids": identifiers,
            }
        )

    def _assert_not_retired(self, ref: EntryRef) -> None:
        path = self._retired_path(ref)
        if self._absolute(path).exists() or self._absolute(path).is_symlink():
            stored_ref, _ = self._load_retired_marker(path)
            if stored_ref != ref:
                raise StoreCorruption("retired marker path does not match its exact reference")
            raise StoreConflict("immutable address has been retired by a completed or pending purge")

    def _retire(self, ref: EntryRef, tombstone_event_ids: Sequence[str]) -> None:
        self._atomic_create(self._retired_path(ref), self._retired_bytes(ref, tombstone_event_ids))

    def _load_retired_marker(self, relative: Path) -> tuple[EntryRef, tuple[str, ...]]:
        marker = self._load_canonical_object(relative)
        if (
            set(marker)
            != {"schema", "kind", "ref", "ref_sha256", "tombstone_event_ids"}
            or marker.get("schema") != "memory-local-retired-target/v1"
            or marker.get("kind") not in {"object", "event"}
        ):
            raise StoreCorruption(f"retired marker has unsupported shape: {relative}")
        try:
            ref: EntryRef
            if marker["kind"] == "object":
                ref = ObjectRef.from_dict(marker["ref"])
            else:
                ref = EventRef.from_dict(marker["ref"])
        except InvalidStoreInput as exc:
            raise StoreCorruption(f"retired marker has an invalid exact ref: {relative}: {exc}") from exc
        if marker.get("ref_sha256") != canonical_sha256(ref.to_dict()):
            raise StoreCorruption(f"retired marker ref digest mismatch: {relative}")
        tombstones = marker.get("tombstone_event_ids")
        if (
            not isinstance(tombstones, list)
            or not tombstones
            or tombstones != sorted(set(tombstones))
            or any(not isinstance(item, str) or _EVENT_ID_RE.fullmatch(item) is None for item in tombstones)
        ):
            raise StoreCorruption(f"retired marker has invalid tombstone IDs: {relative}")
        if relative != self._retired_path(ref):
            raise StoreCorruption(f"retired marker is stored at the wrong exact path: {relative}")
        return ref, tuple(tombstones)

    def _retired_refs(self) -> list[EntryRef]:
        refs = [
            self._load_retired_marker(relative)[0]
            for relative in self._walk_regular(Path("retired"))
        ]
        if len({canonical_sha256(item.to_dict()) for item in refs}) != len(refs):
            raise StoreCorruption("multiple retired markers claim one exact reference")
        return refs

    def _purge_intent_path(self, event_id: str) -> Path:
        if not isinstance(event_id, str) or _EVENT_ID_RE.fullmatch(event_id) is None:
            raise InvalidStoreInput("purge target event_id must be canonical")
        return self._relative_path("purges", event_id + ".intent.json")

    def _purge_complete_path(self, event_id: str) -> Path:
        if not isinstance(event_id, str) or _EVENT_ID_RE.fullmatch(event_id) is None:
            raise InvalidStoreInput("purge target event_id must be canonical")
        return self._relative_path("purges", event_id + ".complete.json")

    def _backup_path(self, ref: EntryRef, backup_id: str, *, key: bool) -> Path:
        if not isinstance(backup_id, str) or _BACKUP_ID_RE.fullmatch(backup_id) is None:
            raise InvalidStoreInput("backup_id must use lowercase safe path characters")
        kind = self._entry_kind(ref)
        lane = "keys" if key else "content"
        suffix = ".key.json" if key else ".backup"
        return self._relative_path(
            "backups",
            lane,
            kind,
            *self._partition_parts(ref),
            self._entry_digest(ref),
            backup_id + suffix,
        )

    def _backup_root(self, ref: EntryRef, *, key: bool) -> Path:
        kind = self._entry_kind(ref)
        return self._relative_path(
            "backups",
            "keys" if key else "content",
            kind,
            *self._partition_parts(ref),
            self._entry_digest(ref),
        )

    def _descriptor_bytes(
        self,
        ref: EntryRef,
        *,
        object_manifest: Mapping[str, Any] | None = None,
    ) -> bytes:
        descriptor: dict[str, Any] = {
            "schema": DESCRIPTOR_SCHEMA,
            "kind": self._entry_kind(ref),
            "ref": ref.to_dict(),
        }
        if isinstance(ref, ObjectRef):
            if object_manifest is None:
                raise InvalidStoreInput("object descriptors require the authoritative object manifest")
            descriptor["object_manifest"] = dict(object_manifest)
        return canonical_json_bytes(descriptor)

    def _aad(self, kind: str, ref: EntryRef) -> bytes:
        # AAD is always constructed here; callers cannot weaken or replace the binding.
        return canonical_json_bytes(
            {
                "schema": AAD_SCHEMA,
                "kind": kind,
                "acquisition_id": ref.acquisition_id,
                "source_version_id": ref.source_version_id,
                "policy": ref.policy.to_dict(),
                "manifest_sha256": (
                    ref.manifest_sha256 if isinstance(ref, ObjectRef) else None
                ),
                "sha256": self._entry_digest(ref),
            }
        )

    def _require_cipher(self) -> AuthenticatedCipher:
        if self._cipher is None:
            raise EncryptionRequired(
                "licensed, confidential, and restricted storage requires authenticated encryption"
            )
        return self._cipher

    @staticmethod
    def _decode_key_envelope(raw: bytes) -> dict[str, str]:
        try:
            value = json.loads(raw)
        except (UnicodeError, json.JSONDecodeError) as exc:
            raise StoreCorruption(f"wrapped key envelope is invalid JSON: {exc}") from exc
        if not isinstance(value, dict) or not all(
            isinstance(key, str) and isinstance(item, str) for key, item in value.items()
        ):
            raise StoreCorruption("wrapped key envelope must be a string-to-string object")
        try:
            canonical = canonical_json_bytes(value)
        except (TypeError, ValueError, UnicodeError) as exc:
            raise StoreCorruption(f"wrapped key envelope is not canonical JSON: {exc}") from exc
        if raw != canonical:
            raise StoreCorruption("wrapped key envelope bytes are not canonical")
        dek_id = value.get("dek_id")
        if not isinstance(dek_id, str) or _DEK_ID_RE.fullmatch(dek_id) is None:
            raise StoreCorruption("wrapped key envelope has invalid dek_id")
        return value

    def _assert_fresh_dek(self, envelope: Mapping[str, str], destination: Path) -> None:
        dek_id = envelope.get("dek_id")
        if not isinstance(dek_id, str) or _DEK_ID_RE.fullmatch(dek_id) is None:
            raise StoreCorruption("cipher returned an invalid per-object dek_id")
        for relative in (
            *self._walk_regular(Path("keys")),
            *self._walk_regular(Path("backups") / "keys"),
        ):
            existing = self._decode_key_envelope(self._read_regular(relative))
            if existing.get("dek_id") == dek_id:
                raise StoreConflict("cipher reused a DEK envelope identity for another address")

    def _encrypt(self, kind: str, ref: EntryRef, plaintext: bytes) -> tuple[bytes, bytes]:
        cipher = self._require_cipher()
        try:
            sealed = cipher.encrypt(plaintext, associated_data=self._aad(kind, ref))
        except (MemoryCryptoError, TypeError, ValueError) as exc:
            raise StoreCorruption(f"authenticated encryption failed: {exc}") from exc
        if not isinstance(sealed, EncryptedObject) or not isinstance(sealed.ciphertext, bytes):
            raise StoreCorruption("cipher returned an unsupported encrypted object")
        if sealed.ciphertext == plaintext:
            raise StoreCorruption("cipher returned plaintext bytes as ciphertext")
        try:
            envelope_bytes = canonical_json_bytes(sealed.key_envelope)
        except (TypeError, ValueError, UnicodeError) as exc:
            raise StoreCorruption(f"cipher returned a non-canonical key envelope: {exc}") from exc
        envelope = self._decode_key_envelope(envelope_bytes)
        self._assert_fresh_dek(envelope, self._key_path(ref))
        return sealed.ciphertext, envelope_bytes

    def _decrypt(self, kind: str, ref: EntryRef, ciphertext: bytes, envelope_bytes: bytes) -> bytes:
        cipher = self._require_cipher()
        envelope = self._decode_key_envelope(envelope_bytes)
        try:
            plaintext = cipher.decrypt(
                ciphertext,
                envelope,
                associated_data=self._aad(kind, ref),
            )
        except (MemoryCryptoError, TypeError, ValueError) as exc:
            raise StoreCorruption(f"protected entry failed authentication: {exc}") from exc
        if not isinstance(plaintext, bytes):
            raise StoreCorruption("cipher returned non-bytes plaintext")
        return plaintext

    def _logical_bytes(self, ref: EntryRef) -> bytes:
        stored = self._read_regular(self._content_path(ref))
        if ref.encrypted:
            envelope = self._read_regular(self._key_path(ref))
            logical = self._decrypt(self._entry_kind(ref), ref, stored, envelope)
        else:
            if (
                self._absolute(self._key_path(ref)).exists()
                or self._absolute(self._key_path(ref)).is_symlink()
            ):
                raise StoreCorruption("unprotected entry unexpectedly has a wrapped key")
            logical = stored
        digest = hashlib.sha256(logical).hexdigest()
        expected_digest = self._entry_digest(ref)
        expected_length = ref.byte_length if isinstance(ref, ObjectRef) else ref.record_byte_length
        if digest != expected_digest:
            raise StoreCorruption(
                f"entry digest mismatch: expected {expected_digest}, found {digest}"
            )
        if len(logical) != expected_length:
            raise StoreCorruption(
                f"entry size mismatch: expected {expected_length}, found {len(logical)}"
            )
        descriptor = self._load_descriptor(
            self._descriptor_path(ref), self._entry_kind(ref)
        )
        if descriptor.get("ref") != ref.to_dict():
            raise StoreCorruption("entry descriptor does not match its immutable reference")
        if isinstance(ref, ObjectRef):
            manifest = descriptor.get("object_manifest")
            errors = validate_object_manifest(manifest)
            if errors:
                raise StoreCorruption("stored object manifest is invalid: " + "; ".join(errors[:8]))
            if object_manifest_sha256(manifest) != ref.manifest_sha256:
                raise StoreCorruption("stored object manifest digest differs from its reference")
            content_errors = verify_object_content(
                manifest,
                logical,
                media_type=manifest.get("media_type"),
            )
            if content_errors:
                raise StoreCorruption(
                    "stored object bytes differ from their manifest: "
                    + "; ".join(content_errors[:8])
                )
        return logical

    def _write_entry(
        self,
        ref: EntryRef,
        plaintext: bytes,
        *,
        object_manifest: Mapping[str, Any] | None = None,
    ) -> None:
        descriptor_path = self._descriptor_path(ref)
        if self._absolute(descriptor_path).exists() or self._absolute(descriptor_path).is_symlink():
            if self._logical_bytes(ref) != plaintext:
                raise StoreConflict("immutable reference already resolves to different bytes")
            return
        content_path = self._content_path(ref)
        if self._absolute(content_path).exists() or self._absolute(content_path).is_symlink():
            raise StoreCorruption("orphan content exists without its committed descriptor")
        if ref.encrypted:
            ciphertext, envelope = self._encrypt(self._entry_kind(ref), ref, plaintext)
            content_created = self._atomic_create(content_path, ciphertext)
            try:
                self._atomic_create(self._key_path(ref), envelope)
            except BaseException:
                if content_created:
                    self._delete_regular(content_path)
                raise
        else:
            self._atomic_create(content_path, plaintext)
        try:
            self._atomic_create(
                descriptor_path,
                self._descriptor_bytes(ref, object_manifest=object_manifest),
            )
        except BaseException:
            # A missing descriptor means the write was not committed.  Remove only files
            # created at this exact address; no immutable descriptor can point at them.
            self._delete_regular(content_path)
            if ref.encrypted:
                self._delete_regular(self._key_path(ref))
            raise

    # ---------- authorization and public reads/writes ----------

    def _request(
        self,
        action: str,
        ref: EntryRef,
        *,
        principal: object | None,
    ) -> AccessRequest:
        return AccessRequest(
            action=action,
            kind=self._entry_kind(ref),
            acquisition_id=ref.acquisition_id,
            source_version_id=ref.source_version_id,
            policy=ref.policy,
            digest=self._entry_digest(ref),
            event_id=ref.event_id if isinstance(ref, EventRef) else None,
            principal=principal,
        )

    def _authorize(self, action: str, ref: EntryRef, principal: object | None) -> None:
        if ref.policy.requires_external_store:
            self._ensure_protected_location()
        request = self._request(action, ref, principal=principal)
        live_access_actions = {
            "write",
            "read",
            "backup",
            "projection",
            "restore",
            "resolve",
            "export",
            "bind",
            "derive",
            "audit",
        }
        if action in live_access_actions and ref.policy.retention == "expires":
            now = self._clock()
            if not isinstance(now, dt.datetime) or now.tzinfo is None or now.utcoffset() is None:
                raise StoreCorruption("injected clock must return a timezone-aware datetime")
            expiry = parse_aware_datetime(ref.policy.retain_until)  # type: ignore[arg-type]
            if now.astimezone(dt.timezone.utc) >= expiry:
                raise ExpiredContent("entry retention period has ended")
        if action in live_access_actions and ref.policy.retention == "source-policy":
            if self._source_policy_hook is None:
                raise AccessDenied("source-policy entry requires a source authorization hook")
            try:
                source_allowed = self._source_policy_hook(request)
            except Exception as exc:
                raise AccessDenied("source-policy authorization failed closed") from exc
            if source_allowed is not True:
                raise AccessDenied("source policy denied access")
        try:
            allowed = self._authorize_hook(request)
        except Exception as exc:
            raise AccessDenied("authorization hook failed closed") from exc
        if allowed is not True:
            raise AccessDenied(f"authorization denied {action}")

    @staticmethod
    def _coerce_bytes(value: object, field: str) -> bytes:
        if isinstance(value, bytes):
            return value
        if isinstance(value, (bytearray, memoryview)):
            return bytes(value)
        raise InvalidStoreInput(f"{field} must be bytes-like")

    @_transactional
    def put_object(
        self,
        object_manifest: Mapping[str, Any],
        exact_bytes: bytes,
        *,
        principal: object | None = None,
    ) -> ObjectRef:
        """Persist exact bytes only under their complete validated intake manifest."""

        raw = self._coerce_bytes(exact_bytes, "exact_bytes")
        if not isinstance(object_manifest, Mapping):
            raise InvalidStoreInput("object_manifest must be an object")
        manifest = json.loads(canonical_json_bytes(dict(object_manifest)))
        errors = validate_object_manifest(manifest)
        if not errors:
            errors = verify_object_content(
                manifest,
                raw,
                media_type=manifest.get("media_type"),
            )
        if errors:
            raise InvalidStoreInput("invalid object manifest/content: " + "; ".join(errors[:12]))
        policy = StoragePolicy.from_dict(manifest["policy"])
        acquisition_id = manifest["acquisition_id"]
        source_version_id = manifest["source_version_id"]
        content_digest = manifest["content_sha256"].removeprefix("sha256:")
        ref = ObjectRef(
            acquisition_id=acquisition_id,
            source_version_id=source_version_id,
            policy=policy,
            manifest_sha256=object_manifest_sha256(manifest),
            sha256=content_digest,
            byte_length=manifest["byte_length"],
            encrypted=policy.protected,
        )
        self._authorize("write", ref, principal)
        # An acquisition is one rights-bearing intake lane, not an alias for
        # content.  It may contain its source plus derived artifacts, but its
        # version/policy are invariant and one content ID cannot be laundered into
        # a different manifest within that lane.
        existing_objects = self._object_refs(verify=False)
        matching_acquisitions = [
            item for item in existing_objects if item.acquisition_id == ref.acquisition_id
        ]
        if any(
            isinstance(item, ObjectRef) and item.acquisition_id == ref.acquisition_id
            for item in self._retired_refs()
        ):
            raise StoreConflict(
                f"acquisition_id {ref.acquisition_id} has retired content and cannot be reopened"
            )
        if matching_acquisitions:
            if any(
                item.source_version_id != ref.source_version_id or item.policy != ref.policy
                for item in matching_acquisitions
            ):
                raise StoreConflict(
                    f"acquisition_id {ref.acquisition_id} cannot change source version or policy"
                )
            same_content = [item for item in matching_acquisitions if item.sha256 == ref.sha256]
            if same_content and same_content != [ref]:
                raise StoreConflict(
                    f"acquisition_id {ref.acquisition_id} already binds this content to another manifest"
                )
            if manifest.get("object_kind") == "source" and ref not in matching_acquisitions:
                for item in matching_acquisitions:
                    existing_manifest = self._object_manifest(item)
                    if existing_manifest.get("object_kind") == "source":
                        raise StoreConflict(
                            f"acquisition_id {ref.acquisition_id} already has a source object"
                        )
        self._authorize_derivative_lineage(
            manifest,
            {self._object_key(item): item for item in existing_objects},
            principal=principal,
        )
        if ref.encrypted:
            self._ensure_protected_location()
            self._require_cipher()
        self._assert_not_retired(ref)
        self._write_entry(ref, raw, object_manifest=manifest)
        return ref

    @staticmethod
    def _event_record(
        event: Mapping[str, Any],
        acquisition_id: str,
        source_version_id: str,
        objects: Sequence[ObjectRef],
    ) -> dict[str, Any]:
        return {
            "schema": EVENT_RECORD_SCHEMA,
            "acquisition_id": acquisition_id,
            "source_version_id": source_version_id,
            "event": dict(event),
            "objects": [item.to_dict() for item in objects],
        }

    def _event_refs(self, *, verify: bool = True) -> list[EventRef]:
        refs: list[EventRef] = []
        for relative in self._walk_regular(Path("descriptors") / "event"):
            value = self._load_descriptor(relative, "event")
            ref = EventRef.from_dict(value["ref"])
            if relative != self._descriptor_path(ref):
                raise StoreCorruption(f"event descriptor is stored at the wrong path: {relative}")
            refs.append(ref)
        refs.sort(key=lambda item: (item.event_id, item.record_sha256))
        if len({item.event_id for item in refs}) != len(refs):
            raise StoreCorruption("multiple immutable records claim the same event_id")
        if verify:
            self._validate_event_corpus(self._stored_event_rows(refs), stored=True)
        return refs

    def _object_refs(self, *, verify: bool = True) -> list[ObjectRef]:
        refs: list[ObjectRef] = []
        for relative in self._walk_regular(Path("descriptors") / "object"):
            value = self._load_descriptor(relative, "object")
            ref = ObjectRef.from_dict(value["ref"])
            if relative != self._descriptor_path(ref):
                raise StoreCorruption(f"object descriptor is stored at the wrong path: {relative}")
            if verify:
                self._logical_bytes(ref)
            refs.append(ref)
        refs.sort(key=lambda item: (item.acquisition_id, item.source_version_id, item.sha256))
        by_acquisition: dict[str, list[ObjectRef]] = {}
        for item in refs:
            by_acquisition.setdefault(item.acquisition_id, []).append(item)
        for acquisition_id, group in by_acquisition.items():
            if len({item.source_version_id for item in group}) != 1:
                raise StoreCorruption(
                    f"acquisition {acquisition_id} spans multiple source versions"
                )
            if len({item.policy for item in group}) != 1:
                raise StoreCorruption(f"acquisition {acquisition_id} spans multiple policies")
            content_bindings: dict[str, str] = {}
            source_count = 0
            for item in group:
                prior = content_bindings.setdefault(item.sha256, item.manifest_sha256)
                if prior != item.manifest_sha256:
                    raise StoreCorruption(
                        f"acquisition {acquisition_id} binds one content ID to multiple manifests"
                    )
                if self._object_manifest(item).get("object_kind") == "source":
                    source_count += 1
            if source_count > 1:
                raise StoreCorruption(f"acquisition {acquisition_id} has multiple source objects")
        return refs

    def _load_descriptor(self, relative: Path, kind: str) -> dict[str, Any]:
        raw = self._read_regular(relative)
        try:
            value = json.loads(raw)
        except (UnicodeError, json.JSONDecodeError) as exc:
            raise StoreCorruption(f"descriptor is invalid JSON: {relative}: {exc}") from exc
        expected = {"schema", "kind", "ref"}
        if kind == "object":
            expected.add("object_manifest")
        if (
            not isinstance(value, dict)
            or set(value) != expected
            or value.get("schema") != DESCRIPTOR_SCHEMA
            or value.get("kind") != kind
        ):
            raise StoreCorruption(f"descriptor has unsupported shape: {relative}")
        if raw != canonical_json_bytes(value):
            raise StoreCorruption(f"descriptor is not canonical JSON: {relative}")
        return value

    def _decode_event_record_unbound(self, ref: EventRef, raw: bytes) -> dict[str, Any]:
        """Decode one record without resolving its cross-event Phase 2 dependencies."""

        try:
            value = json.loads(raw)
        except (UnicodeError, json.JSONDecodeError) as exc:
            raise StoreCorruption(f"event record is invalid JSON: {exc}") from exc
        required = {"schema", "acquisition_id", "source_version_id", "event", "objects"}
        if not isinstance(value, dict) or set(value) != required:
            raise StoreCorruption("event record has unsupported or missing fields")
        if value.get("schema") != EVENT_RECORD_SCHEMA or raw != canonical_json_bytes(value):
            raise StoreCorruption("event record is not canonical memory-local-event-record/v1")
        if value.get("acquisition_id") != ref.acquisition_id:
            raise StoreCorruption("event record acquisition_id differs from its reference")
        if value.get("source_version_id") != ref.source_version_id:
            raise StoreCorruption("event record source_version_id differs from its reference")
        event = value.get("event")
        if not isinstance(event, dict):
            raise StoreCorruption("event record event must be an object")
        errors = validate_event(event)
        if errors:
            raise StoreCorruption("stored event is invalid: " + "; ".join(errors[:8]))
        if event.get("event_id") != ref.event_id or StoragePolicy.from_event(event) != ref.policy:
            raise StoreCorruption("event identity or policy differs from its reference")
        object_values = value.get("objects")
        if not isinstance(object_values, list):
            raise StoreCorruption("event record objects must be a list")
        objects = tuple(ObjectRef.from_dict(item) for item in object_values)
        if objects != ref.objects:
            raise StoreCorruption("event record object bindings differ from its reference")
        return event

    def _stored_event_rows(
        self,
        refs: Sequence[EventRef] | None = None,
    ) -> dict[str, tuple[EventRef, dict[str, Any]]]:
        selected = tuple(refs) if refs is not None else tuple(self._event_refs(verify=False))
        rows: dict[str, tuple[EventRef, dict[str, Any]]] = {}
        for ref in selected:
            event = self._decode_event_record_unbound(ref, self._logical_bytes(ref))
            if ref.event_id in rows:
                raise StoreCorruption(f"multiple records claim event_id {ref.event_id}")
            rows[ref.event_id] = (ref, event)
        return rows

    def _validate_event_corpus(
        self,
        rows: Mapping[str, tuple[EventRef, Mapping[str, Any]]],
        *,
        stored: bool,
    ) -> None:
        try:
            for event_id in sorted(rows):
                ref, event = rows[event_id]
                self._validate_event_object_bindings(
                    event,
                    ref.objects,
                    acquisition_id=ref.acquisition_id,
                    source_version_id=ref.source_version_id,
                    event_rows=rows,
                )
        except InvalidStoreInput as exc:
            if stored:
                raise StoreCorruption(f"stored event corpus is invalid: {exc}") from exc
            raise

    def _decode_event_record(
        self,
        ref: EventRef,
        raw: bytes,
        *,
        principal: object | None = None,
        dependency_action: str | None = None,
    ) -> dict[str, Any]:
        event = self._decode_event_record_unbound(ref, raw)
        payload = event.get("payload")
        typed = isinstance(payload, Mapping) and payload.get("schema") in {
            "memory-source/v2",
            "memory-evidence-span/v2",
            "memory-extraction-artifact/v1",
        }
        if typed:
            if dependency_action is None:
                rows = self._stored_event_rows()
                stored = rows.get(ref.event_id)
                if stored is None or stored[0] != ref or stored[1] != event:
                    raise StoreCorruption("event record is not the store's exact committed event")
                self._validate_event_corpus(rows, stored=True)
            else:
                candidates = [
                    item
                    for item in self._event_refs(verify=False)
                    if item.acquisition_id == ref.acquisition_id
                    and item.source_version_id == ref.source_version_id
                    and item.policy == ref.policy
                    and any(bound in item.objects for bound in ref.objects)
                ]
                rows: dict[str, tuple[EventRef, Mapping[str, Any]]] = {
                    ref.event_id: (ref, event)
                }
                for candidate in candidates:
                    if candidate == ref:
                        continue
                    self._authorize(dependency_action, candidate, principal)
                    rows[candidate.event_id] = (
                        candidate,
                        self._decode_event_record_unbound(
                            candidate,
                            self._logical_bytes(candidate),
                        ),
                    )
                try:
                    self._validate_event_object_bindings(
                        event,
                        ref.objects,
                        acquisition_id=ref.acquisition_id,
                        source_version_id=ref.source_version_id,
                        event_rows=rows,
                    )
                except InvalidStoreInput as exc:
                    raise StoreCorruption(
                        f"stored typed event dependencies are invalid: {exc}"
                    ) from exc
        else:
            try:
                self._validate_event_object_bindings(
                    event,
                    ref.objects,
                    acquisition_id=ref.acquisition_id,
                    source_version_id=ref.source_version_id,
                )
            except InvalidStoreInput as exc:
                raise StoreCorruption(
                    f"stored event has invalid object bindings: {exc}"
                ) from exc
        return event

    @staticmethod
    def _object_pointer_key(ref: ObjectRef) -> tuple[str, str, str, str]:
        return (
            ref.acquisition_id,
            ref.source_version_id,
            ref.manifest_sha256,
            ref.sha256,
        )

    def _validate_event_object_bindings(
        self,
        event: Mapping[str, Any],
        objects: Sequence[ObjectRef],
        *,
        acquisition_id: str,
        source_version_id: str,
        event_rows: Mapping[str, tuple[EventRef, Mapping[str, Any]]] | None = None,
    ) -> None:
        """Bind typed payloads to exact manifests and prior typed events.

        Content IDs deliberately do not select an acquisition.  Typed Phase 2
        payloads name object/hash pairs only inside their explicitly supplied
        acquisition/version bindings.  Source, extraction, and evidence records are
        then checked with the complete persisted manifests and the unique prior
        source/extraction records required by the closed Phase 2 contract.
        """

        bound = tuple(objects)
        bound_keys = {self._object_pointer_key(item) for item in bound}
        by_pair: dict[tuple[str, str], list[ObjectRef]] = {}
        for item in bound:
            by_pair.setdefault(
                (item.object_id, "sha256:" + item.sha256), []
            ).append(item)

        referenced_keys: set[tuple[str, str, str, str]] = set()

        def require_pair(
            object_id: object,
            content_sha256: object,
            label: str,
        ) -> tuple[ObjectRef, dict[str, Any]]:
            if not isinstance(object_id, str) or not isinstance(content_sha256, str):
                raise InvalidStoreInput(f"{label} must contain string object_id/content_sha256")
            matches = by_pair.get((object_id, content_sha256), [])
            if len(matches) != 1:
                raise InvalidStoreInput(
                    f"{label} does not resolve to exactly one explicitly bound object manifest"
                )
            match = matches[0]
            referenced_keys.add(self._object_pointer_key(match))
            return match, self._object_manifest(match)

        current_policy = StoragePolicy.from_event(event)

        def require_dependency(
            dependency_schema: str,
            label: str,
            predicate: Callable[[EventRef, Mapping[str, Any]], bool],
        ) -> tuple[EventRef, Mapping[str, Any]]:
            if event_rows is None:
                raise InvalidStoreInput(
                    f"{label} requires the complete stored event corpus"
                )
            matches: list[tuple[EventRef, Mapping[str, Any]]] = []
            for dependency_ref, dependency_event in event_rows.values():
                dependency_payload = dependency_event.get("payload")
                if (
                    isinstance(dependency_payload, Mapping)
                    and dependency_payload.get("schema") == dependency_schema
                    and predicate(dependency_ref, dependency_payload)
                ):
                    matches.append((dependency_ref, dependency_payload))
            if len(matches) != 1:
                raise InvalidStoreInput(
                    f"{label} must resolve to exactly one prior {dependency_schema} event; "
                    f"found {len(matches)}"
                )
            dependency_ref, dependency_payload = matches[0]
            if dependency_ref.policy != current_policy:
                raise InvalidStoreInput(f"{label} policy differs from the dependent event")
            try:
                dependency_time = parse_aware_datetime(
                    event_rows[dependency_ref.event_id][1].get("system_time")
                )
                current_time = parse_aware_datetime(event.get("system_time"))
            except ValueError as exc:
                raise InvalidStoreInput(f"{label} has an invalid system_time") from exc
            if dependency_time > current_time:
                raise InvalidStoreInput(f"{label} is later than the dependent event")
            return dependency_ref, dependency_payload

        payload = event.get("payload")
        if not isinstance(payload, Mapping):
            raise InvalidStoreInput("event payload must be an object")
        schema = payload.get("schema")
        typed_identity_schemas = {
            "memory-source/v2",
            "memory-evidence-span/v2",
            "memory-extraction-artifact/v1",
        }
        if schema in typed_identity_schemas:
            if payload.get("acquisition_id") != acquisition_id:
                raise InvalidStoreInput(
                    "payload acquisition_id must equal the event acquisition identity"
                )
            if payload.get("source_version_id") != source_version_id:
                raise InvalidStoreInput(
                    "payload source_version_id must equal the event source-version identity"
                )

        phase2_errors: list[str] = []
        if schema == "memory-source/v2":
            _source_ref, source_manifest = require_pair(
                payload.get("source_object_id"),
                payload.get("content_sha256"),
                "source payload",
            )
            phase2_errors = validate_phase2_event_bindings(
                event,
                source_manifest=source_manifest,
            )
        elif schema == "memory-evidence-span/v2":
            source_ref, source_manifest = require_pair(
                payload.get("source_object_id"),
                payload.get("source_content_sha256"),
                "evidence source",
            )
            locator = payload.get("locator")
            if not isinstance(locator, Mapping):
                raise InvalidStoreInput("evidence locator must be an object")
            coordinate_ref, coordinate_manifest = require_pair(
                locator.get("coordinate_artifact_object_id"),
                locator.get("coordinate_artifact_content_sha256"),
                "evidence coordinate artifact",
            )
            source_event_ref, source = require_dependency(
                "memory-source/v2",
                "evidence source dependency",
                lambda dependency_ref, candidate: (
                    dependency_ref.acquisition_id == acquisition_id
                    and dependency_ref.source_version_id == source_version_id
                    and source_ref in dependency_ref.objects
                    and candidate.get("acquisition_id") == acquisition_id
                    and candidate.get("source_version_id") == source_version_id
                    and candidate.get("document_id") == payload.get("document_id")
                    and candidate.get("source_object_id") == payload.get("source_object_id")
                    and candidate.get("content_sha256")
                    == payload.get("source_content_sha256")
                ),
            )
            extraction_ref, extraction = require_dependency(
                "memory-extraction-artifact/v1",
                "evidence extraction dependency",
                lambda dependency_ref, candidate: (
                    dependency_ref.acquisition_id == acquisition_id
                    and dependency_ref.source_version_id == source_version_id
                    and source_ref in dependency_ref.objects
                    and coordinate_ref in dependency_ref.objects
                    and candidate.get("acquisition_id") == acquisition_id
                    and candidate.get("source_version_id") == source_version_id
                    and candidate.get("document_id") == payload.get("document_id")
                    and candidate.get("extraction_id") == locator.get("extraction_id")
                    and isinstance(candidate.get("source_object"), Mapping)
                    and candidate["source_object"].get("object_id")
                    == payload.get("source_object_id")
                    and candidate["source_object"].get("content_sha256")
                    == payload.get("source_content_sha256")
                    and isinstance(candidate.get("output_object"), Mapping)
                    and candidate["output_object"].get("object_id")
                    == locator.get("coordinate_artifact_object_id")
                    and candidate["output_object"].get("content_sha256")
                    == locator.get("coordinate_artifact_content_sha256")
                ),
            )
            if source_event_ref.policy != extraction_ref.policy:
                raise InvalidStoreInput(
                    "evidence source and extraction dependencies use different policies"
                )
            phase2_errors = validate_phase2_event_bindings(
                event,
                source=source,
                extraction_artifact=extraction,
                source_manifest=source_manifest,
                output_manifest=coordinate_manifest,
            )
        elif schema == "memory-extraction-artifact/v1":
            source_pointer = payload.get("source_object")
            output_pointer = payload.get("output_object")
            if not isinstance(source_pointer, Mapping) or not isinstance(
                output_pointer, Mapping
            ):
                raise InvalidStoreInput(
                    "extraction source_object/output_object must be objects"
                )
            source_ref, source_manifest = require_pair(
                source_pointer.get("object_id"),
                source_pointer.get("content_sha256"),
                "extraction source_object",
            )
            _output_ref, output_manifest = require_pair(
                output_pointer.get("object_id"),
                output_pointer.get("content_sha256"),
                "extraction output_object",
            )
            _source_event_ref, source = require_dependency(
                "memory-source/v2",
                "extraction source dependency",
                lambda dependency_ref, candidate: (
                    dependency_ref.acquisition_id == acquisition_id
                    and dependency_ref.source_version_id == source_version_id
                    and source_ref in dependency_ref.objects
                    and candidate.get("acquisition_id") == acquisition_id
                    and candidate.get("source_version_id") == source_version_id
                    and candidate.get("document_id") == payload.get("document_id")
                    and candidate.get("source_object_id")
                    == source_pointer.get("object_id")
                    and candidate.get("content_sha256")
                    == source_pointer.get("content_sha256")
                ),
            )
            phase2_errors = validate_phase2_event_bindings(
                event,
                source=source,
                source_manifest=source_manifest,
                output_manifest=output_manifest,
            )

        if phase2_errors:
            raise InvalidStoreInput(
                "Phase 2 event/manifest provenance binding failed: "
                + "; ".join(phase2_errors[:12])
            )

        evidence_refs = event.get("evidence_refs")
        if isinstance(evidence_refs, list):
            bound_digests = {item.sha256 for item in bound}
            for position, evidence_ref in enumerate(evidence_refs):
                if not isinstance(evidence_ref, str):
                    raise InvalidStoreInput(
                        f"evidence_refs[{position}] must be a canonical string"
                    )
                match = re.fullmatch(r"evidence:sha256:([0-9a-f]{64})#.+", evidence_ref)
                if match is None or match.group(1) not in bound_digests:
                    raise InvalidStoreInput(
                        f"evidence_refs[{position}] is not backed by an explicitly bound object"
                    )

        if referenced_keys and referenced_keys != bound_keys:
            raise InvalidStoreInput(
                "typed payload bindings must contain exactly its referenced source/output objects"
            )

    def _put_event(
        self,
        event: Mapping[str, Any],
        *,
        acquisition_id: str,
        source_version_id: str,
        objects: Sequence[ObjectRef],
        principal: object | None,
        allow_tombstone: bool,
        event_index_extra: Mapping[str, Mapping[str, Any]] | None = None,
        preauthorized: bool = False,
    ) -> EventRef:
        if not isinstance(event, Mapping):
            raise InvalidStoreInput("event must be an object")
        _validate_identity(acquisition_id, source_version_id)
        policy = StoragePolicy.from_event(event)
        if policy.retention == "tombstone-only" and not allow_tombstone:
            raise InvalidStoreInput("tombstones may only be written through purge_event")
        bound = tuple(objects)
        if not all(isinstance(item, ObjectRef) for item in bound):
            raise InvalidStoreInput("objects must contain only ObjectRef values")
        if any(item.policy != policy for item in bound):
            raise InvalidStoreInput("event and bound objects must use exactly the same policy")
        stored_objects = self._object_refs(verify=False)
        for item in bound:
            self._assert_not_retired(item)
            if item not in stored_objects:
                raise StoreNotFound("event binding is not a persisted immutable object ref")
            if not preauthorized:
                self._authorize("bind", item, principal)
            self._logical_bytes(item)

        event_copy = json.loads(canonical_json_bytes(dict(event)))
        event_id = event_copy.get("event_id")
        if not isinstance(event_id, str):
            raise InvalidStoreInput("event.event_id must be a string")
        payload = event_copy.get("payload")
        typed = isinstance(payload, Mapping) and payload.get("schema") in {
            "memory-source/v2",
            "memory-evidence-span/v2",
            "memory-extraction-artifact/v1",
        }
        referenced_event_ids = {
            item
            for field in ("derived_from", "supersedes")
            for item in event_copy.get(field, [])
            if isinstance(item, str)
        }
        existing_refs = self._event_refs(verify=False)
        related_refs = [
            item
            for item in existing_refs
            if item.event_id == event_id
            or item.event_id in referenced_event_ids
            or (
                typed
                and item.acquisition_id == acquisition_id
                and item.source_version_id == source_version_id
                and item.policy == policy
                and any(bound_ref in item.objects for bound_ref in bound)
            )
        ]
        existing_rows: dict[str, tuple[EventRef, dict[str, Any]]] = {}
        for item in related_refs:
            if not preauthorized:
                self._authorize("bind", item, principal)
            stored_event = self._decode_event_record_unbound(
                item,
                self._logical_bytes(item),
            )
            existing_rows[item.event_id] = (item, stored_event)
        existing_events = {
            related_event_id: stored_event
            for related_event_id, (_stored_ref, stored_event) in existing_rows.items()
        }
        self._validate_event_object_bindings(
            event_copy,
            bound,
            acquisition_id=acquisition_id,
            source_version_id=source_version_id,
            event_rows=existing_rows,
        )
        record = self._event_record(event_copy, acquisition_id, source_version_id, bound)
        record_bytes = canonical_json_bytes(record)
        ref = EventRef(
            acquisition_id=acquisition_id,
            source_version_id=source_version_id,
            policy=policy,
            event_id=event_id,
            record_sha256=hashlib.sha256(record_bytes).hexdigest(),
            record_byte_length=len(record_bytes),
            objects=bound,
            encrypted=policy.protected,
        )
        if not preauthorized:
            self._authorize("write", ref, principal)
        previous_ref = next((item for item in existing_refs if item.event_id == event_id), None)
        if previous_ref is not None:
            if previous_ref == ref and self._logical_bytes(previous_ref) == record_bytes:
                return previous_ref
            raise StoreConflict(f"event_id {event_id} already names a different immutable event")
        index: dict[str, Mapping[str, Any]] = dict(existing_events)
        if event_index_extra:
            index.update(event_index_extra)
        index[event_id] = event_copy
        errors = validate_event(event_copy, event_index=index)
        if errors:
            raise InvalidStoreInput("invalid event: " + "; ".join(errors[:12]))

        def source_key(candidate: Mapping[str, Any]) -> tuple[object, ...] | None:
            candidate_payload = candidate.get("payload")
            if (
                not isinstance(candidate_payload, Mapping)
                or candidate_payload.get("schema") != "memory-source/v2"
            ):
                return None
            return (
                candidate_payload.get("acquisition_id"),
                candidate_payload.get("source_version_id"),
                candidate_payload.get("document_id"),
                candidate_payload.get("source_object_id"),
                candidate_payload.get("content_sha256"),
            )

        if isinstance(payload, Mapping) and payload.get("schema") == "memory-source/v2":
            candidate_source_key = source_key(event_copy)
            duplicate_source = any(
                source_key(stored_event) == candidate_source_key
                for _stored_ref, stored_event in existing_rows.values()
            )
            if duplicate_source:
                for _stored_ref, stored_event in existing_rows.values():
                    stored_payload = stored_event.get("payload")
                    if not isinstance(stored_payload, Mapping):
                        continue
                    stored_schema = stored_payload.get("schema")
                    if stored_schema == "memory-extraction-artifact/v1":
                        pointer = stored_payload.get("source_object")
                        dependent_key = (
                            stored_payload.get("acquisition_id"),
                            stored_payload.get("source_version_id"),
                            stored_payload.get("document_id"),
                            pointer.get("object_id") if isinstance(pointer, Mapping) else None,
                            pointer.get("content_sha256")
                            if isinstance(pointer, Mapping)
                            else None,
                        )
                    elif stored_schema == "memory-evidence-span/v2":
                        dependent_key = (
                            stored_payload.get("acquisition_id"),
                            stored_payload.get("source_version_id"),
                            stored_payload.get("document_id"),
                            stored_payload.get("source_object_id"),
                            stored_payload.get("source_content_sha256"),
                        )
                    else:
                        continue
                    if dependent_key == candidate_source_key:
                        raise StoreConflict(
                            "source event would make an existing typed dependency ambiguous"
                        )
        elif (
            isinstance(payload, Mapping)
            and payload.get("schema") == "memory-extraction-artifact/v1"
        ):
            source_pointer = payload.get("source_object")
            output_pointer = payload.get("output_object")
            candidate_extraction_key = (
                payload.get("acquisition_id"),
                payload.get("source_version_id"),
                payload.get("document_id"),
                payload.get("extraction_id"),
                source_pointer.get("object_id")
                if isinstance(source_pointer, Mapping)
                else None,
                source_pointer.get("content_sha256")
                if isinstance(source_pointer, Mapping)
                else None,
                output_pointer.get("object_id")
                if isinstance(output_pointer, Mapping)
                else None,
                output_pointer.get("content_sha256")
                if isinstance(output_pointer, Mapping)
                else None,
            )
            duplicate_extraction = False
            for _stored_ref, stored_event in existing_rows.values():
                stored_payload = stored_event.get("payload")
                if (
                    not isinstance(stored_payload, Mapping)
                    or stored_payload.get("schema")
                    != "memory-extraction-artifact/v1"
                ):
                    continue
                stored_source = stored_payload.get("source_object")
                stored_output = stored_payload.get("output_object")
                stored_key = (
                    stored_payload.get("acquisition_id"),
                    stored_payload.get("source_version_id"),
                    stored_payload.get("document_id"),
                    stored_payload.get("extraction_id"),
                    stored_source.get("object_id")
                    if isinstance(stored_source, Mapping)
                    else None,
                    stored_source.get("content_sha256")
                    if isinstance(stored_source, Mapping)
                    else None,
                    stored_output.get("object_id")
                    if isinstance(stored_output, Mapping)
                    else None,
                    stored_output.get("content_sha256")
                    if isinstance(stored_output, Mapping)
                    else None,
                )
                if stored_key == candidate_extraction_key:
                    duplicate_extraction = True
                    break
            if duplicate_extraction:
                for _stored_ref, stored_event in existing_rows.values():
                    stored_payload = stored_event.get("payload")
                    locator = (
                        stored_payload.get("locator")
                        if isinstance(stored_payload, Mapping)
                        else None
                    )
                    if (
                        isinstance(stored_payload, Mapping)
                        and stored_payload.get("schema") == "memory-evidence-span/v2"
                        and isinstance(locator, Mapping)
                        and (
                            stored_payload.get("acquisition_id"),
                            stored_payload.get("source_version_id"),
                            stored_payload.get("document_id"),
                            locator.get("extraction_id"),
                            stored_payload.get("source_object_id"),
                            stored_payload.get("source_content_sha256"),
                            locator.get("coordinate_artifact_object_id"),
                            locator.get("coordinate_artifact_content_sha256"),
                        )
                        == candidate_extraction_key
                    ):
                        raise StoreConflict(
                            "extraction event would make an existing evidence dependency ambiguous"
                        )
        if ref.encrypted:
            self._ensure_protected_location()
            self._require_cipher()
        self._assert_not_retired(ref)
        self._write_entry(ref, record_bytes)
        return ref

    @_transactional
    def put_event(
        self,
        event: Mapping[str, Any],
        *,
        objects: Sequence[ObjectRef],
        principal: object | None = None,
    ) -> EventRef:
        bound = tuple(objects)
        if not bound or not all(isinstance(item, ObjectRef) for item in bound):
            raise InvalidStoreInput("non-tombstone events require associated object manifest refs")
        identities = {(item.acquisition_id, item.source_version_id) for item in bound}
        if len(identities) != 1:
            raise InvalidStoreInput(
                "one event record cannot conflate independent acquisition/version identities"
            )
        acquisition_id, source_version_id = next(iter(identities))
        return self._put_event(
            event,
            acquisition_id=acquisition_id,
            source_version_id=source_version_id,
            objects=bound,
            principal=principal,
            allow_tombstone=False,
        )

    @_transactional
    def read_object(self, ref: ObjectRef, *, principal: object | None = None) -> bytes:
        if not isinstance(ref, ObjectRef):
            raise InvalidStoreInput("ref must be ObjectRef")
        self._assert_not_retired(ref)
        self._authorize("read", ref, principal)
        return self._logical_bytes(ref)

    @_transactional
    def read_event_bytes(self, ref: EventRef, *, principal: object | None = None) -> bytes:
        if not isinstance(ref, EventRef):
            raise InvalidStoreInput("ref must be EventRef")
        self._assert_not_retired(ref)
        self._authorize("read", ref, principal)
        for bound in ref.objects:
            self._assert_not_retired(bound)
            self._authorize("read", bound, principal)
            self._logical_bytes(bound)
        event = self._decode_event_record(
            ref,
            self._logical_bytes(ref),
            principal=principal,
            dependency_action="read",
        )
        return canonical_json_bytes(event)

    def read_event(self, ref: EventRef, *, principal: object | None = None) -> dict[str, Any]:
        return json.loads(self.read_event_bytes(ref, principal=principal))

    @_transactional
    def find_event(self, event_id: str, *, principal: object | None = None) -> EventRef:
        if not isinstance(event_id, str) or _EVENT_ID_RE.fullmatch(event_id) is None:
            raise InvalidStoreInput("event_id must be canonical")
        found = [item for item in self._event_refs(verify=False) if item.event_id == event_id]
        if not found:
            raise StoreNotFound(f"event is absent: {event_id}")
        if len(found) != 1:
            raise StoreCorruption(f"multiple records claim event_id {event_id}")
        self._assert_not_retired(found[0])
        self._authorize("read", found[0], principal)
        for bound in found[0].objects:
            self._assert_not_retired(bound)
            self._authorize("resolve", bound, principal)
            self._logical_bytes(bound)
        self._decode_event_record(
            found[0],
            self._logical_bytes(found[0]),
            principal=principal,
            dependency_action="resolve",
        )
        return found[0]

    @_transactional
    def find_object(
        self,
        acquisition_id: str,
        source_version_id: str,
        manifest_sha256: str,
        *,
        object_id: str | None = None,
        principal: object | None = None,
    ) -> ObjectRef:
        """Resolve one exact manifest identity; never perform digest-only lookup."""

        _validate_identity(acquisition_id, source_version_id)
        if not isinstance(manifest_sha256, str):
            raise InvalidStoreInput("manifest_sha256 must be a canonical SHA-256 digest")
        manifest_digest = manifest_sha256.removeprefix("sha256:")
        _validate_digest(manifest_digest)
        if object_id is not None and (
            not isinstance(object_id, str)
            or re.fullmatch(r"object:sha256:[0-9a-f]{64}", object_id) is None
        ):
            raise InvalidStoreInput("object_id must be a canonical content object ID")
        matches = [
            item
            for item in self._object_refs(verify=False)
            if item.acquisition_id == acquisition_id
            and item.source_version_id == source_version_id
            and item.manifest_sha256 == manifest_digest
            and (object_id is None or item.object_id == object_id)
        ]
        if not matches:
            raise StoreNotFound("exact object manifest reference is absent")
        if len(matches) != 1:
            raise StoreCorruption("exact object manifest identity is not unique")
        self._assert_not_retired(matches[0])
        self._authorize("resolve", matches[0], principal)
        self._logical_bytes(matches[0])
        return matches[0]

    # ---------- managed backups and exact restoration ----------

    @_transactional
    def create_backup(
        self,
        ref: EntryRef,
        backup_id: str,
        *,
        principal: object | None = None,
    ) -> BackupReceipt:
        if not isinstance(ref, (ObjectRef, EventRef)):
            raise InvalidStoreInput("ref must be ObjectRef or EventRef")
        self._assert_not_retired(ref)
        self._authorize("backup", ref, principal)
        self._logical_bytes(ref)  # authenticate before copying storage bytes
        content_path = self._backup_path(ref, backup_id, key=False)
        self._atomic_create(content_path, self._read_regular(self._content_path(ref)))
        key_path: Path | None = None
        if ref.encrypted:
            key_path = self._backup_path(ref, backup_id, key=True)
            self._atomic_create(key_path, self._read_regular(self._key_path(ref)))
        return BackupReceipt(
            content_path=content_path.as_posix(),
            key_path=key_path.as_posix() if key_path else None,
        )

    @_transactional
    def restore_from_backup(
        self,
        ref: EntryRef,
        backup_id: str,
        *,
        principal: object | None = None,
    ) -> None:
        if not isinstance(ref, (ObjectRef, EventRef)):
            raise InvalidStoreInput("ref must be ObjectRef or EventRef")
        self._assert_not_retired(ref)
        self._authorize("restore", ref, principal)
        content = self._read_regular(self._backup_path(ref, backup_id, key=False))
        key: bytes | None = None
        if ref.encrypted:
            key = self._read_regular(self._backup_path(ref, backup_id, key=True))
            self._decode_key_envelope(key)
        self._verify_backup_logical_bytes(ref, content, key)
        if key is not None:
            self._atomic_replace(self._key_path(ref), key)
        self._atomic_replace(self._content_path(ref), content)
        self._logical_bytes(ref)

    @_transactional
    def restore_object(
        self,
        ref: ObjectRef,
        object_manifest: Mapping[str, Any],
        exact_bytes: bytes,
        *,
        principal: object | None = None,
    ) -> None:
        raw = self._coerce_bytes(exact_bytes, "exact_bytes")
        self._assert_not_retired(ref)
        if not isinstance(object_manifest, Mapping):
            raise InvalidStoreInput("restore requires the authoritative object manifest")
        manifest = json.loads(canonical_json_bytes(dict(object_manifest)))
        errors = verify_object_content(
            manifest,
            raw,
            media_type=manifest.get("media_type"),
        )
        if errors or object_manifest_sha256(manifest) != ref.manifest_sha256:
            raise InvalidStoreInput(
                "restore manifest/content differs from the immutable reference"
                + ((": " + "; ".join(errors[:8])) if errors else "")
            )
        if hashlib.sha256(raw).hexdigest() != ref.sha256 or len(raw) != ref.byte_length:
            raise InvalidStoreInput("restore bytes do not match the immutable object reference")
        self._authorize("restore", ref, principal)
        if ref.encrypted:
            ciphertext, envelope = self._encrypt("object", ref, raw)
            self._atomic_replace(self._key_path(ref), envelope)
            self._atomic_replace(self._content_path(ref), ciphertext)
        else:
            self._atomic_replace(self._content_path(ref), raw)
        self._atomic_replace(
            self._descriptor_path(ref),
            self._descriptor_bytes(ref, object_manifest=manifest),
        )
        self._logical_bytes(ref)

    @_transactional
    def restore_event(
        self,
        ref: EventRef,
        exact_event_bytes: bytes,
        *,
        principal: object | None = None,
    ) -> None:
        event_bytes = self._coerce_bytes(exact_event_bytes, "exact_event_bytes")
        self._assert_not_retired(ref)
        try:
            event = json.loads(event_bytes)
        except (UnicodeError, json.JSONDecodeError) as exc:
            raise InvalidStoreInput(f"restore event is invalid JSON: {exc}") from exc
        if not isinstance(event, dict) or event_bytes != canonical_json_bytes(event):
            raise InvalidStoreInput("restore event bytes must be canonical JSON")
        record = self._event_record(event, ref.acquisition_id, ref.source_version_id, ref.objects)
        record_bytes = canonical_json_bytes(record)
        if (
            hashlib.sha256(record_bytes).hexdigest() != ref.record_sha256
            or len(record_bytes) != ref.record_byte_length
        ):
            raise InvalidStoreInput("restore event does not match the immutable event reference")
        self._authorize("restore", ref, principal)
        for bound in ref.objects:
            self._assert_not_retired(bound)
            self._authorize("restore", bound, principal)
            self._logical_bytes(bound)
        self._decode_event_record(
            ref,
            record_bytes,
            principal=principal,
            dependency_action="restore",
        )
        if ref.encrypted:
            ciphertext, envelope = self._encrypt("event", ref, record_bytes)
            self._atomic_replace(self._key_path(ref), envelope)
            self._atomic_replace(self._content_path(ref), ciphertext)
        else:
            self._atomic_replace(self._content_path(ref), record_bytes)
        self._atomic_replace(self._descriptor_path(ref), self._descriptor_bytes(ref))

    # ---------- deterministic manifest and integrity verification ----------

    def _control_rows(self) -> list[dict[str, Any]]:
        # These lanes are reserved for the signed Phase 2 transaction coordinator.
        # Until that integration supplies schema/signature/resolver verification,
        # accepting caller-written lookalikes would be a checkpoint/receipt bypass.
        for lane in ("receipts", "checkpoints"):
            if self._walk_regular(Path(lane)):
                raise StoreCorruption(
                    f"reserved {lane} lane contains records without coordinator verification"
                )
        return []

    def _verify_backup_logical_bytes(
        self,
        ref: EntryRef,
        stored: bytes,
        key_envelope: bytes | None,
    ) -> None:
        if ref.encrypted:
            if key_envelope is None:
                raise StoreCorruption("protected backup is missing its wrapped DEK envelope")
            logical = self._decrypt(self._entry_kind(ref), ref, stored, key_envelope)
        else:
            if key_envelope is not None:
                raise StoreCorruption("unprotected backup unexpectedly has a key envelope")
            logical = stored
        expected_length = ref.byte_length if isinstance(ref, ObjectRef) else ref.record_byte_length
        if (
            len(logical) != expected_length
            or hashlib.sha256(logical).hexdigest() != self._entry_digest(ref)
        ):
            raise StoreCorruption("managed backup does not restore its exact immutable reference")

    def _managed_backup_rows(self, refs: Sequence[EntryRef]) -> list[dict[str, Any]]:
        actual = set(self._walk_regular(Path("backups")))
        expected: set[Path] = set()
        rows: list[dict[str, Any]] = []
        for ref in sorted(refs, key=lambda item: canonical_sha256(item.to_dict())):
            content_root = self._backup_root(ref, key=False)
            key_root = self._backup_root(ref, key=True)
            content_paths = self._walk_regular(content_root)
            key_paths = self._walk_regular(key_root)

            def backup_ids(paths: Sequence[Path], suffix: str, root: Path) -> dict[str, Path]:
                result: dict[str, Path] = {}
                for relative in paths:
                    if relative.parent != root or not relative.name.endswith(suffix):
                        raise StoreCorruption(f"managed backup has an invalid path: {relative}")
                    backup_id = relative.name[: -len(suffix)]
                    if _BACKUP_ID_RE.fullmatch(backup_id) is None or backup_id in result:
                        raise StoreCorruption(f"managed backup has an invalid or duplicate ID: {relative}")
                    result[backup_id] = relative
                return result

            content_by_id = backup_ids(content_paths, ".backup", content_root)
            key_by_id = backup_ids(key_paths, ".key.json", key_root)
            if ref.encrypted:
                if set(content_by_id) != set(key_by_id):
                    raise StoreCorruption("protected backup content/key sets are incomplete")
            elif key_by_id:
                raise StoreCorruption("unprotected entry has managed key backups")
            for backup_id, content_path in sorted(content_by_id.items()):
                expected.add(content_path)
                stored = self._read_regular(content_path)
                key_path = key_by_id.get(backup_id)
                key_raw = self._read_regular(key_path) if key_path is not None else None
                if key_path is not None:
                    expected.add(key_path)
                self._verify_backup_logical_bytes(ref, stored, key_raw)
                key_row: dict[str, Any] | None = None
                if key_raw is not None and key_path is not None:
                    envelope = self._decode_key_envelope(key_raw)
                    key_row = {
                        "path": key_path.as_posix(),
                        "sha256": hashlib.sha256(key_raw).hexdigest(),
                        "byte_length": len(key_raw),
                        "dek_id": envelope["dek_id"],
                        "kek_id": envelope.get("kek_id"),
                        "aad_sha256": envelope.get("aad_sha256"),
                    }
                rows.append(
                    {
                        "ref_sha256": canonical_sha256(ref.to_dict()),
                        "backup_id": backup_id,
                        "content": {
                            "path": content_path.as_posix(),
                            "sha256": hashlib.sha256(stored).hexdigest(),
                            "byte_length": len(stored),
                        },
                        "key_envelope": key_row,
                    }
                )
        if actual != expected:
            raise StoreCorruption(
                "managed backup inventory contains an orphan or unbound derivative"
            )
        return rows

    def _purge_manifest_rows(
        self,
        events: Sequence[EventRef],
    ) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        retired_rows: list[dict[str, Any]] = []
        retired_by_ref: dict[str, tuple[EntryRef, tuple[str, ...], Path]] = {}
        for relative in self._walk_regular(Path("retired")):
            raw = self._read_regular(relative)
            ref, tombstone_ids = self._load_retired_marker(relative)
            ref_sha = canonical_sha256(ref.to_dict())
            if ref_sha in retired_by_ref:
                raise StoreCorruption("multiple retired markers claim one exact reference")
            if not self._entry_absent(ref):
                raise StoreCorruption(
                    "retired content/key/backup derivative was restored out of band"
                )
            marker = json.loads(raw)
            retired_by_ref[ref_sha] = (ref, tombstone_ids, relative)
            retired_rows.append(
                {
                    "path": relative.as_posix(),
                    "sha256": hashlib.sha256(raw).hexdigest(),
                    "byte_length": len(raw),
                    "marker": marker,
                }
            )

        purge_paths: dict[str, dict[str, Path]] = {}
        for relative in self._walk_regular(Path("purges")):
            if relative.parent != Path("purges"):
                raise StoreCorruption(f"purge record must be stored in the flat purge lane: {relative}")
            kind: str
            if relative.name.endswith(".intent.json"):
                kind = "intent"
                target_id = relative.name[: -len(".intent.json")]
            elif relative.name.endswith(".complete.json"):
                kind = "completion"
                target_id = relative.name[: -len(".complete.json")]
            else:
                raise StoreCorruption(f"purge record has an unsupported filename: {relative}")
            if _EVENT_ID_RE.fullmatch(target_id) is None:
                raise StoreCorruption(f"purge record filename has an invalid target ID: {relative}")
            target_paths = purge_paths.setdefault(target_id, {})
            if kind in target_paths:
                raise StoreCorruption(f"duplicate purge {kind} record for {target_id}")
            target_paths[kind] = relative

        live_events = {item.event_id: item for item in events}
        live_event_values = {
            item.event_id: self._decode_event_record(item, self._logical_bytes(item))
            for item in events
        }
        claimed_retired: set[str] = set()
        claimed_tombstones: set[str] = set()
        purge_rows: list[dict[str, Any]] = []
        for target_id, paths in sorted(purge_paths.items()):
            if "intent" not in paths:
                raise StoreCorruption(f"purge completion {target_id} has no authoritative intent")
            (
                intent,
                closure_events,
                _event_sha256s,
                requested_objects,
                closure_objects,
                _transitive_objects,
                tombstones,
                expected_key_paths,
                expected_backup_paths,
            ) = self._load_purge_intent(target_id)
            targets = [item for item in closure_events if item.event_id == target_id]
            if len(targets) != 1:
                raise StoreCorruption("purge intent must contain one exact target event ref")
            target_ref = targets[0]
            if not set(requested_objects).issubset(target_ref.objects):
                raise StoreCorruption("purge intent requested objects are outside target bindings")
            tombstone_ids = tuple(sorted(item.event_id for item in tombstones))
            closure_ids = {item.event_id for item in closure_events}
            covered_ids: set[str] = set()
            for tombstone in tombstones:
                if live_events.get(tombstone.event_id) != tombstone:
                    raise StoreCorruption("purge intent tombstone is absent or differs from live state")
                event_value = live_event_values[tombstone.event_id]
                payload = event_value.get("payload")
                covered_id = payload.get("target_event_id") if isinstance(payload, dict) else None
                if covered_id not in closure_ids or covered_id in covered_ids:
                    raise StoreCorruption("purge tombstones do not cover the exact event closure")
                covered_ids.add(covered_id)
                claimed_tombstones.add(tombstone.event_id)
            if covered_ids != closure_ids:
                raise StoreCorruption("purge intent is missing a required closure tombstone")

            for ref in (*closure_objects, *closure_events):
                ref_sha = canonical_sha256(ref.to_dict())
                marker = retired_by_ref.get(ref_sha)
                if marker is None or marker[0] != ref or marker[1] != tombstone_ids:
                    raise StoreCorruption("purge intent and exact retired marker differ")
                if ref_sha in claimed_retired:
                    raise StoreCorruption("one retired exact ref is claimed by multiple purge intents")
                claimed_retired.add(ref_sha)
                if not self._entry_absent(ref):
                    raise StoreCorruption("purge intent has a live content-bearing derivative")
            for path_text in (*expected_key_paths, *expected_backup_paths):
                path = Path(path_text)
                if self._absolute(path).exists() or self._absolute(path).is_symlink():
                    raise StoreCorruption("purge intent has a residual key or backup surface")
            if self._projection_absent is not None:
                for event_ref in closure_events:
                    try:
                        absent = self._projection_absent(event_ref)
                    except Exception as exc:
                        raise StoreCorruption("purge projection verification failed") from exc
                    if absent is not True:
                        raise StoreCorruption("purge intent has a residual projection")

            intent_raw = self._read_regular(paths["intent"])
            completion_row: dict[str, Any] | None = None
            if "completion" in paths:
                completion, receipt, proof = self._load_purge_completion(target_id)
                self._verify_completed_purge(
                    target_ref,
                    requested_objects,
                    receipt,
                    proof,
                )
                completion_raw = self._read_regular(paths["completion"])
                completion_row = {
                    "path": paths["completion"].as_posix(),
                    "sha256": hashlib.sha256(completion_raw).hexdigest(),
                    "byte_length": len(completion_raw),
                    "record": completion,
                }
            purge_rows.append(
                {
                    "target_event_id": target_id,
                    "intent": {
                        "path": paths["intent"].as_posix(),
                        "sha256": hashlib.sha256(intent_raw).hexdigest(),
                        "byte_length": len(intent_raw),
                        "record": intent,
                    },
                    "completion": completion_row,
                }
            )

        if claimed_retired != set(retired_by_ref):
            raise StoreCorruption("retired marker is orphaned from an authoritative purge intent")
        live_tombstones = {
            event_id
            for event_id, value in live_event_values.items()
            if isinstance(value.get("payload"), dict)
            and value["payload"].get("schema") == "memory-tombstone/v1"
        }
        if live_tombstones != claimed_tombstones:
            raise StoreCorruption("policy-safe tombstone is orphaned from a purge intent")
        return retired_rows, purge_rows

    def _expected_primary_paths(
        self,
        objects: Sequence[ObjectRef],
        events: Sequence[EventRef],
    ) -> tuple[set[Path], set[Path], set[Path]]:
        refs: tuple[EntryRef, ...] = (*objects, *events)
        content = {self._content_path(item) for item in refs}
        descriptors = {self._descriptor_path(item) for item in refs}
        keys = {self._key_path(item) for item in refs if item.encrypted}
        return content, descriptors, keys

    def _rebuild_manifest_unchecked(self) -> dict[str, Any]:
        """Authenticated full-store audit after caller authorization or internally."""

        self._verify_top_level_layout(allow_missing=False)
        self._verify_lock_layout()
        objects = self._object_refs(verify=True)
        events = self._event_refs(verify=True)
        expected_content, expected_descriptors, expected_keys = self._expected_primary_paths(
            objects, events
        )
        actual_content = set(self._walk_regular(Path("objects"))) | set(
            self._walk_regular(Path("events"))
        )
        actual_descriptors = set(self._walk_regular(Path("descriptors")))
        actual_keys = set(self._walk_regular(Path("keys")))
        if actual_content != expected_content:
            raise StoreCorruption(
                f"content files differ from committed descriptors: missing={sorted((expected_content - actual_content), key=str)}, "
                f"orphan={sorted((actual_content - expected_content), key=str)}"
            )
        if actual_descriptors != expected_descriptors:
            raise StoreCorruption("descriptor inventory is internally inconsistent")
        if actual_keys != expected_keys:
            raise StoreCorruption("wrapped-key inventory differs from protected descriptors")
        objects_by_key = {self._object_key(item): item for item in objects}
        try:
            for item in objects:
                self._lineage_keys(item, objects_by_key)
        except PurgeIncomplete as exc:
            raise StoreCorruption(f"object lineage is not exactly resolvable: {exc}") from exc
        object_rows: list[dict[str, Any]] = []
        for item in objects:
            descriptor = self._load_descriptor(self._descriptor_path(item), "object")
            object_rows.append(
                {
                    "ref": item.to_dict(),
                    "object_manifest": descriptor["object_manifest"],
                }
            )
        backup_rows = self._managed_backup_rows((*objects, *events))
        retired_rows, purge_rows = self._purge_manifest_rows(events)
        control_rows = self._control_rows()
        body = {
            "schema": STORE_MANIFEST_SCHEMA,
            "objects": object_rows,
            "events": [item.to_dict() for item in events],
            "managed_backups": backup_rows,
            "retired_targets": retired_rows,
            "purges": purge_rows,
            "control_records": control_rows,
            "operational_lock": {
                "path": self._lock_path.as_posix(),
                "sha256": hashlib.sha256(_LOCK_BYTES).hexdigest(),
                "byte_length": len(_LOCK_BYTES),
            },
        }
        return {**body, "manifest_sha256": canonical_sha256(body)}

    def _authorize_all_refs(self, action: str, principal: object | None) -> None:
        refs: tuple[EntryRef, ...] = (
            *self._object_refs(verify=False),
            *self._event_refs(verify=False),
            *self._retired_refs(),
        )
        seen: set[str] = set()
        for ref in refs:
            ref_sha = canonical_sha256(ref.to_dict())
            if ref_sha in seen:
                continue
            seen.add(ref_sha)
            self._authorize(action, ref, principal)

    @_transactional
    def rebuild_manifest(
        self,
        *,
        principal: object | None = None,
    ) -> dict[str, Any]:
        self._authorize_all_refs("audit", principal)
        return self._rebuild_manifest_unchecked()

    @_transactional
    def export_manifest(self, *, principal: object | None = None) -> bytes:
        self._authorize_all_refs("export", principal)
        manifest = self._rebuild_manifest_unchecked()
        return canonical_json_bytes(manifest)

    @_transactional
    def verify_manifest(
        self,
        manifest: bytes | Mapping[str, Any],
        *,
        principal: object | None = None,
    ) -> None:
        if isinstance(manifest, bytes):
            try:
                supplied = json.loads(manifest)
            except (UnicodeError, json.JSONDecodeError) as exc:
                raise StoreCorruption(f"manifest is invalid JSON: {exc}") from exc
            if not isinstance(supplied, dict) or manifest != canonical_json_bytes(supplied):
                raise StoreCorruption("manifest bytes must be canonical JSON")
        elif isinstance(manifest, Mapping):
            supplied = dict(manifest)
        else:
            raise InvalidStoreInput("manifest must be canonical bytes or an object")
        self._authorize_all_refs("audit", principal)
        current = self._rebuild_manifest_unchecked()
        if supplied != current:
            raise StoreCorruption("supplied manifest differs from the deterministic store rebuild")

    # ---------- physical and cryptographic purge ----------

    @staticmethod
    def _object_key(ref: ObjectRef) -> tuple[str, str, str, str]:
        return (
            ref.acquisition_id,
            ref.source_version_id,
            ref.manifest_sha256,
            ref.sha256,
        )

    def _object_manifest(self, ref: ObjectRef) -> dict[str, Any]:
        descriptor = self._load_descriptor(self._descriptor_path(ref), "object")
        try:
            descriptor_ref = ObjectRef.from_dict(descriptor.get("ref"))
        except InvalidStoreInput as exc:
            raise StoreCorruption("object descriptor carries an invalid exact ref") from exc
        if descriptor_ref != ref:
            raise StoreCorruption("object descriptor ref differs from its exact binding")
        manifest = descriptor.get("object_manifest")
        errors = validate_object_manifest(manifest)
        if errors or object_manifest_sha256(manifest) != ref.manifest_sha256:
            raise StoreCorruption(
                "object descriptor carries an invalid manifest"
                + ((": " + "; ".join(errors[:8])) if errors else "")
            )
        return manifest

    def _authorize_derivative_lineage(
        self,
        manifest: Mapping[str, Any],
        objects_by_key: Mapping[tuple[str, str, str, str], ObjectRef],
        *,
        principal: object | None,
    ) -> None:
        """Authorize exact upstreams and prove live source-v2 derivative rights."""

        try:
            direct = self._manifest_lineage_keys(manifest, objects_by_key)
        except PurgeIncomplete as exc:
            raise InvalidStoreInput(f"object manifest lineage is unresolved: {exc}") from exc
        if manifest.get("object_kind") == "source" or not direct:
            return

        pending = list(direct)
        visited: set[tuple[str, str, str, str]] = set()
        sources: list[tuple[ObjectRef, dict[str, Any]]] = []
        while pending:
            key = pending.pop()
            if key in visited:
                continue
            visited.add(key)
            upstream = objects_by_key.get(key)
            if upstream is None:  # pragma: no cover - exact resolver already proves this
                raise InvalidStoreInput("derived object has an absent exact upstream")
            self._assert_not_retired(upstream)
            self._authorize("derive", upstream, principal)
            self._logical_bytes(upstream)
            upstream_manifest = self._object_manifest(upstream)
            if upstream_manifest.get("object_kind") == "source":
                sources.append((upstream, upstream_manifest))
                continue
            try:
                parents = self._manifest_lineage_keys(upstream_manifest, objects_by_key)
            except PurgeIncomplete as exc:
                raise InvalidStoreInput(
                    f"upstream object lineage is unresolved: {exc}"
                ) from exc
            if not parents:
                raise InvalidStoreInput(
                    "derived object lineage does not terminate in an exact source manifest"
                )
            pending.extend(parents)

        unique_sources = {
            self._object_pointer_key(ref): (ref, source_manifest)
            for ref, source_manifest in sources
        }
        if not unique_sources:
            raise InvalidStoreInput(
                "derived object lineage has no exact source manifest"
            )
        event_refs = self._event_refs(verify=False)
        for source_ref, source_manifest in unique_sources.values():
            matches: list[tuple[EventRef, Mapping[str, Any]]] = []
            candidates = [
                event_ref
                for event_ref in event_refs
                if event_ref.acquisition_id == source_ref.acquisition_id
                and event_ref.source_version_id == source_ref.source_version_id
                and event_ref.policy == source_ref.policy
                and source_ref in event_ref.objects
            ]
            for event_ref in candidates:
                self._authorize("derive", event_ref, principal)
                source_event = self._decode_event_record_unbound(
                    event_ref,
                    self._logical_bytes(event_ref),
                )
                payload = source_event.get("payload")
                if (
                    isinstance(payload, Mapping)
                    and payload.get("schema") == "memory-source/v2"
                    and event_ref.acquisition_id == source_ref.acquisition_id
                    and event_ref.source_version_id == source_ref.source_version_id
                    and source_ref in event_ref.objects
                    and payload.get("acquisition_id") == source_ref.acquisition_id
                    and payload.get("source_version_id") == source_ref.source_version_id
                    and payload.get("source_object_id") == source_ref.object_id
                    and payload.get("content_sha256") == "sha256:" + source_ref.sha256
                ):
                    matches.append((event_ref, source_event))
            if len(matches) != 1:
                raise InvalidStoreInput(
                    "derived object requires exactly one complete source-v2 event for "
                    f"each exact source manifest; found {len(matches)}"
                )
            source_event_ref, source_event = matches[0]
            self._authorize("derive", source_event_ref, principal)
            errors = validate_phase2_event_bindings(
                source_event,
                source_manifest=source_manifest,
            )
            if errors:
                raise InvalidStoreInput(
                    "derived object source-v2 provenance is invalid: "
                    + "; ".join(errors[:12])
                )
            source_payload = source_event.get("payload")
            rights = source_payload.get("rights") if isinstance(source_payload, Mapping) else None
            derivative_use = rights.get("derivative_use") if isinstance(rights, Mapping) else None
            if derivative_use not in {"allowed", "restricted"}:
                raise AccessDenied(
                    "source rights do not authorize derivative object creation"
                )

    @staticmethod
    def _memory_event_references(value: object) -> set[str]:
        event_ids: set[str] = set()

        def visit(node: object) -> None:
            if isinstance(node, dict):
                for key, child in node.items():
                    visit(key)
                    visit(child)
            elif isinstance(node, list):
                for child in node:
                    visit(child)
            elif isinstance(node, str):
                if _EVENT_ID_RE.fullmatch(node):
                    event_ids.add(node)

        visit(value)
        return event_ids

    def _typed_dependency_event_ids(
        self,
        ref: EventRef,
        event: Mapping[str, Any],
        event_refs: Sequence[EventRef],
        events: Mapping[str, Mapping[str, Any]],
    ) -> set[str]:
        """Resolve exact implicit source/extraction edges for reverse purge closure."""

        payload = event.get("payload")
        if not isinstance(payload, Mapping):
            return set()
        schema = payload.get("schema")
        if schema not in {"memory-extraction-artifact/v1", "memory-evidence-span/v2"}:
            return set()

        if schema == "memory-extraction-artifact/v1":
            source_pointer = payload.get("source_object")
            source_object_id = (
                source_pointer.get("object_id") if isinstance(source_pointer, Mapping) else None
            )
            source_sha = (
                source_pointer.get("content_sha256")
                if isinstance(source_pointer, Mapping)
                else None
            )
        else:
            source_object_id = payload.get("source_object_id")
            source_sha = payload.get("source_content_sha256")
        source_bindings = [
            item
            for item in ref.objects
            if item.object_id == source_object_id and "sha256:" + item.sha256 == source_sha
        ]
        if len(source_bindings) != 1:
            raise StoreCorruption("typed event has an ambiguous exact source binding")
        source_ref = source_bindings[0]
        source_matches: list[str] = []
        for candidate_ref in event_refs:
            candidate = events[candidate_ref.event_id]
            candidate_payload = candidate.get("payload")
            if (
                isinstance(candidate_payload, Mapping)
                and candidate_payload.get("schema") == "memory-source/v2"
                and candidate_ref.acquisition_id == ref.acquisition_id
                and candidate_ref.source_version_id == ref.source_version_id
                and source_ref in candidate_ref.objects
                and candidate_payload.get("acquisition_id") == ref.acquisition_id
                and candidate_payload.get("source_version_id") == ref.source_version_id
                and candidate_payload.get("document_id") == payload.get("document_id")
                and candidate_payload.get("source_object_id") == source_object_id
                and candidate_payload.get("content_sha256") == source_sha
            ):
                source_matches.append(candidate_ref.event_id)
        if len(source_matches) != 1:
            raise StoreCorruption("typed event source dependency is missing or ambiguous")
        dependencies = {source_matches[0]}

        if schema == "memory-evidence-span/v2":
            locator = payload.get("locator")
            if not isinstance(locator, Mapping):
                raise StoreCorruption("evidence locator is missing during purge closure")
            coordinate_bindings = [
                item
                for item in ref.objects
                if item.object_id == locator.get("coordinate_artifact_object_id")
                and "sha256:" + item.sha256
                == locator.get("coordinate_artifact_content_sha256")
            ]
            if len(coordinate_bindings) != 1:
                raise StoreCorruption("evidence has an ambiguous exact coordinate binding")
            coordinate_ref = coordinate_bindings[0]
            extraction_matches: list[str] = []
            for candidate_ref in event_refs:
                candidate = events[candidate_ref.event_id]
                candidate_payload = candidate.get("payload")
                source_pointer = (
                    candidate_payload.get("source_object")
                    if isinstance(candidate_payload, Mapping)
                    else None
                )
                output_pointer = (
                    candidate_payload.get("output_object")
                    if isinstance(candidate_payload, Mapping)
                    else None
                )
                if (
                    isinstance(candidate_payload, Mapping)
                    and candidate_payload.get("schema")
                    == "memory-extraction-artifact/v1"
                    and candidate_ref.acquisition_id == ref.acquisition_id
                    and candidate_ref.source_version_id == ref.source_version_id
                    and source_ref in candidate_ref.objects
                    and coordinate_ref in candidate_ref.objects
                    and candidate_payload.get("acquisition_id") == ref.acquisition_id
                    and candidate_payload.get("source_version_id") == ref.source_version_id
                    and candidate_payload.get("document_id") == payload.get("document_id")
                    and candidate_payload.get("extraction_id")
                    == locator.get("extraction_id")
                    and isinstance(source_pointer, Mapping)
                    and source_pointer.get("object_id") == source_object_id
                    and source_pointer.get("content_sha256") == source_sha
                    and isinstance(output_pointer, Mapping)
                    and output_pointer.get("object_id")
                    == locator.get("coordinate_artifact_object_id")
                    and output_pointer.get("content_sha256")
                    == locator.get("coordinate_artifact_content_sha256")
                ):
                    extraction_matches.append(candidate_ref.event_id)
            if len(extraction_matches) != 1:
                raise StoreCorruption(
                    "evidence extraction dependency is missing or ambiguous"
                )
            dependencies.add(extraction_matches[0])
        return dependencies

    def _resolve_lineage_pointer(
        self,
        value: object,
        *,
        objects_by_key: Mapping[tuple[str, str, str, str], ObjectRef],
        label: str,
    ) -> tuple[str, str, str, str] | None:
        """Resolve one lineage pointer without ever selecting by plaintext digest alone."""

        if value is None:
            return None
        object_id: object
        acquisition_id: object
        source_version_id: object
        manifest_sha: object | None
        if isinstance(value, Mapping):
            object_id = value.get("object_id")
            acquisition_id = value.get("acquisition_id")
            source_version_id = value.get("source_version_id")
            manifest_sha = value.get("manifest_sha256")
        else:
            raise PurgeIncomplete(f"{label} is not an exact lineage pointer")
        if (
            not isinstance(object_id, str)
            or re.fullmatch(r"object:sha256:[0-9a-f]{64}", object_id) is None
            or not isinstance(acquisition_id, str)
            or not isinstance(source_version_id, str)
        ):
            raise PurgeIncomplete(f"{label} has invalid lineage identity fields")
        digest = object_id.removeprefix("object:sha256:")
        if not isinstance(manifest_sha, str):
            raise PurgeIncomplete(f"{label}.manifest_sha256 is invalid")
        manifest_digest = manifest_sha.removeprefix("sha256:")
        key = (acquisition_id, source_version_id, manifest_digest, digest)
        if key not in objects_by_key:
            raise PurgeIncomplete(f"{label} exact lineage target is absent")
        return key

    def _manifest_lineage_keys(
        self,
        manifest: Mapping[str, Any],
        objects_by_key: Mapping[tuple[str, str, str, str], ObjectRef],
    ) -> set[tuple[str, str, str, str]]:
        lineage = manifest.get("source_lineage")
        if not isinstance(lineage, Mapping):
            raise StoreCorruption("object manifest source_lineage must be an object")
        values: list[tuple[str, object]] = [
            ("source_lineage.source_object", lineage.get("source_object")),
        ]
        derived_field = "derived_from_objects"
        derived = lineage.get(derived_field)
        if not isinstance(derived, list):
            raise StoreCorruption(f"object manifest source_lineage.{derived_field} must be a list")
        values.extend(
            (f"source_lineage.{derived_field}[{position}]", value)
            for position, value in enumerate(derived)
        )
        result: set[tuple[str, str, str, str]] = set()
        for label, value in values:
            key = self._resolve_lineage_pointer(
                value,
                objects_by_key=objects_by_key,
                label=label,
            )
            if key is not None:
                result.add(key)
        manifest_policy = StoragePolicy.from_dict(manifest.get("policy"))
        if any(objects_by_key[key].policy != manifest_policy for key in result):
            raise PurgeIncomplete(
                "derived object policy must exactly inherit every upstream object policy"
            )
        return result

    def _lineage_keys(
        self,
        ref: ObjectRef,
        objects_by_key: Mapping[tuple[str, str, str, str], ObjectRef],
    ) -> set[tuple[str, str, str, str]]:
        return self._manifest_lineage_keys(self._object_manifest(ref), objects_by_key)

    def _purge_closure(
        self,
        target: EventRef,
        target_objects: Sequence[ObjectRef],
    ) -> tuple[list[EventRef], list[ObjectRef], list[ObjectRef], dict[str, dict[str, Any]]]:
        event_refs = self._event_refs(verify=True)
        events = {
            ref.event_id: self._decode_event_record(ref, self._logical_bytes(ref))
            for ref in event_refs
        }
        typed_dependencies = {
            ref.event_id: self._typed_dependency_event_ids(
                ref,
                events[ref.event_id],
                event_refs,
                events,
            )
            for ref in event_refs
        }
        stored_target = next((ref for ref in event_refs if ref.event_id == target.event_id), None)
        if stored_target != target:
            raise StoreConflict("purge target differs from the store's immutable event reference")
        object_refs = self._object_refs(verify=True)
        objects_by_key = {self._object_key(ref): ref for ref in object_refs}
        selected_event_ids = {target.event_id}
        selected_object_keys = {self._object_key(ref) for ref in target_objects}
        initial_object_keys = set(selected_object_keys)

        changed = True
        while changed:
            changed = False
            for ref in object_refs:
                key = self._object_key(ref)
                if key in selected_object_keys:
                    continue
                if self._lineage_keys(ref, objects_by_key) & selected_object_keys:
                    selected_object_keys.add(key)
                    changed = True

            for ref in event_refs:
                event = events[ref.event_id]
                payload = event.get("payload")
                if (
                    ref.event_id != target.event_id
                    and isinstance(payload, dict)
                    and payload.get("schema") == "memory-tombstone/v1"
                ):
                    continue
                referenced_events = self._memory_event_references(event)
                bound_keys = {self._object_key(item) for item in ref.objects}
                depends = bool(
                    ref.event_id in selected_event_ids
                    or bound_keys & selected_object_keys
                    or referenced_events & selected_event_ids
                    or typed_dependencies[ref.event_id] & selected_event_ids
                )
                if not depends:
                    continue
                if ref.event_id not in selected_event_ids:
                    selected_event_ids.add(ref.event_id)
                    changed = True

        missing = selected_object_keys - set(objects_by_key)
        if missing:
            raise StoreCorruption("event closure references object descriptors that are absent")
        selected_events = sorted(
            (ref for ref in event_refs if ref.event_id in selected_event_ids),
            key=lambda item: item.event_id,
        )
        selected_objects = sorted(
            (objects_by_key[key] for key in selected_object_keys),
            key=lambda item: (
                item.object_id,
                item.acquisition_id,
                item.source_version_id,
                item.manifest_sha256,
            ),
        )
        transitive = [
            item for item in selected_objects if self._object_key(item) not in initial_object_keys
        ]
        return selected_events, selected_objects, transitive, events

    def _load_canonical_object(self, relative: Path) -> dict[str, Any]:
        raw = self._read_regular(relative)
        try:
            value = json.loads(raw)
        except (UnicodeError, json.JSONDecodeError) as exc:
            raise StoreCorruption(f"store metadata is invalid JSON: {relative}: {exc}") from exc
        if not isinstance(value, dict) or raw != canonical_json_bytes(value):
            raise StoreCorruption(f"store metadata is not a canonical object: {relative}")
        return value

    def _parse_purge_intent(
        self,
        value: Mapping[str, Any],
        *,
        target_event_id: str,
    ) -> tuple[
        list[EventRef],
        dict[str, str],
        list[ObjectRef],
        list[ObjectRef],
        list[ObjectRef],
        list[EventRef],
        tuple[str, ...],
        tuple[str, ...],
    ]:
        required = {
            "schema",
            "target_event_id",
            "events",
            "requested_objects",
            "objects",
            "transitive_objects",
            "tombstones",
            "key_envelope_paths",
            "backup_paths",
        }
        if (
            set(value) != required
            or value.get("schema") != "memory-local-purge-intent/v1"
            or value.get("target_event_id") != target_event_id
        ):
            raise StoreCorruption("purge intent has unsupported shape or target")
        for field in (
            "events",
            "requested_objects",
            "objects",
            "transitive_objects",
            "tombstones",
            "key_envelope_paths",
            "backup_paths",
        ):
            if not isinstance(value.get(field), list):
                raise StoreCorruption(f"purge intent {field} must be a list")
        try:
            event_rows = value["events"]
            if not all(
                isinstance(item, dict) and set(item) == {"ref", "event_sha256"}
                for item in event_rows
            ):
                raise StoreCorruption("purge intent event rows are invalid")
            closure_events = [EventRef.from_dict(item["ref"]) for item in event_rows]
            event_sha256s = {
                item["ref"]["event_id"]: item["event_sha256"] for item in event_rows
            }
            requested_objects = [
                ObjectRef.from_dict(item) for item in value["requested_objects"]
            ]
            closure_objects = [ObjectRef.from_dict(item) for item in value["objects"]]
            transitive_objects = [
                ObjectRef.from_dict(item) for item in value["transitive_objects"]
            ]
            tombstones = [EventRef.from_dict(item) for item in value["tombstones"]]
        except (KeyError, TypeError, InvalidStoreInput) as exc:
            raise StoreCorruption(f"purge intent contains invalid refs: {exc}") from exc
        if not closure_events or not tombstones:
            raise StoreCorruption("purge intent closure and tombstones must be non-empty")
        if len({item.event_id for item in closure_events}) != len(closure_events):
            raise StoreCorruption("purge intent contains duplicate closure events")
        if len(event_sha256s) != len(closure_events) or any(
            not isinstance(item, str)
            or not item.startswith("sha256:")
            or _SHA256_RE.fullmatch(item[7:]) is None
            for item in event_sha256s.values()
        ):
            raise StoreCorruption("purge intent contains invalid event hashes")
        if not any(item.event_id == target_event_id for item in closure_events):
            raise StoreCorruption("purge intent does not contain its target reference")
        object_keys = [self._object_key(item) for item in closure_objects]
        if len(set(object_keys)) != len(object_keys):
            raise StoreCorruption("purge intent contains duplicate object refs")
        if not set(self._object_key(item) for item in transitive_objects).issubset(object_keys):
            raise StoreCorruption("purge transitive objects are outside the exact closure")
        requested_keys = [self._object_key(item) for item in requested_objects]
        if (
            len(set(requested_keys)) != len(requested_keys)
            or not set(requested_keys).issubset(object_keys)
            or set(requested_keys) & {
                self._object_key(item) for item in transitive_objects
            }
        ):
            raise StoreCorruption("purge requested objects are not the exact closure roots")
        if len({item.event_id for item in tombstones}) != len(tombstones):
            raise StoreCorruption("purge intent contains duplicate tombstones")
        for tombstone in tombstones:
            if (
                tombstone.objects
                or tombstone.policy.retention != "tombstone-only"
                or tombstone.policy.classification not in {"public", "internal"}
            ):
                raise StoreCorruption("purge intent contains a content-bearing tombstone")

        def safe_paths(field: str) -> tuple[str, ...]:
            raw_paths = value[field]
            if raw_paths != sorted(set(raw_paths)):
                raise StoreCorruption(f"purge intent {field} must be sorted and unique")
            result: list[str] = []
            for item in raw_paths:
                if not isinstance(item, str):
                    raise StoreCorruption(f"purge intent {field} contains a non-string path")
                relative = Path(item)
                self._absolute(relative)
                if relative.as_posix() != item:
                    raise StoreCorruption(f"purge intent {field} contains a non-canonical path")
                result.append(item)
            return tuple(result)

        key_paths = safe_paths("key_envelope_paths")
        backup_paths = safe_paths("backup_paths")
        expected_keys = tuple(
            sorted(
                self._key_path(item).as_posix()
                for item in (*closure_objects, *closure_events)
                if item.encrypted
            )
        )
        if key_paths != expected_keys:
            raise StoreCorruption("purge intent wrapped-key scope differs from its exact refs")
        refs: tuple[EntryRef, ...] = (*closure_objects, *closure_events)
        for item in backup_paths:
            relative = Path(item)
            if not any(
                relative.is_relative_to(self._backup_root(ref, key=key))
                for ref in refs
                for key in (False, True)
            ):
                raise StoreCorruption("purge intent backup scope is outside its exact refs")
        return (
            closure_events,
            event_sha256s,
            requested_objects,
            closure_objects,
            transitive_objects,
            tombstones,
            key_paths,
            backup_paths,
        )

    def _load_purge_intent(
        self,
        target_event_id: str,
    ) -> tuple[
        dict[str, Any],
        list[EventRef],
        dict[str, str],
        list[ObjectRef],
        list[ObjectRef],
        list[ObjectRef],
        list[EventRef],
        tuple[str, ...],
        tuple[str, ...],
    ]:
        value = self._load_canonical_object(self._purge_intent_path(target_event_id))
        parsed = self._parse_purge_intent(value, target_event_id=target_event_id)
        return (value, *parsed)

    def _load_purge_completion(
        self,
        target_event_id: str,
    ) -> tuple[dict[str, Any], PurgeReceipt, dict[str, Any]]:
        value = self._load_canonical_object(self._purge_complete_path(target_event_id))
        if (
            set(value) != {"schema", "receipt", "proof"}
            or value.get("schema") != "memory-local-purge-completion/v1"
            or not isinstance(value.get("proof"), dict)
        ):
            raise StoreCorruption("purge completion record has unsupported shape")
        receipt = PurgeReceipt.from_dict(value["receipt"])
        proof = value["proof"]
        if receipt.target_event_id != target_event_id:
            raise StoreCorruption("purge completion target differs from its filename")
        if receipt.verification_sha256 != "sha256:" + canonical_sha256(proof):
            raise StoreCorruption("purge completion proof digest is invalid")
        return value, receipt, proof

    @staticmethod
    def _object_receipt_pointer(ref: ObjectRef) -> tuple[str, str, str]:
        return (
            ref.object_id,
            "sha256:" + ref.sha256,
            "sha256:" + ref.manifest_sha256,
        )

    def _verify_completed_purge(
        self,
        target: EventRef,
        requested_objects: Sequence[ObjectRef],
        receipt: PurgeReceipt,
        proof: Mapping[str, Any],
    ) -> None:
        (
            _intent,
            closure_events,
            event_sha256s,
            stored_requested_objects,
            closure_objects,
            transitive_objects,
            tombstones,
            expected_key_paths,
            expected_backup_paths,
        ) = self._load_purge_intent(target.event_id)
        if target not in closure_events:
            raise StoreCorruption("completed purge intent does not contain the exact target ref")
        if tuple(stored_requested_objects) != tuple(requested_objects):
            raise StoreConflict("completed purge used a different exact object target set")
        tombstone_ids = sorted(item.event_id for item in tombstones)
        closure_event_ids = {item.event_id for item in closure_events}
        seen_targets: set[str] = set()
        for tombstone in tombstones:
            try:
                stored_event = self._decode_event_record(tombstone, self._logical_bytes(tombstone))
            except MemoryStoreError as exc:
                raise StoreCorruption("completed purge tombstone is absent or corrupt") from exc
            payload = stored_event.get("payload")
            target_id = payload.get("target_event_id") if isinstance(payload, dict) else None
            if target_id not in closure_event_ids or target_id in seen_targets:
                raise StoreCorruption("completed purge tombstones do not exactly cover its events")
            seen_targets.add(target_id)
            marker_path = self._retired_path(tombstone)
            if self._absolute(marker_path).exists() or self._absolute(marker_path).is_symlink():
                raise StoreCorruption("a policy-safe tombstone was itself retired")
        if seen_targets != closure_event_ids:
            raise StoreCorruption("completed purge is missing a closure tombstone")

        for ref in (*closure_objects, *closure_events):
            try:
                retired_ref, retired_tombstones = self._load_retired_marker(
                    self._retired_path(ref)
                )
            except MemoryStoreError as exc:
                raise StoreCorruption("completed purge is missing a valid retired marker") from exc
            if retired_ref != ref or retired_tombstones != tuple(tombstone_ids):
                raise StoreCorruption("retired marker differs from completed purge intent")
            if not self._entry_absent(ref):
                raise StoreCorruption(
                    "retired content/key/backup derivative was restored out of band"
                )
        for path_text in (*expected_key_paths, *expected_backup_paths):
            path = Path(path_text)
            if self._absolute(path).exists() or self._absolute(path).is_symlink():
                raise StoreCorruption("completed purge has a residual key or backup surface")
        if self._projection_absent is not None:
            for event_ref in closure_events:
                try:
                    absent = self._projection_absent(event_ref)
                except Exception as exc:
                    raise StoreCorruption("completed purge projection verification failed") from exc
                if absent is not True:
                    raise StoreCorruption("completed purge has a residual projection")

        expected_removed_events = tuple(
            sorted((item.event_id, event_sha256s[item.event_id]) for item in closure_events)
        )
        expected_removed_objects = tuple(
            sorted(self._object_receipt_pointer(item) for item in closure_objects)
        )
        expected_transitive = tuple(
            sorted(self._object_receipt_pointer(item) for item in transitive_objects)
        )
        if (
            receipt.target_event_id != target.event_id
            or tuple(sorted(receipt.tombstones, key=lambda item: item.event_id))
            != tuple(sorted(tombstones, key=lambda item: item.event_id))
            or receipt.removed_events != expected_removed_events
            or receipt.removed_objects != expected_removed_objects
            or receipt.transitive_objects != expected_transitive
            or receipt.key_envelopes_removed != len(expected_key_paths)
            or receipt.backups_removed != len(expected_backup_paths)
        ):
            raise StoreCorruption("completed purge receipt differs from its exact intent")
        required_proof = {
            "target_event_id",
            "tombstone_event_ids",
            "removed_events",
            "removed_objects",
            "transitive_objects",
            "key_envelopes",
            "backups",
            "projections",
        }
        if set(proof) != required_proof:
            raise StoreCorruption("completed purge proof has unsupported fields")
        receipt_dict = receipt.to_dict()
        for field in ("removed_events", "removed_objects", "transitive_objects"):
            if proof.get(field) != receipt_dict[field]:
                raise StoreCorruption(f"completed purge proof {field} differs from receipt")
        if (
            proof.get("target_event_id") != target.event_id
            or proof.get("tombstone_event_ids") != tombstone_ids
        ):
            raise StoreCorruption("completed purge proof identity differs from receipt")
        surface_expectations = {
            "key_envelopes": (len(expected_key_paths), canonical_sha256(list(expected_key_paths))),
            "backups": (len(expected_backup_paths), canonical_sha256(list(expected_backup_paths))),
        }
        for field, (count, scope_sha) in surface_expectations.items():
            surface = proof.get(field)
            if not isinstance(surface, dict) or surface != {
                "matched_count": count,
                "residual_count": 0,
                "scope_sha256": scope_sha,
            }:
                raise StoreCorruption(f"completed purge proof {field} scope is invalid")
        projections = proof.get("projections")
        if (
            not isinstance(projections, dict)
            or set(projections) != {"removed_count", "residual_count", "scope_sha256"}
            or projections.get("removed_count") != receipt.projections_removed
            or projections.get("residual_count") != 0
            or not isinstance(projections.get("scope_sha256"), str)
            or _SHA256_RE.fullmatch(projections["scope_sha256"]) is None
        ):
            raise StoreCorruption("completed purge proof projection scope is invalid")

    def _completed_purge(
        self,
        target: EventRef,
        requested_objects: Sequence[ObjectRef],
    ) -> PurgeReceipt | None:
        path = self._purge_complete_path(target.event_id)
        if not self._absolute(path).exists() and not self._absolute(path).is_symlink():
            return None
        _value, receipt, proof = self._load_purge_completion(target.event_id)
        self._verify_completed_purge(target, requested_objects, receipt, proof)
        return receipt

    @staticmethod
    def _safe_returned_identifier(value: object) -> str:
        relative = Path(value) if isinstance(value, str) else None
        if (
            not isinstance(value, str)
            or _SAFE_RETURNED_ID_RE.fullmatch(value) is None
            or value.startswith("/")
            or relative is None
            or relative.as_posix() != value
            or any(part in {"", ".", ".."} for part in relative.parts)
        ):
            raise PurgeIncomplete(f"projection purge returned an unsafe identifier: {value!r}")
        return value

    def _delete_backup_files(self, ref: EntryRef, *, key: bool) -> list[str]:
        deleted: list[str] = []
        root = self._backup_root(ref, key=key)
        for relative in self._walk_regular(root):
            removed = self._delete_regular(relative)
            if removed:
                deleted.append(removed)
        return deleted

    def _purge_entry(
        self,
        ref: EntryRef,
    ) -> tuple[list[str], list[str], list[str]]:
        key_paths: list[str] = []
        backup_paths: list[str] = []
        entry_paths: list[str] = []
        # Every managed wrapped-key copy is removed before any ciphertext.
        backup_paths.extend(self._delete_backup_files(ref, key=True))
        if ref.encrypted:
            removed_key = self._delete_regular(self._key_path(ref))
            if removed_key:
                key_paths.append(removed_key)
        backup_paths.extend(self._delete_backup_files(ref, key=False))
        removed_content = self._delete_regular(self._content_path(ref))
        if removed_content:
            entry_paths.append(removed_content)
        removed_descriptor = self._delete_regular(self._descriptor_path(ref))
        if removed_descriptor:
            entry_paths.append(removed_descriptor)
        return entry_paths, key_paths, backup_paths

    def _entry_absent(self, ref: EntryRef) -> bool:
        paths = [self._content_path(ref), self._descriptor_path(ref)]
        if ref.encrypted:
            paths.append(self._key_path(ref))
        if any(self._absolute(item).exists() or self._absolute(item).is_symlink() for item in paths):
            return False
        return not self._walk_regular(self._backup_root(ref, key=True)) and not self._walk_regular(
            self._backup_root(ref, key=False)
        )

    @_transactional
    def purge_event(
        self,
        target: EventRef,
        tombstone_event: Mapping[str, Any],
        *,
        target_objects: Sequence[ObjectRef] | None = None,
        dependent_tombstones: Mapping[str, Mapping[str, Any]] | None = None,
        principal: object | None = None,
    ) -> PurgeReceipt:
        if not isinstance(target, EventRef):
            raise InvalidStoreInput("target must be EventRef")
        if self._projection_purger is None or self._projection_absent is None:
            raise PurgeIncomplete(
                "purge requires registered projection deletion and absence-verification hooks"
            )
        try:
            raw_requested_objects = (
                target.objects if target_objects is None else tuple(target_objects)
            )
        except TypeError as exc:
            raise InvalidStoreInput("target_objects must be an iterable of ObjectRef values") from exc
        if not all(isinstance(item, ObjectRef) for item in raw_requested_objects):
            raise InvalidStoreInput("target_objects must contain only ObjectRef values")
        requested_objects = tuple(sorted(raw_requested_objects, key=self._object_key))
        if (
            len({self._object_key(item) for item in requested_objects})
            != len(requested_objects)
            or not set(requested_objects).issubset(target.objects)
        ):
            raise InvalidStoreInput(
                "target_objects must be a unique exact subset of the target event's bindings"
            )
        self._authorize("purge", target, principal)
        completion_path = self._purge_complete_path(target.event_id)
        if self._absolute(completion_path).exists() or self._absolute(completion_path).is_symlink():
            completed_intent = self._load_purge_intent(target.event_id)
            for item in (*completed_intent[4], *completed_intent[1]):
                self._authorize("purge", item, principal)
        completed = self._completed_purge(target, requested_objects)
        if completed is not None:
            return completed
        intent_path = self._purge_intent_path(target.event_id)
        if self._absolute(intent_path).exists() or self._absolute(intent_path).is_symlink():
            (
                _intent,
                closure_events,
                event_sha256s,
                stored_requested_objects,
                closure_objects,
                transitive_objects,
                tombstones,
                expected_key_paths,
                expected_backup_paths,
            ) = self._load_purge_intent(target.event_id)
            if target not in closure_events:
                raise StoreCorruption("purge intent does not contain its target reference")
            if tuple(stored_requested_objects) != requested_objects:
                raise StoreConflict("pending purge used a different exact object target set")
            for item in (*closure_objects, *closure_events):
                self._authorize("purge", item, principal)
        else:
            discovery_refs: tuple[EntryRef, ...] = (
                *self._object_refs(verify=False),
                *self._event_refs(verify=False),
            )
            for item in discovery_refs:
                self._authorize("purge-discover", item, principal)
            closure_events, closure_objects, transitive_objects, events = self._purge_closure(
                target,
                requested_objects,
            )
            supplied: dict[str, Mapping[str, Any]] = {}
            if not isinstance(tombstone_event, Mapping):
                raise InvalidStoreInput("tombstone_event must be an object")
            supplied[target.event_id] = tombstone_event
            if dependent_tombstones is not None:
                if not isinstance(dependent_tombstones, Mapping):
                    raise InvalidStoreInput("dependent_tombstones must map event IDs to events")
                for event_id, event in dependent_tombstones.items():
                    if event_id in supplied or not isinstance(event, Mapping):
                        raise InvalidStoreInput("dependent tombstones contain a duplicate or invalid event")
                    supplied[event_id] = event
            required_targets = {item.event_id for item in closure_events}
            if set(supplied) != required_targets:
                missing = sorted(required_targets - set(supplied))
                extra = sorted(set(supplied) - required_targets)
                raise PurgeIncomplete(
                    f"complete derivative closure requires one tombstone per event; missing={missing}, extra={extra}"
                )

            for item in (*closure_objects, *closure_events):
                self._authorize("purge", item, principal)

            prepared_tombstones: list[
                tuple[EventRef, Mapping[str, Any], EventRef]
            ] = []
            for event_ref in closure_events:
                tombstone_copy = json.loads(canonical_json_bytes(dict(supplied[event_ref.event_id])))
                payload = tombstone_copy.get("payload")
                policy = StoragePolicy.from_event(tombstone_copy)
                if (
                    not isinstance(payload, dict)
                    or payload.get("schema") != "memory-tombstone/v1"
                    or payload.get("target_event_id") != event_ref.event_id
                ):
                    raise InvalidStoreInput(
                        f"tombstone must target exactly closure event {event_ref.event_id}"
                    )
                if (
                    policy.retention != "tombstone-only"
                    or policy.classification not in {"public", "internal"}
                ):
                    raise InvalidStoreInput(
                        "purge tombstones must be non-content public/internal tombstone-only events"
                    )
                record_bytes = canonical_json_bytes(
                    self._event_record(
                        tombstone_copy,
                        event_ref.acquisition_id,
                        event_ref.source_version_id,
                        (),
                    )
                )
                predicted = EventRef(
                    acquisition_id=event_ref.acquisition_id,
                    source_version_id=event_ref.source_version_id,
                    policy=policy,
                    event_id=tombstone_copy.get("event_id"),
                    record_sha256=hashlib.sha256(record_bytes).hexdigest(),
                    record_byte_length=len(record_bytes),
                    objects=(),
                    encrypted=False,
                )
                prepared_tombstones.append((event_ref, tombstone_copy, predicted))

            if len({item[2].event_id for item in prepared_tombstones}) != len(
                prepared_tombstones
            ):
                raise InvalidStoreInput("purge tombstone event IDs must be unique")
            preflight_index: dict[str, Mapping[str, Any]] = dict(events)
            preflight_index.update(
                {predicted.event_id: tombstone_copy for _, tombstone_copy, predicted in prepared_tombstones}
            )
            existing_by_id = {item.event_id: item for item in self._event_refs(verify=False)}
            for event_ref, tombstone_copy, predicted in prepared_tombstones:
                errors = validate_event(tombstone_copy, event_index=preflight_index)
                if errors:
                    raise InvalidStoreInput(
                        "invalid purge tombstone: " + "; ".join(errors[:12])
                    )
                existing = existing_by_id.get(predicted.event_id)
                if existing is not None and existing != predicted:
                    raise StoreConflict(
                        f"tombstone event_id {predicted.event_id} already names another event"
                    )
                if existing is not None:
                    expected_record = canonical_json_bytes(
                        self._event_record(
                            tombstone_copy,
                            predicted.acquisition_id,
                            predicted.source_version_id,
                            (),
                        )
                    )
                    if self._logical_bytes(existing) != expected_record:
                        raise StoreCorruption(
                            "existing tombstone bytes differ from their preflight reference"
                        )
                self._assert_not_retired(predicted)
                self._authorize("bind", event_ref, principal)
                self._authorize("write", predicted, principal)

            tombstones = [
                self._put_event(
                    tombstone_copy,
                    acquisition_id=event_ref.acquisition_id,
                    source_version_id=event_ref.source_version_id,
                    objects=(),
                    principal=principal,
                    allow_tombstone=True,
                    event_index_extra=events,
                    preauthorized=True,
                )
                for event_ref, tombstone_copy, _predicted in prepared_tombstones
            ]

            event_sha256s = {
                item.event_id: "sha256:"
                + hashlib.sha256(
                    canonical_json_bytes(events[item.event_id])
                ).hexdigest()
                for item in closure_events
            }
            expected_key_paths = tuple(
                sorted(
                    self._key_path(item).as_posix()
                    for item in (*closure_objects, *closure_events)
                    if item.encrypted
                )
            )
            expected_backup_paths = tuple(
                sorted(
                    {
                        path.as_posix()
                        for item in (*closure_objects, *closure_events)
                        for key in (False, True)
                        for path in self._walk_regular(self._backup_root(item, key=key))
                    }
                )
            )
            intent = {
                "schema": "memory-local-purge-intent/v1",
                "target_event_id": target.event_id,
                "requested_objects": [item.to_dict() for item in requested_objects],
                "events": [
                    {"ref": item.to_dict(), "event_sha256": event_sha256s[item.event_id]}
                    for item in closure_events
                ],
                "objects": [item.to_dict() for item in closure_objects],
                "transitive_objects": [item.to_dict() for item in transitive_objects],
                "tombstones": [item.to_dict() for item in tombstones],
                "key_envelope_paths": list(expected_key_paths),
                "backup_paths": list(expected_backup_paths),
            }
            self._atomic_create(intent_path, canonical_json_bytes(intent))

        tombstone_ids = [item.event_id for item in tombstones]
        for item in (*closure_objects, *closure_events):
            self._retire(item, tombstone_ids)

        projection_identifiers: set[str] = set()
        if self._projection_purger is not None:
            for event_ref in closure_events:
                try:
                    projection_identifiers.update(
                        self._safe_returned_identifier(value)
                        for value in self._projection_purger(event_ref)
                    )
                except PurgeIncomplete:
                    raise
                except Exception as exc:
                    raise PurgeIncomplete("projection purge hook failed") from exc

        deleted_key_paths: list[str] = []
        deleted_backup_paths: list[str] = []
        for item in closure_objects:
            _, keys, backups = self._purge_entry(item)
            deleted_key_paths.extend(keys)
            deleted_backup_paths.extend(backups)
        for item in closure_events:
            _, keys, backups = self._purge_entry(item)
            deleted_key_paths.extend(keys)
            deleted_backup_paths.extend(backups)

        for item in (*closure_objects, *closure_events):
            if not self._entry_absent(item):
                raise PurgeIncomplete(
                    f"purge could not prove content/key/backup absence for {canonical_sha256(item.to_dict())}"
                )
        for relative_text in (*expected_key_paths, *expected_backup_paths):
            relative = Path(relative_text)
            if self._absolute(relative).exists() or self._absolute(relative).is_symlink():
                raise PurgeIncomplete("a wrapped-key or backup surface remains after purge")
        if self._projection_absent is not None:
            for event_ref in closure_events:
                try:
                    projections_absent = self._projection_absent(event_ref)
                except Exception as exc:
                    raise PurgeIncomplete("projection absence verification failed") from exc
                if projections_absent is not True:
                    raise PurgeIncomplete("store-managed projections remain after purge")
        for tombstone in tombstones:
            self._decode_event_record(tombstone, self._logical_bytes(tombstone))

        removed_events = tuple(
            sorted((item.event_id, event_sha256s[item.event_id]) for item in closure_events)
        )
        removed_objects = tuple(
            sorted(
                (
                    item.object_id,
                    "sha256:" + item.sha256,
                    "sha256:" + item.manifest_sha256,
                )
                for item in closure_objects
            )
        )
        transitive_pointers = tuple(
            sorted(
                (
                    item.object_id,
                    "sha256:" + item.sha256,
                    "sha256:" + item.manifest_sha256,
                )
                for item in transitive_objects
            )
        )
        proof_body = {
            "target_event_id": target.event_id,
            "tombstone_event_ids": sorted(tombstone_ids),
            "removed_events": [
                {"event_id": event_id, "event_sha256": event_sha}
                for event_id, event_sha in removed_events
            ],
            "removed_objects": [
                {
                    "object_id": object_id,
                    "content_sha256": content_sha,
                    "manifest_sha256": manifest_sha,
                }
                for object_id, content_sha, manifest_sha in removed_objects
            ],
            "transitive_objects": [
                {
                    "object_id": object_id,
                    "content_sha256": content_sha,
                    "manifest_sha256": manifest_sha,
                }
                for object_id, content_sha, manifest_sha in transitive_pointers
            ],
            "key_envelopes": {
                "matched_count": len(expected_key_paths),
                "residual_count": 0,
                "scope_sha256": canonical_sha256(list(expected_key_paths)),
            },
            "backups": {
                "matched_count": len(expected_backup_paths),
                "residual_count": 0,
                "scope_sha256": canonical_sha256(list(expected_backup_paths)),
            },
            "projections": {
                "removed_count": len(projection_identifiers),
                "residual_count": 0,
                "scope_sha256": canonical_sha256(sorted(projection_identifiers)),
            },
        }
        receipt = PurgeReceipt(
            target_event_id=target.event_id,
            tombstones=tuple(sorted(tombstones, key=lambda item: item.event_id)),
            removed_events=removed_events,
            removed_objects=removed_objects,
            transitive_objects=transitive_pointers,
            key_envelopes_removed=len(expected_key_paths),
            backups_removed=len(expected_backup_paths),
            projections_removed=len(projection_identifiers),
            verification_sha256="sha256:" + canonical_sha256(proof_body),
        )
        self._atomic_create(
            self._purge_complete_path(target.event_id),
            canonical_json_bytes(
                {
                    "schema": "memory-local-purge-completion/v1",
                    "receipt": receipt.to_dict(),
                    "proof": proof_body,
                }
            ),
        )
        self._rebuild_manifest_unchecked()
        return receipt


__all__ = [
    "AccessDenied",
    "AccessRequest",
    "AuthenticatedCipher",
    "Authorizer",
    "BackupReceipt",
    "Clock",
    "EncryptionRequired",
    "EventRef",
    "ExpiredContent",
    "InvalidStoreInput",
    "MemoryStore",
    "MemoryStoreError",
    "ObjectRef",
    "PurgeIncomplete",
    "PurgeReceipt",
    "ProjectionPurger",
    "ProjectionVerifier",
    "StoragePolicy",
    "StoreConflict",
    "StoreCorruption",
    "StoreNotFound",
    "require_protected_store_outside_repository",
]
