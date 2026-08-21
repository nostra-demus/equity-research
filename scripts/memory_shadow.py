#!/usr/bin/env python3
"""Vendor-neutral, read-only Phase 4 shadow adapter over Phase 3 retrieval.

The query is untrusted and may only narrow a trusted ``AccessScope`` supplied by the
server or CLI launcher.  The caller-anchored projection digest and policy evaluation
time are likewise out of band.  This module has no canonical append, rating, or
calibration mutation path.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import stat
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Mapping

from canonical_json import canonical_json, canonical_json_bytes, canonical_sha256
from memory_contract import parse_aware_datetime
from memory_retrieval import (
    AccessScope,
    ContextPacketResult,
    EmbeddingModel,
    ExactEvidenceVerifier,
    QuerySpec,
    RetrievalError,
    compile_context_packet,
    verify_context_packet,
)


REQUEST_SCHEMA = "memory-shadow-request/v1"
RESPONSE_SCHEMA = "memory-shadow-response/v1"
SCOPE_SCHEMA = "memory-shadow-access-scope/v1"
FEEDBACK_SCHEMA = "memory-shadow-feedback/v1"
RECALL_EVENT_TYPES = (
    "correction.recorded",
    "decision.recorded",
    "outcome.reviewed",
)
MAX_JSON_BYTES = 2_000_000
RECALL_RECORD_TYPES = ("legacy-adapter",)
FEEDBACK_NAMESPACE = uuid.UUID("aa234e56-8a5b-599e-a042-86285542d070")

_BARE_SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
_HASH_REF_RE = re.compile(r"^sha256:[0-9a-f]{64}$")
_EVENT_ID_RE = re.compile(
    r"^evt_[0-9a-f]{8}-[0-9a-f]{4}-[57][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)
_PACKET_ID_RE = re.compile(
    r"^context-packet_[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)
_FEEDBACK_ID_RE = re.compile(
    r"^shadow-feedback_[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
)
_NAME_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$")

_SCOPE_FIELDS = frozenset(
    {
        "schema",
        "scope_id",
        "policy_version",
        "classifications",
        "source_tiers",
        "embedding_classifications",
        "entitlement_ids",
    }
)
_RESPONSE_FIELDS = frozenset(
    {
        "schema",
        "mode",
        "read_only",
        "rating_effect",
        "canonical_write",
        "context_packet_id",
        "packet_sha256",
        "packet_byte_length",
        "manifest_sha256",
        "projection_digest",
        "packet_json",
        "manifest_json",
        "event_ids",
        "evidence_ids",
        "response_sha256",
    }
)
_FEEDBACK_CONTENT_FIELDS = frozenset(
    {
        "context_packet_id",
        "packet_sha256",
        "query_sha256",
        "client_id",
        "observed_at",
        "items",
        "status",
        "canonical_write",
        "rating_effect",
    }
)
_FEEDBACK_ITEM_FIELDS = frozenset({"category", "event_id", "evidence_id", "note"})
_FEEDBACK_CATEGORIES = frozenset({"useful", "missing", "stale", "contradictory"})


class ShadowError(ValueError):
    """A shadow request or artifact failed its closed contract."""


def _reject_constant(value: str) -> None:
    raise ShadowError(f"non-JSON numeric constant {value!r} is not allowed")


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ShadowError(f"duplicate JSON object key {key!r}")
        result[key] = value
    return result


def parse_closed_json(raw: str | bytes) -> Any:
    """Parse strict JSON while rejecting duplicate keys and non-finite constants."""
    try:
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8")
        value = json.loads(raw, object_pairs_hook=_pairs, parse_constant=_reject_constant)
        # json.loads accepts overflow floats, unsafe integers, and escaped lone
        # surrogates that the repository's cross-runtime canonical JSON contract
        # cannot serialize. Reject them at the parser boundary, before any response.
        canonical_json_bytes(value)
        return value
    except (
        UnicodeDecodeError,
        UnicodeError,
        json.JSONDecodeError,
        RecursionError,
        TypeError,
        ValueError,
    ) as exc:
        raise ShadowError("input is not strict UTF-8 JSON") from exc


def load_closed_json(path: str | Path) -> Any:
    source = Path(path)
    try:
        before = source.lstat()
        if source.is_symlink() or not source.is_file():
            raise ShadowError(f"{source} must be a regular non-symlink file")
        if before.st_size > MAX_JSON_BYTES:
            raise ShadowError(f"{source} exceeds the {MAX_JSON_BYTES}-byte JSON input limit")
        raw = source.read_bytes()
        after = source.lstat()
    except OSError as exc:
        raise ShadowError(f"could not read {source}") from exc
    if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (
        after.st_dev,
        after.st_ino,
        after.st_size,
        after.st_mtime_ns,
    ):
        raise ShadowError(f"{source} changed while it was read")
    if len(raw) > MAX_JSON_BYTES:
        raise ShadowError(f"{source} exceeds the {MAX_JSON_BYTES}-byte JSON input limit")
    return parse_closed_json(raw)


def _scope_stat_identity(value: os.stat_result) -> tuple[int, ...]:
    """Return every path/authority attribute that must stay fixed while scope is read."""
    return (
        value.st_dev,
        value.st_ino,
        value.st_mode,
        value.st_nlink,
        value.st_uid,
        value.st_gid,
        value.st_size,
        value.st_mtime_ns,
        value.st_ctime_ns,
    )


def _validate_scope_stat(source: Path, value: os.stat_result) -> None:
    if not stat.S_ISREG(value.st_mode):
        raise ShadowError(f"trusted shadow scope {source} must be a regular file")
    if value.st_nlink != 1:
        raise ShadowError(f"trusted shadow scope {source} must have exactly one hard link")
    if value.st_uid != os.geteuid():
        raise ShadowError(f"trusted shadow scope {source} must be owned by the launcher user")
    if stat.S_IMODE(value.st_mode) & 0o077:
        raise ShadowError(f"trusted shadow scope {source} must not grant group or other permissions")
    if value.st_size > MAX_JSON_BYTES:
        raise ShadowError(
            f"trusted shadow scope {source} exceeds the {MAX_JSON_BYTES}-byte JSON input limit"
        )


def _read_all(descriptor: int) -> bytes:
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = os.read(descriptor, min(64 * 1024, MAX_JSON_BYTES + 1 - total))
        if not chunk:
            return b"".join(chunks)
        total += len(chunk)
        if total > MAX_JSON_BYTES:
            raise ShadowError(f"JSON input exceeds the {MAX_JSON_BYTES}-byte limit")
        chunks.append(chunk)


def load_trusted_scope_json(path: str | Path) -> Any:
    """Read launcher authority from one stable, owner-only, non-linked POSIX file."""
    source = Path(path)
    descriptor: int | None = None
    try:
        path_before = source.lstat()
        if stat.S_ISLNK(path_before.st_mode):
            raise ShadowError(f"trusted shadow scope {source} must not be a symlink")
        _validate_scope_stat(source, path_before)
        flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
        descriptor = os.open(str(source), flags)
        descriptor_before = os.fstat(descriptor)
        _validate_scope_stat(source, descriptor_before)
        if _scope_stat_identity(path_before) != _scope_stat_identity(descriptor_before):
            raise ShadowError(f"trusted shadow scope {source} changed before it was read")
        raw = _read_all(descriptor)
        descriptor_after = os.fstat(descriptor)
        path_after = source.lstat()
        if stat.S_ISLNK(path_after.st_mode):
            raise ShadowError(f"trusted shadow scope {source} must not become a symlink")
        _validate_scope_stat(source, descriptor_after)
        _validate_scope_stat(source, path_after)
    except ShadowError:
        raise
    except OSError as exc:
        raise ShadowError(f"could not securely read trusted shadow scope {source}") from exc
    finally:
        if descriptor is not None:
            os.close(descriptor)
    identity = _scope_stat_identity(path_before)
    if identity != _scope_stat_identity(descriptor_after) or identity != _scope_stat_identity(path_after):
        raise ShadowError(f"trusted shadow scope {source} changed while it was read")
    return parse_closed_json(raw)


def _aware_utc(value: Any, *, field: str) -> str:
    if not isinstance(value, str):
        raise ShadowError(f"{field} must be an aware ISO-8601 date-time")
    try:
        parsed = parse_aware_datetime(value).astimezone(dt.timezone.utc)
    except ValueError as exc:
        raise ShadowError(f"{field} must be an aware ISO-8601 date-time") from exc
    return parsed.isoformat().replace("+00:00", "Z")


def access_scope_from_dict(value: Any) -> AccessScope:
    """Build the trusted scope from a closed launcher-owned configuration document."""
    if not isinstance(value, Mapping) or set(value) != _SCOPE_FIELDS:
        raise ShadowError("shadow access scope must contain exactly the v1 fields")
    if value.get("schema") != SCOPE_SCHEMA:
        raise ShadowError("shadow access scope schema is unsupported")
    sequence_fields = ("classifications", "source_tiers", "embedding_classifications", "entitlement_ids")
    if any(not isinstance(value.get(name), list) for name in sequence_fields):
        raise ShadowError("shadow access scope array fields must be arrays")
    entitlements = value["entitlement_ids"]
    if (
        len(entitlements) > 10_000
        or len(set(item for item in entitlements if isinstance(item, str))) != len(entitlements)
        or any(not isinstance(item, str) or not item or len(item) > 512 for item in entitlements)
    ):
        raise ShadowError("shadow entitlement_ids must be a unique bounded string array")
    try:
        return AccessScope(
            scope_id=value.get("scope_id"),
            policy_version=value.get("policy_version"),
            classifications=tuple(sorted(value["classifications"])),
            source_tiers=tuple(sorted(value["source_tiers"])),
            embedding_classifications=tuple(sorted(value["embedding_classifications"])),
            entitlement_ids=frozenset(value["entitlement_ids"]),
        )
    except (RetrievalError, TypeError) as exc:
        raise ShadowError(f"invalid trusted shadow access scope: {exc}") from exc


@dataclass(frozen=True)
class ShadowRequest:
    query: QuerySpec

    @classmethod
    def from_dict(cls, value: Any) -> "ShadowRequest":
        if not isinstance(value, Mapping) or set(value) != {"schema", "query"}:
            raise ShadowError("shadow request must contain exactly schema and query")
        if value.get("schema") != REQUEST_SCHEMA:
            raise ShadowError("shadow request schema is unsupported")
        try:
            query = QuerySpec.from_dict(value.get("query"))
        except RetrievalError as exc:
            raise ShadowError(f"invalid shadow query: {exc}") from exc
        if query.event_types != RECALL_EVENT_TYPES:
            raise ShadowError(
                "shadow recall event_types must be correction.recorded, decision.recorded, and outcome.reviewed"
            )
        if query.record_types != RECALL_RECORD_TYPES:
            raise ShadowError("shadow recall record_types must be exactly legacy-adapter")
        if any((query.reporting_basis, query.currency, query.metric, query.segment)):
            raise ShadowError("shadow recall does not accept claim-only basis, currency, metric, or segment filters")
        return cls(query=query)

    def to_dict(self) -> dict[str, Any]:
        return {"schema": REQUEST_SCHEMA, "query": self.query.to_dict()}


def _response_hash(response: Mapping[str, Any]) -> str:
    unsigned = dict(response)
    unsigned.pop("response_sha256", None)
    return "sha256:" + canonical_sha256(unsigned)


def _build_response(result: ContextPacketResult) -> dict[str, Any]:
    verify_context_packet(result.packet, result.manifest)
    packet_json = canonical_json(result.packet)
    manifest_json = canonical_json(result.manifest)
    lineage = result.manifest["lineage"]
    response: dict[str, Any] = {
        "schema": RESPONSE_SCHEMA,
        "mode": "shadow",
        "read_only": True,
        "rating_effect": "none",
        "canonical_write": "none",
        "context_packet_id": result.packet["context_packet_id"],
        "packet_sha256": result.packet_sha256,
        "packet_byte_length": len(packet_json.encode("utf-8")),
        "manifest_sha256": result.manifest["manifest_sha256"],
        "projection_digest": result.manifest["projection_digest"],
        "packet_json": packet_json,
        "manifest_json": manifest_json,
        "event_ids": list(lineage["event_ids"]),
        "evidence_ids": list(lineage["evidence_refs"]),
    }
    response["response_sha256"] = _response_hash(response)
    verify_shadow_response(response)
    return response


def verify_shadow_response(value: Any) -> None:
    if not isinstance(value, Mapping) or set(value) != _RESPONSE_FIELDS:
        raise ShadowError("shadow response is not a closed memory-shadow-response/v1 object")
    if (
        value.get("schema") != RESPONSE_SCHEMA
        or value.get("mode") != "shadow"
        or value.get("read_only") is not True
        or value.get("rating_effect") != "none"
        or value.get("canonical_write") != "none"
    ):
        raise ShadowError("shadow response widened its read-only/no-rating contract")
    if value.get("response_sha256") != _response_hash(value):
        raise ShadowError("shadow response digest is invalid")
    packet_text = value.get("packet_json")
    manifest_text = value.get("manifest_json")
    if not isinstance(packet_text, str) or not isinstance(manifest_text, str):
        raise ShadowError("shadow response packet/manifest encodings must be JSON strings")
    packet = parse_closed_json(packet_text)
    manifest = parse_closed_json(manifest_text)
    if canonical_json(packet) != packet_text or canonical_json(manifest) != manifest_text:
        raise ShadowError("shadow response packet/manifest bytes are not canonical JSON")
    try:
        verify_context_packet(packet, manifest)
    except RetrievalError as exc:
        raise ShadowError(f"shadow response contains an invalid context packet: {exc}") from exc
    packet_bytes = packet_text.encode("utf-8")
    packet_sha = "sha256:" + hashlib.sha256(packet_bytes).hexdigest()
    if value.get("packet_sha256") != packet_sha or value.get("packet_byte_length") != len(packet_bytes):
        raise ShadowError("shadow response does not bind the exact packet bytes")
    if (
        value.get("context_packet_id") != packet.get("context_packet_id")
        or value.get("manifest_sha256") != manifest.get("manifest_sha256")
        or value.get("projection_digest") != manifest.get("projection_digest")
    ):
        raise ShadowError("shadow response metadata does not match its packet manifest")
    lineage = manifest.get("lineage")
    if not isinstance(lineage, Mapping):
        raise ShadowError("shadow response manifest lineage is invalid")
    if value.get("event_ids") != lineage.get("event_ids") or value.get("evidence_ids") != lineage.get("evidence_refs"):
        raise ShadowError("shadow response parity IDs do not match packet lineage")
    if not isinstance(value.get("event_ids"), list) or any(
        not isinstance(item, str) or _EVENT_ID_RE.fullmatch(item) is None
        for item in value["event_ids"]
    ):
        raise ShadowError("shadow response event IDs are invalid")
    if not isinstance(value.get("evidence_ids"), list) or any(
        not isinstance(item, str) or not item or len(item) > 2048
        for item in value["evidence_ids"]
    ):
        raise ShadowError("shadow response evidence IDs are invalid")
    ShadowRequest.from_dict({"schema": REQUEST_SCHEMA, "query": packet["content"]["query"]})


def compile_shadow_context(
    database_path: str | Path,
    *,
    expected_projection_digest: str,
    request: ShadowRequest | Mapping[str, Any],
    access_scope: AccessScope,
    evidence_verifier: ExactEvidenceVerifier | object | None,
    evaluated_at: str,
    embedder: EmbeddingModel | None = None,
    compiler: Callable[..., ContextPacketResult] = compile_context_packet,
) -> dict[str, Any]:
    """Compile one read-only shadow response from the caller-anchored Phase 3 API."""
    if not isinstance(request, ShadowRequest):
        request = ShadowRequest.from_dict(request)
    if not isinstance(access_scope, AccessScope):
        raise ShadowError("access_scope must be a trusted out-of-band AccessScope")
    if not isinstance(expected_projection_digest, str) or _BARE_SHA256_RE.fullmatch(expected_projection_digest) is None:
        raise ShadowError("expected projection digest must be 64 lowercase hexadecimal characters")
    evaluated_at = _aware_utc(evaluated_at, field="evaluated_at")
    if parse_aware_datetime(evaluated_at) < parse_aware_datetime(request.query.as_of_system_time):
        raise ShadowError(
            "evaluated_at cannot precede the query as_of_system_time; current policy "
            "must be evaluated at or after the requested knowledge cutoff"
        )
    try:
        result = compiler(
            database_path,
            expected_projection_digest=expected_projection_digest,
            query=request.query,
            access_scope=access_scope,
            evidence_verifier=evidence_verifier,
            evaluated_at=evaluated_at,
            embedder=embedder,
        )
    except RetrievalError as exc:
        raise ShadowError(f"shadow context compilation failed: {exc}") from exc
    if not isinstance(result, ContextPacketResult):
        raise ShadowError("shadow context compiler returned an unsupported result")
    return _build_response(result)


def build_legacy_evidence_verifier(
    repo_root: str | Path,
    *,
    access_scope: AccessScope,
    evaluated_at: str,
) -> object:
    """Construct the Phase 2 legacy resolver under the same trusted shadow scope."""
    from memory_resolver import CompositeMemoryResolver

    evaluated = parse_aware_datetime(_aware_utc(evaluated_at, field="evaluated_at"))

    def authorize(request: object) -> bool:
        policy = getattr(request, "policy", None)
        classification = getattr(policy, "classification", None)
        return classification in access_scope.classifications

    return CompositeMemoryResolver(
        repo_root,
        authorize_legacy=authorize,
        clock=lambda: evaluated,
    )


def _feedback_content(value: Any) -> dict[str, Any]:
    if not isinstance(value, Mapping) or set(value) != _FEEDBACK_CONTENT_FIELDS:
        raise ShadowError("shadow feedback content must contain exactly the v1 fields")
    if not isinstance(value.get("context_packet_id"), str) or _PACKET_ID_RE.fullmatch(value["context_packet_id"]) is None:
        raise ShadowError("shadow feedback context_packet_id is invalid")
    if not isinstance(value.get("packet_sha256"), str) or _HASH_REF_RE.fullmatch(value["packet_sha256"]) is None:
        raise ShadowError("shadow feedback packet_sha256 is invalid")
    if not isinstance(value.get("query_sha256"), str) or _HASH_REF_RE.fullmatch(value["query_sha256"]) is None:
        raise ShadowError("shadow feedback query_sha256 is invalid")
    if not isinstance(value.get("client_id"), str) or _NAME_RE.fullmatch(value["client_id"]) is None:
        raise ShadowError("shadow feedback client_id is invalid")
    observed_at = _aware_utc(value.get("observed_at"), field="observed_at")
    if (
        value.get("status") != "inert-shadow-only"
        or value.get("canonical_write") != "none"
        or value.get("rating_effect") != "none"
    ):
        raise ShadowError("shadow feedback must remain inert, non-canonical, and rating-neutral")
    items = value.get("items")
    if not isinstance(items, list) or not 1 <= len(items) <= 128:
        raise ShadowError("shadow feedback items must contain 1 to 128 entries")
    normalized_items: list[dict[str, Any]] = []
    for item in items:
        if not isinstance(item, Mapping) or set(item) != _FEEDBACK_ITEM_FIELDS:
            raise ShadowError("each shadow feedback item must contain exactly the v1 fields")
        if item.get("category") not in _FEEDBACK_CATEGORIES:
            raise ShadowError("shadow feedback category is unsupported")
        event_id = item.get("event_id")
        if event_id is not None and (
            not isinstance(event_id, str) or _EVENT_ID_RE.fullmatch(event_id) is None
        ):
            raise ShadowError("shadow feedback event_id is invalid")
        evidence_id = item.get("evidence_id")
        if evidence_id is not None and (
            not isinstance(evidence_id, str) or not evidence_id or len(evidence_id) > 2048
        ):
            raise ShadowError("shadow feedback evidence_id is invalid")
        note = item.get("note")
        if not isinstance(note, str) or not note or len(note) > 2000:
            raise ShadowError("shadow feedback note must be a bounded nonempty string")
        normalized_items.append(
            {
                "category": item["category"],
                "event_id": event_id,
                "evidence_id": evidence_id,
                "note": note,
            }
        )
    return {
        "context_packet_id": value["context_packet_id"],
        "packet_sha256": value["packet_sha256"],
        "query_sha256": value["query_sha256"],
        "client_id": value["client_id"],
        "observed_at": observed_at,
        "items": normalized_items,
        "status": "inert-shadow-only",
        "canonical_write": "none",
        "rating_effect": "none",
    }


def seal_shadow_feedback(content: Any) -> dict[str, Any]:
    normalized = _feedback_content(content)
    digest = canonical_sha256(normalized)
    artifact = {
        "schema": FEEDBACK_SCHEMA,
        "feedback_id": "shadow-feedback_" + str(uuid.uuid5(FEEDBACK_NAMESPACE, digest)),
        "content_sha256": "sha256:" + digest,
        "content": normalized,
    }
    verify_shadow_feedback(artifact)
    return artifact


def verify_shadow_feedback(value: Any) -> None:
    if not isinstance(value, Mapping) or set(value) != {"schema", "feedback_id", "content_sha256", "content"}:
        raise ShadowError("shadow feedback artifact is not closed")
    if value.get("schema") != FEEDBACK_SCHEMA:
        raise ShadowError("shadow feedback schema is unsupported")
    content = _feedback_content(value.get("content"))
    if value.get("content") != content:
        raise ShadowError("shadow feedback content is not in canonical normalized form")
    digest = canonical_sha256(content)
    expected_id = "shadow-feedback_" + str(uuid.uuid5(FEEDBACK_NAMESPACE, digest))
    if value.get("content_sha256") != "sha256:" + digest or value.get("feedback_id") != expected_id:
        raise ShadowError("shadow feedback identity or digest is invalid")
    if _FEEDBACK_ID_RE.fullmatch(expected_id) is None:
        raise ShadowError("shadow feedback deterministic ID is malformed")


def write_new_artifact(path: str | Path, raw: bytes) -> None:
    """Create one explicit shadow output without overwriting an existing artifact."""
    target = Path(path)
    if not target.parent.is_dir() or target.parent.is_symlink():
        raise ShadowError("shadow output parent must be an existing non-symlink directory")
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(str(target), flags, 0o600)
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(raw)
            stream.flush()
            os.fsync(stream.fileno())
    except FileExistsError as exc:
        raise ShadowError(f"shadow output already exists: {target}") from exc
    except OSError as exc:
        raise ShadowError(f"could not create shadow output: {target}") from exc


def _context_command(args: argparse.Namespace) -> int:
    scope = access_scope_from_dict(load_trusted_scope_json(args.scope))
    request = ShadowRequest.from_dict(load_closed_json(args.request))
    verifier = build_legacy_evidence_verifier(
        args.repo_root,
        access_scope=scope,
        evaluated_at=args.evaluated_at,
    )
    response = compile_shadow_context(
        args.database,
        expected_projection_digest=args.expected_projection_digest,
        request=request,
        access_scope=scope,
        evidence_verifier=verifier,
        evaluated_at=args.evaluated_at,
    )
    if args.packet_out:
        write_new_artifact(args.packet_out, response["packet_json"].encode("utf-8"))
    if args.manifest_out:
        write_new_artifact(args.manifest_out, response["manifest_json"].encode("utf-8"))
    if args.response_out:
        write_new_artifact(args.response_out, canonical_json_bytes(response))
    sys.stdout.write(canonical_json(response) + "\n")
    return 0


def _feedback_command(args: argparse.Namespace) -> int:
    artifact = seal_shadow_feedback(load_closed_json(args.input))
    if args.output:
        write_new_artifact(args.output, canonical_json_bytes(artifact))
    sys.stdout.write(canonical_json(artifact) + "\n")
    return 0


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Compile read-only permanent-memory shadow context")
    subparsers = parser.add_subparsers(dest="command", required=True)

    context = subparsers.add_parser("context", help="compile one rating-neutral shadow packet")
    context.add_argument("--database", required=True)
    context.add_argument("--expected-projection-digest", required=True)
    context.add_argument("--request", required=True)
    context.add_argument("--scope", required=True, help="trusted launcher-owned access-scope JSON")
    context.add_argument("--evaluated-at", required=True)
    context.add_argument("--repo-root", required=True)
    context.add_argument("--packet-out")
    context.add_argument("--manifest-out")
    context.add_argument("--response-out")
    context.set_defaults(handler=_context_command)

    feedback = subparsers.add_parser("feedback", help="seal an inert shadow-only feedback artifact")
    feedback.add_argument("--input", required=True, help="closed feedback content JSON")
    feedback.add_argument("--output", help="create-only inert artifact path")
    feedback.set_defaults(handler=_feedback_command)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = _parser().parse_args(argv)
    try:
        return int(args.handler(args))
    except (ShadowError, OSError) as exc:
        sys.stderr.write(f"memory shadow error: {exc}\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
