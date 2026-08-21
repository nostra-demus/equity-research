#!/usr/bin/env python3
"""Exact-byte resolution across legacy Git sources and the Phase 2 object store.

Legacy adapter events resolve only from a clean, tracked ``100644`` blob in one immutable HEAD
snapshot.  Phase 2 manifests resolve only through ``MemoryStore``'s complete acquisition, source
version, manifest digest, and object ID lookup.  Repository/object locators are provenance and are
never interpreted as fetch instructions here; this module performs no network access.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import stat
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Any, Callable, Iterable, Mapping

try:  # Direct ``python scripts/...`` imports.
    from canonical_json import canonical_json_bytes, canonical_sha256
    from memory_adapters import ADAPTER_NAME, ADAPTER_RUNTIME, _classify, adapt_repository
    from memory_contract import (
        object_manifest_sha256,
        parse_aware_datetime,
        validate_event,
        validate_object_manifest,
    )
    from memory_store import (
        AccessDenied,
        ExpiredContent,
        InvalidStoreInput,
        MemoryStore,
        MemoryStoreError,
        ObjectRef,
        StoreConflict,
        StoreCorruption,
        StoreNotFound,
    )
except ImportError:  # Package-style imports from the repository root.
    from scripts.canonical_json import canonical_json_bytes, canonical_sha256
    from scripts.memory_adapters import (
        ADAPTER_NAME,
        ADAPTER_RUNTIME,
        _classify,
        adapt_repository,
    )
    from scripts.memory_contract import (
        object_manifest_sha256,
        parse_aware_datetime,
        validate_event,
        validate_object_manifest,
    )
    from scripts.memory_store import (
        AccessDenied,
        ExpiredContent,
        InvalidStoreInput,
        MemoryStore,
        MemoryStoreError,
        ObjectRef,
        StoreConflict,
        StoreCorruption,
        StoreNotFound,
    )


_SHA256_RE = re.compile(r"[0-9a-f]{64}")
_GIT_SHA_RE = re.compile(r"[0-9a-f]{40}(?:[0-9a-f]{24})?")
_LINE_LOCATOR_RE = re.compile(r"line-([1-9][0-9]*)")
_LEGACY_PAYLOAD_FIELDS = frozenset(
    {
        "legacy_schema",
        "record_type",
        "source_path",
        "source_locator",
        "source_sha256",
        "identity_mapping",
        "time_mapping",
        "record",
        "source_git_commit",
    }
)
_LEGACY_REQUIRED_PAYLOAD_FIELDS = _LEGACY_PAYLOAD_FIELDS - {"source_git_commit"}
_IDENTITY_MAPPING = {
    "strategy": "native-ids-plus-opaque-source-composites-v1",
    "opaque_uuid_namespace": "bcfa556d-1823-5793-8d33-bd24c14d3ff4",
    "aliases_preserved_under": "record",
}
_TIME_MAPPING_REQUIRED = frozenset(
    {
        "system_time_field",
        "system_time_precision",
        "system_time_trust",
        "valid_time_field",
        "valid_time_precision",
    }
)
_TIME_MAPPING_OPTIONAL = frozenset(
    {
        "git_receipt_time",
        "legacy_system_time_field",
        "legacy_system_time_precision",
    }
)


class MemoryResolutionError(RuntimeError):
    """Base class for fail-closed resolver failures."""


class InvalidResolutionRequest(MemoryResolutionError, ValueError):
    """The caller did not supply one complete supported resolution identity."""


class ResolutionAccessDenied(MemoryResolutionError, PermissionError):
    """Caller, source policy, or retention policy denied resolution."""


class ResolutionNotFound(MemoryResolutionError, FileNotFoundError):
    """The requested exact Git blob or store identity is absent."""


class ResolutionUnavailable(MemoryResolutionError):
    """The exact identity exists but is retired or otherwise unavailable."""


class ResolutionIntegrityError(MemoryResolutionError):
    """Bytes, metadata, repository state, or store state could not be trusted."""


@dataclass(frozen=True)
class ResolutionPolicy:
    classification: str
    retention: str
    retain_until: str | None

    def to_dict(self) -> dict[str, Any]:
        return {
            "classification": self.classification,
            "retention": self.retention,
            "retain_until": self.retain_until,
        }


@dataclass(frozen=True)
class ResolutionMetadata:
    """Closed, content-free metadata for one exact resolution."""

    schema: str
    lane: str
    event_id: str | None
    repository_revision: str | None
    source_path: str | None
    source_locator: str | None
    object_id: str | None
    acquisition_id: str | None
    source_version_id: str | None
    manifest_sha256: str | None
    content_sha256: str
    byte_length: int
    media_type: str
    policy: ResolutionPolicy

    def to_dict(self) -> dict[str, Any]:
        return {
            "schema": self.schema,
            "lane": self.lane,
            "event_id": self.event_id,
            "repository_revision": self.repository_revision,
            "source_path": self.source_path,
            "source_locator": self.source_locator,
            "object_id": self.object_id,
            "acquisition_id": self.acquisition_id,
            "source_version_id": self.source_version_id,
            "manifest_sha256": self.manifest_sha256,
            "content_sha256": self.content_sha256,
            "byte_length": self.byte_length,
            "media_type": self.media_type,
            "policy": self.policy.to_dict(),
        }


@dataclass(frozen=True)
class ResolvedBytes:
    """Exact bytes kept separate from their JSON-safe metadata."""

    metadata: ResolutionMetadata
    content: bytes


@dataclass(frozen=True)
class LegacyAccessRequest:
    action: str
    event_id: str
    source_path: str
    source_locator: str
    content_sha256: str
    policy: ResolutionPolicy
    principal: object | None


LegacyAuthorizer = Callable[[LegacyAccessRequest], bool]
Clock = Callable[[], dt.datetime]


def _utc_now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def _default_legacy_authorizer(request: LegacyAccessRequest) -> bool:
    return request.policy.classification == "public"


def _run_git(root: Path, arguments: list[str], *, binary: bool = False) -> bytes | str:
    environment = dict(os.environ)
    # Even read-only porcelain commands may opportunistically refresh index stat
    # metadata. Exact resolution is observational, so disable optional Git locks
    # and index refresh writes for every subprocess in this boundary.
    environment["GIT_OPTIONAL_LOCKS"] = "0"
    try:
        result = subprocess.run(
            ["git", *arguments],
            cwd=str(root),
            env=environment,
            check=False,
            capture_output=True,
            text=not binary,
            timeout=30,
        )
    except (OSError, subprocess.SubprocessError) as exc:
        raise ResolutionIntegrityError("Git resolution failed closed") from exc
    if result.returncode != 0:
        raise ResolutionIntegrityError("Git resolution failed closed")
    return result.stdout


def _read_regular_worktree_file(root: Path, relative: PurePosixPath) -> bytes:
    """Read a contained regular file only to prove the checkout matches HEAD.

    Resolved evidence still comes from the Git object database.  This separate read catches dirty
    bytes even when an index flag such as ``assume-unchanged`` suppresses normal status output.
    """
    absolute = root.joinpath(*relative.parts)
    try:
        before = absolute.lstat()
    except OSError as exc:
        raise ResolutionIntegrityError("legacy checkout source is missing or unreadable") from exc
    if not stat.S_ISREG(before.st_mode) or stat.S_ISLNK(before.st_mode):
        raise ResolutionIntegrityError("legacy checkout source must be a contained regular file")
    flags = os.O_RDONLY | getattr(os, "O_BINARY", 0) | getattr(os, "O_NOFOLLOW", 0)
    descriptor: int | None = None
    try:
        descriptor = os.open(str(absolute), flags)
        opened = os.fstat(descriptor)
        if not stat.S_ISREG(opened.st_mode) or (
            opened.st_dev,
            opened.st_ino,
        ) != (before.st_dev, before.st_ino):
            raise ResolutionIntegrityError("legacy checkout source changed before it was opened")
        with os.fdopen(descriptor, "rb") as stream:
            descriptor = None
            raw = stream.read()
        after = absolute.lstat()
    except MemoryResolutionError:
        raise
    except OSError as exc:
        raise ResolutionIntegrityError("legacy checkout source could not be read safely") from exc
    finally:
        if descriptor is not None:
            os.close(descriptor)
    before_identity = (
        before.st_dev,
        before.st_ino,
        before.st_mode,
        before.st_size,
        before.st_mtime_ns,
        before.st_ctime_ns,
    )
    after_identity = (
        after.st_dev,
        after.st_ino,
        after.st_mode,
        after.st_size,
        after.st_mtime_ns,
        after.st_ctime_ns,
    )
    if before_identity != after_identity:
        raise ResolutionIntegrityError("legacy checkout source changed while it was read")
    return raw


def _canonical_source_path(value: Any) -> tuple[str, PurePosixPath]:
    if not isinstance(value, str) or not value or "\\" in value or "\0" in value:
        raise InvalidResolutionRequest("payload.source_path must be a canonical repository path")
    path = PurePosixPath(value)
    if path.is_absolute() or path.as_posix() != value or any(
        part in {"", ".", ".."} for part in path.parts
    ):
        raise InvalidResolutionRequest("payload.source_path must be a canonical repository path")
    return value, path


def _policy(value: Any) -> ResolutionPolicy:
    if not isinstance(value, Mapping) or set(value) != {
        "classification",
        "retention",
        "retain_until",
    }:
        raise InvalidResolutionRequest("event policy must be a closed memory policy")
    return ResolutionPolicy(
        classification=value.get("classification"),  # type: ignore[arg-type]
        retention=value.get("retention"),  # type: ignore[arg-type]
        retain_until=value.get("retain_until"),  # type: ignore[arg-type]
    )


def _validate_legacy_shape(event: Any) -> tuple[Mapping[str, Any], ResolutionPolicy]:
    errors = validate_event(event)
    if errors:
        raise InvalidResolutionRequest("invalid memory event: " + "; ".join(errors[:8]))
    if not isinstance(event, Mapping):
        raise InvalidResolutionRequest("legacy resolution requires a memory event object")
    producer = event.get("producer")
    if producer != {
        "kind": "adapter",
        "name": ADAPTER_NAME,
        "runtime": ADAPTER_RUNTIME,
        "model": None,
        "prompt_program_sha": None,
    }:
        raise InvalidResolutionRequest("event producer is not the exact legacy adapter producer")
    payload = event.get("payload")
    if not isinstance(payload, Mapping):
        raise InvalidResolutionRequest("legacy adapter payload must be an object")
    keys = set(payload)
    if not _LEGACY_REQUIRED_PAYLOAD_FIELDS.issubset(keys) or not keys.issubset(
        _LEGACY_PAYLOAD_FIELDS
    ):
        raise InvalidResolutionRequest("legacy adapter payload has an unsupported or missing field")
    if not isinstance(payload.get("legacy_schema"), str) or not payload.get("legacy_schema"):
        raise InvalidResolutionRequest("payload.legacy_schema must be a nonempty string")
    if not isinstance(payload.get("record_type"), str) or not payload.get("record_type"):
        raise InvalidResolutionRequest("payload.record_type must be a nonempty string")
    if not isinstance(payload.get("record"), Mapping):
        raise InvalidResolutionRequest("payload.record must be an object")
    if payload.get("identity_mapping") != _IDENTITY_MAPPING:
        raise InvalidResolutionRequest("payload.identity_mapping is not the legacy adapter contract")
    time_mapping = payload.get("time_mapping")
    if not isinstance(time_mapping, Mapping):
        raise InvalidResolutionRequest("payload.time_mapping must be an object")
    time_keys = set(time_mapping)
    if not _TIME_MAPPING_REQUIRED.issubset(time_keys) or not time_keys.issubset(
        _TIME_MAPPING_REQUIRED | _TIME_MAPPING_OPTIONAL
    ):
        raise InvalidResolutionRequest("payload.time_mapping has an unsupported or missing field")
    if not all(isinstance(value, str) and value for value in time_mapping.values()):
        raise InvalidResolutionRequest("payload.time_mapping values must be nonempty strings")
    source_digest = payload.get("source_sha256")
    if not isinstance(source_digest, str) or _SHA256_RE.fullmatch(source_digest) is None:
        raise InvalidResolutionRequest("payload.source_sha256 must be a lowercase SHA-256 digest")
    source_commit = payload.get("source_git_commit")
    if source_commit is not None and (
        not isinstance(source_commit, str) or _GIT_SHA_RE.fullmatch(source_commit) is None
    ):
        raise InvalidResolutionRequest("payload.source_git_commit must be a canonical Git object ID")
    return payload, _policy(event.get("policy"))


class CompositeMemoryResolver:
    """Resolve legacy Git evidence and exact Phase 2 object manifests."""

    def __init__(
        self,
        repo_root: str | Path,
        *,
        store: MemoryStore | None = None,
        authorize_legacy: LegacyAuthorizer | None = None,
        source_policy: LegacyAuthorizer | None = None,
        clock: Clock = _utc_now,
    ) -> None:
        raw_root = Path(repo_root).expanduser()
        if raw_root.exists() and raw_root.is_symlink():
            raise InvalidResolutionRequest("repository root must not be a symlink")
        try:
            root = raw_root.resolve(strict=True)
        except OSError as exc:
            raise InvalidResolutionRequest("repository root does not exist") from exc
        if not root.is_dir():
            raise InvalidResolutionRequest("repository root must be a directory")
        if store is not None and not isinstance(store, MemoryStore):
            raise InvalidResolutionRequest("store must be a MemoryStore")
        if authorize_legacy is not None and not callable(authorize_legacy):
            raise InvalidResolutionRequest("authorize_legacy must be callable")
        if source_policy is not None and not callable(source_policy):
            raise InvalidResolutionRequest("source_policy must be callable")
        if not callable(clock):
            raise InvalidResolutionRequest("clock must be callable")
        self.repo_root = root
        self.store = store
        self._authorize_legacy = authorize_legacy or _default_legacy_authorizer
        self._source_policy = source_policy
        self._clock = clock

    def resolve(self, value: Any, *, principal: object | None = None) -> ResolvedBytes:
        if isinstance(value, Mapping) and value.get("schema") == "memory-event/v1":
            return self.resolve_legacy_event(value, principal=principal)
        if isinstance(value, Mapping) and value.get("schema") == "memory-object-manifest/v1":
            return self.resolve_object_manifest(value, principal=principal)
        raise InvalidResolutionRequest(
            "resolve accepts only a legacy memory event or complete memory object manifest"
        )

    def _authorize_legacy_event(
        self,
        event: Mapping[str, Any],
        payload: Mapping[str, Any],
        policy: ResolutionPolicy,
        principal: object | None,
    ) -> None:
        request = LegacyAccessRequest(
            action="resolve",
            event_id=event["event_id"],
            source_path=payload["source_path"],
            source_locator=payload["source_locator"],
            content_sha256="sha256:" + payload["source_sha256"],
            policy=policy,
            principal=principal,
        )
        if policy.retention == "expires":
            now = self._clock()
            if not isinstance(now, dt.datetime) or now.tzinfo is None or now.utcoffset() is None:
                raise ResolutionIntegrityError("resolver clock must be timezone-aware")
            expiry = parse_aware_datetime(policy.retain_until)  # type: ignore[arg-type]
            if now.astimezone(dt.timezone.utc) >= expiry:
                raise ResolutionAccessDenied("legacy source retention period has ended")
        if policy.retention == "source-policy":
            if self._source_policy is None:
                raise ResolutionAccessDenied("legacy source-policy resolution requires a hook")
            try:
                source_allowed = self._source_policy(request)
            except Exception as exc:
                raise ResolutionAccessDenied("legacy source-policy authorization failed closed") from exc
            if source_allowed is not True:
                raise ResolutionAccessDenied("legacy source policy denied resolution")
        try:
            allowed = self._authorize_legacy(request)
        except Exception as exc:
            raise ResolutionAccessDenied("legacy authorization failed closed") from exc
        if allowed is not True:
            raise ResolutionAccessDenied("legacy authorization denied resolution")

    def _git_root_and_head(self) -> str:
        top_level = _run_git(self.repo_root, ["rev-parse", "--show-toplevel"])
        if not isinstance(top_level, str) or Path(top_level.strip()).resolve() != self.repo_root:
            raise ResolutionIntegrityError("repository root is not the exact Git top level")
        head = _run_git(self.repo_root, ["rev-parse", "--verify", "HEAD"])
        if not isinstance(head, str) or _GIT_SHA_RE.fullmatch(head.strip()) is None:
            raise ResolutionIntegrityError("repository HEAD is unavailable")
        return head.strip()

    def _head_blob(self, source_path: str, path: PurePosixPath) -> tuple[str, bytes]:
        spec = _classify(source_path)
        if spec is None:
            raise InvalidResolutionRequest("payload.source_path is not a supported legacy source")
        head = self._git_root_and_head()
        status = _run_git(
            self.repo_root,
            ["status", "--porcelain=v1", "--untracked-files=all", "--", source_path],
        )
        if not isinstance(status, str) or status:
            raise ResolutionIntegrityError("legacy source path is staged, dirty, deleted, or untracked")
        tree = _run_git(
            self.repo_root,
            ["ls-tree", "-z", head, "--", source_path],
            binary=True,
        )
        if not isinstance(tree, bytes):
            raise ResolutionIntegrityError("Git tree lookup returned an invalid result")
        entries = [entry for entry in tree.split(b"\0") if entry]
        if len(entries) != 1:
            if not entries:
                raise ResolutionNotFound("legacy source is absent from repository HEAD")
            raise ResolutionIntegrityError("legacy source path is ambiguous in repository HEAD")
        try:
            header, raw_name = entries[0].split(b"\t", 1)
            mode, object_type, blob_id = header.decode("ascii").split(" ")
            tree_name = raw_name.decode("utf-8")
        except (ValueError, UnicodeError) as exc:
            raise ResolutionIntegrityError("legacy Git tree entry is malformed") from exc
        if tree_name != source_path or mode != "100644" or object_type != "blob":
            raise ResolutionIntegrityError("legacy source must be one exact tracked 100644 blob")
        if _GIT_SHA_RE.fullmatch(blob_id) is None:
            raise ResolutionIntegrityError("legacy source blob ID is malformed")
        index = _run_git(
            self.repo_root,
            ["ls-files", "--stage", "-z", "--", source_path],
            binary=True,
        )
        if not isinstance(index, bytes):
            raise ResolutionIntegrityError("Git index lookup returned an invalid result")
        index_entries = [entry for entry in index.split(b"\0") if entry]
        expected_index = f"100644 {blob_id} 0\t{source_path}".encode("utf-8")
        if index_entries != [expected_index]:
            raise ResolutionIntegrityError("legacy source index entry differs from repository HEAD")
        raw = _run_git(self.repo_root, ["cat-file", "blob", blob_id], binary=True)
        if not isinstance(raw, bytes):
            raise ResolutionIntegrityError("legacy Git blob read returned an invalid result")
        if _read_regular_worktree_file(self.repo_root, path) != raw:
            raise ResolutionIntegrityError("legacy checkout bytes differ from repository HEAD")
        status_after = _run_git(
            self.repo_root,
            ["status", "--porcelain=v1", "--untracked-files=all", "--", source_path],
        )
        head_after = _run_git(self.repo_root, ["rev-parse", "--verify", "HEAD"])
        index_after = _run_git(
            self.repo_root,
            ["ls-files", "--stage", "-z", "--", source_path],
            binary=True,
        )
        if (
            status_after
            or not isinstance(head_after, str)
            or head_after.strip() != head
            or index_after != index
        ):
            raise ResolutionIntegrityError("repository source snapshot changed during resolution")
        return head, raw

    def resolve_legacy_event(
        self,
        event: Any,
        *,
        principal: object | None = None,
    ) -> ResolvedBytes:
        payload, policy = _validate_legacy_shape(event)
        source_path, path = _canonical_source_path(payload.get("source_path"))
        locator = payload.get("source_locator")
        spec = _classify(source_path)
        if spec is None:
            raise InvalidResolutionRequest("payload.source_path is not a supported legacy source")
        line_match = _LINE_LOCATOR_RE.fullmatch(locator) if isinstance(locator, str) else None
        if (spec.format == "json" and locator != "json") or (
            spec.format == "ndjson" and line_match is None
        ):
            raise InvalidResolutionRequest("payload.source_locator does not match the source format")
        self._authorize_legacy_event(event, payload, policy, principal)
        head, blob = self._head_blob(source_path, path)
        if locator == "json":
            exact = blob
        else:
            assert line_match is not None
            line_number = int(line_match.group(1))
            lines = blob.splitlines(keepends=True)
            if line_number > len(lines):
                raise ResolutionNotFound("legacy NDJSON locator is outside the exact HEAD blob")
            exact = lines[line_number - 1].rstrip(b"\r\n")
            if not exact.strip():
                raise ResolutionNotFound("legacy NDJSON locator names an empty row")
        actual_digest = hashlib.sha256(exact).hexdigest()
        if actual_digest != payload.get("source_sha256"):
            raise ResolutionIntegrityError("legacy exact bytes do not match payload.source_sha256")
        try:
            record = json.loads(exact.decode("utf-8"))
        except (UnicodeError, json.JSONDecodeError) as exc:
            raise ResolutionIntegrityError("legacy exact bytes are not a UTF-8 JSON object") from exc
        if not isinstance(record, dict) or record != payload.get("record"):
            raise ResolutionIntegrityError("legacy exact bytes do not equal payload.record")
        metadata = ResolutionMetadata(
            schema="memory-resolution/v1",
            lane="legacy-git",
            event_id=event["event_id"],
            repository_revision=head,
            source_path=source_path,
            source_locator=locator,
            object_id=None,
            acquisition_id=None,
            source_version_id=None,
            manifest_sha256=None,
            content_sha256="sha256:" + actual_digest,
            byte_length=len(exact),
            media_type="application/json",
            policy=policy,
        )
        return ResolvedBytes(metadata=metadata, content=exact)

    def resolve_object_manifest(
        self,
        manifest: Any,
        *,
        principal: object | None = None,
    ) -> ResolvedBytes:
        if self.store is None:
            raise ResolutionUnavailable("no Phase 2 MemoryStore is configured")
        errors = validate_object_manifest(manifest)
        if errors:
            raise InvalidResolutionRequest("invalid object manifest: " + "; ".join(errors[:8]))
        if not isinstance(manifest, Mapping):
            raise InvalidResolutionRequest("object manifest must be an object")
        manifest_digest = object_manifest_sha256(manifest)
        try:
            ref = self.store.find_object(
                manifest["acquisition_id"],
                manifest["source_version_id"],
                manifest_digest,
                object_id=manifest["object_id"],
                principal=principal,
            )
            content = self.store.read_object(ref, principal=principal)
        except (AccessDenied, ExpiredContent) as exc:
            raise ResolutionAccessDenied("object-store policy denied exact resolution") from exc
        except StoreNotFound as exc:
            raise ResolutionNotFound("exact object manifest is absent") from exc
        except StoreConflict as exc:
            raise ResolutionUnavailable("exact object manifest is retired") from exc
        except StoreCorruption as exc:
            raise ResolutionIntegrityError("object store failed exact integrity checks") from exc
        except InvalidStoreInput as exc:
            raise InvalidResolutionRequest("object-store identity is invalid") from exc
        except MemoryStoreError as exc:
            raise MemoryResolutionError("object-store resolution failed closed") from exc
        if not isinstance(ref, ObjectRef) or not isinstance(content, bytes):
            raise ResolutionIntegrityError("object store returned an unsupported resolution result")
        expected_policy = _policy(manifest.get("policy"))
        if (
            ref.acquisition_id != manifest.get("acquisition_id")
            or ref.source_version_id != manifest.get("source_version_id")
            or ref.manifest_sha256 != manifest_digest
            or ref.object_id != manifest.get("object_id")
            or ref.policy.to_dict() != expected_policy.to_dict()
        ):
            raise ResolutionIntegrityError("object store returned a different exact manifest identity")
        digest = hashlib.sha256(content).hexdigest()
        if (
            f"sha256:{digest}" != manifest.get("content_sha256")
            or len(content) != manifest.get("byte_length")
            or digest != ref.sha256
        ):
            raise ResolutionIntegrityError("object-store bytes differ from the exact manifest")
        metadata = ResolutionMetadata(
            schema="memory-resolution/v1",
            lane="phase2-store",
            event_id=None,
            repository_revision=None,
            source_path=None,
            source_locator=None,
            object_id=ref.object_id,
            acquisition_id=ref.acquisition_id,
            source_version_id=ref.source_version_id,
            manifest_sha256="sha256:" + ref.manifest_sha256,
            content_sha256="sha256:" + digest,
            byte_length=len(content),
            media_type=manifest["media_type"],
            policy=expected_policy,
        )
        return ResolvedBytes(metadata=metadata, content=content)


def _legacy_candidates(events: Iterable[Any]) -> list[Mapping[str, Any]]:
    candidates: list[Mapping[str, Any]] = []
    for event in events:
        if not isinstance(event, Mapping):
            continue
        payload = event.get("payload")
        if (
            isinstance(payload, Mapping)
            and isinstance(payload.get("source_path"), str)
            and isinstance(payload.get("source_locator"), str)
            and isinstance(event.get("event_id"), str)
        ):
            candidates.append(event)
    return sorted(
        candidates,
        key=lambda row: (
            row["payload"]["source_path"],
            row["payload"]["source_locator"],
            row["event_id"],
        ),
    )


def _deterministic_sample(
    candidates: list[Mapping[str, Any]], sample_size: int
) -> list[Mapping[str, Any]]:
    selected: list[Mapping[str, Any]] = []
    for locator_kind in ("json", "line"):
        match = next(
            (
                row
                for row in candidates
                if (
                    row["payload"]["source_locator"] == "json"
                    if locator_kind == "json"
                    else _LINE_LOCATOR_RE.fullmatch(row["payload"]["source_locator"])
                    is not None
                )
            ),
            None,
        )
        if match is not None and match not in selected and len(selected) < sample_size:
            selected.append(match)
    for row in candidates:
        if len(selected) >= sample_size:
            break
        if row not in selected:
            selected.append(row)
    return selected


def run_legacy_resolution_drill(
    resolver: CompositeMemoryResolver,
    events: Iterable[Any],
    *,
    principal: object | None = None,
    sample_size: int = 8,
) -> dict[str, Any]:
    """Resolve one deterministic sample twice and compare metadata rebuild digests."""
    if not isinstance(resolver, CompositeMemoryResolver):
        raise InvalidResolutionRequest("resolver must be a CompositeMemoryResolver")
    if type(sample_size) is not int or not 1 <= sample_size <= 100:
        raise InvalidResolutionRequest("sample_size must be an integer from 1 to 100")
    candidates = _legacy_candidates(events)
    sample = _deterministic_sample(candidates, sample_size)
    if not sample:
        raise ResolutionNotFound("no legacy adapter events are available for the drill")

    def resolve_pass() -> tuple[list[dict[str, Any]], int]:
        metadata: list[dict[str, Any]] = []
        byte_length = 0
        for event in sample:
            result = resolver.resolve_legacy_event(event, principal=principal)
            metadata.append(result.metadata.to_dict())
            byte_length += len(result.content)
        return metadata, byte_length

    first, first_bytes = resolve_pass()
    second, second_bytes = resolve_pass()
    first_digest = canonical_sha256(first)
    second_digest = canonical_sha256(second)
    if first_digest != second_digest or first_bytes != second_bytes:
        raise ResolutionIntegrityError("resolution drill rebuild metadata is not deterministic")
    return {
        "schema": "memory-resolution-drill/v1",
        "candidate_count": len(candidates),
        "sample_count": len(sample),
        "sample_event_ids": [event["event_id"] for event in sample],
        "sample_locators": [event["payload"]["source_locator"] for event in sample],
        "resolved_byte_length": first_bytes,
        "first_metadata_sha256": "sha256:" + first_digest,
        "second_metadata_sha256": "sha256:" + second_digest,
        "metadata_match": True,
    }


def _write_cli_report(report: Mapping[str, Any]) -> None:
    sys.stdout.buffer.write(canonical_json_bytes(dict(report)) + b"\n")
    sys.stdout.buffer.flush()


def _cli_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run exact-byte permanent-memory evidence drills")
    subparsers = parser.add_subparsers(dest="command", required=True)
    drill = subparsers.add_parser("drill", help="resolve a deterministic legacy evidence sample")
    drill.add_argument("--root", required=True, help="exact clean Git repository root")
    drill.add_argument("--sample-size", type=int, default=8)
    drill.add_argument(
        "--authorize-internal-legacy",
        action="store_true",
        help="explicit local-operator authorization for internal legacy evidence",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _cli_parser().parse_args(argv)
    try:
        root = Path(args.root)

        def authorize(request: LegacyAccessRequest) -> bool:
            return request.policy.classification == "public" or (
                args.authorize_internal_legacy
                and request.policy.classification == "internal"
            )

        events, diagnostics = adapt_repository(root)
        error_count = sum(row.get("severity") == "error" for row in diagnostics)
        if error_count:
            raise ResolutionIntegrityError("legacy adaptation produced error diagnostics")
        resolver = CompositeMemoryResolver(root, authorize_legacy=authorize)
        report = run_legacy_resolution_drill(
            resolver,
            events,
            principal="local-operator",
            sample_size=args.sample_size,
        )
        report.update(
            {
                "ok": True,
                "adapter_diagnostic_count": len(diagnostics),
                "adapter_error_count": 0,
            }
        )
        _write_cli_report(report)
        return 0
    except Exception:
        # The CLI is an operational proof surface: refuse with no paths, content, or exception
        # details rather than risk exposing protected metadata through diagnostics.
        _write_cli_report(
            {
                "schema": "memory-resolution-drill/v1",
                "ok": False,
                "error": "resolution-refused",
            }
        )
        return 1


__all__ = [
    "CompositeMemoryResolver",
    "InvalidResolutionRequest",
    "LegacyAccessRequest",
    "MemoryResolutionError",
    "ResolutionAccessDenied",
    "ResolutionIntegrityError",
    "ResolutionMetadata",
    "ResolutionNotFound",
    "ResolutionPolicy",
    "ResolutionUnavailable",
    "ResolvedBytes",
    "run_legacy_resolution_drill",
]


if __name__ == "__main__":
    raise SystemExit(main())
