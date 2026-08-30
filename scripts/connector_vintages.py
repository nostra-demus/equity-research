#!/usr/bin/env python3
"""Read connector data as it was knowable at a retrieval-time cutoff.

The reader selects exactly one provider vintage.  If the primary has no
eligible vintage it tries explicitly declared fallbacks in priority order; it
never fills missing rows from a second provider or combines releases.
"""
from __future__ import annotations

import argparse
import errno
import hashlib
import json
import os
import re
import stat
import sys
from datetime import datetime, timezone
from typing import Any

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
_scripts_path_added = HERE not in sys.path
if _scripts_path_added:
    sys.path.append(HERE)
try:
    from connector_contract import (  # noqa: E402
        STABLE_READ_ATTEMPTS,
        TRANSIENT_READ_ERRNOS,
        canonical_json_bytes,
        connector_storage_paths,
        content_identity,
        load_valid_manifests,
        no_symlink_path,
        release_contract_window,
        reread_digest_matches,
        stable_read_backoff,
    )
finally:
    if _scripts_path_added:
        sys.path.remove(HERE)


def compute_vintage_id(vintage: dict[str, Any]) -> str:
    """Hash one immutable vintage without either recursive id copy.

    ``vintage_id`` is carried both at the metadata top level and inside the
    projection provenance.  Omitting exactly those two copies makes the id
    reproducible while keeping every other frozen evidence field in scope.
    """
    identity = dict(vintage)
    identity.pop("vintage_id", None)
    provenance = identity.get("provenance")
    if isinstance(provenance, dict):
        provenance = dict(provenance)
        provenance.pop("vintage_id", None)
        identity["provenance"] = provenance
    return "sha256:" + hashlib.sha256(canonical_json_bytes(identity)).hexdigest()


def _utc(value: str | datetime | None) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        dt = value
    else:
        text = value.strip()
        if len(text) == 10:
            text += "T23:59:59.999999Z"
        dt = datetime.fromisoformat(text.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _read_regular_nofollow_bytes_once(path: str) -> bytes | None:
    """One pinned attempt. Returns None on a refusal or an unsettled read; raises transient OSError.

    Sealed connector objects are content addressed.  Parsing one open and
    hashing a later open lets a path swap pair attacker-controlled JSON with a
    valid digest.  Pin the inode with ``O_NOFOLLOW`` and reject any identity or
    size change before returning the bytes used by both checks.

    st_ctime_ns is deliberately NOT part of that identity: connector storage sits under the
    Drive-synced ``data/`` tree, where a sync client writes xattrs that bump ctime without touching
    a byte (see the stable-read note in connector_contract.py). A ctime-only delta is re-verified by
    digest instead, which is strictly stronger than trusting the timestamp. A genuine CONTENT change
    mid-read is still rejected outright and never re-read.
    """
    before = os.lstat(path)
    if (stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode)
            or before.st_nlink != 1):
        return None
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(fd)
        identity = content_identity(opened)
        ctime_before = opened.st_ctime_ns
        if opened.st_nlink != 1:
            return None
        if identity != content_identity(before):
            # Pin lost between lstat and open (Drive unlink+rename mid-resync). Nothing was read, so
            # this is a retryable race, not a verdict — raise it as transient for the retry loop.
            raise OSError(errno.ESTALE, f"file changed before read at {path}")
        chunks: list[bytes] = []
        remaining = opened.st_size
        while remaining:
            chunk = os.read(fd, min(remaining, 1024 * 1024))
            if not chunk:
                return None
            chunks.append(chunk)
            remaining -= len(chunk)
        # A regular file growing during the bounded read is also a change.
        if os.read(fd, 1):
            return None
        after_open = os.fstat(fd)
        after_path = os.lstat(path)
        if identity != content_identity(after_open) or identity != content_identity(after_path):
            return None
        raw = b"".join(chunks)
        if ctime_before != after_open.st_ctime_ns or ctime_before != after_path.st_ctime_ns:
            # metadata-only touch (xattr / chmod / cloud-sync): prove the bytes, don't trust the clock
            if not reread_digest_matches(fd, opened.st_size, hashlib.sha256(raw).hexdigest()):
                return None
        return raw
    finally:
        os.close(fd)


def _read_regular_nofollow_bytes(path: str) -> bytes | None:
    """Read one stable regular-file inode, riding out transient cloud-filesystem errors.

    Drive hydrating a dehydrated file raises ETIMEDOUT ("[Errno 60]") on an otherwise fine file, so
    a transient OSError is retried rather than turned into a silent None. Every other outcome keeps
    the original fail-closed contract: None.
    """
    for attempt in range(STABLE_READ_ATTEMPTS):
        try:
            return _read_regular_nofollow_bytes_once(path)
        except OSError as exc:
            if exc.errno not in TRANSIENT_READ_ERRNOS:
                return None
        if attempt + 1 < STABLE_READ_ATTEMPTS:
            stable_read_backoff(attempt)
    return None


def _read_json(path: str, *, expected_sha256: str | None = None) -> Any | None:
    raw = _read_regular_nofollow_bytes(path)
    if raw is None:
        return None
    if expected_sha256 is not None and hashlib.sha256(raw).hexdigest() != expected_sha256:
        return None
    try:
        value = json.loads(raw.decode("utf-8"))
        return value if canonical_json_bytes(value) == raw else None
    except (UnicodeDecodeError, TypeError, ValueError, json.JSONDecodeError):
        return None


_PREFIX_COMPLETE = 1
_PREFIX_INCOMPLETE = 0
_PREFIX_INVALID = -1


def _prefix_string(text: str, index: int) -> tuple[int, int, str | None]:
    """Parse one compact JSON string, distinguishing EOF from bad syntax."""
    start = index
    index += 1
    while index < len(text):
        char = text[index]
        if char == '"':
            token = text[start:index + 1]
            try:
                value = json.loads(token)
            except (TypeError, ValueError, json.JSONDecodeError):
                return _PREFIX_INVALID, index, None
            return _PREFIX_COMPLETE, index + 1, value if isinstance(value, str) else None
        if char == "\\":
            index += 1
            if index >= len(text):
                return _PREFIX_INCOMPLETE, index, None
            escape = text[index]
            if escape == "u":
                available = text[index + 1:index + 5]
                if any(ch not in "0123456789abcdefABCDEF" for ch in available):
                    return _PREFIX_INVALID, index, None
                if len(available) < 4:
                    return _PREFIX_INCOMPLETE, len(text), None
                index += 4
            elif escape not in '\"\\/bfnrt':
                return _PREFIX_INVALID, index, None
        elif ord(char) < 0x20:
            return _PREFIX_INVALID, index, None
        index += 1
    return _PREFIX_INCOMPLETE, index, None


def _prefix_number(text: str, index: int) -> tuple[int, int]:
    """Parse the JSON number grammar while treating a valid EOF as complete."""
    if text[index] == "-":
        index += 1
        if index == len(text):
            return _PREFIX_INCOMPLETE, index
    if index >= len(text) or not text[index].isdigit():
        return _PREFIX_INVALID, index
    if text[index] == "0":
        index += 1
        if index < len(text) and text[index].isdigit():
            return _PREFIX_INVALID, index
    else:
        while index < len(text) and text[index].isdigit():
            index += 1
    if index < len(text) and text[index] == ".":
        index += 1
        if index == len(text):
            return _PREFIX_INCOMPLETE, index
        if not text[index].isdigit():
            return _PREFIX_INVALID, index
        while index < len(text) and text[index].isdigit():
            index += 1
    if index < len(text) and text[index] in "eE":
        index += 1
        if index == len(text):
            return _PREFIX_INCOMPLETE, index
        if text[index] in "+-":
            index += 1
            if index == len(text):
                return _PREFIX_INCOMPLETE, index
        if not text[index].isdigit():
            return _PREFIX_INVALID, index
        while index < len(text) and text[index].isdigit():
            index += 1
    return _PREFIX_COMPLETE, index


def _prefix_value(text: str, index: int) -> tuple[int, int]:
    if index >= len(text):
        return _PREFIX_INCOMPLETE, index
    char = text[index]
    if char == '"':
        status, end, _value = _prefix_string(text, index)
        return status, end
    if char == "{":
        return _prefix_object(text, index)
    if char == "[":
        return _prefix_array(text, index)
    for literal in ("true", "false", "null"):
        remaining = text[index:]
        if text.startswith(literal, index):
            return _PREFIX_COMPLETE, index + len(literal)
        if literal.startswith(remaining):
            return _PREFIX_INCOMPLETE, len(text)
    if char == "-" or char.isdigit():
        return _prefix_number(text, index)
    return _PREFIX_INVALID, index


def _prefix_array(text: str, index: int) -> tuple[int, int]:
    index += 1
    if index == len(text):
        return _PREFIX_INCOMPLETE, index
    if text[index] == "]":
        return _PREFIX_COMPLETE, index + 1
    while True:
        status, index = _prefix_value(text, index)
        if status != _PREFIX_COMPLETE:
            return status, index
        if index == len(text):
            return _PREFIX_INCOMPLETE, index
        if text[index] == "]":
            return _PREFIX_COMPLETE, index + 1
        if text[index] != ",":
            return _PREFIX_INVALID, index
        index += 1
        if index == len(text):
            return _PREFIX_INCOMPLETE, index


def _prefix_object(text: str, index: int) -> tuple[int, int]:
    index += 1
    if index == len(text):
        return _PREFIX_INCOMPLETE, index
    if text[index] == "}":
        return _PREFIX_COMPLETE, index + 1
    prior_key_order: bytes | None = None
    while True:
        if text[index] != '"':
            return _PREFIX_INVALID, index
        status, index, key = _prefix_string(text, index)
        if status != _PREFIX_COMPLETE:
            return status, index
        try:
            key_order = key.encode("utf-16-be") if key is not None else None
        except UnicodeEncodeError:
            return _PREFIX_INVALID, index
        if key_order is None or (prior_key_order is not None and key_order <= prior_key_order):
            return _PREFIX_INVALID, index
        prior_key_order = key_order
        if index == len(text):
            return _PREFIX_INCOMPLETE, index
        if text[index] != ":":
            return _PREFIX_INVALID, index
        status, index = _prefix_value(text, index + 1)
        if status != _PREFIX_COMPLETE:
            return status, index
        if index == len(text):
            return _PREFIX_INCOMPLETE, index
        if text[index] == "}":
            return _PREFIX_COMPLETE, index + 1
        if text[index] != ",":
            return _PREFIX_INVALID, index
        index += 1
        if index == len(text):
            return _PREFIX_INCOMPLETE, index


def canonical_json_object_strict_prefix(path: str, *, allow_empty: bool = False) -> bool:
    """Recognize an interrupted compact canonical-JSON object, never a full file.

    The immutable FUSE fallback can die after its O_EXCL claim but before all
    bytes are written.  Such an unreferenced prefix is forensic debris, not a
    committed record.  This parser is deliberately stricter than a generic
    `JSONDecodeError`: it accepts only whitespace-free, sorted-key JSON syntax
    that can still be completed at EOF.
    """
    try:
        info = os.lstat(path)
        if not stat.S_ISREG(info.st_mode) or stat.S_ISLNK(info.st_mode) \
                or info.st_size < 0 or info.st_size > 16 * 1024 * 1024:
            return False
        # Empty is a prefix of every byte sequence but carries no identity by
        # itself. Admit it only when a caller has already proved the exact
        # publisher-shaped lane/name and that the record is unreachable.
        if info.st_size == 0:
            return allow_empty
        flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
        fd = os.open(path, flags)
        try:
            opened = os.fstat(fd)
            if (opened.st_dev, opened.st_ino) != (info.st_dev, info.st_ino):
                return False
            data = b""
            while len(data) < opened.st_size:
                chunk = os.read(fd, opened.st_size - len(data))
                if not chunk:
                    break
                data += chunk
        finally:
            os.close(fd)
        if len(data) != info.st_size:
            return False
        text = data.decode("utf-8")
    except (OSError, UnicodeDecodeError):
        return False
    if not text.startswith("{"):
        return False
    try:
        parsed = json.loads(text)
        expected = canonical_json_bytes(parsed)
        return len(data) < len(expected) and expected.startswith(data)
    except (TypeError, ValueError, json.JSONDecodeError):
        pass
    status, end = _prefix_object(text, 0)
    return status == _PREFIX_INCOMPLETE and end == len(text)


def _sha256_file(path: str) -> str:
    raw = _read_regular_nofollow_bytes(path)
    return hashlib.sha256(raw).hexdigest() if raw is not None else ""


def _safe_path(data_root: str, rel: str) -> str | None:
    root = os.path.realpath(os.path.abspath(data_root))
    return no_symlink_path(root, os.path.abspath(os.path.join(root, rel)))


def _identity_matches(meta: dict[str, Any], current: dict[str, Any], series_id: str, subject: str) -> bool:
    required = ("connector_id", "dataset_id", "series_id", "subject", "provider", "provider_priority",
                "as_of", "retrieved_at", "content_sha256", "blob_path", "vintage_id", "provenance")
    v2 = current.get("manifest_version") == 2
    if v2:
        required += (
            "manifest_version", "schema_version", "series", "authority_class", "acquisition", "source_type", "tier",
            "license", "licensing", "release", "output_schema", "units", "minimum_history",
            "connector_fingerprint", "publisher_contract_fingerprint", "connector_commit",
        )
    if any(key not in meta for key in required):
        return False
    if meta.get("series_id") != series_id or meta.get("subject") != subject:
        return False
    if any(meta.get(key) != current.get(key) for key in ("connector_id", "dataset_id", "series_id", "subject", "provider")):
        return False
    if not isinstance(meta.get("provider_priority"), int) or meta["provider_priority"] < 1:
        return False
    if v2:
        if (meta.get("manifest_version") != 2
                or not isinstance(meta.get("schema_version"), int) or meta["schema_version"] < 1
                or not isinstance(meta.get("series"), str) or not meta["series"]
                or not isinstance(meta.get("authority_class"), str)
                or not isinstance(meta.get("acquisition"), str)
                or not isinstance(meta.get("source_type"), str)
                or not isinstance(meta.get("tier"), int) or isinstance(meta.get("tier"), bool)
                or not isinstance(meta.get("license"), str) or not meta["license"]
                or not isinstance(meta.get("licensing"), dict)
                or not isinstance(meta.get("release"), dict)
                or not isinstance(meta.get("units"), dict)
                or not isinstance(meta.get("minimum_history"), dict)):
            return False
        if meta.get("acquisition") == "manual":
            manual_input = meta.get("manual_input")
            provenance_manual = (meta.get("provenance") or {}).get("manual_input") \
                if isinstance(meta.get("provenance"), dict) else None
            if (not isinstance(manual_input, dict)
                    or set(manual_input) != {"sha256", "size_bytes", "filename", "detected_format"}
                    or not isinstance(manual_input.get("sha256"), str)
                    or len(manual_input["sha256"]) != 64
                    or any(c not in "0123456789abcdef" for c in manual_input["sha256"])
                    or not isinstance(manual_input.get("size_bytes"), int)
                    or isinstance(manual_input.get("size_bytes"), bool)
                    or manual_input["size_bytes"] <= 0
                    or not isinstance(manual_input.get("filename"), str)
                    or not manual_input["filename"]
                    or os.path.basename(manual_input["filename"]) != manual_input["filename"]
                    or not isinstance(manual_input.get("detected_format"), str)
                    or not manual_input["detected_format"]
                    or provenance_manual != manual_input
                    or meta["provenance"].get("acquired_via") != "manual_local_file"):
                return False
        connector_hash = meta.get("connector_fingerprint")
        publisher_hash = meta.get("publisher_contract_fingerprint")
        if (not isinstance(connector_hash, str) or len(connector_hash) != 64
                or any(c not in "0123456789abcdef" for c in connector_hash)
                or not isinstance(publisher_hash, str) or len(publisher_hash) != 64
                or any(c not in "0123456789abcdef" for c in publisher_hash)
                or not isinstance(meta.get("connector_commit"), str) or not meta["connector_commit"]):
            return False
    fallback = meta.get("fallback_for")
    if fallback is not None and not isinstance(fallback, str):
        return False
    try:
        datetime.strptime(str(meta["as_of"]), "%Y-%m-%d")
        _utc(str(meta["retrieved_at"]))
    except (TypeError, ValueError):
        return False
    digest = meta.get("content_sha256")
    vintage_id = meta.get("vintage_id")
    provenance = meta.get("provenance")
    provenance_identity = (
        "connector_id", "dataset_id", "series_id", "series", "subject", "provider",
        "provider_priority", "fallback_for", "acquisition", "authority_class",
        "source_type", "tier", "license", "licensing", "as_of", "retrieved_at",
        "content_sha256", "connector_fingerprint",
        "publisher_contract_fingerprint", "connector_commit", "manifest_version", "schema_version",
    )
    provenance_source_url = provenance.get("source_url") if isinstance(provenance, dict) else None
    if (not provenance_source_url and isinstance(provenance, dict)
            and isinstance(provenance.get("source_urls"), list) and provenance["source_urls"]):
        provenance_source_url = provenance["source_urls"][0]
    provenance_published_at = (provenance.get("published_at") or provenance.get("published")) \
        if isinstance(provenance, dict) else None
    try:
        computed_vintage_id = compute_vintage_id(meta)
    except (TypeError, ValueError):
        return False
    return (isinstance(digest, str) and len(digest) == 64
            and all(c in "0123456789abcdef" for c in digest)
            and isinstance(vintage_id, str) and len(vintage_id) == 71
            and vintage_id.startswith("sha256:")
            and all(c in "0123456789abcdef" for c in vintage_id[7:])
            and isinstance(provenance, dict) and provenance.get("vintage_id") == vintage_id
            and all(key in provenance and provenance.get(key) == meta.get(key)
                    for key in provenance_identity)
            and "revision_of" in provenance
            and provenance.get("revision_of") == meta.get("revision_of")
            and meta.get("source_url") == provenance_source_url
            and meta.get("published_at") == provenance_published_at
            and (meta.get("acquisition") == "manual" or (
                "manual_input" not in provenance and "acquired_via" not in provenance
            ))
            and (meta.get("revision_of") is None or (
                isinstance(meta.get("revision_of"), str)
                and len(meta["revision_of"]) == 71
                and meta["revision_of"].startswith("sha256:")
                and all(c in "0123456789abcdef" for c in meta["revision_of"][7:])
            ))
            and computed_vintage_id == vintage_id)


def _receipt_path(data_root: str, current: dict[str, Any], metadata_hash: str) -> str | None:
    rel = os.path.join(
        "_connectors", "commits", str(current.get("dataset_id")), str(current.get("series_id")),
        str(current.get("subject")), f"{metadata_hash}.json",
    )
    path = _safe_path(data_root, rel)
    expected_dir = _safe_path(data_root, os.path.dirname(rel))
    return path if path is not None and expected_dir is not None and os.path.dirname(path) == expected_dir else None


HEAD_KEYS = {"sequence", "path", "metadata_sha256", "chain_sha256"}


def _valid_head(head: Any) -> bool:
    return (isinstance(head, dict) and set(head) == HEAD_KEYS
            and isinstance(head.get("sequence"), int) and not isinstance(head.get("sequence"), bool)
            and head["sequence"] >= 1 and isinstance(head.get("path"), str)
            and all(isinstance(head.get(key), str) and len(head[key]) == 64
                    and all(c in "0123456789abcdef" for c in head[key])
                    for key in ("metadata_sha256", "chain_sha256")))


def linked_chain_sha256(sequence: int, vintage_path: str, metadata_sha256: str, prior_head: dict[str, Any] | None) -> str:
    """Rolling hash for the one-link-per-retrieval commit chain."""
    material = {
        "sequence": sequence, "vintage_path": vintage_path,
        "vintage_metadata_sha256": metadata_sha256, "prior_head": prior_head,
    }
    return hashlib.sha256(canonical_json_bytes(material)).hexdigest()


def make_linked_head(
    sequence: int, vintage_path: str, metadata_sha256: str, prior_head: dict[str, Any] | None,
) -> dict[str, Any]:
    return {
        "sequence": sequence, "path": vintage_path, "metadata_sha256": metadata_sha256,
        "chain_sha256": linked_chain_sha256(sequence, vintage_path, metadata_sha256, prior_head),
    }


def _load_linked_head(
    data_root: str, current: dict[str, Any], head: dict[str, Any], series_id: str, subject: str,
) -> tuple[dict[str, Any], dict[str, Any] | None] | None:
    if not _valid_head(head):
        return None
    root = os.path.realpath(os.path.abspath(data_root))
    path = _safe_path(data_root, head["path"])
    expected_dir = os.path.realpath(os.path.join(
        root, "_connectors", "vintages", str(current.get("dataset_id")), series_id, subject,
    ))
    if path is None or os.path.dirname(path) != expected_dir:
        return None
    meta = _read_json(path, expected_sha256=head["metadata_sha256"])
    if not isinstance(meta, dict) or not _identity_matches(meta, current, series_id, subject):
        return None
    receipt_path = _receipt_path(data_root, current, head["metadata_sha256"])
    receipt = _read_json(receipt_path) if receipt_path else None
    expected_keys = {
        "commit_protocol_version", "connector_id", "dataset_id", "series_id", "subject", "sequence",
        "vintage_id", "vintage_path", "vintage_metadata_sha256", "content_sha256", "retrieved_at",
        "prior_head", "chain_sha256",
    }
    if (not isinstance(receipt, dict) or set(receipt) != expected_keys
            or receipt.get("commit_protocol_version") != 1
            or receipt.get("connector_id") != current.get("connector_id")
            or receipt.get("dataset_id") != current.get("dataset_id")
            or receipt.get("series_id") != series_id or receipt.get("subject") != subject
            or receipt.get("sequence") != head["sequence"] or receipt.get("vintage_path") != head["path"]
            or receipt.get("vintage_id") != meta.get("vintage_id")
            or receipt.get("vintage_metadata_sha256") != head["metadata_sha256"]
            or receipt.get("content_sha256") != meta.get("content_sha256")
            or receipt.get("retrieved_at") != meta.get("retrieved_at")
            or receipt.get("chain_sha256") != head["chain_sha256"]):
        return None
    prior = receipt.get("prior_head")
    if (head["sequence"] == 1):
        if prior is not None:
            return None
    elif not _valid_head(prior) or prior["sequence"] != head["sequence"] - 1:
        return None
    if linked_chain_sha256(head["sequence"], head["path"], head["metadata_sha256"], prior) != head["chain_sha256"]:
        return None
    return meta, prior


def _marker_path(data_root: str, current: dict[str, Any], sequence: int) -> str | None:
    return _safe_path(data_root, os.path.join(
        "_connectors", "committed_heads", str(current.get("dataset_id")),
        str(current.get("series_id")), str(current.get("subject")), f"{sequence:020d}.json",
    ))


def _marker_matches(current: dict[str, Any], marker: Any, head: dict[str, Any]) -> bool:
    return (isinstance(marker, dict) and set(marker) == {
        "commit_protocol_version", "connector_id", "dataset_id", "series_id", "subject", "committed_head",
    } and marker.get("commit_protocol_version") == 1
            and marker.get("connector_id") == current.get("connector_id")
            and marker.get("dataset_id") == current.get("dataset_id")
            and marker.get("series_id") == current.get("series_id")
            and marker.get("subject") == current.get("subject")
            and marker.get("committed_head") == head)


def _marker_bytes(current: dict[str, Any], head: dict[str, Any]) -> bytes:
    """Canonical bytes for the immutable sequence claim."""
    return canonical_json_bytes({
        "commit_protocol_version": 1,
        "connector_id": current.get("connector_id"),
        "dataset_id": current.get("dataset_id"),
        "series_id": current.get("series_id"),
        "subject": current.get("subject"),
        "committed_head": head,
    })


def _marker_inventory_consistent(
    data_root: str,
    current: dict[str, Any],
    count: int,
    allowed_pending_sequence: int | None = None,
) -> bool:
    """Require exactly the immutable marker names claimed by ``count``.

    Current-head verification still opens a constant number of records, but a
    directory inventory prevents a deleted older marker, a sequence gap, or a
    rolled-back pointer with a later marker from looking healthy.  Directory
    scan errors, symlinks, subdirectories, and unexpected names all fail
    closed.
    """
    if isinstance(count, bool) or not isinstance(count, int) or count < 1:
        return False
    marker_path = _marker_path(data_root, current, 1)
    if marker_path is None:
        return False
    directory = os.path.dirname(marker_path)
    expected = {f"{sequence:020d}.json" for sequence in range(1, count + 1)}
    if allowed_pending_sequence is not None:
        if (isinstance(allowed_pending_sequence, bool)
                or allowed_pending_sequence != count + 1):
            return False
        expected.add(f"{allowed_pending_sequence:020d}.json")
    try:
        with os.scandir(directory) as entries:
            actual: set[str] = set()
            for entry in entries:
                if entry.is_symlink() or not entry.is_file(follow_symlinks=False):
                    return False
                if entry.name.endswith(".tmp"):
                    continue
                if entry.name in actual:
                    return False
                actual.add(entry.name)
    except OSError:
        return False
    return actual == expected


def _head_marker_boundary_consistent(data_root: str, current: dict[str, Any], head: dict[str, Any]) -> bool:
    """Constant-record-read rollback/fork check plus complete marker inventory."""
    own_path = _marker_path(data_root, current, head["sequence"])
    if own_path is None or not _marker_inventory_consistent(data_root, current, head["sequence"]):
        return False
    return os.path.lexists(own_path) and _marker_matches(current, _read_json(own_path), head)


def _head_markers_consistent(
    data_root: str,
    current: dict[str, Any],
    heads: dict[int, dict[str, Any]],
    allowed_pending_sequence: int | None = None,
) -> bool:
    """Full PIT audit: every accepted sequence marker matches its chain head."""
    count = len(heads)
    if not _marker_inventory_consistent(
        data_root, current, count, allowed_pending_sequence,
    ):
        return False
    for sequence in range(1, count + 1):
        marker_path = _marker_path(data_root, current, sequence)
        if marker_path is None:
            return False
        if not os.path.lexists(marker_path):
            return False
        if not _marker_matches(current, _read_json(marker_path), heads[sequence]):
            return False
    return True


def verify_linked_head(
    data_root: str, current: dict[str, Any], series_id: str, subject: str,
) -> dict[str, Any] | None:
    """Constant-record-read latest-head check used by health and publication.

    It also inventories immutable lane names, so runtime grows with directory
    entries even though the number of file contents opened stays constant.
    """
    count = current.get("committed_count")
    head = current.get("committed_head")
    if (current.get("commit_protocol_version") != 1 or current.get("series_id") != series_id
            or current.get("subject") != subject or not isinstance(count, int) or isinstance(count, bool)
            or count < 1 or not _valid_head(head) or head["sequence"] != count):
        return None
    receipt_path = _receipt_path(data_root, current, head["metadata_sha256"])
    if receipt_path is None or current.get("commit_receipt_path") != os.path.relpath(
        receipt_path, os.path.realpath(os.path.abspath(data_root)),
    ):
        return None
    loaded = _load_linked_head(data_root, current, head, series_id, subject)
    if (loaded is None
            or not _head_marker_boundary_consistent(data_root, current, head)
            or not _sealed_lane_inventory_consistent(data_root, current, count)):
        return None
    latest, _prior = loaded
    if any(current.get(key) != value for key, value in latest.items()):
        return None
    return latest


def _regular_lane_files(path: str) -> list[str] | None:
    """Return a complete regular-file inventory, or ``None`` on any defect."""
    if not os.path.lexists(path):
        return []
    if os.path.islink(path) or not os.path.isdir(path):
        return None
    try:
        with os.scandir(path) as entries:
            files: list[str] = []
            for entry in entries:
                if entry.is_symlink() or not entry.is_file(follow_symlinks=False):
                    return None
                if entry.name.endswith(".tmp"):
                    continue
                if entry.stat(follow_symlinks=False).st_nlink != 1:
                    return None
                files.append(entry.path)
    except OSError:
        return None
    return sorted(files)


def _head_from_receipt(receipt: Any) -> dict[str, Any] | None:
    """Reconstruct the linked head named by one immutable receipt."""
    if not isinstance(receipt, dict):
        return None
    head = {
        "sequence": receipt.get("sequence"),
        "path": receipt.get("vintage_path"),
        "metadata_sha256": receipt.get("vintage_metadata_sha256"),
        "chain_sha256": receipt.get("chain_sha256"),
    }
    return head if _valid_head(head) else None


def _sealed_lane_inventory_consistent(
    data_root: str,
    current: dict[str, Any],
    count: int,
    allowed_pending_receipts: set[str] | None = None,
) -> bool:
    """Reject a rolled-back pointer while later immutable artifacts survive.

    The linked head proves the current tail, while the sequence-marker inventory
    proves the claimed commit count.  Each claimed retrieval has exactly one
    receipt, so any extra receipt is a surviving successor witness and fails
    closed even if its marker disappeared.

    A process can die after a complete immutable vintage is written but before
    its receipt exists.  Such a vintage is an unclaimed forensic artifact: it is
    not reachable from the receipt chain and can never enter PIT.  Preserve and
    ignore it here so the prior committed current remains usable and a later
    retry can append normally.  There must still be at least one vintage per
    claimed receipt and the latest named vintage must exist.

    This inventories names only; current health still opens a constant number of
    files as history grows.  Full PIT reads continue to validate every record.
    """
    if isinstance(count, bool) or not isinstance(count, int) or count < 1:
        return False
    dataset_id = current.get("dataset_id")
    series_id = current.get("series_id")
    subject = current.get("subject")
    if not all(isinstance(value, str) and value for value in (dataset_id, series_id, subject)):
        return False
    vintage_dir = _safe_path(data_root, os.path.join(
        "_connectors", "vintages", dataset_id, series_id, subject,
    ))
    receipt_dir = _safe_path(data_root, os.path.join(
        "_connectors", "commits", dataset_id, series_id, subject,
    ))
    if vintage_dir is None or receipt_dir is None:
        return False
    vintages = _regular_lane_files(vintage_dir)
    receipts = _regular_lane_files(receipt_dir)
    if vintages is None or receipts is None or len(vintages) < count or len(receipts) < count:
        return False
    # Only publisher-shaped immutable names can be preserved as crash debris.
    # Otherwise an arbitrary file (including a strict JSON prefix) can be
    # ignored by current health today while making the next publication fail
    # its stable-identity scan.  Validate names before the O(1) happy-path
    # return so malformed extras never hide merely because counts happen to
    # equal the committed sequence.
    if (any(not re_fullmatch_vintage_name(os.path.basename(path)) for path in vintages)
            or any(re.fullmatch(r"[0-9a-f]{64}\.json", os.path.basename(path)) is None
                   for path in receipts)):
        return False

    head = current.get("committed_head")
    if not _valid_head(head):
        return False
    latest_vintage = _safe_path(data_root, head["path"])
    latest_receipt = _receipt_path(data_root, current, head["metadata_sha256"])
    if latest_vintage is None or latest_receipt is None:
        return False
    vintage_set = {os.path.realpath(path) for path in vintages}
    receipt_set = {os.path.realpath(path) for path in receipts}
    if (os.path.realpath(latest_vintage) not in vintage_set
            or os.path.realpath(latest_receipt) not in receipt_set):
        return False

    # The normal path remains name-inventory-only and O(1) in record reads.
    # Extra receipts occur only on an exceptional cross-host/partial-write path.
    # Audit every one then: a receipt is either the unique marker winner for its
    # sequence, a proven losing branch beside a different immutable winner
    # marker, or the one explicitly admitted marker-less successor while its
    # exact marker is being recovered.  A future/unlinked/malformed receipt is
    # never ignored merely to restore availability.
    allowed_pending = set(allowed_pending_receipts or ())
    if len(receipts) == count and not allowed_pending:
        return True
    accepted = 0
    pending_seen: set[str] = set()
    for receipt_path in receipts:
        receipt = _read_json(receipt_path)
        if receipt is None and canonical_json_object_strict_prefix(receipt_path, allow_empty=True):
            # A prefix replacing a committed receipt failed the linked-head
            # check already. Only an extra unreachable artifact reaches here.
            continue
        receipt_head = _head_from_receipt(receipt)
        if receipt_head is None:
            return False
        if os.path.basename(receipt_path) != f"{receipt_head['metadata_sha256']}.json":
            return False
        loaded = _load_linked_head(
            data_root, current, receipt_head, str(series_id), str(subject),
        )
        if loaded is None:
            return False
        _meta, linked_prior = loaded
        metadata_hash = receipt_head["metadata_sha256"]
        marker_path = _marker_path(data_root, current, receipt_head["sequence"])
        marker = _read_json(marker_path) if marker_path is not None else None
        if _marker_matches(current, marker, receipt_head):
            if receipt_head["sequence"] > count:
                return False
            accepted += 1
            continue
        if (metadata_hash in allowed_pending
                and receipt_head["sequence"] == count + 1
                and linked_prior == current.get("committed_head")
                and (marker is None or not _marker_matches(current, marker, receipt_head))):
            pending_seen.add(metadata_hash)
            continue
        # A different marker at the same already-accepted sequence is durable
        # proof this fully sealed receipt lost the cross-host CAS race.
        winner_head = marker.get("committed_head") if isinstance(marker, dict) else None
        if (receipt_head["sequence"] > count or not _valid_head(winner_head)
                or winner_head == receipt_head
                or not _marker_matches(current, marker, winner_head)):
            return False
        if receipt_head["sequence"] == 1:
            if linked_prior is not None:
                return False
        else:
            prior_marker_path = _marker_path(
                data_root, current, receipt_head["sequence"] - 1,
            )
            prior_marker = _read_json(prior_marker_path) if prior_marker_path else None
            if (not _valid_head(linked_prior)
                    or not _marker_matches(current, prior_marker, linked_prior)):
                return False
    return accepted == count and pending_seen == allowed_pending


def _candidate_from_head(
    data_root: str,
    identity: dict[str, str],
    series_id: str,
    subject: str,
    head: dict[str, Any],
    expected_prior: dict[str, Any] | None,
) -> dict[str, Any] | None:
    """Build a candidate pointer only from a fully linked immutable receipt."""
    if not _valid_head(head):
        return None
    metadata_path = _safe_path(data_root, head["path"])
    meta = _read_json(metadata_path) if metadata_path is not None else None
    if not isinstance(meta, dict) or any(meta.get(key) != value for key, value in identity.items()):
        return None
    candidate: dict[str, Any] = {
        **meta,
        "committed_count": head["sequence"],
        "committed_head": head,
        "commit_protocol_version": 1,
    }
    receipt_path = _receipt_path(data_root, candidate, head["metadata_sha256"])
    if receipt_path is None:
        return None
    candidate["commit_receipt_path"] = os.path.relpath(
        receipt_path, os.path.realpath(os.path.abspath(data_root)),
    )
    loaded = _load_linked_head(data_root, candidate, head, series_id, subject)
    if loaded is None or loaded[0] != meta or loaded[1] != expected_prior:
        return None
    if _payload_for(data_root, meta) is None:
        return None
    return candidate


def _unclaimed_vintages_valid(
    data_root: str,
    identity: dict[str, str],
    series_id: str,
    subject: str,
    vintage_paths: list[str],
) -> bool:
    """Validate preserved vintage-only crash artifacts without accepting them."""
    if not vintage_paths:
        return False
    root = os.path.realpath(os.path.abspath(data_root))
    for vintage_path in vintage_paths:
        if not re_fullmatch_vintage_name(os.path.basename(vintage_path)):
            return False
        meta = _read_json(vintage_path)
        if meta is None and canonical_json_object_strict_prefix(vintage_path, allow_empty=True):
            continue
        if (not isinstance(meta, dict)
                or any(meta.get(key) != value for key, value in identity.items())
                or not _identity_matches(meta, meta, series_id, subject)
                or _payload_for(data_root, meta) is None):
            return False
        expected_suffix = f"_{meta['content_sha256']}.json"
        if not os.path.basename(vintage_path).endswith(expected_suffix):
            return False
        # The immutable metadata must live directly in the target lane.
        expected_dir = _safe_path(data_root, os.path.join(
            "_connectors", "vintages", identity["dataset_id"], series_id, subject,
        ))
        if expected_dir is None or os.path.dirname(os.path.realpath(vintage_path)) != expected_dir:
            return False
        if os.path.relpath(vintage_path, root).startswith(".." + os.sep):
            return False
    return True


def re_fullmatch_vintage_name(name: str) -> bool:
    """Keep the canonical vintage filename grammar local and dependency-free."""
    return bool(re.fullmatch(r"\d{8}T\d{12}Z_[0-9a-f]{64}\.json", name))


def unclaimed_first_vintages_are_safe(
    data_root: str,
    *,
    connector_id: str,
    dataset_id: str,
    series_id: str,
    subject: str,
    provider: str,
) -> bool:
    """Return whether a missing-current lane contains only vintage-only debris.

    This never makes those records committed or point-in-time visible.  It only
    lets a later first publication proceed after a process died between writing
    its immutable vintage and its receipt.
    """
    identity = {
        "connector_id": connector_id, "dataset_id": dataset_id,
        "series_id": series_id, "subject": subject, "provider": provider,
    }
    pseudo: dict[str, Any] = dict(identity)
    vintage_dir = _safe_path(data_root, os.path.join(
        "_connectors", "vintages", dataset_id, series_id, subject,
    ))
    receipt_dir = _safe_path(data_root, os.path.join(
        "_connectors", "commits", dataset_id, series_id, subject,
    ))
    marker_path = _marker_path(data_root, pseudo, 1)
    marker_dir = os.path.dirname(marker_path) if marker_path is not None else None
    if vintage_dir is None or receipt_dir is None or marker_dir is None:
        return False
    vintages = _regular_lane_files(vintage_dir)
    receipts = _regular_lane_files(receipt_dir)
    markers = _regular_lane_files(marker_dir)
    receipt_prefixes_only = receipts is not None and all(
        re.fullmatch(r"[0-9a-f]{64}\.json", os.path.basename(path)) is not None
        and canonical_json_object_strict_prefix(path, allow_empty=True)
        for path in receipts
    )
    return (vintages is not None and receipt_prefixes_only and markers == []
            and _unclaimed_vintages_valid(data_root, identity, series_id, subject, vintages))


def _recover_unmarked_successor(
    data_root: str,
    identity: dict[str, str],
    series_id: str,
    subject: str,
    *,
    current: dict[str, Any] | None,
    prior_head: dict[str, Any] | None,
    prior_meta: dict[str, Any] | None,
    next_sequence: int,
) -> dict[str, Any] | None:
    """Recover exactly one receipt-sealed successor with no complete marker."""
    pseudo: dict[str, Any] = dict(identity)
    vintage_dir = _safe_path(data_root, os.path.join(
        "_connectors", "vintages", identity["dataset_id"], series_id, subject,
    ))
    receipt_dir = _safe_path(data_root, os.path.join(
        "_connectors", "commits", identity["dataset_id"], series_id, subject,
    ))
    marker_path = _marker_path(data_root, pseudo, next_sequence)
    marker_dir = os.path.dirname(marker_path) if marker_path is not None else None
    if vintage_dir is None or receipt_dir is None or marker_path is None or marker_dir is None:
        return None
    vintages = _regular_lane_files(vintage_dir)
    receipts = _regular_lane_files(receipt_dir)
    markers = _regular_lane_files(marker_dir)
    if vintages is None or receipts is None or markers is None:
        return None

    candidates: list[dict[str, Any]] = []
    for receipt_path in receipts:
        receipt = _read_json(receipt_path)
        head = _head_from_receipt(receipt)
        if (head is None or head["sequence"] != next_sequence
                or receipt.get("prior_head") != prior_head):
            continue
        candidate = _candidate_from_head(
            data_root, identity, series_id, subject, head, prior_head,
        )
        if candidate is not None:
            candidates.append(candidate)
    if len(candidates) != 1:
        return None
    candidate = candidates[0]

    # No complete marker may exist on this path.  A strict prefix is admitted
    # only because the unique receipt fixes every expected byte.
    expected_marker = _marker_bytes(candidate, candidate["committed_head"])
    pending_marker_sequence: int | None = None
    if os.path.lexists(marker_path):
        if os.path.realpath(marker_path) not in {os.path.realpath(path) for path in markers}:
            return None
        try:
            with open(marker_path, "rb") as fh:
                observed = fh.read()
        except OSError:
            return None
        if (len(observed) >= len(expected_marker)
                or not expected_marker.startswith(observed)):
            return None
        pending_marker_sequence = next_sequence

    metadata_hash = candidate["committed_head"]["metadata_sha256"]
    if current is None:
        # Before a first current exists there is no accepted chain to anchor
        # unrelated receipts.  Exactly one receipt is therefore required;
        # extra vintage-only artifacts remain preserved but never accepted.
        if len(receipts) != 1 or any(
            os.path.realpath(path) != os.path.realpath(marker_path) for path in markers
        ):
            return None
        if not _unclaimed_vintages_valid(
            data_root, identity, series_id, subject, vintages,
        ):
            return None
    else:
        history = _vintages_from_current(
            data_root, current, series_id, subject, None,
            allowed_pending_receipts={metadata_hash},
            allowed_pending_marker_sequence=pending_marker_sequence,
        )
        if (len(history) != next_sequence - 1 or not history
                or history[-1].get("vintage_id") != current.get("vintage_id")):
            return None

    if prior_meta is not None:
        try:
            prior_retrieved = _utc(str(prior_meta["retrieved_at"]))
            candidate_retrieved = _utc(str(candidate["retrieved_at"]))
        except (KeyError, TypeError, ValueError):
            return None
        if prior_retrieved is None or candidate_retrieved is None or candidate_retrieved <= prior_retrieved:
            return None
    return candidate


def recover_pending_current(
    data_root: str,
    *,
    connector_id: str,
    dataset_id: str,
    series_id: str,
    subject: str,
    provider: str,
    current: dict[str, Any] | None,
) -> dict[str, Any] | None:
    """Reconstruct exactly one fully sealed successor after a pointer-swap crash.

    The immutable sequence marker is the cross-host commit claim.  A process
    can die after creating it but before replacing ``current``.  Normal reads
    deliberately fail closed at that boundary; this recovery path advances
    only to the single marker that is already linked to the still-present
    current head (or to sequence one when the first pointer was never made).

    Every receipt, metadata hash, identity field, prior-head link, sequence
    marker, and the complete chain is rechecked.  The returned pointer retains
    the original retrieval timestamp, so the ordinary cutoff check still
    prevents a historical decision from seeing a future retrieval.
    """
    identity = {
        "connector_id": connector_id,
        "dataset_id": dataset_id,
        "series_id": series_id,
        "subject": subject,
        "provider": provider,
    }
    if any(not isinstance(value, str) or not value for value in identity.values()):
        return None

    prior_head: dict[str, Any] | None = None
    prior_meta: dict[str, Any] | None = None
    next_sequence = 1
    if current is not None:
        if not isinstance(current, dict) or any(current.get(key) != value for key, value in identity.items()):
            return None
        count = current.get("committed_count")
        head = current.get("committed_head")
        if (current.get("commit_protocol_version") != 1
                or not isinstance(count, int) or isinstance(count, bool) or count < 1
                or not _valid_head(head) or head["sequence"] != count):
            return None
        receipt_path = _receipt_path(data_root, current, head["metadata_sha256"])
        if receipt_path is None or current.get("commit_receipt_path") != os.path.relpath(
            receipt_path, os.path.realpath(os.path.abspath(data_root)),
        ):
            return None
        loaded = _load_linked_head(data_root, current, head, series_id, subject)
        own_marker = _marker_path(data_root, current, count)
        if (loaded is None or own_marker is None or not os.path.lexists(own_marker)
                or not _marker_matches(current, _read_json(own_marker), head)):
            return None
        prior_meta, _older_head = loaded
        if any(current.get(key) != value for key, value in prior_meta.items()):
            return None
        prior_head = head
        next_sequence = count + 1

    marker_identity = {**identity}
    marker_path = _marker_path(data_root, marker_identity, next_sequence)
    following_path = _marker_path(data_root, marker_identity, next_sequence + 1)
    if marker_path is None or following_path is None:
        return None
    if not os.path.lexists(marker_path):
        if not os.path.lexists(following_path):
            return _recover_unmarked_successor(
                data_root, identity, series_id, subject,
                current=current, prior_head=prior_head, prior_meta=prior_meta,
                next_sequence=next_sequence,
            )
        return None
    if os.path.lexists(following_path):
        return None
    marker = _read_json(marker_path)
    head = marker.get("committed_head") if isinstance(marker, dict) else None
    if (not _valid_head(head) or head["sequence"] != next_sequence
            or not _marker_matches(marker_identity, marker, head)):
        return _recover_unmarked_successor(
            data_root, identity, series_id, subject,
            current=current, prior_head=prior_head, prior_meta=prior_meta,
            next_sequence=next_sequence,
        )

    candidate = _candidate_from_head(
        data_root, identity, series_id, subject, head, prior_head,
    )
    if candidate is None:
        return None
    if prior_meta is not None:
        try:
            prior_retrieved = _utc(str(prior_meta["retrieved_at"]))
            candidate_retrieved = _utc(str(candidate["retrieved_at"]))
        except (KeyError, TypeError, ValueError):
            return None
        if prior_retrieved is None or candidate_retrieved is None or candidate_retrieved <= prior_retrieved:
            return None

    # Recovery is rare, so pay the O(history) cost here.  This makes forward
    # repair conditional on the entire immutable chain, not merely its tail.
    history = _vintages_from_current(data_root, candidate, series_id, subject, None)
    if (len(history) != next_sequence or not history
            or history[-1].get("vintage_id") != candidate.get("vintage_id")):
        return None
    return candidate


def _vintages_from_current(
    data_root: str,
    current: dict[str, Any],
    series_id: str,
    subject: str,
    cutoff: datetime | None,
    *,
    allowed_pending_receipts: set[str] | None = None,
    allowed_pending_marker_sequence: int | None = None,
) -> list[dict[str, Any]]:
    """Walk and verify the immutable O(1)-per-retrieval linked commit chain."""
    if (current.get("commit_protocol_version") != 1 or current.get("series_id") != series_id
            or current.get("subject") != subject):
        return []
    count = current.get("committed_count")
    head = current.get("committed_head")
    if (not isinstance(count, int) or isinstance(count, bool) or count < 1 or not _valid_head(head)
            or head["sequence"] != count):
        return []
    receipt_path = _receipt_path(data_root, current, head["metadata_sha256"])
    if receipt_path is None or current.get("commit_receipt_path") != os.path.relpath(
        receipt_path, os.path.realpath(os.path.abspath(data_root)),
    ):
        return []
    newest_to_oldest: list[tuple[datetime, dict[str, Any]]] = []
    heads: dict[int, dict[str, Any]] = {}
    seen_paths: set[str] = set()
    seen_hashes: set[str] = set()
    later_retrieved: datetime | None = None
    cursor: dict[str, Any] | None = head
    while cursor is not None:
        if (cursor["path"] in seen_paths or cursor["metadata_sha256"] in seen_hashes
                or cursor["sequence"] != count - len(newest_to_oldest)):
            return []
        seen_paths.add(cursor["path"]); seen_hashes.add(cursor["metadata_sha256"])
        loaded = _load_linked_head(data_root, current, cursor, series_id, subject)
        if loaded is None:
            return []
        meta, prior = loaded
        try:
            retrieved = _utc(str(meta["retrieved_at"]))
        except (TypeError, ValueError):
            return []
        if retrieved is None or (later_retrieved is not None and retrieved >= later_retrieved):
            return []
        later_retrieved = retrieved
        newest_to_oldest.append((retrieved, meta)); heads[cursor["sequence"]] = cursor
        cursor = prior
    if (len(newest_to_oldest) != count
            or not _head_markers_consistent(
                data_root, current, heads, allowed_pending_marker_sequence,
            )
            or not _sealed_lane_inventory_consistent(
                data_root, current, count, allowed_pending_receipts,
            )):
        return []
    chronological = list(reversed(newest_to_oldest))
    for index, (_retrieved, meta) in enumerate(chronological):
        revision_of = meta.get("revision_of")
        if revision_of is not None and (
            index == 0
            or revision_of != chronological[index - 1][1].get("vintage_id")
            or meta.get("as_of") != chronological[index - 1][1].get("as_of")
        ):
            return []
    latest = newest_to_oldest[0][1]
    if any(current.get(key) != value for key, value in latest.items()):
        return []
    return [meta for retrieved, meta in chronological if cutoff is None or retrieved <= cutoff]


def verified_committed_vintages(
    data_root: str, current: dict[str, Any], series_id: str, subject: str,
) -> list[dict[str, Any]]:
    """Public integrity check used by the publisher before extending history."""
    return _vintages_from_current(data_root, current, series_id, subject, None)


def _payload_for(data_root: str, vintage: dict[str, Any]) -> Any | None:
    rel = vintage.get("blob_path")
    digest = vintage.get("content_sha256")
    if not isinstance(rel, str) or not isinstance(digest, str):
        return None
    path = _safe_path(data_root, rel)
    if path is None or os.path.basename(path) != f"{digest}.json":
        return None
    payload = _read_json(path, expected_sha256=digest)
    if payload is None:
        return None
    if not isinstance(payload, dict) or payload.get("as_of") != vintage.get("as_of"):
        return None
    if isinstance(vintage.get("series"), str) and payload.get("series") != vintage["series"]:
        return None
    return payload


def _eligible_through(vintage: dict[str, Any]) -> datetime | None:
    """Last usable instant from the release contract frozen into this vintage."""
    release = vintage.get("release")
    if not isinstance(release, dict):
        return None
    try:
        observed = datetime.strptime(str(vintage["as_of"]), "%Y-%m-%d").date()
        retrieved = _utc(str(vintage["retrieved_at"]))
        if retrieved is None:
            return datetime.min.replace(tzinfo=timezone.utc)
        _due, grace_end = release_contract_window(release, observed, retrieved)
        return grace_end.astimezone(timezone.utc)
    except (KeyError, TypeError, ValueError):
        return datetime.min.replace(tzinfo=timezone.utc)


def _eligible_at(vintage: dict[str, Any], cutoff: datetime | None) -> bool:
    if cutoff is None:
        cutoff = datetime.now(timezone.utc)
    through = _eligible_through(vintage)
    return through is not None and cutoff <= through


def vintage_is_eligible_at(vintage: dict[str, Any], cutoff: str | datetime) -> bool:
    """Return whether one frozen vintage is knowable and usable at ``cutoff``.

    Live consumers pass an explicit decision instant so eligibility cannot
    change midway through one read.  The release clock comes only from the
    immutable vintage; today's manifest never rewrites its deadline.
    """
    cutoff_dt = _utc(cutoff)
    if cutoff_dt is None:
        raise ValueError("vintage eligibility requires an explicit cutoff")
    try:
        retrieved = _utc(str(vintage["retrieved_at"]))
    except (KeyError, TypeError, ValueError):
        return False
    return retrieved is not None and retrieved <= cutoff_dt and _eligible_at(vintage, cutoff_dt)


def select_provider(manifests: list[dict[str, Any]], series_id: str, subject: str) -> list[dict[str, Any]]:
    """Return primary then explicit fallbacks; never infer priority from directory order."""
    members = [m for m in manifests if m.get("series_id") == series_id and subject in m.get("subjects", [])]
    primaries = [m for m in members if not m.get("fallback_for")]
    if len(primaries) != 1:
        return []
    primary = primaries[0]
    fallbacks = sorted(
        (m for m in members if m.get("fallback_for") == primary["id"]),
        key=lambda m: (m.get("provider_priority", 100), m["id"]),
    )
    return [primary, *fallbacks]


def _current_pointers(data_root: str, series_id: str, subject: str) -> list[dict[str, Any]]:
    """Discover only the requested persisted provider lanes.

    Present-day manifests do not rewrite past priority. A corrupt current in an
    unrelated semantic series or subject must quarantine that lane, not turn a
    valid target replay into a global outage.
    """
    root = os.path.realpath(os.path.abspath(data_root))
    base = _safe_path(data_root, os.path.join("_connectors", "current"))
    if base is None:
        return []
    found: list[dict[str, Any]] = []
    try:
        dataset_names = os.listdir(base)
    except OSError:
        return []
    subject_name = f"{subject}.json"
    for dataset_name in dataset_names:
        dataset_dir = os.path.join(base, dataset_name)
        try:
            dataset_info = os.lstat(dataset_dir)
            if stat.S_ISLNK(dataset_info.st_mode) or not stat.S_ISDIR(dataset_info.st_mode):
                continue
            series_names = os.listdir(dataset_dir)
        except OSError:
            continue
        # A case alias or duplicate for the requested series poisons this one
        # provider dataset only. Other provider datasets remain eligible.
        series_matches = [name for name in series_names if name.casefold() == series_id.casefold()]
        if series_matches != [series_id]:
            continue
        series_dir = os.path.join(dataset_dir, series_id)
        try:
            series_info = os.lstat(series_dir)
            if stat.S_ISLNK(series_info.st_mode) or not stat.S_ISDIR(series_info.st_mode):
                continue
            subject_names = os.listdir(series_dir)
        except OSError:
            continue
        subject_matches = [name for name in subject_names if name.casefold() == subject_name.casefold()]
        if subject_matches != [subject_name]:
            continue
        candidate = os.path.join(series_dir, subject_name)
        pointer_path = _safe_path(data_root, os.path.relpath(candidate, root))
        if pointer_path is None:
            continue
        try:
            info = os.lstat(pointer_path)
        except OSError:
            continue
        if stat.S_ISLNK(info.st_mode) or not stat.S_ISREG(info.st_mode) or info.st_nlink != 1:
            continue
        current = _read_json(pointer_path)
        if (not isinstance(current, dict)
                or current.get("dataset_id") != dataset_name
                or current.get("series_id") != series_id
                or current.get("subject") != subject):
            continue
        found.append(current)
    # One semantic series can legitimately have a primary and one or more
    # explicit fallback providers in distinct canonical dataset lanes.
    return found


_PROVENANCE_KEYS = {
    "source_url", "source_urls", "provider", "retrieved_at", "received", "published_at",
    "acquired_via", "connector_id", "connector_fingerprint", "connector_commit",
}


def _normalised_payload(value: Any, *, top_level: bool = True) -> Any:
    if isinstance(value, dict):
        return {
            key: _normalised_payload(child, top_level=False)
            for key, child in sorted(value.items())
            if not (top_level and key in _PROVENANCE_KEYS)
        }
    if isinstance(value, list):
        return [_normalised_payload(child, top_level=False) for child in value]
    return value


def read_point_in_time(
    data_root: str,
    series_id: str,
    subject: str,
    cutoff: str | datetime | None = None,
    *,
    connectors_root: str | None = None,
    manifests: list[dict[str, Any]] | None = None,
) -> dict[str, Any] | None:
    """Return one complete eligible provider vintage, or ``None``.

    The cutoff is retrieval time (what the engine could have known), not file
    mtime or the observation's as-of date.
    """
    cutoff_dt = _utc(cutoff)
    # Load manifests for discovery/validation compatibility, but provider
    # role and priority come exclusively from immutable vintage metadata.
    # Changing today's manifest must not rewrite what a historical replay
    # would have selected.
    if manifests is None:
        root = connectors_root or os.path.join(REPO, ".claude", "connectors")
        manifests, _ = load_valid_manifests(root)
    del manifests

    providers: list[tuple[dict[str, Any], Any]] = []
    for current in _current_pointers(data_root, series_id, subject):
        eligible = _vintages_from_current(data_root, current, series_id, subject, cutoff_dt)
        if not eligible:
            continue
        # The newest retrieval known at the cutoff is the provider's complete
        # state at that decision time.  If it is expired or corrupt, the
        # provider fails; silently walking backward would resurrect superseded
        # evidence and can manufacture freshness.  An explicitly declared
        # fallback remains eligible as a separate whole-provider history.
        vintage = eligible[-1]
        if not _eligible_at(vintage, cutoff_dt):
            continue
        payload = _payload_for(data_root, vintage)
        if payload is not None:
            providers.append((vintage, payload))
    if not providers:
        return None

    primaries = [item for item in providers if item[0].get("fallback_for") is None]
    if len(primaries) > 1:
        return {
            "payload": None, "vintage": None, "usable": False, "health": "suspect",
            "disagreement": {
                "kind": "provider_configuration",
                "message": "historical cutoff has more than one primary provider",
                "providers": [v[0].get("provider") for v in primaries],
            },
        }
    if primaries:
        selected = primaries[0]
        parent_id = selected[0]["connector_id"]
        peers = [item for item in providers if item is not selected and item[0].get("fallback_for") == parent_id]
    else:
        parent_ids = {item[0].get("fallback_for") for item in providers if item[0].get("fallback_for")}
        if len(parent_ids) != 1:
            return None
        peers = []
        best_priority = min(item[0]["provider_priority"] for item in providers)
        best = [item for item in providers if item[0]["provider_priority"] == best_priority]
        if len(best) != 1:
            return {
                "payload": None, "vintage": None, "usable": False, "health": "suspect",
                "disagreement": {
                    "kind": "provider_configuration",
                    "message": "historical cutoff has ambiguous fallback provider priorities",
                    "providers": [item[0].get("provider") for item in best],
                },
            }
        selected = best[0]
        peers = [item for item in providers if item is not selected and item[0].get("fallback_for") == selected[0].get("fallback_for")]

    selected_vintage, selected_payload = selected
    same_release = [item for item in peers if item[0].get("as_of") == selected_vintage.get("as_of")]
    selected_normalised = canonical_json_bytes(_normalised_payload(selected_payload))
    conflicts = [item for item in same_release
                 if canonical_json_bytes(_normalised_payload(item[1])) != selected_normalised]
    base = {
        "payload": selected_payload,
        "vintage": selected_vintage,
        "vintage_id": selected_vintage["vintage_id"],
        "selected_connector_id": selected_vintage["connector_id"],
        "selected_provider": selected_vintage["provider"],
        "selected_provider_priority": selected_vintage["provider_priority"],
        "fallback_used": selected_vintage.get("fallback_for") is not None,
    }
    if conflicts:
        participants = [selected, *conflicts]
        return {
            **base, "usable": False, "health": "suspect",
            "disagreement": {
                "kind": "provider_disagreement", "as_of": selected_vintage["as_of"],
                "message": "eligible providers disagree on the same normalized release; do not use for conviction",
                "providers": [
                    {
                        "connector_id": vintage["connector_id"], "provider": vintage["provider"],
                        "provider_priority": vintage["provider_priority"],
                        "content_sha256": vintage["content_sha256"],
                    }
                    for vintage, _payload in participants
                ],
            },
        }
    return {**base, "usable": True, "health": "current", "disagreement": None}


def resolve_vintage_id(
    data_root: str, series_id: str, subject: str, vintage_id: str,
) -> dict[str, Any] | None:
    """Fully audit committed history and resolve exactly one stable vintage id."""
    if (not isinstance(vintage_id, str) or len(vintage_id) != 71
            or not vintage_id.startswith("sha256:")
            or any(c not in "0123456789abcdef" for c in vintage_id[7:])):
        return None
    matches: list[tuple[dict[str, Any], Any]] = []
    for current in _current_pointers(data_root, series_id, subject):
        # Resolution is a historical operation, so it deliberately performs
        # the full linked-chain and marker audit rather than trusting current.
        for vintage in _vintages_from_current(data_root, current, series_id, subject, None):
            if vintage.get("vintage_id") != vintage_id:
                continue
            payload = _payload_for(data_root, vintage)
            if payload is None:
                return None
            matches.append((vintage, payload))
    if len(matches) != 1:
        return None
    vintage, payload = matches[0]
    return {
        "payload": payload, "vintage": vintage, "vintage_id": vintage_id,
        "selected_connector_id": vintage["connector_id"],
        "selected_provider": vintage["provider"],
        "selected_provider_priority": vintage["provider_priority"],
        "fallback_used": vintage.get("fallback_for") is not None,
        "usable": True, "health": "current", "disagreement": None,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Read one connector series at a retrieval-time cutoff.")
    ap.add_argument("--data-root", default=os.path.join(REPO, "data"))
    ap.add_argument("--connectors-root", default=os.path.join(REPO, ".claude", "connectors"))
    ap.add_argument("--series-id", required=True)
    ap.add_argument("--subject", required=True)
    ap.add_argument("--cutoff", help="ISO timestamp or YYYY-MM-DD; omit for the newest retrievable vintage")
    ap.add_argument("--vintage-id", help="resolve one immutable sha256:<id> after a full history audit")
    args = ap.parse_args()
    if args.vintage_id and args.cutoff:
        ap.error("--vintage-id and --cutoff are mutually exclusive")
    result = (resolve_vintage_id(args.data_root, args.series_id, args.subject, args.vintage_id)
              if args.vintage_id else read_point_in_time(
                  args.data_root, args.series_id, args.subject, args.cutoff,
                  connectors_root=args.connectors_root,
              ))
    if result is None:
        return 1
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if result.get("usable") is not False else 2


if __name__ == "__main__":
    raise SystemExit(main())
